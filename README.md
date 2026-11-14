# Pocket-Web-Studio

A drag-and-drop website builder for people who don't write code. Build pages visually and Pocket-Web-Studio writes the HTML, CSS and JavaScript for you.

## What you can do

- **Drag and drop.** Drag elements and ready-made sections from the left onto your page. A blue line shows where they will land. To rearrange your page, press on anything already on it — a picture, a card, a whole section — and drag it somewhere else.
- **Type on the page.** Click any text to change it. Select words in a text box to make them bold, italic, a list or a link.
- **Resize things.** Drag the round handle on the edge of a picture, card, gallery, table, text box and more to set its width, or use the Width slider. Drag the bottom handle of a space to set its height. Crop pictures to square, portrait, wide or circle shapes.
- **Links.** Add a Link element, turn any heading, button, picture or card into a link, or select words in a text box and press Ctrl+K. Links can go to another page, a section of a page, a web address, an email address or a phone number.
- **Drop-down menus.** Put pages under another page to make a drop-down in the header menu, and add extra menu links to other websites. Drop-downs work with the mouse, the keyboard and on phones.
- **Spell checker.** Mistakes are underlined as you type; right-click for suggestions. Press F7 to check every page at once, change a word everywhere, or add it to your dictionary. The dictionary follows your website's language.
- **Your own domain and free HTTPS.** A step-by-step guide gives you the exact DNS records for GitHub Pages, Netlify, Cloudflare Pages or your own server, checks whether your domain is pointing the right way, and shows how to switch on a free Let's Encrypt certificate (including ready-to-copy Caddy and Certbot commands). With a domain set, Publish also writes `sitemap.xml`, `robots.txt`, canonical links and, for GitHub Pages, the `CNAME` file.
- **Elements:** heading, text box, button, link, picture, line, space, gallery, slideshow, video (YouTube, Vimeo or your own file), map, scrolling text, card, quote, table, questions and answers, contact form, and your own HTML.
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

## Building the installers on GitHub

The repository includes a GitHub Actions workflow (`.github/workflows/build.yml`), so you don't need Windows, a Mac or Wine to build:

1. Push the project to a GitHub repository. Every push and pull request runs the tests.
2. To build the installers, create a release on GitHub.com (**Releases › Draft a new release**, type a new tag such as `v2.1.0`, then **Publish release**), or open the **Actions** tab, choose **Build** and press **Run workflow**.
3. GitHub builds the Windows setup (.exe), the Linux AppImage and .deb, and the macOS .dmg, and attaches them to a GitHub Release. Download them from the repository's **Releases** page.

The builds are not code-signed, so Windows SmartScreen and macOS Gatekeeper will warn the first time they are opened.

## Building an installer on your own computer

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
| Add a link to selected words | Ctrl+K |
| Check spelling on every page | F7 |
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
docs/                 User Guide and Developer Guide
.github/workflows/    Builds the installers on GitHub
build/                App icon and the Windows build step
```

## Guides

- [User Guide](docs/USER-GUIDE.md): how to build and publish a website with Pocket-Web-Studio.
- [Developer Guide](docs/DEVELOPER-GUIDE.md): how the code works, and how to test, build and release it.

## Author

Pocket-Designs · pocket-designs@proton.me

## Licence

MIT. Copyright (c) 2026 Pocket-Designs. See [LICENSE](LICENSE).

The product icon (`build/icon.png`, `build/icon.ico` and `renderer/logo.png`) is not covered by the MIT licence. It is by MJO-Art (workmjo@gmail.com), all rights reserved, and can't be altered or used without the artist's permission. Websites you make with Pocket-Web-Studio belong to you and can be licensed however you like.
