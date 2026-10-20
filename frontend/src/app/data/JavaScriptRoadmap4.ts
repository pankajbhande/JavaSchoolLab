// JavaScript roadmap, part 4: phases 14-17 (TypeScript, React, Node.js and Express, advanced internals and performance).
import type { SubTopic } from './types';
import { blk, phase, topic } from './jsRoadmapKit';
import { jsExamples } from './RoadmapExamples2';

const jsRoadmap4Base: SubTopic[] = [
  phase(14, 'TypeScript', 'Essential for your chosen stack', [
    topic(
      'jsr-ts-basics',
      'TypeScript Basics: Types, Interfaces and Unions',
      [
        blk(`<h3>JavaScript with a type checker</h3>
• TypeScript adds <b>static types</b> to JavaScript. The compiler (<code>tsc</code>) finds mistakes before the code runs, then removes the types, leaving plain JavaScript.<br>
• Annotate with a colon: <code>let age: number</code>. Most types are <b>inferred</b>, so annotate function parameters and public APIs and let the rest infer.<br>
• Basic types: <code>string</code>, <code>number</code>, <code>boolean</code>, <code>null</code>, <code>undefined</code>, arrays <code>number[]</code>, tuples <code>[string, number]</code>, and <code>any</code> (turns checking off: avoid), <code>unknown</code> (safe "anything"), <code>never</code>.`,
          `let username: string = "Asha";
let scores: number[] = [90, 85];
let pair: [string, number] = ["age", 25];

function add(a: number, b: number): number {
  return a + b;
}
add(2, 3);
// add("2", 3);   // Error: Argument of type 'string' is not assignable to parameter of type 'number'

let value: unknown = JSON.parse('{"a":1}');
// value.a;                         // Error: 'value' is of type 'unknown'
if (typeof value === "object" && value !== null && "a" in value) console.log(value.a);`,
        ),
      ],
      [
        blk(`<h3>Interfaces, type aliases, unions and narrowing</h3>
• <code>interface</code> and <code>type</code> describe object shapes. Mark optional properties with <code>?</code> and immutable ones with <code>readonly</code>.<br>
• A <b>union</b> <code>string | number</code> allows several types; <b>literal types</b> (<code>"GET" | "POST"</code>) restrict values.<br>
• <b>Narrowing</b>: <code>typeof</code>, <code>instanceof</code>, <code>in</code> and equality checks make the compiler refine a union inside a branch.<br>
• A <b>discriminated union</b> (a shared <code>kind</code> field) gives exhaustive, safe <code>switch</code> statements.`,
          `interface User {
  readonly id: number;
  name: string;
  email?: string;               // optional
}
type Method = "GET" | "POST" | "DELETE";
type Id = string | number;

function describe(id: Id): string {
  return typeof id === "number" ? "#" + id.toFixed(0) : id.toUpperCase();   // narrowing
}

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "rect": return s.w * s.h;
    default: { const _exhaustive: never = s; return _exhaustive; }   // compile error if a case is missing
  }
}
console.log(area({ kind: "rect", w: 3, h: 4 }));   // 12`,
        ),
      ],
      [
        blk(`<h3>Strictness and the type system's limits</h3>
• Enable <code>"strict": true</code> in <code>tsconfig.json</code> (includes <code>strictNullChecks</code>, <code>noImplicitAny</code>). It is the single most valuable setting.<br>
• Types exist only at compile time. Data from the network, <code>localStorage</code> or <code>JSON.parse</code> is not checked at runtime: validate it (Zod, Valibot) and derive the type from the schema.<br>
• Avoid type assertions (<code>value as User</code>) and non-null assertions (<code>x!</code>) except where you know more than the compiler; they silence errors rather than fix them.<br>
• <code>enum</code> compiles to runtime code; many teams prefer union literals or <code>as const</code> objects.`,
          `import { z } from "zod";

const UserSchema = z.object({ id: z.number(), name: z.string(), email: z.string().email().optional() });
type User = z.infer<typeof UserSchema>;            // the type is DERIVED from the runtime schema

async function loadUser(id: number): Promise<User> {
  const res = await fetch("/api/users/" + id);
  return UserSchema.parse(await res.json());       // throws if the server sends something else
}

const ROLES = ["admin", "user"] as const;
type Role = typeof ROLES[number];                   // "admin" | "user"`,
        ),
      ],
      [
        ['What is the difference between any and unknown?', 'any disables type checking for that value. unknown accepts any value but forces you to narrow it (typeof, instanceof, schema validation) before using it, so it stays type-safe.'],
        ['interface vs type?', 'Both describe shapes. interface can be extended and merged (declaration merging) and suits object contracts; type can also express unions, tuples, mapped and conditional types.'],
        ['Does TypeScript check types at runtime?', 'No. Types are erased during compilation. Validate external data at runtime (Zod etc.) to get safety at the boundaries.'],
      ],
    ),
    topic(
      'jsr-ts-generics',
      'Generics, Utility Types and Type Guards',
      [
        blk(`<h3>Generics: reusable typed code</h3>
• A generic is a type parameter: <code>function first&lt;T&gt;(items: T[]): T | undefined</code>. The caller's type flows through, so you avoid <code>any</code> and duplication.<br>
• Constrain with <code>extends</code>: <code>&lt;T extends { id: number }&gt;</code>.<br>
• Generic interfaces describe containers such as <code>ApiResponse&lt;T&gt;</code>, <code>Promise&lt;T&gt;</code> and <code>Array&lt;T&gt;</code>.`,
          `function first<T>(items: T[]): T | undefined {
  return items[0];
}
const n = first([1, 2, 3]);          // number | undefined
const s = first(["a", "b"]);         // string | undefined

interface ApiResponse<T> { data: T; status: number; }
async function get<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url);
  return { data: await res.json() as T, status: res.status };
}
const users = await get<{ id: number; name: string }[]>("/api/users");
console.log(users.data[0].name);

function byId<T extends { id: number }>(list: T[], id: number): T | undefined {
  return list.find(x => x.id === id);
}`,
        ),
      ],
      [
        blk(`<h3>Built-in utility types</h3>
• <code>Partial&lt;T&gt;</code> (all optional), <code>Required&lt;T&gt;</code>, <code>Readonly&lt;T&gt;</code>, <code>Pick&lt;T, K&gt;</code>, <code>Omit&lt;T, K&gt;</code>, <code>Record&lt;K, V&gt;</code>, <code>ReturnType&lt;F&gt;</code>, <code>Awaited&lt;T&gt;</code>.<br>
• Use them to derive related types instead of copy-pasting: a "create" payload is <code>Omit&lt;User, "id"&gt;</code>; a patch is <code>Partial&lt;User&gt;</code>.<br>
• <b>Mapped</b> and <b>conditional</b> types build new types from old ones (<code>keyof T</code>, <code>T[K]</code>, <code>T extends U ? X : Y</code>).`,
          `interface User { id: number; name: string; email: string; role: "admin" | "user"; }

type CreateUser = Omit<User, "id">;                 // no id yet
type UpdateUser = Partial<Omit<User, "id">>;        // any subset of the rest
type UserPreview = Pick<User, "id" | "name">;
type UsersById = Record<number, User>;

function patch(id: number, changes: UpdateUser) { /* ... */ }
patch(1, { name: "Asha K" });
// patch(1, { id: 5 });   // Error: 'id' does not exist in type UpdateUser

type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };
type UserGetters = Getters<Pick<User, "name">>;     // { getName: () => string }`,
        ),
      ],
      [
        blk(`<h3>Type guards and declaration files</h3>
• A <b>type guard</b> is a function returning <code>value is Type</code>; after it returns true, the compiler narrows the type.<br>
• <code>satisfies</code> checks a value against a type without widening it.<br>
• Libraries without types ship or need <b>declaration files</b> (<code>.d.ts</code>, <code>@types/xyz</code>). Declare your own with <code>declare module</code>.<br>
• Prefer <code>unknown</code> in <code>catch</code> blocks (<code>useUnknownInCatchVariables</code>) and narrow with <code>instanceof Error</code>.`,
          `interface Cat { meow(): void }
interface Dog { bark(): void }

function isCat(pet: Cat | Dog): pet is Cat {
  return (pet as Cat).meow !== undefined;
}
function speak(pet: Cat | Dog) {
  if (isCat(pet)) pet.meow(); else pet.bark();      // narrowed in both branches
}

const palette = { red: [255, 0, 0], green: "#00ff00" } satisfies Record<string, string | number[]>;
palette.red.map(c => c / 2);                         // still known to be number[]

try { riskyCall(); }
catch (err: unknown) {
  console.log(err instanceof Error ? err.message : String(err));
}`,
        ),
      ],
      [
        ['What are generics?', 'Type parameters that let a function, class or interface work with many types while keeping type information (function first<T>(a: T[]): T).'],
        ['What do Partial, Pick and Omit do?', 'Partial makes all properties optional, Pick selects some properties, Omit removes some. They derive new types from existing ones so you do not duplicate definitions.'],
        ['What is a type guard?', 'A runtime check (typeof, instanceof, in, or a function returning "x is T") that tells the compiler to narrow a union to a specific type inside a branch.'],
      ],
    ),
    topic(
      'jsr-ts-tooling',
      'TypeScript Tooling: tsconfig, Build and React',
      [
        blk(`<h3>Project setup</h3>
• <code>npm i -D typescript</code> then <code>npx tsc --init</code> creates <code>tsconfig.json</code>. Key options: <code>target</code>, <code>module</code>, <code>strict</code>, <code>outDir</code>, <code>rootDir</code>, <code>noUncheckedIndexedAccess</code>.<br>
• <code>tsc --noEmit</code> type-checks only; modern bundlers (Vite, esbuild) strip types without checking, so run <code>tsc --noEmit</code> in CI as the type gate.<br>
• Use <code>.ts</code> for logic and <code>.tsx</code> for files with JSX.`,
          `// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}

// package.json scripts
// "typecheck": "tsc --noEmit",
// "build": "tsc --noEmit && vite build"`,
        ),
      ],
      [
        blk(`<h3>Typing React components and events</h3>
• Type props with an interface; <code>React.ReactNode</code> for children; <code>useState&lt;User | null&gt;(null)</code> to give state a union type.<br>
• Event types: <code>React.ChangeEvent&lt;HTMLInputElement&gt;</code>, <code>React.FormEvent</code>, <code>React.MouseEvent</code>.<br>
• Generic components (<code>function List&lt;T&gt;(props: { items: T[]; render: (item: T) =&gt; ReactNode })</code>) keep type safety across reusable pieces.`,
          `import { useState, type ReactNode } from "react";

interface ButtonProps {
  label: string;
  variant?: "primary" | "danger";
  onClick: () => void;
}
export function Button({ label, variant = "primary", onClick }: ButtonProps) {
  return <button className={variant} onClick={onClick}>{label}</button>;
}

export function Search({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <input
      value={q}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setQ(e.target.value); onSearch(e.target.value); }}
    />
  );
}

export function List<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) {
  return <ul>{items.map((it, i) => <li key={i}>{render(it)}</li>)}</ul>;
}`,
        ),
      ],
      [
        blk(`<h3>Migrating a JavaScript project</h3>
• Migrate gradually: add <code>"allowJs": true</code> and <code>"checkJs": false</code>, rename files one by one to <code>.ts</code>, fix errors, then turn on <code>strict</code> options one at a time.<br>
• Start with the types of your domain objects and API responses; the rest follows through inference.<br>
• Use ESLint with <code>typescript-eslint</code> for rules the compiler does not cover (floating promises, unsafe any).<br>
• Share types between front end and back end by generating them from an OpenAPI spec (for a Spring Boot API: springdoc plus <code>openapi-typescript</code>).`,
          `// Generated from the Spring Boot OpenAPI document:
//   npx openapi-typescript http://localhost:3001/v3/api-docs -o src/api/schema.d.ts
import type { components } from "./api/schema";
type Task = components["schemas"]["TaskResponse"];

async function listTasks(): Promise<Task[]> {
  const res = await fetch("/api/tasks");
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

// eslint config highlights (typescript-eslint)
// "@typescript-eslint/no-floating-promises": "error",
// "@typescript-eslint/no-explicit-any": "warn"`,
        ),
      ],
      [
        ['Why run tsc --noEmit if Vite already builds the project?', 'Vite/esbuild only strip types and do not type-check. tsc --noEmit is the step that actually reports type errors, so it belongs in CI and in the build script.'],
        ['What does strict mode enable?', 'A group of checks including strictNullChecks, noImplicitAny, strictFunctionTypes and strictPropertyInitialization, catching the most common bugs such as null/undefined access.'],
        ['How do you get types for a library with no types?', 'Install @types/<name> from DefinitelyTyped, or write a declaration file (declare module "lib";) with the parts you use.'],
      ],
    ),
  ]),

  phase(15, 'React', 'Essential for your chosen stack', [
    topic(
      'jsr-react-components',
      'React Components, Props and State',
      [
        blk(`<h3>Thinking in components</h3>
• React builds the UI from <b>components</b>: functions that take <b>props</b> (inputs) and return <b>JSX</b> (a description of the UI).<br>
• The UI is a function of state: when state changes, React re-renders the component and updates only the changed DOM.<br>
• JSX rules: one root element (or a fragment <code>&lt;&gt;...&lt;/&gt;</code>), <code>className</code> instead of <code>class</code>, <code>{ }</code> to embed JavaScript, camelCase event props like <code>onClick</code>.`,
          `function Greeting({ name, age }) {
  return (
    <div className="card">
      <h2>Hello, {name}!</h2>
      {age >= 18 ? <p>Adult</p> : <p>Minor</p>}
    </div>
  );
}
export default function App() {
  const people = [{ id: 1, name: "Asha", age: 25 }, { id: 2, name: "Ravi", age: 16 }];
  return (
    <>
      {people.map(p => <Greeting key={p.id} name={p.name} age={p.age} />)}
    </>
  );
}`,
        ),
      ],
      [
        blk(`<h3>State with useState</h3>
• <code>const [value, setValue] = useState(initial)</code> keeps a value between renders. Calling the setter schedules a re-render.<br>
• <b>Never mutate state</b>: create a new array/object (<code>[...items, item]</code>, <code>{...user, name}</code>) so React sees the change.<br>
• When the new state depends on the old, use the functional form: <code>setCount(c => c + 1)</code>.<br>
• <b>Lift state up</b> to the nearest common parent when two components need the same data; pass it down as props and pass callbacks to change it.`,
          `import { useState } from "react";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  const add = e => {
    e.preventDefault();
    if (!text.trim()) return;
    setTodos(prev => [...prev, { id: crypto.randomUUID(), text, done: false }]);
    setText("");
  };
  const toggle = id => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  return (
    <form onSubmit={add}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="New task" />
      <button>Add</button>
      <ul>
        {todos.map(t => (
          <li key={t.id} style={{ textDecoration: t.done ? "line-through" : "none" }} onClick={() => toggle(t.id)}>
            {t.text}
          </li>
        ))}
      </ul>
    </form>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Rendering rules and keys</h3>
• Components must be <b>pure</b> during render: no mutation of props/state, no network calls. Side effects belong in event handlers and <code>useEffect</code>.<br>
• <b>Keys</b> identify list items between renders. Use stable ids, not array indexes, when the list can reorder, insert or delete; otherwise state sticks to the wrong row.<br>
• State updates are <b>batched</b> and asynchronous: reading the state right after <code>setX</code> still gives the old value in that render.<br>
• Changing a component's <code>key</code> resets its state, a handy trick to reinitialise a form.`,
          `function Counter() {
  const [count, setCount] = useState(0);
  const triple = () => {
    setCount(count + 1);      // all three use the SAME old count -> ends at 1
    setCount(count + 1);
    setCount(count + 1);
  };
  const tripleOk = () => {
    setCount(c => c + 1);     // each sees the latest value -> ends at 3
    setCount(c => c + 1);
    setCount(c => c + 1);
  };
  console.log("render with", count);
  return <button onClick={tripleOk}>Count {count}</button>;
}

// Bad: index keys on a reorderable list make inputs keep the wrong text
// items.map((item, i) => <Row key={i} item={item} />)
// Good:
// items.map(item => <Row key={item.id} item={item} />)`,
        ),
      ],
      [
        ['What are props and state?', 'Props are read-only inputs passed from a parent. State is data owned by a component that can change over time and triggers a re-render when updated.'],
        ['Why do lists need keys?', 'Keys let React match items between renders so it can reorder, add and remove DOM nodes correctly and preserve each item\'s state. Use stable unique ids, not indexes, for dynamic lists.'],
        ['Why use setCount(c => c + 1)?', 'Because state updates are batched and the closure holds the old value; the functional form always receives the latest state, so multiple updates accumulate correctly.'],
      ],
    ),
    topic(
      'jsr-react-hooks',
      'Hooks: useEffect, useMemo, useRef and Custom Hooks',
      [
        blk(`<h3>useEffect: synchronising with the outside world</h3>
• <code>useEffect(fn, deps)</code> runs <b>after render</b>. With <code>[]</code> it runs once after mount; with <code>[a, b]</code> it re-runs when <code>a</code> or <code>b</code> change; with no array it runs after every render.<br>
• Return a <b>cleanup</b> function to remove listeners, clear timers or abort requests; it runs before the next effect and on unmount.<br>
• Typical uses: fetching data, subscriptions, timers, document title. Do <em>not</em> use effects to compute values from props/state: compute them during render.`,
          `import { useEffect, useState } from "react";

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);          // cleanup on unmount
  }, []);
  return <p>{now.toLocaleTimeString()}</p>;
}

function UserProfile({ id }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/users/" + id, { signal: controller.signal })
      .then(r => r.json()).then(setUser)
      .catch(e => { if (e.name !== "AbortError") console.error(e); });
    return () => controller.abort();         // ignore stale responses when id changes
  }, [id]);
  return user ? <h2>{user.name}</h2> : <p>Loading...</p>;
}`,
        ),
      ],
      [
        blk(`<h3>useRef, useMemo and useCallback</h3>
• <code>useRef</code> holds a mutable value that does <b>not</b> trigger re-renders and gives access to DOM nodes (<code>ref.current</code>), e.g. focusing an input or storing the latest callback.<br>
• <code>useMemo(() =&gt; expensive(a), [a])</code> caches a computed value; <code>useCallback(fn, deps)</code> caches a function so memoised children (<code>React.memo</code>) do not re-render needlessly.<br>
• Measure before optimising: memoisation has its own cost and most renders are cheap.<br>
• <code>useReducer</code> manages complex state transitions; <code>useContext</code> shares values (theme, user) without prop drilling.`,
          `import { useRef, useMemo, useReducer, createContext, useContext } from "react";

function SearchBox({ items }) {
  const inputRef = useRef(null);
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => items.filter(i => i.toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );
  return (
    <>
      <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} />
      <button onClick={() => { setQ(""); inputRef.current.focus(); }}>Clear</button>
      <p>{filtered.length} results</p>
    </>
  );
}

function reducer(state, action) {
  switch (action.type) {
    case "add": return [...state, action.item];
    case "remove": return state.filter(x => x.id !== action.id);
    default: return state;
  }
}
const ThemeContext = createContext("light");
const useTheme = () => useContext(ThemeContext);`,
        ),
      ],
      [
        blk(`<h3>Custom hooks and the rules of hooks</h3>
• A <b>custom hook</b> is a function starting with <code>use</code> that calls other hooks. It extracts reusable stateful logic (data fetching, form handling, local storage, debouncing).<br>
• <b>Rules</b>: call hooks only at the top level of components/hooks (not in loops, conditions or nested functions) and only from React functions. The linter plugin <code>eslint-plugin-react-hooks</code> enforces them and checks dependency arrays.<br>
• <b>Stale closures</b>: an effect or callback keeps the values from the render it was created in. List every reactive value in the dependency array or use the functional setter / a ref.<br>
• In development <b>StrictMode</b> mounts effects twice to expose missing cleanup. That is intentional.`,
          `function useFetch(url) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: null, loading: true });
    fetch(url, { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(data => setState({ data, error: null, loading: false }))
      .catch(error => { if (error.name !== "AbortError") setState({ data: null, error, loading: false }); });
    return () => controller.abort();
  }, [url]);
  return state;
}

function Tasks() {
  const { data, error, loading } = useFetch("/api/tasks");
  if (loading) return <p>Loading...</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return <ul>{data.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id); }, [value, ms]);
  return v;
}`,
        ),
      ],
      [
        ['What does the dependency array of useEffect do?', 'It lists the reactive values the effect uses. React re-runs the effect when any of them changes ([] means only after mount). Missing dependencies cause stale values.'],
        ['useMemo vs useCallback?', 'useMemo caches the result of a computation; useCallback caches a function definition (equivalent to useMemo(() => fn, deps)). Both only help when referential equality or expensive work matters.'],
        ['Why are hooks not allowed inside conditions?', 'React identifies each hook by its call order on every render. Conditional calls change the order and corrupt the state mapping.'],
      ],
    ),
    topic(
      'jsr-react-patterns',
      'React in Practice: Data Fetching, Routing, Forms and Performance',
      [
        blk(`<h3>Routing and forms</h3>
• Single-page apps use a client-side router (React Router): <code>&lt;Routes&gt;</code>, <code>&lt;Route path="/users/:id"&gt;</code>, <code>useParams</code>, <code>useNavigate</code>, <code>&lt;Link&gt;</code> (never a plain <code>&lt;a href&gt;</code> for internal links).<br>
• <b>Controlled inputs</b> keep their value in state; <b>uncontrolled</b> inputs use refs/<code>FormData</code>. Libraries (React Hook Form with Zod) reduce boilerplate and handle validation and errors.`,
          `import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";

function UserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <>
      <h1>User {id}</h1>
      <button onClick={() => navigate("/")}>Back</button>
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <nav><Link to="/">Home</Link> | <Link to="/users/7">User 7</Link></nav>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/users/:id" element={<UserPage />} />
        <Route path="*" element={<h1>Not found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Server state and global state</h3>
• <b>Server state</b> (data owned by the API) is best handled by <b>TanStack Query</b> or SWR: caching, request de-duplication, background refresh, retries, loading/error states and mutations with cache invalidation.<br>
• <b>Client state</b>: keep it local when possible; lift it up when shared; use Context for rarely changing values (theme, auth user); use Zustand or Redux Toolkit for large, frequently updated shared state.<br>
• Avoid duplicating server data into <code>useState</code>; derive what you can during render.`,
          `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function Tasks() {
  const qc = useQueryClient();
  const { data, isPending, error } = useQuery({
    queryKey: ["tasks"],
    queryFn: () => fetch("/api/tasks").then(r => r.json()),
    staleTime: 30_000,
  });
  const add = useMutation({
    mutationFn: title => fetch("/api/tasks", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),   // refetch the list
  });
  if (isPending) return <p>Loading...</p>;
  if (error) return <p role="alert">{error.message}</p>;
  return (
    <>
      <button onClick={() => add.mutate("New task")}>Add</button>
      <ul>{data.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </>
  );
}`,
        ),
      ],
      [
        blk(`<h3>Performance and architecture</h3>
• Re-renders are normal and cheap. Fix <em>measured</em> problems with the React DevTools Profiler: <code>React.memo</code>, <code>useMemo</code>/<code>useCallback</code>, list virtualisation (react-window) and moving state closer to where it is used.<br>
• <b>Code-split</b> routes with <code>React.lazy</code> and <code>&lt;Suspense&gt;</code> so users download only what they open.<br>
• <b>Error boundaries</b> catch render errors in a subtree and show a fallback instead of a blank page.<br>
• Structure by feature (<code>features/tasks/{components,hooks,api}</code>), keep components small and test them with Testing Library.`,
          `import { lazy, Suspense, Component } from "react";

const Reports = lazy(() => import("./Reports"));      // separate chunk, loaded on first visit

class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error(error, info.componentStack); }
  render() {
    return this.state.error ? <p role="alert">Something went wrong.</p> : this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<p>Loading...</p>}>
        <Reports />
      </Suspense>
    </ErrorBoundary>
  );
}

const Row = React.memo(function Row({ item, onSelect }) { /* re-renders only when item/onSelect change */ });`,
        ),
      ],
      [
        ['Controlled vs uncontrolled components?', 'A controlled input\'s value lives in React state and is set through the value prop with an onChange handler. An uncontrolled input keeps its own DOM state and you read it through a ref or FormData.'],
        ['Why use a library like TanStack Query for API data?', 'It provides caching, de-duplication, background refetching, retries, loading and error states and cache invalidation after mutations, which you would otherwise rebuild by hand with useEffect.'],
        ['What is code splitting in React?', 'Loading parts of the app on demand with React.lazy and dynamic import(), wrapped in Suspense, so the initial bundle stays small.'],
      ],
    ),
  ]),

  phase(16, 'Node.js and Express', 'Optional with Spring Boot', [
    topic(
      'jsr-node-basics',
      'Node.js Basics: Runtime, Modules, Files and Streams',
      [
        blk(`<h3>JavaScript outside the browser</h3>
• Node.js runs JavaScript on the V8 engine with a non-blocking, event-driven I/O model (libuv). It has no DOM or <code>window</code>, but offers <code>fs</code>, <code>path</code>, <code>http</code>, <code>os</code>, <code>crypto</code>, <code>process</code>.<br>
• <code>npm</code> installs packages (<code>package.json</code>, <code>package-lock.json</code>, <code>node_modules</code>). Use <code>"type": "module"</code> for ES modules.<br>
• Command-line arguments: <code>process.argv</code>; environment variables: <code>process.env</code>.`,
          `// app.mjs   run with:  node app.mjs --name Asha
import path from "node:path";
import os from "node:os";

const name = process.argv[2] === "--name" ? process.argv[3] : "world";
console.log("Hello, " + name);
console.log("Node", process.version, "on", os.platform());
console.log(path.join("data", "users", "list.json"));      // data/users/list.json
console.log("PORT =", process.env.PORT ?? 3000);

process.on("SIGINT", () => { console.log("shutting down"); process.exit(0); });`,
        ),
      ],
      [
        blk(`<h3>Files, async I/O and JSON</h3>
• Prefer the promise API: <code>import { readFile, writeFile } from "node:fs/promises"</code>. Avoid the <code>...Sync</code> versions in servers because they block the event loop.<br>
• Always pass an encoding (<code>"utf8"</code>) to get a string rather than a Buffer; resolve paths relative to the module with <code>import.meta.url</code>.<br>
• Read configuration from environment variables (and a <code>.env</code> file during development with <code>--env-file</code> or dotenv), never hard-code secrets.`,
          `import { readFile, writeFile, mkdir } from "node:fs/promises";

const file = new URL("./data/tasks.json", import.meta.url);
await mkdir(new URL("./data/", import.meta.url), { recursive: true });

async function loadTasks() {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (err) {
    if (err.code === "ENOENT") return [];          // first run: no file yet
    throw err;
  }
}
const tasks = await loadTasks();
tasks.push({ id: tasks.length + 1, title: "Learn Node", done: false });
await writeFile(file, JSON.stringify(tasks, null, 2));
console.log("saved", tasks.length, "tasks");`,
        ),
      ],
      [
        blk(`<h3>Streams, events and worker threads</h3>
• <b>Streams</b> process data in chunks, so a 5 GB file never has to fit in memory. Connect them with <code>pipeline</code> (it handles errors and cleanup).<br>
• Many Node objects are <code>EventEmitter</code>s: <code>emitter.on("event", handler)</code>, <code>emit</code>.<br>
• CPU-heavy work blocks the single JS thread: use <code>worker_threads</code>, a job queue, or run it in another service. Scale across cores with the <code>cluster</code> module or a process manager (PM2) and a load balancer.`,
          `import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { EventEmitter } from "node:events";

await pipeline(
  createReadStream("access.log"),        // read in chunks
  createGzip(),                          // compress each chunk
  createWriteStream("access.log.gz"),    // write as they arrive
);
console.log("compressed without loading the file into memory");

const orders = new EventEmitter();
orders.on("created", order => console.log("send email for", order.id));
orders.emit("created", { id: 42 });`,
        ),
      ],
      [
        ['Why is Node.js good for I/O-heavy apps?', 'Its non-blocking, event-driven model lets one thread serve many concurrent connections while waiting for I/O, with low memory per connection.'],
        ['Why avoid fs.readFileSync in a server?', 'Synchronous calls block the event loop, freezing every other request until the file is read. Use the async or promise-based API.'],
        ['What is a stream?', 'An abstraction for processing data piece by piece (read, write, transform), allowing large files or network data to be handled with constant memory and backpressure.'],
      ],
    ),
    topic(
      'jsr-express-rest',
      'Express: Routing, Middleware and a REST API',
      [
        blk(`<h3>A minimal server</h3>
• <b>Express</b> is a small web framework on top of Node's <code>http</code> module. A route maps a method and path to a handler <code>(req, res)</code>.<br>
• Parse JSON bodies with <code>express.json()</code>. Read <code>req.params</code> (path), <code>req.query</code> (query string), <code>req.body</code>; reply with <code>res.json()</code> and <code>res.status()</code>.`,
          `import express from "express";

const app = express();
app.use(express.json());                      // parse JSON request bodies

const tasks = [{ id: 1, title: "Learn Express", done: false }];

app.get("/api/tasks", (req, res) => res.json(tasks));

app.get("/api/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const { title } = req.body;
  if (typeof title !== "string" || !title.trim()) return res.status(400).json({ message: "title is required" });
  const task = { id: tasks.length + 1, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).location("/api/tasks/" + task.id).json(task);
});

app.listen(3000, () => console.log("API on http://localhost:3000"));`,
        ),
      ],
      [
        blk(`<h3>Middleware</h3>
• Middleware are functions <code>(req, res, next)</code> that run in order: logging, authentication, validation, CORS, rate limiting, compression. Call <code>next()</code> to continue, or send a response to stop.<br>
• An <b>error-handling middleware</b> has four parameters <code>(err, req, res, next)</code> and goes last. In Express 5 rejected promises from async handlers reach it automatically; in Express 4 wrap handlers or call <code>next(err)</code>.<br>
• Useful packages: <code>helmet</code> (security headers), <code>cors</code>, <code>morgan</code> (logs), <code>express-rate-limit</code>.`,
          `import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

app.use(helmet());
app.use(cors({ origin: "https://app.example.com", credentials: true }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 100 }));

app.use((req, res, next) => {                 // custom request logger
  const start = Date.now();
  res.on("finish", () => console.log(req.method, req.originalUrl, res.statusCode, Date.now() - start + "ms"));
  next();
});

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Missing token" });
  try { req.user = verify(token); next(); }
  catch { res.status(401).json({ message: "Invalid token" }); }
}
app.delete("/api/tasks/:id", requireAuth, (req, res) => res.sendStatus(204));

app.use((err, req, res, next) => {            // must be last
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.status ? err.message : "Internal Server Error" });
});`,
        ),
      ],
      [
        blk(`<h3>Structure, database and production</h3>
• Layer the code: <b>routes</b> (HTTP) → <b>controllers</b>/<b>services</b> (business logic) → <b>repositories</b> (database). Validate input with Zod/Joi at the edge.<br>
• Use a real database with a driver or ORM (<code>mysql2</code>, Prisma) and <b>parameterised queries</b> to prevent SQL injection.<br>
• Production: set <code>NODE_ENV=production</code>, run behind a reverse proxy (nginx) with HTTPS, handle <code>SIGTERM</code> for graceful shutdown, log structured JSON, add health endpoints.<br>
• <b>Node vs Spring Boot</b>: Node/Express is quick to start and shares language and types with the front end; Spring Boot gives a mature ecosystem, strong typing, transactions and multi-threaded CPU work. If your team already uses Spring Boot, keep Node for tooling, BFF layers or real-time features.`,
          `import mysql from "mysql2/promise";
const pool = mysql.createPool({ host: process.env.DB_HOST, user: process.env.DB_USER, password: process.env.DB_PASS, database: "shop" });

app.get("/api/users", async (req, res) => {
  const email = req.query.email;
  // SAFE: the driver sends the value separately from the SQL text
  const [rows] = await pool.execute("SELECT id, name FROM users WHERE email = ?", [email]);
  res.json(rows);
});
// UNSAFE (never): pool.query("SELECT * FROM users WHERE email = '" + email + "'")

const server = app.listen(process.env.PORT ?? 3000);
process.on("SIGTERM", () => {                  // graceful shutdown (containers, Kubernetes)
  server.close(() => pool.end().then(() => process.exit(0)));
});
app.get("/health", (req, res) => res.json({ status: "UP" }));`,
        ),
      ],
      [
        ['What is middleware in Express?', 'A function (req, res, next) in the request pipeline. It can read or change the request/response, end the cycle or pass control on with next(). Order matters.'],
        ['How do you prevent SQL injection in Node?', 'Use parameterised queries or prepared statements (placeholders) so user input is never concatenated into the SQL string; validate input as a second layer.'],
        ['When would you choose Node/Express over Spring Boot?', 'For lightweight APIs, backend-for-frontend layers, real-time features (WebSockets) and when sharing code/types with a JavaScript front end matters. Spring Boot suits large, transactional, enterprise back ends.'],
      ],
    ),
  ]),

  phase(17, 'Advanced Internals and Performance', 'Advanced', [
    topic(
      'jsr-v8-internals',
      'Inside the Engine: V8, JIT, Hidden Classes and Garbage Collection',
      [
        blk(`<h3>How JavaScript actually runs</h3>
• Engines (V8, SpiderMonkey, JavaScriptCore) parse source into an <b>AST</b>, compile to <b>bytecode</b> and start interpreting immediately (Ignition in V8).<br>
• Hot code is optimised to machine code by the <b>JIT compiler</b> (TurboFan) using type feedback from earlier runs. If an assumption breaks (a variable suddenly changes type) the code <b>deoptimises</b> back to bytecode.<br>
• Practical meaning: write code with <b>stable types and shapes</b> and the engine makes it fast.`,
          `// Monomorphic (fast): add() always sees numbers
function add(a, b) { return a + b; }
for (let i = 0; i < 1e6; i++) add(i, 1);

// Polymorphic (slower): the same function sees numbers, strings, objects
add(1, 2); add("a", "b"); add({}, []);

// Observe the JIT in Node:  node --trace-opt --trace-deopt app.js`,
        ),
      ],
      [
        blk(`<h3>Hidden classes and inline caches</h3>
• V8 gives objects a <b>hidden class</b> (shape) describing their properties. Objects created with the same properties in the same order share a shape, so property access becomes a fast fixed-offset read cached at the call site (<b>inline cache</b>).<br>
• Keep shapes consistent: initialise all properties in the constructor in the same order; do not add or <code>delete</code> properties later (<code>delete</code> can switch an object to slow dictionary mode); do not mix property order between objects.<br>
• Arrays are fastest when homogeneous (all small integers, all doubles, all objects) and dense (no holes).`,
          `class Point {
  constructor(x, y) { this.x = x; this.y = y; }   // always x then y: one shared shape
}
const fast = [new Point(1, 2), new Point(3, 4)];

const a = { x: 1, y: 2 };
const b = { y: 2, x: 1 };      // same keys, different order -> DIFFERENT shape
const c = { x: 1 }; c.y = 2; c.z = 3;     // added later -> shape transitions

const user = { id: 1, tmp: true };
delete user.tmp;               // can make the object slow; prefer user.tmp = undefined or build a new object

const dense  = [1, 2, 3, 4];             // PACKED_SMI_ELEMENTS (fastest)
const mixed  = [1, "two", {}];           // PACKED_ELEMENTS
const holey  = new Array(5);             // HOLEY: avoid, fill with Array.from or push`,
        ),
      ],
      [
        blk(`<h3>Garbage collection</h3>
• V8's collector is <b>generational</b>: new objects live in a small "young generation" that is cleaned quickly and often (scavenge); survivors move to the "old generation" cleaned by a mark-and-compact collector, largely concurrent and incremental to avoid long pauses.<br>
• An object is collected when it is <b>unreachable</b> from the roots (global object, stack, active closures). You cannot free memory by hand; you remove references.<br>
• Reduce GC pressure: avoid allocating inside hot loops, reuse buffers/objects (object pools) for tight loops, and prefer typed arrays for numeric data.<br>
• <b>WeakRef</b> and <b>FinalizationRegistry</b> exist but are non-deterministic: never rely on them for correctness.`,
          `// Allocating in a hot loop creates garbage every iteration
function slow(points) {
  return points.map(p => ({ x: p.x * 2, y: p.y * 2 }));      // new object per point
}
// Reusing a typed array: one allocation, no per-item objects
function fast(xs) {
  const out = new Float64Array(xs.length);
  for (let i = 0; i < xs.length; i++) out[i] = xs[i] * 2;
  return out;
}
const cache = new WeakMap();   // entries vanish when the key object is collected
console.log(process.memoryUsage().heapUsed);   // Node: watch heap growth`,
        ),
      ],
      [
        ['What is JIT compilation?', 'Just-in-time compilation: the engine starts with an interpreter, profiles running code and compiles hot paths to optimised machine code at runtime, deoptimising if its type assumptions fail.'],
        ['What are hidden classes?', 'Internal shapes V8 assigns to objects with the same property layout, letting property access be a fast cached offset lookup. Consistent property order and no deletes keep objects on the fast path.'],
        ['How does garbage collection decide what to free?', 'It marks everything reachable from the roots (stack, globals, closures) and frees what is not. Generational collection cleans short-lived objects quickly and long-lived ones less often.'],
      ],
    ),
    topic(
      'jsr-memory-leaks',
      'Memory Leaks: Finding and Fixing Them',
      [
        blk(`<h3>What a leak is in a garbage-collected language</h3>
• A leak is memory you no longer need but that is still <b>reachable</b>, so the collector cannot free it. Symptoms: the tab or process grows over time, slows down and eventually crashes.<br>
• Common causes: forgotten timers and listeners, global variables and caches that never shrink, detached DOM nodes still referenced from JavaScript, closures capturing large objects.`,
          `// 1. Timer never cleared; the closure keeps "bigData" alive forever
function startPolling() {
  const bigData = new Array(1e6).fill("x");
  setInterval(() => console.log(bigData.length), 1000);     // no clearInterval anywhere
}

// 2. Listener never removed
function mount() {
  window.addEventListener("resize", () => draw(hugeCanvas));  // anonymous: cannot be removed
}

// 3. Unbounded cache
const cache = {};
function lookup(key) { return cache[key] ??= expensive(key); }  // grows forever`,
        ),
      ],
      [
        blk(`<h3>Fixes</h3>
• <b>Clean up</b>: <code>clearInterval</code>, <code>removeEventListener</code> (keep the function reference) or <code>AbortController</code> signals; do it in <code>useEffect</code> cleanup or <code>disconnectedCallback</code>.<br>
• <b>Bound caches</b>: use an LRU with a max size, or <code>WeakMap</code>/<code>WeakRef</code> keyed by objects.<br>
• Drop references to DOM nodes you removed; avoid storing elements in global arrays.<br>
• Scope variables narrowly so closures capture only what they need.`,
          `function startPolling() {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);              // caller can stop it
}

class Widget {
  #controller = new AbortController();
  mount() {
    window.addEventListener("resize", () => this.draw(), { signal: this.#controller.signal });
    window.addEventListener("scroll", () => this.draw(), { signal: this.#controller.signal });
  }
  destroy() { this.#controller.abort(); }      // removes every listener at once
}

class LRU {
  constructor(max = 100) { this.max = max; this.map = new Map(); }
  get(k) { if (!this.map.has(k)) return undefined; const v = this.map.get(k); this.map.delete(k); this.map.set(k, v); return v; }
  set(k, v) { this.map.delete(k); this.map.set(k, v); if (this.map.size > this.max) this.map.delete(this.map.keys().next().value); }
}`,
        ),
      ],
      [
        blk(`<h3>Finding a leak with DevTools</h3>
• Open <b>Memory</b> → take a <b>heap snapshot</b>, perform the suspect action several times, take another snapshot and compare ("Objects allocated between snapshots"). Look at <b>Detached</b> DOM trees and the retainers path to see what holds an object.<br>
• The <b>Performance</b> tab with the Memory option shows the JS heap sawtooth: if the baseline after each GC keeps rising, you leak.<br>
• Node: <code>node --inspect</code> and the same DevTools, or <code>process.memoryUsage()</code> and heap dumps (<code>v8.writeHeapSnapshot()</code>).<br>
• Reproduce, fix, re-measure. Add a regression check for long-running pages.`,
          `// Quick memory sampling in a script
setInterval(() => {
  const { heapUsed } = process.memoryUsage();
  console.log("heap MB:", (heapUsed / 1048576).toFixed(1));
}, 5000);

// Heap dump from code (Node)
import v8 from "node:v8";
process.on("SIGUSR2", () => console.log("snapshot:", v8.writeHeapSnapshot()));

// Browser: simulate GC and check detached nodes in DevTools
// 1. Memory tab -> Collect garbage (trash icon)
// 2. Snapshot, click the suspect UI 10 times, Collect garbage, Snapshot
// 3. Filter by "Detached" and inspect Retainers`,
        ),
      ],
      [
        ['What causes memory leaks in JavaScript?', 'Unremoved event listeners and timers, unbounded global caches, references to detached DOM nodes, and closures holding large objects: anything that stays reachable after it is no longer needed.'],
        ['How do you find a memory leak?', 'Compare heap snapshots before and after repeating an action in the Memory tab, inspect retainers of growing or detached objects, and watch the post-GC heap baseline in the Performance panel.'],
        ['What is a WeakRef good for?', 'Holding a reference that does not prevent garbage collection, for caches of expensive objects that may be rebuilt. Its behaviour is non-deterministic, so never depend on it for correctness.'],
      ],
    ),
    topic(
      'jsr-performance-tuning',
      'Performance: Debounce, Throttle, Virtualisation and Web Vitals',
      [
        blk(`<h3>Measure first</h3>
• Use <b>Lighthouse</b> and the DevTools <b>Performance</b> tab; track <b>Core Web Vitals</b>: <b>LCP</b> (largest contentful paint, loading), <b>INP</b> (interaction to next paint, responsiveness) and <b>CLS</b> (layout shift, stability).<br>
• Instrument code with <code>performance.now()</code>, <code>performance.mark/measure</code> and the <code>PerformanceObserver</code>.<br>
• Optimise the biggest bottleneck first; most slowness is network, images and too much JavaScript, not a clever loop.`,
          `const t0 = performance.now();
heavyWork();
console.log("heavyWork took", (performance.now() - t0).toFixed(1), "ms");

performance.mark("render-start");
render();
performance.mark("render-end");
performance.measure("render", "render-start", "render-end");
console.log(performance.getEntriesByName("render")[0].duration);

new PerformanceObserver(list => {
  for (const e of list.getEntries()) console.log("LCP candidate:", e.startTime, e.element);
}).observe({ type: "largest-contentful-paint", buffered: true });`,
        ),
      ],
      [
        blk(`<h3>Throttle, debounce and scheduling</h3>
• <b>Debounce</b>: run after events stop for N ms (search box, auto-save). <b>Throttle</b>: run at most once every N ms (scroll, resize, mousemove).<br>
• Use <code>requestAnimationFrame</code> for visual updates, <code>requestIdleCallback</code> for low-priority work and a <b>Web Worker</b> for CPU-heavy tasks.<br>
• Split long tasks (over 50 ms) into chunks so input stays responsive (good INP).`,
          `function debounce(fn, ms) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}
function throttle(fn, ms) {
  let last = 0;
  return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } };
}

input.addEventListener("input", debounce(e => search(e.target.value), 300));
window.addEventListener("scroll", throttle(updateProgressBar, 100), { passive: true });

let ticking = false;
window.addEventListener("mousemove", e => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { moveTooltip(e.clientX, e.clientY); ticking = false; });
});`,
        ),
      ],
      [
        blk(`<h3>Big lists, bundles and the network</h3>
• <b>Virtualise</b> long lists: render only visible rows (react-window, TanStack Virtual) instead of thousands of DOM nodes.<br>
• <b>Ship less JavaScript</b>: code-split routes, tree-shake, remove unused dependencies (check with a bundle analyser), lazy-load below-the-fold components and images (<code>loading="lazy"</code>).<br>
• <b>Network</b>: HTTP caching headers, compression (Brotli), a CDN, modern image formats (AVIF/WebP) with correct sizes, <code>preconnect</code>/<code>preload</code> for critical resources, and avoid request waterfalls by fetching in parallel.<br>
• <b>Algorithms still matter</b>: replacing an O(n²) nested search with a <code>Map</code>/<code>Set</code> lookup beats micro-optimisations.`,
          `// O(n^2): includes() scans the array for every element
function commonSlow(a, b) { return a.filter(x => b.includes(x)); }
// O(n): Set membership is constant time
function commonFast(a, b) { const s = new Set(b); return a.filter(x => s.has(x)); }

const a = Array.from({ length: 20000 }, (_, i) => i);
const b = Array.from({ length: 20000 }, (_, i) => i * 2);
console.time("slow"); commonSlow(a, b); console.timeEnd("slow");   // hundreds of ms
console.time("fast"); commonFast(a, b); console.timeEnd("fast");   // a few ms

// <img src="hero.avif" width="800" height="400" alt="..." fetchpriority="high">
// <img src="below.avif" width="800" height="400" alt="..." loading="lazy" decoding="async">
// <link rel="preconnect" href="https://api.example.com">
const [user, orders] = await Promise.all([getUser(), getOrders()]);   // parallel, no waterfall`,
        ),
      ],
      [
        ['Debounce vs throttle?', 'Debounce delays execution until calls have stopped for a given time (good for search input). Throttle guarantees at most one execution per interval while events keep firing (good for scroll/resize).'],
        ['What are Core Web Vitals?', 'Google\'s user-centred metrics: LCP (loading speed of the main content), INP (responsiveness to interactions) and CLS (visual stability).'],
        ['What is list virtualisation?', 'Rendering only the rows visible in the viewport (plus a small buffer) and recycling them as the user scrolls, so very long lists keep a small DOM and stay fast.'],
      ],
    ),
  ]),
];

export const jsRoadmap4: SubTopic[] = [...jsRoadmap4Base, ...jsExamples];
