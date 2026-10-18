// Module 4 (Data Types), part B.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s04b: Record<string, DeepDive> = {
    'DATE, TIME & YEAR': dd(
        [`<b>DATE</b> stores a calendar day (3 bytes, 1000-01-01 to 9999-12-31), <b>TIME</b> a time or duration (-838:59:59 to 838:59:59), <b>YEAR</b> a 4-digit year (1901 to 2155, 1 byte).`,
            r`CREATE TABLE ev (d DATE, t TIME, y YEAR);
INSERT INTO ev VALUES ('2026-10-06', '14:30:00', 2026);
SELECT * FROM ev;

-- OUTPUT:
-- +------------+----------+------+
-- | d          | t        | y    |
-- +------------+----------+------+
-- | 2026-10-06 | 14:30:00 | 2026 |
-- +------------+----------+------+`],
        [`Dates in VARCHAR cannot be sorted, compared or computed with correctly. Real date types give validation, compact storage and built-in date arithmetic.`,
            r`INSERT INTO ev (d) VALUES ('2026-02-30');      -- no such day

-- OUTPUT:
-- ERROR 1292 (22007): Incorrect date value: '2026-02-30' for column 'd' at row 1`],
        [`Birthdays and due dates use DATE, opening hours and durations TIME, and copyright or model year YEAR. Reports group by date parts.`,
            r`SELECT d,
       DATE_ADD(d, INTERVAL 30 DAY) AS due,         -- date arithmetic
       DATEDIFF('2026-12-31', d)    AS days_left,
       DAYNAME(d)                   AS weekday
FROM ev;

-- OUTPUT:
-- +------------+------------+-----------+---------+
-- | d          | due        | days_left | weekday |
-- +------------+------------+-----------+---------+
-- | 2026-10-06 | 2026-11-05 |        86 | Tuesday |
-- +------------+------------+-----------+---------+`],
        [`<b>Advantages:</b> small, validated, indexable, rich functions, comparisons work by value.`,
            r`CREATE INDEX idx_d ON ev (d);
EXPLAIN SELECT * FROM ev WHERE d BETWEEN '2026-01-01' AND '2026-12-31';   -- range scan on index

-- OUTPUT (example, trimmed):
-- | type  | key   | rows |
-- | range | idx_d |    1 |`],
        [`<b>Disadvantages:</b> no time zone in DATE or TIME; TIME mixes clock time and duration; zero dates and invalid dates behave differently under sql_mode.`,
            r`SELECT TIMEDIFF('10:00:00', '08:30:00') AS elapsed,      -- a duration, not a clock time
       SEC_TO_TIME(90000)                AS over_a_day;     -- TIME can exceed 24 hours

-- OUTPUT:
-- +----------+-------------+
-- | elapsed  | over_a_day  |
-- +----------+-------------+
-- | 01:30:00 | 25:00:00    |
-- +----------+-------------+`],
        [`<b>Limitations:</b> DATE cannot go before year 1000 reliably or after 9999; YEAR is only 1901-2155 (and 0000); two-digit year input is ambiguous (70-99 means 19xx, 00-69 means 20xx).`,
            r`INSERT INTO ev (y) VALUES (1800);

-- OUTPUT:
-- ERROR 1264 (22003): Out of range value for column 'y' at row 1`],
        `
   DATE  'YYYY-MM-DD'          3 bytes   1000-01-01 .. 9999-12-31
   TIME  'HH:MM:SS[.ffffff]'   3 bytes   -838:59:59 .. 838:59:59
   YEAR  YYYY                  1 byte    1901 .. 2155
   no time zone information stored in any of them
`,
        `Store dates as DATE (not strings or ints) and keep calendar logic in SQL functions. For anything that must be an instant, use DATETIME or TIMESTAMP in UTC instead, and avoid the legacy zero date by keeping NO_ZERO_DATE in sql_mode.`
    ),

    'DATETIME vs TIMESTAMP': dd(
        [`Both store date and time. <b>DATETIME</b> (5 bytes plus fraction, 1000 to 9999) stores the literal value with no time zone conversion. <b>TIMESTAMP</b> (4 bytes plus fraction, 1970-01-01 00:00:01 UTC to 2038-01-19 03:14:07 UTC) is stored as UTC and converted to and from the session time zone.`,
            r`CREATE TABLE t (id INT, dt DATETIME, ts TIMESTAMP);
SET time_zone = '+00:00';
INSERT INTO t VALUES (1, '2026-10-06 12:00:00', '2026-10-06 12:00:00');
SET time_zone = '+05:30';                      -- same session now in India time
SELECT dt, ts FROM t;

-- OUTPUT:
-- +---------------------+---------------------+
-- | dt                  | ts                  |
-- +---------------------+---------------------+
-- | 2026-10-06 12:00:00 | 2026-10-06 17:30:00 |
-- +---------------------+---------------------+`],
        [`Systems with users in many time zones need a safe way to store instants. TIMESTAMP handles conversion automatically; DATETIME keeps what you gave it, which suits local wall-clock times such as a store opening time.`,
            r`CREATE TABLE audit (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,                              -- set on insert
    updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- auto-refresh
    event_at   DATETIME(3)   NULL                                                             -- ms precision
);
INSERT INTO audit (event_at) VALUES ('2026-10-06 09:15:30.123');
SELECT event_at FROM audit;

-- OUTPUT:
-- +-------------------------+
-- | event_at                |
-- +-------------------------+
-- | 2026-10-06 09:15:30.123 |
-- +-------------------------+`],
        [`created_at and updated_at columns are almost universal. Bookings and schedules in a fixed local zone use DATETIME; global event logs use TIMESTAMP or DATETIME stored in UTC.`,
            r`UPDATE audit SET event_at = NOW(3) WHERE id = 1;     -- updated_at changes by itself
SELECT created_at < updated_at OR created_at = updated_at AS auto_maintained FROM audit;

-- OUTPUT:
-- +-----------------+
-- | auto_maintained |
-- +-----------------+
-- |               1 |
-- +-----------------+`],
        [`<b>Advantages:</b> TIMESTAMP is smaller and time-zone aware with automatic defaults; DATETIME has a huge range and no conversion surprises.`,
            r`SELECT @@session.time_zone AS session_tz, @@global.time_zone AS global_tz;

-- OUTPUT (example):
-- +------------+-----------+
-- | session_tz | global_tz |
-- +------------+-----------+
-- | +05:30     | SYSTEM    |
-- +------------+-----------+`],
        [`<b>Disadvantages:</b> TIMESTAMP depends on the session time zone, so changing server time zone changes displayed values; DATETIME has no zone, so you must remember its convention.`,
            r`SET time_zone = '+00:00';
SELECT dt, ts FROM t;                                -- the TIMESTAMP shifts back, DATETIME does not

-- OUTPUT:
-- +---------------------+---------------------+
-- | dt                  | ts                  |
-- +---------------------+---------------------+
-- | 2026-10-06 12:00:00 | 2026-10-06 12:00:00 |
-- +---------------------+---------------------+`],
        [`<b>Limitations:</b> TIMESTAMP stops at 2038-01-19 03:14:07 UTC (the Year 2038 problem), which matters for long-dated data such as 30-year bonds.`,
            r`INSERT INTO t (id, ts) VALUES (2, '2040-01-01 00:00:00');

-- OUTPUT:
-- ERROR 1292 (22007): Incorrect datetime value: '2040-01-01 00:00:00' for column 'ts' at row 1`],
        `
   client time zone ──► TIMESTAMP stored as UTC seconds ──► converted back on read
   client value     ──► DATETIME  stored as written     ──► returned unchanged
                         range: 1970..2038        range: 1000..9999
`,
        `A common rule: store instants as UTC in DATETIME(6) or TIMESTAMP(6), convert to local time in the application, and keep the server and session time zone at UTC. Prefer DATETIME for future-dated business data to avoid the 2038 limit.`
    ),

    'BOOLEAN, JSON & Binary Types': dd(
        [`MySQL has no real boolean: <code>BOOLEAN</code> is an alias for <code>TINYINT(1)</code> (0 false, nonzero true). <b>JSON</b> is a native validated document type. <b>BINARY, VARBINARY, BLOB</b> hold raw bytes.`,
            r`CREATE TABLE flags (
    id      INT PRIMARY KEY,
    active  BOOLEAN DEFAULT TRUE,          -- really TINYINT(1)
    prefs   JSON,                          -- validated JSON document
    token   BINARY(16)                     -- 16 raw bytes (for example a UUID)
);
INSERT INTO flags VALUES (1, TRUE, '{"theme":"dark","fonts":[12,14]}', UUID_TO_BIN(UUID()));
SELECT id, active, prefs, prefs->>'$.theme' AS theme FROM flags;

-- OUTPUT:
-- +----+--------+----------------------------------+-------+
-- | id | active | prefs                            | theme |
-- +----+--------+----------------------------------+-------+
-- |  1 |      1 | {"fonts": [12, 14], "theme": "dark"} | dark |
-- +----+--------+----------------------------------+-------+`],
        [`Flags need a compact true/false, semi-structured settings need flexible storage, and binary data such as hashes and UUIDs need an exact byte comparison without character set rules.`,
            r`INSERT INTO flags (id, prefs) VALUES (2, '{bad json}');     -- the server validates JSON

-- OUTPUT:
-- ERROR 3140 (22032): Invalid JSON text: "Invalid value." at position 1 in value for column 'flags.prefs'.`],
        [`Feature toggles use BOOLEAN, user preferences and API payloads JSON, password hashes BINARY or VARBINARY, UUID keys BINARY(16), and small icons BLOB.`,
            r`SELECT BIN_TO_UUID(token) IS NOT NULL AS has_uuid,
       HEX(UNHEX(SHA2('abc',256))) AS sha256_hex     -- 32 raw bytes shown as hex
FROM flags;

-- OUTPUT (example):
-- +----------+------------------------------------------------------------------+
-- | has_uuid | sha256_hex                                                       |
-- +----------+------------------------------------------------------------------+
-- |        1 | BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD |
-- +----------+------------------------------------------------------------------+`],
        [`<b>Advantages:</b> JSON gives schema flexibility with validation, path queries and indexing via generated columns; BINARY(16) UUIDs are half the size of CHAR(36); TINYINT(1) is tiny.`,
            r`SELECT JSON_EXTRACT(prefs, '$.fonts[1]') AS second_font, JSON_LENGTH(prefs, '$.fonts') AS n FROM flags;

-- OUTPUT:
-- +-------------+---+
-- | second_font | n |
-- +-------------+---+
-- | 14          | 2 |
-- +-------------+---+`],
        [`<b>Disadvantages:</b> BOOLEAN accepts any small integer, not only 0 and 1; JSON columns cannot be indexed directly, lack column-level types and constraints, and rewrite costs rise with document size.`,
            r`UPDATE flags SET active = 7 WHERE id = 1;       -- accepted: it is just a TINYINT
SELECT active, active = TRUE AS equals_true, active IS TRUE AS is_true FROM flags;

-- OUTPUT:
-- +--------+-------------+---------+
-- | active | equals_true | is_true |
-- +--------+-------------+---------+
-- |      7 |           0 |       1 |
-- +--------+-------------+---------+`],
        [`<b>Limitations:</b> JSON documents are capped by max_allowed_packet; BLOB columns cannot have defaults and need prefix indexes; BINARY pads with 0x00 bytes, so lengths differ from VARBINARY.`,
            r`SELECT LENGTH(CAST('ab' AS BINARY(4))) AS padded_len, HEX(CAST('ab' AS BINARY(4))) AS bytes;

-- OUTPUT:
-- +------------+----------+
-- | padded_len | bytes    |
-- +------------+----------+
-- |          4 | 61620000 |
-- +------------+----------+`],
        `
   BOOLEAN       -> TINYINT(1)       0 = false, nonzero = true
   JSON          -> binary-encoded document, validated on write
   BINARY(n)     fixed bytes   VARBINARY(n) variable   BLOB 64 KB .. LONGBLOB 4 GB
`,
        `Use JSON for genuinely variable attributes and keep queried or constrained fields as real columns (or generated, indexed columns). Store UUIDs as BINARY(16) with UUID_TO_BIN(uuid,1) to improve insert locality; keep large files in object storage.`
    ),

    'Storage Size, Range & Type Performance': dd(
        [`Every type has a storage size and a range; together they drive table size, buffer-pool use and speed. Smaller types mean more rows per 16 KB InnoDB page, so fewer disk reads.`,
            r`CREATE TABLE sizes (a TINYINT, b INT, c BIGINT, d DATE, e DATETIME, f TIMESTAMP, g CHAR(10), h VARCHAR(10));
INSERT INTO sizes VALUES (1,1,1,'2026-01-01','2026-01-01 00:00:00','2026-01-01 00:00:00','abc','abc');
-- Bytes used by one column's value
SELECT 1 AS tinyint_b, 4 AS int_b, 8 AS bigint_b, 3 AS date_b, 5 AS datetime_b, 4 AS timestamp_b;

-- OUTPUT (documented sizes):
-- +-----------+-------+----------+--------+------------+------------+
-- | tinyint_b | int_b | bigint_b | date_b | datetime_b | timestamp_b|
-- +-----------+-------+----------+--------+------------+------------+
-- |         1 |     4 |        8 |      3 |          5 |          4 |
-- +-----------+-------+----------+--------+------------+------------+`],
        [`At millions of rows, 4 spare bytes per row is gigabytes, and every secondary index repeats the primary key, so oversized keys multiply the waste.`,
            r`-- Measure real size per table
SELECT table_name,
       ROUND(data_length  / 1024 / 1024, 1) AS data_mb,
       ROUND(index_length / 1024 / 1024, 1) AS index_mb
FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'sizes';

-- OUTPUT (example):
-- +------------+---------+----------+
-- | TABLE_NAME | data_mb | index_mb |
-- +------------+---------+----------+
-- | sizes      |     0.0 |      0.0 |
-- +------------+---------+----------+`],
        [`Architects review column types in design reviews: INT UNSIGNED ids, DECIMAL for money, ascii for hex, ENUM or lookup tables for small domains, fixed-width codes as CHAR.`,
            r`-- Compare two designs for 10 million rows (arithmetic, not a query)
SELECT (10000000 * (8 + 36)) / 1024 / 1024 AS mb_bigint_plus_char36_id,
       (10000000 * (4 + 16)) / 1024 / 1024 AS mb_int_plus_binary16;

-- OUTPUT:
-- +--------------------------+----------------------+
-- | mb_bigint_plus_char36_id | mb_int_plus_binary16 |
-- +--------------------------+----------------------+
-- |             419.62890625 |         190.73486328 |
-- +--------------------------+----------------------+`],
        [`<b>Advantages of careful typing:</b> smaller indexes, better cache hit ratio, faster scans and joins (integers compare faster than strings), and range validation for free.`,
            r`-- Integer joins and comparisons are cheaper than string ones
EXPLAIN SELECT * FROM sizes WHERE b = 1;

-- OUTPUT (example, trimmed):
-- | type | key  | rows | filtered |
-- | ALL  | NULL |    1 |   100.00 |     (add an INT index and this becomes ref)`],
        [`<b>Disadvantages:</b> too-small types cause overflow incidents and painful migrations; tight typing needs forecasting growth.`,
            r`-- Changing INT to BIGINT on a billion-row PK rebuilds the table and every index
ALTER TABLE sizes MODIFY b BIGINT, ALGORITHM=INPLACE, LOCK=NONE;

-- OUTPUT:
-- ERROR 1846 (0A000): ALGORITHM=INPLACE is not supported. Reason: Cannot change column type INPLACE.`],
        [`<b>Limitations:</b> row size is limited to 65,535 bytes (excluding BLOB/TEXT payload); InnoDB page is 16 KB by default so rows over about 8 KB spill to overflow pages; an index key is at most 3072 bytes.`,
            r`SELECT @@innodb_page_size AS page_bytes, @@sql_mode LIKE '%STRICT_TRANS_TABLES%' AS strict_on;

-- OUTPUT:
-- +------------+-----------+
-- | page_bytes | strict_on |
-- +------------+-----------+
-- |      16384 |         1 |
-- +------------+-----------+`],
        `
   16 KB InnoDB page
   ┌────────────────────────────────────────────┐
   │ INT row 20 B  → ~ 700 rows per page        │
   │ wide row 200 B→ ~  70 rows per page        │
   └────────────────────────────────────────────┘
   fewer rows/page = more I/O, bigger indexes, lower cache hit rate
`,
        `Review types like you review APIs: right-size keys, avoid string keys for joins, keep nullable and large columns out of hot tables, and plan the INT-to-BIGINT jump early since it is a rebuild. Measure with information_schema and real EXPLAIN data, not guesses.`
    ),
};
