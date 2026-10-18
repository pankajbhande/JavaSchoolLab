import { Topic } from '../coreJava';

export const kanbanMethod: Topic = {
    id: 'kanban',
    name: 'Kanban',
    beginner: [
        {
            content: `<h3>What is Kanban?</h3>
Kanban is an Agile method focused on visualizing work and managing continuous flow, rather than working in fixed
sprints. Work items move across a visual board through columns representing stages of progress, and the team limits how
much work is "in progress" at once to avoid overload. <br><br>

<strong>Real-world example:</strong> A support/maintenance team fixing bugs for a live production app doesn't get neatly
packaged 2-week batches of work - bugs and requests arrive continuously. Kanban fits this naturally: new issues are added
to the board anytime and picked up as capacity frees up.`
        },
        {
            content: `<h3>The Kanban Board</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   To Do        |   In Progress (WIP limit: 3)  |   In Review   |   Done
-----------------+-------------------------------+---------------+-----------
 Fix login bug   |  Add search filter            |  Payment fix  |  OTP login
 Update footer   |  Optimize DB query             |               |  Fix typo
 New API endpoint|  Refactor cart module          |               |  Add logo</pre>
Each card represents one unit of work. It moves left to right as it progresses, and everyone can see the state of all
work at a glance.`
        },
        {
            content: `<h3>Work-in-Progress (WIP) Limits</h3>
A WIP limit caps how many items can sit in a given column ("In Progress" limited to 3, for example) at once. If the "In
Progress" column is full, the team must finish something before starting something new. <br><br>

<strong>Why this matters:</strong> Just like a busy chef finishing one dish before starting the next cooks faster overall
than juggling six half-finished dishes, limiting WIP forces the team to finish work rather than starting many things and
finishing none - reducing context-switching and shortening the time each item takes to complete.`
        },
        {
            content: `<h3>Kanban's Core Practices (4 of 6)</h3>
• <strong>Visualize the workflow</strong> - make all work and its status visible on a board. <br>
• <strong>Limit work in progress</strong> - cap how much is being worked on at once. <br>
• <strong>Manage flow</strong> - focus on smooth, continuous movement of items to "Done." <br>
• <strong>Continuous improvement</strong> - regularly review and improve the process based on how work is actually flowing.`
        }
    ],
    expert: [
        {
            content: `<h3>Kanban vs Scrum - Detailed Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Scrum</th><th>Kanban</th></tr>
<tr><td>Cadence</td><td>Fixed-length sprints (time-boxed)</td><td>Continuous flow, no fixed iterations</td></tr>
<tr><td>Roles</td><td>Prescribed (Product Owner, Scrum Master, Dev Team)</td><td>No prescribed roles - fits into existing team structure</td></tr>
<tr><td>Planning unit</td><td>Sprint Backlog, committed for the sprint duration</td><td>Backlog pulled item-by-item as capacity frees up</td></tr>
<tr><td>Change mid-cycle</td><td>Discouraged mid-sprint; new work waits for next sprint</td><td>Can be pulled in anytime, as long as WIP limits allow</td></tr>
<tr><td>Key metric</td><td>Velocity (points completed per sprint)</td><td>Cycle time / Lead time (how long an item takes to finish)</td></tr>
<tr><td>Best fit</td><td>Product feature teams doing planned, batched work</td><td>Support/maintenance/ops teams handling continuous, unpredictable inflow</td></tr>
</table>`
        },
        {
            content: `<h3>Push vs Pull Systems</h3>
Kanban is fundamentally a <strong>pull system</strong>: work is pulled into the next stage only when there's capacity,
rather than pushed downstream regardless of load. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Push system:  manager assigns work regardless of current load -> bottlenecks pile up invisibly
Pull system:  a team member pulls the next item only when they finish current work -> bottlenecks
              become immediately visible (a column fills up and hits its WIP limit)</pre>
This is the same principle used in lean manufacturing (Toyota's original "Kanban" cards) - stop overloading a stage of
the process and make bottlenecks visible instead of hiding them.`
        },
        {
            content: `<h3>Cycle Time, Lead Time, and Cumulative Flow</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Metric</th><th>Definition</th></tr>
<tr><td>Lead Time</td><td>Time from when a request is created to when it's delivered (customer's view of "how long")</td></tr>
<tr><td>Cycle Time</td><td>Time from when work actually starts on an item to when it's completed (team's view of "how fast we work")</td></tr>
<tr><td>Cumulative Flow Diagram</td><td>A chart showing how many items are in each column over time - widening bands reveal bottlenecks visually</td></tr>
</table>
<br>
Teams use these metrics to spot bottlenecks and improve throughput - a data-driven form of Kanban's "continuous
improvement" principle.`
        },
        {
            content: `<h3>Common Pitfalls with Kanban</h3>
• <strong>No WIP limits enforced</strong> - without them, the board just becomes a to-do list; the core benefit
(forcing finish-before-start) is lost. <br>
• <strong>Board not kept up to date</strong> - a stale board defeats the entire "visualize the workflow" principle. <br>
• <strong>Using Kanban when the team actually needs planned, batched delivery</strong> - Kanban's flexibility can hurt
teams that need predictable release trains or fixed feature commitments; Scrum may fit better there. <br>
• <strong>Ignoring cycle-time data</strong> - without reviewing metrics, the "continuous improvement" principle
becomes just a slogan.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Kanban?</td><td>An Agile method that visualizes work on a board and manages continuous flow using WIP limits, instead of fixed sprints</td></tr>
<tr><td>What is a WIP limit and why does it matter?</td><td>A cap on how many items can be in a given stage at once; it forces finishing work before starting new work, reducing context-switching and improving throughput</td></tr>
<tr><td>How is Kanban different from Scrum?</td><td>Kanban has no fixed sprints or prescribed roles and uses continuous pull-based flow; Scrum uses fixed-length sprints, defined roles, and batched sprint commitments</td></tr>
<tr><td>What is the difference between cycle time and lead time?</td><td>Lead time is from request creation to delivery; cycle time is from when work actually starts to when it finishes</td></tr>
<tr><td>What is a pull system, and why is it preferred over a push system?</td><td>Work is pulled by whoever has capacity rather than pushed regardless of load, so bottlenecks become visible immediately instead of silently piling up</td></tr>
<tr><td>When would you recommend Kanban over Scrum for a team?</td><td>For teams handling continuous, unpredictable inflow of work like production support/maintenance, where fixed sprint commitments don't fit well</td></tr>
<tr><td>What happens if a team uses a Kanban board but never enforces WIP limits?</td><td>The board degrades into just a visual to-do list - the core benefit of forcing focus and surfacing bottlenecks is lost</td></tr>
<tr><td>How would you identify a bottleneck using a Kanban board?</td><td>Look for a column that's consistently full or growing (hitting its WIP limit) - that's where work is piling up faster than it's being pulled forward; a cumulative flow diagram makes this visible over time</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: Kanban in a Support/Ops Team's Workflow</h3>
Kanban fits naturally where work arrives unpredictably - a production support or platform team's real board looks like this: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Incoming        Triage         In Progress      Code Review     Deployed
(WIP: none)    (WIP: 5)        (WIP: 3)         (WIP: 2)        (Done)
------------------------------------------------------------------------
Alert: 500s    P1: DB timeout  Fix connection   PR #482          Hotfix v2.3.1
on checkout    P2: slow query  pool leak        (2 approvals     shipped
New bug ticket P3: UI glitch                     needed)
Customer                                        PR #481
escalation                                      (waiting)</pre>
Items are pulled right as capacity opens up in each WIP-limited column; nothing is "assigned" days in advance the way
a Scrum sprint backlog is - this is precisely why Kanban suits reactive, continuous-inflow work.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>"In Progress" column has 15 cards and nothing seems to finish</td><td>No WIP limit enforced, so the team keeps starting new work instead of finishing what's already started</td><td>Count items per column against any stated WIP limit - usually far exceeded or never set</td><td>Set and strictly enforce a WIP limit per column; block adding new work until capacity frees up</td></tr>
<tr><td>Stakeholders ask "when will X be done" and nobody can answer</td><td>No cycle-time metrics tracked, so there's no historical data to forecast completion</td><td>Check whether the team has ever measured average cycle time for similar items</td><td>Track cycle time per item and use the historical average/distribution to give probabilistic delivery estimates</td></tr>
<tr><td>Board looks clean and organized but doesn't reflect what people are actually working on</td><td>Board isn't updated in real time - team updates it only before a weekly review</td><td>Compare board state against what engineers report verbally they're doing</td><td>Make the board the single source of truth updated live (many teams tie it directly to their issue tracker/PR status via automation)</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>WIP limits that exist on paper only</strong> - a stated limit that's routinely ignored under deadline
pressure defeats Kanban's core discipline. <br>
• <strong>Using Kanban to avoid ever committing to delivery dates</strong> - useful for reactive work, but a poor
excuse when stakeholders genuinely need predictable release commitments (Scrum may fit better there). <br>
• <strong>Treating the board as a to-do list without flow discipline</strong> - cards get added and moved
haphazardly with no attention to bottlenecks or cycle time, losing the "manage flow" principle entirely. <br>
• <strong>No regular review of flow metrics</strong> - collecting cycle-time/lead-time data but never actually using
it to change the process, turning "continuous improvement" into a slogan. <br>
• <strong>Silently starving low-priority columns</strong> - urgent/high-priority work always jumps the queue,
leaving lower-priority items stuck indefinitely with no visible aging policy.`
        }
    ]
};
