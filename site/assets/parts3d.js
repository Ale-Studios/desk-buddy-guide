// Original, simplified 3D models of every component in the parts catalog.
// Built from primitives at approximately real size (1 unit = 1 mm), so they
// can be shown, rotated and compared without any third-party model files.
// Licence: CC BY-SA 4.0, part of the Desk Buddy Guide.
import * as THREE from "three";

// ---------- materials ----------
const M = {
  pcbGreen: new THREE.MeshStandardMaterial({ color: 0x1f6b3a, roughness: 0.6 }),
  pcbBlue: new THREE.MeshStandardMaterial({ color: 0x1d4fa8, roughness: 0.6 }),
  pcbBlack: new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.55 }),
  pcbPurple: new THREE.MeshStandardMaterial({ color: 0x5b2a86, roughness: 0.6 }),
  pcbRed: new THREE.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.6 }),
  pcbTeal: new THREE.MeshStandardMaterial({ color: 0x0f6f73, roughness: 0.6 }),
  chip: new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.4 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xc7ccd4, metalness: 0.85, roughness: 0.3 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd4a640, metalness: 0.9, roughness: 0.3 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.15, metalness: 0.2 }),
  screenOn: new THREE.MeshStandardMaterial({ color: 0x0b1b2c, emissive: 0x2a8cff, emissiveIntensity: 0.25, roughness: 0.2 }),
  oledOn: new THREE.MeshStandardMaterial({ color: 0x05070c, emissive: 0x6fe3ff, emissiveIntensity: 0.15, roughness: 0.2 }),
  white: new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.5 }),
  grey: new THREE.MeshStandardMaterial({ color: 0x8a919c, roughness: 0.5 }),
  darkGrey: new THREE.MeshStandardMaterial({ color: 0x3a3f48, roughness: 0.5 }),
  servoBlue: new THREE.MeshStandardMaterial({ color: 0x2a62d6, roughness: 0.45 }),
  servoBlack: new THREE.MeshStandardMaterial({ color: 0x202228, roughness: 0.45 }),
  horn: new THREE.MeshStandardMaterial({ color: 0xf4f4f0, roughness: 0.5 }),
  yellow: new THREE.MeshStandardMaterial({ color: 0xe9b32a, roughness: 0.5 }),
  orangeFlex: new THREE.MeshStandardMaterial({ color: 0xd9822b, roughness: 0.5 }),
  batteryBlue: new THREE.MeshStandardMaterial({ color: 0x2c5fbf, roughness: 0.4 }),
  silverPouch: new THREE.MeshStandardMaterial({ color: 0xb9bec7, metalness: 0.5, roughness: 0.35 }),
  red: new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.5 }),
  ledRed: new THREE.MeshStandardMaterial({ color: 0x400, emissive: 0xff2a2a, emissiveIntensity: 0.6 }),
  cone: new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.8 }),
  mesh: new THREE.MeshStandardMaterial({ color: 0xd9dde3, metalness: 0.6, roughness: 0.5 }),
};

// ---------- helpers ----------
const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
const cyl = (r, h, mat, x = 0, y = 0, z = 0, seg = 32) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat); m.position.set(x, y, z); return m; };
const group = (...items) => { const g = new THREE.Group(); items.flat().forEach((i) => g.add(i)); return g; };

// A board lying flat: w (x) × d (z), thickness 1.6 mm, top surface at y = 1.6
const pcb = (w, d, mat = M.pcbGreen) => box(w, 1.6, d, mat, 0, 0.8, 0);
// A row of pin headers along x at depth z
function pins(n, z, pitch = 2.54, down = true, x0 = null) {
  const g = new THREE.Group();
  const start = x0 ?? -((n - 1) * pitch) / 2;
  for (let i = 0; i < n; i++) {
    const x = start + i * pitch;
    g.add(box(2.4, 2.5, 2.4, M.chip, x, down ? -1.25 : 2.85, z));
    g.add(box(0.64, 8, 0.64, M.gold, x, down ? -3.2 : 5, z));
  }
  return g;
}
const usbC = (x, z, rotY = 0) => { const m = box(9, 3.2, 7.4, M.metal, x, 3.2, z); m.rotation.y = rotY; return m; };
const microUsb = (x, z) => box(7.5, 2.6, 5.5, M.metal, x, 2.9, z);
const smd = (w, d, x, z, mat = M.chip, h = 1) => box(w, h, d, mat, x, 1.6 + h / 2, z);
const holes = (w, d, r = 1.5) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => cyl(r, 1.7, M.gold, sx * (w / 2 - 3), 0.8, sz * (d / 2 - 3), 16));

