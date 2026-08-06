/**
 * Camada de conteúdo editável.
 *
 * O app lê todo o conteúdo editorial por aqui. Se a administradora tiver
 * publicado uma versão pelo painel, ela substitui o padrão de content.js;
 * caso contrário, vale o conteúdo que vem no código.
 */
import * as C from './content.js';

const KEY = 'florescer:cms:v1';

const DEFAULTS = {
  tips: () => C.TIPS,
  articles: () => C.ARTICLES,
  faq: () => C.FAQ,
  rules: () => C.COMMUNITY_RULES,
  challenge: () => C.CHALLENGE,
  plans: () => C.PLANS,
  benefits: () => C.PREMIUM_BENEFITS,
};

let overrides = load();
const listeners = new Set();

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(overrides));
  } catch (err) {
    console.warn('[florescer] não foi possível salvar o conteúdo:', err);
  }
  listeners.forEach((fn) => fn());
}

export const onChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

/** Conteúdo em uso (publicado pelo painel ou o padrão do app). */
export function get(name) {
  const fallback = DEFAULTS[name];
  if (!fallback) throw new Error(`coleção desconhecida: ${name}`);
  return overrides[name] ?? fallback();
}

export const getTips = () => get('tips');
export const getArticles = () => get('articles');
export const getFaq = () => get('faq');
export const getRules = () => get('rules');
export const getChallenge = () => get('challenge');
export const getPlans = () => get('plans');
export const getBenefits = () => get('benefits');

export function set(name, value) { overrides[name] = value; save(); }
export function reset(name) { delete overrides[name]; save(); }
export function resetAll() { overrides = {}; save(); }
export const isCustom = (name) => Object.prototype.hasOwnProperty.call(overrides, name);
export const customCount = () => Object.keys(overrides).length;

/* ---------- exportação ---------- */
export function exportJson() {
  return JSON.stringify({
    app: 'florescer',
    kind: 'conteudo',
    exportedAt: new Date().toISOString(),
    content: {
      tips: getTips(),
      articles: getArticles(),
      faq: getFaq(),
      rules: getRules(),
      challenge: getChallenge(),
      plans: getPlans(),
      benefits: getBenefits(),
    },
  }, null, 2);
}

export function importJson(json) {
  const parsed = JSON.parse(json);
  const content = parsed.content || parsed;
  const valid = Object.keys(DEFAULTS);
  const next = {};
  for (const k of valid) if (content[k] !== undefined) next[k] = content[k];
  if (!Object.keys(next).length) throw new Error('Arquivo sem conteúdo reconhecível');
  overrides = next;
  save();
}

/* ---------- exportação para o Supabase ---------- */
const q = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`;
const arr = (list) => `'{${(list || []).map((x) => `"${String(x).replace(/"/g, '\\"')}"`).join(',')}}'`;

/** Gera o SQL que publica o conteúdo atual nas tabelas do Supabase. */
export function toSql() {
  const L = [];
  L.push('-- Conteúdo do Florescer exportado pelo painel da administradora');
  L.push(`-- ${new Date().toISOString()}`);
  L.push('begin;');
  L.push('');

  L.push('-- sugestões diárias');
  for (const t of getTips()) {
    L.push(`insert into public.tips (category, body, phases, cycle_phases) values (${q(t.c)}, ${q(t.txt)}, ${arr(t.phases)}, ${arr(t.cycle)})`);
    L.push('  on conflict (body) do update set category = excluded.category, phases = excluded.phases, cycle_phases = excluded.cycle_phases, active = true;');
  }
  L.push('');

  L.push('-- artigos');
  for (const a of getArticles()) {
    L.push(`insert into public.articles (id, category, title, excerpt, icon, gradient, read_minutes, is_premium, phases, sort_order)`);
    L.push(`  values (${q(a.id)}, ${q(a.cat)}, ${q(a.title)}, ${q(a.excerpt)}, ${q(a.icon)}, ${q(a.grad)}, ${a.time || 5}, ${!!a.premium}, ${arr(a.phases)}, ${a.sort || 0})`);
    L.push('  on conflict (id) do update set category = excluded.category, title = excluded.title, excerpt = excluded.excerpt,');
    L.push('    icon = excluded.icon, gradient = excluded.gradient, read_minutes = excluded.read_minutes,');
    L.push('    is_premium = excluded.is_premium, phases = excluded.phases, sort_order = excluded.sort_order;');
    L.push(`insert into public.article_contents (article_id, body) values (${q(a.id)}, ${q(JSON.stringify(a.body))}::jsonb)`);
    L.push('  on conflict (article_id) do update set body = excluded.body;');
  }
  L.push('');

  L.push('-- perguntas frequentes');
  L.push('delete from public.faq;');
  getFaq().forEach((f, i) => {
    L.push(`insert into public.faq (question, answer, sort_order) values (${q(f.q)}, ${q(f.a)}, ${i + 1});`);
  });
  L.push('');

  L.push('-- diretrizes da comunidade');
  L.push('delete from public.community_rules;');
  getRules().forEach((r, i) => {
    L.push(`insert into public.community_rules (rule, sort_order) values (${q(r)}, ${i + 1});`);
  });
  L.push('');

  const ch = getChallenge();
  L.push('-- desafio da semana');
  L.push(`update public.challenges set title = ${q(ch.title)}, description = ${q(ch.description)}, days = ${ch.days || 7} where active;`);
  L.push('');
  L.push('commit;');
  return L.join('\n');
}
