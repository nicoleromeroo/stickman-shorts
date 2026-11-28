// Generic 3D cartoon engine: toon world + camera-facing 2D character cards + ink + lens blur + grade + HUD text.
// A video page calls start(S, buildWorld): S = story module (FRAMES, shotAt, camAt, dofAt, flashAt, worldAt, actorsAt, hudAt?),
// buildWorld(api) builds the set and returns { update(state, f, shot) }.
import * as THREE from "./node_modules/three/build/three.module.js";
import * as P from "./paint.js";
import { Pen } from "./toonbase.js";
export { THREE, P };
export function start(S, buildWorld) {

const Q = new URLSearchParams(location.search);
const SC = +(Q.get("s") || 1), W = Math.round(1080 * SC), H = Math.round(1920 * SC);
const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false; renderer.autoClear = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 6000);

// ---------- toon materials ----------
const grad = (() => { const d = new Uint8Array([105, 105, 105, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const matCache = new Map();
const toon = (key, o = {}) => {
  if (matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ gradientMap: grad, color: o.color ?? 0xffffff, map: o.map ?? null, emissive: o.emissive ?? 0x000000, side: o.side ?? THREE.FrontSide });
  m.userData.ink = o.ink ?? true; matCache.set(key, m); return m;
};
const unlit = (key, o = {}) => { if (matCache.has(key)) return matCache.get(key); const m = new THREE.MeshBasicMaterial({ color: o.color ?? 0xffffff, map: o.map ?? null, fog: o.fog ?? true, transparent: !!o.transparent, side: o.side ?? THREE.FrontSide }); matCache.set(key, m); return m; };

// ---------- ink contract: userData.kind = world (inked) | card | sky | soft (hidden in ND) ----------
const add = (mesh, parent = scene, kind = "world") => { mesh.userData.kind = kind; if (kind === "world") { mesh.castShadow = true; mesh.receiveShadow = true; } parent.add(mesh); return mesh; };
/** box with constant texel density: tile = metres per texture repeat [u, v] */
const tbox = (w, h, d, mat, tile = [4, 4], parent = scene) => {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / tile[0], uv.getY(k) * dims[f][1] / tile[1]); }
  const m = new THREE.Mesh(g, mat); return add(m, parent);
};
/** square frustum: base centre c0 size s0 at y0 -> top centre c1 size s1 at y1 (sizes [sx, sz]) */
const frustum = (c0, s0, y0, c1, s1, y1, mat, tile = [4, 4], parent = scene) => {
  const g = new THREE.BoxGeometry(1, 1, 1), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const t = p.getY(i) + 0.5, sx = THREE.MathUtils.lerp(s0[0], s1[0], t), sz = THREE.MathUtils.lerp(s0[1], s1[1], t);
    p.setXYZ(i, THREE.MathUtils.lerp(c0[0], c1[0], t) + p.getX(i) * sx, THREE.MathUtils.lerp(y0, y1, t), THREE.MathUtils.lerp(c0[1], c1[1], t) + p.getZ(i) * sz);
  }
  const hgt = Math.hypot(y1 - y0, Math.max(s0[0], s1[0]) * 0.3), wid = (s0[0] + s1[0]) / 2;
  for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * wid / tile[0], uv.getY(k) * hgt / tile[1]);
  g.computeVertexNormals();
  return add(new THREE.Mesh(g, mat), parent);
};
const cyl = (r0, r1, h, mat, seg = 16, parent = scene) => add(new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat), parent);
const sph = (r, mat, parent = scene, seg = 16) => add(new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg * 0.75), mat), parent);
const at = (m, x, y, z, ry = 0) => { m.position.set(x, y, z); m.rotation.y = ry; return m; };
const R = P.rng(4242);

