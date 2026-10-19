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
  const out = Gen.generateSite(site, { assetInfo: name => assets[name] });
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
