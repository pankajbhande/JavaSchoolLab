// React course extras, part 1 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const react1Extras: Record<string, Extra> = {
    'reactjs-intro': x(
        ['React is a JavaScript library for building user interfaces from small reusable pieces called components.',
            'You describe what the UI should look like for the current data, and React updates the page efficiently when the data changes.',
            'React uses JSX, a syntax that looks like HTML inside JavaScript.'],
        ['React is declarative: you write the result for a given state, not the steps to change the DOM.',
            'Data flows one way: parents pass props down, children report up with callbacks.',
            'React renders to a virtual tree, compares it with the previous one (reconciliation) and applies the minimum DOM changes.'],
        ['React is a view library; routing, data fetching and state management come from libraries or a framework (Next.js, Remix).',
            'Keep components small and pure; side effects belong in effects or event handlers.',
            'Performance comes from correct keys, memoization where measured, code splitting and avoiding unnecessary state.'],
        [['F', 'What is React?', 'A JavaScript library for building user interfaces with components.'],
            ['F', 'What is a component?', 'A function that returns JSX describing a part of the UI.'],
            ['M', 'What does declarative mean?', 'You describe the desired UI for a state and React figures out how to update the DOM.'],
            ['M', 'What is the virtual DOM?', 'A lightweight in-memory representation of the UI that React compares between renders to compute minimal DOM updates.'],
            ['S', 'Why one-way data flow?', 'It makes state changes predictable and easier to debug because data moves in one direction through props.'],
            ['S', 'React vs a full framework?', 'React handles rendering; frameworks like Angular or Next.js add routing, data loading and conventions.']],
        [['A minimal component.',
            r`function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
function App() {
  return <Welcome name="Asha" />;
}
// index.jsx: createRoot(document.getElementById("root")).render(<App />);

// OUTPUT:
// <h1>Hello, Asha!</h1>`],
            ['State makes it interactive.',
                r`import { useState } from "react";
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}

// OUTPUT:
// Clicked 0 times   (after one click: Clicked 1 times)`]],
        [['Create a project.',
            r`npm create vite@latest shop -- --template react
cd shop && npm install && npm run dev

// OUTPUT:
// VITE ready in 310 ms  Local: http://localhost:5173/`],
            ['Rendering a list from data.',
                r`const products = [{ id: 1, name: "Pen" }, { id: 2, name: "Book" }];
function ProductList() { return <ul>{products.map(p => <li key={p.id}>{p.name}</li>)}</ul>; }

// OUTPUT:
// <ul><li>Pen</li><li>Book</li></ul>`]]
    ),

    'single-page-application': x(
        ['A single page application (SPA) loads one HTML page and then updates the content with JavaScript instead of loading a new page for each link.',
            'Navigation feels instant because only data is fetched and parts of the page change.',
            'React with a router (React Router) is a common way to build an SPA.'],
        ['The browser loads a JavaScript bundle once; the router changes the URL with the History API and renders the matching component.',
            'Data comes from APIs (fetch/axios) as JSON.',
            'The server must return the same index.html for all app routes (fallback) so deep links and refresh work.'],
        ['Trade-offs: fast navigation and app-like feel versus slower first load, SEO challenges and more client complexity.',
            'Mitigate with code splitting, server-side rendering or static generation (Next.js), and prerendering for SEO.',
            'Handle history, scroll restoration, loading and error states, and authentication on the client and server.'],
        [['F', 'What is an SPA?', 'A web app that loads one page and updates its content dynamically without full page reloads.'],
            ['F', 'Name an advantage of SPAs.', 'Fast, app-like navigation after the first load.'],
            ['M', 'Why do deep links need server fallback?', 'The server must serve index.html for any route so the client router can render it after a refresh.'],
            ['M', 'What are SPA SEO challenges?', 'Crawlers may not execute all JavaScript; use SSR, static generation or prerendering for public content.'],
            ['S', 'How do you reduce the initial load time?', 'Code splitting with lazy routes, compression, caching with hashed filenames, and avoiding large dependencies.'],
            ['S', 'SPA vs MPA vs SSR?', 'MPA reloads pages; SPA updates on the client; SSR renders HTML on the server for first load then hydrates, combining fast first paint and SEO.']],
        [['Server fallback configuration.',
            r`# nginx
location / { try_files $uri /index.html; }

// OUTPUT:
// /orders/42 serves index.html, then React Router renders the order page`],
            ['Lazy loaded route.',
                r`const Reports = lazy(() => import("./Reports"));
<Suspense fallback={<p>Loading...</p>}>
  <Routes><Route path="/reports" element={<Reports />} /></Routes>
</Suspense>

// OUTPUT:
// the reports code downloads when the user first opens /reports`]],
        [['History API navigation.',
            r`history.pushState({}, "", "/orders/42");
window.addEventListener("popstate", () => render(location.pathname));

// OUTPUT:
// the URL changes without a page reload`],
            ['Caching hashed assets.',
                r`Cache-Control: public, max-age=31536000, immutable      (for /assets/app.3f9a1c.js)
Cache-Control: no-cache                                    (for index.html)

// OUTPUT:
// returning users load the app from cache and revalidate only index.html`]]
    ),

    'installing-node-npm': x(
        ['Node.js lets you run JavaScript outside the browser. npm is its package manager.',
            'Install Node from nodejs.org (LTS version) and check with <code>node -v</code> and <code>npm -v</code>.',
            'React tooling (Vite, Create React App, Next.js) runs on Node and installs libraries with npm.'],
        ['<code>package.json</code> lists dependencies and scripts (<code>npm run dev</code>, <code>npm run build</code>).',
            '<code>npm install</code> reads package.json and installs into <code>node_modules</code>; <code>package-lock.json</code> pins exact versions.',
            'Use a version manager (nvm, fnm, Volta) to switch Node versions per project.'],
        ['Commit the lockfile and use <code>npm ci</code> in CI for reproducible installs.',
            'Audit dependencies (<code>npm audit</code>), keep them updated and avoid unmaintained packages.',
            'Scripts and the <code>engines</code> field document required Node versions.'],
        [['F', 'What is npm?', 'The Node package manager, used to install and manage JavaScript libraries.'],
            ['F', 'How do you check the Node version?', '<code>node -v</code>.'],
            ['M', 'What does package-lock.json do?', 'It records exact installed versions so installs are reproducible.'],
            ['M', 'npm install vs npm ci?', 'install may update the lockfile; ci installs exactly what the lockfile says and fails if it is out of sync (best for CI).'],
            ['S', 'How do you manage multiple Node versions?', 'With nvm, fnm or Volta, and an .nvmrc or engines field per project.'],
            ['S', 'How do you reduce supply-chain risk?', 'Pin versions with a lockfile, run npm audit, review new dependencies and use provenance or scoped registries.']],
        [['Check and install.',
            r`node -v
npm -v
npm create vite@latest shop -- --template react
cd shop && npm install

// OUTPUT:
// v20.11.1
// 10.2.4
// added 148 packages`],
            ['package.json scripts.',
                r`{ "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview", "test": "vitest" },
  "engines": { "node": ">=20" } }
npm run build

// OUTPUT:
// dist/assets/index-3f9a1c.js  142 kB`]],
        [['Add and remove packages.',
            r`npm install react-router-dom
npm install -D vitest
npm uninstall lodash
npm outdated

// OUTPUT:
// added react-router-dom@6.22.3`],
            ['Reproducible CI install.',
                r`npm ci
npm audit --omit=dev

// OUTPUT:
// found 0 vulnerabilities`]]
    ),

    'jsx-syntax': x(
        ['JSX lets you write HTML-like markup in JavaScript: <code>&lt;h1&gt;Hello&lt;/h1&gt;</code>. It is compiled into function calls.',
            'Put JavaScript expressions in curly braces: <code>{name}</code>, <code>{price * qty}</code>.',
            'Rules: return one root element (or a fragment <code>&lt;&gt;...&lt;/&gt;</code>), close all tags, use <code>className</code> and camelCase attributes.'],
        ['Attributes: <code>className</code>, <code>htmlFor</code>, <code>onClick</code>, <code>style={{ color: "red" }}</code>.',
            'Conditionals and lists use expressions: <code>{cond &amp;&amp; &lt;A /&gt;}</code>, <code>{items.map(...)}</code>.',
            'Comments inside JSX use <code>{/* comment */}</code>.'],
        ['JSX is escaped by default, which protects against XSS; <code>dangerouslySetInnerHTML</code> bypasses it, so sanitize first.',
            'JSX compiles to <code>jsx()</code> calls from the runtime; any expression that evaluates to a React element works.',
            'Keep markup readable: extract subcomponents instead of deeply nested ternaries.'],
        [['F', 'What is JSX?', 'A syntax extension that lets you write HTML-like markup inside JavaScript.'],
            ['F', 'How do you use a variable in JSX?', 'Put it in curly braces, for example {name}.'],
            ['M', 'Why className instead of class?', 'class is a reserved word in JavaScript, so JSX uses className.'],
            ['M', 'Why must JSX return a single root?', 'A component returns one element tree; use a fragment to group siblings without extra DOM nodes.'],
            ['S', 'Is JSX safe from XSS?', 'Text values are escaped by default; dangerouslySetInnerHTML disables that protection and must only receive sanitized HTML.'],
            ['S', 'What does JSX compile to?', 'Calls to the JSX runtime (jsx/jsxs or React.createElement) that return element objects.']],
        [['Expressions and attributes.',
            r`function Price({ item, qty }) {
  const total = item.price * qty;
  return (
    <>
      <h2 className="title">{item.name.toUpperCase()}</h2>
      <p style={{ color: total > 100 ? "red" : "inherit" }}>Total: {total.toFixed(2)}</p>
      {qty === 0 && <small>Out of stock</small>}
    </>
  );
}

// OUTPUT:
// <h2 class="title">PEN</h2><p style="color: inherit">Total: 20.00</p>`],
            ['What JSX compiles to.',
                r`const el = <button className="primary" onClick={save}>Save</button>;
// roughly
const el2 = React.createElement("button", { className: "primary", onClick: save }, "Save");

// OUTPUT:
// { type: "button", props: { className: "primary", onClick: [Function], children: "Save" } }`]],
        [['XSS safety.',
            r`const comment = '<img src=x onerror="alert(1)">';
<p>{comment}</p>                                  // rendered as text
<p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment) }} />

// OUTPUT:
// the first paragraph shows the markup as plain text; the second is sanitized`],
            ['Spreading props.',
                r`const attrs = { id: "email", type: "email", required: true };
<input {...attrs} placeholder="you@example.com" />

// OUTPUT:
// <input id="email" type="email" required placeholder="you@example.com">`]]
    ),

    'react-components': x(
        ['A component is a reusable piece of UI. Today most components are functions that return JSX; class components are the older style.',
            'Component names start with a capital letter: <code>&lt;ProductCard /&gt;</code>.',
            'Components receive props and can hold state with hooks.'],
        ['Functional components with hooks are the standard; class components remain supported but are rarely written now.',
            'Split UI into small components: each does one job and can be reused and tested.',
            'Components must be pure during render: same props and state give the same JSX, without side effects.'],
        ['Container versus presentational patterns, custom hooks for shared logic, and composition with <code>children</code> beat deep inheritance.',
            'Do not define components inside other components (they are recreated each render and lose state).',
            'Use <code>React.memo</code>, <code>useMemo</code> and <code>useCallback</code> only where profiling shows a benefit.'],
        [['F', 'What is a React component?', 'A reusable function (or class) that returns JSX describing part of the UI.'],
            ['F', 'Functional vs class components?', 'Functional components are plain functions that use hooks; class components use this, lifecycle methods and this.state.'],
            ['M', 'Why must components be pure?', 'React may render components multiple times; side effects during render cause bugs, so effects go in event handlers or useEffect.'],
            ['M', 'What is composition?', 'Building complex UI by combining components, often passing children or render props instead of using inheritance.'],
            ['S', 'Why not define a component inside another?', 'It gets a new identity each render, so React unmounts and remounts it, losing state and hurting performance.'],
            ['S', 'When use React.memo?', 'When a component re-renders often with the same props and rendering is measurably expensive.']],
        [['Function vs class component.',
            r`function Greeting({ name }) { return <h1>Hello, {name}</h1>; }

class GreetingClass extends React.Component {
  render() { return <h1>Hello, {this.props.name}</h1>; }
}

// OUTPUT:
// both render <h1>Hello, Asha</h1>`],
            ['Composition with children.',
                r`function Card({ title, children }) { return <section className="card"><h3>{title}</h3>{children}</section>; }
<Card title="Orders"><OrderTable /></Card>

// OUTPUT:
// <section class="card"><h3>Orders</h3>...table...</section>`]],
        [['Bug: component defined inside another.',
            r`function Page() {
  const Row = () => <input />;           // new component type each render: input loses focus and text
  return <Row />;
}
// fix: define Row outside Page

// OUTPUT:
// typing in the input resets on every keystroke (before the fix)`],
            ['Memoized child.',
                r`const Row = React.memo(function Row({ item }) { return <tr><td>{item.name}</td></tr>; });

// OUTPUT:
// Row re-renders only when its item prop changes`]]
    ),

    'react-props': x(
        ['Props are inputs to a component, passed like attributes: <code>&lt;Product name="Pen" price={10} /&gt;</code>.',
            'A component reads them from its parameter: <code>function Product({ name, price })</code>.',
            'Props are read-only: a component must never change its own props.'],
        ['Pass any value: strings, numbers, objects, arrays and functions (callbacks).',
            'Default values with destructuring: <code>({ qty = 1 })</code>.',
            'The special <code>children</code> prop holds nested content.'],
        ['Avoid prop drilling (passing through many levels) with composition, context or state libraries.',
            'Pass stable references (memoized callbacks and objects) to memoized children to avoid needless re-renders.',
            'Validate props with TypeScript types (or PropTypes) to document and check the contract.'],
        [['F', 'What are props?', 'Inputs passed from a parent component to a child as attributes.'],
            ['F', 'Can a component change its props?', 'No, props are read-only.'],
            ['M', 'How does a child talk to the parent?', 'By calling a function passed down as a prop (callback).'],
            ['M', 'What is the children prop?', 'The content placed between a component opening and closing tags.'],
            ['S', 'What is prop drilling and how do you avoid it?', 'Passing props through many intermediate components; use composition, context or a state library.'],
            ['S', 'Why do new object props cause re-renders?', 'A new object or function each render has a new identity, so React.memo sees a changed prop; memoize with useMemo/useCallback when needed.']],
        [['Props with defaults and a callback.',
            r`function ProductCard({ name, price, qty = 1, onAdd }) {
  return (
    <div>
      <h3>{name}</h3><p>{(price * qty).toFixed(2)}</p>
      <button onClick={() => onAdd({ name, qty })}>Add</button>
    </div>
  );
}
<ProductCard name="Pen" price={10} qty={3} onAdd={item => console.log("added", item)} />

// OUTPUT: (after clicking Add)
// added { name: 'Pen', qty: 3 }`],
            ['TypeScript props.',
                r`type Props = { name: string; price: number; onAdd?: (item: { name: string }) => void };
function Product({ name, price, onAdd }: Props) { return <button onClick={() => onAdd?.({ name })}>{name} {price}</button>; }

// OUTPUT:
// compile error if a required prop is missing or has the wrong type`]],
        [['Avoid drilling with composition.',
            r`function Layout({ sidebar, children }) { return <div className="layout"><aside>{sidebar}</aside><main>{children}</main></div>; }
<Layout sidebar={<UserMenu user={user} />}><Dashboard /></Layout>

// OUTPUT:
// UserMenu receives user directly; Layout does not need to know about it`],
            ['Memoized callback prop.',
                r`const onAdd = useCallback(item => dispatch({ type: "add", item }), [dispatch]);
<MemoizedRow onAdd={onAdd} />

// OUTPUT:
// MemoizedRow does not re-render when the parent re-renders for unrelated state`]]
    ),

    'react-state-usestate': x(
        ['State is data that changes over time and makes the component re-render. <code>const [value, setValue] = useState(initial)</code>.',
            'Call the setter to update: <code>setCount(count + 1)</code>. Never change state directly.',
            'Each component instance has its own state.'],
        ['State updates are batched and applied for the next render; the old value is still visible in the current function.',
            'Use the functional form when the new value depends on the old: <code>setCount(c =&gt; c + 1)</code>.',
            'For objects and arrays create new copies (spread, map, filter) instead of mutating.'],
        ['Keep state minimal: derive values during render instead of storing duplicates.',
            'Lift state up to the nearest common parent when siblings need it; use context or a store for wide sharing.',
            '<code>useReducer</code> suits complex state transitions; lazy initial state <code>useState(() =&gt; compute())</code> avoids repeated expensive initialization.'],
        [['F', 'What does useState return?', 'A pair: the current state value and a function to update it.'],
            ['F', 'Can you change state directly (count++)?', 'No; call the setter so React knows to re-render.'],
            ['M', 'Why use the functional update form?', 'When the next state depends on the previous one, so multiple updates in one event are not lost.'],
            ['M', 'How do you update an object in state?', 'Create a new object with spread: setUser({ ...user, name: "Ravi" }).'],
            ['S', 'What does lifting state up mean?', 'Moving state to the closest common ancestor so several components can share it via props.'],
            ['S', 'When useReducer over useState?', 'For state with several related fields or many transitions, where a reducer centralizes the logic.']],
        [['Counters and functional updates.',
            r`function Counter() {
  const [n, setN] = useState(0);
  const addThree = () => { setN(n + 1); setN(n + 1); setN(n + 1); };          // adds 1 (stale n)
  const addThreeRight = () => { setN(c => c + 1); setN(c => c + 1); setN(c => c + 1); };   // adds 3
  return <><p>{n}</p><button onClick={addThree}>+3 wrong</button><button onClick={addThreeRight}>+3</button></>;
}

// OUTPUT:
// after "+3 wrong": 1      after "+3": 4`],
            ['Immutable list updates.',
                r`const [todos, setTodos] = useState([{ id: 1, text: "Learn React", done: false }]);
const add = text => setTodos([...todos, { id: Date.now(), text, done: false }]);
const toggle = id => setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
const remove = id => setTodos(todos.filter(t => t.id !== id));

// OUTPUT:
// a new array each time, so React re-renders correctly`]],
        [['Derived value instead of state.',
            r`const [items, setItems] = useState([]);
const total = items.reduce((s, i) => s + i.price * i.qty, 0);     // computed during render, not stored

// OUTPUT:
// total is always consistent with items`],
            ['useReducer.',
                r`function reducer(state, action) {
  switch (action.type) { case "add": return { ...state, items: [...state.items, action.item] }; case "clear": return { items: [] }; default: return state; }
}
const [state, dispatch] = useReducer(reducer, { items: [] });
dispatch({ type: "add", item: { id: 1 } });

// OUTPUT:
// { items: [ { id: 1 } ] }`]]
    ),

    'react-event-handling': x(
        ['Handle events with props like <code>onClick</code>, <code>onChange</code>, <code>onSubmit</code>, passing a function: <code>&lt;button onClick={save}&gt;</code>.',
            'Pass the function itself, do not call it: <code>onClick={save}</code>, not <code>onClick={save()}</code>.',
            'The handler receives a synthetic event object with <code>target</code> and <code>preventDefault()</code>.'],
        ['To pass arguments, wrap: <code>onClick={() =&gt; remove(id)}</code>.',
            'Prevent form reloads with <code>e.preventDefault()</code> in onSubmit.',
            'Event handlers can update state; avoid heavy work inside them or move it to async functions.'],
        ['React attaches events at the root and delegates; handlers run in the same batch as state updates.',
            'Avoid creating many inline handlers in huge lists when it hurts performance; use delegation or memoized items.',
            'Debounce or throttle expensive handlers (search, resize) with a timer or library.'],
        [['F', 'How do you handle a click in React?', 'Pass a function to the onClick prop.'],
            ['F', 'Why is onClick={save()} a bug?', 'It calls save during rendering and passes its result instead of passing the function.'],
            ['M', 'How do you stop a form from reloading the page?', 'Call event.preventDefault() in the onSubmit handler.'],
            ['M', 'How do you pass an argument to a handler?', 'Wrap it in an arrow function: onClick={() => remove(id)}.'],
            ['S', 'What is a synthetic event?', 'A cross-browser wrapper around the native event that React passes to handlers.'],
            ['S', 'How do you debounce a search input?', 'Store the typed value in state immediately and trigger the request from a debounced effect or callback.']],
        [['Handlers with state.',
            r`function Search() {
  const [q, setQ] = useState("");
  const onSubmit = e => { e.preventDefault(); console.log("search", q); };
  return (
    <form onSubmit={onSubmit}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" />
      <button>Go</button>
    </form>
  );
}

// OUTPUT: (typing pen and pressing Enter)
// search pen`],
            ['Passing arguments.',
                r`{items.map(i => <li key={i.id}>{i.name} <button onClick={() => remove(i.id)}>x</button></li>)}

// OUTPUT:
// clicking x removes that item`]],
        [['Common bug.',
            r`<button onClick={handleClick()}>Save</button>      // runs on render
<button onClick={handleClick}>Save</button>        // runs on click

// OUTPUT:
// the first form triggers an infinite re-render loop if handleClick sets state`],
            ['Debounced search effect.',
                r`useEffect(() => {
  const t = setTimeout(() => fetch("/api/search?q=" + encodeURIComponent(q)).then(r => r.json()).then(setResults), 300);
  return () => clearTimeout(t);
}, [q]);

// OUTPUT:
// one request 300 ms after the user stops typing`]]
    )
};

