/**
 * Linha do tempo da jornada.
 *
 * Reúne sozinha os marcos que já estão espalhados pelo app — início da
 * tentativa, teste positivo, ultrassons, descoberta do sexo, nascimento,
 * primeiro banho, sorriso, passos — sem pedir que ela registre nada de novo.
 * Tudo aqui é leitura: nenhuma função deste arquivo escreve no estado.
 *
 * A regra de ouro é a mesma do resto do app: a linha do tempo é **dela**.
 * Por isso os marcos da mãe (começar a tentar, descobrir, virar mãe) têm o
 * mesmo peso visual dos marcos do bebê, e a fase de cada um fica explícita.
 */
import {
  diffDays, fmtLong, fromKey, pregnancyInfo, toKey, today,
} from './cycle.js';
import { CALENDAR_TYPES } from './planner.js';
import { developmentMilestone } from './development.js';
import { babyNamesFromProfile, formatBabyNames } from './babies.js';

export const TIMELINE_GROUPS = {
  tentativa: { label: 'Tentando engravidar', tone: 'leaf' },
  gestacao: { label: 'Gestação', tone: 'rose' },
  bebe: { label: 'Com o bebê', tone: 'lilac' },
};

const SEX_LABEL = { menina: 'É uma menina', menino: 'É um menino' };

/** Um marco só entra se tiver data de verdade. */
function entry(list, { id, date, group, icon, title, note, photo = null, aliases = [] }) {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const parsed = fromKey(date);
  if (Number.isNaN(parsed.getTime())) return;
  list.push({ id, date, at: parsed.getTime(), label: fmtLong(parsed), group, icon, title, note, photo, aliases });
}

/**
 * Todos os marcos, do mais antigo para o mais recente.
 * @returns {{items:Array, counts:object, span:object|null}}
 */
