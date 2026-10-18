// Deep dive, module 46 (Advanced SQL Interview Problems).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d16: Record<string, Deep> = {
    'Second & Nth Highest Salary Problems': dv(
        [`The question is about the Nth distinct value in descending order. Think of it as ranking the distinct salaries and picking rank N. Three standard ways: a subquery with MAX (only for second), LIMIT/OFFSET over DISTINCT values, and a window function with DENSE_RANK. Each handles ties and missing values differently.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept INT, salary INT);
INSERT INTO emp VALUES (1,'A',10,100),(2,'B',10,100),(3,'C',10,90),(4,'D',20,80),(5,'E',20,80);
SELECT MAX(salary) AS second_highest FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);
SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1;
SELECT salary FROM (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS dr FROM emp) t WHERE dr = 2 LIMIT 1;

-- OUTPUT: (all three)
-- 90`],
        [`Variants: Nth highest overall, per department, with ties included (return all employees with that salary), and returning NULL when the Nth value does not exist. Wrap LIMIT/OFFSET in a scalar subquery to get NULL instead of an empty result.`,
            r`SELECT (SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 5) AS sixth;
SELECT name, salary FROM emp WHERE salary = (SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1);
SELECT dept, salary FROM (SELECT dept, salary, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dr FROM emp GROUP BY dept, salary) t WHERE dr = 2;

-- OUTPUT:
-- sixth
-- NULL`],
        [`Mistakes: forgetting DISTINCT (duplicates make the "second row" equal the highest), using ROW_NUMBER or RANK where DENSE_RANK is needed, and returning an empty set instead of NULL when the rank does not exist. Test with ties and with fewer than N distinct values.`,
            r`SELECT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1;          -- returns 100 again (duplicate)
SELECT salary FROM (SELECT salary, RANK() OVER (ORDER BY salary DESC) AS rk FROM emp) t WHERE rk = 2;   -- empty: ranks are 1,1,3

-- OUTPUT:
-- salary
-- 100
-- Empty set`],
        [`With an index on salary, LIMIT/OFFSET over DISTINCT stops early and is cheap; a window function sorts all rows. For huge tables prefer the index-friendly form and check the plan.`,
            r`ALTER TABLE emp ADD INDEX idx_salary (salary);
EXPLAIN SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1;

-- OUTPUT: (example)
-- type  | key        | Extra
-- range | idx_salary | Backward index scan; Using index for group-by`],
        [`Real-world interview answer: a reusable function that returns the Nth highest salary, with N validated and NULL for out-of-range values.`,
            r`DELIMITER //
CREATE FUNCTION nth_salary(n INT) RETURNS INT DETERMINISTIC READS SQL DATA
BEGIN
  IF n < 1 THEN RETURN NULL; END IF;
  RETURN (SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET n - 1);
END //
DELIMITER ;
SELECT nth_salary(2), nth_salary(10);

-- OUTPUT:
-- nth_salary(2) | nth_salary(10)
-- 90            | NULL`]
    ),

    'Find & Remove Duplicate Records': dv(
        [`A duplicate is defined by the columns that should be unique (a business key), not by the whole row. Find them by grouping on that key and keeping groups with more than one row. To remove, decide which row survives (lowest id, newest timestamp), then delete the others.`,
            r`CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(80), created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
INSERT INTO users (email) VALUES ('a@x.com'),('b@x.com'),('a@x.com'),('a@x.com');
SELECT email, COUNT(*) AS n, MIN(id) AS keep_id, GROUP_CONCAT(id) AS ids FROM users GROUP BY email HAVING COUNT(*) > 1;

-- OUTPUT:
-- email   | n | keep_id | ids
-- a@x.com | 3 |       1 | 1,3,4`],
        [`Delete patterns: self join (<code>a.id &gt; b.id</code>), window function (<code>ROW_NUMBER() ... rn &gt; 1</code>), NOT IN with MIN(id), or rebuild into a new table with a unique key using <code>INSERT IGNORE</code> and swap names.`,
            r`DELETE a FROM users a JOIN users b ON a.email = b.email AND a.id > b.id;
DELETE u FROM users u JOIN (SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn FROM users) d ON d.id = u.id WHERE d.rn > 1;
DELETE FROM users WHERE id NOT IN (SELECT keep FROM (SELECT MIN(id) AS keep FROM users GROUP BY email) k);

-- OUTPUT:
-- Query OK, 2 rows affected`],
        [`Mistakes: deleting without previewing, choosing the survivor arbitrarily, case or whitespace differences hiding duplicates, and not adding a unique constraint afterwards (duplicates return). Normalize values, preview with SELECT, and add the constraint.`,
            r`SELECT LOWER(TRIM(email)) AS e, COUNT(*) FROM users GROUP BY e HAVING COUNT(*) > 1;
UPDATE users SET email = LOWER(TRIM(email));
ALTER TABLE users ADD UNIQUE KEY uq_email (email);

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`On very large tables delete in batches or rebuild: create a clean copy with a unique index, copy distinct rows, then rename tables atomically. This avoids huge transactions and long lock times.`,
            r`CREATE TABLE users_clean LIKE users;
ALTER TABLE users_clean ADD UNIQUE KEY uq_email (email);
INSERT IGNORE INTO users_clean SELECT * FROM users ORDER BY id;
RENAME TABLE users TO users_old, users_clean TO users;

-- OUTPUT:
-- Query OK, 120450 rows affected  (duplicates silently skipped; the lowest id wins because of ORDER BY id)`],
        [`Real-world: deduplicate contacts imported from two systems, keeping the most complete record and logging removed ids for audit.`,
            r`INSERT INTO removed_duplicates (removed_id, kept_id, email) SELECT b.id, a.id, a.email FROM users a JOIN users b ON a.email = b.email AND a.id < b.id;
DELETE b FROM users a JOIN users b ON a.email = b.email AND a.id < b.id;

-- OUTPUT:
-- Query OK, 412 rows affected`]
    ),

    'Employees Earning More Than Their Manager': dv(
        [`Each employee row stores the manager's id, so the manager's salary lives in another row of the same table. A self join matches each employee to their manager row, and a WHERE compares the two salaries. Employees without a manager (the top of the tree) have no match in an inner join and are excluded.`,
            r`CREATE TABLE staff (id INT PRIMARY KEY, name VARCHAR(20), salary INT, manager_id INT, KEY idx_mgr (manager_id));
INSERT INTO staff VALUES (1,'Annaji',150,NULL),(2,'Raoji',80,1),(3,'Moropant',70,1),(4,'Kanhoji',90,2);
SELECT e.name AS employee, e.salary, m.name AS manager, m.salary AS manager_salary FROM staff e JOIN staff m ON m.id = e.manager_id WHERE e.salary > m.salary;

-- OUTPUT:
-- employee | salary | manager | manager_salary
-- Kanhoji  |     90 | Raoji   | 80`],
        [`Alternatives: a correlated subquery, a window function with a join to the manager, and a recursive CTE when the question is "more than anyone above them". Pick the self join for clarity.`,
            r`SELECT name FROM staff e WHERE salary > (SELECT salary FROM staff m WHERE m.id = e.manager_id);
WITH RECURSIVE anc AS (SELECT id, manager_id AS anc_id FROM staff WHERE manager_id IS NOT NULL UNION ALL SELECT a.id, s.manager_id FROM anc a JOIN staff s ON s.id = a.anc_id WHERE s.manager_id IS NOT NULL)
SELECT DISTINCT e.name FROM staff e JOIN anc a ON a.id = e.id JOIN staff x ON x.id = a.anc_id WHERE e.salary > x.salary;

-- OUTPUT:
-- name
-- Kanhoji`],
        [`Mistakes: no table aliases (ambiguous columns), LEFT JOIN and then forgetting the NULL manager case, comparing with NULL salaries (unknown), and joining on the wrong key. State assumptions: are salaries nullable, can there be several top managers?`,
            r`SELECT e.name FROM staff e LEFT JOIN staff m ON m.id = e.manager_id WHERE e.salary > m.salary;        -- NULL manager gives unknown: row excluded anyway
SELECT e.name FROM staff e JOIN staff m ON m.id = e.manager_id WHERE e.salary > COALESCE(m.salary, 0) AND m.salary IS NOT NULL;

-- OUTPUT:
-- name
-- Kanhoji`],
        [`The join uses the manager's primary key, so each lookup is a single-row index probe, and an index on <code>manager_id</code> helps hierarchy queries in the other direction. The plan should show eq_ref for the manager lookup.`,
            r`EXPLAIN SELECT e.name FROM staff e JOIN staff m ON m.id = e.manager_id WHERE e.salary > m.salary;

-- OUTPUT: (example)
-- table | type   | key
-- e     | ALL    | NULL
-- m     | eq_ref | PRIMARY`],
        [`Real-world audit: list pay-compression cases with the size of the gap, sorted by the largest difference.`,
            r`SELECT e.name AS employee, m.name AS manager, e.salary - m.salary AS gap FROM staff e JOIN staff m ON m.id = e.manager_id WHERE e.salary > m.salary ORDER BY gap DESC;

-- OUTPUT:
-- employee | manager | gap
-- Kanhoji  | Raoji   | 10`]
    ),

    'Department-wise Highest Salary & Top 3 per Department': dv(
        [`"Highest per group" is a grouped MAX; to also show who earns it you must join back or rank rows. "Top N per group" needs ranking within each group: a window function numbers rows per department by salary, and an outer query keeps ranks up to N. LIMIT alone cannot do this because it limits the whole result.`,
            r`SELECT d.name AS dept, e.name, e.salary FROM emp e JOIN departments d ON d.id = e.dept WHERE (e.dept, e.salary) IN (SELECT dept, MAX(salary) FROM emp GROUP BY dept);
WITH ranked AS (SELECT dept, name, salary, DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rk FROM emp)
SELECT dept, name, salary FROM ranked WHERE rk <= 3 ORDER BY dept, salary DESC;

-- OUTPUT:
-- dept | name | salary
--   10 | A    |    100
--   10 | B    |    100
--   10 | C    |     90`],
        [`Decide the tie policy: ROW_NUMBER gives exactly N rows (with an explicit tiebreaker), RANK and DENSE_RANK include all tied rows. A LATERAL join (8.0.14+) runs <code>ORDER BY ... LIMIT N</code> per department and can use an index.`,
            r`SELECT d.name, t.name AS employee, t.salary FROM departments d JOIN LATERAL (SELECT name, salary FROM emp e WHERE e.dept = d.id ORDER BY salary DESC, id LIMIT 3) t;
SELECT dept, name, salary FROM (SELECT dept, name, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, id) AS rn FROM emp) t WHERE rn <= 3;

-- OUTPUT:
-- name | employee | salary
-- HR   | A        |    100`],
        [`Mistakes: filtering the window result in WHERE (not allowed), no tiebreaker (unstable rows), and using GROUP BY with non-aggregated columns. Wrap the ranking in a CTE or derived table and filter outside.`,
            r`SELECT dept, name, salary FROM emp WHERE ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) <= 3;
SELECT dept, name, MAX(salary) FROM emp GROUP BY dept;

-- OUTPUT:
-- ERROR 3593 (HY000): You cannot use the window function 'row_number' in this context.
-- ERROR 1055 (42000): Expression #2 of SELECT list is not in GROUP BY clause and contains nonaggregated column 'emp.name'`],
        [`Index (dept, salary) lets the LATERAL form read three entries per department and avoids sorting the table; the window form sorts everything. Compare with EXPLAIN ANALYZE on large data.`,
            r`ALTER TABLE emp ADD INDEX idx_dept_salary (dept, salary);
EXPLAIN ANALYZE SELECT d.name, t.name FROM departments d JOIN LATERAL (SELECT name FROM emp e WHERE e.dept = d.id ORDER BY salary DESC LIMIT 3) t;

-- OUTPUT: (example)
-- -> Nested loop  -> Limit: 3 row(s)  -> Index lookup on e using idx_dept_salary (dept = d.id) (reverse)`],
        [`Real-world: a leaderboard page showing the top three sellers per region, cached and refreshed hourly.`,
            r`SELECT region, seller, revenue FROM (SELECT region, seller, SUM(total) AS revenue, ROW_NUMBER() OVER (PARTITION BY region ORDER BY SUM(total) DESC) AS rn FROM sales WHERE created_at >= '2026-05-01' GROUP BY region, seller) t WHERE rn <= 3;

-- OUTPUT:
-- region | seller | revenue
-- West   | Abaji  | 48200.00`]
    ),

    'Running Total & Moving Average Problems': dv(
        [`A running total is a window SUM from the first row to the current row; a moving average is an AVG over a fixed-size frame. Both are single-pass window functions over rows in a defined order. Without window functions you would need a self join or correlated subquery, which is quadratic.`,
            r`CREATE TABLE daily_sales (day DATE PRIMARY KEY, sales INT);
INSERT INTO daily_sales VALUES ('2026-01-01',100),('2026-01-02',200),('2026-01-03',200),('2026-01-04',100);
SELECT day, sales, SUM(sales) OVER (ORDER BY day) AS running, ROUND(AVG(sales) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS ma3 FROM daily_sales;

-- OUTPUT:
-- day        | sales | running | ma3
-- 2026-01-01 |   100 |     100 | 100.0
-- 2026-01-02 |   200 |     300 | 150.0
-- 2026-01-03 |   200 |     500 | 166.7
-- 2026-01-04 |   100 |     600 | 166.7`],
        [`Variants: per-group totals with PARTITION BY, percent of total (<code>x / SUM(x) OVER ()</code>), cumulative percentage, date-range frames (<code>RANGE BETWEEN INTERVAL 6 DAY PRECEDING</code>), and the older self-join form for databases without windows.`,
            r`SELECT account_id, txn_date, amount, SUM(amount) OVER (PARTITION BY account_id ORDER BY txn_date, id) AS balance FROM txns;
SELECT day, ROUND(100 * sales / SUM(sales) OVER (), 1) AS pct_of_total, ROUND(100 * SUM(sales) OVER (ORDER BY day) / SUM(sales) OVER (), 1) AS cumulative_pct FROM daily_sales;
SELECT a.day, SUM(b.sales) AS running_old_style FROM daily_sales a JOIN daily_sales b ON b.day <= a.day GROUP BY a.day;

-- OUTPUT:
-- day        | pct_of_total | cumulative_pct
-- 2026-01-04 |         16.7 |          100.0`],
        [`Mistakes: no unique tiebreaker in ORDER BY (ties give arbitrary intermediate totals), RANGE instead of ROWS with duplicate dates, and missing days that make "last 7 rows" different from "last 7 days". Join a calendar table first.`,
            r`SELECT c.d, COALESCE(s.sales, 0) AS sales, ROUND(AVG(COALESCE(s.sales, 0)) OVER (ORDER BY c.d ROWS BETWEEN 6 PRECEDING AND CURRENT ROW), 1) AS ma7 FROM calendar c LEFT JOIN daily_sales s ON s.day = c.d WHERE c.d BETWEEN '2026-01-01' AND '2026-01-10';

-- OUTPUT:
-- d          | sales | ma7
-- 2026-01-07 |     0 | 85.7`],
        [`On big tables aggregate to the reporting grain (day) first, then apply the window over the small result. Index the order column if you must window the raw table.`,
            r`WITH daily AS (SELECT DATE(created_at) AS day, SUM(total) AS sales FROM orders WHERE created_at >= '2026-01-01' GROUP BY DATE(created_at))
SELECT day, sales, SUM(sales) OVER (ORDER BY day) AS ytd FROM daily;

-- OUTPUT:
-- day        | sales   | ytd
-- 2026-01-01 | 8120.00 | 8120.00`],
        [`Real-world account statement: running balance after each transaction, with a check that the final balance equals the account's stored balance.`,
            r`SELECT id, posted_at, amount, SUM(amount) OVER (ORDER BY posted_at, id) AS balance FROM ledger WHERE account_id = 1 ORDER BY posted_at, id;
SELECT a.balance = (SELECT SUM(amount) FROM ledger WHERE account_id = a.id) AS consistent FROM accounts a WHERE a.id = 1;

-- OUTPUT:
-- consistent
-- 1`]
    ),

    'Consecutive Dates, Missing Numbers & Gaps and Islands': dv(
        [`Gaps-and-islands problems find runs of consecutive values (islands) and the breaks between them (gaps). Key idea: for a sequence with no duplicates, subtract the row number from the value; consecutive values produce the same difference, so the difference identifies the island. Alternatives use LAG/LEAD to compare neighbours.`,
            r`CREATE TABLE logins (user_id INT, login_date DATE);
INSERT INTO logins VALUES (1,'2026-04-01'),(1,'2026-04-02'),(1,'2026-04-03'),(1,'2026-04-07'),(1,'2026-04-08');
WITH d AS (SELECT DISTINCT user_id, login_date FROM logins),
g AS (SELECT user_id, login_date, DATE_SUB(login_date, INTERVAL ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) DAY) AS grp FROM d)
SELECT user_id, MIN(login_date) AS start_d, MAX(login_date) AS end_d, COUNT(*) AS days FROM g GROUP BY user_id, grp ORDER BY start_d;

-- OUTPUT:
-- user_id | start_d    | end_d      | days
-- 1       | 2026-04-01 | 2026-04-03 |    3
-- 1       | 2026-04-07 | 2026-04-08 |    2`],
        [`Variants: longest streak (take MAX of island lengths), users with at least N consecutive days (HAVING COUNT(*) &gt;= N), missing ids (LEAD gap), all missing values (series LEFT JOIN), and consecutive rows with the same status (compare ROW_NUMBER over two partitionings).`,
            r`SELECT id + 1 AS gap_start, next_id - 1 AS gap_end FROM (SELECT id, LEAD(id) OVER (ORDER BY id) AS next_id FROM invoices) t WHERE next_id - id > 1;
WITH RECURSIVE s AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM s WHERE n < 10) SELECT s.n AS missing FROM s LEFT JOIN invoices i ON i.id = s.n WHERE i.id IS NULL;
SELECT DISTINCT user_id FROM (SELECT user_id, login_date, LAG(login_date, 2) OVER (PARTITION BY user_id ORDER BY login_date) AS two_back FROM (SELECT DISTINCT user_id, login_date FROM logins) x) t WHERE DATEDIFF(login_date, two_back) = 2;

-- OUTPUT:
-- gap_start | gap_end
-- 4         | 6`],
        [`Mistakes: duplicate dates breaking the row-number trick (deduplicate first), time zones changing the date, and using BETWEEN logic that includes boundaries twice. Normalize the date column and use DISTINCT before numbering.`,
            r`WITH d AS (SELECT DISTINCT user_id, DATE(login_at) AS login_date FROM login_events)
SELECT user_id, COUNT(*) FROM d GROUP BY user_id;

-- OUTPUT:
-- user_id | COUNT(*)
-- 1       |        5`],
        [`Window passes need a sort by (partition, order). An index on (user_id, login_date) removes the sort. For huge event tables, aggregate to one row per user and day first.`,
            r`ALTER TABLE logins ADD INDEX idx_user_date (user_id, login_date);
EXPLAIN SELECT user_id, login_date, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) FROM logins;

-- OUTPUT: (example)
-- type  | key           | Extra
-- index | idx_user_date | Using index`],
        [`Real-world: find customers on a purchase streak of at least four consecutive weeks for a loyalty reward.`,
            r`WITH w AS (SELECT DISTINCT customer_id, YEARWEEK(created_at, 3) AS wk FROM orders),
g AS (SELECT customer_id, wk, wk - ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY wk) AS grp FROM w)
SELECT customer_id, COUNT(*) AS streak_weeks FROM g GROUP BY customer_id, grp HAVING COUNT(*) >= 4;

-- OUTPUT:
-- customer_id | streak_weeks
-- 7           |            6`]
    ),

    'Employee Hierarchy & Recursive Organizational Tree': dv(
        [`An organisation is stored as an adjacency list: each row has a parent (manager) id. A recursive CTE walks it: the anchor selects the root(s), the recursive part joins children to the rows found so far, repeating until no new rows appear. Level and path columns record depth and ordering.`,
            r`WITH RECURSIVE org AS (
  SELECT id, name, manager_id, 0 AS lvl, CAST(name AS CHAR(300)) AS path FROM staff WHERE manager_id IS NULL
  UNION ALL
  SELECT s.id, s.name, s.manager_id, o.lvl + 1, CONCAT(o.path, ' > ', s.name) FROM staff s JOIN org o ON s.manager_id = o.id)
SELECT CONCAT(REPEAT('  ', lvl), name) AS chart FROM org ORDER BY path;

-- OUTPUT:
-- chart
-- Annaji
--   Moropant
--   Raoji
--     Kanhoji`],
        [`Common questions: all reports under a manager (anchor at that manager), the chain of managers above an employee (walk upward), team size per manager, depth of the tree, and leaf employees. Closure tables and materialized paths trade write cost for fast subtree reads.`,
            r`WITH RECURSIVE up AS (SELECT id, name, manager_id, 0 AS steps FROM staff WHERE id = 4 UNION ALL SELECT s.id, s.name, s.manager_id, u.steps + 1 FROM staff s JOIN up u ON s.id = u.manager_id)
SELECT name, steps FROM up ORDER BY steps;
WITH RECURSIVE t AS (SELECT id AS mgr, id AS member FROM staff UNION ALL SELECT t.mgr, s.id FROM t JOIN staff s ON s.manager_id = t.member)
SELECT s.name, COUNT(*) - 1 AS team_size FROM t JOIN staff s ON s.id = t.mgr GROUP BY t.mgr, s.name HAVING team_size > 0;

-- OUTPUT:
-- name    | steps
-- Kanhoji | 0
-- Raoji   | 1
-- Annaji  | 2`],
        [`Mistakes: cycles in the data (infinite recursion), several roots with NULL parent handled wrongly, path columns too short (truncation) and no index on the parent column. Guard with a path check and a recursion limit.`,
            r`SET SESSION cte_max_recursion_depth = 100;
ALTER TABLE staff ADD INDEX idx_manager (manager_id);
WITH RECURSIVE w AS (SELECT id, CAST(id AS CHAR(200)) AS path FROM staff WHERE id = 1 UNION ALL SELECT s.id, CONCAT(w.path, ',', s.id) FROM staff s JOIN w ON s.manager_id = w.id WHERE FIND_IN_SET(s.id, w.path) = 0)
SELECT path FROM w;

-- OUTPUT:
-- path
-- 1
-- 1,2
-- 1,3
-- 1,2,4`],
        [`For frequent subtree queries on large trees use a closure table (ancestor, descendant, depth) with an index on each side, making a subtree a single index range.`,
            r`CREATE TABLE staff_closure (ancestor INT, descendant INT, depth INT, PRIMARY KEY (ancestor, descendant), KEY idx_desc (descendant));
SELECT s.name FROM staff_closure c JOIN staff s ON s.id = c.descendant WHERE c.ancestor = 1 AND c.depth > 0;

-- OUTPUT:
-- name
-- Raoji
-- Moropant
-- Kanhoji`],
        [`Real-world: roll up total salary cost per manager, including all indirect reports, for a budgeting report.`,
            r`WITH RECURSIVE t AS (SELECT id AS mgr, id AS member FROM staff UNION ALL SELECT t.mgr, s.id FROM t JOIN staff s ON s.manager_id = t.member)
SELECT m.name, SUM(e.salary) AS total_cost, COUNT(*) AS headcount FROM t JOIN staff m ON m.id = t.mgr JOIN staff e ON e.id = t.member GROUP BY t.mgr, m.name ORDER BY total_cost DESC;

-- OUTPUT:
-- name   | total_cost | headcount
-- Annaji |        390 | 4`]
    ),

    'Customers Who Never Ordered': dv(
        [`This is an anti-join: customers with no matching order. MySQL 8 recognises NOT EXISTS and LEFT JOIN ... IS NULL as an antijoin and executes them with an index probe into the orders table for each customer, stopping at the first match. NOT IN is risky because a NULL in the subquery makes the whole predicate unknown.`,
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(20)); CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, KEY idx_customer (customer_id));
INSERT INTO customers VALUES (1,'Abaji'),(2,'Raoji'),(3,'Moropant'); INSERT INTO orders VALUES (10,1),(11,1);
SELECT c.id, c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;
SELECT c.id, c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT: (both)
-- id | name
--  2 | Raoji
--  3 | Moropant`],
        [`Variants: no orders ever, no orders in the last 90 days, no PAID orders, orders but never a refund. Put the extra conditions inside the NOT EXISTS subquery (or the ON clause of the LEFT JOIN), not in the outer WHERE.`,
            r`SELECT c.id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.created_at >= NOW() - INTERVAL 90 DAY);
