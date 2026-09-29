import { byId } from './content/course.js';
import { getLang, setExplainLang, setSiteLang, t } from './i18n/strings.js';
import { $ } from './lib/util.js';
import { renderAbout } from './views/about.js';
import { renderHome } from './views/home.js';
import { renderLesson } from './views/lesson.js';
import { renderMap } from './views/map.js';
import { updateMeter } from './views/nav.js';

function applyLang() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('.langs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));
  $('#nav-course').textContent = t('course');
  $('#nav-about').textContent = t('about');
}
function setLang(code) {
  setSiteLang(code); setExplainLang(code);
  applyLang(); route();
}


/* ---------- Router ---------- */
function route() {
  const h = location.hash.replace('#', '');
  const m = h.match(/^l-(\d-\d)$/);
  const l = m && byId(m[1]);
  if (l) renderLesson(l); else if (h === 'map') { renderMap(); window.scrollTo(0, 0); } else if (h === 'about') { renderAbout(); window.scrollTo(0, 0); } else { renderHome(); window.scrollTo(0, 0); }
  updateMeter();
}
window.addEventListener('hashchange', route);
document.querySelectorAll('.langs button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
applyLang();
route();
