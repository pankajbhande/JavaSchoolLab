// Module 11 (Joins), part B: self joins, multi-table joins, join vs subquery.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s11b: Record<string, DeepDive> = {
    'SELF JOIN': dd(
        [`A <b>SELF JOIN</b> joins a table to itself using two different aliases, so one row can be compared with or linked to another row of the same table. It is not a special keyword, just a normal join with the same table twice.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(10), mgr_id INT);
INSERT INTO emp VALUES (1,'Abaji',NULL), (2,'Raoji',1), (3,'Moropant',1), (4,'Jiva',2);

SELECT e.name AS employee, m.name AS manager
FROM emp e                              -- alias e = the employee role
LEFT JOIN emp m ON m.id = e.mgr_id      -- alias m = the manager role (same table)
ORDER BY e.id;

-- OUTPUT:
-- +----------+---------+
-- | employee | manager |
-- +----------+---------+
-- | Abaji    | NULL    |
-- | Raoji    | Abaji   |
-- | Moropant | Abaji   |
-- | Jiva     | Raoji   |
-- +----------+---------+`],
        [`Hierarchies (manager/employee, category/parent) and row-to-row comparisons (pairs, duplicates, consecutive rows) live inside one table. Aliases let SQL treat the table as two roles.`,
            r`-- Pairs of employees reporting to the same manager
SELECT a.name AS emp1, b.name AS emp2
FROM emp a
JOIN emp b ON a.mgr_id = b.mgr_id   -- same manager
        AND a.id < b.id;            -- id order avoids (x,x) and mirrored duplicates

-- OUTPUT:
-- +-------+----------+
-- | emp1  | emp2     |
-- +-------+----------+
-- | Raoji | Moropant |
-- +-------+-------+`],
        [`Org charts, comment threads, bill-of-materials, finding duplicate rows, and "earns more than their manager" reports.`,
            r`CREATE TABLE pay (id INT PRIMARY KEY, name VARCHAR(10), mgr_id INT, salary INT);
INSERT INTO pay VALUES (1,'Abaji',NULL,90000), (2,'Raoji',1,95000), (3,'Moropant',1,60000);

SELECT e.name, e.salary, m.name AS manager, m.salary AS mgr_salary
FROM pay e JOIN pay m ON m.id = e.mgr_id
WHERE e.salary > m.salary;          -- compare a row with its parent row

-- OUTPUT:
-- +-------+--------+---------+------------+
-- | name  | salary | manager | mgr_salary |
-- +-------+--------+---------+------------+
-- | Raoji |  95000 | Abaji   |      90000 |
-- +------+--------+---------+------------+`],
        [`<b>Advantages:</b> no extra tables, expresses one level of hierarchy simply, and works with indexes on the parent key.`,
            r`-- Count direct reports per manager (a self join plus GROUP BY)
SELECT m.name AS manager, COUNT(e.id) AS direct_reports
FROM emp m
LEFT JOIN emp e ON e.mgr_id = m.id
GROUP BY m.id, m.name
ORDER BY m.id;

-- OUTPUT:
-- +----------+----------------+
-- | manager  | direct_reports |
-- +----------+----------------+
-- | Abaji    |              2 |
-- | Raoji    |              1 |
-- | Moropant |              0 |
-- | Jiva     |              0 |
-- +---------+----------------+`],
        [`<b>Disadvantages:</b> each self join walks exactly one level; deeper hierarchies need one join per level or a recursive query, and unindexed self joins are quadratic.`,
            r`-- Three-level chain needs two self joins (grandmanager)
SELECT e.name, m.name AS manager, g.name AS grand_manager
FROM emp e
LEFT JOIN emp m ON m.id = e.mgr_id
LEFT JOIN emp g ON g.id = m.mgr_id
WHERE e.name = 'Jiva';

-- OUTPUT:
-- +------+---------+---------------+
-- | name | manager | grand_manager |
-- +------+---------+---------------+
-- | Jiva | Raoji   | Abaji         |
-- +------+---------+---------------+`],
        [`<b>Limitations:</b> unknown depth cannot be handled by plain joins; use a recursive CTE (MySQL 8) with a depth guard.`,
            r`-- Whole chain of command for Jiva, any depth
WITH RECURSIVE chain AS (
  SELECT id, name, mgr_id, 0 AS lvl FROM emp WHERE name = 'Jiva'   -- anchor
  UNION ALL
  SELECT e.id, e.name, e.mgr_id, c.lvl + 1
  FROM emp e JOIN chain c ON e.id = c.mgr_id                      -- climb one level per round
)
SELECT lvl, name FROM chain ORDER BY lvl;

-- OUTPUT:
-- +-----+-------+
-- | lvl | name  |
-- +-----+-------+
-- |   0 | Jiva  |
-- |   1 | Raoji |
-- |   2 | Abaji |
-- +------+------+`],
        `
   emp as "e" (employee)              emp as "m" (manager)
   +----+-------+--------+          +----+-------+
   | 4  | Jiva  | 2 -----+--------->| 2  | Raoji |
   | 2  | Raoji | 1 -----+--------->| 1  | Abaji |
   +----+-------+--------+          +----+-------+
          same physical table, two aliases
`,
        `Adjacency lists (parent_id) are simple and write-friendly, with recursive CTEs for reads. If subtree queries dominate, consider closure tables or nested sets. Always index the parent column and cap recursion with cte_max_recursion_depth to protect against cycles.`
    ),

    'Multiple Joins & Many-to-Many Joins': dd(
        [`Queries can chain many joins: each <code>JOIN</code> adds a table to the result so far. A <b>many-to-many</b> relationship needs a junction table, so reading it takes two joins (A to junction to B).`,
            r`CREATE TABLE student (id INT PRIMARY KEY, name VARCHAR(10));
CREATE TABLE course  (id INT PRIMARY KEY, title VARCHAR(10));
CREATE TABLE enrollment (student_id INT, course_id INT, PRIMARY KEY (student_id, course_id));
INSERT INTO student VALUES (1,'Abaji'), (2,'Raoji');
INSERT INTO course  VALUES (1,'SQL'), (2,'Java'), (3,'Python');
INSERT INTO enrollment VALUES (1,1), (1,2), (2,1);

SELECT s.name, c.title
FROM student s
JOIN enrollment e ON e.student_id = s.id     -- student -> junction
JOIN course c     ON c.id = e.course_id      -- junction -> course
ORDER BY s.id, c.id;

-- OUTPUT:
-- +-------+-------+
-- | name  | title |
-- +-------+-------+
-- | Abaji | SQL   |
-- | Abaji | Java  |
-- | Raoji | SQL   |
-- +------+-------+`],
        [`A student has many courses and a course has many students, which one table cannot store without repeating or packing data. Splitting it into three tables and joining on demand keeps data atomic.`,
            r`-- Which students take SQL? Filter on the far table
SELECT s.name
FROM course c
JOIN enrollment e ON e.course_id = c.id
JOIN student s    ON s.id = e.student_id
WHERE c.title = 'SQL'
ORDER BY s.name;

-- OUTPUT:
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- | Raoji |
-- +------+`],
        [`Orders-items-products-customers, users-roles-permissions, tags on articles: real reports routinely join four to eight tables.`,
            r`-- Count students per course, including courses with nobody (LEFT JOINs keep them)
SELECT c.title, COUNT(e.student_id) AS students
FROM course c
LEFT JOIN enrollment e ON e.course_id = c.id
GROUP BY c.id, c.title
ORDER BY c.id;

-- OUTPUT:
-- +--------+----------+
-- | title  | students |
-- +--------+----------+
-- | SQL    |        2 |
-- | Java   |        1 |
-- | Python |        0 |
-- +--------+----------+`],
        [`<b>Advantages:</b> flexible reporting from normalised data; the optimiser picks the join order using statistics and indexes, so you write what you want, not how to get it.`,
            r`-- Aggregate across the junction and list the courses as one text value
SELECT s.name, GROUP_CONCAT(c.title ORDER BY c.title SEPARATOR ', ') AS courses
FROM student s
JOIN enrollment e ON e.student_id = s.id
JOIN course c ON c.id = e.course_id
GROUP BY s.id, s.name;

-- OUTPUT:
-- +-------+-----------+
-- | name  | courses   |
-- +-------+-----------+
-- | Abaji | Java, SQL |
-- | Raoji | SQL       |
-- +------+------------+`],
        [`<b>Disadvantages:</b> every extra join multiplies the plan search space and the chance of row fan-out; a single missing key index can make the whole query crawl.`,
            r`-- Fan-out: joining two independent one-to-many children inflates counts
CREATE TABLE phone (student_id INT, num VARCHAR(5));
INSERT INTO phone VALUES (1,'p1'), (1,'p2');

SELECT s.name, COUNT(*) AS rows_returned          -- 2 courses x 2 phones = 4 rows for Abaji
FROM student s
JOIN enrollment e ON e.student_id = s.id
JOIN phone p      ON p.student_id = s.id
GROUP BY s.id, s.name;

-- OUTPUT:
-- +------+---------------+
-- | name | rows_returned |
-- +------+---------------+
-- | Abaji |             4 |    <- not 2 courses or 2 phones; use COUNT(DISTINCT) or pre-aggregate
-- +------+---------------+`],
        [`<b>Limitations:</b> a single join is limited to 61 tables; very wide joins may fall back to a greedy search (<code>optimizer_search_depth</code>) and pick a poor order.`,
            r`SELECT @@optimizer_search_depth AS search_depth;   -- how exhaustively join orders are explored

-- Force a specific order only as a last resort (hint, MySQL 8):
-- SELECT /*+ JOIN_ORDER(s, e, c) */ s.name, c.title
-- FROM student s JOIN enrollment e ON e.student_id = s.id JOIN course c ON c.id = e.course_id;

-- OUTPUT:
-- +--------------+
-- | search_depth |
-- +--------------+
-- |           62 |
-- +--------------+`],
        `
   student             enrollment (junction)          course
   +----+-------+      +------------+-----------+     +----+--------+
   | 1  | Abaji | <--- | student_id | course_id | --> | 1  | SQL    |
   | 2  | Raoji | <--- |     1      |     1     | --> | 2  | Java   |
   +----+-------+      |     1      |     2     |     | 3  | Python |
                       |     2      |     1     |     +----+--------+
                       +------------+-----------+
   one-to-many  +  many-to-one  =  many-to-many
`,
        `Give the junction table a composite primary key (both foreign keys) plus a reverse-order index so both directions are fast. When combining several one-to-many branches, aggregate each branch in a derived table before joining to prevent fan-out.`
    ),

    'Join vs Subquery & Join Performance': dd(
        [`A <b>join</b> combines tables side by side; a <b>subquery</b> nests one query in another. Many questions can be written either way, and the MySQL 8 optimiser often rewrites subqueries into joins (semi-join) so performance is frequently equal.`,
            r`CREATE TABLE customer (id INT PRIMARY KEY, name VARCHAR(10));
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, KEY (customer_id));
INSERT INTO customer VALUES (1,'Abaji'), (2,'Raoji'), (3,'Zoya');
INSERT INTO orders VALUES (10,1), (11,1), (12,2);

-- Customers who ordered: join form (needs DISTINCT because of fan-out)
SELECT DISTINCT c.name FROM customer c JOIN orders o ON o.customer_id = c.id;
-- Subquery form (no duplicates by design)
SELECT c.name FROM customer c WHERE c.id IN (SELECT customer_id FROM orders);

-- OUTPUT (both):
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- | Raoji |
-- +------+`],
        [`You must choose the clearest and fastest form. Joins let you return columns from both tables; subqueries express "exists / not exists / compare to an aggregate" without duplication.`,
            r`-- Need columns from both tables -> join
SELECT c.name, o.id AS order_id FROM customer c JOIN orders o ON o.customer_id = c.id ORDER BY o.id;

-- Need only a yes/no test on the other table -> EXISTS subquery
SELECT c.name FROM customer c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT (first, then second):
-- +-------+----------+
-- | name  | order_id |
-- +-------+----------+
-- | Abaji |       10 |
-- | Abaji |       11 |
-- | Raoji |       12 |
-- +-------+----------+
-- +------+
-- | name |
-- +------+
-- | Zoya |
-- +------+`],
        [`Performance tuning in practice: read the plan with EXPLAIN, index the join keys, shrink inputs early, and test both formulations on real data volumes.`,
            r`EXPLAIN SELECT c.name FROM customer c WHERE c.id IN (SELECT customer_id FROM orders);

-- OUTPUT (example, abbreviated):
-- +----+-------------+-------+--------+--------------------------+
-- | id | select_type | table | type   | Extra                    |
-- +----+-------------+-------+--------+--------------------------+
-- |  1 | SIMPLE      | o     | index  | Using index; LooseScan   |   <- IN became a semi-join
-- |  1 | SIMPLE      | c     | eq_ref | NULL                     |
-- +----+-------------+-------+--------+--------------------------+`],
        [`<b>Advantages of joins:</b> flexible ordering and algorithms (nested loop, hash join in 8.0.18+), all columns available. <b>Of subqueries:</b> readable, no row duplication, natural for aggregates and existence tests.`,
            r`-- Compare against an aggregate: subquery reads naturally
SELECT name, total FROM (
  SELECT c.name, COUNT(*) AS total FROM customer c JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name
) t
WHERE total > (SELECT AVG(cnt) FROM (SELECT COUNT(*) AS cnt FROM orders GROUP BY customer_id) x);

-- OUTPUT:
-- +-------+-------+
-- | name  | total |
-- +-------+-------+
-- | Abaji |     2 |
-- +------+-------+`],
        [`<b>Disadvantages:</b> joins may duplicate rows and need DISTINCT; correlated subqueries can execute once per outer row; derived tables may be materialised into temporary tables.`,
            r`-- Correlated scalar subquery: logically runs once per customer row
SELECT c.name,
       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n   -- needs index on customer_id
FROM customer c;

-- OUTPUT:
-- +-------+---+
-- | name  | n |
-- +-------+---+
-- | Abaji | 2 |
-- | Raoji | 1 |
-- | Zoya  | 0 |
-- +-------+---+
-- Without an index on orders.customer_id this is a full scan per customer (O(n x m)).`],
        [`<b>Limitations:</b> performance depends on data size, indexes, statistics and version; blanket rules such as "joins are always faster" are wrong. Join performance is bound by the join algorithm chosen.`,
            r`-- Without a usable index, MySQL 8.0.18+ uses a hash join instead of block nested loop
EXPLAIN FORMAT=TREE
SELECT c.name FROM customer c JOIN orders o ON o.customer_id + 0 = c.id;   -- expression blocks the index

-- OUTPUT (example, abbreviated):
-- -> Inner hash join (o.customer_id + 0 = c.id)
--     -> Table scan on o
--     -> Hash
--         -> Table scan on c`],
        `
   Query                         Optimizer view
   JOIN  : A --- B ----------->  nested loop / hash join
   IN (subquery) ------------->  semi-join  (LooseScan, FirstMatch, Materialize)
   NOT EXISTS ---------------->  anti-join
   correlated scalar --------->  per-row lookup (needs index!)

   Always: EXPLAIN -> index join keys -> filter early
`,
        `Write the clearest query first, then verify with EXPLAIN ANALYZE on production-sized data. Ensure join columns share type and collation and are indexed; prefer EXISTS or joins for existence tests, avoid NOT IN on nullable columns, and avoid scalar subqueries in SELECT lists over large outer sets.`
    ),
};
