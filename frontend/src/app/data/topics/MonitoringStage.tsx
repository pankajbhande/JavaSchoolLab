import { Topic } from '../coreJava';

export const monitoringStage: Topic = {
    id: 'monitoring-stage',
    name: 'Monitoring',
    beginner: [
        {
            content: `<h3>What is the Monitoring Stage?</h3>
Once software is live (deployed), monitoring is about continuously watching it to make sure it keeps
running correctly, and getting alerted quickly if something goes wrong. <br><br>
Think of it like a hospital's patient monitor that continuously tracks heartbeat and alerts nurses if
something looks abnormal - software monitoring watches the "health" of an application the same way. <br><br>
Example: For a shopping app, monitoring tracks things like - is the website up? Are pages loading slowly?
Are payments failing more than usual?`
        },
        {
            content: `<h3>What Gets Monitored</h3>
• <strong>Uptime/Availability</strong> - is the app up and reachable? <br>
• <strong>Performance</strong> - how fast are pages loading, how fast do APIs respond? <br>
• <strong>Errors</strong> - are there crashes, failed requests, exceptions happening? <br>
• <strong>Usage</strong> - how many users are active, which features are being used? <br><br>
Example: A dashboard shows that the "checkout" page is taking 5 seconds to load today instead of the
usual 1 second - a sign something is wrong that needs investigation.`
        },
        {
            content: `<h3>Alerts</h3>
Instead of someone constantly watching dashboards, systems are set up to automatically send a
notification (email, SMS, Slack message) when something crosses a dangerous threshold. <br><br>
Example: If more than 5% of payment requests start failing within 5 minutes, an automatic alert pings the
on-call engineer's phone immediately, even at 2 AM.`
        },
        {
            content: `<h3>Logs</h3>
Applications continuously write down records of what happened (logs) - which help engineers understand
exactly what went wrong when an issue is reported. <br><br>
Example: When a customer complains "my order didn't go through", engineers search the logs for that
customer's order attempt and see the exact error that occurred at that moment.`
        },
        {
            content: `<h3>Why This Stage Matters</h3>
Software that seems to "work" during testing can still fail once real, unpredictable users start using
it at scale. Monitoring is how a team finds out about problems quickly - often before users even notice
or complain. <br><br>
Example: Monitoring might catch a slow database query causing delays before it gets bad enough that
customers start abandoning their shopping carts in frustration.`
        }
    ],
    expert: [
        {
            content: `<h3>What Actually Happens at This Stage in a Real Org</h3>
Monitoring is a continuous, always-on activity owned jointly by DevOps/SRE (Site Reliability Engineering)
teams and the developers who built each service. Modern practice follows "observability" - not just
knowing something is broken, but being able to quickly understand WHY. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Application emits metrics/logs/traces
   --> Collected by monitoring agents (Prometheus, Datadog agent, etc.)
   --> Stored in time-series DB --> Visualized on dashboards (Grafana)
   --> Alert rules evaluated continuously --> On-call engineer paged if breached
   --> Incident triaged using logs/traces --> Root cause fixed</pre>`
        },
        {
            content: `<h3>The Three Pillars of Observability</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pillar</th><th>What it Shows</th><th>Common Tools</th></tr>
<tr><td>Metrics</td><td>Numeric time-series data (CPU%, request rate, error rate, latency)</td><td>Prometheus, Datadog, CloudWatch</td></tr>
<tr><td>Logs</td><td>Detailed event records for debugging specific incidents</td><td>ELK Stack (Elasticsearch/Logstash/Kibana), Splunk, Loki</td></tr>
<tr><td>Traces</td><td>The full path of a single request across multiple microservices</td><td>Jaeger, Zipkin, OpenTelemetry</td></tr>
</table>
<br>
Together these three let engineers answer "is something wrong", "what exactly happened", and "where in
the system did it happen" respectively.`
        },
        {
            content: `<h3>Sample Alert Rule (Prometheus-style pseudocode)</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">alert: HighPaymentFailureRate
expr: (rate(payment_failed_total[5m]) / rate(payment_attempted_total[5m])) > 0.05
for: 5m
labels:
  severity: critical
annotations:
  summary: "Payment failure rate above 5% for 5 minutes"
  action: "Page on-call engineer via PagerDuty"</pre>
Key concept: alerts should be based on <strong>SLOs (Service Level Objectives)</strong> that reflect
actual user impact, not arbitrary internal metrics that don't correlate with a real problem.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Impact</th></tr>
<tr><td>Alert fatigue - too many noisy, low-value alerts</td><td>On-call engineers start ignoring alerts, missing the real critical one</td></tr>
<tr><td>Monitoring only infrastructure (CPU/RAM) not business metrics</td><td>System looks "healthy" while checkout conversion actually crashed</td></tr>
<tr><td>No centralized logging across microservices</td><td>Debugging an issue means manually SSHing into many servers, wasting critical incident time</td></tr>
<tr><td>No defined SLOs/SLAs</td><td>Team doesn't know what "healthy" actually means, so severity of issues is misjudged</td></tr>
<tr><td>Dashboards built but nobody reviews them regularly</td><td>Slow performance degradation goes unnoticed until it becomes a full outage</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between monitoring and observability?</td><td>Monitoring tells you something is wrong via predefined metrics/alerts; observability lets you explore unknown issues by correlating metrics, logs, and traces together</td></tr>
<tr><td>What are the three pillars of observability?</td><td>Metrics (numeric trends), Logs (detailed event records), and Traces (request flow across services)</td></tr>
<tr><td>What is an SLO/SLI/SLA?</td><td>SLI is a measured indicator (e.g. latency); SLO is the target for that indicator (e.g. 99.9% under 200ms); SLA is the contractual promise to customers tied to SLOs</td></tr>
<tr><td>What is alert fatigue and how is it avoided?</td><td>Desensitization from too many low-value alerts; avoided by alerting only on user-impacting, actionable conditions tied to SLOs</td></tr>
<tr><td>What is distributed tracing used for?</td><td>Following a single request as it flows through multiple microservices, to pinpoint exactly where latency or errors are introduced</td></tr>
<tr><td>What is an on-call rotation?</td><td>A schedule where engineers take turns being reachable to respond to production alerts/incidents outside business hours</td></tr>
<tr><td>Why monitor business metrics, not just infrastructure metrics?</td><td>Infrastructure can look healthy (low CPU) while a business-critical flow like checkout is silently broken - business metrics catch what infra metrics miss</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Monitoring wraps around the live application, continuously feeding signals into dashboards and alerting -
closing the loop from "we shipped it" back to "we know it's healthy" and, when it isn't, back into the
maintenance stage as a new bug ticket. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Production App --> emits metrics/logs/traces
   --> Prometheus/Datadog (metrics) + ELK/Loki (logs) + Jaeger (traces)
   --> Grafana dashboards (humans watch trends)
   --> Alertmanager/PagerDuty (machines watch thresholds)
   --> On-call engineer paged --> Incident opened
   --> Root cause found via logs/traces --> Fix flows into Maintenance Stage</pre>
This is the feedback loop that makes the SDLC circular rather than a straight line - monitoring is what
tells the team a requirement was actually satisfied once real users are involved.`
        },
        {
            content: `<h3>Production Problems Caused by This Stage</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A major outage runs for hours before anyone at the company notices - customers report it first</td><td>No alerting configured on the metrics that actually reflect user impact</td><td>Check alert rules - only infrastructure CPU/memory alerts exist, nothing on error rate or latency</td><td>Define SLOs tied to user-facing behavior (error rate, latency) and alert on those, not just raw infra metrics</td></tr>
<tr><td>On-call engineers start ignoring pages, and a real incident is missed</td><td>Alert fatigue from too many low-value, noisy alerts over time</td><td>Review alert history - dozens of pages per week, most self-resolving within minutes</td><td>Tighten alert thresholds/durations, remove non-actionable alerts, and route only genuinely urgent, user-impacting alerts to paging</td></tr>
<tr><td>Debugging an incident takes 3 hours because engineers manually SSH into a dozen servers</td><td>No centralized logging across microservices</td><td>Check whether logs are aggregated in one searchable place or scattered per-instance</td><td>Ship all logs to a centralized system (ELK/Loki/Splunk) with correlation/request IDs across services</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Dashboards nobody looks at</strong> - built once for a demo, never checked again until an incident forces someone to open them. <br>
• <strong>Monitoring only "is the server up"</strong> instead of business-critical user journeys like checkout or login success rate. <br>
• <strong>Alerting on every possible metric</strong> instead of only the few that map to real user impact - causing alert fatigue. <br>
• <strong>No runbooks</strong> - an alert fires but nobody knows what steps to take, wasting critical time during an incident. <br>
• <strong>Logging sensitive data (passwords, card numbers) in plaintext</strong> - a security/compliance risk baked into the observability setup itself.`
        }
    ]
};
