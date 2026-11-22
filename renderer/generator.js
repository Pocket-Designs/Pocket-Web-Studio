// Pocket-Web-Studio — site generator
// Turns the visual page model into standards-based HTML, CSS and JavaScript.
// Copyright (c) 2026 Pocket-Designs. MIT licence, see LICENSE.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WeaverGen = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */

const THEME_KEYS = ['primary', 'accent', 'background', 'surface', 'text'];
const THEME_LABELS = { primary: 'Main', accent: 'Highlight', background: 'Page', surface: 'Panels', text: 'Text' };

const PALETTES = {
  Harbour:  { primary: '#2c6e7f', accent: '#c98a3c', background: '#faf7f1', surface: '#ffffff', text: '#23303a' },
  Forest:   { primary: '#2f5d3a', accent: '#d9a441', background: '#f4f1e8', surface: '#ffffff', text: '#1e2a21' },
  Coral:    { primary: '#d4553f', accent: '#2b4c7e', background: '#fff8f3', surface: '#ffffff', text: '#2a2422' },
  Slate:    { primary: '#3d5a80', accent: '#ee6c4d', background: '#f4f6f8', surface: '#ffffff', text: '#1f2933' },
  Berry:    { primary: '#8e2f5c', accent: '#f2a65a', background: '#fbf5f8', surface: '#ffffff', text: '#2c1a24' },
  Lagoon:   { primary: '#1f8a7d', accent: '#e9b949', background: '#fffdf6', surface: '#ffffff', text: '#22403d' },
  Midnight: { primary: '#8ab4ff', accent: '#ffcf6b', background: '#10141c', surface: '#1a202b', text: '#e8ecf3' },
  Mono:     { primary: '#111111', accent: '#6b6b6b', background: '#ffffff', surface: '#f3f3f3', text: '#111111' }
};

const FONTS = {
  'System sans':      { stack: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
  'System serif':     { stack: 'Georgia, Cambria, "Times New Roman", serif' },
  'Inter':            { g: 'Inter:wght@400;600;700', stack: '"Inter", system-ui, sans-serif' },
  'Work Sans':        { g: 'Work+Sans:wght@400;600;700', stack: '"Work Sans", system-ui, sans-serif' },
  'Open Sans':        { g: 'Open+Sans:ital,wght@0,400;0,600;0,700;1,400', stack: '"Open Sans", system-ui, sans-serif' },
  'Lato':             { g: 'Lato:ital,wght@0,400;0,700;1,400', stack: '"Lato", system-ui, sans-serif' },
  'Nunito':           { g: 'Nunito:ital,wght@0,400;0,700;0,800;1,400', stack: '"Nunito", system-ui, sans-serif' },
  'Source Sans 3':    { g: 'Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400', stack: '"Source Sans 3", system-ui, sans-serif' },
  'Montserrat':       { g: 'Montserrat:wght@400;600;700;800', stack: '"Montserrat", system-ui, sans-serif' },
  'Poppins':          { g: 'Poppins:wght@400;600;700', stack: '"Poppins", system-ui, sans-serif' },
  'Raleway':          { g: 'Raleway:wght@400;600;700', stack: '"Raleway", system-ui, sans-serif' },
  'Oswald':           { g: 'Oswald:wght@400;500;600', stack: '"Oswald", "Arial Narrow", sans-serif' },
  'Bebas Neue':       { g: 'Bebas+Neue', stack: '"Bebas Neue", "Arial Narrow", sans-serif', weight: 400 },
  'Playfair Display': { g: 'Playfair+Display:ital,wght@0,400;0,700;1,400', stack: '"Playfair Display", Georgia, serif' },
  'Lora':             { g: 'Lora:ital,wght@0,400;0,700;1,400', stack: '"Lora", Georgia, serif' },
  'Merriweather':     { g: 'Merriweather:ital,wght@0,400;0,700;1,400', stack: '"Merriweather", Georgia, serif' },
  'Fraunces':         { g: 'Fraunces:ital,wght@0,400;0,700;1,400', stack: '"Fraunces", Georgia, serif' },
  'DM Serif Display': { g: 'DM+Serif+Display:ital@0;1', stack: '"DM Serif Display", Georgia, serif', weight: 400 },
  'Caveat':           { g: 'Caveat:wght@400;700', stack: '"Caveat", "Comic Sans MS", cursive' }
};

const FONT_PAIRS = [
  { name: 'Classic', heading: 'Playfair Display', body: 'Source Sans 3' },
  { name: 'Modern', heading: 'Montserrat', body: 'Open Sans' },
  { name: 'Friendly', heading: 'Nunito', body: 'Nunito' },
  { name: 'Editorial', heading: 'Fraunces', body: 'Inter' },
  { name: 'Bold', heading: 'Bebas Neue', body: 'Work Sans' },
  { name: 'Elegant', heading: 'DM Serif Display', body: 'Lato' },
  { name: 'Bookish', heading: 'Lora', body: 'Source Sans 3' },
  { name: 'Handmade', heading: 'Caveat', body: 'Nunito' },
  { name: 'Simple', heading: 'System sans', body: 'System sans' }
];

const SIZES = {
  sm: '0.875rem',
  md: '1.0625rem',
  lg: '1.25rem',
  xl: 'clamp(1.35rem, 1.1rem + 1vw, 1.7rem)',
  '2xl': 'clamp(1.75rem, 1.3rem + 2vw, 2.5rem)',
  '3xl': 'clamp(2.25rem, 1.5rem + 3.4vw, 3.75rem)',
  '4xl': 'clamp(2.75rem, 1.6rem + 5.4vw, 5.25rem)'
};
const PADS = { none: '0', sm: '0.75rem', md: '1.5rem', lg: '2.5rem' };
const RADII = { none: '0', sm: '6px', md: '14px', lg: '28px', full: '999px' };
const THEME_RADIUS = { square: ['0px', '0px'], soft: ['10px', '10px'], round: ['22px', '999px'] };
const RATIOS = { square: '1 / 1', landscape: '4 / 3', portrait: '3 / 4', wide: '16 / 9', panorama: '21 / 9' };
const FOCUS = { top: '50% 15%', center: '50% 50%', bottom: '50% 85%' };
const SHADOW = '0 2px 6px rgb(0 0 0 / 0.08), 0 14px 34px rgb(0 0 0 / 0.12)';
const LAYOUTS = { '1': 1, '1-1': 2, '1-2': 2, '2-1': 2, '1-1-1': 3, '1-1-1-1': 4 };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = s => esc(s).replace(/"/g, '&quot;');
const textHtml = s => esc(s).replace(/\r?\n/g, '<br>');
function attrs(a) {
  let s = '';
  for (const k of Object.keys(a)) {
    const v = a[k];
    if (v == null || v === false || v === '') continue;
    s += v === true ? ' ' + k : ' ' + k + '="' + escAttr(String(v)) + '"';
  }
  return s;
}
function Writer() { this.out = []; this.d = 0; }
Writer.prototype.line = function (s) { this.out.push('  '.repeat(this.d) + s); };
Writer.prototype.open = function (s) { this.line(s); this.d++; };
Writer.prototype.close = function (s) { this.d = Math.max(0, this.d - 1); this.line(s); };
Writer.prototype.raw = function (text) { String(text).split('\n').forEach(l => this.line(l)); };
Writer.prototype.toString = function () { return this.out.join('\n'); };

function slugify(s) {
  return String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
}

function hexToRgb(h) {
  h = String(h).replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance(hex) {
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
function onColor(hex) { return contrast(hex, '#ffffff') >= contrast(hex, '#15171c') ? '#ffffff' : '#15171c'; }
const validHex = v => typeof v === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v);
function resolveHex(site, v) {
  if (THEME_KEYS.includes(v)) return site.theme.colors[v];
  return validHex(v) ? v : null;
}
function colorCss(v) {
  if (THEME_KEYS.includes(v)) return 'var(--c-' + v + ')';
  return validHex(v) ? v : '';
}
function onColorCss(site, v) {
  if (THEME_KEYS.includes(v)) return 'var(--c-on-' + v + ')';
  return validHex(v) ? onColor(v) : '';
}
function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * t).toString(16).padStart(2, '0')).join('');
}
const fontOf = name => FONTS[name] || FONTS['System sans'];

function safeLink(link) {
  if (!link) return '';
  const l = String(link).trim();
  if (/^(javascript|data|vbscript|file):/i.test(l)) return '';
  return l;
}

/* ------------------------------------------------------------------ */
/* Site structure                                                      */
/* ------------------------------------------------------------------ */

function pageFiles(site) {
  const map = {}, used = new Set(['index']);
  site.pages.forEach((p, i) => {
    if (i === 0) { map[p.id] = 'index.html'; return; }
    let base = slugify(p.name) || 'page', slug = base, n = 2;
    while (used.has(slug)) slug = base + '-' + (n++);
    used.add(slug);
    map[p.id] = slug + '.html';
  });
  return map;
}

function linkHref(site, link, files) {
  const l = safeLink(link);
  if (!l) return '';
  if (l.startsWith('page:')) {
    const [id, hash] = l.slice(5).split('#');
    const f = (files || pageFiles(site))[id];
    return f ? f + (hash ? '#' + hash : '') : '';
  }
  return l;
}
function rewriteRichLinks(site, html, files) {
  return String(html || '').replace(/href="page:([\w-]+)(#[^"]*)?"/g, (m, id, hash) => {
    const f = files[id];
    return 'href="' + escAttr(f ? f + (hash || '') : '#') + '"';
  });
}

function pageTitle(site, page) {
  const isHome = site.pages[0] === page;
  if (page.title) return page.title;
  return isHome ? site.name : page.name + ' | ' + site.name;
}

