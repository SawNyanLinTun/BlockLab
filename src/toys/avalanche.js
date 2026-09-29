import { sha256 } from '../lib/sha256.js';
import { $, bitsOf } from '../lib/util.js';

export function avalanche(root) {
  root.innerHTML = `
    <div class="grid2">
      <div class="field"><label for="v-a">Message A</label><input class="input" id="v-a" value="hello" autocomplete="off"></div>
      <div class="field"><label for="v-b">Message B</label><input class="input" id="v-b" value="Hello" autocomplete="off"></div>
    </div>
    <div class="field"><span class="lbl">Fingerprint A</span><div class="slab" id="v-ha"></div></div>
    <div class="field"><span class="lbl">Fingerprint B · <span style="color:var(--ink)">highlighted characters changed</span></span><div class="slab" id="v-hb"></div></div>
    <div class="field"><span class="lbl">Bits that flipped (256 in total)</span><div class="bits" id="v-bits" aria-hidden="true"></div></div>
    <p class="note" id="v-note"></p>`;
  const upd = () => {
    const a = sha256($('#v-a', root).value), b = sha256($('#v-b', root).value);
    $('#v-ha', root).textContent = a;
    $('#v-hb', root).innerHTML = b.split('').map((c, i) => c === a[i] ? `<span class="same">${c}</span>` : `<span class="diff">${c}</span>`).join('');
    const ba = bitsOf(a), bb = bitsOf(b);
    let flips = 0; const cells = [];
    for (let i = 0; i < 256; i++) { const on = ba[i] !== bb[i]; if (on) flips++; cells.push(`<i class="${on ? 'on' : ''}"></i>`); }
    $('#v-bits', root).innerHTML = cells.join('');
    const chars = b.split('').filter((c, i) => c !== a[i]).length;
    const same = $('#v-a', root).value === $('#v-b', root).value;
    const note = $('#v-note', root);
    note.className = same ? 'note' : 'note win';
    note.innerHTML = same ? 'The messages are the same, so the fingerprints are identical. Change one letter in Message B.' : `<b>${flips} of 256 bits flipped</b> and ${chars} of 64 characters changed. That’s the avalanche.`;
  };
  root.querySelectorAll('input').forEach(el => el.addEventListener('input', upd));
  upd();
}
