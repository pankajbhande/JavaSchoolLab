// Microservices roadmap, part 2: sections 6-10 (resilience, database and transactions, security, distributed systems, observability).
// Examples use Java 21, Spring Boot 3.x and Spring Cloud. "${...}" placeholders are written "\${...}" in these template literals.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const ms = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('ms', n, title, priority, topics);

export const microservicesRoadmap2: SubTopic[] = [
  ms(6, 'Resilience and Fault Tolerance', 'Essential', [
    topic(
      'ms-circuit-breaker-resilience4j',
      'Circuit Breaker and Resilience4j',
      [
        blk(`<h3>The circuit breaker pattern</h3>
• Calls to a failing or slow dependency waste threads and make things worse (<b>cascading failure</b>). A <b>circuit breaker</b> wraps the call and tracks outcomes in a sliding window. States: <b>CLOSED</b> (normal; calls pass), <b>OPEN</b> (failure rate or slow-call rate above a threshold: calls <b>fail fast</b> without touching the dependency for a wait duration), <b>HALF_OPEN</b> (after the wait, a few <b>trial calls</b> are allowed: success closes the circuit, failure reopens it).<br>
• Benefits: fail fast (protects threads and latency), gives the dependency time to recover, enables <b>fallbacks</b> (cached/default data), and surfaces a clear metric (state, failure rate).`,
          `            failure rate >= threshold
   CLOSED ----------------------------------> OPEN
     ^                                          |
     | trial calls succeed                      | wait duration elapsed
     |                                          v
     +<------------------------------------- HALF_OPEN
                   trial call fails -> back to OPEN

 CLOSED: calls flow, results recorded in a sliding window (count- or time-based)
 OPEN: calls rejected immediately (CallNotPermittedException) -> fallback
 HALF_OPEN: permittedNumberOfCallsInHalfOpenState trial calls decide`,
        ),
      ],
      [
        blk(`<h3>Resilience4j with Spring Boot</h3>
• <b>Resilience4j</b> is the lightweight, functional fault-tolerance library (successor of Netflix Hystrix): <b>CircuitBreaker, Retry, TimeLimiter, Bulkhead, ThreadPoolBulkhead, RateLimiter, Cache</b>. Spring Boot starter <code>resilience4j-spring-boot3</code> + AOP; annotate methods (<code>@CircuitBreaker</code>, <code>@Retry</code>, <code>@Bulkhead</code>, <code>@TimeLimiter</code>, <code>@RateLimiter</code>) or use the Spring Cloud CircuitBreaker abstraction. Metrics via Micrometer; events via actuator.<br>
• Key settings: <code>slidingWindowType/Size</code>, <code>failureRateThreshold</code>, <code>slowCallDurationThreshold</code> + <code>slowCallRateThreshold</code>, <code>minimumNumberOfCalls</code>, <code>waitDurationInOpenState</code>, <code>permittedNumberOfCallsInHalfOpenState</code>, <code>recordExceptions</code>/<code>ignoreExceptions</code> (<b>do not count business errors like 404 as failures</b>).`,
          `# application.yml
resilience4j.circuitbreaker:
  instances:
    paymentService:
      sliding-window-type: COUNT_BASED
      sliding-window-size: 20
      minimum-number-of-calls: 10                    # do not judge before enough calls
      failure-rate-threshold: 50                     # open when >= 50% fail
      slow-call-duration-threshold: 2s
      slow-call-rate-threshold: 80                   # or when >= 80% are slower than 2s
      wait-duration-in-open-state: 20s
      permitted-number-of-calls-in-half-open-state: 5
      automatic-transition-from-open-to-half-open-enabled: true
      record-exceptions: [java.io.IOException, java.util.concurrent.TimeoutException, org.springframework.web.client.HttpServerErrorException]
      ignore-exceptions: [com.javaschoollab.PaymentDeclinedException]       # a declined card is not a failure of the service

@Service
class PaymentGateway {
    @CircuitBreaker(name = "paymentService", fallbackMethod = "pending")
    PaymentResult charge(PaymentRequest r) { return client.charge(r); }

    PaymentResult pending(PaymentRequest r, Throwable t) {               // same params + Throwable
        log.warn("payment service unavailable: {}", t.toString());
        return PaymentResult.queued(r.orderId());                        // degrade: accept the order, charge later
    }
}`,
        ),
      ],
      [
        blk(`<h3>Fallbacks, monitoring and tuning</h3>
• <b>Fallback design</b>: return a cached value, a default/empty result, a degraded feature (recommendations → popular courses), queue the work for later, or fail with a clear 503. <b>A fallback must not call the same failing dependency</b>, and must be fast and safe (no side effects that surprise users).<br>
• <b>Observe</b>: expose <code>/actuator/circuitbreakers</code>, Micrometer metrics (<code>resilience4j_circuitbreaker_state</code>, <code>..._calls_seconds</code>, failure rate) → Grafana panels and alerts when a breaker is OPEN. Log state transitions (<code>registerEventConsumer</code>).<br>
• <b>Tuning</b>: window size large enough to be statistically meaningful; <code>minimumNumberOfCalls</code> to avoid opening on one error at low traffic; separate breakers per dependency (and per critical operation); combine with <b>timeouts</b> (a hung call counts as slow/failed only if a timeout cuts it); order of aspects (Retry ( CircuitBreaker ( RateLimiter ( TimeLimiter ( Bulkhead ( Function ))))).`,
          `@Component
class BreakerLogging {
    BreakerLogging(CircuitBreakerRegistry registry) {
        registry.circuitBreaker("paymentService").getEventPublisher()
            .onStateTransition(e -> log.warn("breaker {} {} -> {}", e.getCircuitBreakerName(), e.getStateTransition().getFromState(), e.getStateTransition().getToState()))
            .onCallNotPermitted(e -> log.debug("rejected by open breaker"));
    }
}

# Prometheus alert
# - alert: CircuitBreakerOpen
#   expr: resilience4j_circuitbreaker_state{state="open"} == 1
#   for: 2m
#   annotations: { summary: "Breaker {{ $labels.name }} is OPEN" }

// Programmatic use
CircuitBreaker cb = registry.circuitBreaker("recommendations");
Supplier<List<Course>> decorated = CircuitBreaker.decorateSupplier(cb, () -> client.fetch(userId));
List<Course> result = Try.ofSupplier(decorated).recover(t -> popular()).get();`,
        ),
      ],
      [
        ['How does a circuit breaker work?', 'It monitors calls to a dependency. While CLOSED calls pass; when the failure or slow-call rate exceeds a threshold it OPENS and rejects calls immediately for a wait period; then HALF_OPEN allows trial calls to decide whether to close again.'],
        ['Which exceptions should count as failures?', 'Technical failures (timeouts, connection errors, 5xx). Business or client errors (404, validation, a declined payment) should be ignored, otherwise valid business outcomes open the circuit.'],
        ['What makes a good fallback?', 'A fast, side-effect-safe degraded result (cache, default, popular items, queued work) that does not depend on the failing service, with the degradation visible in logs and metrics.'],
      ],
    ),
    topic(
      'ms-retry-timeout-backoff',
      'Retry, Timeout, Exponential Backoff and Retry Storm Prevention',
      [
        blk(`<h3>Retry and timeout patterns</h3>
• <b>Retry</b> repeats a failed call for <b>transient</b> faults. Conditions: operation <b>idempotent</b>; failure is <b>transient</b> (timeouts, connection reset, 502/503/504, 429 with <code>Retry-After</code>); small <b>max attempts</b> (2-3); <b>backoff</b> between attempts. <b>Never retry</b> 4xx client errors or non-idempotent POSTs without idempotency keys.<br>
• <b>Timeout</b> (TimeLimiter, HTTP client timeouts) bounds how long you wait. Every remote call needs one; the value comes from the SLO, the callee's p99 and the caller's own timeout (callee &lt; caller).<br>
• Order: <b>Retry wraps CircuitBreaker</b> (retries consume the breaker's window and stop when it is open) which wraps the timeout.`,
          `resilience4j:
  retry.instances.catalogue:
    max-attempts: 3
    wait-duration: 200ms
    enable-exponential-backoff: true
    exponential-backoff-multiplier: 2        # 200ms, 400ms
    enable-randomized-wait: true             # jitter
    randomized-wait-factor: 0.5
    retry-exceptions: [java.io.IOException, java.util.concurrent.TimeoutException, org.springframework.web.client.HttpServerErrorException$ServiceUnavailable]
    ignore-exceptions: [org.springframework.web.client.HttpClientErrorException]
  timelimiter.instances.catalogue:
    timeout-duration: 800ms
    cancel-running-future: true

@Retry(name = "catalogue")
@CircuitBreaker(name = "catalogue", fallbackMethod = "cached")
@TimeLimiter(name = "catalogue")
CompletableFuture<CourseDto> fetch(UUID id) { return CompletableFuture.supplyAsync(() -> client.get(id)); }`,
        ),
      ],
      [
        blk(`<h3>Exponential backoff with jitter</h3>
• <b>Fixed delay</b> retries from many clients arrive in <b>waves</b> and keep a recovering service down. <b>Exponential backoff</b> doubles the wait each attempt (100 ms, 200, 400, 800...) up to a cap; <b>jitter</b> randomises it so clients de-synchronise ("full jitter": random between 0 and the exponential cap, "decorrelated jitter").<br>
• Honour the server: if it sends <code>Retry-After</code> or 429, wait at least that long. Cap total retry time under the caller's deadline (deadline propagation).`,
          `// Full-jitter backoff
static Duration backoff(int attempt, Duration base, Duration cap) {
    long exp = Math.min(cap.toMillis(), base.toMillis() * (1L << attempt));    // base * 2^attempt, capped
    return Duration.ofMillis(ThreadLocalRandom.current().nextLong(0, exp + 1));  // random in [0, exp]
}

for (int attempt = 0; attempt < 4; attempt++) {
    try { return call(); }
    catch (TransientException e) {
        if (attempt == 3) throw e;
        Thread.sleep(backoff(attempt, Duration.ofMillis(100), Duration.ofSeconds(2)).toMillis());     // virtual threads make sleeping cheap
    }
}

// Spring Retry equivalent
@Retryable(retryFor = TransientException.class, maxAttempts = 4, backoff = @Backoff(delay = 100, multiplier = 2, maxDelay = 2000, random = true))
String call() { ... }`,
        ),
      ],
      [
        blk(`<h3>Retry storms and how to prevent them</h3>
• <b>Retry storm / retry amplification</b>: a dependency slows down; every layer retries; request volume multiplies (3 layers × 3 attempts = 27×), turning a brief slowdown into a prolonged outage.<br>
• <b>Prevention</b>: (1) <b>retry at one layer only</b> (usually the closest to the failing call, or the edge); (2) <b>retry budgets</b> (cap retries to ~10% of requests, as in Envoy/gRPC); (3) <b>exponential backoff + jitter</b>; (4) <b>circuit breaker</b> so retries stop when the dependency is clearly down; (5) <b>timeouts</b> shorter than the caller's; (6) <b>load shedding</b> at the server (reject early with 429/503 when overloaded); (7) <b>idempotency</b> so retries are safe; (8) <b>deadline propagation</b> (pass the remaining time budget downstream so deeper layers stop working on abandoned requests).<br>
• Test with <b>fault injection</b> (latency, errors) and watch request rates and queue depths.`,
          `// Layered retries multiply
client -> gateway(retry x3) -> order-service(retry x3) -> payment-service(retry x3)  = up to 27 calls for one user request

// Fix: retries only at the order-service -> payment-service hop; the gateway and client do not retry POSTs;
// the gateway filter retries only GET on 502/503 with 1 attempt.

# Gateway: no automatic retries for non-idempotent methods
# filters:
#   - name: Retry
#     args: { retries: 1, methods: GET, statuses: BAD_GATEWAY,SERVICE_UNAVAILABLE }

// Server-side load shedding
@Component class OverloadFilter extends OncePerRequestFilter {
    private final Semaphore inflight = new Semaphore(200);
    protected void doFilterInternal(HttpServletRequest rq, HttpServletResponse rs, FilterChain ch) throws IOException, ServletException {
        if (!inflight.tryAcquire()) { rs.setStatus(503); rs.setHeader("Retry-After", "2"); return; }     // reject early instead of queueing forever
        try { ch.doFilter(rq, rs); } finally { inflight.release(); }
    }
}`,
        ),
      ],
      [
        ['What is exponential backoff with jitter?', 'Increasing the wait between retries exponentially (capped) and randomising it, so many clients do not retry in synchronised waves and the failing service gets time to recover.'],
        ['What is a retry storm?', 'Layers of retries multiplying load on a struggling dependency, turning a brief slowdown into an outage. Prevent with single-layer retries, backoff and jitter, retry budgets, circuit breakers, timeouts and load shedding.'],
        ['Which requests are safe to retry?', 'Idempotent operations (GET, PUT, DELETE) or requests carrying an idempotency key, and only for transient failures such as timeouts and 502/503/504; not 4xx errors.'],
      ],
    ),
    topic(
      'ms-bulkhead-ratelimit-fallback',
      'Bulkhead, Rate Limiting, Fallback Mechanism and Fault Isolation',
      [
        blk(`<h3>Bulkhead pattern</h3>
• Like ship bulkheads, a <b>bulkhead</b> <b>isolates resources</b> so one failing part cannot sink the rest. Without it, a slow dependency consumes all threads/connections of the service and every endpoint, including unrelated ones, hangs.<br>
• Types: <b>semaphore bulkhead</b> (limit concurrent calls: <code>maxConcurrentCalls</code>, <code>maxWaitDuration</code>), <b>thread-pool bulkhead</b> (separate pool and queue per dependency), <b>connection-pool partitioning</b> (separate HTTP/DB pools per dependency), <b>deployment bulkheads</b> (separate service instances/queues for critical vs non-critical traffic), cell-based architecture.<br>
• With Java 21 <b>virtual threads</b> thread exhaustion is rarer, but <b>downstream connection and concurrency limits still matter</b>: use semaphores.`,
          `resilience4j:
  bulkhead.instances.reportService:
    max-concurrent-calls: 10              # at most 10 in-flight calls to the (slow) reporting service
    max-wait-duration: 50ms               # waiting callers fail fast instead of piling up
  thread-pool-bulkhead.instances.thumbnailService:
    core-thread-pool-size: 4
    max-thread-pool-size: 8
    queue-capacity: 20

@Bulkhead(name = "reportService", fallbackMethod = "busy")
Report generate(ReportRequest r) { return reportClient.generate(r); }
Report busy(ReportRequest r, BulkheadFullException e) { throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Reports are busy, try again shortly"); }

// Separate HTTP connection pools per dependency (RestClient / Apache HttpClient)
PoolingHttpClientConnectionManager paymentPool = new PoolingHttpClientConnectionManager();
paymentPool.setMaxTotal(50); paymentPool.setDefaultMaxPerRoute(50);      // payments cannot starve the catalogue client`,
        ),
      ],
      [
        blk(`<h3>Rate limiting (as a resilience tool)</h3>
• <b>Rate limiting</b> caps the request rate a client/tenant/service may make, protecting capacity and enforcing fairness. Applied <b>at the edge</b> (gateway: per user/API key/IP) and <b>inside services</b> (protect an expensive endpoint; Resilience4j <code>RateLimiter</code>: <code>limitForPeriod</code>, <code>limitRefreshPeriod</code>, <code>timeoutDuration</code>) and <b>client-side</b> (do not exceed a third-party API quota).<br>
• Responses: <b>429 Too Many Requests</b> + <code>Retry-After</code> and rate-limit headers (<code>X-RateLimit-Remaining</code>). Algorithms: token bucket, sliding window; distributed limiting needs a shared store (Redis). Combine with <b>load shedding</b> (drop low-priority work first) and <b>priority queues</b>.`,
          `resilience4j.ratelimiter.instances.smsProvider:
  limit-for-period: 20                 # at most 20 calls...
  limit-refresh-period: 1s             # ...per second (third-party quota)
  timeout-duration: 0                  # do not wait: fail fast

@RateLimiter(name = "smsProvider", fallbackMethod = "queueForLater")
void sendSms(Sms sms) { provider.send(sms); }
void queueForLater(Sms sms, RequestNotPermitted e) { smsOutbox.save(sms); }        // smooth the burst via the outbox

// per-tenant limiter in a servlet filter (token bucket with Bucket4j + Redis)
Bucket bucket = proxyManager.builder().build(tenantId, () -> BucketConfiguration.builder().addLimit(limit -> limit.capacity(100).refillGreedy(100, Duration.ofMinutes(1))).build());
if (!bucket.tryConsume(1)) { rs.setStatus(429); rs.setHeader("Retry-After", "60"); return; }`,
        ),
      ],
      [
        blk(`<h3>Fallbacks and fault isolation</h3>
• <b>Fallback mechanism</b> = graceful degradation: when a dependency fails return something useful: <b>cache</b> (stale data with a flag), <b>default/static</b> content, <b>reduced functionality</b> (hide recommendations), <b>alternate provider</b> (secondary payment gateway), <b>queue and process later</b> (accept the order, charge when the gateway recovers), <b>clear failure</b> (503 with guidance) for critical operations where wrong data is worse than none (balances).<br>
• <b>Fault isolation techniques</b>: bulkheads, circuit breakers, timeouts, <b>asynchronous events instead of sync chains</b>, separate databases/caches per service, per-tenant isolation (<b>cell architecture</b>), <b>feature flags/kill switches</b> to disable a failing feature, <b>graceful degradation tiers</b>, <b>health-based routing</b> and <b>chaos engineering</b> to prove the isolation works.<br>
• Design question for every dependency: <b>"what does the user see if this is down?"</b>`,
          `@Service
class HomePageService {
    HomePage build(UUID userId) {
        var courses = catalogue.featured();                                    // critical: if it fails the page fails
        var recs   = safe(() -> recommendations.forUser(userId), List.of());   // optional: degrade to empty
        var streak = safe(() -> learning.streak(userId), Streak.unknown());    // optional
        return new HomePage(courses, recs, streak);
    }
    private <T> T safe(Supplier<T> call, T fallback) {
        try { return call.get(); } catch (Exception e) { log.warn("degraded: {}", e.toString()); metrics.counter("home.degraded").increment(); return fallback; }
    }
}

// kill switch via Spring Cloud Config / feature flag
if (!flags.isEnabled("recommendations")) return List.of();`,
        ),
      ],
      [
        ['What is the bulkhead pattern?', 'Isolating resources (thread pools, semaphores, connection pools, instances) per dependency or workload so that a failure or slowdown in one cannot exhaust the resources needed by the rest of the system.'],
        ['How do you prevent cascading failures?', 'Use timeouts, circuit breakers, bulkheads, rate limiting/load shedding, asynchronous communication instead of long synchronous chains, fallbacks and isolated data stores, and verify with fault-injection tests.'],
        ['What is graceful degradation?', 'Continuing to serve a reduced but useful experience when a dependency fails (cached or default data, hidden optional features, queued work) instead of failing the whole request.'],
      ],
    ),
  ]),

  ms(7, 'Database and Transactions', 'Core', [
    topic(
      'ms-db-per-service-migrations',
      'Database per Service in Practice: Spring Data JPA, Hibernate, Migrations and Sharding',
      [
        blk(`<h3>Spring Data JPA and Hibernate per service</h3>
• Each service has its own <b>schema/database</b>, its own entities and repositories, and its own migrations. Use <b>Spring Data JPA + Hibernate</b> for aggregates, with the practices from the Hibernate course: LAZY associations, DTO projections, <code>open-in-view=false</code>, short transactions, <code>@Version</code> optimistic locking, batch fetching and query-count tests.<br>
• <b>No foreign keys across services</b>: reference other aggregates by <b>id</b> (<code>UUID courseId</code>), not by entity association; integrity is eventual and enforced by events/sagas. Keep <b>aggregates small</b> (one transaction per aggregate).`,
          `@Entity
@Table(name = "enrollment")
class Enrollment {
    @Id private UUID id = UUID.randomUUID();                  // UUIDs: safe to generate in any service
    @Column(nullable = false) private UUID studentId;         // id of an entity owned by identity-service (NO @ManyToOne, NO FK)
    @Column(nullable = false) private UUID courseId;          // owned by catalogue-service
    @Enumerated(EnumType.STRING) private Status status = Status.ACTIVE;
    @Version private long version;
}

interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    boolean existsByStudentIdAndCourseId(UUID studentId, UUID courseId);
    @Query("select new com.jsl.learning.EnrollmentView(e.id, e.courseId, e.status) from Enrollment e where e.studentId = :student")
    List<EnrollmentView> viewsFor(@Param("student") UUID student);
}`,
        ),
      ],
      [
        blk(`<h3>Database migrations in a multi-service world</h3>
• Each service runs its <b>own Flyway/Liquibase</b> migrations on startup (or as a Kubernetes <b>init container/Job</b> for safer rollouts). Rules: versioned and immutable, reviewed, tested on production-like data; <code>ddl-auto=validate</code>.<br>
• <b>Zero-downtime changes</b> with rolling deployments (old and new versions run together): use <b>expand/contract</b>: (1) <b>expand</b>: add nullable column/new table (compatible with the old code); (2) deploy new code writing both/reading new; (3) <b>backfill</b>; (4) <b>contract</b>: drop the old column in a later release. Avoid renames and type changes in one step; create indexes <code>CONCURRENTLY</code> (PostgreSQL); batch big backfills.<br>
• Concurrent startup of N instances: Flyway uses a DB lock so only one migrates; prefer a dedicated migration job for big changes.`,
          `# application.yml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: false
    validate-on-migrate: true

-- V7__expand_enrollment_status.sql  (safe with the old version still running)
ALTER TABLE enrollment ADD COLUMN completed_at TIMESTAMP NULL;
CREATE INDEX CONCURRENTLY idx_enrollment_student ON enrollment (student_id);        -- PostgreSQL: no table lock (cannot run in a transaction: flyway: executeInTransaction=false)

-- V8__backfill.sql (a later release, in batches)
UPDATE enrollment SET completed_at = updated_at WHERE status = 'COMPLETED' AND completed_at IS NULL;

# Kubernetes: run migrations once before the new pods start
# initContainers: [{ name: migrate, image: catalogue:2.4.0, args: ["--spring.main.web-application-type=none", "--flyway.only=true"] }]`,
        ),
      ],
      [
        blk(`<h3>Database sharding and scaling data</h3>
• <b>Sharding</b> splits one logical dataset across multiple databases (shards) by a <b>shard key</b> (<code>tenantId</code>, <code>userId</code> hash, region) to scale writes/storage beyond one node. Strategies: <b>range</b> (hot spots), <b>hash</b>/consistent hashing (even), <b>directory/lookup</b> (flexible), <b>geographic</b>. Costs: cross-shard queries/transactions are hard, <b>re-sharding</b> is painful, hot keys, operational load. Do it <b>last</b>.<br>
• Scale in this order: <b>indexes and query tuning</b> → <b>caching</b> (Redis) → <b>read replicas</b> (CQRS reads, replication lag) → <b>partitioning</b> (table partitions) → <b>vertical split</b> (service per capability, already done) → <b>sharding</b> or a distributed SQL database (CockroachDB, YugabyteDB, Vitess, Citus).<br>
• Choose the right store per service (<b>polyglot persistence</b>): relational for transactions, document/key-value for flexible/high-volume data, search (Elasticsearch/OpenSearch), time-series, cache.`,
          `// Application-level sharding: route a tenant to its database
class ShardRouting extends AbstractRoutingDataSource {
    @Override protected Object determineCurrentLookupKey() { return "shard-" + Math.floorMod(TenantContext.current().hashCode(), 4); }
}
@Bean DataSource dataSource() {
    var routing = new ShardRouting();
    routing.setTargetDataSources(Map.of("shard-0", ds0, "shard-1", ds1, "shard-2", ds2, "shard-3", ds3));
    routing.setDefaultTargetDataSource(ds0);
    return routing;
}

// Read replica routing with @Transactional(readOnly = true)
class ReplicaRouting extends AbstractRoutingDataSource {
    @Override protected Object determineCurrentLookupKey() { return TransactionSynchronizationManager.isCurrentTransactionReadOnly() ? "replica" : "primary"; }
}
// careful: replicas lag; read-your-own-writes needs the primary`,
        ),
      ],
      [
        ['Why should entities of different services not have foreign keys between them?', 'Each service owns its data; cross-service foreign keys couple schemas and deployments. Reference other aggregates by id and maintain consistency through events or sagas.'],
        ['What is the expand/contract migration pattern?', 'Make schema changes in compatible steps: add new structures first (expand), deploy code that uses them and backfill data, and remove the old structures in a later release (contract), so old and new service versions run safely side by side.'],
        ['When should you shard a database?', 'Only after exhausting indexing, caching, read replicas and partitioning, because sharding makes cross-shard queries, transactions and re-sharding complex.'],
      ],
    ),
    topic(
      'ms-distributed-tx-saga',
      'Distributed Transactions: 2PC, Saga, Choreography vs Orchestration and Eventual Consistency',
      [
        blk(`<h3>The problem and Two-Phase Commit (2PC)</h3>
• With database per service a business operation (place order: reserve stock, charge payment, create shipment) spans several databases: <b>no single ACID transaction</b>.<br>
• <b>2PC</b>: a coordinator asks all participants to <b>prepare</b> (lock and vote), then <b>commit</b> or <b>abort</b>. Provides atomicity (XA/JTA), but: <b>blocking</b> (locks held while waiting for the coordinator; a coordinator failure leaves participants stuck), <b>latency</b>, reduced availability (all must be up), and <b>not supported</b> by many brokers/NoSQL/SaaS. It also tightly couples services. <b>Avoid 2PC in microservices</b>; use sagas and eventual consistency.`,
          `2PC                                            Saga
 coordinator                                    order-service: create order (PENDING)  -> commit local tx
   prepare -> payment DB, stock DB, order DB      -> payment-service: charge             -> commit local tx
   (all hold locks, wait)                         -> stock-service: reserve stock        -> commit local tx   (fails!)
   commit/abort                                   <- compensate: refund payment, cancel order (new local txs)
 atomic, but blocking, slow, brittle            eventually consistent, available, needs compensations`,
        ),
      ],
      [
        blk(`<h3>The Saga pattern</h3>
• A <b>saga</b> is a sequence of <b>local transactions</b>, each in one service and each publishing an event/message to trigger the next. If a step fails, <b>compensating transactions</b> undo the effects of the previous steps (<b>semantic undo</b>: refund, cancel, release). No distributed locks; data is <b>eventually consistent</b>.<br>
• Design issues: <b>compensations must be idempotent and retryable</b> and cannot fail permanently; some actions are <b>non-compensable</b> (sent e-mail): order them last or use <b>pivot transactions</b> (point of no return); <b>lack of isolation</b> (other transactions see intermediate states: use <b>semantic locks</b> (<code>PENDING</code> status), commutative updates, re-reads, versioning); each step persists <b>saga state</b>.`,
          `Place order saga (happy path and failure)
 1. order-service   : createOrder(PENDING)                     compensation: cancelOrder
 2. stock-service   : reserveStock                             compensation: releaseStock
 3. payment-service : chargeCustomer                           compensation: refund
 4. order-service   : approveOrder(CONFIRMED)

 failure at step 3 (card declined):
   payment-service -> PaymentFailed event
   stock-service   -> releaseStock (compensate step 2)
   order-service   -> cancelOrder / REJECTED (compensate step 1)`,
        ),
      ],
      [
        blk(`<h3>Choreography vs orchestration</h3>
<table ${TABLE}>
<tr><th></th><th>Choreography</th><th>Orchestration</th></tr>
<tr><td>Control</td><td>Decentralised: services react to each other's events</td><td>A central <b>orchestrator</b> (saga coordinator) commands participants</td></tr>
<tr><td>Coupling</td><td>Loose, but implicit flow (hard to see)</td><td>Participants know the orchestrator's API; flow explicit</td></tr>
<tr><td>Complexity</td><td>Fine for 2-4 steps; becomes a tangle with more (cyclic dependencies)</td><td>Better for long/complex flows; one place to see and test</td></tr>
<tr><td>Failure handling</td><td>Each service emits failure events</td><td>Orchestrator tracks state and triggers compensations</td></tr>
<tr><td>Risk</td><td>Hard to trace and change</td><td>Orchestrator can become a "god service"</td></tr>
<tr><td>Tools</td><td>Kafka/RabbitMQ events</td><td>Temporal, Camunda, Conductor, Axon, Step Functions, custom state machine</td></tr>
</table>
• <b>Eventual consistency</b>: replicas/services converge to a consistent state given time and no new updates. Design the UX for it: show <b>pending</b> states, use optimistic UI, notify on completion, make operations idempotent, and expose <b>status endpoints</b>. Define business-acceptable <b>consistency windows</b> (seconds, not days).`,
          `// Orchestration with a state machine in order-service (simplified)
@Service
class PlaceOrderSaga {
    @Transactional
    void start(OrderRequest r) {
        Order o = orders.save(Order.pending(r));
        outbox.publish(new ReserveStock(o.id(), r.items()));                       // command to stock-service
    }
    @KafkaListener(topics = "stock.replies") @Transactional
    void on(StockReserved e)  { orders.markStockReserved(e.orderId()); outbox.publish(new ChargePayment(e.orderId(), orders.total(e.orderId()))); }
    @KafkaListener(topics = "payment.replies") @Transactional
    void on(PaymentCharged e) { orders.confirm(e.orderId()); outbox.publish(new OrderConfirmed(e.orderId())); }
    @KafkaListener(topics = "stock.replies") @Transactional
    void on(StockRejected e)  { orders.reject(e.orderId(), "out of stock"); }
    @KafkaListener(topics = "payment.replies") @Transactional
    void on(PaymentFailed e)  { outbox.publish(new ReleaseStock(e.orderId())); orders.reject(e.orderId(), "payment failed"); }   // compensation
}`,
        ),
      ],
      [
        ['What is the Saga pattern?', 'A way to manage a business transaction across services as a sequence of local transactions, each triggering the next by events or commands, with compensating transactions to undo completed steps if a later step fails.'],
        ['Choreography vs orchestration?', 'Choreography has services react to each other\'s events with no central controller (loose coupling, implicit flow); orchestration uses a central coordinator that directs each step and compensation (explicit flow, easier for complex sagas).'],
        ['Why avoid 2PC in microservices?', 'It holds locks across services, reduces availability, adds latency, tightly couples participants and is unsupported by many modern stores and brokers; sagas with eventual consistency are preferred.'],
      ],
    ),
    topic(
      'ms-outbox-cqrs',
      'Transactional Outbox and CQRS',
      [
        blk(`<h3>The dual-write problem and the transactional outbox</h3>
• A service must update its database <b>and</b> publish an event. Doing both separately is a <b>dual write</b>: if the DB commit succeeds but the broker publish fails (or vice versa) the system becomes inconsistent. You cannot make a DB and a broker atomic with a simple transaction.<br>
• <b>Transactional outbox</b>: in the <b>same local database transaction</b> save the business change <b>and</b> insert the event into an <code>outbox</code> table. A separate <b>relay</b> reads unpublished rows and publishes them to the broker, then marks them published (<b>at-least-once</b>: consumers must be idempotent). Relay options: <b>polling publisher</b> (scheduled job, <code>FOR UPDATE SKIP LOCKED</code>), or <b>CDC</b> (Debezium reading the DB log: lower latency, no polling load, preserves order).`,
          `-- outbox table in the service's own database
CREATE TABLE outbox_event (
  id UUID PRIMARY KEY, aggregate_type VARCHAR(50), aggregate_id VARCHAR(50),
  event_type VARCHAR(100), payload JSONB, created_at TIMESTAMP NOT NULL DEFAULT now(), published_at TIMESTAMP NULL);
CREATE INDEX idx_outbox_unpublished ON outbox_event (created_at) WHERE published_at IS NULL;

@Transactional
public OrderResponse place(PlaceOrder cmd) {
    Order order = orders.save(Order.place(cmd));                                           // 1. business change
    outbox.save(OutboxEvent.of("Order", order.id(), "OrderPlaced", new OrderPlaced(order.id(), order.total())));   // 2. same transaction
    return mapper.toResponse(order);                                                       // both committed or both rolled back
}

// Polling relay
@Scheduled(fixedDelayString = "PT1S")
@Transactional
void relay() {
    List<OutboxEvent> batch = outbox.lockUnpublished(100);        // select ... where published_at is null order by created_at limit 100 for update skip locked
    for (OutboxEvent e : batch) { kafka.send(topicFor(e), e.aggregateId(), e.payload()).join(); e.markPublished(); }
}`,
        ),
      ],
      [
        blk(`<h3>CQRS: separate reads and writes</h3>
• <b>CQRS</b> (Command Query Responsibility Segregation) uses <b>different models</b> for <b>commands</b> (writes: validate, enforce invariants, change state) and <b>queries</b> (reads: optimised, denormalised views). The write side emits events; <b>projections</b> update a <b>read model</b> (another table, Elasticsearch, Redis, a materialized view), often in another service. Result: fast, tailored queries, independent scaling of reads vs writes, and a way to <b>join data across services without distributed queries</b>.<br>
• Cost: complexity and <b>eventual consistency</b> between write and read (the UI may not see its own write immediately: return the new state from the command, use version/polling or "read your writes" tricks). <b>Do not use CQRS everywhere</b>: apply it to areas with complex reads/high read load or cross-service views. Can be done simply: same DB with separate query classes/projections (no events).<br>
• <b>CQRS + Event Sourcing</b> is a separate, optional step (state stored as events).`,
          `// WRITE side: command handler in order-service (normalised, consistent)
record PlaceOrderCommand(UUID customerId, List<Item> items) {}
@Transactional UUID handle(PlaceOrderCommand c) { Order o = Order.place(c); orders.save(o); outbox.publish(OrderPlaced.of(o)); return o.id(); }

// READ side: reporting-service builds a denormalised view from events
@KafkaListener(topics = "orders.events", groupId = "reporting")
@Transactional
void project(OrderPlaced e) {
    var customer = customerCache.get(e.customerId());                               // data copied from identity events
    orderSummaryRepo.save(new OrderSummary(e.orderId(), customer.name(), e.total(), e.placedAt(), e.items().size()));
}
// query side: one table, no joins, returns exactly what the screen needs
@GetMapping("/api/v1/reports/orders") Page<OrderSummary> list(Pageable p) { return orderSummaryRepo.findAll(p); }

-- or just a materialized view in the same database for a simple CQRS
CREATE MATERIALIZED VIEW course_stats AS SELECT course_id, count(*) enrolments, avg(progress) avg_progress FROM enrollment GROUP BY course_id;
REFRESH MATERIALIZED VIEW CONCURRENTLY course_stats;`,
        ),
      ],
      [
        blk(`<h3>Outbox in production: CDC with Debezium, ordering and housekeeping</h3>
• <b>Polling vs CDC</b>: polling is simple but adds latency (the poll interval) and database load; <b>Debezium</b> (Kafka Connect) tails the database <b>transaction log</b> (WAL/binlog) and publishes each outbox insert to Kafka with <b>low latency and preserved commit order</b>; the <b>outbox event router</b> SMT routes rows to topics by <code>aggregate_type</code> and uses <code>aggregate_id</code> as the key. Delete or archive published rows (CDC reads the log, so a delete right after insert is fine).<br>
• <b>Guarantees</b>: at-least-once (a relay crash after publishing and before marking leads to a duplicate): consumers must be idempotent (inbox). <b>Ordering</b> per aggregate is kept by keying on the aggregate id. Monitor <b>outbox backlog</b> (age of the oldest unpublished event) and alert on it; add an <b>event id</b> and <b>schema version</b>.<br>
• The mirror image on the consumer side is the <b>inbox pattern</b>.`,
          `{
  "name": "outbox-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "orders-db", "database.dbname": "orders", "topic.prefix": "orders",
    "table.include.list": "public.outbox_event",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.table.field.event.id": "id",
    "transforms.outbox.table.field.event.key": "aggregate_id",
    "transforms.outbox.table.field.event.payload": "payload",
    "transforms.outbox.route.by.field": "aggregate_type",
    "transforms.outbox.route.topic.replacement": "\${routedByValue}.events"
  }
}

-- housekeeping when polling: keep the table small
DELETE FROM outbox_event WHERE published_at < now() - interval '7 days';
-- alert: select extract(epoch from now() - min(created_at)) from outbox_event where published_at is null   (age of the oldest unpublished event)`,
        ),
      ],
      [
        ['What problem does the transactional outbox solve?', 'The dual-write problem: updating the database and publishing an event atomically. The event is stored in an outbox table in the same local transaction and relayed to the broker afterwards, giving at-least-once publication without distributed transactions.'],
        ['What is CQRS and when is it useful?', 'Separating the write model (commands, invariants) from one or more read models optimised for queries, updated through events. Useful for complex or high-volume reads and for cross-service views, at the cost of eventual consistency and extra complexity.'],
        ['How do you handle the eventual consistency of a CQRS read model in the UI?', 'Return the updated state from the command, show pending/optimistic UI, use version numbers or polling until the projection catches up, and keep the lag short and monitored.'],
      ],
    ),
  ]),

  ms(8, 'Security', 'Essential', [
    topic(
      'ms-security-jwt-oauth',
      'Spring Security, Authentication vs Authorization, JWT, OAuth 2.0 and OpenID Connect',
      [
        blk(`<h3>Authentication vs authorization, and security in a microservice world</h3>
• <b>Authentication (AuthN)</b>: who are you? <b>Authorization (AuthZ)</b>: what may you do? In microservices, authentication happens <b>once</b> (at an <b>identity provider</b> / auth server) and the proof travels as a <b>token</b>; every service <b>validates the token</b> and <b>authorises</b> locally ("trust nobody": zero trust). Avoid per-service login forms and shared session stores.<br>
• Architecture: <b>Authorization Server / IdP</b> (Keycloak, Spring Authorization Server, Okta, Auth0, Entra ID) issues tokens; the <b>API gateway</b> and services are <b>OAuth2 resource servers</b>; clients (SPA, mobile) use <b>Authorization Code + PKCE</b>; services use <b>Client Credentials</b> for service-to-service.`,
          `Browser/mobile --(1) login: Authorization Code + PKCE--> Authorization Server (Keycloak)
              <--(2) access token (JWT) + id token + refresh token--
Browser --(3) Authorization: Bearer <access token>--> API Gateway --(4) forwards token--> catalogue-service
catalogue-service (resource server): verify signature (JWKS), issuer, audience, expiry -> read roles/scopes -> authorise`,
        ),
      ],
      [
        blk(`<h3>JWT and OAuth 2.0</h3>
• A <b>JWT</b> (<code>header.payload.signature</code>) carries claims: <code>iss</code> (issuer), <code>sub</code> (user), <code>aud</code> (audience), <code>exp</code>, <code>iat</code>, <code>scope</code>/<code>roles</code>. It is <b>signed</b> (RS256/ES256 with the IdP's private key; services verify with the public key from the <b>JWKS endpoint</b>), not encrypted: never put secrets in it. <b>Short expiry</b> (5-15 min) because JWTs cannot be revoked easily; use <b>refresh tokens</b>, token revocation lists/introspection for sensitive cases.<br>
• <b>OAuth 2.0</b> is an <b>authorization framework</b> (delegated access) with grant types: <b>Authorization Code + PKCE</b> (users; the recommended flow), <b>Client Credentials</b> (machine-to-machine), <b>Refresh Token</b>; Implicit and Password grants are deprecated. <b>Scopes</b> describe the access requested (<code>courses.read</code>).<br>
• <b>OpenID Connect (OIDC)</b> is an <b>identity layer on OAuth 2.0</b>: adds the <b>ID token</b> (a JWT about the authentication event: <code>sub</code>, <code>email</code>, <code>name</code>), the <code>openid</code> scope, the <code>/userinfo</code> endpoint and discovery (<code>/.well-known/openid-configuration</code>). OAuth = <b>authorization</b>, OIDC = <b>authentication</b>.`,
          `// Spring Boot resource server (every service)
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-oauth2-resource-server</artifactId></dependency>

spring.security.oauth2.resourceserver.jwt:
  issuer-uri: https://auth.javaschoollab.com/realms/jsl          # signature keys discovered from issuer/.well-known
  audiences: catalogue-service                                    # reject tokens meant for other APIs

@Configuration @EnableWebSecurity @EnableMethodSecurity
class SecurityConfig {
    @Bean SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .csrf(c -> c.disable())                                // stateless bearer-token API
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/actuator/health/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/courses/**").hasAuthority("SCOPE_courses.read")
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(rolesConverter())))
            .build();
    }
    JwtAuthenticationConverter rolesConverter() {                    // map Keycloak realm_access.roles to ROLE_*
        var c = new JwtAuthenticationConverter();
        c.setJwtGrantedAuthoritiesConverter(jwt -> ((Map<String, List<String>>) jwt.getClaim("realm_access")).get("roles").stream().map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r.toUpperCase())).toList());
        return c;
    }
}`,
        ),
      ],
      [
        blk(`<h3>Common token pitfalls</h3>
• <b>Validate everything</b>: signature, <code>iss</code>, <code>aud</code>, <code>exp</code>/<code>nbf</code> (small clock skew), algorithm (reject <code>none</code>; pin expected algorithms). Never accept an unsigned token or decode without verifying. Do not use ID tokens as API access tokens; do not use access tokens as proof of login in clients.<br>
• <b>Token storage</b> (browser clients): prefer a <b>BFF</b> (backend for frontend) holding tokens server-side with an HttpOnly session cookie; avoid <code>localStorage</code> (XSS). Mobile: secure storage.<br>
• <b>Revocation/logout</b>: JWTs are valid until <code>exp</code>: keep them short, rotate refresh tokens, support <b>opaque tokens + introspection</b> where immediate revocation matters, and propagate logout events.<br>
• <b>Do not put authorisation data that changes often in the token</b> (stale permissions): keep roles coarse in the token and check fine-grained rules against fresh data in the service.`,
          `// Decode a token for debugging (jwt.io offline): the payload is only base64url, readable by anyone
// {"iss":"https://auth.javaschoollab.com/realms/jsl","sub":"7d1c...","aud":"catalogue-service","exp":1760000000,
//  "scope":"openid courses.read","realm_access":{"roles":["student"]},"email":"asha@example.com"}

// opaque token introspection (immediate revocation)
spring.security.oauth2.resourceserver.opaquetoken:
  introspection-uri: https://auth.javaschoollab.com/realms/jsl/protocol/openid-connect/token/introspect
  client-id: catalogue-service
  client-secret: \${INTROSPECTION_SECRET}

// custom validator: require a specific tenant claim
OAuth2TokenValidator<Jwt> tenant = jwt -> "jsl".equals(jwt.getClaimAsString("tenant")) ? OAuth2TokenValidatorResult.success() : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_tenant"));
JwtDecoder decoder = JwtDecoders.fromIssuerLocation(issuer);
((NimbusJwtDecoder) decoder).setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(issuer), tenant));`,
        ),
      ],
      [
        ['OAuth 2.0 vs OpenID Connect?', 'OAuth 2.0 is a delegated-authorisation framework issuing access tokens for APIs; OpenID Connect adds an identity layer on top (ID token, userinfo, discovery) to authenticate the user.'],
        ['Why are JWT access tokens short-lived?', 'They are self-contained and valid until expiry, so they cannot be easily revoked; a short lifetime limits the damage of a leak, while refresh tokens renew sessions.'],
        ['What must a resource server validate in a JWT?', 'The signature (against the issuer\'s JWKS), expected algorithm, issuer, audience, expiry/not-before, and then scopes/roles for authorisation; never trust a token without verification.'],
      ],
    ),
    topic(
      'ms-gateway-s2s-rbac-method',
      'API Gateway Security, Service-to-Service Authentication, RBAC and Method-Level Security',
      [
        blk(`<h3>Gateway security and zero trust</h3>
• The <b>gateway</b> terminates TLS, validates the token (or delegates to the IdP), applies rate limits, CORS and security headers, and may forward <b>identity</b> (the original JWT, or trusted headers it sets) downstream. <b>Zero trust</b>: internal services still <b>validate the token</b> and authorise; network location is not trust. Strip client-provided identity headers; do not let services be reachable bypassing the gateway (network policies).<br>
• <b>Token relay</b>: the gateway passes the user's access token to services (<code>TokenRelay</code> filter) so authorisation uses the end user's identity; or <b>token exchange</b> (RFC 8693) to get a down-scoped token for a downstream audience.`,
          `spring:
  cloud.gateway.routes:
    - id: learning
      uri: lb://learning-service
      predicates: [ Path=/api/learning/** ]
      filters:
        - TokenRelay=                              # forward the user's access token downstream
        - RemoveRequestHeader=X-User-Id            # never trust client-supplied identity headers

# Kubernetes NetworkPolicy: only the gateway may call learning-service
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: learning-allow-gateway }
spec:
  podSelector: { matchLabels: { app: learning-service } }
  ingress: [ { from: [ { podSelector: { matchLabels: { app: api-gateway } } } ], ports: [ { port: 8080 } ] } ]`,
        ),
      ],
      [
        blk(`<h3>Service-to-service authentication</h3>
• Options: (1) <b>OAuth2 Client Credentials</b>: the calling service gets its own short-lived token (scopes/roles for what it may do) from the auth server and sends it as a bearer token: simple, auditable, works across platforms. (2) <b>Propagate the user's JWT</b> (token relay) when the call is on behalf of the user. (3) <b>mTLS</b>: each service has a certificate; the mesh (Istio/Linkerd, SPIFFE/SPIRE) or app terminates mutual TLS: strong workload identity, automatic rotation, encrypts east-west traffic. (4) API keys/shared secrets: weak, avoid.<br>
• Combine: <b>mTLS for transport identity + JWT for end-user identity and authorisation</b>. Cache client-credential tokens until near expiry.`,
          `# order-service calling payment-service with its own identity (client credentials)
spring:
  security.oauth2.client:
    registration.payment-client:
      provider: keycloak
      client-id: order-service
      client-secret: \${ORDER_SERVICE_SECRET}
      authorization-grant-type: client_credentials
      scope: payments.write
    provider.keycloak.token-uri: https://auth.javaschoollab.com/realms/jsl/protocol/openid-connect/token

@Bean
RestClient paymentClient(RestClient.Builder b, OAuth2AuthorizedClientManager manager) {
    return b.baseUrl("http://payment-service").requestInterceptor((req, body, ex) -> {
        OAuth2AuthorizedClient c = manager.authorize(OAuth2AuthorizeRequest.withClientRegistrationId("payment-client").principal("order-service").build());
        req.getHeaders().setBearerAuth(c.getAccessToken().getTokenValue());                        // cached until expiry
        return ex.execute(req, body);
    }).build();
}

# Istio: require mTLS for the whole namespace
# apiVersion: security.istio.io/v1  kind: PeerAuthentication  spec: { mtls: { mode: STRICT } }`,
        ),
      ],
      [
        blk(`<h3>Role-based access control and method-level security</h3>
• <b>RBAC</b>: users get <b>roles</b> (STUDENT, INSTRUCTOR, ADMIN) which grant permissions. Roles in the token (from the IdP) give <b>coarse</b> access; <b>fine-grained</b> rules (own resources, attributes) are checked in the service: <b>ABAC/ownership</b> checks. Principle of <b>least privilege</b>; deny by default.<br>
• <b>Method security</b> (<code>@EnableMethodSecurity</code>): <code>@PreAuthorize("hasRole('ADMIN')")</code>, <code>@PreAuthorize("hasAuthority('SCOPE_courses.write')")</code>, SpEL with parameters and beans (<code>@enrollmentSecurity.isOwner(#id, authentication)</code>), <code>@PostAuthorize</code> (check the returned object), <code>@PostFilter</code>, <code>@Secured</code>. Enforce at the <b>service layer</b> so rules apply regardless of the entry point (REST, messaging, jobs).<br>
• Test authorisation with <code>@WithMockUser</code>/<code>jwt()</code> request post-processors; include negative tests (403/404 for other users' data).`,
          `@Service
class EnrollmentService {
    @PreAuthorize("hasRole('STUDENT') and #studentId == authentication.name")                   // only for yourself
    public List<EnrollmentView> forStudent(String studentId) { ... }

    @PreAuthorize("hasRole('ADMIN') or @enrollmentSecurity.isOwner(#id, authentication)")        // admin or owner
    public EnrollmentView get(UUID id) { ... }

    @PostAuthorize("returnObject.studentId == authentication.name or hasRole('ADMIN')")
    public Certificate certificate(UUID id) { ... }

    @PreAuthorize("hasAuthority('SCOPE_enrollments.delete')")
    public void cancel(UUID id) { ... }
}

@Component("enrollmentSecurity")
class EnrollmentSecurity {
    boolean isOwner(UUID enrollmentId, Authentication auth) { return enrollments.findStudentId(enrollmentId).map(auth.getName()::equals).orElse(false); }
}

@Test void studentCannotReadOthers() throws Exception {
    mvc.perform(get("/api/v1/enrollments/" + otherId).with(jwt().jwt(j -> j.subject("student-1")).authorities(new SimpleGrantedAuthority("ROLE_STUDENT"))))
       .andExpect(status().isForbidden());
}`,
        ),
      ],
      [
        ['How do microservices authenticate each other?', 'Typically with OAuth2 client credentials (each service gets its own short-lived token) or mTLS from a service mesh for workload identity; end-user identity is propagated with the user\'s JWT (token relay or token exchange).'],
        ['Why validate tokens in every service, not only at the gateway?', 'Zero trust: services can be reached from inside the network or via misconfiguration, so each must verify the token and authorise; the gateway is just one layer.'],
        ['What does method-level security add?', 'Fine-grained authorisation rules (@PreAuthorize/@PostAuthorize with roles, scopes and ownership checks) enforced on service methods, independent of how they are invoked.'],
      ],
    ),
    topic(
      'ms-tls-secrets-keycloak',
      'HTTPS/TLS, Secrets Management and Keycloak Integration',
      [
        blk(`<h3>HTTPS and TLS</h3>
• <b>Encrypt in transit</b> everywhere: <b>edge TLS</b> at the gateway/ingress (public certificates, Let's Encrypt/cert-manager) and <b>east-west TLS</b> between services (mTLS via a service mesh, or Spring Boot SSL bundles). Use TLS 1.2+/1.3, strong ciphers, HSTS, redirect HTTP to HTTPS; automate <b>certificate rotation</b>. Terminate TLS at the ingress only if the internal network is trusted and policies enforce isolation; otherwise re-encrypt.<br>
• Spring Boot 3.1+ <b>SSL bundles</b> (<code>spring.ssl.bundle.pem.*</code>/<code>jks.*</code>) configure keystores/truststores for server and clients with reload on change.`,
          `# Spring Boot SSL bundle (PEM files mounted from a Kubernetes Secret / cert-manager)
spring:
  ssl.bundle.pem:
    server:
      keystore: { certificate: file:/certs/tls.crt, private-key: file:/certs/tls.key }
      truststore: { certificate: file:/certs/ca.crt }
      reload-on-update: true                           # pick up rotated certificates without a restart
server:
  ssl: { bundle: server, client-auth: want }           # mutual TLS when the client presents a certificate
  port: 8443

# cert-manager issues and renews certificates
# apiVersion: cert-manager.io/v1  kind: Certificate  spec: { secretName: catalogue-tls, issuerRef: { name: internal-ca }, dnsNames: [ catalogue-service.jsl.svc ] }

# Ingress with Let's Encrypt
# annotations: { cert-manager.io/cluster-issuer: letsencrypt }   tls: [ { hosts: [ api.javaschoollab.com ], secretName: api-tls } ]`,
        ),
      ],
      [
        blk(`<h3>Secrets management</h3>
• <b>Secrets</b> (DB passwords, API keys, signing keys, client secrets) must never be in source control, images, logs or plain ConfigMaps. Options: <b>HashiCorp Vault</b> (dynamic short-lived DB credentials, PKI, encryption as a service, audit), cloud secret managers (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager), <b>Kubernetes Secrets</b> (base64 only: enable encryption at rest, RBAC, and sync from a real vault with <b>External Secrets Operator</b> or the <b>Secrets Store CSI driver</b>; use <b>Sealed Secrets</b> for GitOps).<br>
• Practices: <b>least privilege</b> access per service, <b>rotation</b>, short-lived credentials, <b>no shared credentials</b> between services, scan repos for leaked secrets (gitleaks, GitHub secret scanning), mask secrets in logs/actuator (<code>management.endpoint.env.show-values=never</code>), and rotate immediately after exposure.`,
          `# External Secrets Operator: pull from Vault / AWS into a Kubernetes Secret
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata: { name: catalogue-db }
spec:
  refreshInterval: 1h
  secretStoreRef: { name: vault-backend, kind: ClusterSecretStore }
  target: { name: catalogue-db-secret }
  data: [ { secretKey: password, remoteRef: { key: secret/catalogue/db, property: password } } ]

# Spring Cloud Vault with dynamic DB credentials (lease-based, auto-rotated)
spring:
  config.import: "vault://"
  cloud.vault:
    uri: https://vault:8200
    authentication: KUBERNETES
    kubernetes: { role: catalogue, service-account-token-file: /var/run/secrets/kubernetes.io/serviceaccount/token }
    database: { enabled: true, role: catalogue-readwrite, backend: database }

management.endpoint.env.show-values: never          # actuator /env must not reveal secrets`,
        ),
      ],
      [
        blk(`<h3>Keycloak integration</h3>
• <b>Keycloak</b> is an open-source identity and access management server: <b>realms</b> (isolated user/client spaces), <b>clients</b> (applications: public SPA with PKCE, confidential backend, service account), <b>users/groups/roles</b> (realm roles and client roles), <b>mappers</b> (add claims to tokens), social login, MFA, user federation (LDAP), SSO, admin console/API, token lifetimes, brute-force protection. Run it with PostgreSQL in production (and behind HTTPS).<br>
• Integration: services are <b>resource servers</b> (<code>issuer-uri: https://auth/realms/jsl</code>); the SPA/BFF uses the <b>Authorization Code + PKCE</b> flow (<code>oauth2Login</code> in a Spring Boot BFF, or <code>keycloak-js</code>/<code>angular-oauth2-oidc</code>/<code>oidc-client-ts</code>); service accounts use <b>client credentials</b>. Map Keycloak roles (<code>realm_access.roles</code>, <code>resource_access.&lt;client&gt;.roles</code>) to Spring authorities. Export the realm as JSON for repeatable environments (Keycloak import/Terraform provider).`,
          `# docker-compose for local development
# services:
#   keycloak:
#     image: quay.io/keycloak/keycloak:26.0
#     command: start-dev --import-realm
#     environment: { KC_BOOTSTRAP_ADMIN_USERNAME: admin, KC_BOOTSTRAP_ADMIN_PASSWORD: admin }
#     volumes: [ ./keycloak/jsl-realm.json:/opt/keycloak/data/import/jsl-realm.json ]
#     ports: [ "8180:8080" ]

# Spring Boot BFF login (confidential client)
spring.security.oauth2.client:
  registration.keycloak: { client-id: jsl-web, client-secret: \${KC_CLIENT_SECRET}, scope: openid,profile,email, authorization-grant-type: authorization_code }
  provider.keycloak.issuer-uri: https://auth.javaschoollab.com/realms/jsl

@Bean SecurityFilterChain web(HttpSecurity http) throws Exception {
    return http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .oauth2Login(Customizer.withDefaults())
        .logout(l -> l.logoutSuccessHandler(oidcLogoutHandler()))               // RP-initiated logout at Keycloak
        .build();
}`,
        ),
      ],
      [
        ['How do you manage secrets in microservices?', 'Keep them out of code and images; use a secret manager (Vault, cloud secret stores) or Kubernetes Secrets synced from one (External Secrets/CSI), with least-privilege access, rotation, short-lived credentials and audit, and never expose them via logs or actuator.'],
        ['What is mTLS and why use it between services?', 'Mutual TLS makes both sides present certificates, so each service authenticates the other and traffic is encrypted. A service mesh automates certificate issuance and rotation.'],
        ['What are Keycloak realms and clients?', 'A realm is an isolated space of users, roles and clients; a client is an application registered in the realm (SPA with PKCE, confidential backend, or service account) that requests tokens.'],
      ],
    ),
  ]),

  ms(9, 'Distributed Systems', 'Core', [
    topic(
      'ms-cap-consistency',
      'CAP Theorem and Consistency Models',
      [
        blk(`<h3>CAP theorem</h3>
• In a distributed data store you can provide at most two of three: <b>Consistency</b> (every read sees the latest write: linearizability), <b>Availability</b> (every request to a non-failing node gets a response) and <b>Partition tolerance</b> (the system continues despite network partitions). Network partitions <b>will</b> happen, so the real choice during a partition is <b>CP</b> (refuse/err to stay consistent) or <b>AP</b> (answer with possibly stale data).<br>
• Examples: <b>CP</b>: ZooKeeper, etcd, Consul KV, HBase, MongoDB (default majority), relational primary with sync replication. <b>AP</b>: Cassandra, DynamoDB (eventual), Eureka, Couchbase. Without a partition you still trade <b>latency vs consistency</b> (<b>PACELC</b>): E: else (no partition) choose Latency or Consistency.`,
          `        Consistency
           /\\
          /  \\          CP: etcd, ZooKeeper, Consul (reject writes without quorum)
         /____\\         AP: Cassandra, DynamoDB, Eureka (serve possibly stale data)
 Availability  Partition tolerance (not optional in a distributed system)

 During a partition: pick CP (some requests fail) or AP (all succeed, data may diverge, reconcile later)
 Normal operation (PACELC): lower latency (async replication, stale reads) vs stronger consistency (sync replication, slower)`,
        ),
      ],
      [
        blk(`<h3>Consistency models</h3>
<table ${TABLE}>
<tr><th>Model</th><th>Guarantee</th><th>Example / cost</th></tr>
<tr><td><b>Strong / linearizable</b></td><td>Operations appear to happen atomically in real-time order; reads see the latest write</td><td>Single-leader DB with sync reads, Spanner, etcd: higher latency</td></tr>
<tr><td><b>Sequential</b></td><td>All see operations in one agreed order (not necessarily real time)</td><td>ZooKeeper</td></tr>
<tr><td><b>Causal</b></td><td>Causally related operations are seen in order by everyone</td><td>MongoDB causal sessions, social comments after posts</td></tr>
<tr><td><b>Read-your-writes</b></td><td>A client sees its own updates</td><td>Route reads to the primary after a write</td></tr>
<tr><td><b>Monotonic reads</b></td><td>No going back in time on repeated reads</td><td>Sticky replica sessions</td></tr>
<tr><td><b>Eventual</b></td><td>Replicas converge if updates stop</td><td>Cassandra, DNS, read replicas: highest availability</td></tr>
</table>
• Choose <b>per use case</b>: balances/inventory need strong consistency (or compensation); likes counts, feeds and search tolerate eventual. Mixed systems: strong for the write path (single leader), eventual for read replicas/caches/projections.`),
      ],
      [
        blk(`<h3>Designing for eventual consistency</h3>
• <b>Techniques</b>: version numbers/vector clocks to detect conflicts, <b>CRDTs</b> (conflict-free replicated data types: counters, sets), <b>last-write-wins</b> (with the risk of lost updates), <b>read repair</b>, <b>anti-entropy</b>, <b>quorum reads/writes</b> (<code>R + W &gt; N</code> gives strong consistency in quorum systems), <b>idempotent</b> and <b>commutative</b> operations, <b>compensation</b> for business invariants.<br>
• <b>UX</b>: show pending states, avoid showing contradictory data, give feedback when convergence completes, and place consistency boundaries within a single aggregate/service.<br>
• In Spring: DB isolation + optimistic locking within a service; sagas/outbox across services; cache TTLs and invalidation events for caches; read replicas with awareness of replication lag.`,
          `// Quorum: N=3 replicas, W=2 writes, R=2 reads  ->  R + W > N  -> a read always overlaps the latest write (strong per key)
// Cassandra: CONSISTENCY QUORUM for both reads and writes

// Read-your-writes with a replica lag guard
@Transactional(readOnly = true)
public CourseView get(UUID id, Optional<Long> minVersion) {
    CourseView v = replicaRepo.view(id);
    if (minVersion.isPresent() && v.version() < minVersion.get()) return primaryRepo.view(id);      // replica not caught up: read the primary
    return v;
}
// the write response carries the new version; the client sends it back as If-Match / X-Min-Version`,
        ),
      ],
      [
        ['What does the CAP theorem say?', 'During a network partition a distributed system must choose between consistency (stale or failed requests are rejected) and availability (every request answered, possibly with stale data); partition tolerance is unavoidable.'],
        ['What is eventual consistency?', 'A model where replicas may differ temporarily but converge to the same value if no new updates arrive; it favours availability and latency.'],
        ['When is strong consistency required?', 'For invariants such as account balances, inventory counts and uniqueness constraints, where stale or conflicting data causes incorrect business outcomes; other data can be eventually consistent.'],
      ],
    ),
    topic(
      'ms-locking-idempotent-consumers',
      'Distributed Locking, Idempotent Consumers, Duplicate Messages and Event Ordering',
      [
        blk(`<h3>Distributed locking</h3>
• A <b>distributed lock</b> gives mutual exclusion across instances (only one instance runs a job, updates a shared resource). Implementations: <b>database</b> (row lock <code>SELECT ... FOR UPDATE</code>, advisory locks, unique-row "lock table"), <b>Redis</b> (<code>SET key value NX PX ttl</code>; Redisson <code>RLock</code>; <b>Redlock</b> is debated), <b>ZooKeeper/etcd/Consul</b> (ephemeral nodes/leases: stronger), <b>ShedLock</b> for scheduled jobs (DB/Redis-backed).<br>
• Pitfalls: locks <b>must expire</b> (TTL) or a crashed holder blocks everyone; a paused holder (GC, network) can <b>resume after expiry</b> and corrupt data: use <b>fencing tokens</b> (monotonic token checked by the resource); clocks and timeouts; lock granularity; <b>prefer lock-free designs</b> (optimistic concurrency, partitioning work by key so one consumer owns a key, idempotent operations).`,
          `// ShedLock: run a scheduled job on one instance at a time
@Scheduled(cron = "0 0 * * * *")
@SchedulerLock(name = "hourlyDigest", lockAtMostFor = "PT10M", lockAtLeastFor = "PT1M")
void hourlyDigest() { digestService.run(); }

// Redis lock with TTL (Redisson)
RLock lock = redisson.getLock("certificate:" + userId);
if (lock.tryLock(2, 30, TimeUnit.SECONDS)) {                    // wait up to 2s, auto-release after 30s
    try { certificateService.generate(userId); } finally { if (lock.isHeldByCurrentThread()) lock.unlock(); }
}

// Fencing token: the resource rejects stale lock holders
long token = lockService.acquire("report");                     // monotonically increasing number
storage.write(path, data, token);                               // storage refuses writes with a token lower than the highest seen

// Best: avoid the lock. Optimistic concurrency instead:
// update course set seats = seats - 1, version = version + 1 where id = ? and version = ? and seats > 0`,
        ),
      ],
      [
        blk(`<h3>Idempotent consumers and duplicate message handling</h3>
• Brokers are <b>at-least-once</b>: duplicates happen (producer retries, consumer crash after processing before commit, rebalances). A consumer must produce the <b>same outcome</b> when it processes the same message twice.<br>
• Techniques: (1) <b>naturally idempotent writes</b> (upsert, set status to X); (2) <b>inbox table</b>: insert the <b>message id</b> (unique) in the same transaction as the business change; if the insert violates uniqueness, skip; (3) <b>conditional updates</b> with versions (<code>where version = ?</code>); (4) <b>deduplication window</b> in a cache (Redis <code>SETNX</code> with TTL) when strict storage is overkill; (5) <b>idempotency keys</b> in downstream APIs; (6) <b>producer idempotence</b> (<code>enable.idempotence=true</code>) removes producer-side duplicates inside Kafka. Commit offsets <b>after</b> processing.`,
          `@Component
class EnrollmentEventsConsumer {
    @KafkaListener(topics = "payments.events", groupId = "learning")
    @Transactional
    void on(EventEnvelope<PaymentCompleted> msg) {
        try {
            inbox.save(new InboxRecord(msg.eventId(), Instant.now()));                // PRIMARY KEY (event_id): duplicate -> exception
        } catch (DataIntegrityViolationException duplicate) {
            log.debug("already processed {}", msg.eventId());
            return;                                                                 // ack and skip
        }
        enrollmentService.activate(msg.payload().orderId());                          // business change in the SAME transaction as the inbox row
    }
}
-- CREATE TABLE inbox (event_id UUID PRIMARY KEY, received_at TIMESTAMP NOT NULL);
-- cleanup: DELETE FROM inbox WHERE received_at < now() - interval '14 days';

// naturally idempotent alternative
@Modifying @Query("update Enrollment e set e.status = 'ACTIVE' where e.orderId = :o and e.status = 'PENDING'")
int activate(UUID o);                                                              // running twice changes nothing the second time`,
        ),
      ],
      [
        blk(`<h3>Event ordering</h3>
• Kafka guarantees order <b>within a partition</b> only: use a <b>key</b> (entity id) so all events of an entity land in one partition and are processed in order by one consumer. Across keys/partitions there is no global order. RabbitMQ preserves order per queue but concurrent consumers and redelivery can reorder.<br>
• Handle out-of-order and late events: include a <b>sequence number/version</b> and <b>timestamp</b> in events; ignore stale events (<code>if event.version &lt;= current.version skip</code>); buffer and reorder where necessary; design events so they are <b>commutative</b> or carry full state (event-carried state transfer).<br>
• <b>Retries and ordering</b>: a retry topic can reorder messages (a failed message is retried later while newer ones pass): decide if per-key order matters; for strict ordering block the partition (stop-on-error) with a DLT fallback and alerts.`,
          `// Producer: key = aggregate id -> same partition -> ordered
kafka.send("enrollments.events", enrollment.id().toString(), event);

// Consumer: ignore stale events
@KafkaListener(topics = "catalogue.events", groupId = "search")
void on(CourseUpdated e) {
    searchIndex.upsertIfNewer(e.courseId(), e.version(), e.toDocument());      // Elasticsearch external versioning: version_type=external
}
// PUT /courses/{id}/_doc/{courseId}?version=12&version_type=external   -> rejects version <= stored

// Do not rely on timestamps across machines to order events (clock skew); prefer per-aggregate version numbers`,
        ),
      ],
      [
        ['How do you prevent duplicate message processing?', 'Make consumers idempotent: record processed message ids in an inbox table within the same transaction, use naturally idempotent upserts or conditional updates, and commit offsets after processing.'],
        ['Why are distributed locks risky?', 'Locks can expire while the holder is paused and resume, causing two owners; use TTLs, fencing tokens and prefer lock-free designs (optimistic concurrency, partitioning by key, idempotency).'],
        ['How do you preserve event order in Kafka?', 'Use the entity id as the message key so all its events go to the same partition, consumed sequentially by one consumer; add versions to detect stale or out-of-order events.'],
      ],
    ),
    topic(
      'ms-clocks-leader-splitbrain',
      'Clock Synchronization, Leader Election and Split-Brain Problems',
      [
        blk(`<h3>Clocks in distributed systems</h3>
• Machine clocks <b>drift</b> and differ (NTP keeps them within milliseconds, but can jump). So <b>wall-clock timestamps cannot reliably order events</b> across machines, and "the latest timestamp wins" can silently lose data.<br>
• Tools: <b>logical clocks</b> (<b>Lamport timestamps</b>: a counter that gives a consistent order consistent with causality), <b>vector clocks</b> (detect concurrent/conflicting updates), <b>hybrid logical clocks</b> (HLC: physical time + logical counter, used by CockroachDB), <b>TrueTime</b> (Spanner: bounded clock uncertainty), per-aggregate <b>version numbers</b>, DB sequences, monotonic clocks for measuring durations (<code>System.nanoTime</code>), UTC <code>Instant</code> everywhere and NTP monitoring.<br>
• Rule: use timestamps for <b>display and TTLs</b>, not for <b>ordering or correctness</b>; use versions/sequences for that.`,
          `// Lamport clock
class LamportClock {
    private final AtomicLong time = new AtomicLong();
    long tick() { return time.incrementAndGet(); }                            // local event / send
    long receive(long remote) { return time.updateAndGet(t -> Math.max(t, remote) + 1); }   // on message receipt
}

// Measure durations with a monotonic clock, not wall-clock time
long t0 = System.nanoTime(); work(); Duration elapsed = Duration.ofNanos(System.nanoTime() - t0);

// WRONG for ordering: two servers, clock skew of 300 ms
if (event.timestamp().isAfter(stored.timestamp())) overwrite();               // may drop a newer update
// RIGHT: if (event.version() > stored.version()) overwrite();`,
        ),
      ],
      [
        blk(`<h3>Leader election</h3>
• Some tasks need exactly <b>one leader</b>: a scheduler, a partition owner, a primary database, a cache refresher. <b>Leader election</b> picks one node and re-elects when it fails. Algorithms: <b>Raft</b> and <b>Paxos</b> (consensus), <b>Zab</b> (ZooKeeper); in practice use a <b>coordination service</b>: ZooKeeper/etcd/Consul (sessions/leases/ephemeral keys), Kubernetes <b>Lease</b> objects, Redis with TTL (weaker), or a database lock row with a lease.<br>
• Requirements: <b>lease with TTL</b> and <b>heartbeats</b> (the leader must keep renewing), <b>fencing tokens</b> so a stale ex-leader cannot act, <b>fast failover</b> vs <b>flapping</b> tradeoff, and idempotent leader actions. Spring: <b>Spring Integration LockRegistryLeaderInitiator</b>, <b>Spring Cloud Kubernetes leader election</b>, <b>Spring Cloud Zookeeper/Consul leader</b>, ShedLock for simple jobs.`,
          `// Spring Integration leader election backed by a JDBC lock table
@Bean LockRegistryLeaderInitiator initiator(LockRegistry registry) {
    var i = new LockRegistryLeaderInitiator(registry, new DefaultCandidate("report-job", "reporting"));
    i.setHeartBeatMillis(5_000);
    i.setBusyWaitMillis(1_000);
    return i;
}
@Component class Elected {
    @EventListener void granted(OnGrantedEvent e)  { scheduler.start(); log.info("became leader"); }
    @EventListener void revoked(OnRevokedEvent e)  { scheduler.stop();  log.warn("lost leadership"); }
}

# Kubernetes Lease-based election
# kubectl get lease -n jsl   -> holderIdentity = pod-a, renewTime ...`,
        ),
      ],
      [
        blk(`<h3>Split-brain problems</h3>
• <b>Split-brain</b>: after a network partition two groups of nodes each believe they are the <b>leader/primary</b>, accept writes and diverge (double processing, conflicting data, duplicate cron jobs, two primaries in a database cluster).<br>
• <b>Prevention</b>: <b>quorum</b>/majority decisions (a leader needs more than half the votes: with 2 partitions at most one side has a majority: use an <b>odd number</b> of nodes, 3 or 5), <b>fencing</b> (STONITH: shoot the other node; fence tokens at the resource; revoke leases), <b>leases with expiry</b> (a leader stops acting when it cannot renew), <b>witness/arbiter</b> nodes, avoiding two-node clusters, health checks via a majority view, and designing for <b>idempotent/mergeable</b> operations (CRDTs) when AP is chosen.<br>
• <b>Detection and recovery</b>: monitor divergence, run reconciliation/repair jobs, document manual runbooks.<br>
• Related: Eureka's self-preservation and Redis Sentinel/Cluster failover behaviours are split-brain trade-offs: know your tools' guarantees.`,
          `3-node cluster, partition isolates node A from B and C:
   [A]   |   [B] [C]
   A: minority (1 of 3) -> cannot be leader, becomes read-only / stops
   B+C: majority (2 of 3) -> elect a new leader, continue
 => at most ONE side can make progress (no split-brain). With 2 nodes no side has a majority after a partition => do not run 2-node clusters.

# Kafka: min.insync.replicas=2, replication.factor=3, acks=all  -> a partitioned leader without 2 in-sync replicas rejects writes (CP behaviour for durability)
# PostgreSQL HA: Patroni with etcd (consensus) prevents two primaries; use fencing/watchdog on the old primary`,
        ),
      ],
      [
        ['Why can\'t timestamps be used to order events across services?', 'Clocks drift and can jump, so wall-clock times from different machines are not reliably comparable; use per-aggregate versions, sequences or logical/hybrid clocks for ordering.'],
        ['What is split-brain and how do you prevent it?', 'A partition leaves two nodes or groups both acting as leader, accepting conflicting writes. Prevent with quorum/majority elections (odd cluster sizes), leases, fencing tokens and avoiding two-node clusters.'],
        ['How is leader election typically implemented?', 'With a consensus-backed coordination service (ZooKeeper, etcd, Consul, Kubernetes Leases) using leases/ephemeral keys and heartbeats, plus fencing tokens so a stale leader cannot act.'],
      ],
    ),
  ]),

  ms(10, 'Observability and Monitoring', 'Essential', [
    topic(
      'ms-logging-elk-correlation',
      'Centralized Logging, ELK Stack and Correlation IDs',
      [
        blk(`<h3>Centralized logging</h3>
• With many instances that appear and disappear, reading log files on servers is impossible. <b>Centralised logging</b> ships all logs to one searchable store. Containers log to <b>stdout/stderr</b>; a node agent (<b>Fluent Bit</b>/Filebeat/Vector/Promtail) collects and forwards to a backend: <b>Elasticsearch/OpenSearch</b> (ELK/EFK) or <b>Grafana Loki</b> (cheaper, label-indexed).<br>
• Log as <b>structured JSON</b> with fields: timestamp, level, service, version, environment, <b>traceId/spanId</b>, <b>correlation id</b>, user id (not PII), logger, message, exception. Consistent field names (ECS/OpenTelemetry semantic conventions) make cross-service queries possible. Set <b>retention</b> and <b>sampling</b>; protect PII.`,
          `# Spring Boot 3.4 structured logging
logging.structured.format.console: ecs                  # or logstash / gelf
logging.structured.ecs.service.name: catalogue-service
logging.level.com.javaschoollab: INFO

# example log line (ECS JSON)
# {"@timestamp":"2026-10-20T10:15:30.123Z","log.level":"ERROR","service.name":"catalogue-service","trace.id":"4bf92f3577b34da6a3ce929d0e0e4736",
#  "span.id":"00f067aa0ba902b7","message":"Course 42 not found","error.type":"CourseNotFoundException"}

# Logback JSON for older versions: logstash-logback-encoder
# <encoder class="net.logstash.logback.encoder.LogstashEncoder"><customFields>{"service":"catalogue-service"}</customFields></encoder>`,
        ),
      ],
      [
        blk(`<h3>The ELK stack</h3>
• <b>Elasticsearch</b> (store + search), <b>Logstash</b> (pipeline: parse/enrich; often replaced by Beats/Fluent Bit + ingest pipelines), <b>Kibana</b> (search UI, dashboards, alerts); <b>Beats/Elastic Agent</b> collect. EFK = Fluentd/Fluent Bit instead of Logstash. Flow: <b>app (stdout JSON) → Fluent Bit DaemonSet → (Kafka buffer optional) → Elasticsearch → Kibana</b>.<br>
• Operate carefully: <b>index templates and ILM</b> (rollover daily/size, hot-warm-cold, delete after N days), shard sizing, mapping explosions (do not index unbounded field names), a buffer (Kafka) to absorb bursts, security (TLS, authN, RBAC), and cost control (drop DEBUG, sample, shorter retention). <b>Loki</b> indexes only labels (service, level) and stores log lines compressed: great with Grafana and much cheaper.`,
          `# Fluent Bit (Kubernetes DaemonSet) -> Elasticsearch
[INPUT]
    Name tail
    Path /var/log/containers/*.log
    Parser docker
    Tag kube.*
[FILTER]
    Name kubernetes
    Match kube.*
    Merge_Log On              # parse the app's JSON line into fields
[OUTPUT]
    Name es
    Match kube.*
    Host elasticsearch
    Logstash_Format On
    Logstash_Prefix jsl-logs

# Kibana (KQL): follow one request across services
# trace.id: "4bf92f3577b34da6a3ce929d0e0e4736" and log.level: ("ERROR" or "WARN")

# ILM policy: rollover at 30 GB or 1 day, delete after 14 days
# PUT _ilm/policy/jsl-logs {"policy":{"phases":{"hot":{"actions":{"rollover":{"max_size":"30gb","max_age":"1d"}}},"delete":{"min_age":"14d","actions":{"delete":{}}}}}}`,
        ),
      ],
      [
        blk(`<h3>Correlation IDs</h3>
• A <b>correlation id</b> (request id) is generated at the edge (gateway) for each incoming request (or taken from <code>X-Correlation-Id</code>/<code>traceparent</code>), <b>propagated</b> on every outgoing HTTP call and message header, and <b>added to every log line</b> (MDC). Searching one id shows the whole journey across services: indispensable for troubleshooting. <b>Distributed tracing</b> (<code>traceparent</code> W3C header with trace id/span id) supersedes and automates this; keep a business correlation id (order id) as an extra field.<br>
• Implementation: gateway/servlet filter sets MDC; <b>Micrometer Tracing</b> does it automatically for traces and propagates through <code>RestClient</code>, <code>WebClient</code>, Feign, Kafka and <code>@Async</code> (with context propagation). Return the id in <b>error responses</b> so users/support can quote it; clear MDC after requests (thread reuse).`,
          `@Component @Order(Ordered.HIGHEST_PRECEDENCE)
class CorrelationFilter extends OncePerRequestFilter {
    static final String HEADER = "X-Correlation-Id";
    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        String id = Optional.ofNullable(req.getHeader(HEADER)).filter(s -> !s.isBlank()).orElse(UUID.randomUUID().toString());
        MDC.put("correlationId", id);
        res.setHeader(HEADER, id);
        try { chain.doFilter(req, res); } finally { MDC.remove("correlationId"); }          // thread pools reuse threads!
    }
}

// forward on outgoing calls
@Bean RestClient.Builder restClientBuilder() {
    return RestClient.builder().requestInterceptor((req, body, ex) -> { Optional.ofNullable(MDC.get("correlationId")).ifPresent(id -> req.getHeaders().set("X-Correlation-Id", id)); return ex.execute(req, body); });
}

// Micrometer Tracing makes traceId/spanId available in MDC automatically (logging.pattern.level=%5p [%X{traceId:-},%X{spanId:-}])`,
        ),
      ],
      [
        ['Why is centralised logging necessary in microservices?', 'Instances are ephemeral and numerous, so logs must be shipped from stdout to a central searchable store (ELK, Loki) with structured fields and trace ids to troubleshoot across services.'],
        ['What is a correlation id?', 'A unique id attached to a request at the edge and propagated through all services and log lines, so you can find every log entry and call belonging to one user request. Distributed tracing formalises this with trace and span ids.'],
        ['What are the main ELK components?', 'Elasticsearch stores and searches logs, Logstash (or Beats/Fluent Bit) collects and transforms them, and Kibana visualises, searches and alerts; Loki with Grafana is a lighter alternative.'],
      ],
    ),
    topic(
      'ms-metrics-prometheus-grafana-micrometer',
      'Metrics: Micrometer, Prometheus and Grafana',
      [
        blk(`<h3>Micrometer and Actuator metrics</h3>
• <b>Micrometer</b> is the vendor-neutral metrics facade (like SLF4J for metrics) built into Spring Boot Actuator. It exposes JVM, HTTP server/client, datasource pool (Hikari), Kafka, cache, Resilience4j and custom metrics, and exports to <b>Prometheus</b>, Datadog, New Relic, CloudWatch, etc. Add <code>micrometer-registry-prometheus</code> and expose <code>/actuator/prometheus</code>.<br>
• Meter types: <b>Counter</b> (only goes up: requests, errors), <b>Gauge</b> (current value: queue size, active sessions), <b>Timer</b> (duration + count + percentiles: latency), <b>DistributionSummary</b> (sizes), <b>LongTaskTimer</b>. Use <b>tags</b> (dimensions) with <b>bounded cardinality</b>: never put user ids or raw URLs in tags (cardinality explosion).`,
          `management:
  endpoints.web.exposure.include: health,info,prometheus,metrics
  metrics:
    tags: { application: \${spring.application.name}, environment: \${ENV:dev} }       # common tags on every metric
    distribution:
      percentiles-histogram.http.server.requests: true                                  # enables histogram buckets for p95/p99 in Prometheus
      slo.http.server.requests: 100ms,300ms,1s

@Service
class EnrollmentMetrics {
    private final Counter enrolled; private final Timer certificateTime;
    EnrollmentMetrics(MeterRegistry registry, EnrollmentRepository repo) {
        this.enrolled = Counter.builder("jsl.enrollments").description("Completed enrollments").tag("channel", "web").register(registry);
        this.certificateTime = Timer.builder("jsl.certificate.generation").publishPercentileHistogram().register(registry);
        Gauge.builder("jsl.enrollments.pending", repo, EnrollmentRepository::countPending).register(registry);
    }
    void onEnrolled() { enrolled.increment(); }
    <T> T timeCertificate(Supplier<T> s) { return certificateTime.record(s); }
}
// built-in: http_server_requests_seconds, jvm_memory_used_bytes, hikaricp_connections_active, kafka_consumer_*, resilience4j_*`,
        ),
      ],
      [
        blk(`<h3>Prometheus</h3>
• <b>Prometheus</b> is a time-series database that <b>scrapes</b> (pulls) <code>/metrics</code> endpoints at an interval, stores samples with labels, and answers <b>PromQL</b> queries; <b>Alertmanager</b> routes alerts (Slack, PagerDuty, e-mail). On Kubernetes use the <b>Prometheus Operator</b> (<code>kube-prometheus-stack</code>) with <b>ServiceMonitor</b>/<b>PodMonitor</b> objects for discovery.<br>
• PromQL essentials: <code>rate(counter[5m])</code> (per-second rate), <code>histogram_quantile(0.95, sum by (le) (rate(..._bucket[5m])))</code> (p95 latency), <code>sum by (service) (...)</code>, ratios for error rate. Monitor the <b>four golden signals</b>: <b>latency</b>, <b>traffic</b>, <b>errors</b>, <b>saturation</b> (and RED for services: Rate, Errors, Duration; USE for resources: Utilisation, Saturation, Errors).`,
          `# ServiceMonitor: Prometheus scrapes every pod of the service
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata: { name: catalogue }
spec:
  selector: { matchLabels: { app: catalogue } }
  endpoints: [ { port: http, path: /actuator/prometheus, interval: 15s } ]

# PromQL
# Request rate per service:       sum by (application) (rate(http_server_requests_seconds_count[5m]))
# Error ratio (5xx):               sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m])) / sum(rate(http_server_requests_seconds_count[5m]))
# p95 latency:                     histogram_quantile(0.95, sum by (le, uri) (rate(http_server_requests_seconds_bucket{application="catalogue-service"}[5m])))
# Hikari saturation:               hikaricp_connections_active / hikaricp_connections_max
# JVM heap used %:                 jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"}`,
        ),
      ],
      [
        blk(`<h3>Grafana dashboards and alerting</h3>
• <b>Grafana</b> visualises Prometheus (and Loki, Tempo, Elasticsearch, etc.): dashboards per service (RED + JVM + DB pool + Kafka lag + circuit breakers), a service overview, and an SLO dashboard. Provision dashboards as code (JSON/Grafonnet in Git). Use the community JVM (Micrometer) and Spring Boot dashboards as a start.<br>
• <b>Alerting</b>: alert on <b>symptoms users feel</b> (error ratio, latency SLO burn, availability), not on every cause (CPU at 80%); give each alert an owner, severity, <b>runbook link</b> and a <code>for:</code> duration to avoid flapping; page only for urgent, actionable issues; route the rest to tickets/Slack. <b>SLOs/error budgets</b>: define targets (99.9% of requests under 500 ms), alert on burn rate (multi-window).<br>
• Avoid alert fatigue: review noisy alerts, deduplicate in Alertmanager (grouping, inhibition, silences).`,
          `# Prometheus alert rules
groups:
- name: catalogue
  rules:
  - alert: HighErrorRate
    expr: sum(rate(http_server_requests_seconds_count{application="catalogue-service",status=~"5.."}[5m])) / sum(rate(http_server_requests_seconds_count{application="catalogue-service"}[5m])) > 0.05
    for: 5m
    labels: { severity: page }
    annotations: { summary: "catalogue-service 5xx > 5% for 5m", runbook: "https://wiki/runbooks/catalogue-5xx" }
  - alert: SlowP95
    expr: histogram_quantile(0.95, sum by (le) (rate(http_server_requests_seconds_bucket{application="catalogue-service"}[5m]))) > 1
    for: 10m
    labels: { severity: warn }
  - alert: ConsumerLagGrowing
    expr: sum(kafka_consumergroup_lag{group="learning"}) > 10000
    for: 10m
    labels: { severity: warn }
  - alert: PodCrashLooping
    expr: increase(kube_pod_container_status_restarts_total{namespace="jsl"}[15m]) > 3`,
        ),
      ],
      [
        ['What are the four golden signals?', 'Latency, traffic, errors and saturation: the key indicators of a service\'s health. RED (rate, errors, duration) is the service-focused subset.'],
        ['What does Micrometer do?', 'It is a vendor-neutral metrics facade in Spring Boot that records counters, gauges, timers and summaries and exports them to Prometheus, Datadog and other systems.'],
        ['What should you alert on?', 'User-visible symptoms such as error rate, latency and availability against SLOs, each with an owner and runbook, rather than every internal cause like moderate CPU usage, to avoid alert fatigue.'],
      ],
    ),
    topic(
      'ms-tracing-otel-zipkin-jaeger',
      'Distributed Tracing: OpenTelemetry, Zipkin, Jaeger and Micrometer Tracing',
      [
        blk(`<h3>Distributed tracing concepts</h3>
• A <b>trace</b> follows one request across services; it is made of <b>spans</b>: a span = one operation (an HTTP handler, a DB query, a Kafka publish/consume) with start/end time, attributes (tags), events and a <b>parent span id</b>. All spans of a request share a <b>trace id</b>. Context is propagated in headers: <b>W3C Trace Context</b> <code>traceparent: 00-&lt;traceId&gt;-&lt;spanId&gt;-01</code> (B3 for Zipkin legacy).<br>
• Tracing answers: <b>where was the time spent?</b>, <b>which downstream call failed?</b>, <b>what is the dependency graph?</b>. Metrics tell you <i>that</i> something is slow; traces show <i>where</i>; logs show <i>why</i> (correlated by trace id).<br>
• <b>Sampling</b>: tracing every request is expensive. <b>Head sampling</b> (decide at the start: e.g. 10%) is cheap; <b>tail sampling</b> (decide after seeing the whole trace: keep errors and slow ones) in the OpenTelemetry Collector is smarter.`,
          `trace 4bf92f35...  total 480 ms
 |- gateway               GET /api/learning/progress               [0 ms ....................... 480 ms]
 |   '- learning-service   GET /progress                           [12 ms ................... 470 ms]
 |       |- postgres        SELECT progress ...                    [20 ms .. 60 ms]
 |       '- catalogue-service  GET /courses?ids=...                 [70 ms ............. 440 ms]   <- slow
 |           '- postgres    SELECT course ...                      [80 ms ....... 420 ms]            <- the real culprit: slow query`,
        ),
      ],
      [
        blk(`<h3>OpenTelemetry and Micrometer Tracing in Spring Boot 3</h3>
• <b>OpenTelemetry (OTel)</b> is the CNCF standard for traces, metrics and logs: APIs/SDKs, the <b>OTLP</b> protocol, <b>auto-instrumentation agent</b> (Java agent: <code>-javaagent:opentelemetry-javaagent.jar</code> instruments HTTP, JDBC, Kafka... with no code changes) and the <b>OpenTelemetry Collector</b> (receive, process, sample, export to Jaeger/Tempo/Zipkin/Datadog).<br>
• <b>Spring Boot 3</b> uses <b>Micrometer Tracing</b> (replaced Spring Cloud Sleuth) with a bridge to OpenTelemetry: add <code>micrometer-tracing-bridge-otel</code> + <code>opentelemetry-exporter-otlp</code> (or <code>spring-boot-starter-opentelemetry</code> in newer versions), enable observation of HTTP, RestClient, WebClient, Feign, Kafka (<code>spring.kafka.template.observation-enabled=true</code>) and JDBC (datasource-micrometer). Set sampling and the OTLP endpoint.`,
          `<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-actuator</artifactId></dependency>
<dependency><groupId>io.micrometer</groupId><artifactId>micrometer-tracing-bridge-otel</artifactId></dependency>
<dependency><groupId>io.opentelemetry</groupId><artifactId>opentelemetry-exporter-otlp</artifactId></dependency>

management:
  tracing:
    sampling.probability: 0.1                      # 10% head sampling (use 1.0 in dev)
  otlp.tracing.endpoint: http://otel-collector:4318/v1/traces
spring:
  application.name: catalogue-service
  kafka.template.observation-enabled: true         # propagate trace context through Kafka headers
  kafka.listener.observation-enabled: true
logging.pattern.level: "%5p [\${spring.application.name:},%X{traceId:-},%X{spanId:-}]"

// custom span for a business operation
@Service
class CertificateService {
    private final ObservationRegistry registry;
    byte[] generate(UUID id) {
        return Observation.createNotStarted("certificate.generate", registry).lowCardinalityKeyValue("type", "pdf").observe(() -> render(id));
    }
}`,
        ),
      ],
      [
        blk(`<h3>Zipkin, Jaeger and the Collector pipeline</h3>
• <b>Zipkin</b> and <b>Jaeger</b> are tracing backends with UIs: search by trace id/service/duration/tag, view waterfall timelines and the <b>service dependency graph</b>; Jaeger (CNCF) supports OTLP natively, adaptive sampling, and Elasticsearch/Cassandra/OpenSearch storage; Zipkin is simple and light. <b>Grafana Tempo</b> stores traces cheaply (object storage) and links to logs (Loki) and metrics (<b>exemplars</b>).<br>
• Typical pipeline: <b>services → OTLP → OpenTelemetry Collector (batch, tail-sample, enrich with k8s metadata) → Jaeger/Tempo</b>; logs carry <code>traceId</code> so Grafana can jump from a log line to the trace.<br>
• Practices: propagate context through <b>async boundaries</b> (messaging headers, <code>@Async</code> with <code>ContextPropagatingTaskDecorator</code>, virtual threads), put the <b>trace id in error responses and logs</b>, keep attribute cardinality low, never put PII in spans.`,
          `# docker-compose (local)
# services:
#   otel-collector: { image: otel/opentelemetry-collector-contrib, command: ["--config=/etc/otel.yaml"], volumes: ["./otel.yaml:/etc/otel.yaml"], ports: ["4318:4318"] }
#   jaeger:         { image: jaegertracing/all-in-one, ports: ["16686:16686", "4317:4317"] }

# otel.yaml: receive OTLP, keep errors and slow traces, export to Jaeger
receivers: { otlp: { protocols: { http: {} } } }
processors:
  batch: {}
  tail_sampling:
    decision_wait: 10s
    policies:
      - { name: errors, type: status_code, status_code: { status_codes: [ERROR] } }
      - { name: slow, type: latency, latency: { threshold_ms: 500 } }
      - { name: sample-the-rest, type: probabilistic, probabilistic: { sampling_percentage: 5 } }
exporters: { otlp/jaeger: { endpoint: jaeger:4317, tls: { insecure: true } } }
service: { pipelines: { traces: { receivers: [otlp], processors: [tail_sampling, batch], exporters: [otlp/jaeger] } } }`,
        ),
      ],
      [
        ['How do you trace requests across microservices?', 'Instrument services with OpenTelemetry/Micrometer Tracing so each hop creates spans sharing a trace id propagated via W3C traceparent headers (including messaging headers), export to a backend such as Jaeger/Tempo/Zipkin and correlate logs with the trace id.'],
        ['What are traces and spans?', 'A trace represents one request end to end; it is composed of spans, each a timed operation with attributes and a parent span, forming a tree across services.'],
        ['What is tail sampling?', 'Deciding which traces to keep after they complete (for example errors and slow requests) in the OpenTelemetry Collector, unlike head sampling which decides at the start and may drop the interesting traces.'],
      ],
    ),
    topic(
      'ms-actuator-health-alerting',
      'Health Checks, Spring Boot Actuator and Alerting & Dashboards',
      [
        blk(`<h3>Spring Boot Actuator</h3>
• <b>Actuator</b> adds production-ready endpoints: <code>/actuator/health</code> (liveness/readiness, details), <code>info</code>, <code>metrics</code>, <code>prometheus</code>, <code>loggers</code> (change log levels at runtime), <code>env</code>/<code>configprops</code> (mask secrets), <code>threaddump</code>, <code>heapdump</code>, <code>httpexchanges</code>, <code>scheduledtasks</code>, <code>caches</code>, <code>flyway</code>, <code>circuitbreakers</code>. Only <b>health</b>, <b>info</b> and <b>prometheus</b> should be exposed over the network; <b>secure everything else</b> (separate management port, authentication, network policy).<br>
• <b>Health groups</b> for Kubernetes: <code>management.endpoint.health.probes.enabled=true</code> gives <code>/actuator/health/liveness</code> (is the process alive? restart if not) and <code>/readiness</code> (can it take traffic? remove from the Service if not). Include only what each probe should depend on.`,
          `management:
  server.port: 9090                                      # separate management port, not exposed by the Ingress
  endpoints.web.exposure.include: health,info,prometheus,loggers
  endpoint:
    health:
      probes.enabled: true
      show-details: when-authorized
      group:
        liveness:  { include: livenessState }                         # JVM/app state only: do NOT include the database
        readiness: { include: readinessState,db,diskSpace }           # ready only when the database is reachable
    env.show-values: never
  info.env.enabled: true
info.app: { name: catalogue-service, version: "@project.version@" }

@Component
class KafkaHealth implements HealthIndicator {
    public Health health() { return broker.isReachable() ? Health.up().withDetail("brokers", 3).build() : Health.down().withDetail("reason", "no broker").build(); }
}

# change a log level at runtime without a restart
# curl -X POST localhost:9090/actuator/loggers/com.javaschoollab -H 'Content-Type: application/json' -d '{"configuredLevel":"DEBUG"}'`,
        ),
      ],
      [
        blk(`<h3>Health check design</h3>
• <b>Liveness vs readiness vs startup</b>: <b>liveness</b> = "is it stuck? restart me" (must not depend on external services: a database outage must not restart every pod); <b>readiness</b> = "send me traffic?" (can include required dependencies; fail temporarily during startup, warm-up, overload or shutdown); <b>startup</b> probe for slow starts.<br>
• Deep health checks (calling the database on every probe) can amplify outages; use short timeouts, caching of results (<code>management.endpoint.health.cache.time-to-live</code>) and a separate <b>diagnostic</b> endpoint for humans. <b>Graceful shutdown</b>: on SIGTERM readiness turns DOWN first, in-flight requests finish, then exit.<br>
• External monitoring: <b>synthetic checks</b> (probe the public URL/login flow from outside), uptime services, and heartbeat jobs.`,
          `# Kubernetes probes using Actuator
livenessProbe:
  httpGet: { path: /actuator/health/liveness, port: 9090 }
  initialDelaySeconds: 20
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet: { path: /actuator/health/readiness, port: 9090 }
  periodSeconds: 5
  failureThreshold: 3
startupProbe:
  httpGet: { path: /actuator/health/liveness, port: 9090 }
  failureThreshold: 30
  periodSeconds: 5                                        # up to 150 s to start before liveness takes over
lifecycle:
  preStop: { exec: { command: ["sh", "-c", "sleep 10"] } }  # let the load balancer drain
terminationGracePeriodSeconds: 45

# application.yml
server.shutdown: graceful
spring.lifecycle.timeout-per-shutdown-phase: 30s`,
        ),
      ],
      [
        blk(`<h3>Alerting and dashboards in practice</h3>
• Build a <b>layered set of dashboards</b>: (1) <b>business/SLO</b> (enrolments per minute, checkout success rate), (2) <b>service RED</b> (rate, errors, duration), (3) <b>dependencies</b> (DB pool, Kafka lag, circuit breakers, external APIs), (4) <b>infrastructure</b> (CPU, memory, pods, nodes). Link dashboards to <b>logs and traces</b> (Grafana data links, exemplars).<br>
• <b>Alert routing</b>: Alertmanager groups alerts, silences during maintenance, escalates by severity to PagerDuty/Opsgenie/Slack; every page needs a <b>runbook</b> and an owner; after incidents write <b>post-mortems</b> and fix the alert or the system.<br>
• Alert on <b>SLO burn rate</b> (fast: 14.4× over 1 h; slow: 6× over 6 h) to be both quick and quiet; include <b>deadman/heartbeat alerts</b> (alert when metrics stop arriving) and <b>synthetic probes</b> so a dead monitoring pipeline is noticed.`,
          `# Alertmanager routing
route:
  receiver: slack-default
  group_by: [alertname, application]
  group_wait: 30s
  repeat_interval: 4h
  routes:
    - matchers: [ severity = page ]
      receiver: pagerduty
    - matchers: [ severity = warn ]
      receiver: slack-default
inhibit_rules:
  - source_matchers: [ alertname = NodeDown ]
    target_matchers: [ severity = warn ]                    # do not flood with downstream alerts when the node is down
    equal: [ node ]

# SLO burn-rate alert (availability SLO 99.9%)
# expr: (sum(rate(http_server_requests_seconds_count{status=~"5.."}[1h])) / sum(rate(http_server_requests_seconds_count[1h]))) > (14.4 * 0.001)`,
        ),
      ],
      [
        ['Liveness vs readiness probe?', 'Liveness tells Kubernetes whether to restart a stuck container (should not depend on external systems); readiness tells whether it can receive traffic (may depend on required dependencies and is used to add/remove it from the Service).'],
        ['Which Actuator endpoints should be exposed and how do you secure them?', 'Expose only health, info and prometheus (ideally on a separate management port or network), require authentication for the rest, hide secret values and never expose heapdump/env publicly.'],
        ['What makes a good alert?', 'It signals a user-visible symptom or an imminent SLO breach, is actionable, has an owner, severity, runbook and a duration to avoid flapping, and is routed appropriately; noisy or non-actionable alerts should be removed.'],
      ],
    ),
  ]),
];
