// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const architecturalPatterns: Course[] = [
  {
    id: 'architectural-patterns',
    name: 'Architectural Patterns',
    icon: 'Layers',
    subTopics: [
      {
        id: 'architectural-patterns-all',
        name: 'Software Architecture Patterns',
        topics: [

          // ===== 1. Layered Architecture =====
          {
            id: 'layered-architecture-pattern',
            name: 'Layered Architecture Pattern',
            beginner: [
              {
                content: `<h3>What is Layered Architecture?</h3>
<strong>Layered Architecture</strong> (also called n-tier architecture) organizes an application into horizontal <strong>layers</strong>, where each layer has a specific responsibility and depends only on the layer directly beneath it.<br>
<br>
<h4>The Classic 3-Tier Layout</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">+-------------------------------------+
|      Presentation Layer              |  <- Controllers, REST endpoints, UI
+-------------------------------------+
|      Business Layer                  |  <- Services, business rules
+-------------------------------------+
|      Persistence Layer               |  <- Repositories, DAOs
+-------------------------------------+
|      Database Layer                  |  <- Actual data storage
+-------------------------------------+</pre>
• Each layer only talks to the layer directly below it (strict layering) - or optionally to any layer below (relaxed layering).<br>
• A typical Spring Boot project maps this almost 1:1: <code>@RestController</code> -> <code>@Service</code> -> <code>@Repository</code> -> Database.<br>`,
                codeExamples: [
                  `// Presentation layer
@RestController
class OrderController {
    private final OrderService orderService;
    OrderController(OrderService orderService) { this.orderService = orderService; }

    @GetMapping("/orders/{id}")
    Order getOrder(@PathVariable Long id) {
        return orderService.findOrder(id);   // delegates down, never touches the DB directly
    }
}

// Business layer
@Service
class OrderService {
    private final OrderRepository repository;
    OrderService(OrderRepository repository) { this.repository = repository; }

    Order findOrder(Long id) {
        // business rules could go here (e.g. checking permissions)
        return repository.findById(id).orElseThrow();  // findById returns Optional<Order>
    }
}

// Persistence layer
@Repository
interface OrderRepository extends JpaRepository<Order, Long> { }`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Pros, Cons, and When Layering Breaks Down</h3>
<strong>Pros:</strong> simple to understand, easy to onboard new developers, clear separation of concerns, layers are individually testable/replaceable.<br>
<strong>Cons:</strong> can encourage an "anemic" design where business logic leaks into controllers; a change to one layer can still ripple through several layers (the "sinkhole" anti-pattern, where a request just passes straight through every layer doing nothing); doesn't inherently protect the domain model from infrastructure concerns (that's what Hexagonal/Clean/Onion architecture add on top).<br><br>
<h4>Strict vs Relaxed Layering</h4>
• <strong>Strict:</strong> a layer may ONLY call the layer immediately below it.<br>
• <strong>Relaxed:</strong> a layer may call any layer below it (e.g. Presentation calling Persistence directly for a simple read) - more flexible but easier to turn into a tangled mess if undisciplined.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the "sinkhole" anti-pattern?</td><td>A request passes through most layers doing nothing meaningful, adding overhead without real value - a sign the layering is too rigid for that use case</td></tr>
<tr class='text-center'><td>Strict vs relaxed layering?</td><td>Strict allows a layer to call only the one directly below it; relaxed allows calling any layer below, trading discipline for flexibility</td></tr>
<tr class='text-center'><td>How does Spring Boot map to layered architecture?</td><td>@RestController (presentation) -> @Service (business) -> @Repository (persistence) -> database</td></tr>
</table>`
              }
            ]
          },

          // ===== 2. Hexagonal Architecture =====
          {
            id: 'hexagonal-architecture-pattern',
            name: 'Hexagonal Architecture (Ports & Adapters)',
            beginner: [
              {
                content: `<h3>What is Hexagonal Architecture?</h3>
Also called <strong>Ports & Adapters</strong>, this style puts the core business logic at the center, completely isolated from external concerns (database, UI, messaging, third-party APIs). The core defines <strong>ports</strong> (interfaces) describing what it needs; <strong>adapters</strong> implement those ports to plug in a specific technology.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        REST Adapter          JDBC Adapter
              \\                    /
               \\                  /
          [ Port: In ]     [ Port: Out ]
                \\               /
                 \\             /
              +-----------------+
              |   CORE DOMAIN   |
              |  (business logic)|
              +-----------------+
                 /             \\
          [ Port: In ]     [ Port: Out ]
               /                  \\
        CLI Adapter          Kafka Adapter</pre>
• <strong>Inbound ports</strong> - how the outside world drives the application (e.g. a <code>PlaceOrderUseCase</code> interface).<br>
• <strong>Outbound ports</strong> - what the application needs from the outside world (e.g. an <code>OrderRepository</code> interface the core defines, but doesn't implement).<br>
• Swapping the database or the UI technology never touches the core - you only write a new adapter.<br>`,
                codeExamples: [
                  `// Core domain defines the OUTBOUND port (interface) - it does NOT know about JPA/JDBC
interface OrderRepositoryPort {
    void save(Order order);
    Order findById(Long id);
}

// Core domain's use case (INBOUND port implementation) depends only on the interface above
class PlaceOrderService {
    private final OrderRepositoryPort repository;   // depends on abstraction, not JPA
    PlaceOrderService(OrderRepositoryPort repository) { this.repository = repository; }

    void placeOrder(Order order) {
        // pure business logic here, zero knowledge of databases
        repository.save(order);
    }
}

// Adapter: the ONLY place that knows about JPA
class JpaOrderRepositoryAdapter implements OrderRepositoryPort {
    private final SpringDataOrderRepository jpaRepo;
    JpaOrderRepositoryAdapter(SpringDataOrderRepository jpaRepo) { this.jpaRepo = jpaRepo; }

    public void save(Order order) { jpaRepo.save(toEntity(order)); }
    public Order findById(Long id) { return toDomain(jpaRepo.findById(id).orElseThrow()); }
    // toEntity/toDomain mapping methods omitted
}`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Testability — the Biggest Practical Win</h3>
Because the core only depends on interfaces (ports), you can unit-test all business logic with a simple in-memory fake implementing <code>OrderRepositoryPort</code> - no database, no Spring context, no test containers needed for core logic tests. Only adapter-level tests need the real infrastructure.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's a "port" in Hexagonal Architecture?</td><td>An interface the core domain defines to describe what it needs (outbound) or offers (inbound), without knowing which technology implements it</td></tr>
<tr class='text-center'><td>What's an "adapter"?</td><td>A concrete implementation of a port that connects the core to a specific technology (a REST controller, a JPA repository, a Kafka consumer)</td></tr>
<tr class='text-center'><td>Why does this improve testability?</td><td>Business logic can be unit tested against fake/in-memory port implementations, with zero dependency on real infrastructure</td></tr>
</table>`
              }
            ]
          },

          // ===== 3. Clean Architecture =====
          {
            id: 'clean-architecture-pattern',
            name: 'Clean Architecture',
            beginner: [
              {
                content: `<h3>What is Clean Architecture?</h3>
Popularized by Robert C. Martin ("Uncle Bob"), Clean Architecture arranges the system as <strong>concentric circles</strong>, with a single, strict rule: <strong>The Dependency Rule</strong> - source code dependencies can only point <strong>inward</strong>. Nothing in an inner circle can know anything about an outer circle.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   +-------------------------------------------+
   |     Frameworks & Drivers (DB, Web, UI)     |
   |   +-------------------------------------+   |
   |   |     Interface Adapters              |   |
   |   |   +-------------------------------+   |   |
   |   |   |   Application Business Rules  |   |   |  <- Use Cases
   |   |   |   +----------------------+   |   |   |
   |   |   |   | Enterprise Business  |   |   |   |  <- Entities
   |   |   |   |       Rules          |   |   |   |
   |   |   |   +----------------------+   |   |   |
   |   |   +-------------------------------+   |   |
   |   +-------------------------------------+   |
   +-------------------------------------------+</pre>
• <strong>Entities</strong> (innermost) - core business objects/rules, framework-independent.<br>
• <strong>Use Cases</strong> - application-specific business rules, orchestrate entities.<br>
• <strong>Interface Adapters</strong> - controllers, presenters, gateways - convert data between use cases and the outside world.<br>
• <strong>Frameworks & Drivers</strong> (outermost) - Spring, the database, the web framework - the most volatile, most replaceable layer.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Clean vs Hexagonal vs Onion — What's Actually Different?</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Hexagonal</th><th>Clean</th><th>Onion</th></tr>
<tr class='text-center'><td>Visualization</td><td>Hexagon with ports on each side</td><td>4 concentric circles</td><td>Concentric rings (domain center)</td></tr>
<tr class='text-center'><td>Core idea</td><td>Isolate core via ports/adapters</td><td>Strict inward-only dependency rule across explicit layers</td><td>Domain model at center, infrastructure at edges</td></tr>
<tr class='text-center'><td>Practical difference</td><td colspan="2">All three achieve essentially the same goal (dependency inversion protecting business logic from infrastructure) - the differences are largely in emphasis and vocabulary, not substance</td></tr>
</table>
<br>
In practice, most real Spring Boot projects blend ideas from all three rather than rigidly following one.`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is "The Dependency Rule"?</td><td>Source code dependencies can only point inward - an inner circle must never reference anything in an outer circle</td></tr>
<tr class='text-center'><td>Which circle is most volatile/replaceable?</td><td>The outermost (Frameworks & Drivers) - swapping the web framework or DB technology shouldn't touch the Entities or Use Cases</td></tr>
<tr class='text-center'><td>Are Clean, Hexagonal, and Onion fundamentally different?</td><td>No - they share the same core goal (protect business logic from infrastructure via dependency inversion), differing mainly in visualization and terminology</td></tr>
</table>`
              }
            ]
          },

          // ===== 4. Onion Architecture =====
          {
            id: 'onion-architecture-pattern',
            name: 'Onion Architecture',
            beginner: [
              {
                content: `<h3>What is Onion Architecture?</h3>
Coined by Jeffrey Palermo, Onion Architecture puts the <strong>domain model</strong> at the absolute center, with concentric rings of increasingly infrastructure-focused code around it - like the layers of an onion. All dependencies point <strong>toward the center</strong>.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   +-----------------------------------------+
   |   Infrastructure (DB, UI, external APIs) |
   |   +-----------------------------------+   |
   |   |   Application Services            |   |
   |   |   +-----------------------------+   |   |
   |   |   |   Domain Services           |   |   |
   |   |   |   +----------------------+  |   |   |
   |   |   |   |  Domain Model /      |  |   |   |
   |   |   |   |  Entities (center)   |  |   |   |
   |   |   |   +----------------------+  |   |   |
   |   |   +-----------------------------+   |   |
   |   +-----------------------------------+   |
   +-----------------------------------------+</pre>
• The domain model at the very center has zero dependencies on anything else in the system.<br>
• Infrastructure concerns (persistence, UI frameworks) are pushed to the outermost ring, exactly where they belong given how often they change.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What sits at the absolute center of Onion Architecture?</td><td>The domain model / entities, with zero dependencies on anything outside</td></tr>
<tr class='text-center'><td>Where does infrastructure code live?</td><td>The outermost ring, since it's the most likely to change (swap databases, UI frameworks, etc.)</td></tr>
</table>`
              }
            ]
          },

          // ===== 5. Microservices Architecture =====
          {
            id: 'microservices-architecture-pattern',
            name: 'Microservices Architecture',
            beginner: [
              {
                content: `<h3>What is Microservices Architecture?</h3>
An architectural style that structures an application as a collection of <strong>small, independently deployable services</strong>, each built around a specific business capability, each owning its own data store, and communicating over the network (typically HTTP/REST or messaging).<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  [Order Service] --- owns ---> [Order DB]
  [Payment Service] --- owns ---> [Payment DB]
  [Inventory Service] --- owns ---> [Inventory DB]
        \\           |            /
         \\          |           /
          [ API Gateway / Load Balancer ]
                     |
                  Clients</pre>
• Each service can be developed, deployed, and scaled <strong>independently</strong>.<br>
• Different services can even use different tech stacks (polyglot).<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Tradeoffs vs a Monolith</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Monolith</th><th>Microservices</th></tr>
<tr class='text-center'><td>Deployment</td><td>One unit, all-or-nothing</td><td>Independent per service</td></tr>
<tr class='text-center'><td>Scaling</td><td>Scale the whole app</td><td>Scale only the hot service</td></tr>
<tr class='text-center'><td>Data consistency</td><td>Easy - one DB, real transactions</td><td>Hard - needs Saga/eventual consistency</td></tr>
<tr class='text-center'><td>Operational complexity</td><td>Low</td><td>High (service discovery, distributed tracing, network failures)</td></tr>
<tr class='text-center'><td>Team autonomy</td><td>Coordination-heavy</td><td>Teams can own/deploy services independently</td></tr>
</table>
<br>
Microservices trade simplicity for independent scalability and team autonomy - they are NOT free, and are usually not the right first choice for a small team or an early-stage product.`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the single biggest operational cost of microservices?</td><td>Distributed systems complexity - network failures, eventual consistency, service discovery, distributed tracing/debugging</td></tr>
<tr class='text-center'><td>Should a startup begin with microservices?</td><td>Usually no - starting with a well-modularized monolith and splitting out services only when there's a proven scaling/team need is the more common, safer path</td></tr>
</table>`
              }
            ]
          },

          // ===== 6. Monolithic Architecture =====
          {
            id: 'monolithic-architecture-pattern',
            name: 'Monolithic Architecture',
            beginner: [
              {
                content: `<h3>What is a Monolithic Architecture?</h3>
A <strong>monolith</strong> is an application built and deployed as a single, unified unit - one codebase, one build, one deployment artifact (e.g. one Spring Boot JAR/WAR), even if internally it's organized into modules/packages.<br>
<br>
• <strong>Why it's still often the right choice:</strong> simplest to develop, test, deploy, and debug; no network calls between "modules"; real ACID transactions across the whole domain; lowest operational overhead.<br>
• <strong>When it becomes a problem:</strong> the codebase grows large enough that any change requires understanding too much of the system; different parts need to scale very differently; many teams stepping on each other in one codebase/deployment pipeline.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is a monolith automatically "bad" architecture?</td><td>No - it's often the pragmatic, correct starting point; the "distributed monolith" (microservices with monolith-level coupling but network overhead) is worse than either extreme</td></tr>
<tr class='text-center'><td>What signals it's time to consider splitting a monolith?</td><td>Distinct parts needing very different scaling, deployment cadence, or team ownership boundaries that the monolith is actively getting in the way of</td></tr>
</table>`
              }
            ]
          },

          // ===== 7. Modular Monolith =====
          {
            id: 'modular-monolith-pattern',
            name: 'Modular Monolith',
            beginner: [
              {
                content: `<h3>What is a Modular Monolith?</h3>
A middle ground between a tangled monolith and microservices: still <strong>one deployable unit</strong>, but internally organized into <strong>strongly-bounded modules</strong> with explicit interfaces between them - each module could, in principle, become its own microservice later with minimal rework.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">+------------------- One Deployable JAR -------------------+
|  [Orders module]   [Payments module]   [Inventory module] |
|   only talks to        only talks to      only talks to   |
|   Payments via a        Orders via a       Orders via a    |
|   defined interface     defined interface  defined interface |
+-------------------------------------------------------------+</pre>
• Modules communicate only through explicit, well-defined interfaces - never by reaching into another module's internal classes/tables directly.<br>
• Gives most of a monolith's simplicity today, with a much cheaper migration path to microservices later if it's ever actually needed.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does a modular monolith differ from a plain monolith?</td><td>It enforces strict module boundaries and explicit interfaces between modules, rather than allowing any class to reach into any other part of the codebase</td></tr>
<tr class='text-center'><td>Why is it an easier migration path to microservices?</td><td>Because module boundaries are already well-defined, extracting a module into its own service mainly means replacing an in-process call with a network call, not redesigning the boundary</td></tr>
</table>`
              }
            ]
          },

          // ===== 8. Event-Driven Architecture (system-wide) =====
          {
            id: 'eda-architecture-pattern',
            name: 'Event-Driven Architecture (System-Wide)',
            beginner: [
              {
                content: `<h3>What is Event-Driven Architecture?</h3>
An architectural style where components communicate primarily by <strong>producing and consuming events</strong> through an event broker (Kafka, RabbitMQ), rather than calling each other directly via synchronous request/response.<br>
<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">[Order Service] --publishes--> "OrderPlaced" event --> [Event Broker]
                                                              |
                          +-----------------------------------+-----------------------------------+
                          |                                   |                                   |
                   [Inventory Service]                [Payment Service]                   [Notification Service]
                   (reserves stock)                    (charges card)                       (sends email)</pre>
• Producers don't know or care who (if anyone) consumes their events - full decoupling.<br>
• Contrast with a <strong>request-driven</strong> architecture, where a service directly calls another service and waits for its response.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>The Real Tradeoff: Decoupling vs Traceability</h3>
Event-driven systems decouple services beautifully, but at the cost of harder-to-follow control flow ("what actually happens when an order is placed?" now requires tracing through multiple independent consumers instead of reading one call stack) - distributed tracing tools (e.g. OpenTelemetry) become essential, not optional, at this scale.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Event-driven vs request-driven — what's the core difference?</td><td>Event-driven: producers publish events with no knowledge of consumers (async, decoupled). Request-driven: a caller directly invokes another service and waits for a response (sync, coupled)</td></tr>
<tr class='text-center'><td>What's the main cost of event-driven architecture?</td><td>Harder-to-trace control flow and eventual consistency, requiring investment in distributed tracing and careful event schema design</td></tr>
</table>`
              }
            ]
          },

          // ===== 9. Client-Server Architecture =====
          {
            id: 'client-server-architecture-pattern',
            name: 'Client-Server Architecture',
            beginner: [
              {
                content: `<h3>What is Client-Server Architecture?</h3>
The most foundational distributed architecture: a <strong>client</strong> requests a service, and a <strong>server</strong> provides it. Every web application (browser <-> Spring Boot backend) is a client-server system.<br>
<br>
• <strong>Thin client</strong> - most logic/processing happens on the server; the client just renders results (classic server-rendered web apps).<br>
• <strong>Thick/fat client</strong> - significant logic runs on the client itself (a modern React SPA, or a native desktop app) and it only calls the server for data.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Thin client vs thick client?</td><td>Thin: most logic on the server, client just renders. Thick: significant logic runs client-side, server mainly serves data</td></tr>
</table>`
              }
            ]
          },

          // ===== 10. Pipe and Filter =====
          {
            id: 'pipe-filter-pattern',
            name: 'Pipe and Filter Pattern',
            beginner: [
              {
                content: `<h3>What is Pipe and Filter?</h3>
Processing is broken into a sequence of independent <strong>filter</strong> stages, each doing one transformation, connected by <strong>pipes</strong> that pass data from one filter to the next. Unix command pipelines (<code>cat file | grep error | sort | uniq</code>) are the textbook example - and Java's <strong>Stream API</strong> is essentially this pattern in library form.<br>`,
                codeExamples: [
                  `import java.util.*;
import java.util.stream.*;

public class PipeFilterDemo {
    public static void main(String[] args) {
        List<String> words = List.of("java", "python", "go", "javascript", "c");

        // Each .filter()/.map() is a "filter" stage; the stream itself is the "pipe"
        List<String> result = words.stream()
            .filter(w -> w.length() > 2)     // filter 1
            .map(String::toUpperCase)        // filter 2
            .sorted()                        // filter 3
            .collect(Collectors.toList());

        System.out.println(result);
    }
}
// OUTPUT:
// [GO is filtered out (length 2), C is filtered out (length 1)]
// [JAVA, JAVASCRIPT, PYTHON]`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does Java's Stream API relate to Pipe and Filter?</td><td>Each intermediate operation (filter, map, sorted) is a "filter" stage; the stream itself acts as the "pipe" carrying data between them</td></tr>
<tr class='text-center'><td>What's a real system-level example beyond Java?</td><td>Unix shell pipelines (cmd1 | cmd2 | cmd3), where each command is a filter and the pipe (|) connects them</td></tr>
</table>`
              }
            ]
          },

          // ===== 11. Broker Architecture =====
          {
            id: 'broker-architecture-pattern',
            name: 'Broker Architecture Pattern',
            beginner: [
              {
                content: `<h3>What is Broker Architecture?</h3>
A <strong>broker</strong> component coordinates communication between distributed components - clients never talk to servers directly, they always go through the broker, which handles lookup, routing, and sometimes marshaling of requests/responses.<br>
<br>
• Historically implemented by <strong>CORBA</strong> and Java RMI registries.<br>
• Today the same idea shows up in message brokers (Kafka/RabbitMQ) and API gateways - a central coordinating layer that decouples who's talking to whom.<br>
• Related to, but broader than, the Message Broker pattern (a Broker Architecture is the architectural style; a Message Broker is one specific technology implementing part of it).<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Name a historical and a modern example of Broker Architecture</td><td>Historical: CORBA/Java RMI registries. Modern: service meshes (Istio) and message brokers (Kafka/RabbitMQ)</td></tr>
</table>`
              }
            ]
          },

          // ===== 12. Peer-to-Peer =====
          {
            id: 'peer-to-peer-architecture-pattern',
            name: 'Peer-to-Peer (P2P) Architecture',
            beginner: [
              {
                content: `<h3>What is Peer-to-Peer Architecture?</h3>
In a P2P system, every node (<strong>peer</strong>) acts as <strong>both client and server</strong> - there's no central coordinating authority that all requests must pass through, unlike client-server or broker architectures.<br>
<br>
• <strong>Real examples:</strong> BitTorrent (peers both download AND upload file pieces to each other), blockchain networks (every node validates and relays transactions).<br>
• <strong>Tradeoff:</strong> no single point of failure and can scale organically as more peers join, but coordination/consistency (agreeing on shared state) is much harder without a central authority - blockchain's consensus algorithms exist specifically to solve this.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does P2P differ from client-server?</td><td>In P2P every node can act as both client and server with no central authority; client-server has a clear, fixed role split</td></tr>
<tr class='text-center'><td>What's the main challenge P2P systems face?</td><td>Achieving consistency/consensus on shared state without a central coordinator - which is why blockchain systems need consensus algorithms</td></tr>
</table>`
              }
            ]
          }

        ]
      }
    ],
    cheatNotes: [
      'Layered Architecture - horizontal layers, each depends only on the one below',
      'Hexagonal Architecture - core isolated behind ports, adapters plug in technology',
      'Clean/Onion Architecture - dependencies always point inward toward the domain',
      'Microservices - independently deployable services, each owning its own data',
      'Modular Monolith - one deployable unit, strict internal module boundaries',
      'Event-Driven Architecture - components communicate via events, fully decoupled',
      'Pipe and Filter - a sequence of independent transformation stages (Java Streams)',
      'Peer-to-Peer - every node is both client and server, no central authority'
    ],
    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'What is the Dependency Rule in Clean Architecture?',
          'How do Hexagonal, Clean, and Onion Architecture differ (if at all)?',
          'What are the main tradeoffs of microservices vs a monolith?',
          'What is a modular monolith and why would a team choose it?',
          'How does event-driven architecture differ from request-driven?',
          'What is the "sinkhole" anti-pattern in layered architecture?',
          "How does Java's Stream API relate to the Pipe and Filter pattern?",
          'What role does a broker play in Broker Architecture?',
          'How does Peer-to-Peer architecture differ from Client-Server?',
          'Why might a startup choose a monolith over microservices initially?'
        ]
      }
    ]
  }
];
