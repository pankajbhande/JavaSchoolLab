// Module 11 (Joins), part A: INNER, LEFT, RIGHT, CROSS.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s11a: Record<string, DeepDive> = {
    'INNER JOIN': dd(
        [`An <b>INNER JOIN</b> combines rows from two tables where the <code>ON</code> condition is true. Rows without a match on either side are dropped. Plain <code>JOIN</code> means INNER JOIN.`,
            r`CREATE TABLE dept (id INT PRIMARY KEY, name VARCHAR(10));
CREATE TABLE emp  (id INT PRIMARY KEY, name VARCHAR(10), dept_id INT);
INSERT INTO dept VALUES (1,'IT'), (2,'HR'), (3,'Legal');
INSERT INTO emp  VALUES (1,'Asha',1), (2,'Ravi',1), (3,'Meena',2), (4,'John',NULL);

SELECT e.name AS employee, d.name AS department
FROM emp e
INNER JOIN dept d ON d.id = e.dept_id;    -- match emp.dept_id to dept.id

-- OUTPUT:
-- +----------+------------+
-- | employee | department |
-- +----------+------------+
-- | Asha     | IT         |
-- | Ravi     | IT         |
-- | Meena    | HR         |
-- +----------+------------+
-- John (no dept) and Legal (no staff) are both missing.`],
        [`Normalised data is split across tables (employees in one, departments in another). Joins put it back together at query time without storing the same department name many times.`,
            r`-- Without a join you would need two queries and manual matching in code:
--   SELECT * FROM emp;   SELECT * FROM dept;
-- With a join the server pairs them and can filter on both tables at once:
SELECT e.name, d.name AS dept
FROM emp e JOIN dept d ON d.id = e.dept_id      -- JOIN = INNER JOIN
WHERE d.name = 'IT';                            -- filter by a column of the other table

-- OUTPUT:
-- +------+------+
-- | name | dept |
-- +------+------+
-- | Asha | IT   |
-- | Ravi | IT   |
-- +------+------+`],
        [`Orders with customer names, invoices with line items, students with courses: any report that needs attributes from two related entities.`,
            r`CREATE TABLE customer (id INT PRIMARY KEY, name VARCHAR(10));
CREATE TABLE orders   (id INT PRIMARY KEY, customer_id INT, total INT);
INSERT INTO customer VALUES (1,'Asha'), (2,'Ravi');
INSERT INTO orders   VALUES (10,1,500), (11,1,300), (12,2,200);

SELECT c.name, COUNT(*) AS orders_placed, SUM(o.total) AS spent
FROM customer c
JOIN orders o ON o.customer_id = c.id     -- every order finds its customer
GROUP BY c.id, c.name
ORDER BY spent DESC;

-- OUTPUT:
-- +------+---------------+-------+
-- | name | orders_placed | spent |
-- +------+---------------+-------+
-- | Asha |             2 |   800 |
-- | Ravi |             1 |   200 |
-- +------+---------------+-------+`],
        [`<b>Advantages:</b> returns only complete, related data; the optimiser can reorder INNER joins freely and use indexes on either side; it is the most common and best-optimised join.`,
            r`-- Equivalent old-style syntax (comma join + WHERE). Same plan, but easy to forget the condition.
SELECT e.name, d.name AS dept
FROM emp e, dept d
WHERE d.id = e.dept_id;

-- Preferred explicit syntax keeps join logic apart from row filters:
SELECT e.name, d.name AS dept FROM emp e JOIN dept d ON d.id = e.dept_id;

-- OUTPUT (both):
-- +-------+------+
-- | name  | dept |
-- +-------+------+
-- | Asha  | IT   |
-- | Ravi  | IT   |
-- | Meena | HR   |
-- +-------+------+`],
        [`<b>Disadvantages:</b> silently loses unmatched rows (employees with a NULL department disappear from reports), and a one-to-many join multiplies parent rows.`,
            r`-- Parent columns repeat once per child, so SUM on the parent side over-counts:
CREATE TABLE budget (dept_id INT PRIMARY KEY, amount INT);
INSERT INTO budget VALUES (1, 1000), (2, 500);

SELECT SUM(b.amount) AS wrong_total     -- IT budget counted twice (two IT employees)
FROM budget b JOIN emp e ON e.dept_id = b.dept_id;

-- OUTPUT:
-- +-------------+
-- | wrong_total |
-- +-------------+
-- |        2500 |   <- expected 1500
-- +-------------+`],
        [`<b>Limitations:</b> <code>NULL</code> never equals <code>NULL</code>, so NULL keys never match; joining on mismatched types or collations can disable index use; a missing <code>ON</code> in MySQL acts like a cross join.`,
            r`-- NULL = NULL is not true, so John (dept_id NULL) matches nothing
SELECT COUNT(*) AS matched
FROM emp e JOIN dept d ON e.dept_id = d.id;

-- Null-safe equality operator <=> would match NULL with NULL (rarely wanted for keys)
SELECT NULL = NULL AS plain_eq, NULL <=> NULL AS null_safe_eq;

-- OUTPUT:
-- +---------+
-- | matched |
-- +---------+
-- |       3 |
-- +---------+
-- +----------+--------------+
-- | plain_eq | null_safe_eq |
-- +----------+--------------+
-- | NULL     |            1 |
-- +----------+--------------+`],
        `
   emp                         dept
   +----+-------+---------+    +----+-------+
   | 1  | Asha  | 1  -----+--> | 1  | IT    |
   | 2  | Ravi  | 1  -----+    | 2  | HR    |
   | 3  | Meena | 2  ---------> | 3  | Legal |  (no match: dropped)
   | 4  | John  | NULL (dropped)+----+-------+
   +----+-------+---------+

   INNER JOIN = the overlap of the two circles only
`,
        `Index the join column on the child (foreign key) side and make types and collations identical on both sides. Prefer explicit JOIN ... ON over comma joins, and when aggregating parent values across a one-to-many join, aggregate in a derived table first to avoid fan-out errors.`
    ),

    'LEFT JOIN': dd(
        [`A <b>LEFT JOIN</b> (LEFT OUTER JOIN) keeps every row of the left table; when no right row matches, the right-side columns are filled with NULL.`,
            r`CREATE TABLE dept (id INT PRIMARY KEY, name VARCHAR(10));
CREATE TABLE emp  (id INT PRIMARY KEY, name VARCHAR(10), dept_id INT);
INSERT INTO dept VALUES (1,'IT'), (2,'HR'), (3,'Legal');
INSERT INTO emp  VALUES (1,'Asha',1), (2,'Ravi',1), (3,'Meena',2), (4,'John',NULL);

SELECT e.name AS employee, d.name AS department
FROM emp e
LEFT JOIN dept d ON d.id = e.dept_id;     -- all employees, even without a department

-- OUTPUT:
-- +----------+------------+
-- | employee | department |
-- +----------+------------+
-- | Asha     | IT         |
-- | Ravi     | IT         |
-- | Meena    | HR         |
-- | John     | NULL       |
-- +----------+------------+`],
        [`Reports often must show everything on the main side, including items with no related rows: customers who never ordered, products never sold, employees not yet assigned.`,
            r`-- Anti-join: find rows with NO match (left join then keep the NULLs)
SELECT d.name AS empty_department
FROM dept d
LEFT JOIN emp e ON e.dept_id = d.id
WHERE e.id IS NULL;                    -- no employee row was found

-- OUTPUT:
-- +------------------+
-- | empty_department |
-- +------------------+
-- | Legal            |
-- +------------------+`],
        [`"Customers with their order count including zero", "all days with and without sales" (calendar table left joined to facts), and optional profile data.`,
            r`CREATE TABLE customer (id INT PRIMARY KEY, name VARCHAR(10));
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, total INT);
INSERT INTO customer VALUES (1,'Asha'), (2,'Ravi'), (3,'Zoya');
INSERT INTO orders VALUES (10,1,500), (11,1,300), (12,2,200);

SELECT c.name,
       COUNT(o.id)             AS orders_placed,   -- COUNT(column) ignores NULL, so Zoya gets 0
       COALESCE(SUM(o.total),0) AS spent
FROM customer c LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name;

-- OUTPUT:
-- +------+---------------+-------+
-- | name | orders_placed | spent |
-- +------+---------------+-------+
-- | Asha |             2 |   800 |
-- | Ravi |             1 |   200 |
-- | Zoya |             0 |     0 |
-- +------+---------------+-------+`],
        [`<b>Advantages:</b> no data loss on the preserved side, makes missing relationships visible, and is the basis of the "find orphans" anti-join pattern.`,
            r`-- Filter on the right table in ON (keeps left rows) rather than WHERE (drops them)
SELECT d.name, e.name AS employee
FROM dept d
LEFT JOIN emp e ON e.dept_id = d.id AND e.name LIKE 'A%'   -- condition inside ON
ORDER BY d.id;

-- OUTPUT:
-- +-------+----------+
-- | name  | employee |
-- +-------+----------+
-- | IT    | Asha     |
-- | HR    | NULL     |
-- | Legal | NULL     |
-- +-------+----------+`],
        [`<b>Disadvantages:</b> a condition on the right table in <code>WHERE</code> silently turns the query back into an INNER JOIN, and the optimiser has less freedom to reorder tables.`,
            r`-- BUG: WHERE on the right table removes the NULL rows, so the LEFT JOIN is pointless
SELECT d.name, e.name AS employee
FROM dept d LEFT JOIN emp e ON e.dept_id = d.id
WHERE e.name LIKE 'A%';

-- OUTPUT:
-- +------+----------+
-- | name | employee |
-- +------+----------+
-- | IT   | Asha     |      <- HR and Legal vanished
-- +------+----------+`],
        [`<b>Limitations:</b> NULLs in the result are ambiguous (no match, or a real NULL value), so test the right table's primary key; MySQL has no <code>FULL OUTER JOIN</code> and emulates it with LEFT UNION RIGHT.`,
            r`-- Emulate FULL OUTER JOIN: left join UNION right join (UNION removes the duplicates)
SELECT e.name AS employee, d.name AS department
FROM emp e LEFT JOIN dept d ON d.id = e.dept_id
UNION
SELECT e.name, d.name
FROM emp e RIGHT JOIN dept d ON d.id = e.dept_id;

-- OUTPUT:
-- +----------+------------+
-- | employee | department |
-- +----------+------------+
-- | Asha     | IT         |
-- | Ravi     | IT         |
-- | Meena    | HR         |
-- | John     | NULL       |
-- | NULL     | Legal      |
-- +----------+------------+`],
        `
   customer (LEFT, kept)        orders (RIGHT)
   +----+------+                +-----+-------------+
   | 1  | Asha | ------------>  | 10  | cust 1      |
   | 2  | Ravi | ------------>  | 12  | cust 2      |
   | 3  | Zoya | -- no match -> NULL NULL NULL
   +----+------+                +-----+-------------+

   LEFT JOIN = the whole left circle (overlap + left-only)
`,
        `Choose the side that must be preserved as the left table and put right-table predicates in ON. For anti-joins, LEFT JOIN ... IS NULL and NOT EXISTS usually perform alike in MySQL 8 (it converts both to an anti join), but avoid NOT IN with nullable columns.`
    ),

    'RIGHT JOIN': dd(
        [`A <b>RIGHT JOIN</b> is the mirror image of LEFT JOIN: all rows of the right table are kept and unmatched left columns become NULL.`,
            r`CREATE TABLE dept (id INT PRIMARY KEY, name VARCHAR(10));
CREATE TABLE emp  (id INT PRIMARY KEY, name VARCHAR(10), dept_id INT);
INSERT INTO dept VALUES (1,'IT'), (2,'HR'), (3,'Legal');
INSERT INTO emp  VALUES (1,'Asha',1), (2,'Ravi',1), (3,'Meena',2), (4,'John',NULL);

SELECT e.name AS employee, d.name AS department
FROM emp e
RIGHT JOIN dept d ON d.id = e.dept_id;     -- every department is kept

-- OUTPUT:
-- +----------+------------+
-- | employee | department |
-- +----------+------------+
-- | Asha     | IT         |
-- | Ravi     | IT         |
-- | Meena    | HR         |
-- | NULL     | Legal      |
-- +----------+------------+`],
        [`Sometimes the table you must preserve is the one you wrote second. RIGHT JOIN lets you keep that order, though it can always be rewritten as a LEFT JOIN by swapping the tables.`,
            r`-- These two queries are identical in meaning
SELECT d.name, e.name FROM emp e RIGHT JOIN dept d ON d.id = e.dept_id;
SELECT d.name, e.name FROM dept d LEFT  JOIN emp  e ON d.id = e.dept_id;

-- OUTPUT (both, row order may differ):
-- +-------+-------+
-- | name  | name  |
-- +-------+-------+
-- | IT    | Asha  |
-- | IT    | Ravi  |
-- | HR    | Meena |
-- | Legal | NULL  |
-- +-------+-------+`],
        [`Rare in hand-written code; it appears mostly in generated SQL (ORMs, BI tools) and when extending an existing query by adding a table whose rows must be preserved.`,
            r`-- Count employees per department, showing departments with zero staff
SELECT d.name, COUNT(e.id) AS staff
FROM emp e
RIGHT JOIN dept d ON d.id = e.dept_id
GROUP BY d.id, d.name
ORDER BY d.id;

-- OUTPUT:
-- +-------+-------+
-- | name  | staff |
-- +-------+-------+
-- | IT    |     2 |
-- | HR    |     1 |
-- | Legal |     0 |
-- +-------+-------+`],
        [`<b>Advantages:</b> lets you keep a natural left-to-right table order when the preserved side is last; useful when patching existing queries.`,
            r`-- Adding a RIGHT JOIN to an existing chain keeps the earlier joins untouched
SELECT e.name, d.name AS dept
FROM emp e
JOIN dept d ON d.id = e.dept_id          -- existing inner join
RIGHT JOIN dept all_d ON all_d.id = d.id -- keep every department row (illustrative)
WHERE all_d.name = 'Legal';

-- OUTPUT:
-- +------+------+
-- | name | dept |
-- +------+------+
-- | NULL | NULL |
-- +------+------+`],
        [`<b>Disadvantages:</b> reading order and logic order disagree, which hurts readability; teams commonly ban it in style guides in favour of LEFT JOIN.`,
            r`-- A reader must remember: the table AFTER the keyword is the preserved one.
-- A three-table chain mixing LEFT and RIGHT is hard to reason about:
-- FROM a LEFT JOIN b ON ... RIGHT JOIN c ON ...   -- which side survives?
-- Rewrite with only LEFT JOINs, starting from the table you want to keep:
-- FROM c LEFT JOIN b ON ... LEFT JOIN a ON ...

SELECT 'prefer LEFT JOIN' AS style_guide;

-- OUTPUT:
-- +------------------+
-- | style_guide      |
-- +------------------+
-- | prefer LEFT JOIN |
-- +------------------+`],
        [`<b>Limitations:</b> still no FULL OUTER JOIN; every RIGHT JOIN is internally rewritten to a LEFT JOIN, so it gives no performance benefit.`,
            r`EXPLAIN SELECT e.name, d.name FROM emp e RIGHT JOIN dept d ON d.id = e.dept_id;

-- OUTPUT (example, abbreviated):
-- +----+-------+--------+
-- | id | table | type   |
-- +----+-------+--------+
-- |  1 | d     | ALL    |     <- the preserved table is read first (outer table)
-- |  1 | e     | ALL    |
-- +----+-------+--------+
-- The plan shows dept as the driving table, exactly as if you wrote dept LEFT JOIN emp.`],
        `
   emp (left)                dept (RIGHT, kept)
   +-------+---------+       +----+-------+
   | Asha  | 1  ------------>| 1  | IT    |
   | Meena | 2  ------------>| 2  | HR    |
   | NULL  | NULL  <-no match| 3  | Legal |
   +-------+---------+       +----+-------+

   RIGHT JOIN = whole right circle (overlap + right-only)
`,
        `Standardise on LEFT JOIN across a codebase so every query reads the same way, and let linters flag RIGHT JOIN. Behaviourally they are equivalent, so the choice is purely about maintainability.`
    ),

    'CROSS JOIN': dd(
        [`A <b>CROSS JOIN</b> returns the <i>Cartesian product</i>: every row of the first table paired with every row of the second (n x m rows), with no join condition.`,
            r`CREATE TABLE size  (s VARCHAR(2));
CREATE TABLE color (c VARCHAR(6));
INSERT INTO size  VALUES ('S'), ('M'), ('L');
INSERT INTO color VALUES ('red'), ('blue');

SELECT s, c FROM size CROSS JOIN color ORDER BY s, c;    -- 3 x 2 = 6 rows

-- OUTPUT:
-- +----+------+
-- | s  | c    |
-- +----+------+
-- | L  | blue |
-- | L  | red  |
-- | M  | blue |
-- | M  | red  |
-- | S  | blue |
-- | S  | red  |
-- +----+------+`],
        [`Some tasks truly need every combination: product variants, test-data generation, calendars (dates x stores), matrix-style reports.`,
            r`-- Generate every (store, day) pair so missing sales can later show as zero
CREATE TABLE store (id INT PRIMARY KEY);
CREATE TABLE day_list (d DATE PRIMARY KEY);
INSERT INTO store VALUES (1), (2);
INSERT INTO day_list VALUES ('2024-05-01'), ('2024-05-02');

SELECT s.id AS store_id, dl.d AS day
FROM store s CROSS JOIN day_list dl
ORDER BY s.id, dl.d;

-- OUTPUT:
-- +----------+------------+
-- | store_id | day        |
-- +----------+------------+
-- |        1 | 2024-05-01 |
-- |        1 | 2024-05-02 |
-- |        2 | 2024-05-01 |
-- |        2 | 2024-05-02 |
-- +----------+------------+`],
        [`Used to build SKU grids, scheduling slots, number tables, and "all employees x all months" skeletons that are then LEFT JOINed with facts.`,
            r`-- Skeleton + LEFT JOIN fact pattern: show zero where nothing happened
CREATE TABLE sales (store_id INT, d DATE, amt INT);
INSERT INTO sales VALUES (1,'2024-05-01',100), (2,'2024-05-02',70);

SELECT s.id AS store_id, dl.d AS day, COALESCE(x.amt, 0) AS amount
FROM store s
CROSS JOIN day_list dl
LEFT JOIN sales x ON x.store_id = s.id AND x.d = dl.d
ORDER BY s.id, dl.d;

-- OUTPUT:
-- +----------+------------+--------+
-- | store_id | day        | amount |
-- +----------+------------+--------+
-- |        1 | 2024-05-01 |    100 |
-- |        1 | 2024-05-02 |      0 |
-- |        2 | 2024-05-01 |      0 |
-- |        2 | 2024-05-02 |     70 |
-- +----------+------------+--------+`],
        [`<b>Advantages:</b> simple, produces complete combination sets, and the planner treats it like any other join when a WHERE condition links the tables.`,
            r`-- In MySQL, CROSS JOIN ... WHERE is the same as an INNER JOIN ... ON
SELECT COUNT(*) AS pairs
FROM size a CROSS JOIN size b       -- all ordered pairs of sizes
WHERE a.s < b.s;                    -- keep each unordered pair once

-- OUTPUT:
-- +-------+
-- | pairs |
-- +-------+
-- |     3 |      (S,M) (S,L) (M,L)
-- +-------+`],
        [`<b>Disadvantages:</b> row count explodes multiplicatively; an accidental cross join (forgotten ON / WHERE) on two large tables can run for hours.`,
            r`-- 10,000 x 10,000 rows = 100,000,000 rows produced
-- SELECT COUNT(*) FROM big_a, big_b;      -- a missing join condition looks exactly like this

SELECT 3 * 2                 AS small_case,
       10000 * 10000         AS big_case;

-- OUTPUT:
-- +------------+-----------+
-- | small_case | big_case  |
-- +------------+-----------+
-- |          6 | 100000000 |
-- +------------+-----------+`],
        [`<b>Limitations:</b> output size is bound only by n x m (memory, temp tables, network); the old comma syntax hides the intent. Use <code>sql_select_limit</code> or <code>max_join_size</code> guards in shared environments.`,
            r`-- Safety net: refuse queries that would examine too many row combinations
SET SESSION max_join_size = 1000;
-- SELECT * FROM big_a, big_b;
--   ERROR 1104: The SELECT would examine more than MAX_JOIN_SIZE rows; check your WHERE ...
SET SESSION max_join_size = DEFAULT;

SELECT @@max_join_size > 0 AS guard_exists;

-- OUTPUT:
-- +--------------+
-- | guard_exists |
-- +--------------+
-- |            1 |
-- +--------------+`],
        `
   size x color
   S --+-- red        rows = |size| * |color|
       +-- blue         3   *    2   = 6
   M --+-- red
       +-- blue
   L --+-- red
       +-- blue
`,
        `Use CROSS JOIN deliberately and write the keyword so intent is visible; always bound both inputs (small dimension tables, number tables with LIMIT). For gap-filling reports, build the skeleton once (a calendar or dimension table) and LEFT JOIN facts to it.`
    ),
};
