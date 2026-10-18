// Module 7 (SELECT Queries), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s07k: Record<string, DeepDive> = {
    'WHERE Clause': dd(
        [`<b>WHERE</b> filters rows before they are grouped or returned. Each row is tested against a boolean condition; only rows for which the condition is TRUE survive (FALSE and NULL are dropped). It works with SELECT, UPDATE and DELETE alike.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(30), dept VARCHAR(20), salary DECIMAL(9,2), city VARCHAR(20));
INSERT INTO emp VALUES
 (1,'Abaji','IT',60000,'Pune'), (2,'Raoji','HR',45000,'Delhi'),
 (3,'Mina','IT',52000,'Pune'), (4,'Kanhoji','Sales',38000,NULL);

SELECT name, salary FROM emp WHERE dept = 'IT' AND salary > 55000;

-- OUTPUT:
-- +-------+----------+
-- | name  | salary   |
-- +-------+----------+
-- | Abaji | 60000.00 |
-- +------+----------+`],
        [`Returning every row is wasteful and rarely what the user asked for. Filtering in the database moves less data over the network, lets indexes narrow the search, and is the same predicate that makes UPDATE and DELETE safe.`,
            r`-- NULL is neither equal nor unequal to anything, so these rows vanish from both tests
SELECT name FROM emp WHERE city = 'Pune';
SELECT name FROM emp WHERE city <> 'Pune';

-- OUTPUT:
-- +-------+        +-------+
-- | name  |        | name  |
-- +-------+        +-------+
-- | Abaji |        | Raoji |
-- | Mina  |        +-------+       <- Kanhoji (city NULL) appears in neither result
-- +-------+`],
        [`Real queries combine conditions, ranges and lists. Predicates that compare a bare indexed column to a value (sargable) can use the index; wrapping the column in a function usually cannot.`,
            r`ALTER TABLE emp ADD KEY idx_salary (salary);
EXPLAIN SELECT id FROM emp WHERE salary >= 50000;         -- sargable: index range scan
EXPLAIN SELECT id FROM emp WHERE salary + 0 >= 50000;     -- column inside expression: no range scan

-- OUTPUT (example, trimmed):
-- | type  | key        | rows |
-- | range | idx_salary |    3 |
-- | index | idx_salary |    4 |      <- scans the whole index instead of a range`],
        [`<b>Advantages:</b> declarative and composable (AND, OR, NOT, IN, BETWEEN, LIKE, subqueries), index-friendly, and evaluated inside the server so only matching rows leave it.`,
            r`SELECT name FROM emp
WHERE dept IN ('IT', 'HR')
  AND salary BETWEEN 45000 AND 55000
  AND city IS NOT NULL;

-- OUTPUT:
-- +-------+
-- | name  |
-- +-------+
-- | Raoji |
-- | Mina  |
-- +------+`],
        [`<b>Disadvantages:</b> a non-sargable or low-selectivity predicate forces a full scan; implicit type conversion (comparing a string column with a number) can disable the index and silently match unexpected rows; NULL logic surprises beginners.`,
            r`CREATE TABLE phone_book (id INT PRIMARY KEY, phone VARCHAR(15), KEY (phone));
INSERT INTO phone_book VALUES (1,'9000000001'),(2,'9000000002');
EXPLAIN SELECT id FROM phone_book WHERE phone = 9000000001;     -- number vs string column

-- OUTPUT (example, trimmed):
-- | type  | key   | rows | Extra                |
-- | index | phone |    2 | Using where; Using index |
-- (every phone value is cast to a number, so the index cannot do a lookup; quote the literal)`],
        [`<b>Limitations:</b> column aliases from the SELECT list cannot be used in WHERE (it runs before SELECT); aggregates are not allowed in WHERE (use HAVING); and the optimizer may ignore an index when the predicate matches a large part of the table.`,
            r`SELECT dept, AVG(salary) FROM emp WHERE AVG(salary) > 40000 GROUP BY dept;

-- OUTPUT:
-- ERROR 1111 (HY000): Invalid use of group function`],
        `
   FROM emp ──► WHERE (row filter) ──► GROUP BY ──► HAVING ──► SELECT ──► ORDER BY ──► LIMIT
                  │
                  ├─ TRUE    : row kept
                  ├─ FALSE   : row dropped
                  └─ NULL    : row dropped (unknown)
`,
        `Write sargable predicates (column on one side, constant or parameter on the other), keep types identical, and index the columns used in highly selective filters. Check plans with EXPLAIN rather than guessing, and avoid functions on indexed columns, using a range (date >= x AND date &lt; y) or a functional index instead.`
    ),

    'ORDER BY': dd(
        [`<b>ORDER BY</b> sorts the result by one or more expressions, ascending (default) or <code>DESC</code>. It is the only way to get a guaranteed order; without it MySQL may return rows in any order, which can change after an index or plan change.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(30), dept VARCHAR(20), salary DECIMAL(9,2));
INSERT INTO emp VALUES (1,'Abaji','IT',60000),(2,'Raoji','HR',45000),(3,'Mina','IT',52000),(4,'Kanhoji','HR',45000);

SELECT name, dept, salary
FROM emp
ORDER BY dept ASC, salary DESC;          -- by department, then highest paid first

-- OUTPUT:
-- +---------+------+----------+
-- | name    | dept | salary   |
-- +---------+------+----------+
-- | Raoji   | HR   | 45000.00 |
-- | Kanhoji | HR   | 45000.00 |
-- | Abaji   | IT   | 60000.00 |
-- | Mina    | IT   | 52000.00 |
-- +---------+------+----------+
-- (Raoji/Kanhoji tie on both keys: their relative order is not guaranteed; add id as a tie-breaker)`],
        [`People read lists sorted: newest first, alphabetical, top earners. Pagination, reports and deterministic tests all need a stable total order, which means adding a unique tie-breaker such as the primary key.`,
            r`SELECT name, salary FROM emp ORDER BY salary DESC, id ASC;      -- id makes ties deterministic

-- OUTPUT:
-- +---------+----------+
-- | name    | salary   |
-- +---------+----------+
-- | Abaji   | 60000.00 |
-- | Mina    | 52000.00 |
-- | Raoji   | 45000.00 |
-- | Kanhoji | 45000.00 |
-- +-------+----------+`],
        [`Sorting can use column aliases, positions and expressions, and NULLs sort first in ASC and last in DESC in MySQL. Custom order uses <code>FIELD()</code> or CASE.`,
            r`SELECT name, dept FROM emp
ORDER BY FIELD(dept, 'IT', 'HR'),        -- custom rank: IT first
         name;                           -- then alphabetical

SELECT name, salary * 12 AS annual FROM emp ORDER BY annual DESC LIMIT 1;   -- alias allowed here

-- OUTPUT:
-- +---------+------+
-- | name    | dept |
-- +---------+------+
-- | Abaji   | IT   |
-- | Mina    | IT   |
-- | Kanhoji | HR   |
-- | Raoji   | HR   |
-- +---------+------+
-- +-------+-----------+
-- | name  | annual    |
-- +-------+-----------+
-- | Abaji | 720000.00 |
-- +------+-----------+`],
        [`<b>Advantages:</b> deterministic output, multi-key sorting, and a matching index (same columns and direction; descending indexes are real in 8.0) lets MySQL read rows already sorted and skip the sort entirely.`,
            r`ALTER TABLE emp ADD KEY idx_dept_sal (dept, salary);
EXPLAIN SELECT id FROM emp WHERE dept = 'IT' ORDER BY salary;

-- OUTPUT (example, trimmed):
-- | type | key          | Extra                    |
-- | ref  | idx_dept_sal | Using where; Using index |      <- no "Using filesort"`],
        [`<b>Disadvantages:</b> without a usable index the server does a <b>filesort</b>: it collects rows and sorts them in the sort buffer, spilling to disk for big sets. Sorting all rows to show ten is expensive, and mixed ASC/DESC directions defeat older index designs.`,
            r`EXPLAIN SELECT name FROM emp ORDER BY name;          -- no index on name

-- OUTPUT (example, trimmed):
-- | type | key  | rows | Extra          |
-- | ALL  | NULL |    4 | Using filesort |`],
        [`<b>Limitations:</b> ORDER BY inside a subquery or view without LIMIT may be ignored by the optimizer; collation affects string order (case, accents); sort memory is bounded by <code>sort_buffer_size</code>; and sorting very long values only compares the first <code>max_sort_length</code> bytes (default 1024).`,
            r`SELECT 'a' < 'B' AS ci_collation, 'a' COLLATE utf8mb4_bin < 'B' COLLATE utf8mb4_bin AS binary_order;

-- OUTPUT:
-- +--------------+--------------+
-- | ci_collation | binary_order |
-- +--------------+--------------+
-- |            1 |            0 |
-- +--------------+--------------+
-- (case-insensitive: a before B; binary: uppercase B (66) before a (97))`],
        `
   rows from FROM/WHERE ──► ORDER BY
                              │
          index with same order? ── yes ──► read in index order (no sort)
                              │ no
                              ▼
          filesort: sort buffer ──► (too big) ──► temp files merge ──► sorted rows
`,
        `Design composite indexes as equality columns first, then the ORDER BY column, so filter and sort share one index. Always include a unique tie-breaker for pagination. Avoid sorting wide rows: select the key, sort and limit, then join back for the remaining columns (deferred join).`
    ),

    'LIMIT & Pagination': dd(
        [`<b>LIMIT n</b> returns at most n rows; <code>LIMIT n OFFSET m</code> (or <code>LIMIT m, n</code>) skips m rows first. Together with ORDER BY it implements paging, "top N" and sampling.`,
            r`CREATE TABLE article (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(30), published DATE);
INSERT INTO article (title, published) VALUES
 ('A1','2026-01-01'),('A2','2026-01-02'),('A3','2026-01-03'),('A4','2026-01-04'),('A5','2026-01-05');

SELECT id, title FROM article ORDER BY published DESC LIMIT 2;              -- latest two
SELECT id, title FROM article ORDER BY published DESC LIMIT 2 OFFSET 2;     -- page 2

-- OUTPUT:
-- +----+-------+        +----+-------+
-- | id | title |        | id | title |
-- +----+-------+        +----+-------+
-- |  5 | A5    |        |  3 | A3    |
-- |  4 | A4    |        |  2 | A2    |
-- +----+-------+        +----+-------+`],
        [`Showing a million rows in a browser is impossible, so UIs and APIs return a page at a time. LIMIT bounds memory and latency on both server and client.`,
            r`-- Page p of size s:  OFFSET = (p - 1) * s
-- Always pair LIMIT with ORDER BY on a unique key, or pages can overlap or skip rows
SELECT id, title FROM article ORDER BY id LIMIT 2 OFFSET 4;       -- page 3, size 2

-- OUTPUT:
-- +----+-------+
-- | id | title |
-- +----+-------+
-- |  5 | A5    |
-- +----+-------+`],
        [`Deep OFFSET pages get slower because the server still reads and discards every skipped row. Production feeds use <b>keyset (seek) pagination</b>: remember the last key and ask for rows after it.`,
            r`-- Keyset pagination: the client sends back the last id it saw
SELECT id, title FROM article
WHERE id > 2                  -- last id of the previous page
ORDER BY id
LIMIT 2;                      -- cost stays flat however deep you go

-- OUTPUT:
-- +----+-------+
-- | id | title |
-- +----+-------+
-- |  3 | A3    |
-- |  4 | A4    |
-- +----+-------+`],
        [`<b>Advantages:</b> trivial to use, caps result size, lets the optimizer stop early (with an index matching ORDER BY, it reads only n rows), and keyset paging gives stable, fast deep pages.`,
            r`EXPLAIN SELECT id FROM article ORDER BY id LIMIT 3;

-- OUTPUT (example, trimmed):
-- | type  | key     | rows | Extra       |
-- | index | PRIMARY |    3 | Using index |      <- stops after 3 index entries`],
        [`<b>Disadvantages:</b> OFFSET cost grows linearly (OFFSET 1000000 reads a million rows to throw away); pages shift if rows are inserted or deleted between requests; and a total count needs a separate, possibly expensive, COUNT(*).`,
            r`-- Simulate a deep page: the engine must walk past 4 rows to return 1
EXPLAIN ANALYZE SELECT id FROM article ORDER BY id LIMIT 1 OFFSET 4;

-- OUTPUT (example, trimmed):
-- -> Limit/Offset: 1/4 row(s)  (actual rows=1 loops=1)
--     -> Index scan on article using PRIMARY  (actual rows=5 loops=1)`],
        [`<b>Limitations:</b> LIMIT and OFFSET accept only non-negative integer literals or placeholders (no expressions or column values); LIMIT is not allowed inside IN/ANY/ALL/SOME subqueries; and using LIMIT without ORDER BY gives arbitrary rows.`,
            r`SELECT id FROM article WHERE id IN (SELECT id FROM article ORDER BY id LIMIT 2);

-- OUTPUT:
-- ERROR 1235 (42000): This version of MySQL doesn't yet support 'LIMIT & IN/ALL/ANY/SOME subquery'
-- (wrap it in a derived table: ... IN (SELECT id FROM (SELECT id FROM article ORDER BY id LIMIT 2) t))`],
        `
   OFFSET paging                          Keyset (seek) paging
   page 1000: read 99,900 rows, drop       WHERE id > :last_id
   them, return 100                         ORDER BY id LIMIT 100
   ┌──────────────────────┐                ┌───────────────┬──────────┐
   │ skipped (wasted work)│ keep 100       │ jump via index │ keep 100 │
   └──────────────────────┘                └───────────────┴──────────┘
   cost grows with page number             cost constant
`,
        `Use OFFSET only for shallow, user-driven pages (admin grids). For infinite scroll and APIs use keyset pagination with a unique, indexed sort key (compound: created_at, id) and return an opaque cursor. Avoid exact total counts on large tables; show "next" or an estimate instead.`
    ),

    'DISTINCT': dd(
        [`<b>DISTINCT</b> removes duplicate rows from the result. Two rows are duplicates when every selected column is equal (NULLs count as equal for this purpose). <code>COUNT(DISTINCT col)</code> counts the unique non-NULL values.`,
            r`CREATE TABLE sale (id INT PRIMARY KEY, region VARCHAR(10), product VARCHAR(10), qty INT);
INSERT INTO sale VALUES (1,'North','Pen',5),(2,'North','Pen',7),(3,'South','Pen',2),(4,'South','Ink',9),(5,NULL,'Ink',1),(6,NULL,'Pen',3);

SELECT DISTINCT region FROM sale;

-- OUTPUT:
-- +--------+
-- | region |
-- +--------+
-- | North  |
-- | South  |
-- | NULL   |
-- +--------+`],
        [`Joins and denormalised data repeat values. Business questions like "which regions did we sell in" or "how many distinct customers" need uniqueness, not raw rows.`,
            r`SELECT DISTINCT region, product FROM sale ORDER BY region, product;     -- applies to the whole column list
SELECT COUNT(*) AS rows_all, COUNT(DISTINCT region) AS regions, COUNT(DISTINCT product) AS products FROM sale;

-- OUTPUT:
-- +--------+---------+
-- | region | product |
-- +--------+---------+
-- | NULL   | Ink     |
-- | NULL   | Pen     |
-- | North  | Pen     |
-- | South  | Ink     |
-- | South  | Pen     |
-- +--------+---------+
-- +----------+---------+----------+
-- | rows_all | regions | products |
-- +----------+---------+----------+
-- |        6 |       2 |        2 |      <- COUNT(DISTINCT) ignores NULL
-- +----------+---------+----------+`],
        [`DISTINCT often patches duplicates produced by an accidental one-to-many join. A better fix is EXISTS or a proper grouping, since DISTINCT hides the real problem and costs a sort or hash.`,
            r`CREATE TABLE customer (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT);
INSERT INTO customer VALUES (1,'Abaji'),(2,'Raoji');
INSERT INTO orders VALUES (1,1),(2,1),(3,1);

SELECT c.name FROM customer c JOIN orders o ON o.customer_id = c.id;               -- Abaji x3
SELECT c.name FROM customer c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT:
-- first query: Abaji, Abaji, Abaji
-- +------+
-- | name |
-- +------+
-- | Abaji |        <- EXISTS returns each qualifying customer once
-- +------+`],
        [`<b>Advantages:</b> a one-word way to deduplicate; works across multiple columns; <code>COUNT(DISTINCT)</code> answers cardinality questions; an index on the column lets MySQL do a loose index scan instead of reading every row.`,
            r`ALTER TABLE sale ADD KEY idx_region (region);
EXPLAIN SELECT DISTINCT region FROM sale;

-- OUTPUT (example, trimmed):
-- | type  | key        | Extra                    |
-- | range | idx_region | Using index for group-by |     <- skips between distinct values`],
        [`<b>Disadvantages:</b> needs a temporary table or sort to find duplicates (slow on millions of rows), masks join bugs, and DISTINCT with ORDER BY on a column not in the select list is rejected.`,
            r`SELECT DISTINCT region FROM sale ORDER BY qty;

-- OUTPUT:
-- ERROR 3065 (HY000): Expression #1 of ORDER BY clause is not in SELECT list, references
-- column 'sale.qty' which is not in SELECT list; this is incompatible with DISTINCT`],
        [`<b>Limitations:</b> DISTINCT applies to the entire select list, not one column (there is no DISTINCT ON as in PostgreSQL); it cannot be used with window functions to dedupe by one column; and COUNT(DISTINCT a, b) ignores any row where either column is NULL.`,
            r`SELECT COUNT(DISTINCT region, product) AS pairs FROM sale;     -- rows with NULL region are skipped

-- OUTPUT:
-- +-------+
-- | pairs |
-- +-------+
-- |     3 |
-- +-------+`],
        `
   rows ──► project selected columns ──► de-duplicate ──► result
                                           │
                       index on columns?  ─┴─ yes ─► loose index scan / ordered skip
                                              no  ─► temporary table / hash (extra cost)
   (a,x) (a,x) (b,y)   ►   (a,x) (b,y)
`,
        `Treat an urgent need for DISTINCT as a smell: first check whether the join multiplies rows. For top-per-group (what DISTINCT ON does elsewhere) use ROW_NUMBER() with a filter. For approximate counts of huge sets consider HyperLogLog in the application or a pre-aggregated rollup table.`
    ),

    'GROUP BY & HAVING in SELECT': dd(
        [`<b>GROUP BY</b> collapses rows that share the same values in the listed columns into one row per group, so aggregates (COUNT, SUM, AVG, MIN, MAX) are computed per group. <b>HAVING</b> filters those groups after aggregation, the way WHERE filters rows before it.`,
            r`CREATE TABLE sale (id INT PRIMARY KEY, region VARCHAR(10), product VARCHAR(10), amount DECIMAL(8,2));
INSERT INTO sale VALUES (1,'North','Pen',100),(2,'North','Ink',250),(3,'South','Pen',80),
                        (4,'South','Pen',120),(5,'East','Ink',50);

SELECT region, COUNT(*) AS orders, SUM(amount) AS revenue
FROM sale
GROUP BY region
ORDER BY revenue DESC;

-- OUTPUT:
-- +--------+--------+---------+
-- | region | orders | revenue |
-- +--------+--------+---------+
-- | North  |      2 |  350.00 |
-- | South  |      2 |  200.00 |
-- | East   |      1 |   50.00 |
-- +--------+--------+---------+`],
        [`Reports ask about groups, not rows: sales per region, signups per day, errors per service. Aggregation in the database sends only the summary, not millions of rows, to the application.`,
            r`-- HAVING keeps only groups that pass an aggregate test
SELECT region, SUM(amount) AS revenue
FROM sale
GROUP BY region
HAVING SUM(amount) >= 200;

-- OUTPUT:
-- +--------+---------+
-- | region | revenue |
-- +--------+---------+
-- | North  |  350.00 |
-- | South  |  200.00 |
-- +--------+---------+`],
        [`Real dashboards group by several columns, expressions (month of a date) and combine WHERE (cheap row filter first) with HAVING (group filter). <code>WITH ROLLUP</code> adds subtotal rows.`,
            r`SELECT region, product, SUM(amount) AS revenue
FROM sale
WHERE amount > 60                       -- filter rows first: less work to group
GROUP BY region, product WITH ROLLUP;   -- subtotals and grand total

-- OUTPUT:
-- +--------+---------+---------+
-- | region | product | revenue |
-- +--------+---------+---------+
-- | North  | Ink     |  250.00 |
-- | North  | Pen     |  100.00 |
-- | North  | NULL    |  350.00 |
-- | South  | Pen     |  200.00 |
-- | South  | NULL    |  200.00 |
-- | NULL   | NULL    |  550.00 |
-- +--------+---------+---------+`],
        [`<b>Advantages:</b> concise summarisation, server-side reduction of data, ROLLUP for totals, and an index on the grouping column can make aggregation stream without a temp table.`,
            r`ALTER TABLE sale ADD KEY idx_region (region);
EXPLAIN SELECT region, COUNT(*) FROM sale GROUP BY region;

-- OUTPUT (example, trimmed):
-- | type  | key        | Extra       |
-- | index | idx_region | Using index |        <- no temporary table needed`],
        [`<b>Disadvantages:</b> grouping a large unindexed set builds a temporary table (hash or sort) that can spill to disk; high-cardinality groups are costly; and non-aggregated columns in the select list are errors under ONLY_FULL_GROUP_BY (the 8.0 default) because their value would be ambiguous.`,
            r`SELECT region, product, SUM(amount) FROM sale GROUP BY region;      -- product is not grouped

-- OUTPUT:
-- ERROR 1055 (42000): Expression #2 of SELECT list is not in GROUP BY clause and contains
-- nonaggregated column 'sale.product' which is not functionally dependent on columns in
-- GROUP BY clause; this is incompatible with sql_mode=only_full_group_by`],
        [`<b>Limitations:</b> aggregates are not allowed in WHERE; HAVING without GROUP BY treats the whole table as one group; since 8.0.13 GROUP BY no longer sorts implicitly, so add ORDER BY when order matters; and WITH ROLLUP cannot be combined with ORDER BY directly in older versions.`,
            r`SELECT region FROM sale GROUP BY region;               -- order NOT guaranteed in 8.0
SELECT region FROM sale GROUP BY region ORDER BY region;  -- guaranteed

-- OUTPUT (second query):
-- +--------+
-- | region |
-- +--------+
-- | East   |
-- | North  |
-- | South  |
-- +--------+`],
        `
   sale rows                 GROUP BY region           HAVING SUM >= 200
   North 100                 ┌─ North: 100,250 ─► 350 ─────► keep
   North 250   ──hash/sort──►├─ South:  80,120 ─► 200 ─────► keep
   South  80                 └─ East :  50     ─►  50 ─────► drop
   South 120
   East   50
`,
        `Filter with WHERE before grouping whenever possible, index the grouping columns in the order of GROUP BY, and keep ONLY_FULL_GROUP_BY enabled to avoid nondeterministic results. For heavy, repeated dashboards precompute rollup tables or use summary tables refreshed by jobs instead of grouping the raw fact table on every request.`
    ),

    'Order of Clause Execution': dd(
        [`SQL is <i>written</i> in one order but <i>executed</i> in another. Logical order: <code>FROM / JOIN</code> then <code>WHERE</code> then <code>GROUP BY</code> then <code>HAVING</code> then window functions, <code>SELECT</code> (with DISTINCT), then <code>ORDER BY</code>, then <code>LIMIT</code>. Knowing this explains which names are visible where.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Abaji','IT',60),(2,'Raoji','HR',45),(3,'Mina','IT',52),(4,'Kanhoji','HR',40),(5,'Dev','IT',30);

SELECT dept, AVG(salary) AS avg_sal         -- 5. compute columns and aliases
FROM emp                                    -- 1. read table
WHERE salary >= 40                          -- 2. drop rows (Dev removed)
GROUP BY dept                               -- 3. build groups
HAVING AVG(salary) > 45                     -- 4. drop groups
ORDER BY avg_sal DESC                       -- 6. sort (alias is visible now)
LIMIT 1;                                    -- 7. cut

-- OUTPUT:
-- +------+---------+
-- | dept | avg_sal |
-- +------+---------+
-- | IT   | 56.0000 |
-- +------+---------+`],
        [`Without the mental model, errors look random: why can ORDER BY use an alias but WHERE cannot, why WHERE rejects SUM(), why a filter on a window function needs a subquery. The execution order answers all of them.`,
            r`SELECT salary * 2 AS double_sal FROM emp WHERE double_sal > 100;     -- WHERE runs before SELECT
SELECT salary * 2 AS double_sal FROM emp ORDER BY double_sal DESC LIMIT 1;   -- ORDER BY runs after

-- OUTPUT:
-- ERROR 1054 (42S22): Unknown column 'double_sal' in 'where clause'
-- +------------+
-- | double_sal |
-- +------------+
-- |        120 |
-- +------------+`],
        [`Performance reasoning uses the same order: filter early (WHERE) to shrink what is grouped, then use HAVING only for conditions that need aggregates. Window functions run after HAVING, so filtering their result requires a derived table or CTE.`,
            r`-- Filter on a window function result: needs a wrapper because WHERE runs earlier
SELECT * FROM (
    SELECT name, dept, salary, RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
    FROM emp
) t
WHERE rnk = 1;                              -- top earner per department

-- OUTPUT:
-- +-------+------+--------+-----+
-- | name  | dept | salary | rnk |
-- +-------+------+--------+-----+
-- | Abaji | IT   |     60 |   1 |
-- | Raoji | HR   |     45 |   1 |
-- +------+------+--------+-----+`],
        [`<b>Advantages:</b> a simple, consistent rule that predicts name visibility and lets you restructure a slow query by moving filters to the earliest legal stage.`,
            r`-- HAVING vs WHERE: same result, very different work
SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING dept = 'IT';   -- groups everything then filters
SELECT dept, COUNT(*) FROM emp WHERE dept = 'IT' GROUP BY dept;    -- filters then groups (better)

-- OUTPUT (both):
-- +------+----------+
-- | dept | COUNT(*) |
-- +------+----------+
-- | IT   |        3 |
-- +------+----------+`],
        [`<b>Disadvantages:</b> the logical order is not the physical one: the optimizer reorders joins, pushes predicates down and may sort earlier, so never depend on side effects or evaluation order. MySQL also accepts a few non-standard conveniences (aliases in GROUP BY and HAVING) that make the model look looser than it is.`,
            r`-- MySQL allows an alias in GROUP BY and HAVING (extension, not portable SQL)
SELECT UPPER(dept) AS d, COUNT(*) AS n FROM emp GROUP BY d HAVING n > 2;

-- OUTPUT:
-- +------+---+
-- | d    | n |
-- +------+---+
-- | IT   | 3 |
-- +------+---+`],
        [`<b>Limitations:</b> the model describes <i>logical</i> semantics only; EXPLAIN shows the actual plan. Short-circuit evaluation of AND/OR and the order of function calls are not guaranteed, so do not rely on one predicate protecting another from errors such as division by zero.`,
            r`-- Not safe: the optimizer may evaluate the division before the guard
SELECT * FROM emp WHERE salary <> 0 AND 100 / salary > 2;
-- Safe: make the guard part of the expression
SELECT * FROM emp WHERE 100 / NULLIF(salary, 0) > 2;

-- OUTPUT:
-- (no ordering promise between the two predicates in the first form;
--  the second returns NULL, not an error, for salary = 0)`],
        `
   Written:  SELECT ─ FROM ─ WHERE ─ GROUP BY ─ HAVING ─ ORDER BY ─ LIMIT
   Runs as:
     1 FROM / JOIN      (build the row source)
     2 WHERE            (row filter, no aliases, no aggregates)
     3 GROUP BY         (form groups)
     4 HAVING           (group filter, aggregates allowed)
     5 Window functions (OVER ...)
     6 SELECT + DISTINCT(aliases are born here)
     7 ORDER BY         (aliases visible)
     8 LIMIT / OFFSET
`,
        `Use the logical order as a debugging checklist, then confirm with EXPLAIN ANALYZE because the physical plan differs. Push every filter as early as the semantics allow, and avoid writing queries whose correctness depends on short-circuit order; make guards explicit with CASE or NULLIF.`
    ),
};
