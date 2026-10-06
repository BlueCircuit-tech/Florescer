/**
 * IA Flor — endpoint de perguntas sobre ciclo, menstruação, hormônios e fertilidade.
 *
 * Roda como função serverless na Vercel. A chave da API fica só aqui, no
 * servidor: o PWA nunca a enxerga.
 *
 * O que chega aqui: a pergunta escrita pela usuária e, quando ela autoriza,
 * um resumo numérico do ciclo (dia atual, média, datas estimadas). Nome,
 * registros do diário, sintomas e qualquer outro dado pessoal continuam
 * apenas no aparelho.
 *
 * Camadas de segurança:
 *  - sinais de alerta são tratados no cliente e nem chegam a este endpoint;
 *  - o prompt proíbe diagnóstico, dose e interpretação de exame;
 *  - se o modelo recusar ou falhar, o app cai na base de respostas local.
 */
import OpenAI from 'openai';
// a personalidade vem do mesmo arquivo que o app usa: uma Flor só
import { FLOR_PERSONA_PROMPT } from '../assets/js/florVoice.js';

/**
 * gpt-5-mini: as perguntas da Flor são curtas e educativas, não precisam do
 * modelo topo de linha. Custa ~US$ 0,25 por milhão de tokens de entrada e
 * US$ 2,00 de saída — dá cerca de 7 mil perguntas em US$ 5.
 * Para respostas mais elaboradas, trocar por 'gpt-5.1' (8x mais caro).
 */
const MODEL = process.env.FLOR_MODEL || 'gpt-5-mini';
const MAX_QUESTION = 500;
const MAX_HISTORY = 6;

/**
 * Teto de tokens de saída. O prompt já limita a resposta a 120 palavras
 * (~200 tokens); a folga restante é para o raciocínio interno do modelo,
 * que também conta neste limite.
 */
const MAX_TOKENS = 2000;

/** Raciocínio curto: pergunta de chat não precisa de cadeia longa, e isso segura custo. */
const EFFORT = 'low';

const SYSTEM = `${FLOR_PERSONA_PROMPT}

Você é a assistente do aplicativo Florescer, que acompanha mulheres no ciclo menstrual, na tentativa de engravidar, na gestação e no pós-parto.

ESCOPO
Responda apenas sobre ciclo menstrual, menstruação, hormônios, período fértil, ovulação, sinais de fertilidade e acompanhamento da gestação e do pós-parto. Para qualquer outro assunto, diga em uma frase que não é o seu tema e convide a perguntar sobre o ciclo ou a gestação.

NA GESTAÇÃO
Acolha primeiro, informe depois: muita dúvida da gestante vem com medo junto. Você pode explicar PARA QUE serve cada consulta, exame, ultrassom, vitamina e vacina do pré-natal, em que semana costumam ser feitos e o que esperar do procedimento. Pode falar de sintomas comuns por trimestre, movimentos do bebê, alimentação, sono, atividade física, viagens e sinais de trabalho de parto.
Mas:
- explicar para que um exame serve é permitido; dizer o que o RESULTADO dela significa, nunca;
- explicar para que uma vitamina serve é permitido; dizer dose, marca ou por quanto tempo tomar, nunca;
- nunca diga que um sintoma dela é normal, esperado ou sem importância;
- termine orientando a levar a dúvida para a equipe de pré-natal sempre que a resposta depender do caso dela. Deixe claro, quando couber, que você não substitui a consulta.

LIMITES INEGOCIÁVEIS
- Nunca dê diagnóstico, nem sugira qual doença a pessoa tem.
- Nunca indique medicamento, dose, posologia, suplemento ou tratamento.
- Nunca interprete resultado de exame, ultrassom ou beta-hCG.
- Nunca afirme que a pessoa está grávida, ovulando ou com qualquer condição.
- Nunca diga que algo é seguro ou perigoso na gestação sem mandar confirmar com a equipe de pré-natal.
- Se a pergunta trouxer sinal de alerta (sangramento intenso, perda de líquido, dor forte, febre alta, desmaio, redução de movimentos do bebê, dor de cabeça forte com alteração visual, inchaço súbito, contrações antes de 37 semanas, pensamentos de morte ou de se machucar), responda apenas orientando a procurar atendimento no mesmo dia e, em sofrimento emocional, cite o CVV pelo 188.
- Se não souber ou a pergunta exigir avaliação individual, diga que não sabe e oriente levar à consulta. Nunca invente número, prazo ou estatística.

COMO ESCREVER
- Português do Brasil, em segunda pessoa.
- No máximo 120 palavras. Um parágrafo curto e, se ajudar, até 3 itens de lista.
- Nada de emoji, nada de markdown além de hífen para listas.
- Deixe claro quando algo é estimativa, não certeza.
- Se receber os dados da usuária, use as datas, a semana e os números reais dela na resposta em vez de falar só em teoria. Uma gestante de 32 semanas não deve receber a mesma resposta que uma de 8.`;

/* ---------------------------------------------------------------
   Limitação de uso — defesa simples contra abuso.
   É por instância da função, então não é um limite global rígido;
   serve para conter rajadas. Um limite forte pediria armazenamento
   compartilhado (Vercel KV / Upstash).
   --------------------------------------------------------------- */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((time) => now - time < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear(); // evita crescer sem limite
  return list.length > MAX_PER_WINDOW;
}

