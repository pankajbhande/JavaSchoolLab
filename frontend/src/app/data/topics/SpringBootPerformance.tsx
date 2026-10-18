import { Topic } from '../coreJava';

export const springBootPerformance: Topic = {
    id: 'spring-boot-performance',
    name: 'Performance Optimization',
    beginner: [
        {
            content: `<h3>Measure First</h3>
Almost every performance problem in a Spring Boot application is one of a small number of causes, and almost every failed optimisation effort starts by guessing which one.<br><br>

<div class="border">
<strong>The rule:</strong> do not optimise anything you have not measured. A change that makes the code uglier and the application no faster is a pure loss - and "I think this loop is slow" is wrong far more often than it is right.
</div><br>

<h3>Where the time actually goes</h3>
In a typical CRUD service, ranked by how often each is the real culprit:<br><br>

<table>
<tr><th>Cause</th><th>Typical symptom</th></tr>
<tr><td>N+1 queries</td><td>One endpoint issues hundreds of SELECTs. By far the most common.</td></tr>
<tr><td>Missing database index</td><td>One query is slow and gets slower as the table grows.</td></tr>
<tr><td>Unpaginated collection endpoint</td><td>Fine in dev, times out in production.</td></tr>
<tr><td>Connection pool exhaustion</td><td>Requests queue and time out while the CPU sits idle.</td></tr>
<tr><td>Synchronous external call with no timeout</td><td>One slow dependency stalls every thread.</td></tr>
<tr><td>Serialising too much data</td><td>Large JSON payloads; high CPU in Jackson.</td></tr>
<tr><td>Actual slow Java code</td><td>Rare. Usually the last thing to look at.</td></tr>
</table>
<br>
Notice that six of the seven are I/O or data-volume problems, not CPU problems. That is why "make the Java faster" is usually the wrong instinct.<br>`
        },
        {
            content: `<h3>Step 1 - Turn On the SQL Log</h3>
The single highest-value diagnostic in a JPA application. Most performance bugs are visible the moment you can see the queries.<br>`,
            codeExamples: [
                `# application-dev.properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Better: the statistics, which count queries per request
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.stat=DEBUG
spring.jpa.properties.hibernate.generate_statistics=true

# OUTPUT after one request:
# Session Metrics {
#     1247300 nanoseconds spent acquiring 1 JDBC connection;
#     101 nanoseconds spent preparing 101 JDBC statements;
#     47829100 nanoseconds spent executing 101 JDBC statements;
# }
#
# 101 statements for one request is the N+1 problem, stated
# numerically. One query for the list, 100 for the association.`,
                `// The cause: an eager or lazily-touched association
@GetMapping("/api/orders")
public List<OrderResponse> list() {
    return orderRepository.findAll().stream()   // 1 query
            .map(o -> new OrderResponse(
                    o.getId(),
                    o.getCustomer().getName()))  // +1 query PER ORDER
            .toList();
}
// OUTPUT: 1 + 100 = 101 queries.

// The fix: fetch what you need in one query
@Query("select o from Order o join fetch o.customer")
List<Order> findAllWithCustomer();
// OUTPUT: 1 query.
//
// Or project straight to the DTO and never load the entities:
@Query("select new com.app.dto.OrderResponse(o.id, c.name) "
     + "from Order o join o.customer c")
List<OrderResponse> findAllSummaries();
// OUTPUT: 1 query, and only two columns leave the database.`
            ]
        },
        {
            content: `<h3>Step 2 - Page Every Collection Endpoint</h3>
An endpoint that returns "all" of something is a bug waiting for the table to grow. It is fine with the 12 rows in your dev database and fatal with the 2 million in production - it loads every row into the heap, serialises every one to JSON, and holds a database connection throughout.<br>`,
            codeExamples: [
                `// BEFORE - unbounded
@GetMapping("/api/orders")
public List<OrderResponse> list() {
    return service.findAll();
}
// OUTPUT with 2,000,000 rows:
// java.lang.OutOfMemoryError: Java heap space
// ...or a 40-second response and a 300 MB payload.

// AFTER - bounded, and the client controls the window
@GetMapping("/api/orders")
public Page<OrderResponse> list(
        @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC)
        Pageable pageable) {
    return service.findAll(pageable);
}
// OUTPUT:
// select ... from orders order by id desc limit 20 offset 0
// select count(*) from orders
// {
//   "content": [ ...20 items... ],
//   "totalElements": 2000000,
//   "totalPages": 100000,
//   "number": 0,
//   "size": 20
// }`,
                `// Cap the page size, or a client asking for size=1000000
// reintroduces the same problem.
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        PageableHandlerMethodArgumentResolver resolver =
                new PageableHandlerMethodArgumentResolver();
        resolver.setMaxPageSize(100);          // hard ceiling
        resolver.setFallbackPageable(PageRequest.of(0, 20));
        resolvers.add(resolver);
    }
}
// OUTPUT: ?size=1000000 is silently clamped to 100.`
            ]
        },
        {
            content: `<h3>Step 3 - Index What You Filter On</h3>
A query with no usable index makes the database read <strong>every row</strong> in the table. That is invisible at 1,000 rows and catastrophic at 10 million.<br>`,
            codeExamples: [
                `-- The query your derived method generates
select * from employee where email = 'ajay@gmail.com';

-- Without an index:
EXPLAIN select * from employee where email = 'ajay@gmail.com';
+------+-------------+----------+------+---------+----------+
| type | key         | rows     | Extra                     |
+------+-------------+----------+------+---------+----------+
| ALL  | NULL        | 9847221  | Using where               |
+------+-------------+----------+------+---------+----------+
-- type=ALL and rows=9.8M means a FULL TABLE SCAN.

-- With an index:
CREATE INDEX idx_employee_email ON employee(email);

+------+-------------------+------+---------------------------+
| type | key               | rows | Extra                     |
+------+-------------------+------+---------------------------+
| ref  | idx_employee_email|    1 | Using index condition     |
+------+-------------------+------+---------------------------+
-- type=ref and rows=1. Milliseconds instead of seconds.`,
                `// Declaring indexes on the entity, so they are part of the schema
@Entity
@Table(name = "employee",
       indexes = {
           @Index(name = "idx_employee_email", columnList = "email", unique = true),
           @Index(name = "idx_employee_city_status", columnList = "city,status")
       })
public class Employee { ... }

// The composite index order matters: (city, status) serves
//   where city = ?
//   where city = ? and status = ?
// but NOT
//   where status = ?
// A composite index is usable left-to-right only - the leftmost
// prefix rule. This is the most common indexing mistake.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Connection Pool Sizing - Smaller Is Usually Faster</h3>
The instinct when an application is slow under load is to raise the pool size. It is normally the wrong move, and often makes things worse.<br><br>

A database can only do so much concurrent work; it is bounded by cores and disk. Beyond that point, extra connections do not add throughput - they add <strong>context switching and lock contention</strong>, so every query gets slower while the total stays flat.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">HikariCP's own guidance:

    connections = ((core_count * 2) + effective_spindle_count)

  An 8-core server with SSDs:  (8 * 2) + 1  =  17

That is the pool size for the WHOLE application, and it is far
smaller than most people expect. HikariCP's default is 10.</pre>

<table>
<tr><th>Symptom</th><th>Likely cause</th></tr>
<tr><td>Requests queue, database CPU is low</td><td>Pool too small, or connections held too long</td></tr>
<tr><td>Requests slow, database CPU is high</td><td>Pool too <em>large</em>, or missing indexes</td></tr>
<tr><td>Connection is not available, request timed out</td><td>Pool exhausted - usually a leak, or a long transaction</td></tr>
</table>
<br>
Note the second row carefully. When several application instances each hold a pool, what matters is the <strong>total</strong> across all of them: ten instances with a pool of 50 is 500 connections at the database, which will collapse it.<br>`,
            codeExamples: [
                `# Sensible starting configuration
spring.datasource.hikari.maximum-pool-size=15
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=3000    # fail fast, do not hang
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000       # under the DB's wait_timeout
spring.datasource.hikari.leak-detection-threshold=20000`,
                `// What a leak looks like in the log, thanks to leak-detection-threshold
// java.lang.Exception: Apparent connection leak detected
//     at com.app.ReportService.generate(ReportService.java:44)
//
// It names the exact line that took a connection and never returned
// it. Nearly always a long-running method annotated @Transactional
// that is doing something slow and non-database while holding one.

// THE CLASSIC MISTAKE - an HTTP call inside a transaction
@Transactional
public void process(Order order) {
    orderRepository.save(order);
    paymentGateway.charge(order);      // 2 seconds, holding a connection
    order.setStatus(PAID);
}
// The connection is held for the whole 2 seconds. At 15 connections
// and 2s each, throughput is capped at ~7 requests/second.

// FIXED - keep the network call outside the transaction
public void process(Order order) {
    orderService.saveInitial(order);         // short transaction
    ChargeResult result = paymentGateway.charge(order);   // no connection held
    orderService.markPaid(order.getId(), result);         // short transaction
}
// OUTPUT: the connection is held for milliseconds, not seconds.`
            ]
        },
        {
            content: `<h3>Read the Numbers, Not the Vibes</h3>
Actuator plus Micrometer already expose everything needed to find a bottleneck. The metrics worth watching, and what each tells you:<br><br>

<table>
<tr><th>Metric</th><th>What it reveals</th></tr>
<tr><td><code>http.server.requests</code></td><td>Latency and count per endpoint and status. Start here - it says <em>which</em> endpoint is slow.</td></tr>
<tr><td><code>hikaricp.connections.pending</code></td><td>Threads waiting for a connection. Above zero means the pool is a bottleneck.</td></tr>
<tr><td><code>hikaricp.connections.usage</code></td><td>How long connections are held. Long holds are the leak signal.</td></tr>
<tr><td><code>jvm.memory.used</code> by area</td><td>Heap growth and whether it returns after GC.</td></tr>
<tr><td><code>jvm.gc.pause</code></td><td>GC pause time. Long or frequent pauses point at allocation pressure.</td></tr>
<tr><td><code>executor.queued</code></td><td>Backlog on your @Async or scheduling pools.</td></tr>
</table>
<br>
Percentiles matter more than averages: a mean of 80ms hides a p99 of 4 seconds, and the p99 is what users complain about.<br>`,
            codeExamples: [
                `# Publish percentiles, not just a mean
management.endpoints.web.exposure.include=health,info,metrics,prometheus
management.metrics.distribution.percentiles-histogram.http.server.requests=true
management.metrics.distribution.percentiles.http.server.requests=0.5,0.95,0.99
management.metrics.distribution.slo.http.server.requests=100ms,500ms,1s`,
                `// GET /actuator/metrics/http.server.requests?tag=uri:/api/orders
{
  "name": "http.server.requests",
  "measurements": [
    { "statistic": "COUNT",       "value": 14203 },
    { "statistic": "TOTAL_TIME",  "value": 1893.4 },
    { "statistic": "MAX",         "value": 4.21 }
  ]
}
// mean = 1893.4 / 14203 = 133ms, MAX = 4.2s.
// The mean looks acceptable; the max says some requests are awful.
// Percentiles tell you how many.`,
                `// Timing a specific piece of work
@Service
public class ReportService {

    private final Timer timer;

    public ReportService(MeterRegistry registry) {
        this.timer = Timer.builder("report.generation")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(registry);
    }

    public Report generate(Long id) {
        return timer.record(() -> doGenerate(id));
    }
}
// Or declaratively, which is AOP under the hood:
@Timed(value = "report.generation", percentiles = { 0.5, 0.95, 0.99 })
public Report generate(Long id) { ... }`
            ]
        },
        {
            content: `<h3>Do Less Work: Projections, Caching, and Not Calling At All</h3>
The fastest query is the one you never run. In rough order of effect:<br><br>

<table>
<tr><th>Technique</th><th>Effect</th></tr>
<tr><td>Fetch fewer columns</td><td>A projection that selects 3 of 40 columns moves a fraction of the data and skips entity construction entirely.</td></tr>
<tr><td>Fetch fewer rows</td><td>Pagination, and filtering in SQL rather than in Java.</td></tr>
<tr><td>Fetch fewer times</td><td>Caching, and batching N calls into one.</td></tr>
<tr><td>Do it later</td><td>Move non-essential work off the request thread with <code>@Async</code> or a queue.</td></tr>
</table>
<br>
The last one is underused. A signup request does not need to wait for a welcome email to be delivered; it needs to wait for the user row to be committed.<br>`,
            codeExamples: [
                `// Filtering in Java is the quiet killer - it loads everything first
// BAD:
List<Order> all = orderRepository.findAll();       // 2,000,000 rows
return all.stream()
          .filter(o -> o.getStatus() == PENDING)   // filtered in the JVM
          .toList();                                // ...to return 12
// OUTPUT: 2M rows over the wire, 2M entities constructed, 12 kept.

// GOOD:
return orderRepository.findByStatus(PENDING);
// OUTPUT: select ... where status = ?  -> 12 rows.
// The database has an index and does this in microseconds.`,
                `// Move slow, non-essential work off the request path
@Service
public class RegistrationService {

    @Transactional
    public UserResponse register(RegistrationRequest request) {
        User user = userRepository.save(toEntity(request));

        // Fires AFTER the transaction commits, on another thread.
        events.publishEvent(new UserRegisteredEvent(user.getId()));

        return toResponse(user);      // returns immediately
    }
}

@Component
public class WelcomeEmailListener {

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onRegistered(UserRegisteredEvent event) {
        mailService.sendWelcome(event.userId());     // 800ms, off-thread
    }
}
// OUTPUT:
// response time drops from ~900ms to ~90ms
// AFTER_COMMIT matters: without it the email can be sent for a
// registration that then rolls back.`,
                `// Batch instead of looping - N round trips become one
// BAD:
for (Long id : ids) {
    results.add(productRepository.findById(id).orElseThrow());
}
// OUTPUT: 500 ids -> 500 SELECT statements.

// GOOD:
List<Product> products = productRepository.findAllById(ids);
// OUTPUT: select ... where id in (?, ?, ?, ... )   -> 1 statement.

// Same idea for writes:
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
// saveAll() of 1000 rows: 1000 round trips -> 20.`
            ]
        },
        {
            content: `<h3>JVM and Startup</h3>
Two areas people reach for early and that matter less than the database - with one important exception in containers.<br><br>

<table>
<tr><th>Setting</th><th>Why</th></tr>
<tr><td><code>-XX:MaxRAMPercentage=75</code></td><td>In a container, always. A JVM that ignores the cgroup limit sizes its heap from the host's RAM and gets OOMKilled (exit 137).</td></tr>
<tr><td>G1GC</td><td>The default since Java 9 and the right choice for almost everything.</td></tr>
<tr><td><code>-XX:+HeapDumpOnOutOfMemoryError</code></td><td>Costs nothing, and is the difference between diagnosing an OOM and guessing.</td></tr>
<tr><td>Lazy initialisation</td><td>Faster startup, at the cost of moving configuration errors to the first request. Dev only.</td></tr>
</table>
<br>
<strong>Startup time</strong> rarely matters for a long-running service and matters enormously for autoscaling and for serverless, where a cold start is user-visible latency.<br>`,
            codeExamples: [
                `# Container-aware memory. NOT -Xmx, which hard-codes a number that
# becomes wrong the moment the container limit changes.
java -XX:MaxRAMPercentage=75.0 \\
     -XX:+HeapDumpOnOutOfMemoryError \\
     -XX:HeapDumpPath=/tmp/heapdump.hprof \\
     -jar app.jar

# With a 1Gi container limit, the heap is capped near 768Mi and the
# rest is left for metaspace, thread stacks and native memory.
# Without it, the JVM may size the heap from the HOST's 64Gi and be
# killed the moment it grows.`,
                `# Finding what is slow at startup
java -jar app.jar --debug
# Prints the auto-configuration report.

# Or measure it directly:
management.endpoints.web.exposure.include=startup
# GET /actuator/startup
# [
#   { "startupStep": { "name": "spring.beans.instantiate",
#                      "tags": [{"key":"beanName","value":"entityManagerFactory"}] },
#     "duration": "PT2.14S" }
# ]
# One bean taking 2.1 seconds is now visible rather than suspected.`,
                `// Async startup for something genuinely slow, so it does not
// block the application becoming ready
@Component
public class ReferenceDataWarmer {

    @EventListener(ApplicationReadyEvent.class)
    @Async
    public void warm() {
        referenceDataService.loadAll();      // 6 seconds, off the startup path
    }
}
// The application accepts traffic immediately; the readiness probe
// should stay red until the warm-up finishes if requests actually
// need that data.`
            ]
        },
        {
            content: `<h3>Load Testing: the Only Way to Know</h3>
Everything above is diagnosis on a running system. To find the limit <em>before</em> production does, you have to generate load.<br><br>

<table>
<tr><th>Test type</th><th>Question it answers</th></tr>
<tr><td>Load test</td><td>Does it meet its latency target at expected traffic?</td></tr>
<tr><td>Stress test</td><td>Where does it break, and how? Gracefully, or by falling over?</td></tr>
<tr><td>Soak test</td><td>Does it degrade over hours? Memory leaks and connection leaks only appear here.</td></tr>
<tr><td>Spike test</td><td>Does it survive a sudden 10x, and does it recover afterwards?</td></tr>
</table>
<br>
<strong>Test against production-like data volumes.</strong> A load test on a 100-row table proves nothing about the missing index that will bite at 10 million - the database will keep the whole thing in memory and every query will look fast.<br>`,
            codeExamples: [
                `// A k6 script - the whole test
import http from 'k6/http';
import { check } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 },    // ramp up
        { duration: '2m',  target: 50 },    // hold
        { duration: '30s', target: 0 },     // ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],   // 95% under 500ms
        http_req_failed:   ['rate<0.01'],   // under 1% errors
    },
};

export default function () {
    const res = http.get('http://localhost:8080/api/orders?page=0&size=20');
    check(res, { 'status is 200': (r) => r.status === 200 });
}

// OUTPUT:
//   http_req_duration..: avg=142ms p(95)=487ms
//   http_req_failed....: 0.00%
//   ✓ p(95)<500
//
// Raise target to 200 and watch which threshold breaks first -
// that names your bottleneck.`,
                `// The order to work through a slow endpoint:
//
//  1. Is it slow?              http.server.requests p95
//  2. Is it the database?      hibernate statistics - how many queries?
//  3. Too many queries?        N+1 -> join fetch / projection
//  4. One slow query?          EXPLAIN -> add an index
//  5. Queries fine but queued? hikaricp.connections.pending -> pool or
//                              a transaction held too long
//  6. Database fine?           external call without a timeout
//  7. All of the above fine?   NOW profile the Java code
//
// Step 7 is where most people start, and it is right last.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the first thing you do about a slow endpoint?</td><td>Measure it. Look at <code>http.server.requests</code> percentiles, then the SQL log or Hibernate statistics - never guess.</td></tr>
<tr><td>What is the most common performance bug in a JPA application?</td><td>The N+1 select problem - one query for a list plus one per row for an association.</td></tr>
<tr><td>How do you detect N+1?</td><td>Enable <code>hibernate.generate_statistics</code> and count statements per request; 101 queries for 100 rows is the signature.</td></tr>
<tr><td>How do you fix it?</td><td><code>join fetch</code>, <code>@EntityGraph</code>, a DTO projection, or <code>@BatchSize</code>.</td></tr>
<tr><td>Why is a bigger connection pool often slower?</td><td>The database is bounded by cores and disk; extra connections add contention and context switching without adding throughput.</td></tr>
<tr><td>How do you size a pool?</td><td>Roughly <code>(cores * 2) + spindles</code>, counted across <em>all</em> application instances - ten instances of 50 is 500 connections at the database.</td></tr>
<tr><td>Why should an HTTP call not sit inside a transaction?</td><td>It holds a database connection for the duration of the network call, capping throughput and exhausting the pool.</td></tr>
<tr><td>Why does a composite index on (city, status) not help a query on status alone?</td><td>Composite indexes are usable left-to-right only - the leftmost prefix rule.</td></tr>
<tr><td>Why are percentiles better than averages?</td><td>A mean hides the tail; a 133ms mean can conceal a 4-second p99, and the p99 is what users experience.</td></tr>
<tr><td>Why use MaxRAMPercentage rather than -Xmx in a container?</td><td>It sizes the heap from the container limit. A JVM sizing from host RAM overshoots and gets OOMKilled with exit code 137.</td></tr>
<tr><td>How do you get slow non-essential work off the request path?</td><td><code>@Async</code> with <code>@TransactionalEventListener(AFTER_COMMIT)</code>, or publish to a queue.</td></tr>
<tr><td>Why must load tests use production-like data volumes?</td><td>A missing index is invisible on a small table - the database caches it entirely and every query looks fast.</td></tr>
<tr><td>When do you profile the Java code?</td><td>Last, after ruling out query count, indexes, pooling and external calls. CPU-bound Java is rarely the bottleneck in a CRUD service.</td></tr>
</table>`
        }
    ]
};
