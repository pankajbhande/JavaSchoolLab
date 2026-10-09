import { Topic } from '../coreJava';

export const softwareDevelopmentLifecycle: Topic = {
    id: 'sdlc',
    name: 'Software Development Lifecycle',
    beginner: [
        {
            content: `<h3>What is SDLC?</h3>
The Software Development Lifecycle (SDLC) is the sequence of phases a software product goes through, from the first idea
to being retired. It's a roadmap that tells a team "what needs to happen, in what order, to go from an idea to working,
maintained software." <br><br>

<strong>Real-world example:</strong> Building a house isn't just "start laying bricks." You survey the land, design the
blueprint, get approvals, build the foundation, build the structure, do interior finishing, and then maintain it over the
years. SDLC is the same idea applied to software.`
        },
        {
            content: `<h3>The 6 Core Phases</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1. Requirement Gathering & Analysis
        |
        v
2. Design (High-Level & Low-Level)
        |
        v
3. Implementation / Coding
        |
        v
4. Testing
        |
        v
5. Deployment
        |
        v
6. Maintenance</pre>`
        },
        {
            content: `<h3>Phase-by-Phase, in Plain Language</h3>
• <strong>Requirement Gathering</strong> - talk to stakeholders/customers, understand what they actually need. Output: a
requirements document. <br>
• <strong>Design</strong> - decide the architecture, database schema, and screen layouts before writing code. <br>
• <strong>Implementation</strong> - developers write the actual code based on the design. <br>
• <strong>Testing</strong> - QA verifies the software behaves correctly and finds bugs before customers do. <br>
• <strong>Deployment</strong> - the software is released to real users (production environment). <br>
• <strong>Maintenance</strong> - after release, bugs are fixed, and small improvements/patches are made over the product's life.`
        },
        {
            content: `<h3>Why Follow a Lifecycle Instead of "Just Coding"?</h3>
Skipping phases (e.g. jumping straight from an idea to code with no requirements or design) is the single biggest cause
of failed software projects. Following SDLC phases: <br>
• Catches misunderstandings about requirements before code is written (cheap to fix) <br>
• Ensures the software is properly tested before customers see it <br>
• Creates a paper trail (docs) that helps future engineers understand "why" decisions were made <br><br>

<strong>Example:</strong> If a team skips requirement gathering and builds a "login page" without knowing the client
needed OTP-based login (not just password), the whole feature might need to be rebuilt - far more expensive than getting
it right the first time.`
        }
    ],
    expert: [
        {
            content: `<h3>SDLC Deliverables Per Phase</h3>
Each SDLC phase produces a concrete deliverable that feeds into the next phase - this is what makes the lifecycle audit-able
in a real organization: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Phase</th><th>Deliverable</th><th>Owner</th></tr>
<tr><td>Requirement Analysis</td><td>SRS (Software Requirement Specification)</td><td>Business Analyst / Product Manager</td></tr>
<tr><td>Design</td><td>HLD (High-Level Design), LLD (Low-Level Design)</td><td>Architect</td></tr>
<tr><td>Implementation</td><td>Working, version-controlled source code</td><td>Developers</td></tr>
<tr><td>Testing</td><td>Test cases, bug reports, test summary report</td><td>QA Engineers</td></tr>
<tr><td>Deployment</td><td>Release notes, deployed build in production</td><td>DevOps / Release Manager</td></tr>
<tr><td>Maintenance</td><td>Patches, hotfixes, change requests</td><td>Support / Dev team</td></tr>
</table>`
        },
        {
            content: `<h3>SDLC vs SDLC Model</h3>
It's important to separate the concept from its implementations: <strong>SDLC is the set of phases</strong> (what needs to
happen); an <strong>SDLC Model</strong> (Waterfall, Agile, Spiral, V-Model, etc. - covered next) is <strong>how those
phases are arranged and repeated</strong> in practice - sequentially, iteratively, in parallel, or with heavy risk analysis.
Every SDLC model contains the same six phases in some form; they differ in ordering, overlap, and feedback loops.`
        },
        {
            content: `<h3>Requirements: Functional vs Non-Functional</h3>
A common real-world mistake is treating "requirements" as only features. There are two categories, both must be captured
during the requirement phase: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Functional Requirements</th><th>Non-Functional Requirements</th></tr>
<tr><td>What the system should DO (e.g. "user can reset password")</td><td>How well the system should perform (e.g. "password reset email must arrive within 5 seconds")</td></tr>
<tr><td>Directly tied to features</td><td>Tied to quality attributes: performance, security, scalability, availability</td></tr>
</table>
<br>
Missing non-functional requirements is a top cause of production incidents even when every feature "works" in the demo.`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>Requirement creep</strong> - new requirements keep getting added mid-project without adjusting timeline/budget. <br>
• <strong>Big-bang testing</strong> - saving all testing for the very end, so critical design bugs are found too late to
fix cheaply. <br>
• <strong>No traceability</strong> - unable to map a requirement to the code that implements it and the test that verifies
it, making impact analysis of change requests very hard. <br>
• <strong>Treating maintenance as an afterthought</strong> - in reality, most of a software product's total cost is spent
in the maintenance phase, not initial build.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is SDLC?</td><td>A structured sequence of phases (requirements, design, implementation, testing, deployment, maintenance) followed to develop and maintain software</td></tr>
<tr><td>What are the 6 core phases of SDLC?</td><td>Requirement Gathering & Analysis, Design, Implementation, Testing, Deployment, Maintenance</td></tr>
<tr><td>What's the difference between SDLC and an SDLC model?</td><td>SDLC is the set of phases; an SDLC model (Waterfall, Agile, Spiral, etc.) defines how those phases are ordered, overlapped, or repeated</td></tr>
<tr><td>What is an SRS document?</td><td>Software Requirement Specification - the formal document capturing what the system must do, produced during the requirement phase</td></tr>
<tr><td>Difference between functional and non-functional requirements?</td><td>Functional = what the system does (features); non-functional = quality attributes like performance, security, scalability</td></tr>
<tr><td>Why is skipping the design phase risky?</td><td>Without an architecture/blueprint, developers make ad-hoc structural decisions that often need expensive rework once the system grows</td></tr>
<tr><td>Which SDLC phase typically consumes the most cost over a product's life?</td><td>Maintenance - most software spends far longer being maintained/patched than it took to originally build</td></tr>
<tr><td>How would you handle a requirement that's discovered mid-development?</td><td>Log it as a change request, assess its impact on timeline/design/tests, and get stakeholder sign-off before implementing rather than silently absorbing scope creep</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: SDLC Phases Mapped to Real Tools</h3>
Each SDLC phase maps to concrete tooling a team uses daily, and artifacts flow from one tool to the next: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Requirements   Design        Implementation   Testing        Deployment      Maintenance
   |              |                |               |               |               |
 Jira/Confluence  Figma/draw.io   Git + IDE      Jenkins/GitHub   CI/CD pipeline  Jira bugs,
 (SRS, epics)     (HLD/LLD docs)  (feature       Actions (unit,   (Docker/K8s,    on-call
                                   branches)      integration      cloud deploy)   rotation
                                                  tests)
   \\______________\\________________\\______________\\______________\\______________/
                                        |
                            All traced back to the original
                             requirement/ticket ID (traceability)</pre>
This mapping is what makes SDLC "real" rather than theoretical - every phase leaves a trail in a tool that the next
phase's owner can pick up.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A shipped feature doesn't match what the client actually wanted, discovered after go-live</td><td>Requirement phase was rushed or skipped; assumptions were made instead of confirmed</td><td>Check if an SRS/requirements doc was signed off, or if the feature was built from a verbal request</td><td>Enforce a written, stakeholder-approved requirement artifact before design/coding begins</td></tr>
<tr><td>Every release introduces at least one regression in an unrelated feature</td><td>No traceability between requirements, code, and tests - impact analysis of changes is guesswork</td><td>Try to map a given requirement to the code and tests that cover it - usually impossible</td><td>Adopt requirement-to-test traceability (tag tests/tickets to requirement IDs) so change impact can be assessed before release</td></tr>
<tr><td>Support team is overwhelmed with bug reports months after launch</td><td>Maintenance was treated as an afterthought with no budget/staffing planned for it</td><td>Check whether the project plan allocated any resources to the maintenance phase</td><td>Budget and staff maintenance explicitly as its own SDLC phase, not as free capacity after "the real work" is done</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Skipping straight to coding</strong> - "we'll figure out requirements as we build," which almost always
leads to expensive rework once real gaps surface. <br>
• <strong>Big-bang testing</strong> - deferring all testing to a single phase at the very end instead of testing
incrementally, so defects from early phases are found (and are most expensive) very late. <br>
• <strong>Documentation as an afterthought</strong> - writing the SRS/design docs after the code is already built,
purely to satisfy an audit, rather than using them to actually guide development. <br>
• <strong>No phase gate/sign-off</strong> - moving to the next phase without any review or approval, so errors
compound silently across phases.`
        }
    ]
};
