'use strict';
// Pocket-Web-Studio — Electron main process
// Copyright (c) 2026 Pocket-Designs. MIT licence, see LICENSE.

const { app, BrowserWindow, Menu, dialog, ipcMain, shell, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const { pathToFileURL } = require('url');

const SCHEME = 'weaver-preview';
const EXT = 'pocketweb';
const OLD_EXTS = ['ezyweb', 'weaver'];
protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } }
]);

const MIME = {
  html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8',
  svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  webp: 'image/webp', avif: 'image/avif', bmp: 'image/bmp', ico: 'image/x-icon',
  mp4: 'video/mp4', webm: 'video/webm', ogv: 'video/ogg'
};
const mimeOf = p => MIME[(p.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';

let win = null;
let dirty = false;
let forceClose = false;
let preview = {};
let pendingOpen = null;

/* ---------- settings ---------- */
const settingsPath = () => path.join(app.getPath('userData'), 'settings.json');
function readSettings() { try { return JSON.parse(fs.readFileSync(settingsPath(), 'utf8')); } catch { return {}; } }
function writeSettings(patch) {
  const s = Object.assign(readSettings(), patch);
  try { fs.mkdirSync(path.dirname(settingsPath()), { recursive: true }); fs.writeFileSync(settingsPath(), JSON.stringify(s, null, 2)); } catch { /* ignore */ }
}

/* ---------- helpers ---------- */
function safeJoin(root, rel) {
  if (typeof rel !== 'string' || !rel || rel.includes('\0')) throw new Error('Invalid file name');
  const base = path.resolve(root);
  const abs = path.resolve(base, rel);
  if (abs !== base && !abs.startsWith(base + path.sep)) throw new Error('A file tried to leave the chosen folder');
  return abs;
}
async function writeFiles(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const abs = safeJoin(root, rel);
    await fsp.mkdir(path.dirname(abs), { recursive: true });
    await fsp.writeFile(abs, typeof content === 'string' ? content : Buffer.from(content));
  }
}
const projectNameOf = p => path.basename(p).replace(/\.(pocketweb|ezyweb|weaver)$/i, '');
function argPath(argv) {
  return (argv || []).slice(1).find(a => typeof a === 'string' && /\.(pocketweb|ezyweb|weaver)$/i.test(a) && fs.existsSync(a)) || null;
}

/* ---------- project files ---------- */
async function readProject(p) {
  let data;
  try { data = JSON.parse(await fsp.readFile(p, 'utf8')); }
  catch { throw new Error('“' + path.basename(p) + '” isn’t a Pocket-Web-Studio website project, or it is damaged.'); }
  if (!data || !['pocket-project', 'ezy-project', 'weaver-project'].includes(data.format) || !data.site) throw new Error('“' + path.basename(p) + '” isn’t a Pocket-Web-Studio website project.');
  const assets = {};
  for (const [name, a] of Object.entries(data.assets || {})) {
    assets[name] = { mime: a.mime, w: a.w || 0, h: a.h || 0, bytes: new Uint8Array(Buffer.from(a.data || '', 'base64')) };
  }
  writeSettings({ lastProject: p });
  return { path: p, name: projectNameOf(p), site: data.site, assets };
}
async function writeProject(p, payload) {
  const assets = {};
  for (const [name, a] of Object.entries(payload.assets || {})) {
    assets[name] = { mime: a.mime, w: a.w, h: a.h, data: Buffer.from(a.bytes).toString('base64') };
  }
  const json = JSON.stringify({ format: 'pocket-project', version: 2, app: 'Pocket-Web-Studio ' + app.getVersion(), saved: new Date().toISOString(), site: payload.site, assets });
  const tmp = p + '.saving';
  await fsp.writeFile(tmp, json, 'utf8');
  await fsp.rename(tmp, p);
  writeSettings({ lastProject: p });
}

/* ---------- preview protocol ---------- */
function registerPreviewProtocol() {
  protocol.handle(SCHEME, async (req) => {
    let rel;
    try { rel = decodeURIComponent(new URL(req.url).pathname).replace(/^\/+/, ''); } catch { rel = ''; }
    if (!rel || rel.endsWith('/')) rel += 'index.html';
    const body = preview[rel];
    if (body == null) return new Response('This page isn’t part of your website.', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    return new Response(typeof body === 'string' ? body : Buffer.from(body), { headers: { 'content-type': mimeOf(rel), 'cache-control': 'no-store' } });
  });
}

/* ---------- window ---------- */
function send(cmd, arg) { if (win && !win.isDestroyed()) win.webContents.send(cmd === 'open-file' ? 'open-file' : 'menu', cmd === 'open-file' ? arg : cmd); }

function createWindow() {
  const s = readSettings();
  win = new BrowserWindow({
    width: s.bounds?.width || 1480,
    height: s.bounds?.height || 920,
    x: s.bounds?.x, y: s.bounds?.y,
    minWidth: 1100,
    minHeight: 660,
    title: 'Pocket-Web-Studio',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#e7eaf0',
    show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: true }
  });
  if (s.maximized) win.maximize();
  if (s.spellcheck === false) win.webContents.session.setSpellCheckerEnabled(false);
  win.webContents.on('context-menu', (_e, p) => spellMenu(p));
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Keep the editor on the editor; send real web links to the visitor's browser.
  const external = url => { if (/^(https?:|mailto:|tel:)/i.test(url)) shell.openExternal(url); };
  win.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { e.preventDefault(); external(url); });
  win.webContents.on('will-frame-navigate', (e) => {
    if (e.isMainFrame) return;
    const url = e.url || '';
    if (url.startsWith(SCHEME + ':') || url.startsWith('about:') || url.startsWith('https://www.youtube-nocookie.com/') || url.startsWith('https://player.vimeo.com/') || /^https:\/\/(maps|www)\.google\.com\/maps/.test(url)) return;
    e.preventDefault();
    external(url);
  });

  win.on('close', (e) => {
    writeSettings({ bounds: win.isMaximized() ? readSettings().bounds : win.getBounds(), maximized: win.isMaximized() });
    if (!dirty || forceClose) return;
    e.preventDefault();
    const r = dialog.showMessageBoxSync(win, {
      type: 'warning', buttons: ['Save', 'Don’t save', 'Cancel'], defaultId: 0, cancelId: 2,
      message: 'Save changes to your website before closing?',
      detail: 'Your changes will be lost if you don’t save them.'
    });
    if (r === 0) send('save-all-and-close');
    else if (r === 1) { forceClose = true; win.close(); }
  });
  win.on('closed', () => { win = null; });
}

