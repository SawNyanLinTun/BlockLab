import { $, esc } from '../lib/util.js';
import { labText } from '../i18n/lab.js';
import { lab, resetLab, formatBTC, FEE, transactionMessage } from '../state/bitcoin-lab.js';
import { verify } from '../lib/lab-keys.js';
import { setNav } from './nav.js';
let notice = '', resetting = false;
const shown = new Set();
export function renderBitcoinLab() {
  const c = labText(); setNav('lab');
  const code = (label, value) => `<div class="lab-key"><span>${label}</span><code>${esc(value)}</code></div>`;
  const txCard = (tx, confirmations = 0) => `<article class="lab-tx">
    <div class="lab-row"><strong>${lab.wallets.find(w => w.address === tx.from)?.name} → ${lab.wallets.find(w => w.address === tx.to)?.name}</strong><span>${formatBTC(tx.amount)} BTC</span></div>
    <p class="lab-status">${c.signed}${confirmations ? ` · ${c.confirmations}: ${confirmations}` : ''}</p>
    <details><summary>${c.details}</summary>${code('ID (simulation)', tx.id)}${code('ECDSA r || s', tx.signature)}${code('Public key', tx.publicKey)}${code('JSON', transactionMessage(tx))}<p>${c.inputCount}: ${tx.inputs.length} · ${c.change}: ${formatBTC(tx.outputs.filter(o => o.address === tx.from).reduce((a, o) => a + o.sats, 0))} BTC · Fee: ${formatBTC(FEE)} BTC</p></details>
    <button type="button" class="btn ghost lab-small" data-tamper="${tx.id}">${c.tamper}</button>
  </article>`;
  $('#app').innerHTML = `<section class="lab-page">
    <header class="lab-heading"><span class="tag">${c.badge}</span><h1>${c.title}</h1><p class="lede">${c.intro}</p></header>
    <aside class="lab-warning">${c.warning}</aside>
    <ol class="lab-steps">${c.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    <p class="lab-notice" id="lab-notice" role="status" aria-live="polite">${notice ? c[notice] || c.error : ''}</p>
    <div class="lab-wallets">${['Alice', 'Bob'].map((name, i) => {
      const w = lab.wallets[i];
      return `<article class="lab-panel"><div class="lab-row"><h2>${name}</h2><span class="lab-avatar" aria-hidden="true">${name[0]}</span></div>${w ? `
        <div class="lab-balance"><strong>${formatBTC(lab.balance(w.address))}</strong><span> BTC · ${c.available}</span></div>
        <p>${c.pending}: ${formatBTC(lab.pending(w.address))} BTC</p>
        ${code(c.address, w.address)}${code(c.public, w.publicKey)}
        <button type="button" class="btn ghost lab-small" data-reveal="${i}" aria-expanded="${shown.has(i)}">${shown.has(i) ? c.hide : c.reveal}</button>
        ${shown.has(i) ? code(c.private, w.privateKey) : ''}
        <p class="lab-help">${c.keyHelp}</p>
        <button type="button" class="btn" data-fund="${i}" ${w.funded ? 'disabled' : ''}>${c.fund}</button>
        <details><summary>${c.utxos}</summary>${lab.utxos.filter(u => u.address === w.address && !u.locked).map(u => code(formatBTC(u.sats) + ' BTC', u.id)).join('') || '0'}</details>
      ` : `<p>${c.emptyWallet}</p><button type="button" class="btn" data-create="${i}" ${i !== lab.wallets.length ? 'disabled' : ''}>${c.create}</button>`}</article>`;
    }).join('')}</div>
    <div class="lab-grid"><section class="lab-panel"><h2>${c.send}</h2><form id="lab-send">
      <label for="lab-from">${c.sender}</label><select id="lab-from" ${lab.wallets.length < 2 ? 'disabled' : ''}>${lab.wallets.map(w => `<option value="${w.address}">${w.name}</option>`).join('')}</select>
      <label for="lab-to">${c.receiver}</label><select id="lab-to" ${lab.wallets.length < 2 ? 'disabled' : ''}>${[...lab.wallets].reverse().map(w => `<option value="${w.address}">${w.name}</option>`).join('')}</select>
      <label for="lab-amount">${c.amount}</label><input id="lab-amount" type="text" inputmode="decimal" value="0.1" required autocomplete="off">
      <p class="lab-help">${c.fee}</p><button class="btn" type="submit" ${lab.wallets.length < 2 ? 'disabled' : ''}>${c.send}</button>
    </form></section>
    <section class="lab-panel"><div class="lab-row"><h2>${c.pool} <span class="pill">${lab.mempool.length}</span></h2><button type="button" class="btn" id="lab-mine">${c.mine}</button></div>
      ${lab.mempool.map(tx => txCard(tx)).join('') || `<p class="lab-empty">${c.empty}</p>`}
    </section></div>
    <section class="lab-panel"><h2>${c.blocks}</h2>${[...lab.blocks].reverse().map(b => `<details class="lab-block" open><summary>${c.block} #${b.height} · ${b.transactions.length} ${c.transfers}</summary>${code('Hash (simulation)', b.hash)}${code('Previous hash', b.previous)}${b.transactions.map(tx => txCard(tx, lab.blocks.length - b.height + 1)).join('')}</details>`).join('') || `<p>${c.noBlocks}</p>`}</section>
    <details class="lab-panel"><summary>${c.limitsTitle}</summary><p>${c.limits}</p></details>
    <footer class="lab-footer"><p>${c.resetNote}</p>${resetting ? `<div role="group" aria-label="${c.resetQuestion}"><p>${c.resetQuestion}</p><button type="button" class="btn" id="lab-confirm-reset">${c.confirmReset}</button> <button type="button" class="btn ghost" id="lab-cancel-reset">${c.cancel}</button></div>` : `<button type="button" class="btn ghost" id="lab-reset">${c.reset}</button>`}</footer>
  </section>`;
  function act(fn, success) {
    try { fn(); notice = success; } catch (e) { notice = ({ amount: 'amountError', balance: 'balanceError', wallet: 'walletError' })[e.message] || (e.message.includes('randomness') ? 'unsupported' : 'error'); }
    renderBitcoinLab();
  }
  document.querySelectorAll('[data-create]').forEach(b => b.addEventListener('click', () => act(() => lab.createWallet(), 'successWallet')));
  document.querySelectorAll('[data-fund]').forEach(b => b.addEventListener('click', () => act(() => lab.fund(lab.wallets[Number(b.dataset.fund)].address), 'successFund')));
  document.querySelectorAll('[data-reveal]').forEach(b => b.addEventListener('click', () => { const i = Number(b.dataset.reveal); shown.has(i) ? shown.delete(i) : shown.add(i); renderBitcoinLab(); }));
  $('#lab-send').addEventListener('submit', ev => { ev.preventDefault(); act(() => lab.send($('#lab-from').value, $('#lab-to').value, $('#lab-amount').value), 'successSend'); });
  $('#lab-mine').addEventListener('click', () => act(() => lab.mine(), 'successMine'));
  document.querySelectorAll('[data-tamper]').forEach(b => b.addEventListener('click', () => {
    const tx = [...lab.mempool, ...lab.blocks.flatMap(b => b.transactions)].find(tx => tx.id === b.dataset.tamper);
    const altered = { ...tx, outputs: tx.outputs.map((o, i) => i === 0 ? { ...o, sats: o.sats + 1 } : o) };
    const invalid = !verify(transactionMessage(altered), tx.signature, tx.publicKey);
    $('#lab-notice').textContent = invalid ? c.tampered : c.error;
  }));
  if (resetting) {
    $('#lab-confirm-reset').addEventListener('click', () => { resetLab(); shown.clear(); resetting = false; notice = ''; renderBitcoinLab(); });
    $('#lab-cancel-reset').addEventListener('click', () => { resetting = false; renderBitcoinLab(); });
  } else $('#lab-reset').addEventListener('click', () => { resetting = true; renderBitcoinLab(); $('#lab-confirm-reset').focus(); });
}
