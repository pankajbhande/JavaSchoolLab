import { Topic } from '../coreJava';

export const designStage: Topic = {
    id: 'design-stage',
    name: 'Design',
    beginner: [
        {
            content: `<h3>What is the Design Stage?</h3>
Once requirements are finalized, the design stage decides <strong>how</strong> the software will be built -
the blueprint before actual coding begins. <br><br>
Just like a house architect draws floor plans showing where the kitchen, bedroom, and doors go before
construction, software architects draw diagrams showing how modules, databases, and screens will connect. <br><br>
Example: For a food delivery app, the design stage decides how the "Order" screen talks to the "Payment"
service and how data will be stored in the database - before any developer writes actual code.`
        },
        {
            content: `<h3>Two Levels of Design</h3>
• <strong>High-Level Design (HLD)</strong> - the big picture: overall architecture, major modules, how they
communicate (e.g. "Order Service" talks to "Payment Service" via REST API). <br>
• <strong>Low-Level Design (LLD)</strong> - the detailed picture: actual class diagrams, database table
structures, method signatures that developers will directly follow while coding. <br><br>
Example: HLD says "we will have a separate microservice for Payments". LLD says exactly what the
PaymentService class looks like, its methods, and the payment table columns.`
        },
        {
            content: `<h3>UI/UX Design</h3>
Along with the technical design, designers create wireframes and mockups showing how each screen will
look and how users will navigate through the app. <br><br>
Example: Before coding a login screen, a designer creates a picture (in a tool like Figma) showing where
the username box, password box, and "Login" button will appear.`
        },
        {
            content: `<h3>Database Design</h3>
The team decides what data needs to be stored and how tables relate to each other. <br><br>
Example: For an e-commerce app, the design stage decides there will be a "Customer" table, an "Order"
table, and a "Product" table, and that one Customer can place many Orders (a one-to-many relationship).`
        },
        {
            content: `<h3>Why This Stage Matters</h3>
A good design avoids costly rewrites later. If the design correctly anticipates growth (e.g. more users,
more features), developers can build on it easily. A poor design leads to a system that is hard to
change or scale. <br><br>
Example: If a chat app is not designed to handle many simultaneous users from day one, it may crash or
slow down badly once it becomes popular, requiring a painful redesign.`
        }
    ],
    expert: [
        {
            content: `<h3>What Actually Happens at This Stage in a Real Org</h3>
Design is usually owned by a Solution Architect / Tech Lead, with input from senior engineers, DBAs,
security teams, and UX designers. The output is a set of design documents and diagrams reviewed in a
formal "design review" meeting before coding starts. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Requirements --> Architecture Decision (monolith vs microservices)
       --> HLD (system diagram, tech stack, integrations)
       --> LLD (class diagrams, API contracts, DB schema)
       --> Design Review & Approval --> Handover to Dev team</pre>`
        },
        {
            content: `<h3>Key Design Decisions Made Here</h3>
• Architecture style: monolith vs microservices vs serverless <br>
• Technology stack: Java/Spring Boot vs Node.js, SQL vs NoSQL <br>
• API contracts: REST/GraphQL endpoints, request/response schemas (often defined via OpenAPI/Swagger) <br>
• Design patterns to apply: Factory, Singleton, Observer, Repository, etc. <br>
• Non-functional design: caching strategy, load balancing, security model (OAuth2/JWT), disaster recovery <br><br>
Tooling commonly used: draw.io / Lucidchart / Miro for diagrams, Figma for UI, Swagger/OpenAPI for API
contracts, Confluence for documenting HLD/LLD.`
        },
        {
            content: `<h3>Common Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Impact</th></tr>
<tr><td>Over-engineering (designing for scale never needed)</td><td>Wastes time/budget, adds unnecessary complexity</td></tr>
<tr><td>Under-engineering (ignoring future growth)</td><td>Costly redesign/rewrite once real-world load hits</td></tr>
<tr><td>Skipping design review with security/DBA teams</td><td>Security holes or poor database performance discovered late</td></tr>
<tr><td>Designing UI without involving real users</td><td>Poor usability, frequent user complaints post-launch</td></tr>
<tr><td>No documented API contracts</td><td>Front-end and back-end teams build mismatched interfaces, causing integration bugs</td></tr>
</table>`
        },
        {
            content: `<h3>Design Artifacts Example (Sequence Diagram)</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">User -> App: Click "Place Order"
App -> OrderService: createOrder(cart)
OrderService -> PaymentService: charge(amount)
PaymentService -> OrderService: success
OrderService -> DB: save order (status=CONFIRMED)
OrderService -> App: orderConfirmed
App -> User: Show "Order Placed" screen</pre>
This sequence diagram, produced during the design stage, becomes the exact contract developers implement
against in the following Development stage.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between HLD and LLD?</td><td>HLD describes overall system architecture and module interactions; LLD describes detailed class/method/database design developers directly implement</td></tr>
<tr><td>What is the role of a Solution Architect?</td><td>Owns technical design decisions - architecture style, tech stack, integrations, and non-functional design like scalability and security</td></tr>
<tr><td>Why choose microservices over monolith at design time?</td><td>Microservices allow independent scaling/deployment of modules but add operational complexity; monolith is simpler but scales as one unit</td></tr>
<tr><td>What is an API contract and why define it during design?</td><td>A defined request/response schema (e.g. via OpenAPI) so frontend and backend teams can build independently without mismatches</td></tr>
<tr><td>What design patterns are commonly applied at this stage?</td><td>Factory, Singleton, Observer, Repository, Strategy - chosen based on the problem being solved</td></tr>
<tr><td>What is a design review?</td><td>A formal meeting where architects/leads validate the proposed design against requirements, scalability, and security before development starts</td></tr>
<tr><td>What happens if design is skipped and teams jump straight to coding?</td><td>Leads to inconsistent architecture, duplicated logic, and expensive rework once integration issues surface</td></tr>
</table>`
        },
        {
            content: `<h3>Real-World Architecture Fit</h3>
Design sits between "what we need" and "what we build" - its outputs (diagrams, API contracts, schemas)
become the shared contract that every downstream team builds against in parallel. <br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Requirements --> Architecture Decision Records (ADRs)
      --> HLD / LLD / API Contracts (OpenAPI, DB schema)
      --> Design Review Board sign-off
      --> Frontend team builds against the API contract (mocked)
      --> Backend team builds against the same API contract
      --> Both integrate smoothly because they agreed on the contract up front</pre>
Tooling around this stage (draw.io, Swagger/OpenAPI, ADR templates in Confluence/Git) exists precisely so
teams that never talk directly can still build compatible pieces.`
        },
        {
            content: `<h3>Production Problems Caused by This Stage</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr><td>The whole system grinds to a halt under moderate real-world load</td><td>Design never accounted for expected concurrency, caching, or database indexing</td><td>Load test against the original NFRs - the design docs have no capacity numbers at all</td><td>Revisit the design with explicit scalability targets, add caching/indexing/queuing before it hits production again</td></tr>
<tr><td>Frontend and backend integration takes weeks of back-and-forth bug fixing near release</td><td>No formal API contract was defined and agreed before both teams started building</td><td>Compare frontend's expected payloads vs backend's actual responses - they diverge in field names/types</td><td>Define the API contract via OpenAPI/Swagger during design and generate client/server stubs from it</td></tr>
<tr><td>A single service outage takes down the entire application</td><td>Design chose a tightly coupled monolith-like dependency graph with no fault isolation</td><td>Draw the actual runtime dependency graph - one component has no circuit breaker/fallback</td><td>Introduce bulkheads/circuit breakers or split the failing dependency into an isolated, gracefully-degradable service</td></tr>
</table>`
        },
        {
            content: `<h3>Anti-Patterns</h3>
• <strong>"Big Design Up Front" taken to an extreme</strong> - months spent designing every detail before writing any code, delaying feedback and often becoming stale before development even starts. <br>
• <strong>Resume-driven design</strong> - choosing trendy microservices/tech stacks because they look good on a resume, not because the problem needs that complexity. <br>
• <strong>Designing in a vacuum</strong> - architects designing without ever consulting the engineers who will implement it, producing designs that are technically infeasible or painful to build. <br>
• <strong>No Architecture Decision Records (ADRs)</strong> - key trade-off decisions (why monolith vs microservices, why this DB) are never written down, so future engineers can't understand or safely revisit them. <br>
• <strong>Design reviewed once and never revisited</strong> even as requirements evolve mid-project.`
        }
    ]
};
