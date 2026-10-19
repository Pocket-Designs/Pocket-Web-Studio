# Pocket-Web-Studio

A drag-and-drop website builder for people who don't write code. Build pages visually and Pocket-Web-Studio writes the HTML, CSS and JavaScript for you.

## What you can do

- **Drag and drop.** Drag elements and ready-made sections from the left onto your page. A blue line shows where they will land. Drag the handle on any selected item to move it.
- **Type on the page.** Click any text to change it. Select words in a text box to make them bold, italic, a list or a link.
- **Elements:** heading, text box, button, picture, line, space, gallery, slideshow, video (YouTube, Vimeo or your own file), map, scrolling text, card, quote, table, questions and answers, contact form, and your own HTML.
- **Ready-made sections:** big banner, picture and text, three cards, gallery, full-width slideshow, testimonial, call to action, questions, contact, scrolling banner, video, and empty 1, 2 or 3-column layouts.
- **Colours and fonts.** Choose a colour scheme or set your own five colours. Every element's colour picker offers your scheme first, so the whole site changes together. There are nine font pairings, plus 19 fonts to mix.
- **Movement.** Make elements fade, rise, slide or zoom in as visitors scroll. Keep pictures floating, pulsing, swaying or spinning. Slideshows can slowly zoom, banners can scroll and backgrounds can stay still while the page moves (parallax). Movement switches off for visitors who have asked their device for less motion.
- **Pictures.** Drag photos straight from your computer onto the page, a gallery or a slideshow. Large photos are resized and compressed automatically, so a 4 MB camera photo becomes a fast-loading WebP of a few hundred KB.
- **Import an existing website.** Choose a folder of HTML, CSS and pictures and Pocket-Web-Studio rebuilds it as pages you can edit: sections, columns, headings, text, pictures, galleries, buttons, tables, quotes, questions, videos and maps, plus the site's colours, fonts, logo, menu order and footer. Anything without a matching element (such as forms or widgets) is kept as "Own code". The original files are never changed.
- **Pages.** Add, rename, reorder and duplicate pages. The menu and footer links update themselves.
- **Preview** your site with all its effects working, at computer, tablet and phone sizes.
- **Code view** shows the code Pocket-Web-Studio has written. It's read-only, for the curious.
- **Publish** writes the finished website to a folder you can upload to any web host. A check first points out missing picture descriptions, buttons that go nowhere and forms with no address.

## Standards

Pocket-Web-Studio writes modern, standards-based code:

- HTML5 with `<header>`, `<nav>`, `<main>`, `<section>`, `<figure>`, `<details>` and `<dialog>`, a skip link, `lang` and page descriptions
- Every generated page passes [html-validate](https://html-validate.org)'s recommended rules, including its accessibility checks (`npm test`)
- Responsive CSS with Grid, Flexbox, `clamp()`, `aspect-ratio`, `color-mix()` and custom properties. Columns stack on phones.
- Images carry `width`/`height`, `loading="lazy"` and `decoding="async"`. The first section's images load with high priority.
- JavaScript is a small dependency-free script holding only the features your site uses. Pages work without it.
- `prefers-reduced-motion` is respected everywhere

## Running from source

You need [Node.js](https://nodejs.org/) 18 or newer.

```bash
npm install
npm start          # run the app
npm test           # generate sample sites and check them against the HTML standard
```

## Building an installer

```bash
npm run dist:win     # Windows installer and portable zip, in dist/
npm run dist:linux   # AppImage and .deb
npm run dist:mac     # .dmg (run this on a Mac)
```

Websites are saved as `.pocketweb` project files (older `.ezyweb` and `.weaver` files still open), and double-clicking one opens it in Pocket-Web-Studio.

## Keyboard shortcuts

| Action | Shortcut |
| --- | --- |
| New website / Open / Save | Ctrl+N / Ctrl+O / Ctrl+S |
| Import a website | Ctrl+I |
| Undo / Redo | Ctrl+Z / Ctrl+Y |
| Duplicate selected item | Ctrl+D |
| Delete selected item | Delete |
| Edit / Preview / Code | Ctrl+1 / Ctrl+2 / Ctrl+3 |
| Preview in your browser | F12 |
| Publish | Ctrl+P |

On a Mac, use Cmd instead of Ctrl.

## Project layout

```
main.js               Electron main process: window, menus, project files, publishing, preview
preload.js            The small, safe bridge between the editor and main.js
renderer/
  index.html          The editor window
  editor.js           Canvas, drag and drop, panels, pages, design, preview, publish
  generator.js        Turns your design into HTML, CSS and JavaScript
  templates.js        Elements, ready-made sections and starter websites
  importer.js         Turns an existing website folder into editable Pocket-Web-Studio pages
  highlight.js        Syntax colouring for the Code view
  styles.css          The editor's look
test/generate.js      Generates sample sites and validates them
build/                App icon and the Windows build step
```

## Author

project-tech-me · project-tech-me@protonmail.com

## Licence

MIT. Copyright (c) 2026 project-tech-me. See [LICENSE](LICENSE).

The product icon (`build/icon.png`, `build/icon.ico` and `renderer/logo.png`) is not covered by the MIT licence. It is by MJO-Art (workmjo@gmail.com), all rights reserved, and can't be altered or used without the artist's permission. Websites you make with Pocket-Web-Studio belong to you and can be licensed however you like.