// ---------- generic set pieces ----------
// ---- Paris blocks ----
const facades = [0, 1, 2, 3].map((i) => toon("fac" + i, { map: P.facade(i, ["#eadfc6", "#e3d2b3", "#efe4cf", "#dcc9a8"][i], ["#5f7d8c", "#6d7f5a", "#7d5a4a", "#55657a"][i], i !== 2) }));
const shopM = [0, 1, 2].map((i) => toon("shop" + i, { map: P.shopfront(i, ["#2f5f4a", "#7a2e3a", "#2f4f7a"][i]) }));
const slates = toon("slate", { map: P.slate() });
const chimM = toon("chim", { color: "#b5755a" });
const building = (x, z, ry, bays, floors, v, parent = scene, shop = true) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
  const w = bays * 3.2, h = floors * 3.4, d = 13;
  const b = tbox(w, h, d, facades[v % 4], [3.2, 3.4], g); b.position.y = h / 2 + (shop ? 3.6 : 0);
  if (shop) { const s = tbox(w, 3.6, d, shopM[v % 3], [6.4, 3.6], g); s.position.y = 1.8; }
  const top = h + (shop ? 3.6 : 0);
  const cor = tbox(w + 0.6, 0.5, d + 0.6, toon("cornice", { color: "#d9c9a8" }), [4, 4], g); cor.position.y = top + 0.25;
  frustum([0, 0], [w + 0.2, d + 0.2], top + 0.5, [0, 0], [w - 4, d - 5], top + 5, slates, [3.2, 3.2], g);
  for (let i = 0; i < Math.max(1, bays / 3); i++) { const c = tbox(0.9, 2.2, 1.6, chimM, [2, 2], g); c.position.set(-w / 2 + 2 + i * 6.4, top + 5.6, 1.5); }
  return g;
};
// trees: avenues + park
const trunkM = toon("trunk", { color: "#6a4a32" });
const leafM = [toon("leafA", { color: "#5f9a3c" }), toon("leafB", { color: "#4f8a3a" }), toon("leafC", { color: "#78ad48" })];
const autumnM = [toon("autA", { color: "#e0902c" }), toon("autB", { color: "#d6602e" }), toon("autC", { color: "#e8b53a" })];
const trees = [];
const tree = (x, z, s = 1, parent = scene) => {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  const t = cyl(0.22, 0.32, 3.6, trunkM, 7, g); t.position.y = 1.8;
  const k = trees.length % 3, c = sph(2.3, leafM[k], g, 10); c.position.y = 5; c.scale.set(1, 1.15, 1);
  const c2 = sph(1.6, leafM[(k + 1) % 3], g, 9); c2.position.set(1.2, 4.1, 0.6);
  trees.push({ g, crowns: [c, c2], k }); return g;
};
// far hills ring around a centre
const hills = (cx = 0, cz = 0, n = 26, r0 = 1400) => {
  const hm = [toon("hillA", { color: "#6f9a52" }), toon("hillB", { color: "#5d8a4a" }), toon("hillC", { color: "#7fa45a" })];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, r = r0 + R() * 600, s = sph(200 + R() * 180, hm[i % 3], scene, 14); at(s, cx + Math.cos(a) * r, -120 - R() * 60, cz + Math.sin(a) * r); s.scale.y = 0.45; s.castShadow = false; }
};
const api = { THREE, P, scene, camera, renderer, toon, unlit, add, tbox, frustum, cyl, sph, at, R, tree, trees, building, facades, shopM, slates, hills, leafM, autumnM };
const world = buildWorld(api) || {};
// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, sunK: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position = p.xyww; }`,
  fragmentShader: `uniform vec3 top,hor,sunCol,sunDir; uniform float sunK; varying vec3 vD;
    void main(){ float h = clamp(vD.y,0.,1.); vec3 c = mix(hor, top, pow(h,0.55)); float s = max(dot(normalize(vD), normalize(sunDir)),0.);
      c += sunCol*sunK*(smoothstep(0.9985,0.9993,s)*2.5 + pow(s,40.)*0.35); gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.kind = "sky"; sky.renderOrder = -10; sky.frustumCulled = false; scene.add(sky);
const clouds = [];
for (let i = 0; i < 18; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: P.cloudTex(i), transparent: true, depthWrite: false, fog: false }));
  const a = (i / 18) * Math.PI * 2; m.userData = { kind: "soft", a, r: 900 + (i % 4) * 160, y: 180 + (i % 5) * 45, s: 260 + (i % 3) * 90, seed: i };
  scene.add(m); clouds.push(m);
}
// ---------- lights ----------
const sun = new THREE.DirectionalLight(0xffffff, 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
const sc = sun.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.near = 1; sc.far = 400;
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xbfd4ff, 0x9a8a6a, 0.9); scene.add(hemi);
const amb = new THREE.AmbientLight(0xffffff, 0.35); scene.add(amb);
scene.fog = new THREE.Fog(0xb8d0ec, 60, 900);
const C = (h) => new THREE.Color(h);
const LIGHTS = {
  day: { az: 70, el: 46, sun: "#fff2dc", sunI: 2.1, sky: "#bcd2ff", ground: "#a89878", hemiI: 0.85, amb: 0.3, top: "#3e7fd2", hor: "#b8d0ec", fog: [80, 1300], card: "#ffffff", sat: 1.1, gain: 1.0, lift: [0.01, 0.012, 0.03], sunK: 0.6, cloud: P.CLOUD },
  autumn: { az: 60, el: 34, sun: "#ffe2b8", sunI: 2.0, sky: "#c4d0f0", ground: "#b09070", hemiI: 0.85, amb: 0.3, top: "#5a86c8", hor: "#dcd6d0", fog: [70, 1100], card: "#fff6ea", sat: 1.08, gain: 1.0, lift: [0.02, 0.012, 0.03], sunK: 0.5, cloud: P.CLOUD },
  golden: { az: 8, el: 9, sun: "#ffb36b", sunI: 2.6, sky: "#9a8ad0", ground: "#c08a70", hemiI: 0.9, amb: 0.28, top: "#f0a070", hor: "#ffd08a", fog: [60, 1000], card: "#ffe8d0", sat: 1.12, gain: 1.0, lift: [0.03, 0.02, 0.05], sunK: 1.0, cloud: P.CLOUD_GOLD },
  interior: { az: -100, el: 30, sun: "#fff0d0", sunI: 1.6, sky: "#ffe6c0", ground: "#a05a40", hemiI: 0.75, amb: 0.45, top: "#fff2cf", hor: "#fff2cf", fog: [400, 3000], card: "#fff4e4", sat: 1.06, gain: 1.0, lift: [0.02, 0.015, 0.01], sunK: 0, cloud: P.CLOUD },
};
let curLight = null;
const applyLight = (key, target, camPos) => {
  const L = LIGHTS[key];
  if (curLight !== key) {
    curLight = key;
    sun.color.set(L.sun); sun.intensity = L.sunI; hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemiI; amb.intensity = L.amb;
    skyU.top.value.set(L.top); skyU.hor.value.set(L.hor); skyU.sunCol.value.set(L.sun); skyU.sunK.value = L.sunK;
    scene.fog.color.set(L.hor); scene.fog.near = L.fog[0]; scene.fog.far = L.fog[1];
    for (const c of clouds) c.material.map = P.cloudTex(c.userData.seed, L.cloud);
    for (const t of trees) t.crowns.forEach((c, i) => (c.material = (key === "autumn" ? autumnM : leafM)[(t.k + i) % 3]));
  }
  const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el);
  const dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
  sun.target.position.set(...target); sun.position.copy(sun.target.position).addScaledVector(dir, 200);
  skyU.sunDir.value.copy(dir);
  sky.position.copy(camPos);
  return L;
};

// ---------- cards ----------
const cardGeo = new THREE.PlaneGeometry(1, 1); cardGeo.translate(0, 0.5, 0);
const flatGeo = new THREE.PlaneGeometry(1, 1); flatGeo.rotateX(-Math.PI / 2);
const blobTex = P.ctex("blob", 128, 64, (g) => { const gr = g.createRadialGradient(64, 32, 4, 64, 32, 62); gr.addColorStop(0, "rgba(30,16,40,0.55)"); gr.addColorStop(0.6, "rgba(30,16,40,0.35)"); gr.addColorStop(1, "rgba(30,16,40,0)"); g.save(); g.scale(1, 0.5); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.restore(); }, { repeat: false, srgb: false });
const cards = new Map();
const ndCardMat = (map) => new THREE.ShaderMaterial({ uniforms: { map: { value: map } }, vertexShader: `varying vec2 vUv; varying float vZ; void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.); vZ=-mv.z; gl_Position=projectionMatrix*mv; }`, fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vZ; void main(){ if(texture2D(map,vUv).a<0.5) discard; gl_FragColor=vec4(0.,0.,0.,vZ); }`, side: THREE.DoubleSide });
const getCard = (id) => {
  if (cards.has(id)) return cards.get(id);
  const cv = document.createElement("canvas"); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const mat = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, side: THREE.DoubleSide, fog: true, transparent: false });
  const mesh = new THREE.Mesh(cardGeo, mat); mesh.userData.kind = "card"; mesh.castShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.5, side: THREE.DoubleSide });
  mesh.userData.nd = ndCardMat(tex);
  const blob = new THREE.Mesh(flatGeo, new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true, polygonOffset: true, polygonOffsetFactor: -2 }));
  blob.userData.kind = "soft"; blob.renderOrder = 1;
  scene.add(mesh, blob);
  const c = { cv, tex, mat, mesh, blob, key: null }; cards.set(id, c); return c;
};
const drawActors = (list, L) => {
  const seen = new Set();
  const tint = new THREE.Color(L.card);
  for (const a of list) {
    const c = getCard(a.id); seen.add(a.id);
    const cw = a.cw ?? 600, ch = a.ch ?? 1000, k = a.k ?? 1.3;
    if (c.key !== a.key) {
      const pw = Math.round(cw * k), ph = Math.round(ch * k);
      if (c.cv.width !== pw || c.cv.height !== ph) { c.cv.width = pw; c.cv.height = ph; c.tex.dispose(); }
      const g = c.cv.getContext("2d"); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, pw, ph); g.setTransform(k, 0, 0, k, 0, 0);
      a.draw(new Pen(g)); c.tex.needsUpdate = true; c.key = a.key;
    }
    const h = a.h, w = (h * cw) / ch, m = c.mesh;
    m.visible = true; m.material.color.copy(a.tint ? new THREE.Color(a.tint) : tint);
    m.castShadow = a.shadow !== false;
    const base = a.base ?? 0.025; // soles at 97.5 % of the card height
    if (a.flat) { m.geometry = flatGeo; m.scale.set(w, 1, h); m.position.set(...a.pos); m.rotation.set(0, a.rotY ?? 0, 0); }
    else {
      m.geometry = cardGeo; m.scale.set(w, h, 1); m.position.set(a.pos[0], a.pos[1] - base * h, a.pos[2]);
      const yaw = a.rotY ?? Math.atan2(camera.position.x - a.pos[0], camera.position.z - a.pos[2]);
      m.rotation.set(0, yaw, a.roll ?? 0);
    }
    if (a.blob !== false && !a.flat) { c.blob.visible = true; c.blob.position.set(a.pos[0], (a.ground ?? a.pos[1]) + 0.02, a.pos[2]); c.blob.scale.set(w * 0.9 * (a.blobW ?? 1), 1, w * 0.45 * (a.blobW ?? 1)); }
    else c.blob.visible = false;
  }
  for (const [id, c] of cards) if (!seen.has(id)) { c.mesh.visible = false; c.blob.visible = false; }
};

