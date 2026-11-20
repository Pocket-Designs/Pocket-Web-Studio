// Pocket-Web-Studio — turns HTML edited in the Code view back into the design.
// Copyright (c) 2026 Pocket-Designs. MIT licence, see LICENSE.
//
// How it works: the page is rendered again, piece by piece (each section and each
// element). Every piece of the edited code that is exactly the same as before keeps
// its original section or element, with all its settings. Changed pieces are turned
// back into design elements where possible (headings, text, buttons, links, pictures,
// quotes, lines, spaces). Anything else is kept as "Own code", so nothing is lost.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PocketCodeSync = factory();
}(typeof self !== 'undefined' ? self : this, function () {
'use strict';

const RICH_BLOCKS = new Set(['P', 'UL', 'OL']);
const LAYOUT_BY_COUNT = { 1: '1', 2: '1-1', 3: '1-1-1', 4: '1-1-1-1' };
const LAYOUTS = ['1', '1-1', '1-2', '2-1', '1-1-1', '1-1-1-1'];

// Same markup written differently (spacing, attribute quotes) counts as unchanged.
function normNode(node) {
  const c = node.cloneNode(true);
  (function strip(n) {
    if (n.nodeType === 1 && /^(PRE|TEXTAREA|SCRIPT|STYLE)$/.test(n.tagName)) return;
    Array.from(n.childNodes).forEach(ch => {
      if (ch.nodeType === 3) { if (!ch.nodeValue.trim()) ch.remove(); else ch.nodeValue = ch.nodeValue.replace(/\s+/g, ' ').trim(); }
      else if (ch.nodeType === 8) ch.remove();
      else strip(ch);
    });
  })(c);
  return c.nodeType === 1 ? c.outerHTML : String(c.nodeValue || '').trim();
}
function nodesOf(doc, html) {
  const box = doc.createElement('template');
  box.innerHTML = html;
  return Array.from(box.content.childNodes).filter(n => n.nodeType === 1 || (n.nodeType === 3 && n.nodeValue.trim()));
}
function normHtml(doc, html) { return nodesOf(doc, html).map(normNode).join(''); }

function textWithBreaks(node) {
  let out = '';
  node.childNodes.forEach(c => {
    if (c.nodeType === 3) out += c.nodeValue;
    else if (c.nodeType === 1 && c.tagName === 'BR') out += '\n';
    else if (c.nodeType === 1) out += textWithBreaks(c);
  });
  return out.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').trim();
}
const classOf = (n, prefix) => { const c = Array.from(n.classList || []).find(x => x.startsWith(prefix)); return c ? c.slice(prefix.length) : ''; };

/**
 * Apply an edited page document to a page.
 * ctx: { Gen, T, ctx (ids/placeholders), assetInfo(name), assetNames: [names], sanitizeRich(html), parse(html) → Document }
 * Returns { sections, title, description, notes: [text], changed }
 */
function applyPage(site, page, editedHtml, ctx) {
  const { Gen, T } = ctx;
  const parse = ctx.parse || (h => new DOMParser().parseFromString(h, 'text/html'));
  const doc = parse(editedHtml);
  const notes = [];
  const main = doc.querySelector('main');
  if (!main) throw new Error('The page needs its <main> … </main> part. Put it back, or press Undo my changes.');

  const frag = Gen.pageFragments(site, page, { assetInfo: ctx.assetInfo });
  const files = Gen.pageFiles(site);
  const fileToPage = {};
  Object.keys(files).forEach(id => { fileToPage[files[id]] = id; });
  const pathToAsset = {};
  (ctx.assetNames || []).forEach(n => { pathToAsset[Gen.exportPath(n, ctx.assetInfo(n))] = n; });

  // ---- links and pictures back to the design's own form
  const linkBack = href => {
    href = String(href || '').trim();
    if (!href || href === '#') return '';
    const m = href.match(/^([\w.-]+\.html)(#.*)?$/);
    if (m && fileToPage[m[1]]) return 'page:' + fileToPage[m[1]] + (m[2] || '');
    if (href.startsWith('#') && href.length > 1) return 'page:' + page.id + href;
    return href;
  };
  const srcBack = src => {
    src = String(src || '').trim();
    if (pathToAsset[src]) return pathToAsset[src];
    if (/^https?:\/\//i.test(src)) return src;
    if (src) notes.push('The picture “' + src + '” isn’t one of your pictures. Add it with Change picture so it’s included when you publish.');
    return src;
  };
  const codeBack = html => html.replace(/(\s(?:src|href|poster)=["'])([^"']+)(["'])/gi, (m, a, v, b) => pathToAsset[v] ? a + 'ezy-asset:' + pathToAsset[v] + b : m)
    .replace(/url\((["']?)([^"')]+)\1\)/gi, (m, q, v) => pathToAsset[v] ? 'url(' + q + 'ezy-asset:' + pathToAsset[v] + q + ')' : m);
  const richBack = html => {
    const cleaned = ctx.sanitizeRich ? ctx.sanitizeRich(html) : html;
    return cleaned.replace(/href="([^"]*)"/g, (m, v) => 'href="' + Gen.escAttr(linkBack(v.replace(/&amp;/g, '&'))) + '"');
  };
  const anchorProps = a => a ? { link: linkBack(a.getAttribute('href')), newTab: a.getAttribute('target') === '_blank' } : { link: '', newTab: false };

  // ---- head: title and description
  const out = { notes, changed: false, title: page.title || '', description: page.description || '' };
  const newTitle = (doc.querySelector('head > title') || {}).textContent;
  if (newTitle != null && newTitle.trim() !== frag.title) { out.title = newTitle.trim(); out.changed = true; }
  const descMeta = doc.querySelector('meta[name="description"]');
  const newDesc = descMeta ? descMeta.getAttribute('content') || '' : '';
  if (newDesc.trim() !== frag.description.trim()) { out.description = newDesc.trim(); out.changed = true; }

  // ---- header and footer are made from settings
  const hd = doc.querySelector('body > header'), ft = doc.querySelector('body > footer');
  const same = (node, html) => node ? normNode(node) === normHtml(doc, html) : !html.trim();
  if (!same(hd, frag.header)) notes.push('The header is made from your settings, so code changes to it weren’t kept. Click the header in Edit view to change it.');
  if (!same(ft, frag.footer)) notes.push('The footer is made from your settings, so code changes to it weren’t kept. Click the footer in Edit view to change it.');

  // ---- what was there before
  const origSecs = page.sections.map((s, si) => ({ s, si, key: normHtml(doc, frag.sections[si].html), used: false }));
  const origEls = [];
  page.sections.forEach((s, si) => s.columns.forEach((c, ci) => c.elements.forEach((el, ei) => {
    const html = frag.sections[si].elements[ci][ei].html;
    origEls.push({ el, si, ci, ei, key: html.trim() ? normHtml(doc, html) : null, used: false });
  })));

  // ---- turn one changed node into an element
  const make = (type, props, pair) => {
    if (pair && pair.el.type === type) {
      pair.used = true;
      return Object.assign(JSON.parse(JSON.stringify(pair.el)), { props: Object.assign({}, pair.el.props, props) });
    }
    const el = T.makeElement(type, ctx.ctx);
    Object.assign(el.props, props);
    if (pair && type !== 'html') { pair.used = true; el.style = JSON.parse(JSON.stringify(pair.el.style || {})); }
    return el;
  };
  const toElement = (n, pair) => {
    if (n.nodeType === 3) return make('text', { html: richBack('<p>' + Gen.esc(n.nodeValue.trim()) + '</p>') }, pair);
    const tag = n.tagName, cls = n.classList;
    if (/^H[1-4]$/.test(tag)) {
      const a = n.querySelector('a');
      return make('heading', Object.assign({ text: textWithBreaks(n).replace(/\n/g, ' '), level: +tag[1] }, anchorProps(a)), pair);
    }
    if (tag === 'DIV' && cls.contains('wv-text')) return make('text', { html: richBack(n.innerHTML) }, pair);
    if (RICH_BLOCKS.has(tag) && !n.className) return make('text', { html: richBack(n.outerHTML) }, pair);
    if (tag === 'DIV' && cls.contains('wv-button')) {
      const b = n.querySelector('.wv-btn') || n.querySelector('a, span');
      if (b) return make('button', Object.assign({ text: textWithBreaks(b).replace(/\n/g, ' '), variant: classOf(b, 'wv-btn--') && !['sm', 'lg'].includes(classOf(b, 'wv-btn--')) ? classOf(b, 'wv-btn--') : (pair && pair.el.props.variant) || 'filled' }, anchorProps(b.tagName === 'A' ? b : null)), pair);
    }
    if (tag === 'P' && cls.contains('wv-link')) {
      const a = n.querySelector('a'), t = n.querySelector('span:not([aria-hidden])') || a || n;
      return make('link', Object.assign({ text: textWithBreaks(t).replace(/→/g, '').trim(), arrow: !!n.querySelector('[aria-hidden="true"]') }, anchorProps(a)), pair);
    }
    if ((tag === 'FIGURE' && cls.contains('wv-image')) || tag === 'IMG') {
      const img = tag === 'IMG' ? n : n.querySelector('img');
      if (img) {
        const cap = tag === 'FIGURE' ? n.querySelector('figcaption') : null;
        const a = tag === 'FIGURE' ? n.querySelector('a') : null;
        return make('image', Object.assign({ src: srcBack(img.getAttribute('src')), alt: img.getAttribute('alt') || '', caption: cap ? textWithBreaks(cap) : '' }, anchorProps(a)), pair);
      }
    }
    if (tag === 'FIGURE' && cls.contains('wv-quote')) {
      const p = n.querySelector('blockquote') || n, cite = n.querySelector('figcaption');
      return make('quote', { text: textWithBreaks(p), cite: cite ? textWithBreaks(cite) : '' }, pair);
    }
    if (tag === 'HR') return make('divider', { variant: classOf(n, 'wv-divider--') || 'line' }, pair);
    if (tag === 'DIV' && cls.contains('wv-spacer')) {
      const size = classOf(n, 'wv-spacer--');
      return make('spacer', { size: ['sm', 'md', 'lg', 'xl'].includes(size) ? size : 'md' }, pair);
    }
    if (tag === 'DIV' && cls.contains('wv-embed')) return make('html', { code: codeBack(n.innerHTML.trim()) }, pair && pair.el.type === 'html' ? pair : null);
    const what = pair ? 'A ' + (ctx.labels && ctx.labels[pair.el.type] || pair.el.type).toLowerCase() : 'Some code';
    notes.push(what + ' you changed is now kept as Own code. You can still edit it here, or select it in Edit view.');
    return make('html', { code: codeBack(n.outerHTML) }, null);
  };

  // ---- pass 1: everything that is unchanged keeps its original object
  const editedSecs = [];
  let stray = [];
  const flushStray = () => { if (stray.length) { editedSecs.push({ node: null, loose: stray }); stray = []; } };
  Array.from(main.childNodes).forEach(n => {
    if (n.nodeType === 1 && n.tagName === 'SECTION') { flushStray(); editedSecs.push({ node: n }); }
    else if (n.nodeType === 1 || (n.nodeType === 3 && n.nodeValue.trim())) stray.push(n);
  });
  flushStray();

  editedSecs.forEach(es => {
    if (!es.node) return;
    const key = normNode(es.node);
    const hit = origSecs.find(o => !o.used && o.key === key);
    if (hit) { hit.used = true; es.reuse = hit; }
  });
  // elements inside sections that changed
  const colNodes = es => {
    if (!es.node) return [es.loose];
    const cols = es.node.querySelectorAll(':scope > .wv-container > .wv-col, :scope > div > .wv-col');
    if (!cols.length) return [Array.from(es.node.childNodes).filter(n => n.nodeType === 1 || n.nodeValue.trim())];
    return Array.from(cols).map(c => Array.from(c.childNodes).filter(n => n.nodeType === 1 || n.nodeValue.trim()));
  };
  editedSecs.forEach(es => {
    if (es.reuse) return;
    es.cols = colNodes(es).map(nodes => nodes.map(n => ({ n, key: normNode(n) })));
  });
  // sections reused whole: mark their elements used
  origSecs.filter(o => o.used).forEach(o => origEls.filter(e => e.si === o.si).forEach(e => { e.used = true; }));
  editedSecs.forEach(es => (es.cols || []).forEach(col => col.forEach(item => {
    const hit = origEls.find(o => !o.used && o.key && o.key === item.key);
    if (hit) { hit.used = true; item.reuse = hit; }
  })));

  // ---- pass 2: build the new page
  let changedAny = out.changed;
  const sections = editedSecs.map((es, idx) => {
    if (es.reuse) {
      if (es.reuse.si !== idx) changedAny = true;
      return es.reuse.s;
    }
    changedAny = true;
    // pair with an original section that wasn't kept, by position
    const pairSec = origSecs.find(o => !o.used && o.si === idx) || origSecs.find(o => !o.used);
    let sec;
    if (pairSec) { pairSec.used = true; sec = JSON.parse(JSON.stringify(Object.assign({}, pairSec.s, { columns: [] }))); }
    else sec = Object.assign(T.makeSectionObj(ctx.ctx, '1', [[]]), { columns: [] });
    const n = es.node;
    if (n) {
      // settings that live in the section's own tag
      const pad = classOf(n, 'pad-'); if (pad) sec.padding = pad;
      sec.width = classOf(n, 'width-') || 'contained';
      sec.height = classOf(n, 'height-') || 'auto';
      sec.anchor = n.getAttribute('id') || '';
      sec.label = n.getAttribute('aria-label') || '';
      const cont = n.querySelector(':scope > .wv-container');
      if (cont) sec.valign = classOf(cont, 'valign-') || 'top';
    }
    const cols = es.cols;
    const layoutCls = n && n.querySelector(':scope > .wv-container') ? classOf(n.querySelector(':scope > .wv-container'), 'cols-') : '';
    sec.layout = LAYOUTS.includes(layoutCls) && (layoutCls.split('-').length === cols.length || (layoutCls === '1' && cols.length === 1)) ? layoutCls : (LAYOUT_BY_COUNT[Math.min(4, cols.length)] || '1');
    sec.columns = cols.slice(0, 4).map((col, ci) => {
      const els = [];
      let rich = [];
      const pairFor = (pos) => {
        const os = pairSec ? origEls.filter(o => !o.used && o.si === pairSec.si && o.ci === ci) : [];
        return os.find(o => o.ei === pos) || null;
      };
      const flushRich = () => {
        if (!rich.length) return;
        const html = rich.map(r => r.n.nodeType === 3 ? '<p>' + Gen.esc(r.n.nodeValue.trim()) + '</p>' : r.n.outerHTML).join('');
        els.push(make('text', { html: richBack(html) }, pairFor(els.length) && pairFor(els.length).el.type === 'text' ? pairFor(els.length) : null));
        rich = [];
      };
      col.forEach(item => {
        if (item.reuse) { flushRich(); els.push(item.reuse.el); return; }
        const n2 = item.n;
        if (n2.nodeType === 3 || (RICH_BLOCKS.has(n2.tagName) && !n2.className)) { rich.push(item); return; }
        flushRich();
        els.push(toElement(n2, pairFor(els.length)));
      });
      flushRich();
      return { id: (sec.columns[ci] && sec.columns[ci].id) || (pairSec && pairSec.s.columns[ci] && pairSec.s.columns[ci].id) || ctx.ctx.id(), elements: els };
    });
    // a layout needs its columns
    const need = sec.layout.split('-').length;
    while (sec.columns.length < need) sec.columns.push({ id: ctx.ctx.id(), elements: [] });
    return sec;
  });

  // elements that show nothing in the finished site (an empty gallery, say) stay where they were
  origEls.filter(o => !o.used && !o.key).forEach(o => {
    const s = sections.find(x => x.id === page.sections[o.si].id);
    if (s && s.columns[o.ci]) { s.columns[o.ci].elements.splice(Math.min(o.ei, s.columns[o.ci].elements.length), 0, o.el); o.used = true; }
  });
  const removedEls = origEls.filter(o => !o.used && o.key && !origSecs.some(s => s.used && s.si === o.si)).length;
  if (removedEls) changedAny = true;
  if (sections.length !== page.sections.length) changedAny = true;

  out.sections = sections;
  out.changed = changedAny;
  return out;
}

return { applyPage, normNode, normHtml };
}));
