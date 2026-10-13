'use strict';
/* ===== Custom emojis (Discord CDN). [id, animated]. Set vibe: ['FULL_ID', 1] ===== */
const EMO = { hello:['1550525277837201552',1], wave:['1397677755805470763',1], pc:['1473648215059464223',0], bot:['1546069468327841792',0], web:['1464833335997239357',0], auto:['1432309215606603848',1], yeye:['1449360716103548999',1], invite:['1501916531502612602',1], guns:['1347722238702653520',0], spotify:['1447162769127510037',1], game:['1481982534634962994',1], stream:['1483921074335912028',0], watch:['1352599264722685973',1], trophy:['1490233566226022431',1], jam:['1418213461409923122',1], online:['1012675541675016223',1], offline:['1012675539011637288',1], idle:['674781101306413116',1], dnd:['674781087075139584',1], vibe:['1418213461409923122',1], discord:['1545385049598206013',1] };
const emUrl = k => `https://cdn.discordapp.com/emojis/${EMO[k][0]}.${EMO[k][1] ? 'gif' : 'png'}?size=96`;
const FB = { hello:'👋', wave:'👋', pc:'💻', bot:'🧠', web:'🌐', auto:'⚙️', yeye:'🧪', invite:'🔗', guns:'🔫', spotify:'🎵', game:'🎮', stream:'🔴', watch:'📺', trophy:'🏆', jam:'🎧', online:'🟢', offline:'⚫', idle:'🟡', dnd:'🔴', vibe:'⚡', discord:'💬' };
// if an emoji fails to load: try webp, then png, then show a normal unicode emoji
const emErr = img => { const k = img.dataset.k, t = +img.dataset.t || 0;
  if (t < 2) { img.dataset.t = t + 1; img.src = `https://cdn.discordapp.com/emojis/${EMO[k][0]}.${['webp', 'png'][t]}?size=96`; }
  else { const sp = document.createElement('span'); sp.textContent = FB[k] || ''; img.replaceWith(sp); } };
const em = k => `<img class="em" data-k="${k}" src="${emUrl(k)}" alt="" onerror="emErr(this)">`;
/* ===== Editable content ===== */
const DISCORD_ID = '1433506876661694544';
const si = (n, c = 'white') => `https://cdn.simpleicons.org/${n}/${c}`;
const ABOUT = [[em('pc'),'Software Development','Clean, maintainable tools that solve real problems.'],[em('bot'),'AI / ML','Experimenting with models and smart automation.'],[em('web'),'Web Development','Fast, responsive sites and web apps.'],[em('auto'),'Automation','Scripts and bots that remove repetitive work.'],['🤖','Discord Development','Bots and integrations for communities.'],[em('yeye'),'Experimentation','Random ideas that become actual projects.']];
const STACK = { 'Languages': [['Python','python'],['HTML','html5'],['CSS','https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg'],['JavaScript','javascript'],['TypeScript','typescript']], 'Runtime': [['Node.js','nodedotjs'],['Python','python']], 'Version Control & Collaboration': [['Git','git'],['GitHub','github']] };
// Add a project by adding an object here.
const PROJECTS = [
  { name:'Cyber Core', icon:em('invite'), desc:'A fake portfolio website with a cyber, OS-style look.', tags:['Lovable','Web App'], demo:'https://zackos-cyber-core.lovable.app' },
  { name:'ZackHost', icon:em('invite'), desc:'A hosting website concept, with no payment system integrated.', tags:['Lovable','Web App'], demo:'https://zackhost.lovable.app' },
  { name:'TypeRush', icon:em('invite'), desc:'A typing speed test to check how fast you type.', tags:['Web App','GitHub Pages'], github:'https://github.com/zakariazack2565-bit/TypeRush', demo:'https://zakariazack2565-bit.github.io/TypeRush/' },
  { name:'Zack Chrono', icon:em('invite'), desc:'A world clock to check the current time in other countries.', tags:['Time Zones'], github:'https://github.com/zakariazack2565-bit/Zack-CHORONO' }];
