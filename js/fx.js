'use strict';
/* ULTRA layer: loader, cursor, tilt, terminal, toasts, confetti, easter eggs */
(() => {
const R = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const $ = id => document.getElementById(id), body = document.body, root = document.documentElement;
const mk = (t, c, h) => { const e = document.createElement(t); e.className = c; if (h) e.innerHTML = h; return e; };

// boot loader (once per session)
let seen = false; try { seen = sessionStorage.getItem('booted'); sessionStorage.setItem('booted', 1); } catch {}
if (!R && !seen) {
  const b = mk('div', 'boot', '<div><b>zack<span>.dev</span></b><i><u></u></i><small>booting…</small></div>');
  body.append(b); root.classList.add('booting'); b.offsetWidth; b.classList.add('go');
  setTimeout(() => { b.classList.add('off'); root.classList.remove('booting'); setTimeout(() => b.remove(), 800); }, 1300);
}
// ambient layers + scroll progress
body.prepend(mk('div', 'aurora', '<i></i><i></i><i></i>'));
const prog = mk('div', 'prog'); body.append(prog);
addEventListener('scroll', () => { prog.style.transform = `scaleX(${scrollY / ((root.scrollHeight - innerHeight) || 1)})`; }, { passive: true });

// cursor glow + ring
if (fine && !R) {
  const g = mk('div', 'cglow'), r = mk('div', 'cring'); body.append(g, r);
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; g.style.opacity = r.style.opacity = 1; }, { passive: true });
  (function f() { rx += (x - rx) * .18; ry += (y - ry) * .18; g.style.transform = `translate(${x - 200}px,${y - 200}px)`; r.style.transform = `translate(${rx - 18}px,${ry - 18}px)`; requestAnimationFrame(f); })();
  document.addEventListener('pointerover', e => r.classList.toggle('big', !!e.target.closest('a,button,.card,.tc')));
}
// card spotlight + 3D tilt + magnetic buttons
document.addEventListener('pointermove', e => {
  const c = e.target.closest('.card,.tc,.act,.vibe,.contact,.dc'); if (!c) return;
  const b = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - b.left + 'px'); c.style.setProperty('--my', e.clientY - b.top + 'px');
  if (fine && !R && c.matches('.dc,.proj')) { const px = (e.clientX - b.left) / b.width - .5, py = (e.clientY - b.top) / b.height - .5; c.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateY(-4px)`; }
}, { passive: true });
document.addEventListener('pointerout', e => { const c = e.target.closest('.dc,.proj'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
if (fine && !R) document.querySelectorAll('.btn').forEach(b => {
  b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
  b.addEventListener('pointerleave', () => b.style.transform = '');
});
// staggered reveal + heading decode
document.querySelectorAll('.grid,.tech').forEach(g => [...g.children].forEach((c, i) => c.style.animationDelay = i * 70 + 'ms'));
const G = '▓▒░<>/{}[]#$%&*';
const scr = el => { const t = el.textContent; let f = 0; const id = setInterval(() => { el.textContent = [...t].map((c, i) => c === ' ' || i < f / 2 ? c : G[Math.random() * G.length | 0]).join(''); if (++f > t.length * 2) { clearInterval(id); el.textContent = t; } }, 28); };
if (!R) { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { scr(e.target); o.unobserve(e.target); } }), { threshold: .6 }); document.querySelectorAll('.h').forEach(h => o.observe(h)); }
// tech marquee
const row = ['Python','JavaScript','TypeScript','Node.js','HTML','CSS','Git','GitHub','Automation','AI / ML','Discord bots','Vibecoding'].map(w => `<span>${w}</span><em>✦</em>`).join('');
$('home').after(mk('div', 'marq', `<div>${row}${row}</div>`));

// toast + confetti
const stack = mk('div', 'toasts'); body.append(stack);
const toast = (icon, text) => {
  const e = mk('div', 'toast glass'), s = document.createElement('span'); if (icon.startsWith('http')) { const im = new Image(); im.className = 'em'; im.src = icon; im.onerror = () => im.remove(); s.append(im); } else s.textContent = icon; e.append(s, document.createTextNode(text)); stack.append(e);
  while (stack.children.length > 3) stack.firstChild.remove();
  setTimeout(() => { e.classList.add('out'); setTimeout(() => e.remove(), 400); }, 4200);
};
const burst = (x, y, n = 22) => { if (R) return; for (let i = 0; i < n; i++) {
  const s = mk('span', 'cf'); s.style.cssText = `left:${x}px;top:${y}px;background:hsl(${265 + Math.random() * 50},90%,${60 + Math.random() * 25}%)`; body.append(s);
  const a = Math.random() * 6.28, d = 60 + Math.random() * 120;
  s.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 60}px) rotate(${Math.random() * 540}deg) scale(.4)`, opacity: 0 }], { duration: 900 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => s.remove(); } };
