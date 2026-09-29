import { LESSONS, MISSIONS, nextLesson, unitDone } from '../content/course.js';
import { lt, t, unitTitle } from '../i18n/strings.js';
import { $, esc } from '../lib/util.js';
import { isDone, resetProgress } from '../state/progress.js';
import { BADGE_ICONS, arrow, check, lockIcon } from './icons.js';
import { setNav, updateMeter } from './nav.js';

/* Course map */
function renderMap() {
  setNav('map');
  const n = LESSONS.filter(l => isDone(l.id)).length, nx = nextLesson();
  const rows = MISSIONS.map(m => {
    const ls = LESSONS.filter(l => l.unit === m.n);
    if (!m.live) {
      const nums = Array.from({ length: m.count }, (_, i) => `${m.n}.${i + 1}`);
      const nodes = nums.map((x, i) => (m.n === 6 && i === nums.length - 1) ? `<span class="node vault">${lockIcon}${x} ${t('vault')}</span>` : `<span class="node">${x}</span>`);
      return `<div class="urow soon"><div class="uname"><span class="eyebrow dim">${t('unit')(m.n)} · ${t('afterPilot')}</span><h2>${unitTitle(m)}</h2></div><div class="track">${nodes.join('<span class="link"></span>')}</div><span class="count">0 / ${m.count}</span></div>`;
    }
    const d = ls.filter(l => isDone(l.id)).length;
    const cur = nx && nx.unit === m.n;
    const nodes = ls.map(l => {
      if (isDone(l.id)) return `<a class="node done" href="#l-${l.id}" aria-label="${t('lesson')} ${l.num} ${esc(lt(l, 'title'))}, ${t('stDone')}">${check}</a>`;
      if (nx && nx.id === l.id) return `<a class="node next" href="#l-${l.id}"><i>${l.num}</i>${t('next')}: ${lt(l, 'title')}</a>`;
      return `<a class="node" href="#l-${l.id}" aria-label="${t('lesson')} ${l.num} ${esc(lt(l, 'title'))}">${l.num}</a>`;
    });
    const joined = nodes.map((x, i) => i === 0 ? x : `<span class="link ${isDone(ls[i].id) || (nx && nx.id === ls[i].id) ? 'on' : ''}"></span>${x}`).join('');
    return `<div class="urow ${cur ? 'current' : ''}"><div class="uname"><span class="eyebrow">${t('unit')(m.n)} · ${d === ls.length ? t('stDone') : cur ? t('stProg') : t('stOpen')}</span><h2>${unitTitle(m)}</h2></div><div class="track">${joined}</div><span class="count">${d} / ${ls.length}</span></div>`;
  }).join('');
  const badges = [['Codebreaker', unitDone(1)], ['Hash hero', unitDone(2)], ['Key keeper', false]];
  $('#app').innerHTML = `
    <div class="map">
      <div class="rows"><h1>${t('mapH')}</h1>${rows}</div>
      <aside class="side">
        <div class="progress-card">
          <span style="font-weight:700;color:var(--slab-dim)">${t('progress')}</span>
          <span class="big">${t('meter')(n, LESSONS.length)}</span>
          <div class="pbar"><i style="width:${n / LESSONS.length * 100}%"></i></div>
          <small>${t('progNote')}</small>
          ${nx ? `<a class="btn small" href="#l-${nx.id}" style="background:#F2B441;border-color:#F2B441;color:#1B2440;box-shadow:none">${n ? t('cont') : t('startBtn')} ${nx.num} ${arrow}</a>` : ''}
        </div>
        <div class="badges"><h3>${t('badges')}</h3>
          <div class="badge-grid">${badges.map(([name, won]) => `<div class="badge ${won ? 'won' : ''}"><i>${BADGE_ICONS[name]}</i>${t(name)}</div>`).join('')}</div>
          <span id="reset-area"><button class="linkbtn" id="reset">${t('reset')}</button></span>
        </div>
      </aside>
    </div>`;
  $('#reset').addEventListener('click', () => {
    $('#reset-area').innerHTML = `<span class="confirm">${t('resetQ')} <button class="btn small" id="reset-yes">${t('erase')}</button><button class="btn small ghost" id="reset-no">${t('keep')}</button></span>`;
    $('#reset-yes').onclick = () => { resetProgress(); updateMeter(); renderMap(); };
    $('#reset-no').onclick = () => renderMap();
  });
}


export { renderMap };
