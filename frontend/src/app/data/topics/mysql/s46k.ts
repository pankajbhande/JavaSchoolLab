// Module 46 (Advanced SQL Interview Problems), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s46k: Record<string, DeepDive> = {
    'Second & Nth Highest Salary Problems': dd(
        [`Classic question: return the Nth highest <b>distinct</b> salary. The cleanest MySQL 8 answer ranks salaries with <code>DENSE_RANK()</code>, which gives tied salaries the same rank and no gaps.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT);
INSERT INTO emp VALUES (1,'A',5000),(2,'B',7000),(3,'C',7000),(4,'D',6000),(5,'E',4000);

-- 2nd highest salary (change 2 to N for any rank)
SELECT DISTINCT salary AS second_highest
FROM  (SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM emp) t
WHERE  rnk = 2;

-- OUTPUT:
-- +----------------+
-- | second_highest |
-- +----------------+
-- |           6000 |
-- +----------------+`],
        [`Why not ROW_NUMBER or a plain LIMIT 1 OFFSET 1? With ties (two people at 7000) they return the second <i>row</i>, which is still 7000, not the second distinct salary.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, salary INT);
INSERT INTO emp VALUES (1,5000),(2,7000),(3,7000),(4,6000),(5,4000);

SELECT salary AS wrong_second FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1;          -- second row
SELECT DISTINCT salary AS right_second FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1; -- second value

-- OUTPUT:
-- +--------------+
-- | wrong_second |
-- +--------------+
-- |         7000 |
-- +--------------+
-- +--------------+
-- | right_second |
-- +--------------+
-- |         6000 |
-- +--------------+`],
        [`Interviews often ask for a reusable function <code>getNthHighestSalary(N)</code> that returns NULL when N is too large.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, salary INT);
INSERT INTO emp VALUES (1,5000),(2,7000),(3,7000),(4,6000),(5,4000);

DELIMITER //
CREATE FUNCTION getNthHighest(n INT) RETURNS INT READS SQL DATA
BEGIN
    DECLARE m INT DEFAULT n - 1;             -- LIMIT accepts a local variable inside routines
    RETURN (SELECT DISTINCT salary FROM emp ORDER BY salary DESC LIMIT 1 OFFSET m);
END//
DELIMITER ;

SELECT getNthHighest(3) AS third, getNthHighest(10) AS tenth;

-- OUTPUT:
-- +-------+-------+
-- | third | tenth |
-- +-------+-------+
-- |  5000 |  NULL |
-- +-------+-------+`],
        [`<b>Advantages of the subquery form:</b> it works on any MySQL version, including 5.7 without window functions. The 2nd highest is the maximum of everything below the maximum.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, salary INT);
INSERT INTO emp VALUES (1,5000),(2,7000),(3,7000),(4,6000);

SELECT MAX(salary) AS second_highest
FROM   emp
WHERE  salary < (SELECT MAX(salary) FROM emp);       -- NULL automatically if there is no second value

-- OUTPUT:
-- +----------------+
-- | second_highest |
-- +----------------+
-- |           6000 |
-- +----------------+`],
        [`<b>Disadvantages:</b> the generic correlated form (count how many distinct salaries are higher) is O(n squared): every row runs a subquery.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, salary INT);
INSERT INTO emp VALUES (1,5000),(2,7000),(3,7000),(4,6000),(5,4000);

SELECT DISTINCT e1.salary AS third_highest
FROM   emp e1
WHERE  (SELECT COUNT(DISTINCT e2.salary) FROM emp e2 WHERE e2.salary > e1.salary) = 2;

-- OUTPUT:
-- +---------------+
-- | third_highest |
-- +---------------+
-- |          5000 |
-- +---------------+`],
        [`<b>Limitations:</b> NULL salaries must be excluded, otherwise they can take a rank. Per-department Nth highest needs PARTITION BY (see the next topics).`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, salary INT);
INSERT INTO emp VALUES (1,5000),(2,7000),(3,NULL),(4,6000);

SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
FROM   emp
WHERE  salary IS NOT NULL;                    -- remove NULLs before ranking

-- OUTPUT:
-- +--------+-----+
-- | salary | rnk |
-- +--------+-----+
-- |   7000 |   1 |
-- |   6000 |   2 |
-- |   5000 |   3 |
-- +--------+-----+`],
        `
   salary : 7000 7000 6000 5000 4000
   ROW_NUMBER: 1    2    3    4    5     (arbitrary on ties)
   RANK      : 1    1    3    4    5     (gap after ties)
   DENSE_RANK: 1    1    2    3    4     <- use this for "Nth highest"
`,
        `State the tie semantics first (distinct value or Nth row) because it decides the function. DENSE_RANK scans and sorts the table once, which is fine; an index on salary lets LIMIT/OFFSET stop early. For Nth highest per group on big tables, index (dept, salary) and rank per partition.`
    ),

    'Find & Remove Duplicate Records': dd(
        [`Find duplicates by grouping on the columns that must be unique and keeping groups with more than one row.`,
            r`CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(40));
