import { Topic } from '../coreJava';

export const functionalRequirements: Topic = {
    id: 'functional-requirements',
    name: 'Functional Requirements',
    beginner: [
        {
            content: `<h3>What is a Functional Requirement?</h3>
A Functional Requirement (FR) describes <strong>what the system must do</strong> - a specific behavior, feature, or function that the software performs in response to some input. <br><br>

In simple words: if you can describe it as "System does X when Y happens", it is functional. <br><br>

<strong>Real example (e-commerce checkout):</strong> <br>
"The system shall allow a registered customer to apply a valid discount coupon code at checkout, and the order total shall be recalculated immediately."`
        },
        {
            content: `<h4>How Functional Requirements Are Usually Written</h4>
They are typically captured as: <br>
• A shall-statement ("The system shall...") <br>
• A user story ("As a customer, I want...") <br>
• A use case ("Customer applies coupon code") <br><br>

<strong>Sample User Story:</strong>`,
            codeExamples: [
                `As a customer,
I want to apply a coupon code during checkout,
So that I can get a discount on my order total.

Notes:
- Coupon must be validated against expiry date and usage limit.
- Invalid coupon shows an inline error message.
- Order total updates instantly without page reload.`
            ]
        },
        {
            content: `<h4>Functional vs Non-Functional (Quick Distinction)</h4>
A quick beginner test: functional requirements describe <strong>features/behavior</strong>; non-functional requirements describe <strong>qualities</strong> of those features (speed, security, usability). <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Functional Requirement</th><th>Non-Functional Requirement</th></tr>
<tr class='text-center'><td>User can log in with email and password</td><td>Login response must complete within 2 seconds</td></tr>
<tr class='text-center'><td>System sends an order confirmation email</td><td>Email must be delivered with 99.9% reliability</td></tr>
</table>`
        },
        {
            content: `<h4>Where Functional Requirements Come From</h4>
They are elicited from stakeholders through interviews, workshops, surveys, and observation, then documented in a Business Requirements Document (BRD) or Software Requirements Specification (SRS), and later broken down into user stories for a development backlog. <br><br>

A Business Analyst's job is to ask "what should the system actually do here?" and keep asking until the behavior is unambiguous and testable.`
        }
    ],
    expert: [
        {
            content: `<h3>Characteristics of a Good Functional Requirement</h3>
Industry teams judge FR quality against the INVEST/SMART-style checklist: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Clear        -> one behavior, no ambiguity ("fast" is not measurable)
Complete     -> covers normal flow + edge cases
Consistent   -> does not contradict another requirement
Verifiable   -> can be tested with a pass/fail result
Traceable    -> linked to a business need and to test cases
Feasible     -> technically and financially achievable</pre>

A requirement like "The system should be user-friendly" fails all of these - it is not testable. "The system shall allow checkout completion in 3 clicks or fewer" is testable.`
        },
        {
            content: `<h3>How Functional Requirements Flow Through the SDLC</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Stakeholder Need
      |
      v
Business Requirement (why)
      |
      v
Functional Requirement (what the system does)
      |
      v
User Story / Use Case (how the user experiences it)
      |
      v
Acceptance Criteria (how we prove it's done)
      |
      v
Test Cases (QA validation)</pre>

In real projects, a Business Analyst or Product Owner owns this chain and maintains a Requirements Traceability Matrix (RTM) so every functional requirement can be traced forward to a delivered, tested feature.`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>Mixing functional and non-functional in one line</strong> - "System shall process payment quickly" bundles a behavior with a performance target; split them. <br>
• <strong>Solutioning too early</strong> - writing "use a Redis cache" is a design decision, not a requirement; the requirement is the observable behavior/outcome. <br>
• <strong>Implicit requirements</strong> - assuming "of course it validates email format" without writing it down; undocumented assumptions cause scope disputes later. <br>
• <strong>Requirements creep</strong> - stakeholders add new functional asks mid-sprint without going through change control, breaking the traceability chain. <br>
• <strong>No acceptance criteria attached</strong> - a functional requirement without measurable acceptance criteria is not ready for development ("Definition of Ready" gate).`
        },
        {
            content: `<h3>Functional Requirements vs Related Artifacts</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Artifact</th><th>Purpose</th><th>Owner</th></tr>
<tr><td>Functional Requirement</td><td>Defines a system behavior/feature</td><td>Business Analyst / Product Owner</td></tr>
<tr><td>Use Case</td><td>Describes step-by-step interaction to achieve a goal</td><td>Business Analyst</td></tr>
<tr><td>User Story</td><td>Agile-format short description of a feature from user's perspective</td><td>Product Owner</td></tr>
<tr><td>Acceptance Criteria</td><td>Conditions that prove the requirement/story is done correctly</td><td>Product Owner / QA</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a functional requirement?</td><td>A statement of what the system must do - a specific feature or behavior triggered by input or an event.</td></tr>
<tr><td>How is a functional requirement different from a non-functional requirement?</td><td>Functional describes behavior/features; non-functional describes quality attributes like performance, security, and usability of those behaviors.</td></tr>
<tr><td>Who typically writes functional requirements?</td><td>Business Analysts, in collaboration with stakeholders, Product Owners, and technical leads.</td></tr>
<tr><td>What makes a functional requirement "good"?</td><td>It is clear, complete, consistent, verifiable, feasible, and traceable to a business need.</td></tr>
<tr><td>How do functional requirements relate to user stories?</td><td>A functional requirement is often decomposed into one or more user stories for agile delivery, each with its own acceptance criteria.</td></tr>
<tr><td>What tool is used to track requirement-to-delivery linkage?</td><td>A Requirements Traceability Matrix (RTM).</td></tr>
<tr><td>Give an example of a poorly written functional requirement and fix it.</td><td>Poor: "System should handle logins well." Fixed: "System shall lock a user account after 5 consecutive failed login attempts within 10 minutes."</td></tr>
<tr><td>Can a functional requirement change after development starts?</td><td>Yes, but it should go through formal change control/impact analysis, not be added informally mid-sprint.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Functional requirements don't live in a document forever - they flow through the delivery pipeline into a physical backlog and eventually into a deployed feature that traces back to them: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Stakeholder ask: "Customers keep abandoning cart at shipping cost surprise"
        |
        v
Business Analyst drafts FR-22: "System shall display shipping cost
                                 on the product page before checkout"
        |
        v
Refined into Jira Epic -> broken into User Stories (US-101, US-102)
        |
        v
Sprint Backlog (Sprint 9) -> Dev implements ShippingCostService
        |
        v
QA writes test cases (TC-201..204) directly from FR-22's shall-statement
        |
        v
Deployed to prod -> RTM row FR-22 marked "Done", linked to commit + TC IDs</pre>

A functional requirement that never gets this trail (no story, no test case, no deployed artifact) is effectively vaporware - written but never verified as delivered.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Customer support flooded with "coupon didn't apply" tickets</td><td>FR only specified the happy path ("system shall apply valid coupon"); expired/reused/case-sensitive code edge cases were never written down</td><td>Review the original FR text - confirm no edge-case behavior was specified or acceptance-tested</td><td>Rewrite FR to enumerate expected behavior for every input class (valid, expired, reused, malformed), then add matching test cases</td></tr>
<tr><td>Two teams built conflicting "cancel order" logic in the same release</td><td>The same functional behavior was captured twice, in two different documents, by two different BAs, with no single source of truth</td><td>Search the RTM/backlog for duplicate requirement IDs pointing at the same feature area</td><td>Consolidate into one canonical FR, deprecate the duplicate, and route all future changes through one owner</td></tr>
<tr><td>Feature shipped but sales says "this isn't what we asked for"</td><td>FR was written by inferring intent instead of validating it directly with the stakeholder who requested it</td><td>Compare the shipped behavior against the original stakeholder email/meeting notes, not just the written FR</td><td>Add a mandatory stakeholder sign-off step on the FR text before it enters the backlog</td></tr>
<tr><td>QA can't tell if a bug is "as designed" or a defect</td><td>FR was written as a vague statement ("system should handle discounts") with no measurable, testable condition</td><td>Check whether the FR has any pass/fail criteria attached at all</td><td>Rewrite using a testable shall-statement and attach explicit acceptance criteria before development starts</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Requirement-by-assumption</strong> - a developer infers what "the system shall do" from a Slack message instead of a documented, reviewed FR, so nothing is traceable when it breaks. <br>
• <strong>One giant FR covering an entire module</strong> - "System shall support checkout" is not a functional requirement, it's an epic; it can't be tested or estimated as written. <br>
• <strong>FRs frozen after sign-off with no change process</strong> - real products evolve; refusing any FR revision after initial approval just pushes the change underground into undocumented code. <br>
• <strong>Copy-pasting FRs from a similar past project</strong> without re-validating them against this project's actual stakeholders and constraints. <br>
• <strong>No distinction between "must have" and "nice to have" FRs</strong> - everything gets treated as equally critical, so prioritization during a schedule crunch becomes guesswork.`
        }
    ]
};