const SOCIALS = [['GitHub','https://github.com/zakariazack2565-bit',si('github')],['Discord','https://discord.com/users/1433506876661694544',emUrl('discord')],['guns.lol','https://guns.lol/thezack',emUrl('guns')],['frozi.lol','https://frozi.lol/tz','https://frozi.lol/favicon.ico'],['Roblox','https://roblox.com/ZakariaTheZack',si('roblox')],['Telegram','https://t.me/TheZack_0',si('telegram')],['Spotify','https://open.spotify.com/user/31dn7fcgxj4c4hah66xvpaie43si?si=1d529a720d884eb9',emUrl('spotify')]];
const ETH = '0x5377b8c9Ca152d16548e3f8c1F47A76A26Eb8C04';
const CRYPTO = [['Bitcoin','bc1qffsahnvedd6g3sfjush7vdrerldjplnaed8h0h'],['Litecoin','LYSSTDbaiN1YKM9tjfHMU48q48bdD8HNY4'],['Ethereum',ETH],['USDT — Ethereum Network',ETH],['Solana','uCRQpknHP1tR1Sr7LvzDzTfnqvGgjwXVTin1VeeZRGQ'],['Dogecoin','DJJZYtxEYBFgPt91hLHsiMw4MXKgFjAzN2'],['Polygon',ETH]];

/* ===== Helpers ===== */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');
const hms = ms => { const s = Math.max(0, Math.floor(ms / 1000)); return (s >= 3600 ? pad(Math.floor(s / 3600)) + ':' : '') + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60); };

/* ===== Static sections ===== */
$('aboutGrid').innerHTML = ABOUT.map(([i,t,d]) => `<div class="card reveal"><div class="ic">${i}</div><h3>${t}</h3><p>${d}</p></div>`).join('');
$('stackGroups').innerHTML = Object.entries(STACK).map(([g, items]) => `<div class="sg reveal"><h3>${g}</h3><div class="tech">${items.map(([n,i]) => `<div class="tc"><img src="${i.startsWith('http') ? i : si(i)}" alt="" loading="lazy" width="36" height="36"${i.startsWith('http') ? ` onerror="this.onerror=null;this.src='https://cdn.simpleicons.org/css/white'"` : ''}>${n}</div>`).join('')}</div></div>`).join('');
$('projGrid').innerHTML = PROJECTS.map(p => `<article class="card proj reveal"><div class="top"><div class="pi">${p.icon}</div><h3>${esc(p.name)}</h3></div><p style="margin-top:14px">${esc(p.desc)}</p><div class="badges">${p.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div><div class="row">${p.github ? `<a class="btn sm" target="_blank" rel="noopener" href="${p.github}">GitHub</a>` : ''}${p.demo ? `<a class="btn primary sm" target="_blank" rel="noopener" href="${p.demo}">Live Demo</a>` : ''}</div></article>`).join('');
const socIcon = (n, i) => i ? `<img src="${i}" alt="" width="26" height="26" onerror="this.replaceWith('🔗')">` : `<span style="font-size:22px">🔫</span>`;
$('socials').innerHTML = SOCIALS.map(([n,u,i]) => `<a class="card soc reveal" target="_blank" rel="noopener" href="${u}">${socIcon(n,i)}${n}</a>`).join('');
$('footSocials').innerHTML = SOCIALS.map(([n,u,i]) => i ? `<a target="_blank" rel="noopener" href="${u}" aria-label="${n}"><img src="${i}" alt="" onerror="this.replaceWith('🔗')"></a>` : `<a target="_blank" rel="noopener" href="${u}" aria-label="${n}">🔫</a>`).join('');
const COIN = { Bitcoin:['bitcoin','F7931A'], Litecoin:['litecoin','345D9D'], Ethereum:['ethereum','9a9ab8'], Solana:['solana','9945FF'], Dogecoin:['dogecoin','C2A633'], Polygon:['polygon','8247E5'] };
$('crypto').innerHTML = `<div class="coins reveal">${CRYPTO.map(([n, a]) => { const [sl, c] = n.startsWith('USDT') ? ['tether', '26A17B'] : COIN[n]; return `<button class="coin" data-addr="${a}" data-name="${n}" aria-label="Copy ${n} address"><img src="https://cdn.simpleicons.org/${sl}/${c}" alt="" width="36" height="36"></button>`; }).join('')}</div><div class="coininfo glass reveal"><b id="ciName">Click a coin to copy its address</b><code id="ciAddr"></code></div>`;
{ const box = $('crypto'), show = b => { $('ciName').textContent = b.dataset.name; $('ciAddr').textContent = b.dataset.addr; };
  box.addEventListener('pointerover', e => { const b = e.target.closest('.coin'); if (b) show(b); });
  box.addEventListener('focusin', e => { const b = e.target.closest('.coin'); if (b) show(b); });
  box.addEventListener('click', async e => { const b = e.target.closest('.coin'); if (!b) return; show(b);
    try { await navigator.clipboard.writeText(b.dataset.addr); } catch { const t = document.createElement('textarea'); t.value = b.dataset.addr; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
    b.classList.add('ok'); $('ciName').textContent = b.dataset.name + ' address copied!'; setTimeout(() => b.classList.remove('ok'), 1400); }); }
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-copy]'); if (!b) return;
  try { await navigator.clipboard.writeText(b.dataset.copy); } catch { const t = document.createElement('textarea'); t.value = b.dataset.copy; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
  b.textContent = 'Copied!'; b.classList.add('ok'); setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('ok'); }, 1600);
});

