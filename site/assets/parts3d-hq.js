// Detailed, realistic models for the parts that have no openly licensed photo.
// Physically based materials, rounded edges, printed silkscreen, solder joints
// and lit screens — drawn for this guide at real size (1 unit = 1 mm).
// Licence: CC BY-SA 4.0, part of the Desk Buddy Guide.
import * as THREE from "three";
import { RoundedBoxGeometry } from "../vendor/three/addons/RoundedBoxGeometry.js";

// ---------- materials ----------
const phys = (o) => new THREE.MeshPhysicalMaterial(o);
const mask = (color) => phys({ color, roughness: 0.38, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.28 });
const MAT = {
  blue: mask(0x1450a8), red: mask(0xa8211a), purple: mask(0x4b2578), black: mask(0x151619), green: mask(0x1e5e34),
  gold: phys({ color: 0xe3b55a, metalness: 1, roughness: 0.22 }),
  tin: phys({ color: 0xd9dee5, metalness: 1, roughness: 0.18 }),
  steel: phys({ color: 0xbfc5cc, metalness: 1, roughness: 0.3 }),
  brass: phys({ color: 0xc9a24a, metalness: 1, roughness: 0.35 }),
  copper: phys({ color: 0xc07a45, metalness: 1, roughness: 0.3 }),
  epoxy: phys({ color: 0x17181b, roughness: 0.45 }),
  plasticBlack: phys({ color: 0x18191c, roughness: 0.55, clearcoat: 0.2 }),
  plasticWhite: phys({ color: 0xf1f0ec, roughness: 0.42, clearcoat: 0.3 }),
  plasticGrey: phys({ color: 0x5f656e, roughness: 0.5 }),
  terminalGreen: phys({ color: 0x2f9e5b, roughness: 0.45 }),
  terminalBlue: phys({ color: 0x2c6fd1, roughness: 0.45 }),
  ceramic: phys({ color: 0xb59a6a, roughness: 0.6 }),
  glass: phys({ color: 0x0b0e14, roughness: 0.04, metalness: 0, transmission: 0, clearcoat: 1, clearcoatRoughness: 0.03, reflectivity: 0.6 }),
  ribbon: phys({ color: 0xd08a2c, roughness: 0.45, transmission: 0.15 }),
  wireBrown: phys({ color: 0x5a3a26, roughness: 0.5 }), wireRed: phys({ color: 0xb8231c, roughness: 0.5 }), wireOrange: phys({ color: 0xe07a1f, roughness: 0.5 }),
  ledRed: phys({ color: 0x550000, emissive: 0xff2020, emissiveIntensity: 1.2, roughness: 0.3 }),
};

// ---------- textures drawn on canvas ----------
function canvasTex(wmm, hmm, draw, px = 18) {
  const c = document.createElement("canvas");
  c.width = Math.round(wmm * px); c.height = Math.round(hmm * px);
  const g = c.getContext("2d");
  g.scale(px, px);
  draw(g, wmm, hmm);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const silkFont = (g, size, weight = 600) => { g.font = `${weight} ${size}px "JetBrains Mono", Consolas, monospace`; g.fillStyle = "#f4f4ef"; g.textAlign = "center"; g.textBaseline = "middle"; };
function eyesTex(w, h, color = "#6fe3ff", round = false) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
    g.shadowColor = color; g.shadowBlur = Math.min(w, h) * 0.08; g.fillStyle = color;
    if (round) {
      // a single iris filling a round display
      const r = Math.min(w, h) / 2;
      const grd = g.createRadialGradient(w / 2, h / 2, r * 0.1, w / 2, h / 2, r * 0.75);
      grd.addColorStop(0, "#0b2030"); grd.addColorStop(0.35, color); grd.addColorStop(0.8, "#0f3a66"); grd.addColorStop(1, "#000");
      g.fillStyle = grd; g.beginPath(); g.arc(w / 2, h / 2, r * 0.75, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#000"; g.beginPath(); g.arc(w / 2, h / 2, r * 0.28, 0, Math.PI * 2); g.fill();
      g.shadowBlur = 0; g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.arc(w * 0.38, h * 0.36, r * 0.1, 0, Math.PI * 2); g.fill();
      return;
    }
    const ew = w * 0.26, eh = h * 0.56, gap = w * 0.1, rr = Math.min(ew, eh) * 0.3;
    [-1, 1].forEach((s) => {
      const x = w / 2 + s * (gap / 2 + ew / 2) - ew / 2, y = h / 2 - eh / 2;
      g.beginPath(); g.roundRect(x, y, ew, eh, rr); g.fill();
    });
  }, 24);
}

