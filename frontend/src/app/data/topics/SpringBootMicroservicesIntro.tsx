import { Topic } from '../coreJava';

export const springBootMicroservicesIntro: Topic = {
    id: 'spring-boot-microservices-intro',
    name: 'Microservices - Introduction & Architecture',
    beginner: [
        {
            content: `<h3>What are Microservices?</h3>
Microservices is an <strong>architectural style</strong> in which the application is designed as a collection of services.<br><br>

<h3>Why do we use it?</h3>
Before microservice architecture, most of the IT industry used <strong>monolithic architecture</strong>.<br><br>

<h3>What is monolithic architecture?</h3>
It is a <strong>single application in which all the functionality is available</strong>.<br><br>

Take <em>makemytrip.com</em> as an example - flights, hotels, trains, buses and payments all inside one deployable unit, talking to one database.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                 MONOLITHIC ARCHITECTURE

              +--------------------------+
              |    User Interface (UI)   |
              +--------------------------+
                           |
              +--------------------------+
              |                          |
              |   Flight    Hotel        |
              |   Train     Bus          |      ONE application
              |   Payment   Booking      |
              |                          |
              +--------------------------+
                           |
                    +-------------+
                    |  DATABASE   |          ONE database
                    +-------------+</pre>

<h3>Disadvantages of the monolith</h3>
<div class="border">
• <strong>Maintenance is high</strong> - everything is tangled together.<br>
• <strong>Single point of failure</strong> - one bad module can take the whole application down.<br>
• <strong>Redeploy the whole application</strong> - a one-line fix in Hotels means redeploying Flights, Trains and Payments too.<br>
</div>`
        },
        {
            content: `<h3>Microservice Architecture</h3>
<div class="border">
• Each functionality is separated into a <strong>different project</strong>.<br>
• Each project has its <strong>own database</strong>.<br>
• There is only one user interface.<br>
</div><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                  MICROSERVICE ARCHITECTURE

              +--------------------------+
              |    User Interface (UI)   |
              +--------------------------+
                |     |     |     |     |
        +-------+     |     |     |     +-------+
        |             |     |     |             |
   +---------+  +---------+ | +---------+  +---------+
   | Flight  |  | Hotel   | | | Train   |  | Payment |
   | Service |  | Service | | | Service |  | Service |
   +---------+  +---------+ | +---------+  +---------+
        |            |      |      |            |
     +----+       +----+  +----+ +----+      +----+
     | DB |       | DB |  | DB | | DB |      | DB |
     +----+       +----+  +----+ +----+      +----+</pre>

<h3>Advantages</h3>
<div class="border">
• <strong>Maintenance is easy</strong> - each service is small enough to understand.<br>
• <strong>High availability</strong> - if Hotels goes down, Flights keeps serving.<br>
• <strong>Faster development</strong> - separate teams work in parallel without blocking each other.<br>
• <strong>Application deployment is fast</strong> - deploy only the service that changed.<br>
</div><br>

<strong>Note:</strong> one microservice means one RESTful web service.<br>`
        },
        {
            content: `<h3>Key Points</h3>

<table>
<tr><th>Point</th><th>Detail</th></tr>
<tr><td>One project per service</td><td>Create a separate Spring Boot project for every microservice.</td></tr>
<tr><td>One server per service</td><td>Each application runs independently in its own Tomcat instance, on its own port.</td></tr>
<tr><td>Communication</td><td>For microservices to talk to each other we use <strong>Spring Cloud</strong> with a <strong>Eureka Server</strong>.</td></tr>
<tr><td>Eureka Server</td><td>A <strong>discovery server</strong> - the directory of which services exist and where they are.</td></tr>
<tr><td>Registration</td><td>Every microservice must register itself on the Eureka Server to be discoverable.</td></tr>
<tr><td>Client role</td><td>Each microservice is a <strong>client</strong> of the Eureka Server.</td></tr>
</table>
<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                +--------------------------+
                |      EUREKA SERVER       |
                |   (Discovery Server)     |
                |    port 8761             |
                +--------------------------+
                    ^        ^        ^
          register  |        |        |  register
                    |        |        |
             +----------+ +--------+ +---------+
             | Flight   | | Hotel  | | Payment |
             | :8081    | | :8082  | | :8083   |
             +----------+ +--------+ +---------+
                  Eureka clients</pre>`
        },
        {
            content: `<h3>First Microservice Example</h3>
The smallest possible microservice: a Spring Boot project with one REST endpoint, running on its own port.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project<br>
2. Add the Maven dependency to pom.xml<br>
3. Set the port in application.properties<br>
4. Create the REST controller<br>
5. Run the Spring Boot application<br>
6. Open Postman
</div><br>

<strong>Step 1:</strong> <code>File => New => Spring Starter Project</code>, enter the project name <strong>MicroServiceExample</strong>, then Next and Finish.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml : just the web starter for now -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>`,
                `# Step 3 - application.properties
server.port=8082

# Every microservice gets its OWN port, because each one runs in
# its own Tomcat instance on the same machine during development.`,
                `// Step 4 - SampleController.java
package com.velocity.restcontroller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SampleController {

    @GetMapping("/getMicroservice")
    public String getDemo() {
        return "First Microservice Example";
    }
}`,
                `// Steps 5 and 6 - run it, then call it
// CONSOLE:
// Tomcat started on port(s): 8082 (http) with context path ''
// Started MicroServiceExampleApplication in 1.6 seconds

// REQUEST
// Method: GET
// URL:    http://localhost:8082/getMicroservice

// RESPONSE (200 OK)
First Microservice Example

// That is a microservice. There is nothing else to it structurally -
// what makes an architecture "microservices" is how many of these
// there are, how they are deployed, and how they find each other.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Microservices Are a Trade, Not an Upgrade</h3>
The advantages list is real and it is only half the picture. Splitting one process into twenty replaces in-process method calls with network calls, and everything that was previously guaranteed becomes something you must handle.<br><br>

<table>
<tr><th>In a monolith</th><th>In microservices</th></tr>
<tr><td>A method call always succeeds or throws</td><td>A network call can time out, half-succeed, or succeed slowly</td></tr>
<tr><td>One database transaction spans everything</td><td>No distributed transaction - you need sagas and compensating actions</td></tr>
<tr><td>A stack trace covers the whole request</td><td>A request spans services; you need correlation ids and distributed tracing</td></tr>
<tr><td>One deployment</td><td>Twenty pipelines, twenty version numbers, and compatibility between them</td></tr>
<tr><td>Refactoring across modules is an IDE action</td><td>A change spanning services needs coordinated releases</td></tr>
<tr><td>Run it locally by pressing Run</td><td>Run twenty services, or build good stubs</td></tr>
</table>
<br>
<strong>The widely-held advice is "monolith first".</strong> Build a well-modularised monolith, learn where the real boundaries are, and extract services once you have evidence - a module that needs to scale differently, or a team that needs to release independently. Splitting on day one means guessing the boundaries, and the wrong boundary is far more expensive to fix once it is a network call.<br><br>

<strong>The honest criterion:</strong> microservices solve an <em>organisational</em> problem - letting many teams deploy without coordinating. If you have one team, you are paying the cost and not collecting the benefit.<br>`
        },
        {
            content: `<h3>"Each Project Has Its Own Database" Is the Hard Part</h3>
That one line in the key points carries most of the difficulty in the entire architecture, and it is the rule people break first.<br><br>

Once Flights and Payments own separate databases, a query that used to be a JOIN is no longer possible:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">MONOLITH - one query
    select b.*, u.name, p.status
    from booking b
    join user u    on b.user_id = u.id
    join payment p on p.booking_id = b.id

MICROSERVICES - three services, three databases
    GET /bookings/42          -> Booking service
    GET /users/7              -> User service
    GET /payments?booking=42  -> Payment service
    ... then join the results in application code.</pre>

<table>
<tr><th>Problem</th><th>Usual answer</th></tr>
<tr><td>Cross-service queries</td><td>API composition, or a read model built from events (CQRS)</td></tr>
<tr><td>Cross-service transactions</td><td>The Saga pattern - a sequence of local transactions plus compensating actions</td></tr>
<tr><td>Duplicated reference data</td><td>Each service keeps its own copy, kept fresh by events, and accepts eventual consistency</td></tr>
<tr><td>Reporting across everything</td><td>A separate data warehouse fed from all services</td></tr>
</table>
<br>
<strong>The anti-pattern to avoid</strong> is the shared database: several services reading and writing the same tables. It looks like microservices on the deployment diagram and behaves like a monolith - nobody can change a column without breaking someone else, and the independent deployability you paid for is gone. This is called a <em>distributed monolith</em>, and it has the costs of both styles and the benefits of neither.<br>`,
            codeExamples: [
                `// Saga: "book a trip" spans three services with no shared transaction.
// Each step is a local transaction; failure triggers compensation.

  1. Booking service     createBooking()        -> booking PENDING
  2. Payment service     chargeCard()           -> payment CAPTURED
  3. Inventory service   reserveSeat()          -> FAILS, sold out
         |
         v  compensate, in reverse order
  3'. (nothing to undo)
  2'. Payment service    refund()               -> payment REFUNDED
  1'. Booking service    cancelBooking()        -> booking CANCELLED

// There is no rollback. Every "undo" is an explicit business
// operation you have to design, implement and test - including
// what happens when the compensation itself fails.`,
                `// API composition - the read side of the same problem
@Service
public class BookingSummaryService {

    private final BookingClient bookings;
    private final UserClient users;
    private final PaymentClient payments;

    public BookingSummary get(Long bookingId) {

        Booking booking = bookings.findById(bookingId);

        // Independent calls run in parallel rather than in sequence
        CompletableFuture<User> user =
                CompletableFuture.supplyAsync(() -> users.findById(booking.userId()));
        CompletableFuture<Payment> payment =
                CompletableFuture.supplyAsync(() -> payments.findByBooking(bookingId));

        return new BookingSummary(booking, user.join(), payment.join());
    }
}
// The latency is now max(user, payment) rather than the sum -
// and the failure modes multiply: either call can time out, and
// you must decide whether a missing payment means an error or a
// partially-populated response.`
            ]
        },
        {
            content: `<h3>What a Real Microservice Platform Needs</h3>
Eureka is one piece. A production setup needs several more, and each exists to solve a problem the monolith never had.<br><br>

<table>
<tr><th>Concern</th><th>Component</th><th>Problem it solves</th></tr>
<tr><td>Service discovery</td><td>Eureka, Consul, Kubernetes DNS</td><td>Instances come and go; hard-coded hosts break</td></tr>
<tr><td>API gateway</td><td>Spring Cloud Gateway</td><td>One public entry point for auth, routing, rate limiting</td></tr>
<tr><td>Load balancing</td><td>Spring Cloud LoadBalancer</td><td>Spreading calls across instances of a service</td></tr>
<tr><td>Central configuration</td><td>Spring Cloud Config, Kubernetes ConfigMaps</td><td>Twenty services should not each own a copy of the settings</td></tr>
<tr><td>Resilience</td><td>Resilience4j</td><td>Circuit breakers, retries, timeouts, bulkheads</td></tr>
<tr><td>Distributed tracing</td><td>Micrometer Tracing + Zipkin/Jaeger</td><td>Following one request across eight services</td></tr>
<tr><td>Centralised logging</td><td>ELK, Loki</td><td>Logs scattered across many containers</td></tr>
<tr><td>Async messaging</td><td>Kafka, RabbitMQ</td><td>Removing synchronous coupling between services</td></tr>
</table>
<br>
<strong>The circuit breaker is the one to understand first.</strong> Without it, a slow downstream service exhausts the caller's thread pool, which makes the caller slow, which exhausts <em>its</em> caller - a cascading failure that takes down the platform from one broken service.<br>`,
            codeExamples: [
                `// Resilience4j - fail fast instead of hanging
@Service
public class PolicyClient {

    @CircuitBreaker(name = "policyService", fallbackMethod = "policyFallback")
    @TimeLimiter(name = "policyService")
    @Retry(name = "policyService")
    public CompletableFuture<PolicyDto> getPolicy(Integer id) {
        return CompletableFuture.supplyAsync(() ->
                restClient.get().uri("/policies/{id}", id)
                          .retrieve().body(PolicyDto.class));
    }

    // Called when the breaker is OPEN or the call fails
    private CompletableFuture<PolicyDto> policyFallback(Integer id, Throwable t) {
        log.warn("policy service unavailable, returning placeholder", t);
        return CompletableFuture.completedFuture(PolicyDto.unavailable(id));
    }
}`,
                `# The breaker's states, and what the settings mean
resilience4j.circuitbreaker.instances.policyService:
  sliding-window-size: 10
  failure-rate-threshold: 50          # 5 of 10 failing -> OPEN
  wait-duration-in-open-state: 30s    # reject instantly for 30s
  permitted-number-of-calls-in-half-open-state: 3

resilience4j.timelimiter.instances.policyService:
  timeout-duration: 2s

# CLOSED     -> calls pass through, failures counted
# OPEN       -> calls fail immediately, no network attempt at all
# HALF_OPEN  -> a few trial calls; success closes it, failure reopens
#
# The point of OPEN is that failing in 1ms protects your thread pool.
# Waiting 30 seconds for a dead service is what kills the caller.`
            ]
        },
        {
            content: `<h3>How Big Is a Microservice?</h3>
"One microservice means one RESTful web service" is a fine starting definition and is not a sizing rule. Two failure modes sit either side of the right answer.<br><br>

<table>
<tr><th>Too small (nanoservices)</th><th>Too large (distributed monolith)</th></tr>
<tr><td>A service per entity or per endpoint</td><td>Services that must be released together</td></tr>
<tr><td>Every operation is a chain of network hops</td><td>Shared database tables</td></tr>
<tr><td>More infrastructure than business logic</td><td>A change to one always needs a change to another</td></tr>
<tr><td>Latency dominated by serialisation</td><td>All the cost of distribution, none of the independence</td></tr>
</table>
<br>
The useful sizing heuristics:<br><br>

<div class="border">
• A service should map to a <strong>business capability</strong> - "payments", "policy administration" - not to a database table.<br>
• A service should be <strong>owned by one team</strong>, and a team should be able to release it without asking anyone.<br>
• A service should be able to be <strong>rewritten in a few weeks</strong> if it had to be.<br>
• If two services always change together, they are <strong>one service</strong>.<br>
</div><br>

Domain-Driven Design gives the formal version: a service should align with a <strong>bounded context</strong> - a region of the domain where the terms have one consistent meaning. "Customer" means different things to Sales and to Support, and that difference is exactly where the boundary belongs.<br>`
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are microservices?</td><td>An architectural style where one application is built as a collection of small, independently deployable services, each owning its own data.</td></tr>
<tr><td>What is a monolithic architecture?</td><td>A single application containing all functionality, deployed as one unit against one database.</td></tr>
<tr><td>What are the disadvantages of a monolith?</td><td>High maintenance, a single point of failure, and having to redeploy everything for any change.</td></tr>
<tr><td>What are the advantages of microservices?</td><td>Easier maintenance, high availability, faster parallel development, and deploying only the service that changed.</td></tr>
<tr><td>Why does each service need its own database?</td><td>A shared database couples services at the schema, so nobody can change a column independently - you get a distributed monolith.</td></tr>
<tr><td>What is a distributed monolith?</td><td>Services that must be deployed together or share a database - all the cost of distribution with none of the independence.</td></tr>
<tr><td>How do you query across services?</td><td>API composition (call each service and combine), or a read model built from events. There is no cross-service JOIN.</td></tr>
<tr><td>How do you handle transactions across services?</td><td>The Saga pattern - a chain of local transactions with explicit compensating actions. There is no distributed rollback.</td></tr>
<tr><td>What is a service registry and why is one needed?</td><td>A directory of running instances - Eureka, Consul, Kubernetes DNS. Instances change address as they scale and restart, so hard-coded hosts break.</td></tr>
<tr><td>What is a circuit breaker?</td><td>A component that stops calling a failing service after a failure threshold, failing fast instead of hanging - preventing cascading failure.</td></tr>
<tr><td>How do you debug a request spanning several services?</td><td>Distributed tracing with a correlation id propagated across calls, collected by Zipkin or Jaeger.</td></tr>
<tr><td>When should you NOT use microservices?</td><td>With a small team, an unclear domain, or no operational maturity. Start with a modular monolith and extract services once boundaries are proven.</td></tr>
<tr><td>How do you decide service boundaries?</td><td>By business capability and bounded context, and by team ownership. If two services always change together, they should be one.</td></tr>
</table>`
        }
    ]
};
