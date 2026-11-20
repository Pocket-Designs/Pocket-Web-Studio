// Builds every starter website plus one page using every element and section,
// writes them to test/output/, and checks each page against the HTML standard.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const Gen = require('../renderer/generator.js');
const T = require('../renderer/templates.js');

let n = 0;
const assets = {};
const ctx = {
  id: () => 't' + (n++).toString(36),
  ph: i => { const name = 'placeholder-' + i + '.svg'; assets[name] = { mime: 'image/svg+xml', w: 1200, h: 800 }; return name; }
};
const outRoot = path.join(__dirname, 'output');
fs.rmSync(outRoot, { recursive: true, force: true });

for (const kind of ['blank', 'business', 'portfolio']) {
  const site = T.makeSite(kind, ctx);
  if (kind === 'blank') {
    const els = T.ELEMENTS.map(e => T.makeElement(e.type, ctx, {}, { anim: 'up' }));
    els.find(e => e.type === 'video').props.url = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';
    els.find(e => e.type === 'map').props.address = 'Trafalgar Square, London';
    els.find(e => e.type === 'form').props.email = 'hello@example.com';
    site.pages[0].sections.push(T.makeSectionObj(ctx, '1-1', [els.slice(0, 9), els.slice(9)]));
    T.SECTIONS.forEach(s => site.pages[0].sections.push(...s.make(ctx)));
  }
  if (kind === 'business') {
    // drop-down menu, extra menu links, links, sizes, shapes and a domain
    site.pages[2].parent = site.pages[1].id;
    site.header.menuLinks = [{ id: 'ml1', label: 'Order online', link: 'https://example.com/order', newTab: true, parent: '' }, { id: 'ml2', label: 'Gift cards', link: 'page:' + site.pages[0].id, parent: site.pages[1].id }];
    const els = site.pages[0].sections.flatMap(s => s.columns.flatMap(c => c.elements));
    els.find(e => e.type === 'heading').props.link = 'page:' + site.pages[1].id;
    const img = els.find(e => e.type === 'image'); img.props.shape = 'circle'; img.style.width = '60';
    const card = els.find(e => e.type === 'card'); card.props.imageShape = 'square'; card.style.width = '85';
    site.pages[0].sections[0].columns[0].elements.push(T.makeElement('spacer', ctx, { height: 90 }), T.makeElement('link', ctx, { text: 'See the menu', link: 'page:' + site.pages[2].id }));
    site.settings.domain = 'https://www.harbourlane.example/';
    site.settings.host = 'github';
    // pictures that fit, a masonry gallery, and your own CSS and JavaScript
    site.pages[0].sections[0].columns[0].elements.push(
      T.makeElement('slideshow', ctx, { fit: 'whole', ratio: 'panorama' }),
      T.makeElement('gallery', ctx, { ratio: 'original', columns: 6, focus: 'top' }));
    site.custom = { css: '.wv-heading { letter-spacing: 0.02em; background: url(ezy-asset:placeholder-1.svg); }', js: 'console.log("Hello from custom.js");' };
  }
  const out = Gen.generateSite(site, { assetInfo: name => assets[name] });
  if (kind === 'business') {
    const home = out.files['index.html'], css = out.files['css/style.css'];
    const must = [[home, 'class="has-sub'], [home, 'class="wv-sub"'], [home, 'Gift cards'], [home, 'target="_blank" rel="noopener">Order online'], [home, '<link rel="canonical" href="https://www.harbourlane.example/">'],
      [home, 'class="wv-link'], [css, 'max-width: 60%'], [css, 'border-radius: 50%'], [css, 'height: 90px'], [out.files['CNAME'] || '', 'www.harbourlane.example'], [out.files['sitemap.xml'] || '', '<loc>https://www.harbourlane.example/visit-us.html</loc>'], [out.files['robots.txt'] || '', 'Sitemap: https://www.harbourlane.example/sitemap.xml'],
      [home, 'fit-whole'], [home, 'is-masonry'], [css, '--ratio-sm: 16 / 9'], [css, '--focus: 50% 15%'], [css, '--cols: 6'], [css, '@container (max-width: 560px)'],
      [home, '<link rel="stylesheet" href="css/custom.css">'], [home, '<script src="js/custom.js" defer></script>'],
      [out.files['css/custom.css'] || '', 'url(../images/placeholder-1.svg)'], [out.files['js/custom.js'] || '', 'Hello from custom.js']];
    must.forEach(([text, needle]) => { if (!text.includes(needle)) throw new Error('Missing in output: ' + needle); });
    console.log('business   drop-downs, links, sizes, shapes, domain files, picture fitting and custom code present');
  }
  const dir = path.join(outRoot, kind);
  for (const [p, content] of Object.entries(out.files)) {
    fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true });
    fs.writeFileSync(path.join(dir, p), content);
  }
  for (const [p, name] of Object.entries(out.assets)) {
    fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true });
    fs.writeFileSync(path.join(dir, p), T.placeholderSvg(+name.match(/\d+/)[0]));
  }
  console.log(kind.padEnd(10), Object.keys(out.files).join(', '));
}

const pages = [];
for (const kind of fs.readdirSync(outRoot)) for (const f of fs.readdirSync(path.join(outRoot, kind))) if (f.endsWith('.html')) pages.push(path.join(outRoot, kind, f));
const bin = path.join(__dirname, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'html-validate.cmd' : 'html-validate');
execFileSync(bin, ['-c', path.join(__dirname, 'htmlvalidate.json'), ...pages], { stdio: 'inherit', shell: process.platform === 'win32' });
console.log('All ' + pages.length + ' pages pass the HTML validator.');
