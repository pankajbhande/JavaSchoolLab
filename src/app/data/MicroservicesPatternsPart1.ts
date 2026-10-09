// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const microservicesPatternsPart1: Course[] = [
  {
    id: 'microservices-patterns-1',
    name: 'Microservices Design Patterns',
    icon: 'Network',
    subTopics: [
      {
        id: 'microservices-patterns-core',
        name: 'Core Microservices Patterns',
        topics: [

          // ----- API Gateway -----
          {
            id: 'api-gateway-pattern',
            name: 'API Gateway Pattern',
            beginner: [
              {
                content: `<h3>The Problem</h3>
In a microservices architecture, one business application is broken into many small services - Order Service, Payment Service, Inventory Service, User Service, and so on.<br>
<br>
If a mobile app or web client had to call each of these services <strong>directly</strong>, it would need to know the address of every single service, handle authentication for each one separately, and make many round trips over the network just to render one screen. This makes the client heavy, slow, and tightly coupled to the internal structure of the backend.<br>
<br>
<h4>Real-Life Analogy</h4>
<br>
• Think of a big office building with 20 different departments (HR, Finance, IT, Legal).<br>
• Instead of a visitor wandering the building looking for each department, there is a <strong>reception desk</strong> at the entrance.<br>
• The receptionist routes the visitor to the correct department, checks their ID first, and keeps a log of who visited.<br>
• The API Gateway is exactly this receptionist for your microservices.<br>`
              },
              {
                content: `<h3>Simple Explanation</h3>
Instead of clients calling every microservice directly, all requests go through a single entry point called the <strong>API Gateway</strong>. The gateway then routes the request to the correct backend service.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">          Mobile / Web Client
                  |
                  v  (single entry point)
             API Gateway
        (auth, routing, rate limiting)
             /     |      \\
            v       v       v
       Order   Payment  Inventory
      Service  Service   Service</pre>
<br>
<h4>What the Gateway Typically Handles</h4>
<br>
• <strong>Routing</strong> - forwards <code>/orders/**</code> to Order Service, <code>/payments/**</code> to Payment Service.<br>
• <strong>Authentication / Authorization</strong> - validates a JWT token once at the edge.<br>
• <strong>Rate Limiting</strong> - prevents one client from overwhelming backend services.<br>
• <strong>Logging / Monitoring</strong> - one place to see all incoming traffic.<br>`
              },
              {
                content: `<h4>Basic Config Example (Spring Cloud Gateway)</h4>
A simple route says "any request starting with <code>/orders</code> should go to the Order Service." This is a configuration snippet (YAML), not a runnable Java program, so there's no console output to show.`,
                codeExamples: [
                  `spring:
  cloud:
    gateway:
      routes:
        - id: order-service-route
          uri: http://localhost:8081
          predicates:
            - Path=/orders/**
        - id: payment-service-route
          uri: http://localhost:8082
          predicates:
            - Path=/payments/**`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Failure Scenarios It Handles</h3>
<br>
• <strong>Client-service coupling explosion</strong> - without a gateway, every client (web, iOS, Android, partner API) must know the network location of every microservice. Any service being renamed, split, or moved breaks every client.<br>
• <strong>Cross-cutting concerns duplicated everywhere</strong> - without a gateway, auth, logging, and rate limiting logic gets copy-pasted into every microservice.<br>
• <strong>Chatty clients over slow networks</strong> - a mobile client on a weak network making 6 separate calls to render one screen is far slower than one aggregated call to the gateway.<br>
• <strong>Uncontrolled traffic spikes</strong> - a malicious or buggy client can hammer a single backend service directly if there is no central choke point to apply rate limits.<br>`
              },
              {
                content: `<h3>Architecture with Cross-Cutting Concerns (Illustrative Java Config)</h3>
This is a Spring Cloud Gateway Java-config route builder - illustrative of real production code, not something with a deterministic console output since it defines routing behavior for live HTTP traffic.`,
                codeExamples: [
                  `@Bean
public RouteLocator customRoutes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("order-service", r -> r.path("/orders/**")
            .filters(f -> f
                .stripPrefix(1)
                .circuitBreaker(c -> c.setName("orderCB").setFallbackUri("/fallback/orders"))
                .requestRateLimiter(rl -> rl.setRateLimiter(redisRateLimiter())))
            .uri("lb://ORDER-SERVICE"))
        .route("payment-service", r -> r.path("/payments/**")
            .filters(f -> f.stripPrefix(1))
            .uri("lb://PAYMENT-SERVICE"))
        .build();
}`
                ]
              },
              {
                content: `<h3>API Gateway vs Backend For Frontend (BFF)</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>API Gateway</th><th>BFF</th></tr>
<tr class='text-center'><td>Purpose</td><td>Single generic entry point for all clients</td><td>Dedicated gateway per client type</td></tr>
<tr class='text-center'><td>Response Shape</td><td>Usually same shape for all clients</td><td>Tailored per client (web vs mobile)</td></tr>
<tr class='text-center'><td>Ownership</td><td>Owned by a central platform team</td><td>Often owned by the frontend team</td></tr>
<tr class='text-center'><td>Best Fit</td><td>Uniform clients, simple routing needs</td><td>Very different clients with different data needs</td></tr>
</table>
<br>
<h4>Mitigating the Single-Point-of-Failure Risk</h4>
Because every request passes through it, the API Gateway can become a bottleneck if not designed carefully:<br>
• <strong>Horizontal scaling</strong> - run multiple gateway instances behind a load balancer, never a single node.<br>
• <strong>Statelessness</strong> - keep the gateway stateless so any instance can handle any request.<br>
• <strong>Circuit breakers, timeouts, and bulkheads</strong> - isolate a failing/slow downstream service so it doesn't take down the whole gateway.<br>
Real tools: Spring Cloud Gateway, Kong, AWS API Gateway, NGINX/Envoy.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why not let clients call microservices directly?</td><td>Tight coupling, duplicated cross-cutting logic, and chatty network calls from weak client connections</td></tr>
<tr class='text-center'><td>What does an API Gateway typically handle?</td><td>Routing, auth, rate limiting, logging, and request aggregation</td></tr>
<tr class='text-center'><td>How do you avoid the gateway being a single point of failure?</td><td>Scale horizontally, keep it stateless, and use circuit breakers/health checks</td></tr>
<tr class='text-center'><td>API Gateway vs Load Balancer?</td><td>A load balancer only distributes traffic; a gateway also does routing, auth, and transformation</td></tr>
<tr class='text-center'><td>API Gateway vs BFF?</td><td>Gateway is generic and shared; BFF is tailored per client type</td></tr>
<tr class='text-center'><td>Which Spring project implements an API Gateway?</td><td>Spring Cloud Gateway</td></tr>
</table>`
              }
            ]
          },

          // ----- Service Discovery -----
          {
            id: 'service-discovery-pattern',
            name: 'Service Discovery Pattern',
            beginner: [
              {
                content: `<h3>The Problem</h3>
In a microservices system, service instances come and go constantly - they scale up/down, crash and restart, or get redeployed with a new IP address. Hardcoding <code>http://192.168.1.5:8081</code> for the Order Service into every caller breaks the moment that instance moves.<br>
<br>
<h4>What is Service Discovery?</h4>
<br>
• A mechanism that lets services find each other's current network location <strong>dynamically</strong>, without hardcoded addresses.<br>
• A <strong>Service Registry</strong> (e.g. Eureka, Consul) keeps a live list of "service name -> healthy instance addresses."<br>
• Each service instance <strong>registers itself</strong> on startup and sends periodic heartbeats; instances that stop heartbeating are removed.<br>`
              },
              {
                content: `<h4>Client-Side vs Server-Side Discovery</h4>
<br>
• <strong>Client-Side Discovery</strong> - the calling service queries the registry itself, picks a healthy instance (often with load-balancing logic), and calls it directly. Netflix Eureka + Spring Cloud LoadBalancer works this way.<br>
• <strong>Server-Side Discovery</strong> - the caller sends the request to a fixed address (e.g. a load balancer or the API Gateway), and that intermediary looks up the registry and forwards the request. AWS ELB + ECS service discovery is an example.<br>`,
                codeExamples: [
                  `// Registering a Spring Boot service with Eureka - illustrative config, not runnable output
// application.yml
// eureka:
//   client:
//     serviceUrl:
//       defaultZone: http://localhost:8761/eureka/

@SpringBootApplication
@EnableDiscoveryClient
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

// Calling another service by its registered NAME, not a hardcoded IP:
@Autowired
private RestTemplate restTemplate; // built with @LoadBalanced

public String getInventory() {
    return restTemplate.getForObject("http://INVENTORY-SERVICE/api/stock", String.class);
}`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Registry High Availability and Self-Preservation</h3>
The registry itself must not be a single point of failure - Eureka servers replicate their registry to each other, so any Eureka node can answer lookups even if another node goes down.<br>
<br>
Eureka also has a <strong>self-preservation mode</strong>: if it sees too many instances failing to heartbeat at once (often a network partition, not real instance death), it stops evicting them - preferring stale-but-present data over incorrectly wiping the whole registry.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't you just hardcode IP addresses between microservices?</td><td>Instances scale, crash, and redeploy constantly, so a hardcoded address goes stale almost immediately</td></tr>
<tr class='text-center'><td>Client-side vs server-side discovery?</td><td>Client-side: caller queries the registry and picks an instance itself. Server-side: caller hits a fixed address and an intermediary does the lookup/forwarding</td></tr>
<tr class='text-center'><td>What is a heartbeat used for in service discovery?</td><td>Instances periodically ping the registry to prove they're alive; missed heartbeats trigger eviction from the registry</td></tr>
<tr class='text-center'><td>What is Eureka's self-preservation mode?</td><td>It stops evicting instances if too many heartbeats are missed at once, to avoid wiping the registry during a network partition rather than a real outage</td></tr>
<tr class='text-center'><td>Name two real service discovery tools</td><td>Netflix Eureka, HashiCorp Consul (Kubernetes' built-in DNS-based discovery is another common example)</td></tr>
</table>`
              }
            ]
          },

          // ----- Circuit Breaker -----
          {
            id: 'circuit-breaker-pattern',
            name: 'Circuit Breaker Pattern',
            beginner: [
              {
                content: `<h3>The Problem</h3>
If Service A calls a struggling Service B repeatedly, and each call takes 30 seconds to time out, Service A's own threads/resources get tied up waiting - and if many callers do this, the failure <strong>cascades</strong> across the whole system, even though only one service was actually unhealthy.<br>
<br>
<h4>What is a Circuit Breaker?</h4>
Just like an electrical circuit breaker trips to stop current flow when there's a fault, a software Circuit Breaker "trips" to stop calls to a failing dependency, failing fast instead of waiting on a doomed call and giving the failing service room to recover.<br>`
              },
              {
                content: `<h4>The Three States</h4>
<br>
• <strong>Closed</strong> - normal operation, calls pass through; the breaker counts failures.<br>
• <strong>Open</strong> - once failures cross a threshold, the breaker "opens" and calls fail immediately (or return a fallback) without even attempting the real call, for a configured wait duration.<br>
• <strong>Half-Open</strong> - after the wait duration, the breaker allows a small number of trial calls through; if they succeed, it closes again, if they fail, it re-opens.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">CLOSED --(failure threshold hit)--> OPEN
   ^                                    |
   |                          (wait duration elapses)
   |                                    v
   +----(trial calls succeed)---- HALF-OPEN
                                        |
                              (trial calls fail)
                                        v
                                      OPEN</pre>`
              },
              {
                content: `<h4>Resilience4j Circuit Breaker Example</h4>`,
                codeExamples: [
                  `@Service
public class InventoryClient {

    @CircuitBreaker(name = "inventoryService", fallbackMethod = "fallbackStock")
    public String getStock(String productId) {
        return restTemplate.getForObject(
            "http://INVENTORY-SERVICE/api/stock/" + productId, String.class);
    }

    // Called automatically when the circuit is OPEN or the real call fails
    public String fallbackStock(String productId, Throwable t) {
        return "Stock info temporarily unavailable, please try again shortly.";
    }
}

// application.yml
// resilience4j.circuitbreaker.instances.inventoryService:
//   failureRateThreshold: 50
//   waitDurationInOpenState: 10s
//   slidingWindowSize: 10`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Sliding Window and Failure Rate Threshold</h3>
Resilience4j doesn't count "last N failures ever" - it uses a <strong>sliding window</strong> (count-based or time-based) of the most recent calls, and opens the circuit once the failure rate within that window crosses the configured threshold (e.g. 50%). This avoids permanently tripping the breaker over one old failure that's no longer representative of the service's current health.<br>`
              },
              {
                content: `<h3>Circuit Breaker vs Retry - They Work Against Each Other Naively</h3>
Combining Retry and Circuit Breaker carelessly can backfire: if Retry keeps re-attempting a call that Circuit Breaker is trying to stop, you get MORE load on a struggling service, not less. The correct order is: Circuit Breaker wraps the Retry (or the breaker sits "outside" so once it's open, retries don't even get attempted) - most resilience libraries let you compose them explicitly in a defined order for exactly this reason.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does the Circuit Breaker pattern solve?</td><td>Cascading failures caused by callers repeatedly waiting on/retrying a struggling downstream dependency</td></tr>
<tr class='text-center'><td>Name the three circuit breaker states</td><td>Closed (normal), Open (fail fast), Half-Open (trial calls to test recovery)</td></tr>
<tr class='text-center'><td>What triggers a transition from Closed to Open?</td><td>The failure rate within the sliding window crosses the configured threshold</td></tr>
<tr class='text-center'><td>What happens during Half-Open?</td><td>A limited number of trial calls are allowed through; success closes the circuit again, failure re-opens it</td></tr>
<tr class='text-center'><td>Why can combining Retry and Circuit Breaker backfire?</td><td>Naive retries against an already-struggling service add more load; they must be composed so the breaker can stop retries once open</td></tr>
<tr class='text-center'><td>Name a Java library that implements this</td><td>Resilience4j (Netflix Hystrix is the older, now-legacy equivalent)</td></tr>
</table>`
              }
            ]
          },

          // ----- Retry -----
          {
            id: 'retry-pattern',
            name: 'Retry Pattern',
            beginner: [
              {
                content: `<h3>What is the Retry Pattern?</h3>
Many failures in distributed systems are <strong>transient</strong> - a momentary network blip, a service instance restarting, a brief spike in load. The Retry pattern automatically re-attempts a failed operation instead of failing immediately, on the assumption that the problem may already be gone by the next attempt.<br>
<br>
<h4>Why Backoff Matters</h4>
Retrying instantly and repeatedly (a "retry storm") can make things WORSE - it adds more load onto an already-struggling service right when it needs relief. The standard fix is <strong>exponential backoff</strong>: wait longer between each successive retry (e.g. 200ms, 400ms, 800ms...), often with a small random "jitter" added so many clients don't all retry in perfect lockstep.<br>`
              },
              {
                content: `<h4>Resilience4j Retry Example</h4>`,
                codeExamples: [
                  `@Service
public class PaymentClient {

    @Retry(name = "paymentService", fallbackMethod = "paymentFallback")
    public String processPayment(String orderId) {
        return restTemplate.postForObject(
            "http://PAYMENT-SERVICE/api/pay/" + orderId, null, String.class);
    }

    public String paymentFallback(String orderId, Throwable t) {
        return "Payment could not be processed after retries: " + orderId;
    }
}

// application.yml
// resilience4j.retry.instances.paymentService:
//   maxAttempts: 3
//   waitDuration: 500ms
//   enableExponentialBackoff: true
//   exponentialBackoffMultiplier: 2`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>When Retry Helps vs When It Makes Things Worse</h3>
<br>
• <strong>Helps</strong>: transient network glitches, a load balancer momentarily routing to a not-yet-ready instance, brief GC pauses.<br>
• <strong>Hurts</strong>: retrying a non-idempotent operation (e.g. "charge the card") can duplicate the side effect if the first attempt actually succeeded but the response was lost - retries should generally be limited to <strong>idempotent</strong> operations, or the operation should be made idempotent first (see the separate Idempotency pattern topic).<br>
• <strong>Hurts</strong>: retrying against a service that's failing because it's overloaded adds MORE load, worsening the outage - this is why Retry is almost always paired with a Circuit Breaker that eventually stops the retries altogether.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What kind of failures does Retry help with?</td><td>Transient failures - brief blips likely to have resolved by the next attempt</td></tr>
<tr class='text-center'><td>What is a "retry storm" and how do you avoid it?</td><td>Many clients retrying instantly and repeatedly, worsening an outage; avoided via exponential backoff plus jitter</td></tr>
<tr class='text-center'><td>Why is retrying a non-idempotent operation risky?</td><td>If the original call actually succeeded but the response was lost, a retry can duplicate the side effect (e.g. double-charging)</td></tr>
<tr class='text-center'><td>Why pair Retry with a Circuit Breaker?</td><td>So retries eventually stop entirely once a dependency is clearly unhealthy, instead of continuing to add load</td></tr>
</table>`
              }
            ]
          },

          // ----- Timeout -----
          {
            id: 'timeout-pattern',
            name: 'Timeout Pattern',
            beginner: [
              {
                content: `<h3>What is the Timeout Pattern?</h3>
A Timeout bounds how long a caller will wait for a response from a dependency before giving up and moving on (often to a fallback or an error). Without a timeout, a single slow dependency can hold a caller's thread/connection <strong>indefinitely</strong>, and that pileup can cascade into resource exhaustion across the whole call chain.<br>
<br>
<h4>Setting a Sensible Timeout</h4>
Too short: healthy-but-momentarily-slow calls get killed unnecessarily. Too long: the caller stays stuck for ages before giving up. A common practice is basing the timeout on the dependency's normal p99 latency plus some margin, not an arbitrary round number.<br>`,
                codeExamples: [
                  `// Setting connect/read timeouts on a RestTemplate
RestTemplate restTemplate = new RestTemplateBuilder()
    .setConnectTimeout(Duration.ofSeconds(2))
    .setReadTimeout(Duration.ofSeconds(3))
    .build();

// With Resilience4j's TimeLimiter:
@TimeLimiter(name = "inventoryService", fallbackMethod = "timeoutFallback")
public CompletableFuture<String> getStockAsync(String productId) {
    return CompletableFuture.supplyAsync(() ->
        restTemplate.getForObject("http://INVENTORY-SERVICE/api/stock/" + productId, String.class));
}

public CompletableFuture<String> timeoutFallback(String productId, Throwable t) {
    return CompletableFuture.completedFuture("Stock check timed out");
}`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Timeout Budgets Across a Call Chain</h3>
In a chain A -> B -> C -> D, each hop needs its OWN timeout, and they should be set so the sum doesn't exceed the caller's own deadline. If A's overall budget is 5 seconds but B, C, and D each independently allow up to 5 seconds, a slow D can still blow A's entire budget. Distributed tracing/deadline-propagation helps enforce a shrinking "time remaining" budget as a request flows deeper into the call chain.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is an unbounded call dangerous in a distributed system?</td><td>It can hold the caller's thread/connection indefinitely, and that pileup cascades into resource exhaustion up the call chain</td></tr>
<tr class='text-center'><td>How do you choose a timeout value?</td><td>Base it on the dependency's typical p99 latency plus margin, not an arbitrary guess</td></tr>
<tr class='text-center'><td>What's the risk of chained timeouts in a multi-hop call?</td><td>Each hop's independent timeout can sum to more than the original caller's overall deadline unless budgets are propagated/shrunk down the chain</td></tr>
</table>`
              }
            ]
          },

          // ----- Bulkhead -----
          {
            id: 'bulkhead-pattern',
            name: 'Bulkhead Pattern',
            beginner: [
              {
                content: `<h3>The Problem</h3>
If one service calls three downstream dependencies (Inventory, Payment, Shipping) using a SHARED thread pool, and Inventory starts responding very slowly, all the threads in that shared pool can end up stuck waiting on Inventory - leaving none available to handle Payment or Shipping calls either, even though those two dependencies are perfectly healthy.<br>
<br>
<h4>What is the Bulkhead Pattern?</h4>
Named after a ship's bulkheads - watertight compartments that stop one flooded section from sinking the whole ship. The software version isolates resources (thread pools, connection pools) <strong>per dependency</strong>, so one failing dependency can only exhaust ITS OWN allotted resources, not everyone else's.<br>`
              },
              {
                content: `<h4>Resilience4j Bulkhead Example</h4>`,
                codeExamples: [
                  `@Service
public class DownstreamClient {

    @Bulkhead(name = "inventoryService", type = Bulkhead.Type.THREADPOOL)
    public CompletableFuture<String> getStock(String productId) {
        return CompletableFuture.supplyAsync(() ->
            restTemplate.getForObject("http://INVENTORY-SERVICE/api/stock/" + productId, String.class));
    }
}

// application.yml
// resilience4j.thread-pool-bulkhead.instances.inventoryService:
//   maxThreadPoolSize: 10
//   coreThreadPoolSize: 5
//   queueCapacity: 20
// A separate, isolated pool would be configured for paymentService, shippingService, etc.`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Semaphore Bulkhead vs Thread-Pool Bulkhead</h3>
<br>
• <strong>Semaphore-based</strong> - limits the number of CONCURRENT calls allowed through using the caller's own thread, lower overhead but the caller's thread is still the one blocked during the call.<br>
• <strong>Thread-pool-based</strong> - runs each call on a dedicated, size-bounded thread pool, giving true isolation (the caller's own thread returns immediately) at the cost of extra context-switching overhead.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Bulkhead solve?</td><td>Prevents one failing/slow dependency from exhausting shared resources needed by calls to other, healthy dependencies</td></tr>
<tr class='text-center'><td>Where does the name "Bulkhead" come from?</td><td>A ship's watertight compartments, which stop one flooded section from sinking the whole vessel</td></tr>
<tr class='text-center'><td>Semaphore vs thread-pool bulkhead?</td><td>Semaphore limits concurrent calls on the caller's own thread (lighter); thread-pool isolates calls onto a dedicated pool (stronger isolation, more overhead)</td></tr>
<tr class='text-center'><td>How does Bulkhead relate to Circuit Breaker?</td><td>They're complementary - Bulkhead limits how much of a resource one dependency can consume, Circuit Breaker stops calling a dependency altogether once it's clearly unhealthy</td></tr>
</table>`
              }
            ]
          },

          // ----- Rate Limiting -----
          {
            id: 'rate-limiting-pattern',
            name: 'Rate Limiting Pattern',
            beginner: [
              {
                content: `<h3>What is Rate Limiting?</h3>
Rate Limiting controls HOW MANY requests a client (or a service) is allowed to make in a given time window, protecting a service from being overwhelmed - whether by a buggy retry loop, a traffic spike, or a malicious client.<br>
<br>
<h4>The Token Bucket Concept</h4>
A common algorithm: imagine a bucket that holds up to N tokens, refilled at a steady rate (e.g. 10 tokens/second). Every incoming request must take one token to proceed; if the bucket is empty, the request is rejected (or queued) until a token is available. This allows short bursts (up to the bucket size) while still enforcing a steady average rate.<br>`
              },
              {
                content: `<h4>Resilience4j Rate Limiter Example</h4>`,
                codeExamples: [
                  `@Service
public class SearchService {

    @RateLimiter(name = "searchApi", fallbackMethod = "rateLimitFallback")
    public String search(String query) {
        return doExpensiveSearch(query);
    }

    public String rateLimitFallback(String query, Throwable t) {
        return "Too many requests, please slow down.";
    }
}

// application.yml
// resilience4j.ratelimiter.instances.searchApi:
//   limitForPeriod: 10        # 10 requests
//   limitRefreshPeriod: 1s    # per second
//   timeoutDuration: 0`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Where to Apply Rate Limiting</h3>
<br>
• <strong>At the API Gateway</strong> - protects ALL backend services from any single client at once, the most common production placement.<br>
• <strong>Per-service</strong> - a service protects itself directly, useful when it's called by internal services that bypass the gateway.<br>
• <strong>Per-user/API-key</strong> - a fairer scheme than a single global limit, so one noisy client can't starve everyone else's quota.<br>
<br>
A rate-limited client typically receives an HTTP <strong>429 Too Many Requests</strong> status, often with a <code>Retry-After</code> header telling it when it's safe to try again.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Rate Limiting solve?</td><td>Protects a service from being overwhelmed by too many requests from one client, whether accidental or malicious</td></tr>
<tr class='text-center'><td>Explain the token bucket algorithm</td><td>A bucket holds up to N tokens refilled at a steady rate; each request consumes one token, allowing bursts up to the bucket size while enforcing a steady average rate</td></tr>
<tr class='text-center'><td>What HTTP status usually signals a rate-limited request?</td><td>429 Too Many Requests, often with a Retry-After header</td></tr>
<tr class='text-center'><td>Why rate-limit per-user instead of one global limit?</td><td>A global limit lets one noisy client starve everyone else's share of the quota</td></tr>
</table>`
              }
            ]
          },

          // ----- Load Balancing -----
          {
            id: 'load-balancing-pattern',
            name: 'Load Balancing Pattern',
            beginner: [
              {
                content: `<h3>What is Load Balancing?</h3>
When a service has multiple running instances (for scale and redundancy), Load Balancing decides WHICH instance handles each incoming request, spreading traffic evenly so no single instance is overwhelmed while others sit idle.<br>
<br>
<h4>Client-Side vs Server-Side Load Balancing</h4>
<br>
• <strong>Server-Side</strong> - a dedicated load balancer (NGINX, AWS ELB, a Kubernetes Service) sits in front of the instances and routes each request; the caller doesn't know or care which instance handled it.<br>
• <strong>Client-Side</strong> - the calling service itself fetches the list of healthy instances (often from a service registry, see Service Discovery) and picks one directly, skipping an extra network hop through a middle-man balancer.<br>`
              },
              {
                content: `<h4>Common Balancing Strategies</h4>
<br>
• <strong>Round Robin</strong> - cycles through instances in order, simple and fair when instances are similarly sized.<br>
• <strong>Least Connections</strong> - sends the next request to whichever instance currently has the fewest active connections, better when requests vary a lot in duration.<br>
• <strong>Weighted</strong> - larger/more powerful instances get proportionally more traffic.<br>
• <strong>Random</strong> - picks an instance at random, surprisingly effective at scale and very cheap to compute.<br>`,
                codeExamples: [
                  `// Client-side load balancing with a @LoadBalanced RestTemplate (Spring Cloud)
@Bean
@LoadBalanced
public RestTemplate restTemplate() {
    return new RestTemplate();
}

// Calling by service NAME - the load balancer picks a healthy instance behind the scenes
String result = restTemplate.getForObject("http://INVENTORY-SERVICE/api/stock", String.class);`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Health-Aware Load Balancing</h3>
A good load balancer doesn't just spread traffic evenly - it also stops sending traffic to instances failing health checks, removing them from rotation until they recover. Combined with Service Discovery's heartbeat mechanism, this is how a whole unhealthy instance gets naturally drained of traffic without any manual intervention.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Client-side vs server-side load balancing?</td><td>Server-side: a dedicated balancer routes traffic, caller is unaware of instances. Client-side: the caller itself picks an instance from the registry, skipping the extra hop</td></tr>
<tr class='text-center'><td>Round Robin vs Least Connections?</td><td>Round Robin cycles through instances in order (simple, fair for similar workloads); Least Connections favors the instance with fewest active connections (better for uneven request durations)</td></tr>
<tr class='text-center'><td>How does load balancing interact with health checks?</td><td>Unhealthy instances get removed from the rotation automatically, so traffic naturally drains away from them without manual action</td></tr>
</table>`
              }
            ]
          },

          // ----- Saga -----
          {
            id: 'saga-pattern',
            name: 'Saga Pattern',
            beginner: [
              {
                content: `<h3>The Problem</h3>
A traditional single-database transaction (BEGIN...COMMIT/ROLLBACK) guarantees all-or-nothing across multiple table writes. But in microservices, "place an order" might span Order Service, Payment Service, and Inventory Service - each with its OWN database. There is no single database transaction that can atomically span all three.<br>
<br>
<h4>What is the Saga Pattern?</h4>
A Saga breaks a distributed transaction into a sequence of <strong>local transactions</strong>, each in one service, with each step publishing an event/message that triggers the next step. If a step fails partway through, the Saga runs <strong>compensating transactions</strong> to undo the effects of the steps that already succeeded - rather than a true rollback (which isn't possible across services).<br>`
              },
              {
                content: `<h4>Choreography vs Orchestration</h4>
<br>
• <strong>Choreography</strong> - each service listens for events and reacts on its own, publishing its own events in turn; there's no central coordinator. Simple for short sagas, but the overall flow becomes hard to see/trace as more steps get added.<br>
• <strong>Orchestration</strong> - a central Saga Orchestrator explicitly tells each service what to do next and handles compensation logic itself. Easier to understand/debug for complex flows, at the cost of a new central component.<br>`,
                codeExamples: [
                  `// Choreography-style: OrderService publishes an event, others react
public class OrderService {
    public void placeOrder(Order order) {
        orderRepository.save(order.withStatus("PENDING"));
        eventPublisher.publish(new OrderCreatedEvent(order.getId(), order.getAmount()));
    }

    // Listens for a failure event from PaymentService and compensates
    @EventListener
    public void onPaymentFailed(PaymentFailedEvent event) {
        orderRepository.updateStatus(event.getOrderId(), "CANCELLED"); // compensating action
    }
}`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Compensating Transactions Are Not True Rollbacks</h3>
A compensating transaction UNDOES the business effect of a prior step, but it can't always erase every side effect (e.g. a "cancel order" email may already have been sent, or a "sorry, order cancelled" notification is itself a new, visible action, not silence). Sagas must be designed with this in mind - compensation is "make it right going forward," not "pretend it never happened."<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't microservices use a normal ACID transaction across services?</td><td>Each service owns its own database; there's no single transaction manager that can span multiple independent databases atomically</td></tr>
<tr class='text-center'><td>What is a compensating transaction?</td><td>A step that undoes the business effect of an earlier completed step in the saga, run when a later step fails</td></tr>
<tr class='text-center'><td>Choreography vs Orchestration Saga?</td><td>Choreography: services react to each other's events with no central coordinator. Orchestration: a central orchestrator explicitly directs each step and compensation</td></tr>
<tr class='text-center'><td>What's a downside of choreography as a saga grows?</td><td>The overall flow becomes hard to trace/understand since logic is scattered across many independent event listeners</td></tr>
</table>`
              }
            ]
          },

          // ----- CQRS -----
          {
            id: 'cqrs-pattern',
            name: 'CQRS (Command Query Responsibility Segregation) Pattern',
            beginner: [
              {
                content: `<h3>What is CQRS?</h3>
CQRS separates the model used to WRITE data (Commands - "place this order," "update this profile") from the model used to READ data (Queries - "show me this order's status"), instead of using one single model for both.<br>
<br>
<h4>Why Separate Them?</h4>
<br>
• Read and write workloads often have very different needs - reads are usually much more frequent and can tolerate slightly-stale data; writes need strict consistency.<br>
• The optimal data shape for writing (normalized, transactional) is often NOT the optimal shape for reading (denormalized, pre-joined, fast to query).<br>
• They can be scaled <strong>independently</strong> - e.g. many read replicas for a read-heavy system, without touching the write path at all.<br>`
              },
              {
                content: `<h4>A Simple CQRS Split</h4>`,
                codeExamples: [
                  `// COMMAND side - handles writes, focused on business rules/consistency
@Service
public class OrderCommandService {
    public void placeOrder(PlaceOrderCommand cmd) {
        Order order = new Order(cmd.getCustomerId(), cmd.getItems());
        orderWriteRepository.save(order); // writes to the normalized "source of truth" store
        eventPublisher.publish(new OrderPlacedEvent(order.getId()));
    }
}

// QUERY side - handles reads, optimized for fast lookups
@Service
public class OrderQueryService {
    public OrderSummaryDto getOrderSummary(String orderId) {
        // reads from a separate, denormalized read model kept in sync via events
        return orderReadRepository.findSummaryById(orderId);
    }
}`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Eventual Consistency Between the Two Sides</h3>
When the write and read models are physically separate stores, the read side is updated <strong>asynchronously</strong> (often via the events published on write) - meaning there's a small window where a just-written change hasn't reached the read model yet. CQRS deliberately trades strict immediate consistency for read-side scalability/performance, so systems adopting it must be comfortable with that trade-off for the specific use case.<br>
<br>
CQRS is frequently paired with <strong>Event Sourcing</strong> (see that separate topic) since events are a natural way to propagate write-side changes into the read model, but the two patterns are independent - you can use CQRS without Event Sourcing.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does CQRS stand for and mean?</td><td>Command Query Responsibility Segregation - separating the write model (Commands) from the read model (Queries)</td></tr>
<tr class='text-center'><td>Why might the ideal write schema differ from the ideal read schema?</td><td>Writes favor a normalized, transactionally-consistent shape; reads favor a denormalized, pre-joined shape optimized for fast queries</td></tr>
<tr class='text-center'><td>What consistency trade-off does CQRS usually introduce?</td><td>Eventual consistency - the read model lags slightly behind the write model since it's updated asynchronously</td></tr>
<tr class='text-center'><td>Is CQRS the same thing as Event Sourcing?</td><td>No - they're often paired together but are independent patterns; CQRS can be used without Event Sourcing</td></tr>
</table>`
              }
            ]
          }

        ]
      }
    ],
    cheatNotes: [
      'API Gateway - single entry point for routing, auth, and rate limiting across microservices',
      'Service Discovery - dynamic lookup of service instance locations via a registry (Eureka/Consul)',
      'Circuit Breaker - trips OPEN after repeated failures to stop cascading failure, tests recovery via HALF-OPEN',
      'Retry - re-attempts transient failures with exponential backoff + jitter to avoid retry storms',
      'Timeout - bounds how long a caller waits, preventing indefinite resource pileup',
      'Bulkhead - isolates resources per dependency so one failure can\'t exhaust resources needed by others',
      'Rate Limiting - caps requests per time window (token bucket), returns HTTP 429 when exceeded',
      'Saga - sequence of local transactions with compensating actions, since no cross-service ACID transaction exists',
      'CQRS - separates the write model from the read model to optimize/scale each independently'
    ],
    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'Why do microservices need an API Gateway instead of clients calling services directly?',
          'What is the difference between client-side and server-side service discovery?',
          'Explain the three states of a Circuit Breaker and what triggers each transition.',
          'When does the Retry pattern make a problem worse instead of better?',
          'Why does every network call in a microservice need an explicit timeout?',
          'How does the Bulkhead pattern get its name, and what does it isolate?',
          'What algorithm is commonly used for rate limiting, and how does it work?',
          'How does client-side load balancing differ from a traditional load balancer?',
          'Why can\'t microservices use a single ACID transaction across services, and how does the Saga pattern solve this?',
          'What is CQRS, and what consistency trade-off does it usually introduce?'
        ]
      }
    ]
  }
];
