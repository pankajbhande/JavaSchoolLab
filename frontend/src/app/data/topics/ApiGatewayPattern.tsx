import { Topic } from '../coreJava';

export const apiGatewayPattern: Topic = {
    id: 'api-gateway-pattern',
    name: 'API Gateway Pattern',
    beginner: [
        {
            content: `<h4>The Problem</h4>
In a microservices architecture, one business application is broken into many small services -
Order Service, Payment Service, Inventory Service, User Service, and so on. <br><br>
If a mobile app or web client had to call each of these services <b>directly</b>, it would need to know
the address of every single service, handle authentication for each one separately, and make many
round trips over the network just to render one screen. <br><br>
This makes the client heavy, slow, and tightly coupled to the internal structure of the backend.

<h4>Real-Life Analogy</h4>
<ul>
<li>Think of a big office building with 20 different departments (HR, Finance, IT, Legal).</li>
<li>Instead of a visitor wandering the building looking for each department, there is a
<b>reception desk</b> at the entrance.</li>
<li>The receptionist routes the visitor to the correct department, checks their ID first, and
keeps a log of who visited.</li>
<li>The API Gateway is exactly this receptionist for your microservices.</li>
</ul>`
        },
        {
            content: `<h4>Simple Explanation</h4>
Instead of clients calling every microservice directly, all requests go through a single entry
point called the <b>API Gateway</b>. The gateway then routes the request to the correct backend
service.

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
                     ┌───────────────────┐
                     │   Mobile / Web     │
                     │      Client        │
                     └─────────┬──────────┘
                               │  single entry point
                               ▼
                     ┌───────────────────┐
                     │    API Gateway     │
                     │ (auth, routing,    │
                     │  rate limiting)    │
                     └───┬─────┬─────┬───┘
              ┌──────────┘     │     └──────────┐
              ▼                ▼                ▼
      ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
      │ Order Service  │ │Payment Service│ │Inventory Svc  │
      └───────────────┘ └───────────────┘ └───────────────┘
</pre>

<h4>What the Gateway Typically Handles</h4>
<ul>
<li><b>Routing</b> - forwards <code>/orders/**</code> to Order Service, <code>/payments/**</code> to Payment Service</li>
<li><b>Authentication / Authorization</b> - validates JWT token once at the edge</li>
<li><b>Rate Limiting</b> - prevents one client from overwhelming backend services</li>
<li><b>Logging / Monitoring</b> - one place to see all incoming traffic</li>
</ul>`
        },
        {
            content: `<h4>Basic Config Example (Spring Cloud Gateway)</h4>
A simple route says "any request starting with <code>/orders</code> should go to the Order Service".`,
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
            content: `<h4>Failure Scenarios It Handles</h4>
<ul>
<li><b>Client-service coupling explosion</b> - without a gateway, every client (web, iOS, Android,
partner API) must know the network location of every microservice. Any service being renamed,
split, or moved breaks every client.</li>
<li><b>Cross-cutting concerns duplicated everywhere</b> - without a gateway, auth, logging, and
rate limiting logic gets copy-pasted into every microservice.</li>
<li><b>Chatty clients over slow networks</b> - a mobile client on a weak network making 6 separate
calls to render one screen is far slower than one aggregated call to the gateway.</li>
<li><b>Uncontrolled traffic spikes</b> - a malicious or buggy client can hammer a single backend
service directly if there is no central choke point to apply rate limits.</li>
</ul>`
        },
        {
            content: `<h4>Architecture Diagram - Gateway with Cross-Cutting Concerns</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
 Client
   │
   ▼
┌─────────────────────────────────────────────┐
│                API Gateway                   │
│  ┌───────────┐ ┌───────────┐ ┌─────────────┐ │
│  │  Auth /    │ │  Rate      │ │  Request    │ │
│  │  JWT check │ │  Limiter   │ │  Logging    │ │
│  └───────────┘ └───────────┘ └─────────────┘ │
│                Routing Rules                  │
└───────┬──────────────┬──────────────┬────────┘
        ▼               ▼               ▼
  Order Service   Payment Service  Inventory Service
        │               │               │
        ▼               ▼               ▼
    Order DB        Payment DB      Inventory DB
</pre>`,
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
            content: `<h4>API Gateway vs Backend For Frontend (BFF)</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>API Gateway</th><th>BFF</th></tr>
<tr><td>Purpose</td><td>Single generic entry point for all clients</td><td>Dedicated gateway per client type</td></tr>
<tr><td>Response Shape</td><td>Usually same shape for all clients</td><td>Tailored per client (web vs mobile)</td></tr>
<tr><td>Ownership</td><td>Owned by a central platform team</td><td>Often owned by the frontend team</td></tr>
<tr><td>Complexity</td><td>One gateway, simpler ops</td><td>Multiple gateways, more moving parts</td></tr>
<tr><td>Best Fit</td><td>Uniform clients, simple routing needs</td><td>Very different clients with different data needs</td></tr>
</table>`
        },
        {
            content: `<h4>The Gateway as a Single Point of Failure</h4>
Because every request passes through it, the API Gateway can become a bottleneck or a single
point of failure if not designed carefully.

<h4>Mitigation Strategies</h4>
<ul>
<li><b>Horizontal scaling</b> - run multiple gateway instances behind a load balancer, never a
single node</li>
<li><b>Statelessness</b> - keep the gateway stateless so any instance can handle any request</li>
<li><b>Circuit breakers</b> - isolate a failing downstream service so it doesn't take down the
whole gateway</li>
<li><b>Timeouts and bulkheads</b> - cap how long the gateway waits on a slow service, and isolate
thread pools per downstream dependency</li>
<li><b>Health checks + auto-recovery</b> - orchestration platforms (Kubernetes) restart unhealthy
gateway pods automatically</li>
</ul>

<h4>Real Tools</h4>
<ul>
<li>Spring Cloud Gateway</li>
<li>Netflix Zuul (legacy)</li>
<li>Kong</li>
<li>AWS API Gateway</li>
<li>NGINX / Envoy as gateway layer</li>
</ul>

<h4>Interview Questions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Key Point</th></tr>
<tr><td>Why not let clients call microservices directly?</td><td>Tight coupling, duplicated cross-cutting logic, chatty network calls</td></tr>
<tr><td>What does an API Gateway typically handle?</td><td>Routing, auth, rate limiting, logging, aggregation</td></tr>
<tr><td>How do you avoid the gateway being a single point of failure?</td><td>Scale horizontally, keep stateless, use circuit breakers and health checks</td></tr>
<tr><td>API Gateway vs Load Balancer?</td><td>Load balancer distributes traffic; gateway also does routing, auth, transformation</td></tr>
<tr><td>API Gateway vs BFF?</td><td>Gateway is generic and shared; BFF is tailored per client type</td></tr>
<tr><td>Which Spring project implements API Gateway?</td><td>Spring Cloud Gateway</td></tr>
<tr><td>How does the gateway integrate with service discovery?</td><td>Uses <code>lb://SERVICE-NAME</code> with Eureka/Consul to resolve instances dynamically</td></tr>
</table>`
        }
    ]
};
