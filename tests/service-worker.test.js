import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../sw.js', import.meta.url), 'utf8');

test('service worker inclui o catálogo e a Central de Recursos no shell offline', () => {
  assert.match(source, /florescer-v1\.30\.0/);
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
