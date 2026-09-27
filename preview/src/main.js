/* REACTOR RIFT — VISUAL PREVIEW ONLY.
   Renders deterministic scripted demo rounds (see demoRounds.js).
   NOT connected to RGS. NOT production math. Production outcomes come from the
   Stake Engine math SDK event stream; this preview emulates only the LOOK of
   consuming an ordered event list. No Math.random anywhere in this file. */
import { SYMBOL_ART } from './symbols.js';
import { DEMO_ROUNDS, PAYTABLE } from './demoRounds.js';
import { SFX, setSound, getSound } from './audio.js';

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = n => n >= 100 ? n.toFixed(0) : n.toFixed(2).replace(/\.?0+$/, '');

/* ---------------- state (presentation only) ---------------- */
const BET_LEVELS = [0.20, 0.50, 1, 2, 5, 10, 20, 50];
const state = {
  balance: 1000, betIdx: 3, spinning: false, roundPtr: 0,
  energy: 0, level: 0, board: Array(25).fill('CI'), cells: [],
};
const bet = () => BET_LEVELS[state.betIdx];

/* ---------------- shell UI ---------------- */
$('#app').innerHTML = `
<div class="topbar">
  <div class="brand">Reactor Rift<small>DIMENSIONAL CLUSTER REACTOR · VISUAL PREVIEW</small></div>
  <div class="stats">
    <div class="stat"><b id="balance">1,000.00</b><span>BALANCE</span></div>
    <div class="stat win"><b id="win">0.00</b><span>WIN</span></div>
  </div>
</div>
<div class="game">
  <div class="reactor">
    <div class="core" id="core">
      <div class="ring"></div><div class="ring2"></div><div class="plasma"></div>
      <svg class="cracks" viewBox="0 0 120 120"><path d="M60 4 L54 26 L66 38 L58 58 M10 60 L30 54 L44 66 L60 58 M110 44 L92 50 L84 40 M60 116 L64 96 L52 84" stroke="#a45cff" stroke-width="2" fill="none" opacity=".9"/><path d="M22 22 L38 34 M98 92 L84 78" stroke="#ff5470" stroke-width="1.5" opacity=".8"/></svg>
    </div>
    <div class="meter" style="position:relative">
      <div class="label"><span>REACTOR ENERGY</span><b id="energyTxt">0 / 50</b></div>
      <div class="bar"><div class="fill" id="fill"></div></div>
      <div class="ticks">
        <i style="left:20%" data-lv="1">L1·10</i><i style="left:40%" data-lv="2">L2·20</i>
        <i style="left:70%" data-lv="3">L3·35</i><i style="left:100%" data-lv="4">L4·50</i>
      </div>
      <div class="levelname" id="levelName">STABLE</div>
      <div class="energy-pop" id="epop"></div>
    </div>
  </div>
  <div class="board-wrap" id="boardWrap">
    <div class="board" id="board"></div>
    <div class="rift-line" id="riftLine"><div class="bolt"></div></div>
    <div class="zone-tag zone-L" id="zL">&#9664; LEFT ZONE</div>
    <div class="zone-tag zone-R" id="zR">RIGHT ZONE &#9654;</div>
    <div class="banner" id="banner"><h2 id="bannerT"></h2><p id="bannerS"></p></div>
  </div>
</div>
<div class="controls">
  <div class="betbox">
    <button class="btn" id="betDn">&minus;</button>
    <div class="val"><b id="betTxt">$2.00</b><span>BET</span></div>
    <button class="btn" id="betUp">+</button>
  </div>
  <button class="spin btn" id="spinBtn">SPIN</button>
  <button class="btn iconbtn" id="soundBtn" title="Sound">&#9834;</button>
  <button class="btn iconbtn" id="rulesBtn" title="Rules">i</button>
</div>
<div class="debug" id="debug">
  <h4>PREVIEW DEBUG PANEL — DEV ONLY (NOT IN PRODUCTION BUILD)</h4>
  <div class="row">
    <button class="btn" data-demo="1">BASE</button>
    <button class="btn" data-demo="3">OVERCHARGE</button>
    <button class="btn" data-demo="4">PLASMA SHIFT</button>
    <button class="btn" data-demo="6">RIFT</button>
    <button class="btn" data-demo="7">MELTDOWN</button>
    <button class="btn" data-demo="8">BIG WIN</button>
    <button class="btn" id="resetBtn">RESET</button>
  </div>
</div>
<div class="footer">
  RTP 96&ndash;97% &middot; MAX WIN 10,000&times; BET — DESIGN TARGETS, PENDING MATHEMATICAL VALIDATION.<br>
  This is a visual preview with scripted demo rounds. It is not connected to a real-money gaming system.<br>
  <span class="disclaimer-preview">PLAY RESPONSIBLY &middot; 18+ &middot; PREVIEW MODE — NO REAL WAGERING</span>
</div>
<div class="modal-bg" id="modalBg"><div class="modal" id="modal"></div></div>
<div class="melt-flash" id="meltFlash"></div>`;

