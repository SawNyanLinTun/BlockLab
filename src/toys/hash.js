import { sha256 } from '../lib/sha256.js';
import { $ } from '../lib/util.js';

export function hash(root) {
  const gear = (teeth, r) => {
    const pts = [];
    for (let k = 0; k < teeth * 4; k++) { const a = k / (teeth * 4) * Math.PI * 2, rad = (k % 4 < 2) ? r : r * 0.78; pts.push(`${(32 + Math.cos(a) * rad).toFixed(1)} ${(32 + Math.sin(a) * rad).toFixed(1)}`); }
    return `M${pts.join('L')}Z M40 32a8 8 0 1 0 -16 0a8 8 0 1 0 16 0Z`;
  };
  const lines = h => h.match(/.{1,16}/g).join('\n');
  root.innerHTML = `
    <div class="machine" id="h-mach">
      <div class="hopper"><label for="h-in">Feed the machine: type anything</label><input class="input" id="h-in" value="hello" autocomplete="off"></div>
      <div class="funnel" aria-hidden="true"></div>
      <div class="mbody" aria-hidden="true">
        <svg class="gear g1" viewBox="0 0 64 64"><path d="${gear(10, 30)}" fill="#F2B441" fill-rule="evenodd" stroke="#0B1020" stroke-width="2"/></svg>
        <div class="mlabel"><b>SHA-256</b><span class="lights"><i></i><i></i><i></i></span></div>
        <svg class="gear g2" viewBox="0 0 64 64"><path d="${gear(8, 30)}" fill="#7CC4B8" fill-rule="evenodd" stroke="#0B1020" stroke-width="2"/></svg>
      </div>
      <div class="mslot" aria-hidden="true"></div>
      <div class="receipt" id="h-rcpt"><span class="rc-top">FINGERPRINT · <span id="h-len">64</span> CHARACTERS</span><div class="rc-hash" id="h-out" aria-live="polite"></div></div>
    </div>
    <div class="row" role="group" aria-label="Try these" style="justify-content:center">
      <button class="btn small ghost" data-t="hello">hello</button>
      <button class="btn small ghost" data-t="Hello">Hello</button>
      <button class="btn small ghost" data-t="">Nothing at all</button>
      <button class="btn small ghost" data-t="Once upon a time, in a village between two rivers, there lived a girl who could read any code she found. One day she found a note that no one else could read.">A whole story</button>
    </div>
    <hr class="dash">
    <p><b>Challenge:</b> make this second machine print the <i>exact same</i> fingerprint as the first one.</p>
    <div class="grid2" style="align-items:start">
      <div class="field"><label for="h-in2">Second machine</label><input class="input" id="h-in2" value="" autocomplete="off" placeholder="Type here"></div>
      <div class="receipt small" id="h-rcpt2"><span class="rc-top">FINGERPRINT</span><div class="rc-hash" id="h-out2"></div><div class="stamp" id="h-stamp" hidden>MATCH!</div></div>
    </div>
    <p class="note" id="h-note">The fingerprints don’t match yet.</p>`;
  let runT;
  const run = el => { el.classList.remove('print'); void el.offsetWidth; el.classList.add('print'); };
  const upd = (which) => {
    const a = $('#h-in', root).value, b = $('#h-in2', root).value;
    const ha = sha256(a), hb = sha256(b);
    $('#h-out', root).textContent = lines(ha); $('#h-len', root).textContent = ha.length;
    $('#h-out2', root).textContent = lines(hb);
    if (which === 1) { const m = $('#h-mach', root); m.classList.add('run'); clearTimeout(runT); runT = setTimeout(() => m.classList.remove('run'), 750); run($('#h-rcpt', root)); }
    if (which === 2) run($('#h-rcpt2', root));
    const note = $('#h-note', root), match = ha === hb;
    $('#h-stamp', root).hidden = !match;
    if (match) { note.className = 'note win'; note.innerHTML = '<b>They match!</b> The only way was to type exactly the same thing. Same input, same fingerprint.'; }
    else { note.className = 'note'; note.textContent = 'The fingerprints don’t match yet.'; }
  };
  $('#h-in', root).addEventListener('input', () => upd(1));
  $('#h-in2', root).addEventListener('input', () => upd(2));
  root.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => { $('#h-in', root).value = b.dataset.t; upd(1); }));
  upd(0);
}
