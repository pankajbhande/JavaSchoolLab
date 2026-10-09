import { Topic } from '../coreJava';

export const requirementDependencies: Topic = {
    id: 'dependencies',
    name: 'Dependencies',
    beginner: [
        {
            content: `<h3>What is a Dependency?</h3>
A Dependency is a relationship where one requirement, feature, task, or team relies on another being completed (or on an external factor being available) before it can proceed. Dependencies determine the ORDER in which work must happen. <br><br>

<strong>Real example (e-commerce checkout):</strong> <br>
"The 'Apply Coupon' feature depends on the 'Cart Total Calculation' feature being completed first, since the coupon discount is applied to the calculated total."`
        },
        {
            content: `<h4>Types of Dependencies</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Example</th></tr>
<tr><td>Internal (within the team)</td><td>UI story depends on the backend API story being done first</td></tr>
<tr><td>External (another team)</td><td>Checkout feature depends on the Payments team exposing a new API endpoint</td></tr>
<tr><td>Third-party/Vendor</td><td>Shipping cost calculation depends on the courier's rate API being available</td></tr>
<tr><td>Technical/Infrastructure</td><td>Feature depends on a database migration being deployed first</td></tr>
</table>`
        },
        {
            content: `<h4>Why Beginners Should Care About Dependencies</h4>
Ignoring dependencies leads to broken sprint plans - a team commits to a story, starts it, and discovers midway that it can't be finished because something else it needs isn't ready. Identifying dependencies during backlog refinement (before the sprint starts) avoids this.`
        },
        {
            content: `<h4>Simple Dependency Example</h4>`,
            codeExamples: [
                `Story: "As a customer, I want to see final order total including tax
        and shipping before payment."

Depends on:
  - Story: "Calculate applicable tax based on shipping address" (must be done first)
  - Story: "Calculate shipping cost based on courier selection" (must be done first)

Cannot start "final order total" story until both dependencies are complete.`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Visualizing Dependencies</h3>
Dependencies are often mapped visually so the critical path (the longest chain of dependent work that determines the minimum project duration) becomes obvious: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Cart Total Calc --> Apply Coupon --> Final Order Total --> Payment Confirmation
       |                                    ^
       v                                    |
  Tax Calculation ----------------------------
       ^
       |
Shipping Cost Calc --------------------------

Critical Path = the longest chain; any delay on it delays the whole project.
Non-critical dependencies have "slack" - some delay is absorbable.</pre>`
        },
        {
            content: `<h3>Dependency Types Used in Formal Project Planning (PMI style)</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Meaning</th><th>Example</th></tr>
<tr><td>Finish-to-Start (FS)</td><td>B cannot start until A finishes</td><td>Cannot test payment until payment API is built</td></tr>
<tr><td>Start-to-Start (SS)</td><td>B cannot start until A starts</td><td>QA test writing can start once dev starts coding</td></tr>
<tr><td>Finish-to-Finish (FF)</td><td>B cannot finish until A finishes</td><td>Documentation can't be finalized until feature testing finishes</td></tr>
<tr><td>Mandatory vs Discretionary</td><td>Hard technical necessity vs team's chosen order of work</td><td>Mandatory: DB schema before API. Discretionary: team prefers building UI after API even though technically parallel work is possible</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>Dependencies discovered mid-sprint</strong> - should be surfaced during backlog refinement/sprint planning, not after work has started. <br>
• <strong>Cross-team dependencies not communicated</strong> - Team A assumes Team B's API will be ready by sprint end; if Team B slips, Team A's work stalls with no warning. <br>
• <strong>Circular dependencies</strong> - Story A depends on Story B, and Story B depends on Story A; this signals the requirements themselves need to be re-scoped/split. <br>
• <strong>External/vendor dependencies with no fallback</strong> - if a third-party API isn't ready, having no contingency (e.g., a mock/stub) blocks all downstream work. <br>
• <strong>Not distinguishing dependency from coupling</strong> - sometimes a "dependency" is really a sign that two features should be redesigned to be independent (see vertical slicing under User Stories).`
        },
        {
            content: `<h3>Managing Dependencies in Practice</h3>
• Maintain a Dependency Log/RAID log alongside assumptions and risks, each with an owner and target resolution date. <br>
• Flag cross-team dependencies explicitly in tools like Jira (linked issues: "blocked by" / "blocks"). <br>
• In Scrum-of-Scrums or Program Increment (SAFe) planning, surfacing dependencies across teams is a primary purpose of the ceremony. <br>
• Where possible, use contract-first API design or mocked/stubbed services so downstream teams aren't blocked while the actual dependency is still being built.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a dependency in requirements/project context?</td><td>A relationship where one piece of work relies on another being completed, or an external factor being available, before it can proceed.</td></tr>
<tr><td>Give examples of dependency types.</td><td>Internal (within team), external (another team), third-party/vendor, and technical/infrastructure dependencies.</td></tr>
<tr><td>What is a critical path?</td><td>The longest chain of dependent tasks in a project; any delay on it delays the overall project completion.</td></tr>
<tr><td>What is Finish-to-Start (FS) dependency?</td><td>A task cannot start until its predecessor task finishes - the most common dependency type.</td></tr>
<tr><td>What is a circular dependency and why is it a problem?</td><td>When Story A depends on Story B and B depends on A - it makes both impossible to start; signals the requirements need to be re-scoped.</td></tr>
<tr><td>How should cross-team dependencies be managed?</td><td>Explicitly logged, linked in the tracking tool ("blocked by"/"blocks"), and communicated early, e.g., in Scrum-of-Scrums or PI planning.</td></tr>
<tr><td>What is a mandatory vs discretionary dependency?</td><td>Mandatory is a hard technical necessity (schema before API); discretionary is a chosen work order the team could technically do differently.</td></tr>
<tr><td>How can teams avoid being blocked by an unfinished external dependency?</td><td>Use contract-first API design and mocked/stubbed services so downstream work can proceed in parallel.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Dependencies get surfaced during backlog refinement and cross-team planning ceremonies, then are actively tracked as linked work items so blocking chains are visible before a sprint starts, not discovered mid-sprint: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Backlog refinement: PO notices "Final Order Total" story needs
  both Tax Calc and Shipping Calc stories done first
        |
        v
Dependencies logged in Jira as "blocked by" links, visible on the board
        |
        v
Scrum-of-Scrums / PI Planning: cross-team dependency (Payments team's
  API) flagged, target sprint committed by the owning team
        |
        v
Sprint planning: "Final Order Total" NOT pulled into sprint 8 because
  its blockers aren't done yet - avoided a stalled sprint
        |
        v
Once Tax Calc + Shipping Calc ship, dependency clears, story unblocked
  and pulled into sprint 9</pre>

Contrast this with the failure mode: a team commits to a story without checking the dependency graph, starts it, and gets stuck mid-sprint with nothing to show.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Sprint ends with a half-finished, unshippable story</td><td>Team committed to a story without checking that its dependency (another team's API) wouldn't be ready in time</td><td>Check whether the story's dependencies were verified as resolved before sprint planning</td><td>Make dependency-check a mandatory gate in sprint planning; don't pull in stories with open blockers</td></tr>
<tr><td>Whole release delayed by one small vendor API</td><td>A third-party dependency sat on the critical path with no fallback or mock, so all downstream work stalled</td><td>Trace the critical path to find where the vendor dependency sits and whether any parallel path existed</td><td>Use contract-first design with a mocked/stubbed vendor API so downstream teams can build in parallel</td></tr>
<tr><td>Two stories block each other, no one can start either</td><td>A circular dependency was never caught during refinement because dependencies weren't mapped visually</td><td>Draw the dependency graph for the two stories and look for a cycle</td><td>Re-scope/split one of the stories to break the cycle before either enters a sprint</td></tr>
<tr><td>Team A blindsided when Team B's feature slips</td><td>Cross-team dependency existed only as a verbal assumption, never logged or linked in the tracking tool</td><td>Search the tracking tool for a formal "blocked by" link between the two teams' work items</td><td>Require all cross-team dependencies to be explicitly linked and reviewed in Scrum-of-Scrums/PI planning</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Dependencies discovered mid-sprint</strong> instead of during backlog refinement, causing stalled, unfinishable sprint commitments. <br>
• <strong>Cross-team dependencies tracked only verbally</strong> - "I think Team B said it'll be ready" instead of a formal linked ticket with a committed date. <br>
• <strong>No fallback for external/vendor dependencies</strong> - a single third-party delay blocks the entire downstream team with no mock/stub to keep work moving. <br>
• <strong>Circular dependencies left unresolved</strong> - two stories blocking each other is a sign the requirements need re-scoping, not a scheduling puzzle to solve. <br>
• <strong>Mistaking tight coupling for a "natural" dependency</strong> - sometimes what looks like an unavoidable dependency is really a signal that two features should be redesigned to be independent.`
        }
    ]
};
