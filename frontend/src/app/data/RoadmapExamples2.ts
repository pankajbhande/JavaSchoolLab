// Worked examples (complete mini programs) appended to the JavaScript, React, Angular and Flutter roadmaps,
// plus real-world scenario lessons for the JavaFX, Spring Core, Hibernate and Microservices example modules.
import type { SubTopic } from './types';
import { blk, topic } from './jsRoadmapKit';

export const jsExamples: SubTopic[] = [
  {
    id: 'jsr-examples',
    name: 'Worked Examples · Complete JavaScript Mini Programs',
    topics: [
      topic(
        'jsr-ex-todo-vanilla',
        'Example: To-Do App with the DOM, Events and localStorage',
        [
          blk(`<h3>What you build</h3>
• A to-do list in plain JavaScript: add, toggle, delete, filter, and <b>persist to localStorage</b>. It uses DOM creation, <b>event delegation</b>, array methods and JSON.`,
            `<!-- index.html -->
<form id="form"><input id="text" placeholder="What needs doing?" required><button>Add</button></form>
<div id="filters"><button data-f="all">All</button><button data-f="open">Open</button><button data-f="done">Done</button></div>
<ul id="list"></ul>
<p id="count"></p>
<script type="module">
const KEY = "todos";
let todos = JSON.parse(localStorage.getItem(KEY) ?? "[]");
let filter = "all";

const save = () => localStorage.setItem(KEY, JSON.stringify(todos));
const visible = () => todos.filter(t => filter === "all" || (filter === "done") === t.done);

function render() {
  const list = document.querySelector("#list");
  list.replaceChildren(...visible().map(t => {
    const li = document.createElement("li");
    li.dataset.id = t.id;
    li.className = t.done ? "done" : "";
    li.innerHTML = '<label><input type="checkbox"> <span></span></label> <button data-del>x</button>';
    li.querySelector("input").checked = t.done;
    li.querySelector("span").textContent = t.text;          // textContent, never innerHTML, for user input (XSS safe)
    return li;
  }));
  document.querySelector("#count").textContent = todos.filter(t => !t.done).length + " open";
}

document.querySelector("#form").addEventListener("submit", e => {
  e.preventDefault();
  const input = document.querySelector("#text");
  todos.push({ id: crypto.randomUUID(), text: input.value.trim(), done: false });
  input.value = ""; save(); render();
});

// event delegation: one listener for every row
document.querySelector("#list").addEventListener("click", e => {
  const id = e.target.closest("li")?.dataset.id;
  if (!id) return;
  if (e.target.matches("[data-del]")) todos = todos.filter(t => t.id !== id);
  else if (e.target.matches("input[type=checkbox]")) todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
  save(); render();
});
document.querySelector("#filters").addEventListener("click", e => { if (e.target.dataset.f) { filter = e.target.dataset.f; render(); } });
render();
</script>`,
          ),
        ],
        [
          blk(`<h3>Concepts used</h3>
• <b>Immutable updates</b> (<code>map</code>/<code>filter</code>/spread) make state changes easy to reason about. • <b>Event delegation</b> keeps one listener regardless of list size. • <code>textContent</code> avoids injecting HTML from user input. • <code>localStorage</code> stores strings only: always <code>JSON.stringify/parse</code> and handle parse errors.`,
            `function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; }
  catch { return []; }                         // corrupted data must not break the app
}`,
          ),
        ],
        [
          blk(`<h3>Upgrades</h3>
• Sync between tabs with the <code>storage</code> event, add <b>undo</b> with a history stack, edit in place (double-click), drag to reorder, and write tests for the pure functions (<code>visible</code>, reducers).`,
            `window.addEventListener("storage", e => { if (e.key === KEY) { todos = load(); render(); } });      // other tab changed the list

// pure, testable logic
export const toggle = (todos, id) => todos.map(t => (t.id === id ? { ...t, done: !t.done } : t));
// test: expect(toggle([{id:1,done:false}], 1)[0].done).toBe(true)`,
          ),
        ],
        [
          ['Why use event delegation?', 'A single listener on the parent handles clicks for all current and future children, saving memory and avoiding re-binding after renders.'],
          ['Why use textContent instead of innerHTML for user input?', 'innerHTML parses HTML and can execute injected markup (XSS); textContent inserts plain text.'],
        ],
      ),
      topic(
        'jsr-ex-fetch-search',
        'Example: Search-as-You-Type with Debounce, fetch, AbortController and Error Handling',
        [
          blk(`<h3>What you build</h3>
• A search box that calls an API <b>300 ms after the user stops typing</b>, <b>cancels the previous request</b> when a new one starts, handles HTTP and network errors and ignores stale responses.`,
            `const input = document.querySelector("#q");
const results = document.querySelector("#results");
let controller;

const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

async function search(query) {
  controller?.abort();                                   // cancel the in-flight request
  if (!query.trim()) { results.replaceChildren(); return; }
  controller = new AbortController();
  results.textContent = "Searching...";
  try {
    const res = await fetch("/api/courses?q=" + encodeURIComponent(query), { signal: controller.signal });
    if (!res.ok) throw new Error("HTTP " + res.status);     // fetch only rejects on network errors
    const data = await res.json();
    results.replaceChildren(...data.map(c => Object.assign(document.createElement("li"), { textContent: c.title })));
    if (!data.length) results.textContent = "No results";
  } catch (err) {
    if (err.name === "AbortError") return;                  // expected when a newer search started
    results.textContent = "Something went wrong: " + err.message;
  }
}
input.addEventListener("input", debounce(e => search(e.target.value), 300));`,
          ),
        ],
        [
          blk(`<h3>Reusable helpers</h3>
• Wrap <code>fetch</code> once so every call gets JSON parsing, error mapping, a timeout and retry for transient failures.`,
            `async function http(url, { retries = 2, timeout = 5000, ...opts } = {}) {
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      if (res.status >= 500 && attempt < retries) { await new Promise(r => setTimeout(r, 200 * 2 ** attempt)); continue; }
      if (!res.ok) throw Object.assign(new Error("HTTP " + res.status), { status: res.status });
      return res.status === 204 ? null : await res.json();
    } catch (e) {
      if (e.name === "AbortError" || attempt >= retries) throw e;
      await new Promise(r => setTimeout(r, 200 * 2 ** attempt));
    } finally { clearTimeout(timer); }
  }
}`,
          ),
        ],
        [
          blk(`<h3>Race conditions</h3>
• Without cancellation, a slow response for "sp" can arrive <b>after</b> the response for "spring" and overwrite it. Aborting the old request (or checking a request counter) guarantees the UI shows the latest query.`,
            `let latest = 0;
async function searchGuarded(q) {
  const id = ++latest;
  const data = await http("/api/courses?q=" + encodeURIComponent(q));
  if (id !== latest) return;                 // a newer search exists: drop this stale result
  render(data);
}`,
          ),
        ],
        [
          ['Why does fetch not reject on a 404 or 500?', 'fetch only rejects on network failures; HTTP error statuses resolve normally, so check response.ok.'],
          ['How do you avoid stale search results?', 'Debounce input and cancel previous requests with AbortController or ignore responses whose request id is not the latest.'],
        ],
      ),
      topic(
        'jsr-ex-realworld-checkout',
        'Real-World Scenario: Cart and Checkout Logic with Pure Functions, Money and Tests',
        [
          blk(`<h3>The scenario</h3>
• An e-commerce cart needs correct totals: quantities, discounts, tax, free shipping above a threshold. Real bugs come from <b>floating-point money</b> and logic tangled with the DOM. The professional approach: <b>pure functions</b> working in <b>integer minor units</b> (paise/cents), unit-tested, and the UI calls them.`,
            `// money in integer paise: no 0.1 + 0.2 problems
const rupees = p => (p / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });

const lineTotal = ({ price, qty }) => price * qty;
const subtotal = items => items.reduce((s, i) => s + lineTotal(i), 0);
const discount = (sub, code) => ({ SAVE10: Math.round(sub * 0.10), FLAT500: Math.min(50000, sub) }[code] ?? 0);
const tax = (amount, rate = 0.18) => Math.round(amount * rate);
const shipping = sub => (sub >= 99900 ? 0 : 4900);

export function priceCart(items, code) {
  const sub = subtotal(items);
  const disc = discount(sub, code);
  const taxable = sub - disc;
  const total = taxable + tax(taxable) + shipping(taxable);
  return { sub, disc, tax: tax(taxable), shipping: shipping(taxable), total };
}

priceCart([{ price: 49900, qty: 2 }], "SAVE10");        // { sub: 99800, disc: 9980, tax: 16168, shipping: 4900, total: 110888 }`,
          ),
        ],
        [
          blk(`<h3>Tests that document the rules</h3>`,
            `import { describe, it, expect } from "vitest";
describe("priceCart", () => {
  it("adds 18% tax", () => expect(priceCart([{ price: 10000, qty: 1 }]).tax).toBe(1800));
  it("gives free shipping from 999", () => expect(priceCart([{ price: 99900, qty: 1 }]).shipping).toBe(0));
  it("never discounts below zero", () => expect(priceCart([{ price: 1000, qty: 1 }], "FLAT500").total).toBeGreaterThanOrEqual(0));
  it("ignores unknown codes", () => expect(priceCart([{ price: 1000, qty: 1 }], "NOPE").disc).toBe(0));
  it("is pure: does not mutate the cart", () => { const items = [{ price: 1, qty: 1 }]; const copy = structuredClone(items); priceCart(items); expect(items).toEqual(copy); });
});`,
          ),
        ],
        [
          blk(`<h3>Production lessons</h3>
• <b>Never trust the browser total</b>: the server recomputes prices from product ids. • Keep currency/rounding rules in one module. • Use <code>Intl.NumberFormat</code> for display only. • Add <b>idempotency keys</b> to the payment request so a double click cannot charge twice. • Log pricing inputs when totals are disputed.`,
            `async function pay(cart, code) {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": crypto.randomUUID() },     // safe retries
    body: JSON.stringify({ items: cart.map(({ id, qty }) => ({ id, qty })), code }),            // ids only: the server prices the cart
  });
  if (!res.ok) throw new Error("Payment failed");
  return res.json();
}`,
          ),
        ],
        [
          ['Why represent money as integers?', 'Binary floating point cannot represent many decimals exactly (0.1 + 0.2), so use integer minor units and format only for display.'],
          ['Why must the server recalculate prices?', 'Client data can be tampered with; the server is the authority for prices and totals.'],
        ],
      ),
    ],
  },
];

