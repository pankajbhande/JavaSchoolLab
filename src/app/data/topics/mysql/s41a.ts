// Module 41 (MySQL Performance Tuning).
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s41a: Record<string, DeepDive> = {
    'Slow Query Log': dd(
        [`The <b>slow query log</b> records every statement that runs longer than <code>long_query_time</code> seconds (default 10). It is the first tool for finding which queries hurt, because it records real workload, not guesses.`,
            r`-- Turn the slow log on at runtime (no restart); persists only if also in my.cnf
SET GLOBAL slow_query_log      = 'ON';
SET GLOBAL long_query_time     = 0.5;      -- seconds; applies to NEW connections
SET GLOBAL log_output          = 'FILE';   -- or TABLE (mysql.slow_log)
SHOW VARIABLES LIKE 'slow_query_log_file';

-- OUTPUT:
-- Variable_name        | Value
-- slow_query_log_file  | /var/lib/mysql/db01-slow.log (example)`],
        [`Without the log you tune blindly. A page that is "slow" may come from one query in a thousand; the log ranks them by total time so you fix the biggest offender first.`,
            r`-- Typical entry in the file (what you read with mysqldumpslow / pt-query-digest)
-- # Time: 2026-10-06T10:12:44.100000Z
-- # Query_time: 2.314  Lock_time: 0.000  Rows_sent: 20  Rows_examined: 1840233
-- SELECT * FROM orders WHERE customer_email = 'a@b.com' ORDER BY created_at DESC LIMIT 20;
-- Rows_examined 1.8M vs Rows_sent 20  => missing index on customer_email.

SHOW GLOBAL VARIABLES LIKE 'long_query_time';

-- OUTPUT:
-- Variable_name   | Value
-- long_query_time | 0.500000`],
        [`In production teams run with <code>long_query_time</code> around 0.5-1 s, enable <code>log_queries_not_using_indexes</code> only temporarily, and rotate the file; pt-query-digest then groups by fingerprint.`,
            r`SET GLOBAL log_queries_not_using_indexes = 'ON';      -- noisy: use for a short window
SET GLOBAL min_examined_row_limit = 1000;               -- skip tiny scans
SET GLOBAL log_slow_extra = 'ON';                       -- 8.0.14+: more fields per entry
-- shell: mysqldumpslow -s t -t 5 /var/lib/mysql/db01-slow.log   (top 5 by total time)
SELECT @@log_queries_not_using_indexes AS no_idx, @@min_examined_row_limit AS min_rows;

-- OUTPUT:
-- no_idx | min_rows
--      1 |     1000`],
        [`<b>Advantages:</b> real workload evidence, tiny overhead when threshold is sane, works on any version, can be written to a table for SQL analysis.`,
            r`-- Log to a table and query it with SQL itself
SET GLOBAL log_output = 'TABLE';
SELECT start_time, query_time, rows_examined, LEFT(sql_text, 40) AS q
FROM   mysql.slow_log
ORDER  BY query_time DESC
LIMIT  2;

-- OUTPUT: (example)
-- start_time          | query_time | rows_examined | q
-- 2026-10-06 10:12:44 | 00:00:02   |       1840233 | SELECT * FROM orders WHERE customer_ema
-- 2026-10-06 10:13:01 | 00:00:01   |        950000 | SELECT COUNT(*) FROM events WHERE type=`],
        [`<b>Disadvantages:</b> it logs only after completion, so a query that never finishes is invisible; with threshold 0 the file grows fast and the disk I/O itself slows the server.`,
            r`-- Capturing everything for 60 seconds, then restoring: a sampling pattern
SET GLOBAL long_query_time = 0;      -- log ALL statements (heavy!)
DO SLEEP(60);
SET GLOBAL long_query_time = 1;      -- back to normal
SELECT @@global.long_query_time AS t;

-- OUTPUT:
-- t
-- 1.000000`],
        [`<b>Limitations:</b> it shows duration, not why; it cannot tell waits (locks, I/O) apart without extra fields; fast but extremely frequent queries (0.2 ms x millions) never reach the threshold.`,
            r`-- A 0.3 ms query run 5 million times/hour costs 25 minutes of server time,
-- yet never appears with long_query_time = 1. Use Performance Schema digests for that.
SELECT DIGEST_TEXT, COUNT_STAR, ROUND(SUM_TIMER_WAIT/1e12,1) AS total_s
FROM   performance_schema.events_statements_summary_by_digest
ORDER  BY SUM_TIMER_WAIT DESC LIMIT 1;

-- OUTPUT: (example)
-- DIGEST_TEXT                          | COUNT_STAR | total_s
-- SELECT * FROM users WHERE id = ?     |    5000000 |  1500.0`],
        `
   client ──► MySQL server ──► execute statement
                                   │ finished, time > long_query_time ?
                              ┌────┴─────┐
                              ▼ yes      ▼ no
                      slow log (FILE/TABLE)   (nothing)
                              │
                              ▼
                  mysqldumpslow / pt-query-digest ──► ranked list ──► EXPLAIN ──► fix
`,
        `Use the slow log for outliers and Performance Schema digests for aggregate cost; together they cover both "rare and slow" and "fast but constant". Ship logs to a central store, keep sampling thresholds in config management, and watch disk usage on the log volume.`
    ),

    'Performance Schema & sys Schema': dd(
        [`<b>Performance Schema</b> is an in-memory instrumentation engine that records statements, waits, stages, locks and memory use. The <b>sys schema</b> is a set of readable views on top of it, so you rarely query the raw tables.`,
            r`SELECT @@performance_schema AS enabled;
SELECT query, exec_count, total_latency
FROM   sys.statement_analysis
LIMIT  2;

-- OUTPUT: (example)
-- enabled
-- 1
-- query                              | exec_count | total_latency
-- SELECT * FROM orders WHERE ...     |      15200 | 4.12 m
-- INSERT INTO events (...) VALUES... |     980000 | 2.51 m`],
        [`The slow log answers "which query"; Performance Schema answers "where did the time go" - lock waits, file I/O, temp tables, full scans - without external tools.`,
            r`-- Which tables are read the most, and how slowly?
SELECT object_schema, object_name, count_read, ROUND(sum_timer_read/1e12,2) AS read_s
FROM   performance_schema.table_io_waits_summary_by_table
WHERE  object_schema = 'shop'
ORDER  BY sum_timer_read DESC LIMIT 2;

-- OUTPUT: (example)
-- object_schema | object_name | count_read | read_s
-- shop          | orders      |   12400000 |  93.40
-- shop          | order_items |    8100000 |  41.07`],
        [`DBAs use sys views daily: statements doing full scans, unused indexes, who holds locks, which host consumes the most connections.`,
            r`SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'shop' LIMIT 2;
SELECT * FROM sys.statements_with_full_table_scans LIMIT 1;

-- OUTPUT: (example)
-- object_schema | object_name | index_name
-- shop          | orders      | idx_orders_legacy_flag
-- shop          | customers   | idx_cust_fax
-- query                         | exec_count | no_index_used_count
-- SELECT * FROM audit WHERE ... |        310 |                 310`],
        [`<b>Advantages:</b> built in, low overhead (about 5-10%), SQL-queryable, covers far more than the slow log, and sys gives human units (ms, MB).`,
            r`-- Who is blocking whom right now?  (sys view over data_locks / data_lock_waits)
SELECT waiting_pid, waiting_query, blocking_pid, blocking_query
FROM   sys.innodb_lock_waits;

-- OUTPUT: (example)
-- waiting_pid | waiting_query                    | blocking_pid | blocking_query
--          42 | UPDATE acct SET bal=bal-5 WHERE..|           37 | NULL (idle in transaction)`],
        [`<b>Disadvantages:</b> consumers use memory, data resets on restart, some instruments are off by default, and the raw table names are hard to remember.`,
            r`-- Some consumers/instruments are disabled by default: enable only what you need
UPDATE performance_schema.setup_consumers
SET    enabled = 'YES'
WHERE  name = 'events_statements_history_long';

SELECT name, enabled FROM performance_schema.setup_consumers
WHERE  name LIKE 'events_statements_history%';

-- OUTPUT:
-- name                            | enabled
-- events_statements_history       | YES
-- events_statements_history_long  | YES`],
        [`<b>Limitations:</b> it is not persistent (restart clears it), the digest table keeps a bounded number of distinct statements (performance_schema_digests_size), and it cannot be changed from a read-only account.`,
            r`SHOW GLOBAL STATUS LIKE 'Performance_schema_digest_lost';
SELECT @@performance_schema_digests_size AS digest_slots;

-- OUTPUT: (example)
-- Variable_name                 | Value
-- Performance_schema_digest_lost| 0
-- digest_slots
-- 10000`],
        `
   server code ──► instruments (setup_instruments)
                        │ events
                        ▼
            performance_schema.* tables  (in memory, raw)
                        │ views
                        ▼
                   sys schema  (readable: latency, rows, MB)
                        │
                        ▼
          DBA queries / exporters (mysqld_exporter, PMM)
`,
        `Keep Performance Schema on in production; the cost is far lower than blind debugging. Export digests to a time-series store so you see regressions after deploys, and never grant broad access to it because query text can contain sensitive literals.`
    ),

    'Index & Query Tuning': dd(
        [`<b>Index and query tuning</b> means making the optimizer read fewer rows: add the right indexes, write predicates that can use them, and verify the plan with <code>EXPLAIN</code>.`,
            r`CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_id INT NOT NULL,
  status VARCHAR(10) NOT NULL,
  created_at DATETIME NOT NULL
);
EXPLAIN SELECT * FROM orders WHERE customer_id = 7;

-- OUTPUT: (example, empty table stats)
-- id | select_type | table  | type | possible_keys | key  | rows | Extra
--  1 | SIMPLE      | orders | ALL  | NULL          | NULL |    1 | Using where`],
        [`A full scan is fine for 100 rows and a disaster for 100 million. Indexes turn O(n) scans into O(log n) lookups, and tuning stops one query from starving every other.`,
            r`ALTER TABLE orders ADD INDEX idx_cust_created (customer_id, created_at);
EXPLAIN SELECT id FROM orders
WHERE  customer_id = 7 AND created_at >= '2026-01-01'
ORDER  BY created_at;

-- OUTPUT: (example)
-- type  | key              | rows | Extra
-- range | idx_cust_created |   40 | Using where; Using index
-- no filesort: index order already matches ORDER BY`],
        [`Typical wins in real projects: composite index matching WHERE+ORDER BY, covering index for hot reads, removing functions on indexed columns, replacing OFFSET paging with keyset.`,
            r`-- BAD: function on the column defeats the index
EXPLAIN SELECT id FROM orders WHERE DATE(created_at) = '2026-10-01';
-- GOOD: sargable range
EXPLAIN SELECT id FROM orders
WHERE created_at >= '2026-10-01' AND created_at < '2026-10-02';

-- OUTPUT: (example)
-- BAD : type=index  key=idx_cust_created rows=2400000  (scans whole index)
-- GOOD: type=range  key=idx_created      rows=1800`],
        [`<b>Advantages:</b> orders-of-magnitude speedups with no hardware cost; EXPLAIN ANALYZE (8.0.18+) shows actual rows and time per step.`,
            r`EXPLAIN ANALYZE
SELECT customer_id, COUNT(*) FROM orders
WHERE  created_at >= '2026-10-01' GROUP BY customer_id;

-- OUTPUT: (example)
-- -> Group aggregate: count(0)  (cost=420 rows=300) (actual time=0.21..3.4 rows=250 loops=1)
--     -> Index range scan on orders using idx_created ... (actual time=0.1..2.9 rows=1800 loops=1)`],
        [`<b>Disadvantages:</b> every extra index slows INSERT/UPDATE/DELETE and uses disk and buffer pool; too many indexes confuse the optimizer and make maintenance heavy.`,
            r`-- Find indexes that cost writes but are never read
SELECT object_name, index_name
FROM   sys.schema_unused_indexes
WHERE  object_schema = 'shop';

-- OUTPUT: (example)
-- object_name | index_name
-- orders      | idx_status_legacy`],
        [`<b>Limitations:</b> low-selectivity columns (status with 3 values) rarely benefit alone, statistics can be stale, and the optimizer may ignore an index when it expects to read more than about 20-30% of the table.`,
            r`ANALYZE TABLE orders;                       -- refresh statistics
EXPLAIN SELECT * FROM orders WHERE status = 'PAID';   -- 90% rows are PAID
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- OUTPUT: (example)
-- EXPLAIN: type=ALL key=NULL      (full scan is cheaper than 90% random lookups)
-- status | COUNT(*)
-- PAID   | 900000
-- NEW    |  80000
-- VOID   |  20000`],
        `
   Query ──► Optimizer ──► candidate plans ──► pick lowest cost
                 │ uses
                 ▼
        index stats (cardinality)   <──  ANALYZE TABLE
                 │
   rows read:  full scan 1,000,000  vs  index range 40
                 │
              EXPLAIN / EXPLAIN ANALYZE to verify
`,
        `Tune from evidence: slow log or digest -> EXPLAIN ANALYZE -> smallest index change -> re-measure. Prefer fewer wide composite indexes designed around real query shapes, use invisible indexes (8.0) to test drops safely, and review index set after each feature release.`
    ),

    'Buffer Pool & Memory Tuning': dd(
        [`The <b>InnoDB buffer pool</b> caches table and index pages in RAM. Reading a cached page costs microseconds; reading from disk costs milliseconds, so buffer pool size is the biggest memory lever.`,
            r`SELECT @@innodb_buffer_pool_size/1024/1024/1024 AS pool_gb,
       @@innodb_buffer_pool_instances       AS instances;

-- OUTPUT: (example)
-- pool_gb | instances
-- 12.0000 | 8`],
        [`If the working set does not fit in memory, every query becomes a disk read. Right-sizing the pool (and per-connection buffers) avoids both I/O storms and swapping.`,
            r`-- Hit ratio: reads that had to go to disk vs total read requests
SHOW GLOBAL STATUS WHERE Variable_name IN
 ('Innodb_buffer_pool_reads','Innodb_buffer_pool_read_requests');

-- OUTPUT: (example)
-- Variable_name                     | Value
-- Innodb_buffer_pool_reads          | 1200000      (disk reads)
-- Innodb_buffer_pool_read_requests  | 480000000    (logical reads)
-- hit ratio = 1 - 1.2M/480M = 99.75%`],
        [`Rule of thumb on a dedicated server: 60-75% of RAM for the pool; resize online in chunks since 5.7; warm it after restart with the dump/load feature.`,
            r`SET GLOBAL innodb_buffer_pool_size = 16 * 1024 * 1024 * 1024;   -- online resize
SELECT @@innodb_buffer_pool_dump_at_shutdown AS dump,
       @@innodb_buffer_pool_load_at_startup  AS load_;
SHOW STATUS LIKE 'Innodb_buffer_pool_resize_status';

-- OUTPUT: (example)
-- dump | load_
--    1 |     1
-- Innodb_buffer_pool_resize_status | Completed resizing buffer pool at 261006 10:20:11.`],
        [`<b>Advantages:</b> huge read speedup, absorbs write bursts (dirty pages flushed later), online resize, LRU with midpoint insertion resists scan pollution.`,
            r`SELECT pool_id, pages_made_young, pages_not_made_young
FROM   information_schema.INNODB_BUFFER_POOL_STATS LIMIT 2;

-- OUTPUT: (example)
-- pool_id | pages_made_young | pages_not_made_young
--       0 |            90210 |              4510222`],
        [`<b>Disadvantages:</b> memory is shared with the OS and per-connection buffers, so oversizing causes swapping; cold start after restart is slow without warm-up.`,
            r`-- Worst-case memory = pool + connections x per-thread buffers
SELECT ROUND(@@innodb_buffer_pool_size/1073741824,1) AS pool_gb,
       @@max_connections AS conns,
       ROUND((@@sort_buffer_size + @@join_buffer_size + @@read_buffer_size)/1048576,1) AS per_conn_mb;

-- OUTPUT: (example)
-- pool_gb | conns | per_conn_mb
--    12.0 |   500 |         3.5     (500 x 3.5 MB = 1.7 GB extra at worst)`],
        [`<b>Limitations:</b> it only helps reads/writes of data that fit; a huge scan can evict useful pages; flushing speed depends on disk capacity (innodb_io_capacity), not pool size.`,
            r`SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_pages_dirty';
SELECT @@innodb_io_capacity AS io_cap, @@innodb_max_dirty_pages_pct AS max_dirty;

-- OUTPUT: (example)
-- Innodb_buffer_pool_pages_dirty | 18400
-- io_cap | max_dirty
--   2000 |     90.00`],
        `
   RAM
   ┌───────────────────────────────────────────┐
   │ OS + file cache │ per-conn buffers │ BUFFER POOL (60-75%) │
   └───────────────────────────────────────────┘
                                │
              read hit ◄────────┤────────► miss ──► disk (ms)
              (microseconds)    │
                         young list | midpoint | old list  (LRU)
`,
        `Size to the working set, not to total data. Monitor hit ratio and page-read rate rather than a fixed percentage, keep swap off for the database host, and set io_capacity to the real IOPS of the storage so flushing keeps up with writes.`
    ),

    'Connections, Threads & Disk I/O': dd(
        [`Each client connection uses a server thread and memory; the disk subsystem handles page flushes and redo/binlog writes. Tuning these three limits how much concurrency the server sustains.`,
            r`SHOW VARIABLES WHERE Variable_name IN ('max_connections','thread_cache_size','innodb_flush_log_at_trx_commit');

-- OUTPUT: (example)
-- Variable_name                  | Value
-- max_connections                | 500
-- thread_cache_size              | 64
-- innodb_flush_log_at_trx_commit | 1`],
        [`Too many connections cause memory exhaustion and context-switch thrash; too few cause "Too many connections" errors. Disk settings decide the trade-off between durability and commit speed.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN
 ('Threads_connected','Threads_running','Max_used_connections','Connection_errors_max_connections');

-- OUTPUT: (example)
-- Threads_connected | 180
-- Threads_running   | 12
-- Max_used_connections | 410
-- Connection_errors_max_connections | 0`],
        [`Real servers keep Threads_running small (about 2x CPU cores), use app-side pooling instead of thousands of raw connections, and use NVMe plus <code>innodb_flush_method=O_DIRECT</code>.`,
            r`-- Durability knob: 1 = fsync every commit (safe), 2 = fsync per second (OS crash may lose 1s)
SET GLOBAL innodb_flush_log_at_trx_commit = 1;
SET GLOBAL sync_binlog = 1;
SELECT @@innodb_flush_method AS method, @@innodb_flush_log_at_trx_commit AS flush;

-- OUTPUT: (example)
-- method   | flush
-- O_DIRECT |     1`],
        [`<b>Advantages:</b> thread cache avoids thread creation cost; configurable durability lets analytics nodes trade safety for speed; read/write I/O threads parallelise disk work.`,
            r`SHOW GLOBAL STATUS LIKE 'Threads_created';
SHOW GLOBAL STATUS LIKE 'Connections';

-- OUTPUT: (example)
-- Threads_created | 612
-- Connections     | 2480000
-- created/connections is tiny: thread cache is working`],
        [`<b>Disadvantages:</b> relaxed fsync loses committed data on crash; a high max_connections hides pooling problems and lets a traffic spike overload the CPU.`,
            r`-- Reserved admin slot: SUPER/CONNECTION_ADMIN users can connect at max_connections + 1
SELECT @@max_connections AS max_c, @@admin_address AS admin_addr;

-- OUTPUT: (example)
-- max_c | admin_addr
--   500 | NULL`],
        [`<b>Limitations:</b> storage IOPS is a hard ceiling; doublewrite buffer and binlog add write amplification; each connection still costs roughly several MB.`,
            r`SHOW GLOBAL STATUS LIKE 'Innodb_os_log_fsyncs';
SHOW GLOBAL STATUS LIKE 'Innodb_data_fsyncs';

-- OUTPUT: (example)
-- Innodb_os_log_fsyncs | 8420011
-- Innodb_data_fsyncs   | 3011220`],
        `
   App pool (20 conns) ─┐
   App pool (20 conns) ─┼─► MySQL: thread per conn ─► InnoDB
   App pool (20 conns) ─┘          │ thread cache          │
                                   ▼                       ▼
                         Threads_running ~ 2 x cores   redo log ─ fsync
                                                        data pages ─ background flush
`,
        `Cap connections with pooling (HikariCP, ProxySQL), keep max_connections modest, and benchmark fsync latency of the storage. Decide durability per tier: strict (1/1) for ledgers, relaxed only for rebuildable data.`
    ),

    'SHOW PROCESSLIST & SHOW ENGINE INNODB STATUS': dd(
        [`<code>SHOW PROCESSLIST</code> lists every connection and what it is doing now. <code>SHOW ENGINE INNODB STATUS</code> prints an InnoDB snapshot: latest deadlock, transactions, semaphores, buffer pool and log state.`,
            r`SHOW FULL PROCESSLIST;

-- OUTPUT: (example)
-- Id | User | Host            | db   | Command | Time | State     | Info
-- 37 | app  | 10.0.0.5:51022  | shop | Sleep   |   45 |           | NULL
-- 42 | app  | 10.0.0.6:40110  | shop | Query   |   31 | updating  | UPDATE acct SET bal=bal-5 WHERE id=1
-- 51 | root | localhost       | NULL | Query   |    0 | executing | SHOW FULL PROCESSLIST`],
        [`When the site hangs you need to see right now who is running, who waits, and who holds locks, before you can fix anything.`,
            r`-- Same data, but filterable with SQL
SELECT id, user, time, state, LEFT(info,50) AS q
FROM   information_schema.PROCESSLIST
WHERE  command <> 'Sleep' AND time > 5
ORDER  BY time DESC;

-- OUTPUT: (example)
-- id | user | time | state    | q
-- 42 | app  |   31 | updating | UPDATE acct SET bal=bal-5 WHERE id=1`],
        [`On-call engineers use it to kill runaway queries and to spot a long idle-in-transaction connection blocking others.`,
            r`SELECT trx_id, trx_started, trx_mysql_thread_id AS thread, trx_state
FROM   information_schema.INNODB_TRX
ORDER  BY trx_started LIMIT 2;
KILL QUERY 42;       -- stops the statement, keeps the connection
-- KILL 37;          -- closes the whole connection and rolls back its transaction

-- OUTPUT: (example)
-- trx_id | trx_started         | thread | trx_state
-- 90113  | 2026-10-06 09:58:01 |     37 | RUNNING   (idle, holds locks)
-- Query OK`],
        [`<b>Advantages:</b> instant, no setup, shows live state; INNODB STATUS exposes the exact statements of the last deadlock.`,
            r`SHOW ENGINE INNODB STATUS\G
-- Look for sections:  LATEST DETECTED DEADLOCK, TRANSACTIONS, BUFFER POOL AND MEMORY

-- OUTPUT: (excerpt, example)
-- LATEST DETECTED DEADLOCK
-- *** (1) TRANSACTION: ... UPDATE acct SET bal=bal-5 WHERE id=1
-- *** (2) TRANSACTION: ... UPDATE acct SET bal=bal+5 WHERE id=2
-- *** WE ROLL BACK TRANSACTION (2)`],
        [`<b>Disadvantages:</b> it is a point-in-time snapshot with no history; the INNODB STATUS output is truncated to about 1 MB and is hard to parse.`,
            r`-- Poor man's history: sample it yourself every second
-- shell: while true; do mysql -e "SHOW FULL PROCESSLIST" >> pl.log; sleep 1; done
SELECT COUNT(*) AS active
FROM   information_schema.PROCESSLIST WHERE command <> 'Sleep';

-- OUTPUT: (example)
-- active
-- 12`],
        [`<b>Limitations:</b> you need the PROCESS privilege to see other users; Info is truncated to 100 chars without FULL; the deadlock section shows only the latest deadlock.`,
            r`-- Log every deadlock, not only the latest
SET GLOBAL innodb_print_all_deadlocks = ON;
-- Prefer Performance Schema (no mutex) for live thread data:
SELECT thread_id, processlist_id, processlist_command
FROM   performance_schema.threads WHERE type = 'FOREIGN' LIMIT 2;

-- OUTPUT: (example)
-- thread_id | processlist_id | processlist_command
--        62 |             37 | Sleep
--        67 |             42 | Query`],
        `
   SHOW PROCESSLIST ──► who / what / how long ──► KILL QUERY id
   INNODB_TRX       ──► open transactions
   data_lock_waits  ──► waiter ──blocked by──► holder
   INNODB STATUS    ──► LATEST DETECTED DEADLOCK ──► fix lock order
`,
        `Treat these as triage tools, not monitoring. Automate sampling into your metrics system, alert on transactions older than a threshold, and set innodb_lock_wait_timeout plus app-side timeouts so one stuck session cannot take the system down.`
    )
};
