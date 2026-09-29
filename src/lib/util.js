/* ---------- Helpers ---------- */
const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const shift = (text, k) => text.toUpperCase().replace(/[A-Z]/g, ch => A[(A.indexOf(ch) + k + 26) % 26]);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, root = document) => root.querySelector(sel);
const bitsOf = hex => hex.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');


export { $, A, bitsOf, esc, shift };
