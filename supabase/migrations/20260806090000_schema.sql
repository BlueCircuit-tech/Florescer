-- =============================================================
--  Florescer — 1/3: tipos, tabelas e índices
--  Banco: Supabase (PostgreSQL 15+)
--
--  Modelo de dados que substitui os mocks do app:
--   · perfil e preferências da usuária        (profiles, user_settings)
--   · diário diário do ciclo                  (daily_logs)
--   · conteúdo editorial                      (articles, article_contents, tips, faq)
--   · comunidade                              (posts, comments, post_likes, post_reports)
--   · engajamento                             (challenges, journey_events, saved_*)
--   · assinatura e lembretes                  (subscriptions, notification_log)
--
--  Dados de saúde são sensíveis (LGPD art. 11): nenhuma tabela de usuária
--  é legível sem RLS — as políticas estão em 20260806090200_policies.sql.
-- =============================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()

-- -------------------------------------------------------------
-- 1. Tipos
--    Cada enum é criado isoladamente para que a migração possa ser
--    reexecutada sem abortar quando um dos tipos já existir.
-- -------------------------------------------------------------
do $enums$
declare
  t record;
begin
  for t in
    select * from (values
      ('user_phase',          array['tentante','gravida','posparto']),
      ('flow_level',          array['spotting','light','medium','heavy']),
      ('mucus_type',          array['seco','pegajoso','cremoso','aquoso','clara_ovo']),
      ('ov_test_result',      array['nao_fiz','positivo','negativo']),
      ('trying_duration',     array['nao_comecei','ate_6m','6m_1a','mais_1a']),
      ('cycle_regularity',    array['regular','irregular','nao_sei']),
      ('main_challenge',      array['fertil','ansiedade','informacao','organizar','outro']),
      ('tip_category',        array['nutri','bem','fert']),
      ('cycle_phase',         array['menstrual','follicular','fertile','ovulation','luteal','any']),
      ('subscription_plan',   array['mensal','anual']),
      ('subscription_status', array['trialing','active','canceled','past_due']),
      ('report_reason',       array['ofensivo','venda','medicamento','sensivel','outro']),
      ('report_status',       array['pendente','analisado','removido']),
      ('notification_kind',   array['fertile','fertile_today','period','daily_log','tip','community'])
    ) as v(nome, valores)
  loop
    if not exists (
      select 1 from pg_type
       where typname = t.nome and typnamespace = 'public'::regnamespace
    ) then
      execute format('create type public.%I as enum (%s)', t.nome,
        (select string_agg(quote_literal(x), ', ') from unnest(t.valores) as x));
    end if;
  end loop;
end $enums$;

-- -------------------------------------------------------------
-- 2. Perfil e preferências
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  name              text not null default '' check (char_length(name) <= 60),
  phase             public.user_phase not null default 'tentante',
  trying_for        public.trying_duration,
  regularity        public.cycle_regularity,
  challenge         public.main_challenge,

  -- ciclo (usados quando ainda não há registros suficientes)
  last_period_start date,
  cycle_length      smallint not null default 28 check (cycle_length between 18 and 45),
  period_length     smallint not null default 5  check (period_length between 1 and 10),

  -- gestação / pós-parto
  due_date          date,
  birth_date        date,
  baby_name         text not null default '' check (char_length(baby_name) <= 40),

  avatar_emoji      text not null default '🌷',
  onboarded         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint profiles_dates_sane check (
    (last_period_start is null or last_period_start > date '2000-01-01') and
    (birth_date        is null or birth_date        > date '2000-01-01') and
    (due_date          is null or due_date          > date '2000-01-01')
  )
);
comment on table public.profiles is 'Perfil da usuária. 1:1 com auth.users, criado pelo trigger on_auth_user_created.';

