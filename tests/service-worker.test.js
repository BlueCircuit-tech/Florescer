import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');

test('service worker inclui o catálogo e a Central de Recursos no shell offline', () => {
  assert.match(source, /florescer-v1\.45\.0/);
  assert.match(source, /\.\/assets\/js\/pregnancyDiary\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/notices\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/pregnancyDiary\.js/);
  assert.match(source, /\.\/assets\/js\/prenatal\.js/);
  assert.match(source, /\.\/assets\/js\/florAssistant\.js/);
  assert.match(source, /\.\/assets\/js\/florPregnancy\.js/);
  assert.match(source, /\.\/assets\/js\/florProfile\.js/);
  assert.match(source, /\.\/assets\/js\/florVoice\.js/);
  assert.match(source, /\.\/assets\/js\/florDaily\.js/);
  assert.match(source, /\.\/assets\/js\/florMoments\.js/);
  assert.match(source, /\.\/assets\/js\/timeline\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/timeline\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/ebooks\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/florMoment\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/florDaily\.js/);
  assert.match(source, /\.\/assets\/js\/comfort\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/flor\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/comfort\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/prenatal\.js/);
  assert.match(source, /\.\/assets\/js\/features\.js/);
  assert.match(source, /\.\/assets\/js\/fertility\.js/);
  assert.match(source, /\.\/assets\/js\/babyFeeding\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/resources\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/weekByWeek\.js/);
  assert.match(source, /\.\/assets\/js\/screens\/babyFeeding\.js/);
  assert.match(source, /\.\/assets\/js\/communities\.js/);
  assert.match(source, /\.\/assets\/js\/libraries\.js/);
  assert.match(source, /cache\.addAll\(SHELL\)[\s\S]{0,180}\.catch[\s\S]{0,180}throw error/);
});