SELECT c.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'PAID' WHERE o.id IS NULL;

-- OUTPUT:
-- id
-- 2
-- 3`],
        [`Mistakes: NOT IN with NULLs returning an empty set, filtering the right table in WHERE (turns the LEFT JOIN into an inner join, losing the unmatched rows), and using COUNT(*) = 0 forms that scan more. Use NOT EXISTS.`,
            r`INSERT INTO orders VALUES (12, NULL);
SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);            -- empty because of the NULL
SELECT id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);    -- correct

-- OUTPUT:
-- Empty set
-- id: 2, 3`],
        [`The antijoin needs an index on <code>orders.customer_id</code>; without it each customer scans the orders table. Check for "Nested loop antijoin" and an index lookup in the tree plan.`,
            r`EXPLAIN FORMAT=TREE SELECT c.id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT: (example)
-- -> Nested loop antijoin
--     -> Table scan on c
--     -> Single-row covering index lookup on o using idx_customer (customer_id=c.id)`],
        [`Real-world: a win-back campaign list: customers who signed up more than 30 days ago and still have no paid order, saved with a timestamp so later orders do not change the targeted set.`,
            r`INSERT INTO campaign_targets (campaign, customer_id, selected_at) SELECT 'winback-2026-05', c.id, NOW() FROM customers c
