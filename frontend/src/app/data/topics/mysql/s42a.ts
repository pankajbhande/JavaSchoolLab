// Module 42 (MySQL Architecture).
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s42a: Record<string, DeepDive> = {
    'Connection Layer': dd(
        [`The <b>connection layer</b> accepts client connections, authenticates them (plugins such as caching_sha2_password), checks privileges, and assigns each connection a thread that lives until disconnect.`,
            r`SELECT CONNECTION_ID() AS my_conn, CURRENT_USER() AS me, @@version AS ver;
SHOW VARIABLES LIKE 'default_authentication_plugin';

-- OUTPUT: (example)
-- my_conn | me             | ver
--      88 | app@10.0.0.%   | 8.0.36
-- default_authentication_plugin | caching_sha2_password`],
        [`Every query needs an identity and a session context (database, character set, transaction state, SQL mode). The layer isolates users from each other and enforces limits.`,
            r`-- Per-account limits enforced at connect/execute time
CREATE USER 'report'@'%' IDENTIFIED BY 'S3cret!pw'
  WITH MAX_USER_CONNECTIONS 5 MAX_QUERIES_PER_HOUR 20000;
SHOW GRANTS FOR 'report'@'%';

-- OUTPUT:
-- Grants for report@%
-- GRANT USAGE ON *.* TO report@% WITH MAX_QUERIES_PER_HOUR 20000 MAX_USER_CONNECTIONS 5`],
        [`Production: TLS between app and server, connection pooling in the app, a proxy (ProxySQL/MySQL Router) to multiplex, and wait_timeout to drop abandoned sessions.`,
            r`SHOW SESSION STATUS LIKE 'Ssl_cipher';
SELECT @@wait_timeout AS idle_s, @@max_connections AS max_c, @@require_secure_transport AS tls_only;

-- OUTPUT: (example)
-- Ssl_cipher | TLS_AES_256_GCM_SHA384
-- idle_s | max_c | tls_only
--  28800 |   500 |        1`],
        [`<b>Advantages:</b> thread-per-connection is simple and gives full session isolation; thread cache makes reconnects cheap; pluggable auth (LDAP, PAM, Kerberos in Enterprise).`,
            r`-- Session state stays private to the connection
SET @cart_id = 99;                  -- user variable, visible only here
SET SESSION sql_mode = 'STRICT_ALL_TABLES';
SELECT @cart_id AS cart, @@session.sql_mode AS mode;

-- OUTPUT:
-- cart | mode
--   99 | STRICT_ALL_TABLES`],
        [`<b>Disadvantages:</b> each connection costs memory and a thread; thousands of connections cause scheduler thrash; the TCP+TLS+auth handshake is expensive per connection.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Connections','Aborted_connects','Threads_connected');

-- OUTPUT: (example)
-- Connections       | 9100233
-- Aborted_connects  | 41
-- Threads_connected | 320`],
        [`<b>Limitations:</b> max_connections is a hard cap; password-less or old auth plugins limit client driver compatibility; the Thread Pool plugin is only in Enterprise/Percona.`,
            r`-- A legacy driver may fail with caching_sha2_password; per-user workaround:
ALTER USER 'legacy'@'%' IDENTIFIED WITH mysql_native_password BY 'S3cret!pw';
SELECT user, plugin FROM mysql.user WHERE user IN ('legacy','report');

-- OUTPUT: (example)
-- user   | plugin
-- legacy | mysql_native_password
-- report | caching_sha2_password`],
        `
   Client ──TCP/socket──► [ handshake ► TLS ► authenticate ► privilege check ]
                                        │
                                  assign thread (thread cache)
                                        │
                           session: db, charset, sql_mode, txn state
                                        ▼
                         Parser ─► Optimizer ─► Executor ─► Engine
`,
        `Keep connection counts low and pooled, terminate TLS on the server for compliance, and give every application its own account with limits. Use a proxy when you need failover, read/write split or connection multiplexing.`
    ),

    'SQL Parser & Query Optimizer': dd(
        [`The <b>parser</b> turns SQL text into a parse tree and checks syntax; the <b>optimizer</b> rewrites it and chooses a cost-based execution plan (index choice, join order, join algorithm).`,
            r`EXPLAIN FORMAT=TREE
SELECT c.name, COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE c.country = 'IN' GROUP BY c.name;

-- OUTPUT: (example)
-- -> Table scan on <temporary>
--     -> Aggregate using temporary table
--         -> Nested loop inner join
--             -> Index lookup on c using idx_country (country='IN')
--             -> Index lookup on o using idx_cust (customer_id=c.id)`],
        [`Many plans return the same rows with a thousand-fold difference in cost. SQL says what, not how; the optimizer decides how, using table statistics.`,
            r`-- Same result, two join orders; optimizer picks the cheaper one
EXPLAIN SELECT /*+ JOIN_ORDER(o, c) */ c.name FROM customers c JOIN orders o ON o.customer_id=c.id;
EXPLAIN SELECT /*+ JOIN_ORDER(c, o) */ c.name FROM customers c JOIN orders o ON o.customer_id=c.id;

-- OUTPUT: (example)
-- first : o (ALL, 2,000,000 rows) then c (eq_ref)   cost high
-- second: c (ALL, 5,000 rows)     then o (ref)      cost low`],
        [`When a query regresses after data growth, you look at EXPLAIN, refresh statistics, add hints or histograms, and check the optimizer trace.`,
            r`ANALYZE TABLE orders UPDATE HISTOGRAM ON status WITH 16 BUCKETS;
SELECT column_name, JSON_EXTRACT(histogram,'$."number-of-buckets-specified"') AS buckets
FROM   information_schema.COLUMN_STATISTICS WHERE table_name='orders';

-- OUTPUT: (example)
-- Table      | Op        | Msg_type | Msg_text
-- shop.orders| histogram | status   | Histogram statistics created for column 'status'.
-- column_name | buckets
-- status      | 16`],
        [`<b>Advantages:</b> declarative SQL, automatic plan choice adapts to data growth, optimizer hints and invisible indexes allow controlled experiments.`,
            r`SET optimizer_trace = 'enabled=on';
SELECT * FROM orders WHERE customer_id = 7;
SELECT LEFT(trace,60) AS t FROM information_schema.OPTIMIZER_TRACE\G
SET optimizer_trace = 'enabled=off';

-- OUTPUT: (example)
-- t: { "steps": [ { "join_preparation": { "select#": 1, "steps": [`],
        [`<b>Disadvantages:</b> estimates can be wrong (skew, correlated columns), plans can flip after statistics update, and cost constants are generic.`,
            r`-- Plan instability: same query, different plan after sampling changes
SHOW VARIABLES LIKE 'innodb_stats_persistent%';
SELECT TABLE_ROWS, ROUND(DATA_LENGTH/1048576) AS mb FROM information_schema.TABLES
WHERE table_name = 'orders';

-- OUTPUT: (example)
-- innodb_stats_persistent        | ON
-- innodb_stats_persistent_sample_pages | 20
-- TABLE_ROWS | mb
--    1984312 | 410   (estimate, not exact count)`],
        [`<b>Limitations:</b> no stored plans or plan pinning in community MySQL (only hints/optimizer_switch), query cache was removed in 8.0, and some constructs (correlated subqueries in old versions) are optimized poorly.`,
            r`-- Force an index when the optimizer is wrong (use sparingly)
SELECT id FROM orders FORCE INDEX (idx_cust_created) WHERE customer_id = 7;
SELECT @@optimizer_switch LIKE '%use_invisible_indexes=off%' AS invisible_off;

-- OUTPUT: (example)
-- id
-- 12
-- 55
-- invisible_off
-- 1`],
        `
   SQL text
     │ lexer/parser           ──► syntax error?  (ERROR 1064)
     ▼
   Parse tree ─► resolve names/privileges ─► rewrite (views, subquery → semijoin)
     ▼
   Cost-based optimizer ◄── statistics, histograms, cost model
     │ chooses: indexes, join order, algorithm (nested loop / hash join)
     ▼
   Execution plan ──► Executor
`,
        `Give the optimizer good inputs: current statistics, histograms on skewed non-indexed columns, and sargable predicates. Use hints as a surgical fix with a comment explaining why, and build regression tests that capture EXPLAIN for critical queries.`
    ),

    'Execution Engine': dd(
        [`The <b>execution engine</b> runs the chosen plan: it calls the storage engine handler API row by row (read a row, find next, write a row), applies filters, joins, sorts, aggregates and returns rows to the client.`,
            r`EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 7 ORDER BY created_at LIMIT 3;

-- OUTPUT: (example)
-- -> Limit: 3 row(s)  (actual time=0.05..0.06 rows=3 loops=1)
--     -> Index lookup on orders using idx_cust_created (customer_id=7)  (actual time=0.05..0.06 rows=3 loops=1)`],
        [`The optimizer only plans; something must execute operators like sort, hash join and temp tables. Knowing which operators run explains memory and CPU use.`,
            r`-- Operators visible in the plan tell you what the engine will do
EXPLAIN FORMAT=TREE
SELECT customer_id, SUM(total) FROM orders GROUP BY customer_id ORDER BY 2 DESC LIMIT 5;

-- OUTPUT: (example)
-- -> Limit: 5 row(s)
--     -> Sort: SUM(total) DESC, limit input to 5 row(s) per chunk
--         -> Table scan on <temporary>
--             -> Aggregate using temporary table
--                 -> Table scan on orders`],
        [`Seen in practice: hash join for unindexed equi-joins (8.0.18+), filesort when ORDER BY has no matching index, temp tables for GROUP BY/DISTINCT.`,
            r`EXPLAIN FORMAT=TREE
SELECT a.id FROM big_a a JOIN big_b b ON a.k = b.k;     -- no index on k

-- OUTPUT: (example)
-- -> Inner hash join (a.k = b.k)  (cost=2.0e+9 rows=1e+7)
--     -> Table scan on a
--     -> Hash
--         -> Table scan on b`],
        [`<b>Advantages:</b> pipelined row-at-a-time iterator model uses little memory for simple queries; handler API makes the engine pluggable; LIMIT can stop early.`,
            r`-- Early termination: engine stops reading after 3 rows
EXPLAIN ANALYZE SELECT * FROM orders LIMIT 3;

-- OUTPUT: (example)
-- -> Limit: 3 row(s)  (actual time=0.03..0.04 rows=3 loops=1)
--     -> Table scan on orders  (actual time=0.03..0.03 rows=3 loops=1)`],
        [`<b>Disadvantages:</b> row-at-a-time execution is slower than columnar or vectorised engines for analytics; a single query uses one thread (no intra-query parallelism except limited cases).`,
            r`SHOW STATUS LIKE 'Created_tmp%';
SHOW STATUS LIKE 'Sort_merge_passes';

-- OUTPUT: (example)
-- Created_tmp_disk_tables  | 120
-- Created_tmp_files        | 6
-- Created_tmp_tables       | 51000
-- Sort_merge_passes        | 14   (sort spilled to disk: raise sort_buffer_size or add index)`],
        [`<b>Limitations:</b> temp table size is capped (tmp_table_size, max_heap_table_size), joins are nested loop or hash only (no merge join), and each operator is bound by single-core speed.`,
            r`SELECT @@tmp_table_size/1048576 AS tmp_mb, @@max_heap_table_size/1048576 AS heap_mb,
       @@join_buffer_size/1024 AS join_kb, @@internal_tmp_mem_storage_engine AS tmp_engine;

-- OUTPUT: (example)
-- tmp_mb | heap_mb | join_kb | tmp_engine
--  16.00 |   16.00 |     256 | TempTable`],
        `
   Plan ──► Executor (iterators)
              │ Limit ─ Sort ─ Aggregate ─ HashJoin ─ Filter
              │                      ▲ pulls one row at a time
              ▼
        Handler API: rnd_next / index_read / write_row
              ▼
        Storage engine ──► pages ──► disk
`,
        `Read EXPLAIN ANALYZE to see which operator dominates, then fix with an index, a rewrite, or a bigger buffer. For heavy analytics offload to a columnar store or replica instead of stretching the row-at-a-time engine.`
    ),

    'Storage Engines': dd(
        [`A <b>storage engine</b> is the pluggable layer that stores and retrieves data and decides transactions, locking and durability. InnoDB is the default and supports ACID, row locks, MVCC and foreign keys.`,
            r`SELECT engine, support, transactions, xa, savepoints
FROM   information_schema.ENGINES
WHERE  engine IN ('InnoDB','MyISAM','MEMORY','CSV');

-- OUTPUT: (example)
-- engine | support | transactions | xa  | savepoints
-- InnoDB | DEFAULT | YES          | YES | YES
-- MyISAM | YES     | NO           | NO  | NO
-- MEMORY | YES     | NO           | NO  | NO
-- CSV    | YES     | NO           | NO  | NO`],
        [`Different data needs different guarantees. A pluggable engine lets one SQL layer serve transactional tables, temp lookups or flat-file exchange.`,
            r`CREATE TABLE ledger  (id INT PRIMARY KEY, amt DECIMAL(10,2)) ENGINE=InnoDB;
CREATE TABLE lookup  (k INT PRIMARY KEY, v VARCHAR(20))   ENGINE=MEMORY;
SELECT table_name, engine FROM information_schema.TABLES
WHERE  table_schema = DATABASE() AND table_name IN ('ledger','lookup');

-- OUTPUT:
-- table_name | engine
-- ledger     | InnoDB
-- lookup     | MEMORY`],
        [`In production nearly everything is InnoDB; MEMORY/MyISAM remain only for legacy or special cases; analytics usually go to a different system (ClickHouse) or the HeatWave/NDB variants.`,
            r`-- Audit: find any non-InnoDB user tables
SELECT table_schema, table_name, engine
FROM   information_schema.TABLES
WHERE  engine <> 'InnoDB'
  AND  table_schema NOT IN ('mysql','sys','performance_schema','information_schema');

-- OUTPUT: (example)
-- table_schema | table_name | engine
-- legacy       | old_hits   | MyISAM`],
        [`<b>Advantages (InnoDB):</b> crash recovery via redo log, row-level locking, MVCC non-blocking reads, foreign keys, clustered primary key, online DDL.`,
            r`START TRANSACTION;
INSERT INTO ledger VALUES (1, 100.00);
ROLLBACK;                                  -- InnoDB can undo
SELECT COUNT(*) AS rows_left FROM ledger;

-- OUTPUT:
-- rows_left
-- 0`],
        [`<b>Disadvantages:</b> more write overhead than MyISAM, larger disk footprint, and COUNT(*) without a WHERE must scan an index because rows are versioned.`,
            r`-- MyISAM stores an exact row count; InnoDB must count visible rows
EXPLAIN SELECT COUNT(*) FROM orders;

-- OUTPUT: (example)
-- type  | key        | rows    | Extra
-- index | idx_status | 1984312 | Using index   (scans the smallest index)`],
        [`<b>Limitations:</b> MyISAM has no transactions or crash safety and uses table locks; MEMORY loses data on restart and cannot hold TEXT/BLOB; an InnoDB row is limited to about 8 KB inline (long values go off-page).`,
            r`-- MEMORY table vanishes on restart; converting is a full table rebuild
ALTER TABLE lookup ENGINE = InnoDB;
SHOW CREATE TABLE lookup\G

-- OUTPUT: (excerpt)
-- CREATE TABLE lookup (
--   k int NOT NULL,
--   v varchar(20) DEFAULT NULL,
--   PRIMARY KEY (k)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`],
        `
        SQL layer (parser, optimizer, executor)
        ───────────── handler API ──────────────
        ┌─────────┬─────────┬─────────┬─────────┐
        │ InnoDB  │ MyISAM  │ MEMORY  │  CSV    │
        │ ACID    │ legacy  │ RAM     │ files   │
        │ row lock│ tbl lock│ no TXN  │ no index│
        └────┬────┴─────────┴─────────┴─────────┘
             ▼
     buffer pool ─► redo log ─► tablespace files (.ibd)
`,
        `Standardise on InnoDB; require an explicit review for any other engine. Understand the clustered primary key (pick short, monotonic keys), plan for online DDL limits, and treat MEMORY as a cache that must be rebuildable.`
    )
};