// ---------- render targets + post ----------
const rtOpt = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true };
const rtC = new THREE.WebGLRenderTarget(W, H, rtOpt), rtN = new THREE.WebGLRenderTarget(W, H, { ...rtOpt, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter }), rtI = new THREE.WebGLRenderTarget(W, H, { ...rtOpt, depthBuffer: false });
const ndWorld = new THREE.ShaderMaterial({ vertexShader: `varying vec3 vN; varying float vZ; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vZ=-mv.z; gl_Position=projectionMatrix*mv; }`, fragmentShader: `varying vec3 vN; varying float vZ; void main(){ vec3 n=normalize(vN); if(!gl_FrontFacing) n=-n; gl_FragColor=vec4(n*0.5+0.5, vZ); }`, side: THREE.DoubleSide });
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), qScene = new THREE.Scene(), qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); qScene.add(quad); quad.frustumCulled = false;
const VQ = `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
const inkMat = new THREE.ShaderMaterial({
  uniforms: { tC: { value: rtC.texture }, tN: { value: rtN.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 2.6 * SC }, flash: { value: 0 }, sat: { value: 1 }, gain: { value: 1 }, lift: { value: new THREE.Vector3() }, vig: { value: 0.22 }, toScreen: { value: 0 } },
  vertexShader: VQ,
  fragmentShader: `uniform sampler2D tC,tN; uniform vec2 res; uniform float px,flash,sat,gain,vig; uniform vec3 lift; varying vec2 vUv;
  vec4 N(vec2 o){ return texture2D(tN, vUv + o/res); }
  void main(){
    vec4 c0 = N(vec2(0.)); float d0 = c0.a; bool card0 = dot(c0.rgb,c0.rgb) < 0.01; vec3 n0 = c0.rgb*2.-1.;
    float e = 0.;
    if(!card0 && d0 < 5000.){
      for(int i=0;i<8;i++){ float a = float(i)*0.785398; vec2 o = vec2(cos(a),sin(a))*px;
        vec4 s = N(o); if(dot(s.rgb,s.rgb) < 0.01) continue; float d = s.a;
        if(d - d0 > max(0.03*d0, 0.12)) e = 1.;
        vec3 n = s.rgb*2.-1.; if(abs(d-d0) < 0.08*d0 + 0.1 && dot(n,n0) < 0.82) e = max(e, 0.85);
      }
      e *= 1. - 0.75*smoothstep(260., 1100., d0);
    }
    vec3 col = texture2D(tC, vUv).rgb;
    col = mix(col, vec3(0.012,0.010,0.014), e);
    float l = dot(col, vec3(0.2126,0.7152,0.0722)); col = mix(vec3(l), col, sat); col = col*gain + lift;
    vec2 q = vUv-0.5; col *= 1. - vig*dot(q*vec2(1.1,0.8),q*vec2(1.1,0.8))*2.2;
    col = mix(col, vec3(1.), flash);
    gl_FragColor = linearToOutputTexel(vec4(col,1.));
  }`,
});
const dofMat = new THREE.ShaderMaterial({
  uniforms: { tI: { value: rtI.texture }, tN: { value: rtN.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cInf: { value: 0 } },
  vertexShader: VQ,
  fragmentShader: `uniform sampler2D tI,tN; uniform vec2 res; uniform float focus,cInf; varying vec2 vUv;
  float coc(float d){ float k = 1. - focus/max(d,0.01); return k > 0. ? cInf*k : min(cInf*1.6, -k*cInf*0.9); }
  void main(){
    float d0 = texture2D(tN,vUv).a; float c0 = coc(d0);
    vec3 acc = texture2D(tI,vUv).rgb; float wsum = 1.;
    if(c0 > 0.6){
      for(int i=1;i<48;i++){ float fi=float(i); float r = sqrt(fi/48.)*c0; float a = fi*2.39996;
        vec2 o = vec2(cos(a),sin(a))*r; vec2 uv = vUv + o/res;
        float ds = texture2D(tN,uv).a; float cs = coc(ds);
        float w = (cs >= r*0.85 || ds > d0) ? 1. : 0.;
        acc += texture2D(tI,uv).rgb*w; wsum += w; }
    }
    gl_FragColor = linearToOutputTexel(vec4(acc/wsum,1.));
  }`,
});
inkMat.toneMapped = false; dofMat.toneMapped = false;

const ndPass = () => {
  const saved = [];
  scene.traverse((o) => {
    if (!o.isMesh) return;
    const k = o.userData.kind;
    if (k === "sky" || k === "soft") { saved.push([o, o.material, o.visible]); o.visible = false; return; }
    saved.push([o, o.material, o.visible]);
    o.material = k === "card" ? o.userData.nd : ndWorld;
  });
  const fog = scene.fog; scene.fog = null;
  renderer.setRenderTarget(rtN); renderer.state.buffers.color.setClear(0.5, 0.5, 1.0, 10000.0, false); renderer.clear(true, true, false);
  renderer.render(scene, camera);
  scene.fog = fog;
  for (const [o, m, v] of saved) { o.material = m; o.visible = v; }
};

// ---------- frame ----------
const cullable = [];
scene.traverse((o) => { if (o.userData && o.userData.cull) cullable.push(o); });
window.renderFrame = (f) => {
  const shot = S.shotAt(f), cam = S.camAt(f);
  camera.position.set(...cam.pos); camera.up.set(0, 1, 0); camera.lookAt(...cam.look);
  camera.fov = cam.fov; camera.updateProjectionMatrix();
  if (cam.roll || cam.shake) { camera.rotateZ(THREE.MathUtils.degToRad(cam.roll || 0)); if (cam.shake) { camera.translateX(cam.shake[0] * 0.02); camera.translateY(cam.shake[1] * 0.02); } }
  camera.updateMatrixWorld();
  const L = applyLight(shot.light, shot.sunAt || cam.look, camera.position);
  const r = shot.shadowR || 30; if (sc.right !== r) { sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.updateProjectionMatrix(); }
  const st = S.worldAt(f);
  if (world.update) world.update(st, f, shot);
  for (const o of cullable) o.visible = shot.cullFront ? false : true;
  // clouds: billboard ring around the camera
  for (const c of clouds) { const u = c.userData, a = u.a + f * 0.00015; c.position.set(camera.position.x + Math.cos(a) * u.r, u.y, camera.position.z + Math.sin(a) * u.r); c.scale.set(u.s, u.s, 1); c.lookAt(camera.position.x, u.y, camera.position.z); c.visible = shot.light !== "interior"; }
  sky.visible = shot.light !== "interior";
  drawActors(S.actorsAt(f, camera.position), L);
  // passes
  renderer.shadowMap.needsUpdate = true;
  renderer.setRenderTarget(rtC); renderer.setClearColor(new THREE.Color(L.hor), 1); renderer.clear(); renderer.render(scene, camera);
  ndPass();
  const dof = S.dofAt(f);
  inkMat.uniforms.flash.value = S.flashAt(f); inkMat.uniforms.sat.value = L.sat; inkMat.uniforms.gain.value = L.gain; inkMat.uniforms.lift.value.set(...L.lift);
  quad.material = inkMat;
  if (dof.cInf > 0.5) {
    renderer.setRenderTarget(rtI); renderer.render(qScene, qCam);
    dofMat.uniforms.focus.value = dof.focus; dofMat.uniforms.cInf.value = dof.cInf * SC; quad.material = dofMat;
  }
  renderer.setRenderTarget(null); renderer.render(qScene, qCam);
  drawHud(S.hudAt ? S.hudAt(f) : []);
  return true;
};
// ---------- HUD text (big hook words, comment question, footnotes) drawn over the finished frame ----------
const out = document.createElement("canvas"); out.width = W; out.height = H; const og = out.getContext("2d");
let hudOn = false;
const drawHud = (items) => {
  hudOn = items && items.length > 0; if (!hudOn) return;
  og.clearRect(0, 0, W, H); og.drawImage(canvas, 0, 0);
  for (const it of items) {
    const a = it.alpha ?? 1; if (a <= 0) continue;
    const s = (it.size ?? 96) * SC * (it.scale ?? 1), x = (it.x ?? 540) * SC, y = (it.y ?? 260) * SC;
    og.save(); og.globalAlpha = a; og.translate(x, y); og.rotate(it.rot ?? 0);
    og.font = `${s}px ${HUD_FONT}`; og.textAlign = it.align ?? "center"; og.textBaseline = "middle";
    const lines = String(it.text).split("\n"), lh = s * 1.08;
    lines.forEach((ln, i) => {
      const yy = (i - (lines.length - 1) / 2) * lh;
      if (it.box) { const w = og.measureText(ln).width + s * 0.6; og.fillStyle = it.box; og.beginPath(); og.roundRect(-w / 2, yy - s * 0.62, w, s * 1.24, s * 0.25); og.fill(); }
      og.lineJoin = "round"; og.lineWidth = s * (it.strokeW ?? 0.16); og.strokeStyle = it.stroke ?? "#14101a"; og.strokeText(ln, 0, yy);
      og.fillStyle = it.color ?? "#ffffff"; og.fillText(ln, 0, yy);
    });
    og.restore();
  }
};
window.grab = (q = 0.95) => (hudOn ? out : canvas).toDataURL("image/jpeg", q);
window.FRAMES = S.FRAMES;
window.ready = true;
}
// Luckiest Guy from the stickman engine's fonts when available, else a heavy system font
let HUD_FONT = '"Arial Black", Impact, sans-serif';
try {
  const ff = new FontFace("Lucky", "url(/engine/node_modules/@fontsource/luckiest-guy/files/luckiest-guy-latin-400-normal.woff2)");
  ff.load().then((f) => { document.fonts.add(f); HUD_FONT = '"Lucky", "Arial Black", sans-serif'; }).catch(() => {});
} catch (e) {}
