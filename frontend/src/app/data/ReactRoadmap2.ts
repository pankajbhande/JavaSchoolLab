// React roadmap, part 2: phases 6-10 (hooks, forms and validation, React Router, REST API integration, TypeScript with React).
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const rp = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('rr', n, title, priority, topics);

export const reactRoadmap2: SubTopic[] = [
  rp(6, 'React Hooks', 'Essential', [
    topic(
      'rr-hook-useeffect',
      'useEffect: Side Effects, Dependencies and Cleanup',
      [
        blk(`<h3>Synchronising with the outside world</h3>
• An <b>effect</b> runs <em>after</em> React has rendered and committed to the DOM. Use it for things outside React: network requests, subscriptions, timers, manual DOM work, <code>document.title</code>, third-party widgets.<br>
• <code>useEffect(setup, deps)</code>: with <code>[]</code> it runs once after mount; with <code>[a, b]</code> after mount and whenever <code>a</code> or <code>b</code> change; with no array after every render.<br>
• Return a <b>cleanup</b> function; it runs before the effect re-runs and on unmount.`,
          `import { useEffect, useState } from "react";

function DocumentTitle({ count }) {
  useEffect(() => {
    document.title = "Cart (" + count + ")";
  }, [count]);                                     // re-run only when count changes
  return null;
}

function Ticker() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);                // cleanup: stop the timer on unmount
  }, []);
  return <p>{seconds}s</p>;
}`,
        ),
      ],
      [
        blk(`<h3>Dependency rules and common bugs</h3>
• <b>Every reactive value used inside the effect</b> (props, state, functions defined in the component) must be in the dependency array. The ESLint rule <code>react-hooks/exhaustive-deps</code> checks this. Do not silence it; restructure instead.<br>
• <b>Infinite loop</b>: setting state inside an effect that depends on that state, or an object/array/function created in render listed as a dependency (a new reference each time).<br>
• <b>Stale closure</b>: an effect with missing deps keeps the old values; use the functional setter (<code>setN(n =&gt; n + 1)</code>) or add the dependency.<br>
• <b>Race conditions</b>: when an input changes quickly, an older request may finish last. Ignore stale responses with a flag or <code>AbortController</code> in cleanup.`,
          `// Infinite loop: the effect changes "data", and "data" is its own dependency
// useEffect(() => { setData([...data, 1]); }, [data]);   // DON'T

// Object dependency created each render: effect runs every render
function Bad({ id }) {
  const options = { id };                                // new object every render
  useEffect(() => { load(options); }, [options]);        // re-runs constantly
}
function Good({ id }) {
  useEffect(() => { load({ id }); }, [id]);              // depend on the primitive
}

function Search({ q }) {
  const [results, setResults] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/search?q=" + encodeURIComponent(q), { signal: controller.signal })
      .then(r => r.json()).then(setResults)
      .catch(e => { if (e.name !== "AbortError") console.error(e); });
    return () => controller.abort();                     // old request cannot overwrite the new one
  }, [q]);
  return <p>{results.length} results</p>;
}`,
        ),
      ],
      [
        blk(`<h3>You might not need an effect</h3>
• Do <b>not</b> use effects to transform data for rendering (compute it in render), to handle user events (use handlers), or to reset state when a prop changes (use a <code>key</code>).<br>
• Use effects for <b>synchronisation</b>: connect to a chat server, subscribe to a store, start an animation. Prefer <code>useSyncExternalStore</code> for external stores and a data library (TanStack Query) for server data.<br>
• In development <b>StrictMode</b> runs setup, cleanup, setup on mount to check that your cleanup is correct. This is intentional.<br>
• <code>useLayoutEffect</code> runs before paint (measure the DOM, avoid flicker); <code>useInsertionEffect</code> is for CSS-in-JS libraries.`,
          `// Needless effect: derived state
function Wrong({ items }) {
  const [count, setCount] = useState(0);
  useEffect(() => { setCount(items.length); }, [items]);     // extra render for no reason
}
function Right({ items }) {
  const count = items.length;                                // just compute it
}

// Reset state with a key, not an effect
<Profile key={userId} userId={userId} />

// Measure before paint to avoid flicker
function Tooltip({ children }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => setHeight(ref.current.getBoundingClientRect().height), []);
  return <div ref={ref}>{children} ({height}px)</div>;
}`,
        ),
      ],
      [
        ['What does the dependency array do?', 'It lists the reactive values the effect reads. React re-runs the effect after a render where any of them changed ([] = only after mount, omitted = after every render).'],
        ['Why does my effect run twice in development?', 'StrictMode intentionally mounts, unmounts and remounts components to reveal missing cleanup. It does not happen in production builds.'],
        ['When should you NOT use useEffect?', 'For computing values from props/state (derive in render), responding to user events (use handlers) and resetting state on prop change (use key). Effects are for synchronising with external systems.'],
      ],
    ),
    topic(
      'rr-hook-refs-memo',
      'useRef, useMemo, useCallback and Friends',
      [
        blk(`<h3>useRef: values that do not trigger renders</h3>
• <code>const ref = useRef(initial)</code> gives a stable object <code>{ current }</code> that persists across renders. Changing <code>ref.current</code> does <b>not</b> re-render.<br>
• Two uses: (1) reach a DOM node (<code>&lt;input ref={ref} /&gt;</code> then <code>ref.current.focus()</code>), (2) hold mutable values that are not part of the UI (timer ids, previous value, latest callback).<br>
• Never read or write <code>ref.current</code> during render (except to initialise).`,
          `import { useRef, useState, useEffect } from "react";

function SearchBox() {
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current.focus(); }, []);       // focus on mount
  return (
    <>
      <input ref={inputRef} placeholder="Search..." />
      <button onClick={() => { inputRef.current.value = ""; inputRef.current.focus(); }}>Clear</button>
    </>
  );
}

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0);
  const timerId = useRef(null);                              // not UI state
  const start = () => { timerId.current = setInterval(() => setElapsed(e => e + 1), 1000); };
  const stop = () => clearInterval(timerId.current);
  return <><p>{elapsed}s</p><button onClick={start}>Start</button><button onClick={stop}>Stop</button></>;
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;                                        // value from the previous render
}`,
        ),
      ],
      [
        blk(`<h3>useMemo and useCallback: caching</h3>
• <code>useMemo(() =&gt; compute(a, b), [a, b])</code> caches a <b>value</b> until a dependency changes. <code>useCallback(fn, deps)</code> caches a <b>function</b> (same as <code>useMemo(() =&gt; fn, deps)</code>).<br>
• Use them when (1) a calculation is genuinely expensive, or (2) a value/function is passed to a <code>React.memo</code> child or is a dependency of another hook and its identity matters.<br>
• They are optimisations, not guarantees: your code must work without them. Measure before adding. Overuse adds complexity and memory cost for no gain.`,
          `import { memo, useCallback, useMemo, useState } from "react";

const Row = memo(function Row({ item, onSelect }) {
  console.log("render row", item.id);
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function List({ items }) {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => items.filter(i => i.name.includes(query)), [items, query]);
  const handleSelect = useCallback(id => setSelected(id), []);   // stable identity -> Row can skip re-render

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <p>Selected: {selected}</p>
      <ul>{visible.map(i => <Row key={i.id} item={i} onSelect={handleSelect} />)}</ul>
    </>
  );
}`,
        ),
      ],
      [
        blk(`<h3>More built-in hooks</h3>
• <code>useId</code>: unique, SSR-safe ids for label/input pairs and ARIA attributes.<br>
• <code>useTransition</code> / <code>useDeferredValue</code>: keep typing responsive while a heavy update renders in the background.<br>
• <code>useSyncExternalStore</code>: subscribe to external stores safely (used by state libraries).<br>
• <code>useImperativeHandle</code> with <code>forwardRef</code> (or a <code>ref</code> prop in React 19): expose a small imperative API (<code>focus()</code>, <code>reset()</code>) from a component.<br>
• <code>use</code> (React 19) reads a promise or context during render, integrating with Suspense.`,
          `import { useId, useTransition, useDeferredValue, useState, useImperativeHandle, forwardRef, useRef } from "react";

function Field({ label }) {
  const id = useId();                                       // stable and unique, also during SSR
  return <><label htmlFor={id}>{label}</label><input id={id} /></>;
}

function Filter({ items }) {
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q);                      // lags behind while heavy work runs
  const results = useMemo(() => items.filter(i => i.includes(deferred)), [items, deferred]);
  return <><input value={q} onChange={e => setQ(e.target.value)} /><Results data={results} /></>;
}

const FancyInput = forwardRef(function FancyInput(props, ref) {
  const inner = useRef(null);
  useImperativeHandle(ref, () => ({ focus: () => inner.current.focus(), clear: () => { inner.current.value = ""; } }));
  return <input ref={inner} {...props} />;
});`,
        ),
      ],
      [
        ['useRef vs useState?', 'Both persist across renders, but changing state re-renders the component while changing ref.current does not. Use state for data shown in the UI and refs for DOM nodes and non-visual values like timer ids.'],
        ['useMemo vs useCallback?', 'useMemo caches a computed value, useCallback caches a function. Both rely on the dependency array and are performance optimisations, not semantic guarantees.'],
        ['When is React.memo useful?', 'When a component re-renders often with the same props and its render is costly. It compares props shallowly, so object/function props must keep stable identity (useMemo/useCallback) for it to help.'],
      ],
    ),
    topic(
      'rr-hook-custom-rules',
      'Custom Hooks and the Rules of Hooks',
      [
        blk(`<h3>Rules of Hooks</h3>
• Call hooks <b>only at the top level</b> of a component or a custom hook: not inside loops, conditions, nested functions or after an early <code>return</code>.<br>
• Call hooks only from <b>React function components or custom hooks</b>, never from regular functions or classes.<br>
• React identifies each hook by its <b>call order</b>; the rules guarantee the order is identical on every render. Install <code>eslint-plugin-react-hooks</code> to enforce them.`,
          `function Profile({ id }) {
  // ALWAYS call hooks first, unconditionally
  const [user, setUser] = useState(null);
  useEffect(() => { fetchUser(id).then(setUser); }, [id]);

  if (!user) return <p>Loading...</p>;     // early return only AFTER all hooks
  return <h2>{user.name}</h2>;
}

function Wrong({ show }) {
  if (show) {
    const [x, setX] = useState(0);        // breaks hook order between renders
  }
}`,
        ),
      ],
      [
        blk(`<h3>Writing custom hooks</h3>
• A custom hook is a function whose name starts with <code>use</code> and that calls other hooks. It shares <b>logic</b>, not state: each component that calls it gets its own state.<br>
• Typical candidates: data fetching (<code>useFetch</code>), form handling (<code>useForm</code>), <code>useLocalStorage</code>, <code>useDebounce</code>, <code>useOnlineStatus</code>, <code>useMediaQuery</code>, <code>useClickOutside</code>.<br>
• Return what the consumer needs: a value, a tuple <code>[value, setValue]</code> or an object. Keep the API small.`,
          `import { useEffect, useState } from "react";

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw === null ? initial : JSON.parse(raw); }
    catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

export function useDebounce(value, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online;
}

function Settings() {
  const [theme, setTheme] = useLocalStorage("theme", "light");     // each component gets its own copy of the state
  return <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme}</button>;
}`,
        ),
      ],
      [
        blk(`<h3>Design guidelines and a fetch hook</h3>
• Name hooks after what they do (<code>useUser</code>, not <code>useData</code>). Do not create "lifecycle" hooks like <code>useMount</code>: they hide dependencies.<br>
• Hooks compose: a hook can use other hooks. Test them with <code>renderHook</code> from React Testing Library.<br>
• Mind the closure: hooks that accept a callback should keep the latest callback in a ref to avoid stale values, without forcing the effect to re-subscribe.<br>
• For server data prefer a mature library (TanStack Query); a handwritten <code>useFetch</code> is a good learning tool.`,
          `function useFetch(url) {
  const [state, setState] = useState({ data: null, error: null, status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, status: "loading" }));
    fetch(url, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => setState({ data, error: null, status: "success" }))
      .catch(error => { if (error.name !== "AbortError") setState({ data: null, error, status: "error" }); });
    return () => controller.abort();
  }, [url]);

  return state;
}

function useEvent(callback) {                          // latest callback without re-subscribing
  const ref = useRef(callback);
  useEffect(() => { ref.current = callback; });
  return useCallback((...args) => ref.current(...args), []);
}

function Users() {
  const { data, error, status } = useFetch("/api/users");
  if (status === "loading") return <p>Loading...</p>;
  if (status === "error") return <p role="alert">{error.message}</p>;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
        ),
      ],
      [
        ['What are the rules of hooks and why do they exist?', 'Call hooks only at the top level of function components/custom hooks and never conditionally. React tracks hooks by call order, so the order must be identical on every render.'],
        ['Do custom hooks share state between components?', 'No. They share logic only; every component calling the hook gets its own independent state and effects.'],
        ['How do you test a custom hook?', 'With renderHook from @testing-library/react: render the hook, call its returned functions inside act(), and assert on result.current.'],
      ],
    ),
  ]),

  rp(7, 'Forms and Validation', 'Essential', [
    topic(
      'rr-forms-controlled',
      'Controlled and Uncontrolled Forms',
      [
        blk(`<h3>Controlled components</h3>
• A <b>controlled</b> input gets its <code>value</code> from state and updates it in <code>onChange</code>. React is the single source of truth, so you can validate, format or reject input on every keystroke.<br>
• Checkboxes use <code>checked</code>; <code>&lt;select&gt;</code> and <code>&lt;textarea&gt;</code> use <code>value</code>.<br>
• One state object plus one handler keyed by the input <code>name</code> scales to many fields.`,
          `function RegisterForm() {
  const [form, setForm] = useState({ name: "", email: "", role: "student", agree: false });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));   // computed key
  }
  function handleSubmit(e) {
    e.preventDefault();
    console.log("submit", form);
  }
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="student">Student</option><option value="teacher">Teacher</option>
      </select>
      <label><input name="agree" type="checkbox" checked={form.agree} onChange={handleChange} /> I agree</label>
      <button disabled={!form.agree}>Register</button>
    </form>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Uncontrolled forms and FormData</h3>
• An <b>uncontrolled</b> input keeps its own DOM state; you read it on submit via a ref or <code>FormData</code>. Fewer re-renders and less code for simple forms; <code>defaultValue</code> sets the initial value.<br>
• File inputs (<code>type="file"</code>) are always uncontrolled.<br>
• Do not switch an input between controlled and uncontrolled (value from <code>undefined</code> to a string): initialise state with <code>""</code>.<br>
• React 19 form <b>Actions</b>: <code>&lt;form action={fn}&gt;</code> calls <code>fn(formData)</code>, with <code>useActionState</code> and <code>useFormStatus</code> for pending state and results.`,
          `function QuickContact() {
  function handleSubmit(e) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log(data);                                   // { email: "...", message: "..." }
  }
  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" defaultValue="" required />
      <textarea name="message" defaultValue="" />
      <input name="resume" type="file" accept=".pdf" />
      <button>Send</button>
    </form>
  );
}

// React 19 form action
import { useActionState } from "react";
function Subscribe() {
  const [message, formAction, pending] = useActionState(async (prev, formData) => {
    const res = await fetch("/api/subscribe", { method: "POST", body: formData });
    return res.ok ? "Subscribed!" : "Failed, try again";
  }, "");
  return <form action={formAction}><input name="email" type="email" /><button disabled={pending}>Join</button><p>{message}</p></form>;
}`,
        ),
      ],
      [
        blk(`<h3>Submit states and good UX</h3>
• Track <code>status</code> (<code>idle | submitting | success | error</code>), disable the submit button while submitting to prevent double posts, and show server errors next to the form.<br>
• Reset the form after success; keep entered values after failure.<br>
• Use proper input types and attributes (<code>type="email"</code>, <code>autoComplete</code>, <code>inputMode</code>) so mobile keyboards and password managers work.<br>
• Associate every input with a <code>&lt;label&gt;</code> (<code>htmlFor</code>/<code>id</code> or wrap) for accessibility.`,
          `function ContactForm() {
  const [form, setForm] = useState({ email: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting"); setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).message ?? "Request failed");
      setForm({ email: "", message: "" });
      setStatus("success");
    } catch (err) { setServerError(err.message); setStatus("error"); }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <label htmlFor="msg">Message</label>
      <textarea id="msg" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
      <button disabled={status === "submitting"}>{status === "submitting" ? "Sending..." : "Send"}</button>
      {status === "success" && <p role="status">Thanks, we will reply soon.</p>}
      {status === "error" && <p role="alert">{serverError}</p>}
    </form>
  );
}`,
        ),
      ],
      [
        ['Controlled vs uncontrolled inputs?', 'Controlled inputs take value from React state and update it onChange. Uncontrolled inputs keep their value in the DOM and you read it with a ref or FormData. Controlled gives per-keystroke control; uncontrolled is simpler and lighter.'],
        ['Why does React warn about switching from uncontrolled to controlled?', 'The input started with value undefined (uncontrolled) and later got a defined value. Initialise state with an empty string so the input is controlled from the first render.'],
        ['How do you prevent double submission?', 'Track a submitting status, disable the submit button (and ignore re-entry) while the request is pending, and re-enable it after success or failure.'],
      ],
    ),
    topic(
      'rr-forms-validation',
      'Form Validation: Manual, React Hook Form and Zod',
      [
        blk(`<h3>Validating by hand</h3>
• Validate on <b>submit</b> at minimum; improve UX by validating a field on <b>blur</b> and re-validating on change once it has been touched.<br>
• Keep an <code>errors</code> object keyed by field name and render the message next to the input with <code>aria-invalid</code> and <code>aria-describedby</code>.<br>
• Put validation rules in a pure function so they can be unit-tested and reused on the server.`,
          `function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(values.email)) errors.email = "Enter a valid email";
  if (values.password.length < 8) errors.password = "At least 8 characters";
  return errors;
}