export const reactExamples: SubTopic[] = [
  {
    id: 'rr-examples',
    name: 'Worked Examples · Complete React Mini Programs',
    topics: [
      topic(
        'rr-ex-course-search',
        'Example: Searchable Course List with Custom Hook, Loading and Error States',
        [
          blk(`<h3>What you build</h3>
• A list that fetches courses, shows <b>loading, error and empty states</b>, filters with a <b>debounced search</b> and uses a reusable <code>useFetch</code> hook that cancels stale requests.`,
            `import { useEffect, useMemo, useState } from "react";

function useFetch(url) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    const ctrl = new AbortController();
    setState(s => ({ ...s, loading: true, error: null }));
    fetch(url, { signal: ctrl.signal })
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => setState({ data, error: null, loading: false }))
      .catch(error => { if (error.name !== "AbortError") setState({ data: null, error, loading: false }); });
    return () => ctrl.abort();                                    // cleanup: avoids setState after unmount / stale responses
  }, [url]);
  return state;
}

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}

export default function CourseList() {
  const [query, setQuery] = useState("");
  const q = useDebounced(query);
  const { data, error, loading } = useFetch("/api/courses");
  const shown = useMemo(() => (data ?? []).filter(c => c.title.toLowerCase().includes(q.toLowerCase())), [data, q]);

  if (loading) return <p role="status">Loading...</p>;
  if (error) return <p role="alert">Could not load courses: {error.message}</p>;
  return (
    <section>
      <input aria-label="Search courses" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." />
      {shown.length === 0 ? <p>No courses found.</p> : (
        <ul>{shown.map(c => <li key={c.id}>{c.title} <small>({c.lessons} lessons)</small></li>)}</ul>
      )}
    </section>
  );
}`,
          ),
        ],
        [
          blk(`<h3>Why it is written this way</h3>
• The <b>effect cleanup</b> aborts the request, preventing updates after unmount and out-of-order responses. • <code>key={c.id}</code> is a stable id, never the array index for dynamic lists. • Filtering is <b>derived state</b> computed with <code>useMemo</code>, not stored in state. • <code>role="status"/"alert"</code> helps screen readers.`,
            `// testing with React Testing Library + MSW
test("shows courses and filters", async () => {
  render(<CourseList />);
  expect(await screen.findByText(/Spring Core/)).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText(/search/i), "react");
  await waitFor(() => expect(screen.queryByText(/Spring Core/)).not.toBeInTheDocument());
});`,
          ),
        ],
        [
          blk(`<h3>Production version</h3>
• Replace the hand-written hook with <b>TanStack Query</b> (caching, retries, deduping, background refresh) and keep the same UI states.`,
            `import { useQuery } from "@tanstack/react-query";
const { data, error, isPending } = useQuery({
  queryKey: ["courses"],
  queryFn: async () => { const r = await fetch("/api/courses"); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); },
  staleTime: 60_000,
});`,
          ),
        ],
        [
          ['Why return a cleanup function from useEffect when fetching?', 'To abort the request or ignore its result when the component unmounts or dependencies change, avoiding stale updates and leaks.'],
          ['Why is filtered data derived rather than stored in state?', 'Duplicated state can go out of sync; derive it from the source data and query during render.'],
        ],
      ),
      topic(
        'rr-ex-optimistic-form',
        'Example: Form with Validation and an Optimistic Update',
        [
          blk(`<h3>What you build</h3>
• A "rename course" form with <b>controlled inputs</b>, client-side validation, and an <b>optimistic update</b>: the UI changes immediately and <b>rolls back</b> if the server rejects it.`,
            `import { useState } from "react";

export function RenameCourse({ course, onChange }) {
  const [title, setTitle] = useState(course.title);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const validate = v => (v.trim().length < 3 ? "Title must be at least 3 characters" : "");

  async function submit(e) {
    e.preventDefault();
    const problem = validate(title);
    if (problem) return setError(problem);
    const previous = course.title;
    setError(""); setSaving(true);
    onChange({ ...course, title });                                         // optimistic: show the new title now
    try {
      const res = await fetch("/api/courses/" + course.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      if (!res.ok) throw new Error("Server rejected the change");
    } catch (err) {
      onChange({ ...course, title: previous });                              // rollback
      setError(err.message);
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="title">Title</label>
      <input id="title" value={title} onChange={e => setTitle(e.target.value)} aria-invalid={!!error} aria-describedby="title-error" />
      {error && <p id="title-error" role="alert">{error}</p>}
      <button disabled={saving}>{saving ? "Saving..." : "Save"}</button>
    </form>
  );
}`,
          ),
        ],
        [
          blk(`<h3>Key ideas</h3>
• <b>Controlled inputs</b>: React state is the single source of truth. • Always keep the <b>previous value</b> so the rollback is exact. • Disable the button while saving to prevent double submits. • <b>Accessibility</b>: label/for, <code>aria-invalid</code>, error announced with <code>role="alert"</code>.`,
            `// same behaviour with TanStack Query mutation
const qc = useQueryClient();
const rename = useMutation({
  mutationFn: ({ id, title }) => api.patch("/courses/" + id, { title }),
  onMutate: async ({ id, title }) => {
    await qc.cancelQueries({ queryKey: ["courses"] });
    const previous = qc.getQueryData(["courses"]);
    qc.setQueryData(["courses"], old => old.map(c => (c.id === id ? { ...c, title } : c)));
    return { previous };
  },
  onError: (_e, _v, ctx) => qc.setQueryData(["courses"], ctx.previous),     // rollback
  onSettled: () => qc.invalidateQueries({ queryKey: ["courses"] }),
});`,
          ),
        ],
        [
          blk(`<h3>Libraries for bigger forms</h3>
• Use <b>React Hook Form</b> with <b>Zod</b> for schema validation, shared between client and server types.`,
            `const schema = z.object({ title: z.string().trim().min(3, "At least 3 characters").max(120) });
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { title: course.title } });
<form onSubmit={handleSubmit(values => rename.mutateAsync({ id: course.id, ...values }))}>
  <input {...register("title")} />
  {errors.title && <p role="alert">{errors.title.message}</p>}
  <button disabled={isSubmitting}>Save</button>
</form>`,
          ),
        ],
        [
          ['What is an optimistic update?', 'Updating the UI immediately assuming the request will succeed and rolling back to the previous state if it fails.'],
          ['Controlled vs uncontrolled inputs?', 'Controlled inputs get their value from React state; uncontrolled inputs keep it in the DOM and are read through refs or FormData.'],
        ],
      ),
      topic(
        'rr-ex-realworld-dashboard',
        'Real-World Scenario: Learning Dashboard with Error Boundary, Code Splitting and Performance',
        [
          blk(`<h3>The scenario</h3>
• A dashboard with several widgets (progress chart, recent lessons, leaderboard). Real requirements: <b>one failing widget must not blank the page</b>, heavy charts should <b>load lazily</b>, and typing in a filter must not make the page janky.`,
            `import { Component, Suspense, lazy } from "react";

class WidgetBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { reportError(error, info); }                       // send to Sentry/logging
  render() {
    return this.state.error
      ? <div role="alert">This widget failed. <button onClick={() => this.setState({ error: null })}>Retry</button></div>
      : this.props.children;
  }
}

const ProgressChart = lazy(() => import("./ProgressChart"));          // heavy chart library loads only when needed
const Leaderboard = lazy(() => import("./Leaderboard"));

export default function Dashboard() {
  return (
    <main className="grid">
      <WidgetBoundary><Suspense fallback={<Skeleton />}><ProgressChart /></Suspense></WidgetBoundary>
      <WidgetBoundary><Suspense fallback={<Skeleton />}><Leaderboard /></Suspense></WidgetBoundary>
    </main>
  );
}`,
          ),
        ],
        [
          blk(`<h3>Keeping filters responsive</h3>
• Typing in a filter re-renders a large table. Use <code>useDeferredValue</code>/<code>useTransition</code> so input stays instant while the heavy list updates at lower priority, memoise rows, and <b>virtualise</b> long lists (react-window).`,
            `function Leaderboard({ rows }) {
  const [filter, setFilter] = useState("");
  const deferred = useDeferredValue(filter);                        // list uses the deferred value
  const filtered = useMemo(() => rows.filter(r => r.name.toLowerCase().includes(deferred.toLowerCase())), [rows, deferred]);
  return (
    <>
      <input value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter learners" />
      <FixedSizeList height={400} itemCount={filtered.length} itemSize={40} width="100%">
        {({ index, style }) => <Row style={style} row={filtered[index]} />}
      </FixedSizeList>
    </>
  );
}
const Row = memo(function Row({ row, style }) { return <div style={style}>{row.name} - {row.points}</div>; });`,
          ),
        ],
        [
          blk(`<h3>Measure before optimising</h3>
• Use the <b>React DevTools Profiler</b> to find components that re-render needlessly, <b>Lighthouse/Web Vitals</b> for loading metrics, and a bundle analyzer to see what code splitting saved. Typical wins: split by route, lazy-load charts/editors, avoid creating new objects/functions in props of memoised children, keep state close to where it is used.`,
            `import { onLCP, onINP, onCLS } from "web-vitals";
[onLCP, onINP, onCLS].forEach(report => report(m => navigator.sendBeacon("/metrics", JSON.stringify(m))));`,
          ),
        ],
        [
          ['What does an error boundary catch?', 'Errors thrown during rendering, lifecycle methods and constructors of its child tree; not event handlers or async code, which need their own try/catch.'],
          ['How do you keep a heavy list responsive while typing?', 'Defer the filter value with useDeferredValue/useTransition, memoise rows and virtualise the list.'],
        ],
      ),
    ],
  },
];

