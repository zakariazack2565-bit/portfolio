'use strict';
/* Scroll-driven theme (colour, corner radius, 3D shape) + Three.js background scene */
(() => {
  const R = matchMedia('(prefers-reduced-motion: reduce)').matches, root = document.documentElement;
  const secs = [...document.querySelectorAll('main > section')]; if (!secs.length) return;
  const NAMES = ['Home', 'About', 'Stack', 'Projects', 'Tools', 'Socials', 'Support', 'Contact'];
  const PAL = [['#a855f7', '#7c3aed'], ['#38bdf8', '#0284c7'], ['#34d399', '#059669'], ['#f472b6', '#db2777'], ['#fb923c', '#ea580c'], ['#818cf8', '#4f46e5'], ['#facc15', '#ca8a04'], ['#a855f7', '#7c3aed']];
  const RAD = [28, 42, 14, 48, 20, 34, 10, 30];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  const sm = t => t * t * (3 - 2 * t), rgb = a => `rgb(${a.map(Math.round)})`, P = i => PAL[i % PAL.length];
  let tops = [], cur = [168, 85, 247], idx = -1, prog = 0;
  const measure = () => { tops = secs.map(s => s.getBoundingClientRect().top + scrollY); };

  // section dots + HUD
  const dots = document.createElement('nav'), hud = document.createElement('div');
  dots.className = 'dots'; hud.className = 'hud glass';
  dots.innerHTML = secs.map((s, i) => `<button aria-label="${NAMES[i] || 'Section'}" data-i="${i}"><span>${NAMES[i] || ''}</span></button>`).join('');
  dots.onclick = e => { const b = e.target.closest('button'); if (b) secs[+b.dataset.i].scrollIntoView({ behavior: R ? 'auto' : 'smooth' }); };
  document.body.append(dots, hud);

  function update() {
    const y = scrollY + innerHeight * .45; let i = 0;
    while (i < secs.length - 1 && y >= tops[i + 1]) i++;
    const last = i >= secs.length - 1, end = last ? tops[i] + secs[i].offsetHeight : tops[i + 1];
    const p = Math.min(1, Math.max(0, (y - tops[i]) / Math.max(1, end - tops[i])));
    const u = last ? 0 : sm(Math.min(1, Math.max(0, (p - .55) / .45))), j = last ? i : i + 1;
    cur = mix(hex(P(i)[0]), hex(P(j)[0]), u);
    const c2 = mix(hex(P(i)[1]), hex(P(j)[1]), u), rad = RAD[i % 8] + (RAD[j % 8] - RAD[i % 8]) * u, s = root.style;
    s.setProperty('--p', rgb(cur)); s.setProperty('--p2', rgb(c2)); s.setProperty('--pr', cur.map(Math.round).join(',')); s.setProperty('--cr', rad.toFixed(1) + 'px');
    prog = scrollY / Math.max(1, root.scrollHeight - innerHeight);
    const now = u > .5 ? j : i;
    if (now !== idx) { idx = now; hud.innerHTML = `<b>${String(now + 1).padStart(2, '0')}</b><em>/ ${String(secs.length).padStart(2, '0')}</em> ${NAMES[now] || ''}`; [...dots.children].forEach((d, k) => d.classList.toggle('on', k === now)); }
  }
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; update(); }); } }, { passive: true });
  addEventListener('resize', () => { measure(); update(); });
  new ResizeObserver(() => { measure(); update(); }).observe(document.querySelector('main'));
  measure(); update();

  // 3D scene (Three.js from cdnjs, loaded after the page; skipped for reduced motion or no WebGL)
  function init() {
    if (!window.THREE) return; const T = THREE;
    try { if (!document.createElement('canvas').getContext('webgl')) return; } catch { return; }
    const cv = document.createElement('canvas'); cv.id = 'scene'; const bg0 = document.getElementById('bg'); bg0 ? bg0.after(cv) : document.body.prepend(cv);
    const rd = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true, powerPreference: 'low-power' });
    rd.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    const sc = new T.Scene(), cam = new T.PerspectiveCamera(55, 1, .1, 100); cam.position.z = 9;
    const geos = [new T.IcosahedronGeometry(2, 1), new T.TorusKnotGeometry(1.4, .45, 120, 16), new T.OctahedronGeometry(2.2, 1), new T.TorusGeometry(1.8, .6, 16, 60), new T.DodecahedronGeometry(2, 0), new T.IcosahedronGeometry(2.1, 0)];
    const wire = new T.Mesh(geos[0], new T.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: .4 }));
    const core = new T.Mesh(geos[0], new T.MeshBasicMaterial({ transparent: true, opacity: .08 }));
    const grp = new T.Group(); grp.add(wire, core); sc.add(grp);
    const N = 900, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const r = 6 + Math.random() * 22, a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1); pos.set([r * Math.sin(b) * Math.cos(a), r * Math.sin(b) * Math.sin(a), r * Math.cos(b)], i * 3); }
    const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
    const pm = new T.PointsMaterial({ size: .06, transparent: true, opacity: .8, depthWrite: false }), pts = new T.Points(pg, pm); sc.add(pts);
    const col = new T.Color(), size = () => { rd.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
    size(); addEventListener('resize', size);
    let mx = 0, my = 0, k = 0, shape = 0, prev = scrollY, vel = 0, t0 = performance.now(), raf;
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - t0) / 1000); t0 = now;
      vel += (Math.min(60, Math.abs(scrollY - prev)) - vel) * .12; prev = scrollY;
      const want = Math.max(0, idx) % geos.length, wide = innerWidth > 900;
      if (shape !== want) { k += (0 - k) * .18; if (k < .05) { shape = want; wire.geometry = core.geometry = geos[want]; } } else k += (1 - k) * .08;
      grp.scale.setScalar(Math.max(.001, k) * (1 + vel * .004));
      grp.position.x += ((wide ? (idx % 2 ? -3.4 : 3.4) : 0) - grp.position.x) * .05; grp.position.y += ((wide ? 0 : -1.5) - grp.position.y) * .05;
      grp.rotation.x += dt * .25 + vel * .002; grp.rotation.y += dt * .35 + vel * .003;
      pts.rotation.y += dt * .02 + vel * .0006; pts.rotation.x = prog * 1.2;
      cam.position.z += (9 - prog * 3.5 - cam.position.z) * .05; cam.position.x += (mx * 1.6 - cam.position.x) * .04; cam.position.y += (-my * 1.1 - cam.position.y) * .04; cam.lookAt(0, 0, 0);
      col.setRGB(cur[0] / 255, cur[1] / 255, cur[2] / 255); wire.material.color.copy(col); core.material.color.copy(col); pm.color.copy(col);
      rd.render(sc, cam);
    }
    document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) { t0 = performance.now(); raf = requestAnimationFrame(frame); } });
    raf = requestAnimationFrame(frame); cv.classList.add('on'); document.getElementById('bg')?.classList.add('off');
  }
  const go = () => { if (R) return; const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.onload = init; document.head.append(s); };
  document.readyState === 'complete' ? go() : addEventListener('load', go);
})();
