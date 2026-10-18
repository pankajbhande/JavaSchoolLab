import { Topic } from '../coreJava';

export const nonFunctionalRequirements: Topic = {
    id: 'non-functional-requirements',
    name: 'Non-Functional Requirements',
    beginner: [
        {
            content: `<h3>What is a Non-Functional Requirement?</h3>
A Non-Functional Requirement (NFR) describes <strong>how well</strong> the system performs a function, rather than what the function is. It defines a quality attribute - performance, security, usability, reliability, scalability, availability, etc. <br><br>

<strong>Real example (e-commerce checkout):</strong> <br>
Functional: "System shall allow the customer to pay by credit card." <br>
Non-Functional: "The payment confirmation shall be returned within 3 seconds under normal load."`
        },
        {
            content: `<h4>Common Categories of NFRs</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Category</th><th>Example</th></tr>
<tr><td>Performance</td><td>Page load time under 2 seconds for 95% of requests</td></tr>
<tr><td>Security</td><td>All passwords stored using bcrypt hashing</td></tr>
<tr><td>Usability</td><td>New user completes checkout without help in under 5 minutes</td></tr>
<tr><td>Availability</td><td>System uptime of 99.9% per month</td></tr>
<tr><td>Scalability</td><td>Support 10,000 concurrent users during flash sale</td></tr>
<tr><td>Maintainability</td><td>New payment gateway integrated within 2 developer-weeks</td></tr>
</table>`
        },
        {
            content: `<h4>Why Beginners Often Skip NFRs</h4>
NFRs are easy to forget because they don't map to a visible button or screen - but they decide whether the product survives in production. A checkout page that "works" but takes 15 seconds to load will lose customers even though every functional requirement was met. <br><br>

That's why NFRs must be captured explicitly, not assumed.`
        },
        {
            content: `<h4>How NFRs Are Documented</h4>
NFRs are usually written as measurable statements (not vague adjectives) and attached to the SRS/BRD, often organized using an industry checklist such as the ISO/IEC 25010 quality model (functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, portability).`
        }
    ],
    expert: [
        {
            content: `<h3>Why NFRs Are Harder to Manage Than FRs</h3>
Functional requirements are discrete and testable in isolation. NFRs are often cross-cutting - they apply across many features simultaneously and interact with each other, sometimes in tension: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Security  <--- tension --->  Usability
(more auth steps)            (fewer clicks)

Performance <--- tension --->  Consistency
(cache/eventual)                (always fresh data)

Scalability <--- tension --->  Cost
(more infra)                    (budget limits)</pre>

Part of a Business Analyst / Architect's job is to surface these trade-offs early and get explicit stakeholder sign-off on the priority.`
        },
        {
            content: `<h3>Making NFRs Measurable (SMART)</h3>
A vague NFR is unenforceable and untestable. Compare: <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Vague (bad)</th><th>Measurable (good)</th></tr>
<tr><td>"The system should be fast"</td><td>"95th percentile API response time under 300ms at 500 req/sec"</td></tr>
<tr><td>"The system should be secure"</td><td>"All data in transit encrypted via TLS 1.2+; OWASP Top 10 scan with zero critical findings"</td></tr>
<tr><td>"The system should scale"</td><td>"Support 3x current peak traffic with auto-scaling within 5 minutes"</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfalls in Practice</h3>
• <strong>Treating NFRs as "later" concerns</strong> - retrofitting performance or security into a system after launch is far more expensive than designing for it upfront. <br>
• <strong>No owner for NFR sign-off</strong> - functional requirements have a product owner; NFRs often need architects, security, and ops involved too. <br>
• <strong>Testing gap</strong> - functional testing gets a QA plan; NFRs need separate load testing, penetration testing, accessibility audits - teams often skip these under deadline pressure. <br>
• <strong>Conflicting NFRs left unresolved</strong> - e.g., "must be available offline" and "must always show real-time inventory" cannot both be fully satisfied without an explicit trade-off decision.`
        },
        {
            content: `<h3>NFR Elicitation Techniques Used by BAs</h3>
• Non-functional requirement workshops with architects/ops, not just business users. <br>
• Reviewing SLAs (Service Level Agreements) already promised to customers. <br>
• Benchmarking against competitor products or industry standards. <br>
• Regulatory/compliance mapping (GDPR, HIPAA, PCI-DSS) which often forces specific security and data-retention NFRs. <br>
• Non-functional requirements are frequently expressed as constraints (see the "Constraints" topic) since they bound the solution space rather than describe a feature.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a non-functional requirement?</td><td>A requirement that defines a quality attribute of the system - how well it performs, rather than what it does.</td></tr>
<tr><td>Give 5 categories of NFRs.</td><td>Performance, security, usability, availability, scalability (also: maintainability, portability, reliability).</td></tr>
<tr><td>Why are NFRs harder to test than FRs?</td><td>They are cross-cutting, often require specialized testing (load, security, accessibility), and are measured statistically (percentiles, uptime) rather than pass/fail on one scenario.</td></tr>
<tr><td>How do you make an NFR testable?</td><td>Attach a measurable, quantifiable target and a method of measurement, e.g. "95% of requests under 300ms measured via load test."</td></tr>
<tr><td>What happens if NFRs are ignored during design?</td><td>The system may function correctly but fail in production under real load, security threats, or usage patterns - costly to fix retroactively.</td></tr>
<tr><td>What is the ISO/IEC 25010 model?</td><td>A standardized software quality model listing 8 quality characteristics used to organize NFRs (performance, security, usability, reliability, etc.).</td></tr>
<tr><td>How do NFRs relate to constraints?</td><td>NFRs are often expressed or reinforced as constraints since they limit design choices (e.g., "must run on existing infrastructure").</td></tr>
<tr><td>Who should sign off on NFRs?</td><td>Not just the product owner - typically architects, security, operations, and compliance stakeholders as well.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
NFRs typically enter the pipeline through architecture and ops reviews rather than the standard product backlog, and they get validated by dedicated test types rather than ordinary QA sign-off: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">SLA promised to enterprise customer: "99.9% uptime, sub-second search"
        |
        v
Architect drafts NFR-07: "Search API p95 latency < 800ms at 1000 rps"
        |
        v
Design decision: add read replica + cache layer (not part of the NFR
                  itself - this is HOW the NFR gets satisfied)
        |
        v
Performance/load test suite (JMeter/Gatling) run in CI pipeline,
gated before every release
        |
        v
Production monitoring (Grafana/Datadog) continuously verifies the
same NFR post-deployment - NFRs don't stop being "tested" at launch</pre>

Unlike a functional requirement, an NFR is never "done" once - it is continuously re-verified in production because real traffic patterns drift over time.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>App crashed during Black Friday flash sale</td><td>No scalability/performance NFR was ever specified or load-tested against realistic peak traffic</td><td>Check whether any NFR document mentions a concurrent-user or throughput target at all</td><td>Define explicit scalability NFRs (e.g., "support 5x average traffic") and run load tests before every major sale event</td></tr>
<tr><td>Customer data leaked via an unencrypted internal API</td><td>Security NFRs covered the public-facing endpoints only; internal service-to-service calls were assumed "safe" and left unspecified</td><td>Audit which endpoints were in scope of the original security NFR and penetration test</td><td>Broaden the security NFR to cover all network boundaries, not just external ones, and re-run the pen test</td></tr>
<tr><td>New feature deployed fine in staging, then failed in production under real load</td><td>Staging environment NFRs (hardware, data volume) never matched production scale, so tests passed against an unrealistic baseline</td><td>Compare staging infra specs and data volume against production</td><td>Define an NFR that staging must be production-representative, or explicitly test at production scale before go-live</td></tr>
<tr><td>Regulatory audit failed, fines issued</td><td>Compliance-driven NFRs (data retention, encryption at rest) were treated as "someday" backlog items and never implemented</td><td>Trace the failed audit finding back to whether a corresponding NFR ever existed and was prioritized</td><td>Elevate compliance NFRs to release-blocking status, not optional backlog items</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>NFRs written as one vague catch-all line</strong> - "system must be fast, secure, and reliable" at the bottom of the SRS, with no numbers attached to any of it. <br>
• <strong>NFRs owned by nobody</strong> - functional requirements have a product owner; if no architect/ops lead owns NFRs, they quietly get dropped under deadline pressure. <br>
• <strong>Testing NFRs only once, at launch</strong> - performance and security drift as the system grows; NFRs need continuous re-validation, not a one-time checkbox. <br>
• <strong>Gold-plating an NFR nobody asked for</strong> - over-engineering for "web scale" when the actual business need is 500 users wastes budget that could fix a real NFR gap. <br>
• <strong>Resolving NFR conflicts silently in code</strong> - a developer picks "fast" over "consistent" without ever escalating the trade-off to the business, hiding a decision that should have been explicit.`
        }
    ]
};