/* ---------- spelling ---------- */
function spellMenu(p) {
  const wc = win && win.webContents;
  if (!wc) return;
  const t = [];
  if (p.misspelledWord) {
    const sugg = (p.dictionarySuggestions || []).slice(0, 6);
    sugg.forEach(w => t.push({ label: w, click: () => wc.replaceMisspelling(w) }));
    if (!sugg.length) t.push({ label: 'No spelling suggestions', enabled: false });
    t.push({ label: 'Add “' + p.misspelledWord + '” to dictionary', click: () => wc.session.addWordToSpellCheckerDictionary(p.misspelledWord) });
    t.push({ type: 'separator' });
  }
  if (p.isEditable) t.push({ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'pasteAndMatchStyle', label: 'Paste as plain text' }, { type: 'separator' }, { role: 'selectAll' });
  else if (p.selectionText && p.selectionText.trim()) t.push({ role: 'copy' });
  if (!t.length) return;
  Menu.buildFromTemplate(t).popup({ window: win });
}
function setSpellLanguage(lang) {
  if (!win || process.platform === 'darwin') return null; // macOS picks the language itself
  const ses = win.webContents.session;
  const avail = ses.availableSpellCheckerLanguages || [];
  const want = String(lang || 'en').toLowerCase();
  const base = want.split('-')[0];
  const pick = avail.find(l => l.toLowerCase() === want) || avail.find(l => l.toLowerCase().split('-')[0] === base && /^(en-gb|fr-fr|de-de|es-es|it-it|pt-pt|nl-nl)$/i.test(l)) || avail.find(l => l.toLowerCase().split('-')[0] === base);
  if (!pick) return null;
  try { ses.setSpellCheckerLanguages([pick]); } catch (e) { return null; }
  return pick;
}

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const item = (label, cmd, accelerator) => ({ label, accelerator, click: () => send(cmd) });
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { label: '&File', submenu: [
      item('New Website…', 'new-site', 'CmdOrCtrl+N'),
      item('Open…', 'open', 'CmdOrCtrl+O'),
      item('Import Website…', 'import', 'CmdOrCtrl+I'),
      { type: 'separator' },
      item('Save', 'save', 'CmdOrCtrl+S'),
      item('Save As…', 'save-as', 'CmdOrCtrl+Shift+S'),
      { type: 'separator' },
      item('Add Page', 'add-page', 'CmdOrCtrl+Shift+N'),
      item('Preview in Browser', 'preview-browser', 'F12'),
      item('Publish Website…', 'publish', 'CmdOrCtrl+P'),
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit', label: 'E&xit' }
    ] },
    { label: '&Edit', submenu: [
      item('Undo', 'undo', 'CmdOrCtrl+Z'),
      item('Redo', 'redo', isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y'),
      { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' },
      { type: 'separator' },
      item('Duplicate', 'duplicate', 'CmdOrCtrl+D'),
      { type: 'separator' },
      item('Check Spelling…', 'spelling', 'F7')
    ] },
    { label: '&View', submenu: [
      item('Edit', 'view-edit', 'CmdOrCtrl+1'),
      item('Preview', 'view-preview', 'CmdOrCtrl+2'),
      item('Code', 'view-code', 'CmdOrCtrl+3'),
      { type: 'separator' },
      item('Computer Size', 'dev-desktop'),
      item('Tablet Size', 'dev-tablet'),
      item('Phone Size', 'dev-phone'),
      { type: 'separator' },
      { label: 'Underline Spelling Mistakes', type: 'checkbox', checked: readSettings().spellcheck !== false, click: (mi) => {
        if (win) win.webContents.session.setSpellCheckerEnabled(mi.checked);
        writeSettings({ spellcheck: mi.checked });
      } },
      { type: 'separator' },
      { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
      { role: 'toggleDevTools' }
    ] },
    { label: '&Help', submenu: [item('Domain Name && Free HTTPS Setup…', 'domain'), { type: 'separator' }, item('About Pocket-Web-Studio', 'about'), item('Licence', 'licence')] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ---------- IPC ---------- */
function handle(channel, fn) {
  ipcMain.handle(channel, async (_e, ...args) => {
    try { return { ok: true, value: await fn(...args) }; }
    catch (err) { return { ok: false, error: err && err.message ? err.message : String(err) }; }
  });
}

handle('spell:setLanguage', async (lang) => setSpellLanguage(lang));
handle('spell:addWord', async (word) => { if (win && word) win.webContents.session.addWordToSpellCheckerDictionary(String(word)); return true; });
handle('spell:enabled', async () => !!(win && win.webContents.session.isSpellCheckerEnabled()));
handle('dns:check', async (domain) => {
  const dns = require('dns').promises;
  const host = String(domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) throw new Error('That doesn’t look like a domain name.');
  const apex = host.replace(/^www\./, '');
  const www = 'www.' + apex;
  const safe = async (fn) => { try { return await fn(); } catch (e) { return []; } };
  const [a, aaaa, cname, wwwA, wwwCname] = await Promise.all([
    safe(() => dns.resolve4(apex)), safe(() => dns.resolve6(apex)), safe(() => dns.resolveCname(apex)),
    safe(() => dns.resolve4(www)), safe(() => dns.resolveCname(www))
  ]);
  return { apex, www, a, aaaa, cname, wwwA, wwwCname };
});

handle('app:init', async () => {
  const s = readSettings();
  const openPath = pendingOpen || argPath(process.argv) || (s.lastProject && fs.existsSync(s.lastProject) ? s.lastProject : null);
  pendingOpen = null;
  return { version: require('./package.json').version, platform: process.platform, openPath };
});

handle('project:open', async (p) => {
  if (!p) {
    const r = await dialog.showOpenDialog(win, { title: 'Open a website project', properties: ['openFile'], filters: [{ name: 'Pocket-Web-Studio website', extensions: [EXT, ...OLD_EXTS] }] });
    if (r.canceled || !r.filePaths[0]) return null;
    p = r.filePaths[0];
  }
  return readProject(p);
});

handle('project:save', async (p, payload, suggested) => {
  if (!p) {
    const r = await dialog.showSaveDialog(win, {
      title: 'Save your website project',
      defaultPath: path.join(app.getPath('documents'), (String(suggested || 'My website').replace(/[\\/:*?"<>|]+/g, '-') || 'My website') + '.' + EXT),
      filters: [{ name: 'Pocket-Web-Studio website', extensions: [EXT] }]
    });
    if (r.canceled || !r.filePath) return null;
    p = r.filePath.toLowerCase().endsWith('.' + EXT) ? r.filePath : r.filePath + '.' + EXT;
  }
  await writeProject(p, payload);
  return { path: p, name: projectNameOf(p) };
});

handle('site:export', async (folder, files, known) => {
  if (!folder || !fs.existsSync(folder)) {
    const r = await dialog.showOpenDialog(win, { title: 'Choose a folder for your finished website', buttonLabel: 'Publish here', properties: ['openDirectory', 'createDirectory', 'promptToCreate'] });
    if (r.canceled || !r.filePaths[0]) return null;
    folder = r.filePaths[0];
    known = false;
  }
  await fsp.mkdir(folder, { recursive: true });
  if (!known) {
    const existing = (await fsp.readdir(folder)).filter(n => !n.startsWith('.'));
    const clashes = Object.keys(files).filter(rel => fs.existsSync(path.join(folder, rel)));
    if (existing.length && clashes.length) {
      const c = dialog.showMessageBoxSync(win, {
        type: 'warning', buttons: ['Replace files', 'Cancel'], defaultId: 1, cancelId: 1,
        message: 'This folder already has a website in it.',
        detail: clashes.length + ' file' + (clashes.length > 1 ? 's' : '') + ' will be replaced, for example ' + clashes.slice(0, 3).join(', ') + '. Nothing else in the folder is removed.'
      });
      if (c !== 0) return null;
    }
  }
  await writeFiles(folder, files);
  return { folder };
});

const IMPORT_RE = /\.(html?|css|png|jpe?g|gif|webp|svg|avif|bmp|ico|mp4|webm|ogv|woff2?|ttf|otf)$/i;
handle('site:importFolder', async () => {
  const r = await dialog.showOpenDialog(win, { title: 'Choose the folder that holds your website', buttonLabel: 'Import this website', properties: ['openDirectory'] });
  if (r.canceled || !r.filePaths[0]) return null;
  const root = r.filePaths[0];
  const out = [];
  let total = 0, skipped = 0;
  const queue = [''];
  while (queue.length) {
    const dir = queue.shift();
    let entries;
    try { entries = await fsp.readdir(path.join(root, dir), { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue;
      const rel = dir ? dir + '/' + e.name : e.name;
      if (e.isDirectory()) { if (rel.split('/').length < 8) queue.push(rel); continue; }
      if (!e.isFile() || !IMPORT_RE.test(e.name)) continue;
      const st = await fsp.stat(path.join(root, rel));
      if (st.size > 80 * 1024 * 1024 || out.length >= 3000 || total + st.size > 500 * 1024 * 1024) { skipped++; continue; }
      total += st.size;
      out.push({ path: rel, bytes: new Uint8Array(await fsp.readFile(path.join(root, rel))) });
    }
  }
  if (!out.some(f => /\.html?$/i.test(f.path))) throw new Error('No web pages (.html files) were found in “' + path.basename(root) + '”. Choose the folder that contains your site’s index.html.');
  return { name: path.basename(root), files: out, skipped };
});

handle('site:previewInBrowser', async (files, entry) => {
  const dir = path.join(os.tmpdir(), 'pocket-web-studio-preview');
  await fsp.rm(dir, { recursive: true, force: true });
  await writeFiles(dir, files);
  await shell.openExternal(pathToFileURL(safeJoin(dir, entry || 'index.html')).href);
  return true;
});

handle('shell:reveal', async (folder) => { if (folder) await shell.openPath(folder); return true; });
handle('shell:openPublished', async (folder) => { await shell.openExternal(pathToFileURL(path.join(folder, 'index.html')).href); return true; });

handle('app:licence', async () => {
  for (const p of [path.join(__dirname, 'LICENSE'), path.join(process.resourcesPath || '', 'LICENSE.txt')]) {
    try { return await fsp.readFile(p, 'utf8'); } catch { /* try next */ }
  }
  throw new Error('The licence file could not be found.');
});

ipcMain.on('preview:set', (_e, files) => { preview = files || {}; });
ipcMain.on('app:setDirty', (_e, d) => { dirty = !!d; if (win) win.setDocumentEdited(dirty); });
ipcMain.on('app:closeNow', () => { forceClose = true; if (win) win.close(); });

/* ---------- lifecycle ---------- */
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    const p = argPath(argv);
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); if (p) send('open-file', p); }
  });
  app.on('open-file', (e, p) => {
    e.preventDefault();
    if (win) send('open-file', p); else pendingOpen = p;
  });
  app.whenReady().then(() => {
    registerPreviewProtocol();
    buildMenu();
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
