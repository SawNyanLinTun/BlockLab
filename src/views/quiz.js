import { UNITS, unitDone } from '../content/course.js';
import { $, esc } from '../lib/util.js';
import { isDone, markDone } from '../state/progress.js';
import { updateMeter } from './nav.js';

function renderQuiz(l) {
  const box = $('#quiz');
  const answered = l.quiz.map(() => null);
  const draw = () => {
    const allRight = answered.every(a => a === 'right');
    box.innerHTML = l.quiz.map((q, qi) => `<div class="q">
      <p class="ask">${qi + 1}. ${esc(q.q)}</p>
      <div class="opts">${q.o.map((o, oi) => {
        const st = answered[qi] === 'right' && oi === q.a ? 'right' : (answered[qi + '_' + oi] ? 'wrong' : '');
        return `<button class="opt ${st}" data-q="${qi}" data-o="${oi}" ${answered[qi] === 'right' ? 'disabled' : ''}>${esc(o)}</button>`;
      }).join('')}</div>
      ${answered[qi] === 'right' ? `<p class="feedback right"><b>Correct.</b> ${esc(q.why)}</p>` : answered[qi] === 'wrong' ? `<p class="feedback wrong"><b>Not quite.</b> Have another go.</p>` : ''}
    </div>`).join('') + (allRight || isDone(l.id) ? `<p class="note win"><b>Lesson ${l.num} complete.</b> ${unitDone(l.unit) ? `You won the ${UNITS.find(u => u.n === l.unit).badge} badge!` : 'Your progress is saved on this device.'} A new block joined your chain on the <a href="#home">home page</a>.</p>` : '');
    box.querySelectorAll('.opt').forEach(b => b.addEventListener('click', () => {
      const qi = +b.dataset.q, oi = +b.dataset.o;
      if (oi === l.quiz[qi].a) answered[qi] = 'right';
      else { answered[qi] = 'wrong'; answered[qi + '_' + oi] = true; }
      if (l.quiz.every((q, k) => answered[k] === 'right') && !isDone(l.id)) { markDone(l.id); updateMeter(); }
      draw();
    }));
  };
  draw();
}


export { renderQuiz };