// ---------- boards ----------
const esp32 = () => group(pcb(55, 28), pins(19, -12.7), pins(19, 12.7),
  box(18, 3.2, 25.5, M.metal, 14, 3.2, 0), box(6, 0.8, 25.5, M.pcbBlack, 26, 2, 0),
  microUsb(-26, 0), smd(4, 3, -16, 7), smd(4, 3, -16, -7), smd(3, 2, -8, 0));
const esp32s3 = () => group(pcb(63, 25.5, M.pcbBlack), pins(22, -11.4), pins(22, 11.4),
  box(18, 3.2, 25.5 * 0.7, M.metal, 18, 3.2, 0), usbC(-27, -6), usbC(-27, 6), smd(3, 3, -10, 6), smd(3, 3, -10, -6),
  cyl(1.4, 1, M.white, 0, 2.1, 6, 16));
function cores3() {
  const body = box(54, 16, 54, M.darkGrey, 0, 8, 0);
  const screen = box(44, 0.6, 34, M.screenOn, 0, 16.3, 2);
  const cam = cyl(2.2, 1, M.glass, 0, 16.4, -20, 24);
  const strip = box(54.2, 3, 54.2, M.grey, 0, 1.5, 0);
  return group(body, screen, cam, strip, usbC(0, 27.5, Math.PI / 2));
}
const piZero = () => group(pcb(65, 30), holes(65, 30, 1.3), pins(20, -11.5, 2.54, false), smd(12, 12, 0, 0, M.chip, 1.2),
  box(11, 3.3, 7.5, M.metal, -20, 3.3, 11), microUsb(19, 12), microUsb(32, 12), box(17, 2, 3, M.chip, 32, 2.6, 0));
function pi5() {
  return group(pcb(85, 56), holes(85, 56, 1.4), pins(20, -24.5, 2.54, false, -24),
    box(21, 13.5, 16, M.metal, 31, 8.4, -9), box(13, 15.5, 16, M.metal, 33, 9.4, 10), box(16, 16, 16, M.metal, 33, 9.4, 26 - 8.5),
    smd(15, 15, -10, 2, M.metal, 2), usbC(-34, 24), box(7.5, 3.5, 6, M.metal, -18, 3.4, 25), box(7.5, 3.5, 6, M.metal, -4, 3.4, 25));
}
const nano = () => group(pcb(45, 18, M.pcbBlue), pins(15, -7.6), pins(15, 7.6), smd(7, 7, 4, 0, M.chip, 1), microUsb(-20, 0), box(3, 1.2, 3, M.white, 10, 2.2, 0));

// ---------- displays ----------
const ssd1306 = () => group(pcb(27, 27, M.pcbBlue), box(26, 1.4, 19, M.glass, 0, 2.3, 1.5), box(22, 0.2, 11, M.oledOn, 0, 3.1, 0.5),
  pins(4, -12, 2.54, true), box(12, 0.3, 3, M.orangeFlex, 0, 1.8, 11));
function gc9a01() {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 1.6, 48), M.pcbBlue); p.position.y = 0.8;
  const tab = box(16, 1.6, 8, M.pcbBlue, 0, 0.8, -19);
  return group(p, tab, cyl(16.3, 1.6, M.glass, 0, 2.4, 0, 48), cyl(16, 0.2, M.screenOn, 0, 3.3, 0, 48), pins(7, -21, 2.54, true));
}
const st7789 = () => group(pcb(35, 50, M.pcbRed), box(33, 1.8, 41, M.glass, 0, 2.5, 3), box(30.5, 0.2, 40.5, M.screenOn, 0, 3.5, 3), pins(8, -23));
function matrix() {
  const g = group(pcb(32, 32, M.pcbBlue), box(32, 6, 32, M.white, 0, 4.6, 0));
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) g.add(cyl(1.4, 0.4, (i + j) % 3 ? M.cone : M.ledRed, -14 + i * 4, 7.8, -14 + j * 4, 12));
  return g;
}

