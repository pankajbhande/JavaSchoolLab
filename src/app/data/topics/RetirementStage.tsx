import { Topic } from '../coreJava';

export const retirementStage: Topic = {
    id: 'retirement-stage',
    name: 'Retirement',
    beginner: [
        {
            content: `<h3>What is the Retirement Stage?</h3>
Retirement (also called "sunset" or "end-of-life") is the final stage where a software system is
officially shut down and replaced, because it is outdated, too costly to maintain, or no longer needed. <br><br>
Think of it like retiring an old car once repairs cost more than it's worth - at some point, the software
also reaches a point where it makes more sense to stop using it than to keep fixing it. <br><br>
Example: A company retires its old billing system once a modern replacement system is ready and all
data has been safely moved over.`
        },
        {
            content: `<h3>Why Software Gets Retired</h3>
• It has been replaced by a newer, better system. <br>
• It has become too expensive or difficult to maintain (old technology, no one understands the code
anymore). <br>
• The business no longer needs that functionality. <br>
• The technology it depends on is no longer supported (e.g. an old programming language/platform). <br><br>
Example: A company retires an old desktop application once all its customers have moved to the new
mobile app version.`
        },
        {
            content: `<h3>Data Migration</h3>
Before shutting a system down, any important data it holds usually needs to be moved to the new system
or archived safely, so nothing important is lost. <br><br>
Example: Before retiring an old customer database, the team carefully copies (migrates) all customer
records into the new system and double-checks nothing is missing.`
        },
        {
            content: `<h3>Informing Users</h3>
Users of the software need advance notice before it's shut down, so they aren't caught off guard and can
switch to the replacement in time. <br><br>
Example: A bank sends emails to customers months in advance saying "Our old mobile app will stop working
on March 1st - please download the new app before then."`
        },
        {
            content: `<h3>Why This Stage Matters</h3>
A poorly planned retirement can lose important data or leave users stranded without a working system.
A well-planned retirement makes sure the transition to whatever comes next is smooth and safe. <br><br>
Example: If a company shuts down an old system without properly migrating data first, years of important
customer records could be permanently lost.`
        }
    ],
    expert: [
        {
            content: `<h3>What Actually Happens at This Stage in a Real Org</h3>
Retirement (decommissioning) is a formally planned project of its own, usually owned jointly by
engineering, product, and compliance/legal teams - especially when regulated data is involved. It is
rarely a simple "turn off the server" action. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Decision to retire (cost/business case)
   --> Stakeholder sign-off --> Data migration/archival plan
   --> User communication & migration window --> Parallel run (old + new side by side)
   --> Cutover to new system --> Decommission infrastructure
   --> Post-retirement data retention per compliance policy</pre>`
        },
        {
            content: `<h3>Key Concerns During Decommissioning</h3>
• <strong>Data retention & compliance</strong> - regulations (e.g. financial, healthcare data laws) often
require data to be retained for a fixed number of years even after a system is shut down. <br>
• <strong>Data migration integrity</strong> - verifying every record transferred correctly, with
reconciliation reports comparing old vs new system counts. <br>
• <strong>Dependency mapping</strong> - other internal systems may quietly depend on the system being
retired (e.g. via an API or shared database) - these must be found and rerouted first. <br>
• <strong>Licensing/infrastructure cost recovery</strong> - actually cancelling servers, licenses, and
subscriptions tied to the old system to realize the cost savings that justified retirement.`
        },
        {
            content: `<h3>Common Retirement Strategies</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strategy</th><th>Description</th></tr>
<tr><td>Big-bang cutover</td><td>Old system switched off and new system switched on at one fixed point in time</td></tr>
<tr><td>Parallel run</td><td>Old and new systems run simultaneously for a period, results compared, before fully switching</td></tr>
<tr><td>Phased/incremental retirement</td><td>Users/modules migrated in batches over time rather than all at once</td></tr>
<tr><td>Strangler pattern</td><td>New system gradually takes over pieces of functionality until the old system has nothing left to do</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Impact</th></tr>
<tr><td>Retiring a system without checking hidden dependencies</td><td>Other systems silently break when an undocumented integration suddenly stops working</td></tr>
<tr><td>No data archival plan</td><td>Historical data needed for audits/legal reasons is permanently lost</td></tr>
<tr><td>Insufficient user notice period</td><td>Users are caught off guard, causing support overload and reputational damage</td></tr>
<tr><td>No rollback plan during cutover</td><td>If the new system has critical issues, there's no safe way back to the old one</td></tr>
<tr><td>Forgetting to actually cancel infrastructure/licenses</td><td>Company keeps paying for servers/services nobody uses anymore</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is software retirement/decommissioning?</td><td>The formal process of shutting down a system that is outdated, replaced, or no longer needed, including data migration and infrastructure cleanup</td></tr>
<tr><td>What is a parallel run during system retirement?</td><td>Running the old and new systems simultaneously for a period to compare outputs and build confidence before fully cutting over</td></tr>
<tr><td>What is the Strangler Fig pattern?</td><td>Gradually replacing pieces of a legacy system with a new one until the old system has no responsibilities left and can be safely removed</td></tr>
<tr><td>Why is data retention important even after a system is retired?</td><td>Legal/regulatory compliance often requires historical data to be kept for a defined period, regardless of whether the originating system is still running</td></tr>
<tr><td>What is dependency mapping before decommissioning a system?</td><td>Identifying every other system/service that relies on the system being retired, so those integrations can be rerouted safely first</td></tr>
<tr><td>What risk does a "big-bang cutover" carry compared to a phased approach?</td><td>Higher risk - since everything switches at once, any missed issue affects all users immediately, with less opportunity to catch problems early</td></tr>
<tr><td>Who typically approves a system retirement plan?</td><td>Business/product stakeholders together with engineering and, for regulated data, legal/compliance teams</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Retirement sits at the far end of the pipeline but connects right back to the beginning - it is frequently
triggered by (and runs in parallel with) a brand-new requirement stage for the replacement system, with a
migration bridge connecting the two. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Old System (in Maintenance) --+
                              |--> Dependency mapping --> Migration/ETL pipeline
New System (fresh SDLC) ------+          |
                                          v
                              Parallel run --> Reconciliation reports
                                          |
                                          v
                              Cutover --> Old system decommissioned
                                          --> Infra/licenses cancelled
                                          --> Data archived per compliance policy</pre>
Notice the retirement of one system and the requirement stage of its replacement typically run
side-by-side, connected by a migration/reconciliation pipeline rather than a hard sequential handoff.`
        },
        {
            content: `<h3>Production Problems Caused by This Stage</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>An unrelated internal system suddenly starts failing right after an old system is shut down</td><td>Hidden dependency (API call, shared database, batch job) on the retired system was never mapped</td><td>Check logs/error traces on the failing system - calls are timing out against an endpoint that no longer exists</td><td>Do thorough dependency mapping (network traffic analysis, code search) before decommissioning, and reroute all discovered dependencies first</td></tr>
<tr><td>An audit request months later can't be fulfilled because historical records are gone</td><td>Data was deleted at shutdown instead of archived per the required retention policy</td><td>Check the decommissioning runbook - no archival step, or retention period was set too short</td><td>Define and follow a compliance-driven data retention/archival plan before any deletion, verified with legal</td></tr>
<tr><td>Customers are locked out and flood support with complaints on cutover day</td><td>Insufficient advance notice and no fallback path for users who hadn't migrated yet</td><td>Review the communication timeline - notices went out days, not months/weeks, before cutover</td><td>Give ample advance notice through multiple channels, and offer a grace/fallback period or migration assistance for stragglers</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>"Just turn it off" decommissioning</strong> - shutting down a system without any dependency mapping or migration plan. <br>
• <strong>No reconciliation step</strong> after data migration - assuming the migration succeeded without verifying record counts/integrity between old and new systems. <br>
• <strong>Retiring infrastructure but forgetting to cancel the underlying licenses/subscriptions</strong>, so cost savings never materialize. <br>
• <strong>Skipping a parallel-run or phased rollout</strong> for a big-bang cutover on a critical system, maximizing blast radius if something is wrong. <br>
• <strong>No documented rollback plan</strong> if the new replacement system has critical issues discovered right after cutover.`
        }
    ]
};
