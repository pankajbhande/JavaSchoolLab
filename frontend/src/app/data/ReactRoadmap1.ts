// React roadmap, part 1: the roadmap overview and phases 1-5 (JavaScript for React, JSX, props, state and events, conditional rendering and lists).
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const rp = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('rr', n, title, priority, topics);

export const reactRoadmap1: SubTopic[] = [
  {
    id: 'rr-roadmap',
    name: 'React Roadmap (16 Phases)',
    topics: [
      topic(
        'rr-roadmap-overview',
        'Learning Roadmap: 16 Phases',
        [
          blk(`<h3>How to use this roadmap</h3>
• The phases take you from the JavaScript you need, through components, state, hooks, forms, routing and APIs, to the engineering topics of a production React app: TypeScript, performance, testing, security, accessibility and deployment.<br>
• Each phase is a module of this course with worked examples (in JSX) and interview questions. Follow the order: every phase builds on the previous one.<br>
• <b>Essential</b> phases are needed in every React job; <b>Important</b> ones make you effective; <b>Advanced</b> ones separate good from great.<br>
<table ${TABLE}>
<tr><th>Phase</th><th>Topics</th><th>Priority</th></tr>
<tr><td>1</td><td>JavaScript fundamentals</td><td>Essential</td></tr>
<tr><td>2</td><td>JSX and components</td><td>Essential</td></tr>
<tr><td>3</td><td>Props and component composition</td><td>Essential</td></tr>
<tr><td>4</td><td>State and event handling</td><td>Essential</td></tr>
<tr><td>5</td><td>Conditional rendering and lists</td><td>Essential</td></tr>
<tr><td>6</td><td>React hooks</td><td>Essential</td></tr>
<tr><td>7</td><td>Forms and validation</td><td>Essential</td></tr>
<tr><td>8</td><td>React Router</td><td>Essential</td></tr>
<tr><td>9</td><td>REST API integration</td><td>Essential</td></tr>
<tr><td>10</td><td>TypeScript with React</td><td>Essential for your chosen stack</td></tr>
<tr><td>11</td><td>Context and state management</td><td>Important</td></tr>
<tr><td>12</td><td>Performance optimization</td><td>Important</td></tr>
<tr><td>13</td><td>Testing</td><td>Essential for production</td></tr>
<tr><td>14</td><td>Security and accessibility</td><td>Essential for production</td></tr>
<tr><td>15</td><td>Advanced rendering concepts</td><td>Advanced</td></tr>
<tr><td>16</td><td>Deployment and monitoring</td><td>Essential for production</td></tr>
</table>`),
        ],
        [
          blk(`<h3>A realistic study plan</h3>
• Phases 1-3: about 2 weeks. Build static pages from components; do not touch state yet.<br>
• Phases 4-6: about 3 weeks. This is the heart of React. Build a todo list, a counter and a search box until the data flow feels natural.<br>
• Phases 7-9: about 3 weeks. Build a CRUD app against a real API (a Spring Boot back end works well).<br>
• Phases 10-12: about 3 weeks. Convert the app to TypeScript, add Context or a store and profile it.<br>
• Phases 13-16: about 3 weeks. Add tests, harden security and accessibility, then deploy with CI/CD and monitoring.`),
        ],
        [
          blk(`<h3>Checkpoints</h3>
• After phase 5: you can render a filtered, sorted list from an array with stable keys and an empty state.<br>
• After phase 6: you can explain the dependency array and write a custom hook with cleanup.<br>
• After phase 9: you can load, create, update and delete records with loading, error and retry states.<br>
• After phase 14: you can explain why <code>dangerouslySetInnerHTML</code> is risky and make a form usable with only a keyboard and a screen reader.`),
        ],
        [
          ['In what order should React be learned?', 'JavaScript (arrow functions, destructuring, array methods, modules, async) first, then JSX and components, props, state and events, conditional rendering and lists, hooks, forms, routing and API calls. After that TypeScript, state management, performance, testing, security/accessibility, advanced rendering and deployment.'],
          ['How much JavaScript is needed before React?', 'Enough to be comfortable with ES6 syntax, array methods (map/filter/reduce), objects and immutable updates, modules, promises and async/await. React code is mostly plain JavaScript.'],
        ],
      ),
      topic(
        'rr-intro-comparison',
        'Introduction to React: React vs Angular vs JavaScript',
        [
          blk(`<h3>What React is</h3>
• <b>React</b> is a JavaScript <b>library for building user interfaces</b> from reusable components. It was created at Facebook (Meta) and is open source. It focuses on the view layer; routing, state management and data fetching come from companion libraries.<br>
• You describe <b>what the UI should look like for a given state</b> (declarative), and React updates the DOM efficiently when state changes (Virtual DOM + reconciliation).<br>
• Key ideas: components, JSX, one-way data flow, hooks, and a huge ecosystem (React Router, TanStack Query, Redux Toolkit, Next.js).`,
            `// The smallest React app
import { createRoot } from "react-dom/client";
import { useState } from "react";

function App() {
  const [name, setName] = useState("world");
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <input value={name} onChange={e => setName(e.target.value)} />
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);`,
          ),
        ],
        [
          blk(`<h3>React vs Angular vs plain JavaScript</h3>
<table ${TABLE}>
<tr><th>Aspect</th><th>Plain JavaScript</th><th>React</th><th>Angular</th></tr>
<tr><td>Type</td><td>Language</td><td>UI library</td><td>Full framework</td></tr>
<tr><td>Language</td><td>JavaScript</td><td>JavaScript or TypeScript (JSX)</td><td>TypeScript (templates + decorators)</td></tr>
<tr><td>Updating the UI</td><td>Manual DOM code</td><td>Declarative, Virtual DOM</td><td>Templates, change detection / signals</td></tr>
<tr><td>Data flow</td><td>You decide</td><td>One-way (parent to child)</td><td>One-way plus two-way binding (ngModel)</td></tr>
<tr><td>Built in</td><td>Nothing</td><td>Rendering only</td><td>Routing, forms, HTTP, DI, testing tools</td></tr>
<tr><td>Learning curve</td><td>Low to start, hard to scale</td><td>Moderate, flexible</td><td>Steeper, opinionated</td></tr>
<tr><td>Best for</td><td>Small pages, scripts</td><td>Flexible apps, large ecosystem, jobs</td><td>Large enterprise teams wanting one standard</td></tr>
</table>
• Choose React for flexibility and the biggest job market; Angular when a team wants one prescribed structure; plain JavaScript for small enhancements where a framework is overkill.`),
        ],
        [
          blk(`<h3>Why React stays popular, and its trade-offs</h3>
• <b>Strengths</b>: component reuse, large community and libraries, React Native for mobile, strong tooling, gradual adoption (drop it into one page).<br>
• <b>Trade-offs</b>: you choose and assemble the rest of the stack (router, state, forms, data), so teams must agree on conventions. Rapid ecosystem change needs steady learning.<br>
• <b>SPA limits</b>: client-side rendering means a slower first paint and weaker SEO than server-rendered pages. Frameworks such as Next.js add SSR/SSG when needed.`),
        ],
        [
          ['Is React a framework or a library?', 'A library for building user interfaces. Unlike Angular it does not ship routing, forms or an HTTP client; you add libraries for those.'],
          ['What is the main difference between React and plain JavaScript DOM code?', 'In React you declare the UI as a function of state and React updates the DOM for you; with plain JavaScript you write the DOM updates yourself, which becomes error-prone as the app grows.'],
          ['React vs Angular: which should you choose?', 'React for flexibility, ecosystem and job market; Angular for an opinionated, batteries-included framework in large teams. Both are production-proven.'],
        ],
      ),
      topic(
        'rr-checklist-map',
        'Important Topics Checklist (55 Topics) and Priority Order',
        [
          blk(`<h3>The 55 important React topics, and where they are covered</h3>
<table ${TABLE}>
<tr><th>Group</th><th>Topics</th><th>Covered in</th></tr>
<tr><td>1. Fundamentals (1-9)</td><td>Introduction, React vs Angular vs JavaScript, Virtual DOM and reconciliation, JSX, components (functional and class), props and state, conditional rendering, lists and keys, event handling</td><td>This module; Phases 2, 3, 4, 5</td></tr>
<tr><td>2. Hooks (10-18)</td><td>useState, useEffect, useContext, useRef, useReducer, useMemo, useCallback, custom hooks, rules of hooks</td><td>Phases 4, 6, 11</td></tr>
<tr><td>3. Core development (19-28)</td><td>Forms and validation, React Router, component lifecycle, state management, Context API, Redux Toolkit, API integration (fetch/Axios), async/await and promises, error handling, local and session storage</td><td>Phases 1, 2, 7, 8, 9, 11, 15</td></tr>
<tr><td>4. Advanced (29-38)</td><td>Re-rendering, React.memo, lazy loading and Suspense, code splitting, performance optimisation, error boundaries, HOC, portals, Strict Mode, concurrent rendering</td><td>Phases 12, 15</td></tr>
<tr><td>5. TypeScript (39-45)</td><td>Fundamentals, props and state typing, interfaces and type aliases, generics, event typing, API response typing, custom hooks with TypeScript</td><td>Phase 10</td></tr>
<tr><td>6. Backend and production (46-55)</td><td>React + Spring Boot REST APIs, CRUD, authentication and authorization, JWT and secure sessions, CORS, testing, security (XSS/CSRF), deployment (Ubuntu/Nginx), environment variables, Git and CI/CD</td><td>Phases 9, 13, 14, 16</td></tr>
</table>`),
        ],
        [
          blk(`<h3>Priority order for the JavaSchoolLab project</h3>
1. JSX and components<br>
2. Props and state<br>
3. React hooks<br>
4. Forms and validation<br>
5. React Router<br>
6. TypeScript<br>
7. REST API integration with Spring Boot<br>
8. Authentication and authorization<br>
9. State management<br>
10. Performance and security<br>
11. Testing<br>
12. Deployment<br>
<br>
<b>Recommended stack:</b> React + TypeScript + Spring Boot + PostgreSQL/MySQL.<br>
Official learning resource: the React documentation at react.dev/learn.`),
        ],
        [
          blk(`<h3>How to turn the list into a project</h3>
• Build one real app as you go: a course dashboard with login, a course list with search and pagination, a course detail page, progress tracking and an admin area.<br>
• Add features in the priority order above: static components first, then state and hooks, then forms, routing, TypeScript, the Spring Boot API, auth, shared state, optimisation, tests and finally deployment.<br>
• After each phase, refactor what you built before: replace hand-written fetching with TanStack Query, convert files to TypeScript, add tests for the bugs you fixed.`),
        ],
        [
          ['What is the best order to learn React for a Spring Boot full-stack project?', 'Components and JSX, props and state, hooks, forms, routing, TypeScript, REST integration with Spring Boot, authentication, state management, performance and security, testing, then deployment.'],
          ['What stack is recommended for JavaSchoolLab?', 'React with TypeScript on the front end, Spring Boot for the REST API, and MySQL or PostgreSQL for data, deployed behind Nginx with CI/CD.'],
        ],
      ),
    ],
  },

  rp(1, 'JavaScript Fundamentals for React', 'Essential', [
    topic(
      'rr-js-essentials',
      'The JavaScript React Code Uses Every Day',
      [
        blk(`<h3>Syntax you will see in every component</h3>
• <code>const</code>/<code>let</code> only; <b>arrow functions</b> for components and callbacks; <b>template literals</b> for strings.<br>
• <b>Destructuring</b> pulls values out of props and state; <b>spread</b> copies and merges objects/arrays; <b>optional chaining</b> <code>?.</code> and <b>nullish coalescing</b> <code>??</code> handle missing data.<br>
• <b>ES modules</b>: <code>export default Component</code> and <code>import Component from "./Component"</code>; named exports use braces.`,
          `const user = { name: "Asha", address: { city: "Pune" }, tags: ["js", "react"] };

const { name, address: { city }, tags: [firstTag] } = user;     // destructuring
console.log(name, city, firstTag);                              // Asha Pune js

const updated = { ...user, name: "Asha K", tags: [...user.tags, "ts"] };   // spread copy
console.log(updated.tags);                                      // ["js", "react", "ts"]

const greet = (n = "guest") => "Hello, " + n + "!";             // arrow + default
console.log(greet(), greet(name));

console.log(user.profile?.avatar ?? "default.png");             // default.png (no error)

// Button.jsx
export default function Button({ label }) { return <button>{label}</button>; }
// App.jsx
import Button from "./Button";`,
        ),
      ],
      [
        blk(`<h3>Functions as values: callbacks and closures</h3>
• React passes functions around constantly (event handlers, callbacks from child to parent). Functions are values you can store, pass and return.<br>
• A <b>closure</b> remembers the variables of the scope where it was created. Every render of a component creates new functions that "close over" that render's props and state: the key to understanding stale values in hooks.<br>
• Higher-order functions (<code>map</code>, <code>filter</code>) take a function argument.`,
          `function makeHandler(id) {
  return function () { console.log("clicked item", id); };   // remembers id
}
const h1 = makeHandler(1);
const h2 = makeHandler(2);
h1(); h2();            // clicked item 1 / clicked item 2

// What a component render really is:
function renderCounter(count) {
  // this handler closes over THIS render's count
  return () => console.log("count when rendered:", count);
}
const first = renderCounter(0);
const second = renderCounter(1);
first();               // 0  (a handler from an older render still sees 0)
second();              // 1`,
        ),
      ],
      [
        blk(`<h3>Reference vs value: why React cares</h3>
• Primitives (<code>number</code>, <code>string</code>, <code>boolean</code>) are compared by value; objects and arrays by <b>reference</b>.<br>
• React decides whether something changed with <code>Object.is</code>. Mutating an object keeps the same reference, so React may not re-render; a <b>new</b> object or array always signals a change.<br>
• This is the reason for the golden rule: <b>never mutate state or props; create copies</b>.`,
          `const a = { n: 1 };
const b = a;
b.n = 2;
console.log(a.n, a === b);                 // 2 true  (same object)

const c = { ...a };
console.log(c === a, Object.is(c, a));     // false false (a new reference)

const list = [1, 2];
list.push(3);                              // same array -> React would not notice
const next = [...list, 4];                 // new array -> React re-renders
console.log(list === next);                // false`,
        ),
      ],
      [
        ['Why is destructuring so common in React?', 'Props and state are objects/arrays. Destructuring gives short, readable access (function Card({ title, onClose }) and const [count, setCount] = useState(0)) and documents which props a component uses.'],
        ['What is a closure and why does it matter in React?', 'A function that remembers the variables of the scope where it was created. Each render creates new closures over that render\'s props and state, which explains stale-value bugs in effects and callbacks.'],
        ['Why must you avoid mutating state in React?', 'React compares references. Mutation keeps the same reference so the change can be missed, breaks memoisation and causes inconsistent UI. Always create a new object or array.'],
      ],
    ),
    topic(
      'rr-js-array-methods',
      'Array Methods and Immutable Updates',
      [
        blk(`<h3>map, filter, find and reduce</h3>
• <code>map</code> turns data into UI: <code>items.map(item =&gt; &lt;Item key={item.id} .../&gt;)</code>.<br>
• <code>filter</code> removes items, <code>find</code> returns the first match, <code>some</code>/<code>every</code> test conditions, <code>reduce</code> folds into one value, <code>sort</code> orders (it mutates: copy first).<br>
• None of <code>map</code>/<code>filter</code>/<code>find</code> change the original array, which is exactly what React wants.`,
          `const products = [
  { id: 1, name: "Pen", price: 10, stock: 5 },
  { id: 2, name: "Book", price: 250, stock: 0 },
  { id: 3, name: "Bag", price: 900, stock: 3 },
];
const names = products.map(p => p.name);                       // ["Pen", "Book", "Bag"]
const available = products.filter(p => p.stock > 0);            // Pen, Bag
const bag = products.find(p => p.id === 3);                     // { id: 3, ... }
const total = available.reduce((sum, p) => sum + p.price * p.stock, 0);   // 2750
const byPrice = [...products].sort((a, b) => b.price - a.price);          // copy, then sort
console.log(names, total, byPrice[0].name);                    // ... 2750 Bag`,
        ),
      ],
      [
        blk(`<h3>The immutable update cookbook</h3>
• <b>Add</b>: <code>[...list, item]</code>. <b>Remove</b>: <code>list.filter(x =&gt; x.id !== id)</code>. <b>Replace/update</b>: <code>list.map(x =&gt; x.id === id ? { ...x, done: true } : x)</code>.<br>
• <b>Update a nested object</b>: spread every level on the path: <code>{...state, user: {...state.user, address: {...state.user.address, city}}}</code>.<br>
• For deep structures use <b>Immer</b> (built into Redux Toolkit) so you can write "mutating" code that produces immutable results.<br>
• Modern helpers: <code>toSorted</code>, <code>toSpliced</code>, <code>with</code>, <code>structuredClone</code>.`,
          `let todos = [{ id: 1, text: "Learn JSX", done: false }, { id: 2, text: "Learn hooks", done: false }];

todos = [...todos, { id: 3, text: "Ship it", done: false }];                 // add
todos = todos.map(t => t.id === 2 ? { ...t, done: true } : t);               // update one
todos = todos.filter(t => t.id !== 1);                                       // remove
console.log(todos);   // [{id:2,...done:true}, {id:3,...}]

const state = { user: { name: "Asha", address: { city: "Pune" } }, theme: "dark" };
const moved = { ...state, user: { ...state.user, address: { ...state.user.address, city: "Goa" } } };
console.log(state.user.address.city, moved.user.address.city);   // Pune Goa

import { produce } from "immer";
const next = produce(state, draft => { draft.user.address.city = "Delhi"; });   // safe "mutation"`,
        ),
      ],
      [
        blk(`<h3>Common mistakes</h3>
• <code>sort()</code>, <code>reverse()</code>, <code>push()</code> and <code>splice()</code> mutate the array; calling them on state is a classic bug. Copy first or use the non-mutating versions.<br>
• <code>map</code> returns a new array; forgetting <code>return</code> in a block-bodied arrow gives <code>undefined</code> items.<br>
• <code>forEach</code> does not return a value, so it is wrong for building JSX.<br>
• Spreading only copies one level: nested objects are still shared.`,
          `const items = [3, 1, 2];
const [sortedWrong] = [items.sort()];       // mutated "items" itself (would be state!)
const sortedRight = [...[3, 1, 2]].sort(); // copy first

const rows = [1, 2, 3].map(n => { n * 2; });      // [undefined, undefined, undefined]  (no return)
const rowsOk = [1, 2, 3].map(n => n * 2);         // [2, 4, 6]

const original = { tags: ["a"] };
const copy = { ...original };
copy.tags.push("b");
console.log(original.tags);                       // ["a", "b"]  nested array shared`,
        ),
      ],
      [
        ['Which array methods mutate the original?', 'push, pop, shift, unshift, splice, sort, reverse, fill. map, filter, slice, concat, find and reduce do not. Copy before using the mutating ones on state.'],
        ['How do you update one item in an array held in state?', 'setItems(items.map(i => i.id === id ? { ...i, ...changes } : i)) creates a new array with a new object only for the changed item.'],
        ['Why is a shallow copy sometimes not enough?', 'Spread copies one level. Nested objects and arrays are still shared references, so mutating them would affect the old state too. Copy each level on the path or use Immer.'],
      ],
    ),
    topic(
      'rr-js-async-tooling',
      'Async JavaScript and Starting a Project with Vite',
      [
        blk(`<h3>Promises and async/await</h3>
• Network calls are asynchronous. <code>fetch</code> returns a promise; <code>async</code>/<code>await</code> lets you write it in order. Wrap in <code>try/catch</code>.<br>
• <code>fetch</code> resolves even for HTTP 404/500: check <code>response.ok</code>.<br>
• <code>Promise.all</code> runs independent requests in parallel.`,
          `async function loadUsers() {
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const users = await res.json();
    console.log(users.length, users[0].name);
  } catch (err) {
    console.error("failed:", err.message);
  }
}
loadUsers();

const [users, posts] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
]);`,
        ),
      ],
      [
        blk(`<h3>Create a React project with Vite</h3>
• Requirements: Node.js 18+ and npm. <b>Vite</b> is the standard fast dev server and bundler; Create React App is deprecated.<br>
• Commands: <code>npm create vite@latest my-app -- --template react</code> (or <code>react-ts</code>), then <code>cd my-app</code>, <code>npm install</code>, <code>npm run dev</code> (starts at http://localhost:5173), <code>npm run build</code> (output in <code>dist/</code>).<br>
• Key files: <code>index.html</code> (the single page with <code>&lt;div id="root"&gt;</code>), <code>src/main.jsx</code> (mounts React), <code>src/App.jsx</code>, <code>package.json</code>.`,
          `// Terminal
// npm create vite@latest todo-app -- --template react
// cd todo-app && npm install && npm run dev

// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// src/App.jsx
export default function App() {
  return <h1>Hello, React!</h1>;
}`,
        ),
      ],
      [
        blk(`<h3>Environment variables, proxy and folder structure</h3>
• Vite exposes variables that start with <code>VITE_</code> as <code>import.meta.env.VITE_API_URL</code>. Everything shipped to the browser is public: never put secrets there.<br>
• During development, proxy API calls to avoid CORS: <code>server.proxy</code> in <code>vite.config.js</code>.<br>
• Structure by feature as the app grows: <code>src/features/tasks/{components,hooks,api}</code>, <code>src/components</code> (shared UI), <code>src/lib</code>, <code>src/pages</code>.<br>
• Add ESLint (<code>eslint-plugin-react-hooks</code>) and Prettier from day one.`,
          `// .env.development
// VITE_API_URL=http://localhost:3001

// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:3001" } },   // dev-only: no CORS problems
});

// anywhere in the app
const base = import.meta.env.VITE_API_URL ?? "";
const res = await fetch(base + "/api/tasks");

// src layout
// src/
//   features/tasks/{TaskList.jsx, useTasks.js, api.js}
//   components/{Button.jsx, Modal.jsx}
//   pages/{Home.jsx, About.jsx}`,
        ),
      ],
      [
        ['Why does fetch not reject on a 404?', 'fetch only rejects on network failure. HTTP error statuses still resolve, so you must check response.ok (or status) and throw yourself.'],
        ['What does Vite do compared with Create React App?', 'Vite serves source files as native ES modules with instant start and fast hot reload, and builds with Rollup. CRA used webpack and is no longer maintained.'],
        ['How do environment variables work in Vite?', 'Variables prefixed with VITE_ in .env files are inlined into the client bundle via import.meta.env. They are public, so never store secrets in them.'],
      ],
    ),
  ]),

  rp(2, 'JSX and Components', 'Essential', [
    topic(
      'rr-jsx-deep',
      'JSX in Depth: Expressions, Attributes and Fragments',
      [
        blk(`<h3>JSX is JavaScript, not HTML</h3>
• JSX looks like HTML but compiles to <code>React.createElement</code>/<code>jsx()</code> calls. A component returns <b>one</b> root element (use a fragment <code>&lt;&gt;...&lt;/&gt;</code> to avoid an extra <code>&lt;div&gt;</code>).<br>
• Put any JavaScript <b>expression</b> in <code>{ }</code>: variables, function calls, ternaries, template literals. Statements (<code>if</code>, <code>for</code>) are not allowed inside braces.<br>
• Differences from HTML: <code>className</code>, <code>htmlFor</code>, camelCase attributes (<code>onClick</code>, <code>tabIndex</code>), self-close empty tags (<code>&lt;img /&gt;</code>), <code>style</code> takes an object.`,
          `function Profile() {
  const user = { name: "Asha", age: 25, avatar: "/asha.png" };
  const isAdult = user.age >= 18;
  const styles = { color: isAdult ? "green" : "red", fontWeight: "bold" };

  return (
    <>
      <img src={user.avatar} alt={user.name + "'s avatar"} className="avatar" />
      <h2 style={styles}>{user.name.toUpperCase()}</h2>
      <p>Born around {new Date().getFullYear() - user.age}</p>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" tabIndex={0} />
    </>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Rules, escaping and gotchas</h3>
• Component names start with a capital letter (<code>&lt;Card /&gt;</code>); lower-case names are treated as DOM tags.<br>
• JSX <b>escapes</b> embedded values, so user text cannot inject HTML. <code>dangerouslySetInnerHTML</code> turns that protection off.<br>
• Comments inside JSX: <code>{/* comment */}</code>. Spread props with <code>&lt;Input {...props} /&gt;</code>.<br>
• Objects are not valid children: <code>{ {a: 1} }</code> throws; convert to string or map to elements. <code>true</code>, <code>false</code>, <code>null</code>, <code>undefined</code> render nothing, but <code>0</code> renders "0".`,
          `function Demo() {
  const comment = "<script>alert('xss')</script>";
  const count = 0;
  const props = { type: "text", placeholder: "Search", maxLength: 20 };
  return (
    <div>
      {/* the string below is shown as text, not executed */}
      <p>{comment}</p>
      <input {...props} />
      {count && <p>Items: {count}</p>}      {/* BUG: renders the number 0 */}
      {count > 0 && <p>Items: {count}</p>}  {/* correct */}
    </div>
  );
}`,
        ),
      ],
      [
        blk(`<h3>What JSX compiles to</h3>
• With the automatic runtime, <code>&lt;h1 className="t"&gt;Hi&lt;/h1&gt;</code> becomes <code>jsx("h1", { className: "t", children: "Hi" })</code>, which returns a plain object (a <b>React element</b>) describing the UI. Elements are cheap, immutable descriptions, not DOM nodes.<br>
• Because JSX is just expressions, you can store elements in variables, return them from functions, put them in arrays and pass them as props.<br>
• Babel/esbuild/SWC do the compilation at build time; the browser never sees JSX.`,
          `// What you write
const el = <h1 className="title">Hello</h1>;

// What it compiles to (automatic runtime)
import { jsx as _jsx } from "react/jsx-runtime";
const compiled = _jsx("h1", { className: "title", children: "Hello" });

console.log(compiled);
// { type: "h1", props: { className: "title", children: "Hello" }, key: null, ... }

const icon = <span>★</span>;
const Row = ({ left, right }) => <div>{left}{right}</div>;     // elements passed as props
const view = <Row left={icon} right={<b>5.0</b>} />;`,
        ),
      ],
      [
        ['Why must a component return a single root element?', 'A function can return only one value, and JSX compiles to one jsx(...) call. Wrap siblings in a parent element or a fragment <>...</> to return one element.'],
        ['Why className instead of class?', 'JSX is JavaScript and class is a reserved word. DOM properties are also camelCase: className, htmlFor, tabIndex.'],
        ['Is JSX safe against injection?', 'Values embedded with { } are escaped before rendering, so JSX protects against HTML injection by default. dangerouslySetInnerHTML bypasses this and needs sanitised input.'],
      ],
    ),
    topic(
      'rr-components-structure',
      'Function Components and Project Structure',
      [
        blk(`<h3>Components are functions that return UI</h3>
• A component is a function whose name starts with a capital letter and returns JSX (or <code>null</code>). Class components are legacy; write function components with hooks.<br>
• Build the UI as a <b>tree</b> of small components: <code>App</code> → <code>Header</code>, <code>ProductList</code> → <code>ProductCard</code>. Each should do one thing.<br>
• One component per file, named exports or default export, file name equal to the component name.`,
          `// components/ProductCard.jsx
export default function ProductCard({ name, price }) {
  return (
    <article className="card">
      <h3>{name}</h3>
      <p>₹{price.toLocaleString("en-IN")}</p>
    </article>
  );
}

// components/ProductList.jsx
import ProductCard from "./ProductCard";
export default function ProductList({ products }) {
  return (
    <section>
      {products.map(p => <ProductCard key={p.id} name={p.name} price={p.price} />)}
    </section>
  );
}

// App.jsx
export default function App() {
  return <ProductList products={[{ id: 1, name: "Bag", price: 1299 }]} />;
}`,
        ),
      ],
      [
        blk(`<h3>Thinking in React: splitting the UI</h3>
• Five steps: (1) draw boxes around the UI to find components, (2) build a static version with props only, (3) find the minimal state, (4) decide where that state lives, (5) add inverse data flow (callbacks).<br>
• Split a component when it has more than one responsibility, when a part repeats, or when a part has its own state or data needs.<br>
• Components must be <b>pure</b> while rendering: same props and state give the same JSX, with no side effects, no mutating outside values.<br>
• Never define a component inside another component: it is re-created each render and loses its state.`,
          `// WRONG: Inner is a new component type on every render of Outer, so its state resets
function Outer() {
  function Inner() { const [n, setN] = useState(0); return <button onClick={() => setN(n + 1)}>{n}</button>; }
  return <Inner />;
}

// RIGHT: declare at module level
function Inner() { const [n, setN] = useState(0); return <button onClick={() => setN(n + 1)}>{n}</button>; }
function OuterOk() { return <Inner />; }

// Impure render (avoid): changes an outside variable every render
let counter = 0;
function BadId() { counter++; return <p>{counter}</p>; }`,
        ),
      ],
      [
        blk(`<h3>How React renders: virtual DOM and reconciliation</h3>
• Rendering = calling your component functions to get a tree of elements. React <b>diffs</b> the new tree against the previous one (reconciliation) and applies only the minimal DOM changes in the <b>commit</b> phase.<br>
• Same type at the same position keeps its state; a different type (or key) unmounts the old subtree and mounts a new one.<br>
• Render is not the same as a DOM update: a component can re-render without changing the DOM.<br>
• <code>StrictMode</code> renders twice in development to expose impure components.`,
          `function Toggle() {
  const [on, setOn] = useState(false);
  return (
    <div>
      {on ? <input placeholder="A" /> : <input placeholder="B" />}
      {/* same type, same position: React REUSES the input and keeps what you typed */}
      <button onClick={() => setOn(!on)}>Switch</button>
    </div>
  );
}

function Reset({ userId }) {
  return <Profile key={userId} id={userId} />;   // new key = new instance = fresh state
}`,
        ),
      ],
      [
        ['What is the virtual DOM?', 'A lightweight tree of React elements describing the UI. React compares the new tree with the previous one (diffing) and updates only the real DOM nodes that changed.'],
        ['Why must components be pure?', 'React may render a component several times (StrictMode, concurrent rendering) and expects the same output for the same inputs. Side effects during render cause bugs; put them in event handlers or useEffect.'],
        ['Why should you not define a component inside another component?', 'Each render creates a new function, so React sees a different component type, unmounts the old one and mounts a new one, destroying its state and hurting performance.'],
      ],
    ),
    topic(
      'rr-class-lifecycle',
      'Class Components and the Component Lifecycle',
      [
        blk(`<h3>Class components (legacy, but still in many codebases)</h3>
• Before hooks, stateful components were <b>classes</b> extending <code>React.Component</code>, with <code>this.props</code>, <code>this.state</code>, <code>this.setState()</code> and a <code>render()</code> method.<br>
• New code should use function components with hooks, but you must read class components in older projects. Error boundaries still require a class.<br>
• <code>setState</code> merges the update into state and is <b>asynchronous/batched</b>: use <code>setState(prev =&gt; ...)</code> when the new state depends on the old.`,
          `import { Component } from "react";

class Counter extends Component {
  state = { count: 0 };                                     // class field instead of constructor

  increment = () => this.setState(prev => ({ count: prev.count + 1 }));   // arrow keeps "this"

  render() {
    return (
      <div>
        <p>{this.props.label}: {this.state.count}</p>
        <button onClick={this.increment}>+1</button>
      </div>
    );
  }
}
<Counter label="Clicks" />;`,
        ),
      ],
      [
        blk(`<h3>Lifecycle phases and their hook equivalents</h3>
<table ${TABLE}>
<tr><th>Phase</th><th>Class method</th><th>Function component</th></tr>
<tr><td>Mounting (first render)</td><td><code>constructor</code>, <code>render</code>, <code>componentDidMount</code></td><td><code>useEffect(() =&gt; {...}, [])</code></td></tr>
<tr><td>Updating (props/state change)</td><td><code>render</code>, <code>componentDidUpdate(prevProps, prevState)</code></td><td><code>useEffect(() =&gt; {...}, [dep])</code></td></tr>
<tr><td>Unmounting</td><td><code>componentWillUnmount</code></td><td>cleanup function returned from <code>useEffect</code></td></tr>
<tr><td>Error</td><td><code>getDerivedStateFromError</code>, <code>componentDidCatch</code></td><td>no hook; use an error boundary class</td></tr>
</table>
• Fetch data and subscribe in <code>componentDidMount</code>; clean up in <code>componentWillUnmount</code>; compare previous and current values in <code>componentDidUpdate</code> to avoid loops.`,
          `class UserProfile extends Component {
  state = { user: null };
  controller = new AbortController();

  componentDidMount() { this.load(); }                          // after the first render
  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) this.load();    // only when the id changed
  }
  componentWillUnmount() { this.controller.abort(); }           // cleanup

  load() {
    fetch("/api/users/" + this.props.userId, { signal: this.controller.signal })
      .then(r => r.json()).then(user => this.setState({ user }))
      .catch(() => {});
  }
  render() { return this.state.user ? <h2>{this.state.user.name}</h2> : <p>Loading...</p>; }
}

// The same component with hooks
function UserProfileFn({ userId }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/users/" + userId, { signal: c.signal }).then(r => r.json()).then(setUser).catch(() => {});
    return () => c.abort();
  }, [userId]);
  return user ? <h2>{user.name}</h2> : <p>Loading...</p>;
}`,
        ),
      ],
      [
        blk(`<h3>Why hooks replaced classes</h3>
• Logic in classes is split across lifecycle methods by <em>time</em> (mount, update, unmount); with hooks it is grouped by <em>concern</em> (one effect per subscription), and reusable through custom hooks.<br>
• Classes need <code>this</code> binding and wrapper patterns (HOCs, render props) for reuse, which create deep trees.<br>
• Migrating: convert class to function, <code>this.state</code> to <code>useState</code>, lifecycle methods to <code>useEffect</code>, instance fields to <code>useRef</code>. Keep boundary components as classes (or use <code>react-error-boundary</code>).<br>
• Legacy lifecycle methods <code>componentWillMount</code>, <code>componentWillReceiveProps</code>, <code>componentWillUpdate</code> are deprecated (unsafe with concurrent rendering).`,
          `// Mapping cheat sheet
// this.state = { n: 0 }                 ->  const [n, setN] = useState(0)
// this.setState({ n: n + 1 })           ->  setN(n => n + 1)
// componentDidMount                     ->  useEffect(fn, [])
// componentDidUpdate (on prop change)   ->  useEffect(fn, [prop])
// componentWillUnmount                  ->  return cleanup inside useEffect
// this.timerId = setInterval(...)       ->  const timerId = useRef(); timerId.current = setInterval(...)
// shouldComponentUpdate / PureComponent ->  React.memo(Component)`,
        ),
      ],
      [
        ['What are the lifecycle phases of a React component?', 'Mounting (created and inserted into the DOM), updating (re-rendered after props or state change) and unmounting (removed). Class components have methods for each; function components use useEffect and its cleanup.'],
        ['Which hook replaces componentDidMount, componentDidUpdate and componentWillUnmount?', 'useEffect: an empty dependency array runs after mount, a populated array runs after relevant updates, and the returned cleanup function runs on unmount (and before re-running).'],
        ['Why are class components discouraged for new code?', 'Hooks make logic reusable and grouped by concern, avoid this-binding problems and wrapper hell, and work better with concurrent rendering. Classes remain only for error boundaries.'],
      ],
    ),
  ]),

  rp(3, 'Props and Component Composition', 'Essential', [
    topic(
      'rr-props-deep',
      'Props: Passing Data Down',
      [
        blk(`<h3>Props are the inputs of a component</h3>
• Props are passed like HTML attributes and received as one object, usually destructured in the parameter list.<br>
• Props flow <b>one way: parent to child</b>, and are <b>read-only</b>. A child that needs to change something calls a function the parent passed down.<br>
• You can pass any value: strings, numbers, booleans (<code>disabled</code> alone means <code>true</code>), objects, arrays, functions and even JSX. Non-string values need braces.`,
          `function Avatar({ name, size = 48, rounded = true, onClick }) {
  return (
    <button onClick={onClick} style={{ width: size, height: size, borderRadius: rounded ? "50%" : 0 }}>
      {name[0]}
    </button>
  );
}

export default function Team() {
  const members = ["Asha", "Ravi", "Sita"];
  return members.map(m => (
    <Avatar key={m} name={m} size={64} onClick={() => alert("Hello " + m)} />
  ));
}`,
        ),
      ],
      [
        blk(`<h3>Defaults, rest props and the children prop</h3>
• Default values in destructuring: <code>({ size = 48 })</code>. Collect leftovers with rest: <code>({ label, ...rest })</code> and forward them: <code>&lt;button {...rest}&gt;</code>.<br>
• <code>children</code> is whatever you put between the tags: text, elements or functions. It makes wrapper components (Card, Modal, Layout) flexible.<br>
• Do not copy a prop into state "to edit it later" unless you intend it as an <i>initial</i> value (name it <code>initialValue</code>): the copy will not follow later prop changes.`,
          `function Button({ variant = "primary", children, ...rest }) {
  return <button className={"btn btn-" + variant} {...rest}>{children}</button>;
}
// disabled, onClick, aria-label... are all forwarded through ...rest
<Button variant="danger" disabled onClick={() => console.log("deleted")}>Delete</Button>;

function Card({ title, children }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}
<Card title="Welcome"><p>Any JSX goes here.</p><Button>OK</Button></Card>;`,
        ),
      ],
      [
        blk(`<h3>Prop pitfalls</h3>
• <b>Mutating props</b> (<code>props.items.push(x)</code>) breaks one-way data flow. Props are read-only.<br>
• <b>Inline objects/functions</b> create a new reference every render, defeating <code>React.memo</code>. Stabilise with <code>useMemo</code>/<code>useCallback</code> only when profiling shows a need.<br>
• Passing too many props is a smell: group related ones into an object, or use composition/Context.<br>
• Validate props: with TypeScript (preferred) or <code>PropTypes</code> in JavaScript projects.`,
          `import PropTypes from "prop-types";

function Price({ amount, currency }) {
  return <span>{new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount)}</span>;
}
Price.propTypes = {
  amount: PropTypes.number.isRequired,
  currency: PropTypes.oneOf(["INR", "USD", "EUR"]),
};
Price.defaultProps = undefined;      // prefer default parameters in function components

function Wrong({ items }) {
  items.push("x");                   // BUG: mutates the parent's array
  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
}`,
        ),
      ],
      [
        ['Can a child change its props?', 'No. Props are read-only. To change data the child calls a callback passed from the parent, which updates the parent\'s state and re-renders the child with new props.'],
        ['What is the children prop?', 'The content placed between a component\'s opening and closing tags. It lets a component wrap arbitrary content, such as Card, Layout or Modal.'],
        ['Why not copy props into state?', 'The state copy is initialised once and does not update when the prop changes, so the two drift apart. Derive values from props during render, or treat the prop explicitly as an initial value.'],
      ],
    ),
    topic(
      'rr-composition-patterns',
      'Composition Patterns: Slots, Render Props and Compound Components',
      [
        blk(`<h3>Composition over inheritance</h3>
• React reuses UI by <b>composing components</b>, never by inheriting from them. Build general components that accept <code>children</code> or other elements as props, and specialise by wrapping.<br>
• <b>Slots</b>: pass JSX through named props (<code>header</code>, <code>footer</code>) for layouts with several holes.`,
          `function Layout({ header, sidebar, children, footer }) {
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{children}</main>
      <footer>{footer}</footer>
    </div>
  );
}

export default function Page() {
  return (
    <Layout header={<h1>Dashboard</h1>} sidebar={<nav>Menu</nav>} footer={<small>© 2026</small>}>
      <p>Main content</p>
    </Layout>
  );
}

const DangerButton = props => <Button variant="danger" {...props} />;    // specialisation by composition`,
        ),
      ],
      [
        blk(`<h3>Render props and the container/presentational split</h3>
• A <b>render prop</b> is a function prop that returns JSX, letting the child component supply data while the parent decides how to display it. Hooks replaced most uses, but the pattern is still useful for lists and layout.<br>
• Separate <b>logic</b> (fetching, state) from <b>presentation</b> (markup). Keep presentational components pure and easy to test; put logic in custom hooks or container components.`,
          `function MouseTracker({ render }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return <div style={{ height: 200 }} onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>{render(pos)}</div>;
}
<MouseTracker render={({ x, y }) => <p>Mouse at {x}, {y}</p>} />;

function List({ items, renderItem, empty = <p>Nothing here</p> }) {
  if (items.length === 0) return empty;
  return <ul>{items.map(renderItem)}</ul>;
}
<List items={["a", "b"]} renderItem={(i) => <li key={i}>{i.toUpperCase()}</li>} />;`,
        ),
      ],
      [
        blk(`<h3>Compound components</h3>
• A <b>compound component</b> is a set of components that work together and share implicit state, like <code>&lt;select&gt;</code>/<code>&lt;option&gt;</code>: <code>&lt;Tabs&gt;</code>, <code>&lt;Tabs.List&gt;</code>, <code>&lt;Tabs.Panel&gt;</code>. The parent owns the state and shares it through Context, so users get a flexible, declarative API.<br>
• Design rules: keep the public API small, let consumers control layout through composition, and document required nesting.`,
          `import { createContext, useContext, useState } from "react";

const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;
}
function Tab({ value, children }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button role="tab" aria-selected={active === value} onClick={() => setActive(value)}>{children}</button>
  );
}
function Panel({ value, children }) {
  const { active } = useContext(TabsContext);
  return active === value ? <div role="tabpanel">{children}</div> : null;
}
Tabs.Tab = Tab; Tabs.Panel = Panel;

<Tabs defaultValue="a">
  <Tabs.Tab value="a">One</Tabs.Tab>
  <Tabs.Tab value="b">Two</Tabs.Tab>
  <Tabs.Panel value="a">First panel</Tabs.Panel>
  <Tabs.Panel value="b">Second panel</Tabs.Panel>
</Tabs>;`,
        ),
      ],
      [
        ['Composition vs inheritance in React?', 'React favours composition: build components from other components using props and children. Inheritance between components is not recommended; shared logic goes into composition or custom hooks.'],
        ['What is a render prop?', 'A prop whose value is a function returning JSX, used so a component can share its internal data while the consumer controls what is rendered.'],
        ['What is a compound component?', 'A group of related components (Tabs, Tab, Panel) that share state implicitly, usually via Context, giving a flexible declarative API similar to select/option.'],
      ],
    ),
  ]),

  rp(4, 'State and Event Handling', 'Essential', [
    topic(
      'rr-state-usestate-deep',
      'State with useState: Snapshots, Batching and Updater Functions',
      [
        blk(`<h3>State is a component's memory</h3>
• <code>const [value, setValue] = useState(initial)</code> returns the current value and a setter. Calling the setter schedules a re-render with the new value.<br>
• A normal local variable is reset every render and changing it does not update the screen; state survives re-renders and triggers them.<br>
• Each component instance has its own state: two <code>&lt;Counter /&gt;</code> elements count independently.`,
          `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  let plain = 0;                                  // reset to 0 on every render, no re-render when changed
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => { plain++; console.log(plain); }}>Plain variable</button>
    </div>
  );
}`,
        ),
      ],
      [
        blk(`<h3>State is a snapshot; updates are batched</h3>
• Within one render, <code>count</code> has a fixed value (a snapshot). <code>setCount(count + 1)</code> three times adds only 1 because all three read the same snapshot.<br>
• Use the <b>updater function</b> when the next value depends on the previous one: <code>setCount(c =&gt; c + 1)</code>.<br>
• React batches updates from one event into a single render. The state variable still holds the old value right after calling the setter in the same handler.<br>
• Initial value from an expensive computation: pass a function (<b>lazy initial state</b>): <code>useState(() =&gt; readFromStorage())</code>.`,
          `function Demo() {
  const [n, setN] = useState(0);

  function addThreeWrong() { setN(n + 1); setN(n + 1); setN(n + 1); }      // ends at n + 1
  function addThree()      { setN(c => c + 1); setN(c => c + 1); setN(c => c + 1); }   // n + 3

  function show() {
    setN(n + 10);
    console.log(n);            // still the OLD value in this handler (snapshot)
  }

  const [theme] = useState(() => localStorage.getItem("theme") ?? "light");   // lazy init: runs once
  return <button onClick={addThree}>{n}</button>;
}`,
        ),
      ],
      [
        blk(`<h3>Choosing and structuring state</h3>
• <b>Do not store derived data</b>: compute <code>filtered</code>, <code>total</code> or <code>fullName</code> during render from existing state instead of keeping another state variable in sync.<br>
• <b>Group related fields</b> into one object (<code>{x, y}</code>) or use <code>useReducer</code>; avoid contradictory booleans (<code>isLoading</code> and <code>isError</code> both true): prefer one <code>status</code> string.<br>
• <b>Avoid duplicated and deeply nested state</b>: store IDs and look objects up, or normalise.<br>
• Keep state as <b>low</b> as possible; lift it to the nearest common parent only when needed.<br>
• Setting the same value (by <code>Object.is</code>) skips the re-render.`,
          `// BAD: redundant state that can drift out of sync
const [items, setItems] = useState(initialItems);
const [count, setCount] = useState(items.length);        // derived! drop it

// GOOD: derive in render
const total = items.reduce((s, i) => s + i.price, 0);
const visible = items.filter(i => i.name.includes(query));

// BAD: impossible states
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
// GOOD: one status
const [status, setStatus] = useState("idle");           // "idle" | "loading" | "success" | "error"

// Selection by id instead of copying the whole object
const [selectedId, setSelectedId] = useState(null);
const selected = items.find(i => i.id === selectedId);`,
        ),
      ],
      [
        ['Why does setCount(count + 1) three times only add one?', 'Inside one render count is a snapshot, so each call computes the same next value. Use setCount(c => c + 1) so each update receives the latest value.'],
        ['What is derived state and why avoid storing it?', 'Values computable from props/state (totals, filtered lists). Storing them duplicates truth and can go out of sync; compute them during render instead.'],
        ['What is lazy initial state?', 'Passing a function to useState(() => expensive()) so the initial value is computed only on the first render instead of on every render.'],
      ],
    ),
    topic(
      'rr-events-handling',
      'Event Handling: Handlers, Synthetic Events and Arguments',
      [
        blk(`<h3>Reacting to the user</h3>
• Attach handlers with camelCase props: <code>onClick</code>, <code>onChange</code>, <code>onSubmit</code>, <code>onKeyDown</code>. Pass a <b>function</b>, do not call it: <code>onClick={handle}</code>, not <code>onClick={handle()}</code>.<br>
• The handler receives a <b>SyntheticEvent</b>, a cross-browser wrapper with the same API as the native event (<code>e.target</code>, <code>e.preventDefault()</code>, <code>e.stopPropagation()</code>).<br>
• Handlers are where side effects (setting state, calling APIs) belong.`,
          `function SignupForm() {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();                        // stop the browser's full-page submit
    console.log("Submitting", email);
  }
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Escape" && setEmail("")} />
      <button type="submit">Join</button>
      <button type="button" onClick={() => alert("Hello")}>Say hi</button>
    </form>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Passing arguments and the classic mistakes</h3>
• To pass an argument, wrap the call in an arrow function: <code>onClick={() =&gt; remove(item.id)}</code>.<br>
• <code>onClick={remove(item.id)}</code> runs <code>remove</code> <em>during render</em>, usually causing an infinite loop of re-renders.<br>
• Event handlers can be passed as props (<code>onSelect</code>) so children report events to the parent. Name props <code>onXxx</code> and handlers <code>handleXxx</code>.<br>
• In a form, a <code>&lt;button&gt;</code> without <code>type="button"</code> submits the form.`,
          `function TodoList({ todos, onRemove, onToggle }) {
  return (
    <ul>
      {todos.map(t => (
        <li key={t.id}>
          <input type="checkbox" checked={t.done} onChange={() => onToggle(t.id)} />
          {t.text}
          <button type="button" onClick={() => onRemove(t.id)}>x</button>   {/* wrapper keeps it from running now */}
        </li>
      ))}
    </ul>
  );
}
// WRONG: <button onClick={onRemove(t.id)}>   // called during render -> setState in render -> infinite loop`,
        ),
      ],
      [
        blk(`<h3>Propagation, delegation and async events</h3>
• Events <b>bubble</b> up the component tree: a click on a button also triggers its parents' <code>onClick</code>. Stop it with <code>e.stopPropagation()</code>; use <code>onClickCapture</code> for the capture phase.<br>
• React attaches one listener at the root (event delegation), so you never add or remove listeners yourself.<br>
• Since React 17 there is no event pooling: you can read <code>e</code> asynchronously. Still, read the values you need first (<code>const value = e.target.value</code>) before awaiting.<br>
• For non-React DOM events (window <code>resize</code>, <code>keydown</code> on document) use <code>useEffect</code> with cleanup.`,
          `function Card({ onOpen, onDelete }) {
  return (
    <div onClick={onOpen} role="button" tabIndex={0}>
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</button>   {/* does not trigger onOpen */}
    </div>
  );
}

function WindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);   // cleanup
  }, []);
  return <p>{w}px</p>;
}`,
        ),
      ],
      [
        ['What is a SyntheticEvent?', 'React\'s cross-browser wrapper around the native event with the same interface (preventDefault, stopPropagation, target). Handlers receive it as their argument.'],
        ['Why does onClick={handle()} cause an infinite loop?', 'It calls handle during rendering and passes its return value. If handle sets state, that triggers another render, which calls it again. Pass the function itself or wrap it in an arrow.'],
        ['How do you handle window-level events in React?', 'Register them in useEffect with addEventListener and remove them in the cleanup function, so listeners do not leak or duplicate.'],
      ],
    ),
    topic(
      'rr-state-lifting-reducer',
      'Lifting State Up and useReducer',
      [
        blk(`<h3>Sharing state between components</h3>
• When two components need the same data, <b>lift the state up</b> to their closest common parent. The parent passes the value down as a prop and a setter (callback) down for changes.<br>
• Data flows down, events flow up ("inverse data flow").`,
          `function TemperatureApp() {
  const [celsius, setCelsius] = useState(20);          // the single source of truth
  return (
    <>
      <Input label="Celsius" value={celsius} onChange={setCelsius} />
      <Input label="Fahrenheit" value={celsius * 9 / 5 + 32} onChange={f => setCelsius((f - 32) * 5 / 9)} />
    </>
  );
}
function Input({ label, value, onChange }) {
  return (
    <label>{label}
      <input type="number" value={Math.round(value * 10) / 10} onChange={e => onChange(Number(e.target.value))} />
    </label>
  );
}`,
        ),
      ],
      [
        blk(`<h3>useReducer for complex transitions</h3>
• <code>const [state, dispatch] = useReducer(reducer, initial)</code> puts all state transitions in one pure function <code>(state, action) =&gt; newState</code>. Use it when state has several fields that change together or when the next state depends on a named event.<br>
• Reducers must be pure and must not mutate state; actions are plain objects with a <code>type</code>.<br>
• Benefits: all update logic in one testable place, clearer than many <code>useState</code> calls, easy to pair with Context.`,
          `import { useReducer } from "react";

function cartReducer(state, action) {
  switch (action.type) {
    case "add": {
      const existing = state.find(i => i.id === action.item.id);
      return existing
        ? state.map(i => i.id === existing.id ? { ...i, qty: i.qty + 1 } : i)
        : [...state, { ...action.item, qty: 1 }];
    }
    case "remove": return state.filter(i => i.id !== action.id);
    case "clear": return [];
    default: throw new Error("Unknown action " + action.type);
  }
}

function Cart() {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <>
      <button onClick={() => dispatch({ type: "add", item: { id: 1, name: "Pen", price: 10 } })}>Add pen</button>
      <p>{cart.length} lines, total ₹{total}</p>
      <button onClick={() => dispatch({ type: "clear" })}>Clear</button>
    </>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Choosing where state lives</h3>
• Decision guide: used by one component → local <code>useState</code>; shared by a few nearby components → lift up; needed across distant parts → Context or a store; comes from the server → TanStack Query/SWR, not <code>useState</code>.<br>
• URL state (filters, page, tab) belongs in the URL (search params) so it is shareable and survives refresh.<br>
• Form state can stay uncontrolled or in a form library.<br>
• Avoid "prop drilling" through many layers by composition (pass elements/children) before reaching for Context.`,
          `// Prefer composition to prop drilling: pass the finished element, not the data
function Page({ user }) {
  const avatar = <Avatar url={user.avatarUrl} />;      // built where the data is
  return <Layout header={<Header avatar={avatar} />} />;   // Layout/Header never need "user"
}

// URL as state
import { useSearchParams } from "react-router-dom";
function Products() {
  const [params, setParams] = useSearchParams();
  const sort = params.get("sort") ?? "price";
  return <button onClick={() => setParams({ sort: sort === "price" ? "name" : "price" })}>Sorted by {sort}</button>;
}`,
        ),
      ],
      [
        ['What does lifting state up mean?', 'Moving state from a child to the nearest common ancestor so several children can read it (via props) and change it (via callbacks), keeping a single source of truth.'],
        ['When would you choose useReducer over useState?', 'When state is an object/array with several related updates or when the next state depends on named actions; it centralises logic in a pure reducer and is easy to test.'],
        ['What is prop drilling and how do you avoid it?', 'Passing props through many intermediate components that do not use them. Avoid with composition (children/slots), Context for truly global values, or a state library.'],
      ],
    ),
  ]),

  rp(5, 'Conditional Rendering and Lists', 'Essential', [
    topic(
      'rr-conditional-patterns',
      'Conditional Rendering Patterns',
      [
        blk(`<h3>Showing UI based on conditions</h3>
• JSX has no <code>if</code> statement, but you can use plain JavaScript: <b>early return</b>, <b>ternary</b> <code>cond ? &lt;A /&gt; : &lt;B /&gt;</code> and <b>logical AND</b> <code>cond &amp;&amp; &lt;A /&gt;</code>.<br>
• Returning <code>null</code> renders nothing.<br>
• Use early returns for loading/error/empty states to keep the main JSX flat.`,
          `function Greeting({ user, loading, error }) {
  if (loading) return <p>Loading...</p>;                     // early returns
  if (error) return <p role="alert">Error: {error.message}</p>;
  if (!user) return null;

  return (
    <div>
      {user.isAdmin ? <AdminBadge /> : <MemberBadge />}      {/* ternary: either/or */}
      {user.unread > 0 && <span className="badge">{user.unread}</span>}   {/* && : show or nothing */}
      <p>Welcome back, {user.name}</p>
    </div>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Pitfalls with &amp;&amp; and nested ternaries</h3>
• <code>{count &amp;&amp; &lt;Badge /&gt;}</code> renders the number <code>0</code> when <code>count</code> is <code>0</code> (0 is falsy but renderable). Use a boolean: <code>count &gt; 0 &amp;&amp; ...</code>.<br>
• Nested ternaries get unreadable fast: extract a small function or component, or use a lookup object.<br>
• Conditionally <b>rendering</b> removes the element and its state; conditionally <b>hiding</b> with CSS keeps it mounted. Choose deliberately (e.g. keep a tab's form state by hiding).`,
          `function Status({ state }) {
  // Lookup instead of a ternary pyramid
  const views = {
    idle: <p>Ready</p>,
    loading: <Spinner />,
    success: <p>Saved</p>,
    error: <p role="alert">Failed</p>,
  };
  return views[state] ?? null;
}

function Inbox({ count }) {
  return (
    <>
      {count && <span>({count})</span>}       {/* count = 0 shows "0" */}
      {count > 0 && <span>({count})</span>}   {/* correct */}
      <div style={{ display: open ? "block" : "none" }}><DraftEditor /></div>   {/* hidden but keeps its state */}
    </>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Patterns for larger apps</h3>
• <b>Feature flags / permissions</b>: wrap checks in a small component (<code>&lt;Can permission="edit"&gt;</code>) so rules live in one place.<br>
• <b>Suspense and error boundaries</b> handle loading and failures declaratively around subtrees.<br>
• <b>Switch-like components</b> (<code>&lt;Match&gt;</code>) and discriminated unions (TypeScript) make every state explicit and exhaustive.<br>
• Never put conditional hook calls inside branches: conditions apply to JSX, not to hooks.`,
          `function Can({ permission, children, fallback = null }) {
  const { permissions } = useAuth();
  return permissions.includes(permission) ? children : fallback;
}
<Can permission="orders:delete" fallback={<p>Read-only</p>}><DeleteButton /></Can>;

import { Suspense } from "react";
<ErrorBoundary fallback={<p>Something went wrong</p>}>
  <Suspense fallback={<Spinner />}>
    <Reports />
  </Suspense>
</ErrorBoundary>;

// Hooks must not be conditional:
function Bad({ show }) {
  if (show) { const [x] = useState(0); }          // WRONG: order of hooks changes between renders
}`,
        ),
      ],
      [
        ['Why does {count && <X />} sometimes show a 0?', 'Because 0 is falsy, so the expression evaluates to 0, and React renders numbers. Use a boolean condition such as count > 0.'],
        ['Conditional rendering vs hiding with CSS?', 'Not rendering unmounts the component and discards its state and effects; hiding with CSS keeps it mounted (state preserved) but still in the DOM.'],
        ['Can you call a hook inside an if?', 'No. Hooks must run in the same order on every render, so they cannot be placed inside conditions, loops or nested functions.'],
      ],
    ),
    topic(
      'rr-lists-keys-deep',
      'Rendering Lists and Keys',
      [
        blk(`<h3>Turning arrays into UI</h3>
• Use <code>array.map()</code> to return one element per item. Every element in the list needs a <code>key</code> prop: a <b>stable, unique</b> value among siblings, typically the database id.<br>
• Keys are not props: the child cannot read <code>props.key</code>. Put the key on the outermost element returned by <code>map</code>.`,
          `const students = [
  { id: 101, name: "Asha", marks: 82 },
  { id: 102, name: "Ravi", marks: 67 },
  { id: 103, name: "Sita", marks: 91 },
];

function StudentTable() {
  return (
    <table>
      <thead><tr><th>Name</th><th>Marks</th></tr></thead>
      <tbody>
        {students.map(s => (
          <tr key={s.id}>
            <td>{s.name}</td>
            <td>{s.marks}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Why keys matter</h3>
• React uses keys to match items between renders. With stable keys it can move, insert and remove DOM nodes and keep each row's state (input text, focus). With index keys on a list that reorders, state sticks to the wrong row.<br>
• Never generate keys during render (<code>Math.random()</code>): every render looks like all items were replaced, remounting everything.<br>
• Use the index only for static lists that never reorder, filter or insert.<br>
• Use <code>&lt;Fragment key={id}&gt;</code> when a list item renders multiple siblings.`,
          `function Wrong({ items }) {
  return items.map((item, index) => <EditableRow key={index} item={item} />);
  // delete the first row: React reuses row 0's state for the old row 1 -> wrong text in inputs
}
function Right({ items }) {
  return items.map(item => <EditableRow key={item.id} item={item} />);
}
function Worse({ items }) {
  return items.map(item => <EditableRow key={Math.random()} item={item} />);   // remounts every row each render
}

import { Fragment } from "react";
function Glossary({ terms }) {
  return <dl>{terms.map(t => (
    <Fragment key={t.id}><dt>{t.word}</dt><dd>{t.meaning}</dd></Fragment>
  ))}</dl>;
}`,
        ),
      ],
      [
        blk(`<h3>Derived lists: filter, sort, group, paginate</h3>
• Keep the <b>source list</b> and the <b>controls</b> (query, sort order, page) in state; compute the visible list during render. Memoise with <code>useMemo</code> only for big data.<br>
• Always render an <b>empty state</b>, and show how many results matched.<br>
• Sort a copy, never the state array. For large lists use <b>virtualisation</b> (react-window) and server-side pagination.<br>
• Group with <code>reduce</code> or <code>Object.groupBy</code> before mapping.`,
          `function ProductBrowser({ products }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const visible = useMemo(() => {
    const filtered = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    const sorted = [...filtered].sort((a, b) => sort === "price" ? a.price - b.price : a.name.localeCompare(b.name));
    return sorted;
  }, [products, query, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search" />
      <select value={sort} onChange={e => setSort(e.target.value)}><option value="name">Name</option><option value="price">Price</option></select>
      <p>{visible.length} results</p>
      {pageItems.length === 0 ? <p>No products found.</p> : <ul>{pageItems.map(p => <li key={p.id}>{p.name} - ₹{p.price}</li>)}</ul>}
      <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
      <span> {page} / {pages} </span>
      <button disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button>
    </>
  );
}`,
        ),
      ],
      [
        ['Why does React need keys in lists?', 'To identify each item across renders so it can reorder, add and remove DOM nodes efficiently and keep item state attached to the right item.'],
        ['Is using the array index as a key okay?', 'Only for static lists that never reorder, filter or insert. Otherwise item identity shifts and state/inputs end up on the wrong rows. Use a stable unique id.'],
        ['How do you implement search, sort and pagination over a list?', 'Store the source data and control values (query, sort, page) in state, derive the visible list during render (filter, sorted copy, slice), and render an empty state when nothing matches.'],
      ],
    ),
  ]),
];
