/**
 * exportBookEpub.ts
 * Generates a production-quality EPUB 3.0 from BookPage array using JSZip.
 * Covers, chapter openers, text pages, and illustration moments each get
 * semantically correct XHTML + CSS.
 */

import JSZip from "jszip";
import type { BookPage } from "@/hooks/useBookEditor";

// ─── CSS ──────────────────────────────────────────────────────────────────────

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;700&family=Nunito:wght@400;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Merriweather', Georgia, serif;
  background: #FFFDF5;
  color: #1a1a1a;
  font-size: 1em;
  line-height: 1.8;
}

/* ── Cover ── */
.page-cover {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #0d1117;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding: 2em;
  text-align: center;
}
.page-cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.page-cover .overlay {
  position: relative;
  z-index: 1;
  background: rgba(0,0,0,0.55);
  border-radius: 12px;
  padding: 1.5em 2em;
  width: 100%;
}
.page-cover h1 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 2em;
  color: #ffffff;
  line-height: 1.3;
  text-shadow: 0 2px 12px rgba(0,0,0,0.9);
  margin-bottom: 0.5em;
}
.page-cover .author {
  font-family: 'Nunito', sans-serif;
  font-size: 1em;
  color: rgba(255,255,255,0.75);
  font-style: italic;
}

/* ── Chapter opener ── */
.page-opener {
  width: 100%;
  min-height: 100vh;
  background: #0d1117;
  display: flex;
  flex-direction: column;
}
.page-opener img {
  width: 100%;
  height: 55vh;
  object-fit: cover;
}
.page-opener .opener-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2em;
  text-align: center;
  gap: 0.75em;
}
.page-opener .chapter-label {
  font-family: 'Cinzel', serif;
  font-size: 0.75em;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #F5A623;
}
.page-opener h2 {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 1.75em;
  color: #ffffff;
  line-height: 1.35;
}
.page-opener .ornament {
  color: #F5A623;
  font-size: 1.2em;
}

/* ── Text page ── */
.page-text {
  width: 100%;
  min-height: 100vh;
  background: #FFFDF5;
  padding: 3.5em 3em 3em;
  display: flex;
  flex-direction: column;
}
.page-text .running-header {
  font-family: 'Cinzel', serif;
  font-size: 0.6em;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(27,107,90,0.55);
  text-align: center;
  border-bottom: 1px solid rgba(27,107,90,0.12);
  padding-bottom: 0.75em;
  margin-bottom: 1.5em;
}
.page-text .body-text {
  flex: 1;
  font-size: 0.95em;
  text-align: justify;
  line-height: 1.9;
  columns: 2;
  column-gap: 2em;
}
.page-text .inline-img {
  float: right;
  width: 38%;
  margin: 0 0 1em 1.25em;
  border-radius: 8px;
  overflow: hidden;
  column-span: none;
}
.page-text .inline-img img {
  width: 100%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
}
.page-text .drop-cap::first-letter {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 3.5em;
  font-weight: 700;
  float: left;
  line-height: 0.8;
  padding-top: 0.06em;
  margin-right: 0.06em;
  color: #1B6B5A;
}
.page-text .page-num {
  font-family: 'Merriweather', serif;
  font-size: 0.65em;
  font-style: italic;
  color: rgba(27,107,90,0.5);
  text-align: center;
  padding-top: 1em;
  border-top: 1px solid rgba(245,166,35,0.3);
  margin-top: 1.5em;
}

