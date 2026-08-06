-- =============================================================
--  Florescer — 2/3: views, funções e triggers
--
--  O motor de ciclo do app (assets/js/cycle.js) é reproduzido aqui em SQL
--  para que qualquer cliente (web, iOS, Android) veja os mesmos números:
--   · fase lútea fixa, ajustável por usuária (padrão 14 dias)
--   · janela fértil = ovulação −5 até ovulação +1
--   · média dos últimos 6 ciclos, limitada a 18–45 dias
-- =============================================================

-- -------------------------------------------------------------
-- 1. Utilitários
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','user_settings','daily_logs','subscriptions'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Cria perfil + preferências assim que a usuária se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Assinatura ativa?
create or replace function public.is_premium(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
     where s.user_id = p_user
       and s.status in ('active','trialing')
       and (s.renews_at is null or s.renews_at > now())
  );
$$;

-- -------------------------------------------------------------
-- 2. Views do ciclo
-- -------------------------------------------------------------

-- Dias com fluxo registrado.
create or replace view public.v_period_days
with (security_invoker = on) as
  select user_id, log_date
    from public.daily_logs
   where flow is not null;

-- Menstruações: dias com fluxo agrupados, tolerando até 2 dias de intervalo
-- (mesma regra de periodsFromLogs() no app).
create or replace view public.v_periods
with (security_invoker = on) as
with marked as (
  select user_id, log_date,
         case when log_date - lag(log_date) over (partition by user_id order by log_date) <= 2
              then 0 else 1 end as is_new
    from public.v_period_days
), grouped as (
  select user_id, log_date,
         sum(is_new) over (partition by user_id order by log_date rows unbounded preceding) as grp
    from marked
)
select user_id,
       min(log_date)                       as started_on,
       max(log_date)                       as ended_on,
       (max(log_date) - min(log_date) + 1) as length_days
  from grouped
 group by user_id, grp;

-- Ciclos concluídos: distância entre inícios consecutivos de menstruação.
create or replace view public.v_cycles
with (security_invoker = on) as
select user_id,
       started_on as cycle_start,
       lead(started_on) over (partition by user_id order by started_on) as next_start,
       (lead(started_on) over (partition by user_id order by started_on) - started_on) as length_days
  from public.v_periods;

-- Feed da comunidade já com "curti" resolvido para quem está pedindo.
create or replace view public.v_feed
with (security_invoker = on) as
select p.id, p.user_id, p.author_name, p.author_avatar, p.phase, p.body,
       p.likes_count, p.comments_count, p.is_seed, p.created_at,
       (p.user_id = auth.uid())                                        as is_mine,
       exists (select 1 from public.post_likes l
                where l.post_id = p.id and l.user_id = auth.uid())      as liked_by_me
  from public.posts p
 where not p.is_hidden;

-- -------------------------------------------------------------
-- 3. get_cycle_info() — o cálculo principal
-- -------------------------------------------------------------
create or replace function public.get_cycle_info(p_ref date default current_date)
returns table (
  known             boolean,
  cycle_start       date,
  day_of_cycle      integer,
  avg_length        integer,
  period_length     integer,
  luteal_phase      integer,
  next_period       date,
  ovulation         date,
  fertile_start     date,
  fertile_end       date,
  days_to_period    integer,
  days_to_ovulation integer,
  phase             text,
  cycles_tracked    integer,
  variation         integer,
  confidence        integer,
  projected         boolean
)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_user      uuid := auth.uid();
  v_luteal    integer := 14;
  v_declared  integer := 28;
  v_period    integer := 5;
  v_starts    date[];
  v_lengths   integer[];
  v_avg       integer;
  v_start     date;
  v_day       integer;
  v_projected boolean := false;
  v_variation integer;
  v_conf      integer;
  v_next date; v_ovul date; v_fs date; v_fe date;
  v_phase text;
  v_n integer;
