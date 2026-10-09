import { Topic } from '../coreJava';

export const softwareEngineeringOverview: Topic = {
    id: 'software-engineering',
    name: 'Software Engineering',
    beginner: [
        {
            content: `<h3>What is Software Engineering?</h3>
Software Engineering is the application of engineering principles - planning, design, testing, measurement, and disciplined
process - to building software. <br><br>

It's the difference between "one person hacking together a script over a weekend" and "a team systematically building,
testing, and maintaining a product that millions of people depend on." <br><br>

<strong>Real-world example:</strong> Writing a to-do list app for yourself in an afternoon is coding. Building a to-do
list app that a company sells to 50,000 paying customers - with requirements gathering, design reviews, automated tests,
staged deployments, and support - is software engineering.`
        },
        {
            content: `<h3>Why Do We Need Software Engineering?</h3>
As software projects grow, ad-hoc coding breaks down. Software engineering exists to solve real problems that show up at scale: <br><br>
• <strong>Complexity</strong> - a single developer can hold a 200-line script in their head; nobody can hold a
2-million-line codebase in their head, so structure and process are required. <br>
• <strong>Team coordination</strong> - many engineers must work on the same codebase without stepping on each other. <br>
• <strong>Changing requirements</strong> - what the business needs today is rarely what it needed 6 months ago. <br>
• <strong>Quality at scale</strong> - a bug that's a minor annoyance for 1 user becomes a major outage for 1 million users.`
        },
        {
            content: `<h3>Core Activities of Software Engineering</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Requirements  -->  Design  -->  Implementation  -->  Testing  -->  Deployment  -->  Maintenance
  (What to      (How to       (Write the         (Verify it     (Ship to        (Fix bugs,
   build?)       build it?)    code)              works)         users)          add features)</pre>

These activities are collectively called the <strong>Software Development Lifecycle (SDLC)</strong> - covered in detail
in the next topic. Software engineering is essentially the discipline of doing all of these activities well, repeatably,
and as a team.`
        },
        {
            content: `<h3>Software Engineering vs Just Programming</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Programming</th><th>Software Engineering</th></tr>
<tr><td>Focuses on writing code that works</td><td>Focuses on writing code that works, is tested, documented, maintainable, and deployable</td></tr>
<tr><td>Usually an individual activity</td><td>Usually a team activity with defined roles</td></tr>
<tr><td>Success = "it runs"</td><td>Success = "it runs correctly, reliably, at scale, and can be safely changed later"</td></tr>
</table>`
        }
    ],
    expert: [
        {
            content: `<h3>Software Engineering as a Discipline</h3>
The term "Software Engineering" was popularized after the 1968 NATO Software Engineering Conference, which was convened
specifically because ad-hoc software development was causing the "software crisis" - projects running massively over
budget, over schedule, and full of defects. That history matters: the entire field exists because unstructured coding
does not scale to real business problems. <br><br>

Modern software engineering borrows engineering discipline from other fields (measurement, repeatable process, quality
gates) while acknowledging that software is fundamentally different from physical engineering - it's cheap to change,
has no physical wear, and requirements shift constantly.`
        },
        {
            content: `<h3>Roles in a Real Engineering Org</h3>
A production software team is rarely just "developers." Understanding these roles helps you understand who you'll
collaborate with: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Role</th><th>Responsibility</th></tr>
<tr><td>Product Manager / Business Analyst</td><td>Defines what to build and why (requirements)</td></tr>
<tr><td>Software Architect</td><td>Defines the high-level technical design/system structure</td></tr>
<tr><td>Software Developer / Engineer</td><td>Implements the design as working code</td></tr>
<tr><td>QA / Test Engineer</td><td>Verifies the software meets requirements and finds defects</td></tr>
<tr><td>DevOps / SRE Engineer</td><td>Builds pipelines, deploys, and keeps the system running in production</td></tr>
<tr><td>Project Manager / Scrum Master</td><td>Coordinates the team, timeline, and process</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls Engineering Teams Fall Into</h3>
• <strong>Skipping requirements clarity</strong> - building the wrong thing efficiently is still a failure. <br>
• <strong>No automated tests</strong> - every change risks silently breaking existing features. <br>
• <strong>Big-bang releases</strong> - deploying huge, untested changes all at once instead of small, verifiable increments. <br>
• <strong>Ignoring non-functional requirements</strong> - focusing only on features, not performance, security, or scalability. <br>
• <strong>No documentation</strong> - knowledge trapped in one engineer's head becomes a critical risk when they leave. <br><br>

Good software engineering process (SDLC models, Agile, DevOps - all covered next) exists specifically to prevent these pitfalls.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is software engineering?</td><td>The systematic application of engineering principles - planning, design, testing, process, and maintenance - to the development of software</td></tr>
<tr><td>How is software engineering different from programming?</td><td>Programming is writing code that works; software engineering also covers requirements, design, testing, deployment, documentation, and long-term maintainability, usually as a team</td></tr>
<tr><td>Why did software engineering emerge as a discipline?</td><td>To address the "software crisis" of the 1960s-70s where unstructured, ad-hoc development led to massive budget/schedule overruns and unreliable systems</td></tr>
<tr><td>What are the core activities in software engineering?</td><td>Requirements gathering, design, implementation, testing, deployment, and maintenance</td></tr>
<tr><td>What is a non-functional requirement, and why does it matter?</td><td>A quality attribute like performance, security, or scalability rather than a feature - ignoring these is a common cause of production failures even when features "work"</td></tr>
<tr><td>Name three roles typically found on a software engineering team besides developers.</td><td>Any three of: Product Manager/BA, Architect, QA Engineer, DevOps/SRE Engineer, Scrum Master/Project Manager</td></tr>
<tr><td>How would you apply software engineering discipline to a personal side project?</td><td>Write down requirements before coding, break work into small testable increments, write at least basic tests, and keep short documentation/README even if working solo</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: Where Engineering Discipline Shows Up Day-to-Day</h3>
Software engineering discipline isn't an abstract idea - it's embedded in the concrete tools and gates a real team
uses every day: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Requirements  -->  Design Review  -->  Code + PR Review  -->  Automated Tests (CI)
     |                   |                     |                      |
  Jira/Confluence   Architecture doc,    GitHub/GitLab PR,      Unit/Integration
  ticket, SRS       ADRs, diagrams       2+ reviewer approval    tests must pass
                                                |
                                                v
                              Merge --> CD Pipeline --> Staging --> Production --> Monitoring</pre>
Every box in this chain is a concrete, real engineering-discipline checkpoint - skipping any one of them (no
requirements ticket, no code review, no tests) is exactly the kind of ad-hoc coding software engineering exists to prevent.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A "simple" feature takes 3x longer than estimated and breaks two other features</td><td>No architect/design review before coding; developer jumped straight from a one-line requirement to code</td><td>Check whether any design discussion or diagram existed before implementation started</td><td>Require a lightweight design review (even a short doc or diagram) for any change touching shared code</td></tr>
<tr><td>New hire cannot understand why the system is built the way it is</td><td>No documentation of past engineering decisions - "tribal knowledge" lives only in senior engineers' heads</td><td>Search for architecture decision records (ADRs) or design docs - usually none exist</td><td>Adopt lightweight ADRs for significant technical decisions so reasoning survives team turnover</td></tr>
<tr><td>A critical production bug traces back to a requirement that was "obvious" to the developer but wrong</td><td>Requirements were gathered informally (a Slack message) with no sign-off or QA review</td><td>Trace the feature back to its original requirement source</td><td>Route all requirements through a documented process (ticket + acceptance criteria) reviewed by QA/BA before implementation</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>"Cowboy coding"</strong> - skipping design, review, and testing because "we know what we're doing," which
scales fine for a solo script but collapses on a real team codebase. <br>
• <strong>Hero culture</strong> - relying on one senior engineer to firefight every production issue instead of
building processes (tests, monitoring, documentation) that make the team resilient without heroics. <br>
• <strong>Process for process's sake</strong> - adding heavy ceremony (multi-week sign-offs for trivial changes)
that slows the team down without improving quality - engineering discipline should be proportional to risk. <br>
• <strong>Treating QA as "someone else's job"</strong> - developers throwing code over the wall to QA instead of
owning quality themselves through unit tests and code review.`
        }
    ]
};
