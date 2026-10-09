import { Topic } from '../coreJava';

export const branchingStrategies: Topic = {
    id: 'branching-strategies',
    name: 'Branching Strategies',
    beginner: [
        {
            content: `<h3>What is a Branching Strategy?</h3>
A branching strategy is a team's agreed-upon set of rules for how and when to create branches, when to merge them,
and what the main branch is allowed to contain at any moment. Without an agreed strategy, different developers make
different assumptions and step on each other's work. <br><br>
Real-world analogy: it's like traffic rules at an intersection - branches are lanes, and the strategy is the set of
rules for who goes when, so cars (code changes) don't collide.`
        },
        {
            content: `<h4>Why not just all work on one branch?</h4>
If everyone commits directly to <code>main</code>, one developer's half-finished, broken feature can block or break
everyone else's work, and there's no safe point to roll back to. Branches let each person work in isolation until
their change is ready, reviewed, and tested.`
        },
        {
            content: `<h4>Basic feature branch workflow</h4>
The simplest and most common pattern: create a short-lived branch off main for each unit of work.`,
            codeExamples: [
                `# Start a new feature branch from the latest main
git checkout main
git pull origin main
git checkout -b feature/JIRA-123-add-password-reset

# ... make commits ...

# Keep it up to date with main as you work
git fetch origin
git merge origin/main

# When done: push and open a Pull Request to merge back into main
git push origin feature/JIRA-123-add-password-reset`
            ]
        },
        {
            content: `<h4>Common branch naming conventions</h4>
Consistent naming makes it obvious what a branch is for and which ticket it relates to: <br>
• <code>feature/short-description</code> - new functionality <br>
• <code>bugfix/short-description</code> - a fix for a defect <br>
• <code>hotfix/short-description</code> - an urgent production fix <br>
• Many teams prefix with a ticket ID: <code>feature/JIRA-123-add-password-reset</code>`
        },
        {
            content: `<h4>Keep branches short-lived</h4>
The longer a branch lives without merging, the more it diverges from main, and the more painful the eventual merge
conflict becomes. Beginners should aim to merge a feature branch within a few days, not weeks.`
        }
    ],
    expert: [
        {
            content: `<h3>Comparing Branching Models</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strategy</th><th>Structure</th><th>Best fit</th></tr>
<tr><td>GitHub Flow</td><td>main is always deployable; short feature branches merge directly into main via PR</td><td>Teams deploying continuously (SaaS, web apps)</td></tr>
<tr><td>Git Flow</td><td>develop, main, feature/*, release/*, hotfix/* - separate long-lived integration branch</td><td>Products with scheduled releases / versioned software</td></tr>
<tr><td>Trunk-Based Development</td><td>Everyone commits small, frequent changes directly (or via very short-lived branches) to trunk/main</td><td>High-velocity teams with strong CI and feature flags</td></tr>
<tr><td>GitLab Flow</td><td>GitHub Flow + environment branches (staging, production) or release branches</td><td>Teams needing explicit staged deployments</td></tr>
</table>`
        },
        {
            content: `<h3>Git Flow, Visualized</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
main      *-------------------*-----------*----->   (production releases only)
           \\                 / \\         /
release           2.0------>*   \\  2.1-->*
                                  \\      /
develop   *---*---*---*---*---*---*----*---------->
           \\     /   \\     /
feature      login      checkout

hotfix                       *-->*  (branches off main, merges to BOTH main & develop)
</pre>
Git Flow's strength (clear separation of in-progress vs release-ready code) is also its cost: develop and main can
drift significantly, merges are large and infrequent, and it adds ceremony many fast-moving web teams don't need -
this is why GitHub Flow and trunk-based development have become more popular for continuously-deployed software.`
        },
        {
            content: `<h3>Trunk-Based Development and Feature Flags</h3>
Trunk-based development pushes for merging small changes into main multiple times a day, even for incomplete
features - made safe by hiding unfinished work behind a feature flag rather than an unmerged branch.`,
            codeExamples: [
                `public void checkout(Order order) {
    if (featureFlags.isEnabled("new-checkout-flow")) {
        newCheckoutService.process(order);   // in progress, safe to merge early
    } else {
        legacyCheckoutService.process(order); // existing, stable behavior
    }
}
// The flag lets the team merge incomplete work into main continuously,
// avoiding a long-lived branch that drifts and causes a painful merge later.`
            ]
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Long-lived feature branches</strong> - the longer a branch diverges from main, the worse the eventual merge
conflict; this is the core motivation behind trunk-based development. <br>
• <strong>No clear "source of truth" branch</strong> - if it's unclear whether <code>main</code> or <code>develop</code>
represents production, deploys become error-prone. <br>
• <strong>Overusing Git Flow for a simple SaaS product</strong> - the extra ceremony (develop, release branches) adds
overhead with little benefit if you deploy continuously rather than shipping discrete versioned releases. <br>
• <strong>Hotfixes bypassing normal review</strong> - urgent production fixes still need review; skipping it to save
minutes has caused real, high-profile outages.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What's the core difference between Git Flow and GitHub Flow?</td><td>Git Flow uses long-lived develop/release/hotfix branches for scheduled, versioned releases; GitHub Flow keeps main always-deployable with short feature branches merged directly via PR, suited to continuous deployment.</td></tr>
<tr><td>What is trunk-based development and what does it require to be safe?</td><td>Merging small changes directly (or via very short-lived branches) into main frequently; it requires strong CI/test coverage and often feature flags to hide incomplete work.</td></tr>
<tr><td>What problem do feature flags solve in a trunk-based workflow?</td><td>They let incomplete features merge into main safely (hidden from users) instead of living on a long-lived branch that risks painful merge conflicts.</td></tr>
<tr><td>Why do long-lived feature branches become risky?</td><td>They diverge further from main the longer they live, making the eventual merge larger and more conflict-prone.</td></tr>
<tr><td>In Git Flow, where does a hotfix branch off from and merge back into?</td><td>It branches off main (production) and merges back into both main and develop, so the fix isn't lost in the next release.</td></tr>
<tr><td>When would you choose Git Flow over GitHub Flow?</td><td>When shipping discrete, versioned releases (e.g. desktop software, libraries with semantic versions) rather than deploying continuously.</td></tr>
<tr><td>What's a common branch naming convention and why does it matter?</td><td>Prefixing with type and ticket ID, e.g. feature/JIRA-123-description - it makes a branch's purpose and tracking ticket obvious at a glance.</td></tr>
<tr><td>Why should hotfixes still go through code review despite urgency?</td><td>Skipping review under time pressure increases the risk of introducing a second bug while fixing the first - reviewed fixes are more reliable even when done quickly.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
A GitHub Flow-style pipeline, the most common shape for continuously-deployed teams, ties branching directly to
deployment automation:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  main  (always deployable)
   |
   +--> feature/JIRA-123-add-password-reset   (short-lived, days not weeks)
   |         |
   |         v
   |    Pull Request  --->  CI (build/test/lint)  --->  Code review
   |         |
   |         v
   +<---  Merge to main (squash-merged, clean single commit)
   |
   v
  CD pipeline deploys main automatically  --->  git tag v2.3.0 marks the release
</pre>
The strategy choice (GitHub Flow vs Git Flow vs trunk-based) is really a decision about how tightly branching couples
to your deployment cadence - continuous deployment wants short branches merging straight to a deployable main; scheduled,
versioned releases can tolerate the extra develop/release-branch ceremony of Git Flow.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Merging a feature branch takes an entire day and resolves dozens of conflicts</td><td>The branch lived for three weeks and diverged heavily from main while other work merged</td><td>git log shows main has 50+ commits since the feature branch was created</td><td>Adopt shorter-lived branches; rebase/merge from main frequently while developing, not just at the end</td></tr>
<tr><td>A deploy ships half-finished functionality visible to real users</td><td>An incomplete feature was merged to main without a feature flag under a trunk-based workflow</td><td>The merged code has no conditional gating; it's live for 100% of users the moment it deploys</td><td>Wrap incomplete functionality behind a feature flag before merging, so trunk-based merging stays safe</td></tr>
<tr><td>Nobody can tell whether "develop" or "main" reflects what's actually running in production</td><td>No clearly documented source-of-truth branch under a Git Flow-style setup</td><td>Recent incidents show deploys pulled from inconsistent branches by different engineers</td><td>Document and enforce a single deploy source branch; consider simplifying to GitHub Flow if releases aren't versioned</td></tr>
<tr><td>An urgent production fix introduces a second, worse bug within the hour</td><td>The hotfix branch bypassed normal code review due to time pressure</td><td>The hotfix commit has no associated PR review/approval in history</td><td>Keep a lightweight but mandatory review step even for hotfixes - a second set of eyes, even for 5 minutes</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Long-lived feature branches</strong> - the longer a branch diverges from main, the more painful the
eventual merge becomes. <br>
• <strong>Merging incomplete work into trunk without a feature flag</strong> - exposes half-built functionality to
real users. <br>
• <strong>No agreed source-of-truth branch</strong> - ambiguity about which branch represents "what's actually in
production" leads to bad deploys. <br>
• <strong>Overusing Git Flow ceremony for a simple, continuously-deployed product</strong> - extra develop/release
branches add overhead with no matching benefit. <br>
• <strong>Skipping review on hotfixes "because it's urgent"</strong> - time pressure is exactly when a second pair of
eyes matters most, not least.`
        }
    ]
};