export const angularExamples: SubTopic[] = [
  {
    id: 'ng-examples',
    name: 'Worked Examples · Complete Angular Mini Programs',
    topics: [
      topic(
        'ng-ex-course-list-signals',
        'Example: Course List with Signals, HttpClient, Search and OnPush',
        [
          blk(`<h3>What you build</h3>
• A standalone component that loads courses with <code>HttpClient</code>, keeps UI state in <b>signals</b> (<code>signal</code>, <code>computed</code>), filters by a search input and renders with the new <code>@for</code>/<code>@if</code> control flow.`,
            `import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { catchError, of } from 'rxjs';

interface Course { id: number; title: string; lessons: number; }

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <input [ngModel]="query()" (ngModelChange)="query.set($event)" placeholder="Search..." aria-label="Search courses" />
    @if (error()) { <p role="alert">Could not load courses</p> }
    @else if (courses() === null) { <p>Loading...</p> }
    @else {
      <ul>
        @for (c of filtered(); track c.id) { <li>{{ c.title }} ({{ c.lessons }} lessons)</li> }
        @empty { <li>No courses found</li> }
      </ul>
      <p>{{ filtered().length }} of {{ courses()!.length }} shown</p>
    }
  \`,
})
export class CourseListComponent {
  private http = inject(HttpClient);
  query = signal('');
  error = signal(false);
  courses = toSignal(this.http.get<Course[]>('/api/courses').pipe(catchError(() => { this.error.set(true); return of([] as Course[]); })), { initialValue: null });
  filtered = computed(() => (this.courses() ?? []).filter(c => c.title.toLowerCase().includes(this.query().toLowerCase())));
}`,
          ),
        ],
        [
          blk(`<h3>Concepts used</h3>
• <b>Signals</b> give fine-grained reactivity: <code>filtered</code> recomputes only when <code>courses</code> or <code>query</code> change. • <code>toSignal</code> bridges an Observable into a signal and unsubscribes automatically. • <code>track c.id</code> makes list updates efficient. • <b>OnPush</b> + signals means the template updates only when signals change.`,
            `// service + test
@Injectable({ providedIn: 'root' }) export class CourseApi { private http = inject(HttpClient); all() { return this.http.get<Course[]>('/api/courses'); } }

it('filters by title', () => {
  const fixture = TestBed.createComponent(CourseListComponent);
  fixture.componentInstance.query.set('angular');
  expect(fixture.componentInstance.filtered().every(c => /angular/i.test(c.title))).toBe(true);
});`,
          ),
        ],
        [
          blk(`<h3>Server-driven search with RxJS</h3>
• For large catalogues search on the server: <code>debounceTime</code> + <code>distinctUntilChanged</code> + <code>switchMap</code> (cancels the previous request).`,
            `results$ = toObservable(this.query).pipe(
  debounceTime(300), distinctUntilChanged(),
  switchMap(q => q.trim() ? this.http.get<Course[]>('/api/courses', { params: { q } }).pipe(catchError(() => of([]))) : of([])),
);
results = toSignal(this.results$, { initialValue: [] });`,
          ),
        ],
        [
          ['Why use switchMap for search-as-you-type?', 'It cancels the previous inner request when a new value arrives, so only the latest search result is used.'],
          ['What do signals add over plain properties?', 'Fine-grained dependency tracking: derived values (computed) and templates update only when their signals change, enabling OnPush/zoneless change detection.'],
        ],
      ),
      topic(
        'ng-ex-reactive-form',
        'Example: Reactive Form with Custom and Async Validators',
        [
          blk(`<h3>What you build</h3>
• A registration form using <b>typed reactive forms</b>: required/email/min-length validators, a <b>cross-field</b> password confirmation validator, an <b>async</b> "email already used" check and clear error messages.`,
            `import { Component, inject } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map, of, switchMap, timer } from 'rxjs';

const matchPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null =>
  group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };

function emailFree(http: HttpClient): AsyncValidatorFn {
  return (c: AbstractControl) => c.value ? timer(400).pipe(switchMap(() => http.get<{ taken: boolean }>('/api/users/exists', { params: { email: c.value } })), map(r => (r.taken ? { taken: true } : null))) : of(null);
}

@Component({
  selector: 'app-register', standalone: true, imports: [ReactiveFormsModule],
  template: \`
  <form [formGroup]="form" (ngSubmit)="submit()">
    <input formControlName="email" placeholder="Email" />
    @if (email.touched && email.errors) {
      <small>@if (email.errors['required']) { Email is required } @else if (email.errors['email']) { Enter a valid email } @else if (email.errors['taken']) { Already registered }</small>
    }
    @if (email.pending) { <small>Checking...</small> }
    <input type="password" formControlName="password" placeholder="Password" />
    <input type="password" formControlName="confirm" placeholder="Confirm" />
    @if (form.errors?.['mismatch'] && form.controls.confirm.touched) { <small>Passwords do not match</small> }
    <button [disabled]="form.invalid || form.pending">Register</button>
  </form>\`,
})
export class RegisterComponent {
  private fb = inject(FormBuilder); private http = inject(HttpClient);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email], [emailFree(this.http)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  }, { validators: matchPasswords });
  get email() { return this.form.controls.email; }
  submit() { if (this.form.valid) this.http.post('/api/users', this.form.getRawValue()).subscribe(); }
}`,
          ),
        ],
        [
          blk(`<h3>Why this design</h3>
• <b>Typed forms</b> (<code>nonNullable.group</code>) give type-safe <code>getRawValue()</code>. • The async validator is <b>debounced with timer + switchMap</b> so it does not call the server on every keystroke, and runs only when sync validators pass. • Group-level validators handle cross-field rules. • Show messages only after <code>touched</code>.`,
            `it('flags mismatching passwords', () => {
  const fixture = TestBed.createComponent(RegisterComponent);
  fixture.componentInstance.form.patchValue({ password: 'abcdefgh', confirm: 'zzz' });
  expect(fixture.componentInstance.form.errors).toEqual({ mismatch: true });
});`,
          ),
        ],
        [
          blk(`<h3>Server errors and reuse</h3>
• Map server-side validation errors back to controls (<code>control.setErrors({ server: message })</code>), extract validators into a shared file, and build a small <code>app-field-error</code> component to avoid repeating message markup.`,
            `this.http.post('/api/users', this.form.getRawValue()).subscribe({
  error: (e: HttpErrorResponse) => {
    const fields = e.error?.errors as Record<string, string> | undefined;
    Object.entries(fields ?? {}).forEach(([name, message]) => this.form.get(name)?.setErrors({ server: message }));
  },
});`,
          ),
        ],
        [
          ['Template-driven vs reactive forms?', 'Template-driven forms use directives in the template with implicit models; reactive forms define the model in code, are explicitly typed, easier to test and better for complex validation.'],
          ['Why debounce an async validator?', 'To avoid a server call per keystroke; typically use timer + switchMap so only the latest value is checked.'],
        ],
      ),
      topic(
        'ng-ex-realworld-admin',
        'Real-World Scenario: Admin Area with Lazy Routes, Guards and an HTTP Interceptor',
        [
          blk(`<h3>The scenario</h3>
• An admin area that only administrators can open, lazy loaded so normal users never download it, with a <b>token interceptor</b> that adds the auth header and redirects to login on <b>401</b>.`,
            `// app.routes.ts
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login.component').then(m => m.LoginComponent) },
  { path: 'admin', canMatch: [adminGuard], loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },     // chunk loaded only for admins
  { path: '', pathMatch: 'full', redirectTo: 'courses' },
  { path: '**', loadComponent: () => import('./not-found.component').then(m => m.NotFoundComponent) },
];

export const adminGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  return auth.hasRole('ADMIN') || inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: '/admin' } });
};

// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService); const router = inject(Router);
  const authed = auth.token() && req.url.startsWith('/api') ? req.clone({ setHeaders: { Authorization: 'Bearer ' + auth.token() } }) : req;
  return next(authed).pipe(catchError(err => {
    if (err.status === 401) { auth.logout(); router.navigate(['/login']); }
    return throwError(() => err);
  }));
};

// main.ts
bootstrapApplication(AppComponent, { providers: [provideRouter(routes, withComponentInputBinding()), provideHttpClient(withInterceptors([authInterceptor]))] });`,
          ),
        ],
        [
          blk(`<h3>Global error handling and loading UX</h3>
• A <b>global error interceptor</b> shows a toast for 5xx errors; a <b>loading interceptor</b> counts in-flight requests to drive a progress bar; a custom <code>ErrorHandler</code> reports unexpected exceptions. Keep security in the <b>server</b>: guards only improve UX.`,
            `export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
@Injectable({ providedIn: 'root' }) export class LoadingService {
  private count = signal(0);
  readonly busy = computed(() => this.count() > 0);
  start() { this.count.update(n => n + 1); } stop() { this.count.update(n => Math.max(0, n - 1)); }
}`,
          ),
        ],
        [
          blk(`<h3>Testing the guard and interceptor</h3>`,
            `it('adds the bearer token', () => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), { provide: AuthService, useValue: { token: () => 'abc' } }] });
  TestBed.inject(HttpClient).get('/api/courses').subscribe();
  const req = TestBed.inject(HttpTestingController).expectOne('/api/courses');
  expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
});`,
          ),
        ],
        [
          ['Why are route guards not enough for security?', 'They only control client navigation; the backend must enforce authorization on every API call.'],
          ['What does an HTTP interceptor allow?', 'Cross-cutting handling of all requests/responses such as auth headers, error mapping, loading indicators and logging.'],
        ],
      ),
    ],
  },
];

