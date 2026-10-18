import { Topic } from '../coreJava';

export const technicalDebt: Topic = {
    id: 'technical-debt',
    name: 'Technical Debt',
    beginner: [
        {
            content: `<h3>What is Technical Debt?</h3>
Technical debt is the extra work created in the future because a team chose a quick/easy solution now instead of a
better, more thorough one. The term comes from finance - like a loan, it gives you speed today but "interest"
(slower development, more bugs) accumulates until it's paid off (refactored). <br><br>
Real-world analogy: taping over a leaking pipe to stop a flood right now, instead of properly re-plumbing it. It
works today, but if you never come back to fix it properly, it eventually leaks again - possibly worse.`
        },
        {
            content: `<h4>How technical debt happens</h4>
• <strong>Deadline pressure</strong> - "we'll do it properly after the release" (and then never do). <br>
• <strong>Lack of knowledge</strong> - a team didn't know a better approach existed at the time. <br>
• <strong>Changing requirements</strong> - code was well-designed for old requirements but wasn't updated as they
changed. <br>
• <strong>Deliberate trade-off</strong> - intentionally shipping a simple version to validate an idea fast, planning
to improve it later if it succeeds.`
        },
        {
            content: `<h4>A simple code example</h4>
Copy-pasting logic instead of extracting a shared method is a classic small piece of technical debt.`,
            codeExamples: [
                `// Technical debt: same discount logic copy-pasted in two places
public double checkoutPriceA(Order order) {
    double total = order.getSubtotal();
    if (order.getCustomer().isPremium()) {
        total = total * 0.9; // 10% discount
    }
    return total;
}

public double checkoutPriceB(Cart cart) {
    double total = cart.getSubtotal();
    if (cart.getCustomer().isPremium()) {
        total = total * 0.9; // same rule, duplicated - now two places to update
    }
    return total;
}
// If the discount rule changes, someone has to remember to update BOTH places.
// Forgetting one is exactly the kind of bug technical debt causes.`
            ]
        },
        {
            content: `<h4>"Interest" you pay on technical debt</h4>
• New features take longer because developers have to work around messy code. <br>
• More bugs, because duplicated/tangled logic is easy to update in one place and forget in another. <br>
• New team members take longer to understand the codebase. <br>
• Fear of touching certain files ("nobody understands that module anymore").`
        },
        {
            content: `<h4>Not all debt is bad</h4>
Sometimes taking on technical debt deliberately is the right call - for example, shipping a simple hardcoded version
to test a business idea before investing in a robust one. The key is being honest about it: track it (e.g. a ticket
or a <code>// TODO</code> with context) so it doesn't get forgotten and quietly become permanent.`
        }
    ],
    expert: [
        {
            content: `<h3>The Technical Debt Quadrant</h3>
Martin Fowler categorizes debt along two axes: was it taken on deliberately or inadvertently, and was the decision
reckless or prudent. This distinction matters because "debt" isn't inherently bad - the danger is debt that's both
reckless and inadvertent (a team that doesn't even realize how much shortcut-taking is compounding).
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
                 Reckless                    Prudent
              +------------------+  +---------------------------+
Deliberate    | "We don't have   |  | "We must ship now and     |
              |  time for design"|  |  deal with consequences"  |
              +------------------+  +---------------------------+
              +------------------+  +---------------------------+
Inadvertent   | "What's          |  | "Now we know how we       |
              |  layering?"      |  |  should have done it"     |
              +------------------+  +---------------------------+
</pre>
Prudent-deliberate debt (consciously shipping fast with a plan to revisit) is normal and often the right business
call; reckless-inadvertent debt is the dangerous kind that erodes a codebase silently.`
        },
        {
            content: `<h3>Measuring and Tracking Debt</h3>
Mature engineering orgs don't let debt live only as tribal knowledge - they make it visible: <br>
• Static analysis tools (SonarQube) estimate a "debt ratio" or remediation time based on code smells and complexity
metrics. <br>
• Teams maintain a technical debt backlog alongside the feature backlog, with tickets that describe the shortcut,
its cost, and the proper fix. <br>
• Some teams reserve a fixed percentage of each sprint (e.g. 10-20%) specifically for debt paydown, so it doesn't
get perpetually deprioritized against new features.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Never paying it down</strong> - debt is invisible to stakeholders until velocity visibly slows or an
outage happens; teams need to make the cost concrete (e.g. "this module now takes 3x longer to modify safely"). <br>
• <strong>Treating all debt as equal</strong> - a messy but rarely-touched module is low priority; a messy module in
the critical path that changes weekly is high priority. Prioritize by (frequency of change) x (risk). <br>
• <strong>Rewriting instead of refactoring</strong> - "we'll just rewrite this whole thing" is often a much bigger
undertaking than incrementally paying debt down, and carries higher risk of losing subtle behavior. <br>
• <strong>Silent accumulation</strong> - debt taken on without being tracked/communicated compounds invisibly until
it's a crisis.`
        },
        {
            content: `<h3>Technical Debt vs Related Concepts</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Concept</th><th>Relationship</th></tr>
<tr><td>Refactoring</td><td>The mechanism used to pay down technical debt</td></tr>
<tr><td>Code Review</td><td>Can prevent new debt from entering, and surfaces existing debt for discussion</td></tr>
<tr><td>Root Cause Analysis</td><td>Incidents often trace back to unpaid technical debt as a contributing factor</td></tr>
<tr><td>Bug</td><td>A defect (incorrect behavior); debt is about structure/design quality, even in correct code</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is technical debt, in one sentence?</td><td>The implied future cost of choosing an easy/quick solution now instead of a better one, analogous to financial debt accruing interest.</td></tr>
<tr><td>Is technical debt always bad?</td><td>No - deliberate, prudent debt (consciously shipping fast with a plan to revisit) can be a sound business trade-off; reckless, inadvertent debt is the dangerous kind.</td></tr>
<tr><td>What does Fowler's Technical Debt Quadrant classify?</td><td>Debt along two axes - deliberate vs inadvertent, and reckless vs prudent - to distinguish sound trade-offs from careless shortcuts.</td></tr>
<tr><td>How do teams make technical debt visible instead of letting it accumulate silently?</td><td>By tracking it in a backlog, using static analysis tools to estimate debt/remediation cost, and reserving sprint time for paydown.</td></tr>
<tr><td>How should a team prioritize which debt to pay down first?</td><td>By impact - roughly (frequency the code changes) x (risk/cost if it goes wrong) - not by paying down all debt equally.</td></tr>
<tr><td>What's the relationship between technical debt and refactoring?</td><td>Refactoring is the primary tool used to pay down technical debt without changing external behavior.</td></tr>
<tr><td>Why is a full rewrite often riskier than incremental debt paydown?</td><td>Rewrites tend to take much longer than estimated and can silently drop subtle correct behavior the original system relied on.</td></tr>
<tr><td>Give an example of a small, common source of technical debt.</td><td>Copy-pasting logic (e.g. a discount calculation) into multiple places instead of extracting a shared method, creating multiple spots that must be kept in sync.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Technical debt doesn't live in one place - it's an accumulating balance that flows through the whole engineering
process until it's deliberately paid down:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Deadline pressure  --->  shortcut taken  --->  merged (debt "borrowed")
                                                        |
                                                        v
                                          Ticket logged in debt backlog
                                          (visible, not silent)
                                                        |
                        +-------------------------------+-------------------------------+
                        |                                                               |
                        v                                                               v
              Sprint reserves 10-20%                                        Static analysis (SonarQube)
              capacity for paydown                                          tracks debt ratio over time
                        |                                                               |
                        +-------------------------------+-------------------------------+
                                                        v
                                          Refactoring pays down the debt
                                          (interest stops compounding)
</pre>
Debt that never enters this loop - taken on silently, never ticketed, never revisited - is the kind that eventually
forces a crisis rather than a planned paydown.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Every new feature takes 3x longer than estimated</td><td>Years of accumulated shortcuts with no refactoring budget ever allocated</td><td>Estimation retrospectives show consistent underestimation concentrated in a few "scary" modules</td><td>Reserve fixed sprint capacity (e.g. 10-20%) specifically for debt paydown in the highest-friction modules</td></tr>
<tr><td>A simple bug fix in one module breaks two unrelated features</td><td>Duplicated logic across the codebase (copy-pasted instead of shared) drifted out of sync over time</td><td>grep finds the same business rule implemented slightly differently in 3+ places</td><td>Extract the duplicated logic into one shared, tested method/service and update all call sites</td></tr>
<tr><td>Nobody on the team is willing to touch the billing module</td><td>Debt accumulated silently for years with no tracking, until the module became too risky to change confidently</td><td>Git blame/commit history shows the module hasn't been meaningfully touched in over a year despite known issues</td><td>Write characterization tests to pin down current behavior, then incrementally refactor with that safety net</td></tr>
<tr><td>A "quick" hardcoded workaround from a prototype is still running in production two years later</td><td>Debt was taken on deliberately to validate an idea fast, but was never tracked or revisited after it succeeded</td><td>No ticket, TODO, or backlog item exists referencing the original shortcut decision</td><td>Always log intentional debt as a tracked ticket with context, even when shipping fast on purpose</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Taking on debt silently</strong> - shortcuts with no ticket, comment, or team awareness compound invisibly
until they cause a crisis. <br>
• <strong>Treating all debt as equally urgent (or equally ignorable)</strong> - a rarely-touched messy module is low
priority; the same mess in a module that changes weekly is high priority. <br>
• <strong>"We'll fix it after the release" that never happens</strong> - without a scheduled paydown mechanism, debt
paydown always loses to the next feature deadline. <br>
• <strong>Full rewrite instead of incremental paydown</strong> - underestimates effort and risks losing subtle correct
behavior the original code handled. <br>
• <strong>Treating debt purely as a technical problem</strong> - not communicating its cost in business terms (slower
delivery, more incidents) means it never gets prioritized against feature work.`
        }
    ]
};
