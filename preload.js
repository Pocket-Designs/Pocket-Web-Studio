'use strict';
// Pocket-Web-Studio — safe bridge between the editor window and the main process.
// Copyright (c) 2026 project-tech-me. MIT licence, see LICENSE.

const { contextBridge, ipcRenderer, webFrame } = require('electron');

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
  spellLanguage: (lang) => call('spell:setLanguage', lang),
  spellAddWord: (word) => call('spell:addWord', word),
  spellEnabled: () => call('spell:enabled'),
  isMisspelled: (word) => { try { return webFrame.isWordMisspelled(String(word)); } catch (e) { return false; } },
  spellSuggestions: (word) => { try { return webFrame.getWordSuggestions(String(word)); } catch (e) { return []; } },
  checkDomain: (domain) => call('dns:check', domain),
  onMenu: (cb) => ipcRenderer.on('menu', (_e, cmd) => cb(cmd)),
  onOpenFile: (cb) => ipcRenderer.on('open-file', (_e, p) => cb(p))
});
