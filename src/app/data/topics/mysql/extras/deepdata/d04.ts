// Deep dive, modules 7-10 (SELECT Queries, Operators, MySQL Functions, Aggregate Functions).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d04: Record<string, Deep> = {
    'WHERE Clause': dv(
        [`The optimizer splits a WHERE clause into conjuncts (parts joined by AND) and tries to push each one into an index range, an index lookup, or a row filter. Conditions that compare a bare indexed column to a constant become index access; everything else is evaluated on rows after they are read ("Using where").`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(30), dept INT, salary INT, hired DATE, KEY idx_dept_salary (dept, salary));
EXPLAIN SELECT id FROM emp WHERE dept = 10 AND salary > 50000 AND name LIKE '%a%';

-- OUTPUT: (example)
-- type  | key             | key_len | Extra
-- range | idx_dept_salary |  10     | Using index condition; Using where
-- (dept and salary use the index; the LIKE is checked on each candidate row)`],
        [`Predicates: comparison, BETWEEN, IN, LIKE, IS NULL, EXISTS, and combinations with AND/OR/NOT. Row constructors and subqueries are allowed. Parentheses make precedence explicit because AND binds tighter than OR.`,
            r`SELECT name FROM emp WHERE (dept IN (10, 20) AND salary BETWEEN 40000 AND 80000) OR name LIKE 'A%';
SELECT name FROM emp WHERE (dept, salary) > (10, 50000);
SELECT name FROM emp e WHERE EXISTS (SELECT 1 FROM departments d WHERE d.id = e.dept AND d.active = 1);

-- OUTPUT:
-- name
-- Abaji
-- Raoji`],
        [`Mistakes: functions on indexed columns, implicit type conversion, OR chains that defeat indexes, and forgetting precedence. The fix is to keep the column bare, compare matching types and use parentheses or UNION.`,
            r`-- bad: function on the column
SELECT id FROM emp WHERE YEAR(hired) = 2024;
-- good
SELECT id FROM emp WHERE hired >= '2024-01-01' AND hired < '2025-01-01';
-- precedence trap
SELECT name FROM emp WHERE dept = 20 OR dept = 10 AND salary > 100000;     -- means dept=20 OR (dept=10 AND salary>100000)

-- OUTPUT: (explain)
-- bad : type=ALL;  good: type=range key=idx_hired`],
        [`Selective predicates first in a composite index: equality columns, then one range column. Check <code>rows</code> and <code>filtered</code> in EXPLAIN, and use EXPLAIN ANALYZE for actual row counts.`,
            r`EXPLAIN ANALYZE SELECT id FROM emp WHERE dept = 10 AND salary BETWEEN 50000 AND 60000;

-- OUTPUT: (example)
-- -> Filter: ((emp.dept = 10) and (emp.salary between 50000 and 60000))  (actual time=0.04..0.9 rows=240 loops=1)
--     -> Index range scan on emp using idx_dept_salary over (dept = 10 AND 50000 <= salary <= 60000)`],
        [`Real-world: a search form with optional filters. Build the WHERE from fixed fragments and bind every value, so unused filters cost nothing and nothing is concatenated.`,
            r`-- application builds: WHERE 1=1 [AND dept = ?] [AND salary >= ?] [AND name LIKE ?]
SELECT id, name, dept, salary FROM emp WHERE 1=1 AND dept = 10 AND salary >= 50000 ORDER BY id LIMIT 50;

-- OUTPUT:
-- id | name  | dept | salary
--  1 | Abaji |   10 | 60000`]
    ),

    'ORDER BY': dv(
        [`MySQL can return rows in order for free only when it reads an index in that order. Otherwise it collects rows into a sort buffer ("filesort"), sorting in memory or spilling to temporary files. With LIMIT it uses a priority queue holding only the top N rows.`,
            r`EXPLAIN SELECT id, name FROM emp ORDER BY salary DESC LIMIT 5;
ALTER TABLE emp ADD INDEX idx_salary (salary);
EXPLAIN SELECT id, salary FROM emp ORDER BY salary DESC LIMIT 5;

-- OUTPUT: (example)
-- before: Extra=Using filesort
-- after : type=index key=idx_salary Extra=Backward index scan; Using index`],
        [`Sort by several columns with mixed directions (8.0 supports descending indexes), by expressions, aliases and with NULLs-first/last tricks. Add a unique tiebreaker for deterministic results.`,
            r`SELECT name, dept, salary FROM emp ORDER BY dept ASC, salary DESC, id ASC;
SELECT name, bonus FROM emp ORDER BY bonus IS NULL, bonus DESC;       -- NULLs last
SELECT name, salary * 12 AS yearly FROM emp ORDER BY yearly DESC LIMIT 3;
CREATE INDEX idx_dept_sal_desc ON emp (dept ASC, salary DESC);

-- OUTPUT:
-- name  | dept | salary
-- Abaji |   10 | 60000
-- Raoji |   10 | 45000`],
        [`Mistakes: relying on implicit order, ordering without LIMIT on huge sets, ordering by a different column than the index, and unstable pagination from ties. Always add the primary key as the last sort key.`,
            r`SELECT id, created_at FROM posts ORDER BY created_at DESC LIMIT 10 OFFSET 10;          -- ties may repeat or skip rows between pages
SELECT id, created_at FROM posts ORDER BY created_at DESC, id DESC LIMIT 10 OFFSET 10;   -- deterministic

-- OUTPUT:
-- (the second form gives the same rows on every execution)`],
        [`Tune sorts: index the sort order, restrict rows before sorting, select fewer columns (smaller sort rows), and size <code>sort_buffer_size</code> only per session for heavy reports. Check the counters for merge passes.`,
            r`SHOW SESSION STATUS LIKE 'Sort%';
SET SESSION sort_buffer_size = 8 * 1024 * 1024;

-- OUTPUT: (example)
-- Sort_merge_passes | 0      (0 means sorts stayed in memory)
-- Sort_rows         | 52000
-- Sort_scan         | 3`],
        [`Real-world: "latest N per user" feed screens use a composite index matching WHERE and ORDER BY so MySQL walks the index backwards and stops after N rows.`,
            r`ALTER TABLE posts ADD INDEX idx_user_created (user_id, created_at, id);
EXPLAIN SELECT id, created_at FROM posts WHERE user_id = 7 ORDER BY created_at DESC, id DESC LIMIT 20;

-- OUTPUT: (example)
-- type | key              | rows | Extra
-- ref  | idx_user_created |   20 | Backward index scan; Using index`]
    ),

    'LIMIT & Pagination': dv(
        [`LIMIT n OFFSET m asks the executor to produce rows in order, discard the first m and stop after n. Discarding still reads those rows, so the cost of a page grows with its offset. A keyset (seek) query instead starts the index scan at a known key, so every page costs the same.`,
            r`EXPLAIN ANALYZE SELECT id FROM events ORDER BY id LIMIT 20 OFFSET 1000000;
EXPLAIN ANALYZE SELECT id FROM events WHERE id > 1000020 ORDER BY id LIMIT 20;

-- OUTPUT: (example)
-- offset : -> Limit/Offset: 20/1000000 (actual rows=20)  -> Index scan (actual time=0.1..180 rows=1000020)
-- keyset : -> Limit: 20 row(s)  -> Index range scan on events using PRIMARY over (1000020 < id)  (actual time=0.04..0.1 rows=20)`],
        [`Forms: <code>LIMIT n</code>, <code>LIMIT m, n</code>, <code>LIMIT n OFFSET m</code>, keyset with row constructors, and "limit plus one" to know if a next page exists without counting.`,
            r`SELECT id, title FROM posts ORDER BY id DESC LIMIT 20;
SELECT id, title FROM posts ORDER BY id DESC LIMIT 20 OFFSET 40;
SELECT id, title FROM posts WHERE (created_at, id) < ('2026-05-01 10:00:00', 120) ORDER BY created_at DESC, id DESC LIMIT 21;   -- 21 rows => has next page

-- OUTPUT:
-- 21 rows returned: show 20, hasNext = true`],
        [`Mistakes: LIMIT without ORDER BY, deep OFFSET in public APIs, exact COUNT(*) for every page on huge tables, and unbounded page sizes. Cap size and depth server side.`,
            r`SELECT COUNT(*) FROM events WHERE kind = 'click';                  -- full scan on big tables
-- better: cached/approximate count or "10000+" display
SELECT table_rows FROM information_schema.tables WHERE table_name = 'events';

-- OUTPUT:
-- table_rows
-- 48211034       (estimate, instant)`],
        [`Deferred join makes OFFSET tolerable: page on a narrow covering index to find ids, then join to fetch only those rows.`,
            r`SELECT p.* FROM posts p JOIN (SELECT id FROM posts ORDER BY created_at DESC, id DESC LIMIT 20 OFFSET 100000) x ON x.id = p.id ORDER BY p.created_at DESC, p.id DESC;

-- OUTPUT:
-- 20 rows       (the sort and skip happen on the small index, not on wide rows)`],
        [`Real-world API: an opaque cursor token carries the last key. The server decodes it into the keyset predicate, so clients cannot jump to arbitrary pages but every page is fast and stable under inserts.`,
            r`-- cursor = base64({"c":"2026-05-01 10:00:00","i":120})
SELECT id, title, created_at FROM posts WHERE (created_at < ?) OR (created_at = ? AND id < ?) ORDER BY created_at DESC, id DESC LIMIT 21;

-- OUTPUT:
-- id  | title | created_at
-- 119 | ...   | 2026-05-01 09:58:00`]
    ),

    'DISTINCT': dv(
        [`DISTINCT removes duplicate result rows. The server does this with a temporary table that has a unique key over all selected columns, or by scanning an index that is already ordered (loose index scan). Cost grows with the number of rows and the width of the selected columns.`,
            r`SELECT DISTINCT dept FROM emp;
EXPLAIN SELECT DISTINCT dept FROM emp;
ALTER TABLE emp ADD INDEX idx_dept (dept);
EXPLAIN SELECT DISTINCT dept FROM emp;

-- OUTPUT: (example)
-- before: Extra=Using temporary
-- after : type=range key=idx_dept Extra=Using index for group-by`],
        [`DISTINCT applies to the whole selected row, so <code>SELECT DISTINCT a, b</code> removes duplicates of the pair. <code>COUNT(DISTINCT x)</code> counts unique values; <code>GROUP BY</code> is an equivalent for simple uniqueness.`,
            r`SELECT DISTINCT dept, salary > 50000 AS high FROM emp;
SELECT COUNT(DISTINCT dept) AS depts, COUNT(DISTINCT dept, salary) AS dept_salary_pairs FROM emp;
SELECT dept FROM emp GROUP BY dept;

-- OUTPUT:
-- depts | dept_salary_pairs
--     2 |                 3`],
        [`Mistake: using DISTINCT to hide duplicates created by a one-to-many join. The query then does extra work and may still be wrong. Use EXISTS for existence checks or aggregate the many side first.`,
            r`-- smells: duplicates removed after the join
SELECT DISTINCT c.id, c.name FROM customers c JOIN orders o ON o.customer_id = c.id;
-- clearer and cheaper
SELECT c.id, c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT:
-- same customers; second plan uses a semijoin and no temporary table`],
        [`Performance: an index on the distinct columns lets MySQL skip duplicates without a temp table. COUNT(DISTINCT) on a huge table can use lots of memory; consider approximate counting or pre-aggregation.`,
            r`SELECT COUNT(DISTINCT user_id) AS daily_users FROM events WHERE created_at >= CURDATE();
-- pre-aggregated alternative
SELECT SUM(unique_users) FROM daily_stats WHERE day >= CURDATE();

-- OUTPUT:
-- daily_users
-- 184220`],
        [`Real-world: filling a filter dropdown with the available cities. DISTINCT with an index on the column is instant, and ordering gives a stable list.`,
            r`SELECT DISTINCT city FROM jobs WHERE status = 'OPEN' ORDER BY city;
ALTER TABLE jobs ADD INDEX idx_status_city (status, city);

-- OUTPUT:
-- city
-- Delhi
-- Pune`]
    ),

    'GROUP BY & HAVING in SELECT': dv(
        [`GROUP BY collects rows into groups either by scanning an index in group order (streaming aggregate, cheap) or by building a temporary table keyed by the group (hash aggregate). Aggregate functions are then computed per group, and HAVING filters the finished groups.`,
            r`EXPLAIN SELECT dept, COUNT(*), AVG(salary) FROM emp GROUP BY dept;
ALTER TABLE emp ADD INDEX idx_dept_salary (dept, salary);
EXPLAIN SELECT dept, COUNT(*), AVG(salary) FROM emp GROUP BY dept;

-- OUTPUT: (example)
-- before: Extra=Using temporary
-- after : type=index key=idx_dept_salary Extra=Using index`],
        [`Group by columns or expressions, several columns at once, add subtotals with <code>WITH ROLLUP</code>, and filter groups with HAVING (which may use aggregates and aliases). Strict <code>ONLY_FULL_GROUP_BY</code> requires every non-aggregated column to be grouped.`,
            r`SELECT dept, YEAR(hired) AS yr, COUNT(*) AS n, SUM(salary) AS payroll FROM emp GROUP BY dept, YEAR(hired) WITH ROLLUP;
SELECT dept, AVG(salary) AS avg_sal FROM emp GROUP BY dept HAVING avg_sal > 50000 AND COUNT(*) >= 2;

-- OUTPUT:
-- dept | yr   | n | payroll
--   10 | 2024 | 1 |   60000
--   10 | NULL | 2 |  105000
-- NULL | NULL | 3 |  175000`],
        [`Mistakes: selecting a non-grouped column (error or arbitrary value), filtering rows in HAVING instead of WHERE, and grouping on expressions that block index use. Move row filters to WHERE so fewer rows are grouped.`,
            r`SELECT dept, name, COUNT(*) FROM emp GROUP BY dept;                          -- ambiguous name
SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING dept = 10;                 -- works but groups everything first
SELECT dept, COUNT(*) FROM emp WHERE dept = 10 GROUP BY dept;                  -- filters first

-- OUTPUT:
-- ERROR 1055 (42000): Expression #2 of SELECT list is not in GROUP BY clause and contains nonaggregated column 'emp.name'`],
        [`For repeated dashboards, pre-aggregate: a summary table updated incrementally turns an expensive scan into a tiny lookup. Check temp-table spills with the status counters.`,
            r`CREATE TABLE daily_sales (day DATE, dept INT, orders INT, revenue DECIMAL(14,2), PRIMARY KEY (day, dept));
INSERT INTO daily_sales SELECT DATE(created_at), dept, COUNT(*), SUM(total) FROM orders WHERE created_at >= CURDATE() - INTERVAL 1 DAY GROUP BY DATE(created_at), dept
ON DUPLICATE KEY UPDATE orders = VALUES(orders), revenue = VALUES(revenue);

-- OUTPUT:
-- Query OK, 12 rows affected`],
        [`Real-world: top customers by spend with a minimum threshold, ranked and limited, the typical "VIP list" query.`,
            r`SELECT customer_id, COUNT(*) AS orders, SUM(total) AS spent FROM orders WHERE status = 'PAID' AND created_at >= '2026-01-01'
GROUP BY customer_id HAVING spent >= 10000 ORDER BY spent DESC LIMIT 10;

-- OUTPUT:
-- customer_id | orders | spent
-- 7           |     31 | 48200.00`]
    ),

    'Order of Clause Execution': dv(
        [`SQL has a logical processing order that differs from the written order: FROM and JOIN, WHERE, GROUP BY, HAVING, window functions, SELECT list, DISTINCT, ORDER BY, LIMIT. Each phase can only use what earlier phases produced, which explains alias and window-function restrictions.`,
            r`-- written order: SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY ... LIMIT
-- logical order:  FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT
SELECT dept, COUNT(*) AS n              -- 5
FROM emp                                -- 1
WHERE salary > 40000                    -- 2
GROUP BY dept                           -- 3
HAVING n >= 1                           -- 4 (MySQL allows the alias)
ORDER BY n DESC                         -- 6
LIMIT 5;                                -- 7

-- OUTPUT:
-- dept | n
--   10 | 2`],
        [`MySQL is lenient with aliases in GROUP BY, HAVING and ORDER BY, but not in WHERE. Wrap the query in a derived table or CTE when a later step needs an alias or window result in a filter.`,
            r`SELECT * FROM (SELECT name, salary * 12 AS yearly FROM emp) t WHERE yearly > 600000;
WITH ranked AS (SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS rk FROM emp) SELECT * FROM ranked WHERE rk <= 3;

-- OUTPUT:
-- name     | yearly
-- Moropant | 840000`],
        [`Mistakes: using a SELECT alias in WHERE, a window function in WHERE, or expecting ORDER BY to run before GROUP BY. These fail because the earlier phase does not know about the later one.`,
            r`SELECT salary * 12 AS yearly FROM emp WHERE yearly > 600000;
SELECT name FROM emp WHERE ROW_NUMBER() OVER (ORDER BY salary) = 1;

-- OUTPUT:
-- ERROR 1054 (42S22): Unknown column 'yearly' in 'where clause'
-- ERROR 3593 (HY000): You cannot use the window function 'row_number' in this context.`],
        [`The optimizer may physically reorder work (push filters below joins, choose join order, use indexes) as long as results match the logical order. EXPLAIN FORMAT=TREE shows what actually happens.`,
            r`EXPLAIN FORMAT=TREE SELECT d.name, COUNT(*) FROM emp e JOIN departments d ON d.id = e.dept WHERE e.salary > 50000 GROUP BY d.id;

-- OUTPUT: (example)
-- -> Group aggregate: count(0)
--     -> Nested loop inner join
--         -> Filter: (e.salary > 50000)       (filter applied before the join: pushed down)`],
        [`Real-world debugging method: when a query returns surprising numbers, evaluate it in phases. Run the FROM/WHERE part alone, then add grouping, then HAVING, comparing counts at each step.`,
            r`SELECT COUNT(*) FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.status = 'PAID';          -- rows after FROM+WHERE
SELECT COUNT(DISTINCT o.id) FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.status = 'PAID';  -- distinct orders

-- OUTPUT:
-- 5400   then   1800           (each order has about 3 items: sums of order totals would be tripled)`]
    ),

    'Comparison Operators': dv(
        [`Comparison operators return 1 (true), 0 (false) or NULL (unknown). When the two sides have different types MySQL converts them: strings to numbers for numeric comparison, and string collation rules decide string equality. The conversion happens for every row, so a mismatched column cannot use its index.`,
            r`SELECT 5 > 3 AS gt, 5 <> 5 AS ne, 'a' = 'A' AS ci_equal, '10' = 10 AS coerced, '10abc' = 10 AS partial, NULL = NULL AS null_eq, NULL <=> NULL AS null_safe;

-- OUTPUT:
-- gt | ne | ci_equal | coerced | partial | null_eq | null_safe
--  1 |  0 |        1 |       1 |       1 |    NULL |         1`],
        [`Operators: <code>= &lt;&gt; != &gt; &lt; &gt;= &lt;=</code>, the NULL-safe <code>&lt;=&gt;</code>, <code>BETWEEN</code>, <code>IN</code>, <code>LIKE</code>, <code>REGEXP</code>, and row comparisons for composite keys.`,
            r`SELECT id FROM emp WHERE (dept, id) > (10, 1) ORDER BY dept, id;
SELECT name FROM emp WHERE name REGEXP '^[AR]';
SELECT name FROM emp WHERE bonus <=> NULL;

-- OUTPUT:
-- id
-- 2
-- 3`],
        [`Mistakes: comparing a VARCHAR column to a number (index lost, odd matches), forgetting case rules, floating-point equality and writing <code>= NULL</code>. Match types and use IS NULL or the safe-equal operator.`,
            r`EXPLAIN SELECT id FROM users WHERE phone = 9876543210;     -- phone VARCHAR: converts each row, type=ALL
EXPLAIN SELECT id FROM users WHERE phone = '9876543210';   -- type=ref
SELECT COUNT(*) FROM emp WHERE bonus = NULL;                -- always 0

-- OUTPUT:
-- COUNT(*)
-- 0`],
        [`Collation sets comparison behaviour and performance: binary collations are fastest and exact; case/accent-insensitive ones are convenient. Mixing collations in a join makes MySQL convert and can block the index.`,
            r`SELECT 'résumé' = 'resume' COLLATE utf8mb4_0900_ai_ci AS accent_insens, 'a' = 'A' COLLATE utf8mb4_bin AS binary_cmp;
SELECT a.id FROM t1 a JOIN t2 b ON a.code = b.code COLLATE utf8mb4_0900_ai_ci;

-- OUTPUT:
-- accent_insens | binary_cmp
--             1 |          0`],
        [`Real-world keyset pagination uses a row comparison, which MySQL can turn into a single index range even though it spans two columns.`,
            r`SELECT id, created_at FROM posts WHERE (created_at, id) < ('2026-05-01 10:00:00', 120) ORDER BY created_at DESC, id DESC LIMIT 20;
EXPLAIN SELECT id FROM posts WHERE (created_at, id) < ('2026-05-01 10:00:00', 120) ORDER BY created_at DESC, id DESC LIMIT 20;

-- OUTPUT: (example)
-- type  | key             | Extra
-- range | idx_created_id  | Backward index scan; Using index`]
    ),

    'Logical Operators: AND, OR & NOT': dv(
        [`Logical operators use three-valued logic: TRUE, FALSE and UNKNOWN (NULL). A WHERE clause keeps a row only when it evaluates to TRUE, so UNKNOWN rows are dropped. AND is evaluated before OR, and NOT inverts TRUE and FALSE but leaves UNKNOWN as UNKNOWN.`,
            r`SELECT TRUE AND NULL AS t_and_n, FALSE AND NULL AS f_and_n, TRUE OR NULL AS t_or_n, FALSE OR NULL AS f_or_n, NOT NULL AS not_n;

-- OUTPUT:
-- t_and_n | f_and_n | t_or_n | f_or_n | not_n
-- NULL    |       0 |      1 | NULL   | NULL`],
        [`Combine conditions with parentheses. XOR exists, and short forms like IN and BETWEEN replace chains of OR/AND. De Morgan's laws help rewrite NOT conditions: NOT (A AND B) = NOT A OR NOT B.`,
            r`SELECT name FROM emp WHERE NOT (dept = 10 AND salary < 50000);
SELECT name FROM emp WHERE dept <> 10 OR salary >= 50000;          -- equivalent (when columns are NOT NULL)
SELECT name FROM emp WHERE dept IN (10, 20) AND NOT name LIKE 'R%';

-- OUTPUT:
-- name
-- Abaji
-- Moropant`],
        [`Mistakes: precedence surprises, NOT with NULL data (the rewrite is not equivalent when NULLs exist), and OR across different columns which blocks single-index access. Use UNION ALL with a guard for performance.`,
            r`SELECT name FROM emp WHERE dept = 10 OR dept = 20 AND salary > 60000;     -- AND first
SELECT name FROM emp WHERE (dept = 10 OR dept = 20) AND salary > 60000;   -- intended

-- OUTPUT:
-- first : Abaji, Raoji, Moropant       second: Moropant`],
        [`Rewrite a slow OR over two indexed columns as two index lookups combined with UNION ALL, removing the overlap in the second branch.`,
            r`SELECT id FROM orders WHERE customer_id = 7 OR sales_rep_id = 9;
SELECT id FROM orders WHERE customer_id = 7
UNION ALL
SELECT id FROM orders WHERE sales_rep_id = 9 AND (customer_id <> 7 OR customer_id IS NULL);

-- OUTPUT: (example)
-- first : type=index_merge (union of two indexes) or ALL;  second: two ref lookups`],
        [`Real-world access rule: a user sees documents they own or that are shared with a group they belong to. Writing it with EXISTS keeps the logic clear and NULL-safe.`,
            r`SELECT d.id, d.title FROM documents d WHERE d.owner_id = 7 OR EXISTS (SELECT 1 FROM shares s JOIN memberships m ON m.group_id = s.group_id WHERE s.document_id = d.id AND m.user_id = 7);

-- OUTPUT:
-- id | title
--  4 | Roadmap`]
    ),

    'BETWEEN, IN & NOT IN': dv(
        [`BETWEEN a AND b is shorthand for >= a AND <= b (inclusive). IN (list) matches any listed value; for constants MySQL sorts the list and probes the index once per value, so a short IN list is an efficient multi-range lookup.`,
            r`EXPLAIN SELECT id FROM orders WHERE customer_id IN (1, 7, 12);
EXPLAIN SELECT id FROM orders WHERE created_at BETWEEN '2026-05-01' AND '2026-05-31 23:59:59';

-- OUTPUT: (example)
-- type  | key          | rows
-- range | idx_customer |   94        (three index probes)
-- range | idx_created  | 8200`],
        [`IN accepts literals, subqueries and row tuples. BETWEEN works on numbers, dates and strings. Use half-open ranges for datetimes so the upper boundary and fractional seconds are handled precisely.`,
            r`SELECT id FROM orders WHERE (customer_id, status) IN ((7, 'PAID'), (9, 'NEW'));
SELECT id FROM orders WHERE id IN (SELECT order_id FROM payments WHERE amount > 1000);
SELECT COUNT(*) FROM orders WHERE created_at >= '2026-05-01' AND created_at < '2026-06-01';

-- OUTPUT:
-- COUNT(*)
-- 8201`],
        [`Mistakes: NOT IN with a NULL in the list (returns nothing), huge IN lists (slow to parse and plan), and BETWEEN on datetimes that excludes the last day. Use NOT EXISTS and half-open ranges.`,
            r`SELECT id FROM customers WHERE id NOT IN (SELECT customer_id FROM orders);                       -- orders.customer_id has NULLs => empty
SELECT id FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);   -- correct

-- OUTPUT:
-- Empty set      then      id: 2, 5`],
        [`For thousands of ids load them into a temporary table and join. It avoids a giant statement, can be indexed and plans predictably.`,
            r`CREATE TEMPORARY TABLE wanted (id BIGINT PRIMARY KEY);
INSERT INTO wanted VALUES (101),(102),(103);   -- bulk insert the ids
SELECT o.id, o.total FROM orders o JOIN wanted w ON w.id = o.id;

-- OUTPUT:
-- id  | total
-- 101 | 450.00`],
        [`Real-world: filters from a UI (checkbox lists) map to IN with bound parameters, one placeholder per value, generated safely by code.`,
            r`-- selected statuses: ['PAID','SHIPPED'] -> sql = "WHERE status IN (?,?)"
SELECT id, status FROM orders WHERE status IN ('PAID','SHIPPED') AND created_at >= '2026-05-01' ORDER BY id LIMIT 50;

-- OUTPUT:
-- id | status
--  9 | PAID`]
    ),

    'LIKE & Pattern Matching': dv(
        [`LIKE compares strings with wildcards: % for any run of characters and _ for exactly one. A B-tree index is sorted, so a pattern with a fixed prefix (<code>'abc%'</code>) becomes an index range, while a leading wildcard (<code>'%abc'</code>) cannot and needs a scan.`,
            r`EXPLAIN SELECT id FROM customers WHERE name LIKE 'As%';
EXPLAIN SELECT id FROM customers WHERE name LIKE '%sha';

-- OUTPUT: (example)
-- type  | key      | rows
-- range | idx_name |   12
-- index | idx_name | 98000       (full index scan, not a seek)`],
        [`Options: <code>ESCAPE</code> to match literal % or _, <code>NOT LIKE</code>, <code>REGEXP</code>/<code>REGEXP_LIKE</code> for complex patterns, collation for case sensitivity, and FULLTEXT for word search.`,
            r`SELECT 'a_b' LIKE 'a\_b' AS literal_underscore, '50%' LIKE '50!%' ESCAPE '!' AS literal_percent;
SELECT name FROM customers WHERE name LIKE 'A%' COLLATE utf8mb4_0900_as_cs;
SELECT name FROM customers WHERE REGEXP_LIKE(name, '^(As|Ra)[a-z]+$');

-- OUTPUT:
-- literal_underscore | literal_percent
--                  1 |               1`],
        [`Mistakes: wrapping user input in %...% without escaping wildcards (users can search with % or _ and cause scans), using LIKE for whole-word search, and expecting case-sensitive matches under a case-insensitive collation.`,
            r`-- user typed 100%  =>  must escape before building the pattern
SET @q = REPLACE(REPLACE(REPLACE('100%', '\\', '\\\\'), '%', '\\%'), '_', '\\_');
SELECT id FROM products WHERE name LIKE CONCAT('%', @q, '%');

-- OUTPUT:
-- id
-- 12`],
        [`For "contains" search at scale use FULLTEXT or a reversed/generated column for suffix lookups. A reversed string column turns suffix search into prefix search.`,
            r`ALTER TABLE customers ADD COLUMN name_rev VARCHAR(60) AS (REVERSE(name)) STORED, ADD INDEX idx_name_rev (name_rev);
SELECT id FROM customers WHERE name_rev LIKE CONCAT(REVERSE('sha'), '%');

-- OUTPUT:
-- id
-- 1           (finds names ending with "sha" using an index range)`],
        [`Real-world: type-ahead search. Prefix LIKE with a limit and an index returns the first suggestions in milliseconds.`,
            r`SELECT id, name FROM customers WHERE name LIKE 'abaji%' ORDER BY name LIMIT 8;

-- OUTPUT:
-- id | name
--  1 | Abaji
-- 14 | Ashank`]
    ),

    'IS NULL & IS NOT NULL': dv(
        [`NULL means "no value / unknown". InnoDB tracks nullability in a per-row bitmap and indexes NULL entries, so <code>IS NULL</code> can use an index. Because NULL is not equal to anything (even NULL), only IS NULL, IS NOT NULL and the NULL-safe operator can test it.`,
            r`CREATE TABLE contacts (id INT PRIMARY KEY, phone VARCHAR(20), KEY idx_phone (phone));
INSERT INTO contacts VALUES (1,'999'),(2,NULL),(3,'');
EXPLAIN SELECT id FROM contacts WHERE phone IS NULL;
SELECT id, phone IS NULL AS is_null, phone = '' AS is_empty FROM contacts;

-- OUTPUT:
-- type | key
-- ref  | idx_phone
-- id | is_null | is_empty
--  1 |       0 |        0
--  2 |       1 |     NULL
--  3 |       0 |        1`],
        [`Tools: <code>IS [NOT] NULL</code>, <code>COALESCE</code>, <code>IFNULL</code>, <code>NULLIF</code>, <code>&lt;=&gt;</code>, and <code>ISNULL()</code>. Aggregates ignore NULLs, and ORDER BY puts NULLs first in ascending order.`,
            r`SELECT COALESCE(phone, 'n/a') AS shown, IFNULL(phone, '') AS blank, NULLIF(phone, '') AS cleaned FROM contacts;
SELECT COUNT(*) AS all_rows, COUNT(phone) AS non_null FROM contacts;
SELECT id FROM contacts ORDER BY phone IS NULL, phone;

-- OUTPUT:
-- all_rows | non_null
--        3 |        2`],
        [`Mistakes: <code>= NULL</code>, <code>NOT IN</code> with NULLs, treating empty string as NULL, and counting with COUNT(col) when you meant COUNT(*). Decide per column whether missing is NULL or a real default.`,
            r`SELECT id FROM contacts WHERE phone = NULL;                  -- never true
SELECT id FROM contacts WHERE phone IS NULL OR phone = '';      -- both kinds of "missing"
SELECT id FROM contacts WHERE id NOT IN (1, NULL);              -- empty: NULL poisons NOT IN

-- OUTPUT:
-- Empty set
-- id: 2, 3
-- Empty set`],
        [`Anti-joins find rows without a partner. LEFT JOIN with IS NULL on the right key, or NOT EXISTS, are optimized into an efficient antijoin plan.`,
            r`EXPLAIN FORMAT=TREE SELECT c.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;

-- OUTPUT: (example)
-- -> Nested loop antijoin
--     -> Table scan on c
--     -> Single-row covering index lookup on o using idx_customer (customer_id=c.id)`],
        [`Real-world data quality report: how many rows are missing each optional field, to decide what to backfill or enforce.`,
            r`SELECT COUNT(*) AS customers, SUM(phone IS NULL) AS no_phone, SUM(email IS NULL) AS no_email, ROUND(100 * SUM(phone IS NULL) / COUNT(*), 1) AS pct_no_phone FROM customers;

-- OUTPUT:
-- customers | no_phone | no_email | pct_no_phone
--     12044 |     2108 |       12 | 17.5`]
    ),

    'String Functions': dv(
        [`String functions run per row inside the executor. They operate on characters or bytes depending on the function (<code>CHAR_LENGTH</code> vs <code>LENGTH</code>), obey the connection charset and collation, and return NULL if any argument is NULL (except CONCAT_WS and a few others).`,
            r`SELECT CHAR_LENGTH('हिंदी') AS chars, LENGTH('हिंदी') AS bytes, UPPER('mysql') AS up, REVERSE('abc') AS rev, CONCAT('a', NULL, 'b') AS c1, CONCAT_WS('-', 'a', NULL, 'b') AS c2;

-- OUTPUT:
-- chars | bytes | up    | rev | c1   | c2
--     4 |    12 | MYSQL | cba | NULL | a-b`],
        [`Everyday set: CONCAT, SUBSTRING, LEFT/RIGHT, TRIM, REPLACE, LOCATE/INSTR, LPAD/RPAD, FORMAT, SUBSTRING_INDEX, REGEXP_REPLACE, GROUP_CONCAT (aggregate).`,
            r`SELECT SUBSTRING('2026-05-01', 1, 4) AS yr, SUBSTRING_INDEX('a@x.com', '@', -1) AS domain, LPAD(7, 3, '0') AS padded, TRIM(BOTH '-' FROM '--x--') AS trimmed,
       REPLACE('a-b-c', '-', '/') AS replaced, REGEXP_REPLACE('a1b22', '[0-9]+', '#') AS regexed, FORMAT(1234567.891, 2) AS fmt;

-- OUTPUT:
-- yr   | domain | padded | trimmed | replaced | regexed | fmt
-- 2026 | x.com  | 007    | x       | a/b/c    | a#b#    | 1,234,567.89`],
        [`Mistakes: functions on indexed columns in WHERE, assuming byte length equals character count, and formatting in SQL what the application should format. Normalize on write and keep functions out of predicates.`,
            r`SELECT id FROM users WHERE LOWER(email) = 'a@x.com';            -- no plain index use
ALTER TABLE users ADD INDEX idx_lower_email ((LOWER(email)));       -- functional index (8.0.13+)
EXPLAIN SELECT id FROM users WHERE LOWER(email) = 'a@x.com';

-- OUTPUT: (example)
-- type | key
-- ref  | idx_lower_email`],
        [`String functions in SELECT lists cost CPU for each returned row; in WHERE or GROUP BY for each scanned row. Pre-compute with generated columns when the same expression is used repeatedly.`,
            r`ALTER TABLE customers ADD COLUMN email_domain VARCHAR(100) AS (SUBSTRING_INDEX(email, '@', -1)) STORED, ADD INDEX idx_domain (email_domain);
SELECT email_domain, COUNT(*) FROM customers GROUP BY email_domain ORDER BY COUNT(*) DESC LIMIT 3;

-- OUTPUT:
-- email_domain | COUNT(*)
-- gmail.com    | 5120`],
        [`Real-world data cleaning: standardize phone numbers and names in an UPDATE, checking the result with a SELECT first.`,
            r`SELECT phone, REGEXP_REPLACE(phone, '[^0-9+]', '') AS cleaned FROM customers LIMIT 2;
UPDATE customers SET phone = REGEXP_REPLACE(phone, '[^0-9+]', ''), name = TRIM(name) WHERE id BETWEEN 1 AND 10000;

-- OUTPUT:
-- phone           | cleaned
-- +91 98765 43210 | +919876543210`]
    ),

    'Numeric Functions': dv(
        [`Numeric functions operate on exact (DECIMAL, integer) or approximate (FLOAT, DOUBLE) values. ROUND on DECIMAL rounds half away from zero; on DOUBLE it follows the C library. Integer division <code>DIV</code> truncates, while <code>/</code> produces a decimal.`,
            r`SELECT ROUND(2.5) AS r_dec, ROUND(2.5E0) AS r_dbl, ROUND(-2.5) AS r_neg, CEIL(2.1) AS c, FLOOR(-2.1) AS f, TRUNCATE(2.789, 2) AS t, 7 DIV 2 AS int_div, 7 / 2 AS real_div, MOD(-7, 3) AS m;

-- OUTPUT:
-- r_dec | r_dbl | r_neg | c | f  | t    | int_div | real_div | m
--     3 |     2 |    -3 | 3 | -3 | 2.78 |       3 |   3.5000 | -1`],
        [`Useful set: ROUND(x, d), CEIL, FLOOR, TRUNCATE, ABS, SIGN, MOD/%, POWER, SQRT, LOG, GREATEST/LEAST, RAND, CONV and bit operators.`,
            r`SELECT GREATEST(3, 9, 5) AS g, LEAST(3, 9, 5) AS l, POWER(2, 10) AS p, SQRT(144) AS s, ABS(-7) AS a, SIGN(-5) AS sg, 6 & 3 AS bit_and, 1 << 4 AS shifted;

-- OUTPUT:
-- g | l | p    | s  | a | sg | bit_and | shifted
-- 9 | 3 | 1024 | 12 | 7 | -1 |       2 |      16`],
        [`Mistakes: dividing by zero (NULL, or error in DML under strict mode), using floats for money, and <code>ORDER BY RAND()</code> on big tables (sorts everything). Guard divisors with NULLIF and sample differently.`,
            r`SELECT 10 / 0 AS div_zero, 10 / NULLIF(0, 0) AS safe_div;
SELECT id FROM products ORDER BY RAND() LIMIT 1;                                     -- sorts the whole table
SELECT id FROM products WHERE id >= (SELECT FLOOR(RAND() * MAX(id)) FROM products) ORDER BY id LIMIT 1;

-- OUTPUT:
-- div_zero | safe_div
-- NULL     | NULL`],
        [`Rounding rules matter at scale: round once at a defined step, sum unrounded values and round the total, and check that parts add up to the whole. DECIMAL avoids drift.`,
            r`SELECT SUM(ROUND(price * 0.18, 2)) AS sum_of_rounded, ROUND(SUM(price * 0.18), 2) AS rounded_sum FROM (SELECT 10.03 AS price UNION ALL SELECT 10.03 UNION ALL SELECT 10.03) t;

-- OUTPUT:
-- sum_of_rounded | rounded_sum
-- 5.43           | 5.42`],
        [`Real-world pricing: discounts, tax and percentages computed in DECIMAL with explicit rounding, plus a check that the invoice total equals the sum of its parts.`,
            r`SELECT order_id, ROUND(SUM(qty * unit_price), 2) AS subtotal, ROUND(SUM(qty * unit_price) * 0.10, 2) AS discount,
       ROUND(SUM(qty * unit_price) * 0.90 * 1.18, 2) AS total FROM order_items WHERE order_id = 1 GROUP BY order_id;

-- OUTPUT:
-- order_id | subtotal | discount | total
--        1 |   999.50 |    99.95 | 1061.47`]
    ),

    'Date Functions': dv(
        [`Date and time functions work on internal integer representations. NOW() returns the statement start time (constant within the statement), SYSDATE() the time of each call, UTC_TIMESTAMP() the UTC time. TIMESTAMP values convert through the session time zone; DATE and DATETIME do not.`,
            r`SELECT NOW() = NOW() AS now_stable, SYSDATE() = SYSDATE() AS sysdate_changes, @@session.time_zone AS tz, UTC_TIMESTAMP() AS utc_now;

-- OUTPUT: (example)
-- now_stable | sysdate_changes | tz     | utc_now
--          1 |               0 | +05:30 | 2026-05-01 10:00:00`],
        [`Everyday set: DATE_ADD/SUB with INTERVAL, DATEDIFF, TIMESTAMPDIFF, DATE_FORMAT, STR_TO_DATE, EXTRACT, LAST_DAY, WEEK/YEARWEEK, DAYNAME, UNIX_TIMESTAMP and FROM_UNIXTIME, CONVERT_TZ.`,
            r`SELECT DATE_ADD('2026-01-31', INTERVAL 1 MONTH) AS eom_plus, TIMESTAMPDIFF(HOUR, '2026-05-01 08:00', '2026-05-02 10:30') AS hours,
       EXTRACT(QUARTER FROM '2026-08-15') AS q, YEARWEEK('2026-05-01', 3) AS iso_week, FROM_UNIXTIME(1777000000) AS from_epoch, UNIX_TIMESTAMP('2026-05-01 00:00:00') AS epoch;

-- OUTPUT:
-- eom_plus   | hours | q | iso_week | from_epoch          | epoch
-- 2026-02-28 |    26 | 3 |   202618 | 2026-04-24 07:46:40 | 1777593600`],
        [`Mistakes: functions around indexed date columns, day-boundary bugs with BETWEEN on datetimes, mixing time zones, and local-time DATETIMEs across daylight saving changes. Use ranges and UTC.`,
            r`SELECT COUNT(*) FROM orders WHERE DATE(created_at) = '2026-05-01';                      -- scans
SELECT COUNT(*) FROM orders WHERE created_at >= '2026-05-01' AND created_at < '2026-05-02';  -- range scan

-- OUTPUT: (explain)
-- first : type=ALL     second: type=range key=idx_created`],
        [`Group by month efficiently: compute a month key from a range-friendly column, or add a generated month column with an index when many reports use it.`,
            r`ALTER TABLE orders ADD COLUMN created_month DATE AS (DATE_FORMAT(created_at, '%Y-%m-01')) STORED, ADD INDEX idx_month (created_month);
SELECT created_month, SUM(total) FROM orders GROUP BY created_month ORDER BY created_month DESC LIMIT 3;

-- OUTPUT:
-- created_month | SUM(total)
-- 2026-05-01    | 120450.00`],
        [`Real-world: subscription renewals and trials, using date arithmetic to find who expires in the next 7 days and who was active last month.`,
            r`SELECT user_id, expires_on, DATEDIFF(expires_on, CURDATE()) AS days_left FROM subscriptions WHERE expires_on BETWEEN CURDATE() AND CURDATE() + INTERVAL 7 DAY ORDER BY expires_on;

-- OUTPUT:
-- user_id | expires_on | days_left
-- 41      | 2026-05-03 |         2`]
    ),

    'NULL Functions: COALESCE, IFNULL & NULLIF': dv(
        [`COALESCE returns the first non-NULL of its arguments and evaluates left to right; IFNULL is the two-argument MySQL form; NULLIF returns NULL when two values are equal. The result type is derived from all arguments, which can change precision or string length.`,
            r`SELECT COALESCE(NULL, NULL, 'c') AS first_non_null, IFNULL(NULL, 0) AS fallback, NULLIF(5, 5) AS nul, NULLIF(5, 6) AS keep, COALESCE(1, 'text') AS mixed_type;

-- OUTPUT:
-- first_non_null | fallback | nul  | keep | mixed_type
-- c              |        0 | NULL |    5 | 1`],
        [`Patterns: default values, safe division, replacing sentinel values with NULL, picking the first available contact, and conditional expressions with CASE/IF as the general tool.`,
            r`SELECT name, COALESCE(mobile, office, home, 'no phone') AS best_phone FROM contacts;
SELECT total / NULLIF(qty, 0) AS unit_price FROM order_items;
UPDATE contacts SET mobile = NULLIF(TRIM(mobile), '');
SELECT IF(salary > 50000, 'high', 'normal') AS band, CASE WHEN bonus IS NULL THEN 'none' ELSE 'yes' END AS has_bonus FROM emp;

-- OUTPUT:
-- name  | best_phone
-- Abaji | 98765`],
        [`Mistakes: COALESCE on an indexed column inside WHERE (index lost), turning NULL into 0 in aggregates and distorting averages, and relying on IFNULL when portability matters. Keep NULL as unknown where that is the truth.`,
            r`SELECT AVG(score) AS avg_ignoring_null, AVG(COALESCE(score, 0)) AS avg_treating_missing_as_zero FROM results;
SELECT id FROM results WHERE COALESCE(score, 0) = 0;                       -- no index use
SELECT id FROM results WHERE score = 0 OR score IS NULL;                   -- index friendly

-- OUTPUT:
-- avg_ignoring_null | avg_treating_missing_as_zero
-- 72.5000           | 48.3333`],
        [`These functions are cheap per row, but in predicates they block index use. When a default is semantic, store it with NOT NULL DEFAULT so queries stay simple and indexable.`,
            r`ALTER TABLE orders MODIFY discount DECIMAL(5,2) NOT NULL DEFAULT 0;
SELECT id FROM orders WHERE discount > 0;          -- plain range on idx_discount

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Real-world reporting: show "unknown" for missing categories without changing the data, and compute conversion rates without divide-by-zero errors.`,
            r`SELECT COALESCE(c.name, 'Uncategorised') AS category, COUNT(*) AS products FROM products p LEFT JOIN categories c ON c.id = p.category_id GROUP BY c.id, c.name;
SELECT campaign, ROUND(100 * orders / NULLIF(visits, 0), 2) AS conversion_pct FROM campaign_stats;

-- OUTPUT:
-- campaign | conversion_pct
-- spring   | 3.40
-- launch   | NULL        (no visits yet)`]
    ),

    'COUNT, SUM, AVG, MIN & MAX': dv(
        [`Aggregates reduce many rows to one value. COUNT(*) counts rows, COUNT(col) counts non-NULL values, SUM/AVG ignore NULLs, MIN/MAX use the index ends when possible. InnoDB has no stored row count (MVCC), so COUNT(*) scans the smallest index.`,
            r`SELECT COUNT(*) AS rows_n, COUNT(bonus) AS with_bonus, SUM(salary) AS total, AVG(salary) AS mean, MIN(salary) AS lo, MAX(salary) AS hi, SUM(bonus) AS bonus_sum FROM emp;

-- OUTPUT:
-- rows_n | with_bonus | total  | mean       | lo    | hi    | bonus_sum
--      3 |          1 | 175000 | 58333.3333 | 45000 | 70000 | 5000`],
        [`Variants: <code>COUNT(DISTINCT)</code>, conditional aggregation with CASE or boolean expressions, <code>GROUP_CONCAT</code>, <code>STDDEV</code>/<code>VARIANCE</code>, bit aggregates, and aggregation with <code>FILTER</code>-style SUM(condition).`,
            r`SELECT COUNT(DISTINCT dept) AS depts, SUM(salary > 50000) AS high_earners, SUM(CASE WHEN dept = 10 THEN salary ELSE 0 END) AS dept10_payroll,
       GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS names, ROUND(STDDEV_POP(salary), 0) AS spread FROM emp;

-- OUTPUT:
-- depts | high_earners | dept10_payroll | names                  | spread
--     2 |            2 |         105000 | Abaji, Moropant, Raoji | 10274`],
        [`Mistakes: SUM on an empty set is NULL (use COALESCE), AVG ignoring NULLs unexpectedly, COUNT(col) when COUNT(*) was meant, and summing after a one-to-many join (double counting).`,
            r`SELECT SUM(qty) AS total, COALESCE(SUM(qty), 0) AS total_or_zero FROM order_items WHERE order_id = 999;
SELECT SUM(o.total) FROM orders o JOIN order_items i ON i.order_id = o.id;                 -- order total repeated per item
SELECT SUM(total) FROM orders;                                                             -- correct

-- OUTPUT:
-- total | total_or_zero
-- NULL  |             0`],
        [`MIN/MAX on an indexed column are instant (read one end of the index); COUNT(*) on a big table scans an index. Cache counts or keep a counter table for hot dashboards, and use covering indexes for filtered counts.`,
            r`EXPLAIN SELECT MAX(id) FROM orders;
EXPLAIN SELECT COUNT(*) FROM orders WHERE status = 'NEW';

-- OUTPUT: (example)
-- first : Extra=Select tables optimized away
-- second: type=ref key=idx_status Extra=Using index`],
        [`Real-world KPI query in one pass over the data with conditional aggregates, instead of several queries.`,
            r`SELECT COUNT(*) AS orders, SUM(status = 'PAID') AS paid, SUM(status = 'CANCELLED') AS cancelled,
       ROUND(SUM(CASE WHEN status = 'PAID' THEN total END), 2) AS revenue, ROUND(AVG(CASE WHEN status = 'PAID' THEN total END), 2) AS avg_order
FROM orders WHERE created_at >= '2026-05-01' AND created_at < '2026-06-01';

-- OUTPUT:
-- orders | paid | cancelled | revenue   | avg_order
--   8201 | 7010 |       412 | 981204.50 | 139.97`]
    ),

    'GROUP BY with Aggregates': dv(
        [`Combining GROUP BY with aggregates computes one value per group. MySQL either streams the groups from an index that is already in group order or builds a temporary hash/sort structure. The grouping key set decides the number of output rows and the memory needed.`,
            r`SELECT dept, COUNT(*) AS n, SUM(salary) AS payroll, AVG(salary) AS mean, MAX(salary) AS top FROM emp GROUP BY dept ORDER BY payroll DESC;

-- OUTPUT:
-- dept | n | payroll | mean       | top
--   10 | 2 |  105000 | 52500.0000 | 60000
--   20 | 1 |   70000 | 70000.0000 | 70000`],
        [`Group by multiple columns, add totals with ROLLUP, pivot with conditional sums, list members with GROUP_CONCAT, and compute shares with window functions over the grouped result.`,
            r`SELECT dept, SUM(CASE WHEN YEAR(hired) = 2024 THEN 1 ELSE 0 END) AS hired_2024, SUM(CASE WHEN YEAR(hired) = 2025 THEN 1 ELSE 0 END) AS hired_2025 FROM emp GROUP BY dept;
SELECT dept, SUM(salary) AS payroll, ROUND(SUM(salary) / SUM(SUM(salary)) OVER () * 100, 1) AS pct FROM emp GROUP BY dept;

-- OUTPUT:
-- dept | payroll | pct
--   10 |  105000 | 60.0
--   20 |   70000 | 40.0`],
        [`Mistakes: aggregating after a fan-out join, grouping by too many columns, and filtering with HAVING when WHERE would do. Pre-aggregate each many-side separately, then join.`,
            r`SELECT o.id, SUM(i.qty * i.price) AS items_total, SUM(p.amount) AS paid_total          -- both inflated by the cross of items x payments
FROM orders o JOIN order_items i ON i.order_id = o.id JOIN payments p ON p.order_id = o.id GROUP BY o.id;

SELECT o.id, i.items_total, p.paid_total FROM orders o
JOIN (SELECT order_id, SUM(qty * price) AS items_total FROM order_items GROUP BY order_id) i ON i.order_id = o.id
JOIN (SELECT order_id, SUM(amount) AS paid_total FROM payments GROUP BY order_id) p ON p.order_id = o.id;

-- OUTPUT:
-- id | items_total | paid_total
--  1 |      900.00 |     900.00`],
        [`Speed grouped reports with an index that matches the grouping and the aggregated columns, which gives streaming aggregation without temp tables. Check <code>Created_tmp_disk_tables</code> for spills.`,
            r`ALTER TABLE orders ADD INDEX idx_status_created_total (status, created_at, total);
EXPLAIN SELECT status, DATE(created_at) AS d, SUM(total) FROM orders GROUP BY status, d;
SHOW GLOBAL STATUS LIKE 'Created_tmp%';

-- OUTPUT: (example)
-- Extra=Using index         Created_tmp_disk_tables | 4`],
        [`Real-world: daily revenue by channel for a dashboard, stored in a summary table and refreshed incrementally rather than recomputed from raw rows on each page view.`,
            r`INSERT INTO daily_channel_revenue (day, channel, orders, revenue)
SELECT DATE(created_at), channel, COUNT(*), SUM(total) FROM orders WHERE created_at >= CURDATE() GROUP BY DATE(created_at), channel
ON DUPLICATE KEY UPDATE orders = VALUES(orders), revenue = VALUES(revenue);

-- OUTPUT:
-- Query OK, 6 rows affected`]
    ),

    'WHERE vs HAVING': dv(
        [`WHERE filters input rows before grouping, so it reduces the data that is aggregated and can use indexes. HAVING filters groups after aggregation, so it can use aggregate results but cannot reduce the work already done. They answer different questions and can give different results.`,
            r`-- average of only well-paid people, per department
SELECT dept, AVG(salary) AS avg_of_high FROM emp WHERE salary > 50000 GROUP BY dept;
-- departments whose overall average is high
SELECT dept, AVG(salary) AS avg_all FROM emp GROUP BY dept HAVING AVG(salary) > 50000;

-- OUTPUT:
-- dept | avg_of_high        dept | avg_all
--   10 | 60000.0000           10 | 52500.0000
--   20 | 70000.0000           20 | 70000.0000`],
        [`Use both together: WHERE for row filters, HAVING for aggregate conditions. MySQL allows aliases in HAVING. Conditions on grouped columns can go in either place, but WHERE is cheaper.`,
            r`SELECT dept, COUNT(*) AS n, AVG(salary) AS mean FROM emp WHERE hired >= '2024-01-01' GROUP BY dept HAVING n >= 2 AND mean > 40000;
SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING dept = 10;         -- legal, but WHERE dept = 10 is better

-- OUTPUT:
-- dept | n | mean
--   10 | 2 | 52500.0000`],
        [`Mistakes: aggregate functions in WHERE (error), non-aggregate row filters in HAVING (extra work), and mixing up which one changes the aggregate values. Ask: should the row take part in the calculation (WHERE) or should the finished group be kept (HAVING)?`,
            r`SELECT dept FROM emp WHERE COUNT(*) > 1 GROUP BY dept;

-- OUTPUT:
-- ERROR 1111 (HY000): Invalid use of group function

SELECT dept FROM emp GROUP BY dept HAVING COUNT(*) > 1;`],
        [`Compare costs: with a filter in WHERE the engine reads and groups far fewer rows. EXPLAIN ANALYZE shows the row counts entering each step.`,
            r`EXPLAIN ANALYZE SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING dept = 10;
EXPLAIN ANALYZE SELECT dept, COUNT(*) FROM emp WHERE dept = 10 GROUP BY dept;

-- OUTPUT: (example)
-- HAVING version: scans 500000 rows, groups all departments, then discards
-- WHERE  version: index range scan, 40000 rows`],
        [`Real-world: customers with at least 3 paid orders in the last 90 days: WHERE narrows the rows, HAVING keeps the qualifying customers.`,
            r`SELECT customer_id, COUNT(*) AS paid_orders, SUM(total) AS spent FROM orders
WHERE status = 'PAID' AND created_at >= NOW() - INTERVAL 90 DAY
GROUP BY customer_id HAVING COUNT(*) >= 3 ORDER BY spent DESC;

-- OUTPUT:
-- customer_id | paid_orders | spent
-- 7           |           5 | 1842.00`]
    )
};
