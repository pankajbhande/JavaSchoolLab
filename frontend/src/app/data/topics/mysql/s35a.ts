// Module 35 (Binary Logs): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s35a: Record<string, DeepDive> = {
    'Binary Log Basics': dd(
        [`The <b>binary log</b> (binlog) is a sequence of files recording every change made to data and structure (INSERT, UPDATE, DELETE, DDL) in commit order. It is written by the MySQL server layer, independent of the storage engine.`,
            r`-- Is it on, and which file is current?
SHOW VARIABLES LIKE 'log_bin';
SHOW BINARY LOGS;

-- OUTPUT (example):
-- +---------------+-------+
-- | Variable_name | Value |
-- +---------------+-------+
-- | log_bin       | ON    |      -- ON by default in MySQL 8.0
-- +---------------+-------+
-- +---------------+-----------+-----------+
-- | Log_name      | File_size | Encrypted |
-- +---------------+-----------+-----------+
-- | binlog.000001 |       157 | No        |
-- | binlog.000002 |   2048311 | No        |
-- +---------------+-----------+-----------+`],
        [`Without a change log, a server cannot feed replicas, cannot roll a backup forward to an exact time, and cannot feed CDC tools like Debezium. The binlog is the single source of truth for what changed and when.`,
            r`-- Make a change and watch it appear in the log
CREATE TABLE demo.t (id INT PRIMARY KEY, v VARCHAR(10));
INSERT INTO demo.t VALUES (1, 'a');
SHOW BINLOG EVENTS IN 'binlog.000002' LIMIT 5;

-- OUTPUT (example):
-- +---------------+------+-------------+-----------+-------------+----------------------------------+
-- | Log_name      | Pos  | Event_type  | Server_id | End_log_pos | Info                             |
-- +---------------+------+-------------+-----------+-------------+----------------------------------+
-- | binlog.000002 | 126  | Query       |         1 | 245         | CREATE TABLE demo.t (...)        |
-- | binlog.000002 | 245  | Query       |         1 | 325         | BEGIN                            |
-- | binlog.000002 | 325  | Table_map   |         1 | 380         | table_id: 88 (demo.t)            |
-- | binlog.000002 | 380  | Write_rows  |         1 | 422         | table_id: 88 flags: STMT_END     |
-- | binlog.000002 | 422  | Xid         |         1 | 453         | COMMIT /* xid=17 */              |
-- +---------------+------+-------------+-----------+-------------+----------------------------------+`],
        [`Real use: replication, PITR, auditing "who changed what" (row format), change-data-capture into Kafka, and cache invalidation.`,
            r`# Read the log in human form
mysqlbinlog --base64-output=DECODE-ROWS -vv /var/lib/mysql/binlog.000002 | tail -n 12

# OUTPUT (example):
# ### INSERT INTO demo.t
# ### SET
# ###   @1=1 /* INT meta=0 nullable=0 is_null=0 */
# ###   @2='a' /* VARSTRING(10) meta=10 nullable=1 is_null=0 */
# COMMIT/*!*/;`],
        [`<b>Advantages:</b> enables replication and PITR, is sequential (cheap to write), has a defined commit order, can be streamed remotely, can be encrypted and compressed (8.0.20+).`,
            r`-- Retention and safety knobs
SET PERSIST binlog_expire_logs_seconds = 604800;   -- keep 7 days (default 30 days)
SET PERSIST sync_binlog = 1;                       -- fsync at every commit: durable
SHOW VARIABLES LIKE 'binlog_%compression%';

-- OUTPUT (example):
-- +-----------------------+-------+
-- | Variable_name         | Value |
-- +-----------------------+-------+
-- | binlog_transaction_compression | OFF |
-- +-----------------------+-------+`],
        [`<b>Disadvantages:</b> extra disk I/O on every commit (two-phase commit with InnoDB redo), disk space growth, and it can contain sensitive data in clear text unless encrypted.`,
            r`-- Cost check: how much binlog does the workload produce, and how much commit waiting happens?
SHOW GLOBAL STATUS LIKE 'Binlog_cache_disk_use';   -- transactions that spilled to a temp file
SHOW BINARY LOGS;                                  -- sum the sizes per day

-- OUTPUT (example):
-- +-----------------------+-------+
-- | Variable_name         | Value |
-- +-----------------------+-------+
-- | Binlog_cache_disk_use |   412 |
-- +-----------------------+-------+`],
        [`<b>Limitations:</b> it records only committed changes (not SELECTs), a file purged is gone for good, it does not contain data from before it was enabled, and statements changing non-transactional tables are logged even on rollback.`,
            r`-- Never delete files with rm: let the server purge so the index stays consistent
PURGE BINARY LOGS BEFORE '2026-10-01 00:00:00';
PURGE BINARY LOGS TO 'binlog.000040';

-- OUTPUT:
-- Query OK, 0 rows affected (0.02 sec)`],
        `
   client COMMIT
       │
       ▼
   InnoDB prepare ──► write binlog event ──► fsync binlog ──► InnoDB commit
                           │
                           ▼
   binlog.000001 ─► binlog.000002 ─► ...   binlog.index (list of files)
                           │
         replicas (IO thread) / mysqlbinlog / CDC readers
`,
        `Keep binlogs on durable storage with sync_binlog=1 and innodb_flush_log_at_trx_commit=1 when you cannot lose committed data. Size retention to cover your backup interval plus replica downtime, archive off-host for PITR, and treat the logs as sensitive data (encrypt at rest, restrict REPLICATION CLIENT access).`
    ),

    'Binlog Formats: Statement, Row & Mixed': dd(
        [`<code>binlog_format</code> chooses what is logged. <b>STATEMENT</b> logs the SQL text, <b>ROW</b> logs the before/after image of each changed row, <b>MIXED</b> uses statement unless it is unsafe, then switches to row. ROW is the default since MySQL 5.7.7.`,
            r`SHOW VARIABLES LIKE 'binlog_format';
SET SESSION binlog_format = 'ROW';      -- changeable per session (needs privilege)
SET PERSIST binlog_format = 'ROW';      -- global (deprecated setting in 8.0 but still supported)

-- OUTPUT:
-- +---------------+-------+
-- | Variable_name | Value |
-- +---------------+-------+
-- | binlog_format | ROW   |
-- +---------------+-------+`],
        [`Some statements give different results when replayed on a replica (NOW(), UUID(), RAND(), LIMIT without ORDER BY, UDFs). Statement logging can make a replica silently drift; row logging replays the exact result.`,
            r`-- Non-deterministic: unsafe in STATEMENT format
UPDATE users SET token = UUID() WHERE active = 1;
-- STATEMENT: replica runs UUID() itself -> different values -> data divergence
--            (server warns: Statement is unsafe because it uses a system function that may return a different value on the slave)
-- ROW:       replica receives the actual token values -> identical

-- OUTPUT (example, STATEMENT mode):
-- Query OK, 3 rows affected, 1 warning (0.01 sec)
-- Warning 1592: Unsafe statement written to the binary log using statement format`],
        [`ROW is standard for replication, CDC (Debezium needs ROW with full row image) and auditing. STATEMENT can still help for huge bulk updates where row logging would be gigantic.`,
            r`-- A bulk update touching 1,000,000 rows:
UPDATE events SET status = 'archived' WHERE created_at < '2020-01-01';
-- STATEMENT: one small event (~100 bytes)
-- ROW      : 1,000,000 before+after images (hundreds of MB)
-- Control the size of row images:
SET PERSIST binlog_row_image = 'MINIMAL';     -- FULL (default) | MINIMAL | NOBLOB

-- OUTPUT (example):
-- Query OK, 1000000 rows affected (12.40 sec)
-- binlog growth: STATEMENT ~0 MB, ROW FULL ~410 MB, ROW MINIMAL ~180 MB`],
        [`<b>Advantages:</b> ROW = safe and deterministic, audit-ready, required for most tools, and lets replicas apply by primary key. STATEMENT = compact. MIXED = compromise.`,
            r`-- Reading ROW events shows exactly what changed:
-- mysqlbinlog --base64-output=DECODE-ROWS -vv binlog.000002
-- ### UPDATE demo.t
-- ### WHERE
-- ###   @1=1
-- ###   @2='a'
-- ### SET
-- ###   @1=1
-- ###   @2='b'

-- OUTPUT:
-- Before image (WHERE) and after image (SET) are both visible.`],
        [`<b>Disadvantages:</b> ROW produces larger logs and cannot be read as plain SQL without decoding; STATEMENT risks drift and needs more locks (gap locks in REPEATABLE READ); MIXED hides which format ran and is harder to reason about.`,
            r`-- Tables without a primary key are slow to apply in ROW format (replica scans the table per row)
CREATE TABLE logs_nopk (msg VARCHAR(100));
-- Fix: add a PK (or a hidden generated invisible PK in 8.0.30+)
ALTER TABLE logs_nopk ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST;
SHOW VARIABLES LIKE 'sql_require_primary_key';

-- OUTPUT:
-- +--------------------------+-------+
-- | Variable_name            | Value |
-- +--------------------------+-------+
-- | sql_require_primary_key  | OFF   |
-- +--------------------------+-------+`],
        [`<b>Limitations:</b> you cannot change binlog_format inside a transaction or while temporary tables are open in a session; statement format cannot be used safely with READ COMMITTED for InnoDB; and mixing formats across sources in a topology complicates tools.`,
            r`START TRANSACTION;
SET SESSION binlog_format = 'STATEMENT';

-- OUTPUT:
-- ERROR 1560 (HY000): Cannot modify @@session.binlog_format inside a transaction`],
        `
   UPDATE t SET v = UUID();
      │
      ├─ STATEMENT : log "UPDATE t SET v = UUID()"        small, replica re-executes (can differ)
      ├─ ROW       : log  row1 old/new, row2 old/new ...  big, exact
      └─ MIXED     : safe statement -> STATEMENT ; unsafe -> ROW
`,
        `Default to ROW with binlog_row_image=FULL (or MINIMAL if you control every consumer). Use ROW for CDC and multi-source topologies. Require primary keys on every table, and make large batch jobs chunked so row events stay manageable.`
    ),

    'Binlog for Replication & Recovery': dd(
        [`The binlog is the transport and the history. A replica's I/O thread copies events from the source's binlog into a relay log, and a SQL thread applies them. For recovery, <code>mysqlbinlog</code> replays the same events onto a restored backup.`,
            r`-- On the replica: which source file/position has it read and applied?
SHOW REPLICA STATUS\G

-- OUTPUT (example, abridged):
-- *************************** 1. row ***************************
--          Replica_IO_State: Waiting for source to send event
--              Source_Log_File: binlog.000042
--          Read_Source_Log_Pos: 158732
--          Replica_IO_Running: Yes
--         Replica_SQL_Running: Yes`],
        [`Replication and recovery both need an ordered, complete list of changes plus a way to say "start here". Coordinates (file + position) or GTIDs give that starting point.`,
            r`-- Coordinates of "now" on the source (use these when seeding a replica from a backup)
SHOW BINARY LOG STATUS;          -- 8.2+ ; older: SHOW MASTER STATUS

-- Point a new replica at the source from those coordinates
CHANGE REPLICATION SOURCE TO
    SOURCE_HOST = 'db1', SOURCE_USER = 'repl', SOURCE_PASSWORD = 'secret',
    SOURCE_LOG_FILE = 'binlog.000042', SOURCE_LOG_POS = 158732;
START REPLICA;

-- OUTPUT:
-- Query OK, 0 rows affected (0.05 sec)`],
        [`Real flows: seed a replica from a backup then stream binlogs; CDC pipelines read the binlog as a client; and ops teams run <code>mysqlbinlog</code> to extract a transaction for a hot-fix or audit.`,
            r`# Stream binlogs continuously to a backup host (acts as a replica client, no SQL thread)
mysqlbinlog --read-from-remote-server --host=db1 --user=repl --password \
            --raw --stop-never --result-file=/binlog_archive/ binlog.000042
# Extract just one database's changes from a file
mysqlbinlog --database=shop binlog.000042 > shop_changes.sql

# OUTPUT (example):
# (running; files binlog.000042 ... appear in /binlog_archive/)`],
        [`<b>Advantages:</b> one mechanism serves replication, backup roll-forward and CDC; changes are replayable and filterable; the same log is the audit trail.`,
            r`-- Filter a replica to a subset of databases (set on the replica, per channel)
CHANGE REPLICATION FILTER REPLICATE_DO_DB = (shop, billing);
SHOW REPLICA STATUS\G

-- OUTPUT (example):
-- Replicate_Do_DB: shop,billing`],
        [`<b>Disadvantages:</b> replicas depend on the source retaining logs; if logs are purged before a replica reads them the replica breaks (error 1236); replay is single-stream unless multi-threaded replication is configured.`,
            r`-- Typical failure when the source purged logs the replica still needs:
-- Last_IO_Error: Got fatal error 1236 from source when reading data from binary log:
--   'Could not find first log file name in binary log index file'
-- Prevent it: retention longer than the worst replica outage
SET PERSIST binlog_expire_logs_seconds = 1209600;    -- 14 days

-- OUTPUT:
-- Query OK, 0 rows affected (0.00 sec)`],
        [`<b>Limitations:</b> replaying a binlog onto a server in a different state (wrong starting point, missing tables) fails or corrupts; GTID gaps and non-deterministic statements need care; DDL replays are not transactional.`,
            r`-- Safer replay: GTID auto-positioning removes manual file/position math
CHANGE REPLICATION SOURCE TO SOURCE_HOST='db1', SOURCE_AUTO_POSITION=1;
-- Check which transactions the replica already has:
SELECT @@GLOBAL.gtid_executed;

-- OUTPUT (example):
-- +----------------------------------------------+
-- | @@GLOBAL.gtid_executed                       |
-- +----------------------------------------------+
-- | 3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1523  |
-- +----------------------------------------------+`],
        `
   SOURCE                                REPLICA                     RECOVERY HOST
   commit ► binlog.00042 ──(I/O thread)► relay log ─(SQL threads)► data
                  │
                  └── mysqlbinlog ──► .sql ──► mysql  (roll a restored backup forward)
`,
        `Prefer GTIDs plus row format for both replication and recovery: positions become portable and failover safe. Stream binlogs to an archive host so loss of the primary does not lose the log. Monitor retention against the slowest replica and test that a restore plus replay lands on the expected GTID set.`
    ),
};