// ---------- geometry helpers ----------
const rbox = (w, h, d, mat, r = 0.4, x = 0, y = 0, z = 0) => {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
};
const cyl = (rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 40) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m;
};
const plane = (w, d, tex, y, x = 0, z = 0, opts = {}) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.6, ...opts }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); return m;
};
const G = (...items) => { const g = new THREE.Group(); items.flat().filter(Boolean).forEach((i) => g.add(i)); return g; };

// PCB with rounded corners, plated mounting holes and a printed silkscreen layer
function board(w, d, mat, silk, holes = []) {
  const g = G(rbox(w, 1.6, d, mat, 0.8, 0, 0.8, 0));
  holes.forEach(([x, z, r = 1.5]) => {
    g.add(cyl(r + 0.6, r + 0.6, 1.64, MAT.gold, x, 0.8, z, 32));
    g.add(cyl(r, r, 1.7, new THREE.MeshBasicMaterial({ color: 0x000000 }), x, 0.8, z, 32));
  });
  if (silk) g.add(plane(w, d, canvasTex(w, d, silk), 1.62));
  return g;
}
// Pin header row along x; pins go down through the board, with solder fillets on top
function header(n, z, x0 = null, pitch = 2.54) {
  const g = new THREE.Group();
  const start = x0 ?? -((n - 1) * pitch) / 2;
  g.add(rbox(n * pitch, 2.5, 2.5, MAT.plasticBlack, 0.3, start + ((n - 1) * pitch) / 2, -1.25, z));
  for (let i = 0; i < n; i++) {
    const x = start + i * pitch;
    g.add(rbox(0.64, 9, 0.64, MAT.gold, 0.1, x, -4.3, z));
    g.add(cyl(0.35, 0.95, 0.8, MAT.tin, x, 2.0, z, 20)); // solder fillet
    g.add(cyl(0.32, 0.32, 0.6, MAT.gold, x, 2.6, z, 12));
  }
  return g;
}
// A block of male headers: cols × rows pins at 2.54 mm, pins standing up (PCA9685 servo outputs)
function headerBlock(cols, rows, x, z) {
  const g = G(rbox(cols * 2.54, 2.5, rows * 2.54, MAT.plasticBlack, 0.3, 0, 2.85, 0));
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const px = -((cols - 1) * 2.54) / 2 + c * 2.54, pz = -((rows - 1) * 2.54) / 2 + r * 2.54;
    g.add(rbox(0.64, 8.5, 0.64, MAT.gold, 0.1, px, 5.4, pz));
    g.add(cyl(0.2, 0.32, 0.5, MAT.gold, px, 9.85, pz, 10));
  }
  g.position.set(x, 0, z); return g;
}
const resistor = (x, z, rot = 0) => { const g = G(rbox(1.6, 0.45, 0.8, MAT.epoxy, 0.1, 0, 0, 0), rbox(0.3, 0.5, 0.8, MAT.tin, 0.08, -0.65, 0, 0), rbox(0.3, 0.5, 0.8, MAT.tin, 0.08, 0.65, 0, 0)); g.position.set(x, 1.85, z); g.rotation.y = rot; return g; };
const capacitor = (x, z, rot = 0, big = false) => { const s = big ? 1.4 : 1; const g = G(rbox(2 * s, 1.1 * s, 1.25 * s, MAT.ceramic, 0.15, 0, 0, 0), rbox(0.4 * s, 1.15 * s, 1.3 * s, MAT.tin, 0.1, -0.85 * s, 0, 0), rbox(0.4 * s, 1.15 * s, 1.3 * s, MAT.tin, 0.1, 0.85 * s, 0, 0)); g.position.set(x, 1.6 + 0.55 * s, z); g.rotation.y = rot; return g; };
function ic(w, d, x, z, legs = 0, mark = "", rot = 0) {
  const tex = mark ? canvasTex(w, d, (g) => { g.fillStyle = "#1a1b1e"; g.fillRect(0, 0, w, d); g.font = `500 ${Math.min(w, d) * 0.22}px Consolas, monospace`; g.fillStyle = "#8f949b"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(mark, w / 2, d / 2); g.beginPath(); g.arc(w * 0.12, d * 0.2, Math.min(w, d) * 0.06, 0, 7); g.fillStyle = "#2a2b2f"; g.fill(); }, 40) : null;
  const body = rbox(w, 1, d, MAT.epoxy, 0.12, 0, 0.5, 0);
  const g = G(body, tex && plane(w * 0.98, d * 0.98, tex, 1.01, 0, 0, { transparent: false, roughness: 0.5 }));
  const pitch = Math.max(0.5, (w - 0.6) / Math.max(1, legs));
  for (let i = 0; i < legs; i++) {
    const lx = -w / 2 + 0.3 + pitch * (i + 0.5);
    g.add(rbox(0.3, 0.3, 0.9, MAT.tin, 0.05, lx, 0.25, d / 2 + 0.35));
    g.add(rbox(0.3, 0.3, 0.9, MAT.tin, 0.05, lx, 0.25, -d / 2 - 0.35));
  }
  g.position.set(x, 1.6, z); g.rotation.y = rot; return g;
}
const led = (x, z) => { const g = G(rbox(1.6, 0.6, 0.8, MAT.ledRed, 0.15, 0, 0, 0)); g.position.set(x, 1.9, z); return g; };
const pad = (x, z, w = 1.2, d = 1.6) => rbox(w, 0.06, d, MAT.tin, 0.05, x, 1.63, z);
function terminal(n, x, z, mat = MAT.terminalBlue, rotY = 0) {
  const g = G(rbox(n * 5, 8.5, 7, mat, 0.6, 0, 4.25, 0));
  for (let i = 0; i < n; i++) { const xi = -((n - 1) * 5) / 2 + i * 5; g.add(cyl(1.5, 1.5, 0.6, MAT.steel, xi, 8.7, -1.2, 24)); g.add(rbox(3.4, 3.4, 0.3, new THREE.MeshBasicMaterial({ color: 0x050505 }), 0.2, xi, 4.6, 3.55)); }
  g.position.set(x, 1.6, z); g.rotation.y = rotY; return g;
}
function usbCPort(x, z, rotY = 0) { const g = G(rbox(9, 3.2, 7.4, MAT.steel, 1.5, 0, 0, 0), rbox(7, 1.6, 0.3, new THREE.MeshBasicMaterial({ color: 0x050505 }), 0.6, 0, 0, 3.6)); g.position.set(x, 3.2, z); g.rotation.y = rotY; return g; }
function wires(colors, from, len) {
  const g = new THREE.Group();
  colors.forEach((m, i) => {
    const pts = [];
    for (let k = 0; k <= 12; k++) { const t = k / 12; pts.push(new THREE.Vector3(from.x + (i - 1) * 1.1 + Math.sin(t * 9 + i * 2.1) * 0.35, from.y - t * 2, from.z + t * len)); }
    const m3 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.5, 10), m); m3.castShadow = true; g.add(m3);
  });
  return g;
}
const silk = (labels, opts = {}) => (g, w, d) => {
  silkFont(g, opts.size || 1.05);
  labels.forEach(([t, x, y, s, rot]) => { g.save(); g.translate(x, y); if (rot) g.rotate(rot); if (s) silkFont(g, s, opts.weight); g.fillText(t, 0, 0); g.restore(); });
  if (opts.frame) { g.strokeStyle = "#f4f4ef"; g.lineWidth = 0.18; opts.frame.forEach(([x, y, fw, fh]) => g.strokeRect(x, y, fw, fh)); }
};
const pinLabels = (names, y, w) => names.map((n, i) => [n, w / 2 - ((names.length - 1) * 2.54) / 2 + i * 2.54, y, 0.9]);

