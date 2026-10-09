import { Topic } from '../coreJava';

export const incidentManagement: Topic = {
    id: 'incident-management',
    name: 'Incident Management',
    beginner: [
        {
            content: `<h3>What is an Incident?</h3>
An incident is an unplanned event that disrupts or degrades a service - the website is down, checkout is failing,
pages are loading slowly. Incident management is the structured process a team follows to detect, respond to, and
resolve it as quickly as possible, then learn from it afterward. <br><br>
Real-world analogy: it's a hospital's emergency room process - triage severity first, stabilize the patient quickly,
diagnose the full cause later, and review afterward how the response could be improved.`
        },
        {
            content: `<h4>Severity levels</h4>
Not every incident deserves the same urgency. Most teams classify incidents by impact so response effort matches
the real damage: <br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Severity</th><th>Example</th><th>Response</th></tr>
<tr><td>SEV-1 (Critical)</td><td>Entire site is down, payments failing for everyone</td><td>All-hands, immediate page, executives notified</td></tr>
<tr><td>SEV-2 (High)</td><td>One major feature broken for many users</td><td>On-call responds immediately, others as needed</td></tr>
<tr><td>SEV-3 (Low)</td><td>Minor UI bug affecting few users, workaround exists</td><td>Fixed in normal work, no urgent page</td></tr>
</table>`
        },
        {
            content: `<h4>The basic incident lifecycle</h4>
1. <strong>Detect</strong> - a monitoring alert fires, or a user reports an issue. <br>
2. <strong>Triage</strong> - assess severity and impact; assign an incident commander. <br>
3. <strong>Mitigate</strong> - stop the bleeding fast (rollback, restart, feature flag off) - not necessarily fix the
root cause yet. <br>
4. <strong>Resolve</strong> - confirm the service is healthy again. <br>
5. <strong>Review</strong> - hold a post-incident review (see Root Cause Analysis) to learn and prevent recurrence.`
        },
        {
            content: `<h4>Mitigate first, understand later</h4>
A beginner mistake is trying to fully diagnose the root cause while users are actively affected. The priority order
during an active incident is: stop user impact first (e.g. roll back the last deploy), investigate the deep "why"
after service is restored.`,
            codeExamples: [
                `// During the incident (mitigate fast):
git log --oneline -5          // what was the last deploy?
kubectl rollout undo deployment/checkout-service   // roll back immediately

// AFTER service is restored (investigate thoroughly):
// - review logs/metrics around the deploy time
// - reproduce in staging
// - write up findings in a root cause analysis doc`
            ]
        },
        {
            content: `<h4>Communication during an incident</h4>
• Post a clear, timestamped update to a shared channel as soon as an incident is confirmed. <br>
• Keep stakeholders updated at a steady cadence (e.g. every 15-30 minutes), even if the update is just "still
investigating." <br>
• Announce clearly when it's resolved, so people stop worrying and on-call can stand down.`
        }
    ],
    expert: [
        {
            content: `<h3>Incident Command Structure</h3>
Borrowed from emergency response (the Incident Command System used by fire departments), many tech companies assign
clear roles during a major incident so no single person is both fighting the fire and managing communication:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Role</th><th>Responsibility</th></tr>
<tr><td>Incident Commander (IC)</td><td>Owns the overall response, makes final calls, coordinates - does NOT necessarily fix the bug themselves</td></tr>
<tr><td>Communications Lead</td><td>Posts status updates to stakeholders/customers, shields responders from interruptions</td></tr>
<tr><td>Subject Matter Expert(s)</td><td>The engineer(s) actually diagnosing and mitigating the technical issue</td></tr>
<tr><td>Scribe</td><td>Logs the timeline of actions taken in real time - critical raw material for the later review</td></tr>
</table>`
        },
        {
            content: `<h3>MTTD, MTTA, MTTR - the Metrics That Matter</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
Incident starts
      |
      |--- MTTD (Mean Time To Detect) ---|
      |                                   v
      |                             Alert fires / reported
      |                                   |
      |            |--- MTTA (Mean Time To Acknowledge) ---|
      |            |                                        v
      |            |                                  Someone responds
      |            |                                        |
      |            |              |--- MTTR (Mean Time To Resolve) ---|
      |            |              |                                    v
      |            |              |                              Service restored
</pre>
Teams track these over time as health metrics for their incident process itself - a rising MTTD often means
monitoring/alerting gaps; a rising MTTR often means runbooks are missing or the on-call rotation is under-resourced.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Root-causing during the fire</strong> - spending precious minutes debugging deeply instead of mitigating
first (e.g. rollback) delays recovery; deep analysis belongs in the post-incident review. <br>
• <strong>No single Incident Commander</strong> - multiple people independently trying things can cause conflicting
changes and confusion about what's already been tried. <br>
• <strong>Blameless review skipped or turned blame-y</strong> - if people fear punishment for causing an incident,
they hide information in future incidents instead of surfacing it, which makes the whole system less safe over time. <br>
• <strong>No communication cadence</strong> - stakeholders left in the dark escalate through other channels, pulling
responders' attention away from the actual fix.`
        },
        {
            content: `<h3>Incident Management vs Root Cause Analysis</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Incident Management</th><th>Root Cause Analysis</th></tr>
<tr><td>Timing</td><td>During the active outage</td><td>After service is restored</td></tr>
<tr><td>Goal</td><td>Restore service as fast as possible</td><td>Understand why it happened and prevent recurrence</td></tr>
<tr><td>Output</td><td>Service healthy again, incident timeline logged</td><td>A written post-incident report with action items</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the priority order during an active incident: mitigate or fully diagnose root cause?</td><td>Mitigate first (stop user impact, e.g. rollback) - deep root cause investigation happens after service is restored.</td></tr>
<tr><td>What does an Incident Commander do?</td><td>Owns and coordinates the overall response and makes decisions, but doesn't necessarily fix the technical issue themselves - that's the subject matter expert's role.</td></tr>
<tr><td>What do MTTD, MTTA, and MTTR stand for?</td><td>Mean Time To Detect, Mean Time To Acknowledge, and Mean Time To Resolve - metrics tracking how fast an incident response process performs.</td></tr>
<tr><td>Why are severity levels (SEV-1, SEV-2, SEV-3) useful?</td><td>They let a team match response urgency/staffing to actual business impact instead of treating every issue the same.</td></tr>
<tr><td>Why is a "blameless" incident review important?</td><td>If people fear punishment they hide relevant details, which makes future incidents harder to prevent - psychological safety leads to more complete, honest information.</td></tr>
<tr><td>What role does a "scribe" play during an incident?</td><td>Logs the real-time timeline of actions taken, which becomes critical input for the post-incident review.</td></tr>
<tr><td>Why does incident communication need a regular update cadence, even with no new information?</td><td>It prevents stakeholders from escalating through other channels out of uncertainty, which would distract responders from the actual fix.</td></tr>
<tr><td>What's the difference between incident management and root cause analysis?</td><td>Incident management is the real-time response to restore service; root cause analysis is the after-the-fact investigation into why it happened and how to prevent recurrence.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Incident management sits at the intersection of monitoring, on-call tooling, and communication systems - it's the
process that activates when automated detection hands off to humans:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Monitoring/alerting  (metrics cross threshold)
        |
        v
  Pager fires  --->  On-call acknowledges  --->  Incident Commander assigned
        |                                                |
        v                                                v
  Severity triaged (SEV-1/2/3)                 Communications Lead posts
        |                                       status updates every 15-30 min
        v
  Mitigate FIRST (rollback / feature flag off / restart)
        |
        v
  Service restored  --->  Incident closed  --->  Handoff to Root Cause Analysis (postmortem)
</pre>
Notice mitigation happens before deep diagnosis - the incident process exists specifically to restore service fast,
deferring the "why" investigation to the RCA process that follows once users are no longer impacted.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>The same outage recurs every few months</td><td>Root cause analysis was skipped or its action items were never followed through after the first incident</td><td>Postmortem doc from the earlier incident exists but its action items are still open/unassigned</td><td>Track RCA action items as owned, dated tickets and review open ones in a recurring engineering review</td></tr>
<tr><td>An incident drags on for hours with multiple engineers making conflicting changes</td><td>No single Incident Commander was assigned, so people independently tried fixes without coordination</td><td>Incident timeline/scribe log shows overlapping, uncoordinated changes from multiple people simultaneously</td><td>Assign an IC immediately on any SEV-1/2, whose job is coordination, not necessarily hands-on fixing</td></tr>
<tr><td>Engineers hide details or downplay their role in future incident reviews</td><td>A prior postmortem turned into blame-assignment rather than a blameless systems review</td><td>Postmortem docs name individuals and assign fault rather than describing systemic/process gaps</td><td>Adopt and visibly enforce blameless postmortem norms; focus on "what allowed this" not "who did this"</td></tr>
<tr><td>Stakeholders escalate through side channels mid-incident, distracting responders</td><td>No regular communication cadence was maintained during the incident</td><td>Status channel shows long silent gaps between updates while the incident was still active</td><td>Post updates on a fixed cadence (e.g. every 15-30 min) even when the update is just "still investigating"</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Root-causing during the fire</strong> - deep debugging instead of fast mitigation extends user impact
unnecessarily. <br>
• <strong>No single Incident Commander</strong> - multiple people independently changing things causes confusion
about what's already been tried. <br>
• <strong>Blame-driven reviews</strong> - punishing people for causing incidents makes future incidents less
transparent, not safer. <br>
• <strong>Silent incidents</strong> - no communication cadence leaves stakeholders escalating through unofficial
channels. <br>
• <strong>Treating every incident the same regardless of severity</strong> - paging the whole org for a SEV-3 burns
attention that should be reserved for real emergencies.`
        }
    ]
};
