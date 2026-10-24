import { useEffect } from 'react';
import { About, Contact, Crypto, Footer, Hero, Nav, Projects, Socials, Stack, ToolsTeaser } from './Sections';

let loaded = false;
const load = (src: string) => new Promise<void>(r => { const s = document.createElement('script'); s.src = src; s.onload = () => r(); s.onerror = () => r(); document.body.append(s); });

export default function App() {
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    if (!loaded) { loaded = true; load('/js/fx.js').then(() => load('/js/scene.js')); }   // effects + the 3D world, unchanged
    return () => io.disconnect();
  }, []);
  return (<><Nav /><main><Hero /><About /><Stack /><Projects /><ToolsTeaser /><Socials /><Crypto /><Contact /></main><Footer /></>);
}
