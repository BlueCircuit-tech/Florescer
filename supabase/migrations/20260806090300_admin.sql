-- =============================================================
--  Florescer — administração
--
--  Dá à dona do app (e a quem ela autorizar) poder para editar o conteúdo
--  editorial e moderar a comunidade, sem usar a service role no cliente.
--  As usuárias comuns continuam sem qualquer acesso extra.
-- =============================================================

-- -------------------------------------------------------------
-- 1. Marca de administradora
-- -------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'Só a service role escreve nesta coluna — o privilégio de update é concedido coluna a coluna abaixo.';

create index if not exists profiles_admin_idx on public.profiles (id) where is_admin;

-- Trava de escalonamento de privilégio.
-- A política de RLS de profiles permite que a usuária edite a própria linha, o
-- que incluiria is_admin. Como RLS não filtra por coluna, tiramos o privilégio
-- de INSERT/UPDATE no nível da tabela e devolvemos apenas nas colunas do perfil.
revoke insert, update on public.profiles from authenticated, anon;

grant insert (
  id, name, phase, trying_for, regularity, challenge,
  last_period_start, cycle_length, period_length,
  due_date, birth_date, baby_name, avatar_emoji, onboarded
) on public.profiles to authenticated;

grant update (
  name, phase, trying_for, regularity, challenge,
  last_period_start, cycle_length, period_length,
  due_date, birth_date, baby_name, avatar_emoji, onboarded, updated_at
) on public.profiles to authenticated;

create or replace function public.is_admin(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = p_user), false);
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- -------------------------------------------------------------
-- 2. Registro de auditoria — quem mudou o quê
-- -------------------------------------------------------------
create table if not exists public.admin_audit (
  id         bigint generated always as identity primary key,
  actor_id   uuid references public.profiles(id) on delete set null,
  action     text not null,        -- insert | update | delete
  table_name text not null,
  record_id  text,
  at         timestamptz not null default now()
);

alter table public.admin_audit enable row level security;

-- a tabela nasce depois dos grants do schema inicial, então libera aqui
-- (o acesso efetivo continua sendo decidido pela política de RLS abaixo)
grant select on public.admin_audit to authenticated;

create or replace function public.tg_admin_audit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.admin_audit (actor_id, action, table_name, record_id)
  values (auth.uid(), lower(tg_op), tg_table_name,
          coalesce(
            case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end ->> 'id',
            case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end ->> 'article_id'
          ));
  return null;
end $$;

do $$
declare t text;
begin
  foreach t in array array['tips','articles','article_contents','faq','community_rules','challenges'] loop
    execute format('drop trigger if exists admin_audit on public.%I', t);
    execute format('create trigger admin_audit after insert or update or delete on public.%I
                    for each row execute function public.tg_admin_audit()', t);
  end loop;
end $$;

-- -------------------------------------------------------------
-- 3. Políticas de administração
-- -------------------------------------------------------------

-- conteúdo editorial: escrita liberada só para administradoras
do $$
declare t text;
begin
  foreach t in array array['tips','articles','article_contents','faq','community_rules','challenges'] loop
    execute format('drop policy if exists "admin: gerencia conteúdo" on public.%I', t);
    execute format($p$create policy "admin: gerencia conteúdo" on public.%I
                     for all to authenticated
                     using (public.is_admin()) with check (public.is_admin())$p$, t);
  end loop;
end $$;

-- corpo de artigo: administradora enxerga inclusive o conteúdo Premium
drop policy if exists "admin: lê todo conteúdo" on public.article_contents;
create policy "admin: lê todo conteúdo" on public.article_contents
  for select to authenticated using (public.is_admin());

-- moderação da comunidade
drop policy if exists "admin: modera publicações" on public.posts;
create policy "admin: modera publicações" on public.posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin: modera comentários" on public.comments;
create policy "admin: modera comentários" on public.comments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin: analisa denúncias" on public.post_reports;
create policy "admin: analisa denúncias" on public.post_reports
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- auditoria: a administradora lê; ninguém edita pelo cliente
drop policy if exists "admin: lê auditoria" on public.admin_audit;
create policy "admin: lê auditoria" on public.admin_audit
  for select to authenticated using (public.is_admin());

-- IMPORTANTE: perfis e diários das usuárias continuam privados.
-- A administradora NÃO recebe acesso a daily_logs, profiles ou subscriptions —
-- dado de saúde é sensível e não deve ser legível nem pela dona do produto.

-- -------------------------------------------------------------
-- 4. Painel: números agregados, sem expor ninguém
-- -------------------------------------------------------------
create or replace function public.admin_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select case when not public.is_admin() then '{"erro":"acesso restrito"}'::jsonb else
    jsonb_build_object(
      'usuarias',            (select count(*) from public.profiles),
      'usuarias_por_fase',   (select jsonb_object_agg(phase, n) from (select phase, count(*) n from public.profiles group by phase) t),
      'assinantes',          (select count(*) from public.subscriptions where status in ('active','trialing')),
      'registros_7d',        (select count(*) from public.daily_logs where log_date >= current_date - 7),
      'publicacoes',         (select count(*) from public.posts where not is_hidden),
      'denuncias_pendentes', (select count(*) from public.post_reports where status = 'pendente'),
      'sugestoes_ativas',    (select count(*) from public.tips where active),
      'artigos',             (select count(*) from public.articles)
    )
  end;
$$;

grant execute on function public.admin_stats() to authenticated;
comment on function public.admin_stats() is
  'Números agregados para o painel. Nunca devolve dados individuais de usuárias.';

-- -------------------------------------------------------------
-- 5. Como promover a primeira administradora
-- -------------------------------------------------------------
-- 1) crie a conta pelo app ou em Authentication › Users no painel do Supabase;
-- 2) rode aqui, no SQL Editor (que já usa a service role):
--
--    update public.profiles
--       set is_admin = true
--     where id = (select id from auth.users where email = 'marcele@florescer.app');
--
-- Para revogar, troque true por false. Não existe política que permita a uma
-- usuária promover a si mesma.
