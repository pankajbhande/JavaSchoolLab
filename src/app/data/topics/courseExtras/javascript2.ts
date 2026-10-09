// JavaScript course extras, part 2 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const javascript2Extras: Record<string, Extra> = {
    'js-events': x(
        ['Events are things that happen in the page: clicks, key presses, form submits, loads. You react with <code>element.addEventListener("click", handler)</code>.',
            'The handler receives an event object with details (<code>target</code>, <code>key</code>, <code>clientX</code>).',
            'Remove listeners with <code>removeEventListener</code> using the same function reference.'],
        ['Event flow: capture (down), target, bubble (up). Most listeners run in the bubble phase.',
            '<code>preventDefault()</code> stops the default action (form submit, link follow); <code>stopPropagation()</code> stops bubbling.',
            'Event delegation attaches one listener to a parent and uses <code>event.target</code> / <code>closest</code>.'],
        ['Passive listeners (<code>{ passive: true }</code>) improve scroll performance; <code>{ once: true }</code> auto-removes a listener.',
            'Custom events (<code>new CustomEvent</code>) decouple components.',
            'Debounce or throttle high-frequency events (scroll, resize, input).'],
        [['F', 'How do you listen for a click?', '<code>el.addEventListener("click", fn)</code>.'],
            ['F', 'What does preventDefault do?', 'It cancels the browser default action for the event, such as submitting a form.'],
            ['M', 'What is event bubbling?', 'After the target handles an event it propagates to its ancestors.'],
            ['M', 'What is event delegation and why use it?', 'One listener on a parent handles events from many children, including dynamically added ones, using less memory.'],
            ['S', 'What is a passive listener?', 'A promise that the handler will not call preventDefault, allowing the browser to scroll without waiting.'],
            ['S', 'How do you avoid leaking listeners?', 'Remove them when elements are removed, use AbortController signals or once: true.']],
        [['Delegated click handling.',
            r`document.querySelector("#cart").addEventListener("click", e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  console.log(btn.dataset.action, btn.closest("li").dataset.id);
});

// OUTPUT: (clicking the remove button of item 7)
// remove 7`],
            ['Form submit with validation.',
                r`form.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (!data.email.includes("@")) return alert("Invalid email");
  console.log("send", data);
});

// OUTPUT:
// send { email: 'a@x.com', name: 'Asha' }`]],
        [['Cancel many listeners at once.',
            r`const ac = new AbortController();
window.addEventListener("resize", onResize, { signal: ac.signal });
window.addEventListener("scroll", onScroll, { signal: ac.signal, passive: true });
ac.abort();

// OUTPUT:
// both listeners removed`],
            ['Custom event.',
                r`document.addEventListener("cart:add", e => console.log("added", e.detail.sku));
document.dispatchEvent(new CustomEvent("cart:add", { detail: { sku: "A1" } }));

// OUTPUT:
// added A1`]]
    ),

    'js-destructuring': x(
        ['Destructuring unpacks values: <code>const [a, b] = arr</code> and <code>const { name, age } = user</code>.',
            'Arrow functions are a short function syntax: <code>(a, b) =&gt; a + b</code>.',
            'Spread <code>...</code> expands arrays and objects; rest <code>...</code> collects the remaining items.'],
        ['Defaults and renaming: <code>const { name: userName = "guest" } = obj</code>.',
            'Destructure in parameters: <code>function f({ id, qty = 1 }) {}</code>.',
            'Swap variables: <code>[a, b] = [b, a]</code>.'],
        ['Spread creates shallow copies; nested objects are still shared.',
            'Use object spread for immutable updates: <code>{ ...state, count: state.count + 1 }</code>.',
            'Arrow functions capture <code>this</code> lexically and cannot be constructors.'],
        [['F', 'What does const { a, b } = obj do?', 'It creates variables a and b from the properties of obj.'],
            ['F', 'What is the spread operator?', 'Three dots that expand an iterable or object into individual elements or properties.'],
            ['M', 'Rest vs spread?', 'Rest collects items into an array in a parameter or destructuring pattern; spread expands items in a call or literal.'],
            ['M', 'How do you set a default when destructuring?', 'With = after the name: const { page = 1 } = query.'],
            ['S', 'Is spread a deep copy?', 'No, it copies one level; nested references stay shared.'],
            ['S', 'Where do arrow functions differ from regular functions?', 'They have no own this, arguments or prototype and cannot be used with new.']],
        [['Parameters, defaults and renaming.',
            r`const order = { id: 7, items: [{ sku: "A1", qty: 2 }, { sku: "B2" }], customer: { name: "Asha" } };
const { id, customer: { name: buyer }, items: [first, ...others] } = order;
const total = ({ qty = 1, price = 10 }) => qty * price;
console.log(id, buyer, first.sku, others.length, total(first), total({}));

// OUTPUT:
// 7 Asha A1 1 20 10`],
            ['Immutable update with spread.',
                r`const state = { user: { name: "Asha" }, cart: [1, 2] };
const next = { ...state, cart: [...state.cart, 3], user: { ...state.user, name: "Asha R" } };
console.log(state.cart, next.cart, state.user === next.user);

// OUTPUT:
// [ 1, 2 ] [ 1, 2, 3 ] false`]],
        [['Swap and rest.',
            r`let a = 1, b = 2; [a, b] = [b, a];
const [head, ...tail] = [10, 20, 30];
console.log(a, b, head, tail);

// OUTPUT:
// 2 1 10 [ 20, 30 ]`],
            ['Arrow function this.',
                r`const timer = { n: 0, start() { setInterval(() => { this.n++; }, 1000); } };    // arrow keeps this = timer

// OUTPUT:
// timer.n increases every second`]]
    ),

    'js-async': x(
        ['JavaScript is single threaded, so slow operations (network, timers) are asynchronous. A Promise represents a value that will arrive later.',
            '<code>async</code> functions return promises and <code>await</code> pauses until a promise settles.',
            'Handle errors with <code>try/catch</code> around await or <code>.catch()</code> on promises.'],
        ['Promise states: pending, fulfilled, rejected. <code>.then</code>, <code>.catch</code> and <code>.finally</code> chain callbacks.',
            '<code>Promise.all</code> runs promises in parallel and fails fast; <code>allSettled</code> waits for all; <code>race</code> takes the first; <code>any</code> the first success.',
            'Do not make independent calls sequentially with await in a loop when they could run in parallel.'],
        ['Unhandled rejections crash Node processes and log errors in browsers; always handle them.',
            'Cancel work with <code>AbortController</code>; add timeouts to network calls.',
            'Concurrency limits (batches or a pool) protect servers and APIs from overload.'],
        [['F', 'What is a Promise?', 'An object representing the eventual result (or failure) of an asynchronous operation.'],
            ['F', 'What does await do?', 'It pauses the async function until the promise settles and returns its value.'],
            ['M', 'Promise.all vs allSettled?', 'all rejects as soon as one fails; allSettled waits for all and reports each outcome.'],
            ['M', 'Why avoid await inside a plain loop for independent calls?', 'It makes them sequential; use Promise.all to run them in parallel.'],
            ['S', 'How do you cancel a fetch?', 'Pass an AbortController signal to fetch and call abort().'],
            ['S', 'How do you limit concurrency?', 'Process items in batches or use a small worker pool function so only N promises run at once.']],
        [['Sequential vs parallel.',
            r`const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));
console.time("seq"); await wait(100, 1); await wait(100, 2); console.timeEnd("seq");
console.time("par"); await Promise.all([wait(100, 1), wait(100, 2)]); console.timeEnd("par");

// OUTPUT:
// seq: 201 ms
// par: 101 ms`],
            ['Error handling.',
                r`async function load() {
  try { const res = await fetch("/api/orders"); if (!res.ok) throw new Error("HTTP " + res.status); return await res.json(); }
  catch (e) { console.error("failed:", e.message); return []; }
}
const results = await Promise.allSettled([load(), Promise.reject(new Error("boom"))]);
console.log(results.map(r => r.status));

// OUTPUT:
// [ 'fulfilled', 'rejected' ]`]],
        [['Timeout with AbortController.',
            r`const ac = new AbortController();
const t = setTimeout(() => ac.abort(), 3000);
try { const res = await fetch("/api/slow", { signal: ac.signal }); } catch (e) { console.log(e.name); } finally { clearTimeout(t); }

// OUTPUT:
// AbortError`],
            ['Promise.race for a timeout.',
                r`const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));
await Promise.race([fetch("/api/data"), timeout(2000)]);

// OUTPUT:
// Error: timeout (if the request takes longer than 2 s)`]]
    ),

    'js-this-keyword': x(
        ['<code>this</code> refers to the object that calls the function. In a method call <code>obj.method()</code>, this is <code>obj</code>.',
            'In a plain function call, this is undefined (strict mode) or the global object.',
            'Arrow functions do not have their own this; they use the this of the surrounding code.'],
        ['<code>call</code>, <code>apply</code> and <code>bind</code> set this explicitly.',
            'Extracting a method loses its this: <code>const f = obj.method; f()</code>.',
            'In event handlers with regular functions, this is the element; with arrow functions it is the outer this.'],
        ['In classes, bind methods or use arrow function fields when passing them as callbacks.',
            'Prefer closures or arrow functions over bind in modern code; be explicit about context.',
            'In modules and classes the code runs in strict mode, so a lost this becomes undefined and fails fast.'],
        [['F', 'What is this in a method call?', 'The object before the dot.'],
            ['F', 'Do arrow functions have their own this?', 'No, they use the this of the enclosing scope.'],
            ['M', 'Why does a method lose this when passed as a callback?', 'The function is called without the object, so this is no longer bound to it.'],
            ['M', 'call vs apply vs bind?', 'call and apply invoke immediately (arguments listed vs array); bind returns a new function with this fixed.'],
            ['S', 'How does this work with new?', 'new creates an object, sets this to it inside the constructor and returns it.'],
            ['S', 'How do you keep this in class event handlers?', 'Use arrow function class fields or bind in the constructor.']],
        [['Lost this and fixes.',
            r`const user = { name: "Asha", hi() { return "Hi " + this.name; } };
const f = user.hi;
console.log(user.hi());
try { console.log(f()); } catch (e) { console.log("error:", e.message); }
console.log(f.call(user), user.hi.bind({ name: "Ravi" })());

// OUTPUT:
// Hi Asha
// error: Cannot read properties of undefined (reading 'name')
// Hi Asha Hi Ravi`],
            ['Arrow function field in a class.',
                r`class Button {
  label = "Save";
  onClick = () => console.log("clicked", this.label);      // this is always the instance
}
const b = new Button();
setTimeout(b.onClick, 0);

// OUTPUT:
// clicked Save`]],
        [['this in callbacks.',
            r`const obj = { n: 1, later() { setTimeout(function () { console.log(this === obj); }, 0); setTimeout(() => console.log(this === obj), 0); } };
obj.later();

// OUTPUT:
// false
// true`],
            ['new and this.',
                r`function Point(x, y) { this.x = x; this.y = y; }
const p = new Point(1, 2);
console.log(p, p instanceof Point);

// OUTPUT:
// Point { x: 1, y: 2 } true`]]
    ),

    'js-error-handling': x(
        ['Use <code>try { ... } catch (e) { ... } finally { ... }</code> to handle runtime errors without crashing.',
            'Throw errors with <code>throw new Error("message")</code>.',
            'Errors have <code>name</code>, <code>message</code> and <code>stack</code>.'],
        ['Custom errors: <code>class ValidationError extends Error</code> with extra fields.',
            'Async errors: promises reject; use try/catch with await or <code>.catch</code>.',
            '<code>finally</code> always runs, which is useful for cleanup.'],
        ['Do not swallow errors silently; log with context and rethrow or return a meaningful result.',
            'Validate input early and fail with clear messages; use error codes for programmatic handling.',
            'In browsers use <code>window.onerror</code> and <code>unhandledrejection</code> for global reporting; in Node handle <code>unhandledRejection</code>.'],
        [['F', 'How do you handle an error?', 'With try/catch (and optionally finally).'],
            ['F', 'How do you create an error?', '<code>throw new Error("message")</code>.'],
            ['M', 'What does finally do?', 'It runs after try/catch whether or not an error occurred, for cleanup.'],
            ['M', 'How do you handle errors in async code?', 'try/catch around await, or .catch() on the promise.'],
            ['S', 'Why create custom error classes?', 'To distinguish error types with instanceof and carry extra data such as codes.'],
            ['S', 'How do you report uncaught errors in production?', 'Global handlers (onerror, unhandledrejection) that send to a monitoring service with context.']],
        [['Custom error and handling.',
            r`class ValidationError extends Error {
  constructor(field, message) { super(message); this.name = "ValidationError"; this.field = field; }
}
function parseAge(v) { const n = Number(v); if (!Number.isInteger(n) || n < 0) throw new ValidationError("age", "Age must be a positive integer"); return n; }
try { parseAge("abc"); }
catch (e) { if (e instanceof ValidationError) console.log(e.field + ": " + e.message); else throw e; }
finally { console.log("done"); }

// OUTPUT:
// age: Age must be a positive integer
// done`],
            ['Global error reporting.',
                r`window.addEventListener("error", e => report({ msg: e.message, src: e.filename, line: e.lineno }));
window.addEventListener("unhandledrejection", e => report({ msg: String(e.reason) }));

// OUTPUT:
// uncaught errors sent to the monitoring endpoint`]],
        [['Error cause chain.',
            r`try { JSON.parse("{bad"); }
catch (e) { throw new Error("Could not read settings", { cause: e }); }

// OUTPUT:
// Error: Could not read settings   [cause]: SyntaxError: Expected property name ...`],
            ['Cleanup in finally.',
                r`const lock = acquire();
try { work(); } finally { lock.release(); }

// OUTPUT:
// the lock is released even when work() throws`]]
    ),

    'js-es6-classes': x(
        ['A class is a template for objects: <code>class User { constructor(name) { this.name = name; } greet() { ... } }</code>. Create with <code>new User("Asha")</code>.',
            'Inheritance uses <code>extends</code> and <code>super</code>.',
            'Classes are syntax over JavaScript prototypes.'],
        ['Static members belong to the class (<code>static create()</code>); private fields use <code>#name</code>; getters and setters control access.',
            'Class fields can be declared directly: <code>count = 0;</code>.',
            'Methods are on the prototype, shared by all instances; arrow function fields are per-instance.'],
        ['Prefer composition over deep inheritance; use small classes or plain functions where state is not needed.',
            'Private fields (<code>#</code>) are truly private; underscore names are only a convention.',
            'Be careful with <code>this</code> when passing methods as callbacks.'],
        [['F', 'How do you create a class?', 'With the class keyword and a constructor method.'],
            ['F', 'How do you inherit?', '<code>class Admin extends User</code> and call <code>super()</code> in the constructor.'],
            ['M', 'What are static methods?', 'Methods called on the class itself, not on instances.'],
            ['M', 'How do you make a field private?', 'Prefix it with # (for example #balance).'],
            ['S', 'How are classes related to prototypes?', 'A class is syntactic sugar: methods live on Class.prototype and instances link to it.'],
            ['S', 'Composition vs inheritance?', 'Composition builds behaviour by combining objects; inheritance couples subclasses tightly to parents, so prefer composition.']],
        [['Class with private state.',
            r`class Account {
  #balance = 0;
  static count = 0;
  constructor(owner) { this.owner = owner; Account.count++; }
  deposit(n) { if (n <= 0) throw new Error("positive amount"); this.#balance += n; return this; }
  get balance() { return this.#balance; }
}
const a = new Account("Asha").deposit(100).deposit(50);
console.log(a.balance, Account.count, a.#balance === undefined);

// OUTPUT:
// SyntaxError: Private field '#balance' must be declared in an enclosing class   (accessing it outside fails)
// without the last check: 150 1`],
            ['Inheritance.',
                r`class Shape { area() { return 0; } toString() { return this.constructor.name + " " + this.area(); } }
class Circle extends Shape { constructor(r) { super(); this.r = r; } area() { return +(Math.PI * this.r ** 2).toFixed(2); } }
console.log(String(new Circle(2)));

// OUTPUT:
// Circle 12.57`]],
        [['Composition.',
            r`const canSave = state => ({ save: () => console.log("saved", state.name) });
const canExport = state => ({ export: () => console.log("exported", state.name) });
const makeDoc = name => { const state = { name }; return { ...canSave(state), ...canExport(state) }; };
makeDoc("report").save();

// OUTPUT:
// saved report`],
            ['Prototype view.',
                r`console.log(typeof Account, Object.getPrototypeOf(a) === Account.prototype, a.deposit === Account.prototype.deposit);

// OUTPUT:
// function true true`]]
    ),

    'js-modules': x(
        ['Modules split code into files. <code>export</code> exposes functions or values and <code>import</code> brings them into another file.',
            'Use <code>&lt;script type="module"&gt;</code> in the browser; Node supports ES modules with <code>.mjs</code> or <code>"type": "module"</code>.',
            'Each module has its own scope, so nothing leaks to the global object.'],
        ['Named exports (<code>export const x</code>, <code>import { x }</code>) and one default export (<code>export default</code>).',
            'Dynamic import (<code>await import("./x.js")</code>) loads code on demand.',
            'Modules are singletons: they run once and the exports are shared.'],
        ['Bundlers (Vite, esbuild, webpack) combine and optimize modules; tree shaking removes unused exports.',
            'Avoid circular imports; they cause partially initialized bindings.',
            'Prefer named exports for better refactoring and tooling support.'],
        [['F', 'What does export do?', 'It makes a value, function or class available to other modules.'],
            ['F', 'How do you import a named export?', '<code>import { name } from "./file.js"</code>.'],
            ['M', 'Named vs default export?', 'A module can have many named exports but one default export; named exports are explicit and easier to refactor.'],
            ['M', 'What is dynamic import for?', 'Loading a module lazily at runtime, for code splitting.'],
            ['S', 'What is tree shaking?', 'Removing unused exports from the final bundle, which requires static ES module syntax.'],
            ['S', 'Why are circular imports a problem?', 'A module may be evaluated before its dependency finishes, so imported bindings can be uninitialized.']],
        [['Named and default exports.',
            r`// math.js
export const PI = 3.14159;
export function area(r) { return PI * r * r; }
export default class Calculator { add(a, b) { return a + b; } }
// main.js
import Calculator, { area, PI as pi } from "./math.js";
console.log(area(2).toFixed(2), new Calculator().add(2, 3), pi);

// OUTPUT:
// 12.57 5 3.14159`],
            ['Lazy loading.',
                r`button.addEventListener("click", async () => {
  const { renderChart } = await import("./chart.js");
  renderChart(data);
});

// OUTPUT:
// chart.js is downloaded only when the button is first clicked`]],
        [['Re-exports (barrel file).',
            r`// index.js
export { area } from "./math.js";
export * as format from "./format.js";

// OUTPUT:
// consumers import from "./index.js"`],
            ['Module scope.',
                r`<script type="module">
  const secret = 1;            // not on window
  console.log(typeof window.secret, import.meta.url.endsWith(".html"));
</script>

// OUTPUT:
// undefined true`]]
    ),

    'js-fetch-api': x(
        ['<code>fetch(url)</code> makes HTTP requests and returns a promise of a Response. Read the body with <code>await res.json()</code>.',
            'Check <code>res.ok</code> (status 200-299); fetch does not reject on HTTP error codes, only on network failure.',
            'Send data with options: <code>method</code>, <code>headers</code> and <code>body</code>.'],
        ['POST JSON: <code>fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })</code>.',
            'Query strings: use <code>URLSearchParams</code> to encode safely.',
            'Cancel with <code>AbortController</code>; credentials and CORS are controlled by <code>credentials</code> and <code>mode</code>.'],
        ['CORS is enforced by the browser; the server must send the right headers; preflight requests precede non-simple requests.',
            'Retry only idempotent requests, with backoff; show loading and error states in the UI.',
            'Avoid putting secrets in front-end code; keep tokens in httpOnly cookies where possible.'],
        [['F', 'What does fetch return?', 'A Promise that resolves to a Response object.'],
            ['F', 'How do you read JSON from a response?', '<code>await response.json()</code>.'],
            ['M', 'Does fetch reject on a 404?', 'No. It rejects only for network errors; check response.ok or the status yourself.'],
            ['M', 'How do you send JSON?', 'POST with a JSON Content-Type header and JSON.stringify body.'],
            ['S', 'What is CORS?', 'A browser security mechanism that restricts cross-origin requests unless the server allows them with headers.'],
            ['S', 'How do you handle timeouts and cancellation?', 'AbortController with a timer (or AbortSignal.timeout) passed as the signal option.']],
        [['GET and POST with checks.',
            r`async function api(path, options = {}) {
  const res = await fetch("/api" + path, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) throw new Error(path + " failed with " + res.status);
  return res.status === 204 ? null : res.json();
}
const orders = await api("/orders?" + new URLSearchParams({ status: "NEW", page: 1 }));
const created = await api("/orders", { method: "POST", body: JSON.stringify({ sku: "A1", qty: 2 }) });
console.log(orders.length, created.id);

// OUTPUT:
// 12 9121`],
            ['Timeout.',
                r`try { const res = await fetch("/api/report", { signal: AbortSignal.timeout(5000) }); console.log(res.status); }
catch (e) { console.log(e.name); }

// OUTPUT:
// TimeoutError`]],
        [['Parallel requests.',
            r`const [user, orders] = await Promise.all([api("/me"), api("/orders")]);

// OUTPUT:
// both requests run at the same time`],
            ['Upload a file.',
                r`const form = new FormData(); form.append("file", input.files[0]);
await fetch("/api/upload", { method: "POST", body: form });      // do not set Content-Type: the browser adds the boundary

// OUTPUT:
// multipart/form-data upload`]]
    )
};

