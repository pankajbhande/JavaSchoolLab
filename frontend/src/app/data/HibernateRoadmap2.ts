// Hibernate roadmap, part 2: sections 6-11 (caching, performance, transactions and concurrency, advanced Hibernate, Spring Boot, interview questions).
// Examples use Hibernate 6 / Jakarta Persistence 3 with Spring Boot 3. "${...}" placeholders are written "\${...}" in these template literals.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const hb = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('hb', n, title, priority, topics);

export const hibernateRoadmap2: SubTopic[] = [
  hb(6, 'Hibernate Caching', 'Essential', [
    topic(
      'hb-first-level-cache',
      'First-Level Cache (Persistence Context)',
      [
        blk(`<h3>What the first-level cache is</h3>
• The <b>first-level (L1) cache</b> is the <b>persistence context</b> of a Session/EntityManager: always on, <b>per session</b>, not shared, cannot be disabled. It stores every managed entity by <b>(entity type, id)</b>.<br>
• Effects: repeated <code>find(Course.class, 1L)</code> in one transaction run <b>one SELECT</b>; the same Java instance is returned (identity guarantee); queries that return entities first check the cache by id for the returned rows (but a JPQL query itself always hits the database).<br>
• Lifetime = the unit of work. In Spring it is the <code>@Transactional</code> method; each non-transactional repository call gets its own short-lived context.`,
          `@Transactional
public void demo() {
    Course a = em.find(Course.class, 1L);        // select ... from course where id=1
    Course b = em.find(Course.class, 1L);        // served from L1: no SQL
    System.out.println(a == b);                  // true

    List<Course> all = em.createQuery("from Course", Course.class).getResultList();   // SQL runs (queries always hit the DB)
    // ...but the row for id=1 is NOT re-hydrated: the existing managed instance 'a' is returned in the list
}
// Different transactions/sessions never share this cache: a second @Transactional method issues its own SELECT.`,
        ),
      ],
      [
        blk(`<h3>Consequences and pitfalls</h3>
• <b>Stale reads inside a long session</b>: another transaction may change the row, but you keep reading the cached state; use <code>refresh()</code> or shorter transactions, or optimistic locking.<br>
• <b>Memory growth</b> in batch jobs: every loaded entity stays in the context: <code>flush()</code> + <code>clear()</code> periodically, use <code>StatelessSession</code>, or stream with <code>setReadOnly(true)</code>.<br>
• <b>Dirty-checking cost</b>: at flush Hibernate compares every managed entity with its loaded snapshot; thousands of managed entities make commits slow. Use read-only transactions/queries (<code>@Transactional(readOnly = true)</code>, <code>QueryHints.HINT_READONLY</code>) so Hibernate skips snapshots.<br>
• <b>Bulk JPQL/native updates bypass L1</b>: managed entities become stale: <code>clear()</code> or <code>refresh()</code> afterwards (<code>@Modifying(clearAutomatically = true)</code> in Spring Data).`,
          `@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("update Course c set c.price = c.price * 1.1 where c.level = :level")
int raisePrices(@Param("level") Level level);                 // flushes first, runs the bulk update, clears L1

@QueryHints(@QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true"))
List<Course> findAllByLevel(Level level);                      // entities are loaded read-only: no snapshot, no dirty check

Session s = em.unwrap(Session.class);
s.setDefaultReadOnly(true);                                    // everything loaded afterwards is read-only
Course c = em.find(Course.class, 1L);
s.setReadOnly(c, false);                                       // opt a single entity back in`,
        ),
      ],
      [
        blk(`<h3>Inspecting and controlling L1</h3>
• <code>em.contains(entity)</code> (is it managed?), <code>em.detach(entity)</code> (evict one), <code>em.clear()</code> (evict all), <code>em.flush()</code>, <code>em.refresh()</code>; with Hibernate <code>session.evict(entity)</code> (= detach) and <code>session.getStatistics().getEntityCount()</code> (managed entity count).<br>
• Rule of thumb: <b>one request = one transaction = one persistence context</b>; never keep a Session open across requests or in a singleton (a "global" EntityManager grows forever and is not thread-safe). The shared <code>@PersistenceContext</code> proxy is safe because it delegates to the current transaction's context.`,
          `Session s = em.unwrap(Session.class);
System.out.println("managed entities: " + s.getStatistics().getEntityCount());
System.out.println("is managed: " + s.contains(course));

// Anti-pattern: a long-lived EntityManager in a singleton
// @Component class Bad { private final EntityManager em = emf.createEntityManager(); }   // not thread-safe, never cleared`,
        ),
      ],
      [
        ['What is the first-level cache?', 'The persistence context of a Session/EntityManager: a mandatory, per-session cache of managed entities keyed by type and id, giving identity guarantees and avoiding repeated SELECTs for the same entity within a unit of work.'],
        ['Can you disable the first-level cache?', 'No, it is integral to the persistence context. You can limit it with clear()/detach(), StatelessSession (no persistence context) or read-only mode.'],
        ['Why is memory a concern in batch processing with Hibernate?', 'Every entity loaded or persisted stays in the persistence context and is dirty-checked at flush. Flush and clear periodically (or use a StatelessSession) to keep memory and flush time constant.'],
      ],
    ),
    topic(
      'hb-second-level-cache',
      'Second-Level Cache, Query Cache, Providers, Eviction and Configuration',
      [
        blk(`<h3>The second-level (L2) cache</h3>
• The <b>second-level cache</b> is <b>optional</b> and <b>shared across sessions</b> within a <code>SessionFactory</code> (an application instance). Hibernate stores entity state ("dehydrated" column values) by id; a <code>find()</code> miss in L1 checks L2 before the database. Reduces DB reads for <b>read-mostly reference data</b> (countries, categories, courses catalogue).<br>
• Lookup order for <code>find(id)</code>: <b>L1 (session) → L2 (SessionFactory) → database</b>.<br>
• It must be enabled and each entity/collection opted in. Cached state is invalidated automatically when Hibernate changes the entity (but <b>not</b> by external SQL, bulk updates without notification, or other applications writing the table).`,
          `# application.properties (Hibernate 6.x with JCache + Ehcache)
spring.jpa.properties.hibernate.cache.use_second_level_cache=true
spring.jpa.properties.hibernate.cache.use_query_cache=true
spring.jpa.properties.hibernate.cache.region.factory_class=jcache
spring.jpa.properties.hibernate.javax.cache.provider=org.ehcache.jsr107.EhcacheCachingProvider
spring.jpa.properties.hibernate.javax.cache.uri=classpath:ehcache.xml
spring.jpa.properties.jakarta.persistence.sharedCache.mode=ENABLE_SELECTIVE
spring.jpa.properties.hibernate.generate_statistics=true

// Opt entities and collections in
@Entity
@Cacheable
@org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE, region = "courses")
public class Course {
    @OneToMany(mappedBy = "course")
    @org.hibernate.annotations.Cache(usage = CacheConcurrencyStrategy.READ_WRITE)     // caches the collection of IDs
    private Set<Lesson> lessons;
}`,
        ),
      ],
      [
        blk(`<h3>Concurrency strategies and cache providers</h3>
<table ${TABLE}>
<tr><th>Strategy</th><th>Use</th></tr>
<tr><td><code>READ_ONLY</code></td><td>Never-changing data (lookup tables): fastest, no locking</td></tr>
<tr><td><code>NONSTRICT_READ_WRITE</code></td><td>Rarely changing; small window of stale data accepted</td></tr>
<tr><td><code>READ_WRITE</code></td><td>Data that changes; soft locks keep reads consistent (default choice)</td></tr>
<tr><td><code>TRANSACTIONAL</code></td><td>Full transactional caches (JTA)</td></tr>
</table>
• <b>Cache providers</b> (Hibernate integrates through JCache/JSR-107): <b>Ehcache 3</b> (most common), <b>Caffeine</b> (via JCache), <b>Infinispan</b> (clustered), <b>Hazelcast</b> (distributed), <b>Redis</b> via Redisson (distributed, good for multiple app instances). The built-in default is a no-op: you must add a provider.<br>
• In a <b>clustered/microservice deployment</b>, a local L2 cache per instance can serve stale data after another instance writes: use a distributed provider, short TTLs, or cache only truly static data.`,
          `<!-- ehcache.xml (JCache) -->
<config xmlns="http://www.ehcache.org/v3" xmlns:jsr107="http://www.ehcache.org/v3/jsr107">
  <service><jsr107:defaults enable-statistics="true"/></service>
  <cache alias="courses">
    <expiry><ttl unit="minutes">30</ttl></expiry>
    <resources><heap unit="entries">1000</heap></resources>
  </cache>
  <cache alias="default-query-results-region">
    <expiry><ttl unit="minutes">5</ttl></expiry>
    <resources><heap unit="entries">500</heap></resources>
  </cache>
</config>

// Redisson (distributed L2 cache for several service instances)
// hibernate.cache.region.factory_class=org.redisson.hibernate.RedissonRegionFactory
// hibernate.cache.redisson.config=redisson.yaml`,
        ),
      ],
      [
        blk(`<h3>Query cache, eviction, invalidation and monitoring</h3>
• <b>Query cache</b>: caches the <b>result ids</b> of a query (plus parameters) and relies on L2 for entity data. Enable with <code>hibernate.cache.use_query_cache=true</code> and opt in per query: <code>.setHint("org.hibernate.cacheable", true)</code> / Spring <code>@QueryHints</code>. It is invalidated whenever <b>any</b> table in the query is modified (timestamps), so it helps only for queries over <b>rarely changing tables</b>; for frequently written tables it adds overhead.<br>
• <b>Eviction</b>: <code>sessionFactory.getCache().evictEntityData(Course.class, id)</code>, <code>evictAllRegions()</code>, <code>evictQueryRegions()</code>, TTL/size in the provider. <b>Invalidation</b>: automatic on Hibernate-driven writes; for external changes or bulk JPQL updates evict manually or publish an event to evict (clustered setups).<br>
• <b>Monitor hit ratio</b> with <code>Statistics</code>: <code>getSecondLevelCacheHitCount()</code>/<code>MissCount()</code>/<code>PutCount()</code>. A low hit ratio means the cache costs memory for no benefit: remove it. <b>Measure before and after</b>.<br>
• Do not cache: frequently changing entities, large collections, sensitive data, anything with strict freshness needs (balances, inventory).`,
          `@QueryHints(@QueryHint(name = "org.hibernate.cacheable", value = "true"))
@Query("select c from Category c order by c.name")
List<Category> allCategories();                                // result ids cached; entities from the L2 region

@Service
class CacheAdmin {
    @PersistenceUnit private EntityManagerFactory emf;

    void evictCourse(Long id) { emf.getCache().evict(Course.class, id); }
    void evictAll()           { emf.getCache().evictAll(); }                  // JPA standard API

    void report() {
        Statistics st = emf.unwrap(SessionFactory.class).getStatistics();
        long hits = st.getSecondLevelCacheHitCount(), misses = st.getSecondLevelCacheMissCount();
        log.info("L2 hit ratio {}%", hits * 100.0 / Math.max(1, hits + misses));
    }
}

// Entity-level control
@Cache(usage = CacheConcurrencyStrategy.READ_ONLY)            // static reference data
@Entity class Country { /* ... */ }`,
        ),
      ],
      [
        ['First-level vs second-level cache?', 'L1 is the session\'s persistence context: mandatory, per session, not shared. L2 is an optional cache shared by all sessions of a SessionFactory, configured per entity/collection with a provider; lookups go L1, then L2, then the database.'],
        ['What does the query cache store and when does it help?', 'It stores the list of result ids for a query and its parameters (entity data comes from L2). It is invalidated when any table in the query is modified, so it helps only for queries over rarely changing tables.'],
        ['What are the risks of a second-level cache in microservices?', 'Per-instance local caches can serve stale data after another instance writes, and external changes bypass invalidation. Use distributed providers, short TTLs, or cache only static data, and monitor the hit ratio.'],
      ],
    ),
  ]),

  hb(7, 'Hibernate Performance Optimization', 'Essential', [
    topic(
      'hb-n-plus-one-fetch',
      'The N+1 Problem, Fetch Joins, Entity Graphs and Batch Fetching',
      [
        blk(`<h3>What is the N+1 query problem?</h3>
• You run <b>1 query</b> to load N parents, then <b>N more queries</b> (one per parent) to load a lazy association while iterating: <b>N+1</b> round trips. With 1000 courses it means 1001 queries instead of 1 or 2: the most common Hibernate performance bug.<br>
• Causes: lazy collections/proxies accessed in a loop (or in <code>toString</code>/mapper/JSON serialisation), <code>EAGER</code> associations with JPQL (Hibernate loads the parent with your query, then each association with extra selects), Open Session In View hiding it until production.<br>
• <b>Detect</b>: enable SQL logging and look for repeating statements; use <b>Hibernate statistics</b> or a datasource proxy (<code>datasource-proxy</code>, <code>hypersistence-utils</code> <code>SQLStatementCountValidator</code>) to <b>assert query counts in tests</b>.`,
          `List<Course> courses = courseRepository.findAll();            // 1 query: select * from course
for (Course c : courses) {
    System.out.println(c.getTitle() + ": " + c.getLessons().size());   // N queries: select * from lesson where course_id=?
}
// SQL log: 1 + N statements (the same "select ... from lesson where course_id=?" repeated)

// Query-count assertion in an integration test
SQLStatementCountValidator.reset();
service.listCourseSummaries();
SQLStatementCountValidator.assertSelectCount(1);                 // fails the build when someone reintroduces N+1`,
        ),
      ],
      [
        blk(`<h3>Solutions: fetch joins and entity graphs</h3>
• <b><code>join fetch</code></b> loads the association in the same SQL join: <code>select c from Course c join fetch c.category</code> (to-one: safe) or <code>left join fetch c.lessons</code> (collection: duplicates parents, so use <code>distinct</code>; Hibernate 6 de-duplicates automatically).<br>
• <b>Rules</b>: you can fetch join <b>only one collection</b> ("bag") safely per query: two <code>List</code> collections cause <code>MultipleBagFetchException</code> and a <b>Cartesian product</b>; use <code>Set</code>s carefully or split into several queries. <b>Do not combine collection fetch joins with pagination</b>.<br>
• <b><code>@EntityGraph</code></b> (JPA 2.1) declares what to fetch <b>per use case</b> without changing JPQL; Spring Data: <code>@EntityGraph(attributePaths = {"category", "lessons"})</code> on repository methods.`,
          `// fetch join (one query)
@Query("select distinct c from Course c left join fetch c.category left join fetch c.lessons where c.level = :level")
List<Course> findWithDetails(@Param("level") Level level);

// entity graph on a repository method
@EntityGraph(attributePaths = {"category", "instructor"})
List<Course> findByLevel(Level level);                           // to-one associations loaded with a join

// named entity graph on the entity
@Entity
@NamedEntityGraph(name = "Course.detail",
    attributeNodes = { @NamedAttributeNode("category"), @NamedAttributeNode(value = "lessons", subgraph = "lessonSub") },
    subgraphs = @NamedSubgraph(name = "lessonSub", attributeNodes = @NamedAttributeNode("resources")))
public class Course { }

em.createQuery("select c from Course c where c.id = :id", Course.class)
  .setHint("jakarta.persistence.fetchgraph", em.getEntityGraph("Course.detail"))
  .setParameter("id", 1L).getSingleResult();`,
        ),
      ],
      [
        blk(`<h3>Batch fetching and the two-query pattern</h3>
• <b>Batch fetching</b> (<code>@BatchSize(size = 32)</code> or global <code>hibernate.default_batch_fetch_size=32</code>) turns N lazy loads into <b>N/32</b> queries using <code>where course_id in (?, ?, ...)</code>: a cheap, global, safe improvement that works with pagination. Subselect fetching (<code>@Fetch(FetchMode.SUBSELECT)</code>) loads all collections of previously loaded parents in one query.<br>
• <b>Two-query pattern for paginated collections</b>: query 1 paginates the <b>parent ids/entities</b>; query 2 loads children with <code>where c.id in :ids</code> (<code>join fetch</code>) and merges (or let batch fetching do it).<br>
• For list screens prefer <b>DTO projections</b> (joined/aggregated in SQL) over loading graphs.`,
          `# global: lazy collections/proxies are loaded in batches of 32
spring.jpa.properties.hibernate.default_batch_fetch_size=32

@OneToMany(mappedBy = "course")
@BatchSize(size = 25)
private Set<Lesson> lessons;

// pagination + collection: two queries
Page<Long> ids = courseRepository.findIds(pageable);                                  // select c.id ... limit ?
List<Course> courses = em.createQuery("select distinct c from Course c left join fetch c.lessons where c.id in :ids", Course.class)
    .setParameter("ids", ids.getContent()).getResultList();                           // no limit issue: ids already paged

// DTO projection: 1 query, no lazy loading at all
@Query("select new com.app.CourseSummary(c.id, c.title, count(l)) from Course c left join c.lessons l group by c.id, c.title")
Page<CourseSummary> summaries(Pageable p);`,
        ),
      ],
      [
        ['What is the N+1 query problem and how do you fix it?', 'One query loads N parents and then N extra queries load each lazy association. Fix with fetch joins, entity graphs, batch fetching (@BatchSize / default_batch_fetch_size), or DTO projections, and assert query counts in tests.'],
        ['Why not fetch join several collections at once?', 'Fetching more than one List (bag) causes MultipleBagFetchException and a Cartesian product that multiplies rows. Fetch one collection per query or use batch fetching for the others.'],
        ['join fetch vs EntityGraph?', 'Both fetch associations eagerly for a query. join fetch is written in the query itself; an EntityGraph is declared separately and applied to a query or repository method, letting you reuse the same query with different fetch plans.'],
      ],
    ),
    topic(
      'hb-jdbc-batching-pool',
      'JDBC Batching, Connection Pooling and SQL Logging',
      [
        blk(`<h3>JDBC batching</h3>
• By default every INSERT/UPDATE/DELETE is a separate round trip. <b>JDBC batching</b> groups statements into batches: <code>hibernate.jdbc.batch_size=50</code>. It works for <b>writes</b> only and requires: a generator that does not force immediate execution (<b>SEQUENCE</b>, not <code>IDENTITY</code>), <code>hibernate.order_inserts=true</code> and <code>hibernate.order_updates=true</code> (so same-table statements are adjacent), <code>hibernate.jdbc.batch_versioned_data=true</code>.<br>
• Driver flags: MySQL <code>rewriteBatchedStatements=true</code>; PostgreSQL <code>reWriteBatchedInserts=true</code>.<br>
• Process large imports in <b>chunks</b> with <code>flush()</code> + <code>clear()</code> every batch size; consider <b>JdbcTemplate.batchUpdate</b> or <code>StatelessSession</code> for millions of rows.`,
          `# application.properties
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.jdbc.batch_versioned_data=true
spring.datasource.url=jdbc:mysql://localhost:3306/jsl?rewriteBatchedStatements=true
# PostgreSQL: jdbc:postgresql://localhost/jsl?reWriteBatchedInserts=true

@Transactional
public void importAll(List<CourseRow> rows) {
    final int batch = 50;
    for (int i = 0; i < rows.size(); i++) {
        em.persist(toEntity(rows.get(i)));                 // needs SEQUENCE ids for batching
        if ((i + 1) % batch == 0) { em.flush(); em.clear(); }
    }
}

// Verify with a datasource proxy: expect 1 batch per 50 rows, not 50 statements
// logging.level.net.ttddyy.dsproxy.listener=DEBUG`,
        ),
      ],
      [
        blk(`<h3>Connection pooling (HikariCP)</h3>
• Opening a database connection is expensive, so apps use a <b>connection pool</b>; Spring Boot's default is <b>HikariCP</b>. Hibernate borrows a connection when a transaction/query starts and returns it at the end: a <b>long transaction = a connection held for its whole duration</b>.<br>
• Sizing: <b>smaller is better</b>. Starting point: <code>connections ≈ (core_count × 2) + effective_spindle_count</code> for the <b>database</b> across all app instances (often 10-20 per instance). Many instances × big pools can overwhelm the DB (<code>max_connections</code>). Symptoms of exhaustion: threads waiting for <code>HikariPool-1 - Connection is not available</code>.<br>
• Tune <code>maximum-pool-size</code>, <code>minimum-idle</code>, <code>connection-timeout</code> (fail fast), <code>max-lifetime</code> (below the DB/ firewall timeout), <code>leak-detection-threshold</code> (find unclosed/long-held connections). Avoid <b>Open Session In View</b> (it holds the connection during view rendering) and remote calls inside transactions.`,
          `spring.datasource.hikari.maximum-pool-size=15
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=5000          # fail fast instead of piling up requests
spring.datasource.hikari.max-lifetime=1700000             # slightly below the database/proxy idle limit
spring.datasource.hikari.leak-detection-threshold=20000   # log a stack trace for connections held > 20 s
spring.jpa.open-in-view=false

# Metrics: hikaricp_connections_active / _pending / _timeout_total (Micrometer) -> alert on pending > 0
// BAD: remote call holds a DB connection
@Transactional
public void checkout(Order o) { repo.save(o); paymentClient.charge(o); }     // slow HTTP call while the connection is checked out
// BETTER: do the remote call outside, or use the outbox pattern`,
        ),
      ],
      [
        blk(`<h3>SQL logging and statistics</h3>
• <b>Never trust, always check the SQL.</b> Development: <code>logging.level.org.hibernate.SQL=DEBUG</code> prints statements; <code>logging.level.org.hibernate.orm.jdbc.bind=TRACE</code> shows bind values; <code>hibernate.format_sql=true</code> pretty-prints. Avoid <code>spring.jpa.show-sql=true</code> in production (stdout, no bind values) and avoid logging all SQL in production (cost).<br>
• <b>Statistics</b>: <code>hibernate.generate_statistics=true</code> exposes counts (queries, entity loads, cache hits, slow queries via <code>hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS</code>) and integrates with Micrometer/Actuator.<br>
• <b>Slow query log</b> at database level (MySQL <code>slow_query_log</code>, PostgreSQL <code>log_min_duration_statement</code>) + <code>EXPLAIN ANALYZE</code> for the real plan. APM tools (Datadog, New Relic, Glowroot) show per-endpoint query counts.`,
          `logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.orm.jdbc.bind=TRACE
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.generate_statistics=true
spring.jpa.properties.hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS=250     # warn about slow queries

// Query count per request in a filter (development)
Statistics st = emf.unwrap(SessionFactory.class).getStatistics();
long before = st.getPrepareStatementCount();
chain.doFilter(req, res);
log.info("{} -> {} statements", ((HttpServletRequest) req).getRequestURI(), st.getPrepareStatementCount() - before);`,
        ),
      ],
      [
        ['Why does IDENTITY prevent JDBC insert batching?', 'The identifier is created by the database at insert time, so Hibernate must execute each INSERT immediately to read the key and cannot queue them in a batch. SEQUENCE ids are fetched in advance, allowing batching.'],
        ['How big should a HikariCP pool be?', 'Small: roughly a couple of times the database server\'s core count in total across all instances (commonly 10-20 per instance). Larger pools do not add throughput and can overload the database; keep transactions short so connections return quickly.'],
        ['How do you see what SQL Hibernate generates?', 'Enable the org.hibernate.SQL logger (and the bind logger for parameters), format_sql, Hibernate statistics, or a datasource proxy; assert query counts in tests and use EXPLAIN on slow statements.'],
      ],
    ),
    topic(
      'hb-query-index-readonly',
      'Query Optimization, Indexing, Read-Only Queries and Avoiding Eager Loading',
      [
        blk(`<h3>Query optimisation checklist</h3>
• <b>Select only what you need</b>: DTO/interface projections for lists; avoid loading entities for read-only screens. <b>Fetch what you need in one go</b>: fetch joins/entity graphs/batch size. <b>Paginate</b> everything user-facing; never return unbounded lists.<br>
• Avoid <code>findAll()</code> on big tables, <code>count()</code> on huge tables per request (cache or approximate), functions on indexed columns in <code>where</code> (<code>lower(email)</code> defeats an index unless a functional index exists), <code>like '%text'</code> (leading wildcard), <code>or</code> chains, <code>select distinct</code> on big graphs, and <code>in</code> with thousands of values (chunk it).<br>
• Prefer <b>set-based bulk operations</b> over loading entities one by one; use <code>exists</code> for presence checks (<code>existsById</code>, <code>existsByEmail</code>) instead of <code>count</code> or loading.`,
          `// BAD: loads full entities and filters in Java
courseRepository.findAll().stream().filter(c -> c.getPrice().compareTo(limit) < 0).toList();

// GOOD: filter in the database, project, paginate
Page<CourseSummary> page = courseRepository.findByPriceLessThan(limit, PageRequest.of(0, 20, Sort.by("title")));

// BAD: leading wildcard cannot use a normal index
@Query("select c from Course c where c.title like %:q")
// BETTER: prefix search 'q%' (index-friendly) or full-text search (MySQL FULLTEXT, PostgreSQL tsvector/pg_trgm)

// exists instead of count
boolean taken = userRepository.existsByEmail(email);              // select 1 ... limit 1`,
        ),
      ],
      [
        blk(`<h3>Indexing</h3>
• Indexes make lookups fast but slow writes and use space: <b>index the columns you filter, join and sort on</b>. Foreign key columns used in joins (<code>enrollment.course_id</code>) need an index (PostgreSQL does not create one automatically; MySQL InnoDB does for FKs). <b>Composite indexes</b> follow the <b>leftmost-prefix rule</b>: <code>(student_id, course_id)</code> serves queries on <code>student_id</code> and on both, not on <code>course_id</code> alone.<br>
• Declare them in <b>migrations</b> (Flyway); <code>@Table(indexes = ...)</code> documents them and is used for schema generation in tests. Check usage with <code>EXPLAIN (ANALYZE)</code>; drop unused indexes. <b>Covering indexes</b> (include selected columns) enable index-only scans for projections.<br>
• Unique constraints (<code>@UniqueConstraint</code>) both enforce rules and create indexes.`,
          `-- Flyway migration V12__indexes.sql
CREATE INDEX idx_enrollment_student ON enrollment (student_id, enrolled_at DESC);
CREATE INDEX idx_enrollment_course  ON enrollment (course_id);
CREATE UNIQUE INDEX uk_student_email ON student (lower(email));        -- PostgreSQL functional index for case-insensitive lookups
CREATE INDEX idx_course_level_price ON course (level, price) INCLUDE (title);   -- covering index (PostgreSQL 11+)

-- inspect the plan
EXPLAIN (ANALYZE, BUFFERS) SELECT id, title FROM course WHERE level = 'BEGINNER' AND price < 2000 ORDER BY price;

@Entity @Table(name = "enrollment", indexes = {
    @Index(name = "idx_enrollment_student", columnList = "student_id, enrolled_at"),
    @Index(name = "idx_enrollment_course", columnList = "course_id") })
class Enrollment { }`,
        ),
      ],
      [
        blk(`<h3>Read-only queries, pagination optimisation and avoiding unnecessary eager loading</h3>
• <b>Read-only</b> transactions/queries skip the dirty-checking snapshot and flush: <code>@Transactional(readOnly = true)</code> for all query-only service methods (also hints the driver/DB: routing to a replica, MySQL read-only transaction). Use <code>setReadOnly(true)</code>/<code>HINT_READ_ONLY</code> on queries; DTO projections are inherently read-only.<br>
• <b>Pagination optimisation</b>: use keyset pagination for deep pages; use <b><code>Slice</code></b> (no count query) when you only need "next page?"; cache or estimate totals; avoid <code>count(*)</code> with big joins (use a simplified count query); fetch ids first then entities for collection fetches.<br>
• <b>Avoid unnecessary eager loading</b>: audit mappings with <code>grep -R "FetchType.EAGER\|@ManyToOne$\|@OneToOne$"</code> (remember the defaults!); all to-one associations explicit <code>LAZY</code>; large LOB fields lazy or in a separate table; never EAGER on collections; use projections for UI lists. Re-check after adding associations: a new EAGER mapping changes every query of that entity.`,
          `@Service
@Transactional(readOnly = true)                          // class default: queries
public class CatalogueService {
    public Slice<CourseSummary> browse(Pageable p) { return repo.findBy(p); }          // Slice: no count(*) query

    @Transactional                                       // override for writes
    public void rename(Long id, String title) { repo.findById(id).orElseThrow().setTitle(title); }
}

// separate count query that is cheaper than the page query
@Query(value = "select c from Course c join fetch c.category", countQuery = "select count(c) from Course c")
Page<Course> pageWithCategory(Pageable pageable);

// make every to-one explicit LAZY
@ManyToOne(fetch = FetchType.LAZY) private Category category;
@OneToOne(fetch = FetchType.LAZY) private CourseSettings settings;`,
        ),
      ],
      [
        ['How do you optimise a slow Hibernate query?', 'Look at the generated SQL and the database execution plan; select only needed columns (projections), fix N+1 with fetch joins/batch fetching, add the right indexes, paginate, avoid functions/leading wildcards on indexed columns, use read-only transactions and cache stable data.'],
        ['Why use readOnly = true on query methods?', 'Hibernate skips dirty checking and snapshots (less memory and CPU) and avoids unnecessary flushes; it also signals intent to the database/driver and routing layers.'],
        ['Page vs Slice?', 'Page runs an extra count query to know the total pages and elements; Slice only knows whether a next page exists, avoiding the count and making it cheaper for infinite scroll.'],
      ],
    ),
  ]),

  hb(8, 'Transactions and Concurrency', 'Core', [
    topic(
      'hb-acid-transactional',
      'ACID, Hibernate Transactions, Spring @Transactional, Propagation and Isolation',
      [
        blk(`<h3>ACID properties</h3>
<table ${TABLE}>
<tr><th>Property</th><th>Meaning</th><th>Provided by</th></tr>
<tr><td><b>A</b>tomicity</td><td>All operations succeed or none do</td><td>Transaction commit/rollback, undo log</td></tr>
<tr><td><b>C</b>onsistency</td><td>Constraints hold before and after (valid state to valid state)</td><td>DB constraints + application rules</td></tr>
<tr><td><b>I</b>solation</td><td>Concurrent transactions do not see each other's partial work</td><td>Locking / MVCC, isolation level</td></tr>
<tr><td><b>D</b>urability</td><td>Committed data survives crashes</td><td>Write-ahead log, fsync</td></tr>
</table>
• Hibernate does not implement ACID itself: it uses the <b>database transaction</b> (via JDBC) and adds a unit-of-work/flush mechanism on top.`),
      ],
      [
        blk(`<h3>Spring @Transactional</h3>
• <code>@Transactional</code> on a public method of a Spring bean creates a <b>proxy</b> that begins a transaction (obtains a connection, creates the persistence context), runs the method and commits, or rolls back on <b>unchecked exceptions</b> (<code>RuntimeException</code>/<code>Error</code>); checked exceptions commit unless <code>rollbackFor</code>.<br>
• Put it on the <b>service layer</b> (one business operation = one transaction), not on controllers or repositories. Attributes: <code>readOnly</code>, <code>propagation</code>, <code>isolation</code>, <code>timeout</code>, <code>rollbackFor</code>/<code>noRollbackFor</code>. Class-level + method override is common.<br>
• Self-invocation and <code>private</code>/<code>final</code> methods bypass the proxy; <code>@Transactional</code> on interfaces vs classes: annotate classes. Use <code>TransactionTemplate</code> for programmatic control; <code>@TransactionalEventListener(phase = AFTER_COMMIT)</code> to react after commit.`,
          `@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentRepository enrollments;
    private final CourseRepository courses;
    private final ApplicationEventPublisher events;

    @Transactional                                          // atomic: save + capacity check
    public Enrollment enroll(long studentId, long courseId) {
        Course c = courses.findByIdForUpdate(courseId).orElseThrow();
        if (c.isFull()) throw new CourseFullException(courseId);
        Enrollment e = enrollments.save(new Enrollment(studentId, c));
        events.publishEvent(new Enrolled(e.getId()));       // handled after commit
        return e;
    }
}

@Component
class Notifier {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)   // only if the transaction really committed
    void on(Enrolled e) { mail.send(e); }
}

// programmatic
transactionTemplate.executeWithoutResult(status -> { /* ... */ if (bad) status.setRollbackOnly(); });`,
        ),
      ],
      [
        blk(`<h3>Propagation and isolation levels</h3>
<table ${TABLE}>
<tr><th>Propagation</th><th>Behaviour</th></tr>
<tr><td><code>REQUIRED</code> (default)</td><td>Join the current transaction, or start one</td></tr>
<tr><td><code>REQUIRES_NEW</code></td><td>Always start a <b>new, independent</b> transaction; suspend the current one (audit logs, outbox that must commit even if the caller rolls back)</td></tr>
<tr><td><code>SUPPORTS</code></td><td>Join if one exists, else run non-transactionally</td></tr>
<tr><td><code>MANDATORY</code></td><td>Must run inside a transaction, else exception</td></tr>
<tr><td><code>NOT_SUPPORTED</code></td><td>Run without a transaction (suspend the current)</td></tr>
<tr><td><code>NEVER</code></td><td>Fail if a transaction exists</td></tr>
<tr><td><code>NESTED</code></td><td>Savepoint inside the current transaction (JDBC savepoints)</td></tr>
</table>
<table ${TABLE}>
<tr><th>Isolation</th><th>Prevents</th><th>Allows</th></tr>
<tr><td><code>READ_UNCOMMITTED</code></td><td>nothing</td><td>dirty, non-repeatable, phantom reads</td></tr>
<tr><td><code>READ_COMMITTED</code> (PostgreSQL/Oracle default)</td><td>dirty reads</td><td>non-repeatable and phantom reads</td></tr>
<tr><td><code>REPEATABLE_READ</code> (MySQL InnoDB default)</td><td>dirty and non-repeatable reads</td><td>phantoms (InnoDB largely prevents via gap locks)</td></tr>
<tr><td><code>SERIALIZABLE</code></td><td>all anomalies</td><td>— (lowest concurrency; retries on serialization failures)</td></tr>
</table>`,
          `@Transactional(propagation = Propagation.REQUIRES_NEW)
public void audit(String event) { auditRepo.save(new AuditEntry(event)); }           // commits even if the caller later rolls back

@Transactional(isolation = Isolation.SERIALIZABLE, timeout = 5)
public void transfer(long from, long to, BigDecimal amount) { /* ... */ }            // retry on SQLState 40001 / CannotSerializeTransactionException

@Transactional(propagation = Propagation.MANDATORY)
public void applyDiscount(Order o) { /* must be called inside an existing business transaction */ }`,
        ),
      ],
      [
        ['What are the ACID properties?', 'Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere), Durability (committed data survives failures).'],
        ['REQUIRED vs REQUIRES_NEW?', 'REQUIRED joins the caller\'s transaction (one commit/rollback for all); REQUIRES_NEW suspends it and runs an independent transaction that commits or rolls back on its own, useful for audit/outbox records.'],
        ['What does the isolation level control?', 'How much concurrent transactions can see of each other: dirty, non-repeatable and phantom reads. Higher levels (REPEATABLE_READ, SERIALIZABLE) give stronger guarantees with less concurrency and possible retries.'],
      ],
    ),
    topic(
      'hb-locking-version',
      'Optimistic and Pessimistic Locking, @Version and Deadlock Handling',
      [
        blk(`<h3>Lost updates and optimistic locking</h3>
• <b>Lost update</b>: two users load the same row, both change it, the second commit overwrites the first without noticing. <b>Optimistic locking</b> assumes conflicts are rare: add a <b><code>@Version</code></b> field (<code>int</code>/<code>long</code>/<code>Instant</code>); Hibernate adds <code>where id=? and version=?</code> to every UPDATE/DELETE and increments the version. If 0 rows are updated, someone else changed it: <b><code>OptimisticLockException</code></b> (Spring: <code>ObjectOptimisticLockingFailureException</code>).<br>
• No database locks are held: great scalability, ideal for web apps with user think time. Handle the exception: <b>retry</b> (for system operations) or <b>tell the user</b> to reload (HTTP <code>409 Conflict</code>). Send the version to the client (ETag/field) so conflicts across requests are detected.`,
          `@Entity
public class Course {
    @Id @GeneratedValue private Long id;
    private String title;
    private BigDecimal price;

    @Version private Long version;               // managed by Hibernate: never set it yourself
}

// SQL: update course set title=?, price=?, version=? where id=? and version=?
// If another transaction updated the row first: 0 rows affected -> OptimisticLockException

@ControllerAdvice
class Errors {
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    ResponseEntity<ApiError> conflict() { return ResponseEntity.status(409).body(new ApiError("This record was changed by someone else. Reload and try again.")); }
}

@Retryable(retryFor = ObjectOptimisticLockingFailureException.class, maxAttempts = 3, backoff = @Backoff(delay = 50))
@Transactional
public void incrementViews(long id) { courseRepo.findById(id).orElseThrow().incrementViews(); }`,
        ),
      ],
      [
        blk(`<h3>Pessimistic locking</h3>
• <b>Pessimistic locking</b> locks the rows <b>in the database</b> (<code>SELECT ... FOR UPDATE</code>) so others wait. Use when conflicts are frequent or the cost of failure is high (inventory decrement, seat booking, balance transfer) and transactions are <b>short</b>.<br>
• JPA: <code>em.find(Course.class, id, LockModeType.PESSIMISTIC_WRITE)</code> (<code>FOR UPDATE</code>), <code>PESSIMISTIC_READ</code> (<code>FOR SHARE</code>), <code>PESSIMISTIC_FORCE_INCREMENT</code>; Spring Data: <code>@Lock(LockModeType.PESSIMISTIC_WRITE)</code> on a query. Set a <b>lock timeout</b> (<code>jakarta.persistence.lock.timeout</code> hint) and use <code>SKIP LOCKED</code> (<code>hibernate.jdbc..</code>, Hibernate hint <code>jakarta.persistence.lock.timeout = -2</code>) for work queues.<br>
• Also available: <code>OPTIMISTIC</code> / <code>OPTIMISTIC_FORCE_INCREMENT</code> lock modes to verify/bump a version of entities you only <b>read</b>.`,
          `public interface CourseRepository extends JpaRepository<Course, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))     // wait max 3 s
    @Query("select c from Course c where c.id = :id")
    Optional<Course> findByIdForUpdate(@Param("id") Long id);
}

@Transactional
public void reserveSeat(long courseId) {
    Course c = repo.findByIdForUpdate(courseId).orElseThrow();      // select ... for update: other transactions wait here
    if (c.getSeatsLeft() == 0) throw new SoldOutException();
    c.setSeatsLeft(c.getSeatsLeft() - 1);
}                                                                   // commit releases the row lock

// work queue: take jobs nobody else holds
@Query(value = "select * from job where status='NEW' order by id limit 10 for update skip locked", nativeQuery = true)
List<Job> claimBatch();`,
        ),
      ],
      [
        blk(`<h3>Choosing a strategy and handling deadlocks</h3>
<table ${TABLE}>
<tr><th></th><th>Optimistic (<code>@Version</code>)</th><th>Pessimistic (<code>FOR UPDATE</code>)</th></tr>
<tr><td>Conflict handling</td><td>Detected at commit; exception</td><td>Prevented; others wait</td></tr>
<tr><td>Throughput</td><td>High (no locks)</td><td>Lower (blocking)</td></tr>
<tr><td>Best when</td><td>Conflicts are rare, long user think time</td><td>Conflicts frequent, short critical section</td></tr>
<tr><td>Risks</td><td>Retries / user conflicts</td><td>Deadlocks, lock waits, held connections</td></tr>
</table>
• <b>Deadlock</b>: transaction A holds row 1 and waits for row 2; B holds row 2 and waits for row 1. The database detects it and aborts one (<code>40001</code>/<code>40P01</code>, Spring <code>DeadlockLoserDataAccessException</code>/<code>CannotAcquireLockException</code>). Prevent by <b>locking rows in a consistent order</b> (sort ids), keeping transactions short, using the lowest necessary isolation, and avoiding user interaction inside transactions. Handle with <b>retry and backoff</b> of the whole transaction.<br>
• <b>Atomic updates</b> often avoid locking altogether: <code>update course set seats = seats - 1 where id = ? and seats &gt; 0</code> (check rows affected).`,
          `// consistent lock order prevents deadlocks in transfers
public void transfer(long a, long b, BigDecimal amount) {
    long first = Math.min(a, b), second = Math.max(a, b);          // always lock the lower id first
    Account x = accounts.lockById(first);
    Account y = accounts.lockById(second);
    /* move money */
}

// atomic conditional update: no explicit lock, no lost update
@Modifying @Query("update Course c set c.seatsLeft = c.seatsLeft - 1 where c.id = :id and c.seatsLeft > 0")
int takeSeat(@Param("id") Long id);                                 // returns 0 when sold out

@Retryable(retryFor = {CannotAcquireLockException.class, DeadlockLoserDataAccessException.class}, maxAttempts = 3, backoff = @Backoff(delay = 100, multiplier = 2))
@Transactional
public void process(...) { }`,
        ),
      ],
      [
        ['Optimistic vs pessimistic locking?', 'Optimistic locking uses a @Version column and detects conflicting updates at commit (exception), holding no locks; pessimistic locking locks rows in the database (SELECT FOR UPDATE) so concurrent transactions wait. Use optimistic by default and pessimistic for hot, short critical sections.'],
        ['What does @Version do?', 'Hibernate adds the version to the WHERE clause of UPDATE/DELETE and increments it; if no row matches, another transaction changed the entity and an optimistic lock exception is thrown, preventing lost updates.'],
        ['How do you prevent and handle deadlocks?', 'Lock rows in a consistent order, keep transactions short, avoid unnecessary locks (use atomic updates), and retry the whole transaction with backoff when the database aborts one as the deadlock victim.'],
      ],
    ),
    topic(
      'hb-dirty-flush',
      'Dirty Checking, Write-Behind and Flush Modes',
      [
        blk(`<h3>Dirty checking</h3>
• When an entity is loaded, Hibernate keeps a <b>snapshot</b> of its state ("loaded state"). At <b>flush</b> time it compares every managed entity's current state with its snapshot; each difference becomes an <b>UPDATE</b> automatically: no <code>save()</code> call is needed.<br>
• Cost: proportional to the number of managed entities × properties. Reduce with read-only entities/queries, DTO projections, <code>clear()</code> in batches and <b>bytecode enhancement</b> (dirty tracking by instrumentation: <code>hibernate.enhancer.enableDirtyTracking</code>).<br>
• By default UPDATE statements include <b>all columns</b> (statement reuse); <code>@DynamicUpdate</code> includes only changed columns (useful for wide tables or concurrent updates of different columns).`,
          `@Transactional
public void applyDiscount(Long id) {
    Course c = repo.findById(id).orElseThrow();                    // snapshot taken
    c.setPrice(c.getPrice().multiply(new BigDecimal("0.9")));      // state differs from the snapshot
}                                                                  // flush: UPDATE course SET price=?, title=?, ... WHERE id=?   (no save() call)

@Entity
@DynamicUpdate                                                      // UPDATE course SET price=? WHERE id=?   (only the changed column)
public class Course { }

// no changes -> no UPDATE
@Transactional public void noop(Long id) { repo.findById(id); }    // read only: nothing to flush`,
        ),
      ],
      [
        blk(`<h3>Write-behind (transactional write-behind)</h3>
• Hibernate does <b>not</b> execute SQL when you call <code>persist/remove</code> or set a field: it <b>queues</b> the changes in the <b>action queue</b> and sends them at <b>flush</b> time (usually at commit), in a safe order: <b>inserts, updates, collection removals/updates/inserts, deletes</b>. Benefits: fewer round trips, JDBC batching, no work for changes that cancel out (persist then remove).<br>
• Consequences: SQL errors (constraint violations) appear at <b>flush/commit</b>, not at the line that caused them: call <code>flush()</code> inside a try/catch when you need the error handled locally; execution order differs from your code order (<code>hibernate.order_inserts</code>); exceptions can surface far from the cause.<br>
• <code>IDENTITY</code> inserts are the exception (executed immediately).`,
          `@Transactional
public void register(Student s) {
    try {
        em.persist(s);
        em.flush();                                       // execute the INSERT now: a duplicate email fails HERE
    } catch (PersistenceException e) {
        if (isUniqueViolation(e)) throw new EmailAlreadyUsedException(s.getEmail());
        throw e;
    }
    welcomeMail.queue(s);
}   // without flush(): the constraint error would only appear at commit, after the mail was queued

// ordering: queued actions run as inserts -> updates -> deletes, so this common trick fails:
// em.remove(oldRow); em.persist(newRowWithSameUniqueKey);   // INSERT runs before DELETE -> unique constraint violation
// fix: em.remove(oldRow); em.flush(); em.persist(newRowWithSameUniqueKey);`,
        ),
      ],
      [
        blk(`<h3>Flush modes</h3>
• <b><code>FlushModeType.AUTO</code></b> (default): Hibernate flushes <b>before a query</b> whose results could be affected by pending changes (it checks the query's tables), and at commit: queries see your uncommitted changes. <b><code>COMMIT</code></b>: flush only at commit (faster, but queries may miss pending changes). Hibernate-native: <b><code>MANUAL</code></b> (only when you call <code>flush()</code>: ideal for <b>read-only</b> sessions) and <b><code>ALWAYS</code></b> (before every query).<br>
• <b>Native SQL</b> queries: Hibernate cannot know the affected tables, so it flushes everything before them unless you declare <b>query spaces</b>; with <code>COMMIT</code> mode flush manually first.<br>
• A flush at an unexpected time can also run <b>unintended updates</b> (an entity modified earlier and forgotten): keep transactions focused and entities clean.`,
          `em.setFlushMode(FlushModeType.COMMIT);                       // JPA
Session s = em.unwrap(Session.class);
s.setHibernateFlushMode(FlushMode.MANUAL);                   // Hibernate: never auto-flush (read-only report)

@Transactional
public void autoFlushDemo() {
    Course c = em.find(Course.class, 1L);
    c.setTitle("New");                                       // pending change
    List<Course> r = em.createQuery("from Course where title = 'New'", Course.class).getResultList();
    // AUTO flush: UPDATE sent before the SELECT, so r contains c
}

// Spring: bulk query with explicit flush
@Modifying(flushAutomatically = true, clearAutomatically = true)
@Query("update Enrollment e set e.status = 'DONE' where e.course.id = :c")
int completeAll(@Param("c") Long c);`,
        ),
      ],
      [
        ['What is dirty checking?', 'Hibernate compares each managed entity with a snapshot taken when it was loaded and automatically issues UPDATE statements for changed entities at flush, so you do not call save() for managed entities.'],
        ['What is the write-behind mechanism?', 'Hibernate queues entity changes in an action queue and executes the SQL at flush time (usually commit) in a defined order, reducing round trips and enabling batching; errors therefore surface at flush/commit.'],
        ['AUTO vs COMMIT flush mode?', 'AUTO flushes pending changes before queries that might be affected, so queries see them; COMMIT flushes only at commit, which is faster but queries can miss uncommitted changes.'],
      ],
    ),
  ]),

  hb(9, 'Advanced Hibernate', 'Advanced', [
    topic(
      'hb-inheritance',
      'Inheritance Mapping: Single Table, Joined, Table Per Class and MappedSuperclass',
      [
        blk(`<h3>Strategies at a glance</h3>
<table ${TABLE}>
<tr><th>Strategy</th><th>Tables</th><th>Polymorphic query</th><th>Pros</th><th>Cons</th></tr>
<tr><td><code>SINGLE_TABLE</code> (default)</td><td>One table for the whole hierarchy + discriminator column</td><td>1 SELECT, no join</td><td><b>Fastest</b>, simple</td><td>Subclass columns must be nullable; wide, sparse table; no NOT NULL for subclass fields</td></tr>
<tr><td><code>JOINED</code></td><td>Table per class, joined by PK/FK</td><td>Joins (or union) over the tables</td><td>Normalised, NOT NULL constraints, no sparse columns</td><td>Joins for every load; slower inserts (2+ statements)</td></tr>
<tr><td><code>TABLE_PER_CLASS</code></td><td>A full table per concrete class</td><td><code>UNION</code> of all tables</td><td>No joins for single-class queries</td><td>Slow polymorphic queries; no polymorphic FKs; ids must be unique across tables (no IDENTITY): <b>avoid</b></td></tr>
<tr><td><code>@MappedSuperclass</code></td><td>Not an entity: shares fields only</td><td>No polymorphic queries on the parent</td><td>Reuse common columns (id, audit)</td><td>Cannot be queried or targeted by associations</td></tr>
</table>
• Default recommendation: <b><code>SINGLE_TABLE</code></b> for small hierarchies where performance matters, <b><code>JOINED</code></b> when you need strict constraints. Prefer <b>composition</b> over deep inheritance.`),
      ],
      [
        blk(`<h3>Single table and joined</h3>
• <b>SINGLE_TABLE</b>: all columns live in one table; <code>@DiscriminatorColumn</code> (<code>DTYPE</code>) + <code>@DiscriminatorValue</code> identify the subclass. <b>JOINED</b>: the child table's PK is also an FK to the parent (<code>@PrimaryKeyJoinColumn</code>); loading a subclass joins parent and child; a polymorphic query to the parent left-joins all subclasses.`,
          `// SINGLE_TABLE
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "kind", length = 15)
public abstract class Content {
    @Id @GeneratedValue private Long id;
    private String title;
}
@Entity @DiscriminatorValue("VIDEO")
public class VideoLesson extends Content { private Integer durationSec; private String url; }      // nullable columns in the shared table
@Entity @DiscriminatorValue("ARTICLE")
public class ArticleLesson extends Content { @Lob private String body; }

// JOINED
@Entity @Inheritance(strategy = InheritanceType.JOINED)
public abstract class Payment { @Id @GeneratedValue Long id; BigDecimal amount; }
@Entity @PrimaryKeyJoinColumn(name = "payment_id")
public class CardPayment extends Payment { @Column(nullable = false) String last4; }
@Entity public class UpiPayment extends Payment { @Column(nullable = false) String vpa; }

List<Content> all = em.createQuery("from Content", Content.class).getResultList();     // polymorphic: VideoLesson and ArticleLesson instances
List<VideoLesson> videos = em.createQuery("from VideoLesson", VideoLesson.class).getResultList();`,
        ),
      ],
      [
        blk(`<h3>@MappedSuperclass and practical advice</h3>
• <b><code>@MappedSuperclass</code></b> is the cleanest way to share common fields (id, version, audit timestamps) among unrelated entities without a polymorphic hierarchy; the parent is <b>not</b> an entity.<br>
• Use <b><code>@DiscriminatorFormula</code></b> or <code>@Any</code> for special cases; mix inheritance with <b>embeddables</b> for value types. <b>Polymorphic associations</b> (<code>@ManyToOne Content content</code>) work with SINGLE_TABLE/JOINED; with TABLE_PER_CLASS they need unions.<br>
• Pitfalls: lazy proxies of an abstract parent are of the <b>parent's proxy class</b>, so <code>instanceof VideoLesson</code> fails on a proxy: use <code>Hibernate.unproxy(x)</code> or the visitor pattern; <b>deep hierarchies hurt</b> queries and schema; enum type fields (<code>type</code> + nullable columns) can be simpler than inheritance.`,
          `@MappedSuperclass
public abstract class BaseEntity {
    @Id @GeneratedValue private Long id;
    @Version private Long version;
    @CreationTimestamp @Column(updatable = false) private Instant createdAt;
    @UpdateTimestamp private Instant updatedAt;
    // getters...
}
@Entity public class Course extends BaseEntity { private String title; }
@Entity public class Student extends BaseEntity { private String email; }

// lazy proxy pitfall
Content c = em.getReference(Content.class, 5L);                       // proxy of Content, not of VideoLesson
if (c instanceof VideoLesson v) { }                                    // false even if the row is a video
Content real = (Content) Hibernate.unproxy(c);                         // initialise and unwrap
if (real instanceof VideoLesson v) { /* ok */ }`,
        ),
      ],
      [
        ['Which inheritance strategy should you choose?', 'SINGLE_TABLE for speed and simplicity (accepting nullable subclass columns), JOINED for a normalised schema with NOT NULL constraints (accepting joins), and avoid TABLE_PER_CLASS. Use @MappedSuperclass to share common fields.'],
        ['What is @MappedSuperclass?', 'A non-entity superclass whose mapped fields are inherited by entity subclasses (for example id, version and audit columns); it has no table of its own and cannot be queried or referenced.'],
        ['Why does instanceof fail on a lazy proxy?', 'The proxy is a generated subclass of the declared type (the parent), not of the real subclass; unproxy it with Hibernate.unproxy or avoid type checks in favour of polymorphic methods.'],
      ],
    ),
    topic(
      'hb-composite-converters',
      'Composite Primary Keys, Custom Types and Attribute Converters',
      [
        blk(`<h3>Composite primary keys: @EmbeddedId vs @IdClass</h3>
• A <b>composite key</b> has several columns (a link table with <code>(student_id, course_id)</code>). The key class must be <b><code>Serializable</code></b> with <code>equals()</code> and <code>hashCode()</code> and a no-arg constructor.<br>
• <b><code>@EmbeddedId</code></b>: the key is an <code>@Embeddable</code> object held as a single field (<code>enrollment.getId().getStudentId()</code>): cleaner, reusable in queries (<code>e.id.studentId</code>). <b><code>@IdClass</code></b>: the entity declares the key fields itself and points to a plain key class: queries use <code>e.studentId</code>; handy with legacy schemas and for <code>@Id @ManyToOne</code> derived keys. Use <code>@MapsId</code> to derive key parts from relationships.<br>
• Prefer a <b>surrogate key</b> (<code>@GeneratedValue</code>) plus a unique constraint for new schemas: simpler repositories, easier foreign keys.`,
          `@Embeddable
public class EnrollmentId implements Serializable {
    private Long studentId;
    private Long courseId;
    protected EnrollmentId() {}
    public EnrollmentId(Long s, Long c) { this.studentId = s; this.courseId = c; }
    @Override public boolean equals(Object o) { return o instanceof EnrollmentId x && Objects.equals(studentId, x.studentId) && Objects.equals(courseId, x.courseId); }
    @Override public int hashCode() { return Objects.hash(studentId, courseId); }
}

@Entity
public class Enrollment {
    @EmbeddedId private EnrollmentId id;

    @ManyToOne(fetch = FetchType.LAZY) @MapsId("studentId") private Student student;     // fills id.studentId
    @ManyToOne(fetch = FetchType.LAZY) @MapsId("courseId")  private Course course;

    private Instant enrolledAt = Instant.now();
    public Enrollment(Student s, Course c) { this.student = s; this.course = c; this.id = new EnrollmentId(s.getId(), c.getId()); }
}

// @IdClass alternative
@Entity @IdClass(EnrollmentKey.class)
public class Enrollment2 { @Id private Long studentId; @Id private Long courseId; }
public record EnrollmentKey(Long studentId, Long courseId) implements Serializable {}

Enrollment e = em.find(Enrollment.class, new EnrollmentId(1L, 7L));
em.createQuery("select e from Enrollment e where e.id.studentId = :s", Enrollment.class);`,
        ),
      ],
      [
        blk(`<h3>Attribute converters</h3>
• <b><code>AttributeConverter&lt;X, Y&gt;</code></b> converts a Java attribute type <code>X</code> to a database column type <code>Y</code> and back: encrypted strings, comma-separated lists, value objects (<code>Email</code>, <code>Money</code>), booleans stored as <code>'Y'/'N'</code>, JSON in a text column, custom enums with codes. Apply per attribute (<code>@Convert(converter = ...)</code>) or globally with <code>@Converter(autoApply = true)</code>.<br>
• Converters cannot be used on <code>@Id</code>, <code>@Version</code>, relationships or <code>@Enumerated</code>/<code>@Temporal</code> attributes. They run on every read/write: keep them <b>fast, null-safe and deterministic</b>; JPQL comparisons use the converted value.`,
          `@Converter(autoApply = true)
public class YesNoConverter implements AttributeConverter<Boolean, String> {
    @Override public String convertToDatabaseColumn(Boolean value) { return Boolean.TRUE.equals(value) ? "Y" : "N"; }
    @Override public Boolean convertToEntityAttribute(String db) { return "Y".equals(db); }
}

@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {
    @Override public String convertToDatabaseColumn(List<String> list) { return list == null ? null : String.join(",", list); }
    @Override public List<String> convertToEntityAttribute(String s) { return s == null || s.isBlank() ? List.of() : List.of(s.split(",")); }
}

@Entity
class Course {
    private boolean published;                                          // stored as 'Y' / 'N' (autoApply)
    @Convert(converter = StringListConverter.class) @Column(length = 500) private List<String> tags;
    @Convert(converter = CryptoConverter.class) private String panNumber;            // encrypted at rest
}`,
        ),
      ],
      [
        blk(`<h3>Custom types and modern alternatives</h3>
• Hibernate 6 provides <b><code>@JdbcTypeCode(SqlTypes.JSON)</code></b> to map a Java object/<code>Map</code> to a <b>JSON/JSONB</b> column (PostgreSQL, MySQL, Oracle), <code>@JdbcTypeCode(SqlTypes.ARRAY)</code> for arrays, <code>@JavaType</code>/<code>@JdbcType</code> for custom combinations, <code>UserType</code> for fully custom persistence (legacy <code>@Type</code>), plus <b>native enum</b> and <code>java.time</code> support.<br>
• Use JSON columns for flexible, rarely queried attributes (settings, metadata); keep relational columns for what you filter and join on. Index JSON paths where needed (PostgreSQL <code>GIN</code>).<br>
• <code>@Formula("(select count(*) from enrollment e where e.course_id = id)")</code> maps a read-only computed value (use sparingly).`,
          `@Entity
public class Course {
    @Id @GeneratedValue private Long id;

    @JdbcTypeCode(SqlTypes.JSON)                                     // jsonb on PostgreSQL
    private Map<String, Object> metadata = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    private CourseSettings settings;                                 // POJO serialised with Jackson/Jakarta JSON-B

    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] keywords;

    @Formula("(select count(*) from enrollment e where e.course_id = id)")
    private long enrolmentCount;                                     // computed by the database on load, read-only
}

// query a JSON attribute (HQL, Hibernate 6.x)
em.createQuery("select c from Course c where json_value(c.metadata, '$.level') = :l", Course.class);`,
        ),
      ],
      [
        ['@EmbeddedId vs @IdClass?', 'Both model composite keys. @EmbeddedId holds the key as one embeddable object field (queries use e.id.part); @IdClass leaves key fields directly on the entity and references a separate key class (queries use e.part). Key classes need equals, hashCode and Serializable.'],
        ['What is an AttributeConverter?', 'A JPA component that converts an entity attribute type to a database column type and back (encryption, lists, value objects, Y/N booleans); applied per attribute or automatically with autoApply.'],
        ['How can you store JSON in a column with Hibernate 6?', 'Use @JdbcTypeCode(SqlTypes.JSON) on a Map or POJO attribute, mapped to jsonb/json columns, and index paths in the database if you query them.'],
      ],
    ),
    topic(
      'hb-audit-soft-delete-filters',
      'Auditing, Soft Deletes, Hibernate Filters and Entity Listeners',
      [
        blk(`<h3>Entity listeners and lifecycle callbacks</h3>
• JPA callbacks: <code>@PrePersist</code>, <code>@PostPersist</code>, <code>@PreUpdate</code>, <code>@PostUpdate</code>, <code>@PreRemove</code>, <code>@PostRemove</code>, <code>@PostLoad</code>, on the entity or in a separate listener class (<code>@EntityListeners</code>). Use for timestamps, default values, validation and simple events.<br>
• Rules: callbacks run inside the persistence context: <b>do not call <code>EntityManager</code> operations or touch other entities</b> in them; they are <b>not triggered by bulk JPQL/native updates</b>. Hibernate adds <code>@CreationTimestamp</code>/<code>@UpdateTimestamp</code> and <code>@CurrentTimestamp</code>.`,
          `@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)                     // Spring Data JPA auditing
public abstract class Auditable {
    @CreatedDate @Column(updatable = false) private Instant createdAt;
    @LastModifiedDate private Instant updatedAt;
    @CreatedBy @Column(updatable = false) private String createdBy;
    @LastModifiedBy private String updatedBy;
}
@Configuration @EnableJpaAuditing
class AuditConfig {
    @Bean AuditorAware<String> auditor() { return () -> Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication()).map(Authentication::getName); }
}

@Entity
public class Course extends Auditable {
    @PrePersist void init() { if (slug == null) slug = Slug.of(title); }
    @PostLoad void afterLoad() { /* compute transient state */ }
}`,
        ),
      ],
      [
        blk(`<h3>Auditing: history of changes (Envers) and soft deletes</h3>
• <b>Hibernate Envers</b> (<code>hibernate-envers</code>, <code>@Audited</code>) records <b>every change</b> in <code>*_aud</code> tables with a revision number, so you can query history (<code>AuditReaderFactory.get(em).find(Course.class, id, revision)</code>) and who/when with a custom revision entity. Great for compliance; costs extra writes and storage.<br>
• <b>Soft delete</b>: instead of <code>DELETE</code>, mark the row deleted and hide it from queries. Hibernate 6.4+ provides <b><code>@SoftDelete</code></b>; older: <code>@SQLDelete(sql = "update course set deleted = true where id = ? and version = ?")</code> + <code>@SQLRestriction("deleted = false")</code> (<code>@Where</code> in older versions). Benefits: recovery, audit trail, referential integrity. Costs: every query must exclude deleted rows, unique constraints need to include the flag (or partial unique index), data grows (archive job).`,
          `@Entity
@Audited                                                           // Envers: course_aud table + revinfo
public class Course { @Id @GeneratedValue Long id; String title; BigDecimal price; }

AuditReader reader = AuditReaderFactory.get(em);
List<Number> revisions = reader.getRevisions(Course.class, courseId);
Course atRevision = reader.find(Course.class, courseId, revisions.get(0));

// Soft delete (Hibernate 6.4+)
@Entity
@SoftDelete                                                         // adds a 'deleted' column, rewrites DELETE to UPDATE, filters queries
public class Course { }

// Before 6.4
@Entity
@SQLDelete(sql = "update course set deleted = true where id = ?")
@SQLRestriction("deleted = false")
public class Course { private boolean deleted; }

-- partial unique index so a deleted slug can be reused (PostgreSQL)
CREATE UNIQUE INDEX uk_course_slug_active ON course (slug) WHERE deleted = false;`,
        ),
      ],
      [
        blk(`<h3>Hibernate filters</h3>
• A <b>filter</b> adds a <b>runtime-enabled WHERE condition</b> to entity loads and queries: <code>@FilterDef(name, parameters)</code> + <code>@Filter(name, condition)</code> on the entity, enabled per session with <code>session.enableFilter("name").setParameter(...)</code>. Use for <b>multi-tenant row filtering</b> (<code>tenant_id = :tenantId</code>), "active only", date visibility, and per-user data scopes.<br>
• Limits: filters apply to queries and entity loads but <b>not to <code>find()</code> by id</b> (older versions) and not to native SQL; enable them in a Spring <b>AOP aspect or request filter</b> inside the transaction (the session must be the same one used by the repositories).`,
          `@Entity
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = Long.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public class Invoice { @Id Long id; @Column(name = "tenant_id") Long tenantId; BigDecimal total; }

@Aspect @Component
class TenantFilterAspect {
    @PersistenceContext private EntityManager em;

    @Before("execution(* com.javaschoollab..service..*(..))")
    void enable() {
        Session s = em.unwrap(Session.class);                           // the transaction's session
        s.enableFilter("tenantFilter").setParameter("tenantId", TenantContext.current());
    }
}`,
        ),
      ],
      [
        ['What is the difference between entity listeners and Envers?', 'Listeners/callbacks run custom code at lifecycle events (timestamps, validation); Envers automatically stores a full history of every audited entity change in audit tables with revisions.'],
        ['How do you implement soft deletes?', 'Mark rows as deleted instead of deleting them and exclude them from queries: Hibernate 6.4+ @SoftDelete, or @SQLDelete (rewrites DELETE to UPDATE) with @SQLRestriction("deleted = false"); handle unique constraints with partial indexes.'],
        ['What are Hibernate filters used for?', 'To apply a parameterised WHERE condition to queries dynamically per session, for example tenant isolation, "active only" or visibility rules, enabled with session.enableFilter().'],
      ],
    ),
    topic(
      'hb-multitenancy-schema-procedures',
      'Multi-Tenancy, Schema Generation and Stored Procedures',
      [
        blk(`<h3>Multi-tenancy</h3>
• <b>Multi-tenancy</b> serves many customers (tenants) from one application. Isolation models: <b>database per tenant</b> (strongest isolation, costly), <b>schema per tenant</b> (good balance), <b>shared schema with a discriminator column</b> (<code>tenant_id</code>; cheapest, needs strict filtering; PostgreSQL <b>Row Level Security</b> adds protection).<br>
• Hibernate supports DATABASE/SCHEMA strategies with <code>CurrentTenantIdentifierResolver</code> (which tenant is this request?) and <code>MultiTenantConnectionProvider</code> (which connection/schema), and discriminator-based via <code>@TenantId</code> (Hibernate 6) or filters.<br>
• Keep the tenant in a request-scoped context (from the JWT/subdomain), propagate it to async tasks and run migrations per tenant.`,
          `// Hibernate 6: discriminator-based tenancy with @TenantId
@Entity
public class Invoice {
    @Id @GeneratedValue Long id;
    @TenantId @Column(name = "tenant_id") String tenant;               // set automatically on insert, added to every query
    BigDecimal total;
}

@Component
class TenantResolver implements CurrentTenantIdentifierResolver<String> {
    @Override public String resolveCurrentTenantIdentifier() { return Optional.ofNullable(TenantContext.get()).orElse("default"); }
    @Override public boolean validateExistingCurrentSessions() { return true; }
}
// spring.jpa.properties.hibernate.tenant_identifier_resolver=com.javaschoollab.TenantResolver

// schema-per-tenant: switch the schema on the connection
@Component
class SchemaProvider implements MultiTenantConnectionProvider<String> {
    public Connection getConnection(String tenant) throws SQLException { Connection c = ds.getConnection(); c.setSchema(tenant); return c; }
    public void releaseConnection(String tenant, Connection c) throws SQLException { c.setSchema("public"); c.close(); }
    /* other methods ... */
}`,
        ),
      ],
      [
        blk(`<h3>Database schema generation</h3>
• <code>spring.jpa.hibernate.ddl-auto</code> / <code>hibernate.hbm2ddl.auto</code>: <code>none</code>, <b><code>validate</code></b> (check entities vs schema: use in production), <code>update</code> (alters the schema: unsafe, cannot drop/rename, <b>never in production</b>), <code>create</code>, <code>create-drop</code> (tests with H2/Testcontainers). The JPA standard properties <code>jakarta.persistence.schema-generation.*</code> can <b>export scripts</b> (<code>create</code> / <code>drop</code> files) to bootstrap migrations.<br>
• Production practice: schema is owned by <b>Flyway/Liquibase migrations</b> (versioned, reviewed, repeatable); Hibernate only <b>validates</b>. Generate a first draft DDL from entities, then edit it by hand.`,
          `# development (throw-away database)
spring.jpa.hibernate.ddl-auto=create-drop
# tests with Testcontainers
spring.jpa.hibernate.ddl-auto=create
# production
spring.jpa.hibernate.ddl-auto=validate

# generate DDL scripts from entities (then move into Flyway)
spring.jpa.properties.jakarta.persistence.schema-generation.scripts.action=create
spring.jpa.properties.jakarta.persistence.schema-generation.scripts.create-target=build/schema.sql

// programmatic export
new SchemaExport().setFormat(true).setOutputFile("schema.sql").createOnly(EnumSet.of(TargetType.SCRIPT), metadata);`,
        ),
      ],
      [
        blk(`<h3>Stored procedures and functions</h3>
• Call database logic from JPA with <code>@NamedStoredProcedureQuery</code> or programmatically: <code>em.createStoredProcedureQuery("apply_discount")</code>, <code>registerStoredProcedureParameter(...)</code> (IN/OUT/INOUT/REF_CURSOR), <code>execute()</code>, <code>getOutputParameterValue(...)</code>. Spring Data: <code>@Procedure(procedureName = "apply_discount")</code>.<br>
• Alternatives for scalar functions: native query <code>select my_function(:x)</code>; Hibernate 6 can register custom functions (<code>FunctionContributor</code>) to use them in HQL.<br>
• Trade-offs: logic in the database is fast for set-based work and legacy systems, but hard to version/test/port; keep business rules in the application where possible; procedures run in the same transaction and connection as the persistence context (flush first).`,
          `@Entity
@NamedStoredProcedureQuery(name = "Course.applyDiscount", procedureName = "apply_discount",
    parameters = {
        @StoredProcedureParameter(mode = ParameterMode.IN, name = "p_level", type = String.class),
        @StoredProcedureParameter(mode = ParameterMode.IN, name = "p_percent", type = Integer.class),
        @StoredProcedureParameter(mode = ParameterMode.OUT, name = "p_updated", type = Integer.class) })
public class Course { }

@Transactional
public int applyDiscount(Level level, int percent) {
    em.flush();                                                       // make pending changes visible to the procedure
    StoredProcedureQuery q = em.createNamedStoredProcedureQuery("Course.applyDiscount");
    q.setParameter("p_level", level.name()).setParameter("p_percent", percent);
    q.execute();
    return (Integer) q.getOutputParameterValue("p_updated");
}

// Spring Data JPA
@Procedure(procedureName = "apply_discount", outputParameterName = "p_updated")
int applyDiscount(@Param("p_level") String level, @Param("p_percent") int percent);`,
        ),
      ],
      [
        ['Which multi-tenancy models exist?', 'Database per tenant (strong isolation), schema per tenant (good balance) and shared schema with a tenant discriminator column (cheapest, needs strict filtering such as @TenantId, filters or row-level security).'],
        ['Why shouldn\'t ddl-auto=update be used in production?', 'It cannot handle renames, drops or data migrations reliably and can change the schema unexpectedly. Use versioned Flyway/Liquibase migrations and set ddl-auto to validate.'],
        ['How do you call a stored procedure from Hibernate/JPA?', 'With @NamedStoredProcedureQuery or em.createStoredProcedureQuery, registering IN/OUT parameters and calling execute(); in Spring Data JPA use @Procedure on a repository method.'],
      ],
    ),
  ]),

  hb(10, 'Hibernate with Spring Boot', 'Essential', [
    topic(
      'hb-spring-data-repositories',
      'Spring Data JPA: Repository Interfaces, JpaRepository, Derived Queries, @Query and Native Queries',
      [
        blk(`<h3>Repository interfaces</h3>
• <b>Spring Data JPA</b> removes DAO boilerplate: declare an interface and Spring generates the implementation (a proxy backed by <code>SimpleJpaRepository</code>) using Hibernate/JPA.<br>
• Hierarchy: <code>Repository</code> (marker) → <code>CrudRepository</code> (<code>save</code>, <code>findById</code>, <code>findAll</code>, <code>deleteById</code>, <code>existsById</code>, <code>count</code>) → <code>ListCrudRepository</code>/<code>PagingAndSortingRepository</code> → <b><code>JpaRepository</code></b> (adds <code>flush</code>, <code>saveAndFlush</code>, <code>saveAll</code>, <code>deleteAllInBatch</code>, <code>getReferenceById</code>, <code>findAll(Sort)</code>, <code>findAll(Pageable)</code>) and <code>JpaSpecificationExecutor</code> for Specifications.<br>
• Enable with Spring Boot (auto-configured) or <code>@EnableJpaRepositories</code>; repositories are transactional by default (<code>readOnly</code> for reads, read-write for writes).`,
          `public interface CourseRepository extends JpaRepository<Course, Long> {
    // derived queries: generated from the method name
    List<Course> findByLevelOrderByTitleAsc(Level level);
    Optional<Course> findBySlug(String slug);
    List<Course> findByPriceBetweenAndLevelIn(BigDecimal min, BigDecimal max, Collection<Level> levels);
    List<Course> findByTitleContainingIgnoreCase(String text);
    boolean existsBySlug(String slug);
    long countByLevel(Level level);
    Page<Course> findByCategoryId(Long categoryId, Pageable pageable);
    List<Course> findTop5ByOrderByCreatedAtDesc();
    void deleteBySlug(String slug);
}

// usage
Course saved = repo.save(new Course("Hibernate", "hibernate", BigDecimal.TEN, Level.ADVANCED));
Optional<Course> maybe = repo.findById(1L);
List<Course> top = repo.findTop5ByOrderByCreatedAtDesc();`,
        ),
      ],
      [
        blk(`<h3>Derived query keywords</h3>
<table ${TABLE}>
<tr><th>Keyword</th><th>Example</th><th>JPQL</th></tr>
<tr><td><code>And / Or</code></td><td><code>findByLevelAndPriceLessThan</code></td><td><code>where level=?1 and price &lt; ?2</code></td></tr>
<tr><td><code>Between, GreaterThan, LessThanEqual</code></td><td><code>findByPriceBetween</code></td><td><code>price between ?1 and ?2</code></td></tr>
<tr><td><code>Like, Containing, StartingWith</code></td><td><code>findByTitleStartingWith</code></td><td><code>title like ?1%</code></td></tr>
<tr><td><code>In, NotIn</code></td><td><code>findByIdIn(Collection)</code></td><td><code>id in ?1</code></td></tr>
<tr><td><code>IsNull, IsNotNull</code></td><td><code>findByDeletedAtIsNull</code></td><td><code>deletedAt is null</code></td></tr>
<tr><td><code>OrderBy</code></td><td><code>findByLevelOrderByTitleDesc</code></td><td><code>order by title desc</code></td></tr>
<tr><td><code>Top / First, Distinct</code></td><td><code>findTop10ByOrderByPriceAsc</code></td><td><code>limit 10</code></td></tr>
<tr><td><code>exists / count / delete</code></td><td><code>existsByEmail</code>, <code>countByLevel</code>, <code>deleteByCourseId</code></td><td>exists / count / delete</td></tr>
<tr><td>Nested property</td><td><code>findByCategoryName</code> / <code>findByCategory_Name</code></td><td><code>c.category.name</code> (join)</td></tr>
</table>
• Long method names become unreadable: switch to <code>@Query</code> beyond 2-3 conditions. Startup validates derived names against properties (typos fail fast).`),
      ],
      [
        blk(`<h3>@Query, native queries and modifying queries</h3>
• <code>@Query("select c from Course c where ...")</code> with <b>named parameters</b> (<code>@Param</code>) or positional; SpEL: <code>#{#entityName}</code>; <code>nativeQuery = true</code> for SQL (add <code>countQuery</code> for pagination; interface projections for results).<br>
• <b>Modifying queries</b> (<code>update/delete</code>) need <code>@Modifying</code> (and run in a transaction: <code>@Transactional</code>); consider <code>clearAutomatically = true</code> because bulk statements bypass the persistence context.<br>
• Query hints (<code>@QueryHints</code>), locking (<code>@Lock</code>), fetching (<code>@EntityGraph</code>), projections (interface/record DTO), and <b>query by example</b> (<code>QueryByExampleExecutor</code>) for simple dynamic filters.`,
          `public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("select c from Course c join fetch c.category where c.level = :level and c.price <= :max")
    List<Course> search(@Param("level") Level level, @Param("max") BigDecimal max);

    @Query(value = "select * from course where match(title, description) against (:q in natural language mode)", nativeQuery = true)
    List<Course> fullText(@Param("q") String q);

    @Query(value = "select c.* from course c order by c.created_at desc",
           countQuery = "select count(*) from course", nativeQuery = true)
    Page<Course> latest(Pageable pageable);

    @Query("select new com.app.CourseStat(c.category.name, count(c), avg(c.price)) from Course c group by c.category.name")
    List<CourseStat> stats();

    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("update Course c set c.published = true where c.id in :ids")
    int publish(@Param("ids") Collection<Long> ids);
}`,
        ),
      ],
      [
        ['What does JpaRepository give you?', 'CRUD, paging and sorting methods plus JPA-specific operations (flush, saveAndFlush, deleteAllInBatch, getReferenceById) implemented automatically by Spring Data on top of Hibernate; you add query methods by naming convention or @Query.'],
        ['Derived query methods vs @Query?', 'Derived methods generate JPQL from the method name (good for 1-3 simple conditions); @Query gives explicit control for joins, projections, aggregates, native SQL and readability when names get long.'],
        ['Why does a @Modifying query need clearAutomatically?', 'Bulk update/delete statements bypass the persistence context, leaving managed entities stale; clearing (or refreshing) afterwards prevents reading outdated state.'],
      ],
    ),
    topic(
      'hb-specs-paging-dto',
      'Specifications, Pageable, Page vs Slice, DTO Mapping and Entity-to-DTO Conversion',
      [
        blk(`<h3>Specifications for dynamic queries</h3>
• A <b><code>Specification&lt;T&gt;</code></b> wraps a Criteria <code>Predicate</code>; extend the repository with <code>JpaSpecificationExecutor&lt;T&gt;</code> and combine specs with <code>and()</code>, <code>or()</code>, <code>not()</code>. Ideal for <b>search/filter screens</b> where any combination of filters may be supplied. Use the metamodel (<code>Course_.title</code>) for type safety. For very complex cases consider <b>Querydsl</b> or <b>jOOQ</b>.`,
          `public final class CourseSpecs {
    private CourseSpecs() {}
    public static Specification<Course> titleContains(String q) {
        return (root, cq, cb) -> q == null || q.isBlank() ? null : cb.like(cb.lower(root.get(Course_.title)), "%" + q.toLowerCase() + "%");
    }
    public static Specification<Course> level(Level level) {
        return (root, cq, cb) -> level == null ? null : cb.equal(root.get(Course_.level), level);
    }
    public static Specification<Course> priceAtMost(BigDecimal max) {
        return (root, cq, cb) -> max == null ? null : cb.lessThanOrEqualTo(root.get(Course_.price), max);
    }
    public static Specification<Course> inCategory(Long id) {
        return (root, cq, cb) -> id == null ? null : cb.equal(root.join(Course_.category, JoinType.INNER).get(Category_.id), id);
    }
}

interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {}

Page<Course> result = repo.findAll(
    Specification.where(CourseSpecs.titleContains(q)).and(CourseSpecs.level(level)).and(CourseSpecs.priceAtMost(max)).and(CourseSpecs.inCategory(cat)),
    PageRequest.of(page, size, Sort.by("title")));        // null specs are ignored`,
        ),
      ],
      [
        blk(`<h3>Pageable, Page vs Slice, Sort</h3>
• <code>Pageable</code> (<code>PageRequest.of(page, size, Sort)</code>, zero-based) lets any repository method paginate and sort; in controllers it is bound from <code>?page=0&amp;size=20&amp;sort=title,asc</code> (set a <b>maximum page size</b>: <code>spring.data.web.pageable.max-page-size=100</code>).<br>
<table ${TABLE}>
<tr><th></th><th><code>Page&lt;T&gt;</code></th><th><code>Slice&lt;T&gt;</code></th><th><code>List&lt;T&gt;</code> with Pageable</th></tr>
<tr><td>Count query</td><td><b>Yes</b> (extra <code>select count</code>)</td><td>No (fetches size+1 to know if there is a next)</td><td>No</td></tr>
<tr><td>Knows total elements/pages</td><td>Yes</td><td>No (<code>hasNext()</code> only)</td><td>No</td></tr>
<tr><td>Use</td><td>Numbered pagination UIs</td><td>Infinite scroll, "load more"</td><td>When you do not need metadata</td></tr>
</table>
• Return a stable DTO page (<code>PagedResponse</code>) rather than the Spring <code>Page</code> JSON (its shape changes between versions; Spring Data 3.3 warns about serialising <code>PageImpl</code> directly: use <code>PagedModel</code>/<code>@EnableSpringDataWebSupport(pageSerializationMode = VIA_DTO)</code>).`,
          `@GetMapping("/api/v1/courses")
public PagedModel<CourseSummary> list(@RequestParam(defaultValue = "") String q,
                                      @PageableDefault(size = 20, sort = "title") Pageable pageable) {
    return new PagedModel<>(service.search(q, pageable));              // stable JSON: content + page metadata
}

Slice<CourseSummary> findByLevel(Level level, Pageable pageable);    // no count query
Page<CourseSummary> findAllBy(Pageable pageable);

// application.properties
// spring.data.web.pageable.default-page-size=20
// spring.data.web.pageable.max-page-size=100
// spring.data.web.pageable.one-indexed-parameters=false

Sort sort = Sort.by(Sort.Order.desc("createdAt"), Sort.Order.asc("title"));
Pageable p = PageRequest.of(0, 20, sort);`,
        ),
      ],
      [
        blk(`<h3>DTO mapping and entity-to-DTO conversion</h3>
• <b>Never expose entities from controllers</b>: it leaks the schema, triggers lazy loading during JSON serialisation (<code>LazyInitializationException</code>/N+1), causes infinite recursion in bidirectional relations, couples API to persistence and allows <b>mass assignment</b> (clients setting fields like <code>role</code>). Use <b>DTOs</b> (Java <code>record</code>s) for requests and responses.<br>
• Conversion options: <b>manual</b> mapper methods (clear, fast, recommended for small apps), <b>MapStruct</b> (compile-time generated mappers: fast, type-safe; excellent default), ModelMapper (reflection: slower, runtime errors). Prefer <b>projections</b> for read models: select straight into DTOs and skip entities entirely.<br>
• Map <b>inside the transaction</b> (lazy associations available) or fetch what the DTO needs up front; map <b>incoming</b> DTOs to entities in the service, validating (<code>@Valid</code>) and never trusting ids or roles from the client.`,
          `public record CourseResponse(Long id, String title, BigDecimal price, Level level, String category, List<String> lessonTitles) {}
public record CreateCourseRequest(@NotBlank @Size(max = 150) String title, @NotNull @Positive BigDecimal price, @NotNull Level level, @NotNull Long categoryId) {}

@Mapper(componentModel = "spring")
public interface CourseMapper {
    @Mapping(target = "category", source = "category.name")
    @Mapping(target = "lessonTitles", expression = "java(c.getLessons().stream().map(Lesson::getTitle).toList())")
    CourseResponse toResponse(Course c);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)                         // resolved in the service via getReference
    Course toEntity(CreateCourseRequest r);
}

@Service
@RequiredArgsConstructor
class CourseService {
    private final CourseRepository courses; private final CategoryRepository categories; private final CourseMapper mapper;

    @Transactional(readOnly = true)
    public CourseResponse get(Long id) { return mapper.toResponse(courses.findWithDetails(id).orElseThrow(() -> new NotFoundException(id))); }

    @Transactional
    public CourseResponse create(CreateCourseRequest r) {
        Course c = mapper.toEntity(r);
        c.setCategory(categories.getReferenceById(r.categoryId()));      // no SELECT, just a reference
        return mapper.toResponse(courses.save(c));
    }
}`,
        ),
      ],
      [
        ['Page vs Slice?', 'Page executes an additional count query and exposes total elements and pages; Slice only fetches one extra row to know whether a next page exists, which is cheaper for infinite scroll.'],
        ['Why should entities not be returned directly from REST controllers?', 'It exposes the internal schema, can trigger lazy loading or N+1 during serialisation, causes recursion in bidirectional associations, couples the API to persistence and enables mass assignment. Return DTOs.'],
        ['What are Specifications for?', 'Composable, reusable Criteria predicates for dynamic filtering: you combine optional filters with and/or and pass the result to repository.findAll(spec, pageable).'],
      ],
    ),
    topic(
      'hb-boot-config-migrations',
      'Transactions, Database Configuration, Dialects, Flyway/Liquibase Migrations and Exception Handling',
      [
        blk(`<h3>Database configuration and dialects</h3>
• Spring Boot configures a <code>DataSource</code> (HikariCP), an <code>EntityManagerFactory</code> (Hibernate), a <code>JpaTransactionManager</code> and repositories from properties. Use <b>profiles</b> (<code>application-dev.yml</code>, <code>application-prod.yml</code>) and <b>environment variables / secrets</b> for credentials, never commit passwords.<br>
• <b>Dialect</b>: the class that generates database-specific SQL (pagination syntax, types, functions, identity/sequence support). <b>Hibernate 6 auto-detects</b> it from the JDBC metadata, so <b>do not set <code>hibernate.dialect</code></b> unless you must (custom dialect or version pinning). Known ones: <code>MySQLDialect</code>, <code>PostgreSQLDialect</code>, <code>OracleDialect</code>, <code>SQLServerDialect</code>, <code>H2Dialect</code> (Hibernate 6 removed version-specific subclasses such as <code>MySQL8Dialect</code>).`,
          `# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://\${DB_HOST:localhost}:5432/javaschoollab
    username: \${DB_USER}
    password: \${DB_PASSWORD}
    hikari: { maximum-pool-size: 15, connection-timeout: 5000 }
  jpa:
    open-in-view: false
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        jdbc.time_zone: UTC                       # store and read timestamps in UTC
        default_batch_fetch_size: 32
        jdbc.batch_size: 50
        order_inserts: true
        order_updates: true
  flyway:
    enabled: true
    locations: classpath:db/migration
# no hibernate.dialect: it is detected from the database metadata`,
        ),
      ],
      [
        blk(`<h3>Database migrations with Flyway or Liquibase</h3>
• <b>Migrations</b> version the schema as code: reviewed in pull requests, applied automatically on startup, identical in every environment. <b>Flyway</b>: SQL files named <code>V1__init.sql</code>, <code>V2__add_slug.sql</code> in <code>db/migration</code>, a <code>flyway_schema_history</code> table with checksums; repeatable <code>R__views.sql</code>. <b>Liquibase</b>: XML/YAML/JSON/SQL changelogs with changesets, rollbacks and contexts.<br>
• Rules: <b>never edit an applied migration</b> (checksum failure): add a new one; keep migrations <b>backward compatible</b> for rolling deployments (expand → migrate → contract: add a nullable column first, backfill, then enforce); test migrations on a copy of production; run with <code>ddl-auto=validate</code>; baseline existing databases (<code>baselineOnMigrate</code>).`,
          `-- src/main/resources/db/migration/V1__init.sql
CREATE TABLE category (id BIGSERIAL PRIMARY KEY, name VARCHAR(80) NOT NULL UNIQUE);
CREATE TABLE course (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  level VARCHAR(20) NOT NULL,
  category_id BIGINT NOT NULL REFERENCES category(id),
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX uk_course_slug ON course (slug);

-- V2__course_rating.sql: expand step (safe while the old app version still runs)
ALTER TABLE course ADD COLUMN rating NUMERIC(3,2);
-- V3__backfill_and_enforce.sql (after the new version is deployed)
UPDATE course SET rating = 0 WHERE rating IS NULL;
ALTER TABLE course ALTER COLUMN rating SET NOT NULL;`,
        ),
      ],
      [
        blk(`<h3>Exception handling</h3>
• Spring translates persistence exceptions into its <code>DataAccessException</code> hierarchy (via <code>@Repository</code> proxies): <code>DataIntegrityViolationException</code> (unique/foreign key/not null), <code>EmptyResultDataAccessException</code>, <code>IncorrectResultSizeDataAccessException</code>, <code>ObjectOptimisticLockingFailureException</code>, <code>CannotAcquireLockException</code>, <code>QueryTimeoutException</code>, <code>JpaSystemException</code>; Hibernate-specific: <code>LazyInitializationException</code>, <code>NonUniqueResultException</code>, <code>TransientObjectException</code>, <code>StaleObjectStateException</code>.<br>
• Handle them centrally with a <b><code>@RestControllerAdvice</code></b> mapping to HTTP statuses and clean messages (409 for conflicts/duplicates, 404, 422, 503 for pool exhaustion), <b>log the cause</b> and never leak SQL/constraint names to clients. Remember a transaction marked rollback-only: do not swallow exceptions inside <code>@Transactional</code> methods.`,
          `@RestControllerAdvice
class PersistenceErrorHandler {
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> integrity(DataIntegrityViolationException e) {
        log.warn("integrity violation", e);
        String msg = isUniqueViolation(e) ? "A record with the same value already exists." : "The request conflicts with existing data.";
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("CONFLICT", msg));
    }
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    ResponseEntity<ApiError> stale() {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError("STALE", "The record was modified by someone else. Reload and retry."));
    }
    @ExceptionHandler(EntityNotFoundException.class)
    ResponseEntity<ApiError> notFound(EntityNotFoundException e) { return ResponseEntity.status(404).body(new ApiError("NOT_FOUND", e.getMessage())); }
    @ExceptionHandler({CannotCreateTransactionException.class, QueryTimeoutException.class})
    ResponseEntity<ApiError> unavailable() { return ResponseEntity.status(503).header("Retry-After", "5").body(new ApiError("UNAVAILABLE", "Please retry shortly.")); }
}

private boolean isUniqueViolation(Exception e) {
    Throwable root = NestedExceptionUtils.getMostSpecificCause(e);
    return root instanceof SQLException s && ("23505".equals(s.getSQLState()) || s.getErrorCode() == 1062);      // PostgreSQL / MySQL duplicate key
}`,
        ),
      ],
      [
        ['Why not set hibernate.dialect in Hibernate 6?', 'Hibernate 6 detects the dialect automatically from the JDBC connection metadata, including the database version; setting it manually is only needed for custom dialects or to pin behaviour.'],
        ['Why use Flyway or Liquibase instead of ddl-auto=update?', 'Migrations give versioned, reviewed, repeatable schema changes with history and checksums; update cannot handle renames, drops or data migrations safely and behaves differently across environments.'],
        ['How should persistence exceptions be handled in a REST API?', 'Translate them centrally with @RestControllerAdvice: unique/FK violations and optimistic lock failures to 409, missing rows to 404, database unavailability to 503, logging the cause but not leaking SQL details to clients.'],
      ],
    ),
  ]),

  hb(11, 'Hibernate Interview Questions', 'Interview', [
    topic(
      'hb-interview-fundamentals',
      'Interview Q&A: Fundamentals and Core APIs (131-138)',
      [
        blk(`<h3>How to answer well</h3>
• Interviewers test <b>understanding, not memorisation</b>: give the definition, the <b>why</b>, a tiny example and a <b>pitfall</b> you have seen. For each answer below, practise explaining what SQL Hibernate generates and when it executes.<br>
• Questions covered here: What is Hibernate? What is ORM? Hibernate vs JPA, <code>get()</code> vs <code>load()</code> and modern alternatives, <code>persist()</code> vs <code>merge()</code>, <code>save()</code> vs <code>saveOrUpdate()</code>, first vs second-level cache, lazy vs eager loading.`),
      ],
      [
        blk(`<h3>Model answers</h3>
<table ${TABLE}>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Hibernate?</td><td>An ORM framework and JPA implementation that maps Java objects to tables, generates SQL, manages the persistence context, caching, lazy loading, dirty checking and transactions on top of JDBC.</td></tr>
<tr><td>What is ORM?</td><td>Object-Relational Mapping: automatic translation between an object model and a relational schema, solving the impedance mismatch (identity, inheritance, associations, types) so code works with objects instead of SQL and ResultSets.</td></tr>
<tr><td>Hibernate vs JPA?</td><td>JPA is the specification (API and annotations); Hibernate is an implementation with extra features. Code against JPA (EntityManager) to stay provider-independent and use Hibernate-specific APIs deliberately.</td></tr>
<tr><td><code>get()</code> vs <code>load()</code> (modern: <code>find()</code> vs <code>getReference()</code>)</td><td><code>get/find</code> returns the entity or <code>null</code>, hitting the database immediately if not cached. <code>load/getReference</code> returns a lazy proxy without a query and throws <code>EntityNotFoundException</code> on first access if absent; use it to set foreign keys cheaply.</td></tr>
<tr><td><code>persist()</code> vs <code>merge()</code></td><td><code>persist</code> makes a <b>transient</b> instance managed (same object, INSERT); <code>merge</code> copies a <b>detached/transient</b> state onto a managed copy and returns it (SELECT then INSERT/UPDATE); the argument stays unmanaged.</td></tr>
<tr><td><code>save()</code> vs <code>saveOrUpdate()</code></td><td>Legacy Hibernate: <code>save</code> always INSERTs and returns the id; <code>saveOrUpdate</code> decides insert/update from the id/version. Both are removed in Hibernate 6: use <code>persist()</code>/<code>merge()</code>; Spring Data's <code>save()</code> chooses based on <code>isNew()</code>.</td></tr>
<tr><td>First-level vs second-level cache</td><td>L1: per session/persistence context, mandatory, identity guarantee. L2: optional, shared across sessions of a SessionFactory, per entity, needs a provider; lookup L1 → L2 → DB.</td></tr>
<tr><td>Lazy vs eager loading</td><td>Lazy loads on first access (proxy/collection, needs open session); eager loads with the owner. Default: to-one eager, collections lazy; best practice: everything lazy and fetch explicitly per use case.</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Follow-up questions to expect</h3>
• "Show me the SQL for <code>find()</code> followed by <code>setPrice()</code>": one <code>SELECT</code> and, at commit, one <code>UPDATE</code> (dirty checking).<br>
• "What happens if you call <code>persist()</code> on a detached entity?" → <code>PersistenceException: detached entity passed to persist</code>.<br>
• "When would <code>getReference()</code> save you a query?" → when only the id is needed to set a foreign key (<code>enrollment.setCourse(em.getReference(...))</code>).<br>
• "Why is EAGER a problem?" → it cannot be turned off per query, causes N+1 and loads unneeded data.`,
          `// Be ready to write and explain this on a whiteboard
@Transactional
public void demo(Long id) {
    Course c = em.find(Course.class, id);              // SELECT ... WHERE id=?
    c.setTitle("Updated");                             // snapshot differs -> UPDATE at flush (no save() call)
    Enrollment e = new Enrollment();
    e.setCourse(em.getReference(Course.class, id));    // no SELECT: only the id is needed for the FK
    em.persist(e);                                     // INSERT enrollment(course_id, ...)
}`,
        ),
      ],
      [
        ['What is Hibernate?', 'An open-source ORM framework and JPA implementation that maps entities to tables and automates SQL generation, caching, lazy loading, dirty checking and transaction-bound persistence contexts on top of JDBC.'],
        ['get() vs load()?', 'get (find) returns the entity or null with an immediate query; load (getReference) returns a lazy proxy without a query and fails with an exception on first access if the row is missing.'],
        ['persist() vs merge()?', 'persist attaches a new entity (same instance, INSERT); merge copies detached or new state onto a managed instance and returns that copy, issuing a SELECT and an INSERT or UPDATE.'],
      ],
    ),
    topic(
      'hb-interview-advanced',
      'Interview Q&A: Performance, Concurrency and Troubleshooting (139-150)',
      [
        blk(`<h3>Questions 139-150</h3>
• What is the N+1 problem? What is dirty checking? What is the persistence context? What is cascading? What is orphan removal? What is optimistic locking? <code>flush()</code> vs <code>commit()</code>? <code>EntityManager</code> vs <code>Session</code>? How do you optimise slow queries? How do you handle bidirectional relationships? How does Hibernate generate SQL? How do you troubleshoot lazy initialization errors?<br>
• These are the senior-level questions: tie every answer to a <b>real incident</b> (a slow endpoint caused by N+1, a lost update fixed with <code>@Version</code>).`),
      ],
      [
        blk(`<h3>Model answers</h3>
<table ${TABLE}>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>N+1 problem</td><td>1 query for N parents plus N queries for a lazy association. Fix: fetch join, entity graph, batch fetching, DTO projection; detect with SQL logs/statistics and query-count assertions in tests.</td></tr>
<tr><td>Dirty checking</td><td>At flush Hibernate compares managed entities to their load-time snapshot and issues UPDATEs for changes, so no explicit save is needed; cost grows with managed entities (use read-only/projections/clear).</td></tr>
<tr><td>Persistence context</td><td>The set of managed entities of an EntityManager/Session: first-level cache, identity map, change tracker and write-behind action queue; transaction-scoped in Spring.</td></tr>
<tr><td>Cascading</td><td>Propagating persist/merge/remove/refresh/detach from parent to associated entities; use for composition only, never for shared aggregates or many-to-many removal.</td></tr>
<tr><td>Orphan removal</td><td>Deletes a child when it is removed from the parent's collection; stronger than cascade REMOVE; mutate the collection, do not replace it.</td></tr>
<tr><td>Optimistic locking</td><td><code>@Version</code> column added to UPDATE/DELETE predicates; a conflict gives <code>OptimisticLockException</code> (retry or HTTP 409); no database locks held.</td></tr>
<tr><td><code>flush()</code> vs <code>commit()</code></td><td><code>flush</code> sends pending SQL inside the transaction (still rollback-able); <code>commit</code> flushes then makes the transaction durable and visible.</td></tr>
<tr><td><code>EntityManager</code> vs <code>Session</code></td><td>EntityManager is the JPA standard; Session extends it with Hibernate-only features (filters, stateless/read-only modes, byNaturalId). Unwrap when needed.</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Optimising, bidirectional relationships, SQL generation and lazy errors</h3>
• <b>Optimise slow Hibernate queries</b>: (1) log the SQL and count statements; (2) fix N+1; (3) project only needed columns/DTOs; (4) paginate; (5) add or fix indexes using <code>EXPLAIN ANALYZE</code>; (6) batch writes (sequence ids, <code>batch_size</code>); (7) read-only transactions; (8) cache static data (L2) and measure hit ratio; (9) short transactions and a right-sized pool.<br>
• <b>Bidirectional relationships</b>: choose one owning side (FK), the other <code>mappedBy</code>; keep both in sync via helper methods; avoid collections in <code>equals/hashCode/toString</code>; return DTOs; prefer unidirectional <code>@ManyToOne</code> when you do not need to navigate both ways.<br>
• <b>How Hibernate generates SQL</b>: metadata from annotations builds the mapping model; HQL/JPQL (or Criteria) is parsed into a semantic query model (SQM), translated to the target <b>dialect</b>'s SQL AST and rendered as a <code>PreparedStatement</code>; entity operations create actions queued in the ActionQueue and executed at flush through JDBC; results are hydrated into entities and stored in the persistence context.<br>
• <b>Troubleshoot <code>LazyInitializationException</code></b>: read the stack to see which association and where it is accessed; ensure access happens inside the transaction or fetch it (join fetch/entity graph/DTO); do not fix with EAGER, <code>open-in-view</code> or <code>Hibernate.initialize</code> everywhere; check proxies passing through serialisation (Jackson) and logging.`,
          `// Diagnosing a lazy error
// org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: Course.lessons: could not initialize proxy - no Session
//
// 1. Who touches course.getLessons()? (controller? Jackson? toString? mapper outside the transaction?)
// 2. Fix at the source:
@Transactional(readOnly = true)
public CourseDetail detail(Long id) {
    Course c = repo.findWithLessons(id);                // join fetch / @EntityGraph
    return mapper.toDetail(c);                          // map INSIDE the transaction
}
// 3. Prove the fix: a test with a query-count assertion
SQLStatementCountValidator.reset();
service.detail(1L);
SQLStatementCountValidator.assertSelectCount(1);`,
        ),
      ],
      [
        ['How do you troubleshoot LazyInitializationException?', 'Find where the lazy association is accessed outside an open session, then fetch it in the query (join fetch, entity graph) or map to a DTO inside the transaction; avoid switching to EAGER or relying on Open Session In View.'],
        ['What is the difference between flush() and commit()?', 'flush writes pending changes to the database within the transaction (still uncommitted and rollback-able); commit flushes and then finalises the transaction, making changes durable and visible to others.'],
        ['How does Hibernate generate SQL?', 'It parses HQL/JPQL (or Criteria) into a semantic query model, renders it into dialect-specific SQL as a PreparedStatement, and for entity operations queues actions that are executed at flush through JDBC; results are hydrated into entities tracked by the persistence context.'],
      ],
    ),
  ]),
];
