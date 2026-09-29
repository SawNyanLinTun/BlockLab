import { LESSONS, UNITS } from '../content/course.js';
import { EXPLAIN, mountSimple } from '../i18n/explain.js';
import { getLang, lt, t, unitTitle } from '../i18n/strings.js';
import { $, esc } from '../lib/util.js';
import { isDone } from '../state/progress.js';
import { TOYS } from '../toys/index.js';
import { arrow, back, check } from './icons.js';
import { setNav } from './nav.js';
import { renderQuiz } from './quiz.js';

/* Lesson */
let spy;
function renderLesson(l) {
  setNav('lesson');
  const i = LESSONS.indexOf(l), prev = LESSONS[i - 1], next = LESSONS[i + 1];
  const unit = UNITS.find(u => u.n === l.unit);
  const STEPS = ['hook', 'try', ...(l.toy === 'caesar' ? ['play'] : []), 'what', ...(EXPLAIN[l.id] ? ['simple'] : []), 'real', 'check'].map(k => [k, t('steps')[k]]);
  $('#app').innerHTML = `
    <div class="lesson">
      <nav class="steps" aria-label="Lesson steps">
        <span class="eyebrow">${t('lesson')} ${l.num} · ${l.min} ${t('min')}</span>
        ${STEPS.map(([id, name]) => `<a href="#l-${l.id}" data-go="${id}"><i></i>${name}</a>`).join('')}
        <a class="back" href="#map">${back} ${t('courseMap')}</a>
      </nav>
      <div class="col">
        <section id="hook">
          <span class="eyebrow">${t('unit')(unit.n)} · ${unitTitle(unit)}${isDone(l.id) ? ' · ' + t('lessonDone') : ''}</span>
          <h1>${lt(l, 'title')}</h1>
          <p class="hook">${esc(lt(l, 'hook'))}</p>
          ${getLang() !== 'en' ? `<p class="lang-note">${t('englishNote')}${EXPLAIN[l.id] ? ' ' + t('englishNoteU1') : ''}</p>` : ''}
        </section>
        <section id="try"><div class="bench"><div class="bench-head"><h2>${getLang() === 'en' ? 'Try it: ' + l.toyTitle.charAt(0).toLowerCase() + l.toyTitle.slice(1) : t('steps').try + ': ' + lt(l, 'toyTitle')}</h2><span class="goal">${t('goal')}: ${lt(l, 'goal')}</span></div><div id="toy" style="display:flex;flex-direction:column;gap:20px;min-width:0"></div></div></section>
        ${l.toy === 'caesar' ? `<section id="play"><h2 class="sec">${t('steps').play}</h2><div id="swap"></div></section>` : ''}
        <section id="what"><h2 class="sec">${t('steps').what}</h2><div class="prose">${l.what.map(p => `<p>${p}</p>`).join('')}</div></section>
        ${EXPLAIN[l.id] ? `<section id="simple"><h2 class="sec">${t('steps').simple}</h2><p style="color:var(--muted);font-size:17px">${t('simpleSub')}</p><div class="simple" id="simple-box"></div></section>` : ''}
        <section id="real"><div class="real"><svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true" style="flex:none"><rect x="2" y="12" width="13" height="12" rx="3"/><rect x="21" y="12" width="13" height="12" rx="3"/><path d="M15 18h6"/></svg><div><h2>${t('steps').real}</h2><p>${l.real}</p></div></div></section>
        <section id="check"><h2 class="sec">${t('steps').check}</h2><div class="quiz" id="quiz"></div></section>
        <div class="lesson-foot">
          ${prev ? `<a class="prev" href="#l-${prev.id}">${back} ${prev.num} ${lt(prev, 'title')}</a>` : `<a class="prev" href="#map">${back} ${t('courseMap')}</a>`}
          <a class="btn" href="${next ? '#l-' + next.id : '#map'}">${next ? `${t('nextBtn')}: ${lt(next, 'title')}` : t('backMap')} ${arrow}</a>
        </div>
      </div>
    </div>`;
  TOYS[l.toy]($('#toy'));
  renderQuiz(l);
  if (EXPLAIN[l.id]) mountSimple(l);
  window.scrollTo(0, 0);
  const links = [...document.querySelectorAll('.steps a[data-go]')];
  links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); document.getElementById(a.dataset.go).scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  const mark = id => { const k = STEPS.findIndex(s => s[0] === id); links.forEach((a, j) => { a.classList.toggle('here', j === k); a.classList.toggle('past', j < k); a.querySelector('i').innerHTML = j < k ? check.replace(/18/g, '14') : ''; if (j === k) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current'); }); };
  mark('hook');
  if (spy) spy.disconnect();
  if ('IntersectionObserver' in window) {
    spy = new IntersectionObserver(es => { const vis = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top); if (vis[0]) mark(vis[0].target.id); }, { rootMargin: '-20% 0px -55% 0px' });
    STEPS.forEach(([id]) => spy.observe(document.getElementById(id)));
  }
}


export { renderLesson };
