// Pocket-Web-Studio — elements, ready-made sections and starter websites
// Copyright (c) 2026 project-tech-me. MIT licence, see LICENSE.
(function (root, factory) {
  const api = factory(root.WeaverGen || (typeof require === 'function' ? require('./generator.js') : null));
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.WeaverTemplates = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (Gen) {
'use strict';

/* ---------- placeholder pictures ---------- */
const PH = [
  ['#9cc3d5', '#e3eef3', '#5f8fa6'],
  ['#f2b680', '#fde3c8', '#c9773f'],
  ['#a7c99a', '#e4efdc', '#5f8a52'],
  ['#c3b1e1', '#ece6f6', '#7d68a8'],
  ['#e9a8a8', '#f8e1df', '#b45f5f'],
  ['#b9c4cf', '#eef1f4', '#6d7c8b']
];
const PLACEHOLDER_COUNT = PH.length;
function placeholderSvg(i) {
  const [a, b, c] = PH[(i - 1 + PH.length) % PH.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></linearGradient></defs>
<rect width="1200" height="800" fill="url(#g)"/>
<circle cx="860" cy="250" r="90" fill="#ffffff" fill-opacity="0.75"/>
<path d="M0 620 L260 380 L470 560 L640 420 L900 640 L1200 470 L1200 800 L0 800 Z" fill="${c}" fill-opacity="0.55"/>
<path d="M0 700 L320 520 L560 680 L820 560 L1200 720 L1200 800 L0 800 Z" fill="${c}" fill-opacity="0.8"/>
</svg>`;
}

/* ---------- element catalogue ---------- */
const ELEMENTS = [
  { type: 'heading', label: 'Heading', group: 'Basics' },
  { type: 'text', label: 'Text box', group: 'Basics' },
  { type: 'button', label: 'Button', group: 'Basics' },
  { type: 'image', label: 'Picture', group: 'Basics' },
  { type: 'link', label: 'Link', group: 'Basics' },
  { type: 'divider', label: 'Line', group: 'Basics' },
  { type: 'spacer', label: 'Space', group: 'Basics' },
  { type: 'gallery', label: 'Gallery', group: 'Pictures & media' },
  { type: 'slideshow', label: 'Slideshow', group: 'Pictures & media' },
  { type: 'video', label: 'Video', group: 'Pictures & media' },
  { type: 'map', label: 'Map', group: 'Pictures & media' },
  { type: 'ticker', label: 'Scrolling text', group: 'Pictures & media' },
  { type: 'card', label: 'Card', group: 'Content' },
  { type: 'quote', label: 'Quote', group: 'Content' },
  { type: 'table', label: 'Table', group: 'Content' },
  { type: 'faq', label: 'Questions', group: 'Content' },
  { type: 'form', label: 'Contact form', group: 'Content' },
  { type: 'html', label: 'Own code', group: 'Content' }
];
const LABELS = Object.fromEntries(ELEMENTS.map(e => [e.type, e.label]));

function defaultFields() {
  return [
    { key: 'name', label: 'Your name', on: true, required: true },
    { key: 'email', label: 'Email address', on: true, required: true },
    { key: 'phone', label: 'Phone number', on: false, required: false },
    { key: 'subject', label: 'Subject', on: false, required: false },
    { key: 'message', label: 'Message', on: true, required: true }
  ];
}

const DEFAULTS = {
  heading: () => ({ text: 'Your heading', level: 2 }),
  text: () => ({ html: '<p>Click here and start typing. Select some words to make them <strong>bold</strong>, <em>italic</em> or a link.</p>' }),
  button: () => ({ text: 'Find out more', link: '', newTab: false, variant: 'filled', size: 'md' }),
  link: () => ({ text: 'Read more', link: '', newTab: false, arrow: true }),
  image: ctx => ({ src: ctx.ph(1), alt: '', caption: '', link: '', newTab: false }),
  gallery: ctx => ({ images: [1, 2, 3, 4, 5, 6].map(i => ({ src: ctx.ph(i), alt: '', caption: '' })), columns: 3, ratio: 'square', gap: 'md', lightbox: true }),
  slideshow: ctx => ({ slides: [1, 3, 2].map((i, n) => ({ src: ctx.ph(i), alt: '', caption: ['First slide', 'Second slide', 'Third slide'][n] })), autoplay: 5, ratio: 'wide', arrows: true, dots: true, kenburns: false, label: '' }),
  video: () => ({ source: 'url', url: '', file: null, title: '', autoplay: false, loop: false, muted: false, controls: true, ratio: 'wide' }),
  map: () => ({ address: '', zoom: 15, ratio: 'landscape' }),
  ticker: () => ({ text: 'Your news here  ✦  Open seven days a week  ✦  Free local delivery', speed: 'normal' }),
  card: ctx => ({ image: ctx.ph(2), alt: '', title: 'Card title', text: 'A short description of this item, service or idea.', buttonText: 'Learn more', link: '', newTab: false }),
  quote: () => ({ text: '“Wonderful service from start to finish. I would recommend them to anyone.”', cite: 'Sam Carter, customer' }),
  table: () => ({ rows: [['Item', 'Details', 'Price'], ['First item', 'Short description', '£10.00'], ['Second item', 'Short description', '£12.50'], ['Third item', 'Short description', '£8.00']], header: true, striped: true, caption: '' }),
  faq: () => ({ items: [
    { q: 'What are your opening hours?', a: 'We are open Monday to Saturday, 9am to 5pm.' },
    { q: 'Do you deliver?', a: 'Yes, we deliver within ten miles. Delivery is free on orders over £30.' },
    { q: 'How can I get in touch?', a: 'Use the contact form on this site, or give us a call during opening hours.' }
  ], single: false }),
  form: () => ({ mode: 'email', email: '', action: '', submitText: 'Send message', fields: defaultFields() }),
  divider: () => ({ variant: 'line' }),
  spacer: () => ({ size: 'md' }),
  html: () => ({ code: '<!-- Paste your own HTML here, such as a booking widget or newsletter sign-up. -->\n<p>Your own code goes here.</p>' })
};

function makeElement(type, ctx, props, style) {
  const base = DEFAULTS[type] ? DEFAULTS[type](ctx) : {};
  return { id: ctx.id(), type, props: Object.assign(base, props || {}), style: Object.assign({}, style || {}) };
}

function makeSectionObj(ctx, layout, columns, opts) {
  return Object.assign({
    id: ctx.id(), layout: layout || '1',
    columns: (columns || [[]]).map(els => ({ id: ctx.id(), elements: els })),
    padding: 'md', width: 'contained', valign: 'top', height: 'auto',
    bg: '', bgImage: null, overlay: 40, parallax: false, textColor: 'auto', anchor: ''
  }, opts || {});
}

/* ---------- ready-made sections ---------- */
const E = (ctx, type, props, style) => makeElement(type, ctx, props, style);
const SECTIONS = [
  { key: 'blank', label: 'Empty', thumb: 'blank', make: ctx => [makeSectionObj(ctx, '1', [[]])] },
  { key: 'two', label: 'Two columns', thumb: 'two', make: ctx => [makeSectionObj(ctx, '1-1', [[], []])] },
  { key: 'three', label: 'Three columns', thumb: 'three', make: ctx => [makeSectionObj(ctx, '1-1-1', [[], [], []])] },
  { key: 'hero', label: 'Big banner', thumb: 'hero', make: ctx => [makeSectionObj(ctx, '1', [[
    E(ctx, 'heading', { text: 'A big, bold welcome', level: 1 }, { align: 'center', anim: 'up' }),
    E(ctx, 'text', { html: '<p>One or two sentences that tell visitors what you do and why they should stay.</p>' }, { align: 'center', size: 'lg', anim: 'up' }),
    E(ctx, 'button', { text: 'Get started', size: 'lg' }, { align: 'center', anim: 'up' })
  ]], { bgImage: ctx.ph(1), overlay: 45, height: 'half', padding: 'lg' })] },
  { key: 'imageText', label: 'Picture and text', thumb: 'imageText', make: ctx => [makeSectionObj(ctx, '1-1', [
    [E(ctx, 'image', { src: ctx.ph(2) }, { anim: 'left' })],
    [E(ctx, 'heading', { text: 'Tell your story' }), E(ctx, 'text', { html: '<p>Use this space to explain who you are, what you offer and what makes you different.</p>' }), E(ctx, 'button', { text: 'Read more', variant: 'outline' })]
  ], { valign: 'center' })] },
  { key: 'textImage', label: 'Text and picture', thumb: 'textImage', make: ctx => [makeSectionObj(ctx, '1-1', [
    [E(ctx, 'heading', { text: 'Something worth showing' }), E(ctx, 'text', { html: '<p>Pair a few lines of text with a picture to highlight a product, a place or a person.</p>' })],
    [E(ctx, 'image', { src: ctx.ph(3) }, { anim: 'right' })]
  ], { valign: 'center' })] },
  { key: 'features', label: 'Three cards', thumb: 'features', make: ctx => [
    makeSectionObj(ctx, '1', [[E(ctx, 'heading', { text: 'What we offer' }, { align: 'center' })]], { padding: 'md' }),
    makeSectionObj(ctx, '1-1-1', [1, 2, 3].map((n, i) => [E(ctx, 'card', { image: ctx.ph(n + 1), title: ['First thing', 'Second thing', 'Third thing'][i] }, { anim: 'up' })]), { padding: 'sm', valign: 'stretch' })
  ] },
  { key: 'gallery', label: 'Gallery', thumb: 'gallery', make: ctx => [makeSectionObj(ctx, '1', [[
    E(ctx, 'heading', { text: 'Gallery' }, { align: 'center' }), E(ctx, 'gallery')
  ]])] },
  { key: 'slideshow', label: 'Full-width slideshow', thumb: 'slideshow', make: ctx => [makeSectionObj(ctx, '1', [[
    E(ctx, 'slideshow', { ratio: 'panorama', kenburns: true }, { radius: 'none' })
  ]], { width: 'full', padding: 'none' })] },
  { key: 'quote', label: 'Testimonial', thumb: 'quote', make: ctx => [makeSectionObj(ctx, '1', [[
    E(ctx, 'quote', {}, { align: 'center', anim: 'fade' })
  ]], { bg: 'surface' })] },
  { key: 'cta', label: 'Call to action', thumb: 'cta', make: ctx => [makeSectionObj(ctx, '1', [[
    E(ctx, 'heading', { text: 'Ready when you are' }, { align: 'center' }),
    E(ctx, 'text', { html: '<p>Give visitors one clear next step.</p>' }, { align: 'center' }),
    E(ctx, 'button', { text: 'Contact us', variant: 'accent', size: 'lg' }, { align: 'center' })
  ]], { bg: 'primary', padding: 'lg' })] },
  { key: 'faq', label: 'Questions', thumb: 'faq', make: ctx => [makeSectionObj(ctx, '1-2', [
    [E(ctx, 'heading', { text: 'Questions and answers' })],
    [E(ctx, 'faq')]
  ])] },
  { key: 'contact', label: 'Contact', thumb: 'contact', make: ctx => [makeSectionObj(ctx, '1-1', [
    [E(ctx, 'heading', { text: 'Get in touch' }), E(ctx, 'text', { html: '<p>We usually reply within one working day.</p><p><strong>Phone</strong><br>01234 567890</p><p><strong>Address</strong><br>1 High Street<br>Your Town</p>' })],
    [E(ctx, 'form')]
  ])] },
  { key: 'ticker', label: 'Scrolling banner', thumb: 'ticker', make: ctx => [makeSectionObj(ctx, '1', [[
    E(ctx, 'ticker', {}, { radius: 'none' })
  ]], { width: 'full', padding: 'none' })] },
  { key: 'video', label: 'Video', thumb: 'video', make: ctx => [makeSectionObj(ctx, '1', [[
    E(ctx, 'heading', { text: 'Watch the video' }, { align: 'center' }), E(ctx, 'video', {}, { width: '75', align: 'center' })
  ]])] }
];

/* ---------- starter websites ---------- */
function baseSite(name, palette, pair, ctx) {
  const fp = Gen.FONT_PAIRS.find(p => p.name === pair) || Gen.FONT_PAIRS[0];
  return {
    format: 'pocket-site', version: 2, name,
    theme: { palette, colors: Object.assign({}, Gen.PALETTES[palette]), fonts: { heading: fp.heading, body: fp.body }, radius: 'soft' },
    header: { show: true, logoText: name, logoImage: null, layout: 'split', sticky: true, bg: 'surface', color: '', menuLinks: [] },
    footer: { show: true, text: '© {year} ' + name + '. All rights reserved.', showNav: true, bg: 'text', color: '' },
    pages: [],
    settings: { language: 'en-GB', favicon: null, publishFolder: null, domain: '', host: '' }
  };
}
const page = (ctx, name, sections, extra) => Object.assign({ id: ctx.id(), name, title: '', description: '', showInNav: true, sections }, extra || {});
const sec = (ctx, key) => SECTIONS.find(s => s.key === key).make(ctx);

const STARTERS = [
  { key: 'blank', label: 'Blank website', text: 'One empty page with a header and footer. Build it your way.', palette: 'Slate' },
  { key: 'business', label: 'Small business', text: 'Home, About and Contact pages for a shop, café or local service.', palette: 'Harbour' },
  { key: 'portfolio', label: 'Portfolio', text: 'A dark, picture-led site for photographers, artists and makers.', palette: 'Midnight' }
];

function makeSite(kind, ctx) {
  if (kind === 'business') {
    const site = baseSite('Harbour Lane Bakery', 'Harbour', 'Classic', ctx);
    const home = page(ctx, 'Home', [], { description: 'Small-batch sourdough, pastries and celebration cakes baked fresh every morning on Harbour Lane.' });
    const about = page(ctx, 'Our story', [], { description: 'Meet the bakers behind Harbour Lane and learn how we make our bread.' });
    const contact = page(ctx, 'Visit us', [], { description: 'Opening hours, directions and how to order from Harbour Lane Bakery.' });
    site.pages.push(home, about, contact);
    home.sections = [
      makeSectionObj(ctx, '1', [[
        E(ctx, 'text', { html: '<p>SAMPLE WEBSITE · CHANGE ANYTHING</p>' }, { align: 'center', size: 'sm', anim: 'fade' }),
        E(ctx, 'heading', { text: 'Fresh bread, baked before sunrise', level: 1 }, { align: 'center', anim: 'up' }),
        E(ctx, 'text', { html: '<p>Small-batch sourdough, buns and cakes from our wood-fired oven on Harbour Lane.</p>' }, { align: 'center', size: 'lg', anim: 'up' }),
        E(ctx, 'button', { text: 'Find us', link: 'page:' + contact.id, size: 'lg', variant: 'accent' }, { align: 'center', anim: 'up' })
      ]], { bgImage: ctx.ph(2), overlay: 45, height: 'half', padding: 'lg', parallax: true }),
      makeSectionObj(ctx, '1', [[E(ctx, 'ticker', { text: 'Open Tuesday to Sunday  ✦  Sourdough from 7am  ✦  Order celebration cakes 48 hours ahead' }, { radius: 'none' })]], { width: 'full', padding: 'none' }),
      makeSectionObj(ctx, '1-1', [
        [E(ctx, 'image', { src: ctx.ph(1), alt: '' }, { anim: 'left', shadow: true })],
        [E(ctx, 'heading', { text: 'Baked by hand, the slow way' }), E(ctx, 'text', { html: '<p>Every loaf rests for 36 hours before it meets the oven. It takes longer, and you can taste the difference.</p><p>We use flour milled twenty miles inland and butter from the farm down the road.</p>' }), E(ctx, 'button', { text: 'Our story', link: 'page:' + about.id, variant: 'outline' })]
      ], { valign: 'center' }),
      makeSectionObj(ctx, '1', [[E(ctx, 'heading', { text: 'This week’s bakes' }, { align: 'center' })]], { padding: 'sm', bg: 'surface' }),
      makeSectionObj(ctx, '1-1-1', [
        [E(ctx, 'card', { image: ctx.ph(2), title: 'Harbour sourdough', text: '800g loaf with a deep, crackling crust. £5.20', buttonText: '' }, { anim: 'up' })],
        [E(ctx, 'card', { image: ctx.ph(5), title: 'Cardamom knots', text: 'Brown butter, demerara and a lot of cardamom. £3.10', buttonText: '' }, { anim: 'up' })],
        [E(ctx, 'card', { image: ctx.ph(3), title: 'Seeded rye', text: 'Sunflower, flax and caraway. Keeps for a week. £4.60', buttonText: '' }, { anim: 'up' })]
      ], { padding: 'sm', bg: 'surface', valign: 'stretch' }),
      makeSectionObj(ctx, '1', [[E(ctx, 'quote', { text: '“The best sourdough on the coast. We drive forty minutes every Saturday for it.”', cite: 'Priya, regular since 2021' }, { align: 'center', anim: 'fade' })]]),
      makeSectionObj(ctx, '1', [[
        E(ctx, 'heading', { text: 'Visit us this weekend' }, { align: 'center' }),
        E(ctx, 'text', { html: '<p>12 Harbour Lane. Open from 7am, until we sell out.</p>' }, { align: 'center' }),
        E(ctx, 'button', { text: 'Opening hours and directions', link: 'page:' + contact.id, variant: 'accent' }, { align: 'center' })
      ]], { bg: 'primary', padding: 'lg' })
    ];
    about.sections = [
      makeSectionObj(ctx, '1', [[
        E(ctx, 'heading', { text: 'Two bakers, one oven, no shortcuts', level: 1 }, { anim: 'up' }),
        E(ctx, 'text', { html: '<p>We started in a fisherman’s shed in 2019 with a borrowed mixer and a sourdough starter called Gull. Everything is still shaped by hand.</p>' }, { size: 'lg' })
      ]], { padding: 'lg' }),
      makeSectionObj(ctx, '1-1', [
        [E(ctx, 'heading', { text: 'What we believe', level: 2 }), E(ctx, 'text', { html: '<ul><li><strong>Slow dough.</strong> Every loaf rests overnight.</li><li><strong>Local flour.</strong> Milled twenty miles inland.</li><li><strong>Nothing wasted.</strong> Day-old bread goes to the food bank.</li></ul>' })],
        [E(ctx, 'image', { src: ctx.ph(4), alt: '' }, { radius: 'lg', anim: 'right' })]
      ], { valign: 'center', bg: 'surface' }),
      makeSectionObj(ctx, '1', [[E(ctx, 'heading', { text: 'Inside the bakery' }), E(ctx, 'gallery', { columns: 3, ratio: 'landscape' })]])
    ];
    contact.sections = [
      makeSectionObj(ctx, '1-1', [
        [E(ctx, 'heading', { text: 'Come and say hello', level: 1 }), E(ctx, 'table', { rows: [['Day', 'Opening hours'], ['Tuesday to Friday', '7:00 to 15:00'], ['Saturday', '7:00 to 13:00'], ['Sunday', '8:00 to 12:00']], caption: '' })],
        [E(ctx, 'map', { address: 'Harbour Street, Whitstable', zoom: 15 })]
      ], { padding: 'lg' }),
      makeSectionObj(ctx, '1-2', [[E(ctx, 'heading', { text: 'Questions' })], [E(ctx, 'faq', { items: [
        { q: 'Can I order a celebration cake?', a: 'Yes. Please order at least 48 hours ahead using the form below.' },
        { q: 'Do you bake gluten-free bread?', a: 'Not yet. Our kitchen uses a lot of flour, so we can’t promise anything is free from gluten.' },
        { q: 'Is there parking?', a: 'There is a pay-and-display car park two minutes’ walk away on Gorrell Road.' }
      ] })]], { bg: 'surface' }),
      makeSectionObj(ctx, '1-1', [[E(ctx, 'heading', { text: 'Send us a message' }), E(ctx, 'text', { html: '<p>For orders, questions or wholesale enquiries.</p>' })], [E(ctx, 'form')]])
    ];
    return site;
  }
  if (kind === 'portfolio') {
    const site = baseSite('Ava Marsh Photography', 'Midnight', 'Editorial', ctx);
    site.header.bg = 'background';
    site.footer.bg = 'surface';
    site.theme.radius = 'square';
    const home = page(ctx, 'Home', [], { description: 'Landscape and portrait photography by Ava Marsh, based in the Lake District.' });
    const work = page(ctx, 'Work', [], { description: 'Selected landscape and portrait photographs by Ava Marsh.' });
    const contact = page(ctx, 'Contact', [], { description: 'Book a portrait session or ask about prints.' });
    site.pages.push(home, work, contact);
    home.sections = [
      makeSectionObj(ctx, '1', [[E(ctx, 'slideshow', { ratio: 'panorama', kenburns: true, slides: [
        { src: ctx.ph(1), alt: '', caption: 'Morning mist, Buttermere' },
        { src: ctx.ph(4), alt: '', caption: 'Last light, Catbells' },
        { src: ctx.ph(6), alt: '', caption: 'Winter, Wast Water' }
      ] }, { radius: 'none' })]], { width: 'full', padding: 'none' }),
      makeSectionObj(ctx, '1', [[
        E(ctx, 'heading', { text: 'Quiet places, patient light', level: 1 }, { align: 'center', anim: 'up' }),
        E(ctx, 'text', { html: '<p>I photograph the hills and lakes of Cumbria, and the people who live among them. Sample website: replace these words and pictures with your own.</p>' }, { align: 'center', size: 'lg', anim: 'up' }),
        E(ctx, 'divider', { variant: 'short' }, { align: 'center' })
      ]], { padding: 'lg' }),
      makeSectionObj(ctx, '1', [[E(ctx, 'gallery', { columns: 3, ratio: 'portrait', gap: 'sm' }, { anim: 'fade' })]], { width: 'wide', padding: 'sm' }),
      makeSectionObj(ctx, '1', [[
        E(ctx, 'quote', { text: '“Ava has a gift for finding stillness. Our family portraits are the best we have ever had.”', cite: 'The Hendersons, Keswick' }, { align: 'center' })
      ]], { padding: 'lg' }),
      makeSectionObj(ctx, '1', [[
        E(ctx, 'heading', { text: 'Book a session' }, { align: 'center' }),
        E(ctx, 'button', { text: 'Get in touch', link: 'page:' + contact.id, variant: 'accent', size: 'lg' }, { align: 'center', motion: 'float' })
      ]], { bg: 'surface', padding: 'lg' })
    ];
    work.sections = [
      makeSectionObj(ctx, '1', [[
        E(ctx, 'heading', { text: 'Selected work', level: 1 }),
        E(ctx, 'text', { html: '<p>Click any picture to see it larger.</p>' })
      ]], { padding: 'md' }),
      makeSectionObj(ctx, '1', [[E(ctx, 'gallery', { columns: 3, ratio: 'landscape', images: [1, 2, 3, 4, 5, 6, 1, 3, 5].map((i, n) => ({ src: ctx.ph(i), alt: '', caption: 'Photograph ' + (n + 1) })) })]], { width: 'wide', padding: 'sm' })
    ];
    contact.sections = [
      makeSectionObj(ctx, '1-1', [
        [E(ctx, 'heading', { text: 'Let’s make something', level: 1 }), E(ctx, 'text', { html: '<p>Portrait sessions, commissions and print sales. I reply to every message within two days.</p>' }), E(ctx, 'faq', { items: [
          { q: 'Where do you work?', a: 'Mostly across Cumbria and the Yorkshire Dales. I travel further for weddings.' },
          { q: 'Can I buy prints?', a: 'Yes. All prints are on archival paper, signed and numbered.' }
        ] })],
        [E(ctx, 'form', { submitText: 'Send enquiry' })]
      ], { padding: 'lg' })
    ];
    return site;
  }
  const site = baseSite('My Website', 'Slate', 'Modern', ctx);
  site.pages.push(page(ctx, 'Home', [makeSectionObj(ctx, '1', [[
    E(ctx, 'heading', { text: 'Welcome to my website', level: 1 }),
    E(ctx, 'text', { html: '<p>Click on any text to change it. Drag elements and sections from the panel on the left to build your page.</p>' })
  ]], { padding: 'lg' })]));
  return site;
}

return { PLACEHOLDER_COUNT, placeholderSvg, ELEMENTS, LABELS, SECTIONS, STARTERS, makeElement, makeSectionObj, makeSite, defaultFields };
}));
