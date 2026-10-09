// Deep dive, modules 11-13 (Joins, Subqueries, Set Operations).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d05: Record<string, Deep> = {
    'INNER JOIN': dv(
        [`MySQL executes joins with nested loops: it picks a driving table, reads each qualifying row, then looks up matching rows in the next table through an index. The optimizer chooses the join order from statistics. Without a usable index on the inner side it falls back to a hash join (8.0.18+) or a join buffer.`,
            r`CREATE TABLE departments (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept INT, KEY idx_dept (dept));
EXPLAIN FORMAT=TREE SELECT e.name, d.name FROM emp e JOIN departments d ON d.id = e.dept WHERE d.name = 'HR';

-- OUTPUT: (example)
-- -> Nested loop inner join
--     -> Filter: (d.name = 'HR')  -> Table scan on d
--     -> Index lookup on e using idx_dept (dept=d.id)`],
        [`Syntax variants: <code>JOIN ... ON</code>, <code>USING(col)</code> when names match, <code>NATURAL JOIN</code> (avoid), several joins chained, and the older comma syntax with WHERE (works but easy to break).`,
            r`SELECT e.name, d.name FROM emp e INNER JOIN departments d ON d.id = e.dept;
SELECT name, dept FROM emp JOIN dept_budget USING (dept);
SELECT e.name, d.name, l.city FROM emp e JOIN departments d ON d.id = e.dept JOIN locations l ON l.id = d.location_id;

-- OUTPUT:
-- name  | name | city
-- Asha  | HR   | Pune`],
        [`Mistakes: missing join condition (Cartesian product), joining on a mismatched type or collation (index unused), selecting ambiguous column names, and joining before filtering in the ON clause by mistake. Always check row counts.`,
            r`SELECT COUNT(*) FROM emp e JOIN departments d;             -- no ON: 3 x 4 = 12 rows (in MySQL a JOIN without ON is a cross join)
SELECT COUNT(*) FROM emp e JOIN departments d ON d.id = e.dept;

-- OUTPUT:
-- COUNT(*)
-- 12
-- COUNT(*)
-- 3`],
        [`Join performance depends on the driving table size after filters and on indexes for the inner lookups. Index the foreign keys, filter early, and read EXPLAIN ANALYZE for actual rows per step.`,
            r`EXPLAIN ANALYZE SELECT COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.country = 'IN' AND o.created_at >= '2026-05-01';

-- OUTPUT: (example)
-- -> Nested loop inner join (actual rows=8200 loops=1)
--     -> Index range scan on o using idx_created (actual rows=51000)
--     -> Filter: (c.country = 'IN') -> Single-row index lookup on c using PRIMARY (actual rows=0.16 loops=51000)`],
        [`Real-world: order detail screen joining orders, customers, items and products, selecting only needed columns and using primary-key lookups on the inner tables.`,
            r`SELECT o.id, c.name AS customer, p.name AS product, i.qty, i.unit_price, i.qty * i.unit_price AS line_total
FROM orders o JOIN customers c ON c.id = o.customer_id JOIN order_items i ON i.order_id = o.id JOIN products p ON p.id = i.product_id WHERE o.id = 1001;

-- OUTPUT:
-- id   | customer | product | qty | unit_price | line_total
-- 1001 | Asha     | Pen     |   2 |      10.00 |      20.00`]
    ),

    'LEFT JOIN': dv(
        [`A LEFT JOIN keeps every row of the left table; for rows with no match the right-side columns are NULL. The optimizer executes it as a nested loop in a fixed direction (left drives right), which limits join reordering compared with an inner join.`,
            r`SELECT d.name AS dept, e.name AS employee FROM departments d LEFT JOIN emp e ON e.dept = d.id ORDER BY d.id;

-- OUTPUT:
-- dept  | employee
-- HR    | Asha
-- HR    | Ravi
-- IT    | Meena
-- Sales | NULL`],
        [`Where a condition goes decides the result. Conditions on the right table belong in ON to keep unmatched left rows; in WHERE they turn the join into an inner join. Use IS NULL on a right key for an anti-join.`,
            r`SELECT d.name, e.name FROM departments d LEFT JOIN emp e ON e.dept = d.id AND e.salary > 50000;      -- keeps Sales
SELECT d.name, e.name FROM departments d LEFT JOIN emp e ON e.dept = d.id WHERE e.salary > 50000;      -- drops Sales
SELECT d.name FROM departments d LEFT JOIN emp e ON e.dept = d.id WHERE e.id IS NULL;                  -- departments without staff

-- OUTPUT:
-- name
-- Sales`],
        [`Mistakes: filtering the right table in WHERE, counting with COUNT(*) instead of COUNT(right.id), and chaining LEFT JOINs to several one-to-many tables (row explosion). Aggregate each many-side first.`,
            r`SELECT d.name, COUNT(*) AS wrong, COUNT(e.id) AS right_count FROM departments d LEFT JOIN emp e ON e.dept = d.id GROUP BY d.id, d.name;

-- OUTPUT:
-- name  | wrong | right_count
-- HR    |     2 |           2
-- Sales |     1 |           0          (COUNT(*) counts the NULL-extended row)`],
        [`Anti-join form: MySQL 8 recognises LEFT JOIN ... IS NULL and NOT EXISTS as an antijoin and avoids building the full join. Verify in the plan.`,
            r`EXPLAIN FORMAT=TREE SELECT c.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;

-- OUTPUT: (example)
-- -> Nested loop antijoin
--     -> Table scan on c
--     -> Single-row covering index lookup on o using idx_customer (customer_id=c.id)`],
        [`Real-world: a customer list with order counts and last order date, including customers who never ordered, built from a pre-aggregated derived table.`,
            r`SELECT c.id, c.name, COALESCE(x.orders, 0) AS orders, x.last_order
FROM customers c LEFT JOIN (SELECT customer_id, COUNT(*) AS orders, MAX(created_at) AS last_order FROM orders GROUP BY customer_id) x ON x.customer_id = c.id ORDER BY x.last_order DESC;

-- OUTPUT:
-- id | name | orders | last_order
--  1 | Asha |      9 | 2026-04-30 18:20:11
--  2 | Ravi |      0 | NULL`]
    ),

    'RIGHT JOIN': dv(
        [`MySQL rewrites every RIGHT JOIN into the equivalent LEFT JOIN with the tables swapped before optimizing. There is no extra capability; it is a different way to write the same preserved-side rule.`,
            r`EXPLAIN FORMAT=TREE SELECT d.name, e.name FROM emp e RIGHT JOIN departments d ON d.id = e.dept;
EXPLAIN FORMAT=TREE SELECT d.name, e.name FROM departments d LEFT JOIN emp e ON e.dept = d.id;

-- OUTPUT: (example)
-- both plans are identical: left join with departments driving and an index lookup on emp`],
        [`Use RIGHT JOIN when you read legacy SQL, otherwise write LEFT JOIN with the preserved table first. The same ON versus WHERE rules apply.`,
            r`SELECT d.name, COUNT(e.id) AS staff FROM emp e RIGHT JOIN departments d ON e.dept = d.id GROUP BY d.id, d.name;
SELECT d.name, COUNT(e.id) AS staff FROM departments d LEFT JOIN emp e ON e.dept = d.id GROUP BY d.id, d.name;

-- OUTPUT:
-- name  | staff
-- HR    | 2
-- IT    | 1
-- Sales | 0`],
        [`Mistakes: mixing LEFT and RIGHT joins in one query (hard to reason about) and putting a filter on the preserved side's partner in WHERE. A consistent style prevents review mistakes.`,
            r`-- confusing: which side is preserved here?
SELECT * FROM a RIGHT JOIN b ON b.a_id = a.id LEFT JOIN c ON c.b_id = b.id;
-- clear: one direction only
SELECT * FROM b LEFT JOIN a ON a.id = b.a_id LEFT JOIN c ON c.b_id = b.id;

-- OUTPUT:
-- (same rows; the second form reads top to bottom)`],
        [`Performance is the same as the equivalent LEFT JOIN, so tune indexes on the non-preserved side's join column and filter the preserved side early.`,
            r`ALTER TABLE emp ADD INDEX idx_dept (dept);
EXPLAIN SELECT d.name, e.name FROM emp e RIGHT JOIN departments d ON d.id = e.dept WHERE d.id = 10;

-- OUTPUT: (example)
-- table | type  | key
-- d     | const | PRIMARY
-- e     | ref   | idx_dept`],
        [`Real-world: converting legacy reports. Many older BI tools generate RIGHT JOINs; rewriting to LEFT JOIN makes them reviewable and aligns with ORM-generated SQL.`,
            r`-- legacy
SELECT p.name, s.qty FROM sales s RIGHT JOIN products p ON p.id = s.product_id;
-- rewrite
SELECT p.name, COALESCE(s.qty, 0) AS qty FROM products p LEFT JOIN sales s ON s.product_id = p.id;

-- OUTPUT:
-- name | qty
-- Pen  |  12
-- Cap  |   0`]
    ),

    'CROSS JOIN': dv(
        [`A cross join pairs every row of the left table with every row of the right table. The result size is the product of the row counts, and the executor simply loops over both inputs. In MySQL, <code>JOIN</code> without <code>ON</code> behaves like <code>CROSS JOIN</code>.`,
            r`CREATE TABLE sizes (s VARCHAR(2)); INSERT INTO sizes VALUES ('S'),('M'),('L');
CREATE TABLE colours (c VARCHAR(10)); INSERT INTO colours VALUES ('Red'),('Blue');
SELECT s, c FROM sizes CROSS JOIN colours ORDER BY s, c;
SELECT COUNT(*) FROM sizes CROSS JOIN colours;

-- OUTPUT:
-- 6 rows: L-Blue, L-Red, M-Blue, M-Red, S-Blue, S-Red
-- COUNT(*)
-- 6`],
        [`Legitimate forms: generating combinations, building a calendar-by-product grid for zero-filled reports, and joining a one-row configuration or aggregate result to every row. Add WHERE to turn it into an inner join.`,
            r`SELECT p.name, c.d FROM products p CROSS JOIN calendar c WHERE c.d BETWEEN '2026-05-01' AND '2026-05-03';
SELECT o.id, o.total / t.grand * 100 AS pct FROM orders o CROSS JOIN (SELECT SUM(total) AS grand FROM orders) t;

-- OUTPUT:
-- id | pct
--  1 | 2.40`],
        [`Mistakes: an accidental cross join from a missing condition (rows multiply and the query never finishes), and using it with large tables. Protect production with <code>max_join_size</code> and code review of every JOIN without ON.`,
            r`SET SESSION max_join_size = 1000000;
SELECT * FROM events e1 JOIN events e2;

-- OUTPUT:
-- ERROR 1104 (42000): The SELECT would examine more than MAX_JOIN_SIZE rows; check your WHERE and use SET SQL_BIG_SELECTS=1 or SET MAX_JOIN_SIZE=# if the SELECT is okay`],
        [`Cross joins of small dimension tables are cheap and feed LEFT JOINs to facts, producing complete matrices. Filter the dimensions first.`,
            r`SELECT c.d, p.name, COALESCE(SUM(s.qty), 0) AS qty
FROM calendar c CROSS JOIN products p LEFT JOIN sales s ON s.day = c.d AND s.product_id = p.id
WHERE c.d >= '2026-05-01' AND c.d < '2026-05-08' GROUP BY c.d, p.id, p.name;

-- OUTPUT:
-- d          | name | qty
-- 2026-05-01 | Pen  |  12
-- 2026-05-02 | Pen  |   0`],
        [`Real-world: a pricing grid of every product-size-colour variant, generated once and then filled with prices by an UPDATE.`,
            r`INSERT INTO variants (product_id, size, colour) SELECT p.id, s.s, c.c FROM products p CROSS JOIN sizes s CROSS JOIN colours c WHERE p.has_variants = 1;
SELECT COUNT(*) FROM variants;

-- OUTPUT:
-- COUNT(*)
-- 3600`]
    ),

    'SELF JOIN': dv(
        [`A self join uses the same table twice under different aliases, so each row can be matched with other rows of the same table. The optimizer treats the two aliases as independent tables, so an index on the join column (for example <code>manager_id</code>) is used for the inner lookups.`,
            r`CREATE TABLE staff (id INT PRIMARY KEY, name VARCHAR(20), manager_id INT, KEY idx_mgr (manager_id));
INSERT INTO staff VALUES (1,'Anita',NULL),(2,'Ravi',1),(3,'Meena',1),(4,'Kiran',2);
EXPLAIN SELECT e.name, m.name FROM staff e JOIN staff m ON m.id = e.manager_id;

-- OUTPUT: (example)
-- table | type   | key
-- e     | ALL    | NULL
-- m     | eq_ref | PRIMARY`],
        [`Typical patterns: employee and manager, pairs within a table (duplicates, adjacent rows), and comparisons between rows (earns more than manager). Use LEFT JOIN to keep top-level rows and <code>a.id &lt; b.id</code> to avoid mirrored pairs.`,
            r`SELECT e.name AS employee, COALESCE(m.name, '(top)') AS manager FROM staff e LEFT JOIN staff m ON m.id = e.manager_id ORDER BY e.id;
SELECT a.id, b.id AS duplicate_of FROM users a JOIN users b ON a.email = b.email AND a.id > b.id;

-- OUTPUT:
-- employee | manager
-- Anita    | (top)
-- Ravi     | Anita
-- Meena    | Anita
-- Kiran    | Ravi`],
        [`Mistakes: forgetting aliases (ambiguous columns), using INNER JOIN and losing root rows, producing both (a,b) and (b,a) pairs, and attempting arbitrary-depth hierarchies with a fixed number of self joins. Use a recursive CTE for depth.`,
            r`SELECT name FROM staff JOIN staff ON staff.id = staff.manager_id;

-- OUTPUT:
-- ERROR 1066 (42000): Not unique table/alias: 'staff'`],
        [`A self join on a non-indexed column is a nested loop over n x n rows. Index the join key, and for pairwise comparisons restrict candidates (same group, narrow date window) so the join does not square the table.`,
            r`SELECT a.id, b.id FROM events a JOIN events b ON b.user_id = a.user_id AND b.created_at > a.created_at AND b.created_at <= a.created_at + INTERVAL 5 MINUTE;
ALTER TABLE events ADD INDEX idx_user_created (user_id, created_at);

-- OUTPUT:
-- (with the composite index the inner side is a narrow range per user instead of a full scan)`],
        [`Real-world: find employees earning more than their manager, a classic audit query.`,
            r`SELECT e.name AS employee, e.salary, m.name AS manager, m.salary AS manager_salary FROM staff e JOIN staff m ON m.id = e.manager_id WHERE e.salary > m.salary;

-- OUTPUT:
-- employee | salary | manager | manager_salary
-- Kiran    |  90000 | Ravi    |          80000`]
    ),

    'Multiple Joins & Many-to-Many Joins': dv(
        [`With several joins, the optimizer evaluates many possible join orders (up to <code>optimizer_search_depth</code>) and picks the cheapest from table statistics. The SQL text order is only logical; the executor may start from the most selective table.`,
            r`EXPLAIN FORMAT=TREE
SELECT s.name, c.title FROM students s JOIN enrolments e ON e.student_id = s.id JOIN courses c ON c.id = e.course_id WHERE c.title = 'SQL';

-- OUTPUT: (example)
-- -> Nested loop inner join
--     -> Nested loop inner join
--         -> Filter: (c.title = 'SQL') -> Table scan on c
--         -> Index lookup on e using idx_course (course_id=c.id)
--     -> Single-row index lookup on s using PRIMARY (id=e.student_id)`],
        [`Many-to-many queries join through the junction table. Variants: students per course, courses per student, students with all of several courses, students with none.`,
            r`SELECT s.name FROM students s JOIN enrolments e ON e.student_id = s.id JOIN courses c ON c.id = e.course_id
WHERE c.title IN ('SQL','Java') GROUP BY s.id, s.name HAVING COUNT(DISTINCT c.id) = 2;
SELECT c.title, COUNT(*) AS students, GROUP_CONCAT(s.name ORDER BY s.name) AS names FROM courses c JOIN enrolments e ON e.course_id = c.id JOIN students s ON s.id = e.student_id GROUP BY c.id, c.title;

-- OUTPUT:
-- name
-- Asha`],
        [`Mistakes: fan-out when joining two one-to-many branches (totals multiply), mixing INNER and LEFT joins so an inner join discards the preserved rows, and selecting wide columns through many joins. Aggregate branches separately.`,
            r`SELECT o.id, SUM(i.qty * i.unit_price) AS items_total, SUM(p.amount) AS paid FROM orders o JOIN order_items i ON i.order_id = o.id JOIN payments p ON p.order_id = o.id GROUP BY o.id;
-- both sums are inflated (every item row repeats for every payment row)

-- OUTPUT:
-- id | items_total | paid
--  1 |        1800 | 1800        (true values are 900 and 900)`],
        [`Tune many-join queries from the plan: find the step with the largest actual rows, add the missing index, filter earlier, and reduce selected columns. Only if the optimizer keeps a bad order consider <code>STRAIGHT_JOIN</code> or hints.`,
            r`EXPLAIN ANALYZE SELECT ... ;                                  -- find the biggest actual rows step
SELECT /*+ JOIN_ORDER(c, e, s) */ s.name FROM students s JOIN enrolments e ON e.student_id = s.id JOIN courses c ON c.id = e.course_id WHERE c.title = 'SQL';

-- OUTPUT:
-- (the hint forces courses first because the title filter is the most selective)`],
        [`Real-world: a report of orders with customer, products and payment status. Pre-aggregate items and payments in derived tables, then join them to orders one-to-one.`,
            r`SELECT o.id, c.name, i.items_total, COALESCE(p.paid, 0) AS paid
FROM orders o JOIN customers c ON c.id = o.customer_id
JOIN (SELECT order_id, SUM(qty * unit_price) AS items_total FROM order_items GROUP BY order_id) i ON i.order_id = o.id
LEFT JOIN (SELECT order_id, SUM(amount) AS paid FROM payments GROUP BY order_id) p ON p.order_id = o.id WHERE o.created_at >= '2026-05-01';

-- OUTPUT:
-- id | name | items_total | paid
--  1 | Asha |      900.00 | 900.00`]
    ),

    'Join vs Subquery & Join Performance': dv(
        [`Since MySQL 8, many subqueries are transformed into joins internally: IN and EXISTS become semijoins, NOT EXISTS becomes an antijoin, and simple derived tables are merged. So the choice between join and subquery is mostly about clarity, not speed; the plan decides performance.`,
            r`EXPLAIN FORMAT=TREE SELECT name FROM customers WHERE id IN (SELECT customer_id FROM orders WHERE total > 1000);

-- OUTPUT: (example)
-- -> Nested loop semijoin
--     -> Filter: (orders.total > 1000) -> Table scan on orders
--     -> Single-row index lookup on customers using PRIMARY (id=orders.customer_id)`],
        [`Equivalent forms: JOIN with DISTINCT, IN, EXISTS, and a derived table. They differ in duplicates: a join repeats parents per child, while IN/EXISTS return each parent once.`,
            r`SELECT DISTINCT c.name FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.total > 1000;
SELECT c.name FROM customers c WHERE c.id IN (SELECT customer_id FROM orders WHERE total > 1000);
SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 1000);

-- OUTPUT: (all three)
-- name
-- Asha`],
        [`Mistakes: correlated subqueries in the SELECT list that run once per row, derived tables that cannot be merged and are materialized, and assuming one form is always faster. Test with EXPLAIN ANALYZE on realistic data.`,
            r`SELECT c.id, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS orders FROM customers c;                  -- one subquery per customer
SELECT c.id, COALESCE(x.n, 0) AS orders FROM customers c LEFT JOIN (SELECT customer_id, COUNT(*) AS n FROM orders GROUP BY customer_id) x ON x.customer_id = c.id;

-- OUTPUT:
-- id | orders
--  1 | 9`],
        [`Hash joins (8.0.18+) help when no index exists on the inner join column; indexes still win for selective lookups. Check which algorithm was chosen and adjust buffers only for heavy reports.`,
            r`EXPLAIN FORMAT=TREE SELECT COUNT(*) FROM big_a a JOIN big_b b ON b.val = a.val;
SET SESSION join_buffer_size = 64 * 1024 * 1024;

-- OUTPUT: (example)
-- -> Inner hash join (b.val = a.val)
--     -> Table scan on b
--     -> Hash -> Table scan on a`],
        [`Real-world decision rule: use EXISTS for "has at least one", a join when you need columns from both sides, a derived table to aggregate one side first, and always confirm with the plan on production-sized data.`,
            r`-- need orders columns too: join
SELECT c.name, o.id, o.total FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.total > 1000;
-- only need the customers: EXISTS
SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 1000);

-- OUTPUT:
-- name | id | total
-- Asha | 77 | 1500.00`]
    ),

    'Scalar & Single-Row Subqueries': dv(
        [`A scalar subquery returns one column and at most one row and can be used as a value. If it does not depend on the outer query it is evaluated once and the result is cached; if it returns more than one row you get error 1242, and no rows becomes NULL.`,
            r`SELECT name, salary FROM emp WHERE salary > (SELECT AVG(salary) FROM emp);
SELECT (SELECT MAX(salary) FROM emp) AS top, (SELECT COUNT(*) FROM emp) AS headcount;
EXPLAIN SELECT name FROM emp WHERE salary > (SELECT AVG(salary) FROM emp);

-- OUTPUT:
-- name  | salary
-- Asha  |  60000
-- Meena |  70000
-- (EXPLAIN: select_type SUBQUERY, evaluated once)`],
        [`Where it can appear: WHERE, HAVING, SELECT list, ORDER BY, SET of an UPDATE and VALUES of an INSERT. Use LIMIT 1 or aggregates to guarantee a single row, and COALESCE for the empty case.`,
            r`UPDATE emp SET salary = (SELECT AVG(salary) FROM emp WHERE dept = 10) WHERE id = 99;
INSERT INTO audit (action, at) VALUES ('count', (SELECT COUNT(*) FROM emp));
SELECT name, (SELECT name FROM departments WHERE id = emp.dept LIMIT 1) AS dept_name FROM emp;

-- OUTPUT:
-- Query OK, 1 row affected`],
        [`Mistakes: a subquery returning several rows, relying on the first row without ORDER BY, and correlated scalar subqueries in the SELECT list on big tables. Make the single-row guarantee explicit.`,
            r`SELECT name FROM emp WHERE salary = (SELECT salary FROM emp WHERE dept = 10);

-- OUTPUT:
-- ERROR 1242 (21000): Subquery returns more than 1 row

SELECT name FROM emp WHERE salary = (SELECT MAX(salary) FROM emp WHERE dept = 10);`],
        [`An uncorrelated scalar subquery costs one evaluation; a correlated one costs one per outer row. Replace correlated scalars with a join to an aggregated derived table or a window function.`,
            r`SELECT e.name, e.salary, ROUND(e.salary - AVG(e.salary) OVER (PARTITION BY e.dept), 0) AS diff_from_dept_avg FROM emp e;

-- OUTPUT:
-- name  | salary | diff_from_dept_avg
-- Asha  |  60000 |               7500
-- Ravi  |  45000 |              -7500`],
        [`Real-world: compare each row to a global baseline, such as orders above the average order value this month.`,
            r`SELECT id, total FROM orders WHERE created_at >= '2026-05-01' AND total > (SELECT AVG(total) FROM orders WHERE created_at >= '2026-05-01') ORDER BY total DESC LIMIT 5;

-- OUTPUT:
-- id | total
-- 77 | 1500.00`]
    ),

    'Multi-Row Subqueries with IN': dv(
        [`An IN subquery returns a set of values. The optimizer converts it to a semijoin and can execute it with FirstMatch, LooseScan, Materialization or DuplicateWeedout strategies, or as a plain index lookup into the subquery results, whichever is cheapest.`,
            r`EXPLAIN FORMAT=TREE SELECT name FROM emp WHERE dept IN (SELECT id FROM departments WHERE active = 1);

-- OUTPUT: (example)
-- -> Nested loop semijoin
--     -> Filter: (departments.active = 1) -> Table scan on departments
--     -> Index lookup on emp using idx_dept (dept=departments.id)`],
        [`Forms: single column IN, tuple IN, NOT IN, <code>= ANY</code> (same as IN), and IN with a literal list. Tuples compare several columns at once.`,
            r`SELECT name FROM emp WHERE (dept, salary) IN (SELECT dept, MAX(salary) FROM emp GROUP BY dept);
SELECT name FROM emp WHERE dept = ANY (SELECT id FROM departments WHERE city = 'Pune');
SELECT name FROM emp WHERE dept NOT IN (SELECT id FROM departments WHERE active = 0);

-- OUTPUT:
-- name
-- Asha
-- Meena`],
        [`The classic bug: NOT IN with a NULL in the subquery returns no rows because x NOT IN (1, NULL) is unknown. Filter NULLs or use NOT EXISTS.`,
            r`SELECT id FROM departments WHERE id NOT IN (SELECT dept FROM emp);                                       -- emp.dept has a NULL: empty
SELECT id FROM departments d WHERE NOT EXISTS (SELECT 1 FROM emp e WHERE e.dept = d.id);                   -- correct

-- OUTPUT:
-- Empty set
-- id
-- 30`],
        [`A large IN subquery result is materialized into a temporary table with a unique index and probed. When the subquery side is huge, flip it: drive from the smaller set or join explicitly.`,
            r`EXPLAIN SELECT id FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE country = 'IN');
SELECT o.id FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.country = 'IN';

-- OUTPUT: (example)
-- both choose: customers (filtered) drive an index lookup into orders`],
        [`Real-world: orders for customers in a segment, a typical filter from a marketing tool. Keep the subquery selective and indexed.`,
            r`SELECT id, total FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE segment = 'VIP' AND active = 1) AND created_at >= '2026-05-01';
ALTER TABLE customers ADD INDEX idx_segment_active (segment, active);

-- OUTPUT:
-- id | total
-- 41 | 980.00`]
    ),

    'Correlated Subqueries': dv(
        [`A correlated subquery references a column from the outer query, so it must be re-evaluated for each outer row (dependent subquery). MySQL may decorrelate simple cases into joins, but in general cost equals outer rows times the cost of one inner execution.`,
            r`EXPLAIN SELECT e.name FROM emp e WHERE e.salary > (SELECT AVG(x.salary) FROM emp x WHERE x.dept = e.dept);

-- OUTPUT: (example)
-- id | select_type        | table | type | key      | Extra
--  1 | PRIMARY            | e     | ALL  | NULL     |
--  2 | DEPENDENT SUBQUERY | x     | ref  | idx_dept | Using index condition`],
        [`Typical forms: above own group average, latest row per key, existence checks with EXISTS, and top per group. Correlated EXISTS short-circuits at the first match.`,
            r`SELECT o.* FROM orders o WHERE o.created_at = (SELECT MAX(created_at) FROM orders WHERE customer_id = o.customer_id);
SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'PAID');
SELECT e.name FROM emp e WHERE 2 > (SELECT COUNT(*) FROM emp x WHERE x.dept = e.dept AND x.salary > e.salary);

-- OUTPUT:
-- (latest order per customer; customers with a paid order; the top 2 earners per department)`],
        [`Mistakes: correlated subqueries on unindexed columns (quadratic work), ties in "latest row" queries returning several rows, and assuming results are cached. Index the inner correlation column and add a tiebreaker.`,
            r`SELECT o.* FROM orders o WHERE o.created_at = (SELECT MAX(created_at) FROM orders WHERE customer_id = o.customer_id);   -- ties return 2 rows
ALTER TABLE orders ADD INDEX idx_customer_created (customer_id, created_at, id);

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Rewrite with a window function or a join to a grouped derived table; both scan the data once.`,
            r`SELECT name FROM (SELECT name, salary, AVG(salary) OVER (PARTITION BY dept) AS a FROM emp) t WHERE salary > a;
SELECT e.name FROM emp e JOIN (SELECT dept, AVG(salary) AS a FROM emp GROUP BY dept) d ON d.dept = e.dept WHERE e.salary > d.a;

-- OUTPUT:
-- name
-- Asha`],
        [`Real-world: top 3 recent orders per customer using a correlated count, then the faster window version for large data.`,
            r`SELECT o.id, o.customer_id FROM orders o WHERE (SELECT COUNT(*) FROM orders x WHERE x.customer_id = o.customer_id AND (x.created_at, x.id) > (o.created_at, o.id)) < 3;
SELECT id, customer_id FROM (SELECT id, customer_id, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn FROM orders) t WHERE rn <= 3;

-- OUTPUT:
-- id | customer_id
-- 77 |           1`]
    ),

    'EXISTS Subqueries': dv(
        [`EXISTS tests whether the subquery returns at least one row and stops at the first match. MySQL turns EXISTS into a semijoin and NOT EXISTS into an antijoin, so the inner side is typically a single index probe per outer row.`,
            r`EXPLAIN FORMAT=TREE SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT: (example)
-- -> Nested loop semijoin
--     -> Table scan on c
--     -> Single-row covering index lookup on o using idx_customer (customer_id=c.id)  (LooseScan/FirstMatch)`],
        [`Variants: EXISTS, NOT EXISTS, nested EXISTS for "for all" logic (relational division), and EXISTS combined with extra conditions. The select list is irrelevant; <code>SELECT 1</code> is a convention.`,
            r`SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.featured = 1 AND NOT EXISTS (SELECT 1 FROM order_items i JOIN orders o ON o.id = i.order_id WHERE o.customer_id = c.id AND i.product_id = p.id));

-- OUTPUT:
-- name
-- Asha         (customers who bought every featured product)`],
        [`Mistakes: forgetting the correlation (the subquery is then true for everyone or no one), using COUNT(*) &gt; 0 instead of EXISTS, and NOT IN where NOT EXISTS is needed. Always reference the outer row.`,
            r`SELECT name FROM customers WHERE EXISTS (SELECT 1 FROM orders);                        -- true for all customers if any order exists
SELECT name FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) > 0;   -- counts everything
SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);        -- stops at first row

-- OUTPUT:
-- (first query ignores the relationship)`],
        [`EXISTS needs an index on the inner correlated column to be cheap. Check that the plan shows an index lookup, not a table scan, on the inner table.`,
            r`ALTER TABLE orders ADD INDEX idx_customer_status (customer_id, status);
EXPLAIN SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'PAID');

-- OUTPUT: (example)
-- table | type | key                | Extra
-- o     | ref  | idx_customer_status| Using index; FirstMatch(c)`],
        [`Real-world: access control. Show documents the user owns or that were shared with them, using EXISTS so each document appears once.`,
            r`SELECT d.id, d.title FROM documents d WHERE d.owner_id = 7 OR EXISTS (SELECT 1 FROM document_shares s WHERE s.document_id = d.id AND s.user_id = 7);

-- OUTPUT:
-- id | title
--  4 | Roadmap`]
    ),

    'ANY & ALL Subqueries': dv(
        [`<code>x &gt; ANY (set)</code> is true if x is greater than at least one value, which equals <code>x &gt; MIN(set)</code>; <code>x &gt; ALL (set)</code> is true if greater than every value, which equals <code>x &gt; MAX(set)</code>. On an empty set ALL is true and ANY is false.`,
            r`SELECT 5 > ANY (SELECT 3 UNION SELECT 9) AS any_gt, 5 > ALL (SELECT 3 UNION SELECT 9) AS all_gt, 5 > ALL (SELECT 1 WHERE 1 = 0) AS all_empty, 5 = ANY (SELECT 5 UNION SELECT 7) AS eq_any;

-- OUTPUT:
-- any_gt | all_gt | all_empty | eq_any
--      1 |      0 |         1 |      1`],
        [`<code>= ANY</code> is IN, <code>&lt;&gt; ALL</code> is NOT IN. The optimizer often rewrites ANY/ALL with MIN/MAX. Writing MIN/MAX explicitly is clearer and handles NULL intent.`,
            r`SELECT name FROM emp WHERE salary > ALL (SELECT salary FROM emp WHERE dept = 20);
SELECT name FROM emp WHERE salary > (SELECT MAX(salary) FROM emp WHERE dept = 20);
SELECT name FROM emp WHERE salary > ANY (SELECT salary FROM emp WHERE dept = 10);
SELECT name FROM emp WHERE salary > (SELECT MIN(salary) FROM emp WHERE dept = 10);

-- OUTPUT: (pairs return the same rows)`],
        [`Mistakes: NULLs inside the set (ALL becomes unknown), empty sets giving surprising true results, and using ALL where NOT EXISTS is intended. Filter NULLs explicitly.`,
            r`SELECT 5 > ALL (SELECT 3 UNION SELECT NULL) AS result;
SELECT 5 > ALL (SELECT salary FROM emp WHERE dept = 99) AS empty_is_true;

-- OUTPUT:
-- result
-- NULL
-- empty_is_true
-- 1`],
        [`MIN/MAX form lets the optimizer use index ends and avoid materializing a subquery set. Prefer it for performance and clarity.`,
            r`EXPLAIN SELECT name FROM emp WHERE salary > (SELECT MAX(salary) FROM emp WHERE dept = 20);

-- OUTPUT: (example)
-- select_type | table | type  | Extra
-- SUBQUERY    | emp   | ref   | Select tables optimized away? (MAX uses idx_dept_salary)`],
        [`Real-world: find products priced above every competitor price, or employees paid more than anyone in a given team, written with MAX for readability.`,
            r`SELECT p.name FROM products p WHERE p.price > (SELECT MAX(price) FROM competitor_prices c WHERE c.product_id = p.id);

-- OUTPUT:
-- name
-- Premium Pen`]
    ),

    'UNION vs UNION ALL': dv(
        [`UNION ALL simply concatenates the result sets of its branches. UNION must also remove duplicates, so the server writes rows into a temporary table with a unique key (or sorts), which costs memory, CPU and sometimes disk. Branch column names come from the first SELECT.`,
            r`SELECT name FROM emp WHERE dept = 10
UNION ALL
SELECT name FROM emp WHERE salary > 50000;
EXPLAIN SELECT name FROM emp WHERE dept = 10 UNION SELECT name FROM emp WHERE salary > 50000;

-- OUTPUT:
-- name
-- Asha
-- Ravi
-- Meena
-- Asha          (UNION ALL keeps the duplicate)
-- EXPLAIN: UNION RESULT <union1,2> uses a temporary table`],
        [`Combine more than two branches, give individual branches ORDER BY/LIMIT with parentheses, sort the final result once, and add a literal column to label the source of each row.`,
            r`(SELECT id, 'emp' AS src, name FROM emp ORDER BY id LIMIT 2)
UNION ALL
(SELECT id, 'cust' AS src, name FROM customers ORDER BY id LIMIT 2)
ORDER BY src, id;

-- OUTPUT:
-- id | src  | name
--  1 | cust | Asha
--  2 | cust | Ravi
--  1 | emp  | Asha
--  2 | emp  | Ravi`],
        [`Mistakes: UNION when duplicates cannot occur (wasted work), mismatched column counts or types, ORDER BY on a branch without parentheses, and expecting UNION to keep the order of branches. Default to UNION ALL.`,
            r`SELECT id, name FROM emp UNION SELECT id FROM customers;

-- OUTPUT:
-- ERROR 1222 (21000): The used SELECT statements have a different number of columns

SELECT id FROM emp UNION SELECT name FROM customers;       -- types converted to a common (string) type`],
        [`A selective OR across two indexed columns can be faster as two index lookups with UNION ALL, adding a guard in the second branch to avoid duplicates.`,
            r`SELECT id FROM orders WHERE customer_id = 7
UNION ALL
SELECT id FROM orders WHERE sales_rep_id = 9 AND (customer_id <> 7 OR customer_id IS NULL);

-- OUTPUT: (explain, example)
-- two ref lookups (idx_customer, idx_rep) instead of a full scan`],
        [`Real-world: a combined activity feed from several tables, each branch limited and indexed, merged and sorted by time.`,
            r`SELECT * FROM (
  (SELECT created_at, 'order' AS kind, id FROM orders WHERE customer_id = 7 ORDER BY created_at DESC LIMIT 20)
  UNION ALL (SELECT created_at, 'ticket', id FROM tickets WHERE customer_id = 7 ORDER BY created_at DESC LIMIT 20)
  UNION ALL (SELECT created_at, 'review', id FROM reviews WHERE customer_id = 7 ORDER BY created_at DESC LIMIT 20)) f
ORDER BY created_at DESC LIMIT 20;

-- OUTPUT:
-- created_at          | kind   | id
-- 2026-05-01 09:58:00 | order  | 77`]
    ),

    'INTERSECT & EXCEPT': dv(
        [`INTERSECT returns distinct rows present in both inputs; EXCEPT returns distinct rows from the first input that are absent from the second. They compare entire rows and treat NULLs as equal. MySQL supports them from 8.0.31; the server implements them with temporary tables.`,
            r`SELECT dept FROM emp WHERE salary > 50000
INTERSECT
SELECT dept FROM emp WHERE name LIKE 'A%';

SELECT id FROM emp
EXCEPT
SELECT id FROM emp WHERE salary > 50000;

-- OUTPUT:
-- dept
-- 10
-- id
-- 2`],
        [`Add <code>ALL</code> to keep duplicates (multiset semantics). Precedence: INTERSECT binds tighter than UNION and EXCEPT; use parentheses to be explicit.`,
            r`(SELECT id FROM a) INTERSECT ALL (SELECT id FROM b);
(SELECT id FROM a) EXCEPT ALL (SELECT id FROM b);
(SELECT id FROM a UNION SELECT id FROM b) EXCEPT (SELECT id FROM c);

-- OUTPUT:
-- (rows according to multiset rules, parentheses make the intent explicit)`],
        [`Mistakes: using them on MySQL older than 8.0.31, comparing too many columns (extra columns make rows distinct), and expecting column-by-name matching. Match columns by position and select only the keys you compare.`,
            r`-- emulate for older versions
SELECT DISTINCT e.id FROM emp e WHERE EXISTS (SELECT 1 FROM emp x WHERE x.id = e.id AND x.salary > 50000);          -- INTERSECT
SELECT e.id FROM emp e WHERE NOT EXISTS (SELECT 1 FROM emp x WHERE x.id = e.id AND x.salary > 50000);             -- EXCEPT

-- OUTPUT:
-- same rows as the native operators`],
        [`For reconciliation of large tables compare keys and a hash of the remaining columns instead of all columns, keeping the set operation narrow and fast.`,
            r`SELECT id, MD5(CONCAT_WS('|', amount, status, updated_at)) AS h FROM src_payments
EXCEPT
SELECT id, MD5(CONCAT_WS('|', amount, status, updated_at)) FROM dst_payments;

-- OUTPUT:
-- id | h
--  9 | 2a9f...        (missing or different in the destination)`],
        [`Real-world data audit: customers who exist in the CRM but not in billing, and customers present in both systems.`,
            r`SELECT email FROM crm_customers EXCEPT SELECT email FROM billing_customers;
SELECT email FROM crm_customers INTERSECT SELECT email FROM billing_customers;

-- OUTPUT:
-- email
-- new.user@x.com`]
    ),

    'Column Compatibility & Duplicate Handling': dv(
        [`Set operations match columns by position, require the same count and convert types to a common type (numbers with strings become strings). The result column names come from the first branch. UNION/INTERSECT/EXCEPT remove duplicates across all columns; the ALL variants keep them.`,
            r`SELECT 1 AS v UNION SELECT 'a';
SELECT 1.5 AS v UNION SELECT 2;
SELECT CAST(1 AS CHAR) = '1' AS compat, COLLATION('a') AS coll;

-- OUTPUT:
-- v
-- 1
-- a          (the common type is string)
-- v
-- 1.5
-- 2.0`],
        [`Align branches explicitly: pad missing columns with NULL or a literal of the right type, cast to a common type, align collations, and add a source label so you can tell rows apart.`,
            r`SELECT id, name, CAST(NULL AS CHAR(20)) AS phone, 'emp' AS src FROM emp
UNION ALL
SELECT id, name, phone, 'cust' FROM customers;
SELECT code COLLATE utf8mb4_0900_ai_ci FROM t1 UNION SELECT code COLLATE utf8mb4_0900_ai_ci FROM t2;

-- OUTPUT:
-- id | name | phone | src
--  1 | Asha | NULL  | emp
--  1 | Asha | 9999  | cust`],
        [`Mistakes: relying on implicit casts that change sort order, forgetting that different extra columns make duplicate rows distinct, and comparing branches whose column order differs. Normalise before the union.`,
            r`SELECT name, 'x' AS tag FROM a UNION SELECT name, 'y' FROM b;      -- same names appear twice: tag differs

-- OUTPUT:
-- name | tag
-- Asha | x
-- Asha | y`],
        [`To deduplicate by a business key (not the whole row) after UNION ALL, rank rows and keep one per key, with an index-friendly ordering rule.`,
            r`SELECT id, name FROM (
  SELECT id, name, ROW_NUMBER() OVER (PARTITION BY id ORDER BY updated_at DESC) AS rn
  FROM (SELECT id, name, updated_at FROM staff_a UNION ALL SELECT id, name, updated_at FROM staff_b) u) t WHERE rn = 1;

-- OUTPUT:
-- id | name
--  1 | Asha          (newest version of each id)`],
        [`Real-world: merging data from two systems during a migration, labelling the origin and resolving duplicates by priority so the target table receives one clean row per key.`,
            r`INSERT INTO customers_merged (email, name, source)
SELECT email, name, source FROM (
  SELECT email, name, 'crm' AS source, 1 AS prio FROM crm_customers
  UNION ALL SELECT email, name, 'billing', 2 FROM billing_customers) u
WHERE (email, prio) IN (SELECT email, MIN(prio) FROM (SELECT email, 1 AS prio FROM crm_customers UNION ALL SELECT email, 2 FROM billing_customers) z GROUP BY email);

-- OUTPUT:
-- Query OK, 12044 rows affected`]
    )
};
