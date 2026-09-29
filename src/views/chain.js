import { LESSONS } from '../content/course.js';
import { sha256 } from '../lib/sha256.js';
import { $ } from '../lib/util.js';
import { isDone } from '../state/progress.js';

/* 3D chain: your own chain grows by one block per finished lesson. Each block is really mined: its hash starts with 00 */
function mineHash(label, prev) { let nonce = 0, h; do { h = sha256(`${label}|${prev}|${nonce++}`); } while (!h.startsWith('00')); return h; }
const hashCache = {};
function chainBlocks() {
  const labels = ['START', ...LESSONS.filter(l => isDone(l.id)).map(l => l.num)];
  let prev = '0'.repeat(64);
  return labels.map(label => { const k = label + '|' + prev; const h = hashCache[k] || (hashCache[k] = mineHash(label, prev)); prev = h; return { label, hash: h }; });
}
const chainView = { rx: -16, ry: -24, idle: true, t: 0 };
function mountChain() {
  const stage = $('#stage'), world = $('#world'), S = chainView;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LOOK = [{ f: '#1B2440', s: '#0F1628', t: '#3A4770', k: '#F2B441' }, { f: '#F2B441', s: '#C98A1F', t: '#F9D98E', k: '#1B2440' }, { f: '#7CC4B8', s: '#4E9C90', t: '#B4E0D8', k: '#1B2440' }];
  const blocks = chainBlocks();
  let seen = 1;
  try { seen = Math.max(1, +localStorage.getItem('blocklab-chain-seen') || 1); } catch (e) {}
  blocks.forEach((b, i) => { b.born = (!reduce && i >= seen) ? S.t + 20 + (i - seen) * 30 : -1; });
  try { localStorage.setItem('blocklab-chain-seen', String(blocks.length)); } catch (e) {}
  const n = blocks.length;
  const face = (tr, bg, inner = '') => `<div class="face" style="background:${bg};transform:${tr}">${inner}</div>`;
  world.innerHTML = '<div class="floor"></div>' +
    blocks.slice(1).map(() => `<div class="lnk"><div class="bar" style="top:-6px;height:12px;transform:translateZ(8px)"></div><div class="bar" style="top:-6px;height:12px;transform:translateZ(-8px)"></div><div class="bar" style="top:-8px;height:16px;background:#3A4770;transform:rotateX(90deg) translateZ(6px)"></div></div>`).join('') +
    blocks.map((b, i) => { const c = i === 0 ? LOOK[0] : (i === n - 1 ? LOOK[2] : LOOK[1]);
      return `<div class="blk">${face('rotateY(180deg) translateZ(42px)', c.s)}${face('rotateX(-90deg) translateZ(42px)', c.s)}${face('rotateY(-90deg) translateZ(42px)', c.s)}${face('rotateY(90deg) translateZ(42px)', c.s)}${face('rotateX(90deg) translateZ(42px)', c.t)}${face('translateZ(42px)', c.f, `<b style="color:${c.k}">${i === 0 ? 'START' : 'LESSON ' + b.label}</b><span style="color:${c.k}">${b.hash.slice(0, 8)}</span>`)}</div>`; }).join('');
  const blks = world.querySelectorAll('.blk'), lnks = world.querySelectorAll('.lnk');
  const prog = b => b.born < 0 ? 1 : Math.max(0, Math.min(1, (S.t - b.born) / 36));
  let drag = null, resume;
  const frame = () => {
    if (!stage.isConnected) return;
    S.t++;
    if (S.idle && !drag && !reduce) { S.ry += (-24 + Math.sin(S.t * 0.012) * 20 - S.ry) * 0.04; S.rx += (-16 - S.rx) * 0.04; }
    const gap = 112, span = (n - 1) * gap + 84;
    const scale = Math.min(1, stage.clientWidth / 600) * Math.min(1, 560 / span);
    world.style.transform = `scale(${scale}) rotateX(${S.rx}deg) rotateY(${S.ry}deg)`;
    blocks.forEach((b, i) => {
      const p = prog(b);
      const y = (reduce ? 0 : Math.sin(S.t * 0.05 + i * 1.3) * 5) - 240 * Math.pow(1 - p, 3);
      blks[i].style.transform = `translate3d(${(i - (n - 1) / 2) * gap}px,${y}px,0)`;
      blks[i].style.opacity = p > 0 ? 1 : 0;
      if (i > 0) { lnks[i - 1].style.transform = `translate3d(${(i - 1 - (n - 1) / 2) * gap + gap / 2}px,0,0)`; lnks[i - 1].style.opacity = p >= 1 ? 1 : 0; }
    });
    requestAnimationFrame(frame);
  };
  const pause = () => { clearTimeout(resume); resume = setTimeout(() => { S.idle = true; }, 2500); };
  stage.addEventListener('pointerdown', e => { stage.setPointerCapture && stage.setPointerCapture(e.pointerId); clearTimeout(resume); S.idle = false; drag = { x: e.clientX, y: e.clientY, rx: S.rx, ry: S.ry }; stage.classList.add('dragging'); });
  stage.addEventListener('pointermove', e => { if (!drag) return; S.rx = Math.max(-70, Math.min(40, drag.rx - (e.clientY - drag.y) * 0.4)); S.ry = drag.ry + (e.clientX - drag.x) * 0.4; });
  const up = () => { if (!drag) return; drag = null; stage.classList.remove('dragging'); pause(); };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('keydown', e => {
    const k = { ArrowLeft: [0, -15], ArrowRight: [0, 15], ArrowUp: [10, 0], ArrowDown: [-10, 0] }[e.key];
    if (!k) return; e.preventDefault(); S.idle = false;
    S.rx = Math.max(-70, Math.min(40, S.rx + k[0])); S.ry += k[1]; pause();
  });
  requestAnimationFrame(frame);
}


export { chainBlocks, chainView, mineHash, mountChain };
