import { Topic } from '../coreJava';

export const rootCauseAnalysis: Topic = {
    id: 'root-cause-analysis',
    name: 'Root Cause Analysis',
    beginner: [
        {
            content: `<h3>What is Root Cause Analysis?</h3>
Root Cause Analysis (RCA) is the process of digging past the obvious symptom of a problem to find its true
underlying cause, so it can be fixed permanently instead of patched temporarily. <br><br>
Real-world analogy: if a car keeps stalling, replacing the battery every week "fixes" the symptom, but if the real
issue is a faulty alternator that keeps draining the battery, you'll be back at the shop constantly until someone
asks "why does the battery keep dying?" enough times.`
        },
        {
            content: `<h4>Symptom vs Root Cause</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom (what you see)</th><th>Possible root cause (why it happened)</th></tr>
<tr><td>Website returns 500 errors</td><td>A recent deploy introduced a null pointer bug in a rarely-hit code path</td></tr>
<tr><td>App is slow at 9am every day</td><td>A batch job runs at 9am and locks a database table other requests need</td></tr>
<tr><td>Payment fails intermittently</td><td>A third-party API times out under load and there's no retry logic</td></tr>
</table>`
        },
        {
            content: `<h4>The "5 Whys" technique</h4>
A simple beginner-friendly RCA method: ask "why?" repeatedly (typically about five times) until you reach a cause
that, if fixed, would prevent the problem from recurring.`,
            codeExamples: [
                `Problem: The checkout page crashed for users this morning.

Why #1: Why did it crash?
  -> Because the app threw a NullPointerException.

Why #2: Why was there a NullPointerException?
  -> Because order.getCustomer() returned null.

Why #3: Why did getCustomer() return null?
  -> Because guest checkout orders don't have a linked customer record.

Why #4: Why wasn't that case handled?
  -> Because the new discount feature assumed every order has a customer.

Why #5: Why was that assumption made?
  -> Because the feature wasn't tested with a guest-checkout scenario.

Root cause: Missing test coverage for guest checkout allowed an
unvalidated assumption to reach production.
Fix: Add a null check AND add a guest-checkout test case.`
            ]
        },
        {
            content: `<h4>Why patching the symptom isn't enough</h4>
Adding a quick try/catch around the crash would stop the error message, but the underlying bad assumption (every
order has a customer) would still be lurking, ready to cause a different failure somewhere else. A real fix
addresses the root cause, not just today's visible symptom.`
        },
        {
            content: `<h4>Writing it down</h4>
Even a small team benefits from writing a short RCA note for any issue that took real time to diagnose: what
happened, what was found via the 5 Whys, and what will change to prevent it - so the next similar bug doesn't
require re-discovering the same lesson.`
        }
    ],
    expert: [
        {
            content: `<h3>RCA Frameworks Beyond "5 Whys"</h3>
"5 Whys" is simple but has a known weakness: a single investigator can follow one linear chain and stop at the first
plausible-sounding cause, missing that most real incidents have multiple contributing factors. More rigorous
frameworks address this: <br>
• <strong>Fishbone (Ishikawa) Diagram</strong> - branches out into categories (People, Process, Technology,
Environment) so multiple contributing causes are considered in parallel, not just one linear chain. <br>
• <strong>Fault Tree Analysis</strong> - works backward from the failure through a formal logic tree of AND/OR
conditions that had to be true for it to occur - common in safety-critical/aerospace engineering. <br>
• <strong>Timeline-based RCA</strong> - reconstructs the exact sequence of events (deploys, config changes, traffic
spikes) around the incident, since incidents are often the coincidence of multiple otherwise-safe changes.`
        },
        {
            content: `<h3>The Post-Incident Review (Postmortem) Document</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
1. Summary          - one paragraph: what happened, impact, duration
2. Timeline          - timestamped sequence of detection, actions, resolution
3. Root Cause(s)     - the underlying technical AND process causes (usually more than one)
4. Contributing Factors - things that worsened impact or slowed response
5. What Went Well    - honest credit for effective parts of the response
6. Action Items      - specific, owned, dated tasks to prevent recurrence
</pre>
The action items section is the entire point of the exercise - an RCA that doesn't produce concrete follow-up work
is just an interesting story, not process improvement.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Stopping at "human error"</strong> - "the engineer forgot to check X" is rarely a true root cause; ask why
the system allowed that mistake to reach production undetected (missing validation, no CI check, unclear process). <br>
• <strong>Single-cause thinking</strong> - most real incidents are a combination of several individually-safe
conditions coinciding (e.g. a rare edge case + a monitoring gap + a recent unrelated config change). <br>
• <strong>Blame culture</strong> - if RCA turns into finding who to blame, people stop giving full, honest accounts in
future incidents, which makes the process systematically worse over time (see blameless postmortems). <br>
• <strong>No follow-through on action items</strong> - identifying the cause but never actually doing the preventive
work means the same class of incident recurs.`
        },
        {
            content: `<h3>RCA in Practice: Correlating with Version Control</h3>
A very common real-world RCA technique is bisecting recent changes against when a problem started, since most
production incidents follow a change of some kind: <br>`,
            codeExamples: [
                `# Find the commit that introduced a regression by testing midpoints
# between a known-good and known-bad commit
git bisect start
git bisect bad HEAD
git bisect good v2.4.0
# Git checks out a midpoint commit each round; you test and mark it:
git bisect good   # or: git bisect bad
# ...repeats until Git identifies the exact commit that introduced the bug`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the goal of Root Cause Analysis?</td><td>To find the true underlying cause of a problem (not just the visible symptom) so it can be fixed permanently and prevented from recurring.</td></tr>
<tr><td>What is the "5 Whys" technique?</td><td>Repeatedly asking "why" (typically ~5 times) about a problem until reaching a cause that, if addressed, would prevent recurrence.</td></tr>
<tr><td>What is a known weakness of the 5 Whys technique?</td><td>It follows one linear chain of causation and can stop at the first plausible answer, missing that most real incidents have multiple contributing factors.</td></tr>
<tr><td>Why is "human error" usually not an acceptable root cause?</td><td>It stops the investigation too early - the more useful question is why the system/process allowed that human mistake to reach production undetected.</td></tr>
<tr><td>What is a blameless postmortem and why does it matter?</td><td>An RCA process focused on systems/process rather than individual blame - it matters because blame culture makes people hide information, weakening future incident analysis.</td></tr>
<tr><td>What section of a postmortem document is considered the actual point of the exercise?</td><td>The action items - specific, owned, dated follow-up tasks; without them, RCA is just a narrative with no process improvement.</td></tr>
<tr><td>How can git bisect assist in root cause analysis?</td><td>It binary-searches between a known-good and known-bad commit to pinpoint the exact commit that introduced a regression.</td></tr>
<tr><td>What is a Fishbone (Ishikawa) diagram used for in RCA?</td><td>To branch out possible causes into categories (People, Process, Technology, Environment) so multiple contributing causes are considered, not just a single linear chain.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
RCA is the final stage of the incident lifecycle - it consumes the raw material the incident response generated and
converts it into concrete engineering work:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Incident resolved  --->  Scribe's real-time timeline handed off
        |
        v
  RCA investigation begins   (5 Whys / Fishbone / Timeline reconstruction)
        |
        v
  git log / git bisect / git blame  --->  pinpoint the exact change that introduced the issue
        |
        v
  Postmortem doc written   (Summary, Timeline, Root Cause(s), Contributing Factors, Action Items)
        |
        v
  Action items become tracked tickets  --->  fed back into sprint planning
        |
        v
  Prevented class of bug  --->  (ideally) reduces future incident frequency (MTTD/MTTR trend down)
</pre>
The loop only closes if action items actually get scheduled and done - an RCA that stops at "root cause identified"
without funneling into the backlog is a story, not a process improvement.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>The exact same class of outage happens again six months later</td><td>The prior postmortem's action items were written down but never actually scheduled or completed</td><td>Old postmortem doc lists action items still marked "open" with no owner or due date</td><td>Track action items as real, owned, dated tickets in the normal backlog, reviewed until closed</td></tr>
<tr><td>RCA concludes "the engineer forgot to run migration X" and closes the investigation</td><td>Investigation stopped at human error instead of asking why the system allowed that mistake to reach production</td><td>Postmortem has no system-level finding (e.g. missing CI check, no validation) - only names a person's mistake</td><td>Push the "5 Whys" further: why wasn't there an automated check/gate that would have caught this before deploy?</td></tr>
<tr><td>Two independent-seeming bugs turn out to share a root cause discovered a week apart, wasting duplicate effort</td><td>RCA only looked at the single linear chain of the specific incident instead of considering multiple contributing factors together</td><td>Two separate postmortems reference the same underlying config/code issue without cross-referencing each other</td><td>Use a Fishbone diagram or timeline-based RCA to consider People/Process/Technology factors together, and cross-check against recent postmortems</td></tr>
<tr><td>Engineers give vague, guarded answers in the post-incident review</td><td>A previous RCA was used to assign blame, teaching the team that honesty in reviews has personal consequences</td><td>Review meeting notes/recordings show defensive language and reluctance to discuss what actually happened</td><td>Explicitly commit to blameless postmortems and demonstrate it in practice - focus questions on systems, not individuals</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Stopping at "human error"</strong> - fails to ask why the system allowed the mistake to reach production
undetected. <br>
• <strong>Single-cause thinking</strong> - most real incidents are a coincidence of several individually-safe
conditions, not one isolated cause. <br>
• <strong>Blame-driven RCA</strong> - turns future incident reviews into guarded, incomplete accounts instead of
honest ones. <br>
• <strong>Action items with no owner or due date</strong> - guarantees they never actually get done. <br>
• <strong>Skipping RCA for "minor" incidents</strong> - small recurring issues often share a root cause with a future
major incident that could have been prevented.`
        }
    ]
};