if (EMO.vibe) $('vibeEm').innerHTML = em('vibe');
/* ===== Nav, reveal ===== */
const nav = $('nav'), burger = $('burger'), links = $('links');
addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 20), { passive: true });
burger.onclick = () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', o); links.classList.toggle('open', o); };
links.addEventListener('click', () => { burger.setAttribute('aria-expanded', false); links.classList.remove('open'); });
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ===== Particles (paused when tab hidden) ===== */
(() => {
  if (reduced) return;
  const c = $('bg'), x = c.getContext('2d'); let w, h, raf, ps = [];
  const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; ps = Array.from({ length: Math.min(55, Math.floor(w / 28)) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .4, v: Math.random() * .25 + .05, a: Math.random() * .5 + .2 })); };
  const draw = () => { x.clearRect(0, 0, w, h); for (const p of ps) { p.y -= p.v; if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; } x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.28); x.fillStyle = `rgba(168,85,247,${p.a})`; x.shadowBlur = 8; x.shadowColor = '#a855f7'; x.fill(); } raf = requestAnimationFrame(draw); };
  size(); draw(); addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) draw(); });
})();

/* ===== Live Discord presence via Lanyard WebSocket ===== */
const STATUS = { online: ['🟢 Online','Online'], idle: ['🟡 Idle','Idle'], dnd: ['🔴 Do Not Disturb','Do Not Disturb'], offline: ['⚫ Offline','Offline'] };
const cards = new Map();   // key -> element (only changed cards are touched)
let ws, hb, retry = 0, tick, closing = false;