// ---------- movement ----------
function servo(bodyMat, hornWhite = true) {
  const body = box(22.8, 22.5, 12.2, bodyMat, 0, 11.25, 0);
  const ears = box(32.2, 2.5, 12.2, bodyMat, 0, 16, 0);
  const top = box(14, 4, 12.2, bodyMat, -4.4, 24.5, 0);
  const shaft = cyl(2.4, 4, M.white, -5.5, 28, 0, 16);
  const horn = group(cyl(3.4, 1.8, hornWhite ? M.horn : M.metal, 0, 0, 0, 20), box(28, 1.8, 5.5, hornWhite ? M.horn : M.metal, 0, 0, 0));
  horn.position.set(-5.5, 30.4, 0);
  const cable = box(3, 1.5, 30, M.orangeFlex, 6, 3, 21);
  return group(body, ears, top, shaft, horn, cable, cyl(1, 2.6, M.gold, 14, 16, 0, 12), cyl(1, 2.6, M.gold, -14, 16, 0, 12));
}
function scs0009() {
  const g = servo(M.servoBlack, false);
  g.add(box(3, 3, 8, M.white, 9, 6, -6.5)); g.add(box(3, 3, 8, M.white, 9, 6, 6.5));
  return g;
}
function n20() {
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 15, 32), M.metal); motor.rotation.z = Math.PI / 2;
  const flats = box(15, 10, 12.2, M.metal, 0, 0, 0); // N20 motors have flattened sides
  const can = group(motor, flats); can.position.set(-5, 6, 0);
  const gearbox = box(9, 10, 12, M.gold, 7, 6, 0);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 10, 16), M.metal); shaft.rotation.z = Math.PI / 2; shaft.position.set(16.5, 6, 0);
  return group(can, gearbox, shaft, box(1, 3, 2, M.gold, -13, 9, 3), box(1, 3, 2, M.gold, -13, 9, -3));
}
const drv8833 = () => group(pcb(18.5, 16, M.pcbPurple), smd(5, 6, 0, 0), pins(6, -6.3), pins(6, 6.3), smd(2, 1.2, -5, 0, M.yellow, 1));
const tb6612 = () => group(pcb(20.3, 20.3, M.pcbRed), smd(7, 4, 0, 0), pins(8, -8.9), pins(8, 8.9), smd(2, 1.2, 5, 4, M.yellow, 1));
const pca9685 = () => group(pcb(62.5, 25.4, M.pcbBlue), smd(9, 9, 10, 0, M.chip, 1.2), (() => {
  const g = new THREE.Group();
  for (let c = 0; c < 4; c++) for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) g.add(box(0.64, 8, 0.64, M.gold, -20 + c * 11 + k * 2.54 - 4, 5, -6 + r * 2.54));
  return g;
})(), box(10, 10, 7, M.servoBlue, -28, 6.6, 8), pins(6, 10.2, 2.54, true, 20));