// ---------- the 14 detailed models ----------
function ssd1306() {
  const w = 27, d = 27.3;
  return G(
    board(w, d, MAT.blue, silk(pinLabels(["GND", "VCC", "SCL", "SDA"], 1.6, w)), [[-11.2, -11.5, 1], [11.2, -11.5, 1], [-11.2, 11.5, 1], [11.2, 11.5, 1]]),
    header(4, -11.4).translateY(0),
    rbox(26.7, 1.4, 19.3, MAT.glass, 0.3, 0, 2.3, 2.2),
    plane(21.7, 10.9, eyesTex(21.7, 10.9, "#cdf6ff"), 3.02, 0, 1.4, { emissive: 0xffffff, emissiveMap: eyesTex(21.7, 10.9, "#cdf6ff"), emissiveIntensity: 1, transparent: false, roughness: 0.2 }),
    rbox(12, 0.25, 4.2, MAT.ribbon, 0.1, 0, 1.75, 12.6),
    capacitor(-9, -8.2), capacitor(-6, -8.2), resistor(6, -8.2), resistor(9, -8.2), ic(3, 1.6, 0, -8.4, 5),
  );
}
function gc9a01() {
  const r = 19;
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 1.6, 80), MAT.blue); disc.position.y = 0.8; disc.receiveShadow = disc.castShadow = true;
  const tab = rbox(22, 1.6, 9, MAT.blue, 0.8, 0, 0.8, -r);
  const tabSilk = plane(22, 9, canvasTex(22, 9, silk([["GND", 2.4, 2, .75], ["VCC", 5, 2, .75], ["SCL", 7.5, 2, .75], ["SDA", 10.1, 2, .75], ["RES", 12.6, 2, .75], ["DC", 15.2, 2, .75], ["CS", 17.7, 2, .75], ["BLK", 20.2, 2, .75]])), 1.62, 0, -r);
  const tex = eyesTex(32.4, 32.4, "#57d0ff", true);
  const screen = new THREE.Mesh(new THREE.CircleGeometry(16.2, 80), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.9, roughness: 0.2 }));
  screen.rotation.x = -Math.PI / 2; screen.position.y = 3.32;
  return G(disc, tab, tabSilk, cyl(17.4, 17.4, 1.6, MAT.glass, 0, 2.5, 0, 80), screen, header(8, -r - 2.2, -8.9));
}
function st7789() {
  const w = 34.6, d = 50;
  const tex = eyesTex(30.6, 40.8, "#6fe3ff");
  return G(
    board(w, d, MAT.red, silk(pinLabels(["GND", "VCC", "SCL", "SDA", "RES", "DC", "CS", "BLK"], 2, w)), [[-14.5, -21.5, 1.3], [14.5, -21.5, 1.3], [-14.5, 21.5, 1.3], [14.5, 21.5, 1.3]]),
    header(8, -22),
    rbox(33.2, 1.8, 42, MAT.glass, 0.4, 0, 2.5, 3.2),
    (() => { const p = plane(30.6, 40.8, tex, 3.42, 0, 3.2, { emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.9, transparent: false, roughness: 0.2 }); p.rotation.z = Math.PI / 2; return p; })(),
  );
}
function cores3() {
  const body = rbox(54, 16, 54, phys({ color: 0x2b2e33, roughness: 0.4, clearcoat: 0.4 }), 4, 0, 8.6, 0);
  const band = rbox(54.3, 3.4, 54.3, phys({ color: 0x9aa1aa, roughness: 0.35, metalness: 0.2 }), 3.5, 0, 1.9, 0);
  const bezel = rbox(52, 0.8, 52, MAT.glass, 3.4, 0, 16.6, 0);
  const tex = eyesTex(40.8, 30.6, "#6fe3ff");
  const screen = plane(40.8, 30.6, tex, 17.02, 0, 3.5, { emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.9, transparent: false, roughness: 0.15 });
  const camRing = cyl(2.3, 2.3, 0.3, MAT.steel, 0, 17.05, -19.5, 32), lens = cyl(1.4, 1.4, 0.4, phys({ color: 0x0c1a2a, roughness: 0.05, clearcoat: 1 }), 0, 17.2, -19.5, 32);
  const logo = plane(18, 3, canvasTex(18, 3, (g) => { g.font = "700 2px Consolas, monospace"; g.fillStyle = "#8b9098"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("M5STACK", 9, 1.5); }, 30), 17.03, 0, 22.5);
  return G(body, band, bezel, screen, camRing, lens, logo, usbCPort(0, 27.4, Math.PI / 2), rbox(3.5, 1.2, 1.2, MAT.plasticGrey, 0.4, -27.4, 12, 12));
}
function servo(bodyMat, label, metalHorn) {
  const body = rbox(22.8, 22.5, 12.2, bodyMat, 1, 0, 11.25, 0);
  const ears = rbox(32.4, 2.5, 12.2, bodyMat, 0.8, 0, 16.2, 0);
  const top = rbox(14.5, 4.2, 12.2, bodyMat, 1.2, -4.2, 24.6, 0);
  const dome = cyl(6, 6, 4.2, bodyMat, -5.4, 24.6, 0, 48);
  const shaft = cyl(2.4, 2.4, 3.6, metalHorn ? MAT.brass : MAT.plasticWhite, -5.4, 28.3, 0, 32);
  const hornMat = metalHorn ? MAT.steel : MAT.plasticWhite;
  const horn = G(cyl(3.6, 3.6, 2, hornMat, 0, 0, 0, 40), rbox(30, 1.8, 5.2, hornMat, 0.9, 0, 0, 0), cyl(1.2, 1.2, 2.2, MAT.steel, 0, 0.3, 0, 20));
  for (let i = 1; i <= 5; i++) { horn.add(cyl(0.55, 0.55, 2.1, new THREE.MeshBasicMaterial({ color: 0x222222 }), 3.4 + i * 2, 0, 0, 10)); horn.add(cyl(0.55, 0.55, 2.1, new THREE.MeshBasicMaterial({ color: 0x222222 }), -3.4 - i * 2, 0, 0, 10)); }
  horn.position.set(-5.4, 31, 0);
  const sticker = canvasTex(22, 12, (g) => { g.fillStyle = "#111"; g.fillRect(0, 0, 22, 12); g.fillStyle = "#d9b03b"; g.fillRect(0.8, 0.8, 20.4, 10.4); g.fillStyle = "#111"; g.font = "800 3.4px Consolas, monospace"; g.textAlign = "center"; g.fillText(label, 11, 6.2); g.font = "600 1.4px Consolas, monospace"; g.fillText("MICRO SERVO", 11, 8.6); }, 30);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(20, 10.8), new THREE.MeshStandardMaterial({ map: sticker, roughness: 0.5 })); side.position.set(0, 9, 6.12);
  const holes = [-14, 14].map((x) => cyl(1, 1, 2.6, new THREE.MeshBasicMaterial({ color: 0x050505 }), x, 16.2, 0, 16));
  const cable = G(wires([MAT.wireBrown, MAT.wireRed, MAT.wireOrange], new THREE.Vector3(8, 4, 6), 32), rbox(4.3, 2.6, 8, MAT.plasticBlack, 0.4, 8, 2, 40));
  cable.userData.cable = true;
  return G(body, ears, top, dome, shaft, horn, side, holes, cable);
}
const mg90s = () => servo(phys({ color: 0x1b1c20, roughness: 0.4, clearcoat: 0.5 }), "MG90S", true);
function scs0009() {
  const g = servo(phys({ color: 0x1b1c20, roughness: 0.4, clearcoat: 0.5 }), "SCS0009", false);
  // serial bus servos have two sockets instead of a fixed cable
  g.children = g.children.filter((c) => !c.userData.cable);
  [-3.2, 3.2].forEach((z) => g.add(rbox(7.4, 4.2, 2.8, MAT.plasticWhite, 0.4, 7, 4.5, z * 1.1 + (z > 0 ? 3 : -3))));
  return g;
}
function n20() {
  const can = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 15, 48), MAT.steel); can.scale.set(1, 1, 10 / 12); can.rotation.z = Math.PI / 2; can.position.set(-5.5, 5, 0);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 5.6, 2.2, 48), phys({ color: 0x1b1c20, roughness: 0.5 })); cap.scale.set(1, 1, 10 / 12); cap.rotation.z = Math.PI / 2; cap.position.set(-14, 5, 0);
  const tabs = [-2.6, 2.6].map((z) => rbox(1.6, 3.6, 0.3, MAT.copper, 0.1, -15.6, 7.4, z));
  const plateA = rbox(1.2, 10, 12, MAT.brass, 0.3, 2.8, 5, 0), plateB = rbox(1.2, 10, 12, MAT.brass, 0.3, 10.2, 5, 0);
  const gears = [];
  for (let i = 0; i < 4; i++) { const gr = new THREE.Mesh(new THREE.CylinderGeometry(i % 2 ? 2.4 : 4, i % 2 ? 2.4 : 4, 0.9, 18), MAT.brass); gr.rotation.z = Math.PI / 2; gr.position.set(4.6 + i * 1.5, 5 + (i % 2 ? 1.6 : -1), (i % 2 ? -1.5 : 1)); gears.push(gr); }
  const posts = [[-4, -4], [4, -4], [-4, 4], [4, 4]].map(([y, z]) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 8.6, 12), MAT.steel); p.rotation.z = Math.PI / 2; p.position.set(6.5, 5 + y, z); return p; });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 10, 24), MAT.steel); shaft.rotation.z = Math.PI / 2; shaft.position.set(15.8, 5, 0);
  const flat = rbox(9, 0.6, 3.1, MAT.steel, 0.1, 16.3, 6.2, 0);
  return G(can, cap, tabs, plateA, plateB, gears, posts, shaft, flat);
}
function drv8833() {
  const w = 18.5, d = 16;
  return G(board(w, d, MAT.red, silk([...pinLabels(["IN1", "IN2", "IN3", "IN4", "EEP", "ULT"], 1.4, w), ...pinLabels(["OUT1", "OUT2", "OUT3", "OUT4", "VCC", "GND"], 14.6, w), ["DRV8833", w / 2, 8, 1.3]])),
    header(6, -6.6), header(6, 6.6), ic(5, 4.4, 0, -1.6, 8, "8833"), capacitor(-5.5, 2.4), capacitor(5.5, 2.4), resistor(-3, 3.2), resistor(3, 3.2), led(6.6, -2.2));
}
function pca9685() {
  const w = 62.5, d = 25.4;
  const nums = []; for (let i = 0; i < 16; i++) nums.push([String(i), 31.25 - 10 + Math.floor(i / 4) * 11 + ((i % 4) - 1.5) * 2.54, 15.2, 0.85]);
  const g = G(board(w, d, MAT.blue, silk([...nums, ["PCA9685  16-CH PWM / SERVO", 38, 22.2, 1.1], ["V+", 4, 6, 1.1], ["GND", 4, 19.6, 1.1]]), [[-28.5, -9.5, 1.4], [28.5, -9.5, 1.4], [-28.5, 9.5, 1.4], [28.5, 9.5, 1.4]]),
    ic(7.8, 4.4, -19, -2.5, 14, "PCA9685"), terminal(2, -25.5, 5.5, MAT.terminalBlue, Math.PI / 2), capacitor(-19, 4, 0, true), led(-14, 7.5), resistor(-11, 7.5), resistor(4, 6.5), resistor(8, 6.5),
    header(6, 10.6, 18), header(6, -10.6, 18));
  // four groups of four servo outputs; each column is PWM / V+ / GND
  for (let k = 0; k < 4; k++) g.add(headerBlock(4, 3, -10 + k * 11, -3.2));
  return g;
}
function inmp441() {
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 1.6, 64), MAT.blue); disc.position.y = 0.8; disc.castShadow = disc.receiveShadow = true;
  const tail = rbox(16.5, 1.6, 7, MAT.blue, 0.8, 0, 0.8, -8.5);
  const tailSilk = plane(16.5, 7, canvasTex(16.5, 7, silk([["SCK", 1.5, 1.6, .7], ["WS", 4.0, 1.6, .7], ["L/R", 6.6, 1.6, .7], ["SD", 9.1, 1.6, .7], ["VDD", 11.7, 1.6, .7], ["GND", 14.2, 1.6, .7], ["INMP441", 8.25, 5, 1]])), 1.62, 0, -8.5);
  const mic = G(rbox(4.7, 1.1, 3.8, MAT.tin, 0.3, 0, 2.15, 1), cyl(0.4, 0.4, 0.05, new THREE.MeshBasicMaterial({ color: 0x111111 }), 0, 2.72, 1, 16));
  return G(disc, tail, tailSilk, mic, capacitor(-3.6, -2.2), capacitor(3.6, -2.2), header(6, -10.6, -6.35));
}
function ttp223() {
  const w = 15, d = 11;
  const padTex = canvasTex(w, d, (g) => { g.fillStyle = "rgba(0,0,0,0)"; g.fillRect(0, 0, w, d); g.strokeStyle = "#f4f4ef"; g.lineWidth = 0.25; g.beginPath(); g.arc(5.6, 5.5, 4.4, 0, 7); g.stroke(); silkFont(g, 0.85); g.fillText("GND", 12.9, 1.6); g.fillText("I/O", 12.9, 5.5); g.fillText("VCC", 12.9, 9.4); });
  const p = G(rbox(w, 1.6, d, MAT.red, 0.8, 0, 0.8, 0), plane(w, d, padTex, 1.62));
  const copperPad = cyl(4.1, 4.1, 0.06, MAT.tin, -1.9, 1.63, 0, 64);
  const hdr = header(3, 0); hdr.rotation.y = Math.PI / 2; hdr.position.x = 5.8;
  return G(p, copperPad, hdr, ic(2.9, 1.6, 3, -3.6, 3, "223"), led(3, 3.4), resistor(1.2, 3.6, Math.PI / 2), capacitor(4.4, 0.4, Math.PI / 2));
}
function vl53l0x() {
  const w = 25, d = 10.7;
  const sensor = G(rbox(4.4, 1, 2.4, MAT.epoxy, 0.2, 0, 0.5, 0), cyl(0.45, 0.45, 0.1, phys({ color: 0x220a0a, roughness: 0.05, clearcoat: 1 }), -1.1, 1.02, 0, 20), cyl(0.45, 0.45, 0.1, phys({ color: 0x0a0a22, roughness: 0.05, clearcoat: 1 }), 1.1, 1.02, 0, 20));
  sensor.position.set(-2, 1.6, 1.2);
  return G(board(w, d, MAT.purple, silk([...pinLabels(["VIN", "GND", "SCL", "SDA", "GPIO1", "XSHUT"], 1.4, w), ["VL53L0X", 20, 8.5, 1.1]]), [[-10.3, 2, 1.1], [10.3, 2, 1.1]]),
    sensor, ic(2.9, 1.6, 5, 2.4, 5, "662K"), capacitor(-7, 2.6), capacitor(8.5, 2.6), resistor(-7, -0.5), resistor(1.8, -1.6), header(6, -4));
}
function max98357a() {
  const w = 17.8, d = 19.3;
  return G(board(w, d, phys({ color: 0x1f3a8c, roughness: 0.38, clearcoat: 0.7 }), silk([...pinLabels(["LRC", "BCLK", "DIN", "GAIN", "SD", "GND", "Vin"], 1.4, w), ["MAX98357", w / 2, 9.2, 1.1], ["+", 6.2, 16.5, 1.4], ["−", 11.6, 16.5, 1.4]]), [[-6.6, 6.8, 1.2], [6.6, 6.8, 1.2]]),
    header(7, -8.4), ic(3, 3, 0, -2.6, 0, "98357"), capacitor(-4.2, -2.6), capacitor(4.2, -2.6, 0, true), resistor(0, 0.8), terminal(2, 0, 5.8, MAT.terminalGreen));
}
function usb5v() {
  const shell = rbox(42, 26, 42, MAT.plasticWhite, 6, 0, 13, 0);
  const face = rbox(36, 0.6, 18, phys({ color: 0xe7e6e1, roughness: 0.6 }), 0.3, 0, 26.2, 0);
  const port = G(rbox(13, 6, 1.2, MAT.steel, 0.4, 0, 0, 0), rbox(11.2, 4.2, 1.3, new THREE.MeshBasicMaterial({ color: 0x060606 }), 0.3, 0, 0, 0.1), rbox(10, 1.4, 1.4, phys({ color: 0x2f62d6, roughness: 0.4 }), 0.2, 0, -0.6, 0.15));
  port.position.set(0, 14, 21.2);
  const label = canvasTex(30, 14, (g) => { g.fillStyle = "#e9e8e3"; g.fillRect(0, 0, 30, 14); g.fillStyle = "#9b9a95"; g.font = "700 3px Consolas, monospace"; g.textAlign = "center"; g.fillText("5V ⎓ 2A", 15, 5.5); g.font = "500 1.5px Consolas, monospace"; g.fillText("INPUT 100–240V~ 50/60Hz", 15, 9); g.fillText("OUTPUT 5.0V ⎓ 2.0A  10W", 15, 11.4); }, 30);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), new THREE.MeshStandardMaterial({ map: label, roughness: 0.6 })); side.rotation.y = Math.PI / 2; side.position.set(21.05, 13, 0);
  const prongs = [-9.5, 9.5].map((x) => { const p = cyl(2, 2, 19, MAT.steel, x, 13, -30, 32); p.rotation.x = Math.PI / 2; return p; });
  return G(shell, face, port, side, prongs);
}

export const HQ_BUILDERS = { ssd1306, gc9a01, st7789, cores3, mg90s, scs0009, n20, drv8833, pca9685, inmp441, ttp223, vl53l0x, max98357a, usb5v };
