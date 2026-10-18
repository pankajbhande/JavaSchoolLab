// Module 43 (MySQL with Backend Applications), part B.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s43b: Record<string, DeepDive> = {
    'Pagination Strategies': dd(
        [`<b>Pagination</b> returns a large result in pages. Two main styles: <b>OFFSET</b> (<code>LIMIT 20 OFFSET 40</code>) and <b>keyset/seek</b> (<code>WHERE id &lt; last_seen ORDER BY id DESC LIMIT 20</code>).`,
            r`CREATE TABLE posts (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(40), created_at DATETIME);
INSERT INTO posts (title, created_at) VALUES
 ('p1','2026-01-01'),('p2','2026-01-02'),('p3','2026-01-03'),('p4','2026-01-04'),('p5','2026-01-05');
SELECT id, title FROM posts ORDER BY id DESC LIMIT 2 OFFSET 2;

-- OUTPUT:
-- id | title
--  3 | p3
--  2 | p2`],
        [`Returning a million rows to a browser is impossible. Pages cap memory, bandwidth and latency, but the technique chosen decides if page 10,000 is fast.`,
            r`-- OFFSET reads and discards the first N rows: cost grows with page number
EXPLAIN ANALYZE SELECT * FROM events ORDER BY id LIMIT 20 OFFSET 1000000;

-- OUTPUT: (example)
-- -> Limit/Offset: 20/1000000 row(s)  (actual time=640..640 rows=20)
--     -> Index scan on events using PRIMARY  (actual time=0.1..590 rows=1000020)`],
        [`Feeds and APIs use keyset pagination with an opaque cursor; admin tables with page numbers use OFFSET on small data or a "deferred join".`,
            r`-- Keyset: remember the last (created_at, id) from the previous page
SELECT id, title, created_at FROM posts
WHERE  (created_at, id) < ('2026-01-04', 4)
ORDER  BY created_at DESC, id DESC
LIMIT  2;

-- OUTPUT:
-- id | title | created_at
--  3 | p3    | 2026-01-03
--  2 | p2    | 2026-01-02`],
        [`<b>Advantages (keyset):</b> constant cost per page, stable under inserts (no duplicates or skips), uses an index range scan.`,
            r`ALTER TABLE posts ADD INDEX idx_created_id (created_at, id);
EXPLAIN SELECT id FROM posts
WHERE (created_at, id) < ('2026-01-04', 4) ORDER BY created_at DESC, id DESC LIMIT 2;

-- OUTPUT: (example)
-- type  | key            | rows | Extra
-- range | idx_created_id |    3 | Using where; Backward index scan; Using index`],
        [`<b>Disadvantages (keyset):</b> no "jump to page 50", needs a unique tie-breaker column, and cursor handling is more code. OFFSET gets slower and shifts when rows are inserted.`,
            r`-- OFFSET drift: a new post arrives between page 1 and page 2
INSERT INTO posts (title, created_at) VALUES ('p6','2026-01-06');
SELECT id, title FROM posts ORDER BY id DESC LIMIT 2 OFFSET 2;   -- page 2 now repeats p4

-- OUTPUT:
-- id | title
--  4 | p4      (already seen on page 1 before the insert)
--  3 | p3`],
        [`<b>Limitations:</b> a total page count needs COUNT(*), which is itself a large scan; keyset needs a deterministic sort order and cannot sort by an unindexed expression.`,
            r`-- Deferred join: OFFSET over a thin index, then fetch only 20 full rows
SELECT p.*
FROM   posts p
JOIN  (SELECT id FROM posts ORDER BY created_at DESC, id DESC LIMIT 2 OFFSET 2) t ON t.id = p.id
ORDER  BY p.created_at DESC, p.id DESC;

-- OUTPUT:
-- id | title | created_at
--  4 | p4    | 2026-01-04
--  3 | p3    | 2026-01-03`],
        `
   OFFSET:  [skip 1,000,000 rows .......][20 returned]   cost grows with page
   KEYSET:  index ─► seek to (last_created, last_id) ─► read 20   cost constant
            page1 last = (Jan04,4) ───► page2 WHERE (created_at,id) < (Jan04,4)
`,
        `Default to keyset for infinite scroll and APIs; encode the cursor opaquely so you can change it. Offer page numbers only where data is small, or cap depth (for example 100 pages) and push users to search.`
    ),

    'N+1 Problem': dd(
        [`The <b>N+1 problem</b> is 1 query to fetch N parent rows, then N more queries (one per parent) to fetch children, producing N+1 round trips instead of 1 or 2.`,
            r`# Pseudo-ORM loop that causes N+1
orders = db.query("SELECT id, customer_id FROM orders LIMIT 3")            # 1 query
for o in orders:
    c = db.query("SELECT name FROM customers WHERE id = ?", o.customer_id) # +3 queries
    print(o.id, c.name)

# OUTPUT:
# 1 Abaji
# 2 Raoji
# 3 Abaji        (4 queries executed)`],
        [`Each query has a network round trip (0.3-2 ms). For N=1000 that is a second of pure latency and 1000 lock-free but wasteful statements, which grows with data and appears only in production.`,
            r`-- What the server sees: 1001 near-identical statements
SELECT id, customer_id FROM orders LIMIT 1000;
SELECT name FROM customers WHERE id = 11;
SELECT name FROM customers WHERE id = 12;
-- ... 998 more

-- OUTPUT: (example)
-- 1001 queries, ~1.2 s total (1 ms each) instead of one 5 ms query`],
        [`Found in list pages, reports and REST serializers that touch a relation. Detect it by counting queries per request or by the digest table showing a tiny query with huge COUNT_STAR.`,
            r`SELECT DIGEST_TEXT, COUNT_STAR
FROM   performance_schema.events_statements_summary_by_digest
ORDER  BY COUNT_STAR DESC LIMIT 2;

-- OUTPUT: (example)
-- DIGEST_TEXT                                  | COUNT_STAR
-- SELECT name FROM customers WHERE id = ?      |    4800210
-- SELECT id , customer_id FROM orders LIMIT ?  |       4802`],
        [`<b>Fix advantages:</b> a JOIN or an IN batch returns everything in 1-2 round trips.`,
            r`-- Fix 1: JOIN
SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id LIMIT 3;
-- Fix 2: batch IN (what ORMs do in prefetch_related / @BatchSize)
SELECT id, name FROM customers WHERE id IN (1, 2);

-- OUTPUT:
-- id | name
--  1 | Abaji
--  2 | Raoji
--  3 | Abaji`],
        [`<b>Fix disadvantages:</b> a JOIN of one-to-many duplicates parent columns (row explosion) and fetching too much wastes memory; batch IN needs a second query and in-memory stitching.`,
            r`-- Parent with 3 items joined => parent repeated 3 times
SELECT o.id, i.sku FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.id = 1;

-- OUTPUT: (example)
-- id | sku
--  1 | A-1
--  1 | B-7
--  1 | C-9`],
        [`<b>Limitations:</b> you cannot fix it from the database side; it is an application access pattern, though a query digest and slow-log can expose it. Paged lists must batch per page, not for all data.`,
            r`# Guard rail: fail tests when a request exceeds a query budget (Django)
from django.test import TestCase
class T(TestCase):
    def test_list(self):
        with self.assertNumQueries(2):          # orders + prefetch customers
            list(Order.objects.prefetch_related("customer"))

# OUTPUT:
# OK  (fails with "101 != 2 queries" if N+1 returns)`],
        `
   BAD:   orders(1) ─┬─► customer(1)
                     ├─► customer(2)      N round trips
                     └─► customer(N)
   GOOD:  orders ─► JOIN customers            1 trip
          or  orders, then customers WHERE id IN (...)   2 trips
`,
        `Make query count a tested budget per endpoint, enable ORM batch fetching globally, and use DTO projections for read APIs. Prefer two batched queries over a wide join when children are many, to avoid row explosion.`
    ),

    'Lazy vs Eager Loading': dd(
        [`<b>Lazy loading</b> fetches related data only when you first touch it; <b>eager loading</b> fetches it up front together with the parent (JOIN or a second batched query).`,
            r`// JPA: choose per association
@Entity class Order {
    @Id Long id;
    @ManyToOne(fetch = FetchType.LAZY)  Customer customer;   // proxy, loaded on first use
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY) List<Item> items;
}
Order o = em.find(Order.class, 1L);        // SELECT ... FROM orders WHERE id = 1
String n = o.customer.getName();           // now SELECT ... FROM customers WHERE id = ?

// OUTPUT:
// 2 SQL statements, the second only when getName() was called`],
        [`Always loading everything wastes memory and queries; always loading nothing causes N+1. You need to decide per use case what data is required.`,
            r`-- Lazy: list page needs only orders
SELECT id, total FROM orders WHERE status = 'NEW';
-- Eager: detail page needs customer and items too
SELECT o.id, c.name, i.sku
FROM orders o JOIN customers c ON c.id=o.customer_id JOIN order_items i ON i.order_id=o.id
WHERE o.id = 1;

-- OUTPUT: (example)
-- list: 40 rows, 1 query      detail: 3 rows, 1 query`],
        [`Best practice: relations lazy by default, then eager-load per query with fetch join or entity graph.`,
            r`// Per-query eager loading in Spring Data JPA
@Query("select o from Order o join fetch o.customer where o.id = :id")
Optional<Order> findWithCustomer(@Param("id") Long id);

// or Django:  Order.objects.select_related("customer").prefetch_related("items")

// OUTPUT:
// SELECT o.*, c.* FROM orders o JOIN customers c ON ... WHERE o.id = ?   (single query)`],
        [`<b>Advantages:</b> lazy saves work for unused data and keeps list queries light; eager removes surprise queries and N+1 for known needs.`,
            r`// Lazy proxies make cheap lists
List<Order> list = repo.findByStatus("NEW");     // no customer/items queries yet
int count = list.size();                          // never touched relations: zero extra SQL

// OUTPUT:
// count = 40, SQL executed = 1`],
        [`<b>Disadvantages:</b> lazy outside a session throws LazyInitializationException and causes hidden N+1; eager everywhere loads huge object graphs and Cartesian products.`,
            r`Order o = repo.findById(1L).get();
// transaction ended here (open-in-view disabled)
o.getItems().size();     // lazy access with no session

// OUTPUT:
// org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: Order.items`],
        [`<b>Limitations:</b> fetch-joining two collections in one query (bags) yields a Cartesian product (MultipleBagFetchException); pagination with a collection fetch join is done in memory by Hibernate.`,
            r`-- Two collections joined together: 10 items x 5 payments = 50 rows per order
SELECT o.id, i.sku, p.ref
FROM orders o JOIN order_items i ON i.order_id=o.id JOIN payments p ON p.order_id=o.id
WHERE o.id = 1;
-- Better: separate queries per collection (batch size / SUBSELECT)

-- OUTPUT: (example)
-- 50 rows returned for one order`],
        `
   LAZY :  parent ──► (proxy)  ...touch...►  extra SELECT   (cheap until used)
   EAGER:  parent JOIN child in same fetch                  (heavy if unused)
   Rule :  map LAZY, load EAGER per query (fetch join / entity graph / batch size)
`,
        `Never map associations EAGER globally; decide in the repository method. Keep entities out of API responses (use DTO projections), disable open-session-in-view in services with strict latency, and use batch fetching for collections.`
    ),

    'Database Migrations': dd(
        [`A <b>migration</b> is a versioned, ordered script that changes the schema. Tools (Flyway, Liquibase, Django migrations, Alembic, Prisma Migrate) apply each script once and record it in a history table.`,
            r`-- V1__create_users.sql   (Flyway naming: V<version>__<description>.sql)
CREATE TABLE users (
  id    BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(120) NOT NULL,
  UNIQUE KEY uq_users_email (email)
);
SELECT version, description, success FROM flyway_schema_history;

-- OUTPUT: (example)
-- version | description  | success
-- 1       | create users |       1`],
        [`Without migrations, dev, test and production schemas drift and deployments rely on someone running hand-written ALTERs. Migrations make schema changes reviewed, repeatable and reversible.`,
            r`-- V2__add_status.sql
ALTER TABLE users ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'ACTIVE';
-- V3__index_status.sql
CREATE INDEX idx_users_status ON users (status);
SELECT version FROM flyway_schema_history ORDER BY installed_rank;

-- OUTPUT:
-- version
-- 1
-- 2
-- 3`],
        [`CI/CD runs migrations before or during deployment. Safe changes follow expand then contract: add the new column, deploy code that writes both, backfill, switch reads, drop the old one later.`,
            r`-- Step 1 (expand): additive, backward compatible
ALTER TABLE users ADD COLUMN full_name VARCHAR(120) NULL, ALGORITHM=INPLACE, LOCK=NONE;
-- Step 2: backfill in small batches
UPDATE users SET full_name = email WHERE full_name IS NULL LIMIT 1000;
-- Step 3 (contract, a later release): ALTER TABLE users DROP COLUMN old_name;

-- OUTPUT:
-- Query OK, 0 rows affected
-- Query OK, 1000 rows affected`],
        [`<b>Advantages:</b> reproducible environments, code-review of schema, audit trail, rollbacks via down scripts, automated in pipelines.`,
            r`-- Checksums detect tampering with already-applied scripts
SELECT version, checksum FROM flyway_schema_history WHERE version = '1';

-- OUTPUT: (example)
-- version | checksum
-- 1       | 1872340091
-- (editing V1 later => "Validate failed: checksum mismatch")`],
        [`<b>Disadvantages:</b> large ALTERs can lock or slow production, DDL in MySQL is not transactional (a failed script can leave half-applied changes), and down scripts are rarely tested.`,
            r`-- MySQL DDL auto-commits: if statement 2 fails, statement 1 stays applied
CREATE TABLE a (id INT);          -- committed immediately
CREATE TABLE a (id INT);          -- ERROR 1050: Table 'a' already exists
-- Keep each migration to ONE logical DDL statement, so failure is easy to repair.

-- OUTPUT:
-- ERROR 1050 (42S01): Table 'a' already exists`],
        [`<b>Limitations:</b> some changes (column type change, adding a primary key) rebuild the table with a copy algorithm and block writes; online tools like gh-ost or pt-online-schema-change are needed for very large tables.`,
            r`-- Check whether an operation can run online BEFORE running it
ALTER TABLE users MODIFY email VARCHAR(200) NOT NULL, ALGORITHM=INPLACE, LOCK=NONE;
ALTER TABLE users MODIFY id INT NOT NULL, ALGORITHM=INPLACE, LOCK=NONE;

-- OUTPUT:
-- Query OK, 0 rows affected          (VARCHAR growth within same length byte class is in-place)
-- ERROR 1846 (0A000): ALGORITHM=INPLACE is not supported. Reason: Cannot change column type INPLACE. Try ALGORITHM=COPY.`],
        `
   V1 ─► V2 ─► V3 ─► V4          scripts in Git (immutable once released)
    │     │     │     │
    └─────┴─────┴─────┴──► history table records version + checksum
   Deploy: pipeline runs pending scripts ─► app starts
   Safe pattern:  EXPAND ─► backfill ─► switch ─► CONTRACT
`,
        `Make every migration backward compatible with the previous app version so rollbacks and rolling deploys work. Gate big-table changes with ALGORITHM/LOCK clauses so they fail fast instead of blocking, and rehearse on a production-sized copy.`
    )
};
