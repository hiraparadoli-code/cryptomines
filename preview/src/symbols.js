/* REACTOR RIFT — preview symbol artwork (original generated SVG placeholders).
   Production will replace these with final art. No external assets used. */

const grad = (id, c1, c2) =>
  `<defs><radialGradient id="${id}" cx="38%" cy="30%" r="80%">
     <stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/>
   </radialGradient></defs>`;

const svg = inner =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

export const SYMBOL_ART = {
  /* LOW */
  CI: svg(grad('gCI','#7ddba8','#0f3d2a') +
    `<rect x="14" y="14" width="36" height="36" rx="6" fill="url(#gCI)" stroke="#9fffca" stroke-width="1.5"/>
     <path d="M22 32h8l4-8 6 16 4-8h8" fill="none" stroke="#eafff2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
     <circle cx="22" cy="22" r="2.6" fill="#eafff2"/><circle cx="42" cy="42" r="2.6" fill="#eafff2"/>`),
  CR: svg(grad('gCR','#8fd9ff','#0e2f4e') +
    `<path d="M32 8 L50 26 L32 56 L14 26 Z" fill="url(#gCR)" stroke="#d9f4ff" stroke-width="1.5"/>
     <path d="M32 8 L32 56 M14 26 L50 26" stroke="#eafaff" stroke-width="1.4" opacity=".7"/>
     <path d="M23 17 L32 8 L41 17" fill="none" stroke="#ffffff" stroke-width="2" opacity=".85"/>`),
  PL: svg(grad('gPL','#ffd58a','#5e3308') +
    `<circle cx="32" cy="32" r="18" fill="url(#gPL)" stroke="#ffe9c2" stroke-width="1.5"/>
     <path d="M36 18 C24 26 26 32 30 34 C22 36 24 46 36 46 C48 46 48 30 40 24 C42 20 36 18 36 18Z" fill="#fff3d6" opacity=".92"/>`),
  GE: svg(grad('gGE','#cfd6df','#2b3038') +
    `<g fill="url(#gGE)" stroke="#eef2f7" stroke-width="1.4">
       <circle cx="32" cy="32" r="16"/>
       ${[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180;return `<rect x="28" y="10" width="8" height="10" rx="2" transform="rotate(${a} 32 32)"/>`}).join('')}
     </g>
     <circle cx="32" cy="32" r="6" fill="#12161c" stroke="#eef2f7" stroke-width="1.4"/>`),
  /* HIGH */
  CO: svg(grad('gCO','#ffbfa0','#6b1d0d') +
    `<circle cx="32" cy="32" r="20" fill="url(#gCO)" stroke="#ffd9c2" stroke-width="1.6"/>
     <circle cx="32" cy="32" r="12" fill="none" stroke="#fff0e6" stroke-width="2" stroke-dasharray="4 3"/>
     <circle cx="32" cy="32" r="4.5" fill="#fff4ec"/>`),
  RE: svg(grad('gRE','#a9f2e2','#0d4a41') +
    `<polygon points="32,6 53,18 53,42 32,54 11,42 11,18" fill="url(#gRE)" stroke="#d5fff4" stroke-width="1.6"/>
     <circle cx="32" cy="30" r="9" fill="none" stroke="#eafff9" stroke-width="2.4"/>
     <path d="M32 12v6M32 42v6M16 21l5 3M43 24l5-3M16 39l5-3M43 36l5 3" stroke="#eafff9" stroke-width="2" stroke-linecap="round"/>`),
  QU: svg(grad('gQU','#c9b6ff','#2c1a5e') +
    `<ellipse cx="32" cy="32" rx="22" ry="9" fill="none" stroke="#ded2ff" stroke-width="1.8"/>
     <ellipse cx="32" cy="32" rx="9" ry="22" fill="none" stroke="#ded2ff" stroke-width="1.8"/>
     <ellipse cx="32" cy="32" rx="18" ry="18" fill="none" stroke="#b79bff" stroke-width="1.2" opacity=".6"/>
     <circle cx="32" cy="32" r="5.5" fill="url(#gQU)" stroke="#efe7ff" stroke-width="1.4"/>`),
  SI: svg(`<defs><radialGradient id="gSI" cx="50%" cy="50%" r="60%">
     <stop offset="0%" stop-color="#000"/><stop offset="55%" stop-color="#1b0b33"/>
     <stop offset="80%" stop-color="#8a4dff"/><stop offset="100%" stop-color="#2a0f4d"/></radialGradient></defs>
     <circle cx="32" cy="32" r="21" fill="url(#gSI)"/>
     <path d="M32 6 A26 26 0 0 1 58 32" fill="none" stroke="#e2ccff" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>
     <path d="M32 58 A26 26 0 0 1 8 34" fill="none" stroke="#a06bff" stroke-width="2" stroke-linecap="round" opacity=".7"/>
     <circle cx="32" cy="32" r="8" fill="#05030a"/>`),
  /* SPECIALS */
  W: svg(`<defs><linearGradient id="gW" x1="0" y1="0" x2="1" y2="1">
     <stop offset="0%" stop-color="#ffe9a8"/><stop offset="50%" stop-color="#ff9d3c"/><stop offset="100%" stop-color="#c94f0e"/></linearGradient></defs>
     <path d="M32 4 L58 20 L58 44 L32 60 L6 44 L6 20 Z" fill="url(#gW)" stroke="#fff3cf" stroke-width="1.6"/>
     <text x="32" y="41" text-anchor="middle" font-family="Arial Black,Arial" font-size="24" font-weight="900" fill="#3a1500">W</text>`),
  E: svg(`<defs><radialGradient id="gE" cx="50%" cy="45%" r="65%">
     <stop offset="0%" stop-color="#eaffff"/><stop offset="45%" stop-color="#37e6ff"/><stop offset="100%" stop-color="#0a4a66"/></radialGradient></defs>
     <circle cx="32" cy="32" r="20" fill="url(#gE)"/>
     <path d="M36 12 L22 36 h8 l-6 16 L46 26 h-9 z" fill="#ffffff" stroke="#0a4a66" stroke-width="1"/>`),
  S: svg(`<defs><linearGradient id="gS" x1="0" y1="0" x2="0" y2="1">
     <stop offset="0%" stop-color="#f6e9ff"/><stop offset="50%" stop-color="#a45cff"/><stop offset="100%" stop-color="#38106e"/></linearGradient></defs>
     <path d="M30 2 L36 14 L31 22 L40 30 L33 40 L38 50 L32 62 L27 48 L33 40 L24 31 L31 22 L25 13 Z"
       fill="url(#gS)" stroke="#efe0ff" stroke-width="1.2"/>
     <path d="M14 10 L20 16 M50 12 L44 18 M12 48 L19 44 M52 46 L45 42" stroke="#c9a6ff" stroke-width="2" stroke-linecap="round"/>`),
};

export const SYMBOL_NAMES = {
  CI:'CIRCUIT', CR:'CRYSTAL', PL:'PLASMA', GE:'GEAR',
  CO:'CORE', RE:'REACTOR', QU:'QUANTUM', SI:'SINGULARITY',
  W:'WILD', E:'ENERGY', S:'RIFT',
};
