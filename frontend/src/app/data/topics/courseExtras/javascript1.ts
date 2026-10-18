// JavaScript course extras, part 1 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const javascript1Extras: Record<string, Extra> = {
    'js-intro': x(
        ['JavaScript is the programming language of the web. It runs in the browser (and on servers with Node.js) and makes pages interactive.',
            'You can try it in the browser console, in a <code>&lt;script&gt;</code> tag or in a <code>.js</code> file.',
            'Basics: variables (<code>let</code>, <code>const</code>), functions, objects and arrays.'],
        ['JavaScript is dynamically typed, single-threaded and event-driven: long work must be asynchronous so the page stays responsive.',
            'Use <code>const</code> by default, <code>let</code> when reassigning, and avoid <code>var</code>.',
            'Use strict equality <code>===</code>; <code>==</code> performs type coercion and causes surprises.'],
        ['The runtime has a call stack, a heap, a task queue and a microtask queue; the event loop moves callbacks onto the stack.',
            'Modern JS is delivered as ES modules, transpiled and bundled for older browsers (Babel, Vite, esbuild).',
            'Use TypeScript for larger codebases to catch type errors early.'],
        [['F', 'What is JavaScript?', 'A scripting language that runs in browsers and Node.js to add behaviour to web pages and build applications.'],
            ['F', 'What is the difference between let, const and var?', 'let and const are block scoped (const cannot be reassigned); var is function scoped and hoisted.'],
            ['M', 'What is the event loop?', 'The mechanism that runs callbacks from the task and microtask queues when the call stack is empty, enabling asynchronous behaviour on one thread.'],
            ['M', 'Why prefer === over ==?', '=== compares without type coercion, avoiding surprises like 0 == "" being true.'],
            ['S', 'Why is JavaScript single threaded and how does it scale?', 'One call stack keeps the model simple; concurrency comes from async I/O, workers (Web Workers/worker_threads) and multiple processes.'],
            ['S', 'What is the difference between microtasks and macrotasks?', 'Microtasks (promise callbacks) run right after the current script, before the next macrotask (timers, I/O).']],
        [['First script.',
            r`const name = "Abaji";
let count = 0;
function greet(person) { return "Hello, " + person + "!"; }
count += 1;
console.log(greet(name), count);

// OUTPUT:
// Hello, Abaji! 1`],
            ['Equality surprises.',
                r`console.log(0 == "", 0 === "", null == undefined, null === undefined, NaN === NaN);

// OUTPUT:
// true false true false false`]],
        [['Event loop order.',
            r`console.log("1 start");
setTimeout(() => console.log("4 timeout"), 0);
Promise.resolve().then(() => console.log("3 microtask"));
console.log("2 end");

// OUTPUT:
// 1 start
// 2 end
// 3 microtask
// 4 timeout`],
            ['typeof checks.',
                r`console.log(typeof 42, typeof "x", typeof null, typeof undefined, typeof {}, typeof [], Array.isArray([]));

// OUTPUT:
// number string object undefined object object true`]]
    ),

    'js-functions': x(
        ['A function is reusable code: <code>function add(a, b) { return a + b; }</code> or an arrow function <code>const add = (a, b) =&gt; a + b</code>.',
            'Scope decides where a variable is visible: global, function and block scope.',
            'Functions are values: you can store them in variables, pass them as arguments and return them.'],
        ['Default parameters (<code>function f(x = 1)</code>), rest parameters (<code>...args</code>) and spread calls (<code>f(...list)</code>).',
            'Function declarations are hoisted; function expressions and arrow functions are not usable before definition.',
            'Arrow functions have no own <code>this</code> or <code>arguments</code>.'],
        ['Higher-order functions (map, filter, reduce, custom) enable composition and callbacks.',
            'Pure functions (no side effects) are easier to test and reason about.',
            'Currying, memoization and debouncing are common function patterns in real applications.'],
        [['F', 'What is a function?', 'A reusable block of code that can take inputs (parameters) and return a value.'],
            ['F', 'What is an arrow function?', 'A shorter function syntax that does not have its own this.'],
            ['M', 'What is hoisting?', 'Declarations are processed before execution; function declarations are fully hoisted, var is hoisted as undefined, let/const are in the temporal dead zone.'],
            ['M', 'What are higher-order functions?', 'Functions that take functions as arguments or return functions, such as map and filter.'],
            ['S', 'What is memoization?', 'Caching a pure function result by its arguments so repeated calls are fast.'],
            ['S', 'Debounce vs throttle?', 'Debounce runs after calls stop for a delay; throttle runs at most once per interval.']],
        [['Defaults, rest and spread.',
            r`function total(tax = 0.18, ...prices) { return prices.reduce((s, p) => s + p, 0) * (1 + tax); }
console.log(total(0.1, 100, 50));
const nums = [3, 1, 2];
console.log(Math.max(...nums));

// OUTPUT:
// 165
// 3`],
            ['Higher-order function.',
                r`const multiplyBy = factor => n => n * factor;
const double = multiplyBy(2);
console.log([1, 2, 3].map(double));

// OUTPUT:
// [2, 4, 6]`]],
        [['Memoize.',
            r`function memoize(fn) { const cache = new Map(); return n => cache.has(n) ? cache.get(n) : (cache.set(n, fn(n)), cache.get(n)); }
const slowSquare = n => { console.log("computing", n); return n * n; };
const fast = memoize(slowSquare);
console.log(fast(4), fast(4));

// OUTPUT:
// computing 4
// 16 16`],
            ['Debounce.',
                r`function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
const onType = debounce(q => console.log("search", q), 300);
onType("p"); onType("pe"); onType("pen");

// OUTPUT: (after 300 ms)
// search pen`]]
    ),

    'js-datatypes': x(
        ['Primitive types: <code>number</code>, <code>string</code>, <code>boolean</code>, <code>null</code>, <code>undefined</code>, <code>symbol</code>, <code>bigint</code>. Everything else is an object.',
            'Primitives are copied by value; objects and arrays are copied by reference.',
            'Use <code>typeof</code> to check a type (remember <code>typeof null</code> is "object").'],
        ['Type coercion converts values automatically: <code>"5" * 2</code> is 10, <code>"5" + 2</code> is "52".',
            'Falsy values: <code>false, 0, "", null, undefined, NaN</code>; everything else is truthy.',
            'Number precision: <code>0.1 + 0.2 !== 0.3</code>; use integers (cents) or toFixed/Intl for money.'],
        ['Use <code>Number.isInteger</code>, <code>Number.isNaN</code> and explicit conversion (<code>Number(x)</code>) instead of relying on coercion.',
            'BigInt handles integers beyond 2^53; do not mix it with numbers.',
            'Compare objects by identity; use deep-equality helpers or structuredClone for copies.'],
        [['F', 'Name the primitive types.', 'Number, string, boolean, null, undefined, symbol and bigint.'],
            ['F', 'What does typeof null return?', '"object" (a historical bug).'],
            ['M', 'What are falsy values?', 'false, 0, -0, 0n, "", null, undefined and NaN.'],
            ['M', 'Why does 0.1 + 0.2 not equal 0.3?', 'Numbers are binary floating point, which cannot represent these decimals exactly.'],
            ['S', 'How do you deep copy an object?', 'structuredClone(obj) (or JSON methods for plain data); spread only copies one level.'],
            ['S', 'How should money be handled?', 'As integer minor units (cents) or with a decimal library, formatting with Intl.NumberFormat.']],
        [['Coercion results.',
            r`console.log("5" + 2, "5" - 2, "5" * "2", true + 1, [] + {}, [] == false);

// OUTPUT:
// 52 3 10 2 [object Object] true`],
            ['Copy by reference.',
                r`const a = { n: 1 }; const b = a; b.n = 2;
console.log(a.n);
const c = structuredClone(a); c.n = 3;
console.log(a.n, c.n);

// OUTPUT:
// 2
// 2 3`]],
        [['Safe number handling.',
            r`console.log(0.1 + 0.2, Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON, Number.isNaN("x"), Number.isNaN(NaN));
console.log((1999 / 100).toFixed(2), new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(1999.5));

// OUTPUT:
// 0.30000000000000004 true false true
// 19.99 ₹1,999.50`],
            ['BigInt.',
                r`console.log(2 ** 53 + 1, 2n ** 53n + 1n);

// OUTPUT:
// 9007199254740992 9007199254740993n`]]
    ),

    'js-arrays-methods': x(
        ['An array is an ordered list: <code>const items = [1, 2, 3]</code>. Access by index, <code>length</code> gives the size.',
            'Add and remove: <code>push</code>, <code>pop</code>, <code>shift</code>, <code>unshift</code>, <code>splice</code>.',
            'Transform with <code>map</code>, filter with <code>filter</code>, summarize with <code>reduce</code>, search with <code>find</code>/<code>includes</code>.'],
        ['<code>map/filter/reduce/forEach/some/every/find/sort/flat/flatMap</code> are the everyday tools.',
            '<code>sort</code> mutates and sorts as strings by default; pass a comparator <code>(a, b) =&gt; a - b</code> for numbers.',
            'Non-mutating alternatives: <code>toSorted</code>, <code>toReversed</code>, <code>with</code>, spread copies.'],
        ['Prefer immutable updates (spread, <code>map</code>, <code>filter</code>) especially in React state.',
            'Chaining creates intermediate arrays; for very large data use a single <code>reduce</code> or loops.',
            '<code>Array.from</code>, <code>Set</code> and <code>Map</code> help dedupe and index data efficiently.'],
        [['F', 'How do you add an element to the end?', '<code>arr.push(x)</code>.'],
            ['F', 'What does map return?', 'A new array with each element transformed.'],
            ['M', 'Why does [10, 9, 1].sort() give [1, 10, 9]?', 'The default sort compares elements as strings; use a numeric comparator.'],
            ['M', 'map vs forEach?', 'map returns a new array of results; forEach returns nothing and is used for side effects.'],
            ['S', 'How do you remove duplicates?', '<code>[...new Set(arr)]</code> for primitives; use a Map keyed by id for objects.'],
            ['S', 'How do you group items by a key?', 'With reduce into an object/Map, or Object.groupBy / Map.groupBy in recent runtimes.']],
        [['Pipeline.',
            r`const orders = [{ id: 1, total: 500, status: "PAID" }, { id: 2, total: 120, status: "NEW" }, { id: 3, total: 900, status: "PAID" }];
const paidTotal = orders.filter(o => o.status === "PAID").map(o => o.total).reduce((s, t) => s + t, 0);
console.log(paidTotal);
console.log(orders.find(o => o.total > 800));

// OUTPUT:
// 1400
// { id: 3, total: 900, status: 'PAID' }`],
            ['Sorting numbers.',
                r`const n = [10, 9, 1];
console.log([...n].sort(), [...n].sort((a, b) => a - b));

// OUTPUT:
// [ 1, 10, 9 ] [ 1, 9, 10 ]`]],
        [['Group and dedupe.',
            r`const byStatus = orders.reduce((acc, o) => ((acc[o.status] ??= []).push(o.id), acc), {});
console.log(byStatus, [...new Set([1, 2, 2, 3, 3])]);

// OUTPUT:
// { PAID: [ 1, 3 ], NEW: [ 2 ] } [ 1, 2, 3 ]`],
            ['Immutable updates.',
                r`const list = [1, 2, 3];
const added = [...list, 4], removed = list.filter(x => x !== 2), changed = list.map(x => x === 3 ? 30 : x);
console.log(added, removed, changed, list);

// OUTPUT:
// [1,2,3,4] [1,3] [1,2,30] [1,2,3]`]]
    ),

    'js-objects-methods': x(
        ['An object stores key-value pairs: <code>const user = { name: "Abaji", age: 30 }</code>. Access with <code>user.name</code> or <code>user["name"]</code>.',
            'Methods are functions stored as properties.',
            'Useful helpers: <code>Object.keys</code>, <code>Object.values</code>, <code>Object.entries</code>, <code>Object.assign</code>.'],
        ['Shorthand properties, computed keys <code>{ [key]: value }</code>, spread <code>{ ...a, ...b }</code> for merging.',
            'Optional chaining <code>user?.address?.city</code> and nullish coalescing <code>value ?? "default"</code> handle missing data.',
            '<code>Object.freeze</code> makes an object shallow-immutable; <code>Object.defineProperty</code> controls property behaviour.'],
        ['Objects are mutable references; copy before changing shared data. Use <code>structuredClone</code> for deep copies.',
            'Prefer <code>Map</code> when keys are not strings or order and size matter; prefer plain objects for records.',
            'Prototype chain: objects inherit from their prototype; <code>class</code> is syntax over prototypes.'],
        [['F', 'How do you read a property?', 'With dot notation <code>obj.key</code> or bracket notation <code>obj["key"]</code>.'],
            ['F', 'How do you list the keys of an object?', '<code>Object.keys(obj)</code>.'],
            ['M', 'What does optional chaining do?', 'It returns undefined instead of throwing when a part of the path is null or undefined.'],
            ['M', '|| vs ??', '|| falls back for any falsy value; ?? only for null or undefined.'],
            ['S', 'Shallow vs deep copy?', 'Spread/Object.assign copy one level (nested objects stay shared); structuredClone copies recursively.'],
            ['S', 'Map vs object?', 'Map allows any key type, keeps insertion order, has size and better performance for frequent additions and removals.']],
        [['Spread merge and safe access.',
            r`const defaults = { theme: "light", page: 1 };
const user = { name: "Abaji", settings: { page: 5 } };
const config = { ...defaults, ...user.settings };
console.log(config, user.address?.city ?? "unknown");

// OUTPUT:
// { theme: 'light', page: 5 } unknown`],
            ['Entries and fromEntries.',
                r`const prices = { pen: 10, book: 150 };
const doubled = Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v * 2]));
console.log(doubled);

// OUTPUT:
// { pen: 20, book: 300 }`]],
        [['Shallow copy trap.',
            r`const a = { tags: ["x"] };
const b = { ...a };
b.tags.push("y");
console.log(a.tags);

// OUTPUT:
// [ 'x', 'y' ]`],
            ['Map for counting.',
                r`const counts = new Map();
for (const w of "a b a c a b".split(" ")) counts.set(w, (counts.get(w) ?? 0) + 1);
console.log([...counts]);

// OUTPUT:
// [ [ 'a', 3 ], [ 'b', 2 ], [ 'c', 1 ] ]`]]
    ),

    'js-loops-conditionals': x(
        ['Conditionals: <code>if/else</code>, <code>switch</code> and the ternary <code>cond ? a : b</code>.',
            'Loops: <code>for</code>, <code>while</code>, <code>do...while</code>, <code>for...of</code> (values) and <code>for...in</code> (keys).',
            '<code>break</code> leaves a loop and <code>continue</code> skips to the next iteration.'],
        ['Use <code>for...of</code> for arrays and iterables, <code>Object.entries</code> for objects, and avoid <code>for...in</code> on arrays.',
            'Truthiness drives conditions; be explicit when 0 or "" are valid values.',
            'Short-circuit: <code>a &amp;&amp; b</code>, <code>a || b</code>, <code>a ?? b</code>.'],
        ['Prefer array methods (map/filter/reduce) for transformations and loops for control flow or performance-critical code.',
            'Guard clauses (early returns) reduce nesting and improve readability.',
            'Avoid mutating the collection you iterate over.'],
        [['F', 'Which loop iterates over array values?', '<code>for...of</code>.'],
            ['F', 'How do you leave a loop early?', 'With <code>break</code>.'],
            ['M', 'for...in vs for...of?', 'for...in iterates enumerable property keys; for...of iterates values of an iterable.'],
            ['M', 'When use switch?', 'When comparing one value against many constants; remember break or return to avoid fall-through.'],
            ['S', 'What is a guard clause?', 'An early return for invalid or edge cases that keeps the main logic unnested.'],
            ['S', 'Why avoid async code inside forEach?', 'forEach does not await callbacks; use for...of with await or Promise.all with map.']],
        [['Loops and conditions.',
            r`for (const [i, p] of ["pen", "book", "bag"].entries()) {
  if (i === 1) continue;
  console.log(i, p);
}
const grade = s => s >= 90 ? "A" : s >= 75 ? "B" : "C";
console.log(grade(82));

// OUTPUT:
// 0 pen
// 2 bag
// B`],
            ['Guard clause.',
                r`function shipping(order) {
  if (!order) return 0;
  if (order.total > 1000) return 0;
  return order.express ? 100 : 40;
}
console.log(shipping({ total: 500, express: true }));

// OUTPUT:
// 100`]],
        [['Async in loops.',
            r`for (const id of [1, 2, 3]) { const u = await fetchUser(id); console.log(u.name); }      // sequential
const users = await Promise.all([1, 2, 3].map(fetchUser));                                  // parallel

// OUTPUT:
// sequential awaits one by one; Promise.all runs the three requests together`],
            ['switch with grouped cases.',
                r`function kind(ext) { switch (ext) { case "jpg": case "png": return "image"; case "mp4": return "video"; default: return "other"; } }
console.log(kind("png"), kind("zip"));

// OUTPUT:
// image other`]]
    ),

    'js-closures-deep-dive': x(
        ['A closure is a function that remembers the variables of the scope where it was created, even after that scope has finished.',
            'Classic use: a counter or private state: the inner function keeps access to the outer variable.',
            'The famous trap: <code>var</code> in a loop with <code>setTimeout</code> prints the same value, because all callbacks share one variable.'],
        ['<code>let</code> creates a new binding per loop iteration, which fixes the loop trap; with <code>var</code> use an IIFE or a function that captures the value.',
            'Closures power callbacks, event handlers, memoization, module patterns and React hooks.',
            'Each call of the outer function creates a separate closure with its own variables.'],
        ['Closures keep their captured variables alive; accidentally capturing large objects can cause memory leaks.',
            'Stale closures (a callback seeing old values) are a common React bug; use dependency arrays or functional updates.',
            'Understand lexical scoping: the scope chain is fixed where the function is written, not where it is called.'],
        [['F', 'What is a closure?', 'A function bundled with references to its surrounding variables.'],
            ['F', 'What does this print: for (var i=0;i<3;i++) setTimeout(()=>console.log(i),0)?', '3, 3, 3, because all callbacks share the same var i, which is 3 after the loop.'],
            ['M', 'How do you fix the loop problem?', 'Use let (new binding per iteration) or wrap the body in a function that captures the value.'],
            ['M', 'Give a practical use of closures.', 'Private state (counters), memoization, event handlers and factories such as multiplyBy(factor).'],
            ['S', 'What is a stale closure?', 'A function that captured an old value of a variable, so it keeps using outdated data (common with React effects).'],
            ['S', 'How can closures cause memory leaks?', 'A long-lived closure keeps captured objects reachable; release references or avoid capturing large structures.']],
        [['The loop trap and fixes.',
            r`for (var i = 0; i < 3; i++) setTimeout(() => console.log("var", i), 0);
for (let j = 0; j < 3; j++) setTimeout(() => console.log("let", j), 0);

// OUTPUT:
// var 3
// var 3
// var 3
// let 0
// let 1
// let 2`],
            ['Private state with a closure.',
                r`function makeCounter() { let n = 0; return { inc: () => ++n, get: () => n }; }
const a = makeCounter(), b = makeCounter();
a.inc(); a.inc(); b.inc();
console.log(a.get(), b.get());

// OUTPUT:
// 2 1`]],
        [['IIFE fix for var.',
            r`for (var i = 0; i < 3; i++) { ((k) => setTimeout(() => console.log(k), 0))(i); }

// OUTPUT:
// 0
// 1
// 2`],
            ['Stale closure in a timer.',
                r`let count = 0;
const show = () => console.log("count is", count);
setTimeout(show, 1000);
count = 5;

// OUTPUT:
// count is 5       (the closure reads the variable, not a copy: here fresh; a captured parameter would be stale)`]]
    ),

    'js-dom-manipulation': x(
        ['The DOM is the browser model of the page. JavaScript selects elements and changes them.',
            'Select with <code>document.querySelector</code> / <code>querySelectorAll</code> or <code>getElementById</code>.',
            'Change content with <code>textContent</code>, attributes with <code>setAttribute</code>, classes with <code>classList</code>, styles with <code>style</code>.'],
        ['Create and insert nodes: <code>createElement</code>, <code>append</code>, <code>prepend</code>, <code>remove</code>.',
            'Prefer <code>textContent</code> over <code>innerHTML</code> for user text to avoid XSS.',
            'Batch DOM updates (document fragments or build then insert once) to avoid repeated layout work.'],
        ['Reading layout properties (offsetHeight) after writes forces layout; group reads and writes.',
            'Event delegation: one listener on a parent handles events from many children.',
            'Frameworks (React, Angular) manage the DOM for you with virtual DOM or fine-grained updates; know the raw API for debugging.'],
        [['F', 'How do you find an element?', '<code>document.querySelector("#id")</code> or getElementById.'],
            ['F', 'How do you change text?', 'Set <code>element.textContent</code>.'],
            ['M', 'textContent vs innerHTML?', 'textContent sets plain text safely; innerHTML parses HTML and can introduce XSS if used with untrusted input.'],
            ['M', 'What is event delegation?', 'Attaching one listener to a parent and using event.target to handle clicks on children, including ones added later.'],
            ['S', 'What causes slow DOM updates?', 'Many individual writes causing repeated layout/reflow; batch changes or use fragments and requestAnimationFrame.'],
            ['S', 'How do you prevent XSS when rendering user content?', 'Use textContent or a sanitizer, never innerHTML with raw input, and set a Content Security Policy.']],
        [['Build a list safely.',
            r`const ul = document.querySelector("#products");
const frag = document.createDocumentFragment();
for (const p of ["Pen", "Book"]) { const li = document.createElement("li"); li.textContent = p; li.classList.add("item"); frag.append(li); }
ul.append(frag);

// OUTPUT:
// <ul id="products"><li class="item">Pen</li><li class="item">Book</li></ul>`],
            ['Event delegation.',
                r`ul.addEventListener("click", e => {
  const li = e.target.closest("li");
  if (li) li.classList.toggle("selected");
});

// OUTPUT:
// clicking any current or future li toggles its selected class`]],
        [['XSS example and fix.',
            r`const name = '<img src=x onerror="alert(1)">';
el.innerHTML = name;        // runs the script: unsafe
el.textContent = name;      // shown as text: safe

// OUTPUT:
// the second form displays the markup as plain text`],
            ['Batch reads and writes.',
                r`const heights = items.map(el => el.offsetHeight);        // read all first
items.forEach((el, i) => el.style.height = heights[i] + 10 + "px");   // then write

// OUTPUT:
// one layout pass instead of one per item`]]
    )
};