export const flutterExamples: SubTopic[] = [
  {
    id: 'fl-examples',
    name: 'Worked Examples · Complete Flutter Mini Programs',
    topics: [
      topic(
        'fl-ex-counter-form',
        'Example: Task List App with StatefulWidget, ListView and Dismissible',
        [
          blk(`<h3>What you build</h3>
• A task list: add via a text field, <b>swipe to delete with undo</b>, tap to toggle done. It uses <code>StatefulWidget</code>, <code>ListView.builder</code>, <code>Dismissible</code> and <code>SnackBar</code>.`,
            `import 'package:flutter/material.dart';

void main() => runApp(const MaterialApp(home: TaskPage()));

class Task {
  Task(this.id, this.title, {this.done = false});
  final int id; final String title; bool done;
}

class TaskPage extends StatefulWidget {
  const TaskPage({super.key});
  @override State<TaskPage> createState() => _TaskPageState();
}

class _TaskPageState extends State<TaskPage> {
  final _controller = TextEditingController();
  final List<Task> _tasks = [];
  int _nextId = 1;

  @override void dispose() { _controller.dispose(); super.dispose(); }

  void _add() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() => _tasks.add(Task(_nextId++, text)));
    _controller.clear();
  }

  void _remove(int index) {
    final removed = _tasks[index];
    setState(() => _tasks.removeAt(index));
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(
        content: Text('Deleted "\${removed.title}"'),
        action: SnackBarAction(label: 'UNDO', onPressed: () => setState(() => _tasks.insert(index, removed))),
      ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Tasks (\${_tasks.where((t) => !t.done).length} open)')),
      body: Column(children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(children: [
            Expanded(child: TextField(controller: _controller, onSubmitted: (_) => _add(), decoration: const InputDecoration(hintText: 'New task'))),
            IconButton(onPressed: _add, icon: const Icon(Icons.add)),
          ]),
        ),
        Expanded(
          child: _tasks.isEmpty
              ? const Center(child: Text('Nothing to do'))
              : ListView.builder(
                  itemCount: _tasks.length,
                  itemBuilder: (context, i) {
                    final t = _tasks[i];
                    return Dismissible(
                      key: ValueKey(t.id),                                    // stable key so the right row is removed
                      onDismissed: (_) => _remove(i),
                      background: Container(color: Colors.red),
                      child: CheckboxListTile(
                        value: t.done,
                        title: Text(t.title, style: TextStyle(decoration: t.done ? TextDecoration.lineThrough : null)),
                        onChanged: (v) => setState(() => t.done = v ?? false),
                      ),
                    );
                  },
                ),
        ),
      ]),
    );
  }
}`,
          ),
        ],
        [
          blk(`<h3>Concepts used</h3>
• <b>setState</b> rebuilds only this widget's subtree. • <code>ListView.builder</code> builds visible rows lazily. • <b>Keys</b> matter for dismissible/reorderable lists. • <b>Dispose</b> controllers to avoid leaks. • Keep logic testable: move task operations to a plain class and test it without widgets.`,
            `class TaskList {
  final _items = <Task>[]; int _id = 1;
  List<Task> get items => List.unmodifiable(_items);
  Task add(String title) { final t = Task(_id++, title.trim()); _items.add(t); return t; }
  void remove(Task t) => _items.remove(t);
}
// test('add trims title', () => expect((TaskList()..add('  x ')).items.first.title, 'x'));

// widget test
testWidgets('adds a task', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: TaskPage()));
  await tester.enterText(find.byType(TextField), 'Write tests');
  await tester.tap(find.byIcon(Icons.add));
  await tester.pump();
  expect(find.text('Write tests'), findsOneWidget);
});`,
          ),
        ],
        [
          blk(`<h3>Moving to state management</h3>
• When several screens need the tasks, lift the state into <b>Riverpod</b> (or Bloc): the UI watches a provider and calls methods on a notifier.`,
            `final tasksProvider = NotifierProvider<TasksNotifier, List<Task>>(TasksNotifier.new);
class TasksNotifier extends Notifier<List<Task>> {
  @override List<Task> build() => [];
  void add(String title) => state = [...state, Task(state.length + 1, title)];
  void toggle(int id) => state = [for (final t in state) t.id == id ? Task(t.id, t.title, done: !t.done) : t];
}
// in a ConsumerWidget: final tasks = ref.watch(tasksProvider); ref.read(tasksProvider.notifier).add('x');`,
          ),
        ],
        [
          ['Why use keys in a list of Dismissible items?', 'Keys let Flutter match each widget to its data when items are removed or reordered, so the correct row animates and state is preserved.'],
          ['Why dispose a TextEditingController?', 'Controllers hold listeners and resources; not disposing them leaks memory.'],
        ],
      ),
      topic(
        'fl-ex-api-list',
        'Example: Fetching a List from an API with FutureBuilder, Error and Retry',
        [
          blk(`<h3>What you build</h3>
• A screen that loads courses from a REST API with <code>http</code>, handles <b>loading, error and empty</b> states, supports <b>pull-to-refresh</b> and a <b>Retry</b> button and parses JSON into typed models.`,
            `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class Course {
  Course({required this.id, required this.title, required this.lessons});
  final int id; final String title; final int lessons;
  factory Course.fromJson(Map<String, dynamic> j) => Course(id: j['id'] as int, title: j['title'] as String, lessons: (j['lessons'] ?? 0) as int);
}

Future<List<Course>> fetchCourses() async {
  final res = await http.get(Uri.parse('https://api.example.com/courses')).timeout(const Duration(seconds: 8));
  if (res.statusCode != 200) throw Exception('Server returned \${res.statusCode}');
  return (jsonDecode(res.body) as List).map((e) => Course.fromJson(e as Map<String, dynamic>)).toList();
}

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});
  @override State<CoursesScreen> createState() => _CoursesScreenState();
}
class _CoursesScreenState extends State<CoursesScreen> {
  late Future<List<Course>> _future = fetchCourses();                // created once, not in build()
  Future<void> _reload() async { setState(() => _future = fetchCourses()); await _future.catchError((_) => <Course>[]); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Courses')),
      body: FutureBuilder<List<Course>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator());
          if (snap.hasError) {
            return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
              const Text('Could not load courses'),
              TextButton(onPressed: _reload, child: const Text('Retry')),
            ]));
          }
          final courses = snap.data!;
          if (courses.isEmpty) return const Center(child: Text('No courses yet'));
          return RefreshIndicator(
            onRefresh: _reload,
            child: ListView.separated(
              itemCount: courses.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (_, i) => ListTile(title: Text(courses[i].title), subtitle: Text('\${courses[i].lessons} lessons')),
            ),
          );
        },
      ),
    );
  }
}`,
          ),
        ],
        [
          blk(`<h3>Common mistakes avoided</h3>
• <b>Never create the Future inside <code>build()</code></b>: every rebuild would refetch. • Always handle <code>hasError</code> and the empty list. • Parse JSON defensively (<code>?? 0</code>). • Use a <b>timeout</b> so the spinner cannot spin forever. • Keep networking in a repository class, not in the widget.`,
            `abstract class CourseRepository { Future<List<Course>> all(); }
class ApiCourseRepository implements CourseRepository {
  ApiCourseRepository(this._client);
  final http.Client _client;
  @override Future<List<Course>> all() async { /* same fetch using _client */ return []; }
}
// test with a fake: class FakeRepo implements CourseRepository { Future<List<Course>> all() async => [Course(id: 1, title: 'Flutter', lessons: 10)]; }`,
          ),
        ],
        [
          blk(`<h3>Production upgrades</h3>
• Use <b>dio</b> or <b>http</b> with interceptors (auth, logging), <b>freezed/json_serializable</b> for models, <b>Riverpod AsyncValue</b> for loading/error/data and cache results locally (drift/hive) for offline use.`,
            `final coursesProvider = FutureProvider.autoDispose<List<Course>>((ref) => ref.watch(courseRepositoryProvider).all());
// UI
ref.watch(coursesProvider).when(
  data: (courses) => CourseList(courses),
  loading: () => const CircularProgressIndicator(),
  error: (e, _) => ErrorView(onRetry: () => ref.invalidate(coursesProvider)),
);`,
          ),
        ],
        [
          ['Why shouldn\'t you create a Future inside build()?', 'build runs often, so the request would restart on every rebuild; create the Future once in initState or a field/provider.'],
          ['How do you show loading, error and data with Riverpod?', 'Watch an AsyncValue provider and use when(data, loading, error).'],
        ],
      ),
      topic(
        'fl-ex-realworld-offline',
        'Real-World Scenario: Offline-First Learning App with Repository, Local Cache and Sync',
        [
          blk(`<h3>The scenario</h3>
• Learners study on trains and in areas with poor signal. The app must <b>show cached lessons instantly</b>, refresh in the background when online and <b>queue progress updates</b> made offline. Architecture: <b>UI → Notifier → Repository → (local database + remote API)</b>, with the local database as the <b>single source of truth</b>.`,
            `class LessonRepository {
  LessonRepository(this._api, this._db, this._connectivity);
  final LessonApi _api; final LessonDao _db; final Connectivity _connectivity;

  Stream<List<Lesson>> watchLessons(int courseId) async* {
    yield* _db.watchByCourse(courseId);                                // UI always reads from the local DB
  }

  Future<void> refresh(int courseId) async {
    if ((await _connectivity.checkConnectivity()).contains(ConnectivityResult.none)) return;
    try {
      final remote = await _api.fetchLessons(courseId);
      await _db.upsertAll(remote);                                     // DB emits, the stream updates the UI
    } catch (_) { /* keep showing cached data */ }
  }

  Future<void> markComplete(int lessonId) async {
    await _db.setCompleted(lessonId, true);                            // optimistic and offline-safe
    await _db.enqueue(PendingOp.complete(lessonId));                   // outbox entry
    unawaited(syncPending());
  }

  Future<void> syncPending() async {
    for (final op in await _db.pendingOps()) {
      try { await _api.send(op); await _db.removeOp(op.id); }
      catch (_) { break; }                                             // stop at the first failure, retry later (preserves order)
    }
  }
}`,
          ),
        ],
        [
          blk(`<h3>Wiring and triggers</h3>
• Trigger <code>syncPending</code> when connectivity returns, on app resume and periodically (WorkManager / <code>workmanager</code> for background), make server operations <b>idempotent</b> (operation id) and resolve conflicts with <b>last-write-wins</b> or server timestamps.`,
            `final lessonsProvider = StreamProvider.family<List<Lesson>, int>((ref, courseId) {
  final repo = ref.watch(lessonRepositoryProvider);
  repo.refresh(courseId);                                              // kick off a background refresh
  return repo.watchLessons(courseId);
});

ref.listen(connectivityProvider, (_, next) { if (next.valueOrNull?.contains(ConnectivityResult.none) == false) ref.read(lessonRepositoryProvider).syncPending(); });

class AppLifecycle extends WidgetsBindingObserver {
  @override void didChangeAppLifecycleState(AppLifecycleState s) { if (s == AppLifecycleState.resumed) repo.syncPending(); }
}`,
          ),
        ],
        [
          blk(`<h3>Testing offline behaviour</h3>`,
            `test('queues completion when offline and syncs later', () async {
  final api = FakeApi()..online = false;
  final repo = LessonRepository(api, InMemoryDao(), FakeConnectivity.none());
  await repo.markComplete(7);
  expect(await repo.dao.pendingOps(), hasLength(1));
  api.online = true;
  await repo.syncPending();
  expect(await repo.dao.pendingOps(), isEmpty);
  expect(api.received.single.lessonId, 7);
});`,
          ),
        ],
        [
          ['What does offline-first mean?', 'The local database is the source of truth the UI reads from; network refreshes update it and offline changes are queued and synced later.'],
          ['How do you avoid duplicate server effects when syncing queued operations?', 'Give each operation a unique id and make the server idempotent so retries are safe.'],
        ],
      ),
    ],
  },
];

