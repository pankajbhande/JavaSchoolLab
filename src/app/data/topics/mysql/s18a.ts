// Module 18 (Query Optimization).
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s18a: Record<string, DeepDive> = {
    'EXPLAIN': dd(
        [`<b>EXPLAIN</b> shows the execution plan the optimizer chose for a statement without running it: which tables are read, in which order, with which access type and index, and how many rows it expects to examine.`,
            r`CREATE TABLE cust (id INT PRIMARY KEY, city VARCHAR(20), name VARCHAR(30), KEY idx_city (city));
INSERT INTO cust VALUES (1,'Pune','A'),(2,'Delhi','B'),(3,'Pune','C');

EXPLAIN SELECT name FROM cust WHERE city = 'Pune';

-- OUTPUT (selected columns):
-- +----+-------------+-------+------+----------+----------+------+-------+
-- | id | select_type | table | type | key      | key_len  | rows | Extra |
-- +----+-------------+-------+------+----------+----------+------+-------+
-- |  1 | SIMPLE      | cust  | ref  | idx_city | 83       |    2 | NULL  |
-- +----+-------------+-------+------+----------+----------+------+-------+`],
        [`Guessing why a query is slow wastes time. EXPLAIN tells you whether an index is used, how rows are joined, and where sorting or temporary tables appear, so you fix the actual bottleneck.`,
            r`-- Compare plans before and after adding an index.
EXPLAIN SELECT name FROM cust WHERE name = 'C';          -- no index on name
ALTER TABLE cust ADD KEY idx_name (name);
EXPLAIN SELECT name FROM cust WHERE name = 'C';

-- OUTPUT (type / key / rows):
-- +------+----------+------+
-- | ALL  | NULL     |    3 |   <- full scan
-- | ref  | idx_name |    1 |   <- index lookup (also "Using index": covering)
-- +------+----------+------+`],
        [`Real use: code review of any new query, investigating slow-log entries, and checking plans after upgrades or data growth. FORMAT=TREE and FORMAT=JSON give more detail; EXPLAIN works for SELECT, INSERT, UPDATE, DELETE, REPLACE.`,
            r`EXPLAIN FORMAT=TREE SELECT name FROM cust WHERE city = 'Pune';

-- OUTPUT:
-- -> Index lookup on cust using idx_city (city='Pune')  (cost=0.70 rows=2)`],
        [`<b>Advantages:</b> free, safe (does not execute SELECT), shows access type (const, eq_ref, ref, range, index, ALL), chosen key, key_len, estimated rows, and Extra hints like Using filesort / Using temporary / Using index.`,
            r`-- key_len reveals how much of a composite index is used.
CREATE TABLE ord (a INT, b INT, c INT, KEY k (a,b,c));
EXPLAIN SELECT * FROM ord WHERE a = 1 AND b = 2;     -- key_len 10: a and b (5 bytes each, nullable INT)

-- OUTPUT (key_len):
-- +---------+
-- | 10      |
-- +---------+`],
        [`<b>Disadvantages:</b> it shows <i>estimates</i>, not reality: rows and filtered can be far off with stale statistics; it does not tell actual time or loops (use EXPLAIN ANALYZE).`,
            r`-- Estimated rows vs actual rows can diverge; EXPLAIN alone cannot show it.
EXPLAIN SELECT * FROM cust WHERE city = 'Pune';
-- rows = 2 is a guess from index statistics

-- OUTPUT (example):
-- +------+------+----------+
-- | type | rows | filtered |
-- +------+------+----------+
-- | ref  |    2 |   100.00 |
-- +------+------+----------+`],
        [`<b>Limitations:</b> output for DML is a plan of the statement, not its side effects; it cannot show lock waits or I/O; plans can change between executions (different parameters, statistics), and prepared statements may plan differently.`,
            r`-- Different literal, different plan (skew): plan for a rare value vs a common value.
EXPLAIN SELECT * FROM cust WHERE city = 'Pune';      -- may be ref
EXPLAIN SELECT * FROM cust WHERE city > '';          -- may be ALL, most rows match

-- OUTPUT (type, example):
-- +------+
-- | ref  |
-- | ALL  |
-- +------+`],
        `
   SQL text -> Parser -> Optimizer (cost model + statistics)
                               |
                               v
                       EXPLAIN prints the chosen plan

   type quality:  system > const > eq_ref > ref > range > index > ALL
                  (best)                                        (worst)
`,
        `Make EXPLAIN part of code review and CI for critical queries. Read type, key, key_len, rows, filtered and Extra in that order. Use FORMAT=JSON for cost details, and always pair plans with real timings, since estimate quality depends on fresh statistics.`
    ),

    'EXPLAIN ANALYZE': dd(
        [`<b>EXPLAIN ANALYZE</b> (MySQL 8.0.18+) actually <i>executes</i> the query and reports, per plan step, the estimated cost/rows next to the measured time, rows and loops. Output format is a TREE.`,
            r`CREATE TABLE big (id INT PRIMARY KEY, grp INT, v INT, KEY idx_grp (grp));
INSERT INTO big VALUES (1,1,10),(2,1,20),(3,2,30),(4,2,40);

EXPLAIN ANALYZE SELECT SUM(v) FROM big WHERE grp = 1;

-- OUTPUT (example, times vary):
-- -> Aggregate: sum(big.v)  (cost=0.70 rows=1) (actual time=0.031..0.031 rows=1 loops=1)
--     -> Index lookup on big using idx_grp (grp=1)  (cost=0.45 rows=2) (actual time=0.022..0.026 rows=2 loops=1)`],
        [`Estimates can be wrong. Only measured numbers show the real hot spot, e.g. a nested-loop step executed a million times whose estimate said "10 loops".`,
            r`-- Compare estimated rows with actual rows at each node: a big gap = bad statistics.
EXPLAIN ANALYZE
SELECT b1.id FROM big b1 JOIN big b2 ON b2.grp = b1.grp WHERE b1.v > 10;

-- OUTPUT (example):
-- -> Nested loop inner join  (cost=2.1 rows=4) (actual time=0.05..0.09 rows=5 loops=1)
--     -> Filter: (b1.v > 10)  (cost=0.65 rows=2) (actual time=0.02..0.03 rows=3 loops=1)
--     -> Index lookup on b2 using idx_grp (grp=b1.grp)  (cost=0.30 rows=2) (actual time=0.01..0.01 rows=2 loops=3)`],
        [`Real use: investigating slow queries in staging or a replica, validating that an index change really reduced rows read, and spotting plan steps with large loops counts.`,
            r`-- Reading a node:  actual time=first_row..all_rows  rows=N  loops=L
-- Total time of the node  ~ (all_rows time) x loops
-- Rows touched overall    ~ rows x loops
EXPLAIN ANALYZE SELECT * FROM big WHERE v > 25;

-- OUTPUT (example):
-- -> Filter: (big.v > 25)  (cost=0.65 rows=1.3) (actual time=0.03..0.04 rows=2 loops=1)
--     -> Table scan on big  (cost=0.65 rows=4) (actual time=0.02..0.03 rows=4 loops=1)`],
        [`<b>Advantages:</b> real timings, real row counts and loops per step, no guessing; works on joins, subqueries, derived tables; shows iterator-based execution of the 8.0 executor.`,
            r`-- Shows hash join usage and build/probe costs (8.0.18+).
EXPLAIN ANALYZE SELECT * FROM big a JOIN big b ON a.v = b.v + 0;

-- OUTPUT (example):
-- -> Inner hash join (no condition)... (a.v = (b.v + 0))  (actual time=0.1..0.1 rows=4 loops=1)`],
        [`<b>Disadvantages:</b> it runs the statement; on a heavy query or an INSERT/UPDATE/DELETE it does the work (wrap DML in a transaction and roll back); timing adds small overhead; output is TREE only.`,
            r`-- DML under EXPLAIN ANALYZE executes. Protect production data:
START TRANSACTION;
EXPLAIN ANALYZE UPDATE big SET v = v + 1 WHERE grp = 2;   -- 8.0.19+ supports DML analysis
ROLLBACK;                                                   -- undo the change

-- OUTPUT (example):
-- -> Update big (actual time=0.1..0.1 rows=0 loops=1)
--     -> Index lookup on big using idx_grp (grp=2) (actual time=0.02..0.03 rows=2 loops=1)`],
        [`<b>Limitations:</b> available only in MySQL 8.0.18+ (SELECT; DML and multi-table later); not supported with FORMAT=JSON/other formats; results include cache effects (a cold vs warm buffer pool changes times) and it cannot be used on a statement that is already running.`,
            r`EXPLAIN ANALYZE FORMAT=JSON SELECT 1;

-- OUTPUT:
-- ERROR 1235 (42000): This version of MySQL doesn't yet support 'EXPLAIN ANALYZE with JSON format'
--   (MySQL 8.0.x; newer 8.4 releases add FORMAT=JSON support for some cases)`],
        `
   EXPLAIN          -> estimates only            (does NOT run query)
   EXPLAIN ANALYZE  -> estimates + actuals       (RUNS query)

   node: cost=0.7 rows=2  |  actual time=0.02..0.03 rows=2 loops=3
         ^^^^^^^^^^^^^^^^    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
         optimizer guess     measured  (look for big mismatch)
`,
        `Use EXPLAIN ANALYZE on a replica or staging copy with production-sized data. Hunt for mismatches between estimated and actual rows, which point at stale stats or missing histograms, and for inner nodes with large loops. Never run it on heavy DML in production without a rollback plan.`
    ),

    'Full Table Scan vs Index Scan': dd(
        [`A <b>full table scan</b> (EXPLAIN type <code>ALL</code>) reads every row of the clustered index. An <b>index scan</b> reads index entries: <code>ref/range</code> seeks to matching entries, while type <code>index</code> reads the whole index (smaller than the table).`,
            r`CREATE TABLE logs (id INT PRIMARY KEY, lvl VARCHAR(5), msg VARCHAR(50), KEY idx_lvl (lvl));
INSERT INTO logs VALUES (1,'INFO','a'),(2,'ERROR','b'),(3,'INFO','c'),(4,'INFO','d');

EXPLAIN SELECT * FROM logs WHERE msg = 'b';       -- no index on msg
EXPLAIN SELECT * FROM logs WHERE lvl = 'ERROR';   -- idx_lvl

-- OUTPUT (type / key):
-- +------+----------+
-- | ALL  | NULL     |   <- full table scan
-- | ref  | idx_lvl  |   <- index seek
-- +------+----------+`],
        [`Seeking costs a tree descent per lookup; scanning is sequential and cheap per row. Neither is always better: choosing correctly is the optimizer's job, and your job is to give it good indexes and fresh statistics.`,
            r`-- Index scan over all entries (type=index) beats a table scan when the index is narrower.
EXPLAIN SELECT lvl FROM logs;          -- covering: scans idx_lvl, not the wide table

-- OUTPUT:
-- +-------+---------+-------------+
-- | type  | key     | Extra       |
-- +-------+---------+-------------+
-- | index | idx_lvl | Using index |
-- +-------+---------+-------------+`],
        [`Real systems: nightly reports legitimately scan whole tables; OLTP lookups must seek. When a query matches a large fraction of rows (about 20-30 percent or more) the optimizer rightly chooses a table scan.`,
            r`-- Matching most rows: scan wins even though an index exists.
EXPLAIN SELECT * FROM logs WHERE lvl = 'INFO';

-- OUTPUT (example, on large skewed data where INFO is 90 percent):
-- +------+------+
-- | type | key  |
-- +------+------+
-- | ALL  | NULL |
-- +------+------+`],
        [`<b>Advantages:</b> table scan: no index needed, sequential read-ahead is fast, best for big aggregations. Index seek: touches few pages and scales with tree height, ideal for selective lookups.`,
            r`-- Selective lookup touches few pages: check with handler counters.
FLUSH STATUS;
SELECT * FROM logs WHERE id = 3;
SHOW SESSION STATUS LIKE 'Handler_read_key';

-- OUTPUT:
-- +------------------+-------+
-- | Variable_name    | Value |
-- +------------------+-------+
-- | Handler_read_key |     1 |
-- +------------------+-------+`],
        [`<b>Disadvantages:</b> table scan: cost grows linearly, pollutes the buffer pool, holds many row locks under REPEATABLE READ for UPDATE/DELETE. Index seek: random I/O per matching row and extra index maintenance.`,
            r`-- An UPDATE with no usable index locks (scans) every row it walks past.
UPDATE logs SET msg = 'x' WHERE msg = 'b';     -- no index on msg: full scan, locks all rows examined

-- OUTPUT:
-- Query OK, 1 row affected   (but 4 rows were examined and locked in REPEATABLE READ)`],
        [`<b>Limitations:</b> the optimizer's choice depends on statistics; implicit conversions, functions on columns, OR across different columns and LIKE with a leading wildcard force scans; hints (FORCE INDEX) can override but may regress later.`,
            r`-- Type mismatch: comparing a string column to a number blocks the index.
EXPLAIN SELECT * FROM logs WHERE lvl = 0;          -- converts every lvl to number: scan
EXPLAIN SELECT * FROM logs WHERE lvl = 'ERROR';    -- seeks

-- OUTPUT (type):
-- +-------+
-- | index |    <- or ALL
-- | ref   |
-- +-------+`],
        `
   Full table scan (ALL)        Index seek (ref/range)        Index scan (index)
   [r1][r2][r3]...[rN]          root -> leaf -> few rows      [e1][e2]...[eN]  (narrow)
   reads N rows                 reads ~log N pages + k rows   reads N entries, not rows
   cheap per row                cheap if k small              cheaper than ALL if covering
`,
        `Do not chase "no full scans" blindly. Scans are right for analytics and unselective predicates; they are wrong when an OLTP query on a growing table lacks an index. Alert on Select_scan and Handler_read_rnd_next growth, then verify with EXPLAIN which queries cause them.`
    ),

    'Join Algorithms': dd(
        [`MySQL joins tables with <b>Nested Loop Join</b> (for each outer row, look up matches in the inner table, ideally via an index), <b>Block Nested Loop</b> (legacy, buffered), and <b>Hash Join</b> (8.0.18+, builds an in-memory hash table on the smaller input then probes it).`,
            r`CREATE TABLE d (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE e (id INT PRIMARY KEY, d_id INT, n VARCHAR(20), KEY idx_d (d_id));
INSERT INTO d VALUES (1,'HR'),(2,'IT');
INSERT INTO e VALUES (1,1,'A'),(2,2,'B'),(3,2,'C');

EXPLAIN FORMAT=TREE SELECT d.name, e.n FROM d JOIN e ON e.d_id = d.id;

-- OUTPUT (example):
-- -> Nested loop inner join  (cost=1.9 rows=3)
--     -> Table scan on d  (cost=0.45 rows=2)
--     -> Index lookup on e using idx_d (d_id=d.id)  (cost=0.40 rows=1.5)`],
        [`The algorithm decides if a join takes milliseconds or hours. With an index on the join column nested loop is excellent; without it, older MySQL did quadratic block-nested-loop work, which hash join now fixes.`,
            r`-- Join column without an index: 8.0.18+ uses a hash join instead of a quadratic loop.
CREATE TABLE x (a INT);  CREATE TABLE y (a INT);
INSERT INTO x VALUES (1),(2),(3);  INSERT INTO y VALUES (2),(3),(4);
EXPLAIN FORMAT=TREE SELECT * FROM x JOIN y ON x.a = y.a;

-- OUTPUT (example):
-- -> Inner hash join (y.a = x.a)  (cost=3.6 rows=3)
--     -> Table scan on y  (cost=0.35 rows=3)
--     -> Hash
--         -> Table scan on x  (cost=0.65 rows=3)`],
        [`Real use: OLTP joins (orders to customers) rely on indexed nested loops; reporting joins of big unindexed sets use hash joins; the optimizer picks the join order (smallest driving table with the most selective filter first).`,
            r`-- Index on the inner table's join column is the key OLTP tuning step.
EXPLAIN SELECT d.name, e.n FROM d JOIN e ON e.d_id = d.id WHERE d.name = 'IT';

-- OUTPUT (selected):
-- +----+-------+------+---------+------+
-- | id | table | type | key     | rows |
-- +----+-------+------+---------+------+
-- |  1 | d     | ALL  | NULL    |    2 |   <- driving table (filtered)
-- |  1 | e     | ref  | idx_d   |    2 |   <- one index probe per driving row
-- +----+-------+------+---------+------+`],
        [`<b>Advantages:</b> nested loop: low memory, streams first rows fast, perfect with indexes. Hash join: linear time for equi-joins without indexes. The optimizer reorders inner joins freely.`,
            r`-- Straight join forces the written order (useful to test a plan, risky in production).
EXPLAIN SELECT STRAIGHT_JOIN d.name, e.n FROM e JOIN d ON d.id = e.d_id;

-- OUTPUT (partial):
-- +-------+--------+---------+
-- | table | type   | key     |
-- +-------+--------+---------+
-- | e     | ALL    | NULL    |
-- | d     | eq_ref | PRIMARY |
-- +-------+--------+---------+`],
        [`<b>Disadvantages:</b> nested loop without an index is O(n x m); hash join needs memory (spills to disk if join_buffer_size is exceeded) and only works for equality conditions; bad join order from poor stats can be catastrophic.`,
            r`-- Hash join memory is governed by join_buffer_size (default 256 KB).
SHOW VARIABLES LIKE 'join_buffer_size';

-- OUTPUT:
-- +------------------+--------+
-- | Variable_name    | Value  |
-- +------------------+--------+
-- | join_buffer_size | 262144 |
-- +------------------+--------+`],
        [`<b>Limitations:</b> MySQL has no merge join and no parallel query for joins (InnoDB parallel read is for scans/COUNT only); hash joins need equality (or cross) conditions; since 8.0.20 the old block nested loop is replaced by hash join; FULL OUTER JOIN is not supported (emulate with UNION).`,
            r`-- FULL OUTER JOIN is unsupported in MySQL; emulate it.
SELECT x.a, y.a FROM x LEFT JOIN y ON x.a = y.a
UNION
SELECT x.a, y.a FROM x RIGHT JOIN y ON x.a = y.a;

-- OUTPUT:
-- +------+------+
-- | a    | a    |
-- +------+------+
-- |    1 | NULL |
-- |    2 |    2 |
-- |    3 |    3 |
-- | NULL |    4 |
-- +------+------+`],
        `
   Nested Loop (indexed)            Hash Join
   for each row r in OUTER          1. BUILD: hash(small side) in memory
       probe INNER index (r.key)    2. PROBE: scan big side, look up hash
       emit matches                 no index needed, equality only

   OUTER --r--> [idx on INNER]      small --> [ hash table ] <-- big (probe)
`,
        `Index every join column on the inner side of OLTP joins and keep join keys the same type and collation so the index is usable. Use hash join as a safety net, not a design goal; if it shows up in hot paths, add an index. Raise join_buffer_size per session only for specific reports.`
    ),

    'Temporary Tables & Filesort in Plans': dd(
        [`In EXPLAIN's Extra column, <b>Using temporary</b> means MySQL builds an internal temporary table (for GROUP BY, DISTINCT, UNION, derived tables). <b>Using filesort</b> means it sorts rows itself instead of reading them in index order; despite the name it may be done fully in memory.`,
            r`CREATE TABLE sales2 (id INT PRIMARY KEY, region VARCHAR(10), amt INT);
INSERT INTO sales2 VALUES (1,'N',10),(2,'S',20),(3,'N',30),(4,'E',5);

EXPLAIN SELECT region, SUM(amt) FROM sales2 GROUP BY region ORDER BY SUM(amt);

-- OUTPUT (Extra):
-- +---------------------------------+
-- | Extra                           |
-- +---------------------------------+
-- | Using temporary; Using filesort |
-- +---------------------------------+`],
        [`Both are extra work: a temp table holds an intermediate result and sorting costs O(n log n) CPU plus memory or disk. Spotting them tells you where an index could provide pre-grouped or pre-sorted rows.`,
            r`-- An index on the GROUP BY column removes the temporary table and the sort.
ALTER TABLE sales2 ADD KEY idx_region (region);
EXPLAIN SELECT region, COUNT(*) FROM sales2 GROUP BY region;

-- OUTPUT (Extra):
-- +-------------+
-- | Extra       |
-- +-------------+
-- | Using index |
-- +-------------+`],
        [`Real use: slow reports with GROUP BY on unindexed columns, ORDER BY RAND(), pagination on non-indexed sort keys, big derived tables. Check how often they spill to disk via status counters.`,
            r`SHOW GLOBAL STATUS LIKE 'Created_tmp%';

-- OUTPUT (example):
-- +-------------------------+-------+
-- | Variable_name           | Value |
-- +-------------------------+-------+
-- | Created_tmp_disk_tables |     0 |   <- should stay tiny relative to the next one
-- | Created_tmp_files       |     5 |
-- | Created_tmp_tables      |   231 |
-- +-------------------------+-------+`],
        [`<b>Advantages:</b> these mechanisms let MySQL answer any GROUP BY or ORDER BY even without a suitable index; 8.0 uses the in-memory TempTable engine and small sorts stay in memory (sort_buffer_size).`,
            r`-- Filesort in memory is fine for small results; check sort statistics.
SHOW SESSION STATUS LIKE 'Sort%';

-- OUTPUT (example):
-- +-------------------+-------+
-- | Variable_name     | Value |
-- +-------------------+-------+
-- | Sort_merge_passes |     0 |   <- >0 means the sort spilled to disk files
-- | Sort_range        |     0 |
-- | Sort_rows         |     4 |
-- | Sort_scan         |     1 |
-- +-------------------+-------+`],
        [`<b>Disadvantages:</b> large temporary tables spill to disk (slow), filesort over wide rows copies lots of data, both consume memory per connection, and ORDER BY ... LIMIT on unindexed data sorts the whole set first.`,
            r`-- ORDER BY RAND() always needs a temp table + filesort over all rows.
EXPLAIN SELECT id FROM sales2 ORDER BY RAND() LIMIT 1;

-- OUTPUT (Extra):
-- +---------------------------------+
-- | Using temporary; Using filesort |
-- +---------------------------------+`],
        [`<b>Limitations:</b> temp tables with TEXT/BLOB columns go to disk (internal on-disk engine is InnoDB in 8.0.16+); in-memory limit is tmp_table_size / max_heap_table_size (TempTable engine uses temptable_max_ram); mixed ASC/DESC sorts needed a descending index before 8.0.`,
            r`SHOW VARIABLES WHERE Variable_name IN ('tmp_table_size','sort_buffer_size','internal_tmp_mem_storage_engine');

-- OUTPUT (defaults):
-- +---------------------------------+-----------+
-- | Variable_name                   | Value     |
-- +---------------------------------+-----------+
-- | internal_tmp_mem_storage_engine | TempTable |
-- | sort_buffer_size                | 262144    |
-- | tmp_table_size                  | 16777216  |
-- +---------------------------------+-----------+`],
        `
   no suitable index                        suitable index
   rows -> [temp table] -> [sort] -> out    rows already in order -> out
          Using temporary   Using filesort         (nothing extra in Extra)

   fix: index (group_col) or (filter_col, sort_col); select fewer columns
`,
        `Do not panic at every filesort: small in-memory ones are cheap. Worry when Sort_merge_passes or Created_tmp_disk_tables climb, or when it sorts huge sets for a LIMIT. Design composite indexes (equality columns then sort column) and avoid ORDER BY RAND(); prefer keyset pagination over big OFFSET sorts.`
    ),

    'Cost, Cardinality & Slow Queries': dd(
        [`The optimizer is <b>cost-based</b>: it estimates the cost of alternative plans using statistics (<b>cardinality</b>, row counts) and constants for I/O and CPU, then picks the cheapest. The <b>slow query log</b> records statements slower than <code>long_query_time</code>.`,
            r`-- Turn on the slow log at runtime.
SET GLOBAL slow_query_log      = 'ON';
SET GLOBAL long_query_time     = 0.5;                 -- seconds
SET GLOBAL log_queries_not_using_indexes = 'ON';      -- also log scans (noisy)
SHOW VARIABLES LIKE 'slow_query_log_file';

-- OUTPUT (example):
-- +---------------------+-----------------------------+
-- | Variable_name       | Value                       |
-- +---------------------+-----------------------------+
-- | slow_query_log_file | /var/lib/mysql/host-slow.log|
-- +---------------------+-----------------------------+`],
        [`You cannot optimise what you do not measure. Slow logs and the performance schema find the queries that cost the most in total, which is rarely the single slowest one but the moderately slow ones run millions of times.`,
            r`-- Top statements by total time from performance_schema (8.0).
SELECT DIGEST_TEXT, COUNT_STAR AS execs,
       ROUND(SUM_TIMER_WAIT/1e12,2) AS total_s,
       ROUND(AVG_TIMER_WAIT/1e12,4) AS avg_s
FROM performance_schema.events_statements_summary_by_digest
ORDER BY SUM_TIMER_WAIT DESC LIMIT 2;

-- OUTPUT (example):
-- +---------------------------------------+--------+---------+--------+
-- | DIGEST_TEXT                           | execs  | total_s | avg_s  |
-- +---------------------------------------+--------+---------+--------+
-- | SELECT * FROM orders WHERE cust = ?   | 120000 |  310.40 | 0.0026 |
-- | UPDATE stock SET qty = qty - ? ...    |  80000 |  190.12 | 0.0024 |
-- +---------------------------------------+--------+---------+--------+`],
        [`Real workflow: enable slow log, aggregate with <code>pt-query-digest</code> or <code>mysqldumpslow</code>, EXPLAIN the top offenders, add/adjust indexes, retest, repeat. Cost constants live in mysql.server_cost and mysql.engine_cost.`,
            r`SELECT cost_name, cost_value FROM mysql.server_cost;

-- shell:  mysqldumpslow -s t -t 5 /var/lib/mysql/host-slow.log     (top 5 by total time)

-- OUTPUT (defaults are NULL = built-in constants):
-- +----------------------------+------------+
-- | cost_name                  | cost_value |
-- +----------------------------+------------+
-- | disk_temptable_create_cost | NULL       |
-- | row_evaluate_cost          | NULL       |
-- | key_compare_cost           | NULL       |
-- +----------------------------+------------+`],
        [`<b>Advantages:</b> cost-based planning adapts to data size and distribution, picks join order and indexes automatically, and histograms plus optimizer trace let you see why a plan was chosen.`,
            r`-- Ask the optimizer why: the trace shows considered plans and costs.
SET optimizer_trace = 'enabled=on';
SELECT * FROM sales2 WHERE region = 'N';
SELECT JSON_EXTRACT(trace, '$.steps[0].join_preparation.select#') AS sel
FROM information_schema.optimizer_trace;
SET optimizer_trace = 'enabled=off';

-- OUTPUT (example):
-- +---------+
-- | sel     |
-- +---------+
-- | 1       |
-- +---------+`],
        [`<b>Disadvantages:</b> decisions are only as good as the statistics; sampled cardinality, correlated columns and data skew cause misestimates; a plan can flip after ANALYZE or an upgrade, causing sudden regressions.`,
            r`-- Correlated columns (city and state) are assumed independent -> row count underestimated.
-- Remedies: histograms, composite indexes, optimizer hints.
EXPLAIN SELECT /*+ INDEX(cust idx_city) */ * FROM cust WHERE city = 'Pune';

-- OUTPUT (partial):
-- +------+----------+
-- | type | key      |
-- +------+----------+
-- | ref  | idx_city |
-- +------+----------+`],
        [`<b>Limitations:</b> MySQL has no persistent plan cache or plan guides like some databases, so plan stability is controlled with hints and statistics; the slow log reflects wall time (including lock waits), and long_query_time only logs after completion.`,
            r`-- Slow log entry shows rows examined vs sent: a high ratio = missing index.
-- # Query_time: 2.31  Lock_time: 0.00  Rows_sent: 10  Rows_examined: 1850000
-- SELECT * FROM orders WHERE note LIKE '%late%';

SELECT 1850000/10 AS examined_per_row_sent;

-- OUTPUT:
-- +-----------------------+
-- | examined_per_row_sent |
-- +-----------------------+
-- |          185000.0000  |
-- +-----------------------+`],
        `
   query -> optimizer: for each candidate plan  cost = IO + CPU(rows x row_cost)
                         |
          statistics (cardinality, histograms) feed the estimates
                         v
                    cheapest plan -> executor -> slow log if time > long_query_time
                                                      |
                                    digest tools -> top offenders -> fix -> retest
`,
        `Manage performance as a loop: measure (slow log, performance_schema), explain, change one thing, re-measure. Keep statistics fresh, add histograms for skew, and use optimizer hints sparingly to pin plans that matter. Track query digests over releases to catch regressions before users do.`
    ),
};
