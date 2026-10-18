// Module 46 (Advanced SQL Interview Problems), part L.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s46l: Record<string, DeepDive> = {
    'Consecutive Dates, Missing Numbers & Gaps and Islands': dd(
        [`<b>Islands</b> are runs of consecutive values; <b>gaps</b> are the holes between them. The trick: subtract a row number from the value. Consecutive values then produce the same constant, which identifies the island.`,
            r`CREATE TABLE logins (day DATE PRIMARY KEY);
INSERT INTO logins VALUES ('2024-01-01'),('2024-01-02'),('2024-01-03'),('2024-01-05'),('2024-01-06'),('2024-01-09');

SELECT MIN(day) AS streak_start, MAX(day) AS streak_end, COUNT(*) AS days
FROM  (SELECT day,
              DATE_SUB(day, INTERVAL ROW_NUMBER() OVER (ORDER BY day) DAY) AS grp
       FROM logins) t
GROUP  BY grp
ORDER  BY streak_start;

-- OUTPUT:
-- +--------------+------------+------+
-- | streak_start | streak_end | days |
-- +--------------+------------+------+
-- | 2024-01-01   | 2024-01-03 |    3 |
-- | 2024-01-05   | 2024-01-06 |    2 |
-- | 2024-01-09   | 2024-01-09 |    1 |
-- +--------------+------------+------+`],
        [`Missing numbers: find where the next id is more than 1 larger than the current one. LEAD() looks at the following row without a self join.`,
            r`CREATE TABLE t (id INT PRIMARY KEY);
INSERT INTO t VALUES (1),(2),(4),(5),(8);

SELECT id + 1 AS gap_start, next_id - 1 AS gap_end
FROM  (SELECT id, LEAD(id) OVER (ORDER BY id) AS next_id FROM t) x
WHERE  next_id - id > 1;

-- OUTPUT:
-- +-----------+---------+
-- | gap_start | gap_end |
-- +-----------+---------+
-- |         3 |       3 |
-- |         6 |       7 |
-- +-----------+---------+`],
        [`A product question: the longest login streak per user (engagement, gamification, fraud signals).`,
            r`CREATE TABLE activity (user_id INT, day DATE, PRIMARY KEY (user_id, day));
INSERT INTO activity VALUES (1,'2024-01-01'),(1,'2024-01-02'),(1,'2024-01-03'),(1,'2024-01-05'),(1,'2024-01-06'),
                            (2,'2024-01-01'),(2,'2024-01-02');

SELECT user_id, MAX(days) AS longest_streak
FROM  (SELECT user_id, COUNT(*) AS days
       FROM  (SELECT user_id, day,
                     DATE_SUB(day, INTERVAL ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY day) DAY) AS grp
              FROM activity) a
       GROUP  BY user_id, grp) s
GROUP  BY user_id;

-- OUTPUT:
-- +---------+----------------+
-- | user_id | longest_streak |
-- +---------+----------------+
-- |       1 |              3 |
-- |       2 |              2 |
-- +---------+----------------+`],
        [`<b>Advantages:</b> a recursive CTE can generate the full expected sequence, and a LEFT JOIN lists every missing number individually.`,
            r`CREATE TABLE t (id INT PRIMARY KEY);
INSERT INTO t VALUES (1),(2),(4),(5),(8);

WITH RECURSIVE seq AS (
    SELECT 1 AS n UNION ALL SELECT n + 1 FROM seq WHERE n < 8
)
SELECT seq.n AS missing
FROM   seq LEFT JOIN t ON t.id = seq.n
WHERE  t.id IS NULL;

-- OUTPUT:
-- +---------+
-- | missing |
-- +---------+
-- |       3 |
-- |       6 |
-- |       7 |
-- +---------+`],
        [`<b>Disadvantages:</b> the row-number trick assumes unique values. Duplicate dates break the arithmetic, so de-duplicate first.`,
            r`CREATE TABLE ev (day DATE);
INSERT INTO ev VALUES ('2024-01-01'),('2024-01-01'),('2024-01-02');     -- duplicate day

SELECT COUNT(*) AS days_in_streak
FROM  (SELECT day, DATE_SUB(day, INTERVAL ROW_NUMBER() OVER (ORDER BY day) DAY) AS grp
       FROM  (SELECT DISTINCT day FROM ev) d) t           -- DISTINCT makes the trick valid
GROUP  BY grp;

-- OUTPUT:
-- +----------------+
-- | days_in_streak |
-- +----------------+
-- |              2 |
-- +----------------+`],
        [`<b>Limitations:</b> recursive CTEs stop after cte_max_recursion_depth (default 1000) iterations, so generating a long sequence needs a higher limit or a numbers table.`,
            r`SET SESSION cte_max_recursion_depth = 1000;
WITH RECURSIVE s AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM s WHERE n < 5000)
SELECT COUNT(*) FROM s;                                  -- needs 5000 iterations

SET SESSION cte_max_recursion_depth = 10000;             -- raise the guard, then it works
WITH RECURSIVE s AS (SELECT 1 AS n UNION ALL SELECT n + 1 FROM s WHERE n < 5000)
SELECT COUNT(*) AS cnt FROM s;

-- OUTPUT:
-- ERROR 3636 (HY000): Recursive query aborted after 1001 iterations. Try increasing @@cte_max_recursion_depth to a larger value.
-- +------+
-- | cnt  |
-- +------+
-- | 5000 |
-- +------+`],
        `
   day      : 01 02 03 . 05 06 . . 09
   row_num  :  1  2  3   4  5   6   (numbers keep counting)
   day - rn :  0  0  0   1  1   3   <- same constant = same island
   island A = 01..03, island B = 05..06, island C = 09
`,
        `Gaps-and-islands is a single pass over sorted data, so index the ordering column (user_id, day). Store dates as DATE, not strings. For sequences over a few thousand values prefer a permanent numbers or calendar table instead of recursive CTEs on every query.`
    ),

    'Employee Hierarchy & Recursive Organizational Tree': dd(
        [`A <b>recursive CTE</b> walks a tree: an anchor query selects the roots, and a recursive part repeatedly joins children to the rows found so far, until no new rows appear.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), manager_id INT);
INSERT INTO emp VALUES (1,'CEO',NULL),(2,'CTO',1),(3,'CFO',1),(4,'Dev1',2),(5,'Dev2',2),(6,'Acct',3);

WITH RECURSIVE org AS (
    SELECT id, name, 0 AS depth, CAST(name AS CHAR(200)) AS path
    FROM   emp WHERE manager_id IS NULL
    UNION ALL
    SELECT e.id, e.name, o.depth + 1, CONCAT(o.path, ' > ', e.name)
    FROM   emp e JOIN org o ON e.manager_id = o.id
)
SELECT CONCAT(REPEAT('  ', depth), name) AS tree, depth, path
FROM   org ORDER BY path;

-- OUTPUT:
-- +--------------+-------+------------------+
-- | tree         | depth | path             |
-- +--------------+-------+------------------+
-- | CEO          |     0 | CEO              |
-- |   CFO        |     1 | CEO > CFO        |
-- |     Acct     |     2 | CEO > CFO > Acct |
-- |   CTO        |     1 | CEO > CTO        |
-- |     Dev1     |     2 | CEO > CTO > Dev1 |
-- |     Dev2     |     2 | CEO > CTO > Dev2 |
-- +--------------+-------+------------------+`],
        [`Plain self joins handle a fixed number of levels only. Each extra level needs another JOIN, and the depth of a real organisation is unknown.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), manager_id INT);
INSERT INTO emp VALUES (1,'CEO',NULL),(2,'CTO',1),(4,'Dev1',2),(7,'Intern',4);

-- Two joins reach only two levels below the CEO: the Intern is missed
SELECT e0.name AS l0, e1.name AS l1, e2.name AS l2
FROM   emp e0
LEFT JOIN emp e1 ON e1.manager_id = e0.id
LEFT JOIN emp e2 ON e2.manager_id = e1.id
WHERE  e0.manager_id IS NULL;

-- OUTPUT:
-- +------+------+------+
-- | l0   | l1   | l2   |
-- +------+------+------+
-- | CEO  | CTO  | Dev1 |
-- +------+------+------+`],
        [`Typical request: everyone who reports (directly or indirectly) to the CTO, for approvals or access reviews.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), manager_id INT);
INSERT INTO emp VALUES (1,'CEO',NULL),(2,'CTO',1),(3,'CFO',1),(4,'Dev1',2),(5,'Dev2',2),(7,'Intern',4);

WITH RECURSIVE reports AS (
    SELECT id, name FROM emp WHERE manager_id = 2          -- direct reports of CTO (id 2)
    UNION ALL
    SELECT e.id, e.name FROM emp e JOIN reports r ON e.manager_id = r.id
)
SELECT name FROM reports ORDER BY name;

-- OUTPUT:
-- +--------+
-- | name   |
-- +--------+
-- | Dev1   |
-- | Dev2   |
-- | Intern |
-- +--------+`],
        [`<b>Advantages:</b> aggregate over a subtree, e.g. the number of people under each manager, in one statement.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), manager_id INT);
INSERT INTO emp VALUES (1,'CEO',NULL),(2,'CTO',1),(3,'CFO',1),(4,'Dev1',2),(5,'Dev2',2),(6,'Acct',3);

WITH RECURSIVE sub AS (
    SELECT id AS root_id, id AS member_id FROM emp
    UNION ALL
    SELECT s.root_id, e.id FROM sub s JOIN emp e ON e.manager_id = s.member_id
)
SELECT e.name, COUNT(*) - 1 AS total_reports
FROM   sub s JOIN emp e ON e.id = s.root_id
GROUP  BY e.id, e.name
ORDER  BY total_reports DESC, e.name;

-- OUTPUT:
-- +------+---------------+
-- | name | total_reports |
-- +------+---------------+
-- | CEO  |             5 |
-- | CTO  |             2 |
-- | CFO  |             1 |
-- | Acct |             0 |
-- | Dev1 |             0 |
-- | Dev2 |             0 |
-- +------+---------------+`],
        [`<b>Disadvantages:</b> bad data with a cycle (A manages B, B manages A) loops until the recursion limit. Guard by tracking the visited ids in the path.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), manager_id INT);
INSERT INTO emp VALUES (1,'Root',NULL),(7,'X',8),(8,'Y',7);          -- 7 and 8 manage each other

WITH RECURSIVE walk AS (
    SELECT id, name, CAST(id AS CHAR(100)) AS ids FROM emp WHERE id = 7
    UNION ALL
    SELECT e.id, e.name, CONCAT(w.ids, ',', e.id)
    FROM   emp e JOIN walk w ON e.manager_id = w.id
    WHERE  FIND_IN_SET(e.id, w.ids) = 0                              -- stop when already visited
)
SELECT name, ids FROM walk;

-- OUTPUT:
-- +------+------+
-- | name | ids  |
-- +------+------+
-- | X    | 7    |
-- | Y    | 7,8  |
-- +------+------+`],
        [`<b>Limitations:</b> iteration is capped by cte_max_recursion_depth (default 1000), and the recursive part cannot use aggregate or window functions on the CTE itself. Very deep or hot trees may need a closure table.`,
            r`SELECT @@cte_max_recursion_depth AS default_depth;
SET SESSION cte_max_recursion_depth = 5000;
SELECT @@cte_max_recursion_depth AS new_depth;

-- Alternative: closure table, ancestor questions become one indexed join
-- CREATE TABLE emp_closure (ancestor INT, descendant INT, depth INT, PRIMARY KEY (ancestor, descendant));

-- OUTPUT:
-- +---------------+
-- | default_depth |
-- +---------------+
-- |          1000 |
-- +---------------+
-- +-----------+
-- | new_depth |
-- +-----------+
-- |      5000 |
-- +-----------+`],
        `
   CEO (anchor, depth 0)
    +-- CTO  (iteration 1)
    |    +-- Dev1, Dev2   (iteration 2)
    +-- CFO  (iteration 1)
         +-- Acct         (iteration 2)
   Each iteration joins emp.manager_id = previous level's id; stops when no rows.
`,
        `Index manager_id; the recursion is then a series of index lookups. Add a depth limit and cycle guard for untrusted data. For read-heavy hierarchies (permissions, categories) store a materialised path or closure table so reads avoid recursion, and keep recursive CTEs for ad hoc reports.`
    ),

    'Customers Who Never Ordered': dd(
        [`The anti-join: LEFT JOIN customers to orders and keep rows where the order side is NULL, which means no match was found.`,
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE orders    (id INT PRIMARY KEY, customer_id INT);
INSERT INTO customers VALUES (1,'Abaji'),(2,'Raoji'),(3,'Moropant');
INSERT INTO orders    VALUES (1,1),(2,1),(3,3);

SELECT c.id, c.name
FROM   customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE  o.id IS NULL;

-- OUTPUT:
-- +----+-------+
-- | id | name  |
-- +----+-------+
-- |  2 | Raoji |
-- +----+------+`],
        [`NOT EXISTS expresses the same idea directly and is often the clearest, because it says "there is no order for this customer".`,
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE orders    (id INT PRIMARY KEY, customer_id INT);
INSERT INTO customers VALUES (1,'Abaji'),(2,'Raoji'),(3,'Moropant');
INSERT INTO orders    VALUES (1,1),(2,1),(3,3);

SELECT c.name
FROM   customers c
WHERE  NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT:
-- +-------+
-- | name  |
-- +-------+
-- | Raoji |
-- +------+`],
        [`Marketing variation: customers with no order in the last 30 days (win-back campaign). Use a fixed reference date to keep it reproducible.`,
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE orders    (id INT PRIMARY KEY, customer_id INT, created_at DATE);
INSERT INTO customers VALUES (1,'Abaji'),(2,'Raoji'),(3,'Moropant');
INSERT INTO orders    VALUES (1,1,'2024-01-05'),(2,1,'2024-02-20'),(3,3,'2023-12-01');

SELECT c.name
FROM   customers c
WHERE  NOT EXISTS (SELECT 1 FROM orders o
                   WHERE o.customer_id = c.id
                     AND o.created_at >= DATE_SUB('2024-03-01', INTERVAL 30 DAY))
ORDER  BY c.name;

-- OUTPUT:
-- +----------+
-- | name     |
-- +----------+
-- | Moropant |
-- | Raoji    |
-- +-------+`],
        [`<b>Advantages:</b> NOT EXISTS is NULL-safe and the optimiser turns it into an efficient anti-join using the index on orders.customer_id.`,
            r`CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, KEY ix_cust (customer_id));
INSERT INTO orders VALUES (1,1),(2,1);

EXPLAIN SELECT 1 FROM orders o WHERE NOT EXISTS (SELECT 1 FROM orders x WHERE x.customer_id = o.id);

-- OUTPUT: (example, abbreviated)
-- id | table | type | key     | Extra
--  1 | o     | index| PRIMARY | Using index
--  1 | x     | ref  | ix_cust | Using index; Not exists     <- index anti-join`],
        [`<b>Disadvantages:</b> NOT IN is a trap. If the subquery returns even one NULL, the comparison becomes unknown and the whole result is empty.`,
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE orders    (id INT PRIMARY KEY, customer_id INT NULL);
INSERT INTO customers VALUES (1,'Abaji'),(2,'Raoji');
INSERT INTO orders    VALUES (1,1),(2,NULL);                -- guest order with no customer

SELECT name FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);

-- OUTPUT:
-- Empty set (0.00 sec)        <- Raoji is missing! NOT EXISTS would return him`],
        [`<b>Limitations:</b> with LEFT JOIN the filter on the right table must go in ON, not WHERE. A WHERE condition on the right side silently turns the outer join into an inner join.`,
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE orders    (id INT PRIMARY KEY, customer_id INT, status VARCHAR(10));
INSERT INTO customers VALUES (1,'Abaji'),(2,'Raoji');
INSERT INTO orders    VALUES (1,1,'CANCELLED');

-- Customers with no PAID order
SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'PAID'
WHERE  o.id IS NULL ORDER BY c.name;                                  -- correct: condition in ON

SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id
WHERE  o.id IS NULL AND o.status = 'PAID';                            -- wrong: always empty

-- OUTPUT:
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- | Raoji |
-- +-------+
-- Empty set (0.00 sec)`],
        `
   customers               orders
   +----+----------+       +----+-------------+
   | 1  | Abaji    |-----> | 1  | customer 1  |
   | 2  | Raoji    |   X   |    (no match)    |   -> o.id IS NULL  => Raoji
   | 3  | Moropant |-----> | 3  | customer 3  |
   +----+----------+       +----+-------------+
`,
        `Prefer NOT EXISTS (NULL-safe, optimiser-friendly) and index orders.customer_id. Define the business meaning first: never ordered, no paid order, or none recently. For big marketing queries run on a replica or a summary table, not on the primary.`
    ),

    'Most Frequently Purchased Product & Monthly Revenue': dd(
        [`Most purchased: sum quantity per product and take the top. Here Pen leads with 6 units.`,
            r`CREATE TABLE products    (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE orders      (id INT PRIMARY KEY, order_date DATE);
CREATE TABLE order_items (order_id INT, product_id INT, qty INT, price DECIMAL(8,2));
INSERT INTO products VALUES (1,'Pen'),(2,'Book'),(3,'Bag');
INSERT INTO orders   VALUES (1,'2024-01-10'),(2,'2024-01-20'),(3,'2024-02-05'),(4,'2024-02-15');
INSERT INTO order_items VALUES (1,1,3,10),(1,2,1,50),(2,1,2,10),(3,2,2,50),(3,3,1,80),(4,1,1,10);

SELECT p.name, SUM(oi.qty) AS units
FROM   order_items oi JOIN products p ON p.id = oi.product_id
GROUP  BY p.id, p.name
ORDER  BY units DESC
LIMIT  1;

-- OUTPUT:
-- +------+-------+
-- | name | units |
-- +------+-------+
-- | Pen  |     6 |
-- +------+-------+`],
        [`LIMIT 1 hides ties. If two products share the top quantity, use RANK() = 1 to return all of them.`,
            r`CREATE TABLE sold (product VARCHAR(10), units INT);
INSERT INTO sold VALUES ('Pen',6),('Book',6),('Bag',1);

SELECT product, units
FROM  (SELECT product, units, RANK() OVER (ORDER BY units DESC) AS rk FROM sold) t
WHERE  rk = 1
ORDER  BY product;

-- OUTPUT:
-- +---------+-------+
-- | product | units |
-- +---------+-------+
-- | Book    |     6 |
-- | Pen     |     6 |
-- +---------+-------+`],
        [`Monthly revenue is the staple report: group by year-month and sum quantity times the price snapshot.`,
            r`CREATE TABLE orders      (id INT PRIMARY KEY, order_date DATE);
CREATE TABLE order_items (order_id INT, product_id INT, qty INT, price DECIMAL(8,2));
INSERT INTO orders   VALUES (1,'2024-01-10'),(2,'2024-01-20'),(3,'2024-02-05'),(4,'2024-02-15');
INSERT INTO order_items VALUES (1,1,3,10),(1,2,1,50),(2,1,2,10),(3,2,2,50),(3,3,1,80),(4,1,1,10);

SELECT DATE_FORMAT(o.order_date, '%Y-%m') AS month, SUM(oi.qty * oi.price) AS revenue
FROM   orders o JOIN order_items oi ON oi.order_id = o.id
GROUP  BY month
ORDER  BY month;

-- OUTPUT:
-- +---------+---------+
-- | month   | revenue |
-- +---------+---------+
-- | 2024-01 |  100.00 |
-- | 2024-02 |  190.00 |
-- +---------+---------+`],
        [`<b>Advantages:</b> combine both: the best seller of every month with ROW_NUMBER over a partition.`,
            r`CREATE TABLE m (month CHAR(7), product VARCHAR(10), units INT);
INSERT INTO m VALUES ('2024-01','Pen',5),('2024-01','Book',1),
                     ('2024-02','Book',2),('2024-02','Bag',1),('2024-02','Pen',1);

SELECT month, product, units
FROM  (SELECT month, product, units,
              ROW_NUMBER() OVER (PARTITION BY month ORDER BY units DESC, product) AS rn
       FROM m) t
WHERE  rn = 1;

-- OUTPUT:
-- +---------+---------+-------+
-- | month   | product | units |
-- +---------+---------+-------+
-- | 2024-01 | Pen     |     5 |
-- | 2024-02 | Book    |     2 |
-- +---------+---------+-------+`],
        [`<b>Disadvantages:</b> months without sales do not appear at all, which leaves holes in charts. Generate the calendar and LEFT JOIN to fill zeros.`,
            r`CREATE TABLE rev (month DATE, revenue DECIMAL(10,2));
INSERT INTO rev VALUES ('2024-01-01',100),('2024-02-01',190);          -- March has no sales

WITH RECURSIVE cal AS (
    SELECT DATE '2024-01-01' AS month UNION ALL SELECT DATE_ADD(month, INTERVAL 1 MONTH) FROM cal WHERE month < '2024-03-01'
)
SELECT DATE_FORMAT(cal.month, '%Y-%m') AS month, COALESCE(rev.revenue, 0) AS revenue
FROM   cal LEFT JOIN rev ON rev.month = cal.month;

-- OUTPUT:
-- +---------+---------+
-- | month   | revenue |
-- +---------+---------+
-- | 2024-01 |  100.00 |
-- | 2024-02 |  190.00 |
-- | 2024-03 |    0.00 |
-- +---------+---------+`],
        [`<b>Limitations:</b> wrapping the date column in a function (DATE_FORMAT, YEAR) in WHERE prevents index use. Filter on a half-open date range instead.`,
            r`CREATE TABLE orders (id INT PRIMARY KEY, order_date DATE, KEY ix_date (order_date));
INSERT INTO orders VALUES (1,'2024-01-10'),(2,'2024-01-20'),(3,'2024-02-05');

SELECT COUNT(*) AS jan_slow FROM orders WHERE DATE_FORMAT(order_date,'%Y-%m') = '2024-01';   -- full scan
SELECT COUNT(*) AS jan_fast FROM orders
WHERE  order_date >= '2024-01-01' AND order_date < '2024-02-01';                           -- index range

-- OUTPUT:
-- +----------+
-- | jan_slow |
-- +----------+
-- |        2 |
-- +----------+
-- +----------+
-- | jan_fast |
-- +----------+
-- |        2 |
-- +----------+
-- (same answer; EXPLAIN shows type ALL for the first and range for the second)`],
        `
   orders --< order_items >-- products
      |             |
      |  month      |  qty * price
      +--> GROUP BY month --> SUM = revenue
   SUM(qty) GROUP BY product ORDER BY DESC LIMIT 1 --> best seller
`,
        `Report from a pre-aggregated daily or monthly fact table once raw order_items grows into the hundreds of millions. Use half-open date ranges and covering indexes, store revenue snapshots in order_items, and run heavy analytics on a replica or in a warehouse to protect the primary.`
    ),

    'Year-over-Year Growth & Retention Analysis': dd(
        [`Year-over-year growth compares each year with the previous one: (current - previous) / previous. <code>LAG()</code> fetches the previous row.`,
            r`CREATE TABLE yearly (yr INT PRIMARY KEY, revenue DECIMAL(12,2));
INSERT INTO yearly VALUES (2021,1000),(2022,1200),(2023,1500),(2024,1350);

SELECT yr, revenue,
       ROUND(100 * (revenue - LAG(revenue) OVER (ORDER BY yr)) / LAG(revenue) OVER (ORDER BY yr), 2) AS yoy_pct
FROM   yearly;

-- OUTPUT:
-- +------+---------+---------+
-- | yr   | revenue | yoy_pct |
-- +------+---------+---------+
-- | 2021 | 1000.00 |    NULL |
-- | 2022 | 1200.00 |   20.00 |
-- | 2023 | 1500.00 |   25.00 |
-- | 2024 | 1350.00 |  -10.00 |
-- +------+---------+---------+`],
        [`A previous value of zero would divide by zero. In MySQL that gives NULL (with a warning in strict DML), so protect with NULLIF and handle it explicitly.`,
            r`CREATE TABLE yearly (yr INT PRIMARY KEY, revenue DECIMAL(12,2));
INSERT INTO yearly VALUES (2020,0),(2021,1000);

SELECT yr, ROUND(100 * (revenue - LAG(revenue) OVER (ORDER BY yr))
                      / NULLIF(LAG(revenue) OVER (ORDER BY yr), 0), 2) AS yoy_pct
FROM   yearly;

-- OUTPUT:
-- +------+---------+
-- | yr   | yoy_pct |
-- +------+---------+
-- | 2020 |    NULL |
-- | 2021 |    NULL |      <- previous was 0: growth undefined, not an error
-- +------+---------+`],
        [`Retention: of the users who first appeared in a month, how many came back the next month? Cohort = month of first activity.`,
            r`CREATE TABLE activity (user_id INT, m DATE);                  -- m = first day of the active month
INSERT INTO activity VALUES (1,'2024-01-01'),(1,'2024-02-01'),(1,'2024-03-01'),
                            (2,'2024-01-01'),(2,'2024-02-01'),
                            (3,'2024-01-01'),
                            (4,'2024-02-01'),(4,'2024-03-01');

WITH f AS (SELECT user_id, MIN(m) AS cohort FROM activity GROUP BY user_id)
SELECT f.cohort,
       COUNT(DISTINCT f.user_id)                                         AS cohort_size,
       COUNT(DISTINCT a.user_id)                                         AS retained_m1,
       ROUND(100 * COUNT(DISTINCT a.user_id) / COUNT(DISTINCT f.user_id), 2) AS retention_pct
FROM   f LEFT JOIN activity a ON a.user_id = f.user_id AND a.m = DATE_ADD(f.cohort, INTERVAL 1 MONTH)
GROUP  BY f.cohort
ORDER  BY f.cohort;

-- OUTPUT:
-- +------------+-------------+-------------+---------------+
-- | cohort     | cohort_size | retained_m1 | retention_pct |
-- +------------+-------------+-------------+---------------+
-- | 2024-01-01 |           3 |           2 |         66.67 |
-- | 2024-02-01 |           1 |           1 |        100.00 |
-- +------------+-------------+-------------+---------------+`],
        [`<b>Advantages:</b> the same pattern gives the whole retention triangle: count active users at each month offset since the cohort month.`,
            r`CREATE TABLE activity (user_id INT, m DATE);
INSERT INTO activity VALUES (1,'2024-01-01'),(1,'2024-02-01'),(1,'2024-03-01'),
                            (2,'2024-01-01'),(2,'2024-02-01'),(3,'2024-01-01'),
                            (4,'2024-02-01'),(4,'2024-03-01');

WITH f AS (SELECT user_id, MIN(m) AS cohort FROM activity GROUP BY user_id)
SELECT f.cohort, TIMESTAMPDIFF(MONTH, f.cohort, a.m) AS month_offset, COUNT(DISTINCT a.user_id) AS users
FROM   f JOIN activity a ON a.user_id = f.user_id
GROUP  BY f.cohort, month_offset
ORDER  BY f.cohort, month_offset;

-- OUTPUT:
-- +------------+--------------+-------+
-- | cohort     | month_offset | users |
-- +------------+--------------+-------+
-- | 2024-01-01 |            0 |     3 |
-- | 2024-01-01 |            1 |     2 |
-- | 2024-01-01 |            2 |     1 |
-- | 2024-02-01 |            0 |     1 |
-- | 2024-02-01 |            1 |     1 |
-- +------------+--------------+-------+`],
        [`<b>Disadvantages:</b> LAG looks at the previous <i>row</i>, not the previous <i>year</i>. If a year is missing, it compares against the wrong period.`,
            r`CREATE TABLE yearly (yr INT PRIMARY KEY, revenue DECIMAL(12,2));
INSERT INTO yearly VALUES (2021,1000),(2022,1200),(2024,1500);          -- 2023 missing

-- Wrong: 2024 compared with 2022
SELECT yr, LAG(yr) OVER (ORDER BY yr) AS compared_with FROM yearly;

-- Right: join on the exact previous year
SELECT c.yr, ROUND(100 * (c.revenue - p.revenue) / p.revenue, 2) AS yoy_pct
FROM   yearly c LEFT JOIN yearly p ON p.yr = c.yr - 1
ORDER  BY c.yr;

-- OUTPUT:
-- 2021 NULL | 2022 2021 | 2024 2022     (wrong pairing)
-- +------+---------+
-- | yr   | yoy_pct |
-- +------+---------+
-- | 2021 |    NULL |
-- | 2022 |   20.00 |
-- | 2024 |    NULL |
-- +------+---------+`],
        [`<b>Limitations:</b> MySQL division returns a DECIMAL with div_precision_increment extra digits (default 4), and integer division needs DIV. Round explicitly for reports.`,
            r`SELECT 1 / 3        AS ratio,
       10 DIV 3      AS int_div,
       ROUND(1 / 3, 2) AS rounded,
       @@div_precision_increment AS precision_inc;

-- OUTPUT:
-- +--------+---------+---------+---------------+
-- | ratio  | int_div | rounded | precision_inc |
-- +--------+---------+---------+---------------+
-- | 0.3333 |       3 |    0.33 |             4 |
-- +--------+---------+---------+---------------+`],
        `
   Cohort Jan: u1 u2 u3   (3)
   month 0 : u1 u2 u3  = 3   100%
   month 1 : u1 u2     = 2    66.7%
   month 2 : u1        = 1    33.3%
   YoY = (this year - last year) / last year  via LAG or self join on yr - 1
`,
        `Compute cohorts once into a summary table (cohort, offset, users) refreshed daily; do not rescan raw events for every dashboard load. Define active, cohort and period precisely with stakeholders because retention numbers are easy to make misleading. Use a self join or calendar join when periods can be missing.`
    )
};
