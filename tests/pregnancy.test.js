import test from 'node:test';
import assert from 'node:assert/strict';

import { pregnancyCountdown, pregnancyWeekGuide, validateSymptomMeasurements } from '../assets/js/pregnancy.js';

test('monta a contagem regressiva com a quantidade exata de dias', () => {
  assert.equal(pregnancyCountdown(66), 'Faltam 66 dias para você conhecer o amor da sua vida!');
  assert.equal(pregnancyCountdown(1), 'Falta 1 dia para você conhecer o amor da sua vida!');
  assert.equal(pregnancyCountdown(0), 'Hoje é a data prevista para você conhecer o amor da sua vida!');
});

test('pluraliza a contagem regressiva para gestação múltipla', () => {
  assert.equal(pregnancyCountdown(66, true), 'Faltam 66 dias para você conhecer os amores da sua vida!');
  assert.equal(pregnancyCountdown(1, true), 'Falta 1 dia para você conhecer os amores da sua vida!');
  assert.match(pregnancyCountdown(-1, true), /seus bebês podem chegar/);
});

test('apresenta crescimento aproximado da semana', () => {
  const week20 = pregnancyWeekGuide(20);

  assert.equal(week20.fruit, 'banana');
  assert.equal(week20.weight, '300 g');
  assert.equal(week20.length, '25,6 cm');
});

test('usa comparações com frutas ao longo da gestação', () => {
  assert.equal(pregnancyWeekGuide(18).fruit, 'maracujá');
  assert.equal(pregnancyWeekGuide(30).fruit, 'coco grande');
  assert.equal(pregnancyWeekGuide(40).fruit, 'melancia');
});

test('apresenta desenvolvimento, mudanças maternas e dica', () => {
  const guide = pregnancyWeekGuide(28);

  assert.match(guide.development, /cérebro/i);
  assert.match(guide.mother, /terceiro trimestre/i);
  assert.ok(guide.tip.length > 30);
});

test('indica o acompanhamento correspondente à idade gestacional', () => {
  assert.match(pregnancyWeekGuide(12).nextExam.name, /1º trimestre/);
  assert.match(pregnancyWeekGuide(20).nextExam.name, /morfológico do 2º trimestre/);
  assert.match(pregnancyWeekGuide(38).nextExam.when, /semanal/);
});

test('limita a referência de crescimento entre as semanas 4 e 40', () => {
  assert.equal(pregnancyWeekGuide(2).week, 4);
  assert.equal(pregnancyWeekGuide(43).week, 40);
});

test('valida as medições do controle de sintomas', () => {
  assert.equal(validateSymptomMeasurements({ systolicPressure: 120, diastolicPressure: 80, weight: 68.5, glucose: 92 }), null);
  assert.match(validateSymptomMeasurements({ systolicPressure: 120, diastolicPressure: null }), /dois valores/);
  assert.match(validateSymptomMeasurements({ systolicPressure: 70, diastolicPressure: 90 }), /sistólica/);
  assert.match(validateSymptomMeasurements({ weight: 10 }), /Peso/);
  assert.match(validateSymptomMeasurements({ glucose: 700 }), /Glicemia/);
});
