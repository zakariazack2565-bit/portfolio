'use strict';
const $ = id => document.getElementById(id);
/* nav, reveal, ambient glow */
const nav = $('nav'), burger = $('burger'), links = $('links');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20), { passive: true });
burger.onclick = () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); links.classList.toggle('open', o); };
links.addEventListener('click', () => { burger.setAttribute('aria-expanded', false); links.classList.remove('open'); });
document.body.prepend(Object.assign(document.createElement('div'), { className: 'aurora', innerHTML: '<i></i><i></i><i></i>' }));
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Calculator (own parser, no eval) */
(() => {
  let exp = '', done = false;
  const fmt = v => String(+v.toPrecision(12));
  const ev = s => {
    const t = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').match(/\d*\.?\d+|[-+*/()%]/g) || []; let i = 0;
    const fin = v => { while (t[i] === '%') { v /= 100; i++; } return v; };
    const num = () => { const x = t[i++]; if (x === '(') { const v = add(); if (t[i++] !== ')') throw 0; return fin(v); } if (x === '-') return -num(); if (x === undefined || isNaN(+x)) throw 0; return fin(+x); };
    const mul = () => { let v = num(); while (t[i] === '*' || t[i] === '/') { const o = t[i++], r = num(); v = o === '*' ? v * r : v / r; } return v; };
    const add = () => { let v = mul(); while (t[i] === '+' || t[i] === '-') { const o = t[i++], r = mul(); v = o === '+' ? v + r : v - r; } return v; };
    const v = add(); if (i < t.length || !isFinite(v)) throw 0; return v;
  };
  const out = () => { $('cexp').textContent = exp; let r = '0'; if (exp) { try { r = fmt(ev(exp)); } catch { r = '…'; } } $('cres').textContent = r; };
  const press = k => {
    if (done && /[\d.(]/.test(k)) exp = ''; done = false;
    if (k === 'C') exp = ''; else if (k === '⌫') exp = exp.slice(0, -1);
    else if (k === '=') { try { exp = fmt(ev(exp)); done = true; } catch { $('cres').textContent = 'Error'; return; } }
    else exp += k; out();
  };
  const K = ['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','(','0','.',')','='];
  $('keys').innerHTML = K.map(k => `<button class="${'÷×−+'.includes(k) ? 'op' : 'C⌫%()'.includes(k) ? 'fn' : k === '=' ? 'eq' : ''}" data-k="${k}">${k}</button>`).join('');
  $('keys').onclick = e => { const b = e.target.closest('button'); if (b) press(b.dataset.k); };
  addEventListener('keydown', e => {
    if (e.target.closest('input,select,textarea') || e.ctrlKey || e.metaKey) return;
    const k = { '*': '×', '/': '÷', '-': '−', Enter: '=', Backspace: '⌫', Escape: 'C' }[e.key] || e.key;
    if (K.includes(k)) { e.preventDefault(); press(k); }
  });
  out();
})();

/* Shared */
const SYM = { usd: '$', eur: '€', inr: '₹', bdt: '৳' };
const nf = (min, max) => new Intl.NumberFormat('en-US', { minimumFractionDigits: min, maximumFractionDigits: max });

/* DevEx: Robux -> $, €, ₹, ৳ (rates: open.er-api.com, fallback fawazahmed0 currency-api) */
let FX = null;
function devex() {
  const r = Math.max(0, +$('rbx').value || 0), usd = r * +$('rate').value;
  $('devres').innerHTML = Object.keys(SYM).map(c => `<div class="res"><span>${SYM[c]}</span><b>${FX ? SYM[c] + nf(2, 2).format(usd * FX[c]) : c === 'usd' ? '$' + nf(2, 2).format(usd) : '—'}</b><small>${c.toUpperCase()}</small></div>`).join('');
  $('devnote').textContent = (r < 30000 ? `Below the 30,000 earned Robux DevEx minimum (${(30000 - r).toLocaleString()} short). ` : 'Meets the 30,000 earned Robux minimum. ') + (FX ? 'Fiat rates: ' + String(FX.t).slice(0, 16) + '.' : 'Live exchange rates unavailable.');
}
async function loadFX() {
  const src = [async () => { const j = await (await fetch('https://open.er-api.com/v6/latest/USD')).json(); if (j.result !== 'success') throw 0; return { eur: j.rates.EUR, inr: j.rates.INR, bdt: j.rates.BDT, t: j.time_last_update_utc }; },
    async () => { const j = await (await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')).json(); return { eur: j.usd.eur, inr: j.usd.inr, bdt: j.usd.bdt, t: j.date }; }];
  for (const f of src) { try { FX = { usd: 1, ...(await f()) }; break; } catch {} }
  devex(); paintAll();
}
$('rbx').oninput = devex; $('rate').onchange = devex; devex(); loadFX();

/* Crypto prices: live ticks over the Binance public WebSocket (BTC, LTC, ETH, SOL).
   USDT and the 60s fallback come from CoinGecko. Only changed text nodes are updated. */
const COINS = [['bitcoin','Bitcoin','BTC','bitcoin','F7931A'],['litecoin','Litecoin','LTC','litecoin','345D9D'],['ethereum','Ethereum','ETH','ethereum','9a9ab8'],['tether','USDT','Tether, Ethereum network','tether','26A17B'],['solana','Solana','SOL','solana','9945FF']];
const PAIR = { bitcoin: 'BTCUSDT', litecoin: 'LTCUSDT', ethereum: 'ETHUSDT', solana: 'SOLUSDT' };
let cur = 'usd', data = null; const live = {}, last = {};
const OV = (() => { try { return JSON.parse(localStorage.getItem('ov')) || {}; } catch { return {}; } })();
const rate = c => c === 'usd' ? 1 : OV[c] > 0 ? OV[c] : FX ? FX[c] : data?.tether ? data.tether[c] / data.tether.usd : null;
$('seg').innerHTML = Object.keys(SYM).map(c => `<button data-c="${c}" class="${c === cur ? 'on' : ''}">${SYM[c]} ${c.toUpperCase()}</button>`).join('');
$('plist').innerHTML = COINS.map(([id, n, sub, slug, col]) => `<div class="coincard"><div class="coinrow"><img src="https://cdn.simpleicons.org/${slug}/${col}" alt="" width="34" height="34"><div class="cn"><b>${n}</b><small>${sub}</small></div><div class="cp"><b id="p-${id}">—</b><small id="c-${id}"></small></div></div><div class="det"><div class="st">${[['H','24h high'],['L','24h low'],['V','24h volume'],['M','Market cap'],['R','CoinGecko ref. (diff)']].map(([k, l]) => `<div><small>${l}</small><b id="s-${id}-${k}">—</b></div>`).join('')}</div><div class="pj">${['1m','1h','12h','24h'].map(k => `<div class="pt" id="j-${id}-${k}"><small>Est. in ${k}</small><b>—</b><em></em><i></i></div>`).join('')}</div></div></div>`).join('');
function paint(id) {
  const L = live[id], d = data?.[id], r = rate(cur);
  const p = L ? (r ? L.p * (data?.tether?.usd || 1) * r : null) : d?.[cur], ch = L ? (L.p - L.o) / L.o * 100 : d?.[cur + '_24h_change'];
  if (p == null) return;
  const pe = $('p-' + id), ce = $('c-' + id), dp = p < 1 ? 4 : 2;
  pe.textContent = SYM[cur] + nf(dp, dp).format(p);
  if (last[id] != null && p !== last[id]) { pe.classList.remove('tu', 'td'); void pe.offsetWidth; pe.classList.add(p > last[id] ? 'tu' : 'td'); }
  last[id] = p; detail(id, p, r);
  ce.className = ch >= 0 ? 'up' : 'dn'; ce.textContent = ch == null ? '' : (ch >= 0 ? '▲ ' : '▼ ') + Math.abs(ch).toFixed(2) + '%';
}
const paintAll = () => COINS.forEach(c => paint(c[0]));
$('seg').onclick = e => { const b = e.target.closest('button'); if (!b) return; cur = b.dataset.c; [...$('seg').children].forEach(x => x.classList.toggle('on', x === b)); for (const k in last) delete last[k]; showOv(); paintAll(); };

function showOv() { $('ovbox').hidden = cur === 'usd'; $('ovc').textContent = cur.toUpperCase(); $('ov').value = OV[cur] || ''; }
$('ov').oninput = () => { OV[cur] = +$('ov').value || 0; try { localStorage.setItem('ov', JSON.stringify(OV)); } catch {} for (const k in last) delete last[k]; paintAll(); };
async function loadPrices() {
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + COINS.map(c => c[0]).join() + '&vs_currencies=usd,eur,inr,bdt&include_24hr_change=true&include_market_cap=true');
    if (!r.ok) throw 0; data = await r.json(); paintAll();
    if (!ws || ws.readyState !== 1) $('pnote').textContent = 'Updated ' + new Date().toLocaleTimeString() + ' via CoinGecko';
  } catch { if (!data) $('pnote').textContent = 'Could not load prices. Try Refresh in a minute.'; }
}
$('pref').onclick = loadPrices;
setInterval(() => { if (!document.hidden) loadPrices(); }, 60000);

let ws, retry = 0, wsT, stop = false;
const setLive = (on, t) => { $('plive').classList.toggle('on', on); $('plive').lastElementChild.textContent = t; };
function connect() {
  stop = false; clearTimeout(wsT);
  ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=' + Object.values(PAIR).map(s => s.toLowerCase() + '@miniTicker').join('/'));
  ws.onopen = () => { retry = 0; setLive(true, 'LIVE'); $('pnote').textContent = 'Live from Binance (USDT converted to USD). USDT row via CoinGecko.'; };
  ws.onmessage = ({ data: m }) => { const t = JSON.parse(m).data, id = t && Object.keys(PAIR).find(k => PAIR[k] === t.s); if (id) { live[id] = { p: +t.c, o: +t.o, h: +t.h, l: +t.l, q: +t.q }; paint(id); } };
  ws.onclose = () => { if (stop) return; setLive(false, 'RECONNECTING'); wsT = setTimeout(connect, Math.min(30000, 1000 * 2 ** retry++)); };
  ws.onerror = () => ws.close();
}
document.addEventListener('visibilitychange', () => { if (document.hidden) { stop = true; clearTimeout(wsT); ws && ws.close(); setLive(false, 'PAUSED'); } else { connect(); loadPrices(); } });
addEventListener('pagehide', () => { stop = true; clearTimeout(wsT); ws && ws.close(); });

/* Details + estimates. Estimate = current price moved by HALF of the move seen over the same look-back window
   (momentum, damped), with a +/-1 standard deviation range from recent volatility. A projection, not a prediction. */
const proj = {}, sd = a => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
const usd$ = (v, dp) => SYM[cur] + nf(dp, dp).format(v);
const big = v => { const a = Math.abs(v); return SYM[cur] + (a >= 1e12 ? (v / 1e12).toFixed(2) + 'T' : a >= 1e9 ? (v / 1e9).toFixed(2) + 'B' : a >= 1e6 ? (v / 1e6).toFixed(2) + 'M' : nf(0, 0).format(v)); };
function detail(id, p, r) {
  const L = live[id], d = data?.[id], set = (k, v) => { const e = $(`s-${id}-${k}`); if (e) e.textContent = v; }, dp = p < 1 ? 4 : 2;
  const f = v => usd$(v, v < 1 ? 4 : 2), mc = d?.[cur + '_market_cap'];
  if (L && r) { set('H', f(L.h * r)); set('L', f(L.l * r)); set('V', big(L.q * r)); }
  set('M', mc ? big(mc) : '—');
  if (d?.[cur] != null) { const dv = (p / d[cur] - 1) * 100; set('R', f(d[cur]) + ' (' + (dv >= 0 ? '+' : '') + dv.toFixed(2) + '%)'); }
  const J = proj[id]; if (!J) return;
  [['1m', J.m1, J.s1], ['1h', J.h1, J.sh], ['12h', J.h12, J.sh * Math.sqrt(12)], ['24h', J.h24, J.sh * Math.sqrt(24)]].forEach(([k, past, sig]) => {
    const q = p * (1 + .5 * past), pct = (q / p - 1) * 100, el = $(`j-${id}-${k}`);
    el.className = 'pt ' + (q >= p ? 'up' : 'dn');
    el.children[1].textContent = usd$(q, dp); el.children[2].textContent = (q >= p ? '▲ +' : '▼ ') + pct.toFixed(2) + '%';
    el.children[3].textContent = 'Range ' + usd$(p * (1 - sig), dp) + ' – ' + usd$(p * (1 + sig), dp);
  });
}
async function history(id, sym) {
  const ret = a => a.slice(1).map((v, i) => v / a[i] - 1), ok = (a, n) => Array.isArray(a) && a.length >= n;
  try { // Binance candles: exact 1m and 1h closes
    const [m, h] = await Promise.all(['1m&limit=61', '1h&limit=25'].map(async q => (await (await fetch(`https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${q}`)).json()).map(k => +k[4])));
    if (ok(m, 61) && ok(h, 25)) return { m1: m[60] / m[59] - 1, h1: m[60] / m[0] - 1, h12: h[24] / h[12] - 1, h24: h[24] / h[0] - 1, s1: sd(ret(m)), sh: sd(ret(h)) };
  } catch {}
  const j = await (await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`)).json(); // backup: 5-minute points
  const a = j.prices.map(x => x[1]), n = a.length - 1; if (n < 150) throw 0;
  const h1 = a[n] / a[n - 12] - 1, s5 = sd(ret(a));
  return { m1: (1 + h1) ** (1 / 60) - 1, h1, h12: a[n] / a[n - 144] - 1, h24: a[n] / a[0] - 1, s1: s5 / Math.sqrt(5), sh: s5 * Math.sqrt(12) };
}
async function loadKlines() {
  await Promise.all(Object.keys(PAIR).map(async id => { try { proj[id] = await history(id, PAIR[id]); } catch {} }));
  $('jnote').textContent = Object.keys(proj).length ? '' : ' Price history could not be loaded right now, retrying.';
  paintAll();
}
setInterval(() => { if (!document.hidden) loadKlines(); }, 120000);
loadKlines(); loadPrices(); connect();

/* Portfolio prompt generator. Empty fields fall back to "Example". */
const PROMPT = `Build a premium, modern, animated personal developer portfolio for {{name}}. Do not reuse anyone else's personal data: use only the details below.

DETAILS
- Name: {{name}}
- Role line: {{tag}}
- Bio: {{bio}}
- Discord user ID: {{did}}
- GitHub: {{gh}}
- Telegram: {{tg}}
- Email: {{mail}}
- Languages / tools: {{stack}}
If a value says "Example", keep it as an easy-to-edit placeholder.

STACK
Plain HTML, CSS and JavaScript in a frontend/ folder, plus a tiny zero-dependency Node.js static server in backend/server.js (serves frontend/ and the route /tools). No frameworks, no build step. Include README.md, package.json, .gitignore and .env.example.

DESIGN
Black background, white text, purple (#a855f7) neon accents, dark charcoal cards, large rounded rectangles, subtle glassmorphism, soft shadows, Inter font. Responsive on desktop, tablet and mobile. Respect prefers-reduced-motion. No stock photos, fake statistics or fake testimonials.

HOME PAGE
1. Sticky glass navbar on scroll: logo, links (Home, About, Stack, Projects, Discord, Tools), a "Contact Me" button, animated hamburger on mobile, scroll progress bar.
2. Hero: "Hi, I'm {{name}}", the role line, the bio, View Projects and Contact Me buttons, a "Currently building" badge, animated purple particles with a soft aurora and grid background, staggered entrance animation, and a short boot-loader screen on the first visit.
3. LIVE DISCORD CARD beside the hero (portrait card that grows with its content). Use a persistent WebSocket to Lanyard (wss://api.lanyard.rest/socket) for user ID {{did}}: handle op 1 hello, send heartbeat op 3, subscribe with op 2. Show avatar and avatar decoration, animated status dot (online, idle, dnd, offline), display name, @username, custom status, a LIVE badge and a banner. Activity cards: playing (elapsed timer), Spotify (spinning album art and progress bar), streaming, watching, competing. With no activity show nothing extra. Two or more activities sit side by side. Auto-reconnect with backoff, a one-off REST fallback (never polling), update only the changed DOM nodes, and show toast notifications when the presence changes. In the README, tell the owner to join the Lanyard Discord server (discord.gg/lanyard) first.
4. About: "A little about me" with animated cards.
5. Code Stack: categorized, animated technology cards built from {{stack}}, plus a playful Vibecoding section.
6. Projects: card grid driven by a JS array (name, description, technology badges, icon, optional GitHub and live-demo buttons), easy to extend.
7. Tools section: cards linking to /tools.
8. "Find me around the internet": GitHub first ({{gh}}), then Discord and Telegram ({{tg}}), all opening in new tabs.
9. Contact Me card with {{email}}, Discord, Telegram and GitHub. Footer with social links.

EFFECTS
Cursor glow and ring, a card spotlight that follows the mouse, 3D tilt on the Discord card, magnetic buttons, scroll reveal with stagger, heading decode effect, a tech marquee, an animated conic-gradient border on the Discord card, confetti on copy, and a Konami-code easter egg.

TOOLS PAGE (/tools)
- Calculator with its own expression parser (no eval) and keyboard support.
- DevEx converter: Robux to $, EUR, INR and BDT, with a rate selector, the 30,000 Robux minimum note, and exchange rates from open.er-api.com with a fallback.
- Live crypto prices for BTC, LTC, ETH, USDT and SOL: Binance public WebSocket for ticks, CoinGecko as fallback and for USDT and market cap, a currency switch, 24h high, low and volume, and clearly labeled 1m, 1h, 12h and 24h projections (green if up, red if down) with a note that they are estimates, not financial advice.
- A prompt generator that lets visitors build their own portfolio.

RULES
No API keys or secrets in frontend code. Use only public, keyless APIs. Never ask for or store private keys. Do not use Discord user tokens or self-bots. Keep it fast: no heavy libraries, one requestAnimationFrame loop, pause work when the tab is hidden, and clean up WebSocket connections.

Deliver complete working files, then a short list of what to edit (name, links, projects).`;
const PF = [['name','Name'],['tag','Role line'],['bio','Short bio'],['did','Discord user ID'],['gh','GitHub URL'],['tg','Telegram URL'],['mail','Email'],['stack','Languages / tools']];
$('pfFields').innerHTML = PF.map(([k, l]) => `<label>${l}<input id="pf-${k}" placeholder="Example" autocomplete="off"></label>`).join('');
const pfBuild = () => { $('pfOut').value = PROMPT.replace(/\{\{(\w+)\}\}/g, (_, k) => $('pf-' + k).value.trim() || 'Example'); };
$('pfFields').addEventListener('input', pfBuild); pfBuild();
$('pfCopy').onclick = async () => {
  const b = $('pfCopy');
  try { await navigator.clipboard.writeText($('pfOut').value); } catch { $('pfOut').select(); document.execCommand('copy'); }
  b.textContent = 'Copied!'; b.classList.add('ok'); setTimeout(() => { b.textContent = 'Copy prompt'; b.classList.remove('ok'); }, 1600);
};
