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
  let tops = [], cur = [168, 85, 247], idx = -1, prog = 0, fpos = 0;
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
    fpos = i + u; const now = u > .5 ? j : i;
    if (now !== idx) { idx = now; hud.innerHTML = `<b>${String(now + 1).padStart(2, '0')}</b><em>/ ${String(secs.length).padStart(2, '0')}</em> ${NAMES[now] || ''}`; [...dots.children].forEach((d, k) => d.classList.toggle('on', k === now)); }
  }
  let tick = false;
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(() => { tick = false; update(); }); } }, { passive: true });
  addEventListener('resize', () => { measure(); update(); });
  new ResizeObserver(() => { measure(); update(); }).observe(document.querySelector('main'));
  measure(); update();

  // 3D scene: shader plasma core, gyro rings, warp-tunnel stars. Skipped for reduced motion, Save-Data or no WebGL.
  const VS = `uniform float uT,uAmp,uFreq,uTwist,uVel;uniform vec3 uMouse;varying vec3 vN;varying vec3 vP;varying float vD;
void main(){
  float n=sin(position.x*uFreq+uT)*sin(position.y*uFreq*1.3-uT*.8)*sin(position.z*uFreq*.9+uT*1.1);
  n+=.5*sin(position.x*uFreq*2.1-uT*1.3)*sin(position.z*uFreq*2.3+uT);
  float m=1.-smoothstep(0.,2.4,distance(position,uMouse));
  float d=n*uAmp*(1.+uVel*.03)+m*.3;
  vec3 p=position+normal*d;
  float a=p.y*uTwist;float c=cos(a);float s=sin(a);
  p.xz=mat2(c,-s,s,c)*p.xz;
  vD=d;vN=normalize(normalMatrix*normal);
  vec4 mv=modelViewMatrix*vec4(p,1.);
  vP=-mv.xyz;
  gl_Position=projectionMatrix*mv;
}`;
  const FS = `uniform vec3 uCol;uniform float uT,uOp;varying vec3 vN;varying vec3 vP;varying float vD;
void main(){
  float f=pow(1.-abs(dot(normalize(vN),normalize(vP))),2.2);
  float sc=.5+.5*sin(vP.y*30.-uT*2.5);
  vec3 col=uCol*(f*1.5+vD*1.4+.1)+vec3(.7,.85,1.)*f*f*.6+uCol*sc*.06;
  gl_FragColor=vec4(col,clamp(f+.1+abs(vD),0.,1.)*.85*uOp);
}`;
  const FW = `uniform vec3 uCol;uniform float uOp;void main(){gl_FragColor=vec4(uCol*1.2,.28*uOp);}`;
  const PV = `attribute float aSeed;uniform float uOff,uT,uPx,uVel;varying float vA;varying float vH;
void main(){
  vec3 p=position;
  p.z=mod(p.z+uOff*(.6+aSeed*.8),60.)-50.;
  float g=uT*.03*(aSeed-.5);float c=cos(g);float s=sin(g);
  p.xy=mat2(c,-s,s,c)*p.xy;
  vec4 mv=modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  float tw=.6+.4*sin(uT*2.+aSeed*40.);
  gl_PointSize=min(64.,(1.2+aSeed*2.6)*uPx*(18./max(1.,-mv.z))*(1.+uVel*.05)*tw);
  vA=smoothstep(-50.,-34.,p.z)*(1.-smoothstep(-2.,8.,p.z))*tw;vH=aSeed;
}`;
  const PF = `uniform vec3 uCol;varying float vA;varying float vH;
void main(){vec2 q=gl_PointCoord-.5;float d=length(q);if(d>.5)discard;float a=1.-smoothstep(0.,.5,d);gl_FragColor=vec4(mix(uCol,vec3(1.),vH*.35),a*vA*.9);}`;
  // per-section look: [noise frequency, wobble amount, twist]
  const CP = [[1.1, .22, 0], [1.6, .38, .15], [2.6, .18, 0], [1.2, .5, .35], [2.1, .3, -.25], [1.4, .42, .1], [3, .16, 0], [1.1, .22, 0]];
  const par = fi => { const a = Math.min(CP.length - 1, Math.floor(fi)), b = Math.min(CP.length - 1, a + 1), f = fi - a; return CP[a].map((v, k) => v + (CP[b][k] - v) * f); };

  function init() {
    if (!window.THREE) return; const T = THREE;
    try {
      if (!document.createElement('canvas').getContext('webgl')) return;
      const mob = innerWidth < 900 || matchMedia('(pointer:coarse)').matches, low = mob && (navigator.hardwareConcurrency || 4) <= 4;
      const cv = document.createElement('canvas'); cv.id = 'scene'; const bg0 = document.getElementById('bg'); bg0 ? bg0.after(cv) : document.body.prepend(cv);
      const rd = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: !mob, powerPreference: 'high-performance' });
      rd.setPixelRatio(Math.min(devicePixelRatio, mob ? 1.5 : 2));
      const sc = new T.Scene(), cam = new T.PerspectiveCamera(55, 1, .1, 120); cam.position.z = 9;
      const U = { uT: { value: 0 }, uAmp: { value: .22 }, uFreq: { value: 1.1 }, uTwist: { value: 0 }, uVel: { value: 0 }, uMouse: { value: new T.Vector3(0, 0, 2) }, uCol: { value: new T.Color('#a855f7') }, uOp: { value: mob ? .7 : 1 } };
      const mat = o => new T.ShaderMaterial(Object.assign({ uniforms: U, vertexShader: VS, transparent: true, blending: T.AdditiveBlending, depthWrite: false }, o));
      const grp = new T.Group(); sc.add(grp);
      const core = new T.Mesh(new T.IcosahedronGeometry(2, low ? 6 : mob ? 9 : 14), mat({ fragmentShader: FS })), wire = new T.Mesh(new T.IcosahedronGeometry(2, mob ? 3 : 5), mat({ fragmentShader: FW, wireframe: true }));
      core.frustumCulled = wire.frustumCulled = false; grp.add(core, wire);
      const ringMat = new T.MeshBasicMaterial({ transparent: true, opacity: .45, blending: T.AdditiveBlending, depthWrite: false });
      const rings = [3, 3.6, 4.3].map((r, i) => { const m = new T.Mesh(new T.TorusGeometry(r, .012 + i * .004, 8, mob ? 96 : 192), ringMat); m.rotation.set(1 + i * .5, i * .7, 0); grp.add(m); return m; });
      const hc = document.createElement('canvas'); hc.width = hc.height = 128; const g2 = hc.getContext('2d'), gr = g2.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.25, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 128, 128);
      const halo = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(hc), transparent: true, opacity: .55, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(mob ? 9 : 13); grp.add(halo);
      const N = low ? 700 : mob ? 1100 : 2400, pos = new Float32Array(N * 3), seed = new Float32Array(N);
      for (let i = 0; i < N; i++) { const r = 2.5 + Math.pow(Math.random(), .6) * 18, a = Math.random() * 6.283; pos.set([r * Math.cos(a), r * Math.sin(a), Math.random() * 60], i * 3); seed[i] = Math.random(); }
      const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3)); pg.setAttribute('aSeed', new T.BufferAttribute(seed, 1));
      const PU = { uOff: { value: 0 }, uT: U.uT, uPx: { value: 1 }, uVel: U.uVel, uCol: U.uCol };
      const pts = new T.Points(pg, new T.ShaderMaterial({ uniforms: PU, vertexShader: PV, fragmentShader: PF, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); pts.frustumCulled = false; sc.add(pts);
      const size = () => { rd.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); PU.uPx.value = rd.getPixelRatio(); };
      size(); addEventListener('resize', size);
      const tmp = new T.Vector3(); let mx = 0, my = 0, prev = scrollY, vel = 0, off = 0, t = 0, t0 = performance.now(), raf, slow = 0, down = false;
      addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
      function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(.05, (now - t0) / 1000); t0 = now; t += dt;
        const dy = scrollY - prev; prev = scrollY; vel += (Math.min(70, Math.abs(dy)) - vel) * .1; off += dt * 1.2 + dy * .02;
        if (!down && t > 2) { slow = dt > .03 ? slow + 1 : Math.max(0, slow - 2); if (slow > 60) { down = true; rd.setPixelRatio(1); size(); pg.setDrawRange(0, N >> 1); } }  // weak device: lower quality once
        const p = par(Math.max(0, fpos)), k = .06;
        U.uT.value = t; U.uAmp.value += (p[1] - U.uAmp.value) * k; U.uFreq.value += (p[0] - U.uFreq.value) * k; U.uTwist.value += (p[2] - U.uTwist.value) * k; U.uVel.value += (vel - U.uVel.value) * .1;
        U.uMouse.value.lerp(tmp.set(mx * 5, -my * 4, 1.5), .08); PU.uOff.value = off;
        const wide = innerWidth > 900, fx = wide ? Math.sin(fpos * 1.2) * 3.6 : 0, fy = wide ? Math.sin(fpos * .7) * .6 : .9, base = (wide ? 1 : .72) * (1 + vel * .004);
        grp.position.x += (fx - grp.position.x) * .05; grp.position.y += (fy - grp.position.y) * .05; grp.scale.setScalar(grp.scale.x + (base - grp.scale.x) * .1);
        grp.rotation.y += dt * .25 + dy * .0015; grp.rotation.x = Math.sin(t * .3) * .25 + prog * 1.5;
        rings.forEach((r, i) => { r.rotation.z += dt * (.3 + i * .18) * (i % 2 ? -1 : 1) + dy * .0008; });
        cam.position.z += (9 - prog * 2.5 - cam.position.z) * .05; cam.position.x += (mx * 1.8 - cam.position.x) * .04; cam.position.y += (-my * 1.2 - cam.position.y) * .04;
        const roll = mx * .06 - Math.max(-.12, Math.min(.12, dy * .002)); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(0, 0, 0);
        const fov = 55 + vel * .22; if (Math.abs(fov - cam.fov) > .1) { cam.fov += (fov - cam.fov) * .1; cam.updateProjectionMatrix(); }
        U.uCol.value.setRGB(cur[0] / 255, cur[1] / 255, cur[2] / 255); ringMat.color.copy(U.uCol.value); halo.material.color.copy(U.uCol.value);
        rd.render(sc, cam);
      }
      document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) { t0 = performance.now(); raf = requestAnimationFrame(frame); } });
      raf = requestAnimationFrame(frame); cv.classList.add('on'); bg0?.classList.add('off');
    } catch (e) { console.warn('3D scene skipped:', e); document.getElementById('scene')?.remove(); }
  }
  const go = () => { if (R || (navigator.connection && navigator.connection.saveData)) return; const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.onload = init; document.head.append(s); };
  document.readyState === 'complete' ? go() : addEventListener('load', go);
})();
