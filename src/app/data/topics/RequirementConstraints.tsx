import { Topic } from '../coreJava';

export const requirementConstraints: Topic = {
    id: 'constraints',
    name: 'Constraints',
    beginner: [
        {
            content: `<h3>What is a Constraint?</h3>
A Constraint is a restriction or limitation placed on the project or solution that the team must work within - something that is NOT negotiable and NOT a feature to design, but a boundary the design must respect. <br><br>

<strong>Real example (e-commerce checkout):</strong> <br>
"The system must use the company's existing payment gateway (PayGate Inc.) - no other payment provider may be integrated." <br>
This isn't a feature request; it restricts which solutions are even allowed.`
        },
        {
            content: `<h4>Common Types of Constraints</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Example</th></tr>
<tr><td>Technical</td><td>Must run on existing on-premise servers, no cloud migration allowed</td></tr>
<tr><td>Budget</td><td>Total project cost cannot exceed $150,000</td></tr>
<tr><td>Schedule/Time</td><td>Must launch before the Black Friday sale on Nov 28</td></tr>
<tr><td>Regulatory/Legal</td><td>Must comply with PCI-DSS for storing card data</td></tr>
<tr><td>Resource</td><td>Only 2 backend developers available for this project</td></tr>
<tr><td>Organizational</td><td>Must use the company's approved UI design system</td></tr>
</table>`
        },
        {
            content: `<h4>Constraint vs Requirement (Beginner Distinction)</h4>
A requirement describes something the system must DO or BE; a constraint restricts the HOW - the boundaries within which the solution must be built. "System shall process refunds" is a requirement. "Refund processing must use the existing accounting system's API" is a constraint on how that requirement can be fulfilled.`
        },
        {
            content: `<h4>Why Constraints Matter Early</h4>
Constraints must be identified at the very start of a project - during business requirements gathering - because they shape which solutions are even feasible. Discovering a hard constraint (e.g., a legal restriction) mid-project can force a costly redesign.`
        }
    ],
    expert: [
        {
            content: `<h3>Constraints Shape the Solution Space</h3>
Think of constraints as walls around the space of possible solutions - the team can be creative within the walls, but not outside them: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">          +-----------------------------------+
          |     Solution Space (allowed)       |
          |   +---------------------------+    |
          |   |  Feasible designs that     |    |
          |   |  satisfy all requirements  |    |
          |   |  AND respect constraints   |    |
          |   +---------------------------+    |
          |  Budget wall | Tech stack wall     |
          |  Regulatory wall | Timeline wall   |
          +-----------------------------------+</pre>

A Business Analyst's job includes actively surfacing hidden constraints (legacy system limitations, vendor contracts, compliance mandates) before architecture decisions are locked in.`
        },
        {
            content: `<h3>Negotiable vs Non-Negotiable Constraints</h3>
Not all "constraints" stated by stakeholders are truly fixed - some are preferences mistaken for constraints. A skilled BA probes to distinguish them: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Stated Constraint</th><th>Probing Question</th><th>Often Reveals</th></tr>
<tr><td>"Must launch by end of quarter"</td><td>"What happens if we slip 2 weeks?"</td><td>Sometimes a genuine hard deadline (regulatory), sometimes a soft internal target</td></tr>
<tr><td>"Must use vendor X"</td><td>"Is there a signed contract, or just past preference?"</td><td>Contractual constraints are hard; habits are negotiable</td></tr>
<tr><td>"Budget is $100k"</td><td>"Is more funding possible with a stronger business case?"</td><td>Often negotiable with executive sponsorship</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>Mislabeling requirements as constraints</strong> - "must support 10,000 users" is a non-functional requirement (a target to design for), not a constraint (a fixed boundary already imposed from outside). <br>
• <strong>Not documenting the source of a constraint</strong> - if the reason ("legal mandate" vs "personal preference of a stakeholder") isn't recorded, the constraint can't be challenged or revisited later when circumstances change. <br>
• <strong>Constraints discovered too late</strong> - e.g., learning mid-development that a data-residency law prohibits storing customer data outside a country, forcing architecture rework. <br>
• <strong>Ignoring constraint conflicts</strong> - "must launch in 4 weeks" and "must integrate with a vendor that has an 8-week onboarding process" directly conflict; this must be escalated, not silently absorbed by the dev team.`
        },
        {
            content: `<h3>Documenting Constraints</h3>
Constraints are typically captured in the BRD/SRS in their own dedicated section, each with an ID, description, source/rationale, and impact, so they can be traced and revisited: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">CON-01 | Must use existing PayGate payment gateway
       | Source: signed vendor contract through 2027
       | Impact: No alternative payment provider evaluation needed

CON-02 | Must comply with PCI-DSS for card data
       | Source: Legal/Compliance mandate
       | Impact: Card data cannot be stored in plaintext; requires
       |         tokenization via gateway</pre>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a constraint in requirements engineering?</td><td>A restriction or limitation on the solution - technical, budget, schedule, regulatory, or resource-based - that the design must operate within.</td></tr>
<tr><td>How is a constraint different from a requirement?</td><td>A requirement describes what the system must do/be; a constraint restricts how it can be built (the boundaries of the solution space).</td></tr>
<tr><td>Give 3 categories of constraints.</td><td>Technical, budget, schedule/time (also regulatory/legal, resource, organizational).</td></tr>
<tr><td>Why should constraints be identified early in a project?</td><td>They shape which solutions are even feasible; discovering one late can force costly redesign or rework.</td></tr>
<tr><td>How do you tell a true constraint from a stated preference?</td><td>Probe the source - ask what happens if it isn't honored, and whether there's a contractual/legal/technical basis versus personal preference.</td></tr>
<tr><td>What should be recorded alongside each constraint?</td><td>Its source/rationale and its impact on the solution, so it can be traced and revisited if circumstances change.</td></tr>
<tr><td>What happens when two constraints conflict?</td><td>It must be escalated to stakeholders/sponsors for a decision - it cannot be silently resolved by the delivery team.</td></tr>
<tr><td>Give an example of a mislabeled constraint.</td><td>"Must support 10,000 concurrent users" is often mislabeled as a constraint but is actually a non-functional requirement - a performance target to design for, not a pre-existing restriction.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Constraints are usually surfaced during business requirements gathering and architecture review, and they gate which technical options are even allowed onto the table before any design work begins: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Business requirements workshop uncovers:
  "Existing vendor contract locks us into PayGate through 2027"
  "Customer data must stay within the EU (GDPR data residency)"
        |
        v
Constraints documented: CON-01 (vendor lock-in), CON-02 (data residency)
        |
        v
Architecture review: solution space narrowed BEFORE design starts
  - No alternative payment provider evaluation (CON-01)
  - Hosting must use an EU region, no US-only cloud regions (CON-02)
        |
        v
Solution designed within these walls -> reviewed against constraints
before sign-off, not discovered as a surprise during development</pre>

Constraints discovered after architecture sign-off are the most expensive kind of rework - they typically require redesign, not just a code change.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Architecture built on AWS, then legal blocks the launch</td><td>A data-residency constraint (EU-only hosting) existed in a compliance policy but was never surfaced during requirements gathering</td><td>Check whether compliance/legal was consulted during constraint elicitation</td><td>Add mandatory compliance/legal review as a constraint-gathering step before architecture is locked in</td></tr>
<tr><td>Team builds a custom payment flow, then discovers a signed vendor contract mandates a specific gateway</td><td>Vendor/contractual constraint was known only to procurement and never communicated to the delivery team</td><td>Cross-check active vendor contracts against the chosen technical approach</td><td>Require procurement/finance to submit known contractual constraints into the BRD before design starts</td></tr>
<tr><td>Project misses a hard regulatory deadline</td><td>The deadline was documented as a generic "target date" rather than flagged as a non-negotiable regulatory constraint</td><td>Check whether the constraint's source/rationale was recorded, distinguishing hard mandate from soft target</td><td>Explicitly tag constraints with source and negotiability, and escalate hard ones with dedicated schedule buffer</td></tr>
<tr><td>Dev team silently drops a feature to hit budget</td><td>Budget constraint conflicted with scope, but the conflict was never escalated - engineers made a business trade-off on their own</td><td>Review whether the budget-vs-scope conflict was raised to a sponsor or resolved informally by the team</td><td>Establish an escalation path so constraint conflicts are resolved by stakeholders, not absorbed silently by delivery</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Treating every stakeholder preference as a hard constraint</strong> - without probing whether it's truly fixed, teams over-restrict the solution space unnecessarily. <br>
• <strong>Constraints discovered during development instead of during requirements gathering</strong> - by far the most expensive time to learn about them. <br>
• <strong>No documented source/rationale</strong> - a constraint with no recorded "why" can't be challenged or safely revisited later when circumstances change. <br>
• <strong>Constraint conflicts resolved silently by developers</strong> - schedule-vs-vendor-onboarding conflicts should be escalated to stakeholders, not quietly absorbed into scope cuts. <br>
• <strong>Confusing an NFR target with a constraint</strong> - "must support 10,000 users" gets mislabeled as an immovable restriction when it's actually a negotiable design target.`
        }
    ]
};
