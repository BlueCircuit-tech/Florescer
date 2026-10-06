/**
 * Ponte entre o app e o endpoint da IA Flor.
 *
 * Regras que valem aqui:
 *  - nada é enviado sem a usuária ter autorizado (settings.florAI);
 *  - sinais de alerta nunca saem do aparelho: são respondidos localmente;
 *  - qualquer falha (offline, erro, recusa, demora) cai na base local,
 *    então a Flor nunca fica muda.
 */
import { cycleInfo, pregnancyInfo, postpartumInfo, toKey } from './cycle.js';

const ENDPOINT = '/api/flor';
const TIMEOUT_MS = 20_000;

/**
 * Resumo em números — sem nome, sem diário, sem sintomas, sem leituras.
 *
 * É daqui que sai toda a personalização do lado da IA: na gestação, a semana
 * e o trimestre bastam para a resposta falar do momento real dela. O resto da
 * personalização (sintomas registrados, o que ela leu, objetivos) acontece no
 * aparelho, em `florProfile.js`, e nunca é enviado.
 */
export function cycleContext(state) {
  const phase = state?.profile?.phase || 'tentante';

  if (phase === 'gravida') {
    const preg = pregnancyInfo(state);
    if (!preg.known) return { phase };
    return {
      phase,
      weeks: preg.weeks,
      days: preg.days,
      trimester: preg.trimester,
      due: toKey(preg.due),
      multiple: preg.multiple,
    };
  }

  if (phase === 'posparto') {
    const pp = postpartumInfo(state);
    if (!pp.known) return { phase };
    return { phase, babyWeeks: pp.weeks };
  }

  const cycle = cycleInfo(state);
  if (!cycle.known) return { phase };
  return {
    phase,
    dayOfCycle: cycle.dayOfCycle,
    avgLength: cycle.avgLength,
    ovulation: toKey(cycle.ovulation),
    fertileStart: toKey(cycle.fertileStart),
    fertileEnd: toKey(cycle.fertileEnd),
    nextPeriod: toKey(cycle.nextPeriod),
    cyclesTracked: cycle.cyclesTracked,
  };
}

/** Últimas trocas, para a IA entender "e depois?" sem reenviar tudo. */
export function recentHistory(chat, limit = 4) {
  return (chat || [])
    .slice(-limit)
    .map((message) => ({
      role: message.role === 'user' ? 'user' : 'assistant',
      content: String(message.text || '').slice(0, 500),
    }))
    .filter((message) => message.content.length > 1);
}

export const aiEnabled = (state) => state?.settings?.florAI === true;
export const aiDecided = (state) => typeof state?.settings?.florAI === 'boolean';

/**
 * Pergunta à IA. Devolve `{ answer }` ou `null` quando não deu —
 * e nunca lança, para a tela poder sempre cair na resposta local.
 */
export async function askFlorAI({ question, cycle, history }) {
  if (!navigator.onLine) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, cycle, history }),
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const data = await response.json();
    const answer = typeof data?.answer === 'string' ? data.answer.trim() : '';
    return answer ? { answer } : null;
  } catch {
    // offline, tempo esgotado, endpoint ausente em ambiente estático: tudo cai no local
    return null;
  } finally {
    clearTimeout(timer);
  }
}
