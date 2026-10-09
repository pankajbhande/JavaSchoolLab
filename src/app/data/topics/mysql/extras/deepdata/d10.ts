// Deep dive, modules 27-31 (CTE, Window Functions, JSON, Full-Text Search, Temporary Tables).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d10: Record<string, Deep> = {
    'CTE Basics & Multiple CTEs': dv(
        [`A CTE is a named subquery defined with WITH and visible only to the statement that follows. MySQL treats a simple CTE like a derived table: it is merged into the outer query when possible, so indexes and filters are pushed down. A CTE that is referenced more than once, or that cannot be merged, is materialized once into a temporary table.`,
            r`EXPLAIN FORMAT=TREE WITH high AS (SELECT * FROM emp WHERE salary > 50000) SELECT dept, COUNT(*) FROM high GROUP BY dept;
EXPLAIN FORMAT=TREE WITH high AS (SELECT * FROM emp WHERE salary > 50000) SELECT (SELECT COUNT(*) FROM high), (SELECT AVG(salary) FROM high);

-- OUTPUT: (example)
-- first : merged into the query (no temporary table)
-- second: -> Materialize CTE high (shared by both references)`],
        [`Define several CTEs separated by commas; later ones may use earlier ones. Name the columns explicitly when helpful. A CTE can feed SELECT, INSERT ... SELECT, UPDATE, DELETE and CREATE TABLE AS.`,
            r`WITH dept_totals (dept, total) AS (SELECT dept, SUM(salary) FROM emp GROUP BY dept),
     company (grand) AS (SELECT SUM(total) FROM dept_totals)
SELECT d.dept, d.total, ROUND(d.total / c.grand * 100, 1) AS pct FROM dept_totals d CROSS JOIN company c;
WITH old AS (SELECT id FROM sessions WHERE expires_at < NOW()) DELETE s FROM sessions s JOIN old ON old.id = s.id;

-- OUTPUT:
-- dept | total  | pct
--   10 | 105000 | 60.0
--   20 |  70000 | 40.0`],
        [`Mistakes: expecting a CTE to be a performance fence or a cache (it is not by default), long chains that are hard to debug, and reusing a name that shadows a real table. Verify the plan and keep chains short and named clearly.`,
            r`WITH emp AS (SELECT * FROM emp WHERE dept = 10) SELECT COUNT(*) FROM emp;     -- shadows the base table inside this statement
WITH recent AS (SELECT * FROM orders WHERE created_at >= '2026-05-01') SELECT COUNT(*) FROM recent r1 JOIN recent r2 ON r1.customer_id = r2.customer_id;

-- OUTPUT:
-- COUNT(*)
-- 2          (the CTE name hides the real table within the statement)`],
        [`A CTE referenced several times is computed once (materialized), which is good for expensive logic and bad if each use needs a different filter pushed down. Compare plans and consider a temporary table with an index for heavy multi-step work.`,
            r`EXPLAIN ANALYZE WITH agg AS (SELECT customer_id, SUM(total) AS spent FROM orders GROUP BY customer_id)
SELECT a.customer_id FROM agg a JOIN agg b ON b.customer_id = a.customer_id WHERE a.spent > 1000;

-- OUTPUT: (example)
-- -> Materialize CTE agg  (actual time=380..380 rows=4200 loops=1)   used by both references`],
        [`Real-world: readable report logic. Each CTE is one business step (filter, aggregate, rank), which makes the query reviewable and testable step by step.`,
            r`WITH paid AS (SELECT * FROM orders WHERE status = 'PAID' AND created_at >= '2026-01-01'),
     by_customer AS (SELECT customer_id, COUNT(*) AS orders, SUM(total) AS spent FROM paid GROUP BY customer_id),
     ranked AS (SELECT *, DENSE_RANK() OVER (ORDER BY spent DESC) AS rk FROM by_customer)
SELECT customer_id, orders, spent FROM ranked WHERE rk <= 5;

-- OUTPUT:
-- customer_id | orders | spent
-- 7           |     31 | 48200.00`]
    ),

    'Recursive CTE': dv(
        [`A recursive CTE has an anchor SELECT and a recursive SELECT joined by UNION [ALL]. MySQL runs the anchor once, then repeatedly runs the recursive part against the rows produced in the previous iteration until it produces no rows. Each iteration's output is appended to the result.`,
            r`WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM nums WHERE n < 5)
SELECT n FROM nums;

-- OUTPUT:
-- n
-- 1
-- 2
-- 3
-- 4
-- 5`],
        [`Typical uses: hierarchies (org charts, categories, folders), graph walks, number and date series, and running calculations. Carry level and path columns. <code>cte_max_recursion_depth</code> (default 1000) stops runaway recursion.`,
            r`WITH RECURSIVE org AS (
  SELECT id, name, manager_id, 0 AS lvl, CAST(name AS CHAR(300)) AS path FROM staff WHERE manager_id IS NULL
  UNION ALL
  SELECT s.id, s.name, s.manager_id, o.lvl + 1, CONCAT(o.path, ' > ', s.name) FROM staff s JOIN org o ON s.manager_id = o.id)
SELECT CONCAT(REPEAT('  ', lvl), name) AS chart, path FROM org ORDER BY path;

-- OUTPUT:
-- chart       | path
-- Anita       | Anita
--   Meena     | Anita > Meena
--   Ravi      | Anita > Ravi
--     Kiran   | Anita > Ravi > Kiran`],
        [`Mistakes: cycles in the data (infinite recursion), UNION instead of UNION ALL where unnecessary, missing index on the parent column, and string columns whose type is fixed by the anchor (path truncated). Cast the anchor to a large enough type and guard against cycles.`,
            r`SET SESSION cte_max_recursion_depth = 50;
WITH RECURSIVE walk(id, path) AS (
  SELECT id, CAST(id AS CHAR(200)) FROM nodes WHERE id = 1
  UNION ALL
  SELECT n.id, CONCAT(w.path, ',', n.id) FROM nodes n JOIN edges e ON e.to_id = n.id JOIN walk w ON w.id = e.from_id WHERE FIND_IN_SET(n.id, w.path) = 0)
SELECT path FROM walk;

-- OUTPUT:
-- path
-- 1
-- 1,2
-- 1,2,3        (the cycle back to 1 is cut by the path check)`],
        [`Recursion performance depends on the join in the recursive part, so index the parent column. For very deep or very wide trees, closure tables or materialized paths make subtree queries a single index range.`,
            r`ALTER TABLE staff ADD INDEX idx_manager (manager_id);
EXPLAIN FORMAT=TREE WITH RECURSIVE t AS (SELECT id FROM staff WHERE id = 1 UNION ALL SELECT s.id FROM staff s JOIN t ON s.manager_id = t.id) SELECT * FROM t;

-- OUTPUT: (example)
-- -> Repeat until convergence  -> Index lookup on s using idx_manager (manager_id = t.id)`],
        [`Real-world: all descendants of a category, with product counts rolled up, for a category tree page.`,
            r`WITH RECURSIVE tree AS (SELECT id, id AS root FROM categories UNION ALL SELECT c.id, t.root FROM categories c JOIN tree t ON c.parent_id = t.id)
SELECT cat.name, COUNT(p.id) AS products FROM tree t JOIN categories cat ON cat.id = t.root LEFT JOIN products p ON p.category_id = t.id GROUP BY cat.id, cat.name;

-- OUTPUT:
-- name       | products
-- Office     | 412
-- Stationery | 120`]
    ),

    'CTE vs Subquery vs Temporary Table': dv(
        [`A subquery or CTE lives for one statement and is re-evaluated or materialized by the optimizer as needed. A temporary table is a real table in your session: it is created, filled once, can be indexed and updated, and reused by many statements, until you drop it or disconnect.`,
            r`WITH a AS (SELECT AVG(salary) AS v FROM emp) SELECT name FROM emp, a WHERE salary > a.v;     -- statement lifetime
CREATE TEMPORARY TABLE a_tmp AS SELECT AVG(salary) AS v FROM emp;                                -- session lifetime
SELECT name FROM emp, a_tmp WHERE salary > a_tmp.v;
SELECT name FROM emp WHERE salary > (SELECT AVG(salary) FROM emp);                               -- inline subquery

-- OUTPUT: (all three)
-- name
-- Asha
-- Meena`],
        [`Choose by reuse and size: single use and readability → CTE or subquery; several statements or a large intermediate that needs an index → temporary table; durable staging across sessions or failures → a permanent staging table.`,
            r`CREATE TEMPORARY TABLE tmp_totals (customer_id BIGINT PRIMARY KEY, spent DECIMAL(14,2)) AS SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id;
SELECT c.name, t.spent FROM customers c JOIN tmp_totals t USING (customer_id) WHERE t.spent > 1000;
SELECT COUNT(*) FROM tmp_totals t JOIN loyalty l ON l.customer_id = t.customer_id;
DROP TEMPORARY TABLE tmp_totals;

-- OUTPUT:
-- name | spent
-- Asha | 1500.00`],
        [`Mistakes: a CTE used many times with different filters (materialized once without them), temp tables left behind in pooled connections, and temp table names that shadow real tables. Drop temp tables explicitly.`,
            r`CREATE TEMPORARY TABLE emp (id INT);      -- hides the real emp for this session
SELECT COUNT(*) FROM emp;
DROP TEMPORARY TABLE emp;
SELECT COUNT(*) FROM emp;

-- OUTPUT:
-- COUNT(*)
-- 0
-- COUNT(*)
-- 3`],
        [`Temporary tables cost writes (they are tables, in the TempTable engine or on disk) but give indexes and statistics; CTEs cost nothing to store but may be recomputed. Measure with EXPLAIN ANALYZE and the temp-table counters.`,
            r`SHOW SESSION STATUS LIKE 'Created_tmp%';
EXPLAIN ANALYZE SELECT ... ;

-- OUTPUT: (example)
-- Created_tmp_tables      | 12
-- Created_tmp_disk_tables |  0`],
        [`Real-world: a multi-step reporting job. Step 1 builds a filtered, indexed temp table of the 5M relevant rows; steps 2 to 6 reuse it, instead of recomputing the expensive join six times.`,
            r`CREATE TEMPORARY TABLE rpt_base (order_id BIGINT PRIMARY KEY, customer_id BIGINT, total DECIMAL(12,2), KEY idx_c (customer_id)) AS
SELECT o.id, o.customer_id, o.total FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.created_at >= '2026-01-01' AND c.active = 1;
SELECT COUNT(*) FROM rpt_base;

-- OUTPUT:
-- COUNT(*)
-- 5120344`]
    ),

    'ROW_NUMBER, RANK & DENSE_RANK': dv(
        [`Ranking functions are evaluated after WHERE, GROUP BY and HAVING over a window defined by PARTITION BY and ORDER BY. MySQL sorts each partition (or reads an index in that order) and assigns numbers. ROW_NUMBER gives unique consecutive numbers; RANK gives ties the same number and skips; DENSE_RANK gives ties the same number without gaps.`,
            r`SELECT name, salary, ROW_NUMBER() OVER w AS rn, RANK() OVER w AS rnk, DENSE_RANK() OVER w AS drnk
FROM (SELECT 'A' AS name, 100 AS salary UNION ALL SELECT 'B', 100 UNION ALL SELECT 'C', 90) t WINDOW w AS (ORDER BY salary DESC);

-- OUTPUT:
-- name | salary | rn | rnk | drnk
-- A    |    100 |  1 |   1 |    1
-- B    |    100 |  2 |   1 |    1
-- C    |     90 |  3 |   3 |    2`],
        [`Use PARTITION BY to restart numbering per group, add tie-breakers to ORDER BY for deterministic ROW_NUMBER, filter by wrapping in a subquery or CTE, and name the window with the WINDOW clause when reused.`,
            r`SELECT dept, name, salary FROM (SELECT dept, name, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, id) AS rn FROM emp) t WHERE rn <= 2;
SELECT name FROM (SELECT name, DENSE_RANK() OVER (ORDER BY salary DESC) AS dr FROM emp) t WHERE dr = 2;

-- OUTPUT:
-- dept | name  | salary
--   10 | Asha  |  60000
--   10 | Ravi  |  45000
--   20 | Meena |  70000`],
        [`Mistakes: using RANK when you need exactly N rows, no tiebreaker (unstable results), and filtering on the window function in WHERE (not allowed). Pick ROW_NUMBER for exactly N, DENSE_RANK for "Nth distinct value".`,
            r`SELECT name FROM emp WHERE ROW_NUMBER() OVER (ORDER BY salary) = 1;

-- OUTPUT:
-- ERROR 3593 (HY000): You cannot use the window function 'row_number' in this context.`],
        [`Windows require sorting each partition. An index on (partition columns, order columns) avoids the sort. Check for "Using filesort" and the temporary table in the plan.`,
            r`ALTER TABLE emp ADD INDEX idx_dept_salary_id (dept, salary DESC, id);
EXPLAIN SELECT id, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, id) FROM emp;

-- OUTPUT: (example)
-- type  | key                 | Extra
-- index | idx_dept_salary_id  | Using index; Using temporary`],
        [`Real-world deduplication: keep the newest row per business key and delete the rest.`,
            r`DELETE u FROM users u JOIN (SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY updated_at DESC, id DESC) AS rn FROM users) d ON d.id = u.id WHERE d.rn > 1;

-- OUTPUT:
-- Query OK, 412 rows affected`]
    ),

    'NTILE': dv(
        [`NTILE(n) divides the ordered rows of each partition into n buckets of nearly equal size, numbering them 1..n. If the rows do not divide evenly, the first buckets get one extra row. It counts rows, not values, so equal values can land in different buckets.`,
            r`SELECT name, salary, NTILE(3) OVER (ORDER BY salary DESC) AS bucket FROM (SELECT 'A' AS name, 90 AS salary UNION ALL SELECT 'B', 80 UNION ALL SELECT 'C', 70 UNION ALL SELECT 'D', 60 UNION ALL SELECT 'E', 50 UNION ALL SELECT 'F', 40 UNION ALL SELECT 'G', 30) t;

-- OUTPUT:
-- name | salary | bucket
-- A    |     90 |      1
-- B    |     80 |      1
-- C    |     70 |      1
-- D    |     60 |      2
-- E    |     50 |      2
-- F    |     40 |      3
-- G    |     30 |      3`],
        [`Common sizes: NTILE(4) quartiles, NTILE(10) deciles, NTILE(100) percentiles. Combine with PARTITION BY to bucket within groups. For value-based relative position use PERCENT_RANK and CUME_DIST.`,
            r`SELECT customer_id, spent, NTILE(4) OVER (ORDER BY spent DESC) AS quartile, ROUND(PERCENT_RANK() OVER (ORDER BY spent), 2) AS pr, ROUND(CUME_DIST() OVER (ORDER BY spent), 2) AS cd FROM customer_spend;

-- OUTPUT:
-- customer_id | spent   | quartile | pr   | cd
-- 7           | 9800.00 |        1 | 1.00 | 1.00`],
        [`Mistakes: expecting equal-valued rows in one bucket, relying on bucket sizes being equal when counts do not divide, and ordering without a tiebreaker (bucket membership then changes between runs). Add id to the ORDER BY.`,
            r`SELECT id, spent, NTILE(2) OVER (ORDER BY spent) AS half FROM (SELECT 1 AS id, 10 AS spent UNION ALL SELECT 2, 10 UNION ALL SELECT 3, 10 UNION ALL SELECT 4, 10) t;

-- OUTPUT:
-- id | spent | half
--  1 |    10 |    1
--  2 |    10 |    1
--  3 |    10 |    2
--  4 |    10 |    2        (equal values split across buckets: add a tiebreaker for stability)`],
        [`NTILE needs a sort of the whole partition. For huge tables compute bucket boundaries from a sample or an index, or run it on a replica or an aggregated table.`,
            r`SELECT NTILE(100) OVER (ORDER BY response_ms) AS percentile, MAX(response_ms) AS p_value FROM (SELECT response_ms FROM request_log WHERE day = CURDATE()) t GROUP BY percentile LIMIT 3;

-- OUTPUT:
-- percentile | p_value
-- 1          | 3
-- 2          | 5`],
        [`Real-world: split a large job into equal-sized worker slices by id, so eight workers each process a contiguous, balanced range.`,
            r`SELECT worker, MIN(id) AS from_id, MAX(id) AS to_id, COUNT(*) AS n FROM (SELECT id, NTILE(8) OVER (ORDER BY id) AS worker FROM jobs WHERE status = 'NEW') t GROUP BY worker ORDER BY worker;

-- OUTPUT:
-- worker | from_id | to_id | n
-- 1      |       1 | 15000 | 15000
-- 2      |   15001 | 30000 | 15000`]
    ),

    'LAG & LEAD': dv(
        [`LAG(expr, n, default) reads the value n rows before the current row in the window order, LEAD reads n rows after. They are evaluated in a single sorted pass over the partition. The first or last row has no neighbour, so they return NULL unless you give a default.`,
            r`SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) AS prev, LEAD(revenue) OVER (ORDER BY month) AS next FROM monthly_rev;

-- OUTPUT:
-- month   | revenue | prev | next
-- 2026-01 |    1000 | NULL | 1200
-- 2026-02 |    1200 | 1000 | 1100
-- 2026-03 |    1100 | 1200 | NULL`],
        [`Typical calculations: change from the previous row, percent growth, time between events, gap detection and "next event" lookups. Combine with PARTITION BY to stay inside a group, and offsets greater than 1 for longer look-backs.`,
            r`SELECT month, revenue, revenue - LAG(revenue, 1, 0) OVER (ORDER BY month) AS change_amt, ROUND((revenue / LAG(revenue) OVER (ORDER BY month) - 1) * 100, 1) AS pct, LAG(revenue, 12) OVER (ORDER BY month) AS same_month_last_year FROM monthly_rev;
SELECT order_id, status, status_time, TIMESTAMPDIFF(MINUTE, status_time, LEAD(status_time) OVER (PARTITION BY order_id ORDER BY status_time)) AS minutes_in_status FROM order_status;

-- OUTPUT:
-- month   | revenue | change_amt | pct
-- 2026-02 |    1200 |        200 | 20.0`],
        [`Mistakes: missing periods (LAG returns the previous existing row, not the previous month), no PARTITION BY across groups, and ties in ORDER BY. Join a calendar first so every period exists.`,
            r`SELECT c.month, COALESCE(r.revenue, 0) AS revenue, COALESCE(r.revenue, 0) - LAG(COALESCE(r.revenue, 0)) OVER (ORDER BY c.month) AS change_amt
FROM months c LEFT JOIN monthly_rev r ON r.month = c.month;

-- OUTPUT:
-- month   | revenue | change_amt
-- 2026-03 |       0 | -1200        (the empty month is visible)`],
        [`LAG/LEAD replace self joins on adjacent rows and scan once instead of per row. Index (partition, order) columns to avoid the sort.`,
            r`ALTER TABLE order_status ADD INDEX idx_order_time (order_id, status_time);
EXPLAIN ANALYZE SELECT order_id, LEAD(status_time) OVER (PARTITION BY order_id ORDER BY status_time) FROM order_status;

-- OUTPUT: (example)
-- -> Window aggregate with buffering  -> Index scan on order_status using idx_order_time`],
        [`Real-world: session detection. Mark a new session whenever the gap to the previous event exceeds 30 minutes, then number the sessions with a running sum.`,
            r`SELECT user_id, event_time, SUM(new_session) OVER (PARTITION BY user_id ORDER BY event_time) AS session_no FROM (
  SELECT user_id, event_time, IF(TIMESTAMPDIFF(MINUTE, LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time), event_time) > 30 OR LAG(event_time) OVER (PARTITION BY user_id ORDER BY event_time) IS NULL, 1, 0) AS new_session FROM events) t;

-- OUTPUT:
-- user_id | event_time          | session_no
-- 7       | 2026-05-01 09:00:00 | 1
-- 7       | 2026-05-01 09:10:00 | 1
-- 7       | 2026-05-01 11:00:00 | 2`]
    ),

    'FIRST_VALUE & LAST_VALUE': dv(
        [`FIRST_VALUE(expr) returns the expression's value from the first row of the window frame, LAST_VALUE from the last row, NTH_VALUE from the nth. They depend on the frame. The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which is why LAST_VALUE appears to return the current row.`,
            r`SELECT name, salary, FIRST_VALUE(name) OVER w AS first_name, LAST_VALUE(name) OVER w AS last_default, LAST_VALUE(name) OVER (ORDER BY salary ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_full
FROM emp WINDOW w AS (ORDER BY salary);

-- OUTPUT:
-- name  | salary | first_name | last_default | last_full
-- Ravi  |  45000 | Ravi       | Ravi         | Meena
-- Asha  |  60000 | Ravi       | Asha         | Meena
-- Meena |  70000 | Ravi       | Meena        | Meena`],
        [`Use FIRST_VALUE to compare each row with the group's best (or oldest), NTH_VALUE for the second best, and spell the frame out for LAST_VALUE. Partition to work per group.`,
            r`SELECT dept, name, salary, FIRST_VALUE(salary) OVER (PARTITION BY dept ORDER BY salary DESC) - salary AS gap_to_top, NTH_VALUE(name, 2) OVER (PARTITION BY dept ORDER BY salary DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS runner_up FROM emp;

-- OUTPUT:
-- dept | name | salary | gap_to_top | runner_up
--   10 | Asha |  60000 |          0 | Ravi
--   10 | Ravi |  45000 |      15000 | Ravi`],
        [`Mistakes: relying on LAST_VALUE with the default frame, expecting IGNORE NULLS (not supported), and using it where ROW_NUMBER filtering is clearer for "latest row per key". Choose the simplest tool.`,
            r`-- latest status per order: ROW_NUMBER is clearer and index friendly
SELECT order_id, status FROM (SELECT order_id, status, ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY status_time DESC) AS rn FROM order_status) t WHERE rn = 1;

-- OUTPUT:
-- order_id | status
--        1 | SHIPPED`],
        [`Frames with unbounded following force MySQL to buffer the whole partition. For big partitions prefer MAX/MIN with GROUP BY, or ROW_NUMBER filtering, which can stop early.`,
            r`SELECT dept, MAX(salary) AS top FROM emp GROUP BY dept;
SELECT DISTINCT dept, FIRST_VALUE(salary) OVER (PARTITION BY dept ORDER BY salary DESC) AS top FROM emp;

-- OUTPUT:
-- dept | top
--   10 | 60000
--   20 | 70000`],
        [`Real-world: show each product's price versus the cheapest in its category and its category's highest-rated product, in one pass over the data.`,
            r`SELECT category_id, name, price, price - FIRST_VALUE(price) OVER (PARTITION BY category_id ORDER BY price) AS above_cheapest, FIRST_VALUE(name) OVER (PARTITION BY category_id ORDER BY rating DESC, id) AS best_rated FROM products;

-- OUTPUT:
-- category_id | name | price | above_cheapest | best_rated
-- 5           | Pen  | 10.00 |           0.00 | Gel Pen`]
    ),

    'PARTITION BY & Window Frames': dv(
        [`PARTITION BY splits rows into independent groups for the window function, without collapsing rows as GROUP BY does. The frame defines which rows around the current row take part: ROWS counts physical rows, RANGE includes all peers with equal ORDER BY values, GROUPS counts peer groups. With ORDER BY and no frame the default is RANGE UNBOUNDED PRECEDING to CURRENT ROW.`,
            r`SELECT dept, name, salary, SUM(salary) OVER (PARTITION BY dept) AS dept_total, COUNT(*) OVER (PARTITION BY dept) AS dept_n, salary - AVG(salary) OVER (PARTITION BY dept) AS diff_from_avg FROM emp;

-- OUTPUT:
-- dept | name  | salary | dept_total | dept_n | diff_from_avg
--   10 | Asha  |  60000 |     105000 |      2 |          7500
--   10 | Ravi  |  45000 |     105000 |      2 |         -7500
--   20 | Meena |  70000 |      70000 |      1 |             0`],
        [`Frame syntax: <code>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW</code>, <code>RANGE BETWEEN INTERVAL 7 DAY PRECEDING AND CURRENT ROW</code>, <code>UNBOUNDED PRECEDING/FOLLOWING</code>, <code>EXCLUDE</code> is not supported. Name windows with WINDOW and inherit from them.`,
            r`SELECT day, sales,
  SUM(sales) OVER w7 AS last7,
  AVG(sales) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING) AS centered_avg5,
  SUM(sales) OVER (ORDER BY day ROWS UNBOUNDED PRECEDING) AS running
FROM daily_sales WINDOW w7 AS (ORDER BY day RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW);

-- OUTPUT:
-- day        | sales | last7 | centered_avg5 | running
-- 2026-01-07 |   120 |   840 |         118.0 |     840`],
        [`Mistakes: confusing ROWS and RANGE with ties (RANGE gives equal running totals to tied rows), forgetting a unique tiebreaker, and different window definitions per column that each need their own sort. Share one named window.`,
            r`SELECT v, SUM(v) OVER (ORDER BY v ROWS UNBOUNDED PRECEDING) AS rows_sum, SUM(v) OVER (ORDER BY v RANGE UNBOUNDED PRECEDING) AS range_sum FROM (SELECT 1 AS v UNION ALL SELECT 2 UNION ALL SELECT 2 UNION ALL SELECT 3) t;

-- OUTPUT:
-- v | rows_sum | range_sum
-- 1 |        1 |         1
-- 2 |        3 |         5
-- 2 |        5 |         5
-- 3 |        8 |         8`],
        [`Large frames and partitions are buffered in memory (or a temp table). Use ROWS with small frames where possible, index the partition and order columns, and check the plan for filesort and temporary table use.`,
            r`ALTER TABLE daily_sales ADD INDEX idx_day (day);
EXPLAIN ANALYZE SELECT day, SUM(sales) OVER (ORDER BY day ROWS 6 PRECEDING) FROM daily_sales;

-- OUTPUT: (example)
-- -> Window aggregate with buffering  -> Index scan on daily_sales using idx_day  (no filesort)`],
        [`Real-world: compare each day with the same weekday's average over the last four weeks to flag anomalies.`,
            r`SELECT day, sales, ROUND(AVG(sales) OVER (PARTITION BY WEEKDAY(day) ORDER BY day ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING), 1) AS weekday_avg_prev4,
  IF(sales < 0.7 * AVG(sales) OVER (PARTITION BY WEEKDAY(day) ORDER BY day ROWS BETWEEN 4 PRECEDING AND 1 PRECEDING), 'LOW', 'ok') AS flag FROM daily_sales;

-- OUTPUT:
-- day        | sales | weekday_avg_prev4 | flag
-- 2026-05-04 |    70 |             120.0 | LOW`]
    ),

    'Running Totals & Moving Averages': dv(
        [`A running total is a window SUM with an ordered frame from the start to the current row; a moving average averages a fixed-size frame that slides with the row. Each partition is sorted once and the aggregate is updated incrementally as the frame moves.`,
            r`SELECT day, sales, SUM(sales) OVER (ORDER BY day) AS running_total, ROUND(AVG(sales) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS ma3 FROM daily_sales;

-- OUTPUT:
-- day        | sales | running_total | ma3
-- 2026-01-01 |   100 |           100 | 100.0
-- 2026-01-02 |   200 |           300 | 150.0
-- 2026-01-03 |   300 |           600 | 200.0
-- 2026-01-04 |   100 |           700 | 200.0`],
        [`Variants: per-group totals (PARTITION BY), date-based windows (RANGE with INTERVAL), cumulative percentages, and exponential-like smoothing with recursive CTEs. Always add a unique tiebreaker in ORDER BY.`,
            r`SELECT account_id, txn_date, amount, SUM(amount) OVER (PARTITION BY account_id ORDER BY txn_date, id) AS balance FROM txns;
SELECT day, ROUND(100 * SUM(sales) OVER (ORDER BY day) / SUM(sales) OVER (), 1) AS cumulative_pct FROM daily_sales;

-- OUTPUT:
-- account_id | txn_date   | amount | balance
-- 1          | 2026-01-01 |    500 |     500
-- 1          | 2026-01-05 |   -200 |     300`],
        [`Mistakes: missing days making "7 rows" different from "7 days", ties without a tiebreaker producing unstable intermediate totals, and recomputing totals for the whole history on each page view. Use a calendar and precomputed daily tables.`,
            r`SELECT c.d, COALESCE(s.sales, 0) AS sales, AVG(COALESCE(s.sales, 0)) OVER (ORDER BY c.d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma7 FROM calendar c LEFT JOIN daily_sales s ON s.day = c.d WHERE c.d BETWEEN '2026-01-01' AND '2026-01-31';

-- OUTPUT:
-- d          | sales | ma7
-- 2026-01-07 |     0 | 85.7`],
        [`Window functions over millions of rows sort everything unless indexed. Aggregate to the grain you report on (day) first, then run the window over the small table.`,
            r`WITH daily AS (SELECT DATE(created_at) AS day, SUM(total) AS sales FROM orders WHERE created_at >= '2026-01-01' GROUP BY DATE(created_at))
SELECT day, sales, SUM(sales) OVER (ORDER BY day) AS ytd FROM daily;

-- OUTPUT:
-- day        | sales   | ytd
-- 2026-01-01 | 8120.00 | 8120.00`],
        [`Real-world: an account statement with running balance, plus a check that the last running balance equals the account balance column.`,
            r`SELECT l.id, l.posted_at, l.amount, SUM(l.amount) OVER (ORDER BY l.posted_at, l.id) AS balance FROM ledger l WHERE l.account_id = 1 ORDER BY l.posted_at, l.id;
SELECT a.balance = (SELECT SUM(amount) FROM ledger WHERE account_id = a.id) AS consistent FROM accounts a WHERE a.id = 1;

-- OUTPUT:
-- consistent
-- 1`]
    ),

    'Top-N per Group': dv(
        [`Top-N per group means the best N rows within each category. LIMIT applies to the whole result, so it cannot do this. The standard method ranks rows inside each partition with a window function and keeps rank &lt;= N in an outer query, because window results cannot be used in WHERE directly.`,
            r`WITH ranked AS (SELECT dept, name, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, id) AS rn FROM emp)
SELECT dept, name, salary FROM ranked WHERE rn <= 2 ORDER BY dept, rn;

-- OUTPUT:
-- dept | name  | salary
--   10 | Asha  |  60000
--   10 | Ravi  |  45000
--   20 | Meena |  70000`],
        [`Alternatives: DENSE_RANK to include ties, a LATERAL join (8.0.14+) that runs ORDER BY ... LIMIT N per group, and a correlated count. Pick by tie policy and data size.`,
            r`SELECT d.name, t.name AS employee, t.salary FROM departments d JOIN LATERAL (SELECT name, salary FROM emp e WHERE e.dept = d.id ORDER BY salary DESC LIMIT 3) t;
SELECT e.* FROM emp e WHERE 3 > (SELECT COUNT(*) FROM emp x WHERE x.dept = e.dept AND (x.salary, x.id) > (e.salary, e.id));

-- OUTPUT:
-- name | employee | salary
-- HR   | Asha     |  60000
-- HR   | Ravi     |  45000`],
        [`Mistakes: no tiebreaker (nondeterministic rows), ROW_NUMBER when ties must all be included, and scanning the whole table for a small N. Choose RANK/DENSE_RANK for ties and index the sort.`,
            r`SELECT dept, name, salary FROM (SELECT dept, name, salary, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dr FROM emp) t WHERE dr <= 2;

-- OUTPUT:
-- (may return more than 2 rows per department when salaries tie)`],
        [`With an index on (group, sort) the LATERAL form touches only N rows per group, while the window form sorts the whole table. Compare with EXPLAIN ANALYZE on large data.`,
            r`ALTER TABLE emp ADD INDEX idx_dept_salary (dept, salary);
EXPLAIN ANALYZE SELECT d.name, t.name FROM departments d JOIN LATERAL (SELECT name FROM emp e WHERE e.dept = d.id ORDER BY salary DESC LIMIT 3) t;

-- OUTPUT: (example)
-- -> Nested loop: for each department  -> Limit: 3 row(s)  -> Index lookup on e using idx_dept_salary (reverse)`],
        [`Real-world: show the latest three posts per author on a profile list, or the top five products per category on a landing page, cached and paginated.`,
            r`SELECT a.name, p.title, p.created_at FROM authors a JOIN LATERAL (SELECT title, created_at FROM posts WHERE author_id = a.id ORDER BY created_at DESC LIMIT 3) p WHERE a.id IN (1, 2, 3);

-- OUTPUT:
-- name | title  | created_at
-- Asha | Post C | 2026-05-01 10:00:00`]
    ),

    'JSON Data Type & JSON_OBJECT / JSON_ARRAY': dv(
        [`The JSON type validates documents and stores them in a binary format with a lookup table of keys and values, so reading one path does not re-parse the whole document. Values are normalized: object keys are sorted and duplicates removed. Documents are stored with the row (or off-page when large).`,
            r`CREATE TABLE profiles (id INT PRIMARY KEY, data JSON NOT NULL);
INSERT INTO profiles VALUES (1, JSON_OBJECT('name', 'Asha', 'skills', JSON_ARRAY('SQL', 'Java'), 'active', TRUE));
INSERT INTO profiles VALUES (2, '{"b": 1, "a": 2, "a": 3}');
SELECT id, data FROM profiles;

-- OUTPUT:
-- id | data
--  1 | {"name": "Asha", "active": true, "skills": ["SQL", "Java"]}
--  2 | {"a": 3, "b": 1}                       (keys sorted, last duplicate wins? the first is kept: shows normalization)`],
        [`Build with <code>JSON_OBJECT</code>, <code>JSON_ARRAY</code>, <code>JSON_MERGE_PATCH</code>; modify with <code>JSON_SET</code>, <code>JSON_INSERT</code>, <code>JSON_REPLACE</code>, <code>JSON_REMOVE</code>, <code>JSON_ARRAY_APPEND</code>; aggregate with <code>JSON_ARRAYAGG</code> and <code>JSON_OBJECTAGG</code>.`,
            r`UPDATE profiles SET data = JSON_SET(data, '$.city', 'Pune', '$.active', FALSE) WHERE id = 1;
UPDATE profiles SET data = JSON_ARRAY_APPEND(data, '$.skills', 'MySQL') WHERE id = 1;
SELECT JSON_PRETTY(data) FROM profiles WHERE id = 1;
SELECT dept, JSON_ARRAYAGG(name) AS names FROM emp GROUP BY dept;

-- OUTPUT:
-- dept | names
--   10 | ["Asha", "Ravi"]`],
        [`Mistakes: invalid JSON strings (error 3140), expecting key order to be kept, storing numbers as strings, and updating large documents in place often (rewrites). Validate with a CHECK and JSON_SCHEMA_VALID.`,
            r`INSERT INTO profiles VALUES (3, '{bad json}');
ALTER TABLE profiles ADD CONSTRAINT chk_profile CHECK (JSON_SCHEMA_VALID('{"type":"object","required":["name"],"properties":{"name":{"type":"string"}}}', data));
INSERT INTO profiles VALUES (4, '{"city":"Delhi"}');

-- OUTPUT:
-- ERROR 3140 (22032): Invalid JSON text: "Missing a name for object member." at position 1 in value for column 'profiles.data'.
-- ERROR 3819 (HY000): Check constraint 'chk_profile' is violated.`],
        [`MySQL 8 can do partial updates of JSON in place (logging only the diff) when you use JSON_SET, JSON_REPLACE or JSON_REMOVE on the same column. Large documents still cost I/O, so keep them modest.`,
            r`SELECT id, JSON_STORAGE_SIZE(data) AS stored_bytes, JSON_STORAGE_FREE(data) AS free_after_partial_update FROM profiles;

-- OUTPUT:
-- id | stored_bytes | free_after_partial_update
--  1 |           78 |                         0`],
        [`Real-world: product attributes that differ by category. Fixed fields stay as columns; variable ones live in a JSON column and are queried through generated columns when needed.`,
            r`CREATE TABLE products (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(60) NOT NULL, price DECIMAL(10,2) NOT NULL, attrs JSON);
INSERT INTO products (name, price, attrs) VALUES ('Shirt', 999, JSON_OBJECT('brand', 'Acme', 'sizes', JSON_ARRAY('S','M','L'), 'color', 'blue'));
SELECT name, attrs->>'$.brand' AS brand, JSON_LENGTH(attrs->'$.sizes') AS size_count FROM products;

-- OUTPUT:
-- name  | brand | size_count
-- Shirt | Acme  |          3`]
    ),

    'JSON_EXTRACT & JSON_VALUE': dv(
        [`Paths start at <code>$</code> and use dots for keys and brackets for array positions. <code>JSON_EXTRACT(doc, path)</code> (alias <code>-&gt;</code>) returns a JSON value; <code>-&gt;&gt;</code> additionally unquotes strings. <code>JSON_VALUE(doc, path RETURNING type)</code> returns a typed SQL scalar, which makes comparisons and indexes reliable.`,
            r`SELECT data->'$.name' AS json_value, data->>'$.name' AS plain_text, JSON_EXTRACT(data, '$.skills[0]') AS first_skill, JSON_VALUE(data, '$.age' RETURNING UNSIGNED) AS age FROM people_json WHERE id = 1;

-- OUTPUT:
-- json_value | plain_text | first_skill | age
-- "Asha"     | Asha       | "SQL"       |  30`],
        [`Search inside arrays with <code>MEMBER OF</code>, <code>JSON_CONTAINS</code>, <code>JSON_OVERLAPS</code> and <code>JSON_SEARCH</code>; expand arrays to rows with <code>JSON_TABLE</code>; wildcard paths <code>$[*]</code> and <code>$**.key</code> collect many values.`,
            r`SELECT id FROM profiles WHERE 'SQL' MEMBER OF (data->'$.skills');
SELECT id FROM profiles WHERE JSON_OVERLAPS(data->'$.skills', JSON_ARRAY('Java', 'Go'));
SELECT p.id, jt.skill FROM profiles p, JSON_TABLE(p.data, '$.skills[*]' COLUMNS (skill VARCHAR(20) PATH '$')) jt;

-- OUTPUT:
-- id | skill
--  1 | SQL
--  1 | Java`],
        [`Mistakes: comparing JSON values to SQL values without a cast (<code>-&gt;</code> returns quoted JSON), type confusion between "5" and 5, and filtering on JSON paths with no index. Use <code>-&gt;&gt;</code> or JSON_VALUE with RETURNING.`,
            r`SELECT JSON_EXTRACT('{"n": "5"}', '$.n') = 5 AS wrong_cmp, JSON_VALUE('{"n": "5"}', '$.n' RETURNING UNSIGNED) = 5 AS right_cmp, '{"n": 5}'->'$.n' = '5' AS quoted_json;

-- OUTPUT:
-- wrong_cmp | right_cmp | quoted_json
--         0 |         1 |           0`],
        [`Without an index every JSON filter scans the table. Create generated columns or functional indexes on the exact expression the query uses, with matching cast and collation.`,
            r`CREATE INDEX idx_age ON people_json ((CAST(data->>'$.age' AS UNSIGNED)));
EXPLAIN SELECT id FROM people_json WHERE CAST(data->>'$.age' AS UNSIGNED) > 25;
EXPLAIN SELECT id FROM people_json WHERE data->>'$.age' > '25';

-- OUTPUT: (example)
-- first : type=range key=idx_age
-- second: type=ALL   (different expression: index not used)`],
        [`Real-world: read webhook payloads stored as JSON, extracting typed fields into reporting columns during a nightly job.`,
            r`INSERT INTO payment_facts (payment_id, amount, currency, paid_at)
SELECT id, JSON_VALUE(payload, '$.amount' RETURNING DECIMAL(12,2)), JSON_VALUE(payload, '$.currency' RETURNING CHAR(3)), JSON_VALUE(payload, '$.paid_at' RETURNING DATETIME)
FROM webhook_events WHERE type = 'payment.succeeded' AND id > 1000000;

-- OUTPUT:
-- Query OK, 48120 rows affected`]
    ),

    'JSON Indexes & Generated Columns': dv(
        [`A JSON column cannot be indexed as a whole. Instead you index values derived from it: a generated column (VIRTUAL computes on read, STORED persists) with an ordinary B-tree index, a functional index (8.0.13+), or a multi-valued index (8.0.17+) over array elements. The optimizer uses the index only when the query expression matches the indexed expression exactly.`,
            r`ALTER TABLE people_json ADD COLUMN city VARCHAR(30) AS (data->>'$.city') VIRTUAL, ADD INDEX idx_city (city);
EXPLAIN SELECT id FROM people_json WHERE city = 'Pune';
EXPLAIN SELECT id FROM people_json WHERE data->>'$.city' = 'Pune';

-- OUTPUT: (example)
-- first : type=ref key=idx_city
-- second: type=ref key=idx_city      (the optimizer rewrites the matching expression to the generated column)`],
        [`Multi-valued index for tags: <code>CAST(data-&gt;'$.skills' AS CHAR(20) ARRAY)</code>, queried with <code>MEMBER OF</code>, <code>JSON_CONTAINS</code> or <code>JSON_OVERLAPS</code>. Use STORED when computing is expensive or when the column must be part of a unique key.`,
            r`ALTER TABLE profiles ADD INDEX idx_skills ((CAST(data->'$.skills' AS CHAR(20) ARRAY)));
SELECT id FROM profiles WHERE 'Java' MEMBER OF (data->'$.skills');
EXPLAIN SELECT id FROM profiles WHERE 'Java' MEMBER OF (data->'$.skills');

-- OUTPUT: (example)
-- type | key
-- ref  | idx_skills`],
        [`Mistakes: mismatched expressions or casts (index ignored), string comparison on numbers, and a multi-valued index with too many elements per row (size explodes). Check EXPLAIN after creating the index and keep arrays small.`,
            r`CREATE INDEX idx_age ON people_json ((CAST(data->>'$.age' AS UNSIGNED)));
EXPLAIN SELECT id FROM people_json WHERE JSON_VALUE(data, '$.age' RETURNING UNSIGNED) > 25;
EXPLAIN SELECT id FROM people_json WHERE CAST(data->>'$.age' AS UNSIGNED) > 25;

-- OUTPUT: (example)
-- first : type=ALL   (JSON_VALUE is a different expression)
-- second: type=range key=idx_age`],
        [`Generated columns cost space (STORED) or CPU (VIRTUAL) and slow writes slightly. Index only the fields queried often; promote them to real columns when they become core to the model.`,
            r`SELECT index_name, ROUND(SUM(stat_value) * @@innodb_page_size / 1048576, 1) AS mb FROM mysql.innodb_index_stats WHERE table_name = 'people_json' AND stat_name = 'size' GROUP BY index_name;

-- OUTPUT: (example)
-- index_name | mb
-- PRIMARY    | 410.0
-- idx_city   |  42.0`],
        [`Real-world: catalog search by brand and color stored in JSON attributes. Two generated columns and a composite index turn a scan into a lookup.`,
            r`ALTER TABLE products ADD COLUMN brand VARCHAR(30) AS (attrs->>'$.brand') VIRTUAL, ADD COLUMN color VARCHAR(20) AS (attrs->>'$.color') VIRTUAL, ADD INDEX idx_brand_color (brand, color, price);
SELECT id, name, price FROM products WHERE brand = 'Acme' AND color = 'blue' ORDER BY price LIMIT 20;

-- OUTPUT:
-- id | name  | price
--  7 | Shirt | 999.00`]
    ),

    'JSON vs Relational Columns': dv(
        [`Relational columns have fixed types, constraints, foreign keys, statistics and efficient indexes. JSON trades those for flexibility: no per-key constraints by default, weaker statistics and joins, bigger rows and more CPU to read paths. The optimizer knows far more about columns than about JSON content.`,
            r`CREATE TABLE ev_cols (id BIGINT PRIMARY KEY, user_id BIGINT, kind VARCHAR(20), amount DECIMAL(10,2), KEY idx_kind (kind));
CREATE TABLE ev_json (id BIGINT PRIMARY KEY, data JSON);
SELECT table_name, ROUND(data_length / 1048576) AS mb FROM information_schema.tables WHERE table_name IN ('ev_cols','ev_json');

-- OUTPUT: (example, 10M rows)
-- table_name | mb
-- ev_cols    | 520
-- ev_json    | 1480`],
        [`A hybrid model is common: core, queried, constrained fields as columns; variable, rarely filtered ones in JSON; and generated columns bridging the two for the few JSON fields you filter on.`,
            r`CREATE TABLE tickets (id BIGINT PRIMARY KEY AUTO_INCREMENT, customer_id BIGINT NOT NULL, status ENUM('NEW','OPEN','CLOSED') NOT NULL, subject VARCHAR(120) NOT NULL, meta JSON,
  priority TINYINT AS (JSON_VALUE(meta, '$.priority' RETURNING UNSIGNED)) VIRTUAL, KEY idx_prio (priority));
INSERT INTO tickets (customer_id, status, subject, meta) VALUES (7, 'NEW', 'Refund', '{"priority": 2, "tags": ["billing"]}');
SELECT id, subject FROM tickets WHERE priority = 2;

-- OUTPUT:
-- id | subject
--  1 | Refund`],
        [`Mistakes: JSON as a dumping ground for everything, using JSON for fields used in joins or foreign keys, and no versioning of the document shape. Add a schema version and validate on write.`,
            r`ALTER TABLE tickets ADD COLUMN meta_version TINYINT NOT NULL DEFAULT 1;
UPDATE tickets SET meta = JSON_SET(meta, '$.channel', 'email'), meta_version = 2 WHERE meta_version = 1 AND id BETWEEN 1 AND 10000;

-- OUTPUT:
-- Query OK, 10000 rows affected`],
        [`Compare query speed for the same filter: a plain indexed column, an indexed generated column over JSON, and a JSON path with no index. The differences are orders of magnitude on large tables.`,
            r`-- 10M rows
-- WHERE kind = 'click'                (indexed column)    : 4 ms
-- WHERE kind_gen = 'click'            (indexed generated) : 6 ms
-- WHERE data->>'$.kind' = 'click'     (no index)          : 18 s
SELECT ROUND(18000 / 6) AS slower_without_index;

-- OUTPUT:
-- slower_without_index
-- 3000`],
        [`Real-world rule: promote any JSON field that is filtered often, joined, sorted or must be unique into a real column. A migration can do it online with a generated column first, then a real column and backfill.`,
            r`ALTER TABLE tickets ADD COLUMN priority_real TINYINT NULL, ALGORITHM=INSTANT;
UPDATE tickets SET priority_real = JSON_VALUE(meta, '$.priority' RETURNING UNSIGNED) WHERE priority_real IS NULL AND id BETWEEN 1 AND 10000;
-- switch the application to priority_real, then drop the generated column

-- OUTPUT:
-- Query OK, 10000 rows affected`]
    ),

    'FULLTEXT Indexes': dv(
        [`InnoDB FULLTEXT builds an inverted index in auxiliary tables: for each token it keeps the document ids (rowids) and positions, plus statistics for ranking. New data goes first to an in-memory cache and is merged into the index in the background; deletes are recorded and purged later. Queries read tokens from the index instead of scanning rows.`,
            r`CREATE TABLE articles (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(100), body TEXT, FULLTEXT KEY ft_articles (title, body)) ENGINE=InnoDB;
INSERT INTO articles (title, body) VALUES ('Index tuning', 'How MySQL uses B-tree indexes'), ('Backup guide', 'mysqldump and binary logs');
SELECT id, title FROM articles WHERE MATCH(title, body) AGAINST ('indexes');

-- OUTPUT:
-- id | title
--  1 | Index tuning`],
        [`Settings: <code>innodb_ft_min_token_size</code> (default 3), <code>innodb_ft_enable_stopword</code>, custom stopword tables, <code>ft_boolean_syntax</code>, and the ngram parser for CJK text. Changing token size requires rebuilding the index.`,
            r`SHOW VARIABLES LIKE 'innodb_ft%';
CREATE FULLTEXT INDEX ft_cn ON cn_docs (txt) WITH PARSER ngram;
SET GLOBAL innodb_ft_aux_table = 'shop/articles';
SELECT word, doc_count FROM information_schema.innodb_ft_index_table ORDER BY doc_count DESC LIMIT 3;

-- OUTPUT: (example)
-- word    | doc_count
-- indexes | 1`],
        [`Mistakes: expecting 2-letter words or stop words to match, building the index row by row during a huge load (create it after), searching columns that do not match the index definition, and LIKE '%word%' instead of MATCH. Match exactly the indexed column set.`,
            r`SELECT id FROM articles WHERE MATCH(title) AGAINST ('indexes');       -- index is on (title, body): not usable for title alone
SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('indexes');

-- OUTPUT:
-- ERROR 1191 (HY000): Can't find FULLTEXT index matching the column list`],
        [`FULLTEXT adds write overhead and index size. For bulk loads create the index afterwards, and run OPTIMIZE TABLE to merge pending changes and purge deleted entries when needed.`,
            r`LOAD DATA LOCAL INFILE '/data/articles.csv' INTO TABLE articles_staging FIELDS TERMINATED BY ',';
ALTER TABLE articles_staging ADD FULLTEXT KEY ft_all (title, body);
SET GLOBAL innodb_optimize_fulltext_only = ON; OPTIMIZE TABLE articles; SET GLOBAL innodb_optimize_fulltext_only = OFF;

-- OUTPUT:
-- Table          | Op       | Msg_type | Msg_text
-- shop.articles  | optimize | status   | OK`],
        [`Real-world: a help centre search over thousands of articles, ranked by relevance and restricted to published pages, returned with a short snippet.`,
            r`SELECT id, title, LEFT(body, 120) AS snippet, MATCH(title, body) AGAINST ('refund policy') AS score FROM articles WHERE status = 'PUBLISHED' AND MATCH(title, body) AGAINST ('refund policy') ORDER BY score DESC LIMIT 5;

-- OUTPUT:
-- id | title          | snippet                    | score
-- 12 | Refund policy  | How and when refunds are...| 3.4`]
    ),

    'MATCH ... AGAINST': dv(
        [`MATCH(columns) AGAINST('search') queries a FULLTEXT index. In natural language mode the search string is split into tokens, rows are scored by token frequency (TF-IDF style, rare words weigh more) and only rows with a positive score match. The same expression used in SELECT or ORDER BY returns the relevance score without a second index lookup.`,
            r`SELECT id, title, MATCH(title, body) AGAINST ('mysql indexes') AS score FROM articles WHERE MATCH(title, body) AGAINST ('mysql indexes') ORDER BY score DESC;

-- OUTPUT:
-- id | title        | score
--  1 | Index tuning | 0.62`],
        [`Modes: <code>IN NATURAL LANGUAGE MODE</code> (default), <code>IN BOOLEAN MODE</code>, <code>WITH QUERY EXPANSION</code>. Combine with ordinary conditions, joins and LIMIT. Pass the search text as a bound parameter.`,
            r`PREPARE s FROM 'SELECT id, title FROM articles WHERE MATCH(title, body) AGAINST (? IN NATURAL LANGUAGE MODE) AND status = ? LIMIT 10';
SET @q = 'binary logs', @st = 'PUBLISHED';
EXECUTE s USING @q, @st;
SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('database' WITH QUERY EXPANSION);

-- OUTPUT:
-- id | title
--  2 | Backup guide`],
        [`Mistakes: the 50% rule (in natural mode words occurring in more than half the rows are ignored, which surprises tests on tiny tables), concatenating user input into AGAINST, and ordering by something other than the score. Use boolean mode for tiny datasets or tests.`,
            r`SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('mysql');                           -- 'mysql' appears in most of 2 rows: ignored
SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('mysql' IN BOOLEAN MODE);              -- works

-- OUTPUT:
-- Empty set
-- id
-- 1`],
        [`MATCH is evaluated through the index (look for access type fulltext). Filtering by other columns happens after the fulltext lookup, so keep result sets selective, and paginate with LIMIT.`,
            r`EXPLAIN SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('refund') AND status = 'PUBLISHED' ORDER BY id LIMIT 10;

-- OUTPUT: (example)
-- type     | key         | Extra
-- fulltext | ft_articles | Using where; Ft_hints: sorted`],
        [`Real-world: combine relevance with recency, so fresh articles rank higher among similar scores.`,
            r`SELECT id, title, MATCH(title, body) AGAINST ('release notes') * (1 + 1 / (1 + DATEDIFF(NOW(), published_at))) AS ranked FROM articles WHERE MATCH(title, body) AGAINST ('release notes') ORDER BY ranked DESC LIMIT 10;

-- OUTPUT:
-- id | title            | ranked
-- 31 | Release notes 5.2| 2.71`]
    ),

    'Natural Language vs Boolean Mode': dv(
        [`Natural language mode ranks documents by similarity and ignores operators; the 50% threshold removes very common words. Boolean mode evaluates operators in the search string: <code>+</code> must contain, <code>-</code> must not, <code>*</code> prefix wildcard, <code>"..."</code> exact phrase, <code>&gt; &lt; ( )</code> weighting and grouping. It has no 50% rule, and does not sort by relevance automatically.`,
            r`SELECT id, title FROM articles WHERE MATCH(title, body) AGAINST ('+mysql -backup' IN BOOLEAN MODE);
SELECT id, title FROM articles WHERE MATCH(title, body) AGAINST ('"binary logs"' IN BOOLEAN MODE);
SELECT id, title FROM articles WHERE MATCH(title, body) AGAINST ('index*' IN BOOLEAN MODE);

-- OUTPUT:
-- id | title
--  1 | Index tuning`],
        [`Combine terms with weights and grouping: <code>+mysql +(index replication)</code> means mysql and either index or replication; <code>&gt;word</code> raises and <code>&lt;word</code> lowers relevance. Use ORDER BY MATCH(...) to sort by score in boolean mode.`,
            r`SELECT id, title, MATCH(title, body) AGAINST ('+mysql >index <replication' IN BOOLEAN MODE) AS score FROM articles WHERE MATCH(title, body) AGAINST ('+mysql >index <replication' IN BOOLEAN MODE) ORDER BY score DESC;

-- OUTPUT:
-- id | title        | score
--  1 | Index tuning | 0.55`],
        [`Mistakes: passing raw user input into boolean mode (syntax errors from stray operators), expecting stop words to match inside phrases, and using wildcards at the start of a word (not supported). Sanitize or build the boolean expression from validated tokens.`,
            r`SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('mysql +' IN BOOLEAN MODE);
-- safer: strip operators from user text and add your own
-- tokens = ['mysql', 'index']  ->  '+mysql* +index*'

-- OUTPUT:
-- ERROR 1064 (42000): syntax error, unexpected $end`],
        [`Boolean mode can run without a FULLTEXT index (slowly, scanning). Keep the index for real workloads. Prefix searches (<code>word*</code>) are efficient because the token list is sorted.`,
            r`EXPLAIN SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('repl*' IN BOOLEAN MODE);

-- OUTPUT: (example)
-- type     | key         | Extra
-- fulltext | ft_articles | Using where; Ft_hints: no_ranking`],
        [`Real-world: advanced search form. Required terms, excluded terms and an exact phrase map to boolean operators built safely in the application.`,
            r`-- user entered: must have "replication", exclude "oracle", phrase "binary log"
SELECT id, title FROM articles WHERE MATCH(title, body) AGAINST ('+replication* -oracle +"binary log"' IN BOOLEAN MODE) LIMIT 20;

-- OUTPUT:
-- id | title
--  2 | Backup guide`]
    ),

    'Full-Text vs Elasticsearch/OpenSearch': dv(
        [`MySQL FULLTEXT is a feature of the database engine: transactional, in the same data store, no extra infrastructure. Elasticsearch and OpenSearch are distributed search engines built around Lucene: analyzers per language, fuzzy matching, synonyms, faceting, highlighting and horizontal scaling, at the cost of running and syncing a second system.`,
            r`-- MySQL
SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('refnd' IN BOOLEAN MODE);              -- typo: no result
-- OpenSearch
-- GET /articles/_search {"query": {"match": {"body": {"query": "refnd", "fuzziness": "AUTO"}}}}

-- OUTPUT:
-- MySQL: Empty set          OpenSearch: hit "Refund policy" (fuzzy match)`],
        [`Typical architecture: MySQL is the source of truth; changes are copied to the search index through a transactional outbox or change data capture; the application queries the search engine for ids and ranks, then loads full rows from MySQL by primary key.`,
            r`START TRANSACTION;
UPDATE articles SET title = 'Refund policy v2' WHERE id = 12;
INSERT INTO search_outbox (entity, entity_id, op) VALUES ('article', 12, 'UPSERT');
COMMIT;
SELECT id, entity_id FROM search_outbox WHERE processed_at IS NULL ORDER BY id LIMIT 100 FOR UPDATE SKIP LOCKED;

-- OUTPUT:
-- id | entity_id
--  7 |        12`],
        [`Mistakes: dual-writing from the application without a reliable queue (the two stores diverge), no reindex plan, treating the search index as a source of truth, and ignoring permission filtering in search results. Keep the index rebuildable and filter results by access rules.`,
            r`-- reindex plan: build a new index version, swap an alias, delete the old
-- POST /_aliases {"actions":[{"remove":{"index":"articles_v1","alias":"articles"}},{"add":{"index":"articles_v2","alias":"articles"}}]}
SELECT MAX(id) AS last_synced_id FROM search_sync_state;

-- OUTPUT:
-- last_synced_id
-- 812044`],
        [`Choose by need: small corpus and simple keyword search → MySQL FULLTEXT; large corpus, relevance tuning, typo tolerance, autocomplete and facets → a search engine. Measure query latency and operational cost for both.`,
            r`-- 100k articles, simple keyword: MySQL FULLTEXT 8 ms p95
-- 50M documents with facets, fuzzy, highlighting: OpenSearch cluster 40 ms p95, MySQL FULLTEXT not suitable
SELECT TABLE_ROWS FROM information_schema.tables WHERE table_name = 'articles';

-- OUTPUT:
-- TABLE_ROWS
-- 98412`],
        [`Real-world: product search uses OpenSearch for text and facets (brand, price range, color), then MySQL for the authoritative price and stock of the returned ids.`,
            r`SELECT p.id, p.name, p.price, i.qty FROM products p JOIN inventory i ON i.product_id = p.id WHERE p.id IN (101, 204, 317, 412) ORDER BY FIELD(p.id, 101, 204, 317, 412);

-- OUTPUT:
-- id  | name | price  | qty
-- 101 | Pen  |  10.00 | 120`]
    ),

    'CREATE TEMPORARY TABLE': dv(
        [`A temporary table is visible only to the session that created it and disappears automatically when the session ends. It lives in the temporary tablespace (InnoDB session temp tablespace) or in memory depending on engine settings, is not logged for crash recovery, and its name can shadow a permanent table in that session.`,
            r`CREATE TEMPORARY TABLE high_earners AS SELECT id, name, salary FROM emp WHERE salary > 50000;
ALTER TABLE high_earners ADD PRIMARY KEY (id);
SELECT COUNT(*) FROM high_earners;
SELECT table_name, table_type FROM information_schema.innodb_temp_table_info;

-- OUTPUT:
-- COUNT(*)
-- 2`],
        [`Forms: explicit column list, <code>LIKE</code> an existing table, <code>AS SELECT</code>, with engine and indexes. Reopening the same temporary table twice in one query is not allowed (use a copy). DROP TEMPORARY TABLE removes only temporary tables.`,
            r`CREATE TEMPORARY TABLE scratch (id BIGINT PRIMARY KEY, grp INT, KEY idx_grp (grp)) ENGINE=InnoDB;
CREATE TEMPORARY TABLE scratch_copy LIKE scratch;
INSERT INTO scratch SELECT id, dept FROM emp;
DROP TEMPORARY TABLE IF EXISTS scratch, scratch_copy;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: leaving temp tables in pooled connections (the next request inherits them), name collisions with real tables, and using them across sessions (invisible). Always drop explicitly and use unique names.`,
            r`CREATE TEMPORARY TABLE emp (id INT);          -- shadows the real table in this session
SELECT COUNT(*) FROM emp;
DROP TEMPORARY TABLE emp;                       -- restore access to the real table

-- OUTPUT:
-- COUNT(*)
-- 0`],
        [`Temporary tables of any real size consume the session tablespace and I/O. Monitor temp usage and size them to fit; with replication in statement format, avoid relying on temporary tables across transactions.`,
            r`SELECT file_name, ROUND(total_extents * extent_size / 1048576) AS mb FROM information_schema.files WHERE tablespace_name LIKE 'innodb_temporary%';
SHOW GLOBAL STATUS LIKE 'Created_tmp_files';

-- OUTPUT: (example)
-- file_name        | mb
-- ./ibtmp1         | 512`],
        [`Real-world: an ETL step that loads a CSV into a temporary table, validates and transforms it with SQL, then merges into the permanent table in one transaction.`,
            r`CREATE TEMPORARY TABLE stage_customers (email VARCHAR(120) PRIMARY KEY, name VARCHAR(60), country CHAR(2));
LOAD DATA LOCAL INFILE '/data/customers.csv' INTO TABLE stage_customers FIELDS TERMINATED BY ',' IGNORE 1 LINES;
INSERT INTO customers (email, name, country) SELECT email, TRIM(name), UPPER(country) FROM stage_customers ON DUPLICATE KEY UPDATE name = VALUES(name), country = VALUES(country);
DROP TEMPORARY TABLE stage_customers;

-- OUTPUT:
-- Query OK, 12044 rows affected`]
    ),

    'Temporary Table vs CTE vs Permanent Table': dv(
        [`Three lifetimes: a CTE exists for one statement and is not stored; a temporary table exists for one session; a permanent table exists until dropped and is shared, logged and recoverable. They differ in visibility, durability, indexability and overhead.`,
            r`CREATE TABLE stage_orders (id BIGINT PRIMARY KEY, total DECIMAL(12,2));              -- permanent, shared, crash safe
CREATE TEMPORARY TABLE scratch_orders LIKE stage_orders;                              -- session only
WITH c AS (SELECT id, total FROM orders LIMIT 10) SELECT COUNT(*) FROM c;             -- statement only

-- OUTPUT:
-- COUNT(*)
-- 10`],
        [`Use a permanent staging table for pipelines that must survive crashes, be inspected, be shared by several workers or be resumable. Use a temporary table for fast private scratch work and a CTE for readable single-statement logic.`,
            r`CREATE TABLE stage_orders_20260501 LIKE orders;
INSERT INTO stage_orders_20260501 SELECT * FROM orders_import;
-- validate, then merge idempotently
INSERT INTO orders SELECT * FROM stage_orders_20260501 s ON DUPLICATE KEY UPDATE total = s.total;
DROP TABLE stage_orders_20260501;

-- OUTPUT:
-- Query OK, 120450 rows affected`],
        [`Mistakes: permanent staging tables never cleaned (they accumulate), temp tables for work that must survive a disconnect, and CTEs reused many times without checking materialization. Name staging tables by run and clean up in a finally step.`,
            r`SELECT table_name, create_time FROM information_schema.tables WHERE table_schema = 'shop' AND table_name LIKE 'stage\_%' AND create_time < NOW() - INTERVAL 7 DAY;

-- OUTPUT:
-- table_name               | create_time
-- stage_orders_20260401    | 2026-04-01 02:00:11       (stale: drop it)`],
        [`Cost model: permanent tables write to the redo log and binlog (replicated, durable); temporary tables skip most of that and are faster; CTEs write nothing unless materialized. Pick the lightest tool that satisfies durability and reuse needs.`,
            r`-- 5M row intermediate result, 6 later steps reuse it
-- CTE recomputed 6x : 6 x 14 s = 84 s
-- temp table        : 14 s build + 6 x 1 s = 20 s
-- permanent table   : 22 s build (redo + binlog) + 6 x 1 s = 28 s, but survives a crash
SELECT 84 - 20 AS seconds_saved_by_temp_table;

-- OUTPUT:
-- seconds_saved_by_temp_table
-- 64`],
        [`Real-world: a nightly aggregation pipeline stages raw data in a permanent table (so a failed run can resume), transforms with CTEs, and uses temporary tables for expensive joins reused within the job.`,
            r`INSERT INTO daily_summary (day, channel, orders, revenue)
WITH base AS (SELECT DATE(created_at) AS day, channel, total FROM stage_orders WHERE created_at >= CURDATE() - INTERVAL 1 DAY)
SELECT day, channel, COUNT(*), SUM(total) FROM base GROUP BY day, channel
ON DUPLICATE KEY UPDATE orders = VALUES(orders), revenue = VALUES(revenue);

-- OUTPUT:
-- Query OK, 12 rows affected`]
    )
};
