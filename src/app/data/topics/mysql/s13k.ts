// Module 13 (Set Operations), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s13k: Record<string, DeepDive> = {
    'UNION vs UNION ALL': dd(
        [`<b>UNION</b> stacks the rows of two or more SELECTs into one result and <b>removes duplicate rows</b>. <b>UNION ALL</b> stacks them and keeps every row, duplicates included. Both need the same number of columns, matched by position.`,
            r`-- Two customer lists that overlap on one person (Ravi)
CREATE TABLE web_cust  (name VARCHAR(20), city VARCHAR(20));
CREATE TABLE shop_cust (name VARCHAR(20), city VARCHAR(20));
INSERT INTO web_cust  VALUES ('Asha','Pune'),('Ravi','Delhi'),('Mina','Pune');
INSERT INTO shop_cust VALUES ('Ravi','Delhi'),('Karan','Goa');

SELECT name, city FROM web_cust
UNION                                         -- duplicates removed
SELECT name, city FROM shop_cust
ORDER BY name;

-- OUTPUT:
-- +-------+-------+
-- | name  | city  |
-- +-------+-------+
-- | Asha  | Pune  |
-- | Karan | Goa   |
-- | Mina  | Pune  |
-- | Ravi  | Delhi |
-- +-------+-------+
-- (UNION ALL on the same query would return 5 rows: Ravi appears twice.)`],
        [`Data often lives in several places: per-year tables, per-region tables, live plus archive. Reports need them as one list. UNION ALL is the cheap way to concatenate; UNION is for when the same entity may appear in more than one source and you want it once.`,
            r`-- Keep the source visible: the extra literal column makes rows distinct,
-- so UNION ALL is the right (and cheaper) choice here
SELECT name, 'web'  AS src FROM web_cust
UNION ALL
SELECT name, 'shop' AS src FROM shop_cust
ORDER BY name, src;

-- OUTPUT:
-- +-------+------+
-- | name  | src  |
-- +-------+------+
-- | Asha  | web  |
-- | Karan | shop |
-- | Mina  | web  |
-- | Ravi  | shop |
-- | Ravi  | web  |
-- +-------+------+`],
        [`A classic production pattern is "hot and archive" or one table per year. A view or query unions them with UNION ALL, then aggregates the combined set.`,
            r`CREATE TABLE sales_2025 (amt INT);
CREATE TABLE sales_2026 (amt INT);
INSERT INTO sales_2025 VALUES (100),(200);
INSERT INTO sales_2026 VALUES (500);

SELECT yr, SUM(amt) AS revenue
FROM (SELECT 2025 AS yr, amt FROM sales_2025
      UNION ALL
      SELECT 2026,       amt FROM sales_2026) AS t
GROUP BY yr
ORDER BY yr;

-- OUTPUT:
-- +------+---------+
-- | yr   | revenue |
-- +------+---------+
-- | 2025 |     300 |
-- | 2026 |     500 |
-- +------+---------+`],
        [`<b>Advantages:</b> UNION ALL streams rows with no extra work. UNION needs a temporary table with a unique index to detect duplicates, so it costs memory, CPU and possibly disk. Knowing which one you need is a free speed-up.`,
            r`-- Compare plans: plain UNION adds a "UNION RESULT" step with a temporary table
EXPLAIN SELECT name FROM web_cust UNION     SELECT name FROM shop_cust;
EXPLAIN SELECT name FROM web_cust UNION ALL SELECT name FROM shop_cust;

-- OUTPUT (example, trimmed):
-- UNION:
-- | id   | select_type  | table      | Extra           |
-- |    1 | PRIMARY      | web_cust   | NULL            |
-- |    2 | UNION        | shop_cust  | NULL            |
-- | NULL | UNION RESULT | <union1,2> | Using temporary |
-- UNION ALL:
-- |    1 | PRIMARY      | web_cust   | NULL            |
-- |    2 | UNION        | shop_cust  | NULL            |   (no temporary table step)`],
        [`<b>Disadvantages:</b> UNION silently removes <i>legitimate</i> duplicates, such as two identical sales of the same amount, which corrupts totals without any error. Choosing UNION out of habit is a common data bug.`,
            r`-- Two real sales of 50 each: UNION collapses them, UNION ALL keeps them
SELECT SUM(amt) AS total_union
FROM (SELECT 50 AS amt UNION SELECT 50 UNION SELECT 70) AS a;

SELECT SUM(amt) AS total_union_all
FROM (SELECT 50 AS amt UNION ALL SELECT 50 UNION ALL SELECT 70) AS b;

-- OUTPUT:
-- +-------------+      +-----------------+
-- | total_union |      | total_union_all |
-- +-------------+      +-----------------+
-- |         120 |      |             170 |
-- +-------------+      +-----------------+`],
        [`<b>Limitations:</b> column names come from the <i>first</i> SELECT only, and a trailing ORDER BY can refer only to those result names or positions, not to columns of later SELECTs. To sort or limit one branch, wrap that branch in parentheses.`,
            r`-- ORDER BY sees the result column name (who), not the original column name
SELECT name AS who FROM web_cust
UNION
SELECT name        FROM shop_cust
ORDER BY name;                                -- wrong name

-- OUTPUT:
-- ERROR 1054 (42S22): Unknown column 'name' in 'order clause'

-- Fix: ORDER BY who   (or ORDER BY 1)
-- Per-branch limit needs parentheses:
(SELECT name FROM web_cust  ORDER BY name LIMIT 1)
UNION ALL
(SELECT name FROM shop_cust ORDER BY name LIMIT 1);`],
        `
   web_cust            shop_cust
   ┌───────┬───────┐   ┌───────┬───────┐
   │ Asha  │ Pune  │   │ Ravi  │ Delhi │
   │ Ravi  │ Delhi │   │ Karan │ Goa   │
   │ Mina  │ Pune  │   └───────┴───────┘
   └───────┴───────┘
        │                    │
        └──────┬─────────────┘
               ▼
   UNION ALL : 5 rows (keeps both Ravi rows)
   UNION     : 4 rows (dedupe via temp table + unique index)
`,
        `Default to UNION ALL and reach for UNION only when duplicates across sources are truly possible and unwanted; if you can make the branches disjoint with a literal source column or a WHERE range, do so. For very large unions prefer partitioning or a single table over a view that unions many tables, because the optimizer plans each branch separately and cannot prune them like partitions.`
    ),

    'INTERSECT & EXCEPT': dd(
        [`<b>INTERSECT</b> returns only the rows present in <i>both</i> queries; <b>EXCEPT</b> returns rows of the first query that are <i>not</i> in the second. Both were added in <b>MySQL 8.0.31</b>, remove duplicates by default, and accept <code>ALL</code> to keep multiplicities.`,
            r`-- (tables web_cust and shop_cust from the UNION topic)
-- Customers who bought both online and in the shop
SELECT name, city FROM web_cust
INTERSECT
SELECT name, city FROM shop_cust;

-- Customers who bought online but never in the shop
SELECT name, city FROM web_cust
EXCEPT
SELECT name, city FROM shop_cust
ORDER BY name;

-- OUTPUT (INTERSECT):          OUTPUT (EXCEPT):
-- +------+-------+             +------+------+
-- | name | city  |             | name | city |
-- +------+-------+             +------+------+
-- | Ravi | Delhi |             | Asha | Pune |
-- +------+-------+             | Mina | Pune |
--                              +------+------+`],
        [`"Who is in A and B?" and "who is in A but not B?" are everyday questions: loyal customers, churned users, records missing from a sync. Before 8.0.31 you had to emulate them with joins or subqueries, which is longer and easy to get wrong with NULLs.`,
            r`-- Emulation for older servers (5.7 / early 8.0)
-- INTERSECT: EXISTS with a NULL-safe comparison (<=>)
SELECT DISTINCT w.name, w.city
FROM web_cust w
WHERE EXISTS (SELECT 1 FROM shop_cust s
              WHERE s.name <=> w.name AND s.city <=> w.city);

-- EXCEPT: NOT EXISTS (never NOT IN when NULLs may occur)
SELECT DISTINCT w.name, w.city
FROM web_cust w
WHERE NOT EXISTS (SELECT 1 FROM shop_cust s
                  WHERE s.name <=> w.name AND s.city <=> w.city)
ORDER BY w.name;

-- OUTPUT (first query):        OUTPUT (second query):
-- | Ravi | Delhi |             | Asha | Pune |
--                              | Mina | Pune |`],
        [`Reconciliation jobs use EXCEPT in both directions to find rows missing or extra between a source and a copy; marketing uses INTERSECT to find users who match two segments.`,
            r`-- Data-sync check: what is in the web list but missing from the shop list, and vice versa
SELECT 'only_web'  AS side, name FROM (SELECT name FROM web_cust  EXCEPT SELECT name FROM shop_cust) AS a
UNION ALL
SELECT 'only_shop' AS side, name FROM (SELECT name FROM shop_cust EXCEPT SELECT name FROM web_cust)  AS b
ORDER BY side, name;

-- OUTPUT:
-- +-----------+-------+
-- | side      | name  |
-- +-----------+-------+
-- | only_shop | Karan |
-- | only_web  | Asha  |
-- | only_web  | Mina  |
-- +-----------+-------+`],
        [`<b>Advantages:</b> declarative and readable, NULLs are treated as equal (unlike the = operator), and the ALL variants give true multiset arithmetic.`,
            r`-- NULL = NULL is unknown in WHERE, but set operators treat NULLs as the same value
SELECT NULL AS v INTERSECT SELECT NULL;

-- ALL keeps counts: left has two 1s, right removes one of them
(SELECT 1 AS v UNION ALL SELECT 1 UNION ALL SELECT 2)
EXCEPT ALL
(SELECT 1 AS v)
ORDER BY v;

-- OUTPUT (first):    OUTPUT (second):
-- +------+           +---+
-- | v    |           | v |
-- +------+           +---+
-- | NULL |           | 1 |
-- +------+           | 2 |
--                    +---+`],
        [`<b>Disadvantages:</b> precedence surprises people: INTERSECT binds tighter than UNION and EXCEPT, so mixed chains do not read left to right unless you add parentheses.`,
            r`-- INTERSECT runs first: 1 UNION (2 INTERSECT 2) = {1, 2}
SELECT 1 AS v UNION SELECT 2 INTERSECT SELECT 2 ORDER BY v;

-- Left-to-right intent needs parentheses: (1 UNION 2) INTERSECT 2 = {2}
(SELECT 1 AS v UNION SELECT 2) INTERSECT (SELECT 2);

-- OUTPUT (first):    OUTPUT (second):
-- | v |              | v |
-- | 1 |              | 2 |
-- | 2 |`],
        [`<b>Limitations:</b> not available before MySQL 8.0.31 (syntax error on 5.7 and older 8.0); EXCEPT is not symmetric; every branch must have the same column count; and set operators compare <i>whole rows</i>, so you cannot intersect on just one column while selecting more.`,
            r`-- Order matters for EXCEPT
SELECT name FROM shop_cust EXCEPT SELECT name FROM web_cust;

-- On a server older than 8.0.31:
-- ERROR 1064 (42000): You have an error in your SQL syntax; ... near 'EXCEPT SELECT ...'

-- OUTPUT (8.0.31+):
-- +-------+
-- | name  |
-- +-------+
-- | Karan |
-- +-------+`],
        `
   A = web_cust       B = shop_cust
        ┌───────────┬───────────┐
        │  Asha     │   Karan   │
        │  Mina     │           │
        │       ┌───┴───┐       │
        │       │ Ravi  │       │
        └───────┴───────┴───────┘
   A INTERSECT B = {Ravi}
   A EXCEPT    B = {Asha, Mina}
   B EXCEPT    A = {Karan}
   A UNION     B = {Asha, Mina, Ravi, Karan}
`,
        `Prefer INTERSECT/EXCEPT for clarity in reporting and reconciliation code, but check the minimum server version across every environment, including replicas and managed services. In hot paths, an indexed EXISTS or NOT EXISTS is usually planned as a semi or anti join and can beat the temporary-table approach of set operators; benchmark both.`
    ),

    'Column Compatibility & Duplicate Handling': dd(
        [`Every SELECT in a set operation must return the <b>same number of columns</b>, and columns are paired by <b>position</b>, never by name. The result takes its names from the first SELECT, and its column types are merged to a common type.`,
            r`SELECT 1 AS a, 'x' AS b
UNION ALL
SELECT 2,        'y';                         -- names a, b come from the first SELECT

-- OUTPUT:
-- +---+---+
-- | a | b |
-- +---+---+
-- | 1 | x |
-- | 2 | y |
-- +---+---+`],
        [`Because matching is positional, swapping two columns still runs without error and silently mixes unrelated data. Understanding the rules protects you from this class of bug.`,
            r`CREATE TABLE person (name VARCHAR(20), city VARCHAR(20));
INSERT INTO person VALUES ('Asha','Pune');

SELECT name, city FROM person
UNION ALL
SELECT city, name FROM person;                -- columns swapped by mistake

-- OUTPUT (no error, wrong data):
-- +------+------+
-- | name | city |
-- +------+------+
-- | Asha | Pune |
-- | Pune | Asha |
-- +------+------+`],
        [`When sources have different shapes (users, leads), pad the missing columns with NULL of the right type and add a source label. This builds one unified feed.`,
            r`SELECT id, email, NULL  AS phone, 'user' AS kind FROM (SELECT 1 AS id, 'a@x.com' AS email) AS u
UNION ALL
SELECT id, NULL,  phone,     'lead'         FROM (SELECT 9 AS id, '98450' AS phone) AS l;

-- OUTPUT:
-- +----+---------+-------+------+
-- | id | email   | phone | kind |
-- +----+---------+-------+------+
-- |  1 | a@x.com | NULL  | user |
-- |  9 | NULL    | 98450 | lead |
-- +----+---------+-------+------+`],
        [`<b>Advantages:</b> MySQL converts mixed types to one common type, so a number and a string can still be combined, and the rules (first SELECT names, positional match) are simple and predictable.`,
            r`CREATE TEMPORARY TABLE mixed AS
SELECT 1 AS v UNION ALL SELECT 'abc';          -- INT meets VARCHAR
SHOW COLUMNS FROM mixed;

-- OUTPUT (example, trimmed):
-- +-------+------------+------+
-- | Field | Type       | Null |
-- +-------+------------+------+
-- | v     | varchar(3) | NO   |
-- +-------+------------+------+
-- The INT 1 became the string '1'.`],
        [`<b>Disadvantages:</b> duplicate detection uses the column collation, so with a case-insensitive collation (the default) 'Asha' and 'asha' count as the same row, and NULLs are treated as equal. Which spelling you get back is not guaranteed.`,
            r`SELECT 'Asha' AS name
UNION
SELECT 'asha';                                -- default collation is case-insensitive

SELECT 'Asha' AS name
UNION
SELECT 'asha' COLLATE utf8mb4_0900_as_cs;     -- case-sensitive collation on one side

-- OUTPUT (first):    OUTPUT (second):
-- | name |           | name |
-- | Asha |           | Asha |
--                     | asha |`],
        [`<b>Limitations:</b> a different column count is an error, incompatible collations can raise "illegal mix" errors, and implicit conversion can change data (long string to short type, number to string sort order).`,
            r`SELECT 1, 2
UNION
SELECT 3;

-- OUTPUT:
-- ERROR 1222 (21000): The used SELECT statements have a different number of columns

-- Sorting hazard after type merging: the column becomes text, so 10 sorts before 9
SELECT 9 AS v UNION ALL SELECT '10' ORDER BY v;`],
        `
   SELECT  c1   c2   c3          position 1 ── position 1
   ───────────────────          position 2 ── position 2
   UNION ALL                    position 3 ── position 3
   SELECT  d1   d2   d3         names   : from the FIRST select
                                 types   : merged to a common type
                                 dedupe  : by collation, NULL = NULL
`,
        `Treat each branch of a union as an interface: list columns explicitly (never SELECT *), cast to the intended types, and add a source column. Put these unions behind a view with a test that checks column count and types so a later schema change in one source table fails loudly instead of silently shifting data.`
    ),
};
