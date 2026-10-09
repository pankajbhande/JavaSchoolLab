import { Topic } from '../coreJava';

export const devOpsOverview: Topic = {
    id: 'devops',
    name: 'DevOps',
    beginner: [
        {
            content: `<h3>What is DevOps?</h3>
DevOps is a culture and set of practices that bring <strong>Dev</strong>elopment and <strong>Op</strong>erations teams
together, so software can be built, tested, and released faster and more reliably - instead of developers "throwing code
over the wall" to a separate operations team that then struggles to deploy and run it. <br><br>

<strong>Real-world example:</strong> Without DevOps, a developer finishes a feature, hands it to an ops team weeks later,
who then discovers it doesn't run properly in production. With DevOps, the same team (or tightly collaborating teams)
writes the code, automates its testing, and automates its deployment - so a change can go from "written" to "live" in
hours, safely.`
        },
        {
            content: `<h3>The Old Way vs the DevOps Way</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Traditional (Siloed)</th><th>DevOps</th></tr>
<tr><td>Dev team writes code, "throws it over the wall"</td><td>Dev and Ops collaborate throughout the lifecycle</td></tr>
<tr><td>Manual deployment, often by a separate team, weeks after coding</td><td>Automated deployment pipelines, releases can happen daily</td></tr>
<tr><td>Testing happens late, mostly manually</td><td>Automated testing runs on every code change</td></tr>
<tr><td>"Not my problem" - blame between teams when something breaks</td><td>Shared ownership - "you build it, you run it"</td></tr>
</table>`
        },
        {
            content: `<h3>CI/CD - The Heart of DevOps</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Developer commits code
        |
        v
CI (Continuous Integration): automatically build + run tests on every commit
        |
        v
CD (Continuous Delivery/Deployment): automatically package and deploy to
        staging, and (with Deployment) all the way to production</pre>
<strong>Continuous Integration (CI)</strong> means every code change is automatically built and tested, catching
problems within minutes instead of weeks. <br>
<strong>Continuous Delivery/Deployment (CD)</strong> means that once code passes CI, it's automatically prepared (and,
with full deployment, released) for production, instead of manual, error-prone release steps.`
        },
        {
            content: `<h3>Simple Example: A DevOps Pipeline in Action</h3>
1. A developer pushes code changes to a shared repository (e.g. GitHub). <br>
2. This automatically triggers a build and runs the test suite (CI). <br>
3. If all tests pass, the code is automatically deployed to a staging environment. <br>
4. After a review or automatic checks, it's deployed to production (CD). <br>
5. Monitoring tools watch the live application and alert the team if something goes wrong. <br><br>
This entire flow can take minutes, compared to the weeks a manual release process might take.`
        }
    ],
    expert: [
        {
            content: `<h3>The DevOps Lifecycle (Infinity Loop)</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   Plan --> Code --> Build --> Test
    ^                              \\
    |                               v
  Monitor <-- Operate <-- Deploy <-- Release</pre>
DevOps is drawn as an infinite loop because it's continuous - there is no "final release"; monitoring feeds back into
planning the next change, forming a constant cycle of small, safe improvements.`
        },
        {
            content: `<h3>Key DevOps Practices and Tooling Categories</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Practice</th><th>Purpose</th><th>Example Tools (category)</th></tr>
<tr><td>Version Control</td><td>Track and collaborate on code changes</td><td>Git, GitHub/GitLab</td></tr>
<tr><td>CI/CD Pipelines</td><td>Automate build, test, and deployment</td><td>Jenkins, GitHub Actions, GitLab CI</td></tr>
<tr><td>Infrastructure as Code (IaC)</td><td>Manage servers/environments via versioned config, not manual setup</td><td>Terraform, Ansible</td></tr>
<tr><td>Containerization</td><td>Package an app with everything it needs to run consistently anywhere</td><td>Docker, Kubernetes</td></tr>
<tr><td>Monitoring & Logging</td><td>Detect issues in production quickly</td><td>Prometheus, Grafana, ELK stack</td></tr>
</table>`
        },
        {
            content: `<h3>DevOps Culture: "You Build It, You Run It"</h3>
Beyond tools, DevOps is fundamentally a culture shift. The famous phrase "you build it, you run it" (popularized by
Amazon) means the same engineers who wrote a service are also responsible for keeping it running well in production -
including being on-call for it. This creates strong incentives to write reliable, observable, well-tested code, because
the person who writes the bug is the person woken up at 2am to fix it. <br><br>

This connects directly back to Agile and Scrum/Kanban - DevOps extends the same feedback-loop philosophy (build small,
get fast feedback, improve continuously) all the way through deployment and operations, not just development.`
        },
        {
            content: `<h3>Common Pitfalls and Anti-Patterns</h3>
• <strong>"DevOps" as just a job title, not a culture change</strong> - hiring a "DevOps engineer" to do all the ops
work in isolation defeats the purpose; the goal is Dev and Ops collaborating, not a new silo. <br>
• <strong>Automating a broken process</strong> - if manual releases are unreliable, automating them just makes failures
happen faster; fix the process first. <br>
• <strong>No rollback strategy</strong> - fast deployment without an equally fast, reliable rollback plan turns small
mistakes into extended outages. <br>
• <strong>Skipping monitoring</strong> - deploying fast without visibility into production health means problems are
discovered by users, not by the team.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is DevOps?</td><td>A culture and set of practices that unify development and operations to enable faster, more reliable software delivery through automation and shared ownership</td></tr>
<tr><td>What is the difference between Continuous Integration and Continuous Deployment?</td><td>CI automatically builds and tests every code change; Continuous Deployment automatically ships code that passes those checks all the way to production without manual intervention</td></tr>
<tr><td>What is Continuous Delivery vs Continuous Deployment?</td><td>Continuous Delivery automatically prepares every change for release but requires a manual approval to actually deploy; Continuous Deployment removes that manual gate and deploys automatically</td></tr>
<tr><td>What is Infrastructure as Code?</td><td>Managing servers and environments through versioned configuration files instead of manual setup, making infrastructure repeatable and auditable</td></tr>
<tr><td>What does "you build it, you run it" mean?</td><td>The team that develops a service is also responsible for operating and being on-call for it, incentivizing reliable, well-tested, observable code</td></tr>
<tr><td>How does DevOps relate to Agile?</td><td>DevOps extends Agile's philosophy of fast feedback and small, frequent changes all the way through deployment and production operations, not just development</td></tr>
<tr><td>What's a common mistake companies make when "adopting DevOps"?</td><td>Treating it as just a new job title/team (a new silo) instead of a cultural shift toward Dev and Ops collaborating and sharing ownership</td></tr>
<tr><td>Why is a rollback strategy important in a DevOps pipeline?</td><td>Fast automated deployments increase release frequency, so a fast, reliable rollback is essential to limit the impact of a bad release before it becomes a prolonged outage</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: Commit to Production Pipeline</h3>
Here's what a real DevOps pipeline looks like end-to-end, with the concrete tooling category at each stage: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Developer commits (git push) --> feature branch
        |
        v
CI triggers (GitHub Actions/Jenkins): compile, unit tests, static analysis, security scan
        |
        v
Pull Request --> code review (1-2 approvals) --> merge to main
        |
        v
CD pipeline builds artifact --> Docker image --> pushed to registry
        |
        v
Deploy to Staging (Terraform/K8s manifest applied) --> automated smoke tests
        |
        v
Deploy to Production (canary 5% --> 50% --> 100%, or blue-green switch)
        |
        v
Monitoring/Alerting (Prometheus/Grafana, logs) --> feeds back into next Plan phase</pre>
Every arrow in this chain is automated in a mature DevOps org - a manual step anywhere in this chain is usually where
incidents originate.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A bad deploy takes down production for 2 hours before anyone notices</td><td>No automated monitoring/alerting tied to the deployment pipeline</td><td>Check the time gap between deployment and the first alert/human noticing the issue</td><td>Add automated health checks and alerting immediately after each deployment stage, with an automatic rollback trigger on failed checks</td></tr>
<tr><td>Deploying to production requires a specific engineer who "knows the manual steps"</td><td>Deployment was never fully automated - critical knowledge lives in one person's head/scripts</td><td>Check whether the deployment process is documented as code (pipeline config) or as tribal knowledge</td><td>Codify the entire deployment process in a versioned CI/CD pipeline definition so anyone on the team can trigger it safely</td></tr>
<tr><td>A release that passed all tests still breaks in production</td><td>Staging environment doesn't mirror production configuration/scale/data closely enough</td><td>Compare staging's config (DB size, external service mocks, resource limits) against production's</td><td>Invest in making staging as close to production as feasible, and use canary releases to limit blast radius for what staging can't catch</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>"DevOps team" as a new silo</strong> - hiring a separate team to own all pipelines/ops work in isolation,
recreating the exact Dev-vs-Ops wall DevOps was meant to remove. <br>
• <strong>Automating a broken manual process</strong> - scripting a fragile, undocumented release process instead of
first fixing the process, so failures just happen faster and are harder to trace. <br>
• <strong>Deploying fast with no rollback plan</strong> - high deployment frequency without an equally fast, tested
rollback path turns small bugs into extended outages. <br>
• <strong>Monitoring only infrastructure, not the application</strong> - watching CPU/memory but not business
metrics (error rates, checkout success rate), so real user-facing problems go unnoticed. <br>
• <strong>Skipping security scanning in CI</strong> - treating CI as "just run unit tests," missing dependency
vulnerabilities and secrets accidentally committed to the repo.`
        }
    ]
};
