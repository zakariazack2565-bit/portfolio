import { useEffect, useState } from 'react';
export type Status = 'online' | 'idle' | 'dnd' | 'offline';
export interface Act { type: number; name: string; id?: string; application_id?: string; details?: string; state?: string; emoji?: { name?: string }; assets?: { large_image?: string; large_text?: string }; timestamps?: { start?: number; end?: number } }
export interface Spotify { song: string; artist: string; album: string; album_art_url: string; track_id: string; timestamps: { start: number; end: number } }
export interface Presence { discord_user: { id: string; username: string; global_name?: string; display_name?: string; avatar: string | null; avatar_decoration_data?: { asset: string } | null }; discord_status: Status; activities: Act[]; listening_to_spotify: boolean; spotify: Spotify | null }
export type Live = 'connecting' | 'live' | 'reconnecting';

/** Persistent Lanyard WebSocket: heartbeat, backoff reconnect, one-off REST fallback (never polling). */
export function useLanyard(id: string) {
  const [data, setData] = useState<Presence | null>(null), [live, setLive] = useState<Live>('connecting'), [note, setNote] = useState('');
  useEffect(() => {
    let ws: WebSocket | null = null, hb = 0, t = 0, retry = 0, closed = false, fell = false;
    const emit = (d: Presence) => { setData(d); window.dispatchEvent(new CustomEvent('presence', { detail: d })); };   // legacy fx.js listens to this
    const fallback = async () => { if (fell) return; fell = true; try { const r = await (await fetch(`https://api.lanyard.rest/v1/users/${id}`)).json(); if (r.success) { emit(r.data); setNote('Live connection unavailable. Showing the last known snapshot and retrying.'); } } catch { setNote('Discord presence is unavailable right now. Retrying in the background.'); } };
    const connect = () => {
      const w = (ws = new WebSocket('wss://api.lanyard.rest/socket'));
      w.onmessage = e => { const m = JSON.parse(e.data); if (m.op === 1) { clearInterval(hb); hb = window.setInterval(() => w.readyState === 1 && w.send(JSON.stringify({ op: 3 })), m.d.heartbeat_interval); w.send(JSON.stringify({ op: 2, d: { subscribe_to_id: id } })); } else if (m.op === 0) { retry = 0; setLive('live'); setNote(''); emit(m.d as Presence); } };
      w.onclose = () => { clearInterval(hb); if (closed) return; setLive('reconnecting'); t = window.setTimeout(connect, Math.min(30000, 1000 * 2 ** retry++) + Math.random() * 500); if (retry > 2) fallback(); };
      w.onerror = () => w.close();
    };
    connect();
    return () => { closed = true; clearInterval(hb); clearTimeout(t); ws?.close(); };
  }, [id]);
  return { data, live, note };
}
