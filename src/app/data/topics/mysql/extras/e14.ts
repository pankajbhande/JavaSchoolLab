// Modules 43 (remaining), 44-47 (ORM, Real Project Design, Interview Problems, Production) extras.
import { x, r, type Extra } from './extra';

export const e14: Record<string, Extra> = {
    'Transactions in Applications': x(
        ['In application code a transaction groups several SQL statements on one connection so they commit or roll back together.',
            'JDBC: <code>setAutoCommit(false)</code>, <code>commit()</code>, <code>rollback()</code>. Spring: <code>@Transactional</code>. Django: <code>transaction.atomic()</code>.',
            'Put the boundary on the service method, not the controller or repository.'],
        ['Spring rolls back on RuntimeException by default; checked exceptions need <code>rollbackFor</code>.',
            '<code>@Transactional</code> works through a proxy: self-invocation, private methods and swallowed exceptions bypass it.',
            'Use read-only transactions for queries and choose isolation per use case.'],
        ['Keep transactions short and never call remote services inside them; use the outbox pattern or sagas across services.',
            'Retry deadlocks (1213) and lock timeouts (1205) by re-running the whole transaction with a bounded backoff.',
            'Make operations idempotent so retries and at-least-once messages are safe.'],
        [['F', 'What does a transaction do in application code?', 'Makes several database operations succeed or fail together.'],
            ['F', 'Where should the transaction boundary be?', 'In the service layer method that represents a business operation.'],
            ['M', 'Why might @Transactional not work?', 'Self-invocation, private/final methods, the exception being caught, or the class not being a Spring bean.'],
            ['M', 'Which exceptions cause rollback by default in Spring?', 'Unchecked (RuntimeException and Error); checked ones need rollbackFor.'],
            ['S', 'How do you coordinate a DB write and a message publish?', 'Transactional outbox: write the event row in the same transaction, then a relay publishes it.'],
            ['S', 'How do you handle deadlocks in code?', 'Catch the deadlock error and retry the whole transaction with backoff, keeping lock order consistent.']],
        [['JDBC transaction.',
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
            ['Spring service.',
                r`@Service class TransferService {
    @Transactional(rollbackFor = Exception.class)
    public void transfer(long from, long to, BigDecimal amt) { accounts.debit(from, amt); accounts.credit(to, amt); }
}

-- OUTPUT: (SQL)
-- set autocommit=0; update ...; update ...; commit`]],
        [['Retry on deadlock.',
            r`for (int attempt = 1; attempt <= 3; attempt++) {
    try { service.transfer(1, 2, amt); break; }
    catch (CannotAcquireLockException e) { if (attempt == 3) throw e; Thread.sleep(50L * attempt); }
}

-- OUTPUT:
-- succeeded on attempt 2 after a deadlock rollback`],
            ['Outbox in the same transaction.',
                r`START TRANSACTION;
INSERT INTO orders (customer_id, total) VALUES (1, 500);
INSERT INTO outbox (event, payload) VALUES ('ORDER_CREATED', JSON_OBJECT('orderId', LAST_INSERT_ID()));
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`]]
    ),

    'Repository Pattern': x(
        ['The repository pattern hides data access behind an interface such as <code>findById</code>, <code>save</code>, <code>findByEmail</code>. Services use domain objects and do not know the SQL.',
            'In Spring Data JPA you declare an interface and the framework implements it.',
            'It keeps SQL out of controllers and business logic.'],
        ['One repository per aggregate root, with intention-revealing methods rather than a generic findAll.',
            'Repositories do not manage transactions; the service layer does.',
            'It makes unit testing easy with fake or in-memory implementations.'],
        ['Do not leak entities to the API; return DTO projections for reads.',
            'A generic repository tempts developers into inefficient queries (findAll then filter in Java); push filters into the query.',
            'Reporting queries need dedicated read models, not forced into aggregate repositories.'],
        [['F', 'What is the repository pattern?', 'An abstraction that gives collection-like access to stored objects and hides the database details.'],
            ['F', 'Why use it?', 'To separate business logic from data access and make code testable.'],
            ['M', 'Where do transactions belong?', 'In the service layer, not in the repository.'],
            ['M', 'How do you unit test a service that uses a repository?', 'Replace the repository with a fake or mock, no database required.'],
            ['S', 'What is wrong with repository.findAll() followed by filtering in code?', 'It loads the whole table; push filters and limits into queries so MySQL can use indexes.'],
            ['S', 'How do you handle complex reports?', 'Use dedicated query/read-model classes with projections or native SQL instead of aggregate repositories.']],
        [['Spring Data repository.',
            r`public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByStatusOrderByCreatedAtDesc(String status);
}

-- OUTPUT: (generated SQL)
-- select ... from users u where u.email = ?
-- select ... from users u where u.status = ? order by u.created_at desc`],
            ['Fake repository for tests.',
                r`class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> data = new HashMap<>();
    public Optional<User> findById(long id) { return Optional.ofNullable(data.get(id)); }
    public User save(User u) { data.put(u.getId(), u); return u; }
}

-- OUTPUT:
-- service tests run in milliseconds without MySQL`]],
        [['Filter in the query, not in Java.',
            r`// bad
repo.findAll().stream().filter(User::isActive).toList();
// good
repo.findByStatus("ACTIVE");

-- OUTPUT:
-- bad: SELECT * FROM users (2.4M rows)   good: ... WHERE status = ? (4,100 rows)`],
            ['DTO projection.',
                r`public interface UserSummary { Long getId(); String getEmail(); }
List<UserSummary> findByStatus(String status);

-- OUTPUT:
-- select u.id, u.email from users u where u.status = ?`]]
    ),

    'JPA, Hibernate & Spring Data JPA': x(
        ['JPA is the Java standard for ORM, Hibernate is the most common implementation and Spring Data JPA adds repository interfaces on top.',
            'Entities map classes to tables with annotations like <code>@Entity</code>, <code>@Id</code>, <code>@ManyToOne</code>.',
            'You work with objects; the framework generates SQL.'],
        ['Understand the persistence context (first-level cache), dirty checking (changes auto-flushed at commit), flush modes and entity states (new, managed, detached).',
            'Show SQL with <code>spring.jpa.show-sql=true</code> or <code>org.hibernate.SQL</code> logging and bind parameters trace.',
            'IDENTITY ids disable JDBC insert batching; use sequences/table generators or tune accordingly.'],
        ['Check the generated SQL for every query path; add indexes to match it.',
            'Tune: <code>hibernate.jdbc.batch_size</code>, <code>order_inserts/updates</code>, <code>default_batch_fetch_size</code>, second-level cache only with care.',
            'Use native queries or jOOQ/JdbcTemplate for complex reporting.'],
        [['F', 'What is JPA vs Hibernate?', 'JPA is the specification; Hibernate is an implementation of it.'],
            ['F', 'What does Spring Data JPA add?', 'Ready-made repository interfaces and query derivation from method names.'],
            ['M', 'What is dirty checking?', 'Hibernate detects changes to managed entities and issues UPDATEs at flush/commit without an explicit save.'],
            ['M', 'Why does IDENTITY hurt batching?', 'The id must be fetched after each insert, so Hibernate cannot defer and batch inserts.'],
            ['S', 'How do you find inefficient SQL from JPA?', 'Enable SQL/statistics logging, use APM or Hibernate statistics and compare with digest tables; fix with fetch plans and indexes.'],
            ['S', 'When bypass JPA?', 'For bulk operations, complex reports or performance-critical paths use JdbcTemplate, jOOQ or native queries.']],
        [['Entity and generated SQL.',
            r`@Entity @Table(name = "products")
class Product { @Id @GeneratedValue(strategy = GenerationType.SEQUENCE) Long id; String name; BigDecimal price; }
repo.save(new Product("Pen", BigDecimal.TEN));

-- OUTPUT: (SQL with logging)
-- insert into products (name, price, id) values (?, ?, ?)`],
            ['Dirty checking.',
                r`@Transactional
public void rename(Long id, String name) { Product p = repo.findById(id).orElseThrow(); p.setName(name); }

-- OUTPUT: (SQL at commit)
-- update products set name=?, price=? where id=?`]],
        [['Show SQL and parameters.',
            r`logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.orm.jdbc.bind=TRACE

-- OUTPUT:
-- select p1_0.id,p1_0.name from products p1_0 where p1_0.id=?
-- binding parameter (1:BIGINT) <- [7]`],
            ['Bulk update bypassing the persistence context.',
                r`@Modifying @Query("update Product p set p.price = p.price * 1.1 where p.category = :c")
int raise(@Param("c") String c);

-- OUTPUT:
-- update products set price=price*1.1 where category=?   (rows affected returned)`]]
    ),

    'SQLAlchemy & Django ORM': x(
        ['SQLAlchemy (Core and ORM) and Django ORM are the main Python ORMs. Both map tables to Python classes and build SQL from Python code.',
            'Django ORM comes with Django and migrations; SQLAlchemy is a flexible toolkit used with Alembic migrations.',
            'Both can show the SQL they generate.'],
        ['Django: <code>Model.objects.filter(...)</code>, <code>select_related</code>, <code>prefetch_related</code>, <code>F()</code> and <code>Q()</code> expressions, <code>bulk_create</code>.',
            'SQLAlchemy: sessions and units of work, <code>select()</code> constructs, <code>selectinload</code>/<code>joinedload</code>.',
            'Use transactions explicitly (<code>atomic()</code> / session commit).'],
        ['Inspect SQL with <code>queryset.query</code> or <code>echo=True</code>; compare with EXPLAIN.',
            'Avoid loading entire tables into memory; use iterator/yield_per and chunking.',
            'Use raw SQL or SQLAlchemy Core for complex analytics and bulk operations.'],
        [['F', 'Name two Python ORMs.', 'SQLAlchemy and Django ORM.'],
            ['F', 'How do you see the SQL of a Django queryset?', '<code>print(qs.query)</code>.'],
            ['M', 'How do you avoid N+1 in each?', 'Django: select_related/prefetch_related. SQLAlchemy: selectinload/joinedload.'],
            ['M', 'What are F expressions used for?', 'Doing arithmetic in the database, such as <code>update(balance=F("balance") - 10)</code>, avoiding race conditions.'],
            ['S', 'How do you process millions of rows without exhausting memory?', 'Django <code>iterator(chunk_size=...)</code> or SQLAlchemy <code>yield_per</code> with server-side cursors, in chunks.'],
            ['S', 'When use raw SQL?', 'For complex analytics, window functions and bulk operations the ORM expresses poorly.']],
        [['Django queryset to SQL.',
            r`qs = Order.objects.select_related("customer").filter(status="NEW").order_by("-created_at")[:20]
print(qs.query)

-- OUTPUT:
-- SELECT ... FROM orders INNER JOIN customers ON ... WHERE status = 'NEW' ORDER BY created_at DESC LIMIT 20`],
            ['SQLAlchemy select.',
                r`stmt = select(Order).options(selectinload(Order.items)).where(Order.status == "NEW").limit(20)
orders = session.scalars(stmt).all()

-- OUTPUT: (SQL, 2 statements)
-- SELECT ... FROM orders WHERE status = %s LIMIT %s
-- SELECT ... FROM order_items WHERE order_id IN (%s, %s, ...)`]],
        [['Atomic update with F.',
            r`Account.objects.filter(id=1).update(balance=F("balance") - 100)

-- OUTPUT:
-- UPDATE accounts SET balance = (balance - 100) WHERE id = 1`],
            ['Stream large result.',
                r`for row in Event.objects.filter(kind="click").iterator(chunk_size=2000):
    process(row)

-- OUTPUT:
-- constant memory; rows fetched in chunks of 2000`]]
    ),

    'Prisma, Sequelize & TypeORM': x(
        ['Prisma, Sequelize and TypeORM are popular Node.js ORMs. They map tables to JavaScript/TypeScript models and generate SQL.',
            'Prisma uses a schema file and generates a typed client; Sequelize and TypeORM use model classes/decorators.',
            'All support migrations.'],
        ['Prisma: <code>prisma.order.findMany({ include: { items: true } })</code> and <code>prisma migrate</code>.',
            'Sequelize: <code>Order.findAll({ include: Item })</code>; TypeORM: repositories and QueryBuilder.',
            'Enable query logging to see SQL.'],
        ['Check for N+1 and over-fetching: use <code>select</code>/<code>include</code> carefully, and raw queries for hot paths.',
            'Connection pooling: configure pool size per instance and use a proxy in serverless setups.',
            'Run migrations in CI/CD with locking so two instances do not migrate at once.'],
        [['F', 'Name three Node ORMs for MySQL.', 'Prisma, Sequelize and TypeORM.'],
            ['F', 'What does an ORM do?', 'Maps database tables to objects and builds SQL for you.'],
            ['M', 'How do you see the SQL?', 'Enable logging: Prisma log queries, Sequelize logging option, TypeORM logging option.'],
            ['M', 'What is the risk of include/relations?', 'Over-fetching and large joins; select only needed fields.'],
            ['S', 'How do you run migrations safely in multiple instances?', 'Run them as a separate job before rollout, not at app start in every instance.'],
            ['S', 'When write raw SQL?', 'For complex reports, bulk upserts and queries the ORM generates inefficiently.']],
        [['Prisma schema and query.',
            r`model Order { id Int @id @default(autoincrement()) customerId Int total Decimal @db.Decimal(10,2) items Item[] }

const orders = await prisma.order.findMany({ where: { customerId: 7 }, include: { items: true }, take: 20 });

-- OUTPUT: (SQL, 2 queries)
-- SELECT ... FROM orders WHERE customerId = 7 LIMIT 20
-- SELECT ... FROM items WHERE orderId IN (...)`],
            ['Sequelize.',
                r`const rows = await Order.findAll({ where: { status: 'NEW' }, include: [Item], limit: 20, order: [['createdAt','DESC']] });

-- OUTPUT:
-- SELECT ... FROM Orders AS Order LEFT OUTER JOIN Items ... WHERE status = 'NEW' ORDER BY createdAt DESC LIMIT 20`]],
        [['Enable query logs.',
            r`const prisma = new PrismaClient({ log: ['query'] });

-- OUTPUT:
-- prisma:query SELECT shop.orders.id FROM shop.orders WHERE ...`],
            ['Raw query for a report.',
                r`const rows = await prisma.$queryRawUnsafe('SELECT customer_id, SUM(total) AS spent FROM orders GROUP BY customer_id ORDER BY spent DESC LIMIT 10');

-- OUTPUT:
-- [ { customer_id: 7, spent: 9800 }, ... ]`]]
    ),

    'Inspecting the SQL an ORM Generates': x(
        ['ORMs hide SQL, but you must still read it. Turn on SQL logging, then run EXPLAIN on the statements to see index use.',
            'Look for N+1 patterns, SELECT * of wide tables, unexpected joins and missing WHERE limits.',
            'The database does not care which ORM wrote the SQL; the plan matters.'],
        ['Where to look: ORM logs, MySQL general log (briefly, dev only), slow query log, Performance Schema digests, APM traces.',
            'Compare the number of queries per request and rows examined.',
            'Parameter binding shows values; digests normalise them.'],
        ['Build a habit: any new endpoint gets its SQL reviewed with production-like data.',
            'Add query-count and latency assertions to integration tests.',
            'Use <code>EXPLAIN ANALYZE</code> on the exact statement with realistic parameters, not a handwritten approximation.'],
        [['F', 'How do you see the SQL generated by an ORM?', 'Enable the ORM’s SQL logging.'],
            ['F', 'What then?', 'Run EXPLAIN on those statements and check index usage.'],
            ['M', 'What should you look for in generated SQL?', 'N+1 patterns, SELECT * on wide tables, missing limits, unexpected joins.'],
            ['M', 'Why not use the general log in production?', 'It records every statement and hurts performance; use the slow log and digests instead.'],
            ['S', 'How do you prevent regressions?', 'Query-count tests, plan reviews for key endpoints and dashboards on rows examined per digest.'],
            ['S', 'How do you map a slow digest back to code?', 'Add SQL comments with request/route (<code>/* route=orders.list */</code>) or use APM trace correlation.']],
        [['Log SQL in Spring Boot.',
            r`spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.orm.jdbc.bind=TRACE

-- OUTPUT:
-- select o1_0.id, o1_0.total from orders o1_0 where o1_0.customer_id=?`],
            ['EXPLAIN the logged statement.',
                r`EXPLAIN ANALYZE SELECT o.id, o.total FROM orders o WHERE o.customer_id = 7;

-- OUTPUT: (example)
-- -> Index lookup on o using idx_customer (customer_id=7) (actual time=0.04..0.1 rows=40)`]],
        [['Tag queries by route (comment).',
            r`/* route=orders.list user_tier=pro */ SELECT id, total FROM orders WHERE customer_id = 7 LIMIT 20;

-- OUTPUT:
-- the comment shows up in slow log and performance_schema digests samples`],
            ['General log for a few seconds in dev.',
                r`SET GLOBAL general_log = 'ON';
-- exercise the endpoint
SET GLOBAL general_log = 'OFF';

-- OUTPUT:
-- (every executed statement written to the general log file)`]]
    ),

    'E-commerce Schema': x(
        ['An e-commerce database stores users, products, categories, carts, orders, order items, payments and addresses.',
            'Core relationships: user has many orders; order has many order_items; product belongs to a category.',
            'Order items snapshot the price at purchase time.'],
        ['Tables: users, addresses, categories, products, product_variants, carts/cart_items, orders, order_items, payments, shipments, inventory.',
            'Indexes: orders (user_id, created_at), order_items (order_id), products (category_id, status), inventory (sku).',
            'Money as DECIMAL, status columns with CHECK or lookup tables, created/updated timestamps.'],
        ['Inventory needs concurrency control: conditional UPDATE (<code>qty = qty - ? WHERE qty &gt;= ?</code>) or reservations with expiry.',
            'Payments: idempotency keys and immutable ledger-style rows; never update amounts in place.',
            'Scale reads with caching/search for the catalog; keep orders in OLTP with partitioning/archival for history.'],
        [['F', 'Which tables does an e-commerce system need?', 'Users, products, categories, orders, order_items, payments and addresses.'],
            ['F', 'Why store price in order_items?', 'Product prices change; orders must keep the price paid.'],
            ['M', 'How do you avoid overselling?', 'Atomic conditional updates or row locks on inventory, within the order transaction.'],
            ['M', 'How do you model variants such as size and colour?', 'A product_variants table (sku, attributes) referencing products, with inventory per variant.'],
            ['S', 'How do you make payments idempotent?', 'A unique idempotency key per request stored with the payment so retries do not charge twice.'],
            ['S', 'How do you handle huge order history?', 'Partition by time, archive old partitions and serve recent data from hot storage.']],
        [['Core schema.',
            r`CREATE TABLE users (id BIGINT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(120) NOT NULL UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE products (id BIGINT PRIMARY KEY AUTO_INCREMENT, sku VARCHAR(30) NOT NULL UNIQUE, name VARCHAR(120) NOT NULL, price DECIMAL(10,2) NOT NULL, category_id INT, INDEX idx_cat (category_id));
CREATE TABLE orders (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, status VARCHAR(12) NOT NULL DEFAULT 'NEW', total DECIMAL(12,2) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, INDEX idx_user_created (user_id, created_at),
  FOREIGN KEY (user_id) REFERENCES users(id));
CREATE TABLE order_items (order_id BIGINT, product_id BIGINT, qty INT NOT NULL, unit_price DECIMAL(10,2) NOT NULL, PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (product_id) REFERENCES products(id));

-- OUTPUT:
-- Query OK, 0 rows affected (x4)`],
            ['Place an order safely.',
                r`START TRANSACTION;
UPDATE inventory SET qty = qty - 2 WHERE sku = 'PEN-1' AND qty >= 2;     -- check ROW_COUNT() = 1
INSERT INTO orders (user_id, total) VALUES (1, 20.00);
INSERT INTO order_items VALUES (LAST_INSERT_ID(), 7, 2, 10.00);
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`]],
        [['Order history query served by the index.',
            r`SELECT id, status, total FROM orders WHERE user_id = 1 ORDER BY created_at DESC LIMIT 20;

-- OUTPUT:
-- id | status | total
--  9 | NEW    | 20.00`],
            ['Best sellers last 30 days.',
                r`SELECT p.name, SUM(oi.qty) AS sold FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id
WHERE o.created_at >= NOW() - INTERVAL 30 DAY GROUP BY p.id, p.name ORDER BY sold DESC LIMIT 5;

-- OUTPUT:
-- name | sold
-- Pen  | 420`]]
    ),

    'Banking Schema': x(
        ['A banking database stores customers, accounts, transactions and beneficiaries. Accuracy and auditability matter most.',
            'Money uses DECIMAL, never floating point.',
            'A transfer is one transaction touching two accounts.'],
        ['Model transactions as an immutable ledger of entries (debit/credit) and compute balances from them or keep a balance column updated in the same transaction.',
            'Use constraints (CHECK balance &gt;= 0 where allowed), unique transaction references and strict isolation for balance updates.',
            'Audit tables record who did what and when.'],
        ['Double-entry bookkeeping: every transaction creates balanced entries; totals per transaction must be zero.',
            'Lock accounts in a consistent order (by id) to avoid deadlocks during transfers.',
            'Idempotency keys prevent duplicate postings from retries; reconciliation jobs compare ledgers with external systems.'],
        [['F', 'Which tables does a simple bank need?', 'Customers, accounts, transactions and beneficiaries.'],
            ['F', 'Which type stores money?', 'DECIMAL.'],
            ['M', 'How do you do a safe transfer?', 'One transaction: lock both accounts in order, check funds, update balances, insert ledger entries, commit.'],
            ['M', 'Why a ledger table?', 'Immutable entries give an audit trail and allow balance recomputation.'],
            ['S', 'What is double-entry bookkeeping?', 'Each transaction records equal debits and credits so the books always balance.'],
            ['S', 'How do you prevent duplicate transfers on retry?', 'A unique idempotency/reference key checked within the transaction.']],
        [['Accounts and ledger.',
            r`CREATE TABLE accounts (id BIGINT PRIMARY KEY AUTO_INCREMENT, customer_id BIGINT NOT NULL, balance DECIMAL(14,2) NOT NULL DEFAULT 0, CHECK (balance >= 0));
CREATE TABLE ledger (id BIGINT PRIMARY KEY AUTO_INCREMENT, txn_ref VARCHAR(40) NOT NULL, account_id BIGINT NOT NULL, amount DECIMAL(14,2) NOT NULL, created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_ref_acct (txn_ref, account_id), INDEX idx_acct_time (account_id, created_at));

-- OUTPUT:
-- Query OK, 0 rows affected (x2)`],
            ['Transfer.',
                r`START TRANSACTION;
SELECT id FROM accounts WHERE id IN (1,2) ORDER BY id FOR UPDATE;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
INSERT INTO ledger (txn_ref, account_id, amount) VALUES ('T-1001', 1, -500), ('T-1001', 2, 500);
COMMIT;

-- OUTPUT:
-- Query OK, 2 rows affected`]],
        [['Books balance.',
            r`SELECT txn_ref, SUM(amount) AS net FROM ledger GROUP BY txn_ref HAVING net <> 0;

-- OUTPUT:
-- Empty set    (every transaction nets to zero)`],
            ['Statement query.',
                r`SELECT created_at, amount, SUM(amount) OVER (ORDER BY created_at, id) AS running_balance FROM ledger WHERE account_id = 1 ORDER BY created_at, id;

-- OUTPUT:
-- created_at          | amount | running_balance
-- 2026-05-01 10:00:00 |  1000  | 1000
-- 2026-05-01 11:30:00 |  -500  |  500`]]
    ),

    'Social Media Schema': x(
        ['A social app stores users, posts, comments, likes, followers and messages.',
            'Followers form a many-to-many self relationship on users.',
            'Likes and comments reference posts and users.'],
        ['Tables: users, posts, comments, likes (unique user_id+post_id), follows (follower_id, followee_id), messages, media.',
            'Indexes: posts (user_id, created_at), follows (followee_id, follower_id), likes (post_id).',
            'Counters (like_count) denormalized for speed and updated asynchronously or via batched jobs.'],
        ['Feed generation is the hard part: fan-out on write (precompute feeds) versus fan-out on read (query followees’ posts); hybrid for celebrities.',
            'Use keyset pagination and cache hot feeds; MySQL is the source of truth.',
            'Shard by user_id when a single node cannot hold the data; design ids (snowflake) for sharding.'],
        [['F', 'Which tables are needed?', 'Users, posts, comments, likes, followers and messages.'],
            ['F', 'How do you model followers?', 'A follows table with follower_id and followee_id referencing users.'],
            ['M', 'How do you prevent duplicate likes?', 'A unique key on (user_id, post_id).'],
            ['M', 'How do you build a simple feed?', 'Posts from followees ordered by time with keyset pagination, supported by indexes.'],
            ['S', 'Fan-out on write vs read?', 'Write: push posts into followers’ feeds (fast reads, heavy writes). Read: query at request time (simple, heavy reads). Hybrid handles celebrities.'],
            ['S', 'How do you scale counters like likes?', 'Batch increments, sharded counters or asynchronous aggregation instead of updating one hot row per like.']],
        [['Schema.',
            r`CREATE TABLE follows (follower_id BIGINT, followee_id BIGINT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (follower_id, followee_id), INDEX idx_followee (followee_id, follower_id));
CREATE TABLE posts (id BIGINT PRIMARY KEY, user_id BIGINT NOT NULL, body TEXT, created_at DATETIME(3) NOT NULL, INDEX idx_user_created (user_id, created_at));
CREATE TABLE likes (user_id BIGINT, post_id BIGINT, PRIMARY KEY (user_id, post_id), INDEX idx_post (post_id));

-- OUTPUT:
-- Query OK, 0 rows affected (x3)`],
            ['Simple feed (fan-out on read).',
                r`SELECT p.id, p.body, p.created_at FROM posts p JOIN follows f ON f.followee_id = p.user_id WHERE f.follower_id = 1 AND p.created_at < '2026-05-01 12:00:00' ORDER BY p.created_at DESC, p.id DESC LIMIT 20;

-- OUTPUT:
-- id | body  | created_at
-- 88 | hello | 2026-05-01 11:59:12`]],
        [['Like once only.',
            r`INSERT IGNORE INTO likes (user_id, post_id) VALUES (1, 88);
SELECT ROW_COUNT();

-- OUTPUT:
-- ROW_COUNT()
-- 1    (0 if the like already existed)`],
            ['Mutual followers.',
                r`SELECT a.followee_id AS user_id FROM follows a JOIN follows b ON b.follower_id = a.followee_id AND b.followee_id = a.follower_id WHERE a.follower_id = 1;

-- OUTPUT:
-- user_id
-- 5`]]
    ),

    'Job Portal Schema': x(
        ['A job portal stores users, companies, jobs, applications and skills. Candidates and employers use different features.',
            'Applications link a user to a job; skills link many-to-many to candidates and jobs.',
            'Indexes support search by location, skill and date.'],
        ['Tables: users, companies, jobs, applications (unique user_id+job_id), skills, candidate_skills, job_skills, saved_jobs.',
            'Status columns for application stages (APPLIED, SHORTLISTED, REJECTED, HIRED) with history table for audit.',
            'Full-text or external search for job search; filters by structured columns.'],
        ['Matching candidates to jobs by skills is a many-to-many overlap query; precompute scores for scale.',
            'Soft delete jobs; keep closed jobs for analytics. Partition or archive old applications.',
            'Privacy: candidate data needs access control, retention policies and audit.'],
        [['F', 'Which tables does a job portal need?', 'Users, companies, jobs, applications, skills and candidate_skills.'],
            ['F', 'How do you prevent applying twice?', 'Unique key on (user_id, job_id).'],
            ['M', 'How do you model skills?', 'A skills table with junction tables candidate_skills and job_skills.'],
            ['M', 'How do you track application status changes?', 'A status column plus a status_history table recording each change with time and actor.'],
            ['S', 'How do you rank candidate matches for a job?', 'Count overlapping skills (join job_skills to candidate_skills), possibly weighted, precomputed for scale.'],
            ['S', 'How to handle search?', 'Structured filters in MySQL plus FULLTEXT or a search engine for keywords, synchronized via outbox/CDC.']],
        [['Core tables.',
            r`CREATE TABLE jobs (id BIGINT PRIMARY KEY AUTO_INCREMENT, company_id BIGINT NOT NULL, title VARCHAR(120) NOT NULL, city VARCHAR(60), status VARCHAR(10) DEFAULT 'OPEN', posted_at DATETIME DEFAULT CURRENT_TIMESTAMP, INDEX idx_status_city_posted (status, city, posted_at));
CREATE TABLE applications (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, job_id BIGINT NOT NULL, stage VARCHAR(12) DEFAULT 'APPLIED', applied_at DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY uq_user_job (user_id, job_id));
CREATE TABLE candidate_skills (user_id BIGINT, skill_id INT, PRIMARY KEY (user_id, skill_id), INDEX idx_skill (skill_id, user_id));
CREATE TABLE job_skills (job_id BIGINT, skill_id INT, PRIMARY KEY (job_id, skill_id));

-- OUTPUT:
-- Query OK, 0 rows affected (x4)`],
            ['Rank candidates for a job.',
                r`SELECT cs.user_id, COUNT(*) AS matched FROM job_skills js JOIN candidate_skills cs ON cs.skill_id = js.skill_id WHERE js.job_id = 10 GROUP BY cs.user_id ORDER BY matched DESC LIMIT 5;

-- OUTPUT:
-- user_id | matched
-- 12      | 4
-- 31      | 3`]],
        [['Applications per job.',
            r`SELECT j.title, COUNT(a.id) AS applicants FROM jobs j LEFT JOIN applications a ON a.job_id = j.id WHERE j.company_id = 3 GROUP BY j.id, j.title;

-- OUTPUT:
-- title           | applicants
-- Java Developer  | 41
-- QA Engineer     |  9`],
            ['Search with filters.',
                r`SELECT id, title FROM jobs WHERE status = 'OPEN' AND city = 'Pune' ORDER BY posted_at DESC LIMIT 20;

-- OUTPUT:
-- id | title
-- 10 | Java Developer`]]
    ),

    'Second & Nth Highest Salary Problems': x(
        ['Find the second (or Nth) highest salary. Common methods: subquery with MAX, LIMIT/OFFSET, or window functions with DENSE_RANK.',
            'Use DISTINCT so duplicate salaries count once.',
            'Return NULL when there is no second salary.'],
        ['DENSE_RANK handles ties correctly: <code>DENSE_RANK() OVER (ORDER BY salary DESC) = N</code>.',
            'LIMIT/OFFSET: <code>SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET N-1</code>.',
            'Wrap in a scalar subquery so an empty result becomes NULL.'],
        ['Per-department version needs PARTITION BY dept.',
            'On large tables an index on salary lets LIMIT/OFFSET stop early; window functions sort everything unless indexed.',
            'Clarify tie semantics with the interviewer: "second highest value" vs "second row".'],
        [['F', 'How do you find the second highest salary?', '<code>SELECT MAX(salary) FROM emp WHERE salary &lt; (SELECT MAX(salary) FROM emp)</code>.'],
            ['F', 'Why use DISTINCT?', 'So repeated salary values count as one rank.'],
            ['M', 'How do you find the Nth highest?', '<code>SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET N-1</code> or DENSE_RANK = N.'],
            ['M', 'How do you return NULL if it does not exist?', 'Wrap the query in a scalar subquery: <code>SELECT (SELECT DISTINCT salary ... LIMIT 1 OFFSET 1) AS second</code>.'],
            ['S', 'Per-department Nth highest?', '<code>DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)</code> and filter rank = N.'],
            ['S', 'ROW_NUMBER vs DENSE_RANK here?', 'ROW_NUMBER counts duplicates as separate ranks, giving the second row, not the second distinct salary.']],
        [['Second highest, three ways.',
            r`-- data: 100, 100, 90, 80
SELECT MAX(salary) AS second_highest FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);
SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1;
SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS dr FROM emp) t WHERE dr = 2 LIMIT 1;

-- OUTPUT: (all three)
-- 90`],
            ['NULL when missing.',
                r`SELECT (SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 5) AS sixth;

-- OUTPUT:
-- sixth
-- NULL`]],
        [['Nth per department.',
            r`SELECT dept, salary FROM (SELECT dept, salary, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dr FROM emp GROUP BY dept, salary) t WHERE dr = 2;

-- OUTPUT:
-- dept | salary
--   10 | 45000`],
            ['Stored function for Nth.',
                r`CREATE FUNCTION nth_salary(n INT) RETURNS INT DETERMINISTIC READS SQL DATA
RETURN (SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET n - 1);
SELECT nth_salary(2);

-- OUTPUT:
-- nth_salary(2)
-- 60000`]]
    ),

    'Find & Remove Duplicate Records': x(
        ['Find duplicates with GROUP BY and HAVING COUNT(*) &gt; 1 on the columns that define a duplicate.',
            'Remove them while keeping one row: keep the smallest or latest id.',
            'Always back up or preview before deleting.'],
        ['Delete with a self join: <code>DELETE a FROM t a JOIN t b ON a.email = b.email AND a.id &gt; b.id</code>.',
            'Or ROW_NUMBER: number rows per key and delete those with rn &gt; 1.',
            'Prevent future duplicates with a UNIQUE constraint.'],
        ['On large tables delete in batches and in a transaction per batch; watch replica lag.',
            'Adding a UNIQUE key to a table with duplicates fails; clean first.',
            'Decide the survivor rule (newest, oldest, most complete) with the business and log removed ids.'],
        [['F', 'How do you find duplicate emails?', '<code>SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) &gt; 1;</code>'],
            ['F', 'How do you prevent duplicates?', 'Add a UNIQUE constraint on the column.'],
            ['M', 'How do you delete duplicates but keep the lowest id?', 'Self-join delete where a.id &gt; b.id on the duplicate key, or ROW_NUMBER filter.'],
            ['M', 'Why might adding a UNIQUE index fail?', 'Existing duplicate rows violate it; remove them first.'],
            ['S', 'How to dedupe a table with 500M rows?', 'Batch by id ranges, use a staging table with distinct keys then swap with RENAME TABLE, and throttle for replicas.'],
            ['S', 'Which survivor rule is best?', 'Depends on business: usually latest updated or most complete; record decisions and removed ids for audit.']],
        [['Find and delete duplicates.',
            r`SELECT email, COUNT(*) AS n FROM users GROUP BY email HAVING n > 1;
DELETE a FROM users a JOIN users b ON a.email = b.email AND a.id > b.id;
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- OUTPUT:
-- email   | n
-- a@x.com | 3
-- Query OK, 2 rows affected
-- Empty set`],
            ['With ROW_NUMBER.',
                r`DELETE u FROM users u JOIN (SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn FROM users) d ON d.id = u.id WHERE d.rn > 1;

-- OUTPUT:
-- Query OK, 2 rows affected`]],
        [['Prevent them.',
            r`ALTER TABLE users ADD UNIQUE KEY uq_email (email);

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Swap-in dedupe for huge tables.',
                r`CREATE TABLE users_dedup LIKE users;
ALTER TABLE users_dedup ADD UNIQUE KEY uq_email (email);
INSERT IGNORE INTO users_dedup SELECT * FROM users ORDER BY id;
RENAME TABLE users TO users_old, users_dedup TO users;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Employees Earning More Than Their Manager': x(
        ['Compare each employee with their manager using a self join on manager_id.',
            'Query: join emp e to emp m on <code>e.manager_id = m.id</code> and filter <code>e.salary &gt; m.salary</code>.',
            'Employees without a manager are excluded by INNER JOIN.'],
        ['Use aliases to tell the two roles apart.',
            'A correlated subquery also works but the self join is clearer and usually faster.',
            'Index manager_id and id (primary key).'],
        ['Hierarchies deeper than one level (earning more than any manager above) need a recursive CTE.',
            'Handle NULL salaries with explicit conditions.',
            'For analytics at scale precompute manager salary into a denormalized column or snapshot table.'],
        [['F', 'How do you compare an employee with their manager in SQL?', 'A self join of the employee table on manager_id.'],
            ['F', 'Why aliases?', 'The same table is used twice, so aliases e and m distinguish employee and manager.'],
            ['M', 'Which join type?', 'INNER JOIN (employees without a manager cannot be compared).'],
            ['M', 'Alternative to a self join?', 'A correlated subquery selecting the manager’s salary.'],
            ['S', 'How to find employees earning more than anyone above them in the chain?', 'Recursive CTE producing all ancestors per employee, then compare to the max ancestor salary.'],
            ['S', 'How to speed this on big tables?', 'Index (manager_id), ensure salary is in a covering index or denormalize manager salary.']],
        [['Self join.',
            r`SELECT e.name AS employee, e.salary, m.name AS manager, m.salary AS manager_salary
FROM staff e JOIN staff m ON m.id = e.manager_id WHERE e.salary > m.salary;

-- OUTPUT:
-- employee | salary | manager | manager_salary
-- Kanhoji  |  90000 | Raoji   | 80000`],
            ['Correlated subquery version.',
                r`SELECT name FROM staff e WHERE salary > (SELECT salary FROM staff m WHERE m.id = e.manager_id);

-- OUTPUT:
-- name
-- Kanhoji`]],
        [['Earning more than any ancestor.',
            r`WITH RECURSIVE anc AS (
  SELECT id, manager_id AS anc_id FROM staff WHERE manager_id IS NOT NULL
  UNION ALL SELECT a.id, s.manager_id FROM anc a JOIN staff s ON s.id = a.anc_id WHERE s.manager_id IS NOT NULL)
SELECT DISTINCT e.name FROM staff e JOIN anc a ON a.id = e.id JOIN staff x ON x.id = a.anc_id WHERE e.salary > x.salary;

-- OUTPUT:
-- name
-- Kanhoji`],
            ['Index for the join.',
                r`ALTER TABLE staff ADD INDEX idx_manager (manager_id);

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Department-wise Highest Salary & Top 3 per Department': x(
        ['Highest salary per department: <code>GROUP BY dept</code> with <code>MAX(salary)</code>. To also show who earns it, join back or use a window function.',
            'Top 3 per department: rank rows inside each department and keep rank &lt;= 3.',
            'DENSE_RANK includes ties; ROW_NUMBER gives exactly three rows.'],
        ['Pattern: <code>WITH r AS (SELECT ..., DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rk FROM emp) SELECT ... WHERE rk &lt;= 3</code>.',
            'Join with departments for names.',
            'Add id as a tie-breaker for ROW_NUMBER.'],
        ['Index (dept, salary DESC) to avoid sorting everything.',
            'Large tables: lateral join per department with LIMIT 3 can beat a full-table window.',
            'Decide tie policy explicitly and test with duplicated salaries.'],
        [['F', 'How do you get the highest salary per department?', '<code>SELECT dept, MAX(salary) FROM emp GROUP BY dept;</code>'],
            ['F', 'How do you also get the employee name?', 'Join back on dept and salary, or use ROW_NUMBER/RANK to pick the top row.'],
            ['M', 'How do you get the top 3 salaries per department?', 'DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) and filter rank &lt;= 3.'],
            ['M', 'ROW_NUMBER vs DENSE_RANK for top 3?', 'ROW_NUMBER returns exactly 3 rows per dept; DENSE_RANK can return more if ties exist.'],
            ['S', 'How optimize on a huge table?', 'Index (dept, salary), and use a lateral join per department with ORDER BY salary DESC LIMIT 3.'],
            ['S', 'How to include departments with fewer than 3 employees?', 'The rank filter already returns whatever exists; use LEFT JOIN from departments if empty departments must appear.']],
        [['Top earner per department with name.',
            r`SELECT d.name AS dept, e.name, e.salary FROM emp e JOIN departments d ON d.id = e.dept
WHERE (e.dept, e.salary) IN (SELECT dept, MAX(salary) FROM emp GROUP BY dept);

-- OUTPUT:
-- dept | name     | salary
-- HR   | Abaji    | 60000
-- IT   | Moropant | 70000`],
            ['Top 3 per department.',
                r`SELECT dept, name, salary FROM (SELECT dept, name, salary, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rk FROM emp) t WHERE rk <= 3 ORDER BY dept, salary DESC;

-- OUTPUT:
-- dept | name     | salary
--   10 | Abaji    | 60000
--   10 | Raoji    | 45000
--   20 | Moropant | 70000`]],
        [['Lateral join version.',
            r`SELECT d.name, t.name AS employee, t.salary FROM departments d JOIN LATERAL (SELECT name, salary FROM emp e WHERE e.dept = d.id ORDER BY salary DESC LIMIT 3) t;

-- OUTPUT:
-- name | employee | salary
-- HR   | Abaji    | 60000
-- HR   | Raoji    | 45000
-- IT   | Moropant | 70000`],
            ['Supporting index.',
                r`ALTER TABLE emp ADD INDEX idx_dept_salary (dept, salary);

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Running Total & Moving Average Problems': x(
        ['A running total adds values cumulatively; a moving average averages a sliding window.',
            'Use <code>SUM(x) OVER (ORDER BY d)</code> and <code>AVG(x) OVER (ORDER BY d ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)</code>.',
            'Partition by group to restart per customer or product.'],
        ['Add a tie-breaker to ORDER BY. Use ROWS frames for exact row windows.',
            'Date-based windows need RANGE with INTERVAL or a calendar table when days are missing.',
            'Percent-of-total: <code>x / SUM(x) OVER ()</code>.'],
        ['For large reporting tables precompute daily aggregates then apply windows over the small table.',
            'Index (partition, order) columns to avoid sorts.',
            'Mind NULLs and gaps; define whether a missing day counts as zero.'],
        [['F', 'How do you compute a running total?', '<code>SUM(amount) OVER (ORDER BY txn_date, id)</code>.'],
            ['F', 'What is a moving average?', 'An average over the latest N rows or a time window.'],
            ['M', 'How restart the total per account?', 'Add PARTITION BY account_id.'],
            ['M', 'How do you handle missing dates in a 7-day average?', 'Join a calendar table or use RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW.'],
            ['S', 'How do you make this fast on billions of rows?', 'Aggregate to daily summary tables first, index properly, and run windows on the reduced data.'],
            ['S', 'How to validate correctness?', 'Compare the final running total to SUM() and spot-check windows on boundary rows.']],
        [['Running total and percent.',
            r`SELECT day, sales, SUM(sales) OVER (ORDER BY day) AS running, ROUND(sales / SUM(sales) OVER () * 100, 1) AS pct FROM daily_sales;

-- OUTPUT:
-- day        | sales | running | pct
-- 2026-01-01 |   100 |     100 | 20.0
-- 2026-01-02 |   200 |     300 | 40.0
-- 2026-01-03 |   200 |     500 | 40.0`],
            ['3-day moving average.',
                r`SELECT day, ROUND(AVG(sales) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS ma3 FROM daily_sales;

-- OUTPUT:
-- day        | ma3
-- 2026-01-01 | 100.0
-- 2026-01-02 | 150.0
-- 2026-01-03 | 166.7`]],
        [['Calendar join for gaps.',
            r`SELECT c.d, COALESCE(s.sales, 0) AS sales, AVG(COALESCE(s.sales,0)) OVER (ORDER BY c.d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7
FROM calendar c LEFT JOIN daily_sales s ON s.day = c.d;

-- OUTPUT:
-- d          | sales | ma7
-- 2026-01-07 |   0   | 85.7`],
            ['Validate with a total.',
                r`SELECT MAX(running) = (SELECT SUM(sales) FROM daily_sales) AS ok FROM (SELECT SUM(sales) OVER (ORDER BY day) AS running FROM daily_sales) t;

-- OUTPUT:
-- ok
-- 1`]]
    ),

    'Consecutive Dates, Missing Numbers & Gaps and Islands': x(
        ['Gaps and islands problems find runs of consecutive values (islands) and the missing values between them (gaps), such as login streaks or missing invoice numbers.',
            'Classic trick: subtract ROW_NUMBER() from the value; consecutive values give the same difference, which identifies the island.',
            'Missing numbers can be found with LEAD/LAG or an anti-join to a number series.'],
        ['Streak of consecutive dates: <code>DATE_SUB(login_date, INTERVAL ROW_NUMBER() OVER (PARTITION BY user ORDER BY login_date) DAY)</code> as group key.',
            'Gaps: <code>LEAD(id) OVER (ORDER BY id) - id &gt; 1</code>.',
            'Remove duplicates first (DISTINCT date per user).'],
        ['For large data keep an index on (user, date) and process per partition.',
            'Handle time zones and date definitions before streak logic.',
            'Generate series with recursive CTEs for full calendars to find all missing values.'],
        [['F', 'What is a gaps and islands problem?', 'Finding groups of consecutive values (islands) and the breaks between them (gaps).'],
            ['F', 'How do you find a missing id?', 'Use LEAD to compare each id with the next one and report differences greater than 1.'],
            ['M', 'What is the row-number trick?', 'Subtracting ROW_NUMBER() from a sequential value gives a constant for each consecutive run.'],
            ['M', 'Why dedupe dates first?', 'Duplicates break the one-to-one row numbering of the sequence.'],
            ['S', 'How do you find the longest login streak per user?', 'Create island keys with the row-number trick, GROUP BY user and key, count days and take the max.'],
            ['S', 'How to list every missing number in a range?', 'Generate the full series (recursive CTE) and LEFT JOIN to the data keeping NULL matches.']],
        [['Longest streak.',
            r`WITH d AS (SELECT DISTINCT user_id, login_date FROM logins),
g AS (SELECT user_id, login_date, DATE_SUB(login_date, INTERVAL ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) DAY) AS grp FROM d)
SELECT user_id, MIN(login_date) AS start_d, MAX(login_date) AS end_d, COUNT(*) AS days FROM g GROUP BY user_id, grp ORDER BY days DESC LIMIT 1;

-- OUTPUT:
-- user_id | start_d    | end_d      | days
-- 1       | 2026-04-01 | 2026-04-05 | 5`],
            ['Missing ids.',
                r`SELECT id + 1 AS gap_start, next_id - 1 AS gap_end FROM (SELECT id, LEAD(id) OVER (ORDER BY id) AS next_id FROM invoices) t WHERE next_id - id > 1;

-- OUTPUT:
-- gap_start | gap_end
-- 4         | 6`]],
        [['All missing numbers via series.',
            r`WITH RECURSIVE s AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM s WHERE n < 10)
SELECT s.n FROM s LEFT JOIN invoices i ON i.id = s.n WHERE i.id IS NULL;

-- OUTPUT:
-- n
-- 4
-- 5
-- 6`],
            ['Consecutive 3 days using LAG.',
                r`SELECT DISTINCT user_id FROM (SELECT user_id, login_date, LAG(login_date, 2) OVER (PARTITION BY user_id ORDER BY login_date) AS two_back FROM (SELECT DISTINCT user_id, login_date FROM logins) x) t WHERE DATEDIFF(login_date, two_back) = 2;

-- OUTPUT:
-- user_id
-- 1`]]
    ),

    'Employee Hierarchy & Recursive Organizational Tree': x(
        ['Hierarchies (managers and reports, categories, folders) are stored with a parent id and walked with a recursive CTE.',
            'The anchor selects the root; the recursive part joins children to the rows found so far.',
            'Add level and path columns to show depth and order.'],
        ['Show an indented tree with <code>CONCAT(REPEAT("  ", level), name)</code> and order by path.',
            'To list all descendants of a node, start the anchor at that node.',
            'Protect from cycles with a path check or depth limit.'],
        ['Alternative models: materialized path (<code>/1/4/9/</code>), nested sets and closure tables trade write cost for fast subtree reads.',
            'Index parent_id for the recursion; for huge trees prefer closure or path models.',
            'Aggregations over subtrees (headcount, total salary) are natural with recursive CTEs plus GROUP BY on the root.'],
        [['F', 'How do you query a hierarchy of unknown depth?', 'With a recursive CTE walking from parents to children.'],
            ['F', 'What columns model the hierarchy?', 'An id and a parent (manager) id column.'],
            ['M', 'How do you display depth?', 'Carry a level counter in the CTE, incrementing in the recursive part.'],
            ['M', 'How do you avoid infinite loops?', 'Keep a path and stop when a node repeats, or set cte_max_recursion_depth.'],
            ['S', 'Alternatives to the adjacency list?', 'Materialized path, nested sets, closure table: faster subtree queries, more complex updates.'],
            ['S', 'How compute team size for every manager?', 'Recursive CTE producing (manager, descendant) pairs, then GROUP BY manager.']],
        [['Indented org chart.',
            r`WITH RECURSIVE org AS (
  SELECT id, name, manager_id, 0 AS lvl, CAST(name AS CHAR(200)) AS path FROM staff WHERE manager_id IS NULL
  UNION ALL
  SELECT s.id, s.name, s.manager_id, o.lvl + 1, CONCAT(o.path, ' > ', s.name) FROM staff s JOIN org o ON s.manager_id = o.id)
SELECT CONCAT(REPEAT('  ', lvl), name) AS chart FROM org ORDER BY path;

-- OUTPUT:
-- chart
-- Annaji
--   Moropant
--   Raoji
--     Kanhoji`],
            ['Team size per manager.',
                r`WITH RECURSIVE t AS (SELECT id AS mgr, id AS member FROM staff UNION ALL SELECT t.mgr, s.id FROM t JOIN staff s ON s.manager_id = t.member)
SELECT s.name, COUNT(*) - 1 AS team_size FROM t JOIN staff s ON s.id = t.mgr GROUP BY t.mgr, s.name HAVING team_size > 0;

-- OUTPUT:
-- name   | team_size
-- Annaji | 3
-- Raoji  | 1`]],
        [['Closure table for fast subtrees.',
            r`CREATE TABLE staff_closure (ancestor INT, descendant INT, depth INT, PRIMARY KEY (ancestor, descendant), INDEX idx_desc (descendant));
SELECT s.name FROM staff_closure c JOIN staff s ON s.id = c.descendant WHERE c.ancestor = 1 AND c.depth > 0;

-- OUTPUT:
-- name
-- Raoji
-- Moropant
-- Kanhoji`],
            ['Materialized path.',
                r`SELECT name FROM staff WHERE path LIKE '/1/2/%';

-- OUTPUT:
-- name
-- Raoji
-- Kanhoji`]]
    ),

    'Customers Who Never Ordered': x(
        ['Find customers with no orders using an anti-join: LEFT JOIN orders and keep rows where the order id IS NULL, or use NOT EXISTS.',
            'It answers "who has not bought anything?".',
            'Avoid NOT IN when the subquery can return NULLs.'],
        ['NOT EXISTS is clear and NULL-safe; LEFT JOIN ... IS NULL is equivalent in MySQL 8 (antijoin).',
            'Index orders(customer_id) so the check is cheap.',
            'Add conditions inside the ON or subquery to scope by date or status (customers with no PAID orders).'],
        ['On large data use anti-join plans; verify with EXPLAIN that it does not scan orders per customer.',
            'For marketing lists add exclusion rules and de-duplicate by email.',
            'Snapshot results for repeatability: customer sets change as orders arrive.'],
        [['F', 'How do you find customers who never ordered?', 'LEFT JOIN orders and filter orders.id IS NULL, or NOT EXISTS.'],
            ['F', 'Why avoid NOT IN here?', 'If the orders subquery contains NULL customer_id the result becomes empty.'],
            ['M', 'How do you find customers with no orders in the last 90 days?', 'NOT EXISTS with a date condition in the subquery.'],
            ['M', 'Which index helps?', 'An index on orders(customer_id) (ideally with created_at).'],
            ['S', 'LEFT JOIN IS NULL vs NOT EXISTS performance?', 'MySQL 8 turns both into an antijoin; choose the clearer, confirm with EXPLAIN.'],
            ['S', 'How to produce stable campaign lists?', 'Materialize the result with a timestamp so later orders do not change who was targeted.']],
        [['Anti-join.',
            r`SELECT c.id, c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;

-- OUTPUT:
-- id | name
--  2 | Raoji`],
            ['NOT EXISTS with a date window.',
                r`SELECT c.id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at >= NOW() - INTERVAL 90 DAY);

-- OUTPUT:
-- id
-- 2
-- 5`]],
        [['NOT IN trap.',
            r`SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);   -- orders has a NULL customer_id

-- OUTPUT:
-- Empty set`],
            ['Index and plan.',
                r`ALTER TABLE orders ADD INDEX idx_cust_created (customer_id, created_at);
EXPLAIN FORMAT=TREE SELECT c.id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT: (example)
-- -> Nested loop antijoin
--     -> Table scan on c
--     -> Single-row covering index lookup on o using idx_cust_created (customer_id=c.id)`]]
    ),

    'Most Frequently Purchased Product & Monthly Revenue': x(
        ['Most frequently purchased product: group order items by product, sum quantity (or count orders), order descending and take the top row.',
            'Monthly revenue: group by year and month of the order date and sum totals.',
            'Use DATE_FORMAT or YEAR/MONTH for grouping.'],
        ['Ties for top product: use DENSE_RANK or return all products with the max.',
            'Include months with no sales via a calendar table and LEFT JOIN.',
            'Revenue should come from order_items price x qty (or order totals) consistently, excluding cancelled orders.'],
        ['Group by an indexed date range per month for performance; avoid wrapping the date column in functions in WHERE.',
            'Pre-aggregate daily/monthly summary tables for dashboards.',
            'Time zones: group in the business time zone, not the server time zone.'],
        [['F', 'How do you find the most purchased product?', 'Join order_items to products, GROUP BY product, ORDER BY SUM(qty) DESC LIMIT 1.'],
            ['F', 'How do you compute monthly revenue?', 'GROUP BY DATE_FORMAT(created_at, "%Y-%m") and SUM(total).'],
            ['M', 'How do you handle ties for the top product?', 'Use DENSE_RANK() = 1 or compare to the MAX of the aggregated totals.'],
            ['M', 'How do you show months with zero revenue?', 'LEFT JOIN a generated month series to the aggregated results with COALESCE.'],
            ['S', 'How do you make the monthly report fast?', 'Filter by date range with an index, aggregate into summary tables incrementally, and cache results.'],
            ['S', 'Which orders should count as revenue?', 'Paid/completed orders only, excluding cancelled/refunded, defined consistently with finance.']],
        [['Top product.',
            r`SELECT p.name, SUM(oi.qty) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id, p.name ORDER BY units DESC LIMIT 1;

-- OUTPUT:
-- name | units
-- Pen  | 420`],
            ['Monthly revenue.',
                r`SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(total) AS revenue FROM orders WHERE status = 'PAID' GROUP BY month ORDER BY month;

-- OUTPUT:
-- month   | revenue
-- 2026-01 | 12000.00
-- 2026-02 | 15400.00`]],
        [['Ties with DENSE_RANK.',
            r`SELECT name, units FROM (SELECT p.name, SUM(oi.qty) AS units, DENSE_RANK() OVER (ORDER BY SUM(oi.qty) DESC) AS rk FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id, p.name) t WHERE rk = 1;

-- OUTPUT:
-- name | units
-- Pen  | 420
-- Bag  | 420`],
            ['Zero-filled months.',
                r`WITH RECURSIVE m AS (SELECT DATE('2026-01-01') AS d UNION ALL SELECT d + INTERVAL 1 MONTH FROM m WHERE d < '2026-03-01')
SELECT DATE_FORMAT(m.d,'%Y-%m') AS month, COALESCE(SUM(o.total),0) AS revenue FROM m LEFT JOIN orders o ON o.created_at >= m.d AND o.created_at < m.d + INTERVAL 1 MONTH AND o.status='PAID' GROUP BY m.d;

-- OUTPUT:
-- month   | revenue
-- 2026-01 | 12000.00
-- 2026-02 | 0.00
-- 2026-03 | 9000.00`]]
    ),

    'Year-over-Year Growth & Retention Analysis': x(
        ['Year-over-year (YoY) growth compares a period with the same period last year: <code>(this_year - last_year) / last_year</code>.',
            'Retention measures how many customers return after their first purchase or signup.',
            'Both use aggregation plus window functions like LAG.'],
        ['YoY: aggregate revenue by year, then <code>LAG(revenue) OVER (ORDER BY year)</code> to get the previous year.',
            'Cohort retention: assign each user a cohort (first month), then count active users per cohort per month offset.',
            'Divide by cohort size for percentages; guard against divide by zero with NULLIF.'],
        ['Use a user activity table (user_id, activity_month) to simplify cohorts.',
            'Large datasets: pre-aggregate monthly activity per user into a summary table.',
            'Be precise on definitions (active = purchase vs login; rolling vs calendar months) and document them.'],
        [['F', 'What is YoY growth?', 'The percentage change from the same period one year earlier.'],
            ['F', 'What is retention?', 'The share of users who come back after an initial period.'],
            ['M', 'How do you compute YoY in SQL?', 'Aggregate by year and use LAG to access last year, then (current − previous) / previous.'],
            ['M', 'What is a cohort?', 'A group of users who share a starting period, such as their signup month.'],
            ['S', 'How do you build a retention table?', 'Cohort month per user, join to activity by month, compute month offset with TIMESTAMPDIFF and count distinct users per cohort and offset.'],
            ['S', 'How do you ensure the metric is trustworthy?', 'Fix definitions, test with small known datasets, reconcile totals and version the query.']],
        [['YoY growth.',
            r`SELECT yr, revenue, ROUND((revenue - LAG(revenue) OVER (ORDER BY yr)) / NULLIF(LAG(revenue) OVER (ORDER BY yr), 0) * 100, 1) AS yoy_pct
FROM (SELECT YEAR(created_at) AS yr, SUM(total) AS revenue FROM orders WHERE status = 'PAID' GROUP BY YEAR(created_at)) t;

-- OUTPUT:
-- yr   | revenue | yoy_pct
-- 2024 |  100000 | NULL
-- 2025 |  130000 | 30.0
-- 2026 |  117000 | -10.0`],
            ['Cohort retention.',
                r`WITH first_order AS (SELECT user_id, DATE_FORMAT(MIN(created_at),'%Y-%m-01') AS cohort FROM orders GROUP BY user_id),
act AS (SELECT DISTINCT user_id, DATE_FORMAT(created_at,'%Y-%m-01') AS m FROM orders)
SELECT f.cohort, TIMESTAMPDIFF(MONTH, f.cohort, a.m) AS month_offset, COUNT(DISTINCT a.user_id) AS users
FROM first_order f JOIN act a ON a.user_id = f.user_id GROUP BY f.cohort, month_offset ORDER BY f.cohort, month_offset;

-- OUTPUT:
-- cohort     | month_offset | users
-- 2026-01-01 | 0            | 100
-- 2026-01-01 | 1            |  42
-- 2026-01-01 | 2            |  31`]],
        [['Retention percentage.',
            r`SELECT cohort, month_offset, ROUND(users * 100 / FIRST_VALUE(users) OVER (PARTITION BY cohort ORDER BY month_offset), 1) AS retention_pct FROM cohort_counts;

-- OUTPUT:
-- cohort     | month_offset | retention_pct
-- 2026-01-01 | 0            | 100.0
-- 2026-01-01 | 1            |  42.0`],
            ['Quarter-over-quarter.',
                r`SELECT q, revenue, revenue - LAG(revenue) OVER (ORDER BY q) AS qoq_change FROM (SELECT CONCAT(YEAR(created_at),'-Q',QUARTER(created_at)) AS q, SUM(total) AS revenue FROM orders GROUP BY q) t;

-- OUTPUT:
-- q       | revenue | qoq_change
-- 2026-Q1 |   40000 | NULL
-- 2026-Q2 |   46000 | 6000`]]
    ),

    'Monitoring, Logging & Metrics': x(
        ['Monitoring watches the health of MySQL: availability, connections, queries, replication, disk and memory.',
            'Logs: error log, slow query log, binary log, general log (rarely).',
            'Metrics are numbers over time: QPS, latency, connections, buffer pool hit rate, replication lag.'],
        ['Collect with exporters (mysqld_exporter), Percona PMM, CloudWatch or Datadog, and visualize in Grafana.',
            'Use golden signals: latency, traffic, errors, saturation.',
            'Alert on symptoms (high latency, errors, lag) and on capacity (disk &lt; 20%, connections &gt; 80%).'],
        ['Alert fatigue kills monitoring: page only on actionable issues; send the rest to dashboards or tickets.',
            'Keep long-term metrics for capacity planning and seasonality.',
            'Monitor from the application side too (error rates, pool wait times) because DB health alone does not show user impact.'],
        [['F', 'What should you monitor on MySQL?', 'Availability, connections, query latency, replication lag, disk space, memory and errors.'],
            ['F', 'Which logs are important?', 'Error log, slow query log and binary logs.'],
            ['M', 'What tool exports MySQL metrics to Prometheus?', 'mysqld_exporter.'],
            ['M', 'What are the golden signals?', 'Latency, traffic, errors and saturation.'],
            ['S', 'How do you avoid alert fatigue?', 'Alert only on actionable, user-impacting conditions, tune thresholds, group and route alerts, review them regularly.'],
            ['S', 'Why monitor from the application too?', 'To see real user-facing errors and pool/latency effects that database metrics alone miss.']],
        [['Key status counters.',
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Questions','Threads_connected','Threads_running','Slow_queries','Aborted_connects','Uptime');

-- OUTPUT: (example)
-- Questions         | 98765432
-- Slow_queries      | 412
-- Threads_connected | 118
-- Threads_running   | 6
-- Aborted_connects  | 12
-- Uptime            | 864000`],
            ['Prometheus alert examples.',
                r`- alert: MySQLDown
  expr: mysql_up == 0
  for: 1m
- alert: MySQLTooManyConnections
  expr: mysql_global_status_threads_connected / mysql_global_variables_max_connections > 0.8
  for: 5m

-- OUTPUT:
-- alerts fire only when the condition persists`]],
        [['Disk space alert query (OS metric).',
            r`node_filesystem_avail_bytes{mountpoint="/var/lib/mysql"} / node_filesystem_size_bytes < 0.2

-- OUTPUT:
-- fires when less than 20% disk remains on the data volume`],
            ['Error log tail.',
                r`SELECT logged, prio, error_code, LEFT(data, 80) AS msg FROM performance_schema.error_log ORDER BY logged DESC LIMIT 3;

-- OUTPUT: (example)
-- logged              | prio  | error_code | msg
-- 2026-05-01 10:00:01 | Note  | MY-010931  | /usr/sbin/mysqld: ready for connections`]]
    ),

    'Query Profiling & Capacity Planning': x(
        ['Query profiling finds where a query spends time. Capacity planning predicts when you will run out of CPU, memory, disk or connections.',
            'Tools: EXPLAIN ANALYZE, Performance Schema stages, sys schema, APM traces.',
            'Plan by looking at growth trends.'],
        ['Profile with <code>EXPLAIN ANALYZE</code> per node and Performance Schema <code>events_stages_*</code> for waits.',
            'Capacity inputs: data growth per month, QPS growth, working set versus RAM, IOPS and throughput limits.',
            'Run load tests that mimic production patterns to find limits.'],
        ['Forecast with headroom (e.g. keep peak below 60-70% of capacity) and plan lead times for scaling or archiving.',
            'Identify the first bottleneck: often I/O or a hot row/lock, not CPU.',
            'Record baselines per release to spot regressions that change capacity needs.'],
        [['F', 'How do you find why a query is slow?', 'Use EXPLAIN ANALYZE and check indexes, scanned rows and sort/temp usage.'],
            ['F', 'What is capacity planning?', 'Estimating future resource needs so the system does not run out.'],
            ['M', 'What inputs do you need for storage planning?', 'Current size, daily growth, retention, index overhead, backups and replicas.'],
            ['M', 'What is a working set?', 'The portion of data actively used; it should fit in the buffer pool for good performance.'],
            ['S', 'How do you load test a database change?', 'Replay production-like traffic (captured queries or synthetic) on a copy with similar data, measure latency percentiles and saturation.'],
            ['S', 'Why keep headroom?', 'Traffic spikes, failovers (fewer nodes), maintenance and growth need spare capacity.']],
        [['Profile stages.',
            r`UPDATE performance_schema.setup_instruments SET enabled='YES', timed='YES' WHERE name LIKE 'stage/%';
UPDATE performance_schema.setup_consumers SET enabled='YES' WHERE name LIKE 'events_stages%';
SELECT event_name, ROUND(timer_wait/1e9,2) AS ms FROM performance_schema.events_stages_history_long ORDER BY timer_wait DESC LIMIT 3;

-- OUTPUT: (example)
-- event_name                        | ms
-- stage/sql/Sending data            | 412.20
-- stage/sql/executing               |  38.10`],
            ['Table growth.',
                r`SELECT table_name, ROUND((data_length + index_length)/1024/1024/1024, 2) AS gb FROM information_schema.tables WHERE table_schema = 'shop' ORDER BY gb DESC LIMIT 3;

-- OUTPUT: (example)
-- table_name  | gb
-- order_items | 84.20
-- orders      | 41.70`]],
        [['Forecast runway.',
            r`SELECT 400 AS disk_gb, 310 AS used_gb, 9 AS growth_gb_per_month, ROUND((400 * 0.8 - 310) / 9, 1) AS months_until_80pct;

-- OUTPUT:
-- disk_gb | used_gb | growth_gb_per_month | months_until_80pct
-- 400     | 310     | 9                   | 1.1`],
            ['Working set check.',
                r`SELECT ROUND(SUM(data_length + index_length)/1024/1024/1024,1) AS total_gb, ROUND(@@innodb_buffer_pool_size/1024/1024/1024,1) AS pool_gb FROM information_schema.tables WHERE table_schema = 'shop';

-- OUTPUT:
-- total_gb | pool_gb
-- 190.0    | 64.0`]]
    ),

    'Backup Verification & Disaster Recovery': x(
        ['A backup you have never restored is not a backup. Verification means regularly restoring and checking the data.',
            'Disaster recovery uses verified backups and standbys to bring service back in another location.',
            'Automate checks and alert on failures.'],
        ['Verify: restore to a scratch server, run integrity checks (CHECK TABLE, row counts, checksums) and sample queries.',
            'Record restore time to validate RTO.',
            'Keep backups encrypted and off-site with retention rules.'],
        ['Automate a nightly restore-and-validate pipeline; publish results as metrics.',
            'Test point-in-time recovery, not only full restores.',
            'Run DR game days: simulate region loss and measure real RTO/RPO and the effort needed.'],
        [['F', 'Why verify backups?', 'To be sure they can actually be restored when needed.'],
            ['F', 'How do you verify one?', 'Restore it to a test server and check the data.'],
            ['M', 'What checks do you run after restore?', 'Row counts, checksums (CHECKSUM TABLE), application smoke tests and CHECK TABLE.'],
            ['M', 'How do you validate RTO?', 'Time the full restore and recovery procedure end to end.'],
            ['S', 'How do you automate verification?', 'A scheduled job restores the latest backup into a temporary instance, runs validation queries and reports success/failure and duration.'],
            ['S', 'What makes a DR test credible?', 'A realistic scenario, fresh environment, measured times and a post-test review with fixes tracked.']],
        [['Restore and validate (script outline).',
            r`xtrabackup --prepare --target-dir=/restore/latest
# start a temporary mysqld on port 3399 with datadir=/restore/latest
mysql -P3399 -e "CHECK TABLE shop.orders; SELECT COUNT(*) FROM shop.orders;"

-- OUTPUT:
-- Table       | Op    | Msg_type | Msg_text
-- shop.orders | check | status   | OK
-- COUNT(*)
-- 120450889`],
            ['Compare checksums with the source replica.',
                r`CHECKSUM TABLE shop.orders;

-- OUTPUT:
-- Table       | Checksum
-- shop.orders | 2918457613`]],
        [['Record results.',
            r`INSERT INTO ops.backup_checks (backup_name, restored_at, duration_min, rows_checked, status) VALUES ('full-2026-05-01', NOW(), 38, 120450889, 'OK');

-- OUTPUT:
-- Query OK, 1 row affected`],
            ['Alert if the last verified backup is old.',
                r`SELECT TIMESTAMPDIFF(HOUR, MAX(restored_at), NOW()) AS hours_since_verified FROM ops.backup_checks WHERE status = 'OK';

-- OUTPUT:
-- hours_since_verified
-- 14`]]
    ),

    'Security Hardening': x(
        ['Security hardening reduces the ways MySQL can be attacked: strong auth, least privilege, encryption, patching and network restrictions.',
            'Start with: remove test data and anonymous users, set strong passwords, disable remote root, bind to private addresses.',
            'Keep MySQL updated.'],
        ['Enable TLS (<code>require_secure_transport</code>), encrypt data at rest (InnoDB tablespace encryption with a keyring), encrypt backups.',
            'Restrict network access with firewalls/security groups; do not expose 3306 publicly.',
            'Enable audit logging and password policies; disable <code>local_infile</code> unless needed.'],
        ['Use a secrets manager and short-lived credentials; rotate regularly.',
            'Separate duties: admin, application, read-only and migration accounts; review privileges periodically.',
            'Defence in depth: WAF and input validation upstream, parameterized queries, monitoring for anomalies and regular vulnerability scans.'],
        [['F', 'Name three hardening steps.', 'Remove anonymous/test users, use strong passwords and avoid exposing the port publicly.'],
            ['F', 'Why disable remote root?', 'Root is the highest-value target; restrict it to localhost or administrative hosts.'],
            ['M', 'How do you encrypt connections?', 'Configure TLS certificates and require secure transport.'],
            ['M', 'How do you encrypt data at rest?', 'InnoDB tablespace encryption with a keyring component/plugin, plus encrypted backups and disks.'],
            ['S', 'What does a secure account model look like?', 'Per-service least-privilege accounts, restricted hosts, TLS required, secrets in a vault with rotation and auditing.'],
            ['S', 'How do you detect misuse?', 'Audit logs, alerts on privilege changes, failed login spikes and unusual query patterns.']],
        [['Quick audit.',
            r`SELECT user, host, plugin, authentication_string = '' AS empty_pw FROM mysql.user WHERE user = '' OR host = '%' OR authentication_string = '';
SELECT @@require_secure_transport, @@local_infile, @@bind_address;

-- OUTPUT: (example)
-- (no rows)
-- @@require_secure_transport | @@local_infile | @@bind_address
-- 1                          | 0              | 10.0.1.5`],
            ['Encrypt a table.',
                r`ALTER TABLE customers ENCRYPTION = 'Y';
SELECT table_name, create_options FROM information_schema.tables WHERE table_name = 'customers';

-- OUTPUT:
-- table_name | create_options
-- customers  | ENCRYPTION='Y'`]],
        [['Disable risky features.',
            r`SET PERSIST local_infile = OFF;
SET PERSIST skip_name_resolve = ON;

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Firewall rule (Linux).',
                r`ufw allow from 10.0.1.0/24 to any port 3306 proto tcp
ufw deny 3306

-- OUTPUT:
-- Rule added`]]
    ),

    'Schema Migration & Zero-Downtime Migrations': x(
        ['A schema migration changes tables safely. Zero-downtime migrations change the schema without stopping the application.',
            'Use versioned migration tools (Flyway, Liquibase) and review every change.',
            'The key rule: every step must work with both the old and new application versions.'],
        ['Expand/contract: add new nullable column or table, deploy code that writes both, backfill in batches, switch reads, then remove old structures later.',
            'Use online DDL (<code>ALGORITHM=INPLACE/INSTANT, LOCK=NONE</code>) when possible; otherwise gh-ost or pt-online-schema-change.',
            'Avoid long metadata locks: kill or wait for long transactions first; set <code>lock_wait_timeout</code>.'],
        ['Throttle on replica lag and load; make migrations pausable and resumable.',
            'Use feature flags to decouple deploys from data switches, and keep rollback paths until verified.',
            'Test on a production-sized clone and rehearse timing and failure modes.'],
        [['F', 'What is a zero-downtime migration?', 'A schema change applied without making the application unavailable.'],
            ['F', 'What does expand/contract mean?', 'First add new structures compatible with old code, migrate, then remove old ones in a later release.'],
            ['M', 'Why can ALTER TABLE cause downtime?', 'Some changes copy the table and block writes, or wait on metadata locks behind long transactions.'],
            ['M', 'Which tools help with big tables?', 'gh-ost and pt-online-schema-change, or MySQL online DDL.'],
            ['S', 'How do you rename a column with no downtime?', 'Add the new column, write to both, backfill, switch reads, then drop the old column in a later release (avoid in-place rename while old code is running).'],
            ['S', 'How do you control risk during a long migration?', 'Throttling, monitoring replica lag, abort/pause switches, rehearsal on a clone and a tested rollback.']],
        [['Online column add.',
            r`ALTER TABLE orders ADD COLUMN channel VARCHAR(20) NULL, ALGORITHM=INSTANT;

-- OUTPUT:
-- Query OK, 0 rows affected (0.02 sec)`],
            ['Backfill in batches.',
                r`UPDATE orders SET channel = 'WEB' WHERE channel IS NULL AND id BETWEEN 1 AND 10000;
-- repeat per range; pause when Seconds_Behind_Source > 5

-- OUTPUT:
-- Query OK, 10000 rows affected`]],
        [['Fail fast instead of blocking.',
            r`SET SESSION lock_wait_timeout = 5;
ALTER TABLE orders ADD INDEX idx_channel (channel), ALGORITHM=INPLACE, LOCK=NONE;

-- OUTPUT:
-- Query OK, 0 rows affected   (or ERROR 1205 if a metadata lock cannot be obtained in 5 s)`],
            ['Verify before dropping the old column.',
                r`SELECT COUNT(*) FROM orders WHERE new_status <> status_old OR (new_status IS NULL) <> (status_old IS NULL);

-- OUTPUT:
-- COUNT(*)
-- 0`]]
    ),

    'Deployment & Scaling Strategies': x(
        ['Deployment strategies for MySQL: single primary with replicas, managed cloud services, containers/Kubernetes operators.',
            'Scale reads with replicas and caching; scale writes by tuning, bigger hardware (vertical) or sharding (horizontal).',
            'Start simple and scale only when measurements show the need.'],
        ['Scaling ladder: fix queries and indexes, add caching, add read replicas, partition/archive, scale up the primary, then shard.',
            'Connection management with pools and proxies; separate analytics workloads to replicas or a warehouse.',
            'Use infrastructure as code and automated failover for repeatable deployments.'],
        ['Sharding adds complexity: shard key choice, cross-shard queries, transactions and resharding; consider Vitess, TiDB or application-level sharding only when required.',
            'Capacity targets and SLOs drive architecture: define RPO/RTO, latency and availability goals first.',
            'Blue/green or rolling upgrades with replicas minimize downtime; test failover paths regularly.'],
        [['F', 'How do you scale reads?', 'Add read replicas and caching.'],
            ['F', 'What is vertical scaling?', 'Using a bigger server with more CPU, RAM and faster storage.'],
            ['M', 'When shard a database?', 'When a single primary cannot handle the write volume or data size even after tuning, caching and scaling up.'],
            ['M', 'What makes a good shard key?', 'High cardinality, evenly distributed, present in most queries, and stable (like tenant or user id).'],
            ['S', 'What are the costs of sharding?', 'Cross-shard queries and transactions, rebalancing/resharding, operational complexity and tooling.'],
            ['S', 'How do you upgrade MySQL with minimal downtime?', 'Upgrade replicas first, test, switch over the primary to an upgraded replica, then upgrade the old primary; keep rollback options.']],
        [['Scaling ladder as a checklist.',
            r`-- 1 queries/indexes  2 cache  3 read replicas  4 partition/archive  5 scale up  6 shard
SELECT step, action FROM scaling_playbook ORDER BY step;

-- OUTPUT:
-- step | action
-- 1    | Fix top 10 queries by total time
-- 2    | Add Redis cache for hot reads
-- 3    | Add 2 read replicas behind Router`],
            ['Shard routing by tenant.',
                r`-- application: shard = hash(tenant_id) % 4 -> db-shard-{0..3}
SELECT CRC32('tenant-42') % 4 AS shard;

-- OUTPUT:
-- shard
-- 2`]],
        [['Rolling upgrade sequence.',
            r`-- 1. upgrade replica A, verify replication and queries
-- 2. switchover: promote replica A
CALL mysql.rds_failover_db_instance();   -- or: dba.getCluster().setPrimaryInstance('A')
-- 3. upgrade the old primary and rejoin as a replica

-- OUTPUT:
-- failover completed in 27 seconds`],
            ['Kubernetes operator (config excerpt).',
                r`apiVersion: mysql.oracle.com/v2
kind: InnoDBCluster
spec: { instances: 3, router: { instances: 2 }, secretName: mysql-root }

-- OUTPUT:
-- innodbcluster/prod created (3 members ONLINE, 2 routers)`]]
    )
};
