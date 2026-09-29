import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installShim } from './dom-shim.js';
installShim();
const { T, LESSON_TR, UNIT_TR } = await import('../src/i18n/strings.js');
const { EXPLAIN } = await import('../src/i18n/explain.js');
const { LESSONS } = await import('../src/content/course.js');

test('every lesson has 3 quiz questions with a valid answer', () => {
  for (const l of LESSONS) {
    assert.equal(l.quiz.length, 3, l.id);
    for (const q of l.quiz) assert.ok(q.a >= 0 && q.a < q.o.length, `${l.id}: ${q.q}`);
  }
});

test('Thai and Burmese have every interface string English has', () => {
  for (const lang of ['th', 'my']) {
    for (const k of Object.keys(T.en)) if (k !== 'englishNote') assert.ok(k in T[lang], `${lang} is missing "${k}"`);
    for (const k of Object.keys(T.en.steps)) assert.ok(T[lang].steps[k], `${lang} is missing step "${k}"`);
  }
});

test('every lesson and unit is translated into Thai and Burmese', () => {
  for (const lang of ['th', 'my']) {
    for (const l of LESSONS) for (const f of ['title', 'hook', 'toyTitle', 'goal']) assert.ok(LESSON_TR[lang][l.id]?.[f], `${lang} ${l.id} ${f}`);
    for (const n of [1, 2, 3, 4, 5, 6]) assert.ok(UNIT_TR[lang][n], `${lang} unit ${n}`);
  }
});

test('"Explained simply" exists in all three languages', () => {
  for (const [id, e] of Object.entries(EXPLAIN)) for (const lang of ['en', 'th', 'my']) assert.ok(e[lang]?.length, `${id} ${lang}`);
});
