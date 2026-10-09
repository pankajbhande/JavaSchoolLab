import { Topic } from '../coreJava';

export const releaseManagement: Topic = {
    id: 'release-management',
    name: 'Release Management',
    beginner: [
        {
            content: `<h3>What is Release Management?</h3>
Release management is the process of planning, scheduling, testing, and controlling how new software gets delivered
to users. It answers questions like: what's going into this release, when does it go out, and how do we roll it back
if something goes wrong? <br><br>
Real-world analogy: it's like a movie's release schedule - the film is finished, but there's still a process around
when it opens, in which theaters, with what marketing, and a plan if the premiere goes badly.`
        },
        {
            content: `<h4>Versioning: Semantic Versioning (SemVer)</h4>
Most software communicates what changed through a version number in the form <code>MAJOR.MINOR.PATCH</code>: <br>
• <strong>MAJOR</strong> - breaking changes (e.g. 1.x.x -> 2.0.0) <br>
• <strong>MINOR</strong> - new backward-compatible functionality (e.g. 2.0.0 -> 2.1.0) <br>
• <strong>PATCH</strong> - backward-compatible bug fixes (e.g. 2.1.0 -> 2.1.1) <br>
This lets consumers of a library instantly judge risk: upgrading a patch version is usually safe; upgrading a major
version needs testing.`
        },
        {
            content: `<h4>A simple release checklist</h4>
Even a small team benefits from a repeatable checklist rather than relying on memory:`,
            codeExamples: [
                `Release Checklist - v2.3.0
[ ] All planned PRs merged to main
[ ] Full test suite passing on main
[ ] Changelog updated (what's new, what's fixed)
[ ] Version bumped (2.2.4 -> 2.3.0) and tagged in git
[ ] Deployed to staging and smoke-tested
[ ] Deployed to production
[ ] Rollback plan confirmed and documented
[ ] Team notified release is live`
            ]
        },
        {
            content: `<h4>Tagging a release in Git</h4>
Git tags mark the exact commit that corresponds to a released version, so it can always be found again later.`,
            codeExamples: [
                `# Create an annotated tag for a release
git tag -a v2.3.0 -m "Release 2.3.0: add password reset, fix checkout bug"
git push origin v2.3.0

# Later, check out exactly what was released as v2.3.0
git checkout v2.3.0`
            ]
        },
        {
            content: `<h4>Why a rollback plan matters</h4>
Even with careful testing, some issues only appear in production. Having a rehearsed way to revert to the previous
known-good version quickly turns a potential multi-hour outage into a five-minute blip.`
        }
    ],
    expert: [
        {
            content: `<h3>Release Strategies Beyond "Deploy and Hope"</h3>
Mature teams reduce release risk by controlling how much of the traffic/users see a new version at once, rather than
flipping a single switch for everyone simultaneously:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strategy</th><th>How it works</th></tr>
<tr><td>Blue-Green Deployment</td><td>Two identical environments; traffic switches instantly from old (blue) to new (green); instant rollback by switching back</td></tr>
<tr><td>Canary Release</td><td>New version rolled out to a small % of users/servers first; expanded gradually if metrics stay healthy</td></tr>
<tr><td>Rolling Deployment</td><td>Instances updated a few at a time, so the whole fleet is never fully old or fully new at once</td></tr>
<tr><td>Feature Flags</td><td>Code is deployed but the new behavior stays off until explicitly toggled on, decoupling deploy from release</td></tr>
</table>`
        },
        {
            content: `<h3>The Deploy vs Release Distinction</h3>
A key mental model in modern release management: <strong>deploying</strong> code (putting it on servers) and
<strong>releasing</strong> a feature (making it visible/active to users) don't have to be the same moment. Feature
flags decouple them entirely - code can sit deployed but dormant, then be released to users with a config change
instead of a new deploy, which is faster and safer to roll back.
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
Old model:  Deploy == Release  (one risky event does both)

New model:  Deploy (code ships, flag OFF, zero user impact)
                |
                v
            Release (flag flipped ON for 1% -> 10% -> 100% of users)
                |
                v
            Instant rollback = flip flag OFF (no redeploy needed)
</pre>`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Big-bang releases</strong> - bundling months of changes into one giant release makes it nearly impossible
to isolate which change caused a production issue. Smaller, frequent releases are easier to debug and roll back. <br>
• <strong>No rollback plan</strong> - discovering during an incident that rollback was never tested wastes critical
minutes/hours. <br>
• <strong>Skipping the changelog</strong> - without a record of what changed, on-call engineers can't quickly rule out
recent changes as the cause of an incident (see Root Cause Analysis). <br>
• <strong>Releasing on a Friday afternoon</strong> - a well-known anti-pattern; if something breaks, the team has
minimal staffing/attention over the weekend to respond.`
        },
        {
            content: `<h3>Release Cadence Models</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Cadence</th><th>Typical context</th></tr>
<tr><td>Continuous Deployment</td><td>Every merged commit that passes CI deploys automatically - common for SaaS with strong test coverage</td></tr>
<tr><td>Scheduled release train</td><td>Releases happen on a fixed cadence (e.g. every 2 weeks); whatever's ready gets in, else waits for the next train</td></tr>
<tr><td>Milestone-based</td><td>Release when a specific feature set is complete - common for versioned products/libraries</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What do the three numbers in Semantic Versioning (MAJOR.MINOR.PATCH) mean?</td><td>MAJOR = breaking changes, MINOR = new backward-compatible features, PATCH = backward-compatible bug fixes.</td></tr>
<tr><td>What is the difference between "deploying" and "releasing" a feature?</td><td>Deploying puts code on servers; releasing makes it active/visible to users - feature flags let these happen at different times, decoupling risk.</td></tr>
<tr><td>What is a canary release?</td><td>Rolling out a new version to a small percentage of users/servers first, expanding gradually only if health metrics stay good.</td></tr>
<tr><td>How does blue-green deployment enable fast rollback?</td><td>Two full environments run in parallel; rollback is just switching traffic back to the untouched old environment, avoiding a slow redeploy.</td></tr>
<tr><td>Why are big-bang releases risky?</td><td>Bundling many changes into one release makes it hard to isolate which specific change caused a production issue if something breaks.</td></tr>
<tr><td>Why is "deploying on a Friday afternoon" considered an anti-pattern?</td><td>If an issue surfaces, the team has reduced staffing/attention over the weekend to respond, extending time-to-resolution.</td></tr>
<tr><td>What is the purpose of a git tag in the release process?</td><td>It marks the exact commit corresponding to a released version, so that exact state can be reproduced or inspected later.</td></tr>
<tr><td>What's the benefit of a rolling deployment over an all-at-once deployment?</td><td>Only a subset of instances run the new version at a time, limiting blast radius if the new version has a problem, and avoiding full-fleet downtime.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
A real release pipeline controls blast radius by widening exposure in stages, with automated checks and rollback
built into each stage:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Merge to main  --->  CI builds artifact, tags version (v2.3.0)
        |
        v
  Deploy to STAGING   (smoke tests, internal traffic only)
        |
        v
  Deploy to PRODUCTION, flag OFF   (code live, zero user impact)
        |
        v
  CANARY: enable for 1% of traffic  --->  watch error rate / latency dashboards
        |                                        |
        |                                  metrics bad? --> auto-rollback, flag OFF
        v
  Expand: 10% --> 50% --> 100%  (each step gated on healthy metrics)
        |
        v
  Full rollout complete  --->  changelog published, team notified
</pre>
Each stage exists specifically to shrink the number of real users affected before a problem is caught - a canary
step that finds a bug at 1% traffic prevents the same bug from ever reaching the other 99%.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A bug affects 100% of users within minutes of a release</td><td>The release went straight to full production traffic with no canary/gradual rollout stage</td><td>Deployment logs show a single all-at-once cutover rather than a staged percentage rollout</td><td>Adopt canary or rolling deployment so a bad release is caught at 1-10% traffic before reaching everyone</td></tr>
<tr><td>On-call can't quickly rule out "was this the deploy?" during an incident</td><td>No changelog or release notes were published for the most recent release</td><td>The last several releases have empty or missing changelog entries in the release tracker</td><td>Make changelog updates a mandatory release checklist item, generated from PR titles if needed</td></tr>
<tr><td>A rollback that should take 5 minutes takes 3 hours during an active incident</td><td>Rollback was never tested/rehearsed; the documented process is outdated or doesn't exist</td><td>Post-incident review shows the team improvising rollback steps in real time instead of following a known runbook</td><td>Rehearse rollback procedures regularly (game days) and keep the rollback runbook current with the deploy tooling</td></tr>
<tr><td>An incident happens Friday evening and stays unresolved all weekend</td><td>A release was deployed Friday afternoon with minimal staffing available to respond if it broke</td><td>Incident start time correlates with a deploy just before the weekend</td><td>Avoid releasing late Friday for anything non-trivial; if unavoidable, ensure on-call coverage is explicitly confirmed</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Big-bang releases</strong> - bundling months of changes into one release makes it nearly impossible to
isolate which change caused an issue. <br>
• <strong>No rollback plan, or one that's never been tested</strong> - discovering this mid-incident wastes critical
time. <br>
• <strong>Skipping the changelog</strong> - leaves on-call engineers unable to quickly rule recent changes in or out
during an incident. <br>
• <strong>Releasing Friday afternoon</strong> - minimal staffing/attention available over the weekend if something
breaks. <br>
• <strong>Treating deploy and release as the same event</strong> - forces every rollback to be a full redeploy instead
of a fast flag flip.`
        }
    ]
};
