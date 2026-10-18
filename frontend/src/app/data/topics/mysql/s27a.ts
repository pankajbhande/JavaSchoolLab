// Module 27 (Common Table Expressions): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s27a: Record<string, DeepDive> = {
    'CTE Basics & Multiple CTEs': dd(
        [`A <b>Common Table Expression</b> is a named, temporary result set defined with <code>WITH name AS (SELECT ...)</code> and usable in the single statement that follows. Think of it as a readable alias for a subquery. CTEs need MySQL 8.0+.`,
            r`CREATE TABLE orders (id INT PRIMARY KEY, customer VARCHAR(10), amount INT);
INSERT INTO orders VALUES (1,'A',100),(2,'A',300),(3,'B',50),(4,'B',70),(5,'C',500);

WITH customer_totals AS (                 -- name the intermediate result
  SELECT customer, SUM(amount) AS total   -- one row per customer
  FROM   orders
  GROUP  BY customer
)
SELECT customer, total                    -- then query it like a table
FROM   customer_totals
WHERE  total > 100
ORDER  BY total DESC;

-- OUTPUT:
-- +----------+-------+
-- | customer | total |
-- +----------+-------+
-- | C        |   500 |
-- | A        |   400 |
-- | B        |   120 |
-- +----------+-------+`],
        [`Deeply nested subqueries are hard to read and debug. A CTE lets you build a query top-down in named steps, and a CTE referenced twice is written once, so the logic cannot diverge.`,
            r`-- Compare each customer's total to the average of all totals - uses the CTE twice
WITH t AS (
  SELECT customer, SUM(amount) AS total FROM orders GROUP BY customer
)
SELECT customer, total,
       total > (SELECT AVG(total) FROM t) AS above_avg    -- second use of t
FROM   t
ORDER  BY customer;

-- OUTPUT:
-- +----------+-------+-----------+
-- | customer | total | above_avg |
-- +----------+-------+-----------+
-- | A        |   400 |         1 |
-- | B        |   120 |         0 |
-- | C        |   500 |         1 |
-- +----------+-------+-----------+`],
        [`Real use: reporting pipelines - clean the data in CTE 1, aggregate in CTE 2 (which reads CTE 1), join the results in the final SELECT. Multiple CTEs are separated by commas under a single WITH, and a later one can use an earlier one.`,
            r`WITH big AS (                                   -- step 1: filter
  SELECT * FROM orders WHERE amount >= 100
),
per_cust AS (                                     -- step 2: reads step 1
  SELECT customer, COUNT(*) AS n, SUM(amount) AS total
  FROM   big GROUP BY customer
)
SELECT p.customer, p.n, p.total,                  -- step 3: final query
       ROUND(100 * p.total / SUM(p.total) OVER (), 1) AS pct
FROM   per_cust p
ORDER  BY p.customer;

-- OUTPUT:
-- +----------+---+-------+------+
-- | customer | n | total | pct  |
-- +----------+---+-------+------+
-- | A        | 2 |   400 |  44.4|
-- | C        | 1 |   500 |  55.6|
-- +----------+---+-------+------+`],
        [`<b>Advantages:</b> readable top-to-bottom flow, reuse inside one statement, can be used with INSERT ... SELECT, UPDATE, DELETE and CREATE TABLE ... AS, and it is the foundation for recursion.`,
            r`-- CTE with DELETE: remove the largest order of each customer
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY customer ORDER BY amount DESC) AS rn
  FROM   orders
)
DELETE FROM orders WHERE id IN (SELECT id FROM ranked WHERE rn = 1);
SELECT id, customer, amount FROM orders ORDER BY id;

-- OUTPUT:
-- +----+----------+--------+
-- | id | customer | amount |
-- +----+----------+--------+
-- |  1 | A        |    100 |
-- |  3 | B        |     50 |
-- +----+----------+--------+`],
        [`<b>Disadvantages:</b> a CTE is not a stored object; it vanishes after the statement. Before MySQL 8.0.x the optimiser could materialise a CTE and not push predicates into it; each reference may be recomputed or materialised once, so cost depends on the plan.`,
            r`-- Check how the optimiser treated the CTE
EXPLAIN
WITH t AS (SELECT customer, SUM(amount) AS total FROM orders GROUP BY customer)
SELECT * FROM t WHERE customer = 'A';

-- OUTPUT (example): a DERIVED row (materialised) or, if mergeable, no derived row
-- +----+-------------+------------+-------+
-- | id | select_type | table      | type  |
-- +----+-------------+------------+-------+
-- |  1 | PRIMARY     | <derived2> | ALL   |
-- |  2 | DERIVED     | orders     | ALL   |
-- +----+-------------+------------+-------+`],
        [`<b>Limitations:</b> scope is one statement; a CTE name shadows a real table of the same name; no CTE in the middle of a statement except in subqueries or derived tables (WITH must be at the start of that query block); you cannot index a CTE.`,
            r`-- Limitation: the CTE is gone after its statement
WITH t AS (SELECT 1 AS x) SELECT * FROM t;     -- works
SELECT * FROM t;                               -- different statement: t does not exist

-- OUTPUT:
-- +---+
-- | x |
-- +---+
-- | 1 |
-- +---+
-- ERROR 1146 (42S02): Table 'mydb.t' doesn't exist`],
        `
   WITH step1 AS ( SELECT ... FROM base ),
        step2 AS ( SELECT ... FROM step1 ),     <- may use earlier CTEs
        step3 AS ( SELECT ... FROM step2 )
   SELECT ... FROM step3 JOIN step1 ...         <- the one main statement
        |
        v
   result set        (CTEs are discarded; nothing is stored)
`,
        `Use CTEs to make large analytical SQL reviewable - one idea per CTE with a descriptive name. Do not assume CTE means "computed once": check EXPLAIN, and if a heavy CTE is referenced several times and you need an index on it, switch to a temporary table. Keep each query block self-explanatory so DBAs can tune it later.`
    ),

    'Recursive CTE': dd(
        [`A <b>recursive CTE</b> references itself. It has an <i>anchor</i> member (the starting rows) combined by <code>UNION ALL</code> with a <i>recursive</i> member that joins the previous iteration's rows; evaluation repeats until the recursive part returns no new rows. Syntax: <code>WITH RECURSIVE</code>.`,
            r`-- Generate the numbers 1..5 without any table
WITH RECURSIVE nums (n) AS (
  SELECT 1                                -- anchor: start with 1
  UNION ALL
  SELECT n + 1 FROM nums WHERE n < 5      -- recursive: previous row + 1, stop at 5
)
SELECT n FROM nums;

-- OUTPUT:
-- +------+
-- | n    |
-- +------+
-- |    1 |
-- |    2 |
-- |    3 |
-- |    4 |
-- |    5 |
-- +------+`],
        [`Hierarchies (org charts, categories, bill of materials, folder trees) have unknown depth, which fixed self-joins cannot handle. A recursive CTE walks any depth in one query.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), manager_id INT NULL);
INSERT INTO emp VALUES (1,'CEO',NULL),(2,'VP Eng',1),(3,'VP Ops',1),(4,'Dev',2),(5,'Intern',4);

WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 0 AS depth,
         CAST(name AS CHAR(200)) AS path             -- cast: width fixed by anchor
  FROM   emp WHERE manager_id IS NULL                -- anchor: the root
  UNION ALL
  SELECT e.id, e.name, e.manager_id, c.depth + 1,
         CONCAT(c.path, ' > ', e.name)               -- extend the path
  FROM   emp e JOIN chain c ON e.manager_id = c.id   -- children of previous level
)
SELECT depth, path FROM chain ORDER BY path;

-- OUTPUT:
-- +-------+------------------------------+
-- | depth | path                         |
-- +-------+------------------------------+
-- |     0 | CEO                          |
-- |     1 | CEO > VP Eng                 |
-- |     2 | CEO > VP Eng > Dev           |
-- |     3 | CEO > VP Eng > Dev > Intern  |
-- |     1 | CEO > VP Ops                 |
-- +-------+------------------------------+`],
        [`Real uses: expanding a category tree for a product page, finding all reports (direct and indirect) of a manager, date series for gap-filled reports, and graph reachability with cycle control.`,
            r`-- Date series: every day of a week, so a report shows zero-sales days too
WITH RECURSIVE days (d) AS (
  SELECT DATE '2025-03-03'
  UNION ALL
  SELECT d + INTERVAL 1 DAY FROM days WHERE d < DATE '2025-03-09'
)
SELECT d, DAYNAME(d) AS dow FROM days;

-- OUTPUT:
-- +------------+-----------+
-- | d          | dow       |
-- +------------+-----------+
-- | 2025-03-03 | Monday    |
-- | 2025-03-04 | Tuesday   |
-- | 2025-03-05 | Wednesday |
-- | 2025-03-06 | Thursday  |
-- | 2025-03-07 | Friday    |
-- | 2025-03-08 | Saturday  |
-- | 2025-03-09 | Sunday    |
-- +------------+-----------+`],
        [`<b>Advantages:</b> standard SQL, arbitrary depth in one statement, easy path/level tracking, and it can generate series without helper tables.`,
            r`-- All subordinates of employee 2 (direct and indirect)
WITH RECURSIVE sub AS (
  SELECT id, name FROM emp WHERE id = 2
  UNION ALL
  SELECT e.id, e.name FROM emp e JOIN sub s ON e.manager_id = s.id
)
SELECT name FROM sub WHERE id <> 2 ORDER BY id;

-- OUTPUT:
-- +--------+
-- | name   |
-- +--------+
-- | Dev    |
-- | Intern |
-- +--------+`],
        [`<b>Disadvantages:</b> an infinite loop is possible if the data has a cycle; MySQL stops it only at the safety limits (<code>cte_max_recursion_depth</code> default 1000, or <code>max_execution_time</code>). The recursive member also cannot use aggregates, window functions, DISTINCT or LEFT JOIN on the CTE.`,
            r`-- A cycle in the data: 1 reports to 2, 2 reports to 1
CREATE TABLE loop_emp (id INT PRIMARY KEY, manager_id INT);
INSERT INTO loop_emp VALUES (1,2),(2,1);

WITH RECURSIVE walk AS (
  SELECT id, manager_id FROM loop_emp WHERE id = 1
  UNION ALL
  SELECT l.id, l.manager_id FROM loop_emp l JOIN walk w ON l.id = w.manager_id
)
SELECT COUNT(*) FROM walk;

-- OUTPUT:
-- ERROR 3636 (HY000): Recursive query aborted after 1001 iterations.
--   Try increasing @@cte_max_recursion_depth to a larger value.`],
        [`<b>Limitations:</b> non-recursive SELECT must come first (the anchor); recursive part must reference the CTE exactly once and not in a subquery; column widths come from the anchor row (hence the CAST above, or strings are truncated or error in strict mode); no ORDER BY or LIMIT inside the recursion that changes semantics.`,
            r`-- Detect cycles by tracking the visited path, so the walk stops by itself
WITH RECURSIVE walk AS (
  SELECT id, manager_id, CAST(id AS CHAR(100)) AS seen
  FROM   loop_emp WHERE id = 1
  UNION ALL
  SELECT l.id, l.manager_id, CONCAT(w.seen, ',', l.id)
  FROM   loop_emp l JOIN walk w ON l.id = w.manager_id
  WHERE  FIND_IN_SET(l.id, w.seen) = 0            -- do not revisit a node
)
SELECT seen FROM walk;

-- OUTPUT:
-- +------+
-- | seen |
-- +------+
-- | 1    |
-- | 1,2  |
-- +------+`],
        `
   anchor:     SELECT root rows          -> working set W0
                                              |
   recursive:  SELECT ... FROM table JOIN W(k)  -> new rows W(k+1)
                                              |
        repeat while W(k+1) not empty  (limit: cte_max_recursion_depth = 1000)
                                              |
   result = W0 UNION ALL W1 UNION ALL W2 ...

   CEO(0) -> VP Eng(1) -> Dev(2) -> Intern(3)
          -> VP Ops(1)
`,
        `Recursive CTEs are the right tool for modest trees (thousands of nodes). For very large or hot hierarchies, store a path (materialised path), nested set, or closure table so reads are index lookups instead of iterative joins. Always index the parent column, cap depth with a WHERE condition and cycle guard, and raise <code>cte_max_recursion_depth</code> per session rather than globally.`
    ),

    'CTE vs Subquery vs Temporary Table': dd(
        [`All three hold an intermediate result. A <b>subquery</b> (derived table) is inline in one place; a <b>CTE</b> is a named block for the whole statement; a <b>temporary table</b> is a real, session-scoped table you can index, reuse across statements and inspect.`,
            r`CREATE TABLE sales (id INT PRIMARY KEY, region VARCHAR(10), amt INT);
INSERT INTO sales VALUES (1,'N',10),(2,'N',30),(3,'S',20),(4,'S',40),(5,'S',60);

-- 1) Subquery (derived table)
SELECT region FROM (SELECT region, SUM(amt) AS s FROM sales GROUP BY region) x WHERE s > 50;

-- 2) CTE
WITH x AS (SELECT region, SUM(amt) AS s FROM sales GROUP BY region)
SELECT region FROM x WHERE s > 50;

-- 3) Temporary table
CREATE TEMPORARY TABLE x AS SELECT region, SUM(amt) AS s FROM sales GROUP BY region;
SELECT region FROM x WHERE s > 50;

-- OUTPUT (each of the three):
-- +--------+
-- | region |
-- +--------+
-- | S      |
-- +--------+`],
        [`The choice affects readability, reuse and performance. Same logic, different life-time and optimiser freedom: subqueries and CTEs are merged or materialised by the optimiser; a temporary table is always materialised but can be indexed and used by many statements.`,
            r`-- Reuse across statements is only possible with a temporary table
SELECT region, s FROM x ORDER BY s DESC;                     -- statement 1
SELECT SUM(s) AS grand_total FROM x;                         -- statement 2, no recompute
-- A CTE would need to be rewritten (and recomputed) in each statement.

-- OUTPUT:
-- +--------+----+
-- | region | s  |
-- +--------+----+
-- | S      | 120|
-- | N      |  40|
-- +--------+----+
-- +-------------+
-- | grand_total |
-- +-------------+
-- |         160 |
-- +-------------+`],
        [`Rule of thumb in real projects: subquery for a one-off filter; CTE when readability or recursion matters; temporary table when the intermediate set is big, reused, or needs an index to be joined efficiently.`,
            r`-- Big intermediate result joined many times: index the temporary table
CREATE TEMPORARY TABLE hot_ids (id INT PRIMARY KEY)          -- PK gives fast joins
  AS SELECT id FROM sales WHERE amt >= 30;
SELECT s.id, s.amt
FROM   sales s JOIN hot_ids h ON h.id = s.id                 -- uses the PK
ORDER  BY s.id;

-- OUTPUT:
-- +----+-----+
-- | id | amt |
-- +----+-----+
-- |  2 |  30 |
-- |  4 |  40 |
-- |  5 |  60 |
-- +----+-----+`],
        [`<b>Advantages summary:</b> subquery - zero ceremony and often merged into the outer query; CTE - clarity, multi-use within the statement, recursion; temp table - indexes, statistics, multi-statement reuse, debuggable with plain SELECT.`,
            r`-- A temp table's contents can be inspected mid-script; a CTE cannot
SELECT COUNT(*) AS rows_in_x FROM x;

-- OUTPUT:
-- +-----------+
-- | rows_in_x |
-- +-----------+
-- |         2 |
-- +-----------+`],
        [`<b>Disadvantages summary:</b> subquery - repeated text if used twice; CTE - not reusable beyond one statement, no index, may be materialised per reference; temp table - extra write cost, cleanup, per-connection state that interacts badly with connection pooling and replication.`,
            r`-- Temp table pitfall: it belongs to ONE connection
-- Connection 1:
CREATE TEMPORARY TABLE t1 (a INT);
-- Connection 2:
SELECT * FROM t1;

-- OUTPUT:
-- ERROR 1146 (42S02): Table 'mydb.t1' doesn't exist`],
        [`<b>Limitations:</b> a temporary table cannot be referenced twice in the same query (error 1137 - classic restriction, relaxed for CTEs and derived tables); CTEs cannot be indexed; and writes to a temp table inside a replicated statement-based transaction need care.`,
            r`-- Same TEMPORARY table twice in one statement is rejected
SELECT a.region, b.region FROM x a JOIN x b ON a.region <> b.region;

-- OUTPUT:
-- ERROR 1137 (HY000): Can't reopen table: 'a'
-- (a CTE or a permanent table can be joined to itself without this error)`],
        `
                 lifetime            indexable   reusable   optimiser
   Subquery      one place           no          no         merge/materialise
   CTE           one statement       no          in-stmt    merge/materialise
   TEMP TABLE    session/connection  YES         YES        always real table

   small + once        -> subquery
   readable / recursive-> CTE
   big / reused / join -> temporary table (with index)
`,
        `Default to CTEs for clarity, and promote to a temporary table only when EXPLAIN or the slow log shows repeated expensive recomputation or a missing index on the intermediate set. Under connection pooling prefer explicit DROP TEMPORARY TABLE at the end of a unit of work, and avoid temp tables entirely behind proxies that multiplex sessions.`
    ),
};
