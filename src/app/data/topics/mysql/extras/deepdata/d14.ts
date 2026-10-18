// Deep dive, module 43 (MySQL with Backend Applications).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d14: Record<string, Deep> = {
    'MySQL with Java & Spring Boot': dv(
        [`Spring Boot builds a <code>DataSource</code> from <code>spring.datasource.*</code> (HikariCP by default) using the MySQL Connector/J driver. Spring Data JPA sits on top: entities map to tables, repository interfaces generate queries, and Hibernate turns operations into SQL, managing a persistence context (first-level cache) and flushing changes at commit.`,
            r`# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/shop?sslMode=PREFERRED&rewriteBatchedStatements=true
spring.datasource.username=shop_app
spring.datasource.password=(from environment)
spring.datasource.hikari.maximum-pool-size=10
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false

-- OUTPUT:
-- HikariPool-1 - Start completed.`],
        [`Useful settings: Flyway/Liquibase for schema, <code>hibernate.jdbc.batch_size</code>, <code>order_inserts</code>, <code>default_batch_fetch_size</code>, read-only transactions for queries, <code>@EntityGraph</code> for fetch plans, projections (interfaces or records) for read endpoints, and <code>@Query(nativeQuery = true)</code> for SQL Hibernate cannot express.`,
            r`@Entity @Table(name = "orders")
class Order { @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id; Long customerId; BigDecimal total; }
interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable p);
    @Query(value = "SELECT customer_id, SUM(total) spent FROM orders GROUP BY customer_id", nativeQuery = true)
    List<Object[]> spentPerCustomer();
}

-- OUTPUT: (SQL)
-- select o.id, o.customer_id, o.total from orders o where o.customer_id=? order by o.created_at desc limit ?`],
        [`Mistakes: <code>ddl-auto=update</code> in production, open-in-view causing lazy loads in the web layer, N+1 queries, IDENTITY ids that disable batching, long transactions around remote calls, and entities returned directly from controllers. Validate the schema, use DTO projections and keep transactions in services.`,
            r`logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.orm.jdbc.bind=TRACE
spring.jpa.properties.hibernate.generate_statistics=true

-- OUTPUT: (statistics at the end of a request)
-- 101 JDBC statements executed   (1 + 100: an N+1 to fix with fetch join or batch fetching)`],
        [`Tune from the generated SQL: check indexes for each repository method, enable JDBC batching (<code>rewriteBatchedStatements</code>), size the pool to the database (cores x 2 as a start), and use second-level or application caches only for hot reference data.`,
            r`spring.jpa.properties.hibernate.jdbc.batch_size=500
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true
spring.jpa.properties.hibernate.default_batch_fetch_size=50

-- OUTPUT:
-- 10,000 inserts executed as 20 batches`],
        [`Real-world: a read endpoint uses an interface projection and a keyset page, avoiding entity loading and lazy associations entirely.`,
            r`interface OrderRow { Long getId(); BigDecimal getTotal(); LocalDateTime getCreatedAt(); }
@Query("select o.id as id, o.total as total, o.createdAt as createdAt from Order o where o.customerId = :c and (o.createdAt < :t or (o.createdAt = :t and o.id < :i)) order by o.createdAt desc, o.id desc")
List<OrderRow> page(@Param("c") Long c, @Param("t") LocalDateTime t, @Param("i") Long i, Pageable p);

-- OUTPUT: (SQL)
-- select o.id, o.total, o.created_at from orders o where o.customer_id=? and (o.created_at<? or (o.created_at=? and o.id<?)) order by ... limit ?`]
    ),

    'MySQL with Python & Django': dv(
        [`Django talks to MySQL through <code>mysqlclient</code> (C extension) or PyMySQL. The ORM builds queries lazily: a QuerySet does nothing until it is evaluated, then compiles to SQL. Migrations are Python files describing schema operations, applied in order and recorded in <code>django_migrations</code>.`,
            r`# settings.py
DATABASES = {"default": {
  "ENGINE": "django.db.backends.mysql", "NAME": "shop", "USER": "shop_app", "PASSWORD": "***", "HOST": "db", "PORT": "3306",
  "CONN_MAX_AGE": 60,
  "OPTIONS": {"charset": "utf8mb4", "init_command": "SET sql_mode='STRICT_TRANS_TABLES'"}}}
python manage.py migrate

-- OUTPUT:
-- Applying shop.0001_initial... OK`],
        [`Key tools: <code>select_related</code> (JOIN for foreign keys), <code>prefetch_related</code> (batched IN for reverse/many relations), <code>only/defer</code>, <code>values()</code> projections, <code>F()</code> and <code>Q()</code> expressions, <code>bulk_create/bulk_update</code>, <code>transaction.atomic()</code>, <code>select_for_update()</code>, raw SQL when needed.`,
            r`orders = Order.objects.select_related("customer").prefetch_related("items").filter(status="NEW").order_by("-created_at")[:20]
Account.objects.filter(id=1).update(balance=F("balance") - 100)
Order.objects.bulk_create([Order(customer_id=1, total=10), Order(customer_id=2, total=20)], batch_size=1000)
print(orders.query)

-- OUTPUT:
-- SELECT ... FROM orders INNER JOIN customers ON ... WHERE status = 'NEW' ORDER BY created_at DESC LIMIT 20`],
        [`Mistakes: N+1 in templates and serializers, iterating a huge queryset into memory, doing read-modify-write in Python (lost updates), and running long data migrations inside the schema migration. Use prefetching, <code>iterator()</code>, atomic updates and separate data migrations.`,
            r`for row in Event.objects.filter(kind="click").iterator(chunk_size=2000):
    process(row)
from django.test import TestCase
class T(TestCase):
    def test_list(self):
        with self.assertNumQueries(2):
            list(Order.objects.prefetch_related("items"))

-- OUTPUT:
-- (constant memory; the test fails with the executed queries if N+1 returns)`],
        [`Persistent connections (<code>CONN_MAX_AGE</code>) avoid reconnect cost but hold server threads; with many workers use a proxy pooler. Inspect SQL with <code>django.db.connection.queries</code> (debug) or logging, and compare plans with EXPLAIN.`,
            r`from django.db import connection
qs = Order.objects.filter(customer_id=7)
print(qs.explain())
print(len(connection.queries))

-- OUTPUT:
-- -> Index lookup on orders using idx_customer (customer_id=7)`],
        [`Real-world: a safe schema change. Add a nullable column in one migration, backfill in a separate management command in batches, then make it required in a later migration.`,
            r`python manage.py sqlmigrate shop 0012
python manage.py shell -c "from shop.models import Order; Order.objects.filter(channel__isnull=True, id__lte=10000).update(channel='WEB')"

-- OUTPUT:
-- ALTER TABLE shop_order ADD COLUMN channel varchar(10) NULL;
-- 10000`]
    ),

    'MySQL with Node.js, .NET, PHP & Go': dv(
        [`All drivers implement the MySQL wire protocol: connect, authenticate, send a command, read results. Each ecosystem has a pooling model: Node (<code>mysql2</code> pool), .NET (ADO.NET pool in <code>MySqlConnector</code>), PHP (a connection per request unless persistent), Go (<code>database/sql</code> pool). In all of them bind parameters and release connections.`,
            r`const mysql = require('mysql2/promise');
const pool = mysql.createPool({ host: 'db', user: 'shop_app', password: process.env.DB_PASS, database: 'shop', connectionLimit: 10, charset: 'utf8mb4' });
const [rows] = await pool.execute('SELECT id, name FROM users WHERE email = ?', [email]);

-- OUTPUT:
-- rows: [ { id: 1, name: 'Abaji' } ]`],
        [`Per-language essentials: Go <code>db.SetMaxOpenConns</code>, <code>SetMaxIdleConns</code>, <code>SetConnMaxLifetime</code>; .NET <code>MaxPoolSize</code> in the connection string; PHP PDO with <code>ERRMODE_EXCEPTION</code> and prepared statements; Node transactions through <code>getConnection()</code> and explicit commit/rollback.`,
            r`db, _ := sql.Open("mysql", "shop_app:***@tcp(db:3306)/shop?parseTime=true&charset=utf8mb4&loc=UTC")
db.SetMaxOpenConns(20); db.SetMaxIdleConns(10); db.SetConnMaxLifetime(30 * time.Minute)
var name string
err := db.QueryRow("SELECT name FROM users WHERE id = ?", 1).Scan(&name)
$pdo = new PDO('mysql:host=db;dbname=shop;charset=utf8mb4', 'shop_app', $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
await using var conn = new MySqlConnection("Server=db;Database=shop;User=shop_app;Password=***;MaximumPoolSize=20;");

-- OUTPUT:
-- name = "Abaji"`],
        [`Mistakes: forgetting to release connections (pool exhaustion), string concatenation for queries, time zone and charset left at defaults, unhandled transient errors (deadlock 1213, lost connection 2006/2013), and creating a new connection per request in long-lived services.`,
            r`const conn = await pool.getConnection();
try {
  await conn.beginTransaction();
  await conn.execute('UPDATE acct SET bal = bal - ? WHERE id = ?', [100, 1]);
  await conn.execute('UPDATE acct SET bal = bal + ? WHERE id = ?', [100, 2]);
  await conn.commit();
} catch (e) { await conn.rollback(); throw e; } finally { conn.release(); }

-- OUTPUT:
-- (both updates commit together; the connection always returns to the pool)`],
        [`Serverless and high-fan-out setups create many short-lived processes, each with its own pool; the database can run out of connections. Put a proxy (ProxySQL, RDS Proxy) in front, keep per-instance pools tiny, and reuse connections across invocations.`,
            r`SHOW GLOBAL STATUS LIKE 'Threads_connected';
SELECT user, COUNT(*) FROM information_schema.processlist GROUP BY user;

-- OUTPUT:
-- Threads_connected | 480        (200 function instances x pool of 2 plus others: use a connection proxy)`],
        [`Real-world retry helper: transient errors are retried a bounded number of times with backoff, while permanent errors (constraint violations) are not.`,
            r`async function withRetry(fn) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { return await fn(); }
    catch (e) { if (![1213, 1205, 2006, 2013].includes(e.errno) || attempt === 3) throw e; await sleep(50 * 2 ** attempt); }
  }
}

-- OUTPUT:
-- (succeeded on attempt 2 after a deadlock)`]
    ),

    'Connection Pooling': dv(
        [`Opening a MySQL connection costs a TCP handshake, optional TLS negotiation, authentication and a server thread. A pool opens connections once, hands them to requests and takes them back, so a request pays only the checkout. The pool also caps concurrency, protecting the database from overload.`,
            r`# HikariCP
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=3000
spring.datasource.hikari.max-lifetime=1500000
spring.datasource.hikari.leak-detection-threshold=20000

-- OUTPUT:
-- HikariPool-1 - Added connection com.mysql.cj.jdbc.ConnectionImpl@5f1a`],
        [`Settings every pool has: maximum size, minimum idle, checkout timeout, maximum lifetime (shorter than the server's <code>wait_timeout</code> and any proxy or firewall idle timeout), idle timeout, validation or keepalive, and leak detection.`,
            r`SELECT @@wait_timeout AS server_wait_timeout_seconds;
SELECT user, COUNT(*) AS total, SUM(command = 'Sleep') AS idle FROM information_schema.processlist WHERE user = 'shop_app' GROUP BY user;

-- OUTPUT:
-- server_wait_timeout_seconds
-- 28800
-- user     | total | idle
-- shop_app |    20 |   14`],
        [`Mistakes: pool larger than the database can run in parallel, summed pools above <code>max_connections</code>, connections that outlive firewall timeouts (broken pipe errors), long transactions holding connections, and forgetting to close (leaks).`,
            r`-- application log
-- HikariPool-1 - Connection is not available, request timed out after 3000ms.
SELECT 12 AS instances, 20 AS pool_each, 12 * 20 AS app_connections, @@max_connections AS max_connections;

-- OUTPUT:
-- instances | pool_each | app_connections | max_connections
--        12 |        20 |             240 |             300`],
        [`Sizing: a small pool (cores x 2 as a starting point) usually gives the best throughput; more connections than cores mostly add contention. Measure throughput and latency while varying the pool size.`,
            r`-- load test: pool 10 -> 4,800 rps, p99 22 ms;  pool 50 -> 4,900 rps, p99 61 ms;  pool 200 -> 4,100 rps, p99 190 ms
SELECT 10 AS best_pool_size;

-- OUTPUT:
-- best_pool_size
-- 10`],
        [`Real-world: many microservice instances share a database. Each service gets a pool cap; a proxy multiplexes the rest, and the total is tracked against <code>max_connections</code> with headroom.`,
            r`SELECT user, COUNT(*) AS conns FROM information_schema.processlist GROUP BY user ORDER BY conns DESC;
SHOW GLOBAL STATUS LIKE 'Max_used_connections';

-- OUTPUT:
-- user         | conns
-- orders_app   |    60
-- payments_app |    40
-- Max_used_connections | 214`]
    ),

    'Prepared Statements in Applications': dv(
        [`In application code a prepared statement separates the SQL template from the parameter values. Server-side prepares send a PREPARE (parsed and cached per connection) and then EXECUTE with typed parameters; client-side emulation builds the final text in the driver with safe escaping. Either way parameters are never interpreted as SQL.`,
            r`String sql = "INSERT INTO events (user_id, kind) VALUES (?, ?)";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    for (Event e : events) { ps.setLong(1, e.userId); ps.setString(2, e.kind); ps.addBatch(); }
    ps.executeBatch();
}

-- OUTPUT:
-- int[] update counts (one per row); with rewriteBatchedStatements=true sent as multi-row INSERTs`],
        [`Connector/J options: <code>useServerPrepStmts</code>, <code>cachePrepStmts</code>, <code>prepStmtCacheSize</code>, <code>prepStmtCacheSqlLimit</code>, <code>rewriteBatchedStatements</code>. Server limit: <code>max_prepared_stmt_count</code>. Python, Node and PHP drivers accept the same template-plus-parameters style.`,
            r`jdbc:mysql://db:3306/shop?useServerPrepStmts=true&cachePrepStmts=true&prepStmtCacheSize=250&prepStmtCacheSqlLimit=2048&rewriteBatchedStatements=true
SHOW GLOBAL STATUS LIKE 'Prepared_stmt_count';

-- OUTPUT:
-- Prepared_stmt_count | 412`],
        [`Mistakes: concatenating SQL for dynamic filters, using placeholders for table or column names (not allowed), unclosed statements (leaks hit the server limit), and different IN-list lengths creating many statements. Generate placeholders for lists and close statements with try-with-resources.`,
            r`# dynamic filters from fixed fragments, every value bound
clauses, params = [], []
if status: clauses.append("status = %s"); params.append(status)
if min_total: clauses.append("total >= %s"); params.append(min_total)
sql = "SELECT id FROM orders" + (" WHERE " + " AND ".join(clauses) if clauses else "") + " ORDER BY id LIMIT 50"
cur.execute(sql, params)

-- OUTPUT:
-- SELECT id FROM orders WHERE status = %s AND total >= %s ORDER BY id LIMIT 50`],
        [`Batching is the real performance feature: one prepared statement with many parameter sets, sent in a few round trips. Measure rows per second for single inserts versus batches of 500 to 1000.`,
            r`-- 100,000 rows: one by one 92 s;  addBatch/executeBatch (500) 6.4 s;  with rewriteBatchedStatements 2.1 s
SELECT ROUND(92 / 2.1) AS speedup;

-- OUTPUT:
-- speedup
-- 44`],
        [`Real-world: an import endpoint accepts a list of products, binds all values, and inserts them in batches with an upsert on the SKU so reruns are safe.`,
            r`INSERT INTO products (sku, name, price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price);

-- OUTPUT:
-- Query OK, 500 rows affected   (per batch)`]
    ),

    'Transactions in Applications': dv(
        [`An application transaction ties several statements to one connection: autocommit is turned off, statements run, then COMMIT or ROLLBACK. Frameworks automate it: Spring creates a proxy that starts the transaction at method entry, commits on normal return and rolls back on a RuntimeException; Django's <code>atomic()</code> uses a context manager (savepoints when nested).`,
            r`try (Connection c = ds.getConnection()) {
    c.setAutoCommit(false);
    try (PreparedStatement d = c.prepareStatement("UPDATE accounts SET balance = balance - ? WHERE id = ?");
         PreparedStatement k = c.prepareStatement("UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
        d.setBigDecimal(1, amt); d.setLong(2, 1); d.executeUpdate();
        k.setBigDecimal(1, amt); k.setLong(2, 2); k.executeUpdate();
        c.commit();
    } catch (SQLException e) { c.rollback(); throw e; }
}

-- OUTPUT:
-- both updates commit together, or both roll back`],
        [`Spring options: <code>@Transactional(readOnly = true)</code>, <code>propagation</code> (REQUIRED, REQUIRES_NEW, NESTED), <code>isolation</code>, <code>timeout</code>, <code>rollbackFor</code>. Programmatic control with <code>TransactionTemplate</code> avoids proxy pitfalls.`,
            r`@Service class TransferService {
    @Transactional(rollbackFor = Exception.class, timeout = 5)
    public void transfer(long from, long to, BigDecimal amt) { accounts.debit(from, amt); accounts.credit(to, amt); }
    @Transactional(readOnly = true) public List<Account> list() { return accounts.findAll(); }
}
txTemplate.execute(status -> { repo.save(a); return null; });

-- OUTPUT: (SQL)
-- set autocommit=0; update ...; update ...; commit`],
        [`Mistakes: self-invocation or private methods bypass the Spring proxy (no transaction), swallowed exceptions prevent rollback, checked exceptions do not roll back by default, remote calls inside the transaction, and open-session-in-view keeping connections busy. Put the boundary on a public service method and finish quickly.`,
            r`@Service class OrderService {
    public void place(Order o) { save(o); }                   // self-invocation: proxy skipped, NO transaction
    @Transactional public void save(Order o) { repo.save(o); }
}
// fix: move @Transactional to place(), or call through another bean

-- OUTPUT:
-- save() ran with autocommit: a failure after the first statement left partial data`],
        [`Keep transactions short: they hold row locks and an undo snapshot. Retry on deadlock (1213) and lock timeout (1205) with a bounded backoff, making operations idempotent so retries are safe.`,
            r`for (int attempt = 1; attempt <= 3; attempt++) {
    try { service.transfer(1, 2, amt); break; }
    catch (CannotAcquireLockException e) { if (attempt == 3) throw e; Thread.sleep(50L * attempt); }
}

-- OUTPUT:
-- succeeded on attempt 2 after a deadlock rollback`],
        [`Real-world: a database write plus a message to a broker. Writing the event to an outbox table in the same transaction guarantees both happen, and a relay publishes it afterwards.`,
            r`START TRANSACTION;
INSERT INTO orders (customer_id, total) VALUES (1, 500);
INSERT INTO outbox (event, payload) VALUES ('ORDER_CREATED', JSON_OBJECT('orderId', LAST_INSERT_ID()));
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`]
    ),

    'Repository Pattern': dv(
        [`A repository presents persisted objects as a collection: add, find, remove, query by intent. The service layer depends on the interface, while an implementation (Spring Data JPA proxy, JDBC, MyBatis) hides SQL and mapping. This isolates business rules from persistence and makes services testable with a fake.`,
            r`public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByEmail(String email);
}

-- OUTPUT: (generated SQL)
-- select ... from users u where u.email = ?
-- select ... from users u where u.status = ? order by u.created_at desc
-- select u.id from users u where u.email = ? limit 1`],
        [`Shapes: derived queries from method names, <code>@Query</code> (JPQL or native), specifications for dynamic filters, projections and DTOs, custom repository fragments, and read-only query classes separate from aggregate repositories (CQRS style).`,
            r`public interface OrderQueries {
    @Query("select new com.shop.OrderRow(o.id, c.name, o.total) from Order o join o.customer c where o.status = :s")
    List<OrderRow> byStatus(@Param("s") String status, Pageable page);
}
Specification<Order> spec = (root, q, cb) -> cb.and(cb.equal(root.get("status"), "NEW"), cb.ge(root.get("total"), 100));
orderRepo.findAll(spec, PageRequest.of(0, 20, Sort.by("createdAt").descending()));

-- OUTPUT:
-- select ... from orders o where o.status=? and o.total>=? order by o.created_at desc limit ?`],
        [`Mistakes: generic <code>findAll()</code> followed by filtering in Java, entities leaking into API responses, transactions inside repositories, and forcing complex reports into aggregate repositories. Push filters into queries, use DTOs and keep transactions in services.`,
            r`// bad: loads the whole table
List<User> active = repo.findAll().stream().filter(User::isActive).toList();
// good: filtered in the database
List<User> active2 = repo.findByStatus("ACTIVE");

-- OUTPUT:
-- bad: SELECT * FROM users (2.4M rows)    good: ... WHERE status = ? (4,100 rows)`],
        [`Repository methods map to queries you must index. Review the SQL of each method, add composite indexes to match them, and use pagination (preferably keyset) for list methods.`,
            r`ALTER TABLE users ADD INDEX idx_status_created (status, created_at);
EXPLAIN SELECT id, email FROM users WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 20;

-- OUTPUT: (example)
-- type | key                | Extra
-- ref  | idx_status_created | Backward index scan`],
        [`Real-world testability: services use a repository interface, so unit tests run against an in-memory fake in milliseconds, and integration tests use a real MySQL container.`,
            r`class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> data = new HashMap<>();
    public Optional<User> findById(Long id) { return Optional.ofNullable(data.get(id)); }
    public <S extends User> S save(S u) { data.put(u.getId(), u); return u; }
}
@Testcontainers class UserRepositoryIT { @Container static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0"); }

-- OUTPUT:
-- unit tests: 12 ms    integration tests: real MySQL 8.0 in a container`]
    ),

    'Pagination Strategies': dv(
        [`OFFSET pagination makes MySQL produce rows and discard the first <code>m</code>, so the cost of a page grows with its number. Keyset (seek) pagination remembers the last key of the previous page and asks for rows after it, so MySQL starts the index scan at that key and every page costs the same, and results stay stable while rows are inserted.`,
            r`EXPLAIN ANALYZE SELECT id FROM events ORDER BY id LIMIT 20 OFFSET 1000000;
EXPLAIN ANALYZE SELECT id FROM events WHERE id > 1000020 ORDER BY id LIMIT 20;

-- OUTPUT: (example)
-- offset: actual time=0.1..180 rows=1000020 scanned
-- keyset: actual time=0.04..0.1 rows=20 scanned`],
        [`Forms: OFFSET, keyset on a unique ordered key, keyset on (created_at, id) with a row comparison, "limit plus one" to detect a next page, deferred join for moderate offsets, and cursor tokens that encode the last key.`,
            r`SELECT id, title, created_at FROM posts WHERE (created_at, id) < ('2026-05-01 10:00:00', 120) ORDER BY created_at DESC, id DESC LIMIT 21;
SELECT p.* FROM posts p JOIN (SELECT id FROM posts ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET 100000) x ON x.id = p.id ORDER BY p.created_at DESC, p.id DESC;

-- OUTPUT:
-- 21 rows returned: show 20, hasNext = true`],
        [`Mistakes: OFFSET without a unique tiebreaker (duplicates or skips), exact COUNT(*) on every request, unbounded page size and depth in public APIs, and sorting by an unindexed column. Cap size and depth and index the sort.`,
            r`SELECT table_rows FROM information_schema.tables WHERE table_name = 'events';       -- approximate count, instant
-- cap in the API: size <= 100, page <= 100, then require a search filter
ALTER TABLE posts ADD INDEX idx_created_id (created_at, id);

-- OUTPUT:
-- table_rows
-- 48211034`],
        [`Keyset needs an index that matches the filter and sort, so the page is a short index range scan. Compare with the filesort that OFFSET queries often need.`,
            r`EXPLAIN SELECT id FROM posts WHERE user_id = 7 AND (created_at, id) < ('2026-05-01', 120) ORDER BY created_at DESC, id DESC LIMIT 20;

-- OUTPUT: (example)
-- type  | key              | Extra
-- range | idx_user_created | Backward index scan; Using index`],
        [`Real-world API: the response carries an opaque cursor; the next request sends it back, the server decodes it into the keyset predicate, and clients cannot jump to arbitrary pages but get stable, fast paging.`,
            r`-- cursor = base64({"c":"2026-05-01T10:00:00","i":120})
SELECT id, title, created_at FROM posts WHERE (created_at < ?) OR (created_at = ? AND id < ?) ORDER BY created_at DESC, id DESC LIMIT 21;

-- OUTPUT:
-- id  | title | created_at
-- 119 | ...   | 2026-05-01 09:58:00`]
    ),

    'N+1 Problem': dv(
        [`N+1 means one query loads a list and then one more query per row loads related data, so a page with 100 rows issues 101 queries. Each is a network round trip, so latency grows linearly with the result size and shows up only with realistic data. ORMs cause it through lazy loading in loops and serializers.`,
            r`// 1 query for the list + N queries, one per order
List<Order> orders = repo.findAll();
for (Order o : orders) { log.info(o.getCustomer().getName()); }     // lazy load per order

-- OUTPUT: (SQL log)
-- select o.* from orders o
-- select c.* from customers c where c.id=?     (repeated 100 times)`],
        [`Fixes: a JOIN fetch (<code>join fetch</code>, <code>@EntityGraph</code>, Django <code>select_related</code>) for to-one relations; batched IN loading (<code>@BatchSize</code>, <code>default_batch_fetch_size</code>, <code>prefetch_related</code>, <code>selectinload</code>) for collections; DTO projections that select exactly what is needed.`,
            r`@Query("select o from Order o join fetch o.customer")
List<Order> findAllWithCustomer();
@Entity class Order { @OneToMany(mappedBy = "order") @BatchSize(size = 50) List<Item> items; }
Order.objects.select_related("customer").prefetch_related("items")

-- OUTPUT: (SQL)
-- select o.*, c.* from orders o join customers c on c.id = o.customer_id
-- select ... from order_items where order_id in (?,?,...,?)     (50 parents per query)`],
        [`Mistakes: join-fetching two collections at once (Cartesian product), eager mappings everywhere, and fixing it without a test so it returns later. Fetch one collection per query and add a query-count assertion.`,
            r`with self.assertNumQueries(2):
    list(Order.objects.prefetch_related("items", "payments"))
# Hibernate: spring.jpa.properties.hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS=25

-- OUTPUT:
-- OK  (fails with the executed queries if the count changes)`],
        [`Detect it in production through the digest table: a tiny statement executed millions of times next to its parent query is the signature. Fix the code path, not the database.`,
            r`SELECT LEFT(digest_text, 50) AS q, count_star FROM performance_schema.events_statements_summary_by_digest ORDER BY count_star DESC LIMIT 2;

-- OUTPUT: (example)
-- q                                           | count_star
-- SELECT name FROM customers WHERE id = ?     |    4800210
-- SELECT id, customer_id FROM orders LIMIT ?  |      48002`],
        [`Real-world: a list endpoint went from 1.2 s to 40 ms after replacing per-row customer and item lookups with one join fetch and one batched IN query.`,
            r`SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.created_at >= '2026-05-01' ORDER BY o.id LIMIT 100;
SELECT order_id, sku, qty FROM order_items WHERE order_id IN (1, 2, 3, 4, 5);

-- OUTPUT:
-- 2 queries instead of 201`]
    ),

    'Lazy vs Eager Loading': dv(
        [`Lazy loading replaces a relation with a proxy or an uninitialized collection; the real query runs only when you first touch it, and only while a session or transaction is still open. Eager loading fetches the relation immediately, either with a JOIN in the same query or with a second query right away.`,
            r`@Entity class Order {
    @Id Long id;
    @ManyToOne(fetch = FetchType.LAZY) Customer customer;
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY) List<Item> items;
}
Order o = em.find(Order.class, 1L);          // select ... from orders where id=1
String n = o.getCustomer().getName();        // second query now: select ... from customers where id=?

-- OUTPUT:
-- 2 SQL statements, the second only because getName() was called`],
        [`Defaults differ (JPA: to-one eager, to-many lazy), so set <code>fetch = LAZY</code> on associations and load what a use case needs with <code>join fetch</code>, <code>@EntityGraph</code>, batch fetching or projections. Django does the same with <code>select_related</code> and <code>prefetch_related</code>.`,
            r`@EntityGraph(attributePaths = {"customer", "items"})
Optional<Order> findById(Long id);
@Query("select o from Order o join fetch o.customer where o.id = :id")
Optional<Order> findWithCustomer(@Param("id") Long id);

-- OUTPUT: (SQL)
-- select o.*, c.* from orders o left join customers c on c.id = o.customer_id where o.id = ?`],
        [`Mistakes: LazyInitializationException when accessing a lazy association after the transaction ended, global EAGER mappings that load huge graphs, and fetching several collections in one query. Return DTOs from services and fetch per use case.`,
            r`Order o = repo.findById(1L).get();       // transaction ended
o.getItems().size();

-- OUTPUT:
-- org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: Order.items, could not initialize proxy - no Session`],
        [`Eager loading of rarely used data wastes memory and I/O; lazy loading in loops multiplies queries. The right balance is per query. Measure statements per request and rows loaded.`,
            r`spring.jpa.properties.hibernate.generate_statistics=true
-- statistics: 3 queries, 412 entities loaded, 0 collection fetches

SELECT COUNT(*) FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id = 7);

-- OUTPUT:
-- COUNT(*)
-- 120`],
        [`Real-world: read APIs use projections that select only the needed columns, never touching entity associations, which makes lazy and eager questions irrelevant on hot paths.`,
            r`public record OrderView(Long id, String customerName, BigDecimal total) {}
@Query("select new com.shop.OrderView(o.id, c.name, o.total) from Order o join o.customer c where o.id = :id")
Optional<OrderView> view(@Param("id") Long id);

-- OUTPUT: (SQL)
-- select o.id, c.name, o.total from orders o join customers c on c.id = o.customer_id where o.id = ?`]
    ),

    'Database Migrations': dv(
        [`A migration tool keeps a history table (<code>flyway_schema_history</code>, <code>databasechangelog</code>, <code>django_migrations</code>) listing applied migrations with version and checksum. At startup or in the pipeline it applies pending migrations in order, once, and refuses to proceed if an applied script was modified.`,
            r`-- V1__create_orders.sql
CREATE TABLE orders (id BIGINT PRIMARY KEY AUTO_INCREMENT, customer_id BIGINT NOT NULL, total DECIMAL(10,2) NOT NULL);
-- V2__add_status.sql
ALTER TABLE orders ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'NEW', ALGORITHM=INSTANT;
SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;

-- OUTPUT:
-- version | description    | success
-- 1       | create orders  | 1
-- 2       | add status     | 1`],
        [`Practices: one logical change per migration (MySQL DDL is not transactional), repeatable migrations for views and routines, separate data migrations from schema changes, run migrations from a dedicated account in the pipeline, and test them on a copy of production-sized data.`,
            r`-- R__views.sql (repeatable: re-applied when its checksum changes)
CREATE OR REPLACE VIEW report_orders AS SELECT id, customer_id, total FROM orders;
-- run in CI against a real MySQL container
flyway -url=jdbc:mysql://localhost:3306/shop -user=migrate -password=*** migrate

-- OUTPUT:
-- Successfully applied 2 migrations to schema shop (execution time 00:00.081s)`],
        [`Mistakes: editing an applied migration (checksum failure), a blocking ALTER on a big table at peak, dropping a column that the previous application version still reads, and no rollback plan. Use backward-compatible steps and online DDL.`,
            r`ALTER TABLE orders ADD COLUMN channel VARCHAR(10) NULL, ALGORITHM=INSTANT;
SET SESSION lock_wait_timeout = 5;
ALTER TABLE orders ADD INDEX idx_channel (channel), ALGORITHM=INPLACE, LOCK=NONE;

-- OUTPUT:
-- Query OK, 0 rows affected   (or a fast failure if it cannot run online)`],
        [`Large tables need online schema change. Use gh-ost or pt-online-schema-change with throttling on replica lag, and track progress; backfill data in batches outside the DDL.`,
            r`gh-ost --host=db --user=ghost --password=*** --database=shop --table=orders --alter="ADD COLUMN note VARCHAR(100)" --max-lag-millis=1500 --chunk-size=1000 --execute

-- OUTPUT: (progress)
-- Copy: 8200000/8200000 100.0%; Applied: 0; Backlog: 0/1000; Time: 12m3s; ETA: due`],
        [`Real-world expand/contract rename: add the new column, deploy code that writes both, backfill, switch reads, then drop the old column in a later release, keeping every release compatible with the previous schema so rollbacks are safe.`,
            r`ALTER TABLE users ADD COLUMN full_name VARCHAR(120) NULL, ALGORITHM=INSTANT;
UPDATE users SET full_name = name WHERE full_name IS NULL AND id BETWEEN 1 AND 10000;
-- release N+1 reads full_name; release N+2:
ALTER TABLE users DROP COLUMN name;

-- OUTPUT:
-- Query OK, 10000 rows affected`]
    )
};
