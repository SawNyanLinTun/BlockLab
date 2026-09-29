import { LESSONS, MISSIONS, nextLesson } from '../content/course.js';
import { lt, t, unitBlurb, unitTitle } from '../i18n/strings.js';
import { $ } from '../lib/util.js';
import { isDone } from '../state/progress.js';
import { mountChain } from './chain.js';
import { arrow } from './icons.js';
import { setNav } from './nav.js';

/* Home */
function renderHome() {
  setNav('home');
  const n = LESSONS.filter(l => isDone(l.id)).length, nx = nextLesson();
  $('#app').innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <span class="tag">${t('tag')}</span>
        <h1>${t('h1')}</h1>
        <p class="lede">${t('lede')}</p>
        <div class="cta">
          <a class="btn" href="#l-${(nx || LESSONS[0]).id}">${n === 0 ? t('start1') : nx ? `${t('cont')}: ${nx.num} ${lt(nx, 'title')}` : t('replay')} ${arrow}</a>
          <a class="btn ghost" href="#map">${t('seeMap')}</a>
        </div>
      </div>
      <div class="chain">
        <button type="button" class="stage" id="stage" aria-label="A 3D chain of blocks. Drag it, or use the arrow keys, to look around."><div class="world" id="world"></div></button>
        <div class="chain-ctl">
          <span class="chain-count">${t('chainYours')(LESSONS.filter(l => isDone(l.id)).length + 1)}</span>
          <span>${t('chainHint')}</span>
        </div>
      </div>
    </section>
    <section style="display:flex;flex-direction:column;gap:28px">
      <div class="section-head"><h2>${t('missions')}</h2><a href="#map" style="font-weight:700">${t('fullMap')}</a></div>
      <div class="missions">${MISSIONS.map(m => {
        const ls = LESSONS.filter(l => l.unit === m.n), d = ls.filter(l => isDone(l.id)).length;
        const inner = `<span class="eyebrow ${m.live ? '' : 'dim'}">${t('unit')(m.n)} · ${t('lessonsN')(m.count)}</span><h3>${unitTitle(m)}</h3><p>${unitBlurb(m)}</p><span class="foot">${m.live ? (d === m.count ? t('doneBadge') : d ? t('xDone')(d, m.count) : t('openNow')) : t('soon')}</span>`;
        return m.live ? `<a class="mission" href="#l-${(ls.find(l => !isDone(l.id)) || ls[0]).id}">${inner}</a>` : `<div class="mission soon">${inner}</div>`;
      }).join('')}</div>
    </section>
    <section class="safety">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#F2B441" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="M22 4l15 6v10c0 10-6.5 16.5-15 20C13.5 36.5 7 30 7 20V10z"/><path d="M15 22l5 5 9-10"/></svg>
      <div style="flex:1;min-width:220px"><h3>${t('safetyH')}</h3><p>${t('safetyP')}</p></div>
    </section>
    <footer class="site-foot"><span>${t('foot1')}</span><span>${t('foot2')}</span></footer>`;
  mountChain();
}


export { renderHome };
