// Module 38 (Partitioning), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s38k: Record<string, DeepDive> = {
    'Why Partition?': dd(
        [`<b>Partitioning</b> splits one logical table into several physical pieces (partitions) by a rule on a column. Applications still query one table name; MySQL decides which pieces hold the rows. In MySQL each partition is its own InnoDB tablespace file.`,
            r`-- One logical table, physically split by year
CREATE TABLE sales (
    id        BIGINT NOT NULL,
    sold_on   DATE   NOT NULL,
    amount    DECIMAL(10,2),
    PRIMARY KEY (id, sold_on)                -- partition column must be in every unique key
)
PARTITION BY RANGE (YEAR(sold_on)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION pmax  VALUES LESS THAN MAXVALUE
);
SELECT PARTITION_NAME, TABLE_ROWS FROM information_schema.PARTITIONS
WHERE TABLE_NAME = 'sales';

-- OUTPUT:
-- +----------------+------------+
-- | PARTITION_NAME | TABLE_ROWS |
-- +----------------+------------+
-- | p2024          |          0 |
-- | p2025          |          0 |
-- | pmax           |          0 |
-- +----------------+------------+`],
        [`Very large tables make maintenance painful: purging old rows with DELETE is slow and bloats undo, index trees grow deep, and backups or ALTERs take hours. Partitioning lets you drop old data instantly and touch only relevant slices.`,
            r`-- Retention: dropping a whole partition is a metadata operation, DELETE is millions of row changes
ALTER TABLE sales DROP PARTITION p2024;      -- instant, no undo per row, frees the file

-- OUTPUT:
-- Query OK, 0 rows affected (0.02 sec)`],
        [`Typical homes: logs, audit trails, IoT readings, time-series and order history, where data has a natural time key and old data expires on a schedule.`,
            r`-- Queries that filter on the partition key touch fewer partitions
EXPLAIN SELECT SUM(amount) FROM sales WHERE sold_on >= '2025-03-01' AND sold_on < '2025-04-01';

-- OUTPUT (example, trimmed):
-- +----+--------+------------+------+
-- | id | table  | partitions | rows |
-- +----+--------+------------+------+
-- |  1 | sales  | p2025      | 9421 |   <- only 1 of 3 partitions read
-- +----+--------+------------+------+`],
        [`<b>Advantages:</b> fast bulk purge via DROP/TRUNCATE PARTITION, partition pruning for time-bounded queries, smaller per-partition indexes, and the option to place partitions on different disks.`,
            r`-- Truncate just one slice, others untouched
ALTER TABLE sales TRUNCATE PARTITION p2025;

-- OUTPUT:
-- Query OK, 0 rows affected (0.01 sec)`],
        [`<b>Disadvantages:</b> a query that does not filter on the partition key must open every partition; many partitions add overhead; schema rules become stricter; and it does not speed up a well-indexed point lookup.`,
            r`-- No pruning: filter on a non-partition column scans all partitions
EXPLAIN SELECT * FROM sales WHERE amount = 500.00;

-- OUTPUT (example, trimmed):
-- +----+-------+-----------------------+------+
-- | id | table | partitions            | type |
-- +----+-------+-----------------------+------+
-- |  1 | sales | p2024,p2025,pmax      | ALL  |
-- +----+-------+-----------------------+------+`],
        [`<b>Limitations:</b> InnoDB partitioning has no foreign keys (neither from nor to a partitioned table), every unique key must include the partitioning columns, at most 8192 partitions, and the partition expression must be integer-valued (or DATE/DATETIME via functions like YEAR or TO_DAYS) for RANGE.`,
            r`-- Unique key that omits the partition column is rejected
CREATE TABLE bad (id INT, d DATE, UNIQUE KEY (id))
PARTITION BY RANGE (YEAR(d)) (PARTITION p0 VALUES LESS THAN MAXVALUE);

-- OUTPUT:
-- ERROR 1503 (HY000): A UNIQUE INDEX must include all columns in the table's partitioning function`],
        `
   logical table  sales
   ┌─────────────────────────────────────────────────────────┐
   │ p2024.ibd      │ p2025.ibd      │ pmax.ibd              │
   │ rows 2024      │ rows 2025      │ rows 2026+            │
   └────────────────┴────────────────┴───────────────────────┘
   WHERE sold_on in 2025  -> only p2025 opened   (pruning)
   DROP PARTITION p2024   -> one file removed    (instant purge)
`,
        `Partition for data lifecycle (purge and archive) first, performance second; a good index usually beats partitioning for query speed. Pick a key that appears in nearly every query and in all unique keys, keep partitions in the tens or low hundreds, and consider sharding or archival tables if you need cross-server scale instead.`
    ),

    'Range & List Partitioning': dd(
        [`<b>RANGE</b> partitioning assigns rows to partitions by which interval the expression falls in (dates, ids). <b>LIST</b> assigns by explicit value sets (region codes, status ids). <code>RANGE COLUMNS</code> and <code>LIST COLUMNS</code> allow non-integer columns directly such as DATE or strings.`,
            r`-- RANGE COLUMNS on a DATE directly, no YEAR() needed
CREATE TABLE logs (
    id BIGINT NOT NULL, logged_on DATE NOT NULL, msg VARCHAR(100),
    PRIMARY KEY (id, logged_on)
)
PARTITION BY RANGE COLUMNS (logged_on) (
    PARTITION p_q1 VALUES LESS THAN ('2026-04-01'),
    PARTITION p_q2 VALUES LESS THAN ('2026-07-01'),
    PARTITION p_max VALUES LESS THAN (MAXVALUE)
);
INSERT INTO logs VALUES (1,'2026-02-10','a'),(2,'2026-05-05','b');
SELECT PARTITION_NAME, TABLE_ROWS FROM information_schema.PARTITIONS WHERE TABLE_NAME='logs';

-- OUTPUT (example; TABLE_ROWS is an estimate):
-- +----------------+------------+
-- | PARTITION_NAME | TABLE_ROWS |
-- +----------------+------------+
-- | p_q1           |          1 |
-- | p_q2           |          1 |
-- | p_max          |          0 |
-- +----------------+------------+`],
        [`Time data needs range slices that can be rotated; categorical data (countries, tenants) needs list slices that group related values together so one group can be moved or dropped.`,
            r`-- LIST partitioning by region id
CREATE TABLE customers (
    id INT NOT NULL, region_id INT NOT NULL, name VARCHAR(40),
    PRIMARY KEY (id, region_id)
)
PARTITION BY LIST (region_id) (
    PARTITION p_asia   VALUES IN (1,2,3),
    PARTITION p_europe VALUES IN (4,5),
    PARTITION p_other  VALUES IN (6,7,8)
);
INSERT INTO customers VALUES (1,4,'Anna');
SELECT PARTITION_NAME, TABLE_ROWS FROM information_schema.PARTITIONS WHERE TABLE_NAME='customers';

-- OUTPUT (example):
-- | p_asia   | 0 |
-- | p_europe | 1 |
-- | p_other  | 0 |`],
        [`Monthly log tables rotated by a scheduled job: add next month's partition, drop partitions older than the retention window.`,
            r`-- Monthly rotation: split the catch-all partition to create the next range
ALTER TABLE logs REORGANIZE PARTITION p_max INTO (
    PARTITION p_q3  VALUES LESS THAN ('2026-10-01'),
    PARTITION p_max VALUES LESS THAN (MAXVALUE)
);
ALTER TABLE logs DROP PARTITION p_q1;        -- expire the oldest quarter

-- OUTPUT:
-- Query OK, 0 rows affected (0.05 sec)
-- Query OK, 0 rows affected (0.01 sec)`],
        [`<b>Advantages:</b> intuitive, supports pruning for range and equality predicates, makes rotation and archival trivial, and keeps related rows together (LIST).`,
            r`-- Pruning on a range predicate
EXPLAIN SELECT * FROM logs WHERE logged_on BETWEEN '2026-05-01' AND '2026-05-31';

-- OUTPUT (example, trimmed):
-- +----+-------+------------+------+
-- | id | table | partitions | type |
-- +----+-------+------------+------+
-- |  1 | logs  | p_q2       | ALL  |
-- +----+-------+------------+------+`],
        [`<b>Disadvantages:</b> hot spots (all new writes hit the newest RANGE partition), manual maintenance to add future ranges, and a catch-all MAXVALUE partition that grows unbounded if you forget to split it.`,
            r`-- LIST has no catch-all: an unlisted value is an error, not a default bucket
INSERT INTO customers VALUES (2, 99, 'Nobody');

-- OUTPUT:
-- ERROR 1526 (HY000): Table has no partition for value 99`],
        [`<b>Limitations:</b> RANGE needs ascending boundaries, LIST values must be unique across partitions, and with the older single-expression form the expression must return an integer. NULL goes to the lowest RANGE partition and to a LIST partition only if NULL is explicitly listed.`,
            r`-- NULL handling differs: RANGE sends NULL to the lowest partition
CREATE TABLE t (id INT, v INT) PARTITION BY RANGE (v) (
    PARTITION p0 VALUES LESS THAN (10), PARTITION p1 VALUES LESS THAN MAXVALUE);
INSERT INTO t VALUES (1, NULL);
SELECT PARTITION_NAME, TABLE_ROWS FROM information_schema.PARTITIONS WHERE TABLE_NAME='t';

-- OUTPUT (example):
-- | p0 | 1 |   <- NULL landed in the lowest partition
-- | p1 | 0 |`],
        `
   RANGE (by date)                         LIST (by region)
   ┌────────┬────────┬────────┐            ┌──────────┬──────────┬─────────┐
   │ < Apr  │ < Jul  │ MAXVAL │            │ 1,2,3    │ 4,5      │ 6,7,8   │
   │  p_q1  │  p_q2  │ p_max  │            │ p_asia   │ p_europe │ p_other │
   └────────┴────────┴────────┘            └──────────┴──────────┴─────────┘
   boundary grows with time                values enumerated explicitly
   REORGANIZE splits p_max for the next period
`,
        `Use RANGE for time-based data with a scheduled job that pre-creates future partitions so inserts never hit an unbounded catch-all; use LIST sparingly because every new category needs DDL. Avoid hot-spotting the newest partition on very high write rates by combining RANGE with HASH subpartitions or using a different scaling strategy.`
    ),

    'Hash & Key Partitioning': dd(
        [`<b>HASH</b> partitioning distributes rows by <code>MOD(expression, N)</code> over N partitions; <b>KEY</b> partitioning does the same using MySQL's internal hash function over one or more columns (defaulting to the primary key), so it works with non-integer columns too. <code>LINEAR</code> variants use a power-of-two algorithm that makes adding partitions cheaper but less even.`,
            r`-- HASH on an integer, 4 partitions
CREATE TABLE sessions (
    id BIGINT NOT NULL PRIMARY KEY, user_id INT, data VARCHAR(50)
)
PARTITION BY HASH (id) PARTITIONS 4;
INSERT INTO sessions VALUES (1,10,'a'),(2,11,'b'),(3,12,'c'),(4,13,'d'),(5,14,'e');
SELECT PARTITION_NAME, TABLE_ROWS FROM information_schema.PARTITIONS WHERE TABLE_NAME='sessions';

-- OUTPUT (example):
-- +----------------+------------+
-- | PARTITION_NAME | TABLE_ROWS |
-- +----------------+------------+
-- | p0             |          1 |   (id 4)
-- | p1             |          2 |   (ids 1,5)
-- | p2             |          1 |   (id 2)
-- | p3             |          1 |   (id 3)
-- +----------------+------------+`],
        [`Some data has no natural range, so range partitions would pile into one slice. Hash spreads rows evenly, which reduces contention on a single big file and spreads I/O across disks.`,
            r`-- KEY partitioning on a string column (hash function chosen by MySQL)
CREATE TABLE users (
    email VARCHAR(80) NOT NULL PRIMARY KEY, name VARCHAR(40)
)
PARTITION BY KEY () PARTITIONS 8;            -- empty column list = use the primary key
INSERT INTO users VALUES ('a@x.com','A'),('b@x.com','B');
SELECT COUNT(*) FROM information_schema.PARTITIONS WHERE TABLE_NAME='users';

-- OUTPUT:
-- +----------+
-- | COUNT(*) |
-- +----------+
-- |        8 |
-- +----------+`],
        [`Used for session stores, user tables and other uniformly accessed data where the goal is balanced size and parallel I/O, not lifecycle management.`,
            r`-- Point lookup by the hash column prunes to a single partition
EXPLAIN SELECT * FROM sessions WHERE id = 3;

-- OUTPUT (example, trimmed):
-- +----+----------+------------+-------+
-- | id | table    | partitions | type  |
-- +----+----------+------------+-------+
-- |  1 | sessions | p3         | const |
-- +----+----------+------------+-------+`],
        [`<b>Advantages:</b> even distribution with no maintenance of boundaries, pruning for equality lookups, and KEY works on any column type.`,
            r`-- Changing the partition count redistributes rows evenly
ALTER TABLE sessions COALESCE PARTITION 2;   -- shrink from 4 to 2 partitions, data re-hashed
SELECT COUNT(*) AS parts FROM information_schema.PARTITIONS WHERE TABLE_NAME='sessions';

-- OUTPUT:
-- +-------+
-- | parts |
-- +-------+
-- |     2 |
-- +-------+`],
        [`<b>Disadvantages:</b> no pruning for range predicates, no cheap way to drop old data, and changing N rebuilds (re-hashes) the whole table.`,
            r`-- A range predicate on a HASH column cannot prune
EXPLAIN SELECT * FROM sessions WHERE id BETWEEN 100 AND 200;

-- OUTPUT (example, trimmed):
-- | partitions | p0,p1 |   <- every partition is searched`],
        [`<b>Limitations:</b> the HASH expression must be an integer, KEY cannot partition by BLOB/TEXT columns, unique keys must contain the partitioning columns, and HASH or KEY gives no data-lifecycle benefit.`,
            r`-- HASH expression must yield an integer
CREATE TABLE t2 (name VARCHAR(20) NOT NULL) PARTITION BY HASH (name) PARTITIONS 4;

-- OUTPUT:
-- ERROR 1697 (HY000): VALUES value for partition 'p0' must have type INT
-- (use PARTITION BY KEY (name) for strings)`],
        `
   id -> MOD(id, 4)
   ┌──────────┬──────────┬──────────┬──────────┐
   │ p0       │ p1       │ p2       │ p3       │
   │ id 4,8.. │ id 1,5.. │ id 2,6.. │ id 3,7.. │
   └──────────┴──────────┴──────────┴──────────┘
   WHERE id = 3        -> only p3
   WHERE id > 100    -> all four (no pruning)
`,
        `Choose a power-of-two partition count up front, since changing it re-hashes everything. Use HASH or KEY to remove a single-file bottleneck, not as a performance cure-all; if you want horizontal scale across machines, partitioning inside one server is not a substitute for sharding.`
    ),

    'Partition Pruning & Management': dd(
        [`<b>Partition pruning</b> is the optimizer skipping partitions that cannot contain matching rows, based on the WHERE clause. <b>Management</b> means adding, dropping, splitting, exchanging and rebuilding partitions with ALTER TABLE.`,
            r`-- See which partitions the optimizer will read (MySQL 8 shows them in plain EXPLAIN)
EXPLAIN SELECT * FROM sales WHERE sold_on = '2025-06-15';

-- OUTPUT (example, trimmed):
-- +----+-------+------------+------+
-- | id | table | partitions | type |
-- +----+-------+------------+------+
-- |  1 | sales | p2025      | ref  |
-- +----+-------+------------+------+`],
        [`Pruning is where the read benefit comes from, and management is where the operational benefit comes from. Without both, partitioning only adds complexity.`,
            r`-- Wrapping the partition column in a function can defeat pruning
EXPLAIN SELECT * FROM sales WHERE YEAR(sold_on) = 2025;           -- may prune for RANGE(YEAR()) tables
EXPLAIN SELECT * FROM sales WHERE DATE_ADD(sold_on, INTERVAL 1 DAY) = '2025-06-16';  -- cannot prune

-- OUTPUT (example):
-- query 1 partitions: p2025
-- query 2 partitions: p2024,p2025,pmax`],
        [`Operations teams automate: add next partition, archive old ones by swapping them into a plain table with EXCHANGE PARTITION, and rebuild fragmented partitions.`,
            r`-- Archive a partition by swapping it with an empty table of identical structure
CREATE TABLE sales_2024_archive LIKE sales;
ALTER TABLE sales_2024_archive REMOVE PARTITIONING;
ALTER TABLE sales EXCHANGE PARTITION p2024 WITH TABLE sales_2024_archive;
SELECT COUNT(*) AS rows_left_in_p2024 FROM sales PARTITION (p2024);

-- OUTPUT:
-- +--------------------+
-- | rows_left_in_p2024 |
-- +--------------------+
-- |                  0 |
-- +--------------------+`],
        [`<b>Advantages:</b> you can query one partition explicitly, swap data in or out in milliseconds, and run maintenance per partition.`,
            r`-- Query or maintain a single partition
SELECT COUNT(*) FROM sales PARTITION (p2025);
ALTER TABLE sales ANALYZE PARTITION p2025;
ALTER TABLE sales REBUILD PARTITION p2025;

-- OUTPUT (example):
-- +----------+
-- | COUNT(*) |
-- +----------+
-- |    48210 |
-- +----------+
-- | Table       | Op      | Msg_type | Msg_text |
-- | db.sales    | analyze | status   | OK       |`],
        [`<b>Disadvantages:</b> forgetting to pre-create the next partition makes inserts land in MAXVALUE or fail; REORGANIZE of a big partition copies its rows and can be slow; metadata locks during DDL can block traffic.`,
            r`-- Without a catch-all, a missing future partition makes inserts fail
INSERT INTO sales VALUES (99, '2031-01-01', 10.00);

-- OUTPUT:
-- ERROR 1526 (HY000): Table has no partition for value 2031`],
        [`<b>Limitations:</b> pruning works only when the predicate can be evaluated against the partitioning expression; prepared statements and some expressions prune at execution time, not plan time. Partitioned tables cannot use foreign keys or the FULLTEXT index type.`,
            r`-- FULLTEXT is not available on partitioned InnoDB tables
ALTER TABLE logs ADD FULLTEXT (msg);

-- OUTPUT:
-- ERROR 1214 (HY000): The used table type doesn't support FULLTEXT indexes`],
        `
   SELECT ... WHERE sold_on = '2025-06-15'
                        │
                  optimizer evaluates partition expression
                        ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │ p2024  │  │ p2025  │  │ pmax   │
   │ SKIP   │  │ READ   │  │ SKIP   │
   └────────┘  └────────┘  └────────┘
   Management: ADD / DROP / REORGANIZE / EXCHANGE / REBUILD / ANALYZE PARTITION
`,
        `Automate partition rotation with a scheduled job (MySQL Event or external scheduler) that is monitored, and always keep predicates sargable against the partition column so pruning fires. Use EXCHANGE PARTITION for archival and bulk loads: load into a staging table, validate, then swap in near-instantly.`
    )
};
