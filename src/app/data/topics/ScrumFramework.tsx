import { Topic } from '../coreJava';

export const scrumFramework: Topic = {
    id: 'scrum',
    name: 'Scrum',
    beginner: [
        {
            content: `<h3>What is Scrum?</h3>
Scrum is the most widely used framework for implementing Agile. It organizes work into fixed-length cycles called
"sprints" (usually 1-4 weeks), with defined roles, meetings, and artifacts to keep the team focused and the customer
informed. <br><br>

<strong>Real-world example:</strong> A 6-person feature team building an online food-ordering app runs 2-week sprints.
Each sprint, they commit to a small set of user stories (e.g. "Add restaurant rating," "Fix checkout bug"), build and
test them, then demo the result to the Product Owner at the end of the sprint.`
        },
        {
            content: `<h3>The 3 Scrum Accountabilities</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Role</th><th>Responsibility</th></tr>
<tr><td>Product Owner</td><td>Owns the product backlog, decides what to build and in what priority order</td></tr>
<tr><td>Scrum Master</td><td>Facilitates the process, removes blockers, ensures the team follows Scrum practices</td></tr>
<tr><td>Development Team</td><td>Cross-functional group (devs, testers, etc.) that builds the increment each sprint</td></tr>
</table>`
        },
        {
            content: `<h3>Scrum Artifacts</h3>
• <strong>Product Backlog</strong> - the full, prioritized list of everything that could be built for the product. <br>
• <strong>Sprint Backlog</strong> - the small subset of backlog items the team commits to for the current sprint. <br>
• <strong>Increment</strong> - the working, tested piece of software produced at the end of the sprint. <br><br>

<strong>Example:</strong> The Product Backlog for a food-app might have 200 items. This sprint's Sprint Backlog might
just be 5 of them: "restaurant search filter," "OTP login," "cart quantity update," etc.`
        },
        {
            content: `<h3>The Sprint Cycle - Step by Step</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1. Sprint Planning     - team picks items from Product Backlog into Sprint Backlog
2. Daily Scrum         - 15-minute daily stand-up: what I did, what I'll do, any blockers
3. Sprint Execution    - team builds and tests the committed items
4. Sprint Review       - demo the working increment to the Product Owner/stakeholders
5. Sprint Retrospective - team reflects: what went well, what to improve next sprint</pre>
This cycle then repeats for the next sprint.`
        }
    ],
    expert: [
        {
            content: `<h3>The 5 Scrum Events in Depth</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Event</th><th>Typical Duration</th><th>Purpose</th></tr>
<tr><td>Sprint Planning</td><td>~2 hrs per week of sprint</td><td>Decide sprint goal and select backlog items the team can realistically complete</td></tr>
<tr><td>Daily Scrum</td><td>15 minutes</td><td>Synchronize the team daily, surface blockers early</td></tr>
<tr><td>Sprint Review</td><td>~1 hr per week of sprint</td><td>Inspect the increment with stakeholders, gather feedback</td></tr>
<tr><td>Sprint Retrospective</td><td>~45 min - 1 hr</td><td>Inspect the team's process itself and agree on concrete improvements</td></tr>
<tr><td>The Sprint itself</td><td>1-4 weeks (2 weeks most common)</td><td>The container event that holds all the others; time-boxed and fixed length</td></tr>
</table>`
        },
        {
            content: `<h3>Story Points and Velocity</h3>
Scrum teams typically size backlog items using relative estimation ("story points," often Fibonacci-like: 1, 2, 3, 5, 8,
13) instead of hours, because relative sizing is faster and more reliable than absolute time estimates. <br><br>

<strong>Velocity</strong> is the number of story points a team completes per sprint on average - used to forecast how
much a team can realistically commit to in future sprints, not as a productivity/performance score for individuals.
Using velocity to compare or rank individual developers is a well-known anti-pattern that damages team trust.`
        },
        {
            content: `<h3>Scrum vs Kanban - A Quick Preview</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Scrum</th><th>Kanban</th></tr>
<tr><td>Cadence</td><td>Fixed-length sprints</td><td>Continuous flow, no fixed iterations</td></tr>
<tr><td>Roles</td><td>Defined (Product Owner, Scrum Master, Dev Team)</td><td>No prescribed roles</td></tr>
<tr><td>Change mid-cycle</td><td>Discouraged mid-sprint; goes into next sprint</td><td>Can be pulled in anytime if capacity allows</td></tr>
</table>
The full Kanban comparison is covered in its own dedicated topic.`
        },
        {
            content: `<h3>Common Pitfalls with Scrum</h3>
• <strong>Turning the Daily Scrum into a status report to the Scrum Master</strong> - it should be peer-to-peer team
sync, not a manager check-in. <br>
• <strong>Overcommitting the Sprint Backlog</strong> - repeatedly failing to complete sprint commitments erodes trust
with stakeholders and burns the team out. <br>
• <strong>Skipping the Retrospective</strong> - without it, the team never improves its own process; it becomes "Scrum
in name only." <br>
• <strong>Product Owner not truly empowered</strong> - if the PO can't make real prioritization decisions, sprint
planning becomes guesswork. <br>
• <strong>Treating story points as time estimates</strong> - conflating points with hours defeats the purpose of
relative estimation and skews velocity tracking.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Scrum?</td><td>An Agile framework that organizes work into fixed-length sprints with defined roles (Product Owner, Scrum Master, Dev Team), events, and artifacts</td></tr>
<tr><td>What are the three Scrum roles?</td><td>Product Owner (owns priorities), Scrum Master (facilitates/removes blockers), Development Team (builds the increment)</td></tr>
<tr><td>What are the Scrum artifacts?</td><td>Product Backlog, Sprint Backlog, and the Increment (working tested output of a sprint)</td></tr>
<tr><td>Name the 5 Scrum events.</td><td>The Sprint, Sprint Planning, Daily Scrum, Sprint Review, Sprint Retrospective</td></tr>
<tr><td>What is the purpose of the Daily Scrum?</td><td>A 15-minute team sync to share progress and surface blockers early - not a status report to a manager</td></tr>
<tr><td>What is velocity in Scrum, and how should it be used?</td><td>The average story points a team completes per sprint, used to forecast future capacity - it should never be used to rank or compare individual developers</td></tr>
<tr><td>What happens if a team keeps overcommitting the Sprint Backlog?</td><td>It erodes stakeholder trust and burns the team out; the fix is planning more conservatively based on actual historical velocity</td></tr>
<tr><td>How would you handle a new urgent requirement mid-sprint?</td><td>In Scrum, avoid disrupting the current sprint commitment - log it in the Product Backlog and prioritize it for the next Sprint Planning, unless it's a true emergency requiring the Product Owner to cancel the sprint</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: Sprint Ceremonies on a Team's Weekly Calendar</h3>
Here's how a real 2-week sprint typically lands on a team's calendar (a common source of confusion for people new to Scrum): <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Week 1                                  Week 2
Mon    Tue  Wed  Thu  Fri               Mon  Tue  Wed  Thu  Fri
Plan   |    |    |    | Backlog         |    |    |    |    Review
(2hr)  Daily Scrum (15 min every day) ---------------------> Demo (1hr)
                                                              Retro (1hr)
                                                              --> next Sprint Planning
Dev + Test work happens continuously between ceremonies</pre>
Sprint Planning and Review/Retro bookend the sprint; the Daily Scrum is the only ceremony that repeats every single
day. Everything else in the calendar (actual coding, testing, code review) happens between these fixed checkpoints.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Daily Scrum runs 45 minutes and feels like a status meeting to the Scrum Master</td><td>Team turned a peer sync into a manager status report, discussing detailed problem-solving instead of blockers</td><td>Check who's actually talking - if it's mostly reporting to one person rather than team members syncing with each other</td><td>Refocus the meeting strictly on progress/plan/blockers; move detailed problem-solving to a separate follow-up conversation</td></tr>
<tr><td>Team consistently completes only 60% of the Sprint Backlog</td><td>Overcommitment during Sprint Planning - estimates ignore historical velocity and unplanned interruptions</td><td>Compare committed points vs actual completed points over several sprints (this is exactly what velocity tracks)</td><td>Plan future sprints using the team's actual average velocity, not optimistic capacity</td></tr>
<tr><td>Stakeholders stop attending Sprint Review because "nothing useful happens there"</td><td>Reviews became a checklist readout instead of a real demo gathering actionable feedback</td><td>Check whether feedback from past reviews ever changed backlog priority</td><td>Make reviews interactive - demo working software, actively solicit feedback, and visibly feed it into backlog reprioritization</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Daily Scrum as a status report</strong> - team members reporting to the Scrum Master instead of
syncing with each other as peers. <br>
• <strong>Skipping the Retrospective when the sprint is "busy"</strong> - the first ceremony teams cut under
pressure is usually the one most responsible for long-term improvement. <br>
• <strong>Product Owner who can't say no</strong> - a PO who approves every stakeholder request into the backlog
without real prioritization defeats the purpose of having a backlog at all. <br>
• <strong>Treating the Sprint Backlog as fixed and immutable to the point of ignoring reality</strong> - refusing to
adjust a clearly failing sprint plan just because it was "committed." <br>
• <strong>Story points reported as hours to management</strong> - undermines relative estimation and creates
pressure to hit arbitrary numeric targets instead of delivering value.`
        }
    ]
};
