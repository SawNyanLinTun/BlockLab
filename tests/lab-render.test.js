import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installShim, handlers } from './dom-shim.js';
const els = installShim();
const { renderBitcoinLab } = await import('../src/views/bitcoin-lab.js');
const state = await import('../src/state/bitcoin-lab.js');
const { resetLab } = state;
const { setSiteLang } = await import('../src/i18n/strings.js');
const { LAB_COPY } = await import('../src/i18n/lab.js');
test('lab renders empty, funded, pending and confirmed states in all languages', () => {
  for (const lang of ['en', 'th', 'my']) {
    resetLab(); setSiteLang(lang); renderBitcoinLab();
    assert.ok(els['#app'].innerHTML.includes(LAB_COPY[lang].title));
    const a = state.lab.createWallet(), b = state.lab.createWallet(); state.lab.fund(a.address); renderBitcoinLab();
    assert.ok(els['#app'].innerHTML.includes(a.publicKey));
    assert.ok(!els['#app'].innerHTML.includes(a.privateKey));
    const tx = state.lab.send(a.address, b.address, '0.1'); renderBitcoinLab();
    assert.ok(els['#app'].innerHTML.includes(tx.id));
    state.lab.mine(); renderBitcoinLab(); assert.ok(els['#app'].innerHTML.includes(state.lab.blocks[0].hash));
  }
});
test('send form and mine handlers carry a transfer through confirmation', () => {
  resetLab(); setSiteLang('en'); const a = state.lab.createWallet(), b = state.lab.createWallet(); state.lab.fund(a.address);
  handlers.length = 0; renderBitcoinLab();
  document.querySelector('#lab-from').value = a.address; document.querySelector('#lab-to').value = b.address; document.querySelector('#lab-amount').value = '0.2';
  handlers.find(h => h.el.id === '#lab-send').fn({ preventDefault() {} });
  assert.equal(state.lab.mempool.length, 1);
  handlers.findLast(h => h.el.id === '#lab-mine').fn();
  assert.equal(state.lab.mempool.length, 0); assert.equal(state.lab.balance(b.address), 20000000);
});
