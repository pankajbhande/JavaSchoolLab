// Module 37 (High Availability), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s37k: Record<string, DeepDive> = {
    'Failover & Automatic Failover': dd(
        [`<b>Failover</b> is moving the write role from a failed primary to a healthy replica so the application keeps working. <b>Manual</b> failover is a human promoting a replica; <b>automatic</b> failover means a controller (InnoDB Cluster, Orchestrator, a cloud service) detects the failure and promotes for you.`,
            r`-- On the replica, check that it has caught up before promoting it
SHOW REPLICA STATUS\G
-- Key fields to read:
--   Replica_IO_Running / Replica_SQL_Running : both must be Yes
--   Seconds_Behind_Source                    : lag in seconds
--   Retrieved_Gtid_Set vs Executed_Gtid_Set  : what is received vs applied

-- OUTPUT (example, trimmed):
-- Replica_IO_Running: Yes
-- Replica_SQL_Running: Yes
-- Seconds_Behind_Source: 0
-- Retrieved_Gtid_Set: 3E11FA47-71CA-11E1-9E33-C80AA9429562:1-5002
-- Executed_Gtid_Set:  3E11FA47-71CA-11E1-9E33-C80AA9429562:1-5002`],
        [`A single primary is a single point of failure. Without failover, a crashed server means downtime until someone restores a backup. Automatic failover shrinks that outage from hours to seconds.`,
            r`-- Manual promotion of a replica after the primary is lost
STOP REPLICA;                                  -- stop applying from the dead source
RESET REPLICA ALL;                             -- forget the old source configuration
SET GLOBAL super_read_only = OFF;              -- allow writes on the new primary
SET GLOBAL read_only = OFF;
SELECT @@global.read_only AS ro, @@global.super_read_only AS sro;

-- OUTPUT:
-- +----+-----+
-- | ro | sro |
-- +----+-----+
-- |  0 |   0 |
-- +----+-----+`],
        [`In production an orchestrator watches heartbeats, picks the replica with the most complete GTID set, promotes it, and repoints the other replicas and the application endpoint (proxy, VIP or DNS).`,
            r`-- Repoint a surviving replica to the new primary using GTID auto-positioning
STOP REPLICA;
CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = 'db2.internal',
    SOURCE_USER = 'repl',
    SOURCE_PASSWORD = 'secret',
    SOURCE_AUTO_POSITION = 1;                  -- GTIDs: no binlog file/offset needed
START REPLICA;
SHOW REPLICA STATUS\G

-- OUTPUT (example, trimmed):
-- Source_Host: db2.internal
-- Auto_Position: 1
-- Replica_IO_Running: Yes
-- Replica_SQL_Running: Yes`],
        [`<b>Advantages:</b> short outage, no human at 3 a.m., consistent runbook. With GTIDs, any replica can follow any new primary without hunting for binlog coordinates.`,
            r`-- GTID mode is what makes repointing painless; verify it is on
SELECT @@gtid_mode AS gtid_mode, @@enforce_gtid_consistency AS enforce;

-- OUTPUT:
-- +-----------+---------+
-- | gtid_mode | enforce |
-- +-----------+---------+
-- | ON        | ON      |
-- +-----------+---------+`],
        [`<b>Disadvantages:</b> with asynchronous replication the new primary may be missing the last committed transactions (data loss), and a false positive (network blip) can cause a needless failover or split brain, where two servers accept writes.`,
            r`-- Transactions committed on the old primary but never shipped are lost on promotion.
-- Compare GTID sets to see what the new primary is missing:
SELECT GTID_SUBTRACT('3E11FA47-71CA-11E1-9E33-C80AA9429562:1-5010',
                     '3E11FA47-71CA-11E1-9E33-C80AA9429562:1-5002') AS lost_gtids;

-- OUTPUT:
-- +----------------------------------------------+
-- | lost_gtids                                   |
-- +----------------------------------------------+
-- | 3E11FA47-71CA-11E1-9E33-C80AA9429562:5003-5010 |
-- +----------------------------------------------+`],
        [`<b>Limitations:</b> failover does not fix applications that cache connections or DNS; clients must reconnect, and in-flight transactions are rolled back. Plain MySQL never fails over by itself; you need tooling.`,
            r`-- An application talking to a dead primary sees errors until it reconnects
SELECT 1;

-- OUTPUT:
-- ERROR 2013 (HY000): Lost connection to MySQL server during query
-- (client must reconnect to the new primary endpoint and retry the transaction)`],
        `
   Before                              After failover
   ┌─────────┐  async   ┌─────────┐      ┌─────────┐ X        ┌─────────┐
   │ PRIMARY │ ───────► │ REPLICA │      │ old PRI │          │ NEW PRI │ (promoted)
   └────▲────┘          └─────────┘      └─────────┘          └────▲────┘
        │ writes                                                   │ writes
     [ App ]                                                    [ App ] via proxy / DNS
   Orchestrator: detect (heartbeat) -> elect (most GTIDs) -> promote -> repoint -> fence old
`,
        `Automatic failover is a trade between availability and the risk of split brain, so always fence the old primary (read_only, STONITH, remove from the proxy). Pair it with semi-synchronous replication or Group Replication if losing the last few transactions is unacceptable, and rehearse failover regularly.`
    ),

    'RPO & RTO': dd(
        [`<b>RPO</b> (Recovery Point Objective) is how much data you can afford to lose, measured in time. <b>RTO</b> (Recovery Time Objective) is how long you can afford to be down. They are business targets that drive technical design.`,
            r`-- RPO in practice: how far behind is the replica right now?
SHOW REPLICA STATUS\G
-- Seconds_Behind_Source is an approximate lower bound of the data you could lose on async failover

-- OUTPUT (example, trimmed):
-- Seconds_Behind_Source: 3
-- => with async replication, RPO right now is roughly 3 seconds of writes`],
        [`Without agreed numbers, teams over-spend (zero loss for a blog) or under-protect (daily backup for payments). RPO and RTO turn vague wishes into a cost-justified architecture.`,
            r`-- Backup-only strategy: RPO = time since last backup + binlog gap, RTO = restore time.
-- Compute how stale the last nightly backup is, from a backup log table
CREATE TABLE backup_log (id INT AUTO_INCREMENT PRIMARY KEY, finished_at DATETIME);
INSERT INTO backup_log (finished_at) VALUES ('2026-10-05 02:10:00');
SELECT TIMESTAMPDIFF(HOUR, MAX(finished_at), '2026-10-05 14:10:00') AS hours_of_data_at_risk
FROM backup_log;

-- OUTPUT:
-- +-----------------------+
-- | hours_of_data_at_risk |
-- +-----------------------+
-- |                    12 |
-- +-----------------------+`],
        [`A typical tier table: payments RPO 0 / RTO under 1 min (Group Replication), orders RPO under 5 s / RTO 5 min (async + orchestrator), reporting RPO 24 h / RTO 4 h (nightly backup).`,
            r`-- Enable semi-synchronous replication to push RPO toward zero (MySQL 8.0.26+ names)
INSTALL PLUGIN rpl_semi_sync_source  SONAME 'semisync_source.so';
SET GLOBAL rpl_semi_sync_source_enabled = 1;
SET GLOBAL rpl_semi_sync_source_timeout = 1000;   -- ms to wait for a replica ack, then fall back to async
SHOW VARIABLES LIKE 'rpl_semi_sync_source_enabled';

-- OUTPUT:
-- +------------------------------+-------+
-- | Variable_name                | Value |
-- +------------------------------+-------+
-- | rpl_semi_sync_source_enabled | ON    |
-- +------------------------------+-------+`],
        [`<b>Advantages:</b> a shared vocabulary for engineers and business, a basis for budgeting, and measurable acceptance tests for HA and backup designs.`,
            r`-- Make RPO measurable: a heartbeat row written every second on the primary
CREATE TABLE heartbeat (id INT PRIMARY KEY, ts TIMESTAMP(3) NOT NULL);
REPLACE INTO heartbeat VALUES (1, NOW(3));
-- on the replica: true lag in ms, not the coarse Seconds_Behind_Source
SELECT TIMESTAMPDIFF(MICROSECOND, ts, NOW(3)) / 1000 AS lag_ms FROM heartbeat WHERE id = 1;

-- OUTPUT (example):
-- +--------+
-- | lag_ms |
-- +--------+
-- | 41.000 |
-- +--------+`],
        [`<b>Disadvantages:</b> tighter targets cost exponentially more (extra replicas, cross-zone latency, tooling, on-call). RPO 0 means every commit waits for a remote acknowledgement, which adds write latency.`,
            r`-- Latency price of RPO 0: commit waits for a replica ack (example numbers)
-- async      commit ~ 0.4 ms
-- semi-sync  commit ~ 0.4 ms + network RTT to replica (same zone 0.5 ms, cross region 40+ ms)
SHOW STATUS LIKE 'Rpl_semi_sync_source_avg_net_wait_time';

-- OUTPUT (example):
-- +-----------------------------------------+-------+
-- | Variable_name                           | Value |
-- +-----------------------------------------+-------+
-- | Rpl_semi_sync_source_avg_net_wait_time  | 480   |   (microseconds)
-- +-----------------------------------------+-------+`],
        [`<b>Limitations:</b> RTO is only real if you have tested it; an untested restore of a 2 TB backup may take many hours. RPO figures from replication lag are estimates, not guarantees.`,
            r`-- RTO check: time a restore drill and record it, never assume
-- shell:
--   time mysql -u root < full_backup.sql
-- OUTPUT (example):
-- real    94m12.3s     => RTO for a full logical restore is ~1.6 hours, not the 15 minutes in the SLA`],
        `
   time ──────────────────────────────────────────────────────►
        last good data      DISASTER        service restored
   ───────────●────────────────X────────────────●──────────
              │◄──── RPO ─────►│◄──── RTO ─────►│
              data lost         downtime
   Smaller RPO  -> more frequent backup / sync replication
   Smaller RTO  -> warm standby, automatic failover
`,
        `Set RPO and RTO per service tier with the business, then choose the cheapest design that meets them: backups (hours), async replica (seconds), semi-sync or Group Replication (near zero). Validate with game days, because the number that matters is the one you measured.`
    ),

    'Disaster Recovery': dd(
        [`<b>Disaster Recovery (DR)</b> is the plan and infrastructure to resume service after losing a whole site or region (fire, power, cloud region outage, ransomware). HA protects against a server failing; DR protects against the datacenter failing.`,
            r`-- A DR replica in another region is just a replica with a long link
CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = 'primary.eu-west.example.com',
    SOURCE_USER = 'repl', SOURCE_PASSWORD = 'secret',
    SOURCE_AUTO_POSITION = 1, SOURCE_SSL = 1;   -- encrypt traffic over the WAN
START REPLICA;
SELECT SERVICE_STATE FROM performance_schema.replication_connection_status;

-- OUTPUT:
-- +---------------+
-- | SERVICE_STATE |
-- +---------------+
-- | ON            |
-- +---------------+`],
        [`Replicas in the same rack share the same fate. Corruption, an accidental DROP or ransomware replicate instantly to every copy, so DR also needs point-in-time recovery from backups and binary logs.`,
            r`-- Accidental DELETE replicates to all replicas. Use a delayed replica as a safety net:
STOP REPLICA;
CHANGE REPLICATION SOURCE TO SOURCE_DELAY = 3600;   -- apply changes 1 hour late
START REPLICA;
SHOW REPLICA STATUS\G

-- OUTPUT (example, trimmed):
-- SQL_Delay: 3600
-- SQL_Remaining_Delay: 3421`],
        [`Real setups: a primary region with HA, an asynchronous DR replica in a second region, nightly full backups copied off-site, and binlogs streamed to object storage for point-in-time recovery.`,
            r`-- Point-in-time recovery: restore backup, then replay binlogs up to just before the mistake
-- shell:
--   mysql -u root < full_backup.sql
--   mysqlbinlog --start-position=157 --stop-datetime="2026-10-05 13:59:59" binlog.000042 | mysql -u root

-- OUTPUT (example):
-- tables restored, replay applied 18,204 events, stopped before the bad DELETE`],
        [`<b>Advantages:</b> survives region loss, protects against logical errors (with delay or PITR), and satisfies compliance requirements.`,
            r`-- Binary logging must be on and retained long enough for PITR
SELECT @@log_bin AS log_bin, @@binlog_expire_logs_seconds / 86400 AS retention_days;

-- OUTPUT:
-- +---------+----------------+
-- | log_bin | retention_days |
-- +---------+----------------+
-- |       1 |         7.0000 |
-- +---------+----------------+`],
        [`<b>Disadvantages:</b> duplicated infrastructure that sits mostly idle, cross-region bandwidth cost, and operational complexity. A DR site that was never exercised often fails when needed.`,
            r`-- Cross-region replicas lag; check regularly
SELECT CHANNEL_NAME, SERVICE_STATE, LAST_ERROR_MESSAGE
FROM performance_schema.replication_applier_status_by_worker LIMIT 1;

-- OUTPUT (example):
-- +--------------+---------------+--------------------+
-- | CHANNEL_NAME | SERVICE_STATE | LAST_ERROR_MESSAGE |
-- +--------------+---------------+--------------------+
-- |              | ON            |                    |
-- +--------------+---------------+--------------------+`],
        [`<b>Limitations:</b> asynchronous DR means non-zero RPO; promoting the DR site is a deliberate decision with data-loss implications. Failing back to the original region is often harder than failing over.`,
            r`-- After promoting the DR site, the old primary may hold transactions the DR never saw.
-- Detect divergence by comparing GTID sets before re-attaching it:
SELECT GTID_SUBSET('uuid-A:1-120', 'uuid-A:1-100') AS old_primary_is_subset;

-- OUTPUT:
-- +-----------------------+
-- | old_primary_is_subset |
-- +-----------------------+
-- |                     0 |    (0 = old primary has extra GTIDs; rebuild it from a fresh copy)
-- +-----------------------+`],
        `
   Region A (primary)                         Region B (DR)
   ┌──────────────────────┐  async/WAN       ┌──────────────────────┐
   │ Primary + local HA   │ ───────────────► │ DR replica (warm)    │
   └──────────┬───────────┘                  └──────────┬───────────┘
              │ backups + binlogs                       │ promote on disaster
              ▼                                         ▼
        [ Off-site object storage ]  ◄── PITR source ──[ App in Region B ]
`,
        `Follow the 3-2-1 rule (3 copies, 2 media, 1 off-site) and keep at least one copy that an attacker with production credentials cannot delete (immutable storage). Document the failover and failback runbooks, and schedule restore drills; DR you have not tested is a hope, not a plan.`
    ),

    'InnoDB Cluster & Group Replication': dd(
        [`<b>Group Replication</b> is a MySQL plugin that forms a group of servers which agree on every transaction using a Paxos-based protocol. <b>InnoDB Cluster</b> bundles Group Replication + MySQL Shell (AdminAPI) + MySQL Router into a managed HA solution with automatic failover.`,
            r`-- Typical cluster creation with MySQL Shell (JavaScript mode)
-- shell:  mysqlsh root@db1:3306
--   dba.configureInstance('root@db1:3306')
--   var cluster = dba.createCluster('prodCluster')
--   cluster.addInstance('root@db2:3306')
--   cluster.addInstance('root@db3:3306')
--   cluster.status()

-- OUTPUT (example, trimmed):
-- "clusterName": "prodCluster",
-- "status": "OK",
-- "statusText": "Cluster is ONLINE and can tolerate up to ONE failure.",
-- primary: db1:3306 (R/W), db2:3306 (R/O), db3:3306 (R/O)`],
        [`Asynchronous replication can lose transactions and needs external failover logic. Group Replication provides built-in membership, quorum, automatic primary election and no split brain.`,
            r`-- Inspect group members from any node
SELECT MEMBER_HOST, MEMBER_STATE, MEMBER_ROLE
FROM performance_schema.replication_group_members;

-- OUTPUT (example):
-- +-------------+--------------+-------------+
-- | MEMBER_HOST | MEMBER_STATE | MEMBER_ROLE |
-- +-------------+--------------+-------------+
-- | db1         | ONLINE       | PRIMARY     |
-- | db2         | ONLINE       | SECONDARY   |
-- | db3         | ONLINE       | SECONDARY   |
-- +-------------+--------------+-------------+`],
        [`Used for payment and order systems that need near-zero data loss and failover in seconds. Three nodes is the common minimum (tolerates one failure); five tolerates two. Single-primary mode is the default and safest.`,
            r`-- Which node is the current primary? Applications and Router use this concept
SELECT MEMBER_HOST AS primary_node
FROM performance_schema.replication_group_members
WHERE MEMBER_ROLE = 'PRIMARY';

-- Required settings on every member (my.cnf):
--   binlog_format = ROW, gtid_mode = ON, enforce_gtid_consistency = ON
--   all tables must be InnoDB with a primary key

-- OUTPUT:
-- +--------------+
-- | primary_node |
-- +--------------+
-- | db1          |
-- +--------------+`],
        [`<b>Advantages:</b> automatic failover with no data loss for committed transactions, automatic membership and rejoin, conflict detection, built-in tooling via AdminAPI.`,
            r`-- Group Replication certifies each transaction; conflicts are rolled back, not lost silently
SELECT COUNT_TRANSACTIONS_CHECKED, COUNT_CONFLICTS_DETECTED
FROM performance_schema.replication_group_member_stats LIMIT 1;

-- OUTPUT (example):
-- +----------------------------+--------------------------+
-- | COUNT_TRANSACTIONS_CHECKED | COUNT_CONFLICTS_DETECTED |
-- +----------------------------+--------------------------+
-- |                     182340 |                        0 |
-- +----------------------------+--------------------------+`],
        [`<b>Disadvantages:</b> commit latency includes a group round trip, so nodes should be in low-latency networks; one slow member can trigger flow control and slow the whole group; more moving parts to operate.`,
            r`-- Flow control throttles writers when a member's apply queue grows
SELECT MEMBER_ID, COUNT_TRANSACTIONS_IN_QUEUE AS apply_queue
FROM performance_schema.replication_group_member_stats;

-- OUTPUT (example):
-- +-----------+-------------+
-- | MEMBER_ID | apply_queue |
-- +-----------+-------------+
-- | 8a1c...   |           0 |
-- | 9b2d...   |        1840 |   <- slow node; group may throttle
-- +-----------+-------------+`],
        [`<b>Limitations:</b> InnoDB only, every table needs a primary key, no SERIALIZABLE isolation in multi-primary mode, limited to 9 members, and large transactions are capped by group_replication_transaction_size_limit. Losing quorum (majority) blocks writes.`,
            r`-- A table without a primary key is rejected when group replication is active
CREATE TABLE nopk (a INT);
INSERT INTO nopk VALUES (1);

-- OUTPUT:
-- ERROR 3098 (HY000): The table does not comply with the requirements by an external plugin.`],
        `
        ┌──────────┐   Paxos / certification   ┌──────────┐
        │  db1 PRI │ ◄───────────────────────► │ db2 SEC  │
        └────┬─────┘                           └────┬─────┘
             │            ┌──────────┐              │
             └──────────► │ db3 SEC  │ ◄────────────┘
                          └──────────┘
        write on PRI -> broadcast -> majority certifies -> commit everywhere
        quorum = majority (2 of 3). Lose quorum -> group blocks writes (no split brain)
        [ MySQL Router ] sends R/W to PRI and R/O to SECs
`,
        `Prefer single-primary mode: it avoids write conflicts and gives simpler semantics. Place members in separate failure domains (zones) but with low latency, and for cross-region DR attach an asynchronous replica (InnoDB ClusterSet) rather than stretching the group. Budget for the commit-latency tax and monitor flow control.`
    ),

    'MySQL Router': dd(
        [`<b>MySQL Router</b> is a lightweight proxy that sits between applications and a MySQL cluster. It knows the cluster topology from its metadata and routes connections: read/write traffic to the primary and read-only traffic to secondaries, so apps never hard-code which node is primary.`,
            r`-- Bootstrap the router against an InnoDB Cluster (shell)
--   mysqlrouter --bootstrap root@db1:3306 --directory /opt/router --user=mysqlrouter
--   /opt/router/start.sh

-- OUTPUT (example, trimmed):
-- Classic MySQL protocol connections to cluster 'prodCluster':
-- - Read/Write Connections: localhost:6446
-- - Read/Only  Connections: localhost:6447`],
        [`When failover happens the primary changes address. Without a router every app config must change; with a router the app keeps connecting to the same port and the router redirects after the topology change.`,
            r`-- App connects to the router's R/W port, not to a specific server
--   mysql -h router1 -P 6446 -u app -p -e "SELECT @@hostname"
-- After failover from db1 to db2 the same command returns the new primary

-- OUTPUT (example, before failover):
-- +------------+
-- | @@hostname |
-- +------------+
-- | db1        |
-- +------------+
-- OUTPUT (example, after failover, same connection string):
-- | db2        |`],
        [`Run one router per application host (co-located, no extra hop and no single router to fail) or a pair behind a load balancer. Use the read-only port for reporting queries to offload the primary.`,
            r`# mysqlrouter.conf (generated by bootstrap, simplified)
[routing:prod_rw]
bind_address = 0.0.0.0
bind_port = 6446
destinations = metadata-cache://prodCluster/?role=PRIMARY
routing_strategy = first-available

[routing:prod_ro]
bind_port = 6447
destinations = metadata-cache://prodCluster/?role=SECONDARY
routing_strategy = round-robin

# OUTPUT:
# router listens on 6446 (writes -> primary) and 6447 (reads -> secondaries, round-robin)`],
        [`<b>Advantages:</b> transparent failover for clients, read/write splitting by port, connection routing without app changes, small footprint, and it is part of the MySQL ecosystem and supported with InnoDB Cluster.`,
            r`-- Verify where reads and writes land
--   mysql -h router1 -P 6447 -e "SELECT @@hostname, @@read_only"

-- OUTPUT (example):
-- +------------+-------------+
-- | @@hostname | @@read_only |
-- +------------+-------------+
-- | db2        |           1 |
-- +------------+-------------+`],
        [`<b>Disadvantages:</b> it routes at connection level, not per statement, so read/write splitting is by port and the app must choose. An extra network hop adds slight latency, and a stale metadata cache can briefly misroute.`,
            r`-- Read-your-writes can break if a read goes to a lagging secondary via the RO port
-- App writes via 6446, then immediately reads via 6447:
INSERT INTO orders(id) VALUES (900);        -- on primary
SELECT * FROM orders WHERE id = 900;        -- on secondary, may not be applied yet

-- OUTPUT (example):
-- Empty set (0.00 sec)      <- replica lag, not data loss`],
        [`<b>Limitations:</b> no query rewriting, no connection multiplexing or pooling (unlike ProxySQL), and it is designed for InnoDB Cluster, ClusterSet or ReplicaSet metadata rather than arbitrary topologies.`,
            r`-- Router does not pool: 500 app connections become 500 server connections
SHOW STATUS LIKE 'Threads_connected';

-- OUTPUT (example):
-- +-------------------+-------+
-- | Variable_name     | Value |
-- +-------------------+-------+
-- | Threads_connected | 503   |
-- +-------------------+-------+`],
        `
   ┌──────────┐        ┌──────────────────┐   :6446 RW   ┌──────────────┐
   │  App 1   │ ─────► │                  │ ───────────► │ db1 PRIMARY  │
   └──────────┘        │   MySQL Router   │              └──────────────┘
   ┌──────────┐        │ (metadata cache) │   :6447 RO   ┌──────────────┐
   │  App 2   │ ─────► │                  │ ───────────► │ db2 / db3    │
   └──────────┘        └─────────┬────────┘  round-robin └──────────────┘
                                 │ polls cluster metadata, reroutes after failover
`,
        `Deploy Router next to each app instance so it is never a shared single point of failure, and use application-level connection pooling since Router does not pool. If you need statement-level read/write splitting, query caching or multiplexing, evaluate ProxySQL, accepting the extra component to operate.`
    )
};