function Signup() {
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState({});
  const errors = validate(values);                                  // derived, not state
  const show = field => touched[field] && errors[field];

  return (
    <form onSubmit={e => { e.preventDefault(); setTouched({ name: true, email: true, password: true }); if (!Object.keys(errors).length) save(values); }}>
      <input name="email" value={values.email}
        onChange={e => setValues({ ...values, email: e.target.value })}
        onBlur={() => setTouched({ ...touched, email: true })}
        aria-invalid={!!show("email")} aria-describedby="email-error" />
      {show("email") && <p id="email-error" role="alert">{errors.email}</p>}
      <button>Sign up</button>
    </form>
  );
}`,
        ),
      ],
      [
        blk(`<h3>React Hook Form with Zod</h3>
• <b>React Hook Form</b> uses uncontrolled inputs internally, so large forms stay fast. It manages registration, touched/dirty state, errors and submit status.<br>
• <b>Zod</b> defines a schema once; <code>z.infer</code> gives the TypeScript type; <code>zodResolver</code> connects it to the form. The same schema can validate the API request on a Node server.`,
          `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  age: z.coerce.number().int().min(18, "You must be 18+"),
  password: z.string().min(8, "At least 8 characters"),
  confirm: z.string(),
}).refine(v => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

export default function SignupForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", age: "", password: "", confirm: "" },
  });
  const onSubmit = async data => { await fetch("/api/signup", { method: "POST", body: JSON.stringify(data) }); reset(); };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input {...register("name")} placeholder="Name" />
      {errors.name && <p role="alert">{errors.name.message}</p>}
      <input {...register("email")} placeholder="Email" />
      {errors.email && <p role="alert">{errors.email.message}</p>}
      <input type="number" {...register("age")} />
      {errors.age && <p role="alert">{errors.age.message}</p>}
      <input type="password" {...register("password")} />
      <input type="password" {...register("confirm")} />
      {errors.confirm && <p role="alert">{errors.confirm.message}</p>}
      <button disabled={isSubmitting}>Create account</button>
    </form>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Server-side validation, dynamic fields and accessibility</h3>
