// Pocket-Web-Studio — syntax colouring for the read-only Code view
// Copyright (c) 2026 Pocket-Designs. MIT licence, see LICENSE.
(function (root) {
'use strict';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const span = (c, t) => '<span class="' + c + '">' + esc(t) + '</span>';
function hlAttrs(s) { return s.replace(/([^\s=]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s"']+))?|(\s+)/g, (m, n, eq, v, ws) => ws !== undefined ? ws : span('t-at', n) + (eq ? esc(eq) + span('t-st', v || '') : '')); }
function hlCSS(s) {
  let out = ''; const re = /\/\*[\s\S]*?(?:\*\/|$)|[{}]|[^{}\/]+|\//g; let m;
  while ((m = re.exec(s))) {
    const t = m[0];
    if (t.startsWith('/*')) out += span('t-cm', t);
    else if (t === '{' || t === '}') out += span('t-pn', t);
    else if (s[re.lastIndex] === '{') { const lead = t.match(/^\s*/)[0]; const body = t.slice(lead.length); out += esc(lead) + span(body.trim().startsWith('@') ? 't-kw' : 't-sel', body); }
    else out += t.replace(/([a-zA-Z-]+)(\s*:)([^;]*)|([\s\S])/g, (m, p, c, v, o) => o !== undefined ? esc(o) : span('t-pr', p) + esc(c) + span('t-vl', v));
  }
  return out;
}
function hlJS(s) { return s.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|while|new|class|this|true|false|null|undefined|of|in|async|await|import|export|typeof)\b|\b(\d+(?:\.\d+)?)\b|([^\w"'`\/]+|[\s\S])/g, (m, c, st, k, n, o) => c ? span('t-cm', c) : st ? span('t-st', st) : k ? span('t-kw', k) : n ? span('t-nu', n) : esc(o)); }
function hlHTML(src) {
  let out = ''; const re = /<!--[\s\S]*?(?:-->|$)|<![^>]*>?|<(\/?)([a-zA-Z][\w-]*)([^>]*)(>?)|[^<]+|</g; let m;
  while ((m = re.exec(src))) {
    const t = m[0];
    if (t.startsWith('<!--')) out += span('t-cm', t);
    else if (t.startsWith('<!')) out += span('t-dt', t);
    else if (m[2]) {
      let a = m[3], sc = ''; if (a.endsWith('/')) { a = a.slice(0, -1); sc = '/'; }
      out += span('t-pn', '<' + m[1]) + span('t-tg', m[2]) + hlAttrs(a) + span('t-pn', sc + m[4]);
      const name = m[2].toLowerCase();
      if (!m[1] && m[4] && (name === 'style' || name === 'script')) {
        const c = src.toLowerCase().indexOf('</' + name, re.lastIndex); const end = c < 0 ? src.length : c;
        const inner = src.slice(re.lastIndex, end); out += name === 'style' ? hlCSS(inner) : hlJS(inner); re.lastIndex = end;
      }
    } else out += esc(t);
  }
  return out;
}
root.WeaverHighlight = function (code, kind) { return kind === 'html' ? hlHTML(code) : kind === 'css' ? hlCSS(code) : kind === 'js' ? hlJS(code) : esc(code); };
})(globalThis);
