// Modules 4-6 (Data Types, Constraints, CRUD) extras.
import { x, r, type Extra } from './extra';

export const e03: Record<string, Extra> = {
    'Numeric Types: INT, BIGINT, SMALLINT & TINYINT': x(
        ['Integer types differ in size: TINYINT 1 byte, SMALLINT 2, INT 4, BIGINT 8.',
            'INT holds about -2.1 billion to 2.1 billion; UNSIGNED doubles the positive range to about 4.29 billion.',
            'Use the smallest type that safely fits the data.'],
        ['<code>INT(11)</code> does not mean 11 digits; the number is only a display width hint (deprecated in 8.0).',
            'Out-of-range values error in strict mode and are clamped silently otherwise.',
            'Use BIGINT for ids that may exceed 2 billion rows or for counters and money in minor units.'],
        ['Primary-key size is copied into every secondary index, so INT vs BIGINT affects index size and cache efficiency.',
            'Plan id exhaustion: monitor <code>AUTO_INCREMENT</code> against the type maximum.',
            'BOOLEAN is just TINYINT(1); do not store status codes there if more than two values are possible.'],
        [['F', 'How many bytes is INT?', '4 bytes; range -2,147,483,648 to 2,147,483,647 (signed).'],
            ['F', 'What does UNSIGNED do?', 'Disallows negative numbers and doubles the maximum positive value.'],
            ['M', 'What does INT(11) mean?', 'Only a display width (used with ZEROFILL); it does not change storage or range.'],
            ['M', 'When use BIGINT?', 'For large ids, counters, timestamps in milliseconds or amounts in smallest currency units.'],
            ['S', 'How do you detect id exhaustion early?', 'Alert when AUTO_INCREMENT exceeds about 70% of the type maximum and plan an online migration to BIGINT.'],
            ['S', 'Effect of PK type on performance?', 'Each secondary index entry stores the PK; larger PK means larger indexes, fewer entries per page and more I/O.']],
        [['Show range behaviour of TINYINT.',
            r`CREATE TABLE n (a TINYINT, b TINYINT UNSIGNED);
INSERT INTO n VALUES (127, 255);
INSERT INTO n VALUES (128, 0);

-- OUTPUT:
-- ERROR 1264 (22003): Out of range value for column 'a' at row 1`],
            ['Find the storage size of each integer type through arithmetic of the range.',
                r`SELECT 2147483647 AS int_max, 9223372036854775807 AS bigint_max;

-- OUTPUT:
-- int_max    | bigint_max
-- 2147483647 | 9223372036854775807`]],
        [['Integer division and modulo.',
            r`SELECT 7 DIV 2 AS int_div, 7 / 2 AS real_div, 7 MOD 2 AS remainder;

-- OUTPUT:
-- int_div | real_div | remainder
--       3 |   3.5000 |         1`],
            ['Check how close an id is to its limit.',
                r`SELECT AUTO_INCREMENT, ROUND(AUTO_INCREMENT/2147483647*100,2) AS pct_used
FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='employees';

-- OUTPUT:
-- AUTO_INCREMENT | pct_used
--              2 |     0.00`]]
    ),

    'DECIMAL, FLOAT & DOUBLE': x(
        ['DECIMAL(10,2) is exact and ideal for money. FLOAT and DOUBLE are approximate binary numbers for science and measurements.',
            'DECIMAL(p,s): p total digits, s digits after the decimal point.',
            'Never store money in FLOAT or DOUBLE.'],
        ['Floating-point cannot represent 0.1 exactly, so sums drift and equality tests fail.',
            'DECIMAL arithmetic is exact but slower and uses more bytes (about 4 bytes per 9 digits).',
            'Choose scale from the business: 2 for currency, 4 for FX rates, more for crypto.'],
        ['Round at defined points and store with extra precision when you must aggregate (fees on millions of rows).',
            'Alternative: store integers in minor units (paise/cents) to avoid decimals entirely.',
            'Be careful with division and averages: result scale follows <code>div_precision_increment</code>.'],
        [['F', 'Which type for money?', 'DECIMAL, because it is exact.'],
            ['F', 'What does DECIMAL(10,2) mean?', 'Up to 10 digits in total with 2 after the decimal point, so maximum 99999999.99.'],
            ['M', 'Why does 0.1 + 0.2 differ from 0.3 in FLOAT?', 'Binary floating point cannot represent these decimals exactly, producing tiny errors.'],
            ['M', 'FLOAT vs DOUBLE?', 'FLOAT is 4 bytes single precision (about 7 digits); DOUBLE is 8 bytes (about 15 digits).'],
            ['S', 'How do you avoid rounding drift in financial totals?', 'Use DECIMAL or integer minor units, round once at the defined boundary, and reconcile totals.'],
            ['S', 'Integer minor units or DECIMAL?', 'Integers are fast and unambiguous but need conversion and currency scale handling; DECIMAL is clearer. Either is fine if consistent.']],
        [['Show the floating-point error.',
            r`SELECT 0.1 + 0.2 = 0.3 AS decimal_eq, CAST(0.1 AS DOUBLE) + CAST(0.2 AS DOUBLE) = CAST(0.3 AS DOUBLE) AS double_eq;

-- OUTPUT:
-- decimal_eq | double_eq
--          1 |         0`],
            ['DECIMAL rounds on insert.',
                r`CREATE TABLE m (amt DECIMAL(6,2));
INSERT INTO m VALUES (12.345);
SELECT amt FROM m;

-- OUTPUT:
-- amt
-- 12.35`]],
        [['Sum 1000 times 0.1 with each type.',
            r`SELECT SUM(0.1) AS exact FROM (SELECT 1 FROM information_schema.columns LIMIT 10) t;

-- OUTPUT:
-- exact
-- 1.0`],
            ['Overflow is an error.',
                r`INSERT INTO m VALUES (99999.99);

-- OUTPUT:
-- ERROR 1264 (22003): Out of range value for column 'amt' at row 1`]]
    ),

    'CHAR & VARCHAR': x(
        ['CHAR(n) is fixed length (padded); VARCHAR(n) is variable length and stores only what is needed plus 1-2 bytes of length.',
            'Use CHAR for fixed codes (country code, hash) and VARCHAR for names and emails.',
            'n counts characters, not bytes.'],
        ['With utf8mb4 a character can take up to 4 bytes, so VARCHAR(255) may need up to 1020 bytes in an index.',
            'CHAR trims trailing spaces on read; VARCHAR keeps them.',
            'Do not over-allocate; VARCHAR(255) vs VARCHAR(50) matters for temporary tables and memory (sized to the maximum).'],
        ['Index key length limit is 3072 bytes (InnoDB DYNAMIC); long strings need prefix indexes or hashed columns.',
            'Collation decides comparison: ci collations treat "A" and "a" equal, which affects UNIQUE and lookups.',
            'Row size limit is 65,535 bytes across columns; many large VARCHARs may force TEXT.'],
        [['F', 'Difference between CHAR and VARCHAR?', 'CHAR is fixed length padded with spaces; VARCHAR stores variable length.'],
            ['F', 'When use CHAR?', 'For values with a constant length like country codes or fixed-length hashes.'],
            ['M', 'Does VARCHAR(50) mean 50 bytes?', 'No, 50 characters; bytes depend on the charset (up to 4 per character in utf8mb4).'],
            ['M', 'Why can long VARCHAR indexes fail?', 'Exceeding the index key limit (3072 bytes); use a prefix index or hash.'],
            ['S', 'How does VARCHAR size affect memory?', 'Temporary tables and sorts use the declared maximum, so oversized columns waste memory.'],
            ['S', 'How to enforce case-insensitive unique emails?', 'Use a ci collation (default utf8mb4_0900_ai_ci) or store a lowercase normalized value with a UNIQUE index.']],
        [['Compare trailing space handling.',
            r`CREATE TABLE s (c CHAR(5), v VARCHAR(5));
INSERT INTO s VALUES ('ab  ', 'ab  ');
SELECT LENGTH(c), LENGTH(v) FROM s;

-- OUTPUT:
-- LENGTH(c) | LENGTH(v)
--         2 |         4`],
            ['Character count vs byte count.',
                r`SELECT CHAR_LENGTH('हिन्दी') AS chars, LENGTH('हिन्दी') AS bytes;

-- OUTPUT:
-- chars | bytes
--     6 |    18`]],
        [['Too long value is rejected in strict mode.',
            r`INSERT INTO s (v) VALUES ('toolong');

-- OUTPUT:
-- ERROR 1406 (22001): Data too long for column 'v' at row 1`],
            ['Case-insensitive comparison.',
                r`SELECT 'Abaji' = 'abaji' AS ci_equal, 'Abaji' COLLATE utf8mb4_bin = 'abaji' AS bin_equal;

-- OUTPUT:
-- ci_equal | bin_equal
--        1 |         0`]]
    ),

    'TEXT, MEDIUMTEXT & LONGTEXT': x(
        ['TEXT types store long strings: TEXT up to 64 KB, MEDIUMTEXT 16 MB, LONGTEXT 4 GB.',
            'Use them for descriptions, articles and logs; use VARCHAR for short bounded values.',
            'TEXT columns cannot have a DEFAULT value (before 8.0.13) and cannot be fully indexed.'],
        ['Large values can be stored off-page, so reading them costs extra I/O; avoid <code>SELECT *</code> on tables with TEXT.',
            'Index only a prefix: <code>INDEX (body(100))</code>, or use FULLTEXT for searching.',
            'Sorting or grouping by TEXT uses on-disk temp tables.'],
        ['Consider storing large documents in object storage (S3) and keeping only a URL and metadata in MySQL.',
            'Keep TEXT in a separate one-to-one table if it is rarely read, keeping the hot table compact.',
            'Watch <code>max_allowed_packet</code> when inserting big values.'],
        [['F', 'Sizes of TEXT, MEDIUMTEXT and LONGTEXT?', '64 KB, 16 MB and 4 GB.'],
            ['F', 'TEXT or VARCHAR for a comment field?', 'VARCHAR if bounded (like 500 characters); TEXT if it can be long.'],
            ['M', 'Why avoid SELECT * with TEXT columns?', 'Large values are fetched too, increasing I/O, memory and network.'],
            ['M', 'How do you index a TEXT column?', 'Prefix index <code>(col(100))</code> or FULLTEXT index.'],
            ['S', 'Where should big documents live?', 'Object storage with a pointer in the database; the database handles metadata and queries.'],
            ['S', 'What problem does max_allowed_packet cause?', 'Inserts or result rows larger than the limit fail with "packet too large"; raise it on both client and server consciously.']],
        [['Create a table with TEXT and a prefix index.',
            r`CREATE TABLE articles (id INT PRIMARY KEY, title VARCHAR(100), body TEXT, INDEX idx_body (body(50)));
INSERT INTO articles VALUES (1,'Intro','MySQL is a relational database...');
SELECT id, title, LENGTH(body) AS bytes FROM articles;

-- OUTPUT:
-- id | title | bytes
--  1 | Intro |    34`],
            ['Show the limit of max_allowed_packet.',
                r`SELECT @@max_allowed_packet / 1024 / 1024 AS mb;

-- OUTPUT: (example)
-- mb
-- 64.0000`]],
        [['Select only needed columns, not the body.',
            r`SELECT id, title FROM articles WHERE id = 1;

-- OUTPUT:
-- id | title
--  1 | Intro`],
            ['Fulltext search over TEXT.',
                r`ALTER TABLE articles ADD FULLTEXT ft_body (body);
SELECT id FROM articles WHERE MATCH(body) AGAINST ('relational');

-- OUTPUT:
-- id
-- 1`]]
    ),

    'DATE, TIME & YEAR': x(
        ['DATE stores a calendar date (YYYY-MM-DD), TIME stores a time (HH:MM:SS) and YEAR stores a 4-digit year.',
            'Use <code>CURDATE()</code> and <code>CURTIME()</code> for the current values.',
            'Always store dates in date types, never as strings.'],
        ['DATE uses 3 bytes, range 1000-01-01 to 9999-12-31.',
            'Extract parts with <code>YEAR()</code>, <code>MONTH()</code>, <code>DAY()</code>; format with <code>DATE_FORMAT()</code>.',
            'TIME can be negative or exceed 24 hours, so it also works for durations.'],
        ['Avoid wrapping an indexed date column in a function in WHERE (<code>WHERE YEAR(d)=2026</code>); use a range (<code>d &gt;= ... AND d &lt; ...</code>).',
            'Zero dates (0000-00-00) are rejected in strict mode; do not rely on them.',
            'Birthdates and business dates are time-zone free, so use DATE, not a timestamp.'],
        [['F', 'Which type stores only a date?', 'DATE.'],
            ['F', 'Default date format in MySQL?', 'YYYY-MM-DD.'],
            ['M', 'Why not use WHERE YEAR(order_date)=2026?', 'The function on the column prevents index use; filter by range <code>order_date &gt;= "2026-01-01" AND order_date &lt; "2027-01-01"</code>.'],
            ['M', 'Can TIME exceed 24 hours?', 'Yes, from -838:59:59 to 838:59:59, so it can store durations.'],
            ['S', 'Why use DATE for birthdates rather than TIMESTAMP?', 'A birthday is a calendar date with no time zone; timestamps would shift across zones.'],
            ['S', 'How do you avoid timezone bugs with date-only data?', 'Store DATE, convert only at the display edge, and keep server and session time zones explicit.']],
        [['Insert and format dates.',
            r`CREATE TABLE ev (id INT, d DATE, t TIME);
INSERT INTO ev VALUES (1,'2026-03-15','14:30:00');
SELECT DATE_FORMAT(d,'%d-%b-%Y') AS fmt, HOUR(t) AS hr FROM ev;

-- OUTPUT:
-- fmt         | hr
-- 15-Mar-2026 | 14`],
            ['Rewrite a year filter to use an index.',
                r`SELECT COUNT(*) FROM ev WHERE d >= '2026-01-01' AND d < '2027-01-01';

-- OUTPUT:
-- COUNT(*)
-- 1`]],
        [['Day arithmetic.',
            r`SELECT DATE_ADD('2026-03-15', INTERVAL 30 DAY) AS plus30, DATEDIFF('2026-12-25','2026-03-15') AS days;

-- OUTPUT:
-- plus30     | days
-- 2026-04-14 |  285`],
            ['Invalid dates fail in strict mode.',
                r`INSERT INTO ev VALUES (2,'2026-02-30','10:00:00');

-- OUTPUT:
-- ERROR 1292 (22007): Incorrect date value: '2026-02-30' for column 'd' at row 1`]]
    ),

    'DATETIME vs TIMESTAMP': x(
        ['Both store date and time. TIMESTAMP is stored in UTC and converted to the session time zone; DATETIME is stored as typed.',
            'TIMESTAMP range is 1970 to 2038 (4 bytes); DATETIME is 1000 to 9999 (5-8 bytes).',
            '<code>DEFAULT CURRENT_TIMESTAMP</code> works for both in modern versions.'],
        ['TIMESTAMP changes its displayed value when the session time zone changes; DATETIME does not.',
            'Use DATETIME for fixed local business times (appointment at 10:00 local) and TIMESTAMP for event instants.',
            'Fractional seconds are available with <code>DATETIME(6)</code> / <code>TIMESTAMP(6)</code>.'],
        ['The 2038 limit is real for TIMESTAMP; long-lived data (contracts, leases) needs DATETIME or BIGINT.',
            'Standardize: store UTC and convert in the application; set server time zone to UTC and avoid mixed time zones in sessions.',
            'DST gaps/overlaps make local DATETIMEs ambiguous; store the zone name or UTC alongside.'],
        [['F', 'Difference between DATETIME and TIMESTAMP?', 'TIMESTAMP is UTC-based, auto-converted by time zone, limited to 1970-2038; DATETIME is time-zone neutral with a wide range.'],
            ['F', 'How do you set a default of now?', '<code>DEFAULT CURRENT_TIMESTAMP</code>.'],
            ['M', 'What happens to TIMESTAMP when time zone changes?', 'The same stored instant is displayed in the new zone, so the shown time changes.'],
            ['M', 'What is the year 2038 problem?', 'TIMESTAMP uses a signed 32-bit seconds counter that overflows on 2038-01-19.'],
            ['S', 'What is your standard for storing time?', 'Store instants in UTC (TIMESTAMP or DATETIME in UTC), convert at the edges, and keep a zone id for local-time business rules.'],
            ['S', 'How do you handle DST ambiguity?', 'Store UTC plus the IANA zone, or store local datetime with offset; do not store only an ambiguous local time.']],
        [['See the TIMESTAMP shift with the time zone.',
            r`CREATE TABLE tz (ts TIMESTAMP, dt DATETIME);
SET time_zone = '+00:00';
INSERT INTO tz VALUES ('2026-06-01 12:00:00','2026-06-01 12:00:00');
SET time_zone = '+05:30';
SELECT ts, dt FROM tz;

-- OUTPUT:
-- ts                  | dt
-- 2026-06-01 17:30:00 | 2026-06-01 12:00:00`],
            ['Out of range TIMESTAMP.',
                r`INSERT INTO tz (ts) VALUES ('2040-01-01 00:00:00');

-- OUTPUT:
-- ERROR 1292 (22007): Incorrect datetime value: '2040-01-01 00:00:00' for column 'ts' at row 1`]],
        [['Automatic created/updated columns.',
            r`CREATE TABLE audit (id INT PRIMARY KEY AUTO_INCREMENT,
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3));
INSERT INTO audit () VALUES ();
SELECT created_at = updated_at FROM audit;

-- OUTPUT:
-- created_at = updated_at
-- 1`],
            ['Convert between zones.',
                r`SELECT CONVERT_TZ('2026-06-01 12:00:00','+00:00','+05:30') AS ist;

-- OUTPUT:
-- ist
-- 2026-06-01 17:30:00`]]
    ),

    'BOOLEAN, JSON & Binary Types': x(
        ['BOOLEAN is an alias for TINYINT(1): 0 is false, non-zero is true. JSON stores JSON documents. BINARY, VARBINARY and BLOB hold raw bytes.',
            '<code>TRUE</code> and <code>FALSE</code> are just 1 and 0.',
            'Use BLOB for files or hashes only when needed; usually store files elsewhere.'],
        ['JSON values are validated and stored in an efficient binary format; query with <code>JSON_EXTRACT</code> or <code>-&gt;</code> / <code>-&gt;&gt;</code>.',
            'Use BINARY(16) for UUIDs (<code>UUID_TO_BIN()</code>) to save space versus CHAR(36).',
            'BLOB sorts and compares by bytes with no collation.'],
        ['JSON is for sparse, evolving attributes; stable, queried fields belong in real columns (use generated columns plus indexes if needed).',
            'BINARY(16) UUIDs with <code>swap_flag</code> improve insert locality for time-based UUIDs.',
            'Avoid BLOBs in hot tables: they bloat backups and replication; use object storage.'],
        [['F', 'How is BOOLEAN stored in MySQL?', 'As TINYINT(1); 0 = false, 1 = true.'],
            ['F', 'When use JSON?', 'For flexible, semi-structured attributes such as preferences or metadata.'],
            ['M', 'How do you read a JSON field?', '<code>SELECT data-&gt;&gt;"$.city" FROM t;</code> or <code>JSON_EXTRACT</code>.'],
            ['M', 'How to store UUIDs efficiently?', 'BINARY(16) with <code>UUID_TO_BIN(uuid, 1)</code> rather than CHAR(36).'],
            ['S', 'JSON column or normalized columns?', 'Normalize anything filtered, joined or constrained; use JSON for rarely queried extras. Index JSON via generated columns.'],
            ['S', 'Why keep BLOBs out of hot tables?', 'They increase row/page size and I/O, make backups and replication heavy; store files in object storage.']],
        [['BOOLEAN behaviour.',
            r`CREATE TABLE flags (id INT, active BOOLEAN);
INSERT INTO flags VALUES (1, TRUE), (2, FALSE), (3, 5);
SELECT id, active, active IS TRUE AS is_true FROM flags;

-- OUTPUT:
-- id | active | is_true
--  1 |      1 |       1
--  2 |      0 |       0
--  3 |      5 |       1`],
            ['Store and read JSON.',
                r`CREATE TABLE prefs (id INT PRIMARY KEY, data JSON);
INSERT INTO prefs VALUES (1, '{"theme":"dark","langs":["en","hi"]}');
SELECT data->>'$.theme' AS theme, JSON_LENGTH(data->'$.langs') AS n FROM prefs;

-- OUTPUT:
-- theme | n
-- dark  | 2`]],
        [['UUID as BINARY(16).',
            r`CREATE TABLE u (id BINARY(16) PRIMARY KEY, name VARCHAR(20));
INSERT INTO u VALUES (UUID_TO_BIN('3f06af63-a93c-11e4-9797-00505690773f', 1), 'x');
SELECT BIN_TO_UUID(id, 1) FROM u;

-- OUTPUT:
-- BIN_TO_UUID(id, 1)
-- 3f06af63-a93c-11e4-9797-00505690773f`],
            ['Invalid JSON is rejected.',
                r`INSERT INTO prefs VALUES (2, '{bad json}');

-- OUTPUT:
-- ERROR 3140 (22032): Invalid JSON text: "Missing a name for object member." at position 1`]]
    ),

    'Storage Size, Range & Type Performance': x(
        ['Every type has a storage size and a range; smaller types use less disk and memory, so queries are faster.',
            'Examples: TINYINT 1 byte, INT 4, BIGINT 8, DATE 3, DATETIME 5+, VARCHAR(n) length + 1-2 bytes.',
            'Choose the type from real data limits, not "just in case".'],
        ['Smaller rows mean more rows per 16 KB page, fewer I/Os and better cache hit ratio; indexes shrink similarly.',
            'Use ENUM or a lookup table for small fixed sets; use INT UNSIGNED for IPv4 (<code>INET_ATON</code>).',
            'Avoid mixing types in join/where comparisons (INT vs VARCHAR), which can prevent index use.'],
        ['Estimate size: rows x row width x (1 + index overhead); capacity plan with real numbers.',
            'NULL columns cost a bit in the row header bitmap; many nullable columns hint at design issues.',
            'Measure with <code>information_schema.tables</code> (data_length, index_length) rather than guessing.'],
        [['F', 'Why does data type size matter?', 'Smaller types save disk and memory, making scans, joins and indexes faster.'],
            ['F', 'Which is smaller, INT or BIGINT?', 'INT (4 bytes vs 8).'],
            ['M', 'How do you store IPv4 efficiently?', 'INT UNSIGNED with <code>INET_ATON()</code> / <code>INET_NTOA()</code>.'],
            ['M', 'What happens when you compare VARCHAR column with a number?', 'MySQL converts types, often making the index unusable and sometimes matching unexpected rows.'],
            ['S', 'How do you estimate table size before launch?', 'Row width x expected rows plus index sizes and growth, validated with a prototype filled with realistic data.'],
            ['S', 'Which type choices are hardest to change later?', 'Primary-key type, charset/collation and decimal precision; changing them rebuilds tables and cascades into FKs and indexes.']],
        [['Check table and index size.',
            r`SELECT table_name, ROUND(data_length/1024/1024,2) AS data_mb, ROUND(index_length/1024/1024,2) AS idx_mb
FROM information_schema.tables WHERE table_schema = DATABASE();

-- OUTPUT: (example)
-- table_name | data_mb | idx_mb
-- employees  |    0.02 |   0.00`],
            ['IPv4 as integer.',
                r`SELECT INET_ATON('192.168.1.10') AS n, INET_NTOA(3232235786) AS ip;

-- OUTPUT:
-- n          | ip
-- 3232235786 | 192.168.1.10`]],
        [['Implicit conversion hides an index.',
            r`EXPLAIN SELECT * FROM users WHERE phone = 9876543210;   -- phone is VARCHAR

-- OUTPUT: (example)
-- type | key  | Extra
-- ALL  | NULL | Using where   (index on phone not used)`],
            ['Fix by matching types.',
                r`EXPLAIN SELECT * FROM users WHERE phone = '9876543210';

-- OUTPUT: (example)
-- type | key       | Extra
-- ref  | idx_phone | NULL`]]
    ),

    'PRIMARY KEY Constraint': x(
        ['A PRIMARY KEY uniquely identifies each row; it cannot be NULL or duplicated. A table has only one.',
            'Define inline (<code>id INT PRIMARY KEY</code>) or at the end (<code>PRIMARY KEY (id)</code>), composite as <code>PRIMARY KEY (a,b)</code>.',
            'Combine with <code>AUTO_INCREMENT</code> for automatic ids.'],
        ['In InnoDB the primary key is the clustered index: rows are physically organised by it.',
            'If you define none, InnoDB uses the first NOT NULL unique index or a hidden 6-byte row id.',
            'Never update primary key values; it rewrites rows and every child reference.'],
        ['Random PKs (UUIDv4) fragment the clustered index; prefer monotonically increasing keys.',
            'Hidden row id has a contention point under heavy inserts; explicit PKs are better and necessary for row-based replication efficiency.',
            'Gaps in AUTO_INCREMENT are normal; do not use it for gap-free numbering such as invoice numbers.'],
        [['F', 'What is a primary key?', 'A column or set of columns uniquely identifying each row; not null and unique.'],
            ['F', 'Can a table have more than one primary key?', 'No, only one (which may be composite).'],
            ['M', 'What is a clustered index?', 'In InnoDB the primary key index that stores the actual row data in key order.'],
            ['M', 'What if a table has no primary key?', 'InnoDB picks a unique NOT NULL index or generates a hidden row id, but this is poor for replication, tools and ORMs.'],
            ['S', 'Why are random UUID primary keys slow?', 'Inserts land at random pages, causing page splits, fragmentation and poor cache locality; use ordered ids or UUIDv7/ULID.'],
            ['S', 'How do you generate gap-free invoice numbers?', 'Not with AUTO_INCREMENT; use a counter table with SELECT ... FOR UPDATE inside the same transaction.']],
        [['Define a composite primary key and demonstrate uniqueness.',
            r`CREATE TABLE seats (hall INT, seat INT, PRIMARY KEY (hall, seat));
INSERT INTO seats VALUES (1,1),(1,2),(2,1);
INSERT INTO seats VALUES (1,1);

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-1' for key 'seats.PRIMARY'`],
            ['Primary key cannot be NULL.',
                r`CREATE TABLE p (id INT PRIMARY KEY);
INSERT INTO p VALUES (NULL);

-- OUTPUT:
-- ERROR 1048 (23000): Column 'id' cannot be null`]],
        [['AUTO_INCREMENT gaps after rollback.',
            r`CREATE TABLE g (id INT PRIMARY KEY AUTO_INCREMENT, v INT);
START TRANSACTION; INSERT INTO g (v) VALUES (1); ROLLBACK;
INSERT INTO g (v) VALUES (2);
SELECT id FROM g;

-- OUTPUT:
-- id
-- 2`],
            ['Gap-free counter with a lock.',
                r`START TRANSACTION;
SELECT next_no FROM counters WHERE name='invoice' FOR UPDATE;
UPDATE counters SET next_no = next_no + 1 WHERE name='invoice';
COMMIT;

-- OUTPUT:
-- next_no
-- 1001`]]
    ),

    'FOREIGN KEY Constraint': x(
        ['A FOREIGN KEY links a column in a child table to the primary (or unique) key of a parent table.',
            'It blocks orphans: a child cannot reference a non-existent parent.',
            'Syntax: <code>FOREIGN KEY (customer_id) REFERENCES customers(id)</code>.'],
        ['ON DELETE / ON UPDATE actions: RESTRICT/NO ACTION, CASCADE, SET NULL, SET DEFAULT (not supported in InnoDB).',
            'Both tables must be InnoDB and column types must match (including signedness and charset).',
            'MySQL creates an index on the FK column if none exists.'],
        ['FKs add locking: inserting a child takes a shared lock on the parent row; heavy parents can contend.',
            'Cascading deletes can be huge transactions; prefer soft deletes or batch deletion for large trees.',
            'In sharded or highly distributed designs FKs are often dropped; compensate with checks, reconciliation and good ownership boundaries.'],
        [['F', 'What is a foreign key?', 'A column referencing another table’s key to keep relationships valid.'],
            ['F', 'What does ON DELETE CASCADE do?', 'Deleting the parent also deletes its children.'],
            ['M', 'Why does an FK creation fail with error 1215?', 'Usually mismatched types, a missing index on the parent column, or a non-InnoDB table.'],
            ['M', 'ON DELETE SET NULL requirements?', 'The FK column must be nullable.'],
            ['S', 'How do foreign keys affect performance and locking?', 'Child inserts and parent updates/deletes check the other table and take locks; this can serialize hot parents and slow bulk loads.'],
            ['S', 'When do you drop foreign keys?', 'When sharding, doing very high-volume writes, or when online schema tools cannot handle them; replace with application checks and audits.']],
        [['Create FK with cascade and test.',
            r`CREATE TABLE dept (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE emp (id INT PRIMARY KEY, dept_id INT, FOREIGN KEY (dept_id) REFERENCES dept(id) ON DELETE CASCADE);
INSERT INTO dept VALUES (1,'HR'); INSERT INTO emp VALUES (1,1);
DELETE FROM dept WHERE id = 1;
SELECT COUNT(*) FROM emp;

-- OUTPUT:
-- COUNT(*)
-- 0`],
            ['Type mismatch error.',
                r`CREATE TABLE bad (id INT, d BIGINT, FOREIGN KEY (d) REFERENCES dept(id));

-- OUTPUT:
-- ERROR 3780 (HY000): Referencing column 'd' and referenced column 'id' in foreign key constraint are incompatible.`]],
        [['SET NULL option.',
            r`CREATE TABLE emp2 (id INT PRIMARY KEY, dept_id INT NULL, FOREIGN KEY (dept_id) REFERENCES dept(id) ON DELETE SET NULL);
INSERT INTO dept VALUES (2,'IT'); INSERT INTO emp2 VALUES (1,2);
DELETE FROM dept WHERE id = 2;
SELECT dept_id FROM emp2;

-- OUTPUT:
-- dept_id
-- NULL`],
            ['List the FKs on a table.',
                r`SELECT constraint_name, referenced_table_name FROM information_schema.key_column_usage
WHERE table_schema=DATABASE() AND table_name='emp2' AND referenced_table_name IS NOT NULL;

-- OUTPUT:
-- constraint_name | referenced_table_name
-- emp2_ibfk_1     | dept`]]
    ),

    'UNIQUE Constraint': x(
        ['UNIQUE forbids duplicate values in a column (or combination). A table can have several UNIQUE keys.',
            'Unlike PRIMARY KEY, UNIQUE allows NULL (and multiple NULLs).',
            'Typical: email, username, national id.'],
        ['MySQL creates a unique index behind the constraint; it speeds lookups by that column as well.',
            'Case-insensitive collations make "A@x.com" equal "a@x.com" for uniqueness.',
            'For INSERT of possibly existing rows use <code>INSERT ... ON DUPLICATE KEY UPDATE</code> or <code>INSERT IGNORE</code>.'],
        ['Concurrency: two sessions inserting the same value, one waits then fails with 1062; handle the error rather than check-then-insert.',
            'Unique across soft-deleted rows needs a design (generated column or composite with deleted flag).',
            'Long unique strings hit index length limits; use a hash column.'],
        [['F', 'What does UNIQUE do?', 'Prevents duplicate values in the column.'],
            ['F', 'Can a UNIQUE column have NULL?', 'Yes, and in MySQL multiple NULLs are allowed.'],
            ['M', 'How do you handle duplicate email on signup?', 'Catch error 1062 (or use ON DUPLICATE KEY) instead of select-then-insert, which is racy.'],
            ['M', 'What is INSERT IGNORE?', 'It skips rows that violate unique/PK constraints (and downgrades some errors to warnings).'],
            ['S', 'How do you enforce uniqueness across (tenant, email)?', 'A composite UNIQUE (tenant_id, email).'],
            ['S', 'Why is check-then-insert unsafe?', 'Two transactions can both see no row and both insert; only the unique constraint is atomic.']],
        [['Duplicate email attempt.',
            r`CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(80) NOT NULL UNIQUE);
INSERT INTO users (email) VALUES ('a@x.com');
INSERT INTO users (email) VALUES ('A@X.com');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'A@X.com' for key 'users.email'`],
            ['Upsert pattern.',
                r`INSERT INTO logins (user_id, cnt) VALUES (1,1) ON DUPLICATE KEY UPDATE cnt = cnt + 1;

-- OUTPUT:
-- Query OK, 2 rows affected   (existing row updated)`]],
        [['Composite unique per tenant.',
            r`CREATE TABLE members (tenant INT, email VARCHAR(80), UNIQUE KEY uq_tenant_email (tenant, email));
INSERT INTO members VALUES (1,'a@x.com'),(2,'a@x.com');
INSERT INTO members VALUES (1,'a@x.com');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-a@x.com' for key 'members.uq_tenant_email'`],
            ['Unique among active rows only.',
                r`ALTER TABLE users ADD COLUMN deleted_at DATETIME NULL,
  ADD COLUMN active_email VARCHAR(80) AS (IF(deleted_at IS NULL, email, NULL)) VIRTUAL,
  ADD UNIQUE KEY uq_active_email (active_email);

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'NOT NULL & DEFAULT': x(
        ['NOT NULL means a value is required. DEFAULT supplies a value when none is given.',
            'Example: <code>status VARCHAR(10) NOT NULL DEFAULT "ACTIVE"</code>.',
            'NULL means unknown or missing, which is different from 0 or an empty string.'],
        ['Prefer NOT NULL where the business requires a value: it enforces integrity and simplifies queries.',
            'Expressions can be defaults in 8.0.13+: <code>DEFAULT (UUID())</code>, <code>DEFAULT (CURRENT_DATE)</code>.',
            'In strict mode, omitting a NOT NULL column without default errors.'],
        ['Adding NOT NULL to a populated column needs a backfill; use a default or a staged migration.',
            'Defaults on large tables: adding a column with a constant default is metadata-only with INSTANT in 8.0.',
            'Nullable columns complicate unique indexes, joins and aggregates; model optionality explicitly.'],
        [['F', 'What does NOT NULL mean?', 'The column must have a value.'],
            ['F', 'What is DEFAULT?', 'A value automatically used when the insert gives none.'],
            ['M', 'Is NULL the same as empty string or 0?', 'No. NULL is unknown/missing; empty string and 0 are real values.'],
            ['M', 'Can DEFAULT be an expression?', 'Yes from MySQL 8.0.13, written in parentheses, e.g. <code>DEFAULT (CURDATE())</code>.'],
            ['S', 'How to add a NOT NULL column safely?', 'Add it nullable or with DEFAULT (INSTANT), backfill in batches, then set NOT NULL after validation.'],
            ['S', 'Why avoid nullable columns where possible?', 'NULL logic (three-valued) causes subtle bugs in comparisons, NOT IN and aggregates, and can complicate index usage.']],
        [['Defaults at work.',
            r`CREATE TABLE tasks (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(50) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'OPEN', created DATE DEFAULT (CURRENT_DATE));
INSERT INTO tasks (title) VALUES ('Write report');
SELECT title, status, created IS NOT NULL AS has_date FROM tasks;

-- OUTPUT:
-- title        | status | has_date
-- Write report | OPEN   |        1`],
            ['Missing required column.',
                r`INSERT INTO tasks (status) VALUES ('DONE');

-- OUTPUT:
-- ERROR 1364 (HY000): Field 'title' doesn't have a default value`]],
        [['NULL pitfalls: NOT IN with NULL.',
            r`SELECT 5 NOT IN (1, 2, NULL) AS result;

-- OUTPUT:
-- result
-- NULL`],
            ['Count ignores NULL.',
                r`SELECT COUNT(*) AS rows_n, COUNT(email) AS emails FROM (SELECT 'a' AS email UNION ALL SELECT NULL) t;

-- OUTPUT:
-- rows_n | emails
--      2 |      1`]]
    ),

    'CHECK Constraint': x(
        ['CHECK validates a condition on each row, for example <code>CHECK (age &gt;= 18)</code>.',
            'It is enforced in MySQL 8.0.16 and later.',
            'A row that makes the condition false is rejected; NULL (unknown) passes.'],
        ['Name them (<code>CONSTRAINT chk_age CHECK (...)</code>) and keep conditions deterministic: no subqueries or non-deterministic functions.',
            'Table-level checks can compare columns: <code>CHECK (end_date &gt;= start_date)</code>.',
            'Add with <code>ALTER TABLE ... ADD CONSTRAINT ... CHECK</code>; existing rows are validated.'],
        ['Because NULL passes CHECK, combine with NOT NULL when a value is required.',
            'Checks cannot reference other rows or tables; cross-row rules need transactions, locks or triggers.',
            'Changing a check on huge tables validates every row; do it in a quiet window.'],
        [['F', 'What does CHECK do?', 'Ensures column values satisfy a condition.'],
            ['F', 'Which version enforces CHECK?', 'MySQL 8.0.16 and later.'],
            ['M', 'Does a NULL value violate a CHECK?', 'No, the condition evaluates to UNKNOWN which is accepted.'],
            ['M', 'Can a CHECK use a subquery?', 'No; it must be deterministic and refer only to the row.'],
            ['S', 'How to enforce "total of items cannot exceed limit" across rows?', 'CHECK cannot; use a transaction with locking, a trigger or an application-level invariant with proper isolation.'],
            ['S', 'How do you add a CHECK to a huge table with bad data?', 'Clean/backfill first, or add as NOT ENFORCED then enable after cleanup, to avoid failing the DDL.']],
        [['Row-level checks.',
            r`CREATE TABLE bookings (id INT PRIMARY KEY, start_d DATE, end_d DATE,
  CONSTRAINT chk_dates CHECK (end_d >= start_d));
INSERT INTO bookings VALUES (1,'2026-05-10','2026-05-05');

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'chk_dates' is violated.`],
            ['NULL passes the check.',
                r`INSERT INTO bookings VALUES (2,'2026-05-10',NULL);
SELECT id FROM bookings;

-- OUTPUT:
-- id
-- 2`]],
        [['Add a constraint as NOT ENFORCED then enable.',
            r`ALTER TABLE bookings ADD CONSTRAINT chk_nonempty CHECK (start_d IS NOT NULL) NOT ENFORCED;
ALTER TABLE bookings ALTER CONSTRAINT chk_nonempty ENFORCED;

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['List check constraints.',
                r`SELECT constraint_name, check_clause FROM information_schema.check_constraints WHERE constraint_schema = DATABASE();

-- OUTPUT:
-- constraint_name | check_clause
-- chk_dates       | (end_d >= start_d)`]]
    ),

    'INSERT': x(
        ['<code>INSERT INTO t (cols) VALUES (...)</code> adds rows. Insert several at once with multiple value lists.',
            'Always list column names so the statement does not break when the table changes.',
            'Auto-increment ids are generated if omitted; read the last with <code>LAST_INSERT_ID()</code>.'],
        ['<code>INSERT ... SELECT</code> copies rows from a query; <code>INSERT IGNORE</code> skips errors; <code>ON DUPLICATE KEY UPDATE</code> upserts; <code>REPLACE</code> deletes then inserts.',
            'Batch inserts (hundreds of rows per statement) are much faster than one-by-one.',
            'Wrap related inserts in a transaction.'],
        ['Bulk load with <code>LOAD DATA INFILE</code> or the shell loader; disable unnecessary indexes only in controlled offline loads.',
            'REPLACE changes ids and triggers delete/insert side effects; prefer ON DUPLICATE KEY UPDATE.',
            'Watch <code>max_allowed_packet</code> and lock/undo growth for huge batches; chunk them.'],
        [['F', 'How do you insert a row?', '<code>INSERT INTO t (a,b) VALUES (1,"x");</code>'],
            ['F', 'How do you get the new auto id?', '<code>SELECT LAST_INSERT_ID();</code>'],
            ['M', 'Difference between INSERT IGNORE and ON DUPLICATE KEY UPDATE?', 'IGNORE silently skips conflicting rows; ON DUPLICATE KEY UPDATE updates the existing row instead.'],
            ['M', 'Why is REPLACE risky?', 'It deletes the old row and inserts a new one, which changes AUTO_INCREMENT values, fires delete triggers and cascades FK deletes.'],
            ['S', 'Fastest way to load millions of rows?', 'LOAD DATA / MySQL Shell loadDump, big transactions in chunks, minimal indexes during load, tuned redo log, and re-enabling constraints after.'],
            ['S', 'How do you make inserts idempotent?', 'A unique business key plus ON DUPLICATE KEY UPDATE (or INSERT IGNORE) so retries do not duplicate data.']],
        [['Multi-row insert and LAST_INSERT_ID.',
            r`CREATE TABLE items (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(20), qty INT);
INSERT INTO items (name, qty) VALUES ('pen',10),('book',5),('bag',2);
SELECT LAST_INSERT_ID();

-- OUTPUT:
-- LAST_INSERT_ID()
-- 1`],
            ['Insert from a select.',
                r`CREATE TABLE low_stock LIKE items;
INSERT INTO low_stock SELECT * FROM items WHERE qty < 6;
SELECT name FROM low_stock;

-- OUTPUT:
-- name
-- book
-- bag`]],
        [['Upsert.',
            r`ALTER TABLE items ADD UNIQUE (name);
INSERT INTO items (name, qty) VALUES ('pen', 3) ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty);
SELECT qty FROM items WHERE name = 'pen';

-- OUTPUT:
-- qty
-- 13`],
            ['INSERT IGNORE counts.',
                r`INSERT IGNORE INTO items (name, qty) VALUES ('pen', 99), ('cap', 1);

-- OUTPUT:
-- Query OK, 1 row affected, 1 warning`]]
    ),

    'SELECT Basics': x(
        ['<code>SELECT col1, col2 FROM table</code> reads data. <code>SELECT *</code> returns all columns.',
            'Use <code>AS</code> to give a column a readable alias.',
            'SELECT does not change data.'],
        ['List needed columns instead of <code>*</code>: less data, safer when the table changes, and allows covering indexes.',
            'Expressions are allowed: <code>SELECT price * qty AS total</code>.',
            'SELECT without FROM works for calculations: <code>SELECT 1+1</code>.'],
        ['Avoid <code>SELECT *</code> in application code and views; it couples code to table structure and prevents covering-index plans.',
            'Result ordering is undefined without ORDER BY.',
            'Check the plan with EXPLAIN when queries get slow; most issues are missing indexes or non-sargable predicates.'],
        [['F', 'How do you read all columns from a table?', '<code>SELECT * FROM table;</code>'],
            ['F', 'How do you rename a column in output?', 'With an alias: <code>SELECT name AS full_name</code>.'],
            ['M', 'Why avoid SELECT * in production code?', 'It fetches unneeded data, breaks when columns change and prevents index-only scans.'],
            ['M', 'Is the order of returned rows guaranteed?', 'Only when ORDER BY is used.'],
            ['S', 'What is a covering index and how does SELECT list affect it?', 'An index containing all columns the query needs; selecting only those columns avoids reading table rows.'],
            ['S', 'How do you find slow SELECTs?', 'Slow query log, Performance Schema digests and EXPLAIN ANALYZE.']],
        [['Select with expression and alias.',
            r`SELECT name, qty, qty * 10 AS value FROM items;

-- OUTPUT:
-- name | qty | value
-- pen  |  13 |   130
-- book |   5 |    50
-- bag  |   2 |    20`],
            ['SELECT without a table.',
                r`SELECT 2 * 3 AS product, NOW() IS NOT NULL AS has_time;

-- OUTPUT:
-- product | has_time
--       6 |        1`]],
        [['Distinct columns only.',
            r`SELECT name FROM items;

-- OUTPUT:
-- name
-- pen
-- book
-- bag
-- cap`],
            ['Index-only scan with a narrow SELECT.',
                r`EXPLAIN SELECT name FROM items;

-- OUTPUT: (example)
-- type  | key  | Extra
-- index | name | Using index`]]
    ),

    'UPDATE': x(
        ['<code>UPDATE t SET col = value WHERE condition</code> changes existing rows.',
            'Always include WHERE; without it every row is updated.',
            'Check the number of affected rows after running.'],
        ['Test with a SELECT using the same WHERE first, or run inside a transaction and verify before COMMIT.',
            'Update several columns: <code>SET a=1, b=2</code>. Use expressions: <code>SET qty = qty - 1</code>.',
            'Join updates: <code>UPDATE a JOIN b ON ... SET a.x = b.y</code>.'],
        ['Large updates should be batched (<code>LIMIT 1000</code> in a loop) to keep locks and undo small and replicas in sync.',
            'Optimistic locking: <code>UPDATE ... SET ..., version = version+1 WHERE id=? AND version=?</code> and check affected rows.',
            'Row-based replication logs full rows; huge updates can create enormous binlogs.'],
        [['F', 'What happens if you run UPDATE without WHERE?', 'All rows in the table are updated.'],
            ['F', 'How do you update two columns?', '<code>UPDATE t SET a=1, b=2 WHERE id=5;</code>'],
            ['M', 'How do you prevent accidental mass updates?', 'Safe-updates mode, transactions, reviewing with SELECT first, and restricted privileges.'],
            ['M', 'How do you update with data from another table?', 'Multi-table UPDATE with JOIN.'],
            ['S', 'How do you update millions of rows safely?', 'Loop in batches by primary key range, commit each batch, pause on replica lag and monitor locks.'],
            ['S', 'How does optimistic locking work with UPDATE?', 'Include the version in WHERE and increment it; zero affected rows means someone else changed the row.']],
        [['Update and verify affected rows.',
            r`UPDATE items SET qty = qty - 1 WHERE name = 'book';
SELECT ROW_COUNT();
SELECT qty FROM items WHERE name = 'book';

-- OUTPUT:
-- ROW_COUNT()
-- 1
-- qty
-- 4`],
            ['Join update.',
                r`UPDATE items i JOIN low_stock l ON l.name = i.name SET i.qty = i.qty + 10;
SELECT name, qty FROM items WHERE name IN ('book','bag');

-- OUTPUT:
-- name | qty
-- book |  14
-- bag  |  12`]],
        [['Optimistic locking.',
            r`UPDATE products SET price = 120, version = version + 1 WHERE id = 7 AND version = 3;
SELECT ROW_COUNT();

-- OUTPUT:
-- ROW_COUNT()
-- 1    (0 would mean a concurrent change happened)`],
            ['Batched update loop (pseudo).',
                r`UPDATE logs SET archived = 1 WHERE archived = 0 AND id BETWEEN 1 AND 1000;
-- repeat for next ranges, commit each time

-- OUTPUT:
-- Query OK, 1000 rows affected`]]
    ),

    'DELETE': x(
        ['<code>DELETE FROM t WHERE condition</code> removes rows. Without WHERE it deletes all rows.',
            'DELETE can be rolled back inside a transaction (unlike TRUNCATE).',
            'Check how many rows were deleted with <code>ROW_COUNT()</code>.'],
        ['Foreign keys can block deletes (RESTRICT) or cascade them.',
            'Preview with <code>SELECT ... WHERE</code> first; use transactions for safety.',
            'DELETE does not shrink the table file; space is reused, and <code>OPTIMIZE TABLE</code> reclaims it.'],
        ['Mass deletes: batch (<code>DELETE ... LIMIT 1000</code> in a loop) to avoid long locks, big undo logs and replica lag.',
            'Prefer soft delete (<code>deleted_at</code>) for recoverability and audit, with periodic purge jobs.',
            'Partitioned tables allow instant data removal by dropping a partition.'],
        [['F', 'How do you delete specific rows?', '<code>DELETE FROM t WHERE id = 5;</code>'],
            ['F', 'Difference between DELETE and TRUNCATE?', 'DELETE removes selected rows and can be rolled back; TRUNCATE removes all rows quickly and cannot be rolled back.'],
            ['M', 'Why does a delete fail with a foreign key error?', 'Child rows reference the row; remove children first, or use ON DELETE CASCADE.'],
            ['M', 'Does DELETE free disk space?', 'Space is reused inside the tablespace but the file does not shrink until OPTIMIZE TABLE or a rebuild.'],
            ['S', 'How to purge old data without hurting production?', 'Batched deletes by id range with sleeps, or time-based partitions dropped instantly.'],
            ['S', 'Soft or hard delete?', 'Soft delete for auditability and undo, hard delete or purge for privacy/storage; you often need both with a retention policy.']],
        [['Delete with a condition and verify.',
            r`DELETE FROM items WHERE qty < 5;
SELECT ROW_COUNT();
SELECT name FROM items ORDER BY name;

-- OUTPUT:
-- ROW_COUNT()
-- 2
-- name
-- book
-- pen`],
            ['Rollback a delete.',
                r`START TRANSACTION;
DELETE FROM items;
ROLLBACK;
SELECT COUNT(*) FROM items;

-- OUTPUT:
-- COUNT(*)
-- 2`]],
        [['Batched purge.',
            r`DELETE FROM events WHERE created_at < NOW() - INTERVAL 90 DAY LIMIT 1000;
-- loop until ROW_COUNT() = 0

-- OUTPUT:
-- Query OK, 1000 rows affected`],
            ['Soft delete.',
                r`UPDATE users SET deleted_at = NOW() WHERE id = 3;
SELECT id FROM users WHERE deleted_at IS NULL;

-- OUTPUT:
-- id
-- 1
-- 2`]]
    )
};
