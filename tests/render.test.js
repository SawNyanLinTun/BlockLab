import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installShim, handlers } from './dom-shim.js';
const els = installShim();

const { setSiteLang, setExplainLang, T, lt } = await import('../src/i18n/strings.js');
const { LESSONS } = await import('../src/content/course.js');
const { renderHome } = await import('../src/views/home.js');
const { renderMap } = await import('../src/views/map.js');
const { renderAbout } = await import('../src/views/about.js');
const { renderLesson } = await import('../src/views/lesson.js');
const { chainBlocks } = await import('../src/views/chain.js');
const { markDone, resetProgress } = await import('../src/state/progress.js');

for (const lang of ['en', 'th', 'my']) {
  test(`every page and toy renders in ${lang}`, () => {
    setSiteLang(lang); setExplainLang(lang);
    renderHome(); assert.ok(els['#app'].innerHTML.includes(T[lang].h1));
    renderMap(); assert.ok(els['#app'].innerHTML.includes(T[lang].mapH));
    renderAbout(); assert.ok(els['#app'].innerHTML.includes(T[lang].futureH));
    for (const l of LESSONS) { renderLesson(l); assert.ok(els['#app'].innerHTML.includes(lt(l, 'title')), l.id); }
  });
  test(`every button, slider and input handler runs in ${lang}`, async () => {
    setSiteLang(lang); setExplainLang(lang);
    for (const view of [renderHome, renderMap, renderAbout, ...LESSONS.map(l => () => renderLesson(l))]) {
      handlers.length = 0;
      view();
      for (const h of [...handlers]) {
        const ev = { type: h.type, target: h.el, currentTarget: h.el, key: 'ArrowRight', clientX: 10, clientY: 10, pointerId: 1, preventDefault() {} };
        await h.fn(ev);
      }
    }
  });
}

test('the chain grows by one mined block per finished lesson', () => {
  resetProgress();
  assert.equal(chainBlocks().length, 1);
  markDone('1-1'); markDone('1-2');
  const blocks = chainBlocks();
  assert.equal(blocks.length, 3);
  for (const b of blocks) assert.ok(b.hash.startsWith('00'), 'every block is mined');
  resetProgress();
});

test('the app boots from main.js', async () => {
  await import('../src/main.js');
  assert.ok(els['#app'].innerHTML.length > 0);
});