• <b>Client validation is for convenience; the server must validate again.</b> Map server error responses (HTTP 400/422 with field messages) back onto fields with <code>setError("email", { message })</code>.<br>
• Dynamic lists of fields: <code>useFieldArray</code> (add/remove rows). Multi-step wizards: keep one form state, validate per step.<br>
• Accessibility: label every field, announce errors with <code>role="alert"</code> or an <code>aria-live</code> region, move focus to the first invalid field on submit, do not rely on colour alone.<br>
• Debounce asynchronous checks (is this username taken?) and show a pending state.`,
          `import { useForm, useFieldArray } from "react-hook-form";

function InvoiceForm() {
  const { register, control, handleSubmit, setError, setFocus } = useForm({ defaultValues: { items: [{ name: "", qty: 1 }] } });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  async function onSubmit(data) {
    const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.status === 422) {
      const { errors } = await res.json();                         // e.g. { "items.0.name": "Already exists" }
      Object.entries(errors).forEach(([field, message]) => setError(field, { message }));
      setFocus(Object.keys(errors)[0]);                            // keyboard users land on the first problem
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((f, i) => (
        <div key={f.id}>
          <input {...register("items." + i + ".name")} aria-label={"Item " + (i + 1) + " name"} />
          <input type="number" {...register("items." + i + ".qty", { valueAsNumber: true })} />
          <button type="button" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: "", qty: 1 })}>Add item</button>
      <button>Save</button>
    </form>
  );
}`,
        ),
      ],
      [
        ['Why use React Hook Form instead of useState for forms?', 'It registers inputs as uncontrolled, minimising re-renders, and provides validation, error and submission state out of the box with little code, which scales to large forms.'],
        ['Is client-side validation enough?', 'No. It can be bypassed. Always validate on the server too, and show server-side errors on the corresponding fields.'],
        ['How do you make form errors accessible?', 'Associate messages with fields using aria-describedby/aria-invalid, announce them with role="alert" or aria-live, and move focus to the first invalid input after a failed submit.'],
      ],
    ),
  ]),

  rp(8, 'React Router', 'Essential', [
    topic(
      'rr-router-setup',
      'React Router: Routes, Links and Parameters',
      [
        blk(`<h3>Client-side routing</h3>
• A single-page app has one HTML page. <b>React Router</b> maps URLs to components and updates the address bar without a page reload (History API).<br>
• Install: <code>npm install react-router-dom</code>. Wrap the app in a router and declare <code>&lt;Route path element&gt;</code> entries.<br>
• Use <code>&lt;Link to&gt;</code>/<code>&lt;NavLink&gt;</code> (never a plain <code>&lt;a href&gt;</code> for internal links, which reloads the page). <code>NavLink</code> adds an active class.`,
          `import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
        <NavLink to="/courses">Courses</NavLink>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}`,
        ),
      ],
      [
        blk(`<h3>URL parameters, query strings and navigation</h3>
• <b>Path params</b>: <code>path="/courses/:courseId"</code> and <code>useParams()</code> (always strings: convert numbers).<br>
• <b>Query string</b>: <code>useSearchParams()</code> for filters, sort and page. Putting UI state in the URL makes it shareable and survives refresh.<br>
• <b>Programmatic navigation</b>: <code>useNavigate()</code> (<code>navigate("/courses")</code>, <code>navigate(-1)</code>); pass state with <code>navigate(to, { state })</code> and read it with <code>useLocation()</code>.<br>
• Redirect declaratively with <code>&lt;Navigate to="/login" replace /&gt;</code>.`,
          `import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";

function CourseDetail() {
  const { courseId } = useParams();                    // string
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "overview";
  return (
    <>
      <h1>Course {courseId}</h1>
      <button onClick={() => setParams({ tab: "reviews" })}>Reviews</button>
      <p>Tab: {tab}</p>
      <button onClick={() => navigate("/courses")}>Back to list</button>
    </>
  );
}
// <Route path="/courses/:courseId" element={<CourseDetail />} />

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/dashboard";
  const onSuccess = () => navigate(from, { replace: true });      // do not leave /login in history
  return <button onClick={onSuccess}>Log in</button>;
}`,
        ),
      ],
      [
        blk(`<h3>How it works and server setup</h3>
• <code>BrowserRouter</code> uses clean URLs and needs the <b>server to return <code>index.html</code> for unknown paths</b>; otherwise a refresh on <code>/courses/5</code> gives a 404. (Spring Boot: forward non-file paths to <code>index.html</code>; nginx: <code>try_files $uri /index.html</code>.) <code>HashRouter</code> (<code>/#/courses</code>) avoids this but is uglier.<br>
• Route ranking: React Router picks the most specific match, so order does not matter. <code>*</code> catches everything else (404 page).<br>
• Scroll position and focus management on navigation need attention: restore scroll with <code>&lt;ScrollRestoration /&gt;</code> (data routers) and move focus to the page heading for accessibility.`,
          `// nginx
// location / { try_files $uri /index.html; }

// Spring Boot: forward unknown, non-API, non-file paths to the SPA
// @Controller class SpaController {
//   @GetMapping(value = "/{path:[^\\\\.]*}")
//   String forward() { return "forward:/index.html"; }
// }

// Focus the heading after navigation so screen reader users know the page changed
function PageTitle({ children }) {
  const ref = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => { ref.current?.focus(); document.title = children + " | JavaSchoolLab"; }, [pathname, children]);
  return <h1 ref={ref} tabIndex={-1}>{children}</h1>;
}`,
        ),
      ],
      [
        ['Why use Link instead of an anchor tag?', 'A plain <a href> triggers a full page load. Link intercepts the click and uses the History API to change the URL and render the new route without reloading, keeping app state.'],
        ['Why does refreshing /courses/5 give a 404 in production?', 'The server has no such file. For client-side routing the server must return index.html for all non-API, non-file paths so React Router can handle the route.'],
        ['useParams vs useSearchParams?', 'useParams reads dynamic segments of the path (/courses/:id). useSearchParams reads and writes the query string (?tab=reviews&page=2).'],
      ],
    ),
    topic(
      'rr-router-nested-protected',
      'Nested Routes, Layouts and Protected Routes',
      [
        blk(`<h3>Layout routes and Outlet</h3>
