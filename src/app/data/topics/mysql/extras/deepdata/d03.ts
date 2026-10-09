// Deep dive, modules 4-6 (Data Types, Constraints, CRUD).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d03: Record<string, Deep> = {
    'Numeric Types: INT, BIGINT, SMALLINT & TINYINT': dv(
        [`Integer types are fixed width: TINYINT 1 byte, SMALLINT 2, MEDIUMINT 3, INT 4, BIGINT 8, stored in two's complement. UNSIGNED shifts the range to start at 0. The type decides how many keys fit in a 16 KB index page, so it directly affects cache efficiency.`,
            r`SELECT -128 AS tinyint_min, 127 AS tinyint_max, 255 AS tinyint_unsigned_max,
       -2147483648 AS int_min, 2147483647 AS int_max, 4294967295 AS int_unsigned_max,
       9223372036854775807 AS bigint_max;

-- OUTPUT:
-- tinyint_min | tinyint_max | tinyint_unsigned_max | int_min     | int_max    | int_unsigned_max | bigint_max
--        -128 |         127 |                  255 | -2147483648 | 2147483647 |       4294967295 | 9223372036854775807`],
        [`Declare ranges deliberately: <code>TINYINT UNSIGNED</code> for 0-255 codes, <code>INT UNSIGNED</code> for ids up to 4.29 billion, <code>BIGINT UNSIGNED</code> for very large counters. Display width (<code>INT(11)</code>) is deprecated and does not change storage.`,
            r`CREATE TABLE counters (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  status TINYINT UNSIGNED NOT NULL DEFAULT 0,
  retries SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  views INT UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO counters (status, retries, views) VALUES (1, 300, 70000);
SELECT * FROM counters;

-- OUTPUT:
-- id | status | retries | views
--  1 |      1 |     300 | 70000`],
        [`Mistakes: INT primary keys on tables that will exceed 2.1 billion rows (ids stop with a duplicate-key error), UNSIGNED arithmetic that goes negative (error), and confusing INT(11) with a digit limit. Out of range values fail in strict mode and are clamped otherwise.`,
            r`CREATE TABLE small (n TINYINT UNSIGNED);
INSERT INTO small VALUES (256);
SELECT CAST(3 AS UNSIGNED) - CAST(5 AS UNSIGNED) AS negative_unsigned;

-- OUTPUT:
-- ERROR 1264 (22003): Out of range value for column 'n' at row 1
-- ERROR 1690 (22003): BIGINT UNSIGNED value is out of range in '(cast(3 as unsigned) - cast(5 as unsigned))'`],
        [`Smaller integers mean smaller indexes: every secondary index entry repeats the primary key. Switching an id from BIGINT to INT halves that overhead. Watch id growth against the limit and migrate before 70%.`,
            r`SELECT table_name, auto_increment, ROUND(auto_increment / 2147483647 * 100, 1) AS pct_of_int_max
FROM information_schema.tables WHERE table_schema = 'shop' AND auto_increment IS NOT NULL ORDER BY auto_increment DESC LIMIT 3;

-- OUTPUT: (example)
-- table_name | auto_increment | pct_of_int_max
-- events     |     1612004113 | 75.1      (plan the BIGINT migration now)`],
        [`Real-world: widening a primary key online. Add the new column, backfill in batches, switch, then drop, or use ALTER with INPLACE where allowed. Foreign keys must be changed in lockstep.`,
            r`ALTER TABLE events MODIFY id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, ALGORITHM=COPY;   -- locks writes: only on small tables
-- large tables: gh-ost --alter="MODIFY id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT" --execute

-- OUTPUT:
-- Query OK, 1612004113 rows affected  (or: gh-ost migration finished)`]
    ),

    'DECIMAL, FLOAT & DOUBLE': dv(
        [`FLOAT (4 bytes) and DOUBLE (8 bytes) store IEEE-754 binary fractions, so many decimal values (0.1) are approximations. DECIMAL stores decimal digits exactly (in packed groups of 9 digits per 4 bytes) and does exact arithmetic, at some CPU and space cost.`,
            r`SELECT CAST(0.1 AS DOUBLE) + CAST(0.2 AS DOUBLE) AS dbl_sum, 0.1 + 0.2 AS decimal_sum, (CAST(0.1 AS DOUBLE) + CAST(0.2 AS DOUBLE)) = 0.3 AS dbl_equals, (0.1 + 0.2) = 0.3 AS dec_equals;

-- OUTPUT:
-- dbl_sum             | decimal_sum | dbl_equals | dec_equals
-- 0.30000000000000004 | 0.3         |          0 |          1`],
        [`Declare precision and scale to match the business: <code>DECIMAL(10,2)</code> for currency, <code>DECIMAL(9,6)</code> for coordinates, DOUBLE for scientific measurements. Values are rounded to the scale on insert.`,
            r`CREATE TABLE prices (item VARCHAR(20), amount DECIMAL(10,2), rate DECIMAL(9,6), reading DOUBLE);
INSERT INTO prices VALUES ('Pen', 12.345, 18.123456789, 0.1);
SELECT * FROM prices;

-- OUTPUT:
-- item | amount | rate      | reading
-- Pen  |  12.35 | 18.123457 |     0.1`],
        [`Mistakes: storing money in FLOAT/DOUBLE, comparing floats with =, and summing floats in reports (errors accumulate). Compare with a tolerance or use DECIMAL.`,
            r`SELECT SUM(x) AS float_total FROM (SELECT CAST(0.1 AS FLOAT) AS x FROM information_schema.columns LIMIT 1000) t;
SELECT SUM(x) AS decimal_total FROM (SELECT CAST(0.1 AS DECIMAL(10,2)) AS x FROM information_schema.columns LIMIT 1000) t;

-- OUTPUT:
-- float_total        | decimal_total
-- 100.00000149011612 | 100.00`],
        [`Choose the smallest DECIMAL that fits: DECIMAL(10,2) uses 5 bytes, DECIMAL(20,2) uses 10. Indexing DECIMAL works fine but wide ones reduce keys per page. Store integer cents when you only add and compare.`,
            r`CREATE TABLE ledger_cents (id BIGINT PRIMARY KEY AUTO_INCREMENT, amount_cents BIGINT NOT NULL);
INSERT INTO ledger_cents (amount_cents) VALUES (1999),(501);
SELECT SUM(amount_cents) / 100 AS total FROM ledger_cents;

-- OUTPUT:
-- total
-- 25.0000`],
        [`Real-world: tax and rounding rules. Compute with full precision, round once at the defined step, and check that the parts sum to the whole.`,
            r`SELECT order_id, ROUND(SUM(qty * unit_price), 2) AS subtotal,
       ROUND(SUM(qty * unit_price) * 0.18, 2) AS gst,
       ROUND(SUM(qty * unit_price) * 1.18, 2) AS total
FROM order_items WHERE order_id = 1 GROUP BY order_id;

-- OUTPUT:
-- order_id | subtotal | gst    | total
--        1 |   999.50 | 179.91 | 1179.41`]
    ),

    'CHAR & VARCHAR': dv(
        [`CHAR(n) reserves n characters (padded with spaces, trimmed on read). VARCHAR(n) stores the actual characters plus a 1 or 2 byte length prefix. The server sizes in-memory temporary tables and sort buffers from the declared maximum, so oversized VARCHARs waste memory even when values are short.`,
            r`CREATE TABLE codes (c CHAR(5), v VARCHAR(5));
INSERT INTO codes VALUES ('ab','ab');
SELECT CONCAT('[',c,']') AS char_value, CONCAT('[',v,']') AS varchar_value, LENGTH(c) AS len_c, LENGTH(v) AS len_v FROM codes;

-- OUTPUT:
-- char_value | varchar_value | len_c | len_v
-- [ab]       | [ab]          |     2 |     2     (CHAR padding is removed on SELECT)`],
        [`Charset and collation matter: utf8mb4 characters take 1-4 bytes. A VARCHAR(255) can use up to 1020 bytes, and index key limits are in bytes. Choose collations by comparison needs (case, accent sensitivity) and use <code>BINARY</code> or <code>_bin</code> for exact matches.`,
            r`SELECT CHAR_LENGTH('ab€😀') AS chars, LENGTH('ab€😀') AS bytes;
SELECT 'Apple' = 'apple' AS ci_equal, 'Apple' COLLATE utf8mb4_0900_as_cs = 'apple' AS cs_equal, 'cafe' = 'café' AS accent_insensitive;

-- OUTPUT:
-- chars | bytes
--     4 |     9
-- ci_equal | cs_equal | accent_insensitive
--        1 |        0 |                  1`],
        [`Mistakes: VARCHAR(255) everywhere, CHAR for variable data, ignoring trailing spaces, and mixed collations in joins (error 1267 or lost index). Align collations of joined columns.`,
            r`CREATE TABLE a (code VARCHAR(10) COLLATE utf8mb4_0900_ai_ci);
CREATE TABLE b (code VARCHAR(10) COLLATE utf8mb4_unicode_ci);
SELECT * FROM a JOIN b ON a.code = b.code;

-- OUTPUT:
-- ERROR 1267 (HY000): Illegal mix of collations (utf8mb4_0900_ai_ci,IMPLICIT) and (utf8mb4_unicode_ci,IMPLICIT) for operation '='`],
        [`Index size depends on bytes: a VARCHAR(255) utf8mb4 index entry can take 1020 bytes. Use a smaller declared length, prefix indexes or hashes for long strings, and measure with the catalog.`,
            r`ALTER TABLE users MODIFY email VARCHAR(120) NOT NULL;           -- was VARCHAR(255)
SELECT index_name, ROUND(stat_value * @@innodb_page_size / 1048576, 1) AS mb FROM mysql.innodb_index_stats WHERE table_name = 'users' AND stat_name = 'size';

-- OUTPUT: (example)
-- index_name | mb
-- PRIMARY    | 220.0
-- uq_email   |  96.0`],
        [`Real-world: store normalized values for fast, correct comparisons: lowercase emails, trimmed names, fixed-length country codes as CHAR(2) with a CHECK.`,
            r`CREATE TABLE customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(120) NOT NULL,
  country CHAR(2) NOT NULL CHECK (country REGEXP '^[A-Z]{2}$'),
  UNIQUE KEY uq_email (email)
);
INSERT INTO customers (email, country) VALUES (LOWER(TRIM('  Asha@Example.COM ')), 'IN');
SELECT email, country FROM customers;

-- OUTPUT:
-- email             | country
-- asha@example.com  | IN`]
    ),

    'TEXT, MEDIUMTEXT & LONGTEXT': dv(
        [`TEXT types hold long strings. In InnoDB large values are stored off the main row page (overflow pages) with a short pointer left in the row, so selecting them forces extra page reads. The row itself stays small, which keeps scans on other columns fast.`,
            r`CREATE TABLE articles (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(100), body LONGTEXT);
INSERT INTO articles (title, body) VALUES ('Intro', REPEAT('MySQL ', 50000));
SELECT id, title, LENGTH(body) AS bytes FROM articles;

-- OUTPUT:
-- id | title | bytes
--  1 | Intro | 300000       (the body lives on overflow pages)`],
        [`Sizes: TEXT 64 KB, MEDIUMTEXT 16 MB, LONGTEXT 4 GB. BLOB variants are the binary equivalents. Index a prefix or use FULLTEXT; a TEXT column cannot be a primary key and indexing needs a prefix length.`,
            r`ALTER TABLE articles ADD INDEX idx_body_prefix (body(40));
ALTER TABLE articles ADD FULLTEXT KEY ft_body (title, body);
SELECT id FROM articles WHERE MATCH(title, body) AGAINST ('mysql');

-- OUTPUT:
-- id
-- 1`],
        [`Mistakes: SELECT * from tables with TEXT columns on list pages, sorting or grouping on TEXT (forces disk temp tables), and exceeding <code>max_allowed_packet</code> on insert. Select only the columns you need.`,
            r`SELECT id, title FROM articles ORDER BY id DESC LIMIT 20;         -- list page: no body
SELECT body FROM articles WHERE id = 1;                            -- fetch the body only for the detail page
SET GLOBAL max_allowed_packet = 128 * 1024 * 1024;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Move rarely read large text to a separate one-to-one table so the hot table stays compact and backups of the main table stay small. Measure the effect with row length.`,
            r`CREATE TABLE article_bodies (article_id INT PRIMARY KEY, body LONGTEXT, FOREIGN KEY (article_id) REFERENCES articles(id));
SELECT table_name, avg_row_length FROM information_schema.tables WHERE table_name IN ('articles','article_bodies');

-- OUTPUT: (example)
-- table_name     | avg_row_length
-- articles       |            180
-- article_bodies |         300000`],
        [`Real-world: user generated content. Limit length in the application and with a CHECK, store large files in object storage, and keep a URL plus metadata in MySQL.`,
            r`CREATE TABLE posts (id BIGINT PRIMARY KEY AUTO_INCREMENT, author_id BIGINT NOT NULL, body TEXT NOT NULL,
  attachment_url VARCHAR(300) NULL, CHECK (CHAR_LENGTH(body) <= 20000));
INSERT INTO posts (author_id, body, attachment_url) VALUES (1, 'Release notes...', 's3://media/2026/05/notes.pdf');

-- OUTPUT:
-- Query OK, 1 row affected`]
    ),

    'DATE, TIME & YEAR': dv(
        [`DATE (3 bytes) stores a calendar day, TIME (3 bytes plus fractions) a time or duration, YEAR (1 byte) a four-digit year. They are stored as integers, so comparison and range scans are cheap, and they have no time zone.`,
            r`CREATE TABLE events (id INT PRIMARY KEY, day DATE, at_time TIME, yr YEAR);
INSERT INTO events VALUES (1,'2026-03-15','14:30:00',2026);
SELECT day, DAYNAME(day) AS weekday, at_time, HOUR(at_time) AS hr, yr FROM events;

-- OUTPUT:
-- day        | weekday | at_time  | hr | yr
-- 2026-03-15 | Sunday  | 14:30:00 | 14 | 2026`],
        [`Date arithmetic and formatting: <code>DATE_ADD</code>, <code>DATE_SUB</code>, <code>DATEDIFF</code>, <code>LAST_DAY</code>, <code>DATE_FORMAT</code>, <code>STR_TO_DATE</code>. Input formats must match or be converted explicitly.`,
            r`SELECT DATE_ADD('2026-01-31', INTERVAL 1 MONTH) AS next_month, LAST_DAY('2026-02-10') AS month_end,
       DATEDIFF('2026-12-25', '2026-05-01') AS days_left, DATE_FORMAT('2026-03-15', '%d %b %Y') AS pretty,
       STR_TO_DATE('15/03/2026', '%d/%m/%Y') AS parsed, MAKETIME(26, 5, 0) AS duration;

-- OUTPUT:
-- next_month | month_end  | days_left | pretty      | parsed     | duration
-- 2026-02-28 | 2026-02-28 |       238 | 15 Mar 2026 | 2026-03-15 | 26:05:00`],
        [`Mistakes: storing dates as strings, wrapping the column in functions in WHERE (kills the index), and invalid dates like Feb 30 (error in strict mode). Use a half-open range instead of YEAR(date).`,
            r`-- slow: function on the column
SELECT COUNT(*) FROM orders WHERE YEAR(order_date) = 2026;
-- fast: sargable range
SELECT COUNT(*) FROM orders WHERE order_date >= '2026-01-01' AND order_date < '2027-01-01';
INSERT INTO events VALUES (2, '2026-02-30', '10:00:00', 2026);

-- OUTPUT:
-- ERROR 1292 (22007): Incorrect date value: '2026-02-30' for column 'day' at row 1`],
        [`A calendar (date dimension) table makes reporting simple and fast: group by week, quarter or fiscal period without functions on big tables, and include days with zero activity.`,
            r`CREATE TABLE calendar (d DATE PRIMARY KEY, yr SMALLINT, qtr TINYINT, mth TINYINT, weekday TINYINT, is_weekend BOOL);
INSERT INTO calendar SELECT d, YEAR(d), QUARTER(d), MONTH(d), WEEKDAY(d), WEEKDAY(d) >= 5
FROM (WITH RECURSIVE s AS (SELECT DATE('2026-01-01') d UNION ALL SELECT d + INTERVAL 1 DAY FROM s WHERE d < '2026-12-31') SELECT d FROM s) x;
SELECT qtr, COUNT(*) AS days FROM calendar GROUP BY qtr;

-- OUTPUT:
-- qtr | days
--   1 |   90
--   2 |   91
--   3 |   92
--   4 |   92`],
        [`Real-world: ages and tenure. Calculate with TIMESTAMPDIFF so leap years and month lengths are handled for you.`,
            r`SELECT name, birth_date, TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age, TIMESTAMPDIFF(MONTH, join_date, CURDATE()) AS months_employed FROM staff;

-- OUTPUT: (example)
-- name | birth_date | age | months_employed
-- Asha | 1995-08-20 |  30 |              42`]
    ),

    'DATETIME vs TIMESTAMP': dv(
        [`TIMESTAMP stores seconds since 1970-01-01 UTC (4 bytes) and converts to the session time zone on read and write. DATETIME stores the literal date and time you gave (5 bytes plus fractions) with no conversion and a range from year 1000 to 9999.`,
            r`CREATE TABLE tz_demo (ts TIMESTAMP NULL, dt DATETIME NULL);
SET time_zone = '+00:00';
INSERT INTO tz_demo VALUES ('2026-06-01 12:00:00', '2026-06-01 12:00:00');
SET time_zone = '+05:30';
SELECT ts, dt FROM tz_demo;

-- OUTPUT:
-- ts                  | dt
-- 2026-06-01 17:30:00 | 2026-06-01 12:00:00      (only TIMESTAMP shifted)`],
        [`Both accept fractional seconds <code>(0-6)</code> and automatic defaults/updates through <code>DEFAULT CURRENT_TIMESTAMP</code> and <code>ON UPDATE CURRENT_TIMESTAMP</code>. Use precision 3 or 6 when ordering events within the same second.`,
            r`CREATE TABLE audit (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
INSERT INTO audit () VALUES ();
SELECT created_at = updated_at AS same, created_at FROM audit;

-- OUTPUT:
-- same | created_at
--    1 | 2026-05-01 10:00:00.123`],
        [`Mistakes: TIMESTAMP for dates beyond 2038, mixing server and session time zones, and DST ambiguity with local DATETIME values. Standardize on UTC storage and convert at the edge.`,
            r`INSERT INTO tz_demo (ts) VALUES ('2040-01-01 00:00:00');
-- OUTPUT: ERROR 1292 (22007): Incorrect datetime value: '2040-01-01 00:00:00' for column 'ts' at row 1

SELECT @@global.time_zone, @@session.time_zone, NOW(), UTC_TIMESTAMP();

-- OUTPUT:
-- SYSTEM | +05:30 | 2026-05-01 15:30:00 | 2026-05-01 10:00:00     (know which one you are reading)`],
        [`TIMESTAMP is smaller (4 vs 5 bytes) and good for event instants; DATETIME is simpler for local business times. Index and range queries work the same way, so choose by semantics, not speed.`,
            r`EXPLAIN SELECT id FROM audit WHERE created_at >= '2026-05-01' AND created_at < '2026-05-02';
SELECT CONVERT_TZ('2026-06-01 12:00:00', 'UTC', 'Asia/Kolkata') AS ist;

-- OUTPUT: (example)
-- type  | key        (range scan on idx_created)
-- ist
-- 2026-06-01 17:30:00`],
        [`Real-world: a global app stores instants in UTC and the user's zone name separately, converting only when displaying. Appointment times in a local zone store the local DATETIME plus the zone id.`,
            r`CREATE TABLE appointments (id BIGINT PRIMARY KEY AUTO_INCREMENT, starts_utc DATETIME NOT NULL, local_zone VARCHAR(40) NOT NULL);
INSERT INTO appointments (starts_utc, local_zone) VALUES ('2026-06-01 04:30:00', 'Asia/Kolkata');
SELECT CONVERT_TZ(starts_utc, 'UTC', local_zone) AS local_start FROM appointments;

-- OUTPUT:
-- local_start
-- 2026-06-01 10:00:00`]
    ),

    'BOOLEAN, JSON & Binary Types': dv(
        [`BOOLEAN is TINYINT(1): any non-zero value is true. JSON values are validated and stored in a binary format with a dictionary of keys, allowing fast path lookups without re-parsing. BINARY/VARBINARY/BLOB compare and sort by raw bytes with no collation.`,
            r`CREATE TABLE feature_flags (name VARCHAR(30) PRIMARY KEY, enabled BOOLEAN NOT NULL DEFAULT FALSE, config JSON);
INSERT INTO feature_flags VALUES ('dark_mode', TRUE, '{"rollout": 25, "regions": ["IN","US"]}');
SELECT name, enabled, config->>'$.rollout' AS rollout, JSON_LENGTH(config->'$.regions') AS regions FROM feature_flags;

-- OUTPUT:
-- name      | enabled | rollout | regions
-- dark_mode |       1 | 25      |       2`],
        [`Common functions: <code>JSON_OBJECT</code>, <code>JSON_ARRAY</code>, <code>JSON_SET</code>, <code>JSON_REMOVE</code>, <code>JSON_CONTAINS</code>, <code>MEMBER OF</code>. For binary: <code>UUID_TO_BIN</code>, <code>HEX</code>, <code>UNHEX</code> and <code>SHA2</code>.`,
            r`UPDATE feature_flags SET config = JSON_SET(config, '$.rollout', 50, '$.owner', 'growth') WHERE name = 'dark_mode';
SELECT 'IN' MEMBER OF (config->'$.regions') AS in_india FROM feature_flags;
SELECT HEX(UUID_TO_BIN('3f06af63-a93c-11e4-9797-00505690773f', 1)) AS packed, SHA2('secret', 256) AS digest;

-- OUTPUT:
-- in_india
--        1`],
        [`Mistakes: using JSON for fields you filter and join on (no constraints, weak indexing), storing UUIDs as CHAR(36), and expecting BOOLEAN to reject values like 5. Promote hot JSON fields to generated columns.`,
            r`INSERT INTO feature_flags (name, enabled) VALUES ('x', 5);      -- accepted: BOOLEAN is just TINYINT
SELECT name, enabled FROM feature_flags WHERE name = 'x';
ALTER TABLE feature_flags ADD CONSTRAINT chk_enabled CHECK (enabled IN (0,1));

-- OUTPUT:
-- name | enabled
-- x    |       5`],
        [`BINARY(16) UUIDs halve key size versus CHAR(36), and swapping the time parts (flag 1) makes time-based UUIDs sort roughly in time order, which reduces page splits.`,
            r`CREATE TABLE sessions (id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID(), 1)), user_id BIGINT NOT NULL);
INSERT INTO sessions (user_id) VALUES (1),(2);
SELECT BIN_TO_UUID(id, 1) AS id, user_id FROM sessions ORDER BY id;

-- OUTPUT:
-- id                                   | user_id
-- 11ef0a52-3c1d-8b23-9e66-0242ac110002 |       1`],
        [`Real-world hybrid: relational columns for what you query, JSON for flexible extras, and a generated column plus index for the one JSON field you filter on.`,
            r`CREATE TABLE products (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(60) NOT NULL, price DECIMAL(10,2) NOT NULL, attrs JSON,
  brand VARCHAR(30) AS (attrs->>'$.brand') VIRTUAL, KEY idx_brand (brand));
INSERT INTO products (name, price, attrs) VALUES ('Shirt', 999, '{"brand":"Acme","sizes":["S","M"]}');
EXPLAIN SELECT id FROM products WHERE brand = 'Acme';

-- OUTPUT: (example)
-- type | key       | rows
-- ref  | idx_brand |    1`]
    ),

    'Storage Size, Range & Type Performance': dv(
        [`Every row is a record in a 16 KB page. Fixed fields cost their declared bytes, variable fields cost length plus data, NULL bits are kept in a header bitmap. Fewer bytes per row means more rows per page, so a scan or an index range reads fewer pages and the buffer pool holds more of your data.`,
            r`SELECT table_name, table_rows, avg_row_length, ROUND(16384 / avg_row_length) AS rows_per_page, ROUND(data_length/1048576) AS data_mb
FROM information_schema.tables WHERE table_schema = 'shop' AND table_rows > 0 ORDER BY data_length DESC LIMIT 3;

-- OUTPUT: (example)
-- table_name  | table_rows | avg_row_length | rows_per_page | data_mb
-- order_items |    5400000 |             58 |           282 |     310
-- orders      |    1800000 |             96 |           171 |     165`],
        [`A quick reference of storage: TINYINT 1, SMALLINT 2, INT 4, BIGINT 8, DECIMAL(10,2) 5, DATE 3, DATETIME 5, TIMESTAMP 4, CHAR(n) n x charset bytes, VARCHAR(n) length + 1-2, ENUM 1-2. Use <code>PROCEDURE ANALYSE</code>-style checks (MIN/MAX/LENGTH) on real data to size columns.`,
            r`SELECT MIN(price), MAX(price), MAX(CHAR_LENGTH(name)) AS longest_name, COUNT(DISTINCT status) AS statuses FROM products;

-- OUTPUT:
-- MIN(price) | MAX(price) | longest_name | statuses
--       9.00 |   99999.00 |           58 |        4        (so DECIMAL(7,2), VARCHAR(80), and ENUM/TINYINT for status)`],
        [`Mistakes: oversizing types "just in case", VARCHAR(255) for 2-letter codes, storing IPs as strings, and comparing different types (index lost). Use INET6_ATON for IPs and a lookup table or ENUM for tiny sets.`,
            r`CREATE TABLE logins (id BIGINT PRIMARY KEY AUTO_INCREMENT, ip VARBINARY(16) NOT NULL, status ENUM('OK','FAIL','LOCKED') NOT NULL);
INSERT INTO logins (ip, status) VALUES (INET6_ATON('192.168.1.10'), 'OK');
SELECT INET6_NTOA(ip) AS ip, status FROM logins;

-- OUTPUT:
-- ip           | status
-- 192.168.1.10 | OK`],
        [`Type mismatch in comparisons forces conversion on every row and disables the index. Always compare a column with a value of the same type.`,
            r`EXPLAIN SELECT id FROM users WHERE phone = 9876543210;          -- phone is VARCHAR: converts each row
EXPLAIN SELECT id FROM users WHERE phone = '9876543210';        -- same type: index used

-- OUTPUT: (example)
-- first : type=ALL  key=NULL
-- second: type=ref  key=idx_phone`],
        [`Real-world capacity planning: estimate table and index size from row counts and widths before launch, then compare with a prototype loaded with realistic data.`,
            r`SELECT 50000000 AS expected_rows, 64 AS row_bytes, ROUND(50000000 * 64 / 1073741824, 1) AS data_gb,
       ROUND(50000000 * (8 + 4) / 1073741824 * 1.3, 1) AS one_secondary_index_gb;

-- OUTPUT:
-- expected_rows | row_bytes | data_gb | one_secondary_index_gb
--      50000000 |        64 |     3.0 |                    0.7`]
    ),

    'PRIMARY KEY Constraint': dv(
        [`InnoDB stores a table as a B-tree ordered by the primary key (the clustered index). If you do not define one, it uses the first unique NOT NULL index, or creates a hidden 6-byte row id. Inserting in key order appends to the right-hand page; random keys split pages.`,
            r`CREATE TABLE seq_pk (id BIGINT PRIMARY KEY AUTO_INCREMENT, v INT);
CREATE TABLE rnd_pk (id CHAR(36) PRIMARY KEY, v INT);
-- insert 1M rows each: seq_pk ~ 6 s, rnd_pk ~ 24 s (page splits and a larger tree)
SELECT table_name, ROUND(data_length/1048576) AS mb FROM information_schema.tables WHERE table_name IN ('seq_pk','rnd_pk');

-- OUTPUT: (example)
-- table_name | mb
-- seq_pk     |  44
-- rnd_pk     |  96`],
        [`Ways to define a primary key: inline, table-level, composite, with AUTO_INCREMENT, with UUIDs, or added later. You can also rename nothing: the PK is always named PRIMARY.`,
            r`CREATE TABLE a (id INT PRIMARY KEY);
CREATE TABLE b (a_id INT, b_id INT, PRIMARY KEY (a_id, b_id));
ALTER TABLE c ADD PRIMARY KEY (id);
ALTER TABLE d DROP PRIMARY KEY, ADD PRIMARY KEY (tenant_id, id);
SHOW KEYS FROM b WHERE Key_name = 'PRIMARY';

-- OUTPUT:
-- Key_name | Seq_in_index | Column_name
-- PRIMARY  | 1            | a_id
-- PRIMARY  | 2            | b_id`],
        [`Mistakes: no primary key (hidden row id, poor replication and ORM support), a mutable natural key, UUIDv4 strings, and expecting AUTO_INCREMENT to be gap free or reusable after rollback.`,
            r`CREATE TABLE g (id INT PRIMARY KEY AUTO_INCREMENT, v INT);
START TRANSACTION; INSERT INTO g (v) VALUES (1); ROLLBACK;
INSERT INTO g (v) VALUES (2);
SELECT id FROM g;
SELECT t.table_name FROM information_schema.tables t LEFT JOIN information_schema.statistics s ON s.table_schema=t.table_schema AND s.table_name=t.table_name AND s.index_name='PRIMARY' WHERE t.table_schema=DATABASE() AND s.index_name IS NULL AND t.table_type='BASE TABLE';

-- OUTPUT:
-- id
-- 2           (id 1 was consumed by the rolled back insert)`],
        [`Auto-increment locking: with <code>innodb_autoinc_lock_mode=2</code> (default in 8.0) concurrent inserts do not wait for each other, at the cost of gaps. For ordered, distributed ids use snowflake-style or UUIDv7 keys.`,
            r`SHOW VARIABLES LIKE 'innodb_autoinc_lock_mode';
SELECT auto_increment FROM information_schema.tables WHERE table_name = 'g';

-- OUTPUT:
-- Variable_name            | Value
-- innodb_autoinc_lock_mode | 2`],
        [`Real-world gap-free numbering such as invoice numbers: do not use AUTO_INCREMENT. Use a counter row locked inside the same transaction as the invoice.`,
            r`START TRANSACTION;
SELECT next_no FROM counters WHERE name = 'invoice' FOR UPDATE;
UPDATE counters SET next_no = next_no + 1 WHERE name = 'invoice';
INSERT INTO invoices (invoice_no, customer_id, total) VALUES (1001, 7, 500);
COMMIT;

-- OUTPUT:
-- next_no
-- 1001`]
    ),

    'FOREIGN KEY Constraint': dv(
        [`When you insert or update a child row, InnoDB looks up the parent key (taking a shared lock on that parent row) to ensure it exists; when you delete or update a parent key, it looks into the child index to apply the action. That is why both sides need indexes, and why hot parent rows can become contention points.`,
            r`CREATE TABLE parent (id INT PRIMARY KEY) ENGINE=InnoDB;
CREATE TABLE child (id INT PRIMARY KEY, parent_id INT NOT NULL, KEY idx_parent (parent_id),
  CONSTRAINT fk_child_parent FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE RESTRICT) ENGINE=InnoDB;
INSERT INTO parent VALUES (1);
INSERT INTO child VALUES (1, 1);
DELETE FROM parent WHERE id = 1;

-- OUTPUT:
-- ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (shop.child, CONSTRAINT fk_child_parent FOREIGN KEY (parent_id) REFERENCES parent (id))`],
        [`Actions: <code>RESTRICT</code>/<code>NO ACTION</code> block the change, <code>CASCADE</code> propagates it, <code>SET NULL</code> clears the child column (it must be nullable). You can add or drop constraints later and disable checks temporarily for bulk loads.`,
            r`ALTER TABLE child DROP FOREIGN KEY fk_child_parent;
ALTER TABLE child ADD CONSTRAINT fk_child_parent FOREIGN KEY (parent_id) REFERENCES parent(id) ON DELETE CASCADE ON UPDATE CASCADE;
SET foreign_key_checks = 0;     -- bulk load only, then validate and set back to 1
SET foreign_key_checks = 1;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: mismatched column types, a missing index on a non-InnoDB or logical reference, long cascade deletes, and creating circular references that make loading order impossible. Detect orphans with an anti-join.`,
            r`SELECT c.id FROM child c LEFT JOIN parent p ON p.id = c.parent_id WHERE p.id IS NULL;
SELECT constraint_name, delete_rule FROM information_schema.referential_constraints WHERE constraint_schema = DATABASE();

-- OUTPUT:
-- (no orphans)
-- constraint_name | delete_rule
-- fk_child_parent | CASCADE`],
        [`Foreign key checks add lock overhead on hot parents. Measure lock waits, and for very high write rates consider removing the constraint but keeping the index and running periodic orphan audits.`,
            r`SELECT object_name, lock_mode, lock_data FROM performance_schema.data_locks WHERE object_name IN ('parent','child');
SELECT * FROM sys.innodb_lock_waits;

-- OUTPUT: (example)
-- object_name | lock_mode | lock_data
-- parent      | S,REC_NOT_GAP | 1       (shared lock taken by the foreign key check)`],
        [`Real-world: an order system uses CASCADE for order lines (owned by the order) and RESTRICT for customer references (history must survive), giving safe deletes where intended.`,
            r`CREATE TABLE order_lines (order_id BIGINT NOT NULL, line_no INT NOT NULL, product_id BIGINT NOT NULL, qty INT NOT NULL,
  PRIMARY KEY (order_id, line_no),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT);
DELETE FROM orders WHERE id = 10;       -- removes its lines too
DELETE FROM products WHERE id = 7;      -- blocked while any line references it

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails`]
    ),

    'UNIQUE Constraint': dv(
        [`A UNIQUE constraint is a unique B-tree index. On INSERT or UPDATE InnoDB searches the index; if an entry with the same key exists (and is visible or locked), it raises a duplicate-key error. Concurrent inserts of the same value block on the first one's lock, so exactly one wins.`,
            r`CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(100) NOT NULL, UNIQUE KEY uq_email (email));
INSERT INTO users (email) VALUES ('a@x.com');
INSERT INTO users (email) VALUES ('a@x.com');
SELECT COUNT(*) FROM users;

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'a@x.com' for key 'users.uq_email'
-- COUNT(*)
-- 1`],
        [`Handle duplicates intentionally: <code>INSERT IGNORE</code> skips them, <code>ON DUPLICATE KEY UPDATE</code> upserts, <code>REPLACE</code> deletes and reinserts. Composite and functional unique indexes express richer rules.`,
            r`INSERT IGNORE INTO users (email) VALUES ('a@x.com'), ('b@x.com');
INSERT INTO users (email) VALUES ('a@x.com') ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);
CREATE UNIQUE INDEX uq_lower_email ON users ((LOWER(email)));
SELECT ROW_COUNT();

-- OUTPUT:
-- Query OK, 1 row affected, 1 warning     (IGNORE: a@x.com skipped, b@x.com inserted)`],
        [`Mistakes: check-then-insert (a race), assuming NULL duplicates are rejected, ignoring collation (case-insensitive equality), and adding UNIQUE to a table that already has duplicates. Let the constraint decide and handle error 1062.`,
            r`-- racy
-- SELECT COUNT(*) FROM users WHERE email = ?; if 0 then INSERT ...
-- safe
INSERT INTO users (email) VALUES ('c@x.com');
SELECT user, host FROM mysql.user LIMIT 0;   -- (placeholder to show nothing else needed)

-- finding duplicates before adding the constraint
SELECT email, COUNT(*) FROM legacy_users GROUP BY email HAVING COUNT(*) > 1;

-- OUTPUT:
-- email   | COUNT(*)
-- a@x.com |        3`],
        [`Unique indexes speed lookups by that key but add write cost, and they cannot use the change buffer. Keep unique keys short and consider a hash column for very long values.`,
            r`ALTER TABLE links ADD COLUMN url_hash BINARY(32) AS (UNHEX(SHA2(url, 256))) STORED, ADD UNIQUE KEY uq_url_hash (url_hash);
INSERT INTO links (url) VALUES ('https://example.com/a');
EXPLAIN SELECT id FROM links WHERE url_hash = UNHEX(SHA2('https://example.com/a', 256));

-- OUTPUT: (example)
-- type  | key
-- const | uq_url_hash`],
        [`Real-world: idempotent API requests. Store the client's idempotency key with a UNIQUE constraint; a retried request hits the duplicate error and returns the first result instead of charging twice.`,
            r`CREATE TABLE payments (id BIGINT PRIMARY KEY AUTO_INCREMENT, idempotency_key CHAR(36) NOT NULL, amount DECIMAL(10,2) NOT NULL, UNIQUE KEY uq_idem (idempotency_key));
INSERT INTO payments (idempotency_key, amount) VALUES ('7b5d...c1', 500);
INSERT INTO payments (idempotency_key, amount) VALUES ('7b5d...c1', 500);

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 1062 (23000): Duplicate entry '7b5d...c1' for key 'payments.uq_idem'`]
    ),

    'NOT NULL & DEFAULT': dv(
        [`NULL is stored as one bit in the row's NULL bitmap, so nullable columns cost almost nothing in space, but they cost in logic: comparisons with NULL are unknown, and aggregates skip them. NOT NULL plus DEFAULT guarantees a usable value on every row.`,
            r`CREATE TABLE tasks (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(60) NOT NULL, status VARCHAR(10) NOT NULL DEFAULT 'OPEN', due DATE NULL);
INSERT INTO tasks (title) VALUES ('Write docs');
INSERT INTO tasks (title, due) VALUES ('Ship', NULL);
SELECT title, status, due FROM tasks;

-- OUTPUT:
-- title      | status | due
-- Write docs | OPEN   | NULL
-- Ship       | OPEN   | NULL`],
        [`DEFAULT can be a literal or, from 8.0.13, an expression in parentheses: <code>DEFAULT (UUID())</code>, <code>DEFAULT (CURRENT_DATE)</code>. Existing columns can be altered; instant default changes only touch metadata.`,
            r`ALTER TABLE tasks ADD COLUMN token CHAR(36) NOT NULL DEFAULT (UUID()), ADD COLUMN created DATE NOT NULL DEFAULT (CURRENT_DATE);
ALTER TABLE tasks ALTER COLUMN status SET DEFAULT 'NEW';
INSERT INTO tasks (title) VALUES ('Review');
SELECT title, status, LENGTH(token) AS token_len FROM tasks WHERE title = 'Review';

-- OUTPUT:
-- title  | status | token_len
-- Review | NEW    |        36`],
        [`Mistakes: leaving columns nullable by habit, using empty string or 0 as "missing", and adding NOT NULL to a populated table without a default or backfill. Model missing as NULL only when it is genuinely optional.`,
            r`INSERT INTO tasks (status) VALUES ('DONE');
UPDATE tasks SET due = NULL WHERE id = 1;
SELECT COUNT(*) AS rows_n, COUNT(due) AS with_due FROM tasks;

-- OUTPUT:
-- ERROR 1364 (HY000): Field 'title' doesn't have a default value
-- rows_n | with_due
--      3 |        0`],
        [`Adding a column with a constant default is metadata-only with <code>ALGORITHM=INSTANT</code>, but backfilling NOT NULL without a default rewrites the table. Check the algorithm supported before running on a big table.`,
            r`ALTER TABLE orders ADD COLUMN channel VARCHAR(10) NOT NULL DEFAULT 'WEB', ALGORITHM=INSTANT;
SELECT table_name, column_name, column_default FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'channel';

-- OUTPUT:
-- Query OK, 0 rows affected (0.03 sec)
-- table_name | column_name | column_default
-- orders     | channel     | WEB`],
        [`Real-world: required business fields are NOT NULL with CHECKs, optional ones are NULL, and "unknown vs none" is modelled explicitly (for example a separate boolean).`,
            r`CREATE TABLE customers (id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(80) NOT NULL, phone VARCHAR(20) NULL,
  marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE, CHECK (phone IS NULL OR phone REGEXP '^[0-9+ -]{7,20}$'));
INSERT INTO customers (name, phone) VALUES ('Asha', '+91 98765 43210');
SELECT name, COALESCE(phone, 'no phone') AS phone, marketing_opt_in FROM customers;

-- OUTPUT:
-- name | phone           | marketing_opt_in
-- Asha | +91 98765 43210 |                0`]
    ),

    'CHECK Constraint': dv(
        [`A CHECK is a boolean expression evaluated per row on INSERT and UPDATE (when ENFORCED). A row is rejected only when the expression is FALSE; TRUE and UNKNOWN (NULL) pass. The expression may use columns of the row and deterministic functions, not subqueries or other rows.`,
            r`CREATE TABLE bookings (id INT PRIMARY KEY, start_d DATE NOT NULL, end_d DATE NOT NULL, guests TINYINT NOT NULL,
  CONSTRAINT chk_dates CHECK (end_d > start_d), CONSTRAINT chk_guests CHECK (guests BETWEEN 1 AND 10));
INSERT INTO bookings VALUES (1, '2026-05-10', '2026-05-12', 2);
INSERT INTO bookings VALUES (2, '2026-05-10', '2026-05-09', 2);

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'chk_dates' is violated.`],
        [`Add, drop and toggle checks after creation. NOT ENFORCED keeps documentation of a rule without validating, useful while cleaning data.`,
            r`ALTER TABLE bookings ADD CONSTRAINT chk_future CHECK (start_d >= '2026-01-01') NOT ENFORCED;
ALTER TABLE bookings ALTER CONSTRAINT chk_future ENFORCED;
ALTER TABLE bookings DROP CHECK chk_future;
SELECT constraint_name, check_clause, enforced FROM information_schema.check_constraints c JOIN information_schema.table_constraints t USING (constraint_schema, constraint_name) WHERE t.table_name = 'bookings';

-- OUTPUT:
-- constraint_name | check_clause                 | enforced
-- chk_dates       | (end_d > start_d)            | YES
-- chk_guests      | (guests between 1 and 10)    | YES`],
        [`Mistakes: expecting NULL to fail a CHECK (it passes), trying cross-row rules (not supported), and old MySQL versions that ignored CHECK silently. Combine with NOT NULL, and use triggers or locks for multi-row invariants.`,
            r`CREATE TABLE t (qty INT CHECK (qty > 0));
INSERT INTO t VALUES (NULL);                      -- passes
CREATE TABLE bad (id INT, CHECK (id IN (SELECT id FROM t)));

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 3815 (HY000): An expression of a check constraint 'bad_chk_1' contains disallowed function.`],
        [`CHECK has a small per-row CPU cost and no index effect. Adding it to a big table scans the table to validate existing rows, so test the count of violators first and schedule the change.`,
            r`SELECT COUNT(*) AS violators FROM bookings WHERE NOT (end_d > start_d);
SET SESSION lock_wait_timeout = 5;
ALTER TABLE bookings ADD CONSTRAINT chk_total CHECK (guests <= 10), ALGORITHM=INPLACE, LOCK=NONE;

-- OUTPUT:
-- violators
-- 0`],
        [`Real-world: state machines. A CHECK keeps status and timestamps consistent, for example a shipped order must have a ship date.`,
            r`CREATE TABLE shipments (id BIGINT PRIMARY KEY AUTO_INCREMENT, status ENUM('NEW','SHIPPED','DELIVERED') NOT NULL, shipped_at DATETIME NULL, delivered_at DATETIME NULL,
  CHECK ((status = 'NEW' AND shipped_at IS NULL) OR (status <> 'NEW' AND shipped_at IS NOT NULL)),
  CHECK (delivered_at IS NULL OR delivered_at >= shipped_at));
INSERT INTO shipments (status, shipped_at) VALUES ('SHIPPED', NULL);

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'shipments_chk_1' is violated.`]
    ),

    'INSERT': dv(
        [`An INSERT parses and validates the row, checks constraints and foreign keys, writes a new record into the clustered index (and each secondary index, or the change buffer), and logs it to the redo and binary logs. A multi-row INSERT is a single statement with one parse and far less per-row overhead.`,
            r`CREATE TABLE items (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(30) NOT NULL, qty INT NOT NULL DEFAULT 0);
INSERT INTO items (name, qty) VALUES ('pen', 10), ('book', 5), ('bag', 2);
SELECT ROW_COUNT() AS inserted, LAST_INSERT_ID() AS first_id;

-- OUTPUT:
-- inserted | first_id
--        3 |        1       (LAST_INSERT_ID returns the first id of a multi-row insert)`],
        [`Forms: <code>VALUES</code>, <code>SET col=...</code>, <code>INSERT ... SELECT</code>, <code>INSERT IGNORE</code>, <code>ON DUPLICATE KEY UPDATE</code>, <code>REPLACE</code> and <code>LOAD DATA</code>. Always name the columns.`,
            r`INSERT INTO items SET name = 'cap', qty = 1;
INSERT INTO items_archive (name, qty) SELECT name, qty FROM items WHERE qty < 3;
INSERT INTO items (id, name, qty) VALUES (1, 'pen', 5) ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty);
SELECT name, qty FROM items WHERE id = 1;

-- OUTPUT:
-- name | qty
-- pen  |  15`],
        [`Mistakes: omitting the column list (breaks when the table changes), one INSERT per row in a loop (slow), REPLACE where an upsert is intended (it deletes and reinserts, firing cascades), and swallowing errors with IGNORE.`,
            r`INSERT INTO items VALUES (NULL, 'x', 1, 99);           -- wrong column count
INSERT INTO items (name, qty) VALUES ('y');            -- value count mismatch

-- OUTPUT:
-- ERROR 1136 (21S01): Column count doesn't match value count at row 1
-- ERROR 1136 (21S01): Column count doesn't match value count at row 1`],
        [`Bulk loading: batch hundreds of rows per statement, wrap batches in one transaction, and for very large loads use LOAD DATA or the shell loader. In Java set <code>rewriteBatchedStatements=true</code>.`,
            r`-- 100k rows: one by one ~ 90 s, 1000-row batches ~ 6 s, LOAD DATA ~ 2 s
LOAD DATA LOCAL INFILE '/tmp/items.csv' INTO TABLE items FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES (name, qty);

-- OUTPUT:
-- Query OK, 100000 rows affected (1.9 sec)  Records: 100000  Deleted: 0  Skipped: 0  Warnings: 0`],
        [`Real-world: idempotent ingest from a queue. Use a natural unique key so redelivered messages do not create duplicates.`,
            r`INSERT INTO events (event_id, user_id, kind, payload)
VALUES ('evt-81723', 7, 'login', JSON_OBJECT('ip', '10.0.0.5'))
ON DUPLICATE KEY UPDATE event_id = event_id;      -- no-op on duplicate delivery

-- OUTPUT:
-- Query OK, 1 row affected   (0 rows affected if the event was already stored)`]
    ),

    'SELECT Basics': dv(
        [`The server chooses an access path (primary key lookup, index range, full scan) from table statistics, reads rows through the storage engine, filters, projects the requested columns, and streams results to the client. The SELECT list determines whether an index alone can answer the query.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(30), dept INT, salary INT, KEY idx_dept_salary (dept, salary));
EXPLAIN SELECT dept, salary FROM emp WHERE dept = 10;
EXPLAIN SELECT * FROM emp WHERE dept = 10;

-- OUTPUT: (example)
-- first : type=ref key=idx_dept_salary Extra=Using index       (covering: no table access)
-- second: type=ref key=idx_dept_salary Extra=NULL              (needs the clustered row for name)`],
        [`You can select columns, expressions, aliases, constants, and use functions. Table and column aliases make joins readable. SELECT without FROM evaluates expressions.`,
            r`SELECT 1 + 1 AS two, NOW() AS ts, 'text' AS label;
SELECT e.name AS employee, e.salary * 12 AS yearly, UPPER(LEFT(e.name, 3)) AS code FROM emp e ORDER BY yearly DESC LIMIT 3;

-- OUTPUT:
-- two | ts                  | label
--   2 | 2026-05-01 10:00:00 | text`],
        [`Mistakes: <code>SELECT *</code> in application code, forgetting that column order can change, using ORDER BY positions, and relying on unspecified row order. List columns and order explicitly.`,
            r`SELECT * FROM emp;                                       -- breaks silently if a column is added or reordered
SELECT id, name, dept FROM emp ORDER BY id;                -- explicit, stable contract

-- OUTPUT:
-- id | name | dept
--  1 | Asha |   10`],
        [`Select only needed columns and rows. Narrow projections enable covering indexes and cut network and memory. Compare the data volume returned.`,
            r`SELECT COUNT(*) AS rows_n, ROUND(SUM(LENGTH(body))/1048576) AS body_mb FROM articles;
SELECT id, title FROM articles ORDER BY id DESC LIMIT 20;

-- OUTPUT: (example)
-- rows_n | body_mb
-- 120000 |    8400     (SELECT * would transfer 8.4 GB; the narrow query returns kilobytes)`],
        [`Real-world: a list endpoint selects exactly the fields the screen needs, with a stable order and a limit, backed by one index.`,
            r`SELECT id, name, price FROM products WHERE category_id = 5 AND active = 1 ORDER BY price, id LIMIT 24;
ALTER TABLE products ADD INDEX idx_cat_active_price (category_id, active, price, id);

-- OUTPUT:
-- id | name | price
--  7 | Pen  | 10.00`]
    ),

    'UPDATE': dv(
        [`UPDATE locates rows (ideally through an index), takes exclusive row locks, writes the old version to the undo log, changes the clustered record in place (or delete-marks and inserts if the key changes), updates affected secondary indexes, and logs to redo and binlog. The number of rows scanned, not just changed, decides the lock footprint.`,
            r`CREATE TABLE stock (sku VARCHAR(10) PRIMARY KEY, qty INT NOT NULL, price DECIMAL(8,2));
INSERT INTO stock VALUES ('A1', 10, 5.00), ('B2', 4, 9.00);
UPDATE stock SET qty = qty - 1 WHERE sku = 'A1';
SELECT ROW_COUNT() AS changed;
SELECT sku, qty FROM stock;

-- OUTPUT:
-- changed
-- 1
-- sku | qty
-- A1  |   9
-- B2  |   4`],
        [`Forms: several columns, expressions, <code>ORDER BY ... LIMIT</code> (batching), multi-table UPDATE with JOIN, and <code>CASE</code> for conditional values. Note that MySQL evaluates SET assignments left to right.`,
            r`UPDATE stock SET price = price * 1.10, qty = qty + 5 WHERE qty < 5;
UPDATE stock s JOIN price_changes c ON c.sku = s.sku SET s.price = c.new_price;
UPDATE stock SET price = CASE WHEN qty > 100 THEN price * 0.9 WHEN qty > 20 THEN price * 0.95 ELSE price END;
UPDATE logs SET archived = 1 WHERE archived = 0 ORDER BY id LIMIT 1000;

-- OUTPUT:
-- Query OK, 1 row affected   Rows matched: 1  Changed: 1  Warnings: 0`],
        [`Mistakes: no WHERE, an unindexed WHERE that locks many rows, and read-modify-write in application code (lost updates). Use safe-updates in development, atomic expressions and conditional updates.`,
            r`UPDATE stock SET qty = 0;                                   -- every row!
UPDATE stock SET qty = qty - 1 WHERE sku = 'B2' AND qty > 0;  -- atomic and safe
SELECT ROW_COUNT();                                           -- 0 means "sold out"

-- OUTPUT:
-- Query OK, 2 rows affected   (the first statement: all rows changed)
-- ROW_COUNT()
-- 1`],
        [`Update in batches by primary key range for big tables, commit each batch, and pause when replicas lag. Check the plan of the UPDATE's WHERE with EXPLAIN.`,
            r`EXPLAIN UPDATE orders SET status = 'ARCHIVED' WHERE created_at < '2024-01-01';
UPDATE orders SET status = 'ARCHIVED' WHERE id BETWEEN 1 AND 10000 AND created_at < '2024-01-01';

-- OUTPUT: (example)
-- type  | key        | rows
-- range | idx_created| 420000      (batch it)
-- Query OK, 10000 rows affected`],
        [`Real-world optimistic locking: users edit a record for minutes, so check a version in the UPDATE and tell the user if someone else saved first.`,
            r`UPDATE documents SET body = 'new text', version = version + 1 WHERE id = 7 AND version = 3;
SELECT ROW_COUNT() AS saved;

-- OUTPUT:
-- saved
-- 0           (somebody else changed it: reload and merge)`]
    ),

    'DELETE': dv(
        [`DELETE finds rows, takes exclusive locks, writes each old row to the undo log, marks the clustered record delete-marked and does the same in secondary indexes; a purge thread removes them physically later once no snapshot can see them. That is why a big delete is slow and space is not returned immediately.`,
            r`CREATE TABLE sessions (id INT PRIMARY KEY, user_id INT, expires_at DATETIME, KEY idx_exp (expires_at));
INSERT INTO sessions VALUES (1,7,'2026-01-01'),(2,7,'2026-12-31');
DELETE FROM sessions WHERE expires_at < NOW();
SELECT ROW_COUNT();
SELECT id FROM sessions;

-- OUTPUT:
-- ROW_COUNT()
-- 1
-- id
-- 2`],
        [`Forms: with WHERE, with ORDER BY and LIMIT (batching), multi-table DELETE with JOIN, and soft delete via UPDATE. TRUNCATE empties a table quickly but is DDL.`,
            r`DELETE FROM sessions WHERE user_id = 7 ORDER BY id LIMIT 500;
DELETE s FROM sessions s JOIN users u ON u.id = s.user_id WHERE u.status = 'BLOCKED';
UPDATE users SET deleted_at = NOW() WHERE id = 7;       -- soft delete

-- OUTPUT:
-- Query OK, 1 row affected`],
        [`Mistakes: DELETE without WHERE, deleting through an unindexed column (locks and scans everything), one giant delete that bloats undo and lags replicas, and expecting disk space to drop. Preview with SELECT, delete in batches, and rebuild only if needed.`,
            r`SELECT COUNT(*) FROM events WHERE created_at < '2024-01-01';
DELETE FROM events WHERE created_at < '2024-01-01' LIMIT 5000;     -- loop until ROW_COUNT() = 0
OPTIMIZE TABLE events;                                             -- reclaim space only when really needed

-- OUTPUT:
-- COUNT(*)
-- 48200000`],
        [`Partition by time to remove old data instantly: dropping a partition removes the files without per-row work. It is the right tool for retention on log and event tables.`,
            r`ALTER TABLE events DROP PARTITION p202401;
SELECT partition_name, table_rows FROM information_schema.partitions WHERE table_name = 'events' ORDER BY partition_ordinal_position LIMIT 2;

-- OUTPUT:
-- Query OK, 0 rows affected  (48 million rows gone instantly)`],
        [`Real-world retention job: purge in small batches with a pause, so production traffic and replicas stay healthy, and log how many rows were removed.`,
            r`DELIMITER //
CREATE PROCEDURE purge_events()
BEGIN
  DECLARE n INT DEFAULT 1;
  WHILE n > 0 DO
    DELETE FROM events WHERE created_at < NOW() - INTERVAL 90 DAY LIMIT 2000;
    SET n = ROW_COUNT();
    DO SLEEP(0.2);
  END WHILE;
END //
DELIMITER ;
CALL purge_events();

-- OUTPUT:
-- Query OK, 0 rows affected`]
    )
};
