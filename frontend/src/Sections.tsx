import { useEffect, useState } from 'react';
import { ABOUT, COIN, CRYPTO, DISCORD_ID, PROJECTS, SOCIALS, STACK, si, type Project } from './data';
import { DiscordCard, describe } from './Discord';
import { Emoji } from './Emoji';
import { useLanyard } from './lanyard';

const NAV: [string, string][] = [['Home', '#home'], ['About', '#about'], ['Stack', '#stack'], ['Projects', '#projects'], ['Discord', '#discord'], ['Tools', '/tools']];
export function Nav() {
  const [open, setOpen] = useState(false), [sc, setSc] = useState(false);
  useEffect(() => { const f = () => setSc(scrollY > 20); addEventListener('scroll', f, { passive: true }); f(); return () => removeEventListener('scroll', f); }, []);
  return (<header id="nav" className={sc ? 'scrolled' : ''}><div className="bar glass"><a className="logo" href="#home">Zack</a>
    <nav id="links" className={open ? 'open' : ''} onClick={() => setOpen(false)}>{NAV.map(([n, h]) => <a key={n} href={h}>{n}</a>)}</nav>
    <a className="btn primary sm" href="#contact">Contact Me</a>
    <button id="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}><i /><i /><i /></button></div></header>);
}

export function Hero() {
  const { data, live, note } = useLanyard(DISCORD_ID), { status, hero } = describe(data);
  return (<section id="home" className="hero"><div className="hl">
    <span className="badge"><b className="pulse" />Currently building</span>
    <h1>Hi, I'm Zack <span className="wave"><Emoji k="hello" /></span></h1>
    <p className="sub">Developer • AI/ML Enthusiast • Automation Builder</p>
    <p className="lead">I build software, web applications, automation tools and experimental projects using Python, JavaScript and TypeScript.</p>
    <div className="row"><a className="btn primary" href="#projects">View Projects</a><a className="btn" href="#contact">Contact Me</a></div>
    <a className="hero-live glass" href="#discord"><span className={`dot ${status}`} id="heroDot" /><span id="heroText">{data ? hero : 'Connecting to Discord…'}</span></a></div>
    <aside id="discord" className="dcwrap"><DiscordCard d={data} live={live} note={note} /></aside></section>);
}

export const About = () => (<section id="about" className="wrap"><h2 className="h reveal">A little about me</h2>
  <p className="p reveal">I'm Zack, a developer who enjoys building software, experimenting with AI, automation, websites and random ideas that turn into actual projects.</p>
  <div className="grid g3">{ABOUT.map(([i, t, d]) => <div className="card reveal" key={t}><div className="ic"><Emoji k={i} /></div><h3>{t}</h3><p>{d}</p></div>)}</div></section>);

function TechIcon({ src }: { src: string }) {
  const url = src.startsWith('http');
  return <img src={url ? src : si(src)} alt="" loading="lazy" width={36} height={36} onError={e => { if (url && !e.currentTarget.dataset.fb) { e.currentTarget.dataset.fb = '1'; e.currentTarget.src = si('css'); } }} />;
}
export const Stack = () => (<section id="stack" className="wrap"><h2 className="h reveal">Code Stack</h2>
  <div>{Object.entries(STACK).map(([g, items]) => <div className="sg reveal" key={g}><h3>{g}</h3><div className="tech">{items.map(([n, i]) => <div className="tc" key={n + i}><TechIcon src={i} />{n}</div>)}</div></div>)}</div>
  <div className="vibe glass reveal"><h3>Vibecoding <span id="vibeEm"><Emoji k="vibe" /></span></h3><p>Sometimes the fastest way from an idea to a working prototype is a little vibecoding.</p>
    <div className="row"><span className="chip">Antigravity</span><span className="chip">Freebuff</span></div></div></section>);

const ProjectCard = ({ p }: { p: Project }) => (<article className="card proj reveal"><div className="top"><div className="pi"><Emoji k={p.icon} /></div><h3>{p.name}</h3></div>
  <p style={{ marginTop: 14 }}>{p.desc}</p><div className="badges">{p.tags.map(t => <span key={t}>{t}</span>)}</div>
  <div className="row">{p.github && <a className="btn sm" target="_blank" rel="noopener" href={p.github}>GitHub</a>}{p.demo && <a className="btn primary sm" target="_blank" rel="noopener" href={p.demo}>Live Demo</a>}</div></article>);
export const Projects = () => (<section id="projects" className="wrap"><h2 className="h reveal">Projects</h2><div className="grid g2">{PROJECTS.map(p => <ProjectCard key={p.name} p={p} />)}</div></section>);

const TOOLS: [string, string, string, string][] = [['/tools/calculator', '🧮', 'Calculator', 'Clean, keyboard-friendly calculator.'], ['/tools/devex', '💸', 'DevEx Converter', 'Robux to $, €, ₹ and ৳.'], ['/tools/crypto', '📈', 'Crypto Prices', 'BTC, LTC, ETH, USDT and SOL.'], ['/tools/prompt', '🧬', 'Build Yours', 'Copy a prompt to make a portfolio like this one.']];
export const ToolsTeaser = () => (<section id="tools" className="wrap"><h2 className="h reveal">Tools</h2><p className="p reveal">Small utilities I built. Free to use, powered by public APIs.</p>
  <div className="grid g4">{TOOLS.map(([h, i, n, d]) => <a className="card reveal" href={h} key={h}><div className="ic">{i}</div><h3>{n}</h3><p>{d}</p></a>)}</div></section>);

function SocIcon({ src }: { src: string }) { const [bad, setBad] = useState(false); return bad ? <span>🔗</span> : <img src={src} alt="" width={26} height={26} onError={() => setBad(true)} />; }
export const Socials = () => (<section className="wrap"><h2 className="h reveal">Find me around the internet</h2>
  <div className="grid g3">{SOCIALS.map(([n, u, i]) => <a className="card soc reveal" target="_blank" rel="noopener" href={u} key={n}><SocIcon src={i} />{n}</a>)}</div></section>);

export function Crypto() {
  const [info, setInfo] = useState<[string, string]>(['Click a coin to copy its address', '']), [ok, setOk] = useState('');
  const copy = async (n: string, a: string) => {
    try { await navigator.clipboard.writeText(a); } catch { const t = document.createElement('textarea'); t.value = a; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
    setOk(n); setInfo([n + ' address copied!', a]); setTimeout(() => setOk(''), 1400);
  };
  return (<section className="wrap"><h2 className="h reveal">Support / Crypto</h2><p className="p reveal">Totally optional. These are public receive-only addresses.</p>
    <div id="crypto"><div className="coins reveal">{CRYPTO.map(([n, a]) => { const [sl, c] = n.startsWith('USDT') ? ['tether', '26A17B'] : COIN[n];
      return <button key={n} className={'coin' + (ok === n ? ' ok' : '')} data-addr={a} data-name={n} aria-label={`Copy ${n} address`} onMouseEnter={() => setInfo([n, a])} onFocus={() => setInfo([n, a])} onClick={() => copy(n, a)}><img src={si(sl, c)} alt="" width={36} height={36} /></button>; })}</div>
      <div className="coininfo glass reveal"><b id="ciName">{info[0]}</b><code id="ciAddr">{info[1]}</code></div></div></section>);
}

export const Contact = () => (<section id="contact" className="wrap"><div className="contact glass reveal"><Emoji k="wave" /><h2 className="h">Contact Me :)</h2>
  <p className="p">Have an idea, project, collaboration or just want to say hi? Feel free to reach out.</p>
  <div className="row"><a className="btn primary" target="_blank" rel="noopener" href="https://discord.com/users/1433506876661694544">Discord</a><a className="btn" target="_blank" rel="noopener" href="https://t.me/TheZack_0">Telegram</a>
    <a className="btn" target="_blank" rel="noopener" href="https://github.com/zakariazack2565-bit">GitHub</a><a className="btn" href="mailto:zakariazack2565@gmail.com">zakariazack2565@gmail.com</a></div></div></section>);

export const Footer = () => (<footer className="wrap"><p>© 2026 Zack. Built with code, curiosity and way too much caffeine.</p>
  <div className="row">{SOCIALS.map(([n, u, i]) => <a key={n} target="_blank" rel="noopener" href={u} aria-label={n}><SocIcon src={i} /></a>)}</div></footer>);
