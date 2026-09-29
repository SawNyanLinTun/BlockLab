import { t } from '../i18n/strings.js';
import { $ } from '../lib/util.js';
import { setNav } from './nav.js';

/* About me */
function renderAbout() {
  setNav('about');
  const icon = d => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  $('#app').innerHTML = `
    <div class="about">
      <div class="about-body">
        <h1 style="font-size:clamp(38px,5vw,56px)">${t('about')}</h1>
        <section><h2>${t('whyH')}</h2><p>${t('whyP')}</p></section>
        <section><h2>${t('nowH')}</h2><p>${t('nowP')}</p></section>
        <section><h2>${t('futureH')}</h2><ol class="plan">${t('future').map(x => `<li>${x}</li>`).join('')}</ol></section>
      </div>
    </div>`;
}


export { renderAbout };