/* build board cells */
const boardEl = $('#board');
for (let i = 0; i < 25; i++) {
  const d = document.createElement('div');
  d.className = 'cell ' + (i % 5 < 2 ? 'colL' : i % 5 > 2 ? 'colR' : 'colM');
  boardEl.appendChild(d); state.cells.push(d);
}
const paintCell = (i, sym) => {
  state.board[i] = sym;
  state.cells[i].innerHTML = SYMBOL_ART[sym] || '';
  state.cells[i].classList.toggle('riftcell', sym === 'S');
};
const renderBoard = b => b.forEach((s, i) => paintCell(i, s));

/* ---------------- HUD helpers ---------------- */
function updateHUD() {
  $('#balance').textContent = state.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  $('#betTxt').textContent = '$' + bet().toFixed(2);
}
function setEnergy(total) {
  state.energy = total;
  $('#energyTxt').textContent = `${total} / 50`;
  $('#fill').style.width = Math.min(100, (total / 50) * 100) + '%';
  const lv = total >= 50 ? 4 : total >= 35 ? 3 : total >= 20 ? 2 : total >= 10 ? 1 : 0;
  const core = $('#core');
  core.className = 'core' + (lv ? ' lvl' + lv : '');
  const names = ['STABLE', 'OVERCHARGE', 'PLASMA SHIFT', 'RIFT CHARGE', 'MELTDOWN'];
  $('#levelName').textContent = names[lv];
  state.level = lv;
  document.querySelectorAll('.ticks i').forEach(t => t.classList.toggle('on', +t.dataset.lv <= lv && lv > 0));
}
function popEnergy(delta) {
  const p = $('#epop'); p.textContent = '+' + delta + ' ENERGY';
  p.classList.remove('show'); void p.offsetWidth; p.classList.add('show');
}
async function banner(title, sub = '', cls = '') {
  const b = $('#banner'); b.className = 'banner ' + cls;
  $('#bannerT').textContent = title; $('#bannerS').textContent = sub;
  void b.offsetWidth; b.classList.add('show');
  await sleep(1500); b.classList.remove('show');
}
let winShown = 0;
function showWin(amount, animate = true) {
  const el = $('#win');
  if (!animate) { winShown = amount; el.textContent = fmt(amount); return; }
  const start = winShown, t0 = performance.now(), dur = 600;
  const step = t => {
    const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    winShown = start + (amount - start) * e;
    el.textContent = fmt(winShown);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------------- effects ---------------- */
async function fxWin(positions, pay) {
  positions.forEach(p => state.cells[p].classList.add('highlight'));
  const c = state.cells[positions[Math.floor(positions.length / 2)]];
  const tag = document.createElement('div'); tag.className = 'paytag'; tag.textContent = fmt(pay) + '\u00d7';
  c.appendChild(tag);
  SFX.clusterWin(positions.length);
  await sleep(850);
  positions.forEach(p => state.cells[p].classList.remove('highlight'));
  tag.remove();
}
async function fxClear(positions) {
  positions.forEach(p => state.cells[p].classList.add('removing'));
  SFX.cascade();
  await sleep(300);
  positions.forEach(p => { state.cells[p].classList.remove('removing'); state.cells[p].innerHTML = ''; });
}
async function fxTumble(removed, drops) {
  await fxClear(removed);
  /* per-column gravity: existing symbols slide down, new ones drop in from top */
  for (const colS of Object.keys(drops)) {
    const col = +colS, add = drops[col];
    const idxs = [0, 1, 2, 3, 4].map(r => r * 5 + col);
    const kept = idxs.filter(i => !removed.includes(i)).map(i => state.board[i]).filter(Boolean);
    const finalCol = [...add, ...kept].slice(-5);
    finalCol.forEach((sym, r) => {
      const i = r * 5 + col;
      paintCell(i, sym);
      if (r < add.length) {
        state.cells[i].classList.remove('dropin'); void state.cells[i].offsetWidth;
        state.cells[i].classList.add('dropin');
      }
    });
  }
  SFX.land();
  await sleep(420);
}
async function fxOvercharge(pos) {
  const c = state.cells[pos];
  c.classList.add('highlight'); SFX.level(1);
  await sleep(500);
  paintCell(pos, 'W'); c.classList.remove('highlight'); c.classList.add('wildfx');
  await sleep(650); c.classList.remove('wildfx');
}
async function fxPlasma(col, to) {
  SFX.level(2);
  const idxs = [0, 1, 2, 3, 4].map(r => r * 5 + col);
  idxs.forEach(i => state.cells[i].classList.add('locked'));
  await sleep(450);
  for (let r = 0; r < 5; r++) {
    const i = r * 5 + col;
    state.cells[i].classList.add('removing');
    await sleep(110);
    paintCell(i, to[r]);
    state.cells[i].classList.remove('removing');
    state.cells[i].classList.add('dropin');
  }
  await sleep(400);
  idxs.forEach(i => state.cells[i].classList.remove('locked'));
}
async function fxRiftCharge(pos) {
  SFX.level(3);
  paintCell(pos, 'S');
  state.cells[pos].classList.add('riftcell', 'dropin');
  await sleep(600);
}
async function fxRiftSplit(on) {
  if (on) {
    SFX.rift();
    boardEl.classList.add('dimmed');
    await sleep(250);
    boardEl.classList.add('riftable');
    $('#riftLine').classList.add('show');
    $('#zL').classList.add('show'); $('#zR').classList.add('show');
    await sleep(500);
  } else {
    boardEl.classList.remove('riftable');
    $('#riftLine').classList.remove('show');
    $('#zL').classList.remove('show'); $('#zR').classList.remove('show');
    boardEl.classList.remove('dimmed');
    await sleep(400);
  }
}
async function fxMeltdown(board) {
  SFX.level(4); SFX.bonus();
  $('#meltFlash').classList.add('go');
  boardEl.classList.add('shake');
  await sleep(550);
  board.forEach((s, i) => { paintCell(i, s); state.cells[i].classList.add('dropin'); });
  await sleep(700);
  boardEl.classList.remove('shake'); $('#meltFlash').classList.remove('go');
}

/* ---------------- round runner ---------------- */
async function playRound(round) {
  state.spinning = true; $('#spinBtn').disabled = true;
  setEnergy(0); showWin(0, false);
  banner('SPINNING\u2026', round.label);
  SFX.spin();
  await sleep(420);
  let running = 0;
  for (const st of round.steps) {
    switch (st.type) {
      case 'reveal':
        renderBoard(st.board);
        for (let i = 0; i < 25; i += 5) {
          state.cells.slice(i, i + 5).forEach(c => { c.classList.add('dropin'); setTimeout(() => c.classList.remove('dropin'), 400); });
          await sleep(70);
        }
        SFX.land(); await sleep(350); break;
      case 'win':
        running += st.pay * bet();
        await fxWin(st.positions, st.pay); showWin(running); break;
      case 'energy':
        popEnergy(st.delta); setEnergy(st.total); SFX.energy(); await sleep(320); break;
      case 'level':
        await banner(st.name, 'REACTOR LEVEL ' + st.level); SFX.level(st.level); break;
      case 'overcharge': await fxOvercharge(st.position); break;
      case 'plasmaShift': await fxPlasma(st.column, st.to); break;
      case 'riftCharge': await fxRiftCharge(st.position); break;
      case 'riftSplit': await fxRiftSplit(true); break;
      case 'riftMerge': await fxRiftSplit(false); break;
      case 'zoneWin': {
        running += st.pay * bet();
        st.positions.forEach(p => state.cells[p].classList.add('highlight'));
        const tag = document.createElement('div'); tag.className = 'paytag'; tag.textContent = fmt(st.pay) + '\u00d7';
        state.cells[st.positions[2]].appendChild(tag);
        SFX.clusterWin(st.size);
        await sleep(850); tag.remove();
        st.positions.forEach(p => state.cells[p].classList.remove('highlight'));
        showWin(running); break;
      }
      case 'zoneTumble': await fxTumble(st.removed, st.drops); break;
      case 'meltdown':
        await banner('REACTOR MELTDOWN', '\u00d7' + st.multiplier + ' SURGE');
        await fxMeltdown(st.board); break;
      case 'tumble': await fxTumble(st.removed, st.drops); break;
      case 'finalWin': {
        const amt = st.amount * bet();
        running = amt; showWin(amt);
        state.balance += amt; updateHUD();
        if (amt >= bet() * 100) { await banner('EPIC WIN', fmt(amt / bet()) + '\u00d7 BET', 'epic'); SFX.maxwin(); }
        else if (amt >= bet() * 20) { await banner('MEGA WIN', fmt(amt / bet()) + '\u00d7 BET', 'big'); SFX.bigwin(); }
        else if (amt >= bet() * 5) { await banner('BIG WIN', fmt(amt / bet()) + '\u00d7 BET', 'big'); SFX.bigwin(); }
        else if (amt > 0) await sleep(400);
        break;
      }
    }
  }
  state.spinning = false; $('#spinBtn').disabled = false;
}

/* ---------------- controls ---------------- */
function spin() {
  if (state.spinning) return;
  if (state.balance < bet()) { banner('INSUFFICIENT BALANCE', 'USE RESET TO TOP UP'); return; }
  state.balance -= bet(); updateHUD();
  const round = DEMO_ROUNDS[state.roundPtr % DEMO_ROUNDS.length];
  state.roundPtr++;
  playRound(round);
}
$('#spinBtn').addEventListener('click', spin);
document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); spin(); } });
$('#betDn').addEventListener('click', () => { if (!state.spinning) { state.betIdx = Math.max(0, state.betIdx - 1); updateHUD(); } });
$('#betUp').addEventListener('click', () => { if (!state.spinning) { state.betIdx = Math.min(BET_LEVELS.length - 1, state.betIdx + 1); updateHUD(); } });
$('#soundBtn').addEventListener('click', () => {
  const on = !getSound(); setSound(on); $('#soundBtn').innerHTML = on ? '&#9834;' : '&#9835;';
});
$('#resetBtn').addEventListener('click', () => {
  state.balance = 1000; state.roundPtr = 0; setEnergy(0); showWin(0, false); updateHUD();
  renderBoard(Array(25).fill('CI')); banner('PREVIEW RESET');
});
document.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', async () => {
  if (state.spinning) return;
  const r = DEMO_ROUNDS.find(x => x.id === +b.dataset.demo);
  state.balance -= bet(); updateHUD(); await playRound(r);
}));

