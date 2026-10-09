import { Topic } from '../coreJava';

export const engineeringDocumentation: Topic = {
    id: 'documentation',
    name: 'Documentation',
    beginner: [
        {
            content: `<h3>What is Engineering Documentation?</h3>
Documentation is any written material that explains how a system works, how to use it, or why it was built a certain
way - README files, API docs, architecture diagrams, code comments, runbooks. <br><br>
Real-world analogy: it's the instruction manual and labeled wiring diagram for a house's electrical panel. You could
figure it out by tracing every wire yourself, but a clear diagram saves hours - especially for someone who didn't
build the house.`
        },
        {
            content: `<h4>Common types of documentation</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Audience</th><th>Example</th></tr>
<tr><td>README</td><td>New developers / users</td><td>How to install, run, and test a project</td></tr>
<tr><td>API docs</td><td>Consumers of your code/service</td><td>Javadoc, OpenAPI/Swagger spec</td></tr>
<tr><td>Architecture doc</td><td>Engineers designing/extending the system</td><td>Diagrams, key design decisions</td></tr>
<tr><td>Runbook</td><td>On-call engineers</td><td>Steps to diagnose and fix a specific alert</td></tr>
<tr><td>Code comments</td><td>Whoever reads the code next</td><td>Why a non-obvious workaround exists</td></tr>
</table>`
        },
        {
            content: `<h4>Javadoc: documenting Java code directly</h4>
Java has a built-in convention for documenting classes and methods that IDEs and tools can read.`,
            codeExamples: [
                `/**
 * Calculates the final price of an order after applying
 * any applicable customer discounts.
 *
 * @param order the order to price; must not be null
 * @return the final total, in the order's currency
 * @throws IllegalArgumentException if order has no items
 */
public double calculateTotal(Order order) {
    if (order.getItems().isEmpty()) {
        throw new IllegalArgumentException("Order must have at least one item");
    }
    // ...
}`
            ]
        },
        {
            content: `<h4>Good comments vs unnecessary comments</h4>
A comment should explain WHY, not WHAT - the code itself already shows what it does; a good name usually makes even
that unnecessary. Comments earn their place when they explain a non-obvious reason.`,
            codeExamples: [
                `// Bad: restates what the code obviously does
// increment i by 1
i++;

// Good: explains a non-obvious reason
// Retry once - the payment gateway occasionally times out on the
// first call under high load (see incident INC-2041)
if (attempt == 1) {
    retry();
}`
            ]
        },
        {
            content: `<h4>Why documentation matters, even for a solo project</h4>
• Onboarding new team members takes days instead of weeks. <br>
• You (six months from now) will have forgotten why you made a decision - documentation is a message to future-you. <br>
• Reduces "bus factor" risk - the project doesn't stall if one person is unavailable.`
        }
    ],
    expert: [
        {
            content: `<h3>Documentation as a Product, Not an Afterthought</h3>
In mature engineering orgs, documentation is treated with the same rigor as code: it lives in version control next
to the code it describes (so it can be reviewed in the same PR and never drifts out of sync), and stale docs are
treated as a defect. Tools like Docs-as-Code (Markdown files in the repo, rendered by static site generators) make
documentation reviewable, versioned, and testable (e.g. broken-link checkers, doc linting in CI) just like source code.`
        },
        {
            content: `<h3>Documentation Layers in a Real System</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  README.md              -> "How do I get this running locally?"
  ARCHITECTURE.md         -> "How are the pieces wired together, and why?"
  ADRs (decision records)  -> "Why did we choose Postgres over Mongo, in 2023?"
  API spec (OpenAPI)      -> "What endpoints exist, what do they accept/return?"
  Javadoc / inline comments -> "What does this specific class/method do?"
  Runbooks                -> "PagerDuty fired alert X - what do I do, step by step?"
</pre>
Each layer serves a different reader at a different moment - a new hire reads the README on day one, an on-call
engineer reads the runbook at 2 AM, and nobody should have to read source code to answer "why" a major decision was
made if an Architecture Decision Record (ADR) exists.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
• <strong>Documentation drift</strong> - docs describe how the system used to work; nobody updates them when the code
changes, so they become actively misleading (worse than no docs at all). <br>
• <strong>Write-only documentation</strong> - a wiki page nobody can find, disconnected from the code, effectively
doesn't exist. <br>
• <strong>Over-documenting the obvious</strong> - restating what the code already clearly says wastes reviewer/reader
time; the effort should go toward the non-obvious "why." <br>
• <strong>No ownership</strong> - if updating docs isn't part of the definition of "done" for a PR, they rot within
weeks.`
        },
        {
            content: `<h3>Architecture Decision Records (ADRs)</h3>
An ADR is a short, immutable document capturing one significant technical decision: the context, the options
considered, the decision made, and its consequences. Unlike a wiki page that gets edited in place (and loses history),
ADRs are appended - if a decision is later reversed, a new ADR supersedes the old one, preserving the reasoning trail.
This is invaluable for answering "why is it built this way?" months or years later without needing to ask the
original author (who may have left the team).`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What should a code comment explain - what the code does, or why?</td><td>Why - the code itself (especially with good naming) already shows what it does; comments earn their place explaining non-obvious reasoning.</td></tr>
<tr><td>What is "documentation drift" and why is it dangerous?</td><td>When docs describe outdated behavior because they weren't updated alongside code changes - it's dangerous because misleading docs are often worse than no docs.</td></tr>
<tr><td>What is "Docs-as-Code"?</td><td>Storing documentation as versioned files in the same repository as the code, so it can be reviewed in the same PR and stays in sync via the same workflow.</td></tr>
<tr><td>What is an Architecture Decision Record (ADR)?</td><td>A short, append-only document capturing the context, options, and reasoning behind one significant technical decision, so future engineers understand "why" without asking the original author.</td></tr>
<tr><td>What is Javadoc used for in Java?</td><td>A standardized comment format (/** ... */) that documents classes, methods, and parameters, and can be extracted into browsable API documentation by tooling.</td></tr>
<tr><td>What is a runbook and who is its primary audience?</td><td>A step-by-step guide for diagnosing and resolving a specific operational issue/alert, primarily used by on-call engineers during an incident.</td></tr>
<tr><td>How can teams keep documentation from becoming stale?</td><td>Make updating relevant docs part of the PR/definition-of-done, keep docs versioned alongside code, and use CI checks (link checkers, doc linting) where possible.</td></tr>
<tr><td>Why might over-commenting obvious code actually hurt readability?</td><td>It adds noise that readers must scan past, diluting attention from the comments that actually explain non-obvious "why" reasoning.</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
In a Docs-as-Code setup, documentation flows through the same pipeline as source code, which is exactly what keeps it
from drifting out of sync:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  Code change + doc update   (same PR - reviewer sees both together)
        |
        v
  CI runs: build/test  +  doc lint  +  broken-link checker
        |
        v
  Review checks: "does the doc still match the behavior?"
        |
        v
  Merge  --->  Static site generator rebuilds docs site automatically
                    |
                    v
        README (day 1) | ARCHITECTURE.md (design) | ADRs (why) | Runbooks (on-call, 2am)
</pre>
Docs living outside this pipeline (a separate wiki nobody links from the repo) have no forcing function keeping them
current - that's the structural reason wiki docs rot faster than docs-as-code.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>On-call engineer follows the runbook at 2am and it makes the outage worse</td><td>Runbook documents an old deployment process that changed months ago and was never updated</td><td>Runbook references a command/tool that was decommissioned or replaced in a recent migration</td><td>Make runbook updates part of the definition-of-done for infra/deploy-process changes; test runbooks periodically in game days</td></tr>
<tr><td>A new hire spends their first week reverse-engineering "why" a core service uses an unusual database choice</td><td>No Architecture Decision Record exists, and the original author has since left the team</td><td>Wiki/README only describes "what" the system does, nothing captures the "why" behind the design</td><td>Write an ADR after the fact from available context/tickets; require ADRs for future significant decisions</td></tr>
<tr><td>Two teams build conflicting integrations against the same API because the published docs are outdated</td><td>API docs (OpenAPI spec) weren't regenerated/updated when the endpoint contract changed</td><td>Docs describe a field/endpoint shape that no longer matches the actual deployed API</td><td>Generate API docs automatically from the spec/code in CI so docs can't drift from the real contract</td></tr>
<tr><td>A critical README is technically present but nobody can find it before an incident</td><td>Documentation exists in an unlinked, unsearchable location (a random wiki page, a personal notes doc)</td><td>The doc has near-zero page views/links from the main repo or team wiki index</td><td>Keep operational docs (runbooks, architecture) in the repo next to the code, discoverable from the README</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Documentation drift</strong> - docs describe how the system used to work, actively misleading readers -
often worse than having no docs at all. <br>
• <strong>Write-only wikis</strong> - documentation written once, never linked from anywhere discoverable, effectively
invisible. <br>
• <strong>Restating the obvious</strong> - comments/docs that just repeat what the code already clearly shows, wasting
reader attention that should go toward the non-obvious "why." <br>
• <strong>No ownership or update trigger</strong> - if doc updates aren't part of "done" for a PR, they silently rot
within weeks. <br>
• <strong>Tribal-knowledge-only decisions</strong> - a major architectural choice that only lives in one engineer's
memory, gone the moment they leave the team.`
        }
    ]
};