WHERE c.created_at < NOW() - INTERVAL 30 DAY AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'PAID');

-- OUTPUT:
-- Query OK, 1840 rows affected`]
    ),

    'Most Frequently Purchased Product & Monthly Revenue': dv(
        [`The most purchased product is a grouped aggregate over order items: group by product, sum quantity (or count orders), order descending and take the first row (or rank to include ties). Monthly revenue groups paid orders by month and sums totals. Both read the order tables once.`,
            r`SELECT p.name, SUM(oi.qty) AS units FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id, p.name ORDER BY units DESC LIMIT 1;
SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, SUM(total) AS revenue FROM orders WHERE status = 'PAID' GROUP BY month ORDER BY month;

-- OUTPUT:
-- name | units
-- Pen  |   420
-- month   | revenue
-- 2026-01 | 12000.00
-- 2026-02 | 15400.00`],
        [`Variants: ties for top product (DENSE_RANK), top product per category, months with zero revenue (calendar or recursive month series), revenue by product category, and revenue net of refunds.`,
            r`SELECT name, units FROM (SELECT p.name, SUM(oi.qty) AS units, DENSE_RANK() OVER (ORDER BY SUM(oi.qty) DESC) AS rk FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.id, p.name) t WHERE rk = 1;
WITH RECURSIVE m AS (SELECT DATE('2026-01-01') AS d UNION ALL SELECT d + INTERVAL 1 MONTH FROM m WHERE d < '2026-06-01')
SELECT DATE_FORMAT(m.d, '%Y-%m') AS month, COALESCE(SUM(o.total), 0) AS revenue FROM m LEFT JOIN orders o ON o.created_at >= m.d AND o.created_at < m.d + INTERVAL 1 MONTH AND o.status = 'PAID' GROUP BY m.d;

