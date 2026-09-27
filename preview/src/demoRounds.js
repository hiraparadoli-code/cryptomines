/* REACTOR RIFT — PREVIEW MODE ONLY.
   Deterministic scripted demo rounds (no Math.random, no Date.now-driven logic).
   This file is isolated preview data. It is NOT the production math engine and
   must never be imported by production game code. Production outcomes come from
   the Stake Engine math SDK / RGS event stream.

   Round script format (mirrors the shape of Engine events conceptually):
     { id, label, bet?, steps: [ ... ] }
   Step types:
     reveal      { board: 25 symbols }
     win         { positions[], symbol, size, pay }        // cluster win highlight
     energy      { delta, total }                          // reactor energy update
     level       { level, name }                           // threshold banner
     overcharge  { position }                              // -> WILD (predetermined)
     plasmaShift { column, to: [symbols] }                 // column transform
     riftCharge  { position }                              // rift cell appears
     riftSplit   {}                                        // board splits L | RIFT | R
     zoneWin     { zone:'L'|'R', positions[], symbol, size, pay }
     zoneTumble  { zone:'L'|'R', removed:[], drops:{col:[symbols top->down]} }
     riftMerge   {}
     meltdown    { multiplier, board }                     // level-4 transformation
     tumble      { removed:[], drops:{col:[symbols]} }     // base cascade
     finalWin    { amount }                                // authoritative round total
*/