/* ---------------- rules modal ---------------- */
const ptRows = PAYTABLE.map(r => `<tr><td class="sym">${SYMBOL_ART[r.sym]} ${r.name}</td>${
  [5, 6, 7, 8, 9, 10, 11, '12+'].map(k => `<td>${r.pays[k]}</td>`).join('')}</tr>`).join('');
$('#modal').innerHTML = `
<button class="btn close" id="closeModal">\u2715</button>
<h3>HOW TO PLAY</h3><p>Land clusters of 5 or more matching symbols connected horizontally or vertically on the 5\u00d75 reactor grid. Winning clusters explode, symbols fall and new energy pours in from above.</p>
<h3>CLUSTER WINS</h3><ul><li>Minimum cluster: 5 connected matching symbols.</li><li>Wild substitutes for any paying symbol.</li><li>Energy charges the Reactor when winning clusters land.</li><li>Rift symbols are scatters \u2014 they do not need connection.</li></ul>
<h3>CASCADES</h3><p>Winning symbols are removed, remaining symbols fall down and empty cells refill. New clusters can chain until no wins remain.</p>
<h3>REACTOR ENERGY &amp; LEVELS</h3><p>Every winning cluster adds energy based on its size (5\u2192+1, 6-7\u2192+2, 8-9\u2192+3, 10-11\u2192+4, 12+\u2192+5).</p>
<ul><li><b>10 \u2014 OVERCHARGE:</b> one symbol becomes Wild.</li><li><b>20 \u2014 PLASMA SHIFT:</b> one column transforms into high-value matter.</li><li><b>35 \u2014 RIFT CHARGE:</b> a Rift Cell tears open on the board.</li><li><b>50 \u2014 REACTOR MELTDOWN:</b> the core detonates into a high-volatility state with a surge multiplier.</li></ul>
<h3>RIFT</h3><p>When the Rift activates, the board splits into LEFT and RIGHT zones that resolve independently \u2014 each producing its own cascades \u2014 before merging back together.</p>
<h3>REACTOR OVERDRIVE (BONUS)</h3><p>In the production game, 3+ Rift symbols launch Overdrive free spins where energy persists between spins. <i>(Production feature \u2014 not part of this visual preview.)</i></p>
<h3>PAYTABLE (\u00d7 BET)</h3>
<table class="ptable"><tr><th>SYMBOL</th>${[5, 6, 7, 8, 9, 10, 11, '12+'].map(k => `<th>${k}</th>`).join('')}</tr>${ptRows}</table>
<span class="badge">DESIGN TARGETS \u2014 RTP 96\u201397% \u00b7 MAX WIN 10,000\u00d7 BET \u00b7 PENDING MATH VALIDATION</span>
<h3>PREVIEW NOTICE</h3><p>This screen is a visual prototype driven by scripted demo rounds. Outcomes shown here are illustrative only and are not produced by the certified math engine. In the production game all outcomes, energy values and transformations are predetermined by the Stake Engine math SDK and delivered through authoritative server events.</p>`;
$('#rulesBtn').addEventListener('click', () => $('#modalBg').classList.add('open'));
$('#closeModal').addEventListener('click', () => $('#modalBg').classList.remove('open'));
$('#modalBg').addEventListener('click', e => { if (e.target === $('#modalBg')) $('#modalBg').classList.remove('open'); });

/* ---------------- init ---------------- */
updateHUD(); setEnergy(0);
renderBoard(['CI','CR','PL','GE','CO','CR','CI','PL','GE','CO','CI','CR','PL','GE','CO','CR','CI','PL','GE','CO','CI','CR','PL','GE','CO']);
