// JavaScript roadmap, part 2: phases 4-8 (scope/closures/this, modern syntax, collections, DOM, asynchronous JavaScript).
import type { SubTopic } from './types';
import { blk, phase, topic } from './jsRoadmapKit';

export const jsRoadmap2: SubTopic[] = [
  phase(4, 'Scope, Hoisting, Closures, this', 'Essential', [
    topic(
      'jsr-scope-hoisting',
      'Scope Chain and Hoisting',
      [
        blk(`<h3>Where a variable is visible</h3>
• <b>Global scope</b>: visible everywhere. <b>Function scope</b>: visible inside the function. <b>Block scope</b> (<code>let</code>/<code>const</code>): visible inside the <code>{ }</code> block.<br>
• When a name is used, JavaScript looks in the current scope, then the enclosing scope, and so on outward to global: the <b>scope chain</b>. Inner scopes can read outer variables, never the reverse.<br>
• An inner variable with the same name <b>shadows</b> the outer one.`,
          `const level = "global";
function outer() {
  const level = "outer";          // shadows the global one
  function inner() {
    return level;                 // finds "outer" first
  }
  return inner();
}
console.log(outer());   // outer
console.log(level);     // global

{
  let hidden = 1;
}
console.log(typeof hidden);   // undefined (block scope)`,
        ),
      ],
      [
        blk(`<h3>Hoisting</h3>
• Before running, the engine registers declarations of the scope ("hoisting"). Function declarations are hoisted completely, so they can be called before the line that defines them.<br>
• <code>var</code> is hoisted and initialised to <code>undefined</code>. <code>let</code>/<code>const</code>/<code>class</code> are hoisted but uninitialised (temporal dead zone).<br>
• Function <b>expressions</b> (including arrows) assigned to a variable follow the variable's rule, not the function rule.`,
          `console.log(sayHi());        // "hi"  (declaration fully hoisted)
function sayHi() { return "hi"; }

console.log(a);              // undefined (var hoisted, not yet assigned)
var a = 5;

try { console.log(b); } catch (e) { console.log(e.name); }  // ReferenceError (TDZ)
let b = 6;

try { notYet(); } catch (e) { console.log(e.name + ": " + e.message); }
var notYet = function () {};  // TypeError: notYet is not a function`,
        ),
      ],
      [
        blk(`<h3>Lexical scope and the execution context</h3>
• JavaScript uses <b>lexical (static) scope</b>: a function's scope is decided by where it is written, not where it is called.<br>
• Each call creates an execution context with a variable environment and a reference to its outer environment; that link is the scope chain.<br>
• Function declarations inside blocks behave differently in strict mode and sloppy mode. Avoid them; use <code>const fn = () => {}</code> in blocks.<br>
• The name of a <code>class</code> or <code>let</code> in a block is private to that block, which makes blocks a lightweight way to avoid polluting the outer scope.`,
          `const x = "global";
function printX() { return x; }

function caller() {
  const x = "local to caller";
  return printX();             // still "global": scope follows where printX was WRITTEN
}
console.log(caller());         // global

var v = 1;
(function () {
  console.log(v);              // undefined: the inner "var v" is hoisted to the top of this function
  var v = 2;
})();`,
        ),
      ],
      [
        ['What is hoisting?', 'The engine processes declarations before executing code. var variables become available as undefined, function declarations are available with their body, and let/const/class exist but throw if accessed before their declaration (temporal dead zone).'],
        ['What is lexical scope?', 'Scope is determined by where code is written in the source. A function resolves free variables in the scope where it was defined, regardless of where it is called.'],
        ['What is variable shadowing?', 'Declaring a variable in an inner scope with the same name as one in an outer scope; the inner one hides the outer within its scope.'],
      ],
    ),
    topic(
      'jsr-closures-patterns',
      'Closures: Practical Patterns',
      [
        blk(`<h3>What is a closure?</h3>
• A closure is a function together with the variables of the scope where it was created. The function keeps access to those variables even after the outer function has returned.<br>
• Every function in JavaScript is a closure; the effect is visible when an inner function is returned or passed elsewhere.<br>
• Closures give you <b>private state</b> without classes.`,
          `function makeCounter() {
  let count = 0;                 // lives on because the returned function uses it
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}
const c1 = makeCounter();
const c2 = makeCounter();
c1.increment(); c1.increment(); c2.increment();
console.log(c1.value(), c2.value());   // 2 1  (separate private state)
console.log(c1.count);                 // undefined (really private)`,
        ),
      ],
      [
        blk(`<h3>Common closure patterns</h3>
• <b>Factory</b>: a function that returns functions configured by its arguments.<br>
• <b>Memoization</b>: cache results in a closed-over <code>Map</code>.<br>
• <b>Once / debounce / throttle</b>: wrap a function with closed-over state (a flag or a timer id).<br>
• <b>Module pattern</b>: an IIFE returning a public API while the rest stays private.`,
          `const multiplier = factor => n => n * factor;
const double = multiplier(2);
console.log(double(21));              // 42

function memoize(fn) {
  const cache = new Map();
  return n => {
    if (cache.has(n)) return cache.get(n);
    const result = fn(n);
    cache.set(n, result);
    return result;
  };
}
const slowSquare = n => { console.log("computing", n); return n * n; };
const fastSquare = memoize(slowSquare);
console.log(fastSquare(9), fastSquare(9));
// OUTPUT:
// computing 9
// 81 81

function once(fn) { let done = false, r; return (...a) => done ? r : (done = true, r = fn(...a)); }
const init = once(() => { console.log("init!"); return 1; });
init(); init();   // prints "init!" one time`,
        ),
      ],
      [
        blk(`<h3>Closure bugs and memory</h3>
• <b>Loop capture</b>: <code>var</code> in a loop shares one variable between all closures; <code>let</code> gives each iteration its own.<br>
• <b>Stale closures</b>: a callback keeps the <em>old</em> value of a variable it captured (a classic React hooks bug). Re-create the callback or read the latest value through a ref.<br>
• <b>Memory</b>: a closure keeps its whole captured scope alive. A long-lived listener that captures a large object prevents it from being garbage-collected until the listener is removed.`,
          `const fns = [];
for (var i = 0; i < 3; i++) fns.push(() => i);
console.log(fns.map(f => f()));        // [3, 3, 3]

const fixed = [];
for (let j = 0; j < 3; j++) fixed.push(() => j);
console.log(fixed.map(f => f()));      // [0, 1, 2]

// Same fix with var: capture the value in a new scope
const iife = [];
for (var k = 0; k < 3; k++) iife.push((n => () => n)(k));
console.log(iife.map(f => f()));       // [0, 1, 2]`,
        ),
      ],
      [
        ['What is a closure and where do you use it?', 'A function bundled with references to its surrounding scope. Use it for private state, factories, memoization, callbacks that need context, debounce/throttle and the module pattern.'],
        ['Why do closures inside a var loop print the same value?', 'All closures share the single function-scoped var. Use let (new binding per iteration) or wrap the body in an IIFE to capture the value.'],
        ['Can closures cause memory leaks?', 'They keep captured variables reachable. If a long-lived reference (an event listener, a timer, a global cache) holds the closure, everything it captured stays in memory until that reference is released.'],
      ],
    ),
    topic(
      'jsr-this-binding',
      'this: The Four Binding Rules',
      [
        blk(`<h3>What is this?</h3>
• <code>this</code> is decided by <b>how a function is called</b>, not where it is written (except for arrow functions).<br>
• Method call <code>obj.fn()</code>: <code>this</code> is <code>obj</code>. Plain call <code>fn()</code>: <code>this</code> is <code>undefined</code> in strict mode (the global object otherwise).<br>
• Constructor call <code>new Fn()</code>: <code>this</code> is the new object.<br>
• Explicit: <code>fn.call(obj, a)</code>, <code>fn.apply(obj, [a])</code>, <code>fn.bind(obj)</code> set <code>this</code> directly.`,
          `"use strict";
const user = {
  name: "Asha",
  hello() { return "Hi " + this.name; },
};
console.log(user.hello());        // Hi Asha

const loose = user.hello;         // detach the method
try { console.log(loose()); } catch (e) { console.log(e.name); }  // TypeError (this is undefined)

function intro(city) { return this.name + " from " + city; }
console.log(intro.call({ name: "Ravi" }, "Pune"));      // Ravi from Pune
console.log(intro.apply({ name: "Sita" }, ["Delhi"]));  // Sita from Delhi
const bound = intro.bind({ name: "Om" });
console.log(bound("Goa"));                              // Om from Goa`,
        ),
      ],
      [
        blk(`<h3>Arrow functions and callbacks</h3>
• Arrow functions have <b>no own <code>this</code></b>: they use the <code>this</code> of the surrounding code (lexical this). Perfect for callbacks inside methods; wrong for object methods and constructors.<br>
• Passing a method as a callback (<code>setTimeout(obj.method, 0)</code>, <code>button.onclick = obj.method</code>) loses its object. Fix with <code>bind</code> or an arrow wrapper.<br>
• In event handlers added with <code>addEventListener</code> and a normal function, <code>this</code> is the element.`,
          `const timer = {
  seconds: 0,
  startBroken() {
    setInterval(function () { this.seconds++; }, 1000);   // this is NOT timer
  },
  startOk() {
    setInterval(() => { this.seconds++; }, 1000);          // arrow: this is timer
  },
};

const counter = {
  count: 0,
  arrowMethod: () => typeof this,        // arrow as a method: this is NOT counter
  normalMethod() { return this.count; },
};
console.log(counter.normalMethod());     // 0`,
        ),
      ],
      [
        blk(`<h3>Binding precedence and edge cases</h3>
• Priority: <code>new</code> beats explicit binding (<code>bind</code>/<code>call</code>), which beats method call, which beats plain call.<br>
• <code>bind</code> returns a function whose <code>this</code> can not be changed again (not even by <code>call</code>).<br>
• Class bodies are strict, so extracting a class method and calling it gives <code>this === undefined</code>. Class fields with arrows (<code>handle = () => {}</code>) bind per instance.<br>
• <code>globalThis</code> is the portable name of the global object (<code>window</code>, <code>self</code>, <code>global</code>).`,
          `function Person(name) { this.name = name; }
const p = new Person("Asha");
console.log(p.name);                     // Asha

function who() { return this && this.id; }
const bound = who.bind({ id: "A" });
console.log(bound.call({ id: "B" }));    // A  (bind wins over call)

class Button {
  label = "Save";
  onClick = () => this.label;            // bound per instance
  onClickPlain() { return this?.label; }
}
const b = new Button();
const { onClick, onClickPlain } = b;
console.log(onClick(), onClickPlain());  // Save undefined`,
        ),
      ],
      [
        ['How is the value of this determined?', 'By the call site: new (new object), call/apply/bind (explicit), obj.method() (the object), plain call (undefined in strict mode, global otherwise). Arrow functions ignore these and use the enclosing this.'],
        ['Difference between call, apply and bind?', 'call and apply invoke immediately; call takes arguments one by one, apply takes an array. bind returns a new function with this (and optional leading arguments) fixed.'],
        ['Why shouldn\'t you use an arrow function as an object method?', 'An arrow has no own this, so inside it this is the surrounding scope\'s this (often undefined or window), not the object.'],
      ],
    ),
  ]),

  phase(5, 'Modern JavaScript and Destructuring', 'Essential', [
    topic(
      'jsr-destructuring-spread',
      'Destructuring, Spread and Rest',
      [
        blk(`<h3>Unpacking values</h3>
• <b>Array destructuring</b> picks by position: <code>const [a, b] = arr</code>. <b>Object destructuring</b> picks by name: <code>const { name, age } = user</code>.<br>
• Rename with <code>{ name: userName }</code>, give defaults with <code>{ role = "guest" }</code>, skip items with commas <code>[, second]</code>.<br>
• <b>Rest</b> (<code>...rest</code>) gathers the remainder; <b>spread</b> (<code>...x</code>) expands an iterable or object into place.`,
          `const [first, , third = "none", ...others] = ["a", "b", undefined, "d", "e"];
console.log(first, third, others);    // a none ["d", "e"]

const user = { id: 7, name: "Asha", address: { city: "Pune" } };
const { name: userName, role = "guest", address: { city } } = user;
console.log(userName, role, city);    // Asha guest Pune

const { id, ...withoutId } = user;
console.log(withoutId);               // { name: "Asha", address: {...} }

const merged = { ...user, name: "Ravi" };   // override one field
const all = [...[1, 2], ...[3, 4]];         // [1, 2, 3, 4]`,
        ),
      ],
      [
        blk(`<h3>Destructuring in parameters and loops</h3>
• Destructure function parameters to document and default an "options object": <code>function connect({ host = "localhost", port = 3306 } = {})</code>.<br>
• Use it in <code>for...of</code> over <code>Object.entries</code> or a Map: <code>for (const [key, value] of map)</code>.<br>
• Swap variables with <code>[a, b] = [b, a]</code>. Return several values from a function as an array or an object and destructure at the call site.`,
          `function connect({ host = "localhost", port = 3306, ssl = false } = {}) {
  return host + ":" + port + (ssl ? " (ssl)" : "");
}
console.log(connect());                          // localhost:3306
console.log(connect({ host: "db.local", ssl: true })); // db.local:3306 (ssl)

const stats = nums => ({ min: Math.min(...nums), max: Math.max(...nums) });
const { min, max } = stats([4, 9, 2]);
console.log(min, max);                           // 2 9

for (const [k, v] of new Map([["a", 1], ["b", 2]])) console.log(k, v);`,
        ),
      ],
      [
        blk(`<h3>Pitfalls</h3>
• Destructuring <code>null</code> or <code>undefined</code> throws a <code>TypeError</code>. Default the source: <code>const { a } = obj ?? {}</code>.<br>
• A default applies only for <code>undefined</code>, not for <code>null</code>.<br>
• Spread makes <b>shallow</b> copies; nested objects are shared. Spreading a large array into function arguments (<code>Math.max(...hugeArray)</code>) can exceed the argument limit.<br>
• Object spread copies only own enumerable properties and drops prototype methods.`,
          `const { a = 1 } = { a: null };
console.log(a);                       // null  (default only for undefined)

try { const { x } = null; } catch (e) { console.log(e.name); }   // TypeError
const { y } = null ?? {};
console.log(y);                       // undefined

class Point { constructor() { this.x = 1; } move() {} }
const copy = { ...new Point() };
console.log(copy.x, typeof copy.move);  // 1 undefined`,
        ),
      ],
      [
        ['What is the difference between spread and rest?', 'Both use ... . Rest collects remaining items into an array or object (in parameters and destructuring targets). Spread expands an iterable or object into individual elements (in calls, array and object literals).'],
        ['When does a destructuring default apply?', 'Only when the value is undefined. null, 0, "" and false do not trigger the default.'],
        ['Is spread a deep copy?', 'No. It copies the top level only; nested objects remain shared references.'],
      ],
    ),
    topic(
      'jsr-modern-syntax',
      'Modern Syntax: Template Literals, Optional Chaining and More',
      [
        blk(`<h3>ES6+ conveniences</h3>
• <b>Template literals</b> for interpolation and multi-line text; <b>arrow functions</b> for short callbacks.<br>
• <b>Default parameters</b>, <b>shorthand properties</b> and <b>computed keys</b> (<code>{ [key]: value }</code>).<br>
• <b>Optional chaining</b> <code>?.</code> and <b>nullish coalescing</b> <code>??</code> (ES2020) remove most defensive <code>if</code> checks.<br>
• <code>Array.prototype.includes</code>, <code>Object.entries</code>, <code>padStart</code>, <code>Promise.allSettled</code>, <code>structuredClone</code>, <code>at()</code>, <code>Object.hasOwn</code>: small additions you will use daily.`,
          `const field = "email";
const form = { [field]: "a@b.com", ["is" + "Valid"]: true };
console.log(form);                    // { email: "a@b.com", isValid: true }

const order = { items: [{ price: 120 }], coupon: null };
console.log(order.items?.[0]?.price);        // 120
console.log(order.coupon?.code ?? "no coupon"); // no coupon

console.log([1, 2, 3].at(-1), Object.hasOwn(order, "items"));  // 3 true`,
        ),
      ],
      [
        blk(`<h3>Symbols, iterators and generators</h3>
• <code>Symbol()</code> creates a unique key, used for hidden properties and well-known protocols (<code>Symbol.iterator</code>).<br>
• An object is <b>iterable</b> when it has a <code>[Symbol.iterator]()</code> method returning <code>{ next() }</code>. Iterables work with <code>for...of</code>, spread and destructuring.<br>
• A <b>generator</b> (<code>function*</code> with <code>yield</code>) writes iterators as straight-line code and produces values lazily.`,
          `function* range(start, end, step = 1) {
  for (let n = start; n < end; n += step) yield n;   // pauses here each time
}
console.log([...range(0, 10, 3)]);    // [0, 3, 6, 9]

const team = {
  members: ["Asha", "Ravi"],
  *[Symbol.iterator]() { yield* this.members; },
};
for (const m of team) console.log(m);

const id = Symbol("id");
const user = { name: "A", [id]: 99 };
console.log(Object.keys(user), user[id]);   // ["name"] 99  (symbol keys are not listed)`,
        ),
      ],
      [
        blk(`<h3>Newer language features worth knowing</h3>
• <b>Private class fields</b> <code>#secret</code> (ES2022), <code>static</code> blocks, top-level <code>await</code> in modules.<br>
• <b>Immutable array methods</b>: <code>toSorted</code>, <code>toReversed</code>, <code>with</code>, <code>findLast</code>, <code>Object.groupBy</code>.<br>
• <b>Logical assignment</b> <code>||= &amp;&amp;= ??=</code> and numeric separators <code>1_000_000</code>.<br>
• Check browser/Node support (caniuse, MDN compat tables) and use a build step (Babel, esbuild, TypeScript) when you must support older runtimes.`,
          `const nums = [3, 1, 2];
const sorted = nums.toSorted();
console.log(nums, sorted);                 // [3, 1, 2] [1, 2, 3]  (original intact)
console.log(nums.findLast(n => n > 1));    // 2
console.log(1_000_000 === 1000000);        // true

const people = [{ n: "A", t: "x" }, { n: "B", t: "y" }, { n: "C", t: "x" }];
console.log(Object.groupBy(people, p => p.t));
// { x: [ {n:"A"}, {n:"C"} ], y: [ {n:"B"} ] }`,
        ),
      ],
      [
        ['What is optional chaining?', 'The ?. operator reads a property or calls a method only if the left side is not null/undefined; otherwise the whole expression becomes undefined without throwing.'],
        ['What is a generator?', 'A function declared with function* that can pause at yield and resume later, returning an iterator. It produces values lazily and is the basis of many async patterns.'],
        ['What makes an object iterable?', 'A [Symbol.iterator]() method that returns an iterator object with a next() method returning { value, done }.'],
      ],
    ),
  ]),

  phase(6, 'Array Methods, Map, Set', 'Essential', [
    topic(
      'jsr-array-methods-hof',
      'Array Methods: map, filter, reduce and Friends',
      [
        blk(`<h3>Transforming arrays without loops</h3>
• <code>map(fn)</code> returns a new array of the same length with each item transformed.<br>
• <code>filter(fn)</code> keeps the items for which <code>fn</code> returns truthy.<br>
• <code>reduce(fn, initial)</code> folds the array into one value (a sum, an object, a new array).<br>
• <code>find</code>/<code>findIndex</code> return the first match; <code>some</code>/<code>every</code> return a boolean; <code>forEach</code> just runs code and returns nothing.`,
          `const products = [
  { name: "Pen", price: 10, stock: 5 },
  { name: "Book", price: 250, stock: 0 },
  { name: "Bag", price: 900, stock: 3 },
];
const names = products.map(p => p.name);                 // ["Pen", "Book", "Bag"]
const inStock = products.filter(p => p.stock > 0);        // Pen, Bag
const total = inStock.reduce((sum, p) => sum + p.price * p.stock, 0);
console.log(names, inStock.length, total);               // ... 2 2750

console.log(products.find(p => p.price > 100).name);      // Book
console.log(products.some(p => p.stock === 0));           // true
console.log(products.every(p => p.price > 5));            // true`,
        ),
      ],
      [
        blk(`<h3>Chaining and reduce as a Swiss-army knife</h3>
• Chain the methods into a readable pipeline: filter, then map, then reduce.<br>
• <code>reduce</code> can group, count, index and flatten. Always pass the initial value; reducing an empty array without one throws.<br>
• <code>flatMap</code> maps and flattens one level in one pass.<br>
• <code>sort</code> and <code>reverse</code> mutate, <code>map</code>/<code>filter</code> do not. Know which is which.`,
          `const words = ["apple", "avocado", "banana", "blueberry", "cherry"];
const byLetter = words.reduce((acc, w) => {
  (acc[w[0]] ||= []).push(w);
  return acc;
}, {});
console.log(byLetter);   // { a: ["apple","avocado"], b: [...], c: ["cherry"] }

const counts = "mississippi".split("").reduce((m, ch) => (m[ch] = (m[ch] || 0) + 1, m), {});
console.log(counts);     // { m: 1, i: 4, s: 4, p: 2 }

const result = [1, 2, 3, 4, 5, 6]
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .reduce((a, b) => a + b, 0);
console.log(result);     // 56

console.log([[1, 2], [3]].flatMap(a => a.map(x => x * 10))); // [10, 20, 30]`,
        ),
      ],
      [
        blk(`<h3>Gotchas and performance</h3>
• <code>["1", "2", "3"].map(parseInt)</code> gives <code>[1, NaN, NaN]</code> because <code>map</code> passes (value, index, array) and <code>parseInt</code> uses the index as the radix. Use <code>map(Number)</code> or an arrow.<br>
• <code>forEach</code> ignores returned values and promises; <code>async</code> callbacks in <code>map</code> return an array of promises (wrap with <code>Promise.all</code>).<br>
• Each chained step creates an intermediate array: for huge data, a single <code>for</code> loop or <code>reduce</code> is faster.<br>
• <code>find</code> stops at the first hit; <code>filter(...)[0]</code> scans everything.`,
          `console.log(["1", "2", "3"].map(parseInt));      // [1, NaN, NaN]
console.log(["1", "2", "3"].map(Number));        // [1, 2, 3]

const ids = [1, 2, 3];
const promises = ids.map(async id => id * 2);
console.log(promises[0] instanceof Promise);     // true
Promise.all(promises).then(console.log);         // [2, 4, 6]

try { [].reduce((a, b) => a + b); } catch (e) { console.log(e.name); } // TypeError`,
        ),
      ],
      [
        ['Difference between map and forEach?', 'map returns a new array of the callback results and is chainable. forEach returns undefined and is used only for side effects.'],
        ['What does reduce do without an initial value?', 'It uses the first element as the accumulator and starts at the second. On an empty array it throws a TypeError, so always provide an initial value.'],
        ['Why does ["1","2","3"].map(parseInt) fail?', 'map calls the callback with (item, index). parseInt treats the index as the radix: parseInt("2", 1) is NaN and parseInt("3", 2) is NaN.'],
      ],
    ),
    topic(
      'jsr-map-weakmap',
      'Map and WeakMap',
      [
        blk(`<h3>Map: a real dictionary</h3>
• <code>new Map()</code> stores key-value pairs where keys can be <b>any value</b> (objects, functions, numbers), remembers insertion order and has a <code>size</code>.<br>
• API: <code>set</code>, <code>get</code>, <code>has</code>, <code>delete</code>, <code>clear</code>, <code>keys</code>, <code>values</code>, <code>entries</code>, <code>forEach</code>. It is iterable with <code>for...of</code>.`,
          `const roles = new Map();
roles.set("asha", "admin").set("ravi", "user");
console.log(roles.get("asha"), roles.has("sita"), roles.size);  // admin false 2

const elementData = new Map();
const btn = { id: "save" };            // object used as a key
elementData.set(btn, { clicks: 0 });
elementData.get(btn).clicks++;
console.log(elementData.get(btn));      // { clicks: 1 }

for (const [k, v] of roles) console.log(k + " -> " + v);
console.log([...roles.keys()]);         // ["asha", "ravi"]`,
        ),
      ],
      [
        blk(`<h3>Map vs Object, and conversions</h3>
• Use a Map for frequent adds/removes, non-string keys, or when you need size and order without extra code. Use an object for fixed records and JSON.<br>
• <code>new Map(Object.entries(obj))</code> and <code>Object.fromEntries(map)</code> convert both ways. Maps do not serialise to JSON directly.<br>
• Map keys compare with SameValueZero: <code>NaN</code> equals <code>NaN</code>, and two identical-looking object literals are different keys.<br>
• A Map is an excellent cache and counter.`,
          `const counts = new Map();
for (const w of "to be or not to be".split(" ")) counts.set(w, (counts.get(w) ?? 0) + 1);
console.log(counts);                        // Map(4) { "to" => 2, "be" => 2, "or" => 1, "not" => 1 }

console.log(JSON.stringify(counts));         // "{}"  (Maps are not serialised!)
console.log(JSON.stringify(Object.fromEntries(counts))); // {"to":2,"be":2,"or":1,"not":1}

const m = new Map([[NaN, "nan"]]);
console.log(m.get(NaN));                     // nan
console.log(new Map([[{}, 1]]).get({}));     // undefined (different object)`,
        ),
      ],
      [
        blk(`<h3>WeakMap and private data</h3>
• A <code>WeakMap</code> holds its keys (objects only) <b>weakly</b>: if nothing else references the key, the entry is garbage-collected. It is not iterable and has no <code>size</code>.<br>
• Use it to attach metadata or caches to objects you do not own (DOM nodes, framework objects) without causing memory leaks.<br>
• It was the classic way to keep private instance data before <code>#private</code> fields.`,
          `const meta = new WeakMap();

function track(node) {
  meta.set(node, { seen: Date.now() });   // no manual cleanup needed
}
let el = { tag: "div" };
track(el);
console.log(meta.has(el));                 // true
el = null;                                 // entry becomes collectable; no leak

const priv = new WeakMap();
class Account {
  constructor(balance) { priv.set(this, { balance }); }
  get balance() { return priv.get(this).balance; }
}
console.log(new Account(500).balance);     // 500`,
        ),
      ],
      [
        ['Map vs Object?', 'Map: any key type, insertion-ordered, size property, better for frequent add/remove, no prototype keys. Object: string/symbol keys, JSON-friendly, literal syntax, best for fixed records.'],
        ['What is a WeakMap used for?', 'Associating data with objects without preventing their garbage collection: metadata caches and private data. Keys must be objects and it cannot be iterated.'],
        ['Can you JSON.stringify a Map?', 'Not directly (it yields {}). Convert first: JSON.stringify([...map]) or Object.fromEntries(map).'],
      ],
    ),
    topic(
      'jsr-set-weakset',
      'Set and WeakSet',
      [
        blk(`<h3>Set: unique values</h3>
• A <code>Set</code> stores each value at most once, keeps insertion order and checks membership in roughly constant time.<br>
• API: <code>add</code>, <code>has</code>, <code>delete</code>, <code>clear</code>, <code>size</code>; iterate with <code>for...of</code> or spread.<br>
• The fastest way to remove duplicates: <code>[...new Set(arr)]</code>.`,
          `const tags = new Set(["js", "css", "js", "html"]);
console.log(tags.size, tags.has("css"));    // 3 true
tags.add("react").delete("css");
console.log([...tags]);                      // ["js", "html", "react"]

const unique = [...new Set([3, 1, 3, 2, 1])];
console.log(unique);                         // [3, 1, 2]

const seen = new Set();
for (const n of [1, 2, 1]) {
  if (seen.has(n)) console.log("duplicate", n);
  seen.add(n);
}`,
        ),
      ],
      [
        blk(`<h3>Set algebra</h3>
• Set operations answer "what do these lists share?" Newer engines provide <code>union</code>, <code>intersection</code>, <code>difference</code>, <code>isSubsetOf</code>; elsewhere write them with <code>filter</code>.<br>
• Use Sets for permission checks, visited-node tracking in graph algorithms and deduplicating IDs.<br>
• Objects inside a Set are compared by reference, so <code>new Set([{a:1},{a:1}]).size</code> is 2.`,
          `const a = new Set([1, 2, 3, 4]);
const b = new Set([3, 4, 5]);

const union = new Set([...a, ...b]);                    // {1,2,3,4,5}
const inter = new Set([...a].filter(x => b.has(x)));    // {3,4}
const diff  = new Set([...a].filter(x => !b.has(x)));   // {1,2}
console.log([...union], [...inter], [...diff]);

console.log(new Set([{ a: 1 }, { a: 1 }]).size);        // 2  (different references)

const visited = new Set();
function dfs(node, graph) {
  if (visited.has(node)) return;
  visited.add(node);
  graph[node].forEach(next => dfs(next, graph));
}
dfs("A", { A: ["B", "C"], B: ["C"], C: ["A"] });
console.log([...visited]);                              // ["A", "B", "C"]`,
        ),
      ],
      [
        blk(`<h3>WeakSet and complexity</h3>
• A <code>WeakSet</code> holds objects weakly: use it to mark objects as "seen" or "processed" without keeping them alive. Not iterable, no size.<br>
• <code>Set#has</code> is O(1) on average, while <code>array.includes</code> is O(n). For repeated membership tests on big lists, convert to a Set once.<br>
• Order of iteration is insertion order, so a Set doubles as an ordered unique list.`,
          `const processed = new WeakSet();
function handle(order) {
  if (processed.has(order)) return "already done";
  processed.add(order);
  return "processed";
}
const o = { id: 1 };
console.log(handle(o), handle(o));          // processed already done

const big = Array.from({ length: 100000 }, (_, i) => i);
const lookup = new Set(big);                // build once
console.time("set");
for (let i = 0; i < 1000; i++) lookup.has(99999);
console.timeEnd("set");                     // far faster than big.includes(99999) in a loop`,
        ),
      ],
      [
        ['How do you remove duplicates from an array?', '[...new Set(arr)] (or Array.from(new Set(arr))). For arrays of objects, dedupe by a key using a Map or Set of the key.'],
        ['Why is Set.has faster than Array.includes?', 'A Set uses a hash table (average O(1) lookup); includes scans the array linearly (O(n)).'],
        ['What is a WeakSet?', 'A set of objects held weakly: it does not stop them being garbage-collected, cannot be iterated and has no size. Useful for tagging objects as processed.'],
      ],
    ),
  ]),

  phase(7, 'DOM Manipulation and Events', 'Essential for browser development', [
    topic(
      'jsr-dom-select-modify',
      'DOM: Selecting and Modifying Elements',
      [
        blk(`<h3>The Document Object Model</h3>
• The browser turns HTML into a tree of objects (the DOM). JavaScript reads and changes that tree to update the page.<br>
• Select: <code>document.querySelector(css)</code> (first match) and <code>querySelectorAll(css)</code> (a static NodeList). <code>getElementById</code> is the fastest for ids.<br>
• Change text with <code>textContent</code>, attributes with <code>setAttribute</code>/<code>dataset</code>, styles with <code>classList.add/remove/toggle</code>.`,
          `<!-- HTML -->
<h1 id="title">Hello</h1>
<ul id="list"><li>One</li><li>Two</li></ul>

// JavaScript
const title = document.getElementById("title");
title.textContent = "Welcome";
title.classList.add("highlight");
title.dataset.page = "home";                 // data-page="home"

const items = document.querySelectorAll("#list li");
items.forEach((li, i) => li.textContent = (i + 1) + ". " + li.textContent);

const link = document.createElement("a");
link.href = "https://example.com";
link.textContent = "Visit";
document.body.append(link);                  // add to the page`,
        ),
      ],
      [
        blk(`<h3>Creating, inserting and removing nodes</h3>
• Create with <code>createElement</code>, insert with <code>append</code>, <code>prepend</code>, <code>before</code>, <code>after</code>, <code>replaceWith</code>; remove with <code>el.remove()</code>.<br>
• Build many nodes in a <code>DocumentFragment</code> and insert once, so the browser re-renders one time.<br>
• <code>innerHTML</code> parses strings as HTML: fast to write but unsafe with user data and it destroys listeners on replaced nodes. Prefer <code>textContent</code> and DOM methods.<br>
• Read layout (<code>offsetHeight</code>, <code>getBoundingClientRect</code>) and write styles in separate batches to avoid layout thrashing.`,
          `const list = document.querySelector("#list");
const frag = document.createDocumentFragment();
["Three", "Four", "Five"].forEach(text => {
  const li = document.createElement("li");
  li.textContent = text;          // safe even if text came from a user
  frag.append(li);
});
list.append(frag);                // one insertion, one re-render

list.firstElementChild.remove();  // removes "One"
list.querySelector("li:last-child").classList.add("last");

// Template-based rendering
const tpl = document.querySelector("#row-template");   // <template id="row-template">
const row = tpl.content.cloneNode(true);
row.querySelector(".name").textContent = "Asha";
list.append(row);`,
        ),
      ],
      [
        blk(`<h3>Live vs static collections and performance</h3>
• <code>getElementsByClassName</code> returns a <b>live</b> HTMLCollection that changes as the DOM changes; <code>querySelectorAll</code> returns a <b>static</b> snapshot. Looping over a live list while adding/removing nodes can cause surprises.<br>
• Reflow (layout) and repaint are expensive. Batch DOM writes, use <code>requestAnimationFrame</code> for visual updates and prefer CSS classes over many inline style writes.<br>
• Avoid reading layout properties right after writing styles inside a loop: the browser must recompute layout each time (layout thrashing).<br>
• <code>MutationObserver</code> watches changes to the tree instead of polling.`,
          `const live = document.getElementsByClassName("item");   // live
const snap = document.querySelectorAll(".item");          // static
document.body.insertAdjacentHTML("beforeend", '<p class="item">new</p>');
console.log(live.length, snap.length);   // live is one larger than snap

// Thrashing: read-write-read-write
const boxes = document.querySelectorAll(".box");
boxes.forEach(b => { b.style.width = b.offsetWidth + 10 + "px"; });   // forces layout each iteration

// Better: read everything first, then write
const widths = [...boxes].map(b => b.offsetWidth);
boxes.forEach((b, i) => { b.style.width = widths[i] + 10 + "px"; });`,
        ),
      ],
      [
        ['Difference between textContent, innerText and innerHTML?', 'textContent sets/reads raw text (fast, safe). innerText is layout-aware (respects CSS visibility, slower). innerHTML parses the string as HTML: powerful but an XSS risk with untrusted input.'],
        ['querySelectorAll vs getElementsByClassName?', 'querySelectorAll accepts any CSS selector and returns a static NodeList. getElementsByClassName returns a live HTMLCollection that updates automatically.'],
        ['How do you avoid slow DOM updates?', 'Batch changes (DocumentFragment, one innerHTML/append), toggle CSS classes instead of many style writes, separate reads from writes and animate with requestAnimationFrame or CSS.'],
      ],
    ),
    topic(
      'jsr-events-delegation',
      'Events: Bubbling, Capturing and Delegation',
      [
        blk(`<h3>Reacting to the user</h3>
• Attach a handler with <code>element.addEventListener("click", handler)</code>; remove it with <code>removeEventListener</code> using the same function reference.<br>
• The handler receives an <b>event object</b>: <code>event.target</code> (what was clicked), <code>event.currentTarget</code> (where the listener is), <code>event.preventDefault()</code> (stop the default action, e.g. form submit or link navigation).<br>
• Common events: <code>click</code>, <code>input</code>, <code>change</code>, <code>submit</code>, <code>keydown</code>, <code>focus</code>, <code>mouseover</code>, <code>DOMContentLoaded</code>.`,
          `const form = document.querySelector("#signup");
form.addEventListener("submit", event => {
  event.preventDefault();                 // stay on the page
  const email = new FormData(form).get("email");
  console.log("Signing up", email);
});

const search = document.querySelector("#q");
search.addEventListener("input", e => console.log("typing:", e.target.value));

document.addEventListener("keydown", e => {
  if (e.key === "Escape") console.log("close dialog");
});`,
        ),
      ],
      [
        blk(`<h3>Bubbling, capturing and delegation</h3>
• An event travels three phases: <b>capture</b> (window down to the target), <b>target</b>, then <b>bubble</b> (target back up). Listeners run in the bubble phase by default.<br>
• <b>Event delegation</b>: attach one listener to a parent and check <code>event.target</code> (use <code>closest()</code>). It handles items added later and saves memory.<br>
• <code>stopPropagation()</code> stops bubbling; use it sparingly because it breaks other listeners and analytics.<br>
• Options: <code>{ once: true }</code>, <code>{ passive: true }</code> (for scroll/touch performance), <code>{ capture: true }</code>.`,
          `const list = document.querySelector("#todo");
list.addEventListener("click", event => {
  const deleteBtn = event.target.closest("button.delete");
  if (!deleteBtn || !list.contains(deleteBtn)) return;
  deleteBtn.closest("li").remove();                       // works for items added later too
});

// Phases demo
outer.addEventListener("click", () => console.log("outer (bubble)"));
outer.addEventListener("click", () => console.log("outer (capture)"), { capture: true });
inner.addEventListener("click", () => console.log("inner"));
// click inner -> outer (capture), inner, outer (bubble)

button.addEventListener("click", () => console.log("only once"), { once: true });`,
        ),
      ],
      [
        blk(`<h3>Custom events, memory and debouncing</h3>
• <code>new CustomEvent("cart:add", { detail: {...}, bubbles: true })</code> plus <code>dispatchEvent</code> decouples components.<br>
• Listeners keep their closure alive. In single-page apps remove listeners (or use <code>AbortController</code>: <code>{ signal }</code>) when a component is torn down.<br>
• <b>Debounce</b> waits until activity stops (search box); <b>throttle</b> limits the rate (scroll, resize).<br>
• Use <code>passive: true</code> on scroll/touch listeners that never call <code>preventDefault</code> so scrolling stays smooth.`,
          `// Custom event
document.addEventListener("cart:add", e => console.log("added", e.detail.sku));
document.dispatchEvent(new CustomEvent("cart:add", { detail: { sku: "A-1" } }));

// Clean up many listeners at once
const controller = new AbortController();
window.addEventListener("resize", onResize, { signal: controller.signal });
window.addEventListener("scroll", onScroll, { signal: controller.signal, passive: true });
// later, when leaving the page/component:
controller.abort();                       // removes both listeners

function debounce(fn, ms) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}
search.addEventListener("input", debounce(e => fetchResults(e.target.value), 300));`,
        ),
      ],
      [
        ['What is event delegation?', 'Putting a single listener on a common ancestor and using event.target to find which child triggered it. It works for dynamically added elements and uses fewer listeners.'],
        ['Difference between event.target and event.currentTarget?', 'target is the innermost element that triggered the event. currentTarget is the element the running listener is attached to.'],
        ['preventDefault vs stopPropagation?', 'preventDefault cancels the browser\'s default action (submit, navigation). stopPropagation stops the event from bubbling to ancestors. They are independent.'],
      ],
    ),
    topic(
      'jsr-dom-observers-forms',
      'Forms, Validation and Observers',
      [
        blk(`<h3>Reading form data</h3>
• <code>new FormData(form)</code> collects all named fields; <code>Object.fromEntries(new FormData(form))</code> gives a plain object.<br>
• The browser validates attributes like <code>required</code>, <code>type="email"</code>, <code>minlength</code>, <code>pattern</code>. Call <code>form.checkValidity()</code> or <code>reportValidity()</code>.<br>
• Always validate again on the server: client-side checks are for user experience only.`,
          `const form = document.querySelector("#register");
form.addEventListener("submit", e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const data = Object.fromEntries(new FormData(form));
  console.log(data);        // { name: "Asha", email: "a@b.com" }
});

const pwd = document.querySelector("#password");
pwd.addEventListener("input", () => {
  pwd.setCustomValidity(pwd.value.length < 8 ? "At least 8 characters" : "");
});`,
        ),
      ],
      [
        blk(`<h3>IntersectionObserver: lazy loading and infinite scroll</h3>
• <code>IntersectionObserver</code> reports when an element enters or leaves the viewport, without scroll handlers.<br>
• Typical uses: lazy-loading images, infinite scroll, "reveal on scroll" animations and analytics for what the user actually saw.<br>
• Call <code>unobserve</code> once you are done with an element.`,
          `const observer = new IntersectionObserver((entries, obs) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const img = entry.target;
    img.src = img.dataset.src;          // load only when near the viewport
    obs.unobserve(img);
  }
}, { rootMargin: "200px" });            // start loading 200px early

document.querySelectorAll("img[data-src]").forEach(img => observer.observe(img));`,
        ),
      ],
      [
        blk(`<h3>MutationObserver, ResizeObserver and DOM safety</h3>
• <code>MutationObserver</code> reports added/removed nodes and attribute changes (watch third-party widgets, implement "wait for element").<br>
• <code>ResizeObserver</code> reports element size changes (responsive components, charts) without polling.<br>
• Sanitise any HTML string you must insert (DOMPurify) and prefer <code>textContent</code>; set <code>rel="noopener noreferrer"</code> on <code>target="_blank"</code> links.`,
          `const target = document.querySelector("#feed");

const mo = new MutationObserver(records => {
  for (const r of records) console.log("added:", r.addedNodes.length);
});
mo.observe(target, { childList: true, subtree: true });

const ro = new ResizeObserver(entries => {
  for (const e of entries) console.log("width:", Math.round(e.contentRect.width));
});
ro.observe(target);

// later: stop watching
// mo.disconnect(); ro.disconnect();`,
        ),
      ],
      [
        ['Why validate on the server if the browser validates forms?', 'Client-side validation can be bypassed (devtools, curl, scripts). It improves UX but only server-side validation protects data integrity and security.'],
        ['What is IntersectionObserver used for?', 'Detecting when elements become visible: lazy loading images, infinite scrolling and scroll-triggered animations, more efficiently than scroll event handlers.'],
        ['How do you read all fields of a form?', 'new FormData(form), then Object.fromEntries(formData) for a plain object (multiple values with the same name need getAll).'],
      ],
    ),
  ]),

  phase(8, 'Promises, async/await, Event Loop', 'Essential', [
    topic(
      'jsr-event-loop',
      'The Event Loop, Call Stack and Task Queues',
      [
        blk(`<h3>One thread, many tasks</h3>
• JavaScript runs your code on a single <b>call stack</b>. Long synchronous work freezes the page because nothing else can run.<br>
• Asynchronous operations (timers, network, events) are handled by the environment (browser/Node); when they finish, their callbacks are queued.<br>
• The <b>event loop</b> pushes a queued callback onto the stack only when the stack is empty.`,
          `console.log("1 start");
setTimeout(() => console.log("3 timeout 0"), 0);
console.log("2 end");
// OUTPUT:
// 1 start
// 2 end
// 3 timeout 0     (runs after the synchronous code finishes)`,
        ),
      ],
      [
        blk(`<h3>Macrotasks and microtasks</h3>
• <b>Macrotasks</b> (task queue): <code>setTimeout</code>, <code>setInterval</code>, I/O, UI events.<br>
• <b>Microtasks</b>: promise callbacks (<code>.then</code>, <code>await</code> continuations), <code>queueMicrotask</code>, <code>MutationObserver</code>.<br>
• After every macrotask, the engine <b>drains the entire microtask queue</b> before the next macrotask (and before rendering). So promise callbacks beat <code>setTimeout(..., 0)</code>.`,
          `console.log("A");
setTimeout(() => console.log("D timeout"), 0);
Promise.resolve().then(() => console.log("C promise"));
queueMicrotask(() => console.log("C2 microtask"));
console.log("B");
// OUTPUT:
// A
// B
// C promise
// C2 microtask
// D timeout`,
        ),
      ],
      [
        blk(`<h3>Starvation and keeping the UI responsive</h3>
• A promise chain that keeps scheduling new microtasks can starve rendering and timers.<br>
• Break heavy computation into chunks (<code>setTimeout</code>, <code>requestIdleCallback</code>, <code>scheduler.yield()</code>) or move it to a <b>Web Worker</b>.<br>
• <code>requestAnimationFrame</code> runs just before the next paint, the right place for visual updates.<br>
• In Node.js the loop has phases (timers, poll, check) and <code>process.nextTick</code> runs before promise microtasks.`,
          `// Freezes the page for the whole loop:
function blocking() { for (let i = 0; i < 3e9; i++) {} }

// Chunked version keeps the UI alive:
function processInChunks(items, work, chunk = 500) {
  let i = 0;
  function run() {
    const end = Math.min(i + chunk, items.length);
    for (; i < end; i++) work(items[i]);
    if (i < items.length) setTimeout(run, 0);   // let the browser breathe
  }
  run();
}

// Or offload completely:
const worker = new Worker("heavy.js");
worker.postMessage({ numbers: [1, 2, 3] });
worker.onmessage = e => console.log("result", e.data);`,
        ),
      ],
      [
        ['Output order: setTimeout 0 vs Promise.then?', 'The promise callback (microtask) runs first because microtasks are drained after the current task, before the next macrotask such as the timeout.'],
        ['Why is JavaScript called single-threaded but non-blocking?', 'One call stack executes JS, but I/O and timers are performed by the host environment and their callbacks are queued and run via the event loop when the stack is empty.'],
        ['What is a microtask?', 'A job queued by promises (then/catch/finally, await), queueMicrotask or MutationObserver, executed right after the current script/task and before the next macrotask or render.'],
      ],
    ),
    topic(
      'jsr-promises-deep',
      'Promises and Combinators',
      [
        blk(`<h3>A promise is a value that arrives later</h3>
• A <code>Promise</code> is in one of three states: <b>pending</b>, <b>fulfilled</b> (with a value) or <b>rejected</b> (with a reason). Once settled it never changes.<br>
• Consume with <code>.then(onFulfilled)</code>, <code>.catch(onRejected)</code>, <code>.finally(cleanup)</code>. Each returns a new promise, enabling <b>chaining</b>.<br>
• Create with <code>new Promise((resolve, reject) => {...})</code>, or <code>Promise.resolve(x)</code> / <code>Promise.reject(err)</code>.`,
          `const wait = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), ms));

wait(500, 21)
  .then(n => n * 2)               // returned value feeds the next .then
  .then(n => { console.log(n); return wait(200, "done"); })   // returned promise is awaited
  .then(console.log)
  .catch(err => console.error("failed", err))
  .finally(() => console.log("cleanup"));
// OUTPUT: 42, done, cleanup`,
        ),
      ],
      [
        blk(`<h3>Running promises together</h3>
• <code>Promise.all([...])</code>: waits for all; rejects as soon as one rejects.<br>
• <code>Promise.allSettled([...])</code>: waits for all and reports each outcome (never rejects).<br>
• <code>Promise.race([...])</code>: settles with the first promise to settle (useful for timeouts). <code>Promise.any([...])</code>: first <em>fulfilled</em> one, rejects only if all fail.<br>
• Run independent requests in parallel with <code>all</code> instead of awaiting them one after another.`,
          `const ok  = wait(100, "A");
const slow = wait(300, "B");
const bad = Promise.reject(new Error("boom"));

Promise.all([ok, slow]).then(v => console.log("all:", v));              // ["A", "B"]
Promise.allSettled([ok, bad]).then(r => console.log(r.map(x => x.status)));  // ["fulfilled","rejected"]
Promise.race([slow, wait(50, "fast")]).then(v => console.log("race:", v));   // fast
Promise.any([bad, ok]).then(v => console.log("any:", v));                // A

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));
Promise.race([wait(1000, "late"), timeout(200)]).catch(e => console.log(e.message)); // timeout`,
        ),
      ],
      [
        blk(`<h3>Error propagation and common mistakes</h3>
• A rejection skips <code>.then</code> handlers until a <code>.catch</code>. A thrown error inside <code>.then</code> becomes a rejection of the returned promise.<br>
• <b>Always return</b> the inner promise inside <code>.then</code>, or the chain will not wait for it.<br>
• Unhandled rejections trigger the <code>unhandledrejection</code> event (and crash Node by default). Every chain needs a final <code>.catch</code>.<br>
• The "promise constructor anti-pattern": do not wrap something that already returns a promise in <code>new Promise</code>.`,
          `Promise.resolve(1)
  .then(n => { throw new Error("bad " + n); })
  .then(() => console.log("skipped"))
  .catch(e => { console.log("caught:", e.message); return "recovered"; })
  .then(v => console.log(v));
// OUTPUT: caught: bad 1, recovered

// Missing return: the chain does not wait
wait(10).then(() => { wait(500, "x").then(console.log); }).then(() => console.log("runs first!"));

window.addEventListener("unhandledrejection", e => {
  console.warn("Unhandled:", e.reason);
});`,
        ),
      ],
      [
        ['Promise.all vs allSettled?', 'all rejects immediately if any promise rejects and returns only fulfilled values otherwise. allSettled always waits for every promise and returns an array of {status, value|reason}.'],
        ['What does .then return?', 'A new promise that resolves with the handler\'s return value (or adopts it if it is a promise) and rejects if the handler throws.'],
        ['How do you implement a timeout for a promise?', 'Promise.race([actual, timeoutPromise]) where timeoutPromise rejects after N ms (and use AbortController to actually cancel a fetch).'],
      ],
    ),
    topic(
      'jsr-async-await-patterns',
      'async/await Patterns: Sequential, Parallel, Retry',
      [
        blk(`<h3>Writing async code that reads like sync code</h3>
• An <code>async</code> function always returns a promise. <code>await</code> pauses <em>that function</em> until the promise settles and gives you the value, without blocking the thread.<br>
• Use <code>try / catch / finally</code> for errors. <code>await</code> works only inside async functions or at the top level of an ES module.`,
          `const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));

async function loadUser(id) {
  try {
    const user = await wait(200, { id, name: "Asha" });
    console.log("loaded", user.name);
    return user;
  } catch (err) {
    console.error("could not load", err);
  } finally {
    console.log("done");
  }
}
loadUser(1).then(u => console.log(u.id));`,
        ),
      ],
      [
        blk(`<h3>Sequential vs parallel</h3>
• Awaiting inside a loop runs the calls <b>one after another</b>. If they are independent, start them all and then <code>await Promise.all</code>.<br>
• <code>forEach(async ...)</code> does not wait. Use <code>for...of</code> with <code>await</code> (sequential) or <code>map</code> + <code>Promise.all</code> (parallel).<br>
• Limit concurrency (e.g. 5 at a time) when firing hundreds of requests so you do not overload the server.`,
          `const fetchItem = id => wait(300, "item" + id);

async function sequential() {              // ~900 ms
  const out = [];
  for (const id of [1, 2, 3]) out.push(await fetchItem(id));
  return out;
}
async function parallel() {                // ~300 ms
  return Promise.all([1, 2, 3].map(fetchItem));
}

console.time("seq"); await sequential(); console.timeEnd("seq");
console.time("par"); await parallel();   console.timeEnd("par");

// Wrong: forEach does not await
[1, 2, 3].forEach(async id => console.log(await fetchItem(id)));
console.log("this prints BEFORE the items");`,
        ),
      ],
      [
        blk(`<h3>Retry, backoff, cancellation and ordering</h3>
• A retry helper with exponential backoff makes flaky networks tolerable. Retry only idempotent requests and only for retryable errors (network, 5xx, 429).<br>
• Cancel obsolete work with <code>AbortController</code> so an old response cannot overwrite a newer one (race condition in search-as-you-type).<br>
• <code>for await (const x of asyncIterable)</code> consumes async streams. Top-level <code>await</code> is allowed in ES modules.`,
          `async function retry(fn, { retries = 3, delay = 200 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try { return await fn(); }
    catch (err) {
      if (attempt >= retries) throw err;
      await wait(delay * 2 ** attempt);        // 200, 400, 800 ms...
    }
  }
}
let calls = 0;
const flaky = async () => { if (++calls < 3) throw new Error("net"); return "ok"; };
retry(flaky).then(console.log);                // ok (after 2 retries)

let current;                                    // latest-wins search
async function search(q) {
  current?.abort();
  current = new AbortController();
  const res = await fetch("/api/search?q=" + encodeURIComponent(q), { signal: current.signal });
  return res.json();
}`,
        ),
      ],
      [
        ['What does an async function return?', 'Always a promise: the returned value becomes its fulfilment value, and a thrown error becomes its rejection.'],
        ['Why is await inside a for loop sometimes slow?', 'Each iteration waits for the previous call, so total time is the sum. For independent calls start them together and await Promise.all.'],
        ['Does await block the main thread?', 'No. It suspends only the async function; the rest of the program and the event loop continue, and the function resumes as a microtask when the promise settles.'],
      ],
    ),
  ]),
];
