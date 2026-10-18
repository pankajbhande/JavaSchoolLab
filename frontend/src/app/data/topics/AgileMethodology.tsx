import { Topic } from '../coreJava';

export const agileMethodology: Topic = {
    id: 'agile',
    name: 'Agile',
    beginner: [
        {
            content: `<h3>What is Agile?</h3>
Agile is an approach to software development where the team builds the product in small pieces (iterations), regularly
shows working software to the customer, and adapts based on feedback - instead of trying to plan everything perfectly upfront. <br><br>

<strong>Real-world example:</strong> A small feature team building a food-delivery app works in 2-week cycles ("sprints").
Every 2 weeks, they demo a small working piece (e.g. "search restaurants," then "add to cart," then "checkout") to the
product owner, gather feedback, and adjust the next 2 weeks of work accordingly - rather than building the entire app for
6 months before showing anyone.`
        },
        {
            content: `<h3>The Agile Manifesto - 4 Core Values</h3>
Agile isn't one fixed process; it's a set of values and principles (from the 2001 "Agile Manifesto") that many frameworks
(Scrum, Kanban, XP) implement differently: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Value</th><th>Over</th></tr>
<tr><td>Individuals and interactions</td><td>Processes and tools</td></tr>
<tr><td>Working software</td><td>Comprehensive documentation</td></tr>
<tr><td>Customer collaboration</td><td>Contract negotiation</td></tr>
<tr><td>Responding to change</td><td>Following a fixed plan</td></tr>
</table>
<br>
Note: the item on the right isn't thrown away (documentation, planning, tools still matter) - Agile just values the item
on the left more when trade-offs must be made.`
        },
        {
            content: `<h3>A Simple 2-Week Sprint Example</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Day 1        : Sprint Planning - team picks small user stories to build this sprint
Day 2-9      : Development + daily 15-min stand-up meetings to sync progress
Day 10       : Sprint Review/Demo - show working feature to product owner/stakeholders
Day 10 (pm)  : Sprint Retrospective - team discusses what went well/poorly, improves process
Day 11       : Next Sprint Planning begins...</pre>
This cycle repeats every 2 weeks, continuously delivering small, working increments of the product.`
        },
        {
            content: `<h3>Why Agile Feels Different from Waterfall</h3>
• Requirements aren't fully fixed upfront - a prioritized "backlog" of features can be reordered as priorities shift. <br>
• The customer sees working software every couple of weeks, not just at the very end. <br>
• Teams are typically small, cross-functional (devs + QA + product owner together), and self-organizing. <br>
• Change is expected and welcomed, even late in development - not treated as a failure of planning.`
        }
    ],
    expert: [
        {
            content: `<h3>Agile Frameworks - Agile Is a Philosophy, Not a Process</h3>
A common confusion: "Agile" itself is not a step-by-step process - it's a set of values/principles. The actual
day-to-day process comes from a framework that implements those values: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Framework</th><th>Core Idea</th></tr>
<tr><td>Scrum</td><td>Fixed-length sprints, defined roles (Scrum Master, Product Owner), sprint ceremonies</td></tr>
<tr><td>Kanban</td><td>Continuous flow, visual board, limit work-in-progress, no fixed sprints</td></tr>
<tr><td>Extreme Programming (XP)</td><td>Agile + strong engineering practices - pair programming, TDD, continuous integration</td></tr>
</table>
<br>
Scrum and Kanban each get a dedicated topic - this topic focuses on Agile as the overarching philosophy.`
        },
        {
            content: `<h3>Agile vs Waterfall in Practice</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Dimension</th><th>Waterfall</th><th>Agile</th></tr>
<tr><td>Planning</td><td>Detailed, upfront, for the whole project</td><td>High-level upfront, detailed planning per sprint/iteration</td></tr>
<tr><td>Change handling</td><td>Treated as scope creep, formally controlled</td><td>Expected and incorporated via backlog reprioritization</td></tr>
<tr><td>Delivery cadence</td><td>Single release at project end</td><td>Frequent small releases (every sprint or continuously)</td></tr>
<tr><td>Team structure</td><td>Often siloed (separate dev/QA/ops teams handing off work)</td><td>Cross-functional team owns a feature end-to-end</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls When "Doing Agile"</h3>
Many teams claim to be Agile but aren't, in practice - this is a common real interview discussion point: <br>
• <strong>"Water-Scrum-Fall"</strong> - calling it Agile while still doing rigid upfront planning and only demoing at
the very end; sprints become just internal checkpoints, not real feedback loops. <br>
• <strong>No real product owner engagement</strong> - sprints happen, but nobody with authority to reprioritize actually
reviews the demos, so "customer collaboration" never really happens. <br>
• <strong>Sprint as a mini-Waterfall</strong> - cramming requirements->design->code->test all into a rigid sequence inside
each 2-week sprint, losing Agile's iterative feedback benefit. <br>
• <strong>Ignoring technical debt</strong> - moving fast without investing in code quality/tests eventually slows every
future sprint down.`
        },
        {
            content: `<h3>When NOT to Use Agile</h3>
Agile isn't universally superior - it has real trade-offs: <br>
• Fixed-price contracts where scope must be nailed down before signing are hard to fit into an Agile "we'll figure it
out as we go" model. <br>
• Highly regulated/safety-critical systems (e.g. medical devices, aviation) often need the heavy upfront documentation
and traceability that Waterfall/V-Model provide. <br>
• Distributed teams with poor communication tooling struggle with Agile's reliance on frequent, tight collaboration.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Agile?</td><td>An iterative approach to software development based on the Agile Manifesto's values, emphasizing working software, customer collaboration, and responding to change over rigid upfront planning</td></tr>
<tr><td>Is Agile a process or a set of values?</td><td>A set of values/principles - actual processes (Scrum, Kanban, XP) implement those values differently</td></tr>
<tr><td>What are the 4 core values of the Agile Manifesto?</td><td>Individuals & interactions over processes & tools; working software over documentation; customer collaboration over contract negotiation; responding to change over following a plan</td></tr>
<tr><td>How does Agile handle changing requirements compared to Waterfall?</td><td>Agile expects and welcomes change via a reprioritized backlog even late in development; Waterfall treats change as costly scope creep requiring formal control</td></tr>
<tr><td>What is "Water-Scrum-Fall" and why is it a problem?</td><td>Running Agile-named sprints while keeping rigid upfront planning and only truly demoing at the end - it loses Agile's core benefit of continuous, real feedback</td></tr>
<tr><td>When would you NOT recommend Agile?</td><td>Fixed-price contracts with pre-agreed scope, or highly regulated/safety-critical projects that need heavy upfront documentation and traceability</td></tr>
<tr><td>How would you explain Agile to a non-technical stakeholder?</td><td>Instead of waiting months to see the finished product, you'll see and can give feedback on small working pieces every couple of weeks, so we can course-correct early</td></tr>
<tr><td>What's the difference between Agile and Scrum?</td><td>Agile is the philosophy/set of values; Scrum is one specific framework that implements Agile using sprints, defined roles, and ceremonies</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: Agile Values Inside a Real Team Calendar</h3>
Agile values aren't abstract - they map directly onto the rhythm of a real team's week, regardless of which
framework (Scrum/Kanban/XP) implements them: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Mon        Tue         Wed         Thu         Fri
--------------------------------------------------------
Standup    Standup     Standup     Standup     Standup     <- individuals & interactions
Code+Test  Code+Test   Code+Test   Code+Test   Demo/Review <- working software over docs
   |                      |                        |
   +-- backlog grooming --+                    Retro & plan
       with Product Owner                      next iteration <- responding to change</pre>
The Agile Manifesto's 4 values are what justify each of these recurring meetings - if you strip the "why," the same
calendar becomes empty ceremony (see Anti-Patterns below).`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Team runs daily standups and 2-week sprints but ships the same slow, buggy product as before</td><td>Cargo-cult Agile - copied the ceremonies without adopting the underlying values (feedback, adaptability, quality)</td><td>Check whether sprint reviews actually change what's built next, or whether the plan never changes regardless of feedback</td><td>Tie retrospective action items to visible process changes; make sprint reviews a real decision point, not a status readout</td></tr>
<tr><td>Every sprint "completes" all stories, but customers report the product doesn't meet their needs</td><td>No real product owner engagement - stories are approved by whoever's available, not someone empowered to judge fit</td><td>Check who actually attends sprint review and whether they have authority to reprioritize</td><td>Ensure a genuinely empowered Product Owner attends every review and can change backlog priority based on what's shown</td></tr>
<tr><td>Team burns out after several sprints of "we'll catch up next sprint"</td><td>Backlog items are estimated optimistically with no accounting for interruptions, bugs, or technical debt</td><td>Compare committed vs completed story points over the last 5 sprints</td><td>Plan sprints using actual historical velocity, and reserve explicit capacity for bug fixes/tech debt each sprint</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Cargo-cult Agile</strong> - running daily standups and calling 2-week blocks "sprints" with no real
iteration, feedback, or retrospective-driven improvement behind them. <br>
• <strong>"Water-Scrum-Fall"</strong> - Agile ceremonies wrapped around a process that still gates every release
behind a lengthy, Waterfall-style sign-off, negating the fast-feedback benefit. <br>
• <strong>Agile as an excuse for no planning</strong> - using "we're Agile, requirements will emerge" to justify
skipping any upfront thinking at all, leading to constant rework and directionless sprints. <br>
• <strong>Ignoring technical debt in the name of speed</strong> - always prioritizing new features over refactoring/
tests, until velocity collapses under the weight of an unmaintainable codebase. <br>
• <strong>Individual velocity tracking</strong> - using sprint metrics to rank or pressure individual developers,
which incentivizes gaming estimates instead of genuine collaboration.`
        }
    ]
};
