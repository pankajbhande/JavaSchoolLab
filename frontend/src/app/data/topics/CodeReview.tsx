import { Topic } from '../coreJava';

export const codeReview: Topic = {
    id: 'code-review',
    name: 'Code Review',
    beginner: [
        {
            content: `<h3>What is Code Review?</h3>
Code review is when another developer reads your proposed code changes before they get merged into the main codebase,
checking for bugs, design issues, and adherence to team standards. <br><br>
Real-world analogy: it's like a second pair of eyes proofreading an important email before you hit send - a fresh
reader often spots typos or unclear sentences the writer missed because they were too close to it.`
        },
        {
            content: `<h4>How it typically works</h4>
1. A developer finishes a feature/fix on a branch and opens a Pull Request (PR) / Merge Request (MR). <br>
2. One or more teammates are requested as reviewers. <br>
3. Reviewers read the diff, leave comments, and either approve or request changes. <br>
4. The author addresses feedback (or discusses it) and pushes updates. <br>
5. Once approved, the code is merged.`
        },
        {
            content: `<h4>What reviewers actually look for</h4>
• Does the code do what it's supposed to do, and handle edge cases (nulls, empty lists, errors)? <br>
• Is it readable - could someone else maintain this in six months? <br>
• Are there tests covering the new behavior? <br>
• Does it follow the team's coding standards and naming conventions? <br>
• Are there any obvious security or performance concerns?`
        },
        {
            content: `<h4>A simple example of review feedback</h4>
A reviewer might comment on a submitted method like this:`,
            codeExamples: [
                `// Submitted code
public User getUser(String id) {
    User user = userRepository.findById(id);
    return user.getName() != null ? user : null;
}
// Reviewer comment: "This will throw a NullPointerException if
// findById returns null - please check 'user == null' first,
// and add a test for the not-found case."`
            ]
        },
        {
            content: `<h4>Giving and receiving feedback well</h4>
• Comment on the code, not the person: "This loop could be simplified" instead of "You wrote a messy loop." <br>
• Explain the "why," not just the "what," so the author learns something. <br>
• As an author, don't take feedback personally - the goal is a better product, not a judgment of your skill.`
        }
    ],
    expert: [
        {
            content: `<h3>Why Code Review Matters at Scale</h3>
Studies (and long industry experience at companies like Google and Microsoft) consistently show code review catches
defects earlier and cheaper than QA or production incidents would, while also spreading knowledge of the codebase
across the team so no single person becomes a bottleneck or single point of failure ("bus factor"). Google's internal
engineering practices document treats review as mandatory for every change, regardless of author seniority.`
        },
        {
            content: `<h3>Review Workflow at Scale</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Author opens PR
        |
        v
  Automated checks run first   (CI: build, tests, lint, coverage, security scan)
        |
        v
  Automated checks pass?  --No--> Author fixes before requesting human time
        |
       Yes
        v
  Human reviewer(s) assigned   (CODEOWNERS routes to the right expert)
        |
        v
  Review comments  <----> Author responds / pushes fixes   (iterate)
        |
        v
  Approval  +  merge   (often squash-merged with a clean commit message)
</pre>
Running automated checks before requesting a human review is a deliberate ordering - it keeps reviewers focused on
things a machine cannot judge (design, intent, correctness of business logic) instead of re-flagging a missing
semicolon.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Rubber-stamping</strong> - approving without truly reading the diff, defeating the purpose entirely. <br>
• <strong>Reviewing only style</strong> - nitpicking formatting (which a linter should catch automatically) while
missing a real logic bug. <br>
• <strong>Giant PRs</strong> - a 2,000-line diff is nearly impossible to review carefully; smaller, focused PRs get
better scrutiny and faster turnaround. <br>
• <strong>Tone problems</strong> - overly harsh or nitpicky feedback discourages juniors from contributing and can
turn review into a source of team friction rather than growth. <br>
• <strong>Review latency</strong> - PRs left unreviewed for days block the author and encourage risky large batches;
many teams set an SLA (e.g. review within 24 hours).`
        },
        {
            content: `<h3>Review Depth by Change Type</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Change type</th><th>Typical review focus</th></tr>
<tr><td>Typo / doc fix</td><td>Light review, fast approve</td></tr>
<tr><td>Bug fix</td><td>Root cause understood? Regression test added?</td></tr>
<tr><td>New feature</td><td>Design fit, edge cases, test coverage, API shape</td></tr>
<tr><td>Security-sensitive (auth, payments)</td><td>Mandatory second/senior reviewer, extra scrutiny on input validation</td></tr>
<tr><td>Database migration</td><td>Backward compatibility, rollback plan, performance on large tables</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the main purpose of code review?</td><td>To catch defects, design issues, and knowledge gaps before code merges, while spreading codebase knowledge across the team.</td></tr>
<tr><td>Why should automated checks (CI, lint) run before human review?</td><td>So human reviewers spend time on design/logic/intent instead of issues a machine can already catch, like formatting or failing tests.</td></tr>
<tr><td>Why are large PRs discouraged?</td><td>They're harder to review thoroughly, increase the chance of missed bugs, and slow down turnaround - smaller focused PRs get better scrutiny.</td></tr>
<tr><td>What's the difference between "approve" and "request changes" in a PR review?</td><td>Approve signals the change is mergeable as-is; request changes blocks the merge until the author addresses specific required feedback.</td></tr>
<tr><td>How should feedback be phrased in a code review?</td><td>Focused on the code and its reasoning ("this could NPE if X"), not the author personally, and explaining why a change is suggested.</td></tr>
<tr><td>What is "rubber-stamping" and why is it a problem?</td><td>Approving a PR without genuinely reading the diff - it defeats the purpose of review and lets defects slip through.</td></tr>
<tr><td>What is a CODEOWNERS file used for?</td><td>To automatically route review requests for specific paths/modules to the engineers most qualified to review them.</td></tr>
<tr><td>Should code review only check style/formatting?</td><td>No - style should be enforced by automated linters/formatters; review should focus on correctness, design, tests, and edge cases.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Code review is one gate in a longer delivery pipeline, positioned deliberately after automation and before merge:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Local commit
        |
        v
  git push  --->  PR opened  --->  CI (build/test/lint/security scan)
                                          |
                                    pass? |  fail --> author fixes, no human time spent
                                          v
                                   CODEOWNERS routes to reviewer(s)
                                          |
                                          v
                                   Review comments <-> author iterates
                                          |
                                          v
                                   Approve  --->  Merge  --->  CD pipeline deploys
</pre>
If review sat before CI, reviewers would waste cycles catching things a machine catches for free; if it sat after
merge, defects would already be in production before a human ever looked at them - the ordering is not arbitrary.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A null-check bug ships to production despite "passing review"</td><td>Reviewer approved without actually reading the diff (rubber-stamping)</td><td>PR history shows approval seconds after the diff was opened - not enough time to have read 300 lines</td><td>Set a minimum review SLA/expectation and require reviewers to leave at least one substantive comment or explicit sign-off note on what they checked</td></tr>
<tr><td>PRs sit unreviewed for a week, so authors batch multiple unrelated changes into one giant PR to "make it worth the wait"</td><td>No review SLA, so authors compensate by increasing PR size, which then takes even longer to review</td><td>PR size and time-to-first-review both trending upward together over several sprints</td><td>Set and enforce a review SLA (e.g. within 24 hours); coach authors toward smaller, more frequent PRs</td></tr>
<tr><td>A junior developer stops opening PRs for feedback and starts avoiding the team entirely</td><td>Repeated harsh, personal-sounding review comments instead of constructive, code-focused feedback</td><td>Review comment history for that author skews toward blunt/critical tone compared to teammates' comments</td><td>Establish and model review tone norms (comment on code, explain the "why"); address the pattern directly with the reviewer</td></tr>
<tr><td>A critical auth bug reaches production even though the PR was "approved by two people"</td><td>Both reviewers focused only on style/formatting, missing an actual logic flaw in permission checks</td><td>Review comments are 100% about spacing/naming, zero about the changed authorization logic</td><td>Require security-sensitive changes to route through a reviewer with domain expertise, not just any two approvers</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Rubber-stamp approvals</strong> - clicking approve without genuinely reading the diff or reasoning about
edge cases. <br>
• <strong>Nitpick-only reviews</strong> - flagging every spacing/naming quibble while missing an actual logic bug in
the same diff. <br>
• <strong>Drive-by "LGTM" with no comments on a large, risky change</strong> - a security-sensitive or migration PR
deserves visible evidence the reviewer actually engaged with it. <br>
• <strong>Blocking on personal preference, not correctness</strong> - requesting changes over a subjective style
choice the linter doesn't even flag, rather than an objective issue. <br>
• <strong>Review as gatekeeping/ego</strong> - using review comments to assert authority rather than to genuinely
improve the change, which discourages future contributions.`
        }
    ]
};