const ASSET_KEYS = ['src', 'image', 'file', 'bgImage', 'logoImage', 'favicon'];
const isUrl = n => /^https?:\/\//i.test(String(n || ''));
const ASSET_TOKEN = /ezy-asset:([\w.-]+)/g;
function usedAssets(site) {
  const found = new Set();
  (function walk(v, key) {
    if (!v) return;
    if (typeof v === 'string') {
      if (key === 'code' || key === 'css' || key === 'js') { let m; ASSET_TOKEN.lastIndex = 0; while ((m = ASSET_TOKEN.exec(v))) found.add(m[1]); }
      return;
    }
    if (typeof v !== 'object') return;
    if (Array.isArray(v)) { v.forEach(x => walk(x)); return; }
    for (const k of Object.keys(v)) {
      if (ASSET_KEYS.includes(k) && typeof v[k] === 'string' && v[k]) found.add(v[k]);
      else walk(v[k], k);
    }
  })(site);
  return [...found];
}
// Pictures stay where they are when they come from another website.
function exportPath(name, info) {
  if (isUrl(name)) return name;
  return (info && /^video\//.test(info.mime || '') ? 'media/' : 'images/') + name;
}

function videoEmbed(url, autoplay) {
  const u = String(url || '').trim();
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
  if (m) {
    const q = autoplay ? '?autoplay=1&mute=1&loop=1&playlist=' + m[1] : '';
    return { kind: 'YouTube', src: 'https://www.youtube-nocookie.com/embed/' + m[1] + q };
  }
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (m) return { kind: 'Vimeo', src: 'https://player.vimeo.com/video/' + m[1] + (autoplay ? '?autoplay=1&muted=1&loop=1' : '') };
  return null;
}

/* ------------------------------------------------------------------ */
/* Stylesheet                                                          */
/* ------------------------------------------------------------------ */

const BASE_CSS = `/* ---------- Base ---------- */
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: var(--font-body);
  font-size: 1.0625rem;
  line-height: 1.65;
  color: var(--c-text);
  background: var(--c-background);
  -webkit-font-smoothing: antialiased;
}
main { flex: 1 0 auto; }
img, svg, video, iframe { display: block; max-width: 100%; }
img { height: auto; }
h1, h2, h3, h4 { margin: 0; font-family: var(--font-heading); font-weight: var(--heading-weight); line-height: 1.15; text-wrap: balance; }
h1 { font-size: ${SIZES['3xl']}; }
h2 { font-size: ${SIZES['2xl']}; }
h3 { font-size: ${SIZES.xl}; }
h4 { font-size: ${SIZES.lg}; }
p, ul, ol, figure, blockquote { margin: 0; }
a { color: var(--c-link, var(--c-primary)); text-underline-offset: 0.18em; }
:focus-visible { outline: 3px solid var(--c-accent); outline-offset: 3px; }
::selection { background: color-mix(in srgb, var(--c-accent) 35%, transparent); }
.wv-skip { position: absolute; left: 1rem; top: -4rem; z-index: 100; padding: 0.6rem 1rem; background: var(--c-surface); color: var(--c-on-surface); border-radius: var(--radius); }
.wv-skip:focus { top: 1rem; }

/* ---------- Layout ---------- */
.wv-container { width: min(100% - 2.5rem, var(--maxw)); margin-inline: auto; }
.width-wide .wv-container { --maxw: 1400px; }
.width-full .wv-container { width: 100%; }
.wv-section { position: relative; padding-block: var(--pad); background-size: cover; background-position: center; }
.pad-none { --pad: 0px; }
.pad-sm { --pad: clamp(1.5rem, 3vw, 2.5rem); }
.pad-md { --pad: clamp(3rem, 6vw, 5rem); }
.pad-lg { --pad: clamp(4.5rem, 9vw, 8rem); }
.pad-xl { --pad: clamp(6rem, 13vw, 11rem); }
.height-half { min-height: 55vh; min-height: 55svh; display: grid; align-content: center; }
.height-full { min-height: 100vh; min-height: 100svh; display: grid; align-content: center; }
.wv-cols { --col-gap: clamp(1.5rem, 4vw, 3.5rem); display: grid; gap: var(--col-gap); align-items: start; }
.cols-1 { grid-template-columns: minmax(0, 1fr); }
.cols-1-1 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.cols-1-2 { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
.cols-2-1 { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
.cols-1-1-1 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.cols-1-1-1-1 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.valign-center { align-items: center; }
.valign-bottom { align-items: end; }
.valign-stretch { align-items: stretch; }
.wv-col { display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }
.col-lines { align-items: stretch; }
.col-lines.valign-center > .wv-col { justify-content: center; }
.col-lines.valign-bottom > .wv-col { justify-content: flex-end; }
.col-lines > .wv-col + .wv-col { position: relative; }
.col-lines > .wv-col + .wv-col::before { content: ""; position: absolute; top: 0; bottom: 0; left: calc(var(--col-gap) / -2); border-left: 1px solid color-mix(in srgb, currentColor 22%, transparent); pointer-events: none; }
.col-lines--dashed > .wv-col + .wv-col::before { border-left-style: dashed; }
.col-lines--dotted > .wv-col + .wv-col::before { border-left-width: 3px; border-left-style: dotted; }
.cols-1 .wv-text, .cols-1 .wv-quote { max-width: 70ch; }
.cols-1 .wv-heading { max-width: 28ch; }
.align-center { text-align: center; margin-inline: auto; }
.align-right { text-align: right; margin-left: auto; }
@media (max-width: 900px) {
  .cols-1-1-1-1 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .col-lines.cols-1-1-1-1 > .wv-col:nth-child(3)::before { display: none; }
}
@media (max-width: 760px) {
  .wv-cols { grid-template-columns: minmax(0, 1fr); }
  .col-lines > .wv-col + .wv-col::before { display: block; top: calc(var(--col-gap) / -2); bottom: auto; left: 0; right: 0; border-left: 0; border-top: 1px solid color-mix(in srgb, currentColor 22%, transparent); }
  .col-lines--dashed > .wv-col + .wv-col::before { border-top-style: dashed; }
  .col-lines--dotted > .wv-col + .wv-col::before { border-top-width: 3px; border-top-style: dotted; }
}

/* ---------- Header and footer ---------- */
.wv-header { position: relative; z-index: 50; background: var(--h-bg); color: var(--h-fg); --c-link: currentColor; border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent); }
.wv-header.is-sticky { position: sticky; top: 0; }
.wv-header-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1.5rem; min-height: 4.5rem; padding-block: 0.5rem; }
.layout-center .wv-header-inner { flex-direction: column; justify-content: center; padding-block: 1rem; }
.wv-logo { display: inline-flex; align-items: center; gap: 0.6rem; color: inherit; text-decoration: none; font-family: var(--font-heading); font-weight: var(--heading-weight); font-size: 1.35rem; line-height: 1.1; }
.wv-logo img { height: 2.75rem; width: auto; }
.wv-nav ul { display: flex; flex-wrap: wrap; gap: 0.25rem 1.5rem; margin: 0; padding: 0; list-style: none; }
.wv-nav a { display: inline-block; padding-block: 0.35rem; color: inherit; font-weight: 600; text-decoration: none; border-bottom: 2px solid transparent; }
.wv-nav a:hover, .wv-nav a[aria-current="page"], .wv-nav .is-current > a { border-bottom-color: var(--c-accent); }
.wv-nav li { position: relative; }
.wv-nav .has-sub > a::after { content: ""; display: inline-block; width: 0.4em; height: 0.4em; margin-left: 0.45em; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; rotate: 45deg; translate: 0 -0.2em; }
.wv-nav .wv-sub { display: none; position: absolute; top: 100%; left: -0.75rem; z-index: 60; min-width: 13rem; padding: 0.5rem; flex-direction: column; gap: 0; color: var(--h-fg); background: var(--h-bg); border-radius: var(--radius); box-shadow: 0 10px 30px rgb(0 0 0 / 0.15); }
.wv-nav .has-sub:hover > .wv-sub, .wv-nav .has-sub:focus-within > .wv-sub { display: flex; }
.wv-nav .wv-sub a { display: block; padding: 0.5rem 0.75rem; border-bottom: 0; border-radius: calc(var(--radius) * 0.6); white-space: nowrap; }
.wv-nav .wv-sub a:hover, .wv-nav .wv-sub a[aria-current="page"] { background: color-mix(in srgb, currentColor 10%, transparent); }
.wv-nav-toggle { display: none; align-items: center; gap: 0.6rem; padding: 0.5rem 0.85rem; font: inherit; font-weight: 600; color: inherit; background: none; border: 1.5px solid color-mix(in srgb, currentColor 30%, transparent); border-radius: var(--btn-radius); cursor: pointer; }
.wv-burger, .wv-burger::before, .wv-burger::after { content: ""; display: block; width: 1.1rem; height: 2px; background: currentColor; border-radius: 2px; position: relative; }
.wv-burger::before { position: absolute; top: -6px; }
.wv-burger::after { position: absolute; top: 6px; }
@media (max-width: 760px) {
  .js .wv-nav-toggle { display: inline-flex; }
  .js .wv-nav { display: none; flex-basis: 100%; padding-bottom: 0.75rem; }
  .js .wv-nav.is-open { display: block; }
  .wv-nav ul { flex-direction: column; }
  .wv-nav .wv-sub { display: flex; position: static; min-width: 0; padding: 0 0 0 1rem; background: none; box-shadow: none; }
  .wv-nav .has-sub > a::after { display: none; }
}
.wv-footer { background: var(--f-bg); color: var(--f-fg); --c-link: currentColor; padding-block: 2.5rem; font-size: 0.95rem; }
.wv-footer-inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem 2rem; }
.wv-footer ul { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; margin: 0; padding: 0; list-style: none; }
.wv-footer a { color: inherit; }

/* ---------- Text ---------- */
.wv-text > * + * { margin-top: 0.9em; }
.wv-text ul, .wv-text ol { padding-left: 1.3em; }
.wv-text li + li { margin-top: 0.3em; }
.wv-quote { padding-left: 1.25rem; border-left: 4px solid var(--c-accent); }
.wv-quote.align-center { padding-left: 0; border-left: 0; }
.wv-quote blockquote { margin: 0; font-family: var(--font-heading); font-size: ${SIZES.xl}; line-height: 1.4; }
.wv-quote figcaption { margin-top: 0.75rem; font-weight: 600; opacity: 0.8; }

/* ---------- Buttons ---------- */
.wv-button { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.wv-button.align-center { justify-content: center; }
.wv-button.align-right { justify-content: flex-end; }
.wv-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.8em 1.6em; font: inherit; font-size: 1rem; font-weight: 700; line-height: 1.2;
  color: var(--c-on-primary); background: var(--c-primary); border: 2px solid var(--c-primary);
  border-radius: var(--btn-radius); text-decoration: none; cursor: pointer;
  transition: transform 0.15s ease, filter 0.15s ease, background-color 0.15s ease;
}
.wv-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
.wv-btn--outline { color: inherit; background: transparent; border-color: currentColor; }
.wv-btn--outline:hover { background: color-mix(in srgb, currentColor 10%, transparent); filter: none; }
.wv-btn--accent { color: var(--c-on-accent); background: var(--c-accent); border-color: var(--c-accent); }
.wv-btn--sm { font-size: 0.875rem; }
.wv-link a { font-weight: 700; text-decoration-thickness: 2px; text-underline-offset: 0.25em; }
.wv-link a span[aria-hidden] { display: inline-block; transition: translate 0.15s ease; }
.wv-link a:hover span[aria-hidden] { translate: 4px 0; }
.wv-heading a { color: inherit; text-decoration-thickness: 2px; text-underline-offset: 0.2em; }
.wv-btn--lg { font-size: 1.2rem; }

/* ---------- Images and media ---------- */
.wv-image img { width: 100%; border-radius: var(--img-radius, var(--radius)); }
.wv-image.align-center { margin-inline: auto; }
.wv-image.align-right { margin-left: auto; }
.wv-image figcaption, .wv-gallery figcaption { margin-top: 0.5rem; font-size: 0.9rem; opacity: 0.75; }
.wv-gallery { --cols: 3; --gap: 0.75rem; --min-thumb: 8.5rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(max(min(100%, var(--min-thumb)), calc((100% - (var(--cols) - 1) * var(--gap)) / var(--cols))), 1fr)); gap: var(--gap); }
.wv-gallery.is-masonry { display: block; columns: var(--cols) var(--min-thumb); column-gap: var(--gap); }
.wv-gallery.is-masonry figure { break-inside: avoid; margin: 0 0 var(--gap); }
.wv-gallery a { display: block; overflow: hidden; border-radius: var(--img-radius, var(--radius)); }
.wv-gallery img { width: 100%; aspect-ratio: var(--ratio, 1 / 1); object-fit: cover; object-position: var(--focus, 50% 50%); border-radius: var(--img-radius, var(--radius)); transition: transform 0.4s ease; }
.wv-gallery a img { border-radius: 0; }
.wv-gallery a:hover img { transform: scale(1.04); }
.wv-gallery.is-masonry img { aspect-ratio: auto; }
.wv-slideshow { position: relative; container-type: inline-size; }
.wv-slides { position: relative; display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scroll-behavior: smooth; scrollbar-width: none; border-radius: var(--img-radius, var(--radius)); }
.wv-slides::-webkit-scrollbar { display: none; }
.wv-slide { position: relative; flex: 0 0 100%; margin: 0; overflow: hidden; scroll-snap-align: start; }
.wv-slide img { width: 100%; aspect-ratio: var(--ratio, 16 / 9); object-fit: cover; object-position: var(--focus, 50% 50%); }
.fit-whole .wv-slide { background: #101216; }
.fit-whole .wv-slide img { object-fit: contain; }
.wv-slide figcaption { position: absolute; inset: auto 0 0 0; padding: 3rem 1.5rem 1.25rem; color: #fff; font-weight: 600; font-size: 1.1rem; background: linear-gradient(transparent, rgb(0 0 0 / 0.65)); }
.kenburns .wv-slide img { animation: wv-kenburns 14s ease-in-out infinite alternate; }
@keyframes wv-kenburns { from { scale: 1; } to { scale: 1.12; } }
.wv-slide-btn { position: absolute; top: 50%; translate: 0 -50%; display: none; place-items: center; width: 2.75rem; height: 2.75rem; padding: 0; color: #15171c; background: rgb(255 255 255 / 0.88); border: 0; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 10px rgb(0 0 0 / 0.2); }
.js .wv-slide-btn { display: grid; }
.wv-prev { left: 0.85rem; }
.wv-next { right: 0.85rem; }
.wv-dots { display: flex; justify-content: center; gap: 0.5rem; margin-top: 0.85rem; }
.wv-dots:empty { display: none; }
.wv-dots button { width: 0.7rem; height: 0.7rem; padding: 0; background: currentColor; border: 0; border-radius: 50%; opacity: 0.3; cursor: pointer; }
.wv-dots button[aria-current="true"] { opacity: 1; }
@container (max-width: 560px) {
  .wv-slide img { aspect-ratio: var(--ratio-sm, var(--ratio, 16 / 9)); }
  .wv-slide figcaption { padding: 2rem 1rem 0.8rem; font-size: 0.95rem; }
  .wv-slide-btn { width: 2.25rem; height: 2.25rem; }
  .wv-prev { left: 0.5rem; }
  .wv-next { right: 0.5rem; }
}
.wv-video, .wv-map { overflow: hidden; aspect-ratio: var(--ratio, 16 / 9); border-radius: var(--img-radius, var(--radius)); background: color-mix(in srgb, currentColor 8%, transparent); }
.wv-video iframe, .wv-video video, .wv-map iframe { width: 100%; height: 100%; border: 0; object-fit: cover; }
.wv-video.align-center, .wv-map.align-center { margin-inline: auto; }
.wv-lightbox { width: min(94vw, 1200px); max-width: none; max-height: none; padding: 0; color: #fff; background: transparent; border: 0; overflow: visible; }
.wv-lightbox::backdrop { background: rgb(10 12 16 / 0.9); }
.wv-lightbox figure { display: grid; gap: 0.75rem; justify-items: center; }
.wv-lightbox img { max-height: 82vh; width: auto; border-radius: 8px; }
.wv-lightbox figcaption { text-align: center; }
.wv-lb-btn { position: fixed; display: grid; place-items: center; width: 3rem; height: 3rem; padding: 0; color: #fff; background: rgb(255 255 255 / 0.14); border: 0; border-radius: 50%; cursor: pointer; }
.wv-lb-btn:hover { background: rgb(255 255 255 / 0.26); }
.wv-lb-close { top: 1rem; right: 1rem; }
.wv-lb-prev { top: 50%; left: 1rem; translate: 0 -50%; }
.wv-lb-next { top: 50%; right: 1rem; translate: 0 -50%; }

/* ---------- Cards, tables, FAQ ---------- */
.wv-card { display: flex; flex-direction: column; height: 100%; overflow: hidden; color: var(--c-on-surface); background: var(--c-surface); border-radius: var(--radius); box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 10px 28px rgb(0 0 0 / 0.07); }
.wv-card > img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; object-position: var(--focus, 50% 50%); }
.wv-card-body { display: flex; flex: 1; flex-direction: column; gap: 0.75rem; padding: 1.5rem; }
.wv-card-body .wv-btn { margin-top: auto; align-self: flex-start; }
.wv-table-wrap { overflow-x: auto; }
.wv-table { width: 100%; border-collapse: collapse; }
.wv-table caption { padding-bottom: 0.6rem; font-weight: 600; text-align: left; }
.wv-table th, .wv-table td { padding: 0.7rem 0.9rem; text-align: left; vertical-align: top; border-bottom: 1px solid color-mix(in srgb, currentColor 16%, transparent); }
.wv-table thead th { color: var(--c-on-primary); background: var(--c-primary); }
.wv-table.striped tbody tr:nth-child(even) { background: color-mix(in srgb, currentColor 5%, transparent); }
.wv-faq details { padding-block: 1rem; border-bottom: 1px solid color-mix(in srgb, currentColor 16%, transparent); }
.wv-faq summary { display: flex; justify-content: space-between; gap: 1rem; font-weight: 700; font-size: 1.1rem; list-style: none; cursor: pointer; }
.wv-faq summary::-webkit-details-marker { display: none; }
.wv-faq summary::after { content: "+"; flex: none; font-size: 1.4rem; line-height: 1; color: var(--c-accent); }
.wv-faq details[open] summary::after { content: "\\2212"; }
.wv-faq details > p { margin-top: 0.75rem; }

/* ---------- Forms ---------- */
.wv-form { display: grid; gap: 1rem; }
.wv-form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr)); gap: 1rem; }
.wv-form label { display: grid; gap: 0.35rem; font-weight: 600; font-size: 0.95rem; }
.wv-form input, .wv-form textarea { width: 100%; padding: 0.75rem 0.9rem; font: inherit; font-weight: 400; color: var(--c-on-surface); background: var(--c-surface); border: 1.5px solid color-mix(in srgb, currentColor 25%, transparent); border-radius: calc(var(--radius) * 0.75); }
.wv-form input:focus, .wv-form textarea:focus { border-color: var(--c-primary); outline: 3px solid color-mix(in srgb, var(--c-primary) 25%, transparent); outline-offset: 0; }
.wv-form .wv-btn { justify-self: start; }

/* ---------- Dividers, spacers, scrolling text ---------- */
.wv-divider { width: 100%; margin: 0.25rem 0; border: 0; border-top: 2px solid color-mix(in srgb, currentColor 18%, transparent); }
.wv-divider--dashed { border-top-style: dashed; }
.wv-divider--dotted { border-top-style: dotted; border-top-width: 4px; }
.wv-divider--short { width: 5rem; border-top: 4px solid var(--c-accent); border-radius: 4px; }
.wv-divider--short.align-center { margin-inline: auto; }
.wv-divider.is-vertical { width: 0; height: var(--len, 8rem); margin: 0; align-self: flex-start; border-top: 0; border-left: 2px solid color-mix(in srgb, currentColor 18%, transparent); }
.wv-divider.is-vertical.align-center { align-self: center; margin-inline: 0; }
.wv-divider.is-vertical.align-right { align-self: flex-end; margin-left: 0; }
.wv-divider--dashed.is-vertical { border-left-style: dashed; }
.wv-divider--dotted.is-vertical { border-left-width: 4px; border-left-style: dotted; }
.wv-divider--short.is-vertical { height: var(--len, 3rem); border-left: 4px solid var(--c-accent); border-radius: 4px; }
.wv-divider.is-fill { height: auto; flex: 1 1 auto; min-height: 3rem; }
.wv-col:has(> .wv-divider.is-fill) { align-self: stretch; }
@media (max-width: 760px) {
  .wv-cols:not(.cols-1) .wv-divider.is-vertical:not(.wv-divider--short) { width: 100%; height: 0; min-height: 0; flex: none; align-self: stretch; border-left: 0; border-top: 2px solid color-mix(in srgb, currentColor 18%, transparent); }
  .wv-cols:not(.cols-1) .wv-divider--dashed.is-vertical { border-top-style: dashed; }
  .wv-cols:not(.cols-1) .wv-divider--dotted.is-vertical { border-top-width: 4px; border-top-style: dotted; }
  .wv-cols:not(.cols-1) .wv-divider--short.is-vertical { width: 5rem; height: 0; border-left: 0; border-top: 4px solid var(--c-accent); }
}
.wv-spacer--sm { height: 1rem; }
.wv-spacer--md { height: 2.5rem; }
.wv-spacer--lg { height: 4.5rem; }
.wv-spacer--xl { height: 7rem; }
.wv-ticker { overflow: hidden; padding-block: 0.8rem; white-space: nowrap; color: var(--c-on-accent); background: var(--c-accent); font-family: var(--font-heading); font-weight: var(--heading-weight); font-size: ${SIZES.lg}; }
.wv-ticker-track { display: inline-flex; animation: wv-ticker var(--speed, 30s) linear infinite; }
.wv-ticker-track span { flex: none; padding-inline-end: 3rem; }
.wv-ticker:hover .wv-ticker-track { animation-play-state: paused; }
@keyframes wv-ticker { to { transform: translateX(-50%); } }

/* ---------- Motion ---------- */
@media (prefers-reduced-motion: no-preference) {
  .js [data-anim] { opacity: 0; transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 0.7, 0.2, 1); }
  .js [data-anim="up"] { transform: translateY(2rem); }
  .js [data-anim="left"] { transform: translateX(-2.5rem); }
  .js [data-anim="right"] { transform: translateX(2.5rem); }
  .js [data-anim="zoom"] { transform: scale(0.92); }
  .js [data-anim].is-in { opacity: 1; transform: none; }
  .motion-float { animation: wv-float 4s ease-in-out infinite; }
  .motion-pulse { animation: wv-pulse 2.6s ease-in-out infinite; }
  .motion-spin { animation: wv-spin 20s linear infinite; }
  .motion-sway { animation: wv-sway 5s ease-in-out infinite; transform-origin: 50% 100%; }
}
@keyframes wv-float { 50% { translate: 0 -12px; } }
@keyframes wv-pulse { 50% { scale: 1.05; } }
@keyframes wv-spin { to { rotate: 360deg; } }
@keyframes wv-sway { 25% { rotate: 2deg; } 75% { rotate: -2deg; } }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}`;

function themeCss(site) {
  const t = site.theme, c = t.colors;
  const head = fontOf(t.fonts.heading), body = fontOf(t.fonts.body);
  const [radius, btnRadius] = THEME_RADIUS[t.radius] || THEME_RADIUS.soft;
  const lines = [':root {'];
  THEME_KEYS.forEach(k => lines.push(`  --c-${k}: ${c[k]};`));
  THEME_KEYS.forEach(k => lines.push(`  --c-on-${k}: ${k === 'background' || k === 'surface' ? (contrast(c[k], c.text) >= 4.5 ? 'var(--c-text)' : onColor(c[k])) : onColor(c[k])};`));
  lines.push(`  --c-link: ${contrast(c.primary, c.background) >= 3 ? 'var(--c-primary)' : 'var(--c-text)'};`);
  lines.push(`  --font-heading: ${head.stack};`);
  lines.push(`  --font-body: ${body.stack};`);
  lines.push(`  --heading-weight: ${head.weight || 700};`);
  lines.push(`  --radius: ${radius};`);
  lines.push(`  --btn-radius: ${btnRadius};`);
  lines.push('  --maxw: 1140px;');
  lines.push(`  color-scheme: ${luminance(c.background) < 0.2 ? 'dark' : 'light'};`);
  lines.push('}');
  return lines.join('\n');
}

function fontsHref(site) {
  const specs = [...new Set([site.theme.fonts.heading, site.theme.fonts.body].map(n => fontOf(n).g).filter(Boolean))];
  return specs.length ? 'https://fonts.googleapis.com/css2?' + specs.map(s => 'family=' + s).join('&') + '&display=swap' : '';
}

function rule(sel, decls) { return decls.length ? sel + ' { ' + decls.join('; ') + '; }' : ''; }

function partColors(site, part, bgVar, fgVar) {
  const bg = colorCss(part.bg) || 'var(--c-surface)';
  const fg = part.color ? colorCss(part.color) : (onColorCss(site, part.bg || 'surface') || 'var(--c-text)');
  return [bgVar + ': ' + bg, fgVar + ': ' + fg];
}

function sectionDecls(site, s, o) {
  const d = [];
  if (s.bgImage) {
    const ov = Math.max(0, Math.min(90, s.overlay == null ? 40 : +s.overlay)) / 100;
    d.push(`background-image: linear-gradient(rgb(0 0 0 / ${ov}), rgb(0 0 0 / ${ov})), url("${o.cssAssetUrl(s.bgImage)}")`);
    if (s.parallax) d.push('background-attachment: fixed');
  }
  if (s.bg && colorCss(s.bg)) d.push('background-color: ' + colorCss(s.bg));
  let fg = '';
  if (s.textColor === 'light') fg = '#ffffff';
  else if (s.textColor === 'dark') fg = '#15171c';
  else if (s.bgImage) fg = '#ffffff';
  else if (s.bg) fg = onColorCss(site, s.bg);
  if (fg) d.push('color: ' + fg);
  if (s.bg || s.bgImage) d.push('--c-link: currentColor');
  return d;
}

const TEXTY = new Set(['heading', 'text', 'quote', 'faq', 'table', 'form', 'ticker', 'button']);
function elementRules(site, el, o) {
  const st = el.style || {}, p = el.props || {}, d = [], extra = [];
  const sel = '.e-' + el.id;
  if (st.color && colorCss(st.color)) d.push('color: ' + colorCss(st.color));
  if (st.bg && colorCss(st.bg)) {
    if (el.type === 'ticker') d.push('background-color: ' + colorCss(st.bg));
    else d.push('background-color: ' + colorCss(st.bg));
    if (!st.color) d.push('color: ' + onColorCss(site, st.bg));
    if (!st.padding && el.type !== 'ticker') d.push('padding: ' + PADS.md);
  }
  if (st.size && SIZES[st.size] && TEXTY.has(el.type)) d.push('font-size: ' + SIZES[st.size]);
  if (st.padding && PADS[st.padding]) d.push('padding: ' + PADS[st.padding]);
  if (st.radius && RADII[st.radius] != null) {
    if (['image', 'gallery', 'slideshow', 'video', 'map'].includes(el.type)) d.push('--img-radius: ' + RADII[st.radius]);
    else { d.push('border-radius: ' + RADII[st.radius]); if (el.type === 'ticker' || el.type === 'card') d.push('overflow: hidden'); }
  }
  if (st.shadow) {
    if (el.type === 'image') extra.push(sel + ' img { box-shadow: ' + SHADOW + '; }');
    else d.push('box-shadow: ' + SHADOW);
  }
  const pct = Math.max(5, Math.min(100, Math.round(+st.width) || 100));
  if (st.width && pct < 100) {
    d.push('width: 100%');
    d.push('max-width: ' + pct + '%');
    extra.push('@media (max-width: 760px) { ' + sel + ' { max-width: 100%; } }');
  }
  if (el.type === 'gallery') {
    d.push('--cols: ' + Math.max(1, Math.min(6, +p.columns || 3)));
    d.push('--gap: ' + ({ none: '0px', sm: '0.4rem', md: '0.75rem', lg: '1.5rem' }[p.gap || 'md']));
    if (p.ratio && p.ratio !== 'original' && RATIOS[p.ratio]) d.push('--ratio: ' + RATIOS[p.ratio]);
  }
  if ((el.type === 'slideshow' || el.type === 'video' || el.type === 'map') && p.ratio && RATIOS[p.ratio]) d.push('--ratio: ' + RATIOS[p.ratio]);
  if (el.type === 'divider' && p.direction === 'vertical' && !p.fill && +p.length) d.push('--len: ' + Math.max(16, Math.min(800, Math.round(+p.length))) + 'px');
  if (el.type === 'slideshow') { const sm = { wide: '3 / 2', panorama: '16 / 9' }[p.ratio || 'wide']; if (sm) d.push('--ratio-sm: ' + sm); }
  if (['gallery', 'slideshow', 'image', 'card'].includes(el.type) && FOCUS[p.focus]) d.push('--focus: ' + FOCUS[p.focus]);
  const SHAPES = { square: '1 / 1', landscape: '4 / 3', portrait: '3 / 4', wide: '16 / 9', panorama: '21 / 9', circle: '1 / 1' };
  if (el.type === 'image' && SHAPES[p.shape]) extra.push(sel + ' img { aspect-ratio: ' + SHAPES[p.shape] + '; object-fit: cover; object-position: var(--focus, 50% 50%);' + (p.shape === 'circle' ? ' border-radius: 50%;' : '') + ' }');
  if (el.type === 'card' && SHAPES[p.imageShape] && p.imageShape !== 'landscape') extra.push(sel + ' > img { aspect-ratio: ' + SHAPES[p.imageShape] + '; }');
  if (el.type === 'spacer' && +p.height) d.push('height: ' + Math.max(4, Math.min(600, Math.round(+p.height))) + 'px');
  if (el.type === 'ticker') d.push('--speed: ' + ({ slow: '45s', normal: '28s', fast: '15s' }[p.speed || 'normal']));
  if (st.hideMobile) extra.push('@media (max-width: 760px) { ' + sel + ' { display: none; } }');
  const out = [];
  const main = rule(sel, d);
  if (main) out.push(main);
  return out.concat(extra);
}
const hasRules = (site, el, o) => elementRules(site, el, o).length > 0;

function buildCss(site, o, pages) {
  const parts = [
    '/* Generated by Pocket-Web-Studio. Edit your site in Pocket-Web-Studio to change these styles. */',
    '',
    '/* ---------- Your colours and fonts ---------- */',
    themeCss(site),
    '',
    BASE_CSS,
    '',
    '/* ---------- Header, footer and page sections ---------- */'
  ];
  parts.push(rule('.wv-header', partColors(site, site.header, '--h-bg', '--h-fg')));
  parts.push(rule('.wv-footer', partColors(site, Object.assign({ bg: 'text' }, site.footer), '--f-bg', '--f-fg')));
  if (hasJump(site)) { parts.push(JUMP_CSS.trim()); parts.push(rule('.wv-jump', partColors(site, Object.assign({ bg: 'primary' }, { bg: site.jump.bg || 'primary', color: site.jump.color || '' }), '--j-bg', '--j-fg'))); }
  if (site.header.show && site.header.sticky) parts.push('html { scroll-padding-top: 5.5rem; }');
  (pages || site.pages).forEach(page => {
    const lines = [];
    page.sections.forEach(s => {
      const r = rule('.e-' + s.id, sectionDecls(site, s, o));
      if (r) lines.push(r);
      s.columns.forEach(c => c.elements.forEach(el => elementRules(site, el, o).forEach(x => lines.push(x))));
    });
    if (lines.length) { parts.push('', '/* ' + String(page.name).replace(/\*\//g, '') + ' */'); parts.push(...lines); }
  });
  return parts.filter(x => x !== null && x !== undefined).join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
}

/* ------------------------------------------------------------------ */
/* JavaScript                                                          */
/* ------------------------------------------------------------------ */

// "Back to top" and "Go to bottom" buttons that stay in the corner of the screen
function hasJump(site) { const j = site.jump; return !!(j && (j.top || j.bottom)); }
const JUMP_CSS = `
/* ---------- Back to top and Go to bottom buttons ---------- */
.wv-jump { position: fixed; z-index: 40; bottom: max(1rem, env(safe-area-inset-bottom)); right: max(1rem, env(safe-area-inset-right)); display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
.wv-jump--left { right: auto; left: max(1rem, env(safe-area-inset-left)); align-items: flex-start; }
.wv-jump-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem; min-width: 2.75rem; height: 2.75rem; padding: 0 1rem 0 0.8rem; border-radius: 999px; background: var(--j-bg); color: var(--j-fg); font-weight: 600; font-size: 0.92rem; text-decoration: none; box-shadow: 0 4px 14px rgb(0 0 0 / 0.2); transition: opacity 0.25s, transform 0.25s, visibility 0.25s; }
.wv-jump-btn svg { width: 1.2rem; height: 1.2rem; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; flex: none; }
.wv-jump--icon .wv-jump-btn { width: 2.75rem; padding: 0; }
.wv-jump--icon .wv-jump-btn span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.wv-jump-btn:hover { color: var(--j-fg); transform: translateY(-2px); }
.wv-jump-btn:focus-visible { outline: 3px solid var(--c-accent); outline-offset: 3px; }
.wv-jump-btn.is-hidden { opacity: 0; visibility: hidden; transform: translateY(0.5rem); pointer-events: none; }
@media (max-width: 760px) { .wv-jump-btn { height: 2.5rem; min-width: 2.5rem; font-size: 0.85rem; } .wv-jump--icon .wv-jump-btn { width: 2.5rem; } }
@media print { .wv-jump { display: none; } }
`;
const JS_JUMP = `  // Back to top and Go to bottom buttons: shown only when they're useful
  const jump = document.querySelector('.wv-jump');
  if (jump) {
    const toTop = jump.querySelector('.wv-jump-top');
    const toEnd = jump.querySelector('.wv-jump-bottom');
    const end = document.getElementById('wv-page-end');
    const update = () => {
      const y = window.scrollY, room = document.documentElement.scrollHeight - window.innerHeight;
      const gap = Math.min(400, window.innerHeight * 0.6);
      if (toTop) toTop.classList.toggle('is-hidden', y < gap);
      if (toEnd) toEnd.classList.toggle('is-hidden', room < 200 || room - y < gap);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    const go = (e, y, focusOn) => {
      e.preventDefault();
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      if (focusOn) focusOn.focus({ preventScroll: true });
    };
    if (toTop) toTop.addEventListener('click', e => go(e, 0, document.querySelector('.wv-skip')));
    if (toEnd) toEnd.addEventListener('click', e => go(e, document.documentElement.scrollHeight, end));
  }`;
function renderJump(w, site, o) {
  if (!hasJump(site)) return;
  const j = site.jump;
  const svg = d => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + d + '"/></svg>';
  const cls = 'wv-jump wv-jump--' + (j.side === 'left' ? 'left' : 'right') + ' wv-jump--' + (j.look === 'text' ? 'text' : 'icon');
  if (!o.edit) w.line('<div id="wv-page-end" tabindex="-1"></div>');
  w.open('<div class="' + cls + '"' + (o.edit ? ' data-wv-part="jump"' : '') + '>');
  if (j.top) w.line('<a class="wv-jump-btn wv-jump-top" href="#top"' + (j.look === 'text' ? '' : ' title="' + escAttr(j.topText || 'Back to top') + '"') + '>' + svg('M12 19V5M6 11l6-6 6 6') + '<span>' + esc(j.topText || 'Back to top') + '</span></a>');
  if (j.bottom) w.line('<a class="wv-jump-btn wv-jump-bottom" href="#wv-page-end"' + (j.look === 'text' ? '' : ' title="' + escAttr(j.bottomText || 'Go to bottom') + '"') + '>' + svg('M12 5v14M6 13l6 6 6-6') + '<span>' + esc(j.bottomText || 'Go to bottom') + '</span></a>');
  w.close('</div>');
}

function siteFeatures(site) {
  const f = { nav: false, anim: false, slideshow: false, lightbox: false, jump: hasJump(site) };
  f.nav = site.header.show && site.pages.some(p => p.showInNav !== false) && site.pages.length > 0;
  site.pages.forEach(p => p.sections.forEach(s => s.columns.forEach(c => c.elements.forEach(el => {
    if (el.style && el.style.anim) f.anim = true;
    if (el.type === 'slideshow' && (el.props.slides || []).length > 1) f.slideshow = true;
    if (el.type === 'gallery' && el.props.lightbox && (el.props.images || []).length) f.lightbox = true;
  }))));
  return f;
}

const JS_NAV = `  // Mobile menu button
  const menuButton = document.querySelector('.wv-nav-toggle');
  const menu = document.getElementById('site-nav');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
  }`;

const JS_ANIM = `  // Appear-on-scroll effects
  const animated = document.querySelectorAll('[data-anim]');
  if (animated.length) {
    if (!('IntersectionObserver' in window) || reduceMotion) {
      animated.forEach(el => el.classList.add('is-in'));
    } else {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        }
      }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
      animated.forEach(el => observer.observe(el));
    }
  }`;

const JS_SLIDES = `  // Slideshows
  document.querySelectorAll('.wv-slideshow').forEach(show => {
    const track = show.querySelector('.wv-slides');
    const slides = track ? Array.from(track.children) : [];
    if (slides.length < 2) return;
    const dots = show.querySelector('.wv-dots');
    let index = 0;
    let timer = null;
    const dotButtons = [];
    const update = () => dotButtons.forEach((b, i) => b.setAttribute('aria-current', String(i === index)));
    const go = i => {
      index = (i + slides.length) % slides.length;
      track.scrollTo({ left: index * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
      update();
    };
    if (dots) {
      slides.forEach((slide, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Show slide ' + (i + 1));
        b.addEventListener('click', () => { go(i); restart(); });
        dots.appendChild(b);
        dotButtons.push(b);
      });
      update();
    }
    const prev = show.querySelector('.wv-prev');
    const next = show.querySelector('.wv-next');
    if (prev) prev.addEventListener('click', () => { go(index - 1); restart(); });
    if (next) next.addEventListener('click', () => { go(index + 1); restart(); });
    let scrollTimer = null;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { index = Math.round(track.scrollLeft / track.clientWidth); update(); }, 80);
    }, { passive: true });
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); restart(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); restart(); }
    });
    const seconds = parseFloat(show.dataset.autoplay || '0');
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { if (seconds > 0 && !reduceMotion && !timer) timer = setInterval(() => go(index + 1), seconds * 1000); };
    function restart() { stop(); start(); }
    show.addEventListener('mouseenter', stop);
    show.addEventListener('mouseleave', start);
    show.addEventListener('focusin', stop);
    show.addEventListener('focusout', start);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    start();
  });`;

const JS_LIGHTBOX = `  // Click-to-enlarge galleries
  const galleries = document.querySelectorAll('.wv-gallery[data-lightbox]');
  if (galleries.length && typeof HTMLDialogElement === 'function') {
    const icon = d => '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const box = document.createElement('dialog');
    box.className = 'wv-lightbox';
    box.setAttribute('aria-label', 'Enlarged image');
    box.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="wv-lb-btn wv-lb-prev" aria-label="Previous image">' + icon('M15 5l-7 7 7 7') + '</button>' +
      '<button type="button" class="wv-lb-btn wv-lb-next" aria-label="Next image">' + icon('M9 5l7 7-7 7') + '</button>' +
      '<button type="button" class="wv-lb-btn wv-lb-close" aria-label="Close">' + icon('M6 6l12 12M18 6L6 18') + '</button>';
    document.body.appendChild(box);
    const img = box.querySelector('img');
    const caption = box.querySelector('figcaption');
    let items = [];
    let current = 0;
    const show = i => {
      current = (i + items.length) % items.length;
      const link = items[current];
      const thumb = link.querySelector('img');
      img.src = link.href;
      img.alt = thumb ? thumb.alt : '';
      const cap = link.parentElement.querySelector('figcaption');
      caption.textContent = cap ? cap.textContent : '';
    };
    galleries.forEach(gallery => {
      const links = Array.from(gallery.querySelectorAll('a'));
      links.forEach((link, i) => link.addEventListener('click', e => {
        e.preventDefault();
        items = links;
        show(i);
        box.showModal();
      }));
    });
    box.querySelector('.wv-lb-prev').addEventListener('click', () => show(current - 1));
    box.querySelector('.wv-lb-next').addEventListener('click', () => show(current + 1));
    box.querySelector('.wv-lb-close').addEventListener('click', () => box.close());
    box.addEventListener('click', e => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }`;

function buildJs(site) {
  const f = siteFeatures(site);
  const blocks = [];
  if (f.nav) blocks.push(JS_NAV);
  if (f.anim) blocks.push(JS_ANIM);
  if (f.slideshow) blocks.push(JS_SLIDES);
  if (f.lightbox) blocks.push(JS_LIGHTBOX);
  if (f.jump) blocks.push(JS_JUMP);
  if (!blocks.length) return '';
  return '// Generated by Pocket-Web-Studio. Only the features your site uses are included.\n' +
    "(() => {\n  'use strict';\n  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n\n" +
    blocks.join('\n\n') + '\n})();\n';
}

/* ------------------------------------------------------------------ */
/* HTML                                                                */
/* ------------------------------------------------------------------ */

function ed(o, field, mode) {
  if (!o.edit) return '';
  let s = ' data-wv-field="' + field + '"';
  if (mode === 'rich') s += ' data-wv-rich contenteditable="true"';
  else s += ' contenteditable="plaintext-only"';
  if (mode === 'single') s += ' data-wv-single';
  return s;
}

function elAttrs(site, el, o, base, extra) {
  extra = extra || {};
  const st = el.style || {};
  const cls = [base];
  if (extra.cls) cls.push(...[].concat(extra.cls).filter(Boolean));
  if (st.align && st.align !== 'left') cls.push('align-' + st.align);
  if (st.motion) cls.push('motion-' + st.motion);
  if (hasRules(site, el, o)) cls.push('e-' + el.id);
  const a = Object.assign({ class: cls.join(' ') }, extra.attrs || {});
  if (st.anim && !o.edit) a['data-anim'] = st.anim;
  if (o.edit) a['data-wv'] = el.id;
  return attrs(a);
}

function imgTag(o, name, alt, extra) {
  const info = o.assetInfo(name) || {};
  let s = '<img src="' + escAttr(o.assetUrl(name)) + '" alt="' + escAttr(alt || '') + '"';
  if (info.w && info.h) s += ' width="' + info.w + '" height="' + info.h + '"';
  if (extra && extra.cls) s += ' class="' + extra.cls + '"';
  s += o.eager ? ' fetchpriority="high"' : ' loading="lazy"';
  s += ' decoding="async">';
  return s;
}

const ARROW = d => '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function editPlaceholder(w, site, el, o, label, base) {
  w.line('<div' + elAttrs(site, el, o, base || 'wv-' + el.type, { cls: 'wv-edit-empty' }) + '>' + esc(label) + '</div>');
}

const RENDER = {
  heading(w, site, el, o) {
    const lvl = Math.min(4, Math.max(1, +el.props.level || 2));
    const href = !o.edit && linkHref(site, el.props.link, o.files);
    const inner = href ? '<a href="' + escAttr(href) + '"' + (el.props.newTab ? ' target="_blank" rel="noopener"' : '') + '>' + textHtml(el.props.text) + '</a>' : textHtml(el.props.text);
    w.line('<h' + lvl + elAttrs(site, el, o, 'wv-heading') + ed(o, 'text', 'single') + '>' + inner + '</h' + lvl + '>');
  },
  text(w, site, el, o) {
    const html = o.edit ? (el.props.html || '<p><br></p>') : rewriteRichLinks(site, el.props.html, o.files);
    if (o.edit) { w.line('<div' + elAttrs(site, el, o, 'wv-text') + ed(o, 'html', 'rich') + '>' + html + '</div>'); return; }
    if (!html.trim()) return;
    w.open('<div' + elAttrs(site, el, o, 'wv-text') + '>');
    w.raw(html.replace(/<\/(p|ul|ol)>\s*(?=<)/g, '</$1>\n'));
    w.close('</div>');
  },
  button(w, site, el, o) {
    const p = el.props;
    const href = linkHref(site, p.link, o.files);
    const cls = 'wv-btn wv-btn--' + (p.variant || 'filled') + (p.size && p.size !== 'md' ? ' wv-btn--' + p.size : '');
    w.open('<div' + elAttrs(site, el, o, 'wv-button') + '>');
    if (href || o.edit) w.line('<a class="' + cls + '" href="' + escAttr(href || '#') + '"' + (p.newTab ? ' target="_blank" rel="noopener"' : '') + ed(o, 'text', 'single') + '>' + esc(p.text) + '</a>');
    else w.line('<span class="' + cls + '">' + esc(p.text) + '</span>');
    w.close('</div>');
  },
  image(w, site, el, o) {
    const p = el.props;
    if (!p.src) { if (o.edit) editPlaceholder(w, site, el, o, 'Choose a picture in the panel on the right', 'wv-image'); return; }
    const href = linkHref(site, p.link, o.files);
    w.open('<figure' + elAttrs(site, el, o, 'wv-image') + '>');
    const img = imgTag(o, p.src, p.alt);
    if (href && !o.edit) w.line('<a href="' + escAttr(href) + '"' + (p.newTab ? ' target="_blank" rel="noopener"' : '') + '>' + img + '</a>');
    else w.line(img);
    if (p.caption) w.line('<figcaption' + ed(o, 'caption', 'multi') + '>' + textHtml(p.caption) + '</figcaption>');
    w.close('</figure>');
  },
  gallery(w, site, el, o) {
    const p = el.props, imgs = (p.images || []).filter(i => i.src);
    if (!imgs.length) { if (o.edit) editPlaceholder(w, site, el, o, 'Add pictures to this gallery in the panel on the right'); return; }
    const lb = p.lightbox && !o.edit;
    w.open('<div' + elAttrs(site, el, o, 'wv-gallery', { cls: p.ratio === 'original' ? 'is-masonry' : null, attrs: { 'data-lightbox': lb ? true : null } }) + '>');
    imgs.forEach((im, i) => {
      w.open('<figure>');
      const tag = imgTag(o, im.src, im.alt);
      if (lb) w.line('<a href="' + escAttr(o.assetUrl(im.src)) + '" aria-label="' + escAttr('Enlarge ' + (im.alt ? '“' + im.alt + '”' : 'picture ' + (i + 1))) + '">' + tag + '</a>');
      else w.line(tag);
      if (im.caption) w.line('<figcaption' + ed(o, 'images.' + p.images.indexOf(im) + '.caption', 'single') + '>' + esc(im.caption) + '</figcaption>');
      w.close('</figure>');
    });
    w.close('</div>');
  },
  slideshow(w, site, el, o) {
    const p = el.props, slides = (p.slides || []).filter(s => s.src);
    if (!slides.length) { if (o.edit) editPlaceholder(w, site, el, o, 'Add pictures to this slideshow in the panel on the right'); return; }
    o.counts = o.counts || {};
    o.counts.slideshow = (o.counts.slideshow || 0) + 1;
    const label = p.label || ('Slideshow' + (o.counts.slideshow > 1 ? ' ' + o.counts.slideshow : ''));
    w.open('<section' + elAttrs(site, el, o, 'wv-slideshow', {
      cls: [p.kenburns ? 'kenburns' : null, p.fit === 'whole' ? 'fit-whole' : null],
      attrs: { 'aria-roledescription': 'carousel', 'aria-label': label, 'data-autoplay': (!o.edit && +p.autoplay) ? +p.autoplay : null }
    }) + '>');
    w.open('<div class="wv-slides"' + (o.edit ? '' : ' tabindex="0"') + '>');
    slides.forEach((s, i) => {
      w.open('<figure class="wv-slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + slides.length + '">');
      w.line(imgTag(Object.assign({}, o, { eager: o.eager && i === 0 }), s.src, s.alt));
      if (s.caption || o.edit) {
        if (s.caption) w.line('<figcaption' + ed(o, 'slides.' + p.slides.indexOf(s) + '.caption', 'single') + '>' + esc(s.caption) + '</figcaption>');
      }
      w.close('</figure>');
    });
    w.close('</div>');
    if (slides.length > 1 && p.arrows !== false) {
      w.line('<button type="button" class="wv-slide-btn wv-prev" aria-label="Previous slide">' + ARROW('M15 5l-7 7 7 7') + '</button>');
      w.line('<button type="button" class="wv-slide-btn wv-next" aria-label="Next slide">' + ARROW('M9 5l7 7-7 7') + '</button>');
    }
    if (slides.length > 1 && p.dots !== false && !o.edit) w.line('<div class="wv-dots"></div>');
    w.close('</section>');
  },
  video(w, site, el, o) {
    const p = el.props;
    const auto = !!p.autoplay;
    if (p.source === 'file' && p.file) {
      w.open('<div' + elAttrs(site, el, o, 'wv-video') + '>');
      w.line('<video src="' + escAttr(o.assetUrl(p.file)) + '"' + (p.controls !== false ? ' controls' : '') + (auto ? ' autoplay muted' : (p.muted ? ' muted' : '')) + (p.loop ? ' loop' : '') + ' playsinline preload="metadata"' + (p.title ? ' aria-label="' + escAttr(p.title) + '"' : '') + '></video>');
      w.close('</div>');
      return;
    }
    const emb = p.source !== 'file' ? videoEmbed(p.url, auto) : null;
    if (!emb) { if (o.edit) editPlaceholder(w, site, el, o, p.source === 'file' ? 'Choose a video file in the panel on the right' : 'Paste a YouTube or Vimeo link in the panel on the right'); return; }
    w.open('<div' + elAttrs(site, el, o, 'wv-video') + '>');
    w.line('<iframe src="' + escAttr(emb.src) + '" title="' + escAttr(p.title || emb.kind + ' video') + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>');
    w.close('</div>');
  },
  table(w, site, el, o) {
    const p = el.props, rows = p.rows || [];
    if (!rows.length) { if (o.edit) editPlaceholder(w, site, el, o, 'Empty table'); return; }
    w.open('<div' + elAttrs(site, el, o, 'wv-table-wrap') + '>');
    w.open('<table class="wv-table' + (p.striped ? ' striped' : '') + '">');
    if (p.caption) w.line('<caption>' + esc(p.caption) + '</caption>');
    let start = 0;
    if (p.header && rows.length) {
      w.open('<thead>');
      w.line('<tr>' + rows[0].map((c, j) => '<th scope="col"' + ed(o, 'rows.0.' + j, 'multi') + '>' + textHtml(c) + '</th>').join('') + '</tr>');
      w.close('</thead>');
      start = 1;
    }
    if (rows.length > start) {
      w.open('<tbody>');
      for (let i = start; i < rows.length; i++) w.line('<tr>' + rows[i].map((c, j) => '<td' + ed(o, 'rows.' + i + '.' + j, 'multi') + '>' + textHtml(c) + '</td>').join('') + '</tr>');
      w.close('</tbody>');
    }
    w.close('</table>');
    w.close('</div>');
  },
  card(w, site, el, o) {
    const p = el.props;
    const href = linkHref(site, p.link, o.files);
    w.open('<article' + elAttrs(site, el, o, 'wv-card') + '>');
    if (p.image) w.line(imgTag(o, p.image, p.alt));
    w.open('<div class="wv-card-body">');
    if (p.title || o.edit) w.line('<h3' + ed(o, 'title', 'single') + '>' + esc(p.title) + '</h3>');
    if (p.text || o.edit) w.line('<p' + ed(o, 'text', 'multi') + '>' + textHtml(p.text) + '</p>');
    if (p.buttonText && (href || o.edit)) w.line('<a class="wv-btn wv-btn--outline wv-btn--sm" href="' + escAttr(href || '#') + '"' + (p.newTab ? ' target="_blank" rel="noopener"' : '') + ed(o, 'buttonText', 'single') + '>' + esc(p.buttonText) + '</a>');
    w.close('</div>');
    w.close('</article>');
  },
  quote(w, site, el, o) {
    const p = el.props;
    w.open('<figure' + elAttrs(site, el, o, 'wv-quote') + '>');
    w.line('<blockquote><p' + ed(o, 'text', 'multi') + '>' + textHtml(p.text) + '</p></blockquote>');
    if (p.cite || o.edit) w.line('<figcaption' + ed(o, 'cite', 'single') + '>' + esc(p.cite) + '</figcaption>');
    w.close('</figure>');
  },
  faq(w, site, el, o) {
    const p = el.props, items = p.items || [];
    if (!items.length) { if (o.edit) editPlaceholder(w, site, el, o, 'Add questions in the panel on the right'); return; }
    w.open('<div' + elAttrs(site, el, o, 'wv-faq') + '>');
    items.forEach((it, i) => {
      w.open('<details' + (p.single ? ' name="faq-' + el.id + '"' : '') + (o.edit && i === 0 ? ' open' : '') + '>');
      w.line('<summary' + ed(o, 'items.' + i + '.q', 'single') + '>' + esc(it.q) + '</summary>');
      w.line('<p' + ed(o, 'items.' + i + '.a', 'multi') + '>' + textHtml(it.a) + '</p>');
      w.close('</details>');
    });
    w.close('</div>');
  },
  form(w, site, el, o) {
    const p = el.props;
    const fields = (p.fields || []).filter(f => f.on);
    const a = { method: 'post' };
    if (p.mode === 'service' && /^https:\/\//i.test(p.action || '')) a.action = p.action.trim();
    else if (p.mode !== 'service' && p.email) { a.action = 'mailto:' + p.email.trim(); a.enctype = 'text/plain'; }
    w.open('<form' + elAttrs(site, el, o, 'wv-form', { attrs: a }) + '>');
    const short = fields.filter(f => f.key !== 'message');
    const id = k => 'f-' + el.id + '-' + k;
    const TYPES = { name: ['text', 'name'], email: ['email', 'email'], phone: ['tel', 'tel'], subject: ['text', 'off'] };
    if (short.length) {
      w.open('<div class="wv-form-row">');
      short.forEach(f => {
        const t = TYPES[f.key] || ['text', 'off'];
        w.line('<label>' + esc(f.label) + (f.required ? '' : ' <small>(optional)</small>') + '<input id="' + id(f.key) + '" name="' + f.key + '" type="' + t[0] + '"' + (t[1] !== 'off' ? ' autocomplete="' + t[1] + '"' : '') + (f.required ? ' required' : '') + '></label>');
      });
      w.close('</div>');
    }
    const msg = fields.find(f => f.key === 'message');
    if (msg) w.line('<label>' + esc(msg.label) + (msg.required ? '' : ' <small>(optional)</small>') + '<textarea id="' + id('message') + '" name="message" rows="5"' + (msg.required ? ' required' : '') + '></textarea></label>');
    w.line('<button class="wv-btn" type="submit"' + ed(o, 'submitText', 'single') + '>' + esc(p.submitText || 'Send') + '</button>');
    w.close('</form>');
  },
  map(w, site, el, o) {
    const p = el.props;
    if (!p.address) { if (o.edit) editPlaceholder(w, site, el, o, 'Type an address in the panel on the right'); return; }
    const src = 'https://maps.google.com/maps?q=' + encodeURIComponent(p.address) + '&z=' + (+p.zoom || 15) + '&output=embed';
    w.open('<div' + elAttrs(site, el, o, 'wv-map') + '>');
    w.line('<iframe src="' + escAttr(src) + '" title="Map showing ' + escAttr(p.address) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>');
    w.close('</div>');
  },
  ticker(w, site, el, o) {
    const p = el.props;
    if (o.edit) { w.line('<div' + elAttrs(site, el, o, 'wv-ticker') + '><div class="wv-ticker-track"><span' + ed(o, 'text', 'single') + '>' + esc(p.text) + '</span></div></div>'); return; }
    w.open('<div' + elAttrs(site, el, o, 'wv-ticker', { attrs: { role: 'marquee', 'aria-label': p.text } }) + '>');
    w.line('<div class="wv-ticker-track" aria-hidden="true">' + new Array(8).fill('<span>' + esc(p.text) + '</span>').join('') + '</div>');
    w.close('</div>');
  },
  link(w, site, el, o) {
    const p = el.props;
    const href = linkHref(site, p.link, o.files);
    const arrow = p.arrow !== false ? ' <span aria-hidden="true">\u2192</span>' : '';
    const text = '<span' + ed(o, 'text', 'single') + '>' + esc(p.text) + '</span>';
    if (href || o.edit) w.line('<p' + elAttrs(site, el, o, 'wv-link') + '><a href="' + escAttr(href || '#') + '"' + (p.newTab ? ' target="_blank" rel="noopener"' : '') + '>' + text + arrow + '</a></p>');
    else w.line('<p' + elAttrs(site, el, o, 'wv-link') + '>' + text + '</p>');
  },
  divider(w, site, el, o) {
    const vert = el.props.direction === 'vertical';
    w.line('<hr' + elAttrs(site, el, o, 'wv-divider wv-divider--' + (el.props.variant || 'line'), vert ? { cls: ['is-vertical', el.props.fill ? 'is-fill' : null], attrs: { 'aria-orientation': 'vertical' } } : undefined) + '>');
  },
  spacer(w, site, el, o) {
    w.line('<div' + elAttrs(site, el, o, 'wv-spacer wv-spacer--' + (el.props.size || 'md'), { attrs: { 'aria-hidden': 'true' } }) + '></div>');
  },
  html(w, site, el, o) {
    const code = String(el.props.code || '').replace(ASSET_TOKEN, (m, n) => o.assetUrl(n));
    w.open('<div' + elAttrs(site, el, o, 'wv-embed') + '>');
    if (o.edit) w.line(code.replace(/<script[\s\S]*?<\/script>/gi, '') || '');
    else w.raw(code);
    w.close('</div>');
  }
};

function renderElement(w, site, el, o) {
  const fn = RENDER[el.type];
  if (!fn) return;
  if (!o.capture) { fn(w, site, el, o); return; }
  const t = new Writer(); t.d = w.d;
  fn(t, site, el, o);
  o.capture.set(el.id, t.toString());
  t.out.forEach(l => w.out.push(l));
}

function renderSection(w, site, s, o) {
  const cls = ['wv-section', 'pad-' + (s.padding || 'md')];
  if (s.width && s.width !== 'contained') cls.push('width-' + s.width);
  if (s.height && s.height !== 'auto') cls.push('height-' + s.height);
  if (sectionDecls(site, s, o).length) cls.push('e-' + s.id);
  const a = { class: cls.join(' '), id: s.anchor ? slugify(s.anchor) : null };
  if (o.edit) a['data-wv-section'] = s.id;
  if (s.label && !o.edit) a['aria-label'] = s.label;
  w.open('<section' + attrs(a) + '>');
  const layout = LAYOUTS[s.layout] ? s.layout : '1';
  const v = s.valign && s.valign !== 'top' ? ' valign-' + s.valign : '';
  const lines = s.colLines && (LAYOUTS[layout] || 1) > 1 ? ' col-lines' + (s.colLines !== 'line' ? ' col-lines--' + s.colLines : '') : '';
  w.open('<div class="wv-container wv-cols cols-' + layout + v + lines + '">');
  s.columns.forEach((c, i) => {
    w.open('<div class="wv-col"' + (o.edit ? ' data-wv-col="' + s.id + ':' + i + '"' : '') + '>');
    c.elements.forEach(el => renderElement(w, site, el, o));
    if (o.edit && !c.elements.length) w.line('<div class="wv-drop-hint">Drag elements here</div>');
    w.close('</div>');
  });
  w.close('</div>');
  w.close('</section>');
}

function navPages(site) { return site.pages.filter(p => p.showInNav !== false); }
// Menu items with one level of drop-downs: pages placed under another page, plus extra menu links.
function navTree(site) {
  const pages = navPages(site);
  const byId = new Map(pages.map(p => [p.id, p]));
  const isChild = p => !!(p.parent && p.parent !== p.id && byId.has(p.parent) && !(byId.get(p.parent).parent && byId.has(byId.get(p.parent).parent)));
  const top = [], slots = new Map();
  pages.forEach(p => { if (!isChild(p)) { const t = { page: p, children: [] }; top.push(t); slots.set(p.id, t); } });
  pages.forEach(p => { if (isChild(p) && slots.has(p.parent)) slots.get(p.parent).children.push({ page: p }); });
  ((site.header && site.header.menuLinks) || []).filter(l => l && l.label).forEach(l => {
    const item = { link: l, children: [] };
    if (l.parent && slots.has(l.parent)) slots.get(l.parent).children.push(item); else top.push(item);
  });
  return top;
}
function navAnchor(site, item, page, files) {
  if (item.page) return '<a href="' + files[item.page.id] + '"' + (item.page === page ? ' aria-current="page"' : '') + '>' + esc(item.page.name) + '</a>';
  const href = linkHref(site, item.link.link, files) || '#';
  return '<a href="' + escAttr(href) + '"' + (item.link.newTab ? ' target="_blank" rel="noopener"' : '') + '>' + esc(item.link.label) + '</a>';
}

function renderHeader(w, site, page, o) {
  const h = site.header;
  if (!h.show) return;
  const files = o.files;
  const cls = ['wv-header'];
  if (h.sticky) cls.push('is-sticky');
  if (h.layout === 'center') cls.push('layout-center');
  w.open('<header class="' + cls.join(' ') + '"' + (o.edit ? ' data-wv-part="header"' : '') + '>');
  w.open('<div class="wv-container wv-header-inner">');
  const logoImg = h.logoImage ? imgTag(Object.assign({}, o, { eager: true }), h.logoImage, h.logoText ? '' : site.name) : '';
  const logoText = h.logoText ? '<span' + ed(o, 'logoText', 'single') + '>' + esc(h.logoText) + '</span>' : '';
  w.line('<a class="wv-logo" href="' + files[site.pages[0].id] + '"' + (!h.logoText && !h.logoImage ? ' aria-label="' + escAttr(site.name) + '"' : '') + '>' + logoImg + (logoText || (!logoImg ? esc(site.name) : '')) + '</a>');
  const nav = navTree(site);
  if (nav.length) {
    w.line('<button class="wv-nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="wv-burger" aria-hidden="true"></span>Menu</button>');
    w.open('<nav id="site-nav" class="wv-nav" aria-label="Main">');
    w.open('<ul>');
    nav.forEach(item => {
      if (!item.children || !item.children.length) { w.line('<li>' + navAnchor(site, item, page, files) + '</li>'); return; }
      const current = item.children.some(c => c.page === page);
      w.open('<li class="has-sub' + (current ? ' is-current' : '') + '">');
      w.line(navAnchor(site, item, page, files));
      w.open('<ul class="wv-sub">');
      item.children.forEach(c => w.line('<li>' + navAnchor(site, c, page, files) + '</li>'));
      w.close('</ul>');
      w.close('</li>');
    });
    w.close('</ul>');
    w.close('</nav>');
  }
  w.close('</div>');
  w.close('</header>');
}

function renderFooter(w, site, page, o) {
  const f = site.footer;
  if (!f.show) return;
  w.open('<footer class="wv-footer"' + (o.edit ? ' data-wv-part="footer"' : '') + '>');
  w.open('<div class="wv-container wv-footer-inner">');
  const text = o.edit ? f.text : String(f.text || '').replace(/\{year\}/g, String(o.year || new Date().getFullYear()));
  w.line('<p' + ed(o, 'text', 'multi') + '>' + textHtml(text) + '</p>');
  const nav = navPages(site);
  if (f.showNav && nav.length > 1) {
    w.open('<nav aria-label="Footer">');
    w.open('<ul>');
    nav.forEach(p => w.line('<li><a href="' + o.files[p.id] + '">' + esc(p.name) + '</a></li>'));
    w.close('</ul>');
    w.close('</nav>');
  }
  w.close('</div>');
  w.close('</footer>');
}

function renderBody(site, page, o) {
  const w = new Writer();
  o = Object.assign({}, o, { files: o.files || pageFiles(site) });
  if (!o.edit) w.line('<a class="wv-skip" href="#main">Skip to content</a>');
  renderHeader(w, site, page, o);
  w.open('<main id="main"' + (o.edit ? ' data-wv-main' : '') + '>');
  if (o.edit && !page.sections.length) w.line('<div class="wv-empty-page">This page is empty. Drag a section or an element here from the left.</div>');
  o.counts = {};
  page.sections.forEach((s, i) => { const so = Object.assign({}, o, { eager: i === 0 }); renderSection(w, site, s, so); });
  w.close('</main>');
  renderFooter(w, site, page, o);
  renderJump(w, site, o);
  return w.toString();
}

function pageDocument(site, page, o, inc) {
  const lang = (site.settings && site.settings.language) || 'en';
  const title = pageTitle(site, page);
  const desc = page.description || '';
  const fonts = fontsHref(site);
  const w = new Writer();
  w.line('<!DOCTYPE html>');
  w.open('<html lang="' + escAttr(lang) + '">');
  w.open('<head>');
  w.line('<meta charset="utf-8">');
  w.line('<meta name="viewport" content="width=device-width, initial-scale=1">');
  w.line('<title>' + esc(title) + '</title>');
  if (desc) w.line('<meta name="description" content="' + escAttr(desc) + '">');
  w.line('<meta property="og:title" content="' + escAttr(title) + '">');
  if (desc) w.line('<meta property="og:description" content="' + escAttr(desc) + '">');
  w.line('<meta property="og:type" content="website">');
  const base = siteUrl(site);
  if (base && o.absolute) {
    const url = base + '/' + (o.files[page.id] === 'index.html' ? '' : o.files[page.id]);
    w.line('<meta property="og:url" content="' + escAttr(url) + '">');
    const pic = firstPicture(page);
    if (pic) w.line('<meta property="og:image" content="' + escAttr(isUrl(pic) ? pic : base + '/' + o.assetUrl(pic)) + '">');
    w.line('<link rel="canonical" href="' + escAttr(url) + '">');
  }
  w.line('<meta name="theme-color" content="' + escAttr(site.theme.colors.primary) + '">');
  w.line('<meta name="generator" content="Pocket-Web-Studio">');
  if (site.settings && site.settings.favicon) w.line('<link rel="icon" href="' + escAttr(o.assetUrl(site.settings.favicon)) + '">');
  if (fonts) {
    w.line('<link rel="preconnect" href="https://fonts.googleapis.com">');
    w.line('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>');
    w.line('<link rel="stylesheet" href="' + escAttr(fonts) + '">');
  }
  w.line('<script>document.documentElement.classList.add("js");<\/script>');
  if (inc.inlineCss != null) { w.open('<style>'); w.raw(inc.inlineCss.trimEnd()); w.close('</style>'); }
  else w.line('<link rel="stylesheet" href="' + inc.cssHref + '">');
  if (inc.inlineCss == null && customCss(site, o)) w.line('<link rel="stylesheet" href="css/custom.css">');
  if (inc.jsHref) w.line('<script src="' + inc.jsHref + '" defer><\/script>');
  if (!inc.inlineJs && inc.cssHref && customJs(site)) w.line('<script src="js/custom.js" defer><\/script>');
  w.close('</head>');
  w.open('<body>');
  w.raw(renderBody(site, page, o));
  if (inc.inlineJs) { w.open('<script>'); w.raw(inc.inlineJs.trimEnd()); w.close('<\/script>'); }
  if (inc.inlineCustomJs) { w.open('<script>'); w.raw(inc.inlineCustomJs.trimEnd().replace(/<\/script/gi, '<\\/script')); w.close('<\/script>'); }
  w.close('</body>');
  w.close('</html>');
  return w.toString() + '\n';
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

// Your own CSS and JavaScript (Code view › custom.css / custom.js). Pictures can be used as ezy-asset:NAME.
function customCss(site, o) {
  const css = String((site.custom && site.custom.css) || '');
  if (!css.trim()) return '';
  const url = (o && (o.cssAssetUrl || o.assetUrl)) || (n => n);
  return css.replace(ASSET_TOKEN, (m, n) => url(n));
}
function customJs(site) {
  const js = String((site.custom && site.custom.js) || '');
  return js.trim() ? js : '';
}

// The finished HTML of a page, split into its parts, so the Code view can tell
// which sections and elements someone changed.
function pageFragments(site, page, o) {
  o = exportOpts(o || {});
  o.files = pageFiles(site);
  const capture = new Map();
  const hw = new Writer(); renderHeader(hw, site, page, o);
  const fw = new Writer(); renderFooter(fw, site, page, o);
  const so = Object.assign({}, o, { counts: {}, capture });
  const sections = page.sections.map((s, i) => {
    const w = new Writer();
    renderSection(w, site, s, Object.assign({}, so, { eager: i === 0 }));
    return { id: s.id, html: w.toString(), elements: s.columns.map(c => c.elements.map(el => ({ id: el.id, html: capture.get(el.id) || '' }))) };
  });
  return { title: pageTitle(site, page), description: page.description || '', header: hw.toString(), footer: fw.toString(), sections };
}

function cleanDomain(d) {
  return String(d || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').replace(/[/?#].*$/, '').replace(/\.$/, '');
}
function siteUrl(site) {
  const d = cleanDomain(site.settings && site.settings.domain);
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(d) ? 'https://' + d : '';
}
function firstPicture(page) {
  for (const s of page.sections) {
    if (s.bgImage) return s.bgImage;
    for (const c of s.columns) for (const el of c.elements) {
      const p = el.props || {};
      const src = p.src || p.image || (p.slides && p.slides[0] && p.slides[0].src) || (p.images && p.images[0] && p.images[0].src);
      if (src && !/\.svg$/i.test(src)) return src;
    }
  }
  return null;
}
function exportOpts(o) {
  const info = o.assetInfo || (() => null);
  return {
    edit: false,
    assetInfo: info,
    assetUrl: n => exportPath(n, info(n)),
    cssAssetUrl: n => isUrl(n) ? n : '../' + exportPath(n, info(n)),
    year: o.year,
    absolute: true
  };
}

// Every file of the finished website: { files: {path: text}, assets: {path: assetName} }
function generateSite(site, o) {
  o = exportOpts(o || {});
  const files = pageFiles(site);
  o.files = files;
  const out = {};
  const js = buildJs(site);
  site.pages.forEach(p => { out[files[p.id]] = pageDocument(site, p, o, { cssHref: 'css/style.css', jsHref: js ? 'js/site.js' : null }); });
  out['css/style.css'] = buildCss(site, o);
  if (js) out['js/site.js'] = js;
  const ccss = customCss(site, o), cjs = customJs(site);
  if (ccss) out['css/custom.css'] = ccss.trimEnd() + '\n';
  if (cjs) out['js/custom.js'] = cjs.trimEnd() + '\n';
  const base = siteUrl(site);
  if (base) {
    const day = new Date().toISOString().slice(0, 10);
    out['sitemap.xml'] = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      site.pages.map(p => '  <url><loc>' + esc(base + '/' + (files[p.id] === 'index.html' ? '' : files[p.id])) + '</loc><lastmod>' + day + '</lastmod></url>').join('\n') + '\n</urlset>\n';
    out['robots.txt'] = 'User-agent: *\nAllow: /\n\nSitemap: ' + base + '/sitemap.xml\n';
    if (site.settings.host === 'github') out['CNAME'] = cleanDomain(site.settings.domain) + '\n';
  }
  const assets = {};
  usedAssets(site).filter(n => !isUrl(n)).forEach(n => { assets[exportPath(n, o.assetInfo(n))] = n; });
  return { files: out, assets };
}

// What the visual editor's canvas shows for one page.
function renderEditPage(site, page, o) {
  const opts = Object.assign({ edit: true, files: pageFiles(site) }, o, { edit: true });
  if (!opts.cssAssetUrl) opts.cssAssetUrl = opts.assetUrl;
  return { css: buildCss(site, opts, [page]) + (customCss(site, opts) ? '\n/* Your own CSS */\n' + customCss(site, opts) : ''), body: renderBody(site, page, opts), fontsHref: fontsHref(site) };
}

// A single self-contained page (inline CSS and JS) for previews.
function renderPreviewPage(site, page, o) {
  const opts = Object.assign({}, o, { edit: false, files: pageFiles(site) });
  if (!opts.cssAssetUrl) opts.cssAssetUrl = opts.assetUrl;
  const ccss = customCss(site, opts);
  return pageDocument(site, page, opts, { inlineCss: buildCss(site, opts) + (ccss ? '\n/* Your own CSS */\n' + ccss : ''), inlineJs: buildJs(site), inlineCustomJs: customJs(site) });
}

// Friendly checks before publishing.
function checkSite(site, assetInfo) {
  const issues = [];
  const files = pageFiles(site);
  const add = (level, text, page, id) => issues.push({ level, text, pageId: page && page.id, id: id || null });
  if (!siteUrl(site)) issues.push({ level: 'info', text: 'No website address (domain) is set. Add one in Design › Website so search engines get a sitemap and the right links.', pageId: null, id: null, action: 'domain' });
  site.pages.forEach(page => {
    if (!page.sections.some(s => s.columns.some(c => c.elements.length))) add('warn', `The page “${page.name}” has nothing on it yet.`, page);
    if (!page.description) add('info', `The page “${page.name}” has no description for search engines.`, page);
    page.sections.forEach(s => s.columns.forEach(c => c.elements.forEach(el => {
      const p = el.props || {};
      if (el.type === 'image' && p.src && !p.alt) add('warn', `A picture on “${page.name}” has no description (alt text) for people using screen readers.`, page, el.id);
      if (el.type === 'image' && /^placeholder-/.test(p.src || '')) add('info', `A sample picture on “${page.name}” hasn't been replaced yet.`, page, el.id);
      if (el.type === 'card' && p.image && !p.alt && !/^placeholder-/.test(p.image)) add('info', `A card picture on “${page.name}” has no description (alt text).`, page, el.id);
      if (el.type === 'gallery' || el.type === 'slideshow') {
        const list = (el.type === 'gallery' ? p.images : p.slides) || [];
        const missing = list.filter(i => i.src && !i.alt && !/^placeholder-/.test(i.src)).length;
        if (missing) add('warn', `${missing} picture${missing > 1 ? 's' : ''} in a ${el.type} on “${page.name}” ${missing > 1 ? 'have' : 'has'} no description (alt text).`, page, el.id);
        if (list.some(i => /^placeholder-/.test(i.src || ''))) add('info', `A ${el.type} on “${page.name}” still has sample pictures.`, page, el.id);
      }
      if ((el.type === 'button') && !linkHref(site, p.link, files)) add('warn', `The button “${p.text}” on “${page.name}” doesn't go anywhere yet.`, page, el.id);
      if (el.type === 'form') {
        const ok = p.mode === 'service' ? /^https:\/\//i.test(p.action || '') : !!p.email;
        if (!ok) add('warn', `The contact form on “${page.name}” has no email address or form service, so messages won't reach you.`, page, el.id);
        else if (p.mode !== 'service') add('info', `The contact form on “${page.name}” opens the visitor's email app. A form service delivers messages more reliably.`, page, el.id);
      }
      if (el.type === 'video' && !(p.source === 'file' ? p.file : videoEmbed(p.url))) add('warn', `A video on “${page.name}” has no video chosen.`, page, el.id);
      if (el.type === 'map' && !p.address) add('warn', `A map on “${page.name}” has no address.`, page, el.id);
    })));
  });
  return issues;
}

return {
  THEME_KEYS, THEME_LABELS, PALETTES, FONTS, FONT_PAIRS, SIZES, LAYOUTS, RATIOS,
  generateSite, renderEditPage, renderPreviewPage, buildCss, buildJs, checkSite,
  pageFiles, pageTitle, usedAssets, pageFragments, hasJump, customCss, customJs, linkHref, exportPath, isUrl, navTree, siteUrl, cleanDomain, fontsHref, videoEmbed, slugify,
  colorCss, resolveHex, onColor, contrast, luminance, validHex, mixHex, esc, escAttr
};
}));
