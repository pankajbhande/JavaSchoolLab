// JavaScript roadmap, part 1: the roadmap overview and phases 1-3 (fundamentals, control flow and functions, arrays/strings/objects).
import type { SubTopic } from './types';
import { blk, phase, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';

export const jsRoadmap1: SubTopic[] = [
  {
    id: 'jsr-roadmap',
    name: 'JavaScript Roadmap (17 Phases)',
    topics: [
      topic(
        'jsr-roadmap-overview',
        'Learning Roadmap: 17 Phases',
        [
          blk(`<h3>How to use this roadmap</h3>
• The phases below take you from the first variable to production-grade full-stack JavaScript. Each phase is a module in this course, with worked examples and interview questions.<br>
• <b>Essential</b> phases are needed by every JavaScript developer. <b>Important</b> phases make you effective. <b>Optional</b> and <b>Advanced</b> phases depend on your stack.<br>
• Follow the order: later phases assume the earlier ones (closures before async, async before fetch, fetch before React data loading).<br>
<table ${TABLE}>
<tr><th>Phase</th><th>Topics</th><th>Priority</th></tr>
<tr><td>1</td><td>Fundamentals, variables, data types, operators</td><td>Essential</td></tr>
<tr><td>2</td><td>Conditions, loops, functions</td><td>Essential</td></tr>
<tr><td>3</td><td>Arrays, strings, objects</td><td>Essential</td></tr>
<tr><td>4</td><td>Scope, hoisting, closures, <code>this</code></td><td>Essential</td></tr>
<tr><td>5</td><td>Modern JavaScript and destructuring</td><td>Essential</td></tr>
<tr><td>6</td><td>Array methods, Map, Set</td><td>Essential</td></tr>
<tr><td>7</td><td>DOM manipulation and events</td><td>Essential for browser development</td></tr>
<tr><td>8</td><td>Promises, async/await, event loop</td><td>Essential</td></tr>
<tr><td>9</td><td>Fetch API and REST integration</td><td>Essential</td></tr>
<tr><td>10</td><td>Classes, prototypes, OOP</td><td>Important</td></tr>
<tr><td>11</td><td>Modules, error handling, debugging</td><td>Essential</td></tr>
<tr><td>12</td><td>Browser APIs and web storage</td><td>Important</td></tr>
<tr><td>13</td><td>Security and testing</td><td>Essential for production</td></tr>
<tr><td>14</td><td>TypeScript</td><td>Essential for your chosen stack</td></tr>
<tr><td>15</td><td>React</td><td>Essential for your chosen stack</td></tr>
<tr><td>16</td><td>Node.js and Express</td><td>Optional with Spring Boot</td></tr>
<tr><td>17</td><td>Advanced internals and performance</td><td>Advanced</td></tr>
</table>`),
        ],
        [
          blk(`<h3>A realistic study plan</h3>
• Phases 1-3: about 2-3 weeks. Write small programs daily; do not just read.<br>
• Phases 4-6: about 2 weeks. This is where most beginners get stuck, so redo the closure and <code>this</code> examples until you can predict the output.<br>
• Phases 7-9: about 3 weeks. Build a small app that loads data from an API and renders it in the DOM.<br>
• Phases 10-13: about 3 weeks. Turn that app into modules, add error handling and tests.<br>
• Phases 14-17: choose by your stack. With Spring Boot as the back end, TypeScript and React matter more than Node.js and Express.`),
        ],
        [
          blk(`<h3>Checkpoints that show you are ready to move on</h3>
• After phase 3: you can solve array/string problems without looking up syntax.<br>
• After phase 6: you can explain, without notes, why <code>for (var i...)</code> with <code>setTimeout</code> prints the same number.<br>
• After phase 9: you can build a page that fetches, validates, renders and handles failure of a REST call.<br>
• After phase 13: you can explain XSS and CSRF and write a unit test with a mocked dependency.`),
        ],
        [
          ['In what order should JavaScript be learned?', 'Language core first (types, control flow, functions), then scope/closures/this, then modern syntax and collections, then the DOM, then asynchronous code and fetch, then OOP, modules and tooling, and only then frameworks and Node. Each layer depends on the previous one.'],
          ['Which phases are optional if the back end is Spring Boot?', 'Node.js and Express. You still need fetch, TypeScript and a front-end framework, because Spring Boot serves JSON and the browser needs JavaScript to consume it.'],
        ],
      ),
    ],
  },

  phase(1, 'Fundamentals, Variables, Data Types, Operators', 'Essential', [
    topic(
      'jsr-variables',
      'Variables: var, let and const',
      [
        blk(`<h3>Declaring variables</h3>
• A variable is a named container for a value. JavaScript has three keywords: <code>var</code> (old, function-scoped), <code>let</code> (block-scoped, reassignable) and <code>const</code> (block-scoped, cannot be reassigned).<br>
• Use <code>const</code> by default, <code>let</code> when the value must change, and avoid <code>var</code> in new code.<br>
• <code>const</code> prevents <b>re-assignment</b>, not mutation: a <code>const</code> object or array can still have its contents changed.<br>
• Names are case-sensitive, may contain letters, digits, <code>_</code> and <code>$</code>, and cannot start with a digit. Use camelCase for variables and UPPER_SNAKE_CASE for true constants.`,
          `const siteName = "JavaSchoolLab"; // never reassigned
let visitors = 0;                 // changes over time
visitors = visitors + 1;

const user = { name: "Asha" };
user.name = "Ravi";               // allowed: the object is mutated, not re-assigned
// user = {};                     // TypeError: Assignment to constant variable.

console.log(siteName, visitors, user.name);
// OUTPUT: JavaSchoolLab 1 Ravi`,
        ),
      ],
      [
        blk(`<h3>Scope and redeclaration differences</h3>
• <code>var</code> ignores block boundaries (<code>if</code>, <code>for</code>) and can be redeclared; <code>let</code> and <code>const</code> cannot be redeclared in the same scope.<br>
• A <code>let</code>/<code>const</code> variable exists from the start of its block but cannot be touched before its declaration line: that gap is the <b>temporal dead zone</b>.<br>
• A top-level <code>var</code> in a classic script becomes a property of <code>window</code>; <code>let</code>/<code>const</code> do not.`,
          `if (true) {
  var a = 1;
  let b = 2;
}
console.log(a);          // 1  (var leaks out of the block)
console.log(typeof b);   // "undefined"  (b only exists inside the block)

try {
  console.log(c);        // c is in its temporal dead zone
  let c = 3;
} catch (e) {
  console.log(e.name + ": " + e.message);
}
// OUTPUT:
// 1
// undefined
// ReferenceError: Cannot access 'c' before initialization`,
        ),
      ],
      [
        blk(`<h3>Freezing, and what "constant" really means</h3>
• <code>Object.freeze</code> makes an object shallowly immutable. Nested objects stay mutable unless they are frozen too.<br>
• In strict mode, writing to a frozen object throws; in sloppy mode it silently does nothing, which hides bugs. Always use <code>"use strict"</code> or ES modules (which are strict by default).<br>
• Prefer <code>const</code> plus immutable updates (<code>{...obj, x: 1}</code>) over mutating shared objects.`,
          `"use strict";
const config = Object.freeze({ retries: 3, nested: { debug: false } });

try { config.retries = 5; } catch (e) { console.log(e.constructor.name); } // TypeError
config.nested.debug = true;                // allowed: freeze is shallow
console.log(config.retries, config.nested.debug);
// OUTPUT:
// TypeError
// 3 true`,
        ),
      ],
      [
        ['Difference between var, let and const?', 'var is function-scoped, hoisted with value undefined and re-declarable. let and const are block-scoped, live in the temporal dead zone until declared, and cannot be re-declared. const additionally forbids re-assignment (not mutation).'],
        ['Can you change a const array?', 'Yes. const protects the binding, not the value: push, pop and index assignment all work. Re-assigning the variable (arr = []) throws a TypeError.'],
        ['What is the temporal dead zone?', 'The span from the start of a block until a let/const declaration is executed. Reading the variable there throws a ReferenceError, unlike var which would give undefined.'],
      ],
    ),
    topic(
      'jsr-data-types',
      'Data Types and Type Conversion',
      [
        blk(`<h3>The eight types</h3>
• <b>Primitives</b> (immutable, compared by value): <code>string</code>, <code>number</code>, <code>bigint</code>, <code>boolean</code>, <code>undefined</code>, <code>null</code>, <code>symbol</code>.<br>
• <b>Object</b> (compared by reference): plain objects, arrays, functions, dates, maps and so on.<br>
• <code>typeof</code> reports the type as a string. Two famous quirks: <code>typeof null</code> is <code>"object"</code> (a historical bug) and <code>typeof</code> a function is <code>"function"</code>.<br>
• <code>undefined</code> means "no value assigned"; <code>null</code> means "intentionally empty".`,
          `console.log(typeof "hi");        // string
console.log(typeof 42);          // number
console.log(typeof 10n);         // bigint
console.log(typeof true);        // boolean
console.log(typeof undefined);   // undefined
console.log(typeof null);        // object  (quirk)
console.log(typeof Symbol("id"));// symbol
console.log(typeof [1, 2]);      // object
console.log(Array.isArray([1])); // true  (the reliable array check)
console.log(typeof function () {}); // function`,
        ),
      ],
      [
        blk(`<h3>Number precision and conversion</h3>
• Numbers are 64-bit floating point, so <code>0.1 + 0.2</code> is not exactly <code>0.3</code>. Compare with a tolerance or work in integer cents.<br>
• Explicit conversion: <code>Number("42")</code>, <code>parseInt("42px", 10)</code>, <code>String(42)</code>, <code>Boolean("")</code>.<br>
• Implicit coercion happens with <code>+</code> (string concatenation wins if either side is a string) and with <code>==</code>. Other arithmetic operators convert to numbers.<br>
• Falsy values: <code>false, 0, -0, 0n, "", null, undefined, NaN</code>. Everything else is truthy, including <code>"0"</code>, <code>[]</code> and <code>{}</code>.`,
          `console.log(0.1 + 0.2);                 // 0.30000000000000004
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON); // true
console.log("5" + 3);                   // "53"  (concatenation)
console.log("5" - 3);                   // 2     (numeric)
console.log(Number("12px"));            // NaN
console.log(parseInt("12px", 10));      // 12
console.log(Boolean("0"), Boolean([])); // true true
console.log(Number.MAX_SAFE_INTEGER);   // 9007199254740991`,
        ),
      ],
      [
        blk(`<h3>Equality and Object.is</h3>
• <code>===</code> compares without coercion and is what you should use. <code>==</code> applies a long list of coercion rules (<code>null == undefined</code> is true, <code>"1" == 1</code> is true, <code>[] == false</code> is true).<br>
• <code>NaN</code> is the only value not equal to itself; use <code>Number.isNaN(x)</code>, not the global <code>isNaN</code> which coerces first.<br>
• <code>Object.is</code> treats <code>NaN</code> as equal to itself and distinguishes <code>+0</code> from <code>-0</code>.<br>
• Objects are compared by reference: two separate <code>{}</code> are never equal.`,
          `console.log(null == undefined, null === undefined); // true false
console.log("1" == 1, "1" === 1);                    // true false
console.log(NaN === NaN, Number.isNaN(NaN));         // false true
console.log(isNaN("abc"), Number.isNaN("abc"));      // true false
console.log(Object.is(NaN, NaN), Object.is(0, -0));  // true false
console.log({} === {});                              // false

const a = { id: 1 };
const b = a;
console.log(a === b);                                // true (same reference)`,
        ),
      ],
      [
        ['Why is typeof null "object"?', 'An early implementation tagged values by type bits, and null (the null pointer, all zero bits) matched the object tag. It was never fixed for backwards compatibility. Check null with value === null.'],
        ['What is the difference between null and undefined?', 'undefined is the default for a missing value (unassigned variable, missing property, no return). null is an explicit "no value" assigned by the programmer. null == undefined is true, null === undefined is false.'],
        ['Why does 0.1 + 0.2 !== 0.3?', 'Numbers are binary IEEE-754 doubles and 0.1 and 0.2 have no exact binary representation. Use a tolerance (Number.EPSILON) or integer minor units such as paise or cents.'],
      ],
    ),
    topic(
      'jsr-operators',
      'Operators',
      [
        blk(`<h3>Everyday operators</h3>
• Arithmetic: <code>+ - * / % **</code> (<code>%</code> is remainder, <code>**</code> is exponent).<br>
• Assignment: <code>= += -= *= /= %= **=</code>, plus the logical forms <code>&&= ||= ??=</code>.<br>
• Comparison: <code>=== !== &lt; &gt; &lt;= &gt;=</code>. Logical: <code>&amp;&amp;</code> (and), <code>||</code> (or), <code>!</code> (not).<br>
• Increment and decrement: <code>i++</code> returns the old value, <code>++i</code> returns the new one.`,
          `let x = 10;
x += 5;            // 15
x **= 2;           // 225
console.log(x % 7); // 1
console.log(2 ** 10); // 1024

let i = 5;
console.log(i++);  // 5  (then i becomes 6)
console.log(++i);  // 7
// OUTPUT:
// 1
// 1024
// 5
// 7`,
        ),
      ],
      [
        blk(`<h3>Short-circuit, nullish coalescing and optional chaining</h3>
• <code>a || b</code> returns the first truthy operand; <code>a &amp;&amp; b</code> returns the first falsy one. Both return an operand, not a boolean.<br>
• <code>a ?? b</code> falls back only when <code>a</code> is <code>null</code> or <code>undefined</code>, so <code>0</code>, <code>""</code> and <code>false</code> are kept. Prefer it over <code>||</code> for defaults.<br>
• <code>obj?.a?.b</code> stops and returns <code>undefined</code> if any link is nullish, instead of throwing.<br>
• <code>??=</code> assigns only when the target is nullish.`,
          `const settings = { volume: 0, theme: "" , user: null };

console.log(settings.volume || 50);  // 50   (0 is falsy: probably a bug)
console.log(settings.volume ?? 50);  // 0    (0 is a real value)
console.log(settings.theme  ?? "dark"); // "" (kept)

console.log(settings.user?.profile?.city);   // undefined, no TypeError
console.log(settings.save?.());              // undefined, method missing

settings.language ??= "en";
console.log(settings.language);              // en`,
        ),
      ],
      [
        blk(`<h3>Precedence, spread of operands and bitwise tricks</h3>
• Precedence (high to low, simplified): <code>()</code> then <code>!</code>/unary then <code>**</code> then <code>* / %</code> then <code>+ -</code> then comparisons then <code>===</code> then <code>&amp;&amp;</code> then <code>||</code>/<code>??</code> then ternary then assignment. When unsure, add parentheses.<br>
• <code>??</code> cannot be mixed with <code>||</code> or <code>&amp;&amp;</code> without parentheses (a SyntaxError), which prevents ambiguity.<br>
• Bitwise operators work on 32-bit integers: <code>x | 0</code> truncates, <code>x &amp; 1</code> tests odd, <code>1 &lt;&lt; n</code> is 2^n. Use them for flags, not as a replacement for <code>Math.floor</code> on large numbers.`,
          `console.log(2 + 3 * 4 ** 2);      // 50
console.log((2 + 3) * 4);         // 20
console.log(true || false && false); // true  (&& binds tighter)

const READ = 1, WRITE = 2, EXEC = 4;
let perm = READ | WRITE;          // 3
console.log((perm & WRITE) !== 0); // true  (has WRITE)
perm &= ~WRITE;                    // remove WRITE
console.log(perm);                 // 1
console.log(7.9 | 0, -7.9 | 0);    // 7 -7  (truncation toward zero)`,
        ),
      ],
      [
        ['Difference between || and ??', '|| falls back for any falsy left side (0, "", false, NaN, null, undefined). ?? falls back only for null or undefined, so legitimate falsy values are preserved.'],
        ['What does optional chaining return when a link is missing?', 'undefined, and the rest of the chain is skipped (short-circuited). It never creates the missing property.'],
        ['Difference between i++ and ++i?', 'Postfix i++ evaluates to the old value then increments; prefix ++i increments then evaluates to the new value. They differ only when the expression result is used.'],
      ],
    ),
  ]),

  phase(2, 'Conditions, Loops, Functions', 'Essential', [
    topic(
      'jsr-conditions',
      'Conditions: if, switch and the Ternary',
      [
        blk(`<h3>Making decisions</h3>
• <code>if / else if / else</code> runs the first branch whose condition is truthy.<br>
• The ternary <code>cond ? a : b</code> is an expression; use it for simple value choices, not for side effects.<br>
• <code>switch</code> compares with <code>===</code>. Each <code>case</code> must end with <code>break</code> (or <code>return</code>) or execution falls through into the next case.`,
          `function grade(score) {
  if (score >= 90) return "A";
  else if (score >= 75) return "B";
  else if (score >= 50) return "C";
  return "F";
}
console.log(grade(82)); // B

const age = 20;
const label = age >= 18 ? "adult" : "minor";
console.log(label);     // adult

function dayType(d) {
  switch (d) {
    case "Sat":
    case "Sun":
      return "weekend";   // grouped cases share a result
    default:
      return "weekday";
  }
}
console.log(dayType("Sun")); // weekend`,
        ),
      ],
      [
        blk(`<h3>Guard clauses and lookup tables</h3>
• Deeply nested <code>if</code> blocks are hard to read. Handle the invalid cases first and <code>return</code> early (guard clauses).<br>
• A long <code>switch</code> or <code>else if</code> chain that only maps a key to a value is better as an object or <code>Map</code> lookup.<br>
• <code>switch(true)</code> works for ranges but is usually clearer as an <code>if</code> chain.`,
          `// Guard clauses instead of nesting
function withdraw(balance, amount) {
  if (typeof amount !== "number" || amount <= 0) return "Invalid amount";
  if (amount > balance) return "Insufficient funds";
  return "OK, new balance " + (balance - amount);
}
console.log(withdraw(500, 200)); // OK, new balance 300
console.log(withdraw(500, 900)); // Insufficient funds

// Lookup table instead of switch
const statusText = { 200: "OK", 404: "Not Found", 500: "Server Error" };
console.log(statusText[404] ?? "Unknown"); // Not Found`,
        ),
      ],
      [
        blk(`<h3>Truthiness traps and switch fall-through</h3>
• <code>if (arr.length)</code> is the idiom for "not empty", but <code>if (arr)</code> is true even for <code>[]</code>.<br>
• <code>if (value)</code> rejects <code>0</code> and <code>""</code> which may be valid input. Test explicitly: <code>value !== undefined &amp;&amp; value !== null</code>.<br>
• A <code>switch</code> without <code>break</code> keeps running the next case body even if its test fails. Lint rules (<code>no-fallthrough</code>) catch this.`,
          `function describe(n) {
  switch (n) {
    case 1: console.log("one");     // forgot break
    case 2: console.log("two"); break;
    default: console.log("other");
  }
}
describe(1);
// OUTPUT:
// one
// two      <- fell through from case 1

console.log(Boolean([]), Boolean([].length)); // true false`,
        ),
      ],
      [
        ['What happens if you omit break in a switch case?', 'Execution falls through into the next case body regardless of its label, until a break, return or the end of the switch. It is occasionally used on purpose for grouped cases.'],
        ['Does switch use == or ===?', 'Strict equality (===). switch("1") does not match case 1.'],
        ['When is a lookup object better than switch?', 'When the branches only map a key to a value. It is shorter, data-driven and easy to extend; a switch is better when each branch runs different logic.'],
      ],
    ),
    topic(
      'jsr-loops',
      'Loops: for, while, for...of and for...in',
      [
        blk(`<h3>Repeating work</h3>
• <code>for (init; test; update)</code> is the classic counted loop; <code>while</code> tests before each pass; <code>do...while</code> runs at least once.<br>
• <code>for...of</code> iterates the <b>values</b> of any iterable (arrays, strings, Maps, Sets).<br>
• <code>for...in</code> iterates the enumerable <b>keys</b> of an object. Do not use it on arrays.<br>
• <code>break</code> leaves the loop; <code>continue</code> skips to the next pass.`,
          `for (let i = 1; i <= 3; i++) console.log("round", i);

const fruits = ["apple", "banana", "mango"];
for (const f of fruits) console.log(f);          // values

const person = { name: "Asha", city: "Pune" };
for (const key in person) console.log(key + "=" + person[key]); // keys

let n = 3;
while (n > 0) { console.log(n--); }              // 3 2 1`,
        ),
      ],
      [
        blk(`<h3>Choosing the right loop</h3>
• Need the index too? <code>for (const [i, v] of arr.entries())</code>.<br>
• Iterate an object's own data with <code>Object.entries(obj)</code> and <code>for...of</code>, which avoids inherited keys that <code>for...in</code> would include.<br>
• <code>forEach</code> cannot be stopped with <code>break</code> and does not wait for <code>await</code> in its callback. Use <code>for...of</code> when you need either.<br>
• Labels (<code>outer:</code>) let <code>break</code>/<code>continue</code> target an outer loop.`,
          `const scores = { math: 90, sci: 72, art: 85 };
for (const [subject, mark] of Object.entries(scores)) {
  console.log(subject + ": " + mark);
}

for (const [i, v] of ["a", "b"].entries()) console.log(i, v);

outer:
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 3; c++) {
    if (r * c === 2) break outer;     // leaves BOTH loops
    console.log(r, c);
  }
}`,
        ),
      ],
      [
        blk(`<h3>Loop pitfalls</h3>
• <b>Infinite loops</b>: a missing update or a condition that never becomes false. Always make sure the loop variable moves toward the exit.<br>
• <b>Closures in loops</b>: <code>let</code> creates a fresh binding per iteration; <code>var</code> shares one binding (see the closure phase).<br>
• <b>Modifying while iterating</b>: removing items from an array inside <code>for...of</code> skips elements. Iterate a copy or build a new array with <code>filter</code>.<br>
• <b>Sparse arrays</b>: <code>for...in</code> and <code>forEach</code> skip holes, <code>for...of</code> visits them as <code>undefined</code>.`,
          `const nums = [2, 4, 6, 8];
for (let i = 0; i < nums.length; i++) {
  if (nums[i] % 2 === 0) nums.splice(i, 1);   // BUG: removing shifts the next item into slot i
}
console.log(nums);  // [4, 8]  (4 and 8 were skipped)
// Correct approach:
const odds = [1, 2, 3, 4, 5, 6].filter(n => n % 2 !== 0);
console.log(odds);  // [1, 3, 5]

for (var i = 0; i < 3; i++) setTimeout(() => console.log("var", i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log("let", j)); // 0 1 2`,
        ),
      ],
      [
        ['Difference between for...of and for...in?', 'for...of iterates the values of an iterable. for...in iterates enumerable string keys of an object, including inherited ones, so it is meant for plain objects, not arrays.'],
        ['Can you break out of forEach?', 'No. break/continue are not allowed in the callback and return only ends that one call. Use for...of, some() or every() instead.'],
        ['Why does a for loop with var and setTimeout print the same number?', 'var has one function-scoped binding shared by all callbacks. By the time the timers fire the loop has finished and the variable holds its final value. let creates a new binding per iteration.'],
      ],
    ),
    topic(
      'jsr-functions-core',
      'Functions: Parameters, Return Values and Callbacks',
      [
        blk(`<h3>Writing functions</h3>
• A function groups reusable logic. It receives <b>parameters</b>, and the caller passes <b>arguments</b>. Without a <code>return</code> it returns <code>undefined</code>.<br>
• <b>Default parameters</b> fill in missing arguments: <code>function greet(name = "guest")</code>.<br>
• <b>Rest parameters</b> collect extra arguments into a real array: <code>function sum(...nums)</code>.<br>
• Functions are values: store them in variables, pass them as arguments (callbacks) and return them.`,
          `function greet(name = "guest", greeting = "Hello") {
  return greeting + ", " + name + "!";
}
console.log(greet());               // Hello, guest!
console.log(greet("Asha", "Hi"));   // Hi, Asha!

function sum(...nums) {
  let total = 0;
  for (const n of nums) total += n;
  return total;
}
console.log(sum(1, 2, 3, 4));       // 10

function repeat(times, action) {    // action is a callback
  for (let i = 0; i < times; i++) action(i);
}
repeat(3, i => console.log("tick", i));`,
        ),
      ],
      [
        blk(`<h3>Pure functions, side effects and IIFEs</h3>
• A <b>pure function</b> returns the same output for the same input and changes nothing outside itself. Pure functions are easy to test and reason about.<br>
• A <b>side effect</b> is anything observable besides the return value: mutating an argument, writing to a variable outside, logging, network calls. Keep them at the edges of the program.<br>
• Arguments that are objects are passed by <b>sharing the reference</b>: mutating the parameter mutates the caller's object.<br>
• An <b>IIFE</b> (immediately invoked function expression) runs once and creates a private scope.`,
          `function addItemImpure(cart, item) { cart.push(item); return cart; }   // mutates the caller's array
function addItemPure(cart, item) { return [...cart, item]; }            // returns a new array

const cart = ["pen"];
addItemPure(cart, "book");
console.log(cart);                 // ["pen"]  (unchanged)
addItemImpure(cart, "book");
console.log(cart);                 // ["pen", "book"]  (changed!)

const counter = (function () {
  let count = 0;                   // private, not reachable from outside
  return () => ++count;
})();
console.log(counter(), counter()); // 1 2`,
        ),
      ],
      [
        blk(`<h3>Function internals worth knowing</h3>
• Every function has a <code>name</code> and a <code>length</code> (the number of parameters before the first default or rest parameter).<br>
• The old <code>arguments</code> object is array-like and absent from arrow functions. Prefer rest parameters.<br>
• Parameter defaults are evaluated at call time, in their own scope, and can reference earlier parameters.<br>
• Currying and partial application build specialised functions from general ones; composition chains small functions into pipelines.<br>
• Recursion needs a base case; very deep recursion throws <code>RangeError: Maximum call stack size exceeded</code>. Convert to a loop when depth is unbounded.`,
          `function f(a, b = 2, ...rest) {}
console.log(f.length, f.name);      // 1 "f"

const curry = a => b => c => a + b + c;
console.log(curry(1)(2)(3));         // 6

const compose = (...fns) => x => fns.reduceRight((v, fn) => fn(v), x);
const trim = s => s.trim();
const shout = s => s.toUpperCase() + "!";
console.log(compose(shout, trim)("  hello "));   // HELLO!

function factorial(n) { return n <= 1 ? 1 : n * factorial(n - 1); }
console.log(factorial(5));           // 120`,
        ),
      ],
      [
        ['Difference between parameters and arguments?', 'Parameters are the names in the function definition. Arguments are the actual values supplied when calling it.'],
        ['What is a pure function and why prefer it?', 'It always returns the same result for the same inputs and has no side effects. That makes it predictable, cacheable and trivial to unit test.'],
        ['Are objects passed by value or by reference?', 'JavaScript always passes by value, but the value of an object variable is a reference. So mutating the object through the parameter is visible to the caller, while re-assigning the parameter is not.'],
      ],
    ),
  ]),

  phase(3, 'Arrays, Strings, Objects', 'Essential', [
    topic(
      'jsr-arrays-core',
      'Arrays: Creating, Reading and Changing',
      [
        blk(`<h3>Array basics</h3>
• An array is an ordered, zero-indexed list that can hold any mix of values. <code>length</code> is always one more than the highest index.<br>
• Add/remove at the end: <code>push</code>/<code>pop</code>. At the start: <code>unshift</code>/<code>shift</code> (slower, they re-index).<br>
• <code>slice(start, end)</code> copies a section without changing the original. <code>splice(start, count, ...items)</code> removes/inserts <b>in place</b>.<br>
• Modern accessors: <code>at(-1)</code> reads from the end; <code>includes</code> tests membership; <code>indexOf</code> finds a position.`,
          `const langs = ["Java", "JS"];
langs.push("Python");          // ["Java", "JS", "Python"]
langs.unshift("C");            // ["C", "Java", "JS", "Python"]
console.log(langs.at(-1));     // Python
console.log(langs.indexOf("JS"), langs.includes("Go")); // 2 false

const part = langs.slice(1, 3);       // ["Java", "JS"]  original untouched
langs.splice(1, 1, "Kotlin", "Go");   // replaces "Java" with two items
console.log(langs);   // ["C", "Kotlin", "Go", "JS", "Python"]`,
        ),
      ],
      [
        blk(`<h3>Copying, sorting and the mutation trap</h3>
• Assignment copies the <b>reference</b>: <code>const b = a</code> makes both names point at one array. Use <code>[...a]</code> or <code>a.slice()</code> for a shallow copy and <code>structuredClone(a)</code> for a deep copy.<br>
• <code>sort()</code> mutates and compares as <b>strings</b> by default. Always pass a comparator for numbers.<br>
• Newer non-mutating twins: <code>toSorted</code>, <code>toReversed</code>, <code>toSpliced</code>, <code>with</code> (ES2023).<br>
• Build arrays with <code>Array.from({length: 3}, (_, i) => i)</code>; avoid <code>new Array(3)</code>, which creates holes.`,
          `const nums = [10, 9, 1, 100];
console.log([...nums].sort());               // [1, 10, 100, 9]  (string order!)
console.log([...nums].sort((a, b) => a - b)); // [1, 9, 10, 100]

const a = [1, 2];
const b = a;                 // same array
b.push(3);
console.log(a);              // [1, 2, 3]

const copy = [...a];
copy.push(4);
console.log(a, copy);        // [1, 2, 3] [1, 2, 3, 4]
console.log(Array.from({ length: 4 }, (_, i) => i * i)); // [0, 1, 4, 9]`,
        ),
      ],
      [
        blk(`<h3>Shallow vs deep copy, and flat structures</h3>
• Spread and <code>slice</code> copy only the first level. Nested arrays/objects are still shared between the copies.<br>
• <code>structuredClone</code> deep-copies plain data, Dates, Maps and Sets but throws on functions. <code>JSON.parse(JSON.stringify(x))</code> drops <code>undefined</code>, functions and Dates (turns them into strings).<br>
• <code>flat(depth)</code> and <code>flatMap</code> flatten nested arrays; destructuring swaps values without a temp variable.<br>
• Arrays are objects: extra properties and holes are possible, and <code>typeof []</code> is <code>"object"</code>.`,
          `const grid = [[1, 2], [3, 4]];
const shallow = [...grid];
shallow[0].push(99);
console.log(grid[0]);            // [1, 2, 99]  (inner array shared)

const deep = structuredClone(grid);
deep[1].push(7);
console.log(grid[1]);            // [3, 4]  (unaffected)

console.log([1, [2, [3, [4]]]].flat(Infinity));   // [1, 2, 3, 4]
let p = 1, q = 2;
[p, q] = [q, p];
console.log(p, q);               // 2 1`,
        ),
      ],
      [
        ['Why does [10, 9, 1].sort() give [1, 10, 9]?', 'Without a comparator sort converts items to strings and orders them by UTF-16 code units, so "10" comes before "9". Pass (a, b) => a - b for numbers.'],
        ['How do you copy an array?', 'Shallow: [...arr] or arr.slice(). Deep: structuredClone(arr). A plain assignment only copies the reference.'],
        ['Difference between slice and splice?', 'slice returns a copy of a range and leaves the original alone. splice removes/inserts elements in the original array and returns the removed items.'],
      ],
    ),
    topic(
      'jsr-strings-core',
      'Strings: Methods, Searching and Formatting',
      [
        blk(`<h3>Working with text</h3>
• Strings are immutable: every method returns a new string.<br>
• Common methods: <code>length</code>, <code>toUpperCase</code>, <code>toLowerCase</code>, <code>trim</code>, <code>slice</code>, <code>includes</code>, <code>startsWith</code>, <code>endsWith</code>, <code>indexOf</code>, <code>replace</code>/<code>replaceAll</code>, <code>split</code>, <code>padStart</code>, <code>repeat</code>.<br>
• <b>Template literals</b> use backticks, allow <code>\${expression}</code> interpolation and multi-line text.`,
          `const s = "  JavaScript Rocks  ";
console.log(s.trim().toUpperCase());        // JAVASCRIPT ROCKS
console.log(s.trim().slice(0, 4));          // Java
console.log("a-b-c".split("-"));            // ["a", "b", "c"]
console.log("2".padStart(3, "0"));          // 002
console.log("ha".repeat(3));                // hahaha
console.log("x.y.z".replaceAll(".", "/"));  // x/y/z

const name = "Asha", n = 3;
console.log(\`\${name} has \${n * 2} items\`); // Asha has 6 items`,
        ),
      ],
      [
        blk(`<h3>Regular expressions and comparison</h3>
• <code>replace</code> with a string only changes the <b>first</b> match; use a regex with the <code>g</code> flag or <code>replaceAll</code>.<br>
• <code>match</code>, <code>matchAll</code>, <code>test</code> and named groups extract structured text.<br>
• Compare strings with <code>localeCompare</code> for human-correct ordering (accents, case) and <code>Intl</code> for locale-aware formatting.<br>
• Characters outside the Basic Multilingual Plane (emoji) are two UTF-16 units, so <code>"😀".length</code> is 2. Use <code>[...str]</code> or <code>Array.from</code> to count code points.`,
          `console.log("a.b.c".replace(".", "-"));      // a-b.c  (first only)
console.log("a.b.c".replace(/\\./g, "-"));    // a-b-c

const m = "Order #4821 on 2026-10-19".match(/#(?<id>\\d+) on (?<date>[\\d-]+)/);
console.log(m.groups.id, m.groups.date);     // 4821 2026-10-19

console.log(["b", "a", "C"].sort());                       // ["C", "a", "b"]
console.log(["b", "a", "C"].sort((x, y) => x.localeCompare(y))); // ["a", "b", "C"]
console.log("😀".length, [..."😀"].length);  // 2 1
console.log(new Intl.NumberFormat("en-IN").format(1234567.5)); // 12,34,567.5`,
        ),
      ],
      [
        blk(`<h3>Security and performance with strings</h3>
• Never build HTML, SQL or URLs by concatenating user text. Escape or use safe APIs (<code>textContent</code>, <code>encodeURIComponent</code>, parameterised queries).<br>
• Repeated <code>+=</code> in a loop is fine in modern engines (ropes), but joining an array with <code>join</code> is clearer for building large output.<br>
• Tagged templates call a function with the string parts and values, enabling safe escaping, i18n and styled-component libraries.`,
          `const user = "<img src=x onerror=alert(1)>";
const div = document.createElement("div");
div.textContent = user;                 // safe: shown as text, not parsed as HTML
console.log(div.innerHTML);             // &lt;img src=x onerror=alert(1)&gt;

const q = encodeURIComponent("a&b=c d");
console.log(q);                         // a%26b%3Dc%20d

function safe(strings, ...values) {
  const esc = v => String(v).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  return strings.reduce((out, s, i) => out + s + (i < values.length ? esc(values[i]) : ""), "");
}
console.log(safe\`<p>\${user}</p>\`);`,
        ),
      ],
      [
        ['Are strings mutable in JavaScript?', 'No. Strings are immutable primitives; methods like toUpperCase return a new string and index assignment (s[0] = "x") silently does nothing.'],
        ['How do you replace all occurrences of a substring?', 'Use replaceAll("a", "b") or replace with a global regex such as /a/g. replace with a plain string changes only the first match.'],
        ['What is a template literal?', 'A backtick-delimited string that supports ${expression} interpolation, multi-line text and tagged-template functions.'],
      ],
    ),
    topic(
      'jsr-objects-core',
      'Objects: Properties, Copying and Descriptors',
      [
        blk(`<h3>Object basics</h3>
• An object is a collection of key-value pairs. Keys are strings or symbols; values can be anything, including functions (methods).<br>
• Read with dot (<code>obj.name</code>) or bracket (<code>obj["first name"]</code>, or a computed key) notation. Delete with <code>delete obj.key</code>.<br>
• Shorthand: <code>{ name, age }</code> and shorthand methods <code>{ greet() {} }</code>. Test a key with <code>"key" in obj</code> or <code>Object.hasOwn(obj, "key")</code>.<br>
• <code>Object.keys</code>, <code>Object.values</code>, <code>Object.entries</code> and <code>Object.fromEntries</code> convert between objects and arrays.`,
          `const name = "Asha", age = 25;
const user = {
  name, age,
  "home city": "Pune",
  greet() { return "Hi, I am " + this.name; },
};
console.log(user.greet());          // Hi, I am Asha
console.log(user["home city"]);     // Pune
console.log("age" in user, Object.hasOwn(user, "email")); // true false

console.log(Object.entries({ a: 1, b: 2 }));              // [["a", 1], ["b", 2]]
console.log(Object.fromEntries([["x", 1], ["y", 2]]));    // { x: 1, y: 2 }`,
        ),
      ],
      [
        blk(`<h3>Merging, immutable updates and iteration order</h3>
• Spread <code>{...a, ...b}</code> and <code>Object.assign({}, a, b)</code> make shallow copies; later keys win.<br>
• Update immutably: <code>{...user, age: 26}</code> instead of mutating, which is the pattern React state relies on.<br>
• Property order: integer-like keys ascending first, then string keys in insertion order, then symbols.<br>
• Use a <code>Map</code> instead of an object when keys are not strings, when you add and remove keys often, or when you need reliable size and order.`,
          `const defaults = { theme: "light", size: 14 };
const prefs = { size: 16 };
const merged = { ...defaults, ...prefs };
console.log(merged);                 // { theme: "light", size: 16 }

const user = { name: "Asha", address: { city: "Pune" } };
const moved = { ...user, address: { ...user.address, city: "Mumbai" } };
console.log(user.address.city, moved.address.city);  // Pune Mumbai

console.log(Object.keys({ b: 1, 2: 1, a: 1, 1: 1 })); // ["1", "2", "b", "a"]`,
        ),
      ],
      [
        blk(`<h3>Property descriptors and defensive objects</h3>
• Each property has a descriptor: <code>value</code>, <code>writable</code>, <code>enumerable</code>, <code>configurable</code> (or <code>get</code>/<code>set</code>). <code>Object.defineProperty</code> sets them.<br>
• <code>Object.freeze</code> (no add/remove/change), <code>Object.seal</code> (no add/remove, values changeable), <code>Object.preventExtensions</code> (no add).<br>
• Getters and setters compute or validate on access. A <code>Proxy</code> can intercept reads, writes and deletes for validation, logging or reactivity.<br>
• <code>Object.create(null)</code> makes a prototype-less dictionary, immune to keys like <code>__proto__</code> and <code>toString</code>.`,
          `const account = {};
Object.defineProperty(account, "id", { value: 101, writable: false, enumerable: true });
account.id = 5;                         // ignored (throws in strict mode)
console.log(account.id);                // 101

const temp = {
  _c: 25,
  get f() { return this._c * 9 / 5 + 32; },
  set f(v) { this._c = (v - 32) * 5 / 9; },
};
temp.f = 212;
console.log(temp._c);                   // 100

const validated = new Proxy({}, {
  set(target, key, value) {
    if (key === "age" && !Number.isInteger(value)) throw new TypeError("age must be an integer");
    target[key] = value; return true;
  },
});
validated.age = 30;                     // OK`,
        ),
      ],
      [
        ['How do you check whether an object has a property?', '"key" in obj checks own and inherited keys. Object.hasOwn(obj, "key") (or obj.hasOwnProperty) checks only own keys. obj.key !== undefined fails when the value is genuinely undefined.'],
        ['Difference between Object.freeze and const?', 'const stops re-assigning the variable. Object.freeze stops adding, removing and changing the properties of the object itself (shallowly).'],
        ['When should you use a Map instead of an object?', 'When keys are not strings/symbols, when entries are added and removed frequently, when insertion order and size matter, or to avoid prototype key collisions.'],
      ],
    ),
  ]),
];
