// Modules 37-40 (High Availability, Partitioning, InnoDB Internals, MVCC) extras.
import { x, r, type Extra } from './extra';

export const e12: Record<string, Extra> = {
    'Failover & Automatic Failover': x(
        ['Failover means switching to a standby server when the primary fails so the application keeps working.',
            'Manual failover is done by an operator; automatic failover is done by software that detects failure and promotes a replica.',
            'The goal is to reduce downtime.'],
        ['Automatic failover needs reliable failure detection, leader election, fencing of the old primary and client redirection.',
            'Tools: InnoDB Cluster (Group Replication + MySQL Router), Orchestrator, MHA, cloud-managed failover (RDS Multi-AZ, Aurora).',
            'Clients must reconnect: use retry logic, DNS/VIP updates or a proxy.'],
        ['False positives (a network blip triggers failover) cause outages; tune timeouts and require quorum.',
            'Fencing prevents split-brain: the old primary must be unable to accept writes.',
            'Rehearse failovers, measure RTO and verify data consistency afterwards; document runbooks.'],
        [['F', 'What is failover?', 'Switching to a standby server when the primary fails.'],
            ['F', 'Manual vs automatic failover?', 'Manual needs a human to promote a replica; automatic uses software to detect and promote.'],
            ['M', 'What is fencing?', 'Making sure the old primary can no longer accept writes (shutdown, read-only, network isolation).'],
            ['M', 'How do apps find the new primary?', 'Via MySQL Router/ProxySQL, DNS or virtual IP updates, and driver-level retry.'],
            ['S', 'What risks does automatic failover carry?', 'False triggers, split-brain, data loss in async setups, and flapping between nodes.'],
            ['S', 'How do you test failover?', 'Scheduled game days: kill the primary, measure detection and recovery time, check data consistency and app behaviour.']],
        [['Manual promotion steps (conceptual).',
            r`-- 1. make the old primary unwritable (if reachable)
SET GLOBAL super_read_only = ON;
-- 2. on the chosen replica: ensure it applied everything
SHOW REPLICA STATUS\G
-- 3. promote
STOP REPLICA; RESET REPLICA ALL; SET GLOBAL super_read_only = OFF;

-- OUTPUT:
-- Query OK, 0 rows affected   (replica is now the writable primary)`],
            ['Client-side reconnect settings.',
                r`jdbc:mysql://router:6446/shop?connectTimeout=3000&socketTimeout=30000&autoReconnect=false&failOverReadOnly=false

-- OUTPUT:
-- (driver fails fast; the application retries the transaction on the new primary)`]],
        [['Check cluster status (MySQL Shell).',
            r`var c = dba.getCluster('prod'); c.status();

-- OUTPUT: (trimmed)
-- "primary": "db1:3306", "status": "OK", "statusText": "Cluster is ONLINE and can tolerate up to ONE failure."`],
            ['Planned switchover.',
                r`c.setPrimaryInstance('db2:3306');

-- OUTPUT:
-- Setting instance 'db2:3306' as the new primary... done`]]
    ),

    'RPO & RTO': x(
        ['RPO (Recovery Point Objective) is how much data you can afford to lose, measured in time. RTO (Recovery Time Objective) is how long you can afford to be down.',
            'Example: RPO 5 minutes, RTO 30 minutes.',
            'They guide backup, replication and failover design.'],
        ['Lower RPO needs more frequent or continuous copying (binlog shipping, synchronous replication).',
            'Lower RTO needs ready standbys, automation and rehearsed runbooks.',
            'Cost rises sharply as targets approach zero.'],
        ['Set RPO/RTO per service with the business; not everything needs five nines.',
            'Validate with drills, measuring real recovery time, not estimates.',
            'Document dependencies (DNS, secrets, config) that stretch RTO.'],
        [['F', 'What is RPO?', 'The maximum acceptable amount of data loss, expressed as time.'],
            ['F', 'What is RTO?', 'The maximum acceptable time to restore service.'],
            ['M', 'How do you reduce RPO?', 'More frequent backups, continuous binlog archiving or synchronous/semi-sync replication.'],
            ['M', 'How do you reduce RTO?', 'Hot standbys, automated failover, tested runbooks and smaller restore sizes.'],
            ['S', 'How do you pick RPO and RTO values?', 'From business impact analysis: cost of downtime and data loss versus cost of the infrastructure that prevents them.'],
            ['S', 'How do you prove you meet them?', 'Regular recovery drills with measured times and data checks, tracked as SLO evidence.']],
        [['Estimate current RPO from replica lag.',
            r`SELECT TIMESTAMPDIFF(SECOND, ts, NOW()) AS replication_lag_seconds FROM ops.heartbeat WHERE id = 1;

-- OUTPUT:
-- replication_lag_seconds
-- 2          (worst-case RPO on failover is about this value for async replication)`],
            ['Backup-based RTO estimate.',
                r`-- restore throughput 200 MB/s, database 600 GB
SELECT ROUND(600 * 1024 / 200 / 60, 1) AS restore_minutes;

-- OUTPUT:
-- restore_minutes
-- 51.2`]],
        [['Targets table.',
            r`SELECT service, rpo_minutes, rto_minutes FROM dr_targets ORDER BY rto_minutes;

-- OUTPUT:
-- service  | rpo_minutes | rto_minutes
-- payments |           0 |          5
-- reports  |          60 |        240`],
            ['Drill result tracking.',
                r`INSERT INTO dr_drills (service, drill_date, measured_rto_min, data_loss_sec) VALUES ('payments', CURDATE(), 7, 0);

-- OUTPUT:
-- Query OK, 1 row affected`]]
    ),

    'Disaster Recovery': x(
        ['Disaster recovery (DR) is the plan and setup to restore service after a major failure such as a data centre or region outage.',
            'It combines off-site backups, replicas in another region and documented procedures.',
            'It is different from high availability within one site.'],
        ['DR patterns: backup and restore, pilot light, warm standby, active-active across regions.',
            'Keep backups and binlogs in a different region/account; make them immutable.',
            'Include non-database parts: secrets, configuration, DNS, certificates and application deployment.'],
        ['Test DR end to end at least yearly; untested DR is a hope, not a plan.',
            'Cross-region replication is asynchronous; accept an RPO equal to lag or use Group Replication/ Aurora Global with known limits.',
            'Plan failback: returning to the original region safely after recovery.'],
        [['F', 'What is disaster recovery?', 'Restoring IT service after a major outage like losing a data centre.'],
            ['F', 'Where should backups be stored for DR?', 'In a different location or region than the primary.'],
            ['M', 'Difference between HA and DR?', 'HA handles local failures with quick automatic failover; DR handles site/region loss with a slower, broader recovery.'],
            ['M', 'DR patterns?', 'Backup/restore, pilot light, warm standby, active-active.'],
            ['S', 'What is often forgotten in DR plans?', 'Secrets, DNS, certificates, access and the exact steps and order, plus failback.'],
            ['S', 'How do you protect backups from ransomware?', 'Immutable/object-lock storage, separate credentials and accounts, and regular restore tests.']],
        [['Cross-region replica as a DR copy.',
            r`CHANGE REPLICATION SOURCE TO SOURCE_HOST='primary.eu-west', SOURCE_USER='repl', SOURCE_PASSWORD='***', SOURCE_AUTO_POSITION=1, SOURCE_SSL=1;
START REPLICA;
SET PERSIST super_read_only = ON;

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Immutable backup upload (shell).',
                r`aws s3 cp /backups/full-2026-05-01.xbstream s3://dr-backups-us/ --storage-class STANDARD_IA
aws s3api put-object-retention --bucket dr-backups-us --key full-2026-05-01.xbstream --retention Mode=COMPLIANCE,RetainUntilDate=2026-08-01T00:00:00Z

-- OUTPUT:
-- upload: ... to s3://dr-backups-us/full-2026-05-01.xbstream`]],
        [['DR runbook checklist (tracked).',
            r`SELECT step_no, action FROM dr_runbook WHERE plan = 'region-loss' ORDER BY step_no LIMIT 3;

-- OUTPUT:
-- step_no | action
-- 1       | Declare disaster, freeze deploys
-- 2       | Promote DR replica, enable writes
-- 3       | Switch DNS/Router to DR region`],
            ['Verify the DR copy is current.',
                r`SHOW REPLICA STATUS\G

-- OUTPUT: (excerpt)
-- Seconds_Behind_Source: 4`]]
    ),

    'InnoDB Cluster & Group Replication': x(
        ['Group Replication keeps several MySQL servers in sync with consensus. InnoDB Cluster combines Group Replication, MySQL Shell (AdminAPI) and MySQL Router.',
            'A cluster typically has 3 or more nodes; one primary accepts writes and others are secondaries.',
            'It provides automatic failover.'],
        ['Group Replication uses a Paxos-like protocol: a transaction commits when a majority certify it.',
            'Modes: single-primary (default, recommended) and multi-primary.',
            'MySQL Router routes read/write traffic to the right nodes and adapts after failover.'],
        ['Requires InnoDB, primary keys on all tables, GTIDs and row-based binlog.',
            'Majority needed: 3 nodes tolerate 1 failure, 5 tolerate 2. Place nodes in separate failure domains.',
            'Network latency affects commit latency; keep nodes close. Use ClusterSet for cross-region DR.'],
        [['F', 'What is InnoDB Cluster?', 'A high-availability solution combining Group Replication, MySQL Shell and MySQL Router.'],
            ['F', 'How many nodes are recommended?', 'At least three, so a majority survives one failure.'],
            ['M', 'Single-primary vs multi-primary?', 'Single-primary has one writable node and is simpler and safer; multi-primary allows writes on all nodes but has conflict handling and limitations.'],
            ['M', 'What requirements must tables meet?', 'InnoDB engine and a primary key.'],
            ['S', 'How does Group Replication ensure consistency?', 'Transactions are certified by the group; conflicting writes are rolled back on the loser, and commit requires a majority.'],
            ['S', 'How to design across regions?', 'Use ClusterSet (primary cluster plus replica clusters) rather than stretching one group across high-latency links.']],
        [['Create a cluster with the shell.',
            r`dba.configureInstance('root@db1:3306');
var cluster = dba.createCluster('prod');
cluster.addInstance('root@db2:3306');
cluster.addInstance('root@db3:3306');
cluster.status();

-- OUTPUT: (trimmed)
-- "status": "OK", "statusText": "Cluster is ONLINE and can tolerate up to ONE failure.", "topology": { "db1:3306": {"mode": "R/W"}, ... }`],
            ['Group membership from SQL.',
                r`SELECT member_host, member_state, member_role FROM performance_schema.replication_group_members;

-- OUTPUT:
-- member_host | member_state | member_role
-- db1         | ONLINE       | PRIMARY
-- db2         | ONLINE       | SECONDARY
-- db3         | ONLINE       | SECONDARY`]],
        [['Router bootstrap.',
            r`mysqlrouter --bootstrap root@db1:3306 --directory /opt/router --user=mysqlrouter

-- OUTPUT:
-- MySQL Classic protocol: Read/Write 6446, Read/Only 6447`],
            ['Tables without a PK block Group Replication writes.',
                r`INSERT INTO nokey_table VALUES (1);

-- OUTPUT:
-- ERROR 3098 (HY000): The table does not comply with the requirements by an external plugin.`]]
    ),

    'MySQL Router': x(
        ['MySQL Router is a lightweight proxy that routes application connections to the right MySQL servers.',
            'Apps connect to the Router (for example ports 6446 for read/write and 6447 for read-only), not directly to a database node.',
            'It follows cluster topology changes automatically.'],
        ['Bootstrapped against an InnoDB Cluster, it reads metadata to learn which node is primary and which are secondaries.',
            'Reads can be load-balanced (round-robin) across secondaries.',
            'Router instances are stateless; run one per app host or a pool behind a load balancer.'],
        ['The Router keeps connections to the primary short-lived during failover; apps must retry.',
            'It does not parse SQL (Layer 4 routing); for query-based routing use ProxySQL.',
            'Secure traffic with TLS, restrict Router metadata accounts, and monitor with its REST API.'],
        [['F', 'What is MySQL Router?', 'A proxy that directs client connections to the correct MySQL instance in a cluster.'],
            ['F', 'Why use it?', 'So apps do not need to know which node is primary after failover.'],
            ['M', 'Which ports are typical?', '6446 read/write and 6447 read-only (classic protocol).'],
            ['M', 'Does Router understand SQL?', 'No, it routes connections at the transport layer; it does not rewrite or split queries.'],
            ['S', 'How is Router different from ProxySQL?', 'Router is simple, topology-aware routing for InnoDB Cluster; ProxySQL provides query-level routing, caching, rewriting and multiplexing.'],
            ['S', 'How do you run it in production?', 'Several instances close to the apps, monitored via the REST API, with automated bootstrap and TLS.']],
        [['Application connection strings.',
            r`# writes
jdbc:mysql://router1:6446/shop
# reporting reads
jdbc:mysql://router1:6447/shop

-- OUTPUT:
-- 6446 -> current PRIMARY, 6447 -> SECONDARY nodes (round-robin)`],
            ['Router config excerpt.',
                r`[routing:prod_rw]
bind_port=6446
destinations=metadata-cache://prod/?role=PRIMARY
routing_strategy=first-available

-- OUTPUT:
-- (Router listens on 6446 and always sends to the current primary)`]],
        [['Router status via REST.',
            r`curl -s -u admin:*** http://router1:8443/api/20190715/routes

-- OUTPUT: (example)
-- {"items":[{"name":"prod_rw"},{"name":"prod_ro"}]}`],
            ['See where connections land.',
                r`SELECT @@hostname, @@read_only;

-- OUTPUT: (through port 6446)
-- @@hostname | @@read_only
-- db1        | 0`]]
    ),

    'Why Partition?': x(
        ['Partitioning splits one big table into smaller physical pieces (partitions) while it still looks like one table.',
            'Reasons: faster queries that touch one partition, easier deletion of old data, easier maintenance.',
            'MySQL partitions by RANGE, LIST, HASH or KEY.'],
        ['Partition pruning lets MySQL read only the partitions that match the WHERE.',
            'Dropping an old partition is instant compared with a huge DELETE.',
            'Every unique key (including the primary key) must include the partitioning column.'],
        ['Partitioning is not a general performance fix; queries without the partition key scan all partitions and can be slower.',
            'Too many partitions waste memory and metadata; keep tens to a few hundred.',
            'Often a better first step is a good index; partition mainly for data lifecycle management.'],
        [['F', 'What is partitioning?', 'Splitting a large table into smaller parts (partitions) managed as one table.'],
            ['F', 'Main benefit?', 'Faster pruning of data for queries and instant removal of old data by dropping a partition.'],
            ['M', 'What is partition pruning?', 'The optimizer skips partitions that cannot contain matching rows.'],
            ['M', 'What constraint applies to unique keys?', 'The partitioning columns must be part of every unique key, including the primary key.'],
            ['S', 'When is partitioning a bad idea?', 'When queries do not filter on the partition key, or when proper indexes would solve the problem.'],
            ['S', 'Partitioning vs sharding?', 'Partitioning splits data inside one server; sharding spreads data across multiple servers.']],
        [['Range partition by year.',
            r`CREATE TABLE events (id BIGINT NOT NULL, created_at DATE NOT NULL, payload VARCHAR(100), PRIMARY KEY (id, created_at))
PARTITION BY RANGE (YEAR(created_at)) (
  PARTITION p2024 VALUES LESS THAN (2025), PARTITION p2025 VALUES LESS THAN (2026), PARTITION pmax VALUES LESS THAN MAXVALUE);
SELECT partition_name, table_rows FROM information_schema.partitions WHERE table_name = 'events';

-- OUTPUT: (example)
-- partition_name | table_rows
-- p2024          | 120000
-- p2025          | 340000
-- pmax           |  15000`],
            ['Pruning in the plan.',
                r`EXPLAIN SELECT COUNT(*) FROM events WHERE created_at >= '2025-03-01' AND created_at < '2025-04-01';

-- OUTPUT: (example)
-- partitions | type
-- p2025      | range`]],
        [['Instant purge of old data.',
            r`ALTER TABLE events DROP PARTITION p2024;

-- OUTPUT:
-- Query OK, 0 rows affected   (120000 rows removed instantly)`],
            ['PK must include the partition column.',
                r`CREATE TABLE bad (id INT PRIMARY KEY, d DATE) PARTITION BY RANGE (YEAR(d)) (PARTITION p0 VALUES LESS THAN MAXVALUE);

-- OUTPUT:
-- ERROR 1503 (HY000): A PRIMARY KEY must include all columns in the table's partitioning function`]]
    ),

    'Range & List Partitioning': x(
        ['RANGE partitioning puts rows in partitions by ranges of a column (dates, ids). LIST partitioning assigns rows by specific values (country codes, region ids).',
            'Range is perfect for time-based data; list for categorical groups.',
            'Use a <code>MAXVALUE</code> catch-all partition for range.'],
        ['Add new partitions ahead of time with <code>REORGANIZE PARTITION</code> on the catch-all; or use <code>ALTER TABLE ... ADD PARTITION</code> when there is no MAXVALUE.',
            'Use <code>RANGE COLUMNS</code>/<code>LIST COLUMNS</code> to partition on dates, strings or multiple columns without function wrapping.',
            'Archive by dropping or exchanging partitions (<code>EXCHANGE PARTITION</code>).'],
        ['Automate monthly partition creation and retention with events or external jobs and alert if the future partition is missing.',
            'Choose granularity by volume: daily for very high volume, monthly otherwise.',
            'A row that matches no partition (no MAXVALUE) causes an insert error; monitor for it.'],
        [['F', 'RANGE vs LIST partitioning?', 'RANGE uses value ranges (like dates); LIST uses explicit value lists.'],
            ['F', 'Which is better for logs by month?', 'RANGE partitioning.'],
            ['M', 'What is a MAXVALUE partition for?', 'To catch rows beyond the last defined range so inserts do not fail.'],
            ['M', 'How do you add next month’s partition?', 'REORGANIZE the MAXVALUE partition into a new month partition plus a new MAXVALUE.'],
            ['S', 'How do you archive old partitions?', 'EXCHANGE PARTITION with a standalone table, then move or compress it, or simply drop after backup.'],
            ['S', 'What happens if no partition fits?', 'The insert fails with error 1526: Table has no partition for value.']],
        [['RANGE COLUMNS by date.',
            r`CREATE TABLE logs (id BIGINT NOT NULL, logged_on DATE NOT NULL, msg VARCHAR(100), PRIMARY KEY (id, logged_on))
PARTITION BY RANGE COLUMNS (logged_on) (
  PARTITION p202601 VALUES LESS THAN ('2026-02-01'),
  PARTITION p202602 VALUES LESS THAN ('2026-03-01'),
  PARTITION pmax VALUES LESS THAN (MAXVALUE));
INSERT INTO logs VALUES (1,'2026-01-15','a'),(2,'2026-02-20','b');
SELECT partition_name, table_rows FROM information_schema.partitions WHERE table_name = 'logs';

-- OUTPUT:
-- partition_name | table_rows
-- p202601        | 1
-- p202602        | 1
-- pmax           | 0`],
            ['LIST partition by region.',
                r`CREATE TABLE sales_r (id INT NOT NULL, region_id INT NOT NULL, amt DECIMAL(10,2), PRIMARY KEY (id, region_id))
PARTITION BY LIST (region_id) (PARTITION north VALUES IN (1,2), PARTITION south VALUES IN (3,4));
INSERT INTO sales_r VALUES (1, 9, 10);

-- OUTPUT:
-- ERROR 1526 (HY000): Table has no partition for value 9`]],
        [['Add the next month.',
            r`ALTER TABLE logs REORGANIZE PARTITION pmax INTO (
  PARTITION p202603 VALUES LESS THAN ('2026-04-01'),
  PARTITION pmax VALUES LESS THAN (MAXVALUE));

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Archive with EXCHANGE PARTITION.',
                r`CREATE TABLE logs_2026_01 LIKE logs;
ALTER TABLE logs_2026_01 REMOVE PARTITIONING;
ALTER TABLE logs EXCHANGE PARTITION p202601 WITH TABLE logs_2026_01;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Hash & Key Partitioning': x(
        ['HASH partitioning spreads rows evenly across N partitions using a hash of an integer expression. KEY partitioning is similar but MySQL computes the hash from the column(s).',
            'They balance data without defining ranges.',
            'Example: <code>PARTITION BY HASH(user_id) PARTITIONS 8</code>.'],
        ['Good for even distribution and reducing contention, not for data lifecycle (you cannot drop by time).',
            '<code>LINEAR HASH</code> makes adding/removing partitions faster but distribution less even.',
            'KEY can use the primary key columns by default and accepts non-integer types.'],
        ['Hash partitioning supports pruning only for equality conditions on the partition expression.',
            'Changing the number of partitions rewrites data; choose a count with growth in mind (power of two, few).',
            'If your goal is horizontal scale, sharding across servers is the real tool; hash partitions stay on one server.'],
        [['F', 'What is HASH partitioning?', 'Distributing rows across a fixed number of partitions using a hash of a value.'],
            ['F', 'HASH vs KEY?', 'HASH uses your integer expression; KEY lets MySQL hash one or more columns (any type).'],
            ['M', 'When is HASH useful?', 'To spread data and I/O evenly when no natural range exists.'],
            ['M', 'Can you prune with a range condition?', 'No, hash pruning works for equality predicates only.'],
            ['S', 'Why is changing partition count costly?', 'Rows must be redistributed, rebuilding the table.'],
            ['S', 'HASH partitioning vs sharding?', 'HASH stays on one server for contention/maintenance benefits; sharding adds servers for capacity.']],
        [['HASH partitioning.',
            r`CREATE TABLE sessions (user_id INT NOT NULL, token CHAR(32) NOT NULL, PRIMARY KEY (user_id, token))
PARTITION BY HASH (user_id) PARTITIONS 4;
INSERT INTO sessions VALUES (1,'a'),(2,'b'),(3,'c'),(4,'d'),(5,'e');
SELECT partition_name, table_rows FROM information_schema.partitions WHERE table_name = 'sessions';

-- OUTPUT:
-- partition_name | table_rows
-- p0             | 1
-- p1             | 2
-- p2             | 1
-- p3             | 1`],
            ['KEY partitioning on the primary key.',
                r`CREATE TABLE kv (k VARCHAR(40) PRIMARY KEY, v VARCHAR(100)) PARTITION BY KEY () PARTITIONS 6;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Pruning with equality.',
            r`EXPLAIN SELECT * FROM sessions WHERE user_id = 3;

-- OUTPUT: (example)
-- partitions | type
-- p3         | ref`],
            ['Changing the count rebuilds the table.',
                r`ALTER TABLE sessions COALESCE PARTITION 2;

-- OUTPUT:
-- Query OK, 5 rows affected   (data redistributed)`]]
    ),

    'Partition Pruning & Management': x(
        ['Partition pruning means MySQL scans only the partitions that can contain the requested rows.',
            'Check it with <code>EXPLAIN</code>: the <code>partitions</code> column lists those used.',
            'Management commands: ADD, DROP, REORGANIZE, EXCHANGE, TRUNCATE, REBUILD, ANALYZE PARTITION.'],
        ['Pruning needs the WHERE to compare the partition column directly (not wrapped in a function that the optimizer cannot map).',
            '<code>TRUNCATE PARTITION</code> and <code>DROP PARTITION</code> remove data quickly.',
            'Statistics and maintenance can be run per partition.'],
        ['Build automation for rolling partitions (create future, drop expired) and alert on missing future partitions.',
            'Monitor partition sizes for skew and hot partitions.',
            'Test restore/replication behaviour of partition operations; some statements take metadata locks.'],
        [['F', 'What is partition pruning?', 'Skipping partitions that cannot contain matching rows.'],
            ['F', 'How do you verify pruning?', 'Look at the partitions column in EXPLAIN.'],
            ['M', 'How do you remove old data quickly?', 'DROP or TRUNCATE the old partition instead of DELETE.'],
            ['M', 'Why might pruning fail?', 'The predicate does not use the partition column directly, or uses a non-prunable function.'],
            ['S', 'How do you automate partition maintenance?', 'A scheduled job/event creates next periods and drops expired ones, with alerts if it fails.'],
            ['S', 'What are risks of partition DDL?', 'Metadata locks and replication lag on large reorganizations; run during low traffic.']],
        [['Pruning check.',
            r`EXPLAIN SELECT * FROM logs WHERE logged_on = '2026-02-20';

-- OUTPUT: (example)
-- partitions | type
-- p202602    | ref`],
            ['Truncate one partition.',
                r`ALTER TABLE logs TRUNCATE PARTITION p202601;
SELECT partition_name, table_rows FROM information_schema.partitions WHERE table_name='logs' AND partition_name='p202601';

-- OUTPUT:
-- partition_name | table_rows
-- p202601        | 0`]],
        [['Event to add the next partition.',
            r`CREATE EVENT ev_add_partition ON SCHEDULE EVERY 1 MONTH DO
  ALTER TABLE logs REORGANIZE PARTITION pmax INTO (
    PARTITION p_next VALUES LESS THAN ('2026-06-01'), PARTITION pmax VALUES LESS THAN (MAXVALUE));

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Missing future partition alert query.',
                r`SELECT MAX(partition_description) AS last_boundary FROM information_schema.partitions WHERE table_name = 'logs' AND partition_name <> 'pmax';

-- OUTPUT:
-- last_boundary
-- '2026-03-01'`]]
    ),

    'InnoDB Storage Engine': x(
        ['InnoDB is MySQL’s default storage engine. It supports transactions, row-level locking, foreign keys and crash recovery.',
            'Data is stored in tablespaces made of 16 KB pages, organised as B-trees by primary key.',
            'Most production MySQL uses InnoDB.'],
        ['Components: buffer pool (cache), redo log, undo log, doublewrite buffer, change buffer, tablespaces.',
            'ACID is implemented with redo (durability), undo (atomicity, MVCC) and locks (isolation).',
            'Check engine with <code>SHOW ENGINES</code> or <code>SHOW TABLE STATUS</code>.'],
        ['InnoDB is optimized for OLTP; large scans and analytics compete for buffer pool.',
            'Know the key settings: <code>innodb_buffer_pool_size</code>, <code>innodb_log_file_size</code> / <code>innodb_redo_log_capacity</code>, <code>innodb_flush_log_at_trx_commit</code>, <code>innodb_flush_method</code>.',
            'File-per-table tablespaces make space management and backups easier.'],
        [['F', 'What is InnoDB?', 'The default MySQL storage engine with transactions, row-level locks and crash recovery.'],
            ['F', 'Why is InnoDB preferred over MyISAM?', 'It is transactional, crash safe and supports foreign keys and row-level locking.'],
            ['M', 'What are the main InnoDB memory and log structures?', 'Buffer pool, redo log, undo log, doublewrite buffer and change buffer.'],
            ['M', 'What is a page?', 'The 16 KB unit InnoDB reads and writes; tables and indexes are made of pages.'],
            ['S', 'Which InnoDB settings matter most for performance?', 'Buffer pool size, redo log capacity, flush settings, I/O capacity and flush method (O_DIRECT).'],
            ['S', 'How does InnoDB ensure crash safety?', 'Write-ahead redo logging, doublewrite buffer for torn pages and undo to roll back uncommitted work during recovery.']],
        [['Show engines and a table’s engine.',
            r`SELECT engine, support FROM information_schema.engines WHERE engine IN ('InnoDB','MyISAM');

-- OUTPUT:
-- engine | support
-- InnoDB | DEFAULT
-- MyISAM | YES`],
            ['Key settings.',
                r`SHOW VARIABLES WHERE Variable_name IN ('innodb_buffer_pool_size','innodb_page_size','innodb_flush_log_at_trx_commit','innodb_flush_method');

-- OUTPUT: (example)
-- innodb_buffer_pool_size        | 8589934592
-- innodb_page_size               | 16384
-- innodb_flush_log_at_trx_commit | 1
-- innodb_flush_method            | O_DIRECT`]],
        [['Engine status report.',
            r`SHOW ENGINE INNODB STATUS\G

-- OUTPUT: (sections)
-- BACKGROUND THREAD, SEMAPHORES, LATEST DETECTED DEADLOCK, TRANSACTIONS, FILE I/O, LOG, BUFFER POOL AND MEMORY, ROW OPERATIONS`],
            ['Convert a MyISAM table.',
                r`ALTER TABLE legacy_table ENGINE = InnoDB;

-- OUTPUT:
-- Query OK, 5000 rows affected`]]
    ),

    'Buffer Pool': x(
        ['The buffer pool is InnoDB’s memory cache of table and index pages. A bigger pool means fewer disk reads.',
            'Set it with <code>innodb_buffer_pool_size</code>; on a dedicated server use about 60-75% of RAM.',
            'A good cache hit ratio makes queries much faster.'],
        ['Pages are managed with an LRU list (young and old sublists) to protect hot pages from one-time scans.',
            'Dirty pages are flushed in the background; the checkpoint age relates to redo log capacity.',
            'The pool can be resized online and split into instances for concurrency.'],
        ['Warm-up: <code>innodb_buffer_pool_dump_at_shutdown</code>/<code>load_at_startup</code> restore the cache after restart.',
            'Watch hit ratio, free pages, dirty pages and read requests vs reads from disk.',
            'Oversizing causes swapping, which is worse than a smaller pool.'],
        [['F', 'What is the InnoDB buffer pool?', 'The memory area where InnoDB caches data and index pages.'],
            ['F', 'Which variable sets its size?', '<code>innodb_buffer_pool_size</code>.'],
            ['M', 'How do you check the hit ratio?', 'Compare <code>Innodb_buffer_pool_reads</code> (disk) with <code>Innodb_buffer_pool_read_requests</code> (memory).'],
            ['M', 'What does the LRU midpoint do?', 'New pages enter the middle (old sublist) so a big scan does not flush hot pages.'],
            ['S', 'How big should it be?', 'Large enough for the working set; typically 60-75% of RAM on a dedicated host while leaving memory for connections, temp tables and the OS.'],
            ['S', 'How do you avoid cold-start slowness?', 'Enable buffer pool dump/load at shutdown/startup and warm with representative queries.']],
        [['Hit ratio.',
            r`SELECT (1 - (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME='Innodb_buffer_pool_reads') /
              (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME='Innodb_buffer_pool_read_requests')) * 100 AS hit_pct;

-- OUTPUT: (example)
-- hit_pct
-- 99.87`],
            ['Resize online.',
                r`SET GLOBAL innodb_buffer_pool_size = 12 * 1024 * 1024 * 1024;
SELECT @@innodb_buffer_pool_size / 1024 / 1024 / 1024 AS gb;

-- OUTPUT:
-- gb
-- 12.0000`]],
        [['Pool status.',
            r`SELECT pool_size, free_buffers, database_pages, modified_database_pages FROM information_schema.innodb_buffer_pool_stats;

-- OUTPUT: (example)
-- pool_size | free_buffers | database_pages | modified_database_pages
-- 524288    | 1024         | 520000         | 3200`],
            ['Warm-up settings.',
                r`SET GLOBAL innodb_buffer_pool_dump_at_shutdown = ON;
SET GLOBAL innodb_buffer_pool_load_at_startup = ON;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Redo Log & Undo Log': x(
        ['The redo log records changes so committed data survives a crash (durability). The undo log stores old versions so you can roll back and read consistent snapshots.',
            'Redo is for replay forward after a crash; undo is for rolling back and MVCC.',
            'Both are written before data pages are flushed.'],
        ['Write-ahead logging: changes go to the redo log first, data pages are written later.',
            'Redo capacity is set by <code>innodb_redo_log_capacity</code> (8.0.30+); too small causes aggressive flushing and stalls.',
            'Undo is stored in undo tablespaces and cleaned by purge threads when no snapshot needs old versions.'],
        ['Long transactions prevent purge, growing the undo history list and slowing reads.',
            'Size redo for peak write bursts: it should hold at least an hour of writes on busy systems (guideline).',
            '<code>innodb_flush_log_at_trx_commit</code>: 1 durable per commit; 2/0 trade durability for speed.'],
        [['F', 'What is the redo log for?', 'To recover committed changes after a crash.'],
            ['F', 'What is the undo log for?', 'To roll back transactions and provide old versions for consistent reads.'],
            ['M', 'What is write-ahead logging?', 'Changes are written to the log before the data pages, so they can be replayed after a crash.'],
            ['M', 'Why do long transactions hurt?', 'They keep old undo versions alive, so purge cannot clean and the history list grows.'],
            ['S', 'How do you size redo log capacity?', 'Observe checkpoint age and write rate; capacity should absorb bursts without forcing flush storms.'],
            ['S', 'What does innodb_flush_log_at_trx_commit=2 do?', 'Writes to the OS cache each commit but fsyncs once per second: faster, but an OS crash can lose about a second of commits.']],
        [['Redo settings and activity.',
            r`SHOW VARIABLES LIKE 'innodb_redo_log_capacity';
SHOW STATUS LIKE 'Innodb_os_log_written';

-- OUTPUT: (example)
-- innodb_redo_log_capacity | 10737418240
-- Innodb_os_log_written    | 8123412992`],
            ['Undo history length.',
                r`SELECT count AS history_list_length FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len';

-- OUTPUT:
-- history_list_length
-- 312`]],
        [['Find the transaction holding purge back.',
            r`SELECT trx_id, trx_started, trx_mysql_thread_id FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 1;

-- OUTPUT: (example)
-- trx_id | trx_started         | trx_mysql_thread_id
-- 9981   | 2026-05-01 08:00:00 | 44`],
            ['Durability trade-off.',
                r`SET GLOBAL innodb_flush_log_at_trx_commit = 2;   -- faster, risk ~1 s of commits on OS crash

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Doublewrite Buffer & Change Buffer': x(
        ['The doublewrite buffer protects against partial (torn) page writes: pages are written to a safe area first, then to their real location.',
            'The change buffer caches changes to secondary index pages that are not in memory and merges them later.',
            'Both improve safety or speed behind the scenes.'],
        ['After a crash, a half-written 16 KB page can be repaired from the doublewrite copy.',
            'Change buffering turns random secondary-index writes into fewer, batched I/Os (not for unique indexes).',
            'Controlled by <code>innodb_doublewrite</code> and <code>innodb_change_buffering</code>/<code>innodb_change_buffer_max_size</code>.'],
        ['Disabling doublewrite is only safe on storage that guarantees atomic 16 KB writes; otherwise risk corruption.',
            'A large change buffer can lengthen shutdown/recovery as merges must finish (<code>innodb_fast_shutdown</code>).',
            'On SSDs the benefit of change buffering shrinks; evaluate with workload tests.'],
        [['F', 'What is the doublewrite buffer for?', 'To prevent corruption from partially written pages after a crash.'],
            ['F', 'What is the change buffer?', 'A cache of changes to secondary index pages not currently in memory.'],
            ['M', 'Does change buffering apply to unique indexes?', 'No, uniqueness requires reading the page to check duplicates.'],
            ['M', 'How does doublewrite recover a torn page?', 'InnoDB restores the page from the doublewrite copy and then applies redo.'],
            ['S', 'When is it safe to disable doublewrite?', 'On storage/filesystems with atomic writes of the page size (some cloud and ZFS/hardware setups), after verification.'],
            ['S', 'Why might shutdown be slow with a large change buffer?', 'Pending merges are processed during slow shutdown; use fast shutdown or plan maintenance windows.']],
        [['Check settings.',
            r`SHOW VARIABLES WHERE Variable_name IN ('innodb_doublewrite','innodb_change_buffering','innodb_change_buffer_max_size');

-- OUTPUT: (example)
-- innodb_doublewrite            | ON
-- innodb_change_buffering       | all
-- innodb_change_buffer_max_size | 25`],
            ['Change buffer activity.',
                r`SELECT name, count FROM information_schema.innodb_metrics WHERE name LIKE 'ibuf_merges%';

-- OUTPUT: (example)
-- name              | count
-- ibuf_merges       | 128450
-- ibuf_merges_insert| 120310`]],
        [['Doublewrite counters.',
            r`SHOW STATUS LIKE 'Innodb_dblwr%';

-- OUTPUT: (example)
-- Innodb_dblwr_pages_written | 5231044
-- Innodb_dblwr_writes        |  412881`],
            ['Reduce change buffer for SSD.',
                r`SET GLOBAL innodb_change_buffer_max_size = 10;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Adaptive Hash Index': x(
        ['The adaptive hash index (AHI) is an in-memory hash table that InnoDB builds automatically over frequently used index pages to speed equality lookups.',
            'You do not create it; InnoDB decides based on access patterns.',
            'It is controlled by <code>innodb_adaptive_hash_index</code>.'],
        ['AHI helps workloads with many repeated equality lookups on the same pages (point reads).',
            'It adds maintenance overhead and can cause contention on a global latch under heavy write or mixed load.',
            'Check usefulness in <code>SHOW ENGINE INNODB STATUS</code> (hash searches/s vs non-hash searches/s).'],
        ['In high-concurrency workloads, partitioning AHI (<code>innodb_adaptive_hash_index_parts</code>) or disabling it can improve throughput; test with your workload.',
            'Cloud-managed MySQL often disables it by default.',
            'Do not rely on it for design; good indexes and queries matter more.'],
        [['F', 'What is the adaptive hash index?', 'An automatic in-memory hash index InnoDB builds on hot index pages to speed equality lookups.'],
            ['F', 'Can you create it manually?', 'No, InnoDB manages it automatically.'],
            ['M', 'How do you check whether it helps?', 'Compare hash searches/s with non-hash searches/s in SHOW ENGINE INNODB STATUS.'],
            ['M', 'What problem can it cause?', 'Latch contention under high concurrency or write-heavy loads.'],
            ['S', 'When would you disable it?', 'When monitoring shows AHI latch contention and low hash hit rates; benchmark before and after.'],
            ['S', 'Does AHI help range scans?', 'No, only equality lookups on index prefixes.']],
        [['Check AHI usage.',
            r`SHOW ENGINE INNODB STATUS\G

-- OUTPUT: (excerpt)
-- Hash table size 553253, used cells 12044
-- 8221.45 hash searches/s, 1744.32 non-hash searches/s`],
            ['Disable it online.',
                r`SET GLOBAL innodb_adaptive_hash_index = OFF;
SELECT @@innodb_adaptive_hash_index;

-- OUTPUT:
-- @@innodb_adaptive_hash_index
-- 0`]],
        [['Partition to reduce contention.',
            r`-- my.cnf
innodb_adaptive_hash_index = ON
innodb_adaptive_hash_index_parts = 16

-- OUTPUT: (after restart)
-- 16 AHI partitions, less latch contention`],
            ['Metrics view.',
                r`SELECT name, count FROM information_schema.innodb_metrics WHERE name LIKE 'adaptive_hash%';

-- OUTPUT: (example)
-- name                           | count
-- adaptive_hash_searches         | 912330021
-- adaptive_hash_searches_btree   |  212330011`]]
    ),

    'Tablespaces, Data Pages & Index Pages': x(
        ['A tablespace is a file (or set) where InnoDB stores data. Data is divided into 16 KB pages; table rows live in data pages (leaf pages of the clustered index) and index entries in index pages.',
            'By default each table has its own file (<code>.ibd</code>) with <code>innodb_file_per_table=ON</code>.',
            'Pages group into extents (1 MB) and segments.'],
        ['Tablespace types: system, file-per-table, general tablespaces, undo tablespaces, temporary tablespaces.',
            'A page holds many rows; rows are variable length and large values may be stored off-page (overflow).',
            'Free space inside files is reused, but files only shrink on rebuild (OPTIMIZE TABLE).'],
        ['Fragmentation after heavy deletes/updates leaves half-empty pages; rebuild or tune fill factors (<code>innodb_fill_factor</code>).',
            'General tablespaces allow placing tables on specific storage and encrypting them as a unit.',
            'Transportable tablespaces (<code>FLUSH TABLES ... FOR EXPORT</code>) allow fast table moves between servers.'],
        [['F', 'What size is an InnoDB page?', '16 KB by default.'],
            ['F', 'What is a .ibd file?', 'The file-per-table tablespace file holding a table’s data and indexes.'],
            ['M', 'Why does the data file not shrink after DELETE?', 'The freed pages remain in the tablespace for reuse; rebuild with OPTIMIZE TABLE to reclaim disk space.'],
            ['M', 'What is a general tablespace?', 'A shared tablespace you create explicitly to hold multiple tables.'],
            ['S', 'How can you copy a big table between servers quickly?', 'Use transportable tablespaces: export, copy .ibd and .cfg, then import.'],
            ['S', 'How do you detect fragmentation?', 'Compare data_free to data_length in information_schema.tables and measure page fill; rebuild when substantial.']],
        [['Tablespaces and sizes.',
            r`SELECT name, file_size/1024/1024 AS mb, allocated_size/1024/1024 AS alloc_mb FROM information_schema.innodb_tablespaces WHERE name LIKE 'shop/%' LIMIT 3;

-- OUTPUT: (example)
-- name        | mb     | alloc_mb
-- shop/orders | 512.00 | 512.00
-- shop/emp    |   0.11 |   0.11`],
            ['Free space inside a table.',
                r`SELECT table_name, ROUND(data_length/1024/1024) AS data_mb, ROUND(data_free/1024/1024) AS free_mb FROM information_schema.tables WHERE table_schema = 'shop' ORDER BY data_free DESC LIMIT 2;

-- OUTPUT: (example)
-- table_name | data_mb | free_mb
-- events     |    4200 |     900`]],
        [['Reclaim space.',
            r`OPTIMIZE TABLE events;

-- OUTPUT:
-- Table       | Op       | Msg_type | Msg_text
-- shop.events | optimize | note     | Table does not support optimize, doing recreate + analyze instead
-- shop.events | optimize | status   | OK`],
            ['General tablespace.',
                r`CREATE TABLESPACE ts_fast ADD DATAFILE 'ts_fast.ibd' ENGINE=InnoDB;
CREATE TABLE hot_data (id INT PRIMARY KEY) TABLESPACE ts_fast;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'What is MVCC?': x(
        ['MVCC (Multi-Version Concurrency Control) lets readers and writers work at the same time by keeping multiple versions of rows.',
            'A reader sees a consistent snapshot instead of waiting for writers.',
            'InnoDB implements it with undo logs and transaction ids.'],
        ['Plain SELECTs are non-locking: they read the version of each row visible to their snapshot.',
            'Writers create new versions and keep old ones in undo until no snapshot needs them.',
            'This is why long transactions can bloat the undo history.'],
        ['MVCC underlies isolation: READ COMMITTED takes a new snapshot per statement, REPEATABLE READ one per transaction.',
            'Writes still lock rows, and locking reads (FOR UPDATE) see the latest committed data, not the snapshot.',
            'Understand "current read" vs "snapshot read" to avoid logic bugs.'],
        [['F', 'What is MVCC?', 'A technique that keeps multiple versions of data so reads do not block writes.'],
            ['F', 'Who benefits?', 'Readers: they do not need to wait for writers.'],
            ['M', 'Where does InnoDB keep old versions?', 'In the undo logs, linked from each row via a roll pointer.'],
            ['M', 'Snapshot read vs current read?', 'A snapshot read sees the transaction’s consistent view; a current read (FOR UPDATE, UPDATE) sees the latest committed version.'],
            ['S', 'Why can MVCC cause table bloat or slowdowns?', 'Long snapshots keep old versions alive, so purge lags and queries traverse long version chains.'],
            ['S', 'How does isolation level change MVCC behaviour?', 'READ COMMITTED creates a fresh read view for each statement; REPEATABLE READ reuses one for the whole transaction.']],
        [['Reader not blocked by writer.',
            r`-- A
START TRANSACTION; UPDATE acct SET bal = 0 WHERE id = 1;
-- B (does not wait)
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT: (B)
-- bal
-- 1000.00`],
            ['Snapshot vs current read.',
                r`START TRANSACTION;
SELECT bal FROM acct WHERE id = 1;                       -- snapshot value
SELECT bal FROM acct WHERE id = 1 FOR UPDATE;            -- latest committed value
COMMIT;

-- OUTPUT:
-- 1000.00
-- 900.00   (if another transaction committed 900 meanwhile)`]],
        [['Monitor undo chain pressure.',
            r`SELECT count AS history_list_length FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len';

-- OUTPUT:
-- history_list_length
-- 41200`],
            ['Oldest active transaction.',
                r`SELECT trx_id, trx_started FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 1;

-- OUTPUT:
-- trx_id | trx_started
-- 77123  | 2026-05-01 06:12:03`]]
    ),

    'Consistent Reads & Read Views': x(
        ['A consistent read shows data as of a snapshot. InnoDB builds a read view that lists which transactions’ changes are visible.',
            'At REPEATABLE READ the read view is created at the first consistent read; at READ COMMITTED it is created for each statement.',
            '<code>START TRANSACTION WITH CONSISTENT SNAPSHOT</code> creates it immediately.'],
        ['Rows changed by transactions that were active (uncommitted) or started after the read view are invisible; InnoDB follows the undo chain to older versions.',
            'Your own changes are always visible to you.',
            'A consistent read does not take locks, so it does not block anyone.'],
        ['Consistent snapshot plus <code>mysqldump --single-transaction</code> yields a point-in-time backup without blocking writes.',
            'Mixing snapshot reads and locking reads in one transaction can show surprising differences.',
            'Long-lived read views are the main source of undo growth.'],
        [['F', 'What is a read view?', 'The set of rules InnoDB uses to decide which row versions a transaction can see.'],
            ['F', 'Does a consistent read take locks?', 'No.'],
            ['M', 'When is the read view created at REPEATABLE READ?', 'At the first consistent read in the transaction, or immediately with WITH CONSISTENT SNAPSHOT.'],
            ['M', 'How does mysqldump get a consistent backup without locks?', 'It starts a transaction with a consistent snapshot (<code>--single-transaction</code>) and reads all tables from it.'],
            ['S', 'Why can a long report cause problems?', 'Its read view keeps old row versions from being purged, growing undo and slowing other queries.'],
            ['S', 'Why can a snapshot show different data than FOR UPDATE?', 'Snapshot reads use the read view; locking reads read the latest committed rows.']],
        [['Consistent snapshot.',
            r`START TRANSACTION WITH CONSISTENT SNAPSHOT;
SELECT COUNT(*) FROM orders;      -- counts as of snapshot
-- other sessions insert more rows
SELECT COUNT(*) FROM orders;      -- same count
COMMIT;

-- OUTPUT:
-- COUNT(*)
-- 1000
-- COUNT(*)
-- 1000`],
            ['Backup with a snapshot.',
                r`mysqldump --single-transaction --source-data=2 shop > shop.sql

-- OUTPUT:
-- (consistent dump taken without blocking writers)`]],
        [['READ COMMITTED sees new commits each statement.',
            r`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT COUNT(*) FROM orders;      -- 1000
-- another session commits 5 rows
SELECT COUNT(*) FROM orders;      -- 1005
COMMIT;

-- OUTPUT:
-- 1000
-- 1005`],
            ['Find long read views.',
                r`SELECT trx_id, TIMESTAMPDIFF(MINUTE, trx_started, NOW()) AS minutes_open FROM information_schema.innodb_trx WHERE trx_started < NOW() - INTERVAL 10 MINUTE;

-- OUTPUT:
-- trx_id | minutes_open
-- 77123  | 55`]]
    ),

    'Undo Logs & Transaction IDs': x(
        ['Each InnoDB row has hidden fields: a transaction id (DB_TRX_ID) of the last change and a roll pointer to its previous version in the undo log.',
            'Undo records let InnoDB reconstruct older versions for consistent reads and roll back.',
            'Transaction ids increase with each write transaction.'],
        ['Versions form a chain: current row to undo record to older undo record, and so on.',
            'Purge threads remove undo records no snapshot needs.',
            'Rolling back replays undo to restore the previous values.'],
        ['Heavy updates to the same row create long version chains; readers on old snapshots must walk them, slowing queries.',
            'Undo tablespaces can be truncated automatically (<code>innodb_undo_log_truncate</code>).',
            'Monitor history length, purge lag and undo tablespace size.'],
        [['F', 'What is stored in the undo log?', 'Previous versions of changed rows.'],
            ['F', 'What is DB_TRX_ID?', 'A hidden column storing the id of the transaction that last modified the row.'],
            ['M', 'What is DB_ROLL_PTR?', 'A pointer to the undo record holding the previous version of the row.'],
            ['M', 'Who removes old undo records?', 'Purge threads, once no active snapshot needs them.'],
            ['S', 'Why do hot rows with long transactions slow reads?', 'Long version chains must be traversed to find the visible version.'],
            ['S', 'How do you control undo growth?', 'Keep transactions short, avoid long snapshots, tune purge threads and enable undo tablespace truncation.']],
        [['Undo tablespaces.',
            r`SELECT name, state, file_size/1024/1024 AS mb FROM information_schema.innodb_tablespaces WHERE name LIKE 'innodb_undo%';

-- OUTPUT: (example)
-- name           | state  | mb
-- innodb_undo_001| active | 16.00
-- innodb_undo_002| active | 16.00`],
            ['Truncation setting.',
                r`SET GLOBAL innodb_undo_log_truncate = ON;
SET GLOBAL innodb_max_undo_log_size = 1073741824;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Purge lag.',
            r`SHOW ENGINE INNODB STATUS\G

-- OUTPUT: (excerpt)
-- TRANSACTIONS
-- Trx id counter 4521881
-- Purge done for trx's n:o < 4521790 undo n:o < 0
-- History list length 91`],
            ['Rollback uses undo.',
                r`START TRANSACTION; UPDATE acct SET bal = 5 WHERE id = 1; ROLLBACK;
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT:
-- bal
-- 1000.00`]]
    ),

    'Visibility Rules & Snapshot Isolation': x(
        ['Visibility rules decide whether a row version is visible to a read view: versions from committed transactions before the snapshot are visible, others are not.',
            'Snapshot isolation means a transaction sees the database as of its start time.',
            'InnoDB’s REPEATABLE READ is similar to snapshot isolation for reads.'],
        ['A version is visible if its transaction id is below the read view’s low-water mark, not in the active list, and not the creator’s future changes.',
            'The transaction sees its own changes.',
            'Otherwise InnoDB follows the roll pointer to an older version.'],
        ['Snapshot isolation allows write skew: two transactions read overlapping data and update different rows, breaking an invariant.',
            'Prevent it with locking reads (FOR UPDATE on the checked rows), constraints or SERIALIZABLE.',
            'Understand that InnoDB REPEATABLE READ is not full serializability.'],
        [['F', 'What does snapshot isolation mean?', 'A transaction sees a consistent snapshot of data as of its start.'],
            ['F', 'Does a transaction see its own changes?', 'Yes.'],
            ['M', 'What is the basic visibility rule?', 'A row version is visible if it was committed before the read view was created (and not by a later or still-active transaction), or created by the same transaction.'],
            ['M', 'What is write skew?', 'Two transactions read the same data and update different rows, leaving the combined result invalid even though each is valid alone.'],
            ['S', 'How do you prevent write skew in MySQL?', 'Use SELECT ... FOR UPDATE on the rows that define the invariant, unique constraints, or SERIALIZABLE.'],
            ['S', 'Is InnoDB REPEATABLE READ the same as serializable?', 'No; it prevents many anomalies but not all, such as write skew.']],
        [['Write skew example.',
            r`-- rule: at least one doctor must be on call
-- A: SELECT COUNT(*) FROM oncall WHERE on_call = 1;   -- 2
-- B: SELECT COUNT(*) FROM oncall WHERE on_call = 1;   -- 2
-- A: UPDATE oncall SET on_call = 0 WHERE doctor = 'Abaji';
-- B: UPDATE oncall SET on_call = 0 WHERE doctor = 'Raoji';
-- both commit

-- OUTPUT:
-- no doctor on call (invariant broken)`],
            ['Fix with locking read.',
                r`START TRANSACTION;
SELECT COUNT(*) FROM oncall WHERE on_call = 1 FOR UPDATE;
UPDATE oncall SET on_call = 0 WHERE doctor = 'Abaji';
COMMIT;

-- OUTPUT:
-- COUNT(*)
-- 2     (the second transaction waits, then sees only one doctor left)`]],
        [['Own changes are visible.',
            r`START TRANSACTION;
UPDATE acct SET bal = 777 WHERE id = 1;
SELECT bal FROM acct WHERE id = 1;
ROLLBACK;

-- OUTPUT:
-- bal
-- 777.00`],
            ['Constraint-based guard.',
                r`ALTER TABLE shifts ADD UNIQUE KEY uq_shift_day_slot (day, slot);

-- OUTPUT:
-- Query OK, 0 rows affected   (the database now rejects double booking)`]]
    )
};