begin
  if v_user is null then
    return;
  end if;

  select coalesce(s.luteal_phase, 14), coalesce(p.cycle_length, 28), coalesce(p.period_length, 5)
    into v_luteal, v_declared, v_period
    from public.profiles p
    left join public.user_settings s on s.user_id = p.id
   where p.id = v_user;

  -- sem perfil ainda (ou sem preferências): volta aos padrões
  v_luteal   := coalesce(v_luteal, 14);
  v_declared := coalesce(v_declared, 28);
  v_period   := coalesce(v_period, 5);

  -- inícios de menstruação conhecidos: registros + a data informada no cadastro
  select array_agg(d order by d) into v_starts
    from (
      select started_on as d from public.v_periods where user_id = v_user
      union
      select last_period_start from public.profiles where id = v_user and last_period_start is not null
    ) x
   where d <= p_ref;

  if v_starts is null then
    return query
      select false, null::date, null::integer, v_declared, v_period, v_luteal,
             null::date, null::date, null::date, null::date,
             null::integer, null::integer, null::text, 0, null::integer, 55, false;
    return;
  end if;

  -- durações dos ciclos concluídos (descarta outliers fora de 15–60 dias)
  select array_agg(diff) into v_lengths
    from (
      select (v_starts[i + 1] - v_starts[i]) as diff
        from generate_subscripts(v_starts, 1) as i
       where i < array_length(v_starts, 1)
    ) t
   where diff between 15 and 60;

  if v_lengths is null then
    v_avg := v_declared;
    v_n := 0;
  else
    -- considera apenas os 6 ciclos mais recentes
    v_n := array_length(v_lengths, 1);
    v_lengths := v_lengths[greatest(1, v_n - 5):v_n];
    v_n := array_length(v_lengths, 1);
    select round(avg(x))::integer into v_avg from unnest(v_lengths) as x;
    v_avg := least(45, greatest(18, v_avg));
    if v_n > 1 then
      select max(x) - min(x) into v_variation from unnest(v_lengths) as x;
    end if;
  end if;

  -- ciclo atual; se ficou muito tempo sem registro, projeta ciclos teóricos
  v_start := v_starts[array_length(v_starts, 1)];
  v_day   := (p_ref - v_start) + 1;
  while v_day > v_avg + 15 loop
    v_start     := v_start + v_avg;
    v_day       := (p_ref - v_start) + 1;
    v_projected := true;
  end loop;

  v_next := v_start + v_avg;
  v_ovul := v_next - v_luteal;
  v_fs   := v_ovul - 5;
  v_fe   := v_ovul + 1;

  v_conf := 60 + least(v_n, 6) * 5;
  if v_variation is not null then v_conf := v_conf - least(v_variation, 10) * 2; end if;
  if v_projected then v_conf := v_conf - 10; end if;
  v_conf := least(95, greatest(35, v_conf));

  v_phase := case
    when v_day <= v_period          then 'menstrual'
    when p_ref = v_ovul             then 'ovulation'
    when p_ref between v_fs and v_fe then 'fertile'
    when p_ref > v_ovul             then 'luteal'
    else 'follicular'
  end;

  return query
    select true, v_start, v_day, v_avg, v_period, v_luteal,
           v_next, v_ovul, v_fs, v_fe,
           (v_next - p_ref)::integer, (v_ovul - p_ref)::integer,
           v_phase, v_n, v_variation, v_conf, v_projected;
end $$;

comment on function public.get_cycle_info(date) is
  'Estado do ciclo da usuária autenticada em uma data. Espelha assets/js/cycle.js.';

-- -------------------------------------------------------------
-- 4. Estatísticas para a tela de relatórios
-- -------------------------------------------------------------
create or replace function public.get_streak()
returns table (current_streak integer, best_streak integer, total_days integer)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_cur integer := 0;
  v_cursor date;
begin
  if v_user is null then return; end if;

  -- a sequência não quebra se o dia de hoje ainda não foi registrado
  v_cursor := case
    when exists (select 1 from public.daily_logs where user_id = v_user and log_date = current_date)
    then current_date else current_date - 1 end;

  while exists (select 1 from public.daily_logs where user_id = v_user and log_date = v_cursor) loop
    v_cur := v_cur + 1;
    v_cursor := v_cursor - 1;
  end loop;

  return query
  with islands as (
    select log_date - (row_number() over (order by log_date))::integer as grp
      from public.daily_logs where user_id = v_user
  )
  select v_cur,
         greatest(v_cur, coalesce((select max(c) from (select count(*) c from islands group by grp) s), 0))::integer,
         (select count(*) from public.daily_logs where user_id = v_user)::integer;
end $$;

create or replace function public.get_cycle_report()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'cycles', coalesce((
      select jsonb_agg(jsonb_build_object('start', cycle_start, 'length', length_days) order by cycle_start)
        from public.v_cycles
       where user_id = auth.uid() and length_days between 15 and 60
    ), '[]'::jsonb),
    'periods', coalesce((
      select jsonb_agg(jsonb_build_object('start', started_on, 'end', ended_on, 'length', length_days) order by started_on)
        from public.v_periods where user_id = auth.uid()
    ), '[]'::jsonb),
    'top_symptoms', coalesce((
      select jsonb_agg(jsonb_build_object('symptom', t.s, 'days', t.n) order by t.n desc)
        from (
          select s, count(*) as n
            from public.daily_logs d
            cross join lateral unnest(d.symptoms) as s
           where d.user_id = auth.uid()
           group by s
           order by count(*) desc
           limit 5
        ) t
    ), '[]'::jsonb),
    'temperatures', coalesce((
      select jsonb_agg(jsonb_build_object('date', log_date, 'value', temperature) order by log_date)
        from public.daily_logs
       where user_id = auth.uid() and temperature is not null and log_date >= current_date - 60
    ), '[]'::jsonb),
    'mood_avg', (select round(avg(mood), 2) from public.daily_logs where user_id = auth.uid() and mood is not null),
    'intercourse_days', (select count(*) from public.daily_logs where user_id = auth.uid() and intercourse)
  );
$$;

-- -------------------------------------------------------------
-- 5. Sugestão do dia (determinística: a mesma para a usuária no mesmo dia)
-- -------------------------------------------------------------
create or replace function public.get_daily_tip(p_offset integer default 0)
returns table (id uuid, category public.tip_category, body text, is_premium boolean)
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_phase public.user_phase;
  v_cycle text;
  v_pool  uuid[];
  v_seed  bigint;