/** Real-world scenario lessons for the JavaFX, Spring Core, Hibernate and Microservices example modules. */
export const javaFxScenario = [
  topic(
    'fx-ex-realworld-inventory',
    'Real-World Scenario: Shop Inventory Desktop App (Layers, Database, Background Sync, Offline)',
    [
      blk(`<h3>The scenario</h3>
• A shop owner uses a desktop app to manage <b>products and stock</b>, scan barcodes and sync with a head-office server. Requirements that shape the design: the UI must <b>never freeze</b>, data must survive a <b>power cut</b>, the app must work <b>offline</b>, and the team needs <b>testable</b> code. Architecture: <b>View (FXML) → ViewModel (properties) → Service → Repository (SQLite) + SyncClient (REST)</b>.`,
        `// ViewModel: pure Java with properties, no JavaFX controls, so it is unit-testable
public class InventoryViewModel {
    private final ObservableList<ProductRow> products = FXCollections.observableArrayList();
    private final StringProperty search = new SimpleStringProperty("");
    private final BooleanProperty busy = new SimpleBooleanProperty();
    private final StringProperty status = new SimpleStringProperty("Ready");
    private final FilteredList<ProductRow> visible = new FilteredList<>(products, p -> true);
    private final InventoryService service; private final Executor background;

    public InventoryViewModel(InventoryService service, Executor background) {
        this.service = service; this.background = background;
        search.addListener((o, a, q) -> visible.setPredicate(p -> q.isBlank() || p.name().toLowerCase().contains(q.toLowerCase()) || p.barcode().equals(q)));
    }
    public void load() { run("Loading...", service::findAll, rows -> products.setAll(rows)); }
    public void adjustStock(ProductRow row, int delta) { run("Saving...", () -> service.adjust(row.id(), delta), updated -> { int i = products.indexOf(row); products.set(i, updated); }); }

    private <T> void run(String message, Callable<T> work, Consumer<T> onSuccess) {
        busy.set(true); status.set(message);
        Task<T> task = new Task<>() { protected T call() throws Exception { return work.call(); } };
        task.setOnSucceeded(e -> { busy.set(false); status.set("Done"); onSuccess.accept(task.getValue()); });
        task.setOnFailed(e -> { busy.set(false); status.set("Failed: " + task.getException().getMessage()); });
        background.execute(task);
    }
    public ObservableList<ProductRow> visibleProducts() { return visible; }
    public StringProperty searchProperty() { return search; }
    public BooleanProperty busyProperty() { return busy; }
    public StringProperty statusProperty() { return status; }
}`,
      ),
    ],
    [
      blk(`<h3>Data safety and offline</h3>
• Use an embedded <b>SQLite/H2</b> database with a <b>transaction per stock change</b> and a <b>sync outbox table</b> (pending changes). A <code>ScheduledService</code> pushes the outbox to the server when online; the stock update and outbox row are written in <b>one transaction</b> so a crash cannot lose or duplicate a change.`,
        `public Product adjust(long id, int delta) throws SQLException {
    try (Connection con = ds.getConnection()) {
        con.setAutoCommit(false);
        try {
            int changed = update(con, "update product set stock = stock + ? where id = ? and stock + ? >= 0", delta, id, delta);
            if (changed == 0) throw new InsufficientStockException(id);
            update(con, "insert into sync_outbox(product_id, delta, created_at) values (?, ?, ?)", id, delta, Instant.now().toString());
            con.commit();
            return find(con, id);
        } catch (Exception e) { con.rollback(); throw e; }
    }
}

ScheduledService<Void> sync = new ScheduledService<>() {
    protected Task<Void> createTask() { return new Task<>() { protected Void call() { outbox.pushPending(); return null; } }; }
};
sync.setPeriod(Duration.seconds(30)); sync.setRestartOnFailure(true); sync.start();`,
      ),
    ],
    [
      blk(`<h3>UX details that matter in a shop</h3>
• <b>Barcode scanners type like a keyboard</b>: capture key events on the scene, buffer characters and treat Enter as "scan complete". • Show a <b>status bar</b> bound to the view model (online/offline, pending changes). • Keep operations <b>undoable</b> where possible. • Test the view model with a fake service and a direct executor (<code>Runnable::run</code>) - no JavaFX needed.`,
        `StringBuilder buffer = new StringBuilder();
scene.addEventFilter(KeyEvent.KEY_TYPED, e -> {
    if (e.getCharacter().equals("\\r")) { String code = buffer.toString(); buffer.setLength(0); if (!code.isBlank()) viewModel.scan(code); e.consume(); }
    else buffer.append(e.getCharacter());
});

@Test void searchFiltersByName() {
    var vm = new InventoryViewModel(new FakeInventoryService(), Runnable::run);        // synchronous executor
    vm.load(); vm.searchProperty().set("rice");
    assertThat(vm.visibleProducts()).extracting(ProductRow::name).containsOnly("Basmati Rice");
}`,
      ),
    ],
    [
      ['How do you keep a desktop app responsive while saving to a database?', 'Run persistence in a Task on a background executor, bind busy/status properties for feedback and apply results in the succeeded callback.'],
      ['Why write the stock change and the outbox row in one transaction?', 'So a crash cannot leave a stock change without a sync record (or vice versa), guaranteeing eventual synchronisation.'],
    ],
  ),
];