document.addEventListener('click', e => { const b = e.target.closest('[data-copy],.coin'); if (b) { const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2); toast('📋', 'Address copied'); } });

// hero terminal wired to live presence
const term = mk('div', 'term glass', '<div class="tb"><i></i><i></i><i></i><span>zack@portfolio</span></div><pre></pre>');
$('home').append(term);
const pre = term.querySelector('pre'), live = mk('b', 'tl', 'connecting…');
const L = ['$ whoami', 'zack: developer, tinkerer, automation builder', '$ cat stack.txt', 'python  javascript  typescript  node', '$ ./discord --live'];
const fill = () => pre.append('> ', live, mk('i', 'caret'));
if (R) { pre.textContent = L.join('\n') + '\n'; fill(); }
else { let out = '', li = 0, ci = 0; setTimeout(function t() {
  if (li >= L.length) { pre.textContent = out; return fill(); }
  const ln = L[li], cmd = ln[0] === '$'; ci++; pre.textContent = out + ln.slice(0, ci);
  if (ci >= ln.length) { out += ln + '\n'; li++; ci = 0; setTimeout(t, cmd ? 350 : 150); } else setTimeout(t, cmd ? 55 : 14); }, 1700); }

// react to presence (event fired by main.js render)
let prev = null;
addEventListener('presence', ({ detail: d }) => {
  const st = d.discord_status || 'offline', sp = d.listening_to_spotify && d.spotify, g = (d.activities || []).find(a => a.type !== 4 && a.id !== 'spotify:1');
  const verb = sp ? 'listening to' : g?.type === 1 ? 'streaming' : 'playing', txt = sp ? `${sp.song} by ${sp.artist.replace(/;/g, ',')}` : g ? g.name : '';
  live.textContent = st + (txt ? ` | ${verb} ${txt}` : '');
  $('dcCard').style.setProperty('--mood', sp ? '#1ed760' : g ? (g.type === 1 ? '#f04747' : '#a855f7') : { online: '#a855f7', idle: '#f5b83d', dnd: '#f04747', offline: '#5b5b6b' }[st]);
  document.querySelectorAll('.act.spotify .kind').forEach(k => { if (!k.querySelector('.eq')) k.append(mk('span', 'eq', '<i></i><i></i><i></i><i></i>')); });
  const key = st + '|' + txt;
  if (prev && key !== prev.key) {
    if (txt && txt !== prev.txt) toast(emUrl(sp ? 'spotify' : g.type === 1 ? 'stream' : 'game'), `Zack is ${verb} ${txt}`);
    else if (st !== prev.st) toast(emUrl(st), 'Zack is now ' + (st === 'dnd' ? 'on Do Not Disturb' : st));
  }
  prev = { key, st, txt };
});

// easter egg: Konami code or click the logo 5 times
const party = () => { root.classList.toggle('party'); toast('🎉', root.classList.contains('party') ? 'Party mode on' : 'Party mode off'); for (let i = 0; i < 5; i++) setTimeout(() => burst(Math.random() * innerWidth, innerHeight * .3, 30), i * 250); };
let seq = []; const K = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';
addEventListener('keydown', e => { seq = [...seq, e.key].slice(-10); if (seq.join() === K) party(); });
let n = 0; document.querySelector('.logo').addEventListener('click', () => { if (++n >= 5) { n = 0; party(); } });
})();
// Portrait card extras: activity count, optional banner, clan tag
(() => {
  const dc = document.getElementById('dcCard'), count = () => dc.dataset.n = document.querySelectorAll('#acts .act:not(.out)').length;
  const img = new Image(); img.onload = () => document.getElementById('banner').style.backgroundImage = 'url(assets/banner.gif)'; img.src = 'assets/banner.gif';
  let tag; addEventListener('presence', ({ detail: d }) => {
    count();
    const g = d.discord_user.primary_guild;
    if (!tag) { tag = document.createElement('p'); tag.id = 'dtag'; tag.hidden = true; document.getElementById('duser').after(tag); }
    tag.hidden = !g?.tag; if (g?.tag) { tag.textContent = g.tag; if (g.badge && g.identity_guild_id) { const i = new Image(); i.alt = ''; i.src = `https://cdn.discordapp.com/clan-badges/${g.identity_guild_id}/${g.badge}.png?size=32`; tag.prepend(i); } }
  });
})();
