import { Topic } from '../coreJava';

export const sdlcModels: Topic = {
    id: 'sdlc-models',
    name: 'SDLC Models',
    beginner: [
        {
            content: `<h3>What is an SDLC Model?</h3>
An SDLC Model is a specific way of arranging the SDLC phases (requirements, design, coding, testing, deployment,
maintenance) to fit a project's needs. Different projects have different constraints - some have very fixed, well-known
requirements; others change constantly - so no single arrangement works for everyone. <br><br>

<strong>Real-world example:</strong> Building a bridge follows a strict, sequential plan because you cannot change the
foundation after the bridge is built. Building a mobile app's UI, on the other hand, benefits from showing early versions
to users and adjusting - a different arrangement of the same phases.`
        },
        {
            content: `<h3>The Most Common SDLC Models</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Model</th><th>Idea in One Line</th></tr>
<tr><td>Waterfall</td><td>Complete each phase fully before starting the next, in strict sequence</td></tr>
<tr><td>Agile</td><td>Build in small iterations, get feedback constantly, adapt as you go</td></tr>
<tr><td>Iterative</td><td>Build a basic version first, then repeat cycles adding more features each time</td></tr>
<tr><td>Spiral</td><td>Like iterative, but with heavy risk analysis at every loop - used for large, risky projects</td></tr>
<tr><td>V-Model</td><td>Like Waterfall, but every design phase is paired with a matching testing phase planned upfront</td></tr>
</table>
<br>
Waterfall and Agile (plus Agile's frameworks Scrum and Kanban) are the ones you'll encounter most often in real jobs -
each gets its own dedicated topic next.`
        },
        {
            content: `<h3>Choosing a Model: Depends on the Project</h3>
There's no "best" model - only the right fit for a given project's requirements stability, team size, and risk. <br><br>
• Requirements very clear and unlikely to change (e.g. government compliance system) -> Waterfall fits well. <br>
• Requirements likely to evolve, need fast user feedback (e.g. a startup's mobile app) -> Agile fits well. <br>
• Very large, high-risk project (e.g. an aircraft's flight control software) -> Spiral, with heavy risk review at each stage.`
        },
        {
            content: `<h3>Sequential vs Iterative - The Core Distinction</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Sequential (Waterfall):
Requirements -> Design -> Code -> Test -> Deploy      (one pass, in order)

Iterative (Agile/Spiral):
[Requirements -> Design -> Code -> Test] --> repeat --> [Requirements -> Design -> Code -> Test] --> repeat...
        (Iteration 1, small piece)              (Iteration 2, small piece)</pre>
Almost every SDLC model is a variation of one of these two ideas.`
        }
    ],
    expert: [
        {
            content: `<h3>Model Comparison Table</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Model</th><th>Best For</th><th>Weakness</th></tr>
<tr><td>Waterfall</td><td>Fixed, well-understood requirements; regulatory/compliance projects</td><td>Very costly to change direction once a phase is signed off</td></tr>
<tr><td>Agile</td><td>Evolving requirements, need for fast, frequent user feedback</td><td>Requires disciplined team, harder to fix-price/contract upfront</td></tr>
<tr><td>Iterative</td><td>Projects where core features are known but details will refine over cycles</td><td>Needs good planning to avoid scope drifting across iterations</td></tr>
<tr><td>Spiral</td><td>Large, high-risk, high-cost projects (aerospace, defense, banking cores)</td><td>Expensive - risk analysis at every loop adds overhead, not worth it for small projects</td></tr>
<tr><td>V-Model</td><td>Safety-critical software needing rigorous, pre-planned test coverage</td><td>Same rigidity as Waterfall - poor fit for changing requirements</td></tr>
</table>`
        },
        {
            content: `<h3>The V-Model in Detail (an important exam/interview topic)</h3>
The V-Model extends Waterfall by explicitly mapping each development phase to a corresponding testing phase, planned
before any code is written: <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Requirements Analysis      <----->      Acceptance Testing
      Design                <----->      System Testing
   Architecture              <----->      Integration Testing
   Module Design             <----->      Unit Testing
              \\                              /
               \\____________ Coding _______/</pre>

The advantage: test cases are designed early, alongside the corresponding design phase, catching design flaws before
coding even starts. The trade-off: like Waterfall, it assumes requirements won't change mid-project.`
        },
        {
            content: `<h3>Hybrid Models in Real Companies</h3>
In practice, few large organizations use a "pure" textbook model. Common real-world hybrids: <br>
• <strong>Water-Scrum-Fall</strong> - upfront requirements/budget approval done in a Waterfall style (for
contracting/compliance reasons), then execution done in Agile sprints, then a formal release/sign-off phase at the end. <br>
• <strong>Scaled Agile (SAFe)</strong> - Agile teams at the delivery level, but coordinated through longer-term
"Program Increment" planning that resembles a bigger iterative/Waterfall-like cadence for cross-team alignment. <br><br>

Knowing this matters for interviews: expect to be asked how you'd adapt a model to real organizational constraints, not
just to recite textbook definitions.`
        },
        {
            content: `<h3>How to Pick a Model - A Decision Framework</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question to Ask</th><th>Leans Toward</th></tr>
<tr><td>Are requirements fully known and stable?</td><td>Yes -> Waterfall/V-Model &nbsp; | &nbsp; No -> Agile/Iterative</td></tr>
<tr><td>Do we need frequent customer feedback?</td><td>Yes -> Agile &nbsp; | &nbsp; No -> Waterfall</td></tr>
<tr><td>Is this a high-risk, high-cost, safety-critical system?</td><td>Yes -> Spiral/V-Model</td></tr>
<tr><td>Is the team small and co-located, working closely with the client?</td><td>Yes -> Agile (Scrum/Kanban)</td></tr>
<tr><td>Is this a fixed-price government/regulatory contract?</td><td>Yes -> Waterfall (or Water-Scrum-Fall hybrid)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is an SDLC model?</td><td>A specific arrangement/strategy for organizing the SDLC phases, chosen based on a project's requirements stability, risk, and team structure</td></tr>
<tr><td>Name the major SDLC models.</td><td>Waterfall, Agile, Iterative, Spiral, V-Model (and hybrids like Water-Scrum-Fall)</td></tr>
<tr><td>When would you choose Waterfall over Agile?</td><td>When requirements are fixed and well-understood upfront, e.g. a regulatory/compliance system with a fixed-price contract</td></tr>
<tr><td>What distinguishes the V-Model from plain Waterfall?</td><td>The V-Model pairs every development phase with a corresponding, pre-planned testing phase (unit, integration, system, acceptance)</td></tr>
<tr><td>What is the Spiral model best suited for?</td><td>Large, high-risk projects where repeated risk analysis at each cycle is worth the extra overhead, e.g. aerospace/defense software</td></tr>
<tr><td>What is "Water-Scrum-Fall"?</td><td>A common real-world hybrid where upfront planning/approval is Waterfall-style, execution happens in Agile sprints, and release/sign-off is formal again at the end</td></tr>
<tr><td>How would you decide which model fits a new project?</td><td>Assess requirement stability, project risk/criticality, need for customer feedback frequency, and contract type, then pick (or hybridize) accordingly</td></tr>
<tr><td>Is Agile always the better choice over Waterfall?</td><td>No - Agile fits evolving requirements and frequent feedback needs, but Waterfall can be more efficient and easier to contract when requirements are truly fixed</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit: A Model-Selection Decision Tree</h3>
When a new project kicks off, a tech lead/architect walks through a decision tree like this before any code is written: <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                    Are requirements fully known & stable?
                              /                    \\
                            YES                     NO
                            /                          \\
             Is it safety-critical/                 Do we need frequent
             regulated (medical,                    customer feedback?
             aerospace, banking core)?                    /        \\
              /            \\                            YES        NO
            YES             NO                           /            \\
             |               |                        Agile         Iterative
          V-Model        Waterfall                  (Scrum/Kanban)  (build core,
                                                                      refine later)
Large + high-risk at any branch --> layer in Spiral-style risk reviews at each cycle</pre>
This is the practical version of "choosing a model" - it's not memorized trivia, it's a repeatable checklist applied
at project kickoff.`
        },
        {
            content: `<h3>Production Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>A 12-month fixed-price Waterfall project needs 3 major requirement changes before delivery</td><td>Wrong model chosen - requirements were assumed stable but the market/domain was actually still evolving</td><td>Check how many formal change requests were filed after requirements sign-off</td><td>Re-scope future similar projects using Agile or a Water-Scrum-Fall hybrid so evolving requirements don't blow the fixed-price contract</td></tr>
<tr><td>A safety-critical medical device project used Scrum and shipped a defect that reached a regulator's audit</td><td>Model mismatch - Agile's lighter documentation doesn't satisfy regulatory traceability requirements</td><td>Check whether audit trail/test-traceability requirements were actually met by the sprint process</td><td>Switch to V-Model or heavily augment Scrum with mandatory traceability/documentation gates for regulated domains</td></tr>
<tr><td>Spiral-model project burns 30% of budget on risk analysis for a low-risk internal tool</td><td>Model chosen without matching project risk/scale - Spiral's overhead wasn't justified</td><td>Compare the project's actual risk profile to the overhead the chosen model imposes</td><td>Use the decision-tree checklist before committing to a model; reserve Spiral for genuinely high-risk, high-cost projects</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>Picking a model because it's trendy, not because it fits</strong> - forcing Agile onto a fixed-scope
government contract, or forcing Waterfall onto a fast-moving startup product. <br>
• <strong>Never revisiting the model choice</strong> - a project's risk/requirement-stability profile can change
significantly over time, but teams rarely reconsider whether their SDLC model still fits. <br>
<strong>"Water-Scrum-Fall" by accident</strong> - calling the process Agile but layering so much upfront sign-off and
end-of-project gating that it behaves exactly like Waterfall with extra ceremony. <br>
• <strong>Mixing model artifacts inconsistently</strong> - producing a full Waterfall-style SRS but then running
sprints with no backlog discipline, so neither model's benefits are actually realized.`
        }
    ]
};
