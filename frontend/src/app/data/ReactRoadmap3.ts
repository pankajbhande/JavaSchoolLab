// React roadmap, part 3: phases 11-16 (Context and state management, performance, testing, security and accessibility,
// advanced rendering, deployment and monitoring).
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';
import { reactExamples } from './RoadmapExamples2';

const rp = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('rr', n, title, priority, topics);

const reactRoadmap3Base: SubTopic[] = [
  rp(11, 'Context and State Management', 'Important', [
    topic(
      'rr-context-patterns',
      'Context API: Patterns and Pitfalls',
      [
        blk(`<h3>Sharing data without prop drilling</h3>
• <b>Context</b> lets a value be read by any component below a <code>Provider</code>, without passing props through every level. Good for values many components need and that change rarely: theme, current user, language, feature flags.<br>
• Three steps: <code>createContext(default)</code>, wrap a subtree in <code>&lt;Ctx.Provider value={...}&gt;</code>, read with <code>useContext(Ctx)</code>.<br>
• Wrap it in a custom hook (<code>useTheme()</code>) and a provider component (<code>ThemeProvider</code>) to keep the API tidy.`,
          `import { createContext, useContext, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggle = () => setTheme(t => (t === "light" ? "dark" : "light"));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

function ThemeButton() {
  const { theme, toggle } = useTheme();            // no props passed through Layout/Header
  return <button onClick={toggle}>Theme: {theme}</button>;
}
export default function App() {
  return <ThemeProvider><Layout><ThemeButton /></Layout></ThemeProvider>;
}`,
        ),
      ],
      [
        blk(`<h3>The re-render pitfall and how to avoid it</h3>
• Every consumer re-renders whenever the Provider's <code>value</code> changes by reference. An inline object <code>value={{ user, login }}</code> is a new object on every Provider render, so all consumers re-render even if nothing changed.<br>
• Fixes: <code>useMemo</code> the value; <b>split contexts</b> (state context vs actions/dispatch context, or one context per concern); keep frequently changing state out of Context (use a store).<br>
• Context is not a state manager: it only transports a value. Pair it with <code>useState</code>/<code>useReducer</code>.`,
          `function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async creds => setUser(await api.post("/api/auth/login", creds)), []);
  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);   // stable unless user changes
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Split state and dispatch so components that only dispatch never re-render on state changes
const CartStateContext = createContext([]);
const CartDispatchContext = createContext(() => {});
function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, []);
  return (
    <CartDispatchContext.Provider value={dispatch}>
      <CartStateContext.Provider value={cart}>{children}</CartStateContext.Provider>
    </CartDispatchContext.Provider>
  );
}
const AddToCart = () => { const dispatch = useContext(CartDispatchContext); return <button onClick={() => dispatch({ type: "add" })}>Add</button>; };`,
        ),
      ],
      [
        blk(`<h3>When Context is the wrong tool</h3>
• High-frequency updates (mouse position, form keystrokes, animation) re-render every consumer: use local state, a store with selectors (Zustand, Redux) or refs.<br>
• Server data belongs in TanStack Query, not Context.<br>
• Context defaults only apply when there is <em>no</em> Provider above; use <code>null</code> plus a throwing hook to detect missing providers.<br>
• Multiple providers nest ("provider hell"): compose them into one <code>AppProviders</code> component.<br>
• Since React 19 you can render <code>&lt;ThemeContext value={...}&gt;</code> directly and read context with <code>use(Ctx)</code>, even conditionally.`,
          `export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// React 19
import { use } from "react";
function Panel({ show }) {
  if (!show) return null;
  const theme = use(ThemeContext);              // allowed after an early return, unlike useContext
  return <div className={theme}>...</div>;
}`,
        ),
      ],
      [
        ['What is Context for?', 'Passing values (theme, user, locale) to many components in a subtree without threading props through every level. It transports a value; state still lives in useState/useReducer.'],
        ['Why do all consumers re-render when a Provider value changes?', 'Context compares the value by reference. A new object each render counts as a change, so every consumer re-renders. Memoise the value and split contexts to limit this.'],
        ['When would you choose Redux/Zustand over Context?', 'For large, frequently updated shared state, when you need selectors (re-render only what changed), middleware, dev tools and a predictable update flow.'],
      ],
    ),
    topic(
      'rr-redux-toolkit',
      'Redux Toolkit: Slices, Store and Async Thunks',
      [
        blk(`<h3>Why a store?</h3>
• Redux keeps global state in one <b>store</b>, changed only by dispatching <b>actions</b> processed by <b>reducers</b>. It gives predictable updates, great dev tools (time travel) and a clear data flow for large apps.<br>
• <b>Redux Toolkit (RTK)</b> is the official, modern way: less boilerplate, Immer built in (write "mutating" code), good defaults. Install: <code>npm i @reduxjs/toolkit react-redux</code>.<br>
• Three pieces: <code>configureStore</code>, <code>createSlice</code>, <code>Provider</code> + hooks <code>useSelector</code>/<code>useDispatch</code>.`,
          `// store/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    added(state, action) {                          // "mutation" is safe: Immer produces a new state
      const found = state.items.find(i => i.id === action.payload.id);
      if (found) found.qty += 1; else state.items.push({ ...action.payload, qty: 1 });
    },
    removed(state, action) { state.items = state.items.filter(i => i.id !== action.payload); },
    cleared: state => { state.items = []; },
  },
});
export const { added, removed, cleared } = cartSlice.actions;
export default cartSlice.reducer;

// store/index.js
import { configureStore } from "@reduxjs/toolkit";
export const store = configureStore({ reducer: { cart: cartReducer } });

// main.jsx
import { Provider } from "react-redux";
createRoot(root).render(<Provider store={store}><App /></Provider>);`,
        ),
      ],
      [
        blk(`<h3>Using the store in components</h3>
• <code>useSelector(state =&gt; state.cart.items)</code> subscribes the component to that slice of state and re-renders only when the selected value changes. Select the <b>smallest</b> value you need.<br>
• <code>useDispatch()</code> returns <code>dispatch</code>; call <code>dispatch(added(product))</code>.<br>
• Derived values: write selector functions (and memoise with <code>createSelector</code>) rather than storing totals in state.<br>
• Keep state <b>serialisable</b> (no Dates, functions, class instances).`,
          `import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import { added, removed } from "./store/cartSlice";

const selectItems = state => state.cart.items;
const selectTotal = createSelector([selectItems], items => items.reduce((s, i) => s + i.price * i.qty, 0));

function CartBadge() {
  const count = useSelector(state => state.cart.items.length);       // re-renders only when length changes
  return <span>{count}</span>;
}
function CartTotal() {
  const total = useSelector(selectTotal);
  return <p>Total: ₹{total}</p>;
}
function ProductCard({ product }) {
  const dispatch = useDispatch();
  return <button onClick={() => dispatch(added(product))}>Add {product.name}</button>;
}`,
        ),
      ],
      [
        blk(`<h3>Async logic: thunks and RTK Query</h3>
• <code>createAsyncThunk</code> wraps an async function and dispatches <code>pending</code>/<code>fulfilled</code>/<code>rejected</code> actions you handle in <code>extraReducers</code>.<br>
• <b>RTK Query</b> (<code>createApi</code>) is built-in data fetching and caching, like TanStack Query: generated hooks, cache invalidation by tags, optimistic updates.<br>
• Decision guide: server data → RTK Query or TanStack Query; shared client state → slices; local UI state → <code>useState</code>. Do not put everything in Redux.`,
          `import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchTasks = createAsyncThunk("tasks/fetch", async (_, { rejectWithValue }) => {
  try { return await api.get("/api/tasks"); }
  catch (e) { return rejectWithValue(e.message); }
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState: { items: [], status: "idle", error: null },
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchTasks.pending, s => { s.status = "loading"; })
    .addCase(fetchTasks.fulfilled, (s, a) => { s.status = "succeeded"; s.items = a.payload; })
    .addCase(fetchTasks.rejected, (s, a) => { s.status = "failed"; s.error = a.payload; }),
});

// RTK Query alternative
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "/api", credentials: "include" }),
  tagTypes: ["Task"],
  endpoints: b => ({
    getTasks: b.query({ query: () => "/tasks", providesTags: ["Task"] }),
    addTask: b.mutation({ query: body => ({ url: "/tasks", method: "POST", body }), invalidatesTags: ["Task"] }),
  }),
});
export const { useGetTasksQuery, useAddTaskMutation } = apiSlice;`,
        ),
      ],
      [
        ['What does Redux Toolkit add over plain Redux?', 'Less boilerplate and safer defaults: configureStore with dev tools and middleware, createSlice (actions and reducers together), Immer for simple immutable updates, createAsyncThunk and RTK Query for async work.'],
        ['Why is mutating state inside createSlice reducers allowed?', 'Reducers receive an Immer draft. Immer records the changes and produces a new immutable state, so the code looks mutating but never mutates the real state.'],
        ['useSelector pitfalls?', 'Selecting a new object/array on every call (e.g. state.items.filter(...)) makes the component re-render every time. Select primitives or memoise derived data with createSelector.'],
      ],
    ),
    topic(
      'rr-zustand-storage',
      'Zustand, Local Storage and Session Storage',
      [
        blk(`<h3>Zustand: a small store</h3>
• <b>Zustand</b> is a minimal store with no providers and no boilerplate: <code>create((set) =&gt; ({...}))</code> returns a hook. Components subscribe with a <b>selector</b> and re-render only when the selected value changes.<br>
• Great for mid-size apps where Redux feels heavy and Context re-renders too much.`,
          `import { create } from "zustand";

export const useCart = create(set => ({
  items: [],
  add: product => set(state => ({ items: [...state.items, product] })),
  remove: id => set(state => ({ items: state.items.filter(i => i.id !== id) })),
  clear: () => set({ items: [] }),
}));

function CartCount() {
  const count = useCart(s => s.items.length);        // subscribes to the length only
  return <span>{count}</span>;
}
function AddButton({ product }) {
  const add = useCart(s => s.add);
  return <button onClick={() => add(product)}>Add</button>;
}`,
        ),
      ],
      [
        blk(`<h3>Local Storage and Session Storage</h3>
• <code>localStorage</code> persists until cleared (shared across tabs of the origin); <code>sessionStorage</code> lasts for one tab session. Both store <b>strings</b> (about 5 MB) and are synchronous: <code>setItem</code>, <code>getItem</code>, <code>removeItem</code>.<br>
• Wrap access in <code>try/catch</code> (private mode, quota) and <code>JSON.parse</code> safely. Initialise state lazily: <code>useState(() =&gt; read())</code>.<br>
• <b>Never store secrets</b> (tokens, passwords): any XSS can read them. Use it for preferences, drafts and non-sensitive cache.<br>
• Sync across tabs with the <code>storage</code> event.`,
          `function usePersistentState(key, initial, storage = localStorage) {
  const [value, setValue] = useState(() => {
    try { const raw = storage.getItem(key); return raw === null ? initial : JSON.parse(raw); }
    catch { return initial; }
  });
  useEffect(() => {
    try { storage.setItem(key, JSON.stringify(value)); } catch { /* quota or blocked: ignore */ }
  }, [key, value, storage]);

  useEffect(() => {                                       // update when another tab changes the key
    const onStorage = e => { if (e.key === key && e.newValue !== null) setValue(JSON.parse(e.newValue)); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key]);
  return [value, setValue];
}

const [theme, setTheme] = usePersistentState("theme", "light");
const [draft, setDraft] = usePersistentState("post-draft", "", sessionStorage);   // gone when the tab closes`,
        ),
      ],
      [
        blk(`<h3>Persisting stores and choosing a strategy</h3>
• Zustand and Redux have persistence helpers: <code>persist</code> middleware (Zustand) and <code>redux-persist</code>. Persist only the slices you need and add a <b>version</b> with a migration so old saved data does not crash a new release.<br>
• For larger offline data use <b>IndexedDB</b> (idb, Dexie); for URL-shareable state use search params.<br>
• <b>Decision guide</b>: local UI state → <code>useState</code>; shared client state → Context/Zustand/Redux; server state → TanStack Query/RTK Query; URL state → router; persistent preferences → storage via a store.`,
          `import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSettings = create(
  persist(
    set => ({
      theme: "light", fontSize: 16,
      setTheme: theme => set({ theme }),
      setFontSize: fontSize => set({ fontSize }),
    }),
    {
      name: "settings",                                  // localStorage key
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: s => ({ theme: s.theme, fontSize: s.fontSize }),   // do not persist functions or secrets
      migrate: (old, version) => (version < 2 ? { ...old, fontSize: 16 } : old),
    },
  ),
);`,
        ),
      ],
      [
        ['localStorage vs sessionStorage?', 'localStorage persists across browser sessions and is shared between tabs of the same origin; sessionStorage is per tab and cleared when the tab closes. Both store strings only.'],
        ['Why not store a JWT in localStorage?', 'Any script on the page (including injected via XSS) can read localStorage. Prefer HttpOnly, Secure, SameSite cookies or keep short-lived access tokens in memory.'],
        ['How do you choose between Context, Zustand and Redux?', 'Context for rarely changing values; Zustand for simple shared state with selectors; Redux Toolkit for large apps needing strict structure, middleware and dev tools. Server data goes to a data-fetching library.'],
      ],
    ),
  ]),

  rp(12, 'Performance Optimization', 'Important', [
    topic(
      'rr-rerender-memo',
      'Component Re-rendering and React.memo',
      [
        blk(`<h3>When does a component re-render?</h3>
• A component re-renders when its <b>state</b> changes, when its <b>parent re-renders</b> (even if its props are identical), or when a <b>context</b> it reads changes.<br>
• Re-rendering means calling the function again to compute JSX; React then diffs and updates only changed DOM. Most re-renders are cheap and fine.<br>
• Find real problems first: React DevTools <b>Profiler</b> ("Highlight updates", flamegraph) and the browser Performance tab. Optimise what is measurably slow.`,
          `function Parent() {
  const [count, setCount] = useState(0);
  console.log("Parent render");
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Clicked {count}</button>
      <ExpensiveChart data={bigData} />        {/* re-renders on every click even though its props did not change */}
    </>
  );
}
function ExpensiveChart({ data }) {
  console.log("Chart render");                 // logs on every parent render
  return <canvas />;
}`,
        ),
      ],
      [
        blk(`<h3>React.memo and stable props</h3>
• <code>React.memo(Component)</code> skips re-rendering when the props are shallowly equal to last time.<br>
• It only helps if props are <b>stable</b>: object, array and function props created inline are new each render and defeat memo. Stabilise with <code>useMemo</code>/<code>useCallback</code>, or move constants outside the component.<br>
• Memoise components that are expensive to render, rendered many times (list rows) or deep in the tree. Do not wrap everything: comparing props has a cost.<br>
• A custom comparison function is the second argument, but is rarely needed.`,
          `import { memo, useCallback, useMemo, useState } from "react";

const ExpensiveChart = memo(function ExpensiveChart({ data }) {
  console.log("Chart render");                // only when data changes
  return <canvas />;
});

const Row = memo(function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function Parent({ items }) {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const onSelect = useCallback(id => setSelected(id), []);            // stable function identity
  const config = useMemo(() => ({ color: "blue", width: 400 }), []);   // stable object identity
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <ExpensiveChart data={items} config={config} />
      <ul>{items.map(i => <Row key={i.id} item={i} onSelect={onSelect} />)}</ul>
    </>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Structural fixes before memoising</h3>
• <b>Move state down</b>: put state in the smallest component that needs it so siblings are unaffected.<br>
• <b>Lift content up</b> (children as props): a component that receives <code>children</code> does not re-render those children when its own state changes, because the elements were created by the parent.<br>
• <b>Split context</b> and use selectors in stores.<br>
• <b>React Compiler</b> (React 19+) can memoise automatically at build time; write straightforward, pure code and let it help.`,
          `// Before: typing in the input re-renders the slow list
function Page() {
  const [text, setText] = useState("");
  return (<><input value={text} onChange={e => setText(e.target.value)} /><SlowList /></>);
}

// After: state moved into its own component
function SearchInput() {
  const [text, setText] = useState("");
  return <input value={text} onChange={e => setText(e.target.value)} />;
}
function PageFast() { return (<><SearchInput /><SlowList /></>); }     // SlowList no longer re-renders

// Children trick: Box re-renders on mouse move, children do not
function MouseBox({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return <div onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}>{pos.x},{pos.y}{children}</div>;
}
<MouseBox><SlowList /></MouseBox>;`,
        ),
      ],
      [
        ['What triggers a re-render in React?', 'A state change in the component, a re-render of its parent, or a change in a context value it consumes. Props changing is a consequence of the parent re-rendering.'],
        ['When does React.memo not help?', 'When props change every render (inline objects/functions, new arrays). Then the shallow comparison always fails and the comparison cost is wasted. Stabilise props or fix the component structure.'],
        ['How do you find performance problems in React?', 'Use the React DevTools Profiler to see which components render and why, and the browser Performance tab to see long tasks; measure before and after optimising.'],
      ],
    ),
    topic(
      'rr-lazy-suspense-splitting',
      'Lazy Loading, Suspense and Code Splitting',
      [
        blk(`<h3>Ship less JavaScript up front</h3>
• A big bundle delays the first screen. <b>Code splitting</b> breaks the app into chunks that load on demand. The bundler (Vite/Rollup, webpack) creates a chunk for every dynamic <code>import()</code>.<br>
• <code>React.lazy(() =&gt; import("./Reports"))</code> declares a lazily loaded component; wrap it in <code>&lt;Suspense fallback&gt;</code> to show a placeholder while the chunk downloads.<br>
• Split by <b>route</b> first (biggest win), then by heavy widgets (charts, editors, maps).`,
          `import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Reports = lazy(() => import("./pages/Reports"));        // its own chunk, fetched on first visit
const Editor = lazy(() => import("./components/RichTextEditor"));

export default function App() {
  return (
    <Suspense fallback={<p>Loading page...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />                   {/* in the main bundle */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Suspense boundaries, prefetching and error handling</h3>
• Place <code>Suspense</code> boundaries around the parts that load independently so one slow chunk does not blank the whole page; nest them for progressive reveal.<br>
• <b>Prefetch</b> likely next chunks: call the import on hover/focus (<code>onMouseEnter</code>) or when idle, so navigation feels instant.<br>
• Pair with an <b>error boundary</b>: a failed chunk download (offline, new deploy) throws, and you should offer a retry or reload.<br>
• Lazy components must be <b>default exports</b> (or re-export them as default).`,
          `const loadReports = () => import("./pages/Reports");
const Reports = lazy(loadReports);

function NavLinkWithPrefetch() {
  return <Link to="/reports" onMouseEnter={loadReports} onFocus={loadReports}>Reports</Link>;   // chunk is ready before the click
}

function Page() {
  return (
    <ErrorBoundary fallback={<button onClick={() => location.reload()}>Could not load. Retry</button>}>
      <Suspense fallback={<Skeleton />}>
        <Reports />
        <Suspense fallback={<p>Loading comments...</p>}>
          <Comments />                                          {/* revealed independently */}
        </Suspense>
      </Suspense>
    </ErrorBoundary>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Analysing and shrinking the bundle</h3>
• Measure with a visualiser (<code>rollup-plugin-visualizer</code>, <code>source-map-explorer</code>) to see what is big. Typical culprits: moment.js (use date-fns/Day.js), whole lodash (import functions), icon libraries (import individual icons), duplicate versions of a library.<br>
• <b>Tree shaking</b> removes unused exports from ES modules; import named exports, avoid side-effect-heavy barrels.<br>
• Configure <code>manualChunks</code> to separate vendor libraries that rarely change, so browsers cache them across deploys.<br>
• Compress (Brotli/gzip) and cache hashed assets for a year with <code>Cache-Control: immutable</code>.`,
          `// vite.config.js
import { visualizer } from "rollup-plugin-visualizer";
export default defineConfig({
  plugins: [react(), visualizer({ open: true, gzipSize: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],     // cached across deploys
          charts: ["recharts"],
        },
      },
    },
  },
});

// Import only what you use
import debounce from "lodash/debounce";            // not: import _ from "lodash"
import { format } from "date-fns";                  // not: import moment from "moment"

// nginx: cache hashed files forever, never cache index.html
// location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
// location = /index.html { add_header Cache-Control "no-cache"; }`,
        ),
      ],
      [
        ['What is code splitting?', 'Dividing the bundle into chunks loaded on demand, usually via dynamic import(), so users download only the code needed for the current page.'],
        ['What does Suspense do with React.lazy?', 'While the lazy component\'s chunk is loading, Suspense renders the fallback UI; when the chunk arrives it renders the component.'],
        ['How do you reduce bundle size?', 'Split by route, import only what you use (tree shaking, per-function imports), replace heavy libraries, analyse the bundle with a visualiser, compress assets and cache hashed files long-term.'],
      ],
    ),
    topic(
      'rr-performance-practices',
      'Performance Practices: Lists, Transitions, Images and Web Vitals',
      [
        blk(`<h3>Big lists and expensive renders</h3>
• Rendering thousands of rows is slow regardless of memoisation. <b>Virtualise</b>: render only the visible rows (<code>react-window</code>, <code>@tanstack/react-virtual</code>). Paginate on the server when possible.<br>
• Use stable <code>key</code>s, avoid creating components in render, and keep render functions cheap (move heavy computation into <code>useMemo</code> or a Web Worker).<br>
• Avoid anonymous function props to memoised children and avoid copying large arrays unnecessarily.`,
          `import { FixedSizeList } from "react-window";

function BigList({ items }) {
  return (
    <FixedSizeList height={400} width="100%" itemCount={items.length} itemSize={36}>
      {({ index, style }) => <div style={style}>{items[index].name}</div>}   {/* only ~12 rows exist in the DOM */}
    </FixedSizeList>
  );
}

const sorted = useMemo(() => [...items].sort(byName), [items]);    // computed only when items change`,
        ),
      ],
      [
        blk(`<h3>Keeping the UI responsive: transitions and debouncing</h3>
• <code>useTransition</code> marks a state update as <b>non-urgent</b>: React keeps the UI responsive (typing, clicking) and renders the heavy update in the background, with <code>isPending</code> for feedback.<br>
• <code>useDeferredValue(value)</code> gives a lagging copy of a value for expensive subtrees.<br>
• <b>Debounce</b> network calls and expensive filters; <b>throttle</b> scroll/resize handlers; use <code>requestAnimationFrame</code> for visual updates.`,
          `import { useDeferredValue, useMemo, useState, useTransition } from "react";

function SearchPage({ items }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);                          // input stays instant, list updates when idle
  const results = useMemo(() => items.filter(i => i.toLowerCase().includes(deferred.toLowerCase())), [items, deferred]);
  return (<><input value={query} onChange={e => setQuery(e.target.value)} /><ResultList results={results} /></>);
}

function Tabs() {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <button onClick={() => startTransition(() => setTab("reports"))}>Reports {isPending && "..."}</button>
      {tab === "reports" ? <HeavyReports /> : <Home />}
    </>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Images, fonts, network and Core Web Vitals</h3>
• <b>Core Web Vitals</b>: LCP (loading, aim under 2.5 s), INP (interaction latency, under 200 ms), CLS (layout shift, under 0.1). Measure with Lighthouse, PageSpeed Insights and the <code>web-vitals</code> library.<br>
• Images: modern formats (AVIF/WebP), correct sizes and <code>width</code>/<code>height</code> (prevents layout shift), <code>loading="lazy"</code> below the fold, <code>fetchpriority="high"</code> for the hero image.<br>
• Fonts: <code>font-display: swap</code>, self-host, preload the critical font.<br>
• Network: HTTP caching, CDN, compression, avoid request waterfalls (fetch in parallel, prefetch), and use a service worker for repeat visits.`,
          `import { onLCP, onINP, onCLS } from "web-vitals";
const send = metric => navigator.sendBeacon("/api/vitals", JSON.stringify(metric));
onLCP(send); onINP(send); onCLS(send);

function Hero() {
  return (
    // width/height reserve space (no layout shift); fetchpriority loads it first
    <img src="/hero.avif" width="1200" height="600" alt="Students learning to code"
         fetchpriority="high" decoding="async" />
  );
}
function Thumb({ src, alt }) {
  return <img src={src} width="320" height="180" alt={alt} loading="lazy" decoding="async" />;
}

// Fetch in parallel, not one after another (waterfall)
const [user, courses] = await Promise.all([api.get("/api/me"), api.get("/api/courses")]);`,
        ),
      ],
      [
        ['What is list virtualisation?', 'Rendering only the rows currently visible (plus a small buffer) and recycling them while scrolling, so very long lists keep a small DOM and stay fast.'],
        ['What does useTransition do?', 'Marks a state update as non-urgent so React can keep the UI responsive to urgent updates (typing, clicks) while rendering the heavy update in the background; isPending shows progress.'],
        ['What are Core Web Vitals?', 'LCP (loading speed of main content), INP (responsiveness to interactions) and CLS (visual stability): the user-centred metrics used to measure real-world performance.'],
      ],
    ),
  ]),

  rp(13, 'Testing', 'Essential for production', [
    topic(
      'rr-test-rtl',
      'Testing Components with Vitest and React Testing Library',
      [
        blk(`<h3>Why and how we test</h3>
• Tests catch regressions and let you refactor safely. The pyramid: many fast <b>unit</b> tests, fewer <b>integration</b>/component tests, a few <b>end-to-end</b> tests.<br>
• <b>Vitest</b> (Vite-native, Jest-compatible API) runs the tests; <b>React Testing Library (RTL)</b> renders components and queries them like a user would. Test <b>behaviour</b> (what the user sees and does), not implementation details (state variables, internal methods).<br>
• Setup: <code>npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom</code>.`,
          `// vite.config.js
export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: "./src/test/setup.js" },
});

// src/test/setup.js
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(() => cleanup());

// package.json: "test": "vitest", "coverage": "vitest run --coverage"`,
        ),
      ],
      [
        blk(`<h3>Writing a component test</h3>
• <b>Arrange</b> (render), <b>Act</b> (user events), <b>Assert</b> (what is on screen).<br>
• Query priority (best to worst): <code>getByRole</code> (with <code>name</code>), <code>getByLabelText</code>, <code>getByPlaceholderText</code>, <code>getByText</code>, then <code>getByTestId</code> as a last resort. This also verifies accessibility.<br>
• <code>getBy*</code> throws if missing, <code>queryBy*</code> returns null (use to assert absence), <code>findBy*</code> waits (async).<br>
• Use <code>userEvent</code> (realistic typing/clicking) instead of <code>fireEvent</code>.`,
          `// Counter.jsx
export default function Counter({ initial = 0 }) {
  const [count, setCount] = useState(initial);
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
      <button onClick={() => setCount(0)} disabled={count === 0}>Reset</button>
    </div>
  );
}

// Counter.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Counter from "./Counter";

describe("Counter", () => {
  it("starts at the initial value", () => {
    render(<Counter initial={5} />);
    expect(screen.getByText("Count: 5")).toBeInTheDocument();
  });
  it("increments and enables reset", async () => {
    const user = userEvent.setup();
    render(<Counter />);
    expect(screen.getByRole("button", { name: /reset/i })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /increment/i }));
    expect(screen.getByText("Count: 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset/i })).toBeEnabled();
  });
});`,
        ),
      ],
      [
        blk(`<h3>Testing forms and callbacks</h3>
• Pass <code>vi.fn()</code> mocks as callback props and assert on calls: <code>expect(onSubmit).toHaveBeenCalledWith({...})</code>.<br>
• For validation, assert that error messages appear (<code>findByRole("alert")</code>) and that the callback was <b>not</b> called.<br>
• Prefer testing through the public UI: type into labelled inputs, click the submit button.<br>
• Snapshot tests are brittle; use them sparingly for small, stable output.`,
          `import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, it, expect } from "vitest";
import LoginForm from "./LoginForm";

it("shows a validation error and does not submit invalid input", async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "not-an-email");
  await user.click(screen.getByRole("button", { name: /log in/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent(/valid email/i);
  expect(onSubmit).not.toHaveBeenCalled();
});

it("submits valid credentials", async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<LoginForm onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText(/email/i), "asha@example.com");
  await user.type(screen.getByLabelText(/password/i), "secret123");
  await user.click(screen.getByRole("button", { name: /log in/i }));
  expect(onSubmit).toHaveBeenCalledWith({ email: "asha@example.com", password: "secret123" });
});`,
        ),
      ],
      [
        ['What does React Testing Library encourage?', 'Testing from the user\'s point of view: render the component, find elements by role/label/text, interact with userEvent and assert on visible output rather than on internal state.'],
        ['getBy vs queryBy vs findBy?', 'getBy* throws if nothing matches, queryBy* returns null (use for asserting absence), findBy* returns a promise that waits for the element (use for async UI).'],
        ['Why prefer getByRole?', 'It mirrors how assistive technologies see the page, so tests double as accessibility checks and survive markup refactors.'],
      ],
    ),
    topic(
      'rr-test-mocking-hooks',
      'Mocking APIs with MSW, Testing Hooks, Router and Context',
      [
        blk(`<h3>Mock the network, not the component</h3>
• <b>MSW (Mock Service Worker)</b> intercepts HTTP requests at the network level and returns fake responses. Your component code (fetch/axios/TanStack Query) stays untouched, so the test exercises real integration.<br>
• Define handlers per endpoint; override them in a single test to simulate errors (500, network failure) and empty data.<br>
• Test all four states: loading, success, empty, error.`,
          `// src/test/server.js
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => HttpResponse.json([{ id: 1, name: "Asha" }, { id: 2, name: "Ravi" }])),
];
export const server = setupServer(...handlers);

// setup.js
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// UserList.test.jsx
it("renders users from the API", async () => {
  render(<UserList />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(await screen.findByText("Asha")).toBeInTheDocument();
});

it("shows an error when the server fails", async () => {
  server.use(http.get("/api/users", () => new HttpResponse(null, { status: 500 })));   // override for this test
  render(<UserList />);
  expect(await screen.findByRole("alert")).toHaveTextContent(/could not load/i);
});`,
        ),
      ],
      [
        blk(`<h3>Wrapping with providers: Router, Query, Context</h3>
• Components that use <code>useNavigate</code>, <code>useQuery</code> or <code>useContext</code> need their providers in tests. Write a <b>custom render</b> helper that wraps the UI in <code>MemoryRouter</code>, a fresh <code>QueryClient</code> (retry off) and your context providers.<br>
• Use <code>MemoryRouter initialEntries={["/courses/5"]}</code> to start at a route and assert on navigation by checking what renders.<br>
• Create a new <code>QueryClient</code> per test to avoid cache leaking between tests.`,
          `// src/test/utils.jsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithProviders(ui, { route = "/", user = null } = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={{ user, loading: false, login: vi.fn(), logout: vi.fn() }}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

it("redirects anonymous users to the login page", () => {
  renderWithProviders(<AppRoutes />, { route: "/dashboard", user: null });
  expect(screen.getByRole("heading", { name: /log in/i })).toBeInTheDocument();
});`,
        ),
      ],
      [
        blk(`<h3>Testing custom hooks and async behaviour</h3>
• <code>renderHook</code> runs a hook inside a test component. Call state-changing functions inside <code>act()</code> and read <code>result.current</code>.<br>
• For timers (debounce) use fake timers: <code>vi.useFakeTimers()</code> and <code>vi.advanceTimersByTime(300)</code>.<br>
• Use <code>waitFor</code> for assertions that become true later; never use arbitrary <code>setTimeout</code> sleeps in tests.<br>
• Keep tests independent, fast and deterministic: no real network, no shared mutable state.`,
          `import { renderHook, act } from "@testing-library/react";
import { vi, it, expect } from "vitest";

it("useCounter increments", () => {
  const { result } = renderHook(() => useCounter(10));
  act(() => result.current.increment());
  expect(result.current.count).toBe(11);
});

it("useDebounce delays the value", () => {
  vi.useFakeTimers();
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: "a" } });
  rerender({ v: "ab" });
  expect(result.current).toBe("a");                    // not yet
  act(() => vi.advanceTimersByTime(300));
  expect(result.current).toBe("ab");
  vi.useRealTimers();
});`,
        ),
      ],
      [
        ['Why use MSW instead of mocking fetch?', 'MSW intercepts requests at the network layer, so the app uses its real fetch/axios code paths. Handlers are reusable across tests, the browser and Storybook, and are easy to override for error cases.'],
        ['How do you test a component that uses React Router or Context?', 'Wrap it with the needed providers in a custom render helper (MemoryRouter, QueryClientProvider, context providers), starting at a specific route if needed.'],
        ['How do you test a custom hook?', 'Use renderHook, wrap state updates in act(), assert on result.current, and use fake timers or waitFor for time-based behaviour.'],
      ],
    ),
    topic(
      'rr-test-e2e-ci',
      'End-to-End Tests, Coverage and Continuous Integration',
      [
        blk(`<h3>End-to-end tests with Playwright</h3>
• E2E tests drive a real browser through complete user journeys (sign up, add to cart, pay) against a running app and test API. They catch integration problems unit tests cannot, but are slower and more fragile: cover the <b>critical paths only</b>.<br>
• <b>Playwright</b> auto-waits for elements, runs Chromium/Firefox/WebKit, records traces and screenshots on failure. Use role/label locators, not CSS selectors.`,
          `// e2e/login.spec.js
import { test, expect } from "@playwright/test";

test("user can log in and see the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("asha@example.com");
  await page.getByLabel("Password").fill("secret123");
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole("heading", { name: "My courses" })).toBeVisible();
});

test("shows an error for a wrong password", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("asha@example.com");
  await page.getByLabel("Password").fill("wrong");
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("alert")).toContainText("Invalid credentials");
});`,
        ),
      ],
      [
        blk(`<h3>Coverage and what to test</h3>
• <b>Coverage</b> (<code>vitest run --coverage</code>) shows which lines run during tests. Use it to find untested code, not as a target: 100% coverage can still miss behaviour.<br>
• Test: business rules and utilities (unit), components with logic and branching (component tests), critical flows (E2E), bugs you fixed (regression tests).<br>
• Do not test: library internals, trivial markup, implementation details like private state.<br>
• <b>Accessibility checks</b> in tests: <code>jest-axe</code>/<code>vitest-axe</code> catches many a11y bugs automatically.`,
          `// vitest-axe
import { axe } from "vitest-axe";
it("has no detectable accessibility violations", async () => {
  const { container } = render(<LoginForm onSubmit={() => {}} />);
  expect(await axe(container)).toHaveNoViolations();
});

// vite.config.js
test: {
  coverage: { provider: "v8", reporter: ["text", "html"], thresholds: { lines: 70, branches: 60 } },
}`,
        ),
      ],
      [
        blk(`<h3>Run tests automatically in CI</h3>
• Every push and pull request should run lint, type-check, unit tests and build; failing checks block the merge. Run E2E against a preview deployment or a started server.<br>
• Cache <code>node_modules</code>, fail fast, upload Playwright reports as artifacts.<br>
• Keep the suite fast (under a few minutes) or it will be ignored; quarantine flaky tests and fix them.`,
          `# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test -- --run --coverage
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }`,
        ),
      ],
      [
        ['Unit vs integration vs end-to-end tests?', 'Unit tests check small pieces in isolation (fast, many). Integration/component tests check several parts together (a component with its hooks and mocked API). End-to-end tests drive the whole app in a real browser (slow, few, critical flows).'],
        ['Is 100% code coverage a good goal?', 'No. Coverage only shows lines executed, not whether behaviour is verified. Use it to find gaps and focus on meaningful assertions on important logic.'],
        ['Why run tests in CI?', 'So every change is verified automatically in a clean environment, preventing regressions from reaching main and giving fast feedback to the whole team.'],
      ],
    ),
  ]),

  rp(14, 'Security and Accessibility', 'Essential for production', [
    topic(
      'rr-security-xss-csrf',
      'Security: XSS, CSRF and Safe React Code',
      [
        blk(`<h3>XSS (cross-site scripting)</h3>
• XSS lets an attacker run their script in your page (steal data, act as the user). It happens when untrusted text becomes HTML or script.<br>
• React helps: values in <code>{ }</code> are <b>escaped</b>. The dangerous escapes are <code>dangerouslySetInnerHTML</code>, <code>href="javascript:..."</code> from user data, <code>eval</code>/<code>new Function</code>, and injecting HTML through refs/<code>innerHTML</code>.<br>
• If you must render HTML (a rich-text comment), <b>sanitise</b> it with DOMPurify first.`,
          `import DOMPurify from "dompurify";

function Comment({ html }) {
  // UNSAFE: <div dangerouslySetInnerHTML={{ __html: html }} />
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "ul", "li"], ALLOWED_ATTR: ["href"] });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

function UserLink({ url, children }) {
  // Block "javascript:" and other dangerous protocols coming from user data
  const safe = /^https?:\\/\\//i.test(url) ? url : "#";
  return <a href={safe} rel="noopener noreferrer" target="_blank">{children}</a>;
}

function Greeting({ name }) {
  return <p>Hello, {name}</p>;        // escaped by React: <script> shows as text
}`,
        ),
      ],
      [
        blk(`<h3>CSRF and cookies</h3>
• <b>CSRF</b>: another site makes the user's browser send an authenticated request to your API (the browser attaches cookies automatically). It only matters when you authenticate with cookies.<br>
• Defences: <code>SameSite=Lax/Strict</code> cookies, CSRF tokens (Spring Security supports them), verifying <code>Origin</code>/<code>Referer</code>, and requiring a custom header or JSON content type.<br>
• Cookie flags: <code>HttpOnly</code> (JS cannot read it, defeating token theft by XSS), <code>Secure</code> (HTTPS only), <code>SameSite</code>.<br>
• Use <code>POST/PUT/DELETE</code> for state-changing requests, never <code>GET</code>.`,
          `// React: send the CSRF token Spring Security issues in the XSRF-TOKEN cookie
function getCookie(name) {
  return document.cookie.split("; ").find(c => c.startsWith(name + "="))?.split("=")[1];
}
async function post(path, body) {
  return fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": decodeURIComponent(getCookie("XSRF-TOKEN") ?? "") },
    body: JSON.stringify(body),
  });
}

// Spring Boot: CookieCsrfTokenRepository.withHttpOnlyFalse() lets the SPA read XSRF-TOKEN
// http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));
// Session cookie: Set-Cookie: JSESSIONID=...; HttpOnly; Secure; SameSite=Lax`,
        ),
      ],
      [
        blk(`<h3>Secure coding checklist for React apps</h3>
• <b>Never trust the client</b>: hiding a button or route does not protect data. The server must authenticate and authorise every request.<br>
• <b>Secrets</b>: anything in the bundle or <code>VITE_*</code> variables is public. Keep API secrets on the server.<br>
• <b>Dependencies</b>: <code>npm audit</code>, lock files, Dependabot/Renovate, avoid abandoned packages. Supply-chain attacks target <code>node_modules</code>.<br>
• <b>CSP</b> header (<code>script-src 'self'</code>) limits XSS impact; <b>HTTPS</b> + HSTS; <code>X-Content-Type-Options: nosniff</code>; <code>frame-ancestors</code> against clickjacking.<br>
• <b>Redirects/URLs</b>: validate <code>redirect</code> parameters to avoid open redirects; do not render user-supplied URLs unchecked.<br>
• Do not log sensitive data; mask tokens and personal data in error reports.`,
          `// Open-redirect safe "return to" after login
function safeRedirect(target, fallback = "/") {
  try {
    const url = new URL(target, window.location.origin);
    return url.origin === window.location.origin ? url.pathname + url.search : fallback;
  } catch { return fallback; }
}
navigate(safeRedirect(params.get("next")));

// nginx security headers
// add_header Content-Security-Policy "default-src 'self'; script-src 'self'; img-src 'self' data:; frame-ancestors 'none'" always;
// add_header X-Content-Type-Options nosniff always;
// add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
// add_header Referrer-Policy strict-origin-when-cross-origin always;

// package.json: "audit": "npm audit --omit=dev --audit-level=high"`,
        ),
      ],
      [
        ['How does React protect against XSS and where can it still happen?', 'React escapes values embedded in JSX. XSS can still occur via dangerouslySetInnerHTML, javascript: URLs, eval, direct innerHTML on refs, or vulnerable third-party code. Sanitise HTML with DOMPurify and validate URLs.'],
        ['What is CSRF and when does it apply?', 'An attacker\'s site triggers an authenticated request from the victim\'s browser. It applies when authentication relies on cookies sent automatically. Use SameSite cookies, CSRF tokens and Origin checks.'],
        ['Why is hiding a route or button in React not security?', 'Client code can be modified or bypassed (devtools, curl). Authorisation must be enforced by the API on every request; the UI only improves experience.'],
      ],
    ),
    topic(
      'rr-jwt-cors-authz',
      'Authentication, Authorization, JWT, Secure Sessions and CORS',
      [
        blk(`<h3>Authentication vs authorization</h3>
• <b>Authentication</b> = who are you (login). <b>Authorization</b> = what may you do (roles, permissions, ownership).<br>
• Role-based access control (RBAC): the server returns the user's roles/permissions; React uses them to show or hide UI, while the API enforces them (<code>@PreAuthorize("hasRole('ADMIN')")</code> in Spring Security).<br>
• Apply the <b>principle of least privilege</b> and check ownership server-side (a user may edit only their own records).`,
          `// React: permission-aware UI (cosmetic only; the API still enforces)
function Can({ perform, children, fallback = null }) {
  const { user } = useAuth();
  return user?.permissions.includes(perform) ? children : fallback;
}
<Can perform="course:delete"><button onClick={removeCourse}>Delete</button></Can>;

// Spring Boot: the real enforcement
// @PreAuthorize("hasAuthority('course:delete')")
// @DeleteMapping("/api/courses/{id}") void delete(@PathVariable long id) { ... }

// Ownership check
// @PreAuthorize("@courseSecurity.isOwner(#id, authentication)")`,
        ),
      ],
      [
        blk(`<h3>JWT and secure session management</h3>
• A <b>JWT</b> is a signed token (<code>header.payload.signature</code>) carrying claims (user id, roles, expiry). It is signed, <b>not encrypted</b>: never put secrets in it.<br>
• Use <b>short-lived access tokens</b> (5-15 min) plus a <b>refresh token</b> (days) stored in an <b>HttpOnly, Secure, SameSite cookie</b> and rotated on use; revoke on logout/compromise.<br>
• Alternative: classic <b>server-side sessions</b> with an HttpOnly cookie. Simpler to revoke; great for a single Spring Boot back end.<br>
• Keep the access token <b>in memory</b> (a variable), not <code>localStorage</code>; rebuild it from the refresh cookie on page load.<br>
• Always verify the signature, issuer, audience and expiry on the server.`,
          `// Access token held in memory only
let accessToken = null;
export const setToken = t => { accessToken = t; };

export async function authFetch(url, options = {}) {
  const res = await fetch(url, { ...options, credentials: "include", headers: { ...options.headers, Authorization: "Bearer " + accessToken } });
  if (res.status !== 401) return res;
  const r = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });   // refresh token cookie is sent automatically
  if (!r.ok) { setToken(null); throw new Error("Session expired"); }
  setToken((await r.json()).accessToken);
  return fetch(url, { ...options, credentials: "include", headers: { ...options.headers, Authorization: "Bearer " + accessToken } });
}

// Decode (NOT verify) claims for the UI only
const claims = JSON.parse(atob(accessToken.split(".")[1]));
console.log(claims.sub, claims.roles, new Date(claims.exp * 1000));

// Spring Boot refresh cookie
// ResponseCookie.from("refresh", token).httpOnly(true).secure(true).sameSite("Strict").path("/api/auth").maxAge(Duration.ofDays(7)).build();`,
        ),
      ],
      [
        blk(`<h3>CORS in depth</h3>
• The browser blocks a page from reading responses of another <b>origin</b> (scheme + host + port) unless the server sends <code>Access-Control-Allow-Origin</code>. It is enforced by the <b>browser</b>, configured on the <b>server</b>.<br>
• Non-simple requests (JSON body, <code>Authorization</code> header, PUT/DELETE) trigger a <b>preflight</b> <code>OPTIONS</code> request that must succeed.<br>
• With cookies you need <code>credentials: "include"</code> and <code>Access-Control-Allow-Credentials: true</code> with an <b>explicit</b> origin (never <code>*</code>).<br>
• Best practice: avoid CORS completely by serving the SPA and API from the same origin (reverse proxy), or proxy in dev. Allow only known origins, methods and headers.`,
          `// Spring Boot
// @Bean CorsConfigurationSource corsConfigurationSource() {
//   CorsConfiguration c = new CorsConfiguration();
//   c.setAllowedOrigins(List.of("https://app.javaschoollab.com", "http://localhost:5173"));
//   c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE"));
//   c.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-XSRF-TOKEN"));
//   c.setAllowCredentials(true);
//   c.setMaxAge(Duration.ofHours(1));              // cache the preflight
//   UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
//   s.registerCorsConfiguration("/api/**", c);
//   return s;
// }
// http.cors(Customizer.withDefaults());

// Debug checklist when you see "blocked by CORS policy"
// 1. Network tab: was the OPTIONS preflight 200 with Allow-* headers?
// 2. Is the Origin exactly allowed (scheme, host AND port)?
// 3. Using cookies? credentials: "include" + explicit origin + Allow-Credentials: true
// 4. Is a security filter rejecting OPTIONS before CORS runs? (http.cors() must be enabled)`,
        ),
      ],
      [
        ['Authentication vs authorization?', 'Authentication verifies identity (login). Authorization decides what an authenticated user may do (roles, permissions, ownership) and must be enforced on the server.'],
        ['Is a JWT encrypted?', 'No. A standard JWT is signed (integrity) but its payload is only base64url-encoded, so anyone can read it. Never put secrets in it, and always verify the signature and expiry on the server.'],
        ['How can you avoid CORS entirely?', 'Serve the front end and API from the same origin behind a reverse proxy (nginx), or use the dev server proxy in development. Otherwise configure CORS on the server with explicit origins.'],
      ],
    ),
    topic(
      'rr-accessibility',
      'Accessibility (a11y) in React',
      [
        blk(`<h3>Build for everyone</h3>
• Accessibility means people using keyboards, screen readers, zoom or voice control can use your app. It is also a legal requirement in many places and improves SEO and usability for everyone.<br>
• <b>Use semantic HTML first</b>: <code>&lt;button&gt;</code> for actions, <code>&lt;a&gt;</code> for navigation, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;h1&gt;-&lt;h6&gt;</code> in order, <code>&lt;label&gt;</code> for inputs, <code>&lt;table&gt;</code> for data. A <code>&lt;div onClick&gt;</code> is not focusable and has no role.<br>
• Provide text alternatives: <code>alt</code> on images (empty <code>alt=""</code> for decorative), accessible names for icon buttons (<code>aria-label</code>).`,
          `// Bad
<div className="btn" onClick={save}>Save</div>

// Good: keyboard focusable, Enter/Space work, announced as a button
<button type="button" onClick={save}>Save</button>

<button type="button" aria-label="Close dialog" onClick={close}><CloseIcon aria-hidden="true" /></button>

<img src="/chart.png" alt="Bar chart: signups grew 40% in October" />
<img src="/divider.svg" alt="" />                      {/* decorative */}

<nav aria-label="Main"><ul><li><a href="/courses">Courses</a></li></ul></nav>
<main id="main"><h1>Courses</h1></main>`,
        ),
      ],
      [
        blk(`<h3>Keyboard, focus and ARIA</h3>
• Everything must work with the keyboard: Tab order follows the DOM, focus is visible (do not remove outlines), Escape closes dialogs, arrow keys move within composite widgets.<br>
• <b>Manage focus</b> on route changes and dialogs: move focus to the new page heading or the dialog, trap it inside a modal, and restore it on close.<br>
• <b>ARIA</b> adds meaning when HTML cannot: <code>aria-expanded</code>, <code>aria-controls</code>, <code>aria-live</code> (announce updates), <code>role="alert"</code>. First rule of ARIA: do not use it if a native element does the job; wrong ARIA is worse than none.<br>
• Provide a <b>skip link</b> ("Skip to content") for keyboard users.`,
          `function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>{title}</button>
      </h3>
      <div id={id} hidden={!open}>{children}</div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.focus();                                        // move focus into the dialog
    const onKey = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };   // restore focus
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="dlg-title" ref={ref} tabIndex={-1}>
      <h2 id="dlg-title">{title}</h2>{children}<button onClick={onClose}>Close</button>
    </div>
  );
}

<a href="#main" className="skip-link">Skip to content</a>
<p aria-live="polite">{items.length} results found</p>          {/* screen readers announce changes */}`,
        ),
      ],
      [
        blk(`<h3>Forms, colour, motion and testing</h3>
• Every input has a visible <code>&lt;label&gt;</code>; errors are tied to the field with <code>aria-describedby</code> and announced with <code>role="alert"</code>; required fields are marked in text, not colour alone.<br>
• <b>Contrast</b>: at least 4.5:1 for body text and 3:1 for large text and UI components (WCAG AA). Never use colour as the only signal.<br>
• Respect <code>prefers-reduced-motion</code> and avoid auto-playing content; support zoom to 200% without horizontal scrolling.<br>
• <b>Test</b>: <code>eslint-plugin-jsx-a11y</code>, <code>vitest-axe</code>/axe DevTools, Lighthouse, keyboard-only walkthrough and a screen reader (NVDA, VoiceOver).`,
          `// Accessible field with an error
function EmailField({ value, onChange, error }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id}>Email <span aria-hidden="true">*</span><span className="sr-only">(required)</span></label>
      <input id={id} type="email" value={value} onChange={onChange} required autoComplete="email"
             aria-invalid={!!error} aria-describedby={error ? id + "-err" : undefined} />
      {error && <p id={id + "-err"} role="alert">Error: {error}</p>}
    </div>
  );
}

/* CSS */
// .sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
// @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
// :focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }

// .eslintrc: extends: ["plugin:jsx-a11y/recommended"]`,
        ),
      ],
      [
        ['Why use a button instead of a clickable div?', 'A button is focusable, activates with Enter/Space and exposes the correct role to assistive technology. A div needs tabIndex, key handlers and ARIA to imitate it, and still usually falls short.'],
        ['How do you manage focus in a modal?', 'Move focus into the dialog on open, trap Tab inside it, close on Escape, set role="dialog" aria-modal and a label, and return focus to the element that opened it on close.'],
        ['What is aria-live for?', 'It makes screen readers announce dynamic content changes (search result counts, status messages) without moving focus. Use polite for non-urgent and role="alert" for urgent messages.'],
      ],
    ),
  ]),

  rp(15, 'Advanced Rendering Concepts', 'Advanced', [
    topic(
      'rr-error-boundaries',
      'Error Handling and Error Boundaries',
      [
        blk(`<h3>Where errors can happen in React</h3>
• <b>Render errors</b> (exceptions while rendering) unmount the whole tree and show a blank page unless caught by an <b>error boundary</b>.<br>
• <b>Event handler</b> and <b>async</b> errors are not caught by boundaries: use <code>try/catch</code> (and <code>.catch</code> on promises) and show an error state.<br>
• An error boundary is a <b>class component</b> with <code>static getDerivedStateFromError</code> (switch to fallback UI) and <code>componentDidCatch</code> (log). The <code>react-error-boundary</code> package provides a ready-made component and hooks.`,
          `import { Component } from "react";

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }       // render fallback on the next pass
  componentDidCatch(error, info) { reportError(error, info.componentStack); }   // log to Sentry etc.
  reset = () => this.setState({ error: null });
  render() {
    if (this.state.error) {
      return (
        <div role="alert">
          <h2>Something went wrong.</h2>
          <button onClick={this.reset}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

<ErrorBoundary><Dashboard /></ErrorBoundary>;`,
        ),
      ],
      [
        blk(`<h3>react-error-boundary and placement strategy</h3>
• Place boundaries at several levels: <b>app-wide</b> (last resort), <b>per route</b> (a broken page keeps the navigation), and <b>around risky widgets</b> (charts, third-party embeds) so one failure does not take down the page.<br>
• <code>resetKeys</code> resets the boundary when something changes (for example the route). The fallback receives <code>error</code> and <code>resetErrorBoundary</code>.<br>
• Show a helpful message, offer retry, and never expose stack traces to users.`,
          `import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

function Fallback({ error, resetErrorBoundary }) {
  return (<div role="alert"><p>Could not load this section.</p><button onClick={resetErrorBoundary}>Retry</button></div>);
}

function App() {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary FallbackComponent={Fallback} resetKeys={[pathname]} onError={(e, info) => reportError(e, info)}>
      <Layout>
        <ErrorBoundary FallbackComponent={Fallback}><SalesChart /></ErrorBoundary>
        <Routes>...</Routes>
      </Layout>
    </ErrorBoundary>
  );
}

// Bring async/event errors into the boundary on purpose
function SaveButton() {
  const { showBoundary } = useErrorBoundary();
  return <button onClick={async () => { try { await save(); } catch (e) { showBoundary(e); } }}>Save</button>;
}`,
        ),
      ],
      [
        blk(`<h3>A complete error-handling strategy</h3>
• <b>Validate</b> inputs and API data early (Zod) so bad data fails with a clear message.<br>
• <b>Normalise</b> errors from the API into one shape and map HTTP status to user-friendly text (401 login, 403 no access, 404 not found, 429 slow down, 5xx try later).<br>
• <b>Global handlers</b>: <code>window.addEventListener("error")</code> and <code>"unhandledrejection"</code> report to your monitoring service. TanStack Query: <code>onError</code> or a global <code>QueryCache</code> handler.<br>
• <b>User feedback</b>: toast for transient failures, inline errors for forms, full-page fallback for fatal errors. <b>Log</b> technical details with a request id; do not show them to users.`,
          `function friendlyMessage(err) {
  switch (err.status) {
    case 401: return "Please log in again.";
    case 403: return "You do not have access to this.";
    case 404: return "We could not find that.";
    case 429: return "Too many requests. Please wait a moment.";
    default: return err.status >= 500 ? "Server problem. Please try again later." : err.message || "Something went wrong.";
  }
}

window.addEventListener("error", e => report({ type: "error", message: e.message, stack: e.error?.stack }));
window.addEventListener("unhandledrejection", e => report({ type: "rejection", message: String(e.reason) }));

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (err, query) => toast.error(friendlyMessage(err)) }),
});`,
        ),
      ],
      [
        ['What do error boundaries catch and not catch?', 'They catch errors during rendering, in lifecycle methods and constructors of the tree below them. They do not catch errors in event handlers, asynchronous code, server-side rendering or in the boundary itself.'],
        ['Why are error boundaries class components?', 'Only class components can implement getDerivedStateFromError and componentDidCatch. There is no hook equivalent, so use a small class or the react-error-boundary library.'],
        ['Where should you place error boundaries?', 'At the app level (last resort), around each route/page, and around independent risky widgets, so failures stay contained and the rest of the UI keeps working.'],
      ],
    ),
    topic(
      'rr-hoc-portals-strict',
      'Higher-Order Components, Portals and Strict Mode',
      [
        blk(`<h3>Higher-Order Components (HOC)</h3>
• A <b>HOC</b> is a function that takes a component and returns a new component with extra behaviour: <code>withAuth(Dashboard)</code>, <code>withLoading(List)</code>. Libraries such as Redux's old <code>connect</code> and React Router's old <code>withRouter</code> used them.<br>
• Conventions: do not mutate the original component, pass through unrelated props, set a <code>displayName</code>, hoist statics, and <b>never create a HOC inside render</b> (new component type each render resets state).<br>
• Today <b>hooks</b> and composition replace most HOCs, but you will meet them in older codebases and for cross-cutting wrappers (auth guards, error boundaries, analytics).`,
          `function withLoading(Component) {
  function WithLoading({ isLoading, ...props }) {
    if (isLoading) return <p>Loading...</p>;
    return <Component {...props} />;
  }
  WithLoading.displayName = "withLoading(" + (Component.displayName || Component.name) + ")";
  return WithLoading;
}
const UserListWithLoading = withLoading(UserList);
<UserListWithLoading isLoading={loading} users={users} />;

function withAuth(Component, role) {
  return function Guarded(props) {
    const { user } = useAuth();                           // HOCs can use hooks inside the wrapper
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <p>Not allowed</p>;
    return <Component {...props} user={user} />;
  };
}
export default withAuth(AdminPanel, "admin");

// The hook equivalent is usually simpler:
function AdminPanelHook() { const { user } = useAuth(); /* ... */ }`,
        ),
      ],
      [
        blk(`<h3>Portals</h3>
• <code>createPortal(children, domNode)</code> renders children into a different DOM node (usually <code>document.body</code>) while keeping them in the React tree. Events still bubble through the React hierarchy and context still works.<br>
• Use it for <b>modals, tooltips, dropdowns, toasts</b> that must escape <code>overflow: hidden</code>, <code>z-index</code> stacking contexts or transforms of a parent.<br>
• Remember accessibility: focus management, <code>role="dialog"</code>, Escape to close, and scroll locking.`,
          `import { createPortal } from "react-dom";
import { useEffect } from "react";

function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";               // lock page scroll
    const onKey = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="backdrop" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>{children}
      </div>
    </div>,
    document.body,                                          // rendered outside the parent DOM node
  );
}`,
        ),
      ],
      [
        blk(`<h3>React Strict Mode</h3>
• <code>&lt;StrictMode&gt;</code> is a <b>development-only</b> tool that finds bugs early: it renders components <b>twice</b> to expose impure render code, runs effects <b>setup + cleanup + setup</b> on mount to check cleanup logic, warns about deprecated APIs and detects unsafe patterns. It has no effect in production builds.<br>
• If a component behaves wrongly in Strict Mode (double fetch, double subscription, duplicated analytics event) it has a real bug: missing cleanup or an impure render, not "a Strict Mode bug".<br>
• Fix: return cleanup from effects (<code>abort</code>, <code>unsubscribe</code>, <code>clearInterval</code>), keep render pure, and make effects idempotent. Do not remove StrictMode to hide the problem.`,
          `// main.jsx
createRoot(root).render(<StrictMode><App /></StrictMode>);

// Bug exposed by StrictMode: the listener is added twice because there is no cleanup
function Bad() {
  useEffect(() => { window.addEventListener("resize", onResize); }, []);     // leaks
}
// Fixed
function Good() {
  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
}

// Impure render exposed by double rendering
let id = 0;
function Impure() { id++; return <p>{id}</p>; }       // shows 2 in dev, 1 in prod: do not mutate outside values in render

// Analytics should not fire from an effect without thought: it fires twice in dev, once in prod. That is expected.`,
        ),
      ],
      [
        ['What is a higher-order component?', 'A function that takes a component and returns an enhanced component (withAuth, withLoading). It reuses behaviour across components; hooks and composition now cover most cases.'],
        ['Why use portals?', 'To render UI like modals, tooltips and dropdowns outside their parent DOM node (escaping overflow/z-index clipping) while keeping them in the React tree for props, context and event bubbling.'],
        ['Why does my effect run twice in development?', 'StrictMode intentionally mounts, cleans up and remounts components to verify that effects clean up properly. It does not happen in production; add proper cleanup instead of removing StrictMode.'],
      ],
    ),
    topic(
      'rr-concurrent-ssr',
      'Concurrent Rendering, Suspense for Data and Server-Side Rendering',
      [
        blk(`<h3>Concurrent rendering</h3>
• In React 18+, rendering can be <b>interrupted, paused and resumed</b>. React can start rendering an update, pause to handle an urgent event (typing), then continue. This keeps the UI responsive without you writing any scheduling code.<br>
• You opt in through APIs: <code>createRoot</code>, <code>useTransition</code>/<code>startTransition</code> (mark non-urgent updates), <code>useDeferredValue</code>, and <code>Suspense</code>.<br>
• Consequences: render functions must be <b>pure</b> and may run more than once; never rely on render running exactly once or on side effects in render.`,
          `import { startTransition, useState, useTransition, useDeferredValue } from "react";

function Filterable({ items }) {
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  function onChange(e) {
    setText(e.target.value);                              // urgent: the input reflects typing immediately
    startTransition(() => setFilter(e.target.value));     // non-urgent: filtering a huge list can be interrupted
  }
  return (
    <>
      <input value={text} onChange={onChange} />
      {isPending && <span>Updating...</span>}
      <HugeList items={items} filter={filter} />
    </>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Suspense for data and streaming</h3>
• <b>Suspense</b> lets a component "wait" for something (code, data) and show a fallback meanwhile. Data libraries (TanStack Query <code>useSuspenseQuery</code>, Relay) and the React 19 <code>use(promise)</code> hook integrate with it.<br>
• Benefits: no manual <code>isLoading</code> flags, declarative loading boundaries, no waterfalls when you fetch in parallel above the boundary.<br>
• Wrap in an error boundary to handle failures and keep promises <b>stable</b> (created outside render or cached), otherwise you create a new request every render.`,
          `import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

function Profile({ id }) {
  const { data: user } = useSuspenseQuery({ queryKey: ["user", id], queryFn: () => api.get("/api/users/" + id) });
  return <h2>{user.name}</h2>;                            // data is guaranteed: no isLoading branch
}

function Page({ id }) {
  return (
    <ErrorBoundary fallback={<p>Failed to load</p>}>
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile id={id} />
        <Suspense fallback={<p>Loading posts...</p>}><Posts userId={id} /></Suspense>
      </Suspense>
    </ErrorBoundary>
  );
}`,
        ),
      ],
      [
        blk(`<h3>SSR, hydration and Server Components</h3>
• <b>Client-side rendering (CSR)</b>: the browser downloads JS, then renders (blank page first, weaker SEO). <b>Server-side rendering (SSR)</b>: the server sends ready HTML, then JS <b>hydrates</b> it (attaches event handlers). <b>Static generation (SSG)</b> pre-renders at build time.<br>
• Hydration requires the server and client output to <b>match</b>; things like <code>Date.now()</code>, <code>Math.random()</code>, or <code>window</code> in render cause hydration mismatches.<br>
• <b>React Server Components</b> (Next.js App Router, React Router framework mode) run only on the server and send no JS for themselves: they can read databases directly. Interactive pieces are marked <code>"use client"</code>.<br>
• Choose a framework (Next.js, Remix/React Router) when you need SEO, fast first paint or server data access; a Vite SPA is fine for authenticated dashboards like an LMS back office.`,
          `// Next.js App Router
// app/courses/page.tsx   (Server Component by default)
export default async function CoursesPage() {
  const courses = await fetch("https://api.javaschoollab.com/courses", { next: { revalidate: 60 } }).then(r => r.json());
  return (
    <ul>
      {courses.map(c => <li key={c.id}>{c.title}</li>)}
      <LikeButton />                       {/* a Client Component */}
    </ul>
  );
}

// app/courses/LikeButton.tsx
"use client";
import { useState } from "react";
export function LikeButton() {
  const [likes, setLikes] = useState(0);
  return <button onClick={() => setLikes(l => l + 1)}>Like {likes}</button>;
}

// Hydration mismatch: the server and the browser compute different text
function Clock() { return <p>{new Date().toLocaleTimeString()}</p>; }                   // BAD in SSR
function ClockOk() {
  const [now, setNow] = useState(null);
  useEffect(() => setNow(new Date()), []);                                                // client-only after hydration
  return <p>{now ? now.toLocaleTimeString() : ""}</p>;
}`,
        ),
      ],
      [
        ['What is concurrent rendering?', 'React can interrupt, pause and resume rendering so urgent updates (typing, clicking) are handled immediately while non-urgent ones render in the background, using APIs like useTransition, useDeferredValue and Suspense.'],
        ['What is hydration?', 'The step where React attaches event handlers and state to HTML that was rendered on the server. The initial client render must match the server HTML or React reports a hydration mismatch.'],
        ['When would you choose Next.js or SSR over a Vite SPA?', 'When you need SEO for public pages, fast first contentful paint, or server-side data access. For authenticated dashboards behind a login, a Vite SPA is often simpler.'],
      ],
    ),
  ]),

  rp(16, 'Deployment and Monitoring', 'Essential for production', [
    topic(
      'rr-env-build',
      'Environment Variables and Production Builds',
      [
        blk(`<h3>Configuration without code changes</h3>
• Different environments (development, test, staging, production) need different settings: API URL, feature flags, analytics keys. Keep them out of the source code.<br>
• Vite loads <code>.env</code>, <code>.env.development</code>, <code>.env.production</code> (and <code>.local</code> variants). Only variables starting with <b><code>VITE_</code></b> are exposed to the browser as <code>import.meta.env.VITE_*</code>. <code>import.meta.env.MODE</code>, <code>DEV</code>, <code>PROD</code> are built in.<br>
• Variables are <b>inlined at build time</b>. Changing one requires a rebuild; "build once, deploy anywhere" needs a runtime config (<code>/config.json</code> fetched at start).`,
          `# .env.development
VITE_API_URL=http://localhost:8080
VITE_FEATURE_BETA=true

# .env.production
VITE_API_URL=https://api.javaschoollab.com
VITE_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0

// src/config.js
export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? "",
  beta: import.meta.env.VITE_FEATURE_BETA === "true",     // env values are always strings
  isProd: import.meta.env.PROD,
};
if (!config.apiUrl && import.meta.env.PROD) throw new Error("VITE_API_URL is missing");`,
        ),
      ],
      [
        blk(`<h3>Secrets and runtime config</h3>
• <b>Never put secrets in <code>VITE_*</code></b> (database passwords, private API keys, JWT signing keys): they are plain text in the bundle. Public identifiers (Sentry DSN, Google client id, map key restricted by domain) are fine.<br>
• Keep real secrets on the server (Spring Boot <code>application-prod.properties</code> via environment variables, a secrets manager) and call them through your API.<br>
• Commit <code>.env.example</code>, not <code>.env.local</code>; add <code>.env*.local</code> to <code>.gitignore</code>.<br>
• For one image deployed to many environments, load config at runtime.`,
          `// public/config.json  (replaced per environment at deploy time, not part of the hashed bundle)
// { "apiUrl": "https://api.example.com", "env": "staging" }

let runtimeConfig;
export async function loadConfig() {
  const res = await fetch("/config.json", { cache: "no-store" });
  runtimeConfig = await res.json();
  return runtimeConfig;
}
// main.jsx
loadConfig().then(() => createRoot(root).render(<App />));

// .gitignore
// .env.local
// .env.*.local
// .env.example (committed, with placeholder values)`,
        ),
      ],
      [
        blk(`<h3>Production build checklist</h3>
• <code>npm run build</code> creates optimised, minified, hashed files in <code>dist/</code>; preview locally with <code>npm run preview</code>. Test the production build, not only the dev server.<br>
• Check: no <code>console.log</code> noise, source maps uploaded to the error tracker but not served publicly, correct <code>base</code> if hosted under a sub-path, <code>favicon</code>/meta tags, 404 fallback to <code>index.html</code> for client-side routing.<br>
• Run lint, type-check, tests and a Lighthouse audit before release. Version the build and expose it (<code>VITE_APP_VERSION</code>) so bug reports include it.`,
          `// vite.config.js
import { defineConfig } from "vite";
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/",                                 // "/app/" if served from a sub-path
  build: { sourcemap: "hidden", target: "es2020" },     // maps for Sentry, not referenced in the bundle
  define: { __APP_VERSION__: JSON.stringify(process.env.npm_package_version) },
  esbuild: { drop: mode === "production" ? ["console", "debugger"] : [] },
}));

// package.json
// "scripts": { "build": "tsc --noEmit && vite build", "preview": "vite preview --port 4173", "verify": "npm run lint && npm test -- --run && npm run build" }`,
        ),
      ],
      [
        ['Why must secrets not be in VITE_ variables?', 'Vite inlines them into the client bundle at build time, so anyone can read them in the browser. Keep secrets on the server and expose only public configuration.'],
        ['When are Vite env variables resolved?', 'At build time. Changing a value requires a rebuild. For runtime configuration load a config file (config.json) when the app starts.'],
        ['What should you check before shipping a production build?', 'Run lint, type-check, tests and the build; preview it locally; verify routes fall back to index.html, source maps are not public, env values are correct and Lighthouse/Core Web Vitals are acceptable.'],
      ],
    ),
    topic(
      'rr-deploy-nginx',
      'Deploying React: Ubuntu, Nginx, Spring Boot and Docker',
      [
        blk(`<h3>What deployment means for an SPA</h3>
• <code>npm run build</code> produces <b>static files</b> (HTML, JS, CSS, images). Any web server can host them. The server must (1) serve <code>index.html</code> for unknown paths (client-side routing), (2) proxy <code>/api</code> to the back end, (3) serve over HTTPS, (4) set caching and security headers.<br>
• Common setups: <b>Nginx</b> on an Ubuntu VM in front of a Spring Boot jar; the Spring Boot jar serving the built files itself; a static host/CDN (S3 + CloudFront, Netlify, Vercel) plus an API elsewhere.`,
          `# Ubuntu server: install nginx and copy the build
sudo apt update && sudo apt install -y nginx
npm run build
sudo mkdir -p /var/www/javaschoollab
sudo rsync -a --delete dist/ /var/www/javaschoollab/

# /etc/nginx/sites-available/javaschoollab
server {
  listen 80;
  server_name app.javaschoollab.com;
  root /var/www/javaschoollab;
  index index.html;

  location / { try_files $uri /index.html; }                     # client-side routing fallback
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location = /index.html { add_header Cache-Control "no-cache"; }

  location /api/ {
    proxy_pass http://127.0.0.1:8080;                            # Spring Boot
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  gzip on; gzip_types text/css application/javascript application/json image/svg+xml;
}
# sudo ln -s /etc/nginx/sites-available/javaschoollab /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx`,
        ),
      ],
      [
        blk(`<h3>HTTPS and the Spring Boot service</h3>
• <b>HTTPS</b> is mandatory (service workers, secure cookies, trust). Get free certificates with Let's Encrypt: <code>sudo apt install certbot python3-certbot-nginx</code> then <code>sudo certbot --nginx -d app.javaschoollab.com</code>; it edits Nginx and renews automatically.<br>
• Run the back end as a <b>systemd service</b> so it starts on boot and restarts on failure; pass secrets as environment variables or an env file with restricted permissions.<br>
• Open only ports 80/443 (and SSH) in the firewall: <code>sudo ufw allow 'Nginx Full'</code>; keep Spring Boot bound to localhost.`,
          `# /etc/systemd/system/javaschoollab.service
[Unit]
Description=JavaSchoolLab API
After=network.target mysql.service

[Service]
User=jsl
EnvironmentFile=/etc/javaschoollab/env          # SPRING_DATASOURCE_PASSWORD=..., JWT_SECRET=... (chmod 600)
ExecStart=/usr/bin/java -jar /opt/javaschoollab/app.jar --server.address=127.0.0.1 --server.port=8080
Restart=on-failure
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target

# sudo systemctl daemon-reload && sudo systemctl enable --now javaschoollab
# sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
# sudo certbot --nginx -d app.javaschoollab.com   (adds HTTPS and auto-renewal)
# journalctl -u javaschoollab -f                   (follow the application logs)`,
        ),
      ],
      [
        blk(`<h3>Docker, zero-downtime releases and alternatives</h3>
• A <b>multi-stage Dockerfile</b> builds the app in a Node image and serves <code>dist</code> from a tiny Nginx image: reproducible, identical everywhere. Compose it with the API and database.<br>
• <b>Releases</b>: build, upload to a new directory, switch a symlink (<code>current</code>) and reload Nginx; keep the previous release for instant rollback. Hashed asset names let old and new versions coexist.<br>
• <b>Single jar</b>: copy <code>dist/</code> into Spring Boot <code>static/</code> (or the Maven frontend plugin) so one process serves the site and API on one origin, avoiding CORS. Add a controller that forwards unknown routes to <code>index.html</code>.<br>
• Static hosting + CDN gives global speed with no server to maintain; configure the SPA fallback rule (<code>/* /index.html 200</code>).`,
          `# Dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

# docker-compose.yml
# services:
#   web: { build: ./frontend, ports: ["80:80"], depends_on: [api] }
#   api: { image: javaschoollab/api:1.0, environment: { SPRING_PROFILES_ACTIVE: prod }, expose: ["8080"] }
#   db:  { image: mysql:8, environment: { MYSQL_ROOT_PASSWORD_FILE: /run/secrets/db }, volumes: [dbdata:/var/lib/mysql] }

# Atomic release with rollback
# rsync -a dist/ /var/www/releases/2026-10-20/ && ln -sfn /var/www/releases/2026-10-20 /var/www/current && sudo nginx -s reload
# rollback: ln -sfn /var/www/releases/<previous> /var/www/current && sudo nginx -s reload`,
        ),
      ],
      [
        ['Why does the server need a try_files /index.html rule?', 'With client-side routing, URLs like /courses/5 are not files. The server must return index.html for unknown paths so the React router can render the route, instead of a 404 on refresh.'],
        ['Why put Nginx in front of Spring Boot?', 'It terminates HTTPS, serves static files and caches efficiently, compresses, applies security headers, and proxies /api to the app, keeping Spring Boot private on localhost and avoiding CORS with one origin.'],
        ['How do you roll back a bad release?', 'Keep each release in its own directory (or image tag) and switch a symlink/tag back to the previous one, then reload Nginx. Hashed asset names let old and new files coexist.'],
      ],
    ),
    topic(
      'rr-git-cicd',
      'Git Workflow and CI/CD Pipelines',
      [
        blk(`<h3>Git essentials for teams</h3>
• Git tracks changes as <b>commits</b> on <b>branches</b>. Core commands: <code>git clone</code>, <code>status</code>, <code>add</code>, <code>commit</code>, <code>push</code>, <code>pull</code>, <code>branch</code>, <code>switch</code>, <code>merge</code>, <code>rebase</code>, <code>log</code>, <code>diff</code>, <code>stash</code>.<br>
• Workflow: create a short-lived <b>feature branch</b> from <code>main</code>, commit small logical changes, push, open a <b>pull request</b>, get review and green checks, then merge (squash or rebase) and delete the branch.<br>
• Write meaningful commit messages (imperative: "Add course search"), commit often, never commit secrets or <code>node_modules</code>.`,
          `git switch main && git pull
git switch -c feature/course-search

# ...edit files...
git add src/features/search/
git commit -m "Add debounced course search with TanStack Query"
git push -u origin feature/course-search          # then open a pull request on GitHub

# keep the branch up to date
git fetch origin && git rebase origin/main

# undo safely
git restore src/App.jsx                           # discard local edits to one file
git revert <commit>                               # new commit that undoes an old one (safe on shared branches)
git stash push -m "wip" && git stash pop

# .gitignore
# node_modules/
# dist/
# .env.local`,
        ),
      ],
      [
        blk(`<h3>Branching strategies and conventions</h3>
• <b>Trunk-based development</b> (short branches, merge to main daily, feature flags) suits continuous delivery. <b>Git Flow</b> (develop, release, hotfix branches) fits scheduled releases.<br>
• Protect <code>main</code>: require pull requests, reviews and passing checks; forbid force-push.<br>
• <b>Conventional Commits</b> (<code>feat:</code>, <code>fix:</code>, <code>docs:</code>, <code>chore:</code>) enable automatic changelogs and semantic versioning.<br>
• <b>Semantic versioning</b>: MAJOR.MINOR.PATCH; tag releases (<code>git tag v1.4.0</code>).<br>
• Resolve merge conflicts calmly: read both sides, keep the intended result, run the tests, then continue the merge/rebase.`,
          `# Conventional commits
git commit -m "feat(courses): add React roadmap phases"
git commit -m "fix(router): redirect to login on expired session"

# release
git tag -a v1.4.0 -m "React roadmap and TypeScript lessons"
git push origin v1.4.0

# conflict markers
# <<<<<<< HEAD
# your change
# =======
# their change
# >>>>>>> feature/x
# edit to the final text, remove the markers, then:
git add path/to/file && git rebase --continue`,
        ),
      ],
      [
        blk(`<h3>CI/CD with GitHub Actions</h3>
• <b>CI (continuous integration)</b>: on every push/PR run install, lint, type-check, tests and build. <b>CD (continuous delivery/deployment)</b>: on merge to main build an artifact (image or <code>dist</code>), deploy to staging automatically and to production automatically or after approval.<br>
• Store secrets (SSH key, registry token) in <b>GitHub Secrets</b>, never in the repo. Use environments with required reviewers for production.<br>
• Keep pipelines fast: cache dependencies, run jobs in parallel, fail early. Make deployments <b>idempotent</b> and <b>reversible</b>.`,
          `# .github/workflows/deploy.yml
name: Build and deploy
on:
  push: { branches: [main] }

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint && npx tsc --noEmit && npm test -- --run
      - run: npm run build
        env: { VITE_API_URL: https://api.javaschoollab.com }
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production                      # can require a manual approval
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - name: Upload to server
        run: |
          echo "\${{ secrets.DEPLOY_KEY }}" > key && chmod 600 key
          rsync -az --delete -e "ssh -i key -o StrictHostKeyChecking=accept-new" dist/ deploy@app.javaschoollab.com:/var/www/javaschoollab/
      - name: Smoke test
        run: curl -fsS https://app.javaschoollab.com/ | grep -q '<div id="root">'`,
        ),
      ],
      [
        ['Merge vs rebase?', 'Merge joins histories with a merge commit and preserves the real history. Rebase replays your commits on top of the target branch for a linear history; do not rebase commits that others already use.'],
        ['What is the difference between CI and CD?', 'CI automatically builds and tests every change. CD automatically delivers (or deploys) successful builds to staging/production, often with a manual approval gate for production.'],
        ['Where do deployment secrets belong?', 'In the CI system\'s secret store (GitHub Secrets/environments) or a secrets manager, never in the repository or the front-end bundle.'],
      ],
    ),
    topic(
      'rr-monitoring',
      'Monitoring: Errors, Performance and Logs',
      [
        blk(`<h3>You cannot fix what you cannot see</h3>
• Users rarely report errors. <b>Monitoring</b> collects them automatically: JavaScript exceptions, failed API calls, slow pages and unusual behaviour, with context (URL, browser, user id, release version).<br>
• Typical stack: <b>Sentry</b> (errors and performance), <b>web-vitals</b> + analytics (real-user performance), <b>uptime checks</b> (UptimeRobot, Pingdom), server <b>logs</b> and metrics (Spring Boot Actuator, Prometheus/Grafana, ELK).<br>
• Upload <b>source maps</b> to the tracker so minified stack traces become readable, but do not serve them publicly.`,
          `import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: __APP_VERSION__,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration({ maskAllText: true })],
  tracesSampleRate: 0.1,                  // sample 10% of transactions
  replaysOnErrorSampleRate: 1.0,          // record a replay whenever an error happens
  beforeSend(event) { delete event.request?.cookies; return event; },   // privacy: strip sensitive data
});

const SentryBoundary = Sentry.ErrorBoundary;
<SentryBoundary fallback={<p>Something went wrong.</p>}><App /></SentryBoundary>;

Sentry.setUser({ id: user.id });          // an id, not an email or name
Sentry.captureMessage("Payment retry limit reached", "warning");`,
        ),
      ],
      [
        blk(`<h3>Real-user performance and product analytics</h3>
• Lab tools (Lighthouse) show potential; <b>real-user monitoring (RUM)</b> shows what users experience on real devices and networks. Send <code>web-vitals</code> (LCP, INP, CLS) to your backend or analytics.<br>
• Track key flows (sign-up funnel, course completion) with privacy-respecting analytics (Plausible, PostHog, GA4 with consent). Respect GDPR/DPDP: obtain consent, anonymise IPs, avoid personal data in events.<br>
• Set <b>budgets and alerts</b>: error rate spike, LCP regression, 5xx rate, uptime.`,
          `import { onCLS, onINP, onLCP } from "web-vitals";

function report(metric) {
  const body = JSON.stringify({
    name: metric.name, value: metric.value, rating: metric.rating, id: metric.id,
    page: location.pathname, release: __APP_VERSION__, connection: navigator.connection?.effectiveType,
  });
  (navigator.sendBeacon && navigator.sendBeacon("/api/vitals", body)) ||
    fetch("/api/vitals", { method: "POST", body, keepalive: true });       // survives page unload
}
onLCP(report); onINP(report); onCLS(report);

// Spring Boot Actuator health for uptime checks
// management.endpoints.web.exposure.include=health,info,prometheus
// GET /actuator/health  ->  { "status": "UP" }`,
        ),
      ],
      [
        blk(`<h3>Logging, alerts and incident response</h3>
• <b>Structured logs</b> (JSON with level, timestamp, request id, user id) are searchable. Add a <b>correlation id</b> header on every request (<code>X-Request-Id</code>) and log it on both sides to trace a failure across front end and API.<br>
• Alert on symptoms users feel (errors, latency, downtime), route alerts to a channel with an owner, and keep a short <b>runbook</b>.<br>
• After an incident, write a <b>post-mortem</b> (timeline, root cause, fix, prevention). Add a regression test.<br>
• Do not log secrets, tokens or personal data; rotate logs and set retention limits.`,
          `// Correlation id sent with every API call
function withRequestId(options = {}) {
  const id = crypto.randomUUID();
  return { options: { ...options, headers: { ...options.headers, "X-Request-Id": id } }, id };
}
async function apiCall(path, options) {
  const { options: opts, id } = withRequestId(options);
  try { return await request(path, opts); }
  catch (e) { Sentry.captureException(e, { tags: { requestId: id, path } }); throw e; }
}

// Spring Boot: put the id in every log line
// @Component class RequestIdFilter extends OncePerRequestFilter {
//   protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ... {
//     String id = Optional.ofNullable(req.getHeader("X-Request-Id")).orElse(UUID.randomUUID().toString());
//     MDC.put("requestId", id); res.setHeader("X-Request-Id", id);
//     try { chain.doFilter(req, res); } finally { MDC.clear(); }
//   }
// }`,
        ),
      ],
      [
        ['Why use an error tracking service like Sentry?', 'Users rarely report bugs. It captures exceptions automatically with stack traces (via source maps), release, browser and user context, groups duplicates and alerts you, so you can fix issues quickly.'],
        ['What is real-user monitoring?', 'Collecting performance metrics (Core Web Vitals) from actual users\' browsers, which reflects real devices and networks, unlike lab tests such as Lighthouse run on one machine.'],
        ['What is a correlation id?', 'A unique id sent with a request and included in logs on every system it touches, so a failure seen in the browser can be traced to the exact server log lines.'],
      ],
    ),
  ]),
];

export const reactRoadmap3: SubTopic[] = [...reactRoadmap3Base, ...reactExamples];
