import { Topic } from '../coreJava';

export const requirementAssumptions: Topic = {
    id: 'assumptions',
    name: 'Assumptions',
    beginner: [
        {
            content: `<h3>What is an Assumption?</h3>
An Assumption is something the project team believes to be true, without proof at the time of planning, and treats as a given while planning and estimating the work. If the assumption turns out to be false, the plan, scope, or estimate may need to change. <br><br>

<strong>Real example (e-commerce checkout):</strong> <br>
"We assume the existing payment gateway API supports partial refunds." <br>
If this later proves false, the refund feature's design and timeline must be revisited.`
        },
        {
            content: `<h4>Why Teams Document Assumptions</h4>
Every project has unknowns. Instead of stalling work until every fact is confirmed, the team writes down what it is assuming, keeps moving, and validates the assumption as early as possible. This makes the risk visible and gives everyone a chance to challenge it before it becomes a costly surprise late in the project.`
        },
        {
            content: `<h4>Sample Assumption Log Entry</h4>`,
            codeExamples: [
                `ID: ASM-04
Assumption: Customers checking out as guests will not require
            order history access later.
Made by: Business Analyst, during requirements workshop
Reason: No stakeholder mentioned guest order lookup as a need.
Risk if wrong: Would require adding guest order tracking feature,
               extra 1-2 weeks of development.
Status: To be validated with Product Owner before sprint planning.`
            ]
        },
        {
            content: `<h4>Assumption vs Constraint (Beginner Distinction)</h4>
A constraint is a known, confirmed limitation ("we must use vendor X - it's contractual"). An assumption is an unconfirmed belief ("we assume vendor X's API can handle our expected traffic volume"). Constraints are facts; assumptions are guesses that need validation.`
        }
    ],
    expert: [
        {
            content: `<h3>Why Unvalidated Assumptions Are a Leading Cause of Project Failure</h3>
Assumptions that are never written down are the most dangerous kind - they live silently in one person's head, get baked into estimates and designs, and surface as "surprises" only when it's expensive to change course. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Silent assumption in a developer's head
        |
        v
Baked into design/estimate without anyone reviewing it
        |
        v
Discovered wrong during UAT or production
        |
        v
Expensive rework + timeline slip + trust damage with stakeholders</pre>

This is why mature teams maintain a formal, visible <strong>Assumptions Log</strong> reviewed regularly with stakeholders, not just at kickoff.`
        },
        {
            content: `<h3>Assumptions, Risks, and Constraints Are a Related Trio</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Concept</th><th>Nature</th><th>Action Needed</th></tr>
<tr><td>Assumption</td><td>Believed true, unconfirmed</td><td>Validate as early as possible</td></tr>
<tr><td>Constraint</td><td>Known true, fixed limitation</td><td>Design within it</td></tr>
<tr><td>Risk</td><td>Uncertain future event with potential impact</td><td>Monitor, mitigate, have a contingency</td></tr>
</table>
An unvalidated assumption is effectively a risk: "assumption ASM-04 is wrong" is itself a risk item with a probability and impact that should appear on the project's risk register.`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>Assumptions never revisited</strong> - logged once at kickoff and forgotten; by the time the feature is built, the underlying fact may have changed (e.g., a vendor deprecated an API). <br>
• <strong>No owner assigned to validate</strong> - an assumption without an owner and a deadline to confirm it just sits as permanent uncertainty. <br>
• <strong>Confusing assumption with requirement</strong> - "We assume users have modern browsers" should either be validated/confirmed and turned into a documented constraint/NFR, or explicitly tested for. <br>
• <strong>Assumptions hidden inside designs</strong> - a developer assumes a business rule without asking, and it never appears in any log at all - the riskiest case, because no one even knows to question it.`
        },
        {
            content: `<h3>How Assumptions Get Validated</h3>
Typical validation techniques: stakeholder interviews, prototype/spike testing (a short technical investigation), reviewing vendor documentation or SLAs, checking with legal/compliance, or running a small pilot with real users. The goal is always to convert an assumption into either a confirmed fact (which may become a constraint or requirement) or a corrected understanding (which changes the plan) - as early in the project as feasible, when the cost of change is lowest.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is an assumption in requirements engineering?</td><td>Something the team believes to be true, without proof, and treats as a given while planning - subject to being wrong.</td></tr>
<tr><td>How is an assumption different from a constraint?</td><td>A constraint is a confirmed, fixed limitation; an assumption is an unconfirmed belief that still needs validation.</td></tr>
<tr><td>Why is it risky to leave assumptions undocumented?</td><td>They live silently in individuals' heads, get baked into estimates and design, and surface as costly surprises when discovered wrong late in the project.</td></tr>
<tr><td>What artifact is used to track assumptions?</td><td>An Assumptions Log (sometimes combined into a "RAID log" - Risks, Assumptions, Issues, Dependencies).</td></tr>
<tr><td>How does an assumption relate to project risk?</td><td>An unvalidated assumption is effectively a risk - "this assumption turns out false" has a probability and an impact, and should appear on the risk register.</td></tr>
<tr><td>What should each assumption log entry include?</td><td>The assumption, who made it and why, the risk/impact if wrong, an owner, and its validation status.</td></tr>
<tr><td>How do you validate an assumption?</td><td>Through stakeholder interviews, prototypes/spikes, vendor documentation review, compliance checks, or small pilots - as early as possible.</td></tr>
<tr><td>What is the RAID acronym?</td><td>Risks, Assumptions, Issues, Dependencies - a combined log commonly maintained by project/business analysts.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Assumptions get logged early, then must be actively closed out (validated or corrected) before they harden into unreviewed design decisions: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Requirements workshop: BA notes "We assume the payment gateway
                                   supports partial refunds"
        |
        v
Logged as ASM-04 in the RAID log, owner assigned, target date set
        |
        v
BA/Architect spikes the vendor's API docs during sprint 2
        |
        v
   Branch A: Confirmed true             Branch B: Confirmed false
        |                                       |
        v                                       v
Converted to a documented FACT/          Design/estimate revised;
constraint in the SRS                     stakeholders notified of
                                           the change and its impact
        |                                       |
        v                                       v
Refund feature designed on solid ground either way - never silently
built on an unresolved guess</pre>`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Refund feature fails in production for split payments</td><td>Team assumed the payment gateway supported partial refunds but never validated it against vendor documentation</td><td>Check the assumptions log for this feature area - was it ever logged and validated, or just assumed silently?</td><td>Add mandatory vendor-API validation spikes for any assumption a feature's core logic depends on</td></tr>
<tr><td>Feature built for guest users breaks for logged-in users</td><td>An unwritten assumption ("all checkout users are guests") lived only in one developer's head and was never logged or challenged</td><td>Interview the developer/team about undocumented assumptions behind the design</td><td>Require assumptions to be written into a shared log before design begins, not kept as tribal knowledge</td></tr>
<tr><td>Estimate blows past deadline by 3 weeks</td><td>An assumption about API availability was logged but never assigned an owner or validation deadline, so it sat unresolved until it blocked development</td><td>Check whether the assumption log entry had an owner and target validation date</td><td>Enforce that every logged assumption has an accountable owner and a hard validation deadline</td></tr>
<tr><td>Feature scope quietly balloons mid-project</td><td>An assumption ("guest checkout users won't need order history") turned out false, but instead of being treated as a scope/estimate change, it was silently absorbed into the existing sprint</td><td>Check whether invalidated assumptions triggered a formal re-estimation or change request</td><td>Treat every invalidated assumption as a change-control trigger, not a silent scope addition</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Assumptions that live only in one person's head</strong> - never written into any log at all, the riskiest possible case because no one even knows to question them. <br>
• <strong>Logged once at kickoff, never revisited</strong> - facts and vendor capabilities change over the life of a project; a stale assumptions log is worse than none, because it gives false confidence. <br>
• <strong>No owner or validation deadline</strong> - an assumption with nobody accountable to confirm it just sits as permanent, unresolved risk. <br>
• <strong>Confusing an assumption with an already-confirmed constraint</strong> - treating a guess as settled fact skips the validation step entirely. <br>
• <strong>Invalidated assumptions absorbed silently into scope</strong> - instead of triggering a proper change-control/re-estimation conversation with stakeholders.`
        }
    ]
};
