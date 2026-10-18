/* Coca-Cola Georgia concept: one living winter world, the scroll moves the camera through it */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => [...(c || document).querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ss = (a, b, x) => { x = clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const CALM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = innerWidth, H = innerHeight, scrollY0 = scrollY, mx = .5, my = .5, px = -999, py = -999;

  { const g = new URLSearchParams(location.search).get('g'); if (g) { document.body.classList.remove('g1'); document.body.classList.add('g' + g); } } // greeting variant for review
  /* ---------- header + menu ---------- */
  const hd = $('.hd'), menu = $('.menu');
  $('.hd-burger').addEventListener('click', () => { const o = menu.hidden; menu.hidden = !o; hd.classList.toggle('open', o); $('.hd-burger').setAttribute('aria-expanded', o); });
  $$('a', menu).forEach(a => a.addEventListener('click', () => { menu.hidden = true; hd.classList.remove('open'); }));

  /* ---------- the world: one shader keeps the photographs alive (lights twinkle, mist drifts, aurora flows) and moves the camera ---------- */
  const FRAG = `precision highp float; varying vec2 vUv; uniform sampler2D tA,tB; uniform vec2 res,mouse,cen; uniform float time,zoom,blur,sky,fin,washA,dim,aur; uniform vec3 wash;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
  float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
  void main(){
    float ra=res.x/res.y, ia=1.7917; vec2 s=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);
    vec2 uv=vUv; float near=clamp(1.-uv.y*1.3,0.,1.)+smoothstep(.22,0.,uv.x)*.5+smoothstep(.78,1.,uv.x)*.5;
    vec2 p=(uv-.5)/zoom+cen+mouse*.012*near/zoom;
    vec2 a=vec2((p.x-.5)*s.x+.5,p.y*s.y);
    vec3 c=texture2D(tA,a,blur).rgb;
    float warm=smoothstep(.1,.34,c.r-c.b)*smoothstep(.5,.85,c.r);
    c*=1.+warm*(.5*(noise(a*vec2(46.,26.)+vec2(time*.55,time*.3))-.5)+.22*(noise(a*vec2(120.,68.)-time*1.1)-.5));
    float m=fbm(vec2(a.x*3.+time*.025,a.y*7.-time*.012))*smoothstep(.44,.04,a.y)*.26; c=mix(c,vec3(.86,.91,1.),m);
    // chimney smoke: the plume painted in the photo is set in motion (its own pixels flow up the column), with fresh puffs rising through it
    vec2 sd=a-vec2(.675,.482); float sh=sd.y, sx=sd.x*1.79;
    float cxs=sh*.5+sin(sh*22.-time*.9)*sh*.16, ws=.006+sh*.36;
    float plume=exp(-pow((sx-cxs)/ws,2.))*smoothstep(0.,.008,sh)*smoothstep(.27,.04,sh);
    vec2 fdv=vec2(.5/1.79,1.)*.06; float f1=fract(time*.17), f2=fract(time*.17+.5);
    vec2 wob=(vec2(noise(a*60.+time*.5),noise(a*60.-time*.4))-.5)*.006;
    vec3 fl=texture2D(tA,a-fdv*f1+wob).rgb*(1.-abs(2.*f1-1.))+texture2D(tA,a-fdv*f2+wob).rgb*(1.-abs(2.*f2-1.));
    c=mix(c,max(c,fl),plume*.85);
    float puff=fbm(vec2(sx*30.-time*.2,sh*20.-time*1.1));
    c=mix(c,vec3(.8,.85,.93),clamp(plume*(.12+1.25*puff*puff)*.8,0.,.82));
    vec3 sk=mix(vec3(.03,.07,.16),vec3(.012,.025,.07),uv.y);
    vec2 g=uv*vec2(ra,1.)*70.; vec2 id=floor(g); float hs=hash(id); vec2 f=fract(g)-.5-(vec2(hash(id+3.1),hash(id+7.7))-.5)*.7;
    sk+=smoothstep(.02+.07*hs,0.,length(f))*step(.8,hs)*(.55+.45*sin(time*(1.+3.*hs)+hs*30.));
    float x=uv.x*2.2+uv.y*.7+fbm(vec2(uv.x*1.5+uv.y*.8,time*.05))*1.3; float band=fbm(vec2(x*1.3,uv.y*1.1+time*.07+3.));
    float cu=smoothstep(.34,.8,band)*smoothstep(.22,.6,uv.y+fbm(vec2(x*2.,time*.06))*.25)*smoothstep(1.08,.7,uv.y); float rays=.82+.18*sin(x*13.+fbm(vec2(x*3.,time*.2))*6.);
    sk+=mix(vec3(.1,.95,.55),vec3(.3,.5,1.),uv.y)*cu*rays*aur*.5;
    sk=mix(sk,vec3(.8,.88,1.),smoothstep(.12,-.02,uv.y)*.45);
    c=mix(c,sk,sky);
    vec2 q=uv+mouse*.006; vec2 b=vec2((q.x-.5)*s.x+.5+(1.-s.x)*.2,q.y*s.y);
    vec3 b0=texture2D(tB,b).rgb; float gr=smoothstep(.02,.2,b0.g-max(b0.r,b0.b)*.92);
    vec2 d=vec2(noise(b*4.+time*.12),noise(b*4.-time*.1+9.))-.5; vec3 cb=texture2D(tB,b+d*.03*gr).rgb; cb+=b0*gr*.22*sin(time*.9+b.x*11.);
    float wb=smoothstep(.1,.34,cb.r-cb.b)*smoothstep(.5,.85,cb.r); cb*=1.+wb*(.5*(noise(b*vec2(46.,26.)+vec2(time*.55,time*.3))-.5)+.22*(noise(b*vec2(120.,68.)-time*1.1)-.5));
    c=mix(c,cb,fin);
    float rad=smoothstep(.75,.0,distance(uv,vec2(.5,.52))); c=mix(c,wash*(.74+.3*rad)+rad*.07+(uv.y-.5)*.06,washA);
    gl_FragColor=vec4(c*dim,1.);
  }`;
  const world = (() => {
    if (!window.THREE) return null;
    try {
      const T = THREE, R = new T.WebGLRenderer({ canvas: $('#world'), antialias: false }); R.setPixelRatio(1);
      const load = u => { const t = new T.TextureLoader().load(u); t.minFilter = T.LinearMipmapLinearFilter; t.generateMipmaps = true; return t; };
      const U = { tA: { value: load('img/bg-night.jpg') }, tB: { value: load('img/bg-aurora.jpg') }, res: { value: new T.Vector2(1, 1) }, time: { value: 0 }, mouse: { value: new T.Vector2() }, cen: { value: new T.Vector2(.5, .5) }, zoom: { value: 1 }, blur: { value: 0 }, sky: { value: 0 }, fin: { value: 0 }, wash: { value: new T.Color(0xF40009) }, washA: { value: 0 }, dim: { value: 1 }, aur: { value: 1 } };
      const sc = new T.Scene(); sc.add(new T.Mesh(new T.PlaneGeometry(2, 2), new T.ShaderMaterial({ uniforms: U, fragmentShader: FRAG, vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}' }))); const cam = new T.Camera();
      return { U, size() { R.setSize(W, H, false); U.res.value.set(W, H); }, draw() { R.render(sc, cam); } };
    } catch (e) { return null; }
  })();

  /* ---------- the sitting bear is a soft puppet: it watches the cursor, breathes and waves ---------- */
  const puppet = (() => {
    const cv = $('#bear');
    if (!window.THREE) { const im = new Image(); im.src = 'img/bear-sit.webp?v=2'; im.id = 'bear'; cv.replaceWith(im); return null; }
    try {
      const T = THREE, R = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); R.setPixelRatio(1); R.setSize(714, 868, false);
      const U = { t: { value: new T.TextureLoader().load('img/bear-sit.webp?v=2') }, head: { value: 0 }, arm: { value: 0 }, breath: { value: 0 }, blink: { value: 0 }, scarf: { value: 0 }, sway: { value: 0 } };
      const mat = new T.ShaderMaterial({ uniforms: U, blending: T.NoBlending, fragmentShader: 'uniform sampler2D t;uniform float blink;varying vec2 vUv;void main(){vec4 c=texture2D(t,vUv);float ey=max(smoothstep(.016,.006,length((vUv-vec2(.347,.925))*vec2(1.,1.25))),smoothstep(.034,.014,length((vUv-vec2(.466,.916))*vec2(1.,1.25))));c=mix(c,texture2D(t,vUv+vec2(0.,vUv.x<.4?.014:.032)),blink*ey);vec3 k=c.rgb;float l=dot(k,vec3(.3,.59,.11));k=mix(k,vec3(l),.3)*vec3(.8,.87,1.02);k*=mix(.7,1.,smoothstep(0.,.42,vUv.y));k+=vec3(.015,.035,.085)*(1.-smoothstep(0.,.32,vUv.y));k+=vec3(.05,.03,.0)*smoothstep(.55,1.,vUv.x)*l;float al=c.a*smoothstep(.012,.05,vUv.y);gl_FragColor=vec4(k*al,al);}',
        vertexShader: `uniform float head,arm,breath,scarf,sway; varying vec2 vUv;
        vec2 rot(vec2 p,vec2 c,float a){p-=c;return c+vec2(p.x*cos(a)-p.y*sin(a),p.x*sin(a)+p.y*cos(a));}
        void main(){vUv=uv; vec2 p=uv*vec2(714.,868.);
          p=rot(p,vec2(400.,20.),sway*smoothstep(80.,620.,p.y));
          float wsc=smoothstep(160.,40.,distance(p,vec2(333.,394.)))*step(p.y,512.); p=rot(p,vec2(335.,506.),scarf*wsc);
          float wh=smoothstep(290.,150.,distance(p,vec2(330.,738.)))*smoothstep(520.,610.,p.y); p=rot(p,vec2(398.,594.),head*wh);
          float wa=smoothstep(215.,95.,distance(p,vec2(80.,478.))); p=rot(p,vec2(238.,413.),arm*wa);
          float wb=smoothstep(330.,120.,distance(p,vec2(400.,348.))); p.x+=(p.x-400.)*breath*wb*.022; p.y+=breath*wb*3.;
          gl_Position=vec4((p/vec2(714.,868.)*2.-1.)*.94,0.,1.);}` });
      const sc = new T.Scene(); sc.add(new T.Mesh(new T.PlaneGeometry(2, 2, 36, 44), mat)); const cam = new T.Camera();
      return { U, draw() { R.render(sc, cam); } };
    } catch (e) { return null; }
  })();
  let headS = 0, waveT = 2.6, lookUp = 0, blinkAt = 3, blinkV = 0;

  /* ---------- snow: three depths, wind, cursor push, sparkle trail, and it settles on things ---------- */
  const cv = $('#snow'), cx = cv.getContext('2d');
  const dot = document.createElement('canvas'); dot.width = dot.height = 32;
  { const d = dot.getContext('2d'), g = d.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, '#fff'); g.addColorStop(.35, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); d.fillStyle = g; d.fillRect(0, 0, 32, 32); }
  let flakes = [], sparks = [], gust = 0;
  function mkFlake() {
    // real night snow: mostly tiny far flakes, fewer near ones, a rare soft out-of-focus flake close to the lens
    const z = Math.pow(Math.random(), 1.6), big = Math.random() < .018;
    return { x: rnd(-40, W + 40), y: rnd(0, H), z: big ? 1 : z, r: big ? rnd(9, 16) : .6 + 2.6 * z * z + rnd(0, .5), a: big ? .1 : .22 + .62 * z, ph: rnd(0, 6.28), sw: rnd(.5, 1.6), sa: rnd(6, 20), fs: rnd(.8, 1.25), tw: Math.random() < .12 ? rnd(2, 5) : 0, life: -1, vy: 0, vx: 0 };
  }
  function sizeSnow() {
    const D = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv.width = W * D; cv.height = H * D; cx.setTransform(D, 0, 0, D, 0, 0);
    const n = Math.round(clamp(W * H / 4200, 90, 360)); flakes = flakes.filter(f => f.life < 0).slice(0, n);
    while (flakes.length < n) flakes.push(mkFlake());
  }
  function loose(x, y, n, vy) { for (let i = 0; i < n; i++) { const f = mkFlake(); f.x = x + rnd(-4, 4); f.y = y; f.z = rnd(.5, 1); f.r = rnd(1.4, 3.6); f.a = .95; f.life = rnd(.7, 1.4); f.vy = rnd(10, vy); f.vx = rnd(-26, 26); flakes.push(f); } }

  // drifts: a height map along the top edge of every [data-snow] element
  const CELL = 5, drifts = $$('[data-snow]').map(el => ({ el, h: new Float32Array(1), r: null, max: el.classList.contains('hd') ? 7 : el.id === 'arena' ? 16 : 12, hover: false }));
  drifts.forEach(d => { d.el.addEventListener('pointerenter', () => { // touching a thing knocks its snow off
      if (!d.r) return; d.hover = true; for (let i = 0; i < d.h.length; i++) { if (d.h[i] > 1.5 && i % 2 === 0) loose(d.r.left + i * CELL, d.r.top - d.h[i] * .5, 1 + (d.h[i] / 5 | 0), 90); d.h[i] *= .12; } });
    d.el.addEventListener('pointerleave', () => d.hover = false); });
  function stepDrifts(dt) {
    cx.fillStyle = '#fff'; cx.shadowColor = 'rgba(70,100,150,.28)'; cx.shadowBlur = 5; cx.shadowOffsetY = 2;
    drifts.forEach(d => {
      const r = d.r = d.el.getBoundingClientRect(); if (r.bottom < 0 || r.top > H + 20 || r.width < 40) return;
      const n = Math.ceil(r.width / CELL) + 1; if (d.h.length !== n) d.h = new Float32Array(n);
      const h = d.h, rad = Math.min(30, parseFloat(getComputedStyle(d.el).borderTopLeftRadius) || 0);
      if (!d.hover) for (let k = 0; k < 3; k++) if (Math.random() < dt * 22) { const c = rnd(0, n) | 0, amt = rnd(.25, .7); for (let j = -4; j <= 4; j++) { const i = c + j; if (i >= 0 && i < n) h[i] = Math.min(d.max * (.55 + .45 * Math.sin(i * .37 + d.max) ** 2 + .25), h[i] + amt * Math.exp(-j * j / 6)); } }
      for (let i = 1; i < n - 1; i++) h[i] += ((h[i - 1] + h[i + 1]) / 2 - h[i]) * .06; // settle
      let any = false; cx.beginPath(); cx.moveTo(r.left + rad * .5, r.top + 1.5);
      for (let i = 0; i < n; i++) { const x = r.left + i * CELL, e = Math.min(1, Math.min(x - r.left, r.right - x) / (rad + 14)); if (x < r.left + rad * .5 || x > r.right - rad * .5) continue; const y = h[i] * Math.max(0, e); if (y > .6) any = true; cx.lineTo(x, r.top + 1.5 - y); }
      cx.lineTo(r.right - rad * .5, r.top + 1.5); cx.closePath(); if (any) cx.fill();
    });
    cx.shadowColor = 'transparent'; cx.shadowBlur = 0; cx.shadowOffsetY = 0;
  }
  function stepSnow(t, dt, dScroll) {
    gust = clamp(gust * Math.pow(.2, dt) + dScroll * .5, -160, 160);
    const wind = Math.sin(t * .23) * 16 + Math.sin(t * .71 + 1.3) * 9 + gust;
    cx.clearRect(0, 0, W, H);
    stepDrifts(dt);
    for (let i = flakes.length - 1; i >= 0; i--) {
      const f = flakes[i];
      if (f.life >= 0) { f.life -= dt; f.vy += 260 * dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.life <= 0) { flakes.splice(i, 1); continue; } }
      else {
        const y0 = f.y, x0 = f.x; f.y += (16 + 70 * f.z) * f.fs * dt - dScroll * f.z * .22;
        f.x += (wind * (.25 + f.z) + (Math.sin(t * f.sw + f.ph) + .4 * Math.sin(t * f.sw * 2.7 + f.ph * 3)) * f.sa * (.4 + f.z)) * dt; f.mx = f.x - x0; f.my = f.y - y0;
        const dx = f.x - px, dy = f.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 12000 && d2 > 1) { const k = (1 - d2 / 12000) * 90 * dt / Math.sqrt(d2); f.x += dx * k; f.y += dy * k; }
        if (f.z > .55 && f.r < 5) for (const d of drifts) { const r = d.r; if (r && !d.hover && y0 < r.top && f.y >= r.top && f.x > r.left + 12 && f.x < r.right - 12) { const c = (f.x - r.left) / CELL | 0; for (let j = -3; j <= 3; j++) if (d.h[c + j] !== undefined) d.h[c + j] = Math.min(d.max * 1.2, d.h[c + j] + .5 * Math.exp(-j * j / 4)); f.y = -20; f.x = rnd(-40, W + 40); break; } }
        if (f.y > H + 20) { f.y = -20; f.x = rnd(-40, W + 40); } else if (f.y < -40) f.y = H + 10;
        if (f.x > W + 50) f.x = -40; else if (f.x < -50) f.x = W + 40;
      }
      cx.globalAlpha = f.a * (f.tw ? .55 + .45 * Math.sin(t * f.tw + f.ph) : 1) * (f.life >= 0 ? clamp(f.life * 2, 0, 1) : 1);
      if (f.z > .6 && f.r < 8 && f.life < 0 && dt > 0) { const vx = f.mx / dt, vy = f.my / dt, sp = Math.hypot(vx, vy), st = 1 + Math.min(1.2, sp / 160) * f.z; // near flakes smear a little along their fall
        cx.save(); cx.translate(f.x, f.y); cx.rotate(Math.atan2(vy, vx) - Math.PI / 2); cx.drawImage(dot, -f.r, -f.r * st, f.r * 2, f.r * 2 * st); cx.restore(); }
      else cx.drawImage(dot, f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.l -= dt; if (s.l <= 0) { sparks.splice(i, 1); continue; }
      s.vx *= 1 - dt * 1.6; s.vy = s.vy * (1 - dt * 1.6) + 46 * dt; s.y += s.vy * dt; s.x += s.vx * dt; const a = clamp(s.l / s.L, 0, 1), r = s.r * (.4 + a);
      cx.globalAlpha = a;
      cx.drawImage(dot, s.x - r * .6, s.y - r * .6, r * 1.2, r * 1.2);
    }
    cx.globalAlpha = 1;
  }
  let lastSp = [0, 0];
  addEventListener('pointermove', e => {
    px = e.clientX; py = e.clientY; mx = px / W; my = py / H;
    if (!CALM && Math.hypot(px - lastSp[0], py - lastSp[1]) > 34) { lastSp = [px, py]; const L = rnd(.5, .9); sparks.push({ x: px + rnd(-8, 8), y: py + rnd(-8, 8), vx: rnd(-10, 10), vy: rnd(10, 40), r: rnd(3, 7), l: L, L, c: Math.random() < .5 ? '#fff' : '#ffe2a8' }); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => { px = py = -999; });
  const COL = ['#fff', '#ffe2a8', '#ff7a80'];
  function burst(x, y, n, v) { for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rnd(-.2, .2), sp = rnd(v * .45, v), L = rnd(.7, 1.3); sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(3, 7), l: L, L, c: COL[i % 3] }); } }
  addEventListener('pointerdown', e => { if (!CALM && !e.target.closest('a,button,.st')) burst(e.clientX, e.clientY, 18, 150); });
  let nextFw = 0;

  /* ---------- packs: the official renders, remapped onto a cylinder so the label turns with the body ---------- */
  const PACKS = [
    { n: 'Coca-Cola Original Taste', k: 'მინის ბოთლი', src: 'img/bottle-s.webp', w: 320, h: 1283, c: [244, 0, 9], s: 1 },
    { n: 'Coca-Cola Zero Sugar', k: 'ქილა', can: 1, src: 'img/can-zero.webp', w: 300, h: 584, c: [20, 20, 22], s: .84 },
    { n: 'Fanta', k: 'ქილა', can: 1, src: 'img/can-fanta.webp', w: 300, h: 568, c: [255, 122, 0], s: .84 },
    { n: 'Sprite', k: 'ქილა', can: 1, src: 'img/can-sprite.webp', w: 300, h: 567, c: [0, 140, 70], s: .84 }
  ];
  const stage = $('#stage'), dots = $('#dots'), copy = $('.show-copy');
  // one shared WebGL renderer; every can is drawn with it and copied into that can's own 2d canvas
  const GL = (() => {
    if (!window.THREE) return null;
    try {
      const T = THREE, R = new T.WebGLRenderer({ alpha: true, antialias: true }); R.setPixelRatio(1); R.setSize(560, 1000, false); R.outputEncoding = T.sRGBEncoding; R.toneMapping = T.ACESFilmicToneMapping; R.toneMappingExposure = 1.15;
      const scene = new T.Scene(), cam = new T.PerspectiveCamera(20, .56, 1, 40); cam.position.set(0, 2.5, 11.4); cam.lookAt(0, 1.86, 0);
      scene.add(new T.HemisphereLight(0xffffff, 0x404050, .55)); const k = new T.DirectionalLight(0xffffff, 1.05); k.position.set(-4, 6, 8); scene.add(k); const rim = new T.DirectionalLight(0xffffff, .5); rim.position.set(6, 2, -5); scene.add(rim);
      const es = new T.Scene(); es.background = new T.Color(0x1c1c20); // a small studio to reflect: three soft boxes
      [[5, 14, -9, 3, 6, 0xffffff], [2.4, 14, 9, 2, 5, 0xd8d8d8], [14, 5, 0, 11, 2, 0xffffff], [10, 10, 0, 0, -10, 0x555560]].forEach(([w, h, x, y, z, c]) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: c, side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 2, 0); es.add(m); });
      const env = new T.PMREMGenerator(R).fromScene(es, .04).texture;
      // 330 ml can profile, radius 1: base dome, body, shoulder, rim, lid
      const pts = [[0, .12], [.5, .07], [.7, .01], [.78, 0], [.83, .04], [.95, .24], [1, .4], [1, 3.22], [.985, 3.34], [.9, 3.52], [.84, 3.6], [.83, 3.66], [.85, 3.7], [.83, 3.73], [.79, 3.71], [.775, 3.63], [.4, 3.61], [0, 3.61]].map(p => new T.Vector2(p[0], p[1]));
      const geo = new T.LatheGeometry(pts, 96), pos = geo.attributes.position, uv = geo.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) + .25, clamp(pos.getY(i) / 3.73, .004, .996)); // v follows height, the front of the can is the middle of the print
      const lid = new T.MeshStandardMaterial({ color: 0xd9dce0, metalness: 1, roughness: .28, envMap: env });
      return { T, R, scene, cam, geo, env, lid };
    } catch (e) { return null; }
  })();
  function unwrap(im) { // front packshot -> flat print: undo the cylinder foreshortening row by row
    const w = im.naturalWidth, h = im.naturalHeight, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const s = x.getImageData(0, 0, w, h).data, L = [], Rr = []; let full = 0;
    for (let y = 0; y < h; y++) { let l = -1, r = -1; for (let i = 0; i < w; i++) if (s[(y * w + i) * 4 + 3] > 128) { if (l < 0) l = i; r = i; } L.push(l); Rr.push(r); full = Math.max(full, r - l); }
    let y0 = 0, y1 = h - 1; while (Rr[y0] - L[y0] < full * .7) y0++; while (Rr[y1] - L[y1] < full * .74) y1--;
    const TW = 1024, TH = 1024, o = document.createElement('canvas'); o.width = TW; o.height = TH; const ox = o.getContext('2d'), d = ox.createImageData(TW, TH), q = d.data, half = TW / 2;
    for (let v = 0; v < TH; v++) {
      const y = Math.round(y0 + v / (TH - 1) * (y1 - y0)), l = L[y] + 1, r = Rr[y] - 1, cc = (l + r) / 2, hw = (r - l) / 2;
      for (let u = 0; u < half; u++) {
        const th = (u / (half - 1) - .5) * Math.PI, fx = cc + Math.sin(th) * hw, x0 = clamp(fx | 0, l, r), x1 = Math.min(x0 + 1, r), k = fx - x0, i0 = (y * w + x0) * 4, i1 = (y * w + x1) * 4;
        const lift = 1 + .28 * Math.pow(Math.abs(Math.sin(th)), 5);           // the photo is darker toward its edges; the 3d light adds that back itself
        for (let ch = 0; ch < 3; ch++) { const val = Math.min(255, (s[i0 + ch] + (s[i1 + ch] - s[i0 + ch]) * k) * lift); q[(v * TW + u) * 4 + ch] = val; q[(v * TW + u + half) * 4 + ch] = val; }
        q[(v * TW + u) * 4 + 3] = q[(v * TW + u + half) * 4 + 3] = 255;
      }
    }
    ox.putImageData(d, 0, 0); return o;
  }
  function Pack(p) {
    const gl = GL && p.can, el = document.createElement('div'); el.className = 'item' + (gl ? ' gl' : ''); el.style.setProperty('--m', `url(${p.src})`);
    el.innerHTML = gl ? `<canvas width="560" height="1000" aria-label="${p.n}"></canvas><span class="sh"></span>` : `<canvas width="${p.w}" height="${p.h}" aria-label="${p.n}"></canvas><span class="frost"></span><span class="spec"></span><span class="sh"></span>`;
    stage.appendChild(el); dots.appendChild(document.createElement('i'));
    const c = $('canvas', el), x = c.getContext('2d'), im = new Image(); let src, out, L, R, drawn = 9, mesh;
    im.onload = () => {
      if (gl) { try { const T = GL.T, tex = new T.CanvasTexture(unwrap(im)); tex.encoding = T.sRGBEncoding; tex.wrapS = T.RepeatWrapping; tex.anisotropy = 8;
          mesh = new T.Mesh(GL.geo, new T.MeshStandardMaterial({ map: tex, metalness: .42, roughness: .3, envMap: GL.env, envMapIntensity: 1.05 })); mesh.visible = false; GL.scene.add(mesh); this.draw(0); } catch (e) { } return; }
      const w = p.w, h = p.h; x.drawImage(im, 0, 0, w, h);
      try { src = x.getImageData(0, 0, w, h); } catch (e) { return; }
      out = x.createImageData(w, h); L = new Int16Array(h); R = new Int16Array(h);
      for (let y = 0; y < h; y++) { let l = -1, r = -1; for (let i = 0; i < w; i++) if (src.data[(y * w + i) * 4 + 3] > 10) { if (l < 0) l = i; r = i; } L[y] = l; R[y] = r; }
      const f = document.createElement('canvas'); f.width = w; f.height = h; const fx = f.getContext('2d'); // condensation
      const g = fx.createLinearGradient(0, h, 0, h * .55); g.addColorStop(0, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(255,255,255,0)'); fx.fillStyle = g; fx.fillRect(0, 0, w, h);
      for (let i = 0; i < h * .8; i++) { const dx = rnd(0, w), dy = h * (.1 + .9 * Math.sqrt(Math.random())), r = rnd(.5, 2.6); fx.fillStyle = `rgba(255,255,255,${rnd(.16, .46)})`; fx.beginPath(); fx.ellipse(dx, dy, r, r * rnd(1, 1.5), 0, 0, 6.3); fx.fill(); fx.fillStyle = 'rgba(255,255,255,.85)'; fx.fillRect(dx - r * .3, dy - r * .5, .8, .8); }
      $('.frost', el).style.background = `url(${f.toDataURL()}) center/100% 100%`; this.draw(0);
    };
    im.src = p.src; this.el = el; this.img = im;
    this.draw = a => {
      if (gl) { if (!mesh || Math.abs(a - drawn) < .002) return; mesh.visible = true; mesh.rotation.y = a * .95; GL.R.render(GL.scene, GL.cam); mesh.visible = false; x.clearRect(0, 0, 560, 1000); x.drawImage(GL.R.domElement, 0, 0); drawn = a; return; }
      if (!src || Math.abs(a - drawn) < .004) return; const w = p.w, h = p.h, s = src.data, o = out.data, HP = Math.PI / 2;
      for (let y = 0; y < h; y++) {
        const l = L[y]; if (l < 0) continue; const r = R[y], c0 = (l + r) / 2, hw = Math.max((r - l) / 2, 1), row = y * w;
        for (let i = l; i <= r; i++) {
          const t = clamp((i - c0) / hw, -1, 1), ang = clamp(Math.asin(t) + a, -HP, HP), fx = c0 + Math.sin(ang) * hw, x0 = clamp(fx | 0, l, r), x1 = Math.min(x0 + 1, r), k = fx - x0;
          const j = (row + i) * 4, i0 = (row + x0) * 4, i1 = (row + x1) * 4, sh = 1 - .16 * Math.abs(a) * (a > 0 ? 1 - t : 1 + t);
          o[j] = (s[i0] + (s[i1] - s[i0]) * k) * sh; o[j + 1] = (s[i0 + 1] + (s[i1 + 1] - s[i0 + 1]) * k) * sh; o[j + 2] = (s[i0 + 2] + (s[i1 + 2] - s[i0 + 2]) * k) * sh; o[j + 3] = s[j + 3];
        }
      }
      x.putImageData(out, 0, 0); drawn = a;
    };
  }
  const packs = PACKS.map(p => new Pack(p));
  let spS = 0, ptr = 0, ptrS = 0, active = -1, hoverStage = false, washC = [244, 0, 9];
  stage.addEventListener('pointermove', e => { hoverStage = true; ptr = (e.clientX / W - .5) * 1.2; });
  stage.addEventListener('pointerleave', () => { hoverStage = false; ptr = 0; });
  function stepShow(t, dt, cp, vis) {
    if (vis < .01) return;
    const raw = cp * (PACKS.length - 1), fl = Math.floor(raw), fr = raw - fl, sp = fl + fr * fr * (3 - 2 * fr);
    spS += (sp - spS) * Math.min(1, dt * 7); ptrS += (ptr - ptrS) * Math.min(1, dt * 5);
    const a = Math.round(spS), i0 = clamp(Math.floor(spS), 0, PACKS.length - 1), i1 = Math.min(i0 + 1, PACKS.length - 1), k = spS - i0;
    washC = PACKS[i0].c.map((v, j) => v + (PACKS[i1].c[j] - v) * k);
    if (a !== active) { active = a; copy.classList.add('sw'); setTimeout(() => { $('#pName').textContent = PACKS[a].n; $('#pKind').textContent = PACKS[a].k; copy.classList.remove('sw'); }, 220); $$('i', dots).forEach((d, i) => d.classList.toggle('on', i === a)); }
    const spread = W < 860 ? 66 : 34;
    packs.forEach((p, i) => {
      const d = i - spS, ad = Math.abs(d), el = p.el; if (ad > 1.7) { el.style.visibility = 'hidden'; return; }
      const th = d * 1.05 + (ad < .5 ? ptrS + (hoverStage ? 0 : Math.sin(t * .6) * .2) : 0); p.draw(th);
      el.style.visibility = 'visible'; el.style.opacity = clamp(1.25 - ad * .75, 0, 1); el.style.filter = ad > .08 ? `blur(${(ad * 7).toFixed(1)}px)` : 'none'; el.style.zIndex = 10 - Math.round(ad * 4);
      el.style.transform = `translate(-50%,-50%) translate3d(${d * spread}vw,${Math.sin(t * 1.3 + i) * 6 + ad * 20}px,${-ad * 420}px) rotateY(${d * -24 + th * 10}deg) scale(${PACKS[i].s * (1 - ad * .12)})`;
      el.style.setProperty('--sx', (38 + th * 62) + '%');
    });
  }

  /* ---------- brands: a natural snow bank, and the bear walks its ridge on four moving legs ---------- */
  const bank = $('#bank'), wcv = $('#walker'), wgMain = wcv.getContext('2d'), wIn = $('#walkin'), wgIn = wIn.getContext('2d'), rig = {};
  ['body', 'ha', 'hb', 'f'].forEach(n => { rig[n] = new Image(); rig[n].src = 'img/rig-' + n + '.webp?v=2'; });
  const RIDGE = [6, 19, 35, 40, 39, 39, 31, 30, 37, 47, 49, 48, 46, 44, 45, 48, 54, 61, 69, 72, 71, 64, 56, 57, 59, 60, 60, 61, 72, 80, 85, 89], BW = 1376, BH = 486;
  const ridge = x => { const bh = bank.clientHeight, sc = Math.max(W / BW, bh / BH), u = clamp(((x - (W - BW * sc) / 2) / sc) / 43, 0, RIDGE.length - 1.001), i = Math.floor(u); return (RIDGE[i] + (RIDGE[i + 1] - RIDGE[i]) * (u - i)) * sc; };
  function drawRig(ph, dirn, wg0) {
    const wg = wg0 || wgMain; wg.setTransform(1, 0, 0, 1, 0, 0); wg.clearRect(0, 0, 760, 440); if (!rig.f.complete || !rig.body.complete) return;
    const s = 1.16, bob = Math.sin(ph * 2) * 2.5; wg.setTransform(dirn * s, 0, 0, s, dirn > 0 ? 30 : 730, 30);
    wg.save(); wg.filter = 'blur(9px)'; wg.fillStyle = 'rgba(40,70,125,.2)'; wg.beginPath(); wg.ellipse(300, 338, 270, 11, 0, 0, 6.3); wg.fill(); wg.filter = 'blur(5px)'; wg.fillStyle = 'rgba(30,55,105,.3)'; [[72, 0], [150, Math.PI], [362, .7], [392, Math.PI + .7]].forEach(([fx, o]) => { const sw = Math.sin(ph + o), up = Math.max(0, Math.cos(ph + o)); wg.globalAlpha = 1 - up * .6; wg.beginPath(); wg.ellipse(fx + sw * 38, 337, 44 - up * 10, 6, 0, 0, 6.3); wg.fill(); }); wg.restore(); // one wide soft shadow plus a darker one under each paw that follows the step and fades as the paw lifts // soft contact shadow on the snow
    const leg = (im, x, y, qx, qy, p, far) => { wg.save(); wg.translate(qx, qy + bob * .5 - Math.max(0, Math.cos(p)) * 8); wg.rotate(-Math.sin(p) * .27); wg.filter = far ? 'brightness(.9)' : 'none'; wg.drawImage(im, x - qx, y - qy); wg.restore(); };
    leg(rig.hb, 56, 178, 118, 205, ph + Math.PI, 1); leg(rig.f, 298, 178, 362, 196, ph + Math.PI + .7, 1);
    wg.drawImage(rig.body, 0, bob);
    leg(rig.ha, 0, 178, 78, 205, ph, 0); leg(rig.f, 298, 178, 362, 196, ph + .7, 0);
  }
  let wdir = 1, lastY = scrollY, tv = 0, sitK = 0;
  // sound is on by default; browsers only let it start after the first click or key press, so it is armed then and plays when the truck drives in
  let soundOn = true, snd = null, wasTruck = false; const sbtn = $('.hd-sound'); sbtn.classList.add('on'); sbtn.setAttribute('aria-pressed', true);
  snd = new Audio('audio/truck.mp3?v=1791907146'); snd.loop = true; snd.volume = 0; snd.preload = 'auto'; snd.addEventListener('error', () => sbtn.title = 'audio/truck.mp3 ვერ მოიძებნა');
  const arm = () => { if (soundOn && wasTruck && snd.paused) snd.play().catch(() => { }); };
  ['pointerdown', 'keydown', 'touchend', 'wheel'].forEach(e => addEventListener(e, arm, { passive: true }));
  window.__site = { soundOn: () => soundOn };
  $('#playbtn').addEventListener('click', () => { if (snd) snd.pause(); if (window.__play) return window.__play.open(); const sc = document.createElement('script'); sc.src = 'game.js?v=70'; document.body.appendChild(sc); });
  sbtn.addEventListener('click', () => { arm(); soundOn = !soundOn; sbtn.classList.toggle('on', soundOn); sbtn.setAttribute('aria-pressed', soundOn); });

  /* ---------- game: join seven stars into the Great Bear ---------- */
  const SP = [[110, 250], [265, 165], [400, 205], [530, 250], [575, 390], [780, 430], [800, 225]], svg = $('#stars'), NS = 'http://www.w3.org/2000/svg';
  let gi = 0, aurBoost = 0;
  const mk = (tag, at) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); return e; };
  function resetGame() {
    gi = 0; aurBoost = 0; svg.innerHTML = '';
    svg.appendChild(mk('polyline', { class: 'ghost', points: SP.concat([SP[3]]).map(p => p.join(',')).join(' ') }));
    svg.appendChild(mk('g', { id: 'lines' })); svg.appendChild(mk('line', { class: 'rb', id: 'rb' }));
    SP.forEach((p, i) => { const g = mk('g', { class: 'st' + (i ? '' : ' next') }); g.appendChild(mk('circle', { class: 'h', cx: p[0], cy: p[1], r: 26 })); g.appendChild(mk('circle', { class: 'c', cx: p[0], cy: p[1], r: i % 3 ? 5.5 : 7 })); g.appendChild(mk('circle', { cx: p[0], cy: p[1], r: 48, fill: 'transparent' }));
      const hit = () => { if (i !== gi) return; g.classList.remove('next'); g.classList.add('lit'); if (gi) line(SP[gi - 1], SP[gi]); const r = g.children[1].getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 12, 110); gi++; $('#gN').textContent = gi; if (gi === 7) { line(SP[6], SP[3]); win(); } hint(); };
      g.addEventListener('pointerenter', hit); g.addEventListener('pointerdown', hit); g.setAttribute('tabindex', 0); g.setAttribute('role', 'button'); g.setAttribute('aria-label', 'ვარსკვლავი ' + (i + 1)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hit(); } }); svg.appendChild(g); });
    $('#gN').textContent = 0; $('#gT').textContent = 'იპოვე დიდი დათვი'; $('#gP').textContent = 'შეაერთე 7 ვარსკვლავი რიგრიგობით და ცაზე დიდი დათვის თანავარსკვლავედი გამოჩნდება.'; $('#again').hidden = true; hint();
  }
  function hint() { // a quiet modern cue at the very start only: thin leader line from the first star to a small label
    let h = $('#hintg'); if (h) h.remove(); if (gi > 0) return;
    const [x, y] = SP[0]; h = mk('g', { id: 'hintg', class: 'hint' });
    h.appendChild(mk('path', { d: `M${x + 16},${y + 16} L${x + 62},${y + 62} H${x + 96}`, class: 'ha', pathLength: 1 }));
    const r = mk('rect', { x: x + 96, y: y + 40, width: 190, height: 44, rx: 22, class: 'hp' }); h.appendChild(r);
    const t = mk('text', { x: x + 120, y: y + 62, 'dominant-baseline': 'central', class: 'ht' }); t.textContent = 'დაიწყე აქედან'; h.appendChild(t);
    requestAnimationFrame(() => { const w = t.getBBox().width; if (w) r.setAttribute('width', w + 48); }); // equal padding around the label
    svg.insertBefore(h, svg.querySelector('.st'));
  }
  const line = (a, b) => $('#lines').appendChild(mk('line', { class: 'ln', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }));
  function win() {
    $('#rb').removeAttribute('x1'); hint(); $('#gT').textContent = 'დიდი დათვი'; $('#gP').textContent = 'თანავარსკვლავედი აინთო. ჩაიფიქრე საახალწლო სურვილი.'; $('#again').hidden = false; aurBoost = 1; waveT = 0;
    const r = svg.getBoundingClientRect(); for (let k = 0; k < 7; k++) setTimeout(() => burst(r.left + rnd(.1, .9) * r.width, r.top + rnd(0, .8) * r.height, 26, 180), k * 260);
  }
  svg.addEventListener('pointermove', e => { const rb = $('#rb'); if (!gi || gi > 6 || !rb) return; const m = svg.getScreenCTM().inverse(), x = e.clientX * m.a + m.e, y = e.clientY * m.d + m.f; rb.setAttribute('x1', SP[gi - 1][0]); rb.setAttribute('y1', SP[gi - 1][1]); rb.setAttribute('x2', x); rb.setAttribute('y2', y); });
  $('#again').addEventListener('click', resetGame); resetGame();

  /* ---------- greeting: the falling snow settles into the words, sparkles, and scatters under the cursor ---------- */
  const gcv = $('#greet'), gg = gcv.getContext('2d'), gim = new Image(), gpts = []; let gIn = 0;
  gim.onload = () => { const w = 350, h = 82, c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.drawImage(gim, 0, 0, w, h); const d = x.getImageData(0, 0, w, h).data, N = W < 860 ? 3000 : 6400; let tries = 0;
    while (gpts.length < N && tries++ < N * 40) { const qx = Math.random() * w, qy = Math.random() * h; if (d[((qy | 0) * w + (qx | 0)) * 4 + 3] > 150) gpts.push({ hx: qx / w, hy: qy / h, sx: qx / w + rnd(-.12, .12), sy: -rnd(.3, 2.6), r: rnd(.5, 1.7), a: rnd(.5, 1), ph: rnd(0, 6.28), tw: rnd(1, 4), dl: Math.random() * .9, ox: 0, oy: 0 }); } };
  gim.src = 'img/greet.png';
  function stepGreet(t, dt, vis) {
    gIn = vis > .3 ? Math.min(2, gIn + dt / 1.5) : Math.max(0, gIn - dt * 1.2); if (gIn <= 0 || !gpts.length) { if (gcv.width) gg.clearRect(0, 0, gcv.width, gcv.height); return; }
    const D = Math.min(devicePixelRatio || 1, 2), cw = gcv.clientWidth, chh = gcv.clientHeight; if (gcv.width !== Math.round(cw * D)) { gcv.width = Math.round(cw * D); gcv.height = Math.round(chh * D); }
    gg.setTransform(D, 0, 0, D, 0, 0); gg.clearRect(0, 0, cw, chh);
    const th = cw * 327 / 1400, oy = chh - th, r = gcv.getBoundingClientRect(), mxp = px - r.left, myp = py - r.top;
    gg.globalAlpha = .46 * clamp(gIn - .9, 0, 1) * vis; gg.drawImage(gim, 0, oy, cw, th);            // faint body so the words read at once
    gg.fillStyle = '#fff';
    for (let i = 0; i < gpts.length; i++) { const p = gpts[i], k = clamp(gIn - p.dl, 0, 1), e = 1 - Math.pow(1 - k, 3);
      const tx = p.hx * cw + Math.sin(t * .9 + p.ph) * .7, ty = oy + p.hy * th + Math.cos(t * .7 + p.ph) * .7;
      let x = lerp(p.sx * cw, tx, e) + Math.sin(t * 1.5 + p.ph) * (1 - e) * 16, y = lerp(oy + p.sy * th, ty, e);
      const dx = x - mxp, dy = y - myp, d2 = dx * dx + dy * dy; if (d2 < 4900 && d2 > 1) { const f = (1 - d2 / 4900) * 5; p.ox += dx / Math.sqrt(d2) * f; p.oy += dy / Math.sqrt(d2) * f; }
      p.ox *= .9; p.oy *= .9; x += p.ox; y += p.oy;
      gg.globalAlpha = p.a * (.55 + .45 * Math.sin(t * p.tw + p.ph)) * vis * Math.min(1, k * 3); gg.drawImage(dot, x - p.r * 1.7, y - p.r * 1.7, p.r * 3.4, p.r * 3.4); }
    gg.globalAlpha = 1;
  }

  /* ---------- timeline: scroll position -> chapter T (0 hero, 1 products, 2 brands, 3 game, 4 new year) ---------- */
  const SEC = ['hero', 'show', 'brands', 'game', 'truck', 'finale'].map(id => $('#' + id)), HOLD = [.45, .78, .5, .6, .82, 1];
  const K = [{ z: 1, cx: .5, cy: .5, bl: 0, wa: 0, sk: 0, fi: 0, di: 1 }, { z: 1.5, cx: .46, cy: .36, bl: 0, wa: 1, sk: 0, fi: 0, di: .95 }, { z: 1.16, cx: .5, cy: .6, bl: 1.2, wa: 0, sk: 0, fi: 0, di: .85 }, { z: 1, cx: .5, cy: .8, bl: 0, wa: 0, sk: 1, fi: 0, di: 1 }, { z: 1.22, cx: .5, cy: .56, bl: 1.6, wa: 0, sk: 0, fi: 0, di: .78 }, { z: 1, cx: .5, cy: .5, bl: 0, wa: 0, sk: 0, fi: 1, di: 1 }];
  const L = { play: $('#playui'), hero: $('#heroui'), show: $('#showui'), game: $('#gameui'), fin: $('#finui'), truck: $('#truckui') }, truck = $('#lorry'), openS = $('#open'), duo = $('#duo'), dbottle = $('.duo-bottle'), hill = $('#hill'), scene = $('.scene');
  const setL = (el, o, y) => { el.style.opacity = o; el.style.transform = `translateY(${y}px)`; el.classList.toggle('live', o > .6); };

  function onResize() { sizeSnow(); if (world) world.size(); }
  addEventListener('resize', onResize); onResize();
  let t0 = performance.now();
  function frame(now) {
    if (window.__playing) { t0 = now; requestAnimationFrame(frame); return; } // the game owns the GPU while it runs
    const dt = Math.min(.05, (now - t0) / 1000), t = now / 1000; t0 = now;
    const y = scrollY, dS = y - scrollY0; scrollY0 = y; if (Math.abs(y - lastY) > 2) { wdir = y > lastY ? 1 : -1; lastY = y; }
    let T = 0, cp = 0, pb = 0, pt = 0, p4 = 0;
    SEC.forEach((s, i) => { const p = clamp((y - s.offsetTop) / s.offsetHeight, 0, 1); if (i === 1) cp = clamp(p / .74, 0, 1); if (i === 2) pb = clamp((y - s.offsetTop + H * .6) / (s.offsetHeight + H * .3), 0, 1); if (i === 4) p4 = p; if (i === 4) pt = clamp((y - s.offsetTop + H * .7) / (s.offsetHeight * .55 + H * .7), 0, 1); if (p > 0) T = i + ss(HOLD[i], 1, p); }); T = Math.min(T, 5);
    const i0 = Math.min(4, Math.floor(T)), k = T - i0, A = K[i0], B = K[i0 + 1], mix = n => lerp(A[n], B[n], k);
    if (world) { const U = world.U; U.time.value = t;  U.cen.value.set(mix('cx'), mix('cy')); U.zoom.value = mix('z'); U.blur.value = mix('bl'); U.washA.value = mix('wa'); U.sky.value = mix('sk'); U.fin.value = mix('fi'); U.dim.value = mix('di'); U.wash.value.setRGB(washC[0] / 255, washC[1] / 255, washC[2] / 255); U.aur.value += ((1 + aurBoost * 1.6) - U.aur.value) * dt * 2; world.draw(); }
    // layers
    const p0 = clamp(y / openS.offsetHeight, 0, 1), o0 = 1 - ss(.6, .92, p0), hin = ss(.62, .96, p0); // the site opens with the truck; the hero arrives after it
    const oh = (1 - ss(.12, .55, T)) * hin, os = ss(.55, .98, T) * (1 - ss(1.04, 1.5, T)), og = ss(2.7, 3, T) * (1 - ss(3.25, 3.7, T)), ot = ss(3.6, 4, T) * (1 - ss(4.5, 4.9, T)), of = ss(4.7, 5, T);
    setL(L.hero, oh, -(1 - oh) * 60); setL(L.show, os, 0); setL(L.game, og, (1 - og) * 30); setL(L.fin, of, 0); setL(L.truck, o0, 0); setL(L.play, ot, (1 - ot) * 30); stepGreet(t, dt, of);
    // the truck drives in by itself when its chapter opens: eases to a stop, the cab dips as it brakes, rims turn, snow sprays from the wheels
    tv = o0 > .45 ? Math.min(1.4, tv + dt / 10) : o0 < .03 ? 0 : tv;      // about ten seconds from the edge to its place, no shaking
    if (o0 > .01) { const tw = truck.clientWidth, u = Math.min(1, tv), e = u < .72 ? u * 1.18 : .8496 + (1 - Math.pow(1 - (u - .72) / .28, 2)) * .1504, out = clamp((p0 - .1) / .5, 0, 1), x = lerp(-tw * 1.05, (W - tw) * .42, e) + out * out * (W - (W - tw) * .42 + 30), settle = tv > 1 ? Math.sin((tv - 1) * 60) * Math.exp(-(tv - 1) * 30) * 1.4 : 0;
      truck.style.transform = `translate(${x}px,${settle}px)`; truck.style.setProperty('--rot', (x / (tw * 44 / 1292)) + 'rad'); truck.style.setProperty('--spd', clamp(Math.abs(x - (truck._x ?? x)) / Math.max(dt, .001) / 55, 0, 1).toFixed(3)); truck._x = x;
      if (!CALM && u > .03 && u < .97 && Math.random() < .14) loose(x + tw * rnd(.15, .95), H * .9, 1, 50); }
    // truck music, only after the visitor switched sound on
    if (snd) { const inT = o0 > .05; if (inT && !wasTruck) { try { snd.currentTime = 0; } catch (e) { } } wasTruck = inT; const want = soundOn && inT ? .8 : 0; snd.volume = clamp(snd.volume + (want - snd.volume) * Math.min(1, dt * (want ? 4 : 1.5)), 0, 1); if (want && snd.paused) snd.play().catch(() => { }); else if (!want && snd.volume < .02 && !snd.paused) snd.pause(); }
    const bin = ss(1.3, 2, T), bout = ss(2.2, 2.95, T); bank.style.transform = `translateY(${((1 - bin) + bout) * 104}%)`; bank.style.visibility = bin > .02 && bout < .98 ? 'visible' : 'hidden'; bank.classList.toggle('live', bin > .8 && bout < .2);
    // game entrance, driven by the scroll exactly like the walk across the brands screen but mirrored: the bear that left to the right
    // comes back in from the right as you keep scrolling, same size, same shadows, same steps; when it reaches its spot it sits down
    const gS = SEC[3], we = wIn.clientWidth, spot = W * (W < 860 ? .6 : .69), wq = clamp((y - (gS.offsetTop - H * .95)) / (H * 1.05), 0, 1);
    sitK = clamp(sitK + (wq > .995 ? dt : -dt) / .8, 0, 1); const se = sitK * sitK * (3 - 2 * sitK);
    const wx = lerp(W + 10, spot - we / 2, wq), showW = wq > 0 && T < 3.6 && se < 1;
    wIn.style.opacity = showW ? Math.min(1, wq * 10) * (1 - se) * (1 - ss(3.25, 3.6, T)) : 0;
    if (showW) { wIn.style.transformOrigin = '70% 100%'; wIn.style.transform = `translate(${wx}px,${se * 8}px) rotate(${se * -9}deg) scale(1,${1 - se * .1})`; drawRig(wx / (we / 380 * 89) * 6.283, -wdir, wgIn); }
    const ogd = se * og;
    const od = Math.max((1 - ss(.3, .8, T)) * hin, ogd); duo.style.opacity = od; { const R = W - duo.offsetLeft - duo.offsetWidth, bw = $('.duo-bear').clientWidth, tx = T > 2 ? spot - (W - R - bw * .62 / 2) : 0; duo.style.transform = `translate(${tx}px,${T > 2 ? -H * .025 + (1 - se) * 16 : 0}px) scale(${T > 2 ? .62 : 1 - .1 * ss(0, .8, T)})`; } $('.mound').style.opacity = T > 2 ? 0 : 1; dbottle.style.opacity = T > 2 ? 0 : 1;
    hill.style.opacity = og; scene.style.setProperty('--scrim', Math.max(oh, og * .7, ot * .6, of * .8));
    // bear puppet
    if (puppet && od > .01) { lookUp += ((T > 2.5 ? 1 : 0) - lookUp) * dt * 3; waveT += dt; if (waveT > 6.5 && T < 1) waveT = 0;
      const target = lerp((my - .55) * .42 + (mx - .7) * .12, -.24, lookUp) + Math.sin(t * .7) * .03; headS += (target - headS) * Math.min(1, dt * 4);
      puppet.U.head.value = headS; puppet.U.arm.value = waveT < 2.4 ? Math.sin(waveT * 9) * .2 * Math.sin(waveT / 2.4 * Math.PI) : Math.sin(t * .9) * .03 + (mx - .5) * -.05; puppet.U.breath.value = Math.sin(t * 1.35) * 1.5;
      if (t > blinkAt) blinkAt = t + rnd(2.4, 6) + (Math.random() < .25 ? -2.1 : 0);                      // blinks, sometimes twice
      blinkV = clamp(1 - Math.abs(t - (blinkAt - .1)) / .1, 0, 1) > 0 ? clamp(1 - Math.abs((blinkAt - t) - .1) / .1, 0, 1) : 0; puppet.U.blink.value = blinkV;
      puppet.U.scarf.value = Math.sin(t * 1.1) * .045 + Math.sin(t * 2.7 + 1) * .018 + headS * .25; puppet.U.sway.value = Math.sin(t * .45) * .012 + Math.sin(t * .2 + 2) * .006; puppet.draw(); }
    // walking bear on the ridge
    if (bin > .05 && bout < .98) { const wEl = wcv.clientWidth, x = lerp(-wEl, W, pb), xc = x + wEl / 2, yv = ridge(xc), sl = (ridge(xc + 40) - ridge(xc - 40)) / 80;
      wcv.style.transform = `translate(${x}px,${yv - wcv.clientHeight * .93}px) rotate(${Math.atan(sl) * (wdir > 0 ? 1 : 1) * .6}rad)`; drawRig(x / (wEl / 380 * 89) * 6.283, wdir); }
    if (!CALM && of > .7 && t > nextFw) { nextFw = t + rnd(.7, 1.6); burst(rnd(W * .12, W * .88), rnd(.1, .45) * H, 26, 170); }
    stepSnow(t, dt, dS); stepShow(t, dt, cp, os);
    requestAnimationFrame(frame);
  }
  { const q = new URLSearchParams(location.search), el = q.get('at') && $('#' + q.get('at')); // ?at=id&k=0.5 jumps there, for screenshots
    if (el) { document.documentElement.style.scrollBehavior = 'auto'; setTimeout(() => scrollTo(0, el.offsetTop + el.offsetHeight * (+q.get('k') || 0)), 60); } }
  requestAnimationFrame(frame);
})();
