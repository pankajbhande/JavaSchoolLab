// React course extras, part 2 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const react2Extras: Record<string, Extra> = {
    'react-conditional-rendering': x(
        ['Conditional rendering shows different UI depending on state or props, using normal JavaScript.',
            'Options: <code>if</code> with early return, the ternary <code>cond ? &lt;A /&gt; : &lt;B /&gt;</code>, and <code>cond &amp;&amp; &lt;A /&gt;</code>.',
            'Returning <code>null</code> renders nothing.'],
        ['Use <code>&amp;&amp;</code> carefully: <code>{count &amp;&amp; &lt;X /&gt;}</code> prints 0 when count is 0; use <code>count &gt; 0 &amp;&amp;</code>.',
            'Extract complex conditions into variables or small components for readability.',
            'Toggle visibility with state (<code>useState(false)</code>) and a button handler.'],
        ['Rendering different component types resets state; rendering the same type in the same position keeps it.',
            'Hiding with CSS keeps the component mounted (and its state); conditional rendering unmounts it.',
            'Handle loading, error and empty states explicitly for a good user experience.'],
        [['F', 'How do you show something only if a condition is true?', 'With {condition &amp;&amp; &lt;Component /&gt;} or a ternary.'],
            ['F', 'How do you render nothing?', 'Return null from the component.'],
            ['M', 'What is the {count &amp;&amp; ...} pitfall?', 'If count is 0 the expression evaluates to 0, which React renders as the text 0.'],
            ['M', 'Conditional rendering vs hiding with CSS?', 'Conditional rendering unmounts and loses state; CSS hiding keeps the component mounted.'],
            ['S', 'How does conditional rendering affect state?', 'Switching between different component types (or removing and re-adding) resets state; same type and position preserves it.'],
            ['S', 'How do you model loading, error and empty states?', 'With explicit status values and early returns in the component, so each state has clear UI.']],
        [['Loading, error, empty and data states.',
            r`function Orders() {
  const { data, isLoading, error } = useOrders();
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p role="alert">Could not load orders</p>;
  if (data.length === 0) return <p>No orders yet</p>;
  return <ul>{data.map(o => <li key={o.id}>{o.id}</li>)}</ul>;
}

// OUTPUT:
// Loading...  then either the error, the empty message or the list`],
            ['Toggle with state.',
                r`function Details({ text }) {
  const [open, setOpen] = useState(false);
  return (<div><button onClick={() => setOpen(o => !o)}>{open ? "Hide" : "Show"}</button>{open && <p>{text}</p>}</div>);
}

// OUTPUT:
// clicking Show reveals the paragraph; clicking Hide removes it`]],
        [['Zero pitfall.',
            r`{items.length && <List items={items} />}        // renders "0" when empty
{items.length > 0 && <List items={items} />}    // correct

// OUTPUT:
// the first form shows 0 on screen`],
            ['Role based UI.',
                r`{user.role === "admin" ? <AdminPanel /> : <UserPanel />}
{can("refund") && <button>Refund</button>}

// OUTPUT:
// different panels for different roles (the server must still enforce permissions)`]]
    ),

    'react-lists-keys': x(
        ['Render lists with <code>array.map()</code> and return an element for each item.',
            'Each element in a list needs a unique <code>key</code> prop: <code>&lt;li key={item.id}&gt;</code>.',
            'Keys help React match items between renders so it updates, moves and removes the right DOM nodes.'],
        ['Use stable, unique ids from the data as keys; avoid array indexes when the list can be reordered, filtered or edited.',
            'Keys only need to be unique among siblings, and they are not passed as props.',
            'Missing or duplicate keys trigger a warning and can cause wrong state or UI bugs.'],
        ['Using index as key with inputs or stateful items makes state stick to positions, not items, after reordering.',
            'Generate ids when data is created (not during render with Math.random).',
            'For long lists use virtualization (react-window, TanStack Virtual) so only visible rows render.'],
        [['F', 'How do you render a list in React?', 'Use map() over the array and return an element with a key for each item.'],
            ['F', 'Why are keys needed?', 'To let React identify which items changed, were added or removed.'],
            ['M', 'Why avoid index as key?', 'When items are reordered or removed, indexes shift, so React may reuse the wrong component state or DOM.'],
            ['M', 'Must keys be globally unique?', 'No, only unique among siblings in the same list.'],
            ['S', 'What happens with Math.random() keys?', 'Keys change every render, so React remounts every item, losing state and hurting performance.'],
            ['S', 'How do you render 100,000 rows?', 'Use list virtualization to render only visible rows.']],
        [['Keyed list with sorting.',
            r`function Products({ items }) {
  const [sortBy, setSortBy] = useState("name");
  const sorted = [...items].sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1);
  return (<ul>{sorted.map(p => <li key={p.id}>{p.name} - {p.price}</li>)}</ul>);
}

// OUTPUT:
// <li>Book - 150</li><li>Pen - 10</li>     (items keep their identity when the order changes)`],
            ['The index key bug.',
                r`{todos.map((t, i) => <li key={i}><input defaultValue={t.text} /></li>)}      // deleting the first item keeps the first input text
{todos.map(t => <li key={t.id}><input defaultValue={t.text} /></li>)}         // correct

// OUTPUT:
// with index keys, the typed text stays in the wrong row after deletion`]],
        [['Virtualized list.',
            r`<FixedSizeList height={400} itemCount={rows.length} itemSize={32}>{({ index, style }) => <div style={style}>{rows[index].name}</div>}</FixedSizeList>

// OUTPUT:
// 100,000 rows with about 15 DOM nodes`],
            ['Group and render sections.',
                r`const groups = Object.entries(Object.groupBy(items, i => i.category));
{groups.map(([cat, list]) => (<section key={cat}><h3>{cat}</h3><ul>{list.map(i => <li key={i.id}>{i.name}</li>)}</ul></section>))}

// OUTPUT:
// one section per category with its items`]]
    ),

    'react-forms': x(
        ['A controlled input has its value held in state: <code>&lt;input value={name} onChange={e =&gt; setName(e.target.value)} /&gt;</code>.',
            'Handle submit with <code>onSubmit</code> and call <code>e.preventDefault()</code>.',
            'For many fields keep an object in state and update with a generic handler.'],
        ['Different controls: <code>value</code> for text and select, <code>checked</code> for checkboxes, <code>onChange</code> for all.',
            'Uncontrolled inputs use refs or FormData and read values on submit; they are simpler for large forms.',
            'Validate on submit and on blur; show clear errors near fields and link them with aria attributes.'],
        ['Use libraries (React Hook Form, Formik) with schema validation (Zod, Yup) for complex forms; they reduce re-renders.',
            'Server actions and form libraries handle submission state (pending, errors); always validate again on the server.',
            'Accessibility: labels, <code>aria-invalid</code>, <code>aria-describedby</code>, focus the first invalid field.'],
        [['F', 'What is a controlled component?', 'An input whose value is stored in React state and updated through onChange.'],
            ['F', 'How do you stop a form from reloading the page?', 'Call event.preventDefault() in onSubmit.'],
            ['M', 'Controlled vs uncontrolled inputs?', 'Controlled inputs are driven by state; uncontrolled keep their value in the DOM and are read with refs or FormData.'],
            ['M', 'How do you handle many inputs with one handler?', 'Give inputs a name and update state with [e.target.name]: e.target.value.'],
            ['S', 'Why use React Hook Form?', 'It uses uncontrolled inputs and refs to avoid re-rendering the whole form on each keystroke, with built-in validation.'],
            ['S', 'Why validate on the server too?', 'Client validation can be bypassed; the server must enforce rules and return errors.']],
        [['Controlled form with validation.',
            r`function SignUp() {
  const [form, setForm] = useState({ email: "", age: "" });
  const [errors, setErrors] = useState({});
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submit = e => {
    e.preventDefault();
    const errs = {};
    if (!form.email.includes("@")) errs.email = "Enter a valid email";
    if (Number(form.age) < 18) errs.age = "Must be 18 or older";
    setErrors(errs);
    if (!Object.keys(errs).length) console.log("submit", form);
  };
  return (
    <form onSubmit={submit} noValidate>
      <label>Email <input name="email" value={form.email} onChange={change} aria-invalid={!!errors.email} /></label>
      {errors.email && <span role="alert">{errors.email}</span>}
      <label>Age <input name="age" type="number" value={form.age} onChange={change} /></label>
      <button>Join</button>
    </form>
  );
}

// OUTPUT: (valid data)
// submit { email: 'a@x.com', age: '30' }`],
            ['Uncontrolled with FormData.',
                r`function Quick() {
  const onSubmit = e => { e.preventDefault(); console.log(Object.fromEntries(new FormData(e.currentTarget))); };
  return <form onSubmit={onSubmit}><input name="q" /><button>Search</button></form>;
}

// OUTPUT:
// { q: 'pen' }`]],
        [['React Hook Form with Zod.',
            r`const schema = z.object({ email: z.string().email(), age: z.coerce.number().min(18) });
const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
<form onSubmit={handleSubmit(data => api.signUp(data))}><input {...register("email")} />{errors.email?.message}</form>

// OUTPUT:
// the form validates with the schema and shows messages without re-rendering on each key`],
            ['Checkbox and select.',
                r`<input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
<select value={country} onChange={e => setCountry(e.target.value)}><option value="IN">India</option><option value="US">USA</option></select>

// OUTPUT:
// state holds true/false and the selected value`]]
    ),

    'react-useeffect': x(
        ['<code>useEffect</code> runs code after the component renders, for side effects such as fetching data, timers and subscriptions.',
            'The dependency array controls when it runs: <code>[]</code> once after mount, <code>[a]</code> when a changes, none after every render.',
            'Return a cleanup function to remove timers or subscriptions.'],
        ['Include every reactive value used inside the effect in the dependency array (the lint rule helps).',
            'Do not use effects to derive data from props or state: compute it during render.',
            'Fetch effects need cancellation or an ignore flag to avoid setting state after unmount or from stale requests.'],
        ['Effects are for synchronizing with external systems; many uses (derived state, event responses) do not need an effect.',
            'In Strict Mode (development) effects run twice on mount to reveal missing cleanup.',
            'Prefer data libraries (TanStack Query, SWR) over hand-written fetch effects for caching, retries and deduplication.'],
        [['F', 'What is useEffect for?', 'Running side effects after rendering, like data fetching, timers and subscriptions.'],
            ['F', 'What does an empty dependency array mean?', 'The effect runs once after the first render (and cleanup runs on unmount).'],
            ['M', 'What is the cleanup function?', 'A function returned from the effect that runs before the next effect and on unmount, to remove subscriptions and timers.'],
            ['M', 'Why include dependencies?', 'So the effect re-runs when values it reads change, avoiding stale data.'],
            ['S', 'When not to use useEffect?', 'For values that can be computed during render, for responding to user events (use handlers), or for resetting state (use keys).'],
            ['S', 'Why does the effect run twice in Strict Mode?', 'To surface missing cleanup logic in development; production runs it once.']],
        [['Fetch with cleanup.',
            r`function User({ id }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/users/" + id, { signal: ac.signal }).then(r => r.json()).then(setUser).catch(e => { if (e.name !== "AbortError") console.error(e); });
    return () => ac.abort();
  }, [id]);
  return user ? <h1>{user.name}</h1> : <p>Loading...</p>;
}

// OUTPUT:
// changing id cancels the previous request and loads the new user`],
            ['Subscription and timer.',
                r`useEffect(() => {
  const onResize = () => setWidth(window.innerWidth);
  window.addEventListener("resize", onResize);
  const t = setInterval(() => setNow(Date.now()), 1000);
  return () => { window.removeEventListener("resize", onResize); clearInterval(t); };
}, []);

// OUTPUT:
// listeners and timers are removed on unmount`]],
        [['Derived value, no effect needed.',
            r`const [first, setFirst] = useState("Asha"), [last, setLast] = useState("R");
const full = first + " " + last;                      // compute during render

// OUTPUT:
// no extra state or effect`],
            ['Stale closure fix.',
                r`useEffect(() => { const id = setInterval(() => setCount(c => c + 1), 1000); return () => clearInterval(id); }, []);

// OUTPUT:
// the counter increases correctly using the functional update`]]
    ),

    'react-context-api': x(
        ['Context shares data with many components without passing props through every level (prop drilling).',
            'Create with <code>createContext</code>, provide with <code>&lt;Context.Provider value={...}&gt;</code>, read with <code>useContext(Context)</code>.',
            'Typical uses: theme, current user, language.'],
        ['Every component that uses the context re-renders when the provider value changes.',
            'Keep the value stable (memoize objects) and split contexts by concern (state vs dispatch) to limit re-renders.',
            'Provide a custom hook (<code>useAuth()</code>) that wraps useContext and throws if used outside the provider.'],
        ['Context is not a full state manager; for frequently changing or large state use a store (Zustand, Redux Toolkit) or selectors.',
            'Combine with <code>useReducer</code> for predictable updates.',
            'Place providers as low as practical so unrelated parts of the tree do not re-render.'],
        [['F', 'What problem does Context solve?', 'Prop drilling: passing data through many component levels.'],
            ['F', 'How do you read context?', 'Call useContext(MyContext) in a component.'],
            ['M', 'When do consumers re-render?', 'Whenever the provider value changes by reference.'],
            ['M', 'How do you avoid unnecessary re-renders?', 'Memoize the value, split contexts and keep providers close to consumers.'],
            ['S', 'Context vs Redux?', 'Context passes values; Redux/stores add selectors, middleware and devtools, avoiding re-renders of unrelated consumers.'],
            ['S', 'Why a custom hook around useContext?', 'It hides the context object, gives a clear error outside the provider and a single place to change implementation.']],
        [['Auth context with reducer and custom hook.',
            r`const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const value = useMemo(() => ({ user, login: setUser, logout: () => setUser(null) }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const c = useContext(AuthContext); if (!c) throw new Error("useAuth must be used inside AuthProvider"); return c; }
function Header() { const { user, logout } = useAuth(); return user ? <button onClick={logout}>Sign out {user.name}</button> : <a href="/login">Sign in</a>; }

// OUTPUT:
// Header shows the user from anywhere in the tree below AuthProvider`],
            ['Theme context.',
                r`const ThemeContext = createContext("light");
<ThemeContext.Provider value="dark"><Page /></ThemeContext.Provider>
function Button() { const theme = useContext(ThemeContext); return <button className={"btn-" + theme}>OK</button>; }

// OUTPUT:
// <button class="btn-dark">OK</button>`]],
        [['Split state and dispatch contexts.',
            r`const StateCtx = createContext(null), DispatchCtx = createContext(null);
<StateCtx.Provider value={state}><DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider></StateCtx.Provider>

// OUTPUT:
// components that only dispatch do not re-render when state changes`],
            ['Zustand alternative.',
                r`const useCart = create(set => ({ items: [], add: i => set(s => ({ items: [...s.items, i] })) }));
const count = useCart(s => s.items.length);       // re-renders only when the count changes

// OUTPUT:
// selector-based subscriptions avoid broad re-renders`]]
    ),

    'react-router-basics': x(
        ['React Router maps URLs to components so an SPA can have multiple pages without reloads.',
            'Set up <code>&lt;BrowserRouter&gt;</code>, define <code>&lt;Routes&gt;</code> with <code>&lt;Route path="/orders" element={...} /&gt;</code> and link with <code>&lt;Link to="/orders"&gt;</code>.',
            'Read URL parameters with <code>useParams()</code>.'],
        ['Nested routes with <code>&lt;Outlet /&gt;</code> share layouts; <code>NavLink</code> styles the active link; <code>Navigate</code> redirects.',
            'Programmatic navigation: <code>const navigate = useNavigate(); navigate("/orders/42")</code>.',
            'Query strings: <code>useSearchParams()</code>.'],
        ['Data routers (<code>createBrowserRouter</code>) add loaders, actions and error elements for data fetching and mutations.',
            'Lazy load routes with <code>lazy()</code> or route-level <code>lazy</code> for code splitting.',
            'Protect routes with a wrapper component, and always enforce authorization on the server.'],
        [['F', 'What does React Router do?', 'It maps URLs to components for client-side routing in React apps.'],
            ['F', 'How do you create a link?', 'With the Link component, which navigates without a page reload.'],
            ['M', 'How do you read a URL parameter?', 'useParams(), for a route such as /orders/:id.'],
            ['M', 'What is Outlet?', 'A placeholder in a parent route where the matching child route renders, used for shared layouts.'],
            ['S', 'Loaders and actions?', 'In data routers a loader fetches data before the route renders and an action handles form submissions, giving automatic revalidation.'],
            ['S', 'How do you protect routes?', 'A wrapper route checks authentication and redirects to login; the API must still verify permissions.']],
        [['Routes with a layout and params.',
            r`function App() {
  return (
    <BrowserRouter>
      <nav><NavLink to="/">Home</NavLink> <NavLink to="/orders">Orders</NavLink></nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<OrdersLayout />}>
          <Route index element={<OrderList />} />
          <Route path=":id" element={<OrderDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
function OrderDetail() { const { id } = useParams(); return <h1>Order {id}</h1>; }

// OUTPUT: (visiting /orders/42)
// <h1>Order 42</h1> inside the OrdersLayout`],
            ['Programmatic navigation and search params.',
                r`const navigate = useNavigate();
const [params, setParams] = useSearchParams();
const page = Number(params.get("page") ?? 1);
const next = () => setParams({ page: page + 1 });
const go = () => navigate("/orders/42", { replace: false });

// OUTPUT:
// URL becomes /orders?page=2`]],
        [['Data router with loader.',
            r`const router = createBrowserRouter([{ path: "/orders/:id", element: <OrderDetail />, loader: ({ params }) => fetch("/api/orders/" + params.id), errorElement: <ErrorPage /> }]);
function OrderDetail() { const order = useLoaderData(); return <h1>{order.id}</h1>; }

// OUTPUT:
// the data loads before the component renders`],
            ['Lazy route.',
                r`{ path: "/reports", lazy: () => import("./Reports") }

// OUTPUT:
// the Reports chunk loads on first visit`]]
    ),

    'react-component-lifecycle': x(
        ['A component has a lifecycle: it mounts (is created and added to the page), updates when props or state change, and unmounts (is removed).',
            'In function components use <code>useEffect</code> for lifecycle work: mount, update and cleanup on unmount.',
            'Class components used methods: <code>componentDidMount</code>, <code>componentDidUpdate</code>, <code>componentWillUnmount</code>.'],
        ['Mapping: <code>useEffect(fn, [])</code> is like componentDidMount (and its cleanup like componentWillUnmount); <code>useEffect(fn, [dep])</code> like componentDidUpdate for dep.',
            'Render phase must be pure; effects run after the browser paints (use <code>useLayoutEffect</code> to run before paint).',
            'Strict Mode double-invokes render and effects in development to surface impure code.'],
        ['Think in synchronization, not lifecycle: an effect describes how to sync with something for given values, and cleanup how to stop.',
            'Error boundaries (class components) catch render errors in the subtree; there is no hook version yet.',
            'Concurrent features (Suspense, transitions) can render components that are never committed, so render must have no side effects.'],
        [['F', 'What are the three phases of a component lifecycle?', 'Mounting, updating and unmounting.'],
            ['F', 'Which hook replaces componentDidMount?', 'useEffect with an empty dependency array.'],
            ['M', 'How do you run cleanup on unmount?', 'Return a cleanup function from useEffect.'],
            ['M', 'useEffect vs useLayoutEffect?', 'useEffect runs after paint; useLayoutEffect runs synchronously after DOM updates but before paint, for measuring layout.'],
            ['S', 'Why must render be pure?', 'React may render a component multiple times or discard a render (concurrent rendering), so side effects in render would run unexpectedly.'],
            ['S', 'How do you catch errors in a subtree?', 'With an error boundary class component using getDerivedStateFromError and componentDidCatch.']],
        [['Lifecycle with hooks.',
            r`function Demo({ id }) {
  useEffect(() => { console.log("mounted"); return () => console.log("unmounted"); }, []);
  useEffect(() => { console.log("id changed to", id); return () => console.log("cleanup for", id); }, [id]);
  return <p>{id}</p>;
}

// OUTPUT: (id 1, then 2, then removed)
// mounted
// id changed to 1
// cleanup for 1
// id changed to 2
// cleanup for 2
// unmounted`],
            ['Class equivalent.',
                r`class Demo extends React.Component {
  componentDidMount() { console.log("mounted"); }
  componentDidUpdate(prev) { if (prev.id !== this.props.id) console.log("id changed"); }
  componentWillUnmount() { console.log("unmounted"); }
  render() { return <p>{this.props.id}</p>; }
}

// OUTPUT:
// mounted ... id changed ... unmounted`]],
        [['Measure layout before paint.',
            r`useLayoutEffect(() => { setHeight(ref.current.getBoundingClientRect().height); }, [text]);

// OUTPUT:
// the measured height is applied before the browser paints, avoiding flicker`],
            ['Error boundary.',
                r`class Boundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { reportError(error, info.componentStack); }
  render() { return this.state.error ? <p>Something went wrong.</p> : this.props.children; }
}

// OUTPUT:
// a failing child shows the fallback instead of crashing the whole app`]]
    )
};

