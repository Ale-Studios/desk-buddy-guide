// Builds the static chapter pages (site/chapters/*.html) from the Markdown
// chapters in docs/. The Markdown stays the single source of truth: edit
// docs/*.md, then run `npm run build`. The output is plain HTML that GitHub
// Pages serves as-is — nothing runs on a server.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS = path.join(root, "docs");
const OUT = path.join(root, "site", "chapters");
const REPO = "https://github.com/Ale-Studios/desk-buddy-guide";

const CHAPTERS = [
  ["01-basics", "Basics"],
  ["02-choose-your-path", "Choose your path"],
  ["03-electronics", "Electronics"],
  ["04-eyes-and-face", "Eyes & face"],
  ["05-movement", "Movement"],
  ["06-senses", "Senses"],
  ["07-body-and-shell", "Body & shell"],
  ["08-firmware", "Basic firmware"],
  ["09-reference-projects", "Reference projects"],
  ["10-connect-to-pc", "Connecting to a PC"],
];

// Parts shown as 3D thumbnails at the top of each chapter (ids from site/assets/parts3d.js)
const CHAPTER_PARTS = {
  "02-choose-your-path": [["esp32s3", "ESP32-S3"], ["cores3", "M5Stack CoreS3"], ["pizero", "Pi Zero 2 W"], ["nano", "Arduino Nano"], ["n20", "N20 motor"]],
  "03-electronics": [["esp32", "ESP32"], ["esp32s3", "ESP32-S3"], ["cores3", "M5Stack CoreS3"], ["pizero", "Pi Zero 2 W"], ["pi5", "Raspberry Pi 5"], ["nano", "Arduino Nano"], ["usb5v", "5 V USB supply"], ["tp4056", "TP4056 charger"], ["lipo", "1S LiPo"], ["18650", "18650 cell"]],
  "04-eyes-and-face": [["ssd1306", "SSD1306 OLED"], ["gc9a01", "GC9A01 round TFT"], ["st7789", "ST7789 TFT"], ["matrix", "LED matrix"], ["cores3", "M5Stack CoreS3"]],
  "05-movement": [["sg90", "SG90"], ["mg90s", "MG90S"], ["scs0009", "SCS0009"], ["n20", "N20 motor"], ["pca9685", "PCA9685"], ["tb6612", "TB6612FNG"], ["drv8833", "DRV8833"]],
  "06-senses": [["inmp441", "INMP441 mic"], ["max98357a", "MAX98357A amp"], ["speaker", "Speaker"], ["ttp223", "TTP223 touch"], ["vl53l0x", "VL53L0X"], ["hcsr04", "HC-SR04"], ["picam3", "Pi Camera 3"], ["ov2640", "OV2640"]],
  "08-firmware": [["esp32s3", "ESP32-S3"], ["nano", "Arduino Nano"], ["cores3", "M5Stack CoreS3"]],
  "10-connect-to-pc": [["esp32s3", "ESP32-S3"], ["inmp441", "INMP441 mic"], ["max98357a", "MAX98357A amp"]],
};
const partStrip = (file) => {
  const list = CHAPTER_PARTS[file];
  if (!list) return "";
  return `<section class="part-strip" aria-label="Parts in this chapter"><span class="eyebrow">Parts in this chapter · open one for photos, specs and wiring</span>
      <div class="part-row">${list.map(([id, name]) => `<a href="../parts.html#${id}"><img data-part="${id}" alt="3D model of the ${esc(name)}" width="480" height="300"><span>${esc(name)}</span></a>`).join("")}</div></section>`;
};

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Links between chapters point at .md files in docs/ (so they work on GitHub
// too); on the site they become the generated .html pages.
function rewriteHref(href) {
  const m = href.match(/^(?:\.\.\/docs\/|\.\/)?(\d\d-[a-z-]+)\.md(#.*)?$/);
  if (m) return `${m[1]}.html${m[2] || ""}`;
  if (href === "glossary.md") return `${REPO}/blob/main/docs/glossary.md`;
  if (href === "../models/README.md") return "../models.html"; // the site has a live 3D viewer
  if (href.startsWith("../models/") || href.startsWith("../firmware/") || href.startsWith("../media/")) return `${REPO}/tree/main/${href.slice(3)}`;
  return href;
}

function render(md) {
  const toc = [];
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    if (depth === 1) return ""; // the page header shows the title
    const id = slug(text);
    if (depth === 2) toc.push([id, text]);
    return `<h${depth} id="${id}">${text}<a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>\n`;
  };
  renderer.table = function (token) {
    return `<div class="table-scroll">${marked.Renderer.prototype.table.call(this, token)}</div>\n`;
  };
  renderer.link = function ({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const h = rewriteHref(href);
    const ext = /^https?:/.test(h) && !h.startsWith(REPO);
    return `<a href="${esc(h)}"${title ? ` title="${esc(title)}"` : ""}${ext ? ' target="_blank" rel="noopener"' : ""}>${text}${ext ? " ↗" : ""}</a>`;
  };
  // "> **Tip:** …" / "> **Warning:** …" become coloured callouts
  renderer.blockquote = function ({ tokens }) {
    let body = this.parser.parse(tokens);
    let cls = "";
    body = body.replace(/^<p><strong>(Tip|Warning|Note|Safety):?<\/strong>:?\s*/, (_, k) => {
      cls = k === "Tip" ? "tip" : k === "Note" ? "" : "warn";
      return `<p><span class="label">${k}</span>`;
    });
    return `<blockquote${cls ? ` class="${cls}"` : ""}>${body}</blockquote>\n`;
  };
  const html = marked.parse(md, { renderer, gfm: true });
  return { html, toc };
}

const words = (md) => md.replace(/```[\s\S]*?```/g, "").split(/\s+/).filter(Boolean).length;

function page(i, md) {
  const [file, title] = CHAPTERS[i];
  const n = String(i + 1).padStart(2, "0");
  // drop the trailing "Next: …" line; the pager replaces it
  md = md.replace(/\n+Next: \[[^\]]+\]\([^)]+\)\s*$/, "\n");
  const lede = (md.match(/^# .+\n+([^#|>`\-*\n][^\n]+)/m) || [])[1] || "";
  const { html, toc } = render(md);
  const mins = Math.max(2, Math.round(words(md) / 220));
  const prev = CHAPTERS[i - 1], next = CHAPTERS[i + 1];
  const desc = esc(marked.parseInline(lede).replace(/<[^>]+>/g, "").slice(0, 180) || `${title} — chapter ${n} of the Desk Buddy Guide.`);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · Desk Buddy Guide</title>
<meta name="description" content="${desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap">
<link rel="stylesheet" href="../assets/guide.css">
<script type="importmap">{ "imports": { "three": "../vendor/three/three.module.js" } }</script>
</head>
<body>
<header class="wrap bar">
  <a class="brand" href="../index.html"><span class="brand-mark" aria-hidden="true"><i></i><i></i></span>Desk Buddy Guide</a>
  <nav aria-label="Site">
    <a href="../index.html#finder">Find your path</a>
    <a href="../build.html">Builder</a>
    <a href="../parts.html">Parts</a>
    <a href="../models.html">3D models</a>
    <a href="../videos.html">Videos</a>
    <a href="01-basics.html"${i >= 0 ? ' aria-current="page"' : ""}>Chapters</a>
  </nav>
</header>
<div class="wrap layout">
  <nav class="toc-left" aria-label="Chapters">
    <details open><summary>Chapters</summary>
    <ol>
${CHAPTERS.map(([f, t], j) => `      <li><a href="${f}.html"${j === i ? ' aria-current="page"' : ""}><span>${String(j + 1).padStart(2, "0")}</span>${esc(t)}</a></li>`).join("\n")}
    </ol>
    </details>
  </nav>
  <article>
    <header class="chapter-head">
      <span class="eyebrow">Chapter ${n} of ${CHAPTERS.length}</span>
      <h1>${esc(title)}</h1>
      <div class="meta"><span>${mins} min read</span><span>Updated November 2026</span></div>
    </header>
    ${partStrip(file)}
    <div class="prose">
${html}
    </div>
    <nav class="pager" aria-label="Previous and next chapter">
      ${prev ? `<a class="prev" href="${prev[0]}.html"><small>← Previous</small><b>${esc(prev[1])}</b></a>` : ""}
      ${next ? `<a class="next" href="${next[0]}.html"><small>Next →</small><b>${esc(next[1])}</b></a>` : `<a class="next" href="../index.html#finder"><small>Done? →</small><b>Pick your build path</b></a>`}
    </nav>
    <p class="edit">Spotted a mistake or a dead link? <a href="${REPO}/edit/main/docs/${file}.md" target="_blank" rel="noopener">Edit this chapter on GitHub ↗</a></p>
  </article>
  <aside class="toc-right" aria-label="On this page">
    <span class="eyebrow">On this page</span>
    <ul>
${toc.map(([id, t]) => `      <li><a href="#${id}">${t}</a></li>`).join("\n")}
    </ul>
  </aside>
</div>
<footer><div class="wrap">Desk Buddy Guide · text CC BY-SA 4.0 · code MIT · third-party projects are linked under their own licences.</div></footer>
<script>
// on phones the chapter list starts collapsed so the text comes first
if (matchMedia("(max-width: 800px)").matches) document.querySelector(".toc-left details").removeAttribute("open");
// highlight the section being read in the right-hand table of contents
const links = [...document.querySelectorAll(".toc-right a")];
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); });
}, { rootMargin: "0px 0px -70% 0px" });
document.querySelectorAll(".prose h2").forEach((h) => obs.observe(h));
</script>
<script type="module">
import { renderThumbnails } from "../assets/parts3d.js";
renderThumbnails();
</script>
</body>
</html>
`;
}

fs.mkdirSync(OUT, { recursive: true });
CHAPTERS.forEach(([file], i) => {
  const md = fs.readFileSync(path.join(DOCS, `${file}.md`), "utf8");
  fs.writeFileSync(path.join(OUT, `${file}.html`), page(i, md));
});
console.log(`built ${CHAPTERS.length} chapter pages → site/chapters/`);