create table if not exists public.user_settings (
  user_id            uuid primary key references public.profiles(id) on delete cascade,
  luteal_phase       smallint not null default 14 check (luteal_phase between 10 and 16),
  tips_opt_in        boolean  not null default true,
  notify_fertile     boolean  not null default true,
  notify_period      boolean  not null default true,
  notify_daily_log   boolean  not null default true,
  notify_tip         boolean  not null default true,
  notify_community   boolean  not null default false,
  notify_time        time     not null default '09:00',
  timezone           text     not null default 'America/Sao_Paulo',
  updated_at         timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 3. Diário do ciclo
-- -------------------------------------------------------------
create table if not exists public.symptom_catalog (
  id          text primary key,
  label       text not null,
  sort_order  smallint not null default 0,
  active      boolean not null default true
);
comment on table public.symptom_catalog is 'Lista de sintomas oferecida no registro diário (editável sem deploy).';

create table if not exists public.daily_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  log_date      date not null check (log_date > date '2000-01-01'),

  flow          public.flow_level,                 -- null = sem menstruação no dia
  mood          smallint check (mood between 0 and 4),
  symptoms      text[] not null default '{}',      -- ids de symptom_catalog
  intercourse   boolean not null default false,
  protected     boolean not null default false,
  temperature   numeric(4,2) check (temperature between 34 and 42),
  mucus         public.mucus_type,
  ov_test       public.ov_test_result not null default 'nao_fiz',
  notes         text not null default '' check (char_length(notes) <= 2000),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, log_date)
);
comment on table public.daily_logs is 'Um registro por usuária por dia. Base de todo o cálculo de ciclo.';

create index if not exists daily_logs_user_date_idx  on public.daily_logs (user_id, log_date desc);
create index if not exists daily_logs_flow_idx       on public.daily_logs (user_id, log_date) where flow is not null;
create index if not exists daily_logs_temp_idx       on public.daily_logs (user_id, log_date) where temperature is not null;

-- -------------------------------------------------------------
-- 4. Conteúdo editorial
-- -------------------------------------------------------------
create table if not exists public.articles (
  id            text primary key,
  category      text not null,
  title         text not null,
  excerpt       text not null,
  icon          text not null default 'book',
  gradient      text not null default 'var(--grad-rose)',
  read_minutes  smallint not null default 5,
  is_premium    boolean not null default false,
  phases        public.user_phase[] not null default '{tentante}',
  sort_order    smallint not null default 0,
  published_at  timestamptz not null default now()
);
comment on table public.articles is 'Metadados públicos dos artigos (aparecem na biblioteca mesmo bloqueados).';

create table if not exists public.article_contents (
  article_id    text primary key references public.articles(id) on delete cascade,
  body          jsonb not null   -- [["p","texto"],["h2","título"],["li","item"],["note","aviso"]]
);
comment on table public.article_contents is 'Corpo do artigo. Separado de articles para que o conteúdo Premium não vaze pela API.';

create table if not exists public.tips (
  id            uuid primary key default gen_random_uuid(),
  category      public.tip_category not null,
  body          text not null unique,   -- chave natural: torna o seed reexecutável
  phases        public.user_phase[] not null default '{tentante}',
  cycle_phases  public.cycle_phase[] not null default '{any}',
  is_premium    boolean not null default false,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);
comment on table public.tips is 'Banco de sugestões diárias. A escolha do dia é feita por get_daily_tip().';

create index if not exists tips_phase_idx on public.tips using gin (phases);
create index if not exists articles_phase_idx on public.articles using gin (phases);

create table if not exists public.faq (
  id          smallint generated always as identity primary key,
  question    text not null,
  answer      text not null,
  sort_order  smallint not null default 0
);

create table if not exists public.community_rules (
  id          smallint generated always as identity primary key,
  rule        text not null,
  sort_order  smallint not null default 0
);

-- favoritos e leitura
create table if not exists public.saved_tips (
  user_id  uuid not null references public.profiles(id) on delete cascade,
  tip_id   uuid not null references public.tips(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, tip_id)
);

