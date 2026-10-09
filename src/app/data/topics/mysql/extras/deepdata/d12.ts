// Deep dive, modules 37-40 (High Availability, Partitioning, InnoDB Internals, MVCC).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d12: Record<string, Deep> = {
    'Failover & Automatic Failover': dv(
        [`Automatic failover has four jobs: detect that the primary is gone (heartbeats, quorum), choose the best replica (most up-to-date GTID set, healthy, in the right zone), promote it and re-point other replicas, and redirect clients. Group Replication does this with consensus; external tools such as Orchestrator use observation plus a decision rule.`,
            r`var cluster = dba.getCluster('prod');
cluster.status();
-- primary db1 fails ... the group elects a new primary within seconds
cluster.status();

-- OUTPUT: (trimmed)
-- before: "primary": "db1:3306"
-- after : "primary": "db2:3306", "status": "OK_NO_TOLERANCE", "db1:3306": {"status": "(MISSING)"}`],
        [`Variants: planned switchover (graceful, no data loss), unplanned failover (crash), manual failover with scripts, and managed-service failover (RDS Multi-AZ, Aurora). Tune detection timeouts, fencing and the preferred candidate order.`,
            r`cluster.setPrimaryInstance('db2:3306');                    -- planned switchover
cluster.forceQuorumUsingPartitionOf('db2:3306');           -- emergency: regain quorum in a partition
cluster.rejoinInstance('db1:3306');                        -- bring the old primary back as secondary
SELECT member_host, member_role FROM performance_schema.replication_group_members;

-- OUTPUT:
-- member_host | member_role
-- db2         | PRIMARY
-- db1         | SECONDARY`],
        [`Mistakes: aggressive timeouts causing failovers on network blips (flapping), no fencing of the old primary (split-brain), two-node clusters without a tiebreaker, and applications that cache the old address. Use three or more voters, fencing and connection retry.`,
            r`SET PERSIST group_replication_member_expel_timeout = 5;
SET PERSIST group_replication_unreachable_majority_timeout = 30;
SHOW VARIABLES LIKE 'group_replication_member_expel_timeout';

-- OUTPUT:
-- group_replication_member_expel_timeout | 5`],
        [`Measure the real recovery time: detection time plus election plus client reconnect. The slowest part is often clients that wait on dead TCP connections; set connect and socket timeouts and use a router.`,
            r`jdbc:mysql://router:6446/shop?connectTimeout=3000&socketTimeout=30000&tcpKeepAlive=true

-- OUTPUT:
-- total unavailability in the last drill: detection 5 s + election 3 s + client recovery 8 s = 16 s`],
        [`Real-world drill checklist: kill the primary, record timestamps, verify no lost or duplicated writes, check application error rates and retries, and re-add the old node. Repeat each quarter.`,
            r`SELECT COUNT(*) AS rows_after, MAX(id) AS max_id FROM orders;
SELECT GTID_SUBTRACT('3e11...:1-1900', @@gtid_executed) AS lost_transactions;

-- OUTPUT:
-- rows_after | max_id
-- 612044     | 612044
-- lost_transactions
-- (empty)`]
    ),

    'RPO & RTO': dv(
        [`RPO (recovery point objective) is the maximum tolerated data loss measured in time; RTO (recovery time objective) is the maximum tolerated outage time. They are business requirements that decide architecture: asynchronous replication gives an RPO of the replication lag, backups give an RPO of the backup interval unless binlogs are archived, and each recovery step adds to the RTO.`,
            r`SELECT TIMESTAMPDIFF(SECOND, ts, NOW()) AS replication_lag_seconds FROM ops.heartbeat WHERE id = 1;
SELECT TIMESTAMPDIFF(MINUTE, MAX(finished_at), NOW()) AS minutes_since_last_binlog_archive FROM ops.binlog_archive_log;

-- OUTPUT:
-- replication_lag_seconds
-- 2
-- minutes_since_last_binlog_archive
-- 1`],
        [`Map targets to techniques: RPO 0 → synchronous commit (Group Replication, semi-sync AFTER_SYNC); RPO seconds → async replica plus binlog shipping; RPO hours → backups. RTO seconds → automatic failover; minutes → manual promotion; hours → restore from backup.`,
            r`SELECT 'payments' AS service, 0 AS rpo_seconds, 60 AS rto_seconds, 'Group Replication + Router' AS design
UNION ALL SELECT 'orders', 30, 300, 'async replica + binlog archive + managed failover'
UNION ALL SELECT 'reports', 3600, 14400, 'nightly physical backup + restore';

-- OUTPUT:
-- service  | rpo_seconds | rto_seconds | design
-- payments |           0 |          60 | Group Replication + Router`],
        [`Mistakes: targets nobody agreed on, estimated instead of measured RTO, forgetting dependencies (DNS, secrets, config, application warm-up), and testing only the happy path. Time each recovery step.`,
            r`-- restore 600 GB at 200 MB/s plus 10 minutes of binlog replay plus 5 minutes of checks
SELECT ROUND(600 * 1024 / 200 / 60) + 10 + 5 AS estimated_rto_minutes;

-- OUTPUT:
-- estimated_rto_minutes
-- 67`],
        [`Cost grows steeply as targets approach zero. Present options to the business with their cost and residual risk, and review targets as the data grows (restore time grows with size).`,
            r`SELECT ROUND(SUM(data_length + index_length) / 1073741824) AS db_gb, ROUND(SUM(data_length + index_length) / 1073741824 * 1024 / 200 / 60) AS restore_minutes_at_200mbs FROM information_schema.tables WHERE table_schema = 'shop';

-- OUTPUT:
-- db_gb | restore_minutes_at_200mbs
--   612 |                        52`],
        [`Real-world SLO record: keep a table of drills with measured RPO and RTO per service and compare with the targets, so evidence exists for audits.`,
            r`INSERT INTO ops.dr_drills (service, drill_date, target_rto_min, measured_rto_min, measured_data_loss_sec) VALUES ('orders', CURDATE(), 5, 7, 0);
SELECT service, measured_rto_min <= target_rto_min AS met_target FROM ops.dr_drills ORDER BY drill_date DESC LIMIT 1;

-- OUTPUT:
-- service | met_target
-- orders  |          0       (7 minutes against a 5 minute target: action item)`]
    ),

    'Disaster Recovery': dv(
        [`Disaster recovery restores service after loss of a whole site or region. It is different from high availability inside one site. It rests on copies of data and configuration in another failure domain (asynchronous cross-region replica, off-site backups and binlogs), plus a tested procedure and the supporting systems (DNS, secrets, certificates, deployment).`,
            r`-- DR replica in another region, kept read-only
CHANGE REPLICATION SOURCE TO SOURCE_HOST='primary.eu-west', SOURCE_USER='repl', SOURCE_PASSWORD='***', SOURCE_AUTO_POSITION=1, SOURCE_SSL=1, SOURCE_RETRY_COUNT=86400;
START REPLICA;
SET PERSIST super_read_only = ON;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Patterns from cheapest to fastest: backup and restore, pilot light (small standby that can scale up), warm standby (scaled-down running copy), and active-active across regions. Choose by RPO/RTO and budget. Keep backups immutable and in a separate account.`,
            r`aws s3 cp /backups/full-2026-05-01.xbstream s3://dr-backups-us/ --storage-class STANDARD_IA
aws s3api put-object-retention --bucket dr-backups-us --key full-2026-05-01.xbstream --retention Mode=COMPLIANCE,RetainUntilDate=2026-08-01T00:00:00Z

-- OUTPUT:
-- upload: ... to s3://dr-backups-us/full-2026-05-01.xbstream    (object locked until 2026-08-01)`],
        [`Mistakes: backups in the same region and account as production, never practised, forgetting non-database dependencies, and no failback plan. Write the full runbook including secrets, DNS and application configuration.`,
            r`SELECT step_no, action, owner, est_minutes FROM ops.dr_runbook WHERE plan = 'region-loss' ORDER BY step_no;

-- OUTPUT:
-- step_no | action                               | owner | est_minutes
-- 1       | Declare disaster, freeze deploys      | IC    | 5
-- 2       | Promote DR replica, enable writes     | DBA   | 10
-- 3       | Switch DNS / Router to DR region      | SRE   | 10`],
        [`Cross-region replication is asynchronous, so RPO equals the lag across regions. Monitor it and size the link. Compress binlog transactions to save bandwidth.`,
            r`SET PERSIST binlog_transaction_compression = ON;
SHOW REPLICA STATUS\G
-- Seconds_Behind_Source: 4

-- OUTPUT:
-- (compressed binlog events reduce cross-region traffic by about 70%)`],
        [`Real-world annual DR test: restore production backups into the DR region, run the application against it, measure time, and fix every gap found, then publish the report.`,
            r`SELECT scenario, started_at, finished_at, TIMESTAMPDIFF(MINUTE, started_at, finished_at) AS minutes, gaps_found FROM ops.dr_tests ORDER BY started_at DESC LIMIT 2;

-- OUTPUT:
-- scenario    | started_at          | finished_at         | minutes | gaps_found
-- region-loss | 2026-04-20 09:00:00 | 2026-04-20 10:12:00 |      72 |          6`]
    ),

    'InnoDB Cluster & Group Replication': dv(
        [`Group Replication is a multi-node protocol based on Paxos: a transaction is certified by the group (checked for conflicts with concurrently committing transactions) and commits when a majority accepts it. InnoDB Cluster = Group Replication + MySQL Shell AdminAPI to manage it + MySQL Router to route clients. A group of 3 tolerates 1 failure, 5 tolerates 2.`,
            r`dba.configureInstance('root@db1:3306');
var cluster = dba.createCluster('prod');
cluster.addInstance('root@db2:3306');
cluster.addInstance('root@db3:3306');
cluster.status();

-- OUTPUT: (trimmed)
-- "status": "OK", "statusText": "Cluster is ONLINE and can tolerate up to ONE failure.",
-- "topology": { "db1:3306": {"mode": "R/W"}, "db2:3306": {"mode": "R/O"}, "db3:3306": {"mode": "R/O"} }`],
        [`Modes: single-primary (default, recommended) and multi-primary. Requirements: InnoDB tables with primary keys, GTIDs, row binlog. Recovery of a joining member uses the clone plugin or incremental recovery. ClusterSet links clusters across regions.`,
            r`SELECT member_host, member_state, member_role FROM performance_schema.replication_group_members;
SELECT * FROM performance_schema.replication_group_member_stats\G
cluster.addInstance('root@db4:3306', {recoveryMethod: 'clone'});

-- OUTPUT:
-- member_host | member_state | member_role
-- db1         | ONLINE       | PRIMARY
-- db2         | ONLINE       | SECONDARY`],
        [`Mistakes: tables without primary keys (writes rejected), large transactions (certification limits), stretching one group across high-latency links, and expecting a two-node group to survive one failure (no majority). Use three nodes and keep them in low-latency zones.`,
            r`INSERT INTO nokey_table VALUES (1);
SET PERSIST group_replication_transaction_size_limit = 150000000;

-- OUTPUT:
-- ERROR 3098 (HY000): The table does not comply with the requirements by an external plugin.`],
        [`Commit latency includes a network round trip to a majority; keep members close (same region), and use flow control settings to stop slow members from lagging. Watch the certification queue and apply queue sizes.`,
            r`SELECT member_id, count_transactions_in_queue AS cert_queue, count_transactions_remote_in_applier_queue AS apply_queue FROM performance_schema.replication_group_member_stats;

-- OUTPUT: (example)
-- member_id | cert_queue | apply_queue
-- 3e11...   |          0 |           2`],
        [`Real-world: a three-node cluster across three availability zones with two routers, giving automatic failover and read scaling. Applications connect to the router only.`,
            r`mysqlrouter --bootstrap root@db1:3306 --directory /opt/router --user=mysqlrouter
-- apps: jdbc:mysql://router:6446/shop (read/write)   jdbc:mysql://router:6447/shop (read-only)

-- OUTPUT:
-- MySQL Classic protocol: Read/Write 6446, Read/Only 6447`]
    ),

    'MySQL Router': dv(
        [`MySQL Router is a transport-layer proxy. It reads cluster metadata (which node is primary, which are secondaries), listens on ports for read/write and read-only traffic, and forwards each client connection to a chosen backend. It does not parse SQL; routing decisions are per connection, and it reacts to topology changes.`,
            r`mysqlrouter --bootstrap root@db1:3306 --directory /opt/router --user=mysqlrouter
cat /opt/router/mysqlrouter.conf | grep -A4 "routing:"

-- OUTPUT: (excerpt)
-- [routing:prod_rw]
-- bind_port=6446
-- destinations=metadata-cache://prod/?role=PRIMARY
-- routing_strategy=first-available`],
        [`Strategies: first-available (primary), round-robin (secondaries), round-robin-with-fallback, and connection limits. The REST API exposes status and metrics. Run several routers, usually one per application host, so the proxy is not a single point of failure.`,
            r`curl -s -u admin:*** http://router1:8443/api/20190715/routes
curl -s -u admin:*** http://router1:8443/api/20190715/routes/prod_rw/status

-- OUTPUT:
-- {"items":[{"name":"prod_rw"},{"name":"prod_ro"}]}
-- {"activeConnections":12,"totalConnections":8120,"blockedHosts":0}`],
        [`Mistakes: clients not retrying after failover (connections drop during the switch), connection pooling that keeps stale connections, and expecting SQL-level read/write splitting (Router routes by port). Retry on connection errors and use separate pools for read and write ports.`,
            r`-- application: two datasources
-- write pool -> router:6446    read pool -> router:6447
-- retry connection errors 2003, 2006, 2013 with backoff

SELECT @@hostname, @@read_only;

-- OUTPUT: (through 6447)
-- @@hostname | @@read_only
-- db2        |           1`],
        [`Router adds a hop with small latency and reuses connection routing efficiently; its throughput is rarely the limit. Monitor active connections and blocked hosts, and size file descriptors.`,
            r`ulimit -n
curl -s -u admin:*** http://router1:8443/api/20190715/metadata/prod/status

-- OUTPUT:
-- 65535
-- {"refreshFailed":0,"refreshSucceeded":4120,"timeLastRefreshSucceeded":"2026-05-01T10:00:00"}`],
        [`Real-world: ProxySQL vs Router. Router for simple, topology-aware routing of an InnoDB Cluster; ProxySQL when you need query rules, caching, multiplexing or lag-aware read routing across arbitrary topologies.`,
            r`SELECT rule_id, match_digest, destination_hostgroup FROM mysql_query_rules ORDER BY rule_id;

-- OUTPUT:
-- rule_id | match_digest | destination_hostgroup
-- 1       | ^SELECT      | 20`]
    ),

    'Why Partition?': dv(
        [`A partitioned table is one logical table made of several physical tablespaces. A partitioning function maps each row to a partition. The optimizer prunes partitions that cannot match the WHERE clause, so a query on one month reads one partition. Each partition has its own B-tree for the clustered index and for each secondary index.`,
            r`CREATE TABLE events (id BIGINT NOT NULL, created_at DATE NOT NULL, kind VARCHAR(20), PRIMARY KEY (id, created_at))
PARTITION BY RANGE (YEAR(created_at)) (PARTITION p2024 VALUES LESS THAN (2025), PARTITION p2025 VALUES LESS THAN (2026), PARTITION pmax VALUES LESS THAN MAXVALUE);
EXPLAIN SELECT COUNT(*) FROM events WHERE created_at >= '2025-03-01' AND created_at < '2025-04-01';

-- OUTPUT: (example)
-- partitions | type
-- p2025      | range         (only one partition is read)`],
        [`Good reasons: instant data retention (drop old partitions), prune-friendly queries on time or tenant ranges, manageable maintenance (rebuild one partition), and spreading I/O. Bad reasons: "make everything faster" (queries without the partition key scan all partitions).`,
            r`SELECT partition_name, table_rows, ROUND(data_length / 1048576) AS mb FROM information_schema.partitions WHERE table_name = 'events' ORDER BY partition_ordinal_position;
ALTER TABLE events DROP PARTITION p2024;

-- OUTPUT:
-- partition_name | table_rows | mb
-- p2024          |   48000000 | 3200
-- (dropping p2024 removed 48 million rows instantly)`],
        [`Mistakes: partitioning without including the partition column in every unique key (error), too many partitions (memory and metadata cost, keep tens to a few hundred), and partition keys that queries do not use. Check pruning with EXPLAIN.`,
            r`CREATE TABLE bad (id INT PRIMARY KEY, d DATE) PARTITION BY RANGE (YEAR(d)) (PARTITION p0 VALUES LESS THAN MAXVALUE);
EXPLAIN SELECT * FROM events WHERE kind = 'click';

-- OUTPUT:
-- ERROR 1503 (HY000): A PRIMARY KEY must include all columns in the table's partitioning function
-- (second query lists p2024,p2025,pmax: no pruning)`],
        [`Partitioning does not reduce the index depth per query as much as people expect, but it reduces per-partition index size and allows partition-level operations. Compare a single-table delete with a partition drop.`,
            r`DELETE FROM events_unpartitioned WHERE created_at < '2025-01-01';           -- hours, huge undo and binlog
ALTER TABLE events DROP PARTITION p2024;                                     -- milliseconds

-- OUTPUT:
-- Query OK, 48000000 rows affected (3 hours 12 min)
-- Query OK, 0 rows affected (0.12 sec)`],
        [`Real-world: log and event tables partitioned by month with automated creation of future partitions and dropping of expired ones.`,
            r`ALTER TABLE events REORGANIZE PARTITION pmax INTO (PARTITION p202606 VALUES LESS THAN (TO_DAYS('2026-07-01')), PARTITION pmax VALUES LESS THAN MAXVALUE);

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Range & List Partitioning': dv(
        [`RANGE partitions rows by which interval of a column (or expression) they fall into; LIST by membership in explicit value lists. RANGE COLUMNS and LIST COLUMNS partition directly on one or more columns of many types (dates, strings) without wrapping them in functions, which keeps pruning reliable.`,
            r`CREATE TABLE logs (id BIGINT NOT NULL, logged_on DATE NOT NULL, msg VARCHAR(200), PRIMARY KEY (id, logged_on))
PARTITION BY RANGE COLUMNS (logged_on) (
  PARTITION p202601 VALUES LESS THAN ('2026-02-01'),
  PARTITION p202602 VALUES LESS THAN ('2026-03-01'),
  PARTITION pmax VALUES LESS THAN (MAXVALUE));
CREATE TABLE sales_r (id INT NOT NULL, region_id INT NOT NULL, amt DECIMAL(10,2), PRIMARY KEY (id, region_id))
PARTITION BY LIST (region_id) (PARTITION north VALUES IN (1,2), PARTITION south VALUES IN (3,4));

-- OUTPUT:
-- Query OK, 0 rows affected (x2)`],
        [`Maintenance operations: <code>ADD PARTITION</code>, <code>DROP PARTITION</code>, <code>REORGANIZE PARTITION</code> (split or merge), <code>EXCHANGE PARTITION</code> (swap with a standalone table for archiving), <code>TRUNCATE PARTITION</code>. Keep a MAXVALUE catch-all or monitor missing partitions.`,
            r`ALTER TABLE logs REORGANIZE PARTITION pmax INTO (PARTITION p202603 VALUES LESS THAN ('2026-04-01'), PARTITION pmax VALUES LESS THAN (MAXVALUE));
CREATE TABLE logs_2026_01 LIKE logs; ALTER TABLE logs_2026_01 REMOVE PARTITIONING;
ALTER TABLE logs EXCHANGE PARTITION p202601 WITH TABLE logs_2026_01;
ALTER TABLE logs TRUNCATE PARTITION p202601;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: no partition for a value (insert fails with error 1526), partition keys unused by queries, and monthly partition creation forgotten. Automate creation and alert when the next period is missing.`,
            r`INSERT INTO sales_r VALUES (1, 9, 10);
SELECT MAX(partition_description) AS last_boundary FROM information_schema.partitions WHERE table_name = 'logs' AND partition_name <> 'pmax';

-- OUTPUT:
-- ERROR 1526 (HY000): Table has no partition for value 9
-- last_boundary
-- '2026-04-01'`],
        [`Choose granularity by volume: daily for very large streams, monthly for moderate. Partition count affects open-table and metadata memory. Verify pruning for typical queries and avoid cross-partition joins on large ranges.`,
            r`EXPLAIN SELECT COUNT(*) FROM logs WHERE logged_on >= '2026-02-10' AND logged_on < '2026-02-20';
EXPLAIN SELECT COUNT(*) FROM logs WHERE msg LIKE 'err%';

-- OUTPUT: (example)
-- first : partitions=p202602         second: partitions=p202601,p202602,p202603,pmax`],
        [`Real-world: scheduled partition management with an event that creates next month's partition and drops partitions older than the retention period.`,
            r`CREATE EVENT ev_rotate_logs ON SCHEDULE EVERY 1 DAY DO
  ALTER TABLE logs REORGANIZE PARTITION pmax INTO (PARTITION p_next VALUES LESS THAN (DATE_FORMAT(CURDATE() + INTERVAL 2 MONTH, '%Y-%m-01')), PARTITION pmax VALUES LESS THAN (MAXVALUE));

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Hash & Key Partitioning': dv(
        [`HASH partitioning computes <code>expression MOD n</code> to pick one of n partitions, spreading rows evenly. KEY partitioning is the same idea but MySQL hashes the specified columns (any type) itself, by default the primary key. Neither gives time-based retention; they balance data and contention.`,
            r`CREATE TABLE sessions (user_id INT NOT NULL, token CHAR(32) NOT NULL, PRIMARY KEY (user_id, token)) PARTITION BY HASH (user_id) PARTITIONS 4;
INSERT INTO sessions VALUES (1,'a'),(2,'b'),(3,'c'),(4,'d'),(5,'e');
SELECT partition_name, table_rows FROM information_schema.partitions WHERE table_name = 'sessions';

-- OUTPUT:
-- partition_name | table_rows
-- p0             | 1
-- p1             | 2
-- p2             | 1
-- p3             | 1`],
        [`Variants: <code>LINEAR HASH</code> and <code>LINEAR KEY</code> (powers-of-two algorithm that makes adding partitions cheaper but distribution slightly uneven), and subpartitioning (hash inside range). Pruning works for equality on the partition expression.`,
            r`CREATE TABLE kv (k VARCHAR(40) PRIMARY KEY, v VARCHAR(100)) PARTITION BY KEY () PARTITIONS 8;
CREATE TABLE ev (id BIGINT NOT NULL, d DATE NOT NULL, PRIMARY KEY (id, d)) PARTITION BY RANGE (YEAR(d)) SUBPARTITION BY HASH (id) SUBPARTITIONS 4 (PARTITION p2025 VALUES LESS THAN (2026), PARTITION pmax VALUES LESS THAN MAXVALUE);
EXPLAIN SELECT * FROM sessions WHERE user_id = 3;

-- OUTPUT: (example)
-- partitions: p3     (single partition)`],
        [`Mistakes: expecting range queries to prune (they do not), changing the partition count casually (rebuilds and redistributes all rows), and using hash partitioning when the real need is sharding across servers. Pick the count with growth in mind.`,
            r`SELECT COUNT(*) FROM sessions WHERE user_id BETWEEN 1 AND 3;       -- scans all four partitions
ALTER TABLE sessions COALESCE PARTITION 2;                          -- rebuilds the table to 2 partitions

-- OUTPUT:
-- Query OK, 5 rows affected  (data redistributed)`],
        [`Hash partitions reduce contention on index structures and spread I/O across files; each partition has smaller trees. The gain is workload-dependent; measure insert and lookup throughput before and after.`,
            r`-- 32 threads inserting random user_ids: unpartitioned 22k/s, 16 hash partitions 31k/s
SELECT ROUND(31 / 22, 2) AS speedup;

-- OUTPUT:
-- speedup
-- 1.41`],
        [`Real-world: a very hot session or counter table partitioned by hash on user id to relieve contention on a single index tree, while old data is removed by TTL deletes in batches.`,
            r`DELETE FROM sessions WHERE expires_at < NOW() LIMIT 5000;
SELECT partition_name, table_rows FROM information_schema.partitions WHERE table_name = 'sessions';

-- OUTPUT:
-- Query OK, 5000 rows affected`]
    ),

    'Partition Pruning & Management': dv(
        [`Pruning happens at optimization time: the optimizer evaluates the WHERE conditions against the partitioning function and removes partitions that cannot contain matches. It works when the partitioning column appears in a comparison the optimizer can analyse (equality, range, IN), without wrapping the column in non-monotonic functions.`,
            r`EXPLAIN SELECT * FROM logs WHERE logged_on = '2026-02-20';
EXPLAIN SELECT * FROM logs WHERE logged_on BETWEEN '2026-02-01' AND '2026-02-28';
EXPLAIN SELECT * FROM logs WHERE MONTH(logged_on) = 2;

-- OUTPUT: (example)
-- first : partitions=p202602
-- second: partitions=p202602
-- third : partitions=p202601,p202602,p202603,pmax      (function on the column: no pruning)`],
        [`Management commands: <code>ANALYZE</code>, <code>CHECK</code>, <code>OPTIMIZE</code>, <code>REBUILD</code> and <code>REPAIR PARTITION</code>, <code>EXCHANGE PARTITION</code> for archiving, and <code>SELECT ... PARTITION (p)</code> to read one partition directly.`,
            r`SELECT COUNT(*) FROM logs PARTITION (p202602);
ALTER TABLE logs ANALYZE PARTITION p202602;
ALTER TABLE logs REBUILD PARTITION p202602;
ALTER TABLE logs TRUNCATE PARTITION p202601;

-- OUTPUT:
-- COUNT(*)
-- 4820011`],
        [`Mistakes: partition DDL during peak (metadata locks), forgetting that some operations rebuild data, and relying on pruning without checking EXPLAIN. Run maintenance in low-traffic windows with a lock timeout.`,
            r`SET SESSION lock_wait_timeout = 5;
ALTER TABLE logs REORGANIZE PARTITION pmax INTO (PARTITION p202604 VALUES LESS THAN ('2026-05-01'), PARTITION pmax VALUES LESS THAN (MAXVALUE));

-- OUTPUT:
-- Query OK, 0 rows affected   (or ERROR 1205 if a metadata lock cannot be obtained)`],
        [`Partition-level statistics and operations let you rebuild or analyse only the active partition, keeping maintenance windows short. Monitor sizes for skew.`,
            r`SELECT partition_name, table_rows, ROUND(data_length / 1048576) AS data_mb, ROUND(index_length / 1048576) AS index_mb FROM information_schema.partitions WHERE table_name = 'logs' ORDER BY partition_ordinal_position;

-- OUTPUT:
-- partition_name | table_rows | data_mb | index_mb
-- p202602        |    4820011 |     612 |      204`],
        [`Real-world retention: nightly job drops partitions older than 13 months after confirming they were archived, with a guard against dropping the active one.`,
            r`ALTER TABLE logs DROP PARTITION p202401;
SELECT COUNT(*) AS partitions_left FROM information_schema.partitions WHERE table_name = 'logs';

-- OUTPUT:
-- partitions_left
-- 15`]
    ),

    'InnoDB Storage Engine': dv(
        [`InnoDB organises data in tablespaces made of 16 KB pages grouped into extents and segments. Tables are clustered B-trees by primary key. Memory: the buffer pool caches pages. Durability: the redo log records changes before pages are flushed. Atomicity and MVCC: undo logs. Torn-page safety: the doublewrite buffer. Row-level locks and transaction ids provide concurrency.`,
            r`SELECT engine, support, transactions, xa, savepoints FROM information_schema.engines WHERE engine = 'InnoDB';
SHOW ENGINE INNODB STATUS\G

-- OUTPUT: (sections)
-- BACKGROUND THREAD, SEMAPHORES, LATEST DETECTED DEADLOCK, TRANSACTIONS, FILE I/O, INSERT BUFFER AND ADAPTIVE HASH INDEX, LOG, BUFFER POOL AND MEMORY, ROW OPERATIONS`],
        [`Key variables: <code>innodb_buffer_pool_size</code>, <code>innodb_redo_log_capacity</code>, <code>innodb_flush_log_at_trx_commit</code>, <code>innodb_flush_method=O_DIRECT</code>, <code>innodb_file_per_table</code>, <code>innodb_io_capacity</code>, <code>innodb_page_size</code>. Metrics are exposed through <code>information_schema.innodb_metrics</code>.`,
            r`SHOW VARIABLES WHERE Variable_name IN ('innodb_buffer_pool_size','innodb_redo_log_capacity','innodb_flush_method','innodb_file_per_table','innodb_page_size','innodb_io_capacity');
SELECT name, count FROM information_schema.innodb_metrics WHERE name IN ('buffer_pool_reads','log_writes','trx_rseg_history_len');

-- OUTPUT:
-- innodb_buffer_pool_size  | 25769803776
-- innodb_flush_method      | O_DIRECT
-- innodb_page_size         | 16384`],
        [`Mistakes: leaving defaults on a big server (a 128 MB buffer pool), using MyISAM for new tables, huge redo logs without understanding recovery time, and ignoring the history list length. Size memory and logs from the workload and monitor.`,
            r`SELECT table_name, engine FROM information_schema.tables WHERE table_schema = 'shop' AND engine <> 'InnoDB';
ALTER TABLE legacy_log ENGINE = InnoDB;

-- OUTPUT:
-- table_name | engine
-- legacy_log | MyISAM`],
        [`Performance is dominated by buffer pool hit rate, redo log throughput and checkpoint behaviour. Compare physical reads to read requests and watch log waits.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Innodb_buffer_pool_reads','Innodb_buffer_pool_read_requests','Innodb_log_waits','Innodb_row_lock_waits');

-- OUTPUT: (example)
-- Innodb_buffer_pool_reads         | 412330
-- Innodb_buffer_pool_read_requests | 912330021
-- Innodb_log_waits                 | 0`],
        [`Real-world baseline configuration for a dedicated 64 GB OLTP server.`,
            r`[mysqld]
innodb_buffer_pool_size = 40G
innodb_redo_log_capacity = 16G
innodb_flush_method = O_DIRECT
innodb_io_capacity = 4000
innodb_io_capacity_max = 8000
innodb_flush_log_at_trx_commit = 1
innodb_file_per_table = ON

-- OUTPUT: (after restart)
-- SELECT @@innodb_buffer_pool_size / 1073741824;  =>  40.0000`]
    ),

    'Buffer Pool': dv(
        [`The buffer pool is a memory cache of 16 KB pages. Pages live on an LRU list split into a young (hot) and old sublist; newly read pages enter at the midpoint so a one-time scan does not evict hot data. Dirty (modified) pages are flushed to disk in the background by page cleaner threads, driven by the checkpoint age and <code>innodb_io_capacity</code>.`,
            r`SELECT pool_size, free_buffers, database_pages, modified_database_pages, pages_made_young, pages_not_made_young FROM information_schema.innodb_buffer_pool_stats\G

-- OUTPUT: (example)
-- pool_size: 1572864   free_buffers: 1024   database_pages: 1560000   modified_database_pages: 3200
-- pages_made_young: 9120344   pages_not_made_young: 412330021`],
        [`Settings: <code>innodb_buffer_pool_size</code> (resizable online), <code>innodb_buffer_pool_instances</code>, <code>innodb_old_blocks_pct</code>, <code>innodb_buffer_pool_dump_at_shutdown</code>/<code>load_at_startup</code> (warm cache), and chunk size. Size to the working set, typically 60-75% of RAM on a dedicated host.`,
            r`SET GLOBAL innodb_buffer_pool_size = 24 * 1024 * 1024 * 1024;
SET GLOBAL innodb_buffer_pool_dump_at_shutdown = ON;
SET GLOBAL innodb_buffer_pool_load_at_startup = ON;
SELECT @@innodb_buffer_pool_size / 1073741824 AS gb;

-- OUTPUT:
-- gb
-- 24.0000`],
        [`Mistakes: a pool larger than RAM (swapping, which is far worse than a smaller pool), full-table scans evicting hot pages, and cold starts after restarts. Warm the pool and run analytics on replicas.`,
            r`SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_load_status';
SELECT (1 - ib_reads.v / ib_reqs.v) * 100 AS hit_pct FROM
 (SELECT VARIABLE_VALUE AS v FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') ib_reads,
 (SELECT VARIABLE_VALUE AS v FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') ib_reqs;

-- OUTPUT:
-- hit_pct
-- 99.9552`],
        [`If the working set does not fit, misses go to disk. Estimate the working set from table and index sizes of hot tables, and compare with the pool.`,
            r`SELECT ROUND(SUM(data_length + index_length) / 1073741824, 1) AS hot_tables_gb FROM information_schema.tables WHERE table_schema = 'shop' AND table_name IN ('orders','order_items','customers','products');
SELECT @@innodb_buffer_pool_size / 1073741824 AS pool_gb;

-- OUTPUT:
-- hot_tables_gb | pool_gb
-- 48.2          | 40.0000          (the working set is larger than the pool: expect misses)`],
        [`Real-world: after a restart queries were slow for 20 minutes. Enabling dump and load of the pool state reduced the warm-up to a couple of minutes.`,
            r`SET GLOBAL innodb_buffer_pool_dump_pct = 40;
SHOW STATUS LIKE 'Innodb_buffer_pool_dump_status';

-- OUTPUT:
-- Innodb_buffer_pool_dump_status | Buffer pool(s) dump completed at 260501 03:00:12`]
    ),

    'Redo Log & Undo Log': dv(
        [`Redo log: a circular, write-ahead log of changes to pages. On commit the redo records are written (and by default fsynced) so committed work survives a crash; recovery replays redo from the last checkpoint. Undo log: stores previous row versions; used to roll back, to provide MVCC snapshots, and cleaned by purge threads when no snapshot needs them.`,
            r`SHOW VARIABLES LIKE 'innodb_redo_log_capacity';
SHOW GLOBAL STATUS WHERE Variable_name IN ('Innodb_redo_log_current_lsn','Innodb_redo_log_checkpoint_lsn','Innodb_os_log_written');
SELECT count AS history_list_length FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len';

-- OUTPUT: (example)
-- innodb_redo_log_capacity | 17179869184
-- Innodb_redo_log_current_lsn | 98812334122
-- history_list_length | 312`],
        [`Settings: <code>innodb_redo_log_capacity</code> (8.0.30+, replaces file size and count), <code>innodb_flush_log_at_trx_commit</code> (1, 2, 0), <code>innodb_log_buffer_size</code>, undo tablespaces and <code>innodb_undo_log_truncate</code>, <code>innodb_max_purge_lag</code>.`,
            r`SET GLOBAL innodb_redo_log_capacity = 16 * 1024 * 1024 * 1024;
SET GLOBAL innodb_undo_log_truncate = ON;
SET GLOBAL innodb_max_undo_log_size = 1073741824;
SELECT name, state, ROUND(file_size / 1048576) AS mb FROM information_schema.innodb_tablespaces WHERE name LIKE 'innodb_undo%';

-- OUTPUT:
-- name            | state  | mb
-- innodb_undo_001 | active | 16`],
        [`Mistakes: redo capacity too small for write bursts (forced flushing and stalls), long transactions that keep undo alive and bloat the history list, and lowering durability settings on critical data. Size redo for peak writes and keep transactions short.`,
            r`SELECT trx_id, trx_started, TIMESTAMPDIFF(MINUTE, trx_started, NOW()) AS minutes FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 1;
SHOW GLOBAL STATUS LIKE 'Innodb_log_waits';

-- OUTPUT: (example)
-- trx_id | trx_started         | minutes
-- 77123  | 2026-05-01 06:12:03 |     228
-- Innodb_log_waits | 412         (log buffer or redo space waits)`],
        [`A guideline: redo capacity should hold roughly an hour of peak redo generation so checkpointing is smooth. Measure redo written per minute and set capacity accordingly.`,
            r`SELECT VARIABLE_VALUE AS written_bytes FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_os_log_written';
-- sample twice, one minute apart, subtract: e.g. 612 MB per minute at peak
SELECT ROUND(612 * 60 / 1024, 1) AS gb_per_hour_at_peak;

-- OUTPUT:
-- gb_per_hour_at_peak
-- 35.9`],
        [`Real-world trade-off: setting <code>innodb_flush_log_at_trx_commit=2</code> on a reporting replica doubles load speed, while the primary keeps 1. The replica can be rebuilt from the primary, so the risk is acceptable.`,
            r`-- replica only
SET PERSIST innodb_flush_log_at_trx_commit = 2;
SET PERSIST sync_binlog = 0;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Doublewrite Buffer & Change Buffer': dv(
        [`Doublewrite buffer: InnoDB pages are 16 KB but disks may write in smaller atomic units, so a crash can leave a torn page. Before a dirty page is written to its place, it is written to the doublewrite area; on recovery a torn page is restored from that copy and redo is applied. Change buffer: changes to secondary index pages that are not in memory are cached and merged later, turning random writes into batches.`,
            r`SHOW VARIABLES WHERE Variable_name IN ('innodb_doublewrite','innodb_change_buffering','innodb_change_buffer_max_size');
SHOW GLOBAL STATUS LIKE 'Innodb_dblwr%';
SELECT name, count FROM information_schema.innodb_metrics WHERE name LIKE 'ibuf_merge%';

-- OUTPUT: (example)
-- innodb_doublewrite            | ON
-- innodb_change_buffering       | all
-- Innodb_dblwr_pages_written    | 5231044
-- ibuf_merges                   | 128450`],
        [`Controls: <code>innodb_doublewrite</code> (ON, OFF, DETECT_AND_RECOVER), <code>innodb_doublewrite_dir</code> (separate fast storage), <code>innodb_change_buffering</code> (all, none, inserts, deletes, changes, purges) and <code>innodb_change_buffer_max_size</code>. Change buffering does not apply to unique secondary indexes.`,
            r`SET GLOBAL innodb_change_buffer_max_size = 10;
SET GLOBAL innodb_change_buffering = 'inserts';
-- innodb_doublewrite_dir = /nvme/doublewrite    (my.cnf, restart)

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: disabling doublewrite on storage that does not guarantee atomic 16 KB writes (corruption risk), a big change buffer on fast SSDs where it adds little, and expecting it to help unique indexes. Test before changing, and keep doublewrite on unless atomic writes are guaranteed.`,
            r`SELECT @@innodb_doublewrite;
-- only OFF if the storage layer guarantees atomic page writes (verified), otherwise keep ON

-- OUTPUT:
-- @@innodb_doublewrite
-- ON`],
        [`The doublewrite buffer doubles page write volume but writes sequentially in batches, so its cost is moderate. Change buffering helps write-heavy workloads with many secondary indexes on spinning disks; on NVMe the gain is small and large buffers can lengthen shutdown and recovery merges.`,
            r`SHOW ENGINE INNODB STATUS\G
-- INSERT BUFFER AND ADAPTIVE HASH INDEX
-- Ibuf: size 1, free list len 612, seg size 614, 128450 merges
-- merged operations: insert 120310, delete mark 7900

-- OUTPUT:
-- (merges show the change buffer is active)`],
        [`Real-world: on a write-heavy table with five secondary indexes the change buffer cut random I/O by a third on HDD storage; after moving to NVMe it was reduced to 10% of the pool with no measurable loss.`,
            r`SET GLOBAL innodb_change_buffer_max_size = 10;
SHOW VARIABLES LIKE 'innodb_change_buffer_max_size';

-- OUTPUT:
-- innodb_change_buffer_max_size | 10`]
    ),

    'Adaptive Hash Index': dv(
        [`The adaptive hash index (AHI) is an in-memory hash table that InnoDB builds automatically on top of B-tree pages that are searched frequently with the same index prefix. It makes equality lookups into one hash probe instead of a tree descent. It is maintained transparently; you can only enable, disable or partition it.`,
            r`SHOW ENGINE INNODB STATUS\G
-- INSERT BUFFER AND ADAPTIVE HASH INDEX
-- Hash table size 553253, node heap has 12044 buffer(s)
-- 8221.45 hash searches/s, 1744.32 non-hash searches/s

SHOW VARIABLES LIKE 'innodb_adaptive_hash_index%';

-- OUTPUT:
-- innodb_adaptive_hash_index       | ON
-- innodb_adaptive_hash_index_parts | 8`],
        [`Controls: <code>innodb_adaptive_hash_index</code> (dynamic) and <code>innodb_adaptive_hash_index_parts</code> (number of partitions, restart). Metrics: <code>adaptive_hash_searches</code>, <code>adaptive_hash_searches_btree</code>, and hash table memory.`,
            r`SELECT name, count FROM information_schema.innodb_metrics WHERE name LIKE 'adaptive_hash%';
SET GLOBAL innodb_adaptive_hash_index = OFF;
SELECT @@innodb_adaptive_hash_index;

-- OUTPUT:
-- name                         | count
-- adaptive_hash_searches       | 912330021
-- adaptive_hash_searches_btree | 212330011
-- @@innodb_adaptive_hash_index
-- 0`],
        [`Mistakes: leaving it on under write-heavy or highly concurrent workloads where latch contention on the AHI hurts, and expecting it to speed range scans (it does not). Look for AHI latch waits and compare hash versus B-tree search rates.`,
            r`SELECT event_name, count_star, ROUND(sum_timer_wait / 1e12, 2) AS wait_s FROM performance_schema.events_waits_summary_global_by_event_name WHERE event_name LIKE '%btr0sea%' OR event_name LIKE '%adaptive%' ORDER BY sum_timer_wait DESC LIMIT 2;

-- OUTPUT: (example)
-- event_name                       | count_star | wait_s
-- wait/synch/sxlock/innodb/btr_search_latch | 912330 | 41.20       (contention on the AHI latch)`],
        [`Benchmark with and without it on your workload: read-heavy point-lookup workloads can gain 10-30%, write-heavy mixed workloads can lose. More partitions (<code>innodb_adaptive_hash_index_parts</code>) reduce contention.`,
            r`-- point lookups 90% / writes 10%: AHI on 52,000 qps, off 47,500 qps
-- 50% writes:                       AHI on 31,000 qps, off 36,000 qps
SELECT ROUND((52000 - 47500) / 47500 * 100, 1) AS read_gain_pct, ROUND((31000 - 36000) / 36000 * 100, 1) AS write_heavy_change_pct;

-- OUTPUT:
-- read_gain_pct | write_heavy_change_pct
-- 9.5           | -13.9`],
        [`Real-world: managed services often disable the AHI by default because multi-tenant, mixed workloads showed contention. Decide with a load test, not by default.`,
            r`SET PERSIST innodb_adaptive_hash_index = OFF;
SET PERSIST innodb_adaptive_hash_index_parts = 16;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Tablespaces, Data Pages & Index Pages': dv(
        [`A tablespace is a set of files holding pages. File-per-table tablespaces (<code>.ibd</code>) hold one table with its indexes. A page (16 KB) belongs to a segment (leaf or non-leaf segment of an index) within extents of 1 MB. Data pages are the leaf pages of the clustered index and contain full rows; index pages contain keys and child or row pointers.`,
            r`SELECT name, space_type, row_format, page_size, ROUND(file_size / 1048576) AS file_mb, ROUND(allocated_size / 1048576) AS allocated_mb FROM information_schema.innodb_tablespaces WHERE name LIKE 'shop/%' ORDER BY file_size DESC LIMIT 3;

-- OUTPUT: (example)
-- name        | space_type | row_format | page_size | file_mb | allocated_mb
-- shop/orders | Single     | Dynamic    |     16384 |     520 |          520`],
        [`Types: system tablespace, file-per-table, general tablespaces (shared, can hold many tables, can be placed on specific storage or encrypted), undo tablespaces, and the session temporary tablespaces. Rows can be DYNAMIC (default, large values off-page) or COMPRESSED.`,
            r`CREATE TABLESPACE ts_fast ADD DATAFILE 'ts_fast.ibd' ENGINE=InnoDB;
CREATE TABLE hot_data (id INT PRIMARY KEY, v VARCHAR(50)) TABLESPACE ts_fast;
ALTER TABLE big_archive ROW_FORMAT = COMPRESSED KEY_BLOCK_SIZE = 8;
ALTER TABLE customers ENCRYPTION = 'Y';

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: expecting DELETE to shrink files (freed pages are reused but the file stays big until a rebuild), heavy fragmentation after random churn, and moving .ibd files by hand. Reclaim with <code>OPTIMIZE TABLE</code> and use transportable tablespaces to copy tables.`,
            r`SELECT table_name, ROUND(data_length / 1048576) AS data_mb, ROUND(data_free / 1048576) AS free_mb FROM information_schema.tables WHERE table_schema = 'shop' ORDER BY data_free DESC LIMIT 2;
OPTIMIZE TABLE events;
FLUSH TABLES events FOR EXPORT;       -- then copy events.ibd and events.cfg, UNLOCK TABLES

-- OUTPUT:
-- table_name | data_mb | free_mb
-- events     |   11000 |    4200`],
        [`Page fill factor affects size and speed: sequential inserts fill pages to about 15/16 of the page, random inserts leave pages around 69% full. Check index page counts and fill to see if a rebuild helps.`,
            r`SELECT index_name, stat_value AS leaf_pages FROM mysql.innodb_index_stats WHERE database_name = 'shop' AND table_name = 'orders' AND stat_name = 'n_leaf_pages';
SET GLOBAL innodb_fill_factor = 90;
ALTER TABLE orders ENGINE = InnoDB;

-- OUTPUT:
-- index_name | leaf_pages
-- PRIMARY    |      22000`],
        [`Real-world: moving a 200 GB table to another server in minutes with a transportable tablespace instead of a long dump and load.`,
            r`FLUSH TABLES orders FOR EXPORT;
-- copy orders.ibd and orders.cfg to the target, then on the source:
UNLOCK TABLES;
-- on the target (same table definition):
ALTER TABLE orders DISCARD TABLESPACE;
-- place the files, then:
ALTER TABLE orders IMPORT TABLESPACE;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'What is MVCC?': dv(
        [`Multi-Version Concurrency Control lets readers and writers work at the same time by keeping several versions of a row. Each row has hidden fields: the id of the last modifying transaction (<code>DB_TRX_ID</code>) and a roll pointer (<code>DB_ROLL_PTR</code>) to its previous version in the undo log. A reader uses a read view to decide which version is visible to it.`,
            r`-- session A
START TRANSACTION; UPDATE acct SET bal = 0 WHERE id = 1;
-- session B (not blocked; sees the old committed value)
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT: (session B)
-- bal
-- 1000.00`],
        [`Snapshot reads (plain SELECT) use MVCC. Locking reads (<code>FOR UPDATE</code>, <code>FOR SHARE</code>) and writes use "current reads" that see the latest committed row and lock it. Isolation levels differ in when the read view is created.`,
            r`START TRANSACTION;
SELECT bal FROM acct WHERE id = 1;                      -- snapshot
-- another session commits bal = 900
SELECT bal FROM acct WHERE id = 1;                      -- snapshot (REPEATABLE READ): still 1000
SELECT bal FROM acct WHERE id = 1 FOR UPDATE;           -- current read: 900
COMMIT;

-- OUTPUT:
-- 1000.00
-- 1000.00
-- 900.00`],
        [`Mistakes: long transactions that keep old versions alive (growing undo and a long history list), assuming a snapshot read equals what UPDATE sees, and reading a mixture of snapshot and current data in one transaction. Keep transactions short.`,
            r`SELECT count AS history_list_length FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len';
SELECT trx_id, trx_started FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 1;

-- OUTPUT: (example)
-- history_list_length
-- 912330
-- trx_id | trx_started
-- 77123  | 2026-05-01 06:12:03`],
        [`MVCC costs undo storage and purge work. Hot rows updated constantly build long version chains that old snapshots must walk. Monitor purge lag and avoid long snapshots on hot tables.`,
            r`SHOW GLOBAL VARIABLES LIKE 'innodb_purge_threads';
SHOW ENGINE INNODB STATUS\G
-- TRANSACTIONS: Purge done for trx's n:o < 4521790 undo n:o < 0 state: running but idle; History list length 91

-- OUTPUT:
-- innodb_purge_threads | 4`],
        [`Real-world: dashboards on a busy OLTP primary used 20-minute REPEATABLE READ transactions, bloating undo to 80 GB. Moving them to a replica and shortening transactions fixed it.`,
            r`SELECT name, ROUND(file_size / 1073741824, 1) AS gb FROM information_schema.innodb_tablespaces WHERE name LIKE 'innodb_undo%';

-- OUTPUT: (before -> after)
-- innodb_undo_001 | 41.0 -> 0.1
-- innodb_undo_002 | 39.0 -> 0.1`]
    ),

    'Consistent Reads & Read Views': dv(
        [`A read view records which transactions were active when it was created: a low-water mark (all transaction ids below it are committed and visible), a high-water mark (ids at or above it started later and are invisible) and the list of active ids in between. A row version is visible if its transaction id is below the low mark, not in the active list, or is your own transaction.`,
            r`START TRANSACTION WITH CONSISTENT SNAPSHOT;
SELECT COUNT(*) FROM orders;
-- other sessions insert more rows and commit
SELECT COUNT(*) FROM orders;
COMMIT;

-- OUTPUT:
-- COUNT(*)
-- 1000
-- COUNT(*)
-- 1000       (same count: the read view hides the later commits)`],
        [`At REPEATABLE READ the read view is created at the first consistent read (or immediately with <code>WITH CONSISTENT SNAPSHOT</code>) and reused; at READ COMMITTED a new one is created for every statement. mysqldump <code>--single-transaction</code> relies on a consistent snapshot.`,
            r`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT COUNT(*) FROM orders;        -- 1000
-- another session commits 5 rows
SELECT COUNT(*) FROM orders;        -- 1005 (new read view for this statement)
COMMIT;
mysqldump --single-transaction shop > shop.sql      -- consistent dump without blocking writers

-- OUTPUT:
-- 1000
-- 1005`],
        [`Mistakes: long-lived read views (undo growth), forgetting that the snapshot does not cover DDL, and expecting read views to protect against writes in the same transaction. Close report transactions promptly.`,
            r`SELECT trx_id, TIMESTAMPDIFF(MINUTE, trx_started, NOW()) AS minutes_open, trx_state FROM information_schema.innodb_trx WHERE trx_started < NOW() - INTERVAL 10 MINUTE;

-- OUTPUT:
-- trx_id | minutes_open | trx_state
-- 77123  |           55 | RUNNING`],
        [`Snapshots are cheap to create but expensive to hold. For big exports use short transactions in chunks by primary key range, or a replica with a dedicated snapshot.`,
            r`SELECT id, total FROM orders WHERE id BETWEEN 1 AND 100000 ORDER BY id;
SELECT id, total FROM orders WHERE id BETWEEN 100001 AND 200000 ORDER BY id;

-- OUTPUT:
-- (each chunk is its own short consistent read)`],
        [`Real-world: consistent backup. A logical dump takes one snapshot for all tables, recording the binlog position at the same instant, so the dump plus binlog replay gives exact point-in-time recovery.`,
            r`mysqldump --single-transaction --source-data=2 --routines shop > shop.sql
grep -m1 "CHANGE REPLICATION SOURCE TO" shop.sql

-- OUTPUT:
-- -- CHANGE REPLICATION SOURCE TO SOURCE_LOG_FILE='binlog.000042', SOURCE_LOG_POS=1543;`]
    ),

    'Undo Logs & Transaction IDs': dv(
        [`Every modification writes an undo record holding the old values and a pointer to the previous undo record, forming a version chain: current row → undo record → older undo record. The hidden columns <code>DB_TRX_ID</code> and <code>DB_ROLL_PTR</code> in the row point into this chain. Rollback applies undo records; consistent reads follow the chain until they find a visible version.`,
            r`CREATE TABLE v (id INT PRIMARY KEY, n INT);
INSERT INTO v VALUES (1, 0);
START TRANSACTION; UPDATE v SET n = 1 WHERE id = 1; UPDATE v SET n = 2 WHERE id = 1; UPDATE v SET n = 3 WHERE id = 1;
-- another session with an old snapshot must walk three undo records to find n = 0
SELECT count AS history_list_length FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len';

-- OUTPUT: (example)
-- history_list_length
-- 3`],
        [`Undo lives in undo tablespaces (<code>innodb_undo_*.ibu</code>). Purge threads delete undo records when no read view needs them. Tuning: <code>innodb_undo_tablespaces</code>, <code>innodb_undo_log_truncate</code>, <code>innodb_purge_threads</code>, <code>innodb_max_purge_lag</code>.`,
            r`SELECT name, state, ROUND(file_size / 1048576) AS mb FROM information_schema.innodb_tablespaces WHERE name LIKE 'innodb_undo%';
SET GLOBAL innodb_undo_log_truncate = ON;
SET GLOBAL innodb_max_undo_log_size = 2147483648;
SHOW VARIABLES LIKE 'innodb_purge_threads';

-- OUTPUT:
-- name            | state  | mb
-- innodb_undo_001 | active | 16
-- innodb_purge_threads | 4`],
        [`Mistakes: giant transactions (undo for every changed row), hot rows with long snapshots, and ignoring purge lag until queries slow down. A huge rollback can take as long as the original work.`,
            r`SELECT trx_id, trx_rows_modified, trx_state FROM information_schema.innodb_trx ORDER BY trx_rows_modified DESC LIMIT 2;

-- OUTPUT: (example)
-- trx_id | trx_rows_modified | trx_state
-- 77123  |          48000000 | ROLLING BACK        (a mass update being undone)`],
        [`Undo growth slows reads (long chains) and uses disk. Keep transactions short, batch large updates, and spread hot-row updates. Watch history length with an alert.`,
            r`UPDATE orders SET archived = 1 WHERE id BETWEEN 1 AND 10000 AND archived = 0;     -- batch of 10,000
SELECT count FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len';

-- OUTPUT:
-- count
-- 120`],
        [`Real-world: a nightly archive job once held one transaction for 40 minutes and grew undo to 60 GB. Batching by primary key range with a commit per batch kept undo small and reads fast.`,
            r`UPDATE orders SET archived = 1 WHERE id BETWEEN 10001 AND 20000 AND archived = 0;
-- commit, sleep 100 ms, next range

-- OUTPUT:
-- Query OK, 10000 rows affected`]
    ),

    'Visibility Rules & Snapshot Isolation': dv(
        [`Visibility rules decide which row version a read view may see: a version is visible if the transaction that created it committed before the read view was created (its id is below the low-water mark and not in the active list), or if it was created by the reading transaction itself. Otherwise InnoDB follows the roll pointer to an older version and applies the same test.`,
            r`START TRANSACTION;
UPDATE acct SET bal = 777 WHERE id = 1;
SELECT bal FROM acct WHERE id = 1;        -- own change is visible
-- another session: SELECT bal FROM acct WHERE id = 1;  -- still the old committed value
ROLLBACK;

-- OUTPUT:
-- bal
-- 777.00`],
        [`Snapshot isolation means a transaction sees the database as it was at its start. InnoDB's REPEATABLE READ gives this for plain reads. It is not full serializability: write skew is possible, where two transactions read the same data and update different rows, breaking an invariant that spans them. Guard the invariant with locking reads, constraints or SERIALIZABLE.`,
            r`-- rule: at least one doctor must stay on call
-- A: SELECT COUNT(*) FROM doctors WHERE on_call = 1;       -- 2
-- B: SELECT COUNT(*) FROM doctors WHERE on_call = 1;       -- 2
-- A: UPDATE doctors SET on_call = 0 WHERE id = 1;  COMMIT;
-- B: UPDATE doctors SET on_call = 0 WHERE id = 2;  COMMIT;

SELECT COUNT(*) FROM doctors WHERE on_call = 1;

-- OUTPUT:
-- COUNT(*)
-- 0          (invariant broken by write skew)`],
        [`Mistakes: assuming snapshot isolation prevents all anomalies, deciding from a snapshot read and writing, and testing concurrency with one session. Use a locking read on the rows that define the rule.`,
            r`START TRANSACTION;
SELECT COUNT(*) FROM doctors WHERE on_call = 1 FOR UPDATE;      -- serializes the check
UPDATE doctors SET on_call = 0 WHERE id = 1 AND (SELECT COUNT(*) FROM (SELECT id FROM doctors WHERE on_call = 1) x) > 1;
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`],
        [`Locking reads reduce concurrency but are cheap for small rule sets. A unique constraint is cheaper still for rules it can express (one booking per seat), because the index enforces it with no extra reads.`,
            r`ALTER TABLE seat_booking ADD UNIQUE KEY uq_event_seat (event_id, seat_no);
INSERT INTO seat_booking (event_id, seat_no, user_id) VALUES (1, 12, 7);
INSERT INTO seat_booking (event_id, seat_no, user_id) VALUES (1, 12, 9);

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-12' for key 'seat_booking.uq_event_seat'`],
        [`Real-world rule of thumb: keep snapshot reads for reporting and display, use conditional updates or unique constraints for counters and bookings, and lock explicit rows only for rules that span several rows.`,
            r`UPDATE stock SET qty = qty - 1 WHERE sku = 'A1' AND qty > 0;
SELECT ROW_COUNT() AS reserved;

-- OUTPUT:
-- reserved
-- 1`]
    )
};