export const javascript1Deep: Record<string, Deep> = {
    'js-intro': dv(
        [`The JavaScript engine (V8, SpiderMonkey, JavaScriptCore) parses source into an AST, compiles it (interpreter plus optimizing JIT compiler) and runs it on a call stack. Asynchronous work (timers, network, UI events) is handled by the host environment, which queues callbacks. The event loop repeatedly takes the next task when the stack is empty, and drains the microtask queue (promises) after each task.`,
            r`console.log("A");
setTimeout(() => console.log("D (macrotask)"), 0);
queueMicrotask(() => console.log("C (microtask)"));
Promise.resolve().then(() => console.log("C2 (microtask)"));
console.log("B");

// OUTPUT:
// A
// B
// C (microtask)
// C2 (microtask)
// D (macrotask)`],
        [`Ways to run JS: inline script, external file, <code>type="module"</code>, the browser console, Node.js (<code>node file.js</code>), and bundlers/dev servers (Vite). Script loading: <code>defer</code> (after parsing, in order), <code>async</code> (as soon as loaded), module scripts (deferred by default).`,
            r`<script type="module" src="/main.js"></script>
<script defer src="/analytics.js"></script>
// main.js
import { greet } from "./greet.js";
document.querySelector("h1").textContent = greet("Abaji");

// OUTPUT:
// the heading shows the greeting after the document is parsed`],
        [`Common beginner mistakes: using == instead of ===, forgetting that var leaks out of blocks, blocking the main thread with long loops, mutating shared objects, ignoring errors from promises, and not using strict mode or modules. Modules are strict by default.`,
            r`"use strict";
function f() { undeclared = 5; }       // ReferenceError in strict mode (silently global otherwise)
try { f(); } catch (e) { console.log(e.name); }

// OUTPUT:
// ReferenceError`],
        [`Performance basics: do not block the main thread (split long work, use workers), minimize DOM writes, debounce frequent events, load code lazily (dynamic import) and measure with the Performance panel.`,
            r`const worker = new Worker("worker.js");
worker.postMessage(bigArray);
worker.onmessage = e => console.log("sorted", e.data.length);
const { heavy } = await import("./heavy.js");     // loaded only when needed

// OUTPUT:
// sorted 1000000      (UI stayed responsive)`],
        [`Real-world: a small progressive enhancement. The page works without JavaScript, and a script adds a live character counter to a textarea with minimal code.`,
            r`const box = document.querySelector("textarea"), out = document.querySelector("#left");
const update = () => { out.textContent = 200 - box.value.length; };
box.addEventListener("input", update); update();

// OUTPUT:
// typing updates "148" under the textarea`]
    ),

    'js-functions': dv(
        [`A function call creates an execution context with its own scope (variable environment) linked to the outer scope (lexical environment). Name lookups walk this scope chain. Arguments are passed by value (references are copied for objects). Arrow functions do not create their own this or arguments; they capture them from the surrounding scope.`,
            r`const outer = "global";
function a() { const x = "a"; function b() { const y = "b"; console.log(x, y, outer); } b(); }
a();
const obj = { n: 1, regular() { return this.n; }, arrow: () => typeof this };
console.log(obj.regular(), obj.arrow());

// OUTPUT:
// a b global
// 1 undefined`],
        [`Forms: declarations, expressions, arrow functions, immediately invoked functions (IIFE), generators (<code>function*</code>), async functions, methods and constructors. Parameters: defaults, rest, destructuring. Call styles: <code>call</code>, <code>apply</code>, <code>bind</code>.`,
            r`function greet(greeting, punct) { return greeting + ", " + this.name + punct; }
const user = { name: "Abaji" };
console.log(greet.call(user, "Hello", "!"), greet.apply(user, ["Hi", "?"]));
const bound = greet.bind(user, "Hey");
console.log(bound("."));
const total = ({ price, qty = 1 }) => price * qty;
console.log(total({ price: 10 }));

// OUTPUT:
// Hello, Abaji! Hi, Abaji?
// Hey, Abaji.
// 10`],
        [`Mistakes: relying on hoisting, forgetting to return, mutating parameters, arrow functions as object methods (wrong this), callbacks that lose this, and unbounded recursion (stack overflow). Use pure functions and explicit returns.`,
            r`const counter = { n: 0, inc() { setTimeout(function () { this.n++; }, 0); } };      // this is not counter inside the callback
counter.inc();
const counter2 = { n: 0, inc() { setTimeout(() => { this.n++; }, 0); } };            // arrow keeps this

// OUTPUT:
// counter.n stays 0, counter2.n becomes 1`],
        [`Performance: avoid creating functions inside hot loops when not needed, memoize pure expensive functions, debounce or throttle event handlers, and prefer iteration to deep recursion (no guaranteed tail-call optimization).`,
            r`const fib = (() => { const m = new Map(); const f = n => n < 2 ? n : m.get(n) ?? (m.set(n, f(n - 1) + f(n - 2)), m.get(n)); return f; })();
console.time("fib"); console.log(fib(80)); console.timeEnd("fib");

// OUTPUT:
// 23416728348467684
// fib: 0.1 ms`],
        [`Real-world: a throttle for scroll handlers and a retry helper for flaky network calls, both small higher-order functions reused across the app.`,
            r`const throttle = (fn, ms) => { let last = 0; return (...a) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...a); } }; };
const retry = async (fn, times = 3) => { for (let i = 1; ; i++) { try { return await fn(); } catch (e) { if (i === times) throw e; await new Promise(r => setTimeout(r, 100 * i)); } } };
window.addEventListener("scroll", throttle(() => console.log("scroll"), 200));

// OUTPUT:
// at most 5 scroll logs per second`]
    ),

    'js-datatypes': dv(
        [`Primitives are immutable values stored directly; objects are heap-allocated and accessed by reference. Operators coerce types by well-defined rules (ToPrimitive, ToNumber, ToString). Numbers are IEEE-754 doubles, so integers are exact only up to 2^53 - 1. strings are UTF-16 sequences.`,
            r`console.log(Number.MAX_SAFE_INTEGER, 9007199254740993, "😀".length, [..."😀"].length);
console.log(Number("12px"), parseInt("12px"), Number(""), Number(null), Number(undefined), Number("0x10"));

// OUTPUT:
// 9007199254740991 9007199254740992 2 1
// NaN 12 0 0 NaN 16`],
        [`Conversion tools: <code>Number()</code>, <code>parseInt/parseFloat</code>, <code>String()</code>, <code>Boolean()</code>, unary plus, <code>JSON.stringify/parse</code>, <code>Intl</code> formatters, <code>Date</code> and <code>Temporal</code> (new), <code>Symbol</code>, <code>BigInt</code>, typed arrays.`,
            r`console.log(+"42", String(42), Boolean("0"), !!"", JSON.stringify({ a: 1, d: new Date(0) }));
console.log(new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date("2026-05-01T00:00:00Z")));
console.log(10n ** 20n, typeof Symbol("id"));

// OUTPUT:
// 42 42 true false {"a":1,"d":"1970-01-01T00:00:00.000Z"}
// 1 May 2026
// 100000000000000000000n symbol`],
        [`Mistakes: comparing with == across types, NaN checks with ===, dates in local time (off-by-one days), JSON with undefined or functions silently dropped, and mixing BigInt and Number (TypeError). Be explicit about conversions and time zones.`,
            r`console.log(NaN === NaN, Object.is(NaN, NaN), [NaN].includes(NaN), [NaN].indexOf(NaN));
console.log(JSON.stringify({ a: undefined, b: () => 1, c: NaN }));
console.log(1n + 1);

// OUTPUT:
// false true true -1
// {"c":null}
// TypeError: Cannot mix BigInt and other types, use explicit conversions`],
        [`Performance: strings are immutable (use arrays and join for many concatenations in hot code), typed arrays are fast for numeric data, avoid unnecessary conversions in loops, and use Map/Set for lookups instead of arrays.`,
            r`const big = Array.from({ length: 1e6 }, (_, i) => i);
const set = new Set(big);
console.time("array includes"); big.includes(999999); console.timeEnd("array includes");
console.time("set has"); set.has(999999); console.timeEnd("set has");

// OUTPUT:
// array includes: 3.2 ms
// set has: 0.01 ms`],
        [`Real-world: money and dates. Store amounts as integer minor units, format with Intl, and send dates as ISO-8601 UTC strings.`,
            r`const cents = 199950;
const rupees = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(cents / 100);
const iso = new Date(Date.UTC(2026, 4, 1, 10, 0)).toISOString();
console.log(rupees, iso);

// OUTPUT:
// ₹1,999.50 2026-05-01T10:00:00.000Z`]
    ),

    'js-arrays-methods': dv(
        [`Arrays are objects with numeric keys and a length property, optimized by engines into contiguous storage when elements are of the same kind. Methods like push and pop are O(1); shift, unshift and splice move elements and cost O(n). Higher-order methods call your callback once per element and return new arrays (map, filter) or a single result (reduce).`,
            r`const a = [1, 2, 3, 4, 5];
console.log(a.slice(1, 3), a.splice(1, 2), a);
console.log([[1, 2], [3, [4]]].flat(Infinity), [1, 2, 3].flatMap(x => [x, x * 10]));
console.log(a.at(-1), a.findLast(x => x > 1), Array.from({ length: 3 }, (_, i) => i * i));

// OUTPUT:
// [ 2, 3 ] [ 2, 3 ] [ 1, 4, 5 ]
// [ 1, 2, 3, 4 ] [ 1, 10, 2, 20, 3, 30 ]
// 5 5 [ 0, 1, 4 ]`],
        [`Families: mutators (push, pop, splice, sort, reverse, fill), accessors (slice, concat, join, indexOf, includes, at), iterators (forEach, map, filter, reduce, some, every, find, findIndex, flatMap), and modern non-mutating versions (toSorted, toSpliced, toReversed, with).`,
            r`const orders = [{ id: 1, total: 500 }, { id: 2, total: 120 }, { id: 3, total: 900 }];
const sorted = orders.toSorted((a, b) => b.total - a.total);
const updated = orders.with(1, { ...orders[1], total: 130 });
const stats = orders.reduce((s, o) => ({ n: s.n + 1, sum: s.sum + o.total, max: Math.max(s.max, o.total) }), { n: 0, sum: 0, max: 0 });
console.log(sorted.map(o => o.id), updated[1].total, stats);

// OUTPUT:
// [ 3, 1, 2 ] 130 { n: 3, sum: 1520, max: 900 }`],
        [`Mistakes: sort without a comparator, mutating arrays used in React state, forEach with async callbacks, reduce without an initial value on empty arrays (TypeError), and using indexOf for objects. Use immutable patterns and for...of with await.`,
            r`[].reduce((a, b) => a + b);
console.log([1, 2, 3].map(parseInt));
console.log(["b", "a", "C"].sort(), ["b", "a", "C"].sort((x, y) => x.localeCompare(y)));

// OUTPUT:
// TypeError: Reduce of empty array with no initial value
// [ 1, NaN, NaN ]
// [ 'C', 'a', 'b' ] [ 'a', 'b', 'C' ]`],
        [`Performance: chained map/filter create temporary arrays; for very large inputs use one pass (reduce or a loop) or generators. Searching arrays is O(n): use Set/Map for repeated lookups.`,
            r`console.time("chain"); const r1 = big.filter(x => x % 2).map(x => x * 2).slice(0, 10); console.timeEnd("chain");
console.time("single pass"); const r2 = []; for (const x of big) { if (x % 2) { r2.push(x * 2); if (r2.length === 10) break; } } console.timeEnd("single pass");

// OUTPUT:
// chain: 18 ms
// single pass: 0.02 ms`],
        [`Real-world: a table view. Filter by search text, sort by a chosen column, paginate, and compute totals without mutating the source data.`,
            r`const view = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase())).toSorted((a, b) => dir * (a[col] > b[col] ? 1 : -1));
const page = view.slice((p - 1) * size, p * size);
const total = view.reduce((s, r) => s + r.amount, 0);
console.log(page.length, view.length, total);

// OUTPUT:
// 20 134 48200`]
    ),

    'js-objects-methods': dv(
        [`Objects are dynamic collections of properties; each property has a key (string or symbol), a value and attributes (writable, enumerable, configurable). Property lookup walks the prototype chain until found. Spread and Object.assign copy own enumerable properties shallowly; getters and setters are accessor properties.`,
            r`const user = { first: "Abaji", last: "R", get full() { return this.first + " " + this.last; }, set full(v) { [this.first, this.last] = v.split(" "); } };
user.full = "Raoji K";
console.log(user.full, Object.getOwnPropertyDescriptor(user, "first"));
console.log("toString" in user, user.hasOwnProperty("toString"), Object.hasOwn(user, "first"));

// OUTPUT:
// Raoji K { value: 'Raoji', writable: true, enumerable: true, configurable: true }
// true false true`],
        [`Tools: <code>Object.keys/values/entries/fromEntries</code>, <code>Object.freeze/seal</code>, <code>defineProperty</code>, <code>structuredClone</code>, destructuring with renaming and defaults, computed keys, <code>Symbol</code> keys, <code>Proxy</code> and <code>Reflect</code>, <code>WeakMap</code> for private data.`,
            r`const { name: userName = "guest", address: { city } = {} } = { name: undefined, address: { city: "Pune" } };
const key = "price";
const item = { [key]: 10, [key + "WithTax"]: 11.8 };
const frozen = Object.freeze({ a: 1, nested: { b: 2 } });
frozen.a = 99; frozen.nested.b = 3;
console.log(userName, city, item, frozen);

// OUTPUT:
// guest Pune { price: 10, priceWithTax: 11.8 } { a: 1, nested: { b: 3 } }`],
        [`Mistakes: shallow copies of nested data, iterating with for...in (includes inherited keys), using objects as maps with user-controlled keys (prototype pollution via __proto__), and comparing objects with ===. Use Map for dynamic keys, structuredClone for copies and Object.hasOwn.`,
            r`const dict = {};
dict["__proto__"] = { admin: true };
console.log({}.admin, dict.admin);
const safe = new Map(); safe.set("__proto__", 1);
console.log({ a: 1 } === { a: 1 }, JSON.stringify({ a: 1 }) === JSON.stringify({ a: 1 }));

// OUTPUT:
// undefined true      (prototype affected on the plain object)
// false true`],
        [`Performance: objects with stable shapes (same keys in the same order) are fastest; adding and deleting properties dynamically deoptimizes them. Use Map for frequently changing key sets and avoid delete in hot paths.`,
            r`console.time("object"); const o = {}; for (let i = 0; i < 1e6; i++) o["k" + i] = i; for (let i = 0; i < 1e6; i += 2) delete o["k" + i]; console.timeEnd("object");
console.time("map"); const m = new Map(); for (let i = 0; i < 1e6; i++) m.set("k" + i, i); for (let i = 0; i < 1e6; i += 2) m.delete("k" + i); console.timeEnd("map");

// OUTPUT:
// object: 640 ms
// map: 190 ms`],
        [`Real-world: normalizing API data. Convert a list into an id-indexed Map for O(1) lookups and derive related views without duplicating objects.`,
            r`const customers = new Map(customersList.map(c => [c.id, c]));
const withNames = orders.map(o => ({ ...o, customer: customers.get(o.customerId)?.name ?? "unknown" }));
console.log(withNames[0]);

// OUTPUT:
// { id: 1, customerId: 7, total: 500, customer: 'Abaji' }`]
    ),

    'js-loops-conditionals': dv(
        [`Control flow in JavaScript is evaluated by the engine statement by statement. Conditions are converted to booleans by truthiness rules; switch compares with strict equality; loops re-evaluate their condition each iteration. for...of calls the iterator protocol (<code>Symbol.iterator</code>), which is why it works with arrays, strings, Maps, Sets and generators.`,
            r`for (const ch of "héy") console.log(ch);
for (const [k, v] of new Map([["a", 1], ["b", 2]])) console.log(k, v);
function* range(n) { for (let i = 0; i < n; i++) yield i; }
console.log([...range(3)]);

// OUTPUT:
// h
// é
// y
// a 1
// b 2
// [ 0, 1, 2 ]`],
        [`Forms: <code>if/else if</code>, ternary, <code>switch</code>, optional chaining and nullish coalescing as conditional operators, <code>for</code>, <code>while</code>, <code>do...while</code>, <code>for...of</code>, <code>for...in</code>, <code>for await...of</code>, labeled <code>break</code>/<code>continue</code>, and array iteration methods.`,
            r`outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) { if (j === 2) continue outer; if (i === 2) break outer; console.log(i, j); }
}
const level = n => n > 100 ? "high" : n > 10 ? "mid" : "low";
const value = settings?.theme ?? "light";

// OUTPUT:
// 0 0
// 0 1
// 1 0
// 1 1`],
        [`Mistakes: off-by-one in for loops, modifying an array while iterating, assignment (=) instead of comparison in conditions, missing break in switch (fall-through), for...in on arrays, async work in forEach, and infinite loops. Use for...of, guard clauses and explicit comparisons.`,
            r`const items = [1, 2, 3, 4];
for (const x of items) { if (x === 2) items.splice(items.indexOf(x), 1); }      // skips elements
console.log(items);
[1, 2, 3].forEach(async x => { await wait(10); console.log(x); });
console.log("done");

// OUTPUT:
// [ 1, 3, 4 ]
// done           (the awaited logs come later and not in loop order guarantees)`],
        [`Loop performance rarely matters until data is large. Prefer algorithmic improvements (Set lookups, early exit with some/find or break, single pass) over micro-optimizations; avoid nested loops over big lists (O(n²)).`,
            r`const ids = new Set(blocked);
const allowed = users.filter(u => !ids.has(u.id));      // O(n)
// instead of: users.filter(u => !blocked.includes(u.id)) which is O(n * m)

// OUTPUT:
// 1,000,000 users x 10,000 blocked: 12 ms vs 18 s`],
        [`Real-world: process work in batches with a loop and concurrency limit, so the page or server stays responsive and external APIs are not overloaded.`,
            r`async function inBatches(items, size, fn) {
  const results = [];
  for (let i = 0; i < items.length; i += size) results.push(...await Promise.all(items.slice(i, i + size).map(fn)));
  return results;
}
console.log((await inBatches([1, 2, 3, 4, 5], 2, async x => x * 2)).join(","));

// OUTPUT:
// 2,4,6,8,10`]
    ),

    'js-closures-deep-dive': dv(
        [`Each function object stores a hidden [[Environment]] reference to the scope where it was created. When it runs, its new scope links to that environment, so variable lookups can reach outer variables, even if the outer function has returned. The engine keeps the captured environment alive for as long as the closure is reachable.`,
            r`function bankAccount(initial) {
  let balance = initial;                       // captured, not accessible from outside
  return { deposit: n => (balance += n), balance: () => balance };
}
const acct = bankAccount(100);
acct.deposit(50);
console.log(acct.balance(), typeof acct.balance);

// OUTPUT:
// 150 function`],
        [`Closures appear as: factories (<code>makeCounter</code>), module pattern (IIFE with private state), callbacks that capture context, currying and partial application, memoization caches, event handlers, and React hooks (state kept in closures per render). <code>let</code> in loops creates a fresh binding per iteration.`,
            r`const add = a => b => c => a + b + c;
console.log(add(1)(2)(3));
const module = (() => { let secret = 42; return { reveal: () => secret }; })();
const buttons = ["A", "B", "C"].map(label => () => "clicked " + label);
console.log(module.reveal(), buttons[1]());

// OUTPUT:
// 6
// 42 clicked B`],
        [`The loop trap, stale closures and leaks. A closure captures variables, not values, so later changes are visible; but a value copied into a parameter is frozen. In React, an effect that uses state without listing it as a dependency sees an old value. Captured large objects stay in memory while the closure lives.`,
            r`// React: stale closure
function Timer() {
  const [n, setN] = useState(0);
  useEffect(() => { const id = setInterval(() => setN(n + 1), 1000); return () => clearInterval(id); }, []);   // n is always 0 here
  // fix: setN(prev => prev + 1)
}

// OUTPUT:
// the counter shows 1 forever (before the fix)`],
        [`Closures are cheap, but each creates a function object and keeps its environment alive. Creating thousands of closures per render or per item is fine; capturing huge arrays or DOM nodes in long-lived listeners causes leaks. Remove listeners and clear timers when done.`,
            r`function attach(el, bigData) {
  const handler = () => console.log(bigData.length);      // bigData stays alive as long as the listener exists
  el.addEventListener("click", handler);
  return () => el.removeEventListener("click", handler);   // cleanup
}
const off = attach(button, new Array(1e6));
off();

// OUTPUT:
// after off(), bigData can be garbage collected`],
        [`Real-world: a once-only function, a rate limiter and a simple event emitter, all implemented with closures and no classes.`,
            r`const once = fn => { let done = false, result; return (...a) => done ? result : (done = true, result = fn(...a)); };
const init = once(() => { console.log("initializing"); return 42; });
console.log(init(), init());
const emitter = () => { const handlers = {}; return { on: (e, f) => (handlers[e] ??= []).push(f), emit: (e, d) => (handlers[e] ?? []).forEach(f => f(d)) }; };

// OUTPUT:
// initializing
// 42 42`]
    ),

    'js-dom-manipulation': dv(
        [`The browser parses HTML into the DOM tree (nodes), CSS into the CSSOM, combines them into a render tree, performs layout (geometry) and paint (pixels). Changing the DOM can trigger style recalculation, layout and repaint. Reading layout values (offsetWidth, getBoundingClientRect) after writes forces the browser to compute layout immediately (forced reflow).`,
            r`const box = document.querySelector("#box");
box.style.width = "200px";                          // write
const w = box.offsetWidth;                          // read: forces layout now
console.log(w, getComputedStyle(box).display, box.getBoundingClientRect().width);

// OUTPUT:
// 200 block 200`],
        [`APIs: selection (<code>querySelector(All)</code>, <code>closest</code>, <code>matches</code>), creation (<code>createElement</code>, <code>template</code>, <code>cloneNode</code>), insertion (<code>append</code>, <code>before</code>, <code>insertAdjacentHTML</code>), attributes and dataset, classList, events and delegation, <code>IntersectionObserver</code>, <code>MutationObserver</code>, <code>requestAnimationFrame</code>.`,
            r`const tpl = document.querySelector("#row-template");
const row = tpl.content.cloneNode(true);
row.querySelector(".name").textContent = "Abaji";
row.firstElementChild.dataset.id = "7";
document.querySelector("tbody").append(row);
new IntersectionObserver(([e]) => e.isIntersecting && loadMore(), { rootMargin: "200px" }).observe(document.querySelector("#sentinel"));

// OUTPUT:
// a table row for Abaji with data-id="7"; more data loads when the sentinel nears the viewport`],
        [`Mistakes: innerHTML with user input (XSS), adding listeners to every row (use delegation), reading and writing layout in alternating loops (layout thrashing), querying the DOM repeatedly inside loops, and forgetting to remove listeners from removed nodes. Cache references, batch changes and sanitize input.`,
            r`// layout thrashing: read, write, read, write
items.forEach(el => { el.style.width = el.parentNode.offsetWidth / 2 + "px"; });
// batched: read all, then write all
const widths = items.map(el => el.parentNode.offsetWidth);
items.forEach((el, i) => { el.style.width = widths[i] / 2 + "px"; });

// OUTPUT:
// 1000 items: 340 ms vs 12 ms`],
        [`Rendering performance: animate transform and opacity (compositor-friendly), use requestAnimationFrame for visual updates, virtualize long lists, and keep the DOM small. Measure with the browser Performance panel.`,
            r`function animate(el) {
  let x = 0;
  const step = () => { x += 2; el.style.transform = "translateX(" + x + "px)"; if (x < 300) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}

// OUTPUT:
// smooth 60 fps movement without layout work`],
        [`Real-world: an accessible filterable list without a framework. Typing filters rows, the live region announces the count, and event delegation handles row selection.`,
            r`const input = document.querySelector("#filter"), list = document.querySelector("#list"), status = document.querySelector("#status");
input.addEventListener("input", () => {
  let shown = 0;
  for (const li of list.children) { const match = li.textContent.toLowerCase().includes(input.value.toLowerCase()); li.hidden = !match; shown += match; }
  status.textContent = shown + " results";
});

// OUTPUT:
// typing "pe" shows only matching items and announces "2 results"`]
    )
};
