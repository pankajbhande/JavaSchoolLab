// Angular syllabus, part 1: modules 1-8 (web fundamentals, TypeScript, Angular setup, components, templates, directives, pipes, services and DI).
import type { SubTopic } from './types';
import { blk, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';

/** The first topic of every module: every syllabus item in order, a one-line explanation and the lesson that covers it. */
const overview = (n: number, title: string, rows: [string, string, string][]) => {
  const body = rows.map((r, i) => '<tr><td>' + (i + 1) + '</td><td><b>' + r[0] + '</b></td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>').join('\n');
  return topic(
    'ngs-m' + n + '-overview',
    'Module ' + n + ' overview and checklist',
    [
      blk('<h3>Module ' + n + ': ' + title + '</h3>\n• This module has <b>' + rows.length + ' syllabus items</b>. The table lists every item in syllabus order, what it means in one line, and which lesson of this module teaches it. Tick them off as you go.<br>\n• Read each lesson in three passes: <b>Basic</b> (the idea with an analogy), <b>Intermediate</b> (realistic usage) and <b>Expert</b> (internals, pitfalls, version notes).<br>\n<table ' + TABLE + '>\n<tr><th>#</th><th>Syllabus item</th><th>In one line</th><th>Covered in lesson</th></tr>\n' + body + '\n</table>'),
    ],
    [
      blk('<h3>How to study this module</h3>\n• First finish the Basic tab of every lesson to get the whole picture, then return for Intermediate and Expert. Type every code sample yourself instead of pasting it.<br>\n• Use the <b>checklist</b> above as a self-test: for each row, explain the item aloud in your own words and write a five-line example. If you cannot, reopen the lesson named in the last column.<br>\n• Every lesson ends with interview questions; answer them before reading the model answers.'),
    ],
    [
      blk('<h3>For experienced developers</h3>\n• Skim the Expert tabs first: they cover internals, version differences (Angular 17 to 20) and common production pitfalls. Where an API needs a minimum version, the lesson says so.<br>\n• Java developers: each lesson draws parallels with Java and Spring (annotations, beans, interfaces, generics) so you can map what you already know.'),
    ],
    [
      ['How should I use the module overview?', 'As a checklist and map: it lists every syllabus item in order with a one-line explanation and the lesson that teaches it, so you can track progress and revisit gaps.'],
      ['In what order should the lessons be studied?', 'In the listed order; each lesson builds on the previous one. Revisit the Intermediate and Expert tabs after you have written some code.'],
    ],
  );
};

const module1: SubTopic = {
  id: 'ngs-mod-1',
  name: 'Module 1 · Web Development Fundamentals',
  topics: [
    overview(1, 'Web Development Fundamentals', [
      ['How the web works', 'A browser asks a server for files by URL; DNS finds the server, HTTP carries the request and response.', 'How the web works, HTTP and REST'],
      ['Client-server architecture', 'Clients (browsers, apps) send requests; servers process them and reply.', 'How the web works, HTTP and REST'],
      ['Frontend vs backend development', 'Frontend runs in the browser and shows the UI; backend runs on the server with data and rules.', 'How the web works, HTTP and REST'],
      ['HTML5 fundamentals', 'The markup language that structures a page: elements, attributes, document skeleton.', 'HTML essentials'],
      ['Semantic HTML', 'Using tags that describe meaning (header, nav, main, article) instead of generic div.', 'HTML essentials'],
      ['Forms and input elements', 'form, input, select, textarea and button collect and submit user data.', 'HTML essentials'],
      ['Tables, lists, links, and images', 'table for grids of data, ul/ol for lists, a for links, img for pictures.', 'HTML essentials'],
      ['CSS fundamentals', 'Rules (selector plus declarations) that style HTML.', 'CSS core'],
      ['Selectors and specificity', 'How rules pick elements, and which rule wins when several match.', 'CSS core'],
      ['Box model', 'Every element is content + padding + border + margin.', 'CSS core'],
      ['Flexbox', 'One-dimensional layout along a row or column.', 'CSS layout and frameworks'],
      ['CSS Grid', 'Two-dimensional layout of rows and columns.', 'CSS layout and frameworks'],
      ['Responsive web design', 'Pages that adapt to any screen size using fluid layouts.', 'CSS layout and frameworks'],
      ['Media queries', 'CSS conditions (such as screen width) that switch styles.', 'CSS layout and frameworks'],
      ['CSS positioning', 'static, relative, absolute, fixed and sticky control where elements sit.', 'CSS core'],
      ['Transitions and animations', 'Smooth property changes (transition) and multi-step motion (keyframes).', 'CSS core'],
      ['Bootstrap fundamentals', 'A ready-made CSS component and grid framework.', 'CSS layout and frameworks'],
      ['Tailwind CSS fundamentals', 'A utility-class framework: style by composing small classes.', 'CSS layout and frameworks'],
      ['JavaScript fundamentals', 'Variables, functions, objects, arrays and control flow: the language of the browser.', 'JavaScript and the DOM'],
      ['DOM and browser events', 'The page as a tree of objects, and the click/input events you react to.', 'JavaScript and the DOM'],
      ['JSON', 'The text format for exchanging data between client and server.', 'How the web works, HTTP and REST'],
      ['HTTP and HTTPS', 'The request/response protocol of the web, and its encrypted version.', 'How the web works, HTTP and REST'],
      ['REST API fundamentals', 'Resource-oriented URLs plus HTTP methods and status codes.', 'How the web works, HTTP and REST'],
    ]),

    topic(
      'ngs-m1-web-http-rest',
      'How the web works, HTTP and REST',
      [
        blk(`<h3>How the web works</h3>
• Think of a restaurant. The <b>client</b> (browser) is the customer, the <b>server</b> is the kitchen, and the waiter is the network. You send an order (a <b>request</b>) and get a dish (a <b>response</b>). This is <b>client-server architecture</b>.<br>
• You type a URL such as https://example.com/courses. The browser asks <b>DNS</b> (the phone book of the internet) for the server's IP address, opens a connection, sends an HTTP request, and renders the returned HTML, CSS and JavaScript.<br>
• <b>Frontend vs backend development</b>: the <b>frontend</b> is everything the user sees and touches, running in the browser (HTML, CSS, JavaScript, Angular). The <b>backend</b> runs on a server, owns the database, business rules and security (Java, Spring Boot). Angular is a frontend framework; it talks to a Java backend over <b>HTTP</b> and <b>JSON</b>.`,
          `GET /courses HTTP/1.1          <- request line: method, path, version
Host: example.com
Accept: application/json

HTTP/1.1 200 OK                <- response status line
Content-Type: application/json

[{"id":1,"title":"Angular"}]   <- body (JSON)`),
        blk(`<h3>JSON, HTTP and HTTPS in one minute</h3>
• <b>JSON</b> (JavaScript Object Notation) is plain text for structured data: objects in braces, arrays in brackets, strings in double quotes. It is the standard format between Angular and Spring Boot.<br>
• <b>HTTP</b> is the protocol: a request has a method, URL, headers and optional body; a response has a status code, headers and body. <b>HTTPS</b> is HTTP wrapped in TLS encryption, so nobody on the network can read or change the traffic.`),
      ],
      [
        blk(`<h3>HTTP methods and status codes</h3>
<table ${TABLE}>
<tr><th>Method</th><th>Meaning</th><th>Typical Spring mapping</th></tr>
<tr><td>GET</td><td>Read a resource (safe, no change)</td><td>@GetMapping</td></tr>
<tr><td>POST</td><td>Create a resource</td><td>@PostMapping</td></tr>
<tr><td>PUT</td><td>Replace a resource</td><td>@PutMapping</td></tr>
<tr><td>PATCH</td><td>Partially update</td><td>@PatchMapping</td></tr>
<tr><td>DELETE</td><td>Remove</td><td>@DeleteMapping</td></tr>
</table>
• Status classes: <b>2xx</b> success (200 OK, 201 Created, 204 No Content), <b>3xx</b> redirect, <b>4xx</b> client error (400 bad request, 401 unauthenticated, 403 forbidden, 404 not found), <b>5xx</b> server error (500).`),
        blk(`<h3>REST API fundamentals</h3>
• <b>REST</b> models your data as <b>resources</b> identified by nouns in URLs (/api/courses/7) and manipulated with the HTTP methods. The server is <b>stateless</b>: each request carries everything needed (for example an auth token).<br>
• Good REST: plural nouns, correct status codes, JSON bodies, versioning (/api/v1), pagination via query parameters (?page=0&size=10).`,
          `// course.model.ts : the JSON shape the Spring Boot API returns
export interface Course {
  id: number;
  title: string;
  published: boolean;
  tags: string[];        // JSON array
}

// JSON.stringify / JSON.parse convert between objects and text
const json = JSON.stringify({ id: 1, title: 'Angular', published: true, tags: ['web'] });
const course: Course = JSON.parse(json);   // text -> object`),
      ],
      [
        blk(`<h3>Details that matter in production</h3>
• <b>Idempotency</b>: GET, PUT and DELETE are idempotent (repeating them gives the same result); POST is not. This decides which calls are safe to <b>retry</b> automatically.<br>
• <b>Caching and conditional requests</b>: ETag/If-None-Match and Cache-Control let browsers skip downloads. HTTP/2 multiplexes many requests over one connection; HTTP/3 uses QUIC.<br>
• <b>HTTPS</b> is mandatory for modern browser features (service workers, geolocation, secure cookies). The browser enforces the <b>same-origin policy</b>; calling an API on another origin (Angular on :4200, Spring on :8080) needs <b>CORS</b> headers from the server.<br>
• JSON has no Date type: dates travel as ISO-8601 strings and must be converted. Numbers above 2^53 lose precision in JavaScript, so large Java <code>long</code> ids are sometimes sent as strings.`),
      ],
      [
        ['What happens when you type a URL in the browser?', 'The browser resolves the domain via DNS, opens a TCP (and TLS for HTTPS) connection, sends an HTTP request, receives HTML, then fetches CSS, JS and images referenced by it and renders the page.'],
        ['Difference between frontend and backend?', 'Frontend runs in the browser and handles UI and interaction; backend runs on the server and handles data, business logic and security. They communicate over HTTP, usually with JSON.'],
        ['What is the difference between HTTP and HTTPS?', 'HTTPS is HTTP over TLS: traffic is encrypted and the server is authenticated by a certificate, preventing eavesdropping and tampering.'],
        ['What makes an API RESTful?', 'Resources identified by URLs, standard HTTP methods and status codes, stateless requests, and representations such as JSON.'],
        ['Which HTTP methods are idempotent?', 'GET, PUT, DELETE (and HEAD/OPTIONS). POST is not, so retrying it can create duplicates.'],
        ['Why do we need CORS?', 'Browsers block cross-origin responses by default (same-origin policy). The server must opt in with CORS headers for an Angular app on a different origin to read its responses.'],
      ],
    ),

    topic(
      'ngs-m1-html',
      'HTML essentials',
      [
        blk(`<h3>HTML5 fundamentals</h3>
• <b>HTML</b> is the skeleton of a page, like the frame of a house. It is made of <b>elements</b>: an opening tag, content and a closing tag, e.g. &lt;p&gt;Hello&lt;/p&gt;. Tags can carry <b>attributes</b> such as href or class.<br>
• Every page starts with the <b>doctype</b> and has a head (metadata) and a body (visible content).`,
          `<!-- index.html -->
<!DOCTYPE html>                       <!-- HTML5 doctype -->
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- needed for mobile -->
    <title>My page</title>
  </head>
  <body>
    <h1>Welcome</h1>
    <p>This is a <a href="/about">link</a>.</p>
  </body>
</html>`),
        blk(`<h3>Semantic HTML</h3>
• <b>Semantic HTML</b> uses tags that describe meaning: header, nav, main, section, article, aside, footer. Search engines and screen readers rely on them; a page of only div tags is meaningless to them.`,
          `<header><nav><a href="/">Home</a></nav></header>
<main>
  <article>
    <h1>Learning Angular</h1>
    <section><h2>Why</h2><p>...</p></section>
  </article>
  <aside>Related links</aside>
</main>
<footer>2026</footer>`),
      ],
      [
        blk(`<h3>Forms and input elements</h3>
• A <b>form</b> collects data. Use label with for= linked to the input id (clicking the label focuses the input and screen readers announce it). Choose the right <b>input type</b>: text, email, password, number, date, checkbox, radio, file, range. Browsers give free validation with required, minlength, min, max, pattern.<br>
• In Angular you rarely submit forms to the server; you handle the submit event and call an API, but the HTML below is the base.`,
          `<form action="/register" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>      <!-- built-in validation -->

  <label for="age">Age</label>
  <input id="age" name="age" type="number" min="18" max="99">

  <label for="role">Role</label>
  <select id="role" name="role">
    <option value="student">Student</option>
    <option value="teacher">Teacher</option>
  </select>

  <textarea name="bio" rows="3"></textarea>
  <label><input type="checkbox" name="terms"> I agree</label>
  <button type="submit">Register</button>
</form>`),
        blk(`<h3>Tables, lists, links and images</h3>
• <b>Tables</b> are for tabular data only (thead, tbody, tr, th, td), never for layout. <b>Lists</b>: ul (bullets), ol (numbered), li. <b>Links</b>: a href. <b>Images</b>: img with src and a meaningful <b>alt</b> text (accessibility and SEO), plus width and height to avoid layout shift.`,
          `<table>
  <thead><tr><th>Course</th><th>Hours</th></tr></thead>
  <tbody><tr><td>Angular</td><td>40</td></tr></tbody>
</table>
<ul><li>HTML</li><li>CSS</li></ul>
<ol><li>Install</li><li>Run</li></ol>
<a href="https://angular.dev" target="_blank" rel="noopener">Docs</a>   <!-- rel protects the opener -->
<img src="logo.png" alt="Company logo" width="120" height="40" loading="lazy">`),
      ],
      [
        blk(`<h3>Pitfalls and good practice</h3>
• Use <b>one h1</b> per page and keep heading levels in order. Use <b>button</b> for actions and <b>a</b> for navigation (never a clickable div: no keyboard focus, no semantics).<br>
• Always give images <b>alt</b> (empty alt for decorative images). Associate every input with a label. Prefer native elements over ARIA; ARIA only fills gaps.<br>
• Angular templates are HTML plus extra syntax, and Angular's template compiler sanitises dangerous values; still, never inject untrusted HTML. Angular also warns for invalid HTML nesting and does not allow script tags in templates.<br>
• Performance: loading="lazy" for below-the-fold images, explicit dimensions, and the NgOptimizedImage directive (ngSrc) in Angular.`),
      ],
      [
        ['Why use semantic HTML?', 'It conveys meaning to browsers, search engines and assistive technology, improves accessibility and SEO, and makes markup more maintainable than anonymous divs.'],
        ['What is the purpose of the label element?', 'It binds text to an input, enlarging the click target and letting screen readers announce what the field is for.'],
        ['Difference between id and class?', 'An id must be unique in the page; a class can be reused on many elements. CSS and JS use them to select elements.'],
        ['When should you use a table?', 'Only for tabular data. Layout should use CSS (flexbox or grid).'],
        ['Why is the viewport meta tag important?', 'Without it mobile browsers render the page at desktop width and scale it down, which breaks responsive design.'],
      ],
    ),

    topic(
      'ngs-m1-css-core',
      'CSS core',
      [
        blk(`<h3>CSS fundamentals</h3>
• If HTML is the house frame, <b>CSS</b> is paint and furniture. A CSS <b>rule</b> = <b>selector</b> + <b>declarations</b> (property: value;). CSS can sit in a style tag, an inline style attribute, or (best) an external stylesheet; Angular scopes component styles to the component.`,
          `/* styles.css */
h1 { color: #1976d2; font-size: 2rem; }       /* selector { property: value } */
.card { background: white; border-radius: 8px; }
:root { --brand: #1976d2; }                  /* custom property (variable) */
button { background: var(--brand); }`),
        blk(`<h3>Selectors and specificity</h3>
• Common selectors: element (p), class (.card), id (#main), attribute ([type="email"]), descendant (nav a), child (ul &gt; li), pseudo-class (:hover, :focus), pseudo-element (::before).<br>
• When rules conflict, <b>specificity</b> decides: inline style beats id, id beats class/attribute/pseudo-class, class beats element. Equal specificity: the later rule wins. Avoid !important.`,
          `p { color: black; }          /* specificity 0,0,1 */
.note { color: blue; }        /* 0,1,0 wins over p */
#top .note { color: red; }    /* 1,1,0 wins over both */`),
        blk(`<h3>The box model</h3>
• Every element is a rectangular box: <b>content</b>, then <b>padding</b> (inside space), <b>border</b>, and <b>margin</b> (outside space). Set <b>box-sizing: border-box</b> so width includes padding and border; this is what everybody uses.`,
          `* { box-sizing: border-box; }       /* width = content + padding + border */
.box { width: 200px; padding: 16px; border: 2px solid #ccc; margin: 12px auto; }`),
      ],
      [
        blk(`<h3>CSS positioning</h3>
<table ${TABLE}>
<tr><th>Value</th><th>Behaviour</th></tr>
<tr><td>static</td><td>Default, normal flow</td></tr>
<tr><td>relative</td><td>Offset from its normal place; becomes the anchor for absolute children</td></tr>
<tr><td>absolute</td><td>Removed from flow, placed relative to the nearest positioned ancestor</td></tr>
<tr><td>fixed</td><td>Pinned to the viewport (headers, chat buttons)</td></tr>
<tr><td>sticky</td><td>Normal until it reaches a scroll offset, then sticks</td></tr>
</table>`,
          `.wrapper { position: relative; }                       /* anchor */
.badge { position: absolute; top: -8px; right: -8px; }   /* corner badge */
.navbar { position: sticky; top: 0; z-index: 10; }       /* stays on top while scrolling */`),
        blk(`<h3>Transitions and animations</h3>
• A <b>transition</b> animates a property change between two states (hover, class toggle). An <b>animation</b> with <b>@keyframes</b> runs multi-step motion on its own. Animate <b>transform</b> and <b>opacity</b> for smoothness: they run on the GPU compositor.`,
          `.btn { transition: background 0.2s ease, transform 0.2s ease; }
.btn:hover { background: #0d47a1; transform: translateY(-2px); }

@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.toast { animation: fade-in 300ms ease-out both; }

@media (prefers-reduced-motion: reduce) { .toast { animation: none; } }   /* respect the user */`),
      ],
      [
        blk(`<h3>Cascade, layers and Angular specifics</h3>
• The <b>cascade</b> order: origin and importance, then specificity, then source order. Modern CSS adds <b>@layer</b> to control order explicitly and :where() to add zero specificity.<br>
• Angular <b>emulated view encapsulation</b> adds attribute selectors (_ngcontent-xyz) to every rule, which raises specificity slightly and prevents leaks. Global styles go in styles.css; deep overrides of child components need ::ng-deep (deprecated, avoid) or CSS custom properties.<br>
• Layout thrash: animating width, height or top triggers layout every frame. Use transform. Use will-change sparingly.<br>
• Prefer rem units for fonts and spacing so user font-size preferences apply; avoid fixed pixel heights for text containers.`),
      ],
      [
        ['Explain the CSS box model.', 'Each element is content surrounded by padding, border and margin. With box-sizing: border-box the declared width includes padding and border.'],
        ['How is specificity calculated?', 'Inline styles, then ids, then classes/attributes/pseudo-classes, then elements/pseudo-elements. The higher-ranking selector wins; ties go to the later rule.'],
        ['Difference between relative, absolute and fixed positioning?', 'Relative offsets from the normal position and anchors children; absolute positions against the nearest positioned ancestor and leaves the flow; fixed is relative to the viewport.'],
        ['Transition vs animation?', 'A transition interpolates between two states when a property changes; an animation uses @keyframes for multi-step sequences that can run automatically and repeat.'],
        ['Why animate transform instead of left/top?', 'Transform and opacity can be composited on the GPU without relayout; left/top force layout and paint each frame.'],
      ],
    ),

    topic(
      'ngs-m1-css-layout',
      'CSS layout and frameworks',
      [
        blk(`<h3>Flexbox, Grid and responsive design</h3>
• <b>Flexbox</b> lines items up in one direction (a row or a column) like books on a shelf. <b>CSS Grid</b> lays out rows and columns together like a spreadsheet. <b>Responsive web design</b> means one page that adapts from phone to desktop, using fluid widths, flexible images and <b>media queries</b>.`,
          `/* Flexbox : a navbar */
.nav { display: flex; justify-content: space-between; align-items: center; gap: 16px; }

/* Grid : a card gallery, as many 240px+ columns as fit */
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }`),
        blk(`<h3>Media queries</h3>
• A <b>media query</b> applies CSS only when a condition holds, typically screen width. Design <b>mobile first</b>: base styles for phones, then add rules with min-width for larger screens.`,
          `.layout { display: grid; grid-template-columns: 1fr; }          /* phone: one column */
@media (min-width: 768px)  { .layout { grid-template-columns: 1fr 1fr; } }      /* tablet */
@media (min-width: 1200px) { .layout { grid-template-columns: 240px 1fr; } }    /* desktop with sidebar */`),
      ],
      [
        blk(`<h3>Choosing between Flexbox and Grid</h3>
• Use <b>Flexbox</b> for components and one-dimensional alignment (toolbars, button groups, centring). Use <b>Grid</b> for page-level layout and anything with rows and columns. They combine: a grid of cards, each card a flex column.<br>
• Key flex properties: flex-direction, justify-content (main axis), align-items (cross axis), flex-wrap, gap, flex: 1 (grow). Grid: grid-template-columns/areas, gap, minmax(), auto-fit/auto-fill.`,
          `.page { display: grid; grid-template-areas: "head head" "side main" "foot foot"; grid-template-columns: 220px 1fr; }
.head { grid-area: head; } .side { grid-area: side; } .main { grid-area: main; } .foot { grid-area: foot; }
.card { display: flex; flex-direction: column; }
.card .body { flex: 1; }          /* body stretches, footer sits at the bottom */`),
        blk(`<h3>Bootstrap and Tailwind CSS</h3>
• <b>Bootstrap fundamentals</b>: a component framework. Load its CSS and use classes: a 12-column grid (container, row, col-md-6), components (btn btn-primary, card, navbar, modal) and utilities (mt-3, d-flex). Quick, consistent, but sites can look alike.<br>
• <b>Tailwind CSS fundamentals</b>: a <b>utility-first</b> framework. You compose small single-purpose classes directly in the template, and a build step removes unused CSS. Breakpoint prefixes make it responsive (md:, lg:), and state prefixes (hover:, dark:).`,
          `<!-- Bootstrap -->
<div class="container">
  <div class="row">
    <div class="col-12 col-md-6"><button class="btn btn-primary">Save</button></div>
  </div>
</div>

<!-- Tailwind : same idea with utilities -->
<div class="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4">
  <button class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Save</button>
</div>`),
      ],
      [
        blk(`<h3>Trade-offs and Angular integration</h3>
• Modern CSS gives container queries (@container), subgrid, :has(), clamp() for fluid type and logical properties (margin-inline) for RTL support; use them before reaching for JavaScript.<br>
• <b>Tailwind</b> in Angular (v17+ CLI supports Tailwind v3/v4 setups): configure content globs so unused classes are purged; long class lists can be extracted into components, not @apply everywhere. <b>Bootstrap</b> in Angular: import its Sass or CSS in angular.json styles; its JavaScript components should be replaced by ng-bootstrap or plain Angular components (do not mix jQuery behaviours with Angular's DOM).<br>
• Test responsive layouts at real breakpoints, with browser device emulation, and check touch target sizes (at least 44px).`),
      ],
      [
        ['Flexbox vs Grid: when to use which?', 'Flexbox for one-dimensional layout and component alignment; Grid for two-dimensional layouts. They are often combined.'],
        ['What is mobile-first design?', 'Writing base CSS for small screens and layering min-width media queries for larger ones, so phones load the least CSS and complexity.'],
        ['What does justify-content do vs align-items?', 'justify-content aligns along the main axis, align-items along the cross axis of a flex container.'],
        ['What is utility-first CSS?', 'Styling by composing many small single-purpose classes (Tailwind) in markup instead of writing custom CSS per component.'],
        ['Bootstrap or Tailwind for an Angular app?', 'Bootstrap gives prebuilt components quickly; Tailwind gives design freedom and small CSS. Many teams pair Tailwind or custom CSS with Angular Material/CDK for behaviour.'],
      ],
    ),

    topic(
      'ngs-m1-js-dom',
      'JavaScript and the DOM',
      [
        blk(`<h3>JavaScript fundamentals</h3>
• <b>JavaScript</b> is the programming language browsers run. If HTML is the skeleton and CSS the skin, JavaScript is the muscles. Angular is written in TypeScript, which compiles to JavaScript, so you must know the basics.<br>
• Declare variables with <b>const</b> (cannot be reassigned) and <b>let</b>; avoid var. Types: string, number, boolean, null, undefined, object, array. Functions can be written as arrow functions.`,
          `const name = 'Asha';              // string
let count = 0;                    // number, reassignable
const user = { id: 1, tags: ['a', 'b'] };   // object with an array
const double = (n) => n * 2;       // arrow function
const names = [1, 2, 3].map(double).filter(n => n > 2);   // array methods: [4, 6]
if (count === 0) { console.log('empty'); }  // always use === (strict equality)`),
        blk(`<h3>DOM and browser events</h3>
• The <b>DOM</b> (Document Object Model) is the browser's live tree of objects for your HTML. JavaScript can find elements, change them and listen for <b>events</b> (click, input, keydown, submit).`,
          `// find an element, change it, and react to a click
const btn = document.querySelector('#save');
btn.addEventListener('click', (event) => {
  document.querySelector('#msg').textContent = 'Saved';   // update the DOM
});`),
      ],
      [
        blk(`<h3>Modern JavaScript you will see in Angular</h3>
• <b>Destructuring and spread</b>, template literals, modules (import/export), classes, <b>Promise</b> and async/await, optional chaining (?.) and nullish coalescing (??), and array methods (map, filter, reduce, find).<br>
• <b>Event flow</b>: events bubble from the target up through ancestors. <b>Event delegation</b> puts one listener on a parent. preventDefault() stops default behaviour (form submit); stopPropagation() stops bubbling.`,
          `const { id, title = 'Untitled' } = course;          // destructuring with default
const updated = { ...course, title: 'New' };           // spread: copy and override (immutable update)
const city = user?.address?.city ?? 'Unknown';         // safe access with fallback

async function load() {
  const res = await fetch('/api/courses');             // browser HTTP API
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

list.addEventListener('click', (e) => {                 // delegation: one listener for many items
  const li = e.target.closest('li');
  if (li) console.log(li.dataset.id);
});`),
      ],
      [
        blk(`<h3>Why this matters for Angular</h3>
• Angular does not replace the DOM; it manages it. Direct DOM manipulation (document.querySelector) inside components bypasses Angular's change detection, breaks server-side rendering (no document on the server) and risks XSS. Use bindings, template references or Renderer2/ElementRef sparingly.<br>
• JavaScript's single-threaded <b>event loop</b>: promises (microtasks) run before timers (macrotasks). Angular's change detection runs after async tasks (via zone.js, or via signals in zoneless mode).<br>
• Equality: objects are compared by reference, so Angular's OnPush and signals depend on <b>immutable updates</b> (new array/object instead of mutation).`),
      ],
      [
        ['Difference between let, const and var?', 'var is function-scoped and hoisted; let and const are block-scoped. const prevents reassignment of the binding (an object it points to can still be mutated).'],
        ['What is the DOM?', 'The browser\'s in-memory tree representation of the HTML document, which scripts can read and modify.'],
        ['What is event bubbling and delegation?', 'Events travel from the target up to ancestors; delegation attaches a single listener to a parent and inspects event.target to handle many children.'],
        ['== vs ===?', '== coerces types before comparing; === compares value and type without coercion. Use ===.'],
        ['Why avoid direct DOM manipulation in Angular?', 'It bypasses Angular\'s rendering and change detection, breaks SSR and can open XSS holes; use data binding instead.'],
      ],
    ),
  ],
};

const module2: SubTopic = {
  id: 'ngs-mod-2',
  name: 'Module 2 · TypeScript',
  topics: [
    overview(2, 'TypeScript', [
      ['Introduction to TypeScript', 'A typed superset of JavaScript that compiles to plain JavaScript.', 'TypeScript setup and configuration'],
      ['JavaScript vs TypeScript', 'TS adds static types, interfaces and tooling on top of JS; errors surface before running.', 'TypeScript setup and configuration'],
      ['TypeScript installation and configuration', 'Install with npm, compile with tsc, configure through tsconfig.json.', 'TypeScript setup and configuration'],
      ['Type annotations', 'Writing the type after a name (name: string).', 'Basic types'],
      ['Type inference', 'The compiler works out types from values so you annotate less.', 'Basic types'],
      ['Primitive data types', 'string, number, boolean, bigint, symbol, null, undefined.', 'Basic types'],
      ['Arrays and tuples', 'T[] for lists; tuples are fixed-length, position-typed arrays.', 'Basic types'],
      ['Enums', 'Named sets of constants (numeric or string).', 'Basic types'],
      ['any, unknown, never, and void', 'Escape hatch, safe unknown, impossible, and no-return types.', 'Basic types'],
      ['Union types', 'A value that can be one of several types (A | B).', 'Composing types'],
      ['Intersection types', 'A value that has all members of several types (A & B).', 'Composing types'],
      ['Literal types', 'Types that are exact values such as "admin" or 42.', 'Composing types'],
      ['Type aliases', 'A name for any type using the type keyword.', 'Composing types'],
      ['Interfaces', 'Named object shapes, extendable and implementable.', 'Composing types'],
      ['Optional and readonly properties', 'prop?: T may be missing; readonly cannot be reassigned.', 'Composing types'],
      ['Functions and return types', 'Typed parameters and return values.', 'Functions'],
      ['Optional and default parameters', 'param?: T or param = value.', 'Functions'],
      ['Rest parameters', '...args collects extra arguments into an array.', 'Functions'],
      ['Arrow functions', 'Short function syntax with lexical this.', 'Functions'],
      ['Callback functions', 'Functions passed as arguments and called later.', 'Functions'],
      ['Classes and objects', 'Blueprints and their instances, as in Java.', 'Classes and OOP'],
      ['Constructors', 'Initialise an instance; parameter properties shorten them.', 'Classes and OOP'],
      ['Access modifiers', 'public, private, protected (and # runtime privacy).', 'Classes and OOP'],
      ['Inheritance', 'extends reuses a parent class; super calls the parent.', 'Classes and OOP'],
      ['Abstract classes', 'Partially implemented base classes that cannot be instantiated.', 'Classes and OOP'],
      ['Encapsulation and polymorphism', 'Hide state; treat subtypes through a common type.', 'Classes and OOP'],
      ['Static members', 'Fields and methods that belong to the class, not instances.', 'Classes and OOP'],
      ['Getters and setters', 'Property-style access backed by methods.', 'Classes and OOP'],
      ['Generics', 'Types with parameters (Box of T) for reusable code.', 'Generics and type operators'],
      ['Generic constraints', 'T extends X limits what T may be.', 'Generics and type operators'],
      ['Utility types', 'Built-ins such as Partial, Pick, Omit, Record, Readonly.', 'Generics and type operators'],
      ['Type narrowing', 'The compiler refines a union inside checks.', 'Narrowing, guards and modules'],
      ['Type guards', 'Checks (typeof, in, instanceof, custom is) that narrow.', 'Narrowing, guards and modules'],
      ['Type assertions', 'Telling the compiler a type with as.', 'Narrowing, guards and modules'],
      ['keyof and typeof', 'Key union of a type; the type of a value.', 'Generics and type operators'],
      ['Mapped types', 'Transform every property of a type.', 'Generics and type operators'],
      ['Conditional types', 'Types that pick a branch (T extends U ? X : Y).', 'Generics and type operators'],
      ['Modules and namespaces', 'ES modules per file; namespaces are legacy grouping.', 'Narrowing, guards and modules'],
      ['Import and export', 'Share code between files.', 'Narrowing, guards and modules'],
      ['Decorators', '@Something annotations that attach behaviour; the base of Angular metadata.', 'Narrowing, guards and modules'],
      ['Promises and async/await', 'Represent future values and write async code linearly.', 'Async code and errors'],
      ['Error handling', 'try/catch/finally, custom errors, unknown catch variables.', 'Async code and errors'],
      ['TypeScript compiler configuration', 'Options controlling target, module, strictness and output.', 'TypeScript setup and configuration'],
      ['Strict type checking', 'The strict flag family that catches null and implicit any.', 'TypeScript setup and configuration'],
      ['tsconfig.json', 'The project file holding compiler options.', 'TypeScript setup and configuration'],
    ]),

    topic(
      'ngs-m2-setup',
      'TypeScript setup and configuration',
      [
        blk(`<h3>Introduction to TypeScript and JavaScript vs TypeScript</h3>
• <b>TypeScript</b> (TS) is JavaScript plus a <b>type system</b>. Think of Java: you declare that a variable is a String, and the compiler refuses to put a number in it. TS does the same for JavaScript, then compiles (<b>transpiles</b>) to plain JavaScript that browsers run. Types vanish at runtime.<br>
• <b>JavaScript vs TypeScript</b>: every valid JS file is valid TS. TS adds type annotations, interfaces, generics, enums, access modifiers and decorators, and catches mistakes like typos or calling a method on undefined while you type, not when users click. Angular is written in TS and requires it.`,
          `// JavaScript : the bug is found by the user at runtime
function area(w, h) { return w * h; }
area('5', undefined);          // NaN, no warning

// TypeScript : the bug is found by the compiler
function area2(w: number, h: number): number { return w * h; }
area2('5', 3);                 // error: string is not assignable to number`),
        blk(`<h3>Installation and the first compile</h3>
• Install Node.js, then TypeScript in your project: <code>npm install -D typescript</code>. Compile with <code>npx tsc</code>. In Angular projects the CLI already installs and runs TypeScript for you; you never call tsc yourself.`,
          `# terminal
npm install -D typescript
npx tsc --init            # creates tsconfig.json
npx tsc                   # compiles *.ts to *.js using tsconfig.json
npx tsc --noEmit          # only type-check (what CI usually does)`),
      ],
      [
        blk(`<h3>tsconfig.json and compiler configuration</h3>
• <b>tsconfig.json</b> tells the compiler what to compile and how. Key <b>compiler options</b>: <b>target</b> (output JS version), <b>module</b> (ES modules), <b>lib</b> (available APIs, e.g. DOM), <b>outDir</b>, <b>sourceMap</b>, <b>moduleResolution</b>, <b>paths</b> (import aliases), <b>experimentalDecorators</b>, and the <b>strict</b> family.<br>
• Angular projects have a base tsconfig.json plus tsconfig.app.json and tsconfig.spec.json that extend it, and an <code>angularCompilerOptions</code> block for the template type checker.`,
          `// tsconfig.json (typical Angular 17+ shape)
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,                        // turns on the strict family
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "dom"],
    "paths": { "@app/*": ["src/app/*"] }   // import { X } from '@app/core/x'
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true                // type-check templates strictly
  }
}`),
        blk(`<h3>Strict type checking</h3>
• <b>strict: true</b> enables: <b>noImplicitAny</b> (no silent any), <b>strictNullChecks</b> (null/undefined are separate types, the most valuable flag), strictFunctionTypes, strictBindCallApply, strictPropertyInitialization (class fields must be set), noImplicitThis, useUnknownInCatchVariables, alwaysStrict.<br>
• Always start new projects strict. Migrating a legacy codebase: turn flags on one at a time.`,
          `let name: string = 'Asha';
name = null;                // error under strictNullChecks
let maybe: string | null = null;    // you must say so explicitly
console.log(maybe.length);          // error: possibly null
console.log(maybe?.length);         // ok`),
      ],
      [
        blk(`<h3>Internals and version notes</h3>
• TypeScript uses <b>structural typing</b> (compatible shape = compatible type) unlike Java's nominal typing, and the type system is erased: you cannot check an interface with instanceof at runtime.<br>
• The Angular CLI compiles through the esbuild-based <code>application</code> builder (default since v17); TypeScript only type-checks and emits, bundling is separate. Each Angular version supports a narrow TypeScript range (the CLI refuses unsupported ones): do not upgrade TS independently.<br>
• <b>isolatedModules</b> and <b>verbatimModuleSyntax</b> matter for fast transpilers; use <code>import type</code> for type-only imports. <b>skipLibCheck</b> speeds builds by not checking .d.ts files of dependencies.<br>
• <b>target ES2022</b> with <b>useDefineForClassFields</b> changes how class field initialisation order works, which affects Angular code that reads inject()ed fields; the CLI sets a compatible default.<br>
• Prefer <code>noUncheckedIndexedAccess</code> for safer array access in strict teams.`),
      ],
      [
        ['What is TypeScript and why use it with Angular?', 'A typed superset of JavaScript compiled to JS. Types catch errors at build time, give IDE completion and refactoring, and Angular\'s API (decorators, DI, templates) is designed around it.'],
        ['Does TypeScript exist at runtime?', 'No. Types are erased during compilation; only the generated JavaScript runs, so runtime checks need real code.'],
        ['What does strictNullChecks do?', 'It makes null and undefined distinct types, so a string cannot be null unless declared string | null, eliminating a large class of null-reference errors.'],
        ['What is tsconfig.json for?', 'It marks the project root and holds compiler options (target, module, strict, paths) and file selection; Angular extends a base file per build target.'],
        ['What is structural typing?', 'Types are compatible if their shapes match, regardless of declared names, unlike Java\'s nominal types.'],
      ],
    ),

    topic(
      'ngs-m2-basic-types',
      'Basic types',
      [
        blk(`<h3>Type annotations, inference and primitives</h3>
• A <b>type annotation</b> labels a variable like a name tag on a jar: <code>let age: number = 30;</code>. With <b>type inference</b> the compiler reads the value and fills the tag for you, so <code>let age = 30</code> is already a number. Annotate function parameters and public APIs; let inference handle locals.<br>
• <b>Primitive data types</b>: string, number (all numbers, no int/double), boolean, bigint, symbol, null, undefined. Use lowercase names, never String or Number objects.`,
          `let title: string = 'Angular';        // explicit annotation
let hours = 40;                        // inferred number
const level = 'beginner';              // inferred literal type "beginner" (const)
let done: boolean = false;
let big: bigint = 9007199254740993n;
hours = 'forty';                       // error: string not assignable to number`),
        blk(`<h3>Arrays, tuples and enums</h3>
• An <b>array</b> is a list of one type: <code>number[]</code> or <code>Array&lt;number&gt;</code>. A <b>tuple</b> is a fixed-length array whose positions have their own types, like a row (name, age). An <b>enum</b> names a set of constants.`,
          `const scores: number[] = [90, 80];
const names: Array<string> = ['a', 'b'];
const pair: [string, number] = ['Asha', 30];      // tuple
const [who, years] = pair;                         // destructuring keeps types

enum Role { Student, Teacher, Admin }              // numeric: 0, 1, 2
enum Status { Active = 'ACTIVE', Blocked = 'BLOCKED' }   // string enum (preferred)
const s: Status = Status.Active;`),
      ],
      [
        blk(`<h3>any, unknown, never and void</h3>
<table ${TABLE}>
<tr><th>Type</th><th>Meaning</th><th>Use</th></tr>
<tr><td>any</td><td>Switches type checking off</td><td>Avoid; migration only</td></tr>
<tr><td>unknown</td><td>Could be anything; must be checked before use</td><td>Safe replacement for any (parsed JSON, catch errors)</td></tr>
<tr><td>void</td><td>Function returns nothing</td><td>Event handlers</td></tr>
<tr><td>never</td><td>Never returns or value impossible</td><td>Functions that throw; exhaustive checks</td></tr>
</table>`,
          `function parse(json: string): unknown { return JSON.parse(json); }
const data = parse('{"id":1}');
// data.id;                          // error: unknown must be narrowed first
if (typeof data === 'object' && data !== null && 'id' in data) { console.log(data.id); }

function fail(msg: string): never { throw new Error(msg); }      // never returns

type Shape = { kind: 'circle' } | { kind: 'square' };
function area(s: Shape): number {
  switch (s.kind) {
    case 'circle': return 1;
    case 'square': return 2;
    default: { const _exhaustive: never = s; return _exhaustive; }   // compile error if a case is missing
  }
}`),
        blk(`<h3>Enum alternatives</h3>
• Plain numeric enums allow assigning any number and emit runtime code. Many teams prefer a <b>union of string literals</b> or a const object with <code>as const</code> instead; they are tree-shakable and print readably in JSON.`,
          `const ROLES = ['student', 'teacher', 'admin'] as const;
type RoleName = typeof ROLES[number];       // 'student' | 'teacher' | 'admin'
const r: RoleName = 'admin';`),
      ],
      [
        blk(`<h3>Details and pitfalls</h3>
• <b>Inference</b> widens mutable values (let x = 'a' is string) but keeps literals for const; <code>as const</code> freezes an object/array to readonly literal types. Annotate return types of exported functions to keep API stable and speed up the compiler.<br>
• <b>any</b> is contagious: it silently disables checks downstream. Ban it with the ESLint rule no-explicit-any; use <b>unknown</b> at boundaries (HTTP, JSON.parse, catch) and validate (a schema library like zod, or hand-written guards).<br>
• <b>void vs undefined</b>: a callback typed () => void may return a value that is ignored. <b>never</b> powers exhaustiveness checks in switch statements, valuable when adding enum values.<br>
• <b>const enums</b> are inlined but problematic with isolatedModules; regular enums create an object at runtime. Numeric enums have reverse mapping (Role[0] is 'Student').<br>
• <b>number</b> is a 64-bit float; money should use integers (cents) or a decimal library.`),
      ],
      [
        ['any vs unknown?', 'any disables checking; unknown accepts any value but forces you to narrow it before use, so it is type-safe.'],
        ['What is a tuple?', 'A fixed-length array whose elements have individually declared types, such as [string, number].'],
        ['When is never used?', 'For functions that never return (throw/infinite loop) and for exhaustive checks, where a leftover union member is assigned to never.'],
        ['When should you annotate and when rely on inference?', 'Annotate function parameters, return types of public functions and empty initialisers; let inference handle obvious local values.'],
        ['String enum vs union of literals?', 'Both restrict values. Enums emit runtime objects and are nominal; literal unions are erased, tree-shake and are simpler, so many teams prefer them.'],
        ['What is the difference between null and undefined?', 'undefined means a value was never assigned; null is an explicit empty value. Under strictNullChecks both must be declared in the type.'],
      ],
    ),

    topic(
      'ngs-m2-composing-types',
      'Composing types',
      [
        blk(`<h3>Union, intersection and literal types</h3>
• A <b>union type</b> (A | B) says "one of these", like a form field that accepts either a number or text. An <b>intersection type</b> (A &amp; B) says "all of these at once", merging shapes. A <b>literal type</b> is an exact value: <code>'asc' | 'desc'</code> is a tidy alternative to magic strings.`,
          `let id: number | string = 5;          // union
id = 'A-5';
type Direction = 'asc' | 'desc';       // literal union
let d: Direction = 'asc';
d = 'up';                              // error

type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;            // intersection: must have both
const p: Person = { name: 'Asha', age: 30 };`),
        blk(`<h3>Type aliases, interfaces, optional and readonly properties</h3>
• A <b>type alias</b> gives any type a name (<code>type Id = number | string</code>). An <b>interface</b> describes an object shape, like a Java interface but for data. Mark a property <b>optional</b> with ? and <b>readonly</b> to forbid reassignment.`,
          `type Id = number | string;

interface Course {
  readonly id: Id;            // cannot be reassigned after creation
  title: string;
  description?: string;       // optional: string | undefined
}

const c: Course = { id: 1, title: 'Angular' };
c.id = 2;                     // error: read-only
console.log(c.description?.length);   // optional chaining`),
      ],
      [
        blk(`<h3>Interface vs type alias</h3>
<table ${TABLE}>
<tr><th></th><th>interface</th><th>type</th></tr>
<tr><td>Object shapes</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Unions, tuples, primitives</td><td>No</td><td>Yes</td></tr>
<tr><td>Extending</td><td>extends</td><td>intersection &amp;</td></tr>
<tr><td>Declaration merging</td><td>Yes</td><td>No</td></tr>
<tr><td>Implemented by classes</td><td>Yes</td><td>Yes (object types)</td></tr>
</table>
• Convention: <b>interface</b> for object models and public contracts, <b>type</b> for unions and computed types.`,
          `interface Entity { id: number }
interface User extends Entity { email: string }      // extension
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };   // discriminated union

function show(r: ApiResult<User>) {
  if (r.ok) console.log(r.data.email);      // narrowed by the 'ok' literal
  else console.log(r.error);
}`),
        blk(`<h3>Index signatures and readonly collections</h3>`,
          `interface Dictionary { [key: string]: number }        // any number of numeric properties
const stock: Dictionary = { apples: 3 };
const ids: readonly number[] = [1, 2];                // cannot push
const frozen: ReadonlyArray<string> = ['a'];
const cfg = { retries: 3 } as const;                  // deeply readonly literal`),
      ],
      [
        blk(`<h3>Design guidance</h3>
• <b>Discriminated unions</b> (a shared literal field such as kind or status) are the idiomatic way to model states like loading / success / error; the compiler narrows on the tag and checks exhaustiveness.<br>
• <b>readonly</b> is compile-time only; it does not freeze objects at runtime (use Object.freeze). Prefer readonly inputs to catch accidental mutation, which also helps OnPush and signals.<br>
• Intersections of conflicting property types collapse to never; prefer interface extends which reports conflicts clearly.<br>
• Excess property checks apply only to fresh object literals; a variable with extra properties is assignable (structural typing).<br>
• Large unions slow the compiler; keep them reasonable. Use <code>satisfies</code> (TS 4.9+) to validate a value against a type without widening it.`,
          `const routes = { home: '/', about: '/about' } satisfies Record<string, string>;
routes.home;      // still the literal key set, not widened to string index`),
      ],
      [
        ['Union vs intersection types?', 'A union value is one of the member types; an intersection value has all properties of all member types.'],
        ['Interface vs type alias?', 'Both describe object shapes. Interfaces can be extended and merged; type aliases can also name unions, tuples and mapped/conditional types.'],
        ['What are literal types useful for?', 'Restricting a value to exact constants such as \'asc\' | \'desc\' and enabling discriminated unions.'],
        ['What does readonly guarantee?', 'Compile-time protection against reassigning the property; it does not freeze the object at runtime.'],
        ['What is a discriminated union?', 'A union whose members share a literal-typed tag property; checking the tag narrows the union to one member.'],
      ],
    ),

    topic(
      'ngs-m2-functions',
      'Functions',
      [
        blk(`<h3>Functions, parameters and return types</h3>
• A <b>function</b> in TS declares parameter types and a <b>return type</b>. Think of a vending machine: you must insert the right coins (parameters) and know what comes out (return type).<br>
• <b>Optional parameters</b> use ? (and must come last); <b>default parameters</b> use =; <b>rest parameters</b> (...args) gather extra arguments into an array.`,
          `function greet(name: string, greeting: string = 'Hello', punctuation?: string): string {
  return greeting + ', ' + name + (punctuation ?? '!');
}
greet('Asha');                 // Hello, Asha!
greet('Asha', 'Hi', '?');

function sum(...nums: number[]): number {        // rest parameter
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3);                                      // 6

function log(msg: string): void { console.log(msg); }   // no return value`),
        blk(`<h3>Arrow functions and callbacks</h3>
• An <b>arrow function</b> is a short function: <code>(a, b) =&gt; a + b</code>. A <b>callback</b> is a function you hand to another function to call later (click handlers, array methods, setTimeout). Angular code is full of them.`,
          `const double = (n: number): number => n * 2;
const nums = [1, 2, 3].map(n => n * 2);              // callback to map

function fetchLater(done: (data: string) => void): void {   // callback type
  setTimeout(() => done('loaded'), 500);
}
fetchLater(d => console.log(d));`),
      ],
      [
        blk(`<h3>Function types, overloads and this</h3>
• Describe function shapes with <b>function types</b> and reuse them with aliases. <b>Overloads</b> give one function several call signatures. Arrow functions capture <b>this</b> lexically, which is why class methods used as callbacks are often arrows.`,
          `type Predicate<T> = (item: T) => boolean;       // function type alias
function filterBy<T>(items: T[], test: Predicate<T>): T[] { return items.filter(test); }

function format(x: number): string;               // overload signatures
function format(x: string): string;
function format(x: number | string): string { return String(x); }   // implementation

class Counter {
  count = 0;
  inc = () => { this.count++; };      // arrow property keeps 'this' when passed as a callback
}
button.addEventListener('click', new Counter().inc);`),
        blk(`<h3>Typing callbacks and async functions</h3>`,
          `function retry<T>(action: () => Promise<T>, times = 3): Promise<T> {
  return action().catch(err => {
    if (times <= 1) throw err;
    return retry(action, times - 1);
  });
}
const load = async (id: number): Promise<string> => 'course-' + id;   // async arrow`),
      ],
      [
        blk(`<h3>Pitfalls and best practices</h3>
• Prefer <b>default parameters</b> over optional ones when a sensible default exists, and an <b>options object</b> (named properties) over many positional parameters.<br>
• Regular functions have a dynamic <b>this</b>; arrows do not. Passing a class method as a callback (btn.onclick = this.save) loses this; use an arrow property, bind, or wrap it in an arrow in the template.<br>
• Parameter <b>bivariance</b>: method parameters are checked bivariantly even in strict mode (a known soundness hole); property-style function types are checked strictly.<br>
• Return types: annotate exported functions; for callbacks like array map let inference work. A function declared () => void accepts a callback returning anything.<br>
• Excess closures in templates (arrow functions in event handlers) are not allowed in templates, so keep handlers as methods. In Angular templates do not call heavy functions on every change detection run: use computed signals or pipes.`),
      ],
      [
        ['Optional vs default parameters?', 'Optional (p?: T) may be undefined and must come last; default (p = value) supplies a value when omitted and makes the parameter optional.'],
        ['What are rest parameters?', 'A final parameter prefixed with ... that collects remaining arguments into a typed array.'],
        ['How does this behave in arrow functions?', 'Arrow functions capture this from the enclosing scope and cannot rebind it, unlike regular functions where this depends on the caller.'],
        ['What is a callback?', 'A function passed to another function to be invoked later, for example an event handler or the argument of map().'],
        ['How do you type a function that takes a callback?', 'Declare the callback type in the parameter: done: (data: string) => void, or alias it with type.'],
      ],
    ),

    topic(
      'ngs-m2-classes',
      'Classes and OOP',
      [
        blk(`<h3>Classes, objects and constructors</h3>
• A <b>class</b> is a blueprint (like a house plan); an <b>object</b> is a house built from it. As in Java, a class has fields, a <b>constructor</b> and methods. TypeScript adds <b>parameter properties</b>: put an access modifier on a constructor parameter and TS creates and assigns the field for you.`,
          `class Student {
  name: string;
  private grades: number[] = [];
  constructor(name: string, public readonly id: number) {   // 'id' becomes a field automatically
    this.name = name;
  }
  addGrade(g: number): void { this.grades.push(g); }
  average(): number { return this.grades.reduce((a, b) => a + b, 0) / this.grades.length; }
}
const s = new Student('Asha', 1);
s.addGrade(90);`),
        blk(`<h3>Access modifiers, encapsulation, getters and setters</h3>
• <b>public</b> (default), <b>protected</b> (class and subclasses) and <b>private</b> (class only) control visibility. <b>Encapsulation</b> means hiding state and exposing safe methods. <b>Getters and setters</b> look like properties but run code, so you can validate on assignment.`,
          `class Account {
  private _balance = 0;
  get balance(): number { return this._balance; }          // read like a property
  set balance(v: number) {
    if (v < 0) throw new Error('Negative balance');          // validation on assignment
    this._balance = v;
  }
}
const a = new Account();
a.balance = 100;
console.log(a.balance);
// a._balance;   // error: private`),
      ],
      [
        blk(`<h3>Inheritance, abstract classes, polymorphism, static members</h3>
• <b>Inheritance</b>: <code>extends</code> reuses a parent; call <code>super()</code> first in a subclass constructor; <code>override</code> marks overridden methods (required with noImplicitOverride). An <b>abstract class</b> cannot be instantiated and may declare abstract methods subclasses must implement. <b>Polymorphism</b>: code written against the parent type works with any subclass. <b>Static members</b> belong to the class itself.<br>
• Classes can also <b>implement</b> interfaces (many allowed), just like Java.`,
          `abstract class Shape {
  abstract area(): number;                       // subclasses must implement
  describe(): string { return 'Area ' + this.area(); }
  static count = 0;                              // shared by the class
  constructor() { Shape.count++; }
}
class Circle extends Shape {
  constructor(private r: number) { super(); }
  override area(): number { return Math.PI * this.r ** 2; }
}
class Square extends Shape {
  constructor(private s: number) { super(); }
  override area(): number { return this.s * this.s; }
}
const shapes: Shape[] = [new Circle(2), new Square(3)];     // polymorphism
shapes.forEach(s => console.log(s.describe()));
console.log(Shape.count);                                    // 2

interface Printable { print(): void }
class Report implements Printable { print() { console.log('report'); } }`),
        blk(`<h3>Protected and runtime privacy</h3>`,
          `class Base {
  protected log(m: string) { console.log(m); }   // visible in subclasses
  #secret = 42;                                   // true runtime-private (ECMAScript #)
}
class Child extends Base { run() { this.log('hi'); } }`),
      ],
      [
        blk(`<h3>Differences from Java and Angular usage</h3>
• TS <b>private</b> is compile-time only; the field still exists in the emitted JS. For real privacy use <b>#field</b>. A class has one constructor body (overloads are signatures only).<br>
• Structural typing: an object literal with the right shape is assignable to a class type unless the class has private/protected members.<br>
• Prefer <b>composition over inheritance</b>. Angular components and services rarely extend others; shared behaviour goes into services, directives, or host directives. Where inheritance is used for components, the base class needs its own decorator metadata (@Directive abstract) for inputs/outputs to be inherited.<br>
• <b>Parameter properties</b> are how Angular DI classes are written: <code>constructor(private http: HttpClient) {}</code>. Modern code uses <code>inject()</code> field initialisers instead (see the DI module).<br>
• With useDefineForClassFields, a field declared in a subclass can overwrite a parent-initialised value; initialise via constructor or avoid redeclaring.<br>
• Getters in templates run on every change detection; keep them cheap or use computed signals.`),
      ],
      [
        ['public, private and protected?', 'public is visible everywhere (default); protected in the class and subclasses; private only inside the class. All three are compile-time checks in TS.'],
        ['Abstract class vs interface?', 'An abstract class can hold implementation and state and is single-inherited; an interface only describes a contract, has no runtime presence, and a class can implement many.'],
        ['What are parameter properties?', 'Constructor parameters with an access modifier or readonly; TypeScript declares and assigns the field automatically.'],
        ['What do getters and setters give you?', 'Property syntax with method logic: validation, computed values and read-only views, while keeping the field private.'],
        ['What is a static member?', 'A field or method on the class itself, shared by all instances and accessed as ClassName.member.'],
        ['TS private vs #private?', 'private is erased at runtime and can be bypassed; #name is enforced by the JavaScript engine.'],
      ],
    ),

    topic(
      'ngs-m2-generics-types',
      'Generics and type operators',
      [
        blk(`<h3>Generics</h3>
• <b>Generics</b> let one piece of code work with many types while staying type safe: like a box labelled "holds T" where T is decided when you use it. Java developers know them from <code>List&lt;String&gt;</code>. In Angular you meet them everywhere: <code>Observable&lt;User[]&gt;</code>, <code>http.get&lt;Course&gt;()</code>, <code>signal&lt;number&gt;(0)</code>.`,
          `class Box<T> {
  constructor(public value: T) {}
}
const n = new Box<number>(5);        // T = number
const s = new Box('hi');             // T inferred as string

function first<T>(items: T[]): T | undefined { return items[0]; }
const f = first([1, 2, 3]);          // number | undefined`),
        blk(`<h3>Generic constraints</h3>
• A <b>constraint</b> limits T with <code>extends</code>, like Java's <code>T extends Comparable</code>, so you can use the members you promised.`,
          `interface HasId { id: number }
function byId<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(i => i.id === id);          // OK: T is guaranteed to have id
}
byId([{ id: 1, name: 'a' }], 1);`),
      ],
      [
        blk(`<h3>Utility types</h3>
<table ${TABLE}>
<tr><th>Utility</th><th>Result</th></tr>
<tr><td>Partial&lt;T&gt;</td><td>All properties optional (patch objects)</td></tr>
<tr><td>Required&lt;T&gt;</td><td>All properties required</td></tr>
<tr><td>Readonly&lt;T&gt;</td><td>All properties readonly</td></tr>
<tr><td>Pick&lt;T, K&gt;</td><td>Only the listed keys</td></tr>
<tr><td>Omit&lt;T, K&gt;</td><td>Everything except the listed keys</td></tr>
<tr><td>Record&lt;K, V&gt;</td><td>Object with keys K and values V</td></tr>
<tr><td>ReturnType&lt;F&gt;, Parameters&lt;F&gt;</td><td>Types taken from a function</td></tr>
<tr><td>NonNullable&lt;T&gt;, Awaited&lt;T&gt;</td><td>Remove null / unwrap a Promise</td></tr>
</table>`,
          `interface User { id: number; name: string; email: string; password: string }
type NewUser = Omit<User, 'id'>;                 // creation payload has no id
type PublicUser = Omit<User, 'password'>;
type UserPatch = Partial<Pick<User, 'name' | 'email'>>;
const byRole: Record<'admin' | 'user', string[]> = { admin: [], user: [] };`),
        blk(`<h3>keyof and typeof</h3>
• <b>keyof T</b> is the union of T's property names. <b>typeof value</b> (in a type position) is the type of an existing value. Together they type safe property access.`,
          `const config = { host: 'localhost', port: 8080 };
type Config = typeof config;                    // { host: string; port: number }
type ConfigKey = keyof Config;                  // 'host' | 'port'

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {   // indexed access type
  return obj[key];
}
getProp(config, 'port');         // number
// getProp(config, 'x');         // error`),
      ],
      [
        blk(`<h3>Mapped and conditional types</h3>
• A <b>mapped type</b> builds a new type by looping over keys: that is how Partial and Readonly are written. A <b>conditional type</b> chooses a type with <code>T extends U ? X : Y</code>; <b>infer</b> captures a type inside the check.`,
          `// mapped types
type MyPartial<T> = { [K in keyof T]?: T[K] };
type Nullable<T> = { [K in keyof T]: T[K] | null };
type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };   // key remapping with 'as'

// conditional types
type ElementOf<T> = T extends (infer E)[] ? E : T;
type A = ElementOf<string[]>;        // string
type B = ElementOf<number>;          // number
type Unwrap<T> = T extends Promise<infer R> ? R : T;`),
        blk(`<h3>Real Angular examples</h3>`,
          `// a generic API service base
export abstract class CrudService<T extends { id: number }> {
  constructor(protected http: HttpClient, protected url: string) {}
  getAll() { return this.http.get<T[]>(this.url); }
  save(item: Omit<T, 'id'> | T) { return this.http.post<T>(this.url, item); }
}
// typed form value: signature of FormGroup values uses the same mapped-type idea`),
      ],
      [
        ['What problem do generics solve?', 'They let you write reusable, type-safe code without duplicating it per type or falling back to any.'],
        ['Partial vs Pick vs Omit?', 'Partial makes all properties optional; Pick keeps selected keys; Omit removes selected keys.'],
        ['What does keyof return?', 'A union of the string/number/symbol keys of a type; combined with generics it types safe property access.'],
        ['What is a mapped type?', 'A type created by iterating over the keys of another type, transforming each property (for example making all optional or readonly).'],
        ['What does infer do?', 'In a conditional type it declares a type variable captured from the matched position, e.g. extracting the element type of an array or the result of a Promise.'],
        ['Difference between typeof in JS and TS?', 'In expressions typeof returns a runtime string; in type positions typeof gets the compile-time type of a value.'],
      ],
    ),

    topic(
      'ngs-m2-narrowing-modules',
      'Narrowing, guards and modules',
      [
        blk(`<h3>Type narrowing, guards and assertions</h3>
• <b>Type narrowing</b>: inside a check, the compiler knows more. After <code>if (typeof x === 'string')</code>, x is a string in that block. The checks that narrow are <b>type guards</b>: typeof, instanceof, in, equality, truthiness, and your own functions. A <b>type assertion</b> (<code>as</code>) simply tells the compiler "trust me"; it performs no runtime check.`,
          `function len(x: string | string[]): number {
  if (typeof x === 'string') return x.length;      // x: string
  return x.length;                                  // x: string[]
}
function handle(e: unknown) {
  if (e instanceof Error) console.log(e.message);   // instanceof guard
}
const el = document.getElementById('name') as HTMLInputElement;   // assertion
el.value = 'Asha';`),
        blk(`<h3>Import and export, modules and namespaces</h3>
• A <b>module</b> is a file with import or export. Each file has its own scope, like a Java class file with imports. <b>Namespaces</b> (the namespace keyword) are an older internal-module style; in modern code use ES modules and avoid namespaces.`,
          `// course.model.ts
export interface Course { id: number; title: string }
export const DEFAULT_LEVEL = 'beginner';
export default class CourseHelper {}          // default export (avoid in Angular code)

// course.service.ts
import { Course, DEFAULT_LEVEL } from './course.model';
import type { Course as C2 } from './course.model';   // type-only import
import * as models from './course.model';              // namespace import
export { Course };                                      // re-export`),
      ],
      [
        blk(`<h3>Custom type guards and discriminated unions</h3>
• A <b>user-defined guard</b> returns <code>x is T</code>; an <b>assertion function</b> returns <code>asserts x is T</code>. Use them to validate untyped data from HTTP.`,
          `interface Cat { meow(): void }
interface Dog { bark(): void }
function isCat(p: Cat | Dog): p is Cat { return 'meow' in p; }    // user-defined guard

function assertString(v: unknown): asserts v is string {
  if (typeof v !== 'string') throw new TypeError('not a string');
}
const raw: unknown = JSON.parse('"hi"');
assertString(raw);
raw.toUpperCase();                                                  // raw is string now`),
        blk(`<h3>Decorators</h3>
• A <b>decorator</b> is a function that adds metadata or behaviour to a class, method or property, written <code>@Name</code>; like Java annotations. Angular's @Component, @Injectable, @Input, @Directive and @Pipe are decorators, and the Angular compiler reads their metadata. They need no configuration inside Angular projects (the CLI enables them).`,
          `// a tiny custom method decorator (legacy experimental style, as Angular uses)
function Log(target: object, key: string, desc: PropertyDescriptor) {
  const original = desc.value;
  desc.value = function (...args: unknown[]) {
    console.log('calling ' + key, args);
    return original.apply(this, args);
  };
}
class Calc { @Log add(a: number, b: number) { return a + b; } }
new Calc().add(1, 2);`),
      ],
      [
        blk(`<h3>Safety and module details</h3>
• <b>Assertions are not casts</b>: <code>x as T</code> never checks at runtime and silences errors. Prefer guards, validation, or <code>satisfies</code>. The double assertion (as unknown as T) is a last resort. The non-null assertion <code>value!</code> is also unchecked; use it rarely.<br>
• Narrowing does not cross function boundaries or survive assignments in callbacks; copy to a const first. Use exhaustive switch with never.<br>
• <b>Decorators</b>: Angular still uses the <b>experimentalDecorators</b> (legacy) implementation, enabled by the CLI. TC39 standard decorators (TS 5.0) are different and not interchangeable. Parameter decorators like @Inject exist only in the legacy form.<br>
• <b>Modules</b>: with the bundler, circular imports cause undefined at startup; keep dependency direction one way. Barrel files (index.ts) can defeat tree shaking and slow builds in big repos. Use <code>import type</code> to keep type-only imports out of the output. Dynamic <code>import()</code> creates a lazy chunk, which Angular uses for lazy routes.`),
      ],
      [
        ['What is type narrowing?', 'The compiler refining a broad type to a specific one inside a conditional check such as typeof, instanceof, in, or equality.'],
        ['Type assertion vs type guard?', 'An assertion (as) only changes the compile-time type without checking; a guard performs a runtime check that the compiler also uses to narrow.'],
        ['What are decorators and how does Angular use them?', 'Functions prefixed with @ that attach metadata/behaviour to classes and members. Angular reads @Component, @Injectable, @Input and others to configure rendering and DI.'],
        ['Named export vs default export?', 'Named exports are imported by name, enable refactoring and tree shaking; a default export is imported under any name. Angular style guides prefer named exports.'],
        ['What does import type do?', 'It imports only for type checking and is erased from the output, avoiding unneeded runtime imports and circular-dependency issues.'],
      ],
    ),

    topic(
      'ngs-m2-async-errors',
      'Async code and errors',
      [
        blk(`<h3>Promises and async/await</h3>
• A <b>Promise</b> is an IOU for a value that arrives later (a network response). It is pending, then fulfilled or rejected. <b>async/await</b> lets you write that code top-to-bottom like normal code. An async function always returns a Promise.`,
          `function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function loadCourse(id: number): Promise<Course> {
  const res = await fetch('/api/courses/' + id);        // wait without blocking the UI
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return (await res.json()) as Course;
}
loadCourse(1).then(c => console.log(c.title));`),
        blk(`<h3>Error handling</h3>
• Use <b>try/catch/finally</b> around risky code. Anything can be thrown, so the caught value is <b>unknown</b> in strict TS and must be narrowed. You can create <b>custom error classes</b>.`,
          `class NotFoundError extends Error {
  constructor(public resource: string) { super(resource + ' not found'); this.name = 'NotFoundError'; }
}
try {
  const c = await loadCourse(99);
} catch (e: unknown) {
  if (e instanceof NotFoundError) console.warn(e.resource);
  else if (e instanceof Error) console.error(e.message);
  else throw e;                    // unknown error: rethrow
} finally {
  console.log('always runs');      // cleanup (hide spinner)
}`),
      ],
      [
        blk(`<h3>Concurrency with Promises</h3>
• Await sequentially only when steps depend on each other. For independent calls start them together with <b>Promise.all</b> (fails fast), <b>Promise.allSettled</b> (never rejects) or <b>Promise.race</b>.`,
          `async function dashboard() {
  const [courses, user] = await Promise.all([loadCourses(), loadUser()]);   // parallel
  const results = await Promise.allSettled([a(), b()]);
  results.forEach(r => r.status === 'fulfilled' ? console.log(r.value) : console.error(r.reason));
  return { courses, user };
}

// await in a loop is sequential (slow); this is parallel:
const all = await Promise.all(ids.map(id => loadCourse(id)));`),
        blk(`<h3>Promises vs Observables in Angular</h3>
• A Promise has one value and starts immediately; an RxJS <b>Observable</b> can emit many values, is lazy and cancellable. Angular's HttpClient returns Observables. Convert with <code>firstValueFrom(obs$)</code> when you want await, or with <code>toSignal</code>. (RxJS is covered in a later module.)`,
          `import { firstValueFrom } from 'rxjs';
const course = await firstValueFrom(this.http.get<Course>('/api/courses/1'));`),
      ],
      [
        blk(`<h3>Pitfalls</h3>
• <b>Unhandled rejections</b>: a promise without catch or await in try fails silently or crashes. Never leave a floating promise: await it, return it, or mark intentional with void. Enable the ESLint rule no-floating-promises.<br>
• <code>forEach(async ...)</code> does not await its callbacks; use for...of or Promise.all with map.<br>
• Event loop: promise callbacks are microtasks and run before timers. Zone.js patches promises and timers so Angular knows when to run change detection; native async/await used to be down-levelled to promises for Zone, one reason Angular CLI targets ES2022 with a special transform. Zoneless apps (stable in 20+) do not rely on this.<br>
• Errors inside async code do not propagate to the caller unless awaited. In Angular, route a global handler through <code>ErrorHandler</code>.<br>
• Always rethrow or log unknown errors; swallowing exceptions hides bugs. Use <code>finally</code> for cleanup such as loading flags.<br>
• Cancellation: promises cannot be cancelled; use AbortController with fetch, or Observables with switchMap.`),
      ],
      [
        ['What are the states of a Promise?', 'Pending, then either fulfilled with a value or rejected with an error; once settled it never changes.'],
        ['Promise.all vs Promise.allSettled?', 'all rejects immediately if any promise rejects; allSettled waits for all and reports each outcome without rejecting.'],
        ['Why is the catch variable unknown?', 'Any value can be thrown in JavaScript, so under useUnknownInCatchVariables (part of strict) you must narrow it before use.'],
        ['What does async/await compile to?', 'Syntactic sugar over Promises: an async function returns a Promise and await suspends it until the awaited promise settles.'],
        ['How do Promises differ from Observables?', 'Promises are eager and deliver one value; Observables are lazy, can emit many values over time, and can be cancelled or transformed with operators.'],
        ['Why does forEach with async callbacks misbehave?', 'forEach ignores returned promises, so it neither waits for them nor catches their errors; use for...of or Promise.all.'],
      ],
    ),
  ],
};

const module3: SubTopic = {
  id: 'ngs-mod-3',
  name: 'Module 3 · Angular Introduction and Setup',
  topics: [
    overview(3, 'Angular Introduction and Setup', [
      ['What is Angular?', 'Google\'s TypeScript framework for building single-page web apps.', 'What Angular is'],
      ['Angular history and evolution', 'AngularJS (2010) to the 2016 rewrite, then standalone, signals and zoneless.', 'What Angular is'],
      ['Angular architecture', 'Components, templates, DI, router, forms and HttpClient working together.', 'What Angular is'],
      ['Angular vs React vs Vue', 'Framework with batteries included vs two lighter view libraries.', 'What Angular is'],
      ['Angular use cases', 'Enterprise dashboards, admin portals, large long-lived SPAs.', 'What Angular is'],
      ['Angular versions and release cycle', 'A major version every six months, with defined support windows.', 'What Angular is'],
      ['Node.js and npm setup', 'Install Node LTS; npm downloads packages.', 'Setup, CLI and project structure'],
      ['Angular CLI installation', 'npm install -g @angular/cli gives the ng command.', 'Setup, CLI and project structure'],
      ['Creating an Angular project', 'ng new generates a ready-to-run workspace.', 'Setup, CLI and project structure'],
      ['Angular project structure', 'src/app, main.ts, index.html, public, config files.', 'Setup, CLI and project structure'],
      ['Understanding angular.json', 'Workspace config: build, serve, test targets and options.', 'Setup, CLI and project structure'],
      ['Understanding package.json', 'Dependencies and npm scripts.', 'Setup, CLI and project structure'],
      ['Understanding tsconfig.json', 'TypeScript and template-checker options of the project.', 'Setup, CLI and project structure'],
      ['Development server', 'ng serve with live reload on port 4200.', 'Setup, CLI and project structure'],
      ['Angular CLI commands', 'new, serve, generate, build, test, add, update.', 'Setup, CLI and project structure'],
      ['Angular compilation', 'AOT compiles templates into JavaScript at build time.', 'Builds, rendering and module styles'],
      ['Development vs production builds', 'Dev is fast and debuggable; production is optimised and minified.', 'Builds, rendering and module styles'],
      ['Angular rendering fundamentals', 'Templates become instructions that create and update the DOM.', 'Builds, rendering and module styles'],
      ['Standalone components', 'Components that declare their own imports, no NgModule.', 'Builds, rendering and module styles'],
      ['NgModules and legacy module-based applications', 'The older NgModule structure still found in existing code.', 'Builds, rendering and module styles'],
    ]),

    topic(
      'ngs-m3-what-is-angular',
      'What Angular is',
      [
        blk(`<h3>What is Angular?</h3>
• <b>Angular</b> is an open-source framework from Google for building <b>single-page applications</b> (SPAs) with <b>TypeScript</b>. A SPA loads one HTML page and then updates it with JavaScript as the user navigates, so it feels like a desktop app.<br>
• Analogy: React and Vue are engines; Angular is the whole car. It ships a router, forms, an HTTP client, dependency injection, testing tools and a CLI, all designed together.<br>
• <b>Angular architecture</b> in one picture: the browser loads index.html, which contains your root component; the root component's template contains other components; services supply data; the router swaps components by URL.`,
          `<!-- index.html -->
<body>
  <app-root></app-root>          <!-- the root component is mounted here -->
</body>

// app.component.ts
@Component({
  selector: 'app-root',
  template: '<app-header /><router-outlet /><app-footer />'   // tree of components
})
export class AppComponent {}`),
        blk(`<h3>Angular use cases and history</h3>
• Typical uses: <b>enterprise dashboards</b>, admin portals, banking and insurance front ends, e-commerce back offices, internal tools, large apps with many developers.<br>
• <b>History</b>: AngularJS 1.x (2010, JavaScript, now end of life) was replaced by a complete rewrite, Angular 2 (2016, TypeScript, components). Versions then moved to 4, 5 ... with a regular schedule. Recent milestones: Ivy renderer (v9), standalone components (v14-15), signals (v16-17), new control flow and the esbuild builder (v17), zoneless support (v18-20+).`),
      ],
      [
        blk(`<h3>Architecture: the building blocks</h3>
<table ${TABLE}>
<tr><th>Part</th><th>Job</th><th>Java/Spring analogy</th></tr>
<tr><td>Component</td><td>Template + class for one UI piece</td><td>View + controller</td></tr>
<tr><td>Template</td><td>HTML with bindings and control flow</td><td>Thymeleaf page</td></tr>
<tr><td>Directive / Pipe</td><td>Behaviour on elements / value formatting</td><td>Tag library / formatter</td></tr>
<tr><td>Service + DI</td><td>Shared logic provided by injection</td><td>@Service beans + IoC</td></tr>
<tr><td>Router</td><td>URL to component mapping</td><td>@RequestMapping</td></tr>
<tr><td>HttpClient</td><td>REST calls</td><td>RestTemplate / WebClient</td></tr>
<tr><td>Signals / RxJS</td><td>Reactive state and async streams</td><td>Reactor / CompletableFuture</td></tr>
</table>`),
        blk(`<h3>Angular vs React vs Vue</h3>
<table ${TABLE}>
<tr><th></th><th>Angular</th><th>React</th><th>Vue</th></tr>
<tr><td>Type</td><td>Full framework</td><td>UI library</td><td>Progressive framework</td></tr>
<tr><td>Language</td><td>TypeScript</td><td>JS or TS (JSX)</td><td>JS or TS (SFC)</td></tr>
<tr><td>Templates</td><td>HTML + Angular syntax</td><td>JSX</td><td>HTML-like templates</td></tr>
<tr><td>Reactivity</td><td>Signals, RxJS</td><td>State + hooks</td><td>Refs/reactive proxies</td></tr>
<tr><td>Built-in</td><td>Router, forms, HTTP, DI, i18n</td><td>Choose libraries</td><td>Official router and store</td></tr>
<tr><td>Learning curve</td><td>Steeper, then consistent</td><td>Gentle start, many choices</td><td>Gentle</td></tr>
<tr><td>Best fit</td><td>Large teams, long-lived enterprise apps</td><td>Flexible products, large ecosystem</td><td>Small to medium apps</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Angular versions and release cycle</h3>
• A <b>major release</b> arrives about every six months (May and November). Each major gets <b>6 months of active support</b> and then <b>12 months of long-term support</b> (security fixes). Minor releases add features roughly monthly; patches come weekly. Deprecations are announced at least two majors before removal, and <code>ng update</code> migrates code with schematics.<br>
• Notable versions: <b>v14</b> standalone preview and inject(); <b>v16</b> signals preview; <b>v17</b> built-in control flow (@if/@for), @defer, esbuild builder, standalone in ng new schematics; <b>v17.1-17.3</b> signal inputs, model(), output(); <b>v18</b> stable control flow, zoneless experiment; <b>v19</b> standalone is the default (standalone: true no longer needed), linkedSignal/resource experimental, incremental hydration preview; <b>v20</b> signals APIs (effect, toSignal, linkedSignal) stable, zoneless in developer preview, new style guide with shorter file names; later versions continue to make zoneless and signal forms mainstream. Always read the current release notes on angular.dev.`),
        blk(`<h3>Choosing Angular</h3>
• Pick Angular when you need strong conventions across a big team, built-in solutions for everything, TypeScript-first tooling and a predictable upgrade path (the CLI migrates your code). Pick something lighter for small marketing sites or when SEO-first content frameworks fit better.<br>
• Java developers adapt quickly: classes, interfaces, decorators (like annotations), dependency injection and layering all feel familiar. The new ideas are asynchronous reactive code and the browser as an untrusted environment.<br>
• Rendering: Angular supports client-side rendering, server-side rendering, prerendering and hydration; the component model is the same.`),
      ],
      [
        ['What is Angular?', 'An open-source TypeScript framework from Google for building single-page applications, with components, templates, DI, routing, forms and HTTP built in.'],
        ['AngularJS vs Angular?', 'AngularJS (1.x) is the old JavaScript framework with controllers and scope, now end of life. Angular 2+ is a TypeScript, component-based rewrite.'],
        ['Why choose Angular over React?', 'Opinionated structure, batteries included (router, forms, HTTP, DI), TypeScript by default and consistent code across large teams; React offers more freedom but needs you to assemble the stack.'],
        ['How often is Angular released?', 'A major version about every six months, with 6 months active and 12 months long-term support per major.'],
        ['What are good use cases for Angular?', 'Enterprise dashboards, admin and back-office tools, data-heavy forms, and large applications maintained by many developers over years.'],
        ['What is a single-page application?', 'An app that loads one HTML document and updates the view in the browser through JavaScript and API calls instead of full page reloads.'],
      ],
    ),

    topic(
      'ngs-m3-setup-cli',
      'Setup, CLI and project structure',
      [
        blk(`<h3>Node.js, npm and the Angular CLI</h3>
• Angular tooling runs on <b>Node.js</b> (install the current LTS from nodejs.org; each Angular version lists the Node versions it supports). <b>npm</b> comes with Node and downloads libraries into node_modules. The <b>Angular CLI</b> is the command-line tool <code>ng</code> that creates, runs, builds and tests projects.`,
          `# check tools
node -v
npm -v

# install the CLI globally, create and run a project
npm install -g @angular/cli
ng version
ng new school-app          # answer the prompts (stylesheet format, SSR: no for now)
cd school-app
ng serve --open            # dev server at http://localhost:4200`),
        blk(`<h3>Angular project structure</h3>
• After <code>ng new</code> you get a workspace. The files you will touch most: <b>src/app</b> (your components and services), <b>src/main.ts</b> (bootstrap), <b>src/index.html</b>, <b>src/styles.css</b> (global styles), and <b>public/</b> or src/assets (static files).`,
          `school-app/
  angular.json            workspace and build configuration
  package.json            dependencies and npm scripts
  tsconfig.json           TypeScript options (plus tsconfig.app.json, tsconfig.spec.json)
  public/                 static files copied as-is (favicon, images)
  src/
    index.html            the single HTML page with <app-root>
    main.ts               bootstrapApplication(...)
    styles.css            global styles
    app/
      app.component.ts    root component (app.ts in the newest style guide)
      app.config.ts       providers: router, http, etc.
      app.routes.ts       route table`),
      ],
      [
        blk(`<h3>angular.json, package.json and tsconfig.json</h3>
• <b>angular.json</b> defines projects and their <b>architect targets</b> (build, serve, test) with options per <b>configuration</b> (production, development): entry file, assets, global styles, budgets, file replacements.<br>
• <b>package.json</b> lists dependencies (@angular/core, rxjs, zone.js, tslib), devDependencies (@angular/cli, typescript) and <b>scripts</b> (start = ng serve, build, test). Commit package-lock.json.<br>
• <b>tsconfig.json</b> sets compiler and strictness options; <b>angularCompilerOptions.strictTemplates</b> turns on template type checking.`,
          `// angular.json (shortened)
{
  "projects": {
    "school-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",     // esbuild-based builder (older: @angular-devkit/build-angular:application)
          "options": {
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "assets": [{ "glob": "**/*", "input": "public" }],
            "styles": ["src/styles.css"]
          },
          "configurations": {
            "production": { "budgets": [{ "type": "initial", "maximumError": "1MB" }], "outputHashing": "all" },
            "development": { "optimization": false, "sourceMap": true }
          },
          "defaultConfiguration": "production"
        },
        "serve": { "builder": "@angular/build:dev-server" }
      }
    }
  }
}

// package.json (shortened)
{
  "scripts": { "start": "ng serve", "build": "ng build", "test": "ng test" },
  "dependencies": { "@angular/core": "^20.0.0", "rxjs": "~7.8.0", "zone.js": "~0.15.0" },
  "devDependencies": { "@angular/cli": "^20.0.0", "typescript": "~5.8.0" }
}`),
        blk(`<h3>The development server and CLI commands</h3>
• <b>ng serve</b> builds in memory, serves at port 4200 and reloads on save (hot module replacement for styles; full or partial reload for code). Options: --port, --open, --host, --configuration, --proxy-config (to forward /api to Spring Boot at 8080 and avoid CORS during development).<br>
<table ${TABLE}>
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td>ng new</td><td>Create a workspace</td></tr>
<tr><td>ng serve</td><td>Dev server</td></tr>
<tr><td>ng generate (g) component|service|directive|pipe|guard|interceptor</td><td>Scaffold code</td></tr>
<tr><td>ng build</td><td>Compile to dist/</td></tr>
<tr><td>ng test</td><td>Run unit tests</td></tr>
<tr><td>ng add</td><td>Install and configure a library (Material)</td></tr>
<tr><td>ng update</td><td>Upgrade Angular with migrations</td></tr>
<tr><td>ng lint, ng e2e</td><td>Run configured linters / e2e tools (after adding them)</td></tr>
</table>`,
          `# proxy.conf.json : forward API calls to Spring Boot during development
{ "/api": { "target": "http://localhost:8080", "secure": false } }
# run: ng serve --proxy-config proxy.conf.json`),
      ],
      [
        blk(`<h3>Workspace practices</h3>
• Keep the Node version fixed per team (.nvmrc or the engines field) and use <b>npm ci</b> in CI for reproducible installs from the lockfile. Do not install the CLI globally in CI; use <b>npx ng</b> or a local script so each repo uses its own version.<br>
• <b>Version alignment</b>: all @angular/* packages must share the same major; upgrade one major at a time with <code>ng update @angular/core @angular/cli</code>, commit between steps, and read the update guide on angular.dev/update-guide.<br>
• <b>Budgets</b> in angular.json fail the build when bundles grow too large. <b>fileReplacements</b> or environment files swap settings per configuration (see the deployment module).<br>
• <b>Monorepos</b>: angular.json can hold many projects (apps and libraries) in one workspace; target a project with <code>ng build my-lib</code>.<br>
• <b>Analytics prompt</b> in ng new can be disabled with <code>ng analytics disable</code>; set NG_CLI_ANALYTICS=false in CI.<br>
• The dev server serves unminified code with source maps; never deploy it. Use ng build and static hosting (covered in the deployment module).`),
      ],
      [
        ['How do you create and run an Angular app?', 'Install Node.js, run npm install -g @angular/cli, then ng new app-name and ng serve to open http://localhost:4200.'],
        ['What is angular.json?', 'The workspace configuration file listing projects and their build/serve/test targets with options per configuration (production, development).'],
        ['What does package.json contain in an Angular project?', 'Dependencies (Angular packages, RxJS, zone.js), dev dependencies (CLI, TypeScript, test tools) and npm scripts such as start and build.'],
        ['What does ng serve do?', 'Builds the app in memory, serves it with live reload on port 4200 and rebuilds on every change.'],
        ['How do you avoid CORS problems in development?', 'Use the dev-server proxy (--proxy-config) so /api calls are forwarded to the backend from the same origin.'],
        ['How do you upgrade Angular safely?', 'Use ng update one major version at a time, review the official update guide, run tests, and commit after each step.'],
      ],
    ),

    topic(
      'ngs-m3-build-render',
      'Builds, rendering and module styles',
      [
        blk(`<h3>Angular compilation</h3>
• Browsers cannot read Angular templates. The Angular compiler converts your templates and decorators into plain JavaScript. With <b>AOT</b> (ahead-of-time) this happens during the build, so users download ready code. It also checks template types, catching errors like a misspelled property before release. Think of translating a book before printing instead of translating while reading.<br>
• <b>Development vs production builds</b>: <code>ng serve</code> and the development configuration are quick and readable (no minification, source maps). <code>ng build</code> (production by default) does AOT, tree shaking, minification, hashing of file names and budgets, producing a small <code>dist/</code> folder.`,
          `ng build                                  # production by default (since v12)
ng build --configuration development      # fast, readable build
# output: dist/school-app/browser/ with main-XXXX.js, styles-XXXX.css, index.html`),
        blk(`<h3>Standalone components and NgModules</h3>
• A <b>standalone component</b> lists what its template needs in its own <code>imports</code> array: no NgModule required. This is the modern default (v19+ ng new, and standalone: true is implied).<br>
• <b>NgModules</b> (@NgModule with declarations, imports, exports, providers, bootstrap) are the <b>legacy module-based</b> way. You will find them in older projects; they still work and mix with standalone code, and migrations exist (<code>ng generate @angular/core:standalone</code>).`,
          `// MODERN : standalone
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DatePipe],           // dependencies declared here
  template: '<router-outlet /> {{ today | date }}'
})
export class AppComponent { today = new Date(); }

// main.ts
bootstrapApplication(AppComponent, appConfig);

// LEGACY : NgModule
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
// main.ts
platformBrowserDynamic().bootstrapModule(AppModule);`),
      ],
      [
        blk(`<h3>Rendering fundamentals</h3>
• Each component template is compiled into a <b>template function</b> with two modes: a <b>create pass</b> that builds DOM nodes once, and an <b>update pass</b> that re-evaluates bindings and writes only what changed. This is the <b>Ivy</b> renderer (default since v9); there is no virtual DOM.<br>
• <b>Change detection</b> decides when the update pass runs: after browser events and async tasks in zone-based apps, or when a signal read by the template changes. Components using signals and OnPush are only refreshed when needed.<br>
• The bootstrap sequence: main.ts calls bootstrapApplication, creating the platform and an application injector with the providers from app.config.ts, then creates the root component and attaches it to the element matching its selector.`,
          `// app.config.ts : application-wide providers
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),   // reduces redundant checks
    provideRouter(routes),
    provideHttpClient(),
  ],
};`),
        blk(`<h3>Standalone vs NgModule: migration points</h3>
<table ${TABLE}>
<tr><th>Aspect</th><th>Standalone</th><th>NgModule</th></tr>
<tr><td>Dependencies</td><td>Component imports array</td><td>Module imports, shared via exports</td></tr>
<tr><td>Bootstrap</td><td>bootstrapApplication</td><td>bootstrapModule</td></tr>
<tr><td>Providers</td><td>provideXxx() functions in app.config</td><td>Module providers and forRoot()</td></tr>
<tr><td>Lazy loading</td><td>loadComponent / loadChildren routes</td><td>loadChildren with a module</td></tr>
<tr><td>Boilerplate</td><td>Low</td><td>Higher</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Build internals and pitfalls</h3>
• Builders: the default <code>application</code> builder uses <b>esbuild</b> and Vite for the dev server (v17+), giving much faster builds than the older webpack <code>browser</code> builder. It supports SSR and prerendering output. Hybrid code with webpack-only plugins needs migration (<code>ng update</code> offers it).<br>
• <b>Tree shaking</b> removes unused exports; providedIn: 'root' services are tree-shakable, module-level providers are not. Lazy routes become separate chunks. Check bundle contents with <code>ng build --stats-json</code> and a visualiser.<br>
• <b>AOT vs JIT</b>: JIT compiled in the browser at startup (no longer used by default; only in some tests). AOT enables template type checking, smaller bundles and faster startup. <b>strictTemplates</b> is highly recommended.<br>
• <b>Hydration and zoneless</b>: with SSR, hydration reuses server-rendered DOM instead of recreating it. Zoneless change detection (<code>provideZonelessChangeDetection()</code>, developer preview in v20 and promoted after) removes zone.js for smaller bundles and clearer updates, requiring signals/markForCheck.<br>
• Legacy NgModule apps: schematics can convert them to standalone gradually; mixing both in one app is supported (a standalone component can import a module, and an NgModule can import a standalone component).`),
      ],
      [
        ['What is AOT compilation?', 'Ahead-of-time compilation turns templates and decorators into JavaScript during the build, enabling template type checks, smaller bundles and faster startup.'],
        ['Development vs production build?', 'Development is quick with source maps and no minification; production adds AOT, tree shaking, minification, hashed file names and budgets for small, cacheable output.'],
        ['What is a standalone component?', 'A component that declares its own template dependencies in its imports array and needs no NgModule; the default style in modern Angular.'],
        ['Why are NgModules called legacy?', 'They add indirection (declarations/exports) that standalone components make unnecessary, though existing module-based apps remain supported and can be migrated.'],
        ['How does Angular render without a virtual DOM?', 'The Ivy compiler generates instructions per template that create DOM once and update only changed bindings during change detection.'],
        ['Where does an Angular app start?', 'main.ts calls bootstrapApplication(RootComponent, appConfig); the root selector in index.html is where the component mounts.'],
      ],
    ),
  ],
};

const module4: SubTopic = {
  id: 'ngs-mod-4',
  name: 'Module 4 · Components',
  topics: [
    overview(4, 'Components', [
      ['What is a component?', 'A reusable piece of UI made of a class, a template and styles.', 'Component anatomy'],
      ['Component architecture', 'An app is a tree of components; data flows down, events flow up.', 'Component anatomy'],
      ['Component decorator', '@Component supplies the metadata Angular needs.', 'Component anatomy'],
      ['Component selectors', 'The tag name (or attribute) used to place a component.', 'Component anatomy'],
      ['Component templates', 'The HTML (with bindings) a component renders.', 'Component anatomy'],
      ['Inline vs external templates', 'template string in the class or templateUrl to an html file.', 'Component anatomy'],
      ['Inline vs external styles', 'styles array or styleUrl file.', 'Component anatomy'],
      ['Component metadata', 'selector, imports, template, styles, changeDetection, encapsulation, host.', 'Component anatomy'],
      ['Creating components using CLI', 'ng generate component name.', 'Component anatomy'],
      ['Component imports', 'The imports array lists components, directives and pipes the template uses.', 'Component anatomy'],
      ['Standalone components', 'Components that need no NgModule.', 'Component anatomy'],
      ['Parent and child components', 'A component placing another in its template.', 'Parent-child communication'],
      ['Component reusability', 'Design components that work in many places through inputs and outputs.', 'Parent-child communication'],
      ['Component composition', 'Building complex UI from small components.', 'Parent-child communication'],
      ['Component communication', 'Inputs down, outputs up, services for distant components.', 'Parent-child communication'],
      ['input() and output()', 'Signal-based input and output functions (17.1+/17.3+).', 'Parent-child communication'],
      ['@Input() and @Output()', 'The decorator forms; still fully supported.', 'Parent-child communication'],
      ['EventEmitter', 'The class behind @Output().', 'Parent-child communication'],
      ['Model inputs and two-way component binding', 'model() with [(value)] syntax (17.2+).', 'Parent-child communication'],
      ['Template reference variables', '#name gives access to an element, component or directive in the template.', 'Queries, projection and dynamic components'],
      ['ViewChild and ViewChildren', 'Query elements and components in your own template.', 'Queries, projection and dynamic components'],
      ['ContentChild and ContentChildren', 'Query projected content supplied by the parent.', 'Queries, projection and dynamic components'],
      ['Content projection using ng-content', 'Let the parent pass markup into your template.', 'Queries, projection and dynamic components'],
      ['Multi-slot content projection', 'Several ng-content slots chosen with select.', 'Queries, projection and dynamic components'],
      ['Dynamic components', 'Create components at runtime (NgComponentOutlet, ViewContainerRef).', 'Queries, projection and dynamic components'],
      ['Component lifecycle', 'The hooks Angular calls from creation to destruction.', 'Lifecycle, change detection and styling'],
      ['Component destruction', 'Cleanup in ngOnDestroy or DestroyRef.', 'Lifecycle, change detection and styling'],
      ['Change detection', 'How Angular decides to refresh the view.', 'Lifecycle, change detection and styling'],
      ['Component styling and encapsulation', 'Component-scoped CSS via ViewEncapsulation.', 'Lifecycle, change detection and styling'],
      ['Best practices for reusable components', 'Small, input-driven, accessible, OnPush, well-named components.', 'Lifecycle, change detection and styling'],
    ]),

    topic(
      'ngs-m4-anatomy',
      'Component anatomy',
      [
        blk(`<h3>What is a component?</h3>
• A <b>component</b> is a LEGO brick of your UI: a TypeScript class (data and behaviour), an HTML <b>template</b> (what is shown) and optional CSS (how it looks). A page is a <b>tree of components</b>: an app shell contains a header, a course list, and each course card is a component too. This is the <b>component architecture</b> of Angular.<br>
• The <b>@Component decorator</b> marks a class as a component and carries its <b>metadata</b>. The <b>selector</b> is the custom HTML tag you write to place it.`,
          `// course-card.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-course-card',                 // use as <app-course-card></app-course-card>
  template: '<h3>{{ title }}</h3><p>{{ hours }} hours</p>',
  styles: ['h3 { color: #1976d2; }'],
})
export class CourseCardComponent {
  title = 'Angular Basics';
  hours = 40;
}

// app.component.ts : use it
@Component({
  selector: 'app-root',
  imports: [CourseCardComponent],               // standalone: declare what the template uses
  template: '<app-course-card /><app-course-card />',
})
export class AppComponent {}`),
        blk(`<h3>Creating components with the CLI</h3>
• <code>ng generate component courses/course-card</code> (short: <code>ng g c</code>) creates the ts, html, css and spec files in one step. Add --inline-template or --inline-style to keep them in the class, and --skip-tests to omit the spec.`,
          `ng g c courses/course-card
# creates src/app/courses/course-card/course-card.component.ts / .html / .css / .spec.ts
ng g c shared/badge --inline-template --inline-style --skip-tests`),
      ],
      [
        blk(`<h3>Inline vs external templates and styles, metadata</h3>
• <b>Inline</b> (template, styles) suits tiny components of a few lines. <b>External</b> (templateUrl, styleUrl) keeps real templates readable and gets editor HTML support. Since v17 use <code>styleUrl</code> (single) and <code>styleUrls</code> (list).<br>
• Important <b>component metadata</b>: <b>selector</b>, <b>template/templateUrl</b>, <b>styles/styleUrl</b>, <b>imports</b>, <b>changeDetection</b> (OnPush), <b>encapsulation</b>, <b>providers</b> (component-level services), <b>host</b> (bindings on the host element), and <b>standalone</b> (default true from v19).`,
          `import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-course-card',
  imports: [DatePipe, NgOptimizedImage],              // component imports: other components, directives, pipes
  templateUrl: './course-card.component.html',         // external template
  styleUrl: './course-card.component.css',             // external styles
  changeDetection: ChangeDetectionStrategy.OnPush,     // recommended default for new components
  host: { class: 'card', '[attr.role]': '"article"' }, // host element bindings
})
export class CourseCardComponent {}`),
        blk(`<h3>Selectors and standalone imports</h3>
• Selectors may be an element name (the usual, with a prefix like <code>app-</code>), an attribute (<code>[appTooltip]</code>) or a class; but components should normally use element selectors, attribute selectors fit directives. The selector must be unique and kebab-case.<br>
• <b>Component imports</b>: anything the template uses must be imported: other standalone components, directives (NgClass), pipes (DatePipe), or legacy NgModules (FormsModule). A missing import gives a compile error "is not a known element" in strict templates.`,
          `<!-- if the import is forgotten -->
<!-- error NG8001: 'app-course-card' is not a known element -->

@Component({ selector: 'app-demo', imports: [CourseCardComponent, NgClass, FormsModule], template: '...' })
export class DemoComponent {}`),
      ],
      [
        blk(`<h3>Standalone components and conventions</h3>
• <b>Standalone components</b> (v14+, default v19+) carry their own dependency list, so they are tree-shakable and lazy-loadable one by one with <code>loadComponent</code>. In Angular 17 to 18 write <code>standalone: true</code> explicitly; from 19 it is implied and the ng update migration removes it (add <code>standalone: false</code> for NgModule-declared ones).<br>
• Angular 20's style guide drops the type suffix from file and class names for new projects (<code>course-card.ts</code> with class CourseCard); the older <code>.component.ts</code> naming remains common and fully valid. Be consistent within a project.<br>
• Keep components <b>thin</b>: presentation and event wiring in the component, data access and business rules in services. Inject with <code>inject()</code> instead of constructor parameters in new code.<br>
• Prefix selectors per feature area (<code>app-</code>, <code>admin-</code>) and enforce with ESLint @angular-eslint/component-selector. Do not use the CLI's default styles inline for larger components; extracting them improves diffs and reuse.<br>
• Template compilation: AOT turns the template into a function evaluated by change detection. Complex expressions and method calls in templates run on every check, so prefer fields, signals and computed values.`),
      ],
      [
        ['What is an Angular component?', 'A class decorated with @Component that combines a template, styles and logic into a reusable UI building block with its own selector.'],
        ['Inline vs external template?', 'Inline puts HTML in the template property (fine for tiny components); external uses templateUrl for larger templates with better tooling.'],
        ['What does the selector do?', 'It defines the HTML tag (or attribute) that Angular replaces with the component\'s rendered view.'],
        ['What is the imports array of a standalone component?', 'The list of components, directives, pipes or NgModules that the component\'s template uses.'],
        ['How do you create a component with the CLI?', 'ng generate component path/name (ng g c), optionally with --inline-template, --inline-style or --skip-tests.'],
        ['Why use OnPush for components?', 'It limits change detection to when inputs change by reference, an event fires inside, or a signal/async pipe notifies, improving performance and predictability.'],
      ],
    ),

    topic(
      'ngs-m4-communication',
      'Parent-child communication',
      [
        blk(`<h3>Parent and child components, composition and reuse</h3>
• A <b>parent</b> component places a <b>child</b> in its template with the child's selector, just like using an HTML tag. <b>Composition</b> means building big screens from small components (page, list, card, button). A <b>reusable</b> component gets its data from <b>inputs</b> rather than hard-coding it, and reports user actions through <b>outputs</b>.<br>
• Rule of thumb: <b>data flows down</b> (parent to child through inputs) and <b>events flow up</b> (child to parent through outputs). Think of a manager giving a task (input) and the worker reporting back (output).`,
          `// child: rating.component.ts  (modern signal-based API, Angular 17.1+ for input, 17.3+ for output)
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-rating',
  template: \`
    <span>{{ label() }}: </span>
    <button (click)="rate.emit(value())">Rate {{ value() }}</button>\`,
})
export class RatingComponent {
  value = input(5);                      // optional input with default
  label = input.required<string>();      // required input: parent must bind it
  rate = output<number>();               // child to parent event
}

// parent
@Component({
  selector: 'app-course',
  imports: [RatingComponent],
  template: '<app-rating label="Angular" [value]="4" (rate)="onRate($event)" />',
})
export class CourseComponent {
  onRate(v: number) { console.log('rated', v); }
}`),
      ],
      [
        blk(`<h3>@Input(), @Output() and EventEmitter (decorator style)</h3>
• Before signals, communication used decorators: <b>@Input()</b> marks a property the parent can set; <b>@Output()</b> marks an <b>EventEmitter</b> the child fires with <code>emit()</code>. This style is not deprecated and appears in most existing code; new code prefers <b>input()</b> and <b>output()</b> (they give signals, required inputs, transforms and better typing).`,
          `import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({ selector: 'app-rating', template: '<button (click)="rate.emit(value)">Rate</button>' })
export class RatingComponent {
  @Input() value = 5;                                  // decorator input
  @Input({ required: true }) label!: string;           // required (v16+)
  @Input({ transform: booleanAttribute }) disabled = false;   // transform (v16.1+)
  @Output() rate = new EventEmitter<number>();         // decorator output
}`),
        blk(`<h3>Model inputs and two-way component binding</h3>
• <b>model()</b> (Angular 17.2+) declares an input that the child can also write back to. The parent uses the banana-in-a-box syntax <code>[(value)]</code>. It is the signal replacement for the pattern of an @Input() value plus an @Output() valueChange.`,
          `// toggle.component.ts
import { Component, model } from '@angular/core';
@Component({
  selector: 'app-toggle',
  template: '<button (click)="on.set(!on())">{{ on() ? "ON" : "OFF" }}</button>',
})
export class ToggleComponent {
  on = model(false);                    // readable AND writable by the child
}

// parent template: two-way binding to a parent signal or field
// <app-toggle [(on)]="darkMode" />
// parent class: darkMode = signal(false);`),
        blk(`<h3>Communication options at a glance</h3>
<table ${TABLE}>
<tr><th>Situation</th><th>Use</th></tr>
<tr><td>Parent to child</td><td>input() / @Input()</td></tr>
<tr><td>Child to parent</td><td>output() / @Output() with EventEmitter</td></tr>
<tr><td>Both directions, one value</td><td>model() / [(value)]</td></tr>
<tr><td>Parent calls child method</td><td>template reference or viewChild()</td></tr>
<tr><td>Siblings or distant components</td><td>A shared service with signals or Subjects</td></tr>
<tr><td>Deep subtrees</td><td>Dependency injection (providers in a component)</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Signal inputs in depth and design rules</h3>
• <b>Signal inputs</b> are read-only signals (<code>value()</code>), so <code>computed()</code> and <code>effect()</code> react to them without ngOnChanges. Options: <code>input(0, { alias: 'count', transform: numberAttribute })</code>. Required inputs have no default and fail the build if missing. In tests set them with <code>fixture.componentRef.setInput('value', 3)</code>.<br>
• Input signals cannot be assigned inside the child; if a child needs local edits use <code>model()</code> or copy into a <code>linkedSignal</code>. Never mutate an object received via input: it breaks OnPush and surprises the parent. Treat inputs as <b>immutable</b>.<br>
• <b>output()</b> returns an OutputEmitterRef (not an Observable subclass like EventEmitter). It can be subscribed programmatically with <code>.subscribe()</code> and auto-cleans up. <code>outputFromObservable()</code> and <code>outputToObservable()</code> bridge to RxJS. Do not call <code>.subscribe</code> on EventEmitter in the child to emit; EventEmitter's only supported use is @Output().<br>
• <b>Reusability</b> guidance: smart (container) components fetch data and manage state; <b>presentational</b> components only take inputs and emit outputs. Keep the API small, name outputs as verbs without the on prefix (<code>(save)</code>, not <code>(onSave)</code>), do not reach into parents via injection of the parent component, and support ARIA and keyboard use.<br>
• Versions: input() 17.1, model() and signal queries 17.2, output() 17.3; all stable since v19.`),
      ],
      [
        ['How does a parent pass data to a child?', 'Through an input: bind with [name]="value" in the parent template, where the child declares input() or @Input().'],
        ['How does a child notify a parent?', 'By emitting an output: output() with .emit(value), or @Output() EventEmitter; the parent listens with (name)="handler($event)".'],
        ['What is EventEmitter?', 'The RxJS-based class used with @Output(); calling emit() sends a value to the parent\'s event handler.'],
        ['What does model() do?', 'It creates a writable input (Angular 17.2+) enabling two-way binding [(value)] between parent and child without a manual valueChange output.'],
        ['Difference between input() and @Input()?', 'input() returns a read-only signal, supports required inputs and transforms with better typing, and works with computed/effect; @Input() is a decorated property updated by Angular and observed through ngOnChanges.'],
        ['How do two sibling components communicate?', 'Through a shared service (holding signals or subjects) or through their common parent passing inputs and handling outputs.'],
      ],
    ),

    topic(
      'ngs-m4-queries-projection',
      'Queries, projection and dynamic components',
      [
        blk(`<h3>Template reference variables</h3>
• A <b>template reference variable</b> is a name tag you attach with <code>#name</code>. It refers to the DOM element (or the component/directive instance) inside the same template, so you can use it without writing TypeScript.`,
          `<input #nameInput type="text" placeholder="Name">
<button (click)="greet(nameInput.value)">Greet</button>        <!-- read the input directly -->

<app-timer #timer />
<button (click)="timer.start()">Start</button>                    <!-- call a child's public method -->`),
        blk(`<h3>Content projection with ng-content</h3>
• <b>Content projection</b> lets a parent put its own markup inside your component, like a picture frame that shows whatever photo you slide in. You mark the hole with <code>&lt;ng-content&gt;</code>. <b>Multi-slot projection</b> uses several ng-content tags with a <code>select</code> attribute (CSS selector).`,
          `// card.component.ts
@Component({
  selector: 'app-card',
  template: \`
    <div class="card">
      <header><ng-content select="[card-title]" /></header>   <!-- slot 1 -->
      <section><ng-content /></section>                         <!-- default slot -->
      <footer><ng-content select="app-actions" /></footer>      <!-- slot by element name -->
    </div>\`,
})
export class CardComponent {}

// usage
// <app-card>
//   <h2 card-title>Angular</h2>
//   <p>Course description (goes to the default slot)</p>
//   <app-actions>Enroll</app-actions>
// </app-card>`),
      ],
      [
        blk(`<h3>ViewChild, ViewChildren, ContentChild, ContentChildren</h3>
• <b>ViewChild / ViewChildren</b> query things in the component's <b>own template</b>. <b>ContentChild / ContentChildren</b> query things that the parent <b>projected</b> into ng-content. Modern code uses the signal functions <code>viewChild()</code>, <code>viewChildren()</code>, <code>contentChild()</code>, <code>contentChildren()</code> (17.2+), which return signals; the decorators (@ViewChild etc.) still work.<br>
• Results are available after the view is created (the signal is simply undefined until then; with the decorator form, read in ngAfterViewInit).`,
          `import { Component, ElementRef, viewChild, viewChildren, contentChildren, afterNextRender } from '@angular/core';

@Component({
  selector: 'app-search',
  imports: [ItemComponent],
  template: \`
    <input #box placeholder="Search">
    @for (i of items; track i) { <app-item [name]="i" /> }\`,
})
export class SearchComponent {
  items = ['a', 'b'];
  box = viewChild.required<ElementRef<HTMLInputElement>>('box');   // required: always present
  rows = viewChildren(ItemComponent);                              // Signal<readonly ItemComponent[]>

  constructor() {
    afterNextRender(() => this.box().nativeElement.focus());       // safe DOM access after render
  }
}

// tabs.component.ts : query projected content
@Component({ selector: 'app-tabs', template: '<ng-content />' })
export class TabsComponent {
  tabs = contentChildren(TabComponent);                            // children supplied by the parent
}

// legacy decorator form
// @ViewChild('box') box!: ElementRef<HTMLInputElement>;
// @ContentChild(HeaderDirective) header?: HeaderDirective;`),
        blk(`<h3>Dynamic components</h3>
• <b>Dynamic components</b> are created at runtime, chosen by data: wizards, widget dashboards, plugin UIs. The simple way is the <b>NgComponentOutlet</b> directive. The flexible way is <code>ViewContainerRef.createComponent()</code>, which returns a ComponentRef so you can set inputs and destroy it.`,
          `import { NgComponentOutlet } from '@angular/common';

@Component({
  imports: [NgComponentOutlet],
  template: '<ng-container *ngComponentOutlet="current; inputs: { title: "Hi" }" />',   // inputs option: v16.2+
})
export class HostComponent {
  current: Type<unknown> = ChartWidgetComponent;     // swap to render something else
}

// imperative
@Component({ template: '<ng-container #slot />' })
export class Host2 {
  slot = viewChild.required('slot', { read: ViewContainerRef });
  add() {
    const ref = this.slot().createComponent(ChartWidgetComponent);
    ref.setInput('title', 'Sales');                  // set inputs on a dynamic component
    // ref.destroy() removes it
  }
}`),
      ],
      [
        blk(`<h3>Timing, pitfalls and tips</h3>
• <b>Projection is not creation</b>: projected content is created by the parent even if the child never renders the slot (for example inside an @if that is false). The elements are instantiated and run their constructors regardless. To create content lazily, pass an <b>ng-template</b> and render it with ngTemplateOutlet.<br>
• <b>Static vs dynamic queries</b>: a ViewChild inside @if or @for resolves later (use the signal form or ngAfterViewInit). Query options: <code>read</code> (get ElementRef, ViewContainerRef or a different token), <code>descendants</code> for ContentChildren (default false, direct children only), <code>static</code> in decorator form.<br>
• <b>Do not read or mutate the DOM in the constructor or ngOnInit</b>: the view is not ready. Use afterNextRender / afterRender (SSR-safe, runs only in the browser) rather than setTimeout hacks.<br>
• Reaching into a child via ViewChild to call methods tightly couples components; prefer inputs and outputs, and use queries for genuinely imperative needs (focus, scroll, measurements, coordinating tab groups).<br>
• <b>Default content for ng-content</b> is not supported in older versions; Angular 18+ allows fallback content inside ng-content tags. A template can contain only one ng-content without a select as the catch-all slot. <code>ngProjectAs</code> lets an element pretend to match another selector.<br>
• Dynamic components must be standalone (or declared) and the inputs must be set through setInput (so OnPush and signal inputs update); assigning instance properties directly skips change notification. Always call destroy() or rely on the ViewContainerRef being destroyed to avoid leaks.`),
      ],
      [
        ['What is a template reference variable?', 'A #name tag on an element, component or ng-template that gives other parts of the same template access to that instance.'],
        ['ViewChild vs ContentChild?', 'ViewChild queries nodes declared in the component\'s own template; ContentChild queries nodes the parent projected into it via ng-content.'],
        ['When are ViewChild results available?', 'After the view is initialised: ngAfterViewInit for decorator queries; with viewChild() signals the value updates automatically and is read when needed.'],
        ['What is content projection?', 'Passing markup from a parent into a child\'s ng-content slot(s) so the child provides structure and the parent the content.'],
        ['How do you build multi-slot projection?', 'Use several ng-content elements with a select attribute (CSS selector), plus one unselected default slot.'],
        ['How do you create a component dynamically?', 'With NgComponentOutlet in a template, or ViewContainerRef.createComponent() in code, then setInput() and destroy() on the returned ComponentRef.'],
      ],
    ),

    topic(
      'ngs-m4-lifecycle-styling',
      'Lifecycle, change detection and styling',
      [
        blk(`<h3>Component lifecycle and destruction</h3>
• Every component has a life: it is created, shown, updated and destroyed. Angular calls <b>lifecycle hooks</b> at each stage, like a theatre calling the actor at the right cue. The most used: <b>ngOnInit</b> (once, after inputs are set; load data here), <b>ngOnChanges</b> (an input changed), <b>ngAfterViewInit</b> (view ready), and <b>ngOnDestroy</b> (cleanup).<br>
• <b>Component destruction</b>: when a component is removed (route change, @if false) Angular calls ngOnDestroy. Use it to unsubscribe, stop timers and remove listeners. Modern alternative: <code>inject(DestroyRef).onDestroy(...)</code>.`,
          `import { Component, OnDestroy, OnInit, inject, DestroyRef } from '@angular/core';

@Component({ selector: 'app-clock', template: '{{ now }}' })
export class ClockComponent implements OnInit, OnDestroy {
  now = new Date().toLocaleTimeString();
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit() { this.timer = setInterval(() => this.now = new Date().toLocaleTimeString(), 1000); }
  ngOnDestroy() { clearInterval(this.timer); }          // cleanup, prevents a leak

  // alternative using DestroyRef
  private destroyRef = inject(DestroyRef);
  constructor() { this.destroyRef.onDestroy(() => console.log('gone')); }
}`),
        blk(`<h3>Change detection and styling basics</h3>
• <b>Change detection</b> is how Angular notices that data changed and updates the screen. By default it checks every component after any event; with <b>OnPush</b> or signals it checks only components whose inputs or signals changed.<br>
• Component CSS is <b>scoped</b> to its own template by default (<b>emulated encapsulation</b>): a style for h3 in one component does not leak into others.`),
      ],
      [
        blk(`<h3>Change detection strategies</h3>
<table ${TABLE}>
<tr><th>Strategy</th><th>Checks the component when</th></tr>
<tr><td>Default</td><td>Anything async happens anywhere (every check pass)</td></tr>
<tr><td>OnPush</td><td>An input reference changes, an event handler in it runs, an async pipe or signal read by the template updates, or markForCheck() is called</td></tr>
</table>`,
          `@Component({
  selector: 'app-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '@for (c of courses(); track c.id) { <p>{{ c.title }}</p> }',
})
export class ListComponent {
  courses = input.required<Course[]>();
  // parent must pass a NEW array for OnPush to notice:
  //   this.list = [...this.list, newCourse];    (not this.list.push(newCourse))
}`),
        blk(`<h3>Styling and view encapsulation</h3>
• <b>ViewEncapsulation.Emulated</b> (default): Angular adds unique attributes so styles apply only to this component. <b>None</b>: styles become global. <b>ShadowDom</b>: real shadow DOM. Special selectors: <code>:host</code> (the component's own element), <code>:host-context()</code>, and <code>::ng-deep</code> (deprecated; avoid). Pass theme values through <b>CSS custom properties</b>, which pierce encapsulation.`,
          `@Component({
  selector: 'app-badge',
  encapsulation: ViewEncapsulation.Emulated,
  styles: '
    :host { display: inline-block; }                       /* style the host element */
    :host(.big) { font-size: 1.5rem; }                     /* host with class big */
    span { background: var(--badge-bg, #1976d2); color: white; padding: 2px 8px; }
  ',
  template: '<span><ng-content /></span>',
})
export class BadgeComponent {}
// parent styles it from outside: app-badge { --badge-bg: green; }`),
      ],
      [
        blk(`<h3>Best practices for reusable components</h3>
• Make components <b>small and single-purpose</b>; use <b>OnPush</b> plus signal inputs; keep templates declarative with computed values instead of method calls; name selectors with a prefix; provide good defaults and document inputs.<br>
• Accessibility: native elements (button, not div), labels, keyboard handling, focus management, ARIA only where needed. Style via CSS variables and :host, never depend on a parent's global CSS.<br>
• Avoid hidden dependencies: do not inject the parent component; take data by inputs and emit outputs. Provide customisation via content projection (templates for headers, empty states) instead of a flood of boolean flags.<br>
• Clean up everything you start: subscriptions (use <code>takeUntilDestroyed()</code> or the async pipe), timers, event listeners.<br>
• Test through the public API (inputs, outputs, DOM), not internals.`),
        blk(`<h3>Lifecycle and change detection internals</h3>
• Order for one component: constructor, ngOnChanges, ngOnInit, ngDoCheck, ngAfterContentInit, ngAfterContentChecked, ngAfterViewInit, ngAfterViewChecked, and later ngOnDestroy. The constructor should only wire dependencies (inject). Details of every hook are in the dedicated lifecycle module.<br>
• <b>Zone.js</b> patches browser async APIs and triggers a change detection pass after each task; <b>signals</b> mark just the consuming views dirty and enable <b>zoneless</b> apps (provideZonelessChangeDetection, stable in recent versions). Never mutate state inside ngAfterViewChecked in dev mode: it triggers ExpressionChangedAfterItHasBeenChecked.<br>
• With ViewEncapsulation.None two components can clash in CSS; global styles belong in styles.css, library themes via custom properties. Shadow DOM encapsulation blocks global CSS entirely, including utility frameworks like Tailwind.<br>
• Prefer <code>afterNextRender</code>/<code>afterEveryRender</code> (v17+; stable v19) over ngAfterViewInit for DOM measurement because they run only in the browser, which keeps SSR safe.`),
      ],
      [
        ['What is the difference between constructor and ngOnInit?', 'The constructor runs at instantiation (dependency wiring only) before inputs are set; ngOnInit runs once after the first inputs are bound and is where initialisation logic belongs.'],
        ['Why implement ngOnDestroy?', 'To release resources the component started: unsubscribe from Observables, clear timers and remove event listeners, preventing memory leaks.'],
        ['What does OnPush change?', 'The component is checked only when an input reference changes, an event fires in it, an async pipe/signal updates, or it is marked for check, instead of on every pass.'],
        ['What are the view encapsulation modes?', 'Emulated (default, attribute-scoped), None (global styles) and ShadowDom (native shadow root).'],
        ['How can a parent restyle a child component?', 'Through CSS custom properties the child exposes, host classes the child supports, or ng-content; ::ng-deep is deprecated.'],
        ['What makes a component reusable?', 'A clear input/output API, no hidden dependencies on parents, projection for customisation, OnPush, accessibility and styling through variables.'],
      ],
    ),
  ],
};

const module5: SubTopic = {
  id: 'ngs-mod-5',
  name: 'Module 5 · Templates and Data Binding',
  topics: [
    overview(5, 'Templates and Data Binding', [
      ['Angular template syntax', 'HTML plus bindings, control flow and special attributes.', 'Template syntax and core bindings'],
      ['Interpolation', '{{ expression }} prints a value as text.', 'Template syntax and core bindings'],
      ['Property binding', '[prop]="expr" sets a DOM or component property.', 'Template syntax and core bindings'],
      ['Event binding', '(event)="statement" reacts to events.', 'Template syntax and core bindings'],
      ['Two-way data binding', '[(x)] keeps a value and the UI in sync both ways.', 'Template syntax and core bindings'],
      ['The [(ngModel)] syntax', 'Two-way binding for form controls (needs FormsModule).', 'Template syntax and core bindings'],
      ['Template reference variables', '#ref names an element or instance for use in the template.', 'Template syntax and core bindings'],
      ['Template expressions', 'The JavaScript-like code inside {{ }} and [ ].', 'Template syntax and core bindings'],
      ['Template statements', 'The actions inside ( ) event bindings, may assign and call.', 'Template syntax and core bindings'],
      ['Expression restrictions', 'No new, no ++, no globals, no chained assignments; keep side-effect free.', 'Template syntax and core bindings'],
      ['Binding HTML attributes', '[attr.name] sets attributes that have no DOM property.', 'Attribute, class, style and event bindings'],
      ['Class binding', '[class.active] or [class]="expr" toggles CSS classes.', 'Attribute, class, style and event bindings'],
      ['Style binding', '[style.width.px] sets inline styles.', 'Attribute, class, style and event bindings'],
      ['Event modifiers and event handling', '$event, key filters like keyup.enter, preventDefault.', 'Attribute, class, style and event bindings'],
      ['Keyboard events', 'keydown, keyup with key filters.', 'Attribute, class, style and event bindings'],
      ['Mouse events', 'click, dblclick, mouseenter, mouseleave, contextmenu.', 'Attribute, class, style and event bindings'],
      ['Form events', 'input, change, submit, focus, blur.', 'Attribute, class, style and event bindings'],
      ['Conditional rendering', 'Show or hide parts of the template depending on data.', 'Built-in control flow'],
      ['List rendering', 'Repeat markup for each array item.', 'Built-in control flow'],
      ['Template variables', '@let and @for aliases such as $index.', 'Built-in control flow'],
      ['ng-template', 'A template that is not rendered until you use it.', 'Template fragments and type checking'],
      ['ng-container', 'A grouping element that adds nothing to the DOM.', 'Template fragments and type checking'],
      ['ngTemplateOutlet', 'Renders an ng-template where you choose, with context.', 'Template fragments and type checking'],
      ['Template fragments', 'Reusable pieces of template (ng-template, @let) within one component.', 'Template fragments and type checking'],
      ['Built-in control flow: @if', 'Conditional block (Angular 17+).', 'Built-in control flow'],
      ['Built-in control flow: @else', '@else and @else if branches.', 'Built-in control flow'],
      ['Built-in control flow: @for', 'Loop block with @empty.', 'Built-in control flow'],
      ['Tracking items with track', 'track tells Angular how to identify items (required).', 'Built-in control flow'],
      ['Built-in control flow: @switch', 'Multi-way branch with @case and @default.', 'Built-in control flow'],
      ['Template type checking', 'The compiler type-checks template expressions (strictTemplates).', 'Template fragments and type checking'],
    ]),

    topic(
      'ngs-m5-bindings',
      'Template syntax and core bindings',
      [
        blk(`<h3>Angular template syntax and interpolation</h3>
• An <b>Angular template</b> is HTML with superpowers. It is the view of a component, and everything dynamic is written with a few special symbols. Think of a mail-merge letter: the fixed text is HTML and the placeholders are bindings filled with data from the class.<br>
• <b>Interpolation</b> <code>{{ expression }}</code> prints a value (converted to text) into the page.`,
          `// profile.component.ts
@Component({
  selector: 'app-profile',
  template: \`
    <h1>Hello, {{ user.name }}!</h1>
    <p>Total: {{ price * quantity }} ({{ quantity > 1 ? "items" : "item" }})</p>\`,
})
export class ProfileComponent {
  user = { name: 'Asha' };
  price = 250;
  quantity = 2;
}`),
        blk(`<h3>Property, event and two-way binding</h3>
• <b>Property binding</b> <code>[property]="expression"</code> pushes data from the class to an element or child component (class to view). <b>Event binding</b> <code>(event)="statement"</code> sends user actions from the view to the class. <b>Two-way data binding</b> <code>[(x)]</code> combines both: banana in a box.<br>
• The <b>[(ngModel)]</b> syntax is the classic two-way binding for form inputs; it needs <code>FormsModule</code> in the component imports.`,
          `<img [src]="photoUrl" [alt]="title">                    <!-- property binding -->
<button [disabled]="!valid" (click)="save()">Save</button>   <!-- property + event binding -->
<input [(ngModel)]="name">                                <!-- two-way: typing updates 'name' and vice versa -->
<p>You typed: {{ name }}</p>

// component imports: [FormsModule]   <- required for ngModel
// class: name = '';  photoUrl = 'a.png';  valid = true;  save() { ... }`),
      ],
      [
        blk(`<h3>Property binding vs interpolation, and the three directions</h3>
<table ${TABLE}>
<tr><th>Syntax</th><th>Direction</th><th>Example</th></tr>
<tr><td>{{ }}</td><td>class to view (text)</td><td>&lt;p&gt;{{ title }}&lt;/p&gt;</td></tr>
<tr><td>[ ]</td><td>class to view (property)</td><td>&lt;img [src]="url"&gt;</td></tr>
<tr><td>( )</td><td>view to class</td><td>&lt;button (click)="save()"&gt;</td></tr>
<tr><td>[( )]</td><td>both</td><td>&lt;input [(ngModel)]="name"&gt;</td></tr>
</table>
• Binding to the <b>property</b> (not the HTML attribute) is the key idea: <code>[value]</code> sets the live DOM property, while the attribute only sets the initial value. Interpolation inside attributes (<code>title="Hi {{ name }}"</code>) is just sugar for property binding.<br>
• Use property binding to pass non-string data to child components: <code>&lt;app-rating [value]="4"&gt;</code> passes a number; <code>value="4"</code> would pass the string "4".`),
        blk(`<h3>Two-way binding without ngModel, template reference variables</h3>
• <code>[(x)]</code> is shorthand for <code>[x]="v" (xChange)="v = $event"</code>. A component supports it when it has an input x and an output xChange (or a model() input). Use <b>template reference variables</b> (<code>#box</code>) to read values without TypeScript.`,
          `<!-- the long form of [(ngModel)] -->
<input [ngModel]="name" (ngModelChange)="name = $event">

<!-- reference variable -->
<input #city placeholder="City">
<button (click)="search(city.value)">Search</button>

<!-- signals : two-way binding to a signal works directly -->
<input [(ngModel)]="query">       <!-- class: query = signal(''); -->`),
        blk(`<h3>Template expressions and statements</h3>
• A <b>template expression</b> (inside {{ }} and [ ]) is a small JavaScript-like expression: property access, method calls, operators, ternary, pipes (<code>value | date</code>), safe navigation (<code>user?.name</code>), non-null assertion (<code>user!.name</code>) and nullish coalescing (<code>??</code>).<br>
• A <b>template statement</b> (inside ( )) responds to an event: it may assign (<code>count = count + 1</code>), call methods, use <code>$event</code>, and chain with semicolons.`,
          `<p>{{ user?.address?.city ?? "Unknown" }}</p>
<p>{{ total | currency }}</p>
<button (click)="count = count + 1; log($event)">Add</button>`),
      ],
      [
        blk(`<h3>Expression restrictions and how the engine evaluates</h3>
• <b>Expression restrictions</b>: no assignment (in expressions), no <code>new</code>, no <code>++</code>/<code>--</code>, no bitwise operators, no chaining with commas, no access to globals such as <code>window</code>, <code>document</code>, <code>console</code> or <code>Math</code> (expose them via class members), no template literal syntax in older versions, no arrow functions or regular expression literals in expressions. Template-literal strings are supported from v19.2; check your version.<br>
• Expressions must be <b>fast and side-effect free</b>: change detection may run them many times per second. A method call like <code>{{ expensive() }}</code> executes on every pass; use a field, a <b>computed signal</b> or a <b>pure pipe</b> instead.<br>
• The pipe operator has the lowest precedence: <code>{{ a + b | number }}</code> pipes the sum; use parentheses when needed.<br>
• Interpolation output is <b>escaped</b> and bindings to dangerous properties (innerHTML, href=javascript:, style) are <b>sanitised</b>: Angular protects against XSS by default. Bypass APIs (DomSanitizer.bypassSecurityTrust...) are dangerous and should be avoided.<br>
• Two-way binding with signals: <code>[(ngModel)]="sig"</code> and <code>[(value)]="sig"</code> accept a WritableSignal directly (since v17.2). Unwrap with <code>sig()</code> in read-only places.<br>
• <b>Reference variable scope</b>: it is visible in the whole template including children, but not inside separate ng-templates declared elsewhere (structural scoping). Reference variables on a component give the instance; on a plain element the DOM element; <code>#f="ngForm"</code> exports a directive.`),
      ],
      [
        ['Difference between interpolation and property binding?', 'Interpolation renders a value as text and is sugar for binding a string; property binding [prop] sets any DOM or component property with its real type (number, boolean, object).'],
        ['What does [(ngModel)] expand to?', '[ngModel]="value" (ngModelChange)="value = $event"; it needs FormsModule.'],
        ['What is a template statement?', 'The code in an event binding (click)="..."; it can assign values and call methods, and can use $event.'],
        ['Why avoid method calls in template expressions?', 'They run on every change detection pass; use fields, computed signals or pure pipes to avoid repeated work.'],
        ['How does Angular protect against XSS in templates?', 'Interpolation escapes text and property bindings sanitise untrusted values for HTML, styles and URLs; bypassSecurityTrust* disables that and must be avoided.'],
        ['What is the safe navigation operator?', '?. stops evaluation and yields undefined when the left side is null or undefined, as in user?.address?.city.'],
      ],
    ),

    topic(
      'ngs-m5-attr-class-style-events',
      'Attribute, class, style and event bindings',
      [
        blk(`<h3>Binding HTML attributes, class and style</h3>
• Some attributes have no matching DOM property (aria-label, colspan, data-*). Bind them with <b>[attr.name]</b>. To toggle a CSS class use <b>class binding</b> (<code>[class.active]="isOn"</code>); to set an inline style use <b>style binding</b> (<code>[style.width.px]="w"</code>). Think of switches on a control panel that you flip from your data.`,
          `<button [attr.aria-label]="'Close ' + name" [attr.data-id]="id">X</button>
<td [attr.colspan]="cols">...</td>

<li [class.active]="selectedId === c.id">{{ c.title }}</li>   <!-- add class when true -->
<div [class]="isError ? 'alert alert-danger' : 'alert'">...</div>

<div [style.width.%]="progress" [style.color]="late ? 'red' : null"></div>   <!-- null removes the style -->`),
        blk(`<h3>Event binding, $event and common events</h3>
• Event binding uses parentheses. <b>$event</b> is the event object (for DOM events) or the emitted value (for component outputs). <b>Event handling</b> usually calls a component method.`,
          `<button (click)="onSave()">Save</button>
<input (input)="onType($event)">
<form (submit)="onSubmit($event)">...</form>

// onType(event: Event) {
//   const value = (event.target as HTMLInputElement).value;   // typed access to the input
// }`),
      ],
      [
        blk(`<h3>Keyboard, mouse and form events with modifiers</h3>
• <b>Keyboard events</b> (keydown, keyup) accept <b>key filters</b>: <code>(keyup.enter)</code>, <code>(keydown.escape)</code>, combinations such as <code>(keydown.control.s)</code>. <b>Mouse events</b>: click, dblclick, mouseenter, mouseleave, mousedown, mouseup, contextmenu. <b>Form events</b>: input (every keystroke), change (on commit), submit, focus, blur, reset.<br>
• <b>Event modifiers</b> in other frameworks (.prevent, .stop) do not exist in Angular: call <code>$event.preventDefault()</code> or <code>stopPropagation()</code> in the handler. Pseudo-events <code>(window:resize)</code>, <code>(document:keydown)</code> listen on global targets; Angular removes the listener when the component is destroyed.`,
          `<input #search (keyup.enter)="find(search.value)" (keydown.escape)="search.value = ''" placeholder="Press Enter">

<div (mouseenter)="hover = true" (mouseleave)="hover = false" (dblclick)="edit()">Hover me</div>

<a href="/x" (click)="open($event)">Open</a>
<form (submit)="save($event)" (reset)="clear()">...</form>

<div (window:resize)="onResize($event)"></div>
<div (document:keydown.control.s)="save($event)"></div>

// open(e: Event) { e.preventDefault(); this.router.navigate(['/x']); }`),
        blk(`<h3>Typed handlers and performance-friendly input</h3>`,
          `// typed event handling
onSelect(event: Event) {
  const select = event.target as HTMLSelectElement;
  this.level = select.value;
}
// debounce keystrokes with a signal-based approach, or RxJS in the reactive-forms module
<input (input)="query.set($any($event.target).value)">      <!-- $any() disables type checking for that expression -->`),
      ],
      [
        blk(`<h3>How bindings really work and pitfalls</h3>
• <b>Class and style bindings merge</b>: <code>[class]</code> and <code>[class.x]</code> from different sources (template, host bindings, directives) are combined with a defined precedence (template over directive over component host), so you rarely clash. Use <code>[class]="{active: isOn, 'is-new': isNew}"</code> with an object or array for several classes at once. The ngClass/ngStyle directives still work but native bindings are faster and preferred.<br>
• <b>[attr.x]</b> removes the attribute when the value is null or undefined; a boolean attribute bound with property binding works as expected (<code>[disabled]="flag"</code>), while <code>[attr.disabled]="false"</code> still leaves "false" string present, a common bug.<br>
• <b>Event plumbing</b>: handlers registered by Angular run inside the Angular zone and trigger change detection; high-frequency events (mousemove, scroll, resize) can cause many passes. Use <code>eventCoalescing</code>, debounce, or register outside the zone with <code>NgZone.runOutsideAngular</code>. <b>Passive</b> listeners are not configurable in templates; use <code>fromEvent</code> or Renderer2 when needed.<br>
• <b>Key names</b> in filters follow DOM <code>KeyboardEvent.key</code> lowercase (enter, escape, arrowdown, space), and modifiers (alt, control, meta, shift) are dot-separated in alphabetical order. IME composition (Asian languages) fires keyup.enter prematurely; for search boxes use (input) plus debounce.<br>
• Avoid <code>$any()</code> except where typing is truly impractical. Prefer handlers with typed parameters or reference variables (<code>(input)="onChange(box.value)"</code> with <code>#box</code>).<br>
• Do not bind a click on non-interactive elements (div); use button or add role, tabindex and key handlers for accessibility.`),
      ],
      [
        ['Attribute vs property binding?', 'Attributes are the initial HTML values; properties are the live DOM state. [prop] sets the property; [attr.x] sets an attribute for cases with no property (aria-*, colspan).'],
        ['How do you toggle a CSS class conditionally?', 'Use [class.name]="condition" or [class]="expr" (string, array or object); ngClass is the older equivalent.'],
        ['How do you handle the Enter key in an input?', '(keyup.enter)="handler()" or (keydown.enter) using the key filter syntax.'],
        ['What is $event?', 'In DOM event bindings, the native event object; for component outputs, the emitted value.'],
        ['How do you prevent default browser behaviour?', 'Call $event.preventDefault() in the handler; Angular has no .prevent modifier. (ngSubmit on a form already prevents the native submit.)'],
        ['How do you listen to window or document events?', 'Use global targets in the binding: (window:resize), (document:keydown), which Angular cleans up automatically.'],
      ],
    ),

    topic(
      'ngs-m5-control-flow',
      'Built-in control flow',
      [
        blk(`<h3>Conditional rendering with @if and @else</h3>
• <b>Conditional rendering</b> shows markup only when a condition is true. The built-in <b>@if</b> block (Angular 17+) replaces the old *ngIf. Add <b>@else if</b> and <b>@else</b> for other branches. It reads like normal code and needs no imports.`,
          `@if (user) {
  <p>Welcome, {{ user.name }}</p>
} @else if (loading) {
  <p>Loading...</p>
} @else {
  <p>Please sign in</p>
}

@if (courses$ | async; as list) {        <!-- alias the result -->
  <p>{{ list.length }} courses</p>
}`),
        blk(`<h3>List rendering with @for, track and @empty</h3>
• <b>List rendering</b> repeats markup for each item with <b>@for</b>. The <b>track</b> expression is required: it tells Angular how to recognise each item (use a unique id) so it can reuse DOM nodes when the list changes. <b>@empty</b> shows when the list is empty.`,
          `<ul>
  @for (c of courses; track c.id; let i = $index, last = $last) {
    <li [class.last]="last">{{ i + 1 }}. {{ c.title }}</li>
  } @empty {
    <li>No courses yet</li>
  }
</ul>`),
      ],
      [
        blk(`<h3>@switch and template variables</h3>
• <b>@switch</b> chooses one branch by value with <b>@case</b> and <b>@default</b> (no fall-through, no break needed). <b>Template variables</b> include the implicit @for variables <code>$index, $count, $first, $last, $even, $odd</code> and the <b>@let</b> declaration (Angular 18.1+, stable 19) to store an expression once.`,
          `@switch (status) {
  @case ('ACTIVE')  { <span class="green">Active</span> }
  @case ('BLOCKED') { <span class="red">Blocked</span> }
  @default          { <span>Unknown</span> }
}

@let total = price() * qty();               <!-- computed once, usable in this template -->
@let name = user()?.name ?? "Guest";
<p>{{ name }} owes {{ total | currency }}</p>`),
        blk(`<h3>Choosing track correctly</h3>
• <code>track item.id</code> is best for objects with ids; <code>track $index</code> is acceptable only for static lists; <code>track item</code> works for lists of primitives. Never track by a new object each time. Angular logs a warning (NG0955) for duplicate keys.`,
          `@for (u of users(); track u.id) { <app-user [user]="u" /> }          <!-- stable identity: DOM reused when reordered -->
@for (tag of tags; track tag) { <span>{{ tag }}</span> }            <!-- primitives -->`),
        blk(`<h3>Migrating from legacy structural directives</h3>
<table ${TABLE}>
<tr><th>Legacy (NgModule era)</th><th>Built-in control flow</th></tr>
<tr><td>*ngIf="x; else tpl"</td><td>@if (x) { } @else { }</td></tr>
<tr><td>*ngFor="let i of items; trackBy: fn"</td><td>@for (i of items; track i.id) { }</td></tr>
<tr><td>[ngSwitch] / *ngSwitchCase</td><td>@switch / @case</td></tr>
</table>
• Run the automatic migration: <code>ng generate @angular/core:control-flow</code>.`),
      ],
      [
        blk(`<h3>Internals, performance and gotchas</h3>
• Control flow is <b>compiler syntax</b>, not directives: it compiles into optimised template instructions, with no extra imports and a smaller bundle. In benchmarks the new @for is faster than *ngFor thanks to a better diffing algorithm, and <b>track is mandatory</b> because a wrong default (identity) caused performance bugs.<br>
• A good <b>track</b> keeps DOM, component instances and their local state when data refreshes from the server with new object instances. With <code>track $index</code>, inserting at the front re-binds every row; with a wrong key you may keep stale child state.<br>
• @for iterates any <code>Iterable</code> (arrays, Sets, Maps' entries via a helper), not plain objects; use the <code>keyvalue</code> pipe for objects. Large lists (thousands of rows) should use pagination or CDK virtual scroll, not just @for.<br>
• Block content creates its own scope: @let variables are visible in the same and nested blocks, not outside. @let is not reassignable and, unlike a signal, is just an alias evaluated each pass.<br>
• @if with <code>as</code> aliases also acts as a type guard in strict templates (the variable is narrowed to the truthy type), a main reason to prefer it over *ngIf for typing nullable data. Alias example: <code>@if (user(); as u)</code>.<br>
• <b>@defer</b> (also compiler control flow, covered in the performance module) lazily loads blocks; <b>@placeholder/@loading/@error</b> accompany it.<br>
• Version: control flow ships as developer preview in 17 and stable from 18; *ngIf, *ngFor and NgSwitch are officially deprecated from v20 and slated for eventual removal, but remain functional.`),
      ],
      [
        ['What replaces *ngIf in modern Angular?', 'The built-in @if block (Angular 17+) with optional @else if and @else branches; no import is needed.'],
        ['Why is track required in @for?', 'It lets Angular identify items so it reuses DOM and component instances on updates instead of re-creating the whole list; a missing key was a common performance bug with *ngFor.'],
        ['What should be used in track?', 'A stable unique identifier like item.id; $index only for static lists; the item itself for primitives.'],
        ['What does @empty do?', 'It renders its content when the iterated collection is empty.'],
        ['What is @let?', 'A template declaration (Angular 18.1+, stable in 19) that stores an expression result in a read-only variable for reuse in the same template.'],
        ['How do you migrate from *ngFor to @for?', 'Run ng generate @angular/core:control-flow, then ensure each loop has a proper track expression instead of trackBy.'],
      ],
    ),

    topic(
      'ngs-m5-fragments-typecheck',
      'Template fragments and type checking',
      [
        blk(`<h3>ng-template, ng-container and ngTemplateOutlet</h3>
• An <b>ng-template</b> is a blueprint that Angular does not draw by itself, like an unused stamp. It renders only when something instantiates it. An <b>ng-container</b> is an invisible wrapper that groups things without adding an element to the DOM. <b>ngTemplateOutlet</b> says "draw this template here".`,
          `<ng-template #emptyMsg>
  <p>No data available</p>
</ng-template>

@if (items.length) {
  <app-list [items]="items" />
} @else {
  <ng-container *ngTemplateOutlet="emptyMsg" />       <!-- render the fragment here -->
}

<ng-container>
  <h2>Title</h2><p>Body</p>      <!-- grouped without a wrapper div -->
</ng-container>`),
        blk(`<h3>Template fragments</h3>
• A <b>template fragment</b> is a chunk of markup you reuse within one component, defined once with ng-template (or an @let value) and rendered in several places. This avoids copy-paste when creating a whole component would be overkill.`),
      ],
      [
        blk(`<h3>Templates with context</h3>
• ngTemplateOutlet can pass a <b>context</b> object; inside the template read it with <code>let-</code> variables. This is how you build reusable list or table pieces where the parent supplies the row layout.`,
          `<ng-template #userRow let-user let-i="index">
  <tr><td>{{ i + 1 }}</td><td>{{ user.name }}</td></tr>
</ng-template>

<table>
  @for (u of users; track u.id; let n = $index) {
    <ng-container *ngTemplateOutlet="userRow; context: { $implicit: u, index: n }" />
  }
</table>

// component imports: [NgTemplateOutlet]`),
        blk(`<h3>Passing templates into components</h3>
• A child can accept a template from its parent using content projection with a <b>contentChild</b> of type TemplateRef, then render it with its own data. This keeps data logic in the child and layout decisions in the parent.`,
          `// list.component.ts
@Component({
  selector: 'app-list',
  imports: [NgTemplateOutlet],
  template: \`
    @for (item of items(); track item.id) {
      <ng-container *ngTemplateOutlet="rowTpl() ?? defaultRow; context: { $implicit: item }" />
    }
    <ng-template #defaultRow let-item>{{ item.name }}</ng-template>\`,
})
export class ListComponent {
  items = input<Item[]>([]);
  rowTpl = contentChild<TemplateRef<unknown>>('row');
}
// usage:
// <app-list [items]="data"><ng-template #row let-item><b>{{ item.name }}</b></ng-template></app-list>`),
        blk(`<h3>Template type checking</h3>
• The Angular compiler can <b>type-check templates</b> like TypeScript checks code: wrong property names, wrong input types or calling a missing method become build errors. Enable it with <code>"strictTemplates": true</code> in tsconfig angularCompilerOptions (default in new projects).`,
          `// product.component.ts
export class ProductComponent {
  price = 10;
}
// template: {{ prise }}                      -> error NG9: Property 'prise' does not exist
// template: <app-rating [value]="'high'" />  -> error: string not assignable to number
// template: @if (user) { {{ user.name }} }   -> OK: narrowed to non-null inside the block`),
      ],
      [
        blk(`<h3>Details and pitfalls</h3>
• <b>ng-container</b> is also how you place a structural directive or control flow without a wrapper element, and the host for <code>*ngComponentOutlet</code>. With built-in control flow you need it less often (the old *ngIf plus *ngFor on one element problem is gone: nest blocks instead).<br>
• <b>ng-template vs ng-content</b>: ng-content projects already-created parent content; ng-template defers creation until you instantiate it, can be instantiated multiple times and accepts context. Templates declared in one place and rendered elsewhere keep the <b>injector and scope of where they were declared</b>.<br>
• Context typing: add a static guard so strict templates know the shape: <code>static ngTemplateContextGuard(dir: MyDirective, ctx: unknown): ctx is MyContext { return true; }</code> in the directive that owns the template, or the template's let- variables are <code>any</code>. This is how NgFor/ngIf typed their variables in the legacy form.<br>
• <b>Strict template checking levels</b>: basic mode checks only top-level expressions; fullTemplateTypeCheck checks embedded views; strictTemplates adds input and output typing, DOM event typing, safe-navigation inference and pipe argument checks. Sub-options (strictInputTypes, strictNullInputTypes, strictDomEventTypes, strictAttributeTypes and others) can be relaxed individually when migrating. Use <code>$any()</code> as a deliberate, searchable escape hatch.<br>
• Diagnostic errors appear in the editor through the Angular Language Service, in ng build and ng serve, and in CI (ng build). Treat them as failing builds.<br>
• Fragments rendered with ngTemplateOutlet are created and destroyed with their outlet view, so state in the fragment is lost if the outlet is toggled by @if.`),
      ],
      [
        ['ng-template vs ng-container?', 'ng-template is a non-rendered blueprint that you instantiate later (with outlets or structural directives); ng-container is an actual grouping node that renders its children but adds no DOM element.'],
        ['What does ngTemplateOutlet do?', 'It stamps an ng-template into the DOM at that location and can provide a context object read with let- variables.'],
        ['How can a parent customise part of a child\'s layout?', 'It passes an ng-template which the child captures with contentChild and renders using ngTemplateOutlet with its own context.'],
        ['What is strictTemplates?', 'A compiler option that type-checks template expressions, inputs, outputs and events strictly, turning binding mistakes into build errors.'],
        ['What is $any() for?', 'It casts an expression to any inside a template to bypass type checking when typing is impractical; use sparingly.'],
        ['Why use ng-container instead of a div?', 'It groups or hosts directives without adding an extra element that could break CSS layout or semantics.'],
      ],
    ),
  ],
};

const module6: SubTopic = {
  id: 'ngs-mod-6',
  name: 'Module 6 · Directives',
  topics: [
    overview(6, 'Directives', [
      ['What are directives?', 'Classes that add behaviour to elements in a template.', 'Built-in directives'],
      ['Directive types', 'Component, attribute and structural directives.', 'Built-in directives'],
      ['Attribute directives', 'Change the look or behaviour of an existing element.', 'Built-in directives'],
      ['Structural directives', 'Add or remove elements (the * syntax).', 'Built-in directives'],
      ['Component directives', 'A component is a directive with a template.', 'Built-in directives'],
      ['ngClass', 'Add classes from an object, array or string.', 'Built-in directives'],
      ['ngStyle', 'Set several inline styles from an object.', 'Built-in directives'],
      ['ngModel', 'Two-way binding for form controls.', 'Built-in directives'],
      ['ngTemplateOutlet', 'Render an ng-template with context.', 'Built-in directives'],
      ['ngComponentOutlet', 'Render a component chosen at runtime.', 'Built-in directives'],
      ['Legacy *ngIf', 'Old conditional directive; replaced by @if.', 'Built-in directives'],
      ['Legacy *ngFor', 'Old loop directive; replaced by @for.', 'Built-in directives'],
      ['Legacy ngSwitch', 'Old switch directives; replaced by @switch.', 'Built-in directives'],
      ['Built-in control flow vs legacy structural directives', 'Compare @if/@for/@switch to *ngIf/*ngFor/ngSwitch.', 'Built-in directives'],
      ['Creating custom attribute directives', 'Write your own @Directive that decorates elements.', 'Custom attribute directives'],
      ['Directive selectors', 'How a directive is matched: [attr], element, class, :not().', 'Custom attribute directives'],
      ['Directive inputs and outputs', 'Configure a directive and let it emit events.', 'Custom attribute directives'],
      ['Host elements', 'The element a directive or component is attached to.', 'Custom attribute directives'],
      ['Host bindings', 'Bind host properties, classes and attributes from the directive.', 'Custom attribute directives'],
      ['Host listeners', 'Listen to host element events from the directive.', 'Custom attribute directives'],
      ['Creating custom structural directives', 'Directives that create views from a TemplateRef.', 'Structural directives, composition and injection'],
      ['Directive composition API', 'Combine behaviours by composing directives.', 'Structural directives, composition and injection'],
      ['Host directives', 'hostDirectives metadata applies directives to a component.', 'Structural directives, composition and injection'],
      ['Directive injection', 'Directives use DI (inject) to get the element, services and other directives.', 'Structural directives, composition and injection'],
    ]),

    topic(
      'ngs-m6-builtin',
      'Built-in directives',
      [
        blk(`<h3>What are directives?</h3>
• A <b>directive</b> is a class that teaches an HTML element new tricks, like a sticker that says "turn red on hover". Angular has three <b>directive types</b>:<br>
• <b>Component directives</b>: a directive with a template (every component is one).<br>
• <b>Attribute directives</b>: change appearance or behaviour of an existing element (ngClass, ngStyle, ngModel).<br>
• <b>Structural directives</b>: add or remove elements from the DOM (the legacy *ngIf, *ngFor; today replaced by @if and @for control flow).`,
          `<p [ngClass]="{ highlight: important, muted: !active }">Attribute directive</p>
<div [ngStyle]="{ 'font-size.px': size, color: textColor }">Styled with ngStyle</div>
<input [(ngModel)]="email">
<app-card>A component is also a directive</app-card>`),
        blk(`<h3>Legacy structural directives</h3>
• *ngIf, *ngFor and ngSwitch are the <b>legacy</b> way to branch and loop. You still meet them in most existing projects; new code uses @if, @for and @switch. The star (*) is shorthand for wrapping the element in an ng-template.`,
          `<!-- LEGACY (needs NgIf, NgFor in imports or CommonModule) -->
<p *ngIf="loggedIn; else guest">Welcome back</p>
<ng-template #guest><p>Please log in</p></ng-template>

<li *ngFor="let c of courses; let i = index; trackBy: trackById">{{ i }} {{ c.title }}</li>

<div [ngSwitch]="role">
  <span *ngSwitchCase="'admin'">Admin</span>
  <span *ngSwitchDefault>User</span>
</div>`),
      ],
      [
        blk(`<h3>ngClass, ngStyle, ngModel</h3>
• <b>ngClass</b> accepts a string, array or object of class names (<code>{ active: isOn }</code>). <b>ngStyle</b> accepts an object of style names and values. For one or two classes or styles the native <b>[class.x]</b> and <b>[style.x]</b> are simpler and faster. <b>ngModel</b> (from FormsModule) two-way binds a form control and tracks its state (valid, touched).`,
          `import { NgClass, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-demo',
  imports: [NgClass, NgStyle, FormsModule],
  template: \`
    <p [ngClass]="classes()">Status</p>
    <p [ngStyle]="{ backgroundColor: color, padding: pad + "px" }">Box</p>
    <input name="age" [(ngModel)]="age" #m="ngModel" required>
    @if (m.invalid && m.touched) { <small>Age is required</small> }\`,
})
export class DemoComponent {
  color = 'gold'; pad = 8; age = '';
  classes = () => ['badge', this.age ? 'ok' : 'warn'];
}`),
        blk(`<h3>ngTemplateOutlet and ngComponentOutlet</h3>
• <b>ngTemplateOutlet</b> renders a TemplateRef (with context); <b>ngComponentOutlet</b> renders a component class chosen at runtime, optionally with inputs and a custom injector.`,
          `<ng-container *ngTemplateOutlet="tpl; context: { $implicit: user }" />
<ng-container *ngComponentOutlet="widget; inputs: { title: 'Sales' }" />
// class: widget: Type<unknown> = SalesWidgetComponent;`),
        blk(`<h3>Built-in control flow vs legacy structural directives</h3>
<table ${TABLE}>
<tr><th>Topic</th><th>@if / @for / @switch</th><th>*ngIf / *ngFor / ngSwitch</th></tr>
<tr><td>Import needed</td><td>No</td><td>Yes (NgIf, NgFor...)</td></tr>
<tr><td>Performance</td><td>Faster, built into the compiler</td><td>Runtime directives</td></tr>
<tr><td>Loop identity</td><td>track required</td><td>trackBy optional</td></tr>
<tr><td>Empty state</td><td>@empty block</td><td>else template</td></tr>
<tr><td>Readability</td><td>Reads like code</td><td>Microsyntax</td></tr>
<tr><td>Status</td><td>Recommended (v17+), stable v18</td><td>Legacy, deprecated since v20</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Internals and tips</h3>
• Structural directives work with <b>TemplateRef</b> and <b>ViewContainerRef</b>: the star syntax <code>*ngIf="x"</code> is desugared by the compiler into <code>&lt;ng-template [ngIf]="x"&gt;</code>. The directive decides when to <code>createEmbeddedView</code> or clear it. The built-in control flow skips directives completely and compiles to template instructions, which is why it needs no imports and is faster and more type-friendly.<br>
• <b>ngClass/ngStyle performance</b>: they diff objects on every change detection; binding <code>[class]</code>/<code>[style]</code> directly is cheaper. ngStyle with unit keys (<code>'width.px'</code>) is supported. Prefer CSS classes over many inline styles.<br>
• <b>ngTemplateOutlet</b> context gets <code>$implicit</code> as the default let- value; an <b>injector</b> option can be passed too. <b>ngComponentOutlet</b> supports <code>inputs</code> (16.2+), <code>injector</code>, <code>content</code> (projectable nodes) and <code>environmentInjector</code>; inputs set through it are applied with setInput so signal inputs work.<br>
• <b>ngModel</b> inside a form needs a name attribute or [ngModelOptions]="{standalone: true}"; it is part of template-driven forms (see the forms module). The directive in <code>FormsModule</code> is not tree-shaken away if you import the whole module; standalone imports can list only <code>NgModel</code>.<br>
• Migrate with <code>ng generate @angular/core:control-flow</code>. *ngFor's trackBy functions should become inline track expressions.<br>
• All directives need to be imported in standalone components; forgetting NgClass gives "Can't bind to 'ngClass' since it isn't a known property".`),
      ],
      [
        ['What are the three kinds of directives?', 'Components (with a template), attribute directives (alter an element\'s behaviour or look) and structural directives (add or remove DOM).'],
        ['ngClass vs [class.x]?', 'ngClass handles many classes from an object, array or string; [class.x] binds one class and is lighter. Prefer native class bindings when possible.'],
        ['What does the asterisk in *ngIf mean?', 'Shorthand: Angular wraps the element in an ng-template and passes the expression to the directive.'],
        ['Why is @for preferred over *ngFor?', 'It is built into the compiler (no imports), faster, has an @empty block, and requires track for correct DOM reuse.'],
        ['What is ngComponentOutlet used for?', 'Rendering a component whose class is chosen at runtime, with optional inputs and injector.'],
        ['Are *ngIf and *ngFor removed?', 'No, they still work but are deprecated in recent versions (v20) in favour of control flow; migrate with the provided schematic.'],
      ],
    ),

    topic(
      'ngs-m6-custom-attribute',
      'Custom attribute directives',
      [
        blk(`<h3>Creating custom attribute directives</h3>
• Make your own directive when you want to reuse behaviour on many elements without a template. Example: a <b>highlight</b> directive that colours any element on hover. Create it with <code>ng generate directive highlight</code>.<br>
• The <b>host element</b> is the element carrying the directive (here the &lt;p&gt;). The <b>selector</b> in square brackets <code>[appHighlight]</code> means "match elements with this attribute".`,
          `// highlight.directive.ts
import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',          // attribute selector: <p appHighlight>
})
export class HighlightDirective {
  private el = inject(ElementRef<HTMLElement>);          // the host element
  color = input('yellow', { alias: 'appHighlight' });    // directive input with alias

  @HostListener('mouseenter') on() { this.el.nativeElement.style.backgroundColor = this.color(); }
  @HostListener('mouseleave') off() { this.el.nativeElement.style.backgroundColor = ''; }
}

// usage
// <p appHighlight>Yellow on hover</p>
// <p appHighlight="lightblue">Blue on hover</p>
// the component needs imports: [HighlightDirective]`),
      ],
      [
        blk(`<h3>Host bindings and host listeners the modern way</h3>
• <b>Host bindings</b> set properties, classes, styles and attributes of the host element from the directive; <b>host listeners</b> handle host events. The recommended place is the <code>host</code> metadata property (the @HostBinding and @HostListener decorators still work).`,
          `@Directive({
  selector: '[appButtonState]',
  host: {
    '[class.busy]': 'busy()',                 // host binding
    '[attr.aria-busy]': 'busy()',
    '[style.cursor]': 'busy() ? "wait" : "pointer"',
    '(click)': 'onClick($event)',            // host listener
    '(keydown.escape)': 'cancel()',
  },
})
export class ButtonStateDirective {
  busy = input(false, { alias: 'appButtonState' });
  clicked = output<void>();                    // directive output
  onClick(e: Event) { if (this.busy()) e.preventDefault(); else this.clicked.emit(); }
  cancel() { /* ... */ }
}
// <button [appButtonState]="saving" (clicked)="save()">Save</button>`),
        blk(`<h3>Directive selectors and inputs/outputs</h3>
• Selector forms: <code>[attr]</code>, <code>[attr=value]</code>, <code>element</code>, <code>.class</code>, <code>input[type=text]</code>, a comma list <code>[a], [b]</code> and exclusion <code>:not(.skip)</code>. Directives cannot have element selectors that clash with components on the same tag. Use a unique prefix (app-, or your library's).<br>
• <b>Directive inputs</b> configure behaviour; use an alias equal to the selector (as above) to allow <code>[appHighlight]="color"</code> as a single attribute. <b>Outputs</b> notify the host component. Use the same input()/output() functions as components.`,
          `@Directive({ selector: 'input[appTrim], textarea[appTrim]' })      // only on inputs and textareas
export class TrimDirective {
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  @HostListener('blur') trim() { this.el.nativeElement.value = this.el.nativeElement.value.trim(); }
}`),
      ],
      [
        blk(`<h3>Best practices and pitfalls</h3>
• <b>Do not use ElementRef.nativeElement for styling if you can bind</b>: prefer host bindings (declarative, SSR-safe). If you must touch the DOM, use <code>Renderer2</code> or guard with <code>afterNextRender</code>, because on the server there is no real DOM. Direct innerHTML writes bypass sanitisation and invite XSS.<br>
• <b>Host listeners</b> are registered once and removed automatically on destroy. Global targets are available: <code>'(window:scroll)': 'onScroll()'</code>. High-frequency events trigger change detection; consider running outside the zone.<br>
• <b>Specificity</b>: host class bindings merge with template bindings; host styles lose against template bindings on the same element. Host element attributes written by a directive are visible to CSS (<code>[aria-busy=true]</code>), a nice hook for styling.<br>
• Directives are standalone by default (v19); for older code add <code>standalone: true</code>. An unused import of a directive produces a compiler warning.<br>
• Keep directives <b>single-purpose</b> and prefix names; document the selector and inputs. For behaviour shared by several components consider the composition API (next lesson) instead of inheritance.<br>
• Testing: create a small host component with TestBed, apply the directive, dispatch events with <code>triggerEventHandler</code> or <code>dispatchEvent</code>, and assert on the DOM.`),
      ],
      [
        ['What is an attribute directive?', 'A directive attached to an existing element via an attribute selector that changes its appearance or behaviour without altering the DOM structure.'],
        ['What is the host element?', 'The element in the template on which the directive (or component) is applied.'],
        ['@HostBinding vs @HostListener?', '@HostBinding binds a property/class/style of the host to a directive field; @HostListener subscribes to events on the host (or window/document). The host metadata property supports both.'],
        ['How can a directive be configured?', 'With inputs (input()/@Input), optionally aliased to the selector name, and it can notify with outputs.'],
        ['How do you get the host element in a directive?', 'Inject ElementRef (inject(ElementRef)) and use nativeElement, or better use host bindings or Renderer2.'],
        ['Which selectors can a directive use?', 'Attribute, element, class and combined selectors, comma lists and :not(), e.g. input[appTrim].'],
      ],
    ),

    topic(
      'ngs-m6-structural-composition',
      'Structural directives, composition and injection',
      [
        blk(`<h3>Creating custom structural directives</h3>
• A <b>custom structural directive</b> decides whether to show a piece of template. It receives a <b>TemplateRef</b> (the blueprint) and a <b>ViewContainerRef</b> (the place to draw). Example: <code>*appHasRole="'ADMIN'"</code> shows content only for admins (a UI convenience; the backend still enforces permissions).`,
          `// has-role.directive.ts
import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from './auth.service';

@Directive({ selector: '[appHasRole]' })
export class HasRoleDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthService);
  appHasRole = input.required<string>();                 // the *appHasRole="'ADMIN'" value

  constructor() {
    effect(() => {
      this.vcr.clear();                                   // remove previous view
      if (this.auth.roles().includes(this.appHasRole())) this.vcr.createEmbeddedView(this.tpl);
    });
  }
}

// usage (star syntax):  <button *appHasRole="'ADMIN'">Delete</button>`),
      ],
      [
        blk(`<h3>Directive injection and host directives</h3>
• <b>Directive injection</b>: directives use DI like any class: <code>inject(ElementRef)</code>, services, and other directives on the same element (<code>inject(NgControl, { optional: true })</code>) or on a parent element (<code>inject(ParentDirective, { host: true })</code>).<br>
• The <b>directive composition API</b> (Angular 15+) lets you build behaviour from small directives. With <b>host directives</b> a component or directive lists directives in <code>hostDirectives</code>; they are applied to its host automatically, and you choose which inputs and outputs to expose. This replaces most use of inheritance for sharing behaviour.`,
          `// disabled-state.directive.ts : reusable small behaviour
@Directive({
  selector: '[appDisableable]',
  host: { '[class.disabled]': 'disabled()', '[attr.aria-disabled]': 'disabled()' },
})
export class DisableableDirective { disabled = input(false); }

// tooltip.directive.ts
@Directive({ selector: '[appTooltip]' })
export class TooltipDirective { appTooltip = input(''); }

// composing them on a component
@Component({
  selector: 'app-fancy-button',
  hostDirectives: [
    { directive: DisableableDirective, inputs: ['disabled'] },        // expose only 'disabled'
    { directive: TooltipDirective, inputs: ['appTooltip: tip'] },     // expose as 'tip'
  ],
  template: '<ng-content />',
})
export class FancyButtonComponent {}
// <app-fancy-button [disabled]="busy" tip="Saves the form">Save</app-fancy-button>`),
        blk(`<h3>A structural directive with template context</h3>`,
          `@Directive({ selector: '[appRepeat]' })
export class RepeatDirective {
  private tpl = inject(TemplateRef<{ $implicit: number }>);
  private vcr = inject(ViewContainerRef);
  @Input() set appRepeat(times: number) {
    this.vcr.clear();
    for (let i = 0; i < times; i++) this.vcr.createEmbeddedView(this.tpl, { $implicit: i });
  }
}
// <li *appRepeat="3; let n">Row {{ n }}</li>`),
      ],
      [
        blk(`<h3>Deep dive</h3>
• <b>Desugaring</b>: <code>*appHasRole="'ADMIN'"</code> becomes <code>&lt;ng-template [appHasRole]="'ADMIN'"&gt;...&lt;/ng-template&gt;</code>. The microsyntax (<code>*appX="expr; let item; as alias"</code>) maps to inputs prefixed with the selector (appXAs etc.). Add a static <code>ngTemplateContextGuard</code> and <code>ngTemplateGuard_appHasRole</code> for strict template typing and type narrowing.<br>
• <b>Host directive rules</b>: host directives must be standalone, run before the host component (their constructors and inputs initialise first), can themselves have host directives, and their outputs/inputs are hidden unless exposed. You cannot host-compose a directive twice. Lifecycle hooks on the host directive run alongside.<br>
• <b>Injection context</b>: inject() works only in constructors and field initialisers (the injection context). A directive can read the closest <code>NgControl</code> or form container; using <code>{ self: true }</code> or <code>{ host: true }</code> restricts the lookup. For ControlValueAccessor wiring a host directive is a clean extension point.<br>
• <b>Security</b>: UI role directives are cosmetic. Anything hidden by a directive remains in the JavaScript bundle and can be called from the console; the Spring Boot API must authorise every request.<br>
• <b>Performance</b>: creating and clearing views on every effect run is expensive; only recreate when the condition actually flips (compare previous state). Using <code>effect()</code> inside a directive requires the injection context and writes to the view container synchronously during change detection of the host; for simple cases an @if on a computed signal is better.<br>
• <b>Comparison</b>: mixins and inheritance share code but tightly couple; host directives compose at runtime, keep each unit testable and let consumers choose the exposed API.`),
      ],
      [
        ['How does a structural directive work?', 'It injects TemplateRef and ViewContainerRef and creates or clears an embedded view from the template depending on its inputs; the * syntax wraps the element in an ng-template.'],
        ['What are host directives?', 'Directives listed in a component or directive\'s hostDirectives metadata; Angular applies them to the host element, optionally exposing selected inputs and outputs.'],
        ['What is the directive composition API good for?', 'Reusing behaviour (disabled state, tooltips, focus handling) through composition instead of inheritance or duplicated code.'],
        ['How can a directive get another directive on the same element?', 'inject(OtherDirective) (use optional: true when not guaranteed) in the injection context.'],
        ['Is hiding a button with *appHasRole secure?', 'No. It is only a UI convenience; the server must enforce authorisation because client code can be bypassed.'],
        ['What is ngTemplateContextGuard?', 'A static method on a directive that tells the strict template checker the type of its template context so let- variables are typed.'],
      ],
    ),
  ],
};

const module7: SubTopic = {
  id: 'ngs-mod-7',
  name: 'Module 7 · Pipes',
  topics: [
    overview(7, 'Pipes', [
      ['What are pipes?', 'Template functions that transform a value for display using |.', 'Formatting pipes'],
      ['Built-in pipes', 'Ready-made pipes shipped in @angular/common.', 'Formatting pipes'],
      ['DatePipe', 'Formats dates: date:"dd/MM/yyyy".', 'Formatting pipes'],
      ['UpperCasePipe', 'Converts text to upper case.', 'Formatting pipes'],
      ['LowerCasePipe', 'Converts text to lower case.', 'Formatting pipes'],
      ['TitleCasePipe', 'Capitalises each word.', 'Formatting pipes'],
      ['CurrencyPipe', 'Formats money with symbol and locale.', 'Formatting pipes'],
      ['DecimalPipe', 'Formats numbers: number:"1.2-2".', 'Formatting pipes'],
      ['PercentPipe', 'Formats a fraction as a percentage.', 'Formatting pipes'],
      ['JsonPipe', 'Prints an object as JSON, handy for debugging.', 'Data pipes, async and chaining'],
      ['SlicePipe', 'Takes part of an array or string.', 'Data pipes, async and chaining'],
      ['KeyValuePipe', 'Turns an object or Map into key/value entries.', 'Data pipes, async and chaining'],
      ['AsyncPipe', 'Subscribes to an Observable or Promise and unwraps its value.', 'Data pipes, async and chaining'],
      ['Chaining pipes', 'Applying several pipes in sequence.', 'Data pipes, async and chaining'],
      ['Pipe parameters', 'Arguments after a colon: value | pipe:arg1:arg2.', 'Data pipes, async and chaining'],
      ['Pure vs impure pipes', 'Pure pipes re-run only when inputs change; impure on every check.', 'Custom pipes'],
      ['Creating custom pipes', 'A class with @Pipe and a transform method.', 'Custom pipes'],
      ['Parameterized custom pipes', 'Custom pipes that take extra arguments.', 'Custom pipes'],
      ['Pipe performance', 'Pure pipes cache results; avoid heavy or impure pipes.', 'Custom pipes'],
      ['Best practices for custom pipes', 'Pure, small, typed, tested, with clear names.', 'Custom pipes'],
    ]),

    topic(
      'ngs-m7-formatting',
      'Formatting pipes',
      [
        blk(`<h3>What are pipes? Built-in pipes</h3>
• A <b>pipe</b> takes a value, changes how it looks, and returns the result, like a coffee filter between the raw data and the screen. It never changes the original value. You write it with the pipe character: <code>{{ value | pipeName }}</code>.<br>
• Angular ships <b>built-in pipes</b> in <code>@angular/common</code>: DatePipe, UpperCasePipe, LowerCasePipe, TitleCasePipe, CurrencyPipe, DecimalPipe, PercentPipe, JsonPipe, SlicePipe, KeyValuePipe, AsyncPipe and more. In a standalone component list the ones you use in <code>imports</code>.`,
          `import { Component } from '@angular/core';
import { DatePipe, UpperCasePipe, LowerCasePipe, TitleCasePipe, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-formats',
  imports: [DatePipe, UpperCasePipe, LowerCasePipe, TitleCasePipe, CurrencyPipe, DecimalPipe, PercentPipe],
  template: \`
    <p>{{ name | uppercase }}</p>               <!-- ASHA KUMAR -->
    <p>{{ name | lowercase }}</p>               <!-- asha kumar -->
    <p>{{ "angular course" | titlecase }}</p>   <!-- Angular Course -->
    <p>{{ today | date }}</p>                   <!-- Oct 20, 2026 -->
    <p>{{ today | date:"dd/MM/yyyy HH:mm" }}</p>
    <p>{{ price | currency:"INR" }}</p>         <!-- ₹1,234.50 -->
    <p>{{ pi | number:"1.2-2" }}</p>            <!-- 3.14 -->
    <p>{{ ratio | percent }}</p>                <!-- 85% -->\`,
})
export class FormatsComponent {
  name = 'Asha Kumar'; today = new Date(); price = 1234.5; pi = 3.14159; ratio = 0.85;
}`),
      ],
      [
        blk(`<h3>DatePipe, CurrencyPipe, DecimalPipe, PercentPipe in detail</h3>
<table ${TABLE}>
<tr><th>Pipe</th><th>Signature</th><th>Notes</th></tr>
<tr><td>date</td><td>date:format:timezone:locale</td><td>Presets: short, medium, long, fullDate, shortTime. Accepts Date, ISO string, ms number</td></tr>
<tr><td>currency</td><td>currency:code:display:digitsInfo:locale</td><td>display: symbol, code, symbol-narrow; digitsInfo like 1.0-0</td></tr>
<tr><td>number</td><td>number:"minInt.minFrac-maxFrac"</td><td>Rounds half away from zero; uses locale separators</td></tr>
<tr><td>percent</td><td>percent:digitsInfo</td><td>Multiplies by 100: 0.256 gives 26%</td></tr>
<tr><td>uppercase / lowercase / titlecase</td><td>no arguments</td><td>Strings only; null returns null</td></tr>
</table>`,
          `<p>{{ order.createdAt | date:"fullDate" }}</p>                  <!-- Tuesday, October 20, 2026 -->
<p>{{ order.createdAt | date:"shortTime":"+0530" }}</p>        <!-- explicit timezone -->
<p>{{ order.total | currency:"USD":"symbol":"1.0-0" }}</p>     <!-- $1,235 -->
<p>{{ order.total | currency:"EUR":"code" }}</p>                <!-- EUR1,234.50 -->
<p>{{ 1234567.891 | number:"1.0-1" }}</p>                       <!-- 1,234,567.9 -->
<p>{{ 0.256 | percent:"1.1-1" }}</p>                            <!-- 25.6% -->`),
        blk(`<h3>Locale and default currency</h3>
• Pipes format using the application <b>locale</b> (default en-US). To use another locale, register its data once and provide LOCALE_ID. The default currency code can be set with DEFAULT_CURRENCY_CODE. See the internationalisation module for full details.`,
          `import { registerLocaleData } from '@angular/common';
import localeHi from '@angular/common/locales/hi';
import { LOCALE_ID, DEFAULT_CURRENCY_CODE } from '@angular/core';

registerLocaleData(localeHi);
// app.config.ts providers:
//   { provide: LOCALE_ID, useValue: 'hi' },
//   { provide: DEFAULT_CURRENCY_CODE, useValue: 'INR' }`),
      ],
      [
        blk(`<h3>Pitfalls and good practice</h3>
• <b>Dates</b>: JSON delivers dates as strings; DatePipe parses ISO-8601 strings, but a string without a time zone is interpreted in local time, a classic off-by-one-day source. Without a timezone argument the pipe uses the browser's zone. Prefer sending ISO instants (UTC with Z) from Spring Boot (<code>Instant</code>/<code>OffsetDateTime</code>) and formatting at the edge.<br>
• Format strings are case-sensitive: <code>yyyy</code> year, <code>MM</code> month (mm is minutes), <code>dd</code> day of month, <code>HH</code> 24-hour (hh is 12-hour), <code>Y</code> is week-based year (a bug source around new year). Invalid input throws NG02100 (InvalidPipeArgument) which breaks rendering, so guard nulls with <code>@if</code> or <code>?? ''</code> or validate upstream.<br>
• <b>Money</b>: floating-point numbers are not exact. Keep amounts as integer minor units or as strings/decimals from the backend (BigDecimal serialised as string) and only format for display. CurrencyPipe does not convert currencies; it only formats.<br>
• <b>number pipe</b> uses Intl-like rules from the locale data bundled by Angular, not <code>Intl.NumberFormat</code>; for exotic needs (compact notation) format in a service or custom pipe using Intl.<br>
• Pipes in templates are tree-shakable standalone classes; importing <code>CommonModule</code> pulls them all in and is discouraged in new code.<br>
• Pipes take any expression as an argument, including component fields, but arguments are re-evaluated on each check; keep them primitive for pure-pipe caching to work.`),
      ],
      [
        ['What is a pipe in Angular?', 'A function-like template construct used with | that transforms a value for display without modifying the underlying data.'],
        ['How do you format a date as 20/10/2026?', 'Use the DatePipe: {{ value | date:"dd/MM/yyyy" }}; remember MM is month and mm is minutes.'],
        ['Does CurrencyPipe convert currencies?', 'No. It only formats a number as money for a given currency code and locale; conversion must be done in code or by the backend.'],
        ['How do you change the locale used by pipes?', 'Register the locale data with registerLocaleData and provide LOCALE_ID, or pass a locale argument to the pipe.'],
        ['Why might a date appear one day off?', 'Date-only strings or missing time zones are parsed in local time; send ISO instants with offset or format with an explicit timezone.'],
        ['Where do you import built-in pipes in standalone components?', 'In the component\'s imports array (DatePipe, CurrencyPipe...), or all at once via CommonModule, which is discouraged in new code.'],
      ],
    ),

    topic(
      'ngs-m7-data-async',
      'Data pipes, async and chaining',
      [
        blk(`<h3>JsonPipe, SlicePipe, KeyValuePipe</h3>
• <b>JsonPipe</b> prints an object as formatted JSON: the quickest debugging tool in a template. <b>SlicePipe</b> returns a part of an array or string (like substring/slice). <b>KeyValuePipe</b> turns an object or Map into a list of { key, value } so you can loop over it.`,
          `<pre>{{ user | json }}</pre>                          <!-- debug: prints the object -->
<p>{{ title | slice:0:20 }}...</p>                    <!-- first 20 characters -->

@for (c of courses | slice:0:3; track c.id) {          <!-- first 3 items -->
  <p>{{ c.title }}</p>
}

@for (entry of scores | keyvalue; track entry.key) {   <!-- scores = { maths: 90, art: 75 } -->
  <p>{{ entry.key }}: {{ entry.value }}</p>
}`),
        blk(`<h3>AsyncPipe, chaining and parameters</h3>
• <b>AsyncPipe</b> subscribes to an Observable (or Promise) for you, shows the latest value, and unsubscribes automatically when the component is destroyed: no manual subscribe, no memory leaks. <b>Chaining pipes</b> applies them left to right. <b>Pipe parameters</b> follow colons.`,
          `@Component({
  selector: 'app-news',
  imports: [AsyncPipe, UpperCasePipe, SlicePipe],
  template: \`
    @if (headline$ | async; as h) { <h2>{{ h | uppercase }}</h2> }          <!-- async, then uppercase -->
    <p>{{ (headline$ | async) ?? "loading" | slice:0:10 | uppercase }}</p>   <!-- chain of pipes -->\`,
})
export class NewsComponent {
  headline$ = inject(HttpClient).get<string>('/api/headline');
}`),
      ],
      [
        blk(`<h3>Working with the async pipe properly</h3>
• One subscription per <code>| async</code>. If the template uses the same stream twice, either alias it once with <code>@if (data$ | async; as data)</code> or use <code>@let</code>, otherwise HTTP observables fire several requests.<br>
• AsyncPipe also works with Promises; it returns <code>null</code> until the first emission, so type it as <code>T | null</code>. With signals you no longer need it: bind the signal directly or use <code>toSignal(obs$)</code>.`,
          `@if (courses$ | async; as courses) {
  @for (c of courses; track c.id) { <app-course [course]="c" /> } @empty { <p>No courses</p> }
} @else {
  <p>Loading...</p>
}

@let user = user$ | async;                      <!-- one subscription stored in a variable (Angular 18.1+) -->
<p>{{ user?.name }}</p> <p>{{ user?.email }}</p>

// signal alternative
// courses = toSignal(this.http.get<Course[]>('/api/courses'), { initialValue: [] });`),
        blk(`<h3>Pipe parameters and chaining rules</h3>
• Parameters are separated with colons and can be literals, fields or expressions: <code>value | date:format:tz</code>. Pipe precedence is lower than the ternary operator, so wrap in parentheses: <code>{{ (cond ? a : b) | uppercase }}</code>. Chaining order matters: <code>{{ amount | currency | uppercase }}</code> works because currency returns a string.`,
          `{{ today | date:"EEEE" | uppercase }}                    <!-- TUESDAY -->
{{ (isAdmin ? "admin" : "user") | titlecase }}            <!-- parentheses required -->
{{ items | slice:start:end }}                              <!-- parameters from fields -->`),
      ],
      [
        blk(`<h3>Details worth knowing</h3>
• <b>AsyncPipe internals</b>: it is an impure pipe that stores the latest value and calls <code>markForCheck()</code> when a new value arrives, which is why it works with OnPush. It handles resubscribing when the source reference changes; do not create a new Observable in the template (<code>obs$ = this.getData()</code> as a method call re-subscribes every check). Create streams once as fields.<br>
• <b>Errors</b>: if the observable errors, AsyncPipe rethrows into Angular's ErrorHandler; handle errors upstream with <code>catchError</code> returning a fallback or an error state object.<br>
• <b>KeyValuePipe</b> sorts entries by key by default (a stable compare); pass a comparator function to preserve insertion order: <code>obj | keyvalue: originalOrder</code>. It is an impure pipe that diffs the object internally and returns a new array only when entries change. <b>SlicePipe</b> is pure and returns a new array when input or arguments change; a mutated array (push) will not refresh it, so use immutable updates.<br>
• <b>JsonPipe</b> is impure and runs JSON.stringify every check: use only for debugging, never in production lists.<br>
• Pipes execute only in templates. In code call the class directly: <code>new DatePipe('en-US').transform(d, 'short')</code> or inject it by listing it in providers.<br>
• With signals, prefer <code>computed()</code> for derived values and use pipes for presentation formatting only.`),
      ],
      [
        ['What does the async pipe do?', 'It subscribes to an Observable or Promise, renders the latest value, triggers change detection when new values arrive and unsubscribes automatically on destroy.'],
        ['How do you avoid multiple subscriptions with async?', 'Subscribe once and alias the value: @if (obs$ | async; as value) or @let value = obs$ | async, or convert with toSignal.'],
        ['How do you loop over an object\'s properties?', 'Use the keyvalue pipe: @for (e of obj | keyvalue; track e.key) and read e.key and e.value.'],
        ['In what order are chained pipes applied?', 'Left to right: the output of each pipe is the input of the next, e.g. value | slice:0:5 | uppercase.'],
        ['What is the json pipe used for?', 'Debug printing of objects; it stringifies on every check, so it should not be used in production views.'],
        ['Why do you need parentheses around a ternary before a pipe?', 'The pipe operator has lower precedence than the conditional operator, so without parentheses the pipe would apply only to the last branch.'],
      ],
    ),

    topic(
      'ngs-m7-custom-pipes',
      'Custom pipes',
      [
        blk(`<h3>Creating custom pipes</h3>
• When no built-in pipe fits, write your own: a small class with the <b>@Pipe</b> decorator and a <b>transform</b> method. Example: show "5 minutes ago" or shorten text with "...". Create one with <code>ng generate pipe shared/truncate</code>.`,
          `// truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })                  // name used in templates
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, max = 20, suffix = '...'): string {   // parameters with defaults
    if (!value) return '';
    return value.length > max ? value.slice(0, max) + suffix : value;
  }
}

// usage in a standalone component: imports: [TruncatePipe]
// {{ description | truncate }}  {{ description | truncate:50:"~" }}`),
      ],
      [
        blk(`<h3>Parameterized custom pipes and pure vs impure</h3>
• Extra arguments in the template map to extra parameters of transform, in order. A <b>pure pipe</b> (default) runs only when its input value or arguments change by reference/primitive value; Angular caches the result. An <b>impure pipe</b> (<code>pure: false</code>) runs on every change detection pass; use it only when the output depends on something outside the arguments (such as a service or mutated array), and keep it extremely cheap.`,
          `// time-ago.pipe.ts : parameterized pure pipe
@Pipe({ name: 'timeAgo' })
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number, now: number = Date.now()): string {
    const seconds = Math.floor((now - new Date(value).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' h ago';
    return Math.floor(seconds / 86400) + ' d ago';
  }
}

// filter pipe on arrays : pure, so the array must be replaced (immutable) to refresh
@Pipe({ name: 'filterBy' })
export class FilterByPipe implements PipeTransform {
  transform<T>(items: T[], key: keyof T, term: string): T[] {
    const t = term.toLowerCase();
    return items.filter(i => String(i[key]).toLowerCase().includes(t));
  }
}
// @for (c of courses | filterBy:"title":query; track c.id) { ... }

// impure example (avoid): @Pipe({ name: 'filterImpure', pure: false })`),
        blk(`<h3>Injecting services and using a pipe in code</h3>`,
          `@Pipe({ name: 'userName' })
export class UserNamePipe implements PipeTransform {
  private users = inject(UserStore);                       // pipes can use DI
  transform(id: number): string { return this.users.nameOf(id); }
}
// in a component class:
const pipe = inject(TruncatePipe);   // works if the pipe is provided: providers: [TruncatePipe]
pipe.transform('long text', 5);`),
      ],
      [
        blk(`<h3>Pipe performance and best practices for custom pipes</h3>
• <b>Pure pipes are memoised per call site</b>: each place the pipe is used keeps the last arguments and result. That makes a pure pipe an ideal cheap place for derived display data instead of a template method call.<br>
• <b>Pipe performance</b> pitfalls: filtering or sorting arrays in an impure pipe runs the work on every check, thousands of times per second on large lists. Instead filter in a <code>computed()</code> signal or in the service, and keep pipes for formatting. Pure pipes cannot see mutation of an array/object argument, so update state immutably (<code>list = [...list, x]</code>).<br>
• Best practices: <b>pure by default</b>, no side effects, no HTTP calls, no random or time reads without an explicit parameter (as in timeAgo, where you pass a ticking now to refresh), return a stable type, handle null and undefined, give a clear lower camel-case name, keep pipes in a shared folder, write a unit test calling transform directly, and prefer a <code>computed()</code> or a function for logic that is not about presentation.<br>
• <b>Typing</b>: use generics and overload-like unions so strict templates catch misuse, and declare nullable inputs (<code>string | null | undefined</code>) so it composes with the async pipe.<br>
• Standalone pipes are tree-shakable (<code>standalone: true</code> before v19, implicit later). Do not mark a pipe providedIn root; list it in providers if you need it in a class.<br>
• Do not use pipes to sort or filter for large tables; combine with pagination, @for track and virtual scrolling.`),
      ],
      [
        ['How do you create a custom pipe?', 'Decorate a class with @Pipe({ name: "x" }), implement PipeTransform.transform(value, ...args) and import it in the components that use it.'],
        ['Pure vs impure pipe?', 'Pure pipes re-run only when their inputs change (cached); impure pipes (pure: false) run every change detection cycle and can hurt performance.'],
        ['Why does a pure filter pipe not update after array.push()?', 'The array reference is unchanged, so the pure pipe sees identical inputs; replace the array immutably or do the filtering in a computed signal.'],
        ['When is an impure pipe justified?', 'When the result depends on mutable external state that cannot be passed as an argument, such as AsyncPipe; keep the work minimal.'],
        ['Pipe or method call in a template?', 'A pure pipe is cached and only re-runs on input changes; a method call is evaluated on every check, so the pipe (or computed signal) is better.'],
        ['How do you test a pipe?', 'Instantiate it (or use TestBed for DI) and call transform with various inputs, including null and edge cases.'],
      ],
    ),
  ],
};

const module8: SubTopic = {
  id: 'ngs-mod-8',
  name: 'Module 8 · Services and Dependency Injection',
  topics: [
    overview(8, 'Services and Dependency Injection', [
      ['What is a service?', 'A class holding reusable logic or data, shared via DI.', 'Services and DI fundamentals'],
      ['Service architecture', 'Components stay thin; services hold business logic and data access.', 'Services and DI fundamentals'],
      ['Creating services using CLI', 'ng generate service name.', 'Services and DI fundamentals'],
      ['@Injectable()', 'Marks a class as injectable and configures its provider.', 'Services and DI fundamentals'],
      ['Dependency Injection fundamentals', 'Classes ask for dependencies; Angular creates and supplies them.', 'Services and DI fundamentals'],
      ['Dependency injection tokens', 'The key used to look up a dependency (class or InjectionToken).', 'Services and DI fundamentals'],
      ['Constructor-based injection', 'Dependencies as constructor parameters.', 'Services and DI fundamentals'],
      ['inject() function', 'Modern way to inject in fields and factories.', 'Services and DI fundamentals'],
      ['Provider configuration', 'Tell the injector how to create a token.', 'Providers and the injector hierarchy'],
      ['providedIn: \'root\'', 'App-wide singleton, tree-shakable.', 'Providers and the injector hierarchy'],
      ['Component-level providers', 'A new instance per component.', 'Providers and the injector hierarchy'],
      ['Route-level providers', 'Services scoped to a route subtree.', 'Providers and the injector hierarchy'],
      ['Environment injectors', 'Injectors for app, routes and createEnvironmentInjector.', 'Providers and the injector hierarchy'],
      ['Hierarchical Dependency Injection', 'Lookup walks from element injectors up to root and platform.', 'Providers and the injector hierarchy'],
      ['InjectionToken', 'A token for non-class values such as config.', 'Provider types and tokens'],
      ['Value providers', 'useValue supplies a ready value.', 'Provider types and tokens'],
      ['Class providers', 'useClass maps a token to a class.', 'Provider types and tokens'],
      ['Factory providers', 'useFactory builds a value with code.', 'Provider types and tokens'],
      ['Existing providers', 'useExisting aliases one token to another.', 'Provider types and tokens'],
      ['Multi providers', 'multi: true collects several values under one token.', 'Provider types and tokens'],
      ['Optional dependencies', 'optional: true returns null when missing.', 'Resolution modifiers'],
      ['Self and SkipSelf', 'Limit where the lookup starts or looks.', 'Resolution modifiers'],
      ['Host and Optional decorators', '@Host, @Optional, @Self, @SkipSelf parameter decorators.', 'Resolution modifiers'],
      ['Shared services', 'One service instance used by many components.', 'Service patterns, communication and testing'],
      ['Service communication between components', 'Sibling components exchange data through a service.', 'Service patterns, communication and testing'],
      ['Singleton service patterns', 'Root singleton, lazy singleton, avoiding duplicates.', 'Service patterns, communication and testing'],
      ['Service testing', 'Unit test services with TestBed or plain instances.', 'Service patterns, communication and testing'],
      ['Dependency Injection best practices', 'Small services, interfaces via tokens, inject(), no service locators.', 'Service patterns, communication and testing'],
    ]),

    topic(
      'ngs-m8-di-basics',
      'Services and DI fundamentals',
      [
        blk(`<h3>What is a service? Service architecture</h3>
• A <b>service</b> is an ordinary TypeScript class that holds logic or data that more than one component needs: calling APIs, storing the logged-in user, calculating prices. Think of it as a shared kitchen: components are dining tables; they should not each cook the food.<br>
• <b>Service architecture</b>: keep <b>components thin</b> (display and user events) and put business logic and data access in services. It is exactly the Spring layering of controller, service and repository, applied to the browser.<br>
• Generate with <code>ng generate service courses/course</code> (short <code>ng g s</code>), which creates course.service.ts with @Injectable.`,
          `// course.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })        // one shared instance for the whole app
export class CourseService {
  private courses = ['Java', 'Angular', 'Spring Boot'];
  getAll(): string[] { return [...this.courses]; }
  add(title: string): void { this.courses.push(title); }
}`),
        blk(`<h3>Dependency Injection fundamentals</h3>
• <b>Dependency Injection (DI)</b> means a class does not create the objects it needs with <code>new</code>; it <b>asks</b> for them and the framework supplies them. The restaurant analogy: you do not grow vegetables, you order and the waiter brings them. Spring developers know this as the IoC container with @Autowired.<br>
• <b>@Injectable()</b> marks a class that can be injected (and itself receive dependencies). The <b>token</b> is the key you ask for; usually the class itself.`,
          `// course-list.component.ts
import { Component, inject } from '@angular/core';
import { CourseService } from './course.service';

@Component({
  selector: 'app-course-list',
  template: '@for (c of courses; track c) { <li>{{ c }}</li> }',
})
export class CourseListComponent {
  private service = inject(CourseService);     // ask Angular for the instance
  courses = this.service.getAll();
}`),
      ],
      [
        blk(`<h3>Constructor-based injection vs inject()</h3>
• <b>Constructor-based injection</b> lists dependencies as constructor parameters (the style known from Java and older Angular). The <b>inject() function</b> (Angular 14+) does the same in field initialisers and is the modern recommendation: shorter, works in functional guards/interceptors/resolvers, and avoids long constructors and super() problems in inheritance.`,
          `// constructor injection (still fully supported)
@Component({ selector: 'app-a', template: '' })
export class AComponent {
  constructor(private http: HttpClient, private service: CourseService) {}
}

// inject() : same result
@Component({ selector: 'app-b', template: '' })
export class BComponent {
  private http = inject(HttpClient);
  private service = inject(CourseService);
}

// inject() only works in an injection context:
//   constructor, field initialisers, provider factories, functional guards, runInInjectionContext()`),
        blk(`<h3>A realistic service layer</h3>`,
          `// course.service.ts : talks to Spring Boot
@Injectable({ providedIn: 'root' })
export class CourseApi {
  private http = inject(HttpClient);
  private base = '/api/courses';

  list()                 { return this.http.get<Course[]>(this.base); }
  get(id: number)        { return this.http.get<Course>(this.base + '/' + id); }
  create(c: NewCourse)   { return this.http.post<Course>(this.base, c); }
  remove(id: number)     { return this.http.delete<void>(this.base + '/' + id); }
}

// component stays thin
export class CoursesComponent {
  courses = toSignal(inject(CourseApi).list(), { initialValue: [] });
}`),
        blk(`<h3>Dependency injection tokens</h3>
• Every dependency is looked up by a <b>token</b>. For a class the class itself is the token. For things that are not classes (a config object, a string, an interface, which does not exist at runtime) use an <b>InjectionToken</b> (see the provider types lesson).`),
      ],
      [
        blk(`<h3>How the injector works</h3>
• The <b>injector</b> is a map from token to provider plus a cache of created instances. When you inject a token, Angular finds the provider, runs its factory once, stores the instance and returns it on later requests (singleton per injector). Instances are created lazily on first request.<br>
• <b>@Injectable</b> metadata is required so the compiler emits the parameter metadata for constructor injection; with <code>inject()</code> the decorator is still needed if you use <code>providedIn</code>, and is conventional for every service.<br>
• <b>Injection context</b>: calling inject() outside it throws NG0203. Wrap code with <code>runInInjectionContext(injector, () =&gt; ...)</code> when you must call it later (for example in a callback), or capture dependencies up front.<br>
• <b>Circular dependencies</b> (A needs B needs A) throw NG0200; break the cycle by extracting a third service, injecting lazily through the <code>Injector</code> (<code>injector.get(Token)</code> when needed) or restructuring responsibilities.<br>
• <b>Decorator injection with inheritance</b>: constructor injection forces subclasses to repeat all parent parameters; inject() fields avoid that, a major reason to prefer it.<br>
• Compare with Spring: @Service ≈ @Injectable, @Autowired ≈ inject(), @Bean method ≈ useFactory provider, @Qualifier ≈ separate InjectionToken, @Scope("prototype") ≈ providing in a component. Angular injectors are hierarchical and the same class can have different instances at different levels.`),
      ],
      [
        ['What is a service in Angular?', 'A class (usually @Injectable) that encapsulates reusable logic or data access and is provided to components and other services through dependency injection.'],
        ['What is dependency injection and why use it?', 'A class receives its collaborators from the framework instead of constructing them, which decouples code, enables sharing instances and makes testing with mocks easy.'],
        ['inject() vs constructor injection?', 'Both ask the injector for a token. inject() works in field initialisers and functions (guards, interceptors), reads shorter, and simplifies inheritance; constructor injection is the classic form and still supported.'],
        ['What does @Injectable do?', 'Marks a class as participating in DI and can set providedIn so the class registers itself with an injector.'],
        ['Where can inject() be called?', 'Only in an injection context: constructors, field initialisers, provider factories, functional guards/resolvers/interceptors, or inside runInInjectionContext.'],
        ['How do Angular services relate to Spring beans?', 'Both are container-managed singletons by default; @Injectable with providedIn root corresponds to a singleton @Service bean, and inject() to @Autowired.'],
      ],
    ),

    topic(
      'ngs-m8-providers-hierarchy',
      'Providers and the injector hierarchy',
      [
        blk(`<h3>Provider configuration and providedIn: 'root'</h3>
• A <b>provider</b> tells the injector how to create a token. The shortest provider is the class itself. With <code>@Injectable({ providedIn: 'root' })</code> the service registers in the <b>root injector</b>: one instance for the whole app, created only if somebody uses it (so unused services are <b>tree-shaken</b> out of the bundle). This is the default choice for most services.`,
          `@Injectable({ providedIn: 'root' })              // app-wide singleton, tree-shakable
export class AuthService { loggedIn = signal(false); }

// alternative : register in application config
export const appConfig: ApplicationConfig = {
  providers: [
    AuthService,                                   // shorthand for { provide: AuthService, useClass: AuthService }
    provideRouter(routes),
  ],
};`),
        blk(`<h3>Component-level providers</h3>
• Put a service in a component's <code>providers</code> array and each instance of that component gets its <b>own</b> service instance (and so do its child components). Use it for per-component state, like a form wizard's draft.`,
          `@Injectable()                                      // no providedIn: must be provided somewhere
export class WizardState { step = signal(1); }

@Component({
  selector: 'app-wizard',
  providers: [WizardState],                         // new instance for each <app-wizard>
  template: '<app-step /> <app-summary />',         // children share this instance
})
export class WizardComponent { state = inject(WizardState); }`),
      ],
      [
        blk(`<h3>Route-level providers and environment injectors</h3>
• <b>Route-level providers</b>: the <code>providers</code> property of a route creates an <b>environment injector</b> for that route and its children. The service is created when the route is first activated and lives as long as the route's injector, ideal for feature state in lazy-loaded areas.<br>
• <b>Environment injectors</b> hold services of modules/app/routes. There are: the <b>platform</b> injector, the <b>root (application)</b> injector, and child environment injectors for lazy routes. <code>createEnvironmentInjector()</code> can create one by hand.`,
          `// app.routes.ts
export const routes: Routes = [
  {
    path: 'admin',
    providers: [AdminSettingsService, { provide: PAGE_SIZE, useValue: 50 }],   // route-level providers
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
];

// manual environment injector
const child = createEnvironmentInjector([{ provide: PAGE_SIZE, useValue: 10 }], inject(EnvironmentInjector));
const size = child.get(PAGE_SIZE);`),
        blk(`<h3>Hierarchical Dependency Injection</h3>
• Injectors form a tree that mirrors your app. A request for a token starts at the <b>element injector</b> of the requesting component, walks up the parents (directives, components, host elements), then continues through the <b>environment injectors</b> (route injectors, root), and finally the platform. The first provider found wins; if none, a NullInjectorError (NG0201) is thrown.`,
          `Resolution order for inject(Token) in a component:
  1. the component's own providers / viewProviders
  2. parent component / directive element injectors (walking up the DOM tree)
  3. route environment injector(s) (lazy route providers)
  4. root environment injector (providedIn: 'root', app config)
  5. platform injector
  -> not found: NullInjectorError (unless optional: true)`),
        blk(`<h3>providers vs viewProviders</h3>
• <code>providers</code> on a component are visible to its view and to projected content; <code>viewProviders</code> are visible only to the component's own view (not to content children projected via ng-content). Use viewProviders to keep a service private from projected content.`),
      ],
      [
        blk(`<h3>Choosing the right scope</h3>
<table ${TABLE}>
<tr><th>Scope</th><th>Use for</th><th>Lifetime</th></tr>
<tr><td>providedIn: 'root'</td><td>Auth, API clients, global state</td><td>Whole app</td></tr>
<tr><td>Route providers</td><td>Feature-area state, per-feature config</td><td>While the route injector lives (lazy chunk, normally for the session)</td></tr>
<tr><td>Component providers</td><td>Per-instance state (wizard, table, dialog)</td><td>Component instance</td></tr>
<tr><td>Dynamic environment injector</td><td>Plugin or micro-frontend isolation</td><td>Until destroyed</td></tr>
</table>`),
        blk(`<h3>Pitfalls and internals</h3>
• <b>Duplicate singletons</b>: providing a root service again in a component or lazy route silently creates a second instance, so state is not shared and bugs appear (the classic "my service has two copies"). Provide a stateful service in exactly one place.<br>
• <b>Lifetime of route injectors</b>: a lazy route injector is created once and kept for the lifetime of the app (it is not destroyed on navigation away), so route-level services behave like singletons per route tree, not per visit. Component-level providers are destroyed with the component, and their <code>ngOnDestroy</code> is called (services can implement OnDestroy).<br>
• <b>Tree shaking</b>: only <code>providedIn</code> and <code>InjectionToken</code> factories are tree-shakable; services listed in app providers always ship. <code>providedIn: 'platform'</code> shares across multiple Angular apps on one page; <code>'any'</code> (deprecated) creates one per lazy module.<br>
• NgModule world (legacy): module <code>providers</code> arrays, <code>forRoot()</code> / <code>forChild()</code> patterns to avoid duplicates, and eager modules share the root injector while lazy modules get a child injector. Standalone code uses <code>provideXxx()</code> functions instead, which return <code>EnvironmentProviders</code> (only allowed in environment contexts, not component providers).<br>
• The root injector is created at bootstrap, so root services that do work in constructors run lazily on first inject; use <code>provideAppInitializer()</code> (v19+; older <code>APP_INITIALIZER</code>) to run startup code such as loading configuration before the app renders.`),
      ],
      [
        ['What does providedIn: \'root\' mean?', 'The service is registered in the root injector as a single shared instance for the app and is tree-shakable if never used.'],
        ['How do you get a new service instance per component?', 'List the service in the component\'s providers array; each component instance and its children get a separate instance.'],
        ['What are route-level providers?', 'Providers declared in a route config that create an environment injector for that route and its children, handy for lazy-loaded feature services.'],
        ['Explain hierarchical DI.', 'Injectors form a tree; a token is resolved from the requesting element upward through parent element injectors, route/root environment injectors and the platform, using the first matching provider.'],
        ['providers vs viewProviders?', 'providers are visible to a component\'s view and projected content; viewProviders only to its own view.'],
        ['How can a service end up with two instances?', 'By providing it in more than one injector (for example root plus a component or lazy route); each injector creates its own instance.'],
      ],
    ),

    topic(
      'ngs-m8-provider-types',
      'Provider types and tokens',
      [
        blk(`<h3>InjectionToken and value providers</h3>
• Interfaces and primitives do not exist at runtime, so Angular cannot use them as keys. An <b>InjectionToken</b> is a unique key object you create for them. A <b>value provider</b> (<code>useValue</code>) supplies a ready-made value, like a config object or a constant.`,
          `// app.config.ts
import { InjectionToken } from '@angular/core';

export interface AppConfig { apiUrl: string; pageSize: number }
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');       // token

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: { apiUrl: 'http://localhost:8080/api', pageSize: 20 } },   // value provider
  ],
};

// usage
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private cfg = inject(APP_CONFIG);
  url(path: string) { return this.cfg.apiUrl + path; }
}`),
      ],
      [
        blk(`<h3>Class, factory and existing providers</h3>
• <b>Class provider</b> (<code>useClass</code>): "when someone asks for X, create Y": swap implementations (real vs mock, like a Spring profile). <b>Factory provider</b> (<code>useFactory</code>): run code to build the value, with <code>deps</code> or <code>inject()</code> inside. <b>Existing provider</b> (<code>useExisting</code>): make one token an alias of another so both return the same instance.`,
          `// Class provider: depend on an abstraction, choose an implementation
export abstract class Logger { abstract log(msg: string): void; }
@Injectable() export class ConsoleLogger extends Logger { log(m: string) { console.log(m); } }
@Injectable() export class NoopLogger extends Logger { log() {} }

providers: [{ provide: Logger, useClass: environment.production ? NoopLogger : ConsoleLogger }]

// Factory provider
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',                                 // tree-shakable token with a default factory
  factory: () => (inject(PLATFORM_ID) === 'browser' ? '/api' : 'http://backend:8080/api'),
});

providers: [{
  provide: PaymentGateway,
  useFactory: () => inject(APP_CONFIG).sandbox ? new FakeGateway() : new StripeGateway(inject(HttpClient)),
}]

// Existing provider: alias
providers: [FancyLogger, { provide: Logger, useExisting: FancyLogger }]   // one instance, two tokens`),
        blk(`<h3>Multi providers</h3>
• With <b>multi: true</b> several providers contribute to one token, and injecting it gives an <b>array</b>. Angular itself uses this for HTTP_INTERCEPTORS and APP_INITIALIZER. It is a plugin mechanism.`,
          `export const VALIDATOR_RULE = new InjectionToken<Rule[]>('VALIDATOR_RULE');

providers: [
  { provide: VALIDATOR_RULE, useValue: notEmptyRule, multi: true },
  { provide: VALIDATOR_RULE, useValue: maxLengthRule, multi: true },
]
const rules = inject(VALIDATOR_RULE);        // Rule[] : [notEmptyRule, maxLengthRule]`),
      ],
      [
        blk(`<h3>Design notes and pitfalls</h3>
<table ${TABLE}>
<tr><th>Provider</th><th>Key</th><th>Spring analogy</th></tr>
<tr><td>useClass</td><td>class to instantiate</td><td>@Component bean / @Primary alternative</td></tr>
<tr><td>useValue</td><td>existing value</td><td>@Value / constant bean</td></tr>
<tr><td>useFactory</td><td>function returning value</td><td>@Bean method</td></tr>
<tr><td>useExisting</td><td>another token</td><td>Alias / bean reference</td></tr>
<tr><td>multi: true</td><td>collection</td><td>Injecting a List of beans</td></tr>
</table>
• <b>Abstract classes as tokens</b>: since interfaces vanish, an abstract class is the idiomatic way to inject by abstraction (as with Logger). An InjectionToken typed with an interface is the alternative and can hold function values.<br>
• <b>Tree-shakable tokens</b>: give an InjectionToken a <code>providedIn: 'root'</code> and a <code>factory</code>, so it has a default and costs nothing when unused; override it in tests or per environment with a normal provider.<br>
• <b>Multi providers and ordering</b>: the array order equals provider registration order, which for interceptors defines execution order; mixing multi and non-multi providers for the same token is an error. Provider arrays in lower injectors replace, not merge with, higher ones.<br>
• <b>useFactory with deps</b> (legacy form: <code>deps: [Http, APP_CONFIG]</code>) is equivalent to calling inject() in the factory; prefer inject() style. Factories run in an injection context.<br>
• <b>useValue is shared</b>: mutating the object affects every consumer; freeze it (<code>Object.freeze</code>) or expose it read-only.<br>
• Do not read <code>environment</code> values deep inside services; provide them as a token so tests can override. For secrets: nothing in a browser bundle is secret.<br>
• The older <code>@Inject(TOKEN)</code> parameter decorator is the constructor-injection counterpart of <code>inject(TOKEN)</code>.`),
      ],
      [
        ['Why do we need InjectionToken?', 'Interfaces, strings and plain objects are not valid runtime keys; an InjectionToken is a unique runtime key (with type information) for injecting such values.'],
        ['useClass vs useExisting?', 'useClass creates a new instance of the given class for the token; useExisting aliases the token to another token so both resolve to the same instance.'],
        ['When do you use useFactory?', 'When the value needs logic or other dependencies to create, such as choosing an implementation by environment.'],
        ['What does multi: true do?', 'Lets several providers register under one token; injection returns an array of all values, used for plugins and interceptors.'],
        ['How do you inject by interface?', 'Define an abstract class or InjectionToken as the key and provide an implementation with useClass or useValue.'],
        ['How would you swap a real service for a mock in tests?', 'Provide { provide: RealService, useClass: MockService } or useValue with a stub in TestBed.configureTestingModule.'],
      ],
    ),

    topic(
      'ngs-m8-modifiers',
      'Resolution modifiers',
      [
        blk(`<h3>Optional dependencies</h3>
• Normally if a token has no provider Angular throws an error. Mark the dependency <b>optional</b> and you get <code>null</code> instead, like a guest who may not show up. Useful for plugins or components that work with or without a parent.`,
          `@Component({ selector: 'app-widget', template: '' })
export class WidgetComponent {
  private logger = inject(Logger, { optional: true });   // Logger | null
  run() { this.logger?.log('running'); }                 // safe if no provider exists
}`),
        blk(`<h3>Self, SkipSelf and Host</h3>
• <b>self</b>: look only in the current element's own injector. <b>skipSelf</b>: start looking in the parent, ignoring the current one. <b>host</b>: stop the search at the host element of the current component (do not go beyond). Combine with optional.`,
          `// modern: options object of inject()
const parentForm = inject(ControlContainer, { optional: true, host: true, skipSelf: true });
const own        = inject(MyService, { self: true });          // must be provided on this element
const fromParent = inject(MyService, { skipSelf: true });      // ignore my own provider, use the ancestor's`),
      ],
      [
        blk(`<h3>Host and Optional decorators (constructor parameter decorators)</h3>
• Before inject() options existed the same ideas were parameter decorators: <b>@Optional()</b>, <b>@Self()</b>, <b>@SkipSelf()</b>, <b>@Host()</b>. They are fully supported in constructor injection and common in older libraries.`,
          `import { Component, Host, Optional, Self, SkipSelf } from '@angular/core';

@Component({ selector: 'app-child', providers: [Counter], template: '' })
export class ChildComponent {
  constructor(
    @Self() private mine: Counter,                         // only this component's providers
    @SkipSelf() @Optional() private parent: Counter | null,   // ancestor's Counter if any
    @Optional() @Host() private form: ControlContainer | null,
  ) {}
}`),
        blk(`<h3>A practical use: nested tree nodes</h3>
• A tree node that registers itself with its parent node: skip itself to find the parent, optional so the root node works.`,
          `@Component({
  selector: 'app-node',
  providers: [{ provide: TreeNode, useExisting: NodeComponent }],     // expose this component as TreeNode
  template: '<ng-content />',
})
export class NodeComponent extends TreeNode {
  parent = inject(TreeNode, { skipSelf: true, optional: true });      // parent node or null at the root
  depth = (this.parent?.depth ?? -1) + 1;
}`),
      ],
      [
        blk(`<h3>Rules, pitfalls and migration</h3>
• Modifier combinations: <code>{ self: true, optional: true }</code> is the common safe check for "is it provided right here". <code>self</code> and <code>skipSelf</code> cannot be combined. <code>host</code> bounds the search at the host element, important for content/view providers: it lets a child directive find the component whose template it sits in without leaking into unrelated ancestors.<br>
• Optional only handles <b>missing providers</b>; errors thrown while constructing an existing provider still propagate.<br>
• The legacy decorators and the options object are equivalent; <code>ng generate @angular/core:inject</code> migrates constructor injection to inject(), preserving modifiers (v19+). The inject() flags enum (<code>InjectFlags</code>) is deprecated in favour of the options object.<br>
• Where it matters: Angular's own <code>ControlContainer</code>, <code>NgControl</code> and <code>MatFormField</code> lookups use these modifiers; custom form controls and compound components (tabs, accordions, menus) are the usual consumers.<br>
• Prefer explicit inputs or a dedicated token to reaching for the parent via DI when the relationship is a feature of your API; DI-based parent lookup couples child and parent implicitly.<br>
• Self-injection loops: providing a token with useExisting that points to itself yields a cyclic dependency error.`),
      ],
      [
        ['What does @Optional() / { optional: true } do?', 'Returns null instead of throwing when no provider is found for the token.'],
        ['@Self vs @SkipSelf?', '@Self restricts lookup to the current element injector; @SkipSelf skips the current injector and starts at its parent.'],
        ['What does @Host do?', 'Limits the lookup at the host element of the current component, so providers beyond the component boundary are not used.'],
        ['Which is the modern syntax for these modifiers?', 'The options object of inject(): inject(Token, { optional, self, skipSelf, host }).'],
        ['Give a use case for skipSelf.', 'A recursive component or tree node that needs its parent instance of the same type, skipping its own provider.'],
      ],
    ),

    topic(
      'ngs-m8-patterns-testing',
      'Service patterns, communication and testing',
      [
        blk(`<h3>Shared services and communication between components</h3>
• A <b>shared service</b> is one instance injected into many components, so they can share data without being parent and child, like a notice board in the hall. Use a <b>signal</b> inside the service to hold state; every component that reads it updates automatically.`,
          `// cart.service.ts : shared state with signals
@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();                         // expose read-only
  readonly count = computed(() => this._items().length);             // derived state
  add(item: CartItem) { this._items.update(list => [...list, item]); }
  clear() { this._items.set([]); }
}

// product.component.ts (writer)
cart = inject(CartService);   // template: <button (click)="cart.add(p)">Add</button>

// header.component.ts (reader, a sibling far away in the tree)
cart = inject(CartService);   // template: Cart ({{ cart.count() }})`),
        blk(`<h3>Singleton service patterns</h3>
• <b>Singleton</b>: <code>providedIn: 'root'</code> gives one instance per application: the standard way. Never write your own static getInstance(); the injector already guarantees the singleton, and tests can replace it. Keep singletons <b>stateless where possible</b> or hold only well-owned state.`),
      ],
      [
        blk(`<h3>Communication patterns compared</h3>
<table ${TABLE}>
<tr><th>Mechanism</th><th>When</th></tr>
<tr><td>Signals in a service</td><td>Default for shared state (modern)</td></tr>
<tr><td>BehaviorSubject / Observable in a service</td><td>Streams, existing RxJS code, async sources</td></tr>
<tr><td>Subject / event bus</td><td>Fire-and-forget events (toast, logout notification)</td></tr>
<tr><td>Inputs and outputs</td><td>Direct parent and child</td></tr>
<tr><td>Router (params, state)</td><td>Passing identifiers between pages</td></tr>
<tr><td>NgRx / signal store</td><td>Large, complex app-wide state</td></tr>
</table>`,
          `// event notifications with a Subject (RxJS, see the RxJS module)
@Injectable({ providedIn: 'root' })
export class ToastService {
  private messages = new Subject<string>();
  readonly messages$ = this.messages.asObservable();       // hide next() from consumers
  show(msg: string) { this.messages.next(msg); }
}
// ToastHost: toastService.messages$.pipe(takeUntilDestroyed()).subscribe(...)`),
        blk(`<h3>Service testing</h3>
• Services are easy to test because their dependencies are injected. For a service without dependencies just create it with <code>new</code>. With dependencies use <b>TestBed</b>, provide fakes, and for HTTP use <code>provideHttpClientTesting()</code> and <code>HttpTestingController</code>.`,
          `import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('CartService', () => {
  it('counts items', () => {
    const cart = TestBed.inject(CartService);               // root service from the testing injector
    cart.add({ id: 1, name: 'Pen' } as CartItem);
    expect(cart.count()).toBe(1);
  });
});

describe('CourseApi', () => {
  let api: CourseApi; let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(),
                  { provide: APP_CONFIG, useValue: { apiUrl: '/x', pageSize: 5 } }],   // fake config
    });
    api = TestBed.inject(CourseApi);
    http = TestBed.inject(HttpTestingController);
  });
  it('lists courses', () => {
    api.list().subscribe(c => expect(c.length).toBe(1));
    http.expectOne('/api/courses').flush([{ id: 1, title: 'A' }]);   // fake the response
    http.verify();
  });
});`),
      ],
      [
        blk(`<h3>Dependency Injection best practices</h3>
• <b>Single responsibility</b>: one service, one purpose (CourseApi for HTTP, CartState for state, ToastService for messages). Avoid "god" services.<br>
• <b>Expose less</b>: keep writable signals/subjects private and publish read-only views (<code>asReadonly()</code>, <code>asObservable()</code>); mutate only through methods so invariants hold.<br>
• <b>Depend on abstractions</b>: tokens and abstract classes for things that vary (logging, storage, payment); concrete classes for the rest. Do not over-abstract single implementations.<br>
• <b>Prefer inject()</b> in new code, put dependencies in readonly fields, and avoid the service-locator anti-pattern (injecting Injector everywhere and calling get() dynamically) except for plugin scenarios.<br>
• <b>Services must clean up</b>: implement OnDestroy for component-scoped services, and use <code>DestroyRef</code> and <code>takeUntilDestroyed()</code> for subscriptions in root services' long-lived streams only when really needed.<br>
• <b>No UI in services</b>: no direct DOM access; if you need the DOM use Renderer2 or the DOCUMENT token (inject(DOCUMENT)), which also keeps SSR safe. Browser globals (window, localStorage) should be wrapped in a service behind a token so tests and SSR can substitute them.<br>
• <b>Testing</b>: configure only what the unit needs, fake HTTP with HttpTestingController, override providers with useValue, and test signals by reading them after calling methods (computed values update synchronously). Use <code>TestBed.runInInjectionContext</code> to test functions that call inject().<br>
• <b>Singleton pitfalls</b>: state in root services lives for the whole session; in SSR a root singleton is shared across requests only if the injector is shared. Angular creates a fresh application injector per request, but module-level variables are shared, so never keep user data in module scope.<br>
• Version note: <code>inject()</code> since v14, standalone provideXxx functions v14+, <code>provideAppInitializer</code> v19, <code>ng generate @angular/core:inject</code> migration v19.`),
      ],
      [
        ['How do two unrelated components share state?', 'Through a shared root service that holds the state (signals or a BehaviorSubject); both inject the same instance.'],
        ['How do you make a service a singleton?', 'Register it in the root injector with providedIn: \'root\' (or in app providers); Angular then creates one instance for the app.'],
        ['How do you unit test a service that uses HttpClient?', 'Provide provideHttpClient() and provideHttpClientTesting(), inject HttpTestingController, trigger the call, then expectOne(url).flush(data) and verify().'],
        ['Why expose asReadonly() or asObservable() instead of the writable source?', 'To stop consumers from changing state directly; changes go through service methods so rules stay in one place.'],
        ['What is a service locator and why avoid it?', 'Fetching dependencies dynamically from an Injector instead of declaring them; it hides dependencies and hurts testability and tree shaking.'],
        ['How do you replace a dependency in a test?', 'In TestBed.configureTestingModule({ providers: [{ provide: Real, useValue: fake }] }) or useClass with a stub class.'],
      ],
    ),
  ],
};

export const angularSyllabus1: SubTopic[] = [module1, module2, module3, module4, module5, module6, module7, module8];
