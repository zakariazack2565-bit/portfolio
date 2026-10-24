import { useEffect, useState } from 'react';
import { Emoji } from './Emoji';
import type { Act, Live, Presence, Spotify, Status } from './lanyard';

const hms = (ms: number): string => { const s = Math.max(0, Math.floor(ms / 1000)), p = (n: number) => String(n).padStart(2, '0'); return (s >= 3600 ? p(Math.floor(s / 3600)) + ':' : '') + p(Math.floor(s % 3600 / 60)) + ':' + p(s % 60); };
const useNow = (): number => { const [n, setN] = useState(Date.now()); useEffect(() => { const i = setInterval(() => setN(Date.now()), 1000); return () => clearInterval(i); }, []); return n; };
const KIND: Record<number, [string, string]> = { 0: ['game', 'Playing'], 1: ['stream', 'Streaming'], 2: ['jam', 'Listening'], 3: ['watch', 'Watching'], 5: ['trophy', 'Competing'] };
const assetUrl = (a: Act): string | null => { const i = a.assets?.large_image; if (!i) return null; if (i.startsWith('mp:external/')) return 'https://media.discordapp.net/external/' + i.slice(12); if (i.startsWith('mp:')) return 'https://media.discordapp.net/' + i.slice(3); if (i.startsWith('spotify:')) return 'https://i.scdn.co/image/' + i.slice(8); return a.application_id ? `https://cdn.discordapp.com/app-assets/${a.application_id}/${i}.png` : null; };
const others = (d: Presence | null): Act[] => (d?.activities ?? []).filter(a => a.type !== 4 && a.id !== 'spotify:1');

/** Status for the dot and the text on the hero pill. */
export function describe(d: Presence | null): { status: Status; hero: string } {
  const status = d?.discord_status ?? 'offline';
  if (d?.listening_to_spotify && d.spotify) return { status, hero: 'Listening to Spotify' };
  const a = others(d)[0]; if (a) return { status, hero: (a.type === 1 ? 'Streaming ' : 'Playing ') + a.name };
  return { status, hero: 'Discord: ' + { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', offline: 'Offline' }[status] };
}

function SpotifyCard({ s, now }: { s: Spotify; now: number }) {
  const { start, end } = s.timestamps, pct = Math.min(100, Math.max(0, (now - start) / (end - start) * 100));
  return (<div className="act spotify"><img className="art" src={s.album_art_url} alt={`Album art for ${s.album}`} />
    <div className="meta"><div className="kind"><Emoji k="spotify" /> Listening to Spotify<span className="eq"><i /><i /><i /><i /></span></div>
      <div className="t">{s.song}</div><div className="s">{s.artist.replace(/;/g, ',')}</div>
      <div className="bar2"><i style={{ width: pct + '%' }} /></div><div className="times"><span>{hms(now - start)}</span><span>{hms(end - start)}</span></div></div></div>);
}
function ActCard({ a, now }: { a: Act; now: number }) {
  const img = assetUrl(a), [ek, label] = KIND[a.type] ?? ['game', 'Activity'], title = a.type === 1 ? (a.details || a.name) : a.name, sub = a.type === 1 ? a.name : a.details;
  return (<div className={'act' + (a.type === 1 ? ' stream' : '')}>
    {img ? <img className="art" src={img} alt="" loading="lazy" /> : <div className="art" style={{ display: 'grid', placeItems: 'center', fontSize: 34 }}><Emoji k={a.type === 1 ? 'stream' : 'game'} /></div>}
    <div className="meta"><div className="kind"><Emoji k={ek} /> {label}</div><div className="t">{title}</div>{sub && <div className="s">{sub}</div>}{a.state && <div className="s">{a.state}</div>}{a.assets?.large_text && <div className="s">{a.assets.large_text}</div>}
      {a.timestamps?.start && <div className="time">{a.type === 1 ? 'Live for' : 'Playing for'} <span>{hms(now - a.timestamps.start)}</span></div>}</div></div>);
}

export function DiscordCard({ d, live, note }: { d: Presence | null; live: Live; note: string }) {
  const now = useNow(), u = d?.discord_user, { status } = describe(d), list = others(d), hasSp = !!(d?.listening_to_spotify && d.spotify), n = list.length + (hasSp ? 1 : 0);
  const av = u ? (u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${u.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256` : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(u.id) >> 22n) % 6}.png`) : undefined;
  const deco = u?.avatar_decoration_data?.asset, cs = d?.activities.find(a => a.type === 4), csText = cs ? [cs.emoji?.name, cs.state].filter(Boolean).join(' ') : '';
  return (
    <div className="dc glass reveal" id="dcCard" data-n={n}>
      <div className="banner" id="banner"><div className={'live' + (live === 'live' ? ' on' : '')} id="live"><b /><span>{live === 'live' ? 'LIVE' : live === 'reconnecting' ? 'RECONNECTING' : 'CONNECTING'}</span></div></div>
      <div className="av"><img id="avatar" alt="Zack's Discord avatar" width={96} height={96} src={av} />{deco && <img id="deco" alt="" src={`https://cdn.discordapp.com/avatar-decoration-presets/${deco}.png`} />}<span className={`dot ${status}`} id="status" /></div>
      <div className="who"><h2 id="dname">{u ? u.global_name || u.display_name || u.username : 'Zack'}</h2><p id="duser">{u ? '@' + u.username + ' • TheZack' : '@thezack'}</p>{csText && <p className="custom" id="custom">{csText}</p>}</div>
      <div id="acts">{hasSp && d?.spotify && <SpotifyCard s={d.spotify} now={now} />}{list.map(a => <ActCard key={a.type + a.name} a={a} now={now} />)}</div>
      {note && <p className="note" id="note">{note}</p>}
    </div>);
}
