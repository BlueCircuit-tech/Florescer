# Florescer — banco de dados (Supabase)

Schema que substitui os dados locais do app por dados reais e multi-dispositivo.

```
supabase/
  migrations/
    20260806090000_schema.sql      tipos, tabelas, índices, permissões de base
    20260806090100_functions.sql   views do ciclo, RPCs, triggers
    20260806090200_policies.sql    Row Level Security + realtime
    20260806090300_admin.sql       administração, auditoria e trava de privilégio
  seed.sql                         conteúdo editorial e feed de boas-vindas
```

## Como aplicar

**Pelo painel** (mais rápido): SQL Editor → cole e rode **nesta ordem**: `schema` → `functions` → `policies` → `admin` → `seed`.

**Pela CLI:**

```bash
supabase link --project-ref SEU_PROJECT_REF
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql
```

Todos os arquivos são idempotentes: podem ser reexecutados sem quebrar.

## O que cada tabela guarda

| Tabela | Conteúdo | Quem acessa |
|---|---|---|
| `profiles` | nome, fase, datas do ciclo, DPP, nascimento do bebê | só a dona |
| `user_settings` | fase lútea, lembretes, horário, fuso | só a dona |
| `daily_logs` | um registro por dia: fluxo, humor, sintomas, temperatura, muco, teste, notas | só a dona |
| `articles` / `article_contents` | biblioteca; o corpo fica em tabela separada para o Premium não vazar | metadados públicos, corpo conforme assinatura |
| `tips` | banco de sugestões por fase e fase do ciclo | leitura pública, escrita da administradora |
| `posts` / `comments` / `post_likes` | comunidade | leitura de todas, escrita só do próprio |
| `post_reports` | denúncias | cria e vê as suas; administradora analisa |
| `challenges` / `challenge_progress` | desafio da semana | progresso é privado |
| `journey_events` | marcos do perfil | só a dona |
| `subscriptions` | plano, status, renovação | **leitura** pela usuária; escrita só pelo webhook da loja |
| `notification_log` | controle de lembrete já enviado no dia | só a dona |
| `admin_audit` | quem mudou qual conteúdo e quando | só a administradora |

Toda tabela de usuária tem RLS ligada. Dado de saúde é dado sensível (LGPD art. 11): sem política, ninguém lê.

## Funções que o app chama

```js
const { data } = await supabase.rpc('get_cycle_info');
// → { known, cycle_start, day_of_cycle, avg_length, next_period, ovulation,
//     fertile_start, fertile_end, phase, confidence, ... }

await supabase.rpc('get_cycle_info', { p_ref: '2026-09-01' }); // outra data
await supabase.rpc('get_streak');        // sequência atual, recorde e total
await supabase.rpc('get_cycle_report');  // ciclos, menstruações, sintomas, temperaturas
await supabase.rpc('get_daily_tip', { p_offset: 0 }); // sugestão do dia (estável por dia)
await supabase.rpc('export_my_data');    // portabilidade — LGPD art. 18, V
await supabase.rpc('delete_my_data');    // eliminação  — LGPD art. 18, VI
await supabase.rpc('admin_stats');       // números agregados do painel (só administradora)
```

Views auxiliares: `v_periods` (menstruações agrupadas), `v_cycles` (duração de cada ciclo), `v_feed` (posts já com `liked_by_me` e `is_mine`).

## Operações comuns

```js
// salvar/atualizar o dia (um registro por usuária por data)
await supabase.from('daily_logs').upsert({
  user_id: user.id, log_date: '2026-08-06',
  flow: 'medium', mood: 3, symptoms: ['colicas','sono'],
  intercourse: true, temperature: 36.6, mucus: 'clara_ovo', ov_test: 'positivo',
}, { onConflict: 'user_id,log_date' });

// calendário: registros do mês
await supabase.from('daily_logs').select('*')
  .gte('log_date', '2026-08-01').lte('log_date', '2026-08-31');

// feed
await supabase.from('v_feed').select('*').order('created_at', { ascending: false }).limit(20);

// curtir / descurtir
await supabase.from('post_likes').insert({ post_id, user_id: user.id });
await supabase.from('post_likes').delete().eq('post_id', post_id).eq('user_id', user.id);

// publicar (nome e avatar vêm do perfil por trigger)
await supabase.from('posts').insert({ user_id: user.id, phase: 'tentante', body: texto });
```

Os contadores `likes_count` e `comments_count` são mantidos por trigger — não atualize na mão.

## Administração

A dona do app edita o conteúdo pelo painel (`#/admin`). Em produção isso vira escrita direta nas tabelas, autorizada por `profiles.is_admin`.

**Promover a primeira administradora** (SQL Editor, que já roda como service role):

```sql
update public.profiles
   set is_admin = true
 where id = (select id from auth.users where email = 'marcele@florescer.app');
```

O que a administradora pode: criar, editar e apagar sugestões, artigos (inclusive o corpo dos Premium), FAQ, diretrizes e desafios; ocultar publicações e comentários; ver denúncias e o `admin_audit`; ler `admin_stats()`.

O que ela **não** pode, de propósito: ler o diário (`daily_logs`), o perfil ou a assinatura de qualquer usuária. Dado de saúde não deve ser legível nem pela dona do produto.

Ninguém consegue se autopromover: o privilégio de `insert`/`update` em `profiles` é concedido coluna a coluna e `is_admin` fica de fora — só a service role escreve nela.

## O que muda no app

O que já está pronto e não muda: motor de ciclo, telas, componentes, painel. O que precisa ser trocado:

1. **Autenticação** — hoje não existe. Entra o Supabase Auth (e-mail + senha ou magic link) antes do quiz; `handle_new_user` já cria `profiles` e `user_settings` no cadastro.
2. **Camada de dados** — `assets/js/store.js` passa a ler e gravar via `@supabase/supabase-js` em vez de `localStorage`. Vale manter o localStorage como cache offline e sincronizar ao reconectar: o app é PWA e precisa funcionar sem rede.
3. **Conteúdo** — `assets/js/cms.js` passa a buscar de `tips`, `articles`, `faq`, `community_rules` e `challenges` em vez do `content.js` local. O painel já grava no mesmo formato.
4. **Sintomas** — o app guarda os rótulos (`"Cólicas"`); o banco guarda ids (`colicas`). Mapear na leitura e na escrita.
5. **Assinatura** — `subscriptions` é escrita só pelo webhook da loja com a service role. O app lê o status.
6. **Migração dos dados existentes** — quem já usou a versão local pode subir o backup: `export_my_data()` tem o mesmo formato do `.json` exportado hoje.

Nada disso está implementado ainda — o schema vem primeiro.

## Segurança

- `anon` só enxerga catálogos (artigos, sugestões, FAQ, diretrizes, desafios).
- Nenhuma função é `security definer` sem `set search_path = public`.
- O corpo de artigo Premium é bloqueado na política, não na interface: sem assinatura, a linha não é retornada nem pela API REST.
- Guarde a `service_role key` apenas no servidor (webhook de pagamento e promoção de administradoras). Ela ignora RLS.
