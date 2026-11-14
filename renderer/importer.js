// Pocket-Web-Studio — imports an existing website (HTML, CSS, pictures) into editable Pocket-Web-Studio pages.
// Each page is rendered off screen with its own stylesheets so the importer can see the real
// layout: which blocks are sections, which sit side by side as columns, and what colours and
// fonts the site uses. Content becomes Pocket-Web-Studio elements; anything Pocket-Web-Studio has no element for is kept
// as "Own code" so nothing is lost.
// Copyright (c) 2026 Pocket-Designs. MIT licence, see LICENSE.
(function (root) {
'use strict';

const HTML_RE = /\.html?$/i;
const CSS_RE = /\.css$/i;
const IMG_RE = /\.(png|jpe?g|gif|webp|svg|avif|bmp|ico)$/i;
const VID_RE = /\.(mp4|webm|ogv)$/i;
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', bmp: 'image/bmp', ico: 'image/x-icon', mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', css: 'text/css', html: 'text/html', htm: 'text/html' };
const mimeOf = p => MIME[(p.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
const isExternal = h => /^([a-z][\w+.-]*:|\/\/)/i.test(h);

function normPath(p) {
  const out = [];
  String(p).replace(/\\/g, '/').split('/').forEach(seg => {
    if (!seg || seg === '.') return;
    if (seg === '..') out.pop(); else out.push(seg);
  });
  return out.join('/');
}
const dirOf = p => (p.includes('/') ? p.slice(0, p.lastIndexOf('/') + 1) : '');
function resolvePath(from, href) {
  if (!href) return null;
  let h = String(href).trim();
  if (!h || isExternal(h) || h.startsWith('#')) return null;
  h = h.split('#')[0].split('?')[0];
  try { h = decodeURIComponent(h); } catch (e) { /* keep */ }
  if (!h) return null;
  return normPath(h.startsWith('/') ? h : dirOf(from) + h);
}

function rgbToHex(c) {
  const m = String(c || '').match(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?/);
  if (!m) return null;
  if (m[4] !== undefined && parseFloat(m[4]) < 0.5) return null;
  return '#' + [m[1], m[2], m[3]].map(x => (+x).toString(16).padStart(2, '0')).join('');
}
function saturation(hex) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mx === 0 ? 0 : (mx - mn) / mx;
}
const textLen = el => (el.textContent || '').replace(/\s+/g, ' ').trim().length;

async function importSite(fileList, H) {
  const Gen = H.Gen, T = H.T, ctx = H.ctx;
  const report = { pages: 0, pictures: 0, ownCode: 0, scripts: 0, missing: new Set(), remote: 0, notes: [] };

  /* ---------- files ---------- */
  let entries = fileList.map(f => ({ path: normPath(f.path), bytes: f.bytes })).filter(f => f.path);
  const tops = new Set(entries.map(e => e.path.split('/')[0]));
  if (tops.size === 1 && entries.every(e => e.path.includes('/')) && !entries.some(e => HTML_RE.test(e.path) && !e.path.includes('/'))) {
    const top = [...tops][0] + '/';
    if (!entries.some(e => e.path === 'index.html')) entries = entries.map(e => ({ path: e.path.slice(top.length), bytes: e.bytes }));
  }
  const files = new Map(entries.map(e => [e.path, e.bytes]));
  const decoder = new TextDecoder();
  const text = p => decoder.decode(files.get(p));
  let pagePaths = [...files.keys()].filter(p => HTML_RE.test(p) && !/(^|\/)(node_modules|\.git)\//.test(p));
  if (!pagePaths.length) throw new Error('No web pages (.html files) were found. Choose the folder that contains your site’s index.html.');
  if (pagePaths.length > 60) { report.notes.push('Only the first 60 pages were imported.'); pagePaths = pagePaths.slice(0, 60); }
  const home = pagePaths.find(p => /^index\.html?$/i.test(p)) || pagePaths.find(p => /(^|\/)index\.html?$/i.test(p)) || pagePaths.slice().sort((a, b) => a.split('/').length - b.split('/').length)[0];

  /* ---------- blob URLs so pages render with their own pictures and fonts ---------- */
  const blobs = new Map(), blobToPath = new Map();
  function blobFor(path) {
    if (!files.has(path)) return null;
    if (!blobs.has(path)) {
      const u = URL.createObjectURL(new Blob([files.get(path)], { type: mimeOf(path) }));
      blobs.set(path, u); blobToPath.set(u, path);
    }
    return blobs.get(path);
  }
  function rewriteCssUrls(css, base, seen) {
    seen = seen || new Set();
    css = css.replace(/@import\s+(?:url\()?\s*['"]?([^'")\s;]+)['"]?\s*\)?[^;]*;/gi, (m, href) => {
      const p = resolvePath(base, href);
      if (p && CSS_RE.test(p) && files.has(p) && !seen.has(p)) { seen.add(p); return rewriteCssUrls(text(p), p, seen); }
      return isExternal(href) ? m : '';
    });
    return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, q, href) => {
      if (/^(data:|blob:|#)/i.test(href) || isExternal(href)) return m;
      const p = resolvePath(base, href);
      const u = p && blobFor(p);
      if (!u && p) report.missing.add(p);
      return u ? 'url("' + u + '")' : m;
    });
  }

  /* ---------- pictures and videos become Pocket-Web-Studio assets ---------- */
  const assetCache = new Map();
  async function assetFromPath(path) {
    if (!path) return null;
    if (assetCache.has(path)) return assetCache.get(path);
    let name = null;
    if (files.has(path)) {
      try {
        if (IMG_RE.test(path) && !/\.ico$/i.test(path)) { name = await H.importImageBytes(path.split('/').pop(), mimeOf(path), files.get(path)); report.pictures++; }
        else if (/\.ico$/i.test(path)) name = await H.importRawBytes(path.split('/').pop(), 'image/x-icon', files.get(path));
        else if (VID_RE.test(path)) name = await H.importVideoBytes(path.split('/').pop(), mimeOf(path), files.get(path));
      } catch (e) { report.notes.push(e.message); }
    } else report.missing.add(path);
    assetCache.set(path, name);
    return name;
  }
  async function assetFromUrl(url, pagePath) {
    if (!url) return null;
    if (blobToPath.has(url)) return assetFromPath(blobToPath.get(url));
    if (/^https?:\/\//i.test(url)) { report.remote++; return url; }
    if (/^data:image\//i.test(url)) return null;
    return assetFromPath(resolvePath(pagePath, url));
  }

  /* ---------- off-screen rendering ---------- */
  const frame = document.createElement('iframe');
  frame.setAttribute('sandbox', 'allow-same-origin');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  Object.assign(frame.style, { position: 'fixed', left: '-20000px', top: '0', width: '1280px', height: '900px', border: '0', opacity: '0', pointerEvents: 'none' });
  document.body.appendChild(frame);

  function prepare(path) {
    const doc = new DOMParser().parseFromString(text(path), 'text/html');
    const original = new DOMParser().parseFromString(text(path), 'text/html');
    report.scripts += doc.querySelectorAll('script[src], script:not([type]), script[type="text/javascript"], script[type="module"]').length;
    doc.querySelectorAll('script, noscript, base, meta[http-equiv]').forEach(n => n.remove());
    doc.querySelectorAll('link[rel~="stylesheet"]').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (isExternal(href)) return;
      const p = resolvePath(path, href);
      const st = doc.createElement('style');
      if (p && files.has(p)) st.textContent = rewriteCssUrls(text(p), p);
      else if (p) report.missing.add(p);
      link.replaceWith(st);
    });
    doc.querySelectorAll('style').forEach(st => { st.textContent = rewriteCssUrls(st.textContent, path); });
    doc.querySelectorAll('[style]').forEach(el => el.setAttribute('style', rewriteCssUrls(el.getAttribute('style'), path)));
    doc.querySelectorAll('img[src], source[src], video[src], video[poster], input[type="image"]').forEach(el => {
      ['src', 'poster'].forEach(attr => {
        const v = el.getAttribute(attr);
        if (!v || /^(data:|blob:)/.test(v) || isExternal(v)) return;
        const p = resolvePath(path, v), u = p && blobFor(p);
        if (u) el.setAttribute(attr, u); else if (p) report.missing.add(p);
      });
    });
    doc.querySelectorAll('img[srcset], source[srcset]').forEach(el => {
      const first = (el.getAttribute('srcset') || '').split(',')[0].trim().split(/\s+/)[0];
      if (el.tagName === 'IMG' && first && !el.getAttribute('src')) {
        const p = resolvePath(path, first), u = p && blobFor(p);
        if (u) el.setAttribute('src', u);
      }
      el.removeAttribute('srcset');
    });
    doc.querySelectorAll('img[loading]').forEach(el => el.removeAttribute('loading'));
    doc.querySelectorAll('iframe[src]').forEach(el => { el.setAttribute('data-ezy-src', el.getAttribute('src')); el.removeAttribute('src'); });
    return { html: '<!DOCTYPE html>' + doc.documentElement.outerHTML, original };
  }
  function render(html) {
    return new Promise(resolve => {
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(frame.contentDocument); } };
      frame.onload = () => setTimeout(finish, 150);
      setTimeout(finish, 5000);
      frame.srcdoc = html;
    });
  }

  /* ---------- analysis helpers ---------- */
  let win, doc;
  const cs = el => win.getComputedStyle(el);
  const visible = el => {
    if (!el || el.nodeType !== 1) return false;
    const s = cs(el);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) === 0) return false;
    if (el.getAttribute('aria-hidden') === 'true' && !el.querySelector('img')) return false;
    const r = el.getBoundingClientRect();
    if (r.width > 1 && r.height > 1) return true;
    // a box can measure zero when it only holds floated children
    return Array.from(el.children).some(c => { const rr = c.getBoundingClientRect(); return rr.width > 1 && rr.height > 1; });
  };
  const kids = el => Array.from(el.children).filter(c => !/^(SCRIPT|STYLE|LINK|META|TEMPLATE|BR)$/.test(c.tagName) && visible(c) && cs(c).position !== 'absolute' && cs(c).position !== 'fixed');
  const BLOCKY = /^(DIV|SECTION|ARTICLE|ASIDE|MAIN|HEADER|FOOTER|NAV|FIGURE|UL|OL|LI|FORM|DL|BLOCKQUOTE|TABLE|P|H[1-6]|DETAILS|PICTURE)$/;
  const CONTAINER = /^(DIV|SECTION|ARTICLE|ASIDE|MAIN|HEADER|SPAN|CENTER|HGROUP|FIGURE|A|LI|UL|OL)$/;
  function bgOf(el) {
    const s = cs(el);
    const color = rgbToHex(s.backgroundColor);
    let image = null;
    const m = s.backgroundImage && s.backgroundImage.match(/url\("?([^")]+)"?\)/);
    if (m) image = m[1];
    return { color, image };
  }
  function unwrap(el) {
    let node = el;
    for (let i = 0; i < 8; i++) {
      const k = kids(node);
      const directText = Array.from(node.childNodes).some(n => n.nodeType === 3 && n.nodeValue.trim());
      if (k.length === 1 && !directText && CONTAINER.test(k[0].tagName) && k[0].tagName !== 'A' && k[0].tagName !== 'UL' && k[0].tagName !== 'OL') node = k[0];
      else break;
    }
    return node;
  }
  function rowInfo(el) {
    const k = kids(el);
    if (k.length < 2) return null;
    const rects = k.map(c => c.getBoundingClientRect());
    const r0 = rects[0];
    const first = [];
    for (let i = 0; i < k.length; i++) {
      const r = rects[i];
      const overlap = Math.min(r.bottom, r0.bottom) - Math.max(r.top, r0.top);
      if (overlap > Math.min(r.height, r0.height) * 0.3 || Math.abs(r.top - r0.top) < 24) first.push(i);
    }
    if (first.length < 2 || first.length > 4) return null;
    for (let i = 1; i < first.length; i++) if (rects[first[i]].left <= rects[first[i - 1]].left + 5) return null;
    const w = el.getBoundingClientRect().width;
    if (first.some(i => rects[i].width < w * 0.12)) return null;
    // every child must belong to a grid of this many columns
    const n = first.length;
    const widths = first.map(i => rects[i].width);
    let layout = n === 2 ? '1-1' : n === 3 ? '1-1-1' : '1-1-1-1';
    if (n === 2) { const r = widths[0] / widths[1]; if (r < 0.7) layout = '1-2'; else if (r > 1.45) layout = '2-1'; }
    const cols = Array.from({ length: n }, () => []);
    k.forEach((c, i) => {
      const r = rects[i];
      let best = 0, bd = Infinity;
      first.forEach((fi, ci) => { const d = Math.abs((rects[fi].left + rects[fi].width / 2) - (r.left + r.width / 2)); if (d < bd) { bd = d; best = ci; } });
      cols[best].push(c);
    });
    return { n, layout, cols, el };
  }
  function isGallery(el) {
    const imgs = Array.from(el.querySelectorAll('img')).filter(visible);
    if (imgs.length < 3) return false;
    if (el.querySelector('h1,h2,h3,h4,h5,h6,form,table,iframe,video')) return false;
    let txt = 0;
    el.querySelectorAll('figcaption').forEach(f => { txt -= textLen(f); });
    txt += textLen(el);
    if (txt > imgs.length * 40) return false;
    const tops = new Set(imgs.map(i => Math.round(i.getBoundingClientRect().top / 20)));
    return tops.size < imgs.length; // more than one picture per row
  }
  function looksLikeButton(a) {
    if (a.closest('nav')) return false;
    const cls = (a.className && typeof a.className === 'string' ? a.className : '') + ' ' + (a.getAttribute('role') || '');
    const t = textLen(a);
    if (!t || t > 50 || a.querySelector('img, h1, h2, h3, p, div')) return false;
    if (/\b(btn|button|cta)\b/i.test(cls)) return true;
    const s = cs(a);
    const bg = rgbToHex(s.backgroundColor);
    const border = parseFloat(s.borderTopWidth) >= 1 && rgbToHex(s.borderTopColor);
    return (bg || border) && parseFloat(s.paddingLeft) >= 8 && /inline-block|block|flex|inline-flex|grid/.test(s.display);
  }
  function alignOf(el) {
    const a = cs(el).textAlign;
    return a === 'center' ? 'center' : (a === 'right' || a === 'end') ? 'right' : '';
  }

  /* ---------- page conversion ---------- */
  function contentRoot() {
    return doc.querySelector('main') || doc.querySelector('[role="main"]') || doc.body;
  }
  function isChrome(el) {
    if (el.closest('main, [role="main"]') && el.tagName !== 'MAIN') return false;
    if (/^(HEADER|NAV|FOOTER)$/.test(el.tagName)) return true;
    if (/^(banner|navigation|contentinfo)$/.test(el.getAttribute('role') || '')) return true;
    const id = ((el.id || '') + ' ' + (typeof el.className === 'string' ? el.className : '')).toLowerCase();
    const h = el.getBoundingClientRect().height;
    if (/(^|[\s_-])(site-?)?(header|navbar|nav|navigation|topbar|masthead|menu|menubar|menu-bar|mainmenu|footer|foot|site-?footer|copyright)($|[\s_-])/.test(id) && h < 260) return true;
    const links = Array.from(el.querySelectorAll('a')).reduce((n, a) => n + textLen(a), 0), all = textLen(el);
    return h < 90 && el.querySelectorAll('a').length >= 2 && all > 0 && links / all > 0.85 && !el.querySelector('h1,h2,h3,img');
  }
  function splitSections(el, depth) {
    const node = unwrap(el);
    if (depth > 4) return [{ outer: el, node }];
    const k = kids(node).filter(c => !isChrome(c));
    const sectionTags = k.filter(c => /^(SECTION|ARTICLE|MAIN)$/.test(c.tagName) || c.getAttribute('role') === 'region');
    const nw = node.getBoundingClientRect().width;
    const stacked = k.filter(c => { const r = c.getBoundingClientRect(); return r.height >= 120 && r.width >= nw * 0.8; });
    const hasBgKids = k.filter(c => { const b = bgOf(c); return b.image || (b.color && b.color !== bgOf(node).color); });
    if (k.length >= 2 && (sectionTags.length >= 2 || (stacked.length >= 2 && stacked.length >= k.length - 1) || hasBgKids.length >= 2) && !rowInfo(node)) {
      return k.flatMap(c => splitSections(c, depth + 1));
    }
    return [{ outer: el, node }];
  }

  async function convertPage(path, pageObj) {
    const sections = [];
    const rootEl = contentRoot();
    const bodyBg = bgOf(doc.body).color || '#ffffff';
    let pieces = [];
    if (rootEl === doc.body) {
      kids(doc.body).filter(c => !isChrome(c)).forEach(c => { pieces.push(...splitSections(c, 0)); });
    } else pieces = splitSections(rootEl, 0);

    for (const piece of pieces) {
      // background and spacing from the outer block and its single-child wrappers
      let bg = { color: null, image: null };
      let walker = piece.outer;
      for (let i = 0; i < 6 && walker; i++) {
        const b = bgOf(walker);
        if (!bg.image && b.image) bg.image = b.image;
        if (!bg.color && b.color && b.color !== bodyBg) bg.color = b.color;
        if (walker === piece.node) break;
        const k = kids(walker); walker = k.length === 1 ? k[0] : null;
      }
      const s = cs(piece.outer);
      const padTop = parseFloat(s.paddingTop) + parseFloat(cs(piece.node).paddingTop);
      const padding = padTop < 12 ? 'sm' : padTop < 50 ? 'md' : padTop < 100 ? 'lg' : 'xl';
      const height = piece.outer.getBoundingClientRect().height;
      const base = {
        padding, bg: bg.color || '',
        bgImage: bg.image ? await assetFromUrl(bg.image, path) : null,
        overlay: bg.image ? 35 : 40,
        height: bg.image && height >= 620 ? 'full' : bg.image && height >= 380 ? 'half' : 'auto',
        width: piece.outer.getBoundingClientRect().width >= 1270 && bg.image ? 'full' : 'contained',
        anchor: piece.outer.id || ''
      };
      // split the block into runs of plain content and rows of columns
      const runs = [];
      let current = [];
      const pushRun = () => { if (current.length) { runs.push({ kind: 'one', nodes: current }); current = []; } };
      const handle = node => {
        if (isChrome(node)) return;
        const u = unwrap(node);
        const row = !isGallery(u) && rowInfo(u);
        if (row) { pushRun(); runs.push({ kind: 'row', row }); }
        else current.push(node);
      };
      const top = piece.node;
      const rowTop = rowInfo(top);
      if (rowTop && !isGallery(top)) runs.push({ kind: 'row', row: rowTop });
      else {
        const directText = Array.from(top.childNodes).some(n => n.nodeType === 3 && n.nodeValue.trim());
        if (directText) current.push(top);
        else Array.from(top.childNodes).forEach(n => { if (n.nodeType === 1 && visible(n) && !/^(SCRIPT|STYLE)$/.test(n.tagName)) handle(n); });
        pushRun();
      }
      if (!runs.length && base.bgImage) runs.push({ kind: 'one', nodes: [] });
      for (let i = 0; i < runs.length; i++) {
        const r = runs[i];
        const sec = T.makeSectionObj(ctx, r.kind === 'row' ? r.row.layout : '1', r.kind === 'row' ? r.row.cols.map(() => []) : [[]], Object.assign({}, base, {
          padding: runs.length > 1 && i > 0 ? 'sm' : base.padding,
          anchor: i === 0 ? base.anchor : '',
          valign: 'top'
        }));
        if (r.kind === 'row') {
          for (let c = 0; c < r.row.cols.length; c++) for (const n of r.row.cols[c]) await convertNodes([n], sec.columns[c].elements, path);
          const ai = cs(r.row.el).alignItems;
          if (ai === 'center') sec.valign = 'center'; else if (ai === 'flex-end' || ai === 'end') sec.valign = 'bottom';
        } else await convertNodes(r.nodes, sec.columns[0].elements, path);
        if (!sec.columns.some(c => c.elements.length) && sec.bgImage && i === 0) {
          sec.height = 'auto';
          sec.columns[0].elements.push(T.makeElement('spacer', ctx, { size: height >= 300 ? 'xl' : 'lg' }));
          sec.padding = 'md';
        }
        if (sec.columns.some(c => c.elements.length)) sections.push(sec);
      }
    }
    // a section of only a heading followed by a columns section with the same background reads as one
    pageObj.sections = sections;
  }

  async function convertNodes(nodes, out, path) {
    let buf = [], inline = '', firstAlign = '';
    const flushInline = () => { if (inline.replace(/<br>/g, '').trim()) buf.push('<p>' + inline.trim() + '</p>'); inline = ''; };
    const flush = () => {
      flushInline();
      if (!buf.length) return;
      const html = H.sanitizeRich(buf.join(''));
      if (html) out.push(T.makeElement('text', ctx, { html }, firstAlign ? { align: firstAlign } : {}));
      buf = []; firstAlign = '';
    };
    const addBlock = (html, el) => { if (!buf.length && !inline) firstAlign = alignOf(el); buf.push(html); };
    const push = el => { flush(); out.push(el); };
    const ownCode = async el => {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('[data-ezy-src]').forEach(n => { n.setAttribute('src', n.getAttribute('data-ezy-src')); n.removeAttribute('data-ezy-src'); });
      if (clone.hasAttribute && clone.hasAttribute('data-ezy-src')) { clone.setAttribute('src', clone.getAttribute('data-ezy-src')); clone.removeAttribute('data-ezy-src'); }
      for (const n of clone.querySelectorAll('img[src], video[src], source[src]')) {
        const a = await assetFromUrl(n.getAttribute('src'), path);
        if (a && !/^https?:/.test(a)) n.setAttribute('src', 'ezy-asset:' + a);
      }
      clone.querySelectorAll('[style]').forEach(n => n.setAttribute('style', n.getAttribute('style').replace(/url\("?blob:[^")]+"?\)/g, 'none')));
      clone.querySelectorAll('input:not([type])').forEach(n => n.setAttribute('type', 'text'));
      if (clone.tagName === 'INPUT' && !clone.hasAttribute('type')) clone.setAttribute('type', 'text');
      report.ownCode++;
      push(T.makeElement('html', ctx, { code: clone.outerHTML }));
    };
    const linkOf = el => { const a = el.closest('a[href]'); return a ? a.getAttribute('href') : ''; };

    async function walk(node) {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === 3) { const t = child.nodeValue.replace(/\s+/g, ' '); if (t.trim()) inline += Gen.esc(t); continue; }
        if (child.nodeType !== 1) continue;
        const el = child, tag = el.tagName;
        if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|LINK|META)$/.test(tag) || !visible(el)) continue;
        if (isChrome(el) && el.tagName !== 'HEADER') continue;
        if (/^H[1-6]$/.test(tag)) {
          if (!textLen(el)) continue;
          const level = Math.min(4, +tag[1]);
          push(T.makeElement('heading', ctx, { text: el.textContent.replace(/\s+/g, ' ').trim(), level }, alignOf(el) ? { align: alignOf(el) } : {}));
          continue;
        }
        if (tag === 'IMG' || tag === 'PICTURE' || tag === 'SVG' && false) {
          const img = tag === 'IMG' ? el : el.querySelector('img');
          if (!img) continue;
          const src = await assetFromUrl(img.getAttribute('src') || img.currentSrc, path);
          if (!src) continue;
          const r = img.getBoundingClientRect(), pr = (img.closest('div,section,article,figure,p') || img.parentElement || img).getBoundingClientRect();
          const pct = pr.width ? r.width / pr.width : 1;
          const width = pct < 0.35 ? '25' : pct < 0.6 ? '50' : pct < 0.85 ? '75' : '100';
          push(T.makeElement('image', ctx, { src, alt: img.getAttribute('alt') || '', caption: '', link: linkOf(img) }, { width, align: alignOf(img.parentElement) || (width !== '100' && Math.abs((r.left + r.width / 2) - (pr.left + pr.width / 2)) < 20 ? 'center' : '') }));
          continue;
        }
        if (tag === 'FIGURE') {
          const img = el.querySelector('img'), bq = el.querySelector('blockquote'), cap = el.querySelector('figcaption');
          if (bq) { push(T.makeElement('quote', ctx, { text: bq.textContent.replace(/\s+/g, ' ').trim(), cite: cap ? cap.textContent.replace(/\s+/g, ' ').replace(/^[—–-]\s*/, '').trim() : '' }, alignOf(el) ? { align: alignOf(el) } : {})); continue; }
          if (img && el.querySelectorAll('img').length === 1) {
            const src = await assetFromUrl(img.getAttribute('src'), path);
            if (src) { push(T.makeElement('image', ctx, { src, alt: img.getAttribute('alt') || '', caption: cap ? cap.textContent.replace(/\s+/g, ' ').trim() : '', link: linkOf(img) })); continue; }
          }
          await walkContainer(el); continue;
        }
        if (tag === 'BLOCKQUOTE') {
          const cite = el.querySelector('cite, footer');
          const citeText = cite ? cite.textContent.replace(/\s+/g, ' ').replace(/^[—–-]\s*/, '').trim() : '';
          const q = el.cloneNode(true); q.querySelectorAll('cite, footer').forEach(n => n.remove());
          push(T.makeElement('quote', ctx, { text: q.textContent.replace(/\s+/g, ' ').trim(), cite: citeText }, alignOf(el) ? { align: alignOf(el) } : {}));
          continue;
        }
        if (tag === 'P') {
          const imgs = el.querySelectorAll('img');
          if (imgs.length && textLen(el) < 3) { await walkContainer(el); continue; }
          if (el.querySelector('a') && kids(el).length === Array.from(el.querySelectorAll('a')).length && Array.from(el.querySelectorAll('a')).every(looksLikeButton) && textLen(el) === Array.from(el.querySelectorAll('a')).reduce((n, a) => n + textLen(a), 0)) {
            for (const a of el.querySelectorAll('a')) pushButton(a); continue;
          }
          flushInline(); addBlock('<p>' + el.innerHTML + '</p>', el); continue;
        }
        if (tag === 'UL' || tag === 'OL') {
          const lis = Array.from(el.children).filter(c => c.tagName === 'LI');
          if (lis.length && lis.every(li => li.querySelector('img') && textLen(li) < 40) && lis.length >= 3) { await galleryFrom(el); continue; }
          if (lis.some(li => li.querySelector('h1,h2,h3,h4,img,p,div'))) { await walkContainer(el); continue; }
          flushInline(); addBlock(el.outerHTML.replace(/^<(ul|ol)[^>]*>/i, '<$1>'), el); continue;
        }
        if (tag === 'A') {
          if (looksLikeButton(el)) { pushButton(el); continue; }
          if (el.querySelector('img, h1, h2, h3, h4, p, div')) { await walkContainer(el); continue; }
          inline += el.outerHTML; continue;
        }
        if (tag === 'BUTTON') { if (!el.closest('form') && textLen(el)) push(T.makeElement('button', ctx, { text: el.textContent.replace(/\s+/g, ' ').trim(), link: '' }, alignOf(el.parentElement) ? { align: alignOf(el.parentElement) } : {})); continue; }
        if (tag === 'TABLE') {
          const rows = Array.from(el.rows).slice(0, 60).map(r => Array.from(r.cells).slice(0, 8).map(c => c.textContent.replace(/\s+/g, ' ').trim()));
          const w = Math.max(...rows.map(r => r.length));
          rows.forEach(r => { while (r.length < w) r.push(''); });
          const header = !!(el.tHead || (el.rows[0] && Array.from(el.rows[0].cells).every(c => c.tagName === 'TH')));
          const cap = el.caption ? el.caption.textContent.trim() : '';
          if (rows.length) push(T.makeElement('table', ctx, { rows, header, striped: true, caption: cap }));
          continue;
        }
        if (tag === 'IFRAME') {
          const src = el.getAttribute('data-ezy-src') || el.getAttribute('src') || '';
          if (Gen.videoEmbed(src) || /youtube(-nocookie)?\.com\/embed|player\.vimeo\.com/.test(src)) {
            const id = (src.match(/embed\/([\w-]+)/) || [])[1];
            const url = /vimeo/.test(src) ? 'https://vimeo.com/' + ((src.match(/video\/(\d+)/) || [])[1] || '') : id ? 'https://www.youtube.com/watch?v=' + id : src;
            push(T.makeElement('video', ctx, { source: 'url', url, title: el.getAttribute('title') || '' }));
            continue;
          }
          const q = src.match(/[?&]q=([^&]+)/);
          if (/google\.[a-z.]+\/maps/.test(src) && q) { push(T.makeElement('map', ctx, { address: decodeURIComponent(q[1].replace(/\+/g, ' ')) })); continue; }
          await ownCode(el); continue;
        }
        if (tag === 'VIDEO') {
          const srcAttr = el.getAttribute('src') || (el.querySelector('source') || { getAttribute: () => '' }).getAttribute('src');
          const file = await assetFromUrl(srcAttr, path);
          if (file && !/^https?:/.test(file)) { push(T.makeElement('video', ctx, { source: 'file', file, autoplay: el.autoplay, loop: el.loop, muted: el.muted, controls: el.controls })); continue; }
          await ownCode(el); continue;
        }
        if (tag === 'DETAILS') {
          const sum = el.querySelector('summary');
          const q = sum ? sum.textContent.replace(/\s+/g, ' ').trim() : '';
          const a = el.cloneNode(true); const s2 = a.querySelector('summary'); if (s2) s2.remove();
          const item = { q, a: a.textContent.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim() };
          flush();
          const prev = out[out.length - 1];
          if (prev && prev.type === 'faq') prev.props.items.push(item);
          else out.push(T.makeElement('faq', ctx, { items: [item] }));
          continue;
        }
        if (tag === 'HR') { push(T.makeElement('divider', ctx, { variant: 'line' })); continue; }
        if (tag === 'BR') { inline += '<br>'; continue; }
        if (/^(FORM|SVG|CANVAS|OBJECT|EMBED|AUDIO|SELECT|INPUT|TEXTAREA|DIALOG|MAP)$/i.test(tag)) {
          if (tag === 'svg' || tag === 'SVG') { if (el.getBoundingClientRect().width < 64) continue; }
          await ownCode(el); continue;
        }
        if (/^(SPAN|STRONG|B|EM|I|U|SMALL|CODE|LABEL|TIME|MARK|ABBR|SUB|SUP|S|Q|CITE|KBD|DFN)$/.test(tag) && !el.querySelector('div,p,h1,h2,h3,h4,img,ul,ol,table')) {
          inline += el.outerHTML; continue;
        }
        await walkContainer(el);
      }
    }
    async function walkContainer(el) {
      if (isGallery(el)) { await galleryFrom(el); return; }
      flushInline();
      await walk(el);
      flushInline();
    }
    async function galleryFrom(el) {
      const images = [];
      let linked = 0;
      for (const img of Array.from(el.querySelectorAll('img')).filter(visible)) {
        const src = await assetFromUrl(img.getAttribute('src'), path);
        if (!src) continue;
        const fig = img.closest('figure');
        const cap = fig && fig.querySelector('figcaption');
        const a = img.closest('a[href]');
        if (a && IMG_RE.test(a.getAttribute('href') || '')) linked++;
        images.push({ src, alt: img.getAttribute('alt') || '', caption: cap ? cap.textContent.replace(/\s+/g, ' ').trim() : '' });
      }
      if (!images.length) return;
      const first = Array.from(el.querySelectorAll('img')).filter(visible);
      const top0 = first[0].getBoundingClientRect().top;
      const perRow = Math.max(2, Math.min(5, first.filter(i => Math.abs(i.getBoundingClientRect().top - top0) < 20).length));
      const r0 = first[0].getBoundingClientRect(), ratio = r0.width / Math.max(1, r0.height);
      push(T.makeElement('gallery', ctx, { images, columns: perRow, ratio: ratio > 1.2 ? 'landscape' : ratio < 0.85 ? 'portrait' : 'square', lightbox: true }));
    }
    function pushButton(a) {
      const s = cs(a);
      const variant = rgbToHex(s.backgroundColor) ? 'filled' : 'outline';
      const btn = T.makeElement('button', ctx, { text: a.textContent.replace(/\s+/g, ' ').trim(), link: a.getAttribute('href') || '', newTab: a.getAttribute('target') === '_blank', variant }, alignOf(a.parentElement) ? { align: alignOf(a.parentElement) } : {});
      btn._bg = rgbToHex(s.backgroundColor);
      push(btn);
    }

    for (const n of nodes) {
      if (n.nodeType !== 1 || (isChrome(n) && n.tagName !== 'HEADER')) continue;
      if (/^(P|UL|OL|H[1-6]|IMG|TABLE|BLOCKQUOTE|FIGURE|A|BUTTON|IFRAME|VIDEO|DETAILS|HR|FORM|SVG|PICTURE)$/i.test(n.tagName)) await walk({ childNodes: [n] });
      else await walkContainer(n);
    }
    flush();
  }

  /* ---------- run ---------- */
  const site = T.makeSite('blank', ctx);
  site.pages = [];
  const pageIds = new Map();
  const orderedPaths = [home, ...pagePaths.filter(p => p !== home)];
  orderedPaths.forEach(p => pageIds.set(p, ctx.id()));
  const colorVotes = new Map(), bgVotes = new Map();
  const vote = (map, hex, w) => { if (hex) map.set(hex, (map.get(hex) || 0) + (w || 1)); };
  let firstInfo = null;

  try {
    for (let pi = 0; pi < orderedPaths.length; pi++) {
      const path = orderedPaths[pi];
      H.progress && H.progress('Importing page ' + (pi + 1) + ' of ' + orderedPaths.length + ': ' + path);
      const prep = prepare(path);
      doc = await render(prep.html);
      win = doc.defaultView;
      const title = (doc.title || '').trim();
      const nameFromTitle = title.split(/\s+[|–—:·-]\s+/)[0].trim();
      const pageObj = {
        id: pageIds.get(path),
        name: nameFromTitle || path.replace(/\.html?$/i, '').split('/').pop().replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase()),
        title, description: (doc.querySelector('meta[name="description"]') || { getAttribute: () => '' }).getAttribute('content') || '',
        showInNav: true, sections: [], _path: path
      };
      if (pi === 0) pageObj.name = pageObj.name && orderedPaths.length > 1 ? 'Home' : (pageObj.name || 'Home');
      // colours used for buttons and links
      doc.querySelectorAll('a, button').forEach(a => {
        if (!visible(a)) return;
        const s = cs(a);
        const bg = rgbToHex(s.backgroundColor);
        if (bg && saturation(bg) > 0.25) vote(colorVotes, bg, looksLikeButton(a) ? 4 : 1);
        const fg = rgbToHex(s.color);
        if (fg && saturation(fg) > 0.3) vote(colorVotes, fg, 1);
      });
      Array.from(doc.querySelectorAll('header, footer, nav, div, ul')).filter(el => visible(el) && isChrome(el)).forEach(el => {
        const bg = rgbToHex(cs(el).backgroundColor);
        if (bg && saturation(bg) > 0.4) vote(colorVotes, bg, 3);
      });
      doc.querySelectorAll('section, header, footer, div').forEach(el => {
        if (el.getBoundingClientRect().width < 900 || !visible(el)) return;
        const bg = rgbToHex(cs(el).backgroundColor);
        if (bg) vote(bgVotes, bg, 1);
      });
      if (pi === 0) {
        const header = Array.from(doc.querySelectorAll('header, [role="banner"], nav')).find(visible) || Array.from(doc.body.querySelectorAll('div, ul, table')).find(el => visible(el) && isChrome(el) && el.querySelectorAll('a').length >= 2);
        const bodyStyle = cs(doc.body);
        const h = doc.querySelector('h1, h2');
        firstInfo = {
          lang: doc.documentElement.getAttribute('lang') || '',
          siteName: (doc.querySelector('meta[property="og:site_name"]') || { getAttribute: () => '' }).getAttribute('content') || '',
          bodyBg: rgbToHex(bodyStyle.backgroundColor) || '#ffffff',
          bodyColor: rgbToHex(bodyStyle.color) || '#222222',
          bodyFont: bodyStyle.fontFamily,
          headingFont: h ? cs(h).fontFamily : bodyStyle.fontFamily,
          headerBg: header ? rgbToHex(cs(header).backgroundColor) : null,
          headerColor: header ? rgbToHex(cs(header.querySelector('a') || header).color) : null,
          sticky: header ? /sticky|fixed/.test(cs(header).position) || /sticky|fixed/.test(cs(header.parentElement).position) : false,
          logoText: '', logoImg: null, navOrder: [], navNames: new Map(),
          footerText: '', footerBg: null, footerColor: null,
          favicon: null
        };
        if (header) {
          const logoEl = header.querySelector('[class*="logo" i], [class*="brand" i], [id*="logo" i]') || (header.tagName === 'NAV' || isChrome(header) && !header.querySelector('nav') && header.tagName !== 'HEADER' ? null : Array.from(header.querySelectorAll('a')).find(a => !a.closest('nav')));
          if (logoEl) {
            const img = logoEl.tagName === 'IMG' ? logoEl : logoEl.querySelector('img');
            if (img) firstInfo.logoImg = await assetFromUrl(img.getAttribute('src'), path);
            firstInfo.logoText = logoEl.textContent.replace(/\s+/g, ' ').trim().slice(0, 60);
          }
          const navLinks = Array.from((doc.querySelector('nav') || header).querySelectorAll('a[href]'));
          navLinks.forEach(a => {
            const p = resolvePath(path, a.getAttribute('href'));
            if (p && pageIds.has(p) && !firstInfo.navOrder.includes(p)) { firstInfo.navOrder.push(p); firstInfo.navNames.set(p, a.textContent.replace(/\s+/g, ' ').trim()); }
          });
        }
        const footer = Array.from(doc.querySelectorAll('footer, [role="contentinfo"]')).filter(visible).pop() || Array.from(doc.body.querySelectorAll('div, p')).filter(el => visible(el) && isChrome(el) && /foot|copyright/i.test((el.id || '') + ' ' + el.className)).pop();
        if (footer) {
          const ft = footer.cloneNode(true);
          ft.querySelectorAll('nav, ul, script, style').forEach(n => n.remove());
          firstInfo.footerText = ft.textContent.replace(/\s+/g, ' ').trim().slice(0, 300).replace(/(©|&copy;|\(c\))\s*(19|20)\d\d/i, '$1 {year}');
          firstInfo.footerBg = rgbToHex(cs(footer).backgroundColor);
          firstInfo.footerColor = rgbToHex(cs(footer).color);
        }
        const icon = doc.querySelector('link[rel~="icon"]');
        if (icon) firstInfo.favicon = await assetFromUrl(prep.original.querySelector('link[rel~="icon"]').getAttribute('href'), path);
      }
      await convertPage(path, pageObj);
      if (!pageObj.sections.length && textLen(doc.body) < 20) report.notes.push('“' + path + '” looks empty without JavaScript, so it was imported as a blank page. Sites built with React, Vue or similar can’t be imported.');
      site.pages.push(pageObj);
      report.pages++;
    }
  } finally {
    frame.remove();
    blobs.forEach(u => URL.revokeObjectURL(u));
  }

  /* ---------- site-wide settings ---------- */
  const fi = firstInfo || {};
  const pick = name => {
    const first = String(name || '').split(',')[0].replace(/["']/g, '').trim().toLowerCase();
    const hit = Object.keys(Gen.FONTS).find(k => k.toLowerCase() === first);
    if (hit) return hit;
    return /serif/i.test(name) && !/sans-serif/i.test(String(name).split(',').slice(-1)[0]) ? 'System serif' : 'System sans';
  };
  const colors = [...colorVotes.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]);
  const bgs = [...bgVotes.entries()].sort((a, b) => b[1] - a[1]).map(e => e[0]).filter(c => c !== fi.bodyBg);
  const primary = colors[0] || '#2f5bea';
  const accent = colors.find(c => c !== primary && Math.abs(parseInt(c.slice(1), 16) - parseInt(primary.slice(1), 16)) > 0x202020) || Gen.mixHex(primary, '#ffb347', 0.6);
  const bodyBg = fi.bodyBg || '#ffffff';
  const surface = bgs.find(c => Gen.luminance(c) > 0.6 === Gen.luminance(bodyBg) > 0.6) || (Gen.luminance(bodyBg) > 0.5 ? '#ffffff' : Gen.mixHex(bodyBg, '#ffffff', 0.08));
  site.theme.palette = '';
  site.theme.colors = { primary, accent, background: bodyBg, surface, text: fi.bodyColor || '#222222' };
  site.theme.fonts = { heading: pick(fi.headingFont), body: pick(fi.bodyFont) };
  const keyFor = hex => (hex && Object.keys(site.theme.colors).find(k => site.theme.colors[k] === hex)) || hex || '';
  // turn exact theme colours used in sections back into theme references, so a palette change still recolours them
  site.pages.forEach(p => p.sections.forEach(s => { if (s.bg) s.bg = keyFor(s.bg); }));
  const firstTitle = site.pages[0] ? (site.pages[0].title || '') : '';
  site.name = fi.siteName || (fi.logoText && fi.logoText.length < 40 ? fi.logoText : '') || firstTitle.split(/\s+[|–—:·-]\s+/).pop() || 'Imported website';
  site.header = Object.assign(site.header, {
    show: true, logoText: fi.logoImg && !fi.logoText ? '' : (fi.logoText || site.name), logoImage: fi.logoImg || null,
    sticky: !!fi.sticky, bg: keyFor(fi.headerBg) || 'surface', color: fi.headerColor && fi.headerBg ? keyFor(fi.headerColor) : ''
  });
  site.footer = Object.assign(site.footer, {
    show: true, text: fi.footerText || '© {year} ' + site.name, showNav: true,
    bg: keyFor(fi.footerBg) || 'text', color: fi.footerColor && fi.footerBg ? keyFor(fi.footerColor) : ''
  });
  site.settings.language = fi.lang || 'en';
  site.settings.favicon = fi.favicon || null;

  // page order and menu follow the original navigation
  if (fi.navOrder && fi.navOrder.length) {
    const order = new Map(fi.navOrder.map((p, i) => [p, i]));
    const homePage = site.pages[0];
    const rest = site.pages.slice(1).sort((a, b) => (order.has(a._path) ? order.get(a._path) : 999) - (order.has(b._path) ? order.get(b._path) : 999));
    site.pages = [homePage, ...rest];
    site.pages.forEach((p, i) => {
      if (i > 0 && !order.has(p._path)) p.showInNav = false;
      const nav = fi.navNames.get(p._path);
      if (nav && nav.length < 30) p.name = nav;
    });
  }

  // links between pages become Pocket-Web-Studio page links
  const fixLink = (href, from) => {
    if (!href) return href;
    const h = String(href).trim();
    if (isExternal(h) || h.startsWith('#')) return h;
    const p = resolvePath(from, h), hash = h.includes('#') ? '#' + h.split('#')[1] : '';
    if (p && pageIds.has(p)) return 'page:' + pageIds.get(p) + hash;
    if (p && !files.has(p)) report.missing.add(p);
    return h;
  };
  site.pages.forEach(p => {
    p.sections.forEach(s => s.columns.forEach(c => c.elements.forEach(el => {
      if (el.props.link !== undefined) el.props.link = fixLink(el.props.link, p._path);
      if (el.type === 'button' && el._bg && el._bg === site.theme.colors.accent && el._bg !== site.theme.colors.primary) el.props.variant = 'accent';
      delete el._bg;
      if (el.type === 'text') el.props.html = el.props.html.replace(/href="([^"]*)"/g, (m, h) => 'href="' + Gen.escAttr(fixLink(h.replace(/&amp;/g, '&'), p._path)) + '"');
      if (el.type === 'image' && el.props.link && /\.(png|jpe?g|gif|webp)$/i.test(el.props.link)) el.props.link = '';
    })));
    delete p._path;
  });
  report.missing = [...report.missing].filter(p => !/\.(woff2?|ttf|otf|eot|map)$/i.test(p));
  return { site, report };
}

root.EzyImporter = { importSite, normPath, resolvePath };
})(globalThis);
