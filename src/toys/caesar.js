import { $, A, shift } from '../lib/util.js';
import { mountSwap } from '../views/swap.js';

export function caesar(root) {
  const secret = 'MEET ME AT LUNCH', friendKey = 5, coded = shift(secret, friendKey);
  root.innerHTML = `
    <div class="wheel-wrap">
      <svg class="wheel" id="wheel" viewBox="0 0 300 300" role="img" aria-label="Cipher wheel"></svg>
      <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
        <div class="field"><label for="c-key">Key (shift): <span id="c-keyv" class="mono">3</span></label><input type="range" id="c-key" min="1" max="25" value="3"></div>
        <div class="field"><label for="c-msg">Your message</label><input class="input" id="c-msg" value="Hello friend" maxlength="40" autocomplete="off"></div>
        <div class="tiles" id="c-tiles" aria-hidden="true"></div>
        <div class="field"><span class="lbl">Encrypted</span><div class="slab" id="c-out"></div></div>
      </div>
    </div>
    <hr style="border:none;border-top:1.5px dashed var(--line);margin:0">
    <div style="display:flex;flex-direction:column;gap:12px">
      <p><b>Your friend passed you this note.</b> Find the key they used to read it.</p>
      <div class="slab" style="font-size:20px;letter-spacing:.08em">${coded}</div>
      <div class="grid2">
        <div class="field"><label for="c-fkey">Try a key: <span id="c-fkeyv" class="mono">1</span></label><input type="range" id="c-fkey" min="1" max="25" value="1"></div>
        <div class="field"><span class="lbl">Decrypted with that key</span><div class="slab" id="c-dec"></div></div>
      </div>
      <p class="note" id="c-note">Slide the key until the note makes sense.</p>
    </div>
`;
  const wheel = $('#wheel', root);
  let ring = `<circle cx="150" cy="150" r="146" fill="var(--paper)" stroke="var(--ink)" stroke-width="2.5"/><circle cx="150" cy="150" r="104" fill="var(--amber-soft)" stroke="var(--ink)" stroke-width="2"/>`;
  ring += `<circle cx="150" cy="24" r="15" fill="var(--amber)" stroke="var(--ink)" stroke-width="2"/><circle cx="150" cy="66" r="15" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><path d="M150 40v10" stroke="var(--ink)" stroke-width="2.5"/>`;
  for (let i = 0; i < 26; i++) { const ang = (i / 26) * Math.PI * 2 - Math.PI / 2; ring += `<text x="${150 + Math.cos(ang) * 126}" y="${150 + Math.sin(ang) * 126 + 5}" text-anchor="middle" font-size="14" fill="${i === 0 ? '#1B2440' : 'var(--ink)'}">${A[i]}</text>`; }
  let inner = '';
  for (let i = 0; i < 26; i++) { const ang = (i / 26) * Math.PI * 2 - Math.PI / 2; inner += `<text x="${150 + Math.cos(ang) * 84}" y="${150 + Math.sin(ang) * 84 + 5}" text-anchor="middle" font-size="14" fill="var(--teal)">${A[i]}</text>`; }
  wheel.innerHTML = ring + `<g class="inner" id="c-inner">${inner}</g><circle cx="150" cy="150" r="62" fill="var(--card)" stroke="var(--ink)" stroke-width="2"/><text x="150" y="144" text-anchor="middle" font-size="12" fill="var(--muted)" style="font-family:var(--body)">key</text><text x="150" y="174" text-anchor="middle" font-size="30" fill="var(--ink)" id="c-center">3</text>`;
  const draw = k => { $('#c-inner', root).style.transform = `rotate(${-k * 360 / 26}deg)`; $('#c-center', root).textContent = k; };
  const upd = () => {
    const k = +$('#c-key', root).value;
    $('#c-keyv', root).textContent = k; draw(k);
    $('#c-out', root).textContent = shift($('#c-msg', root).value, k) || ' ';
    $('#c-tiles', root).innerHTML = $('#c-msg', root).value.toUpperCase().slice(0, 24).split('').map(ch => /[A-Z]/.test(ch) ? `<div class="tile"><span>${ch}</span><span>${shift(ch, k)}</span></div>` : `<div class="tile gap"></div>`).join('');
    const fk = +$('#c-fkey', root).value;
    $('#c-fkeyv', root).textContent = fk;
    const dec = shift(coded, -fk);
    $('#c-dec', root).textContent = dec;
    const note = $('#c-note', root);
    if (fk === friendKey) { note.className = 'note win'; note.innerHTML = `<b>Cracked it!</b> The key was ${friendKey}. The note says: ${secret}.`; }
    else { note.className = 'note'; note.textContent = 'Slide the key until the note makes sense.'; }
  };
  root.querySelectorAll('input').forEach(el => el.addEventListener('input', upd));
  upd();
  if ($('#swap')) mountSwap($('#swap'));
}
