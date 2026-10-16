/* The holiday truck drive: a North Pole village at night. Every place is a photographic cut-out standing in a real 3D
   space (the classic billboard technique), so the world reads like the campaign key visuals while staying light enough
   for phones. Houses stay dark until the truck brings their gift; then their windows light up. three.js r128 is on the page. */
(() => {
  const T = THREE, $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, rnd = (a, b) => a + Math.random() * (b - a);
  const root = $('#play'), cv = $('#playcv'), CALM = matchMedia('(prefers-reduced-motion: reduce)').matches, PHONE = matchMedia('(hover: none)').matches;
  const R = new T.WebGLRenderer({ canvas: cv, antialias: !PHONE }); R.outputEncoding = T.sRGBEncoding;
  const scene = new T.Scene(), FOG = 0x0d1a3c; scene.background = new T.Color(FOG); scene.fog = new T.Fog(FOG, 40, 210);
  const cam = new T.PerspectiveCamera(52, 1, .1, 600);
  const TL = new T.TextureLoader();
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,210,140,1)'); g.addColorStop(.3, 'rgba(255,160,70,.45)'); g.addColorStop(1, 'rgba(255,120,40,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const smokeTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(220,228,245,.55)'); g.addColorStop(1, 'rgba(220,228,245,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const glow = (color, op) => new T.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: op, blending: T.AdditiveBlending, depthWrite: false });
  // a photographic cut-out standing on the snow: its base sits on the ground, it always faces the camera
  const mats = {}, users = {};
  const fit = s => { const im = s.material.map.image; if (im && im.width) s.scale.set(s.userData.h * im.width / im.height, s.userData.h, 1); };
  function prop(n, h, x, z, extra) {
    if (!mats[n]) { users[n] = []; const t = TL.load('img/g/' + n + '.webp', () => users[n].forEach(fit)); t.encoding = T.sRGBEncoding; t.anisotropy = 4; mats[n] = new T.SpriteMaterial({ map: t, transparent: true, alphaTest: .04 }); }
    const s = new T.Sprite(extra ? Object.assign(mats[n].clone(), extra) : mats[n]); s.center.set(.5, .02); s.userData.h = h; s.position.set(x, 0, z); s.scale.set(0, 0, 0); scene.add(s); users[n].push(s); fit(s); return s;
  }

  // ---------- sky: the site's own night plate wraps the horizon, stars and aurora above ----------
  { const t = TL.load('img/bg-night.jpg'); t.encoding = T.sRGBEncoding; t.wrapS = T.MirroredRepeatWrapping; t.repeat.set(4, .62); t.offset.set(0, .38);
    const pano = new T.Mesh(new T.CylinderGeometry(330, 330, 170, 64, 1, true), new T.MeshBasicMaterial({ map: t, side: T.BackSide, fog: false })); pano.position.y = 62; scene.add(pano);
    const sp = new Float32Array(1100 * 3); for (let i = 0; i < 1100; i++) { const a = rnd(0, 6.283), e = rnd(.35, 1.5), r = 320; sp.set([Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r], i * 3); }
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3)); scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xdfe8ff, size: 1.2, sizeAttenuation: false, fog: false, transparent: true, opacity: .8 })));
    const top = new T.Mesh(new T.CircleGeometry(330, 48), new T.MeshBasicMaterial({ color: 0x050b1e, fog: false })); top.rotation.x = Math.PI / 2; top.position.y = 147; scene.add(top);
    const ac = document.createElement('canvas'); ac.width = 512; ac.height = 64; const ax = ac.getContext('2d');
    for (let i = 0; i < 512; i += 2) { const h = 22 + Math.sin(i * .02) * 10 + Math.sin(i * .07) * 4, gg = ax.createLinearGradient(0, 64, 0, 64 - h * 1.6); gg.addColorStop(0, 'rgba(90,255,200,0)'); gg.addColorStop(.3, 'rgba(90,255,200,.3)'); gg.addColorStop(1, 'rgba(120,140,255,0)'); ax.fillStyle = gg; ax.fillRect(i, 0, 2, 64); }
    const aur = new T.Mesh(new T.CylinderGeometry(300, 300, 70, 64, 1, true, 3.4, 2.6), new T.MeshBasicMaterial({ map: new T.CanvasTexture(ac), transparent: true, side: T.BackSide, fog: false, blending: T.AdditiveBlending, depthWrite: false })); aur.position.y = 120; scene.add(aur); }
  scene.add(new T.HemisphereLight(0x6d86c8, 0x101833, .8));

  // ---------- snow ground and the road loop ----------
  { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#c3d0e8'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '150,170,210'},${rnd(.04, .22)})`; x.beginPath(); x.arc(rnd(0, 256), rnd(0, 256), rnd(.5, 3), 0, 6.3); x.fill(); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(60, 60);
    const g = new T.Mesh(new T.PlaneGeometry(700, 700, 80, 80), new T.MeshLambertMaterial({ map: t }));
    const p = g.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, (Math.sin(p.getX(i) * .06) + Math.cos(p.getY(i) * .045)) * .45); g.geometry.computeVertexNormals();
    g.rotation.x = -Math.PI / 2; scene.add(g); }
  const pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = 66 + Math.sin(a * 3) * 14 + Math.cos(a * 2) * 6; pts.push(new T.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); }
  const RS = new T.CatmullRomCurve3(pts, true, 'centripetal').getSpacedPoints(600), N = RS.length;
  const tangent = i => RS[(i + 2) % N].clone().sub(RS[(i + N - 2) % N]).normalize(), side = (i, d) => { i = ((i % N) + N) % N; const t = tangent(i); return new T.Vector3(-t.z, 0, t.x).multiplyScalar(d).add(RS[i]); };
  { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#93a5c6'; x.fillRect(0, 0, 64, 256);
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${rnd(.05, .28)})`; x.fillRect(rnd(0, 64), rnd(0, 256), 1, rnd(1, 4)); }
    for (const tx of [18, 46]) { x.fillStyle = 'rgba(60,76,110,.4)'; x.fillRect(tx - 4, 0, 8, 256); }
    const g = new T.CanvasTexture(c); g.wrapT = T.RepeatWrapping; const pos = [], uv = [], idx = []; let L = 0;
    for (let i = 0; i <= N; i++) { const p = RS[i % N], a = side(i, 4.4), b = side(i, -4.4); if (i) L += p.distanceTo(RS[(i - 1) % N]); pos.push(a.x, .07, a.z, b.x, .07, b.z); uv.push(0, L / 9, 1, L / 9); if (i) idx.push(i * 2 - 2, i * 2 - 1, i * 2, i * 2 - 1, i * 2 + 1, i * 2); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    scene.add(new T.Mesh(geo, new T.MeshLambertMaterial({ map: g, polygonOffset: true, polygonOffsetFactor: -2 }))); }
  const roadDist = (x, z) => { let m = 1e9; for (let i = 0; i < N; i += 3) { const d = (RS[i].x - x) ** 2 + (RS[i].z - z) ** 2; if (d < m) m = d; } return Math.sqrt(m); };
  const solid = []; // circles the truck cannot drive through

  // ---------- places ----------
  const S0 = 0, ws = side(S0 + 18, -17); prop('workshop', 15, ws.x, ws.z); solid.push([ws.x, ws.z, 8]);                 // the trip starts at Santa's workshop
  { const p = side(300, 16); prop('stable', 12, p.x, p.z); solid.push([p.x, p.z, 7]); }
  prop('tree', 17, 0, -4); prop('santabear', 6.4, 0, 6); solid.push([0, 0, 9]);                                         // the square: the big tree, Santa and the bear
  for (const k of [130, 410, 520]) { const p = side(k, k % 2 ? 9.5 : -9.5); prop('globe', 4.2, p.x, p.z); solid.push([p.x, p.z, 2.4]); }
  const lamps = []; for (let i = 6; i < N; i += 26) { const p = side(i, (i / 26 | 0) % 2 ? 6.2 : -6.2); prop('lamp', 6.6, p.x, p.z); const g = new T.Sprite(glow(0xffc070, .65)); g.position.set(p.x, 6.1, p.z); g.scale.set(5, 5, 1); scene.add(g); lamps.push(g); }
  for (let i = 0; i < 30; i++) { const p = side(i * 20 + 11, (i % 2 ? 1 : -1) * rnd(12, 20)); if (Math.hypot(p.x, p.z) > 14) prop('tree', rnd(7, 11), p.x, p.z); }
  for (let tries = 0, n = 0; n < (PHONE ? 110 : 190) && tries < 4000; tries++) { const a = rnd(0, 6.283), r = rnd(18, 230), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (roadDist(x, z) < 11 || Math.hypot(x - ws.x, z - ws.z) < 14 || Math.hypot(x, z) < 16) continue; prop('spruce', rnd(8, 16), x, z); n++; }

  // houses: a paper-cup cottage or a gift-box cottage, dark until their gift arrives
  const houses = [], NH = 8;
  for (let k = 0; k < NH; k++) {
    const i = Math.floor((k + .5) / NH * N) % N, d = k % 2 ? 1 : -1, p = side(i, 13 * d), n = k % 2 ? 'cuphouse' : 'boxhouse', h = n === 'cuphouse' ? 9 : 9.5;
    prop(n + '-d', h, p.x, p.z); const lit = prop(n, h, p.x, p.z, { opacity: 0 }); lit.renderOrder = 1;
    const gl = new T.Sprite(glow(0xffb066, 0)); gl.position.set(p.x, h * .35, p.z); gl.scale.set(h * 1.6, h * 1.1, 1); scene.add(gl);
    const door = side(i, 6.5 * d), bea = new T.Group(); bea.position.set(door.x, 0, door.z); scene.add(bea);
    const col = new T.Mesh(new T.CylinderGeometry(1, 1, 30, 24, 1, true), new T.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: .14, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); col.position.y = 15; bea.add(col);
    const ring = new T.Mesh(new T.TorusGeometry(1.8, .1, 8, 48), new T.MeshBasicMaterial({ color: 0xff3b30 })); ring.rotation.x = Math.PI / 2; ring.position.y = .3; bea.add(ring);
    const smoke = []; for (let s = 0; s < 6; s++) { const m = new T.Sprite(new T.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false })); scene.add(m); smoke.push({ m, t: s / 6 }); }
    houses.push({ lit, gl, bea, ring, col, smoke, p, h, door, L: 0, done: false }); solid.push([p.x, p.z, 5.2]);
  }

  // the gondola line high over the valley
  const cable = [new T.Vector3(-260, 70, -150), new T.Vector3(260, 92, -40)];
  scene.add(new T.Line(new T.BufferGeometry().setFromPoints(cable), new T.LineBasicMaterial({ color: 0x1a2234 })));
  const gondolas = [0, .33, .66].map(u => { const s = prop('gondola', 7, 0, 0); s.center.set(.5, .98); return { s, u }; });

  // ---------- the truck: the photographic rear view, its lights and the golden tracks it leaves ----------
  const truck = new T.Group(); scene.add(truck);
  const rear = prop('truckrear', 5.4, 0, 0); scene.remove(rear); truck.add(rear);
  const beam = new T.SpotLight(0xfff0d0, 3, 70, .5, .55, 1.1); beam.position.set(0, 1.6, 6); beam.target.position.set(0, 0, 24); truck.add(beam, beam.target);
  const warm = new T.PointLight(0xffa860, 1.4, 20, 2); warm.position.set(0, 5, -1); truck.add(warm);
  { const h = new T.Sprite(glow(0xffa860, .22)); h.scale.set(12, 8, 1); h.position.set(0, 3, 0); truck.add(h); }
  const NT = PHONE ? 260 : 520, track = new T.InstancedMesh(new T.PlaneGeometry(.32, .62), new T.MeshBasicMaterial({ color: 0xffffff, map: glowTex, transparent: true, blending: T.AdditiveBlending, depthWrite: false }), NT);
  track.instanceMatrix.setUsage(T.DynamicDrawUsage); scene.add(track);
  const marks = []; let lastMark = null; const m4 = new T.Matrix4(), q = new T.Quaternion(), e3 = new T.Euler(), one = new T.Vector3(1, 1, 1), col = new T.Color(), tmp = new T.Vector3();
  for (let i = 0; i < NT; i++) { m4.makeScale(0, 0, 0); track.setMatrixAt(i, m4); track.setColorAt(i, col.setRGB(0, 0, 0)); }

  // ---------- falling snow ----------
  const NS = CALM ? 500 : PHONE ? 1300 : 2600, sp = new Float32Array(NS * 3); for (let i = 0; i < NS; i++) sp.set([rnd(-60, 60), rnd(0, 40), rnd(-60, 60)], i * 3);
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
  const snow = new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: .14, transparent: true, opacity: .85, depthWrite: false })); scene.add(snow);

  // ---------- gifts that fly from the trailer to the doorstep ----------
  const giftM = [new T.MeshLambertMaterial({ color: 0xd8000b }), new T.MeshLambertMaterial({ color: 0xffffff })], flying = [];
  function gift(o) { const g = new T.Group(); g.add(new T.Mesh(new T.BoxGeometry(1, .8, 1), giftM[0])); for (const r of [[1.02, .82, .18], [.18, .82, 1.02]]) g.add(new T.Mesh(new T.BoxGeometry(...r), giftM[1])); g.position.set(S.x, 4.6, S.z); scene.add(g); flying.push({ g, a: g.position.clone(), b: o.door.clone().setY(.4), t: 0, o }); }

  // ---------- state, input ----------
  const st = side(S0 + 4, 0), S = { x: st.x, z: st.z, yaw: 0, v: 0, steer: 0, done: 0, end: 0, on: false };
  { const t = tangent(S0 + 4); S.yaw = Math.atan2(t.x, t.z); }
  const keys = {}, touch = { x: 0, y: 0, on: false };
  addEventListener('keydown', e => { if (!S.on) return; const k = e.key.toLowerCase(); keys[k] = true; if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault(); if (e.key === 'Escape') close(); });
  addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
  const stick = $('#pstick'), knob = $('#pknob');
  stick.addEventListener('pointerdown', e => { touch.on = true; try { stick.setPointerCapture(e.pointerId); } catch (_) { } move(e); });
  stick.addEventListener('pointermove', e => touch.on && move(e));
  const up = () => { touch.on = false; touch.x = touch.y = 0; knob.style.transform = ''; }; stick.addEventListener('pointerup', up); stick.addEventListener('pointercancel', up);
  function move(e) { const r = stick.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), m = Math.min(1, Math.hypot(dx, dy) / 44), a = Math.atan2(dy, dx); touch.x = Math.cos(a) * m; touch.y = -Math.sin(a) * m; knob.style.transform = `translate(${Math.cos(a) * m * 34}px,${Math.sin(a) * m * 34}px)`; }
  const cnt = $('#pcnt'), arrow = $('#parrow'), fin = $('#pfin');
  const music = new Audio('audio/truck.mp3'); music.loop = true; music.volume = .7;
  const setCount = () => cnt.textContent = `${S.done} / ${NH}`;
  function open() { root.hidden = false; document.documentElement.classList.add('playing'); S.on = true; size(); setCount(); try { const p = root.requestFullscreen && root.requestFullscreen(); p && p.catch && p.catch(() => { }); } catch (_) { } if (window.__site && window.__site.soundOn()) music.play().catch(() => { }); window.__playing = true; last = performance.now(); requestAnimationFrame(loop); }
  function close() { S.on = false; root.hidden = true; document.documentElement.classList.remove('playing'); music.pause(); window.__playing = false; if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); }
  function restart() { houses.forEach(o => { o.done = false; o.L = 0; o.bea.visible = true; }); S.done = 0; S.end = 0; fin.hidden = true; setCount(); }
  $('#pclose').addEventListener('click', close); $('#pagain').addEventListener('click', restart); $('#pexit').addEventListener('click', close);
  let lw = 0, lh = 0; function size() { const w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight; lw = w; lh = h; R.setPixelRatio(Math.min(PHONE ? 1.5 : 2, devicePixelRatio || 1)); R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }

  // ---------- the loop ----------
  let last = 0, tt = 0; const camPos = new T.Vector3(), camLook = new T.Vector3();
  function loop(now) {
    if (!S.on) return; if (cv.clientWidth !== lw || cv.clientHeight !== lh) size(); const dt = Math.min(.05, (now - last) / 1000); last = now; tt += dt;
    const thr = (keys.arrowup || keys.w ? 1 : 0) - (keys.arrowdown || keys.s ? 1 : 0) + touch.y, str = (keys.arrowleft || keys.a ? 1 : 0) - (keys.arrowright || keys.d ? 1 : 0) - touch.x;
    const off = roadDist(S.x, S.z) > 4.6, MAX = off ? 9 : 20;
    S.v += clamp(thr, -1, 1) * (thr * S.v < 0 ? 26 : 9) * dt; if (!thr) S.v *= Math.pow(.35, dt); S.v = clamp(S.v, -6, MAX); if (off) S.v *= Math.pow(.6, dt);
    S.steer = lerp(S.steer, clamp(str, -1, 1), Math.min(1, dt * 6)); S.yaw += S.steer * dt * 1.2 * clamp(S.v / 6, -1, 1);
    let nx = S.x + Math.sin(S.yaw) * S.v * dt, nz = S.z + Math.cos(S.yaw) * S.v * dt;
    for (const [x, z, r] of solid) { const d = Math.hypot(nx - x, nz - z), rr = r + 2.2; if (d < rr) { nx = x + (nx - x) / d * rr; nz = z + (nz - z) / d * rr; S.v *= .7; } }
    { const d = Math.hypot(nx, nz); if (d > 200) { nx = nx / d * 200; nz = nz / d * 200; } }
    S.x = nx; S.z = nz;
    truck.position.set(S.x, 0, S.z); truck.rotation.y = S.yaw; rear.material.rotation = S.steer * clamp(S.v / 20, 0, 1) * .025; rear.position.y = Math.abs(S.v) > 1 ? Math.sin(tt * 18) * .015 : 0;
    // golden tracks on the snow behind the wheels, fading slowly
    if (Math.abs(S.v) > .5 && (!lastMark || Math.hypot(S.x - lastMark[0], S.z - lastMark[1]) > .55)) { lastMark = [S.x, S.z]; for (const sd of [-1.05, 1.05]) marks.push({ x: S.x + Math.cos(S.yaw) * sd - Math.sin(S.yaw) * 1.6, z: S.z - Math.sin(S.yaw) * sd - Math.cos(S.yaw) * 1.6, yaw: S.yaw, age: 0 }); while (marks.length > NT) marks.shift(); }
    for (let i = 0; i < marks.length; i++) { const m = marks[i]; m.age += dt; const k = Math.max(0, 1 - m.age / 9); e3.set(-Math.PI / 2, 0, m.yaw); q.setFromEuler(e3); m4.compose(tmp.set(m.x, .09, m.z), q, one); track.setMatrixAt(i, m4); const tw = .75 + .25 * Math.sin(tt * 9 + i * 1.3); track.setColorAt(i, col.setRGB(.95 * k * tw, .62 * k * tw, .22 * k * tw)); }
    track.instanceMatrix.needsUpdate = true; track.instanceColor.needsUpdate = true;
    // deliveries
    let near = null, nd = 1e9;
    for (const o of houses) { const d = Math.hypot(o.door.x - S.x, o.door.z - S.z); if (!o.done) { if (d < nd) { nd = d; near = o; } if (d < 7.5) { o.done = true; o.bea.visible = false; gift(o); } }
      o.ring.rotation.z += dt * .8; o.col.material.opacity = .11 + Math.sin(tt * 2.4) * .04;
      if (o.L > 0 && o.L < 1) o.L = Math.min(1, o.L + dt / 1.6);
      o.lit.material.opacity = o.L; o.gl.material.opacity = o.L * (.5 + Math.sin(tt * 6 + o.p.x) * .03);
      o.smoke.forEach(s => { s.t = (s.t + dt * .14) % 1; s.m.position.set(o.p.x + Math.sin(s.t * 6 + o.p.z) * .5, o.h * .95 + s.t * 7, o.p.z); const k = 1.2 + s.t * 3.5; s.m.scale.set(k, k, 1); s.m.material.opacity = o.L * .45 * Math.sin(s.t * Math.PI); }); }
    for (let i = flying.length - 1; i >= 0; i--) { const f = flying[i]; f.t += dt / .9; const k = Math.min(1, f.t); f.g.position.lerpVectors(f.a, f.b, k); f.g.position.y += Math.sin(k * Math.PI) * 6; f.g.rotation.y += dt * 5;
      if (k >= 1) { flying.splice(i, 1); scene.remove(f.g); f.o.L = .001; S.done++; setCount(); if (S.done === NH) S.end = .001; } }
    if (S.end > 0) { S.end = Math.min(1, S.end + dt / 2.5); if (S.end > .6 && fin.hidden) fin.hidden = false; }
    lamps.forEach((g, i) => g.material.opacity = .55 + Math.sin(tt * 2 + i) * .05);
    gondolas.forEach(g => { g.u = (g.u + dt * .012) % 1; g.s.position.lerpVectors(cable[0], cable[1], g.u); });
    // edge arrow toward the nearest dark house
    if (near) { tmp.copy(near.door).setY(2).project(cam); const behind = tmp.z > 1, ox = behind ? -tmp.x : tmp.x, oy = behind ? -tmp.y : tmp.y, inView = !behind && Math.abs(tmp.x) < .85 && Math.abs(tmp.y) < .8;
      arrow.hidden = inView; if (!inView) { const a = Math.atan2(-oy, ox); arrow.style.left = (50 + Math.cos(a) * 36) + '%'; arrow.style.top = (50 + Math.sin(a) * 40) + '%'; arrow.style.transform = `translate(-50%,-50%) rotate(${a}rad)`; }
      $('#pdist').textContent = Math.round(nd) + ' მ'; } else arrow.hidden = true;
    // chase camera
    camPos.set(S.x - Math.sin(S.yaw) * 15, 5.6 + S.v * .04, S.z - Math.cos(S.yaw) * 15); cam.position.lerp(camPos, 1 - Math.pow(.02, dt));
    camLook.set(S.x + Math.sin(S.yaw) * 8, 2.6, S.z + Math.cos(S.yaw) * 8); cam.lookAt(camLook);
    const p = snow.geometry.attributes.position; for (let i = 0; i < NS; i++) { let y = p.getY(i) - dt * (2.2 + (i % 5) * .3); if (y < 0) y += 40; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(tt + i) * .004); } p.needsUpdate = true; snow.position.set(S.x, 0, S.z);
    R.render(scene, cam); requestAnimationFrame(loop);
  }
  window.__play = { open, close };
  open();
})();
