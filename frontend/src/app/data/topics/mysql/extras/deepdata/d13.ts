// Deep dive, modules 41-42 (Performance Tuning, Architecture).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d13: Record<string, Deep> = {
    'Slow Query Log': dv(
        [`When a statement finishes and its execution time exceeds <code>long_query_time</code>, the server writes an entry to the slow log (file or table) with the time, user, query time, lock time, rows sent and rows examined, and the statement text. Optional extras (<code>log_slow_extra</code>) add temporary table, sort and I/O counters.`,
            r`SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 0.5;
SET GLOBAL log_slow_extra = ON;
SHOW VARIABLES LIKE 'slow_query_log_file';

-- OUTPUT:
-- Variable_name       | Value
-- slow_query_log_file | /var/lib/mysql/db-slow.log`],
        [`Controls: <code>log_queries_not_using_indexes</code>, <code>min_examined_row_limit</code>, <code>log_slow_admin_statements</code>, <code>log_output</code> (FILE or TABLE), per-session thresholds, and rotation with <code>FLUSH SLOW LOGS</code>. Summarize with <code>mysqldumpslow</code> or <code>pt-query-digest</code>.`,
            r`mysqldumpslow -s t -t 5 /var/lib/mysql/db-slow.log
pt-query-digest /var/lib/mysql/db-slow.log --limit 10 > slow_report.txt
FLUSH SLOW LOGS;

-- OUTPUT: (example)
-- Count: 412  Time=2.31s (951s)  Lock=0.00s  Rows=20.0 (8240)
--   SELECT * FROM orders WHERE customer_note LIKE 'S' ORDER BY id DESC LIMIT N`],
        [`Mistakes: logging at 10 seconds (misses the damage done by frequent 200 ms queries), leaving it at zero threshold on a busy server (huge file and overhead), and reading single entries instead of aggregating. Sample with a low threshold for a short window, then raise it.`,
            r`SET GLOBAL long_query_time = 0;          -- capture everything for 5 minutes
-- ... wait, then
SET GLOBAL long_query_time = 1;

-- OUTPUT:
-- (a representative sample of the whole workload for pt-query-digest)`],
        [`Rank by total time, not by single slowest. Look at rows examined versus rows sent: a large ratio means wasted work (missing index or non-sargable predicate). The digest tables give the same view continuously.`,
            r`SELECT LEFT(digest_text, 60) AS q, count_star, ROUND(sum_timer_wait/1e12, 1) AS total_s, ROUND(sum_rows_examined / NULLIF(sum_rows_sent, 0)) AS examined_per_sent FROM performance_schema.events_statements_summary_by_digest ORDER BY sum_timer_wait DESC LIMIT 3;

-- OUTPUT: (example)
-- q                                       | count_star | total_s | examined_per_sent
-- SELECT * FROM orders WHERE customer_id  |     912000 |   410.5 |                12`],
        [`Real-world loop: weekly review of the top ten digests, fix the worst with an index or rewrite, deploy, and compare the same digest next week.`,
            r`ALTER TABLE orders ADD INDEX idx_customer_status_created (customer_id, status, created_at), ALGORITHM=INPLACE, LOCK=NONE;
EXPLAIN ANALYZE SELECT id, total FROM orders WHERE customer_id = 7 AND status = 'NEW' ORDER BY created_at DESC LIMIT 20;

-- OUTPUT:
-- before: actual time 0.2..95 ms (filesort of 14000 rows)   after: 0.04..0.1 ms`]
    ),

    'Performance Schema & sys Schema': dv(
        [`The Performance Schema instruments the server in memory: statements, stages, waits, locks, memory, file I/O, connections, replication. Data lives in tables with the PERFORMANCE_SCHEMA engine and is aggregated into summary tables (by digest, thread, account, event). The sys schema is a set of views and procedures that read those tables in a friendly form.`,
            r`SELECT query, exec_count, total_latency, avg_latency, rows_examined_avg FROM sys.statement_analysis ORDER BY total_latency DESC LIMIT 2;
SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'shop';
SELECT * FROM sys.innodb_lock_waits;

-- OUTPUT: (example)
-- query                           | exec_count | total_latency | avg_latency | rows_examined_avg
-- SELECT * FROM orders WHERE ...  |     412000 | 15.2 min      | 2.21 ms     | 1840`],
        [`Configure what is collected through <code>setup_instruments</code>, <code>setup_consumers</code>, <code>setup_actors</code> and <code>setup_objects</code>. Useful views: <code>sys.statements_with_full_table_scans</code>, <code>sys.statements_with_temp_tables</code>, <code>sys.host_summary</code>, <code>sys.memory_global_by_current_bytes</code>, <code>sys.io_global_by_wait_by_latency</code>.`,
            r`UPDATE performance_schema.setup_instruments SET enabled = 'YES', timed = 'YES' WHERE name LIKE 'stage/innodb/%';
UPDATE performance_schema.setup_consumers SET enabled = 'YES' WHERE name IN ('events_stages_history_long','events_statements_history_long');
SELECT query, exec_count, no_index_used_count FROM sys.statements_with_full_table_scans LIMIT 2;

-- OUTPUT:
-- query                      | exec_count | no_index_used_count
-- SELECT ... WHERE note LIKE |       5200 |                5200`],
        [`Mistakes: enabling every instrument and consumer on a busy server (overhead), forgetting counters reset at restart, and reading numbers without context. Enable what you need, snapshot metrics regularly into your monitoring system.`,
            r`SELECT name, enabled FROM performance_schema.setup_consumers WHERE name LIKE 'events_waits%';
TRUNCATE TABLE performance_schema.events_statements_summary_by_digest;       -- reset the digest counters for a fresh measurement window

-- OUTPUT:
-- name                       | enabled
-- events_waits_current       | NO
-- events_waits_history_long  | NO`],
        [`Overhead is typically a few percent with the defaults. Measure memory use of the schema itself and sizes of history tables; use the digest summaries (always on) instead of heavy history tables for routine monitoring.`,
            r`SELECT event_name, current_alloc FROM sys.memory_global_by_current_bytes WHERE event_name LIKE 'memory/performance_schema/%' LIMIT 2;
SHOW VARIABLES LIKE 'performance_schema_max_digest%';

-- OUTPUT: (example)
-- event_name                                     | current_alloc
-- memory/performance_schema/events_statements_summary_by_digest | 11.80 MiB`],
        [`Real-world: a regression detector. Snapshot the digest table every hour into your own table, then alert when a digest's average latency or rows examined jumps against its own history.`,
            r`INSERT INTO ops.digest_snapshot (taken_at, digest, count_star, sum_timer_wait, sum_rows_examined) SELECT NOW(), digest, count_star, sum_timer_wait, sum_rows_examined FROM performance_schema.events_statements_summary_by_digest WHERE schema_name = 'shop';

-- OUTPUT:
-- Query OK, 412 rows affected`]
    ),

    'Index & Query Tuning': dv(
        [`Tuning is an experiment loop: pick the query with the largest total cost, read its plan with EXPLAIN ANALYZE, form a hypothesis (missing index, non-sargable predicate, wrong join order, too many columns), change one thing, and measure again. The plan shows which rows are read and why.`,
            r`EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 7 AND status = 'NEW' ORDER BY created_at DESC LIMIT 20;
ALTER TABLE orders ADD INDEX idx_cust_status_created (customer_id, status, created_at);
EXPLAIN ANALYZE SELECT id, total, created_at FROM orders WHERE customer_id = 7 AND status = 'NEW' ORDER BY created_at DESC LIMIT 20;

-- OUTPUT: (example)
-- before: -> Sort: created_at DESC (actual time=92..92)  -> Index lookup on orders using idx_customer (rows=14000)
-- after : -> Index lookup on orders using idx_cust_status_created (reverse)  (actual time=0.04..0.1 rows=20)`],
        [`Checklist: make predicates sargable (no function on the column, matching types), order composite index columns (equality, range, order), use covering indexes for hot reads, select only needed columns, paginate with keyset, replace correlated subqueries, and keep statistics fresh.`,
            r`SELECT id FROM orders WHERE created_at >= '2026-05-01' AND created_at < '2026-05-02';        -- not DATE(created_at)
SELECT id, total FROM orders WHERE customer_id = 7;                                              -- not SELECT *
ANALYZE TABLE orders;
SELECT id FROM orders WHERE (created_at, id) < ('2026-05-01 10:00:00', 9120) ORDER BY created_at DESC, id DESC LIMIT 20;

-- OUTPUT:
-- Table       | Op      | Msg_type | Msg_text
-- shop.orders | analyze | status   | OK`],
        [`Mistakes: adding an index per slow query without checking overlaps (index sprawl), tuning on tiny test data, changing several things at once, and ignoring write cost. Remove unused or redundant indexes and test on production-sized data.`,
            r`SELECT table_name, redundant_index_name, dominant_index_name FROM sys.schema_redundant_indexes WHERE table_schema = 'shop';
SELECT object_name, index_name FROM sys.schema_unused_indexes WHERE object_schema = 'shop';
ALTER TABLE orders ALTER INDEX idx_customer INVISIBLE;      -- test the drop safely

-- OUTPUT:
-- table_name | redundant_index_name | dominant_index_name
-- orders     | idx_customer         | idx_cust_status_created`],
        [`Quantify gains: record latency percentiles and rows examined before and after under the same load, and keep the evidence. A 100x gain on a rare query matters less than a 2x gain on a query that runs millions of times.`,
            r`SELECT 912000 * (3.2 - 0.4) / 1000 / 60 AS minutes_saved_per_day;

-- OUTPUT:
-- minutes_saved_per_day
-- 42.56`],
        [`Real-world: slow admin search. The fix was a mandatory date filter, a covering composite index and keyset pagination, taking the query from 6 seconds to 8 ms.`,
            r`ALTER TABLE tickets ADD INDEX idx_status_created_id (status, created_at, id, customer_id);
SELECT id, customer_id, created_at FROM tickets WHERE status = 'OPEN' AND created_at >= NOW() - INTERVAL 30 DAY AND (created_at, id) < ('2026-05-01', 9120) ORDER BY created_at DESC, id DESC LIMIT 50;

-- OUTPUT:
-- id   | customer_id | created_at
-- 9118 |           7 | 2026-04-30 09:58:11`]
    ),

    'Buffer Pool & Memory Tuning': dv(
        [`MySQL memory has global areas (InnoDB buffer pool, log buffer, caches) and per-connection areas (sort, join, read buffers, temp tables, thread stack) that multiply with connections. The buffer pool is the largest and most important: it should hold the working set so reads rarely touch disk.`,
            r`SELECT ROUND((@@innodb_buffer_pool_size + @@max_connections * (@@sort_buffer_size + @@join_buffer_size + @@read_buffer_size + @@read_rnd_buffer_size + @@thread_stack)) / 1073741824, 1) AS worst_case_gb;
SELECT event_name, current_alloc FROM sys.memory_global_by_current_bytes LIMIT 3;

-- OUTPUT: (example)
-- worst_case_gb
-- 28.3
-- event_name                 | current_alloc
-- memory/innodb/buf_buf_pool | 24.00 GiB`],
        [`Sizing rules: buffer pool 60-75% of RAM on a dedicated host; keep per-session buffers modest and raise them per session only for specific reports; set <code>tmp_table_size</code>/<code>max_heap_table_size</code> consciously; leave memory for the OS cache and connections; avoid swap (<code>vm.swappiness</code> low).`,
            r`SET GLOBAL innodb_buffer_pool_size = 24 * 1024 * 1024 * 1024;
SET SESSION sort_buffer_size = 16 * 1024 * 1024;       -- only in the session running the heavy report
SET SESSION join_buffer_size = 32 * 1024 * 1024;
SHOW VARIABLES WHERE Variable_name IN ('tmp_table_size','max_heap_table_size');

-- OUTPUT:
-- tmp_table_size      | 16777216
-- max_heap_table_size | 16777216`],
        [`Mistakes: very large global sort and join buffers (allocated per operation and connection, causing out-of-memory), buffer pool bigger than free RAM (swapping), and container limits lower than the configured memory (the process is killed). Compare the configured total with the real limit.`,
            r`SELECT @@max_connections * (@@sort_buffer_size + @@join_buffer_size) / 1073741824 AS potential_gb_from_buffers;
-- shell: free -m ; cat /sys/fs/cgroup/memory.max

-- OUTPUT:
-- potential_gb_from_buffers
-- 14.6          (if all connections ran a big sort and join at once)`],
        [`Watch the effects: buffer pool hit rate, pages read from disk, free pages, and swap activity. If the working set is larger than RAM, add memory, reduce the working set (archive, better indexes) or move analytics off the primary.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Innodb_buffer_pool_reads','Innodb_buffer_pool_read_requests','Innodb_buffer_pool_pages_free');
-- shell: vmstat 1 3   (si and so columns must stay 0)

-- OUTPUT: (example)
-- Innodb_buffer_pool_reads         | 412330
-- Innodb_buffer_pool_read_requests | 912330021
-- Innodb_buffer_pool_pages_free    | 1024`],
        [`Real-world: a container with a 32 GB limit ran MySQL with a 28 GB buffer pool and was OOM-killed under load. Setting the pool to 20 GB and bounding connections stabilised it.`,
            r`SET PERSIST innodb_buffer_pool_size = 20 * 1024 * 1024 * 1024;
SET PERSIST max_connections = 300;
SET PERSIST sort_buffer_size = 1 * 1024 * 1024;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Connections, Threads & Disk I/O': dv(
        [`MySQL (community) uses one operating system thread per client connection. Threads cost memory (stack, buffers) and context switches, so connection count and concurrency are separate: <code>Threads_connected</code> is how many are open, <code>Threads_running</code> how many execute at this instant. Past a point more concurrency reduces throughput because of contention.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_connected','Threads_running','Max_used_connections','Aborted_connects','Connection_errors_max_connections');
SELECT @@max_connections, @@thread_cache_size;

-- OUTPUT: (example)
-- Threads_connected    | 118
-- Threads_running      |   6
-- Max_used_connections | 143
-- @@max_connections | @@thread_cache_size
--               300 |                  64`],
        [`Settings: <code>max_connections</code>, <code>thread_cache_size</code>, <code>wait_timeout</code>, <code>innodb_thread_concurrency</code>, <code>innodb_io_capacity</code>, <code>innodb_flush_method=O_DIRECT</code>, <code>innodb_read_io_threads</code>/<code>write_io_threads</code>. Use application pools and, when needed, a proxy that multiplexes connections.`,
            r`SET GLOBAL max_connections = 300;
SET GLOBAL thread_cache_size = 64;
SET GLOBAL innodb_io_capacity = 4000;
SET GLOBAL innodb_io_capacity_max = 8000;
SELECT user, COUNT(*) AS conns FROM information_schema.processlist GROUP BY user ORDER BY conns DESC;

-- OUTPUT:
-- user     | conns
-- shop_app |    96`],
        [`Mistakes: raising max_connections to fix "too many connections" (hides pool leaks and increases contention), pools that are far larger than the database can run in parallel, and idle connections held for hours. Size pools from cores, not user count.`,
            r`SELECT 12 AS app_instances, 20 AS pool_size_each, 12 * 20 AS total_possible_connections, @@max_connections AS max_connections;

-- OUTPUT:
-- app_instances | pool_size_each | total_possible_connections | max_connections
--            12 |             20 |                        240 |             300      (little headroom for admin and replicas)`],
        [`Disk performance sets the ceiling for write-heavy work: fsync latency decides commit latency, random read IOPS decide cache-miss cost. Measure I/O waits and give redo and binlog fast storage.`,
            r`SELECT event_name, count_star, total_latency, avg_latency FROM sys.io_global_by_wait_by_latency LIMIT 3;
-- shell: iostat -x 1 3   (watch await and %util)

-- OUTPUT: (example)
-- event_name                | count_star | total_latency | avg_latency
-- wait/io/file/innodb/redo  |    9120344 | 3.10 min      | 20.4 us`],
        [`Real-world: a service with 400 concurrent database threads slowed down. Cutting the pool to 40 connections (and queueing the rest in the application) raised throughput by 30% and cut p99 latency in half.`,
            r`SELECT 400 AS before_threads, 40 AS after_threads, ROUND(1.30, 2) AS throughput_factor;
SHOW GLOBAL STATUS LIKE 'Threads_running';

-- OUTPUT:
-- Threads_running | 8`]
    ),

    'SHOW PROCESSLIST & SHOW ENGINE INNODB STATUS': dv(
        [`<code>SHOW PROCESSLIST</code> lists current connections with state, time, and statement. <code>SHOW ENGINE INNODB STATUS</code> prints InnoDB internals: the latest deadlock, transactions and locks, semaphore waits, buffer pool, log and I/O statistics. They are the first tools when the server feels slow or stuck.`,
            r`SHOW FULL PROCESSLIST;
SELECT id, user, db, command, time, state, LEFT(info, 60) AS query FROM information_schema.processlist WHERE command <> 'Sleep' ORDER BY time DESC LIMIT 3;

-- OUTPUT: (example)
-- id | user     | db   | command | time | state                           | query
-- 31 | shop_app | shop | Query   |  412 | Waiting for table metadata lock | ALTER TABLE orders ADD COLUMN x INT
-- 27 | report   | shop | Query   |  380 | executing                       | SELECT ... FROM orders ...`],
        [`Better alternatives for investigation: <code>sys.processlist</code>, <code>performance_schema.threads</code>, <code>sys.innodb_lock_waits</code>, <code>performance_schema.metadata_locks</code>. End a statement with <code>KILL QUERY id</code> or the connection with <code>KILL id</code>.`,
            r`SELECT * FROM sys.innodb_lock_waits\G
SELECT object_name, lock_type, lock_status, owner_thread_id FROM performance_schema.metadata_locks WHERE object_name = 'orders';
KILL QUERY 27;

-- OUTPUT:
-- object_name | lock_type    | lock_status | owner_thread_id
-- orders      | EXCLUSIVE    | PENDING     | 31
-- orders      | SHARED_READ  | GRANTED     | 27`],
        [`Mistakes: killing the blocked session instead of the blocker, running heavy diagnostic queries on an overloaded server, and reading INNODB STATUS without knowing its sections. Find the blocker first and kill carefully; capture evidence before acting.`,
            r`SELECT waiting_pid, waiting_query, blocking_pid, blocking_query FROM sys.innodb_lock_waits;
SELECT trx_id, trx_started, trx_query FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 3;

-- OUTPUT:
-- waiting_pid | waiting_query            | blocking_pid | blocking_query
-- 22          | UPDATE acct SET bal = ...|           19 | NULL          (idle in an open transaction)`],
        [`A sequence for a stall: processlist (what states?), long transactions (innodb_trx), lock waits, metadata locks, then resources (CPU, I/O, memory, swap). Most "database is slow" incidents are a long transaction, a metadata lock pile-up or a bad plan after a deploy.`,
            r`SHOW ENGINE INNODB STATUS\G
-- TRANSACTIONS
-- ---TRANSACTION 4521880, ACTIVE 380 sec
-- 2 lock struct(s), heap size 1128, 1 row lock(s)
-- SEMAPHORES: OS WAIT ARRAY INFO: reservation count 412330

-- OUTPUT:
-- (read LATEST DETECTED DEADLOCK, TRANSACTIONS and SEMAPHORES first)`],
        [`Real-world incident: all application queries piled up in "Waiting for table metadata lock". The cause was a forgotten open transaction from a reporting tool that blocked an ALTER TABLE, which blocked everything behind it. Killing the idle transaction released the queue.`,
            r`SELECT id, user, time, state FROM information_schema.processlist WHERE state LIKE '%metadata lock%' ORDER BY time DESC LIMIT 3;
SELECT trx_mysql_thread_id, trx_started FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 1;
KILL 27;

-- OUTPUT:
-- trx_mysql_thread_id | trx_started
-- 27                  | 2026-05-01 06:12:03`]
    ),

    'Connection Layer': dv(
        [`The connection layer handles everything before SQL is parsed: accepting the TCP, socket or pipe connection, the handshake (protocol version, capabilities, TLS), authentication through the account's plugin, checking host and account limits, then creating (or reusing from the thread cache) a thread and a session. Afterwards it runs a command loop: read a packet, dispatch, send results.`,
            r`SELECT CONNECTION_ID() AS id, USER() AS client_user, CURRENT_USER() AS matched_account, @@hostname AS server_host;
SHOW SESSION STATUS WHERE Variable_name IN ('Ssl_version','Ssl_cipher');
SELECT @@wait_timeout, @@interactive_timeout, @@max_allowed_packet, @@require_secure_transport;

-- OUTPUT: (example)
-- id | client_user      | matched_account  | server_host
-- 12 | shop_app@10.0.1.7| shop_app@10.0.1.%| db1
-- Ssl_version | TLSv1.3`],
        [`Settings: <code>max_connections</code>, <code>max_connect_errors</code>, <code>wait_timeout</code>, <code>interactive_timeout</code>, <code>net_read_timeout</code>, <code>require_secure_transport</code>, <code>bind_address</code>, <code>skip_name_resolve</code> (avoid DNS lookups), <code>admin_address</code> and <code>admin_port</code> (an extra connection for emergencies).`,
            r`SET PERSIST skip_name_resolve = ON;       -- accounts must then use IP addresses
SET PERSIST require_secure_transport = ON;
SET PERSIST max_connect_errors = 1000000;
SELECT user, host, plugin FROM mysql.user WHERE user = 'shop_app';

-- OUTPUT:
-- user     | host     | plugin
-- shop_app | 10.0.1.% | caching_sha2_password`],
        [`Mistakes: DNS resolution slowing every login, connection storms after restarts, host blocking after too many failed attempts (<code>max_connect_errors</code>) that locks out a load balancer, and plain-text connections inside a "trusted" network. Disable name resolution, retry with backoff, require TLS.`,
            r`SHOW GLOBAL STATUS LIKE 'Aborted%';
SELECT host, count_authentication_errors, count_handshake_errors FROM performance_schema.host_cache ORDER BY count_authentication_errors DESC LIMIT 2;
FLUSH HOSTS;

-- OUTPUT:
-- Aborted_clients  | 24
-- Aborted_connects | 12`],
        [`Each connection consumes memory and a thread. Use pooling and a thread cache so connection setup is not repeated for each request, and cap total connections across all application instances.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_created','Connections','Threads_cached');

-- OUTPUT: (example)
-- Connections     | 9120344
-- Threads_created |     412        (a good thread cache: only 412 new threads for 9M connections)
-- Threads_cached  |      54`],
        [`Real-world hardening: bind to a private interface, enforce TLS with certificate verification, allow only application subnets in firewalls and account hosts, and alert on login failures.`,
            r`# my.cnf
[mysqld]
bind_address = 10.0.1.5
require_secure_transport = ON
tls_version = TLSv1.2,TLSv1.3

-- OUTPUT: (after restart)
-- SHOW VARIABLES LIKE 'tls_version';  =>  TLSv1.2,TLSv1.3`]
    ),

    'SQL Parser & Query Optimizer': dv(
        [`The parser tokenizes and parses SQL into a parse tree, resolves names and checks privileges. The optimizer then transforms the tree (constant folding, subquery to semijoin, merging derived tables, outer-to-inner join conversion), estimates the cost of access paths and join orders using statistics, and produces an execution plan that the executor runs.`,
            r`SELEC * FROM emp;
SET optimizer_trace = 'enabled=on';
SELECT COUNT(*) FROM orders WHERE customer_id = 7;
SELECT JSON_PRETTY(JSON_EXTRACT(trace, '$.steps[*].join_optimization.considered_execution_plans')) FROM information_schema.optimizer_trace\G
SET optimizer_trace = 'enabled=off';

-- OUTPUT:
-- ERROR 1064 (42000): You have an error in your SQL syntax; ... near 'SELEC * FROM emp' at line 1
-- "best_access_path": { "considered_access_paths": [ {"access_type": "ref", "index": "idx_customer", "cost": 1.4} ] }`],
        [`You influence the optimizer with statistics (<code>ANALYZE TABLE</code>, histograms), indexes, <code>optimizer_switch</code> flags, optimizer hints (<code>/*+ JOIN_ORDER() INDEX() NO_INDEX() SET_VAR() */</code>), and old-style index hints (<code>USE/FORCE/IGNORE INDEX</code>). Prefer fixing statistics and indexes over hints.`,
            r`SELECT /*+ JOIN_ORDER(d, e) */ e.name FROM emp e JOIN departments d ON d.id = e.dept WHERE d.name = 'HR';
SELECT /*+ SET_VAR(sort_buffer_size = 16777216) */ id FROM orders ORDER BY total DESC LIMIT 100;
SELECT @@optimizer_switch\G
EXPLAIN SELECT id FROM orders FORCE INDEX (idx_status) WHERE status = 'NEW';

-- OUTPUT: (excerpt)
-- index_merge=on,index_merge_union=on,...,hash_join=on,derived_merge=on,subquery_to_derived=off`],
        [`Mistakes: forcing indexes permanently (plans go stale as data changes), blaming the optimizer for stale statistics, and ignoring that estimates assume independent columns (correlated columns cause bad estimates). Refresh statistics, add histograms or composite indexes first.`,
            r`ANALYZE TABLE orders UPDATE HISTOGRAM ON status, channel WITH 16 BUCKETS;
ANALYZE TABLE orders;
EXPLAIN ANALYZE SELECT COUNT(*) FROM orders WHERE channel = 'APP' AND status = 'NEW';

-- OUTPUT: (example)
-- estimate rows=9000 vs actual rows=210   (correlated columns: a composite index helps)`],
        [`Plans can change between versions or after statistics refresh. Record plans of critical queries, compare after upgrades, and use <code>EXPLAIN FORMAT=TREE</code> to see the iterator tree used by the executor.`,
            r`EXPLAIN FORMAT=TREE SELECT d.name, COUNT(*) FROM emp e JOIN departments d ON d.id = e.dept WHERE e.salary > 50000 GROUP BY d.id;

-- OUTPUT: (example)
-- -> Group aggregate: count(0)
--     -> Nested loop inner join
--         -> Filter: (e.salary > 50000)
--         -> Single-row index lookup on d using PRIMARY (id = e.dept)`],
        [`Real-world: after a minor version upgrade one report switched to a hash join and slowed down. An index on the join column restored the nested-loop plan; a hint was kept only as a documented fallback.`,
            r`ALTER TABLE sessions ADD INDEX idx_session_id (session_id);
EXPLAIN FORMAT=TREE SELECT COUNT(*) FROM events e JOIN sessions s ON s.session_id = e.session_id WHERE e.day = '2026-05-01';

-- OUTPUT:
-- -> Nested loop inner join  -> Index lookup on s using idx_session_id (session_id = e.session_id)`]
    ),

    'Execution Engine': dv(
        [`The executor runs the plan as a tree of iterators (since MySQL 8.0.18): each node has Init, Read and End operations, and pulls rows from its children one at a time. Scans, lookups, joins, filters, aggregation, sorting and limits are all iterators. Table access goes through the storage engine's handler API (read by key, read next, write row).`,
            r`EXPLAIN ANALYZE SELECT c.name, COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'NEW' GROUP BY c.id;
FLUSH STATUS;
SELECT * FROM emp WHERE id = 1;
SHOW SESSION STATUS LIKE 'Handler_read%';

-- OUTPUT: (example)
-- Handler_read_key      | 1
-- Handler_read_rnd_next | 0`],
        [`Rows are streamed to the client as they are produced unless an operation needs all input first (sort, aggregation without index order, hash join build). Client drivers decide buffering: JDBC reads all rows by default; use streaming (fetch size) for large exports.`,
            r`Statement st = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
st.setFetchSize(Integer.MIN_VALUE);                       // stream row by row
try (ResultSet rs = st.executeQuery("SELECT id, payload FROM events")) { while (rs.next()) { /* process */ } }
mysql --quick -B -N -e "SELECT * FROM shop.events" | gzip > events.tsv.gz

-- OUTPUT:
-- (constant client memory while exporting millions of rows)`],
        [`Mistakes: loading huge result sets into application memory, assuming a single query uses multiple CPU cores (it mostly does not), and sorting or aggregating in the application what the database could do near the data. Stream results and push work down.`,
            r`SET SESSION innodb_parallel_read_threads = 8;      -- parallel clustered index reads for some operations (COUNT, CHECK TABLE)
SELECT COUNT(*) FROM big_table;
SELECT @@innodb_parallel_read_threads;

-- OUTPUT:
-- COUNT(*)
-- 120450889`],
        [`Execution cost is visible per node in EXPLAIN ANALYZE: actual time, rows and loops. A node with many loops multiplies its cost. Use these numbers, not the cost estimate, to find where time goes.`,
            r`EXPLAIN ANALYZE SELECT o.id FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.customer_id = 7;

-- OUTPUT: (example)
-- -> Nested loop inner join  (actual time=0.05..2.1 rows=120 loops=1)
--     -> Index lookup on o using idx_customer (customer_id=7)  (actual rows=40 loops=1)
--     -> Index lookup on i using PRIMARY (order_id=o.id)  (actual rows=3 loops=40)`],
        [`Real-world: a CSV export of 50 million rows caused out-of-memory errors in the application. Switching to a streaming result set with a fixed batch size kept memory flat.`,
            r`SELECT id, payload FROM events WHERE id > 0 ORDER BY id LIMIT 100000;
-- loop: next chunk WHERE id > last_id ... LIMIT 100000

-- OUTPUT:
-- (chunked keyset reads: each chunk is a short query)`]
    ),

    'Storage Engines': dv(
        [`MySQL separates the SQL layer (parser, optimizer, executor) from storage engines through a handler interface, so each table can use a different engine with different storage, locking, transaction and recovery behaviour. InnoDB (default) provides ACID transactions, row locks, foreign keys and crash recovery; MyISAM has table locks and no transactions; MEMORY keeps data in RAM; ARCHIVE compresses append-only data.`,
            r`SELECT engine, support, transactions, xa, savepoints, comment FROM information_schema.engines ORDER BY engine;
SHOW CREATE TABLE orders\G

-- OUTPUT: (excerpt)
-- engine | support | transactions | xa  | savepoints
-- InnoDB | DEFAULT | YES          | YES | YES
-- MEMORY | YES     | NO           | NO  | NO
-- MyISAM | YES     | NO           | NO  | NO`],
        [`Choose per table with <code>ENGINE=</code> and convert with <code>ALTER TABLE ... ENGINE=InnoDB</code>. MySQL 8 system tables are InnoDB. Other engines: NDB Cluster (distributed, in-memory), CSV, BLACKHOLE (discards writes), MyRocks (LSM storage in Percona and MariaDB builds) for write-heavy and space-sensitive data.`,
            r`CREATE TABLE cache_lookup (k INT PRIMARY KEY, v VARCHAR(20)) ENGINE=MEMORY;
CREATE TABLE audit_archive (id BIGINT, msg TEXT) ENGINE=ARCHIVE;
ALTER TABLE legacy_log ENGINE = InnoDB;

-- OUTPUT:
-- Query OK, 0 rows affected (x3)`],
        [`Mistakes: mixing a non-transactional engine into transactions (rollback leaves partial data), MEMORY tables for data that must survive a restart, and MyISAM for new tables. Keep business data in InnoDB.`,
            r`CREATE TABLE m (id INT) ENGINE=MyISAM;
START TRANSACTION; INSERT INTO m VALUES (1); ROLLBACK;
SELECT COUNT(*) FROM m;

-- OUTPUT:
-- COUNT(*)
-- 1           (the MyISAM insert survived the rollback)`],
        [`Engine choice drives performance traits: InnoDB B-tree clustered storage favours point reads and mixed OLTP; LSM engines favour sustained writes and compression; columnar or in-memory analytic engines favour scans. Match the engine to the access pattern.`,
            r`SELECT table_schema, engine, COUNT(*) AS tables, ROUND(SUM(data_length + index_length) / 1073741824, 1) AS gb FROM information_schema.tables WHERE table_schema NOT IN ('mysql','sys','information_schema','performance_schema') GROUP BY table_schema, engine;

-- OUTPUT: (example)
-- table_schema | engine | tables | gb
-- shop         | InnoDB |     48 | 182.4`],
        [`Real-world: a write-heavy event store with a large retention period moved from InnoDB to a compressed LSM engine, reducing disk use by 60%, while the OLTP tables stayed on InnoDB.`,
            r`SELECT table_name, engine, ROUND((data_length + index_length) / 1073741824, 1) AS gb FROM information_schema.tables WHERE table_name = 'events';

-- OUTPUT:
-- table_name | engine  | gb
-- events     | ROCKSDB | 38.0`]
    )
};
