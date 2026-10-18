// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const microservicesFundamentalsPart1: Course[] = [
  {
    id: 'microservices-fundamentals',
    name: 'Microservices',
    icon: 'Network',
    subTopics: [

      // ===== SubTopic: Microservices Fundamentals =====
      {
        id: 'microservices-basics',
        name: 'Microservices Fundamentals',
        topics: [

          // ----- 1. Introduction to Microservices -----
          {
            id: 'intro-to-microservices',
            name: 'Introduction to Microservices',
            beginner: [
              {
                content: `<h3>What is a Microservice?</h3>
A <strong>microservice</strong> is a small, independently deployable service that implements a single business capability and communicates with other services over a network, typically via HTTP/REST or messaging. A <strong>microservices architecture</strong> is a style of building an application as a suite of such services, rather than one large deployable unit.<br>
<br>
<h4>Where It Came From</h4>
• Early enterprise apps were built as <strong>monoliths</strong> - one codebase, one deployable artifact (a WAR/JAR), one database.<br>
• <strong>SOA (Service-Oriented Architecture)</strong> in the 2000s introduced the idea of splitting a system into services, but usually with a heavyweight shared bus (ESB) and coarse-grained services.<br>
• <strong>Microservices</strong> (the term popularized around 2011-2014, notably by companies like Netflix and Amazon) pushed this further - fine-grained services, each owning its own data, deployed and scaled independently, with lightweight communication (REST/messaging instead of a heavyweight ESB).<br>`
              },
              {
                content: `<h4>Key Characteristics</h4>
• <strong>Small and focused</strong> - each service does one thing (e.g. "Order Service", "Payment Service", "Inventory Service").<br>
• <strong>Independently deployable</strong> - you can deploy a change to the Payment Service without redeploying the entire application.<br>
• <strong>Owns its own data</strong> - each service typically has its own database; other services never reach directly into it.<br>
• <strong>Organized around business capability</strong> - services are split by what the business does (orders, payments, shipping), not by technical layer (UI, logic, data).<br>
• <strong>Communicates over the network</strong> - via REST, gRPC, or asynchronous messaging, since services run as separate processes (often on separate machines/containers).<br>`,
                codeExamples: [
                  `// A minimal Spring Boot microservice - Order Service
@SpringBootApplication
@RestController
public class OrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }

    @GetMapping("/orders/{id}")
    public Order getOrder(@PathVariable Long id) {
        return new Order(id, "Laptop", 1);
    }

    record Order(Long id, String item, int quantity) {}
}
// Illustrative: this service runs as its own independently
// deployable process, e.g. on port 8081, separate from
// PaymentService (port 8082), InventoryService (port 8083), etc.`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>The Honest Tradeoffs</h3>
Microservices are frequently sold as an unambiguous upgrade over monoliths - they aren't. They trade one set of problems for another.<br>
<br>
<h4>What You Gain</h4>
• <strong>Independent deployability</strong> - ship a fix to one service without a full-system release.<br>
• <strong>Independent scalability</strong> - scale only the service under load (e.g. Checkout during a sale), not the whole app.<br>
• <strong>Team autonomy</strong> - different teams own different services, choose their own release cadence, even their own tech stack.<br>
• <strong>Fault isolation</strong> - (if done right) one service crashing doesn't necessarily take down the whole system.<br>
<br>
<h4>What It Costs You</h4>
• <strong>Operational complexity</strong> - you now have N deployables, N sets of logs, N things that can be down, instead of one.<br>
• <strong>Network latency and failure modes</strong> - an in-process method call becomes a network call, which can be slow or simply fail (the network is not reliable).<br>
• <strong>Distributed debugging</strong> - a single user request may touch 6 services; tracing what went wrong requires distributed tracing tooling, not just a stack trace.<br>
• <strong>Data consistency challenges</strong> - no more simple cross-table SQL joins/transactions across services owning different data (see Distributed Data Management).<br>
• <strong>Testing complexity</strong> - integration/end-to-end tests now need multiple services running together.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a microservice?</td><td>A small, independently deployable service implementing one business capability, communicating with others over the network</td></tr>
<tr class='text-center'><td>How do microservices differ from SOA?</td><td>SOA typically used a heavyweight shared ESB and coarser services; microservices favor fine-grained services with lightweight REST/messaging and no central bus</td></tr>
<tr class='text-center'><td>Name two real costs of microservices, not just benefits</td><td>Operational complexity (many deployables to run/monitor) and distributed debugging (a single request spans multiple services, requiring tracing tools)</td></tr>
<tr class='text-center'><td>Why do microservices typically own their own database?</td><td>To keep each service independently deployable and loosely coupled - shared databases create hidden coupling between services</td></tr>
</table>`
              }
            ]
          },

          // ----- 2. Monolithic vs Microservices Architecture -----
          {
            id: 'monolith-vs-microservices',
            name: 'Monolithic vs Microservices Architecture',
            beginner: [
              {
                content: `<h3>Monolith vs Microservices</h3>
A <strong>monolith</strong> is a single deployable unit containing all of an application's functionality - one codebase, one build, one deployment, usually one database. A <strong>microservices architecture</strong> splits that same functionality across many independently deployable services.<br>
<br>
<h4>Comparison</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Monolith</th><th>Microservices</th></tr>
<tr class='text-center'><td>Deployment unit</td><td>One (whole app deployed together)</td><td>Many (each service deployed independently)</td></tr>
<tr class='text-center'><td>Database</td><td>Usually one shared database</td><td>Typically one database per service</td></tr>
<tr class='text-center'><td>Scaling</td><td>Scale the entire app, even if only one part is under load</td><td>Scale just the service under load</td></tr>
<tr class='text-center'><td>Team structure</td><td>One team (or many teams sharing one codebase)</td><td>Small teams, each owning one or a few services</td></tr>
<tr class='text-center'><td>Technology choice</td><td>One stack for the whole app</td><td>Each service can use a different stack (polyglot)</td></tr>
<tr class='text-center'><td>Operational overhead</td><td>Low - one thing to deploy/monitor</td><td>High - many things to deploy/monitor/secure</td></tr>
<tr class='text-center'><td>Cross-feature transactions</td><td>Simple - one local DB transaction</td><td>Hard - needs patterns like Saga (see Microservices Design Patterns course)</td></tr>
</table>`
              }
            ],
            expert: [
              {
                content: `<h3>"Monolith First" - The Migration Strategy</h3>
A well-known piece of advice (popularized by Martin Fowler) is: <strong>start with a monolith</strong>, and only split into microservices once you actually feel the pain that microservices solve.<br>
<br>
<h4>Why Start With a Monolith</h4>
• Early on, the business domain isn't well understood yet - it's hard to draw good service boundaries before you know where they should be.<br>
• A monolith is simpler to build, test, deploy, and debug - which matters most when a small team is moving fast and the product itself is still changing.<br>
• Splitting too early, along the wrong boundaries, creates a "distributed monolith" - all the operational cost of microservices, none of the independence benefit, because services still have to change together.<br>
<br>
<h4>When Microservices Start Paying Off</h4>
• The team has grown large enough that multiple teams stepping on each other's toes in one codebase is a real bottleneck.<br>
• Specific parts of the system need very different scaling profiles (e.g. a recommendation engine needs way more compute than the user-profile service).<br>
• Domain boundaries have become clear enough (often via Domain-Driven Design's "bounded contexts") to split along seams that will stay stable.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>When is a monolith the right choice?</td><td>Small teams, early-stage products, or when domain boundaries aren't well understood yet - simplicity beats independence at that stage</td></tr>
<tr class='text-center'><td>What is a "distributed monolith"?</td><td>A microservices split done along the wrong boundaries - services still have to change together, so you get microservices' operational cost without their independence benefit</td></tr>
<tr class='text-center'><td>What does "monolith first" advise?</td><td>Start with a monolith and split into microservices only once you feel real pain (team scale, differing scaling needs) that justifies the added operational complexity</td></tr>
</table>`
              }
            ]
          },

          // ----- 3. Core Characteristics of Microservices -----
          {
            id: 'microservices-characteristics',
            name: 'Core Characteristics of Microservices',
            beginner: [
              {
                content: `<h3>What Makes a Service "Micro"</h3>
Not every small service is automatically well-designed - certain characteristics distinguish a well-built microservice from just "a small program that happens to run separately":<br>
<br>
• <strong>Single Responsibility</strong> - a service should do one thing and do it well (one bounded business capability), not several unrelated things bundled together.<br>
• <strong>Decentralized Data Management</strong> - each service owns its own database/schema; no other service reaches directly into it. Data is only accessed through the owning service's API.<br>
• <strong>Independent Deployability</strong> - a service can be deployed on its own schedule, without coordinating a release with every other service.<br>
• <strong>Technology Heterogeneity (Polyglot)</strong> - one service can be written in Java/Spring Boot, another in Node.js, another in Go - each team picks what fits their service best.<br>
• <strong>Failure Isolation</strong> - one service failing shouldn't (ideally) cascade and take down every other service (this is why patterns like Circuit Breaker exist - see the Microservices Design Patterns course).<br>
• <strong>Smart Endpoints, Dumb Pipes</strong> - business logic lives inside the services themselves; the communication mechanism between them (HTTP, a message broker) stays simple, not a heavyweight orchestration engine.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Sizing a Service - "Micro" Doesn't Mean "Tiny"</h3>
A common beginner misconception is that "microservice" means "as small as possible" (e.g. one service per database table). In practice, the right size is driven by <strong>bounded context</strong> (a Domain-Driven Design concept) - a service should be exactly as big as one coherent business capability, no bigger and no smaller.<br><br>
Splitting too finely creates "nanoservices" - services so small that most requests still need to call 5+ other services, multiplying the network-latency and failure-mode costs described in the Introduction topic, without a matching benefit.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does "decentralized data management" mean?</td><td>Each service owns its own database; other services can only reach that data through the owning service's API, never directly</td></tr>
<tr class='text-center'><td>What does "smart endpoints, dumb pipes" mean?</td><td>Business logic lives in the services themselves; the communication layer (HTTP/message broker) stays simple rather than embedding orchestration logic</td></tr>
<tr class='text-center'><td>Why is "as small as possible" the wrong sizing goal?</td><td>Splitting too finely creates "nanoservices" where most requests fan out across many services, multiplying network/failure costs without a matching benefit - size should follow bounded context, not an arbitrary smallness target</td></tr>
</table>`
              }
            ]
          },

          // ----- 4. Inter-Service Communication -----
          {
            id: 'inter-service-communication',
            name: 'Inter-Service Communication',
            beginner: [
              {
                content: `<h3>How Services Talk to Each Other</h3>
Since each microservice runs as a separate process, they must communicate over the network. There are two broad styles:<br>
<br>
• <strong>Synchronous</strong> - the caller sends a request and waits/blocks for a response (REST over HTTP, or gRPC for a faster, typed, binary protocol).<br>
• <strong>Asynchronous</strong> - the caller sends a message/event and moves on without waiting for an immediate response (via a message broker - see the Integration & Messaging Patterns course for the full catalog).<br>`,
                codeExamples: [
                  `// Synchronous REST call from Order Service to Inventory Service,
// using Spring's WebClient (modern, non-blocking-friendly client)

@Service
public class InventoryClient {

    private final WebClient webClient;

    public InventoryClient(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("http://inventory-service:8083").build();
    }

    public boolean isInStock(String itemId) {
        return webClient.get()
            .uri("/inventory/{itemId}/available", itemId)
            .retrieve()
            .bodyToMono(Boolean.class)
            .block(); // blocks and waits for the response - synchronous
    }
}
// Illustrative: requires a running Inventory Service to actually execute;
// shown here for the calling pattern, not as standalone runnable output.`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Choosing Between Styles</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Synchronous (REST/gRPC)</th><th>Asynchronous (Messaging)</th></tr>
<tr class='text-center'><td>Coupling</td><td>Tighter - caller needs the callee to be up and responsive right now</td><td>Looser - producer doesn't need consumer to be available at the same instant</td></tr>
<tr class='text-center'><td>Latency</td><td>Caller waits for the full round trip</td><td>Caller can continue immediately (fire-and-forget or eventual reply)</td></tr>
<tr class='text-center'><td>Resilience</td><td>A slow/down callee directly stalls/fails the caller (needs Circuit Breaker/Timeout)</td><td>A down consumer just means messages queue up until it recovers</td></tr>
<tr class='text-center'><td>Best for</td><td>Requests that genuinely need an immediate answer (e.g. "is this in stock right now?")</td><td>Workflows that can tolerate eventual processing (e.g. "send a confirmation email")</td></tr>
</table>
<br>
gRPC vs REST: gRPC uses HTTP/2 and Protocol Buffers (binary, strongly typed, code-generated clients/servers), which is typically faster and more bandwidth-efficient than JSON-over-REST, at the cost of being less human-readable/debuggable and less universally supported by simple tools like curl/browsers.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the key tradeoff between sync and async communication?</td><td>Sync is simpler to reason about but couples the caller to the callee's availability/latency right now; async is more resilient/decoupled but adds eventual-consistency complexity</td></tr>
<tr class='text-center'><td>Why might gRPC be chosen over REST between internal services?</td><td>Faster/more compact binary serialization (Protocol Buffers) and strongly-typed generated clients, at the cost of human-readability and universal tool support</td></tr>
</table>`
              }
            ]
          },

          // ----- 5. Service Registry and Discovery -----
          {
            id: 'service-registry-discovery',
            name: 'Service Registry and Discovery',
            beginner: [
              {
                content: `<h3>Why You Can't Just Hardcode a URL</h3>
In a microservices system running on containers/cloud infrastructure, service instances come and go - they scale up/down, restart, and get new IP addresses constantly. Hardcoding <code>http://192.168.1.5:8081</code> for the Order Service simply breaks the moment that instance restarts elsewhere.<br>
<br>
<h4>The Fix: Service Registry and Discovery</h4>
• A <strong>service registry</strong> is a directory where every service instance registers itself on startup ("I am Order Service, running at this address") and deregisters on shutdown.<br>
• <strong>Service discovery</strong> is how a caller finds a live instance of the service it needs, by asking the registry instead of using a hardcoded address.<br>
• <strong>Client-side discovery</strong> - the calling service queries the registry itself and picks an instance (possible load-balancing client-side).<br>
• <strong>Server-side discovery</strong> - the caller talks to a load balancer/router, which queries the registry on the caller's behalf.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Netflix Eureka - A Concrete Example</h3>
Spring Cloud Netflix Eureka is a widely-used service registry in the Spring ecosystem.<br>`,
                codeExamples: [
                  `# Eureka Server - application.yml
server:
  port: 8761
eureka:
  client:
    register-with-eureka: false
    fetch-registry: false`,
                  `# Order Service (a Eureka Client) - application.yml
spring:
  application:
    name: order-service
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/`,
                  `// Order Service calling Inventory Service by its registered
// LOGICAL NAME instead of a hardcoded host:port, via a
// load-balanced WebClient/RestTemplate backed by Eureka:

@LoadBalanced
@Bean
public WebClient.Builder loadBalancedWebClientBuilder() {
    return WebClient.builder();
}

// Later:
webClient.get().uri("http://inventory-service/inventory/{id}", id)
    // "inventory-service" here is resolved via Eureka to a live instance
`
                ]
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is hardcoding service URLs a problem in microservices?</td><td>Instances scale/restart/move constantly in containerized environments, so a fixed IP:port breaks as soon as the instance changes</td></tr>
<tr class='text-center'><td>Client-side vs server-side discovery?</td><td>Client-side: the caller queries the registry itself and picks an instance. Server-side: the caller talks to a load balancer that queries the registry on its behalf</td></tr>
<tr class='text-center'><td>What does Eureka provide in the Spring ecosystem?</td><td>A service registry that services register with on startup and query to find live instances of other services by logical name</td></tr>
</table>
<br>
<em>For a deeper dive specifically framed as a design pattern (including client-side vs server-side tradeoffs in more depth), see "Service Discovery Pattern" in the Microservices Design Patterns course.</em>`
              }
            ]
          },

          // ----- 6. API Composition -----
          {
            id: 'api-composition',
            name: 'API Composition',
            beginner: [
              {
                content: `<h3>Combining Data From Multiple Services</h3>
A single screen in a client app (e.g. an order-detail page) often needs data that lives across several services - order details from Order Service, item info from Catalog Service, shipping status from Shipping Service. <strong>API Composition</strong> is the practice of combining results from multiple service calls into one response for the client.<br>
<br>
<h4>Two Ways to Compose</h4>
• <strong>Client-side composition</strong> - the client itself calls each service separately and merges the results (simple, but chatty over the network and exposes internal service boundaries to the client).<br>
• <strong>API Gateway-side composition</strong> - a single gateway/aggregator service calls all the needed backend services and returns one combined response to the client (client makes just one call; see the "API Gateway Pattern" and "Aggregator Pattern" in the Microservices Design Patterns course for the deeper pattern treatment).<br>`
              }
            ],
            expert: [
              {
                content: `<h3>The N+1 Problem Across Services</h3>
A subtle trap: composing a list of items where each item then requires its OWN follow-up call to another service (e.g. fetch 20 orders, then call Catalog Service once PER order to get item names) results in 1 + 20 = 21 network calls instead of 2. This "N+1" problem, familiar from ORMs, is even more expensive across a network than within a single database.<br>
<br>
<h4>Mitigations</h4>
• Batch endpoints - ask the Catalog Service for many item IDs in one call instead of one call per item.<br>
• Caching frequently-composed, slow-changing data.<br>
• Denormalizing some data into the composing service if the read pattern justifies it (accepting some duplication for read performance).<br>`,
                codeExamples: [
                  `// BAD: N+1 calls - one Catalog call per order
List<Order> orders = orderClient.getOrders(userId);
for (Order o : orders) {
    Item item = catalogClient.getItem(o.getItemId()); // N calls!
}

// BETTER: one batched call for all item IDs
List<Order> orders = orderClient.getOrders(userId);
List<String> itemIds = orders.stream().map(Order::getItemId).toList();
Map<String, Item> items = catalogClient.getItemsBatch(itemIds); // 1 call
// Illustrative composition logic - actual clients would be
// real HTTP calls to running services.`
                ]
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is API composition?</td><td>Combining results from multiple backend service calls into one response for the client</td></tr>
<tr class='text-center'><td>Client-side vs gateway-side composition?</td><td>Client-side: the client itself calls each service and merges results. Gateway-side: one gateway/aggregator does the calling and merging, client makes one call</td></tr>
<tr class='text-center'><td>What is the N+1 problem in a microservices context?</td><td>Composing a list where each item requires its own follow-up service call, multiplying network calls (1 list call + N per-item calls) - fixed by batch endpoints or caching</td></tr>
</table>`
              }
            ]
          },

          // ----- 7. Containerization with Docker -----
          {
            id: 'containerization-docker',
            name: 'Containerization with Docker',
            beginner: [
              {
                content: `<h3>Why Containers Matter for Microservices</h3>
With dozens of independently deployable services, each potentially needing a different runtime/dependency version, running them all directly on a shared host becomes unmanageable ("works on my machine" multiplied by N services). <strong>Containers</strong> solve this by packaging a service together with everything it needs (JVM, libraries, config) into one portable, isolated unit.<br>
<br>
<h4>What Docker Gives You</h4>
• <strong>Consistent runtime</strong> - the exact same container image runs identically on a developer's laptop, in CI, and in production.<br>
• <strong>Isolation</strong> - each container has its own filesystem/process space, so services don't fight over dependency versions.<br>
• <strong>Fast startup</strong> - containers start in seconds, much faster than provisioning a full VM, which matters for scaling up quickly under load.<br>`
              },
              {
                content: `<h4>A Minimal Dockerfile for a Spring Boot Service</h4>`,
                codeExamples: [
                  `# Dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/order-service-0.0.1.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]`,
                  `# Build and run
docker build -t order-service:1.0 .
docker run -p 8081:8081 order-service:1.0

# The service is now reachable at http://localhost:8081`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Multi-Service Local Development with Docker Compose</h3>
Running several services (and their dependencies like a database) by hand quickly becomes tedious. <strong>Docker Compose</strong> lets you define and start a whole multi-container setup with one command.<br>`,
                codeExamples: [
                  `# docker-compose.yml
version: "3.8"
services:
  order-service:
    build: ./order-service
    ports:
      - "8081:8081"
    depends_on:
      - order-db

  order-db:
    image: postgres:16
    environment:
      POSTGRES_DB: orders
      POSTGRES_PASSWORD: secret
    ports:
      - "5432:5432"

  inventory-service:
    build: ./inventory-service
    ports:
      - "8083:8083"`,
                  `# Start everything defined above
docker compose up

# Illustrative: requires the referenced service directories/Dockerfiles
# to exist; shown to demonstrate multi-service local orchestration,
# not as a standalone runnable snippet.`
                ]
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why are containers a natural fit for microservices?</td><td>They package each service with its exact runtime/dependencies into a portable, isolated unit that runs identically everywhere and starts in seconds</td></tr>
<tr class='text-center'><td>What problem does Docker Compose solve?</td><td>Defining and starting a whole multi-service (+ dependencies like a DB) local setup with one command, instead of manually running each container</td></tr>
<tr class='text-center'><td>What's the difference between a Docker image and a container?</td><td>An image is the packaged, immutable blueprint (filesystem + config); a container is a running instance of that image</td></tr>
</table>`
              }
            ]
          }

        ]
      }
    ],
    cheatNotes: [
      'Microservice = small, independently deployable service owning one business capability',
      'Monolith first - split into microservices only once you feel real pain that justifies it',
      'Each microservice should own its own database - no other service reaches into it directly',
      'Synchronous (REST/gRPC) = simpler but tightly coupled; Asynchronous (messaging) = resilient but eventually consistent',
      'Service registry + discovery replaces hardcoded URLs since instances scale/restart constantly',
      'API composition combines multiple services\' data into one client-facing response - watch for the N+1 problem',
      'Docker packages a service + its runtime into one portable, isolated, fast-starting unit',
      'Docker Compose orchestrates multiple local containers (services + DB) with one command'
    ],
    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'What is a microservice, and how does it differ from a monolith?',
          'What are the real costs of adopting microservices, not just the benefits?',
          'When would you recommend staying with a monolith instead of moving to microservices?',
          'What does "decentralized data management" mean in a microservices architecture?',
          'What is the difference between synchronous and asynchronous inter-service communication?',
          'Why is hardcoding a service\'s IP address a bad idea in a microservices system?',
          'What is client-side vs server-side service discovery?',
          'What is API composition, and what problem (N+1) can it run into?',
          'Why are containers commonly used to deploy microservices?',
          'What is the difference between a Docker image and a Docker container?'
        ]
      }
    ]
  }
];
