// Eiffel example world: ground, the tower, Paris blocks, the Seine, street with hotel/police, hotel salon, train, fence.
export default function buildWorld(api) {
const { THREE, P, scene, toon, unlit, add, tbox, frustum, cyl, sph, at, R, tree, building, facades, slates, hills } = api;
// ---------- world ----------
const W_ = {}; // handles driven by worldAt(f)
// ground
{
  const grassM = toon("grass", { map: P.grass() }); grassM.map.repeat.set(1, 1);
  const gg = new THREE.PlaneGeometry(9000, 9000); gg.rotateX(-Math.PI / 2); const uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 9000 / 6, uv.getY(i) * 9000 / 6);
  const ground = add(new THREE.Mesh(gg, grassM)); ground.castShadow = false; ground.position.set(0, 0, 1000);
  // Champ de Mars gravel + paths
  const grv = toon("gravel", { map: P.gravel() });
  const pl = tbox(70, 0.06, 300, grv, [6, 6]); at(pl, 0, 0.03, 150); pl.castShadow = false;
  const pl2 = tbox(90, 0.06, 90, grv, [6, 6]); at(pl2, 0, 0.035, 0); pl2.castShadow = false;
  const cob = toon("cobble", { map: P.cobble() });
  const st = tbox(30, 0.07, 90, cob, [3, 3]); at(st, 0, 0.04, 185); st.castShadow = false;
}
// ---- the Eiffel Tower (cartoon proportion, 132 m) ----
const tower = (parent, base = "#8b6a4c", rust = 0, key = "") => {
  const lat = toon("lat" + key + rust, { map: P.lattice(key + "a", base, 2, rust) });
  const latF = toon("latF" + key + rust, { map: P.lattice(key + "b", base, 3, rust) });
  const g = new THREE.Group(); parent.add(g);
  const legs = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    // curved leg: two frustum segments bending inward
    legs.push(frustum([sx * 25, sz * 25], [9, 9], 0, [sx * 17.5, sz * 17.5], [6.5, 6.5], 12, lat, [5, 5], g));
    frustum([sx * 17.5, sz * 17.5], [6.5, 6.5], 12, [sx * 13, sz * 13], [5.5, 5.5], 23, lat, [5, 5], g);
    frustum([sx * 12, sz * 12], [5, 5], 26, [sx * 6.5, sz * 6.5], [3.6, 3.6], 49, latF, [4, 4], g);
  }
  // arches under the first platform
  const archM = toon("arch" + key + rust, { color: new THREE.Color(base).multiplyScalar(0.92) });
  for (let i = 0; i < 4; i++) {
    const a = new THREE.Mesh(new THREE.TorusGeometry(15.5, 0.9, 6, 24, Math.PI), archM); add(a, g);
    a.rotation.y = (i * Math.PI) / 2; const d = 20.5; a.position.set(i === 1 ? d : i === 3 ? -d : 0, 4.5, i === 0 ? d : i === 2 ? -d : 0);
    a.scale.set(1, 1.05, 1);
  }
  const plat1 = tbox(36, 3.2, 36, latF, [6, 3.2], g); plat1.position.y = 24.6;
  const rail = toon("rail" + key, { color: new THREE.Color(base).multiplyScalar(0.7) });
  const r1 = tbox(37, 1.2, 37, rail, [4, 4], g); r1.position.y = 26.8; r1.scale.set(1, 1, 1);
  const plat2 = tbox(18, 2.6, 18, latF, [6, 2.6], g); plat2.position.y = 50.2;
  const r2 = tbox(19, 1, 19, rail, [4, 4], g); r2.position.y = 52;
  frustum([0, 0], [11, 11], 51.5, [0, 0], [3.6, 3.6], 118, latF, [3.5, 5], g);
  frustum([0, 0], [3.6, 3.6], 118, [0, 0], [4.6, 4.6], 121, latF, [3, 3], g);
  const top = tbox(4.4, 3, 4.4, rail, [2, 2], g); top.position.y = 122.5;
  const ant = cyl(0.25, 0.5, 9, rail, 8, g); ant.position.y = 128.5;
  return g;
};
W_.tower = tower(scene, "#8b6a4c", 0, "T");
// close-up rusty leg (swapped in during shot C) shares the tower; a rust overlay group sits on the same front leg
{
  const rustM = toon("lat_rust", { map: P.lattice("rust", "#8b6a4c", 2, 1.3) });
  const gR = new THREE.Group(); scene.add(gR); W_.rust = gR;
  frustum([25, 25], [9.06, 9.06], 0, [17.5, 17.5], [6.56, 6.56], 12, rustM, [5, 5], gR);
  frustum([17.5, 17.5], [6.56, 6.56], 12, [13, 13], [5.56, 5.56], 23, rustM, [5, 5], gR);
  gR.visible = false;
}
{
  // avenues flanking the Champ de Mars and blocks around; rows face the open ground
  let v = 0;
  for (let z = -30; z < 520; z += 46) for (const s of [-1, 1]) building(s * 62, z, s < 0 ? Math.PI / 2 : -Math.PI / 2, 12, 5, v++);
  for (let ring = 0; ring < 3; ring++) for (let z = -40; z < 900; z += 50) for (const s of [-1, 1]) {
    if (ring === 0 && z < 520) continue;
    building(s * (62 + ring * 48 + (ring ? 0 : 0)) + s * (ring ? 0 : 0), z + (ring % 2) * 20, s < 0 ? Math.PI / 2 : -Math.PI / 2, 12, 5 + (v % 2), v++, scene, ring === 0);
  }
  for (let ring = 1; ring < 4; ring++) for (let z = -40; z < 900; z += 52) for (const s of [-1, 1]) building(s * (62 + ring * 50), z + 10, s < 0 ? Math.PI / 2 : -Math.PI / 2, 12, 5, v++, scene, false);
  // across the river (north)
  for (let x = -600; x < 600; x += 46) for (let row = 0; row < 3; row++) building(x + row * 15, -150 - row * 40, 0, 12, 5 + ((x / 46 + row) & 1), v++, scene, row === 0);
}
// the Seine
{
  const wm = toon("water", { map: P.water(), color: "#ffffff" });
  const riv = tbox(3000, 0.1, 60, wm, [14, 14]); at(riv, 0, -0.9, -95); riv.castShadow = false;
  const emb = toon("emb", { map: P.gravel(), color: "#d8ccb6" });
  for (const z of [-63, -127]) { const e = tbox(3000, 2.2, 4, toon("embS", { color: "#cdbfa3" }), [4, 4]); at(e, 0, -0.1, z); }
  const ground2 = tbox(3000, 0.2, 60, emb, [8, 8]); at(ground2, 0, -1.0, -95); ground2.visible = false;
  // dig the river: dark bank faces
  W_.water = riv;
}
for (let z = 60; z < 520; z += 11) for (const s of [-1, 1]) tree(s * 40, z, 1.1);
for (let z = -20; z < 520; z += 13) for (const s of [-1, 1]) tree(s * 50, z + 5, 1.0);
hills(0, 1000);
// ---- street set (z 150-215): hotel on the right, police on the left ----
{
  const hotelM = toon("hotelF", { map: P.facade("hotel", "#f2e6cc", "#3f5f7a", true) });
  const hg = new THREE.Group(); hg.position.set(14, 0, 182); scene.add(hg);
  const hb = tbox(13, 18, 40, hotelM, [3.2, 3.4], hg); hb.position.set(6.5, 13, 0);
  const ent = tbox(1, 4.6, 40, toon("hotelShop", { map: P.shopfront("hotel", "#6a2430") }), [6.4, 4.6], hg); ent.position.set(0.3, 2.3, 0);
  const awn = tbox(2.4, 0.3, 8, toon("awn", { color: "#b8262e" }), [2, 2], hg); awn.position.set(-0.9, 4.8, 0); awn.rotation.z = -0.2;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.6), unlit("hotelSign", { map: P.signTex("hotel", "GRAND HÔTEL", "#6a2430", "#f6e7c0", 768, 128) }));
  add(sign, hg); sign.position.set(-0.25, 5.9, 0); sign.rotation.y = -Math.PI / 2;
  frustum([6.5, 0], [13.2, 40.2], 22, [6.5, 0], [9, 36], 26, slates, [3.2, 3.2], hg);
  W_.hotelDoor = hg;
  const pg = new THREE.Group(); pg.position.set(-14, 0, 176); scene.add(pg);
  const pb = tbox(13, 15, 30, facades[3], [3.2, 3.4], pg); pb.position.set(-6.5, 11.1, 0);
  const pf = tbox(1, 3.6, 30, toon("polShop", { map: P.shopfront("pol", "#2f4f7a") }), [6.4, 3.6], pg); pf.position.set(-0.3, 1.8, 0);
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.3), unlit("polSign", { map: P.signTex("police", "POLICE", "#1f3d6b", "#f4ead2") }));
  add(ps, pg); ps.position.set(0.25, 4.5, -3); ps.rotation.y = Math.PI / 2;
  const lamp = sph(0.35, unlit("lampB", { color: "#7fb6ff" }), pg); lamp.position.set(0.8, 4.4, -6.2);
  frustum([-6.5, 0], [13.2, 30.2], 18.6, [-6.5, 0], [9, 26], 22.5, slates, [3.2, 3.2], pg);
  // street lamps + benches
  const ironM = toon("iron", { color: "#2a2c33" });
  for (const z of [158, 172, 196, 210]) for (const s of [-1, 1]) {
    if (s < 0 && z === 172) continue;
    const pst = cyl(0.08, 0.12, 4.2, ironM, 6); at(pst, s * 6.2, 2.1, z);
    const lt = sph(0.32, unlit("lampY", { color: "#ffe6a6" })); at(lt, s * 6.2, 4.4, z); lt.userData.kind = "world";
  }
  for (const z of [164, 202]) for (const s of [-1, 1]) tree(s * 7.8, z, 0.8);
}
// ---- the hotel salon (interior, at x = 1000) ----
{
  const X = 1000, gS = new THREE.Group(); gS.position.set(X, 0, 0); scene.add(gS); W_.salon = gS;
  const wallM = toon("panel", { map: P.panel("a") }), floorM = toon("carpet", { map: P.carpet() }), park = toon("parquet", { map: P.parquet() });
  const fl = tbox(16, 0.2, 16, park, [3, 3], gS); fl.position.y = -0.1;
  const cp = tbox(8, 0.04, 12, floorM, [4, 4], gS); cp.position.y = 0.02; cp.castShadow = false;
  const back = tbox(16, 7, 0.4, wallM, [3.2, 7], gS); back.position.set(0, 3.5, -7);
  const front = tbox(16, 7, 0.4, wallM, [3.2, 7], gS); front.position.set(0, 3.5, 9); front.userData.cull = true;
  const left = tbox(0.4, 7, 16, wallM, [3.2, 7], gS); left.position.set(-6, 3.5, 1);
  const right = tbox(0.4, 7, 16, wallM, [3.2, 7], gS); right.position.set(6, 3.5, 1);
  const ceil = tbox(16, 0.3, 16, toon("ceil", { color: "#f4e9d0" }), [4, 4], gS); ceil.position.set(0, 7.1, 1);
  // tall windows with bright daylight on the left wall
  for (const z of [-3.5, 1, 5.5]) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.8), unlit("winGlow", { color: new THREE.Color("#fff2cf").multiplyScalar(1.4) }));
    add(win, gS, "world"); win.position.set(-5.78, 3.4, z); win.rotation.y = Math.PI / 2; win.castShadow = false;
    const fr = tbox(0.12, 4.1, 2.5, toon("winFr", { color: "#c8a24a" }), [2, 2], gS); fr.position.set(-5.74, 3.4, z); fr.scale.set(1, 1, 1); fr.castShadow = false;
    fr.material = toon("winFr", {}); // gold frame behind glow (thin)
    for (const dz of [-1.55, 1.55]) { const cur = tbox(0.3, 5, 0.8, toon("curtain", { color: "#a3283a" }), [1, 2], gS); cur.position.set(-5.6, 3.6, z + dz); }
  }
  // table along z
  const tbl = tbox(1.9, 0.12, 6.4, toon("cloth", { map: P.cloth() }), [2, 2], gS); tbl.position.set(0, 0.95, -0.4);
  const skirt = tbox(1.94, 0.5, 6.44, toon("cloth2", { color: "#285c44" }), [2, 2], gS); skirt.position.set(0, 0.68, -0.4);
  for (const sx of [-0.85, 0.85]) for (const sz of [-3.4, 2.6]) { const l = tbox(0.12, 0.9, 0.12, toon("tleg", { color: "#5a3a22" }), [1, 1], gS); l.position.set(sx, 0.45, sz); }
  // chairs
  for (const sz of [-2.3, -0.4, 1.5]) for (const sx of [-1.35, 1.35]) {
    const c = tbox(0.6, 0.1, 0.6, toon("chair", { color: "#8a2a34" }), [1, 1], gS); c.position.set(sx, 0.5, sz);
    const b = tbox(0.1, 1.1, 0.6, toon("chairB", { color: "#c8a24a" }), [1, 1], gS); b.position.set(sx * 1.25, 0.95, sz);
  }
  // chandelier
  const ch = new THREE.Group(); ch.position.set(0, 5.2, -0.4); gS.add(ch);
  const gold = toon("goldC", { color: "#d8b25a" });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 6, 24), gold); add(ring, ch); ring.rotation.x = Math.PI / 2;
  const rod = cyl(0.04, 0.04, 2, gold, 6, ch); rod.position.y = 1;
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, bulb = sph(0.13, unlit("bulb", { color: new THREE.Color("#fff0c0").multiplyScalar(1.6) }), ch, 8); bulb.position.set(Math.cos(a) * 1.1, 0.18, Math.sin(a) * 1.1); }
  // the little model tower on the table (pivot at its front base edge)
  const piv = new THREE.Group(); piv.position.set(0, 1.01, -2.45); gS.add(piv); W_.model = piv;
  const mt = new THREE.Group(); mt.position.set(0, 0, -0.16); mt.scale.setScalar(0.0062); piv.add(mt);
  tower(mt, "#b88a4a", 0, "M");
  const pedestal = tbox(0.4, 0.04, 0.4, toon("ped", { color: "#3a2a20" }), [1, 1], gS); pedestal.position.set(0, 1.03, -2.61);
  // papers + ink stand
  const pap = tbox(0.42, 0.01, 0.3, toon("paper", { color: "#f6ecd0" }), [1, 1], gS); pap.position.set(0.45, 1.02, -2.9); pap.rotation.y = 0.2;
  // a painting on the back wall: the tower
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.2), unlit("pic", { map: P.ctex("picture", 256, 320, (g) => {
    g.fillStyle = "#c8a24a"; g.fillRect(0, 0, 256, 320); g.fillStyle = "#9fc4e6"; g.fillRect(16, 16, 224, 288);
    g.fillStyle = "#79a84a"; g.fillRect(16, 250, 224, 54); g.fillStyle = "#6b4a32";
    g.beginPath(); g.moveTo(70, 270); g.lineTo(122, 40); g.lineTo(134, 40); g.lineTo(186, 270); g.lineTo(160, 270); g.lineTo(128, 150); g.lineTo(96, 270); g.closePath(); g.fill();
  }, { repeat: false }) }));
  add(pic, gS, "world"); pic.position.set(0, 4.2, -6.78); pic.castShadow = false;
  // doorway glow on the right wall
}
// ---- countryside + train (z ~ 2500) ----
{
  const gT = new THREE.Group(); gT.position.set(0, 0, 2500); scene.add(gT);
  const tr = tbox(4000, 0.3, 4, toon("rails", { map: P.rails() }), [4, 4], gT); tr.position.y = 0.15; tr.castShadow = false; tr.rotation.y = 0;
  // rotate rail UVs: rails texture runs along x already (sleepers vertical stripes)
  const bed = tbox(4000, 0.5, 7, toon("ballast", { color: "#a8987e" }), [4, 4], gT); bed.position.y = -0.1; bed.castShadow = false;
  for (let i = 0; i < 160; i++) { const x = -1400 + i * 18 + R() * 8, side = R() < 0.5 ? -1 : 1; tree(x, 2500 + side * (14 + R() * 40) + (side > 0 ? 30 : 0), 0.9 + R() * 0.7); }
  const hm = [toon("hillA", {}), toon("hillB", {}), toon("hillC", {})];
  for (let i = 0; i < 40; i++) { const s = sph(60 + R() * 70, hm[i % 3], gT, 14); s.position.set(-1600 + i * 80 + R() * 40, -30, 160 + R() * 260); s.scale.y = 0.55; }
  // the train: locomotive + 3 carriages, moves along +x
  const train = new THREE.Group(); gT.add(train); W_.train = train;
  const loco = new THREE.Group(); train.add(loco); loco.position.x = 19;
  const green = toon("locoG", { color: "#2f5a44" }), black = toon("locoK", { color: "#2a2a30" }), red = toon("locoR", { color: "#b8323a" }), brass = toon("brass", { color: "#d8b25a" });
  const boil = cyl(1.25, 1.25, 8, green, 18, loco); boil.rotation.z = Math.PI / 2; boil.position.set(1, 2.6, 0);
  const cab = tbox(3.4, 3.4, 3, green, [2, 2], loco); cab.position.set(-4.4, 3.1, 0);
  const roof = tbox(4, 0.3, 3.4, black, [2, 2], loco); roof.position.set(-4.4, 4.95, 0);
  const stack = cyl(0.55, 0.4, 1.8, black, 12, loco); stack.position.set(4, 4.4, 0);
  const dome = sph(0.6, brass, loco, 10); dome.position.set(1, 3.9, 0);
  const smoke = new THREE.Object3D(); smoke.position.set(4, 5.4, 2500); W_.stackLocal = [4 + 19, 5.6, 0];
  for (const x of [-4.6, -2.4, 0.2, 2.6]) for (const z of [-1.1, 1.1]) { const w = cyl(0.8, 0.8, 0.25, red, 14, loco); w.rotation.x = Math.PI / 2; w.position.set(x, 0.85, z); }
  const frame = tbox(11, 0.5, 2.4, black, [2, 2], loco); frame.position.set(0, 1.3, 0);
  const cow = frustum([5.6, 0], [0.4, 2.6], 0.4, [6.4, 0], [0.2, 2.2], 1.4, red, [1, 1], loco);
  const carM = toon("carriage", { map: P.carriage() });
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Group(); train.add(c); c.position.x = 6 - i * 13.2;
    const body = tbox(12.4, 3.2, 3, carM, [12.4 / 2.4, 3.2], c); body.position.set(0, 2.7, 0);
    const rf = tbox(12.8, 0.35, 3.3, black, [2, 2], c); rf.position.set(0, 4.45, 0);
    for (const x of [-4.4, 4.4]) for (const z of [-1.1, 1.1]) { const w = cyl(0.55, 0.55, 0.22, black, 12, c); w.rotation.x = Math.PI / 2; w.position.set(x, 0.7, z); }
  }
}
// ---- iron fence in front of the tower (ending) ----
{
  const ironM = toon("iron", { color: "#2a2c33" }), gold = toon("goldTip", { color: "#d8b25a" });
  for (let x = -18; x <= 18; x += 0.55) { const p = cyl(0.035, 0.035, 1.25, ironM, 5); at(p, x, 0.62, 40); const tip = sph(0.06, gold, scene, 5); at(tip, x, 1.28, 40); }
  for (const y of [0.25, 1.05]) { const r = tbox(36.4, 0.07, 0.07, ironM, [2, 2]); at(r, 0, y, 40); }
}
W_.salon.traverse((o) => { if (o.isMesh && (o.geometry.parameters?.height === 7 || o.geometry.parameters?.width === 16 || o.geometry.parameters?.depth === 16)) o.castShadow = false; });
return { update(st, f) {
  W_.rust.visible = !!st.rust;
  W_.model.rotation.x = st.modelTip || 0;
  W_.train.position.x = st.trainX || 0;
  W_.water.material.map.offset.x = f * 0.0015;
} };
}
