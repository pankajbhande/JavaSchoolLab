import { Topic } from '../coreJava';

export const businessRequirements: Topic = {
    id: 'business-requirements',
    name: 'Business Requirements',
    beginner: [
        {
            content: `<h3>What is a Business Requirement?</h3>
A Business Requirement describes <strong>why</strong> a project exists - the high-level business goal or problem to solve, independent of any specific system feature. It answers: "What business outcome are we trying to achieve?" <br><br>

<strong>Real example (e-commerce company):</strong> <br>
"Reduce cart abandonment rate by 15% within 6 months to increase quarterly revenue."`
        },
        {
            content: `<h4>Business Requirement vs Functional Requirement</h4>
Business requirements sit above functional requirements - one business requirement is usually satisfied by several functional requirements. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Business Requirement:
"Reduce cart abandonment by 15%"
        |
        +--> Functional Requirement: "Allow guest checkout"
        +--> Functional Requirement: "Show shipping cost upfront on product page"
        +--> Functional Requirement: "Send abandoned-cart reminder email after 1 hour"</pre>`
        },
        {
            content: `<h4>Where Business Requirements Are Documented</h4>
They are typically written in a <strong>Business Requirements Document (BRD)</strong>, which includes the business objective, scope, stakeholders, success metrics, and high-level constraints - before any detailed design or user stories are created. <br><br>

A BRD answers "why are we doing this project", while an SRS (Software Requirements Specification) answers "what will the software do".`
        },
        {
            content: `<h4>Who Owns Business Requirements?</h4>
Typically the project sponsor or business stakeholder defines the business requirement (the goal), and the Business Analyst elicits, clarifies, and documents it, then translates it downstream into functional requirements and user stories that the delivery team can build.`
        }
    ],
    expert: [
        {
            content: `<h3>Anatomy of a Business Requirements Document (BRD)</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1. Executive Summary       - one-paragraph problem/opportunity
2. Business Objectives     - measurable goals (KPIs)
3. Project Scope           - in-scope / out-of-scope
4. Stakeholders            - sponsors, users, approvers
5. Business Requirements   - numbered, prioritized (MoSCoW)
6. Assumptions & Constraints
7. Success Criteria / KPIs
8. Risks</pre>

A strong BRD is signed off by the sponsor BEFORE detailed requirements work begins - it is the contract that anchors scope disputes later in the project.`
        },
        {
            content: `<h3>Traceability: Business Requirement to Delivered Feature</h3>
Every functional requirement, user story, and test case should be traceable back to a business requirement. If a proposed feature can't be traced to a business goal, that's a scope-creep red flag. <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Level</th><th>Question Answered</th><th>Example</th></tr>
<tr><td>Business Requirement</td><td>Why?</td><td>Reduce cart abandonment by 15%</td></tr>
<tr><td>Functional Requirement</td><td>What?</td><td>Allow guest checkout</td></tr>
<tr><td>User Story</td><td>Who/How (user view)</td><td>As a first-time shopper, I want to check out without creating an account</td></tr>
<tr><td>Acceptance Criteria</td><td>Proof of done</td><td>Given no account, when checkout is completed, then order confirmation is shown without registration prompt</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>Writing solutions instead of goals</strong> - "Build a mobile app" is a solution; the business requirement is "Increase customer engagement on mobile channel by X%" - the app is only one possible solution. <br>
• <strong>No measurable success criteria</strong> - without a KPI, no one can say the project succeeded or failed. <br>
• <strong>Skipping sponsor sign-off</strong> - leads to disputes mid-project about whether a feature was ever "in scope." <br>
• <strong>Business requirements that never get re-validated</strong> - market conditions change; a 12-month project should periodically re-confirm the business requirement is still valid.`
        },
        {
            content: `<h3>Business Requirements vs Related Documents</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Document</th><th>Focus</th><th>Typical Owner</th></tr>
<tr><td>Business Case</td><td>Justifies the investment (ROI, cost-benefit)</td><td>Sponsor / PMO</td></tr>
<tr><td>BRD</td><td>What the business needs, at a high level</td><td>Business Analyst</td></tr>
<tr><td>SRS</td><td>Detailed system behavior (functional + non-functional)</td><td>Business Analyst / Architect</td></tr>
<tr><td>Product Backlog</td><td>Prioritized, sprint-ready user stories</td><td>Product Owner</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a business requirement?</td><td>A high-level statement of the business goal or problem a project must solve, independent of specific system features.</td></tr>
<tr><td>How does a business requirement differ from a functional requirement?</td><td>Business requirements state "why" (the goal); functional requirements state "what" the system does to achieve that goal.</td></tr>
<tr><td>What document typically captures business requirements?</td><td>The Business Requirements Document (BRD).</td></tr>
<tr><td>Who signs off on business requirements?</td><td>The project sponsor or key business stakeholder, before detailed requirements work begins.</td></tr>
<tr><td>Why is measurability important for a business requirement?</td><td>Without a measurable KPI, there is no objective way to determine whether the project achieved its goal.</td></tr>
<tr><td>What is a red flag that a feature request isn't a valid business requirement?</td><td>It can't be traced back to any stated business goal - a sign of scope creep.</td></tr>
<tr><td>Give an example of a business requirement written as a solution (a mistake) and correct it.</td><td>Mistake: "Build a chatbot." Correct: "Reduce average customer support response time from 24 hours to 1 hour" (chatbot is just one possible solution).</td></tr>
<tr><td>How do business requirements relate to a Requirements Traceability Matrix?</td><td>They sit at the top of the RTM; every functional requirement, story, and test case should trace back up to one.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
A business requirement is the root node of the entire delivery pipeline - everything downstream exists to prove it was achieved: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Sponsor's business goal: "Grow mobile revenue by 20% this fiscal year"
        |
        v
BRD signed off -> BR-03: "Increase mobile checkout conversion rate"
        |
        v
Decomposed into FRs (guest checkout, saved cards, one-tap reorder)
        |
        v
FRs decomposed into User Stories -> Sprint Backlog -> Dev builds
        |
        v
Feature shipped -> Product analytics dashboard tracks conversion %
        |
        v
Quarterly business review: "Did BR-03's KPI actually move?" - the
loop closes back to the ORIGINAL business requirement, not just
"was the feature built"</pre>

Note the loop closes on the business outcome, not on code being deployed - a feature can ship perfectly and still fail the business requirement if the KPI doesn't move.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Project delivered on time, but leadership calls it a "failure"</td><td>The BRD never defined a measurable success KPI, so "success" meant different things to different stakeholders</td><td>Check whether the BRD contains any quantifiable success criteria, or only feature descriptions</td><td>Require every business requirement to carry a measurable KPI and baseline before sign-off</td></tr>
<tr><td>Feature built exactly as specified, but nobody uses it</td><td>The business requirement was actually a pre-chosen solution ("build a loyalty app") rather than a validated business problem</td><td>Trace the requirement back to the original problem statement - is there one, or does it start at "build X"?</td><td>Rewrite the business requirement as the underlying problem/goal, and let solution options be evaluated separately</td></tr>
<tr><td>Mid-project scope war between two departments</td><td>Multiple business requirements were captured from different stakeholders without reconciling conflicting priorities at the sponsor level</td><td>Check whether a single sponsor formally signed off on a prioritized requirement set</td><td>Escalate conflicting business requirements to one accountable sponsor for a binding prioritization decision</td></tr>
<tr><td>Six months post-launch, the business requirement is now irrelevant</td><td>Market/business conditions shifted mid-project but the BRD was never re-validated, only the technical backlog was tracked</td><td>Check the BRD's last review/re-confirmation date against project duration</td><td>Schedule periodic business requirement re-validation checkpoints on any project longer than one quarter</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Starting the BRD with a solution, not a problem</strong> - "We need a new mobile app" instead of "mobile conversion is 3x lower than desktop." <br>
• <strong>Treating the BRD as a one-time document</strong> - written once at kickoff, never referenced again once development starts. <br>
• <strong>No named, accountable sponsor</strong> - "the business" as a vague collective owns the requirement, so no one has authority to resolve conflicts or approve trade-offs. <br>
• <strong>Success measured by "did we ship it" instead of "did the KPI move"</strong> - conflates delivery with business value. <br>
• <strong>BRD written in isolation from budget/timeline reality</strong> - goals set without checking feasibility, guaranteeing disappointment regardless of execution quality.`
        }
    ]
};