export const DEMO_ROUNDS = [
  /* ROUND 1 — normal cluster + cascade */
  { id: 1, label: 'BASE CLUSTER + CASCADE', steps: [
    { type:'reveal', board:[
      'CI','CR','PL','GE','CO',
      'CR','CI','CI','CI','PL',
      'GE','CI','RE','CR','SI',
      'CI','QU','CI','GE','CR',
      'PL','GE','CR','CO','CI' ]},
    { type:'win', positions:[6,7,8,11,16], symbol:'CI', size:5, pay:0.5 },
    { type:'energy', delta:1, total:1 },
    { type:'tumble', removed:[6,7,8,11,16], drops:{
        1:['E','CR'], 2:['GE','PL'], 3:['CR','CI'] }},
    { type:'win', positions:[1,2,3,9,13], symbol:'CR', size:5, pay:0.5 },
    { type:'energy', delta:1, total:2 },
    { type:'finalWin', amount:1.0 },
  ]},

  /* ROUND 2 — large cluster, energy surge */
  { id: 2, label: 'LARGE CLUSTER · ENERGY SURGE', steps: [
    { type:'reveal', board:[
      'PL','PL','PL','GE','CR',
      'PL','PL','PL','CI','QU',
      'GE','PL','PL','PL','SI',
      'CR','GE','CO','CI','PL',
      'QU','SI','CR','GE','CO' ]},
    { type:'win', positions:[0,1,2,5,6,7,11,12,13], symbol:'PL', size:8, pay:2 },
    { type:'energy', delta:3, total:5 },
    { type:'tumble', removed:[0,1,2,5,6,7,11,12,13], drops:{
        0:['E','CR','GE'], 1:['QU','CI','PL'], 2:['SI','CR','GE'], 3:['E','PL'] }},
    { type:'win', positions:[3,8,14,18,19,20], symbol:'GE', size:6, pay:1 },
    { type:'energy', delta:2, total:7 },
    { type:'finalWin', amount:3.0 },
  ]},

  /* ROUND 3 — Overcharge (level 1) */
  { id: 3, label: 'LEVEL 1 · OVERCHARGE', steps: [
    { type:'reveal', board:[
      'CO','RE','CO','CR','CI',
      'CO','CO','CO','GE','PL',
      'RE','CO','QU','SI','CR',
      'CO','GE','CI','RE','QU',
      'CR','PL','SI','CO','GE' ]},
    { type:'win', positions:[0,5,6,7,10,15], symbol:'CO', size:6, pay:1.5 },
    { type:'energy', delta:2, total:9 },
    { type:'tumble', removed:[0,5,6,7,10,15], drops:{
        0:['E','PL'], 1:['CR','SI'], 2:['GE','CO'], 3:['CI'] }},
    { type:'win', positions:[1,2,3,8,9], symbol:'RE', size:5, pay:0.75 },
    { type:'energy', delta:1, total:10 },
    { type:'level', level:1, name:'OVERCHARGE' },
    { type:'overcharge', position:17 },
    { type:'win', positions:[16,17,18,21,22], symbol:'RE', size:5, pay:0.75 },
    { type:'finalWin', amount:3.0 },
  ]},

  /* ROUND 4 — Plasma Shift (level 2) */
  { id: 4, label: 'LEVEL 2 · PLASMA SHIFT', steps: [
    { type:'reveal', board:[
      'GE','CI','CR','PL','CO',
      'CI','GE','GE','CI','CR',
      'CR','CI','GE','QU','SI',
      'GE','CR','CI','GE','PL',
      'CI','QU','SI','CR','GE' ]},
    { type:'win', positions:[0,11,16,17,22], symbol:'CR', size:5, pay:0.5 },
    { type:'energy', delta:1, total:18 },
    { type:'tumble', removed:[0,11,16,17,22], drops:{
        0:['E','PL'], 2:['SI','CR'], 3:['E','CO'] }},
    { type:'win', positions:[4,9,13,14,19], symbol:'CO', size:5, pay:0.75 },
    { type:'energy', delta:1, total:20 },
    { type:'level', level:2, name:'PLASMA SHIFT' },
    { type:'plasmaShift', column:2, to:['RE','RE','SI','RE','RE'] },
    { type:'win', positions:[2,7,12,17,21], symbol:'RE', size:5, pay:2 },
    { type:'finalWin', amount:3.5 },
  ]},

  /* ROUND 5 — Rift Charge (level 3), rift appears */
  { id: 5, label: 'LEVEL 3 · RIFT CHARGE', steps: [
    { type:'reveal', board:[
      'QU','SI','QU','CR','GE',
      'SI','QU','S','QU','CI',
      'QU','SI','QU','SI','PL',
      'CR','GE','SI','QU','SI',
      'GE','PL','QU','SI','QU' ]},
    { type:'win', positions:[0,1,5,6,10], symbol:'QU', size:5, pay:1.5 },
    { type:'energy', delta:1, total:33 },
    { type:'tumble', removed:[0,1,5,6,10], drops:{
        0:['E','SI','CR'], 1:['GE','PL','QU'] }},
    { type:'win', positions:[2,7,12,16,21], symbol:'SI', size:5, pay:2 },
    { type:'energy', delta:1, total:35 },
    { type:'level', level:3, name:'RIFT CHARGE' },
    { type:'riftCharge', position:12 },
    { type:'finalWin', amount:3.5 },
  ]},

  /* ROUND 6 — Rift activates: split board, independent zones */
  { id: 6, label: 'RIFT ACTIVE · SPLIT BOARD', steps: [
    { type:'reveal', board:[
      'CR','CR','S','PL','PL',
      'CI','CR','CR','CR','GE',
      'CR','CI','S','GE','PL',
      'PL','CR','CI','CR','GE',
      'GE','CI','CR','PL','CR' ]},
    { type:'riftSplit' },
    { type:'zoneWin', zone:'L', positions:[0,1,5,10,13], symbol:'CR', size:5, pay:1.5 },
    { type:'energy', delta:1, total:36 },
    { type:'zoneTumble', zone:'L', removed:[0,1,5,10,13], drops:{
        0:['QU','SI','GE'], 1:['CI','PL','CR'] }},
    { type:'zoneWin', zone:'R', positions:[2,3,8,9,14], symbol:'PL', size:5, pay:0.75 },
    { type:'energy', delta:1, total:37 },
    { type:'zoneTumble', zone:'R', removed:[2,3,8,9,14], drops:{
        3:['E','CO','QU'], 4:['SI','RE','GE'] }},
    { type:'zoneWin', zone:'L', positions:[6,7,11,12,17], symbol:'SI', size:5, pay:2 },
    { type:'energy', delta:1, total:38 },
    { type:'riftMerge' },
    { type:'finalWin', amount:4.25 },
  ]},

  /* ROUND 7 — Meltdown (level 4) */
  { id: 7, label: 'LEVEL 4 · REACTOR MELTDOWN', steps: [
    { type:'reveal', board:[
      'SI','SI','QU','SI','SI',
      'SI','QU','SI','SI','QU',
      'QU','SI','SI','QU','SI',
      'SI','QU','SI','SI','QU',
      'QU','SI','SI','QU','SI' ]},
    { type:'win', positions:[0,1,3,4,5,6,7,8,9,10,11,12,13], symbol:'SI', size:12, pay:10 },
    { type:'energy', delta:5, total:50 },
    { type:'level', level:4, name:'REACTOR MELTDOWN' },
    { type:'meltdown', multiplier:5, board:[
      'SI','SI','W','SI','SI',
      'SI','W','SI','SI','W',
      'W','SI','SI','W','SI',
      'SI','W','SI','SI','W',
      'W','SI','SI','W','SI' ]},
    { type:'win', positions:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24], symbol:'SI', size:25, pay:50 },
    { type:'finalWin', amount:300 },
  ]},

  /* ROUND 8 — Big win presentation */
  { id: 8, label: 'MEGA WIN SHOWCASE', steps: [
    { type:'reveal', board:[
      'RE','RE','RE','GE','CR',
      'RE','RE','RE','CI','QU',
      'GE','RE','RE','SI','CR',
      'RE','CI','QU','RE','RE',
      'CR','GE','SI','CR','QU' ]},
    { type:'win', positions:[0,1,2,5,6,7,11,12,15], symbol:'RE', size:9, pay:6 },
    { type:'energy', delta:3, total:41 },
    { type:'tumble', removed:[0,1,2,5,6,7,11,12,15], drops:{
        0:['E','SI','CR','GE'], 1:['QU','CR','PL','SI'], 2:['E','CO','QU','CR'],
        3:['RE'], 4:['CI'] }},
    { type:'win', positions:[3,8,13,18,19,20,21,22], symbol:'CR', size:8, pay:3 },
    { type:'energy', delta:3, total:44 },
    { type:'win', positions:[4,9,14,23,24], symbol:'QU', size:5, pay:1.5 },
    { type:'energy', delta:1, total:45 },
    { type:'finalWin', amount:10.5 },
  ]},
];

