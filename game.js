/* "გაანათე სოფელი": drive the Coca-Cola holiday truck through a snowy Georgian village at night.
   Every house is dark until the truck stops by with a gift; then its windows warm up and the chimney smokes.
   Loaded on demand from the truck chapter; three.js r128 is already on the page. */
(() => {
  const T = THREE, $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, rnd = (a, b) => a + Math.random() * (b - a);
  const root = $('#play'), cv = $('#playcv'), hud = $('#playhud'), CALM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R = new T.WebGLRenderer({ canvas: cv, antialias: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  R.outputEncoding = T.sRGBEncoding;
  const scene = new T.Scene(), FOG = 0x0b1736; scene.background = new T.Color(FOG); scene.fog = new T.Fog(FOG, 26, 120);
  const cam = new T.PerspectiveCamera(55, 1, .1, 400);

  // ---------- sky: deep blue dome, stars, a faint aurora band and moonlit peaks on the horizon ----------
  { const c = document.createElement('canvas'); c.width = 16; c.height = 256; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#02040c'); g.addColorStop(.45, '#071232'); g.addColorStop(.62, '#13285a'); g.addColorStop(1, '#0a1530'); x.fillStyle = g; x.fillRect(0, 0, 16, 256);
    const sky = new T.Mesh(new T.SphereGeometry(300, 32, 16), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c), side: T.BackSide, fog: false })); scene.add(sky);
    const sp = new Float32Array(1400 * 3); for (let i = 0; i < 1400; i++) { const a = rnd(0, 6.283), e = rnd(.08, 1.45), r = 280; sp.set([Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r], i * 3); }
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
    scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xdfe8ff, size: 1.1, sizeAttenuation: false, fog: false, transparent: true, opacity: .85 })));
    const ac = document.createElement('canvas'); ac.width = 512; ac.height = 64; const ax = ac.getContext('2d');
    for (let i = 0; i < 512; i += 2) { const h = 20 + Math.sin(i * .02) * 10 + Math.sin(i * .07) * 4; const gg = ax.createLinearGradient(0, 64, 0, 64 - h * 1.6); gg.addColorStop(0, 'rgba(90,255,200,.0)'); gg.addColorStop(.3, 'rgba(90,255,200,.35)'); gg.addColorStop(1, 'rgba(120,140,255,0)'); ax.fillStyle = gg; ax.fillRect(i, 0, 2, 64); }
    const aur = new T.Mesh(new T.CylinderGeometry(250, 250, 60, 64, 1, true, 3.6, 2.4), new T.MeshBasicMaterial({ map: new T.CanvasTexture(ac), transparent: true, side: T.BackSide, fog: false, blending: T.AdditiveBlending, depthWrite: false }));
    aur.position.y = 85; scene.add(aur);
    const pk = new T.MeshBasicMaterial({ color: 0x3a4c78, fog: false }), pkd = new T.MeshBasicMaterial({ color: 0x24335a, fog: false });
    for (let i = 0; i < 26; i++) { const a = i / 26 * 6.283 + rnd(-.1, .1), h = rnd(40, 95), r = rnd(200, 235), m = new T.Mesh(new T.ConeGeometry(h * rnd(.7, 1.1), h, 5), i % 3 ? pk : pkd); m.position.set(Math.cos(a) * r, h / 2 - 12, Math.sin(a) * r); m.rotation.y = rnd(0, 3); scene.add(m); } }

  scene.add(new T.HemisphereLight(0x4a64a8, 0x0a0f22, .55));
  const moon = new T.DirectionalLight(0x9fb6ff, .32); moon.position.set(-60, 90, -40); scene.add(moon);

  // ---------- ground and the road loop through the village ----------
  const ground = new T.Mesh(new T.PlaneGeometry(520, 520, 90, 90), new T.MeshLambertMaterial({ color: 0x9fb2d6 }));
  { const p = ground.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, (Math.sin(p.getX(i) * .07) + Math.cos(p.getY(i) * .05)) * .35 + rnd(0, .12)); ground.geometry.computeVertexNormals(); }
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 62 + Math.sin(a * 3) * 13 + Math.cos(a * 2) * 6; pts.push(new T.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  const road = new T.CatmullRomCurve3(pts, true, 'centripetal'), RS = road.getSpacedPoints(600);
  { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#7f90b3'; x.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${rnd(.05, .3)})`; x.fillRect(rnd(0, 64), rnd(0, 256), 1, rnd(1, 4)); }
    for (const tx of [17, 46]) { x.fillStyle = 'rgba(70,86,118,.38)'; x.fillRect(tx - 4, 0, 8, 256); }
    x.fillStyle = 'rgba(255,255,255,.75)'; x.fillRect(0, 0, 3, 256); x.fillRect(61, 0, 3, 256);
    const tex = new T.CanvasTexture(c); tex.wrapT = T.RepeatWrapping;
    const pos = [], uv = [], idx = []; let L = 0;
    for (let i = 0; i <= RS.length; i++) { const p = RS[i % RS.length], q = RS[(i + 1) % RS.length], d = q.clone().sub(p).normalize(), n = new T.Vector3(-d.z, 0, d.x).multiplyScalar(4);
      if (i) L += p.distanceTo(RS[(i - 1) % RS.length]); pos.push(p.x + n.x, .06, p.z + n.z, p.x - n.x, .06, p.z - n.z); uv.push(0, L / 9, 1, L / 9); if (i) idx.push(i * 2 - 2, i * 2 - 1, i * 2, i * 2 - 1, i * 2 + 1, i * 2); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    scene.add(new T.Mesh(g, new T.MeshLambertMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -2 }))); }
  const roadDist = (x, z) => { let m = 1e9; for (let i = 0; i < RS.length; i += 3) { const d = (RS[i].x - x) ** 2 + (RS[i].z - z) ** 2; if (d < m) m = d; } return Math.sqrt(m); };

  // ---------- houses: dark until the gift arrives ----------
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,200,120,1)'); g.addColorStop(.35, 'rgba(255,150,60,.45)'); g.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const smokeTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(220,228,245,.55)'); g.addColorStop(1, 'rgba(220,228,245,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const wood = [0x6b4a33, 0x5a3e2c, 0x7a5638, 0x4f3a2e], snowM = new T.MeshLambertMaterial({ color: 0xc4d2ee }), stoneM = new T.MeshLambertMaterial({ color: 0x59606e });
  const houses = [], NH = 8;
  for (let k = 0; k < NH; k++) {
    const i = Math.floor((k + .35) / NH * RS.length), p = RS[i], q = RS[(i + 2) % RS.length], d = q.clone().sub(p).normalize(), side = k % 2 ? 1 : -1, n = new T.Vector3(-d.z, 0, d.x).multiplyScalar(side);
    const h = new T.Group(), w = rnd(6, 8), dp = rnd(5.5, 7), ht = rnd(3.2, 4.2);
    h.position.copy(p).addScaledVector(n, 11); h.lookAt(p.x, 0, p.z);
    const walls = new T.Mesh(new T.BoxGeometry(w, ht, dp), new T.MeshLambertMaterial({ color: wood[k % 4] })); walls.position.y = ht / 2; h.add(walls);
    const roof = new T.Mesh(new T.CylinderGeometry(.01, w * .78, 2.6, 4, 1), snowM); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, dp / w * 1.05); roof.position.y = ht + 1.25; h.add(roof);
    const ch = new T.Mesh(new T.BoxGeometry(.8, 2, .8), stoneM); ch.position.set(w * .25, ht + 1.6, -dp * .15); h.add(ch);
    const winM = new T.MeshBasicMaterial({ color: 0x141d33 }), wins = [];
    for (const [x, y] of [[-w * .26, ht * .55], [w * .26, ht * .55]]) { const m = new T.Mesh(new T.PlaneGeometry(1.1, 1.1), winM); m.position.set(x, y, dp / 2 + .02); h.add(m); wins.push(m); }
    const door = new T.Mesh(new T.PlaneGeometry(1.1, 2), new T.MeshLambertMaterial({ color: 0x2b1d14 })); door.position.set(0, 1, dp / 2 + .02); h.add(door);
    const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffb066, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })); glow.scale.set(w * 1.6, ht * 1.4, 1); glow.position.set(0, ht * .55, dp / 2 + .6); h.add(glow);
    // the gift beacon: a soft red column and a slowly turning ring over the doorstep
    const bea = new T.Group(); bea.position.set(0, 0, dp / 2 + 3.2); h.add(bea);
    const col = new T.Mesh(new T.CylinderGeometry(.9, .9, 26, 24, 1, true), new T.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: .16, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); col.position.y = 13; bea.add(col);
    const ring = new T.Mesh(new T.TorusGeometry(1.6, .09, 8, 48), new T.MeshBasicMaterial({ color: 0xff3b30 })); ring.rotation.x = Math.PI / 2; ring.position.y = .25; bea.add(ring);
    const smoke = []; for (let s = 0; s < 7; s++) { const m = new T.Sprite(new T.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false })); m.position.copy(ch.position); h.add(m); smoke.push({ m, t: s / 7 }); }
    h.updateMatrixWorld(true); scene.add(h); houses.push({ h, wins, winM, glow, bea, ring, col, smoke, ch, lit: 0, done: false, door: h.localToWorld(new T.Vector3(0, 0, dp / 2 + 3.2)) });
  }
  // a tall tree in the square that lights up at the end
  const fir = new T.Group(); fir.position.set(0, 0, 0); scene.add(fir);
  { const g = new T.MeshLambertMaterial({ color: 0x1d4a3a }); for (let i = 0; i < 4; i++) { const c = new T.Mesh(new T.ConeGeometry(5.4 - i * 1.15, 4.6, 9), g); c.position.y = 3 + i * 2.6; fir.add(c); const s = new T.Mesh(new T.ConeGeometry(5.2 - i * 1.15, 1.2, 9), snowM); s.position.y = 4.4 + i * 2.6; fir.add(s); } }
  const bulbs = new T.InstancedMesh(new T.SphereGeometry(.16, 6, 4), new T.MeshBasicMaterial({ color: 0xffffff }), 90); fir.add(bulbs);
  { const m = new T.Matrix4(); for (let i = 0; i < 90; i++) { const y = rnd(1.2, 12), r = (13.5 - y) * .4 + .3, a = rnd(0, 6.283); m.makeTranslation(Math.cos(a) * r, y, Math.sin(a) * r); bulbs.setMatrixAt(i, m); bulbs.setColorAt(i, new T.Color(0x222222)); } }
  const star = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffe2a0, transparent: true, opacity: .2, blending: T.AdditiveBlending, depthWrite: false })); star.position.y = 14.2; star.scale.set(4, 4, 1); fir.add(star);

  // ---------- pines everywhere else ----------
  { const N = 320, trunk = new T.InstancedMesh(new T.CylinderGeometry(.18, .25, 1.4, 5), new T.MeshLambertMaterial({ color: 0x3b2a20 }), N), crown = new T.InstancedMesh(new T.ConeGeometry(1, 1, 7), new T.MeshLambertMaterial({ color: 0x10261f }), N * 3), cap = new T.InstancedMesh(new T.ConeGeometry(1, 1, 7), snowM, N * 3);
    const m = new T.Matrix4(), q = new T.Quaternion(), s = new T.Vector3(); let n = 0;
    for (let tries = 0; n < N && tries < 5000; tries++) { const a = rnd(0, 6.283), r = rnd(14, 190), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (roadDist(x, z) < 7.5 || houses.some(o => o.h.position.distanceTo(new T.Vector3(x, 0, z)) < 9) || Math.hypot(x, z) < 9) continue;
      const k = rnd(.8, 1.7); m.compose(new T.Vector3(x, .7 * k, z), q, s.set(k, k, k)); trunk.setMatrixAt(n, m);
      for (let j = 0; j < 3; j++) { const rr = (2.3 - j * .6) * k, hh = 2.4 * k, y = (1.6 + j * 1.5 + 1.2) * k; m.compose(new T.Vector3(x, y, z), q, s.set(rr, hh, rr)); crown.setMatrixAt(n * 3 + j, m); m.compose(new T.Vector3(x, y + hh * .32, z), q, s.set(rr * .82, hh * .4, rr * .82)); cap.setMatrixAt(n * 3 + j, m); }
      n++; }
    trunk.count = n; crown.count = cap.count = n * 3; scene.add(trunk, crown, cap); }

  // ---------- the truck: red trailer with the white script, chrome cab, warm fairy lights ----------
  const truck = new T.Group(); scene.add(truck);
  const red = new T.MeshLambertMaterial({ color: 0xd8000b }), chrome = new T.MeshPhongMaterial({ color: 0xc9d3e0, shininess: 90, specular: 0xffffff }), dark = new T.MeshLambertMaterial({ color: 0x15171c });
  const sideC = document.createElement('canvas'); sideC.width = 1024; sideC.height = 320; const sx = sideC.getContext('2d');
  { const g = sx.createLinearGradient(0, 0, 0, 320); g.addColorStop(0, '#ff1a22'); g.addColorStop(1, '#b30008'); sx.fillStyle = g; sx.fillRect(0, 0, 1024, 320); }
  const sideTex = new T.CanvasTexture(sideC); sideTex.encoding = T.sRGBEncoding;
  { const lg = new Image(); lg.onload = () => { const w = 640, h = w * lg.height / lg.width; sx.drawImage(lg, 512 - w / 2, 160 - h / 2, w, h); sideTex.needsUpdate = true; }; lg.src = 'img/logo-white.png'; }
  const sideMat = new T.MeshLambertMaterial({ map: sideTex }), sideMatR = sideMat.clone(); sideMatR.map = sideTex.clone(); sideMatR.map.wrapS = T.RepeatWrapping; sideMatR.map.repeat.x = -1; sideMatR.map.offset.x = 1; sideMatR.map.needsUpdate = true;
  const trailer = new T.Mesh(new T.BoxGeometry(2.6, 3, 9), [sideMatR, sideMat, red, red, red, red]); trailer.position.set(0, 2.45, -2.2); truck.add(trailer);
  const roofSnow = new T.Mesh(new T.BoxGeometry(2.62, .12, 9.02), snowM); roofSnow.position.set(0, 4.0, -2.2); truck.add(roofSnow);
  const cab = new T.Mesh(new T.BoxGeometry(2.5, 2.2, 2.2), red); cab.position.set(0, 2.1, 3.6); truck.add(cab);
  const hood = new T.Mesh(new T.BoxGeometry(2.3, 1.2, 1.9), red); hood.position.set(0, 1.5, 5.4); truck.add(hood);
  const grill = new T.Mesh(new T.BoxGeometry(1.6, 1, .1), chrome); grill.position.set(0, 1.5, 6.37); truck.add(grill);
  const glass = new T.Mesh(new T.BoxGeometry(2.3, .9, .05), new T.MeshPhongMaterial({ color: 0x0c1830, shininess: 120, specular: 0x8899bb })); glass.position.set(0, 2.65, 4.72); truck.add(glass);
  for (const s of [-1, 1]) { const st = new T.Mesh(new T.CylinderGeometry(.12, .12, 2.4, 10), chrome); st.position.set(s * 1.05, 3.4, 2.4); truck.add(st); }
  const wheels = []; for (const z of [5.2, 2.6, -4.6, -5.9]) for (const s of [-1, 1]) { const w = new T.Mesh(new T.CylinderGeometry(.62, .62, .5, 16), dark); w.rotation.z = Math.PI / 2; w.position.set(s * 1.25, .62, z); truck.add(w); wheels.push(w); }
  const heads = []; for (const s of [-.8, .8]) { const l = new T.Mesh(new T.CircleGeometry(.2, 12), new T.MeshBasicMaterial({ color: 0xfff4d8 })); l.position.set(s, 1.35, 6.43); truck.add(l); heads.push(l); }
  const beam = new T.SpotLight(0xfff0d0, 3.2, 70, .5, .55, 1.1); beam.position.set(0, 1.6, 6.2); beam.target.position.set(0, 0, 22); truck.add(beam, beam.target);
  const cabin = new T.PointLight(0xffa860, 1.6, 18, 2); cabin.position.set(0, 4.8, -2); truck.add(cabin);
  { const cone = new T.Mesh(new T.ConeGeometry(4.2, 18, 24, 1, true), new T.MeshBasicMaterial({ color: 0xfff1cf, transparent: true, opacity: .07, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); cone.rotation.x = -Math.PI / 2; cone.position.set(0, 1.2, 15.4); truck.add(cone);
    for (const s of [-.8, .8]) { const f = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xfff6e0, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); f.scale.set(2.2, 2.2, 1); f.position.set(s, 1.35, 6.5); truck.add(f); }
    const halo = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xff9a50, transparent: true, opacity: .28, blending: T.AdditiveBlending, depthWrite: false })); halo.scale.set(16, 9, 1); halo.position.set(0, 2.6, -2.2); truck.add(halo); }
  const NB = 96, fairy = new T.InstancedMesh(new T.SphereGeometry(.07, 6, 4), new T.MeshBasicMaterial({ color: 0xffffff }), NB); truck.add(fairy);
  { const m = new T.Matrix4(); let i = 0; for (const s of [-1.31, 1.31]) for (const y of [.95, 3.95]) for (let k = 0; k < 24; k++, i++) { m.makeTranslation(s, y, -6.6 + k * (8.8 / 23)); fairy.setMatrixAt(i, m); } }
  const fcol = new T.Color();

  // ---------- falling snow around the camera ----------
  const NS = CALM ? 600 : 2600, sp = new Float32Array(NS * 3); for (let i = 0; i < NS; i++) sp.set([rnd(-60, 60), rnd(0, 40), rnd(-60, 60)], i * 3);
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
  const snow = new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: .16, transparent: true, opacity: .85, depthWrite: false })); scene.add(snow);

  // ---------- gifts that fly from the trailer to the doorstep ----------
  const giftM = [red, new T.MeshLambertMaterial({ color: 0xffffff })], flying = [];
  function gift(to, house) { const g = new T.Group(); const b = new T.Mesh(new T.BoxGeometry(.9, .7, .9), giftM[0]); g.add(b); for (const r of [[.92, .72, .16], [.16, .72, .92]]) { const s = new T.Mesh(new T.BoxGeometry(...r), giftM[1]); g.add(s); } g.position.copy(truck.localToWorld(new T.Vector3(0, 4.3, -2))); scene.add(g); flying.push({ g, a: g.position.clone(), b: to.clone().setY(.35), t: 0, house }); }

  // ---------- state, input ----------
  const S = { x: RS[0].x, z: RS[0].z, yaw: 0, v: 0, steer: 0, dist: 0, done: 0, end: 0, on: false };
  { const d = RS[3].clone().sub(RS[0]); S.yaw = Math.atan2(d.x, d.z); }
  const keys = {}, touch = { x: 0, y: 0, on: false };
  addEventListener('keydown', e => { if (!S.on) return; keys[e.key.toLowerCase()] = true; if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) e.preventDefault(); if (e.key === 'Escape') close(); });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  const stick = $('#pstick'), knob = $('#pknob');
  stick.addEventListener('pointerdown', e => { touch.on = true; try { stick.setPointerCapture(e.pointerId); } catch (_) { } move(e); });
  stick.addEventListener('pointermove', e => touch.on && move(e));
  const up = () => { touch.on = false; touch.x = touch.y = 0; knob.style.transform = ''; }; stick.addEventListener('pointerup', up); stick.addEventListener('pointercancel', up);
  function move(e) { const r = stick.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), m = Math.min(1, Math.hypot(dx, dy) / 44), a = Math.atan2(dy, dx); touch.x = Math.cos(a) * m; touch.y = -Math.sin(a) * m; knob.style.transform = `translate(${Math.cos(a) * m * 34}px,${Math.sin(a) * m * 34}px)`; }

  const msg = $('#pmsg'), cnt = $('#pcnt'), arrow = $('#parrow'), fin = $('#pfin');
  const music = new Audio('audio/truck.mp3'); music.loop = true; music.volume = .7;
  function setCount() { cnt.textContent = `${S.done} / ${NH}`; }
  function open() { root.hidden = false; document.documentElement.classList.add('playing'); S.on = true; size(); setCount();  try { (root.requestFullscreen || (() => { })).call(root).catch(() => { }); } catch (_) { } if (window.__site && window.__site.soundOn()) music.play().catch(() => { }); window.__playing = true; last = performance.now(); requestAnimationFrame(loop); }
  function close() { S.on = false; root.hidden = true; document.documentElement.classList.remove('playing'); music.pause(); window.__playing = false; if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); }
  function restart() { houses.forEach(o => { o.done = false; o.lit = 0; o.bea.visible = true; }); S.done = 0; S.end = 0; fin.hidden = true; setCount();  }
  $('#pclose').addEventListener('click', close); $('#pagain').addEventListener('click', restart); $('#pexit').addEventListener('click', close);
  let lw = 0, lh = 0; function size() { const w = cv.clientWidth || root.clientWidth, h = cv.clientHeight || root.clientHeight; lw = w; lh = h; R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  addEventListener('resize', () => S.on && size());

  // ---------- the loop ----------
  let last = 0, tt = 0; const camPos = new T.Vector3(), camLook = new T.Vector3(), tmp = new T.Vector3();
  function loop(now) {
    if (!S.on) return; if (cv.clientWidth !== lw || cv.clientHeight !== lh) size(); const dt = Math.min(.05, (now - last) / 1000); last = now; tt += dt;
    const thr = (keys.arrowup || keys.w ? 1 : 0) - (keys.arrowdown || keys.s ? 1 : 0) + touch.y, st = (keys.arrowleft || keys.a ? 1 : 0) - (keys.arrowright || keys.d ? 1 : 0) - touch.x;
    const off = roadDist(S.x, S.z) > 4.6, MAX = off ? 9 : 19;
    S.v += clamp(thr, -1, 1) * (thr * S.v < 0 ? 26 : 9) * dt; if (!thr) S.v *= Math.pow(.35, dt); S.v = clamp(S.v, -6, MAX); if (off) S.v *= Math.pow(.6, dt);
    S.steer = lerp(S.steer, clamp(st, -1, 1), Math.min(1, dt * 6)); S.yaw += S.steer * dt * 1.25 * clamp(S.v / 6, -1, 1);
    let nx = S.x + Math.sin(S.yaw) * S.v * dt, nz = S.z + Math.cos(S.yaw) * S.v * dt;
    for (const o of houses) { const p = o.h.position, d = Math.hypot(nx - p.x, nz - p.z); if (d < 6.4) { nx = p.x + (nx - p.x) / d * 6.4; nz = p.z + (nz - p.z) / d * 6.4; S.v *= .7; } }
    { const d = Math.hypot(nx, nz); if (d < 7) { nx = nx / d * 7; nz = nz / d * 7; S.v *= .7; } if (d > 180) { nx = nx / d * 180; nz = nz / d * 180; } }
    S.x = nx; S.z = nz; S.dist += S.v * dt;
    truck.position.set(S.x, 0, S.z); truck.rotation.set(0, S.yaw, 0); truck.rotation.z = -S.steer * clamp(S.v / 19, 0, 1) * .03;
    wheels.forEach((w, i) => { w.rotation.x = S.dist / .62; if (i < 2) w.rotation.y = S.steer * .4; });
    for (let i = 0; i < NB; i++) { const ph = Math.sin(tt * 3 + i * 1.7) * .5 + .5; fcol.setRGB(1, .72 + ph * .2, .35 + ph * .25).multiplyScalar(.6 + ph * .6); fairy.setColorAt(i, fcol); } fairy.instanceColor.needsUpdate = true;
    // deliver: any dark house whose doorstep the truck reaches
    let near = null, nd = 1e9;
    for (const o of houses) { const d = Math.hypot(o.door.x - S.x, o.door.z - S.z); if (!o.done) { if (d < nd) { nd = d; near = o; } if (d < 7.5) { o.done = true; o.bea.visible = false; gift(o.door, o); } }
      o.ring.rotation.z += dt * .8; o.col.material.opacity = .12 + Math.sin(tt * 2.4) * .04;
      if (o.lit > 0 && o.lit < 1) o.lit = Math.min(1, o.lit + dt / 1.4);
      const L = o.lit; o.winM.color.setRGB(lerp(.08, 1, L), lerp(.11, .72, L), lerp(.2, .38, L)); o.glow.material.opacity = L * (.75 + Math.sin(tt * 7 + o.h.id) * .04);
      o.smoke.forEach(s => { s.t = (s.t + dt * .16) % 1; s.m.position.set(o.ch.position.x + Math.sin(s.t * 6 + o.h.id) * .4, o.ch.position.y + 1 + s.t * 5, o.ch.position.z); const k = 1 + s.t * 3; s.m.scale.set(k, k, 1); s.m.material.opacity = L * .5 * Math.sin(s.t * Math.PI); }); }
    for (let i = flying.length - 1; i >= 0; i--) { const f = flying[i]; f.t += dt / .9; const k = Math.min(1, f.t); f.g.position.lerpVectors(f.a, f.b, k); f.g.position.y += Math.sin(k * Math.PI) * 6; f.g.rotation.y += dt * 5;
      if (k >= 1) { flying.splice(i, 1); f.house.lit = .001; S.done++; setCount(); msg.textContent = S.done < NH ? ['სახლი გათბა', 'კიდევ ერთი ფანჯარა აინთო', 'სოფელი ნელ-ნელა ნათდება'][S.done % 3] : 'სოფელი გაბრწყინდა'; if (S.done === NH) S.end = .001; } }
    // the square's tree lights up when the whole village is lit
    if (S.end > 0) { S.end = Math.min(1, S.end + dt / 2.5); if (S.end > .6 && fin.hidden) fin.hidden = false; }
    { const k = S.end; for (let i = 0; i < 90; i++) { const on = k * 90 > i, ph = Math.sin(tt * 2 + i) * .5 + .5; fcol.set(on ? [0xff3b30, 0xffd27a, 0xffffff, 0xff8a3d][i % 4] : 0x202020); if (on) fcol.multiplyScalar(.7 + ph * .5); bulbs.setColorAt(i, fcol); } bulbs.instanceColor.needsUpdate = true; star.material.opacity = .2 + k * .8; }
    // edge arrow toward the nearest dark house
    if (near) { tmp.copy(near.door).setY(2).project(cam); const behind = tmp.z > 1, ox = behind ? -tmp.x : tmp.x, oy = behind ? -tmp.y : tmp.y, inView = !behind && Math.abs(tmp.x) < .85 && Math.abs(tmp.y) < .8;
      arrow.hidden = inView; if (!inView) { const a = Math.atan2(-oy, ox), r = .4; arrow.style.left = (50 + Math.cos(a) * r * 100 * .9) + '%'; arrow.style.top = (50 + Math.sin(a) * r * 100) + '%'; arrow.style.transform = `translate(-50%,-50%) rotate(${a}rad)`; }
      $('#pdist').textContent = Math.round(nd) + ' მ'; } else { arrow.hidden = true; $('#pdist').textContent = ''; }
    // chase camera
    camPos.set(S.x - Math.sin(S.yaw) * 17, 7.2 + S.v * .05, S.z - Math.cos(S.yaw) * 17); cam.position.lerp(camPos, 1 - Math.pow(.02, dt));
    camLook.set(S.x + Math.sin(S.yaw) * 6, 2.2, S.z + Math.cos(S.yaw) * 6); cam.lookAt(camLook);
    const p = snow.geometry.attributes.position; for (let i = 0; i < NS; i++) { let y = p.getY(i) - dt * (2.2 + (i % 5) * .3); if (y < 0) y += 40; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(tt + i) * .004); } p.needsUpdate = true; snow.position.set(S.x, 0, S.z);
    R.render(scene, cam); requestAnimationFrame(loop);
  }
  window.__play = { open, close };
  open();
})();
