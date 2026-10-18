// Module 12 (Subqueries): scalar, IN, correlated, EXISTS, ANY/ALL.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s12a: Record<string, DeepDive> = {
    'Scalar & Single-Row Subqueries': dd(
        [`A <b>scalar subquery</b> returns exactly one value (one row, one column) and can be used wherever a single value is allowed: in <code>WHERE</code>, <code>SELECT</code> or <code>HAVING</code>. A <b>single-row subquery</b> returns one row and is compared with operators like <code>=</code>, <code>&gt;</code>.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(10), dept VARCHAR(5), salary INT);
INSERT INTO emp VALUES (1,'Abaji','IT',50000), (2,'Raoji','IT',70000),
                       (3,'Moropant','HR',40000), (4,'Jiva','HR',45000), (5,'Zoya','OPS',60000);

SELECT name, salary
FROM emp
WHERE salary > (SELECT AVG(salary) FROM emp);   -- inner query yields one number: 53000

-- OUTPUT:
-- +-------+--------+
-- | name  | salary |
-- +-------+--------+
-- | Raoji | 70000  |
-- | Zoya  |  60000 |
-- +------+--------+`],
        [`You cannot write <code>WHERE salary &gt; AVG(salary)</code> because aggregates are not allowed in WHERE. A scalar subquery computes the aggregate first and hands the result to the outer query.`,
            r`-- Highest paid employee(s): compare with MAX computed by a subquery
SELECT name, salary
FROM emp
WHERE salary = (SELECT MAX(salary) FROM emp);   -- ties would all be returned

-- OUTPUT:
-- +-------+--------+
-- | name  | salary |
-- +-------+--------+
-- | Raoji | 70000  |
-- +------+--------+`],
        [`Show each row next to a global figure (difference from average), find the latest order, or the second highest salary.`,
            r`SELECT name, salary,
       salary - (SELECT AVG(salary) FROM emp) AS diff_from_avg   -- scalar subquery in SELECT list
FROM emp
ORDER BY salary DESC;

-- Second highest salary
SELECT MAX(salary) AS second_highest
FROM emp
WHERE salary < (SELECT MAX(salary) FROM emp);

-- OUTPUT (first query, then second):
-- +----------+--------+---------------+
-- | name     | salary | diff_from_avg |
-- +----------+--------+---------------+
-- | Raoji    |  70000 |    17000.0000 |
-- | Zoya     |  60000 |     7000.0000 |
-- | Abaji    |  50000 |    -3000.0000 |
-- | Jiva     |  45000 |    -8000.0000 |
-- | Moropant | 40000  | -13000.0000   |
-- +----------+--------+---------------+
-- +----------------+
-- | second_highest |
-- +----------------+
-- |          60000 |
-- +----------------+`],
        [`<b>Advantages:</b> uncorrelated scalar subqueries run once and are cached, are easy to read, and avoid a join when you need one global number.`,
            r`-- Percentage of total payroll for each employee
SELECT name,
       ROUND(100 * salary / (SELECT SUM(salary) FROM emp), 1) AS pct_of_payroll
FROM emp
ORDER BY pct_of_payroll DESC
LIMIT 2;

-- OUTPUT:
-- +-------+----------------+
-- | name  | pct_of_payroll |
-- +-------+----------------+
-- | Raoji |           26.4 |
-- | Zoya  |           22.6 |
-- +------+----------------+`],
        [`<b>Disadvantages:</b> if the subquery returns more than one row the query fails; if it returns no rows the value is NULL and the comparison is not true.`,
            r`-- Returns several rows where one is expected:
-- SELECT name FROM emp WHERE salary = (SELECT salary FROM emp WHERE dept = 'IT');
--   ERROR 1242 (21000): Subquery returns more than 1 row

-- Empty result becomes NULL, so nothing matches:
SELECT name FROM emp WHERE salary = (SELECT salary FROM emp WHERE dept = 'NONE');

-- OUTPUT:
-- Empty set (0.00 sec)`],
        [`<b>Limitations:</b> must return exactly one column; scalar subqueries in the SELECT list that are correlated run per row; <code>LIMIT</code> inside <code>IN</code> subqueries is not supported but is fine in scalar ones.`,
            r`-- Force a single row safely with ORDER BY ... LIMIT 1
SELECT name,
       (SELECT d.salary FROM emp d WHERE d.dept = e.dept ORDER BY d.salary DESC LIMIT 1) AS top_in_dept
FROM emp e
WHERE e.id IN (1, 3);

-- OUTPUT:
-- +----------+-------------+
-- | name     | top_in_dept |
-- +----------+-------------+
-- | Abaji    |       70000 |
-- | Moropant |       45000 |
-- +-------+-------------+`],
        `
   outer query                       inner (scalar) query
   SELECT ... WHERE salary > ( SELECT AVG(salary) FROM emp )
                                      |
                                      v   runs once
                                    53000
   outer becomes: WHERE salary > 53000
`,
        `Use scalar subqueries for global constants and lookups; for per-row values prefer a join to a pre-aggregated derived table or a window function (OVER) which scans once. Guard against multi-row errors with MAX/MIN or LIMIT 1 only when the business rule really means "the one".`
    ),

    'Multi-Row Subqueries with IN': dd(
        [`A <b>multi-row subquery</b> returns a list of values (one column, many rows). <code>IN</code> tests whether a value appears in that list; <code>NOT IN</code> tests that it does not.`,
            r`CREATE TABLE dept (id INT PRIMARY KEY, name VARCHAR(10), city VARCHAR(10));
CREATE TABLE emp  (id INT PRIMARY KEY, name VARCHAR(10), dept_id INT);
INSERT INTO dept VALUES (1,'IT','Pune'), (2,'HR','Delhi'), (3,'OPS','Pune');
INSERT INTO emp  VALUES (1,'Abaji',1), (2,'Raoji',2), (3,'Moropant',3), (4,'Jiva',NULL);

SELECT name FROM emp
WHERE dept_id IN (SELECT id FROM dept WHERE city = 'Pune');   -- list: 1, 3

-- OUTPUT:
-- +----------+
-- | name     |
-- +----------+
-- | Abaji    |
-- | Moropant |
-- +-------+`],
        [`Filters often depend on a set computed from another table ("employees in departments located in Pune") that cannot be written as one simple comparison.`,
            r`-- Same question as a join, to show the equivalence
SELECT e.name
FROM emp e JOIN dept d ON d.id = e.dept_id
WHERE d.city = 'Pune';

-- NOT IN: employees outside Pune departments
SELECT name FROM emp
WHERE dept_id NOT IN (SELECT id FROM dept WHERE city = 'Pune');

-- OUTPUT (first, then second):
-- +----------+
-- | name     |
-- +----------+
-- | Abaji    |
-- | Moropant |
-- +----------+
-- +-------+
-- | name  |
-- +-------+
-- | Raoji |
-- +-------+
-- Jiva is excluded from NOT IN: NULL dept_id gives unknown, not true.`],
        [`Customers who bought a product on offer, users in blocked-country lists, orders whose items are low on stock, and data-cleanup deletes.`,
            r`-- Delete users who have no valid order (typical clean-up with IN)
CREATE TABLE orders (id INT PRIMARY KEY, emp_id INT);
INSERT INTO orders VALUES (10,1), (11,1), (12,3);

SELECT name FROM emp WHERE id IN (SELECT emp_id FROM orders);   -- who has orders

-- OUTPUT:
-- +----------+
-- | name     |
-- +----------+
-- | Abaji    |
-- | Moropant |
-- +-------+`],
        [`<b>Advantages:</b> reads like English, duplicates in the subquery do not duplicate outer rows, and MySQL 8 transforms IN into an efficient semi-join.`,
            r`EXPLAIN SELECT name FROM emp WHERE id IN (SELECT emp_id FROM orders);

-- OUTPUT (example, abbreviated):
-- +----+-------------+-------+--------+-----------------------------+
-- | id | select_type | table | type   | Extra                       |
-- +----+-------------+-------+--------+-----------------------------+
-- |  1 | SIMPLE      | orders| ALL    | Start temporary             |
-- |  1 | SIMPLE      | emp   | eq_ref | End temporary               |
-- +----+-------------+-------+--------+-----------------------------+
-- "SIMPLE" with temporary markers shows the semi-join (duplicate weedout) strategy.`],
        [`<b>Disadvantages:</b> NOT IN misbehaves with NULLs; very large IN lists or subqueries may be materialised into temporary tables.`,
            r`-- If the subquery contains a NULL, NOT IN never returns true:
SELECT 'row appears' AS result FROM DUAL
WHERE 5 NOT IN (1, 2, NULL);        -- 5<>1 AND 5<>2 AND 5<>NULL(unknown) = unknown

SELECT 'row appears' AS result FROM DUAL
WHERE 5 NOT IN (1, 2, 3);

-- OUTPUT (first query, then second):
-- Empty set (0.00 sec)
-- +-------------+
-- | result      |
-- +-------------+
-- | row appears |
-- +-------------+`],
        [`<b>Limitations:</b> the subquery must return one column; <code>LIMIT</code> is not allowed in an IN subquery (ERROR 1235) unless wrapped in a derived table; multi-column IN uses row constructors.`,
            r`-- Row constructor: compare two columns at once
SELECT name FROM emp
WHERE (id, dept_id) IN (SELECT emp_id, 1 FROM orders);   -- pairs (1,1), (1,1), (3,1)

-- LIMIT workaround: wrap in a derived table
SELECT name FROM emp
WHERE id IN (SELECT emp_id FROM (SELECT emp_id FROM orders ORDER BY id LIMIT 2) t);

-- OUTPUT (first, then second):
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- +-------+
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- +------+`],
        `
   dept (inner)                 emp (outer)
   WHERE city='Pune'            WHERE dept_id IN ( ... )
   +----+------+
   | 1  | IT   |  --- list {1,3} ---> Abaji(1) yes, Raoji(2) no,
   | 3  | OPS  |                      Moropant(3) yes, Jiva(NULL) no
   +----+------+
`,
        `Prefer EXISTS (or a join) when the subquery column can be NULL and you need negation. Make sure the column used inside IN is indexed on the inner table, and check EXPLAIN to confirm a semi-join rather than a dependent subquery on old versions.`
    ),

    'Correlated Subqueries': dd(
        [`A <b>correlated subquery</b> refers to a column of the outer query, so it is logically re-evaluated for each outer row. It cannot run on its own because it depends on the outer alias.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(10), dept VARCHAR(5), salary INT);
INSERT INTO emp VALUES (1,'Abaji','IT',50000), (2,'Raoji','IT',70000),
                       (3,'Moropant','HR',40000), (4,'Jiva','HR',45000), (5,'Zoya','OPS',60000);

-- Employees earning more than the average of THEIR OWN department
SELECT e.name, e.dept, e.salary
FROM emp e
WHERE e.salary > (SELECT AVG(x.salary) FROM emp x WHERE x.dept = e.dept);   -- e.dept is the correlation

-- OUTPUT:
-- +-------+------+--------+
-- | name  | dept | salary |
-- +-------+------+--------+
-- | Raoji | IT   |  70000 |
-- | Jiva  | HR   |  45000 |
-- +------+------+--------+`],
        [`Some questions are relative to each row's own context (own department, own customer, previous value). A single global subquery cannot express "compare to my group".`,
            r`-- Top earner per department (row has no higher-paid colleague in its dept)
SELECT e.dept, e.name, e.salary
FROM emp e
WHERE e.salary = (SELECT MAX(x.salary) FROM emp x WHERE x.dept = e.dept)
ORDER BY e.dept;

-- OUTPUT:
-- +------+-------+--------+
-- | dept | name  | salary |
-- +------+-------+--------+
-- | HR   | Jiva  |  45000 |
-- | IT   | Raoji |  70000 |
-- | OPS  | Zoya  |  60000 |
-- +------+-------+--------+`],
        [`Latest record per user, running comparisons, "customers whose last order was over 90 days ago", and per-row lookups in reports.`,
            r`-- Number of colleagues in the same department (per-row count)
SELECT e.name,
       (SELECT COUNT(*) FROM emp x WHERE x.dept = e.dept AND x.id <> e.id) AS colleagues
FROM emp e
ORDER BY e.id;

-- OUTPUT:
-- +----------+------------+
-- | name     | colleagues |
-- +----------+------------+
-- | Abaji    |          1 |
-- | Raoji    |          1 |
-- | Moropant |          1 |
-- | Jiva     |          1 |
-- | Zoya     |          0 |
-- +-------+------------+`],
        [`<b>Advantages:</b> expresses per-row logic directly; with an index on the correlated column each probe is a cheap lookup.`,
            r`CREATE INDEX idx_dept ON emp(dept, salary);   -- makes each inner probe an index lookup

EXPLAIN SELECT e.name FROM emp e
WHERE e.salary = (SELECT MAX(x.salary) FROM emp x WHERE x.dept = e.dept);

-- OUTPUT (example, abbreviated):
-- +----+--------------------+-------+------+-----------+
-- | id | select_type        | table | type | key       |
-- +----+--------------------+-------+------+-----------+
-- |  1 | PRIMARY            | e     | ALL  | NULL      |
-- |  2 | DEPENDENT SUBQUERY | x     | ref  | idx_dept  |   <- runs once per outer row
-- +----+--------------------+-------+------+-----------+`],
        [`<b>Disadvantages:</b> can degrade to O(n x m) when the inner side is unindexed; harder to read than a join or window function.`,
            r`-- Same result with a window function: one pass, no per-row subquery
SELECT dept, name, salary
FROM (SELECT dept, name, salary,
             RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rnk
      FROM emp) t
WHERE rnk = 1
ORDER BY dept;

-- OUTPUT:
-- +------+-------+--------+
-- | dept | name  | salary |
-- +------+-------+--------+
-- | HR   | Jiva  |  45000 |
-- | IT   | Raoji | 70000  |
-- | OPS  | Zoya  |  60000 |
-- +------+------+--------+`],
        [`<b>Limitations:</b> MySQL 8 can decorrelate only some patterns; correlation is allowed only to the immediately enclosing queries' columns, and derived tables in FROM cannot reference sibling tables unless <code>LATERAL</code> (8.0.14+) is used.`,
            r`-- LATERAL derived table: top-1 salary per department row, correlated in FROM
SELECT d.dept, t.name, t.salary
FROM (SELECT DISTINCT dept FROM emp) d,
LATERAL (SELECT name, salary FROM emp x WHERE x.dept = d.dept ORDER BY salary DESC LIMIT 1) t
ORDER BY d.dept;

-- OUTPUT:
-- +------+-------+--------+
-- | dept | name  | salary |
-- +------+-------+--------+
-- | HR   | Jiva  |  45000 |
-- | IT   | Raoji | 70000  |
-- | OPS  | Zoya  |  60000 |
-- +------+------+--------+`],
        `
   for each outer row e:             emp e          inner query
     +--------------------+         +---------+    +----------------------+
     | Abaji    IT 50000  ---+--- e.dept='IT' ---->   | AVG(salary) WHERE    |
     | Raoji    IT 70000  ---+--- e.dept='IT' ---->   |   x.dept = e.dept    |
     | Moropant HR 40000  ---+--- e.dept='HR' ---->   +----------------------+
     +--------------------+
   inner query is re-run (logically) per outer row
`,
        `Index the correlation column on the inner table, or rewrite as a join to a grouped derived table or a window function when the outer set is large. Use EXPLAIN to spot DEPENDENT SUBQUERY and measure; for top-N-per-group, window functions or LATERAL are usually best.`
    ),

    'EXISTS Subqueries': dd(
        [`<b>EXISTS</b> returns true if the subquery returns at least one row, otherwise false. What the subquery selects does not matter (convention: <code>SELECT 1</code>); only existence counts.`,
            r`CREATE TABLE customer (id INT PRIMARY KEY, name VARCHAR(10));
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, KEY (customer_id));
INSERT INTO customer VALUES (1,'Abaji'), (2,'Raoji'), (3,'Zoya');
INSERT INTO orders VALUES (10,1), (11,1), (12,2);

SELECT c.name
FROM customer c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);   -- at least one order

-- OUTPUT:
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- | Raoji |
-- +------+`],
        [`Existence checks are the cleanest way to express "has related rows" or "has no related rows" without duplicates and without NULL traps, and it can stop at the first match.`,
            r`SELECT c.name
FROM customer c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);   -- never ordered

-- OUTPUT:
-- +------+
-- | name |
-- +------+
-- | Zoya |
-- +------+`],
        [`Find orphan rows, customers with unpaid invoices, users with a given role, products never sold, and conditional business rules in UPDATE or DELETE.`,
            r`-- Mark customers who ordered (EXISTS inside UPDATE)
ALTER TABLE customer ADD COLUMN active TINYINT DEFAULT 0;
UPDATE customer c SET active = 1
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
SELECT name, active FROM customer;

-- OUTPUT:
-- +-------+--------+
-- | name  | active |
-- +-------+--------+
-- | Abaji |      1 |
-- | Raoji |      1 |
-- | Zoya  |      0 |
-- +------+--------+`],
        [`<b>Advantages:</b> short-circuits on the first match, NULL-safe (unlike NOT IN), no duplicate outer rows, and converted to a semi-join or anti-join by MySQL 8.`,
            r`-- NULL-safe negation: EXISTS is not fooled by NULL customer_id values
INSERT INTO orders VALUES (13, NULL);

SELECT c.name FROM customer c
WHERE c.id NOT IN (SELECT customer_id FROM orders);                     -- returns nothing!

SELECT c.name FROM customer c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);   -- still correct

-- OUTPUT (first query, then second):
-- Empty set (0.00 sec)
-- +------+
-- | name |
-- +------+
-- | Zoya |
-- +------+`],
        [`<b>Disadvantages:</b> without an index on the inner correlated column each probe scans the inner table, and the correlated syntax is more verbose than IN.`,
            r`EXPLAIN SELECT c.name FROM customer c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT (example, abbreviated):
-- +----+-------------+-------+------+---------------+------------------+
-- | id | select_type | table | type | key           | Extra            |
-- +----+-------------+-------+------+---------------+------------------+
-- |  1 | SIMPLE      | c     | ALL  | NULL          | NULL             |
-- |  1 | SIMPLE      | o     | ref  | customer_id   | Using index; FirstMatch(c) |
-- +----+-------------+-------+------+---------------+------------------+`],
        [`<b>Limitations:</b> EXISTS only tests presence, it cannot return the matched values; the SELECT list inside is ignored so errors in it are not raised; it cannot compare counts without extra logic.`,
            r`-- "At least 2 orders" needs aggregation, EXISTS alone cannot count
SELECT c.name FROM customer c
WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) >= 2;

-- EXISTS ignores the select list entirely, so even this does not raise an error:
SELECT EXISTS (SELECT 1/0) AS still_true;   -- 1/0 is never evaluated as a row filter

-- OUTPUT (first query, then second):
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- +-------+
-- +------------+
-- | still_true |
-- +------------+
-- |          1 |
-- +------------+`],
        `
   customer c                       orders o
   +----+-------+      probe        +----+-------------+
   | 1  | Abaji | ---- c.id=1 ----> | 10 | customer 1  |  found -> TRUE (stop)
   | 3  | Zoya  | ---- c.id=3 ----> |    nothing      |  -> FALSE
   +----+-------+                   +----+-------------+
   EXISTS = TRUE/FALSE per outer row; NOT EXISTS = the opposite
`,
        `Default to EXISTS / NOT EXISTS for presence tests, especially negations, and index the inner correlation column (typically a foreign key). Use IN when the subquery is a small independent list and readability matters.`
    ),

    'ANY & ALL Subqueries': dd(
        [`<code>ANY</code> (or <code>SOME</code>) is true if the comparison holds for <i>at least one</i> value of the subquery; <code>ALL</code> is true only if it holds for <i>every</i> value.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(10), dept VARCHAR(5), salary INT);
INSERT INTO emp VALUES (1,'Abaji','IT',50000), (2,'Raoji','IT',70000),
                       (3,'Moropant','HR',40000), (4,'Jiva','HR',45000), (5,'Zoya','OPS',60000);

-- Earns more than SOME HR employee  (i.e. more than the minimum HR salary, 40000)
SELECT name, salary FROM emp
WHERE salary > ANY (SELECT salary FROM emp WHERE dept = 'HR')
ORDER BY salary;

-- OUTPUT:
-- +-------+--------+
-- | name  | salary |
-- +-------+--------+
-- | Jiva  |  45000 |
-- | Abaji | 50000  |
-- | Zoya  |  60000 |
-- | Raoji | 70000  |
-- +------+--------+`],
        [`Comparing with a whole set ("higher than everyone in HR") needs quantifiers. They express MAX/MIN-style logic directly over a list.`,
            r`-- Earns more than ALL HR employees (more than the maximum HR salary, 45000)
SELECT name, salary FROM emp
WHERE salary > ALL (SELECT salary FROM emp WHERE dept = 'HR')
ORDER BY salary;

-- OUTPUT:
-- +-------+--------+
-- | name  | salary |
-- +-------+--------+
-- | Abaji | 50000  |
-- | Zoya  |  60000 |
-- | Raoji | 70000  |
-- +------+--------+`],
        [`Used for threshold rules: "bids above every reserve price", "products cheaper than some competitor offer", and eligibility checks across a set.`,
            r`-- Equivalences worth memorising
--   = ANY  is the same as IN
--   <> ALL is the same as NOT IN
SELECT name FROM emp WHERE dept = ANY (SELECT 'IT')         -- same as IN ('IT')
ORDER BY name;

SELECT name FROM emp WHERE dept <> ALL (SELECT 'IT')        -- same as NOT IN ('IT')
ORDER BY name;

-- OUTPUT (first, then second):
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- | Raoji |
-- +-------+
-- +----------+
-- | name     |
-- +----------+
-- | Jiva     |
-- | Moropant |
-- | Zoya     |
-- +-------+`],
        [`<b>Advantages:</b> declarative set comparison, no need to compute MIN/MAX manually, and it reads close to the business rule.`,
            r`-- Equivalent rewrite with MIN/MAX (often clearer and faster)
SELECT name FROM emp WHERE salary > (SELECT MAX(salary) FROM emp WHERE dept = 'HR') ORDER BY name;   -- same as > ALL
SELECT name FROM emp WHERE salary > (SELECT MIN(salary) FROM emp WHERE dept = 'HR') ORDER BY name;   -- same as > ANY

-- OUTPUT (first, then second):
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- | Raoji |
-- | Zoya  |
-- +-------+
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- | Jiva  |
-- | Raoji |
-- | Zoya  |
-- +------+`],
        [`<b>Disadvantages:</b> rarely used, so many developers misread them; NULL values in the subquery make results unintuitive; MIN/MAX rewrites are usually more explicit.`,
            r`-- ALL over an EMPTY set is TRUE (vacuous truth); ANY over an empty set is FALSE
SELECT COUNT(*) AS all_empty
FROM emp WHERE salary > ALL (SELECT salary FROM emp WHERE dept = 'NONE');   -- every row qualifies

SELECT COUNT(*) AS any_empty
FROM emp WHERE salary > ANY (SELECT salary FROM emp WHERE dept = 'NONE');   -- no row qualifies

-- OUTPUT (first, then second):
-- +-----------+
-- | all_empty |
-- +-----------+
-- |         5 |
-- +-----------+
-- +-----------+
-- | any_empty |
-- +-----------+
-- |         0 |
-- +-----------+`],
        [`<b>Limitations:</b> the subquery must return a single column; a NULL in the subquery makes <code>ALL</code> yield unknown (no rows) unless a definite false occurs; they are not supported with a list literal, only a subquery.`,
            r`-- A NULL in the set breaks "> ALL" for rows that are greater than every non-NULL value
CREATE TABLE bonus (amt INT);
INSERT INTO bonus VALUES (10), (NULL);

SELECT COUNT(*) AS rows_matching
FROM emp WHERE salary > ALL (SELECT amt FROM bonus);    -- 50000 > 10 true, 50000 > NULL unknown

-- OUTPUT:
-- +---------------+
-- | rows_matching |
-- +---------------+
-- |             0 |
-- +---------------+`],
        `
   salary > ANY (40000, 45000)        salary > ALL (40000, 45000)
   ==  salary > MIN  (40000)          ==  salary > MAX  (45000)

   value:     39000  42000  47000
   > ANY :      no     yes    yes
   > ALL :      no      no    yes
`,
        `Prefer explicit MIN/MAX (with NULL handling) or EXISTS in production code, since ANY/ALL semantics with NULLs and empty sets surprise people. Keep them for places where they make a business rule read naturally, and always test the empty-set case.`
    ),
};