INSERT INTO users VALUES (1,'a@x.com'),(2,'b@x.com'),(3,'a@x.com'),(4,'a@x.com'),(5,'c@x.com');

SELECT email, COUNT(*) AS copies
FROM   users
GROUP  BY email
HAVING COUNT(*) > 1;

-- OUTPUT:
-- +---------+--------+
-- | email   | copies |
-- +---------+--------+
-- | a@x.com |      3 |
-- +---------+--------+`],
        [`To delete safely you first need to decide <i>which</i> copy to keep. ROW_NUMBER numbers the copies per email; every number above 1 is a surplus row.`,
            r`CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(40));
INSERT INTO users VALUES (1,'a@x.com'),(2,'b@x.com'),(3,'a@x.com'),(4,'a@x.com'),(5,'c@x.com');

SELECT id, email
FROM  (SELECT id, email,
              ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn   -- keep the lowest id
       FROM users) t
WHERE  rn > 1;

-- OUTPUT:
-- +----+---------+
-- | id | email   |
-- +----+---------+
-- |  3 | a@x.com |
-- |  4 | a@x.com |
-- +----+---------+`],
        [`The delete itself: a multi-table DELETE with a self join removes every row that has a lower-id twin.`,
            r`CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(40));
INSERT INTO users VALUES (1,'a@x.com'),(2,'b@x.com'),(3,'a@x.com'),(4,'a@x.com'),(5,'c@x.com');

DELETE u1
FROM   users u1
JOIN   users u2 ON u2.email = u1.email AND u2.id < u1.id;

SELECT * FROM users ORDER BY id;

-- OUTPUT:
-- Query OK, 2 rows affected
-- +----+---------+
-- | id | email   |
-- +----+---------+
-- |  1 | a@x.com |
-- |  2 | b@x.com |
-- |  5 | c@x.com |
-- +----+---------+`],
        [`<b>Advantages:</b> once cleaned, a UNIQUE key makes duplicates impossible forever, which is the real fix.`,
            r`CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(40));
INSERT INTO users VALUES (1,'a@x.com'),(2,'b@x.com');

ALTER TABLE users ADD UNIQUE KEY uq_email (email);
INSERT INTO users VALUES (3,'a@x.com');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'a@x.com' for key 'users.uq_email'`],
        [`<b>Disadvantages:</b> "same" is not always byte-equal. The default collation utf8mb4_0900_ai_ci ignores case but NOT trailing spaces, so a dirty copy hides from GROUP BY until you normalise it.`,
            r`CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(40));
INSERT INTO users VALUES (1,'a@x.com'),(2,'A@X.COM'),(3,'a@x.com ');

