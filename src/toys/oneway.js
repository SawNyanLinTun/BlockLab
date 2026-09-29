import { sha256 } from '../lib/sha256.js';
import { $ } from '../lib/util.js';

export function oneway(root) {
  const target = sha256('hello');
  const HEX = '0123456789abcdef';
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      <p><b>Part 1.</b> Which word makes this fingerprint?</p>
      <div class="slab">${target}</div>
      <div class="grid2">
        <div class="field"><label for="o-guess">Your guess</label><input class="input" id="o-guess" autocomplete="off" placeholder="Type a word"></div>
        <div class="field"><span class="lbl">Its fingerprint</span><div class="slab" id="o-gh" style="font-size:14px"></div></div>
      </div>
      <p class="note" id="o-note">Guesses so far: 0. Hint: it’s the first word we hashed, all lowercase.</p>
    </div>
    <hr class="dash">
    <div style="display:flex;flex-direction:column;gap:14px">
      <p><b>Part 2: The hash slot machine.</b> Each pull adds the next number to the word <span class="mono">BlockLab</span> and makes a new fingerprint. You win when it starts with <span class="mono">00</span>.</p>
      <div class="slots">
        <div class="slot-top"><b>Hash slot machine</b><span>Jackpot = 0 0</span></div>
        <div class="reels" aria-hidden="true"><div class="reel" id="o-r1">?</div><div class="reel" id="o-r2">?</div></div>
        <div class="slab" style="font-size:14px"><span class="same">BlockLab</span><span id="o-n">0</span> → <span id="o-mh">pull the lever to start</span></div>
        <div class="row">
          <button type="button" class="btn" id="o-one">Pull the lever</button>
          <button type="button" class="btn small ghost" id="o-many">Auto-spin 50</button>
          <span class="tries">Tries: <span id="o-tries" class="mono">0</span></span>
        </div>
      </div>
      <p class="note" id="o-note2" role="status">Each pull is a brand-new guess. There’s no shortcut.</p>
    </div>`;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let guesses = 0, n = 0, tries = 0, found = false, busy = false;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const setReels = (a, b, spinning) => {
    const r1 = $('#o-r1', root), r2 = $('#o-r2', root);
    r1.textContent = a; r2.textContent = b;
    r1.className = 'reel' + (spinning ? ' spin' : a === '0' ? ' hit' : '');
    r2.className = 'reel' + (spinning ? ' spin' : b === '0' ? ' hit' : '');
  };
  const lock = on => { busy = on; $('#o-one', root).disabled = on; $('#o-many', root).disabled = on; };
  const pull = async frames => {
    if (found) { found = false; tries = 0; n = Math.floor(Math.random() * 100000); $('#o-note2', root).className = 'note'; $('#o-note2', root).textContent = 'New hunt! Each pull is a brand-new guess.'; }
    n++; tries++;
    const h = sha256('BlockLab' + n);
    if (!reduce) for (let f = 0; f < frames; f++) { setReels(HEX[Math.random() * 16 | 0], HEX[Math.random() * 16 | 0], true); await sleep(40); }
    setReels(h[0], h[1], false);
    $('#o-n', root).textContent = n;
    $('#o-mh', root).innerHTML = h.startsWith('00') ? `<span class="diff">00</span>${h.slice(2)}` : h;
    $('#o-tries', root).textContent = tries;
    if (h.startsWith('00')) {
      found = true;
      const note = $('#o-note2', root);
      note.className = 'note win';
      note.innerHTML = `<b>Jackpot after ${tries} ${tries === 1 ? 'try' : 'tries'}!</b> On average it takes about 256. Bitcoin miners play this same game, with far more zeros. Pull again to start a new hunt.`;
    }
    return found;
  };
  $('#o-one', root).addEventListener('click', async () => { if (busy) return; lock(true); await pull(8); lock(false); });
  $('#o-many', root).addEventListener('click', async () => {
    if (busy) return; lock(true);
    if (found) await pull(2);
    if (!found) for (let i = 0; i < 50; i++) { if (!root.isConnected) break; if (await pull(2)) break; }
    lock(false);
  });
  $('#o-guess', root).addEventListener('change', e => {
    const g = e.target.value; if (!g) return;
    guesses++;
    const h = sha256(g); $('#o-gh', root).textContent = h;
    const note = $('#o-note', root);
    if (h === target) { note.className = 'note win'; note.innerHTML = `<b>Got it in ${guesses} ${guesses === 1 ? 'guess' : 'guesses'}!</b> You found it by guessing, not by running the machine backwards. That’s the only way.`; }
    else { note.className = 'note'; note.textContent = `Guesses so far: ${guesses}. No match. Hint: it’s the first word we hashed, all lowercase.`; }
  });
  $('#o-guess', root).addEventListener('keydown', e => { if (e.key === 'Enter') e.target.dispatchEvent(new Event('change')); });
}