export const springCoreScenario = [
  topic(
    'sc-ex-realworld-orders',
    'Real-World Scenario: Order Processing Module (Transactions, Events, Caching, Retry)',
    [
      blk(`<h3>The scenario</h3>
• Placing an order must: <b>reserve stock and save the order atomically</b>, then (after commit) send a confirmation email, update search/analytics and clear the cart: without making the customer wait or losing work if the mail server is down. Spring Core tools combine: <b>@Transactional</b> for atomicity, <b>@TransactionalEventListener</b> for after-commit side effects, <b>@Async</b> for non-blocking work, <b>@Retryable</b> for flaky calls, <b>@Cacheable</b> for product lookups.`,
        `@Service
public class PlaceOrderUseCase {
    private final OrderRepository orders; private final StockService stock; private final ApplicationEventPublisher events;
    public PlaceOrderUseCase(OrderRepository orders, StockService stock, ApplicationEventPublisher events) { this.orders = orders; this.stock = stock; this.events = events; }

    @Transactional
    public OrderId place(PlaceOrder cmd) {
        stock.reserve(cmd.items());                                 // throws OutOfStock: whole transaction rolls back
        Order order = orders.save(Order.create(cmd));
        events.publishEvent(new OrderPlaced(order.id(), cmd.customerEmail()));       // delivered only if the transaction commits
        return order.id();
    }
}

@Component
class OrderSideEffects {
    private final MailService mail; private final SearchIndex index;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void sendConfirmation(OrderPlaced e) { mail.sendConfirmation(e.customerEmail(), e.orderId()); }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void updateAnalytics(OrderPlaced e) { index.record(e); }
}`,
      ),
    ],
    [
      blk(`<h3>Resilience and caching</h3>
• The mail gateway can fail temporarily: <b>retry with backoff</b> (in a separate bean so the proxy applies), then park in a table or dead-letter queue. Product prices are read constantly: <b>cache</b> them with a TTL and evict on change.`,
        `@Service
class MailService {
    @Retryable(retryFor = MailTransientException.class, maxAttempts = 4, backoff = @Backoff(delay = 500, multiplier = 2))
    public void sendConfirmation(String to, OrderId id) { gateway.send(to, template(id)); }
    @Recover void giveUp(MailTransientException e, String to, OrderId id) { failedMails.save(new FailedMail(to, id, e.getMessage())); }
}

@Service
class ProductPricing {
    @Cacheable(cacheNames = "prices", key = "#sku")
    public Money priceOf(String sku) { return catalogue.find(sku).price(); }
    @CacheEvict(cacheNames = "prices", key = "#sku")
    public void changePrice(String sku, Money price) { catalogue.update(sku, price); }
}`,
      ),
    ],
    [
      blk(`<h3>Verifying the guarantees</h3>
• Test that a rollback sends <b>no</b> email, that events fire after commit and that failures are recorded. These tests are what prove the design works.`,
        `@SpringBootTest
class PlaceOrderIT {
    @Autowired PlaceOrderUseCase useCase; @MockBean MailService mail;

    @Test void noEmailWhenStockIsMissing() {
        assertThrows(OutOfStockException.class, () -> useCase.place(cmdWithTooMany()));
        verifyNoInteractions(mail);                                       // the AFTER_COMMIT listener never ran
    }
    @Test void emailAfterCommit() {
        useCase.place(validCmd());
        verify(mail, timeout(2000)).sendConfirmation(eq("a@b.com"), any());      // async, so wait with a timeout
    }
}`,
      ),
    ],
    [
      ['How do you make sure an email is sent only if the order commits?', 'Publish an event inside the transaction and handle it with @TransactionalEventListener(AFTER_COMMIT) so it runs only after a successful commit.'],
      ['Why put @Retryable on a different bean from the caller?', 'Retry is proxy-based, so calls within the same class bypass it.'],
    ],
  ),
];

