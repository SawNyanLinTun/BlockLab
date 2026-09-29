import { $ } from '../lib/util.js';

export function keysize(root) {
  const fmtBig = n => { const s = (2n ** BigInt(n)).toString(); return s.length <= 21 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : `about ${s[0]}.${s.slice(1, 3)} × 10^${s.length - 1}`; };
  const fmtTime = n => {
    const sec = Math.pow(2, n) / 1e9;
    const yr = sec / 31557600, universe = 13.8e9;
    if (sec < 1) return ['Less than a second', 'Easy to crack'];
    if (sec < 60) return [`${Math.round(sec)} seconds`, 'Easy to crack'];
    if (sec < 3600) return [`${Math.round(sec / 60)} minutes`, 'Easy to crack'];
    if (sec < 86400) return [`${Math.round(sec / 3600)} hours`, 'Crackable'];
    if (yr < 1) return [`${Math.round(sec / 86400)} days`, 'Crackable'];
    if (yr < 1000) return [`${Math.round(yr)} years`, 'Hard'];
    if (yr < universe) return [`${yr.toExponential(1).replace('e+', ' × 10^')} years`, 'Very hard'];
    const times = yr / universe;
    return [`${times < 1e6 ? Math.round(times).toLocaleString('en') : times.toExponential(1).replace('e+', ' × 10^')} × the age of the universe`, 'Impossible'];
  };
  const human = sec => {
    if (sec < 60) return `${Math.round(sec)} seconds`;
    if (sec < 3600) return `${Math.round(sec / 60)} minutes`;
    if (sec < 86400) { const h = sec / 3600; return h < 10 ? `${h.toFixed(1)} hours` : `${Math.round(h)} hours`; }
    if (sec < 31557600) return `${Math.round(sec / 86400)} days`;
    return `${Math.round(sec / 31557600).toLocaleString('en')} years`;
  };
  root.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px">
      <p><b>Part 1: The bike lock.</b> A thief tries one code every 5 seconds. Add dials and see how long the thief needs to try every code.</p>
      <div class="lockwrap">
        <div class="lockscroll"><div class="lock" id="b-lock" role="img"><div class="shackle" id="b-shackle"></div><div class="lockbody"><div class="dials" id="b-dials"></div></div></div></div>
        <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
          <div class="row"><button type="button" class="btn small ghost" id="b-less">Remove a dial</button><button type="button" class="btn small" id="b-more">Add a dial</button></div>
          <div class="field"><span class="lbl">Possible codes</span><div class="stat" id="b-codes"></div></div>
          <div class="field"><span class="lbl">Time for the thief to try them all</span><div class="stat" id="b-thief" style="font-size:26px"></div></div>
          <p class="thief" id="b-mood"></p>
        </div>
      </div>
    </div>
    <hr class="dash">
    <div style="display:flex;flex-direction:column;gap:16px">
      <p><b>Part 2: Computer keys are coin flips.</b> Each bit is one coin flip, heads or tails. Every extra coin doubles the number of keys.</p>
      <div class="field"><label for="b-bits">Key size: <span class="mono" id="b-bitsv">8</span> coin flips (bits)</label><input type="range" id="b-bits" min="1" max="256" value="8"></div>
      <div class="row" role="group" aria-label="Quick picks">
        <button class="btn small ghost" data-b="5">Caesar (about 5 bits)</button>
        <button class="btn small ghost" data-b="40">40 bits</button>
        <button class="btn small ghost" data-b="128">128 bits</button>
        <button class="btn small ghost" data-b="256">Bitcoin key: 256 bits</button>
      </div>
      <div class="bits coins" id="b-grid" aria-hidden="true"></div>
      <div class="grid2">
        <div class="field"><span class="lbl">Possible keys</span><div class="stat mono" id="b-keys" style="font-size:24px;word-break:break-all"></div></div>
        <div class="field"><span class="lbl">Time to try them all at 1 billion guesses per second</span><div class="stat" id="b-time" style="font-size:26px"></div></div>
      </div>
      <p class="note" id="b-note"></p>
    </div>`;
  let dials = 3;
  const drawLock = (added) => {
    $('#b-dials', root).innerHTML = Array.from({ length: dials }, (_, i) => {
      const d = (i * 7 + 3) % 10;
      return `<div class="dial${added && i === dials - 1 ? ' new' : ''}"><span>${(d + 9) % 10}</span><span class="mid">${d}</span><span>${(d + 1) % 10}</span></div>`;
    }).join('');
    $('#b-shackle', root).style.width = Math.max(96, dials * 52 - 30) + 'px';
    $('#b-lock', root).setAttribute('aria-label', `Bike lock with ${dials} dials`);
    const codes = Math.pow(10, dials), sec = codes * 5;
    $('#b-codes', root).textContent = codes.toLocaleString('en');
    $('#b-thief', root).textContent = human(sec);
    const mood = $('#b-mood', root);
    if (sec < 86400) { mood.className = 'thief happy'; mood.innerHTML = '<b>Thief:</b> “Easy! I’ll be done before dinner.”'; }
    else if (sec < 31557600 * 2) { mood.className = 'thief'; mood.innerHTML = '<b>Thief:</b> “Ugh, this will take a while…”'; }
    else { mood.className = 'thief sad'; mood.innerHTML = '<b>Thief:</b> “I give up!” More dials made the lock safe.'; }
    $('#b-less', root).disabled = dials <= 1;
    $('#b-more', root).disabled = dials >= 10;
  };
  $('#b-more', root).addEventListener('click', () => { if (dials < 10) { dials++; drawLock(true); } });
  $('#b-less', root).addEventListener('click', () => { if (dials > 1) { dials--; drawLock(false); } });
  drawLock(false);
  const upd = () => {
    const n = +$('#b-bits', root).value;
    $('#b-bitsv', root).textContent = n;
    $('#b-grid', root).innerHTML = Array.from({ length: 256 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('');
    $('#b-keys', root).textContent = fmtBig(n);
    const [tm, level] = fmtTime(n);
    $('#b-time', root).textContent = tm;
    const note = $('#b-note', root);
    note.className = level === 'Impossible' ? 'note win' : 'note';
    note.innerHTML = level === 'Impossible' ? `<b>${level}.</b> No computer on Earth could guess this key.` : `<b>${level}.</b> Keep sliding right to make the key safer.`;
  };
  $('#b-bits', root).addEventListener('input', upd);
  root.querySelectorAll('[data-b]').forEach(b => b.addEventListener('click', () => { $('#b-bits', root).value = b.dataset.b; upd(); }));
  upd();
}
