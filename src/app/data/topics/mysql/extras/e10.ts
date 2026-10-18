// Modules 27-31 (CTE, Window Functions, JSON, Full-Text Search, Temporary Tables) extras.
import { x, r, type Extra } from './extra';

export const e10: Record<string, Extra> = {
    'CTE Basics & Multiple CTEs': x(
        ['A CTE (Common Table Expression) is a named temporary result defined with <code>WITH name AS (SELECT ...)</code> and used in the main query.',
            'It makes complex queries readable by splitting them into steps.',
            'Needs MySQL 8.0+. The CTE exists only for that one statement.'],
        ['Define several CTEs separated by commas; later CTEs can use earlier ones.',
            'A CTE can be referenced multiple times in the main query.',
            'MySQL may merge a CTE into the outer query or materialize it.'],
        ['CTEs are not an optimization fence by default; they are inlined when simple. Referenced multiple times, they can be materialized once.',
            'Use CTEs for readability, not as a performance trick; check EXPLAIN.',
            'Avoid very long CTE chains that become hard to test; consider views for reuse.'],
        [['F', 'What is a CTE?', 'A named temporary result set defined with WITH that you can use in the following query.'],
            ['F', 'Which MySQL version supports CTEs?', '8.0 and later.'],
            ['M', 'Can a CTE refer to another CTE?', 'Yes, later CTEs in the same WITH can reference earlier ones.'],
            ['M', 'CTE vs derived table?', 'Both are temporary results; a CTE is named, can be referenced several times and can be recursive.'],
            ['S', 'Does a CTE improve performance?', 'Not by itself; it improves readability. The optimizer may merge or materialize it, so verify with EXPLAIN.'],
            ['S', 'When prefer a view over a CTE?', 'When the logic is reused across many queries and sessions.']],
        [['Multiple CTEs.',
            r`WITH dept_totals AS (
  SELECT dept, SUM(salary) AS total FROM emp GROUP BY dept
), company AS (
  SELECT SUM(total) AS grand FROM dept_totals
)
SELECT d.dept, d.total, ROUND(d.total / c.grand * 100, 1) AS pct FROM dept_totals d CROSS JOIN company c ORDER BY d.dept;

-- OUTPUT:
-- dept | total  | pct
--   10 | 105000 | 60.0
--   20 |  70000 | 40.0`],
            ['Reuse a CTE twice.',
                r`WITH high AS (SELECT * FROM emp WHERE salary > 50000)
SELECT (SELECT COUNT(*) FROM high) AS n, (SELECT AVG(salary) FROM high) AS avg_sal;

-- OUTPUT:
-- n | avg_sal
-- 2 | 65000.0000`]],
        [['Filter step by step.',
            r`WITH step1 AS (SELECT * FROM orders WHERE created_at >= '2026-01-01'),
     step2 AS (SELECT customer_id, SUM(total) AS spent FROM step1 GROUP BY customer_id)
SELECT customer_id FROM step2 WHERE spent > 1000;

-- OUTPUT:
-- customer_id
-- 1`],
            ['Plan check.',
                r`EXPLAIN FORMAT=TREE WITH t AS (SELECT * FROM emp WHERE dept = 10) SELECT * FROM t;

-- OUTPUT: (example)
-- -> Index lookup on emp using idx_dept (dept=10)    (CTE was merged, no temp table)`]]
    ),

    'Recursive CTE': x(
        ['A recursive CTE refers to itself to walk hierarchies or generate series: <code>WITH RECURSIVE t AS (anchor UNION ALL recursive_part) SELECT ...</code>.',
            'The anchor part starts the result; the recursive part adds rows until none are produced.',
            'Typical: org charts, category trees, number/date sequences.'],
        ['Use <code>UNION ALL</code> for speed; UNION removes duplicates and can stop cycles.',
            'Set <code>cte_max_recursion_depth</code> (default 1000) to protect against runaway recursion.',
            'Track the level or path columns to display or detect cycles.'],
        ['For graphs with cycles, carry a visited path and filter with <code>FIND_IN_SET</code>/<code>LOCATE</code>, or switch to UNION.',
            'Deep or huge hierarchies may be faster with closure tables or materialized paths.',
            'Index the parent column used in the recursive join.'],
        [['F', 'What is a recursive CTE?', 'A CTE that references itself to repeat a step until no new rows appear.'],
            ['F', 'Example use?', 'Listing all employees under a manager at any depth.'],
            ['M', 'What are the two parts?', 'An anchor (starting rows) and a recursive member joined with UNION [ALL].'],
            ['M', 'What stops infinite recursion?', 'The recursive step returning no rows, or the <code>cte_max_recursion_depth</code> limit error.'],
            ['S', 'How do you handle cycles in graph data?', 'Keep the path in a column and exclude nodes already in the path, or use UNION to discard repeats.'],
            ['S', 'When choose closure tables over recursive CTE?', 'When subtree queries are very frequent and large, trading write maintenance for read speed.']],
        [['Org chart traversal.',
            r`WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS lvl FROM staff WHERE id = 1
  UNION ALL
  SELECT s.id, s.name, s.manager_id, c.lvl + 1 FROM staff s JOIN chain c ON s.manager_id = c.id
)
SELECT lvl, name FROM chain ORDER BY lvl, id;

-- OUTPUT:
-- lvl | name
--   1 | Annaji
--   2 | Raoji
--   2 | Moropant
--   3 | Kanhoji`],
            ['Generate a date series.',
                r`WITH RECURSIVE d AS (SELECT DATE('2026-01-01') AS day UNION ALL SELECT day + INTERVAL 1 DAY FROM d WHERE day < '2026-01-05')
SELECT day FROM d;

-- OUTPUT:
-- day
-- 2026-01-01
-- 2026-01-02
-- 2026-01-03
-- 2026-01-04
-- 2026-01-05`]],
        [['Depth limit protection.',
            r`SET SESSION cte_max_recursion_depth = 100;
WITH RECURSIVE r AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM r) SELECT COUNT(*) FROM r;

-- OUTPUT:
-- ERROR 3636 (HY000): Recursive query aborted after 101 iterations. Try increasing @@cte_max_recursion_depth to a larger value.`],
            ['Path column for cycle detection.',
                r`WITH RECURSIVE walk AS (
  SELECT id, CAST(id AS CHAR(200)) AS path FROM nodes WHERE id = 1
  UNION ALL
  SELECT n.id, CONCAT(w.path, ',', n.id) FROM nodes n JOIN edges e ON e.to_id = n.id JOIN walk w ON w.id = e.from_id
  WHERE FIND_IN_SET(n.id, w.path) = 0)
SELECT path FROM walk;

-- OUTPUT:
-- path
-- 1
-- 1,2
-- 1,2,3`]]
    ),

    'CTE vs Subquery vs Temporary Table': x(
        ['A subquery is nested inside a statement, a CTE is a named block before the statement, and a temporary table is a real table that exists for your session.',
            'CTE and subquery last for one statement; a temporary table lasts for the session.',
            'Pick by readability and reuse.'],
        ['Temporary tables can be indexed and reused in many statements, and hold data you can update.',
            'CTEs and subqueries are re-evaluated per statement; CTEs referenced several times may be materialized once.',
            'Temporary tables cost writes (they are tables) but can speed up multi-step ETL.'],
        ['For heavy multi-step transformations, a temporary table with indexes can outperform repeated CTE expansion.',
            'Temp tables increase session state and can cause replication issues in statement-based binlog with certain patterns.',
            'Measure: sometimes the optimizer handles a CTE/subquery just as well with no materialization.'],
        [['F', 'Difference between CTE and temporary table?', 'A CTE exists only for one statement and is not stored; a temporary table is stored for the session and can be reused.'],
            ['F', 'Where is a subquery written?', 'Inside another query, in WHERE, FROM or SELECT.'],
            ['M', 'When prefer a temporary table?', 'When you reuse the intermediate result in several statements, need indexes on it or it is large and expensive.'],
            ['M', 'When prefer a CTE?', 'For readability in one statement, including recursion.'],
            ['S', 'How can a temp table speed up a report?', 'Materialize the expensive aggregation once, index it, then join it multiple times.'],
            ['S', 'Any risks with temporary tables?', 'Session memory/disk use, name collisions, replication behaviour and lost state on reconnect.']],
        [['Same result three ways.',
            r`-- subquery
SELECT name FROM emp WHERE salary > (SELECT AVG(salary) FROM emp);
-- CTE
WITH a AS (SELECT AVG(salary) AS v FROM emp) SELECT name FROM emp, a WHERE salary > a.v;
-- temp table
CREATE TEMPORARY TABLE a AS SELECT AVG(salary) AS v FROM emp;
SELECT name FROM emp, a WHERE salary > a.v;

-- OUTPUT: (all three)
-- name
-- Abaji
-- Moropant`],
            ['Temp table with an index for repeated joins.',
                r`CREATE TEMPORARY TABLE tmp_totals (customer_id INT PRIMARY KEY, spent DECIMAL(12,2))
  AS SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id;
SELECT c.name, t.spent FROM customers c JOIN tmp_totals t USING (customer_id);

-- OUTPUT:
-- name  | spent
-- Abaji | 1500.00`]],
        [['Temp table disappears after the session.',
            r`-- reconnect
SELECT * FROM tmp_totals;

-- OUTPUT:
-- ERROR 1146 (42S02): Table 'shop.tmp_totals' doesn't exist`],
            ['Materialization shown in plan.',
                r`EXPLAIN FORMAT=TREE WITH a AS (SELECT dept, SUM(salary) s FROM emp GROUP BY dept) SELECT * FROM a x JOIN a y ON x.dept <> y.dept;

-- OUTPUT: (example)
-- -> Table scan on y  -> Materialize CTE a  (shared)`]]
    ),

    'ROW_NUMBER, RANK & DENSE_RANK': x(
        ['Ranking window functions number rows within a partition: ROW_NUMBER gives unique numbers, RANK leaves gaps after ties, DENSE_RANK has no gaps.',
            'Syntax: <code>RANK() OVER (PARTITION BY dept ORDER BY salary DESC)</code>.',
            'Used for top-N, de-duplication and leaderboards.'],
        ['With ties on salary 100,100,90: ROW_NUMBER 1,2,3; RANK 1,1,3; DENSE_RANK 1,1,2.',
            'ORDER BY inside OVER decides the ranking; add a tie-breaker for deterministic ROW_NUMBER.',
            'Window functions run after WHERE/GROUP BY; filter on them with an outer query or CTE.'],
        ['De-duplicate keeping the newest: <code>ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC) = 1</code>.',
            'Index (partition columns, order columns) so the sort is avoided.',
            'For top-N per group on huge tables, test against a LATERAL-style or index-assisted alternative.'],
        [['F', 'Difference between RANK and DENSE_RANK?', 'RANK leaves gaps after ties (1,1,3); DENSE_RANK does not (1,1,2).'],
            ['F', 'What does ROW_NUMBER do?', 'Assigns a unique sequential number to rows in each partition.'],
            ['M', 'How do you filter on a window result?', 'Wrap in a subquery or CTE and filter in the outer query.'],
            ['M', 'How do you get the second highest salary per department?', '<code>DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)</code> then filter rank = 2.'],
            ['S', 'How to dedupe rows keeping the latest?', 'ROW_NUMBER over the business key ordered by latest timestamp and delete or keep rn = 1.'],
            ['S', 'How to make ROW_NUMBER deterministic?', 'Add a unique tiebreaker such as id to the ORDER BY.']],
        [['Compare ranking functions.',
            r`SELECT name, salary,
 ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn,
 RANK() OVER (ORDER BY salary DESC) AS rnk,
 DENSE_RANK() OVER (ORDER BY salary DESC) AS drnk
FROM (SELECT 'A' AS name, 100 AS salary UNION ALL SELECT 'B',100 UNION ALL SELECT 'C',90) t;

-- OUTPUT:
-- name | salary | rn | rnk | drnk
-- A    |    100 |  1 |   1 |    1
-- B    |    100 |  2 |   1 |    1
-- C    |     90 |  3 |   3 |    2`],
            ['Top earner per department.',
                r`SELECT dept, name, salary FROM (SELECT dept, name, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn FROM emp) t WHERE rn = 1;

-- OUTPUT:
-- dept | name     | salary
--   10 | Abaji    | 60000
--   20 | Moropant | 70000`]],
        [['Delete duplicates keeping the newest.',
            r`DELETE u FROM users u JOIN (SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id DESC) AS rn FROM users) d ON d.id = u.id WHERE d.rn > 1;

-- OUTPUT:
-- Query OK, 2 rows affected`],
            ['Leaderboard with ties.',
                r`SELECT player, score, DENSE_RANK() OVER (ORDER BY score DESC) AS position FROM scores;

-- OUTPUT:
-- player   | score | position
-- Raoji    |    95 | 1
-- Abaji    |    95 | 1
-- Moropant |    80 | 2`]]
    ),

    'NTILE': x(
        ['<code>NTILE(n)</code> splits the ordered rows of a partition into n roughly equal buckets and gives each row its bucket number.',
            'Example: NTILE(4) makes quartiles; NTILE(100) makes percentile-like groups.',
            'Bucket sizes differ by at most one row.'],
        ['Use it for quartiles, deciles and splitting data into equal-sized work batches.',
            'Rows with equal values may fall into different buckets, because NTILE counts rows, not values.',
            'For value-based percentiles use <code>PERCENT_RANK</code> or <code>CUME_DIST</code>.'],
        ['NTILE is handy for parallel batch processing: assign rows to N workers.',
            'On skewed data buckets are equal in rows but not in value ranges.',
            'Sort cost matters on large data; index the ORDER BY.'],
        [['F', 'What does NTILE(4) do?', 'Divides the rows into 4 nearly equal groups numbered 1 to 4.'],
            ['F', 'Use case?', 'Quartile analysis such as top 25% of customers.'],
            ['M', 'What if rows do not divide evenly?', 'The first buckets get one extra row.'],
            ['M', 'Do equal values always share a bucket?', 'No; NTILE splits by row position, so ties can be separated.'],
            ['S', 'How to assign batches to workers?', 'NTILE(workers) OVER (ORDER BY id) to give each worker a contiguous, near-equal slice.'],
            ['S', 'NTILE vs PERCENT_RANK?', 'NTILE gives equal-size groups; PERCENT_RANK gives the relative rank value (0..1) of each row.']],
        [['Quartiles of salary.',
            r`SELECT name, salary, NTILE(2) OVER (ORDER BY salary DESC) AS half FROM emp;

-- OUTPUT:
-- name     | salary | half
-- Moropant |  70000 | 1
-- Abaji    |  60000 | 1
-- Raoji    |  45000 | 2`],
            ['Top 25% of customers by spend.',
                r`SELECT customer_id, spent FROM (SELECT customer_id, spent, NTILE(4) OVER (ORDER BY spent DESC) AS q FROM customer_spend) t WHERE q = 1;

-- OUTPUT:
-- customer_id | spent
-- 7           | 9800.00`]],
        [['Split a table into 3 worker slices.',
            r`SELECT id, NTILE(3) OVER (ORDER BY id) AS worker FROM jobs;

-- OUTPUT: (example 7 rows)
-- id | worker
--  1 | 1
--  2 | 1
--  3 | 1
--  4 | 2
--  5 | 2
--  6 | 3
--  7 | 3`],
            ['Relative position.',
                r`SELECT name, ROUND(PERCENT_RANK() OVER (ORDER BY salary), 2) AS pr, ROUND(CUME_DIST() OVER (ORDER BY salary), 2) AS cd FROM emp;

-- OUTPUT:
-- name     | pr   | cd
-- Raoji    | 0.00 | 0.33
-- Abaji    | 0.50 | 0.67
-- Moropant | 1.00 | 1.00`]]
    ),

    'LAG & LEAD': x(
        ['<code>LAG(col)</code> reads a value from a previous row; <code>LEAD(col)</code> reads from the next row, within the ordered window.',
            'Use them for changes over time: this month versus last month.',
            'Optional arguments: offset and default value, <code>LAG(col, 1, 0)</code>.'],
        ['Without PARTITION BY the whole result is one window.',
            'The first row has no previous row, so LAG returns NULL unless you give a default.',
            'Compute differences: <code>amount - LAG(amount) OVER (ORDER BY month)</code>.'],
        ['LAG/LEAD replace self joins on adjacent rows and are much faster.',
            'Gaps in dates need a calendar table before LAG, otherwise "previous row" is not "previous month".',
            'Index the partition/order columns.'],
        [['F', 'What does LAG do?', 'Returns the value from a previous row in the window.'],
            ['F', 'What does LEAD do?', 'Returns the value from a following row.'],
            ['M', 'What does LAG return for the first row?', 'NULL, or the default value if provided.'],
            ['M', 'How compute month-over-month change?', 'Current value minus <code>LAG(value) OVER (ORDER BY month)</code>.'],
            ['S', 'What if some months are missing?', 'LAG gives the previous existing row, not the previous month; join to a calendar table first.'],
            ['S', 'LAG vs self join?', 'LAG is simpler and scans once; self joins are slower and harder to read.']],
        [['Month-over-month.',
            r`SELECT month, revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS change_amt,
 ROUND((revenue / LAG(revenue) OVER (ORDER BY month) - 1) * 100, 1) AS pct
FROM monthly_rev;

-- OUTPUT:
-- month   | revenue | change_amt | pct
-- 2026-01 |    1000 | NULL       | NULL
-- 2026-02 |    1200 | 200        | 20.0
-- 2026-03 |    1100 | -100       | -8.3`],
            ['Next value with LEAD and default.',
                r`SELECT id, status_time, LEAD(status_time, 1, NOW()) OVER (PARTITION BY order_id ORDER BY status_time) AS next_time FROM order_status;

-- OUTPUT: (example)
-- id | status_time         | next_time
--  1 | 2026-05-01 10:00:00 | 2026-05-01 12:00:00`]],
        [['Time spent in each status.',
            r`SELECT order_id, status, TIMESTAMPDIFF(MINUTE, status_time, LEAD(status_time) OVER (PARTITION BY order_id ORDER BY status_time)) AS minutes FROM order_status;

-- OUTPUT:
-- order_id | status  | minutes
--        1 | PLACED  |     120
--        1 | SHIPPED | NULL`],
            ['Detect gaps in ids.',
                r`SELECT id, next_id FROM (SELECT id, LEAD(id) OVER (ORDER BY id) AS next_id FROM t) x WHERE next_id - id > 1;

-- OUTPUT:
-- id | next_id
--  3 |       7`]]
    ),

    'FIRST_VALUE & LAST_VALUE': x(
        ['<code>FIRST_VALUE(col)</code> returns the first value in the window; <code>LAST_VALUE(col)</code> the last.',
            'Use them to compare each row with the group’s first or last value, for example the highest salary in the department.',
            'They need an ORDER BY in OVER to be meaningful.'],
        ['LAST_VALUE surprises people: the default frame ends at the current row, so it returns the current row unless you set the frame to <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>.',
            'NTH_VALUE(col, n) gets the n-th row of the frame.',
            'Use IGNORE NULLS is not supported in MySQL; handle NULLs yourself.'],
        ['For "latest value per key" prefer ROW_NUMBER filtering (clearer, can use indexes) over LAST_VALUE.',
            'Frames control cost: unbounded frames can scan the partition for each row.',
            'Test with large partitions; they are computed in memory/temp tables.'],
        [['F', 'What does FIRST_VALUE do?', 'Returns the first value of the ordered window.'],
            ['F', 'Example use?', 'Show each employee’s salary next to the top salary of their department.'],
            ['M', 'Why does LAST_VALUE often return the current row?', 'The default frame stops at the current row; extend it to UNBOUNDED FOLLOWING to see the true last row.'],
            ['M', 'What is NTH_VALUE?', 'Returns the value from the n-th row of the window frame.'],
            ['S', 'FIRST_VALUE vs MAX?', 'FIRST_VALUE follows the ordering you define (and can fetch a different column); MAX only gives the maximum of one column.'],
            ['S', 'How to fetch the latest row per key?', 'ROW_NUMBER() OVER (PARTITION BY key ORDER BY ts DESC) = 1.']],
        [['Gap to the department top.',
            r`SELECT dept, name, salary, FIRST_VALUE(salary) OVER (PARTITION BY dept ORDER BY salary DESC) - salary AS gap_to_top FROM emp;

-- OUTPUT:
-- dept | name     | salary | gap_to_top
--   10 | Abaji    |  60000 | 0
--   10 | Raoji    |  45000 | 15000
--   20 | Moropant |  70000 | 0`],
            ['LAST_VALUE with the right frame.',
                r`SELECT name, salary, LAST_VALUE(name) OVER (ORDER BY salary ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS highest_paid FROM emp;

-- OUTPUT:
-- name     | salary | highest_paid
-- Raoji    |  45000 | Moropant
-- Abaji    |  60000 | Moropant
-- Moropant |  70000 | Moropant`]],
        [['Default frame trap.',
            r`SELECT name, LAST_VALUE(name) OVER (ORDER BY salary) AS last_name FROM emp;

-- OUTPUT:
-- name     | last_name
-- Raoji    | Raoji
-- Abaji    | Abaji
-- Moropant | Moropant      (not the max: frame ends at current row)`],
            ['NTH_VALUE.',
                r`SELECT DISTINCT NTH_VALUE(name, 2) OVER (ORDER BY salary DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS second_highest FROM emp;

-- OUTPUT:
-- second_highest
-- Abaji`]]
    ),

    'PARTITION BY & Window Frames': x(
        ['<code>OVER (PARTITION BY dept ORDER BY salary)</code> restarts the window per department. A frame limits which rows around the current row are included.',
            'Unlike GROUP BY, window functions keep every row.',
            'Example: average salary per department shown on each employee row.'],
        ['Frames: <code>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW</code> (physical rows) or <code>RANGE</code> (rows with equal ORDER BY values together).',
            'With ORDER BY and no frame, the default is RANGE UNBOUNDED PRECEDING TO CURRENT ROW.',
            'Named windows: <code>WINDOW w AS (PARTITION BY dept)</code> avoid repeating definitions.'],
        ['ROWS is predictable and cheaper than RANGE; prefer it for running calculations.',
            'Large partitions with big frames can be memory heavy; check <code>EXPLAIN</code> and temp table use.',
            'Combine multiple windows with the same definition to share one sort.'],
        [['F', 'What does PARTITION BY do in OVER?', 'Splits the rows into groups and calculates the window function separately for each group.'],
            ['F', 'Difference from GROUP BY?', 'GROUP BY collapses rows; window functions keep all rows.'],
            ['M', 'ROWS vs RANGE?', 'ROWS counts physical rows; RANGE includes all rows with equal ordering values (peers).'],
            ['M', 'What is the default frame with ORDER BY?', 'RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.'],
            ['S', 'How to reduce repeated window definitions?', 'Use a named WINDOW clause so several functions share the same sort.'],
            ['S', 'Why prefer ROWS in running totals?', 'RANGE treats ties as one group, giving duplicate totals for ties and extra work; ROWS is exact and faster.']],
        [['Per-department average next to each row.',
            r`SELECT name, dept, salary, ROUND(AVG(salary) OVER (PARTITION BY dept), 0) AS dept_avg, salary - AVG(salary) OVER (PARTITION BY dept) AS diff FROM emp;

-- OUTPUT:
-- name     | dept | salary | dept_avg | diff
-- Abaji    |   10 |  60000 |    52500 | 7500
-- Raoji    |   10 |  45000 |    52500 | -7500
-- Moropant |   20 |  70000 |    70000 | 0`],
            ['Named window.',
                r`SELECT name, dept, salary, SUM(salary) OVER w AS dept_total, COUNT(*) OVER w AS dept_count FROM emp WINDOW w AS (PARTITION BY dept);

-- OUTPUT:
-- name     | dept | salary | dept_total | dept_count
-- Abaji    |   10 |  60000 |     105000 | 2
-- Raoji    |   10 |  45000 |     105000 | 2
-- Moropant |   20 |  70000 |      70000 | 1`]],
        [['ROWS vs RANGE with ties.',
            r`SELECT v, SUM(v) OVER (ORDER BY v ROWS UNBOUNDED PRECEDING) AS rows_sum, SUM(v) OVER (ORDER BY v RANGE UNBOUNDED PRECEDING) AS range_sum
FROM (SELECT 1 AS v UNION ALL SELECT 2 UNION ALL SELECT 2 UNION ALL SELECT 3) t;

-- OUTPUT:
-- v | rows_sum | range_sum
-- 1 |        1 |         1
-- 2 |        3 |         5
-- 2 |        5 |         5
-- 3 |        8 |         8`],
            ['3-row frame.',
                r`SELECT id, amount, SUM(amount) OVER (ORDER BY id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS window_sum FROM payments;

-- OUTPUT:
-- id | amount | window_sum
--  1 |    100 |        150
--  2 |     50 |        175
--  3 |     25 |         75`]]
    ),

    'Running Totals & Moving Averages': x(
        ['A running total adds up values so far: <code>SUM(amount) OVER (ORDER BY date)</code>.',
            'A moving average averages the last N rows: <code>AVG(x) OVER (ORDER BY d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)</code>.',
            'Used in finance, sales and monitoring dashboards.'],
        ['Always add a unique tie-breaker in ORDER BY so the running total is deterministic.',
            'Partition by account or product to restart totals.',
            'Use ROWS frames for exact row counts and RANGE with INTERVAL for date windows.'],
        ['If dates have gaps, a "last 7 rows" average is not "last 7 days"; use a RANGE with INTERVAL or join to a calendar.',
            'For huge tables compute totals incrementally (summary tables) instead of recomputing per query.',
            'Index (partition, order) columns to avoid sorting.'],
        [['F', 'How do you compute a running total?', '<code>SUM(col) OVER (ORDER BY ordering_col)</code>.'],
            ['F', 'What is a moving average?', 'An average over a sliding window of recent rows or time.'],
            ['M', 'How restart the running total for each account?', 'Add PARTITION BY account_id.'],
            ['M', 'Why add a tie-breaker?', 'Rows with equal order values can otherwise appear in any order, changing intermediate totals.'],
            ['S', 'How to do a 7-day moving average with missing days?', 'Use RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW on a date column, or join a calendar and use ROWS.'],
            ['S', 'How to serve running totals at scale?', 'Maintain cumulative values incrementally in a summary table, or precompute daily and use windows over the daily table.']],
        [['Running balance per account.',
            r`SELECT account_id, txn_date, amount, SUM(amount) OVER (PARTITION BY account_id ORDER BY txn_date, id) AS balance FROM txns;

-- OUTPUT:
-- account_id | txn_date   | amount | balance
-- 1          | 2026-01-01 |    500 |     500
-- 1          | 2026-01-05 |   -200 |     300
-- 2          | 2026-01-02 |    100 |     100`],
            ['3-day moving average.',
                r`SELECT day, sales, ROUND(AVG(sales) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS ma3 FROM daily_sales;

-- OUTPUT:
-- day        | sales | ma3
-- 2026-01-01 |   100 | 100.0
-- 2026-01-02 |   200 | 150.0
-- 2026-01-03 |   300 | 200.0
-- 2026-01-04 |   100 | 200.0`]],
        [['Date-range window with INTERVAL.',
            r`SELECT day, SUM(sales) OVER (ORDER BY day RANGE BETWEEN INTERVAL 6 DAY PRECEDING AND CURRENT ROW) AS last7 FROM daily_sales;

-- OUTPUT:
-- day        | last7
-- 2026-01-07 | 1450`],
            ['Percent of total.',
                r`SELECT name, salary, ROUND(salary / SUM(salary) OVER () * 100, 1) AS pct_of_company FROM emp;

-- OUTPUT:
-- name     | salary | pct_of_company
-- Abaji    |  60000 | 34.3
-- Raoji    |  45000 | 25.7
-- Moropant |  70000 | 40.0`]]
    ),

    'Top-N per Group': x(
        ['Top-N per group means the best N rows in each category, for example the top 3 earners in each department.',
            'Use a window function: rank rows with ROW_NUMBER/RANK inside each group, then keep rank &lt;= N.',
            'Plain GROUP BY or LIMIT cannot do this alone.'],
        ['ROW_NUMBER gives exactly N rows per group; RANK/DENSE_RANK may return more when there are ties.',
            'The ranking must be computed in a subquery or CTE and filtered outside.',
            'Add tie-breakers (id) for stable results.'],
        ['On big tables use an index on (group, order_col) and consider a lateral-style approach: for each group, <code>SELECT ... ORDER BY ... LIMIT N</code> from a small list of groups.',
            'For pagination-like feeds (top 3 posts per category on a homepage), precompute and cache.',
            'Check plans: window sorts the whole table unless indexed.'],
        [['F', 'How do you find the top 3 salaries per department?', 'Rank with <code>DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC)</code> and filter rank &lt;= 3.'],
            ['F', 'Why can you not use LIMIT directly?', 'LIMIT applies to the whole result, not to each group.'],
            ['M', 'ROW_NUMBER vs RANK for top-N?', 'ROW_NUMBER returns exactly N rows; RANK/DENSE_RANK can include ties beyond N.'],
            ['M', 'Where do you filter the rank?', 'In an outer query or CTE, since window results are not available in WHERE.'],
            ['S', 'How to optimize top-N per group on a huge table?', 'Index (group, sort column) and iterate over a small list of groups with a LIMIT subquery, or maintain a precomputed leaderboard table.'],
            ['S', 'Handling ties fairly?', 'Use DENSE_RANK to include all tied rows, or define a deterministic tie-breaker and use ROW_NUMBER.']],
        [['Top 2 earners per department.',
            r`WITH ranked AS (SELECT dept, name, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, id) AS rn FROM emp)
SELECT dept, name, salary FROM ranked WHERE rn <= 2;

-- OUTPUT:
-- dept | name     | salary
--   10 | Abaji    | 60000
--   10 | Raoji    | 45000
--   20 | Moropant | 70000`],
            ['Include ties with DENSE_RANK.',
                r`SELECT * FROM (SELECT name, dept, salary, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dr FROM emp) t WHERE dr <= 2;

-- OUTPUT:
-- name     | dept | salary | dr
-- Abaji    |   10 |  60000 | 1
-- Raoji    |   10 |  45000 | 2
-- Moropant |   20 |  70000 | 1`]],
        [['Latest 3 posts per author with a lateral join (8.0.14+).',
            r`SELECT a.name, p.title FROM authors a JOIN LATERAL (SELECT title FROM posts WHERE author_id = a.id ORDER BY created_at DESC LIMIT 3) p;

-- OUTPUT:
-- name  | title
-- Abaji | Post C
-- Abaji | Post B
-- Abaji | Post A`],
            ['Supporting index.',
                r`ALTER TABLE posts ADD INDEX idx_author_created (author_id, created_at);

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'JSON Data Type & JSON_OBJECT / JSON_ARRAY': x(
        ['The JSON type stores JSON documents with validation. <code>JSON_OBJECT()</code> and <code>JSON_ARRAY()</code> build JSON values.',
            'Insert JSON as a string: <code>INSERT INTO t(data) VALUES (\'{"a":1}\')</code>.',
            'Invalid JSON is rejected.'],
        ['JSON is stored in an efficient binary format that allows fast access to keys.',
            'Update parts with <code>JSON_SET</code>, <code>JSON_INSERT</code>, <code>JSON_REPLACE</code>, <code>JSON_REMOVE</code>.',
            'Max size is governed by <code>max_allowed_packet</code>.'],
        ['Use JSON for sparse or evolving attributes; keep filtered, joined or constrained fields as real columns.',
            'Partial updates on large documents are optimized in 8.0 but still cost more than column updates.',
            'Schema validation: <code>JSON_SCHEMA_VALID</code> in a CHECK constraint.'],
        [['F', 'What is the JSON data type?', 'A column type that stores validated JSON documents.'],
            ['F', 'How do you build a JSON object in SQL?', '<code>JSON_OBJECT("name", name, "age", age)</code>.'],
            ['M', 'Which functions modify JSON?', 'JSON_SET, JSON_INSERT, JSON_REPLACE, JSON_REMOVE, JSON_ARRAY_APPEND.'],
            ['M', 'How do you validate the structure?', 'A CHECK using <code>JSON_SCHEMA_VALID(schema, column)</code>.'],
            ['S', 'JSON vs normalized columns?', 'Normalize attributes you query, index and constrain; JSON for flexible, rarely queried extras.'],
            ['S', 'What are the costs of large JSON documents?', 'Bigger rows, more I/O and replication volume, and harder partial indexing.']],
        [['Build and store JSON.',
            r`CREATE TABLE profiles (id INT PRIMARY KEY, data JSON);
INSERT INTO profiles VALUES (1, JSON_OBJECT('name','Abaji','skills',JSON_ARRAY('SQL','Java'),'active',TRUE));
SELECT data FROM profiles;

-- OUTPUT:
-- data
-- {"name": "Abaji", "active": true, "skills": ["SQL", "Java"]}`],
            ['Modify a document.',
                r`UPDATE profiles SET data = JSON_SET(data, '$.city', 'Pune', '$.active', FALSE) WHERE id = 1;
SELECT JSON_PRETTY(data) FROM profiles;

-- OUTPUT:
-- {
--   "city": "Pune", "name": "Abaji", "active": false, "skills": ["SQL", "Java"]
-- }`]],
        [['Schema validation constraint.',
            r`ALTER TABLE profiles ADD CONSTRAINT chk_json CHECK (JSON_SCHEMA_VALID('{"type":"object","required":["name"]}', data));
INSERT INTO profiles VALUES (2, '{"city":"Delhi"}');

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'chk_json' is violated.`],
            ['Append to an array.',
                r`UPDATE profiles SET data = JSON_ARRAY_APPEND(data, '$.skills', 'MySQL') WHERE id = 1;
SELECT JSON_LENGTH(data, '$.skills') FROM profiles WHERE id = 1;

-- OUTPUT:
-- JSON_LENGTH(data, '$.skills')
-- 3`]]
    ),

    'JSON_EXTRACT & JSON_VALUE': x(
        ['<code>JSON_EXTRACT(doc, path)</code> (or <code>doc-&gt;path</code>) reads a value; <code>-&gt;&gt;</code> also removes quotes. <code>JSON_VALUE(doc, path RETURNING type)</code> returns a typed scalar (8.0.21+).',
            'Paths start with $: <code>$.name</code>, <code>$.skills[0]</code>.',
            'Use them in SELECT, WHERE and ORDER BY.'],
        ['<code>-&gt;</code> returns a JSON value (strings keep quotes); <code>-&gt;&gt;</code> returns plain text.',
            'JSON_VALUE with RETURNING makes comparisons type-safe: <code>RETURNING UNSIGNED</code>.',
            '<code>JSON_CONTAINS</code>, <code>JSON_SEARCH</code> and <code>JSON_TABLE</code> query inside arrays.'],
        ['Without an index, JSON path filters scan every row; add generated columns or functional indexes.',
            'JSON_TABLE turns a JSON array into rows for joins and aggregation.',
            'Type mix-ups (string "5" vs number 5) are a frequent source of wrong results; extract with explicit types.'],
        [['F', 'How do you read a field from JSON?', '<code>JSON_EXTRACT(data, "$.name")</code> or <code>data-&gt;"$.name"</code>.'],
            ['F', 'Difference between -&gt; and -&gt;&gt;?', '-&gt; returns JSON (quoted strings); -&gt;&gt; returns an unquoted text value.'],
            ['M', 'What does JSON_VALUE add?', 'Returns a scalar converted to a SQL type via RETURNING, easy to compare and index.'],
            ['M', 'How do you filter by a value in an array?', '<code>JSON_CONTAINS(data-&gt;"$.skills", \'"SQL"\')</code> or MEMBER OF.'],
            ['S', 'How do you index a JSON field?', 'Create a generated column from the path and index it, or a functional index <code>((CAST(data-&gt;&gt;"$.age" AS UNSIGNED)))</code>.'],
            ['S', 'How do you turn a JSON array into rows?', 'JSON_TABLE(doc, "$[*]" COLUMNS (...)) in the FROM clause.']],
        [['Extract and filter.',
            r`SELECT id, data->>'$.name' AS name, JSON_VALUE(data, '$.age' RETURNING UNSIGNED) AS age FROM people_json WHERE JSON_VALUE(data, '$.age' RETURNING UNSIGNED) > 25;

-- OUTPUT:
-- id | name  | age
--  1 | Abaji | 30`],
            ['Array membership.',
                r`SELECT id FROM profiles WHERE 'SQL' MEMBER OF (data->'$.skills');

-- OUTPUT:
-- id
-- 1`]],
        [['JSON_TABLE.',
            r`SELECT p.id, jt.skill FROM profiles p, JSON_TABLE(p.data, '$.skills[*]' COLUMNS (skill VARCHAR(20) PATH '$')) jt;

-- OUTPUT:
-- id | skill
--  1 | SQL
--  1 | Java`],
            ['Type pitfall.',
                r`SELECT JSON_EXTRACT('{"n": "5"}', '$.n') = 5 AS cmp_json, JSON_VALUE('{"n": "5"}', '$.n' RETURNING UNSIGNED) = 5 AS cmp_typed;

-- OUTPUT:
-- cmp_json | cmp_typed
--        0 |         1`]]
    ),

    'JSON Indexes & Generated Columns': x(
        ['MySQL cannot index a JSON document directly, but you can index values inside it through a generated column or a functional index.',
            'Generated column: <code>ALTER TABLE t ADD city VARCHAR(30) AS (data-&gt;&gt;"$.city") STORED, ADD INDEX (city)</code>.',
            'Queries on that column then use the index.'],
        ['VIRTUAL generated columns compute on read and cost no storage; STORED persist the value. Indexes on virtual columns are stored in the index.',
            'Functional indexes (8.0.13+): <code>CREATE INDEX idx ON t ((CAST(data-&gt;&gt;"$.age" AS UNSIGNED)))</code>.',
            'Multi-valued indexes (8.0.17+) index JSON arrays for <code>MEMBER OF</code>/<code>JSON_CONTAINS</code>.'],
        ['The optimizer uses the index only if the query expression matches exactly (same cast/path).',
            'Multi-valued indexes allow efficient "tag" searches without a junction table, but enforce limits (one per index).',
            'If you query a field constantly, promote it to a real column.'],
        [['F', 'How do you index a JSON field?', 'Via a generated column with an index, or a functional index.'],
            ['F', 'What is a generated column?', 'A column whose value is computed from other columns (virtual or stored).'],
            ['M', 'VIRTUAL vs STORED generated columns?', 'VIRTUAL computes when read (no row storage); STORED saves the value in the row.'],
            ['M', 'What is a multi-valued index?', 'An index over elements of a JSON array so queries like MEMBER OF can use it.'],
            ['S', 'Why might the optimizer ignore my functional index?', 'The query expression differs from the index expression (different cast, path or collation).'],
            ['S', 'When promote a JSON field to a real column?', 'When it is filtered, joined, constrained or sorted frequently.']],
        [['Generated column plus index.',
            r`ALTER TABLE people_json ADD COLUMN city VARCHAR(30) AS (data->>'$.city') VIRTUAL, ADD INDEX idx_city (city);
EXPLAIN SELECT id FROM people_json WHERE city = 'Pune';

-- OUTPUT: (example)
-- type | key      | rows
-- ref  | idx_city | 3`],
            ['Multi-valued index for tags.',
                r`ALTER TABLE profiles ADD INDEX idx_skills ((CAST(data->'$.skills' AS CHAR(20) ARRAY)));
SELECT id FROM profiles WHERE 'Java' MEMBER OF (data->'$.skills');

-- OUTPUT:
-- id
-- 1`]],
        [['Functional index with a cast.',
            r`CREATE INDEX idx_age ON people_json ((CAST(data->>'$.age' AS UNSIGNED)));
EXPLAIN SELECT id FROM people_json WHERE CAST(data->>'$.age' AS UNSIGNED) > 25;

-- OUTPUT: (example)
-- type  | key     | Extra
-- range | idx_age | Using where`],
            ['Mismatch ignores the index.',
                r`EXPLAIN SELECT id FROM people_json WHERE data->>'$.age' > '25';

-- OUTPUT: (example)
-- type | key  | Extra
-- ALL  | NULL | Using where`]]
    ),

    'JSON vs Relational Columns': x(
        ['Relational columns have fixed types and constraints; JSON stores flexible documents in one column.',
            'Use columns for core fields (id, email, status) and JSON for optional, varied attributes.',
            'You can mix both in one table.'],
        ['Columns win on indexing, constraints, joins and storage efficiency; JSON wins on schema flexibility and nested structures.',
            'Updating one JSON key rewrites more data than updating one column (partial update optimizations help).',
            'Reporting on JSON fields is slower and more complex.'],
        ['A common pattern: stable columns plus a JSON "attributes" column for extension, with generated columns for the few fields that get queried.',
            'Avoid JSON as a dumping ground; unmanaged shapes become impossible to migrate.',
            'Version the JSON shape (schema_version) and validate on write.'],
        [['F', 'When should you use JSON in MySQL?', 'For flexible, sparsely used attributes such as preferences or product options.'],
            ['F', 'When use normal columns?', 'For data you filter, join, sort or constrain regularly.'],
            ['M', 'What are the downsides of JSON?', 'Weaker constraints, harder indexing and joins, bigger rows and more complex queries.'],
            ['M', 'How to get the best of both?', 'Core columns plus a JSON column and generated-column indexes for frequent paths.'],
            ['S', 'How do you manage JSON schema evolution?', 'Store a schema_version, validate with JSON_SCHEMA_VALID, migrate with backfill jobs and keep readers backward compatible.'],
            ['S', 'Is MySQL JSON a replacement for MongoDB?', 'Not for all cases; it covers modest document needs inside a relational model but lacks document-native sharding and tooling.']],
        [['Hybrid design.',
            r`CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(60) NOT NULL, price DECIMAL(10,2) NOT NULL, attrs JSON,
  brand VARCHAR(30) AS (attrs->>'$.brand') VIRTUAL, INDEX idx_brand (brand));
INSERT INTO products (id, name, price, attrs) VALUES (1,'Shirt',999,'{"brand":"Acme","sizes":["S","M"]}');
SELECT name, brand FROM products WHERE brand = 'Acme';

-- OUTPUT:
-- name  | brand
-- Shirt | Acme`],
            ['Constraint comparison.',
                r`INSERT INTO products (id, name, price) VALUES (2,'Pen',NULL);

-- OUTPUT:
-- ERROR 1048 (23000): Column 'price' cannot be null     (relational columns enforce rules; JSON values do not)`]],
        [['Version the JSON shape.',
            r`ALTER TABLE products ADD COLUMN attrs_version TINYINT NOT NULL DEFAULT 1;
UPDATE products SET attrs = JSON_SET(attrs, '$.material', 'cotton'), attrs_version = 2 WHERE attrs_version = 1;

-- OUTPUT:
-- Query OK, 1 row affected`],
            ['Compare storage.',
                r`SELECT table_name, ROUND(data_length/1024/1024,2) AS mb FROM information_schema.tables WHERE table_name IN ('events_cols','events_json');

-- OUTPUT: (example)
-- table_name  | mb
-- events_cols | 120.00
-- events_json | 310.00`]]
    ),

    'FULLTEXT Indexes': x(
        ['A FULLTEXT index lets MySQL search words inside text columns quickly, instead of slow <code>LIKE "%word%"</code>.',
            'Create: <code>CREATE FULLTEXT INDEX ft ON articles (title, body);</code>.',
            'Works on CHAR, VARCHAR and TEXT columns in InnoDB.'],
        ['The index stores words (tokens) and where they occur.',
            'Short words (under <code>innodb_ft_min_token_size</code>, default 3) and stop words are not indexed.',
            'Changes are visible after commit; very large loads should create the index afterwards.'],
        ['Tune tokenization with stopword tables and token sizes; use the ngram parser for Chinese/Japanese/Korean.',
            'InnoDB FULLTEXT adds write overhead and uses an auxiliary cache; bulk load then index for speed.',
            'For ranking, typo tolerance and faceting use a dedicated search engine.'],
        [['F', 'What is a FULLTEXT index?', 'An index for fast word search in text columns.'],
            ['F', 'Why not use LIKE "%word%"?', 'It cannot use an index and scans the whole table.'],
            ['M', 'Which words are not indexed?', 'Stop words and tokens shorter than the minimum token size.'],
            ['M', 'How do you index Chinese text?', 'Use the ngram parser: <code>FULLTEXT (col) WITH PARSER ngram</code>.'],
            ['S', 'How to load a big table with FULLTEXT efficiently?', 'Load first, then create the FULLTEXT index; avoid building it row by row.'],
            ['S', 'Limits of InnoDB FULLTEXT?', 'Basic relevance, no fuzzy matching or synonyms, and index size/write cost on large tables.']],
        [['Create and search.',
            r`CREATE TABLE articles (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(100), body TEXT, FULLTEXT KEY ft_articles (title, body));
INSERT INTO articles (title, body) VALUES ('Index tuning','How MySQL uses B-tree indexes'),('Backup guide','mysqldump and binary logs');
SELECT id, title FROM articles WHERE MATCH(title, body) AGAINST ('indexes');

-- OUTPUT:
-- id | title
--  1 | Index tuning`],
            ['Check token size.',
                r`SHOW VARIABLES LIKE 'innodb_ft%';

-- OUTPUT: (example)
-- innodb_ft_min_token_size | 3
-- innodb_ft_enable_stopword| ON`]],
        [['ngram parser.',
            r`CREATE TABLE cn_docs (id INT PRIMARY KEY, txt TEXT, FULLTEXT KEY ft (txt) WITH PARSER ngram);

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Inspect index words.',
                r`SET GLOBAL innodb_ft_aux_table = 'shop/articles';
SELECT word, doc_count FROM information_schema.innodb_ft_index_table ORDER BY doc_count DESC LIMIT 3;

-- OUTPUT: (example)
-- word    | doc_count
-- mysql   | 1
-- indexes | 1`]]
    ),

    'MATCH ... AGAINST': x(
        ['<code>MATCH(col1, col2) AGAINST ("words")</code> searches a FULLTEXT index and returns a relevance score.',
            'The columns in MATCH must match a FULLTEXT index definition.',
            'Use it in WHERE to filter and in SELECT or ORDER BY to rank.'],
        ['The default mode is natural language; add <code>IN BOOLEAN MODE</code> for operators and <code>WITH QUERY EXPANSION</code> for related terms.',
            'Relevance is a float; higher means a better match.',
            'In natural mode, words appearing in more than 50% of rows are ignored (not in boolean mode).'],
        ['Always parameterize the search string; never concatenate user input into the query.',
            'Combine relevance with other filters (status, date) and paginate with keyset where possible.',
            'Check <code>EXPLAIN</code>: the fulltext access type should be used.'],
        [['F', 'What does MATCH ... AGAINST do?', 'Performs a fulltext search against a FULLTEXT index and scores relevance.'],
            ['F', 'Where do you use it?', 'In WHERE to filter and in ORDER BY to rank by relevance.'],
            ['M', 'Which columns can be in MATCH?', 'Exactly those in a FULLTEXT index.'],
            ['M', 'What is the 50% rule?', 'In natural language mode words present in more than half the rows are treated as stop words.'],
            ['S', 'How do you protect fulltext queries from injection?', 'Use prepared statements with the search term as a parameter.'],
            ['S', 'How do you combine relevance and recency?', 'ORDER BY score plus a time decay expression, or filter by recent date then rank.']],
        [['Ranked results.',
            r`SELECT id, title, MATCH(title, body) AGAINST ('mysql indexes') AS score FROM articles WHERE MATCH(title, body) AGAINST ('mysql indexes') ORDER BY score DESC;

-- OUTPUT:
-- id | title        | score
--  1 | Index tuning | 0.62`],
            ['Prepared parameter.',
                r`PREPARE s FROM 'SELECT id FROM articles WHERE MATCH(title, body) AGAINST (?)';
SET @q = 'binary logs'; EXECUTE s USING @q;

-- OUTPUT:
-- id
-- 2`]],
        [['Plan check.',
            r`EXPLAIN SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('mysql');

-- OUTPUT: (example)
-- type     | key         | Extra
-- fulltext | ft_articles | Using where; Ft_hints: sorted`],
            ['Filter plus rank.',
                r`SELECT id FROM articles WHERE status = 'PUBLISHED' AND MATCH(title, body) AGAINST ('backup') ORDER BY created_at DESC LIMIT 10;

-- OUTPUT:
-- id
-- 2`]]
    ),

    'Natural Language vs Boolean Mode': x(
        ['Natural language mode ranks documents by similarity to the words. Boolean mode lets you use operators such as + (must), - (must not), * (wildcard) and "phrase".',
            'Example: <code>AGAINST ("+mysql -oracle" IN BOOLEAN MODE)</code>.',
            'Natural mode is the default.'],
        ['Boolean mode does not sort by relevance automatically and has no 50% threshold.',
            'Wildcard * only works at the end of a word: <code>data*</code>.',
            'Phrases in double quotes need all words adjacent.'],
        ['Parse user queries into safe boolean expressions (escape or strip operators) to avoid syntax errors and abuse.',
            'Offer natural mode for simple search boxes and boolean for advanced search.',
            'Add application-side ranking if relevance alone is not enough.'],
        [['F', 'Natural language vs boolean mode?', 'Natural: relevance-based similarity search. Boolean: supports operators like + - * and phrases.'],
            ['F', 'What does + mean in boolean mode?', 'The word must be present.'],
            ['M', 'How do you exclude a word?', 'Prefix it with - in boolean mode.'],
            ['M', 'Does boolean mode sort by relevance?', 'No, add ORDER BY with the MATCH expression to sort.'],
            ['S', 'How should user input be handled in boolean mode?', 'Sanitize or escape special characters (+ - &gt; &lt; ( ) ~ * "), or build the expression yourself from validated tokens.'],
            ['S', 'Why might a word never match?', 'It is a stop word, shorter than the token size, or too common in natural mode (50% rule).']],
        [['Boolean operators.',
            r`SELECT id, title FROM articles WHERE MATCH(title, body) AGAINST ('+mysql -backup' IN BOOLEAN MODE);

-- OUTPUT:
-- id | title
--  1 | Index tuning`],
            ['Prefix wildcard.',
                r`SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('index*' IN BOOLEAN MODE);

-- OUTPUT:
-- id
-- 1`]],
        [['Phrase search.',
            r`SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('"binary logs"' IN BOOLEAN MODE);

-- OUTPUT:
-- id
-- 2`],
            ['Bad syntax from raw user input.',
                r`SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('mysql +' IN BOOLEAN MODE);

-- OUTPUT:
-- ERROR 1064 (42000): syntax error, unexpected $end`]]
    ),

    'Full-Text vs Elasticsearch/OpenSearch': x(
        ['MySQL FULLTEXT gives basic keyword search inside your database. Elasticsearch/OpenSearch are dedicated search engines with advanced relevance and scale.',
            'Use MySQL FULLTEXT for small to medium, simple search needs.',
            'Use a search engine when search is a core feature.'],
        ['Search engines add typo tolerance, synonyms, stemming per language, facets, highlighting, autocomplete, custom scoring and horizontal scaling.',
            'MySQL FULLTEXT is transactional and needs no extra infrastructure.',
            'A search engine is a second system you must keep in sync.'],
        ['Sync via the transactional outbox or CDC (Debezium) from the binlog; treat MySQL as the source of truth and the search index as a rebuildable projection.',
            'Plan reindexing, versioned indexes with aliases, and monitoring of lag.',
            'Keep security consistent: filter results by permissions at query time.'],
        [['F', 'When is MySQL FULLTEXT enough?', 'For simple keyword search on moderate data without advanced relevance needs.'],
            ['F', 'Name a dedicated search engine.', 'Elasticsearch or OpenSearch.'],
            ['M', 'Features search engines add?', 'Typo tolerance, synonyms, faceting, highlighting, autocomplete and scalable ranking.'],
            ['M', 'What is the source of truth?', 'The database; the search index is a derived copy that can be rebuilt.'],
            ['S', 'How do you keep Elasticsearch in sync with MySQL?', 'Outbox events or CDC from the binlog with idempotent consumers and a backfill/reindex process.'],
            ['S', 'What are the operational costs?', 'Another cluster to run, monitor, secure and scale, plus eventual consistency between systems.']],
        [['MySQL side: outbox row written in the same transaction.',
            r`START TRANSACTION;
UPDATE articles SET title = 'Index tuning v2' WHERE id = 1;
INSERT INTO search_outbox (entity, entity_id, op) VALUES ('article', 1, 'UPSERT');
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`],
            ['Relay reads pending rows.',
                r`SELECT id, entity_id FROM search_outbox WHERE processed_at IS NULL ORDER BY id LIMIT 100 FOR UPDATE SKIP LOCKED;

-- OUTPUT:
-- id | entity_id
--  7 | 1`]],
        [['OpenSearch query equivalent of a typo-tolerant search (REST).',
            r`GET /articles/_search
{ "query": { "multi_match": { "query": "indxes", "fields": ["title^2","body"], "fuzziness": "AUTO" } } }

-- OUTPUT:
-- hits: [{ "_id": "1", "_score": 1.4, "_source": { "title": "Index tuning v2" } }]`],
            ['Mark processed after indexing.',
                r`UPDATE search_outbox SET processed_at = NOW() WHERE id IN (7);

-- OUTPUT:
-- Query OK, 1 row affected`]]
    ),

    'CREATE TEMPORARY TABLE': x(
        ['A temporary table exists only for your session and is dropped automatically when you disconnect.',
            'Create with <code>CREATE TEMPORARY TABLE t (...)</code> or from a query with AS SELECT.',
            'Other sessions cannot see it; the same name can exist in many sessions.'],
        ['A temporary table can hide a permanent table of the same name for your session.',
            'You can index it, insert, update and join like a normal table.',
            'Drop it early with <code>DROP TEMPORARY TABLE</code> to release resources.'],
        ['With connection pools, session state persists across requests; leftover temp tables or name clashes cause bugs. Always drop them explicitly.',
            'Temp tables use memory (TempTable engine) then spill to disk; large ones affect resources.',
            'Replication: with statement-based binlog, temp tables are replicated via session; prefer ROW format and avoid temp tables across statements in sensitive setups.'],
        [['F', 'What is a temporary table?', 'A table that exists only for the current session and is removed when the session ends.'],
            ['F', 'Can other users see it?', 'No.'],
            ['M', 'Can you create indexes on temporary tables?', 'Yes, they work like normal tables for indexes and queries.'],
            ['M', 'Danger with connection pools?', 'The session survives across requests, so temp tables can persist unexpectedly; drop them when done.'],
            ['S', 'Why use a temp table in a report job?', 'To materialize an expensive intermediate result once and reuse it across several statements with indexes.'],
            ['S', 'Replication issues?', 'Temp tables can cause problems with statement-based replication and replica restarts; prefer row-based format or avoid them.']],
        [['Create and use.',
            r`CREATE TEMPORARY TABLE high_earners AS SELECT id, name, salary FROM emp WHERE salary > 50000;
ALTER TABLE high_earners ADD PRIMARY KEY (id);
SELECT COUNT(*) FROM high_earners;

-- OUTPUT:
-- COUNT(*)
-- 2`],
            ['Not visible elsewhere.',
                r`-- another session
SELECT * FROM high_earners;

-- OUTPUT:
-- ERROR 1146 (42S02): Table 'shop.high_earners' doesn't exist`]],
        [['Clean up.',
            r`DROP TEMPORARY TABLE IF EXISTS high_earners;

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Name shadowing.',
                r`CREATE TEMPORARY TABLE emp (id INT);   -- hides the real emp for this session
SELECT COUNT(*) FROM emp;

-- OUTPUT:
-- COUNT(*)
-- 0`]]
    ),

    'Temporary Table vs CTE vs Permanent Table': x(
        ['A permanent table is stored until dropped and visible to all sessions. A temporary table lasts for one session. A CTE lasts for one statement and stores nothing.',
            'Use permanent tables for real data, temporary tables for session work and CTEs for readable queries.',
            'They differ in lifetime, visibility and storage.'],
        ['Permanent staging tables are good for ETL steps that must survive restarts and be inspected.',
            'Temporary tables are lighter for scratch work but vanish on disconnect.',
            'CTEs cost nothing to store and cannot be indexed.'],
        ['Choose by durability and reuse: crash-safe pipeline stages = permanent; fast scratch space = temporary; single query clarity = CTE.',
            'Permanent staging tables need cleanup jobs and naming per run to avoid collisions.',
            'Monitor temp table spill (<code>Created_tmp_disk_tables</code>) for heavy temp work.'],
        [['F', 'Which table lives the longest?', 'A permanent table.'],
            ['F', 'Which one stores no data?', 'A CTE.'],
            ['M', 'When use a permanent staging table?', 'For ETL steps that must survive failures, be inspected, or be shared by multiple sessions.'],
            ['M', 'Can a CTE be indexed?', 'No; materialize to a temp table if you need indexes.'],
            ['S', 'How to design staging for repeatable loads?', 'Per-batch staging tables or batch ids, idempotent merges and cleanup after success.'],
            ['S', 'How do you monitor temp workloads?', 'Track tmp table counters, disk usage of tmpdir and slow queries creating disk temp tables.']],
        [['Three lifetimes.',
            r`CREATE TABLE stage_orders AS SELECT * FROM orders WHERE 1 = 0;               -- permanent
CREATE TEMPORARY TABLE scratch AS SELECT * FROM orders LIMIT 10;               -- session
WITH cte AS (SELECT * FROM orders LIMIT 10) SELECT COUNT(*) FROM cte;          -- statement

-- OUTPUT:
-- COUNT(*)
-- 10`],
            ['Permanent staging cleanup.',
                r`DROP TABLE IF EXISTS stage_orders;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Idempotent merge from staging.',
            r`INSERT INTO orders (id, customer_id, total) SELECT id, customer_id, total FROM stage_orders s
ON DUPLICATE KEY UPDATE total = s.total;

-- OUTPUT:
-- Query OK, 120 rows affected`],
            ['Temp table disk spill counters.',
                r`SHOW GLOBAL STATUS LIKE 'Created_tmp_disk_tables';

-- OUTPUT:
-- Variable_name           | Value
-- Created_tmp_disk_tables | 18`]]
    )
};