export const hibernateScenario = [
  topic(
    'hb-ex-realworld-dashboard',
    'Real-World Scenario: Admin Reports Screen (Projections, Pagination, Bulk Update, Batch Insert)',
    [
      blk(`<h3>The scenario</h3>
• An admin screen lists <b>100,000 enrolments</b> with filters and totals, and a nightly job expires old enrolments. Loading full entities would exhaust memory and trigger N+1 queries. The Hibernate answer: <b>DTO projections</b>, <b>keyset or offset pagination</b>, <b>bulk JPQL updates</b> and <b>JDBC batching</b>.`,
        `public record EnrolmentRow(Long id, String student, String course, LocalDate enrolledOn, BigDecimal paid) {}

public interface EnrolmentRepository extends JpaRepository<Enrolment, Long> {
    @Query("""
        select new com.jsl.report.EnrolmentRow(e.id, s.name, c.title, e.enrolledOn, e.paid)
        from Enrolment e join e.student s join e.course c
        where (:course is null or c.id = :course) and e.enrolledOn >= :from
        order by e.enrolledOn desc, e.id desc
        """)
    Page<EnrolmentRow> report(Long course, LocalDate from, Pageable pageable);          // only the needed columns, paged in SQL

    @Query("select c.title as course, count(e) as total, sum(e.paid) as revenue from Enrolment e join e.course c group by c.title")
    List<CourseRevenue> revenueByCourse();                                                // interface projection for aggregates

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Enrolment e set e.status = 'EXPIRED' where e.status = 'ACTIVE' and e.expiresOn < :today")
    int expireOld(LocalDate today);                                                       // one UPDATE statement, no entities loaded
}`,
      ),
    ],
    [
      blk(`<h3>Importing in bulk</h3>
• Saving 50,000 entities one by one is slow and fills the persistence context. Use <b>JDBC batching</b>, <b>flush and clear every batch</b> and avoid <code>IDENTITY</code> ids (they disable insert batching): prefer a <b>sequence</b> with <code>allocationSize</code>.`,
        `# application.properties
spring.jpa.properties.hibernate.jdbc.batch_size=100
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

@Entity class Enrolment { @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "enrol_seq") @SequenceGenerator(name = "enrol_seq", sequenceName = "enrol_seq", allocationSize = 100) Long id; /* ... */ }

@Transactional
public void importAll(Iterable<Enrolment> rows) {
    int i = 0;
    for (Enrolment e : rows) {
        em.persist(e);
        if (++i % 100 == 0) { em.flush(); em.clear(); }          // keep the persistence context small
    }
}`,
      ),
    ],
    [
      blk(`<h3>Choosing the right tool</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Need</th><th>Use</th></tr>
<tr><td>Edit one aggregate</td><td>Entities + dirty checking</td></tr>
<tr><td>Read-only lists/reports</td><td>DTO or interface projections</td></tr>
<tr><td>Update many rows by rule</td><td>Bulk JPQL/SQL update (bypasses the persistence context: clear it)</td></tr>
<tr><td>Huge imports</td><td>Batch inserts or JDBC/COPY</td></tr>
<tr><td>Complex analytics</td><td>Native SQL / jOOQ / database views</td></tr>
</table>
• Watch for <b>pagination with collection fetch</b> (in-memory paging warning) and always add the <b>indexes</b> the filters need.`),
    ],
    [
      ['Why use DTO projections for report screens?', 'They fetch only needed columns without managed entities, reducing memory and avoiding lazy-loading problems.'],
      ['Why does IDENTITY prevent insert batching?', 'The database generates the id on each insert, so Hibernate must execute each insert immediately; sequences let it allocate ids in advance and batch.'],
    ],
  ),
];

