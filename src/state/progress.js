/* ---------- Progress (this device only) ---------- */
const KEY = 'blocklab-pilot-progress';
const done = {};
try { Object.assign(done, JSON.parse(localStorage.getItem(KEY) || '{}') || {}); } catch (e) { /* storage blocked: start fresh */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} };

const isDone = id => !!done[id];
const markDone = id => { done[id] = true; save(); };
const resetProgress = () => { for (const k of Object.keys(done)) delete done[k]; save(); };


export { KEY, done, isDone, markDone, resetProgress, save };
