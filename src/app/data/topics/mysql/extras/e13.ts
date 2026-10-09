// Modules 41-43 (Performance Tuning, Architecture, Backend Applications) extras.
import { x, r, type Extra } from './extra';

export const e13: Record<string, Extra> = {
    'Slow Query Log': x(
        ['The slow query log records statements that run longer than <code>long_query_time</code>, so you can find and fix them.',
            'Enable: <code>SET GLOBAL slow_query_log = ON; SET GLOBAL long_query_time = 1;</code>.',
            'Summarise it with <code>mysqldumpslow</code> or <code>pt-query-digest</code>.'],
        ['Useful extras: <code>log_queries_not_using_indexes</code>, <code>log_slow_extra</code> (8.0.14+), <code>min_examined_row_limit</code>.',
            'Each entry shows Query_time, Lock_time, Rows_sent and Rows_examined.',
            'Rotate the file to avoid large logs; log to FILE rather than TABLE for performance.'],
        ['Lower <code>long_query_time</code> temporarily (0.1 s or 0) on a sample to capture the real workload, then raise it.',
            'Use digests (Performance Schema) for continuous aggregated view and the slow log for samples with actual parameters.',
            'Correlate with deployments: new slow queries often follow a release.'],
        [['F', 'What is the slow query log?', 'A log of queries that take longer than a threshold.'],
            ['F', 'Which variable sets the threshold?', '<code>long_query_time</code>.'],
            ['M', 'What do Rows_sent and Rows_examined tell you?', 'A large Rows_examined versus Rows_sent suggests a missing or unusable index.'],
            ['M', 'How do you summarize the log?', 'mysqldumpslow or Percona pt-query-digest grouping similar queries.'],
            ['S', 'How do you capture representative workload safely?', 'Temporarily set a low long_query_time or sample, on a short window, and turn it back to avoid overhead.'],
            ['S', 'Why use both slow log and Performance Schema?', 'Performance Schema gives always-on aggregates; the slow log gives concrete statements with parameters for diagnosis.']],
        [['Turn it on.',
            r`SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 0.5;
SET GLOBAL log_queries_not_using_indexes = ON;
SHOW VARIABLES LIKE 'slow_query_log_file';

-- OUTPUT:
-- Variable_name       | Value
-- slow_query_log_file | /var/lib/mysql/db-slow.log`],
            ['Example log entry.',
                r`-- # Time: 2026-05-01T10:15:22
-- # Query_time: 2.314  Lock_time: 0.000  Rows_sent: 20  Rows_examined: 1204331
-- SELECT * FROM orders WHERE customer_note LIKE '%refund%' ORDER BY id DESC LIMIT 20;

-- OUTPUT:
-- (2.3 s, 1.2M rows examined to return 20 rows: needs an index or fulltext)`]],
        [['Summarize top offenders.',
            r`mysqldumpslow -s t -t 5 /var/lib/mysql/db-slow.log

-- OUTPUT: (example)
-- Count: 412  Time=2.31s (951s)  Lock=0.00s  Rows=20.0 (8240)
--   SELECT * FROM orders WHERE customer_note LIKE 'S' ORDER BY id DESC LIMIT N`],
            ['Rotate the log.',
                r`FLUSH SLOW LOGS;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Performance Schema & sys Schema': x(
        ['Performance Schema is MySQL’s built-in instrumentation that records what the server is doing. The sys schema provides readable views on top of it.',
            'Ask questions like "which queries are slowest?" or "which indexes are unused?" with simple SELECTs on sys.',
            'Examples: <code>sys.statement_analysis</code>, <code>sys.schema_unused_indexes</code>, <code>sys.innodb_lock_waits</code>.'],
        ['Performance Schema tables hold statement digests, waits, stages, memory and lock data with small overhead.',
            'Instruments and consumers can be enabled or disabled to balance detail and cost.',
            'Counters reset on restart; export metrics regularly.'],
        ['Build dashboards from digests (calls, total time, rows examined, no-index-used) and alert on regressions.',
            'Use <code>events_statements_history_long</code> or the slow log for concrete examples of a digest.',
            'Watch memory instrumentation to find leaks or large allocations.'],
        [['F', 'What is the Performance Schema?', 'A built-in monitoring feature that records server activity and performance data.'],
            ['F', 'What is the sys schema?', 'A set of helper views and procedures that make Performance Schema data easy to read.'],
            ['M', 'How do you find the slowest queries?', 'Query <code>sys.statement_analysis</code> or the digest summary table ordered by total time.'],
            ['M', 'How do you find unused indexes?', '<code>SELECT * FROM sys.schema_unused_indexes;</code>'],
            ['S', 'What is the overhead of Performance Schema?', 'Typically a few percent; tune instruments, and enable only the consumers you need on very busy systems.'],
            ['S', 'How would you build a query regression alert?', 'Snapshot digest stats periodically, compare average latency and rows examined per digest, alert on increases after deploys.']],
        [['Top statements.',
            r`SELECT query, exec_count, total_latency, avg_latency, rows_examined_avg FROM sys.statement_analysis ORDER BY total_latency DESC LIMIT 2;

-- OUTPUT: (example)
-- query                           | exec_count | total_latency | avg_latency | rows_examined_avg
-- SELECT * FROM orders WHERE ...  |     412000 | 15.2 min      | 2.21 ms     | 1840
-- UPDATE inventory SET qty = ...  |     980000 | 9.8 min       | 0.60 ms     |    1`],
            ['Unused and redundant indexes.',
                r`SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'shop';

-- OUTPUT: (example)
-- object_schema | object_name | index_name
-- shop          | orders      | idx_old_status`]],
        [['Statements with full table scans.',
            r`SELECT query, exec_count, no_index_used_count FROM sys.statements_with_full_table_scans LIMIT 2;

-- OUTPUT: (example)
-- query                                 | exec_count | no_index_used_count
-- SELECT * FROM events WHERE note LIKE? |       5200 |                5200`],
            ['Memory usage by area.',
                r`SELECT event_name, current_alloc FROM sys.memory_global_by_current_bytes LIMIT 3;

-- OUTPUT: (example)
-- event_name                    | current_alloc
-- memory/innodb/buf_buf_pool    | 8.00 GiB
-- memory/sql/thd::main_mem_root | 112.00 MiB`]]
    ),

    'Index & Query Tuning': x(
        ['Tuning means making slow queries faster, mostly with better indexes and better SQL. Start from the slowest or most frequent queries.',
            'Workflow: find the query, run EXPLAIN, change the index or SQL, measure again.',
            'Typical wins: add a composite index, avoid functions on indexed columns, select fewer columns.'],
        ['Checklist: sargable WHERE, correct composite order, covering index for hot reads, avoid SELECT *, limit result size, paginate with keyset.',
            'Rewrite correlated subqueries, avoid OR across columns, avoid implicit type conversions.',
            'Check cardinality and update statistics (<code>ANALYZE TABLE</code>).'],
        ['Validate with production-sized data; plans differ at scale.',
            'Balance read gains with write cost: every index slows inserts/updates.',
            'Prevent regressions with query review, plan snapshots, load tests and dashboards for top queries.'],
        [['F', 'How do you start tuning a slow query?', 'Run EXPLAIN (or EXPLAIN ANALYZE) and look for full scans, filesort and bad row estimates.'],
            ['F', 'Common first fix?', 'Add an index on the filtered or joined column.'],
            ['M', 'Name three query rewrites that help.', 'Make predicates sargable, replace correlated subqueries with joins, and select only needed columns.'],
            ['M', 'How do you order composite index columns?', 'Equality columns first, then range, then ordering columns.'],
            ['S', 'How do you stop tuning from harming writes?', 'Review index counts per table, measure write throughput, drop unused/duplicate indexes.'],
            ['S', 'How do you make tuning repeatable?', 'Record baseline plans/latency, test changes on a production-like dataset, and monitor the digest after release.']],
        [['Before and after.',
            r`EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 7 AND status = 'NEW' ORDER BY created_at DESC LIMIT 20;
-- before: Table scan on orders (actual time=0.2..410 rows=100000) + Sort
ALTER TABLE orders ADD INDEX idx_cust_status_created (customer_id, status, created_at);
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 7 AND status = 'NEW' ORDER BY created_at DESC LIMIT 20;

-- OUTPUT: (after)
-- -> Index lookup on orders using idx_cust_status_created (customer_id=7, status='NEW') (reverse) (actual time=0.05..0.2 rows=20)`],
            ['Remove a function on the column.',
                r`-- slow
SELECT id FROM orders WHERE DATE(created_at) = '2026-05-01';
-- fast
SELECT id FROM orders WHERE created_at >= '2026-05-01' AND created_at < '2026-05-02';

-- OUTPUT:
-- same rows, range scan instead of full scan`]],
        [['Update statistics.',
            r`ANALYZE TABLE orders;

-- OUTPUT:
-- Table       | Op      | Msg_type | Msg_text
-- shop.orders | analyze | status   | OK`],
            ['Find duplicate indexes.',
                r`SELECT table_name, redundant_index_name, dominant_index_name FROM sys.schema_redundant_indexes WHERE table_schema = 'shop';

-- OUTPUT: (example)
-- table_name | redundant_index_name | dominant_index_name
-- orders     | idx_customer         | idx_cust_status_created`]]
    ),

    'Buffer Pool & Memory Tuning': x(
        ['Memory tuning decides how much RAM goes to the InnoDB buffer pool, connection buffers and temp tables.',
            'The biggest lever is <code>innodb_buffer_pool_size</code>.',
            'Do not set global buffers so large that the server swaps.'],
        ['Per-connection buffers (<code>sort_buffer_size</code>, <code>join_buffer_size</code>, <code>read_buffer_size</code>) multiply by connections; keep them modest and raise per session only for heavy reports.',
            'Temp tables: <code>tmp_table_size</code>, <code>max_heap_table_size</code>.',
            'Estimate worst-case memory: buffer pool + max_connections x per-connection memory + OS.'],
        ['Use Performance Schema memory instrumentation (<code>sys.memory_global_by_current_bytes</code>) to see actual usage.',
            'On containers, set limits and make mysqld aware (cgroups) to avoid OOM kills.',
            'Disable swap or set <code>vm.swappiness</code> low on database hosts; use huge pages cautiously.'],
        [['F', 'Which memory setting matters most in InnoDB?', '<code>innodb_buffer_pool_size</code>.'],
            ['F', 'What happens if MySQL uses too much RAM?', 'The OS swaps or the process is killed, causing severe slowdown or downtime.'],
            ['M', 'Why not set sort_buffer_size very high globally?', 'It is allocated per connection/operation, so many connections can consume huge memory.'],
            ['M', 'How do you see actual memory use?', 'Query sys.memory_global_by_current_bytes and monitor OS RSS.'],
            ['S', 'How do you plan memory for a server?', 'Buffer pool for the working set, plus connections x per-session memory, temp tables and OS needs, with headroom and OOM protection.'],
            ['S', 'How do containers affect it?', 'Cgroup limits can kill mysqld; set the buffer pool below the container limit with margin and monitor RSS.']],
        [['Worst-case memory estimate.',
            r`SELECT ROUND((@@innodb_buffer_pool_size + @@max_connections * (@@sort_buffer_size + @@join_buffer_size + @@read_buffer_size + @@read_rnd_buffer_size)) / 1024 / 1024 / 1024, 1) AS worst_case_gb;

-- OUTPUT: (example)
-- worst_case_gb
-- 14.3`],
            ['Per-session boost for one report.',
                r`SET SESSION sort_buffer_size = 32 * 1024 * 1024;
SET SESSION join_buffer_size = 32 * 1024 * 1024;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Largest memory consumers.',
            r`SELECT event_name, current_alloc FROM sys.memory_global_by_current_bytes LIMIT 3;

-- OUTPUT: (example)
-- event_name                 | current_alloc
-- memory/innodb/buf_buf_pool | 10.00 GiB`],
            ['Swap check (Linux shell).',
                r`vmstat 1 3

-- OUTPUT: (example)
-- si so columns should stay 0 (no swapping)`]]
    ),

    'Connections, Threads & Disk I/O': x(
        ['MySQL uses one thread per connection. Too many connections waste memory and CPU; slow disks make every query slow.',
            'Check connections with <code>SHOW STATUS LIKE "Threads_connected"</code> and limit with <code>max_connections</code>.',
            'Use connection pooling in the application.'],
        ['Watch <code>Threads_running</code> (active) versus <code>Threads_connected</code> (open).',
            'Disk tuning: <code>innodb_io_capacity</code>, <code>innodb_flush_method=O_DIRECT</code>, fast SSD/NVMe, separate redo/binlog volumes if needed.',
            'Thread pool is available in enterprise/Percona; community relies on pooling and limits.'],
        ['Hundreds of running threads at once usually means contention, not capacity; reduce concurrency (pool size) rather than increasing max_connections.',
            'Monitor I/O: latency, IOPS, queue depth, fsync times; check <code>sys.io_global_by_wait_by_latency</code>.',
            'Right-size pools: connections ≈ cores x 2 + effective spindle count is a common starting heuristic.'],
        [['F', 'How many threads does each connection use?', 'One server thread per connection.'],
            ['F', 'Which setting limits connections?', '<code>max_connections</code>.'],
            ['M', 'Threads_connected vs Threads_running?', 'Connected = open connections; running = connections executing a statement right now.'],
            ['M', 'Which setting suits SSD I/O capacity?', '<code>innodb_io_capacity</code> (and _max), set to the device’s real IOPS capability.'],
            ['S', 'Why not just raise max_connections when you see "Too many connections"?', 'More threads increase context switching and memory; fix the leak or pool size and reduce long-held connections.'],
            ['S', 'How do you size an application connection pool?', 'Start small (CPU cores x 2), measure throughput/latency, and cap total across all app instances below max_connections.']],
        [['Connection health.',
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_connected','Threads_running','Max_used_connections','Aborted_connects');

-- OUTPUT: (example)
-- Threads_connected    | 118
-- Threads_running      |   6
-- Max_used_connections | 143
-- Aborted_connects     |  12`],
            ['Who uses connections.',
                r`SELECT user, host, COUNT(*) AS conns FROM information_schema.processlist GROUP BY user, host ORDER BY conns DESC LIMIT 3;

-- OUTPUT: (example)
-- user    | host       | conns
-- shop_app| 10.0.1.12  |    60`]],
        [['I/O waits.',
            r`SELECT event_name, count_star, total_latency FROM sys.io_global_by_wait_by_latency LIMIT 2;

-- OUTPUT: (example)
-- event_name              | count_star | total_latency
-- wait/io/file/innodb/redo|   9120344  | 3.1 min`],
            ['Set I/O capacity for NVMe.',
                r`SET GLOBAL innodb_io_capacity = 4000;
SET GLOBAL innodb_io_capacity_max = 8000;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'SHOW PROCESSLIST & SHOW ENGINE INNODB STATUS': x(
        ['<code>SHOW PROCESSLIST</code> lists current connections and what they are running. <code>SHOW ENGINE INNODB STATUS</code> prints InnoDB internals including locks, deadlocks and buffer pool info.',
            'They are first-aid tools when the server feels slow or stuck.',
            'Kill a runaway query with <code>KILL QUERY id</code> (or <code>KILL id</code> to drop the connection).'],
        ['Use <code>SHOW FULL PROCESSLIST</code> to see the full SQL text; or query <code>performance_schema.threads</code> / <code>sys.processlist</code> for richer data.',
            'In INNODB STATUS read sections: LATEST DETECTED DEADLOCK, TRANSACTIONS, SEMAPHORES, LOG, BUFFER POOL AND MEMORY.',
            'State values like "Waiting for table metadata lock" point to DDL blockers.'],
        ['Investigate in this order: long-running transactions, lock waits (<code>sys.innodb_lock_waits</code>), metadata locks, then I/O and CPU.',
            'Avoid heavy diagnostic queries on an already overloaded server; use Performance Schema views which are lighter.',
            'After the incident, capture evidence (processlist snapshot, status) for the postmortem.'],
        [['F', 'What does SHOW PROCESSLIST show?', 'Current connections, their state, runtime and the statement they run.'],
            ['F', 'How do you stop a runaway query?', '<code>KILL QUERY &lt;id&gt;;</code>'],
            ['M', 'What does "Waiting for table metadata lock" mean?', 'A statement waits for a lock on the table structure, usually blocked by an open transaction and a pending DDL.'],
            ['M', 'What sections matter in INNODB STATUS?', 'LATEST DETECTED DEADLOCK, TRANSACTIONS, SEMAPHORES, BUFFER POOL AND MEMORY, LOG.'],
            ['S', 'How do you find the blocker of many waiting queries?', 'Use sys.innodb_lock_waits and performance_schema.metadata_locks to see which thread holds the lock, then inspect its transaction.'],
            ['S', 'How do you diagnose a stall systematically?', 'Check processlist for states, long transactions, lock waits, then resource metrics (CPU, I/O), and recent changes or deploys.']],
        [['Spot long-running queries.',
            r`SELECT id, user, db, time, state, LEFT(info, 60) AS query FROM information_schema.processlist WHERE command <> 'Sleep' ORDER BY time DESC LIMIT 3;

-- OUTPUT: (example)
-- id | user     | db   | time | state                          | query
-- 31 | shop_app | shop | 412  | Waiting for table metadata lock | ALTER TABLE orders ADD COLUMN x INT
-- 27 | report   | shop | 380  | executing                      | SELECT ... FROM orders ...`],
            ['Kill the blocker.',
                r`KILL QUERY 27;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Lock waits.',
            r`SELECT waiting_pid, blocking_pid, wait_age FROM sys.innodb_lock_waits;

-- OUTPUT: (example)
-- waiting_pid | blocking_pid | wait_age
-- 22          | 19           | 00:00:42`],
            ['Engine status excerpt.',
                r`SHOW ENGINE INNODB STATUS\G

-- OUTPUT: (excerpt)
-- ---TRANSACTION 4521880, ACTIVE 380 sec
-- 2 lock struct(s), heap size 1128, 1 row lock(s)`]]
    ),

    'Connection Layer': x(
        ['The connection layer is the first part of MySQL a client meets: it accepts connections, handles authentication, TLS and manages threads.',
            'Each connection gets a thread and a session with its own variables.',
            'Clients connect over TCP, Unix socket or named pipe.'],
        ['Steps: network handshake, authentication plugin (caching_sha2_password), authorization checks, session setup, then the command loop.',
            'Settings: <code>max_connections</code>, <code>wait_timeout</code>, <code>interactive_timeout</code>, <code>max_allowed_packet</code>, <code>require_secure_transport</code>.',
            'Idle connections still consume memory.'],
        ['The server trusts the connection layer for security: enforce TLS, strong auth, host-based access and rate limiting (<code>max_connect_errors</code>).',
            'Connection storms after a restart can overwhelm the server; use pools with backoff.',
            'Proxies (ProxySQL, Router) can multiplex connections to reduce server threads.'],
        [['F', 'What does the connection layer do?', 'Accepts client connections, authenticates them and creates threads/sessions.'],
            ['F', 'Which protocols connect clients?', 'TCP/IP, Unix socket and named pipes.'],
            ['M', 'What is wait_timeout?', 'How long the server keeps an idle non-interactive connection before closing it.'],
            ['M', 'Which authentication plugin is default in MySQL 8?', 'caching_sha2_password.'],
            ['S', 'How do you protect against connection storms?', 'Pool with limits and jittered retries, multiplexing proxies and sensible max_connections/backlog settings.'],
            ['S', 'How do you enforce encryption?', 'Set <code>require_secure_transport=ON</code> and use <code>REQUIRE SSL</code> for accounts.']],
        [['Session and timeouts.',
            r`SELECT @@wait_timeout, @@interactive_timeout, @@max_connections, @@require_secure_transport;

-- OUTPUT: (example)
-- @@wait_timeout | @@interactive_timeout | @@max_connections | @@require_secure_transport
-- 28800          | 28800                 | 151                | 0`],
            ['See the authentication plugin of users.',
                r`SELECT user, host, plugin FROM mysql.user WHERE user IN ('root','shop_app');

-- OUTPUT:
-- user     | host | plugin
-- root     | localhost | caching_sha2_password
-- shop_app | %         | caching_sha2_password`]],
        [['Check TLS on the current connection.',
            r`SHOW SESSION STATUS LIKE 'Ssl_version';

-- OUTPUT:
-- Variable_name | Value
-- Ssl_version   | TLSv1.3`],
            ['Aborted connections.',
                r`SHOW GLOBAL STATUS LIKE 'Aborted%';

-- OUTPUT: (example)
-- Aborted_clients  | 24
-- Aborted_connects | 12`]]
    ),

    'SQL Parser & Query Optimizer': x(
        ['The SQL parser checks syntax and turns text into an internal tree. The optimizer then chooses the cheapest way to run the query (indexes, join order).',
            'Parsing errors give messages like "You have an error in your SQL syntax".',
            'The optimizer is cost-based: it uses statistics to estimate costs.'],
        ['Optimizer steps: resolve names, simplify and rewrite (constant folding, subquery transformation), choose access paths and join order, produce an execution plan.',
            'Controls: <code>optimizer_switch</code>, optimizer hints (<code>/*+ ... */</code>), index hints, histograms.',
            '<code>EXPLAIN</code> shows the chosen plan; <code>optimizer_trace</code> shows the reasoning.'],
        ['Bad plans come from stale or skewed statistics, correlated predicates the optimizer cannot know, or non-sargable queries.',
            'Use hints sparingly and document them; they can become wrong as data changes.',
            'The prepared statement plan cache is per session and invalidated by DDL; parameter values can still affect row estimates.'],
        [['F', 'What does the parser do?', 'Checks SQL syntax and converts the statement to an internal structure.'],
            ['F', 'What does the optimizer do?', 'Chooses the most efficient execution plan.'],
            ['M', 'What is cost-based optimization?', 'The optimizer estimates the cost of alternative plans using statistics and picks the lowest.'],
            ['M', 'How can you see why the optimizer chose a plan?', '<code>SET optimizer_trace="enabled=on"</code> then query information_schema.optimizer_trace.'],
            ['S', 'When use optimizer hints?', 'When the optimizer is consistently wrong and statistics/indexes cannot fix it, e.g. <code>/*+ JOIN_ORDER(a,b) */</code>, with monitoring.'],
            ['S', 'Why do plans change suddenly?', 'Statistics refresh, data growth/skew, version upgrades or parameter changes; capture and compare plans.']],
        [['Syntax error from the parser.',
            r`SELEC * FROM emp;

-- OUTPUT:
-- ERROR 1064 (42000): You have an error in your SQL syntax; ... near 'SELEC * FROM emp' at line 1`],
            ['Optimizer hint.',
                r`SELECT /*+ JOIN_ORDER(d, e) */ e.name FROM emp e JOIN departments d ON d.id = e.dept WHERE d.name = 'HR';

-- OUTPUT:
-- name
-- Asha
-- Ravi`]],
        [['Optimizer trace.',
            r`SET optimizer_trace = 'enabled=on';
SELECT COUNT(*) FROM orders WHERE customer_id = 7;
SELECT JSON_EXTRACT(trace, '$.steps[*].considered_execution_plans') FROM information_schema.optimizer_trace\G
SET optimizer_trace = 'enabled=off';

-- OUTPUT: (excerpt)
-- "best_access_path": { "considered_access_paths": [ {"access_type": "ref", "index": "idx_customer", "cost": 1.4} ] }`],
            ['Plan hint with index hint.',
                r`SELECT * FROM orders FORCE INDEX (idx_cust_status_created) WHERE customer_id = 7 AND status = 'NEW';

-- OUTPUT:
-- (same rows; the optimizer is forced to use that index)`]]
    ),

    'Execution Engine': x(
        ['The execution engine runs the plan produced by the optimizer: it calls the storage engine to read rows, applies joins, filters, sorting and returns results.',
            'It talks to the storage engine through a handler interface (read row, write row, index lookup).',
            'You see its work in EXPLAIN ANALYZE.'],
        ['Execution is iterator-based in MySQL 8: each plan node pulls rows from child nodes.',
            'Operators: table/index scans, index lookups, nested loop and hash joins, sort, aggregate, temporary tables, limit.',
            'Rows flow upward and are sent to the client as they are produced (streaming), unless buffered.'],
        ['Large result sets are buffered by some clients (JDBC fetches all by default); use streaming or cursors for huge exports.',
            'Server-side memory for sorts/joins is limited by buffers; spills to disk are slower.',
            'Parallelism is limited: a single query mostly runs on one thread (except some parallel reads for counts/scans in 8.0.14+).'],
        [['F', 'What does the execution engine do?', 'Executes the optimizer’s plan by reading rows via the storage engine and applying operations.'],
            ['F', 'How does it get rows from tables?', 'Through the storage engine API (handler).'],
            ['M', 'What is the iterator execution model?', 'Each plan node asks its children for the next row, pipelining rows upwards.'],
            ['M', 'Why can a large result use a lot of client memory?', 'Drivers like JDBC buffer the whole result by default unless you enable streaming.'],
            ['S', 'Is a single MySQL query parallel?', 'Mostly single-threaded; some operations (like parallel clustered index reads for COUNT/CHECK TABLE) are parallel in recent versions.'],
            ['S', 'How to export huge tables safely?', 'Streaming result sets (fetchSize=Integer.MIN_VALUE), chunked keyset queries, or SELECT ... INTO OUTFILE / dump utilities.']],
        [['See nodes execute.',
            r`EXPLAIN ANALYZE SELECT d.name, COUNT(*) FROM emp e JOIN departments d ON d.id = e.dept GROUP BY d.id;

-- OUTPUT: (example)
-- -> Table scan on <temporary>  (actual time=0.3..0.3 rows=2 loops=1)
--    -> Aggregate using temporary table  (actual time=0.3..0.3 rows=2 loops=1)
--       -> Nested loop inner join  (actual rows=3 loops=1)`],
            ['Streaming result in JDBC.',
                r`Statement st = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
st.setFetchSize(Integer.MIN_VALUE);          // stream row by row
try (ResultSet rs = st.executeQuery("SELECT * FROM events")) { while (rs.next()) { /* process */ } }

-- OUTPUT:
-- rows processed as they arrive, constant client memory`]],
        [['Handler counters show engine calls.',
            r`FLUSH STATUS;
SELECT * FROM emp WHERE id = 1;
SHOW SESSION STATUS LIKE 'Handler_read%';

-- OUTPUT: (example)
-- Handler_read_key  | 1
-- Handler_read_rnd_next | 0`],
            ['Parallel read for counting (8.0.14+).',
                r`SET SESSION innodb_parallel_read_threads = 8;
SELECT COUNT(*) FROM big_table;

-- OUTPUT:
-- COUNT(*)
-- 120450889`]]
    ),

    'Storage Engines': x(
        ['A storage engine decides how data is stored, indexed, locked and recovered. MySQL lets you choose per table: InnoDB (default), MyISAM, MEMORY, CSV, ARCHIVE and others.',
            'InnoDB is the right choice for almost everything.',
            'See engines with <code>SHOW ENGINES</code>.'],
        ['InnoDB: transactions, row locks, FKs, crash recovery. MyISAM: table locks, no transactions, legacy. MEMORY: in-RAM, lost on restart. ARCHIVE: compressed append-only.',
            'The server layer (parser, optimizer) is shared; only storage behaviour changes.',
            'Mixing engines in one transaction breaks atomicity for non-transactional engines.'],
        ['MySQL 8 system tables are InnoDB; MyISAM is deprecated for user tables in practice.',
            'Specialised engines: NDB Cluster for distributed in-memory with auto-sharding; MyRocks (Percona/MariaDB) for write-heavy, space-efficient LSM storage.',
            'Choose engines by workload: OLTP B-tree (InnoDB), write-heavy compressed (MyRocks), analytical (HeatWave/warehouse).'],
        [['F', 'What is a storage engine?', 'The component that stores and retrieves table data and defines features like transactions and locking.'],
            ['F', 'Which is the default?', 'InnoDB.'],
            ['M', 'Why is MyISAM discouraged?', 'It has table-level locks, no transactions and no crash recovery.'],
            ['M', 'When is MEMORY engine used?', 'Rarely, for temporary lookup data that can be lost on restart.'],
            ['S', 'When consider MyRocks over InnoDB?', 'For write-heavy workloads with large datasets where compression and lower write amplification matter.'],
            ['S', 'Why avoid mixing engines in transactions?', 'Non-transactional engines cannot roll back, so partial changes persist after a rollback.']],
        [['List engines.',
            r`SELECT engine, support, transactions, xa, savepoints FROM information_schema.engines;

-- OUTPUT: (example)
-- engine | support | transactions | xa  | savepoints
-- InnoDB | DEFAULT | YES          | YES | YES
-- MyISAM | YES     | NO           | NO  | NO
-- MEMORY | YES     | NO           | NO  | NO`],
            ['Convert and verify.',
                r`ALTER TABLE legacy_log ENGINE = InnoDB;
SELECT table_name, engine FROM information_schema.tables WHERE table_name = 'legacy_log';

-- OUTPUT:
-- table_name | engine
-- legacy_log | InnoDB`]],
        [['MyISAM cannot roll back.',
            r`CREATE TABLE m (id INT) ENGINE=MyISAM;
START TRANSACTION; INSERT INTO m VALUES (1); ROLLBACK;
SELECT COUNT(*) FROM m;

-- OUTPUT:
-- COUNT(*)
-- 1`],
            ['MEMORY table is lost on restart.',
                r`CREATE TABLE cache_lookup (k INT PRIMARY KEY, v VARCHAR(20)) ENGINE=MEMORY;
-- after server restart:
SELECT COUNT(*) FROM cache_lookup;

-- OUTPUT:
-- COUNT(*)
-- 0`]]
    ),

    'MySQL with Java & Spring Boot': x(
        ['Spring Boot connects to MySQL through JDBC and a DataSource (HikariCP by default). Configure URL, user and password in <code>application.properties</code>.',
            'With Spring Data JPA you define entities and repositories; Hibernate generates SQL.',
            'Add the <code>mysql-connector-j</code> dependency.'],
        ['Key settings: <code>spring.jpa.hibernate.ddl-auto=validate</code> in production (use migrations), <code>spring.jpa.open-in-view=false</code>, HikariCP pool size, batch size (<code>hibernate.jdbc.batch_size</code>).',
            'Use <code>@Transactional</code> at the service layer; use read-only transactions for queries.',
            'Enable SQL logging in development to see generated queries.'],
        ['Production JDBC URL options: <code>sslMode=VERIFY_IDENTITY</code>, <code>connectTimeout</code>, <code>socketTimeout</code>, <code>rewriteBatchedStatements=true</code>, <code>useServerPrepStmts</code>.',
            'Use Flyway or Liquibase for schema changes; never auto-update schemas in production.',
            'Watch N+1, lazy initialization exceptions, large result sets and pool exhaustion.'],
        [['F', 'How does Spring Boot connect to MySQL?', 'Through a JDBC DataSource configured with the MySQL URL, username and password.'],
            ['F', 'Which pool does Spring Boot use?', 'HikariCP.'],
            ['M', 'What does ddl-auto=validate do?', 'Checks that the schema matches the entities at startup and fails if it does not, without changing the database.'],
            ['M', 'Why set open-in-view=false?', 'It prevents keeping a DB connection open through the web layer and surfaces lazy-loading problems early.'],
            ['S', 'Which JDBC option speeds batch inserts?', '<code>rewriteBatchedStatements=true</code> rewrites batches into multi-row inserts.'],
            ['S', 'How do you manage schema in Spring Boot?', 'Flyway/Liquibase migrations run at startup or in CI/CD, with ddl-auto=validate or none.']],
        [['application.properties.',
            r`spring.datasource.url=jdbc:mysql://localhost:3306/shop?sslMode=PREFERRED&rewriteBatchedStatements=true
spring.datasource.username=shop_app
spring.datasource.password=(from environment)
spring.datasource.hikari.maximum-pool-size=10
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false

-- OUTPUT:
-- HikariPool-1 - Start completed.`],
            ['Entity and repository.',
                r`@Entity @Table(name = "orders")
public class Order { @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id; Long customerId; BigDecimal total; }

public interface OrderRepository extends JpaRepository<Order, Long> { List<Order> findByCustomerId(Long customerId); }

-- OUTPUT: (SQL)
-- select o.id, o.customer_id, o.total from orders o where o.customer_id=?`]],
        [['Batch insert settings.',
            r`spring.jpa.properties.hibernate.jdbc.batch_size=500
spring.jpa.properties.hibernate.order_inserts=true

-- OUTPUT:
-- 10,000 inserts executed as 20 batches`],
            ['Read-only transaction.',
                r`@Transactional(readOnly = true)
public List<Order> recent() { return repo.findTop20ByOrderByIdDesc(); }

-- OUTPUT:
-- SET SESSION TRANSACTION READ ONLY (hint) then SELECT ... LIMIT 20`]]
    ),

    'MySQL with Python & Django': x(
        ['Django talks to MySQL through the <code>mysqlclient</code> driver. Set <code>ENGINE: "django.db.backends.mysql"</code> in <code>DATABASES</code>.',
            'Django ORM models map to tables; migrations create and change them.',
            'Plain Python can use <code>mysql-connector-python</code> or <code>PyMySQL</code>.'],
        ['Use <code>CONN_MAX_AGE</code> for persistent connections, <code>ATOMIC_REQUESTS</code> or <code>transaction.atomic()</code> for transactions.',
            'Set <code>OPTIONS</code>: charset utf8mb4, init_command for sql_mode, SSL options.',
            'Use <code>select_related</code> and <code>prefetch_related</code> to avoid N+1.'],
        ['Run migrations in CI/CD; review generated SQL with <code>sqlmigrate</code>.',
            'Beware long-running migrations on big tables (they lock); use online schema change tools or split data migrations.',
            'Use connection pooling at the proxy level (ProxySQL/pgbouncer-like) or persistent connections carefully with many workers.'],
        [['F', 'Which driver does Django use for MySQL?', 'mysqlclient (or PyMySQL as a drop-in).'],
            ['F', 'What are Django migrations?', 'Versioned files describing schema changes applied with <code>manage.py migrate</code>.'],
            ['M', 'What is CONN_MAX_AGE?', 'How long a connection is reused across requests, avoiding reconnect overhead.'],
            ['M', 'How do you avoid N+1 in Django?', '<code>select_related</code> for foreign keys and <code>prefetch_related</code> for reverse/many relations.'],
            ['S', 'How do you see the SQL for a migration?', '<code>python manage.py sqlmigrate app 0002</code>.'],
            ['S', 'How do you run risky migrations on big tables?', 'Use gh-ost/pt-osc or split into additive step, backfill job and cleanup step.']],
        [['settings.py.',
            r`DATABASES = {
  "default": {
    "ENGINE": "django.db.backends.mysql",
    "NAME": "shop", "USER": "shop_app", "PASSWORD": "***", "HOST": "db", "PORT": "3306",
    "CONN_MAX_AGE": 60,
    "OPTIONS": {"charset": "utf8mb4", "init_command": "SET sql_mode='STRICT_TRANS_TABLES'"},
  }
}

-- OUTPUT:
-- python manage.py check  =>  System check identified no issues`],
            ['ORM and SQL.',
                r`orders = Order.objects.select_related("customer").filter(status="NEW")[:20]
print(orders.query)

-- OUTPUT:
-- SELECT ... FROM orders INNER JOIN customers ON ... WHERE status = 'NEW' LIMIT 20`]],
        [['Atomic transfer.',
            r`from django.db import transaction
with transaction.atomic():
    Account.objects.select_for_update().filter(id__in=[1, 2]).order_by("id")
    Account.objects.filter(id=1).update(balance=F("balance") - 100)
    Account.objects.filter(id=2).update(balance=F("balance") + 100)

-- OUTPUT:
-- BEGIN; SELECT ... FOR UPDATE; UPDATE ...; UPDATE ...; COMMIT;`],
            ['Inspect migration SQL.',
                r`python manage.py sqlmigrate shop 0003

-- OUTPUT:
-- ALTER TABLE shop_order ADD COLUMN note varchar(100) NULL;`]]
    ),

    'MySQL with Node.js, .NET, PHP & Go': x(
        ['Every language has a MySQL driver: Node.js <code>mysql2</code>, .NET <code>MySqlConnector</code>, PHP <code>PDO_MySQL</code>/<code>mysqli</code>, Go <code>go-sql-driver/mysql</code>.',
            'The pattern is the same: open a connection (preferably a pool), run parameterized queries, close or return the connection.',
            'Always bind parameters; never concatenate input into SQL.'],
        ['Node mysql2: <code>createPool</code> and <code>execute</code> with placeholders. Go: <code>database/sql</code> pools automatically (<code>SetMaxOpenConns</code>). PHP-FPM usually opens a connection per request unless persistent.',
            'Use async patterns correctly (await queries, always release connections).',
            'Set charset utf8mb4 and time zone explicitly in the connection options.'],
        ['Choose ORMs/query builders per ecosystem (Prisma/Sequelize, EF Core, Eloquent/Doctrine, GORM/sqlx) but inspect the generated SQL.',
            'Handle transient errors (deadlock 1213, lost connection 2013/2006) with retries.',
            'In serverless, connection pooling needs a proxy (RDS Proxy, ProxySQL) because each function instance opens connections.'],
        [['F', 'Name MySQL drivers for Node, .NET, PHP and Go.', 'mysql2, MySqlConnector, PDO_MySQL/mysqli, go-sql-driver/mysql.'],
            ['F', 'How do you prevent SQL injection in any language?', 'Use parameterized queries/prepared statements.'],
            ['M', 'How does Go manage connections?', '<code>database/sql</code> keeps a pool; tune SetMaxOpenConns, SetMaxIdleConns and SetConnMaxLifetime.'],
            ['M', 'Why can PHP cause many connections?', 'Each request often opens its own connection; use persistent connections cautiously or a proxy.'],
            ['S', 'How do you handle deadlocks in application code?', 'Catch error 1213 and retry the whole transaction with backoff, a bounded number of times.'],
            ['S', 'What changes in serverless?', 'Many short-lived instances can exhaust max_connections; use a connection proxy/pooler and keep functions lean.']],
        [['Node.js mysql2 with a pool.',
            r`const mysql = require('mysql2/promise');
const pool = mysql.createPool({ host: 'db', user: 'shop_app', password: process.env.DB_PASS, database: 'shop', connectionLimit: 10, charset: 'utf8mb4' });
const [rows] = await pool.execute('SELECT id, name FROM users WHERE email = ?', [email]);

-- OUTPUT:
-- rows: [ { id: 1, name: 'Asha' } ]`],
            ['Go database/sql.',
                r`db, _ := sql.Open("mysql", "shop_app:***@tcp(db:3306)/shop?parseTime=true&charset=utf8mb4")
db.SetMaxOpenConns(20); db.SetMaxIdleConns(10); db.SetConnMaxLifetime(30 * time.Minute)
var name string
err := db.QueryRow("SELECT name FROM users WHERE id = ?", 1).Scan(&name)

-- OUTPUT:
-- name = "Asha"`]],
        [['PHP PDO.',
            r`$pdo = new PDO('mysql:host=db;dbname=shop;charset=utf8mb4', 'shop_app', $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$st = $pdo->prepare('SELECT id, name FROM users WHERE email = :email');
$st->execute(['email' => $email]);

-- OUTPUT:
-- $st->fetch() => ['id' => 1, 'name' => 'Asha']`],
            ['.NET MySqlConnector.',
                r`await using var conn = new MySqlConnection(cs);
await conn.OpenAsync();
await using var cmd = new MySqlCommand("SELECT name FROM users WHERE id = @id", conn);
cmd.Parameters.AddWithValue("@id", 1);

-- OUTPUT:
-- "Asha"`]]
    ),

    'Connection Pooling': x(
        ['A connection pool keeps a set of open database connections and lends them to requests, instead of opening a new one each time.',
            'Opening a connection is slow (network, TLS, authentication); reuse saves time.',
            'Popular pools: HikariCP (Java), SQLAlchemy pool, mysql2 pool, database/sql.'],
        ['Key settings: maximum pool size, minimum idle, connection timeout, max lifetime (below the server <code>wait_timeout</code>), idle timeout, validation.',
            'Pool size is not "more is better": too large causes contention in MySQL.',
            'Always return connections (close in finally / try-with-resources).'],
        ['Total connections across all app instances must stay below <code>max_connections</code> with headroom for admin and replicas.',
            'A leaked connection slowly drains the pool; enable leak detection (HikariCP <code>leakDetectionThreshold</code>).',
            'Use a proxy (ProxySQL/RDS Proxy) for multiplexing when many instances or serverless need more clients than the DB can handle.'],
        [['F', 'What is a connection pool?', 'A cache of open database connections that applications borrow and return.'],
            ['F', 'Why use one?', 'Creating connections is expensive; pooling reduces latency and server load.'],
            ['M', 'Why should maxLifetime be less than wait_timeout?', 'So the pool retires connections before the server closes them, avoiding broken connections.'],
            ['M', 'How do you detect leaks?', 'Enable leak detection and monitor active vs idle connections and pool wait times.'],
            ['S', 'How do you size the pool?', 'Start with cores x 2, measure throughput and latency, and cap the sum over all instances under max_connections.'],
            ['S', 'When use a proxy pooler?', 'Many app instances, serverless or bursty clients where per-instance pools would overwhelm the database.']],
        [['HikariCP config.',
            r`spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=3000
spring.datasource.hikari.max-lifetime=1500000     # 25 min < wait_timeout (8 h) or proxy timeout
spring.datasource.hikari.leak-detection-threshold=20000

-- OUTPUT:
-- HikariPool-1 - Added connection com.mysql.cj.jdbc.ConnectionImpl@5f1a`],
            ['Server-side view of the pool.',
                r`SELECT user, COUNT(*) AS total, SUM(command = 'Sleep') AS idle FROM information_schema.processlist WHERE user = 'shop_app' GROUP BY user;

-- OUTPUT:
-- user     | total | idle
-- shop_app |    20 |   14`]],
        [['Pool exhaustion symptom.',
            r`-- application log
-- HikariPool-1 - Connection is not available, request timed out after 3000ms.

-- OUTPUT:
-- (usually caused by slow queries holding connections or leaks, not by too small a pool)`],
            ['Budget across instances.',
                r`SELECT 10 AS pool_per_instance, 12 AS instances, 10 * 12 AS app_connections, @@max_connections AS max_conn;

-- OUTPUT:
-- pool_per_instance | instances | app_connections | max_conn
-- 10                | 12        | 120             | 300`]]
    ),

    'Prepared Statements in Applications': x(
        ['Prepared statements send the query with placeholders and bind values separately. They prevent SQL injection and can be reused.',
            'Java: <code>PreparedStatement</code>; Python: parameterized <code>cursor.execute(sql, params)</code>; Node: <code>execute</code>; PHP: <code>PDO::prepare</code>.',
            'Never build SQL by concatenating user input.'],
        ['Drivers may emulate prepares (client-side) or use server-side prepares; options like <code>useServerPrepStmts</code> and statement caches control it.',
            'Batching: reuse one PreparedStatement with <code>addBatch()</code> for many rows.',
            'Placeholders cannot bind identifiers (table/column names) or SQL keywords.'],
        ['Server-side prepared statements consume memory per connection (<code>max_prepared_stmt_count</code>); leaks of unclosed statements can hit the limit.',
            'Plan caching helps little in MySQL; the main benefits are safety and reduced parsing for repeated statements.',
            'Test with real parameters: skewed values can still change the plan.'],
        [['F', 'Why use prepared statements?', 'They prevent SQL injection and let the database reuse the parsed statement.'],
            ['F', 'Can you bind a column name with ?', 'No; placeholders are only for values.'],
            ['M', 'What is addBatch used for?', 'Sending many parameter sets with one prepared statement efficiently.'],
            ['M', 'What can go wrong with server-side prepares?', 'Unclosed statements accumulate and can reach <code>max_prepared_stmt_count</code>.'],
            ['S', 'How do you batch insert 100k rows quickly in Java?', 'Prepared statement with addBatch, batches of 500-1000, rewriteBatchedStatements=true and a single transaction per batch.'],
            ['S', 'How do you handle dynamic filters safely?', 'Build the SQL from fixed fragments chosen by code, binding all values as parameters.']],
        [['Batch insert.',
            r`String sql = "INSERT INTO events (user_id, kind) VALUES (?, ?)";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    for (Event e : events) { ps.setLong(1, e.userId); ps.setString(2, e.kind); ps.addBatch(); }
    ps.executeBatch();
}

-- OUTPUT:
-- int[] of update counts (one per row), executed as multi-row INSERTs with rewriteBatchedStatements=true`],
            ['Check prepared statement usage.',
                r`SHOW GLOBAL STATUS LIKE 'Prepared_stmt_count';
SHOW VARIABLES LIKE 'max_prepared_stmt_count';

-- OUTPUT: (example)
-- Prepared_stmt_count     | 412
-- max_prepared_stmt_count | 16382`]],
        [['Dynamic filters safely (Python).',
            r`clauses, params = [], []
if status: clauses.append("status = %s"); params.append(status)
if min_total: clauses.append("total >= %s"); params.append(min_total)
sql = "SELECT id FROM orders" + (" WHERE " + " AND ".join(clauses) if clauses else "")
cur.execute(sql, params)

-- OUTPUT:
-- SELECT id FROM orders WHERE status = %s AND total >= %s   (values bound separately)`],
            ['Statement leak symptom.',
                r`-- ERROR 1461 (42000): Can't create more than max_prepared_stmt_count statements (current value: 16382)

-- OUTPUT:
-- fix: close PreparedStatement objects (try-with-resources) and enable statement caching limits`]]
    ),

    'Pagination Strategies': x(
        ['Pagination returns big result sets in pages. OFFSET pagination uses <code>LIMIT n OFFSET m</code>; keyset (seek) pagination continues after the last seen key.',
            'Always add ORDER BY with a unique tiebreaker.',
            'OFFSET is simple but slows down on deep pages.'],
        ['Keyset: <code>WHERE (created_at, id) &lt; (?, ?) ORDER BY created_at DESC, id DESC LIMIT 20</code>, backed by an index on those columns.',
            'Return an opaque cursor token that encodes the last key.',
            'Counting total pages needs a separate (often cached or approximate) count.'],
        ['Deferred join and covering indexes make OFFSET tolerable for moderate depths.',
            'Expose APIs with limits (max page size and max depth) to stop abuse.',
            'Choose per use case: admin tables with page numbers (OFFSET) vs feeds/APIs (keyset).'],
        [['F', 'How do you get page 3 with 10 items per page?', '<code>LIMIT 10 OFFSET 20</code>.'],
            ['F', 'Why add ORDER BY?', 'Without it row order is undefined and pages can overlap or skip rows.'],
            ['M', 'What is keyset pagination?', 'Using the last row’s sort key in WHERE to fetch the next page via an index range scan.'],
            ['M', 'Why is large OFFSET slow?', 'MySQL reads and discards all skipped rows.'],
            ['S', 'How do you implement a cursor token?', 'Encode (sort_value, id) in base64/JSON, sign it if needed, and decode it into the WHERE comparison.'],
            ['S', 'Total counts for huge tables?', 'Use cached/approximate counts or "has next page" checks (fetch limit+1) instead of exact COUNT(*).']],
        [['Keyset query.',
            r`SELECT id, title, created_at FROM posts WHERE (created_at, id) < ('2026-05-01 10:00:00', 120) ORDER BY created_at DESC, id DESC LIMIT 20;

-- OUTPUT:
-- id  | title | created_at
-- 119 | ...   | 2026-05-01 09:58:00
-- 118 | ...   | 2026-05-01 09:41:00`],
            ['Has-next trick (limit + 1).',
                r`SELECT id FROM posts ORDER BY id DESC LIMIT 21;     -- show 20, 21st row means "has next"

-- OUTPUT:
-- 21 rows => hasNext = true`]],
        [['Index to support it.',
            r`ALTER TABLE posts ADD INDEX idx_created_id (created_at, id);
EXPLAIN SELECT id FROM posts WHERE (created_at, id) < ('2026-05-01', 120) ORDER BY created_at DESC, id DESC LIMIT 20;

-- OUTPUT: (example)
-- type  | key            | Extra
-- range | idx_created_id | Backward index scan; Using index`],
            ['Spring Data keyset (Window API).',
                r`Window<Post> next = repo.findFirst20ByOrderByCreatedAtDesc(KeysetScrollPosition.of(Map.of("createdAt", last.getCreatedAt(), "id", last.getId())));

-- OUTPUT:
-- SELECT ... WHERE (created_at < ?) OR (created_at = ? AND id < ?) ORDER BY ... LIMIT 21`]]
    ),

    'N+1 Problem': x(
        ['The N+1 problem is running 1 query for a list and then N more queries, one per row, to load related data.',
            'It makes pages slow because every query is a network round trip.',
            'Fix it by loading related data with a JOIN or a batched IN query.'],
        ['Detect: log SQL, count queries per request, or use tests that assert query counts.',
            'ORM fixes: <code>join fetch</code>/<code>@EntityGraph</code> (JPA), <code>select_related</code>/<code>prefetch_related</code> (Django), <code>include</code> (Prisma/Sequelize), <code>@BatchSize</code> (Hibernate).',
            'Beware of lazy loading inside serialization loops.'],
        ['Prefer batching (2 queries) over wide joins when the child collections are large to avoid row explosion.',
            'Use DTO projections for read APIs; they select exactly what is needed.',
            'Add query-count budgets and APM alerts for top endpoints to catch regressions.'],
        [['F', 'What is the N+1 problem?', 'Executing one query for the parent list and one extra query per row for related data.'],
            ['F', 'How do you fix it?', 'Fetch related data with a JOIN or a single batched query.'],
            ['M', 'How do you detect it?', 'SQL logging, APM trace spans, digest tables showing tiny queries with huge counts, or tests that assert query counts.'],
            ['M', 'JOIN fetch vs batch fetch?', 'JOIN fetch uses one wide query (risk of duplicates); batch fetch uses 2 queries with an IN list and avoids row explosion.'],
            ['S', 'How do you prevent it organization-wide?', 'Default lazy relations, per-endpoint fetch plans, query-count tests and dashboards on queries per request.'],
            ['S', 'Can the database fix N+1?', 'No; it is an access-pattern problem in application code, though digest stats reveal it.']],
        [['Bad vs good in JPA.',
            r`// BAD: 1 + N queries
List<Order> orders = repo.findAll();
orders.forEach(o -> log.info(o.getCustomer().getName()));

// GOOD: one query
@Query("select o from Order o join fetch o.customer")
List<Order> findAllWithCustomer();

-- OUTPUT:
-- bad : 101 SQL statements for 100 orders
-- good: 1 SQL statement`],
            ['Detect through digests.',
                r`SELECT LEFT(digest_text, 50) AS q, count_star FROM performance_schema.events_statements_summary_by_digest ORDER BY count_star DESC LIMIT 2;

-- OUTPUT: (example)
-- q                                           | count_star
-- SELECT name FROM customers WHERE id = ?      |  4800210
-- SELECT id, customer_id FROM orders LIMIT ?   |    48002`]],
        [['Hibernate batch fetch.',
            r`@OneToMany(mappedBy = "order") @BatchSize(size = 50) List<Item> items;

-- OUTPUT:
-- select ... from order_items where order_id in (?,?,...,?)   (50 parents per query)`],
            ['Django query-count test.',
                r`with self.assertNumQueries(2):
    list(Order.objects.prefetch_related("items"))

-- OUTPUT:
-- OK (fails with a diff of executed queries if N+1 returns)`]]
    ),

    'Lazy vs Eager Loading': x(
        ['Lazy loading fetches related data only when you use it. Eager loading fetches it together with the parent.',
            'Lazy saves work when relations are not needed; eager avoids extra queries when they are.',
            'Best practice: map relations lazy, and load eagerly per query when needed.'],
        ['JPA defaults: ToOne eager, ToMany lazy; set <code>fetch = FetchType.LAZY</code> on ToOne relations too.',
            'Lazy access outside a session throws <code>LazyInitializationException</code>.',
            'Use <code>@EntityGraph</code> or <code>join fetch</code> to eager-load for a specific use case.'],
        ['Global EAGER mappings cause hidden joins and huge object graphs; avoid them.',
            'Fetching multiple collections at once creates Cartesian products (MultipleBagFetchException).',
            'Return DTOs from services so the web layer never triggers lazy loads.'],
        [['F', 'What is lazy loading?', 'Loading related data only when it is first accessed.'],
            ['F', 'What is eager loading?', 'Loading related data immediately with the parent.'],
            ['M', 'What is LazyInitializationException?', 'Accessing a lazy association after the persistence session/transaction has closed.'],
            ['M', 'How do you eager-load for one query only?', 'Use join fetch or an entity graph in that repository method.'],
            ['S', 'Why avoid EAGER on relations?', 'It applies to every query, loading data you do not need and causing unpredictable joins or N+1.'],
            ['S', 'How do you avoid Cartesian products with several collections?', 'Fetch one collection per query (batch fetch/SUBSELECT) instead of joining many in a single query.']],
        [['Lazy default with explicit fetch.',
            r`@ManyToOne(fetch = FetchType.LAZY) Customer customer;

@EntityGraph(attributePaths = {"customer"})
Optional<Order> findById(Long id);

-- OUTPUT:
-- select o.*, c.* from orders o left join customers c on c.id = o.customer_id where o.id = ?`],
            ['Lazy exception.',
                r`Order o = repo.findById(1L).get();     // transaction ended
o.getItems().size();

-- OUTPUT:
-- org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: Order.items`]],
        [['DTO projection avoids lazy issues.',
            r`public record OrderView(Long id, String customerName, BigDecimal total) {}
@Query("select new com.shop.OrderView(o.id, c.name, o.total) from Order o join o.customer c")
List<OrderView> views();

-- OUTPUT:
-- select o.id, c.name, o.total from orders o join customers c on c.id = o.customer_id`],
            ['Fetch collections separately.',
                r`@Fetch(FetchMode.SUBSELECT) @OneToMany(mappedBy = "order") List<Item> items;

-- OUTPUT:
-- select ... from order_items where order_id in (select id from orders where ...)`]]
    ),

    'Database Migrations': x(
        ['A migration is a versioned script that changes the schema. Tools apply them in order once and record them: Flyway, Liquibase, Django migrations, Alembic, Prisma Migrate.',
            'Name them by version: <code>V3__add_status.sql</code>.',
            'They keep dev, test and production schemas in sync.'],
        ['Never edit a migration that has already been applied elsewhere; add a new one.',
            'MySQL DDL is not transactional: a failed multi-statement migration can leave partial changes; keep one logical change per migration.',
            'Run migrations in CI against a real MySQL (Testcontainers).'],
        ['Use expand/contract for zero-downtime: add new column (nullable), deploy code writing both, backfill in batches, switch reads, drop old later.',
            'For big tables use online DDL (<code>ALGORITHM=INPLACE, LOCK=NONE</code>) or gh-ost/pt-online-schema-change; throttle on replica lag.',
            'Make each release compatible with the previous schema to allow rollbacks.'],
        [['F', 'What is a database migration?', 'A versioned script that updates the schema in a controlled, repeatable way.'],
            ['F', 'Name two migration tools.', 'Flyway and Liquibase.'],
            ['M', 'Can you edit an already applied migration?', 'No; checksums fail. Create a new migration.'],
            ['M', 'Why keep migrations small?', 'MySQL DDL auto-commits, so a failed multi-step script can leave the schema half-changed.'],
            ['S', 'What is expand/contract?', 'A safe pattern: add new structures, migrate data, switch the application, then remove old structures in a later release.'],
            ['S', 'How do you change a huge table without downtime?', 'Use gh-ost or pt-online-schema-change, or online DDL where supported, with throttling and monitoring of replica lag.']],
        [['Flyway migration files.',
            r`-- V1__create_orders.sql
CREATE TABLE orders (id BIGINT PRIMARY KEY AUTO_INCREMENT, customer_id BIGINT NOT NULL, total DECIMAL(10,2) NOT NULL);
-- V2__add_status.sql
ALTER TABLE orders ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'NEW', ALGORITHM=INSTANT;

-- OUTPUT:
-- Successfully applied 2 migrations to schema shop (execution time 00:00.042s)`],
            ['History table.',
                r`SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;

-- OUTPUT:
-- version | description    | success
-- 1       | create orders  | 1
-- 2       | add status     | 1`]],
        [['Online schema change with gh-ost.',
            r`gh-ost --host=db --user=ghost --password=*** --database=shop --table=orders --alter="ADD COLUMN note VARCHAR(100)" --max-lag-millis=1500 --execute

-- OUTPUT: (progress)
-- Copy: 8200000/8200000 100.0%; ... Done`],
            ['Backfill in batches.',
                r`UPDATE orders SET new_status = status WHERE id BETWEEN 1 AND 10000 AND new_status IS NULL;
-- loop by id ranges, sleep between batches

-- OUTPUT:
-- Query OK, 10000 rows affected`]]
    )
};
