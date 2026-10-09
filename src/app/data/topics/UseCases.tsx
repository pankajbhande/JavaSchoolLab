import { Topic } from '../coreJava';

export const useCases: Topic = {
    id: 'use-cases',
    name: 'Use Cases',
    beginner: [
        {
            content: `<h3>What is a Use Case?</h3>
A Use Case is a detailed, step-by-step description of how a user (called an "Actor") interacts with a system to achieve a specific goal. It captures the main flow, alternate flows, and exception flows - more detailed than a user story, less code-focused than a technical spec.`
        },
        {
            content: `<h4>Sample Use Case (e-commerce checkout)</h4>`,
            codeExamples: [
                `Use Case: Apply Coupon Code at Checkout

Actor: Registered Customer

Preconditions: Customer is logged in and has items in the cart

Main Flow:
1. Customer navigates to the checkout page.
2. Customer enters a coupon code in the "Coupon" field.
3. Customer clicks "Apply".
4. System validates the coupon (exists, not expired, not already used).
5. System recalculates the order total with the discount applied.
6. System displays the updated total and a success message.

Alternate Flow (Invalid Coupon):
4a. System finds the coupon invalid or expired.
4b. System displays an error message.
4c. Order total remains unchanged.

Postconditions: Order total reflects the discount (if coupon was valid).`
            ]
        },
        {
            content: `<h4>Key Parts of a Use Case</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Element</th><th>Meaning</th></tr>
<tr><td>Actor</td><td>Who or what interacts with the system (user, admin, external system)</td></tr>
<tr><td>Preconditions</td><td>What must be true before the use case can start</td></tr>
<tr><td>Main Flow (Basic Flow)</td><td>The typical, successful step-by-step path</td></tr>
<tr><td>Alternate/Exception Flow</td><td>What happens when something deviates from the main path</td></tr>
<tr><td>Postconditions</td><td>The state of the system after the use case completes</td></tr>
</table>`
        },
        {
            content: `<h4>Use Case vs User Story (Beginner View)</h4>
A user story is short and conversational ("As a customer, I want to apply a coupon so that I save money"). A use case is longer and more formal, spelling out every step and what can go wrong. Many teams use user stories for agile backlogs and reserve full use cases for complex workflows (e.g., loan approval, insurance claims) where all paths must be documented precisely.`
        }
    ],
    expert: [
        {
            content: `<h3>Use Case Diagram vs Use Case Description</h3>
UML defines two complementary artifacts: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Use Case Diagram (visual, high-level)
   Actor --- (Use Case bubble) --- Actor
   Shows WHO interacts with WHAT, and relationships
   between use cases (include, extend, generalize)

Use Case Description (textual, detailed)
   Actor, preconditions, main flow, alternate flows,
   postconditions, business rules
   Shows exactly HOW the interaction unfolds, step by step</pre>

The diagram gives stakeholders a system-wide map; the description gives developers/testers the precision needed to build and verify.`
        },
        {
            content: `<h3>Include vs Extend Relationships</h3>
Two UML relationships often confused in interviews: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Relationship</th><th>Meaning</th><th>Example</th></tr>
<tr><td>&lt;&lt;include&gt;&gt;</td><td>Mandatory sub-behavior always performed as part of the base use case</td><td>"Checkout" always includes "Validate Payment"</td></tr>
<tr><td>&lt;&lt;extend&gt;&gt;</td><td>Optional behavior that may occur under certain conditions</td><td>"Checkout" may optionally extend to "Apply Coupon" if the customer has one</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>Writing use cases at the UI level</strong> - "Click the blue button" ties the use case to a specific design; write in terms of user intent ("Submit payment"), keeping it design-agnostic. <br>
• <strong>Missing exception flows</strong> - teams document only the happy path, then discover in UAT that failure scenarios (timeout, invalid data, concurrent edits) were never specified. <br>
• <strong>Actor confusion</strong> - forgetting that "Actor" can be a system/external service (e.g., "Payment Gateway"), not just a human user. <br>
• <strong>Over-documenting simple features</strong> - writing a full use case for a trivial CRUD screen is wasted effort; reserve detailed use cases for genuinely complex, multi-path workflows.`
        },
        {
            content: `<h3>Use Cases in the Requirements Ecosystem</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Artifact</th><th>Granularity</th><th>Typical Use</th></tr>
<tr><td>Business Requirement</td><td>Very high-level goal</td><td>Why the project exists</td></tr>
<tr><td>Use Case</td><td>Detailed, multi-step interaction</td><td>Complex workflows (loan approval, order fulfillment)</td></tr>
<tr><td>User Story</td><td>Small, single-sprint slice</td><td>Agile backlog items</td></tr>
<tr><td>Acceptance Criteria</td><td>Testable pass/fail conditions</td><td>Verifying a story or use case is complete</td></tr>
</table>
In practice, many agile teams derive user stories directly FROM a use case's main and alternate flows - each flow can become its own story with its own acceptance criteria.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a use case?</td><td>A detailed description of the step-by-step interaction between an actor and a system to achieve a specific goal, including main and alternate flows.</td></tr>
<tr><td>What is an Actor in a use case?</td><td>Any user or external system that interacts with the system being described - can be human or another system.</td></tr>
<tr><td>Difference between &lt;&lt;include&gt;&gt; and &lt;&lt;extend&gt;&gt;?</td><td>Include is mandatory sub-behavior always executed; extend is optional behavior triggered only under certain conditions.</td></tr>
<tr><td>How is a use case different from a user story?</td><td>A use case is detailed and formal, covering all flows including exceptions; a user story is short, conversational, and typically covers one specific slice for agile delivery.</td></tr>
<tr><td>What are preconditions and postconditions?</td><td>Preconditions define what must be true before the use case starts; postconditions define the resulting system state after it completes.</td></tr>
<tr><td>When would you write a full use case instead of just user stories?</td><td>For complex, multi-path business workflows (e.g., loan approval, insurance claims) where all flows and business rules must be documented precisely.</td></tr>
<tr><td>What is a use case diagram used for?</td><td>To give a high-level, visual map of actors, use cases, and their relationships across a system.</td></tr>
<tr><td>Name a common mistake when writing exception flows.</td><td>Omitting them entirely and documenting only the happy path, which leads to gaps discovered late in UAT or production.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Use cases typically sit above the sprint-level backlog, feeding multiple user stories and serving as the reference document when complex, multi-actor workflows need to be reconciled across teams: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Business need: "Loan approval process must be fully documented
                for regulatory audit"
        |
        v
Use Case: "Approve Personal Loan Application"
   Actors: Applicant, Loan Officer, Credit Bureau (external system)
   Main Flow (8 steps) + 3 Alternate Flows + 2 Exception Flows
        |
        v
Each flow decomposed into its own User Story with its own AC:
   US-30: Main flow - standard approval
   US-31: Alternate flow - manual review required
   US-32: Exception flow - credit bureau timeout
        |
        v
Stories built across multiple sprints, but ALL trace back to the
same Use Case document, which auditors review as the master spec</pre>

This is why use cases persist as living documents even in agile teams - they're the connective tissue when a single business process spans many stories and multiple actors/systems.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Loan application silently stuck when credit bureau API times out</td><td>Use case documented only the main flow; the credit bureau timeout exception flow was never written or built</td><td>Check the use case document for an exception flow covering external system failure</td><td>Add explicit exception flows for every external system call and build corresponding error-handling stories</td></tr>
<tr><td>Compliance audit fails because a workflow step can't be explained</td><td>Use case was written at a UI level ("click submit") instead of describing business intent, and got out of sync once the UI was redesigned</td><td>Compare the use case document against the current live UI/workflow</td><td>Rewrite use cases in terms of user intent, decoupled from UI specifics, and review after major UI changes</td></tr>
<tr><td>Two different departments each think they own the "Actor"</td><td>Use case never clarified whether "Customer Service Rep" and "Loan Officer" are the same actor or different ones with different permissions</td><td>Review actor definitions for ambiguity/overlap</td><td>Explicitly define and disambiguate every actor, including their permission boundaries, before writing flows</td></tr>
<tr><td>Simple password-reset screen took 3 days to spec</td><td>Team wrote a full formal use case (all sections) for a trivial single-step CRUD interaction</td><td>Compare effort spent against workflow complexity</td><td>Reserve full use case documentation for genuinely multi-path, multi-actor workflows; use a short user story for simple screens</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>UI-coupled use cases</strong> - describing "click the blue Apply button" instead of the underlying intent, so the document breaks the moment the UI changes. <br>
• <strong>Happy-path-only documentation</strong> - exception and alternate flows treated as optional extras instead of first-class parts of the use case. <br>
• <strong>Actors left implicit</strong> - forgetting that external systems (payment gateway, credit bureau) are actors too, and need their own failure-mode flows documented. <br>
• <strong>Full use case ceremony for trivial features</strong> - burning days documenting a workflow that has one path and no real ambiguity. <br>
• <strong>Use case written once, never reconciled with the delivered user stories</strong> - drifts out of sync as stories evolve during sprints, so it stops being trustworthy as the audit-ready source of truth.`
        }
    ]
};
