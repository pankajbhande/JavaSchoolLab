import { Topic } from '../coreJava';

export const developmentVsProduction: Topic = {
    id: 'dev-vs-prod',
    name: 'Development vs Production',
    beginner: [
        {
            content: `<h3>What is a Development Environment?</h3>
The development ("dev") environment is where engineers write and test code before it's ready for real users - a safe
sandbox where mistakes are cheap and expected. <br><br>

<strong>Real-world example:</strong> A developer building a new "wishlist" feature for a shopping app first builds and
tests it on their own laptop or a shared dev server, using fake/sample data, without any risk to real customers.`
        },
        {
            content: `<h3>What is a Production Environment?</h3>
The production ("prod") environment is the live system that real users/customers actually use. Mistakes here directly
affect real people - lost orders, exposed data, downtime that costs the business money and trust. <br><br>

<strong>Real-world example:</strong> Once the wishlist feature is tested and approved, it's deployed to production -
the live shopping app that millions of real customers use every day.`
        },
        {
            content: `<h3>Why Not Just Test Directly on Production?</h3>
Testing directly on production is risky because: <br>
• Bugs would be discovered by real customers, not by the team - damaging trust and possibly losing revenue. <br>
• Real customer data could be corrupted or exposed by a buggy test. <br>
• There's no safety net - a mistake affects everyone immediately, everywhere. <br><br>
This is exactly why separate environments exist: to catch problems <strong>before</strong> real users ever see them.`
        },
        {
            content: `<h3>A Simple Environment Pipeline</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Development  -->  Testing/QA  -->  Staging  -->  Production
 (developer's         (QA team          (mirrors prod       (real users,
  own sandbox)          verifies          closely, final       live traffic)
                         features)         check)</pre>
Code moves left to right, getting progressively closer to "real" conditions, with a check/gate at each stage before it
moves to the next.`
        }
    ],
    expert: [
        {
            content: `<h3>The Full Environment Ladder in Real Companies</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Environment</th><th>Purpose</th><th>Data Used</th><th>Who Uses It</th></tr>
<tr><td>Local / Dev</td><td>Individual developer's own machine or personal dev server</td><td>Fake/seed/mock data</td><td>Developers only</td></tr>
<tr><td>Integration / QA</td><td>Verify features work together, run automated + manual tests</td><td>Synthetic test data, sometimes anonymized copies of real data</td><td>QA engineers, sometimes developers</td></tr>
<tr><td>Staging / UAT</td><td>Final rehearsal - mirrors production configuration as closely as possible</td><td>Production-like data (often anonymized)</td><td>QA, Product Owner, sometimes select real users (User Acceptance Testing)</td></tr>
<tr><td>Production</td><td>The live system serving real users</td><td>Real customer data</td><td>End users; engineers monitor/support it</td></tr>
</table>`
        },
        {
            content: `<h3>Configuration Differences Between Environments</h3>
The same code often behaves differently across environments because of environment-specific configuration:<br>
• <strong>Database</strong> - dev uses a small local/test DB; production uses the real, much larger, highly available DB. <br>
• <strong>External services</strong> - dev/staging often use "sandbox" versions of payment gateways, SMS providers, etc.,
so no real money moves or real messages are sent during testing. <br>
• <strong>Scale</strong> - production must handle real traffic volumes; dev/staging rarely does, which is why
performance issues sometimes only appear in production. <br>
• <strong>Secrets/credentials</strong> - production credentials (API keys, DB passwords) are kept far more tightly
locked down than dev/staging ones.<br><br>

This is why the classic bug category "works in dev, breaks in prod" exists - configuration, scale, and data differences
between environments can expose issues that never show up locally.`
        },
        {
            content: `<h3>Safe Release Techniques for Production</h3>
Because production mistakes are costly, mature engineering orgs use controlled rollout techniques instead of releasing
a change to 100% of users at once: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Technique</th><th>Idea</th></tr>
<tr><td>Feature Flags</td><td>Ship the code but keep the feature "off" for most users; turn it on gradually or for specific users</td></tr>
<tr><td>Canary Release</td><td>Roll the new version out to a small % of production traffic first, watch for errors, then expand</td></tr>
<tr><td>Blue-Green Deployment</td><td>Run two identical production environments; switch traffic from the old ("blue") to the new ("green") instantly, with instant rollback if needed</td></tr>
<tr><td>Rollback</td><td>Quickly revert to the previous known-good version if a release causes problems</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>"Works on my machine"</strong> - relying only on the dev environment and skipping staging/QA, so
environment-specific bugs reach production. <br>
• <strong>Testing with production credentials in staging</strong> - a serious security/data risk; test environments
should never hold real production secrets or unmasked customer data. <br>
• <strong>No staging environment at all</strong> - going straight from dev to production leaves no realistic final
check before real users are affected. <br>
• <strong>Manually deploying to production</strong> - manual, undocumented steps are error-prone; this is exactly what
CI/CD pipelines (see the DevOps topic) exist to automate and make reliable.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What's the difference between development and production environments?</td><td>Development is a sandbox for building/testing code with fake data and no risk to real users; production is the live system real customers use, where mistakes have real impact</td></tr>
<tr><td>Why do companies use multiple environments instead of testing directly in production?</td><td>To catch bugs before real users see them, avoid corrupting/exposing real customer data, and have a safety net before changes affect everyone</td></tr>
<tr><td>What environments typically exist between dev and production?</td><td>QA/Integration and Staging/UAT, each progressively closer to real production conditions</td></tr>
<tr><td>What is a "works in dev, breaks in prod" bug usually caused by?</td><td>Configuration, scale, or data differences between environments - e.g. production traffic volume or database size exposing issues that never appear locally</td></tr>
<tr><td>What is a canary release?</td><td>Rolling a new version out to a small percentage of production traffic first, monitoring for errors, then gradually expanding if it's healthy</td></tr>
<tr><td>What is a feature flag, and why is it useful?</td><td>A toggle that lets a team ship code to production while keeping a feature turned off for most/all users, enabling gradual or targeted rollout without a new deployment</td></tr>
<tr><td>Why shouldn't test/staging environments use real production credentials or unmasked customer data?</td><td>It's a major security and privacy risk - test environments are usually less locked-down, so a leak there can expose real customer data or production systems</td></tr>
<tr><td>How would you safely roll out a risky change to production?</td><td>Use a feature flag or canary release to limit blast radius, monitor closely after deployment, and have a fast rollback plan ready in case of issues</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: Config and Secrets Across Environments</h3>
A real Spring Boot / full-stack app doesn't have separate codebases per environment - it has separate
<strong>configuration</strong> layered on top of the same code, resolved at startup or deploy time: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Same application.jar / same Docker image
        |
        +--> application-dev.yml     --> local DB, sandbox payment gateway, verbose logging
        |
        +--> application-staging.yml --> staging DB (prod-like), sandbox payment gateway, INFO logging
        |
        +--> application-prod.yml    --> production DB (HA cluster), live payment gateway, WARN logging
                                          + secrets pulled from a vault (never committed to git)</pre>
This is why "works in dev, breaks in prod" so often isn't a code bug at all - it's a config/environment mismatch,
which is exactly what environment-specific config files and secret managers exist to isolate safely.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Feature works perfectly in staging but corrupts real orders in production</td><td>Staging used a small, clean dataset that never exercised real-world edge cases (nulls, duplicates, scale)</td><td>Compare data volume/shape in staging vs production for the affected table</td><td>Use anonymized production-scale data in staging, or add targeted edge-case test data that mirrors real production patterns</td></tr>
<tr><td>A payment integration silently charges test customers real money</td><td>Production API keys were mistakenly used in a staging/test environment</td><td>Check which credentials the failing environment's config actually points to</td><td>Strictly separate credential sets per environment via a secrets manager, and add automated checks that fail startup if prod credentials are detected outside prod</td></tr>
<tr><td>A new release causes a full outage with no fast way to recover</td><td>Deployment was a direct in-place update with no rollback mechanism or blue-green setup</td><td>Check how long it took to restore service and whether a rollback command even existed</td><td>Adopt blue-green deployment or keep the previous artifact version one command away from re-deployment</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>No staging environment at all</strong> - deploying straight from a developer's laptop to production
with nothing in between to catch environment-specific issues. <br>
• <strong>Sharing one database across dev, staging, and prod</strong> - a test run in "dev" can accidentally
corrupt real or staging data because there's no real isolation. <br>
• <strong>Hardcoding environment values in application code</strong> - baking a database URL or API key
directly into source instead of externalizing it via environment-specific config, making promotion between
environments error-prone and risky. <br>
• <strong>Manual, undocumented production deploys</strong> - "SSH in and run this script" deployments that are
error-prone, unrepeatable, and impossible to audit. <br>
• <strong>Turning feature flags on in production and forgetting to clean them up</strong> - accumulating stale
flags until nobody remembers which ones are safe to remove, creating hidden complexity and risk.`
        }
    ]
};