begin
  if v_user is null then return; end if;

  select p.phase into v_phase from public.profiles p where p.id = v_user;
  select c.phase into v_cycle from public.get_cycle_info() c;

  select array_agg(t.id order by t.id) into v_pool
    from public.tips t
   where t.active
     and v_phase = any (t.phases)
     and (v_phase <> 'tentante'
          or t.cycle_phases && array[coalesce(v_cycle,'any')::public.cycle_phase, 'any'::public.cycle_phase]);

  if v_pool is null then
    select array_agg(t.id order by t.id) into v_pool from public.tips t where t.active and v_phase = any (t.phases);
  end if;
  if v_pool is null then return; end if;

  -- semente estável por usuária + dia (o & mantém o valor não negativo)
  v_seed := hashtextextended(v_user::text || current_date::text, 0) & 2147483647;

  return query
    select t.id, t.category, t.body, t.is_premium
      from public.tips t
     where t.id = v_pool[ ((((v_seed + p_offset) % array_length(v_pool, 1)) + 1)::integer) ];
end $$;

-- -------------------------------------------------------------
-- 6. Contadores da comunidade
-- -------------------------------------------------------------
create or replace function public.tg_sync_likes_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  end if;
  return null;
end $$;

drop trigger if exists sync_likes_count on public.post_likes;
create trigger sync_likes_count
  after insert or delete on public.post_likes
  for each row execute function public.tg_sync_likes_count();

create or replace function public.tg_sync_comments_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update public.posts set comments_count = greatest(0, comments_count - 1) where id = old.post_id;
  end if;
  return null;
end $$;

drop trigger if exists sync_comments_count on public.comments;
create trigger sync_comments_count
  after insert or delete on public.comments
  for each row execute function public.tg_sync_comments_count();

-- Preenche nome/avatar do autor a partir do perfil, para o app não precisar enviar.
create or replace function public.tg_fill_author()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_name text; v_avatar text;
begin
  if new.user_id is not null then
    select coalesce(nullif(p.name, ''), 'Florescer'), p.avatar_emoji
      into v_name, v_avatar
      from public.profiles p where p.id = new.user_id;
    new.author_name   := coalesce(v_name, 'Florescer');
    new.author_avatar := coalesce(v_avatar, '🌷');
  end if;
  return new;
end $$;

drop trigger if exists fill_author on public.posts;
create trigger fill_author before insert on public.posts
  for each row execute function public.tg_fill_author();

drop trigger if exists fill_author on public.comments;
create trigger fill_author before insert on public.comments
  for each row execute function public.tg_fill_author();

-- -------------------------------------------------------------
-- 7. Exportação e exclusão de dados (LGPD)
-- -------------------------------------------------------------
create or replace function public.export_my_data()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'exported_at', now(),
    'profile',      (select to_jsonb(p) from public.profiles p where p.id = auth.uid()),
    'settings',     (select to_jsonb(s) from public.user_settings s where s.user_id = auth.uid()),
    'daily_logs',   coalesce((select jsonb_agg(to_jsonb(d) order by d.log_date) from public.daily_logs d where d.user_id = auth.uid()), '[]'::jsonb),
    'journey',      coalesce((select jsonb_agg(to_jsonb(j) order by j.happened_at) from public.journey_events j where j.user_id = auth.uid()), '[]'::jsonb),
    'posts',        coalesce((select jsonb_agg(to_jsonb(p) order by p.created_at) from public.posts p where p.user_id = auth.uid()), '[]'::jsonb),
    'comments',     coalesce((select jsonb_agg(to_jsonb(c) order by c.created_at) from public.comments c where c.user_id = auth.uid()), '[]'::jsonb),
    'saved_tips',   coalesce((select jsonb_agg(tip_id) from public.saved_tips where user_id = auth.uid()), '[]'::jsonb),
    'saved_articles', coalesce((select jsonb_agg(article_id) from public.saved_articles where user_id = auth.uid()), '[]'::jsonb),
    'subscription', (select to_jsonb(s) from public.subscriptions s where s.user_id = auth.uid())
  );
$$;
comment on function public.export_my_data() is 'Portabilidade de dados (LGPD art. 18, V).';

create or replace function public.delete_my_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'É preciso estar autenticada para apagar os dados';
  end if;
  -- as demais tabelas caem por ON DELETE CASCADE a partir de profiles
  delete from public.profiles where id = v_user;
end $$;
comment on function public.delete_my_data() is 'Eliminação de dados (LGPD art. 18, VI). Mantém a conta em auth.users até o logout/exclusão pelo painel.';

grant select on public.v_period_days, public.v_periods, public.v_cycles, public.v_feed to authenticated;

grant execute on function
  public.get_cycle_info(date),
  public.get_streak(),
  public.get_cycle_report(),
  public.get_daily_tip(integer),
  public.is_premium(uuid),
  public.export_my_data(),
  public.delete_my_data()
to authenticated;
