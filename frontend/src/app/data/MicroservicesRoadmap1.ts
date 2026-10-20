// Microservices roadmap, part 1: the roadmap overview and sections 1-5 (fundamentals, Spring Boot, communication, discovery and gateway, Spring Cloud).
// Examples use Java 21, Spring Boot 3.x and Spring Cloud 2023.x/2024.x. "${...}" placeholders are written "\${...}" in these template literals.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const ms = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('ms', n, title, priority, topics);

export const microservicesRoadmap1: SubTopic[] = [
  {
    id: 'ms-roadmap',
    name: 'Microservices Roadmap (15 Sections, 173 Topics)',
    topics: [
      topic(
        'ms-roadmap-overview',
        'Microservices Important Topics Checklist (173 Topics)',
        [
          blk(`<h3>How the roadmap is organised</h3>
• The 173 important microservices topics are grouped into <b>15 sections</b>, each a module of this course with worked examples (Java 21, Spring Boot 3, Spring Cloud) and interview questions. Sections marked <b>Essential</b> (Spring Boot microservices, communication, Spring Cloud, resilience, security, observability) matter most when designing and troubleshooting production systems.<br>
<table ${TABLE}>
<tr><th>Section</th><th>Topics</th><th>Items</th><th>Priority</th></tr>
<tr><td>1</td><td>Microservices Fundamentals</td><td>1-10</td><td>Core</td></tr>
<tr><td>2</td><td>Spring Boot Microservices</td><td>11-22</td><td>Essential</td></tr>
<tr><td>3</td><td>Microservices Communication</td><td>23-34</td><td>Essential</td></tr>
<tr><td>4</td><td>Service Discovery and API Gateway</td><td>35-44</td><td>Core</td></tr>
<tr><td>5</td><td>Spring Cloud</td><td>45-54</td><td>Essential</td></tr>
<tr><td>6</td><td>Resilience and Fault Tolerance</td><td>55-64</td><td>Essential</td></tr>
<tr><td>7</td><td>Database and Transactions</td><td>65-76</td><td>Core</td></tr>
<tr><td>8</td><td>Security</td><td>77-88</td><td>Essential</td></tr>
<tr><td>9</td><td>Distributed Systems</td><td>89-98</td><td>Core</td></tr>
<tr><td>10</td><td>Observability and Monitoring</td><td>99-110</td><td>Essential</td></tr>
<tr><td>11</td><td>Docker and Kubernetes</td><td>111-122</td><td>Core</td></tr>
<tr><td>12</td><td>CI/CD and DevOps</td><td>123-134</td><td>Core</td></tr>
<tr><td>13</td><td>Microservices Testing</td><td>135-146</td><td>Core</td></tr>
<tr><td>14</td><td>Advanced Architecture Patterns</td><td>147-158</td><td>Advanced</td></tr>
<tr><td>15</td><td>Microservices Interview Questions</td><td>159-173</td><td>Interview</td></tr>
</table>`),
        ],
        [
          blk(`<h3>Top 20 topics to master first (Spring Boot microservices developer)</h3>
1. Spring Boot REST APIs<br>
2. Monolithic vs microservices architecture<br>
3. Service-to-service communication<br>
4. OpenFeign and WebClient<br>
5. Service discovery with Eureka<br>
6. Spring Cloud Gateway<br>
7. Centralized configuration<br>
8. Load balancing<br>
9. Resilience4j circuit breaker<br>
10. Retry and timeout<br>
11. Kafka and event-driven architecture<br>
12. Database per service<br>
13. Saga pattern<br>
14. Spring Security and JWT<br>
15. Docker<br>
16. Kubernetes fundamentals<br>
17. Spring Boot Actuator<br>
18. Distributed tracing<br>
19. CI/CD pipelines<br>
20. Integration and contract testing<br>
<br>
<b>Recommendation:</b> master service communication, API Gateway, Resilience4j, Kafka, security, distributed transactions and observability: these concepts matter most when designing and troubleshooting production microservices.`),
        ],
        [
          blk(`<h3>Recommended technology stack</h3>
<table ${TABLE}>
<tr><th>Layer</th><th>Technology</th></tr>
<tr><td>Programming language</td><td>Java 21+</td></tr>
<tr><td>Framework</td><td>Spring Boot</td></tr>
<tr><td>Microservices</td><td>Spring Cloud</td></tr>
<tr><td>API gateway</td><td>Spring Cloud Gateway</td></tr>
<tr><td>Service discovery</td><td>Eureka</td></tr>
<tr><td>Database</td><td>PostgreSQL / MySQL</td></tr>
<tr><td>ORM</td><td>Hibernate / Spring Data JPA</td></tr>
<tr><td>Messaging</td><td>Apache Kafka</td></tr>
<tr><td>Resilience</td><td>Resilience4j</td></tr>
<tr><td>Security</td><td>Spring Security + OAuth 2.0 / OIDC</td></tr>
<tr><td>Containers</td><td>Docker</td></tr>
<tr><td>Orchestration</td><td>Kubernetes</td></tr>
<tr><td>Monitoring</td><td>Prometheus + Grafana</td></tr>
<tr><td>Distributed tracing</td><td>OpenTelemetry</td></tr>
<tr><td>CI/CD</td><td>Jenkins / GitHub Actions</td></tr>
</table>
Official documentation: spring.io/projects/spring-boot and spring.io/projects/spring-cloud.<br>
Note: on Kubernetes many Spring Cloud components (Eureka, Config Server, Gateway as ingress, LoadBalancer) are replaced by the platform (Services, ConfigMaps, Ingress); this course explains both worlds.`),
        ],
        [
          ['Which microservices topics should a Spring Boot developer learn first?', 'REST APIs, monolith vs microservices trade-offs, service communication (OpenFeign/WebClient), Eureka and Spring Cloud Gateway, centralised config, load balancing, Resilience4j (circuit breaker, retry, timeout), Kafka events, database per service and the Saga pattern, Spring Security with JWT, Docker, Kubernetes, Actuator, distributed tracing, CI/CD and integration/contract testing.'],
          ['What is the recommended stack?', 'Java 21+, Spring Boot with Spring Cloud (Gateway, Eureka, Config), PostgreSQL/MySQL with Hibernate, Kafka, Resilience4j, Spring Security with OAuth 2.0/OIDC, Docker and Kubernetes, Prometheus/Grafana with OpenTelemetry, and Jenkins or GitHub Actions.'],
        ],
      ),
    ],
  },

  ms(1, 'Microservices Fundamentals', 'Core', [
    topic(
      'ms-intro-monolith',
      'Introduction, Monolith vs Microservices, Advantages and Disadvantages',
      [
        blk(`<h3>What are microservices?</h3>
• A <b>microservices architecture</b> builds an application as a set of <b>small, autonomous services</b>, each around a <b>business capability</b>, owning its <b>own data</b>, <b>independently deployable</b> and communicating over the network (HTTP/REST, gRPC, messaging). Teams own services end to end ("you build it, you run it").<br>
• A <b>monolith</b> is one deployable unit with one codebase and (usually) one database. A <b>modular monolith</b> keeps one deployment but enforces module boundaries: often the best starting point.<br>
• Microservices are an <b>organisational and architectural</b> choice: they trade <b>local complexity</b> (a big codebase) for <b>distributed-systems complexity</b> (network, consistency, operations).`,
          `Monolith                                   Microservices
+--------------------------+               +-------+  +-------+  +--------+
| UI | Catalogue | Orders  |               | Course|  | Order |  | Payment|
| Users | Payments | ...   |  --split-->   | svc   |  | svc   |  | svc    |
+--------------------------+               +---+---+  +---+---+  +---+----+
        one process                              |         |          |
        one database                          [DB-1]    [DB-2]     [DB-3]    (database per service)
        one deployment                       independent build, deploy, scale, team`,
        ),
      ],
      [
        blk(`<h3>Monolithic vs microservices</h3>
<table ${TABLE}>
<tr><th>Aspect</th><th>Monolith</th><th>Microservices</th></tr>
<tr><td>Deployment</td><td>All or nothing</td><td>Per service, independent</td></tr>
<tr><td>Scaling</td><td>Scale the whole app</td><td>Scale only the hot service</td></tr>
<tr><td>Technology</td><td>One stack</td><td>Polyglot possible (keep it limited)</td></tr>
<tr><td>Data</td><td>One shared database, ACID transactions</td><td>Database per service, eventual consistency</td></tr>
<tr><td>Failure</td><td>One bug can take everything down</td><td>Failures isolated (if resilient design)</td></tr>
<tr><td>Team</td><td>Large team, shared code</td><td>Small autonomous teams per service</td></tr>
<tr><td>Complexity</td><td>Code complexity</td><td>Operations complexity: network, discovery, tracing, versioning</td></tr>
<tr><td>Latency</td><td>In-process calls</td><td>Network calls (ms), partial failures</td></tr>
<tr><td>Testing</td><td>End-to-end is simple</td><td>Contract and integration testing needed</td></tr>
<tr><td>Best for</td><td>Small teams, early products, simple domains</td><td>Large systems, many teams, different scaling needs</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Advantages and disadvantages</h3>
• <b>Advantages</b>: independent deployment and release cadence, targeted scaling, fault isolation, technology freedom, smaller codebases that are easier to understand, team autonomy, easier replacement/rewrite of a single service.<br>
• <b>Disadvantages</b>: distributed-system complexity (latency, partial failure, retries, timeouts), <b>data consistency</b> without cross-service transactions, <b>operational overhead</b> (CI/CD per service, monitoring, tracing, container orchestration), <b>testing difficulty</b>, versioning and compatibility, duplicated cross-cutting code, higher infrastructure cost, the need for DevOps maturity.<br>
• <b>When NOT to use them</b>: a small team, an unclear domain, no automation. The common failure is a <b>distributed monolith</b>: services that must be deployed together, share a database or call each other synchronously in long chains. Start with a <b>modular monolith</b> and extract services when a boundary proves stable and a real need (scale, team autonomy) appears.`,
          `Signs of a distributed monolith (anti-pattern)
 - services share one database / schema
 - a change needs coordinated releases of 3 services
 - synchronous call chains A -> B -> C -> D for one user request (latency multiplies, availability = product of all)
 - no one can run a service without the others

Availability maths: 4 services chained synchronously, each 99.9% available
   0.999^4 = 99.6% (about 35 hours of downtime per year instead of 8.7)`,
        ),
      ],
      [
        ['Monolith vs microservices: when to choose which?', 'Monolith (preferably modular) for small teams, new products and simple domains; microservices when a large organisation needs independent deployment, scaling and team autonomy and has the DevOps maturity to run distributed systems.'],
        ['What are the main drawbacks of microservices?', 'Distributed-system complexity (network failures, latency), data consistency without ACID across services, operational overhead (deployment, monitoring, tracing), harder testing and versioning, and higher infrastructure cost.'],
        ['What is a distributed monolith?', 'A system split into services that are still tightly coupled (shared database, coordinated deployments, long synchronous call chains), giving the downsides of both architectures.'],
      ],
    ),
    topic(
      'ms-decomposition-ddd',
      'Architecture Patterns, Service Decomposition, DDD, Bounded Context and Database per Service',
      [
        blk(`<h3>Service decomposition</h3>
• How to split a system: by <b>business capability</b> (catalogue, ordering, payment, shipping) or by <b>subdomain</b> (DDD). Not by technical layer (a "database service", a "UI service") and not too fine-grained (nano-services).<br>
• Good service boundaries: <b>high cohesion</b> (things that change together live together), <b>loose coupling</b> (few, stable interactions), <b>single owning team</b>, own data, can be explained in a sentence, can be deployed alone. <b>Conway's law</b>: system design mirrors communication structure: design teams and services together.<br>
• <b>Strangler fig</b> migrates a monolith step by step. <b>Event storming</b> workshops reveal events, commands and aggregates that suggest boundaries.`,
          `JavaSchoolLab domain split (by business capability)
 identity-service     users, registration, login, roles
 catalogue-service    courses, modules, topics, search
 learning-service     progress, bookmarks, streaks, notes
 assessment-service   quizzes, attempts, scoring, certificates
 payment-service      orders, invoices, payment gateway
 notification-service e-mail, push, in-app notifications
 analytics-service    events, dashboards (read model)

Rule of thumb: one service = one team = one database = one reason to change`,
        ),
      ],
      [
        blk(`<h3>Domain-Driven Design and bounded contexts</h3>
• <b>DDD</b> models software around the business domain with a <b>ubiquitous language</b> shared by developers and domain experts. <b>Strategic design</b>: split the domain into <b>subdomains</b> (core, supporting, generic) and <b>bounded contexts</b>.<br>
• A <b>bounded context</b> is a boundary inside which a model and its language are consistent. The same word means different things in different contexts: a <code>Customer</code> in Billing (payment terms) is not the <code>Customer</code> in Support (tickets). <b>A bounded context is the natural boundary of a microservice</b>.<br>
• <b>Tactical design</b> inside a context: <b>entities</b> (identity), <b>value objects</b> (immutable, equality by value), <b>aggregates</b> (consistency boundary with a root; one transaction modifies one aggregate), <b>repositories</b>, <b>domain services</b>, <b>domain events</b>. <b>Context mapping</b> describes relationships: shared kernel, customer/supplier, conformist, <b>anti-corruption layer</b>, open host service / published language.`,
          `// Two bounded contexts, two models of "Course"
// catalogue-service (rich content model)
public class Course { UUID id; String title; List<Module> modules; Instructor instructor; Money price; /* behaviour: publish(), addModule() */ }

// learning-service: only what progress tracking needs
public record EnrolledCourse(UUID courseId, String title, int totalTopics) {}      // copy of selected data, updated by events

// Aggregate: one transaction changes one aggregate
public class Order {                                   // aggregate root
    private final OrderId id; private final List<OrderLine> lines = new ArrayList<>(); private Status status;
    public void addLine(CourseId c, Money price) { if (status != Status.NEW) throw new IllegalStateException(); lines.add(new OrderLine(c, price)); }
    public Money total() { return lines.stream().map(OrderLine::price).reduce(Money.ZERO, Money::plus); }
}`,
        ),
      ],
      [
        blk(`<h3>Database per service</h3>
• Each service <b>owns its data</b>; no other service reads or writes its tables. Others use its <b>API or events</b>. Benefits: loose coupling, independent schema evolution, the freedom to pick the right store (PostgreSQL, MongoDB, Redis, Elasticsearch: <b>polyglot persistence</b>), independent scaling. Costs: no joins across services, no distributed ACID transactions (use sagas), data duplication and eventual consistency.<br>
• Levels of separation: private tables in a shared DB (weak), <b>schema per service</b> (pragmatic), <b>database per service</b> (strong). Never share tables.<br>
• <b>Queries across services</b>: API composition (aggregate calls), <b>CQRS read models</b> / materialized views fed by events, or a search/analytics store.<br>
• <b>Reference data</b>: store ids (<code>courseId</code>) plus a small local copy of what you need (title) updated via events: avoid synchronous lookups on every read.`,
          `# Each service has its own datasource and migrations
# catalogue-service
spring.datasource.url=jdbc:postgresql://catalogue-db:5432/catalogue
# learning-service
spring.datasource.url=jdbc:postgresql://learning-db:5432/learning

// WRONG: reading another service's table
// select * from catalogue.course where id = ?     (hidden coupling: a schema change breaks you)

// RIGHT: ask via API, or keep a local projection updated by events
@KafkaListener(topics = "catalogue.course-events", groupId = "learning")
void on(CourseRenamed e) { enrolledCourseRepo.updateTitle(e.courseId(), e.newTitle()); }`,
        ),
      ],
      [
        ['What is a bounded context and how does it relate to microservices?', 'A boundary within which a domain model and its language are consistent. Each bounded context is a natural candidate for a microservice with its own model and data.'],
        ['Why database per service?', 'It decouples services (independent schema changes and technology choices) and enforces access through APIs or events; the cost is no joins or ACID transactions across services, handled with sagas, events and read models.'],
        ['How do you decide service boundaries?', 'By business capability/subdomain and bounded context: high cohesion, loose coupling, single owning team, own data and independent deployability; avoid splitting by technical layer or into nano-services.'],
      ],
    ),
    topic(
      'ms-communication-12factor',
      'Communication Overview and the Twelve-Factor App',
      [
        blk(`<h3>Communication styles at a glance</h3>
<table ${TABLE}>
<tr><th>Style</th><th>Examples</th><th>Use for</th><th>Risks</th></tr>
<tr><td>Synchronous request/response</td><td>REST/HTTP, gRPC, GraphQL</td><td>Queries, commands needing an immediate answer</td><td>Temporal coupling, cascading failures, latency chains</td></tr>
<tr><td>Asynchronous messaging</td><td>Kafka, RabbitMQ, SQS</td><td>Events, long work, decoupling, load levelling</td><td>Eventual consistency, ordering, duplicates, harder debugging</td></tr>
<tr><td>Streaming</td><td>Kafka Streams, WebSocket, SSE</td><td>Real-time feeds, analytics</td><td>Operational complexity</td></tr>
</table>
• Rule: <b>prefer asynchronous events between services</b> for integration and keep synchronous calls short, few and protected by timeouts, retries and circuit breakers. Details in the Communication section.`),
      ],
      [
        blk(`<h3>The Twelve-Factor App</h3>
<table ${TABLE}>
<tr><th>#</th><th>Factor</th><th>In practice (Spring Boot / containers)</th></tr>
<tr><td>1</td><td>Codebase</td><td>One repo per service (or monorepo with clear modules), many deploys</td></tr>
<tr><td>2</td><td>Dependencies</td><td>Declared in <code>pom.xml</code>/Gradle; no reliance on system libs</td></tr>
<tr><td>3</td><td>Config</td><td>Environment variables / Config Server / ConfigMaps, not in code</td></tr>
<tr><td>4</td><td>Backing services</td><td>DB, broker, cache are attached resources via URLs/credentials</td></tr>
<tr><td>5</td><td>Build, release, run</td><td>Immutable images; CI builds, CD releases, runtime runs</td></tr>
<tr><td>6</td><td>Processes</td><td>Stateless processes; state in DB/cache (sessions in Redis/JWT)</td></tr>
<tr><td>7</td><td>Port binding</td><td>Embedded Tomcat/Netty exposes a port</td></tr>
<tr><td>8</td><td>Concurrency</td><td>Scale out with more instances (HPA)</td></tr>
<tr><td>9</td><td>Disposability</td><td>Fast startup, graceful shutdown (<code>server.shutdown=graceful</code>)</td></tr>
<tr><td>10</td><td>Dev/prod parity</td><td>Same backing services in dev (Testcontainers, Docker Compose)</td></tr>
<tr><td>11</td><td>Logs</td><td>Write to stdout as an event stream; the platform aggregates</td></tr>
<tr><td>12</td><td>Admin processes</td><td>One-off tasks as jobs (Flyway migration, batch) using the same image</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Twelve-factor in a Spring Boot service</h3>
• Add modern extensions ("beyond twelve-factor"): <b>API first</b> (OpenAPI contract), <b>telemetry</b> (metrics, traces), <b>authentication and authorisation</b> from day one, <b>health endpoints</b> for orchestrators.<br>
• Concretely: externalise everything environment-specific, never bake secrets into images, log JSON to stdout, handle <code>SIGTERM</code> (graceful shutdown), keep instances stateless, and make startup quick (lazy init, <code>spring.main.lazy-initialization</code> carefully, or native image/CRaC where needed).`,
          `# application.yml : twelve-factor friendly
server:
  port: \${PORT:8080}                       # port binding
  shutdown: graceful                       # disposability
spring:
  lifecycle: { timeout-per-shutdown-phase: 30s }
  datasource:
    url: \${DB_URL}                         # config from the environment (backing service)
    username: \${DB_USER}
    password: \${DB_PASSWORD}
management:
  endpoints.web.exposure.include: health,info,prometheus
  endpoint.health.probes.enabled: true     # /actuator/health/liveness and /readiness for Kubernetes
logging.structured.format.console: ecs     # JSON logs to stdout (Spring Boot 3.4+)`,
        ),
      ],
      [
        ['What are the twelve-factor app principles?', 'A set of guidelines for cloud-native services: one codebase, declared dependencies, config in the environment, backing services as resources, separate build/release/run, stateless processes, port binding, scale out, disposability, dev/prod parity, logs as streams and admin tasks as one-off processes.'],
        ['Why must microservices be stateless?', 'So any instance can serve any request and instances can be added, removed or restarted freely for scaling and resilience; state belongs in databases, caches or tokens.'],
        ['Sync vs async communication?', 'Synchronous calls give an immediate answer but couple availability and latency; asynchronous messaging decouples services and absorbs load but brings eventual consistency, ordering and duplicate-handling concerns.'],
      ],
    ),
  ]),

  ms(2, 'Spring Boot Microservices', 'Essential', [
    topic(
      'ms-sb-rest-layers',
      'Spring Boot Fundamentals, Creating Microservices, REST APIs, Layered Architecture and DTO Mapping',
      [
        blk(`<h3>Creating a microservice with Spring Boot</h3>
• <b>Spring Boot</b> provides auto-configuration, starters, an embedded server and production features (Actuator) so a service is a small executable jar. Generate from start.spring.io: <code>spring-boot-starter-web</code>, <code>-validation</code>, <code>-data-jpa</code>, <code>-actuator</code>, driver, <code>lombok</code>, <code>mapstruct</code>; Java 21, Maven/Gradle.<br>
• One service = one Maven module = one deployable jar/container image. Keep <b>small and focused</b>, with a package structure by feature. Use <b>virtual threads</b> on Java 21 (<code>spring.threads.virtual.enabled=true</code>) for blocking I/O-heavy services.`,
          `@SpringBootApplication
public class CatalogueServiceApplication {
    public static void main(String[] args) { SpringApplication.run(CatalogueServiceApplication.class, args); }
}

# application.yml
spring:
  application.name: catalogue-service
  threads.virtual.enabled: true            # Java 21 virtual threads for request handling
server.port: 8081

// pom.xml (excerpt)
// <parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.4.x</version></parent>
// <properties><java.version>21</java.version><spring-cloud.version>2024.0.x</spring-cloud.version></properties>
// <dependencyManagement> spring-cloud-dependencies (import scope) </dependencyManagement>`,
        ),
      ],
      [
        blk(`<h3>REST API development and layered architecture</h3>
• <b>REST conventions</b>: nouns for resources (<code>/api/v1/courses/{id}/modules</code>), HTTP verbs (GET/POST/PUT/PATCH/DELETE), status codes (200, 201 + <code>Location</code>, 204, 400, 401, 403, 404, 409, 422, 429, 500, 503), pagination (<code>?page=&amp;size=</code>), filtering/sorting, idempotent PUT/DELETE, HATEOAS optionally, <b>OpenAPI</b> docs with <code>springdoc-openapi</code>.<br>
• <b>Layers</b>: <b>controller</b> (HTTP, validation, mapping: thin) → <b>service</b> (business logic, transactions) → <b>repository</b> (persistence) → database; plus <b>DTOs</b>/mappers, <b>entities</b>, <b>clients</b> (calls to other services), <b>config</b>. Controllers never touch repositories; services never touch <code>HttpServletRequest</code>. Alternative: <b>hexagonal</b> (ports/adapters) for complex domains.`,
          `@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
class CourseController {
    private final CourseService service;

    @GetMapping("/{id}")
    CourseResponse get(@PathVariable UUID id) { return service.get(id); }

    @GetMapping
    PagedModel<CourseSummary> list(@RequestParam(defaultValue = "") String q, @PageableDefault(size = 20) Pageable pageable) {
        return new PagedModel<>(service.search(q, pageable));
    }

    @PostMapping
    ResponseEntity<CourseResponse> create(@Valid @RequestBody CreateCourseRequest request) {
        CourseResponse created = service.create(request);
        return ResponseEntity.created(URI.create("/api/v1/courses/" + created.id())).body(created);       // 201 + Location
    }

    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable UUID id) { service.delete(id); }
}

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
class CourseService {
    private final CourseRepository courses; private final CourseMapper mapper;
    CourseResponse get(UUID id) { return courses.findById(id).map(mapper::toResponse).orElseThrow(() -> new CourseNotFoundException(id)); }
    @Transactional CourseResponse create(CreateCourseRequest r) { return mapper.toResponse(courses.save(mapper.toEntity(r))); }
}`,
        ),
      ],
      [
        blk(`<h3>DTO and entity mapping</h3>
• <b>Never expose entities</b> across the API boundary: use <b>DTOs</b> (Java <code>record</code>s) for requests/responses. Reasons: API stability independent of the schema, no lazy-loading/N+1 during serialisation, no mass assignment (clients setting <code>role</code>/<code>price</code>), different shapes per use case.<br>
• Map with <b>MapStruct</b> (compile-time, fast, type-safe) or hand-written mappers. Keep <b>separate</b> DTOs for create/update/response; versioned DTO packages for API versions. Between services, DTOs are the <b>published contract</b>: evolve them compatibly (add optional fields, never remove/rename without versioning).`,
          `public record CourseResponse(UUID id, String title, BigDecimal price, String level, Instant createdAt) {}
public record CreateCourseRequest(@NotBlank @Size(max = 150) String title,
                                  @NotNull @DecimalMin("0.0") BigDecimal price,
                                  @NotNull Level level) {}

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)     // compile error if a field is forgotten
interface CourseMapper {
    CourseResponse toResponse(Course course);
    @Mapping(target = "id", ignore = true) @Mapping(target = "createdAt", ignore = true) @Mapping(target = "version", ignore = true)
    Course toEntity(CreateCourseRequest request);
}

// Tolerant reader: ignore unknown JSON properties so a producer can add fields without breaking consumers
// spring.jackson.deserialization.fail-on-unknown-properties=false   (default in Spring Boot)`,
        ),
      ],
      [
        ['Why use DTOs instead of entities in REST APIs?', 'DTOs decouple the API from the persistence model, prevent lazy-loading and recursion issues, stop mass assignment and allow different representations per use case and versions of the contract.'],
        ['What is the role of each layer in a Spring Boot microservice?', 'Controller handles HTTP and validation; service holds business logic and transactions; repository handles persistence; DTO/mapper types shape data at the boundary; client classes call other services.'],
        ['Which status code does a successful POST creating a resource return?', '201 Created with a Location header for the new resource (200 is possible but less precise); 204 for deletes without a body.'],
      ],
    ),
    topic(
      'ms-sb-config-profiles',
      'Configuration Management, Externalized Configuration and Spring Profiles',
      [
        blk(`<h3>Externalized configuration</h3>
• Spring Boot reads config from many sources in a defined <b>precedence</b> (highest wins): command line args → <code>SPRING_APPLICATION_JSON</code> → OS <b>environment variables</b> → <code>application-{profile}.yml</code> → <code>application.yml</code> → defaults in code. Relaxed binding: env var <code>SPRING_DATASOURCE_URL</code> maps to <code>spring.datasource.url</code>.<br>
• <b>Rule</b>: the same build artifact runs in every environment; only configuration changes (twelve-factor). Secrets never live in the repo or the image.<br>
• Bind typed groups with <code>@ConfigurationProperties</code> (validated, immutable records) instead of scattered <code>@Value</code>.`,
          `@ConfigurationProperties(prefix = "jsl.catalogue")
@Validated
public record CatalogueProperties(
        @NotBlank String searchIndex,
        @Min(1) @Max(200) int maxPageSize,
        Duration cacheTtl,
        @NestedConfigurationProperty Pricing pricing) {
    public record Pricing(@NotNull BigDecimal defaultPrice, String currency) {}
}

# application.yml
jsl:
  catalogue:
    search-index: courses
    max-page-size: 100
    cache-ttl: 10m
    pricing: { default-price: 999, currency: INR }

@EnableConfigurationProperties(CatalogueProperties.class)   // or @ConfigurationPropertiesScan
// usage: constructor-inject CatalogueProperties props`,
        ),
      ],
      [
        blk(`<h3>Spring profiles</h3>
• <b>Profiles</b> group beans and properties per environment: <code>application-dev.yml</code>, <code>application-prod.yml</code>; activate with <code>SPRING_PROFILES_ACTIVE=prod</code> (env var) or <code>--spring.profiles.active=prod</code>. <code>@Profile("dev")</code> on beans/configuration; profile groups (<code>spring.profiles.group.prod=prod,metrics</code>); <code>spring.config.import</code> to include optional files.<br>
• Typical split: <b>dev</b> (H2/Testcontainers, debug logging, mocks of other services), <b>test</b>, <b>staging</b>, <b>prod</b> (real DB, JSON logs, tracing sampling). Keep the differences <b>small</b>: large per-profile differences mean untested production paths.`,
          `# application.yml (shared)
spring.application.name: learning-service
management.endpoints.web.exposure.include: health,info,prometheus

---
spring.config.activate.on-profile: dev
spring.datasource.url: jdbc:h2:mem:learning
logging.level.com.javaschoollab: DEBUG
jsl.clients.catalogue.url: http://localhost:8081

---
spring.config.activate.on-profile: prod
spring.datasource.url: \${DB_URL}
jsl.clients.catalogue.url: http://catalogue-service            # resolved by DNS / Kubernetes Service
logging.level.root: INFO

@Configuration
@Profile("dev")
class DevDataLoader { @Bean CommandLineRunner seed(CourseRepository r) { return args -> r.save(new Course("Demo")); } }`,
        ),
      ],
      [
        blk(`<h3>Configuration management across many services</h3>
• With dozens of services you need a <b>central, versioned, auditable</b> way to manage config: <b>Spring Cloud Config Server</b> (Git-backed), <b>Kubernetes ConfigMaps/Secrets</b> (often mounted as env vars/files), <b>HashiCorp Vault</b> or cloud secret managers for secrets, <b>Consul KV</b>.<br>
• Practices: config in Git (reviewed, rollback), per-environment overrides, <b>encrypt secrets</b> (<code>{cipher}</code> in Config Server, Sealed Secrets/External Secrets in Kubernetes), <b>refresh without restart</b> where safe (<code>@RefreshScope</code>, Spring Cloud Bus), <b>validate config at startup</b> (fail fast with <code>@Validated</code> properties), and use <b>feature flags</b> (Unleash, FF4J, Togglz, LaunchDarkly) for runtime toggles instead of redeploying.`,
          `# bootstrap via spring.config.import (Spring Boot 3: no bootstrap.yml needed)
spring:
  application.name: catalogue-service
  config.import: "optional:configserver:http://config-server:8888"

# Kubernetes: environment from ConfigMap and Secret
# env:
#   - name: DB_URL        valueFrom: { configMapKeyRef: { name: catalogue-config, key: db-url } }
#   - name: DB_PASSWORD   valueFrom: { secretKeyRef: { name: catalogue-secrets, key: db-password } }

@RefreshScope                                    // re-created when /actuator/refresh is called
@Component class PriceRules { @Value("\${jsl.pricing.discount:0}") private int discount; /* ... */ }`,
        ),
      ],
      [
        ['What is the order of precedence for Spring Boot configuration?', 'Roughly: command-line arguments, environment variables, profile-specific files, application files, defaults; higher sources override lower ones, which lets the same artifact run in any environment.'],
        ['Why use @ConfigurationProperties instead of @Value?', 'It binds a group of properties to a typed, validated, ideally immutable object, giving type safety, IDE metadata, relaxed binding and one place to see all settings of a feature.'],
        ['How do you handle secrets in microservices?', 'Never in code or images: inject from a secret store (Vault, cloud secret manager, Kubernetes Secrets with encryption/External Secrets), restrict access, rotate and avoid logging them.'],
      ],
    ),
    topic(
      'ms-sb-validation-errors-logging-versioning',
      'Validation, Global Exception Handling, Logging and API Versioning',
      [
        blk(`<h3>Validation</h3>
• Use <b>Jakarta Bean Validation</b> (<code>spring-boot-starter-validation</code>): annotate DTOs (<code>@NotBlank</code>, <code>@Size</code>, <code>@Email</code>, <code>@Min</code>, <code>@Positive</code>, <code>@Pattern</code>, <code>@Valid</code> for nesting), trigger with <code>@Valid @RequestBody</code>, validate path/query params with <code>@Validated</code> on the class and constraints on parameters. <b>Custom constraints</b> (<code>@ValidSlug</code>) for domain rules; <b>cross-field</b> via class-level constraints.<br>
• Validate at the <b>edge</b> (controller) for format, and in the <b>domain</b> for business invariants. Fail with <b>400/422</b> and field-level messages. Never trust data from other services either (defensive consumers).`,
          `public record RegisterRequest(
        @NotBlank @Size(max = 80) String name,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 12, max = 100) String password,
        @NotNull @Past LocalDate birthDate) {}

@Target(FIELD) @Retention(RUNTIME) @Constraint(validatedBy = SlugValidator.class)
@interface ValidSlug { String message() default "must be lowercase letters, digits and hyphens"; Class<?>[] groups() default {}; Class<? extends Payload>[] payload() default {}; }
class SlugValidator implements ConstraintValidator<ValidSlug, String> {
    public boolean isValid(String v, ConstraintValidatorContext c) { return v == null || v.matches("^[a-z0-9]+(-[a-z0-9]+)*$"); }
}

@RestController @Validated
class SearchController {
    @GetMapping("/api/v1/search")
    List<CourseSummary> search(@RequestParam @Size(min = 2, max = 50) String q, @RequestParam(defaultValue = "20") @Max(100) int size) { ... }
}`,
        ),
      ],
      [
        blk(`<h3>Global exception handling (RFC 9457 Problem Details)</h3>
• Centralise error mapping with <b><code>@RestControllerAdvice</code></b>. Return a <b>consistent error body</b>: Spring 6 supports <b>Problem Details</b> (<code>ProblemDetail</code>, RFC 9457: <code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code>, <code>instance</code> + extensions) with <code>spring.mvc.problemdetails.enabled=true</code>.<br>
• Map: validation → 400/422 with field errors; not found → 404; conflicts/duplicates/optimistic lock → 409; auth → 401/403; downstream failures → 502/503/504; unexpected → 500 with a <b>correlation/trace id</b> and no stack trace or SQL in the body. <b>Log once</b> with the cause at the right level (4xx warn/info, 5xx error).`,
          `@RestControllerAdvice
class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders h, HttpStatusCode s, WebRequest r) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, "Validation failed");
        pd.setTitle("Invalid request");
        pd.setProperty("errors", ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(FieldError::getField, fe -> String.valueOf(fe.getDefaultMessage()), (a, b) -> a)));
        return ResponseEntity.unprocessableEntity().body(pd);
    }

    @ExceptionHandler(CourseNotFoundException.class)
    ProblemDetail notFound(CourseNotFoundException e) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
        pd.setType(URI.create("https://api.javaschoollab.com/problems/course-not-found"));
        return pd;
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail unexpected(Exception e) {
        log.error("Unhandled error", e);
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        pd.setDetail("Unexpected error");
        pd.setProperty("traceId", MDC.get("traceId"));                // support can find the logs
        return pd;
    }
}`,
        ),
      ],
      [
        blk(`<h3>Logging and API versioning</h3>
• <b>Logging</b>: SLF4J + Logback (default) or Log4j2; log to <b>stdout in JSON</b> (Spring Boot 3.4 structured logging: <code>logging.structured.format.console=ecs|gelf|logstash</code>), include <b>traceId/spanId/correlation id</b> (Micrometer Tracing adds them to MDC), service name and environment. Levels: ERROR (needs action), WARN (unexpected but handled), INFO (business events), DEBUG (off in prod). <b>Never log secrets, tokens, full card numbers or personal data</b>; use parameterised messages (<code>log.info("enrolled {}", id)</code>); do not log and rethrow the same exception at every layer.<br>
• <b>API versioning</b>: services must evolve without breaking consumers. Strategies: <b>URI</b> (<code>/api/v1/...</code>, simplest and most common), header (<code>Accept: application/vnd.jsl.v2+json</code>), query param. Spring Framework 7 adds first-class versioning support. Rules: <b>additive changes are non-breaking</b> (new optional fields/endpoints); removing/renaming/changing types is breaking: introduce <code>v2</code>, run both, <b>deprecate</b> (<code>Deprecation</code>/<code>Sunset</code> headers), then retire. Consumers use the <b>tolerant reader</b> pattern; test compatibility with contract tests.`,
          `@RestController
@RequestMapping("/api/v1/courses")
class CourseControllerV1 { /* original contract */ }

@RestController
@RequestMapping("/api/v2/courses")
class CourseControllerV2 {                                             // new shape: price becomes { amount, currency }
    @GetMapping("/{id}")
    ResponseEntity<CourseV2> get(@PathVariable UUID id) { ... }
}

// deprecate v1 politely
response.setHeader("Deprecation", "true");
response.setHeader("Sunset", "Wed, 31 Dec 2026 23:59:59 GMT");
response.setHeader("Link", "</api/v2/courses>; rel=\\"successor-version\\"");

// logging
log.info("course {} published by {}", course.id(), userId);             // parameterised, no string concatenation
// logging.structured.format.console=ecs     logging.pattern.level=%5p [\${spring.application.name},%X{traceId},%X{spanId}]`,
        ),
      ],
      [
        ['How do you handle exceptions globally in Spring Boot?', 'With @RestControllerAdvice (and ResponseEntityExceptionHandler) mapping exceptions to consistent HTTP status codes and RFC 9457 Problem Details bodies, including a trace id, without leaking internals.'],
        ['What makes an API change breaking?', 'Removing or renaming fields/endpoints, changing types or semantics, or making optional input required. Adding optional fields or endpoints is compatible; breaking changes need a new version and a deprecation period.'],
        ['What should and should not be logged?', 'Log business events, errors with context, trace/correlation ids in structured form; never log secrets, tokens, passwords or sensitive personal data, and avoid duplicated log-and-rethrow noise.'],
      ],
    ),
  ]),

  ms(3, 'Microservices Communication', 'Essential', [
    topic(
      'ms-sync-rest-clients',
      'Synchronous vs Asynchronous, REST Communication, RestClient, WebClient and OpenFeign',
      [
        blk(`<h3>Synchronous REST between services</h3>
• In synchronous communication the caller <b>waits</b> for the response (REST/HTTP+JSON, gRPC). Simple and familiar, good for <b>queries</b> and commands that need an answer, but it creates <b>temporal coupling</b>: if the callee is slow or down, the caller suffers. Availability of a chain multiplies; latency adds.<br>
• Always apply: <b>timeouts</b> (connect + read), <b>retries</b> for idempotent calls with backoff, <b>circuit breakers</b>, <b>bulkheads</b>, and <b>fallbacks</b>; propagate <b>trace/correlation ids</b> and the caller's <b>identity</b> (JWT). Prefer coarse-grained calls over chatty ones; avoid long chains.`,
          `// Think about this call: what if payment-service is slow or down?
// order-service  --HTTP-->  payment-service  --HTTP-->  fraud-service  --HTTP-->  ledger-service
// latency = sum of all, availability = product of all, one slow service blocks threads in all callers

// Mitigations: timeouts, circuit breaker, async events for the non-critical hops (fraud/ledger after the response)`,
        ),
      ],
      [
        blk(`<h3>RestClient (Spring 6.1+) and WebClient</h3>
• <b><code>RestClient</code></b> is the modern <b>synchronous</b>, fluent HTTP client (replaces <code>RestTemplate</code>, which is in maintenance mode). Works great with <b>virtual threads</b>. Build with <code>RestClient.builder()</code> (inject <code>RestClient.Builder</code> so Boot adds observability/trace headers), set base URL and defaults, use <code>retrieve().body(Type.class)</code> and <code>onStatus</code> for error mapping.<br>
• <b><code>WebClient</code></b> (Spring WebFlux) is the <b>reactive, non-blocking</b> client: returns <code>Mono</code>/<code>Flux</code>; use for streaming, high concurrency with few threads, or reactive stacks. Do not call <code>.block()</code> inside a reactive pipeline.<br>
• <b>HTTP Interface clients</b> (<code>@HttpExchange</code>) generate a typed client from an interface on top of RestClient/WebClient: Spring's own "Feign".`,
          `@Configuration
class ClientConfig {
    @Bean
    RestClient catalogueClient(RestClient.Builder builder, @Value("\${jsl.clients.catalogue.url}") String url) {
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build());
        factory.setReadTimeout(Duration.ofSeconds(3));
        return builder.baseUrl(url).requestFactory(factory).defaultHeader(HttpHeaders.ACCEPT, "application/json").build();
    }

    @Bean
    CatalogueApi catalogueApi(RestClient catalogueClient) {                       // declarative HTTP interface
        return HttpServiceProxyFactory.builderFor(RestClientAdapter.create(catalogueClient)).build().createClient(CatalogueApi.class);
    }
}

interface CatalogueApi {
    @GetExchange("/api/v1/courses/{id}") CourseDto get(@PathVariable UUID id);
    @GetExchange("/api/v1/courses") List<CourseDto> byIds(@RequestParam List<UUID> ids);
}

// manual RestClient call with error mapping
CourseDto dto = catalogueClient.get().uri("/api/v1/courses/{id}", id)
    .retrieve()
    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> { throw new CourseNotFoundException(id); })
    .body(CourseDto.class);

// WebClient (reactive)
Mono<CourseDto> mono = webClient.get().uri("/api/v1/courses/{id}", id).retrieve().bodyToMono(CourseDto.class).timeout(Duration.ofSeconds(3));`,
        ),
      ],
      [
        blk(`<h3>OpenFeign (Spring Cloud OpenFeign)</h3>
• <b>OpenFeign</b> is a <b>declarative REST client</b>: write an interface with Spring MVC annotations, Spring Cloud generates the implementation, integrates with <b>service discovery</b> (<code>name = "catalogue-service"</code> resolved via LoadBalancer), <b>Resilience4j</b>, interceptors (auth/trace headers), encoders/decoders and error decoders.<br>
• Configure <b>timeouts</b> (<code>spring.cloud.openfeign.client.config.default.connect-timeout/read-timeout</code>), logging, retries (<b>disable Feign's own retryer</b> and use Resilience4j to avoid double retries), and a <b>custom ErrorDecoder</b> mapping 4xx/5xx to domain exceptions. Add <code>@EnableFeignClients</code>. Keep clients thin and DTOs in the consumer (or a published client library with the contract).`,
          `@FeignClient(name = "catalogue-service", path = "/api/v1/courses", fallbackFactory = CatalogueFallbackFactory.class)
interface CatalogueClient {
    @GetMapping("/{id}") CourseDto get(@PathVariable("id") UUID id);
    @GetMapping List<CourseDto> byIds(@RequestParam("ids") List<UUID> ids);
}

@Component
class CatalogueFallbackFactory implements FallbackFactory<CatalogueClient> {
    public CatalogueClient create(Throwable cause) {
        return new CatalogueClient() {
            public CourseDto get(UUID id) { return CourseDto.unavailable(id); }               // degraded but alive
            public List<CourseDto> byIds(List<UUID> ids) { return List.of(); }
        };
    }
}

# application.yml
spring.cloud.openfeign:
  circuitbreaker.enabled: true
  client.config.default:
    connect-timeout: 2000
    read-timeout: 3000
    logger-level: basic
    error-decoder: com.javaschoollab.client.CatalogueErrorDecoder

// propagate the caller's JWT to downstream services
@Bean RequestInterceptor bearer() {
    return t -> { var a = SecurityContextHolder.getContext().getAuthentication(); if (a instanceof JwtAuthenticationToken j) t.header("Authorization", "Bearer " + j.getToken().getTokenValue()); };
}`,
        ),
      ],
      [
        ['RestTemplate vs RestClient vs WebClient vs Feign?', 'RestTemplate is legacy blocking; RestClient is the modern fluent blocking client (good with virtual threads); WebClient is reactive and non-blocking; OpenFeign is a declarative interface-based client integrated with discovery and Resilience4j. Choose by stack and style.'],
        ['Why are timeouts mandatory on service calls?', 'Without them a slow dependency makes threads wait indefinitely, exhausting thread/connection pools and causing cascading failures; timeouts bound the damage and let retries and circuit breakers react.'],
        ['What is temporal coupling?', 'When a service can only work if another is available right now, because it waits synchronously for it. Asynchronous messaging removes this coupling.'],
      ],
    ),
    topic(
      'ms-kafka-rabbitmq',
      'Apache Kafka, RabbitMQ, Event-Driven Architecture and Message Serialization',
      [
        blk(`<h3>Event-driven architecture</h3>
• Services communicate through <b>events</b>: immutable facts about something that happened (<code>OrderPlaced</code>, <code>CourseCompleted</code>). The producer publishes without knowing the consumers; consumers react independently. Benefits: <b>loose coupling</b>, <b>scalability</b>, resilience (the consumer can be down; messages wait), easy addition of new consumers, <b>audit trail</b> and real-time reactions.<br>
• Kinds of messages: <b>event</b> (fact, past tense, many consumers), <b>command</b> (request to do something, one consumer), <b>document/query-reply</b>. Event styles: <b>event notification</b> (small, consumer calls back for details), <b>event-carried state transfer</b> (carries the data; no callbacks), <b>event sourcing</b> (events are the source of truth).<br>
• Costs: eventual consistency, ordering and duplicate delivery to handle, harder debugging, schema evolution: invest in tracing, idempotent consumers and schema registries.`,
          `Producer (order-service)            Broker (Kafka topic "orders.events")           Consumers
 OrderPlaced  ----------------->  [ partition 0 | partition 1 | partition 2 ]  -->  payment-service (group "payment")
                                                                               -->  notification-service (group "notify")
                                                                               -->  analytics-service (group "analytics")
 Each consumer GROUP gets every event once; instances inside a group share partitions (scale-out)`,
        ),
      ],
      [
        blk(`<h3>Apache Kafka with Spring Boot</h3>
• <b>Kafka</b> is a distributed, partitioned, replicated <b>commit log</b>. Concepts: <b>topic</b>, <b>partition</b> (unit of parallelism and ordering: order is guaranteed <b>per partition</b>), <b>key</b> (same key → same partition → ordered per entity, e.g. <code>orderId</code>), <b>offset</b>, <b>consumer group</b> (each partition consumed by one member), <b>replication factor</b>, retention (events stay for days: replay!), <b>log compaction</b>.<br>
• Producer settings for safety: <code>acks=all</code>, <code>enable.idempotence=true</code>, retries; consumer: manual/after-processing commit, <b>idempotent processing</b>, <b>dead-letter topic</b> (DLT) with <code>DefaultErrorHandler</code>/<code>@RetryableTopic</code>. Delivery guarantee is <b>at-least-once</b> by default; <b>exactly-once</b> only within Kafka (transactions) or via idempotent consumers.`,
          `spring:
  kafka:
    bootstrap-servers: \${KAFKA_BROKERS:localhost:9092}
    producer:
      acks: all
      properties: { enable.idempotence: true, linger.ms: 5, compression.type: lz4 }
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: payment-service
      auto-offset-reset: earliest
      enable-auto-commit: false
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties: { spring.json.trusted.packages: com.javaschoollab.events }

@Service @RequiredArgsConstructor
class OrderEventPublisher {
    private final KafkaTemplate<String, OrderPlaced> kafka;
    void publish(OrderPlaced e) { kafka.send("orders.events", e.orderId().toString(), e); }    // key = orderId: ordered per order
}

@Component
class PaymentListener {
    @RetryableTopic(attempts = "4", backoff = @Backoff(delay = 1000, multiplier = 2), dltStrategy = DltStrategy.FAIL_ON_ERROR)
    @KafkaListener(topics = "orders.events", groupId = "payment-service")
    void on(OrderPlaced event, @Header(KafkaHeaders.RECEIVED_KEY) String key) { paymentService.requestPayment(event); }     // must be idempotent

    @DltHandler void dead(OrderPlaced event) { log.error("DLT {}", event); alerts.notify(event); }
}`,
        ),
      ],
      [
        blk(`<h3>RabbitMQ and message serialization</h3>
• <b>RabbitMQ</b> is a message <b>broker</b> (AMQP) with <b>exchanges</b> (direct, topic, fanout, headers) routing to <b>queues</b> via binding keys; consumers ack messages (removed once acknowledged). Great for <b>task queues</b>, work distribution, complex routing, request/reply, priority and per-message TTL. Kafka is a <b>log</b> for high-throughput streams, replay and many independent consumer groups; RabbitMQ is a <b>smart broker</b> for routing and queue semantics. Spring: <code>spring-boot-starter-amqp</code>, <code>RabbitTemplate</code>, <code>@RabbitListener</code>, dead-letter exchanges, publisher confirms, manual acks.<br>
• <b>Serialization</b>: JSON (readable, flexible), <b>Avro/Protobuf</b> with a <b>Schema Registry</b> (compact, typed, enforced compatibility: backward/forward/full). Rules: never remove or change a field's meaning; add optional fields with defaults; include <b>event id, type, version, occurredAt, correlation id</b> in an envelope; use <b>type headers</b> carefully (avoid Java class names across services: they couple consumers to producer packages).`,
          `// RabbitMQ
@Configuration class RabbitConfig {
    @Bean TopicExchange events() { return new TopicExchange("jsl.events"); }
    @Bean Queue notifyQueue() { return QueueBuilder.durable("notify.enrollment").deadLetterExchange("jsl.dlx").build(); }
    @Bean Binding bind(Queue notifyQueue, TopicExchange events) { return BindingBuilder.bind(notifyQueue).to(events).with("enrollment.*"); }
    @Bean Jackson2JsonMessageConverter converter() { return new Jackson2JsonMessageConverter(); }
}
rabbit.convertAndSend("jsl.events", "enrollment.created", new EnrollmentCreated(...));
@RabbitListener(queues = "notify.enrollment") void on(EnrollmentCreated e) { mailer.send(e); }       // ack on success, DLX on failure

// Event envelope: stable, versioned, self-describing
public record EventEnvelope<T>(UUID eventId, String type, int version, Instant occurredAt, String correlationId, T payload) {}
// {"eventId":"7d1c...","type":"OrderPlaced","version":1,"occurredAt":"2026-10-20T10:15:30Z","correlationId":"b3f...","payload":{"orderId":"...","total":1999}}

// Avro schema evolution: add a field WITH a default => compatible
// {"name":"coupon","type":["null","string"],"default":null}`,
        ),
      ],
      [
        ['Kafka vs RabbitMQ?', 'Kafka is a partitioned replicated log for high-throughput streaming, replay and multiple independent consumer groups; RabbitMQ is a routing broker with queues and acknowledgements, suited to work queues, flexible routing and request/reply.'],
        ['How does Kafka guarantee ordering?', 'Only within a partition. Using the entity id as the message key sends all events of that entity to the same partition, preserving their order.'],
        ['How do you evolve event schemas safely?', 'Use a schema registry with compatibility rules, only add optional fields with defaults, never remove or repurpose fields, version events, and keep consumers tolerant of unknown fields.'],
      ],
    ),
    topic(
      'ms-timeouts-retries-idempotency',
      'Timeouts, Retries, Idempotency and Distributed Messaging',
      [
        blk(`<h3>Timeouts and retries</h3>
• <b>Timeout budget</b>: choose timeouts from the user-visible SLA downwards: if the API must answer in 2 s and calls 2 services, each gets well under 1 s. A timeout must be <b>shorter</b> than the caller's own timeout, otherwise the caller gives up while work continues. Set <b>connect</b> and <b>read</b> timeouts; HTTP clients default to infinite.<br>
• <b>Retries</b> help with transient failures (network blips, deployments, 503), but only for <b>idempotent</b> operations (GET, PUT, DELETE, or POST with an idempotency key). Use <b>exponential backoff with jitter</b> and a small max attempts; never retry non-transient errors (400/401/403/404/422). Beware <b>retry amplification</b>: three layers each retrying 3 times = 27 calls (retry storm). Retry at <b>one layer</b> and give a retry budget.`,
          `# Resilience4j retry with exponential backoff and jitter (retry only what is transient)
resilience4j.retry.instances.payment:
  max-attempts: 3
  wait-duration: 200ms
  enable-exponential-backoff: true
  exponential-backoff-multiplier: 2
  enable-randomized-wait: true               # jitter spreads retries
  retry-exceptions: [java.net.SocketTimeoutException, org.springframework.web.client.ResourceAccessException]
  ignore-exceptions: [com.javaschoollab.BadRequestException]

// Timeout budget: user -> gateway (2s) -> order-service (1.5s) -> payment-service (800ms)
// Each hop's timeout is smaller than its caller's.`,
        ),
      ],
      [
        blk(`<h3>Idempotency</h3>
• An operation is <b>idempotent</b> if repeating it has the same effect as doing it once. Needed because networks and brokers deliver <b>at-least-once</b> and clients retry. Naturally idempotent: <code>PUT /users/5 {...}</code>, <code>DELETE</code>, setting a value. Not idempotent: <code>POST /payments</code>, "increment counter", "send e-mail".<br>
• <b>Idempotency key</b> pattern: the client sends a unique <code>Idempotency-Key</code> (UUID) header; the server stores <code>key → response</code> (or status) in a table with a <b>unique constraint</b> and, if the key repeats, returns the stored result instead of re-executing. For consumers: store processed <b>message ids</b> (inbox table) or make the write itself idempotent (upsert, unique business key, conditional update).`,
          `@PostMapping("/api/v1/payments")
ResponseEntity<PaymentResponse> pay(@RequestHeader("Idempotency-Key") UUID key, @Valid @RequestBody PayRequest req) {
    return idempotency.execute(key, () -> payments.charge(req));        // second call with the same key returns the first result
}

@Service @RequiredArgsConstructor
class IdempotencyService {
    private final IdempotencyRepository repo;
    @Transactional
    <T> ResponseEntity<T> execute(UUID key, Supplier<T> action) {
        try {
            repo.saveAndFlush(new IdempotencyRecord(key, "IN_PROGRESS"));                 // unique constraint on key
        } catch (DataIntegrityViolationException dup) {
            return replay(key);                                                         // already seen: return the stored response
        }
        T result = action.get();
        repo.complete(key, serialize(result));
        return ResponseEntity.status(201).body(result);
    }
}
// CREATE TABLE idempotency_record (key UUID PRIMARY KEY, status VARCHAR(20), response JSONB, created_at TIMESTAMP);`,
        ),
      ],
      [
        blk(`<h3>Distributed messaging concerns</h3>
• <b>Delivery semantics</b>: at-most-once (may lose), <b>at-least-once</b> (default; duplicates possible → idempotent consumers), exactly-once (end to end is a myth; achieved by at-least-once + idempotency, or Kafka transactions inside Kafka).<br>
• <b>Ordering</b>: only within a partition/queue; design so that unrelated events do not depend on order, or key by entity. <b>Poison messages</b>: a message that always fails blocks the partition: use limited retries + <b>dead-letter queue/topic</b> + alerting + a replay tool.<br>
• <b>Backpressure</b> and <b>consumer lag</b> (monitor!), <b>batching</b>, <b>outbox</b> for atomic "DB write + publish", <b>inbox</b> for deduplication, <b>request/reply over messaging</b> with correlation ids when really needed, <b>message TTL</b> for time-sensitive commands.`,
          `// Inbox table: deduplicate consumed messages
@KafkaListener(topics = "payments.events", groupId = "order-service")
@Transactional
void on(EventEnvelope<PaymentCompleted> msg) {
    if (!inbox.tryInsert(msg.eventId())) { log.debug("duplicate {}", msg.eventId()); return; }     // INSERT ... ON CONFLICT DO NOTHING
    orders.markPaid(msg.payload().orderId());                                                        // business change in the same transaction
}

// Consumer lag alert (Prometheus): sum(kafka_consumergroup_lag{group="order-service"}) > 10000 for 5m

// Poison message handling
// attempts 1,2,3 (backoff) -> dead-letter topic "orders.events-dlt" -> alert -> fix -> replay from the DLT`,
        ),
      ],
      [
        ['Why must consumers be idempotent?', 'Brokers deliver at-least-once and retries or rebalances can redeliver messages; idempotent processing (inbox table, unique keys, upserts) ensures duplicates do not cause duplicate side effects.'],
        ['What is a retry storm and how do you prevent it?', 'Layers of clients each retrying failed calls multiply load on an already struggling service. Prevent with retries at one layer, exponential backoff with jitter, limited attempts, circuit breakers and retry budgets.'],
        ['What is an idempotency key?', 'A client-generated unique id sent with a request so the server can detect repeats and return the original result instead of executing the operation twice.'],
      ],
    ),
  ]),

  ms(4, 'Service Discovery and API Gateway', 'Core', [
    topic(
      'ms-discovery-eureka-consul',
      'Service Discovery: Netflix Eureka and Consul',
      [
        blk(`<h3>Why service discovery?</h3>
• In dynamic environments (containers, autoscaling) instances start, stop and change IP/port constantly: hard-coded URLs do not work. <b>Service discovery</b> lets services <b>register</b> themselves and clients <b>look up</b> healthy instances by logical name (<code>catalogue-service</code>).<br>
• <b>Client-side discovery</b>: the client queries a registry and load-balances itself (Eureka + Spring Cloud LoadBalancer, Consul). <b>Server-side discovery</b>: a router/load balancer does it (Kubernetes Service/kube-proxy, AWS ALB, Ingress): the client calls a stable DNS name.<br>
• <b>On Kubernetes you usually do not need Eureka</b>: Services + DNS (<code>http://catalogue-service</code>) provide discovery and load balancing. Use Eureka/Consul on VMs, hybrid setups, or when you need metadata-based routing.`,
          `Client-side discovery (Eureka)                       Server-side discovery (Kubernetes)
 order-service                                         order-service
   | 1. "where is catalogue-service?"                     | calls http://catalogue-service  (stable DNS)
   v                                                      v
 [Eureka registry] -> instances: 10.0.1.5:8081, 10.0.1.6:8081
   | 2. client picks one (round robin)                  [K8s Service] -> kube-proxy -> pod 1 / pod 2 / pod 3`,
        ),
      ],
      [
        blk(`<h3>Netflix Eureka</h3>
• <b>Eureka Server</b> is the registry (<code>spring-cloud-starter-netflix-eureka-server</code>, <code>@EnableEurekaServer</code>). <b>Eureka Client</b> services register on startup with their name, host, port and health URL, send <b>heartbeats</b> (every 30 s) and are evicted if heartbeats stop (90 s). Clients <b>cache</b> the registry locally and refresh periodically (30 s): discovery keeps working if Eureka is briefly down, but data can be <b>stale</b>.<br>
• <b>Self-preservation mode</b>: if many instances stop heartbeating at once (network partition), Eureka stops evicting to avoid wiping the registry: it favours <b>availability over consistency</b> (AP in CAP).<br>
• Run <b>several Eureka peers</b> (peer replication) in production; <b>secure</b> the registry (Spring Security basic/mTLS); tune lease and refresh intervals for faster failure detection; register with the Actuator <b>health</b> check (<code>eureka.client.healthcheck.enabled=true</code>).`,
          `// Eureka server
@SpringBootApplication @EnableEurekaServer
public class DiscoveryServer { public static void main(String[] a) { SpringApplication.run(DiscoveryServer.class, a); } }
# application.yml (standalone dev)
server.port: 8761
eureka:
  client: { register-with-eureka: false, fetch-registry: false }
  server: { enable-self-preservation: true }

# Eureka client (every service)
spring.application.name: catalogue-service
eureka:
  client:
    service-url.defaultZone: http://eureka-1:8761/eureka/,http://eureka-2:8761/eureka/
    healthcheck.enabled: true
  instance:
    prefer-ip-address: true
    lease-renewal-interval-in-seconds: 10
    lease-expiration-duration-in-seconds: 30

// calling by logical name with Feign / @LoadBalanced RestClient
@Bean @LoadBalanced RestClient.Builder lb() { return RestClient.builder(); }
lb.build().get().uri("http://catalogue-service/api/v1/courses/{id}", id).retrieve().body(CourseDto.class);`,
        ),
      ],
      [
        blk(`<h3>Consul and how Eureka works internally</h3>
• <b>HashiCorp Consul</b>: service registry + <b>health checks</b> (HTTP/TCP/script, agents on each node) + <b>key-value store</b> (config) + DNS interface + <b>service mesh</b> (mTLS, intents/ACLs). Consistent via Raft (CP for the catalog), with gossip between agents. Spring: <code>spring-cloud-starter-consul-discovery</code>, <code>-config</code>.<br>
<table ${TABLE}>
<tr><th></th><th>Eureka</th><th>Consul</th><th>Kubernetes DNS</th></tr>
<tr><td>Model</td><td>AP registry, client cache</td><td>CP catalog + health agents</td><td>Platform built-in</td></tr>
<tr><td>Health</td><td>Heartbeats (+ optional health check)</td><td>Rich active checks</td><td>Readiness probes</td></tr>
<tr><td>Extras</td><td>Spring-centric</td><td>KV, mesh, multi-DC</td><td>Services, Ingress</td></tr>
<tr><td>Use</td><td>VMs/Spring Cloud</td><td>Polyglot, hybrid, mesh</td><td>Default on Kubernetes</td></tr>
</table>
• <b>How Eureka works</b>: register → heartbeat renew → server replicates to peers → clients fetch the full/delta registry and cache it → LoadBalancer chooses an instance → eviction when the lease expires.`,
          `# Consul discovery in Spring Boot
spring:
  application.name: catalogue-service
  cloud.consul:
    host: consul
    port: 8500
    discovery:
      health-check-path: /actuator/health
      health-check-interval: 10s
      instance-id: \${spring.application.name}:\${random.value}
  config.import: "optional:consul:"

// Query instances programmatically
@Autowired DiscoveryClient discovery;
List<ServiceInstance> instances = discovery.getInstances("catalogue-service");
instances.forEach(i -> log.info("{} -> {}", i.getInstanceId(), i.getUri()));`,
        ),
      ],
      [
        ['How does Eureka work?', 'Services register with the Eureka server and renew a lease with heartbeats; the server evicts instances whose lease expires and replicates the registry to peers. Clients fetch and cache the registry and pick instances with a client-side load balancer.'],
        ['What is Eureka self-preservation mode?', 'When many heartbeats are missed at once Eureka assumes a network problem and stops evicting instances, trading consistency for availability so a partition does not empty the registry.'],
        ['Do you need Eureka on Kubernetes?', 'Usually no: Kubernetes Services and DNS provide discovery and load balancing. Eureka or Consul still make sense on VMs, in hybrid environments or when you need extra metadata or mesh features.'],
      ],
    ),
    topic(
      'ms-gateway-spring-cloud',
      'API Gateway, Spring Cloud Gateway, Routing, Rate Limiting and Request Filtering',
      [
        blk(`<h3>What is an API gateway?</h3>
• An <b>API gateway</b> is the single entry point for clients. It handles <b>cross-cutting concerns</b> once: <b>routing</b> to services, <b>authentication</b> (validate JWT), <b>rate limiting</b>, <b>TLS termination</b>, CORS, request/response transformation, logging/tracing, caching, and sometimes <b>API composition</b> or protocol translation. It hides internal topology: clients call <code>api.javaschoollab.com/courses</code>, not ten services.<br>
• Variants: one gateway for all, or <b>Backend for Frontend</b> (a gateway per client type: web, mobile). <b>Risks</b>: single point of failure/bottleneck (run several, keep it stateless), business logic creeping in (keep it thin), extra latency.<br>
• Options: <b>Spring Cloud Gateway</b> (WebFlux or the newer MVC variant), Kong, NGINX, Envoy, AWS API Gateway, Kubernetes Ingress/Gateway API.`,
          `Client (web / mobile)
      |
      v
 [ API Gateway ]  -> TLS, JWT validation, rate limit, CORS, routing, tracing headers
      |--> /api/identity/**    -> identity-service
      |--> /api/courses/**     -> catalogue-service   (lb://catalogue-service)
      |--> /api/learning/**    -> learning-service
      '--> /api/payments/**    -> payment-service`,
        ),
      ],
      [
        blk(`<h3>Spring Cloud Gateway: routes, predicates and filters</h3>
• A <b>route</b> = id + target URI (<code>lb://service</code> uses discovery + LoadBalancer, or an HTTP URL) + <b>predicates</b> (when to match: <code>Path</code>, <code>Method</code>, <code>Header</code>, <code>Host</code>, <code>Query</code>, <code>After</code>, <code>Weight</code>) + <b>filters</b> (modify request/response: <code>StripPrefix</code>, <code>RewritePath</code>, <code>AddRequestHeader</code>, <code>CircuitBreaker</code>, <code>Retry</code>, <code>RequestRateLimiter</code>, <code>DedupeResponseHeader</code>). <b>Global filters</b> apply to all routes (auth, logging, correlation id).<br>
• Define routes in YAML or Java DSL; add <code>spring-cloud-starter-gateway</code> (reactive) and the discovery client.`,
          `spring:
  cloud:
    gateway:
      default-filters:
        - DedupeResponseHeader=Access-Control-Allow-Origin
        - AddResponseHeader=X-Content-Type-Options, nosniff
      routes:
        - id: catalogue
          uri: lb://catalogue-service
          predicates: [ Path=/api/courses/** ]
          filters:
            - StripPrefix=0
            - name: CircuitBreaker
              args: { name: catalogueCb, fallbackUri: forward:/fallback/courses }
            - name: Retry
              args: { retries: 2, statuses: BAD_GATEWAY,SERVICE_UNAVAILABLE, methods: GET, backoff: { firstBackoff: 100ms, maxBackoff: 1s, factor: 2 } }
        - id: payments
          uri: lb://payment-service
          predicates: [ Path=/api/payments/** , Method=POST,GET ]
          filters: [ name: RequestRateLimiter, args: { redis-rate-limiter.replenishRate: 10, redis-rate-limiter.burstCapacity: 20, key-resolver: "#{@userKeyResolver}" } ]

// Java DSL
@Bean RouteLocator routes(RouteLocatorBuilder b) {
    return b.routes().route("learning", r -> r.path("/api/learning/**").filters(f -> f.addRequestHeader("X-Gateway", "jsl")).uri("lb://learning-service")).build();
}`,
        ),
      ],
      [
        blk(`<h3>Rate limiting, request filtering and gateway security</h3>
• <b>Rate limiting</b> protects services from abuse and overload: algorithms <b>token bucket</b> (burst + steady rate; used by the Redis rate limiter), leaky bucket, fixed/sliding window. Key by user id, API key or IP (<code>KeyResolver</code>); respond <b>429 Too Many Requests</b> with <code>Retry-After</code>. Spring Cloud Gateway's <code>RequestRateLimiter</code> needs <b>Redis</b> (shared counters across gateway instances).<br>
• <b>Request filtering</b>: a <b>global filter</b> to validate the JWT and forward claims as headers, add a <b>correlation id</b>, enforce size limits, block bad paths/IPs, strip internal headers coming from clients (<b>never trust client-supplied <code>X-User-Id</code></b>), log access. Order matters (<code>Ordered</code>).<br>
• <b>Gateway security</b>: terminate TLS, validate tokens (resource server), CORS config in one place, security headers, WAF in front. Still <b>verify authorisation in each service</b> (zero trust): the gateway is not the only gate.`,
          `@Bean KeyResolver userKeyResolver() {                                  // limit per authenticated user, fallback to IP
    return exchange -> exchange.getPrincipal().map(Principal::getName)
        .switchIfEmpty(Mono.fromSupplier(() -> exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()));
}

@Component
class CorrelationIdFilter implements GlobalFilter, Ordered {
    public Mono<Void> filter(ServerWebExchange ex, GatewayFilterChain chain) {
        String id = Optional.ofNullable(ex.getRequest().getHeaders().getFirst("X-Correlation-Id")).orElse(UUID.randomUUID().toString());
        ServerHttpRequest req = ex.getRequest().mutate()
            .headers(h -> { h.remove("X-User-Id"); h.set("X-Correlation-Id", id); })        // strip spoofable headers, add id
            .build();
        return chain.filter(ex.mutate().request(req).build()).then(Mono.fromRunnable(() -> ex.getResponse().getHeaders().set("X-Correlation-Id", id)));
    }
    public int getOrder() { return Ordered.HIGHEST_PRECEDENCE; }
}

// resource-server security at the gateway (reactive)
@Bean SecurityWebFilterChain security(ServerHttpSecurity http) {
    return http.csrf(ServerHttpSecurity.CsrfSpec::disable)
        .authorizeExchange(a -> a.pathMatchers("/api/auth/**", "/actuator/health").permitAll().anyExchange().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults())).build();
}`,
        ),
      ],
      [
        ['What is an API gateway and what does it do?', 'The single entry point to the system that routes requests to services and centralises cross-cutting concerns: authentication, rate limiting, TLS, CORS, logging/tracing, resilience filters and sometimes composition.'],
        ['What are routes, predicates and filters in Spring Cloud Gateway?', 'A route maps matching requests (predicates such as Path or Header) to a target URI and applies filters that modify the request/response (StripPrefix, Retry, CircuitBreaker, rate limiter).'],
        ['Why is the gateway not enough for security?', 'It is one layer; internal services can also be reached from inside the network. Each service must validate tokens and enforce authorisation (zero trust), and gateway-added headers must not be trusted from clients.'],
      ],
    ),
    topic(
      'ms-load-balancing',
      'Load Balancing: Client-Side vs Server-Side',
      [
        blk(`<h3>Load balancing concepts</h3>
• A <b>load balancer</b> distributes requests across instances for <b>scalability</b>, <b>availability</b> (skip unhealthy instances) and even utilisation. Algorithms: <b>round robin</b>, weighted round robin, <b>least connections</b>, least response time, random, IP/consistent hashing (stickiness for caches), zone-aware.<br>
• <b>Server-side</b> (L4/L7): a dedicated component in front: NGINX, HAProxy, AWS ALB/NLB, Kubernetes Service/Ingress, Envoy. Clients know one address. <b>Client-side</b>: the client holds the instance list (from discovery) and picks an instance itself: Spring Cloud LoadBalancer. No extra hop, no central bottleneck, but logic lives in every client.<br>
• Health: only route to <b>ready</b> instances (readiness probes/health checks); drain connections on shutdown.<br>
<table ${TABLE}>
<tr><th></th><th>Client-side (Spring Cloud LoadBalancer)</th><th>Server-side (Nginx, ALB, K8s Service)</th></tr>
<tr><td>Where</td><td>Inside the calling service</td><td>Separate network component</td></tr>
<tr><td>Instance list</td><td>From discovery (Eureka/Consul) cached in the client</td><td>Managed by the balancer / platform</td></tr>
<tr><td>Extra hop</td><td>No</td><td>Yes</td></tr>
<tr><td>Language coupling</td><td>Library per language</td><td>Language agnostic</td></tr>
<tr><td>Smart routing</td><td>Easy (zone, metadata, hints)</td><td>Depends on the product</td></tr>
<tr><td>Typical use</td><td>Service-to-service on Spring Cloud</td><td>Edge traffic, Kubernetes, polyglot</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Spring Cloud LoadBalancer</h3>
• Replaces Netflix Ribbon. Annotate a <code>RestClient.Builder</code>/<code>WebClient.Builder</code> with <code>@LoadBalanced</code> (Feign uses it automatically) and call <code>http://service-name/...</code>: LoadBalancer resolves the name through the <code>DiscoveryClient</code> (Eureka/Consul/Kubernetes) and chooses an instance: default <b>round robin</b>; <code>RandomLoadBalancer</code>, <b>weighted</b>, <b>zone-preference</b>, <b>same-instance preference</b>, <b>request-based sticky session</b>, health-check filtering (<code>spring.cloud.loadbalancer.configurations=health-check</code>).<br>
• Configure per client with a <code>@LoadBalancerClient(name = "...", configuration = ...)</code>; enable <b>retry on the next instance</b> carefully (only idempotent), cache instance lists (<code>spring.cloud.loadbalancer.cache</code>).`,
          `@Configuration
@LoadBalancerClient(name = "catalogue-service", configuration = CatalogueLbConfig.class)
class LbConfig {}

class CatalogueLbConfig {
    @Bean ServiceInstanceListSupplier supplier(ConfigurableApplicationContext ctx) {
        return ServiceInstanceListSupplier.builder().withDiscoveryClient().withHealthChecks().withZonePreference().withCaching().build(ctx);
    }
    @Bean ReactorLoadBalancer<ServiceInstance> lb(Environment env, LoadBalancerClientFactory f) {
        String name = env.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RoundRobinLoadBalancer(f.getLazyProvider(name, ServiceInstanceListSupplier.class), name);
    }
}

@Bean @LoadBalanced RestClient.Builder restClientBuilder() { return RestClient.builder(); }
String body = restClientBuilder.build().get().uri("http://catalogue-service/api/v1/courses").retrieve().body(String.class);   // name -> instance`,
        ),
      ],
      [
        blk(`<h3>Load balancing on Kubernetes and in front of the cluster</h3>
• <b>Kubernetes Service</b> (ClusterIP) load-balances across ready pods (kube-proxy iptables/IPVS, round robin-ish, connection-level). <b>Gotcha</b>: HTTP/2 and gRPC use <b>long-lived connections</b>, so all requests stick to one pod: use a client-side/headless-service balancer, a service mesh (Envoy/Istio/Linkerd) or L7 balancing.<br>
• <b>Ingress / Gateway API</b> (NGINX, Traefik, Envoy Gateway) load-balances external HTTP traffic; a cloud <b>LoadBalancer</b> Service provisions an ALB/NLB. Use <b>readiness probes</b> so traffic reaches only ready pods and <b>preStop + graceful shutdown</b> so in-flight requests finish.<br>
• Also consider <b>geographic/DNS load balancing</b> (Route 53, Cloudflare), <b>global</b> failover, and <b>session affinity</b> only when unavoidable (prefer stateless services).`,
          `apiVersion: v1
kind: Service
metadata: { name: catalogue-service }
spec:
  selector: { app: catalogue }
  ports: [ { port: 80, targetPort: 8081 } ]         # callers use http://catalogue-service (DNS), balanced over ready pods
---
# headless service: DNS returns every pod IP for client-side balancing (gRPC)
apiVersion: v1
kind: Service
metadata: { name: catalogue-headless }
spec: { clusterIP: None, selector: { app: catalogue }, ports: [ { port: 8081 } ] }

# Spring Cloud Kubernetes discovery uses the K8s API instead of Eureka
# spring.cloud.kubernetes.discovery.enabled=true`,
        ),
      ],
      [
        ['Client-side vs server-side load balancing?', 'Client-side: the caller gets the instance list from discovery and picks an instance (Spring Cloud LoadBalancer), with no extra hop. Server-side: a separate balancer (NGINX, ALB, Kubernetes Service) fronts the instances and clients call one address.'],
        ['Which algorithms do load balancers use?', 'Round robin, weighted round robin, least connections, least response time, random, and hash-based (IP/consistent hashing) for stickiness, usually combined with health checks to skip unhealthy instances.'],
        ['Why can gRPC traffic be unbalanced on Kubernetes?', 'gRPC/HTTP2 keeps long-lived connections, and the Service balances per connection, so one pod receives most requests. Use client-side balancing with a headless service or an L7 proxy/service mesh.'],
      ],
    ),
  ]),

  ms(5, 'Spring Cloud', 'Essential', [
    topic(
      'ms-cloud-config',
      'Spring Cloud Config Server, Centralized Configuration, Refresh and Spring Cloud Bus',
      [
        blk(`<h3>Spring Cloud Config Server</h3>
• <b>Config Server</b> serves configuration over HTTP from a backend, typically a <b>Git repository</b> (versioned, auditable, rollback via commits). Clients fetch <code>{application}/{profile}/{label}</code> at startup. Add <code>spring-cloud-config-server</code>, <code>@EnableConfigServer</code>, set <code>spring.cloud.config.server.git.uri</code>. Backends: Git, Vault, JDBC, filesystem, S3.<br>
• Layout in the config repo: <code>application.yml</code> (shared), <code>catalogue-service.yml</code>, <code>catalogue-service-prod.yml</code>. Precedence: profile-specific over application-specific over shared.<br>
• <b>Secure it</b>: authentication, TLS, <b>encrypt secrets</b> (<code>{cipher}...</code>, symmetric/asymmetric keys) or integrate Vault; do not expose it publicly; run 2+ instances and let clients <b>cache</b>/<code>fail-fast</code> with retry.`,
          `// config-server
@SpringBootApplication @EnableConfigServer
public class ConfigServerApplication { public static void main(String[] a) { SpringApplication.run(ConfigServerApplication.class, a); } }

# config-server application.yml
server.port: 8888
spring.cloud.config.server.git:
  uri: https://github.com/javaschoollab/config-repo
  default-label: main
  search-paths: '{application}'
  clone-on-start: true
  username: \${GIT_USER}
  password: \${GIT_TOKEN}
encrypt.key: \${CONFIG_ENCRYPT_KEY}                 # symmetric key for {cipher} values

# config-repo/catalogue-service-prod.yml
spring.datasource.url: jdbc:postgresql://catalogue-db:5432/catalogue
spring.datasource.password: '{cipher}AQBb3...'       # encrypted: curl -X POST config-server/encrypt -d 'plain'

# client
spring:
  application.name: catalogue-service
  config.import: "configserver:http://config-server:8888"
  cloud.config: { fail-fast: true, retry: { max-attempts: 6 } }`,
        ),
      ],
      [
        blk(`<h3>Distributed configuration refresh</h3>
• By default config is read at startup. To change it without redeploying use <b><code>@RefreshScope</code></b> beans and <code>POST /actuator/refresh</code> (expose <code>refresh</code>): scoped beans are re-created with new values. <code>@ConfigurationProperties</code> beans rebind on refresh automatically. Not everything is refreshable (datasource pools, server port): restart for those.<br>
• Refreshing N instances manually does not scale: use <b>Spring Cloud Bus</b>: all instances subscribe to a broker topic (RabbitMQ/Kafka); one <code>POST /actuator/busrefresh</code> (or a Git webhook to Config Server's <code>/monitor</code>) broadcasts the change event; every instance refreshes. In <b>Kubernetes</b> prefer ConfigMaps with a <b>rolling restart</b> (or Spring Cloud Kubernetes config reload, Reloader).`,
          `# client
management.endpoints.web.exposure.include: health,info,refresh,busrefresh

@RefreshScope
@RestController
class PricingController {
    @Value("\${jsl.pricing.discount-percent:0}") private int discount;      // re-read after refresh
    @GetMapping("/api/v1/pricing/discount") int discount() { return discount; }
}

# 1) change jsl.pricing.discount-percent in Git
# 2) refresh one instance:        curl -X POST http://catalogue:8081/actuator/refresh
# 3) refresh ALL via the bus:     curl -X POST http://config-server:8888/actuator/busrefresh
#    (Config Server + clients depend on spring-cloud-starter-bus-kafka or -amqp; webhook from Git to /monitor automates it)

// Kubernetes alternative: ConfigMap change + rolling restart
// kubectl rollout restart deployment/catalogue-service`,
        ),
      ],
      [
        blk(`<h3>Centralized configuration: Config Server vs Kubernetes ConfigMaps vs Vault</h3>
<table ${TABLE}>
<tr><th></th><th>Spring Cloud Config</th><th>K8s ConfigMap/Secret</th><th>Vault / cloud secrets</th></tr>
<tr><td>Store</td><td>Git, JDBC, Vault</td><td>Cluster API objects (etcd)</td><td>Dedicated secret store</td></tr>
<tr><td>Versioning</td><td>Git history</td><td>GitOps (Argo CD/Flux)</td><td>Secret versions</td></tr>
<tr><td>Refresh</td><td><code>@RefreshScope</code>, Bus</td><td>Restart or reloader</td><td>Lease/dynamic secrets, agent sidecar</td></tr>
<tr><td>Best for</td><td>Spring-centric estates, VMs</td><td>Kubernetes-native config</td><td>Credentials, certificates, rotation</td></tr>
</table>
• Principles: <b>separate config from code</b>, <b>per-environment overrides</b>, <b>secrets encrypted and access-controlled</b>, <b>audit changes</b>, validate on startup, avoid a single point of failure (HA + local caches), and keep the amount of dynamic config small: every refreshable property is a production behaviour change without a deployment.`,
          `# GitOps for Kubernetes config: config changes are pull requests applied by Argo CD
# repo: environments/prod/catalogue/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata: { name: catalogue-config }
data:
  JSL_PRICING_DISCOUNT_PERCENT: "10"
  SPRING_PROFILES_ACTIVE: prod

# Vault dynamic database credentials (short-lived)
spring:
  config.import: "vault://"
  cloud.vault: { uri: https://vault:8200, authentication: KUBERNETES, kv.enabled: true, database: { enabled: true, role: catalogue } }`,
        ),
      ],
      [
        ['What problem does Spring Cloud Config solve?', 'Centralised, versioned and environment-aware configuration for many services, served from Git (or Vault), so config is managed in one place, can be audited and rolled back, and secrets can be encrypted.'],
        ['How do you refresh configuration without restarting services?', 'Use @RefreshScope beans with the /actuator/refresh endpoint, and Spring Cloud Bus (/actuator/busrefresh) to broadcast the refresh to all instances; on Kubernetes use ConfigMap updates with rolling restarts or a reloader.'],
        ['Why is it risky to make many properties refreshable at runtime?', 'Each refreshable value changes production behaviour without a deployment, review pipeline or rollout, so it needs strong governance, validation and auditing; keep dynamic config minimal.'],
      ],
    ),
    topic(
      'ms-cloud-lb-cb-kubernetes',
      'Spring Cloud LoadBalancer, CircuitBreaker Abstraction, Gateway/Eureka/Feign Recap and Spring Cloud Kubernetes',
      [
        blk(`<h3>Spring Cloud at a glance</h3>
<table ${TABLE}>
<tr><th>Concern</th><th>Spring Cloud project</th><th>Notes</th></tr>
<tr><td>Config</td><td>Config Server / Config Client, Spring Cloud Bus</td><td>Git-backed, refresh</td></tr>
<tr><td>Discovery</td><td>Netflix Eureka, Consul, Zookeeper, Kubernetes</td><td>Registry or platform</td></tr>
<tr><td>Routing</td><td>Spring Cloud Gateway (reactive or MVC)</td><td>Predicates, filters</td></tr>
<tr><td>Client calls</td><td>OpenFeign, HTTP interfaces, LoadBalancer</td><td>Declarative + balancing</td></tr>
<tr><td>Resilience</td><td>Spring Cloud CircuitBreaker (Resilience4j)</td><td>Abstraction over breakers</td></tr>
<tr><td>Messaging</td><td>Spring Cloud Stream (Kafka/Rabbit binders), Function</td><td>Functional bindings</td></tr>
<tr><td>Observability</td><td>Micrometer Tracing (replaces Sleuth), Actuator</td><td>Traces and metrics</td></tr>
<tr><td>Contracts</td><td>Spring Cloud Contract</td><td>Consumer-driven contracts</td></tr>
<tr><td>Kubernetes</td><td>Spring Cloud Kubernetes</td><td>Discovery/config from the K8s API</td></tr>
</table>
• Eureka, Gateway, OpenFeign and LoadBalancer were covered in the previous section; this lesson covers the abstraction layers and Kubernetes integration.`),
      ],
      [
        blk(`<h3>Spring Cloud CircuitBreaker abstraction</h3>
• <b>Spring Cloud CircuitBreaker</b> provides a vendor-neutral API (<code>CircuitBreakerFactory</code>/<code>ReactiveCircuitBreakerFactory</code>) with implementations for <b>Resilience4j</b> (recommended), Spring Retry and Sentinel. Use it programmatically (<code>factory.create("id").run(supplier, fallback)</code>), in Feign (<code>spring.cloud.openfeign.circuitbreaker.enabled</code>) and as a Gateway filter. Customise with <code>Resilience4JCircuitBreakerFactory</code> configurers. (Full Resilience4j usage in the Resilience section.)`,
          `@Service
@RequiredArgsConstructor
class RecommendationService {
    private final CircuitBreakerFactory<?, ?> cbFactory;
    private final RecommendationClient client;

    List<CourseSummary> forUser(UUID userId) {
        return cbFactory.create("recommendations").run(
            () -> client.recommendationsFor(userId),                       // protected call
            throwable -> popularCourses());                                // fallback when open/failing
    }
}

@Bean Customizer<Resilience4JCircuitBreakerFactory> defaults() {
    return f -> f.configureDefault(id -> new Resilience4JConfigBuilder(id)
        .circuitBreakerConfig(CircuitBreakerConfig.custom().slidingWindowSize(20).failureRateThreshold(50).waitDurationInOpenState(Duration.ofSeconds(15)).build())
        .timeLimiterConfig(TimeLimiterConfig.custom().timeoutDuration(Duration.ofSeconds(2)).build()).build());
}`,
        ),
      ],
      [
        blk(`<h3>Spring Cloud Kubernetes and when to drop components</h3>
• <b>Spring Cloud Kubernetes</b> lets Spring apps use Kubernetes as the platform: <b>discovery</b> via the K8s API (<code>DiscoveryClient</code> reading Services/Endpoints), <b>config</b> from <b>ConfigMaps and Secrets</b> as property sources (with optional reload on change), leader election, health indicators. Needs RBAC permissions (a ServiceAccount allowed to read services/endpoints/configmaps).<br>
• <b>Simplify on Kubernetes</b>: use native <b>Services + DNS</b> instead of Eureka, <b>ConfigMaps/Secrets</b> instead of Config Server, <b>Ingress/Gateway API</b> (or keep Spring Cloud Gateway for app-level filters), K8s probes instead of Eureka heartbeats, a <b>service mesh</b> (Istio/Linkerd) for mTLS, retries and traffic shifting. Keep libraries for what the platform does not provide: Resilience4j, OpenFeign/HTTP interfaces, Micrometer, Spring Security.`,
          `<!-- dependencies -->
<dependency><groupId>org.springframework.cloud</groupId><artifactId>spring-cloud-starter-kubernetes-client-all</artifactId></dependency>

# application.yml
spring:
  application.name: catalogue-service
  cloud.kubernetes:
    discovery.enabled: true
    config:   { enabled: true, name: catalogue-config, namespace: jsl }
    secrets:  { enabled: true, name: catalogue-secrets }
    reload:   { enabled: true, mode: event, strategy: refresh }       # refresh beans when the ConfigMap changes

# RBAC so the pod may read config and endpoints
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: spring-cloud-k8s, namespace: jsl }
rules:
  - apiGroups: [""]
    resources: ["configmaps", "secrets", "services", "endpoints", "pods"]
    verbs: ["get", "list", "watch"]`,
        ),
      ],
      [
        ['What does Spring Cloud CircuitBreaker provide?', 'A common abstraction over circuit breaker libraries (Resilience4j, Spring Retry, Sentinel) with a factory API, plus integration with Feign and Gateway so you can add fallbacks and limits without tying code to one library.'],
        ['What does Spring Cloud Kubernetes do?', 'It lets Spring applications use Kubernetes for service discovery (K8s API) and configuration (ConfigMaps/Secrets as property sources with reload), reducing the need for Eureka and Config Server on the platform.'],
        ['Which Spring Cloud components can you drop on Kubernetes?', 'Eureka (use Services/DNS), Config Server (use ConfigMaps/Secrets/GitOps) and often the Ribbon-style balancing; keep Resilience4j, Feign/HTTP interfaces, Micrometer/OpenTelemetry and Spring Security.'],
      ],
    ),
  ]),
];
