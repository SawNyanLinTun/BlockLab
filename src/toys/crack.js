import { $, A, shift } from '../lib/util.js';

export function crack(root) {
  const key = 7, coded = shift('THIS IS EASY', key);
  const longMsg = 'MEET ME AT THE TREE NEAR THE GREEN GATE AT SEVEN', longKey = 4, longCoded = shift(longMsg, longKey);
  const counts = {}; for (const c of longCoded.replace(/[^A-Z]/g, '')) counts[c] = (counts[c] || 0) + 1;
  const max = Math.max(...Object.values(counts));
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:12px">
      <p><b>Part 1.</b> Here is every possible key applied to <span class="mono">${coded}</span>. Click the one that reads like English.</p>
      <div class="shifts" id="k-list">${Array.from({ length: 25 }, (_, i) => `<button class="shift" data-k="${i + 1}"><small>${i + 1}</small><span>${shift(coded, -(i + 1))}</span></button>`).join('')}</div>
      <p class="note" id="k-note">Tries so far: 0</p>
    </div>
    <hr style="border:none;border-top:1.5px dashed var(--line);margin:0">
    <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
      <p><b>Part 2.</b> A longer note is harder to scan by eye. Count the letters instead: the tallest bar is probably E in disguise.</p>
      <div class="slab" style="letter-spacing:.06em">${longCoded}</div>
      <div class="freq" role="img" aria-label="Letter counts in the note">${A.split('').map(c => `<div><i class="${counts[c] === max ? 'top' : ''}" style="height:${(counts[c] || 0) / max * 100}%"></i><span>${c}</span></div>`).join('')}</div>
      <div class="grid2">
        <div class="field"><label for="k-guess">Which letter stands for E?</label><input class="input" id="k-guess" maxlength="1" autocomplete="off" placeholder="?"></div>
        <div class="field"><span class="lbl">Result</span><div class="slab" id="k-res">Type one letter</div></div>
      </div>
    </div>
    <hr class="dash">
    <div style="display:flex;flex-direction:column;gap:14px">
      <p><b>Part 3: Codebreaker race.</b> Crack 5 secret notes as fast as you can. Slide the key until the note makes sense, and the next one appears.</p>
      <div class="row">
        <button type="button" class="btn small" id="r-start">Start the race</button>
        <span class="stat" id="r-time" style="font-size:30px" aria-live="off">0.0 s</span>
        <span style="font-weight:700;color:var(--muted)">Your best: <span id="r-best">none yet</span></span>
      </div>
      <div id="r-play" hidden style="display:flex;flex-direction:column;gap:12px">
        <span class="eyebrow">Note <span id="r-n">1</span> of 5</span>
        <div class="slab" id="r-code" style="font-size:20px;letter-spacing:.06em"></div>
        <div class="field"><label for="r-key">Key: <span id="r-keyv" class="mono">1</span></label><input type="range" id="r-key" min="1" max="25" value="1"></div>
        <div class="slab" id="r-dec"></div>
      </div>
      <p class="note race-done" id="r-note" role="status" hidden></p>
    </div>`;
  let tries = 0, solved = false;
  root.querySelectorAll('.shift').forEach(b => b.addEventListener('click', () => {
    if (solved) return;
    tries++;
    const k = +b.dataset.k, note = $('#k-note', root);
    if (k === key) { solved = true; b.classList.add('right'); note.className = 'note win'; note.innerHTML = `<b>Cracked in ${tries} ${tries === 1 ? 'try' : 'tries'}.</b> The key was ${key}. Brute force wins when there are only 25 keys.`; }
    else { b.classList.add('wrong'); note.textContent = `Tries so far: ${tries}`; }
  }));
  $('#k-guess', root).addEventListener('input', e => {
    const g = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    e.target.value = g;
    const res = $('#k-res', root);
    if (!g) { res.textContent = 'Type one letter'; return; }
    const k = (A.indexOf(g) - 4 + 26) % 26;
    res.textContent = `Key ${k}: ${shift(longCoded, -k)}`;
  });
  const RACE = ['HELLO FRIEND', 'MEET AT NOON', 'THE CAT IS HIDING', 'BRING SNACKS TO THE PARK', 'KEEPYOURKEYSECRET'];
  let best = null; try { best = parseFloat(localStorage.getItem('blocklab-race-best')) || null; } catch (e) {}
  const fmt = x => x.toFixed(1) + ' s';
  if (best) $('#r-best', root).textContent = fmt(best);
  let race = null, tick = null;
  const showNote = () => {
    const r = race.notes[race.i];
    $('#r-n', root).textContent = race.i + 1;
    $('#r-code', root).textContent = r.code;
    $('#r-key', root).value = 1; $('#r-keyv', root).textContent = 1;
    $('#r-dec', root).textContent = shift(r.code, -1);
    race.lock = false;
  };
  const finish = () => {
    clearInterval(tick);
    const secs = (performance.now() - race.start) / 1000;
    $('#r-time', root).textContent = fmt(secs);
    $('#r-play', root).hidden = true;
    const note = $('#r-note', root); note.hidden = false;
    const newBest = !best || secs < best;
    if (newBest) { best = secs; try { localStorage.setItem('blocklab-race-best', String(secs)); } catch (e) {} $('#r-best', root).textContent = fmt(secs); }
    note.className = 'note win race-done';
    note.innerHTML = newBest ? `<b>New record: ${fmt(secs)}!</b> Can you beat it? A computer would crack all five in under a millisecond, which is why real keys need to be much bigger.` : `<b>Finished in ${fmt(secs)}.</b> Your best is ${fmt(best)}. Try again to beat it!`;
    $('#r-start', root).textContent = 'Race again';
    race = null;
  };
  $('#r-start', root).addEventListener('click', () => {
    race = { i: 0, start: performance.now(), notes: RACE.map(m => { const key = 3 + Math.floor(Math.random() * 23); return { key, code: shift(m, key) }; }) };
    $('#r-play', root).hidden = false; $('#r-note', root).hidden = true;
    showNote();
    clearInterval(tick);
    tick = setInterval(() => { if (!root.isConnected) { clearInterval(tick); return; } if (race) $('#r-time', root).textContent = fmt((performance.now() - race.start) / 1000); }, 100);
    $('#r-key', root).focus();
  });
  $('#r-key', root).addEventListener('input', e => {
    if (!race || race.lock) return;
    const k = +e.target.value, r = race.notes[race.i];
    $('#r-keyv', root).textContent = k;
    $('#r-dec', root).textContent = shift(r.code, -k);
    if (k === r.key) {
      race.lock = true;
      $('#r-dec', root).innerHTML = `<span class="diff">${shift(r.code, -k)}</span>`;
      setTimeout(() => { if (!race) return; race.i++; if (race.i >= race.notes.length) finish(); else showNote(); }, 600);
    }
  });
}
