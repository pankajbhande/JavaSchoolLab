// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const microservicesPatternsPart2: Course[] = [
  {
    id: 'microservices-patterns-2',
    name: 'Microservices Design Patterns (Advanced)',
    icon: 'Boxes',
    subTopics: [
      {
        id: 'microservices-patterns-advanced',
        name: 'Advanced Microservices Patterns',
        topics: [

          // ----- Event Sourcing -----
          {
            id: 'event-sourcing-pattern',
            name: 'Event Sourcing Pattern',
            beginner: [
              {
                content: `<h3>What is Event Sourcing?</h3>
<strong>Event Sourcing</strong> is a pattern where, instead of storing just the current state of an entity in a database, you store the full sequence of <strong>immutable events</strong> that led to that state. The current state is derived by <strong>replaying</strong> those events from the beginning (or from a snapshot).<br>
<br>
<h4>Traditional Storage vs Event Sourcing</h4>
<br>
• <strong>Traditional (CRUD):</strong> A row is updated in place - the history of how it got there is lost.<br>
• <strong>Event Sourcing:</strong> Every change (OrderCreated, OrderPaid, OrderShipped) is appended as an event - the current state is a "projection" computed from all events.<br>
<br>
<h4>Why Use Event Sourcing?</h4>
<br>
• <strong>Full audit trail</strong> - every state change is recorded, nothing is ever silently overwritten.<br>
• <strong>Temporal queries</strong> - you can reconstruct what the state looked like at any point in time by replaying events up to that point.<br>
• <strong>Natural fit with event-driven microservices</strong> - the events that changed state are exactly what other services want to react to.<br>`,
                codeExamples: [
                  `import java.util.*;

// Illustrative example: rebuilding an account balance by replaying events
abstract class AccountEvent { }
class Deposited extends AccountEvent { double amount; Deposited(double a) { amount = a; } }
class Withdrawn extends AccountEvent { double amount; Withdrawn(double a) { amount = a; } }

public class EventSourcingDemo {
    public static void main(String[] args) {
        List<AccountEvent> events = new ArrayList<>();
        events.add(new Deposited(100));
        events.add(new Deposited(50));
        events.add(new Withdrawn(30));

        // Rebuild current balance by replaying events - this is the "projection"
        double balance = 0;
        for (AccountEvent e : events) {
            if (e instanceof Deposited d) balance += d.amount;
            else if (e instanceof Withdrawn w) balance -= w.amount;
        }

        System.out.println("Balance rebuilt from " + events.size() + " events: " + balance);
    }
}
// OUTPUT:
// Balance rebuilt from 3 events: 120.0`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Costs and Snapshots</h3>
Event Sourcing isn't free:<br>
<br>
• <strong>Complexity</strong> - querying "current state" requires replaying events (or maintaining a separate read model, see CQRS), which is more work than a simple SELECT.<br>
• <strong>Eventual consistency</strong> - if projections are built asynchronously, readers may briefly see stale state.<br>
• <strong>Event schema evolution</strong> - old events must remain readable/interpretable even as the event schema evolves over years.<br>
<br>
<h4>Snapshots</h4>
For an entity with thousands of events, replaying all of them on every read is slow. A <strong>snapshot</strong> periodically saves the computed state at a point in time, so replay only needs to start from the last snapshot plus the events after it - not from the beginning.<br>
<br>
Event Sourcing pairs naturally with <strong>CQRS</strong> (separate read/write models) since the event stream is the write model, and one or more projections built from it serve as read models.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does Event Sourcing store, instead of current state?</td><td>An append-only, immutable sequence of events describing every change that ever happened</td></tr>
<tr class='text-center'><td>How is "current state" obtained?</td><td>By replaying all events for that entity (optionally starting from a saved snapshot)</td></tr>
<tr class='text-center'><td>What is a snapshot used for?</td><td>To avoid replaying an entity's entire event history on every read, by periodically caching a computed state</td></tr>
<tr class='text-center'><td>What pattern does Event Sourcing commonly pair with?</td><td>CQRS - the event stream serves as the write model, separate projections serve as read models</td></tr>
</table>`
              }
            ]
          },

          // ----- Strangler Fig -----
          {
            id: 'strangler-fig-pattern',
            name: 'Strangler Fig Pattern',
            beginner: [
              {
                content: `<h3>What is the Strangler Fig Pattern?</h3>
Named after the strangler fig vine, which grows around a host tree and gradually replaces it - the <strong>Strangler Fig Pattern</strong> is a strategy for incrementally migrating a legacy monolith to microservices <strong>without a risky "big bang" rewrite</strong>.<br>
<br>
<h4>How It Works</h4>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Step 1: Client --> [Facade/Router] --> Legacy Monolith (handles everything)

Step 2: Client --> [Facade/Router] --> New "Orders" microservice (feature migrated)
                          |
                          --> Legacy Monolith (handles everything else)

Step 3 (repeat per feature)... until:

Step N: Client --> [Facade/Router] --> All traffic now goes to new microservices
                                        Legacy Monolith retired</pre>
A routing layer (often the API Gateway) sits in front of both systems and directs each request to either the new microservice (if that feature has been migrated) or the old monolith (if it hasn't yet). Feature by feature, traffic is "strangled" away from the monolith until nothing depends on it and it can be safely decommissioned.<br>
<br>
<h4>Why Not Just Rewrite Everything at Once?</h4>
<br>
• A big-bang rewrite risks a long period with no new features shipping, and a single high-stakes cutover where anything can go wrong.<br>
• Strangler Fig lets you migrate and validate one feature at a time, with the old system as a safety net throughout.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Practical Considerations</h3>
• <strong>Data synchronization</strong> - during the transition, both the legacy system and new services may need access to the same data, requiring careful synchronization or a shared database temporarily.<br>
• <strong>Routing rules get complex</strong> - as more features migrate, the router's rules (by URL path, by feature flag, by user segment) need careful management.<br>
• <strong>Know when to stop</strong> - some legacy functionality may never be worth migrating; the goal is de-risking migration, not migrating 100% of everything unconditionally.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Strangler Fig solve?</td><td>The risk of a single, all-at-once "big bang" rewrite when migrating a legacy system to microservices</td></tr>
<tr class='text-center'><td>What component typically does the routing?</td><td>A facade or API Gateway that directs each request to the new service (if migrated) or the legacy monolith (if not)</td></tr>
<tr class='text-center'><td>What's a key risk during the transition period?</td><td>Keeping data consistent between the legacy system and new services while both are still partially in use</td></tr>
</table>`
              }
            ]
          },

          // ----- Sidecar -----
          {
            id: 'sidecar-pattern',
            name: 'Sidecar Pattern',
            beginner: [
              {
                content: `<h3>What is the Sidecar Pattern?</h3>
The <strong>Sidecar Pattern</strong> deploys a helper component alongside a main service - in the same deployment unit (same pod in Kubernetes, or same host) - to handle cross-cutting concerns like logging, monitoring, proxying, or security, <strong>without modifying the main service's own code</strong>.<br>
<br>
Just like a motorcycle sidecar travels attached to the motorcycle, sharing its journey but staying a separate compartment, a sidecar container runs next to the main application container, sharing its lifecycle (deployed/scaled/removed together) but staying independently deployable/upgradable.<br>
<br>
<h4>Common Sidecar Responsibilities</h4>
<br>
• <strong>Network proxying</strong> - intercepting inbound/outbound traffic (this is exactly how a service mesh's data plane works).<br>
• <strong>Logging/metrics collection</strong> - shipping logs or metrics off the main container without the app needing a logging library baked in.<br>
• <strong>Configuration/secrets fetching</strong> - pulling config or secrets and exposing them locally to the main app.<br>
• <strong>TLS termination</strong> - handling encryption so the main service can speak plain HTTP internally.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Sidecar and Service Mesh</h3>
The most common real-world use of the Sidecar Pattern today is as the <strong>data plane</strong> of a service mesh (e.g. Istio with the Envoy proxy). Every service gets an Envoy sidecar; all inbound/outbound traffic passes through it, so the mesh can uniformly apply retries, circuit breaking, mTLS, and observability - <strong>without any of that logic living in the application code itself</strong>.<br>
<br>
<h4>Trade-offs</h4>
<br>
• <strong>Added latency</strong> - every network hop now goes through an extra proxy.<br>
• <strong>Added resource overhead</strong> - each pod runs (at least) two containers instead of one.<br>
• <strong>Operational complexity</strong> - sidecars themselves need to be deployed, versioned, and monitored.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a sidecar, structurally?</td><td>A helper container/process deployed alongside the main service, sharing its lifecycle but running as a separate process</td></tr>
<tr class='text-center'><td>What's the most common production use of the Sidecar Pattern?</td><td>As the data-plane proxy (e.g. Envoy) in a service mesh, handling traffic/security/observability uniformly across services</td></tr>
<tr class='text-center'><td>What's a downside of the Sidecar Pattern?</td><td>Extra latency (one more network hop) and extra resource overhead (an additional container per instance)</td></tr>
</table>`
              }
            ]
          },

          // ----- Aggregator (Microservices) -----
          {
            id: 'ms-aggregator-pattern',
            name: 'Aggregator Pattern (Microservices)',
            beginner: [
              {
                content: `<h3>What is the Aggregator Pattern?</h3>
In a microservices architecture, a single client-facing feature often needs data from <strong>multiple</strong> backend services. The <strong>Aggregator Pattern</strong> introduces a dedicated component that calls those services (often in parallel), combines their responses, and returns one unified result to the client - so the client doesn't need to know about or call multiple services itself.<br>
<br>
<h4>Example: A Product Page</h4>
A product detail page might need: product info from a Catalog service, price/discounts from a Pricing service, and stock levels from an Inventory service. Without an aggregator, the client (a mobile app, say) would need to make 3 separate calls and stitch the results together itself.<br>`,
                codeExamples: [
                  `import java.util.concurrent.*;

// Illustrative: aggregating 3 "service calls" in parallel
public class AggregatorDemo {
    static String getProductInfo() { return "Wireless Mouse"; }
    static double getPrice() { return 799.0; }
    static int getStock() { return 42; }

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(3);

        Future<String> nameFuture = pool.submit(AggregatorDemo::getProductInfo);
        Future<Double> priceFuture = pool.submit(AggregatorDemo::getPrice);
        Future<Integer> stockFuture = pool.submit(AggregatorDemo::getStock);

        String name = nameFuture.get();
        double price = priceFuture.get();
        int stock = stockFuture.get();

        System.out.println("Aggregated response -> " + name + ", price=" + price + ", stock=" + stock);
        pool.shutdown();
    }
}
// OUTPUT:
// Aggregated response -> Wireless Mouse, price=799.0, stock=42`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Where the Aggregator Lives</h3>
The aggregator can be implemented as: a dedicated "aggregator service", logic inside an API Gateway, or a Backend for Frontend (BFF) tailored to one client type. Calling downstream services <strong>in parallel</strong> (rather than sequentially) is usually critical for acceptable latency - the aggregator's total response time is roughly the slowest single downstream call, not the sum of all of them.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does the Aggregator Pattern solve?</td><td>Avoiding forcing the client to call multiple backend services itself and stitch together the results</td></tr>
<tr class='text-center'><td>Why call downstream services in parallel rather than sequentially?</td><td>So total latency is close to the slowest single call, instead of the sum of all calls</td></tr>
<tr class='text-center'><td>Where is an aggregator commonly implemented?</td><td>As a dedicated aggregator service, inside an API Gateway, or as part of a Backend for Frontend (BFF)</td></tr>
</table>`
              }
            ]
          },

          // ----- Backend for Frontend (BFF) -----
          {
            id: 'bff-pattern',
            name: 'Backend for Frontend (BFF) Pattern',
            beginner: [
              {
                content: `<h3>What is the Backend for Frontend (BFF) Pattern?</h3>
Different client types (a web app, an iOS app, an Android app) often have very different needs - different data shapes, different amounts of data (a mobile app wants a lean payload, a web dashboard wants everything), different interaction patterns. The <strong>BFF Pattern</strong> gives each client type its <strong>own dedicated backend</strong>, tailored specifically to that client, instead of one generic API trying to satisfy every client equally well (and usually satisfying none of them well).<br>
<br>
<h4>Without BFF vs With BFF</h4>
<br>
• <strong>Without BFF:</strong> One shared API serves web, mobile, and third-party partners - it either over-fetches for mobile or under-fetches for web, and any client-specific change risks breaking other clients.<br>
• <strong>With BFF:</strong> Each client talks to its own BFF (Web BFF, Mobile BFF), which in turn calls the shared backend microservices and shapes the response specifically for that client.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Trade-offs</h3>
• <strong>Benefit:</strong> each client team can evolve its BFF independently, optimized exactly for that client's needs, without waiting on or breaking other clients.<br>
• <strong>Cost:</strong> more services to build, deploy, and maintain - some logic may end up duplicated across BFFs unless carefully factored into shared libraries or the underlying microservices.<br>
<br>
BFF is essentially a specialized case of the Aggregator Pattern - a BFF <em>is</em> an aggregator, just one scoped and owned per client type rather than shared generically.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does BFF solve?</td><td>A single generic API trying to serve very different client types (web, mobile) well, and generally serving none of them well</td></tr>
<tr class='text-center'><td>How does BFF relate to the Aggregator Pattern?</td><td>A BFF is effectively an aggregator scoped to one specific client type instead of shared across all clients</td></tr>
<tr class='text-center'><td>What's a downside of BFF?</td><td>More services to maintain, with risk of logic duplication across the different BFFs</td></tr>
</table>`
              }
            ]
          },

          // ----- Event-Driven Communication -----
          {
            id: 'event-driven-pattern',
            name: 'Event-Driven Communication Pattern',
            beginner: [
              {
                content: `<h3>What is Event-Driven Communication?</h3>
Instead of Service A calling Service B directly (synchronous request/response), <strong>Event-Driven Communication</strong> has Service A publish an <strong>event</strong> ("OrderPlaced") to a broker (Kafka, RabbitMQ), and any number of interested services subscribe to and react to that event independently. The producer doesn't know or care who (if anyone) is listening.<br>
<br>
<h4>Synchronous (Direct Call) vs Event-Driven</h4>
<br>
• <strong>Synchronous:</strong> Order service directly calls Inventory service, Payment service, Notification service - one by one, waiting for each - tightly coupled, and if one is down, the whole flow can fail.<br>
• <strong>Event-Driven:</strong> Order service publishes "OrderPlaced" once - Inventory, Payment, and Notification services each independently subscribe and react whenever they're ready. Adding a new subscriber later requires zero changes to the Order service.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Benefits and Trade-offs</h3>
• <strong>Loose coupling</strong> - producers and consumers don't know about each other, only about the event/broker.<br>
• <strong>Independent scaling and failure isolation</strong> - a slow or down consumer doesn't block the producer.<br>
• <strong>Trade-off: eventual consistency</strong> - there's a delay between an event being published and all consumers processing it; the system is not instantly consistent everywhere.<br>
• <strong>Trade-off: harder to trace</strong> - following a business flow across many independently-reacting consumers needs good distributed tracing/observability.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does event-driven communication differ from a direct service call?</td><td>The producer publishes an event to a broker without knowing who (if anyone) consumes it, instead of calling a specific service and waiting for its response</td></tr>
<tr class='text-center'><td>What's the main trade-off of going event-driven?</td><td>Eventual consistency - consumers process events with some delay rather than the system being instantly consistent everywhere</td></tr>
<tr class='text-center'><td>Why is event-driven communication good for adding new features?</td><td>A new consumer can subscribe to an existing event stream without requiring any change to the producer</td></tr>
</table>`
              }
            ]
          },

          // ----- Outbox -----
          {
            id: 'outbox-pattern',
            name: 'Outbox Pattern',
            beginner: [
              {
                content: `<h3>The Dual-Write Problem</h3>
Imagine a service that, in one operation, needs to (1) save an order to its database AND (2) publish an "OrderPlaced" event to a message broker. These are <strong>two separate systems</strong> - if the database write succeeds but publishing the event fails (network blip, broker down), the order exists but nobody was ever notified. This inconsistency is the <strong>dual-write problem</strong>.<br>
<br>
<h3>What is the Outbox Pattern?</h3>
The <strong>Outbox Pattern</strong> solves this by writing the event into an <strong>"outbox" table in the SAME database transaction</strong> as the business data change - so either both are saved together, or neither is (standard single-database transaction guarantees). A separate process then reads unpublished rows from the outbox table and publishes them to the broker, marking them as sent.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Single DB Transaction:
  1. INSERT INTO orders (...)
  2. INSERT INTO outbox (event_type, payload, sent=false)
  COMMIT  <-- both rows saved together, or neither is

Separate Relay Process:
  SELECT * FROM outbox WHERE sent = false
  -> publish each to Kafka/RabbitMQ
  -> UPDATE outbox SET sent = true</pre>`
              }
            ],
            expert: [
              {
                content: `<h3>How the Relay Reads the Outbox</h3>
Two common approaches for the relay process:<br>
<br>
• <strong>Polling publisher</strong> - a background job periodically queries the outbox table for unsent rows and publishes them.<br>
• <strong>Change Data Capture (CDC)</strong> - a tool like Debezium tails the database's write-ahead log/binlog and streams new outbox rows to the broker automatically, with lower latency than polling.<br>
<br>
The outbox table itself typically gets cleaned up (rows deleted or archived) after successful publishing, so it doesn't grow unbounded.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the dual-write problem?</td><td>When a service must atomically update its database AND publish a message, but these are two separate systems that can't share one transaction, risking inconsistency if one succeeds and the other fails</td></tr>
<tr class='text-center'><td>How does the Outbox Pattern solve it?</td><td>By writing the event into an outbox table in the SAME local database transaction as the business change, then a separate relay process publishes from the outbox to the broker</td></tr>
<tr class='text-center'><td>What's a common way to implement the relay process?</td><td>Either a polling job that queries unsent outbox rows, or Change Data Capture (e.g. Debezium) tailing the database log</td></tr>
</table>`
              }
            ]
          },

          // ----- Distributed Lock -----
          {
            id: 'distributed-lock-pattern',
            name: 'Distributed Lock Pattern',
            beginner: [
              {
                content: `<h3>What is a Distributed Lock?</h3>
A regular Java <code>synchronized</code> block or <code>ReentrantLock</code> only coordinates threads <strong>within a single JVM process</strong>. When multiple <strong>separate service instances</strong> (potentially on different machines) need exclusive access to a shared resource - like ensuring only one instance processes a given scheduled job, or only one instance updates a shared record at a time - you need a <strong>distributed lock</strong>: a lock that's visible and enforced across process/machine boundaries, typically implemented using a shared external system like Redis, ZooKeeper, or the database itself.<br>
<br>
<h4>A Simple Redis-Based Lock (Conceptual)</h4>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">SET lock:job-123 my-instance-id NX PX 30000
  NX  -> only set if the key doesn't already exist (acquire only if free)
  PX 30000 -> auto-expire after 30 seconds (safety net if the holder crashes)

... do the exclusive work ...

DEL lock:job-123   (release the lock, only if we still own it)</pre>`
              }
            ],
            expert: [
              {
                content: `<h3>The Hard Part: Correctness Under Failure</h3>
Distributed locks are notoriously easy to get subtly wrong:<br>
<br>
• <strong>Clock skew</strong> - lock expiry times rely on clocks; if a node's clock is off, it might believe it still holds a lock that has actually expired elsewhere.<br>
• <strong>"Still running but lock expired" race</strong> - if the lock auto-expires (as a crash safety net) while the original holder is still slow-but-alive, ANOTHER process can now acquire the lock, and you end up with two processes both believing they hold exclusive access.<br>
• <strong>Redlock debate</strong> - Redis's official multi-node "Redlock" algorithm for stronger distributed-lock guarantees is genuinely contested in the distributed-systems community (notably criticized by Martin Kleppmann) for not being safe under certain failure/GC-pause scenarios - know that this is a real, debated trade-off, not a solved problem.<br>
• <strong>Fencing tokens</strong> - a mitigation: the lock issues a monotonically increasing token on each acquisition; the protected resource rejects any write carrying an older token than the last one it saw, protecting against a "zombie" holder that thinks it still owns the lock.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't a plain Java ReentrantLock coordinate across service instances?</td><td>It only exists within one JVM process's memory - separate instances (possibly on different machines) have no visibility into it</td></tr>
<tr class='text-center'><td>Why does a distributed lock usually have an expiry/TTL?</td><td>As a safety net so the lock is eventually released automatically if the holder crashes without releasing it, preventing a permanent deadlock</td></tr>
<tr class='text-center'><td>What risk does a TTL-based lock introduce?</td><td>If the holder is still working but slow, the lock can expire and be acquired by another process too early, causing two processes to believe they have exclusive access</td></tr>
<tr class='text-center'><td>What is a fencing token?</td><td>A monotonically increasing number issued on each lock acquisition, used by the protected resource to reject stale writes from a process that no longer actually holds the lock</td></tr>
</table>`
              }
            ]
          },

          // ----- Idempotency -----
          {
            id: 'idempotency-pattern',
            name: 'Idempotency Pattern',
            beginner: [
              {
                content: `<h3>What Does Idempotent Mean?</h3>
An operation is <strong>idempotent</strong> if calling it once has <strong>the exact same effect</strong> as calling it multiple times. This matters enormously in distributed systems because <strong>retries are unavoidable</strong> - a client may not know whether its request actually reached the server (the response was lost, not the request), so it retries "just in case" - and if the original request DID succeed, that retry must not cause a duplicate effect (e.g. charging a customer twice).<br>
<br>
<h4>Naturally Idempotent vs Not</h4>
<br>
• <strong>Idempotent by nature:</strong> <code>setBalance(100)</code> - calling it 5 times still leaves the balance at exactly 100.<br>
• <strong>NOT idempotent by nature:</strong> <code>addToBalance(100)</code> - calling it 5 times adds 500, not 100. A retried "add 100" could silently overcharge or overcredit.<br>
<br>
<h4>Idempotency Keys</h4>
The standard fix for a non-naturally-idempotent operation (like "place an order" or "charge a card") is an <strong>idempotency key</strong>: the client generates a unique key per logical request (e.g. a UUID) and sends it with every attempt (including retries). The server remembers which keys it has already processed and, on seeing a repeated key, returns the SAME result as before instead of performing the operation again.<br>`,
                codeExamples: [
                  `import java.util.*;

// Illustrative: server-side idempotency-key handling
public class IdempotencyDemo {
    static Map<String, String> processedRequests = new HashMap<>();

    static String chargeCard(String idempotencyKey, double amount) {
        if (processedRequests.containsKey(idempotencyKey)) {
            return "DUPLICATE - returning original result: " + processedRequests.get(idempotencyKey);
        }
        String result = "Charged $" + amount + " successfully";
        processedRequests.put(idempotencyKey, result);
        return result;
    }

    public static void main(String[] args) {
        String key = "req-001";
        System.out.println(chargeCard(key, 49.99));  // first attempt: actually charges
        System.out.println(chargeCard(key, 49.99));  // retry with same key: no double charge
    }
}
// OUTPUT:
// Charged $49.99 successfully
// DUPLICATE - returning original result: Charged $49.99 successfully`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Where Idempotency Matters in Microservices</h3>
• <strong>Payment/order APIs</strong> - the classic case; a lost response must never mean "charge twice".<br>
• <strong>Message consumers</strong> - most message brokers offer "at-least-once" delivery, meaning a consumer MUST be written to handle receiving the same message more than once without double-processing it.<br>
• <strong>Retry logic</strong> (see the Retry Pattern) - retries are only safe to apply automatically/transparently when the underlying operation is idempotent; otherwise a well-intentioned retry can cause real harm.<br>
<br>
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does "idempotent" mean for an operation?</td><td>Calling it once has the same effect as calling it multiple times</td></tr>
<tr class='text-center'><td>Why does idempotency matter for retries?</td><td>Because a client can't always tell whether a failed-looking request actually succeeded server-side, so it must retry - and that retry must not double-apply the effect</td></tr>
<tr class='text-center'><td>What is an idempotency key?</td><td>A unique key the client attaches to every attempt of the same logical request, letting the server recognize and safely no-op a retry instead of repeating the operation</td></tr>
<tr class='text-center'><td>Give an example of an operation that is NOT naturally idempotent.</td><td>addToBalance(100) / incrementing a counter - repeating it changes the result each time, unlike setBalance(100) which is naturally idempotent</td></tr>
</table>`
              }
            ]
          }

        ]
      }
    ],
    cheatNotes: [
      'Event Sourcing: store events, not state - current state is a replay/projection of the event log',
      'Strangler Fig: migrate a monolith feature-by-feature behind a router, not in one big-bang rewrite',
      'Sidecar: a helper container next to the main service - the basis of a service mesh data plane (Envoy/Istio)',
      'Aggregator: combine multiple downstream calls (ideally in parallel) into one response for the client',
      'BFF: one backend per client type (web, mobile) instead of one generic API for everyone',
      'Outbox Pattern: write the event to an outbox table in the same DB transaction, relay it separately - solves the dual-write problem',
      'Distributed Lock: coordinates exclusive access ACROSS service instances (unlike a plain in-JVM lock) - watch out for TTL/clock-skew races',
      'Idempotency: retrying an idempotent operation is always safe - use idempotency keys for operations that aren\'t naturally idempotent'
    ],
    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'What is Event Sourcing and how do you rebuild current state from it?',
          'Why is a snapshot used alongside Event Sourcing?',
          'Explain the Strangler Fig Pattern and why it\'s preferred over a full rewrite.',
          'What cross-cutting concerns does a Sidecar typically handle?',
          'How does a Sidecar relate to a service mesh?',
          'What is the Aggregator Pattern, and why call downstream services in parallel?',
          'What problem does Backend for Frontend (BFF) solve, and how does it relate to the Aggregator Pattern?',
          'What is the dual-write problem, and how does the Outbox Pattern solve it?',
          'Why can\'t a normal Java lock coordinate access across multiple service instances?',
          'What is an idempotency key and why is it needed for retryable, non-idempotent operations?'
        ]
      }
    ]
  }
];