// ---------- senses ----------
function inmp441() {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 1.6, 40), M.pcbBlue); p.position.y = 0.8;
  return group(p, box(4, 1, 3, M.metal, 0, 2.1, 0), cyl(0.5, 1.2, M.chip, 0, 2.8, 0, 12), pins(6, -10, 2.54, true), box(16, 1.6, 6, M.pcbBlue, 0, 0.8, -9));
}
const ttp223 = () => group(pcb(15, 11, M.pcbRed), cyl(4.5, 0.2, M.gold, -2, 1.7, 0, 32), pins(3, 4.5, 2.54, true), smd(2, 1.4, 4.5, -2));
const vl53l0x = () => group(pcb(25, 13, M.pcbPurple), smd(4.4, 2.4, 0, 0, M.chip, 1), cyl(0.6, 0.3, M.glass, -1, 2.8, 0, 12), cyl(0.6, 0.3, M.glass, 1, 2.8, 0, 12), pins(6, -5));
function hcsr04() {
  const g = group(pcb(45, 20, M.pcbBlue), pins(4, 9.5, 2.54, true), smd(6, 5, 0, -6));
  [-13, 13].forEach((x) => { g.add(cyl(8, 12, M.metal, x, 7.6, 0, 40)); g.add(cyl(6.5, 0.4, M.mesh, x, 13.8, 0, 40)); });
  return g;
}
function picam3() {
  const g = group(pcb(25, 24), holes(25, 24, 1.1), box(8.5, 4, 8.5, M.chip, 0, 3.6, 1), cyl(3.2, 2.5, M.glass, 0, 6.8, 1, 32));
  g.add(box(16, 2.4, 5, M.chip, 0, 2.8, -10)); g.add(box(16, 0.3, 30, M.white, 0, 3.6, -26));
  return g;
}
function ov2640() {
  const g = group(box(8.5, 4.5, 8.5, M.chip, 0, 2.25, 0), cyl(4, 5, M.chip, 0, 7, 0, 32), cyl(2.8, 0.4, M.glass, 0, 9.7, 0, 24));
  g.add(box(6, 0.2, 20, M.orangeFlex, 0, 0.1, -14));
  return g;
}

// ---------- audio ----------
const max98357a = () => group(pcb(17.8, 19.3, M.pcbBlue), smd(3, 3, 0, 1), box(7.5, 7.5, 5, M.servoBlue, 0, 4.1, 6.5), pins(7, -8.2), smd(2, 1.2, -5, 2, M.chip, 0.6));
function speaker() {
  const frame = cyl(20, 3, M.darkGrey, 0, 1.5, 0, 48);
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(17, 9, 3, 48, 1, true), M.cone); cone.position.y = 4.5;
  const dust = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.cone); dust.position.y = 3;
  const magnet = cyl(9, 5, M.metal, 0, -2.5, 0, 32);
  return group(frame, cone, dust, magnet, box(4, 1, 2, M.gold, 18, 2, 0), box(4, 1, 2, M.gold, -18, 2, 0));
}

// ---------- power ----------
const tp4056 = () => group(pcb(26, 17, M.pcbBlue), usbC(-10, 0), smd(5, 4, 3, 3), smd(3, 3, 3, -4), smd(1.6, 1, 9, 5, M.ledRed, 0.6), smd(1.6, 1, 9, 2, M.ledRed, 0.6),
  box(2, 0.3, 3, M.gold, 12, 1.75, -6), box(2, 0.3, 3, M.gold, 12, 1.75, 6));
function lipo() {
  const pouch = box(40, 6, 30, M.silverPouch, 0, 3, 0);
  const edge = box(4, 3, 30, M.silverPouch, 22, 1.5, 0);
  const tape = box(6, 6.2, 30.2, M.yellow, 17, 3.1, 0);
  const wires = group(box(20, 1.2, 1.2, M.red, 33, 1.5, 3), box(20, 1.2, 1.2, M.chip, 33, 1.5, -3));
  const plug = box(6, 4, 9, M.white, 44, 2, 0);
  return group(pouch, edge, tape, wires, plug);
}
function cell18650() {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 65, 48), M.batteryBlue); c.rotation.z = Math.PI / 2; c.position.y = 9;
  const ringP = new THREE.Mesh(new THREE.CylinderGeometry(9.05, 9.05, 2, 48), M.metal); ringP.rotation.z = Math.PI / 2; ringP.position.set(32, 9, 0);
  const nub = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 1.2, 24), M.metal); nub.rotation.z = Math.PI / 2; nub.position.set(33.6, 9, 0);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(9.06, 9.06, 8, 48), M.white); band.rotation.z = Math.PI / 2; band.position.set(-5, 9, 0);
  return group(c, ringP, nub, band);
}
function usb5v() {
  const brick = box(42, 26, 42, M.white, 0, 13, 0);
  brick.geometry = new THREE.BoxGeometry(42, 26, 42);
  const port = box(12.5, 4.5, 2, M.chip, 0, 16, 21.2);
  const tongue = box(11, 1.2, 1, M.metal, 0, 16, 22.2);
  const prongs = group(cyl(2, 19, M.metal, -9.5, 13, -30, 16), cyl(2, 19, M.metal, 9.5, 13, -30, 16));
  prongs.children.forEach((p) => { p.rotation.x = Math.PI / 2; });
  return group(brick, port, tongue, prongs);
}

