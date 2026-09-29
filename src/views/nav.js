import { LESSONS } from '../content/course.js';
import { t } from '../i18n/strings.js';
import { $ } from '../lib/util.js';
import { isDone } from '../state/progress.js';

function updateMeter() {
  const n = LESSONS.filter(l => isDone(l.id)).length;
  $('#meter-text').textContent = t('meter')(n, LESSONS.length);
  $('#meter-fill').style.width = (n / LESSONS.length * 100) + '%';
}

const setNav = view => { [['#nav-course', 'map'], ['#nav-about', 'about']].forEach(([sel, v]) => { const c = $(sel); if (view === v) c.setAttribute('aria-current', 'page'); else c.removeAttribute('aria-current'); }); };

export { setNav, updateMeter };
