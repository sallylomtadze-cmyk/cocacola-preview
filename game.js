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
  const mats = {}, users = {}, cards = [], CARD = new T.PlaneGeometry(1, 1).translate(0, .5, 0);
  let snowMat = null, snowTex = null; const moundGeo = new T.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const drift = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');   // soft heaped snow around a base, with a faint contact shade in the middle
    let g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(236,242,255,.95)'); g.addColorStop(.45, 'rgba(226,234,252,.7)'); g.addColorStop(1, 'rgba(220,230,250,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    g = x.createRadialGradient(64, 60, 0, 64, 60, 22); g.addColorStop(0, 'rgba(40,52,90,.32)'); g.addColorStop(1, 'rgba(40,52,90,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c); })();
  const fit = s => { const mat = s.userData.mat || s.material, im = mat.map.image; if (!im || !im.width) return; const w = s.userData.h * im.width / im.height;
    if (s.userData.x) s.scale.set(w, s.userData.h, w); else s.scale.set(w, s.userData.h, 1); if (s.userData.onfit && !s.userData.built) { s.userData.built = 1; s.userData.onfit(w, s.userData.h, im); }
    if (s.userData.mound && !s.userData.m) { const m = new T.Mesh(moundGeo, snowMat); m.scale.set(w * 1.15, 1, w * .8); m.position.set(s.position.x, .1, s.position.z); m.renderOrder = -1; scene.add(m); s.userData.m = m; } };
  function prop(n, h, x, z, extra, mound = true) {
    if (!mats[n]) { users[n] = []; const t = TL.load('img/g/' + n + '.webp?v=2', () => users[n].forEach(fit)); t.encoding = T.sRGBEncoding; t.anisotropy = 4; mats[n] = new T.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .04, side: T.DoubleSide }); }
    const s = new T.Mesh(CARD, extra ? Object.assign(mats[n].clone(), extra) : mats[n]); s.userData.h = h; s.userData.mound = mound; s.position.set(x, 0, z); s.scale.set(0, 0, 0); scene.add(s); users[n].push(s); cards.push(s); fit(s); return s;
  }
  function xprop(n, h, x, z) { // three crossed cards: reads as a full tree from every side
    prop(n, 0, 0, 0); const m = users[n].pop(); cards.splice(cards.indexOf(m), 1); scene.remove(m);
    const G = new T.Group(); for (let i = 0; i < 3; i++) { const c = new T.Mesh(CARD, mats[n]); c.rotation.y = i * Math.PI / 3; G.add(c); }
    G.userData = { h, x: 1, mat: mats[n], mound: true }; G.position.set(x, 0, z); G.rotation.y = rnd(0, 3); G.scale.set(0, 0, 0); scene.add(G); users[n].push(G); fit(G); return G;
  }
  const planks = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#b9b0a8'; x.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 21) { x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, y, 256, 2); x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(0, y + 2, 256, 2); }
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? '0,0,0' : '255,255,255'},${rnd(.02, .07)})`; x.fillRect(rnd(0, 256), rnd(0, 256), rnd(4, 30), 1); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(2, 2); t.encoding = T.sRGBEncoding; return t; })();
  const lumpy = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#e6edf9'; x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 500; i++) { const r = rnd(4, 18), gx = rnd(0, 256), gy = rnd(0, 256), gr = x.createRadialGradient(gx, gy - r * .3, 0, gx, gy, r); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(150,170,215,.18)'); x.fillStyle = gr; x.beginPath(); x.arc(gx, gy, r, 0, 6.3); x.fill(); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1.5, 1.5); return t; })();
  const wallM = c => new T.MeshLambertMaterial({ map: planks, color: c }), roofM = () => new T.MeshLambertMaterial({ map: lumpy, color: 0xf2f6ff });


  const TXc = {}, TX = (n, rx = 1, ry = 1) => { const k = n + rx + ry; if (TXc[k]) return TXc[k]; const t = TL.load('img/t/' + n + '.jpg'); t.encoding = T.sRGBEncoding; t.anisotropy = 8; if (rx !== 1 || ry !== 1) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); } return TXc[k] = t; };
  const wall = (n, list, on = 0) => { const m = new T.MeshLambertMaterial({ map: TX(n), emissiveMap: TX(n + '-e'), emissive: new T.Color().setScalar(on) }); if (list) list.push(m); return m; };
  const snowM = () => new T.MeshLambertMaterial({ map: TX('snow', 1.5, 1.5), color: 0xffffff });
  const iceGeo = new T.ConeGeometry(.07, .55, 5).rotateX(Math.PI), iceM = new T.MeshPhongMaterial({ color: 0xdfefff, transparent: true, opacity: .8, shininess: 120, specular: 0xffffff });
  const bulbGeo = new T.SphereGeometry(.07, 6, 4), bulbM = new T.MeshBasicMaterial({ color: 0xffd28a });
  function eaves(G, x0, x1, y, z) { // icicles and a string of warm bulbs along an eave
    const n = Math.round((x1 - x0) / .32), ice = new T.InstancedMesh(iceGeo, iceM, n), bulbs = new T.InstancedMesh(bulbGeo, bulbM, n), m = new T.Matrix4();
    for (let i = 0; i < n; i++) { const x = x0 + (i + .5) * (x1 - x0) / n, s = rnd(.5, 1.4); m.makeScale(1, s, 1).setPosition(x, y - .28 * s, z); ice.setMatrixAt(i, m); m.makeTranslation(x, y - .12 - Math.sin(i * .9) * .08, z + .06); bulbs.setMatrixAt(i, m); }
    G.add(ice, bulbs); }
  function cottage(x, z, face, front, side, list, on, W = 7.6, H = 4.8, D = 6.6) { // a real cottage: textured walls, snowy gable roof, chimney, icicles, fairy lights, steps
    const G = new T.Group(); G.position.set(x, 0, z); G.rotation.y = face; scene.add(G);
    const sm = wall(side, list, on), fm = wall(front, list, on);
    const body = new T.Mesh(new T.BoxGeometry(W, H, D), [sm, sm, snowM(), sm, fm, sm]); body.position.y = H / 2; G.add(body);
    const rh = 3.1, ow = W / 2 + .55, slope = Math.hypot(ow, rh), ang = Math.atan2(rh, ow);
    for (const s of [-1, 1]) { const p = new T.Mesh(new T.BoxGeometry(slope, .42, D + 1.1), snowM()); p.position.set(s * ow / 2, H + rh / 2, 0); p.rotation.z = -s * ang; G.add(p); }
    const tri = new T.Shape(); tri.moveTo(-W / 2, 0); tri.lineTo(W / 2, 0); tri.lineTo(0, rh * W / 2 / ow); tri.lineTo(-W / 2, 0);
    const gm = new T.MeshLambertMaterial({ map: TX(side) }); for (const s of [-1, 1]) { const t = new T.Mesh(new T.ShapeGeometry(tri), gm); t.position.set(0, H, s * D / 2); if (s < 0) t.rotation.y = Math.PI; G.add(t); }
    const ch = new T.Mesh(new T.BoxGeometry(.9, 2.2, .9), new T.MeshLambertMaterial({ color: 0x6b2a20 })); ch.position.set(W * .24, H + rh * .75, -D * .15); G.add(ch);
    const cs = new T.Mesh(new T.BoxGeometry(1.1, .3, 1.1), snowM()); cs.position.set(W * .24, H + rh * .75 + 1.15, -D * .15); G.add(cs);
    eaves(G, -ow, ow, H + .02, D / 2 + .5); eaves(G, -ow, ow, H + .02, -D / 2 - .5);
    for (let i = 0; i < 3; i++) { const st = new T.Mesh(new T.BoxGeometry(2.2 - i * .3, .22, .55), snowM()); st.position.set(0, .11 + i * .22, D / 2 + 1.1 - i * .5); G.add(st); }
    const mnd = new T.Mesh(moundGeo, snowMat); mnd.scale.set(W * 1.8, 1, D * 1.8); mnd.position.y = .1; G.add(mnd);
    return { G, chimney: new T.Vector3(W * .24, H + rh * .75 + 1.3, -D * .15), W, D };
  }
  function cupCottage(x, z, face, list) { // a real paper cup: tapered cylinder wrapped all round, white rims, a heap of snow on the lid
    const G = new T.Group(); G.position.set(x, 0, z); G.rotation.y = face; scene.add(G); const rT = 3.3, rB = 2.8, h = 7.6;
    const m = wall('cup', list); m.map.offset.x = m.emissiveMap.offset.x = .25; m.map.wrapS = m.emissiveMap.wrapS = T.RepeatWrapping;
    const c = new T.Mesh(new T.CylinderGeometry(rT, rB, h, 64, 1, true), m); c.position.y = h / 2; G.add(c);
    const white = new T.MeshLambertMaterial({ color: 0xf3f1ec });
    const top = new T.Mesh(new T.TorusGeometry(rT, .2, 12, 64), white); top.rotation.x = Math.PI / 2; top.position.y = h; G.add(top);
    const band = new T.Mesh(new T.CylinderGeometry(rB + .02, rB - .02, .5, 64, 1, true), white); band.position.y = .25; G.add(band);
    const cap = new T.Mesh(new T.SphereGeometry(rT * 1.08, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), snowM()); cap.scale.y = .5; cap.position.y = h; G.add(cap);
    for (let i = 0; i < 3; i++) { const st = new T.Mesh(new T.BoxGeometry(2 - i * .3, .22, .5), snowM()); st.position.set(0, .11 + i * .22, rB + .9 - i * .45); G.add(st); }
    const mnd = new T.Mesh(moundGeo, snowMat); mnd.scale.set(14, 1, 12); mnd.position.y = .1; G.add(mnd);
    return { G, chimney: new T.Vector3(0, h + 1.2, 0), W: rT * 2, D: rT * 2 };
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
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(60, 60); snowTex = t.clone(); snowTex.repeat.set(2, 2); snowTex.needsUpdate = true;
    const g = new T.Mesh(new T.PlaneGeometry(700, 700, 80, 80), new T.MeshLambertMaterial({ map: TX('snow', 34, 34), color: 0xe9eef9 })); snowMat = new T.MeshLambertMaterial({ map: drift, transparent: true, depthWrite: false });
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
  const S0 = 0, ws = side(S0 + 18, -17), faceRoad = (p, i) => Math.atan2(RS[i].x - p.x, RS[i].z - p.z); cottage(ws.x, ws.z, faceRoad(ws, S0 + 18), 'workshop-front', 'cottage-side', null, 1, 10, 6.4, 8).G.children[0].material[0].color.set(0x8a6a50); solid.push([ws.x, ws.z, 8]);                 // the trip starts at Santa's workshop
  { const p = side(300, 16); cottage(p.x, p.z, faceRoad(p, 300), 'cottage-front', 'cottage-side', null, 1, 8.5, 5, 7); solid.push([p.x, p.z, 7]); }
  const firs = []; firs.push([0, -6, 17, 1]); solid.push([0, 0, 9]);                                         // the square: the big tree, Santa and the bear
  // real snow globes: a glass sphere with a fresnel rim and moving highlights, the bear and a little fir inside, snow swirling in the water, a red lacquer and gold base
  const sparks = [], globes = [];
  const glassMat = new T.ShaderMaterial({ transparent: true, depthWrite: false, side: T.FrontSide, uniforms: { t: { value: 0 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float t; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1. - max(dot(vN, vV), 0.), 2.4); vec3 rim = mix(vec3(.75,.9,1.), vec3(1.,.85,.6), smoothstep(-.3,.6,vN.x)); float spec = pow(max(dot(reflect(-normalize(vec3(-.5,.7,.6)), vN), vV), 0.), 60.); float spec2 = pow(max(dot(reflect(-normalize(vec3(.6,.2,.8)), vN), vV), 0.), 24.) * .35; float irid = sin(vN.y * 9. + t * .6) * .5 + .5; vec3 c = rim * f * 1.15 + vec3(1.) * (spec + spec2) + vec3(.4,.2,.6) * f * irid * .25; gl_FragColor = vec4(c, clamp(f * .85 + spec + spec2 + .04, 0., 1.)); }' });
  const lacquer = new T.MeshPhongMaterial({ color: 0x8a0f12, shininess: 80, specular: 0x553333 }), gold = new T.MeshPhongMaterial({ color: 0xc89b3c, shininess: 90, specular: 0xffe0a0, emissive: 0x2a1a00 });
  const baseTex = (() => { const t = TL.load('img/t/globe-base.jpg'); t.encoding = T.sRGBEncoding; t.wrapS = T.RepeatWrapping; t.repeat.set(2, 1); return t; })();
  const brandBase = (() => { const c = document.createElement('canvas'); c.width = 2048; c.height = 512; const x = c.getContext('2d'), t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.wrapS = T.RepeatWrapping;
    const bg = new Image(); bg.onload = () => { x.drawImage(bg, 0, 0, 2048, 512); x.fillStyle = 'rgba(120,0,8,.82)'; for (const cx of [512, 1536]) { x.beginPath(); x.ellipse(cx, 256, 330, 150, 0, 0, 6.3); x.fill(); }
      const lg = new Image(); lg.onload = () => { for (const cx of [512, 1536]) { const w = 520, h = w * lg.height / lg.width; x.drawImage(lg, cx - w / 2, 256 - h / 2, w, h); } t.needsUpdate = true; }; lg.src = 'img/logo-white.png'; t.needsUpdate = true; }; bg.src = 'img/t/globe-base.jpg'; return t; })();
  function snowGlobe(x, z, img, R = 4, figH = 3.6, brand = false) { // glass dome on a lacquered base, a figure standing on a snow floor inside, snow swirling in the water
    const G = new T.Group(); G.position.set(x, 0, z); scene.add(G); const bh = R * .6, cy = bh + R * .75, fy = cy - R * .7;
    const band = new T.Mesh(new T.CylinderGeometry(R * .74, R * .86, bh, 64, 1, true), new T.MeshPhongMaterial({ map: brand ? brandBase : baseTex, emissiveMap: brand ? brandBase : baseTex, emissive: 0x3a2008, shininess: 70, specular: 0x664433 })); band.position.y = bh / 2; G.add(band);
    const lid = new T.Mesh(new T.CircleGeometry(R * .74, 48), lacquer); lid.rotation.x = -Math.PI / 2; lid.position.y = bh; G.add(lid);
    for (const [y, r] of [[.06, R * .87], [bh, R * .745]]) { const ring = new T.Mesh(new T.TorusGeometry(r, R * .03, 10, 64), gold); ring.rotation.x = Math.PI / 2; ring.position.y = y; G.add(ring); }
    const fr = Math.sqrt(R * R - (cy - fy) ** 2) * .98, floor = new T.Mesh(new T.SphereGeometry(fr, 40, 10, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshLambertMaterial({ map: TX('snow', 1, 1), color: 0xffffff })); floor.scale.y = .28; floor.position.y = fy; G.add(floor);
    const under = new T.Mesh(new T.CylinderGeometry(fr, R * .74, fy - bh, 48), new T.MeshLambertMaterial({ map: TX('snow', 1, 1) })); under.position.y = (fy + bh) / 2; G.add(under);
    const fig = new T.Mesh(CARD, new T.MeshBasicMaterial({ transparent: true, alphaTest: .05, map: TL.load(img, t => { t.encoding = T.sRGBEncoding; fig.scale.set(figH * t.image.width / t.image.height, figH, 1); }) }));
    fig.position.y = fy + .15; fig.scale.set(0, 0, 0); G.add(fig);
    const NF = 260, fp = new Float32Array(NF * 3), seeds = []; for (let i = 0; i < NF; i++) seeds.push({ a: rnd(0, 6.28), r: rnd(.2, R * .85), y: rnd(fy, cy + R * .8), s: rnd(.4, 1.2) });
    const fg = new T.BufferGeometry(); fg.setAttribute('position', new T.BufferAttribute(fp, 3));
    const flakes = new T.Points(fg, new T.PointsMaterial({ color: 0xffffff, size: .12, transparent: true, opacity: .95, depthWrite: false })); G.add(flakes);
    const glass = new T.Mesh(new T.SphereGeometry(R, 48, 32), glassMat); glass.position.y = cy; glass.renderOrder = 3; G.add(glass);
    const inLight = new T.PointLight(0xffd9a8, .9, R * 3, 2); inLight.position.set(0, cy + R * .4, R * .3); G.add(inLight);
    const halo = new T.Sprite(glow(0xa8d8ff, .28)); halo.position.y = cy; halo.scale.set(R * 3.4, R * 3.4, 1); G.add(halo);
    globes.push({ G, fig, flakes, seeds, R, cy, fy });
    for (let i = 0; i < 22; i++) { const s = new T.Sprite(glow(i % 3 ? 0xfff2cc : 0xbfe4ff, 0)); s.scale.set(.45, .45, 1); scene.add(s); sparks.push({ s, x, z, a: rnd(0, 6.28), r: rnd(R * 1.2, R * 2), y: rnd(1, 12), v: rnd(.3, .9), ph: rnd(0, 6.28) }); }
    const m = new T.Mesh(moundGeo, snowMat); m.scale.set(R * 3.4, 1, R * 3); m.position.set(x, .1, z); scene.add(m);
  }
  const occ = []; for (const k of [130, 410, 520]) { const p = side(k, k % 2 ? 14 : -14); snowGlobe(p.x, p.z, 'img/bear-sit.webp'); solid.push([p.x, p.z, 4]); occ.push([p.x, p.z, 7]); }
  snowGlobe(0, 8, 'img/g/santabear.webp?v=2', 5.6, 4.6, true);
  for (const [a, r, img] of [[.9, 104, 'img/g/workshop.webp?v=2'], [2.6, 110, 'img/g/cuphouse.webp?v=2'], [4.4, 100, 'img/bear-sit.webp']]) { const x = Math.cos(a) * r, z = Math.sin(a) * r; snowGlobe(x, z, img, 14, 13, true); occ.push([x, z, 26]); solid.push([x, z, 13]); } occ.push([0, 8, 10], [ws.x, ws.z, 13]);
  const lamps = []; for (let i = 6; i < N; i += 26) { const p = side(i, (i / 26 | 0) % 2 ? 6.2 : -6.2); occ.push([p.x, p.z, 4]); xprop('lamp', 6.6, p.x, p.z); const g = new T.Sprite(glow(0xffc070, .65)); g.position.set(p.x, 6.1, p.z); g.scale.set(5, 5, 1); scene.add(g); lamps.push(g); }
  for (let i = 0; i < 30; i++) { const p = side(i * 20 + 11, (i % 2 ? 1 : -1) * rnd(12, 20)); if (Math.hypot(p.x, p.z) > 14) firs.push([p.x, p.z, rnd(7, 11), 1]); }
  for (let tries = 0, n = 0; n < (PHONE ? 110 : 190) && tries < 4000; tries++) { const a = rnd(0, 6.283), r = rnd(18, 230), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (roadDist(x, z) < 11 || Math.hypot(x - ws.x, z - ws.z) < 14 || Math.hypot(x, z) < 16) continue; firs.push([x, z, rnd(8, 16), 0]); n++; }

  function forest() { // real 3D firs: drooping tiers of snowy branches (one instanced mesh per tier for the whole forest), trunks, and lights + baubles on the decorated ones
    const ok = firs.filter(([x, z, h, d]) => (d && x === 0 && z === -6) || (!occ.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r) && roadDist(x, z) > 7.5));
    const ft = TX('fir', 3, 2), mat = new T.MeshLambertMaterial({ map: ft, color: 0xa9c8b2, emissive: 0x060d0a }), TIERS = 9, m4 = new T.Matrix4(), q = new T.Quaternion(), s3 = new T.Vector3(), p3 = new T.Vector3();
    const tier = i => { const r = .3 * (1 - i / 9.6), hh = .22, g = new T.ConeGeometry(r, hh, 26, 3, true), p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const y = p.getY(k), lo = y < -hh * .3; if (lo) { const a = Math.atan2(p.getZ(k), p.getX(k)), j = .78 + .32 * Math.abs(Math.sin(a * 5.5 + i * 1.3)); p.setX(k, p.getX(k) * j); p.setZ(k, p.getZ(k) * j); p.setY(k, y - (1 - j) * .12); } }
      g.computeVertexNormals(); g.translate(0, .08 + i * .093 + hh / 2, 0); return g; };
    for (let i = 0; i < TIERS; i++) { const im = new T.InstancedMesh(tier(i), mat, ok.length); ok.forEach(([x, z, h], n) => { q.setFromAxisAngle(p3.set(0, 1, 0), rnd(0, 6.28)); m4.compose(p3.set(x, 0, z), q, s3.set(h, h, h)); im.setMatrixAt(n, m4); }); scene.add(im); }
    const trunk = new T.InstancedMesh(new T.CylinderGeometry(.018, .028, .2, 6).translate(0, .1, 0), new T.MeshLambertMaterial({ color: 0x3a2618 }), ok.length);
    ok.forEach(([x, z, h], n) => { m4.makeScale(h, h, h).setPosition(x, 0, z); trunk.setMatrixAt(n, m4); }); scene.add(trunk);
    const dec = ok.filter(f => f[3]), NB = 46, bulbs = new T.InstancedMesh(new T.SphereGeometry(1, 6, 4), new T.MeshBasicMaterial({ color: 0xffcf7a }), dec.length * NB),
      balls = new T.InstancedMesh(new T.SphereGeometry(1, 12, 8), new T.MeshPhongMaterial({ color: 0xb3000c, shininess: 110, specular: 0xffffff, emissive: 0x200000 }), dec.length * 14); let b = 0, c = 0;
    dec.forEach(([x, z, h]) => { for (let k = 0; k < NB + 14; k++) { const t = Math.random(), y = .12 + t * .8, r = .3 * (1 - (y - .08) / .9) * .92, a = rnd(0, 6.28), s = k < NB ? h * .0065 : h * .016;
        m4.makeScale(s, s, s).setPosition(x + Math.cos(a) * r * h, y * h, z + Math.sin(a) * r * h); if (k < NB) bulbs.setMatrixAt(b++, m4); else balls.setMatrixAt(c++, m4); }
      const st = new T.Sprite(glow(0xffe3a0, .9)); st.position.set(x, h * .97, z); st.scale.set(h * .12, h * .12, 1); scene.add(st); });
    scene.add(bulbs, balls);
    ok.forEach(([x, z, h]) => { const m = new T.Mesh(moundGeo, snowMat); m.scale.set(h * .7, 1, h * .7); m.position.set(x, .08, z); scene.add(m); }); }
  // houses: a paper-cup cottage or a gift-box cottage, dark until their gift arrives
  const houses = [], NH = 8;
  for (let k = 0; k < NH; k++) {
    const i = Math.floor((k + .5) / NH * N) % N, d = k % 2 ? 1 : -1, p = side(i, 13 * d), n = k % 2 ? 'cuphouse' : 'boxhouse', h = n === 'cuphouse' ? 9 : 9.5;
    const fr = faceRoad(p, i), litM = [];
    let lit;
    const H3 = n === 'boxhouse' ? cottage(p.x, p.z, fr, 'cottage-front', 'cottage-side', litM, 0) : cupCottage(p.x, p.z, fr, litM);
    const gl = new T.Sprite(glow(0xffb066, 0)); gl.position.set(p.x, h * .35, p.z); gl.scale.set(h * 1.6, h * 1.1, 1); scene.add(gl);
    const door = side(i, 6.5 * d), bea = new T.Group(); bea.position.set(door.x, 0, door.z); scene.add(bea);
    const col = new T.Mesh(new T.CylinderGeometry(1, 1, 30, 24, 1, true), new T.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: .14, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide })); col.position.y = 15; bea.add(col);
    const ring = new T.Mesh(new T.TorusGeometry(1.8, .1, 8, 48), new T.MeshBasicMaterial({ color: 0xff3b30 })); ring.rotation.x = Math.PI / 2; ring.position.y = .3; bea.add(ring);
    const smoke = []; for (let s = 0; s < 6; s++) { const m = new T.Sprite(new T.SpriteMaterial({ map: smokeTex, transparent: true, opacity: 0, depthWrite: false })); scene.add(m); smoke.push({ m, t: s / 6 }); }
    occ.push([p.x, p.z, 10]); houses.push({ litM, gl, bea, ring, col, smoke, p, h, door, L: 0, done: false }); solid.push([p.x, p.z, 5.2]);
  }

  forest();
  // the gondola line high over the valley
  const cable = [new T.Vector3(-260, 70, -150), new T.Vector3(260, 92, -40)];
  scene.add(new T.Line(new T.BufferGeometry().setFromPoints(cable), new T.LineBasicMaterial({ color: 0x1a2234 })));
  const gondolas = [0, .33, .66].map(u => { const s = prop('gondola', 7, 0, 0, null, false); return { s, u }; });

  // ---------- the truck: the photographic rear view, its lights and the golden tracks it leaves ----------
  const truck = new T.Group(); scene.add(truck);
  const rear = new T.Group(); truck.add(rear);
  { const L = 12.6, H = L * 412 / 1292, X = 1.3, red = new T.MeshLambertMaterial({ color: 0xc0000a }), chrome = new T.MeshPhongMaterial({ color: 0xc9d2de, shininess: 100, specular: 0xffffff });
    const z = px => (px / 1292 - .5) * L, y = py => (412 - py) / 412 * H;
    const img = new Image(); img.onload = () => {
      const mk = flip => { const c = document.createElement('canvas'); c.width = 1292; c.height = 412; const x = c.getContext('2d');
        if (flip) { x.translate(1292, 0); x.scale(-1, 1); } x.drawImage(img, 0, 0); x.setTransform(1, 0, 0, 1, 0, 0);
        if (flip) { const g = x.createLinearGradient(0, 40, 0, 290); g.addColorStop(0, '#d8121c'); g.addColorStop(1, '#b4000a'); x.fillStyle = g; x.fillRect(1292 - 720, 70, 480, 175); const lg = new Image(); lg.onload = () => { x.drawImage(lg, 1292 - 705, 85, 450, 450 * lg.height / lg.width); t.needsUpdate = true; }; lg.src = 'img/logo-white.png'; }
        const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 8; return t; };
      for (const [s, flip] of [[-1, false], [1, true]]) { const p = new T.Mesh(new T.PlaneGeometry(L, H), new T.MeshLambertMaterial({ map: mk(flip), transparent: true, alphaTest: .08, emissive: 0x220000 })); p.rotation.y = s * Math.PI / 2; p.position.set(s * X, H / 2, 0); rear.add(p); } };
    img.src = 'img/truck.webp';
    const box = (w, h, d, zc, yc, m) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(0, yc, zc); rear.add(b); return b; };
    const tb = new T.TextureLoader().load('img/g/truckrear.webp'); tb.encoding = T.sRGBEncoding; tb.repeat.set(.62, .6); tb.offset.set(.19, .4);
    const back = new T.MeshLambertMaterial({ map: tb, emissive: 0x1a0000 });
    box(X * 2 - .04, y(10) - y(300), z(855) - z(0), (z(855) + z(0)) / 2, (y(10) + y(300)) / 2, [red, red, red, red, red, red]);
    box(2.2, y(95) - y(305), z(1120) - z(860), (z(1120) + z(860)) / 2, (y(95) + y(305)) / 2, red);
    box(1.95, y(215) - y(330), z(1285) - z(1120), (z(1285) + z(1120)) / 2, (y(215) + y(330)) / 2, red);
    // from behind it keeps the photographic rear the visitor liked: the full rear photo stands on the back of the trailer
    { const rp = new T.Mesh(new T.PlaneGeometry(1, 1).translate(0, .5, 0), new T.MeshLambertMaterial({ map: tb, transparent: true, alphaTest: .06, emissive: 0x1a0000 })); tb.repeat.set(1, 1); tb.offset.set(0, 0); rp.scale.set(4.2, 4.1, 1); rp.rotation.y = Math.PI; rp.position.set(0, 0, z(0) - .04); rear.add(rp); }
    const grille = box(1.2, .9, .05, z(1290), y(275), chrome);
    const wind = box(2.0, .55, .05, z(1118), y(170), new T.MeshPhongMaterial({ color: 0x0b1424, shininess: 120, specular: 0x8899bb })); wind.rotation.x = -.15;
    for (const s of [-1, 1]) { const st = new T.Mesh(new T.CylinderGeometry(.09, .09, 2.4, 10), chrome); st.position.set(s * .95, y(150), z(935)); rear.add(st); }
    const tire = new T.MeshLambertMaterial({ color: 0x14161b }); for (const px of [300, 412, 693, 1135]) for (const s of [-1, 1]) { const w = new T.Mesh(new T.CylinderGeometry(.52, .52, .45, 20), tire); w.rotation.z = Math.PI / 2; w.position.set(s * 1.05, y(360), z(px)); rear.add(w); }
    for (const s of [-.95, .95]) { const t = new T.Mesh(new T.BoxGeometry(.35, .18, .05), new T.MeshBasicMaterial({ color: 0xff2a20 })); t.position.set(s, y(292), z(0) - .03); rear.add(t); const h2 = new T.Mesh(new T.CircleGeometry(.17, 16), new T.MeshBasicMaterial({ color: 0xfff3d8 })); h2.position.set(s * .8, y(298), z(1292) + .01); rear.add(h2); }
    { const n = 2 * 44, b = new T.InstancedMesh(new T.SphereGeometry(.06, 6, 4), new T.MeshBasicMaterial({ color: 0xffc46a }), n), m = new T.Matrix4(); let k = 0;
      for (const s of [-1, 1]) for (let i = 0; i < 44; i++) { m.makeTranslation(s * (X + .02), y(12), z(0) + (i + .5) * (z(855) - z(0)) / 44); b.setMatrixAt(k++, m); } rear.add(b); }
    rear.position.z = -1.2; }
  const beam = new T.SpotLight(0xfff0d0, 3, 70, .5, .55, 1.1); beam.position.set(0, 1.6, 6); beam.target.position.set(0, 0, 24); truck.add(beam, beam.target);
  const warm = new T.PointLight(0xffa860, 1.4, 20, 2); warm.position.set(0, 5, -1); truck.add(warm);

  const NT = PHONE ? 260 : 520, track = new T.InstancedMesh(new T.PlaneGeometry(.32, .62), new T.MeshBasicMaterial({ color: 0xffffff, map: glowTex, transparent: true, blending: T.AdditiveBlending, depthWrite: false }), NT);
  track.instanceMatrix.setUsage(T.DynamicDrawUsage); scene.add(track);
  const marks = []; let lastMark = null; const m4 = new T.Matrix4(), q = new T.Quaternion(), e3 = new T.Euler(), one = new T.Vector3(1, 1, 1), col = new T.Color(), tmp = new T.Vector3();
  for (let i = 0; i < NT; i++) { m4.makeScale(0, 0, 0); track.setMatrixAt(i, m4); track.setColorAt(i, col.setRGB(0, 0, 0)); }

  // ---------- falling snow ----------
  const NS = CALM ? 500 : PHONE ? 1300 : 2600, sp = new Float32Array(NS * 3); for (let i = 0; i < NS; i++) sp.set([rnd(-60, 60), rnd(0, 40), rnd(-60, 60)], i * 3);
  const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
  const snow = new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: .14, transparent: true, opacity: .85, depthWrite: false })); scene.add(snow);

  const motes = []; for (let i = 0; i < (PHONE ? 50 : 110); i++) { const s = new T.Sprite(glow(i % 4 ? 0xffd890 : 0xcfe8ff, 0)); const k = rnd(.18, .5); s.scale.set(k, k, 1); scene.add(s); motes.push({ s, x: rnd(-40, 40), y: rnd(.5, 14), z: rnd(-40, 40), ph: rnd(0, 6.28), v: rnd(.1, .4) }); }
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
  const view = { yaw: 0, pitch: .24, dist: 19, drag: null, idle: 0 };
  cv.addEventListener('pointerdown', e => { view.drag = [e.clientX, e.clientY, e.pointerId]; view.idle = 0; try { cv.setPointerCapture(e.pointerId); } catch (_) { } });
  cv.addEventListener('pointermove', e => { const d = view.drag; if (!d || d[2] !== e.pointerId) return; view.yaw -= (e.clientX - d[0]) * .0065; view.pitch = clamp(view.pitch + (e.clientY - d[1]) * .004, .04, 1.05); d[0] = e.clientX; d[1] = e.clientY; });
  const endDrag = () => { view.drag = null; }; cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
  cv.addEventListener('wheel', e => { e.preventDefault(); view.dist = clamp(view.dist + e.deltaY * .02, 7, 34); }, { passive: false });
  const cnt = $('#pcnt'), arrow = $('#parrow'), fin = $('#pfin');
  const music = new Audio('audio/truck.mp3'); music.loop = true; music.volume = .7;
  const setCount = () => cnt.textContent = `${S.done} / ${NH}`;
  function open() { root.hidden = false; document.documentElement.classList.add('playing'); S.on = true; size(); setCount(); try { const p = root.requestFullscreen && root.requestFullscreen(); p && p.catch && p.catch(() => { }); } catch (_) { } if (window.__site && window.__site.soundOn()) music.play().catch(() => { }); window.__playing = true; last = performance.now(); requestAnimationFrame(loop); }
  function close() { S.on = false; root.hidden = true; document.documentElement.classList.remove('playing'); music.pause(); window.__playing = false; if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); }
  function restart() { houses.forEach(o => { o.done = false; o.L = 0; o.bea.visible = true; }); S.done = 0; S.end = 0; fin.hidden = true; setCount(); }
  $('#pclose').addEventListener('click', close); $('#pagain').addEventListener('click', restart); $('#pexit').addEventListener('click', close);
  let lw = 0, lh = 0; function size() { const w = cv.clientWidth || innerWidth, h = cv.clientHeight || innerHeight; lw = w; lh = h; R.setPixelRatio(Math.min(PHONE ? 1.5 : 2, devicePixelRatio || 1)); R.setSize(w, h, false); if (comp) comp.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }

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
    truck.position.set(S.x, 0, S.z); truck.rotation.y = S.yaw; rear.rotation.z = -S.steer * clamp(S.v / 20, 0, 1) * .03; rear.position.y = Math.abs(S.v) > 1 ? Math.sin(tt * 18) * .015 : 0;
    // golden tracks on the snow behind the wheels, fading slowly
    if (Math.abs(S.v) > .5 && (!lastMark || Math.hypot(S.x - lastMark[0], S.z - lastMark[1]) > .55)) { lastMark = [S.x, S.z]; for (const sd of [-1.05, 1.05]) marks.push({ x: S.x + Math.cos(S.yaw) * sd - Math.sin(S.yaw) * 1.6, z: S.z - Math.sin(S.yaw) * sd - Math.cos(S.yaw) * 1.6, yaw: S.yaw, age: 0 }); while (marks.length > NT) marks.shift(); }
    for (let i = 0; i < marks.length; i++) { const m = marks[i]; m.age += dt; const k = Math.max(0, 1 - m.age / 9); e3.set(-Math.PI / 2, 0, m.yaw); q.setFromEuler(e3); m4.compose(tmp.set(m.x, .09, m.z), q, one); track.setMatrixAt(i, m4); const tw = .75 + .25 * Math.sin(tt * 9 + i * 1.3); track.setColorAt(i, col.setRGB(.95 * k * tw, .62 * k * tw, .22 * k * tw)); }
    track.instanceMatrix.needsUpdate = true; track.instanceColor.needsUpdate = true;
    // deliveries
    let near = null, nd = 1e9;
    for (const o of houses) { const d = Math.hypot(o.door.x - S.x, o.door.z - S.z); if (!o.done) { if (d < nd) { nd = d; near = o; } if (d < 7.5) { o.done = true; o.bea.visible = false; gift(o); } }
      o.ring.rotation.z += dt * .8; o.col.material.opacity = .11 + Math.sin(tt * 2.4) * .04;
      if (o.L > 0 && o.L < 1) o.L = Math.min(1, o.L + dt / 1.6);
      o.litM.forEach(m => m.emissive.setScalar(o.L * 1.15)); o.gl.material.opacity = o.L * (.5 + Math.sin(tt * 6 + o.p.x) * .03);
      o.smoke.forEach(s => { s.t = (s.t + dt * .14) % 1; s.m.position.set(o.p.x + Math.sin(s.t * 6 + o.p.z) * .5, o.h * .95 + s.t * 7, o.p.z); const k = 1.2 + s.t * 3.5; s.m.scale.set(k, k, 1); s.m.material.opacity = o.L * .45 * Math.sin(s.t * Math.PI); }); }
    for (let i = flying.length - 1; i >= 0; i--) { const f = flying[i]; f.t += dt / .9; const k = Math.min(1, f.t); f.g.position.lerpVectors(f.a, f.b, k); f.g.position.y += Math.sin(k * Math.PI) * 6; f.g.rotation.y += dt * 5;
      if (k >= 1) { flying.splice(i, 1); scene.remove(f.g); f.o.L = .001; S.done++; setCount(); if (S.done === NH) S.end = .001; } }
    if (S.end > 0) { S.end = Math.min(1, S.end + dt / 2.5); if (S.end > .6 && fin.hidden) fin.hidden = false; }
    lamps.forEach((g, i) => g.material.opacity = .55 + Math.sin(tt * 2 + i) * .05);
    gondolas.forEach(g => { g.u = (g.u + dt * .012) % 1; g.s.position.lerpVectors(cable[0], cable[1], g.u); g.s.position.y -= 7; });
    glassMat.uniforms.t.value = tt;
    for (const o of globes) { const pa = o.flakes.geometry.attributes.position, sp2 = Math.min(1, .25 + Math.abs(S.v) / 20);
      o.seeds.forEach((f, i) => { f.a += dt * f.s * .6 * sp2; f.y -= dt * .3 * f.s; if (f.y < o.fy + .2) { f.y = o.cy + o.R * .85; f.r = rnd(.2, o.R * .85); }
        const lim = Math.sqrt(Math.max(0, o.R * o.R - (f.y - o.cy) ** 2)) * .9, r = Math.min(f.r, lim); pa.setXYZ(i, Math.cos(f.a) * r, f.y, Math.sin(f.a) * r); }); pa.needsUpdate = true;
      o.fig.rotation.y = Math.atan2(cam.position.x - o.G.position.x, cam.position.z - o.G.position.z); }
    sparks.forEach(p => { p.a += dt * .35; p.y += dt * p.v; if (p.y > 12) p.y = 1; p.s.position.set(p.x + Math.cos(p.a) * p.r, p.y, p.z + Math.sin(p.a) * p.r); p.s.material.opacity = Math.max(0, Math.sin(tt * 3 + p.ph)) * .9 * Math.sin(p.y / 12 * Math.PI); });
    // edge arrow toward the nearest dark house
    if (near) { tmp.copy(near.door).setY(2).project(cam); const behind = tmp.z > 1, ox = behind ? -tmp.x : tmp.x, oy = behind ? -tmp.y : tmp.y, inView = !behind && Math.abs(tmp.x) < .85 && Math.abs(tmp.y) < .8;
      arrow.hidden = inView; if (!inView) { const a = Math.atan2(-oy, ox); arrow.style.left = (50 + Math.cos(a) * 36) + '%'; arrow.style.top = (50 + Math.sin(a) * 40) + '%'; arrow.style.transform = `translate(-50%,-50%) rotate(${a}rad)`; }
      $('#pdist').textContent = Math.round(nd) + ' მ'; } else arrow.hidden = true;
    // chase camera
    if (!view.drag && Math.abs(S.v) > 2) { view.yaw *= Math.pow(.25, dt); view.pitch += (.2 - view.pitch) * Math.min(1, dt * 1.5); }
    { const a = S.yaw + view.yaw, hd = view.dist * Math.cos(view.pitch); camPos.set(S.x - Math.sin(a) * hd, 2.4 + view.dist * Math.sin(view.pitch) + S.v * .03, S.z - Math.cos(a) * hd); }
    cam.position.lerp(camPos, view.drag ? 1 : 1 - Math.pow(.02, dt)); camLook.set(S.x + Math.sin(S.yaw) * 3, 2.6, S.z + Math.cos(S.yaw) * 3); cam.lookAt(camLook);
    for (const c of cards) c.rotation.y = Math.atan2(cam.position.x - c.position.x, cam.position.z - c.position.z);
    const p = snow.geometry.attributes.position; for (let i = 0; i < NS; i++) { let y = p.getY(i) - dt * (2.2 + (i % 5) * .3); if (y < 0) y += 40; p.setY(i, y); p.setX(i, p.getX(i) + Math.sin(tt + i) * .004); } p.needsUpdate = true; snow.position.set(S.x, 0, S.z);
    for (const m of motes) { m.y += dt * m.v; if (m.y > 15) m.y = .5; const x = S.x + m.x + Math.sin(tt * .4 + m.ph) * 2, z = S.z + m.z + Math.cos(tt * .3 + m.ph) * 2; m.s.position.set(x, m.y, z); m.s.material.opacity = (Math.sin(tt * 1.7 + m.ph) * .5 + .5) * .7; }
    if (comp) comp.render(); else R.render(scene, cam); requestAnimationFrame(loop);
  }
  let comp = null;
  const add = s => new Promise((ok, no) => { const e = document.createElement('script'); e.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/' + s; e.onload = ok; e.onerror = no; document.head.appendChild(e); });
  (async () => { try { for (const s of ['shaders/CopyShader.js', 'shaders/LuminosityHighPassShader.js', 'shaders/GammaCorrectionShader.js', 'postprocessing/EffectComposer.js', 'postprocessing/RenderPass.js', 'postprocessing/ShaderPass.js', 'postprocessing/UnrealBloomPass.js']) await add(s);
      comp = new T.EffectComposer(R); comp.addPass(new T.RenderPass(scene, cam)); const b = new T.UnrealBloomPass(new T.Vector2(innerWidth, innerHeight), PHONE ? .55 : .75, .55, .82); comp.addPass(b); comp.addPass(new T.ShaderPass(T.GammaCorrectionShader)); comp._b = b; size(); } catch (e) { comp = null; } })();
  window.__play = { open, close, S, side };
  open();
})();
