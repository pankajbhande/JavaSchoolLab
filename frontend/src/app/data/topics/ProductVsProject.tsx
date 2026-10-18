import { Topic } from '../coreJava';

export const productVsProject: Topic = {
    id: 'product-vs-project',
    name: 'Product vs Project',
    beginner: [
        {
            content: `<h3>What is a Project?</h3>
A project is a temporary effort with a defined start and end date, undertaken to deliver a specific, one-time outcome.
Once the outcome is delivered, the project is considered "done." <br><br>

<strong>Real-world example:</strong> An IT services company building a custom "Inventory Management System" for a single
retail client, over 6 months, is a project. Once it's delivered and accepted by the client, the project closes.`
        },
        {
            content: `<h3>What is a Product?</h3>
A product is something built to be used continuously by many customers, evolving indefinitely over time - there is no
fixed "end date." It keeps getting new features, fixes, and improvements for as long as it exists in the market. <br><br>

<strong>Real-world example:</strong> Gmail, Instagram, or a company's own SaaS platform are products. They were never
"finished" on a specific date - they've been continuously improved for years and will keep changing.`
        },
        {
            content: `<h3>Side-by-Side Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Project</th><th>Product</th></tr>
<tr><td>Duration</td><td>Temporary - has a defined end date</td><td>Ongoing - no fixed end date</td></tr>
<tr><td>Goal</td><td>Deliver a specific, agreed outcome</td><td>Continuously grow, improve, and retain users</td></tr>
<tr><td>Team</td><td>Often disbanded/reassigned after delivery</td><td>Stays with the product long-term</td></tr>
<tr><td>Success measure</td><td>Delivered on time, on budget, per scope</td><td>User adoption, revenue, retention, growth</td></tr>
</table>`
        },
        {
            content: `<h3>Why This Distinction Matters to You as an Engineer</h3>
The kind of company/team you join shapes your day-to-day work: <br>
• In a <strong>project-based</strong> company (typical IT services/outsourcing firm), you might work on a client's
system for months, then move to a completely different client and technology stack next. <br>
• In a <strong>product-based</strong> company (e.g. a SaaS startup), you stay with the same codebase for years, deeply
understanding its history, and your work is judged by how the product performs for real, ongoing users - not just
"was it delivered."`
        }
    ],
    expert: [
        {
            content: `<h3>Project-Based vs Product-Based Companies</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Project-Based (e.g. IT Services/Outsourcing)</th><th>Product-Based (e.g. SaaS Company)</th></tr>
<tr><td>Revenue model</td><td>Billed per project/contract (fixed price or time & material)</td><td>Recurring revenue (subscriptions, usage-based)</td></tr>
<tr><td>Requirements</td><td>Defined by the client, contractually fixed at some point</td><td>Owned internally, driven by market/user research</td></tr>
<tr><td>Typical SDLC fit</td><td>Often Waterfall or Water-Scrum-Fall (fixed scope, fixed budget)</td><td>Usually Agile (Scrum/Kanban) with continuous iteration</td></tr>
<tr><td>Engineer's exposure</td><td>Multiple domains/clients over a career; broad but shallower context per project</td><td>Deep, long-term ownership of one product's architecture and history</td></tr>
<tr><td>Post-delivery</td><td>Usually handed off to a separate maintenance/support team or the client</td><td>Same team continues to own it indefinitely</td></tr>
</table>`
        },
        {
            content: `<h3>The Hybrid Reality: "Product Thinking" Inside a Project</h3>
Many modern services companies now try to apply "product thinking" even to client projects - meaning they engage early
to understand end-user needs (not just what the client contractually specified), build with an eye toward long-term
maintainability, and often stay on to run/support what they built (turning a project into an ongoing product
relationship). This blurs the historical line between the two models and is increasingly common in real engagements.`
        },
        {
            content: `<h3>Project Management vs Product Management</h3>
These two roles are often confused but focus on different questions: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Project Manager</th><th>Product Manager</th></tr>
<tr><td>Asks: "Are we on schedule and budget to deliver the agreed scope?"</td><td>Asks: "Are we building the right thing for our users/market?"</td></tr>
<tr><td>Success = delivered on time, on budget, matching the spec</td><td>Success = users adopt it, it solves the problem, it drives business metrics</td></tr>
<tr><td>Typically tied to a defined end date</td><td>Owns the product indefinitely, iterating based on data/feedback</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What's the core difference between a project and a product?</td><td>A project is temporary with a defined end date and specific deliverable; a product is ongoing, continuously evolving with no fixed end date</td></tr>
<tr><td>Give an example of a project and a product.</td><td>Project: a custom inventory system built for one client over 6 months. Product: Gmail, which has been continuously developed and improved for years</td></tr>
<tr><td>Which SDLC model typically fits project-based work better, and why?</td><td>Waterfall or Water-Scrum-Fall - fixed-price/fixed-scope contracts favor upfront planning and predictable milestones</td></tr>
<tr><td>How does an engineer's experience differ between a project-based and a product-based company?</td><td>Project-based: broad exposure across multiple clients/domains but shorter-term context each time. Product-based: deep, long-term ownership of one codebase's architecture and history</td></tr>
<tr><td>What's the difference between a Project Manager and a Product Manager?</td><td>A PM (project) focuses on delivering agreed scope on time/budget; a PM (product) focuses on building the right thing for users and driving ongoing business outcomes</td></tr>
<tr><td>What does "product thinking inside a project" mean?</td><td>Applying long-term, user-focused ownership mindset even to a contractually bounded client project, e.g. staying on to support/evolve what was built rather than a one-time handoff</td></tr>
<tr><td>How would you measure success differently for a project vs a product?</td><td>Project success = delivered on time/budget/scope; product success = adoption, retention, revenue, and user satisfaction over time</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: How the Distinction Shapes Team Structure</h3>
The project-vs-product distinction directly determines how an engineering org is organized and funded: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Project-based org (services/consulting)         Product-based org (SaaS company)
--------------------------------------          --------------------------------------
Sales signs client contract                      Product roadmap set by PM + leadership
        |                                                 |
Project team staffed (temp)                      Cross-functional squad (permanent)
        |                                                 |
Build --> Client UAT --> Handoff                  Build --> Ship --> Measure --> Iterate
        |                                                 |               ^
Team disbands / reassigned                        Same team owns it     |
to next client project                            indefinitely  --------+ (feedback loop)</pre>
This is why "which kind of company should I join" is a real career decision - it changes whether your day-to-day
work involves rotating client contexts or long-term ownership of one system's evolution.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A delivered client project breaks within weeks of handoff with nobody available to fix it</td><td>Project treated as "done at delivery" with no maintenance/support plan built into the contract</td><td>Check if the contract/scope included any post-delivery support period</td><td>Negotiate a maintenance/support phase (or SLA) into every project contract, not just the build phase</td></tr>
<tr><td>A product team keeps shipping features nobody uses, and engagement keeps dropping</td><td>Team is executing like a project (deliver the spec) instead of a product (validate with users, iterate)</td><td>Check whether feature decisions are based on user data/feedback or just a fixed roadmap handed down</td><td>Adopt product-thinking practices - usage analytics, user interviews, iterative validation - before committing engineering time</td></tr>
<tr><td>Institutional knowledge about "why" a system was built a certain way disappears every 6-12 months</td><td>Project-based staffing rotates engineers off a codebase as soon as it's "delivered," with no continuity plan</td><td>Check team tenure on the codebase against how long the codebase has been live</td><td>For long-lived client systems, retain at least one engineer with continuity across releases, or invest more heavily in documentation/ADRs before rotation</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Running a product like a one-off project</strong> - shipping a big-bang release and considering the
work "done," instead of treating launch as the start of an ongoing feedback loop. <br>
• <strong>Running a client project like an open-ended product</strong> - letting scope creep indefinitely because
"we'll just keep improving it," blowing past the agreed budget/timeline with no formal change control. <br>
• <strong>No handoff plan for project-based work</strong> - delivering code with no documentation or support
window, leaving the client unable to maintain it themselves. <br>
• <strong>Conflating a Project Manager's and Product Manager's incentives</strong> - letting a PM optimize purely
for "on time, on budget" delivery of a product feature when the real measure of success should be user adoption.`
        }
    ]
};
