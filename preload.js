'use strict';
// Pocket-Web-Studio — safe bridge between the editor window and the main process.
// Copyright (c) 2026 project-tech-me. MIT licence, see LICENSE.

const { contextBridge, ipcRenderer } = require('electron');

async function call(channel, ...args) {
  const r = await ipcRenderer.invoke(channel, ...args);
  if (!r.ok) throw new Error(r.error);
  return r.value;
}

contextBridge.exposeInMainWorld('weaver', {
  init: () => call('app:init'),
  openProject: (path) => call('project:open', path || null),
  saveProject: (path, payload, suggestedName) => call('project:save', path || null, payload, suggestedName),
  exportSite: (folder, files, known) => call('site:export', folder || null, files, !!known),
  importFolder: () => call('site:importFolder'),
  previewInBrowser: (files, entry) => call('site:previewInBrowser', files, entry),
  reveal: (folder) => call('shell:reveal', folder),
  openPublished: (folder) => call('shell:openPublished', folder),
  licence: () => call('app:licence'),
  setPreview: (files) => ipcRenderer.send('preview:set', files),
  setDirty: (d) => ipcRenderer.send('app:setDirty', !!d),
  closeNow: () => ipcRenderer.send('app:closeNow'),
  onMenu: (cb) => ipcRenderer.on('menu', (_e, cmd) => cb(cmd)),
  onOpenFile: (cb) => ipcRenderer.on('open-file', (_e, p) => cb(p))
});