export function journeyTimeline(state, ref = today()) {
  const profile = state?.profile || {};
  const items = [];
  const hoje = toKey(ref);
  const futuro = (date) => date > hoje;

  /* ---------- tentativa ---------- */
  const inicio = profile.startedTryingAt
    || (state?.createdAt ? toKey(new Date(state.createdAt)) : null);
  if (inicio && !futuro(inicio)) {
    entry(items, {
      id: 'inicio', date: inicio, group: 'tentativa', icon: 'seed',
      title: 'O começo desta jornada',
      note: profile.startedTryingAt ? 'quando você começou a tentar' : 'seu primeiro dia no Florescer',
    });
  }

  const testes = (state?.pregnancyTests || []).filter((t) => t?.date && !futuro(t.date));
  const positivo = testes.filter((t) => t.result === 'positivo').sort((a, b) => a.date.localeCompare(b.date))[0];
  if (positivo) {
    entry(items, {
      id: 'teste-positivo', date: positivo.date, group: 'tentativa', icon: 'test',
      title: 'Teste positivo', note: 'o dia em que você descobriu',
    });
  }

  /* ---------- gestação ---------- */
  const preg = pregnancyInfo(state, ref);
  const nomes = babyNamesFromProfile(profile);
  const bebe = nomes.length ? formatBabyNames(nomes) : 'o bebê';

  // ultrassons já realizados: a data passou e o compromisso existiu
  for (const event of state?.calendarEvents || []) {
    if (event?.phase !== 'gravida' || event.type !== 'ultrasound') continue;
    if (!event.date || futuro(event.date)) continue;
    entry(items, {
      id: `usg-${event.id}`, date: event.date, group: 'gestacao', icon: 'heartFill',
      title: event.title || CALENDAR_TYPES.ultrasound.label,
      note: preg.known ? `${semanaEm(preg, event.date)} de gestação` : 'ultrassom realizado',
    });
  }

  if (profile.babySex && SEX_LABEL[profile.babySex] && profile.babySexAt && !futuro(profile.babySexAt)) {
    entry(items, {
      id: 'sexo', date: profile.babySexAt, group: 'gestacao', icon: 'sparkle',
      title: SEX_LABEL[profile.babySex], note: 'o dia em que vocês souberam',
    });
  }

  // as fotos da barriga contam a gestação sem precisar de texto
  for (const [key, log] of Object.entries(state?.logs || {})) {
    const fotos = Array.isArray(log?.bumpPhotos) ? log.bumpPhotos : [];
    if (!fotos.length || futuro(key)) continue;
    entry(items, {
      id: `barriga-${key}`, date: key, group: 'gestacao', icon: 'pregnant',
      title: 'Foto da barriga',
      note: preg.known ? `${semanaEm(preg, key)} de gestação` : 'guardada no diário',
      photo: fotos[0],
    });
  }

  /* ---------- bebê ---------- */
  if (profile.birthDate && !futuro(profile.birthDate)) {
    entry(items, {
      id: 'nascimento', date: profile.birthDate, group: 'bebe', icon: 'baby',
      title: nomes.length ? `${bebe} nasceu` : 'O nascimento',
      note: 'e também nasceu uma mãe',
      // o app registra "Meu bebê nasceu" na jornada; é o mesmo fato
      aliases: ['nasceu', 'nasceram', 'nascimento'],
    });
  }

  for (const record of state?.babyDevelopmentRecords || []) {
    const milestone = developmentMilestone(record?.milestoneType);
    if (!record?.happenedOn || futuro(record.happenedOn)) continue;
    const titulo = record.milestoneType === 'custom' && record.title ? record.title : milestone?.label;
    if (!titulo) continue;
    entry(items, {
      id: `dev-${record.id}`, date: record.happenedOn, group: 'bebe',
      icon: milestone?.icon || 'bookmark', title: titulo,
      note: record.babyName && nomes.length > 1 ? record.babyName : (record.note || ''),
    });
  }

  /* ---------- o que ela mesma marcou ---------- */
  for (const marco of state?.journey || []) {
    if (!marco?.at || !marco.title) continue;
    const date = toKey(new Date(marco.at));
    if (futuro(date)) continue;
    // O que já foi reunido automaticamente não entra duas vezes. A janela de
    // um dia cobre tanto marcos gravados em UTC (que viram a véspera no
    // horário local) quanto ela ter anotado com um dia de diferença.
    const repetido = items.some((item) => Math.abs(diffDays(fromKey(item.date), fromKey(date))) <= 1
      && (semelhante(item.title, marco.title)
        || (item.aliases || []).some((alias) => normal(marco.title).includes(alias))));
    if (repetido) continue;
    entry(items, {
      id: `jornada-${marco.at}`, date, group: grupoDoMarco(marco, profile),
      icon: 'flower', title: marco.title, note: marco.note || '',
    });
  }

  items.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));

  const counts = items.reduce((acc, item) => ({ ...acc, [item.group]: (acc[item.group] || 0) + 1 }), {});
  const span = items.length
    ? {
      from: items[0].label,
      to: items[items.length - 1].label,
      days: diffDays(fromKey(items[items.length - 1].date), fromKey(items[0].date)),
    }
    : null;

  return { items, counts, span };
}

/** "22 semanas" na data de um marco, a partir da DPP. */
function semanaEm(preg, date) {
  const dum = new Date(preg.due.getTime() - 280 * 86400000);
  const semanas = Math.floor(diffDays(fromKey(date), dum) / 7);
  return semanas >= 0 && semanas <= 45 ? `${semanas} semanas` : 'durante a gestação';
}

const normal = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const semelhante = (a, b) => {
  const x = normal(a);
  const y = normal(b);
  return x === y || x.includes(y) || y.includes(x);
};

function grupoDoMarco(marco, profile) {
  const texto = normal(marco.title);
  if (/nasc|bebe|amamenta|fralda|vacina|puerperio/.test(texto)) return 'bebe';
  if (/gravid|gesta|pre-natal|pre natal|barriga/.test(texto)) return 'gestacao';
  if (profile.birthDate && marco.at >= fromKey(profile.birthDate).getTime()) return 'bebe';
  return 'tentativa';
}