• Nest routes to share UI. A <b>layout route</b> renders common chrome (header, sidebar) and an <code>&lt;Outlet /&gt;</code> where the matching child route appears.<br>
• <b>Index routes</b> (<code>index</code>) render at the parent's path. Child paths are relative to the parent.`,
          `import { Outlet, Routes, Route, NavLink } from "react-router-dom";

function DashboardLayout() {
  return (
    <div className="layout">
      <aside>
        <NavLink to="/dashboard" end>Overview</NavLink>
        <NavLink to="/dashboard/courses">My courses</NavLink>
        <NavLink to="/dashboard/settings">Settings</NavLink>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<Overview />} />
    <Route path="courses" element={<MyCourses />} />
    <Route path="courses/:id" element={<CourseDetail />} />
    <Route path="settings" element={<Settings />} />
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>;`,
        ),
      ],
      [
        blk(`<h3>Protecting routes</h3>
• A <b>protected route</b> redirects unauthenticated users to login and remembers where they wanted to go. Implement it as a layout route that renders <code>&lt;Outlet /&gt;</code> or <code>&lt;Navigate&gt;</code>.<br>
• Wait for the auth check to finish (loading state) before redirecting, or users with a valid session get bounced.<br>
• <b>Client-side checks are not security</b>: the API must enforce authorisation on the server.`,
          `import { Navigate, Outlet, useLocation } from "react-router-dom";

function RequireAuth({ role }) {
  const { user, loading } = useAuth();            // from an AuthContext
  const location = useLocation();

  if (loading) return <p>Checking session...</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/403" replace />;
  return <Outlet />;
}

<Routes>
  <Route path="/login" element={<Login />} />
  <Route element={<RequireAuth />}>
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>
  <Route element={<RequireAuth role="admin" />}>
    <Route path="/admin" element={<AdminPanel />} />
  </Route>
</Routes>;`,
        ),
      ],
      [
        blk(`<h3>Data routers: loaders, actions and lazy routes</h3>
• <code>createBrowserRouter</code> + <code>RouterProvider</code> enable <b>loaders</b> (fetch data before rendering a route), <b>actions</b> (handle form submissions) and route-level <code>errorElement</code>. This removes many <code>useEffect</code> fetches and loading flashes.<br>
• <b>Lazy routes</b> (<code>lazy: () =&gt; import("./Reports")</code>) split code per page.<br>
• <code>useNavigation().state</code> tells you when a navigation or submission is pending (show a top progress bar).`,
          `import { createBrowserRouter, RouterProvider, useLoaderData, useNavigation, redirect, Form } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "courses/:id",
        loader: async ({ params, request }) => {
          const res = await fetch("/api/courses/" + params.id, { signal: request.signal });
          if (!res.ok) throw new Response("Not found", { status: 404 });
          return res.json();
        },
        element: <CourseDetail />,
      },
      {
        path: "courses/new",
        action: async ({ request }) => {
          const data = Object.fromEntries(await request.formData());
          const res = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
          const created = await res.json();
          return redirect("/courses/" + created.id);
        },
        element: <Form method="post"><input name="title" /><button>Create</button></Form>,
      },
      { path: "reports", lazy: () => import("./Reports") },
    ],
  },
]);

function CourseDetail() {
  const course = useLoaderData();            // data is ready before this renders
  const navigation = useNavigation();
  return <h1 style={{ opacity: navigation.state === "loading" ? 0.5 : 1 }}>{course.title}</h1>;
}
export default function App() { return <RouterProvider router={router} />; }`,
        ),
      ],
      [
        ['What is an Outlet?', 'A placeholder in a parent (layout) route component where the matching child route\'s element is rendered, enabling shared layouts.'],
        ['How do you protect a route in React Router?', 'Create a layout route that checks authentication (and roles) and renders <Outlet /> if allowed, otherwise <Navigate to="/login" />. Remember the API must enforce authorisation, since client checks can be bypassed.'],
        ['What are loaders?', 'Functions on data-router routes that fetch data before the route renders. Components read it with useLoaderData, avoiding fetch-in-effect waterfalls and loading flashes.'],
      ],
    ),
  ]),

  rp(9, 'REST API Integration', 'Essential', [
    topic(
      'rr-api-fetch-states',
      'Fetching Data: Loading, Error and Empty States',
      [
        blk(`<h3>The three faces of every request</h3>
• Every data-driven screen has at least four states: <b>loading</b>, <b>error</b>, <b>empty</b> and <b>success</b>. Handle all of them.<br>
• Basic pattern: store <code>data</code>, <code>error</code> and <code>status</code> in state, fetch inside <code>useEffect</code> and abort on cleanup.<br>
• Check <code>response.ok</code>; <code>fetch</code> does not reject on HTTP errors.`,
          `function UserList() {
  const [state, setState] = useState({ status: "loading", users: [], error: null });

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/users", { signal: controller.signal });
        if (!res.ok) throw new Error("Server returned " + res.status);
        setState({ status: "success", users: await res.json(), error: null });
      } catch (error) {
        if (error.name !== "AbortError") setState({ status: "error", users: [], error });
      }
    })();
    return () => controller.abort();
  }, []);

  if (state.status === "loading") return <p>Loading users...</p>;
  if (state.status === "error") return <p role="alert">Could not load users: {state.error.message}</p>;
  if (state.users.length === 0) return <p>No users yet.</p>;
  return <ul>{state.users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}`,
        ),
      ],
      [
        blk(`<h3>An API client module</h3>
• Centralise HTTP in one module: base URL from <code>import.meta.env</code>, JSON headers, auth header, error normalisation and a typed result. Components then call <code>api.get("/users")</code>.<br>
• Axios is a popular alternative (interceptors, automatic JSON, timeouts), but <code>fetch</code> is enough with a small wrapper.<br>
• Normalise errors into one shape (<code>status</code>, <code>message</code>, <code>fieldErrors</code>) so the UI can treat them uniformly.`,
          `// src/lib/api.js
const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(status, message, details) { super(message); this.name = "ApiError"; this.status = status; this.details = details; }
}

async function request(path, { method = "GET", body, signal, headers } = {}) {
  const res = await fetch(BASE + path, {
    method,
    signal,
    credentials: "include",
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    throw new ApiError(res.status, problem.message ?? res.statusText, problem.errors);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (p, o) => request(p, o),
  post: (p, body, o) => request(p, { ...o, method: "POST", body }),
  put: (p, body, o) => request(p, { ...o, method: "PUT", body }),
  delete: (p, o) => request(p, { ...o, method: "DELETE" }),
};`,
        ),
      ],
      [
        blk(`<h3>Race conditions, retries and CORS</h3>
• When parameters change quickly (search), an older response can arrive after a newer one: abort the previous request in cleanup.<br>
• Retry only idempotent requests (GET) and only for network/5xx errors, with exponential backoff.<br>
• In development a request from <code>localhost:5173</code> to <code>localhost:3001</code> is cross-origin: use a Vite <code>proxy</code> or enable CORS on the server (Spring Boot <code>CorsConfigurationSource</code>) with explicit allowed origins.<br>
• Do not fire a request on every keystroke: debounce.`,
          `function useDebouncedSearch(query) {
  const debounced = useDebounce(query, 300);
  const [results, setResults] = useState([]);
  useEffect(() => {
    if (!debounced) { setResults([]); return; }
    const controller = new AbortController();
    api.get("/api/search?q=" + encodeURIComponent(debounced), { signal: controller.signal })
      .then(setResults)
      .catch(e => { if (e.name !== "AbortError") console.error(e); });
    return () => controller.abort();                      // a newer query cancels the older request
  }, [debounced]);
  return results;
}

async function withRetry(fn, retries = 3) {
  for (let i = 0; ; i++) {
    try { return await fn(); }
    catch (e) {
      const retryable = !e.status || e.status >= 500;
      if (i >= retries || !retryable) throw e;
      await new Promise(r => setTimeout(r, 300 * 2 ** i));
    }
  }
}`,
        ),
      ],
      [
        ['What states must a data-fetching component handle?', 'Loading, error, empty and success. Showing only the success case leaves users with blank screens or crashes on failure.'],
        ['How do you avoid a stale response overwriting a newer one?', 'Abort the previous request in the effect cleanup (AbortController) or ignore its result with a cancelled flag, so only the latest request updates state.'],
        ['Why create an API client module?', 'It keeps base URL, headers, auth, error handling and JSON parsing in one place, so components stay small and behaviour is consistent and easy to change.'],
      ],
    ),
    topic(
      'rr-api-tanstack-query',
      'TanStack Query: Caching, Mutations and Optimistic Updates',
      [
        blk(`<h3>Server state is not client state</h3>
• Data from an API is a <b>cache of remote state</b> that can become stale, be shared by many components and needs refetching. Managing it with <code>useState</code> + <code>useEffect</code> means rewriting caching, de-duplication, retries and refetch logic.<br>
• <b>TanStack Query</b> (React Query) provides all of that: <code>useQuery</code> for reads, <code>useMutation</code> for writes, a <code>QueryClient</code> cache keyed by <b>query keys</b>.`,
          `import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 2, refetchOnWindowFocus: true } },
});

export default function Root() {
  return <QueryClientProvider client={queryClient}><App /></QueryClientProvider>;
}

function Users() {
  const { data, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/api/users"),
  });
  if (isPending) return <p>Loading...</p>;
  if (isError) return <p role="alert">{error.message} <button onClick={() => refetch()}>Retry</button></p>;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}{isFetching && <li>Refreshing...</li>}</ul>;
}`,
        ),
      ],
      [
        blk(`<h3>Query keys and mutations</h3>
• The <b>query key</b> identifies the cache entry: include every variable the request depends on (<code>["users", { page, search }]</code>). When a key changes, a new request is made (and the old data can be shown meanwhile with <code>placeholderData</code>).<br>
• <code>useMutation</code> performs create/update/delete. After success, <b>invalidate</b> related queries so they refetch: <code>queryClient.invalidateQueries({ queryKey: ["users"] })</code>.<br>
• <code>staleTime</code> controls how long data counts as fresh; <code>gcTime</code> how long unused data stays cached.`,
          `import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

function UserTable({ page, search }) {
  const { data, isPlaceholderData } = useQuery({
    queryKey: ["users", { page, search }],
    queryFn: () => api.get("/api/users?page=" + page + "&q=" + encodeURIComponent(search)),
    placeholderData: keepPreviousData,                        // no flicker between pages
  });
  return <table style={{ opacity: isPlaceholderData ? 0.6 : 1 }}>{/* rows */}</table>;
}

function AddUser() {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: user => api.post("/api/users", user),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),   // list refetches automatically
  });
  return (
    <button disabled={create.isPending} onClick={() => create.mutate({ name: "Asha" })}>
      {create.isPending ? "Saving..." : "Add user"}
    </button>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Optimistic updates, infinite lists and prefetching</h3>
• <b>Optimistic update</b>: apply the change to the cache immediately (<code>onMutate</code>), roll back on error (<code>onError</code>) and refetch to reconcile (<code>onSettled</code>). The UI feels instant.<br>
• <code>useInfiniteQuery</code> implements "load more"/infinite scroll with cursors or pages.<br>
• <code>prefetchQuery</code> on hover or in a router loader warms the cache so navigation feels immediate.<br>
• Put <b>auth handling</b> in the API client (refresh token on 401), not in each query.`,
          `function useToggleTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, done }) => api.put("/api/todos/" + id, { done }),
    onMutate: async ({ id, done }) => {
      await qc.cancelQueries({ queryKey: ["todos"] });
      const previous = qc.getQueryData(["todos"]);
      qc.setQueryData(["todos"], old => old.map(t => t.id === id ? { ...t, done } : t));   // instant UI
      return { previous };
    },
    onError: (_err, _vars, ctx) => qc.setQueryData(["todos"], ctx.previous),                 // roll back
    onSettled: () => qc.invalidateQueries({ queryKey: ["todos"] }),                           // sync with server
  });
}

import { useInfiniteQuery } from "@tanstack/react-query";
function Feed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 0 }) => api.get("/api/feed?cursor=" + pageParam),
    getNextPageParam: last => last.nextCursor ?? undefined,
  });
  return <>
    {data?.pages.flatMap(p => p.items).map(i => <article key={i.id}>{i.title}</article>)}
    <button disabled={!hasNextPage || isFetchingNextPage} onClick={() => fetchNextPage()}>Load more</button>
  </>;
}`,
        ),
      ],
      [
        ['Why use TanStack Query instead of useEffect + useState?', 'It handles caching, request de-duplication, background refetching, retries, pagination, optimistic updates and loading/error states, which are tedious and error-prone to implement by hand.'],
        ['What is a query key?', 'An array identifying a cache entry. It must include every input of the request; changing it triggers a new fetch and gives each variation its own cached data.'],
        ['How does an optimistic update work?', 'Update the cache immediately in onMutate (keeping a snapshot), roll back in onError if the request fails, and invalidate/refetch in onSettled so the UI matches the server.'],
      ],
    ),
    topic(
      'rr-api-auth-spring',
      'Authentication and Spring Boot Integration',
      [
        blk(`<h3>Talking to a Spring Boot API</h3>
• A typical stack: React (Vite, port 5173) + Spring Boot REST API (port 8080/3001). In development, proxy <code>/api</code> to the server; in production serve the built React files from the same origin (Spring Boot static resources or nginx) so no CORS is needed.<br>
• Match the contract: JSON field names, status codes (<code>201</code> + <code>Location</code> on create, <code>204</code> on delete, <code>400/422</code> for validation), and pagination shape (<code>page</code>, <code>size</code>, <code>totalElements</code>).<br>
• Generate TypeScript types from the OpenAPI spec (springdoc) to keep both sides in sync.`,
          `// vite.config.js (development)
export default defineConfig({ plugins: [react()], server: { proxy: { "/api": "http://localhost:8080" } } });

// Spring Boot controller (Java)
// @RestController @RequestMapping("/api/courses")
// class CourseController {
//   @GetMapping Page<CourseDto> list(Pageable p) { return service.list(p); }
//   @PostMapping ResponseEntity<CourseDto> create(@Valid @RequestBody CourseRequest r) {
//     CourseDto c = service.create(r);
//     return ResponseEntity.created(URI.create("/api/courses/" + c.id())).body(c);
//   }
// }

// React
const page = await api.get("/api/courses?page=0&size=10&sort=title,asc");
console.log(page.content.length, page.totalElements);`,
        ),
      ],
      [
        blk(`<h3>Authentication patterns</h3>
• <b>Session cookie</b> (recommended for browser apps): the server sets an <code>HttpOnly; Secure; SameSite</code> cookie after login. JavaScript cannot read it, so XSS cannot steal it. Call APIs with <code>credentials: "include"</code> and protect against CSRF (SameSite, CSRF token).<br>
• <b>JWT in the Authorization header</b>: keep the short-lived access token <b>in memory</b>, the refresh token in an HttpOnly cookie. Avoid <code>localStorage</code> for tokens.<br>
• Expose the current user through an <b>AuthContext</b> (<code>user</code>, <code>login</code>, <code>logout</code>, <code>loading</code>) loaded from <code>/api/me</code> at start-up.`,
          `import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/me").then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const me = await api.post("/api/auth/login", { email, password });   // server sets the HttpOnly cookie
    setUser(me);
  }, []);
  const logout = useCallback(async () => { await api.post("/api/auth/logout"); setUser(null); }, []);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}`,
        ),
      ],
      [
        blk(`<h3>Handling 401, 403 and refresh tokens centrally</h3>
• <b>401</b> = not authenticated (log in again or refresh); <b>403</b> = authenticated but not allowed (show a "no access" page).<br>
• Handle these once in the API client: on 401 try a single refresh, retry the original request, else clear the user and redirect to login. Serialise concurrent refreshes so only one runs.<br>
• Show friendly messages for <code>429</code> (rate limited) and offline errors; keep technical details in logs.`,
          `let refreshing = null;

async function requestWithRefresh(path, options) {
  try {
    return await request(path, options);
  } catch (err) {
    if (err.status !== 401 || path === "/api/auth/refresh") throw err;
    refreshing ??= request("/api/auth/refresh", { method: "POST" }).finally(() => { refreshing = null; });   // one refresh at a time
    try { await refreshing; }
    catch { window.dispatchEvent(new Event("session-expired")); throw err; }
    return request(path, options);                                    // retry once
  }
}

// In AuthProvider
useEffect(() => {
  const onExpired = () => { setUser(null); navigate("/login", { state: { from: location.pathname } }); };
  window.addEventListener("session-expired", onExpired);
  return () => window.removeEventListener("session-expired", onExpired);
}, []);`,
        ),
      ],
      [
        ['Where should a React app store authentication tokens?', 'Prefer HttpOnly, Secure, SameSite cookies set by the server. If you use JWTs, keep the short-lived access token in memory and the refresh token in an HttpOnly cookie; avoid localStorage because XSS can read it.'],
        ['401 vs 403?', '401 Unauthorized means the request lacks valid authentication (log in or refresh); 403 Forbidden means the user is authenticated but not permitted. The UI reacts differently to each.'],
        ['How do you avoid CORS problems in development and production?', 'Proxy /api through the Vite dev server in development and serve the built front end from the same origin as the API in production. If cross-origin is required, configure CORS on the server with explicit origins.'],
      ],
    ),
    topic(
      'rr-api-axios',
      'Axios: Instances, Interceptors and Fetch vs Axios',
      [
        blk(`<h3>What Axios adds to fetch</h3>
• <b>Axios</b> is a promise-based HTTP client (<code>npm i axios</code>). Compared with <code>fetch</code> it parses JSON automatically, <b>rejects on HTTP error statuses</b> (4xx/5xx), supports timeouts, request cancellation, upload progress, and <b>interceptors</b>.<br>
• The result is in <code>response.data</code>. Errors expose <code>error.response.status</code> and <code>error.response.data</code> (server answered with an error) or <code>error.request</code> (no response: network problem).<br>
• Methods: <code>axios.get(url, config)</code>, <code>axios.post(url, body, config)</code>, <code>put</code>, <code>patch</code>, <code>delete</code>.`,
          `import axios from "axios";

async function loadUsers() {
  try {
    const { data } = await axios.get("/api/users", { params: { page: 0, size: 10 }, timeout: 8000 });
    console.log(data);                               // already parsed JSON
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response) console.error(err.response.status, err.response.data);   // server error body
      else if (err.request) console.error("No response (network down or timeout)");
    } else throw err;
  }
}

const created = await axios.post("/api/users", { name: "Asha", email: "asha@example.com" });
console.log(created.status, created.data);          // 201 { id: 1, ... }`,
        ),
      ],
      [
        blk(`<h3>An Axios instance with interceptors</h3>
• Create one configured <b>instance</b> (<code>axios.create</code>) with the base URL, timeout and credentials, and use it everywhere.<br>
• <b>Request interceptor</b>: attach the auth header or a request id. <b>Response interceptor</b>: handle 401 (refresh token and retry once), normalise errors, show global toasts.<br>
• Interceptors keep cross-cutting concerns out of components.`,
          `// src/lib/http.js
import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
  timeout: 10000,
  withCredentials: true,                              // send cookies (session / refresh token)
  headers: { Accept: "application/json" },
});

let accessToken = null;
export const setAccessToken = t => { accessToken = t; };

http.interceptors.request.use(config => {
  if (accessToken) config.headers.Authorization = "Bearer " + accessToken;
  config.headers["X-Request-Id"] = crypto.randomUUID();
  return config;
});

let refreshing = null;
http.interceptors.response.use(
  res => res,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried && !original.url.includes("/auth/")) {
      original._retried = true;
      refreshing ??= http.post("/api/auth/refresh").finally(() => { refreshing = null; });   // one refresh at a time
      const { data } = await refreshing;
      setAccessToken(data.accessToken);
      return http(original);                         // retry the original request once
    }
    return Promise.reject(error);
  },
);`,
        ),
      ],
      [
        blk(`<h3>Cancellation, uploads and choosing between fetch and Axios</h3>
• Cancel with <code>AbortController</code>: <code>axios.get(url, { signal })</code>; handle <code>axios.isCancel(err)</code> / <code>err.code === "ERR_CANCELED"</code>. Use it in <code>useEffect</code> cleanup.<br>
• Upload progress: <code>onUploadProgress</code> with <code>FormData</code>; download progress: <code>onDownloadProgress</code>.<br>
• <b>fetch</b>: built in, no dependency, works in service workers and edge runtimes, streaming. <b>Axios</b>: less boilerplate, interceptors, automatic error rejection, progress events. Both work well with TanStack Query: only the <code>queryFn</code> changes.<br>
• Do not mix styles in one project: pick one and wrap it in an API module.`,
          `function useUsers(query) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    http.get("/api/users", { params: { q: query }, signal: controller.signal })
      .then(res => setUsers(res.data))
      .catch(err => { if (!axios.isCancel(err)) console.error(err.message); });
    return () => controller.abort();                 // a newer query cancels the older request
  }, [query]);
  return users;
}

async function uploadAvatar(file, onProgress) {
  const form = new FormData();
  form.append("avatar", file);
  return http.post("/api/avatar", form, {
    onUploadProgress: e => onProgress(Math.round((e.loaded * 100) / (e.total ?? file.size))),
  });
}

// TanStack Query with Axios
const { data } = useQuery({ queryKey: ["users"], queryFn: () => http.get("/api/users").then(r => r.data) });`,
        ),
      ],
      [
        ['What does Axios do that fetch does not?', 'Automatic JSON parsing, rejection on 4xx/5xx statuses, built-in timeouts, request/response interceptors, upload/download progress and a consistent error object.'],
        ['What is an Axios interceptor?', 'A function that runs before every request or after every response, used for cross-cutting work such as adding the Authorization header, refreshing tokens on 401, logging and normalising errors.'],
        ['How do you cancel an Axios request?', 'Pass an AbortController signal in the config and call abort() (for example in the useEffect cleanup); the promise rejects with a cancellation error that axios.isCancel recognises.'],
      ],
    ),
    topic(
      'rr-crud-spring',
      'CRUD Operations: React + Spring Boot Project',
      [
        blk(`<h3>CRUD maps to HTTP</h3>
• <b>C</b>reate = <code>POST /api/courses</code> (201 Created), <b>R</b>ead = <code>GET /api/courses</code> and <code>GET /api/courses/{id}</code> (200), <b>U</b>pdate = <code>PUT</code> (replace) or <code>PATCH</code> (partial), <b>D</b>elete = <code>DELETE /api/courses/{id}</code> (204 No Content).<br>
• The Spring Boot side: a <code>@RestController</code>, a service layer, a JPA repository and DTOs with Bean Validation (<code>@NotBlank</code>, <code>@Size</code>).<br>
• The React side: a list page, a create/edit form and a delete action, all sharing one API module.`,
          `// Spring Boot (Java)
// public record CourseRequest(@NotBlank @Size(max = 120) String title, @Size(max = 2000) String description) {}
//
// @RestController @RequestMapping("/api/courses") @RequiredArgsConstructor
// class CourseController {
//   private final CourseService service;
//   @GetMapping Page<CourseDto> list(@RequestParam(defaultValue = "") String q, Pageable p) { return service.search(q, p); }
//   @GetMapping("/{id}") CourseDto get(@PathVariable long id) { return service.get(id); }          // throws 404 if missing
//   @PostMapping ResponseEntity<CourseDto> create(@Valid @RequestBody CourseRequest r) {
//     CourseDto c = service.create(r);
//     return ResponseEntity.created(URI.create("/api/courses/" + c.id())).body(c);
//   }
//   @PutMapping("/{id}") CourseDto update(@PathVariable long id, @Valid @RequestBody CourseRequest r) { return service.update(id, r); }
//   @DeleteMapping("/{id}") ResponseEntity<Void> delete(@PathVariable long id) { service.delete(id); return ResponseEntity.noContent().build(); }
// }

// React API module
export const coursesApi = {
  list: (q = "", page = 0) => api.get("/api/courses?q=" + encodeURIComponent(q) + "&page=" + page + "&size=10"),
  get: id => api.get("/api/courses/" + id),
  create: body => api.post("/api/courses", body),
  update: (id, body) => api.put("/api/courses/" + id, body),
  remove: id => api.delete("/api/courses/" + id),
};`,
        ),
      ],
      [
        blk(`<h3>The React screens with TanStack Query</h3>
• <b>List</b>: <code>useQuery(["courses", {q, page}])</code>. <b>Create/Update</b>: <code>useMutation</code>, then invalidate <code>["courses"]</code> so the list refetches. <b>Delete</b>: confirm, mutate, invalidate.<br>
• Reuse <b>one form component</b> for create and edit: pass <code>initialValues</code> and <code>onSubmit</code>.<br>
• Map server validation errors (HTTP 400/422) onto the fields.`,
          `function CourseList() {
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const { data, isPending, error } = useQuery({ queryKey: ["courses", { q }], queryFn: () => coursesApi.list(q), placeholderData: keepPreviousData });
  const remove = useMutation({ mutationFn: coursesApi.remove, onSuccess: () => qc.invalidateQueries({ queryKey: ["courses"] }) });

  if (error) return <p role="alert">{error.message}</p>;
  return (
    <>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search courses" />
      <Link to="/courses/new">New course</Link>
      {isPending ? <p>Loading...</p> : (
        <ul>
          {data.content.map(c => (
            <li key={c.id}>
              <Link to={"/courses/" + c.id}>{c.title}</Link>
              <button onClick={() => window.confirm("Delete " + c.title + "?") && remove.mutate(c.id)} disabled={remove.isPending}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function CourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const existing = useQuery({ queryKey: ["course", id], queryFn: () => coursesApi.get(id), enabled: !!id });
  const save = useMutation({
    mutationFn: values => (id ? coursesApi.update(id, values) : coursesApi.create(values)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses"] }); navigate("/courses"); },
  });
  if (id && existing.isPending) return <p>Loading...</p>;
  return <CourseForm initialValues={existing.data ?? { title: "", description: "" }} onSubmit={save.mutate} error={save.error} saving={save.isPending} />;
}`,
        ),
      ],
      [
        blk(`<h3>Production concerns for CRUD</h3>
• <b>Validation on both sides</b>: Bean Validation on the server is the truth; the React form gives fast feedback. Return a consistent error body (<code>{ status, message, errors: { field: "message" } }</code>) from a <code>@ControllerAdvice</code>.<br>
• <b>Pagination, sorting and filtering</b> on the server; never load unbounded lists.<br>
• <b>Concurrency</b>: add a <code>version</code> field (JPA <code>@Version</code>) so two users editing the same record get a 409 Conflict instead of silently overwriting each other.<br>
• <b>Authorization</b>: enforce ownership/roles in the service layer; the UI hiding a Delete button is cosmetic.<br>
• <b>Idempotency</b>: PUT and DELETE are safe to retry; POST is not (use an idempotency key for payments).<br>
• <b>Soft delete</b> (a <code>deleted</code> flag) when data must be recoverable or audited.`,
          `// Spring Boot: uniform error responses
// @RestControllerAdvice class ApiErrors {
//   @ExceptionHandler(MethodArgumentNotValidException.class)
//   ResponseEntity<Map<String,Object>> invalid(MethodArgumentNotValidException e) {
//     Map<String,String> fields = e.getBindingResult().getFieldErrors().stream()
//         .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage, (a, b) -> a));
//     return ResponseEntity.unprocessableEntity().body(Map.of("status", 422, "message", "Validation failed", "errors", fields));
//   }
//   @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
//   ResponseEntity<Map<String,Object>> conflict() {
//     return ResponseEntity.status(409).body(Map.of("status", 409, "message", "Someone else changed this record. Reload and try again."));
//   }
// }

// React: show field errors from the server
function CourseForm({ initialValues, onSubmit, error }) {
  const { register, handleSubmit, setError } = useForm({ defaultValues: initialValues });
  useEffect(() => {
    if (error?.status === 422) Object.entries(error.details ?? {}).forEach(([f, message]) => setError(f, { message }));
  }, [error, setError]);
  return <form onSubmit={handleSubmit(onSubmit)}>{/* inputs ... */}</form>;
}`,
        ),
      ],
      [
        ['Which HTTP methods and status codes does a REST CRUD API use?', 'POST (201 Created with Location) to create, GET (200) to read, PUT/PATCH (200) to update, DELETE (204 No Content) to remove; 400/422 for validation errors, 404 when missing, 409 for conflicts.'],
        ['How do you keep the list fresh after creating or deleting a record?', 'With TanStack Query, call queryClient.invalidateQueries({ queryKey: ["courses"] }) in the mutation\'s onSuccess so the list refetches from the server.'],
        ['How do you handle two users editing the same record?', 'Use optimistic locking: a version field (JPA @Version) that the client sends back. If it changed, the server returns 409 Conflict and the UI asks the user to reload and retry.'],
      ],
    ),
  ]),

  rp(10, 'TypeScript with React', 'Essential for your chosen stack', [
    topic(
      'rr-ts-fundamentals',
      'TypeScript Fundamentals: Types, Interfaces and Type Aliases',
      [
        blk(`<h3>JavaScript with a type checker</h3>
• <b>TypeScript</b> adds static types to JavaScript. The compiler finds mistakes (wrong argument, missing property, possible <code>undefined</code>) <em>before</em> the code runs, then erases the types, leaving plain JavaScript.<br>
• Basic types: <code>string</code>, <code>number</code>, <code>boolean</code>, <code>null</code>, <code>undefined</code>, arrays (<code>number[]</code> or <code>Array&lt;number&gt;</code>), tuples <code>[string, number]</code>, <code>unknown</code> (safe "anything"), <code>any</code> (turns checking off: avoid), <code>void</code>, <code>never</code>.<br>
• Annotate function parameters and return types; let TypeScript <b>infer</b> local variables.`,
          `let username: string = "Asha";
let scores: number[] = [90, 85];
let pair: [string, number] = ["age", 25];
const inferred = "hello";               // inferred as the literal type "hello"

function add(a: number, b: number): number {
  return a + b;
}
add(2, 3);
// add("2", 3);   // Error: Argument of type 'string' is not assignable to parameter of type 'number'

let value: unknown = JSON.parse('{"a": 1}');
// value.a;                               // Error: 'value' is of type 'unknown'
if (typeof value === "object" && value !== null && "a" in value) console.log(value.a);`,
        ),
      ],
      [
        blk(`<h3>Interfaces, type aliases, unions and narrowing</h3>
• <code>interface</code> and <code>type</code> both describe object shapes. Optional properties use <code>?</code>; immutable ones <code>readonly</code>. <code>interface</code> can be extended (<code>extends</code>) and merged; <code>type</code> can also name unions, tuples and computed types.<br>
• A <b>union</b> <code>string | number</code> allows several types; <b>literal types</b> (<code>"GET" | "POST"</code>) restrict to exact values; an <b>intersection</b> <code>A &amp; B</code> combines types.<br>
• <b>Narrowing</b>: <code>typeof</code>, <code>instanceof</code>, <code>in</code> and equality checks refine a union inside a branch.`,
          `interface User {
  readonly id: number;
  name: string;
  email?: string;                    // optional
}
interface Admin extends User { permissions: string[] }

type Method = "GET" | "POST" | "DELETE";
type Id = string | number;
type ApiError = { status: number; message: string };
type AdminWithError = Admin & { lastError?: ApiError };

function label(id: Id): string {
  return typeof id === "number" ? "#" + id.toFixed(0) : id.toUpperCase();     // narrowing
}

const admin: Admin = { id: 1, name: "Asha", permissions: ["course:delete"] };
// admin.id = 2;                     // Error: Cannot assign to 'id' because it is a read-only property`,
        ),
      ],
      [
        blk(`<h3>Strict mode, discriminated unions and setup</h3>
• Turn on <code>"strict": true</code> in <code>tsconfig.json</code>: it enables <code>strictNullChecks</code> (no accidental <code>undefined</code>), <code>noImplicitAny</code> and more. It is the most valuable setting.<br>
• <b>Discriminated unions</b> (a shared literal field such as <code>kind</code> or <code>status</code>) let <code>switch</code> narrow each case and give exhaustive checking with <code>never</code>.<br>
• Types are erased at runtime: external data (API, <code>localStorage</code>) is <b>not checked</b>. Validate with Zod. Avoid <code>as</code> assertions and the non-null <code>!</code> unless you truly know better than the compiler.<br>
• Start a project: <code>npm create vite@latest app -- --template react-ts</code>; check types with <code>npx tsc --noEmit</code>.`,
          `type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "rect": return s.w * s.h;
    default: { const _check: never = s; return _check; }   // compile error if a new kind is added and not handled
  }
}

function firstName(user: { name?: string }) {
  // return user.name.split(" ")[0];          // Error: 'user.name' is possibly 'undefined'
  return user.name?.split(" ")[0] ?? "Guest";
}

// tsconfig.json
// { "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true, "jsx": "react-jsx" } }`,
        ),
      ],
      [
        ['interface vs type alias?', 'Both describe shapes. An interface can be extended and merged and suits object contracts; a type alias can also express unions, intersections, tuples and mapped/conditional types.'],
        ['What does strictNullChecks do?', 'It stops null and undefined from being assigned to other types, forcing you to handle missing values explicitly and preventing the most common runtime "cannot read property of undefined" errors.'],
        ['What is the difference between any and unknown?', 'any disables checking for that value. unknown accepts any value but must be narrowed (typeof, instanceof, schema validation) before use, so it remains type-safe.'],
      ],
    ),
    topic(
      'rr-ts-props-state',
      'Typing Props, State and Events',
      [
        blk(`<h3>Typing components</h3>
• Create a project with the TypeScript template: <code>npm create vite@latest app -- --template react-ts</code>. Files are <code>.tsx</code> (JSX) and <code>.ts</code>.<br>
• Type props with an <code>interface</code> or <code>type</code>; function components are just functions, so no <code>React.FC</code> is needed (it is optional and not recommended).<br>
• Optional props use <code>?</code>; children use <code>React.ReactNode</code>; callbacks are typed function signatures.`,
          `import type { ReactNode } from "react";

interface ButtonProps {
  label: string;
  variant?: "primary" | "danger";       // union of literals
  disabled?: boolean;
  onClick: () => void;
}
export function Button({ label, variant = "primary", disabled, onClick }: ButtonProps) {
  return <button className={variant} disabled={disabled} onClick={onClick}>{label}</button>;
}

interface CardProps { title: string; children: ReactNode; footer?: ReactNode }
export function Card({ title, children, footer }: CardProps) {
  return <section><h3>{title}</h3>{children}{footer}</section>;
}

<Button label="Save" onClick={() => console.log("saved")} />;
// <Button label="Save" variant="warning" onClick={...} />;   // Error: "warning" is not assignable`,
        ),
      ],
      [
        blk(`<h3>Typing state and events</h3>
• <code>useState</code> infers from the initial value; when the initial value is <code>null</code>/empty, give the type: <code>useState&lt;User | null&gt;(null)</code>, <code>useState&lt;string[]&gt;([])</code>.<br>
• Event handler types: <code>React.ChangeEvent&lt;HTMLInputElement&gt;</code>, <code>React.FormEvent&lt;HTMLFormElement&gt;</code>, <code>React.MouseEvent&lt;HTMLButtonElement&gt;</code>, <code>React.KeyboardEvent</code>. Inline handlers are inferred automatically.<br>
• <code>useRef&lt;HTMLInputElement&gt;(null)</code> for DOM refs; <code>useRef&lt;number&gt;(0)</code> for mutable values.`,
          `import { useRef, useState } from "react";

interface User { id: number; name: string; email: string }

export function UserSearch() {
  const [users, setUsers] = useState<User[]>([]);                // not never[]
  const [selected, setSelected] = useState<User | null>(null);
  const [query, setQuery] = useState("");                         // inferred as string
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) { setQuery(e.target.value); }
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    inputRef.current?.focus();                                    // ref may be null
  }
  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} value={query} onChange={handleChange} />
      <ul>{users.map(u => <li key={u.id} onClick={() => setSelected(u)}>{u.name}</li>)}</ul>
      {selected && <p>{selected.email}</p>}
    </form>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Props that mirror HTML elements</h3>
• Extend native element props instead of re-declaring them: <code>React.ComponentProps&lt;"button"&gt;</code> or <code>React.ButtonHTMLAttributes&lt;HTMLButtonElement&gt;</code>. Consumers then get <code>disabled</code>, <code>aria-*</code>, <code>onClick</code> and <code>type</code> for free.<br>
• <b>Discriminated unions</b> make impossible prop combinations a compile error (e.g. a link needs <code>href</code>, a button needs <code>onClick</code>).<br>
• Use <code>as const</code> and <code>satisfies</code> to keep literal types in configuration objects.`,
          `type ButtonProps = React.ComponentProps<"button"> & { variant?: "primary" | "ghost"; loading?: boolean };

export function Btn({ variant = "primary", loading, children, ...rest }: ButtonProps) {
  return <button className={"btn " + variant} disabled={loading || rest.disabled} {...rest}>{loading ? "..." : children}</button>;
}
<Btn type="submit" aria-label="Save" onClick={() => {}}>Save</Btn>;          // all native props accepted

type ActionProps =
  | { kind: "link"; href: string; onClick?: never }
  | { kind: "button"; onClick: () => void; href?: never };

function Action(props: ActionProps) {
  return props.kind === "link" ? <a href={props.href}>Open</a> : <button onClick={props.onClick}>Run</button>;
}
<Action kind="link" href="/docs" />;
// <Action kind="link" onClick={...} />;   // compile error`,
        ),
      ],
      [
        ['Should you use React.FC?', 'It is optional and generally not recommended: plain functions with typed props are simpler, infer the return type and avoid implicit children in older typings.'],
        ['How do you type useState that starts as null?', 'Provide the union explicitly: useState<User | null>(null). Without it TypeScript infers null only and rejects later assignments.'],
        ['How do you type a change handler?', 'React.ChangeEvent<HTMLInputElement> for inputs (React.ChangeEvent<HTMLSelectElement> for selects); for inline arrow handlers the type is inferred from the element.'],
      ],
    ),
    topic(
      'rr-ts-hooks-generics',
      'Typing Hooks, Context and Generic Components',
      [
        blk(`<h3>Custom hooks and context</h3>
• Return tuples with <code>as const</code> (or an explicit return type) so positions keep distinct types: <code>return [value, setValue] as const</code>.<br>
• <b>Context</b>: create it with a default of <code>null</code> and a custom hook that throws if used outside the provider; this removes the need to null-check everywhere.<br>
• <code>useReducer</code> infers from the reducer: type <code>State</code> and a discriminated union <code>Action</code>.`,
          `import { createContext, useContext, useReducer, useState, type Dispatch, type ReactNode } from "react";

interface Theme { mode: "light" | "dark"; toggle: () => void }
const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Theme["mode"]>("light");
  return <ThemeContext.Provider value={{ mode, toggle: () => setMode(m => m === "light" ? "dark" : "light") }}>{children}</ThemeContext.Provider>;
}
export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;                                                    // never null for consumers
}

type State = { count: number };
type Action = { type: "inc" } | { type: "dec" } | { type: "set"; value: number };
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "inc": return { count: state.count + 1 };
    case "dec": return { count: state.count - 1 };
    case "set": return { count: action.value };
  }
}
const [state, dispatch]: [State, Dispatch<Action>] = useReducer(reducer, { count: 0 });`,
        ),
      ],
      [
        blk(`<h3>Generic components and hooks</h3>
• A <b>generic component</b> keeps types flowing from data to render callbacks: <code>function List&lt;T&gt;(props: { items: T[]; render: (item: T) =&gt; ReactNode })</code>.<br>
• A <b>generic hook</b> like <code>useLocalStorage&lt;T&gt;</code> or <code>useFetch&lt;T&gt;</code> returns <code>T</code> typed data.<br>
• Constrain generics with <code>extends</code> (<code>T extends { id: number }</code>) when the component needs certain fields.`,
          `import { useEffect, useState, type ReactNode } from "react";

interface ListProps<T extends { id: number }> {
  items: T[];
  render: (item: T) => ReactNode;
  empty?: ReactNode;
}
export function List<T extends { id: number }>({ items, render, empty = <p>No items</p> }: ListProps<T>) {
  if (items.length === 0) return <>{empty}</>;
  return <ul>{items.map(item => <li key={item.id}>{render(item)}</li>)}</ul>;
}
<List items={[{ id: 1, name: "Asha" }]} render={u => <b>{u.name.toUpperCase()}</b>} />;   // u is inferred

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const c = new AbortController();
    fetch(url, { signal: c.signal }).then(r => r.json() as Promise<T>).then(setData)
      .catch((e: unknown) => { if (e instanceof Error && e.name !== "AbortError") setError(e); });
    return () => c.abort();
  }, [url]);
  return { data, error } as const;
}
const { data } = useFetch<{ id: number; title: string }[]>("/api/tasks");`,
        ),
      ],
      [
        blk(`<h3>Typing data from the network</h3>
• Compile-time types are <b>not checked at runtime</b>. A server response typed as <code>User</code> may still be wrong. Validate at the boundary with <b>Zod</b> and infer the type from the schema, so type and validator cannot drift.<br>
• Model async state as a discriminated union (<code>{status: "loading"} | {status: "error", error} | {status: "success", data}</code>) so <code>data</code> is only accessible when it exists.<br>
• Share types with the back end by generating them from the OpenAPI spec (Spring Boot + springdoc + <code>openapi-typescript</code>).<br>
• Enable <code>strict</code> and <code>noUncheckedIndexedAccess</code>; avoid <code>any</code> and unnecessary <code>as</code> casts.`,
          `import { z } from "zod";

const TaskSchema = z.object({ id: z.number(), title: z.string(), done: z.boolean() });
const TasksSchema = z.array(TaskSchema);
type Task = z.infer<typeof TaskSchema>;                    // derived from the validator

async function loadTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks");
  return TasksSchema.parse(await res.json());              // throws a descriptive error if the shape is wrong
}

type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: T };

function View({ state }: { state: AsyncState<Task[]> }) {
  switch (state.status) {
    case "loading": return <p>Loading...</p>;
    case "error": return <p role="alert">{state.error.message}</p>;
    case "success": return <ul>{state.data.map(t => <li key={t.id}>{t.title}</li>)}</ul>;   // data exists only here
  }
}`,
        ),
      ],
      [
        ['Why is a TypeScript type not enough for API data?', 'Types are erased at runtime and do not verify what the server returns. Validate responses with a schema library (Zod) and derive the type from it.'],
        ['How do you type a Context safely?', 'createContext<Value | null>(null) plus a useX hook that throws when the value is null, so consumers always receive a non-null typed value.'],
        ['What is a discriminated union and why use it for async state?', 'A union of object types sharing a literal field (status). TypeScript narrows on it, so data is available only in the success branch, preventing access to missing data.'],
      ],
    ),
  ]),
];
