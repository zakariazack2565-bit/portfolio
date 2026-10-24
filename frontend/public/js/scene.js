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
  let tops = [], cur = [168, 85, 247], idx = -1, prog = 0, fpos = 0, hs = [];
  const measure = () => { tops = secs.map(s => s.getBoundingClientRect().top + scrollY); hs = secs.map(s => s.offsetHeight); };

  // section dots + HUD
  const dots = document.createElement('nav'), hud = document.createElement('div');
  dots.className = 'dots'; hud.className = 'hud glass';
  dots.innerHTML = secs.map((s, i) => `<button aria-label="${NAMES[i] || 'Section'}" data-i="${i}"><span>${NAMES[i] || ''}</span></button>`).join('');
  dots.onclick = e => { const b = e.target.closest('button'); if (b) secs[+b.dataset.i].scrollIntoView({ behavior: R ? 'auto' : 'smooth' }); };
  document.body.append(dots, hud);

  function update() {
    if (!R && innerWidth > 900) secs.forEach((s, k) => { const d = (tops[k] + hs[k] / 2 - scrollY - innerHeight / 2) / innerHeight; s.style.setProperty('--d', (Math.sign(d) * Math.min(1, Math.max(0, Math.abs(d) - .35))).toFixed(3)); });
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
      const mob = innerWidth < 900 || matchMedia('(pointer:coarse)').matches, low = mob && (navigator.hardwareConcurrency || 4) <= 4, NS = secs.length;
      const cv = document.createElement('canvas'); cv.id = 'scene'; const bg0 = document.getElementById('bg'); bg0 ? bg0.after(cv) : document.body.prepend(cv);
      const rd = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: !mob, powerPreference: 'high-performance' });
      rd.setPixelRatio(Math.min(devicePixelRatio, mob ? 1.5 : 2));
      const sc = new T.Scene(), cam = new T.PerspectiveCamera(55, 1, .1, 200);
      const U = { uT: { value: 0 }, uAmp: { value: .22 }, uFreq: { value: 1.1 }, uTwist: { value: 0 }, uVel: { value: 0 }, uMouse: { value: new T.Vector3(0, 0, 2) }, uCol: { value: new T.Color('#a855f7') }, uOp: { value: mob ? .7 : 1 } };
      const mat = o => new T.ShaderMaterial(Object.assign({ uniforms: U, vertexShader: VS, transparent: true, blending: T.AdditiveBlending, depthWrite: false }, o));
      const add = { transparent: true, blending: T.AdditiveBlending, depthWrite: false };
      const LM = new T.LineBasicMaterial({ ...add, opacity: .7 }), FM = new T.MeshBasicMaterial({ ...add, opacity: .16, side: T.DoubleSide }), ringMat = new T.MeshBasicMaterial({ ...add, opacity: .45 }), nodeMat = new T.PointsMaterial({ ...add, size: .12 });
      const edges = g => new T.LineSegments(new T.EdgesGeometry(g), LM), fill = g => new T.Mesh(g, FM), G = () => new T.Group();
      // the world: one station per section, spread along a curved path
      const SP = Array.from({ length: NS }, (_, i) => new T.Vector3(Math.sin(i * 1.1) * 2, Math.cos(i * .9), -i * 30)), ST = [];
      // 0 Home: plasma core + gyro rings + halo
      const grp = G(), core = new T.Mesh(new T.IcosahedronGeometry(2, low ? 6 : mob ? 9 : 14), mat({ fragmentShader: FS })), wire = new T.Mesh(new T.IcosahedronGeometry(2, mob ? 3 : 5), mat({ fragmentShader: FW, wireframe: true }));
      core.frustumCulled = wire.frustumCulled = false; grp.add(core, wire);
      const rings = [3, 3.6, 4.3].map((r, i) => { const m = new T.Mesh(new T.TorusGeometry(r, .012 + i * .004, 8, mob ? 96 : 192), ringMat); m.rotation.set(1 + i * .5, i * .7, 0); grp.add(m); return m; });
      const hc = document.createElement('canvas'); hc.width = hc.height = 128; const g2 = hc.getContext('2d'), gr = g2.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.25, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 128, 128);
      const halo = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(hc), ...add, opacity: .55 })); halo.scale.setScalar(mob ? 9 : 13); grp.add(halo);
      ST[0] = { g: grp, u: (t, dy, mx, my, v) => { grp.rotation.y += .004 + dy * .0015; grp.rotation.x = Math.sin(t * .3) * .25; grp.scale.setScalar((mob ? .72 : 1) * (1 + v * .004)); rings.forEach((r, i) => { r.rotation.z += (.3 + i * .18) * .016 * (i % 2 ? -1 : 1) + dy * .0008; }); } };
      // 1 About: six crystals orbiting a seed
      const s1 = G(), orbs = [0, 1, 2, 3, 4, 5].map(() => { const m = edges(new T.OctahedronGeometry(.5)); s1.add(m); return m; }); s1.add(fill(new T.IcosahedronGeometry(.9, 1)), edges(new T.IcosahedronGeometry(1.1, 1)));
      ST[1] = { g: s1, u: (t, dy, mx, my, v) => orbs.forEach((m, i) => { const a = t * (.5 + v * .02) + i * 1.047; m.position.set(Math.cos(a) * 3, Math.sin(a * 1.3) * 1.2 - my, Math.sin(a) * 3); m.rotation.x = m.rotation.y = a * 2; }) };
      // 2 Stack: wave of data towers over a grid
      const n = mob ? 8 : 12, tw = new T.InstancedMesh(new T.BoxGeometry(.5, 1, .5), FM, n * n), dm = new T.Object3D(), s2 = G(), grid = new T.GridHelper(10, 12); grid.material = LM; grid.position.y = -2; s2.add(tw, grid);
      ST[2] = { g: s2, u: (t, dy, mx) => { let k = 0; for (let x = 0; x < n; x++) for (let z = 0; z < n; z++) { const h = 1 + 2.2 * (Math.sin(x * .7 + t * 1.3 + mx * 4) * Math.cos(z * .6 - t) * .5 + .5); dm.position.set((x - n / 2) * .8, h / 2 - 2, (z - n / 2) * .8); dm.scale.set(1, h, 1); dm.updateMatrix(); tw.setMatrixAt(k++, dm.matrix); } tw.instanceMatrix.needsUpdate = true; s2.rotation.y = mx * .5; } };
      // 3 Projects: glass frames floating in depth
      const s3 = G(), fr = [0, 1, 2, 3].map(i => { const f = G(); f.add(edges(new T.PlaneGeometry(2.6, 1.7)), fill(new T.PlaneGeometry(2.6, 1.7))); f.position.set((i - 1.5) * 2.2, i % 2 ? .8 : -.8, -i * 1.2); s3.add(f); return f; });
      ST[3] = { g: s3, u: (t, dy, mx, my) => fr.forEach((f, i) => { f.rotation.y = mx * .8 - .35 + Math.sin(t * .5 + i) * .08; f.rotation.x = -my * .4; f.position.z = -i * 1.2 + Math.sin(t + i) * .2; }) };
      // 4 Tools: interlocking machine gears
      const s4 = G(), g1 = edges(new T.CylinderGeometry(1.6, 1.6, .4, 14)), g3 = edges(new T.CylinderGeometry(1.1, 1.1, .4, 10)), g5 = edges(new T.TorusGeometry(2.7, .05, 6, 6)); g1.rotation.x = g3.rotation.x = Math.PI / 2; g3.position.x = 2.6; s4.add(g1, g3, g5);
      ST[4] = { g: s4, u: (t, dy) => { const s = .01 + Math.abs(dy) * .004; g1.rotation.y += s; g3.rotation.y -= s * 1.45; g5.rotation.z += .004; s4.rotation.y = Math.sin(t * .4) * .4; } };
      // 5 Socials: constellation network
      const NN = mob ? 22 : 36, np = Array.from({ length: NN }, () => new T.Vector3((Math.random() - .5) * 8, (Math.random() - .5) * 4, (Math.random() - .5) * 5)), lp = [];
      for (let i = 0; i < NN; i++) for (let j = i + 1; j < NN; j++) if (np[i].distanceTo(np[j]) < 2.4) lp.push(np[i], np[j]);
      const s5 = G(); s5.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(lp), LM), new T.Points(new T.BufferGeometry().setFromPoints(np), nodeMat));
      ST[5] = { g: s5, u: (t, dy, mx, my) => { s5.rotation.y = t * .15 + mx; s5.rotation.x = my * .5; } };
      // 6 Support: orbiting coins
      const s6 = G(), coins = Array.from({ length: 7 }, (_, i) => { const c = edges(new T.CylinderGeometry(.9, .9, .12, 24)); c.add(fill(new T.CylinderGeometry(.9, .9, .12, 24))); c.position.x = (i - 3) * 1.3; s6.add(c); return c; });
      ST[6] = { g: s6, u: (t, dy, mx, my, v) => coins.forEach((c, i) => { c.rotation.x = Math.PI / 2 + Math.sin(t + i) * .3; c.rotation.y += .02 + v * .01; c.position.y = Math.sin(t * .8 + i * .9) * 1.6; }) };
      // 7 Contact: portal of rings
      const s7 = G(), pr = Array.from({ length: 10 }, (_, i) => { const r = new T.Mesh(new T.TorusGeometry(1 + i * .45, .02, 6, 64), ringMat); r.position.z = -i * .7; s7.add(r); return r; });
      ST[7] = { g: s7, u: t => pr.forEach((r, i) => { r.scale.setScalar(1 + .08 * Math.sin(t * 2 - i * .6)); r.rotation.z = t * .1 * (i % 2 ? 1 : -1); }) };
      ST.forEach((s, i) => { if (!s) return; s.w = G(); s.w.add(s.g); s.w.position.copy(SP[i % NS]); sc.add(s.w); }); if (NS < 8) ST.length = NS;
      if (mob) { FM.opacity = .1; LM.opacity = .55; }
      // stars rush past the camera
      const N = low ? 700 : mob ? 1100 : 2400, pos = new Float32Array(N * 3), seed = new Float32Array(N);
      for (let i = 0; i < N; i++) { const r = 2.5 + Math.pow(Math.random(), .6) * 18, a = Math.random() * 6.283; pos.set([r * Math.cos(a), r * Math.sin(a), Math.random() * 60], i * 3); seed[i] = Math.random(); }
      const pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3)); pg.setAttribute('aSeed', new T.BufferAttribute(seed, 1));
      const PU = { uOff: { value: 0 }, uT: U.uT, uPx: { value: 1 }, uVel: U.uVel, uCol: U.uCol };
      const pts = new T.Points(pg, new T.ShaderMaterial({ uniforms: PU, vertexShader: PV, fragmentShader: PF, ...add })); pts.frustumCulled = false; sc.add(pts);
      // camera path through every station
      const side = i => mob ? 0 : (i % 2 ? 1 : -1) * 3.2;
      const cC = new T.CatmullRomCurve3(SP.map(p => new T.Vector3(p.x, p.y + (mob ? 0 : .4), p.z + 10))), cL = new T.CatmullRomCurve3(SP.map((p, i) => new T.Vector3(p.x + side(i), p.y + (mob ? -1.4 : 0), p.z)));
      const size = () => { rd.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); PU.uPx.value = rd.getPixelRatio(); };
      size(); addEventListener('resize', size);
      const tmp = new T.Vector3(), v1 = new T.Vector3(), v2 = new T.Vector3(), col = new T.Color();
      let mx = 0, my = 0, prev = scrollY, vel = 0, off = 0, t = 0, fs = 0, t0 = performance.now(), raf, slow = 0, down = false;
      addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
      function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(.05, (now - t0) / 1000); t0 = now; t += dt;
        const dy = scrollY - prev; prev = scrollY; vel += (Math.min(70, Math.abs(dy)) - vel) * .1; off += dt * 1.2 + dy * .02;
        if (!down && t > 2) { slow = dt > .03 ? slow + 1 : Math.max(0, slow - 2); if (slow > 60) { down = true; rd.setPixelRatio(1); size(); pg.setDrawRange(0, N >> 1); } }
        const p = par(Math.max(0, fpos)), k = .06;
        U.uT.value = t; U.uAmp.value += (p[1] - U.uAmp.value) * k; U.uFreq.value += (p[0] - U.uFreq.value) * k; U.uTwist.value += (p[2] - U.uTwist.value) * k; U.uVel.value += (vel - U.uVel.value) * .1;
        U.uMouse.value.lerp(tmp.set(mx * 5, -my * 4, 1.5), .08); PU.uOff.value = off;
        fs += (fpos - fs) * .06; const u = Math.min(1, Math.max(0, fs / Math.max(1, NS - 1)));   // smoothed scroll = glide
        cC.getPoint(u, v1); cL.getPoint(u, v2); v1.x += mx * 1.4; v1.y -= my; cam.position.copy(v1);
        const roll = mx * .06 - Math.max(-.12, Math.min(.12, dy * .002)); cam.up.set(Math.sin(roll), Math.cos(roll), 0); cam.lookAt(v2);
        const fov = 55 + vel * .22; if (Math.abs(fov - cam.fov) > .1) { cam.fov += (fov - cam.fov) * .1; cam.updateProjectionMatrix(); }
        pts.position.copy(cam.position);
        ST.forEach((s, i) => { if (!s) return; const q = Math.max(0, 1 - Math.abs(i - fs) / 1.1), near = q > 0; s.w.visible = near; if (near) { s.w.scale.setScalar(Math.max(.001, q * q * (3 - 2 * q))); s.u(t, dy, mx, my, vel); } });
        U.uCol.value.setRGB(cur[0] / 255, cur[1] / 255, cur[2] / 255); [LM, FM, ringMat, nodeMat, halo.material].forEach(m => m.color.copy(U.uCol.value));
        rd.render(sc, cam);
      }
      document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) { t0 = performance.now(); raf = requestAnimationFrame(frame); } });
      raf = requestAnimationFrame(frame); cv.classList.add('on'); bg0?.classList.add('off');
    } catch (e) { console.warn('3D scene skipped:', e); document.getElementById('scene')?.remove(); }
  }
  const go = () => { if (R || (navigator.connection && navigator.connection.saveData)) return; const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'; s.onload = init; document.head.append(s); };
  document.readyState === 'complete' ? go() : addEventListener('load', go);
})();
