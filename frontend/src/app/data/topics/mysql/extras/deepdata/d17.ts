// Deep dive, module 47 (Production-Level MySQL).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d17: Record<string, Deep> = {
    'Monitoring, Logging & Metrics': dv(
        [`Monitoring turns server internals into signals you can alert on. Metrics come from status counters (<code>SHOW GLOBAL STATUS</code>), the Performance Schema and sys schema, the OS (CPU, memory, disk, network) and the application. Logs complement metrics: the error log, slow query log, binary log, audit log and general log (rarely). Use the four golden signals: latency, traffic, errors, saturation.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Questions','Threads_connected','Threads_running','Slow_queries','Aborted_connects','Uptime','Innodb_row_lock_waits');
SELECT logged, prio, error_code, LEFT(data, 70) AS msg FROM performance_schema.error_log ORDER BY logged DESC LIMIT 2;

-- OUTPUT: (example)
-- Questions         | 98765432
-- Threads_running   |        6
-- Slow_queries      |      412
-- logged              | prio | error_code | msg
-- 2026-05-01 10:00:01 | Note | MY-010931  | /usr/sbin/mysqld: ready for connections`],
        [`Collection stack: <code>mysqld_exporter</code> into Prometheus and Grafana, Percona PMM, or cloud monitoring (CloudWatch, Datadog). Rates come from counter differences over time, not raw values. Keep application-side metrics too: pool wait time, error rate, query latency per endpoint.`,
            r`# prometheus rules
- record: mysql:qps
  expr: rate(mysql_global_status_questions[1m])
- alert: MySQLTooManyConnections
  expr: mysql_global_status_threads_connected / mysql_global_variables_max_connections > 0.8
  for: 5m
- alert: MySQLDown
  expr: mysql_up == 0
  for: 1m

-- OUTPUT:
-- alerts fire only when the condition persists for the stated duration`],
        [`Mistakes: alerting on every metric (alert fatigue), no baselines (what is normal?), monitoring only the database and not user impact, and no disk-space or replication alerts. Alert on symptoms and capacity, and review noisy alerts regularly.`,
            r`- alert: MySQLDiskSpaceLow
  expr: node_filesystem_avail_bytes{mountpoint="/var/lib/mysql"} / node_filesystem_size_bytes < 0.2
  for: 10m
- alert: MySQLReplicaLagHigh
  expr: mysql_slave_status_seconds_behind_master > 30
  for: 5m

-- OUTPUT:
-- the two alerts that most often prevent outages: disk space and replication lag`],
        [`Dashboards worth having: QPS and latency percentiles, connections and running threads, buffer pool hit rate and dirty pages, InnoDB row lock waits and deadlocks, history list length, replication lag, temp tables on disk, top digests by total time, disk and I/O latency.`,
            r`SELECT (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_row_lock_waits') AS lock_waits,
       (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Created_tmp_disk_tables') AS disk_tmp,
       (SELECT count FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len') AS history_len;

-- OUTPUT:
-- lock_waits | disk_tmp | history_len
-- 8120       |    18200 |         312`],
        [`Real-world on-call runbook entry: an alert fires on high running threads. Steps: check processlist states, long transactions, lock waits, top digests, recent deploys, then decide to kill, roll back or scale.`,
            r`SELECT state, COUNT(*) AS n FROM information_schema.processlist WHERE command <> 'Sleep' GROUP BY state ORDER BY n DESC;
SELECT trx_id, trx_started, trx_query FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 3;

-- OUTPUT:
-- state                         | n
-- Waiting for table metadata lock | 41`]
    ),

    'Query Profiling & Capacity Planning': dv(
        [`Profiling finds where a query spends time: EXPLAIN ANALYZE (per iterator), Performance Schema stages and waits, sys views, and APM traces. Capacity planning predicts when a resource (CPU, memory, disk, IOPS, connections) will run out, from growth trends and load tests, so you scale before saturation.`,
            r`UPDATE performance_schema.setup_instruments SET enabled = 'YES', timed = 'YES' WHERE name LIKE 'stage/%';
UPDATE performance_schema.setup_consumers SET enabled = 'YES' WHERE name LIKE 'events_stages%' OR name LIKE 'events_statements_history%';
SELECT event_name, ROUND(timer_wait / 1e9, 2) AS ms FROM performance_schema.events_stages_history_long ORDER BY timer_wait DESC LIMIT 3;

-- OUTPUT: (example)
-- event_name              | ms
-- stage/sql/Sending data  | 412.20
-- stage/sql/executing     |  38.10`],
        [`Inputs for planning: data growth per month and retention, index overhead, row and request growth, peak versus average load, working set size against RAM, IOPS and throughput needs, connection counts, and failure headroom (what happens when a node is down). Load tests provide the missing numbers.`,
            r`SELECT table_name, ROUND((data_length + index_length) / 1073741824, 1) AS gb FROM information_schema.tables WHERE table_schema = 'shop' ORDER BY gb DESC LIMIT 3;
SELECT ROUND(400 * 0.8 - 310) / 9 AS months_until_80pct_disk;

-- OUTPUT:
-- table_name  | gb
-- order_items | 84.2
-- months_until_80pct_disk
-- 1.1111`],
        [`Mistakes: planning from averages instead of peaks, ignoring growth of indexes and backups, testing with data too small to show cache effects, and no headroom for failover (when one replica is down the others carry its load). Plan for peak plus a safety margin, typically 30-40% free.`,
            r`SELECT 4200 AS peak_qps, 0.6 AS target_utilization, ROUND(4200 / 0.6) AS capacity_qps_needed;
SELECT ROUND(SUM(data_length + index_length) / 1073741824) AS hot_gb, ROUND(@@innodb_buffer_pool_size / 1073741824) AS pool_gb FROM information_schema.tables WHERE table_schema = 'shop';

-- OUTPUT:
-- peak_qps | target_utilization | capacity_qps_needed
--     4200 |                0.6 |                7000`],
        [`Load test realistically: production-like data volume and skew, replayed or synthetic traffic with the real mix of reads and writes, warm caches, and measurement of latency percentiles and saturation indicators, not just throughput.`,
            r`sysbench oltp_read_write --mysql-host=db --mysql-user=bench --mysql-password=*** --mysql-db=bench --tables=16 --table-size=10000000 --threads=64 --time=300 run

-- OUTPUT: (summary)
-- transactions: 41200 per sec   latency 95th percentile: 18.95 ms   errors: 0`],
        [`Real-world: a table growing 9 GB per month on a 400 GB volume had one month of runway. Capacity review caught it, and the fix was partitioning with retention plus archiving, not just a bigger disk.`,
            r`ALTER TABLE events PARTITION BY RANGE (TO_DAYS(created_at)) (PARTITION p202605 VALUES LESS THAN (TO_DAYS('2026-06-01')), PARTITION pmax VALUES LESS THAN MAXVALUE);
ALTER TABLE events DROP PARTITION p202401;

-- OUTPUT:
-- Query OK, 0 rows affected   (48 million old rows removed instantly)`]
    ),

    'Backup Verification & Disaster Recovery': dv(
        [`A backup is only proven when it has been restored. Verification means restoring into a scratch environment, checking the database starts, running integrity checks (CHECK TABLE, checksums, row counts), and exercising the application against it. It also measures real restore time, which is your actual RTO.`,
            r`xtrabackup --prepare --target-dir=/restore/latest
# start a temporary mysqld on port 3399 with datadir=/restore/latest
mysql -P3399 -e "CHECK TABLE shop.orders; SELECT COUNT(*) FROM shop.orders;"

-- OUTPUT:
-- Table       | Op    | Msg_type | Msg_text
-- shop.orders | check | status   | OK
-- COUNT(*)
-- 120450889`],
        [`Automate it: a nightly job restores the latest backup, replays binlogs to a target time, runs validation queries, compares checksums or row counts with a replica, records duration, and alerts on failure. Disaster recovery adds a standby in another failure domain and a rehearsed runbook.`,
            r`CHECKSUM TABLE shop.orders;
SELECT (SELECT COUNT(*) FROM shop.orders) - (SELECT COUNT(*) FROM verify.orders) AS row_difference;
INSERT INTO ops.backup_checks (backup_name, restored_at, duration_min, rows_checked, status) VALUES ('full-2026-05-01', NOW(), 38, 120450889, 'OK');

-- OUTPUT:
-- Table       | Checksum
-- shop.orders | 2918457613
-- row_difference
-- 0`],
        [`Mistakes: never testing restores, backups stored beside the data, missing binlogs (no point-in-time recovery), encrypted backups with lost keys, and a runbook nobody has run. Test restore and decryption with the keys stored separately.`,
            r`SELECT backup_name, TIMESTAMPDIFF(HOUR, verified_at, NOW()) AS hours_since_verified FROM ops.backup_catalog ORDER BY finished_at DESC LIMIT 1;
-- alert when hours_since_verified > 26

-- OUTPUT:
-- backup_name    | hours_since_verified
-- full-2026-05-01|                    5`],
        [`Measure recovery time and data loss in drills and compare with the targets. Break the time down: fetch backup, decrypt, copy, prepare, replay binlog, validation, DNS and application warm-up.`,
            r`SELECT step, minutes FROM ops.restore_timing WHERE drill_id = 7 ORDER BY step_no;

-- OUTPUT: (example)
-- step              | minutes
-- fetch from S3     |      14
-- prepare           |      11
-- binlog replay     |       6
-- validation        |       4
-- total             |      35`],
        [`Real-world: an annual region-loss exercise restores production backups in the DR region, runs the application against it and records every gap found (missing secrets, outdated runbook, wrong DNS TTL), with owners and deadlines.`,
            r`SELECT scenario, TIMESTAMPDIFF(MINUTE, started_at, finished_at) AS minutes, gaps_found, gaps_fixed FROM ops.dr_tests ORDER BY started_at DESC LIMIT 2;

-- OUTPUT:
-- scenario    | minutes | gaps_found | gaps_fixed
-- region-loss |      72 |          6 |          6`]
    ),

    'Security Hardening': dv(
        [`Hardening shrinks the attack surface. Layers: network (private subnets, firewall, TLS), authentication (strong unique credentials, no anonymous accounts, secrets in a vault), authorization (least privilege, roles), data protection (encryption in transit and at rest, backup encryption, masking), and operations (patching, auditing, monitoring).`,
            r`SELECT user, host, plugin, authentication_string = '' AS empty_pw FROM mysql.user WHERE user = '' OR host = '%' OR authentication_string = '';
SELECT @@require_secure_transport, @@local_infile, @@bind_address, @@skip_name_resolve;

-- OUTPUT: (a clean server)
-- (no rows)
-- @@require_secure_transport | @@local_infile | @@bind_address | @@skip_name_resolve
-- 1                          | 0              | 10.0.1.5       | 1`],
        [`Controls in MySQL: <code>require_secure_transport</code>, TLS versions, account-level <code>REQUIRE SSL</code>, password policy components (validate_password), password expiry and lockout, <code>local_infile=OFF</code>, <code>secure_file_priv</code>, InnoDB tablespace encryption with a keyring, binary log and redo encryption, audit log plugin, and no direct <code>FILE</code> privilege for applications.`,
            r`ALTER TABLE customers ENCRYPTION = 'Y';
SET PERSIST binlog_encryption = ON;
SET PERSIST innodb_redo_log_encrypt = ON;
INSTALL COMPONENT 'file://component_validate_password';
SET PERSIST validate_password.policy = 'STRONG';

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: exposing port 3306 to the internet, shared root credentials, plain-text connections inside "trusted" networks, secrets in source control, unpatched servers, and encryption at rest without key management. Patch regularly and manage keys properly.`,
            r`# firewall: only the application subnet
ufw allow from 10.0.1.0/24 to any port 3306 proto tcp
ufw deny 3306
SELECT VERSION();

-- OUTPUT:
-- 8.0.36            (check against the vendor's security advisories monthly)`],
        [`Security features have costs: TLS adds CPU for handshakes (pools hide this), encryption at rest adds a small overhead, auditing adds I/O. Measure on your workload, and filter audit rules to what you need.`,
            r`SHOW GLOBAL STATUS LIKE 'Ssl_accepts';
SELECT user, ssl_type FROM mysql.user WHERE user LIKE 'shop_%';

-- OUTPUT: (example)
-- Ssl_accepts | 9120344
-- user       | ssl_type
-- shop_app   | ANY`],
        [`Real-world audit routine: list high-risk accounts and privileges, accounts without TLS, recent privilege changes, and failed logins; compare with a baseline stored in version control.`,
            r`SELECT user, host FROM mysql.user WHERE Super_priv = 'Y' OR Grant_priv = 'Y' OR File_priv = 'Y';
SELECT grantee, privilege_type FROM information_schema.user_privileges WHERE privilege_type IN ('SUPER','FILE','PROCESS','SHUTDOWN');
SHOW GLOBAL STATUS LIKE 'Aborted_connects';

-- OUTPUT:
-- user | host
-- root | localhost`]
    ),

    'Schema Migration & Zero-Downtime Migrations': dv(
        [`Zero-downtime migration changes the schema while the application keeps serving requests. The principle is compatibility: at every moment the database schema must work with both the old and the new application version, so you split a change into small steps that are each backward compatible (expand, migrate, contract).`,
            r`-- step 1 (expand): additive, compatible with old code
ALTER TABLE users ADD COLUMN full_name VARCHAR(120) NULL, ALGORITHM=INSTANT;
-- step 2: deploy code that writes both columns
-- step 3: backfill in batches
UPDATE users SET full_name = name WHERE full_name IS NULL AND id BETWEEN 1 AND 10000;
-- step 4: switch reads; step 5 (contract, later release): ALTER TABLE users DROP COLUMN name;

-- OUTPUT:
-- Query OK, 10000 rows affected`],
        [`Tools: MySQL online DDL (<code>ALGORITHM=INSTANT</code>, <code>INPLACE</code>, <code>LOCK=NONE</code>), <code>gh-ost</code> and <code>pt-online-schema-change</code> for operations that rebuild the table, migration frameworks (Flyway, Liquibase), feature flags to decouple deploy from switch, and shadow writes or dual reads to verify.`,
            r`ALTER TABLE orders ADD INDEX idx_channel (channel), ALGORITHM=INPLACE, LOCK=NONE;
gh-ost --host=db --user=ghost --password=*** --database=shop --table=orders --alter="MODIFY total DECIMAL(14,2) NOT NULL" --max-lag-millis=1500 --chunk-size=1000 --execute

-- OUTPUT:
-- Copy: 41000000/41000000 100.0%; Backlog: 0/1000; Time: 41m12s`],
        [`Mistakes: a plain ALTER that rebuilds a 500 GB table and blocks writes, a long transaction holding a metadata lock that queues all queries behind the ALTER, renaming a column in place while old code still reads the old name, and no tested rollback. Set <code>lock_wait_timeout</code> and check open transactions first.`,
            r`SELECT trx_id, trx_started, trx_query FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 3;
SET SESSION lock_wait_timeout = 5;
ALTER TABLE orders ADD COLUMN note VARCHAR(100) NULL, ALGORITHM=INPLACE, LOCK=NONE;

-- OUTPUT:
-- Query OK, 0 rows affected   (or ERROR 1205 immediately if a metadata lock cannot be obtained)`],
        [`Control load and lag: throttle backfills and online copies on replica lag and server load, run in off-peak windows, and verify equality (counts, checksums) before switching. Online DDL still needs temporary space and a log of concurrent changes.`,
            r`SHOW REPLICA STATUS\G
-- Seconds_Behind_Source: 1   (continue)    ... 12 (pause the backfill)
SELECT COUNT(*) AS mismatches FROM users WHERE name <> full_name OR (name IS NULL) <> (full_name IS NULL);

-- OUTPUT:
-- mismatches
-- 0`],
        [`Real-world data type change: widen an INT primary key to BIGINT on a huge table with gh-ost, with foreign keys migrated in lockstep and a rehearsal on a production-sized clone to estimate the duration.`,
            r`SELECT table_name, auto_increment, ROUND(auto_increment / 2147483647 * 100, 1) AS pct_of_int_max FROM information_schema.tables WHERE table_name = 'events';
gh-ost --database=shop --table=events --alter="MODIFY id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT" --execute

-- OUTPUT:
-- table_name | auto_increment | pct_of_int_max
-- events     |     1612004113 | 75.1`]
    ),

    'Deployment & Scaling Strategies': dv(
        [`Scaling follows a ladder from cheap to complex: fix queries and indexes, cache hot reads, add read replicas, partition and archive data, scale the primary up (CPU, RAM, faster storage), and finally shard. Each step buys capacity at a cost in complexity; take the next step only when measurements show the current one is exhausted.`,
            r`SELECT step, action FROM ops.scaling_playbook ORDER BY step;

-- OUTPUT:
-- step | action
-- 1    | Fix the top 10 queries by total time (indexes, rewrites)
-- 2    | Add a cache (Redis) for hot reads
-- 3    | Add read replicas behind Router or ProxySQL
-- 4    | Partition and archive old data
-- 5    | Scale up the primary
-- 6    | Shard by tenant or user id`],
        [`Deployment options: self-managed on VMs or bare metal with Ansible, containers on Kubernetes with an operator (MySQL Operator for Kubernetes, Percona Operator), and managed services (RDS, Aurora, Cloud SQL) with automated backups, patching and failover. Pick by team skills, control needs and compliance.`,
            r`apiVersion: mysql.oracle.com/v2
kind: InnoDBCluster
metadata: { name: prod }
spec: { instances: 3, router: { instances: 2 }, secretName: mysql-root, tlsUseSelfSigned: false }

-- OUTPUT:
-- innodbcluster/prod created  (3 members ONLINE, 2 routers)`],
        [`Mistakes: sharding too early (cross-shard queries and transactions, resharding pain), scaling reads when writes are the bottleneck, ignoring connection limits when adding app instances, stateful pods without proper storage and anti-affinity, and upgrades without rehearsal.`,
            r`SELECT 12 AS app_instances, 20 AS pool_each, 12 * 20 AS connections, @@max_connections AS max_connections;
SHOW GLOBAL STATUS LIKE 'Threads_running';

-- OUTPUT:
-- app_instances | pool_each | connections | max_connections
--            12 |        20 |         240 |             300`],
        [`Sharding needs a shard key with high cardinality that appears in most queries (tenant id, user id), a routing layer (application or Vitess), global id generation, and a plan for cross-shard operations and resharding. Test hot-key skew before committing to a key.`,
            r`SELECT CRC32('tenant-42') % 8 AS shard;
SELECT tenant_id, COUNT(*) AS rows_n FROM orders GROUP BY tenant_id ORDER BY rows_n DESC LIMIT 3;

-- OUTPUT:
-- shard
-- 2
-- tenant_id | rows_n
-- 17        | 8120344          (one huge tenant: a poor shard key if it cannot be split)`],
        [`Real-world rolling upgrade with minimal downtime: upgrade replicas one at a time, verify, switch the primary to an upgraded replica, upgrade the old primary and rejoin it, with backups and a rollback path at each step.`,
            r`util.checkForServerUpgrade('root@db2:3306', {targetVersion: '8.4.0'});
var c = dba.getCluster('prod'); c.setPrimaryInstance('db2:3306');       -- after db2 is upgraded
c.status();

-- OUTPUT:
-- Primary switched to db2:3306 in 4 seconds; cluster status OK`]
    )
};
