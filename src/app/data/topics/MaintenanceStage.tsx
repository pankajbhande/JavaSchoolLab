import { Topic } from '../coreJava';

export const maintenanceStage: Topic = {
    id: 'maintenance-stage',
    name: 'Maintenance',
    beginner: [
        {
            content: `<h3>What is the Maintenance Stage?</h3>
After software is live, it doesn't just stay untouched forever - the maintenance stage is about ongoing
work to keep it running well, fix problems, and make small improvements over time. <br><br>
Think of it like maintaining a car after buying it - regular servicing, fixing issues, and occasionally
upgrading parts to keep it running smoothly for years. <br><br>
Example: Months after a shopping app launches, the team keeps fixing minor bugs users report and
occasionally adds small improvements like a better search filter.`
        },
        {
            content: `<h3>Types of Maintenance</h3>
• <strong>Corrective Maintenance</strong> - fixing bugs that are found after release. <br>
• <strong>Adaptive Maintenance</strong> - updating software to work with new environments (e.g. a new
Android version). <br>
• <strong>Perfective Maintenance</strong> - improving performance or adding small enhancements based on
user feedback. <br>
• <strong>Preventive Maintenance</strong> - fixing potential problems before they cause issues (e.g.
upgrading an old, soon-unsupported library). <br><br>
Example: Fixing a checkout bug is corrective; updating the app so it works with a new phone's OS update
is adaptive; adding a "dark mode" people asked for is perfective.`
        },
        {
            content: `<h3>Handling Bug Reports</h3>
Once software is used by many real people, they will find bugs developers didn't catch during testing.
Maintenance includes a process for users/support teams to report these issues so they get fixed. <br><br>
Example: A user emails support saying the app crashes when uploading a large photo - this gets logged as
a bug ticket and assigned to a developer to investigate and fix.`
        },
        {
            content: `<h3>Patches and Updates</h3>
Fixes and small improvements are released periodically as updates, without needing to rebuild the whole
application from scratch. <br><br>
Example: A mobile app releases "version 2.3.1" which just fixes a login bug, delivered as a small update
through the app store rather than a brand-new release.`
        },
        {
            content: `<h3>Why This Stage Matters</h3>
Most of a software product's total lifetime and cost is actually spent here, not during initial
development - software that isn't maintained becomes outdated, buggy, insecure, and eventually
unusable. <br><br>
Example: An app that never gets security updates becomes an easy target for hackers over time, even if
it worked perfectly when it first launched.`
        }
    ],
    expert: [
        {
            content: `<h3>What Actually Happens at This Stage in a Real Org</h3>
Maintenance is typically the longest phase of a system's life - studies commonly cite 60-80% of total
software cost is spent here. In practice, dedicated support/maintenance engineers (or the same product
team on a rotation) triage incoming issues, prioritize them, and ship fixes through the normal
build-test-deploy pipeline. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Bug/Feedback Reported --> Triaged & Prioritized (severity/impact)
   --> Assigned to engineer --> Root cause analysis
   --> Fix developed & tested --> Released via normal CI/CD pipeline
   --> Verified in production --> Ticket closed</pre>`
        },
        {
            content: `<h3>Maintenance Types (Formal Classification)</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Purpose</th><th>Example</th></tr>
<tr><td>Corrective</td><td>Fix defects found in production</td><td>Fixing a null pointer exception crashing checkout</td></tr>
<tr><td>Adaptive</td><td>Adjust to environment changes</td><td>Updating code for a new OS/library/API version</td></tr>
<tr><td>Perfective</td><td>Improve performance/usability</td><td>Optimizing a slow query, refining UI based on feedback</td></tr>
<tr><td>Preventive</td><td>Reduce future risk before it becomes an issue</td><td>Refactoring fragile legacy code, upgrading deprecated dependencies</td></tr>
</table>`
        },
        {
            content: `<h3>Managing Technical Debt</h3>
A major part of expert-level maintenance is managing <strong>technical debt</strong> - shortcuts taken
earlier (to ship faster) that now slow the team down. Teams typically allocate a fixed percentage of
each sprint (e.g. 15-20%) specifically to pay down technical debt alongside bug fixes and feature work,
rather than letting it silently accumulate. <br><br>
Tooling commonly used: Jira/ServiceNow for ticket tracking and SLAs, SonarQube for tracking code quality/
debt trends over time, PagerDuty/Opsgenie for incident-driven maintenance work.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Impact</th></tr>
<tr><td>No time budgeted for maintenance (100% focus on new features)</td><td>Bugs pile up, technical debt grows, system becomes fragile over time</td></tr>
<tr><td>No SLA for bug severity levels</td><td>Critical production bugs sit unaddressed for as long as minor cosmetic ones</td></tr>
<tr><td>Original developers leave with no documentation</td><td>New engineers struggle to safely maintain code they don't understand ("knowledge silo" risk)</td></tr>
<tr><td>Ignoring dependency/security updates</td><td>System accumulates known vulnerabilities, becoming an easy attack target</td></tr>
<tr><td>Treating every fix as urgent</td><td>Team constantly firefights instead of doing planned, sustainable maintenance work</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the four types of software maintenance?</td><td>Corrective (fix bugs), Adaptive (adjust to environment changes), Perfective (improve/enhance), Preventive (reduce future risk)</td></tr>
<tr><td>Why does maintenance typically cost more than initial development over a system's life?</td><td>Because the maintenance phase spans years, accumulating many small fixes, updates, and enhancements that together exceed the original one-time build cost</td></tr>
<tr><td>What is technical debt?</td><td>The implied future cost of choosing a quick/easy solution now instead of a better approach that would take longer, which must eventually be "paid back" via refactoring</td></tr>
<tr><td>How should maintenance bugs be prioritized?</td><td>By severity and business impact (e.g. production outage vs cosmetic UI issue), typically governed by SLA response-time targets</td></tr>
<tr><td>What is a hotfix?</td><td>An urgent, small, out-of-cycle fix deployed quickly to resolve a critical production issue, bypassing the normal release schedule</td></tr>
<tr><td>Why is documentation important for maintainability?</td><td>It lets engineers who didn't originally write the code understand and safely modify it, reducing risk when the original author is unavailable</td></tr>
<tr><td>What is preventive maintenance and why do it even without a current bug?</td><td>Proactively refactoring or upgrading components (e.g. deprecated libraries) before they cause failures, reducing future risk and cost</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Maintenance closes the loop back into the exact same pipeline used for original development - a bug found
in production doesn't get a special process, it re-enters the normal ticket-to-deploy flow, just triggered
by an incident/support ticket instead of a new feature request. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Monitoring/Support/User Report --> Ticket Created (Jira/ServiceNow)
   --> Triaged by severity/SLA --> Assigned to engineer
   --> Fix goes through: Development --> Build --> Testing --> Deployment
   --> Verified in production via Monitoring
   --> Ticket closed, feeds into technical-debt/velocity metrics</pre>
This is why maintenance is often called "the SDLC running in miniature, forever" - every fix is a small
trip through the same requirement-to-deployment pipeline the original system went through.`
        },
        {
            content: `<h3>Production Problems Caused by This Stage</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A security patch breaks an unrelated feature</td><td>No regression test suite exists for the legacy code being patched</td><td>Check test coverage on the patched module - little to none, so the side effect went undetected</td><td>Add characterization/regression tests around legacy code before making any change, even "safe" security patches</td></tr>
<tr><td>The same class of bug keeps recurring every few months</td><td>Fixes only patch symptoms, root cause analysis is skipped to save time</td><td>Review past tickets for that area - multiple "fixes" for what is really one underlying design flaw</td><td>Do proper root cause analysis and fix the underlying issue (e.g. a race condition) rather than repeatedly patching symptoms</td></tr>
<tr><td>A critical production bug sits unfixed for a week while the team ships new features</td><td>No SLA or prioritization policy separates maintenance work from feature work</td><td>Check ticket aging reports - critical bugs and "nice to have" enhancements sit in the same undifferentiated backlog</td><td>Define severity-based SLAs and reserve dedicated sprint capacity for maintenance so critical fixes aren't starved by feature pressure</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>100% of every sprint spent on new features</strong>, with zero time budgeted for bug fixes or technical debt. <br>
• <strong>"If it ain't broke, don't touch it"</strong> applied to security-critical dependencies - deferring upgrades until forced by a breach or vendor deadline. <br>
• <strong>Fixing bugs without adding a regression test</strong>, so the same bug quietly returns later. <br>
• <strong>Tribal-knowledge maintenance</strong> - only one engineer understands a legacy module, with no documentation to transfer that knowledge. <br>
• <strong>Treating every incoming ticket as equally urgent</strong>, causing constant context-switching and firefighting instead of planned, prioritized work.`
        }
    ]
};
