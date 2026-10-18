import { Topic } from '../coreJava';

export const whatIsSoftware: Topic = {
    id: 'what-is-software',
    name: 'What is Software?',
    beginner: [
        {
            content: `<h3>What is Software?</h3>
Software is a set of instructions (code) that tells a computer's hardware what to do. <br>
Without software, hardware (CPU, RAM, disk, screen) is just electronic circuitry with nothing to execute. <br><br>

Think of hardware as the body and software as the brain that decides what the body does. <br><br>

<strong>Real-world example:</strong> A mobile banking app is software. The phone (hardware) can display a screen and process taps,
but it's the banking app's code that decides "when the user taps Send Money, deduct from balance, call the bank server, show confirmation."`
        },
        {
            content: `<h3>Types of Software</h3>
Software is broadly divided into two categories: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Purpose</th><th>Examples</th></tr>
<tr class='text-center'><td>System Software</td><td>Manages hardware and provides a platform for other software to run</td><td>Windows, Linux, macOS, Device Drivers</td></tr>
<tr class='text-center'><td>Application Software</td><td>Solves a specific end-user problem or task</td><td>MS Word, Chrome, WhatsApp, Zoom, an Online Shopping Website</td></tr>
</table>
<br>
Application software is further divided into: <br>
• <strong>System / Utility Applications</strong> - antivirus, file compression tools <br>
• <strong>Business Applications</strong> - CRM, ERP, banking systems <br>
• <strong>Web / Mobile Applications</strong> - the kind we build as software engineers (e.g. Amazon, Instagram)`
        },
        {
            content: `<h3>Characteristics of Good Software</h3>
Not all software is "good" software. Quality software has these attributes: <br><br>
• <strong>Functional correctness</strong> - it does what it's supposed to do <br>
• <strong>Reliability</strong> - it doesn't crash or produce wrong output <br>
• <strong>Usability</strong> - it's easy for a real user to operate <br>
• <strong>Efficiency</strong> - it uses memory/CPU/network sensibly <br>
• <strong>Maintainability</strong> - other developers can read, fix, and extend it later <br>
• <strong>Portability</strong> - it can run in different environments with minimal change <br><br>

<strong>Example:</strong> A food-delivery app that works fine with 10 test orders but crashes when 10,000 real
users order at once during lunch hour is functionally correct but not reliable or efficient - that's a quality gap engineers must catch before release.`
        },
        {
            content: `<h3>Software vs Program</h3>
Beginners often use "software" and "program" interchangeably, but there's a difference: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Program</th><th>Software</th></tr>
<tr><td>A single set of instructions written to perform one task</td><td>A complete product - programs + documentation + user interface + support</td></tr>
<tr><td>Example: a single .java file that adds two numbers</td><td>Example: a full e-commerce platform with checkout, payments, inventory, and admin panel</td></tr>
</table>
<br>
In short: <strong>many programs, working together with proper design and documentation, make up a piece of software.</strong>`
        }
    ],
    expert: [
        {
            content: `<h3>Software as an Engineering Product</h3>
From an industry standpoint, software is not just "code that runs" - it is a <strong>product</strong> with a lifecycle: it is
planned, built, tested, deployed, monitored, and eventually retired. Software engineers are responsible for the entire lifecycle,
not just writing the initial code. <br><br>

This is why the discipline of "Software Engineering" exists (covered in the next topic) - to bring engineering rigor
(process, measurement, quality control) to something that is otherwise just "writing instructions."`
        },
        {
            content: `<h3>Shrink-Wrapped vs Custom vs SaaS Software</h3>
In real engineering orgs, software is delivered in different models, and this affects how it's engineered: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Model</th><th>Description</th><th>Example</th></tr>
<tr><td>Shrink-wrapped / Packaged</td><td>Built once, sold as-is to many customers, installed locally</td><td>MS Office (traditional installer)</td></tr>
<tr><td>Custom / Bespoke</td><td>Built for one specific client's requirements</td><td>An internal HR system built for a single company</td></tr>
<tr><td>SaaS (Software as a Service)</td><td>Hosted centrally, accessed over the internet, continuously updated</td><td>Gmail, Slack, Salesforce</td></tr>
</table>
<br>
Most modern engineering jobs (especially in India's IT services and product companies) revolve around SaaS or custom
enterprise software, which is why concepts like CI/CD, cloud deployment, and DevOps (covered later) matter so much today.`
        },
        {
            content: `<h3>Common Pitfall: Confusing "It Works on My Machine" with "It's Good Software"</h3>
A frequent mistake among new engineers is treating a working demo as finished software. In production, software must
also handle: <br>
• Concurrent users (not just one tester) <br>
• Bad/malicious input (not just the happy path) <br>
• Network failures, timeouts, partial outages <br>
• Upgrades without downtime <br>
• Security and data privacy regulations <br><br>

This gap between "runs once for me" and "safe to ship to millions of users" is exactly what the Software Development
Lifecycle (SDLC) and its models exist to close - covered in the next few topics.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is software?</td><td>A set of instructions/programs, along with related data and documentation, that tells hardware what to do to solve a problem</td></tr>
<tr><td>What is the difference between system software and application software?</td><td>System software manages the hardware/platform (OS, drivers); application software solves an end-user's specific task (browser, app)</td></tr>
<tr><td>Is a single Java program "software"?</td><td>Not typically on its own - software usually refers to a complete, usable product; a single program is one building block of it</td></tr>
<tr><td>What makes software "good" beyond just working?</td><td>Reliability, usability, efficiency, maintainability, and portability - not just functional correctness</td></tr>
<tr><td>What's the difference between packaged software and SaaS?</td><td>Packaged software is installed and run locally per copy; SaaS is centrally hosted, accessed via the internet, and updated continuously for all users at once</td></tr>
<tr><td>Why does "it works on my machine" not guarantee good software?</td><td>Production software must handle concurrency, bad input, failures, and scale - conditions a single local demo never tests</td></tr>
<tr><td>Give a real-world example of software vs a program.</td><td>A calculator app with UI, history, and settings is software; the single function that adds two numbers inside it is a program/module</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: Where "Software" Lives in an Org</h3>
In a real engineering organization, "software" isn't a single artifact - it's a layered stack that different teams
own, and understanding this layering is essential before diving into SDLC/Agile topics: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   End Users (browser / mobile app)
          |
   Application Software  <-- product/feature teams build & own this
          |
   Middleware / Frameworks (Spring Boot, React runtime)
          |
   System Software (OS, container runtime)  <-- platform/infra teams own this
          |
   Hardware (servers, cloud VMs)</pre>
As a Java/full-stack engineer you mostly work at the "Application Software" layer, but you must understand that a bug
can originate at any layer - a slow API might be your code, the JVM's garbage collector, the container's memory limit,
or the underlying VM's disk I/O.`
        },
        {
            content: `<h3>Production Problems Traced Back to "What is Software" Fundamentals</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>App works perfectly for the demo but times out for real customers on launch day</td><td>Team treated a working program as finished software, ignoring reliability/efficiency under real load</td><td>Load-test against expected concurrent users; check response times as load increases</td><td>Add load/performance testing to the release checklist before every launch, not just functional testing</td></tr>
<tr><td>A single Java class works fine standalone but the "product" never ships</td><td>Confusing "a program runs" with "software is complete" - missing documentation, UI, error handling, packaging</td><td>Review what's actually deliverable vs what's just a code snippet</td><td>Define a clear "definition of done" that includes docs, tests, and packaging - not just working code</td></tr>
<tr><td>Software installed on a client's on-prem server behaves differently than the SaaS demo</td><td>Team built as SaaS mentally but delivery model was actually shrink-wrapped/on-prem</td><td>Check what deployment/delivery model was actually promised to the customer</td><td>Clarify delivery model (SaaS vs on-prem vs packaged) at requirements time, since it changes engineering decisions (updates, licensing, environment assumptions)</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>"It compiles, ship it"</strong> - treating successful compilation/local run as proof the software is
production-ready, skipping reliability, security, and usability checks. <br>
• <strong>Confusing a prototype with a product</strong> - a quick proof-of-concept gets pushed straight to real
customers without the hardening (error handling, logging, tests) that separates a program from software. <br>
• <strong>Ignoring non-functional quality until it's a crisis</strong> - only thinking about performance/security after
an outage or breach, instead of designing for them from the start. <br>
• <strong>One giant "program" instead of well-structured software</strong> - a single massive file/class with no
modularity, documentation, or separation of concerns, making the "software" impossible to maintain as a team.`
        }
    ]
};
