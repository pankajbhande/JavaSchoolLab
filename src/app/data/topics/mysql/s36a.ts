// Module 36 (Replication): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s36a: Record<string, DeepDive> = {
    'Source/Replica Architecture': dd(
        [`In MySQL replication a <b>source</b> (formerly master) accepts writes and records them in its binary log; one or more <b>replicas</b> copy that log into a <b>relay log</b> and apply it, keeping their data in step. Two replica threads do the work: the I/O thread fetches, the SQL (applier) thread executes.`,
            r`# my.cnf on the SOURCE
# [mysqld]
# server-id = 1
# log_bin   = binlog
# gtid_mode = ON
# enforce_gtid_consistency = ON
# my.cnf on the REPLICA
# [mysqld]
# server-id = 2          # must be unique in the topology
# relay_log = relay
# read_only = ON
# super_read_only = ON   # block even privileged users from writing

-- On the source, create the replication account:
CREATE USER 'repl'@'%' IDENTIFIED BY 'S3cret!pw';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected (0.01 sec)`],
        [`One server cannot scale reads forever and is a single point of failure. A replica gives read capacity, a safe place to run backups and reports, and a standby copy for failover.`,
            r`-- On the replica: connect and start (GTID auto-positioning)
CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = 'db1', SOURCE_PORT = 3306,
    SOURCE_USER = 'repl', SOURCE_PASSWORD = 'S3cret!pw',
    SOURCE_AUTO_POSITION = 1, SOURCE_SSL = 1;
START REPLICA;
SHOW REPLICA STATUS\G

-- OUTPUT (example, abridged):
--      Replica_IO_Running: Yes
--     Replica_SQL_Running: Yes
--  Seconds_Behind_Source: 0`],
        [`Typical topologies: one source with N read replicas behind a load balancer, a chain (replica of a replica) for cross-region, a delayed replica as an undo button, and multi-source replicas that merge shards for analytics.`,
            r`-- Delayed replica: apply changes 1 hour late, so a bad DELETE can be stopped in time
STOP REPLICA;
CHANGE REPLICATION SOURCE TO SOURCE_DELAY = 3600;
START REPLICA;

-- Verify the replication topology as seen from the source:
SHOW REPLICAS;

-- OUTPUT (example):
-- +-----------+--------+------+-----------+--------------------------------------+
-- | Server_Id | Host   | Port | Source_Id | Replica_UUID                         |
-- +-----------+--------+------+-----------+--------------------------------------+
-- |         2 | db2    | 3306 |         1 | 3e11fa47-71ca-11e1-9e33-c80aa9429562 |
-- +-----------+--------+------+-----------+--------------------------------------+`],
        [`<b>Advantages:</b> read scaling, built in, low overhead, geographic distribution, backup offloading, and a warm standby.`,
            r`-- Backups from a replica leave the source untouched
STOP REPLICA SQL_THREAD;                 -- freeze applying, keep fetching
-- ... take mysqldump / snapshot here ...
START REPLICA SQL_THREAD;

-- OUTPUT:
-- Query OK, 0 rows affected (0.00 sec)`],
        [`<b>Disadvantages:</b> replicas lag, writes do not scale (every replica applies every write), schema changes and large transactions delay replicas, and applications must handle read-after-write staleness.`,
            r`-- Write on the source, read immediately on the replica: may be missing!
-- source:  INSERT INTO orders (id, total) VALUES (501, 20);
-- replica: SELECT * FROM orders WHERE id = 501;

-- OUTPUT (example, replica a few ms behind):
-- Empty set (0.00 sec)`],
        [`<b>Limitations:</b> a single source for writes (no built-in write scaling or conflict resolution), replicas must be same or newer version than the source, and writing directly to a replica causes divergence unless super_read_only is set.`,
            r`-- Accidental write on a replica with super_read_only=ON:
INSERT INTO orders (id, total) VALUES (999, 1);

-- OUTPUT:
-- ERROR 1290 (HY000): The MySQL server is running with the --super-read-only option so it cannot execute this statement`],
        `
   Clients (writes)                       Clients (reads)
        │                                   │       │
        ▼                                   ▼       ▼
   ┌─────────┐   binlog     ┌─ I/O thread ─► relay log ─► SQL threads ─┐
   │ SOURCE  │ ───────────► │             REPLICA 1                    │ data
   │ (R/W)   │   binlog     ├─ I/O thread ─► relay log ─► SQL threads ─┤
   └─────────┘ ───────────► │             REPLICA 2   (read_only)      │ data
                            └───────────────────────────────────────────┘
`,
        `Replication is for read scale and availability, not write scale; if writes are the limit, shard. Use GTID, row format, super_read_only on replicas, SSL for the channel, and a unique server_id plan. Keep replicas at least the source's hardware class: a weaker replica becomes permanently lagged.`
    ),

    'Asynchronous & Semi-Synchronous Replication': dd(
        [`In <b>asynchronous</b> replication the source commits and answers the client without waiting for any replica. In <b>semi-synchronous</b> replication the source waits until at least one replica acknowledges that it has received (written to its relay log) the transaction, before returning success.`,
            r`-- Install the plugins (8.0.26+ names; older: rpl_semi_sync_master / slave)
-- On SOURCE
INSTALL PLUGIN rpl_semi_sync_source SONAME 'semisync_source.so';
SET PERSIST rpl_semi_sync_source_enabled = 1;
SET PERSIST rpl_semi_sync_source_timeout = 1000;     -- ms before falling back to async
-- On REPLICA
INSTALL PLUGIN rpl_semi_sync_replica SONAME 'semisync_replica.so';
SET PERSIST rpl_semi_sync_replica_enabled = 1;
STOP REPLICA IO_THREAD; START REPLICA IO_THREAD;     -- reconnect so it registers as semi-sync

-- OUTPUT:
-- Query OK, 0 rows affected (0.01 sec)`],
        [`With plain async, if the source dies right after a commit, the replica may never have received it, so promoting that replica loses data. Semi-sync narrows that window: an acknowledged commit exists on at least two machines.`,
            r`-- Async data-loss window:
--  t0 client: COMMIT -> source says OK
--  t1 source crashes before sending the event
--  t2 replica promoted: the transaction is gone (RPO > 0)
-- Semi-sync (AFTER_SYNC): the source does not tell the client OK until a replica has the event
SHOW VARIABLES LIKE 'rpl_semi_sync_source_wait_point';

-- OUTPUT:
-- +--------------------------------------+------------+
-- | Variable_name                        | Value      |
-- +--------------------------------------+------------+
-- | rpl_semi_sync_source_wait_point      | AFTER_SYNC |
-- +--------------------------------------+------------+`],
        [`Real use: payment and order systems use semi-sync (or Group Replication) so that failover loses nothing; read-heavy content sites stay on async for lowest write latency.`,
            r`-- Is semi-sync actually active right now?
SHOW GLOBAL STATUS LIKE 'Rpl_semi_sync_source_status';
SHOW GLOBAL STATUS LIKE 'Rpl_semi_sync_source_yes_tx';     -- commits acknowledged by a replica
SHOW GLOBAL STATUS LIKE 'Rpl_semi_sync_source_no_tx';      -- commits that timed out to async

-- OUTPUT (example):
-- Rpl_semi_sync_source_status   ON
-- Rpl_semi_sync_source_yes_tx   1829934
-- Rpl_semi_sync_source_no_tx    0`],
        [`<b>Advantages:</b> async = fastest commits and no dependency on replicas; semi-sync = much lower data-loss risk, simple to adopt, uses existing replication.`,
            r`-- Choose how many replica acks are required (8.0.26+)
SET PERSIST rpl_semi_sync_source_wait_for_replica_count = 2;   -- ack from 2 replicas
-- AFTER_SYNC (lossless): waits before the commit is visible to other sessions

-- OUTPUT:
-- Query OK, 0 rows affected (0.00 sec)`],
        [`<b>Disadvantages:</b> async can lose acknowledged commits; semi-sync adds a network round trip to each commit, and after a timeout silently degrades to async, giving a false sense of safety.`,
            r`-- If the replica is down longer than rpl_semi_sync_source_timeout, source falls back:
-- Error log: Timeout waiting for reply of binlog (file: binlog.000042, pos: 158732),
--            semi-sync up to file binlog.000042, position 158700.
-- Alert on the status flag:
SHOW GLOBAL STATUS LIKE 'Rpl_semi_sync_source_status';

-- OUTPUT (example):
-- Rpl_semi_sync_source_status   OFF      <- running in async mode now`],
        [`<b>Limitations:</b> semi-sync only guarantees the event was <i>received</i> (relay log), not applied, so replicas can still lag; it does not give automatic failover or consensus; it is not a substitute for Group Replication when zero data loss is mandatory.`,
            r`-- Received vs applied are different counters:
SELECT CHANNEL_NAME, SERVICE_STATE FROM performance_schema.replication_connection_status;
SELECT CHANNEL_NAME, SERVICE_STATE FROM performance_schema.replication_applier_status;

-- OUTPUT (example):
-- +--------------+---------------+
-- | CHANNEL_NAME | SERVICE_STATE |
-- +--------------+---------------+
-- |              | ON            |
-- +--------------+---------------+`],
        `
   ASYNC                              SEMI-SYNC (AFTER_SYNC)
   client ─COMMIT─► SOURCE            client ─COMMIT─► SOURCE ─binlog─► REPLICA
   client ◄──OK──── SOURCE                              SOURCE ◄──ACK─── (relay log written)
          (replica gets it later)     client ◄──OK─────
`,
        `Use semi-sync when RPO must be near zero but you want familiar source/replica operations; set the timeout and monitor the fallback flag as a first-class alert. If you need guaranteed consistency and automatic membership, move to Group Replication / InnoDB Cluster.`
    ),

    'Replication Lag': dd(
        [`<b>Replication lag</b> is the delay between a change committing on the source and being applied on a replica. It appears as <code>Seconds_Behind_Source</code> and is caused by slow network, a slow applier, or large transactions.`,
            r`-- Quick lag reading on the replica
SHOW REPLICA STATUS\G
-- OUTPUT (example, abridged):
--    Seconds_Behind_Source: 37
--   Replica_SQL_Running_State: Waiting for dependent transaction to commit`],
        [`Lag makes read replicas return stale data and extends failover time (the replica must finish applying before promotion). Knowing the cause tells you whether to fix network, schema, queries or hardware.`,
            r`-- Precise lag in 8.0: compare original commit time with apply time per worker
SELECT WORKER_ID, LAST_APPLIED_TRANSACTION,
       TIMESTAMPDIFF(SECOND, LAST_APPLIED_TRANSACTION_ORIGINAL_COMMIT_TIMESTAMP,
                             LAST_APPLIED_TRANSACTION_END_APPLY_TIMESTAMP) AS lag_s
FROM performance_schema.replication_applier_status_by_worker;

-- OUTPUT (example):
-- +-----------+---------------------------------------------+-------+
-- | WORKER_ID | LAST_APPLIED_TRANSACTION                    | lag_s |
-- +-----------+---------------------------------------------+-------+
-- |         1 | 3e11fa47-71ca-11e1-9e33-c80aa9429562:15234  |     2 |
-- +-----------+---------------------------------------------+-------+`],
        [`Common real causes: one huge UPDATE/DELETE, DDL like ALTER TABLE, tables without primary keys, a weaker replica, a long-running read on the replica blocking the applier, and single-threaded applying.`,
            r`-- Enable parallel applier (8.0): many workers, ordered by commit dependencies
STOP REPLICA;
SET PERSIST replica_parallel_type = 'LOGICAL_CLOCK';
SET PERSIST replica_parallel_workers = 8;
SET PERSIST replica_preserve_commit_order = ON;     -- keep source commit order visible
START REPLICA;

-- OUTPUT:
-- Query OK, 0 rows affected (0.00 sec)`],
        [`<b>Advantages of measuring and managing it:</b> you can route reads by freshness, alert before users notice, and pick the correct fix (parallelism, batching, schema) instead of guessing.`,
            r`-- App-side freshness check: wait for a specific GTID before reading from the replica
SELECT WAIT_FOR_EXECUTED_GTID_SET('3e11fa47-71ca-11e1-9e33-c80aa9429562:15234', 1);   -- timeout 1 s

-- OUTPUT:
-- +---------------------------------------------------------------------------+
-- | WAIT_FOR_EXECUTED_GTID_SET('3e11fa47-71ca-11e1-9e33-c80aa9429562:15234',1) |
-- +---------------------------------------------------------------------------+
-- |                                                                         0 |   -- 0 = applied
-- +---------------------------------------------------------------------------+`],
        [`<b>Disadvantages / traps:</b> Seconds_Behind_Source is only approximate (it is 0 when idle or NULL when stopped, and can jump), and big transactions make lag appear in sudden spikes.`,
            r`-- A 5-million-row delete runs for minutes on the source and again on the replica:
DELETE FROM events WHERE created_at < '2024-01-01';
-- Fix: batch it so each transaction is small
DELETE FROM events WHERE created_at < '2024-01-01' LIMIT 10000;   -- repeat in a loop with a short sleep

-- OUTPUT (example):
-- Query OK, 10000 rows affected (0.15 sec)`],
        [`<b>Limitations:</b> zero lag cannot be guaranteed with asynchronous replication; parallel workers help only if transactions are independent; heartbeat (pt-heartbeat) is needed for accurate measurement across chains.`,
            r`-- Heartbeat table pattern (what pt-heartbeat does): source writes now() every second
CREATE TABLE ops.heartbeat (id INT PRIMARY KEY, ts TIMESTAMP(6) NOT NULL);
REPLACE INTO ops.heartbeat VALUES (1, NOW(6));      -- run on source every second
-- On replica, true lag is:
SELECT TIMESTAMPDIFF(MICROSECOND, ts, NOW(6))/1000 AS lag_ms FROM ops.heartbeat WHERE id = 1;

-- OUTPUT (example):
-- +--------+
-- | lag_ms |
-- +--------+
-- | 1043.7 |
-- +--------+`],
        `
   SOURCE commit ─► binlog ─► network ─► relay log ─► apply ─► visible
        t0                      +d1        +d2         +d3
   Lag = t(visible on replica) - t0 = d1 + d2 + d3
   d1 network | d2 I/O + disk | d3 applier (single thread? big txn? no PK?)
`,
        `Design applications to tolerate staleness: read-your-writes through the source or GTID wait, and route only freshness-insensitive queries to replicas. Fix lag at the root with small transactions, primary keys, parallel replication, and capacity parity; alert on lag with a heartbeat, not on Seconds_Behind_Source alone.`
    ),

    'Read Replicas & Failover': dd(
        [`A <b>read replica</b> serves SELECT traffic so the source can focus on writes. <b>Failover</b> is promoting a replica to become the new source when the old one fails and re-pointing the other replicas and applications.`,
            r`-- Application-level read/write split (pseudocode against two hostnames)
--   writes  -> db-primary.example.com:3306
--   reads   -> db-replica.example.com:3306   (DNS or proxy balances many replicas)
-- Verify which role a connection landed on:
SELECT @@hostname AS host, @@read_only AS ro, @@super_read_only AS sro;

-- OUTPUT (example):
-- +--------+----+-----+
-- | host   | ro | sro |
-- +--------+----+-----+
-- | db2    |  1 |   1 |
-- +--------+----+-----+`],
        [`Read traffic is often 80-95% of load, and a failed source must be replaced quickly. Replicas solve both if there is a rehearsed promotion procedure.`,
            r`-- Manual failover with GTID (on the chosen replica db2):
STOP REPLICA;
RESET REPLICA ALL;                         -- forget old source
SET PERSIST super_read_only = OFF;
SET PERSIST read_only       = OFF;         -- now accepts writes

-- On the other replica db3: follow the new source, GTID finds the position itself
STOP REPLICA;
CHANGE REPLICATION SOURCE TO SOURCE_HOST='db2', SOURCE_AUTO_POSITION=1;
START REPLICA;

-- OUTPUT:
-- Query OK, 0 rows affected (0.02 sec)`],
        [`Real systems: ProxySQL or MySQL Router splits reads and writes, Orchestrator or cloud managers detect failure and promote, and cloud read replicas (RDS, Cloud SQL) are provisioned with a click.`,
            r`-- ProxySQL rules (admin interface): send SELECTs to hostgroup 20 (replicas), the rest to 10 (source)
INSERT INTO mysql_query_rules (rule_id, active, match_digest, destination_hostgroup, apply)
VALUES (1, 1, '^SELECT .* FOR UPDATE', 10, 1),
       (2, 1, '^SELECT',               20, 1);
LOAD MYSQL QUERY RULES TO RUNTIME;  SAVE MYSQL QUERY RULES TO DISK;

-- OUTPUT:
-- Query OK, 2 rows affected (0.00 sec)`],
        [`<b>Advantages:</b> horizontal read scale, isolation of reporting load, and a ready standby so recovery takes seconds to minutes instead of hours.`,
            r`-- Pick the most up-to-date replica to promote: compare executed GTID sets
SELECT @@GLOBAL.gtid_executed;      -- run on each replica; choose the superset
SELECT GTID_SUBSET('uuid:1-1500', 'uuid:1-1523') AS is_behind;   -- 1 = first set contained in second

-- OUTPUT (example):
-- +-----------+
-- | is_behind |
-- +-----------+
-- |         1 |
-- +-----------+`],
        [`<b>Disadvantages:</b> failover is risky (split brain if the old source comes back writable), applications see stale reads, connection routing must be updated, and unreplicated transactions may be lost on async.`,
            r`-- Split-brain guard: fence the old primary before promoting
-- (OS level)   systemctl stop mysqld   or remove its VIP / security-group access
-- If it ever comes back, force it read-only immediately:
SET GLOBAL super_read_only = ON;
SET GLOBAL read_only = ON;

-- OUTPUT:
-- Query OK, 0 rows affected (0.00 sec)`],
        [`<b>Limitations:</b> plain replication gives no automatic promotion or quorum; reads from replicas are eventually consistent; and multi-primary writes across replicas need Group Replication or application sharding.`,
            r`-- Detect a broken replica before sending it traffic:
SHOW REPLICA STATUS\G
-- Only route when ALL of these are true:
--   Replica_IO_Running = Yes, Replica_SQL_Running = Yes, Seconds_Behind_Source below your threshold

-- OUTPUT (example):
-- Replica_IO_Running: Yes   Replica_SQL_Running: Yes   Seconds_Behind_Source: 0`],
        `
                 ┌── writes ──► SOURCE (db1) ──binlog──┐
   App ─► Proxy ─┤                                     ├─► REPLICA db2  ◄─ reads
                 └── reads  ──────────────────────────► REPLICA db3  ◄─ reads
   db1 fails ─► fence db1 ─► promote most-advanced replica ─► repoint db3 + proxy
`,
        `Automate failover with a tested tool (Orchestrator, MySQL InnoDB Cluster, or your cloud's managed failover) and always fence the old primary. Design reads with explicit staleness tolerance, avoid sending read-after-write paths to replicas, and rehearse failover quarterly with real traffic in staging.`
    ),

    'GTID': dd(
        [`A <b>GTID</b> (Global Transaction Identifier) is a unique id <code>source_uuid:sequence</code> assigned to every committed transaction. Replicas track which GTIDs they have executed, so they can pick up exactly where they left off without file names or positions.`,
            r`-- Enable GTID (my.cnf or SET PERSIST on a quiesced server, in this order for online change)
-- gtid_mode = ON ; enforce_gtid_consistency = ON
SELECT @@GLOBAL.gtid_mode, @@GLOBAL.enforce_gtid_consistency;
SELECT @@GLOBAL.gtid_executed;

-- OUTPUT (example):
-- +--------------------+-----------------------------------+
-- | @@GLOBAL.gtid_mode | @@GLOBAL.enforce_gtid_consistency |
-- +--------------------+-----------------------------------+
-- | ON                 | ON                                |
-- +--------------------+-----------------------------------+
-- 3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1523`],
        [`File and position coordinates differ on every server, which makes failover and re-pointing error-prone. GTIDs are the same everywhere: a replica simply says "I have these, send the rest".`,
            r`-- Old way: must know the exact file and position on the new source
-- CHANGE REPLICATION SOURCE TO SOURCE_LOG_FILE='binlog.000042', SOURCE_LOG_POS=158732;
-- GTID way: nothing to look up
CHANGE REPLICATION SOURCE TO SOURCE_HOST = 'db2', SOURCE_AUTO_POSITION = 1;
START REPLICA;

-- OUTPUT:
-- Query OK, 0 rows affected (0.03 sec)`],
        [`Real use: automated failover tools rely on GTIDs, backups store the gtid_executed set so a restored node can join, and operators skip a poison transaction by committing an empty one with that GTID.`,
            r`-- A replica stops on a duplicate-key error for GTID  uuid:1524. Skip it safely:
STOP REPLICA;
SET GTID_NEXT = '3e11fa47-71ca-11e1-9e33-c80aa9429562:1524';
BEGIN; COMMIT;                              -- empty transaction consumes that GTID
SET GTID_NEXT = 'AUTOMATIC';
START REPLICA;

-- OUTPUT:
-- Query OK, 0 rows affected (0.00 sec)`],
        [`<b>Advantages:</b> trivial re-pointing, safe failover, easy to prove that a replica has (or lacks) a transaction, auto-skip of already executed transactions, and required by Group Replication and InnoDB Cluster.`,
            r`-- Compare sets to see exactly what a replica is missing
SELECT GTID_SUBTRACT('3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1530',
                     '3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1523') AS missing;

-- OUTPUT:
-- +---------------------------------------------+
-- | missing                                     |
-- +---------------------------------------------+
-- | 3e11fa47-71ca-11e1-9e33-c80aa9429562:1524-1530 |
-- +---------------------------------------------+`],
        [`<b>Disadvantages:</b> enabling requires planning, some statements are forbidden (CREATE TABLE ... SELECT in older versions, mixing transactional and non-transactional tables in one transaction), and errant GTIDs on a replica are hard to explain at first.`,
            r`-- Errant transaction: a write made directly on a replica gets its own UUID
-- On replica:  gtid_executed = srcUUID:1-1523, replicaUUID:1
-- If this replica is promoted, the extra replicaUUID:1 spreads confusion. Detect it:
SELECT GTID_SUBTRACT(@@GLOBAL.gtid_executed, '3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1523') AS errant;

-- OUTPUT (example):
-- +--------------------------------------+
-- | errant                               |
-- +--------------------------------------+
-- | 9b2c1a10-0000-11ee-aaaa-0242ac110003:1 |
-- +--------------------------------------+`],
        [`<b>Limitations:</b> gtid_purged must cover logs that no longer exist; a replica can only auto-position if the source still has the binlogs it needs; and you cannot turn GTID mode off while GTID transactions are still being applied.`,
            r`-- After restoring a backup, tell the server which GTIDs the backup already contains
RESET MASTER;                                    -- 8.4: RESET BINARY LOGS AND GTIDS
SET @@GLOBAL.gtid_purged = '3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1523';
START REPLICA;

-- OUTPUT:
-- Query OK, 0 rows affected (0.01 sec)`],
        `
   SOURCE uuid=3e11...                        REPLICA
   tx1 = 3e11:1   ─┐                          gtid_executed = 3e11:1-3
   tx2 = 3e11:2    ├─ binlog ─────────────►   "send me everything not in 3e11:1-3"
   tx3 = 3e11:3   ─┤                          source sends 3e11:4, 3e11:5 ...
   tx4 = 3e11:4   ─┘
`,
        `Standardize on GTID with enforce_gtid_consistency for any topology you intend to fail over. Store gtid_executed with each backup, never write on replicas (super_read_only), and monitor for errant GTIDs because they block clean promotion.`
    ),

    'Replication Monitoring': dd(
        [`Monitoring replication means regularly checking that threads run, lag is low, data matches, and errors are caught. The main sources are SHOW REPLICA STATUS and the performance_schema replication tables.`,
            r`-- Thread health, in a query-friendly form
SELECT c.CHANNEL_NAME, c.SERVICE_STATE AS io_state, a.SERVICE_STATE AS sql_state,
       c.LAST_ERROR_MESSAGE AS io_err
FROM   performance_schema.replication_connection_status c
JOIN   performance_schema.replication_applier_status    a USING (CHANNEL_NAME);

-- OUTPUT (example):
-- +--------------+----------+-----------+--------+
-- | CHANNEL_NAME | io_state | sql_state | io_err |
-- +--------------+----------+-----------+--------+
-- |              | ON       | ON        |        |
-- +--------------+----------+-----------+--------+`],
        [`Replication fails silently: a stopped thread or a drifted row may be noticed only when a failover goes wrong. Monitoring turns hidden risk into alerts.`,
            r`-- The fields that matter in SHOW REPLICA STATUS\G
--   Replica_IO_Running / Replica_SQL_Running   (both must be Yes)
--   Seconds_Behind_Source                      (lag)
--   Last_IO_Error / Last_SQL_Error             (cause of a stop)
--   Retrieved_Gtid_Set vs Executed_Gtid_Set    (fetched vs applied)
SHOW REPLICA STATUS\G

-- OUTPUT (example, a broken replica):
--   Replica_SQL_Running: No
--   Last_SQL_Errno: 1062
--   Last_SQL_Error: Could not execute Write_rows event on table shop.orders; Duplicate entry '501' for key 'PRIMARY'`],
        [`Real setups: Prometheus mysqld_exporter plus Grafana, PMM, cloud metrics; an alert if lag above 30 s for 5 minutes, any thread down, or a replica missing from SHOW REPLICAS.`,
            r`-- Source-side view: which replicas are connected and how far they have read?
SELECT * FROM performance_schema.replication_group_members;   -- group replication only
SHOW REPLICAS;
SHOW PROCESSLIST;     -- look for "Binlog Dump GTID" threads, one per replica

-- OUTPUT (example):
-- | 12 | repl | db2:51822 | NULL | Binlog Dump GTID | 80233 | Source has sent all binlog to replica; waiting for more updates | NULL |`],
        [`<b>Advantages:</b> early detection, data for capacity planning, evidence for post-mortems, and safe automation of failover decisions.`,
            r`-- Detect data drift between source and replica: checksum a table on both and compare
-- (pt-table-checksum does this safely in chunks). Manual spot check:
CHECKSUM TABLE shop.orders;

-- OUTPUT (example, run on source then replica; values must be equal):
-- +-------------+------------+
-- | Table       | Checksum   |
-- +-------------+------------+
-- | shop.orders | 2381732011 |
-- +-------------+------------+`],
        [`<b>Disadvantages:</b> monitoring adds queries and tooling to maintain; naive checks (lag only) miss stopped threads; checksums load the server on big tables.`,
            r`-- Naive trap: Seconds_Behind_Source is NULL when the SQL thread is stopped, not "0".
-- Alert logic must treat NULL as critical:
SELECT IF(Seconds_Behind_Source IS NULL, 'CRITICAL', 'ok') AS state;   -- conceptual; read from status output

-- OUTPUT (example):
-- state: CRITICAL`],
        [`<b>Limitations:</b> status values are point-in-time and approximate; performance_schema must be enabled (default) and has little history; row-level drift needs extra tools; cross-region links add measurement noise.`,
            r`-- Keep history yourself: persist a sample every minute
CREATE TABLE ops.repl_samples (ts DATETIME PRIMARY KEY, lag_s INT, io VARCHAR(3), sql_thr VARCHAR(3));
-- cron job (shell) inserts a row from SHOW REPLICA STATUS output.
SELECT MAX(lag_s) AS worst_lag_last_hour FROM ops.repl_samples WHERE ts > NOW() - INTERVAL 1 HOUR;

-- OUTPUT (example):
-- +---------------------+
-- | worst_lag_last_hour |
-- +---------------------+
-- |                  12 |
-- +---------------------+`],
        `
   REPLICA ──► SHOW REPLICA STATUS / performance_schema
                    │ (scrape every 15 s)
                    ▼
              exporter ─► Prometheus ─► Grafana dashboards
                                   └──► Alertmanager ─► page: IO/SQL down, lag, errant GTID
   Periodic:  pt-table-checksum  ► detect silent data drift
`,
        `Alert on symptoms (threads down, lag above SLO, errors) and on risk (errant GTIDs, binlog retention shorter than worst outage, semi-sync fallback). Schedule checksum jobs for drift, and review the monitoring itself after every incident.`
    ),
};
