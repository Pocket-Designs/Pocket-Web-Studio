// Builds the browser version of Pocket-Web-Studio: one self-contained HTML file.
// Usage: npm run build:web   →   dist/web/pocket-web-studio.html
// Copyright (c) 2026 Pocket-Designs. MIT licence, see LICENSE.
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const R = p => path.join(root, 'renderer', p);
const dataUri = (file, mime) => 'data:' + mime + ';base64,' + fs.readFileSync(file).toString('base64');
const logo = dataUri(R('logo.png'), 'image/png');

let html = fs.readFileSync(R('index.html'), 'utf8');

// The browser page has its own security rules, so the desktop app's CSP is left out.
html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\n?/, '');
html = html.replace(/(href|src)="logo\.png"/g, '$1="' + logo + '"');

// Stylesheet, with the editor's fonts and logo built in.
let css = fs.readFileSync(R('styles.css'), 'utf8');
css = css.replace(/url\(\.\.\/(node_modules\/[^)]+\.woff2)\)/g, (m, f) => 'url(' + dataUri(path.join(root, f), 'font/woff2') + ')');
css = css.replace(/url\(logo\.png\)/g, 'url(' + logo + ')');
html = html.replace('<link rel="stylesheet" href="styles.css">', () => '<style>\n' + css + '\n</style>');

// Scripts, in the order index.html loads them.
html = html.replace(/<script src="([\w.-]+\.js)"><\/script>/g, (m, f) => {
  const js = fs.readFileSync(R(f), 'utf8');
  if (/<\/script/i.test(js)) throw new Error(f + ' contains a closing script tag. Write <\\/script> instead.');
  return '<script>\n' + js + '\n</script>';
});

// The licence, for Help › Licence.
const licence = fs.readFileSync(path.join(root, 'LICENSE'), 'utf8').replace(/<\/script/gi, '<\\/script');
const end = html.lastIndexOf('</body>');
html = html.slice(0, end) + '<script type="text/plain" id="licenceText">' + licence + '</script>\n' + html.slice(end);

const out = path.join(root, 'dist', 'web', 'pocket-web-studio.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('Browser version written to ' + path.relative(root, out) + ' (' + Math.round(html.length / 1024) + ' KB)');