-- OUTPUT:
-- month   | revenue
-- 2026-03 | 0.00`],
        [`Mistakes: counting cancelled or unpaid orders, summing order totals after joining items (fan-out), grouping by a formatted month string on a huge table (no index), and ignoring time zones. Aggregate in a derived table, filter statuses and use date ranges.`,
            r`SELECT SUM(o.total) FROM orders o JOIN order_items i ON i.order_id = o.id;      -- order total repeated per item
SELECT SUM(total) FROM orders WHERE status = 'PAID';                              -- correct

-- OUTPUT:
-- first query overstates revenue; second is correct`],
        [`Speed up reporting with an index (status, created_at, total) and by pre-aggregating into a daily summary table that dashboards read instead of the raw tables.`,
            r`ALTER TABLE orders ADD INDEX idx_status_created_total (status, created_at, total);
EXPLAIN SELECT DATE(created_at), SUM(total) FROM orders WHERE status = 'PAID' AND created_at >= '2026-01-01' GROUP BY DATE(created_at);

-- OUTPUT: (example)
-- type  | key                      | Extra
-- range | idx_status_created_total | Using index; Using temporary`],
        [`Real-world dashboard query: top five products this month with their revenue share of the month's total.`,
            r`SELECT p.name, SUM(oi.qty * oi.unit_price) AS revenue, ROUND(100 * SUM(oi.qty * oi.unit_price) / SUM(SUM(oi.qty * oi.unit_price)) OVER (), 1) AS pct
FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id WHERE o.status = 'PAID' AND o.created_at >= '2026-05-01' GROUP BY p.id, p.name ORDER BY revenue DESC LIMIT 5;

-- OUTPUT:
-- name | revenue | pct
-- Pen  | 4200.00 | 18.2`]
    ),

    'Year-over-Year Growth & Retention Analysis': dv(
        [`Year-over-year growth compares a period with the same period a year earlier: <code>(current - previous) / previous</code>. Aggregate revenue per year (or month), then bring the previous value alongside with LAG (or a self join). Retention analysis assigns each customer to a cohort (their first month) and counts how many are active in each later month.`,
            r`SELECT yr, revenue, ROUND((revenue - LAG(revenue) OVER (ORDER BY yr)) / NULLIF(LAG(revenue) OVER (ORDER BY yr), 0) * 100, 1) AS yoy_pct
FROM (SELECT YEAR(created_at) AS yr, SUM(total) AS revenue FROM orders WHERE status = 'PAID' GROUP BY YEAR(created_at)) t;

-- OUTPUT:
-- yr   | revenue | yoy_pct
-- 2024 |  100000 | NULL
-- 2025 |  130000 | 30.0
-- 2026 |  117000 | -10.0`],
        [`Cohort retention: cohort = month of first order; activity = distinct months with an order; month offset = months between cohort and activity month; retention percent = active users divided by cohort size. Month-over-month and same-month-last-year comparisons use LAG with offsets 1 and 12.`,
            r`WITH first_order AS (SELECT user_id, DATE_FORMAT(MIN(created_at), '%Y-%m-01') AS cohort FROM orders GROUP BY user_id),
act AS (SELECT DISTINCT user_id, DATE_FORMAT(created_at, '%Y-%m-01') AS m FROM orders)
SELECT f.cohort, TIMESTAMPDIFF(MONTH, f.cohort, a.m) AS month_offset, COUNT(DISTINCT a.user_id) AS users FROM first_order f JOIN act a ON a.user_id = f.user_id GROUP BY f.cohort, month_offset ORDER BY f.cohort, month_offset;

-- OUTPUT:
-- cohort     | month_offset | users
-- 2026-01-01 | 0            | 100
-- 2026-01-01 | 1            |  42
-- 2026-01-01 | 2            |  31`],
        [`Mistakes: undefined "active" (purchase, login, any event?), comparing partial periods (the current month versus a full previous month), division by zero, and mixing calendar and rolling months. Fix the definitions and document them with the query.`,
            r`SELECT cohort, month_offset, ROUND(100 * users / FIRST_VALUE(users) OVER (PARTITION BY cohort ORDER BY month_offset), 1) AS retention_pct FROM cohort_counts;

-- OUTPUT:
-- cohort     | month_offset | retention_pct
-- 2026-01-01 | 0            | 100.0
-- 2026-01-01 | 1            |  42.0`],
        [`Large event tables should be reduced first to one row per user and month in a summary table, then cohort queries become small joins. Index (user_id, month) and (month).`,
            r`CREATE TABLE user_month_activity (user_id BIGINT, month DATE, orders INT, PRIMARY KEY (user_id, month), KEY idx_month (month));
INSERT INTO user_month_activity SELECT user_id, DATE_FORMAT(created_at, '%Y-%m-01'), COUNT(*) FROM orders WHERE created_at >= '2026-01-01' GROUP BY user_id, DATE_FORMAT(created_at, '%Y-%m-01');

-- OUTPUT:
-- Query OK, 412330 rows affected`],
        [`Real-world: a growth dashboard showing revenue, year-over-year change and month-1, month-3 and month-6 retention by signup cohort, refreshed nightly from summary tables.`,
            r`SELECT cohort, MAX(CASE WHEN month_offset = 1 THEN retention_pct END) AS m1, MAX(CASE WHEN month_offset = 3 THEN retention_pct END) AS m3, MAX(CASE WHEN month_offset = 6 THEN retention_pct END) AS m6 FROM retention_pivot GROUP BY cohort ORDER BY cohort;

-- OUTPUT:
-- cohort     | m1   | m3   | m6
-- 2026-01-01 | 42.0 | 31.0 | 24.0`]
    )
};
