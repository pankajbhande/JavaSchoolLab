import { Topic } from '../coreJava';

export const waterfallModel: Topic = {
    id: 'waterfall-model',
    name: 'Waterfall',
    beginner: [
        {
            content: `<h3>What is the Waterfall Model?</h3>
Waterfall is the oldest and simplest SDLC model: each phase must be fully completed and signed off before the next phase
begins - just like a waterfall, where water flows in one direction only and never flows back up. <br><br>

<strong>Real-world example:</strong> Constructing a building - you can't start the interior finishing before the walls
are built, and you can't build the walls before the foundation is laid. Each stage strictly depends on the previous one
being complete.`
        },
        {
            content: `<h3>The Waterfall Phases</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Requirements  -->  Design  -->  Implementation  -->  Testing  -->  Deployment  -->  Maintenance
     |                |               |                  |              |
   (frozen           (frozen        (frozen            (frozen        (goes to
    & signed          before         before code         before        production)
    off)              coding)        review)             deploy)</pre>
Notice there is no "going back" arrow - once requirements are signed off, the team moves to design, and so on, strictly
in order.`
        },
        {
            content: `<h3>A Small Example Walkthrough</h3>
Imagine building a simple "Employee Leave Management System" using Waterfall: <br>
1. <strong>Requirements</strong> (2 weeks) - meet HR, finalize what leave types, approval flow, and reports are needed - document signed off. <br>
2. <strong>Design</strong> (2 weeks) - architect designs database tables, screens, and APIs based on the signed-off requirements. <br>
3. <strong>Implementation</strong> (6 weeks) - developers build the entire system per the design document. <br>
4. <strong>Testing</strong> (3 weeks) - QA tests the complete system against the requirements document. <br>
5. <strong>Deployment</strong> (1 week) - system goes live for all HR staff at once. <br>
6. <strong>Maintenance</strong> (ongoing) - bugs reported by users are fixed.<br><br>
Notice: nothing is shown to HR until testing/deployment - a defining trait of Waterfall.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Simple to understand and manage</td><td>Customer sees a working product only very late</td></tr>
<tr><td>Clear milestones and documentation at every phase</td><td>Very costly/slow to accommodate a requirement change once coding has started</td></tr>
<tr><td>Works well when requirements are stable and well known</td><td>Risks (design flaws, wrong assumptions) are discovered late</td></tr>
</table>`
        }
    ],
    expert: [
        {
            content: `<h3>Why Waterfall Still Survives in Industry</h3>
Despite Agile's popularity, Waterfall is still widely used - especially in government contracts, defense, banking core
systems, and hardware-adjacent projects - because those contexts value predictable, fixed-scope delivery with heavy
upfront documentation for compliance/audit purposes over flexibility. Many fixed-price outsourcing contracts are
structured around Waterfall milestones because they map cleanly to payment milestones.`
        },
        {
            content: `<h3>Waterfall vs Agile - The Interview-Favorite Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Waterfall</th><th>Agile</th></tr>
<tr><td>Requirements</td><td>Fixed upfront, changes are costly</td><td>Expected to evolve, embraced via backlog refinement</td></tr>
<tr><td>Customer feedback</td><td>Only after deployment/late testing</td><td>Continuous, every sprint (1-4 weeks)</td></tr>
<tr><td>Delivery</td><td>One big release at the end</td><td>Frequent small releases (increments)</td></tr>
<tr><td>Documentation</td><td>Heavy, formal, upfront</td><td>"Just enough," evolves alongside the product</td></tr>
<tr><td>Risk visibility</td><td>Late (found in testing phase)</td><td>Early (found every sprint)</td></tr>
<tr><td>Best fit</td><td>Fixed-scope, regulated, well-understood projects</td><td>Evolving-scope, fast-moving product development</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfall: The "Cost of Change" Curve</h3>
The single most important thing to understand about Waterfall is that the cost of fixing a mistake grows dramatically the
later it's discovered: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Cost to fix a defect
  |
  |                                                    ****
  |                                              ****
  |                                        ****
  |                                  ****
  |                            ****
  |                      ****
  |               ****
  |         ****
  |    ****
  +------------------------------------------------------------> Phase found in
   Requirements   Design   Coding   Testing   Production</pre>
A requirement misunderstanding caught during the requirements phase might cost a conversation to fix. The same
misunderstanding, if only discovered after deployment, might require re-architecting and re-releasing the whole system -
this is exactly why Waterfall's rigor is valuable when requirements really are stable, and exactly why it's dangerous
when they aren't.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the Waterfall model?</td><td>A sequential SDLC model where each phase must fully complete before the next begins, with no revisiting earlier phases</td></tr>
<tr><td>What are the phases of Waterfall?</td><td>Requirements, Design, Implementation, Testing, Deployment, Maintenance - in strict order</td></tr>
<tr><td>When is Waterfall the right choice?</td><td>When requirements are stable, well-understood, and unlikely to change - e.g. regulated or fixed-price contract projects</td></tr>
<tr><td>What is the biggest drawback of Waterfall?</td><td>The customer sees nothing working until very late, and changing requirements after a phase is signed off is expensive</td></tr>
<tr><td>Why does the "cost of change" increase in later phases of Waterfall?</td><td>A defect found in requirements costs a conversation; the same defect found in production may require re-architecture, re-coding, re-testing, and re-deployment</td></tr>
<tr><td>How does Waterfall differ from Agile in terms of customer feedback?</td><td>Waterfall gets feedback only near the end (testing/deployment); Agile gets feedback continuously, every sprint</td></tr>
<tr><td>Why do government/defense projects often still use Waterfall?</td><td>They need heavy upfront documentation, fixed scope, and predictable milestones for compliance and audit, which Waterfall's structure naturally provides</td></tr>
<tr><td>If a client's requirements are still evolving, would you recommend Waterfall? Why or why not?</td><td>No - Waterfall assumes fixed requirements; an evolving-requirements project fits Agile far better since it accommodates change without expensive rework</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: Where Waterfall Shows Up Today</h3>
Pure Waterfall is rare in modern product companies, but it's alive inside larger organizations as a governance layer
around contract and compliance milestones: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Client Contract Signed
        |
        v
Requirements Sign-off  ---->  formal SRS document, client approval (Waterfall gate)
        |
        v
Design Sign-off        ---->  HLD/LLD approved by architect + client (Waterfall gate)
        |
        v
Fixed-price Build Phase ---->  large batch of coding, often internally run as mini-Agile sprints
        |
        v
UAT / Formal Acceptance ---->  client signs off before final payment milestone (Waterfall gate)</pre>
Notice the gates are Waterfall-style even when the internal build phase uses Agile sprints - this is exactly the
"Water-Scrum-Fall" hybrid pattern seen in real outsourcing/enterprise contracts.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>Requirements changed 6 months into a 12-month Waterfall project, forcing a costly re-plan</td><td>No feedback loop existed until the late testing/UAT phase - the client never saw working software early</td><td>Check when the client first saw a working demo - usually only near the end</td><td>Introduce interim demo checkpoints even within a Waterfall contract, or renegotiate to a phased/hybrid delivery model</td></tr>
<tr><td>A critical design flaw is discovered during system testing, 8 months in</td><td>Design phase was signed off without adequate prototyping or stakeholder review of edge cases</td><td>Review whether the design doc addressed the specific edge case that failed, or missed it entirely</td><td>Add design review/walkthrough sessions with QA and key stakeholders before sign-off, not just architect self-review</td></tr>
<tr><td>Client refuses to pay the final milestone because delivered software doesn't match their "real" expectations</td><td>Original SRS captured what was said, not what the client actually needed, and no checkpoint caught the gap</td><td>Compare the signed SRS wording against what the client is now asking for</td><td>Use more rigorous requirement elicitation (prototypes, wireframes, use cases) up front, and get explicit written sign-off on mockups, not just text requirements</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Signing off requirements the team knows are incomplete</strong> - rushing sign-off to hit a schedule
milestone, guaranteeing expensive rework later. <br>
• <strong>Treating the design document as a formality</strong> - producing a design doc nobody actually reads or
challenges, so it fails to catch real architectural flaws before coding starts. <br>
• <strong>No risk buffer in the schedule</strong> - planning as if nothing will go wrong in a rigid model that has
no room to absorb surprises discovered late. <br>
• <strong>Using Waterfall for genuinely exploratory work</strong> - applying strict phase-gating to a project where
nobody yet knows what "done" looks like, guaranteeing the plan will be wrong.`
        }
    ]
};
