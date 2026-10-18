// Module 9 (MySQL Functions): string, numeric, date and NULL functions.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s09a: Record<string, DeepDive> = {
    'String Functions': dd(
        [`<b>String functions</b> take text and return text, numbers or positions: <code>CONCAT</code>, <code>UPPER</code>, <code>LOWER</code>, <code>TRIM</code>, <code>SUBSTRING</code>, <code>REPLACE</code>, <code>CHAR_LENGTH</code>. They run inside the server, row by row, so the client receives data already shaped.`,
            r`-- Basic string functions on literals (no table needed)
SELECT CONCAT('My', 'SQL')   AS joined,   -- glue strings together
       UPPER('mysql')        AS up,        -- all capitals
       LOWER('MySQL')        AS lo,        -- all lower case
       CHAR_LENGTH('hello')  AS len;       -- number of characters

-- OUTPUT:
-- +--------+-------+-------+-----+
-- | joined | up    | lo    | len |
-- +--------+-------+-------+-----+
-- | MySQL  | MYSQL | mysql |   5 |
-- +--------+-------+-------+-----+`],
        [`Real data is messy: stray spaces, mixed case, composite values like <code>name@domain</code>. Cleaning and reshaping text in SQL avoids pulling millions of rows into application code just to trim them.`,
            r`-- Normalise a dirty e-mail and split out its domain
SELECT LOWER(TRIM('  Ann@Example.COM  '))                    AS email,   -- strip spaces, lower-case
       SUBSTRING_INDEX(LOWER(TRIM('  Ann@Example.COM  ')), '@', -1) AS domain;  -- text after the last '@'

-- OUTPUT:
-- +-----------------+-------------+
-- | email           | domain      |
-- +-----------------+-------------+
-- | ann@example.com | example.com |
-- +-----------------+-------------+`],
        [`Typical uses: building display names, masking phone numbers, zero-padding invoice codes, searching with <code>LOCATE</code>, and cleaning imports before loading them into final tables.`,
            r`CREATE TABLE customers (          -- tiny self-contained table
  id INT PRIMARY KEY,
  first_name VARCHAR(30),
  last_name  VARCHAR(30),
  phone      VARCHAR(15)
);
INSERT INTO customers VALUES (1,'Abaji','Rao','9876543210'), (2,'Raoji',NULL,'9123456789');

SELECT CONCAT_WS(' ', first_name, last_name)                   AS full_name,  -- skips NULL parts
       CONCAT(LEFT(phone, 2), '******', RIGHT(phone, 2))      AS masked,     -- keep first and last 2 digits
       LPAD(id, 5, '0')                                       AS cust_code   -- zero padded to width 5
FROM customers;

-- OUTPUT:
-- +-----------+------------+-----------+
-- | full_name | masked     | cust_code |
-- +-----------+------------+-----------+
-- | Abaji Rao | 98******10 | 00001     |
-- | Raoji     | 91******89 | 00002     |
-- +-----------+------------+-----------+`],
        [`<b>Advantages:</b> set-based (one statement transforms every row), no extra network trips, work in <code>SELECT</code>, <code>WHERE</code>, <code>ORDER BY</code> and <code>UPDATE</code>, and are deterministic so they can be used in generated columns.`,
            r`CREATE TABLE people (id INT PRIMARY KEY, name VARCHAR(40));
INSERT INTO people VALUES (1,'  anaji  '), (2,'BAJI');

-- One UPDATE cleans every row; no application loop needed
UPDATE people
SET name = CONCAT(UPPER(LEFT(TRIM(name),1)), LOWER(SUBSTRING(TRIM(name),2)));  -- Capitalise first letter

SELECT * FROM people;

-- OUTPUT:
-- +----+-------+
-- | id | name  |
-- +----+-------+
-- |  1 | Anaji |
-- |  2 | Baji  |
-- +----+-------+`],
        [`<b>Disadvantages:</b> wrapping an indexed column in a function usually prevents the index from being used (not sargable), and heavy text processing burns database CPU that is harder to scale than app servers.`,
            r`CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(100), KEY idx_email (email));

EXPLAIN SELECT id FROM users WHERE LOWER(email) = 'a@x.com';  -- function on the column
EXPLAIN SELECT id FROM users WHERE email        = 'a@x.com';  -- plain comparison

-- OUTPUT (example, abbreviated):
-- +----+-------+------+-------+-------------+
-- | id | table | type | key   | Extra       |
-- +----+-------+------+-------+-------------+
-- |  1 | users | index| idx_email | Using where; Using index |   <- scans the whole index
-- |  1 | users | ref  | idx_email | Using index              |   <- direct lookup
-- +----+-------+------+-------+-------------+
-- Tip: default collations are case-insensitive, so LOWER() is usually unnecessary.`],
        [`<b>Limitations:</b> <code>LENGTH</code> counts bytes, not characters; any function receiving <code>NULL</code> mostly returns <code>NULL</code>; positions are 1-based; results depend on the column's character set and collation.`,
            r`SELECT LENGTH('héllo')               AS bytes,       -- utf8mb4: é takes 2 bytes
       CHAR_LENGTH('héllo')          AS chars,       -- 5 characters
       CONCAT('a', NULL, 'b')        AS concat_null, -- any NULL makes the result NULL
       CONCAT_WS('-', 'a', NULL, 'b') AS ws_null,    -- CONCAT_WS skips NULLs
       SUBSTRING('abcdef', 0, 2)     AS pos_zero;    -- position 0 returns an empty string

-- OUTPUT:
-- +-------+-------+-------------+---------+----------+
-- | bytes | chars | concat_null | ws_null | pos_zero |
-- +-------+-------+-------------+---------+----------+
-- |     6 |     5 | NULL        | a-b     |          |
-- +-------+-------+-------------+---------+----------+`],
        `
   'Abaji ' + 'Rao'         row-by-row inside the server
       |
       v
   +-----------------+    +---------+    +----------+
   | input string(s) | -> | function| -> | new value |
   +-----------------+    +---------+    +----------+
     TRIM  LOWER  SUBSTRING  CONCAT  REPLACE  LPAD

   WHERE col = 'x'          -> index lookup  (fast)
   WHERE LOWER(col) = 'x'   -> scan every row (slow)
`,
        `Keep transformation out of predicates: normalise data on write (or use a generated column plus index) instead of calling functions on indexed columns at read time. Treat the database as a store, not a text-processing engine; move heavy parsing to the application or ETL, and fix collation and charset once at schema level.`
    ),

    'Numeric Functions': dd(
        [`<b>Numeric functions</b> do arithmetic beyond the basic operators: <code>ROUND</code>, <code>CEIL</code>, <code>FLOOR</code>, <code>TRUNCATE</code>, <code>ABS</code>, <code>MOD</code>, <code>POWER</code>, <code>SQRT</code>, <code>RAND</code>.`,
            r`SELECT ROUND(3.14159, 2) AS r2,     -- round to 2 decimals
       CEIL(4.1)         AS up,     -- smallest integer >= value
       FLOOR(4.9)        AS down,   -- largest integer <= value
       ABS(-7)           AS absval, -- absolute value
       POWER(2, 10)      AS p;      -- 2 to the power 10

-- OUTPUT:
-- +------+----+------+--------+------+
-- | r2   | up | down | absval | p    |
-- +------+----+------+--------+------+
-- | 3.14 |  5 |    4 |      7 | 1024 |
-- +------+----+------+--------+------+`],
        [`Money, percentages, paging maths, bucketing and statistics all need controlled rounding and integer division. Doing it in SQL keeps reports consistent with the stored numbers.`,
            r`-- Price with 18% tax, rounded to paise; and bucket a value into tens
SELECT ROUND(499.99 * 1.18, 2) AS price_with_tax,  -- rounding to 2 decimals
       FLOOR(47 / 10) * 10     AS bucket,          -- 47 -> bucket 40
       47 DIV 10               AS int_div,         -- integer division operator
       MOD(47, 10)             AS remainder;       -- modulo

-- OUTPUT:
-- +----------------+--------+---------+-----------+
-- | price_with_tax | bucket | int_div | remainder |
-- +----------------+--------+---------+-----------+
-- |         589.99 |     40 |       4 |         7 |
-- +----------------+--------+---------+-----------+`],
        [`Used in invoice totals, discount tiers, pagination (<code>CEIL(total/page_size)</code>), even/odd row splits (<code>MOD(id,2)</code>), and sampling.`,
            r`CREATE TABLE items (id INT PRIMARY KEY, price DECIMAL(8,2));
INSERT INTO items VALUES (1, 19.99), (2, 5.50), (3, 100.00);

SELECT COUNT(*)                    AS total_rows,
       CEIL(COUNT(*) / 2)          AS pages_of_2,     -- pages needed with 2 rows per page
       ROUND(AVG(price), 1)        AS avg_price,      -- 41.83 -> 41.8
       TRUNCATE(AVG(price), 1)     AS avg_cut         -- cut, not round
FROM items;

-- OUTPUT:
-- +------------+------------+-----------+---------+
-- | total_rows | pages_of_2 | avg_price | avg_cut |
-- +------------+------------+-----------+---------+
-- |          3 |          2 |      41.8 |    41.8 |
-- +------------+------------+-----------+---------+`],
        [`<b>Advantages:</b> exact <code>DECIMAL</code> arithmetic for money, many rounding modes, integer <code>DIV</code> and <code>MOD</code>, and consistent results in every client.`,
            r`-- Rounding rules at a glance (exact values round half away from zero)
SELECT ROUND(2.5)   AS half_up,      -- 3
       ROUND(-2.5)  AS neg_half,     -- -3
       CEIL(-1.2)   AS ceil_neg,     -- -1
       FLOOR(-1.2)  AS floor_neg,    -- -2
       ROUND(1234.567, -2) AS to_hundreds;  -- negative digits round left of the point

-- OUTPUT:
-- +---------+----------+----------+-----------+-------------+
-- | half_up | neg_half | ceil_neg | floor_neg | to_hundreds |
-- +---------+----------+----------+-----------+-------------+
-- |       3 |       -3 |       -1 |        -2 |        1200 |
-- +---------+----------+----------+-----------+-------------+`],
        [`<b>Disadvantages:</b> <code>FLOAT</code>/<code>DOUBLE</code> are approximate, rounding of approximate values differs from exact values, and <code>ORDER BY RAND()</code> sorts the whole table.`,
            r`SELECT 0.1 + 0.2         AS exact_dec,     -- DECIMAL literals are exact
       0.1e0 + 0.2e0     AS approx_dbl,    -- DOUBLE literals are binary fractions
       ROUND(2.5e0)      AS dbl_round;     -- approximate values round half to even (C rint)

-- ORDER BY RAND() assigns a random number to every row, then sorts all of them:
-- SELECT * FROM big_table ORDER BY RAND() LIMIT 1;   -- O(n log n) on millions of rows

-- OUTPUT:
-- +-----------+---------------------+-----------+
-- | exact_dec | approx_dbl          | dbl_round |
-- +-----------+---------------------+-----------+
-- |       0.3 | 0.30000000000000004 |         2 |
-- +-----------+---------------------+-----------+`],
        [`<b>Limitations:</b> division by zero yields <code>NULL</code> (with a warning, or an error in strict mode for INSERT/UPDATE), overflow raises "value out of range", and <code>DIV</code> truncates toward zero.`,
            r`SELECT 1 / 0        AS div_zero,   -- NULL plus warning 1365
       10 / 4       AS normal_div, -- '/' always returns a decimal
       10 DIV 4     AS int_div,    -- 2
       -7 DIV 2     AS neg_div,    -- -3 (truncates toward zero)
       MOD(-7, 3)   AS neg_mod;    -- -1 (sign follows the dividend)

-- OUTPUT:
-- +----------+------------+---------+---------+---------+
-- | div_zero | normal_div | int_div | neg_div | neg_mod |
-- +----------+------------+---------+---------+---------+
-- | NULL     |     2.5000 |       2 |      -3 |      -1 |
-- +----------+------------+---------+---------+---------+`],
        `
   input --> [ ROUND | CEIL | FLOOR | TRUNCATE | MOD | DIV ] --> result

   ROUND(2.567,2)=2.57   TRUNCATE(2.567,2)=2.56
   CEIL(2.1)=3           FLOOR(2.9)=2

   value:  -2   -1.2   0   1.2   2
   FLOOR :  -2   -2    0    1    2
   CEIL  :  -2   -1    0    2    2
`,
        `Store money as DECIMAL (or integer minor units) and round once, at the boundary defined by the business, not inside every intermediate step. Avoid randomness functions on large tables (use an indexed random key or sampling by id range) and decide a single rounding policy for the whole system.`
    ),

    'Date Functions': dd(
        [`<b>Date functions</b> read, build, shift and format <code>DATE</code>, <code>DATETIME</code> and <code>TIMESTAMP</code> values: <code>NOW</code>, <code>CURDATE</code>, <code>DATE_ADD</code>, <code>DATEDIFF</code>, <code>DATE_FORMAT</code>, <code>EXTRACT</code>, <code>LAST_DAY</code>.`,
            r`SELECT DATE_ADD('2024-01-31', INTERVAL 1 MONTH) AS plus_month, -- month-end is clamped
       DATEDIFF('2024-03-01', '2024-02-01')       AS days_between,-- first minus second, in days
       DATE_FORMAT('2024-07-04', '%W, %d %M %Y')  AS pretty,      -- custom text format
       LAST_DAY('2024-02-10')                     AS month_end;   -- leap year aware

-- OUTPUT:
-- +------------+--------------+--------------------+------------+
-- | plus_month | days_between | pretty             | month_end  |
-- +------------+--------------+--------------------+------------+
-- | 2024-02-29 |           29 | Thursday, 04 July 2024 | 2024-02-29 |
-- +------------+--------------+--------------------+------------+`],
        [`Almost every business question is time-based: "orders this week", "age of a customer", "invoice due in 30 days". Date arithmetic by hand (leap years, month lengths) is error-prone, so the database does it.`,
            r`SELECT TIMESTAMPDIFF(YEAR, '1990-05-15', '2024-05-14') AS age_years,  -- full years only
       '2024-03-10' + INTERVAL 30 DAY                     AS due_date,   -- interval arithmetic
       EXTRACT(YEAR_MONTH FROM '2024-03-10')              AS ym,         -- yyyymm number
       DAYNAME('2024-03-10')                              AS weekday;

-- OUTPUT:
-- +-----------+------------+--------+---------+
-- | age_years | due_date   | ym     | weekday |
-- +-----------+------------+--------+---------+
-- |        33 | 2024-04-09 | 202403 | Sunday  |
-- +-----------+------------+--------+---------+`],
        [`Used for rolling-window reports, subscription expiry, monthly billing, audit timestamps (<code>DEFAULT CURRENT_TIMESTAMP</code>), and cohort analysis.`,
            r`CREATE TABLE orders (id INT PRIMARY KEY, placed_on DATE, amount INT);
INSERT INTO orders VALUES (1,'2024-03-01',100), (2,'2024-03-05',250), (3,'2024-02-20',80);

-- Monthly totals: group by a formatted month key
SELECT DATE_FORMAT(placed_on, '%Y-%m') AS month,   -- 2024-03
       SUM(amount)                     AS revenue
FROM orders
GROUP BY DATE_FORMAT(placed_on, '%Y-%m')
ORDER BY month;

-- OUTPUT:
-- +---------+---------+
-- | month   | revenue |
-- +---------+---------+
-- | 2024-02 |      80 |
-- | 2024-03 |     350 |
-- +---------+---------+`],
        [`<b>Advantages:</b> calendar-correct arithmetic, rich formatting codes, time-zone conversion with <code>CONVERT_TZ</code>, and automatic timestamps through column defaults.`,
            r`CREATE TABLE audit (
  id INT PRIMARY KEY AUTO_INCREMENT,
  note VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,                              -- set on insert
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP   -- refreshed on update
);
INSERT INTO audit(note) VALUES ('first');
SELECT note, created_at = updated_at AS same_time FROM audit;

-- OUTPUT:
-- +-------+-----------+
-- | note  | same_time |
-- +-------+-----------+
-- | first |         1 |
-- +-------+-----------+`],
        [`<b>Disadvantages:</b> using <code>YEAR(col)</code> or <code>DATE(col)</code> in <code>WHERE</code> blocks index range scans; write half-open ranges instead.`,
            r`-- Slow: function on the column (cannot use an index on placed_on)
SELECT COUNT(*) FROM orders WHERE YEAR(placed_on) = 2024;

-- Fast: a range the B-tree can seek into
SELECT COUNT(*) FROM orders
WHERE placed_on >= '2024-01-01' AND placed_on < '2025-01-01';   -- half-open range

-- OUTPUT:
-- +----------+
-- | COUNT(*) |
-- +----------+
-- |        3 |      <- same answer, but the second form is index friendly
-- +----------+`],
        [`<b>Limitations:</b> invalid dates become <code>NULL</code> or errors, <code>TIMESTAMP</code> stops at 2038-01-19, <code>NOW()</code> depends on the session time zone, and month arithmetic clamps days.`,
            r`SELECT DATE('2024-02-30')                     AS bad_date,   -- NULL (with a warning)
       DATE_ADD('2024-01-31', INTERVAL 1 MONTH)   AS clamped,    -- 29 Feb, not 31 Feb
       DATEDIFF('2024-03-01 23:59', '2024-03-01') AS ignores_time; -- time part ignored

-- NOW() changes with the time zone setting:
-- SET time_zone = '+00:00'; SELECT NOW();   SET time_zone = '+05:30'; SELECT NOW();

-- OUTPUT:
-- +----------+------------+--------------+
-- | bad_date | clamped    | ignores_time |
-- +----------+------------+--------------+
-- | NULL     | 2024-02-29 |            0 |
-- +----------+------------+--------------+`],
        `
   timeline --------------------------------------------------->
        2024-01-31 --INTERVAL 1 MONTH--> 2024-02-29 (clamped)
        |<------ DATEDIFF = days ------>|

   function            returns
   NOW()/CURDATE()     current datetime / date
   DATE_ADD / INTERVAL shifted date
   DATEDIFF            integer days
   TIMESTAMPDIFF       integer in chosen unit
   DATE_FORMAT         text
`,
        `Store instants in UTC (TIMESTAMP, or DATETIME holding UTC) and convert at the edge; use DATETIME(6) when you need microseconds. Always query with half-open ranges on the raw column, and for frequent calendar groupings add a generated column or a date dimension table so the work is indexed and consistent.`
    ),

    'NULL Functions: COALESCE, IFNULL & NULLIF': dd(
        [`<b>NULL</b> means "unknown or missing". <code>COALESCE(a,b,...)</code> returns the first non-NULL argument, <code>IFNULL(a,b)</code> is its two-argument form, and <code>NULLIF(a,b)</code> returns NULL when both are equal, otherwise <code>a</code>.`,
            r`SELECT COALESCE(NULL, NULL, 'third') AS first_non_null, -- scans left to right
       IFNULL(NULL, 'default')        AS fallback,       -- 2-argument version
       NULLIF(5, 5)                   AS equal_gives_null,
       NULLIF(5, 6)                   AS different_keeps;

-- OUTPUT:
-- +----------------+----------+------------------+-----------------+
-- | first_non_null | fallback | equal_gives_null | different_keeps |
-- +----------------+----------+------------------+-----------------+
-- | third          | default  | NULL             |               5 |
-- +----------------+----------+------------------+-----------------+`],
        [`NULL poisons expressions: <code>5 + NULL</code> is NULL and <code>NULL = NULL</code> is not true. Reports need readable defaults, and divisions need protection from zero.`,
            r`SELECT 5 + NULL          AS arithmetic,  -- NULL
       NULL = NULL        AS equality,    -- NULL, not 1
       NULL IS NULL       AS is_null_test,-- the correct test
       10 / NULLIF(0, 0)  AS safe_divide; -- NULLIF turns 0 into NULL -> result NULL, no error

-- OUTPUT:
-- +------------+----------+--------------+-------------+
-- | arithmetic | equality | is_null_test | safe_divide |
-- +------------+----------+--------------+-------------+
-- | NULL       | NULL     |            1 | NULL        |
-- +------------+----------+--------------+-------------+`],
        [`Used to show "N/A" for missing values, pick the first available phone number, compute margins without division errors, and treat empty strings as missing.`,
            r`CREATE TABLE contacts (id INT PRIMARY KEY, mobile VARCHAR(15), home VARCHAR(15), email VARCHAR(40));
INSERT INTO contacts VALUES (1, NULL, '0221234', NULL), (2, '98765', NULL, 'b@x.com'), (3, '', NULL, NULL);

SELECT id,
       COALESCE(NULLIF(mobile, ''), home, email, 'no contact') AS best_contact  -- '' counts as missing
FROM contacts;

-- OUTPUT:
-- +----+--------------+
-- | id | best_contact |
-- +----+--------------+
-- |  1 | 0221234      |
-- |  2 | 98765        |
-- |  3 | no contact   |
-- +----+--------------+`],
        [`<b>Advantages:</b> <code>COALESCE</code> is standard SQL (portable), takes any number of arguments, evaluates lazily from left, and keeps default logic in one place.`,
            r`CREATE TABLE sales (id INT PRIMARY KEY, qty INT, discount DECIMAL(5,2));
INSERT INTO sales VALUES (1, 2, NULL), (2, 3, 10.00);

SELECT id, qty * (100 - COALESCE(discount, 0)) / 100 AS net_qty   -- NULL discount treated as 0
FROM sales;

-- OUTPUT:
-- +----+---------+
-- | id | net_qty |
-- +----+---------+
-- |  1 |  2.0000 |
-- |  2 |  2.7000 |
-- +----+---------+`],
        [`<b>Disadvantages:</b> hiding NULLs can mask data-quality bugs, and <code>COALESCE(col, x) = y</code> in <code>WHERE</code> stops index use on <code>col</code>.`,
            r`-- Index-friendly: express the NULL case as a separate OR condition
-- SELECT * FROM sales WHERE discount = 0 OR discount IS NULL;

-- Index-hostile: function wraps the column
-- SELECT * FROM sales WHERE COALESCE(discount, 0) = 0;

SELECT COUNT(*) AS rows_without_discount
FROM sales WHERE discount IS NULL;       -- the honest question

-- OUTPUT:
-- +-----------------------+
-- | rows_without_discount |
-- +-----------------------+
-- |                     1 |
-- +-----------------------+`],
        [`<b>Limitations:</b> the result type is the common type of all arguments, aggregates silently skip NULLs, and <code>COALESCE</code> of all NULLs is still NULL.`,
            r`CREATE TABLE t (v INT);
INSERT INTO t VALUES (10), (NULL), (20);

SELECT COUNT(*)  AS count_all,       -- counts rows
       COUNT(v)  AS count_v,         -- skips NULL
       AVG(v)    AS avg_skips_null,  -- (10+20)/2, not /3
       AVG(COALESCE(v, 0)) AS avg_zero_filled,
       COALESCE(NULL, NULL) AS still_null;

-- OUTPUT:
-- +-----------+---------+----------------+-----------------+------------+
-- | count_all | count_v | avg_skips_null | avg_zero_filled | still_null |
-- +-----------+---------+----------------+-----------------+------------+
-- |         3 |       2 |        15.0000 |         10.0000 | NULL       |
-- +-----------+---------+----------------+-----------------+------------+`],
        `
   COALESCE(a, b, c, 'x')

   a --NULL?--> b --NULL?--> c --NULL?--> 'x'
   |            |            |
   v            v            v
  return a    return b    return c      (first non-NULL wins)

   NULLIF(a, b):  a = b ? NULL : a
`,
        `Decide per column whether NULL is meaningful (unknown) or should be prevented with NOT NULL and DEFAULT; do not paper over design problems with COALESCE in every query. Put defaults in views or generated columns if many queries need them, and remember that NULL semantics change results of NOT IN, joins and aggregates.`
    ),
};
