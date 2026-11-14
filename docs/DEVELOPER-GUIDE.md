# Pocket-Web-Studio Developer Guide

This guide is for anyone changing Pocket-Web-Studio's own code. It explains how the app is put together, where things live, and how to test, build and release it.

For using the app, see the [User Guide](USER-GUIDE.md).

---

## Contents

1. [Overview](#1-overview)
2. [Getting set up](#2-getting-set-up)
3. [Project layout](#3-project-layout)
4. [Architecture](#4-architecture)
5. [The website model](#5-the-website-model)
6. [The generator](#6-the-generator)
7. [The editor](#7-the-editor)
8. [The main process and the bridge](#8-the-main-process-and-the-bridge)
9. [Project files](#9-project-files)
10. [The importer](#10-the-importer)
11. [Recipes](#11-recipes)
12. [Testing](#12-testing)
13. [Building and releasing](#13-building-and-releasing)
14. [Code style and conventions](#14-code-style-and-conventions)
15. [Licence and credits](#15-licence-and-credits)

---

## 1. Overview

Pocket-Web-Studio is an [Electron](https://www.electronjs.org/) desktop app (Electron 33). It is written in plain JavaScript, HTML and CSS: there is no framework, no bundler and no build step for the code itself.

The core idea:

- A website is a **JSON model**: pages, made of sections, made of columns, holding elements.
- The **editor** changes the model.
- The **generator** turns the model into HTML, CSS and JavaScript. It does this both for the live canvas in the editor (with editing markers) and for the published website (clean code).

The same renderer code also runs as a single-file **browser version**. Anything that needs the computer (files, folders, spelling, DNS) is only offered when the desktop bridge is present.

---

## 2. Getting set up

You need [Node.js](https://nodejs.org/) 18 or newer (the GitHub build uses Node 20).

1. Get the code. With GitHub Desktop: **File › Clone repository**, choose the Pocket-Web-Studio repository, then **Repository › Open in Command Prompt** (or your terminal) for the next step.
2. Install the dependencies:

   ```
   npm install
   ```

3. Run the app:

   ```
   npm start
   ```

4. Run the tests:

   ```
   npm test
   ```

To open Chrome DevTools in the running app, use **View › Toggle Developer Tools** (Ctrl+Shift+I).

---

## 3. Project layout

```
main.js                 Electron main process: window, menus, project files,
                        publishing, preview protocol, spelling, DNS check
preload.js              The bridge: exposes window.weaver to the editor
renderer/
  index.html            The editor window (layout, CSP, script order)
  editor.js             The whole editor UI
  generator.js          Model → HTML, CSS and JavaScript; site checks
  templates.js          Element list and defaults, ready-made sections, starters
  importer.js           Existing website folder → model
  highlight.js          Syntax colouring for the Code view
  styles.css            The editor's own look
  logo.png              App logo (see Licence and credits)
test/
  generate.js           Builds sample sites and validates every page
  htmlvalidate.json     html-validate rules
build/
  icon.png, icon.ico    App icon (see Licence and credits)
  after-pack.js         Stamps icon and version details into the Windows .exe
.github/workflows/
  build.yml             Tests on every push; installers on a GitHub Release
docs/
  USER-GUIDE.md         For people using the app
  DEVELOPER-GUIDE.md    This file
```

Internal names still say "weaver" in places (the `window.weaver` bridge, `WeaverGen`, `WeaverTemplates`, the `weaver-preview:` protocol, `data-wv` markers) and "Ezy" in one (`EzyImporter`). These are from earlier product names and are kept so older project files and code keep working. Don't rename them without updating every reference.

---

## 4. Architecture

```
┌──────────────────────────── Electron main process (main.js) ───────────────────────────┐
│  BrowserWindow · menus · dialogs · file I/O · weaver-preview: protocol · spell checker │
└───────────────▲─────────────────────────────────────────────────────┬──────────────────┘
                │ ipcRenderer.invoke('channel', …) → {ok, value|error}│ 'menu' events
┌───────────────┴────────────── preload.js ───────────────────────────▼──────────────────┐
│              contextBridge.exposeInMainWorld('weaver', { … })                          │
└───────────────▲────────────────────────────────────────────────────────────────────────┘
                │ window.weaver (absent in the browser version)
┌───────────────┴────────────── Renderer (sandboxed) ────────────────────────────────────┐
│ editor.js  ── changes ──▶  site model (JSON)  ──▶  generator.js ──▶ canvas / preview / │
│    ▲                                                     │            export files     │
│    └──────── templates.js (elements, sections) ──────────┘                             │
│ importer.js (folder → model)   highlight.js (Code view)                                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Security settings in the window: `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, and a strict Content-Security-Policy in `renderer/index.html`. The renderer never touches the file system directly; everything goes through the bridge.

Scripts load in this order in `index.html`: `generator.js`, `templates.js`, `highlight.js`, `importer.js`, `editor.js`. `generator.js` and `templates.js` are UMD-style modules, so they also load in Node with `require()` (the tests rely on this).

---

## 5. The website model

The whole website is one plain object, `site`. It is saved as JSON, and undo/redo stores snapshots of it.

```js
site = {
  format, version, name,
  theme: {
    palette,                                   // name of a palette, or 'Custom'
    colors: { primary, accent, background, surface, text },
    fonts:  { heading, body },
    radius                                      // 'square' | 'soft' | 'round'
  },
  header: { show, logoText, logoImage, layout, sticky, bg, color,
            menuLinks: [{ id, label, link, newTab, parent }] },
  footer: { show, text /* "{year}" is replaced */, showNav, bg, color },
  pages: [{
    id, name, title, description, showInNav,
    parent,                                     // optional: id of a top-level page (drop-downs, one level)
    sections: [section, …]
  }],
  settings: { language, favicon, publishFolder,
              domain, host, hostId,             // domain wizard
              spellIgnore: [] }
}

section = {
  id, layout,       // '1' | '1-1' | '1-2' | '2-1' | '1-1-1' | '1-1-1-1'
  columns: [{ id, elements: [element, …] }],
  padding, width, valign, height,
  bg, bgImage, overlay, parallax, textColor, anchor
}

element = {
  id, type,         // see below
  props: { … },     // content; depends on the type (see DEFAULTS in templates.js)
  style: { align, width /* 10–100, percent of column */, size, color, bg,
           padding, radius, shadow, anim, motion, hideMobile }
}
```

**Element types:** `heading`, `text`, `button`, `link`, `image`, `divider`, `spacer`, `gallery`, `slideshow`, `video`, `map`, `ticker`, `card`, `quote`, `table`, `faq`, `form`, `html`.

**Pictures and other files** aren't stored in the model. The model refers to them by **asset name**. The editor keeps an asset table, `{ name: { mime, w, h, bytes } }`, and shows each one through a `blob:` URL. A name can also be a full `https://` address (`Gen.isUrl`). In "Own code" elements, `ezy-asset:NAME` refers to an asset.

**Links** in props are strings: `page:<pageId>`, `page:<pageId>#<anchor>`, `https://…`, `mailto:…` or `tel:…`. The generator resolves them to real file names.

**Colours** can be a theme token (such as `primary`) or a hex value, so changing the theme updates everything that uses a token.

`normalizeSite()` in `editor.js` fills in missing fields when an older project is opened. Add a default there whenever you add a field.

---

## 6. The generator

`renderer/generator.js` (global `WeaverGen`, or `require('./renderer/generator.js')`) has no side effects and no DOM access, so it runs anywhere.

Main exports:

| Function | Does |
| --- | --- |
| `generateSite(site, opts)` | Every file of the finished website: `{ files: { path: text }, assets: { path: assetName } }` |
| `renderEditPage(site, page, opts)` | Body HTML and CSS for the editor canvas, with editing markers |
| `renderPreviewPage(…)` | The same, without markers, for Preview |
| `buildCss(site, opts, pages)` | The stylesheet (only the rules the pages need) |
| `buildJs(site)` | The site script, or nothing if no feature needs it |
| `checkSite(site, assetInfo)` | The pre-publish check: `[{ level, text, pageId, id, action }]` |
| `pageFiles(site)` | `{ pageId: 'index.html' | 'about.html' | … }` |
| `navTree(site)` | The header menu: top-level items with drop-down children |
| `siteUrl(site)`, `cleanDomain(d)` | The website's https address, for sitemaps and canonical links |
| `PALETTES`, `FONT_PAIRS` | Built-in colour schemes and font pairings |

How it's put together:

- **`RENDER[type](w, site, el, o)`** writes one element's HTML. `o.edit` is true on the canvas, where elements carry `data-wv` and editable fields carry `data-wv-field`. In exported pages there are no editing markers at all.
- **`elementRules(site, el, o)`** writes an element's CSS from its `style` (width, colours, shapes, spacer height and so on).
- **`pageDocument(site, page, o, inc)`** wraps a page in the full HTML document: head, meta tags, Open Graph tags, canonical link, header, `<main>` and footer.
- The published site's layout:
  - `index.html`, then one file per page (from its slug),
  - `css/style.css`,
  - `js/site.js` (only if needed),
  - `images/` and `media/`,
  - `sitemap.xml` and `robots.txt` when a domain is set,
  - `CNAME` when the host is GitHub Pages.

**Rules every output must follow:**

- Valid HTML5 that passes `html-validate:recommended` (checked by `npm test`).
- Escape all user text with `esc()` / `escAttr()`.
- Pages must work without JavaScript; the script only adds behaviour.
- Animations go behind `prefers-reduced-motion`.
- Never write a literal closing script tag inside `generator.js` strings. Write `<\/script>`, because the browser version inlines this file inside a `<script>` element.

---

## 7. The editor

`renderer/editor.js` is the whole UI. Its main parts, in roughly the order they appear in the file:

| Area | What to look for |
| --- | --- |
| State | `site`, `assets`, `pageId`, `sel` (`{kind:'el'|'section'|'header'|'footer'|'page', id}`), history |
| Changes | `changed(o)`, `setEl(el, fn, key, o)`, `undoRedo()`, `normalizeSite()` |
| Canvas | `initCanvas`, `onCanvasLoad`, `renderCanvas`, `applySelection`, `buildToolbar`, `onCanvasClick`, `onCanvasKey`, `commitField`, `sanitizeRich` |
| Drag and drop | `computeTarget`, `showDropLine`, `applyDrop`; HTML5 drag from the palette and grip; pointer drag of existing items (`onCanvasPointerDown/Move/Up`) |
| Resize | `addResizeHandles`, `doResize` |
| Right panel | `renderPanel`, `elementPanel`, `sectionPanel`, `pagePanel`, `headerPanel`, `footerPanel`, `menuLinksEditor` |
| Controls | `field`, `inputCtl`, `selectCtl`, `segCtl`, `toggleCtl`, `colorCtl`, `rangeCtl`, `imageCtl`, `linkCtl`, `widthCtl` |
| Per-type content | `CONTENT[type](el)` returns that element's panel controls |
| Look options | `STYLE_SUPPORT[type]` lists which style controls the element offers |
| Left tabs | `renderAddTab`, `renderPagesTab`, `renderDesignTab` |
| Features | `checkSpelling`, `domainWizard`, `domainChecker`, `importWebsite`, `publish`, `templateChooser` |
| Commands | `COMMANDS` maps menu and shortcut names to functions |
| Browser drafts | `saveDraftNow`, `scheduleDraft` (browser version only, in `localStorage`) |

### The change cycle

Every edit goes through `changed()`:

```js
setEl(el, () => { el.props.text = v; }, 'text');      // change + history key
changed({ panel: true, pages: true, design: true, render: false });
```

- The `key` merges rapid edits of the same field (typing) into one undo step.
- `render` (default true) redraws the canvas. `panel`, `pages` and `design` redraw those panels.

### The canvas

The canvas is a same-origin `srcdoc` iframe. `#wv-root` holds the page HTML from `renderEditPage`. `#wv-ui` is an overlay for the selection outline, toolbar, drop line and resize handles. These markers link the HTML back to the model:

| Attribute | Means |
| --- | --- |
| `data-wv="<elementId>"` | an element |
| `data-wv-section="<sectionId>"` | a section |
| `data-wv-col="<sectionId>:<index>"` | a column |
| `data-wv-part="header|footer"` | header or footer |
| `data-wv-field="<prop>"` | an editable text field (`contenteditable`) |

Text fields are `plaintext-only`, except the text element, which is rich and is cleaned by `sanitizeRich()` on commit.

### Desktop or browser

`const api = window.weaver || null; const DESKTOP = !!api;`. Guard every bridge call with `DESKTOP`, and give the browser version a sensible fallback.

### Test hook

`window.__weaver` exposes `site`, `sel`, `select()`, `findElement()`, `renderCanvas()`, `setLeftTab()` and more, for automated tests.

---

## 8. The main process and the bridge

`main.js` handles the window, menus, a single-instance lock, `.pocketweb` file association, the close guard for unsaved work, and settings (`settings.json` in the user-data folder).

### IPC

Handlers are registered with a small `handle(channel, fn)` wrapper. It returns `{ ok: true, value }` or `{ ok: false, error }`, and `preload.js` turns that back into a resolved or rejected promise.

| Bridge function (`window.weaver.…`) | Channel | Does |
| --- | --- | --- |
| `init()` | `app:init` | Version, platform, last project |
| `openProject(path?)` | `project:open` | Open dialog, read and decode a project |
| `saveProject(path?, payload, name)` | `project:save` | Save dialog, write the project |
| `exportSite(folder?, files, known)` | `site:export` | Write the published website |
| `importFolder()` | `site:importFolder` | Pick and read a website folder |
| `previewInBrowser(files, entry)` | `site:previewInBrowser` | Open the site in the system browser |
| `reveal(folder)`, `openPublished(folder)` | `shell:…` | Show the folder, open the home page |
| `licence()` | `app:licence` | The LICENSE text |
| `spellLanguage(lang)`, `spellAddWord(w)`, `spellEnabled()` | `spell:…` | Spell checker settings |
| `isMisspelled(w)`, `spellSuggestions(w)` | (webFrame, no IPC) | Used by the whole-site spelling check |
| `checkDomain(domain)` | `dns:check` | DNS lookups for the domain wizard |
| `setPreview(files)`, `setDirty(d)`, `closeNow()` | one-way sends | Preview files, unsaved flag, close |
| `onMenu(cb)`, `onOpenFile(cb)` | events | Menu commands, files opened from the OS |

### Preview protocol

`weaver-preview://` serves the current set of generated files from memory, so Preview runs the real published HTML, CSS and JavaScript. The editor sends them with `setPreview(files)`.

### Spelling

The window has `spellcheck: true`. A `context-menu` handler offers suggestions, Add to dictionary and the usual edit commands. `setSpellLanguage()` matches the website's language to `session.availableSpellCheckerLanguages`. On macOS, the system picks the language itself.

---

## 9. Project files

A `.pocketweb` file is JSON:

```json
{
  "format": "pocket-project",
  "version": 2,
  "app": "Pocket-Web-Studio 2.1.0",
  "saved": "2026-11-14T12:00:00.000Z",
  "site": { … },
  "assets": { "photo-1.webp": { "mime": "image/webp", "w": 1600, "h": 1067, "data": "<base64>" } }
}
```

- `readProject()` also accepts the older formats `ezy-project` and `weaver-project`, and the extensions `.ezyweb` and `.weaver`.
- `writeProject()` writes to `<file>.saving` and then renames it, so a crash can't leave a half-written project.
- Placeholder pictures (`placeholder-*`) are generated on the fly and never saved.
- When you change the model, keep old files opening: give new fields defaults in `normalizeSite()` rather than changing what existing fields mean.

---

## 10. The importer

`renderer/importer.js` (global `EzyImporter.importSite(fileList, helpers)`) runs in the renderer. It loads each HTML page into a hidden frame and reads its layout. It recognises sections, columns, headings, text, pictures, galleries, buttons, tables, quotes, questions, videos and maps, plus the site's colours, fonts, logo, menu and footer. Anything else becomes an `html` ("Own code") element, so nothing is lost. It returns the new site, its assets and a report.

If you add an element type, consider teaching the importer to recognise it.

---

## 11. Recipes

### Add a new element type

1. **`templates.js`**: add `{ type, label, group }` to `ELEMENTS` and a `DEFAULTS[type]` function for its starting `props`.
2. **`generator.js`**: add `RENDER[type](w, site, el, o)`. In edit mode, mark text fields with `ed(o, 'prop', 'single'|'rich')`. Add any CSS to the stylesheet builder and any script to `buildJs()`, included only when the element is used.
3. **`editor.js`**: add `CONTENT[type] = el => [ …controls ]` for its panel, a `STYLE_SUPPORT[type]` entry for its Look options, and an `ICON[type]` SVG for the Add tab.
4. **Spelling**: if it has text in new prop names, add them to `SPELL_KEYS`.
5. **`checkSite()`**: add warnings if it can be left in a broken state.
6. **Tests**: `test/generate.js` already puts every element from `ELEMENTS` on a page and validates it. Run `npm test`.
7. **Docs**: add it to the element table in the User Guide and the README.

### Add a ready-made section

Add `{ key, label, make(ctx) }` to `SECTIONS` in `templates.js`. `make` returns an array of section objects built with `makeSectionObj()` and `makeElement()`.

### Add a style option

1. Add the field to the element's `style`.
2. Output it in `elementRules()`.
3. Add the control in `stylePanel()` and list it in `STYLE_SUPPORT` for the types that support it.

### Add a menu command

1. Add `item('Label', 'command-name', 'Accelerator')` in `buildMenu()` in `main.js`.
2. Add `'command-name': fn` to `COMMANDS` in `editor.js`.
3. If it should work in the browser version, wire a button or shortcut in the editor too.

### Add a bridge function

1. In `main.js`: `handle('area:action', async (args) => value)`.
2. In `preload.js`: `actionName: (…) => call('area:action', …)`.
3. In `editor.js`: call `api.actionName()` behind `if (DESKTOP)`.

---

## 12. Testing

### Automated: `npm test`

`test/generate.js`:

- builds the three starter websites,
- adds a page using **every element and every ready-made section**,
- exercises drop-downs, menu links, links, widths, shapes, spacer height and a domain on the business site,
- writes everything to `test/output/`,
- runs [html-validate](https://html-validate.org) (rules in `test/htmlvalidate.json`) on every page,
- asserts that key output is present (drop-down markup, `sitemap.xml`, `robots.txt`, `CNAME`, canonical links).

It must pass before you push. The GitHub workflow runs it on every push and pull request.

### By hand

Before a release, check in the running app:

- [ ] Each starter opens. Edit text, change pictures, undo and redo.
- [ ] Drag from the Add tab, drag existing elements and sections, resize with the handles.
- [ ] Pages: add, reorder, put one in a drop-down, delete the parent.
- [ ] Preview at all three sizes; the drop-down menu works with mouse and keyboard.
- [ ] Spelling: underlines, right-click suggestions, F7 check.
- [ ] Domain wizard: all four hosts, and Check my domain.
- [ ] Save, close, reopen. Open an older `.ezyweb` or `.weaver` file.
- [ ] Import a simple website folder.
- [ ] Publish to a folder, then open `index.html` in a browser.

### Headless

Electron can be scripted for UI tests. Load `main.js` from a small test script, wait for `did-finish-load`, then drive the UI with `webContents.executeJavaScript()` (using `window.__weaver`) and real input with `webContents.sendInputEvent()`. On Linux without a display, run it under `xvfb-run`.

---

## 13. Building and releasing

### On GitHub (recommended)

`.github/workflows/build.yml` does two things:

- **Every push and pull request:** runs `npm ci` and `npm test` on Ubuntu.
- **A version tag (`v*`) or the Run workflow button:** builds, on GitHub's own machines,
  - the Windows setup `.exe` (NSIS),
  - the Linux AppImage and `.deb`,
  - the macOS `.dmg`,

  and attaches them to a **GitHub Release**. Nothing is uploaded as an Actions artifact.

To release a new version:

1. Change `"version"` in `package.json` (for example to `2.2.0`) and run `npm install` so `package-lock.json` matches.
2. In GitHub Desktop, commit ("Version 2.2.0") and click **Push origin**.
3. On GitHub.com, open the repository, then **Releases › Draft a new release**.
4. Under **Choose a tag**, type `v2.2.0` and choose **Create new tag on publish**. Give it a title and notes, then click **Publish release**.
5. Creating the tag starts the workflow. After about 10–15 minutes, the installers appear on that release.

Or open the **Actions** tab, choose **Build**, then **Run workflow**. The release is named from the version in `package.json`. Running it again for the same version adds the new files to that release.

The builds are not code-signed (`CSC_IDENTITY_AUTO_DISCOVERY=false`), so Windows SmartScreen and macOS Gatekeeper warn on first open.

### On your own computer

```
npm run dist:win     # Windows installer and portable zip, in dist/
npm run dist:linux   # AppImage and .deb
npm run dist:mac     # .dmg (on a Mac)
```

`build/after-pack.js` stamps the icon and version details into the Windows `.exe` using `resedit`, so the zip can be made without Wine (`signAndEditExecutable` is off). The NSIS setup `.exe` itself still needs Windows (or Wine), which is why the GitHub workflow builds it on a Windows machine.

### Packaging settings

These are in `package.json` under `build`:

- `appId: studio.pocket.web`. Changing it makes Windows treat the app as a different program.
- `productName: Pocket-Web-Studio`.
- The editor's own fonts (IBM Plex Sans and Mono) come from the `@fontsource` packages and are packed from `node_modules`.
- File associations for `.pocketweb`.
- `files`: the list of what's packed. Add any new runtime file or folder here, or it won't be in the installed app.

### The browser version

The browser version is the renderer inlined into one HTML file: the scripts and stylesheet are inlined and the logo becomes a data URI. With no `window.weaver`, the editor switches to browser mode by itself. Keep `generator.js` free of literal closing script tags (see [The generator](#6-the-generator)).

---

## 14. Code style and conventions

- Plain modern JavaScript (ES2022), `'use strict'` in Node files, no dependencies in the renderer.
- Two-space indentation and single quotes.
- Keep the UI words plain and friendly. The audience doesn't code: say "picture", not "image asset", and "website address", not "FQDN". Use UK English in the interface.
- Every control needs a visible label or an `aria-label`. Everything must work from the keyboard.
- Don't add network calls from the renderer. The CSP blocks them, and the app should work offline (apart from fonts and embeds the user chooses).
- Update the **User Guide**, **README** and **feature list** when you add or change a feature.

---

## 15. Licence and credits

- Code: MIT licence, Copyright (c) 2026 Pocket-Designs (pocket-designs@proton.me). See [LICENSE](../LICENSE).
- The product icon (`build/icon.png`, `build/icon.ico`, `renderer/logo.png`) is by **MJO-Art** (workmjo@gmail.com), all rights reserved. It is **not** covered by the MIT licence and can't be altered or reused without the artist's permission.
- Third-party parts (Electron, Chromium, IBM Plex fonts) are listed in the LICENSE file.
- Websites made with Pocket-Web-Studio belong to the people who make them.
