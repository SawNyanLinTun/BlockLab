import { shift } from '../lib/util.js';

/* ---------- Secret note swap (lesson 1.1) ---------- */
function mountSwap(box) {
  const keyIcon = '<svg width="28" height="28" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><circle cx="11" cy="15" r="6"/><path d="M17 15h10M23 15v5M27 15v3"/></svg>';
  box.innerHTML = `
    <p style="font-size:19px;max-width:38em">Be a secret agent. Write a note only your friend can read, then swap devices or send it over chat.</p>
    <div class="swap">
      <div class="paper send">
        <span class="eyebrow">Step 1 · Write</span><h3>Your secret note</h3>
        <div class="field"><label for="sw-msg">Your message</label><input class="input" id="sw-msg" maxlength="60" autocomplete="off" placeholder="Meet me at the library"></div>
        <div class="field"><label for="sw-key">Pick a key: <span id="sw-keyv" class="mono">7</span></label><input type="range" id="sw-key" min="1" max="25" value="7"></div>
        <span class="lbl">What your friend will see</span>
        <div class="scribble empty" id="sw-out">Your secret note appears here</div>
        <div class="row"><button type="button" class="btn small" id="sw-copy">Copy secret note</button><span id="sw-msgstat" role="status" style="font-weight:700;color:var(--muted);font-size:15px"></span></div>
      </div>
      <div class="paper recv">
        <span class="eyebrow">Step 2 · Read</span><h3>A note from your friend</h3>
        <div class="field"><label for="sw-in">Paste their secret note</label><input class="input" id="sw-in" autocomplete="off" placeholder="TLLA TL HA AOL SPIYHYF"></div>
        <div class="field"><label for="sw-rkey">The key they told you: <span id="sw-rkeyv" class="mono">7</span></label><input type="range" id="sw-rkey" min="1" max="25" value="7"></div>
        <span class="lbl">Their real message</span>
        <div class="scribble empty" id="sw-read">Paste a note to read it</div>
      </div>
    </div>
    <div class="keytip">${keyIcon}<span><b>Agent rule:</b> say the key out loud, never write it next to the note. Forgot it? Slide through all 25 keys. That is brute force, the next lesson.</span></div>`;
  const q = sel => box.querySelector(sel);
  const sendUpd = () => {
    const k = +q('#sw-key').value, m = q('#sw-msg').value;
    q('#sw-keyv').textContent = k;
    const out = q('#sw-out');
    if (m.trim()) { out.textContent = shift(m, k); out.classList.remove('empty'); } else { out.textContent = 'Your secret note appears here'; out.classList.add('empty'); }
  };
  const readUpd = () => {
    const k = +q('#sw-rkey').value, m = q('#sw-in').value, out = q('#sw-read');
    q('#sw-rkeyv').textContent = k;
    if (m.trim()) { out.textContent = shift(m, -k); out.classList.remove('empty'); } else { out.textContent = 'Paste a note to read it'; out.classList.add('empty'); }
  };
  q('#sw-msg').addEventListener('input', sendUpd); q('#sw-key').addEventListener('input', sendUpd);
  q('#sw-in').addEventListener('input', readUpd); q('#sw-rkey').addEventListener('input', readUpd);
  q('#sw-copy').addEventListener('click', () => {
    const m = q('#sw-msg').value, stat = q('#sw-msgstat');
    if (!m.trim()) { stat.textContent = 'Write a message first.'; q('#sw-msg').focus(); return; }
    const secret = shift(m, +q('#sw-key').value);
    const fallback = () => { const r = document.createRange(); r.selectNodeContents(q('#sw-out')); const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); stat.textContent = 'Selected. Copy it with Ctrl+C or a long press.'; };
    try { navigator.clipboard.writeText(secret).then(() => { stat.textContent = 'Copied! Send it to a friend.'; }, fallback); } catch (e) { fallback(); }
  });
}


export { mountSwap };