create table if not exists public.saved_articles (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  article_id text not null references public.articles(id) on delete cascade,
  saved_at   timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.article_reads (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  article_id text not null references public.articles(id) on delete cascade,
  read_at    timestamptz not null default now(),
  primary key (user_id, article_id)
);

-- -------------------------------------------------------------
-- 5. Comunidade
-- -------------------------------------------------------------
create table if not exists public.posts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade,  -- null = post editorial
  author_name    text not null,
  author_avatar  text not null default '🌸',
  phase          public.user_phase not null default 'tentante',
  body           text not null check (char_length(body) between 5 and 2000),
  likes_count    integer not null default 0 check (likes_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  is_seed        boolean not null default false,
  is_hidden      boolean not null default false,
  created_at     timestamptz not null default now(),
  constraint posts_author check (user_id is not null or is_seed)
);
comment on column public.posts.is_seed is 'Conteúdo editorial de boas-vindas do feed, sem autora real.';

create index if not exists posts_recent_idx on public.posts (created_at desc) where not is_hidden;
create index if not exists posts_phase_idx  on public.posts (phase, created_at desc) where not is_hidden;
create index if not exists posts_user_idx   on public.posts (user_id, created_at desc);

create table if not exists public.post_likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists post_likes_user_idx on public.post_likes (user_id);

create table if not exists public.comments (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references public.posts(id) on delete cascade,
  user_id       uuid references public.profiles(id) on delete cascade,
  author_name   text not null,
  author_avatar text not null default '🌸',
  body          text not null check (char_length(body) between 1 and 1000),
  is_hidden     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

create table if not exists public.post_reports (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references public.posts(id) on delete cascade,
  comment_id  uuid references public.comments(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason      public.report_reason not null,
  details     text default '',
  status      public.report_status not null default 'pendente',
  created_at  timestamptz not null default now(),
  constraint post_reports_target check (post_id is not null or comment_id is not null)
);
create index if not exists post_reports_pending_idx on public.post_reports (created_at) where status = 'pendente';

-- -------------------------------------------------------------
-- 6. Engajamento
-- -------------------------------------------------------------
create table if not exists public.challenges (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  days        smallint not null default 7 check (days between 1 and 31),
  starts_on   date,
  ends_on     date,
  active      boolean not null default true
);

create table if not exists public.challenge_progress (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  day_index    smallint not null check (day_index >= 0 and day_index < 31),
  done_at      timestamptz not null default now(),
  primary key (user_id, challenge_id, day_index)
);

create table if not exists public.journey_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  icon        text not null default 'flower',
  title       text not null,
  note        text not null default '',
  happened_at timestamptz not null default now(),
  unique (user_id, title)
);
comment on table public.journey_events is 'Marcos da jornada exibidos no perfil (primeiro registro, sequência de 7 dias, mudança de fase…).';

-- -------------------------------------------------------------
-- 7. Assinatura e lembretes
-- -------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  plan         public.subscription_plan not null default 'mensal',
  status       public.subscription_status not null default 'active',
  started_at   timestamptz not null default now(),
  renews_at    timestamptz,
  canceled_at  timestamptz,
  store        text,                 -- 'app_store' | 'play_store' | 'stripe'
  store_ref    text,                 -- id da assinatura no provedor
  updated_at   timestamptz not null default now()
);
comment on table public.subscriptions is 'Escrita apenas pelo webhook da loja/gateway (service role). O app só lê.';

create table if not exists public.notification_log (
  user_id  uuid not null references public.profiles(id) on delete cascade,
  kind     public.notification_kind not null,
  sent_on  date not null default current_date,
  sent_at  timestamptz not null default now(),
  primary key (user_id, kind, sent_on)
);
comment on table public.notification_log is 'Evita reenviar o mesmo lembrete duas vezes no mesmo dia.';

-- -------------------------------------------------------------
-- 8. Permissões de base (o acesso real é definido pelas políticas RLS)
-- -------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.articles, public.tips, public.faq, public.community_rules,
                public.symptom_catalog, public.challenges to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
