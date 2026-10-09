// Module 8 (Operators), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s08k: Record<string, DeepDive> = {
    'Comparison Operators': dd(
        [`Comparison operators compare two values and yield 1 (true), 0 (false) or NULL (unknown): <code>=  &lt;&gt; (or !=)  &lt;  &lt;=  &gt;  &gt;=</code> plus the NULL-safe equality <code>&lt;=&gt;</code>. MySQL has no separate boolean type for these results; they are integers 1, 0 or NULL.`,
            r`SELECT 5 = 5      AS eq,
       5 <> 6      AS ne,
       5 >= 7      AS ge,
       'a' = 'A'   AS ci_equal,        -- default collation ignores case
       NULL = NULL AS null_eq,         -- unknown, not true
       NULL <=> NULL AS null_safe;     -- NULL-safe equality

-- OUTPUT:
-- +----+----+----+----------+---------+-----------+
-- | eq | ne | ge | ci_equal | null_eq | null_safe |
-- +----+----+----+----------+---------+-----------+
-- |  1 |  1 |  0 |        1 |    NULL |         1 |
-- +----+----+----+----------+---------+-----------+`],
        [`Filtering, joining and validating all rest on comparisons. Understanding three-valued logic (true, false, unknown) and type conversion prevents wrong results, which are worse than errors because nothing fails.`,
            r`CREATE TABLE item (id INT PRIMARY KEY, code VARCHAR(10), price DECIMAL(6,2), disc DECIMAL(6,2));
INSERT INTO item VALUES (1,'10',99.50,NULL),(2,'2',50.00,5.00),(3,'abc',10.00,NULL);

SELECT id FROM item WHERE disc = NULL;       -- never matches
SELECT id FROM item WHERE disc <=> NULL;     -- matches rows where disc IS NULL

-- OUTPUT:
-- (first query: empty set)
-- +----+
-- | id |
-- +----+
-- |  1 |
-- |  3 |
-- +----+`],
        [`Application filters (price above a limit, date at or after a start) compare columns with parameters. Comparing different types triggers implicit conversion: a string compared with a number is converted to a number, which can match more than you expect.`,
            r`SELECT id, code FROM item WHERE code = 0;          -- 'abc' converts to 0
SELECT '10' < '9' AS as_text, 10 < 9 AS as_number, '10' + 0 < 9 AS cast_first;

-- OUTPUT:
-- +----+------+
-- | id | code |
-- +----+------+
-- |  3 | abc  |        <- surprise match, plus a warning about truncated value
-- +----+------+
-- +---------+-----------+------------+
-- | as_text | as_number | cast_first |
-- +---------+-----------+------------+
-- |       1 |         0 |          0 |
-- +---------+-----------+------------+`],
        [`<b>Advantages:</b> a small, familiar set that works on numbers, strings, dates and tuples, and combines with the optimizer: <code>=</code> and range operators on an indexed column can use the index. Row constructors compare several columns at once.`,
            r`-- Row (tuple) comparison: handy for keyset pagination
SELECT id FROM item WHERE (price, id) > (50.00, 2) ORDER BY price, id;

-- OUTPUT:
-- +----+
-- | id |
-- +----+
-- |  1 |
-- +----+`],
        [`<b>Disadvantages:</b> string comparison depends on collation (case, accents, trailing spaces for PAD SPACE collations), floating-point values may not compare equal after arithmetic, and implicit casts can disable indexes.`,
            r`SELECT 0.1e0 + 0.2e0 = 0.3e0   AS double_eq,    -- DOUBLE literals: binary rounding error
       0.1 + 0.2 = 0.3           AS decimal_eq,   -- plain literals are exact DECIMAL
       'abc' = 'abc   '          AS pad_space;    -- 8.0 default collation is NO PAD

-- OUTPUT:
-- +-----------+------------+-----------+
-- | double_eq | decimal_eq | pad_space |
-- +-----------+------------+-----------+
-- |         0 |          1 |         0 |
-- +-----------+------------+-----------+`],
        [`<b>Limitations:</b> comparisons with NULL never return true; comparing JSON, BLOB or geometry values follows special rules; and <code>=</code> on very long strings compares the whole value, so prefix indexes cannot fully prove equality.`,
            r`SELECT NULL = 1 AS a, NULL <> 1 AS b, NOT (NULL = 1) AS c, ISNULL(NULL) AS d;

-- OUTPUT:
-- +------+------+------+---+
-- | a    | b    | c    | d |
-- +------+------+------+---+
-- | NULL | NULL | NULL | 1 |
-- +------+------+------+---+`],
        `
   a  op  b            result
   ────────────        ──────────────────────────────
   5  =   5      ──►   1  (TRUE)
   5  =   6      ──►   0  (FALSE)
   5  =   NULL   ──►   NULL (UNKNOWN)  ──► WHERE drops the row
   5 <=>  NULL   ──►   0   (NULL-safe: NULL <=> NULL is 1)
`,
        `Keep compared types identical (bind numbers as numbers, dates as dates) so the index is used and no hidden conversion occurs. Use DECIMAL for money, choose collations deliberately (utf8mb4_0900_ai_ci vs _bin) and use <=> only where NULL equality is genuinely meant.`
    ),

    'Logical Operators: AND, OR & NOT': dd(
        [`<b>AND</b>, <b>OR</b>, <b>NOT</b> (also written <code>&amp;&amp;</code>, <code>||</code> and <code>!</code>) combine conditions. <b>XOR</b> is true when exactly one side is true. They follow three-valued logic with NULL, and AND binds tighter than OR.`,
            r`SELECT (1 AND 1) AS t_and_t, (1 AND 0) AS t_and_f, (1 OR 0) AS t_or_f, NOT 1 AS not_t, (1 XOR 1) AS xor_tt;

-- Truth with NULL
SELECT (NULL AND 0) AS null_and_false,   -- FALSE: one false decides it
       (NULL AND 1) AS null_and_true,    -- UNKNOWN
       (NULL OR 1)  AS null_or_true,     -- TRUE: one true decides it
       (NULL OR 0)  AS null_or_false;    -- UNKNOWN

-- OUTPUT:
-- +---------+---------+--------+-------+--------+
-- | t_and_t | t_and_f | t_or_f | not_t | xor_tt |
-- +---------+---------+--------+-------+--------+
-- |       1 |       0 |      1 |     0 |      0 |
-- +---------+---------+--------+-------+--------+
-- +----------------+---------------+--------------+---------------+
-- | null_and_false | null_and_true | null_or_true | null_or_false |
-- +----------------+---------------+--------------+---------------+
-- |              0 |          NULL |            1 |          NULL |
-- +----------------+---------------+--------------+---------------+`],
        [`Real filters have several rules ("IT staff earning over 50k, or any manager"). Without parentheses the precedence (NOT, then AND, then OR) can silently change meaning.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT, is_mgr TINYINT);
INSERT INTO emp VALUES (1,'Asha','IT',60,0),(2,'Ravi','HR',70,1),(3,'Mina','IT',40,0),(4,'Kiran','HR',30,0);

SELECT name FROM emp WHERE dept = 'IT' AND salary > 50 OR is_mgr = 1;      -- (IT AND >50) OR mgr
SELECT name FROM emp WHERE dept = 'IT' AND (salary > 50 OR is_mgr = 1);    -- IT AND (>50 OR mgr)

-- OUTPUT:
-- +------+        +------+
-- | name |        | name |
-- +------+        +------+
-- | Asha |        | Asha |
-- | Ravi |        +------+
-- +------+`],
        [`Search screens build WHERE clauses dynamically from optional filters. The robust pattern wraps each group in parentheses; NOT is used for exclusions, often as NOT EXISTS or NOT IN.`,
            r`-- Optional filters: a NULL parameter means "ignore this filter"
SET @dept = NULL, @min_sal = 50;
SELECT name FROM emp
WHERE (@dept IS NULL OR dept = @dept)
  AND (@min_sal IS NULL OR salary >= @min_sal);

-- OUTPUT:
-- +------+
-- | name |
-- +------+
-- | Asha |
-- | Ravi |
-- +------+`],
        [`<b>Advantages:</b> readable, standard, and the optimizer can convert them: AND conditions on different indexes can be merged (index_merge intersection); OR on the same column becomes IN or a range union.`,
            r`ALTER TABLE emp ADD KEY idx_dept (dept), ADD KEY idx_salary (salary);
EXPLAIN SELECT id FROM emp WHERE dept = 'IT' OR salary > 65;

-- OUTPUT (example, trimmed):
-- | type        | key                | Extra                                    |
-- | index_merge | idx_dept,idx_salary| Using sort_union(idx_dept,idx_salary)... |`],
        [`<b>Disadvantages:</b> OR across different columns often defeats a single index and falls back to a scan or an index merge; NOT and &lt;&gt; are rarely index-friendly; dynamic "(param IS NULL OR col = param)" patterns produce one plan that fits no case well.`,
            r`EXPLAIN SELECT id FROM emp WHERE NOT (dept = 'IT');

-- OUTPUT (example, trimmed):
-- | type | key      | rows | Extra       |
-- | ALL  | idx_dept |    4 | Using where |     <- for a tiny table; at scale it is a wide range or scan`],
        [`<b>Limitations:</b> evaluation order and short-circuiting are not guaranteed; the symbol <code>||</code> means OR (not string concat) unless the PIPES_AS_CONCAT mode is set; and XOR has no short-circuit at all.`,
            r`SELECT 'a' || 'b' AS pipes;                    -- logical OR on two strings: 0 || 0 = 0, with warnings
SELECT CONCAT('a', 'b') AS concat_result;       -- the portable way

-- OUTPUT:
-- +-------+
-- | pipes |
-- +-------+
-- |     0 |
-- +-------+
-- +---------------+
-- | concat_result |
-- +---------------+
-- | ab            |
-- +---------------+`],
        `
   precedence (high ──► low)
        NOT   ──►   AND   ──►   XOR   ──►   OR

   a OR b AND c      =   a OR (b AND c)       <- surprise for beginners
   (a OR b) AND c    =   explicit grouping     <- always write this
   truth with NULL:  T AND U = U    F AND U = F    T OR U = T    F OR U = U
`,
        `Always parenthesise mixed AND/OR, name each group, and test with NULL inputs. For performance, rewrite OR over two columns as UNION ALL of two index-friendly queries when the optimizer will not merge them, and replace "param IS NULL OR col = param" with dynamically built SQL so each shape gets its own plan.`
    ),

    'BETWEEN, IN & NOT IN': dd(
        [`<code>x BETWEEN a AND b</code> is shorthand for <code>x &gt;= a AND x &lt;= b</code> (both ends inclusive). <code>x IN (v1, v2, ...)</code> tests membership in a list or subquery; <code>NOT IN</code> is its negation. Both work on numbers, strings and dates.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT, joined DATE);
INSERT INTO emp VALUES (1,'Asha','IT',60,'2025-01-15'),(2,'Ravi','HR',45,'2025-06-01'),
                       (3,'Mina','IT',52,'2025-12-31'),(4,'Kiran','Ops',40,'2026-01-01');

SELECT name FROM emp WHERE salary BETWEEN 45 AND 60;           -- 45 and 60 included
SELECT name FROM emp WHERE dept IN ('IT', 'HR');

-- OUTPUT:
-- +------+        +------+
-- | name |        | name |
-- +------+        +------+
-- | Asha |        | Asha |
-- | Ravi |        | Ravi |
-- | Mina |        | Mina |
-- +------+        +------+`],
        [`Ranges and sets appear everywhere: price bands, date windows, allowed statuses, a list of selected ids. These operators say it in one readable predicate instead of chains of OR.`,
            r`-- Date windows: prefer half-open ranges, since BETWEEN includes the end value itself
SELECT name FROM emp WHERE joined BETWEEN '2025-01-01' AND '2025-12-31';
SELECT name FROM emp WHERE joined >= '2025-01-01' AND joined < '2026-01-01';   -- same, and safe for DATETIME

-- OUTPUT (both):
-- +------+
-- | name |
-- +------+
-- | Asha |
-- | Ravi |
-- | Mina |
-- +------+`],
        [`IN with a subquery filters by another table. The big trap is <code>NOT IN</code> when the list contains NULL: the whole predicate becomes unknown and returns no rows.`,
            r`CREATE TABLE blocked (dept VARCHAR(10));
INSERT INTO blocked VALUES ('HR'), (NULL);

SELECT name FROM emp WHERE dept NOT IN (SELECT dept FROM blocked);       -- returns nothing!
SELECT name FROM emp WHERE dept NOT IN (SELECT dept FROM blocked WHERE dept IS NOT NULL);
SELECT name FROM emp e WHERE NOT EXISTS (SELECT 1 FROM blocked b WHERE b.dept = e.dept);

-- OUTPUT:
-- (first query: empty set)
-- +-------+       +-------+
-- | name  |       | name  |
-- +-------+       +-------+
-- | Asha  |       | Asha  |
-- | Mina  |       | Mina  |
-- | Kiran |       | Kiran |
-- +-------+       +-------+          (second and third queries agree)`],
        [`<b>Advantages:</b> concise, index-friendly (ranges and IN lists become range or multi-point lookups), and IN (subquery) is optimised as a semi-join in 8.0.`,
            r`ALTER TABLE emp ADD KEY idx_dept (dept);
EXPLAIN SELECT id FROM emp WHERE dept IN ('IT', 'HR');

-- OUTPUT (example, trimmed):
-- | type  | key      | rows | Extra       |
-- | range | idx_dept |    3 | Using index condition |`],
        [`<b>Disadvantages:</b> BETWEEN is inclusive on both sides (easy to double-count boundaries, wrong for DATETIME end dates), the arguments must be in the order low AND high, and NOT IN with NULL is a notorious bug source.`,
            r`SELECT 5 BETWEEN 10 AND 1 AS reversed,         -- low and high swapped: always false
       5 BETWEEN 1 AND 10 AS normal;

-- OUTPUT:
-- +----------+--------+
-- | reversed | normal |
-- +----------+--------+
-- |        0 |      1 |
-- +----------+--------+`],
        [`<b>Limitations:</b> very long IN lists use memory and planning time (controlled by <code>range_optimizer_max_mem_size</code>; beyond the limit MySQL falls back to index dives or scans), <code>max_allowed_packet</code> bounds the statement, and mixing types in the list triggers conversions.`,
            r`SELECT @@range_optimizer_max_mem_size AS range_mem_bytes, @@eq_range_index_dive_limit AS dive_limit;

-- OUTPUT (example, 8.0 defaults):
-- +------------------+------------+
-- | range_mem_bytes  | dive_limit |
-- +------------------+------------+
-- |          8388608 |        200 |
-- +------------------+------------+`],
        `
   x BETWEEN 10 AND 20      10 ──────────── 20      (both ends included)
                            ├──────[ x ]─────┤
   x IN (3, 7, 9)           3     7     9           (discrete points)
   x NOT IN (3, NULL)       x <> 3 AND x <> NULL  ──►  never TRUE
`,
        `Use half-open ranges (>= start AND &lt; end) for dates and timestamps, and prefer NOT EXISTS over NOT IN when the inner column can be NULL. Keep IN lists to hundreds, not tens of thousands: for large sets load the ids into a temporary table and join. Make sure the compared column and constants have the same type so the index is used.`
    ),

    'LIKE & Pattern Matching': dd(
        [`<b>LIKE</b> matches text against a pattern with two wildcards: <code>%</code> (any number of characters, including none) and <code>_</code> (exactly one character). <code>NOT LIKE</code> negates it, and <code>ESCAPE</code> lets you match a literal % or _. For full regular expressions use <code>REGEXP</code> or <code>REGEXP_LIKE()</code>.`,
            r`CREATE TABLE person (id INT PRIMARY KEY, name VARCHAR(30), email VARCHAR(40));
INSERT INTO person VALUES (1,'Asha Rao','asha@x.com'),(2,'Ravi Kumar','ravi@y.org'),
                          (3,'Mina Rao','mina@x.com'),(4,'Raj','raj@x.com');

SELECT name FROM person WHERE name LIKE 'Ra%';        -- starts with Ra
SELECT name FROM person WHERE name LIKE '%Rao';       -- ends with Rao
SELECT name FROM person WHERE name LIKE 'R_j';        -- R, any one char, j

-- OUTPUT:
-- +------------+  +----------+  +------+
-- | name       |  | name     |  | name |
-- +------------+  +----------+  +------+
-- | Ravi Kumar |  | Asha Rao |  | Raj  |
-- | Raj        |  | Mina Rao |  +------+
-- +------------+  +----------+`],
        [`Users do not type exact values. Autocomplete, name search and domain filters need partial matching, and LIKE is the simplest tool for it.`,
            r`SELECT COUNT(*) AS gmail_like FROM person WHERE email LIKE '%@x.com';

-- Match a literal percent sign using ESCAPE
CREATE TABLE promo (id INT PRIMARY KEY, label VARCHAR(20));
INSERT INTO promo VALUES (1,'50% off'),(2,'50 items');
SELECT label FROM promo WHERE label LIKE '50!% off' ESCAPE '!';

-- OUTPUT:
-- +------------+
-- | gmail_like |
-- +------------+
-- |          3 |
-- +------------+
-- +---------+
-- | label   |
-- +---------+
-- | 50% off |
-- +---------+`],
        [`Whether LIKE can use an index depends on the pattern: a fixed prefix ("Ra%") is a range scan on a B-tree index; a leading wildcard ("%Rao") forces a scan. For real search, use FULLTEXT, a reversed-column index for suffix search, or a search engine.`,
            r`ALTER TABLE person ADD KEY idx_name (name);
EXPLAIN SELECT id FROM person WHERE name LIKE 'Ra%';       -- prefix: index range
EXPLAIN SELECT id FROM person WHERE name LIKE '%Rao';      -- leading wildcard: no range

-- OUTPUT (example, trimmed):
-- | type  | key      | Extra                 |
-- | range | idx_name | Using where; Using index |
-- | index | idx_name | Using where; Using index |      <- scans the whole index`],
        [`<b>Advantages:</b> simple and standard, readable for beginners, case-insensitive by default with the common collations, and prefix patterns are fast with an index.`,
            r`SELECT name FROM person WHERE name LIKE 'ASHA%';                        -- matches 'Asha Rao'
SELECT name FROM person WHERE name LIKE BINARY 'ASHA%';                 -- case-sensitive version

-- OUTPUT:
-- +----------+
-- | name     |
-- +----------+
-- | Asha Rao |
-- +----------+
-- (second query returns an empty set)`],
        [`<b>Disadvantages:</b> leading-wildcard searches scan every row; there is no relevance ranking, stemming or typo tolerance; wildcards inside user input let users change the pattern (escape % and _ from input); and collation affects what counts as a match.`,
            r`-- User input must be escaped, or searching for "_" matches everything
SELECT COUNT(*) AS unsafe  FROM person WHERE name LIKE '%_%';          -- _ is a wildcard
SELECT COUNT(*) AS escaped FROM person WHERE name LIKE '%!_%' ESCAPE '!';   -- literal underscore

-- OUTPUT:
-- +--------+---------+
-- | unsafe | escaped |
-- +--------+---------+
-- |      4 |       0 |
-- +--------+---------+`],
        [`<b>Limitations:</b> only two wildcards (no character classes, no alternation) so complex patterns need REGEXP_LIKE (ICU engine in 8.0, not indexable); there is no built-in fuzzy or phonetic match beyond SOUNDS LIKE; and a LIKE on a TEXT column without a prefix index scans the table.`,
            r`SELECT name FROM person WHERE REGEXP_LIKE(name, '^(Asha|Mina) ');   -- alternation LIKE cannot do
SELECT 'Smith' SOUNDS LIKE 'Smyth' AS phonetic;

-- OUTPUT:
-- +----------+      +----------+
-- | name     |      | phonetic |
-- +----------+      +----------+
-- | Asha Rao |      |        1 |
-- | Mina Rao |      +----------+
-- +----------+`],
        `
   pattern       meaning                 index usable?
   'Ra%'         prefix                  yes  (B-tree range)
   '%Rao'        suffix                  no   (scan)
   '%av%'        contains                no   (scan) ──► use FULLTEXT / search engine
   'R_j'         one wildcard char       partly (fixed prefix R)
   %  any length   _  exactly one   ESCAPE '!'  makes !% a literal %
`,
        `Design the query for the prefix case, escape user-supplied wildcards, and move contains-style, ranked or multilingual search to FULLTEXT or Elasticsearch/OpenSearch before the table is large. For suffix search store a reversed copy in a generated column and index it; for case rules choose the collation explicitly instead of sprinkling LOWER() on indexed columns.`
    ),

    'IS NULL & IS NOT NULL': dd(
        [`<b>NULL</b> means "unknown or missing", not zero and not an empty string. Because any comparison with NULL is unknown, you test for it with <code>IS NULL</code> and <code>IS NOT NULL</code>. MySQL also offers <code>ISNULL(x)</code> and the NULL-safe operator <code>&lt;=&gt;</code>.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), manager_id INT NULL, bonus DECIMAL(8,2) NULL);
INSERT INTO emp VALUES (1,'Asha',NULL,500),(2,'Ravi',1,NULL),(3,'Mina',1,0),(4,'Kiran',2,NULL);

SELECT name FROM emp WHERE manager_id IS NULL;        -- the top of the tree
SELECT name FROM emp WHERE bonus IS NOT NULL;

-- OUTPUT:
-- +------+      +------+
-- | name |      | name |
-- +------+      +------+
-- | Asha |      | Asha |
-- +------+      | Mina |
--               +------+`],
        [`Optional data is real: no manager, no end date, no bonus yet. Writing <code>= NULL</code> is the most common beginner bug: it compiles and returns nothing, so the mistake stays hidden.`,
            r`SELECT name FROM emp WHERE bonus = NULL;           -- always empty
SELECT name FROM emp WHERE bonus <> 0;               -- Ravi and Kiran (NULL) are excluded too!
SELECT name FROM emp WHERE bonus <> 0 OR bonus IS NULL;

-- OUTPUT:
-- (first: empty set)
-- +------+     +-------+
-- | name |     | name  |
-- +------+     +-------+
-- | Asha |     | Asha  |
-- +------+     | Ravi  |
--              | Kiran |
--              +-------+`],
        [`Typical uses: finding top-level nodes in hierarchies, open-ended date ranges (end_date IS NULL means current), unmatched rows after a LEFT JOIN, and data-quality audits. Aggregates ignore NULL, and COALESCE substitutes defaults.`,
            r`SELECT COUNT(*) AS all_rows, COUNT(bonus) AS with_bonus,         -- COUNT(col) skips NULL
       AVG(bonus) AS avg_bonus,                                   -- average of 500 and 0 only
       AVG(COALESCE(bonus, 0)) AS avg_if_missing_is_zero
FROM emp;

-- OUTPUT:
-- +----------+------------+-----------+------------------------+
-- | all_rows | with_bonus | avg_bonus | avg_if_missing_is_zero |
-- +----------+------------+-----------+------------------------+
-- |        4 |          2 |  250.0000 |               125.0000 |
-- +----------+------------+-----------+------------------------+`],
        [`<b>Advantages:</b> NULL models missing information honestly (better than magic values such as -1 or 1900-01-01), and InnoDB indexes include NULLs, so <code>IS NULL</code> can use an index.`,
            r`ALTER TABLE emp ADD KEY idx_mgr (manager_id);
EXPLAIN SELECT id FROM emp WHERE manager_id IS NULL;

-- OUTPUT (example, trimmed):
-- | type | key     | ref   | rows |
-- | ref  | idx_mgr | const |    1 |`],
        [`<b>Disadvantages:</b> three-valued logic complicates every query; NULL spreads (any arithmetic with NULL is NULL); NOT IN and subquery comparisons break; and nullable columns need extra bookkeeping (a NULL bitmap in the row) and care in unique keys.`,
            r`SELECT 10 + NULL AS arith, CONCAT('a', NULL) AS concat, NULL = NULL AS eq, IFNULL(NULL, 'default') AS rescued;

-- OUTPUT:
-- +-------+--------+------+---------+
-- | arith | concat | eq   | rescued |
-- +-------+--------+------+---------+
-- | NULL  | NULL   | NULL | default |
-- +-------+--------+------+---------+`],
        [`<b>Limitations:</b> sorting puts NULL first in ASC and last in DESC (no NULLS FIRST/LAST clause, emulate with ORDER BY col IS NULL); GROUP BY and DISTINCT treat all NULLs as one group while UNIQUE allows many; and Oracle-style treating '' as NULL does not exist here.`,
            r`SELECT name, bonus FROM emp ORDER BY bonus IS NULL, bonus DESC;     -- push NULLs last, highest first

-- OUTPUT:
-- +-------+--------+
-- | name  | bonus  |
-- +-------+--------+
-- | Asha  | 500.00 |
-- | Mina  |   0.00 |
-- | Ravi  |   NULL |
-- | Kiran |   NULL |
-- +-------+--------+
-- (relative order of the two NULL rows is not guaranteed)`],
        `
   value    IS NULL   = NULL   <=> NULL   IS NOT NULL
   ─────    ───────   ──────   ────────   ───────────
   5          0        NULL      0           1
   NULL       1        NULL      1           0
   (only IS NULL / <=> can ever say TRUE about a missing value)
`,
        `Declare columns NOT NULL unless absence has a business meaning, and document what NULL means for each nullable column (unknown, not applicable, not yet). Test every query with NULL data, prefer NOT EXISTS over NOT IN, use COALESCE at the edges (reports, APIs), and remember a left-join anti-pattern (LEFT JOIN ... WHERE right.id IS NULL) relies on a non-nullable column on the right.`
    ),
};
