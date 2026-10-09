// Module 47 (Production-Level MySQL).
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s47k: Record<string, DeepDive> = {
    'Monitoring, Logging & Metrics': dd(
        [`Production MySQL is watched through three signals: <b>metrics</b> (status counters), <b>logs</b> (slow query, error) and <b>traces</b> of statements (performance_schema). Start with the handful of counters that predict trouble.`,
            r`SHOW GLOBAL STATUS
WHERE Variable_name IN ('Threads_connected','Threads_running','Slow_queries','Aborted_connects','Questions');

-- OUTPUT: (example)
-- +-------------------+----------+
-- | Variable_name     | Value    |
-- +-------------------+----------+
-- | Aborted_connects  | 3        |
-- | Questions         | 18450211 |
-- | Slow_queries      | 41       |
-- | Threads_connected | 87       |
-- | Threads_running   | 4        |
-- +-------------------+----------+`],
        [`Raw numbers are useless without capacity context. Connection usage as a percentage of max_connections is the classic alert: at 100 percent new clients are refused.`,
            r`SELECT ts.VARIABLE_VALUE                       AS connected,
       @@max_connections                        AS max_conn,
       ROUND(100 * ts.VARIABLE_VALUE / @@max_connections, 1) AS pct_used
FROM   performance_schema.global_status ts
WHERE  ts.VARIABLE_NAME = 'Threads_connected';

-- OUTPUT: (example)
-- +-----------+----------+----------+
-- | connected | max_conn | pct_used |
-- +-----------+----------+----------+
-- | 87        |      500 |     17.4 |
-- +-----------+----------+----------+`],
        [`The slow query log is the first tool for finding bad SQL. Enable it dynamically, then rank statements with the sys schema.`,
            r`SET GLOBAL slow_query_log      = 'ON';
SET GLOBAL long_query_time      = 0.5;                  -- seconds
SET GLOBAL log_slow_extra       = 'ON';                 -- more fields per entry (8.0.14+)

SELECT query, exec_count, avg_latency, rows_examined_avg
FROM   sys.statement_analysis
ORDER  BY total_latency DESC
LIMIT  3;

-- OUTPUT: (example)
-- +--------------------------------------------+------------+-------------+-------------------+
-- | query                                      | exec_count | avg_latency | rows_examined_avg |
-- +--------------------------------------------+------------+-------------+-------------------+
-- | SELECT * FROM orders WHERE status = ?      |      12044 | 812.40 ms   |            480211 |
-- | SELECT COUNT(*) FROM events WHERE ts > ?   |        930 | 1.92 s      |           2210007 |
-- | UPDATE stock SET qty = qty - ? WHERE id = ?|      88201 | 1.10 ms     |                 1 |
-- +--------------------------------------------+------------+-------------+-------------------+`],
        [`<b>Advantages:</b> performance_schema groups statements by digest (normalised text), so thousands of similar queries become one row with count and total time. It is built in and needs no agent.`,
            r`SELECT LEFT(DIGEST_TEXT, 40)                 AS query,
       COUNT_STAR                             AS calls,
       ROUND(SUM_TIMER_WAIT / 1e12, 2)        AS total_s,
       ROUND(AVG_TIMER_WAIT / 1e9, 2)         AS avg_ms
FROM   performance_schema.events_statements_summary_by_digest
ORDER  BY SUM_TIMER_WAIT DESC
LIMIT  2;

-- OUTPUT: (example)
-- +------------------------------------------+-------+---------+--------+
-- | query                                    | calls | total_s | avg_ms |
-- +------------------------------------------+-------+---------+--------+
-- | SELECT * FROM orders WHERE status = ?    | 12044 |    9784 | 812.40 |
-- | SELECT COUNT(*) FROM events WHERE ts > ? |   930 |    1786 |1920.00 |
-- +------------------------------------------+-------+---------+--------+`],
        [`<b>Disadvantages:</b> observability has a cost. The general log records every statement and can fill a disk and slow the server, so it stays off in production; slow logs need rotation.`,
            r`SELECT @@general_log AS general_log, @@slow_query_log AS slow_log, @@slow_query_log_file AS slow_file;

FLUSH SLOW LOGS;          -- reopen the slow log file after logrotate renamed it

-- OUTPUT: (example)
-- +-------------+----------+-------------------------------+
-- | general_log | slow_log | slow_file                     |
-- +-------------+----------+-------------------------------+
-- |           0 |        1 | /var/lib/mysql/db1-slow.log   |
-- +-------------+----------+-------------------------------+`],
        [`<b>Limitations:</b> status counters are cumulative since startup and reset on restart. Rates come from the difference of two samples, which your monitoring system (Prometheus mysqld_exporter, PMM) computes. Only the latest deadlock is kept unless you log all of them.`,
            r`SELECT VARIABLE_VALUE INTO @q1 FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Questions';
SELECT SLEEP(10);
SELECT VARIABLE_VALUE INTO @q2 FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Questions';
SELECT ROUND((@q2 - @q1) / 10, 1) AS queries_per_second;

SET GLOBAL innodb_print_all_deadlocks = ON;     -- write every deadlock to the error log

-- OUTPUT: (example)
-- +--------------------+
-- | queries_per_second |
-- +--------------------+
-- |              412.6 |
-- +--------------------+`],
        `
   MySQL --status counters--> exporter --> Prometheus --> Grafana --> alerts
     |---- slow log / error log --> Loki / ELK ---------> search
     +---- performance_schema (digests, waits) --> sys schema --> top queries
   Golden signals: latency, traffic (QPS), errors, saturation (connections, buffer pool, replica lag)
`,
        `Alert on symptoms users feel (latency, errors, replication lag, disk, connections) and keep causes (digests, locks, buffer pool) for diagnosis. Keep long_query_time low enough to be useful but sample or rotate to bound cost, and ship logs off the box. Dashboards without runbooks do not reduce downtime.`
    ),

    'Query Profiling & Capacity Planning': dd(
        [`<b>EXPLAIN ANALYZE</b> (8.0.18+) runs the query and prints the plan with real timings and row counts, so you see where time is actually spent.`,
            r`CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, total DECIMAL(10,2), KEY ix_cust (customer_id));

EXPLAIN ANALYZE
SELECT customer_id, SUM(total) FROM orders WHERE customer_id = 7 GROUP BY customer_id;

-- OUTPUT: (example)
-- -> Group aggregate: sum(orders.total)  (actual time=0.09..0.09 rows=1 loops=1)
--     -> Index lookup on orders using ix_cust (customer_id=7)  (cost=1.1 rows=3) (actual time=0.05..0.07 rows=3 loops=1)`],
        [`Capacity planning starts with knowing where the bytes are. information_schema.TABLES gives data and index size per table.`,
            r`SELECT table_name,
       ROUND(data_length  / 1024 / 1024 / 1024, 2) AS data_gb,
       ROUND(index_length / 1024 / 1024 / 1024, 2) AS index_gb,
       table_rows
FROM   information_schema.TABLES
WHERE  table_schema = 'shop'
ORDER  BY data_length + index_length DESC
LIMIT  3;

-- OUTPUT: (example; table_rows is an estimate)
-- +-------------+---------+----------+------------+
-- | table_name  | data_gb | index_gb | table_rows |
-- +-------------+---------+----------+------------+
-- | order_items |   41.20 |    18.75 |  310000000 |
-- | orders      |   12.40 |     6.10 |   95000000 |
-- | customers   |    1.10 |     0.40 |    4200000 |
-- +-------------+---------+----------+------------+`],
        [`Record size snapshots on a schedule and project growth. This turns "the disk is full" surprises into a planned purchase.`,
            r`CREATE TABLE capacity_log (month DATE PRIMARY KEY, gb DECIMAL(8,2));
INSERT INTO capacity_log VALUES ('2024-01-01',100),('2024-02-01',110),('2024-03-01',121);

WITH d AS (SELECT month, gb, gb - LAG(gb) OVER (ORDER BY month) AS delta FROM capacity_log)
SELECT MAX(gb)                              AS now_gb,
       ROUND(AVG(delta), 2)                 AS avg_gb_per_month,
       ROUND(MAX(gb) + 6 * AVG(delta), 2)   AS in_6_months
FROM   d;

-- OUTPUT:
-- +--------+------------------+-------------+
-- | now_gb | avg_gb_per_month | in_6_months |
-- +--------+------------------+-------------+
-- | 121.00 |            10.50 |      184.00 |
-- +--------+------------------+-------------+`],
        [`<b>Advantages:</b> the sys schema finds waste: indexes never used still cost write time, memory and disk.`,
            r`SELECT object_schema, object_name, index_name
FROM   sys.schema_unused_indexes
WHERE  object_schema = 'shop';

SELECT table_name, redundant_index_name, dominant_index_name
FROM   sys.schema_redundant_indexes
WHERE  table_schema = 'shop';

-- OUTPUT: (example; usage is counted since the last restart, so check after a full business cycle)
-- +---------------+-------------+-----------------+
-- | object_schema | object_name | index_name      |
-- +---------------+-------------+-----------------+
-- | shop          | orders      | ix_orders_notes |
-- +---------------+-------------+-----------------+`],
        [`<b>Disadvantages:</b> the memory side of capacity is the buffer pool. If reads constantly miss it, the disk becomes the bottleneck. EXPLAIN ANALYZE also really executes the statement, so use care on heavy queries.`,
            r`SELECT ROUND(100 * (1 - r.VARIABLE_VALUE / q.VARIABLE_VALUE), 2) AS buffer_pool_hit_pct
FROM   performance_schema.global_status r, performance_schema.global_status q
WHERE  r.VARIABLE_NAME = 'Innodb_buffer_pool_reads'
  AND  q.VARIABLE_NAME = 'Innodb_buffer_pool_read_requests';

-- OUTPUT: (example)
-- +----------------------+
-- | buffer_pool_hit_pct  |
-- +----------------------+
-- |                99.97 |
-- +----------------------+`],
        [`<b>Limitations:</b> the optimiser works from statistics. When estimated rows differ wildly from actual rows, the plan is probably bad; refresh statistics or add a histogram.`,
            r`ANALYZE TABLE orders;                                        -- refresh index statistics
ANALYZE TABLE orders UPDATE HISTOGRAM ON status WITH 16 BUCKETS;   -- 8.0: data distribution for non-indexed columns

-- Plan line to inspect in EXPLAIN ANALYZE: (cost=... rows=EST) (actual ... rows=ACT)
--   EST 10 vs ACT 480000 => stale or skewed stats

-- OUTPUT:
-- +-------------+-----------+----------+-----------------------------------------------+
-- | Table       | Op        | Msg_type | Msg_text                                      |
-- +-------------+-----------+----------+-----------------------------------------------+
-- | shop.orders | analyze   | status   | OK                                            |
-- | shop.orders | histogram | status   | Histogram statistics created for column 'status'. |
-- +-------------+-----------+----------+-----------------------------------------------+`],
        `
   query --> EXPLAIN ANALYZE --> estimated rows vs actual rows --> index / rewrite
   data growth: size now ---- +10.5 GB/month ----> in 6 months 184 GB
   disk budget = projection x (1 + 30% headroom) + backups + binlogs
   memory: working set vs innodb_buffer_pool_size (hit ratio near 99.9%)
`,
        `Plan capacity on the slowest resource: usually IO and the working set in memory, not CPU. Track growth per table, add headroom of at least 30 percent for online DDL and backups, and review unused indexes regularly. Load-test with production-sized data, since plans change with table size.`
    ),

    'Backup Verification & Disaster Recovery': dd(
        [`A backup is only real if it restores. Logical backups with mysqldump are portable and readable; <code>--single-transaction</code> takes a consistent InnoDB snapshot without locking writers, and <code>--source-data=2</code> records the binlog position as a comment.`,
            r`-- Run from the shell (shown as comments):
--   mysqldump --single-transaction --routines --triggers --events --source-data=2 shop > shop_full.sql
-- Check the recorded binlog coordinates in the dump header:
--   grep -m1 "CHANGE REPLICATION SOURCE" shop_full.sql

SHOW MASTER STATUS;       -- same coordinates on the live server (SHOW BINARY LOG STATUS in newer 8.4)

-- OUTPUT: (example)
-- -- CHANGE REPLICATION SOURCE TO SOURCE_LOG_FILE='binlog.000412', SOURCE_LOG_POS=157;
-- +---------------+----------+
-- | File          | Position |
-- +---------------+----------+
-- | binlog.000412 |      157 |
-- +---------------+----------+`],
        [`Untested backups fail when needed (truncated file, missing grants, wrong version). Restore into a scratch server on a schedule and compare row counts and checksums with the source.`,
            r`-- On source and on the restored copy, run the same checks and compare:
SELECT COUNT(*) AS order_rows FROM shop.orders;
CHECKSUM TABLE shop.orders, shop.customers;

-- Automate: restore latest dump -> run checks -> alert if any value differs or restore fails.

-- OUTPUT: (example; both servers must print identical values)
-- +------------+
-- | order_rows |
-- +------------+
-- |    9500000 |
-- +------------+
-- +----------------+------------+
-- | Table          | Checksum   |
-- +----------------+------------+
-- | shop.orders    | 2841190325 |
-- | shop.customers | 1209981172 |
-- +----------------+------------+`],
        [`Disaster recovery needs point-in-time recovery (PITR): restore the last full backup, then replay binary logs up to just before the mistake (for example an accidental DROP at 14:05).`,
            r`SHOW BINARY LOGS;

-- Shell: replay from the backup position to one second before the bad statement
--   mysqlbinlog --start-position=157 --stop-datetime="2024-05-10 14:04:59" binlog.000412 binlog.000413 | mysql -u root -p

-- OUTPUT: (example)
-- +---------------+-----------+-----------+
-- | Log_name      | File_size | Encrypted |
-- +---------------+-----------+-----------+
-- | binlog.000412 | 104857712 | No        |
-- | binlog.000413 |  52113640 | No        |
-- +---------------+-----------+-----------+`],
        [`<b>Advantages:</b> the Clone plugin (8.0.17+) copies a whole physical data directory quickly, handy for seeding replicas and fast restores of big servers.`,
            r`INSTALL PLUGIN clone SONAME 'mysql_clone.so';
CLONE LOCAL DATA DIRECTORY = '/backup/clone_2024_05_10';        -- target must not exist
SELECT STATE, ERROR_NO FROM performance_schema.clone_status;

-- OUTPUT: (example)
-- +-----------+----------+
-- | STATE     | ERROR_NO |
-- +-----------+----------+
-- | Completed |        0 |
-- +-----------+----------+`],
        [`<b>Disadvantages:</b> logical dumps are slow to restore for terabytes, and --single-transaction is only consistent for InnoDB. Find non-transactional tables before you trust a dump.`,
            r`SELECT table_schema, table_name, engine
FROM   information_schema.TABLES
WHERE  engine <> 'InnoDB'
  AND  table_schema NOT IN ('mysql','sys','information_schema','performance_schema');

-- OUTPUT: (example)
-- +--------------+------------+--------+
-- | table_schema | table_name | engine |
-- +--------------+------------+--------+
-- | legacy       | sessions   | MyISAM |
-- +--------------+------------+--------+      <- not covered by a consistent snapshot`],
        [`<b>Limitations:</b> recovery points depend on binlog retention. If binlogs expire before the next full backup you cannot do PITR across that gap. RPO is the data you can lose; RTO is the time to be back.`,
            r`SELECT @@binlog_expire_logs_seconds / 86400 AS retention_days,
       @@sync_binlog                          AS sync_binlog,
       @@innodb_flush_log_at_trx_commit       AS flush_at_commit;

-- RPO ~ 0 needs sync_binlog=1 and innodb_flush_log_at_trx_commit=1 (durable) plus replication/off-site binlog copy
-- RTO ~ restore time + binlog replay time (measure it in drills)

-- OUTPUT: (example, defaults)
-- +----------------+-------------+-----------------+
-- | retention_days | sync_binlog | flush_at_commit |
-- +----------------+-------------+-----------------+
-- |        30.0000 |           1 |               1 |
-- +----------------+-------------+-----------------+`],
        `
   full backup (nightly) ---+
   binlogs (continuous) ----+--> restore full --> replay binlog to T-1s --> verify --> cut over
   scratch server: weekly automated restore + CHECKSUM compare  (proves the backup)
   store copies off-site and in another region; encrypt them
`,
        `Define RPO and RTO with the business, then choose tools: logical dumps for small data, XtraBackup or Clone for large, binlog shipping for PITR, and replicas or a cluster for fast failover. Backups do not replace replication and replication does not replace backups (a bad DELETE replicates instantly). Run restore drills and time them.`
    ),

    'Security Hardening': dd(
        [`Hardening starts with <b>least privilege</b>: each application gets its own account, restricted by host and by the exact privileges it needs, never root.`,
            r`CREATE USER 'shop_app'@'10.0.%' IDENTIFIED BY 'Str0ng!Secret-ChangeMe';
GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'shop_app'@'10.0.%';
SHOW GRANTS FOR 'shop_app'@'10.0.%';

-- OUTPUT:
-- +-------------------------------------------------------------------------+
-- | Grants for shop_app@10.0.%                                              |
-- +-------------------------------------------------------------------------+
-- | GRANT USAGE ON *.* TO 'shop_app'@'10.0.%'                               |
-- | GRANT SELECT, INSERT, UPDATE, DELETE ON 'shop'.* TO 'shop_app'@'10.0.%' |
-- +-------------------------------------------------------------------------+`],
        [`Granting privileges user by user does not scale. Roles (MySQL 8) bundle privileges so a new analyst gets the right access with one statement.`,
            r`CREATE ROLE 'reporting_ro';
GRANT SELECT ON shop.* TO 'reporting_ro';

CREATE USER 'meena'@'%' IDENTIFIED BY 'An0ther!Secret-ChangeMe';
GRANT 'reporting_ro' TO 'meena'@'%';
SET DEFAULT ROLE 'reporting_ro' TO 'meena'@'%';             -- active at login
SHOW GRANTS FOR 'meena'@'%';

-- OUTPUT:
-- +-----------------------------------------+
-- | Grants for meena@%                      |
-- +-----------------------------------------+
-- | GRANT USAGE ON *.* TO 'meena'@'%'       |
-- | GRANT 'reporting_ro'@'%' TO 'meena'@'%' |
-- +-----------------------------------------+`],
        [`Production accounts must connect over TLS and use strong passwords. Enforce both on the server and per user.`,
            r`ALTER USER 'shop_app'@'10.0.%' REQUIRE SSL;                 -- this user may only connect over TLS
SET PERSIST require_secure_transport = ON;                   -- or for everyone (TCP clients)
INSTALL COMPONENT 'file://component_validate_password';
SHOW VARIABLES LIKE 'validate_password.policy';
SHOW STATUS LIKE 'Ssl_cipher';                               -- in a TLS session

-- OUTPUT: (example)
-- +--------------------------+--------+
-- | Variable_name            | Value  |
-- +--------------------------+--------+
-- | validate_password.policy | MEDIUM |
-- +--------------------------+--------+
-- +---------------+------------------------+
-- | Variable_name | Value                  |
-- +---------------+------------------------+
-- | Ssl_cipher    | TLS_AES_256_GCM_SHA384 |
-- +---------------+------------------------+`],
        [`<b>Advantages:</b> regular audits are cheap SQL. Look for accounts open to any host and for expired or passwordless accounts.`,
            r`SELECT user, host, plugin, password_expired
FROM   mysql.user
WHERE  host = '%'
   OR  authentication_string = ''
ORDER  BY user;

-- OUTPUT: (example)
-- +-----------+------+-----------------------+------------------+
-- | user      | host | plugin                | password_expired |
-- +-----------+------+-----------------------+------------------+
-- | meena     | %    | caching_sha2_password | N                |
-- | old_admin | %    | mysql_native_password | N                |   <- review or drop
-- +-----------+------+-----------------------+------------------+`],
        [`<b>Disadvantages:</b> broad grants (ALL on *.*) hide risk. Column-level privileges hide sensitive columns such as email or salary from reporting users, at the price of more grants to manage.`,
            r`GRANT SELECT (id, name) ON shop.customers TO 'report'@'%';
-- Logged in as report:
SELECT id, name  FROM shop.customers LIMIT 1;           -- allowed
SELECT id, email FROM shop.customers LIMIT 1;           -- email not granted

-- OUTPUT:
-- +----+-------+
-- | id | name  |
-- +----+-------+
-- |  1 | Asha  |
-- +----+-------+
-- ERROR 1143 (42000): SELECT command denied to user 'report'@'localhost' for column 'email' in table 'customers'`],
        [`<b>Limitations:</b> encryption at rest needs a keyring (component_keyring_file or a KMS) configured first; without it the ALTER fails. File import/export is limited by secure_file_priv. Neither protects against SQL injection, which only parameterised queries stop.`,
            r`SELECT @@secure_file_priv AS file_dir;
ALTER TABLE shop.customers ENCRYPTION = 'Y';              -- needs a keyring component loaded
SELECT table_name, create_options
FROM   information_schema.TABLES
WHERE  table_schema = 'shop' AND table_name = 'customers';

-- OUTPUT: (example)
-- +-----------------------+
-- | file_dir              |
-- +-----------------------+
-- | /var/lib/mysql-files/ |
-- +-----------------------+
-- +------------+-----------------------+
-- | table_name | create_options        |
-- +------------+-----------------------+
-- | customers  | ENCRYPTION='Y'        |
-- +------------+-----------------------+`],
        `
   Internet --> [firewall/VPC] --> app tier --TLS--> MySQL
                                        |            |-- per-app user @ host (least privilege)
                                        |            |-- roles, column grants
   secrets in vault <-------------------+            |-- encryption at rest (keyring)
                                                     +-- audit + backups encrypted
`,
        `Layer the defences: network isolation, TLS, least-privilege accounts and roles, secret rotation through a vault, encryption at rest and an audit trail (Enterprise Audit or Percona audit log plugin). Keep MySQL patched, remove anonymous and test accounts, disable LOCAL INFILE unless needed, and test restores of encrypted backups including key recovery.`
    ),

    'Schema Migration & Zero-Downtime Migrations': dd(
        [`MySQL 8 supports <b>online DDL</b>. <code>ALGORITHM=INSTANT</code> changes only metadata, so adding a column to a billion-row table finishes immediately without blocking reads or writes.`,
            r`CREATE TABLE orders (id BIGINT PRIMARY KEY, total DECIMAL(10,2));

ALTER TABLE orders ADD COLUMN note VARCHAR(100) NULL, ALGORITHM=INSTANT;   -- 8.0.12+
SHOW CREATE TABLE orders;

-- OUTPUT:
-- Query OK, 0 rows affected (0.01 sec)
-- Records: 0  Duplicates: 0  Warnings: 0`],
        [`Always name the algorithm and lock level. Then MySQL refuses an operation that would silently lock or copy the table, instead of surprising you in production.`,
            r`CREATE TABLE orders (id BIGINT PRIMARY KEY, total DECIMAL(10,2), status VARCHAR(10));

ALTER TABLE orders ADD INDEX ix_status (status), ALGORITHM=INPLACE, LOCK=NONE;     -- online, allowed
ALTER TABLE orders MODIFY total DECIMAL(12,2) NOT NULL, ALGORITHM=INSTANT;          -- not instant-capable

-- OUTPUT:
-- Query OK, 0 rows affected (0.04 sec)
-- ERROR 1845 (0A000): ALGORITHM=INSTANT is not supported for this operation. Try ALGORITHM=COPY/INPLACE.`],
        [`For changes that need a rebuild, use <b>expand and contract</b>: add the new column, backfill in small batches, switch the application, then drop the old column in a later release.`,
            r`CREATE TABLE users (id INT PRIMARY KEY, email VARCHAR(60), email_norm VARCHAR(60) NULL);
INSERT INTO users (id, email) VALUES (1,'A@X.com'),(2,'B@X.com'),(3,'C@X.com');

-- 1) expand: new column added (INSTANT); app starts dual-writing
-- 2) backfill in small id ranges so locks and replication lag stay short
UPDATE users SET email_norm = LOWER(email) WHERE id BETWEEN 1 AND 1000 AND email_norm IS NULL;
-- repeat for the next range until ROW_COUNT() = 0; 3) switch reads; 4) contract: drop old column later

SELECT id, email_norm FROM users ORDER BY id;

-- OUTPUT:
-- +----+------------+
-- | id | email_norm |
-- +----+------------+
-- |  1 | a@x.com    |
-- |  2 | b@x.com    |
-- |  3 | c@x.com    |
-- +----+------------+`],
        [`<b>Advantages:</b> for operations online DDL cannot do, external tools gh-ost and pt-online-schema-change build a shadow table, copy rows in chunks, keep it in sync, and swap names atomically.`,
            r`-- Shell, shown as comments:
--   gh-ost --host=db1 --database=shop --table=orders \
--          --alter="MODIFY total DECIMAL(12,2) NOT NULL" \
--          --max-lag-millis=1500 --chunk-size=1000 --execute
-- Copy progress is throttled by replica lag, and the cut-over is a quick rename.

-- OUTPUT: (example)
-- Copy: 5400000/9500000 56.8%; Applied: 12044; Backlog: 0/1000; Elapsed: 18m; ETA: 14m
-- [info] Done migrating shop.orders`],
        [`<b>Disadvantages:</b> even "online" DDL needs a brief metadata lock. A long-running transaction on the table blocks the ALTER, and then every new query queues behind the ALTER. Set a short lock wait and retry.`,
            r`SET SESSION lock_wait_timeout = 5;                       -- give up quickly instead of piling up queries
ALTER TABLE orders ADD COLUMN flag TINYINT NULL, ALGORITHM=INSTANT;

-- Who is holding or waiting for metadata locks?
SELECT object_name, lock_type, lock_status, owner_thread_id
FROM   performance_schema.metadata_locks
WHERE  object_schema = 'shop' AND object_name = 'orders';

-- OUTPUT: (example when blocked)
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
-- +-------------+-------------------+-------------+-----------------+
-- | object_name | lock_type         | lock_status | owner_thread_id |
-- +-------------+-------------------+-------------+-----------------+
-- | orders      | SHARED_READ       | GRANTED     |              88 |   <- the old transaction
-- | orders      | EXCLUSIVE         | PENDING     |              91 |   <- our ALTER waiting
-- +-------------+-------------------+-------------+-----------------+`],
        [`<b>Limitations:</b> INSTANT changes are versioned inside the table; MySQL allows a limited number (64 row versions in 8.0.29+) before a rebuild is required. Changing a column type, or the primary key, rebuilds the table.`,
            r`SELECT name, total_row_versions
FROM   information_schema.INNODB_TABLES
WHERE  name = 'shop/orders';

-- After the limit is reached, further INSTANT column changes fail until:
ALTER TABLE orders ENGINE = InnoDB, ALGORITHM=INPLACE;       -- rebuild, resets row versions

-- OUTPUT: (example)
-- +-------------+--------------------+
-- | name        | total_row_versions |
-- +-------------+--------------------+
-- | shop/orders |                  3 |
-- +-------------+--------------------+`],
        `
   expand ---------> backfill ----------> switch ----------> contract
   add column        copy in batches      app reads new      drop old column
   (INSTANT)         (small id ranges)    column             (next release)
   old and new code both work at every step => rollback is always possible
   big rebuilds: gh-ost: shadow table + binlog sync + atomic RENAME
`,
        `Make every migration backward compatible with the previous app version, ship schema and code in separate steps, and put migrations through Flyway or Liquibase in CI against a production-size copy. Check the metadata lock risk (long transactions, replicas lagging) before running, set lock_wait_timeout, and keep a tested rollback.`
    ),

    'Deployment & Scaling Strategies': dd(
        [`Scale reads first with <b>replication</b>: a primary takes writes and replicas copy its binary log. GTIDs make attaching a replica simple.`,
            r`-- On the replica (MySQL 8.0.22+ syntax)
CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = 'db-primary', SOURCE_USER = 'repl', SOURCE_PASSWORD = 'change-me',
    SOURCE_AUTO_POSITION = 1, SOURCE_SSL = 1;
START REPLICA;
SHOW REPLICA STATUS;

-- OUTPUT: (example, key fields only)
-- Replica_IO_Running: Yes
-- Replica_SQL_Running: Yes
-- Seconds_Behind_Source: 0`],
        [`Replicas must be read-only so an accidental write cannot create divergence. Check the flags and measure lag before sending reads there.`,
            r`SET PERSIST read_only = ON;
SET PERSIST super_read_only = ON;                       -- blocks even privileged accounts
SELECT @@read_only AS ro, @@super_read_only AS super_ro, @@hostname AS host;

-- OUTPUT: (example)
-- +----+----------+-----------+
-- | ro | super_ro | host      |
-- +----+----------+-----------+
-- |  1 |        1 | db-rep-01 |
-- +----+----------+-----------+`],
        [`Applications should not hard-code which server to use. A proxy such as ProxySQL routes writes to the primary and SELECTs to replicas, and also pools connections.`,
            r`-- ProxySQL admin interface (it speaks the MySQL protocol)
INSERT INTO mysql_query_rules (rule_id, active, match_digest, destination_hostgroup, apply)
VALUES (10, 1, '^SELECT .* FOR UPDATE', 10, 1),     -- locking reads go to the primary (hostgroup 10)
       (20, 1, '^SELECT',               20, 1);     -- other reads go to the replicas (hostgroup 20)
LOAD MYSQL QUERY RULES TO RUNTIME;
SAVE MYSQL QUERY RULES TO DISK;

-- OUTPUT:
-- Query OK, 2 rows affected (0.00 sec)
-- Query OK, 0 rows affected (0.00 sec)
-- Query OK, 0 rows affected (0.01 sec)`],
        [`<b>Advantages:</b> InnoDB Cluster (Group Replication + MySQL Router) gives automatic failover: if the primary dies, the group elects a new one and the router redirects clients.`,
            r`SELECT member_host, member_state, member_role
FROM   performance_schema.replication_group_members
ORDER  BY member_host;

-- OUTPUT: (example)
-- +-------------+--------------+-------------+
-- | member_host | member_state | member_role |
-- +-------------+--------------+-------------+
-- | db1         | ONLINE       | PRIMARY     |
-- | db2         | ONLINE       | SECONDARY   |
-- | db3         | ONLINE       | SECONDARY   |
-- +-------------+--------------+-------------+`],
        [`<b>Disadvantages:</b> replication is asynchronous by default, so a replica can be behind and a user may not see their own write. Read-your-writes can be enforced by waiting for the transaction's GTID.`,
            r`-- Primary: after the write, remember its GTID (also returned in the OK packet when session tracking is on)
SELECT @@gtid_executed;

-- Replica: wait up to 1 second until that transaction is applied before reading
SELECT WAIT_FOR_EXECUTED_GTID_SET('3e11fa47-71ca-11e1-9e33-c80aa9429562:1-100', 1) AS waited;

-- OUTPUT: (example)
-- +--------+
-- | waited |
-- +--------+
-- |      0 |      <- 0 = applied in time, 1 = timeout (fall back to the primary)
-- +--------+`],
        [`<b>Limitations:</b> replicas scale reads only. Write throughput is limited by one primary, so the next step is sharding (splitting data by a key across servers), which complicates joins, transactions and resharding.`,
            r`-- Simple range or modulo sharding by user id across 4 servers
SELECT user_id, MOD(user_id, 4) AS shard
FROM  (SELECT 1001 AS user_id UNION ALL SELECT 1002 UNION ALL SELECT 1003 UNION ALL SELECT 1004) u;

-- OUTPUT:
-- +---------+-------+
-- | user_id | shard |
-- +---------+-------+
-- |    1001 |     1 |
-- |    1002 |     2 |
-- |    1003 |     3 |
-- |    1004 |     0 |
-- +---------+-------+
-- Changing 4 to 8 shards moves most rows: use a lookup table or consistent hashing.`],
        `
                  +---------+  writes   +----------+
   App --> Proxy -+ Primary +---------->| binlog   |
            |     +---------+           +----+-----+
            | reads                          | replicate
            +----> Replica 1 <---------------+
            +----> Replica 2 <---------------+
   Failover: Orchestrator / Group Replication promotes a replica; Router/Proxy redirects
`,
        `Scale in order: tune queries and indexes, add caching, add read replicas, partition or archive, then shard only when a single primary cannot take the writes. Prefer managed services or InnoDB Cluster for failover, test failover regularly, and monitor replica lag so the proxy can drop lagging replicas. Choose a shard key that keeps related rows together and avoids hot spots.`
    )
};