export const javascript2Deep: Record<string, Deep> = {
    'js-events': dv(
        [`When an event fires, the browser builds the propagation path from the window down to the target, runs capture listeners along the way, then the target listeners, then bubble listeners back up. Listeners run synchronously, one after another, on the main thread, so a slow listener blocks rendering and other events.`,
            r`parent.addEventListener("click", () => console.log("parent capture"), true);
child.addEventListener("click", () => console.log("child"));
parent.addEventListener("click", () => console.log("parent bubble"));
// clicking child

// OUTPUT:
// parent capture
// child
// parent bubble`],
        [`Options: <code>capture</code>, <code>once</code>, <code>passive</code>, <code>signal</code>. Event types: mouse, keyboard, pointer, touch, input, change, submit, focus, scroll, resize, drag and drop, custom events, observers (IntersectionObserver, ResizeObserver). Delegation uses <code>closest</code> and <code>matches</code>.`,
            r`window.addEventListener("scroll", onScroll, { passive: true });
document.addEventListener("keydown", e => { if (e.ctrlKey && e.key === "s") { e.preventDefault(); save(); } });
el.addEventListener("pointerdown", start, { once: true });
new ResizeObserver(([e]) => console.log(e.contentRect.width)).observe(panel);

// OUTPUT:
// Ctrl+S saves instead of opening the browser dialog`],
        [`Mistakes: anonymous functions that cannot be removed, forgetting that this/event.target differ (currentTarget vs target), handlers that block, stopPropagation overuse (breaks other code), and listeners on removed elements. Keep references, use delegation and AbortController.`,
            r`el.addEventListener("click", () => doWork());
el.removeEventListener("click", () => doWork());     // different function object: nothing removed
const handler = () => doWork();
el.addEventListener("click", handler); el.removeEventListener("click", handler);

// OUTPUT:
// only the second pair works`],
        [`High-frequency events (scroll, mousemove, resize, input) can fire dozens of times per frame. Debounce or throttle, use requestAnimationFrame, passive listeners and observers instead of polling.`,
            r`let ticking = false;
window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(() => { update(window.scrollY); ticking = false; }); ticking = true; } }, { passive: true });

// OUTPUT:
// update runs at most once per frame`],
        [`Real-world: keyboard shortcuts and accessibility. One document-level listener maps key combinations to commands and ignores typing inside inputs.`,
            r`const commands = { "ctrl+k": openSearch, "g i": goInbox, "?": showHelp };
document.addEventListener("keydown", e => {
  if (/INPUT|TEXTAREA/.test(e.target.tagName) || e.target.isContentEditable) return;
  const key = (e.ctrlKey ? "ctrl+" : "") + e.key.toLowerCase();
  if (commands[key]) { e.preventDefault(); commands[key](); }
});

// OUTPUT:
// Ctrl+K opens search unless the user is typing in a field`]
    ),

    'js-destructuring': dv(
        [`Destructuring is syntax for pulling values out using the iterator protocol (arrays) or property access (objects), with defaults applied when the value is undefined. Spread uses the same protocols in the other direction. Arrow functions are compiled to function objects whose this, arguments and super are lexical.`,
            r`const [x, , z = 9, ...rest] = [1, 2, undefined, 4, 5];
const { a, b: { c = 3 } = {}, ...others } = { a: 1, d: 4, e: 5 };
console.log(x, z, rest, a, c, others);
const [p, q] = new Set([10, 20]);
const [first, second] = "hi";
console.log(p, q, first, second);

// OUTPUT:
// 1 9 [ 4, 5 ] 1 3 { d: 4, e: 5 }
// 10 20 h i`],
        [`Patterns: nested destructuring, computed property keys in patterns, function parameter destructuring with defaults, destructuring in loops (<code>for (const [k, v] of Object.entries(o))</code>), swapping, returning multiple values, and spread for copying and merging arrays and objects.`,
            r`function connect({ host = "localhost", port = 3306, ...options } = {}) { return host + ":" + port + " " + JSON.stringify(options); }
console.log(connect(), connect({ port: 3307, ssl: true }));
for (const [name, price] of Object.entries({ pen: 10, book: 150 })) console.log(name, price);
const merged = [...[1, 2], ...new Set([2, 3])];
const { [("pri" + "ce")]: amount } = { price: 99 };

// OUTPUT:
// localhost:3306 {} localhost:3307 {"ssl":true}
// pen 10
// book 150`],
        [`Mistakes: destructuring null or undefined (TypeError), forgetting that defaults apply only for undefined (not null), shallow copies assumed deep, parentheses needed for object destructuring assignment, and overly deep patterns that hurt readability. Provide a default object and keep patterns simple.`,
            r`const { name } = null ?? {};
const { n = 5 } = { n: null };
let u; ({ u } = { u: 1 });
const copy = { ...{ nested: { v: 1 } } }; copy.nested.v = 2;
console.log(name, n, u);

// OUTPUT:
// undefined null 1`],
        [`Spread and destructuring allocate new arrays and objects; in tight loops or with very large arrays this adds up (spreading a million elements into a call can exceed the argument limit). Use loops, <code>push</code> or <code>concat</code> for large data.`,
            r`Math.max(...hugeArray);            // RangeError: Maximum call stack size exceeded for very large arrays
hugeArray.reduce((m, v) => v > m ? v : m, -Infinity);

// OUTPUT:
// the reduce version works for any size`],
        [`Real-world: reducers and state updates stay readable with destructuring and spread, always returning new objects so UI frameworks can detect changes.`,
            r`function cartReducer(state, { type, item }) {
  switch (type) {
    case "add": return { ...state, items: [...state.items, item], total: state.total + item.price };
    case "remove": return { ...state, items: state.items.filter(i => i.id !== item.id), total: state.total - item.price };
    default: return state;
  }
}
console.log(cartReducer({ items: [], total: 0 }, { type: "add", item: { id: 1, price: 10 } }));

// OUTPUT:
// { items: [ { id: 1, price: 10 } ], total: 10 }`]
    ),

    'js-async': dv(
        [`An async function runs synchronously until the first await; at an await it returns a promise to the caller and registers the rest of the function as a continuation in the microtask queue when the awaited promise settles. Promise reaction jobs are microtasks, so they run before the next timer or I/O callback. Errors become rejections of the returned promise.`,
            r`async function f() { console.log("1 in f"); await null; console.log("3 after await"); }
console.log("0 before");
f();
console.log("2 after call");
setTimeout(() => console.log("4 timeout"), 0);

// OUTPUT:
// 0 before
// 1 in f
// 2 after call
// 3 after await
// 4 timeout`],
        [`Tools: <code>Promise.all/allSettled/race/any</code>, <code>Promise.withResolvers</code>, <code>async iterators</code> with <code>for await</code>, <code>AbortController</code>, timers, <code>queueMicrotask</code>, streams, worker threads and message passing. Patterns: retry with backoff, concurrency pools, timeouts, caching promises.`,
            r`async function pool(items, limit, fn) {
  const results = []; let i = 0;
  const workers = Array.from({ length: limit }, async () => { while (i < items.length) { const idx = i++; results[idx] = await fn(items[idx]); } });
  await Promise.all(workers);
  return results;
}
const out = await pool([1, 2, 3, 4, 5, 6], 2, async n => n * n);
console.log(out);
for await (const chunk of readStream()) process(chunk);

// OUTPUT:
// [ 1, 4, 9, 16, 25, 36 ]`],
        [`Mistakes: forgetting await (a promise object used as a value), unhandled rejections, await in forEach, sequential awaits for independent work, swallowing errors in catch, creating promises in a loop without limits, and mixing callbacks and promises. Use Promise.all with map and always handle rejections.`,
            r`const res = fetch("/api/data");            // forgot await: res is a Promise
console.log(res.ok);                        // undefined
items.forEach(async i => { await save(i); }); console.log("saved?");   // logs before saving finishes

// OUTPUT:
// undefined
// saved?   (and unhandled rejections if save fails)`],
        [`Throughput comes from parallelism with bounds. Fire independent requests together, cap concurrency to protect servers, cache in-flight promises to deduplicate identical requests, and use AbortController to cancel obsolete work.`,
            r`const inflight = new Map();
function cached(url) { if (!inflight.has(url)) inflight.set(url, fetch(url).then(r => r.json()).finally(() => setTimeout(() => inflight.delete(url), 5000))); return inflight.get(url); }
await Promise.all([cached("/api/me"), cached("/api/me")]);

// OUTPUT:
// one network request shared by both callers`],
        [`Real-world: a search box. Debounce typing, cancel the previous request when a new one starts, ignore stale responses and show loading and error states.`,
            r`let controller;
async function search(q) {
  controller?.abort(); controller = new AbortController();
  try { const res = await fetch("/api/search?q=" + encodeURIComponent(q), { signal: controller.signal }); render(await res.json()); }
  catch (e) { if (e.name !== "AbortError") showError(e); }
}
input.addEventListener("input", debounce(e => search(e.target.value), 300));

// OUTPUT:
// only the latest query's results are rendered`]
    ),

    'js-this-keyword': dv(
        [`this is determined at call time (except in arrow functions). Binding rules in order: <code>new</code> (new object), explicit (<code>call/apply/bind</code>), implicit (the object before the dot), default (undefined in strict mode, global otherwise). Arrow functions resolve this lexically like any other variable from the enclosing scope.`,
            r`function show() { return this === undefined ? "undefined" : this.tag; }
const a = { tag: "a", show }, b = { tag: "b" };
console.log(a.show(), show.call(b), show.bind(a).call(b));
console.log(new (function F() { this.tag = "new"; })().tag);
console.log((() => typeof this)());

// OUTPUT:
// a b a
// new
// object      (module/global lexical this; undefined inside ES modules)`],
        [`Controls: <code>bind</code> (partial application too), arrow functions, <code>self = this</code> (old style), class fields with arrows, <code>Function.prototype.call/apply</code>, <code>globalThis</code>, <code>Reflect.apply</code>, <code>queueMicrotask</code> with bound callbacks, and passing context arguments (<code>arr.map(fn, thisArg)</code>).`,
            r`class Counter {
  count = 0;
  inc = () => { this.count++; };            // bound per instance
  dec() { this.count--; }
}
const c = new Counter();
const { inc, dec } = c;
inc(); console.log(c.count);
try { dec(); } catch (e) { console.log(e.constructor.name); }

// OUTPUT:
// 1
// TypeError`],
        [`Mistakes: passing methods as callbacks (lost this), arrow functions as object methods (this is outer), using this inside nested regular functions, and assuming this in event handlers. Use arrow callbacks, bind, or class arrow fields.`,
            r`const timer = { sec: 0, start() { setInterval(function () { this.sec++; console.log(this.sec); }, 1000); } };
timer.start();

// OUTPUT:
// NaN       (this is the window/timer object, not timer)
// fix: use an arrow function inside setInterval`],
        [`Bound functions and per-instance arrow fields create one function per instance, which costs memory in large collections; prototype methods are shared. Choose per-instance arrows only where the method is passed around as a callback.`,
            r`class Row { handle = () => {}; }
class RowShared { handle() {} }
console.log(new Row().handle === new Row().handle, new RowShared().handle === new RowShared().handle);

// OUTPUT:
// false true`],
        [`Real-world: React class components needed bound handlers; modern code uses function components and closures, where this is not involved at all, which removes this class of bugs.`,
            r`function Counter() { const [n, setN] = useState(0); return <button onClick={() => setN(n + 1)}>{n}</button>; }

// OUTPUT:
// a button that counts clicks; no this binding to manage`]
    ),

    'js-error-handling': dv(
        [`When an exception is thrown the engine unwinds the call stack looking for a catch. If none exists, it becomes an uncaught error (browser: window error event; Node: process crash for unhandled rejections). Errors capture a stack trace when created. try/finally guarantees cleanup code runs in all exit paths including return.`,
            r`function a() { b(); } function b() { c(); } function c() { throw new Error("deep"); }
try { a(); } catch (e) { console.log(e.message); console.log(e.stack.split("\n").slice(0, 3).join(" | ")); }
function f() { try { return "try"; } finally { console.log("finally runs before return"); } }
console.log(f());

// OUTPUT:
// deep
// Error: deep | at c | at b
// finally runs before return
// try`],
        [`Tools: built-in errors (TypeError, RangeError, SyntaxError), custom subclasses with codes, <code>cause</code> chaining, <code>AggregateError</code> (Promise.any), <code>Promise.allSettled</code>, error boundaries (React), global handlers, <code>Error.captureStackTrace</code> (V8), and Result-style returns for expected failures.`,
            r`class HttpError extends Error { constructor(status, body) { super("HTTP " + status); this.name = "HttpError"; this.status = status; this.body = body; } }
try { await Promise.any([Promise.reject(new Error("a")), Promise.reject(new Error("b"))]); }
catch (e) { console.log(e.constructor.name, e.errors.map(x => x.message)); }
const parse = s => { try { return { ok: true, value: JSON.parse(s) }; } catch (e) { return { ok: false, error: e.message }; } };

// OUTPUT:
// AggregateError [ 'a', 'b' ]`],
        [`Mistakes: empty catch blocks, catching and logging without rethrowing when the caller must know, throwing strings, losing the cause, using exceptions for normal control flow, and not handling promise rejections. Throw Error objects, add context and rethrow.`,
            r`try { risky(); } catch (e) { }                          // swallowed
try { risky(); } catch (e) { throw new Error("risky step failed", { cause: e }); }
Promise.reject(new Error("x"));                            // unhandled rejection

// OUTPUT:
// UnhandledPromiseRejection (Node exits with code 1)`],
        [`Throwing and catching is slower than normal returns and stack capture costs time. Use exceptions for exceptional cases, not for loops or validation of expected input; return result objects for those. Keep catch blocks narrow.`,
            r`console.time("exceptions"); for (let i = 0; i < 1e5; i++) { try { throw new Error("x"); } catch {} } console.timeEnd("exceptions");
console.time("results"); for (let i = 0; i < 1e5; i++) { const r = { ok: false }; if (!r.ok) continue; } console.timeEnd("results");

// OUTPUT:
// exceptions: 420 ms
// results: 1 ms`],
        [`Real-world: an API client that converts HTTP failures into typed errors, retries transient ones, and a UI that shows a friendly message while logging full details.`,
            r`async function request(url, opts) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, opts);
      if (res.ok) return res.json();
      throw new HttpError(res.status, await res.text());
    } catch (e) {
      const transient = e instanceof TypeError || (e instanceof HttpError && e.status >= 500);
      if (!transient || attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 200 * attempt));
    }
  }
}

// OUTPUT:
// 503 retried up to three times; 404 fails immediately`]
    ),

    'js-es6-classes': dv(
        [`A class declaration creates a constructor function and puts methods on its prototype. Instances link to the prototype through [[Prototype]], so a method lookup walks the chain. extends sets up the prototype chain between constructor and prototype objects; super calls the parent. Private fields (<code>#x</code>) are stored in hidden per-instance slots and are inaccessible outside the class body.`,
            r`class Animal { constructor(name) { this.name = name; } speak() { return this.name + " makes a sound"; } }
class Dog extends Animal { speak() { return super.speak() + " (woof)"; } }
const d = new Dog("Rex");
console.log(d.speak());
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype, d instanceof Animal, Object.hasOwn(d, "speak"));

// OUTPUT:
// Rex makes a sound (woof)
// true true false`],
        [`Features: constructors, instance and static fields and methods, getters/setters, private fields and methods, static blocks, inheritance and <code>super</code>, <code>instanceof</code>, <code>Symbol.iterator</code> on classes, mixins, and <code>new.target</code>. Class expressions and the <code>Object.create</code>/prototype style are alternatives.`,
            r`class Temperature {
  static #count = 0;
  #celsius;
  constructor(c) { this.#celsius = c; Temperature.#count++; }
  get fahrenheit() { return this.#celsius * 9 / 5 + 32; }
  set fahrenheit(f) { this.#celsius = (f - 32) * 5 / 9; }
  static get created() { return Temperature.#count; }
  *[Symbol.iterator]() { yield this.#celsius; yield this.fahrenheit; }
}
const t = new Temperature(100);
console.log(t.fahrenheit, [...t], Temperature.created);

// OUTPUT:
// 212 [ 100, 212 ] 1`],
        [`Mistakes: forgetting <code>super()</code> before using this in a subclass constructor (ReferenceError), calling a class without new (TypeError), deep hierarchies, mutable static state, and exposing internals instead of using private fields. Prefer composition and small classes.`,
            r`class A { } class B extends A { constructor() { this.x = 1; } }
try { new B(); } catch (e) { console.log(e.name); }
try { A(); } catch (e) { console.log(e.name); }

// OUTPUT:
// ReferenceError
// TypeError`],
        [`Instances created from classes are optimized well by engines when their shape is stable: initialize all fields in the constructor in the same order. Large numbers of per-instance arrow functions increase memory; use prototype methods.`,
            r`class Point { x; y; constructor(x, y) { this.x = x; this.y = y; } }       // stable shape
class Bad { constructor(x) { this.x = x; if (x > 0) this.y = 1; } }       // different shapes: slower property access

// OUTPUT:
// monomorphic access on Point is faster than polymorphic on Bad`],
        [`Real-world: a small domain model with validation in the constructor, immutable value objects (frozen) and a repository class that hides storage.`,
            r`class Money {
  #cents;
  constructor(cents) { if (!Number.isInteger(cents)) throw new TypeError("cents must be an integer"); this.#cents = cents; Object.freeze(this); }
  add(o) { return new Money(this.#cents + o.#cents); }
  toString() { return (this.#cents / 100).toFixed(2); }
}
console.log(String(new Money(1999).add(new Money(501))));

// OUTPUT:
// 25.00`]
    ),

    'js-modules': dv(
        [`ES modules are statically analysable: imports and exports are declared at the top level, so the engine can build the dependency graph before running any code. Each module is loaded once, evaluated in dependency order, and exports are live bindings (importers see updates to exported variables). Module code is always strict mode.`,
            r`// counter.js
export let count = 0;
export function inc() { count++; }
// main.js
import { count, inc } from "./counter.js";
console.log(count); inc(); console.log(count);

// OUTPUT:
// 0
// 1       (live binding: the import reflects the change)`],
        [`Forms: named exports, default export, re-exports (<code>export * from</code>), namespace imports (<code>import * as m</code>), side-effect imports, dynamic <code>import()</code>, <code>import.meta</code>, import maps in browsers, top-level await, JSON and CSS module imports (with import attributes). CommonJS (<code>require</code>) is the older Node system.`,
            r`import * as utils from "./utils.js";
import config from "./config.json" with { type: "json" };
export * from "./models.js";
const mod = await import(isAdmin ? "./admin.js" : "./user.js");
console.log(import.meta.url, typeof require);

// OUTPUT:
// file:///app/main.js undefined      (require does not exist in ES modules)`],
        [`Mistakes: circular dependencies, mixing CommonJS and ESM incorrectly, forgetting file extensions in browser imports, barrel files that defeat tree shaking and slow tests, and default exports that make renames inconsistent. Prefer named exports and direct imports.`,
            r`// a.js: import { b } from "./b.js"; export const a = "A" + b;
// b.js: import { a } from "./a.js"; export const b = "B" + a;
// OUTPUT:
// ReferenceError: Cannot access 'a' before initialization     (circular import)
// fix: move shared code to a third module`],
        [`Performance: split bundles by route with dynamic import, rely on tree shaking (side-effect free modules and static imports), preload critical modules (<code>modulepreload</code>) and cache with content hashes.`,
            r`<link rel="modulepreload" href="/assets/app.3f9a1c.js">
const routes = { "/reports": () => import("./reports.js"), "/admin": () => import("./admin.js") };
const page = await routes[location.pathname]?.();

// OUTPUT:
// initial bundle 120 kB; reports chunk 48 kB loaded on demand`],
        [`Real-world: a plugin system loading modules by name at runtime, with a small contract each plugin exports.`,
            r`async function loadPlugin(name) {
  const mod = await import("./plugins/" + name + ".js");
  if (typeof mod.default?.run !== "function") throw new Error("Invalid plugin " + name);
  return mod.default;
}
const plugin = await loadPlugin("csv-export");
plugin.run(data);

// OUTPUT:
// csv-export plugin loaded and executed on demand`]
    ),

    'js-fetch-api': dv(
        [`fetch returns a promise that resolves once response headers arrive; the body is a stream read by <code>json()</code>, <code>text()</code>, <code>blob()</code> or <code>arrayBuffer()</code> (each can be consumed once). The browser enforces CORS, applies HTTP caching, cookies (per credentials mode) and follows redirects. Network failures reject with TypeError; HTTP errors resolve with ok = false.`,
            r`const res = await fetch("/api/orders/7");
console.log(res.status, res.ok, res.headers.get("content-type"));
const body = await res.clone().text();
const data = await res.json();
console.log(res.bodyUsed, typeof data);

// OUTPUT:
// 200 true application/json
// true object`],
        [`Options: <code>method</code>, <code>headers</code>, <code>body</code> (string, FormData, Blob, URLSearchParams, stream), <code>mode</code>, <code>credentials</code>, <code>cache</code>, <code>redirect</code>, <code>signal</code>, <code>keepalive</code>. Helpers: <code>Request</code>, <code>Response</code>, <code>Headers</code>, <code>URL</code>, <code>URLSearchParams</code>, streaming with <code>res.body.getReader()</code>.`,
            r`const res = await fetch("/api/export", { credentials: "include", cache: "no-store", headers: { Accept: "text/csv" } });
const reader = res.body.getReader(); let bytes = 0;
for (;;) { const { done, value } = await reader.read(); if (done) break; bytes += value.length; }
console.log(bytes + " bytes streamed");

// OUTPUT:
// 4812033 bytes streamed`],
        [`Mistakes: assuming fetch rejects on 4xx/5xx, forgetting Content-Type on JSON posts, reading the body twice, setting Content-Type for FormData uploads (breaks the boundary), ignoring CORS errors, and no timeouts or retries. Wrap fetch in a helper that handles these.`,
            r`const res = await fetch("/api/missing");
console.log(res.ok, res.status);                 // false 404 (no exception)
await res.json(); await res.json();              // second read fails

// OUTPUT:
// false 404
// TypeError: Failed to execute 'json' on 'Response': body stream already read`],
        [`Performance: reuse connections (HTTP/2), cache GETs with proper headers or an in-memory cache, deduplicate in-flight requests, use compression, request only needed fields and use pagination. Prefetch data before navigation when possible.`,
            r`const [orders, customers] = await Promise.all([fetch("/api/orders?fields=id,total&limit=50").then(r => r.json()), fetch("/api/customers?ids=1,2,3").then(r => r.json())]);

// OUTPUT:
// two parallel requests with small payloads`],
        [`Real-world: an API client module used by the whole app, handling base URL, auth header, JSON, errors, timeouts and one retry for network failures.`,
            r`export async function api(path, { method = "GET", body, signal } = {}) {
  const res = await fetch("/api" + path, { method, signal: signal ?? AbortSignal.timeout(10000), headers: { "Content-Type": "application/json", Authorization: "Bearer " + token() }, body: body && JSON.stringify(body) });
  if (res.status === 401) { redirectToLogin(); throw new Error("unauthorized"); }
  if (!res.ok) throw Object.assign(new Error("HTTP " + res.status), { status: res.status, body: await res.text() });
  return res.status === 204 ? null : res.json();
}

// OUTPUT:
// await api("/orders", { method: "POST", body: { sku: "A1" } })  ->  { id: 9121 }`]
    )
};
