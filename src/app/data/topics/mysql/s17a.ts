// Module 17 (Indexes), part A.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s17a: Record<string, DeepDive> = {
    'What is an Index?': dd(
        [`An <b>index</b> is a separate, sorted data structure (in InnoDB a B+Tree) that maps column values to the rows holding them, so MySQL can jump to matching rows instead of reading the whole table. Think of the index at the back of a book.`,
            r`-- Build a table, then ask the optimizer how it finds a row.
CREATE TABLE emp (
  id    INT PRIMARY KEY,          -- PRIMARY KEY is automatically indexed (clustered)
  email VARCHAR(80) NOT NULL,     -- no index yet
  dept  INT
);
INSERT INTO emp VALUES (1,'a@x.com',10),(2,'b@x.com',20),(3,'c@x.com',10);

SHOW INDEX FROM emp;              -- list indexes on the table

-- OUTPUT:
-- +-------+------------+----------+--------------+-------------+
-- | Table | Non_unique | Key_name | Seq_in_index | Column_name |
-- +-------+------------+----------+--------------+-------------+
-- | emp   |          0 | PRIMARY  |            1 | id          |
-- +-------+------------+----------+--------------+-------------+`],
        [`Without an index, <code>WHERE email = ...</code> must read every row (a full scan). Cost grows linearly with table size; an index makes it grow with the tree height (about 3-4 page reads even for hundreds of millions of rows).`,
            r`-- Same query, before and after an index on email.
EXPLAIN SELECT * FROM emp WHERE email = 'b@x.com';   -- type = ALL  (full scan)

CREATE INDEX idx_emp_email ON emp(email);            -- build a secondary index

EXPLAIN SELECT * FROM emp WHERE email = 'b@x.com';   -- type = ref  (index lookup)

-- OUTPUT (key columns only):
-- +------+---------------+---------------+------+
-- | type | possible_keys | key           | rows |
-- +------+---------------+---------------+------+
-- | ALL  | NULL          | NULL          |    3 |   <- before
-- | ref  | idx_emp_email | idx_emp_email |    1 |   <- after
-- +------+---------------+---------------+------+`],
        [`Typical uses: login by email, order lookup by customer_id, foreign keys, sorting for pagination, enforcing uniqueness. Rule of thumb: index columns used in WHERE, JOIN ON, ORDER BY and GROUP BY of frequent queries.`,
            r`-- A realistic orders table with indexes that match its main queries.
CREATE TABLE orders (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  status      VARCHAR(10) NOT NULL,
  created_at  DATETIME NOT NULL,
  KEY idx_cust_created (customer_id, created_at)   -- serves: "latest orders of a customer"
);
INSERT INTO orders(customer_id,status,created_at)
VALUES (7,'PAID','2024-01-02 10:00:00'),(7,'NEW','2024-02-01 09:00:00'),(8,'PAID','2024-01-05 08:00:00');

SELECT id, created_at FROM orders
WHERE customer_id = 7 ORDER BY created_at DESC LIMIT 1;   -- no sort needed, index is ordered

-- OUTPUT:
-- +----+---------------------+
-- | id | created_at          |
-- +----+---------------------+
-- |  2 | 2024-02-01 09:00:00 |
-- +----+---------------------+`],
        [`<b>Advantages:</b> orders-of-magnitude faster lookups, range scans and ORDER BY; enforces uniqueness; speeds up joins and foreign-key checks; can answer a query without touching the table (covering).`,
            r`-- Index gives sorted output for free: no "Using filesort".
EXPLAIN SELECT id FROM orders WHERE customer_id = 7 ORDER BY created_at;

-- OUTPUT (Extra column):
-- +------+-----------------+--------------------------+
-- | type | key             | Extra                    |
-- +------+-----------------+--------------------------+
-- | ref  | idx_cust_created| Using where; Using index |   -- (example) ordered + covering
-- +------+-----------------+--------------------------+`],
        [`<b>Disadvantages:</b> every INSERT/UPDATE/DELETE must also maintain each index (slower writes), indexes consume disk and buffer-pool memory, and too many indexes confuse the optimizer and bloat backups.`,
            r`-- Each extra index = extra B-Tree to update on every write.
CREATE INDEX i1 ON orders(status);
CREATE INDEX i2 ON orders(created_at);
CREATE INDEX i3 ON orders(status, created_at);

-- Find unused/redundant indexes (sys schema, MySQL 5.7+ / 8):
SELECT index_name FROM sys.schema_unused_indexes WHERE object_name = 'orders';

-- OUTPUT (example):
-- +------------+
-- | index_name |
-- +------------+
-- | i1         |   <- i3 already covers status as a leftmost prefix: i1 is redundant
-- +------------+`],
        [`<b>Limitations:</b> an index helps only if the predicate can use it: functions on the column, leading wildcards, implicit type conversions and low-selectivity columns defeat it. InnoDB allows max 64 secondary indexes per table and 16 columns per composite index; key length is limited to 3072 bytes.`,
            r`-- A function on the indexed column disables the index.
EXPLAIN SELECT id FROM orders WHERE YEAR(created_at) = 2024;          -- scans: index unusable
EXPLAIN SELECT id FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';       -- range scan on i2

-- OUTPUT (type column):
-- +-------+
-- | type  |
-- +-------+
-- | index |   <- full index scan (function hides the order)
-- | range |   <- sargable rewrite
-- +-------+`],
        `
   SELECT ... WHERE email='b@x.com'

   no index                      with index
   +-----+                       +---------+
   | row1| <- check              |  root   |
   | row2| <- check              +----+----+
   | row3| <- check (ALL)             |
   +-----+                       +----v----+
   O(n) page reads               |  leaf   | -> pointer to row
                                 +---------+
                                 O(log n) page reads
`,
        `Treat indexes as a write-cost-for-read-speed trade. Derive them from the real query workload (slow log, performance_schema), keep them few and composite, drop redundant ones, and re-verify with EXPLAIN after data growth. Remember that every index competes for the buffer pool.`
    ),

    'B-Tree Indexes': dd(
        [`MySQL InnoDB indexes are <b>B+Trees</b>: a balanced, sorted tree where internal nodes hold keys and leaf nodes hold all entries, chained left-to-right in a doubly linked list. Each node is a 16 KB page, so the tree is very wide and very shallow.`,
            r`-- Which index type does a table use?  InnoDB: BTREE (hash is only for MEMORY/ADAPTIVE).
CREATE TABLE t_bt (k INT, v VARCHAR(10), INDEX idx_k (k) USING BTREE);

SELECT index_name, index_type FROM information_schema.statistics
WHERE table_schema = DATABASE() AND table_name = 't_bt';

-- OUTPUT:
-- +------------+------------+
-- | INDEX_NAME | INDEX_TYPE |
-- +------------+------------+
-- | idx_k      | BTREE      |
-- +------------+------------+`],
        [`A B+Tree supports equality, range, prefix and ORDER BY efficiently because keys stay sorted, and it stays balanced as rows are inserted (pages split) or deleted (pages merge), so every lookup costs the same number of page reads.`,
            r`-- Sorted leaves => range scans are cheap and ordered.
CREATE TABLE nums (n INT PRIMARY KEY);
INSERT INTO nums VALUES (10),(20),(30),(40),(50);

EXPLAIN SELECT n FROM nums WHERE n BETWEEN 20 AND 40;   -- type=range, one descent + leaf walk
SELECT n FROM nums WHERE n BETWEEN 20 AND 40;

-- OUTPUT:
-- +----+
-- | n  |
-- +----+
-- | 20 |
-- | 30 |
-- | 40 |
-- +----+`],
        [`Real-world sizing: with a 4-byte INT key a page holds about 1000 entries, so 3 levels address ~1 billion rows. That is why a primary-key lookup on a huge table still takes only ~3 page reads (the root is nearly always cached).`,
            r`-- Estimate the tree for your table: pages used by the clustered index.
SELECT table_name, table_rows, ROUND(data_length/1024/1024,1) AS data_mb,
       ROUND(index_length/1024/1024,1) AS index_mb
FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name = 'orders';

-- Height rule of thumb:  levels ~ ceil( log_fanout(rows) ),  fanout ~ 16384 / (key_bytes + 6~12)

-- OUTPUT (example):
-- +------------+------------+---------+----------+
-- | TABLE_NAME | TABLE_ROWS | data_mb | index_mb |
-- +------------+------------+---------+----------+
-- | orders     |          3 |     0.0 |      0.0 |
-- +------------+------------+---------+----------+`],
        [`<b>Advantages:</b> handles =, &lt;, &gt;, BETWEEN, LIKE 'abc%', ORDER BY and MIN/MAX; predictable O(log n); stays balanced automatically; sequential leaf chain gives fast range scans.`,
            r`-- MIN/MAX are answered by walking to the end of the tree: "Select tables optimized away".
EXPLAIN SELECT MAX(n), MIN(n) FROM nums;

-- OUTPUT (Extra):
-- +------------------------------+
-- | Extra                        |
-- +------------------------------+
-- | Select tables optimized away |
-- +------------------------------+`],
        [`<b>Disadvantages:</b> random-key inserts (e.g. UUID v4) cause page splits and fragmentation; every write may touch several pages; deep trees from wide keys cost more I/O; a LIKE '%abc' search cannot use the tree order.`,
            r`-- Leading wildcard: the sorted order is useless.
CREATE TABLE people (name VARCHAR(30), INDEX (name));
EXPLAIN SELECT * FROM people WHERE name LIKE 'Ann%';    -- range: uses the tree
EXPLAIN SELECT * FROM people WHERE name LIKE '%ann';    -- full index/table scan

-- OUTPUT (type):
-- +-------+
-- | range |   <- 'Ann%'
-- | index |   <- '%ann'  (scans whole index, cannot seek)
-- +-------+`],
        [`<b>Limitations:</b> pages are 16 KB by default (innodb_page_size, fixed at initialisation), index key max 3072 bytes, and B-Trees do not support hashed O(1) lookup or text relevance search (use hash/Adaptive Hash Index or FULLTEXT). Descending indexes are real only since MySQL 8.0.`,
            r`-- MySQL 8: descending index keys are honoured.
CREATE TABLE ev (id INT PRIMARY KEY, ts DATETIME, KEY idx_ts_desc (ts DESC));
SHOW INDEX FROM ev WHERE Key_name = 'idx_ts_desc';

-- OUTPUT (Collation: D = descending):
-- +----------+-------------+-----------+
-- | Key_name | Column_name | Collation |
-- +----------+-------------+-----------+
-- | idx_ts_desc | ts       | D         |
-- +----------+-------------+-----------+`],
        `
                    [ root page: 40 | 80 ]
                   /          |          \
        [10 20 30]       [40 50 60 70]     [80 90 99]     <- internal / leaf pages
         | | |  <---->     | | | |   <---->  | | |         leaves chained
         rows               rows              rows

   lookup 50: root -> middle child -> leaf (3 page reads)
   range 20..60: seek 20, then walk the leaf chain
`,
        `Prefer monotonically increasing primary keys (AUTO_INCREMENT, UUIDv7/ULID, or UUID_TO_BIN(uuid,1)) to avoid page-split churn. Keep keys narrow because every secondary index entry stores the primary key too. Rebuild (OPTIMIZE / ALTER ... ENGINE=InnoDB) only when fragmentation is measured, not by habit.`
    ),

    'Clustered vs Secondary Index': dd(
        [`In InnoDB the table <b>is</b> its <b>clustered index</b>: a B+Tree on the primary key whose leaf pages contain the full rows. A <b>secondary index</b> is another B+Tree whose leaves hold the indexed columns plus the primary-key value, not a row address.`,
            r`CREATE TABLE cust (
  id    INT PRIMARY KEY,         -- clustered: leaves store the entire row
  email VARCHAR(50),
  city  VARCHAR(20),
  KEY idx_city (city)            -- secondary: leaves store (city, id)
);
INSERT INTO cust VALUES (1,'a@x','Pune'),(2,'b@x','Delhi'),(3,'c@x','Pune');

SHOW INDEX FROM cust;

-- OUTPUT (partial):
-- +----------+-------------+
-- | Key_name | Column_name |
-- +----------+-------------+
-- | PRIMARY  | id          |
-- | idx_city | city        |
-- +----------+-------------+`],
        [`The design matters for performance: primary-key lookups are one tree walk, but a secondary lookup is two (secondary tree, then clustered tree via the PK, called a "bookmark lookup"). It also means the PK size is copied into every secondary index.`,
            r`-- Secondary lookup returning non-indexed columns costs the second descent.
EXPLAIN SELECT email FROM cust WHERE city = 'Pune';     -- ref on idx_city, then fetch row by id
EXPLAIN SELECT id    FROM cust WHERE city = 'Pune';     -- id is already inside idx_city leaves

-- OUTPUT (Extra):
-- +-------------+
-- | Extra       |
-- +-------------+
-- | NULL        |   <- needs the clustered index lookup for email
-- | Using index |   <- covering: PK is stored in the secondary leaf
-- +-------------+`],
        [`Real design rules: always declare a short, stable, increasing PK. If you do not, InnoDB picks the first NOT NULL UNIQUE index, otherwise a hidden 6-byte row id. Wide PKs (long VARCHAR, UUID text) inflate every secondary index.`,
            r`-- Compare secondary index size with narrow vs wide PK (conceptual measure).
CREATE TABLE a_int  (id INT PRIMARY KEY, c INT, KEY(c));                -- entry ~ 4 + 4 bytes
CREATE TABLE a_uuid (id CHAR(36) PRIMARY KEY, c INT, KEY(c));           -- entry ~ 4 + 36 bytes

SELECT table_name, index_length FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name IN ('a_int','a_uuid');

-- OUTPUT (example, after loading 1M rows each):
-- +------------+--------------+
-- | TABLE_NAME | INDEX_LENGTH |
-- +------------+--------------+
-- | a_int      |     21495808 |
-- | a_uuid     |     86114304 |   <- ~4x bigger secondary index
-- +------------+--------------+`],
        [`<b>Advantages:</b> clustered: row access by PK is the fastest possible and range scans on PK read contiguous pages. Secondary: unlimited extra access paths, and moving a row does not require pointer updates (they store the PK, not a physical address).`,
            r`-- PK range scan reads physically adjacent pages.
CREATE TABLE log_t (id BIGINT AUTO_INCREMENT PRIMARY KEY, msg VARCHAR(40));
INSERT INTO log_t(msg) VALUES ('a'),('b'),('c'),('d');
SELECT id, msg FROM log_t WHERE id BETWEEN 2 AND 3;

-- OUTPUT:
-- +----+------+
-- | id | msg  |
-- +----+------+
-- |  2 | b    |
-- |  3 | c    |
-- +----+------+`],
        [`<b>Disadvantages:</b> secondary lookups pay a double traversal; updating the PK moves the row and rewrites all secondary entries; random PKs fragment the table; only one clustered index exists per table.`,
            r`-- Changing a PK value is expensive: the row relocates and every secondary entry changes.
UPDATE cust SET id = 100 WHERE id = 1;     -- avoid; treat PKs as immutable
SELECT id, city FROM cust ORDER BY id;

-- OUTPUT:
-- +-----+-------+
-- | id  | city  |
-- +-----+-------+
-- |   2 | Delhi |
-- |   3 | Pune  |
-- | 100 | Pune  |
-- +-----+-------+`],
        [`<b>Limitations:</b> you cannot choose a different clustering key without redefining the PK; MyISAM uses non-clustered (heap) tables with row pointers instead, so these rules are InnoDB-specific. Tables without a PK also break row-based replication efficiency and Group Replication.`,
            r`-- MySQL 8.0.13+: enforce that every new table has a PK (important for replication).
SET SESSION sql_require_primary_key = ON;
CREATE TABLE no_pk (x INT);                 -- rejected

-- OUTPUT:
-- ERROR 3750 (HY000): Unable to create or change a table without a primary key,
--   when the system variable 'sql_require_primary_key' is set.`],
        `
   Clustered (PRIMARY KEY id)            Secondary (city)
   +----------------------+              +--------------------+
   | leaf: id=1 | full row|              | leaf: (Delhi , 2)  |
   | leaf: id=2 | full row| <------------| leaf: (Pune  , 1)  |
   | leaf: id=3 | full row|   PK value   | leaf: (Pune  , 3)  |
   +----------------------+   = pointer  +--------------------+

   SELECT email WHERE city='Pune':  secondary tree -> id -> clustered tree -> row
`,
        `Pick the PK for locality and brevity: BIGINT auto-increment for write-heavy OLTP, or time-ordered IDs when ids must be generated client side. Because secondary indexes embed the PK, a 16-byte BINARY(16) UUID beats CHAR(36) by a wide margin. Consider covering indexes to dodge the second traversal on hot queries.`
    ),

    'Composite Index & Leftmost Prefix': dd(
        [`A <b>composite (multi-column) index</b> sorts entries by the first column, then the second within equal firsts, and so on, like a phone book sorted by last name then first name. The <b>leftmost-prefix rule</b>: it can serve predicates on (a), (a,b), (a,b,c), but not (b) or (c) alone.`,
            r`CREATE TABLE emp2 (
  id INT PRIMARY KEY, dept INT, grade INT, name VARCHAR(20),
  KEY idx_dept_grade (dept, grade)         -- sorted by dept, then grade
);
INSERT INTO emp2 VALUES (1,10,3,'A'),(2,10,5,'B'),(3,20,3,'C'),(4,20,4,'D');

EXPLAIN SELECT name FROM emp2 WHERE dept = 10 AND grade = 5;   -- uses both columns (key_len 10)

-- OUTPUT (partial):
-- +------+----------------+---------+
-- | type | key            | key_len |
-- +------+----------------+---------+
-- | ref  | idx_dept_grade | 10      |   <- 5 + 5 bytes (INT NULL = 5)
-- +------+----------------+---------+`],
        [`One composite index replaces several single-column ones and supports multi-column filters plus sorting. Two single-column indexes cannot be combined as efficiently (index merge is a fallback, not a plan to rely on).`,
            r`-- Filter on dept, sort on grade: composite index gives both with no filesort.
EXPLAIN SELECT name FROM emp2 WHERE dept = 20 ORDER BY grade;

-- OUTPUT (Extra):
-- +-------+
-- | Extra |
-- +-------+
-- | NULL  |    <- no "Using filesort": rows come out ordered by grade within dept=20
-- +-------+`],
        [`Real-world: "orders of a customer by date", "events by tenant + type + time". Column order rule: equality columns first, then range column, and a sort column last; the first range predicate stops further columns from filtering.`,
            r`-- Equality on dept, range on grade: both used. Reverse: only the leading range column is used.
EXPLAIN SELECT * FROM emp2 WHERE dept = 10 AND grade > 3;    -- key_len 10 (both columns)
EXPLAIN SELECT * FROM emp2 WHERE dept > 10 AND grade = 3;    -- key_len 5  (grade checked after)

-- OUTPUT (key_len):
-- +---------+
-- | 10      |
-- | 5       |
-- +---------+`],
        [`<b>Advantages:</b> fewer indexes to maintain, covers many query shapes, supports ORDER BY after equality columns, and enables covering reads when all needed columns are included.`,
            r`-- The leading column alone is served too (prefix rule).
EXPLAIN SELECT name FROM emp2 WHERE dept = 10;     -- uses idx_dept_grade (key_len 5)

-- OUTPUT (partial):
-- +------+----------------+---------+
-- | ref  | idx_dept_grade | 5       |
-- +------+----------------+---------+`],
        [`<b>Disadvantages:</b> wrong column order makes it useless for important queries; wide composites cost more space and write time; it is easy to create near-duplicates like (a) and (a,b).`,
            r`-- Skipping the leading column: the index cannot seek.
EXPLAIN SELECT name FROM emp2 WHERE grade = 3;

-- OUTPUT (partial):
-- +-------+----------------+
-- | type  | key            |
-- +-------+----------------+
-- | ALL   | NULL           |    <- (example) tiny table: optimizer may also pick "index" full scan
-- +-------+----------------+`],
        [`<b>Limitations:</b> max 16 columns; MySQL 8.0.13+ may use <b>skip scan</b> when the leading column has few distinct values, but this is a narrow optimisation, not a replacement for correct ordering. After a range predicate, later columns cannot narrow the seek.`,
            r`-- Skip scan (8.0.13+): few distinct leading values -> optimizer probes each one.
EXPLAIN SELECT dept, grade FROM emp2 WHERE grade = 3;

-- OUTPUT (Extra, example, only on larger data sets):
-- +------------------------------------------+
-- | Extra                                    |
-- +------------------------------------------+
-- | Using where; Using index for skip scan   |
-- +------------------------------------------+`],
        `
   idx (dept, grade)  sorted entries:
   (10,3)(10,5) | (20,3)(20,4)
     ^ group by dept; inside a group, sorted by grade

   WHERE dept=10               -> seek group 10           OK  (prefix)
   WHERE dept=10 AND grade=5   -> seek (10,5)             OK
   WHERE grade=5               -> grades scattered        NO  (no leftmost)
   WHERE dept>10 AND grade=3   -> range on dept, filter   PARTIAL
`,
        `Design composites from the query list: equality columns, then range or sort column, with the most selective equality first only when it does not break ordering needs. Audit with sys.schema_redundant_indexes. Prefer one carefully ordered composite over three single-column indexes, and verify with EXPLAIN key_len which columns are really used.`
    ),
};
