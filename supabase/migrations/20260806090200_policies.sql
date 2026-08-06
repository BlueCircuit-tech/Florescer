-- =============================================================
--  Florescer — 3/3: Row Level Security
--
--  Princípio: dados de saúde são sensíveis (LGPD art. 11).
--  Cada usuária só enxerga as próprias linhas. A comunidade é o único
--  espaço compartilhado, e mesmo lá o corpo do artigo Premium fica fora
--  do alcance de quem não assina.
-- =============================================================

-- Remove políticas anteriores para que esta migração possa ser reexecutada.
do $$
declare r record;
begin
  for r in select tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.profiles           enable row level security;
alter table public.user_settings      enable row level security;
alter table public.daily_logs         enable row level security;
alter table public.symptom_catalog    enable row level security;
alter table public.articles           enable row level security;
alter table public.article_contents   enable row level security;
alter table public.tips               enable row level security;
alter table public.faq                enable row level security;
alter table public.community_rules    enable row level security;
alter table public.saved_tips         enable row level security;
alter table public.saved_articles     enable row level security;
alter table public.article_reads      enable row level security;
alter table public.posts              enable row level security;
alter table public.post_likes         enable row level security;
alter table public.comments           enable row level security;
alter table public.post_reports       enable row level security;
alter table public.challenges         enable row level security;
alter table public.challenge_progress enable row level security;
alter table public.journey_events     enable row level security;
alter table public.subscriptions      enable row level security;
alter table public.notification_log   enable row level security;

-- -------------------------------------------------------------
-- Perfil e dados pessoais — só a dona
-- -------------------------------------------------------------
create policy "perfil: leitura própria"    on public.profiles for select using (auth.uid() = id);
create policy "perfil: criação própria"    on public.profiles for insert with check (auth.uid() = id);
create policy "perfil: edição própria"     on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "perfil: exclusão própria"   on public.profiles for delete using (auth.uid() = id);

create policy "preferências: acesso próprio" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "diário: acesso próprio" on public.daily_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "salvos: acesso próprio" on public.saved_tips
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "salvos: acesso próprio" on public.saved_articles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "leituras: acesso próprio" on public.article_reads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "jornada: acesso próprio" on public.journey_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "desafio: acesso próprio" on public.challenge_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "lembretes: acesso próprio" on public.notification_log
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Assinatura: a usuária lê; quem escreve é o webhook da loja (service role,
-- que não passa por RLS). Sem política de insert/update de propósito.
create policy "assinatura: leitura própria" on public.subscriptions
  for select using (auth.uid() = user_id);

-- -------------------------------------------------------------
-- Catálogos e conteúdo editorial — leitura para todas
-- -------------------------------------------------------------
create policy "catálogo de sintomas: leitura" on public.symptom_catalog for select using (true);
create policy "artigos: leitura"              on public.articles        for select using (true);
create policy "sugestões: leitura"            on public.tips            for select using (active);
create policy "faq: leitura"                  on public.faq             for select using (true);
create policy "diretrizes: leitura"           on public.community_rules for select using (true);
create policy "desafios: leitura"             on public.challenges      for select using (active);

-- Corpo do artigo: livre quando o artigo é gratuito, exclusivo para assinantes
-- quando é Premium. Isso impede que o conteúdo pago vaze pela API REST.
create policy "conteúdo: gratuito ou assinante" on public.article_contents
  for select using (
    exists (
      select 1 from public.articles a
       where a.id = article_contents.article_id
         and (not a.is_premium or public.is_premium())
    )
  );

-- -------------------------------------------------------------
-- Comunidade
-- -------------------------------------------------------------
create policy "posts: leitura da comunidade" on public.posts
  for select using (not is_hidden or user_id = auth.uid());

create policy "posts: publicar como você mesma" on public.posts
  for insert with check (auth.uid() = user_id and not is_seed and not is_hidden);

create policy "posts: editar os próprios" on public.posts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id and not is_seed);

create policy "posts: excluir os próprios" on public.posts
  for delete using (auth.uid() = user_id);

create policy "curtidas: leitura" on public.post_likes for select using (true);
create policy "curtidas: curtir e descurtir" on public.post_likes
  for insert with check (auth.uid() = user_id);
create policy "curtidas: remover a própria" on public.post_likes
  for delete using (auth.uid() = user_id);

create policy "comentários: leitura" on public.comments
  for select using (not is_hidden or user_id = auth.uid());
create policy "comentários: escrever como você mesma" on public.comments
  for insert with check (auth.uid() = user_id and not is_hidden);
create policy "comentários: editar os próprios" on public.comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "comentários: excluir os próprios" on public.comments
  for delete using (auth.uid() = user_id);

-- Denúncias: a usuária cria e vê apenas as suas; a moderação usa service role.
create policy "denúncias: criar" on public.post_reports
  for insert with check (auth.uid() = reporter_id);
create policy "denúncias: ver as próprias" on public.post_reports
  for select using (auth.uid() = reporter_id);

-- -------------------------------------------------------------
-- Realtime (feed e comentários ao vivo)
-- -------------------------------------------------------------
do $$
declare t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['posts','comments','post_likes'] loop
      if not exists (
        select 1 from pg_publication_tables
         where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end $$;