/** Monta uma linha de contexto com os números do ciclo, sem dado pessoal. */
export function describeCycle(cycle) {
  if (!cycle || typeof cycle !== 'object') return null;
  const parts = [];
  const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : null);
  // confere o formato E se a data existe de verdade (13/45 não passa)
  const date = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    const real = parsed.getUTCFullYear() === year
      && parsed.getUTCMonth() === month - 1
      && parsed.getUTCDate() === day;
    return real ? value : null;
  };

  if (cycle.phase === 'gravida') {
    if (num(cycle.weeks) !== null) {
      const dias = num(cycle.days);
      parts.push(`está grávida de ${num(cycle.weeks)} semanas${dias ? ` e ${dias} dias` : ''}`);
    }
    if (num(cycle.trimester) !== null) parts.push(`no ${num(cycle.trimester)}º trimestre`);
    if (date(cycle.due)) parts.push(`com data provável do parto em ${date(cycle.due)}`);
    if (cycle.multiple === true) parts.push('é uma gestação múltipla');
  } else if (cycle.phase === 'posparto') {
    if (num(cycle.babyWeeks) !== null) parts.push(`está no pós-parto, com bebê de ${num(cycle.babyWeeks)} semanas`);
  } else {
    if (num(cycle.dayOfCycle) !== null) parts.push(`está no dia ${num(cycle.dayOfCycle)} do ciclo`);
    if (num(cycle.avgLength) !== null) parts.push(`com ciclo médio de ${num(cycle.avgLength)} dias`);
    if (date(cycle.ovulation)) parts.push(`ovulação estimada em ${date(cycle.ovulation)}`);
    if (date(cycle.fertileStart) && date(cycle.fertileEnd)) {
      parts.push(`janela fértil estimada de ${date(cycle.fertileStart)} a ${date(cycle.fertileEnd)}`);
    }
    if (date(cycle.nextPeriod)) parts.push(`próxima menstruação prevista para ${date(cycle.nextPeriod)}`);
    if (num(cycle.cyclesTracked) !== null) parts.push(`${num(cycle.cyclesTracked)} ciclos registrados`);
  }

  if (!parts.length) return null;
  return `Dados do ciclo desta usuária (datas no formato AAAA-MM-DD, todas estimativas do app): ${parts.join('; ')}.`;
}

export function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .slice(-MAX_HISTORY)
    .map((item) => ({ role: item.role, content: item.content.slice(0, MAX_QUESTION) }));
}

/**
 * Procura uma recusa explícita na saída do modelo.
 * A Responses API devolve a recusa como um bloco `refusal` dentro do conteúdo,
 * e não como texto normal — tratar separado evita mostrar a recusa como resposta.
 */
export function findRefusal(response) {
  const items = Array.isArray(response?.output) ? response.output : [];
  for (const item of items) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === 'refusal') return part.refusal || '';
    }
  }
  return null;
}

/** Junta os blocos de texto da resposta. `output_text` é atalho do SDK; o resto é reserva. */
export function extractText(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) {
    return response.output_text.trim();
  }
  const items = Array.isArray(response?.output) ? response.output : [];
  return items
    .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
    .filter((part) => part?.type === 'output_text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: 'ia_indisponivel', detail: 'OPENAI_API_KEY não configurada' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'desconhecido';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'muitas_perguntas' });
  }

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const question = typeof body?.question === 'string' ? body.question.trim() : '';

  if (question.length < 2 || question.length > MAX_QUESTION) {
    return res.status(400).json({ error: 'pergunta_invalida' });
  }

  const cycleLine = describeCycle(body?.cycle);
  const history = sanitizeHistory(body?.history);

  try {
    const client = new OpenAI();

    const response = await client.responses.create({
      model: MODEL,
      instructions: SYSTEM,
      max_output_tokens: MAX_TOKENS,
      reasoning: { effort: EFFORT },
      // o app não guarda a conversa no servidor: o histórico vai no pedido
      store: false,
      input: [
        ...history,
        {
          role: 'user',
          content: cycleLine ? `${cycleLine}\n\nPergunta: ${question}` : question,
        },
      ],
    });

    if (findRefusal(response) !== null) {
      return res.status(422).json({ error: 'recusado' });
    }

    const answer = extractText(response);

    if (!answer) {
      // corte no meio por teto de tokens é diferente de falha do provedor
      const reason = response?.incomplete_details?.reason ?? null;
      return res.status(502).json({ error: 'resposta_vazia', reason });
    }

    return res.status(200).json({
      answer,
      model: response.model ?? MODEL,
      usage: {
        input: response.usage?.input_tokens ?? null,
        output: response.usage?.output_tokens ?? null,
      },
    });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError) {
      return res.status(503).json({ error: 'chave_invalida' });
    }
    if (error instanceof OpenAI.PermissionDeniedError) {
      // chave sem acesso ao modelo, ou conta sem crédito liberado
      return res.status(503).json({ error: 'acesso_negado' });
    }
    if (error instanceof OpenAI.RateLimitError) {
      // a OpenAI também usa 429 para crédito esgotado (insufficient_quota)
      const sem = error?.error?.code === 'insufficient_quota';
      return res.status(sem ? 503 : 429).json({ error: sem ? 'sem_credito' : 'limite_do_provedor' });
    }
    if (error instanceof OpenAI.BadRequestError) {
      return res.status(400).json({ error: 'requisicao_invalida' });
    }
    if (error instanceof OpenAI.APIError) {
      return res.status(502).json({ error: 'erro_do_provedor', status: error.status ?? null });
    }
    console.error('[flor] falha inesperada:', error);
    return res.status(500).json({ error: 'erro_interno' });
  }
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
