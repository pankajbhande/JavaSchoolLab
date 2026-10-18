// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const Reactjs: Course[] = [
    {
        id: "react-js",
        name: "ReactJS",
        icon: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
        subTopics: [
            {
                id: "reactjs",
                name: "Fundamentals of React",
                topics: [
                    {
                        id: "reactjs-intro",
                        name: "Introduction to ReactJS",
                        beginner: [
                            {
                                content: `• ReactJS is a JavaScript library for building user interfaces. <br>
                            • It allows developers to create reusable UI components and manage the state of their applications efficiently.<br>
                            • ReactJS uses a virtual DOM to optimize rendering performance. When the state of a component changes, React updates the virtual DOM and efficiently updates the real DOM.<br>
                            • React supports server-side rendering (SSR) and static site generation (SSG) for improved performance and SEO.<br> 
                            • Frameworks like Next.js make it easy to implement these features.<br>
                            `,
                                codeExamples: [
                                    `import React from 'react';
                                function HelloWorld() {
                                    return <h1>Hello, World!</h1>;
                                }
                                export default HelloWorld;`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `• ReactJS uses a virtual DOM to optimize rendering performance. <br>
                            • When the state of a component changes, React updates the virtual DOM and efficiently updates the real DOM.<br>
                            • This approach minimizes the number of direct manipulations to the DOM, resulting in faster updates and improved performance.<br>
                            • React's reconciliation algorithm compares the new virtual DOM with the previous one and updates only the parts of the real DOM that have changed.<br>
                            • This makes React applications highly performant, even with complex user interfaces.
                             `,
                                codeExamples: [
                                    `import React, { useState } from 'react';
                                function Counter() {
                                    const [count, setCount] = useState(0);
                                    return (


                                        <div>
                                            <p>Count: {count}</p>
                                            <button onClick={() => setCount(count + 1)}
                                            >Increment</button>
                                        </div>
                                    );
                                }
                                export default Counter;`
                                ]
                            },


                        ],
                        expert: [
                            {
                                content: `• ReactJS supports server-side rendering (SSR) and static site generation (SSG) for improved performance and SEO. <br>
                            • Frameworks like Next.js make it easy to implement these features.<br>
                            • SSR allows React components to be rendered on the server and sent to the client as fully rendered HTML, improving initial load times and SEO.<br>
                            • SSG generates static HTML files at build time, which can be served directly from a CDN, further improving performance and scalability.<br>
                                `,
                                codeExamples: [
                                    `import React from 'react';
                                function HomePage() {

                                    return <h1>Welcome to the Home Page</h1>;
                                }
                                export default HomePage;`
                                ]
                            },
                            {
                                content: `• Next.js is a popular React framework that provides built-in support for SSR and SSG. <br>
                            • It allows developers to create React applications with minimal configuration while benefiting from improved performance and SEO.<br>
                            • Next.js also offers features like automatic code splitting, optimized image handling, and API routes, making it a powerful choice for building modern web applications with React.<br>
                            `,
                                codeExamples: [
                                    `import React from 'react';
                                function AboutPage() {
                                    return <h1>About Us</h1>;
                                }
                                export default AboutPage;`
                                ]
                            }
                        ]
                    },

                    {
                        id: "single-page-application",
                        name: "Single Page Application (SPA)",
                        beginner: [
                            {
                                content: `
                <h2>What is SPA (Single Page Application)?</h2>
                <p>
                    • A <strong>Single Page Application (SPA)</strong> is a web application that loads a single HTML page
                    and dynamically updates content as the user interacts with the application,
                    without refreshing the entire page.
                </p><br>

                <h3>Traditional Web App vs SPA</h3>
              
                <table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
                    <tr>
                        <th>Feature</th>
                        <th>Traditional App</th>
                        <th>SPA</th>
                    </tr>
                    <tr>
                        <td>Page Reload</td>
                        <td>Reloads on every request</td>
                        <td>No full page reload</td>
                    </tr>
                    <tr>
                        <td>Speed</td>
                        <td>Slower navigation</td>
                        <td>Faster after initial load</td>
                    </tr>
                    <tr>
                        <td>Rendering</td>
                        <td>Server-side</td>
                        <td>Client-side</td>
                    </tr>
                </table><br>

                <h3>How SPA Works</h3>
                <ul>
                    <li>• Browser loads a single HTML file.</li>
                    <li>• JavaScript framework initializes.</li>
                    <li>• User actions trigger API calls.</li>
                    <li>• Server returns JSON data.</li>
                    <li>• DOM updates dynamically.</li>
                </ul><br>

                <h3>Advantages</h3>
                <ul>
                    <li>• Better user experience</li>
                    <li>• Fast navigation</li>
                    <li>• Reduced bandwidth usage</li>
                    <li>• Rich interactive UI</li>
                </ul><br>

                <h3>Disadvantages</h3>
                <ul>
                    <li>• Initial load can be heavy</li>
                    <li>• SEO challenges</li>
                    <li>• Browser compatibility issues (older browsers)</li>
                    <li>• Security concerns if not handled properly</li>
                </ul><br>

                <h3>Popular SPA Frameworks</h3>
                <ul>
                    <li>• React</li>
                    <li>• Angular</li>
                    <li>• Vue.js</li>
                </ul>
            `,
                                codeExamples: [
                                    `// Basic SPA Navigation Example (Vanilla JS)
document.getElementById("homeBtn").addEventListener("click", function() {
    document.getElementById("content").innerHTML = "<h2>Home Page</h2>";
});`,

                                    `// Fetch API Example
fetch('/api/products')
  .then(response => response.json())
  .then(data => {
      console.log(data);
  });`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
                <h2>SPA Architecture</h2>
                <p>
                   • SPA typically follows a <strong>Client-Server Architecture</strong>.<br>
                   • The frontend communicates with backend services using REST APIs.
                </p><br>

                <h3>Architecture Flow</h3>
                <ol>
                    <li>• User interacts with UI</li>
                    <li>• Client-side router handles navigation</li>
                    <li>• API request sent to backend</li>
                    <li>• Backend processes and returns JSON</li>
                    <li>• UI re-renders with updated state</li>
                </ol><br>

                <h3>Client-Side Routing</h3>
                <p>
                  Routing in SPA is handled on the client using libraries like:
                </p>
                <ul>
                    <li>• React Router</li>
                    <li>• Angular Router</li>
                    <li>• Vue Router</li>
                </ul><br>

                <h3>State Management</h3>
                <ul>
                    <li>• Component State</li>
                    <li>• Context API</li>
                    <li>• Redux</li>
                    <li>• NgRx (Angular)</li>
                </ul><br>

                <h3>Authentication in SPA</h3>
                <ul>
                    <li>• JWT (JSON Web Token)</li>
                    <li>• OAuth2</li>
                    <li>• Session-based authentication</li>
                </ul><br>

                <h3>SPA vs MPA (Multi Page Application)</h3>
                <ul>
                    <li>• SPA: Single HTML page, dynamic updates</li>
                    <li>• MPA: Multiple HTML pages, full reload</li>
                </ul>
            `,
                                codeExamples: [
                                    `// React Router Example
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}`,

                                    `// JWT Token Storage Example
localStorage.setItem("token", response.token);`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
                <h2>Advanced SPA Concepts</h2><br>
                <h3>1. Code Splitting & Lazy Loading</h3>
                <p>
                  • Improves performance by loading only required components.
                </p><br>

                <h3>2. Server-Side Rendering (SSR)</h3>
                <p>
                • Improves SEO and performance by rendering pages on server first.
                    Example: Next.js (React Framework).
                </p><br>

                <h3>3. Progressive Web Applications (PWA)</h3>
                <ul>
                    <li>• Offline support</li>
                    <li>• Service workers</li>
                    <li>• Installable apps</li>
                </ul><br>

                <h3>4. Performance Optimization</h3>
                <ul>
                    <li>• Memoization</li>
                    <li>• Virtual DOM optimization</li>
                    <li>• Debouncing & Throttling</li>
                    <li>• Tree shaking</li>
                </ul><br>

                <h3>5. Security Best Practices</h3>
                <ul>
                    <li>• Prevent XSS attacks</li>
                    <li>• Secure token storage</li>
                    <li>• HTTPS usage</li>
                    <li>• CSRF protection</li>
                </ul><br><br>

                <h3>Interview Questions</h3>
                <ul>
                    <li>• What is SPA and how does it work?</li>
                    <li>• Difference between SPA and MPA?</li>
                    <li>• How does client-side routing work?</li>
                    <li>• How do you handle authentication in SPA?</li>
                    <li>• How to optimize SPA performance?</li>
                </ul>
            `,
                                codeExamples: [
                                    `// React Lazy Loading Example
import React, { Suspense, lazy } from "react";

const Dashboard = lazy(() => import("./Dashboard"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}`,

                                    `// Debounce Example
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}`
                                ]
                            }
                        ]
                    },

                    {
                        id: "installing-node-npm",
                        name: "Installing Node.js & npm",
                        beginner: [
                            {
                                content: `
                <h2>What is Node.js?</h2>
                <p>
                  • Node.js is a JavaScript runtime built on Chrome's V8 engine.<br>
                  • It allows you to run JavaScript outside the browser.
                </p><br>

                <h2>What is npm?</h2>
                <p>
                • npm (Node Package Manager) is a tool that comes with Node.js.<br>
                • It is used to install, manage, and update JavaScript packages.
                </p><br>

                <h2>Steps to Install Node.js & npm</h2>
                <ol>
                    <li>• Go to the official Node.js website.</li>
                    <li>• Download the LTS (Long Term Support) version.</li>
                    <li>• Run the installer and follow setup instructions.</li>
                    <li>• Restart your system (if required).</li>
                </ol><br>

                <h3>Verify Installation</h3>
                <p>• Open Command Prompt / Terminal and run:</p>
            `,
                                codeExamples: [
                                    `node -v`,
                                    `npm -v`
                                ]
                            }
                        ],

                        // ================= INTERMEDIATE (DETAILED) =================
                        intermediate: [
                            {
                                content: `
                <h2>Understanding Node.js Installation Types</h2><br>
                <h3>1. LTS Version</h3>
                <p>
                • Recommended for production applications.<br>
                • Stable and supported for a long time.
                </p><br>

                <h3>2. Current Version</h3>
                <p>
                • Latest features but may not be fully stable.
                </p><br>

                <h2>Installing on Different Operating Systems</h2>
                <h3>Windows</h3>
                <ul>
                    <li>• Download .msi installer</li>
                    <li>• Follow setup wizard</li>
                    <li>• Ensure "Add to PATH" is selected</li>
                </ul><br>

                <h3>Mac</h3>
                <ul>
                    <li>• Download .pkg installer</li>
                    <li>• Or use Homebrew package manager</li>
                </ul><br>

                <h3>Linux</h3>
                <ul>
                    <li>• Use package manager (apt, yum)</li>
                    <li>• Or install using Node Version Manager (NVM)</li>
                </ul><br>

                <h2>Understanding package.json</h2>
                <p>
                • package.json is a configuration file that stores:
                </p>
                <ul>
                    <li>• Project metadata</li>
                    <li>• Dependencies</li>
                    <li>• Scripts</li>
                    <li>• Version details</li>
                </ul>
            `,
                                codeExamples: [
                                    `// Initialize a new Node project
npm init`,

                                    `// Install a package
npm install express`,

                                    `// Install as dev dependency
npm install nodemon --save-dev`
                                ]
                            }
                        ],

                        // ================= EXPERT (ADVANCED) =================
                        expert: [
                            {
                                content: `
                <h2>Advanced Node & npm Concepts</h2><br>
                <h3>Node Version Manager (NVM)</h3>
                <p>
                  • NVM allows you to install and manage multiple Node.js versions.<br>
                  • Useful for working on different projects with different versions.
                </p><br>

                <h3>Global vs Local Package Installation</h3>
                <ul>
                    <li>• Global: Available system-wide</li>
                    <li>• Local: Installed inside project folder</li>
                </ul><br>

                <h3>Understanding node_modules</h3>
                <p>
                • node_modules contains all installed dependencies.<br>
                • It should not be committed to Git.
                </p><br>

                <h3>npm Scripts</h3>
                <p>
                • You can define custom scripts inside package.json.
                </p><br>

                <h3>npx Command</h3>
                <p>
                •npx allows running packages without installing them globally.
                </p><br>

                <h3>Security Best Practices</h3>
                <ul>
                    <li>• Use npm audit</li>
                    <li>• Keep dependencies updated</li>
                    <li>• Avoid installing unknown global packages</li>
                </ul><br>

                <h3>Environment Variables</h3>
                <p>
                • Use .env files to store sensitive information.
                </p>
            `,
                                codeExamples: [
                                    `// Install NVM (Mac/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash`,

                                    `// Use specific Node version
nvm install 18
nvm use 18`,

                                    `// Run npm audit
npm audit`,

                                    `// Example npm script in package.json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}`
                                ]
                            }
                        ]
                    },

                    {
                        id: "jsx-syntax",
                        name: "JSX Syntax and Rules",
                        beginner: [
                            {
                                content: `<h3>What is JSX?</h3>
• JSX (JavaScript XML) is a syntax extension for JavaScript that lets you write HTML-like markup directly inside a JavaScript/React file.<br>
• JSX is NOT valid JavaScript on its own — a build tool compiles it away before the browser sees it. Under the modern automatic runtime (React 17+, the default in Vite, CRA 5 and Next.js) it becomes <code>_jsx()</code> imported from <code>react/jsx-runtime</code>, which is why you no longer need <code>import React</code>. The legacy classic transform produced <code>React.createElement(...)</code> instead, and the browser still never sver sees it.<br>
• It exists so a component's structure (what it renders) and logic (how it behaves) can live together in one readable file, instead of separate template/script files.<br><br>

<h4>JSX compiles down to function calls</h4>`,
                                codeExamples: [
                                    `// What you write:
const element = <h1>Hello, World!</h1>;

// What Babel actually compiles it to:
const element = React.createElement('h1', null, 'Hello, World!');

// Renders: an <h1> element containing the text "Hello, World!"`
                                ]
                            },
                            {
                                content: `<h3>Embedding JavaScript Expressions</h3>
Any valid JavaScript expression can be embedded inside JSX using curly braces <code>{}</code> — variables, function calls, arithmetic, ternaries (but NOT statements like <code>if</code> or <code>for</code> directly).`,
                                codeExamples: [
                                    `function Greeting() {
    const name = "Pankaj";
    const hour = 14;

    return (
        <div>
            <p>Hello, {name}!</p>
            <p>2 + 2 = {2 + 2}</p>
            <p>{hour < 12 ? "Good morning" : "Good afternoon"}</p>
        </div>
    );
}

// Renders: "Hello, Pankaj!", "2 + 2 = 4", and "Good afternoon" (since hour is 14)`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>The Core JSX Rules</h3>
• <strong>Single root element</strong> — a component must return one root element (or a <code>&lt;&gt;...&lt;/&gt;</code> Fragment to avoid an unnecessary wrapper <code>&lt;div&gt;</code>).<br>
• <strong>className, not class</strong> — <code>class</code> is a reserved JavaScript keyword, so JSX uses <code>className</code> for the HTML class attribute.<br>
• <strong>camelCase event handlers and most attributes</strong> — <code>onClick</code> not <code>onclick</code>, <code>tabIndex</code> not <code>tabindex</code>.<br>
• <strong>Self-closing tags need the slash</strong> — <code>&lt;img /&gt;</code>, <code>&lt;br /&gt;</code>, even for elements that aren't normally self-closing in HTML.<br>
• <strong>Comments use <code>{/* ... */}</code></strong> inside JSX, not <code>&lt;!-- --&gt;</code>.`,
                                codeExamples: [
                                    `function Card() {
    return (
        <> {/* Fragment avoids an extra wrapper div */}
            <img src="avatar.png" className="avatar" />
            <p tabIndex={0} onClick={() => console.log("clicked")}>
                {/* This is a JSX comment */}
                Card content
            </p>
        </>
    );
}

// Renders: an image and a paragraph, both as SIBLINGS with no extra wrapping div in the DOM`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is JSX required to use React?</td><td>No — it's optional sugar; you can call React.createElement() directly, but virtually no real codebase does that by hand</td></tr>
<tr class='text-center'><td>Why does a component need a single root element?</td><td>A function can only return one value; JSX with multiple top-level siblings has no single object to return, so it's a compile error unless wrapped in one parent or a Fragment</td></tr>
<tr class='text-center'><td>Why className instead of class?</td><td>JSX attributes become JavaScript object properties under the hood, and "class" is a reserved word in JavaScript</td></tr>
<tr class='text-center'><td>Can you put an if statement directly inside JSX curly braces?</td><td>No — only expressions are allowed inside {}, not statements; use a ternary or move the if logic above the return</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-components",
                        name: "Components (Functional vs Class)",
                        beginner: [
                            {
                                content: `<h3>What is a Component?</h3>
• A <strong>component</strong> is a reusable, self-contained piece of UI — a JavaScript function (or class) that returns JSX describing what should appear on screen.<br>
• Components let you split the UI into independent, reusable pieces and think about each piece in isolation.<br>
• React has two ways to write a component: <strong>functional</strong> (a plain function) and <strong>class-based</strong> (extends <code>React.Component</code>).`,
                                codeExamples: [
                                    `// Functional component (modern, preferred)
function Welcome({ name }) {
    return <h1>Hello, {name}!</h1>;
}

// Usage:
// <Welcome name="Pankaj" />
// Renders: an <h1> containing "Hello, Pankaj!"`
                                ]
                            },
                            {
                                content: `<h3>Class Components (Legacy, Still Asked in Interviews)</h3>
Before React 16.8 introduced Hooks, class components were the only way to have local state and lifecycle methods. They're less common in new code today, but still appear in older codebases and interview questions.`,
                                codeExamples: [
                                    `import React from 'react';

class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}!</h1>;
    }
}

export default Welcome;
// Renders identically to the functional version above: "Hello, Pankaj!"`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Why Functional Components + Hooks Won</h3>
• Class components need <code>this</code> binding gymnastics (<code>this.handleClick = this.handleClick.bind(this)</code>), which is a common source of bugs for beginners.<br>
• Hooks (introduced React 16.8, 2019) let functional components have state and lifecycle behavior WITHOUT classes — see the State/useState and useEffect topics.<br>
• Functional components are generally shorter, easier to test, and easier to compose (custom hooks let you share stateful logic between components — something class components can't do cleanly).<br>
• The React team's own official guidance and nearly all new documentation/tutorials now default to functional components.`,
                                codeExamples: [
                                    `// Comparison: same counter, two ways

// Class version - needs 'this', constructor, manual binding
class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { count: 0 };
        this.increment = this.increment.bind(this);
    }
    increment() {
        this.setState({ count: this.state.count + 1 });
    }
    render() {
        return <button onClick={this.increment}>Count: {this.state.count}</button>;
    }
}

// Functional version with Hooks - no 'this', no binding
function Counter() {
    const [count, setCount] = React.useState(0);
    return <button onClick={() => setCount(count + 1)}>Count: {count}</button>;
}
// Both render identically: a button that increments its own displayed count on click`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a React component, fundamentally?</td><td>A function (or class) that accepts props and returns JSX describing part of the UI</td></tr>
<tr class='text-center'><td>Are class components deprecated?</td><td>Not officially removed, but functional components with Hooks are the recommended modern approach for all new code</td></tr>
<tr class='text-center'><td>Why do class components need method binding in the constructor?</td><td>Regular methods don't automatically bind "this" to the class instance in JavaScript, so event handlers lose their "this" context unless explicitly bound</td></tr>
<tr class='text-center'><td>Can a functional component have state?</td><td>Yes, via the useState Hook — this is exactly what made functional components a full replacement for class components</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-props",
                        name: "Props in React",
                        beginner: [
                            {
                                content: `<h3>What are Props?</h3>
• <strong>Props</strong> (short for "properties") are how a parent component passes data DOWN to a child component.<br>
• Props are <strong>read-only</strong> — a child component must never modify the props it receives; React relies on this to keep data flow predictable ("one-way data flow").<br>
• Props are passed like HTML attributes, and received by the child as a single object argument (conventionally named <code>props</code>).`,
                                codeExamples: [
                                    `function Greeting(props) {
    return <p>Hello, {props.name}! You are {props.age} years old.</p>;
}

function App() {
    return <Greeting name="Pankaj" age={28} />;
}

// Renders: "Hello, Pankaj! You are 28 years old."`
                                ]
                            },
                            {
                                content: `<h3>Destructuring Props</h3>
Instead of writing <code>props.name</code>, <code>props.age</code> everywhere, it's common to destructure props right in the function signature for cleaner code.`,
                                codeExamples: [
                                    `function Greeting({ name, age }) {
    return <p>Hello, {name}! You are {age} years old.</p>;
}
// Identical behavior to the previous example, just cleaner to read`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Default Props and the Prop-Drilling Problem</h3>
Default values can be given via default parameters in the destructuring, so a component still works sensibly even if a prop is omitted.<br><br>

<strong>Prop drilling</strong> is what happens when a deeply nested component needs a prop, forcing every intermediate component in between to accept and re-pass it, even if they don't use it themselves. It's a real maintenance pain in larger apps — the standard fix is the <strong>Context API</strong> (covered separately), which lets data skip levels directly.`,
                                codeExamples: [
                                    `function Greeting({ name = "Guest", age = 0 }) {
    return <p>Hello, {name}! You are {age} years old.</p>;
}

// <Greeting /> with no props at all
// Renders: "Hello, Guest! You are 0 years old."`,
                                    `// Prop drilling illustration - 'theme' passes through Layout and Header
// even though neither of them actually uses it, just to reach Button
function App() {
    return <Layout theme="dark" />;
}
function Layout({ theme }) {
    return <Header theme={theme} />;
}
function Header({ theme }) {
    return <Button theme={theme} />;
}
function Button({ theme }) {
    return <button className={theme}>Click me</button>;
}
// Works, but Layout and Header are forced to know about a prop they never use`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can a child component modify the props it receives?</td><td>No — props are read-only from the child's perspective; only the parent that owns the data can change it (typically triggering it to re-render and pass new prop values down)</td></tr>
<tr class='text-center'><td>What is "one-way data flow" in React?</td><td>Data flows from parent to child via props only, never the reverse directly - a child that needs to affect the parent does so via a callback function passed down as a prop</td></tr>
<tr class='text-center'><td>What is prop drilling and how do you avoid it?</td><td>Passing a prop through many intermediate components that don't use it, just to reach a deeply nested child - solved with the Context API for widely-needed data</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-state-usestate",
                        name: "State and the useState Hook",
                        beginner: [
                            {
                                content: `<h3>What is State?</h3>
• <strong>State</strong> is data that belongs to a component and can change over time — unlike props, state is owned and managed BY the component itself, not passed in from outside.<br>
• When state changes, React automatically re-renders the component to reflect the new value on screen.<br>
• The <code>useState</code> Hook is how a functional component declares state.`,
                                codeExamples: [
                                    `import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0); // 0 is the initial value

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </div>
    );
}

// Renders: "Count: 0" with an Increment button.
// Each click re-renders the component with count increased by 1.`
                                ]
                            },
                            {
                                content: `<h3>Never Mutate State Directly</h3>
Calling <code>setCount(...)</code> is what tells React "re-render me" — directly assigning to a state variable (<code>count = count + 1</code>) is actually a hard <code>TypeError</code>, because <code>count</code> is declared with <code>const</code>. The subtler trap is MUTATING an object or array already in state (<code>user.name = "x"</code>), which runs fine but keeps the same reference, so React does NOT trigger a re-render and leaves React's internal tracking out of sync with reality.`,
                                codeExamples: [
                                    `function BrokenCounter() {
    const [count, setCount] = useState(0);

    function handleClick() {
        count = count + 1; // BUG: direct mutation, React never finds out
        console.log(count); // logs the new value...
    }

    // ...but the UI never updates, because setCount() was never called
    return <button onClick={handleClick}>Count: {count}</button>;
}
// Renders: a button stuck at "Count: 0" forever, even though the console logs increasing numbers`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>State vs Props</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Props</th><th>State</th></tr>
<tr class='text-center'><td>Owned by</td><td>Parent component (passed down)</td><td>The component itself</td></tr>
<tr class='text-center'><td>Mutability</td><td>Read-only from the receiving component</td><td>Mutable, but ONLY via its setter function</td></tr>
<tr class='text-center'><td>Triggers re-render?</td><td>Yes, when the parent's prop value changes</td><td>Yes, when the setter is called with a new value</td></tr>
<tr class='text-center'><td>Purpose</td><td>Configure/customize a component from outside</td><td>Track data that changes over the component's lifetime</td></tr>
</table>
<br>
<h4>Functional Updates for State Based on Previous State</h4>
When the new state depends on the old state, pass a function to the setter instead of a plain value — this avoids subtle bugs from stale values in fast-firing updates (e.g. multiple rapid clicks).`,
                                codeExamples: [
                                    `function Counter() {
    const [count, setCount] = useState(0);

    function incrementTwice() {
        // BUG-PRONE: both calls close over the same stale 'count' value
        setCount(count + 1);
        setCount(count + 1);
        // Result: count only goes up by 1, not 2!
    }

    function incrementTwiceCorrectly() {
        // CORRECT: each call gets the truly latest state
        setCount(prev => prev + 1);
        setCount(prev => prev + 1);
        // Result: count goes up by 2, as expected
    }

    return <button onClick={incrementTwiceCorrectly}>Count: {count}</button>;
}`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What happens if you mutate state directly instead of using the setter?</td><td>The component does NOT re-render, because React only knows to update the UI when the state setter function is called</td></tr>
<tr class='text-center'><td>Why use the functional form setCount(prev => prev + 1) instead of setCount(count + 1)?</td><td>It guarantees you're updating from the truly latest state, avoiding stale-closure bugs when multiple updates happen close together</td></tr>
<tr class='text-center'><td>Does calling the state setter update the variable immediately?</td><td>No - state updates are asynchronous/batched; the component re-renders with the new value on the NEXT render, not synchronously in the same line of code</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-event-handling",
                        name: "Event Handling in React",
                        beginner: [
                            {
                                content: `<h3>Handling Events in React</h3>
• React events are named using <strong>camelCase</strong> (<code>onClick</code>, <code>onChange</code>, <code>onSubmit</code>) rather than lowercase HTML attribute names.<br>
• You pass a <strong>function</strong> as the handler, not a string of code — <code>onClick={handleClick}</code>, not <code>onClick="handleClick()"</code>.<br>
• React wraps native browser events in a <strong>SyntheticEvent</strong> — a cross-browser wrapper that behaves consistently no matter which browser is running the code.`,
                                codeExamples: [
                                    `function Button() {
    function handleClick() {
        console.log("Button was clicked!");
    }

    return <button onClick={handleClick}>Click me</button>;
}
// Renders: a button. Each click logs "Button was clicked!" to the console.`
                                ]
                            },
                            {
                                content: `<h3>Handling Form Input with onChange</h3>`,
                                codeExamples: [
                                    `function NameInput() {
    const [name, setName] = React.useState("");

    function handleChange(event) {
        setName(event.target.value);
    }

    return (
        <div>
            <input type="text" value={name} onChange={handleChange} />
            <p>You typed: {name}</p>
        </div>
    );
}
// Renders: a text input and a live preview of what's typed, updating on every keystroke`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Passing Arguments to Event Handlers</h3>
To pass extra arguments to a handler, wrap the call in an inline arrow function — calling the function directly (<code>onClick={handleClick(id)}</code>) would invoke it immediately during render, not on click.`,
                                codeExamples: [
                                    `function ItemList() {
    const items = ["Apple", "Banana", "Cherry"];

    function handleDelete(item) {
        console.log("Deleting:", item);
    }

    return (
        <ul>
            {items.map(item => (
                <li key={item}>
                    {item}
                    <button onClick={() => handleDelete(item)}>Delete</button>
                </li>
            ))}
        </ul>
    );
}
// Renders: a list of 3 items, each with its own Delete button.
// Clicking "Delete" next to "Banana" logs "Deleting: Banana" - only that item's argument is used.`
                                ]
                            },
                            {
                                content: `<h3>preventDefault() in Forms</h3>
By default, submitting an HTML form reloads the page — call <code>event.preventDefault()</code> inside the submit handler to stop that and handle the submission entirely in JavaScript/React.`,
                                codeExamples: [
                                    `function LoginForm() {
    function handleSubmit(event) {
        event.preventDefault(); // stop the default full-page reload
        console.log("Form submitted without a page reload");
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username" />
            <button type="submit">Log In</button>
        </form>
    );
}
// Renders: a form. Clicking "Log In" logs the message WITHOUT reloading the page.`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a SyntheticEvent?</td><td>React's cross-browser wrapper around the native DOM event, providing a consistent API regardless of which browser fires the underlying event</td></tr>
<tr class='text-center'><td>Why does onClick={handleClick(id)} fire immediately instead of on click?</td><td>Writing it with parentheses CALLS the function during render and uses its return value as the handler, instead of passing the function itself - wrap it in an arrow function to defer the call</td></tr>
<tr class='text-center'><td>What does event.preventDefault() do in a form's onSubmit handler?</td><td>Stops the browser's default full-page reload/navigation so the form can be handled entirely in JavaScript</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-conditional-rendering",
                        name: "Conditional Rendering",
                        beginner: [
                            {
                                content: `<h3>Ways to Render Conditionally in React</h3>
JSX doesn't allow <code>if</code> statements directly inside curly braces (only expressions), so React code uses a few standard patterns to show different UI based on a condition.<br><br>

<h4>1. if/else Outside the JSX</h4>`,
                                codeExamples: [
                                    `function Greeting({ isLoggedIn }) {
    if (isLoggedIn) {
        return <h1>Welcome back!</h1>;
    }
    return <h1>Please log in.</h1>;
}

// <Greeting isLoggedIn={true} /> renders: "Welcome back!"
// <Greeting isLoggedIn={false} /> renders: "Please log in."`
                                ]
                            },
                            {
                                content: `<h4>2. Ternary Operator Inside JSX</h4>
Good for a simple either/or choice embedded directly in the markup.`,
                                codeExamples: [
                                    `function Greeting({ isLoggedIn }) {
    return (
        <h1>{isLoggedIn ? "Welcome back!" : "Please log in."}</h1>
    );
}
// Same output as the if/else version, but as a single inline expression`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>3. && Short-Circuit Rendering</h3>
For "render something only if true, otherwise render nothing," the <code>&&</code> operator is a common shorthand — JSX treats <code>false</code>/<code>null</code>/<code>undefined</code> as "render nothing."`,
                                codeExamples: [
                                    `function Inbox({ unreadCount }) {
    return (
        <div>
            <h1>Inbox</h1>
            {unreadCount > 0 && <p>You have {unreadCount} unread messages.</p>}
        </div>
    );
}

// <Inbox unreadCount={3} /> renders: "Inbox" and "You have 3 unread messages."
// <Inbox unreadCount={0} /> renders: only "Inbox" - the paragraph renders nothing`,
                                    `// COMMON TRAP: using a number directly with && can render an unwanted "0"
function BuggyInbox({ unreadCount }) {
    return <div>{unreadCount && <p>You have {unreadCount} messages.</p>}</div>;
}
// <BuggyInbox unreadCount={0} /> renders the literal text "0" on screen!
// Because 0 && <p>...</p> evaluates to 0, and React DOES render the number 0 (unlike false/null/undefined).
// Fix: use unreadCount > 0 && ... instead`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't you write "if" directly inside JSX curly braces?</td><td>Curly braces in JSX only accept expressions (things that evaluate to a value), and "if" is a statement, not an expression</td></tr>
<tr class='text-center'><td>What does React render for false, null, or undefined?</td><td>Nothing - React silently skips rendering these values, which is why they're used as the "render nothing" branch of conditional patterns</td></tr>
<tr class='text-center'><td>What's the "renders a literal 0" bug with && and how do you avoid it?</td><td>count && <p>...</p> renders the number 0 on screen when count is 0, because 0 is a "falsy but rendered" value in React unlike false/null/undefined - fix by using a comparison like count > 0 && ... instead</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-lists-keys",
                        name: "Lists and Keys",
                        beginner: [
                            {
                                content: `<h3>Rendering Lists with .map()</h3>
React doesn't have a special "for loop" syntax in JSX. Instead, you transform an array of data into an array of JSX elements using the standard JavaScript <code>.map()</code> method, and React renders each element in the resulting array.<br>
<br>
<h4>Why Keys Are Required</h4>
• React uses a <strong>reconciliation</strong> (diffing) algorithm to figure out what changed between renders, so it only touches the real DOM where necessary.<br>
• A <strong>key</strong> is a special prop that gives each list item a stable identity across renders, so React can tell "this item moved" apart from "this item was deleted and a new one was added".<br>
• Without keys (or with unstable keys), React may re-render, re-mount, or mismatch list items incorrectly - especially when items are reordered, inserted, or removed.<br>`,
                                codeExamples: [
                                    `function FruitList() {
    const fruits = [
        { id: 'f1', name: 'Apple' },
        { id: 'f2', name: 'Banana' },
        { id: 'f3', name: 'Cherry' },
    ];

    return (
        <ul>
            {fruits.map((fruit) => (
                <li key={fruit.id}>{fruit.name}</li>
            ))}
        </ul>
    );
}
// Renders: a bullet list showing Apple, Banana, Cherry`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>The Index-as-Key Trap</h3>
Using the array <strong>index</strong> as the key (<code>key={index}</code>) works fine ONLY if the list is static and never reordered/filtered/has items inserted in the middle. The moment the list changes shape, index-as-key causes React to associate the wrong internal state with the wrong visual item - a classic, hard-to-spot bug.<br>`,
                                codeExamples: [
                                    `// BUGGY: using index as key with a list that can reorder
function TodoListBuggy({ todos }) {
    // todos = [{ text: 'Buy milk' }, { text: 'Walk dog' }]
    return (
        <ul>
            {todos.map((todo, index) => (
                // If a new todo is added at the START of the array,
                // every existing <li>'s key (its index) shifts - React
                // thinks each item's CONTENT changed instead of a new
                // item being inserted, which can scramble input state,
                // checkbox state, etc. tied to those list items.
                <li key={index}>{todo.text}</li>
            ))}
        </ul>
    );
}`,
                                    `// FIXED: using a stable, unique id as key
function TodoListFixed({ todos }) {
    // todos = [{ id: 't1', text: 'Buy milk' }, { id: 't2', text: 'Walk dog' }]
    return (
        <ul>
            {todos.map((todo) => (
                <li key={todo.id}>{todo.text}</li>
            ))}
        </ul>
    );
}
// Renders correctly no matter how the todos array is reordered,
// because each <li>'s identity is tied to the todo's own id, not its position.`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does React need a key prop for list items?</td><td>So its reconciliation algorithm can track each item's identity across re-renders, correctly distinguishing "moved" from "added" from "removed"</td></tr>
<tr class='text-center'><td>Why is using the array index as key discouraged?</td><td>If the list can be reordered, filtered, or have items inserted/removed anywhere but the end, index-as-key causes React to misattribute state/DOM to the wrong item</td></tr>
<tr class='text-center'><td>When is index-as-key actually safe?</td><td>Only for a static list that never changes order and is never filtered or has items inserted/removed</td></tr>
<tr class='text-center'><td>Do keys need to be globally unique across the whole app?</td><td>No - only unique among siblings within the same list</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-forms",
                        name: "Forms and Controlled Components",
                        beginner: [
                            {
                                content: `<h3>Controlled Components</h3>
A <strong>controlled component</strong> is a form input whose value is driven entirely by React state - the input's <code>value</code> comes from state, and every keystroke fires an <code>onChange</code> handler that updates that state. This makes React the single source of truth for the form's data.<br>`,
                                codeExamples: [
                                    `import { useState } from 'react';

function NameForm() {
    const [name, setName] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        alert('Submitted name: ' + name);
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button type="submit">Submit</button>
        </form>
    );
}
// Renders: a text input and Submit button. Typing updates "name" state
// on every keystroke; submitting shows an alert with the current value.`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Controlled vs Uncontrolled Components</h3>
An <strong>uncontrolled component</strong> lets the DOM itself hold the input's value, and React reads it on demand via a <code>ref</code> instead of tracking every keystroke in state. Controlled components are the React-recommended default (predictable, easy to validate/format as the user types); uncontrolled components are occasionally useful for simple forms or integrating non-React code.<br>`,
                                codeExamples: [
                                    `import { useRef } from 'react';

function UncontrolledForm() {
    const inputRef = useRef(null);

    function handleSubmit(e) {
        e.preventDefault();
        alert('Submitted name: ' + inputRef.current.value);
    }

    return (
        <form onSubmit={handleSubmit}>
            {/* defaultValue instead of value - DOM owns the current value */}
            <input type="text" ref={inputRef} defaultValue="" />
            <button type="submit">Submit</button>
        </form>
    );
}`,
                                    `// A <select> as a controlled component
function CitySelect() {
    const [city, setCity] = useState('pune');

    return (
        <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="pune">Pune</option>
            <option value="mumbai">Mumbai</option>
            <option value="delhi">Delhi</option>
        </select>
    );
}
// Renders: a dropdown; "city" state always reflects the selected option`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a controlled component?</td><td>A form input whose value is driven by React state, updated via an onChange handler on every change</td></tr>
<tr class='text-center'><td>What is an uncontrolled component?</td><td>A form input where the DOM holds the current value; React reads it on demand via a ref instead of tracking it in state</td></tr>
<tr class='text-center'><td>Why call e.preventDefault() in a form's onSubmit handler?</td><td>To stop the browser's default full-page-reload form submission, since React handles the submission in JavaScript instead</td></tr>
<tr class='text-center'><td>Which approach is generally recommended in React?</td><td>Controlled components, since they keep React as the single source of truth and make validation/conditional logic straightforward</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-useeffect",
                        name: "useEffect Hook and Side Effects",
                        beginner: [
                            {
                                content: `<h3>What is a Side Effect?</h3>
A <strong>side effect</strong> is anything a component does besides computing what to render - fetching data from an API, setting up a subscription, manually touching the DOM, or logging. The <code>useEffect</code> hook is where side effects belong in a functional component, kept separate from the render logic itself.<br>
<br>
<h4>useEffect Syntax</h4>
<code>useEffect(() => { ...effect code... }, [dependencies])</code> - the function runs after render, and the dependency array controls WHEN it runs again.<br>`,
                                codeExamples: [
                                    `import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch('/api/users/' + userId)
            .then((res) => res.json())
            .then((data) => setUser(data));
    }, [userId]); // re-runs only when userId changes

    if (!user) return <p>Loading...</p>;
    return <h2>{user.name}</h2>;
}
// Renders: "Loading..." first, then the fetched user's name once the
// request resolves. Re-fetches automatically if userId prop changes.`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>The Dependency Array's Three Behaviors</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Dependency array</th><th>When the effect runs</th></tr>
<tr class='text-center'><td>Omitted entirely</td><td>After every single render (rarely what you want)</td></tr>
<tr class='text-center'><td><code>[]</code> (empty)</td><td>Once, right after the first render (mount) only</td></tr>
<tr class='text-center'><td><code>[dep1, dep2]</code></td><td>After the first render, then again whenever any listed dependency's value changes</td></tr>
</table>
<br>
<h4>Cleanup Functions</h4>
If your effect sets up something that needs tearing down (a subscription, a timer, an event listener), return a <strong>cleanup function</strong> from the effect - React calls it right before the effect re-runs, and again when the component unmounts.<br>`,
                                codeExamples: [
                                    `import { useState, useEffect } from 'react';

function Timer() {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setSeconds((s) => s + 1);
        }, 1000);

        // cleanup: runs on unmount (or before the effect re-runs)
        return () => clearInterval(id);
    }, []); // empty array: set up the interval once, on mount

    return <p>Seconds elapsed: {seconds}</p>;
}
// Renders: a counter that ticks up every second while mounted, and
// stops cleanly (no memory leak) if the component unmounts.`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a side effect in React?</td><td>Anything a component does outside computing its render output - data fetching, subscriptions, timers, manual DOM access, logging</td></tr>
<tr class='text-center'><td>What does an empty dependency array [] mean?</td><td>The effect runs exactly once, right after the component's first render (similar in spirit to componentDidMount)</td></tr>
<tr class='text-center'><td>Why return a function from useEffect?</td><td>To define a cleanup step that runs before the effect re-runs and when the component unmounts, preventing leaks (e.g. clearing intervals/subscriptions)</td></tr>
<tr class='text-center'><td>What happens if you omit the dependency array entirely?</td><td>The effect runs after every render, which is rarely intended and can cause performance issues or infinite loops if it also updates state</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-context-api",
                        name: "Context API",
                        beginner: [
                            {
                                content: `<h3>The Problem: Prop Drilling</h3>
<strong>Prop drilling</strong> is passing a prop down through several layers of components that don't actually use it themselves, just to get it to a deeply nested child that does. It clutters every intermediate component's props and makes refactoring painful.<br>
<br>
<h4>The Fix: Context API</h4>
Context lets you share a value (theme, logged-in user, language setting, etc.) across a whole subtree of components WITHOUT passing it through every intermediate level as a prop.<br>`,
                                codeExamples: [
                                    `import { createContext, useContext } from 'react';

// 1. Create the context
const ThemeContext = createContext('light');

// 2. Provide a value at the top of the subtree
function App() {
    return (
        <ThemeContext.Provider value="dark">
            <Toolbar />
        </ThemeContext.Provider>
    );
}

// 3. Any descendant can read it directly - no prop drilling
function Toolbar() {
    return <ThemedButton />; // Toolbar never touches "theme" itself
}

function ThemedButton() {
    const theme = useContext(ThemeContext);
    return <button>Current theme: {theme}</button>;
}
// Renders: a button reading "Current theme: dark" - ThemedButton got
// the value directly from context, bypassing Toolbar entirely.`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>When Context Is (and Isn't) the Right Tool</h3>
• Good fit: values needed by MANY components at different nesting depths (theme, auth/current-user, locale, feature flags).<br>
• Overkill: passing a prop just one or two levels down - plain props are simpler and easier to trace.<br>
• Context is not a full state-management replacement for complex, frequently-changing app-wide state - every component consuming a context re-renders when its value changes, which can hurt performance if used carelessly for high-frequency updates.<br>`,
                                codeExamples: [
                                    `// A more realistic auth context with a custom hook
const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook wrapping useContext - a common, cleaner pattern
function useAuth() {
    return useContext(AuthContext);
}

function ProfileBadge() {
    const { user } = useAuth();
    return <span>{user ? user.name : 'Guest'}</span>;
}`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Context solve?</td><td>Prop drilling - passing data through many intermediate components that don't need it, just to reach a deeply nested consumer</td></tr>
<tr class='text-center'><td>What are the three pieces of using Context?</td><td>createContext() to create it, a Provider to supply a value to a subtree, and useContext() to read it in any descendant</td></tr>
<tr class='text-center'><td>Does every component re-render when context changes?</td><td>Every component that calls useContext() on that context re-renders when its value changes - components that don't consume it are unaffected</td></tr>
<tr class='text-center'><td>Is Context a replacement for Redux/state libraries?</td><td>Not fully - Context is great for infrequently-changing, widely-needed values, but frequent high-volume updates through Context can cause unnecessary re-renders</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-router-basics",
                        name: "React Router (Basic Routing)",
                        beginner: [
                            {
                                content: `<h3>Client-Side Routing</h3>
A Single Page Application has only ONE actual HTML page - "navigating" between "pages" just swaps out which components are rendered, without a full page reload. <strong>react-router-dom</strong> is the standard library that makes this URL-driven navigation possible in React.<br>`,
                                codeExamples: [
                                    `import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() { return <h2>Home Page</h2>; }
function About() { return <h2>About Page</h2>; }

function App() {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/">Home</Link> | <Link to="/about">About</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
            </Routes>
        </BrowserRouter>
    );
}
// Renders: a nav bar; clicking "Home"/"About" swaps the rendered
// component below WITHOUT reloading the page, and updates the URL.`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Dynamic Route Segments with useParams</h3>
Routes can include a dynamic segment (like a product id) using a colon prefix (<code>:id</code>). The matching component reads that segment's actual value via the <code>useParams</code> hook.<br>`,
                                codeExamples: [
                                    `import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';

function ProductDetail() {
    const { id } = useParams(); // reads the ":id" segment from the URL
    return <h2>Showing details for product #{id}</h2>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/products/:id" element={<ProductDetail />} />
            </Routes>
        </BrowserRouter>
    );
}
// Visiting "/products/42" renders: "Showing details for product #42"`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is client-side routing?</td><td>Swapping which components render based on the URL, without triggering a full page reload from the server</td></tr>
<tr class='text-center'><td>Difference between Link and a plain &lt;a&gt; tag in React Router?</td><td>Link intercepts the click and updates the route via JavaScript (no full reload); a plain &lt;a&gt; would trigger a full browser navigation</td></tr>
<tr class='text-center'><td>How do you read a dynamic route segment like /products/:id?</td><td>The useParams() hook, called inside the component rendered for that route</td></tr>
<tr class='text-center'><td>What wraps the whole app to enable routing?</td><td>BrowserRouter (or another Router variant), typically at the top of the component tree</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: "react-component-lifecycle",
                        name: "Component Lifecycle",
                        beginner: [
                            {
                                content: `<h3>The Three Lifecycle Phases</h3>
Every component goes through three phases: <strong>Mounting</strong> (being created and inserted into the DOM for the first time), <strong>Updating</strong> (re-rendering due to changed props or state), and <strong>Unmounting</strong> (being removed from the DOM). Class components exposed these phases as named methods; interviewers still ask about them even though functional components + hooks are now the standard.<br>`,
                                codeExamples: [
                                    `import { Component } from 'react';

class Greeting extends Component {
    componentDidMount() {
        console.log('Mounted - component is now in the DOM');
    }

    componentDidUpdate(prevProps) {
        console.log('Updated - props/state changed');
    }

    componentWillUnmount() {
        console.log('Unmounting - cleanup goes here');
    }

    render() {
        return <h2>Hello, {this.props.name}</h2>;
    }
}
// Renders a greeting; logs fire at each corresponding lifecycle moment.`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>How useEffect Maps Onto Class Lifecycle Methods</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Class lifecycle method</th><th>Functional-component equivalent</th></tr>
<tr class='text-center'><td>componentDidMount</td><td><code>useEffect(() => {...}, [])</code> - empty dependency array</td></tr>
<tr class='text-center'><td>componentDidUpdate</td><td><code>useEffect(() => {...}, [dep1, dep2])</code> - runs when listed deps change</td></tr>
<tr class='text-center'><td>componentWillUnmount</td><td>the cleanup function returned from <code>useEffect</code></td></tr>
</table>
<br>
This isn't a perfect 1:1 mapping conceptually (useEffect thinks in terms of "synchronizing with an external system" rather than discrete lifecycle events), but for interview purposes and everyday use, this table captures the practical equivalence.<br>`,
                                codeExamples: [
                                    `import { useEffect } from 'react';

function Greeting({ name }) {
    useEffect(() => {
        console.log('Mounted');
        return () => console.log('Unmounting - cleanup goes here');
    }, []); // componentDidMount + componentWillUnmount equivalent

    useEffect(() => {
        console.log('Updated because name changed');
    }, [name]); // componentDidUpdate equivalent, scoped to "name"

    return <h2>Hello, {name}</h2>;
}`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the three lifecycle phases of a React component?</td><td>Mounting, Updating, Unmounting</td></tr>
<tr class='text-center'><td>Which class lifecycle method is closest to useEffect(fn, [])?</td><td>componentDidMount - both run once, right after the component first renders</td></tr>
<tr class='text-center'><td>Where does cleanup logic go in a functional component?</td><td>In the function returned from useEffect, which React calls before re-running the effect and on unmount</td></tr>
<tr class='text-center'><td>Are class components still relevant to learn?</td><td>Mostly for reading legacy code and interviews - new code overwhelmingly uses functional components with hooks</td></tr>
</table>`
                            }
                        ]
                    },

                ]
            }

        ],

        cheatNotes: [
            "ReactJS - JavaScript library for building component-based user interfaces",
            "JSX - Syntax extension letting you write HTML-like markup in JavaScript",
            "Component - Reusable, self-contained piece of UI",
            "Functional component - Component written as a plain JS function",
            "Class component - Component written as an ES6 class extending React.Component",
            "Props - Read-only data passed from parent to child component",
            "State - Mutable data local to a component, triggers re-render on change",
            "Props vs State - Props are external/immutable, state is internal/mutable",
            "useState - Hook to add state to a functional component",
            "useEffect - Hook to run side effects after render (data fetching, subscriptions)",
            "useEffect cleanup - Return a function from useEffect to clean up on unmount",
            "Dependency array - Controls when useEffect re-runs",
            "useRef - Hook to persist a mutable value/DOM reference without re-rendering",
            "useContext - Hook to consume a Context value without prop drilling",
            "useMemo - Hook to memoize expensive computed values",
            "useCallback - Hook to memoize function references between renders",
            "Custom hooks - Reusable functions starting with 'use' that encapsulate hook logic",
            "Component lifecycle - Mounting, updating, unmounting phases",
            "componentDidMount/Update/WillUnmount - Class component lifecycle methods",
            "Conditional rendering - Rendering JSX based on conditions (ternary, &&, if)",
            "Lists & keys - key prop helps React identify changed/added/removed list items",
            "Event handling - Attaching handlers like onClick, onChange in JSX using camelCase",
            "Controlled component - Form input value driven by React state",
            "Uncontrolled component - Form input value managed by the DOM itself (via ref)",
            "Lifting state up - Moving shared state to the closest common ancestor",
            "Context API - Share data across component tree without passing props manually",
            "Virtual DOM - In-memory representation of the real DOM for efficient updates",
            "Reconciliation - React's diffing algorithm to update only changed DOM nodes",
            "React.memo - Higher-order component that memoizes a component to avoid re-renders",
            "React Router - Library for client-side routing/navigation in React apps",
            "<Routes>/<Route> - Define URL paths and matching components",
            "useNavigate - Hook to programmatically navigate between routes",
            "useParams - Hook to read dynamic route parameters",
            "Fragments (<>...</>) - Group elements without adding extra DOM nodes",
            "Prop drilling - Passing props through many nested levels of components",
            "SPA - Single Page Application, updates content without full page reload",
            "React supports server-side rendering (SSR) and static site generation (SSG)",
            "npm/create-react-app/Vite - Common tools to scaffold a React project",
            "One-way data binding - Data flows from parent to child in React"
        ],
        interviewQuestions: [
            {
                company: "Tech Company A",
                questions: [
                    "What is ReactJS and how does it differ from other JavaScript frameworks?",
                    "Explain the concept of virtual DOM in ReactJS.",
                    "How do you manage state in a React application?",
                    "What are React hooks and how do they work?"
                ]
            },
        ]
    }
]