SELECT TRIM(LOWER(email)) AS norm, COUNT(*) AS copies   -- TRIM fixes the space case
FROM   users
GROUP  BY TRIM(LOWER(email));

-- OUTPUT:
-- +---------+--------+
-- | norm    | copies |
-- +---------+--------+
-- | a@x.com |      3 |
-- +---------+--------+`],
        [`<b>Limitations:</b> adding a UNIQUE key fails while duplicates exist, and one giant DELETE on a big table creates a huge transaction. Delete in batches.`,
            r`CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(40));
INSERT INTO users VALUES (1,'a@x.com'),(2,'a@x.com');

ALTER TABLE users ADD UNIQUE KEY uq_email (email);       -- dupes exist => fails

-- Batch pattern: collect ids to remove, then delete 1000 at a time (single-table form allows LIMIT)
-- DELETE FROM users WHERE id IN (SELECT id FROM dup_ids) LIMIT 1000;   -- repeat until 0 rows

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'a@x.com' for key 'users.uq_email'`],
        `
   id  email            ROW_NUMBER() OVER (PARTITION BY email ORDER BY id)
   1   a@x.com     ->   1   keep
   3   a@x.com     ->   2   delete
   4   a@x.com     ->   3   delete
   2   b@x.com     ->   1   keep
`,
        `Always SELECT the doomed rows first and back up the table (CREATE TABLE users_bak AS SELECT ...). Prefer preventing duplicates with UNIQUE keys and INSERT ... ON DUPLICATE KEY UPDATE. On large tables delete in small batches to avoid long locks and replication lag.`
    ),

    'Employees Earning More Than Their Manager': dd(
        [`A self join treats the same table as two roles: employee (e) and manager (m), linked by manager_id. Then compare their salaries.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT, manager_id INT);
INSERT INTO emp VALUES (1,'Boss',9000,NULL),(2,'Ann',9500,1),(3,'Baji',7000,1),(4,'Cy',7500,3),(5,'Di',6000,3);

SELECT e.name AS employee
FROM   emp e
JOIN   emp m ON m.id = e.manager_id
WHERE  e.salary > m.salary
ORDER  BY e.name;

-- OUTPUT:
-- +----------+
-- | employee |
-- +----------+
-- | Ann      |
-- | Cy       |
-- +----------+`],
        [`The same result with a correlated subquery. Interviewers like seeing both because the join is usually faster and easier to extend.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT, manager_id INT);
INSERT INTO emp VALUES (1,'Boss',9000,NULL),(2,'Ann',9500,1),(3,'Baji',7000,1),(4,'Cy',7500,3),(5,'Di',6000,3);

SELECT e.name
FROM   emp e
WHERE  e.salary > (SELECT m.salary FROM emp m WHERE m.id = e.manager_id)
ORDER  BY e.name;

-- OUTPUT:
-- +------+
-- | name |
-- +------+
-- | Ann  |
-- | Cy   |
-- +------+`],
        [`Reports usually also show the manager and the gap, which the join form gives for free.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT, manager_id INT);
INSERT INTO emp VALUES (1,'Boss',9000,NULL),(2,'Ann',9500,1),(3,'Baji',7000,1),(4,'Cy',7500,3),(5,'Di',6000,3);

SELECT e.name AS employee, m.name AS manager, e.salary - m.salary AS gap
FROM   emp e JOIN emp m ON m.id = e.manager_id
WHERE  e.salary > m.salary
ORDER  BY gap DESC;

-- OUTPUT:
-- +----------+---------+-----+
-- | employee | manager | gap |
-- +----------+---------+-----+
-- | Ann      | Boss    | 500 |
-- | Cy       | Baji    | 500 |
-- +----------+---------+------+`],
        [`<b>Advantages:</b> an index on manager_id (and the primary key on id) makes the join a fast key lookup per employee.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT, manager_id INT, KEY ix_mgr (manager_id));
INSERT INTO emp VALUES (1,'Boss',9000,NULL),(2,'Ann',9500,1);