export const PAYTABLE = [
  { sym:'SI', name:'SINGULARITY', tier:'HIGH', pays:{5:2,6:3,7:5,8:8,9:12,10:20,11:30,'12+':50} },
  { sym:'QU', name:'QUANTUM',     tier:'HIGH', pays:{5:1.5,6:2.5,7:4,8:6,9:10,10:15,11:25,'12+':40} },
  { sym:'RE', name:'REACTOR',     tier:'HIGH', pays:{5:1,6:2,7:3,8:5,9:8,10:12,11:20,'12+':30} },
  { sym:'CO', name:'CORE',        tier:'HIGH', pays:{5:0.75,6:1.5,7:2.5,8:4,9:6,10:10,11:15,'12+':25} },
  { sym:'GE', name:'GEAR',        tier:'LOW',  pays:{5:0.5,6:1,7:1.5,8:2.5,9:4,10:6,11:10,'12+':15} },
  { sym:'PL', name:'PLASMA',      tier:'LOW',  pays:{5:0.5,6:0.75,7:1.25,8:2,9:3,10:5,11:8,'12+':12} },
  { sym:'CR', name:'CRYSTAL',     tier:'LOW',  pays:{5:0.25,6:0.5,7:1,8:1.5,9:2.5,10:4,11:6,'12+':10} },
  { sym:'CI', name:'CIRCUIT',     tier:'LOW',  pays:{5:0.25,6:0.5,7:0.75,8:1.25,9:2,10:3,11:5,'12+':8} },
];
