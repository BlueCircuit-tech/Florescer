import { diffDays, fromKey, today } from './cycle.js';

export const DEVELOPMENT_MILESTONES = [
  { id: 'first_smile', label: 'Primeiro sorriso', emoji: '😊' },
  { id: 'holds_head', label: 'Sustentou a cabeça', emoji: '🧸' },
  { id: 'first_roll', label: 'Rolou pela primeira vez', emoji: '🔄' },
  { id: 'sits_alone', label: 'Sentou sem apoio', emoji: '🪑' },
  { id: 'first_tooth', label: 'Primeiro dentinho', emoji: '🦷' },
  { id: 'first_crawl', label: 'Engatinhou pela primeira vez', emoji: '🐾' },
  { id: 'stands_alone', label: 'Ficou de pé sem apoio', emoji: '🧍' },
  { id: 'first_word', label: 'Primeira palavra', emoji: '💬' },
  { id: 'first_steps', label: 'Primeiros passos', emoji: '👣' },
  { id: 'first_birthday', label: 'Primeiro aniversário', emoji: '🎂' },
  { id: 'custom', label: 'Outro marco especial', emoji: '✨' },
];

export function developmentMilestone(type) {
  return DEVELOPMENT_MILESTONES.find((milestone) => milestone.id === type) || null;
}

export function saveDevelopmentRecord(state, input, now = Date.now(), ref = today()) {
  const milestone = developmentMilestone(input.milestoneType);
  if (!milestone) throw new Error('Escolha um marco de desenvolvimento.');
  if (!validDate(input.happenedOn)) throw new Error('Informe a data em que o marco aconteceu.');
  if (diffDays(fromKey(input.happenedOn), ref) > 0) throw new Error('A data do marco não pode estar no futuro.');
  if (state.profile?.birthDate && diffDays(fromKey(input.happenedOn), fromKey(state.profile.birthDate)) < 0) {
    throw new Error('A data do marco não pode ser anterior ao nascimento.');
  }

  const babyName = clean(input.babyName, 80) || 'Bebê';
  const title = milestone.id === 'custom' ? clean(input.title, 100) : milestone.label;
  if (!title) throw new Error('Dê um nome para este marco especial.');
  const notes = clean(input.notes, 1000);
  if (!Array.isArray(state.babyDevelopmentRecords)) state.babyDevelopmentRecords = [];

  const existing = input.id
    ? state.babyDevelopmentRecords.find((record) => record.id === input.id)
    : null;
  if (input.id && !existing) throw new Error('Registro de desenvolvimento não encontrado.');
  const duplicate = milestone.id !== 'custom' && state.babyDevelopmentRecords.some((record) => (
    record.id !== input.id && record.babyName === babyName && record.milestoneType === milestone.id
  ));
  if (duplicate) throw new Error(`${milestone.label} já foi registrado para este bebê.`);

  const record = {
    id: existing?.id || `development:${now}`,
    babyName,
    milestoneType: milestone.id,
    title,
    happenedOn: input.happenedOn,
    notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const index = existing ? state.babyDevelopmentRecords.indexOf(existing) : -1;
  if (index >= 0) state.babyDevelopmentRecords[index] = record;
  else state.babyDevelopmentRecords.push(record);
  return record;
}

export function listDevelopmentRecords(state, babyName = null) {
  return (state.babyDevelopmentRecords || [])
    .filter((record) => !babyName || record.babyName === babyName)
    .sort((a, b) => a.happenedOn.localeCompare(b.happenedOn) || a.createdAt - b.createdAt);
}

export function deleteDevelopmentRecord(state, id) {
  if (!Array.isArray(state.babyDevelopmentRecords)) return false;
  const index = state.babyDevelopmentRecords.findIndex((record) => record.id === id);
  if (index < 0) return false;
  state.babyDevelopmentRecords.splice(index, 1);
  return true;
}

function clean(value, max) {
  const text = String(value || '').trim();
  if (text.length > max) throw new Error(`O texto deve ter no máximo ${max} caracteres.`);
  return text;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
