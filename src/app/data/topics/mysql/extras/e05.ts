// Modules 11-13 (Joins, Subqueries, Set Operations) extras.
import { x, r, type Extra } from './extra';

export const e05: Record<string, Extra> = {
    'INNER JOIN': x(
        ['INNER JOIN returns only rows that have a match in both tables.',
            'Syntax: <code>FROM a INNER JOIN b ON a.id = b.a_id</code>. <code>JOIN</code> alone means INNER JOIN.',
            'Rows without a partner are dropped from the result.'],
        ['Use table aliases (<code>e</code>, <code>d</code>) and qualify columns to avoid ambiguity.',
            'Always index the join column on the child side (foreign key).',
            'Put row filters in WHERE; for INNER JOIN, conditions in ON or WHERE give the same result.'],
        ['The optimizer chooses the join order from statistics; stale statistics produce bad plans, so run <code>ANALYZE TABLE</code> after bulk loads.',
            'A missing join condition creates a Cartesian product; guard with code review and EXPLAIN row estimates.',
            'Joining on mismatched types or collations disables indexes.'],
        [['F', 'What does INNER JOIN return?', 'Only rows where the join condition matches in both tables.'],
            ['F', 'Is JOIN the same as INNER JOIN?', 'Yes, in MySQL.'],
            ['M', 'What happens if you forget the ON condition?', 'You get a Cartesian product (every row of A with every row of B) or a syntax error depending on form.'],
            ['M', 'Which columns should be indexed for a join?', 'The join columns, especially the foreign key column in the child table.'],
            ['S', 'Why can a join suddenly become slow?', 'Statistics drift, data skew, a plan change, missing/unused index due to type or collation mismatch, or a table grew.'],
            ['S', 'How do you diagnose a slow join?', 'EXPLAIN ANALYZE to see actual rows per step, check access types and join order, then adjust indexes or rewrite.']],
        [['Employees with department names.',
            r`CREATE TABLE departments (id INT PRIMARY KEY, name VARCHAR(20));
INSERT INTO departments VALUES (10,'HR'),(20,'IT'),(30,'Sales');
SELECT e.name AS employee, d.name AS department FROM emp e INNER JOIN departments d ON d.id = e.dept;

-- OUTPUT:
-- employee | department
-- Asha     | HR
-- Ravi     | HR
-- Meena    | IT`],
            ['Count employees per department with a join and group.',
                r`SELECT d.name, COUNT(*) AS n FROM emp e JOIN departments d ON d.id = e.dept GROUP BY d.id, d.name;

-- OUTPUT:
-- name | n
-- HR   | 2
-- IT   | 1`]],
        [['Three-way join.',
            r`SELECT e.name, d.name AS dept, l.city FROM emp e JOIN departments d ON d.id = e.dept JOIN locations l ON l.id = d.location_id;

-- OUTPUT:
-- name  | dept | city
-- Asha  | HR   | Pune
-- Meena | IT   | Delhi`],
            ['Check the join plan.',
                r`EXPLAIN SELECT e.name, d.name FROM emp e JOIN departments d ON d.id = e.dept;

-- OUTPUT: (example)
-- table | type   | key     | rows
-- e     | ALL    | NULL    |    3
-- d     | eq_ref | PRIMARY |    1`]]
    ),

    'LEFT JOIN': x(
        ['LEFT JOIN keeps every row from the left table and fills the right columns with NULL when there is no match.',
            'Use it to keep rows such as customers without orders.',
            'To find rows with no match, add <code>WHERE right.id IS NULL</code>.'],
        ['Filtering the right table in WHERE turns a LEFT JOIN into an INNER JOIN; put such filters in the ON clause.',
            'COUNT(right.col) counts only matches, COUNT(*) counts the left rows too.',
            'LEFT JOIN order matters: A LEFT JOIN B is not the same as B LEFT JOIN A.'],
        ['The optimizer can convert LEFT JOIN to INNER JOIN when a null-rejecting WHERE exists; confirm intent.',
            'Chains of LEFT JOINs against one-to-many tables multiply rows; aggregate subqueries first.',
            'Anti-join forms: LEFT JOIN ... IS NULL, NOT EXISTS; NOT EXISTS is usually clearest and null-safe.'],
        [['F', 'What does LEFT JOIN return?', 'All rows from the left table plus matching right rows, with NULLs where none match.'],
            ['F', 'How do you find customers with no orders?', 'LEFT JOIN orders and filter <code>orders.id IS NULL</code>.'],
            ['M', 'Why did my LEFT JOIN behave like an INNER JOIN?', 'A WHERE condition on the right table (for example <code>o.status = "PAID"</code>) discards NULL rows; move it to ON.'],
            ['M', 'COUNT(*) vs COUNT(o.id) after LEFT JOIN?', 'COUNT(*) counts customers even with no orders (1), COUNT(o.id) counts only real orders (0).'],
            ['S', 'LEFT JOIN IS NULL vs NOT EXISTS?', 'Both express anti-joins; NOT EXISTS is clearer, and the optimizer treats them similarly in 8.0 (antijoin).'],
            ['S', 'How do you avoid row multiplication with multiple LEFT JOINs?', 'Pre-aggregate each child table in a derived table or CTE, then join the results one row per parent.']],
        [['Departments including those without employees.',
            r`SELECT d.name AS dept, COUNT(e.id) AS staff FROM departments d LEFT JOIN emp e ON e.dept = d.id GROUP BY d.id, d.name;

-- OUTPUT:
-- dept  | staff
-- HR    | 2
-- IT    | 1
-- Sales | 0`],
            ['Departments with no employees.',
                r`SELECT d.name FROM departments d LEFT JOIN emp e ON e.dept = d.id WHERE e.id IS NULL;

-- OUTPUT:
-- name
-- Sales`]],
        [['Filter in ON to keep unmatched rows.',
            r`SELECT d.name, e.name AS employee FROM departments d LEFT JOIN emp e ON e.dept = d.id AND e.salary > 50000;

-- OUTPUT:
-- name  | employee
-- HR    | Asha
-- IT    | Meena
-- Sales | NULL`],
            ['Same filter in WHERE drops Sales.',
                r`SELECT d.name, e.name FROM departments d LEFT JOIN emp e ON e.dept = d.id WHERE e.salary > 50000;

-- OUTPUT:
-- name | name
-- HR   | Asha
-- IT   | Meena`]]
    ),

    'RIGHT JOIN': x(
        ['RIGHT JOIN keeps every row from the right table, with NULLs for unmatched left columns.',
            'It is the mirror of LEFT JOIN: <code>A RIGHT JOIN B</code> equals <code>B LEFT JOIN A</code>.',
            'Most developers write LEFT JOIN only, by swapping table order.'],
        ['Use RIGHT JOIN rarely; consistent LEFT JOIN style is easier to read and review.',
            'Behaviour with WHERE on the left table mirrors LEFT JOIN rules.',
            'MySQL internally rewrites RIGHT JOIN to LEFT JOIN.'],
        ['Mixed LEFT/RIGHT joins in one query are hard to reason about; standardize on LEFT in team style guides.',
            'Apply the same ON versus WHERE care as for LEFT JOIN.',
            'ORMs usually only generate LEFT joins, so RIGHT join knowledge is mostly for reading legacy SQL.'],
        [['F', 'What does RIGHT JOIN do?', 'Returns all rows from the right table and matching rows from the left.'],
            ['F', 'RIGHT JOIN equals which LEFT JOIN?', 'Swap the table order: A RIGHT JOIN B = B LEFT JOIN A.'],
            ['M', 'Why do teams avoid RIGHT JOIN?', 'Reading left to right it is harder to see which table is preserved; one style lowers mistakes.'],
            ['M', 'How does MySQL execute RIGHT JOIN?', 'It converts it into the equivalent LEFT JOIN with swapped tables.'],
            ['S', 'Where might you meet RIGHT JOINs in practice?', 'Legacy reports, generated SQL from BI tools and some DBA scripts.'],
            ['S', 'Is there any capability RIGHT JOIN has that LEFT JOIN lacks?', 'No; it is purely syntactic.']],
        [['Departments with employee counts (right side preserved).',
            r`SELECT d.name, COUNT(e.id) AS staff FROM emp e RIGHT JOIN departments d ON e.dept = d.id GROUP BY d.id, d.name;

-- OUTPUT:
-- name  | staff
-- HR    | 2
-- IT    | 1
-- Sales | 0`],
            ['Equivalent LEFT JOIN.',
                r`SELECT d.name, COUNT(e.id) AS staff FROM departments d LEFT JOIN emp e ON e.dept = d.id GROUP BY d.id, d.name;

-- OUTPUT:
-- name  | staff
-- HR    | 2
-- IT    | 1
-- Sales | 0`]],
        [['Employees with no valid department (orphans).',
            r`SELECT e.name FROM departments d RIGHT JOIN emp e ON e.dept = d.id WHERE d.id IS NULL;

-- OUTPUT:
-- Empty set  (all employees have a department)`],
            ['Rewrite as LEFT JOIN.',
                r`SELECT e.name FROM emp e LEFT JOIN departments d ON d.id = e.dept WHERE d.id IS NULL;

-- OUTPUT:
-- Empty set`]]
    ),

    'CROSS JOIN': x(
        ['CROSS JOIN pairs every row of one table with every row of another (Cartesian product).',
            'If A has 3 rows and B has 4, the result has 12 rows.',
            'It has no ON condition.'],
        ['Useful for generating combinations: sizes x colours, dates x products, test data.',
            'A forgotten join condition accidentally produces a cross join; row counts explode.',
            'CROSS JOIN with a WHERE equality is the same as an INNER JOIN.'],
        ['Use cross joins on small, controlled sets (calendar, dimensions) to build reports that show zero values.',
            'Guard against huge Cartesian products with LIMIT, row-estimate checks and code review.',
            'Row explosion is multiplicative: 100k x 100k is 10 billion rows.'],
        [['F', 'What does CROSS JOIN produce?', 'Every combination of rows from both tables.'],
            ['F', 'How many rows from 3 x 4 rows?', '12.'],
            ['M', 'When is CROSS JOIN useful?', 'Generating combinations, such as calendar x product for zero-filled reports or variant matrices.'],
            ['M', 'How does an accidental cross join occur?', 'Omitting or mistyping the join condition, or joining on a condition that is always true.'],
            ['S', 'How do you protect a service from accidental cross joins?', 'Query review, EXPLAIN row estimates in CI, statement timeouts and <code>max_join_size</code>.'],
            ['S', 'How to build a zero-filled report matrix?', 'CROSS JOIN dimension lists (dates x products), then LEFT JOIN facts and COALESCE counts to 0.']],
        [['Sizes and colours.',
            r`CREATE TABLE sizes (s VARCHAR(2)); INSERT INTO sizes VALUES ('S'),('M'),('L');
CREATE TABLE colours (c VARCHAR(10)); INSERT INTO colours VALUES ('Red'),('Blue');
SELECT s, c FROM sizes CROSS JOIN colours ORDER BY s, c;

-- OUTPUT:
-- s | c
-- L | Blue
-- L | Red
-- M | Blue
-- M | Red
-- S | Blue
-- S | Red`],
            ['Row count check.',
                r`SELECT COUNT(*) FROM sizes CROSS JOIN colours;

-- OUTPUT:
-- COUNT(*)
-- 6`]],
        [['Zero-filled report.',
            r`SELECT d.d, p.name, COALESCE(SUM(s.qty),0) AS qty
FROM calendar d CROSS JOIN products p LEFT JOIN sales s ON s.day = d.d AND s.product_id = p.id
GROUP BY d.d, p.id, p.name;

-- OUTPUT: (example)
-- d          | name | qty
-- 2026-01-01 | Pen  |   5
-- 2026-01-01 | Book |   0`],
            ['Guard against runaway joins.',
                r`SET SESSION max_join_size = 1000000;
SELECT * FROM big_a CROSS JOIN big_b;

-- OUTPUT:
-- ERROR 1104 (42000): The SELECT would examine more than MAX_JOIN_SIZE rows`]]
    ),

    'SELF JOIN': x(
        ['A self join joins a table to itself using two aliases, for example employees and their managers.',
            'Alias is mandatory: <code>FROM emp e JOIN emp m ON e.manager_id = m.id</code>.',
            'It models hierarchies and comparisons within one table.'],
        ['Use LEFT JOIN to keep top-level rows with no manager.',
            'Self joins also find pairs (duplicate emails, adjacent rows) with conditions such as <code>a.id &lt; b.id</code>.',
            'Index the parent column (<code>manager_id</code>).'],
        ['Multi-level hierarchies need recursive CTEs, not repeated self joins.',
            'Alternative hierarchy models: adjacency list (parent id), materialized path, nested sets, closure table; pick by read/write pattern.',
            'Large self joins can square the row count; filter early.'],
        [['F', 'What is a self join?', 'A join of a table with itself using aliases.'],
            ['F', 'Example use?', 'Showing each employee with the name of their manager.'],
            ['M', 'How do you include the CEO who has no manager?', 'Use LEFT JOIN so rows with NULL manager are kept.'],
            ['M', 'How to find duplicate pairs without mirrored duplicates?', 'Add <code>a.id &lt; b.id</code> in the join condition.'],
            ['S', 'How do you query an arbitrary-depth org chart?', 'Recursive CTE over the adjacency list, or a closure/materialized path table for heavy reads.'],
            ['S', 'Trade-offs of closure tables vs adjacency list?', 'Closure tables make subtree queries fast but need more storage and write maintenance; adjacency lists are simple but need recursion.']],
        [['Employee and manager.',
            r`CREATE TABLE staff (id INT PRIMARY KEY, name VARCHAR(20), manager_id INT);
INSERT INTO staff VALUES (1,'Anita',NULL),(2,'Ravi',1),(3,'Meena',1),(4,'Kiran',2);
SELECT e.name AS employee, m.name AS manager FROM staff e LEFT JOIN staff m ON m.id = e.manager_id ORDER BY e.id;

-- OUTPUT:
-- employee | manager
-- Anita    | NULL
-- Ravi     | Anita
-- Meena    | Anita
-- Kiran    | Ravi`],
            ['Find managers who have reports and their counts.',
                r`SELECT m.name, COUNT(*) AS reports FROM staff e JOIN staff m ON m.id = e.manager_id GROUP BY m.id, m.name;

-- OUTPUT:
-- name  | reports
-- Anita |       2
-- Ravi  |       1`]],
        [['Duplicate emails as pairs.',
            r`SELECT a.id, b.id FROM users a JOIN users b ON a.email = b.email AND a.id < b.id;

-- OUTPUT:
-- id | id
--  4 |  9`],
            ['Whole tree with recursive CTE.',
                r`WITH RECURSIVE tree AS (
  SELECT id, name, 0 AS lvl FROM staff WHERE manager_id IS NULL
  UNION ALL
  SELECT s.id, s.name, t.lvl + 1 FROM staff s JOIN tree t ON s.manager_id = t.id)
SELECT CONCAT(REPEAT('  ', lvl), name) AS org FROM tree ORDER BY lvl, id;

-- OUTPUT:
-- org
-- Anita
--   Ravi
--   Meena
--     Kiran`]]
    ),

    'Multiple Joins & Many-to-Many Joins': x(
        ['You can chain joins: <code>A JOIN B ON ... JOIN C ON ...</code>.',
            'A many-to-many query goes through the junction table: students JOIN enrolments JOIN courses.',
            'Use clear aliases and join one relationship at a time.'],
        ['Mix INNER and LEFT joins carefully: a later INNER JOIN on a LEFT-joined table filters out unmatched rows.',
            'Join order in SQL text is logical; the optimizer chooses the physical order (use <code>STRAIGHT_JOIN</code> only as a last resort).',
            'Index every join column, especially both sides of the junction table.'],
        ['Aggregates across several one-to-many joins double count (fan-out); aggregate subqueries separately.',
            'Wide joins increase memory for hash joins and temp tables; select only needed columns.',
            'Consider denormalized read models for heavy multi-join screens.'],
        [['F', 'How do you query a many-to-many relationship?', 'Join the first table to the junction table, then the junction table to the second table.'],
            ['F', 'Can you join more than two tables?', 'Yes, chain joins one after another.'],
            ['M', 'Why do my sums double after joining items and payments?', 'Joining two one-to-many tables multiplies rows (fan-out). Aggregate each side first.'],
            ['M', 'What does STRAIGHT_JOIN do?', 'Forces the join order as written; used only when the optimizer chooses badly.'],
            ['S', 'How do you tune a 6-table join?', 'Read EXPLAIN ANALYZE for the worst step, add or fix indexes, filter early, select fewer columns and consider pre-aggregation.'],
            ['S', 'When denormalize instead of joining?', 'When a hot read path joins many stable tables; copy or cache fields in a read model with a clear update path.']],
        [['Students with courses.',
            r`SELECT s.name, c.title, e.enrolled_on
FROM students s JOIN enrolments e ON e.student_id = s.id JOIN courses c ON c.id = e.course_id
ORDER BY s.name, c.title;

-- OUTPUT:
-- name | title | enrolled_on
-- Asha | Java  | 2026-01-06
-- Asha | SQL   | 2026-01-05
-- Ravi | SQL   | 2026-01-07`],
            ['Course popularity with students listed.',
                r`SELECT c.title, COUNT(*) AS n, GROUP_CONCAT(s.name ORDER BY s.name) AS students
FROM courses c JOIN enrolments e ON e.course_id = c.id JOIN students s ON s.id = e.student_id GROUP BY c.id, c.title;

-- OUTPUT:
-- title | n | students
-- SQL   | 2 | Asha,Ravi
-- Java  | 1 | Asha`]],
        [['Fix fan-out with pre-aggregation.',
            r`SELECT o.id, i.item_total, p.paid_total
FROM orders o
LEFT JOIN (SELECT order_id, SUM(price*qty) AS item_total FROM order_items GROUP BY order_id) i ON i.order_id = o.id
LEFT JOIN (SELECT order_id, SUM(amount) AS paid_total FROM payments GROUP BY order_id) p ON p.order_id = o.id;

-- OUTPUT:
-- id | item_total | paid_total
--  1 |       900  |       900`],
            ['Students without any course.',
                r`SELECT s.name FROM students s LEFT JOIN enrolments e ON e.student_id = s.id WHERE e.course_id IS NULL;

-- OUTPUT:
-- name
-- Meena`]]
    ),

    'Join vs Subquery & Join Performance': x(
        ['Many problems can be written with a JOIN or a subquery. Both can be correct; choose the clearer one and check the plan.',
            'JOIN returns columns from both tables; a subquery in WHERE only filters.',
            'EXISTS/IN subqueries often read more naturally for "has at least one".'],
        ['MySQL 8 rewrites many IN/EXISTS subqueries into semijoins and anti-joins, so performance is often equal.',
            'JOIN can duplicate rows for one-to-many relations; semi-join (EXISTS) never does.',
            'Correlated subqueries in the SELECT list run per row and can be slow; replace with a join to a pre-aggregated derived table.'],
        ['Always compare with EXPLAIN ANALYZE on production-like data; differences come from statistics and indexes, not syntax.',
            'Hash joins (8.0.18+) help joins without usable indexes; do not rely on them for OLTP latency.',
            'Join performance is dominated by the access path of the driving table, the selectivity of filters, and index availability on inner tables.'],
        [['F', 'Can the same result be written with JOIN and subquery?', 'Often yes; choose by clarity and verify performance.'],
            ['F', 'Which one returns columns from both tables?', 'JOIN.'],
            ['M', 'EXISTS vs JOIN for "customers who ordered"?', 'EXISTS returns each customer once; JOIN repeats customers per order unless DISTINCT or GROUP BY is added.'],
            ['M', 'What is a semijoin?', 'A join that only checks for existence of a match (used for IN/EXISTS) and returns left rows once.'],
            ['S', 'How do you decide JOIN vs subquery?', 'Intent first (existence vs data needed), then test both plans on realistic data and keep the clearer, equally fast one.'],
            ['S', 'What affects join speed most?', 'Rows from the driving table after filters, index lookups on the inner table, join buffer/hash use, and data skew.']],
        [['Same result, two styles.',
            r`SELECT DISTINCT c.name FROM customers c JOIN orders o ON o.customer_id = c.id;
SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT: (both)
-- name
-- Asha`],
            ['Find the strategy used.',
                r`EXPLAIN FORMAT=TREE SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT: (example)
-- -> Nested loop semijoin
--     -> Table scan on c
--     -> Single-row index lookup on o using idx_customer`]],
        [['Slow correlated subquery in SELECT.',
            r`SELECT c.id, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS n FROM customers c;

-- OUTPUT:
-- id | n
--  1 | 2
--  2 | 0`],
            ['Faster join to a pre-aggregate.',
                r`SELECT c.id, COALESCE(x.n,0) AS n FROM customers c
LEFT JOIN (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) x ON x.customer_id = c.id;

-- OUTPUT:
-- id | n
--  1 | 2
--  2 | 0`]]
    ),

    'Scalar & Single-Row Subqueries': x(
        ['A scalar subquery returns exactly one value, so it can be used wherever a value fits: <code>WHERE salary &gt; (SELECT AVG(salary) FROM emp)</code>.',
            'It must return one column and at most one row.',
            'Wrap it in parentheses.'],
        ['If it returns more than one row you get error 1242; use IN or ANY, or add LIMIT/aggregation.',
            'Empty result becomes NULL.',
            'It can appear in SELECT, WHERE, HAVING and even ORDER BY.'],
        ['Uncorrelated scalar subqueries run once and are cached; correlated ones run per outer row.',
            'Use a CTE or join when the same subquery repeats many times.',
            'NULL results silently make comparisons unknown; check data and use COALESCE.'],
        [['F', 'What is a scalar subquery?', 'A subquery that returns a single value.'],
            ['F', 'Example?', 'Employees earning more than the average: <code>WHERE salary &gt; (SELECT AVG(salary) FROM emp)</code>.'],
            ['M', 'What happens if it returns multiple rows?', 'Error 1242: Subquery returns more than 1 row.'],
            ['M', 'What does an empty scalar subquery return?', 'NULL.'],
            ['S', 'Why can scalar subqueries in SELECT be slow?', 'If correlated they execute once per row; rewrite as a join with an aggregated derived table.'],
            ['S', 'How do you reuse one computed value many times?', 'CTE or a derived table joined once, or a user/session variable for constants.']],
        [['Above-average earners.',
            r`SELECT name, salary FROM emp WHERE salary > (SELECT AVG(salary) FROM emp);

-- OUTPUT:
-- name  | salary
-- Meena |  70000
-- Asha  |  60000`],
            ['Compare to department maximum with a scalar subquery.',
                r`SELECT name, salary, (SELECT MAX(salary) FROM emp) - salary AS gap_to_top FROM emp;

-- OUTPUT:
-- name  | salary | gap_to_top
-- Asha  |  60000 |      10000
-- Ravi  |  45000 |      25000
-- Meena |  70000 |          0`]],
        [['Too many rows error.',
            r`SELECT name FROM emp WHERE salary = (SELECT salary FROM emp WHERE dept = 10);

-- OUTPUT:
-- ERROR 1242 (21000): Subquery returns more than 1 row`],
            ['Latest order per customer via scalar subquery.',
                r`SELECT c.name, (SELECT MAX(o.created_at) FROM orders o WHERE o.customer_id = c.id) AS last_order FROM customers c;

-- OUTPUT:
-- name | last_order
-- Asha | 2026-03-05 10:00:00`]]
    ),

    'Multi-Row Subqueries with IN': x(
        ['A multi-row subquery returns several values; use <code>IN</code> to test membership: <code>WHERE dept IN (SELECT id FROM departments WHERE city = "Pune")</code>.',
            'It must return one column.',
            'NOT IN excludes members of the set.'],
        ['<code>NOT IN</code> returns no rows if the subquery produces a NULL; use NOT EXISTS.',
            'MySQL 8 optimizes IN subqueries as semijoins; older versions were slow.',
            'You can use tuple IN: <code>(a,b) IN (SELECT a,b FROM ...)</code>.'],
        ['Check EXPLAIN for "FirstMatch" or "LooseScan" semijoin strategies.',
            'For very large lists consider joining a temp table instead.',
            'Keep subquery selective; unfiltered IN over big tables materializes huge sets.'],
        [['F', 'What does IN with a subquery do?', 'Tests whether a value matches any value returned by the subquery.'],
            ['F', 'How many columns may the subquery return?', 'One (or a matching tuple).'],
            ['M', 'Why is NOT IN dangerous with NULLs?', 'One NULL in the set makes the result unknown for every row, so nothing is returned.'],
            ['M', 'IN vs EXISTS?', 'Same logic for existence; EXISTS handles NULLs safely in negation and is clear for correlated checks.'],
            ['S', 'What is a semijoin strategy?', 'Optimizer techniques (FirstMatch, LooseScan, Materialization, DuplicateWeedout) that implement IN/EXISTS without duplicating rows.'],
            ['S', 'How do you handle a 50,000-id IN list?', 'Insert ids in a temporary table with an index and JOIN it.']],
        [['Employees in HR or IT.',
            r`SELECT name FROM emp WHERE dept IN (SELECT id FROM departments WHERE name IN ('HR','IT'));

-- OUTPUT:
-- name
-- Asha
-- Ravi
-- Meena`],
            ['Departments with no employees (NOT IN).',
                r`SELECT name FROM departments WHERE id NOT IN (SELECT dept FROM emp WHERE dept IS NOT NULL);

-- OUTPUT:
-- name
-- Sales`]],
        [['NOT IN with a NULL.',
            r`SELECT name FROM departments WHERE id NOT IN (SELECT dept FROM emp UNION SELECT NULL);

-- OUTPUT:
-- Empty set`],
            ['Tuple IN.',
                r`SELECT name FROM emp WHERE (dept, salary) IN (SELECT dept, MAX(salary) FROM emp GROUP BY dept);

-- OUTPUT:
-- name
-- Asha
-- Meena`]]
    ),

    'Correlated Subqueries': x(
        ['A correlated subquery refers to a column of the outer query, so it is evaluated for each outer row.',
            'Example: employees earning more than the average of their own department.',
            'It reads like a loop: for each employee, compute the department average.'],
        ['Often can be rewritten as a JOIN to an aggregated derived table, which can be much faster.',
            'MySQL may decorrelate some forms automatically.',
            'Index the correlated columns inside the subquery.'],
        ['Per-row execution scales as outer rows x inner cost; verify with EXPLAIN ANALYZE loops counts.',
            'Window functions replace many correlated aggregates (rank, running total, top N).',
            'Correlated EXISTS is efficient because it stops at the first match.'],
        [['F', 'What makes a subquery correlated?', 'It uses a column from the outer query.'],
            ['F', 'Give an example.', 'Employees earning above their own department’s average salary.'],
            ['M', 'Why can correlated subqueries be slow?', 'They may run once per outer row, repeating work.'],
            ['M', 'How do you rewrite one for speed?', 'Join to a pre-aggregated derived table or use a window function.'],
            ['S', 'Why is correlated EXISTS usually fine?', 'It short-circuits after the first matching row and can use an index.'],
            ['S', 'How to see per-row cost?', 'EXPLAIN ANALYZE shows loops and actual time for the dependent subquery.']],
        [['Above own department average.',
            r`SELECT e.name, e.dept, e.salary FROM emp e WHERE e.salary > (SELECT AVG(x.salary) FROM emp x WHERE x.dept = e.dept);

-- OUTPUT:
-- name | dept | salary
-- Asha |   10 |  60000`],
            ['Latest order per customer.',
                r`SELECT o.* FROM orders o WHERE o.created_at = (SELECT MAX(created_at) FROM orders WHERE customer_id = o.customer_id);

-- OUTPUT:
-- id | customer_id | created_at
-- 11 |           1 | 2026-03-05 10:00:00`]],
        [['Rewrite with derived table join.',
            r`SELECT e.name FROM emp e JOIN (SELECT dept, AVG(salary) AS a FROM emp GROUP BY dept) d ON d.dept = e.dept WHERE e.salary > d.a;

-- OUTPUT:
-- name
-- Asha`],
            ['Rewrite with window function.',
                r`SELECT name FROM (SELECT name, salary, AVG(salary) OVER (PARTITION BY dept) AS a FROM emp) t WHERE salary > a;

-- OUTPUT:
-- name
-- Asha`]]
    ),

    'EXISTS Subqueries': x(
        ['<code>EXISTS (subquery)</code> is true if the subquery returns at least one row.',
            'Typical: customers that have at least one order.',
            'The SELECT list inside EXISTS does not matter; <code>SELECT 1</code> is common.'],
        ['<code>NOT EXISTS</code> finds rows with no match and is NULL-safe, unlike NOT IN.',
            'EXISTS usually correlates with the outer table.',
            'It never duplicates outer rows, unlike JOIN.'],
        ['MySQL executes EXISTS as semijoin/antijoin where possible; plans should show index lookups on the inner table.',
            'Index the correlated column in the inner table (<code>orders.customer_id</code>).',
            'For "all" conditions use double negation NOT EXISTS (... NOT EXISTS ...) (relational division).'],
        [['F', 'What does EXISTS check?', 'Whether the subquery returns any row.'],
            ['F', 'What is NOT EXISTS for?', 'Finding rows with no related rows.'],
            ['M', 'EXISTS vs IN?', 'Equivalent for positive checks; EXISTS is safer with NULLs in the negative form.'],
            ['M', 'Does the SELECT list in EXISTS matter?', 'No, only whether rows exist.'],
            ['S', 'How do you express "customers who bought every product"?', 'Relational division using NOT EXISTS twice: no product exists that the customer has not bought.'],
            ['S', 'How to make EXISTS fast?', 'Index the inner correlated columns and keep the subquery selective.']],
        [['Customers with orders and without.',
            r`SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT: (first) Asha
-- OUTPUT: (second) Ravi`],
            ['Departments that have a high earner.',
                r`SELECT d.name FROM departments d WHERE EXISTS (SELECT 1 FROM emp e WHERE e.dept = d.id AND e.salary > 65000);

-- OUTPUT:
-- name
-- IT`]],
        [['Relational division: customers who bought every product.',
            r`SELECT c.name FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE NOT EXISTS (
        SELECT 1 FROM order_lines l JOIN orders o ON o.id = l.order_id WHERE o.customer_id = c.id AND l.product_id = p.id));

-- OUTPUT:
-- name
-- Asha`],
            ['Plan shows semijoin.',
                r`EXPLAIN FORMAT=TREE SELECT 1 FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT: (example)
-- -> Nested loop semijoin`]]
    ),

    'ANY & ALL Subqueries': x(
        ['<code>&gt; ANY (subquery)</code> is true if the value is greater than at least one returned value; <code>&gt; ALL</code> if greater than every value.',
            '<code>= ANY</code> is the same as IN; <code>&lt;&gt; ALL</code> is the same as NOT IN.',
            'Example: salary above all salaries in department 10.'],
        ['<code>&gt; ANY</code> is equivalent to greater than the minimum; <code>&gt; ALL</code> to greater than the maximum.',
            'On empty sets ALL is true and ANY is false.',
            'Rewrite with MIN/MAX for readability and speed.'],
        ['ANY/ALL with NULLs follow three-valued logic; one NULL in the set can turn ALL into unknown.',
            'MAX/MIN rewrites let the optimizer use indexes more simply.',
            'Rarely used in application code; recognise them in legacy SQL and exams.'],
        [['F', 'What does > ALL mean?', 'Greater than every value returned by the subquery.'],
            ['F', 'What is = ANY equal to?', 'IN.'],
            ['M', '> ANY equals greater than what?', 'The minimum of the set.'],
            ['M', 'What is ALL on an empty subquery?', 'TRUE.'],
            ['S', 'Why prefer MAX/MIN over ALL/ANY?', 'It is clearer, handles NULL intent explicitly and gives the optimizer a simple aggregate.'],
            ['S', 'What happens with NULL in the set for > ALL?', 'If no row fails and NULL exists, the result is unknown (not true), so rows are excluded.']],
        [['Earn more than everyone in dept 20.',
            r`SELECT name FROM emp WHERE salary > ALL (SELECT salary FROM emp WHERE dept = 20);

-- OUTPUT:
-- Empty set`],
            ['Earn more than at least one HR person.',
                r`SELECT name FROM emp WHERE salary > ANY (SELECT salary FROM emp WHERE dept = 10);

-- OUTPUT:
-- name
-- Asha
-- Meena`]],
        [['Equivalent MAX/MIN rewrites.',
            r`SELECT name FROM emp WHERE salary > (SELECT MAX(salary) FROM emp WHERE dept = 20);
SELECT name FROM emp WHERE salary > (SELECT MIN(salary) FROM emp WHERE dept = 10);

-- OUTPUT: (first) none   (second) Asha, Meena`],
            ['ALL on empty set is true.',
                r`SELECT 1 > ALL (SELECT salary FROM emp WHERE 1 = 0) AS vacuous;

-- OUTPUT:
-- vacuous
-- 1`]]
    ),

    'UNION vs UNION ALL': x(
        ['UNION combines results of two queries and removes duplicates; UNION ALL keeps duplicates.',
            'Both queries need the same number of columns with compatible types.',
            'UNION ALL is faster because it skips duplicate removal.'],
        ['Column names come from the first query; ORDER BY applies to the whole union result at the end.',
            'Use UNION ALL by default when duplicates are impossible or acceptable.',
            'Wrap each part in parentheses to give individual ORDER BY/LIMIT.'],
        ['UNION needs a temporary table with a unique index to deduplicate, costing memory and time.',
            'Partition-style reporting: UNION ALL monthly tables, or better a single partitioned table.',
            'A UNION of two selective index queries is a classic rewrite for OR conditions.'],
        [['F', 'UNION vs UNION ALL?', 'UNION removes duplicates; UNION ALL keeps all rows and is faster.'],
            ['F', 'What must match between the queries?', 'Number of columns and compatible data types.'],
            ['M', 'Where do the column names come from?', 'From the first SELECT.'],
            ['M', 'How do you sort a UNION?', 'Put a single ORDER BY after the last query (applies to the combined result).'],
            ['S', 'Why is UNION slower?', 'It must deduplicate using a temporary structure; prefer UNION ALL unless duplicates must be removed.'],
            ['S', 'How can UNION speed up an OR query?', 'Each branch can use its own index; the union merges results (use UNION ALL plus a guard if branches cannot overlap).']],
        [['Combine two lists.',
            r`SELECT name FROM emp WHERE dept = 10
UNION
SELECT name FROM emp WHERE salary > 50000;

-- OUTPUT:
-- name
-- Asha
-- Ravi
-- Meena`],
            ['UNION ALL keeps duplicates.',
                r`SELECT name FROM emp WHERE dept = 10
UNION ALL
SELECT name FROM emp WHERE salary > 50000;

-- OUTPUT:
-- name
-- Asha
-- Ravi
-- Meena
-- Asha`]],
        [['Sorting and limiting the union.',
            r`(SELECT name, salary FROM emp WHERE dept = 10) UNION ALL (SELECT name, salary FROM emp WHERE dept = 20)
ORDER BY salary DESC LIMIT 2;

-- OUTPUT:
-- name  | salary
-- Meena | 70000
-- Asha  | 60000`],
            ['Rewrite an OR into UNION ALL with a guard.',
                r`SELECT id FROM emp WHERE dept = 10
UNION ALL
SELECT id FROM emp WHERE salary > 50000 AND dept <> 10;

-- OUTPUT:
-- id
-- 1
-- 2
-- 3`]]
    ),

    'INTERSECT & EXCEPT': x(
        ['INTERSECT returns rows present in both queries; EXCEPT returns rows in the first but not in the second.',
            'MySQL supports them from 8.0.31.',
            'Both remove duplicates unless you add ALL.'],
        ['Before 8.0.31 emulate INTERSECT with INNER JOIN or IN, and EXCEPT with NOT EXISTS or LEFT JOIN ... IS NULL.',
            'Column count and types must match, as in UNION.',
            'INTERSECT has higher precedence than UNION and EXCEPT.'],
        ['NULLs are treated as equal in set operations (unlike comparisons), which is useful for diffing datasets.',
            'EXCEPT is handy for reconciliation: rows in source but missing in target.',
            'Verify support on managed services and replicas of mixed versions.'],
        [['F', 'What does INTERSECT return?', 'Rows that appear in both result sets.'],
            ['F', 'What does EXCEPT return?', 'Rows from the first query that are not in the second.'],
            ['M', 'Which MySQL version added them?', '8.0.31.'],
            ['M', 'How do you emulate EXCEPT in older versions?', 'NOT EXISTS or LEFT JOIN ... WHERE right IS NULL.'],
            ['S', 'How are NULLs treated in set operations?', 'As equal to each other, so two NULL rows count as duplicates.'],
            ['S', 'Use case for EXCEPT in data engineering?', 'Reconciliation between source and target tables to find missing or extra rows.']],
        [['Departments in both lists.',
            r`SELECT dept FROM emp WHERE salary > 50000
INTERSECT
SELECT dept FROM emp WHERE name LIKE 'A%';

-- OUTPUT:
-- dept
-- 10`],
            ['Rows only in the first set.',
                r`SELECT id FROM emp
EXCEPT
SELECT id FROM emp WHERE salary > 50000;

-- OUTPUT:
-- id
-- 2`]],
        [['Emulate for older MySQL.',
            r`SELECT e.id FROM emp e WHERE NOT EXISTS (SELECT 1 FROM emp x WHERE x.id = e.id AND x.salary > 50000);

-- OUTPUT:
-- id
-- 2`],
            ['Reconcile two tables.',
                r`SELECT id, amount FROM src_payments
EXCEPT
SELECT id, amount FROM dst_payments;

-- OUTPUT:
-- id | amount
--  9 | 120.00     (present in source, missing or different in target)`]]
    ),

    'Column Compatibility & Duplicate Handling': x(
        ['Set operations need the same number of columns and compatible types in the same order.',
            'UNION/INTERSECT/EXCEPT remove duplicates; UNION ALL does not.',
            'Column names come from the first query.'],
        ['MySQL converts types to a common type (INT with VARCHAR becomes string), which may surprise sorting and comparisons; cast explicitly.',
            'Use NULL or literals to pad missing columns: <code>SELECT id, name, NULL AS phone</code>.',
            'Collation conflicts can raise "illegal mix of collations"; use COLLATE to align.'],
        ['Add a source label column (<code>"A" AS src</code>) to know where each row came from.',
            'Duplicate removal compares all columns, so extra columns make rows distinct.',
            'For deduplicating by key use window functions (ROW_NUMBER) after UNION ALL.'],
        [['F', 'What must match across the queries in a UNION?', 'Column count and compatible types.'],
            ['F', 'How do you add a missing column to one side?', 'Use NULL or a constant with the same position and type.'],
            ['M', 'What happens with mismatched types?', 'MySQL converts to a common type, possibly strings, which can change ordering.'],
            ['M', 'How do you tell which query a row came from?', 'Add a literal column like <code>"emp" AS source</code>.'],
            ['S', 'How to dedupe by id keeping the newest after UNION ALL?', 'ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) = 1.'],
            ['S', 'Why can UNION unexpectedly keep two near-duplicate rows?', 'Any differing column (even trailing spaces or case under binary collations) makes rows distinct.']],
        [['Pad columns and label sources.',
            r`SELECT id, name, 'emp' AS src, NULL AS phone FROM emp
UNION ALL
SELECT id, name, 'cust', phone FROM customers;

-- OUTPUT: (example)
-- id | name  | src  | phone
--  1 | Asha  | emp  | NULL
--  1 | Asha  | cust | 9999`],
            ['Mismatch error.',
                r`SELECT id, name FROM emp UNION SELECT id FROM customers;

-- OUTPUT:
-- ERROR 1222 (21000): The used SELECT statements have a different number of columns`]],
        [['Dedupe with ROW_NUMBER.',
            r`SELECT id, name FROM (
  SELECT id, name, ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) AS rn
  FROM (SELECT * FROM staff_a UNION ALL SELECT * FROM staff_b) u) t WHERE rn = 1;

-- OUTPUT:
-- id | name
--  1 | Asha`],
            ['Align collations.',
                r`SELECT name COLLATE utf8mb4_0900_ai_ci FROM a UNION SELECT name COLLATE utf8mb4_0900_ai_ci FROM b;

-- OUTPUT:
-- name
-- Asha`]]
    )
};
