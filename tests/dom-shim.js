// A very small fake browser, just enough to render every page and toy under Node.
// It checks that the code runs without errors; it does not check layout.
export const handlers = [];
export function installShim(hash = '') {
  const els = {};
  const mk = id => els[id] || (els[id] = {
    id, _v: '8', get value() { return this._v; }, set value(v) { this._v = String(v); }, innerHTML: '', textContent: '', hidden: false, disabled: false, style: {}, dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, removeAttribute() {}, getAttribute() { return null; }, addEventListener(type, fn) { handlers.push({ type, fn, el: mk(id) }); },
    querySelector: () => mk('q'), querySelectorAll: () => [], focus() {}, scrollIntoView() {},
    isConnected: false, clientWidth: 600, offsetWidth: 0
  });
  const store = {};
  globalThis.document = { documentElement: { lang: '' }, querySelector: s => mk(s), querySelectorAll: () => [], getElementById: id => mk(id), createRange: () => ({ selectNodeContents() {} }) };
  globalThis.window = { matchMedia: () => ({ matches: false }), addEventListener() {}, scrollTo() {}, getSelection: () => ({ removeAllRanges() {}, addRange() {} }) };
  globalThis.location = { hash };
  globalThis.localStorage = { getItem: k => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  globalThis.requestAnimationFrame = () => 0;
  Object.defineProperty(globalThis, 'navigator', { value: { clipboard: { writeText: () => Promise.resolve() } }, configurable: true });
  return els;
}
