// Modules 7-10 (SELECT Queries, Operators, MySQL Functions, Aggregate Functions) extras.
import { x, r, type Extra } from './extra';

export const e04: Record<string, Extra> = {
    'WHERE Clause': x(
        ['WHERE filters rows before they are returned: <code>SELECT * FROM emp WHERE salary &gt; 50000</code>.',
            'Combine conditions with AND, OR, NOT and parentheses.',
            'WHERE runs before GROUP BY, so it cannot use aggregate results.'],
        ['Write sargable conditions: compare the bare column to a value so an index can be used (<code>d &gt;= ...</code>, not <code>YEAR(d) = ...</code>).',
            'A leading wildcard (<code>LIKE "%x"</code>) or function on the column disables the index.',
            'Compare like types; comparing a VARCHAR column to a number forces conversion on every row.'],
        ['Use EXPLAIN to confirm the filter becomes an index range or ref access, not a scan.',
            'Combine selective predicates into a composite index ordered by equality first, then range.',
            'OR across different columns often needs index_merge or UNION rewrite for speed.'],
        [['F', 'What does WHERE do?', 'It keeps only the rows that satisfy the condition.'],
            ['F', 'How do you combine two conditions?', 'With AND (both true) or OR (either true).'],
            ['M', 'What is a sargable predicate?', 'One the optimizer can answer with an index seek, such as <code>col = ?</code> or <code>col &gt;= ?</code>, with no function wrapped around the column.'],
            ['M', 'Why does WHERE name LIKE "%son" not use an index?', 'The leading wildcard means the start of the value is unknown, so a B-tree cannot be searched.'],
            ['S', 'How do you tune an OR condition on two columns?', 'Add indexes to both and let index_merge work, or rewrite as UNION of two indexed queries.'],
            ['S', 'How do you order index columns for WHERE a = ? AND b &gt; ?', 'Equality column first, range column second: <code>INDEX (a, b)</code>.']],
        [['Find employees earning above 50000 in department 10.',
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept INT, salary INT);
INSERT INTO emp VALUES (1,'Abaji',10,60000),(2,'Raoji',10,45000),(3,'Moropant',20,70000);
SELECT name FROM emp WHERE dept = 10 AND salary > 50000;

-- OUTPUT:
-- name
-- Abaji`],
            ['Use OR with parentheses correctly.',
                r`SELECT name FROM emp WHERE (dept = 10 OR dept = 20) AND salary >= 60000;

-- OUTPUT:
-- name
-- Abaji
-- Moropant`]],
        [['Precedence trap: AND binds tighter than OR.',
            r`SELECT name FROM emp WHERE dept = 20 OR dept = 10 AND salary > 100000;

-- OUTPUT:
-- name
-- Moropant          (read as dept=20 OR (dept=10 AND salary>100000))`],
            ['Plan for a sargable filter.',
                r`ALTER TABLE emp ADD INDEX idx_dept_sal (dept, salary);
EXPLAIN SELECT id FROM emp WHERE dept = 10 AND salary > 50000;

-- OUTPUT: (example)
-- type  | key          | Extra
-- range | idx_dept_sal | Using where; Using index`]]
    ),

    'ORDER BY': x(
        ['ORDER BY sorts results: <code>ORDER BY salary DESC</code>. ASC is the default.',
            'Sort by several columns: <code>ORDER BY dept, salary DESC</code>.',
            'Without ORDER BY the row order is not guaranteed.'],
        ['You can sort by alias, expression or column position, but position numbers hurt readability.',
            'NULLs sort first in ASC and last in DESC in MySQL.',
            'Sorting large results needs memory or disk (filesort); an index in the same order avoids it.'],
        ['An index on (dept, salary) satisfies <code>ORDER BY dept, salary</code> without a sort; mixed ASC/DESC works in 8.0 with descending indexes.',
            'ORDER BY ... LIMIT uses a priority queue and is cheap; ORDER BY without LIMIT on millions of rows is expensive.',
            'Add a unique tiebreaker (id) to make pagination deterministic.'],
        [['F', 'How do you sort descending?', '<code>ORDER BY col DESC</code>.'],
            ['F', 'Is ORDER BY required to get sorted data?', 'Yes, otherwise the order is undefined.'],
            ['M', 'Where do NULLs appear when sorting?', 'First in ascending order, last in descending in MySQL.'],
            ['M', 'What is a filesort?', 'MySQL sorts the rows itself (in memory or on disk) because no index provides the order; it appears as "Using filesort" in EXPLAIN.'],
            ['S', 'How to avoid filesort?', 'Create an index matching the WHERE equality and ORDER BY columns and directions.'],
            ['S', 'Why add id to ORDER BY in pagination?', 'Ties on the sort column otherwise return rows in unstable order, causing duplicates or gaps between pages.']],
        [['Multi-column sort.',
            r`SELECT name, dept, salary FROM emp ORDER BY dept ASC, salary DESC;

-- OUTPUT:
-- name     | dept | salary
-- Abaji    |   10 | 60000
-- Raoji    |   10 | 45000
-- Moropant |   20 | 70000`],
            ['Sort by expression and alias.',
                r`SELECT name, salary * 12 AS yearly FROM emp ORDER BY yearly DESC LIMIT 1;

-- OUTPUT:
-- name     | yearly
-- Moropant | 840000`]],
        [['Detect filesort.',
            r`EXPLAIN SELECT name FROM emp ORDER BY name;

-- OUTPUT: (example)
-- type | key  | Extra
-- ALL  | NULL | Using filesort`],
            ['Index removes the sort.',
                r`ALTER TABLE emp ADD INDEX idx_name (name);
EXPLAIN SELECT name FROM emp ORDER BY name;

-- OUTPUT: (example)
-- type  | key      | Extra
-- index | idx_name | Using index`]]
    ),

    'LIMIT & Pagination': x(
        ['<code>LIMIT n</code> returns at most n rows; <code>LIMIT n OFFSET m</code> skips m first. Used for pages and "top N".',
            'Always combine with ORDER BY, or the rows you get are arbitrary.',
            'Page 3 of size 10 is <code>LIMIT 10 OFFSET 20</code>.'],
        ['OFFSET becomes slow on large values because MySQL still reads and discards skipped rows.',
            'Use keyset pagination (<code>WHERE id &lt; last_id ORDER BY id DESC LIMIT 20</code>) for deep or infinite lists.',
            'Show "next/previous" instead of exact page counts when COUNT(*) is expensive.'],
        ['Cap page size server-side to avoid abusive requests.',
            'Deferred join: select ids with OFFSET on a narrow index, then join to fetch full rows.',
            'Pagination under concurrent inserts needs stable ordering and often an opaque cursor.'],
        [['F', 'How do you get the first 5 rows?', '<code>SELECT ... ORDER BY ... LIMIT 5;</code>'],
            ['F', 'How is page 2 with 10 per page written?', '<code>LIMIT 10 OFFSET 10</code>.'],
            ['M', 'Why is large OFFSET slow?', 'The server must scan and throw away all skipped rows before returning the page.'],
            ['M', 'What is keyset pagination?', 'Using the last seen key (id or time) in WHERE to continue, so each page is an index range scan.'],
            ['S', 'How do you paginate stably when many rows share the same timestamp?', 'Order by (created_at, id) and use both in the keyset comparison.'],
            ['S', 'How do you provide total counts cheaply?', 'Approximate counts, cached counts, or "10000+" caps; exact COUNT(*) on big filtered sets is a scan.']],
        [['Top 2 highest paid.',
            r`SELECT name, salary FROM emp ORDER BY salary DESC LIMIT 2;

-- OUTPUT:
-- name     | salary
-- Moropant | 70000
-- Abaji    | 60000`],
            ['Second page of size 1.',
                r`SELECT name FROM emp ORDER BY id LIMIT 1 OFFSET 1;

-- OUTPUT:
-- name
-- Raoji`]],
        [['Keyset next page after id 1.',
            r`SELECT id, name FROM emp WHERE id > 1 ORDER BY id LIMIT 2;

-- OUTPUT:
-- id | name
--  2 | Raoji
--  3 | Moropant`],
            ['Deferred join.',
                r`SELECT e.* FROM emp e JOIN (SELECT id FROM emp ORDER BY salary DESC LIMIT 1 OFFSET 1) t ON t.id = e.id;

-- OUTPUT:
-- id | name  | dept | salary
--  1 | Abaji |   10 | 60000`]]
    ),

    'DISTINCT': x(
        ['<code>SELECT DISTINCT dept FROM emp</code> removes duplicate rows from the result.',
            'DISTINCT applies to the whole row of selected columns, not just the first column.',
            'Use it to list unique values such as cities or categories.'],
        ['<code>COUNT(DISTINCT col)</code> counts unique values.',
            'DISTINCT usually needs a temporary table or index scan; it can be expensive on large sets.',
            'Do not use DISTINCT to hide a bad join that duplicates rows; fix the join.'],
        ['Often <code>GROUP BY</code> or <code>EXISTS</code> is a better tool than DISTINCT over a joined result.',
            'An index on the distinct column lets MySQL do a loose index scan.',
            'Duplicate rows after a join signal a one-to-many relationship that should be aggregated or filtered by EXISTS.'],
        [['F', 'What does DISTINCT do?', 'Returns only unique rows in the result.'],
            ['F', 'How to count unique departments?', '<code>SELECT COUNT(DISTINCT dept) FROM emp;</code>'],
            ['M', 'Does DISTINCT apply to one column or all?', 'To the combination of all selected columns.'],
            ['M', 'DISTINCT vs GROUP BY?', 'For simple uniqueness they are equivalent; GROUP BY also allows aggregates.'],
            ['S', 'Why is DISTINCT after a join a code smell?', 'It often masks duplicated rows from a one-to-many join; use EXISTS or aggregate instead.'],
            ['S', 'How does an index help DISTINCT?', 'MySQL can read only the first entry per distinct value (loose index scan) instead of every row.']],
        [['Unique departments.',
            r`SELECT DISTINCT dept FROM emp ORDER BY dept;

-- OUTPUT:
-- dept
-- 10
-- 20`],
            ['Count distinct vs count.',
                r`SELECT COUNT(dept) AS all_rows, COUNT(DISTINCT dept) AS unique_depts FROM emp;

-- OUTPUT:
-- all_rows | unique_depts
--        3 |            2`]],
        [['Distinct on combinations.',
            r`SELECT DISTINCT dept, salary > 50000 AS high FROM emp ORDER BY dept;

-- OUTPUT:
-- dept | high
--   10 |    0
--   10 |    1
--   20 |    1`],
            ['Use EXISTS instead of DISTINCT over a join.',
                r`SELECT d.name FROM departments d WHERE EXISTS (SELECT 1 FROM emp e WHERE e.dept = d.id);

-- OUTPUT:
-- name
-- HR
-- IT`]]
    ),

    'GROUP BY & HAVING in SELECT': x(
        ['GROUP BY collapses rows into groups; aggregates (COUNT, SUM, AVG) are computed per group.',
            'HAVING filters groups after aggregation; WHERE filters rows before it.',
            'Example: departments with average salary above 50000.'],
        ['Every selected non-aggregated column must be in GROUP BY (ONLY_FULL_GROUP_BY mode, default in 8.0).',
            'You can group by expressions: <code>GROUP BY YEAR(d)</code>.',
            'Use WHERE to cut rows early so less data is grouped.'],
        ['An index on the GROUP BY columns allows streaming aggregation without a temporary table.',
            '<code>WITH ROLLUP</code> adds subtotal rows.',
            'Wide GROUP BY on huge tables is a good candidate for pre-aggregated summary tables.'],
        [['F', 'What does GROUP BY do?', 'Groups rows with the same value so aggregates are computed per group.'],
            ['F', 'WHERE vs HAVING?', 'WHERE filters rows before grouping; HAVING filters groups after aggregation.'],
            ['M', 'What is ONLY_FULL_GROUP_BY?', 'A SQL mode that rejects selecting non-grouped, non-aggregated columns because their values would be ambiguous.'],
            ['M', 'What does WITH ROLLUP do?', 'Adds subtotal and grand total rows to grouped output.'],
            ['S', 'How do you speed up GROUP BY?', 'Index the grouping columns, filter earlier with WHERE, avoid grouping on expressions, or use a summary table.'],
            ['S', 'When is a summary table better?', 'For dashboards that repeatedly aggregate big tables; maintain it with batch jobs or incremental updates.']],
        [['Average salary per department over 50000.',
            r`SELECT dept, AVG(salary) AS avg_sal FROM emp GROUP BY dept HAVING AVG(salary) > 50000;

-- OUTPUT:
-- dept | avg_sal
--   10 | 52500.0000
--   20 | 70000.0000`],
            ['Count rows per dept after filtering.',
                r`SELECT dept, COUNT(*) AS n FROM emp WHERE salary >= 50000 GROUP BY dept;

-- OUTPUT:
-- dept | n
--   10 | 1
--   20 | 1`]],
        [['Subtotals with ROLLUP.',
            r`SELECT dept, SUM(salary) AS total FROM emp GROUP BY dept WITH ROLLUP;

-- OUTPUT:
-- dept | total
--   10 | 105000
--   20 |  70000
-- NULL | 175000`],
            ['Strict group-by error.',
                r`SELECT dept, name, COUNT(*) FROM emp GROUP BY dept;

-- OUTPUT:
-- ERROR 1055 (42000): Expression #2 of SELECT list is not in GROUP BY clause and contains nonaggregated column 'emp.name'`]]
    ),

    'Order of Clause Execution': x(
        ['SQL is written SELECT first but runs in a different order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.',
            'This explains why you cannot use a SELECT alias in WHERE.',
            'WHERE filters rows; HAVING filters groups.'],
        ['MySQL is lenient: it allows aliases in GROUP BY, HAVING and ORDER BY, but not in WHERE.',
            'Window functions run after WHERE/GROUP BY/HAVING and before ORDER BY/LIMIT.',
            'Knowing the order lets you place filters where they cut data earliest.'],
        ['The optimizer may reorder physical steps (push predicates down, reorder joins) but must preserve this logical result.',
            'DISTINCT is applied after SELECT expressions; LIMIT applies last, which is why LIMIT cannot reduce the cost of a full sort without an index.',
            'Derived tables and CTEs create new scopes where earlier aliases become usable.'],
        [['F', 'Which runs first, WHERE or SELECT?', 'WHERE; SELECT list is evaluated after filtering and grouping.'],
            ['F', 'Why can I not use a SELECT alias in WHERE?', 'Because WHERE runs before the SELECT list is computed.'],
            ['M', 'Give the logical order of clauses.', 'FROM/JOIN, WHERE, GROUP BY, HAVING, window functions, SELECT, DISTINCT, ORDER BY, LIMIT.'],
            ['M', 'How do you filter on an alias?', 'Repeat the expression, wrap in a derived table/CTE, or use HAVING when grouped.'],
            ['S', 'Why does a window function result not work in WHERE?', 'Windows are computed after WHERE; filter in an outer query or CTE.'],
            ['S', 'Does the optimizer follow this order physically?', 'No, only logically; it pushes filters down and picks join order for cost, but the semantics stay the same.']],
        [['Alias in WHERE fails.',
            r`SELECT salary * 12 AS yearly FROM emp WHERE yearly > 600000;

-- OUTPUT:
-- ERROR 1054 (42S22): Unknown column 'yearly' in 'where clause'`],
            ['Fix with derived table.',
                r`SELECT * FROM (SELECT name, salary * 12 AS yearly FROM emp) t WHERE yearly > 600000;

-- OUTPUT:
-- name     | yearly
-- Moropant | 840000`]],
        [['Alias allowed in ORDER BY and HAVING.',
            r`SELECT dept, SUM(salary) AS total FROM emp GROUP BY dept HAVING total > 100000 ORDER BY total DESC;

-- OUTPUT:
-- dept | total
--   10 | 105000`],
            ['Window result needs an outer query.',
                r`SELECT * FROM (SELECT name, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn FROM emp) t WHERE rn = 1;

-- OUTPUT:
-- name     | rn
-- Moropant | 1`]]
    ),

    'Comparison Operators': x(
        ['Comparison operators: <code>=</code>, <code>!=</code> or <code>&lt;&gt;</code>, <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>.',
            'A single = is comparison in SQL (assignment in SET uses = or :=).',
            'Comparing with NULL gives NULL; use IS NULL instead.'],
        ['<code>&lt;=&gt;</code> is the NULL-safe equal: <code>NULL &lt;=&gt; NULL</code> is 1.',
            'String comparisons depend on collation (case and accent sensitivity).',
            'Row comparison works: <code>(a, b) &lt; (1, 2)</code>, handy for keyset pagination.'],
        ['Type coercion can change results and kill indexes: comparing string columns to numbers converts every row.',
            'Floating-point equality is unreliable; compare DECIMAL or use a tolerance.',
            'Use consistent collations across joined columns to avoid "illegal mix of collations" errors and index loss.'],
        [['F', 'Which operator tests inequality?', '<code>!=</code> or <code>&lt;&gt;</code>.'],
            ['F', 'Is "a" = "A" in MySQL?', 'By default yes, because the default collation is case-insensitive.'],
            ['M', 'What does &lt;=&gt; do?', 'NULL-safe equality: returns 1 when both sides are NULL.'],
            ['M', 'What does comparing with NULL return?', 'NULL (unknown), so use IS NULL or &lt;=&gt;.'],
            ['S', 'Why is comparing a VARCHAR column with an integer risky?', 'MySQL casts the column to a number for each row, which skips the index and can match unexpected values like "1abc".'],
            ['S', 'How does row comparison help pagination?', '<code>(created_at, id) &lt; (?, ?)</code> expresses a keyset boundary in one indexable predicate.']],
        [['Basic comparisons.',
            r`SELECT 5 > 3 AS gt, 5 <> 5 AS neq, 'a' = 'A' AS ci, NULL = NULL AS null_eq, NULL <=> NULL AS safe_eq;

-- OUTPUT:
-- gt | neq | ci | null_eq | safe_eq
--  1 |   0 |  1 |    NULL |       1`],
            ['Filter by inequality.',
                r`SELECT name FROM emp WHERE dept <> 10;

-- OUTPUT:
-- name
-- Moropant`]],
        [['Row comparison.',
            r`SELECT id FROM emp WHERE (dept, id) > (10, 1) ORDER BY dept, id;

-- OUTPUT:
-- id
-- 2
-- 3`],
            ['Unexpected string-number conversion.',
                r`SELECT '12abc' = 12 AS match_flag;

-- OUTPUT:
-- match_flag
-- 1`]]
    ),

    'Logical Operators: AND, OR & NOT': x(
        ['AND needs both conditions true; OR needs at least one; NOT reverses a condition.',
            'Use parentheses to make intent clear.',
            'AND is evaluated before OR.'],
        ['NULL logic: TRUE AND NULL is NULL; FALSE AND NULL is FALSE; TRUE OR NULL is TRUE.',
            '<code>NOT IN</code> with a NULL in the list returns no rows; prefer NOT EXISTS.',
            '<code>XOR</code> exists but is rarely used.'],
        ['Complex OR conditions block index use; rewrite to UNION or use IN lists.',
            'The optimizer reorders conditions by cost, so do not rely on short-circuit side effects.',
            'Test boundary data (NULLs, empty strings) for every business filter.'],
        [['F', 'Which has higher precedence, AND or OR?', 'AND.'],
            ['F', 'What does NOT do?', 'Inverts a condition (true becomes false).'],
            ['M', 'What is TRUE AND NULL?', 'NULL (unknown).'],
            ['M', 'Why does NOT IN sometimes return nothing?', 'If the list contains NULL, comparisons become unknown so no row qualifies; use NOT EXISTS.'],
            ['S', 'How to optimise WHERE a = 1 OR b = 2?', 'Index both and rely on index_merge, or rewrite as <code>SELECT ... WHERE a=1 UNION SELECT ... WHERE b=2</code>.'],
            ['S', 'Can you rely on short-circuit evaluation?', 'No; MySQL decides evaluation order, so do not put side effects or error-prone expressions after AND expecting protection.']],
        [['Precedence demo.',
            r`SELECT (TRUE OR FALSE AND FALSE) AS no_parens, ((TRUE OR FALSE) AND FALSE) AS with_parens;

-- OUTPUT:
-- no_parens | with_parens
--         1 |           0`],
            ['Three-valued logic.',
                r`SELECT TRUE AND NULL AS a, FALSE AND NULL AS b, TRUE OR NULL AS c, NOT NULL AS d;

-- OUTPUT:
-- a    | b | c | d
-- NULL | 0 | 1 | NULL`]],
        [['NOT IN trap with NULL.',
            r`SELECT name FROM emp WHERE dept NOT IN (10, NULL);

-- OUTPUT:
-- Empty set`],
            ['NOT EXISTS version.',
                r`SELECT name FROM emp e WHERE NOT EXISTS (SELECT 1 FROM (SELECT 10 AS d) x WHERE x.d = e.dept);

-- OUTPUT:
-- name
-- Moropant`]]
    ),

    'BETWEEN, IN & NOT IN': x(
        ['<code>BETWEEN a AND b</code> is inclusive on both ends. <code>IN (1,2,3)</code> matches any value in the list.',
            '<code>NOT IN</code> excludes the listed values.',
            'Both are shorter than long OR/AND chains.'],
        ['BETWEEN works for numbers, dates and strings; with datetime be careful with end-of-day (use <code>&lt; next_day</code>).',
            'IN can take a subquery: <code>WHERE dept IN (SELECT id FROM departments WHERE ...)</code>.',
            'NOT IN with NULLs returns no rows; prefer NOT EXISTS.'],
        ['Huge IN lists (thousands) hurt parsing and planning; load ids into a temp table and join.',
            'For date ranges use half-open intervals to avoid double-counting boundaries.',
            'IN on an indexed column becomes range lookups; ensure types match.'],
        [['F', 'Is BETWEEN inclusive?', 'Yes, both ends are included.'],
            ['F', 'How do you match any of several values?', 'Use IN (v1, v2, ...).'],
            ['M', 'Why avoid BETWEEN for datetime ranges?', '<code>BETWEEN "2026-01-01" AND "2026-01-31"</code> excludes times after midnight on the 31st; use <code>&gt;= start AND &lt; next_start</code>.'],
            ['M', 'What is the NOT IN NULL problem?', 'A NULL in the list makes the whole NOT IN evaluate to unknown, returning no rows.'],
            ['S', 'How to filter by 10,000 ids?', 'Insert them in a temporary table (or JSON_TABLE) and JOIN; avoid a giant IN list.'],
            ['S', 'IN subquery or JOIN?', 'Modern MySQL turns IN subqueries into semijoins; use EXISTS/JOIN according to readability and verify with EXPLAIN.']],
        [['Salary band and dept list.',
            r`SELECT name FROM emp WHERE salary BETWEEN 45000 AND 60000 AND dept IN (10, 30);

-- OUTPUT:
-- name
-- Abaji
-- Raoji`],
            ['NOT IN list.',
                r`SELECT name FROM emp WHERE id NOT IN (1,2);

-- OUTPUT:
-- name
-- Moropant`]],
        [['Half-open datetime range.',
            r`SELECT COUNT(*) FROM orders WHERE created_at >= '2026-01-31' AND created_at < '2026-02-01';

-- OUTPUT:
-- COUNT(*)
-- 12`],
            ['Join with a temp list instead of a huge IN.',
                r`CREATE TEMPORARY TABLE ids (id INT PRIMARY KEY);
INSERT INTO ids VALUES (1),(3);
SELECT e.name FROM emp e JOIN ids i ON i.id = e.id;

-- OUTPUT:
-- name
-- Abaji
-- Moropant`]]
    ),

    'LIKE & Pattern Matching': x(
        ['LIKE searches text patterns: <code>%</code> matches any number of characters, <code>_</code> matches exactly one.',
            '<code>name LIKE "A%"</code> starts with A; <code>"%son"</code> ends with son; <code>"%an%"</code> contains an.',
            'Comparisons are case-insensitive with the default collation.'],
        ['Only prefix patterns (<code>"abc%"</code>) can use a B-tree index.',
            'Escape wildcards with <code>\\</code> or use <code>ESCAPE</code> when the text contains % or _.',
            'REGEXP gives powerful patterns but cannot use indexes.'],
        ['For contains-search over large tables use FULLTEXT or an external search engine instead of <code>LIKE "%x%"</code>.',
            'User input in LIKE must be escaped to avoid wildcard injection and performance abuse.',
            'Reverse-string generated columns can index suffix searches.'],
        [['F', 'What do % and _ mean in LIKE?', '% = any number of characters, _ = exactly one character.'],
            ['F', 'Find names starting with A.', '<code>WHERE name LIKE "A%"</code>.'],
            ['M', 'Why is LIKE "%abc" slow?', 'The leading wildcard prevents an index range lookup, forcing a scan.'],
            ['M', 'How to search for a literal percent sign?', '<code>LIKE "50\\%" </code> or <code>LIKE "50!%" ESCAPE "!"</code>.'],
            ['S', 'How do you implement fast contains-search?', 'FULLTEXT index with MATCH ... AGAINST, ngram parser for CJK, or Elasticsearch/OpenSearch for advanced needs.'],
            ['S', 'How can you index a suffix search?', 'Store a reversed string in a generated column, index it, and query by prefix on the reversed value.']],
        [['Wildcards in action.',
            r`SELECT name FROM emp WHERE name LIKE 'A%' OR name LIKE '_avi';

-- OUTPUT:
-- name
-- Abaji
-- Raoji`],
            ['Case-insensitive and exact length.',
                r`SELECT 'MySQL' LIKE 'my___' AS five_chars, 'MySQL' LIKE 'my__' AS four_chars;

-- OUTPUT:
-- five_chars | four_chars
--          1 |          0`]],
        [['Escape a literal underscore.',
            r`SELECT 'a_b' LIKE 'a\_b' AS literal_match, 'axb' LIKE 'a\_b' AS no_match;

-- OUTPUT:
-- literal_match | no_match
--             1 |        0`],
            ['Plan: prefix uses index, contains does not.',
                r`EXPLAIN SELECT id FROM emp WHERE name LIKE 'As%';
EXPLAIN SELECT id FROM emp WHERE name LIKE '%sh%';

-- OUTPUT: (example)
-- type  | key      (first)  range | idx_name
-- type  | key      (second) index | idx_name   (full index scan)`]]
    ),

    'IS NULL & IS NOT NULL': x(
        ['NULL means missing or unknown. Test it with <code>IS NULL</code> or <code>IS NOT NULL</code>, never with = NULL.',
            'NULL is not zero and not an empty string.',
            'Aggregates such as SUM and AVG ignore NULLs; COUNT(col) ignores them too, COUNT(*) does not.'],
        ['<code>COALESCE(col, default)</code> replaces NULL with a value.',
            'Joins on NULL never match; use LEFT JOIN ... IS NULL to find missing relations.',
            'UNIQUE indexes allow multiple NULLs in MySQL.'],
        ['Nullable columns complicate semantics; use NOT NULL with explicit defaults when the business requires a value.',
            'IS NULL can use an index; in InnoDB NULLs are indexed.',
            'Beware ORM mapping of NULL vs empty values, which often causes inconsistent data.'],
        [['F', 'How do you find rows with no value?', '<code>WHERE col IS NULL</code>.'],
            ['F', 'Why does col = NULL return nothing?', 'Because NULL is unknown; the comparison is never true.'],
            ['M', 'COUNT(*) vs COUNT(col)?', 'COUNT(*) counts rows; COUNT(col) counts non-NULL values.'],
            ['M', 'How do you list customers with no orders?', '<code>customers LEFT JOIN orders ... WHERE orders.id IS NULL</code>.'],
            ['S', 'Is NULL indexed in InnoDB?', 'Yes, IS NULL conditions can use an index.'],
            ['S', 'Why prefer NOT NULL columns?', 'Fewer edge cases in logic, better constraint guarantees and cleaner aggregates; model optionality in separate tables when large.']],
        [['Find and replace NULL.',
            r`CREATE TABLE contacts (id INT, phone VARCHAR(15));
INSERT INTO contacts VALUES (1,'9999'),(2,NULL),(3,'');
SELECT id, COALESCE(phone,'n/a') AS phone FROM contacts WHERE phone IS NULL;

-- OUTPUT:
-- id | phone
--  2 | n/a`],
            ['NULL vs empty string.',
                r`SELECT COUNT(*) AS rows_n, COUNT(phone) AS non_null, SUM(phone = '') AS empty_n FROM contacts;

-- OUTPUT:
-- rows_n | non_null | empty_n
--      3 |        2 |       1`]],
        [['Customers without orders.',
            r`SELECT c.id FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;

-- OUTPUT:
-- id
-- 2`],
            ['IS NULL uses an index.',
                r`ALTER TABLE contacts ADD INDEX idx_phone (phone);
EXPLAIN SELECT id FROM contacts WHERE phone IS NULL;

-- OUTPUT: (example)
-- type | key       | Extra
-- ref  | idx_phone | Using index condition`]]
    ),

    'String Functions': x(
        ['Common string functions: <code>CONCAT</code>, <code>LENGTH</code>, <code>UPPER</code>, <code>LOWER</code>, <code>SUBSTRING</code>, <code>TRIM</code>, <code>REPLACE</code>.',
            'CONCAT joins strings; if any part is NULL, the result is NULL (use <code>CONCAT_WS</code> to skip NULLs).',
            'Strings are 1-indexed in SQL.'],
        ['<code>LENGTH</code> counts bytes, <code>CHAR_LENGTH</code> counts characters.',
            'Useful extras: <code>LEFT</code>, <code>RIGHT</code>, <code>LPAD</code>, <code>INSTR</code>, <code>FORMAT</code>, <code>REVERSE</code>.',
            'Putting a function on an indexed column in WHERE stops index use.'],
        ['Do formatting in the application where possible; keep the database for filtering and joining.',
            'Normalize data on write (lowercase emails) instead of calling LOWER() in every query.',
            'Functional indexes (8.0.13+) or generated columns can index expressions when needed.'],
        [['F', 'How do you join two strings?', '<code>CONCAT(a, b)</code>.'],
            ['F', 'How do you get the length of a string?', '<code>CHAR_LENGTH(s)</code> for characters, <code>LENGTH(s)</code> for bytes.'],
            ['M', 'What does CONCAT return if one argument is NULL?', 'NULL; use CONCAT_WS or COALESCE to avoid it.'],
            ['M', 'Which index position does SUBSTRING start from?', '1.'],
            ['S', 'How can you index LOWER(email)?', 'Use a functional index <code>((LOWER(email)))</code> or a generated column with an index.'],
            ['S', 'Why avoid heavy string functions in WHERE?', 'They are computed per row and disable normal index lookups.']],
        [['Common functions together.',
            r`SELECT CONCAT(UPPER(LEFT('abaji',1)), LOWER(SUBSTRING('ABAJI',2))) AS proper,
       TRIM('  hi  ') AS trimmed, REPLACE('a-b-c','-','/') AS replaced, CHAR_LENGTH('MySQL') AS n;

-- OUTPUT:
-- proper | trimmed | replaced | n
-- Abaji  | hi      | a/b/c    | 5`],
            ['CONCAT with NULL.',
                r`SELECT CONCAT('a', NULL, 'b') AS c1, CONCAT_WS('-', 'a', NULL, 'b') AS c2;

-- OUTPUT:
-- c1   | c2
-- NULL | a-b`]],
        [['Functional index on lowercase email.',
            r`ALTER TABLE users ADD INDEX idx_lower_email ((LOWER(email)));
EXPLAIN SELECT id FROM users WHERE LOWER(email) = 'a@x.com';

-- OUTPUT: (example)
-- type | key             | Extra
-- ref  | idx_lower_email | NULL`],
            ['Pad and format.',
                r`SELECT LPAD(7, 3, '0') AS padded, FORMAT(1234567.891, 2) AS formatted;

-- OUTPUT:
-- padded | formatted
-- 007    | 1,234,567.89`]]
    ),

    'Numeric Functions': x(
        ['Common numeric functions: <code>ROUND</code>, <code>CEIL</code>, <code>FLOOR</code>, <code>ABS</code>, <code>MOD</code>.',
            'ROUND(x, 2) rounds to 2 decimals; CEIL rounds up; FLOOR rounds down.',
            'Use <code>%</code> or <code>MOD</code> for remainders.'],
        ['ROUND on DECIMAL rounds half away from zero; on FLOAT/DOUBLE it uses the C library (banker-like behaviour in some cases).',
            'Other useful ones: <code>POWER</code>, <code>SQRT</code>, <code>TRUNCATE</code>, <code>RAND</code>, <code>SIGN</code>.',
            'Integer division with <code>DIV</code> avoids decimals.'],
        ['Rounding rules matter for money: define when and how to round, and keep scale in DECIMAL.',
            '<code>ORDER BY RAND()</code> sorts the whole table and is slow; pick random ids another way.',
            'Division by zero returns NULL (or errors in strict ERROR_FOR_DIVISION_BY_ZERO with DML).'],
        [['F', 'ROUND(3.567, 2) returns?', '3.57.'],
            ['F', 'Difference between CEIL and FLOOR?', 'CEIL rounds up to the next integer; FLOOR rounds down.'],
            ['M', 'What does TRUNCATE(3.789, 1) return?', '3.7 (cuts off without rounding).'],
            ['M', 'What does 5/0 return in MySQL?', 'NULL in SELECT (a warning), or an error for INSERT/UPDATE in strict mode.'],
            ['S', 'Why avoid ORDER BY RAND() on big tables?', 'It generates a random value for every row and sorts them all.'],
            ['S', 'How to pick a random row efficiently?', 'Pick a random id within [min,max] and fetch the next existing id, or use a pre-sampled table.']],
        [['Rounding functions.',
            r`SELECT ROUND(3.567,2) AS r, CEIL(3.1) AS c, FLOOR(3.9) AS f, ABS(-7) AS a, MOD(10,3) AS m, TRUNCATE(3.789,1) AS t;

-- OUTPUT:
-- r    | c | f | a | m | t
-- 3.57 | 4 | 3 | 7 | 1 | 3.7`],
            ['Integer division.',
                r`SELECT 17 DIV 5 AS quotient, 17 MOD 5 AS remainder, 17 / 5 AS decimal_result;

-- OUTPUT:
-- quotient | remainder | decimal_result
--        3 |         2 |         3.4000`]],
        [['Divide by zero.',
            r`SELECT 10 / 0 AS result;

-- OUTPUT:
-- result
-- NULL`],
            ['Percent calculation.',
                r`SELECT name, ROUND(salary / (SELECT SUM(salary) FROM emp) * 100, 1) AS pct FROM emp;

-- OUTPUT:
-- name     | pct
-- Abaji    | 34.3
-- Raoji    | 25.7
-- Moropant | 40.0`]]
    ),

    'Date Functions': x(
        ['Key functions: <code>NOW()</code>, <code>CURDATE()</code>, <code>CURTIME()</code>, <code>DATE()</code>, <code>YEAR()</code>, <code>MONTH()</code>, <code>DAY()</code>, <code>DATEDIFF()</code>, <code>DATE_ADD()</code>, <code>DATE_SUB()</code>.',
            'Add time with <code>DATE_ADD(d, INTERVAL 7 DAY)</code>.',
            '<code>DATE_FORMAT(d, "%d-%m-%Y")</code> formats dates for display.'],
        ['<code>DATEDIFF(a, b)</code> returns days between dates; <code>TIMESTAMPDIFF(unit, a, b)</code> returns any unit.',
            '<code>LAST_DAY()</code>, <code>DAYNAME()</code>, <code>WEEK()</code> and <code>EXTRACT()</code> are common in reports.',
            '<code>NOW()</code> is fixed for the statement; <code>SYSDATE()</code> changes per call.'],
        ['Avoid wrapping indexed date columns in functions in WHERE; use ranges.',
            'Group by month with a computed column or a calendar table for fast, correct reporting (including missing months).',
            'Keep session and server time zones explicit and preferably UTC.'],
        [['F', 'How do you get today’s date?', '<code>CURDATE()</code>.'],
            ['F', 'How do you add 30 days?', '<code>DATE_ADD(d, INTERVAL 30 DAY)</code>.'],
            ['M', 'DATEDIFF vs TIMESTAMPDIFF?', 'DATEDIFF returns days only; TIMESTAMPDIFF supports units like MONTH or HOUR.'],
            ['M', 'NOW() vs SYSDATE()?', 'NOW() is the statement start time (constant within the statement); SYSDATE() is the actual current time at each call.'],
            ['S', 'How do you report revenue by month including months with no sales?', 'LEFT JOIN a calendar (or generated month series via recursive CTE) to the aggregated data.'],
            ['S', 'Why is YEAR(d)=2026 bad for performance?', 'It prevents index use; use a range from 2026-01-01 up to but excluding 2027-01-01.']],
        [['Date arithmetic and parts.',
            r`SELECT DATE_ADD('2026-01-31', INTERVAL 1 MONTH) AS plus_month, DATEDIFF('2026-03-01','2026-02-01') AS days,
       YEAR('2026-07-15') AS y, MONTHNAME('2026-07-15') AS m, DAYNAME('2026-07-15') AS dn;

-- OUTPUT:
-- plus_month | days | y    | m    | dn
-- 2026-02-28 |   28 | 2026 | July | Wednesday`],
            ['Age in years.',
                r`SELECT TIMESTAMPDIFF(YEAR, '1995-08-20', '2026-08-19') AS age;

-- OUTPUT:
-- age
-- 30`]],
        [['Month start and end.',
            r`SELECT DATE_FORMAT('2026-07-15','%Y-%m-01') AS month_start, LAST_DAY('2026-07-15') AS month_end;

-- OUTPUT:
-- month_start | month_end
-- 2026-07-01  | 2026-07-31`],
            ['Monthly report with zero months.',
                r`WITH RECURSIVE m AS (SELECT '2026-01-01' AS d UNION ALL SELECT d + INTERVAL 1 MONTH FROM m WHERE d < '2026-03-01')
SELECT DATE_FORMAT(m.d,'%Y-%m') AS month, COALESCE(SUM(o.total),0) AS revenue
FROM m LEFT JOIN orders o ON DATE_FORMAT(o.created_at,'%Y-%m') = DATE_FORMAT(m.d,'%Y-%m') GROUP BY m.d;

-- OUTPUT: (example)
-- month   | revenue
-- 2026-01 | 1200
-- 2026-02 |    0
-- 2026-03 |  800`]]
    ),

    'NULL Functions: COALESCE, IFNULL & NULLIF': x(
        ['<code>COALESCE(a, b, c)</code> returns the first non-NULL value. <code>IFNULL(a, b)</code> is the two-argument version.',
            '<code>NULLIF(a, b)</code> returns NULL if a equals b, otherwise a.',
            'Use them to show defaults or avoid division by zero.'],
        ['COALESCE is standard SQL and accepts many arguments; IFNULL is MySQL-specific.',
            '<code>x / NULLIF(y, 0)</code> prevents divide-by-zero errors.',
            'Return types are the compatible type of all arguments, which can change formatting.'],
        ['Wrapping an indexed column in COALESCE in WHERE disables the index; model the default in the column instead.',
            'Use NULLIF to turn sentinel values like empty strings into real NULLs.',
            'Be explicit about NULL semantics in API contracts (missing vs empty).'],
        [['F', 'What does COALESCE do?', 'Returns the first non-NULL argument.'],
            ['F', 'What does IFNULL(a, b) return?', 'a if a is not NULL, otherwise b.'],
            ['M', 'What is NULLIF used for?', 'Turning a specific value into NULL, commonly to avoid division by zero.'],
            ['M', 'COALESCE vs IFNULL?', 'COALESCE is standard and multi-argument; IFNULL is MySQL’s two-argument form.'],
            ['S', 'Why not WHERE COALESCE(col,0)=0 on a big table?', 'The function blocks the index; write <code>col = 0 OR col IS NULL</code> or store 0 with NOT NULL DEFAULT 0.'],
            ['S', 'How do you clean sentinel empty strings?', 'UPDATE with NULLIF(col, "") and add a CHECK or normalization at write time.']],
        [['Defaults for missing values.',
            r`SELECT COALESCE(NULL, NULL, 'third') AS first_non_null, IFNULL(NULL, 'fallback') AS fb, NULLIF(5,5) AS n1, NULLIF(5,6) AS n2;

-- OUTPUT:
-- first_non_null | fb       | n1   | n2
-- third          | fallback | NULL |  5`],
            ['Safe division.',
                r`SELECT 100 / NULLIF(0, 0) AS safe;

-- OUTPUT:
-- safe
-- NULL`]],
        [['Report with defaults.',
            r`SELECT id, COALESCE(phone, 'no phone') AS phone FROM contacts ORDER BY id;

-- OUTPUT:
-- id | phone
--  1 | 9999
--  2 | no phone
--  3 |`],
            ['Normalize empty strings to NULL.',
                r`UPDATE contacts SET phone = NULLIF(phone, '') WHERE id = 3;
SELECT phone IS NULL FROM contacts WHERE id = 3;

-- OUTPUT:
-- phone IS NULL
-- 1`]]
    ),

    'COUNT, SUM, AVG, MIN & MAX': x(
        ['Aggregate functions summarise many rows into one value: COUNT, SUM, AVG, MIN, MAX.',
            'COUNT(*) counts rows; COUNT(col) counts non-NULL values.',
            'Aggregates ignore NULLs (except COUNT(*)).'],
        ['AVG ignores NULLs, so it may not equal SUM / COUNT(*).',
            'Combine with GROUP BY for per-group results.',
            'SUM of an empty set is NULL, COUNT of an empty set is 0.'],
        ['<code>COUNT(*)</code> on InnoDB must scan an index (no stored row count); big counts are expensive, so cache or approximate.',
            'Use covering indexes for MIN/MAX: MySQL can answer from index ends instantly.',
            'Use DECIMAL for sums of money; floating sums drift.'],
        [['F', 'Difference between COUNT(*) and COUNT(col)?', 'COUNT(*) counts all rows; COUNT(col) counts rows where col is not NULL.'],
            ['F', 'Which functions ignore NULL?', 'All aggregates except COUNT(*).'],
            ['M', 'What does SUM return on no rows?', 'NULL (COUNT returns 0).'],
            ['M', 'Is AVG(col) equal to SUM(col)/COUNT(*)?', 'Not if NULLs exist; AVG divides by the count of non-NULL values.'],
            ['S', 'Why is COUNT(*) slow on huge InnoDB tables?', 'MVCC means there is no single row count; the engine scans the smallest index. Use summary counters or estimates.'],
            ['S', 'How can MIN/MAX be instant?', 'With an index on the column, MySQL reads just the first or last index entry.']],
        [['All aggregates at once.',
            r`SELECT COUNT(*) AS n, SUM(salary) AS total, AVG(salary) AS avg_sal, MIN(salary) AS lo, MAX(salary) AS hi FROM emp;

-- OUTPUT:
-- n | total  | avg_sal    | lo    | hi
-- 3 | 175000 | 58333.3333 | 45000 | 70000`],
            ['NULL handling.',
                r`SELECT COUNT(*) AS rows_n, COUNT(phone) AS phones, SUM(NULL) AS s FROM contacts;

-- OUTPUT:
-- rows_n | phones | s
--      3 |      2 | NULL`]],
        [['Conditional aggregate.',
            r`SELECT SUM(salary > 50000) AS high_earners, SUM(CASE WHEN dept = 10 THEN salary ELSE 0 END) AS dept10_total FROM emp;

-- OUTPUT:
-- high_earners | dept10_total
--            2 |       105000`],
            ['Fast MIN with index.',
                r`EXPLAIN SELECT MIN(salary) FROM emp;

-- OUTPUT: (example, with an index on salary)
-- Extra
-- Select tables optimized away`]]
    ),

    'GROUP BY with Aggregates': x(
        ['GROUP BY plus aggregates answers "per" questions: salary per department, orders per customer.',
            'Every column in SELECT must be grouped or aggregated.',
            'Group by several columns for finer detail.'],
        ['Use HAVING to filter on aggregate results and WHERE to filter input rows.',
            'Conditional aggregation with CASE builds pivot-style reports.',
            'GROUP_CONCAT lists values per group (watch <code>group_concat_max_len</code>).'],
        ['Pre-aggregate heavy reports into summary tables refreshed by jobs or events.',
            'An index on grouping columns allows streaming aggregation without temp tables.',
            'Check for fan-out: joining before aggregating can multiply rows and inflate sums.'],
        [['F', 'Count employees per department.', '<code>SELECT dept, COUNT(*) FROM emp GROUP BY dept;</code>'],
            ['F', 'Can you group by two columns?', 'Yes; groups are the unique combinations.'],
            ['M', 'How do you build a pivot-like report?', 'Use SUM(CASE WHEN ... THEN ... END) per category column.'],
            ['M', 'What does GROUP_CONCAT do?', 'Concatenates values from a group into one string, optionally ordered and separated.'],
            ['S', 'What is join fan-out and how do you avoid it?', 'Joining one-to-many tables multiplies rows, so sums double count. Aggregate each side in a subquery first, then join.'],
            ['S', 'How do you make heavy aggregate dashboards fast?', 'Summary tables or materialized views maintained incrementally, plus proper indexes and time-bounded queries.']],
        [['Sales per dept with list of names.',
            r`SELECT dept, COUNT(*) AS n, SUM(salary) AS total, GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS names FROM emp GROUP BY dept;

-- OUTPUT:
-- dept | n | total  | names
--   10 | 2 | 105000 | Abaji, Raoji
--   20 | 1 |  70000 | Moropant`],
            ['Pivot with CASE.',
                r`SELECT SUM(CASE WHEN dept=10 THEN 1 ELSE 0 END) AS d10, SUM(CASE WHEN dept=20 THEN 1 ELSE 0 END) AS d20 FROM emp;

-- OUTPUT:
-- d10 | d20
--   2 |   1`]],
        [['Join fan-out inflates sums.',
            r`SELECT SUM(o.total) FROM orders o JOIN order_items i ON i.order_id = o.id;   -- wrong when items repeat the order

-- OUTPUT:
-- 3000   (each order counted once per item)`],
            ['Correct: aggregate before joining.',
                r`SELECT SUM(o.total) FROM orders o WHERE EXISTS (SELECT 1 FROM order_items i WHERE i.order_id = o.id);

-- OUTPUT:
-- 1000`]]
    ),

    'WHERE vs HAVING': x(
        ['WHERE filters individual rows before grouping. HAVING filters groups after aggregation.',
            'You cannot use aggregates like <code>SUM()</code> in WHERE.',
            'Put as many conditions as possible in WHERE to reduce work.'],
        ['Use WHERE for conditions on raw columns and HAVING only for conditions on aggregates.',
            'Moving a non-aggregate condition from HAVING to WHERE often allows an index and reduces rows grouped.',
            'MySQL allows aliases in HAVING.'],
        ['The optimizer may push some HAVING predicates down, but do not rely on it; write them as WHERE.',
            'Filtering before aggregation changes results versus after (for example excluding rows from the average); be explicit about intent.',
            'For top-N groups, HAVING with ORDER BY and LIMIT is fine but window functions are clearer.'],
        [['F', 'Difference between WHERE and HAVING?', 'WHERE filters rows before GROUP BY; HAVING filters groups after aggregates.'],
            ['F', 'Can you use COUNT() in WHERE?', 'No, aggregates belong in HAVING.'],
            ['M', 'Which is faster for a non-aggregate filter?', 'WHERE, because it reduces rows before grouping and can use an index.'],
            ['M', 'Does filtering in WHERE vs HAVING ever change the result?', 'Yes, WHERE removes rows before aggregates are computed; HAVING removes groups after.'],
            ['S', 'How do you find departments where more than 40% of staff earn over 50000?', 'Group by dept with <code>HAVING AVG(salary &gt; 50000) &gt; 0.4</code>.'],
            ['S', 'How to confirm the optimizer pushed a filter?', 'Check EXPLAIN FORMAT=TREE to see where the filter appears relative to aggregation.']],
        [['WHERE then HAVING.',
            r`SELECT dept, COUNT(*) AS n FROM emp WHERE salary >= 45000 GROUP BY dept HAVING COUNT(*) >= 2;

-- OUTPUT:
-- dept | n
--   10 | 2`],
            ['Aggregate in WHERE is an error.',
                r`SELECT dept FROM emp WHERE COUNT(*) > 1 GROUP BY dept;

-- OUTPUT:
-- ERROR 1111 (HY000): Invalid use of group function`]],
        [['Different meaning of WHERE vs HAVING.',
            r`SELECT dept, AVG(salary) FROM emp WHERE salary > 50000 GROUP BY dept;     -- average of high earners
SELECT dept, AVG(salary) FROM emp GROUP BY dept HAVING AVG(salary) > 50000; -- groups with high average

-- OUTPUT: (first)  10 | 60000.0000   20 | 70000.0000
-- OUTPUT: (second) 10 | 52500.0000   20 | 70000.0000`],
            ['Proportion with HAVING.',
                r`SELECT dept FROM emp GROUP BY dept HAVING AVG(salary > 50000) > 0.4;

-- OUTPUT:
-- dept
-- 10
-- 20`]]
    )
};