/* ── Illustration moment ── */
.page-moment {
  width: 100%;
  min-height: 100vh;
  background: #0d1117;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
.page-moment img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.page-moment .caption {
  position: relative;
  z-index: 1;
  background: rgba(0,0,0,0.5);
  color: rgba(255,255,255,0.85);
  font-style: italic;
  font-size: 0.85em;
  text-align: center;
  padding: 1em 2em;
  width: 100%;
}

/* ── Back cover ── */
.page-back-cover {
  width: 100%;
  min-height: 100vh;
  background: #0d1117;
  position: relative;
  display: flex;
  align-items: flex-end;
}
.page-back-cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.page-back-cover .synopsis-box {
  position: relative;
  z-index: 1;
  margin: 2em;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 1.5em 2em;
  border: 1px solid rgba(255,255,255,0.1);
}
.page-back-cover .bar {
  width: 2em;
  height: 3px;
  background: #F5A623;
  margin-bottom: 1em;
}
.page-back-cover p {
  color: rgba(255,255,255,0.85);
  font-size: 0.9em;
  line-height: 1.7;
}

/* ── Spread ── */
.page-spread {
  width: 100%;
  min-height: 100vh;
  background: #0d1117;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
.page-spread img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.page-spread .text-card {
  position: relative;
  z-index: 1;
  background: rgba(255,255,255,0.93);
  border-radius: 16px;
  margin: 1.5em;
  padding: 1.25em 1.5em;
  text-align: center;
  font-size: 1em;
  line-height: 1.7;
  color: #1a1a1a;
  max-width: 90%;
}
`;

// ─── Page HTML generators ──────────────────────────────────────────────────────

function escapedHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function xhtml(id: string, titleText: string, body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en" xml:lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${escapedHtml(titleText)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
${body}
</body>
</html>`;
}

function pageHtml(page: BookPage, bookTitle: string): string {
  const t = escapedHtml(page.text || "");
  const ttl = escapedHtml(page.title || "");
  const sub = escapedHtml(page.subTitle || "");
  const img = page.imageUrl
    ? `<img src="${escapedHtml(page.imageUrl)}" alt="${escapedHtml(page.label)}" />`
    : "";

  switch (page.type) {
    case "front-cover":
      return `<div class="page-cover">
  ${img}
  <div class="overlay">
    <h1>${ttl || escapedHtml(bookTitle)}</h1>
    ${t ? `<p class="author">${t}</p>` : ""}
  </div>
</div>`;

    case "chapter-opener":
      return `<div class="page-opener">
  ${img}
  <div class="opener-body">
    <div class="ornament">✦</div>
    ${sub ? `<p class="chapter-label">${sub}</p>` : ""}
    ${ttl ? `<h2>${ttl}</h2>` : ""}
  </div>
</div>`;

    case "text-page": {
      const firstChar = (page.text || "").charAt(0);
      const rest = escapedHtml((page.text || "").slice(1));
      const inlineImg = page.imageUrl
        ? `<div class="inline-img"><img src="${escapedHtml(page.imageUrl)}" alt=""/></div>`
        : "";
      return `<div class="page-text">
  <div class="running-header">${escapedHtml(bookTitle)} · ${sub}</div>
  <div class="body-text">
    ${inlineImg}
    <p class="drop-cap">${escapedHtml(firstChar)}${rest}</p>
  </div>
  ${page.pageNum ? `<div class="page-num">${page.pageNum}</div>` : ""}
</div>`;
    }

    case "chapter-moment":
      return `<div class="page-moment">
  ${img}
  ${t ? `<div class="caption">${t}</div>` : ""}
</div>`;

    case "back-cover":
      return `<div class="page-back-cover">
  ${img}
  ${t ? `<div class="synopsis-box"><div class="bar"></div><p>${t}</p></div>` : ""}
</div>`;

    case "spread":
    default:
      return `<div class="page-spread">
  ${img}
  ${t ? `<div class="text-card">${t}</div>` : ""}
</div>`;
  }
}

// ─── OPF / NCX ────────────────────────────────────────────────────────────────

function generateOpf(title: string, pages: BookPage[], ids: string[]): string {
  const manifest = ids
    .map((id) => `    <item id="${id}" href="${id}.xhtml" media-type="application/xhtml+xml"/>`)
    .join("\n");

  const spine = ids
    .map((id) => `    <itemref idref="${id}"/>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapedHtml(title)}</dc:title>
    <dc:language>en</dc:language>
    <dc:identifier id="uid">urn:uuid:${crypto.randomUUID()}</dc:identifier>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="styles.css" media-type="text/css"/>
${manifest}
  </manifest>
  <spine>
${spine}
  </spine>
</package>`;
}

function generateNav(title: string, pages: BookPage[], ids: string[]): string {
  // Build nav entries only for "landmark" pages (covers, chapter openers)
  const navItems = pages
    .map((p, i) => {
      const label = escapedHtml(p.label || `Page ${i + 1}`);
      return `      <li><a href="${ids[i]}.xhtml">${label}</a></li>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>${escapedHtml(title)}</title></head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>${escapedHtml(title)}</h1>
    <ol>
${navItems}
    </ol>
  </nav>
</body>
</html>`;
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function exportBookEpub(
  pages: BookPage[],
  bookTitle: string,
  options?: { onProgress?: (cur: number, total: number) => void },
): Promise<void> {
  const { onProgress } = options ?? {};
  const zip = new JSZip();

  // mimetype — MUST be first and uncompressed
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // META-INF/container.xml
  zip.folder("META-INF")!.file(
    "container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:schemas:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`,
  );

  const oebps = zip.folder("OEBPS")!;

  // Styles
  oebps.file("styles.css", STYLES);

  // Page XHTML files
  const ids: string[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const id   = `page${String(i).padStart(3, "0")}`;
    ids.push(id);
    const body = pageHtml(page, bookTitle);
    oebps.file(`${id}.xhtml`, xhtml(id, page.label || bookTitle, body));
    onProgress?.(i + 1, pages.length);
  }

  // Package document & nav
  oebps.file("content.opf", generateOpf(bookTitle, pages, ids));
  oebps.file("nav.xhtml",   generateNav(bookTitle, pages, ids));

  // Download
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${bookTitle || "book"}.epub`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