EXPLAIN SELECT e.name FROM emp e JOIN emp m ON m.id = e.manager_id WHERE e.salary > m.salary;

-- OUTPUT: (example, abbreviated)
-- id | table | type   | key     | rows
--  1 | e     | ALL    | NULL    |    2
--  1 | m     | eq_ref | PRIMARY |    1      <- one primary-key lookup per employee`],
        [`<b>Disadvantages:</b> the top boss has manager_id NULL, so an INNER JOIN drops him. That is right here, but wrong if you must list everyone with a flag.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT, manager_id INT);
INSERT INTO emp VALUES (1,'Boss',9000,NULL),(2,'Ann',9500,1),(3,'Baji',7000,1);

SELECT e.name, m.name AS manager, (e.salary > m.salary) AS earns_more   -- NULL when no manager
FROM   emp e LEFT JOIN emp m ON m.id = e.manager_id
ORDER  BY e.id;

-- OUTPUT:
-- +------+---------+------------+
-- | name | manager | earns_more |
-- +------+---------+------------+
-- | Boss | NULL    |       NULL |
-- | Ann  | Boss    |          1 |
-- | Baji | Boss    |          0 |
-- +------+---------+------------+`],
        [`<b>Limitations:</b> a join only sees the direct manager. To compare with <i>any</i> ancestor you need a recursive CTE.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT, manager_id INT);
INSERT INTO emp VALUES (1,'Boss',9000,NULL),(2,'Ann',9500,1),(3,'Baji',7000,1),(4,'Cy',7500,3),(5,'Di',6000,3);

WITH RECURSIVE anc AS (
    SELECT id, manager_id AS anc_id FROM emp WHERE manager_id IS NOT NULL
    UNION ALL
    SELECT a.id, e.manager_id FROM anc a JOIN emp e ON e.id = a.anc_id WHERE e.manager_id IS NOT NULL
)
SELECT e.name, m.name AS ancestor
FROM   anc a JOIN emp e ON e.id = a.id JOIN emp m ON m.id = a.anc_id
WHERE  e.salary > m.salary
ORDER  BY e.name, m.name;

-- OUTPUT:
-- +------+----------+
-- | name | ancestor |
-- +------+----------+
-- | Ann  | Boss     |
-- | Cy   | Baji     |
-- +------+----------+`],
        `
          Boss 9000
          /        \
    Ann 9500 *    Baji 7000
                   /     \
             Cy 7500 *   Di 6000        * = earns more than direct manager
   e.manager_id ----> m.id   (same table, two aliases)