export const microservicesScenario = [
  topic(
    'ms-ex-realworld-checkout',
    'Real-World Scenario: E-Commerce Checkout Across Services (Design Decisions)',
    [
      blk(`<h3>The scenario</h3>
• Checkout touches <b>Order</b>, <b>Inventory</b>, <b>Payment</b>, <b>Notification</b> and <b>Shipping</b> services, each with its own database. A customer clicks "Pay": what must be <b>synchronous</b> (the user waits) and what can be <b>asynchronous</b> (events)? A common answer: the API gateway calls <b>Order</b> synchronously (validate, create <code>PENDING</code> order, return 202 with an order id); the rest of the flow runs as an <b>orchestrated or choreographed saga</b> and the client <b>polls or receives a push</b> for the final status.`,
        `Client -> Gateway -> Order Service:  POST /orders (Idempotency-Key)  => 202 Accepted { orderId, status: PENDING }

Order Service      --OrderPlaced-->         Inventory Service  (reserve stock)
Inventory Service  --StockReserved-->       Payment Service    (charge)
Payment Service    --PaymentCaptured-->     Order Service      (mark CONFIRMED) --> Shipping, Notification
   failure paths (compensation):
Payment Service    --PaymentFailed-->       Inventory Service  (release stock) --> Order Service (mark CANCELLED)
Inventory Service  --StockUnavailable-->    Order Service      (mark CANCELLED, tell customer)`,
      ),
    ],
    [
      blk(`<h3>Key decisions and why</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Decision</th><th>Choice</th><th>Reason</th></tr>
<tr><td>Consistency</td><td>Saga with compensations</td><td>No distributed transactions across databases</td></tr>
<tr><td>Event reliability</td><td>Transactional outbox + idempotent consumers</td><td>At-least-once delivery without lost or duplicate effects</td></tr>
<tr><td>Double click on Pay</td><td><code>Idempotency-Key</code> header</td><td>Same request returns the same order</td></tr>
<tr><td>Payment gateway timeout</td><td>Query payment status before retrying</td><td>Avoid double charge</td></tr>
<tr><td>Read model for "My orders"</td><td>CQRS view fed by events</td><td>Fast queries without joining services</td></tr>
<tr><td>Slow downstream</td><td>Timeouts, circuit breaker, bulkheads</td><td>Protect checkout from a failing service</td></tr>
<tr><td>Tracing a failed order</td><td>Correlation id in every message and log</td><td>One id to follow the saga across services</td></tr>
</table>`),
    ],
    [
      blk(`<h3>Operating it</h3>
• <b>Observability</b>: distributed traces (OpenTelemetry), metrics (orders/minute, saga duration, DLQ size, outbox lag), structured logs with the order id. • <b>Failure drills</b>: kill payment-service mid-saga and verify compensation; replay a message twice and verify idempotency. • <b>Operations</b>: a dead-letter queue dashboard and a "stuck saga" job that times out PENDING orders after N minutes.`,
        `// stuck-saga watchdog
@Scheduled(fixedDelay = 60_000)
@Transactional
void cancelStuckOrders() {
    orders.findByStatusAndCreatedAtBefore(Status.PENDING, Instant.now().minus(Duration.ofMinutes(15)))
          .forEach(o -> { o.cancel("timed out"); outbox.add(new OrderCancelled(o.id(), "timeout")); });          // triggers compensation downstream
}

// propagate the correlation id
@Component class CorrelationFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws IOException, ServletException {
        String id = Optional.ofNullable(req.getHeader("X-Correlation-Id")).orElse(UUID.randomUUID().toString());
        MDC.put("correlationId", id); res.setHeader("X-Correlation-Id", id);
        try { chain.doFilter(req, res); } finally { MDC.clear(); }
    }
}`,
      ),
    ],
    [
      ['Why return 202 Accepted from checkout?', 'The multi-service saga completes asynchronously, so the API acknowledges the request and the client polls or is notified of the final status.'],
      ['How do you handle a payment timeout?', 'Do not blindly retry: query the payment provider for the transaction status (or use an idempotency key) so the customer is never charged twice.'],
    ],
  ),
];

import { javaFxExamples, springCoreExamples, hibernateExamples, microservicesExamples } from './RoadmapExamples1';
const withScenario = (mod: SubTopic[], extra: SubTopic['topics']): SubTopic[] => mod.map(m => ({ ...m, topics: [...m.topics, ...extra] }));

export const javaFxExamplesFull = withScenario(javaFxExamples, javaFxScenario);
export const springCoreExamplesFull = withScenario(springCoreExamples, springCoreScenario);
export const hibernateExamplesFull = withScenario(hibernateExamples, hibernateScenario);
export const microservicesExamplesFull = withScenario(microservicesExamples, microservicesScenario);
