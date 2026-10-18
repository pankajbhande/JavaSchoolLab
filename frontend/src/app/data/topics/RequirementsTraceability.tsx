import { Topic } from '../coreJava';

export const requirementsTraceability: Topic = {
    id: 'requirements-traceability',
    name: 'Requirements Traceability',
    beginner: [
        {
            content: `<h3>What is Requirements Traceability?</h3>
Requirements Traceability is the ability to link every requirement forward to the work that implements it, and backward to the business need that justified it - so at any point you can answer "why does this feature exist?" and "where is this requirement implemented and tested?"`
        },
        {
            content: `<h4>The Traceability Chain</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Business Requirement
   "Reduce cart abandonment by 15%"
        |
        v
Functional Requirement
   "Allow guest checkout"
        |
        v
User Story
   "As a first-time shopper, I want to check out without an account"
        |
        v
Acceptance Criteria + Test Case
   "Given no account, when checkout completes, then order confirms
    without registration prompt"
        |
        v
Delivered Code + Passing Test</pre>`
        },
        {
            content: `<h4>Requirements Traceability Matrix (RTM) - Simple Example</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Req ID</th><th>Requirement</th><th>User Story</th><th>Test Case</th><th>Status</th></tr>
<tr><td>BR-01</td><td>Reduce cart abandonment</td><td>US-12, US-13</td><td>TC-45, TC-46</td><td>In Progress</td></tr>
<tr><td>FR-05</td><td>Guest checkout allowed</td><td>US-12</td><td>TC-45</td><td>Done</td></tr>
</table>`
        },
        {
            content: `<h4>Why Beginners Should Care</h4>
Without traceability, it's impossible to answer basic questions during a project: "Is every requirement actually being built?" "Is every feature actually needed, or is it scope creep?" "If this requirement changes, what else is affected?" Traceability makes requirements auditable instead of scattered across emails and chat messages.`
        }
    ],
    expert: [
        {
            content: `<h3>Forward and Backward Traceability</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Direction</th><th>Question Answered</th><th>Used For</th></tr>
<tr><td>Forward Traceability</td><td>"Where is this requirement implemented and tested?"</td><td>Ensuring nothing is missed - every requirement has a corresponding story, code, and test</td></tr>
<tr><td>Backward Traceability</td><td>"Why does this feature/code exist?"</td><td>Detecting scope creep (code with no linked requirement is unjustified) and impact analysis</td></tr>
</table>
A complete RTM supports both directions - it is a bidirectional matrix, not a one-way checklist.`
        },
        {
            content: `<h3>Traceability Enables Impact Analysis</h3>
When a business requirement changes mid-project, traceability lets the team instantly see everything downstream that must be re-evaluated: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Change Request: "Coupon discount rule changes from flat amount
                 to percentage-based"
        |
        v  (traced via RTM)
Impacted: FR-08 (Apply Coupon), US-21, US-22, TC-77, TC-78, TC-79
        |
        v
Team estimates re-work: 2 stories need redesign, 3 test cases
need rewriting, no impact on Shipping or Tax modules</pre>
Without an RTM, this impact analysis would rely on someone's memory - a major source of missed regressions in real projects.`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>RTM created once and never updated</strong> - becomes stale and misleading within a few sprints if not maintained as requirements evolve. <br>
• <strong>Only forward links tracked, not backward</strong> - makes it easy to build features that were never actually requested (scope creep) because no one checks "what requirement justifies this code?" <br>
• <strong>Traceability treated as pure overhead</strong> - on very small projects, a full RTM can be excessive; teams should scale the rigor to project size and regulatory need (e.g., healthcare/finance projects usually mandate full RTM for audits). <br>
• <strong>Tests not linked back to requirements</strong> - makes it impossible to know true requirement coverage (which requirements have zero tests? which tests test nothing real?).`
        },
        {
            content: `<h3>Tooling and Real-World Practice</h3>
In modern delivery, RTMs are rarely a static spreadsheet - they are built into ALM tools: Jira (issue links + epics), Azure DevOps (linked work items), or dedicated RM tools (Jama, IBM DOORS, Polarion) common in regulated industries (aerospace, medical devices, finance) where auditors require proof that every requirement was implemented and tested. In agile teams, lightweight traceability is maintained via epic -> story -> task hierarchies and story-to-test-case links inside the same tracking tool, rather than a separate document.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is requirements traceability?</td><td>The ability to link a requirement forward to its implementation/tests, and backward to the business need that justified it.</td></tr>
<tr><td>What is a Requirements Traceability Matrix (RTM)?</td><td>A document/table mapping requirements to their user stories, design elements, code, and test cases so coverage and impact can be tracked.</td></tr>
<tr><td>Difference between forward and backward traceability?</td><td>Forward answers "where is this requirement built and tested?"; backward answers "why does this feature/code exist?" - together they form bidirectional traceability.</td></tr>
<tr><td>How does traceability support impact analysis?</td><td>When a requirement changes, the RTM instantly shows every downstream story, code component, and test case affected, enabling accurate re-estimation.</td></tr>
<tr><td>What is a sign of poor backward traceability?</td><td>Code or features exist with no requirement linked to them - a common indicator of scope creep.</td></tr>
<tr><td>In which industries is a full RTM often mandatory?</td><td>Regulated industries like healthcare, aerospace, and finance, where auditors require documented proof every requirement was implemented and tested.</td></tr>
<tr><td>How is traceability maintained in agile teams using Jira?</td><td>Through epic -> story -> task hierarchies and linked test cases/issues, rather than a separate static spreadsheet.</td></tr>
<tr><td>What risk does an outdated RTM create?</td><td>It misleads stakeholders about actual requirement coverage and makes impact analysis unreliable when changes occur.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
A traceability matrix is not a document written once - it's a live index maintained alongside the delivery pipeline, linking every requirement ID all the way to a deployed, monitored feature: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Req ID   Requirement            Story    Test Case   Commit/Build   Prod Status
------   --------------------   ------   ---------   ------------   -----------
BR-01    Reduce cart abandon.   US-12    TC-45       -              KPI tracked
FR-05    Guest checkout         US-12    TC-45       #a1b2c3d       Live, monitored
FR-08    Apply coupon           US-21    TC-77/78    #d4e5f6a       Live, monitored
FR-08    (rule change: % off)   US-22    TC-79       #f7a8b9c       In QA</pre>

When FR-08's business rule changes, the RTM row is what lets the team instantly answer "which stories, tests, and deployed code are affected" - without it, that answer lives only in someone's memory, and someone always misses a spot.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Regulatory audit fails - team can't prove a requirement was tested</td><td>RTM was created once at project kickoff and never updated as stories/tests were added or changed</td><td>Compare RTM entries against actual current backlog and test suite for gaps</td><td>Make RTM updates part of the Definition of Done for every story, not a separate end-of-project task</td></tr>
<tr><td>Change request causes an unrelated module to break</td><td>Only forward traceability was maintained; backward links from code to requirement were missing, so impact analysis missed a shared dependency</td><td>Check whether the RTM supports backward lookup (code/feature -> requirement) or only forward</td><td>Maintain the RTM as a bidirectional matrix, not a one-way checklist</td></tr>
<tr><td>Feature in production that nobody can explain the purpose of</td><td>Code was built with no requirement ever linked to it - a sign of undocumented scope creep</td><td>Search the RTM for any requirement ID pointing at this feature/code area</td><td>Require every merged feature to reference a requirement/story ID; block ones that don't</td></tr>
<tr><td>QA reports "100% test pass" but real coverage gaps exist</td><td>Tests were never explicitly linked back to requirements, so pass/fail numbers didn't reflect actual requirement coverage</td><td>Cross-check test case IDs in the RTM against every requirement row for a real link, not just an existing test</td><td>Enforce that every requirement row has at least one linked, executed test case before release sign-off</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>RTM as a one-time artifact</strong> - built for a kickoff review and left to rot, becoming actively misleading within a few sprints. <br>
• <strong>Forward-only tracing</strong> - never checking "why does this code exist," which lets scope creep and orphaned features accumulate unnoticed. <br>
• <strong>Full formal RTM applied uniformly to every project size</strong> - excessive overhead on a small internal tool, while a genuinely regulated project under-invests because "we did an RTM once already." <br>
• <strong>Requirements and tests tracked in separate, disconnected tools</strong> - with no live link, so the "matrix" is really just two lists someone has to manually reconcile. <br>
• <strong>Treating traceability as a QA-only concern</strong> - when in practice BAs, architects, and product owners all rely on it for change-impact analysis and scope governance.`
        }
    ]
};
