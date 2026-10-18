// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const JavaScriptCourse: Course[] = [
    {
        id: 'javascript',
        name: 'JavaScript',
        icon: 'Code',
        subTopics: [
            {
                id: 'js-basics',
                name: 'JavaScript Fundamentals',
                topics: [
                    {
                        id: 'js-intro',
                        name: 'Introduction to JavaScript',
                        beginner: [
                            {
                                content: `<h3>What is JavaScript?</h3>
• JavaScript is a lightweight, interpreted (JIT-compiled) programming language that runs in every web browser and, via Node.js, on the server too.<br>
• It is <strong>dynamically typed</strong> - variable types are determined at runtime, not declared upfront.<br>
• JavaScript is single-threaded but achieves concurrency through an <strong>event loop</strong> and asynchronous callbacks, promises, and async/await.<br>
• Three ways to declare variables: <code>var</code> (function-scoped, legacy), <code>let</code> (block-scoped, reassignable), <code>const</code> (block-scoped, cannot be reassigned).<br>`,
                                codeExamples: [
                                    `// Variables and basic types
let name = "Pankaj";       // string
const age = 28;            // number
let isStudent = false;     // boolean
let scores = [90, 85, 78]; // array
let person = { name, age }; // object (shorthand property)

console.log(\`\${name} is \${age} years old\`); // template literal

// OUTPUT: Pankaj is 28 years old`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>var vs let vs const - Scoping Differences</h4>
<code>var</code> is function-scoped and hoisted (accessible before declaration, as undefined). <code>let</code>/<code>const</code> are block-scoped and live in the "temporal dead zone" until their declaration line runs - accessing them earlier throws a ReferenceError.<br>`,
                                codeExamples: [
                                    `function scopeDemo() {
  if (true) {
    var x = 1;   // function-scoped
    let y = 2;   // block-scoped
  }
  console.log(x); // 1 - accessible outside the if block
  console.log(typeof y); // "undefined" - y does not exist here (ReferenceError if not wrapped in typeof)
}
scopeDemo();
// OUTPUT:
// 1
// undefined`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'js-functions',
                        name: 'Functions & Scope',
                        beginner: [
                            {
                                content: `<h3>Functions in JavaScript</h3>
Functions are first-class citizens in JavaScript - they can be assigned to variables, passed as arguments, and returned from other functions. Three common syntaxes:<br>
1. Function Declaration<br>
2. Function Expression<br>
3. Arrow Function (ES6, shorter syntax, does NOT have its own <code>this</code>)<br>`,
                                codeExamples: [
                                    `// Function declaration - hoisted, can be called before its definition
function add(a, b) {
  return a + b;
}

// Function expression - not hoisted
const subtract = function (a, b) {
  return a - b;
};

// Arrow function - concise, lexical 'this'
const multiply = (a, b) => a * b;

console.log(add(2, 3));       // 5
console.log(subtract(5, 2));  // 3
console.log(multiply(4, 3));  // 12`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Closures</h4>
A closure is a function that "remembers" the variables from the scope it was created in, even after that outer scope has finished executing. Closures are the mechanism behind private state and factory functions in JavaScript.<br>`,
                                codeExamples: [
                                    `function makeCounter() {
  let count = 0; // private, captured by the closure
  return function () {
    count++;
    return count;
  };
}

const counter = makeCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
// Each call to counter() still has access to the same 'count' variable,
// even though makeCounter() already returned.`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'js-datatypes',
                        name: 'Data Types & Type Coercion',
                        beginner: [
                            {
                                content: `<h3>Primitive vs Reference Types</h3>
JavaScript has 7 primitive types - <code>string</code>, <code>number</code>, <code>boolean</code>, <code>undefined</code>, <code>null</code>, <code>symbol</code>, <code>bigint</code> - and one reference type, <code>object</code> (arrays and functions are objects too). Primitives are copied by value; objects are copied by reference.<br><br>
<code>typeof null</code> famously returns <code>"object"</code> - a long-standing JavaScript bug kept for backward compatibility, not a design choice.<br>`,
                                codeExamples: [
                                    `console.log(typeof "hello");   // "string"
console.log(typeof 42);        // "number"
console.log(typeof true);      // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof null);      // "object" - the famous bug
console.log(typeof Symbol());  // "symbol"
console.log(typeof {});        // "object"
console.log(typeof []);        // "object" - arrays are objects too`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>== vs === and Truthy/Falsy Coercion</h4>
<code>==</code> coerces operands to the same type before comparing (often surprising); <code>===</code> compares both value and type with no coercion, and is almost always the right default. Falsy values are: <code>false, 0, "", null, undefined, NaN</code> - everything else (including <code>"0"</code> and <code>[]</code>) is truthy.<br>`,
                                codeExamples: [
                                    `console.log('5' + 3);   // "53" - + with a string triggers concatenation
console.log('5' - 3);   // 2   - - only makes sense numerically, so '5' is coerced to a number

console.log(0 == '0');    // true  - '0' coerced to 0
console.log(0 === '0');   // false - different types, no coercion
console.log([] == false); // true  - [] coerces to "" then to 0

if ([]) console.log('arrays are truthy, even empty ones'); // this runs`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'js-arrays-methods',
                        name: 'Arrays and Array Methods',
                        beginner: [
                            {
                                content: `<h3>Common Array Methods</h3>
• <code>push()</code>/<code>pop()</code> - add/remove from the end.<br>
• <code>unshift()</code>/<code>shift()</code> - add/remove from the start.<br>
• <code>splice(start, deleteCount, ...items)</code> - remove/insert anywhere, mutates the array.<br>
• <code>slice(start, end)</code> - returns a shallow copy of a portion, does NOT mutate.<br>`,
                                codeExamples: [
                                    `let fruits = ['apple', 'banana'];
fruits.push('cherry');           // ['apple', 'banana', 'cherry']
fruits.pop();                    // ['apple', 'banana']
fruits.unshift('mango');         // ['mango', 'apple', 'banana']
fruits.splice(1, 1, 'kiwi');     // removes 'apple', inserts 'kiwi' -> ['mango', 'kiwi', 'banana']
console.log(fruits.slice(0, 2)); // ['mango', 'kiwi'] - fruits itself unchanged by slice`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>map(), filter(), reduce() - The Functional Trio</h4>
<code>map()</code> transforms every element into a new array (same length). <code>filter()</code> keeps only elements matching a condition (shorter or equal length). <code>reduce()</code> folds the array down into a single value. <code>forEach()</code> is similar to map() but always returns <code>undefined</code> - it's for side effects, not building a new array.<br>`,
                                codeExamples: [
                                    `const nums = [1, 2, 3, 4, 5];

const doubled = nums.map(n => n * 2);            // [2, 4, 6, 8, 10]
const evens = nums.filter(n => n % 2 === 0);      // [2, 4]
const total = nums.reduce((sum, n) => sum + n, 0); // 15

console.log(doubled, evens, total);

const forEachResult = nums.forEach(n => n * 2);
console.log(forEachResult); // undefined - forEach never returns a new array`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'js-objects-methods',
                        name: 'Objects and Object Methods',
                        beginner: [
                            {
                                content: `<h3>Working with Objects</h3>
Properties can be accessed with dot notation (<code>obj.key</code>) or bracket notation (<code>obj["key"]</code>) - bracket notation is required when the key is dynamic or not a valid identifier. <code>Object.keys()</code>, <code>Object.values()</code>, and <code>Object.entries()</code> extract an object's keys, values, or [key, value] pairs as arrays.<br>`,
                                codeExamples: [
                                    `const user = { name: 'Pankaj', role: 'Developer' };

console.log(user.name);       // 'Pankaj' - dot notation
const key = 'role';
console.log(user[key]);       // 'Developer' - bracket notation, key is a variable

console.log(Object.keys(user));   // ['name', 'role']
console.log(Object.values(user)); // ['Pankaj', 'Developer']
console.log(Object.entries(user)); // [['name','Pankaj'], ['role','Developer']]

for (const [k, v] of Object.entries(user)) {
  console.log(\`\${k}: \${v}\`);
}
// OUTPUT:
// name: Pankaj
// role: Developer`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'js-loops-conditionals',
                        name: 'Loops and Conditionals',
                        beginner: [
                            {
                                content: `<h3>for...of vs for...in</h3>
<code>for...of</code> iterates over the VALUES of an iterable (arrays, strings, Maps, Sets). <code>for...in</code> iterates over the enumerable KEYS/property names of an object (and, for arrays, over the indices as strings) - using for...in on an array is almost always a mistake.<br>`,
                                codeExamples: [
                                    `const colors = ['red', 'green', 'blue'];

for (const color of colors) {
  console.log(color); // 'red', 'green', 'blue' - the values
}

for (const index in colors) {
  console.log(index); // '0', '1', '2' - the indices, as STRINGS
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>switch and the Ternary Operator</h4>
<code>switch</code> compares with strict equality and falls through to the next case unless you <code>break</code>. The ternary operator <code>condition ? a : b</code> is a compact if/else expression that produces a value.<br>`,
                                codeExamples: [
                                    `function describe(n) {
  switch (n) {
    case 0:
      return 'zero';
    case 1:
      return 'one';
    default:
      return 'many';
  }
}
console.log(describe(1)); // 'one'

const age = 20;
const category = age >= 18 ? 'adult' : 'minor';
console.log(category); // 'adult'`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'js-closures-deep-dive',
                        name: 'Closures Deep Dive - The Loop + setTimeout Trap',
                        beginner: [
                            {
                                content: `<h3>The Classic var-in-a-loop Closure Bug</h3>
This site's "Functions &amp; Scope" topic already introduces closures via a counter-factory example. The single most common closure interview question builds on that idea: what happens when a closure is created inside a loop using <code>var</code>?<br><br>
Because <code>var</code> is function-scoped (not block-scoped), every callback created inside the loop shares the SAME single <code>i</code> variable - by the time the callbacks actually run, the loop has already finished and <code>i</code> holds its final value.<br>`,
                                codeExamples: [
                                    `// BUG: all three callbacks share the same 'i'
for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log('var i:', i), 0);
}
// OUTPUT (after the loop finishes):
// var i: 4
// var i: 4
// var i: 4`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>The Fix: let (or an IIFE)</h4>
<code>let</code> is block-scoped, so each loop iteration gets its OWN fresh binding of <code>i</code> - each closure captures a different variable instead of sharing one.<br>`,
                                codeExamples: [
                                    `// FIXED: let creates a new binding per iteration
for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log('let i:', i), 0);
}
// OUTPUT:
// let i: 1
// let i: 2
// let i: 3

// Pre-ES6 fix using an IIFE to capture 'i' by value each time:
for (var i = 1; i <= 3; i++) {
  (function (captured) {
    setTimeout(() => console.log('iife i:', captured), 0);
  })(i);
}
// OUTPUT:
// iife i: 1
// iife i: 2
// iife i: 3`
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'js-dom',
                name: 'DOM & Events',
                topics: [
                    {
                        id: 'js-dom-manipulation',
                        name: 'DOM Manipulation',
                        beginner: [
                            {
                                content: `<h3>The Document Object Model (DOM)</h3>
The DOM is a tree-structured, in-memory representation of an HTML page. JavaScript can read and modify this tree - adding, removing, or changing elements - and the browser re-renders the page to match.<br>`,
                                codeExamples: [
                                    `// Selecting and updating elements
const heading = document.querySelector('#title');
heading.textContent = 'Welcome to JavaSchoolLab';
heading.style.color = 'orange';

// Creating and appending a new element
const item = document.createElement('li');
item.textContent = 'New list item';
document.querySelector('#list').appendChild(item);`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'js-events',
                        name: 'Event Handling',
                        beginner: [
                            {
                                content: `<h3>Handling Events</h3>
<code>addEventListener()</code> attaches a callback that runs when a specific event (click, input, submit, etc.) fires on an element. Multiple listeners can be attached to the same event without overwriting each other (unlike the old <code>onclick = ...</code> style).<br>`,
                                codeExamples: [
                                    `const button = document.querySelector('#submit-btn');

button.addEventListener('click', (event) => {
  event.preventDefault(); // stop default form submission
  console.log('Button clicked!');
});`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Event Bubbling & Delegation</h4>
Events "bubble" upward from the target element through its ancestors. <strong>Event delegation</strong> exploits this: attach ONE listener to a parent element instead of one listener per child - useful for dynamically added elements.<br>`,
                                codeExamples: [
                                    `// Instead of adding a click listener to every <li>,
// delegate to the parent <ul> and check the actual target.
document.querySelector('#todo-list').addEventListener('click', (event) => {
  if (event.target.tagName === 'LI') {
    event.target.classList.toggle('completed');
  }
});
// Works even for <li> elements added to the list AFTER this listener was attached.`
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'js-modern',
                name: 'Modern JavaScript (ES6+)',
                topics: [
                    {
                        id: 'js-destructuring',
                        name: 'Arrow Functions, Destructuring & Spread',
                        beginner: [
                            {
                                content: `<h3>Destructuring & the Spread/Rest Operators</h3>
Destructuring unpacks values from arrays or properties from objects into distinct variables in one line. The spread operator (<code>...</code>) expands an iterable; the rest operator collects remaining items.<br>`,
                                codeExamples: [
                                    `// Destructuring
const { name, age } = { name: 'Sheru', age: 24 };
const [first, second] = [10, 20];

// Spread - copy/merge arrays and objects
const nums = [1, 2, 3];
const moreNums = [...nums, 4, 5]; // [1, 2, 3, 4, 5]
const person = { name: 'Pankaj' };
const employee = { ...person, role: 'Developer' }; // merges into a new object

// Rest - collect remaining arguments
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
console.log(sum(1, 2, 3, 4)); // 10`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'js-async',
                        name: 'Promises & Async/Await',
                        beginner: [
                            {
                                content: `<h3>Asynchronous JavaScript</h3>
A <code>Promise</code> represents a value that will be available later (pending → fulfilled or rejected). <code>async</code>/<code>await</code> is syntactic sugar over Promises that lets asynchronous code read like synchronous code.<br>`,
                                codeExamples: [
                                    `function fetchUser() {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: 1, name: 'Dheeraj' }), 1000);
  });
}

async function loadUser() {
  console.log('Loading...');
  const user = await fetchUser(); // pauses here until the Promise resolves
  console.log('Loaded:', user.name);
}

loadUser();
// OUTPUT:
// Loading...
// (after ~1 second)
// Loaded: Dheeraj`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Promise.all() - Running Async Operations in Parallel</h4>
Awaiting Promises one-by-one runs them sequentially. <code>Promise.all()</code> runs independent async operations concurrently and resolves once ALL of them finish (or rejects as soon as any one fails).<br>`,
                                codeExamples: [
                                    `async function fetchAll() {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
  ]);
  console.log(users, posts);
}
// Both requests fire at the same time instead of one after the other.`
                                ]
                            }
                        ]
                    },
                    {
                        id: 'js-this-keyword',
                        name: 'The this Keyword',
                        beginner: [
                            {
                                content: `<h3>this - Determined by HOW a Function is Called</h3>
Unlike variable scope, <code>this</code> is NOT determined by where a function is defined - it is determined by <strong>how the function is called</strong> at the call site.<br>
• Regular function call: <code>this</code> is the global object (<code>undefined</code> in strict mode/modules).<br>
• Method call (<code>obj.method()</code>): <code>this</code> is the object before the dot.<br>
• Arrow functions: do NOT have their own <code>this</code> - they lexically inherit <code>this</code> from the enclosing scope where they were defined.<br>`,
                                codeExamples: [
                                    `const person = {
  name: 'Pankaj',
  greetRegular: function () {
    console.log('Regular:', this.name);
  },
  greetArrow: () => {
    console.log('Arrow:', this.name); // 'this' here is NOT person - it's the outer (module/global) scope
  }
};

person.greetRegular(); // Regular: Pankaj
person.greetArrow();   // Arrow: undefined`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>The Classic "this Lost in a Callback" Bug</h4>
A regular function passed as a callback loses its intended <code>this</code> because it gets called as a plain function invocation, not as <code>obj.method()</code>. Arrow functions fix this by inheriting <code>this</code> from where they're defined.<br>`,
                                codeExamples: [
                                    `const timer = {
  seconds: 0,
  startBroken: function () {
    setInterval(function () {
      this.seconds++; // BUG: 'this' is not 'timer' here - it's undefined/global
      console.log(this.seconds); // NaN or throws
    }, 1000);
  },
  startFixed: function () {
    setInterval(() => {
      this.seconds++; // FIX: arrow function inherits 'this' from startFixed's scope, which is 'timer'
      console.log(this.seconds);
    }, 1000);
  }
};
// timer.startFixed() correctly increments and logs 1, 2, 3, ...`
                                ]
                            },
                            {
                                content: `<h4>call(), apply(), and bind() - Explicit this Control</h4>
These let you explicitly set what <code>this</code> should be for a function call, overriding the normal call-site rules.<br>
• <code>call(thisArg, ...args)</code> - invokes immediately, arguments passed individually.<br>
• <code>apply(thisArg, argsArray)</code> - invokes immediately, arguments passed as an array.<br>
• <code>bind(thisArg)</code> - returns a NEW function permanently bound to thisArg, does not invoke immediately.<br>`,
                                codeExamples: [
                                    `function introduce(greeting) {
  console.log(\`\${greeting}, I'm \${this.name}\`);
}

const user = { name: 'Dheeraj' };

introduce.call(user, 'Hi');      // Hi, I'm Dheeraj
introduce.apply(user, ['Hey']);  // Hey, I'm Dheeraj

const boundIntroduce = introduce.bind(user);
boundIntroduce('Hello');         // Hello, I'm Dheeraj`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How is 'this' determined in JavaScript?</td><td>By how a function is called (the call site) - not where it's defined, except for arrow functions</td></tr>
<tr class='text-center'><td>Why don't arrow functions have their own 'this'?</td><td>They lexically inherit 'this' from the enclosing scope at the time they're defined - useful for preserving 'this' inside callbacks</td></tr>
<tr class='text-center'><td>Difference between call(), apply(), and bind()?</td><td>call/apply invoke immediately (args individually vs as an array); bind returns a new permanently-bound function without invoking it</td></tr>
</table>`
                            }
                        ]
                    },
                    {
                        id: 'js-error-handling',
                        name: 'Error Handling (try/catch)',
                        beginner: [
                            {
                                content: `<h3>try / catch / finally</h3>
Wrap risky code in <code>try</code>; if it throws, execution jumps to <code>catch</code> instead of crashing the program. <code>finally</code> always runs, whether or not an error occurred - useful for cleanup.<br>`,
                                codeExamples: [
                                    `function divide(a, b) {
  try {
    if (b === 0) {
      throw new Error('Cannot divide by zero');
    }
    return a / b;
  } catch (err) {
    console.log('Caught:', err.message);
    return null;
  } finally {
    console.log('Division attempt finished');
  }
}

console.log(divide(10, 2)); // Division attempt finished \\n 5
console.log(divide(10, 0)); // Caught: Cannot divide by zero \\n Division attempt finished \\n null`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Error Handling in async/await Code</h4>
With Promises, errors are handled via <code>.catch()</code>. With <code>async</code>/<code>await</code>, a rejected Promise throws inside the async function, so plain <code>try/catch</code> works around <code>await</code> calls.<br>`,
                                codeExamples: [
                                    `async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(\`HTTP error: \${response.status}\`);
    }
    const data = await response.json();
    console.log(data);
  } catch (err) {
    console.log('Fetch failed:', err.message);
  }
}
// If the network fails OR the response is not ok, the catch block runs.`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does finally always run?</td><td>Yes - whether the try block succeeds, throws and is caught, or even if catch itself throws</td></tr>
<tr class='text-center'><td>How do you handle errors in async/await code?</td><td>Wrap the await calls in a regular try/catch block - a rejected Promise throws inside the async function</td></tr>
<tr class='text-center'><td>Can you throw something other than an Error object?</td><td>Yes, JS allows throwing any value, but throwing Error objects is best practice since they carry a stack trace and message</td></tr>
</table>`
                            }
                        ]
                    },
                    {
                        id: 'js-es6-classes',
                        name: 'ES6 Classes',
                        beginner: [
                            {
                                content: `<h3>Class Syntax</h3>
ES6 <code>class</code> syntax is syntactic sugar over JavaScript's existing prototype-based inheritance - under the hood, it's still prototypes. Classes give a cleaner, more familiar syntax for defining constructors and methods.<br>`,
                                codeExamples: [
                                    `class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(\`\${this.name} makes a sound.\`);
  }
}

const generic = new Animal('Creature');
generic.speak(); // Creature makes a sound.`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Inheritance with extends and super</h4>
<code>extends</code> creates a subclass; <code>super(...)</code> calls the parent constructor and must be called before using <code>this</code> in the subclass constructor. Overriding a method and still calling the parent's version uses <code>super.methodName()</code>.<br>`,
                                codeExamples: [
                                    `class Dog extends Animal {
  constructor(name, breed) {
    super(name); // must call parent constructor first
    this.breed = breed;
  }

  speak() {
    super.speak(); // call Animal's speak() too
    console.log(\`\${this.name} barks! (\${this.breed})\`);
  }
}

const dog = new Dog('Rex', 'Labrador');
dog.speak();
// OUTPUT:
// Rex makes a sound.
// Rex barks! (Labrador)`
                                ]
                            },
                            {
                                content: `<h4>Static Methods</h4>
<code>static</code> methods belong to the class itself, not to instances - called as <code>ClassName.method()</code>, useful for utility/factory functions related to the class.<br>`,
                                codeExamples: [
                                    `class MathHelper {
  static square(n) {
    return n * n;
  }
}

console.log(MathHelper.square(5)); // 25
// No instance needed: new MathHelper() is not required to call square()`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Are JS classes truly a new inheritance model?</td><td>No - they are syntactic sugar over the existing prototype chain; typeof still reports functions, and prototype-based mechanics still apply underneath</td></tr>
<tr class='text-center'><td>Why must super() be called before using 'this' in a subclass constructor?</td><td>The parent constructor is responsible for setting up the base object; JS enforces this ordering so 'this' is never used before the object is properly initialized</td></tr>
<tr class='text-center'><td>What are static methods used for?</td><td>Utility or factory functions that belong to the class itself rather than to any particular instance</td></tr>
</table>`
                            }
                        ]
                    },
                    {
                        id: 'js-modules',
                        name: 'JavaScript Modules (import/export)',
                        beginner: [
                            {
                                content: `<h3>Named Exports vs Default Export</h3>
ES6 modules let you split code across files. A module can have multiple <strong>named exports</strong> and at most ONE <strong>default export</strong>. This example is illustrative multi-file code (it cannot run as a single snippet) showing how the pieces connect.<br>`,
                                codeExamples: [
                                    `// ---- math.js ----
export function add(a, b) {
  return a + b;
}
export function subtract(a, b) {
  return a - b;
}
export default function multiply(a, b) {
  return a * b;
}`,
                                    `// ---- main.js ----
import multiply, { add, subtract } from './math.js';
// default export has no braces and can be named anything on import;
// named exports must match their exported names (or be aliased with 'as')

console.log(add(2, 3));      // 5
console.log(subtract(5, 2)); // 3
console.log(multiply(4, 3)); // 12`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>Why Modules Matter</h4>
• Avoid polluting the global namespace - each module has its own scope.<br>
• Explicit dependencies - you can see exactly what a file imports and exports.<br>
• Enables tree-shaking - bundlers can drop unused exports from the final bundle.<br>
• import statements are hoisted and modules are only evaluated once, even if imported from multiple files (cached).<br>`
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many default exports can a module have?</td><td>At most one - but it can have any number of named exports alongside it</td></tr>
<tr class='text-center'><td>Do named imports need to match the exported name?</td><td>Yes, unless aliased with 'as' during import (e.g. import { add as sum })</td></tr>
<tr class='text-center'><td>Is a module re-evaluated every time it's imported?</td><td>No - modules are evaluated once and cached; subsequent imports reuse the same module instance</td></tr>
</table>`
                            }
                        ]
                    },
                    {
                        id: 'js-fetch-api',
                        name: 'Fetch API',
                        beginner: [
                            {
                                content: `<h3>fetch() - Making HTTP Requests</h3>
<code>fetch(url)</code> returns a <code>Promise</code> that resolves with a <code>Response</code> object once the HTTP response headers arrive (the body isn't parsed yet). Call <code>.json()</code> on the response to parse the body as JSON - that also returns a Promise.<br>`,
                                codeExamples: [
                                    `fetch('/api/users/1')
  .then(response => response.json())
  .then(user => console.log('Loaded:', user))
  .catch(err => console.log('Network error:', err.message));
// Illustrative - requires a real server endpoint to actually run.`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h4>The fetch() Gotcha: It Doesn't Reject on HTTP Errors</h4>
<code>fetch()</code>'s Promise only rejects on a <strong>network failure</strong> (e.g. no connection, DNS error) - a 404 or 500 response is still a "successful" fetch as far as the Promise is concerned. You must manually check <code>response.ok</code> or <code>response.status</code>.<br>`,
                                codeExamples: [
                                    `async function getUser(id) {
  const response = await fetch(\`/api/users/\${id}\`);

  if (!response.ok) {
    // This check is REQUIRED - fetch() alone won't throw for a 404!
    throw new Error(\`Request failed: \${response.status}\`);
  }

  return response.json();
}

// Without the response.ok check, a 404 response would silently
// try to parse an error page as JSON instead of failing clearly.`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>When does fetch()'s Promise reject?</td><td>Only on network-level failures (no connection, DNS failure, CORS block) - NOT on HTTP error status codes like 404 or 500</td></tr>
<tr class='text-center'><td>How do you detect an HTTP error status with fetch()?</td><td>Manually check response.ok (true for 2xx status) or response.status after the fetch resolves</td></tr>
<tr class='text-center'><td>Why does .json() return a Promise too?</td><td>Reading and parsing the response body is itself an asynchronous streaming operation</td></tr>
</table>`
                            }
                        ]
                    }
                ]
            }
        ],
        cheatNotes: [
            'let / const - Block-scoped variable declarations (ES6)',
            'var - Function-scoped, hoisted, legacy declaration',
            'typeof - Returns a string naming a value\'s type',
            'Template literals - `Hello ${name}` for string interpolation',
            'Arrow function - (a, b) => a + b, no own \'this\' binding',
            'Closure - A function that retains access to its outer scope\'s variables',
            'this - Refers to the calling context; varies by how a function is invoked',
            'DOM - In-memory tree representation of an HTML document',
            'addEventListener() - Attaches an event callback without overwriting others',
            'Event bubbling - Events propagate from target up through ancestor elements',
            'Event delegation - One listener on a parent handles events from many children',
            'Array methods - map(), filter(), reduce(), forEach() for functional-style iteration',
            'Destructuring - Unpack array/object values into variables in one line',
            'Spread (...) - Expands an array/object into individual elements/properties',
            'Rest (...) - Collects remaining function arguments into an array',
            'Promise - Represents a value available now, later, or never (resolved/rejected)',
            'async / await - Syntax for writing Promise-based code sequentially',
            'Promise.all() - Runs Promises concurrently; fulfils when all fulfil but REJECTS on the first rejection. Promise.allSettled() is the one that waits for every promise to settle',
            'JSON.stringify() / JSON.parse() - Convert between JS objects and JSON text',
            'localStorage / sessionStorage - Browser key-value storage APIs',
            'Strict equality (===) - Compares value AND type, no type coercion',
            'Event loop - Mechanism that lets single-threaded JS handle async operations',
        ],
        interviewQuestions: [
            {
                company: 'General JavaScript Interview',
                questions: [
                    'What is the difference between var, let, and const?',
                    'Explain closures with an example.',
                    'What is the difference between == and ===?',
                    'What is event delegation and why is it useful?',
                    'Explain how the JavaScript event loop works.',
                    'What is the difference between a Promise and async/await?',
                    'What does the spread operator do vs the rest operator?',
                    'What is hoisting in JavaScript?'
                ]
            }
        ]
    }
];