function setLive(on, label) {
  $('live').classList.toggle('on', on); $('live').lastElementChild.textContent = label;
}
function assetUrl(act) {
  const img = act.assets?.large_image; if (!img) return null;
  if (img.startsWith('mp:external/')) return 'https://media.discordapp.net/external/' + img.slice(12);
  if (img.startsWith('mp:')) return 'https://media.discordapp.net/' + img.slice(3);
  if (img.startsWith('spotify:')) return 'https://i.scdn.co/image/' + img.slice(8);
  return act.application_id ? `https://cdn.discordapp.com/app-assets/${act.application_id}/${img}.png` : null;
}
function buildActs(d) {
  const out = [];
  if (d.listening_to_spotify && d.spotify) {
    const s = d.spotify;
    out.push({ key: 'spotify:' + s.track_id, cls: 'spotify', html: `<img class="art" src="${esc(s.album_art_url)}" alt="Album art for ${esc(s.album)}"><div class="meta"><div class="kind">${em('spotify')} Listening to Spotify</div><div class="t">${esc(s.song)}</div><div class="s">${esc(s.artist.replace(/;/g, ','))}</div><div class="bar2"><i data-prog></i></div><div class="times"><span data-el></span><span>${hms(s.timestamps.end - s.timestamps.start)}</span></div></div>`, ts: s.timestamps });
  }
  for (const a of d.activities || []) {
    if (a.type === 4 || a.id === 'spotify:1') continue;
    const img = assetUrl(a), kinds = { 0:em('game')+' Playing', 1:em('stream')+' Streaming', 3:em('watch')+' Watching', 5:em('trophy')+' Competing', 2:em('jam')+' Listening' };
    const title = a.type === 1 ? (a.details || a.name) : a.name, sub1 = a.type === 1 ? a.name : a.details;
    out.push({ key: `${a.type}:${a.name}:${a.application_id || ''}`, cls: a.type === 1 ? 'stream' : '', ts: a.timestamps,
      html: `${img ? `<img class="art" src="${esc(img)}" alt="" loading="lazy">` : `<div class="art" style="display:grid;place-items:center;font-size:34px">${em(a.type === 1 ? 'stream' : 'game')}</div>`}<div class="meta"><div class="kind">${kinds[a.type] || 'Activity'}</div><div class="t">${esc(title)}</div>${sub1 ? `<div class="s">${esc(sub1)}</div>` : ''}${a.state ? `<div class="s">${esc(a.state)}</div>` : ''}${a.assets?.large_text ? `<div class="s">${esc(a.assets.large_text)}</div>` : ''}${a.timestamps?.start ? `<div class="time">${a.type === 1 ? 'Live for' : 'Playing for'} <span data-el></span></div>` : ''}</div>` });
  }
  return out;
}
function render(d) {
  const u = d.discord_user, st = d.discord_status || 'offline';
  if (u.avatar) $('avatar').src = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256`;
  else $('avatar').src = `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(u.id) >> 22n) % 6}.png`;
  const dec = u.avatar_decoration_data?.asset; $('deco').hidden = !dec; if (dec) $('deco').src = `https://cdn.discordapp.com/avatar-decoration-presets/${dec}.png`;
  $('dname').textContent = u.global_name || u.display_name || u.username; $('duser').textContent = '@' + u.username + ' • TheZack';
  const cs = (d.activities || []).find(a => a.type === 4), cEl = $('custom');
  cEl.hidden = !cs; if (cs) cEl.textContent = [cs.emoji?.name, cs.state].filter(Boolean).join(' ');
  for (const k of ['online','idle','dnd','offline']) { $('status').classList.toggle(k, k === st); $('heroDot').classList.toggle(k, k === st); }
  const acts = buildActs(d), primary = acts[0];
  $('stateText').textContent = primary ? primary.html.match(/class="kind">([^<]+)/)?.[1] || STATUS[st][0] : STATUS[st][0];
  $('heroText').textContent = primary ? (primary.cls === 'spotify' ? 'Listening to Spotify' : 'Playing ' + primary.html.match(/class="t">([^<]+)/)?.[1]) : 'Discord: ' + STATUS[st][1];
  const box = $('acts'), keys = new Set(acts.map(a => a.key));
  for (const [k, el] of cards) if (!keys.has(k)) { el.classList.add('out'); cards.delete(k); setTimeout(() => el.remove(), reduced ? 0 : 300); }
  acts.forEach(a => {
    let el = cards.get(a.key);
    if (!el) { el = document.createElement('div'); el.className = 'act ' + a.cls; el.innerHTML = a.html; box.append(el); cards.set(a.key, el); }
    el._ts = a.ts;
  });
  const empty = box.querySelector('.empty');
  if (!acts.length && !empty) box.insertAdjacentHTML('beforeend', `<div class="empty">${st === 'offline' ? 'Offline — last seen unavailable.' : 'No activity right now.'}</div>`);
  if (acts.length && empty) empty.remove();
  if (empty && !acts.length) empty.textContent = st === 'offline' ? 'Offline — last seen unavailable.' : 'No activity right now.';
  clearInterval(tick); const run = () => cards.forEach(el => {
    const t = el._ts; if (!t) return; const n = Date.now(), e = el.querySelector('[data-el]');
    if (e) e.textContent = hms(n - t.start);
    const p = el.querySelector('[data-prog]'); if (p && t.end) p.style.width = Math.min(100, (n - t.start) / (t.end - t.start) * 100) + '%';
  });
  run(); if ([...cards.values()].some(e => e._ts)) tick = setInterval(run, 1000);
  dispatchEvent(new CustomEvent('presence', { detail: d }));
}
function connect() {
  closing = false; ws = new WebSocket('wss://api.lanyard.rest/socket');
  ws.onmessage = ({ data }) => {
    const m = JSON.parse(data);
    if (m.op === 1) { clearInterval(hb); hb = setInterval(() => ws.readyState === 1 && ws.send(JSON.stringify({ op: 3 })), m.d.heartbeat_interval); ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } })); }
    else if (m.op === 0) { retry = 0; setLive(true, 'LIVE'); $('note').hidden = true; render(m.d); }
  };
  ws.onclose = () => { clearInterval(hb); if (closing) return; setLive(false, 'RECONNECTING'); const wait = Math.min(30000, 1000 * 2 ** retry++) + Math.random() * 500; setTimeout(connect, wait); if (retry > 2) fallback(); };
  ws.onerror = () => ws.close();
}
let fell = false;
async function fallback() { // one-off snapshot only, never polled
  if (fell) return; fell = true;
  try { const r = await (await fetch('https://api.lanyard.rest/v1/users/' + DISCORD_ID)).json(); if (r.success) { render(r.data); $('note').hidden = false; $('note').textContent = 'Live connection unavailable. Showing the last known snapshot and retrying.'; } }
  catch { $('note').hidden = false; $('note').textContent = 'Discord presence is unavailable right now. Retrying in the background.'; }
}
addEventListener('pagehide', () => { closing = true; clearInterval(hb); clearInterval(tick); ws && ws.close(); });
connect();