`,
        `Model the hierarchy with an indexed manager_id; for deep or frequently queried trees consider a closure table or materialised path so ancestor questions become plain joins. Remember that self-referencing foreign keys allow cycles unless the application prevents them.`
    ),

    'Department-wise Highest Salary & Top 3 per Department': dd(
        [`The highest salary per department: aggregate in a subquery, then join back to find who earns it (ties return every top earner).`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Ann','Eng',9000),(2,'Baji','Eng',8000),(3,'Cy','Eng',8000),(4,'Di','Eng',7000),
                       (5,'Ed','Eng',6000),(6,'Fay','Sales',5000),(7,'Gus','Sales',4000);

SELECT e.dept, e.name, e.salary
FROM   emp e
JOIN  (SELECT dept, MAX(salary) AS mx FROM emp GROUP BY dept) m
       ON m.dept = e.dept AND m.mx = e.salary
ORDER  BY e.dept;

-- OUTPUT:
-- +-------+------+--------+
-- | dept  | name | salary |
-- +-------+------+--------+
-- | Eng   | Ann  |   9000 |
-- | Sales | Fay  |   5000 |
-- +-------+------+--------+`],
        [`Top 3 per department needs ranking inside each group. <code>DENSE_RANK() OVER (PARTITION BY dept ...)</code> restarts the numbering for every department.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Ann','Eng',9000),(2,'Baji','Eng',8000),(3,'Cy','Eng',8000),(4,'Di','Eng',7000),
                       (5,'Ed','Eng',6000),(6,'Fay','Sales',5000),(7,'Gus','Sales',4000);

SELECT dept, name, salary, rnk
FROM  (SELECT dept, name, salary,
              DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
       FROM emp) t
WHERE  rnk <= 3
ORDER  BY dept, rnk, name;

-- OUTPUT:
-- +-------+------+--------+-----+
-- | dept  | name | salary | rnk |
-- +-------+------+--------+-----+
-- | Eng   | Ann  |   9000 |   1 |
-- | Eng   | Baji |   8000 |   2 |
-- | Eng   | Cy   |   8000 |   2 |
-- | Eng   | Di   |   7000 |   3 |
-- | Sales | Fay  |   5000 |   1 |
-- | Sales | Gus  |   4000 |   2 |
-- +-------+------+--------+-----+`],
        [`If the business wants exactly three people per department (not three salary levels), use ROW_NUMBER with a tie-breaker.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Ann','Eng',9000),(2,'Baji','Eng',8000),(3,'Cy','Eng',8000),(4,'Di','Eng',7000),
                       (6,'Fay','Sales',5000),(7,'Gus','Sales',4000);

SELECT dept, name, salary
FROM  (SELECT dept, name, salary,
              ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC, id) AS rn   -- id breaks ties
       FROM emp) t
WHERE  rn <= 3
ORDER  BY dept, rn;

-- OUTPUT:
-- +-------+------+--------+
-- | dept  | name | salary |
-- +-------+------+--------+
-- | Eng   | Ann  |   9000 |
-- | Eng   | Baji |   8000 |
-- | Eng   | Cy   |   8000 |
-- | Sales | Fay  |   5000 |
-- | Sales | Gus  |   4000 |
-- +-------+------+--------+`],
        [`<b>Advantages:</b> window functions keep the detail rows while adding group facts, e.g. each person next to the department maximum.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Ann','Eng',9000),(2,'Baji','Eng',8000),(6,'Fay','Sales',5000),(7,'Gus','Sales',4000);

SELECT name, dept, salary,
       MAX(salary) OVER (PARTITION BY dept)          AS dept_max,
       MAX(salary) OVER (PARTITION BY dept) - salary AS below_top
FROM   emp ORDER BY id;

-- OUTPUT:
-- +------+-------+--------+----------+-----------+
-- | name | dept  | salary | dept_max | below_top |
-- +------+-------+--------+----------+-----------+
-- | Ann  | Eng   |   9000 |     9000 |         0 |
-- | Baji | Eng   |   8000 |     9000 |      1000 |
-- | Fay  | Sales |   5000 |     5000 |         0 |
-- | Gus  | Sales |   4000 |     5000 |      1000 |
-- +------+-------+--------+----------+-----------+`],
        [`<b>Disadvantages:</b> the three ranking functions disagree on ties; picking the wrong one silently returns the wrong number of rows.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT);
INSERT INTO emp VALUES (1,'Ann',9000),(2,'Baji',8000),(3,'Cy',8000),(4,'Di',7000);

SELECT name, salary,
       ROW_NUMBER() OVER w AS rn, RANK() OVER w AS rk, DENSE_RANK() OVER w AS drk
FROM   emp
WINDOW w AS (ORDER BY salary DESC);

-- OUTPUT: (example: which tied row gets rn 2 or 3 is not guaranteed)
-- +------+--------+----+----+-----+
-- | name | salary | rn | rk | drk |
-- +------+--------+----+----+-----+
-- | Ann  |   9000 |  1 |  1 |   1 |
-- | Baji |   8000 |  2 |  2 |   2 |
-- | Cy   |   8000 |  3 |  2 |   2 |
-- | Di   |   7000 |  4 |  4 |   3 |
-- +------+--------+----+----+-----+`],
        [`<b>Limitations:</b> window functions cannot be used directly in WHERE. Wrap the ranking in a derived table or CTE and filter outside.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Eng',9000),(2,'Eng',8000);

SELECT * FROM emp WHERE RANK() OVER (PARTITION BY dept ORDER BY salary DESC) = 1;   -- not allowed

-- FIX
WITH r AS (SELECT *, RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rk FROM emp)
SELECT id, dept, salary FROM r WHERE rk = 1;

-- OUTPUT:
-- ERROR 3593 (HY000): You cannot use the window function 'rank' in this context.
-- +----+------+--------+
-- | id | dept | salary |
-- +----+------+--------+
-- |  1 | Eng  |   9000 |
-- +----+------+--------+`],
        `
   Eng  : Ann 9000 | Baji 8000 | Cy 8000 | Di 7000 | Ed 6000
   PARTITION BY dept  (separate window per department)
          DENSE_RANK:  1        2         2         3         4
          keep rnk<=3 ---------------------------^  (Ed dropped)
   Sales: Fay 5000 | Gus 4000   ->  ranks restart at 1
`,
        `Pick the function from the business rule (levels vs people). An index on (dept, salary DESC) lets MySQL read each partition in order and avoid a big filesort. For huge tables, a LATERAL join per department or a pre-aggregated table can beat a full-table window.`
    ),

    'Running Total & Moving Average Problems': dd(
        [`A running total is a window <code>SUM()</code> over an ordered frame from the first row to the current row.`,
            r`CREATE TABLE sales (day DATE PRIMARY KEY, amount INT);
INSERT INTO sales VALUES ('2024-01-01',100),('2024-01-02',200),('2024-01-03',150),('2024-01-04',300),('2024-01-05',250);

SELECT day, amount,
       SUM(amount) OVER (ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM   sales;

-- OUTPUT:
-- +------------+--------+---------------+
-- | day        | amount | running_total |
-- +------------+--------+---------------+
-- | 2024-01-01 |    100 |           100 |
-- | 2024-01-02 |    200 |           300 |
-- | 2024-01-03 |    150 |           450 |
-- | 2024-01-04 |    300 |           750 |
-- | 2024-01-05 |    250 |          1000 |
-- +------------+--------+---------------+`],
        [`Before window functions the same result needed a self join that sums all earlier rows. It still appears in interviews and in MySQL 5.7 systems, but it re-reads rows many times.`,
            r`CREATE TABLE sales (day DATE PRIMARY KEY, amount INT);
INSERT INTO sales VALUES ('2024-01-01',100),('2024-01-02',200),('2024-01-03',150);

SELECT a.day, SUM(b.amount) AS running_total
FROM   sales a JOIN sales b ON b.day <= a.day
GROUP  BY a.day
ORDER  BY a.day;

-- OUTPUT:
-- +------------+---------------+
-- | day        | running_total |
-- +------------+---------------+
-- | 2024-01-01 |           100 |
-- | 2024-01-02 |           300 |
-- | 2024-01-03 |           450 |
-- +------------+---------------+`],
        [`A 3-day moving average smooths noisy daily numbers (dashboards, trend lines): average the current row and the two before it.`,
            r`CREATE TABLE sales (day DATE PRIMARY KEY, amount INT);
INSERT INTO sales VALUES ('2024-01-01',100),('2024-01-02',200),('2024-01-03',150),('2024-01-04',300),('2024-01-05',250);

SELECT day, amount,
       AVG(amount) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg_3
FROM   sales;

-- OUTPUT:
-- +------------+--------+---------------+
-- | day        | amount | moving_avg_3  |
-- +------------+--------+---------------+
-- | 2024-01-01 |    100 |      100.0000 |
-- | 2024-01-02 |    200 |      150.0000 |
-- | 2024-01-03 |    150 |      150.0000 |
-- | 2024-01-04 |    300 |      216.6667 |
-- | 2024-01-05 |    250 |      233.3333 |
-- +------------+--------+---------------+`],
        [`<b>Advantages:</b> PARTITION BY gives a separate running total per group, e.g. per store, in one pass.`,
            r`CREATE TABLE sales (store CHAR(1), day DATE, amount INT);
INSERT INTO sales VALUES ('A','2024-01-01',10),('A','2024-01-02',20),('B','2024-01-01',5),('B','2024-01-02',7);

SELECT store, day, amount,
       SUM(amount) OVER (PARTITION BY store ORDER BY day) AS store_running
FROM   sales
ORDER  BY store, day;

-- OUTPUT:
-- +-------+------------+--------+---------------+
-- | store | day        | amount | store_running |
-- +-------+------------+--------+---------------+
-- | A     | 2024-01-01 |     10 |            10 |
-- | A     | 2024-01-02 |     20 |            30 |
-- | B     | 2024-01-01 |      5 |             5 |
-- | B     | 2024-01-02 |      7 |            12 |
-- +-------+------------+--------+---------------+`],
        [`<b>Disadvantages:</b> the default frame is RANGE, not ROWS. Rows with the same ORDER BY value are treated as peers and share one total, which surprises people.`,
            r`CREATE TABLE sales (id INT PRIMARY KEY, day DATE, amount INT);
INSERT INTO sales VALUES (1,'2024-01-01',100),(2,'2024-01-01',100),(3,'2024-01-02',50);

SELECT id, amount,
       SUM(amount) OVER (ORDER BY day)                                  AS default_range,
       SUM(amount) OVER (ORDER BY day, id ROWS UNBOUNDED PRECEDING)     AS rows_frame
FROM   sales;

-- OUTPUT:
-- +----+--------+---------------+------------+
-- | id | amount | default_range | rows_frame |
-- +----+--------+---------------+------------+
-- |  1 |    100 |           200 |        100 |
-- |  2 |    100 |           200 |        200 |
-- |  3 |     50 |           250 |        250 |
-- +----+--------+---------------+------------+`],
        [`<b>Limitations:</b> a ROWS frame counts rows, not days. With missing dates, "3 rows" spans more than 3 days. Use a RANGE frame with an INTERVAL to get a true calendar window.`,
            r`CREATE TABLE sales (day DATE PRIMARY KEY, amount INT);
INSERT INTO sales VALUES ('2024-01-01',100),('2024-01-02',200),('2024-01-05',300);

SELECT day, amount,
       AVG(amount) OVER (ORDER BY day ROWS  BETWEEN 2 PRECEDING AND CURRENT ROW)             AS by_rows,
       AVG(amount) OVER (ORDER BY day RANGE BETWEEN INTERVAL 2 DAY PRECEDING AND CURRENT ROW) AS by_days
FROM   sales;

-- OUTPUT:
-- +------------+--------+----------+----------+
-- | day        | amount | by_rows  | by_days  |
-- +------------+--------+----------+----------+
-- | 2024-01-01 |    100 | 100.0000 | 100.0000 |
-- | 2024-01-02 |    200 | 150.0000 | 150.0000 |
-- | 2024-01-05 |    300 | 200.0000 | 300.0000 |
-- +------------+--------+----------+----------+`],
        `
   amount :  100   200   150   300   250
   running: 100   300   450   750  1000      frame = [first .. current]
   moving3:                                  frame = [cur-2 .. cur]
   row 4  :        [200   150   300] -> 216.67
   row 5  :              [150   300   250] -> 233.33
`,
        `Window functions need a sort, so index the ORDER BY (and PARTITION BY) columns. Prefer pre-aggregated daily tables for dashboards instead of windowing raw events. Always specify the frame explicitly (ROWS or RANGE) so behaviour is obvious to the next reader.`
    )
};