export const react2Deep: Record<string, Deep> = {
    'react-conditional-rendering': dv(
        [`Conditional rendering is ordinary JavaScript producing different element trees. During reconciliation React compares the new tree with the previous one: if the element type and position are the same, the existing instance (with its state) is reused; if the type or key differs, the old subtree is unmounted and a new one is mounted. null, undefined, true and false render nothing.`,
            r`function Demo({ editing }) {
  return editing ? <Input key="edit" /> : <Input key="view" />;       // different keys: state resets when toggling
}
function Demo2({ editing }) {
  return <div>{editing ? <Input /> : <Input />}</div>;                // same type and position: text typed is kept
}

// OUTPUT:
// Demo clears the input when toggling; Demo2 preserves it`],
        [`Patterns: early returns for loading/error/empty, ternary for two branches, &amp;&amp; for optional pieces, <code>switch</code> or lookup objects for many cases, component maps (<code>const views = { list: List, grid: Grid }</code>), <code>Suspense</code> fallback for async parts, and <code>hidden</code>/CSS for keeping state while hiding.`,
            r`const views = { list: OrderList, grid: OrderGrid, map: OrderMap };
function Orders({ mode, status }) {
  if (status === "loading") return <Skeleton />;
  if (status === "error") return <ErrorState />;
  const View = views[mode] ?? OrderList;
  return <View />;
}
<div hidden={!active}><ExpensiveTab /></div>        // stays mounted, keeps state

// OUTPUT:
// the selected view renders; hidden tab keeps its state`],
        [`Mistakes: the 0 rendering bug, deeply nested ternaries, forgetting loading and error states (flicker or blank screens), conditionally calling hooks (not allowed), and relying on conditional rendering for security (a hidden button is still client code). Keep conditions flat and hooks unconditional.`,
            r`function Bad({ user }) {
  if (!user) return null;
  const [n, setN] = useState(0);              // hook after an early return: breaks the rules of hooks
  return <p>{n}</p>;
}
function Good({ user }) { const [n, setN] = useState(0); if (!user) return null; return <p>{n}</p>; }

// OUTPUT:
// Bad: Error: Rendered more hooks than during the previous render.`],
        [`Unmounting and remounting expensive components is costly. Keep heavy tabs mounted but hidden when switching is frequent, and lazy-mount them on first use. Use Suspense and lazy to defer code for rarely shown branches.`,
            r`const [visited, setVisited] = useState(new Set([0]));
{tabs.map((t, i) => visited.has(i) && <div key={t.id} hidden={i !== active}><t.Component /></div>)}

// OUTPUT:
// each tab is created on first visit and then kept alive`],
        [`Real-world: feature flags and permissions. A small component hides UI for features that are off, while the server independently enforces access.`,
            r`function Feature({ name, fallback = null, children }) { const flags = useFlags(); return flags[name] ? children : fallback; }
<Feature name="newCheckout" fallback={<OldCheckout />}><NewCheckout /></Feature>

// OUTPUT:
// the new checkout is shown only when the flag is enabled`]
    ),

    'react-lists-keys': dv(
        [`Reconciliation of children lists uses keys: React builds a map of the previous children by key and matches new children against it. A matching key keeps the same component instance (and DOM node), so state and focus move with the item; new keys mount new instances, missing keys unmount. Without keys React falls back to index matching.`,
            r`function Row({ label }) { const [checked, setChecked] = useState(false); return <li><input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} /> {label}</li>; }
// items ["A","B","C"]; user checks "B"; then "A" is removed
{items.map((label, i) => <Row key={i} label={label} />)}        // state stays at index 1: now "C" is shown checked
{items.map(label => <Row key={label} label={label} />)}         // B keeps its state

// OUTPUT:
// index keys leave the checked state on the wrong row after removal`],
        [`Key sources: database ids, UUIDs created when the item is created (not during render), natural unique values, composite keys (<code>type + "-" + id</code>). Fragments with keys group multiple elements per item. Changing a component key deliberately resets its state (a common reset technique).`,
            r`{messages.map(m => <Fragment key={m.id}><dt>{m.author}</dt><dd>{m.text}</dd></Fragment>)}
<ProfileForm key={userId} user={user} />          // new user: form state resets without an effect
const withIds = useMemo(() => items.map(i => ({ ...i, uid: i.id ?? crypto.randomUUID() })), [items]);

// OUTPUT:
// each description pair keeps its identity; switching userId gives a fresh form`],
        [`Mistakes: Math.random() or Date.now() as keys during render (remount every time), duplicate keys, keys on the wrong element (they must be on the outermost element returned by map), index keys with reordering, and large lists without virtualization. Generate stable ids at data creation.`,
            r`{items.map(i => <li key={Math.random()}>{i.name}</li>)}      // remounts all items on every render
// Warning: Encountered two children with the same key, 'a'. Keys should be unique so that components maintain their identity.

// OUTPUT:
// input focus and animations are lost every render with random keys`],
        [`Updating one item in a long list re-renders the list; memoize rows and keep their props stable. Virtualize lists beyond a few hundred rows and paginate or infinite-scroll data from the server.`,
            r`const Row = memo(({ item, onToggle }) => <li onClick={() => onToggle(item.id)}>{item.name}</li>);
const onToggle = useCallback(id => setItems(list => list.map(i => i.id === id ? { ...i, done: !i.done } : i)), []);

// OUTPUT: (Profiler)
// toggling one item re-renders 1 row instead of 5,000`],
        [`Real-world: a sortable, filterable table with stable keys, memoized rows, a virtualized body and server-side pagination.`,
            r`const visible = useMemo(() => rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase())).sort(by(sortKey, dir)), [rows, q, sortKey, dir]);
<FixedSizeList height={520} itemCount={visible.length} itemSize={40} itemKey={i => visible[i].id}>{({ index, style }) => <Row style={style} item={visible[index]} />}</FixedSizeList>

// OUTPUT:
// smooth sorting and filtering on 20,000 rows`]
    ),

    'react-forms': dv(
        [`In a controlled form every keystroke calls onChange, which sets state and re-renders the component, so the input value always equals state. React sets the DOM value from state on each render. Uncontrolled inputs keep their value in the DOM; you read it on demand through refs or FormData. A form submit triggers onSubmit where you validate and send data.`,
            r`function Controlled() {
  const [v, setV] = useState("");
  console.log("render", v);
  return <input value={v} onChange={e => setV(e.target.value)} />;
}
function Uncontrolled() {
  const ref = useRef();
  return (<><input ref={ref} defaultValue="" /><button onClick={() => console.log(ref.current.value)}>Read</button></>);
}

// OUTPUT: (typing ab in Controlled)
// render
// render a
// render ab`],
        [`Techniques: one change handler with name attributes, nested state updates, derived validation, async validation with debounce, file inputs (<code>e.target.files</code>), <code>useActionState</code> and form actions (React 19), schema validation (Zod/Yup), React Hook Form (<code>register</code>, <code>handleSubmit</code>, <code>watch</code>), and optimistic UI for submissions.`,
            r`const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "" } });
const onSubmit = async data => { try { await api.signUp(data); } catch (e) { if (e.status === 409) setError("email", { message: "Email already registered" }); } };
<form onSubmit={handleSubmit(onSubmit)}><input {...register("email")} /><button disabled={isSubmitting}>Join</button></form>

// OUTPUT:
// server validation errors are shown next to the field`],
        [`Mistakes: switching between controlled and uncontrolled (value undefined to defined warning), forgetting preventDefault, storing numbers as strings and comparing wrongly, no labels, not disabling the button during submit (double submit), and only validating on the client. Initialize state with empty strings and validate on the server too.`,
            r`const [age, setAge] = useState();                       // undefined: input starts uncontrolled
<input value={age} onChange={e => setAge(e.target.value)} />
const [age2, setAge2] = useState("");                      // always controlled

// OUTPUT:
// Warning: A component is changing an uncontrolled input to be controlled`],
        [`Large controlled forms re-render fully on each keystroke. Split into field components with local state, use React Hook Form (uncontrolled), or debounce expensive validation. Measure with the Profiler.`,
            r`const watchEmail = useWatch({ name: "email", control });      // only subscribed components re-render
const debounced = useDebouncedCallback(v => api.checkEmail(v), 400);

// OUTPUT: (Profiler)
// a 40-field form: 38 ms per keystroke (controlled) vs 3 ms (React Hook Form)`],
        [`Real-world: a checkout form with client validation, accessible error messages, a disabled submit while pending, idempotency on the server and focus on the first error.`,
            r`const onSubmit = async data => {
  setPending(true);
  try { await api.pay(data, { headers: { "Idempotency-Key": keyRef.current } }); navigate("/thanks"); }
  catch (e) { setServerError(e.message); firstErrorRef.current?.focus(); }
  finally { setPending(false); }
};

// OUTPUT:
// retries after a network failure do not charge twice (same idempotency key)`]
    ),

    'react-useeffect': dv(
        [`After React commits a render, it runs effects whose dependencies changed since the previous render (compared with Object.is). Before running an effect again, it runs the previous effect's cleanup. On unmount all cleanups run. Effects see the props and state of the render they belong to (closures), which is why dependencies matter.`,
            r`function Demo({ id }) {
  useEffect(() => {
    console.log("effect for", id);
    return () => console.log("cleanup for", id);
  }, [id]);
  return null;
}

// OUTPUT: (id 1 -> 2 -> unmount)
// effect for 1
// cleanup for 1
// effect for 2
// cleanup for 2`],
        [`Related hooks and patterns: <code>useLayoutEffect</code>, <code>useInsertionEffect</code>, <code>useSyncExternalStore</code> (subscribe to stores), <code>useEvent</code>-style callbacks, custom hooks (<code>useFetch</code>, <code>useLocalStorage</code>, <code>useDebounce</code>), and libraries for server state (TanStack Query, SWR).`,
            r`function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => JSON.parse(localStorage.getItem(key) ?? JSON.stringify(initial)));
  useEffect(() => { localStorage.setItem(key, JSON.stringify(v)); }, [key, v]);
  return [v, setV];
}
function useDebounce(value, ms) { const [d, setD] = useState(value); useEffect(() => { const t = setTimeout(() => setD(value), ms); return () => clearTimeout(t); }, [value, ms]); return d; }

// OUTPUT:
// reusable hooks encapsulate effects with their cleanup`],
        [`Mistakes: missing dependencies (stale values), object or function dependencies that change every render (effect runs constantly), effects that set state causing loops, fetching without cancellation (race conditions), and using effects for things that belong in event handlers or render. Follow the exhaustive-deps lint rule.`,
            r`useEffect(() => { fetch("/api/search?q=" + q).then(r => r.json()).then(setResults); }, [q]);       // slow earlier requests can overwrite newer results
useEffect(() => {
  let ignore = false;
  fetch("/api/search?q=" + q).then(r => r.json()).then(d => { if (!ignore) setResults(d); });
  return () => { ignore = true; };
}, [q]);

// OUTPUT:
// only the latest query results are applied`],
        [`Too many effects and re-runs cost time. Remove unnecessary effects, memoize object dependencies, batch updates, and use query libraries to cache and deduplicate requests. Check how often effects run with the Profiler and console logs.`,
            r`const options = useMemo(() => ({ page, size }), [page, size]);
useEffect(() => { load(options); }, [options]);                 // stable dependency
const { data } = useQuery({ queryKey: ["orders", page], queryFn: () => api.orders(page), staleTime: 30_000, placeholderData: keepPreviousData });

// OUTPUT:
// repeated visits within 30 seconds use cached data with no new requests`],
        [`Real-world: live data. An effect opens a WebSocket for a room, handles messages with the latest handler via a ref, and closes the connection in cleanup when the room changes.`,
            r`useEffect(() => {
  const ws = new WebSocket("wss://api.example.com/rooms/" + roomId);
  ws.onmessage = e => setMessages(m => [...m, JSON.parse(e.data)]);
  ws.onerror = () => setStatus("error");
  return () => ws.close();
}, [roomId]);

// OUTPUT:
// switching rooms closes the old socket and opens a new one`]
    ),

    'react-context-api': dv(
        [`Context stores a value on a Provider in the tree. useContext reads the nearest Provider's value above the component and subscribes the component to it. When the Provider's value changes (Object.is), React re-renders all consumers below it, skipping memoized components that do not consume it. There is no built-in selector, so any change re-renders every consumer.`,
            r`const Ctx = createContext({ count: 0, label: "x" });
function Provider({ children }) {
  const [count, setCount] = useState(0);
  return <Ctx.Provider value={{ count, label: "x" }}>{children}</Ctx.Provider>;       // new object each render
}
function Label() { useContext(Ctx); console.log("Label render"); return null; }

// OUTPUT: (every Provider re-render)
// Label render        (even though label never changes: the value object is new)`],
        [`Good practice: memoize provider values, split state and actions into separate contexts, create a custom hook with a guard, keep providers near where needed, combine with <code>useReducer</code>, and consider selector-based libraries (Zustand, Jotai, Redux) for fast-changing shared state. Default values are used when there is no provider.`,
            r`const CartState = createContext(null), CartActions = createContext(null);
export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const actions = useMemo(() => ({ add: i => dispatch({ type: "add", item: i }), clear: () => dispatch({ type: "clear" }) }), []);
  return (<CartActions.Provider value={actions}><CartState.Provider value={items}>{children}</CartState.Provider></CartActions.Provider>);
}
export const useCartItems = () => useContext(CartState);
export const useCartActions = () => useContext(CartActions);

// OUTPUT:
// an Add button that only uses actions never re-renders when items change`],
        [`Mistakes: putting everything in one big context, inline object values, using context for rapidly changing values like mouse position, forgetting the provider (silently using the default), and testing without providers. Use focused contexts and a wrapper in tests.`,
            r`function renderWithProviders(ui) { return render(<AuthProvider><ThemeProvider>{ui}</ThemeProvider></AuthProvider>); }
const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error("Wrap the app in <AuthProvider>"); return c; };

// OUTPUT:
// a clear error instead of undefined user bugs`],
        [`Context update cost scales with the number of consumers. For large trees measure with the Profiler, move rapidly changing state to a store with selectors, or pass values through props to memoized children where the data path is short.`,
            r`const useCartCount = create(set => ({ items: [], add: i => set(s => ({ items: [...s.items, i] })) }));
function Badge() { const n = useCartCount(s => s.items.length); return <span>{n}</span>; }

// OUTPUT: (Profiler)
// adding an item re-renders only Badge, not every consumer of a context`],
        [`Real-world: theming and localization contexts at the root (rarely changing), an auth context with a session refresh, and a small store for the shopping cart.`,
            r`<ThemeProvider><I18nProvider locale={locale}><AuthProvider><QueryClientProvider client={queryClient}><App /></QueryClientProvider></AuthProvider></I18nProvider></ThemeProvider>

// OUTPUT:
// stable cross-cutting concerns are available everywhere with no prop drilling`]
    ),

    'react-router-basics': dv(
        [`The router keeps location state (path, search, hash) in sync with the History API. A matcher ranks route patterns against the path (static segments beat dynamic ones), builds the match tree (parent and child routes), and renders the matching elements nested through Outlet. Link intercepts clicks and calls navigate instead of loading a new document.`,
            r`const router = createBrowserRouter([
  { path: "/", element: <Layout />, errorElement: <ErrorPage />, children: [
    { index: true, element: <Home /> },
    { path: "orders", element: <Orders />, loader: ordersLoader },
    { path: "orders/:id", element: <OrderDetail />, loader: orderLoader, action: orderAction },
    { path: "*", element: <NotFound /> },
  ] },
]);
createRoot(root).render(<RouterProvider router={router} />);

// OUTPUT:
// /orders/42 renders Layout > OrderDetail with the order loaded before render`],
        [`Features: nested layouts, index routes, dynamic and splat segments, search params, <code>NavLink</code> active styling, <code>useNavigate</code>, <code>Navigate</code>, <code>useLocation</code>, route <code>handle</code>, loaders/actions/deferred data, <code>useFetcher</code>, <code>lazy</code> routes, scroll restoration, and hash or memory routers for special environments.`,
            r`function OrderDetail() {
  const order = useLoaderData();
  const navigate = useNavigation();
  return (<><h1>Order {order.id}</h1><Form method="post"><button disabled={navigate.state === "submitting"}>Cancel order</button></Form></>);
}
export async function orderAction({ params, request }) { await api.cancel(params.id); return redirect("/orders"); }

// OUTPUT:
// submitting the form calls the action, then redirects and revalidates the loaders`],
        [`Mistakes: using plain anchors (full page reload), forgetting the server fallback to index.html, relative path confusion in nested routes, relying on client-side route guards for security, and not handling 404 and error cases. Use Link, a catch-all route and server-enforced authorization.`,
            r`<a href="/orders">Orders</a>                    // full reload
<Link to="/orders">Orders</Link>                  // client-side navigation
// guard only protects the UI
<Route element={<RequireAuth />}><Route path="/admin" element={<Admin />} /></Route>

// OUTPUT:
// the API must also return 403 for non-admin users`],
        [`Routing performance: code split per route, prefetch on hover or when links appear (<code>prefetch</code> in frameworks), load data in parallel with code through loaders, and avoid waterfalls (parent waits for data before children start loading).`,
            r`{ path: "reports", lazy: async () => { const [{ default: Component }, { loader }] = await Promise.all([import("./Reports"), import("./reportsLoader")]); return { Component, loader }; } }
<Link to="/reports" onMouseEnter={() => import("./Reports")}>Reports</Link>

// OUTPUT:
// code and data for the route load together; hovering prefetches the code`],
        [`Real-world: an e-commerce app with product list and detail routes, URL-based filters (shareable links), a protected account area, and a not-found page.`,
            r`const [params, setParams] = useSearchParams();
const category = params.get("category") ?? "all", sort = params.get("sort") ?? "popular";
const setFilter = (k, v) => setParams(p => { const n = new URLSearchParams(p); n.set(k, v); n.set("page", "1"); return n; });

// OUTPUT:
// /products?category=pens&sort=price&page=1 is bookmarkable and shareable`]
    ),

    'react-component-lifecycle': dv(
        [`React works in phases. Render: call components to compute the next tree (pure, may run more than once or be discarded). Commit: apply DOM changes, then run layout effects synchronously, then (after paint) passive effects. For each component: mount runs effects, update re-runs effects whose dependencies changed (after cleanup), unmount runs cleanups.`,
            r`function Demo() {
  console.log("render");
  useLayoutEffect(() => { console.log("layout effect (before paint)"); return () => console.log("layout cleanup"); });
  useEffect(() => { console.log("effect (after paint)"); return () => console.log("effect cleanup"); });
  return <p>hi</p>;
}

// OUTPUT: (mount, then unmount)
// render
// layout effect (before paint)
// effect (after paint)
// layout cleanup
// effect cleanup`],
        [`Class lifecycle methods map to hooks: constructor/state to useState, componentDidMount to useEffect(…, []), componentDidUpdate to useEffect with dependencies, componentWillUnmount to cleanup, getDerivedStateFromProps to deriving during render, shouldComponentUpdate to memo, getSnapshotBeforeUpdate to useLayoutEffect, and error boundaries still need classes.`,
            r`class Clock extends React.Component {
  state = { now: new Date() };
  componentDidMount() { this.t = setInterval(() => this.setState({ now: new Date() }), 1000); }
  componentWillUnmount() { clearInterval(this.t); }
  render() { return <p>{this.state.now.toLocaleTimeString()}</p>; }
}
function ClockHook() { const [now, setNow] = useState(new Date()); useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []); return <p>{now.toLocaleTimeString()}</p>; }

// OUTPUT:
// both versions show a ticking clock and clean up the timer`],
        [`Mistakes: side effects in render, forgetting cleanup (leaks, duplicate listeners), assuming effects run once (Strict Mode runs them twice in development), reading stale props in async callbacks, and updating state after unmount. Write idempotent effects with cleanup.`,
            r`useEffect(() => { window.addEventListener("resize", onResize); }, []);      // never removed: leak and duplicates
useEffect(() => { window.addEventListener("resize", onResize); return () => window.removeEventListener("resize", onResize); }, []);

// OUTPUT:
// in Strict Mode the first version registers the listener twice`],
        [`Lifecycle cost shows up as slow mounts (heavy initialization), expensive effects after every render, and layout effects that block paint. Defer non-critical work (<code>requestIdleCallback</code>, <code>useDeferredValue</code>), lazy initialize state and keep layout effects tiny.`,
            r`const [data] = useState(() => expensiveInit());              // runs once, not every render
useEffect(() => { const id = requestIdleCallback(() => warmCaches()); return () => cancelIdleCallback(id); }, []);

// OUTPUT:
// the first paint is not delayed by cache warming`],
        [`Real-world: a component that tracks page views and focus. It sends an analytics event on mount and route change, pauses a video on unmount, and flushes pending data when the tab becomes hidden.`,
            r`useEffect(() => { analytics.page(location.pathname); }, [location.pathname]);
useEffect(() => { const f = () => document.hidden && flushQueue(); document.addEventListener("visibilitychange", f); return () => { document.removeEventListener("visibilitychange", f); flushQueue(); }; }, []);

// OUTPUT:
// events are sent per route change and flushed when the tab is hidden or the component unmounts`]
    )
};