export const react1Deep: Record<string, Deep> = {
    'reactjs-intro': dv(
        [`React renders in two phases. The render phase calls your components to produce a tree of React elements (plain objects) and compares it with the previous tree (reconciliation) using type and key to decide what to keep, update or remove. The commit phase applies the minimal DOM changes and runs effects. A state update schedules a new render; React batches several updates into one.`,
            r`function Logger() {
  const [n, setN] = useState(0);
  console.log("render", n);                       // render phase: must be pure
  useEffect(() => { console.log("effect after commit", n); });
  return <button onClick={() => { setN(n + 1); setN(n + 2); }}>{n}</button>;     // batched: one render
}

// OUTPUT:
// render 0
// effect after commit 0
// (click) render 2
// effect after commit 2`],
        [`Ways to use React: a plain Vite or Create-style SPA, a framework (Next.js, Remix, Gatsby) with routing and server rendering, React Native for mobile, and libraries on top (React Router, TanStack Query, Redux Toolkit, Zustand). Rendering modes: client, server (SSR), static, and streaming with Suspense.`,
            r`// client entry
createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
// server component (Next.js app router)
export default async function Page() { const orders = await db.orders.list(); return <OrderTable orders={orders} />; }

// OUTPUT:
// client: renders in the browser   server component: HTML produced on the server, no client JavaScript for it`],
        [`Beginner mistakes: mutating state, missing keys in lists, calling hooks conditionally, doing side effects during render, infinite loops from effects that set their own dependencies, and forgetting that setState is asynchronous. Follow the rules of hooks and keep render pure.`,
            r`if (loggedIn) { const [name, setName] = useState(""); }     // hook inside a condition

// OUTPUT:
// Error: Rendered more hooks than during the previous render.

useEffect(() => { setCount(count + 1); }, [count]);        // loops forever`],
        [`Performance: measure first (React DevTools Profiler). Typical wins: stable keys, splitting components so state changes re-render less, <code>memo</code>/<code>useMemo</code>/<code>useCallback</code> for expensive or frequently re-rendered parts, list virtualization, code splitting and avoiding giant state objects.`,
            r`const Row = memo(function Row({ item, onSelect }) { return <tr onClick={() => onSelect(item.id)}><td>{item.name}</td></tr>; });
const onSelect = useCallback(id => setSelected(id), []);
<FixedSizeList height={600} itemCount={rows.length} itemSize={36}>{({ index, style }) => <Row style={style} item={rows[index]} onSelect={onSelect} />}</FixedSizeList>

// OUTPUT:
// 50,000 rows scroll smoothly because only visible rows render`],
        [`Real-world: data loading with a query library handles caching, loading and error states, so components stay simple and the UI reflects server state.`,
            r`function Orders() {
  const { data, isLoading, error } = useQuery({ queryKey: ["orders"], queryFn: () => fetch("/api/orders").then(r => r.json()) });
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Failed to load</p>;
  return <ul>{data.map(o => <li key={o.id}>{o.id}: {o.total}</li>)}</ul>;
}

// OUTPUT:
// Loading... then the list; revisiting the page shows cached data instantly`]
    ),

    'single-page-application': dv(
        [`In an SPA the server returns the same HTML shell for every route. The JavaScript bundle boots, the client router reads location.pathname, renders the matching component tree, and intercepts link clicks to call history.pushState instead of navigating. The back button fires popstate, and the router renders the previous route without a request for HTML.`,
            r`function Link({ to, children }) {
  return <a href={to} onClick={e => { e.preventDefault(); history.pushState({}, "", to); window.dispatchEvent(new PopStateEvent("popstate")); }}>{children}</a>;
}
function useRoute() { const [path, setPath] = useState(location.pathname); useEffect(() => { const f = () => setPath(location.pathname); addEventListener("popstate", f); return () => removeEventListener("popstate", f); }, []); return path; }

// OUTPUT:
// clicking a Link changes the URL and the view with no page reload (this is what React Router does for you)`],
        [`Build and deploy options: static hosting with fallback to index.html, CDN with long-lived hashed assets, server rendering for SEO-critical pages, prerendering, and hybrid frameworks (Next.js). Routing options: hash routing (works without server fallback), browser history routing (clean URLs).`,
            r`# netlify _redirects
/*    /index.html   200

# vite.config.js
export default { build: { rollupOptions: { output: { manualChunks: { vendor: ["react", "react-dom"] } } } } };

// OUTPUT:
// vendor chunk cached across releases; deep links work after refresh`],
        [`Mistakes: no server fallback (404 on refresh), a giant single bundle, relying on client-only rendering for SEO pages, forgetting document titles and focus management on navigation, and storing tokens in localStorage without considering XSS. Use code splitting, SSR for public pages and secure cookies.`,
            r`useEffect(() => { document.title = "Order " + id + " | Shop"; }, [id]);
useEffect(() => { headingRef.current?.focus(); }, [pathname]);       // announce route changes to screen readers

// OUTPUT:
// the title changes per route and keyboard focus moves to the new page heading`],
        [`SPA performance: measure Core Web Vitals; split by route, lazy load heavy libraries, preload likely next routes, compress with Brotli, cache hashed assets for a year, and avoid blocking the main thread with large JSON processing.`,
            r`const Reports = lazy(() => import("./Reports"));
<Link to="/reports" onMouseEnter={() => import("./Reports")}>Reports</Link>       // prefetch on hover
// bundle report
npx vite-bundle-visualizer

// OUTPUT:
// main 118 kB gzip, reports 46 kB loaded on demand`],
        [`Real-world: authentication in an SPA. A protected route component checks the session and redirects to login while preserving the intended URL.`,
            r`function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}
<Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />

// OUTPUT:
// anonymous visitors to /orders are sent to /login and returned to /orders after signing in`]
    ),

    'installing-node-npm': dv(
        [`Node.js is a runtime built on V8 with an event loop and system APIs. npm resolves dependency ranges (semver) from the registry into a tree in node_modules, writes exact resolved versions with integrity hashes into package-lock.json, and runs scripts defined in package.json. Tools like Vite use Node to serve and bundle your code.`,
            r`node -e "console.log(process.version, process.platform)"
npm ls react --depth=0
cat package-lock.json | head -12
npm run build

// OUTPUT:
// v20.11.1 win32
// shop@0.0.0 -> react@18.2.0
// "lockfileVersion": 3, ... "integrity": "sha512-..."`],
        [`Options: package managers npm, pnpm (content-addressable store, fast and strict), yarn; version managers nvm, fnm, Volta; <code>npx</code> to run tools; workspaces for monorepos; <code>.npmrc</code> for registries; <code>overrides</code>/<code>resolutions</code> to force versions; Corepack to pin the manager.`,
            r`corepack enable && corepack use pnpm@9
pnpm add react-router-dom && pnpm dlx create-vite
echo "20" > .nvmrc
{ "workspaces": ["apps/*", "packages/*"], "overrides": { "semver": "7.6.0" } }

// OUTPUT:
// Progress: resolved 187, reused 187, downloaded 0, added 187`],
        [`Mistakes: committing node_modules, ignoring the lockfile, installing global packages that differ per machine, running npm install in CI (use ci), mixing package managers in one repo, and trusting every dependency. Fix with a lockfile, ci, one manager, audits and version pinning.`,
            r`npm install            # in CI: may change versions
npm ci                 # exact versions from the lockfile; fails on mismatch
echo "node_modules/" >> .gitignore
npm audit signatures

// OUTPUT:
// added 187 packages in 6s  (reproducible)`],
        [`Install time and disk use: pnpm and caches speed up CI, <code>npm ci</code> with a cache directory is faster, and fewer dependencies mean faster installs and smaller attack surface. Measure bundle size and dependency count.`,
            r`npm ls --all | wc -l
npx depcheck
npx source-map-explorer dist/assets/*.js

// OUTPUT:
// 1412 packages in the tree; 6 unused dependencies found; react-dom is 38% of the bundle`],
        [`Real-world: a reproducible build pipeline pins Node, installs from the lockfile, runs tests and builds, caching the package store between runs.`,
            r`# GitHub Actions
- uses: actions/setup-node@v4
  with: { node-version: 20, cache: npm }
- run: npm ci
- run: npm test -- --run
- run: npm run build

// OUTPUT:
// build time 48 s with cache (3 min without)`]
    ),

    'jsx-syntax': dv(
        [`A build tool (Babel, SWC, esbuild) compiles JSX into calls to the JSX runtime, producing plain element objects { type, props, key }. Components are functions called by React with a props object. Children become the children prop. Because JSX is just expressions, anything JavaScript can do (map, ternary, function calls) works inside braces.`,
            r`const element = <Card title="Pen" price={10}><b>New</b></Card>;
// compiled (automatic runtime)
const element2 = jsx(Card, { title: "Pen", price: 10, children: jsx("b", { children: "New" }) });
console.log(element2.type === Card, element2.props.title);

// OUTPUT:
// true Pen`],
        [`Syntax options: fragments (<code>&lt;&gt;</code>, keyed <code>&lt;Fragment key&gt;</code>), conditional rendering (&amp;&amp;, ternary, early return), lists with keys, spread props, boolean and null children (render nothing), style objects, <code>dangerouslySetInnerHTML</code>, <code>ref</code> and <code>key</code> special props, TypeScript generics in TSX.`,
            r`function Table({ rows, selected }) {
  if (!rows.length) return <p>No rows</p>;
  return (
    <table>
      <tbody>
        {rows.map(r => (
          <Fragment key={r.id}>
            <tr className={r.id === selected ? "active" : undefined}><td>{r.name}</td></tr>
            {r.note && <tr><td colSpan={2}>{r.note}</td></tr>}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}

// OUTPUT:
// rows with optional note rows; the active row has class="active"`],
        [`Mistakes: 0 rendered by <code>{count &amp;&amp; &lt;X /&gt;}</code> (zero is printed), missing keys, objects as children (error), class instead of className, unclosed tags, and string styles. Use ternaries or Boolean(), arrays of elements, and style objects.`,
            r`{items.length && <List items={items} />}              // prints 0 when empty
{items.length > 0 && <List items={items} />}          // correct
<p>{{ a: 1 }}</p>

// OUTPUT:
// 0   (first form)
// Error: Objects are not valid as a React child (found: object with keys {a})`],
        [`JSX itself is cheap; cost comes from the number of elements rendered and reconciled. Avoid creating huge element trees on every keystroke, split components so only the changed part re-renders, and virtualize long lists.`,
            r`function Typing() {
  const [text, setText] = useState("");
  return (<><input value={text} onChange={e => setText(e.target.value)} /><ExpensiveChart data={bigData} /></>);    // chart re-renders on every key
}
const Chart = memo(ExpensiveChart);

// OUTPUT:
// with memo, typing no longer re-renders the chart`],
        [`Real-world: a reusable button component that forwards props and refs, supports variants through className and keeps accessibility attributes.`,
            r`const Button = forwardRef(function Button({ variant = "primary", loading, children, ...rest }, ref) {
  return <button ref={ref} className={"btn btn-" + variant} disabled={loading || rest.disabled} aria-busy={loading} {...rest}>{loading ? "Saving..." : children}</button>;
});
<Button variant="danger" onClick={remove} loading={saving}>Delete</Button>

// OUTPUT:
// a styled, accessible button that shows Saving... while loading`]
    ),

    'react-components': dv(
        [`Each component call is an independent unit of rendering with its own hook state, kept by React in a fiber tree. The fiber is identified by its position in the tree and its type (and key). If the type and position match between renders, state is preserved; if they differ, React unmounts the old component and mounts a new one. Rendering a component means calling the function again.`,
            r`function Panel({ showA }) {
  return showA ? <Counter /> : <Counter />;               // same type and position: state preserved
}
function Panel2({ showA }) {
  return showA ? <Counter key="a" /> : <Counter key="b" />;   // different keys: state reset
}

// OUTPUT:
// toggling Panel keeps the count; toggling Panel2 resets it to 0`],
        [`Patterns: presentational and container components, custom hooks to share logic, compound components (Tabs with Tab), render props, higher-order components, controlled vs uncontrolled components, error boundaries (class), portals, Suspense and lazy components, and context providers.`,
            r`function Tabs({ children }) { const [i, setI] = useState(0); const tabs = Children.toArray(children); return (<div><nav>{tabs.map((t, n) => <button key={n} aria-selected={n === i} onClick={() => setI(n)}>{t.props.title}</button>)}</nav>{tabs[i]}</div>); }
function Tab({ children }) { return <div>{children}</div>; }
<Tabs><Tab title="Orders">...</Tab><Tab title="Customers">...</Tab></Tabs>

class ErrorBoundary extends React.Component { state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; } render() { return this.state.failed ? <p>Something went wrong</p> : this.props.children; } }

// OUTPUT:
// tabs switch content; a render error shows the fallback instead of a blank page`],
        [`Mistakes: components that fetch and render and format everything (hard to test), mutating props, derived state copied from props (gets out of sync), deeply nested conditionals, and components defined inside components. Split by responsibility and derive instead of copying.`,
            r`function Price({ amount }) {
  const [value, setValue] = useState(amount);        // copy of a prop: ignores later changes
  return <span>{value}</span>;
}
function Price2({ amount }) { return <span>{amount.toFixed(2)}</span>; }       // derive during render

// OUTPUT:
// Price keeps showing the first amount even when the prop changes`],
        [`Re-render cost: a state change re-renders the component and its children. Co-locate state, split components, memoize expensive children and use stable props. Verify with the Profiler instead of guessing.`,
            r`const Heavy = memo(function Heavy({ data }) { /* expensive render */ return <Chart data={data} />; });
const data = useMemo(() => compute(rows), [rows]);

// OUTPUT: (Profiler)
// before: 38 ms per keystroke   after: 2 ms per keystroke`],
        [`Real-world: a design system. Small, consistent, accessible components (Button, Input, Modal, Table) used across features, with props for variants and tests for behaviour.`,
            r`function Modal({ open, title, onClose, children }) {
  useEffect(() => { if (!open) return; const f = e => e.key === "Escape" && onClose(); addEventListener("keydown", f); return () => removeEventListener("keydown", f); }, [open, onClose]);
  if (!open) return null;
  return createPortal(<div role="dialog" aria-modal="true" aria-label={title}><h2>{title}</h2>{children}<button onClick={onClose}>Close</button></div>, document.body);
}

// OUTPUT:
// an accessible modal rendered in a portal that closes on Escape`]
    ),

    'react-props': dv(
        [`Props are the first argument of a component function: a frozen plain object. When a parent re-renders, it calls the child with a new props object; the child re-renders unless wrapped in memo and all prop values are shallow-equal (Object.is). Functions and objects created inline have a new identity each render, so they look changed.`,
            r`const Child = memo(function Child({ style, onClick }) { console.log("Child render"); return <button style={style} onClick={onClick}>Go</button>; });
function Parent() {
  const [n, setN] = useState(0);
  return (<><button onClick={() => setN(n + 1)}>{n}</button><Child style={{ color: "red" }} onClick={() => {}} /></>);
}

// OUTPUT: (each click on the counter)
// Child render        (new style object and function every time: memo does not help)`],
        [`Techniques: destructuring with defaults, rest props (<code>...rest</code>) forwarded to DOM elements, <code>children</code> and render props, passing components as props, the <code>key</code> and <code>ref</code> special props, TypeScript prop types and generics, <code>defaultProps</code> replacement with default parameters, and context for deep data.`,
            r`function Input({ label, error, ...rest }) {
  return (<label>{label}<input aria-invalid={!!error} {...rest} />{error && <span role="alert">{error}</span>}</label>);
}
function List({ items, renderItem = i => i.name }) { return <ul>{items.map(i => <li key={i.id}>{renderItem(i)}</li>)}</ul>; }
<List items={products} renderItem={p => <strong>{p.name}</strong>} />

// OUTPUT:
// input receives all native attributes; list items render through the supplied function`],
        [`Mistakes: mutating props, copying props into state, passing too many props (a sign of poor boundaries), unstable object/function props to memoized children, and forgetting required props. Pass fewer, more meaningful props and use TypeScript.`,
            r`function Bad({ user }) { user.name = user.name.trim(); return <p>{user.name}</p>; }      // mutates the parent data
function Good({ user }) { return <p>{user.name.trim()}</p>; }

// OUTPUT:
// the first version changes parent state objects silently, causing hard-to-trace bugs`],
        [`To keep memoized children effective, stabilize props with useMemo/useCallback or move the creation of constants outside the component. Do this only after measuring, since memoization has its own cost.`,
            r`const style = { color: "red" };                    // module constant
function Parent() {
  const [n, setN] = useState(0);
  const onClick = useCallback(() => console.log("go"), []);
  return (<><button onClick={() => setN(n + 1)}>{n}</button><Child style={style} onClick={onClick} /></>);
}

// OUTPUT:
// Child renders once, not on every counter click`],
        [`Real-world: a data table component with a flexible API. Columns are configuration props, cell renderers are functions, and callbacks report sorting and selection to the parent.`,
            r`<DataTable rows={orders} columns={[{ key: "id", header: "#" }, { key: "total", header: "Total", render: o => "₹" + o.total.toFixed(2) }]} sort={sort} onSortChange={setSort} onRowClick={o => navigate("/orders/" + o.id)} />

// OUTPUT:
// a sortable table; clicking a row navigates to the order page`]
    ),

    'react-state-usestate': dv(
        [`useState stores a value in the component fiber, in the slot matching the call order. The setter does not change the current variable: it enqueues an update and schedules a re-render, in which the function runs again and useState returns the new value. Several updates in one event are batched. If the new value is identical (Object.is), React skips re-rendering.`,
            r`function Demo() {
  const [n, setN] = useState(0);
  function click() { setN(n + 1); console.log("n in this render:", n); setN(n + 1); }
  console.log("render", n);
  return <button onClick={click}>{n}</button>;
}

// OUTPUT: (one click)
// n in this render: 0
// render 1             (two updates batched, both based on 0)`],
        [`Variants: <code>useState(initial)</code>, lazy initializer <code>useState(() =&gt; read())</code>, functional updates, object/array state with copies, <code>useReducer</code>, <code>useRef</code> for mutable values that do not trigger renders, <code>useSyncExternalStore</code> for external stores, <code>useDeferredValue</code> and <code>useTransition</code> for non-urgent updates.`,
            r`const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") ?? "[]"));
const [isPending, startTransition] = useTransition();
const onSearch = q => { setQuery(q); startTransition(() => setResults(filterHuge(q))); };
const renderCount = useRef(0); renderCount.current++;

// OUTPUT:
// the input stays responsive while the large filter runs as a low-priority update`],
        [`Mistakes: mutating state (push, direct assignment), relying on the value right after setState, storing derived data, using index-based ids, and putting everything in one giant state object. Update immutably, use functional updates, derive values and split state.`,
            r`const [list, setList] = useState([1, 2]);
list.push(3); setList(list);               // same reference: no re-render
setList([...list, 3]);                      // new array: re-renders

// OUTPUT:
// the first form does not update the UI`],
        [`State placement affects performance: state held high re-renders the whole subtree. Keep state close to where it is used, split large objects, and use context selectors or stores (Zustand, Redux) for widely shared fast-changing state.`,
            r`function Page() { return (<><SearchBox /><ExpensiveList /></>); }       // typing state lives inside SearchBox only
function SearchBox() { const [q, setQ] = useState(""); return <input value={q} onChange={e => setQ(e.target.value)} />; }

// OUTPUT:
// typing re-renders only SearchBox, not ExpensiveList`],
        [`Real-world: a multi-step form wizard. A reducer holds the step and data, validation runs per step, and the final submission sends the combined data.`,
            r`function reducer(s, a) {
  switch (a.type) {
    case "next": return { ...s, step: s.step + 1 };
    case "back": return { ...s, step: s.step - 1 };
    case "update": return { ...s, data: { ...s.data, ...a.patch } };
    default: return s;
  }
}
const [state, dispatch] = useReducer(reducer, { step: 0, data: {} });

// OUTPUT:
// dispatch({ type: "update", patch: { email: "a@x.com" } }) merges the field into data`]
    ),

    'react-event-handling': dv(
        [`React attaches one listener per event type to the root container and dispatches synthetic events to your handlers following the component tree (capture then bubble). Handlers run inside React's batching, so state updates made in one event cause one re-render. The synthetic event wraps the native event and normalizes behaviour across browsers.`,
            r`function Parent() {
  return (
    <div onClickCapture={() => console.log("parent capture")} onClick={() => console.log("parent bubble")}>
      <button onClick={e => { console.log("button"); e.stopPropagation(); }}>Click</button>
    </div>
  );
}

// OUTPUT: (click the button)
// parent capture
// button          (stopPropagation prevents "parent bubble")`],
        [`Handler forms: inline arrows, named functions, handlers created by factory functions (<code>onChange={handle("name")}</code>), event delegation by <code>data-</code> attributes, refs and native listeners for non-React events, <code>useEffectEvent</code> (new) for stable event callbacks in effects, and async handlers with loading state.`,
            r`const handle = field => e => setForm(f => ({ ...f, [field]: e.target.value }));
<input value={form.name} onChange={handle("name")} />
<ul onClick={e => { const id = e.target.closest("li")?.dataset.id; if (id) select(id); }}>{items.map(i => <li key={i.id} data-id={i.id}>{i.name}</li>)}</ul>
async function save() { setSaving(true); try { await api.save(form); } finally { setSaving(false); } }

// OUTPUT:
// one change handler for many fields; one delegated click handler for a list`],
        [`Mistakes: calling the handler during render, losing this in class components, stale values in handlers (closures over old state), async handlers without error handling, and attaching document listeners without cleanup. Use functional updates, try/catch/finally and effect cleanup.`,
            r`function Timer() {
  const [n, setN] = useState(0);
  const start = () => setInterval(() => setN(n + 1), 1000);        // n is captured as 0 forever
  const startRight = () => setInterval(() => setN(c => c + 1), 1000);
}

// OUTPUT:
// the first counter stops at 1; the second counts correctly`],
        [`Frequent events (mousemove, scroll, input) can flood renders. Throttle, debounce, use passive listeners, move heavy work off the handler (startTransition, workers) and avoid state updates for values that need no re-render (use refs).`,
            r`const last = useRef(0);
const onMove = e => { const now = performance.now(); if (now - last.current < 16) return; last.current = now; setPos({ x: e.clientX, y: e.clientY }); };

// OUTPUT:
// at most one state update per frame`],
        [`Real-world: a keyboard-accessible autocomplete. Arrow keys move the highlighted option, Enter selects, Escape closes, and focus and ARIA attributes stay in sync.`,
            r`function onKeyDown(e) {
  if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, options.length - 1)); }
  else if (e.key === "ArrowUp") { e.preventDefault(); setActive(i => Math.max(i - 1, 0)); }
  else if (e.key === "Enter" && options[active]) { onSelect(options[active]); setOpen(false); }
  else if (e.key === "Escape") setOpen(false);
}
<input role="combobox" aria-expanded={open} aria-activedescendant={"opt-" + active} onKeyDown={onKeyDown} />

// OUTPUT:
// full keyboard control of the suggestions list`]
    )
};
