// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const microservicesFundamentalsPart2: Course[] = [
  {
    id: 'microservices-fundamentals-2',
    name: 'Microservices (Deployment & Operations)',
    icon: 'Server',
    subTopics: [
      {
        id: 'microservices-ops',
        name: 'Deployment, Data & Operations',
        topics: [

          // ----- Kubernetes -----
          {
            id: 'kubernetes-basics',
            name: 'Container Orchestration with Kubernetes',
            beginner: [
              {
                content: `<h3>Why Do You Need an Orchestrator Beyond Plain Docker?</h3>
Docker packages and runs a single container, but running <strong>dozens of microservices in production</strong> raises questions Docker alone doesn't answer:<br>
<br>
• <strong>Scaling</strong> - if traffic spikes, who starts more container instances?<br>
• <strong>Self-healing</strong> - if a container crashes, who restarts it?<br>
• <strong>Rolling updates</strong> - how do you deploy a new version with zero downtime?<br>
• <strong>Service networking</strong> - how do containers on different hosts find each other?<br>
<br>
<strong>Kubernetes (K8s)</strong> is a container orchestration platform that answers all of these - it schedules containers across a cluster of machines, restarts failed ones, scales them up/down, and load-balances traffic between them.<br>`
              },
              {
                content: `<h4>Core Kubernetes Concepts</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Concept</th><th>What It Is</th></tr>
<tr class='text-center'><td>Pod</td><td>The smallest deployable unit - one or more tightly-coupled containers sharing network/storage</td></tr>
<tr class='text-center'><td>Deployment</td><td>Manages a set of identical Pod replicas, handles rolling updates and self-healing</td></tr>
<tr class='text-center'><td>Service</td><td>A stable network endpoint (IP/DNS name) that load-balances traffic across a Deployment's Pods, even as Pods come and go</td></tr>
<tr class='text-center'><td>Namespace</td><td>A virtual cluster-within-a-cluster, used to separate environments/teams (e.g. dev, staging, prod)</td></tr>
</table>
<br>
Pods are <strong>ephemeral</strong> - they can be killed and recreated with a new IP address at any time. This is exactly why a stable Service abstraction sits in front of them.<br>`
              },
              {
                content: `<h4>A Minimal Deployment + Service for a Spring Boot App</h4>
This YAML manifest runs 3 replicas of a Spring Boot microservice and exposes them through a stable Service:`,
                codeExamples: [
                  `# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: order-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: order-service
  template:
    metadata:
      labels:
        app: order-service
    spec:
      containers:
        - name: order-service
          image: myregistry/order-service:1.0.0
          ports:
            - containerPort: 8080
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
# NOTE: illustrative Kubernetes manifest, not a runnable Java program`
                ]
              },
              {
                content: `<h4>Basic kubectl Commands</h4>
<code>kubectl</code> is the CLI used to interact with a Kubernetes cluster:`,
                codeExamples: [
                  `kubectl apply -f deployment.yaml       # create/update resources from a manifest
kubectl get pods                       # list running pods
kubectl get deployments
kubectl scale deployment order-service --replicas=5   # manually scale
kubectl logs <pod-name>                # view a pod's logs
kubectl delete pod <pod-name>          # delete a pod (Deployment recreates it automatically)
# NOTE: shell commands, not Java - illustrative, no fabricated program output`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>How Kubernetes Achieves Self-Healing and Zero-Downtime Deploys</h3>
• A Deployment's <strong>controller loop</strong> constantly compares the desired replica count against the actual running Pods, and creates/deletes Pods to reconcile any difference - this is what makes a crashed Pod get automatically replaced.<br>
• A <strong>rolling update</strong> replaces old Pods with new ones a few at a time (controlled by <code>maxSurge</code>/<code>maxUnavailable</code>), never taking all replicas down at once - this is how zero-downtime deploys work under the hood.<br>
• <strong>Readiness probes</strong> tell Kubernetes when a Pod is actually ready to receive traffic (not just "started") - Spring Boot Actuator's <code>/actuator/health/readiness</code> endpoint is the standard hook for this.<br>
• <strong>Liveness probes</strong> tell Kubernetes when a Pod is unhealthy and should be killed/restarted - distinct from readiness, since a Pod can be "alive" but temporarily not ready (e.g. still warming up a cache).<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the difference between a Pod and a Deployment?</td><td>A Pod is a single running instance of one or more containers; a Deployment manages a desired number of identical Pod replicas and handles their lifecycle (scaling, updates, healing)</td></tr>
<tr class='text-center'><td>Why does a Service exist if Pods already have IPs?</td><td>Pod IPs change every time a Pod is recreated; a Service provides a stable, unchanging address that always routes to whichever Pods are currently healthy</td></tr>
<tr class='text-center'><td>Liveness probe vs readiness probe?</td><td>Liveness answers "should this Pod be restarted?"; readiness answers "should this Pod currently receive traffic?" - a Pod can be alive but not ready</td></tr>
</table>`
              }
            ]
          },

          // ----- Distributed Data Management -----
          {
            id: 'distributed-data-management',
            name: 'Distributed Data Management in Microservices',
            beginner: [
              {
                content: `<h3>The Database-Per-Service Principle</h3>
In a microservices architecture, <strong>each service owns its own database</strong>, and no other service is allowed to access it directly - all access goes through that service's API.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Order Service --owns--> Order DB
Inventory Service --owns--> Inventory DB
Payment Service --owns--> Payment DB

Order Service does NOT query Inventory DB directly.
It calls the Inventory Service's API instead.</pre>
<br>
If services shared one database, changing a table's schema in one service could silently break every other service reading from it - this defeats the entire point of independent deployability.<br>`
              },
              {
                content: `<h4>The Challenges This Creates</h4>
• <strong>No cross-service SQL joins</strong> - you can't <code>JOIN orders WITH inventory</code> across two databases, so a request needing combined data must call multiple services and merge the results in application code (see the API Composition topic).<br>
• <strong>Eventual consistency</strong> - since each service commits to its own database independently, there's no single ACID transaction spanning services; data becomes consistent across services after some delay, not instantly.<br>
• <strong>Distributed transactions</strong> - a business operation like "place an order" might need to update Order, Inventory, and Payment data together; a classic two-phase-commit transaction across databases doesn't scale well in this world.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>How This Is Actually Solved in Practice</h3>
The standard solutions to distributed data challenges are covered in full depth in the <strong>Microservices Design Patterns</strong> course - this topic gives the conceptual framing, not the implementation detail:<br>
<br>
• <strong>Saga Pattern</strong> - coordinating a multi-service transaction as a sequence of local transactions with compensating rollback actions on failure.<br>
• <strong>CQRS</strong> - separating the read model from the write model, often letting reads be served from a denormalized view built specifically to avoid needing cross-service joins.<br>
• <strong>Event Sourcing</strong> - storing state as an event log, which naturally supports building multiple read-optimized views across service boundaries.<br>
<br>
The mental shift required: distributed systems trade the comfortable guarantees of a single ACID database for independent scalability and deployability - accepting <strong>eventual consistency</strong> is usually the price paid.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't two microservices share one database?</td><td>Sharing a database recreates tight coupling through the schema - any change to a shared table risks breaking every service that reads it, defeating independent deployability</td></tr>
<tr class='text-center'><td>How do you query data that spans two services?</td><td>Call each owning service's API and combine the results in application code (API Composition), or maintain a denormalized read view built for that purpose (CQRS)</td></tr>
<tr class='text-center'><td>What does "eventual consistency" mean here?</td><td>Data across services becomes consistent after some propagation delay, rather than instantly within one atomic transaction, since each service commits independently to its own database</td></tr>
</table>`
              }
            ]
          },

          // ----- Microservices Security -----
          {
            id: 'microservices-security',
            name: 'Microservices Security',
            beginner: [
              {
                content: `<h3>Two Different Trust Boundaries to Secure</h3>
Microservices security has two distinct concerns:<br>
<br>
• <strong>Client → API Gateway</strong> - authenticating and authorizing an external user/client hitting your system's public entry point.<br>
• <strong>Service → Service</strong> - authenticating calls between your own internal services, so a compromised or rogue service can't freely call every other service.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   External Client
         |
     [OAuth2 / JWT]
         v
    API Gateway  ---centralized auth check happens here---
         |
     [mTLS / internal token]
         v
   Order Service --calls--> Inventory Service</pre>`
              },
              {
                content: `<h4>OAuth2 and JWT for Client Authentication</h4>
• A client authenticates once (e.g. via username/password or an identity provider) and receives a <strong>JWT (JSON Web Token)</strong> - a signed, self-contained token carrying claims about who the user is and what they're allowed to do.<br>
• The client sends this JWT on every subsequent request (typically in the <code>Authorization: Bearer &lt;token&gt;</code> header).<br>
• Because the JWT is <strong>signed</strong>, any service can verify it's genuine without calling back to a central auth server on every request - it just checks the signature.<br>`,
                codeExamples: [
                  `// Illustrative Spring Boot JWT validation snippet
@RestController
public class OrderController {

    @GetMapping("/orders/{id}")
    public Order getOrder(@PathVariable String id,
                           @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        Jws<Claims> claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token);   // throws if signature/expiry invalid

        String userId = claims.getBody().getSubject();
        return orderService.findOrderForUser(id, userId);
    }
}
// NOTE: illustrative security snippet, not a standalone runnable program`
                ]
              },
              {
                content: `<h4>The API Gateway as the Natural Auth Chokepoint</h4>
Rather than every single microservice re-implementing token validation, it's common to validate authentication <strong>once at the API Gateway</strong> and pass a trusted identity downstream (e.g. as a header), keeping individual services simpler. This is a direct extension of the API Gateway pattern already covered in the Microservices Design Patterns course.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Securing Service-to-Service Calls: mTLS and Service Mesh</h3>
Client-facing auth (OAuth2/JWT) doesn't automatically secure the internal network between your own services - if an attacker gets inside the cluster network, unencrypted/unauthenticated service-to-service calls are wide open.<br>
<br>
• <strong>mTLS (mutual TLS)</strong> - both sides of a service-to-service call present a certificate, so each service can cryptographically verify who's actually calling it, not just encrypt the traffic.<br>
• Rolling out mTLS by hand across every service is painful - this is one of the main reasons a <strong>service mesh</strong> (Istio, Linkerd) exists: it injects a sidecar proxy next to every service that handles mTLS transparently, without changing application code.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is a signed JWT useful for microservices?</td><td>Any service can verify it independently by checking the signature, without a round-trip call to a central auth server on every request</td></tr>
<tr class='text-center'><td>Why isn't client authentication enough to secure a microservices system?</td><td>It only secures the boundary between the external client and the API Gateway; internal service-to-service calls need their own trust mechanism (e.g. mTLS)</td></tr>
<tr class='text-center'><td>What problem does a service mesh solve for security?</td><td>It transparently provides mTLS and identity between services via sidecar proxies, without requiring every service to implement that logic itself</td></tr>
</table>`
              }
            ]
          },

          // ----- Testing Microservices -----
          {
            id: 'testing-microservices',
            name: 'Testing Microservices',
            beginner: [
              {
                content: `<h3>The Testing Pyramid, Adapted for Microservices</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">          /\\
         /E2E\\        <- few, slow, brittle, expensive
        /------\\
       /Contract\\      <- verify services agree without full deployment
      /----------\\
     /Integration \\    <- test a service against real dependencies (DB, etc.)
    /--------------\\
   /   Unit Tests   \\  <- many, fast, cheap, test logic in isolation
  /------------------\\</pre>
The shape stays the same as traditional testing (lots of fast unit tests, fewer slow end-to-end tests), but microservices add a layer traditional monoliths don't need: <strong>contract testing</strong>.<br>`
              },
              {
                content: `<h4>Unit and Integration Tests</h4>
• <strong>Unit tests</strong> - test a single class/method's logic in isolation, mocking out dependencies. Fast, run on every commit.<br>
• <strong>Integration tests</strong> - test a service against its real dependencies (an actual test database, e.g. via Testcontainers), verifying the service's own code + its direct infrastructure work together correctly.<br>`
              },
              {
                content: `<h4>Why Full End-to-End Tests Don't Scale Well</h4>
An end-to-end test that spins up every microservice in the system to verify one user flow is: <strong>slow</strong> (many services to boot), <strong>brittle</strong> (any one service being flaky fails the whole test), and <strong>hard to debug</strong> (a failure could be in any of a dozen services). The practical answer is to minimize how many of these you rely on and lean on contract testing instead for verifying inter-service compatibility.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Contract Testing</h3>
<strong>Contract testing</strong> (e.g. using the Pact framework) verifies that a service ("consumer") and the service it calls ("provider") agree on the shape of their API contract - <strong>without actually running both services together</strong>.<br>
<br>
The flow: the consumer team writes a test defining what it expects from the provider's response; this generates a "contract" file; the provider team then runs that contract against their own service in CI to verify they still satisfy it. If the provider changes its API in a breaking way, the contract test fails in the provider's own pipeline - long before a real integration bug reaches production.<br>`,
                codeExamples: [
                  `// Illustrative Pact-style consumer contract test structure
@Pact(consumer = "order-service", provider = "inventory-service")
public RequestResponsePact inventoryPact(PactDslWithProvider builder) {
    return builder
        .given("item 42 is in stock")
        .uponReceiving("a request for item 42's stock level")
        .path("/inventory/42")
        .method("GET")
        .willRespondWith()
        .status(200)
        .body("{ \\"itemId\\": 42, \\"quantity\\": 10 }")
        .toPact();
}
// NOTE: illustrative contract-testing structure, not runnable as-is`
                ]
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why are full end-to-end tests risky to rely on heavily in microservices?</td><td>They're slow to run, brittle (any dependent service's flakiness fails the test), and hard to debug since a failure could originate in any of many services</td></tr>
<tr class='text-center'><td>What does contract testing verify that integration testing doesn't?</td><td>That two independently-deployed services still agree on their API contract, without needing to actually run both together</td></tr>
<tr class='text-center'><td>Where does a Pact-style contract test run?</td><td>The consumer generates the contract; the provider replays and verifies it against their own service independently in their own CI pipeline</td></tr>
</table>`
              }
            ]
          },

          // ----- Deployment Strategies -----
          {
            id: 'deployment-strategies',
            name: 'Microservices Deployment Strategies',
            beginner: [
              {
                content: `<h3>Rolling Deployment</h3>
Replaces old-version instances with new-version instances <strong>gradually, a few at a time</strong>, so the service never has zero running instances.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">[v1][v1][v1][v1]   start: 4 old instances
[v2][v1][v1][v1]   replace one at a time...
[v2][v2][v1][v1]
[v2][v2][v2][v1]
[v2][v2][v2][v2]   done: all new</pre>
This is Kubernetes' <strong>default</strong> Deployment update strategy. Low infrastructure cost, but if v2 has a bug, some real users hit it before you notice and roll back.<br>`
              },
              {
                content: `<h4>Blue-Green Deployment</h4>
Run <strong>two complete environments</strong> - "blue" (current live version) and "green" (new version) - side by side. Once green is fully tested, switch <strong>all</strong> traffic to it at once (usually by repointing a load balancer/router).<br>
<br>
• Rollback is instant - just switch traffic back to blue.<br>
• Costs roughly 2x the infrastructure while both environments exist.<br>`
              },
              {
                content: `<h4>Canary Deployment</h4>
Route a <strong>small percentage</strong> of real traffic (e.g. 5%) to the new version while the rest keeps hitting the old version, then gradually increase the percentage as confidence grows.<br>
<br>
• Limits the "blast radius" of a bad release to a small fraction of users.<br>
• Requires good monitoring to actually detect problems in that 5% before rolling further.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Comparing the Three Strategies</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Strategy</th><th>Downtime Risk</th><th>Infra Cost</th><th>Rollback Speed</th><th>K8s Primitive</th></tr>
<tr class='text-center'><td>Rolling</td><td>Low</td><td>Low (no duplicate env)</td><td>Slow (roll forward/back gradually)</td><td>Deployment (default strategy)</td></tr>
<tr class='text-center'><td>Blue-Green</td><td>Very low</td><td>High (2x during switch)</td><td>Instant (repoint traffic)</td><td>Two Deployments + Service switch</td></tr>
<tr class='text-center'><td>Canary</td><td>Very low</td><td>Moderate</td><td>Fast (shift traffic weight back)</td><td>Service mesh traffic splitting, or Ingress weight rules</td></tr>
</table>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the main tradeoff of blue-green deployment?</td><td>Very fast, safe rollback since it's just a traffic switch, but at the cost of running two full environments simultaneously</td></tr>
<tr class='text-center'><td>Why is canary deployment considered lower-risk than rolling?</td><td>It exposes the new version to only a small, controlled percentage of real traffic first, limiting how many users are affected if there's a problem, before rolling out further</td></tr>
</table>`
              }
            ]
          },

          // ----- Twelve-Factor App -----
          {
            id: 'twelve-factor-app',
            name: 'The Twelve-Factor App',
            beginner: [
              {
                content: `<h3>What Is the Twelve-Factor App?</h3>
The <strong>Twelve-Factor App</strong> is a methodology (originating from Heroku) describing best practices for building software-as-a-service applications that are portable, scalable, and suited to modern cloud/container deployment - it's a foundational influence on how cloud-native and microservices applications are designed today.<br>`
              },
              {
                content: `<h4>The 12 Factors, Briefly</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>#</th><th>Factor</th><th>Idea</th></tr>
<tr class='text-center'><td>1</td><td>Codebase</td><td>One codebase tracked in version control, many deploys</td></tr>
<tr class='text-center'><td>2</td><td>Dependencies</td><td>Explicitly declare and isolate dependencies (no relying on system-wide packages)</td></tr>
<tr class='text-center'><td>3</td><td>Config</td><td>Store config in the environment, not in code</td></tr>
<tr class='text-center'><td>4</td><td>Backing Services</td><td>Treat databases/queues/etc. as attached resources, swappable via config</td></tr>
<tr class='text-center'><td>5</td><td>Build, Release, Run</td><td>Strictly separate the build, release, and run stages</td></tr>
<tr class='text-center'><td>6</td><td>Processes</td><td>Execute the app as one or more stateless processes</td></tr>
<tr class='text-center'><td>7</td><td>Port Binding</td><td>Export services via port binding, not relying on a runtime-injected web server</td></tr>
<tr class='text-center'><td>8</td><td>Concurrency</td><td>Scale out via the process model (run more instances), not by making one process bigger</td></tr>
<tr class='text-center'><td>9</td><td>Disposability</td><td>Fast startup and graceful shutdown maximize robustness</td></tr>
<tr class='text-center'><td>10</td><td>Dev/Prod Parity</td><td>Keep development, staging, and production as similar as possible</td></tr>
<tr class='text-center'><td>11</td><td>Logs</td><td>Treat logs as event streams, don't manage log files yourself</td></tr>
<tr class='text-center'><td>12</td><td>Admin Processes</td><td>Run admin/management tasks as one-off processes in the same environment</td></tr>
</table>`
              }
            ],
            expert: [
              {
                content: `<h3>Why This Methodology Underpins Cloud-Native Design</h3>
• Factor 3 (<strong>Config</strong>) is exactly the <strong>Externalized Configuration Pattern</strong> covered in the Cloud-Native Patterns course - Spring Boot's <code>application.yml</code> + environment-variable overrides is a direct, practical implementation of this factor.<br>
• Factor 6 (<strong>stateless processes</strong>) is precisely why Kubernetes can freely kill and recreate Pods without losing anything important - state belongs in a backing service (a database), never in the process's own memory.<br>
• Factor 9 (<strong>disposability</strong>) directly maps to Kubernetes' readiness/liveness probes and rolling deployments - a service that can't start/stop quickly and cleanly breaks orchestration.<br>
• Factor 11 (<strong>logs as event streams</strong>) is the reasoning behind centralized logging (ELK/EFK) rather than services managing their own log files on disk, which vanish the moment a container is destroyed.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does the Twelve-Factor App insist on statelessness?</td><td>Stateless processes can be freely killed, restarted, and scaled by an orchestrator without any risk of losing data, since all real state lives in a backing service</td></tr>
<tr class='text-center'><td>How does Factor 3 (Config) relate to a container image?</td><td>The same built container image should be deployable to dev/staging/prod unchanged - only its externally-injected configuration differs between environments</td></tr>
</table>`
              }
            ]
          },

          // ----- Observability Basics -----
          {
            id: 'observability-basics',
            name: 'Monitoring and Observability Fundamentals',
            beginner: [
              {
                content: `<h3>Why Observability Matters More in Microservices</h3>
In a monolith, a slow request means looking in one place - the monolith's own logs and stack traces. In a microservices system, a single user request might pass through <strong>a dozen services</strong> before returning a response - if it's slow or fails, which service is actually responsible?<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Client -> API Gateway -> Order Service -> Inventory Service -> Payment Service -> ...
                                              ^
                              which one is actually slow? without observability, you're guessing.</pre>`
              },
              {
                content: `<h4>The Three Pillars of Observability</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pillar</th><th>Answers</th><th>Example Tooling</th></tr>
<tr class='text-center'><td>Logs</td><td>What exactly happened, in detail, at a point in time?</td><td>ELK/EFK stack</td></tr>
<tr class='text-center'><td>Metrics</td><td>How is the system behaving in aggregate, over time? (latency, error rate, throughput)</td><td>Prometheus + Grafana</td></tr>
<tr class='text-center'><td>Traces</td><td>What path did one specific request take across services, and where did time go?</td><td>Spring Cloud Sleuth, Zipkin, Jaeger</td></tr>
</table>
<br>
These three pillars are covered in much greater practical depth as <strong>Centralized Logging</strong> and <strong>Distributed Tracing</strong> in the Cloud-Native Patterns course - this topic exists to tie them together conceptually as one overall observability strategy, not to duplicate that depth.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Logs, Metrics, and Traces Are Complementary, Not Redundant</h3>
A typical debugging flow uses all three together: a <strong>metric</strong> dashboard shows latency spiked at 2:15pm → a <strong>trace</strong> for a slow request in that window shows most of the time was spent in the Inventory Service call → the Inventory Service's <strong>logs</strong> at that exact timestamp reveal it was retrying a failed database connection.<br>
<br>
None of the three alone tells the full story - metrics tell you <em>something</em> is wrong and roughly when, traces tell you <em>where</em> in the call chain, and logs tell you <em>why</em>.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is observability a bigger deal for microservices than monoliths?</td><td>A single request in a monolith stays in one process, but in microservices it crosses many services - you need dedicated tooling (traces) just to see the path a request took</td></tr>
<tr class='text-center'><td>What's the difference between a metric and a trace?</td><td>A metric is an aggregate number over time (e.g. average latency across all requests); a trace follows one specific request's journey across every service it touched</td></tr>
</table>`
              }
            ]
          }

        ]
      }
    ],
    cheatNotes: [
      'Database-per-service: never let two microservices share the same database directly',
      'Pod = smallest deployable unit; Deployment = manages replicas of Pods; Service = stable network endpoint',
      'JWT lets any service verify a client\'s identity without a round-trip to a central auth server',
      'mTLS + service mesh secures service-to-service calls, separate from client-facing auth',
      'Contract testing (Pact) verifies API compatibility between services without full end-to-end deployment',
      'Canary deployment limits blast radius by routing only a small % of traffic to a new version first',
      'Twelve-Factor App: config in the environment, processes stateless, logs as event streams'
    ],
    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'Why can\'t two microservices share the same database?',
          'What is the difference between a Kubernetes Pod, Deployment, and Service?',
          'How would you secure service-to-service communication inside a cluster?',
          'What is contract testing and why is it useful for microservices?',
          'Compare rolling, blue-green, and canary deployment strategies.',
          'What are the Twelve-Factor App principles and why do they matter for cloud-native apps?',
          'What are the three pillars of observability?',
          'Why is distributed tracing necessary in a microservices architecture?',
          'How does Kubernetes achieve zero-downtime deployments?',
          'What challenges does eventual consistency create for a distributed system?'
        ]
      }
    ]
  }
];
