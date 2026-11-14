// Pocket-Web-Studio — visual drag-and-drop editor
// Copyright (c) 2026 Pocket-Designs. MIT licence, see LICENSE.
(function () {
'use strict';
const Gen = window.WeaverGen, T = window.WeaverTemplates, highlight = window.WeaverHighlight;
const api = window.weaver || null;
const DESKTOP = !!api;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

/* ================================================================== */
/* DOM helpers and icons                                               */
/* ================================================================== */

function builder(doc) {
  return function h(tag, a) {
    const el = doc.createElement(tag);
    if (a) for (const k of Object.keys(a)) {
      const v = a[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'value' || k === 'checked' || k === 'disabled' || k === 'selected') el[k] = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (let i = 2; i < arguments.length; i++) append(el, arguments[i], doc);
    return el;
  };
}
function append(el, c, doc) {
  if (c == null || c === false) return;
  if (Array.isArray(c)) { c.forEach(x => append(el, x, doc)); return; }
  el.append(c.nodeType ? c : (doc || document).createTextNode(String(c)));
}
const h = builder(document);

const P = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
const ICON = {
  heading: P('<path d="M6 5v14M18 5v14M6 12h12"/>'),
  text: P('<path d="M4 6h16M4 10h16M4 14h16M4 18h10"/>'),
  button: P('<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M8 12h8"/>'),
  image: P('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  divider: P('<path d="M3 12h18"/><path d="M7 7h10M7 17h10" opacity=".35"/>'),
  spacer: P('<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/>'),
  gallery: P('<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>'),
  slideshow: P('<rect x="5" y="5" width="14" height="11" rx="1.5"/><path d="M2 8v5M22 8v5"/><circle cx="9" cy="20" r=".8"/><circle cx="12" cy="20" r=".8"/><circle cx="15" cy="20" r=".8"/>'),
  video: P('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/>'),
  map: P('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  ticker: P('<path d="M3 9h18M3 15h18"/><path d="M7 12h10M14 10l3 2-3 2"/>'),
  card: P('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 11h16M8 15h8M8 18h5"/>'),
  quote: P('<path d="M7 8c-2 1-3 3-3 5.5V17h5v-5H6.5M17 8c-2 1-3 3-3 5.5V17h5v-5h-2.5"/>'),
  table: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 15h18M9.5 4v16"/>'),
  faq: P('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.2v.1"/>'),
  form: P('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>'),
  html: P('<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>'),
  section: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/>'),
  header: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M6 6.5h4"/>'),
  footer: P('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18"/><path d="M6 17.5h4"/>'),
  page: P('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'),
  home: P('<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>'),
  grip: P('<g fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.7"/><circle cx="15" cy="6" r="1.7"/><circle cx="9" cy="12" r="1.7"/><circle cx="15" cy="12" r="1.7"/><circle cx="9" cy="18" r="1.7"/><circle cx="15" cy="18" r="1.7"/></g>'),
  up: P('<path d="m6 14 6-6 6 6"/>'),
  down: P('<path d="m6 10 6 6 6-6"/>'),
  copy: P('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  trash: P('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  plus: P('<path d="M12 5v14M5 12h14"/>'),
  close: P('<path d="M6 6l12 12M18 6 6 18"/>'),
  undo: P('<path d="M9 5 4 10l5 5"/><path d="M4 10h10a6 6 0 0 1 0 12h-3"/>'),
  redo: P('<path d="m15 5 5 5-5 5"/><path d="M20 10H10a6 6 0 0 0 0 12h3"/>'),
  save: P('<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 21v-7h8v7"/>'),
  open: P('<path d="M3 6v13h18V8h-9l-2-2z"/>'),
  newfile: P('<path d="M6 3h8l4 4v14H6z"/><path d="M12 11v6M9 14h6"/>'),
  desktop: P('<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M9 20h6M12 16v4"/>'),
  tablet: P('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M11 18h2"/>'),
  phone: P('<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>'),
  external: P('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>'),
  publish: P('<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v5h16v-5"/>'),
  palette: P('<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.5-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>'),
  pages: P('<path d="M8 3h8l4 4v11H8z"/><path d="M16 3v4h4M4 7v14h12"/>'),
  add: P('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/>'),
  bold: P('<path d="M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z" stroke-width="2.2"/>'),
  italic: P('<path d="M11 5h6M7 19h6M14 5l-4 14" stroke-width="2"/>'),
  underline: P('<path d="M7 4v7a5 5 0 0 0 10 0V4M5 20h14" stroke-width="2"/>'),
  link: P('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  ul: P('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>'),
  ol: P('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 5h1.5v4M4 9h3M4 15h3l-3 3.5h3"/>'),
  left: P('<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>'),
  center: P('<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>'),
  right: P('<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>'),
  warn: P('<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17v.1"/>'),
  info: P('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/>'),
  check: P('<path d="m5 12 5 5 9-10"/>'),
  globe: P('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>'),
  folder: P('<path d="M3 6v13h18V8h-9l-2-2z"/>'),
  eye: P('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  code: P('<path d="m8 8-4 4 4 4M16 8l4 4-4 4"/>'),
  pencil: P('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
  upload: P('<path d="M12 16V5M7 10l5-5 5 5"/><path d="M4 16v4h16v-4"/>')
};
const icon = (name, cls) => h('span', { class: 'ico' + (cls ? ' ' + cls : ''), html: ICON[name] || '' });

/* ================================================================== */
/* State                                                               */
/* ================================================================== */

let site = null;
const assets = Object.create(null);           // name -> { mime, w, h, bytes, url }
let pageId = null;
let sel = null;                               // { kind: 'el' | 'section' | 'header' | 'footer', id }
let mode = 'edit';
let device = 'desktop';
let leftTab = 'add';
let projectPath = null;
let projectName = 'Untitled website';
let dirty = false;
let history = [], hIndex = -1, lastKey = null, lastTime = 0;
let drag = null, dropTarget = null;
let previewPage = null;
let codeFile = 'index.html';
let appVersion = '2.0.0';
const LOGO_SRC = (document.querySelector('.brand-logo') || {}).src || 'logo.png';

const uid = () => Math.random().toString(36).slice(2, 7) + Date.now().toString(36).slice(-3);
const ctx = { id: uid, ph: ensurePlaceholder };
const curPage = () => site && (site.pages.find(p => p.id === pageId) || site.pages[0]);
const clone = o => JSON.parse(JSON.stringify(o));

/* ================================================================== */
/* Pictures and other files                                            */
/* ================================================================== */

function addAsset(name, mime, bytes, w, hgt) {
  if (assets[name]) URL.revokeObjectURL(assets[name].url);
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  assets[name] = { mime, w: w || 0, h: hgt || 0, bytes, url };
  return name;
}
function clearAssets() { Object.keys(assets).forEach(n => { URL.revokeObjectURL(assets[n].url); delete assets[n]; }); }
const assetUrl = n => Gen.isUrl(n) ? n : (assets[n] && assets[n].url) || '';
const assetInfo = n => assets[n] ? { mime: assets[n].mime, w: assets[n].w, h: assets[n].h } : null;
function ensurePlaceholder(i) {
  const name = 'placeholder-' + i + '.svg';
  if (!assets[name]) addAsset(name, 'image/svg+xml', new TextEncoder().encode(T.placeholderSvg(i)), 1200, 800);
  return name;
}
function uniqueAssetName(base, ext) {
  let name = base + '.' + ext, n = 2;
  while (assets[name]) name = base + '-' + (n++) + '.' + ext;
  return name;
}
const MAX_SIDE = 2000;
const IMG_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/avif': 'avif', 'image/bmp': 'bmp' };
async function importImageFile(file) {
  let mime = (file.type || '').toLowerCase();
  if (mime === 'image/jpg') mime = 'image/jpeg';
  if (!IMG_EXT[mime]) throw new Error('“' + file.name + '” isn’t a picture Pocket-Web-Studio can use. Try a JPG, PNG, GIF, WebP or SVG file.');
  let bytes = new Uint8Array(await file.arrayBuffer());
  let w = 0, hgt = 0;
  if (mime === 'image/svg+xml') {
    const dims = await new Promise(res => { const u = URL.createObjectURL(file); const im = new Image(); im.onload = () => { res([im.naturalWidth, im.naturalHeight]); URL.revokeObjectURL(u); }; im.onerror = () => { res([800, 600]); URL.revokeObjectURL(u); }; im.src = u; });
    w = dims[0] || 800; hgt = dims[1] || 600;
  } else {
    let bmp;
    try { bmp = await createImageBitmap(file); } catch (e) { throw new Error('“' + file.name + '” could not be opened. It may be damaged or in an unusual format.'); }
    w = bmp.width; hgt = bmp.height;
    const big = Math.max(w, hgt) > MAX_SIDE;
    if (mime !== 'image/gif' && (big || bytes.length > 900 * 1024 || mime === 'image/bmp')) {
      const scale = Math.min(1, MAX_SIDE / Math.max(w, hgt));
      const cw = Math.round(w * scale), ch = Math.round(hgt * scale);
      const c = document.createElement('canvas'); c.width = cw; c.height = ch;
      c.getContext('2d').drawImage(bmp, 0, 0, cw, ch);
      const blob = await new Promise(r => c.toBlob(r, 'image/webp', 0.85));
      if (blob && (blob.size < bytes.length || mime === 'image/bmp')) { bytes = new Uint8Array(await blob.arrayBuffer()); mime = 'image/webp'; w = cw; hgt = ch; }
    }
    if (bmp.close) bmp.close();
  }
  const base = Gen.slugify(file.name.replace(/\.[^.]+$/, '')) || 'picture';
  return addAsset(uniqueAssetName(base, IMG_EXT[mime]), mime, bytes, w, hgt);
}
async function importImages(files) {
  const names = [];
  const list = Array.from(files || []).filter(f => /^image\//.test(f.type));
  if (!list.length) return names;
  if (list.length > 1) toast('Adding ' + list.length + ' pictures…');
  for (const f of list) {
    try { names.push(await importImageFile(f)); } catch (err) { toast(err.message); }
  }
  return names;
}
async function importVideoFile(file) {
  if (!/^video\/(mp4|webm|ogg)$/.test(file.type)) throw new Error('Choose an MP4 or WebM video file.');
  if (file.size > 80 * 1024 * 1024) throw new Error('That video is over 80 MB. Upload it to YouTube or Vimeo and paste the link instead.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const ext = file.type === 'video/webm' ? 'webm' : file.type === 'video/ogg' ? 'ogv' : 'mp4';
  return addAsset(uniqueAssetName(Gen.slugify(file.name.replace(/\.[^.]+$/, '')) || 'video', ext), file.type, bytes, 0, 0);
}
function pickFiles(accept, multiple) {
  return new Promise(resolve => {
    const inp = h('input', { type: 'file', accept, hidden: true });
    if (multiple) inp.multiple = true;
    inp.addEventListener('change', () => { resolve(Array.from(inp.files || [])); inp.remove(); });
    document.body.appendChild(inp);
    inp.click();
  });
}

/* ================================================================== */
/* Model helpers                                                       */
/* ================================================================== */

function findElement(id) {
  for (const page of site.pages) for (const section of page.sections) for (let ci = 0; ci < section.columns.length; ci++) {
    const col = section.columns[ci];
    const index = col.elements.findIndex(e => e.id === id);
    if (index >= 0) return { page, section, col, colIndex: ci, index, el: col.elements[index] };
  }
  return null;
}
function findSection(id) {
  for (const page of site.pages) {
    const index = page.sections.findIndex(s => s.id === id);
    if (index >= 0) return { page, section: page.sections[index], index };
  }
  return null;
}
function reId(obj) {
  const c = clone(obj);
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (Array.isArray(o)) { o.forEach(walk); return; }
    if (typeof o.id === 'string') o.id = uid();
    Object.values(o).forEach(walk);
  })(c);
  return c;
}
function setLayout(s, layout) {
  const n = Gen.LAYOUTS[layout] || 1;
  while (s.columns.length < n) s.columns.push({ id: uid(), elements: [] });
  if (s.columns.length > n) {
    const extra = s.columns.splice(n);
    extra.forEach(c => s.columns[n - 1].elements.push(...c.elements));
  }
  s.layout = layout;
}
function setPath(obj, path, value) {
  const parts = path.split('.');
  let o = obj;
  for (let i = 0; i < parts.length - 1; i++) { o = o[isNaN(parts[i]) ? parts[i] : +parts[i]]; if (o == null) return; }
  const last = parts[parts.length - 1];
  o[isNaN(last) ? last : +last] = value;
}
function normalizeSite(s) {
  const base = T.makeSite('blank', ctx);
  s.theme = Object.assign({}, base.theme, s.theme || {});
  s.theme.colors = Object.assign({}, base.theme.colors, (s.theme && s.theme.colors) || {});
  s.theme.fonts = Object.assign({}, base.theme.fonts, (s.theme && s.theme.fonts) || {});
  s.header = Object.assign({}, base.header, s.header || {});
  s.footer = Object.assign({}, base.footer, s.footer || {});
  s.settings = Object.assign({}, base.settings, s.settings || {});
  if (!Array.isArray(s.header.menuLinks)) s.header.menuLinks = [];
  if (!Array.isArray(s.pages) || !s.pages.length) s.pages = base.pages;
  s.pages.forEach(p => {
    p.sections = p.sections || [];
    p.sections.forEach(sec => { sec.columns = sec.columns || [{ id: uid(), elements: [] }]; sec.columns.forEach(c => { c.elements = c.elements || []; c.elements.forEach(e => { e.props = e.props || {}; e.style = e.style || {}; }); }); });
  });
  s.name = s.name || 'My Website';
  return s;
}

/* ================================================================== */
/* History and change tracking                                         */
/* ================================================================== */

function resetHistory() { history = [JSON.stringify(site)]; hIndex = 0; lastKey = null; updateUndoButtons(); }
function recordHistory(key) {
  const snap = JSON.stringify(site);
  if (snap === history[hIndex]) return false;
  const now = Date.now();
  if (key && key === lastKey && now - lastTime < 1200 && hIndex === history.length - 1 && hIndex > 0) history[hIndex] = snap;
  else {
    history = history.slice(0, hIndex + 1);
    history.push(snap);
    if (history.length > 200) history.shift();
    hIndex = history.length - 1;
  }
  lastKey = key || null; lastTime = now;
  updateUndoButtons();
  return true;
}
function changed(o) {
  o = o || {};
  if (!recordHistory(o.key)) { if (o.panel) renderPanel(); return; }
  setDirty(true);
  if (o.render !== false) renderCanvas();
  if (o.panel) renderPanel();
  if (o.pages) renderPagesTab();
  if (o.design) renderDesignTab();
  scheduleDraft();
}
function undoRedo(dir) {
  const ni = hIndex + dir;
  if (ni < 0 || ni >= history.length) return;
  hIndex = ni; lastKey = null;
  site = JSON.parse(history[hIndex]);
  if (!site.pages.some(p => p.id === pageId)) pageId = site.pages[0].id;
  if (sel && sel.kind === 'el' && !findElement(sel.id)) sel = null;
  if (sel && sel.kind === 'section' && !findSection(sel.id)) sel = null;
  setDirty(true);
  updateUndoButtons();
  renderAll();
  scheduleDraft();
}
function updateUndoButtons() {
  const u = $('#undoBtn'), r = $('#redoBtn');
  if (u) u.disabled = hIndex <= 0;
  if (r) r.disabled = hIndex >= history.length - 1;
}
function setDirty(d) {
  dirty = d;
  if (api) api.setDirty(d && DESKTOP);
  updateTitle();
}
function updateTitle() {
  document.title = (dirty && DESKTOP ? '● ' : '') + projectName + ' — Pocket-Web-Studio';
  const pn = $('#projName'); if (pn) pn.textContent = projectName;
  const dd = $('#dirtyDot'); if (dd) dd.hidden = !(dirty && DESKTOP);
}

/* ================================================================== */
/* Canvas                                                              */
/* ================================================================== */

const EDIT_CSS = `
html { scroll-behavior: auto !important; }
#wv-root { display: flex; flex-direction: column; min-height: 100vh; flex: 1 0 auto; }
#wv-root a { cursor: inherit; }
#wv-root [contenteditable] { cursor: text; }
#wv-root [data-wv-section]:hover, #wv-root [data-wv-part]:hover { outline: 1px dashed rgba(47, 91, 234, 0.45); outline-offset: -1px; }
#wv-root [data-wv]:hover { outline: 1.5px dashed rgba(47, 91, 234, 0.85); outline-offset: 3px; }
#wv-root .wv-is-selected { outline: 2px solid #2f5bea !important; outline-offset: 3px !important; }
#wv-root [data-wv-section].wv-is-selected, #wv-root [data-wv-part].wv-is-selected { outline-offset: -2px !important; }
#wv-root [contenteditable]:focus { outline: 2px solid #2f5bea; outline-offset: 3px; }
#wv-root iframe, #wv-root video, #wv-root input, #wv-root textarea, #wv-root form button { pointer-events: none; }
#wv-root .wv-drop-hint { display: grid; place-items: center; min-height: 5.5rem; padding: 1rem; border: 2px dashed currentColor; border-radius: 12px; opacity: 0.4; font: 500 14px/1.35 system-ui, sans-serif; text-align: center; }
#wv-root .wv-empty-page { margin: 4rem auto; width: min(90%, 640px); padding: 4rem 2rem; border: 2px dashed #9aa6c4; border-radius: 16px; text-align: center; font: 500 16px/1.5 system-ui, sans-serif; color: #5a6375; background: rgba(255, 255, 255, 0.7); }
#wv-root .wv-edit-empty { display: grid; place-items: center; min-height: 9rem; padding: 1.5rem; border: 2px dashed currentColor; border-radius: 12px; opacity: 0.55; font: 500 14px/1.4 system-ui, sans-serif; text-align: center; aspect-ratio: auto; }
#wv-root .wv-spacer { background: repeating-linear-gradient(45deg, rgba(47, 91, 234, 0.09) 0 8px, transparent 8px 16px); border-radius: 6px; }
#wv-root .wv-embed { min-height: 2rem; }
#wv-root .wv-is-selected[class*="motion-"], #wv-root .wv-is-selected .wv-ticker-track { animation-play-state: paused; }
#wv-root .wv-drop-col { background-color: rgba(47, 91, 234, 0.06); outline: 2px dashed rgba(47, 91, 234, 0.7) !important; outline-offset: 4px; border-radius: 4px; }
#wv-drop-line { position: absolute; z-index: 2147483001; height: 4px; border-radius: 3px; background: #2f5bea; box-shadow: 0 0 0 2px #fff; pointer-events: none; }
#wv-drop-line::before, #wv-drop-line::after { content: ""; position: absolute; top: -4px; width: 12px; height: 12px; border-radius: 50%; background: #2f5bea; box-shadow: 0 0 0 2px #fff; }
#wv-drop-line::before { left: -6px; }
#wv-drop-line::after { right: -6px; }
#wv-drop-line span { position: absolute; left: 50%; top: -28px; transform: translateX(-50%); padding: 4px 9px; border-radius: 5px; background: #2f5bea; color: #fff; font: 600 11.5px/1.2 system-ui, -apple-system, "Segoe UI", sans-serif; white-space: nowrap; }
#wv-ui { position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483000; }
#wv-ui .wv-tb { position: absolute; display: flex; align-items: center; gap: 1px; padding: 3px; border-radius: 8px; background: #2f5bea; color: #fff; box-shadow: 0 4px 14px rgba(20, 30, 70, 0.3); font: 600 12px/1 system-ui, -apple-system, "Segoe UI", sans-serif; white-space: nowrap; user-select: none; }
#wv-ui .wv-tb.is-section { background: #39415c; }
#wv-ui .wv-tb button, #wv-ui .wv-tb .wv-grip { all: unset; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; gap: 5px; height: 26px; min-width: 26px; border-radius: 5px; cursor: pointer; }
#wv-ui .wv-tb .wv-grip { padding: 0 9px 0 4px; cursor: grab; }
#wv-ui .wv-tb button:hover, #wv-ui .wv-tb .wv-grip:hover { background: rgba(255, 255, 255, 0.2); }
#wv-ui .wv-tb button:focus-visible { outline: 2px solid #fff; }
#wv-ui .wv-tb svg { display: block; flex: none; width: 16px; height: 16px; max-width: none; }
#wv-ui .wv-tb .wv-sep { width: 1px; height: 18px; margin: 0 3px; background: rgba(255, 255, 255, 0.3); }
#wv-ui .wv-pop { position: absolute; display: grid; gap: 8px; width: 280px; padding: 12px; border-radius: 10px; background: #fff; color: #1b2130; box-shadow: 0 10px 30px rgba(20, 30, 70, 0.3); font: 13px/1.3 system-ui, -apple-system, "Segoe UI", sans-serif; }
#wv-ui .wv-pop b { font-weight: 600; }
#wv-ui .wv-pop select, #wv-ui .wv-pop input { all: unset; box-sizing: border-box; width: 100%; padding: 7px 9px; border: 1px solid #c9cfdb; border-radius: 6px; background: #fff; color: #1b2130; font: inherit; }
#wv-ui .wv-pop select { appearance: auto; }
#wv-ui .wv-rs { position: absolute; box-sizing: border-box; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%; background: #fff; border: 3px solid #2f5bea; box-shadow: 0 1px 5px rgba(20, 30, 70, 0.35); cursor: ew-resize; touch-action: none; }
#wv-ui .wv-rs.v { cursor: ns-resize; }
#wv-ui .wv-rs:hover { background: #2f5bea; }
#wv-float { position: fixed; z-index: 2147483600; pointer-events: none; padding: 5px 10px; border-radius: 6px; background: #2f5bea; color: #fff; font: 600 12px/1.2 system-ui, -apple-system, "Segoe UI", sans-serif; box-shadow: 0 4px 14px rgba(20, 30, 70, 0.3); white-space: nowrap; }
html.wv-pdrag, html.wv-pdrag * { user-select: none !important; -webkit-user-select: none !important; cursor: grabbing !important; }
html.wv-presize, html.wv-presize * { user-select: none !important; -webkit-user-select: none !important; }
.wv-dragging { opacity: 0.35; }
#wv-ui .wv-pop .row { display: flex; gap: 6px; justify-content: flex-end; }
#wv-ui .wv-pop button { all: unset; padding: 7px 12px; border-radius: 6px; border: 1px solid #c9cfdb; cursor: pointer; font-weight: 600; }
#wv-ui .wv-pop button.primary { background: #2f5bea; border-color: #2f5bea; color: #fff; }
`;

const canvasFrame = () => $('#canvas');
const cdoc = () => { try { return canvasFrame().contentDocument; } catch (e) { return null; } };
let canvasReady = false;

function initCanvas() {
  const f = canvasFrame();
  canvasReady = false;
  f.addEventListener('load', onCanvasLoad, { once: true });
  f.srcdoc = '<!DOCTYPE html><html lang="en" class="js"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link id="wv-fonts" rel="stylesheet"><style id="wv-theme"></style><style id="wv-edit">' + EDIT_CSS + '</style></head><body><div id="wv-root"></div><div id="wv-ui"></div></body></html>';
}

function onCanvasLoad() {
  const d = cdoc();
  if (!d || !d.getElementById('wv-root')) return;
  canvasReady = true;
  try { d.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* ignore */ }
  d.addEventListener('click', onCanvasClick);
  d.addEventListener('auxclick', e => { if (e.target.closest && e.target.closest('a')) e.preventDefault(); });
  d.addEventListener('submit', e => e.preventDefault());
  d.addEventListener('input', onCanvasInput);
  d.addEventListener('keydown', onCanvasKey);
  d.addEventListener('paste', onCanvasPaste);
  d.addEventListener('focusout', onCanvasFocusOut);
  d.addEventListener('pointerdown', onCanvasPointerDown);
  d.addEventListener('pointermove', onCanvasPointerMove);
  d.addEventListener('pointerup', onCanvasPointerUp);
  d.addEventListener('pointercancel', () => endPointerDrag(false));
  d.addEventListener('dragstart', onCanvasDragStart);
  d.addEventListener('dragover', onCanvasDragOver);
  d.addEventListener('dragleave', e => { if (!e.relatedTarget) hideDropLine(); });
  d.addEventListener('drop', onCanvasDrop);
  d.addEventListener('dragend', endDrag);
  d.addEventListener('load', e => { if (e.target && e.target.tagName === 'IMG') repositionSoon(); }, true);
  d.defaultView.addEventListener('resize', repositionSoon);
  renderCanvas();
}

function renderCanvas() {
  const d = cdoc();
  if (!canvasReady || !d || !site) return;
  const page = curPage();
  const r = Gen.renderEditPage(site, page, { assetUrl, assetInfo, cssAssetUrl: assetUrl });
  d.getElementById('wv-theme').textContent = r.css;
  const fl = d.getElementById('wv-fonts');
  if (r.fontsHref) { if (fl.getAttribute('href') !== r.fontsHref) fl.setAttribute('href', r.fontsHref); }
  else fl.removeAttribute('href');
  d.documentElement.lang = site.settings.language || 'en';
  d.getElementById('wv-root').innerHTML = r.body;
  applySelection();
}

let repoT;
function repositionSoon() { clearTimeout(repoT); repoT = setTimeout(applySelection, 60); }

function nodeFor(s) {
  const d = cdoc();
  if (!s || !d) return null;
  if (s.kind === 'el') return d.querySelector('[data-wv="' + s.id + '"]');
  if (s.kind === 'section') return d.querySelector('[data-wv-section="' + s.id + '"]');
  return d.querySelector('[data-wv-part="' + s.kind + '"]');
}

function select(s, opts) {
  sel = s;
  applySelection();
  renderPanel();
  if (opts && opts.scroll) scrollToSel();
}
function scrollToSel() {
  // Scroll only the page inside the canvas. (scrollIntoView would also scroll the editor window.)
  setTimeout(() => {
    const n = nodeFor(sel), d = cdoc();
    if (!n || !d) return;
    const win = d.defaultView, r = n.getBoundingClientRect(), vh = win.innerHeight;
    if (r.top < 70 || r.bottom > vh - 20) win.scrollTo({ top: Math.max(0, win.scrollY + r.top - Math.max(80, (vh - Math.min(r.height, vh * 0.7)) / 2)), behavior: 'smooth' });
    setTimeout(applySelection, 450);
  }, 30);
}

function applySelection() {
  const d = cdoc();
  if (!d || !d.getElementById('wv-ui')) return;
  d.querySelectorAll('.wv-is-selected').forEach(n => n.classList.remove('wv-is-selected'));
  const ui = d.getElementById('wv-ui');
  ui.innerHTML = '';
  const n = nodeFor(sel);
  if (!n) return;
  n.classList.add('wv-is-selected');
  buildToolbar(n, ui);
}

function buildToolbar(n, ui) {
  const d = cdoc(), H = builder(d);
  const tbtn = (name, title, fn, keep) => H('button', {
    type: 'button', title, 'aria-label': title, html: ICON[name],
    onmousedown: keep ? (e => e.preventDefault()) : null,
    onclick: e => { e.preventDefault(); e.stopPropagation(); fn(e); }
  });
  let tb;
  if (sel.kind === 'el') {
    const f = findElement(sel.id);
    if (!f) return;
    const rich = f.el.type === 'text';
    tb = H('div', { class: 'wv-tb' },
      H('span', { class: 'wv-grip', draggable: 'true', 'data-drag': 'el', title: 'Drag to move', html: ICON.grip + '<span>' + Gen.esc(T.LABELS[f.el.type] || f.el.type) + '</span>' }),
      rich ? [H('span', { class: 'wv-sep' }),
        tbtn('bold', 'Bold', () => fmt('bold'), true), tbtn('italic', 'Italic', () => fmt('italic'), true), tbtn('underline', 'Underline', () => fmt('underline'), true),
        tbtn('link', 'Link', () => openLinkPopover(tb), true), tbtn('ul', 'Bulleted list', () => fmt('insertUnorderedList'), true), tbtn('ol', 'Numbered list', () => fmt('insertOrderedList'), true)] : null,
      H('span', { class: 'wv-sep' }),
      tbtn('up', 'Move up', () => moveElement(sel.id, -1)),
      tbtn('down', 'Move down', () => moveElement(sel.id, 1)),
      tbtn('copy', 'Duplicate', duplicateSel),
      tbtn('trash', 'Delete', deleteSel));
  } else if (sel.kind === 'section') {
    tb = H('div', { class: 'wv-tb is-section' },
      H('span', { class: 'wv-grip', draggable: 'true', 'data-drag': 'section', title: 'Drag to move', html: ICON.grip + '<span>Section</span>' }),
      H('span', { class: 'wv-sep' }),
      tbtn('up', 'Move section up', () => moveSection(sel.id, -1)),
      tbtn('down', 'Move section down', () => moveSection(sel.id, 1)),
      tbtn('copy', 'Duplicate section', duplicateSel),
      tbtn('trash', 'Delete section', deleteSel));
  } else {
    tb = H('div', { class: 'wv-tb is-section' }, H('span', { class: 'wv-grip', html: ICON[sel.kind] + '<span>' + (sel.kind === 'header' ? 'Header (every page)' : 'Footer (every page)') + '</span>' }));
  }
  ui.appendChild(tb);
  const win = d.defaultView, r = n.getBoundingClientRect();
  const sx = win.scrollX, sy = win.scrollY, vw = d.documentElement.clientWidth;
  const th = tb.offsetHeight, tw = tb.offsetWidth;
  let top, left = r.left + sx;
  if (sel.kind === 'el') { top = r.top + sy - th - 7; if (top < sy + 2) top = r.bottom + sy + 7; }
  else { top = r.top + sy + 8; left = r.left + sx + 8; }
  left = Math.max(sx + 4, Math.min(left, sx + vw - tw - 6));
  tb.style.top = top + 'px';
  tb.style.left = left + 'px';
  if (sel.kind === 'el') addResizeHandles(n, ui, H);
}

/* ---------- resize handles ---------- */

function addResizeHandles(n, ui, H) {
  const f = findElement(sel.id);
  if (!f) return;
  const d = cdoc(), win = d.defaultView, r = n.getBoundingClientRect();
  const sx = win.scrollX, sy = win.scrollY;
  if ((STYLE_SUPPORT[f.el.type] || []).includes('width')) {
    const right = (f.el.style.align || 'left') !== 'right';
    const hd = H('span', { class: 'wv-rs', title: 'Drag to change the width', 'data-resize': 'width' });
    hd.style.left = ((right ? r.right : r.left) + sx) + 'px';
    hd.style.top = (r.top + sy + Math.min(r.height / 2, 120)) + 'px';
    ui.appendChild(hd);
  }
  if (f.el.type === 'spacer') {
    const hd = H('span', { class: 'wv-rs v', title: 'Drag to change the height', 'data-resize': 'height' });
    hd.style.left = (r.left + sx + r.width / 2) + 'px';
    hd.style.top = (r.bottom + sy) + 'px';
    ui.appendChild(hd);
  }
}
function floatLabel(text, x, y) {
  const d = cdoc();
  let f = d.getElementById('wv-float');
  if (!f) { f = d.createElement('div'); f.id = 'wv-float'; d.body.appendChild(f); }
  f.textContent = text;
  f.style.left = (x + 14) + 'px';
  f.style.top = (y + 14) + 'px';
}
function removeFloat() { const d = cdoc(); const f = d && d.getElementById('wv-float'); if (f) f.remove(); }

/* ---------- drag items straight on the page (no grip needed) ---------- */

let pdrag = null, swallowClick = false;
function onCanvasPointerDown(e) {
  if (e.button !== 0 || drag || pdrag) return;
  const t = e.target.nodeType === 1 ? e.target : e.target.parentElement;
  if (!t) return;
  const rs = t.closest('[data-resize]');
  if (rs && sel && sel.kind === 'el') {
    const f = findElement(sel.id), n = nodeFor(sel);
    if (!f || !n) return;
    e.preventDefault();
    const col = n.closest('[data-wv-col]') || n.parentElement;
    pdrag = { resize: rs.dataset.resize, el: f.el, colRect: col.getBoundingClientRect(), startY: e.clientY, startH: n.getBoundingClientRect().height, active: true };
    cdoc().documentElement.classList.add('wv-presize');
    return;
  }
  if (t.closest('#wv-ui') || t.closest('input,select,textarea,button:not([data-wv])')) return;
  const elNode = t.closest('[data-wv]');
  let payload, node;
  if (elNode) {
    // Inside a selected item, a press-and-drag selects words instead of moving it.
    if (sel && sel.kind === 'el' && sel.id === elNode.dataset.wv && t.closest('[contenteditable]')) return;
    payload = { kind: 'move-el', id: elNode.dataset.wv }; node = elNode;
  } else {
    const sec = t.closest('[data-wv-section]');
    if (!sec) return;
    payload = { kind: 'move-section', id: sec.dataset.wvSection }; node = sec;
  }
  pdrag = { payload, node, x: e.clientX, y: e.clientY, active: false };
}
function onCanvasPointerMove(e) {
  if (!pdrag) return;
  const d = cdoc();
  if (pdrag.resize) { e.preventDefault(); pdrag.lastX = e.clientX; pdrag.lastY = e.clientY; if (!pdrag.raf) pdrag.raf = d.defaultView.requestAnimationFrame(doResize); return; }
  if (!pdrag.active) {
    if (Math.hypot(e.clientX - pdrag.x, e.clientY - pdrag.y) < 6) return;
    pdrag.active = true;
    drag = pdrag.payload;
    const a = d.activeElement; if (a && a.isContentEditable) a.blur();
    try { d.getSelection().removeAllRanges(); } catch (err) { /* ignore */ }
    d.documentElement.classList.add('wv-pdrag');
    pdrag.node.classList.add('wv-dragging');
    const ui = d.getElementById('wv-ui'); if (ui) ui.innerHTML = '';
    const f = pdrag.payload.kind === 'move-el' && findElement(pdrag.payload.id);
    pdrag.label = 'Moving ' + (f ? (T.LABELS[f.el.type] || 'item').toLowerCase() : 'section');
    pdrag.timer = setInterval(autoScroll, 30);
  }
  e.preventDefault();
  pdrag.lastX = e.clientX; pdrag.lastY = e.clientY;
  floatLabel(pdrag.label, e.clientX, e.clientY);
  dropTarget = computeTarget(pdrag.payload, e.clientX, e.clientY);
  showDropLine(dropTarget, pdrag.payload);
}
function autoScroll() {
  if (!pdrag || !pdrag.active) return;
  const win = cdoc().defaultView, y = pdrag.lastY, vh = win.innerHeight, edge = 50;
  let dy = 0;
  if (y < edge) dy = -Math.ceil((edge - y) / 3);
  else if (y > vh - edge) dy = Math.ceil((y - (vh - edge)) / 3);
  if (!dy) return;
  win.scrollBy(0, dy);
  dropTarget = computeTarget(pdrag.payload, pdrag.lastX, y);
  showDropLine(dropTarget, pdrag.payload);
}
function doResize() {
  if (!pdrag || !pdrag.resize) return;
  pdrag.raf = 0;
  const el = pdrag.el, x = pdrag.lastX, y = pdrag.lastY, c = pdrag.colRect;
  if (pdrag.resize === 'width') {
    const align = el.style.align || 'left';
    let frac = align === 'center' ? 2 * Math.abs(x - (c.left + c.width / 2)) / c.width : align === 'right' ? (c.right - x) / c.width : (x - c.left) / c.width;
    const pct = Math.max(10, Math.min(100, Math.round(frac * 20) * 5));
    floatLabel('Width ' + pct + '%', x, y);
    if (String(pct) !== String(el.style.width || '100')) { el.style.width = String(pct); changed({ key: 'el:' + el.id + ':width' }); }
  } else {
    const hpx = Math.max(4, Math.min(600, Math.round((pdrag.startH + y - pdrag.startY) / 8) * 8));
    floatLabel('Height ' + hpx + ' px', x, y);
    if (hpx !== +el.props.height) { el.props.height = hpx; changed({ key: 'el:' + el.id + ':height' }); }
  }
}
async function onCanvasPointerUp() {
  if (!pdrag) return;
  if (pdrag.resize) { endPointerDrag(false); renderPanel(); return; }
  if (!pdrag.active) { pdrag = null; return; }
  const payload = pdrag.payload, target = dropTarget;
  endPointerDrag(true);
  if (target) await applyDrop(payload, target); else renderCanvas();
}
function endPointerDrag(swallow) {
  const d = cdoc();
  if (pdrag) {
    clearInterval(pdrag.timer);
    if (pdrag.node) pdrag.node.classList.remove('wv-dragging');
    if (pdrag.active && swallow) { swallowClick = true; setTimeout(() => { swallowClick = false; }, 0); }
  }
  pdrag = null;
  if (d) d.documentElement.classList.remove('wv-pdrag', 'wv-presize');
  removeFloat();
  endDrag();
  applySelection();
}

function onCanvasClick(e) {
  const t = e.target.nodeType === 1 ? e.target : e.target.parentElement;
  if (!t || t.closest('#wv-ui')) return;
  if (t.closest('a')) e.preventDefault();
  if (swallowClick) { swallowClick = false; return; }
  if (t.closest('summary') && !t.closest('[contenteditable]')) e.preventDefault();
  const elNode = t.closest('[data-wv]');
  if (elNode) { if (!sel || sel.kind !== 'el' || sel.id !== elNode.dataset.wv) select({ kind: 'el', id: elNode.dataset.wv }); return; }
  const part = t.closest('[data-wv-part]');
  if (part) { select({ kind: part.dataset.wvPart }); return; }
  const sec = t.closest('[data-wv-section]');
  if (sec) { select({ kind: 'section', id: sec.dataset.wvSection }); return; }
  select(null);
}

/* ---------- typing on the page ---------- */

const RICH_TAGS = { P: 'p', DIV: 'p', BR: 'br', STRONG: 'strong', B: 'strong', EM: 'em', I: 'em', U: 'u', A: 'a', UL: 'ul', OL: 'ol', LI: 'li' };
function safeHref(href) {
  const v = String(href || '').trim();
  if (!v) return '';
  if (/^(https?:|mailto:|tel:|page:|#)/i.test(v)) return v;
  if (/^[a-z][\w+.-]*:/i.test(v)) return '';
  return v;
}
function sanitizeRich(html) {
  const doc = new DOMParser().parseFromString('<body>' + html, 'text/html');
  const inline = node => {
    let out = '';
    node.childNodes.forEach(c => {
      if (c.nodeType === 3) { out += Gen.esc(c.nodeValue); return; }
      if (c.nodeType !== 1) return;
      const t = RICH_TAGS[c.tagName];
      const inner = inline(c);
      if (t === 'br') out += '<br>';
      else if (t === 'a') {
        const href = safeHref(c.getAttribute('href'));
        out += href ? '<a href="' + Gen.escAttr(href) + '"' + (c.getAttribute('target') === '_blank' ? ' target="_blank" rel="noopener"' : '') + '>' + inner + '</a>' : inner;
      } else if (t === 'strong' || t === 'em' || t === 'u') out += inner ? '<' + t + '>' + inner + '</' + t + '>' : '';
      else if (t === 'p' || t === 'li' || t === 'ul' || t === 'ol') out += (out && !out.endsWith('<br>') ? '<br>' : '') + inner;
      else out += inner;
    });
    return out;
  };
  let out = '', buf = '';
  const flush = () => { if (buf.replace(/<br>/g, '').trim()) out += '<p>' + buf.replace(/(<br>)+$/, '') + '</p>'; buf = ''; };
  doc.body.childNodes.forEach(c => {
    if (c.nodeType === 1 && (c.tagName === 'P' || c.tagName === 'DIV')) {
      flush();
      const inner = inline(c);
      out += inner.replace(/<br>/g, '').trim() ? '<p>' + inner + '</p>' : '<p><br></p>';
    } else if (c.nodeType === 1 && (c.tagName === 'UL' || c.tagName === 'OL')) {
      flush();
      const items = Array.from(c.children).filter(li => li.tagName === 'LI').map(li => '<li>' + inline(li) + '</li>').join('');
      if (items) out += '<' + c.tagName.toLowerCase() + '>' + items + '</' + c.tagName.toLowerCase() + '>';
    } else if (c.nodeType === 1 && c.tagName === 'BR') {
      buf += '<br>';
    } else if (c.nodeType === 3 || c.nodeType === 1) {
      buf += c.nodeType === 3 ? Gen.esc(c.nodeValue) : inline({ childNodes: [c] });
    }
  });
  flush();
  return out.replace(/(<p><br><\/p>)+$/, '');
}
function readPlain(node, single) {
  let v = node.innerText.replace(/ /g, ' ');
  if (v.endsWith('\n')) v = v.slice(0, -1);
  return single ? v.replace(/\s*\n\s*/g, ' ') : v;
}
function commitField(node) {
  const field = node.dataset.wvField;
  const owner = node.closest('[data-wv],[data-wv-part]');
  if (!field || !owner) return;
  const rich = node.hasAttribute('data-wv-rich');
  const value = rich ? sanitizeRich(node.innerHTML) : readPlain(node, node.hasAttribute('data-wv-single'));
  if (owner.dataset.wv) {
    const f = findElement(owner.dataset.wv);
    if (!f) return;
    setPath(f.el.props, field, value);
    changed({ key: 'type:' + f.el.id + ':' + field, render: false });
  } else if (owner.dataset.wvPart === 'header') { site.header[field] = value; changed({ key: 'type:header:' + field, render: false }); }
  else if (owner.dataset.wvPart === 'footer') { site.footer[field] = value; changed({ key: 'type:footer:' + field, render: false }); }
}
function onCanvasInput(e) {
  const node = e.target.closest && e.target.closest('[data-wv-field]');
  if (node) commitField(node);
}
let panelRefreshT;
function onCanvasFocusOut(e) {
  const node = e.target.closest && e.target.closest('[data-wv-field]');
  if (!node) return;
  commitField(node);
  clearTimeout(panelRefreshT);
  panelRefreshT = setTimeout(() => { const a = document.activeElement; if (!a || !$('#props').contains(a)) renderPanel(); }, 150);
}
function onCanvasPaste(e) {
  const node = e.target.closest && e.target.closest('[data-wv-rich]');
  if (!node) return;
  e.preventDefault();
  const cd = e.clipboardData;
  const html = cd.getData('text/html');
  const d = cdoc();
  if (html) d.execCommand('insertHTML', false, sanitizeRich(html).replace(/^<p>([\s\S]*)<\/p>$/, '$1'));
  else d.execCommand('insertText', false, cd.getData('text/plain'));
}
function editingNode() {
  const d = cdoc();
  const a = d && d.activeElement;
  return a && a.isContentEditable ? a : null;
}
function onCanvasKey(e) {
  const t = e.target;
  const editing = t && t.isContentEditable;
  if (editing && e.key === 'Enter' && t.hasAttribute('data-wv-single')) { e.preventDefault(); t.blur(); return; }
  if (e.key === 'Escape' && pdrag) { e.preventDefault(); endPointerDrag(true); return; }
  if (e.key === 'Escape') { if (editing) t.blur(); else select(null); return; }
  if (editing && t.hasAttribute('data-wv-rich') && (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const tb = cdoc().querySelector('#wv-ui .wv-tb');
    if (tb) openLinkPopover(tb);
    return;
  }
  if (t && t.closest && t.closest('#wv-ui')) return;
  if (!editing && (e.key === 'Delete' || e.key === 'Backspace') && sel && (sel.kind === 'el' || sel.kind === 'section')) { e.preventDefault(); deleteSel(); return; }
  handleShortcut(e, editing);
}
function fmt(cmd) {
  const d = cdoc(); const node = editingNode();
  if (!node) { toast('Click into the text first, then select some words.'); return; }
  d.execCommand(cmd, false, null);
  commitField(node);
}
let savedRange = null;
function openLinkPopover(tb) {
  const d = cdoc(), H = builder(d), node = editingNode();
  const s = d.getSelection();
  if (!node || !s.rangeCount || s.isCollapsed) { toast('Select some words in the text first, then add a link.'); return; }
  savedRange = s.getRangeAt(0).cloneRange();
  const ui = d.getElementById('wv-ui');
  const old = ui.querySelector('.wv-pop'); if (old) old.remove();
  const select = H('select', { 'aria-label': 'Link to' },
    H('option', { value: 'url' }, 'A web address'),
    site.pages.map(p => H('option', { value: 'page:' + p.id }, 'Page: ' + p.name)),
    H('option', { value: 'mailto' }, 'An email address'),
    H('option', { value: 'tel' }, 'A phone number'));
  const input = H('input', { type: 'text', placeholder: 'https://example.com', 'aria-label': 'Address' });
  select.addEventListener('change', () => {
    input.hidden = select.value.startsWith('page:');
    input.placeholder = select.value === 'mailto' ? 'name@example.com' : select.value === 'tel' ? '01234 567890' : 'https://example.com';
  });
  const close = () => pop.remove();
  const apply = (remove) => {
    const sel2 = d.getSelection(); sel2.removeAllRanges(); sel2.addRange(savedRange);
    if (remove) d.execCommand('unlink');
    else {
      let href = select.value;
      const v = input.value.trim();
      if (href === 'url') { if (!v) return; href = /^(https?:|#|\/)/i.test(v) ? v : 'https://' + v; }
      else if (href === 'mailto') { if (!v) return; href = 'mailto:' + v.replace(/^mailto:/i, ''); }
      else if (href === 'tel') { if (!v) return; href = 'tel:' + v.replace(/[^\d+]/g, ''); }
      d.execCommand('createLink', false, href);
    }
    commitField(node);
    close();
  };
  const pop = H('div', { class: 'wv-pop' },
    H('b', null, 'Link the selected words to'), select, input,
    H('div', { class: 'row' }, H('button', { type: 'button', onclick: () => apply(true) }, 'Remove link'), H('button', { type: 'button', class: 'primary', onclick: () => apply(false) }, 'Add link')));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); apply(false); } if (e.key === 'Escape') close(); });
  ui.appendChild(pop);
  pop.style.top = (parseFloat(tb.style.top) + tb.offsetHeight + 6) + 'px';
  pop.style.left = tb.style.left;
  input.focus();
}

/* ---------- drag and drop ---------- */

function startPaletteDrag(e, payload) {
  drag = payload;
  e.dataTransfer.setData('text/plain', 'weaver');
  e.dataTransfer.effectAllowed = 'copyMove';
  document.body.classList.add('is-dragging');
}
function endDrag() { drag = null; dropTarget = null; hideDropLine(); document.body.classList.remove('is-dragging'); }
function onCanvasDragStart(e) {
  const g = e.target.closest && e.target.closest('[data-drag]');
  if (!g) { if (!(e.target.closest && e.target.closest('[contenteditable]'))) e.preventDefault(); return; }
  if (!sel) { e.preventDefault(); return; }
  drag = g.dataset.drag === 'section' ? { kind: 'move-section', id: sel.id } : { kind: 'move-el', id: sel.id };
  e.dataTransfer.setData('text/plain', 'weaver');
  e.dataTransfer.effectAllowed = 'move';
  const n = nodeFor(sel);
  if (n) try { e.dataTransfer.setDragImage(n, 24, 24); } catch (err) { /* ignore */ }
}
const hasFiles = dt => dt && Array.from(dt.types || []).includes('Files');
function onCanvasDragOver(e) {
  if (!drag && !hasFiles(e.dataTransfer)) return;
  e.preventDefault();
  const payload = drag || { kind: 'files' };
  e.dataTransfer.dropEffect = payload.kind.startsWith('move') ? 'move' : 'copy';
  dropTarget = computeTarget(payload, e.clientX, e.clientY);
  showDropLine(dropTarget, payload);
}
async function onCanvasDrop(e) {
  e.preventDefault();
  const payload = drag || (hasFiles(e.dataTransfer) ? { kind: 'files', files: Array.from(e.dataTransfer.files) } : null);
  const target = dropTarget || (payload && computeTarget(payload, e.clientX, e.clientY));
  endDrag();
  if (payload && target) await applyDrop(payload, target);
}
function computeTarget(payload, x, y) {
  const d = cdoc();
  const node = d.elementFromPoint(x, y);
  if (payload.kind === 'new-section' || payload.kind === 'move-section') return sectionTarget(y);
  if (payload.kind === 'files' && node) {
    const elNode = node.closest('[data-wv]');
    if (elNode) {
      const f = findElement(elNode.dataset.wv);
      if (f && (f.el.type === 'image' || f.el.type === 'card')) return { kind: 'replace', id: f.el.id, rect: elNode.getBoundingClientRect() };
      if (f && (f.el.type === 'gallery' || f.el.type === 'slideshow')) return { kind: 'addto', id: f.el.id, rect: elNode.getBoundingClientRect() };
    }
  }
  let col = node && node.closest('[data-wv-col]');
  if (!col && node) {
    const secNode = node.closest('[data-wv-section]');
    if (secNode) {
      let best = null, bestDist = Infinity;
      secNode.querySelectorAll('[data-wv-col]').forEach(c => {
        if (c.closest('[data-wv-section]') !== secNode) return;
        const r = c.getBoundingClientRect();
        const dist = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
        if (dist < bestDist) { bestDist = dist; best = c; }
      });
      col = best;
    }
  }
  if (!col) return Object.assign(sectionTarget(y), { asNewSection: true });
  const [secId, ci] = col.dataset.wvCol.split(':');
  const kids = Array.from(col.children).filter(c => c.hasAttribute('data-wv'));
  let index = kids.length;
  for (let i = 0; i < kids.length; i++) { const r = kids[i].getBoundingClientRect(); if (y < r.top + r.height / 2) { index = i; break; } }
  const cr = col.getBoundingClientRect();
  let ly;
  if (!kids.length) ly = cr.top + Math.min(cr.height, 60) / 2;
  else if (index < kids.length) ly = kids[index].getBoundingClientRect().top - 10;
  else ly = kids[kids.length - 1].getBoundingClientRect().bottom + 10;
  return { kind: 'col', secId, col: +ci, index, colNode: col, line: { x: cr.left, y: ly, w: cr.width } };
}
function sectionTarget(y) {
  const d = cdoc();
  const secs = Array.from(d.querySelectorAll('[data-wv-section]'));
  const main = d.querySelector('[data-wv-main]');
  const mr = main ? main.getBoundingClientRect() : { left: 0, width: d.documentElement.clientWidth, top: 0, bottom: 0 };
  let index = secs.length, ly = secs.length ? secs[secs.length - 1].getBoundingClientRect().bottom : mr.top + 40;
  for (let i = 0; i < secs.length; i++) {
    const r = secs[i].getBoundingClientRect();
    if (y < r.top + r.height / 2) { index = i; ly = r.top; break; }
  }
  return { kind: 'section', index, line: { x: mr.left + 12, y: ly - 2, w: mr.width - 24 } };
}
function showDropLine(t, payload) {
  const d = cdoc();
  if (!t) { hideDropLine(); return; }
  d.querySelectorAll('.wv-drop-col').forEach(n => n.classList.remove('wv-drop-col'));
  let line = d.getElementById('wv-drop-line');
  if (!line) { line = d.createElement('div'); line.id = 'wv-drop-line'; line.appendChild(d.createElement('span')); d.body.appendChild(line); }
  const win = d.defaultView;
  if (t.kind === 'replace' || t.kind === 'addto') {
    line.hidden = true;
    const n = d.querySelector('[data-wv="' + t.id + '"]'); if (n) n.classList.add('wv-drop-col');
    return;
  }
  line.hidden = false;
  if (t.colNode) t.colNode.classList.add('wv-drop-col');
  line.style.left = (t.line.x + win.scrollX) + 'px';
  line.style.top = (t.line.y + win.scrollY) + 'px';
  line.style.width = Math.max(40, t.line.w) + 'px';
  const label = payload.kind === 'new-section' ? 'Add section here' : payload.kind === 'move-section' ? 'Move section here' : t.asNewSection ? 'Add as a new section' : payload.kind === 'move-el' ? 'Move here' : payload.kind === 'files' ? 'Add pictures here' : 'Add here';
  line.firstChild.textContent = label;
}
function hideDropLine() {
  const d = cdoc();
  if (!d) return;
  const line = d.getElementById('wv-drop-line'); if (line) line.remove();
  d.querySelectorAll('.wv-drop-col').forEach(n => n.classList.remove('wv-drop-col'));
}
function placeElement(el, target) {
  const page = curPage();
  if (target.kind === 'col') {
    const f = findSection(target.secId);
    const col = f && f.section.columns[target.col];
    if (col) { col.elements.splice(target.index, 0, el); return; }
  }
  const idx = target.kind === 'section' ? target.index : page.sections.length;
  page.sections.splice(idx, 0, T.makeSectionObj(ctx, '1', [[el]]));
}
async function applyDrop(payload, target) {
  const page = curPage();
  if (payload.kind === 'new-el') {
    const el = T.makeElement(payload.type, ctx);
    placeElement(el, target);
    sel = { kind: 'el', id: el.id };
    changed({ panel: true });
    return;
  }
  if (payload.kind === 'move-el') {
    const f = findElement(payload.id);
    if (!f) return;
    if (target.kind === 'col' && target.secId === f.section.id && target.col === f.colIndex) {
      let idx = target.index;
      if (idx > f.index) idx--;
      if (idx === f.index) return;
      f.col.elements.splice(f.index, 1);
      f.col.elements.splice(idx, 0, f.el);
    } else {
      f.col.elements.splice(f.index, 1);
      placeElement(f.el, target);
    }
    sel = { kind: 'el', id: f.el.id };
    changed({ panel: true });
    return;
  }
  if (payload.kind === 'new-section') {
    const tpl = T.SECTIONS.find(s => s.key === payload.key);
    const made = tpl.make(ctx);
    page.sections.splice(target.index, 0, ...made);
    sel = { kind: 'section', id: made[0].id };
    changed({ panel: true });
    return;
  }
  if (payload.kind === 'move-section') {
    const f = findSection(payload.id);
    if (!f) return;
    let idx = target.index;
    if (idx > f.index) idx--;
    if (idx === f.index) return;
    page.sections.splice(f.index, 1);
    page.sections.splice(idx, 0, f.section);
    sel = { kind: 'section', id: f.section.id };
    changed({ panel: true });
    return;
  }
  if (payload.kind === 'files') {
    const files = payload.files || [];
    const vid = files.find(f => /^video\//.test(f.type));
    if (vid && !files.some(f => /^image\//.test(f.type))) {
      try {
        const name = await importVideoFile(vid);
        const el = T.makeElement('video', ctx, { source: 'file', file: name, controls: true });
        placeElement(el, target.kind === 'col' || target.kind === 'section' ? target : { kind: 'section', index: page.sections.length });
        sel = { kind: 'el', id: el.id };
        changed({ panel: true });
      } catch (err) { toast(err.message); }
      return;
    }
    const names = await importImages(files);
    if (!names.length) { toast('Drop picture files (JPG, PNG, GIF, WebP or SVG) to add them.'); return; }
    if (target.kind === 'replace') {
      const f = findElement(target.id);
      if (f.el.type === 'card') f.el.props.image = names[0]; else f.el.props.src = names[0];
      sel = { kind: 'el', id: f.el.id };
      changed({ panel: true });
      toast('Picture replaced');
      return;
    }
    if (target.kind === 'addto') {
      const f = findElement(target.id);
      const list = f.el.type === 'gallery' ? f.el.props.images : f.el.props.slides;
      names.forEach(n => list.push({ src: n, alt: '', caption: '' }));
      sel = { kind: 'el', id: f.el.id };
      changed({ panel: true });
      toast('Added ' + names.length + ' picture' + (names.length > 1 ? 's' : ''));
      return;
    }
    const el = names.length === 1
      ? T.makeElement('image', ctx, { src: names[0] })
      : T.makeElement('gallery', ctx, { images: names.map(n => ({ src: n, alt: '', caption: '' })) });
    placeElement(el, target);
    sel = { kind: 'el', id: el.id };
    changed({ panel: true });
  }
}

/* ---------- element and section actions ---------- */

function addElement(type) {
  const page = curPage();
  const el = T.makeElement(type, ctx);
  let placed = false;
  if (sel && sel.kind === 'el') { const f = findElement(sel.id); if (f && f.page === page) { f.col.elements.splice(f.index + 1, 0, el); placed = true; } }
  else if (sel && sel.kind === 'section') { const f = findSection(sel.id); if (f && f.page === page) { f.section.columns[0].elements.push(el); placed = true; } }
  if (!placed) page.sections.push(T.makeSectionObj(ctx, '1', [[el]]));
  sel = { kind: 'el', id: el.id };
  changed({ panel: true });
  scrollToSel();
}
function addSectionTemplate(key) {
  const page = curPage();
  const made = T.SECTIONS.find(s => s.key === key).make(ctx);
  let idx = page.sections.length;
  const sid = sel && (sel.kind === 'section' ? sel.id : sel.kind === 'el' ? (findElement(sel.id) || {}).section && findElement(sel.id).section.id : null);
  if (sid) { const i = page.sections.findIndex(s => s.id === sid); if (i >= 0) idx = i + 1; }
  page.sections.splice(idx, 0, ...made);
  sel = { kind: 'section', id: made[0].id };
  changed({ panel: true });
  scrollToSel();
}
function moveElement(id, dir) {
  const f = findElement(id);
  if (!f) return;
  const els = f.col.elements, ni = f.index + dir;
  if (ni >= 0 && ni < els.length) {
    els.splice(f.index, 1);
    els.splice(ni, 0, f.el);
  } else {
    const secs = f.page.sections, si = secs.indexOf(f.section) + dir;
    if (si < 0 || si >= secs.length) { toast('This is already the ' + (dir < 0 ? 'first' : 'last') + ' item on the page.'); return; }
    els.splice(f.index, 1);
    const tcol = secs[si].columns[Math.min(f.colIndex, secs[si].columns.length - 1)];
    if (dir < 0) tcol.elements.push(f.el); else tcol.elements.unshift(f.el);
  }
  changed();
  scrollToSel();
}
function moveSection(id, dir) {
  const f = findSection(id);
  if (!f) return;
  const ni = f.index + dir;
  if (ni < 0 || ni >= f.page.sections.length) { toast('This section is already at the ' + (dir < 0 ? 'top' : 'bottom') + ' of the page.'); return; }
  f.page.sections.splice(f.index, 1);
  f.page.sections.splice(ni, 0, f.section);
  changed();
  scrollToSel();
}
function duplicateSel() {
  if (!sel) return;
  if (sel.kind === 'el') {
    const f = findElement(sel.id); if (!f) return;
    const c = reId(f.el);
    f.col.elements.splice(f.index + 1, 0, c);
    sel = { kind: 'el', id: c.id };
  } else if (sel.kind === 'section') {
    const f = findSection(sel.id); if (!f) return;
    const c = reId(f.section);
    f.page.sections.splice(f.index + 1, 0, c);
    sel = { kind: 'section', id: c.id };
  } else return;
  changed({ panel: true });
  toast('Duplicated');
  scrollToSel();
}
function deleteSel() {
  if (!sel) return;
  if (sel.kind === 'el') {
    const f = findElement(sel.id); if (!f) return;
    f.col.elements.splice(f.index, 1);
    sel = { kind: 'section', id: f.section.id };
  } else if (sel.kind === 'section') {
    const f = findSection(sel.id); if (!f) return;
    f.page.sections.splice(f.index, 1);
    sel = null;
  } else return;
  changed({ panel: true });
  toast('Deleted. Press Undo to bring it back.');
}

/* ================================================================== */
/* Panel controls                                                      */
/* ================================================================== */

let nidN = 0;
const nid = () => 'c' + (++nidN);
function group(title, ...kids) { return h('section', { class: 'pgroup' }, title ? h('h3', null, title) : null, ...kids); }
function field(label, control, hint) {
  const id = control && control.id;
  return h('div', { class: 'field' },
    label ? (id && /^(INPUT|SELECT|TEXTAREA)$/.test(control.tagName) ? h('label', { class: 'flabel', for: id }, label) : h('span', { class: 'flabel' }, label)) : null,
    control, hint ? h('p', { class: 'hint' }, hint) : null);
}
function inputCtl(value, onInput, o) {
  o = o || {};
  const el = h(o.multiline ? 'textarea' : 'input', { id: nid(), class: 'inp' + (o.mono ? ' mono' : ''), placeholder: o.placeholder || null, rows: o.rows || null, type: o.multiline ? null : (o.type || 'text'), maxlength: o.max || null, spellcheck: o.mono ? 'false' : null });
  el.value = value == null ? '' : value;
  el.addEventListener('input', () => onInput(el.value));
  return el;
}
function selectCtl(options, value, onChange) {
  const el = h('select', { id: nid(), class: 'inp' }, options.map(([v, l]) => h('option', { value: v }, l)));
  el.value = value == null ? '' : value;
  el.addEventListener('change', () => onChange(el.value));
  return el;
}
function segCtl(options, value, onChange, o) {
  const wrap = h('div', { class: 'seg' + (o && o.cls ? ' ' + o.cls : ''), role: 'group' });
  options.forEach(opt => {
    const b = h('button', { type: 'button', title: opt.title || opt.label, 'aria-pressed': String(opt.v === value), 'aria-label': opt.title || opt.label });
    if (opt.icon) b.appendChild(icon(opt.icon)); else if (opt.html) b.innerHTML = opt.html; else b.textContent = opt.label;
    b.addEventListener('click', () => { wrap.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); onChange(opt.v); });
    wrap.appendChild(b);
  });
  return wrap;
}
function toggleCtl(label, checked, onChange, hint) {
  const id = nid();
  return h('div', { class: 'field' },
    h('label', { class: 'toggle', for: id }, h('input', { type: 'checkbox', id, role: 'switch', checked: !!checked, onchange: e => onChange(e.target.checked) }), h('span', { class: 'tg-track', 'aria-hidden': 'true' }), h('span', null, label)),
    hint ? h('p', { class: 'hint' }, hint) : null);
}
function swatchColor(v) { return Gen.THEME_KEYS.includes(v) ? site.theme.colors[v] : v; }
function colorCtl(value, onChange, o) {
  o = o || {};
  const wrap = h('div', { class: 'swatches', role: 'group' });
  const mark = v => wrap.querySelectorAll('.sw').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === v || (b.dataset.v === 'custom' && Gen.validHex(v)))));
  const add = (v, title, style) => {
    const b = h('button', { type: 'button', class: 'sw' + (v === '' ? ' sw-none' : ''), title, 'aria-label': title, 'data-v': v });
    if (style) b.style.background = style;
    b.addEventListener('click', () => { mark(v); onChange(v); });
    wrap.appendChild(b);
  };
  if (o.none !== false) add('', o.noneLabel || 'None');
  Gen.THEME_KEYS.forEach(k => add(k, Gen.THEME_LABELS[k] + ' colour', site.theme.colors[k]));
  const custom = h('label', { class: 'sw sw-custom', title: 'Pick any colour', 'data-v': 'custom' });
  const ci = h('input', { type: 'color', 'aria-label': 'Pick any colour' });
  ci.value = Gen.validHex(value) ? (value.length === 4 ? '#' + value.slice(1).split('').map(c => c + c).join('') : value) : '#888888';
  if (Gen.validHex(value)) custom.style.background = value;
  ci.addEventListener('input', () => { custom.style.background = ci.value; mark(ci.value); onChange(ci.value); });
  custom.appendChild(ci);
  wrap.appendChild(custom);
  mark(value || '');
  return wrap;
}
function rangeCtl(min, max, step, value, onInput, fmtFn) {
  const id = nid();
  const out = h('output', { for: id, class: 'range-out' }, fmtFn ? fmtFn(value) : value);
  const r = h('input', { type: 'range', id, min, max, step, class: 'range' });
  r.value = value;
  r.addEventListener('input', () => { out.textContent = fmtFn ? fmtFn(+r.value) : r.value; onInput(+r.value); });
  const wrap = h('div', { class: 'range-wrap' }, r, out);
  wrap.id = id;
  return wrap;
}
function imageCtl(name, onChange, o) {
  o = o || {};
  const thumb = h('button', { type: 'button', class: 'img-thumb', title: 'Choose a different picture' });
  if (name && (assets[name] || Gen.isUrl(name))) thumb.appendChild(h('img', { src: assetUrl(name), alt: '' }));
  else thumb.appendChild(h('span', null, 'No picture'));
  const choose = async () => { const r = await chooseImages({ multiple: false }); if (r && r[0]) onChange(r[0]); };
  thumb.addEventListener('click', choose);
  return h('div', { class: 'img-ctl' }, thumb,
    h('div', { class: 'img-actions' },
      h('button', { type: 'button', class: 'btn sm', onclick: choose }, icon('image'), name ? 'Change picture' : 'Choose picture'),
      o.removable && name ? h('button', { type: 'button', class: 'btn sm ghost', onclick: () => onChange(null) }, 'Remove') : null,
      name && /^placeholder-/.test(name) ? h('p', { class: 'hint' }, 'This is a sample picture. Change it for one of your own.') : null));
}
function linkCtl(value, newTab, onChange) {
  value = value || '';
  const anchors = [];
  site.pages.forEach(p => p.sections.forEach(s => { if (s.anchor) anchors.push(['page:' + p.id + '#' + Gen.slugify(s.anchor), 'Section “' + s.anchor + '” on ' + p.name]); }));
  const kind = !value ? '' : value.startsWith('page:') ? value : value.startsWith('mailto:') ? 'mailto' : value.startsWith('tel:') ? 'tel' : 'url';
  const opts = [['', 'Nowhere yet'], ...site.pages.map(p => ['page:' + p.id, 'Page: ' + p.name]), ...anchors, ['url', 'A web address'], ['mailto', 'An email address'], ['tel', 'A phone number']];
  const known = opts.some(o => o[0] === kind);
  const sel2 = selectCtl(opts, known ? kind : 'url', v => update(v));
  const strip = v => v.replace(/^mailto:/, '').replace(/^tel:/, '');
  const inp = inputCtl(kind === 'url' || kind === 'mailto' || kind === 'tel' ? strip(value) : '', () => update(sel2.value), { placeholder: 'https://example.com' });
  const tab = toggleCtl('Open in a new tab', newTab, v => onChange(currentValue(), v));
  function currentValue() {
    const k = sel2.value, v = inp.value.trim();
    if (k === 'url') return v ? (/^(https?:|#|\/|\.)/i.test(v) || /\.html?$/i.test(v) ? v : 'https://' + v) : '';
    if (k === 'mailto') return v ? 'mailto:' + v : '';
    if (k === 'tel') return v ? 'tel:' + v.replace(/[^\d+]/g, '') : '';
    return k;
  }
  function sync() {
    const k = sel2.value;
    inp.hidden = !(k === 'url' || k === 'mailto' || k === 'tel');
    inp.placeholder = k === 'mailto' ? 'name@example.com' : k === 'tel' ? '01234 567890' : 'https://example.com';
    tab.hidden = k !== 'url';
  }
  function update() { sync(); onChange(currentValue(), tab.querySelector('input').checked); }
  sync();
  return h('div', { class: 'link-ctl' }, sel2, inp, tab);
}

function setEl(el, fn, key, o) { fn(); changed(Object.assign({ key: key ? 'el:' + el.id + ':' + key : null }, o || {})); }

/* ================================================================== */
/* Properties panel                                                    */
/* ================================================================== */

const SIZE_OPTS = [['', 'Normal'], ['sm', 'Small'], ['md', 'Medium'], ['lg', 'Large'], ['xl', 'Extra large'], ['2xl', 'Huge'], ['3xl', 'Giant'], ['4xl', 'Massive']];
const STYLE_SUPPORT = {
  heading: ['align', 'size', 'color', 'bg', 'padding', 'radius'],
  text: ['align', 'width', 'size', 'color', 'bg', 'padding', 'radius'],
  button: ['align'],
  link: ['align', 'size', 'color'],
  image: ['align', 'width', 'radius', 'shadow'],
  gallery: ['width', 'align', 'radius'],
  slideshow: ['width', 'align', 'radius', 'shadow'],
  video: ['width', 'align', 'radius', 'shadow'],
  map: ['width', 'align', 'radius', 'shadow'],
  ticker: ['color', 'bg', 'size', 'radius'],
  card: ['width', 'align', 'color', 'bg', 'radius', 'shadow'],
  quote: ['align', 'width', 'size', 'color', 'bg', 'padding', 'radius'],
  table: ['width', 'align', 'size', 'color', 'bg', 'padding', 'radius'],
  faq: ['width', 'align', 'size', 'color', 'bg', 'padding', 'radius'],
  form: ['width', 'align', 'color', 'bg', 'padding', 'radius'],
  divider: ['align', 'width', 'color'],
  spacer: [],
  html: ['color', 'bg', 'padding']
};

function crumbs() {
  const page = curPage();
  const parts = [h('button', { type: 'button', class: 'crumb', onclick: () => select(null) }, icon('page'), page.name)];
  if (sel && sel.kind === 'el') {
    const f = findElement(sel.id);
    if (f) {
      parts.push(h('span', { class: 'crumb-sep' }, '›'), h('button', { type: 'button', class: 'crumb', onclick: () => select({ kind: 'section', id: f.section.id }) }, 'Section'));
      parts.push(h('span', { class: 'crumb-sep' }, '›'), h('span', { class: 'crumb cur' }, T.LABELS[f.el.type]));
    }
  } else if (sel && sel.kind === 'section') parts.push(h('span', { class: 'crumb-sep' }, '›'), h('span', { class: 'crumb cur' }, 'Section'));
  else if (sel) parts.push(h('span', { class: 'crumb-sep' }, '›'), h('span', { class: 'crumb cur' }, sel.kind === 'header' ? 'Header' : 'Footer'));
  return h('nav', { class: 'crumbs', 'aria-label': 'Selection' }, parts);
}

function panelHead(iconName, title, sub) {
  return h('div', { class: 'phead' }, h('span', { class: 'phead-ico' }, icon(iconName)), h('div', null, h('h2', null, title), sub ? h('p', null, sub) : null));
}

function renderPanel() {
  const root = $('#props');
  if (!root || !site) return;
  const scroll = root.scrollTop;
  const keepScroll = root.dataset.sel === JSON.stringify(sel);
  root.dataset.sel = JSON.stringify(sel);
  root.innerHTML = '';
  root.appendChild(crumbs());
  if (!sel) root.appendChild(pagePanel());
  else if (sel.kind === 'el') { const f = findElement(sel.id); root.appendChild(f ? elementPanel(f) : pagePanel()); }
  else if (sel.kind === 'section') { const f = findSection(sel.id); root.appendChild(f ? sectionPanel(f) : pagePanel()); }
  else if (sel.kind === 'header') root.appendChild(headerPanel());
  else if (sel.kind === 'footer') root.appendChild(footerPanel());
  if (keepScroll) root.scrollTop = scroll;
}

function pagePanel() {
  const page = curPage();
  const files = Gen.pageFiles(site);
  const isHome = site.pages[0] === page;
  const desc = inputCtl(page.description, v => { page.description = v; count.textContent = v.length + ' / 160'; changed({ key: 'page:desc', render: false }); }, { multiline: true, rows: 3, max: 300, placeholder: 'One or two sentences that sum up this page.' });
  const count = h('span', { class: 'count' }, (page.description || '').length + ' / 160');
  return h('div', null,
    panelHead('page', page.name, (isHome ? 'Home page · ' : '') + files[page.id]),
    group('Page',
      field('Page name', inputCtl(page.name, v => { page.name = v || 'Untitled'; changed({ key: 'page:name', pages: true }); }), 'Shown in the menu.'),
      field('Browser tab title', inputCtl(page.title, v => { page.title = v; changed({ key: 'page:title', render: false }); }, { placeholder: Gen.pageTitle(site, Object.assign({}, page, { title: '' })) }), 'Leave blank to use the page name and site name.'),
      field('Description for search engines', h('div', null, desc, count)),
      toggleCtl('Show this page in the menu', page.showInNav !== false, v => { page.showInNav = v; changed({ pages: true, panel: true }); }),
      page.showInNav !== false && !isHome ? field('Place in the menu', selectCtl([['', 'Top level'], ...site.pages.filter(p => p !== page && p !== site.pages[0] && !p.parent && p.showInNav !== false && !site.pages.some(c => c.parent === page.id)).map(p => [p.id, 'In the drop-down under “' + p.name + '”'])], page.parent || '', v => { page.parent = v || undefined; if (!v) delete page.parent; changed({ pages: true }); }), site.pages.some(c => c.parent === page.id) ? 'Other pages sit under this one, so it stays at the top level.' : 'Put this page in a drop-down list under another page.') : null),
    group('Page actions',
      h('div', { class: 'btn-row' },
        !isHome ? h('button', { type: 'button', class: 'btn sm', onclick: () => makeHome(page) }, icon('home'), 'Make home page') : null,
        h('button', { type: 'button', class: 'btn sm', onclick: () => duplicatePage(page) }, icon('copy'), 'Duplicate page'),
        site.pages.length > 1 ? h('button', { type: 'button', class: 'btn sm danger', onclick: () => deletePage(page) }, icon('trash'), 'Delete page') : null)),
    h('div', { class: 'tip' }, icon('info'), h('p', null, 'Click anything on the page to change it, or drag elements from the left. Click the header or footer to change them on every page.'))
  );
}

const LAYOUT_OPTS = [['1', [1]], ['1-1', [1, 1]], ['1-2', [1, 2]], ['2-1', [2, 1]], ['1-1-1', [1, 1, 1]], ['1-1-1-1', [1, 1, 1, 1]]];
function layoutPicker(value, onChange) {
  const wrap = h('div', { class: 'layouts', role: 'group' });
  LAYOUT_OPTS.forEach(([v, parts]) => {
    const b = h('button', { type: 'button', class: 'layout-btn', title: parts.length === 1 ? 'One column' : parts.length + ' columns' + (parts[0] !== parts[1] ? ' (uneven)' : ''), 'aria-label': v, 'aria-pressed': String(v === value) },
      parts.map(p => h('span', { style: 'flex:' + p })));
    b.addEventListener('click', () => { wrap.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); onChange(v); });
    wrap.appendChild(b);
  });
  return wrap;
}

function sectionPanel(f) {
  const s = f.section;
  const set = (fn, key, o) => { fn(); changed(Object.assign({ key: key ? 'sec:' + s.id + ':' + key : null }, o || {})); };
  const count = s.columns.reduce((n, c) => n + c.elements.length, 0);
  return h('div', null,
    panelHead('section', 'Section', count + ' element' + (count === 1 ? '' : 's') + ' · ' + (Gen.LAYOUTS[s.layout] || 1) + ' column' + ((Gen.LAYOUTS[s.layout] || 1) > 1 ? 's' : '')),
    group('Layout',
      field('Columns', layoutPicker(s.layout, v => set(() => setLayout(s, v), null, { panel: true })), 'On phones, columns stack on top of each other.'),
      field('Line up contents', segCtl([{ v: 'top', label: 'Top' }, { v: 'center', label: 'Middle' }, { v: 'bottom', label: 'Bottom' }, { v: 'stretch', label: 'Fill' }], s.valign || 'top', v => set(() => { s.valign = v; }))),
      field('Width', segCtl([{ v: 'contained', label: 'Normal' }, { v: 'wide', label: 'Wide' }, { v: 'full', label: 'Edge to edge' }], s.width || 'contained', v => set(() => { s.width = v; }))),
      field('Space above and below', segCtl([{ v: 'none', label: 'None' }, { v: 'sm', label: 'S' }, { v: 'md', label: 'M' }, { v: 'lg', label: 'L' }, { v: 'xl', label: 'XL' }], s.padding || 'md', v => set(() => { s.padding = v; }))),
      field('Height', segCtl([{ v: 'auto', label: 'Fit contents' }, { v: 'half', label: 'Half screen' }, { v: 'full', label: 'Full screen' }], s.height || 'auto', v => set(() => { s.height = v; })))),
    group('Background',
      field('Colour', colorCtl(s.bg, v => set(() => { s.bg = v; }))),
      field('Picture', imageCtl(s.bgImage, v => set(() => { s.bgImage = v; }, null, { panel: true }), { removable: true })),
      s.bgImage ? field('Darken the picture', rangeCtl(0, 90, 5, s.overlay == null ? 40 : s.overlay, v => set(() => { s.overlay = v; }, 'overlay'), v => v + '%'), 'Darker pictures make white text easier to read.') : null,
      s.bgImage ? toggleCtl('Keep the picture still while scrolling', s.parallax, v => set(() => { s.parallax = v; }), 'A “parallax” effect. Phones show it as a normal background.') : null,
      field('Text colour', segCtl([{ v: 'auto', label: 'Automatic' }, { v: 'light', label: 'Light' }, { v: 'dark', label: 'Dark' }], s.textColor || 'auto', v => set(() => { s.textColor = v; })))),
    group('Link name',
      field('Section name', inputCtl(s.anchor, v => set(() => { s.anchor = v; }, 'anchor', { render: true }), { placeholder: 'for example: prices' }), 'Give the section a name so buttons and links can jump straight to it.')),
    actionRow(() => moveSection(s.id, -1), () => moveSection(s.id, 1))
  );
}

function actionRow(up, down) {
  return group(null, h('div', { class: 'btn-row' },
    h('button', { type: 'button', class: 'btn sm', onclick: up }, icon('up'), 'Move up'),
    h('button', { type: 'button', class: 'btn sm', onclick: down }, icon('down'), 'Move down'),
    h('button', { type: 'button', class: 'btn sm', onclick: duplicateSel }, icon('copy'), 'Duplicate'),
    h('button', { type: 'button', class: 'btn sm danger', onclick: deleteSel }, icon('trash'), 'Delete')));
}

function listEditor(el, listKey, opts) {
  const list = el.props[listKey];
  const wrap = h('div', { class: 'pic-list' });
  list.forEach((item, i) => {
    const row = h('div', { class: 'pic-row' },
      h('button', { type: 'button', class: 'pic-thumb', title: 'Change this picture', onclick: async () => { const r = await chooseImages({ multiple: false }); if (r && r[0]) setEl(el, () => { item.src = r[0]; }, null, { panel: true }); } }, item.src && (assets[item.src] || Gen.isUrl(item.src)) ? h('img', { src: assetUrl(item.src), alt: '' }) : 'Choose'),
      h('div', { class: 'pic-fields' },
        inputCtl(item.alt, v => setEl(el, () => { item.alt = v; }, listKey + i + 'alt', { render: false }), { placeholder: 'Describe the picture' }),
        inputCtl(item.caption, v => setEl(el, () => { item.caption = v; }, listKey + i + 'cap'), { placeholder: 'Caption (optional)' })),
      h('div', { class: 'pic-btns' },
        h('button', { type: 'button', class: 'ibtn', title: 'Move up', 'aria-label': 'Move up', disabled: i === 0, onclick: () => setEl(el, () => { list.splice(i - 1, 0, list.splice(i, 1)[0]); }, null, { panel: true }) }, icon('up')),
        h('button', { type: 'button', class: 'ibtn', title: 'Move down', 'aria-label': 'Move down', disabled: i === list.length - 1, onclick: () => setEl(el, () => { list.splice(i + 1, 0, list.splice(i, 1)[0]); }, null, { panel: true }) }, icon('down')),
        h('button', { type: 'button', class: 'ibtn', title: 'Remove', 'aria-label': 'Remove', onclick: () => setEl(el, () => { list.splice(i, 1); }, null, { panel: true }) }, icon('trash'))));
    wrap.appendChild(row);
  });
  wrap.appendChild(h('button', { type: 'button', class: 'btn sm', onclick: async () => {
    const r = await chooseImages({ multiple: true, title: opts.addTitle });
    if (r && r.length) setEl(el, () => { r.forEach(n => list.push({ src: n, alt: '', caption: '' })); }, null, { panel: true });
  } }, icon('plus'), opts.addLabel));
  wrap.appendChild(h('p', { class: 'hint' }, 'Tip: drag picture files from your computer straight onto the ' + (listKey === 'images' ? 'gallery' : 'slideshow') + ' to add them.'));
  return wrap;
}

const CONTENT = {
  heading: el => [
    field('Heading', inputCtl(el.props.text, v => setEl(el, () => { el.props.text = v; }, 'text'))),
    field('Importance', segCtl([1, 2, 3, 4].map(n => ({ v: n, label: 'H' + n, title: ['Main page title (use once per page)', 'Section heading', 'Sub-heading', 'Small heading'][n - 1] })), +el.props.level || 2, v => setEl(el, () => { el.props.level = v; })), 'H1 is the page’s main title. Use H2 for sections and H3 or H4 below them. Search engines and screen readers rely on this order.'),
    field('Make the heading a link to', linkCtl(el.props.link, el.props.newTab, (l, t) => setEl(el, () => { el.props.link = l; el.props.newTab = t; }, 'link')), 'Optional. Leave as “Nowhere yet” for a plain heading.')
  ],
  link: el => [
    field('Link text', inputCtl(el.props.text, v => setEl(el, () => { el.props.text = v; }, 'text'))),
    field('Goes to', linkCtl(el.props.link, el.props.newTab, (l, t) => setEl(el, () => { el.props.link = l; el.props.newTab = t; }, 'link'))),
    toggleCtl('Show an arrow after the text', el.props.arrow !== false, v => setEl(el, () => { el.props.arrow = v; })),
    h('p', { class: 'hint' }, 'To link words inside a paragraph, select them in a Text box and press the link button (or Ctrl+K).')
  ],
  text: () => [h('div', { class: 'tip' }, icon('pencil'), h('p', null, 'Click the text on the page to type. Select words, then use the toolbar above the text box for bold, italic, links and lists.'))],
  button: el => [
    field('Button text', inputCtl(el.props.text, v => setEl(el, () => { el.props.text = v; }, 'text'))),
    field('When clicked, go to', linkCtl(el.props.link, el.props.newTab, (l, t) => setEl(el, () => { el.props.link = l; el.props.newTab = t; }, 'link'))),
    field('Look', segCtl([{ v: 'filled', label: 'Solid' }, { v: 'outline', label: 'Outline' }, { v: 'accent', label: 'Highlight' }], el.props.variant || 'filled', v => setEl(el, () => { el.props.variant = v; }))),
    field('Size', segCtl([{ v: 'sm', label: 'Small' }, { v: 'md', label: 'Medium' }, { v: 'lg', label: 'Large' }], el.props.size || 'md', v => setEl(el, () => { el.props.size = v; })))
  ],
  image: el => [
    imageCtl(el.props.src, v => setEl(el, () => { el.props.src = v; }, null, { panel: true })),
    field('Describe the picture', inputCtl(el.props.alt, v => setEl(el, () => { el.props.alt = v; }, 'alt', { render: false }), { placeholder: 'e.g. A loaf of sourdough on a wooden board' }), 'Read aloud to people who can’t see the picture. Search engines use it too.'),
    field('Shape', segCtl(SHAPE_OPTS, el.props.shape || '', v => setEl(el, () => { el.props.shape = v; })), 'Crops the picture to a shape. “Original” keeps it as taken.'),
    field('Caption', inputCtl(el.props.caption, v => setEl(el, () => { el.props.caption = v; }, 'caption'), { placeholder: 'Optional text under the picture' })),
    field('When clicked, go to', linkCtl(el.props.link, el.props.newTab, (l, t) => setEl(el, () => { el.props.link = l; el.props.newTab = t; }, 'link')))
  ],
  gallery: el => [
    listEditor(el, 'images', { addLabel: 'Add pictures', addTitle: 'Add pictures to the gallery' }),
    field('Pictures per row', segCtl([2, 3, 4, 5].map(n => ({ v: n, label: String(n) })), el.props.columns || 3, v => setEl(el, () => { el.props.columns = v; }))),
    field('Shape', segCtl([{ v: 'square', label: 'Square' }, { v: 'landscape', label: 'Landscape' }, { v: 'portrait', label: 'Portrait' }, { v: 'original', label: 'As taken' }], el.props.ratio || 'square', v => setEl(el, () => { el.props.ratio = v; }))),
    field('Space between', segCtl([{ v: 'none', label: 'None' }, { v: 'sm', label: 'S' }, { v: 'md', label: 'M' }, { v: 'lg', label: 'L' }], el.props.gap || 'md', v => setEl(el, () => { el.props.gap = v; }))),
    toggleCtl('Click a picture to see it larger', el.props.lightbox, v => setEl(el, () => { el.props.lightbox = v; }))
  ],
  slideshow: el => [
    listEditor(el, 'slides', { addLabel: 'Add slides', addTitle: 'Add pictures to the slideshow' }),
    field('Shape', segCtl([{ v: 'landscape', label: 'Classic' }, { v: 'wide', label: 'Wide' }, { v: 'panorama', label: 'Panorama' }], el.props.ratio || 'wide', v => setEl(el, () => { el.props.ratio = v; }))),
    field('Change slide every', segCtl([{ v: 0, label: 'Off' }, { v: 3, label: '3 s' }, { v: 5, label: '5 s' }, { v: 8, label: '8 s' }], +el.props.autoplay || 0, v => setEl(el, () => { el.props.autoplay = v; })), 'Slides stop moving while someone points at them, and for visitors who prefer less motion.'),
    toggleCtl('Show arrows', el.props.arrows !== false, v => setEl(el, () => { el.props.arrows = v; })),
    toggleCtl('Show dots', el.props.dots !== false, v => setEl(el, () => { el.props.dots = v; })),
    toggleCtl('Slow zoom effect', el.props.kenburns, v => setEl(el, () => { el.props.kenburns = v; }), 'Pictures gently zoom in, like a documentary film.'),
    field('Name for screen readers', inputCtl(el.props.label, v => setEl(el, () => { el.props.label = v; }, 'label', { render: false }), { placeholder: 'Slideshow' }))
  ],
  video: el => [
    field('Where is the video?', segCtl([{ v: 'url', label: 'YouTube or Vimeo' }, { v: 'file', label: 'Video file' }], el.props.source || 'url', v => setEl(el, () => { el.props.source = v; }, null, { panel: true }))),
    el.props.source === 'file'
      ? field('Video file', h('div', { class: 'btn-row' }, h('button', { type: 'button', class: 'btn sm', onclick: async () => {
        const files = await pickFiles('video/mp4,video/webm', false);
        if (!files.length) return;
        try { const n = await importVideoFile(files[0]); setEl(el, () => { el.props.file = n; }, null, { panel: true }); } catch (err) { toast(err.message); }
      } }, icon('video'), el.props.file ? 'Change video' : 'Choose video'), el.props.file ? h('span', { class: 'hint' }, el.props.file) : null), 'MP4 files work in every browser. Keep videos short: large files make your site slow.')
      : field('Video link', inputCtl(el.props.url, v => setEl(el, () => { el.props.url = v; }, 'url'), { placeholder: 'https://www.youtube.com/watch?v=…' }), Gen.videoEmbed(el.props.url) ? '✓ ' + Gen.videoEmbed(el.props.url).kind + ' video found.' : 'Copy the address of the video page and paste it here.'),
    toggleCtl('Play automatically (without sound)', el.props.autoplay, v => setEl(el, () => { el.props.autoplay = v; })),
    el.props.source === 'file' ? toggleCtl('Play on a loop', el.props.loop, v => setEl(el, () => { el.props.loop = v; }), 'Turn on “Play automatically” and “Loop”, and turn off controls, for a moving picture with no buttons.') : null,
    el.props.source === 'file' ? toggleCtl('Show play controls', el.props.controls !== false, v => setEl(el, () => { el.props.controls = v; })) : null,
    field('Shape', segCtl([{ v: 'wide', label: 'Wide 16:9' }, { v: 'landscape', label: 'Classic 4:3' }, { v: 'square', label: 'Square' }, { v: 'portrait', label: 'Tall' }], el.props.ratio || 'wide', v => setEl(el, () => { el.props.ratio = v; }))),
    field('Video title', inputCtl(el.props.title, v => setEl(el, () => { el.props.title = v; }, 'title', { render: false }), { placeholder: 'For screen readers' }))
  ],
  map: el => [
    field('Address or place', inputCtl(el.props.address, v => setEl(el, () => { el.props.address = v; }, 'address'), { placeholder: 'e.g. 1 High Street, York' })),
    field('Zoom', rangeCtl(3, 20, 1, +el.props.zoom || 15, v => setEl(el, () => { el.props.zoom = v; }, 'zoom'), v => v < 8 ? v + ' · region' : v < 13 ? v + ' · town' : v < 17 ? v + ' · streets' : v + ' · close up')),
    field('Shape', segCtl([{ v: 'wide', label: 'Wide' }, { v: 'landscape', label: 'Classic' }, { v: 'square', label: 'Square' }], el.props.ratio || 'landscape', v => setEl(el, () => { el.props.ratio = v; }))),
    h('p', { class: 'hint' }, 'Maps come from Google Maps and need an internet connection.')
  ],
  ticker: el => [
    field('Scrolling text', inputCtl(el.props.text, v => setEl(el, () => { el.props.text = v; }, 'text'), { multiline: true, rows: 2 })),
    field('Speed', segCtl([{ v: 'slow', label: 'Slow' }, { v: 'normal', label: 'Normal' }, { v: 'fast', label: 'Fast' }], el.props.speed || 'normal', v => setEl(el, () => { el.props.speed = v; }))),
    h('p', { class: 'hint' }, 'The text stops while someone points at it. Visitors who turn off animations see it standing still.')
  ],
  card: el => [
    imageCtl(el.props.image, v => setEl(el, () => { el.props.image = v; }, null, { panel: true }), { removable: true }),
    el.props.image ? field('Describe the picture', inputCtl(el.props.alt, v => setEl(el, () => { el.props.alt = v; }, 'alt', { render: false }))) : null,
    el.props.image ? field('Picture shape', segCtl(SHAPE_OPTS.filter(o => o.v !== 'circle').map(o => o.v === '' ? { v: '', label: 'Landscape' } : o).filter(o => o.v !== 'landscape'), el.props.imageShape || '', v => setEl(el, () => { el.props.imageShape = v; }))) : null,
    field('Title', inputCtl(el.props.title, v => setEl(el, () => { el.props.title = v; }, 'title'))),
    field('Text', inputCtl(el.props.text, v => setEl(el, () => { el.props.text = v; }, 'text'), { multiline: true, rows: 3 })),
    field('Button text', inputCtl(el.props.buttonText, v => setEl(el, () => { el.props.buttonText = v; }, 'btn'), { placeholder: 'Leave empty for no button' })),
    el.props.buttonText ? field('Button goes to', linkCtl(el.props.link, el.props.newTab, (l, t) => setEl(el, () => { el.props.link = l; el.props.newTab = t; }, 'link'))) : null
  ],
  quote: el => [
    field('Quote', inputCtl(el.props.text, v => setEl(el, () => { el.props.text = v; }, 'text'), { multiline: true, rows: 3 })),
    field('Who said it', inputCtl(el.props.cite, v => setEl(el, () => { el.props.cite = v; }, 'cite')))
  ],
  table: el => {
    const rows = el.props.rows;
    const cols = rows[0] ? rows[0].length : 0;
    return [
      h('div', { class: 'tip' }, icon('pencil'), h('p', null, 'Click any cell on the page to type in it.')),
      field('Rows and columns', h('div', { class: 'btn-grid' },
        h('button', { type: 'button', class: 'btn sm', onclick: () => setEl(el, () => { rows.push(new Array(cols || 1).fill('')); }, null, { panel: true }) }, icon('plus'), 'Row'),
        h('button', { type: 'button', class: 'btn sm', disabled: rows.length < 2, onclick: () => setEl(el, () => { rows.pop(); }, null, { panel: true }) }, icon('trash'), 'Last row'),
        h('button', { type: 'button', class: 'btn sm', disabled: cols >= 8, onclick: () => setEl(el, () => { rows.forEach(r => r.push('')); }, null, { panel: true }) }, icon('plus'), 'Column'),
        h('button', { type: 'button', class: 'btn sm', disabled: cols < 2, onclick: () => setEl(el, () => { rows.forEach(r => r.pop()); }, null, { panel: true }) }, icon('trash'), 'Last column')),
        rows.length + ' rows × ' + cols + ' columns'),
      toggleCtl('First row is a heading row', el.props.header, v => setEl(el, () => { el.props.header = v; })),
      toggleCtl('Shade every other row', el.props.striped, v => setEl(el, () => { el.props.striped = v; })),
      field('Table title', inputCtl(el.props.caption, v => setEl(el, () => { el.props.caption = v; }, 'caption'), { placeholder: 'Optional' }))
    ];
  },
  faq: el => {
    const items = el.props.items;
    return [
      h('div', { class: 'qa-list' }, items.map((it, i) => h('div', { class: 'qa' },
        h('div', { class: 'qa-head' }, h('b', null, 'Question ' + (i + 1)), h('button', { type: 'button', class: 'ibtn', title: 'Remove question', 'aria-label': 'Remove question', onclick: () => setEl(el, () => { items.splice(i, 1); }, null, { panel: true }) }, icon('trash'))),
        inputCtl(it.q, v => setEl(el, () => { it.q = v; }, 'q' + i), { placeholder: 'Question' }),
        inputCtl(it.a, v => setEl(el, () => { it.a = v; }, 'a' + i), { multiline: true, rows: 2, placeholder: 'Answer' })))),
      h('button', { type: 'button', class: 'btn sm', onclick: () => setEl(el, () => { items.push({ q: 'New question', a: 'The answer.' }); }, null, { panel: true }) }, icon('plus'), 'Add a question'),
      toggleCtl('Only one answer open at a time', el.props.single, v => setEl(el, () => { el.props.single = v; }))
    ];
  },
  form: el => {
    const p = el.props;
    return [
      field('Send messages to', segCtl([{ v: 'email', label: 'My email' }, { v: 'service', label: 'A form service' }], p.mode || 'email', v => setEl(el, () => { p.mode = v; }, null, { panel: true }))),
      p.mode === 'service'
        ? field('Form service address', inputCtl(p.action, v => setEl(el, () => { p.action = v.trim(); }, 'action', { render: false }), { placeholder: 'https://formspree.io/f/…', type: 'url' }), 'A website can’t send email by itself. Free services such as Formspree, Basin or Netlify Forms give you an address to paste here and email you each message.')
        : field('Your email address', inputCtl(p.email, v => setEl(el, () => { p.email = v.trim(); }, 'email', { render: false }), { placeholder: 'you@example.com', type: 'email' }), 'Visitors’ own email app opens with their message filled in. For a smoother experience, use a form service.'),
      field('Fields', h('div', { class: 'form-fields' }, p.fields.map(fd => h('div', { class: 'ff' },
        h('input', { type: 'checkbox', checked: !!fd.on, 'aria-label': 'Include ' + fd.label, onchange: e => setEl(el, () => { fd.on = e.target.checked; }) }),
        inputCtl(fd.label, v => setEl(el, () => { fd.label = v; }, 'f' + fd.key)),
        h('label', { class: 'ff-req', title: 'Visitors must fill this in' }, h('input', { type: 'checkbox', checked: !!fd.required, onchange: e => setEl(el, () => { fd.required = e.target.checked; }) }), 'Required'))))),
      field('Button text', inputCtl(p.submitText, v => setEl(el, () => { p.submitText = v; }, 'submit')))
    ];
  },
  divider: el => [field('Style', segCtl([{ v: 'line', label: 'Line' }, { v: 'dashed', label: 'Dashed' }, { v: 'dotted', label: 'Dotted' }, { v: 'short', label: 'Short' }], el.props.variant || 'line', v => setEl(el, () => { el.props.variant = v; })))],
  spacer: el => [
    field('Height', segCtl([{ v: 'sm', label: 'S' }, { v: 'md', label: 'M' }, { v: 'lg', label: 'L' }, { v: 'xl', label: 'XL' }], el.props.height ? null : (el.props.size || 'md'), v => setEl(el, () => { el.props.size = v; el.props.height = 0; }, null, { panel: true }))),
    field('Exact height', rangeCtl(4, 600, 4, +el.props.height || ({ sm: 16, md: 40, lg: 80, xl: 128 }[el.props.size || 'md']), v => setEl(el, () => { el.props.height = v; }, 'height'), v => v + ' px'), 'Or drag the handle at the bottom of the space on the page.')
  ],
  html: el => [
    field('Your HTML', inputCtl(el.props.code, v => setEl(el, () => { el.props.code = v; }, 'code'), { multiline: true, rows: 10, mono: true })),
    h('div', { class: 'tip warn' }, icon('warn'), h('p', null, 'For code from booking systems, newsletters and similar services. Scripts only run in Preview and on your published site.'))
  ]
};

function widthCtl(el) {
  const st = el.style;
  const cur = Math.max(10, Math.min(100, Math.round(+st.width || 100)));
  const r = rangeCtl(10, 100, 5, cur, v => setEl(el, () => { st.width = String(v); }, 'width'), v => v + '%');
  const presets = segCtl([{ v: 25, label: '¼' }, { v: 50, label: '½' }, { v: 75, label: '¾' }, { v: 100, label: 'Full' }], [25, 50, 75, 100].includes(cur) ? cur : null, v => setEl(el, () => { st.width = String(v); }, null, { panel: true }));
  return h('div', { class: 'width-ctl' }, r, presets);
}
const SHAPE_OPTS = [{ v: '', label: 'Original' }, { v: 'square', label: 'Square' }, { v: 'landscape', label: 'Landscape' }, { v: 'portrait', label: 'Portrait' }, { v: 'wide', label: 'Wide' }, { v: 'circle', label: 'Circle' }];
function stylePanel(el) {
  const sup = STYLE_SUPPORT[el.type] || [];
  const st = el.style;
  const s = (fn, key) => setEl(el, fn, key);
  const out = [];
  if (sup.includes('align')) out.push(field('Line up', segCtl([{ v: 'left', icon: 'left', title: 'Left' }, { v: 'center', icon: 'center', title: 'Centre' }, { v: 'right', icon: 'right', title: 'Right' }], st.align || 'left', v => s(() => { st.align = v; }), { cls: 'icons' })));
  if (sup.includes('width')) out.push(field('Width', widthCtl(el), 'Drag the round handle on the right edge of the item on the page to resize it there too.'));
  if (sup.includes('size')) out.push(field('Text size', selectCtl(SIZE_OPTS, st.size || '', v => s(() => { st.size = v; }))));
  if (sup.includes('color')) out.push(field('Text colour', colorCtl(st.color, v => s(() => { st.color = v; }), { noneLabel: 'Automatic' })));
  if (sup.includes('bg')) out.push(field('Background', colorCtl(st.bg, v => s(() => { st.bg = v; }))));
  if (sup.includes('padding')) out.push(field('Inner space', segCtl([{ v: '', label: 'Auto' }, { v: 'none', label: 'None' }, { v: 'sm', label: 'S' }, { v: 'md', label: 'M' }, { v: 'lg', label: 'L' }], st.padding || '', v => s(() => { st.padding = v; }))));
  if (sup.includes('radius')) out.push(field('Corners', segCtl([{ v: '', label: 'Site' }, { v: 'none', label: 'Square' }, { v: 'sm', label: 'S' }, { v: 'md', label: 'M' }, { v: 'lg', label: 'L' }], st.radius || '', v => s(() => { st.radius = v; }))));
  if (sup.includes('shadow')) out.push(toggleCtl('Drop shadow', st.shadow, v => s(() => { st.shadow = v; })));
  return out;
}

function elementPanel(f) {
  const el = f.el;
  const content = (CONTENT[el.type] || (() => []))(el);
  const style = stylePanel(el);
  return h('div', null,
    panelHead(el.type, T.LABELS[el.type] || el.type, 'In a section on ' + f.page.name),
    group('Content', ...content),
    style.length ? group('Look', ...style) : null,
    el.type !== 'spacer' ? group('Movement',
      field('Appear effect', selectCtl([['', 'None'], ['fade', 'Fade in'], ['up', 'Rise up'], ['left', 'Slide in from the left'], ['right', 'Slide in from the right'], ['zoom', 'Zoom in']], el.style.anim || '', v => setEl(el, () => { el.style.anim = v; }, null, { render: false })), 'Plays once when the visitor scrolls to it. See it in Preview.'),
      field('Keep moving', selectCtl([['', 'No'], ['float', 'Float up and down'], ['pulse', 'Pulse'], ['sway', 'Sway'], ['spin', 'Spin slowly']], el.style.motion || '', v => setEl(el, () => { el.style.motion = v; })), 'Visitors who turn off animations on their device won’t see movement.')) : null,
    group('Visibility', toggleCtl('Hide on phones', el.style.hideMobile, v => setEl(el, () => { el.style.hideMobile = v; }, null, { render: false })), field(null, null)),
    actionRow(() => moveElement(el.id, -1), () => moveElement(el.id, 1))
  );
}

function headerPanel() {
  const hd = site.header;
  const s = (fn, key, o) => { fn(); changed(Object.assign({ key: key ? 'header:' + key : null }, o || {})); };
  return h('div', null,
    panelHead('header', 'Header', 'Shown at the top of every page'),
    group('Header',
      toggleCtl('Show the header', hd.show, v => s(() => { hd.show = v; })),
      field('Name or logo text', inputCtl(hd.logoText, v => s(() => { hd.logoText = v; }, 'logo'))),
      field('Logo picture', imageCtl(hd.logoImage, v => s(() => { hd.logoImage = v; }, null, { panel: true }), { removable: true })),
      field('Arrangement', segCtl([{ v: 'split', label: 'Logo left, menu right' }, { v: 'center', label: 'Centred' }], hd.layout || 'split', v => s(() => { hd.layout = v; }))),
      toggleCtl('Stay at the top while scrolling', hd.sticky, v => s(() => { hd.sticky = v; }))),
    group('Colours',
      field('Background', colorCtl(hd.bg, v => s(() => { hd.bg = v; }), { none: false })),
      field('Text', colorCtl(hd.color, v => s(() => { hd.color = v; }), { noneLabel: 'Automatic' }))),
    group('Extra menu links', menuLinksEditor()),
    h('div', { class: 'tip' }, icon('pages'), h('p', null, 'The menu lists your pages. Add, rename and reorder pages in the Pages tab on the left. To make a drop-down, choose a page and set “Place in the menu”.'))
  );
}
function menuLinksEditor() {
  const list = site.header.menuLinks = site.header.menuLinks || [];
  const tops = site.pages.filter(p => !p.parent && p.showInNav !== false);
  const s = (fn, key, o) => { fn(); changed(Object.assign({ key: key ? 'header:ml:' + key : null }, o || {})); };
  return h('div', { class: 'qa-list' },
    h('p', { class: 'hint' }, 'Add links that aren’t your own pages — a booking site, a shop, social media — to the menu or to a drop-down.'),
    list.map((m, i) => h('div', { class: 'qa' },
      h('div', { class: 'qa-head' }, h('b', null, 'Link ' + (i + 1)),
        h('button', { type: 'button', class: 'ibtn', title: 'Remove link', 'aria-label': 'Remove link', onclick: () => s(() => { list.splice(i, 1); }, null, { panel: true }) }, icon('trash'))),
      field('Menu text', inputCtl(m.label, v => s(() => { m.label = v; }, m.id + 'l'))),
      field('Goes to', linkCtl(m.link, m.newTab, (l, t) => s(() => { m.link = l; m.newTab = t; }, m.id + 'k'))),
      field('Show', selectCtl([['', 'At the top level'], ...tops.map(p => [p.id, 'Under “' + p.name + '”'])], m.parent || '', v => s(() => { m.parent = v; }))))),
    h('button', { type: 'button', class: 'btn sm', onclick: () => s(() => { list.push({ id: uid(), label: 'New link', link: '', newTab: false, parent: '' }); }, null, { panel: true }) }, icon('plus'), 'Add a menu link'));
}
function footerPanel() {
  const ft = site.footer;
  const s = (fn, key, o) => { fn(); changed(Object.assign({ key: key ? 'footer:' + key : null }, o || {})); };
  return h('div', null,
    panelHead('footer', 'Footer', 'Shown at the bottom of every page'),
    group('Footer',
      toggleCtl('Show the footer', ft.show, v => s(() => { ft.show = v; })),
      field('Footer text', inputCtl(ft.text, v => s(() => { ft.text = v; }, 'text'), { multiline: true, rows: 3 }), 'Type {year} to show the current year.'),
      toggleCtl('Show links to your pages', ft.showNav, v => s(() => { ft.showNav = v; }))),
    group('Colours',
      field('Background', colorCtl(ft.bg, v => s(() => { ft.bg = v; }), { none: false })),
      field('Text', colorCtl(ft.color, v => s(() => { ft.color = v; }), { noneLabel: 'Automatic' })))
  );
}

/* ================================================================== */
/* Left panel: Add, Pages, Design                                      */
/* ================================================================== */

function sectionThumb(key) {
  const R = (x, y, w, hh, o, rx) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="' + (rx == null ? 1.5 : rx) + '" fill="currentColor" opacity="' + (o == null ? 0.25 : o) + '"/>';
  const L = (x, y, w, o) => R(x, y, w, 3, o == null ? 0.45 : o, 1.5);
  const map = {
    blank: R(6, 8, 108, 54, 0.08, 4) + '<path d="M60 26v18M51 35h18" stroke="currentColor" stroke-width="2" opacity=".4"/>',
    two: R(6, 10, 51, 50, 0.12, 3) + R(63, 10, 51, 50, 0.12, 3),
    three: R(6, 10, 32, 50, 0.12, 3) + R(44, 10, 32, 50, 0.12, 3) + R(82, 10, 32, 50, 0.12, 3),
    hero: R(0, 0, 120, 70, 0.55, 0) + R(30, 22, 60, 6, 0.95) + R(38, 33, 44, 3, 0.7) + R(48, 44, 24, 8, 0.95, 4),
    imageText: R(6, 10, 50, 50, 0.3, 3) + L(66, 18, 40, 0.7) + L(66, 28, 46) + L(66, 34, 42) + R(66, 44, 22, 7, 0.6, 3.5),
    textImage: L(8, 18, 40, 0.7) + L(8, 28, 46) + L(8, 34, 42) + R(64, 10, 50, 50, 0.3, 3),
    features: L(40, 6, 40, 0.7) + [8, 45, 82].map(x => R(x, 16, 30, 48, 0.14, 3) + R(x, 16, 30, 18, 0.3, 3) + L(x + 4, 40, 20, 0.6) + L(x + 4, 47, 22)).join(''),
    gallery: L(40, 6, 40, 0.7) + [0, 1, 2].map(r => [0, 1, 2].map(c => R(18 + c * 29, 14 + r * 18.5, 26, 16, 0.3, 2)).join('')).join(''),
    slideshow: R(0, 6, 120, 52, 0.35, 0) + '<path d="M10 32l5-5M10 32l5 5M110 32l-5-5M110 32l-5 5" stroke="currentColor" stroke-width="2"/>' + [52, 60, 68].map((x, i) => '<circle cx="' + x + '" cy="65" r="2" fill="currentColor" opacity="' + (i ? 0.3 : 0.8) + '"/>').join(''),
    quote: R(0, 6, 120, 58, 0.08, 0) + '<text x="60" y="34" font-size="26" text-anchor="middle" fill="currentColor" opacity=".55" font-family="Georgia">“</text>' + L(30, 38, 60, 0.6) + L(42, 47, 36),
    cta: R(0, 6, 120, 58, 0.5, 0) + R(34, 18, 52, 5, 0.95) + L(40, 29, 40, 0.75) + R(46, 40, 28, 9, 0.95, 4.5),
    faq: L(8, 12, 30, 0.7) + [12, 26, 40, 54].map(y => R(46, y, 66, 10, 0.14, 2) + L(50, y + 3.5, 40, 0.5)).join(''),
    contact: L(8, 12, 36, 0.7) + L(8, 22, 44) + L(8, 28, 40) + [12, 24].map(y => R(64, y, 50, 9, 0.18, 2)).join('') + R(64, 36, 50, 16, 0.18, 2) + R(64, 56, 22, 7, 0.6, 3),
    ticker: R(0, 26, 120, 18, 0.55, 0) + L(6, 33.5, 30, 0.9) + L(44, 33.5, 30, 0.9) + L(82, 33.5, 30, 0.9),
    video: L(40, 6, 40, 0.7) + R(22, 14, 76, 48, 0.3, 3) + '<path d="M55 30l12 8-12 8z" fill="currentColor" opacity=".8"/>'
  };
  return '<svg viewBox="0 0 120 70" aria-hidden="true">' + (map[key] || map.blank) + '</svg>';
}

function renderAddTab() {
  const root = $('#tab-add');
  root.innerHTML = '';
  root.appendChild(h('p', { class: 'tab-intro' }, 'Drag onto your page, or click to add after the selected item.'));
  const groups = {};
  T.ELEMENTS.forEach(e => (groups[e.group] = groups[e.group] || []).push(e));
  Object.keys(groups).forEach(g => {
    const grid = h('div', { class: 'el-grid' });
    groups[g].forEach(e => {
      const b = h('button', { type: 'button', class: 'el-tile', draggable: 'true', title: 'Add ' + e.label.toLowerCase() }, icon(e.type), h('span', null, e.label));
      b.addEventListener('dragstart', ev => startPaletteDrag(ev, { kind: 'new-el', type: e.type }));
      b.addEventListener('dragend', endDrag);
      b.addEventListener('click', () => addElement(e.type));
      grid.appendChild(b);
    });
    root.appendChild(h('section', { class: 'lgroup' }, h('h3', null, g), grid));
  });
  const sgrid = h('div', { class: 'sec-grid' });
  T.SECTIONS.forEach(s => {
    const b = h('button', { type: 'button', class: 'sec-tile', draggable: 'true', title: 'Add a ' + s.label.toLowerCase() + ' section' }, h('span', { class: 'sec-thumb', html: sectionThumb(s.thumb) }), h('span', null, s.label));
    b.addEventListener('dragstart', ev => startPaletteDrag(ev, { kind: 'new-section', key: s.key }));
    b.addEventListener('dragend', endDrag);
    b.addEventListener('click', () => addSectionTemplate(s.key));
    sgrid.appendChild(b);
  });
  root.appendChild(h('section', { class: 'lgroup' }, h('h3', null, 'Ready-made sections'), sgrid));
}

function renderPagesTab() {
  const root = $('#tab-pages');
  if (!root || !site) return;
  root.innerHTML = '';
  const files = Gen.pageFiles(site);
  const list = h('ul', { class: 'page-list' });
  site.pages.forEach((p, i) => {
    const parentPage = p.parent && site.pages.find(x => x.id === p.parent);
    const li = h('li', { class: 'page-item' + (p.id === pageId ? ' active' : '') + (parentPage ? ' is-child' : '') },
      h('button', { type: 'button', class: 'page-open', onclick: () => switchPage(p.id) },
        icon(i === 0 ? 'home' : 'page'),
        h('span', { class: 'page-text' }, h('span', { class: 'page-name' }, p.name), h('span', { class: 'page-file' }, files[p.id] + (p.showInNav === false ? ' · hidden from menu' : parentPage ? ' · under ' + parentPage.name : '')))),
      h('span', { class: 'page-acts' },
        h('button', { type: 'button', class: 'ibtn', title: 'Move up', 'aria-label': 'Move ' + p.name + ' up', disabled: i === 0, onclick: () => { site.pages.splice(i - 1, 0, site.pages.splice(i, 1)[0]); changed({ pages: true, panel: true }); } }, icon('up')),
        h('button', { type: 'button', class: 'ibtn', title: 'Move down', 'aria-label': 'Move ' + p.name + ' down', disabled: i === site.pages.length - 1, onclick: () => { site.pages.splice(i + 1, 0, site.pages.splice(i, 1)[0]); changed({ pages: true, panel: true }); } }, icon('down'))));
    list.appendChild(li);
  });
  root.appendChild(h('p', { class: 'tab-intro' }, 'The first page is your home page. Pages appear in the menu in this order.'));
  root.appendChild(list);
  root.appendChild(h('div', { class: 'btn-row' },
    h('button', { type: 'button', class: 'btn', onclick: addPage }, icon('plus'), 'Add a page')));
}
function switchPage(id) {
  if (id === pageId) { select(null); return; }
  pageId = id;
  sel = null;
  renderPagesTab();
  renderCanvas();
  renderPanel();
  const d = cdoc(); if (d) d.defaultView.scrollTo(0, 0);
}
function addPage() {
  let n = site.pages.length + 1, name = 'New page';
  while (site.pages.some(p => p.name === name)) name = 'New page ' + (n++);
  const p = { id: uid(), name, title: '', description: '', showInNav: true, sections: [T.makeSectionObj(ctx, '1', [[T.makeElement('heading', ctx, { text: name, level: 1 }), T.makeElement('text', ctx)]], { padding: 'lg' })] };
  site.pages.push(p);
  pageId = p.id; sel = null;
  changed({ pages: true, panel: true });
  toast('Page added. Name it in the panel on the right.');
  const first = $('#props input'); if (first) { first.focus(); first.select(); }
}
function duplicatePage(page) {
  const c = reId(page);
  c.name = page.name + ' copy';
  site.pages.splice(site.pages.indexOf(page) + 1, 0, c);
  pageId = c.id; sel = null;
  changed({ pages: true, panel: true });
}
function deletePage(page) {
  modal({
    title: 'Delete “' + page.name + '”?',
    body: h('p', null, 'This removes the page and everything on it. You can bring it back with Undo.'),
    actions: [{ label: 'Cancel' }, { label: 'Delete page', danger: true, onClick: () => {
      const i = site.pages.indexOf(page);
      site.pages.splice(i, 1);
      site.pages.forEach(c => { if (c.parent === page.id) delete c.parent; });
      (site.header.menuLinks || []).forEach(m => { if (m.parent === page.id) m.parent = ''; });
      pageId = site.pages[Math.max(0, i - 1)].id; sel = null;
      changed({ pages: true, panel: true });
    } }]
  });
}
function makeHome(page) {
  site.pages.splice(site.pages.indexOf(page), 1);
  site.pages.unshift(page);
  changed({ pages: true, panel: true });
  toast('“' + page.name + '” is now the home page (index.html).');
}

let fontsLoaded = false;
function loadAllFonts() {
  if (fontsLoaded) return;
  fontsLoaded = true;
  const specs = Object.values(Gen.FONTS).map(f => f.g).filter(Boolean);
  document.head.appendChild(h('link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?' + specs.map(s => 'family=' + s.replace(/:.*$/, '')).join('&') + '&display=swap' }));
}
function renderDesignTab() {
  const root = $('#tab-design');
  if (!root || !site) return;
  const scroll = root.scrollTop;
  root.innerHTML = '';
  const th = site.theme;
  const set = (fn, key) => { fn(); changed({ key: key ? 'theme:' + key : null, design: !key }); };
  // palettes
  const pal = h('div', { class: 'palettes' });
  Object.keys(Gen.PALETTES).forEach(name => {
    const c = Gen.PALETTES[name];
    pal.appendChild(h('button', { type: 'button', class: 'palette' + (th.palette === name ? ' active' : ''), 'aria-pressed': String(th.palette === name), onclick: () => set(() => { th.palette = name; th.colors = Object.assign({}, c); }) },
      h('span', { class: 'pal-dots', style: 'background:' + c.background }, Gen.THEME_KEYS.filter(k => k !== 'background').map(k => h('span', { style: 'background:' + c[k] }))),
      h('span', null, name)));
  });
  // own colours
  const own = h('div', { class: 'own-colors' }, Gen.THEME_KEYS.map(k => {
    const inp = h('input', { type: 'color', 'aria-label': Gen.THEME_LABELS[k] + ' colour' });
    inp.value = th.colors[k];
    inp.addEventListener('input', () => { th.colors[k] = inp.value; th.palette = ''; sw.style.background = inp.value; hex.textContent = inp.value; changed({ key: 'theme:color:' + k }); });
    const sw = h('span', { class: 'own-sw', style: 'background:' + th.colors[k] }, inp);
    const hex = h('span', { class: 'own-hex' }, th.colors[k]);
    return h('label', { class: 'own' }, sw, h('span', { class: 'own-name' }, Gen.THEME_LABELS[k]), hex);
  }));
  const contrastMsg = (() => {
    const c = th.colors;
    const bad = [];
    if (Gen.contrast(c.text, c.background) < 4.5) bad.push('Text on the page colour is hard to read.');
    if (Gen.contrast(c.text, c.surface) < 4.5) bad.push('Text on the panel colour is hard to read.');
    return bad.length ? h('div', { class: 'tip warn' }, icon('warn'), h('p', null, bad.join(' ') + ' Try a darker text colour or a lighter background.')) : null;
  })();
  // fonts
  loadAllFonts();
  const pairs = h('div', { class: 'pairs' }, Gen.FONT_PAIRS.map(p => {
    const active = th.fonts.heading === p.heading && th.fonts.body === p.body;
    return h('button', { type: 'button', class: 'pair' + (active ? ' active' : ''), 'aria-pressed': String(active), onclick: () => set(() => { th.fonts = { heading: p.heading, body: p.body }; }) },
      h('span', { class: 'pair-h', style: 'font-family:' + Gen.FONTS[p.heading].stack + ';font-weight:' + (Gen.FONTS[p.heading].weight || 700) }, p.name),
      h('span', { class: 'pair-b', style: 'font-family:' + Gen.FONTS[p.body].stack }, p.heading + ' · ' + p.body));
  }));
  const fontOpts = Object.keys(Gen.FONTS).map(n => [n, n]);
  root.appendChild(h('div', null,
    h('section', { class: 'lgroup' }, h('h3', null, 'Colour schemes'), pal),
    h('section', { class: 'lgroup' }, h('h3', null, 'Your colours'), own, contrastMsg),
    h('section', { class: 'lgroup' }, h('h3', null, 'Fonts'), pairs,
      field('Headings', selectCtl(fontOpts, th.fonts.heading, v => set(() => { th.fonts.heading = v; }))),
      field('Body text', selectCtl(fontOpts, th.fonts.body, v => set(() => { th.fonts.body = v; })))),
    h('section', { class: 'lgroup' }, h('h3', null, 'Corners'),
      segCtl([{ v: 'square', label: 'Square' }, { v: 'soft', label: 'Soft' }, { v: 'round', label: 'Round' }], th.radius || 'soft', v => set(() => { th.radius = v; }))),
    h('section', { class: 'lgroup' }, h('h3', null, 'Website'),
      field('Website name', inputCtl(site.name, v => { site.name = v; changed({ key: 'site:name', render: false }); }), 'Used in browser tabs and search results.'),
      field('Language', selectCtl([['en-GB', 'English (UK)'], ['en-US', 'English (US)'], ['en', 'English'], ['cy', 'Welsh'], ['ga', 'Irish'], ['fr', 'French'], ['de', 'German'], ['es', 'Spanish'], ['it', 'Italian'], ['nl', 'Dutch'], ['pt', 'Portuguese'], ['pl', 'Polish'], ['sv', 'Swedish']], site.settings.language || 'en', v => { site.settings.language = v; changed({ render: false }); syncSpellLanguage(); }), 'Helps screen readers pronounce your words correctly, and sets the spelling dictionary.'),
      field('Website address', h('div', { class: 'domain-row' }, h('code', { class: 'domain-now' }, site.settings.domain ? 'https://' + Gen.cleanDomain(site.settings.domain) : 'Not set yet'), h('button', { type: 'button', class: 'btn sm', onclick: domainWizard }, icon('globe'), site.settings.domain ? 'Change…' : 'Set up…')), 'Your domain name and a free HTTPS certificate, step by step.'),
      field('Spelling', h('button', { type: 'button', class: 'btn sm', onclick: checkSpelling }, icon('check'), 'Check spelling on every page'), DESKTOP ? 'Or press F7. Right-click an underlined word for suggestions.' : 'Right-click an underlined word for suggestions.'),
      field('Site icon', imageCtl(site.settings.favicon, v => { site.settings.favicon = v; changed({ design: true, render: false }); }, { removable: true }), 'The small picture in the browser tab. A square picture works best.'))
  ));
  root.scrollTop = scroll;
}

function setLeftTab(t) {
  leftTab = t;
  $$('.ltab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  ['add', 'pages', 'design'].forEach(k => { $('#tab-' + k).hidden = k !== t; });
  if (t === 'pages') renderPagesTab();
  if (t === 'design') renderDesignTab();
}

/* ================================================================== */
/* Modes: edit, preview, code                                          */
/* ================================================================== */

function setMode(m) {
  mode = m;
  $('#app').dataset.mode = m;
  $$('[data-mode-btn]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.modeBtn === m)));
  $('#canvas').hidden = m !== 'edit';
  $('#preview').hidden = m !== 'preview';
  $('#codeview').hidden = m !== 'code';
  $('#frameWrap').hidden = m === 'code';
  if (m === 'preview') showPreview(curPage());
  else { const pf = $('#preview'); pf.removeAttribute('srcdoc'); if (DESKTOP) pf.src = 'about:blank'; }
  if (m === 'code') renderCodeView();
  if (m === 'edit') setTimeout(applySelection, 50);
}

function exportFiles() {
  const out = Gen.generateSite(site, { assetInfo });
  const files = Object.assign({}, out.files);
  Object.keys(out.assets).forEach(p => { const a = assets[out.assets[p]]; if (a) files[p] = a.bytes; });
  return files;
}

function showPreview(page) {
  previewPage = page;
  const pf = $('#preview');
  if (DESKTOP) {
    api.setPreview(exportFiles());
    pf.src = 'weaver-preview://site/' + Gen.pageFiles(site)[page.id] + '?v=' + Date.now();
  } else {
    pf.onload = () => {
      try {
        const d = pf.contentDocument;
        d.addEventListener('click', e => {
          const a = e.target.closest && e.target.closest('a[href]');
          if (!a) return;
          const href = a.getAttribute('href');
          const files = Gen.pageFiles(site);
          const target = site.pages.find(p => files[p.id] === href.split('#')[0]);
          if (target) { e.preventDefault(); showPreview(target); }
          else if (!href.startsWith('#')) { e.preventDefault(); toast('Links to other websites work on your published site.'); }
        });
      } catch (err) { /* ignore */ }
    };
    pf.srcdoc = Gen.renderPreviewPage(site, page, { assetUrl, assetInfo, cssAssetUrl: assetUrl });
  }
}

function renderCodeView() {
  const out = Gen.generateSite(site, { assetInfo });
  const names = Object.keys(out.files);
  if (!names.includes(codeFile)) codeFile = names[0];
  const tabs = $('#codeTabs');
  tabs.innerHTML = '';
  names.forEach(n => tabs.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(n === codeFile), onclick: () => { codeFile = n; renderCodeView(); } }, n)));
  const code = out.files[codeFile];
  const kind = /\.css$/.test(codeFile) ? 'css' : /\.js$/.test(codeFile) ? 'js' : 'html';
  const lines = code.split('\n').length;
  $('#codeLines').textContent = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  $('#codeBody').innerHTML = highlight(code, kind);
  const imgCount = Object.keys(out.assets).length;
  $('#codeInfo').textContent = names.filter(n => /\.html$/.test(n)).length + ' pages, 1 stylesheet' + (out.files['js/site.js'] ? ', 1 script' : '') + ' and ' + imgCount + ' picture' + (imgCount === 1 ? '' : 's') + '. Pocket-Web-Studio writes this for you as you build. ' + (DESKTOP ? 'Publish saves it all to a folder.' : '');
}

/* ================================================================== */
/* Modals and messages                                                 */
/* ================================================================== */

let toastT;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { t.hidden = true; }, 3200);
}
function modal(o) {
  const root = $('#modalRoot');
  const prev = document.activeElement;
  const close = () => { back.remove(); document.removeEventListener('keydown', onKey, true); if (prev && prev.focus) try { prev.focus(); } catch (e) { /* ignore */ } if (o.onClose) o.onClose(); };
  const onKey = e => { if (e.key === 'Escape' && o.dismissable !== false) { e.stopPropagation(); close(); } };
  const box = h('div', { class: 'modal' + (o.wide ? ' wide' : '') + (o.cls ? ' ' + o.cls : ''), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'mt' },
    h('div', { class: 'modal-head' }, h('h2', { id: 'mt' }, o.title), o.dismissable !== false ? h('button', { type: 'button', class: 'ibtn', 'aria-label': 'Close', onclick: close }, icon('close')) : null),
    h('div', { class: 'modal-body' }, o.body),
    o.actions && o.actions.length ? h('div', { class: 'modal-foot' }, o.actions.map(a => h('button', {
      type: 'button', class: 'btn' + (a.primary ? ' primary' : '') + (a.danger ? ' danger-solid' : ''), disabled: a.disabled || null,
      onclick: async () => { if (a.onClick) { const keep = await a.onClick(); if (keep === true) return; } close(); }
    }, a.icon ? icon(a.icon) : null, a.label))) : null);
  const back = h('div', { class: 'modal-back', onmousedown: e => { if (e.target === back && o.dismissable !== false) close(); } }, box);
  root.appendChild(back);
  document.addEventListener('keydown', onKey, true);
  setTimeout(() => { const f = box.querySelector('.modal-foot .primary') || box.querySelector('button, input'); if (f) f.focus(); }, 30);
  return { close, box };
}

function chooseImages(o) {
  return new Promise(resolve => {
    let picked = [];
    let done = false;
    const grid = h('div', { class: 'pick-grid' });
    const counter = h('span', { class: 'hint' });
    const names = () => Object.keys(assets).filter(n => /^image\//.test(assets[n].mime)).sort((a, b) => (/^placeholder-/.test(a) ? 1 : 0) - (/^placeholder-/.test(b) ? 1 : 0));
    let m;
    const finish = r => { if (done) return; done = true; resolve(r); };
    const draw = () => {
      grid.innerHTML = '';
      const list = names();
      if (!list.length) grid.appendChild(h('p', { class: 'hint' }, 'No pictures yet.'));
      list.forEach(n => {
        const on = picked.includes(n);
        grid.appendChild(h('button', { type: 'button', class: 'pick' + (on ? ' on' : ''), title: n, 'aria-pressed': String(on), onclick: () => {
          if (!o.multiple) { finish([n]); m.close(); return; }
          picked = on ? picked.filter(x => x !== n) : picked.concat(n);
          draw();
        } }, h('img', { src: assetUrl(n), alt: '' }), h('span', null, /^placeholder-/.test(n) ? 'Sample picture' : n), on ? h('b', { class: 'pick-n' }, String(picked.indexOf(n) + 1)) : null));
      });
      counter.textContent = o.multiple ? (picked.length ? picked.length + ' selected' : 'Click pictures to select them') : '';
      const addBtn = m && m.box.querySelector('.modal-foot .primary');
      if (addBtn) addBtn.disabled = !picked.length;
    };
    const upload = async files => {
      const added = await importImages(files);
      if (!added.length) return;
      if (!o.multiple) { finish([added[0]]); m.close(); return; }
      picked = picked.concat(added);
      draw();
    };
    const drop = h('div', { class: 'drop-zone' },
      icon('upload'), h('p', null, h('b', null, 'Drop pictures here'), ' or ', h('button', { type: 'button', class: 'linkish', onclick: async () => upload(await pickFiles('image/*', true)) }, 'choose from your computer')),
      h('p', { class: 'hint' }, 'Large photos are resized and compressed automatically so your site stays fast.'));
    drop.addEventListener('dragover', e => { if (hasFiles(e.dataTransfer)) { e.preventDefault(); drop.classList.add('over'); } });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('over'); upload(e.dataTransfer.files); });
    m = modal({
      title: o.title || (o.multiple ? 'Add pictures' : 'Choose a picture'), wide: true,
      body: h('div', { class: 'picker' }, drop, h('h3', { class: 'pick-title' }, 'Your pictures'), grid, counter),
      actions: o.multiple ? [{ label: 'Cancel' }, { label: 'Add selected', primary: true, onClick: () => finish(picked) }] : [{ label: 'Cancel' }],
      onClose: () => finish(null)
    });
    draw();
  });
}

function templateChooser(o) {
  o = o || {};
  const card = st => {
    const c = Gen.PALETTES[st.palette];
    return h('button', { type: 'button', class: 'starter', onclick: () => { m.close(); o.onPick(st.key); } },
      h('span', { class: 'starter-art', style: 'background:' + c.background + ';color:' + c.text },
        h('span', { class: 'sa-head', style: 'background:' + c.surface }, h('span', { style: 'background:' + c.primary })),
        st.key === 'blank' ? h('span', { class: 'sa-blank', style: 'border-color:' + c.text }) : [
          h('span', { class: 'sa-hero', style: 'background:' + (st.key === 'portfolio' ? c.surface : c.primary) }, h('span', { style: 'background:' + c.accent })),
          h('span', { class: 'sa-row' }, [0, 1, 2].map(() => h('span', { style: 'background:' + c.surface })))
        ]),
      h('span', { class: 'starter-name' }, st.label), h('span', { class: 'starter-text' }, st.text));
  };
  const m = modal({
    title: o.title || 'Start a new website', wide: true, cls: 'has-logo', dismissable: o.dismissable !== false,
    body: h('div', null,
      h('p', { class: 'lead' }, 'Pick a starting point. You can change every word, picture, colour and font afterwards.'),
      h('div', { class: 'starters' }, T.STARTERS.map(card)),
      h('div', { class: 'import-row' },
        h('div', null, h('b', null, 'Already have a website?'), h('p', { class: 'hint' }, 'Import its folder of HTML, CSS and pictures to edit it here.')),
        h('button', { type: 'button', class: 'btn', onclick: () => { m.close(); importWebsite(); } }, icon('upload'), 'Import a website…')),
      DESKTOP ? h('p', { class: 'hint center' }, 'Have a Pocket-Web-Studio project file? ', h('button', { type: 'button', class: 'linkish', onclick: () => { m.close(); openProject(); } }, 'Open it')) : null)
  });
}

/* ================================================================== */
/* Importing an existing website                                       */
/* ================================================================== */

async function importRawBytes(name, mime, bytes) {
  const ext = (name.split('.').pop() || 'bin').toLowerCase();
  return addAsset(uniqueAssetName(Gen.slugify(name.replace(/\.[^.]+$/, '')) || 'file', ext), mime, bytes, 0, 0);
}
function pickFolderFiles() {
  return new Promise(resolve => {
    const inp = h('input', { type: 'file', hidden: true });
    inp.setAttribute('webkitdirectory', '');
    inp.multiple = true;
    inp.addEventListener('change', () => { resolve(Array.from(inp.files || [])); inp.remove(); });
    document.body.appendChild(inp);
    inp.click();
  });
}
async function importWebsite() {
  let list = [], folder = '';
  try {
    if (DESKTOP) {
      const r = await api.importFolder();
      if (!r) return;
      list = r.files; folder = r.name;
      if (r.skipped) toast(r.skipped + ' large or unusual files were left out.');
    } else {
      const files = (await pickFolderFiles()).filter(f => /\.(html?|css|png|jpe?g|gif|webp|svg|avif|bmp|ico|mp4|webm|woff2?|ttf|otf)$/i.test(f.name) && f.size < 80 * 1024 * 1024);
      if (!files.length) return;
      folder = (files[0].webkitRelativePath || '').split('/')[0];
      list = await Promise.all(files.map(async f => ({ path: f.webkitRelativePath || f.name, bytes: new Uint8Array(await f.arrayBuffer()) })));
    }
  } catch (err) { toast(err.message); return; }
  const status = h('p', { class: 'lead' }, 'Reading the website…');
  const busy = modal({ title: 'Importing ' + (folder || 'your website'), dismissable: false, body: h('div', { class: 'import-busy' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), status) });
  try {
    const { site: s, report } = await window.EzyImporter.importSite(list, {
      Gen, T, ctx, sanitizeRich,
      importImageBytes: (name, mime, bytes) => importImageFile(new File([bytes], name, { type: mime })),
      importVideoBytes: (name, mime, bytes) => importVideoFile(new File([bytes], name, { type: mime })),
      importRawBytes,
      progress: msg => { status.textContent = msg; }
    });
    busy.close();
    loadSite(s, Object.fromEntries(Object.keys(assets).map(n => [n, assets[n]])), null, folder || s.name);
    if (DESKTOP) setDirty(true);
    scheduleDraft();
    importReport(report, folder);
  } catch (err) {
    busy.close();
    modal({ title: 'That website couldn’t be imported', body: h('p', null, err.message), actions: [{ label: 'Close', primary: true }] });
  }
}
function importReport(r, folder) {
  const items = [];
  if (r.ownCode) items.push([ 'info', r.ownCode + ' part' + (r.ownCode > 1 ? 's' : '') + ' with no matching Pocket-Web-Studio element (such as forms or widgets) ' + (r.ownCode > 1 ? 'were' : 'was') + ' kept as “Own code”, so ' + (r.ownCode > 1 ? 'they still work' : 'it still works') + '.' ]);
  if (r.scripts) items.push([ 'info', r.scripts + ' script' + (r.scripts > 1 ? 's were' : ' was') + ' not imported. Pocket-Web-Studio adds its own menu, slideshow and animation scripts; add other scripts with an “Own code” element.' ]);
  if (r.remote) items.push([ 'info', r.remote + ' picture' + (r.remote > 1 ? 's load' : ' loads') + ' from another website and ' + (r.remote > 1 ? 'were' : 'was') + ' linked rather than copied.' ]);
  if (r.missing.length) items.push([ 'warn', r.missing.length + ' file' + (r.missing.length > 1 ? 's are' : ' is') + ' mentioned by the website but missing from the folder: ' + r.missing.slice(0, 6).join(', ') + (r.missing.length > 6 ? '…' : '') ]);
  r.notes.slice(0, 4).forEach(n => items.push([ 'warn', n ]));
  modal({
    title: 'Website imported', wide: true,
    body: h('div', null,
      h('div', { class: 'all-good' }, icon('check'), h('p', null, 'Imported ' + r.pages + ' page' + (r.pages === 1 ? '' : 's') + ' and ' + r.pictures + ' picture' + (r.pictures === 1 ? '' : 's') + (folder ? ' from “' + folder + '”' : '') + '.')),
      h('p', null, 'Pocket-Web-Studio has rebuilt the website as sections and elements you can edit, using its colours and fonts as closely as it can. It won’t look identical: check each page and adjust anything that moved. Your original files haven’t been changed.'),
      items.length ? h('ul', { class: 'issues' }, items.map(([lvl, t]) => h('li', null, icon(lvl, lvl), h('span', null, t)))) : null,
      DESKTOP ? h('p', { class: 'hint' }, 'Save to keep it as a Pocket-Web-Studio project, and Publish when it’s ready.') : null),
    actions: [{ label: 'Start editing', primary: true }]
  });
}

/* ================================================================== */
/* Projects: new, open, save, publish                                  */
/* ================================================================== */

function loadSite(s, assetMap, path, name) {
  clearAssets();
  Object.keys(assetMap || {}).forEach(n => { const a = assetMap[n]; addAsset(n, a.mime, a.bytes, a.w, a.h); });
  site = normalizeSite(s);
  for (let i = 1; i <= T.PLACEHOLDER_COUNT; i++) if (JSON.stringify(site).includes('placeholder-' + i + '.svg')) ensurePlaceholder(i);
  projectPath = path || null;
  projectName = name || site.name || 'Untitled website';
  pageId = site.pages[0].id;
  sel = null;
  resetHistory();
  setDirty(false);
  renderAll();
  syncSpellLanguage();
}
function newSite(kind) {
  clearAssets();
  const s = T.makeSite(kind, ctx);
  loadSite(s, Object.fromEntries(Object.keys(assets).map(n => [n, assets[n]])), null, kind === 'blank' ? 'Untitled website' : s.name);
  if (DESKTOP) { setDirty(true); }
  scheduleDraft();
}
function confirmDiscard(next) {
  if (!dirty || !DESKTOP) { next(); return; }
  modal({
    title: 'Save changes to “' + projectName + '”?',
    body: h('p', null, 'Your changes will be lost if you don’t save them.'),
    actions: [
      { label: 'Cancel' },
      { label: 'Don’t save', onClick: () => { next(); } },
      { label: 'Save', primary: true, onClick: async () => { if (await saveProject(false)) next(); } }
    ]
  });
}
function packAssets() {
  const used = new Set(Gen.usedAssets(site));
  const out = {};
  used.forEach(n => { const a = assets[n]; if (a) out[n] = { mime: a.mime, w: a.w, h: a.h, bytes: a.bytes }; });
  return out;
}
async function saveProject(as) {
  if (!DESKTOP) { saveDraftNow(); toast('Saved in this browser'); return true; }
  try {
    const r = await api.saveProject(as ? null : projectPath, { site, assets: packAssets() }, projectName);
    if (!r) return false;
    projectPath = r.path; projectName = r.name;
    setDirty(false);
    toast('Saved ' + r.name);
    return true;
  } catch (err) { toast(err.message); return false; }
}
async function openProject(path) {
  if (!DESKTOP) return;
  try {
    const r = await api.openProject(path || null);
    if (!r) return;
    loadSite(r.site, r.assets, r.path, r.name);
    toast('Opened ' + r.name);
  } catch (err) { toast(err.message); }
}

async function publish() {
  const issues = Gen.checkSite(site, assetInfo);
  const warns = issues.filter(i => i.level === 'warn'), infos = issues.filter(i => i.level === 'info');
  const issueList = list => h('ul', { class: 'issues' }, list.slice(0, 12).map(i => h('li', null, icon(i.level === 'warn' ? 'warn' : 'info', i.level),
    h('span', null, i.text),
    i.action === 'domain' ? h('button', { type: 'button', class: 'linkish', onclick: () => { m.close(); domainWizard(); } }, 'Set up') : null,
    i.pageId ? h('button', { type: 'button', class: 'linkish', onclick: () => { m.close(); setMode('edit'); if (pageId !== i.pageId) switchPage(i.pageId); if (i.id) select({ kind: 'el', id: i.id }, { scroll: true }); else select(null); } }, 'Show me') : null)));
  const files = exportFiles();
  const htmlCount = Object.keys(files).filter(f => /\.html$/.test(f)).length;
  const picCount = Object.keys(files).filter(f => /^(images|media)\//.test(f)).length;
  const body = h('div', null,
    h('p', { class: 'lead' }, DESKTOP
      ? 'Pocket-Web-Studio writes your website as ' + htmlCount + ' web page' + (htmlCount > 1 ? 's' : '') + ', a stylesheet, a script and ' + picCount + ' picture' + (picCount === 1 ? '' : 's') + ' into a folder. Upload that folder to any web host to put your site online.'
      : 'In the desktop app, Publish writes your website into a folder you can upload to any web host. In the browser, open the Code view to copy each file.'),
    warns.length ? h('div', null, h('h3', { class: 'issue-title' }, 'Worth fixing first'), issueList(warns)) : h('div', { class: 'all-good' }, icon('check'), h('p', null, 'No problems found.')),
    infos.length ? h('details', { class: 'issue-more' }, h('summary', null, infos.length + ' suggestion' + (infos.length > 1 ? 's' : '')), issueList(infos)) : null,
    DESKTOP && site.settings.publishFolder ? h('p', { class: 'hint' }, 'Last published to: ', h('code', null, site.settings.publishFolder)) : null);
  const doPublish = async folder => {
    try {
      const r = await api.exportSite(folder, files, !!folder);
      if (!r) return true;
      site.settings.publishFolder = r.folder;
      changed({ render: false });
      published(r.folder, htmlCount, picCount);
    } catch (err) { toast(err.message); return true; }
  };
  const actions = DESKTOP
    ? [{ label: 'Cancel' },
      site.settings.publishFolder ? { label: 'Choose another folder…', onClick: () => doPublish(null) } : null,
      { label: site.settings.publishFolder ? 'Publish again' : 'Choose folder and publish', primary: true, icon: 'publish', onClick: () => doPublish(site.settings.publishFolder || null) }].filter(Boolean)
    : [{ label: 'Close' }, { label: 'Open Code view', primary: true, icon: 'code', onClick: () => setMode('code') }];
  const m = modal({ title: 'Publish your website', body, actions, wide: true });
}
function published(folder, htmlCount, picCount) {
  modal({
    title: 'Your website is ready',
    body: h('div', null,
      h('div', { class: 'all-good' }, icon('check'), h('p', null, 'Saved ' + htmlCount + ' page' + (htmlCount > 1 ? 's' : '') + ' and ' + picCount + ' picture' + (picCount === 1 ? '' : 's') + ' to ', h('code', null, folder))),
      h('h3', { class: 'issue-title' }, 'Putting it online'),
      h('ol', { class: 'steps' },
        h('li', null, 'Choose a web host. Free options include Netlify Drop, GitHub Pages and Cloudflare Pages.'),
        h('li', null, 'Point your domain name at it and switch on free HTTPS: ', h('button', { type: 'button', class: 'linkish', onclick: () => domainWizard() }, 'Domain & HTTPS setup')),
        h('li', null, 'Upload everything inside the folder, keeping the images, css and js folders next to index.html.'),
        h('li', null, 'Publish again from Pocket-Web-Studio whenever you make changes, then upload the folder again.'))),
    actions: [{ label: 'Close' }, { label: 'Show folder', icon: 'folder', onClick: () => { api.reveal(folder); } }, { label: 'Open in browser', primary: true, icon: 'external', onClick: () => { api.openPublished(folder); } }]
  });
}

/* ================================================================== */
/* Spelling: check every word on every page                            */
/* ================================================================== */

const SPELL_KEYS = new Set(['text', 'html', 'title', 'caption', 'alt', 'cite', 'buttonText', 'label', 'q', 'a', 'submitText', 'rows']);
function textSlots() {
  const out = [];
  const walk = (obj, inText, info) => {
    Object.keys(obj).forEach(k => {
      const v = obj[k];
      const textKey = Array.isArray(obj) ? inText : SPELL_KEYS.has(k);
      if (typeof v === 'string') { if (textKey && v.trim()) out.push(Object.assign({ obj, key: k, html: k === 'html' }, info)); }
      else if (v && typeof v === 'object') walk(v, Array.isArray(obj) ? inText : k === 'rows' || (Array.isArray(v) && textKey), info);
    });
  };
  out.push({ obj: site, key: 'name', where: 'Website name' });
  out.push({ obj: site.header, key: 'logoText', where: 'Header' });
  (site.header.menuLinks || []).forEach(m => out.push({ obj: m, key: 'label', where: 'Header menu' }));
  out.push({ obj: site.footer, key: 'text', where: 'Footer' });
  site.pages.forEach(p => {
    ['name', 'title', 'description'].forEach(k => { if (p[k]) out.push({ obj: p, key: k, where: p.name + ' (page settings)', pageId: p.id }); });
    p.sections.forEach(s => s.columns.forEach(c => c.elements.forEach(el => {
      if (el.type !== 'html') walk(el.props, false, { where: p.name, pageId: p.id, elId: el.id });
    })));
  });
  return out.filter(s => typeof s.obj[s.key] === 'string' && s.obj[s.key].trim());
}
const WORD_RE = /[\p{L}](?:[\p{L}\p{M}'’]*[\p{L}\p{M}])?/gu;
const plainOf = (v, html) => html ? v.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ') : v;
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function wordRe(word) { return new RegExp('(?<![\\p{L}\\p{N}])' + escRe(word) + '(?![\\p{L}\\p{N}])', 'gu'); }
function findMistakes() {
  const ignore = new Set((site.settings.spellIgnore || []).map(w => w.toLowerCase()));
  const words = new Map();
  textSlots().forEach(slot => {
    const txt = plainOf(slot.obj[slot.key], slot.html);
    (txt.match(WORD_RE) || []).forEach(w => {
      if (w.length < 2 || /^[\p{Lu}]+$/u.test(w) || ignore.has(w.toLowerCase())) return;
      let e = words.get(w);
      if (!e) { e = { word: w, count: 0, slots: [] }; words.set(w, e); }
      e.count++;
      if (!e.slots.includes(slot)) e.slots.push(slot);
    });
  });
  const bad = [];
  words.forEach(e => { if (api.isMisspelled(e.word.replace(/’/g, '\''))) bad.push(e); });
  return bad.sort((a, b) => a.word.localeCompare(b.word));
}
function replaceWord(entry, repl) {
  const re = wordRe(entry.word);
  entry.slots.forEach(slot => {
    const v = slot.obj[slot.key];
    slot.obj[slot.key] = slot.html ? v.replace(/(<[^>]*>)|([^<]+)/g, (m, tag, txt) => tag || txt.replace(re, repl)) : v.replace(re, repl);
  });
}
async function checkSpelling() {
  if (!DESKTOP || !api.isMisspelled) {
    modal({ title: 'Check spelling', body: h('div', null,
      h('p', null, 'Your browser underlines spelling mistakes in red as you type on the page.'),
      h('p', null, 'Right-click an underlined word to see suggestions and fix it. If you see no underlines, turn on spell checking in your browser’s settings.'),
      h('p', { class: 'hint' }, 'The desktop app can check every page of your website at once.')), actions: [{ label: 'OK', primary: true }] });
    return;
  }
  let enabled = true;
  try { enabled = await api.spellEnabled(); } catch (e) { /* ignore */ }
  if (!enabled) { modal({ title: 'Check spelling', body: h('p', null, 'Spell checking is turned off. Turn on View › Underline Spelling Mistakes, then try again.'), actions: [{ label: 'OK', primary: true }] }); return; }
  const a = cdoc() && cdoc().activeElement; if (a && a.isContentEditable) a.blur();
  const body = h('div');
  const m = modal({ title: 'Check spelling', body, wide: true, actions: [{ label: 'Done', primary: true }] });
  const draw = () => {
    const list = findMistakes();
    body.innerHTML = '';
    if (!list.length) { body.appendChild(h('div', { class: 'all-good' }, icon('check'), h('p', null, 'No spelling mistakes found on any page.'))); return; }
    body.appendChild(h('p', { class: 'lead' }, list.length + ' word' + (list.length > 1 ? 's' : '') + ' to check. Names and special words may be fine — choose Ignore or Add to dictionary for those.'));
    const ul = h('ul', { class: 'spell-list' });
    list.slice(0, 80).forEach(e => {
      const sugg = (api.spellSuggestions(e.word) || []).slice(0, 8);
      const own = h('input', { type: 'text', class: 'inp', placeholder: 'Type the right spelling', 'aria-label': 'Right spelling for ' + e.word, hidden: sugg.length ? true : null });
      const pick = sugg.length ? selectCtl([...sugg.map(s => [s, s]), ['__own', 'Type my own…']], sugg[0], v => { own.hidden = v !== '__own'; if (!own.hidden) own.focus(); }) : null;
      if (pick) pick.setAttribute('aria-label', 'Suggestion for ' + e.word);
      const first = e.slots[0];
      ul.appendChild(h('li', null,
        h('div', { class: 'spell-word' }, h('b', null, e.word), h('span', { class: 'hint' }, (e.count > 1 ? e.count + ' times · ' : '') + e.slots.map(s => s.where).filter((w, i, arr) => arr.indexOf(w) === i).slice(0, 3).join(', '))),
        h('div', { class: 'spell-fix' }, pick, own),
        h('div', { class: 'btn-row' },
          h('button', { type: 'button', class: 'btn sm primary', onclick: () => {
            const v = (pick && pick.value !== '__own' ? pick.value : own.value).trim();
            if (!v) { own.hidden = false; own.focus(); return; }
            replaceWord(e, v); changed({ panel: true, pages: true }); draw();
          } }, 'Change all'),
          h('button', { type: 'button', class: 'btn sm', onclick: () => { site.settings.spellIgnore = [...(site.settings.spellIgnore || []), e.word]; changed({ render: false }); draw(); } }, 'Ignore'),
          h('button', { type: 'button', class: 'btn sm', onclick: async () => { try { await api.spellAddWord(e.word); } catch (err) { /* ignore */ } site.settings.spellIgnore = [...(site.settings.spellIgnore || []), e.word]; changed({ render: false }); draw(); } }, 'Add to dictionary'),
          first && first.pageId ? h('button', { type: 'button', class: 'linkish', onclick: () => { m.close(); setMode('edit'); if (pageId !== first.pageId) switchPage(first.pageId); if (first.elId) select({ kind: 'el', id: first.elId }, { scroll: true }); else select(null); } }, 'Show me') : null)));
    });
    body.appendChild(ul);
    if (list.length > 80) body.appendChild(h('p', { class: 'hint' }, 'Showing the first 80. Fix these, then check again.'));
  };
  draw();
}
function syncSpellLanguage() { if (DESKTOP && api.spellLanguage && site) api.spellLanguage(site.settings.language || 'en').catch(() => {}); }

/* ================================================================== */
/* Domain name and free HTTPS certificate                               */
/* ================================================================== */

const GH_A = ['185.199.108.153', '185.199.109.153', '185.199.110.153', '185.199.111.153'];
const GH_AAAA = ['2606:50c0:8000::153', '2606:50c0:8001::153', '2606:50c0:8002::153', '2606:50c0:8003::153'];
const NETLIFY_A = '75.2.60.5';
const TWO_PART_TLDS = /\.(co|org|me|ac|gov|net|ltd|plc|sch)\.(uk|nz|za|jp|in|kr|il)$|\.(com|net|org|edu|gov)\.(au|br|mx|ar|tr|sg|my|hk|cn|ng|pk)$/;
function domainParts(d) {
  const labels = d.split('.');
  const apexLen = TWO_PART_TLDS.test(d) ? 3 : 2;
  const apex = labels.slice(-apexLen).join('.');
  const sub = labels.slice(0, -apexLen).join('.');
  return { apex, sub, isWww: sub === 'www', isApex: !sub || sub === 'www' };
}
const HOSTS = [
  { v: 'github', label: 'GitHub Pages', note: 'Free. Your site lives in a GitHub repository.', idLabel: 'Your GitHub user name', idPh: 'your-name', target: id => (id || 'your-name') + '.github.io', guide: 'https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site' },
  { v: 'netlify', label: 'Netlify', note: 'Free plan. Drag your published folder onto app.netlify.com/drop.', idLabel: 'Your Netlify site name', idPh: 'my-site', target: id => (id || 'my-site') + '.netlify.app', guide: 'https://docs.netlify.com/domains-https/custom-domains/configure-external-dns/' },
  { v: 'cloudflare', label: 'Cloudflare Pages', note: 'Free. Upload your published folder in the Cloudflare dashboard.', idLabel: 'Your Pages project name', idPh: 'my-site', target: id => (id || 'my-site') + '.pages.dev', guide: 'https://developers.cloudflare.com/pages/configuration/custom-domains/' },
  { v: 'server', label: 'My own server or another host', note: 'A server you rent, or a hosting company’s control panel.', idLabel: 'Your server’s IP address', idPh: '203.0.113.10', target: id => id || '203.0.113.10' }
];
function copyBtn(text, label) {
  return h('button', { type: 'button', class: 'btn sm copy', title: 'Copy', onclick: () => {
    const done = () => toast('Copied ' + (label || text));
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => toast('Select the text and copy it yourself.')); else toast('Select the text and copy it yourself.');
  } }, icon('copy'), 'Copy');
}
function codeBlock(text) { return h('div', { class: 'code-copy' }, h('pre', null, text), copyBtn(text, 'to the clipboard')); }
function dnsRecords(st) {
  const host = HOSTS.find(x => x.v === st.host);
  const p = domainParts(st.domain);
  const rows = [];
  const target = host.target(st.hostId);
  const name = p.isApex ? '@' : p.sub;
  if (st.host === 'github') {
    if (p.isApex) { GH_A.forEach(ip => rows.push(['A', '@', ip])); GH_AAAA.forEach(ip => rows.push(['AAAA', '@', ip])); rows.push(['CNAME', 'www', target]); }
    else rows.push(['CNAME', name, target]);
  } else if (st.host === 'netlify') {
    if (p.isApex) { rows.push(['A', '@', NETLIFY_A]); rows.push(['CNAME', 'www', target]); }
    else rows.push(['CNAME', name, target]);
  } else if (st.host === 'cloudflare') {
    if (!p.isApex) rows.push(['CNAME', name, target]);
  } else {
    rows.push(['A', name, target]);
    if (p.isApex) rows.push(['CNAME', 'www', p.apex]);
  }
  return rows;
}
function domainWizard() {
  const st = { step: 1, domain: Gen.cleanDomain(site.settings.domain || ''), host: site.settings.host || '', hostId: site.settings.hostId || '' };
  const body = h('div', { class: 'wiz' });
  const m = modal({ title: 'Website address and free HTTPS', body, wide: true, cls: 'wiz-modal' });
  const nav = (back, next, nextLabel, nextDisabled) => h('div', { class: 'wiz-nav' },
    back ? h('button', { type: 'button', class: 'btn', onclick: back }, 'Back') : h('span'),
    h('button', { type: 'button', class: 'btn primary', disabled: nextDisabled || null, onclick: next }, nextLabel || 'Next'));
  const steps = ['Address', 'Host', 'DNS records', 'HTTPS'];
  const go = n => { st.step = n; draw(); };
  const draw = () => {
    body.innerHTML = '';
    body.appendChild(h('ol', { class: 'wiz-steps' }, steps.map((s, i) => h('li', { class: i + 1 === st.step ? 'cur' : i + 1 < st.step ? 'done' : null }, s))));
    const host = HOSTS.find(x => x.v === st.host);
    if (st.step === 1) {
      const err = h('p', { class: 'hint err', hidden: true }, 'Type a domain such as harbourlanebakery.co.uk');
      const inp = inputCtl(st.domain, v => { st.domain = v; }, { placeholder: 'www.yourname.com' });
      const next = () => { const d = Gen.cleanDomain(st.domain); if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(d)) { err.hidden = false; inp.focus(); return; } st.domain = d; go(2); };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') next(); });
      body.append(
        h('p', { class: 'lead' }, 'A domain name is your website’s address, like harbourlanebakery.co.uk. You rent it for about £5–£15 a year from a domain company (a “registrar”) such as Cloudflare, Porkbun, Namecheap, IONOS or 123-reg.'),
        field('Your domain name', inp, 'Already have one? Type it here. Include www. if you want visitors to see it.'), err,
        h('p', { class: 'hint' }, 'Pocket-Web-Studio uses it for your sitemap, search engine links and social media previews, and for the CNAME file GitHub Pages needs.'),
        nav(null, next));
      setTimeout(() => inp.focus(), 30);
    } else if (st.step === 2) {
      const grid = h('div', { class: 'host-grid', role: 'radiogroup', 'aria-label': 'Web host' });
      HOSTS.forEach(x => grid.appendChild(h('button', { type: 'button', role: 'radio', class: 'host-card', 'aria-checked': String(st.host === x.v), onclick: () => { st.host = x.v; draw(); } }, h('b', null, x.label), h('span', null, x.note))));
      body.append(h('p', { class: 'lead' }, 'Where will you upload your published website?'), grid,
        host ? field(host.idLabel, inputCtl(st.hostId, v => { st.hostId = v.trim(); }, { placeholder: host.idPh }), st.host === 'server' ? 'Your hosting company shows this in its control panel.' : 'Used to fill in the records on the next step.') : null,
        nav(() => go(1), () => go(3), 'Next', !host));
    } else if (st.step === 3) {
      const p = domainParts(st.domain);
      const rows = dnsRecords(st);
      const table = rows.length ? h('table', { class: 'dns' }, h('thead', null, h('tr', null, h('th', null, 'Type'), h('th', null, 'Name / Host'), h('th', null, 'Value / Points to'), h('th', null, h('span', { class: 'sr' }, 'Copy')))),
        h('tbody', null, rows.map(r => h('tr', null, h('td', null, r[0]), h('td', null, h('code', null, r[1])), h('td', null, h('code', null, r[2])), h('td', null, copyBtn(r[2], r[2])))))) : null;
      const where = {
        github: ['In your repository on GitHub, open Settings › Pages.', 'Under “Custom domain”, type ' + st.domain + ' and press Save.', 'Pocket-Web-Studio puts a CNAME file in your published folder, so the address stays set each time you upload.'],
        netlify: ['In Netlify, open your site › Domain management › Add a domain.', 'Type ' + st.domain + ' and follow the steps.', 'Your domain company may support an ALIAS record instead of the A record — if so, point it at apex-loadbalancer.netlify.com.'],
        cloudflare: p.isApex
          ? ['For a main domain like ' + p.apex + ', Cloudflare must run its DNS. Add the domain to your Cloudflare account and change its nameservers at your domain company to the two Cloudflare gives you.', 'Then open your Pages project › Custom domains › Set up a custom domain, and type ' + st.domain + '. Cloudflare adds the record for you.']
          : ['First open your Pages project › Custom domains › Set up a custom domain and type ' + st.domain + '.', 'Then add the record below at your domain company. (Adding it before this step can show a 522 error.)'],
        server: ['These records send visitors to your server.', 'If your host gave you nameservers instead, set those at your domain company and add the domain in the host’s control panel.']
      }[st.host];
      body.append(
        h('p', { class: 'lead' }, 'Log in where you bought ' + p.apex + ', open its DNS settings and add these records. Delete any old A or AAAA records for the same name first (often a “parked” page).'),
        table, h('ol', { class: 'steps' }, where.map(t => h('li', null, t))),
        h('p', { class: 'hint' }, 'DNS changes usually work within an hour but can take up to 48 hours.'),
        host.guide ? h('p', { class: 'hint' }, h('a', { href: host.guide, target: '_blank', rel: 'noopener' }, 'Read ' + host.label + '’s own guide')) : null,
        DESKTOP && api.checkDomain ? domainChecker(st) : null,
        nav(() => go(2), () => go(4)));
    } else {
      const p = domainParts(st.domain);
      const names = p.isApex ? p.apex + ', www.' + p.apex : st.domain;
      const dflags = (p.isApex ? ['-d ' + p.apex, '-d www.' + p.apex] : ['-d ' + st.domain]).join(' ');
      const certs = {
        github: [h('p', null, 'GitHub gets a free certificate from Let’s Encrypt for you once your DNS records work.'),
          h('ol', { class: 'steps' }, h('li', null, 'Open Settings › Pages in your repository.'), h('li', null, 'Tick “Enforce HTTPS”. If it is greyed out, wait — it can take up to 24 hours after DNS is set up.'))],
        netlify: [h('p', null, 'Netlify gets and renews a free Let’s Encrypt certificate for you automatically.'),
          h('ol', { class: 'steps' }, h('li', null, 'Open Domain management › HTTPS.'), h('li', null, 'If it says it is waiting on DNS, press “Verify DNS configuration”, then “Provision certificate”.'))],
        cloudflare: [h('p', null, 'Cloudflare issues and renews the certificate for your custom domain automatically — there is nothing to install.'),
          h('p', { class: 'hint' }, 'If it stays “pending”, check your domain has no CAA records that block Cloudflare.')],
        server: [
          h('h3', { class: 'issue-title' }, 'Easiest: Caddy web server'),
          h('p', null, 'Caddy gets and renews free certificates by itself. Put your published folder at /var/www/' + p.apex + ' and use this Caddyfile:'),
          codeBlock(names + ' {\n    root * /var/www/' + p.apex + '\n    file_server\n    encode gzip\n}'),
          h('p', { class: 'hint' }, 'Ports 80 and 443 must be open, and your DNS records must already point at the server.'),
          h('h3', { class: 'issue-title' }, 'Already using nginx or Apache: Certbot'),
          h('p', null, 'Certbot gets free certificates from Let’s Encrypt and sets up renewals. On Ubuntu or Debian with nginx:'),
          codeBlock('sudo apt install certbot python3-certbot-nginx\nsudo certbot --nginx ' + dflags),
          h('p', null, 'With Apache, use python3-certbot-apache and --apache instead. Test renewals with:'),
          codeBlock('sudo certbot renew --dry-run'),
          h('h3', { class: 'issue-title' }, 'Hosting company with a control panel'),
          h('p', null, 'Look for “SSL/TLS”, “AutoSSL” or “Let’s Encrypt” in cPanel, Plesk or your host’s dashboard and switch it on for ' + st.domain + '. Most hosts include it free.'),
          h('p', { class: 'hint' }, h('a', { href: 'https://caddyserver.com/docs/automatic-https', target: '_blank', rel: 'noopener' }, 'Caddy guide'), ' · ', h('a', { href: 'https://certbot.eff.org/instructions', target: '_blank', rel: 'noopener' }, 'Certbot instructions'))]
      }[st.host];
      body.append(h('p', { class: 'lead' }, 'HTTPS shows the padlock in the address bar and keeps visitors safe. It is free.'), ...certs,
        nav(() => go(3), () => {
          site.settings.domain = st.domain; site.settings.host = st.host; site.settings.hostId = st.hostId;
          changed({ render: false, design: true });
          m.close();
          toast('Saved. Publish your website again to add the sitemap' + (st.host === 'github' ? ' and CNAME file.' : '.'));
        }, 'Save and finish'));
    }
  };
  draw();
}
function domainChecker(st) {
  const out = h('div', { class: 'dns-result', 'aria-live': 'polite' });
  const run = async () => {
    out.innerHTML = '';
    out.appendChild(h('p', { class: 'hint' }, 'Checking…'));
    let r;
    try { r = await api.checkDomain(st.domain); } catch (err) { out.innerHTML = ''; out.appendChild(h('p', { class: 'hint err' }, err.message)); return; }
    const want = dnsRecords(st);
    const p = domainParts(st.domain);
    const lines = [];
    const ok = (good, text) => lines.push(h('li', null, icon(good ? 'check' : 'warn', good ? 'ok' : 'warn'), h('span', null, text)));
    const wantA = want.filter(x => x[0] === 'A').map(x => x[2]);
    if (wantA.length) {
      const got = r.a || [];
      ok(wantA.some(ip => got.includes(ip)), r.apex + ' points to ' + (got.length ? got.join(', ') : 'nothing yet') + (wantA.some(ip => got.includes(ip)) ? '' : ' — expected ' + wantA.join(', ')));
    }
    const wantC = want.find(x => x[0] === 'CNAME');
    if (wantC) {
      const isWww = wantC[1] === 'www';
      const got = isWww ? (r.wwwCname || []) : (r.cname || []);
      const good = got.some(c => c.toLowerCase().replace(/\.$/, '') === wantC[2].toLowerCase());
      const label = isWww ? r.www : st.domain;
      ok(good || (isWww && (r.wwwA || []).some(ip => wantA.includes(ip))), label + ' ' + (got.length ? 'points to ' + got.join(', ') : (isWww && (r.wwwA || []).length ? 'points to ' + r.wwwA.join(', ') : 'has no record yet')) + (good ? '' : ' — expected ' + wantC[2]));
    }
    if (st.host === 'cloudflare' && p.isApex) ok((r.a || []).length > 0, r.apex + (r.a && r.a.length ? ' is answering (' + r.a.join(', ') + ')' : ' is not answering yet'));
    out.innerHTML = '';
    out.appendChild(h('ul', { class: 'issues' }, lines));
    out.appendChild(h('p', { class: 'hint' }, 'Just changed them? Records can take a while to update. Check again later.'));
  };
  return h('div', { class: 'dns-check' }, h('button', { type: 'button', class: 'btn sm', onclick: run }, icon('globe'), 'Check my domain'), out);
}

async function previewInBrowser() {
  if (!DESKTOP) { setMode('preview'); return; }
  try { await api.previewInBrowser(exportFiles(), Gen.pageFiles(site)[curPage().id]); } catch (err) { toast(err.message); }
}

/* ---------- browser drafts (for the web version) ---------- */
const DRAFT_KEY = 'pocket-draft-v2';
let draftT, draftWarned = false;
function scheduleDraft() { if (DESKTOP) return; clearTimeout(draftT); draftT = setTimeout(saveDraftNow, 800); }
function b64(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
function unb64(str) { const bin = atob(str); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
function saveDraftNow() {
  if (DESKTOP || !site) return;
  const a = packAssets();
  const payload = { site, name: projectName, assets: {} };
  Object.keys(a).forEach(n => { if (!/^placeholder-/.test(n)) payload.assets[n] = { mime: a[n].mime, w: a[n].w, h: a[n].h, data: b64(a[n].bytes) }; });
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(payload)); }
  catch (e) {
    try { payload.assets = {}; localStorage.setItem(DRAFT_KEY, JSON.stringify(payload)); } catch (e2) { /* ignore */ }
    if (!draftWarned) { draftWarned = true; toast('Your pictures are too large to keep in this browser. The desktop app saves everything.'); }
  }
}
function loadDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (!d || !d.site) return false;
    const map = {};
    Object.keys(d.assets || {}).forEach(n => { const a = d.assets[n]; map[n] = { mime: a.mime, w: a.w, h: a.h, bytes: unb64(a.data) }; });
    loadSite(d.site, map, null, d.name);
    return true;
  } catch (e) { return false; }
}

/* ================================================================== */
/* Keyboard and menu commands                                          */
/* ================================================================== */

function isTyping(e) {
  const t = e && e.target;
  return !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
}
function handleShortcut(e, typing) {
  if (DESKTOP) return;
  const mod = e.ctrlKey || e.metaKey;
  if (!mod) return;
  const k = e.key.toLowerCase();
  if (k === 's') { e.preventDefault(); saveProject(false); }
  else if (k === 'z' && !typing) { e.preventDefault(); undoRedo(e.shiftKey ? 1 : -1); }
  else if (k === 'y' && !typing) { e.preventDefault(); undoRedo(1); }
  else if (k === 'd' && !typing) { e.preventDefault(); duplicateSel(); }
}
document.addEventListener('keydown', e => {
  const typing = isTyping(e);
  if (!typing && $('#modalRoot').children.length === 0 && mode === 'edit') {
    if ((e.key === 'Delete' || e.key === 'Backspace') && sel && (sel.kind === 'el' || sel.kind === 'section')) { e.preventDefault(); deleteSel(); return; }
    if (e.key === 'Escape' && sel) { select(null); return; }
  }
  handleShortcut(e, typing);
});

function activeTypingTarget() {
  const a = document.activeElement;
  if (a && (/^(INPUT|TEXTAREA)$/.test(a.tagName))) return document;
  if (a === canvasFrame() && editingNode()) return cdoc();
  return null;
}
const COMMANDS = {
  'new-site': () => confirmDiscard(() => templateChooser({ onPick: newSite })),
  'open': () => confirmDiscard(() => openProject()),
  'import': () => confirmDiscard(() => importWebsite()),
  'save': () => saveProject(false),
  'save-as': () => saveProject(true),
  'publish': publish,
  'preview-browser': previewInBrowser,
  'undo': () => { const d = activeTypingTarget(); if (d) d.execCommand('undo'); else undoRedo(-1); },
  'redo': () => { const d = activeTypingTarget(); if (d) d.execCommand('redo'); else undoRedo(1); },
  'duplicate': () => { if (!activeTypingTarget()) duplicateSel(); },
  'view-edit': () => setMode('edit'),
  'view-preview': () => setMode('preview'),
  'view-code': () => setMode('code'),
  'dev-desktop': () => setDevice('desktop'),
  'dev-tablet': () => setDevice('tablet'),
  'dev-phone': () => setDevice('phone'),
  'add-page': addPage,
  'about': () => showAbout(false),
  'licence': () => showAbout(true),
  'spelling': checkSpelling,
  'domain': domainWizard,
  'save-all-and-close': async () => { if (await saveProject(false)) api.closeNow(); }
};

async function showAbout(licence) {
  let text = '';
  try { text = DESKTOP ? await api.licence() : (document.getElementById('licenceText') || {}).textContent || ''; } catch (e) { text = 'The licence file could not be read.'; }
  modal({
    title: licence ? 'Licence' : 'Pocket-Web-Studio', wide: true,
    body: h('div', null, h('img', { class: 'about-logo', src: LOGO_SRC, alt: 'Pocket-Web-Studio logo', width: '150', height: '150' }), h('p', { class: 'hint' }, 'Version ' + appVersion + ' · MIT licence · Builds websites with HTML5, CSS and JavaScript.'), h('p', { class: 'hint' }, 'Made by Pocket-Designs · pocket-designs@proton.me'), h('pre', { class: 'licence' }, text)),
    actions: [{ label: 'Close', primary: true }]
  });
}

function setDevice(d) {
  device = d;
  $('#frameWrap').dataset.device = d;
  $$('[data-dev]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.dev === d)));
  setTimeout(applySelection, 320);
}

/* ================================================================== */
/* Boot                                                                */
/* ================================================================== */

function renderAll() {
  renderPagesTab();
  if (leftTab === 'design') renderDesignTab();
  renderCanvas();
  renderPanel();
  updateTitle();
  if (mode === 'code') renderCodeView();
  if (mode === 'preview') showPreview(curPage());
}

function wireTopbar() {
  $('#newBtn').addEventListener('click', COMMANDS['new-site']);
  $('#importBtn').addEventListener('click', COMMANDS.import);
  if (DESKTOP) {
    $('#openBtn').addEventListener('click', COMMANDS.open);
    $('#saveBtn').addEventListener('click', COMMANDS.save);
    $('#browserBtn').addEventListener('click', previewInBrowser);
  } else {
    ['#openBtn', '#saveBtn', '#browserBtn'].forEach(s => { const b = $(s); if (b) b.hidden = true; });
    $('#webNote').hidden = false;
  }
  $('#undoBtn').addEventListener('click', () => undoRedo(-1));
  $('#redoBtn').addEventListener('click', () => undoRedo(1));
  $('#publishBtn').addEventListener('click', publish);
  $$('[data-mode-btn]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.modeBtn)));
  $$('[data-dev]').forEach(b => b.addEventListener('click', () => setDevice(b.dataset.dev)));
  $$('.ltab').forEach(b => b.addEventListener('click', () => setLeftTab(b.dataset.tab)));
  $('#copyCode').addEventListener('click', () => {
    const out = Gen.generateSite(site, { assetInfo });
    const text = out.files[codeFile];
    navigator.clipboard.writeText(text).then(() => toast('Copied ' + codeFile), () => {
      const r = document.createRange(); r.selectNodeContents($('#codeBody'));
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      toast('Press Ctrl+C to copy the selected code.');
    });
  });
  document.addEventListener('dragend', endDrag);
  // stop files dropped on the editor from opening in the window
  ['dragover', 'drop'].forEach(ev => document.addEventListener(ev, e => { if (!e.target.closest || !e.target.closest('.drop-zone')) e.preventDefault(); }));
}

window.__weaver = {
  get site() { return site; }, get sel() { return sel; }, assets, importWebsite, importFiles: async list => { const r = await window.EzyImporter.importSite(list, { Gen, T, ctx, sanitizeRich, importImageBytes: (n, m, b) => importImageFile(new File([b], n, { type: m })), importVideoBytes: (n, m, b) => importVideoFile(new File([b], n, { type: m })), importRawBytes }); loadSite(r.site, Object.fromEntries(Object.keys(assets).map(n => [n, assets[n]])), null, r.site.name); return r.report; },
  addElement, addSectionTemplate, select, applyDrop, newSite, setMode, setDevice, setLeftTab, undoRedo, exportFiles, renderCanvas, findElement, computeTarget, sanitizeRich, publish
};

async function boot() {
  $$('[data-icon]').forEach(sp => { sp.innerHTML = ICON[sp.dataset.icon] || ''; });
  wireTopbar();
  renderAddTab();
  setLeftTab('add');
  setDevice('desktop');
  setMode('edit');
  initCanvas();
  if (DESKTOP) {
    api.onMenu(cmd => { const fn = COMMANDS[cmd]; if (fn) fn(); });
    api.onOpenFile(path => confirmDiscard(() => openProject(path)));
    let info = {};
    try { info = await api.init(); } catch (e) { /* ignore */ }
    appVersion = info.version || appVersion;
    if (info.openPath) {
      try { const r = await api.openProject(info.openPath); if (r) { loadSite(r.site, r.assets, r.path, r.name); return; } } catch (e) { toast(e.message); }
    }
    newSite('business');
    setDirty(false);
    templateChooser({ onPick: kind => newSite(kind), title: 'Welcome to Pocket-Web-Studio' });
  } else {
    if (!loadDraft()) {
      newSite('business');
      templateChooser({ onPick: kind => newSite(kind), title: 'Welcome to Pocket-Web-Studio' });
    }
  }
}
boot();
})();
