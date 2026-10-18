import { Topic } from '../coreJava';

export const deploymentStage: Topic = {
    id: 'deployment-stage',
    name: 'Deployment',
    beginner: [
        {
            content: `<h3>What is the Deployment Stage?</h3>
Deployment is the stage where the tested, built software is actually made available to real users -
moved from the developer's/tester's environment onto a live server that customers can access. <br><br>
Think of it like moving into a house after construction and inspection are done - deployment is the
"move-in day" for software. <br><br>
Example: Once a shopping app is fully tested, deployment puts it on the actual company servers so real
customers can open the app and start shopping.`
        },
        {
            content: `<h3>Different Environments</h3>
Software usually moves through multiple environments before reaching real users: <br>
• <strong>Development</strong> - where developers build and test locally. <br>
• <strong>QA/Staging</strong> - a copy of production used for final testing. <br>
• <strong>Production</strong> - the live environment real users actually use. <br><br>
Example: A new "dark mode" feature is first deployed to staging so the QA team can verify it, and only
after approval is it deployed to production for all users.`
        },
        {
            content: `<h3>Deployment Methods</h3>
• <strong>Manual Deployment</strong> - someone manually copies files/runs commands on the server. <br>
• <strong>Automated Deployment</strong> - a tool automatically deploys the app with one click or
automatically after tests pass (Continuous Deployment). <br><br>
Example: Instead of a developer manually uploading files via FTP, a pipeline automatically deploys the
new version to the server the moment code passes all tests.`
        },
        {
            content: `<h3>Rollback</h3>
If something goes wrong after deployment, teams need a way to quickly go back to the previous working
version. <br><br>
Example: After deploying a new payment feature, if customers suddenly can't complete payments, the team
quickly rolls back to yesterday's working version while they investigate the issue.`
        },
        {
            content: `<h3>Why This Stage Matters</h3>
Deployment is the moment the software actually starts delivering value to real users - all the previous
work (requirements, design, coding, testing) only matters once it's safely and reliably deployed. <br><br>
Example: A perfectly coded and tested feature is useless to the business until it's actually deployed and
customers can use it.`
        }
    ],
    expert: [
        {
            content: `<h3>What Actually Happens at This Stage in a Real Org</h3>
In mature teams, deployment is automated end-to-end through a Continuous Deployment (CD) pipeline. DevOps
engineers own the deployment infrastructure, while developers simply trigger (or automatically get)
deployments once their code passes all quality gates. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Build Artifact Ready --> Deploy to Staging --> Automated Smoke Tests
   --> Manual/Automated Approval Gate --> Deploy to Production
   --> Health Checks --> Traffic Gradually Shifted --> Monitoring Confirms Stability</pre>`
        },
        {
            content: `<h3>Deployment Strategies</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strategy</th><th>How it Works</th><th>Benefit</th></tr>
<tr><td>Blue-Green Deployment</td><td>Two identical environments; traffic switches from old (blue) to new (green) instantly</td><td>Near-zero downtime, instant rollback</td></tr>
<tr><td>Canary Release</td><td>New version rolled out to a small % of users first</td><td>Limits blast radius if something breaks</td></tr>
<tr><td>Rolling Deployment</td><td>Instances updated gradually, one batch at a time</td><td>No downtime, moderate rollback complexity</td></tr>
<tr><td>Recreate Deployment</td><td>Old version stopped completely, new version started</td><td>Simple but causes downtime</td></tr>
</table>`
        },
        {
            content: `<h3>Sample CD Pipeline Snippet</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6"># deploy stage of a pipeline (pseudo YAML)
deploy_production:
  needs: [build, test]
  when: manual approval granted
  steps:
    - kubectl set image deployment/myapp myapp=myapp:$&#123;&#123; version &#125;&#125;
    - kubectl rollout status deployment/myapp
    - run_smoke_tests.sh
    - if smoke_tests_fail: kubectl rollout undo deployment/myapp</pre>
Notice the automatic rollback step - if smoke tests fail right after deployment, the pipeline reverts
without waiting for a human to notice.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Impact</th></tr>
<tr><td>Deploying directly to production without staging validation</td><td>Untested edge cases break the live app for real users</td></tr>
<tr><td>No rollback plan</td><td>A bad deployment causes prolonged outages while the team scrambles to fix forward</td></tr>
<tr><td>Manual, undocumented deployment steps</td><td>"Bus factor" risk - only one person knows how to deploy, and mistakes are easy under pressure</td></tr>
<tr><td>Deploying during peak traffic hours</td><td>Any issue immediately affects the maximum number of users</td></tr>
<tr><td>Configuration drift between staging and production</td><td>"Works in staging, fails in production" due to environment differences</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between Continuous Delivery and Continuous Deployment?</td><td>Continuous Delivery means the app is always ready to deploy with a manual approval step; Continuous Deployment auto-deploys every change that passes tests, with no manual gate</td></tr>
<tr><td>What is a blue-green deployment?</td><td>Running two identical production environments and switching traffic from the old to the new one instantly, enabling near-zero downtime and instant rollback</td></tr>
<tr><td>What is a canary release?</td><td>Rolling out a new version to a small subset of users/servers first, to catch issues before a full rollout</td></tr>
<tr><td>Why use staging environments before production?</td><td>To validate the exact build in a production-like setting, catching environment-specific issues before real users are affected</td></tr>
<tr><td>What is a rollback and why is it important?</td><td>Reverting to the last known-good version quickly when a deployment causes issues, minimizing downtime/impact</td></tr>
<tr><td>What tools are commonly used for deployment automation?</td><td>Jenkins, GitHub Actions, GitLab CI, ArgoCD, Kubernetes, Ansible, Terraform</td></tr>
<tr><td>What is configuration drift?</td><td>When environments (staging vs production) gradually diverge in settings/versions, causing inconsistent behavior between them</td></tr>
<tr><td>What is a smoke test after deployment?</td><td>A quick automated check of critical functionality right after deployment to confirm the new version is healthy before it takes full traffic</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Deployment is where a build artifact meets real infrastructure. It sits between the artifact repository
and the running production environment, orchestrated by tools that manage traffic shifting, health checks,
and rollback - all without a human manually touching a server. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Artifact Repository --> CD Tool (ArgoCD/Jenkins/GitHub Actions)
   --> Orchestrator (Kubernetes/ECS) pulls image --> Deploy to Staging
   --> Automated smoke tests + approval gate
   --> Deploy to Production (blue-green / canary / rolling)
   --> Load Balancer shifts traffic --> Monitoring Stage watches health
   --> Auto-rollback triggered if error rate/latency SLO breached</pre>
Notice deployment hands off directly into monitoring - the health checks that gate a rollout are the same
signals the Monitoring stage watches continuously afterward.`
        },
        {
            content: `<h3>Production Problems Caused by This Stage</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Every deploy causes a visible outage for a few minutes</td><td>No blue-green/rolling deployment strategy - a hard "stop old, start new" cutover</td><td>Check the deployment config - it's a "recreate" strategy with no overlap between old and new instances</td><td>Switch to rolling or blue-green deployment so old instances keep serving traffic until new ones are healthy</td></tr>
<tr><td>A bad release stays live for 40 minutes before anyone notices</td><td>No automated health checks or rollback gate after deployment - only manual monitoring</td><td>Review the pipeline - there's no post-deploy smoke test or automated rollback condition</td><td>Add automated smoke tests and SLO-based auto-rollback immediately after each deployment</td></tr>
<tr><td>"It worked in staging" but fails immediately in production</td><td>Configuration drift - production has different environment variables/secrets/scaling settings than staging</td><td>Diff the staging vs production configuration (env vars, resource limits, feature flags)</td><td>Manage environment config as code (e.g. via a config management tool) so staging and production stay in sync except for intentional differences</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Manual, undocumented deployment steps</strong> known only to one person - a single point of failure ("bus factor" risk). <br>
• <strong>Deploying straight to production</strong> without ever validating in a staging environment first. <br>
• <strong>No automated rollback</strong> - relying on a human to notice and manually revert during an incident. <br>
• <strong>Deploying large batches infrequently</strong> instead of small, frequent, low-risk changes - each release becomes high-stakes and stressful. <br>
• <strong>Ignoring deployment timing</strong> - shipping risky changes right before weekends or peak traffic windows.`
        }
    ]
};