export const BUILDERS = {
  esp32, esp32s3, cores3, pizero: piZero, pi5, nano,
  ssd1306, gc9a01, st7789, matrix,
  sg90: () => servo(M.servoBlue), mg90s: () => servo(M.servoBlack, false), scs0009, n20, drv8833, tb6612, pca9685,
  inmp441, ttp223, vl53l0x, hcsr04, picam3, ov2640,
  max98357a, speaker,
  tp4056, lipo, "18650": cell18650, usb5v,
};

// Returns the model for a part id, centred on the origin and resting on y = 0.
export function buildPart(id) {
  const make = BUILDERS[id];
  if (!make) return null;
  const g = make();
  const bb = new THREE.Box3().setFromObject(g);
  const c = bb.getCenter(new THREE.Vector3());
  g.position.set(-c.x, -bb.min.y, -c.z);
  const wrap = new THREE.Group(); wrap.add(g);
  wrap.userData.size = bb.getSize(new THREE.Vector3());
  return wrap;
}

// Fills every <img data-part="id"> on the page with a rendered thumbnail.
export function renderThumbnails(root = document) {
  const imgs = [...root.querySelectorAll("img[data-part]")];
  if (!imgs.length) return;
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(480, 300, false);
  const scene = makeScene();
  const cam = new THREE.PerspectiveCamera(32, 480 / 300, 0.1, 5000);
  const cache = new Map();
  for (const img of imgs) {
    const id = img.dataset.part;
    if (!cache.has(id)) {
      const m = buildPart(id);
      if (!m) continue;
      m.rotation.y = -0.5;
      scene.add(m); frame(cam, m.userData.size, new THREE.Vector3());
      r.render(scene, cam); cache.set(id, r.domElement.toDataURL("image/png")); scene.remove(m);
    }
    img.src = cache.get(id);
  }
  r.dispose();
}

// A small, slowly turning model in a canvas (used on the home page).
export function spinner(canvas, id) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  r.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = makeScene();
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 5000);
  const m = buildPart(id); scene.add(m);
  const t = new THREE.Vector3();
  const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; frame(cam, m.userData.size, t); };
  new ResizeObserver(size).observe(canvas); size();
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  m.rotation.y = -0.5;
  r.setAnimationLoop((ms) => { if (!still) m.rotation.y = -0.5 + Math.sin(ms / 2600) * 0.6; r.render(scene, cam); });
}

// Lights + camera framing shared by the thumbnails and the live viewer.
export function makeScene() {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xe8f2ff, 0x202838, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(0.8, 1.6, 1.1); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fdcff, 0.7); rim.position.set(-1.2, 0.8, -1); scene.add(rim);
  return scene;
}
export function frame(camera, size, target) {
  // fit the model's bounding sphere inside the narrower field of view
  const r = size.length() / 2;
  const vfov = THREE.MathUtils.degToRad(camera.fov);
  const fov = Math.min(vfov, 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect));
  // the bounding sphere is loose for flat boards, so pull in a little
  const d = (r / Math.sin(fov / 2)) * 0.74;
  target.set(0, size.y / 2, 0);
  const dir = new THREE.Vector3(0.62, 0.55, 0.78).normalize();
  camera.position.copy(dir.multiplyScalar(d)).add(target);
  camera.near = r / 100; camera.far = r * 40; camera.updateProjectionMatrix();
  camera.lookAt(target);
}
