// Deep dive, modules 44-45 (ORM & MySQL, Database Design for Real Projects).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d15: Record<string, Deep> = {
    'JPA, Hibernate & Spring Data JPA': dv(
        [`JPA is a specification; Hibernate implements it; Spring Data JPA generates repository implementations on top. Hibernate keeps a persistence context per transaction: entities loaded or saved are tracked (managed), changes are detected by comparing snapshots (dirty checking) and flushed as INSERT, UPDATE and DELETE statements at flush or commit.`,
            r`@Entity @Table(name = "products")
class Product { @Id @GeneratedValue(strategy = GenerationType.SEQUENCE) Long id; String name; BigDecimal price; }

@Transactional
public void rename(Long id, String name) {
    Product p = repo.findById(id).orElseThrow();    // select
    p.setName(name);                                  // no explicit save needed
}                                                      // update products set name=?, price=? where id=?  (at commit)

-- OUTPUT: (SQL)
-- select p1_0.id, p1_0.name, p1_0.price from products p1_0 where p1_0.id=?
-- update products set name=?, price=? where id=?`],
        [`Controls: entity states (transient, managed, detached, removed), flush modes, <code>@Version</code> for optimistic locking, <code>@DynamicUpdate</code> (only changed columns), cascade types, <code>@Modifying</code> bulk updates, native queries, second-level cache, ID generators (IDENTITY disables insert batching).`,
            r`@Entity class Doc { @Id Long id; String body; @Version int version; }
@DynamicUpdate @Entity class Account { @Id Long id; BigDecimal balance; String note; }
@Modifying @Query("update Product p set p.price = p.price * 1.1 where p.category = :c")
int raisePrices(@Param("c") String c);

-- OUTPUT: (SQL)
-- update doc set body=?, version=? where id=? and version=?          (0 rows updated => OptimisticLockException)
-- update products set price=price*1.1 where category=?`],
        [`Mistakes: relying on lazy loading in the web layer, N+1 queries, merging detached entities blindly, IDENTITY ids with large batches, huge persistence contexts in batch jobs (memory), and bulk updates that bypass the persistence context leaving stale entities. Flush and clear in batches, and refresh after bulk updates.`,
            r`for (int i = 0; i < items.size(); i++) {
    em.persist(items.get(i));
    if (i % 500 == 0) { em.flush(); em.clear(); }       // keep the persistence context small
}

-- OUTPUT:
-- constant memory while inserting 1 million rows in batches of 500`],
        [`Always read the generated SQL and check indexes. Enable statistics to see statement counts, and use <code>EXPLAIN</code> on slow ones. Batch settings and fetch strategies decide most of the performance.`,
            r`spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.batch_size=500
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.generate_statistics=true

-- OUTPUT: (statistics)
-- 10000 entities inserted in 20 JDBC batches`],
        [`Real-world: use JPA for transactional writes and simple reads, and drop to SQL (jOOQ, JdbcTemplate, native queries) for reports and bulk operations, keeping each tool where it is strongest.`,
            r`@Query(value = "SELECT DATE(created_at) AS day, SUM(total) AS revenue FROM orders WHERE created_at >= :from GROUP BY DATE(created_at)", nativeQuery = true)
List<DailyRevenue> revenue(@Param("from") LocalDate from);

-- OUTPUT:
-- day        | revenue
-- 2026-05-01 | 120450.00`]
    ),

    'SQLAlchemy & Django ORM': dv(
        [`Django ORM is built in and opinionated: models define tables, QuerySets are lazy and chainable, and the compiler produces SQL when evaluated. SQLAlchemy has two layers: Core (SQL expression language) and ORM (unit of work with a Session identity map). Both generate parameterized SQL and manage connections through pools.`,
            r`qs = Order.objects.select_related("customer").filter(status="NEW").order_by("-created_at")[:20]
print(qs.query)

stmt = select(Order).options(selectinload(Order.items)).where(Order.status == "NEW").limit(20)
orders = session.scalars(stmt).all()

-- OUTPUT: (SQL)
-- SELECT ... FROM orders INNER JOIN customers ON ... WHERE status = 'NEW' ORDER BY created_at DESC LIMIT 20
-- SELECT ... FROM orders WHERE status = %s LIMIT %s ;  SELECT ... FROM order_items WHERE order_id IN (%s, %s, ...)`],
        [`Toolbox: Django <code>F()</code>, <code>Q()</code>, <code>annotate/aggregate</code>, <code>Subquery/Exists</code>, <code>bulk_*</code>, <code>transaction.atomic</code>, <code>select_for_update</code>; SQLAlchemy loader options (<code>selectinload</code>, <code>joinedload</code>), <code>session.execute(text(...))</code>, <code>yield_per</code>, Alembic migrations.`,
            r`from django.db.models import F, Q, Sum
Account.objects.filter(id=1).update(balance=F("balance") - 100)
Order.objects.filter(Q(status="NEW") | Q(total__gt=1000)).aggregate(total=Sum("total"))
for row in session.execute(select(Event).where(Event.kind == "click").execution_options(yield_per=2000)):
    process(row)

-- OUTPUT: (SQL)
-- UPDATE accounts SET balance = (balance - 100) WHERE id = 1`],
        [`Mistakes: loading whole tables into memory, read-modify-write in Python (lost updates), N+1 in templates or serializers, and relying on lazy relations after the session closes (DetachedInstanceError). Use atomic expressions, prefetching and chunked iteration.`,
            r`for e in Event.objects.filter(kind="click").iterator(chunk_size=2000):
    process(e)
with self.assertNumQueries(2):
    list(Order.objects.prefetch_related("items"))

-- OUTPUT:
-- (flat memory; the test fails with the executed SQL when the query count changes)`],
        [`Check the SQL with <code>queryset.explain()</code> or SQLAlchemy echo, then EXPLAIN it. Remember connection pooling: Django uses <code>CONN_MAX_AGE</code>; SQLAlchemy has a built-in pool (<code>pool_size</code>, <code>max_overflow</code>, <code>pool_recycle</code>).`,
            r`print(Order.objects.filter(customer_id=7).explain())
engine = create_engine("mysql+pymysql://shop_app:***@db/shop?charset=utf8mb4", pool_size=10, max_overflow=5, pool_recycle=1500, pool_pre_ping=True)

-- OUTPUT:
-- -> Index lookup on orders using idx_customer (customer_id=7)`],
        [`Real-world: a service uses the ORM for CRUD and a few raw, reviewed SQL statements for analytics, wrapped in repository functions with tests that check query counts.`,
            r`rows = session.execute(text("SELECT customer_id, SUM(total) AS spent FROM orders WHERE created_at >= :since GROUP BY customer_id ORDER BY spent DESC LIMIT 10"), {"since": since}).all()

-- OUTPUT:
-- [(7, Decimal('48200.00')), (3, Decimal('39000.00'))]`]
    ),

    'Prisma, Sequelize & TypeORM': dv(
        [`Node ORMs map models to tables and build SQL through a query API. Prisma has a schema file and generates a typed client with its own query engine; Sequelize and TypeORM use JavaScript/TypeScript classes (decorators in TypeORM). All of them use a connection pool and send parameterized statements.`,
            r`model Order { id Int @id @default(autoincrement()) customerId Int total Decimal @db.Decimal(10,2) items Item[] @@index([customerId, createdAt]) }

const orders = await prisma.order.findMany({ where: { customerId: 7 }, include: { items: true }, orderBy: { id: 'desc' }, take: 20 });

-- OUTPUT: (SQL)
-- SELECT ... FROM orders WHERE customerId = 7 ORDER BY id DESC LIMIT 20
-- SELECT ... FROM items WHERE orderId IN (...)`],
        [`Features: relations and includes (joins or batched queries), transactions (<code>prisma.$transaction</code>, Sequelize <code>sequelize.transaction</code>, TypeORM <code>QueryRunner</code>), raw SQL escape hatches, migrations (<code>prisma migrate</code>, sequelize-cli, TypeORM migrations), and logging.`,
            r`await prisma.$transaction([
  prisma.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } }),
  prisma.account.update({ where: { id: 2 }, data: { balance: { increment: 100 } } }),
]);
const rows = await prisma.$queryRawUnsafe('SELECT customer_id, SUM(total) AS spent FROM orders GROUP BY customer_id LIMIT 10');
const prisma2 = new PrismaClient({ log: ['query'] });

-- OUTPUT: (SQL)
-- BEGIN; UPDATE accounts SET balance = balance - 100 WHERE id = 1; UPDATE ... ; COMMIT`],
        [`Mistakes: over-fetching with nested includes, N+1 through per-item queries in loops, forgetting indexes behind relation filters, running migrations automatically in every instance at startup, and unsafe raw queries built from strings. Select needed fields, batch, and run migrations as a separate job.`,
            r`const names = await prisma.user.findMany({ select: { id: true, name: true } });                 // not the whole row
const ids = orders.map(o => o.customerId);
const customers = await prisma.customer.findMany({ where: { id: { in: ids } } });                  // one batched query

-- OUTPUT: (SQL)
-- SELECT id, name FROM users
-- SELECT ... FROM customers WHERE id IN (1, 2, 3, ...)`],
        [`Pool and engine settings matter in serverless runtimes: many short-lived instances can exhaust <code>max_connections</code>. Use a connection proxy, cap the pool (<code>connection_limit</code> in the URL) and reuse the client across invocations.`,
            r`DATABASE_URL="mysql://shop_app:***@proxy:3306/shop?connection_limit=5&pool_timeout=10"

-- OUTPUT:
-- each instance holds at most 5 connections; the proxy multiplexes them to the database`],
        [`Real-world: a Prisma service logs queries in staging, a CI test counts queries per endpoint, and slow ones are explained against a production-sized copy.`,
            r`prisma.$on('query', e => { if (e.duration > 50) logger.warn(e.query, e.params, e.duration); });
EXPLAIN SELECT id, total FROM orders WHERE customerId = 7 ORDER BY id DESC LIMIT 20;

-- OUTPUT: (example)
-- type | key          | Extra
-- ref  | idx_customer | Backward index scan`]
    ),

    'Inspecting the SQL an ORM Generates': dv(
        [`Every ORM call becomes SQL text plus bound parameters. The way to understand cost is to capture that SQL (ORM logging, the MySQL general log in development, Performance Schema digests in production) and run EXPLAIN on it. The database does not care which framework produced a statement; only the plan matters.`,
            r`spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.orm.jdbc.bind=TRACE

-- OUTPUT:
-- select o1_0.id, o1_0.total from orders o1_0 where o1_0.customer_id=?
-- binding parameter (1:BIGINT) <- [7]`],
        [`Capture points: framework logs (Hibernate, Django <code>django.db.backends</code>, SQLAlchemy echo, Prisma log), the driver (<code>logger=Slf4JLogger</code> in Connector/J), MySQL slow log and digests, APM traces. Add SQL comments with request or route names to link statements to code.`,
            r`/* route=orders.list user_tier=pro */ SELECT id, total FROM orders WHERE customer_id = 7 LIMIT 20;
SET GLOBAL general_log = 'ON';   -- development only, briefly
SELECT event_time, argument FROM mysql.general_log ORDER BY event_time DESC LIMIT 2;
SET GLOBAL general_log = 'OFF';

-- OUTPUT:
-- (comment visible in slow log and digest samples)`],
        [`Mistakes: logging SQL only in development, reviewing statements without parameters, the general log on production (heavy), and fixing symptoms in the ORM layer when an index is missing. Review generated SQL as part of code review for new endpoints.`,
            r`EXPLAIN ANALYZE SELECT o.id, o.total FROM orders o WHERE o.customer_id = 7 AND o.status = 'NEW' ORDER BY o.created_at DESC LIMIT 20;

-- OUTPUT: (example)
-- -> Sort: o.created_at DESC (actual time=92..92 rows=20)  -> Index lookup on o using idx_customer (rows=14000)
-- => needs idx (customer_id, status, created_at)`],
        [`Quantify per endpoint: statements per request, rows examined, total database time. A test harness can assert budgets so regressions fail the build.`,
            r`SELECT LEFT(digest_text, 60) AS q, count_star, ROUND(sum_rows_examined / count_star) AS rows_examined_avg FROM performance_schema.events_statements_summary_by_digest WHERE schema_name = 'shop' ORDER BY sum_timer_wait DESC LIMIT 3;

-- OUTPUT:
-- q                                          | count_star | rows_examined_avg
-- select o1_0 . id , o1_0 . total from orders| 912000     |             18400`],
        [`Real-world: tracing a slow API call from the APM span to the SQL statement, to its EXPLAIN, to the missing index, to the migration that fixed it.`,
            r`ALTER TABLE orders ADD INDEX idx_cust_status_created (customer_id, status, created_at), ALGORITHM=INPLACE, LOCK=NONE;
EXPLAIN ANALYZE SELECT o.id, o.total FROM orders o WHERE o.customer_id = 7 AND o.status = 'NEW' ORDER BY o.created_at DESC LIMIT 20;

-- OUTPUT:
-- -> Index lookup on o using idx_cust_status_created (reverse)  (actual time=0.04..0.1 rows=20)`]
    ),

    'E-commerce Schema': dv(
        [`An e-commerce database has customers, a catalog (categories, products, variants), inventory, carts, orders with order items, payments, shipments and addresses. The central rule: an order records what happened at the time (prices, addresses, tax) and must not change when the catalog changes, so order items snapshot values.`,
            r`CREATE TABLE products (id BIGINT PRIMARY KEY AUTO_INCREMENT, sku VARCHAR(30) NOT NULL UNIQUE, name VARCHAR(120) NOT NULL, price DECIMAL(10,2) NOT NULL, category_id INT, active BOOLEAN NOT NULL DEFAULT TRUE, KEY idx_cat_active (category_id, active, price));
CREATE TABLE orders (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, status VARCHAR(12) NOT NULL DEFAULT 'NEW', total DECIMAL(12,2) NOT NULL, created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), KEY idx_user_created (user_id, created_at));
CREATE TABLE order_items (order_id BIGINT, line_no INT, product_id BIGINT NOT NULL, qty INT NOT NULL CHECK (qty > 0), unit_price DECIMAL(10,2) NOT NULL, PRIMARY KEY (order_id, line_no), FOREIGN KEY (order_id) REFERENCES orders(id));

-- OUTPUT:
-- Query OK, 0 rows affected (x3)`],
        [`Design options: variants as a separate table with its own SKU and stock, categories as an adjacency list or closure table, prices in a price-history table, addresses as snapshots on the order, payments as an append-only ledger with idempotency keys, inventory with reservations that expire.`,
            r`CREATE TABLE inventory (sku VARCHAR(30) PRIMARY KEY, on_hand INT NOT NULL CHECK (on_hand >= 0), reserved INT NOT NULL DEFAULT 0 CHECK (reserved >= 0));
CREATE TABLE payments (id BIGINT PRIMARY KEY AUTO_INCREMENT, order_id BIGINT NOT NULL, idempotency_key CHAR(36) NOT NULL, amount DECIMAL(12,2) NOT NULL, status VARCHAR(10) NOT NULL, UNIQUE KEY uq_idem (idempotency_key), KEY idx_order (order_id));
UPDATE inventory SET reserved = reserved + 2 WHERE sku = 'PEN-1' AND on_hand - reserved >= 2;

-- OUTPUT:
-- Query OK, 1 row affected        (0 rows means insufficient stock)`],
        [`Mistakes: reading the current product price for old orders, decrementing stock with read-then-write (overselling), storing money in floats, no idempotency on payments (double charges on retry), and one wide orders table that mixes unrelated concerns. Use snapshots, conditional updates and unique keys.`,
            r`START TRANSACTION;
UPDATE inventory SET on_hand = on_hand - 2 WHERE sku = 'PEN-1' AND on_hand >= 2;
INSERT INTO orders (user_id, total) VALUES (1, 20.00);
INSERT INTO order_items VALUES (LAST_INSERT_ID(), 1, 7, 2, 10.00);
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`],
        [`Hot paths: product listing (category plus active plus price), order history (user plus time), inventory updates (single row), best-sellers (aggregation). Index for each, cache the catalog, and keep the orders path lean. Partition or archive old orders by date.`,
            r`EXPLAIN SELECT id, name, price FROM products WHERE category_id = 5 AND active = 1 ORDER BY price LIMIT 24;
EXPLAIN SELECT id, total FROM orders WHERE user_id = 1 ORDER BY created_at DESC LIMIT 20;

-- OUTPUT: (example)
-- first : key=idx_cat_active  second: key=idx_user_created  (both without filesort)`],
        [`Real-world reports: best sellers last 30 days and revenue by day, from the order items snapshot (not the current prices).`,
            r`SELECT p.name, SUM(oi.qty) AS sold, SUM(oi.qty * oi.unit_price) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= NOW() - INTERVAL 30 DAY AND o.status = 'PAID' GROUP BY p.id, p.name ORDER BY sold DESC LIMIT 5;

-- OUTPUT:
-- name | sold | revenue
-- Pen  |  420 | 4200.00`]
    ),

    'Banking Schema': dv(
        [`A banking schema is built for correctness and audit: customers, accounts, an immutable ledger of postings, transfers, and beneficiaries. Money uses DECIMAL; a balance is either derived from the ledger or stored and updated in the same transaction as the ledger entries, and the two are reconciled. Records are never deleted, only closed or reversed.`,
            r`CREATE TABLE accounts (id BIGINT PRIMARY KEY AUTO_INCREMENT, customer_id BIGINT NOT NULL, balance DECIMAL(14,2) NOT NULL DEFAULT 0, status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE', CHECK (balance >= 0));
CREATE TABLE ledger (id BIGINT PRIMARY KEY AUTO_INCREMENT, txn_ref VARCHAR(40) NOT NULL, account_id BIGINT NOT NULL, amount DECIMAL(14,2) NOT NULL, posted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), UNIQUE KEY uq_ref_acct (txn_ref, account_id), KEY idx_acct_time (account_id, posted_at));

-- OUTPUT:
-- Query OK, 0 rows affected (x2)`],
        [`Patterns: double-entry bookkeeping (every transaction has balanced debit and credit entries), reversal entries instead of updates, idempotency references per transaction, optimistic <code>version</code> or pessimistic row locks on accounts, holds (authorisations) separate from postings, and strict isolation for balance changes.`,
            r`START TRANSACTION;
SELECT id FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;                  -- consistent lock order
UPDATE accounts SET balance = balance - 500 WHERE id = 1;                          -- CHECK stops overdraft
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
INSERT INTO ledger (txn_ref, account_id, amount) VALUES ('T-1001', 1, -500), ('T-1001', 2, 500);
COMMIT;

-- OUTPUT:
-- Query OK, 2 rows affected`],
        [`Mistakes: updating or deleting ledger rows, floating point money, balance changes outside the transaction that writes the ledger, missing idempotency (retries double post), and locking accounts in different orders (deadlocks). Make the ledger append-only and enforce it with privileges or triggers.`,
            r`REVOKE UPDATE, DELETE ON bank.ledger FROM 'bank_app'@'%';
INSERT INTO ledger (txn_ref, account_id, amount) VALUES ('T-1001', 1, -500);

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'T-1001-1' for key 'ledger.uq_ref_acct'     (retry did not post twice)`],
        [`Hot accounts (a merchant receiving thousands of payments) serialize on one row. Reduce contention with batched postings, per-currency or sub-accounts, and by deriving some balances from the ledger. Index ledger by (account, time) for statements.`,
            r`SELECT account_id, COUNT(*) AS postings FROM ledger WHERE posted_at >= NOW() - INTERVAL 1 HOUR GROUP BY account_id ORDER BY postings DESC LIMIT 2;

-- OUTPUT:
-- account_id | postings
-- 9001       |    41200       (a hot account: consider sub-accounts)`],
        [`Real-world controls: every transaction nets to zero, the stored balance equals the ledger sum, and the checks run continuously.`,
            r`SELECT txn_ref, SUM(amount) AS net FROM ledger GROUP BY txn_ref HAVING net <> 0;
SELECT a.id FROM accounts a JOIN (SELECT account_id, SUM(amount) AS s FROM ledger GROUP BY account_id) l ON l.account_id = a.id WHERE a.balance <> l.s;

-- OUTPUT:
-- Empty set     (books balance; stored balances match the ledger)`]
    ),

    'Social Media Schema': dv(
        [`A social schema has users, posts, comments, likes, follows (a self-referencing many-to-many on users) and messages. The hard part is the feed: reading the latest posts of everyone you follow. Reads dominate, so the model, indexes and often a derived feed or cache are designed around that query.`,
            r`CREATE TABLE follows (follower_id BIGINT NOT NULL, followee_id BIGINT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (follower_id, followee_id), KEY idx_followee (followee_id, follower_id));
CREATE TABLE posts (id BIGINT PRIMARY KEY, user_id BIGINT NOT NULL, body TEXT NOT NULL, created_at DATETIME(3) NOT NULL, KEY idx_user_created (user_id, created_at, id));
CREATE TABLE likes (user_id BIGINT NOT NULL, post_id BIGINT NOT NULL, PRIMARY KEY (user_id, post_id), KEY idx_post (post_id));

-- OUTPUT:
-- Query OK, 0 rows affected (x3)`],
        [`Feed strategies: fan-out on read (query followees' posts at request time, simple, expensive for many followees), fan-out on write (push each post into followers' feed tables, fast reads, heavy writes), and a hybrid for accounts with very many followers. Time-ordered ids (snowflake, UUIDv7) allow sorting by id.`,
            r`SELECT p.id, p.user_id, p.body, p.created_at FROM posts p JOIN follows f ON f.followee_id = p.user_id
WHERE f.follower_id = 1 AND (p.created_at, p.id) < ('2026-05-01 12:00:00', 9000) ORDER BY p.created_at DESC, p.id DESC LIMIT 20;
INSERT INTO feed (user_id, post_id, created_at) SELECT f.follower_id, 9001, NOW() FROM follows f WHERE f.followee_id = 7;      -- fan-out on write

-- OUTPUT:
-- id   | user_id | body | created_at
-- 8999 |       5 | ...  | 2026-05-01 11:59:12`],
        [`Mistakes: counting likes with COUNT(*) on every view, a single hot counter row for popular posts, deleting users with millions of rows via cascade, and OFFSET pagination in feeds. Use counters with slots or async aggregation, soft deletes with batch purge, and keyset pagination.`,
            r`INSERT IGNORE INTO likes (user_id, post_id) VALUES (1, 88);
INSERT INTO counter_slots (name, slot, value) VALUES ('likes:88', FLOOR(RAND() * 8), 1) ON DUPLICATE KEY UPDATE value = value + 1;
SELECT SUM(value) AS likes FROM counter_slots WHERE name = 'likes:88';

-- OUTPUT:
-- likes
-- 8120`],
        [`Scale by caching feeds, sharding by user id, moving search and recommendations to specialised systems, and keeping MySQL as the system of record. Generate ids that sort by time and are unique across shards.`,
            r`SELECT table_name, ROUND((data_length + index_length) / 1073741824, 1) AS gb FROM information_schema.tables WHERE table_name IN ('posts','follows','likes') ORDER BY gb DESC;

-- OUTPUT: (example)
-- table_name | gb
-- likes      | 84.0
-- posts      | 62.0
-- follows    | 31.0`],
        [`Real-world features: mutual followers, suggestions (friends of friends), and unread counts, each expressed with self-joins on the follows table and supported by both directions of index.`,
            r`SELECT b.followee_id AS suggestion, COUNT(*) AS mutuals FROM follows a JOIN follows b ON b.follower_id = a.followee_id
WHERE a.follower_id = 1 AND b.followee_id <> 1 AND NOT EXISTS (SELECT 1 FROM follows x WHERE x.follower_id = 1 AND x.followee_id = b.followee_id)
GROUP BY b.followee_id ORDER BY mutuals DESC LIMIT 5;

-- OUTPUT:
-- suggestion | mutuals
-- 12         |       9`]
    ),

    'Job Portal Schema': dv(
        [`A job portal has users (candidates and recruiters), companies, jobs, applications, skills, and links between them: candidate skills and job skills (junction tables), saved jobs and application history. Applications are unique per candidate and job, and stage changes are kept as history.`,
            r`CREATE TABLE jobs (id BIGINT PRIMARY KEY AUTO_INCREMENT, company_id BIGINT NOT NULL, title VARCHAR(120) NOT NULL, city VARCHAR(60), status VARCHAR(10) NOT NULL DEFAULT 'OPEN', posted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, KEY idx_status_city_posted (status, city, posted_at));
CREATE TABLE applications (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, job_id BIGINT NOT NULL, stage VARCHAR(12) NOT NULL DEFAULT 'APPLIED', applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_user_job (user_id, job_id), KEY idx_job_stage (job_id, stage, applied_at));
CREATE TABLE candidate_skills (user_id BIGINT, skill_id INT, level TINYINT NOT NULL DEFAULT 1, PRIMARY KEY (user_id, skill_id), KEY idx_skill (skill_id, user_id));
CREATE TABLE job_skills (job_id BIGINT, skill_id INT, PRIMARY KEY (job_id, skill_id));

-- OUTPUT:
-- Query OK, 0 rows affected (x4)`],
        [`Search and matching: structured filters (status, city, salary band) use composite indexes; keyword search uses FULLTEXT or a search engine; candidate-job matching counts overlapping skills through the junction tables. Stage transitions are validated and logged in a history table.`,
            r`SELECT cs.user_id, COUNT(*) AS matched, SUM(cs.level) AS strength FROM job_skills js JOIN candidate_skills cs ON cs.skill_id = js.skill_id WHERE js.job_id = 10 GROUP BY cs.user_id ORDER BY matched DESC, strength DESC LIMIT 5;
INSERT INTO application_history (application_id, from_stage, to_stage, changed_by) VALUES (1, 'APPLIED', 'SHORTLISTED', 7);

-- OUTPUT:
-- user_id | matched | strength
-- 12      |       4 |       11`],
        [`Mistakes: allowing duplicate applications (no unique key), free-text skills (typos split the data), no stage history, and loading all applicants of a job into memory. Use a unique key, a skills dictionary and keyset pagination.`,
            r`INSERT INTO applications (user_id, job_id) VALUES (7, 10);
INSERT INTO applications (user_id, job_id) VALUES (7, 10);

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '7-10' for key 'applications.uq_user_job'`],
        [`Performance: the open-jobs listing (status, city, newest first) uses the composite index with keyset pagination; applicant lists per job use (job, stage, time); skill matching uses the junction indexes in both directions. Precompute match scores for large candidate pools.`,
            r`EXPLAIN SELECT id, title FROM jobs WHERE status = 'OPEN' AND city = 'Pune' ORDER BY posted_at DESC LIMIT 20;

-- OUTPUT: (example)
-- type | key                     | Extra
-- ref  | idx_status_city_posted  | Backward index scan`],
        [`Real-world analytics: funnel counts from application to hire per job, and time spent in each stage from the history table.`,
            r`SELECT j.title, SUM(a.stage = 'APPLIED') AS applied, SUM(a.stage = 'SHORTLISTED') AS shortlisted, SUM(a.stage = 'HIRED') AS hired FROM jobs j LEFT JOIN applications a ON a.job_id = j.id WHERE j.company_id = 3 GROUP BY j.id, j.title;

-- OUTPUT:
-- title          | applied | shortlisted | hired
-- Java Developer |      41 |          12 |     2`]
    )
};
