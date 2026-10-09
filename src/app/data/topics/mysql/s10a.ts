// Module 10 (Aggregate Functions): COUNT/SUM/AVG/MIN/MAX, GROUP BY, WHERE vs HAVING.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s10a: Record<string, DeepDive> = {
    'COUNT, SUM, AVG, MIN & MAX': dd(
        [`<b>Aggregate functions</b> collapse many rows into one value: <code>COUNT</code> (how many), <code>SUM</code> (total), <code>AVG</code> (mean), <code>MIN</code> and <code>MAX</code> (extremes). Without <code>GROUP BY</code> the whole table becomes one group.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Asha','IT',50000), (2,'Ravi','IT',70000),
                       (3,'Meena','HR',40000), (4,'John','HR',NULL), (5,'Zoya','OPS',60000);

SELECT COUNT(*)    AS rows_,     -- all rows
       SUM(salary) AS total,     -- NULL ignored
       AVG(salary) AS average,
       MIN(salary) AS lowest,
       MAX(salary) AS highest
FROM emp;

-- OUTPUT:
-- +------+--------+------------+--------+---------+
-- | rows_| total  | average    | lowest | highest |
-- +------+--------+------------+--------+---------+
-- |    5 | 220000 | 55000.0000 |  40000 |   70000 |
-- +------+--------+------------+--------+---------+`],
        [`Reports ask summary questions: total sales, number of customers, average rating. Computing them in the server sends one row to the client instead of millions.`,
            r`-- Without aggregates you would fetch every salary and add them up in application code.
-- With aggregates the server does it and returns a single row.
SELECT COUNT(salary)          AS paid_staff,     -- counts non-NULL salaries only
       COUNT(DISTINCT dept)   AS departments,    -- unique departments
       SUM(salary) / COUNT(*) AS naive_avg       -- divides by 5, not 4
FROM emp;

-- OUTPUT:
-- +------------+-------------+------------+
-- | paid_staff | departments | naive_avg  |
-- +------------+-------------+------------+
-- |          4|           3 | 44000.0000 |
-- +------------+-------------+------------+`],
        [`Dashboards (daily revenue), monitoring (max latency), inventory (min stock), finance (average order value) and data-quality checks (count of NULLs).`,
            r`-- Data quality check: how many rows miss a salary?
SELECT COUNT(*) - COUNT(salary) AS missing_salary,       -- COUNT(col) skips NULLs
       SUM(salary IS NULL)      AS missing_via_sum,      -- boolean is 0/1, so SUM counts true
       MAX(salary) - MIN(salary) AS spread
FROM emp;

-- OUTPUT:
-- +----------------+-----------------+--------+
-- | missing_salary | missing_via_sum | spread |
-- +----------------+-----------------+--------+
-- |              1 |               1 |  30000 |
-- +----------------+-----------------+--------+`],
        [`<b>Advantages:</b> declarative, optimised (COUNT(*) and MIN/MAX on an indexed column can be answered from the index), work on any expression, and combine freely in one SELECT.`,
            r`SELECT SUM(CASE WHEN dept = 'IT' THEN salary END) AS it_payroll,   -- conditional aggregate
       SUM(CASE WHEN dept = 'HR' THEN salary END) AS hr_payroll,
       MAX(name)                                  AS last_name_alpha  -- MIN/MAX work on text too
FROM emp;

-- OUTPUT:
-- +------------+------------+-----------------+
-- | it_payroll | hr_payroll | last_name_alpha |
-- +------------+------------+-----------------+
-- |     120000 |      40000 | Zoya            |
-- +------------+------------+-----------------+`],
        [`<b>Disadvantages:</b> they must read every qualifying row; <code>COUNT(*)</code> on a big InnoDB table is a scan (no stored row count), and <code>DISTINCT</code> aggregates need extra memory.`,
            r`-- InnoDB keeps no exact row counter because of MVCC (each transaction sees different rows),
-- so this walks the smallest index:
SELECT COUNT(*) FROM emp;

-- Approximate alternative for huge tables (statistics, not exact):
-- SELECT TABLE_ROWS FROM information_schema.TABLES
--  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'emp';

-- OUTPUT:
-- +----------+
-- | COUNT(*) |
-- +----------+
-- |        5 |
-- +----------+`],
        [`<b>Limitations:</b> aggregates ignore NULL (except <code>COUNT(*)</code>); on an empty set <code>COUNT</code> gives 0 but <code>SUM</code>/<code>AVG</code>/<code>MIN</code>/<code>MAX</code> give NULL; aggregates cannot be used in <code>WHERE</code>.`,
            r`SELECT COUNT(*)    AS cnt,        -- 0 on empty set
       SUM(salary)  AS total,      -- NULL on empty set
       COALESCE(SUM(salary), 0) AS safe_total
FROM emp WHERE dept = 'NONE';

-- This is an error: aggregate not allowed in WHERE
-- SELECT * FROM emp WHERE salary > AVG(salary);   -- ERROR 1111 Invalid use of group function

-- OUTPUT:
-- +-----+-------+------------+
-- | cnt | total | safe_total |
-- +-----+-------+------------+
-- |   0 | NULL  |          0 |
-- +-----+-------+------------+`],
        `
   emp rows                         one result row
   +----+--------+                  +-----+--------+--------+-----+-----+
   | 50000      |                  | CNT | SUM    | AVG    | MIN | MAX |
   | 70000      |  --aggregate-->  +-----+--------+--------+-----+-----+
   | 40000      |                  |  5  | 220000 | 55000  |40000|70000|
   | NULL (skip)|                  +-----+--------+--------+-----+-----+
   | 60000      |
`,
        `Aggregates are cheap on indexed columns and expensive on wide scans. For dashboards over big tables precompute summary tables (maintained by jobs or triggers) rather than scanning facts each time, and be explicit about NULL semantics so averages are not silently biased.`
    ),

    'GROUP BY with Aggregates': dd(
        [`<b>GROUP BY</b> splits rows into groups that share the same value(s), then applies aggregates to each group separately, returning one row per group.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Asha','IT',50000), (2,'Ravi','IT',70000),
                       (3,'Meena','HR',40000), (4,'John','HR',45000), (5,'Zoya','OPS',60000);

SELECT dept,
       COUNT(*)    AS headcount,   -- rows in each group
       SUM(salary) AS payroll
FROM emp
GROUP BY dept                      -- one output row per distinct dept
ORDER BY dept;

-- OUTPUT:
-- +------+-----------+---------+
-- | dept | headcount | payroll |
-- +------+-----------+---------+
-- | HR   |         2 |   85000 |
-- | IT   |         2 |  120000 |
-- | OPS  |         1 |   60000 |
-- +------+-----------+---------+`],
        [`A single total is rarely enough; managers want totals per department, per month, per product. <code>GROUP BY</code> gives the breakdown in one pass.`,
            r`-- Group by two columns: each distinct (dept, salary band) pair is a group
SELECT dept,
       salary >= 50000 AS high_pay,    -- expression used as a grouping key (0 or 1)
       COUNT(*)        AS n
FROM emp
GROUP BY dept, salary >= 50000
ORDER BY dept, high_pay;

-- OUTPUT:
-- +------+----------+---+
-- | dept | high_pay | n |
-- +------+----------+---+
-- | HR   |        0 | 2 |
-- | IT   |        1 | 2 |
-- | OPS  |        1 | 1 |
-- +------+----------+---+`],
        [`Sales by region, signups per day, error count per service, top customers by spend, with <code>WITH ROLLUP</code> for subtotals.`,
            r`-- Subtotals and a grand total in one query
SELECT dept, SUM(salary) AS payroll
FROM emp
GROUP BY dept WITH ROLLUP;       -- adds a final row where dept is NULL = grand total

-- OUTPUT:
-- +------+---------+
-- | dept | payroll |
-- +------+---------+
-- | HR   |   85000 |
-- | IT   |  120000 |
-- | OPS  |   60000 |
-- | NULL |  265000 |
-- +------+---------+`],
        [`<b>Advantages:</b> one scan produces all groups; can group by expressions; MySQL 8 no longer sorts groups implicitly (use <code>ORDER BY</code>) so the optimiser is free to hash or use an index.`,
            r`-- Which department has the highest average salary?
SELECT dept, ROUND(AVG(salary)) AS avg_sal
FROM emp
GROUP BY dept
ORDER BY avg_sal DESC     -- sort the groups by their aggregate
LIMIT 1;

-- OUTPUT:
-- +------+---------+
-- | dept | avg_sal |
-- +------+---------+
-- | OPS  |   60000 |
-- +------+---------+`],
        [`<b>Disadvantages:</b> grouping may need a temporary table or filesort on large inputs, and with many distinct groups the result (and memory) approaches the table size.`,
            r`EXPLAIN SELECT dept, COUNT(*) FROM emp GROUP BY dept;

-- OUTPUT (example, abbreviated):
-- +----+-------+------+------+-----------------+
-- | id | table | type | key  | Extra           |
-- +----+-------+------+------+-----------------+
-- |  1 | emp   | ALL  | NULL | Using temporary |   <- no index on dept: a temp table holds the groups
-- +----+-------+------+------+-----------------+
-- Fix: CREATE INDEX idx_dept ON emp(dept);  -- lets MySQL stream groups in order`],
        [`<b>Limitations:</b> with <code>ONLY_FULL_GROUP_BY</code> (default) every selected column must be grouped, aggregated, or functionally dependent on the group key; NULLs form one group.`,
            r`-- Rejected under ONLY_FULL_GROUP_BY: 'name' is neither grouped nor aggregated
-- SELECT dept, name, COUNT(*) FROM emp GROUP BY dept;
--   ERROR 1055: Expression #2 of SELECT list is not in GROUP BY clause

-- Fix 1: aggregate it            Fix 2: ANY_VALUE() if any row will do
SELECT dept, ANY_VALUE(name) AS some_name, COUNT(*) AS n
FROM emp GROUP BY dept ORDER BY dept;

-- OUTPUT (example, ANY_VALUE picks an arbitrary row):
-- +------+-----------+---+
-- | dept | some_name | n |
-- +------+-----------+---+
-- | HR   | Meena     | 2 |
-- | IT   | Asha      | 2 |
-- | OPS  | Zoya      | 1 |
-- +------+-----------+---+`],
        `
   emp                      GROUP BY dept               aggregate per group
   IT  50000  --+                +-> [IT : 50000,70000]  -> SUM=120000
   IT  70000  --+--- bucket ---> +-> [HR : 40000,45000]  -> SUM= 85000
   HR  40000  --+                +-> [OPS: 60000]        -> SUM= 60000
   HR  45000  --+
   OPS 60000  --+
`,
        `Index the grouping columns (or a composite covering index) so MySQL can do a loose or ordered scan instead of a temp table. Beware high-cardinality grouping on OLTP databases; push heavy analytics to replicas or a warehouse and keep ONLY_FULL_GROUP_BY enabled to avoid nondeterministic results.`
    ),

    'WHERE vs HAVING': dd(
        [`<b>WHERE</b> filters individual rows <i>before</i> grouping; <b>HAVING</b> filters groups <i>after</i> aggregation and may use aggregate functions.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Asha','IT',50000), (2,'Ravi','IT',70000),
                       (3,'Meena','HR',40000), (4,'John','HR',45000), (5,'Zoya','OPS',60000);

SELECT dept, SUM(salary) AS payroll
FROM emp
WHERE salary >= 45000          -- row filter: Meena (40000) is dropped before grouping
GROUP BY dept
HAVING SUM(salary) > 60000;    -- group filter: keep big payrolls only

-- OUTPUT:
-- +------+---------+
-- | dept | payroll |
-- +------+---------+
-- | IT   |  120000 |
-- +------+---------+`],
        [`You need both: remove irrelevant rows cheaply first, then keep only groups that satisfy an aggregate condition ("departments with more than 1 employee").`,
            r`SELECT dept, COUNT(*) AS n
FROM emp
GROUP BY dept
HAVING COUNT(*) > 1          -- cannot be written in WHERE: the count does not exist yet
ORDER BY dept;

-- OUTPUT:
-- +------+---+
-- | dept | n |
-- +------+---+
-- | HR   | 2 |
-- | IT   | 2 |
-- +------+---+`],
        [`Find customers with more than 5 orders, products sold fewer than 10 times, duplicate e-mails (<code>HAVING COUNT(*) &gt; 1</code>), or days with revenue above target.`,
            r`CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(30));
INSERT INTO users VALUES (1,'a@x.com'), (2,'b@x.com'), (3,'a@x.com');

-- Classic duplicate finder
SELECT email, COUNT(*) AS copies
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- OUTPUT:
-- +---------+--------+
-- | email   | copies |
-- +---------+--------+
-- | a@x.com |      2 |
-- +---------+--------+`],
        [`<b>Advantages:</b> putting row conditions in <code>WHERE</code> shrinks the data before grouping, so less work and index use; <code>HAVING</code> expresses what <code>WHERE</code> cannot.`,
            r`-- Same result, but the first form filters rows before grouping (preferred)
SELECT dept, COUNT(*) FROM emp WHERE dept = 'IT' GROUP BY dept;
SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING dept = 'IT';   -- groups everything, then discards

-- OUTPUT (both):
-- +------+----------+
-- | dept | COUNT(*) |
-- +------+----------+
-- | IT   |        2 |
-- +------+----------+
-- The optimiser often moves simple HAVING conditions down, but do not rely on it.`],
        [`<b>Disadvantages:</b> <code>HAVING</code> conditions on aggregates cannot use indexes directly, and mixing the two clauses confuses beginners about evaluation order.`,
            r`-- Aggregate in WHERE is illegal because groups do not exist yet:
-- SELECT dept FROM emp WHERE COUNT(*) > 1 GROUP BY dept;
--   ERROR 1111 (HY000): Invalid use of group function

-- Logical order:  FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY -> LIMIT
SELECT dept, COUNT(*) AS n FROM emp GROUP BY dept HAVING n > 1 ORDER BY dept;  -- MySQL lets HAVING use a select alias

-- OUTPUT:
-- +------+---+
-- | dept | n |
-- +------+---+
-- | HR   | 2 |
-- | IT   | 2 |
-- +------+---+`],
        [`<b>Limitations:</b> <code>WHERE</code> cannot see select aliases or aggregates; <code>HAVING</code> without <code>GROUP BY</code> treats the whole table as one group; alias use in HAVING is a MySQL extension, not portable.`,
            r`-- HAVING without GROUP BY: the whole table is a single group
SELECT SUM(salary) AS total
FROM emp
HAVING SUM(salary) > 100000;     -- returns the row only if the condition holds

SELECT SUM(salary) AS total
FROM emp
HAVING SUM(salary) > 999999;     -- returns no rows at all

-- OUTPUT (first query, then second):
-- +--------+
-- | total  |
-- +--------+
-- | 265000 |
-- +--------+
-- Empty set (0.00 sec)`],
        `
   FROM emp
     |
     v   WHERE salary >= 45000        (rows)    <- indexes help here
   GROUP BY dept
     |
     v   HAVING SUM(salary) > 60000   (groups)  <- aggregates allowed
   SELECT / ORDER BY / LIMIT
`,
        `Rule of thumb: anything that can be decided per row goes in WHERE, only aggregate conditions go in HAVING. Use EXPLAIN to confirm filtering happens before grouping and index the WHERE and GROUP BY columns together as a composite index.`
    ),
};

