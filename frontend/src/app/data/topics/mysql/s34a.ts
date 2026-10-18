// Module 34 (Backup & Restore): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s34a: Record<string, DeepDive> = {
    'Logical vs Physical Backup': dd(
        [`A <b>logical backup</b> exports the data as SQL statements (or delimited text) that can be replayed. A <b>physical backup</b> copies the raw data files (tablespaces, redo, binlog position). Logical is portable and readable; physical is much faster for large data sets.`,
            r`# Logical: a text file of CREATE/INSERT statements
mysqldump --single-transaction shop > shop.sql
# Physical: copy of the data directory files (MySQL Enterprise Backup / Percona XtraBackup)
xtrabackup --backup --target-dir=/backups/full1

# OUTPUT (example):
# shop.sql                 -> 120 MB text, human readable
# /backups/full1/          -> ibdata1, shop/orders.ibd, xtrabackup_checkpoints ...
# xtrabackup: completed OK!`],
        [`Backups are your last defence against hardware failure, bad deploys, ransomware and human error (DROP TABLE on production). Choosing the type decides how long a restore takes, which is your real recovery time.`,
            r`# Rough restore-time comparison for a 500 GB database (example numbers):
#   Logical  : replay INSERTs, rebuild every index   ->  10 to 30 hours
#   Physical : copy files back + crash recovery      ->  30 to 90 minutes
# Estimate your own data size first:
mysql -e "SELECT ROUND(SUM(data_length+index_length)/1024/1024/1024,1) AS size_gb FROM information_schema.tables WHERE table_schema='shop'"

# OUTPUT (example):
# +---------+
# | size_gb |
# +---------+
# |   500.3 |
# +---------+`],
        [`Typical use: small and mid databases and schema migrations use mysqldump or MySQL Shell dump utilities; multi-hundred-GB production systems use XtraBackup/MEB or filesystem/cloud snapshots, plus the binary log for point-in-time recovery.`,
            r`# MySQL Shell parallel logical dump (much faster than mysqldump, still logical):
mysqlsh root@localhost -- util dump-schemas shop --outputUrl=/backups/shop_dump --threads=8
# Cloud / LVM snapshot is physical: flush, lock briefly, snapshot, unlock
mysql -e "FLUSH TABLES WITH READ LOCK; SYSTEM lvcreate -s -n snap -L20G /dev/vg/mysql; UNLOCK TABLES;"

# OUTPUT (example):
# Dump duration: 00:02:41s
# Data bytes written: 18.4 GB`],
        [`<b>Advantages:</b> logical = portable across versions/platforms/engines, selective (one table), diff-able; physical = fastest backup and restore, preserves everything byte-for-byte, supports incremental backups.`,
            r`# Logical advantage: restore a single table out of a full dump with simple tools
sed -n '/^-- Table structure for table .orders./,/^-- Table structure for table .users./p' shop.sql > orders_only.sql
mysql shop_copy < orders_only.sql
# Physical advantage: incremental backup copies only changed pages
xtrabackup --backup --target-dir=/backups/inc1 --incremental-basedir=/backups/full1

# OUTPUT (example):
# xtrabackup: Transaction log of lsn (9812345) to (9899999) was copied.
# completed OK!`],
        [`<b>Disadvantages:</b> logical = slow to restore (index rebuild), large on huge tables; physical = tied to the same major version/OS/architecture, not selective without extra steps, needs consistent copy handling.`,
            r`# Physical copy of a RUNNING server without a tool is inconsistent (torn pages, missing redo):
cp -r /var/lib/mysql /backups/bad_copy     # DO NOT do this on a live server
# Restoring such a copy often ends with:
# [ERROR] InnoDB: Database page corruption on disk or a failed file read
# Logical dumps can also be inconsistent if you forget --single-transaction on InnoDB.

# OUTPUT:
# [ERROR] [MY-012153] [InnoDB] Database page corruption detected`],
        [`<b>Limitations:</b> neither type captures changes after the backup finished; you need binary logs for that. Logical dumps do not include users/privileges unless you dump mysql tables or use SHOW CREATE USER. Backup size/time grows with data.`,
            r`-- Users are not in a schema dump; export grants separately:
SHOW CREATE USER 'app'@'%';
SHOW GRANTS FOR 'app'@'%';
-- Backup is only a point in time; record the binlog coordinates for later roll-forward:
SHOW MASTER STATUS;       -- 8.0 syntax; 8.4 uses SHOW BINARY LOG STATUS

-- OUTPUT (example):
-- +------------------+----------+
-- | File             | Position |
-- +------------------+----------+
-- | binlog.000042    |   158732 |
-- +------------------+----------+`],
        `
   LOGICAL                                   PHYSICAL
   ┌────────┐  SELECT/read rows  ┌───────┐   ┌────────┐ copy pages/files ┌────────────┐
   │ Server │ ─────────────────► │ .sql  │   │ Server │ ────────────────►│ .ibd,redo  │
   └────────┘   (slow, portable) └───────┘   └────────┘  (fast, same ver)└────────────┘
   restore = parse + INSERT + build indexes  restore = copy back + crash recovery
`,
        `Use both: a physical full (plus incrementals) for fast disaster restore, and periodic logical or Shell dumps for portability, upgrades and table-level repair. Always add binlog archiving for point-in-time recovery and, above all, test restores regularly: an untested backup is a hope, not a backup.`
    ),

    'mysqldump & Restore': dd(
        [`<b>mysqldump</b> is the classic client utility that writes a database as SQL (DDL plus INSERT statements). Restore means feeding that file back through the <code>mysql</code> client.`,
            r`# Dump one database, then restore it into an empty one
mysqldump -u root -p shop > shop.sql            # write CREATE TABLE + INSERT statements
mysql -u root -p -e "CREATE DATABASE shop_copy" # target must exist (no --databases flag used)
mysql -u root -p shop_copy < shop.sql           # replay the file

# OUTPUT:
# (no output on success; verify with)
# mysql> SELECT COUNT(*) FROM shop_copy.orders;
# +----------+
# | COUNT(*) |
# +----------+
# |    15234 |
# +----------+`],
        [`You need a simple, scriptable way to move or save data: seed a test database, migrate servers, archive a schema, or recover one dropped table. Correct flags decide whether the dump is consistent and complete.`,
            r`# Flags that make a dump production-grade for InnoDB:
mysqldump --single-transaction \
          --routines --triggers --events \
          --set-gtid-purged=OFF \
          --master-data=2 \
          shop > shop_full.sql
#  --single-transaction : consistent snapshot via REPEATABLE READ, no table locks
#  --routines/...       : include stored procedures, triggers, events
#  --master-data=2      : write binlog file/pos as a comment (8.4 renamed: --source-data=2)

# OUTPUT (example, first lines of shop_full.sql):
# -- CHANGE MASTER TO MASTER_LOG_FILE='binlog.000042', MASTER_LOG_POS=158732;
# -- MySQL dump 10.13  Distrib 8.0.36`],
        [`Real use: nightly cron dump of a small SaaS, dumping just a few tables for a developer, piping a dump straight into another server, and compressing on the fly.`,
            r`# Stream and compress, no temp file; copy server A -> server B
mysqldump --single-transaction shop | gzip > shop_$(date +%F).sql.gz
mysqldump --single-transaction shop | mysql -h replica2 shop_copy
# Only some tables, schema only, or data only:
mysqldump shop orders customers > two_tables.sql
mysqldump --no-data shop > schema.sql
mysqldump --no-create-info shop > data.sql

# OUTPUT (example):
# -rw-r--r-- 1 ops ops 18M Oct  6 02:00 shop_2026-10-06.sql.gz`],
        [`<b>Advantages:</b> ships with MySQL, human-readable, portable across versions and platforms, easy to edit and diff, works for any engine, and restores selectively.`,
            r`# Selective restore: only one table from a full dump, or one database from a multi-db dump
mysql --one-database shop_copy < all_databases.sql    # skip statements for other databases
# Quick sanity peek at what the file contains
grep -c "^INSERT INTO" shop.sql

# OUTPUT (example):
# 1823`],
        [`<b>Disadvantages:</b> single-threaded, slow on big data, restore must rebuild every index, large file size, and row-at-a-time inserts unless extended inserts are used (default on).`,
            r`# Speed up a restore: disable checks and bulk load inside one session
mysql shop_copy -e "
  SET unique_checks=0; SET foreign_key_checks=0; SET sql_log_bin=0;
  SOURCE shop.sql;
  SET foreign_key_checks=1; SET unique_checks=1;"
# Compare: a 200 GB schema can take a day with plain mysqldump | mysql

# OUTPUT (example):
# Query OK, 0 rows affected (0.00 sec)
# ... (long replay) ...`],
        [`<b>Limitations:</b> without --single-transaction (or locks) the dump may be inconsistent; MyISAM tables need --lock-all-tables; DDL during the dump can break the snapshot; the dump is as of one moment; mysql system users are not included by default.`,
            r`# Prove the consistency window: the dump starts a transaction like this
#   START TRANSACTION WITH CONSISTENT SNAPSHOT;
# Anything committed after that point is NOT in the file. Record where it stopped:
mysqldump --single-transaction --source-data=2 shop 2>/dev/null | head -n 25 | grep -i "log_file"

# OUTPUT (example):
# -- CHANGE REPLICATION SOURCE TO SOURCE_LOG_FILE='binlog.000042', SOURCE_LOG_POS=158732;`],
        `
   mysqldump ──► BEGIN snapshot ──► for each table: SELECT * ──► .sql text
                      │                                              │
                 (no locks, InnoDB)                          mysql < file.sql
                                                                     │
                                                      CREATE TABLE ► INSERT ► indexes
`,
        `mysqldump is the right tool up to roughly tens of GB. Beyond that, use MySQL Shell dump/load (parallel, chunked) or physical backups. Always script it with --single-transaction, record the binlog position, store dumps off-host and encrypted, and rehearse a full restore into a scratch server on a schedule.`
    ),

    'Backup Strategies: Full & Incremental': dd(
        [`A <b>full backup</b> copies everything. An <b>incremental backup</b> copies only what changed since the previous backup; a <b>differential</b> copies changes since the last full. A strategy combines them with retention rules.`,
            r`# Weekly full + daily incremental with XtraBackup (physical)
xtrabackup --backup --target-dir=/backups/full_sun
xtrabackup --backup --target-dir=/backups/inc_mon --incremental-basedir=/backups/full_sun
xtrabackup --backup --target-dir=/backups/inc_tue --incremental-basedir=/backups/inc_mon

# OUTPUT (example):
# full_sun : 480 GB   inc_mon : 6 GB   inc_tue : 7 GB`],
        [`Full backups of terabytes every night are too slow and expensive. Incrementals shrink the backup window and storage but lengthen the restore chain, so the plan balances cost against recovery time.`,
            r`-- Size of change per day tells you if incrementals are worthwhile
-- (daily binlog volume ~ daily change volume)
SHOW BINARY LOGS;

-- OUTPUT (example):
-- +---------------+-----------+-----------+
-- | Log_name      | File_size | Encrypted |
-- +---------------+-----------+-----------+
-- | binlog.000040 | 1073741824| No        |
-- | binlog.000041 |  913002113| No        |
-- +---------------+-----------+-----------+`],
        [`Typical production plan: weekly full, daily incremental, continuous binlog shipping, 30 days retention, monthly archived copy to cold storage, and a nightly automated restore test on a spare host.`,
            r`# Cron schedule (crontab -e)
# 02:00 Sunday   full
0 2 * * 0   /opt/bk/full.sh
# 02:00 Mon-Sat  incremental against yesterday
0 2 * * 1-6 /opt/bk/incr.sh
# every 5 min    ship closed binlogs off-host (RPO of minutes)
*/5 * * * * rsync -a /var/lib/mysql/binlog.0* backup-host:/binlogs/

# OUTPUT:
# (cron jobs registered; check logs in /var/log/bk.log)`],
        [`<b>Advantages:</b> shorter backup windows, less I/O and storage, finer recovery points, and the option to prune old chains while keeping the latest full.`,
            r`# Prepare (apply redo) the full, then roll each incremental onto it, then restore
xtrabackup --prepare --apply-log-only --target-dir=/backups/full_sun
xtrabackup --prepare --apply-log-only --target-dir=/backups/full_sun --incremental-dir=/backups/inc_mon
xtrabackup --prepare              --target-dir=/backups/full_sun --incremental-dir=/backups/inc_tue
xtrabackup --copy-back --target-dir=/backups/full_sun

# OUTPUT (example):
# xtrabackup: completed OK!   (after each step)`],
        [`<b>Disadvantages:</b> restore needs the whole chain (one lost incremental breaks later ones), more moving parts, more testing, and chain corruption is easy to miss until restore day.`,
            r`# Integrity: record checksums so a broken link is detected before you need it
cd /backups && sha256sum full_sun/xtrabackup_checkpoints inc_mon/xtrabackup_checkpoints > chain.sha256
sha256sum -c chain.sha256
# Chain continuity rule: each incremental's from_lsn must equal the previous to_lsn
grep -E "from_lsn|to_lsn" inc_mon/xtrabackup_checkpoints

# OUTPUT (example):
# full_sun/xtrabackup_checkpoints: OK
# inc_mon/xtrabackup_checkpoints: OK
# from_lsn = 9812345
# to_lsn = 9899999`],
        [`<b>Limitations:</b> InnoDB incrementals track changed pages (LSN), but MyISAM tables are copied whole; logical backups cannot be truly incremental (use binlogs instead). Schema changes and encryption/compression settings must match across the chain.`,
            r`# Logical "incremental" = binary logs since the last dump, replayed with mysqlbinlog
mysqlbinlog --start-position=158732 binlog.000042 binlog.000043 | mysql -u root -p
# Convert dump position to a human check:
mysqlbinlog --base64-output=DECODE-ROWS -v binlog.000043 | head -n 12

# OUTPUT (example):
# # at 4
# #261006  2:00:01 server id 1  end_log_pos 126  Start: binlog v 4, server v 8.0.36`],
        `
   Sun         Mon         Tue         Wed   ...
   [FULL]──►  [INC1]──►   [INC2]──►   [INC3]
   480 GB      6 GB        7 GB        5 GB
   Restore Wed =  FULL + INC1 + INC2 + INC3  (+ binlogs to the exact second)
`,
        `Pick the chain length by your RTO: long chains mean slower, riskier restores. Many teams prefer a frequent full from a replica (so production is untouched) plus binlog archiving, which is simple and gives per-second recovery. Automate verification and keep at least one independent, immutable copy.`
    ),

    'Point-in-Time Recovery': dd(
        [`<b>Point-in-Time Recovery (PITR)</b> restores a backup and then replays binary logs up to a chosen moment, such as just before an accidental DELETE. It needs a base backup plus all binlogs since.`,
            r`# 1) restore last night's full backup, 2) replay binlogs up to 09:59:59
mysql shop < shop_2026-10-06.sql
mysqlbinlog --stop-datetime="2026-10-06 09:59:59" binlog.000042 binlog.000043 | mysql

# OUTPUT:
# (silent success; data now equals the state at 09:59:59)`],
        [`A nightly backup alone loses up to 24 hours of data. PITR cuts the loss to seconds and is the only way to undo a logical mistake (a bad UPDATE) without losing everything after it.`,
            r`-- Mistake at 10:00:00:
DELETE FROM orders;                     -- forgot the WHERE clause
-- Find the exact event position to stop before:
SHOW BINLOG EVENTS IN 'binlog.000043' LIMIT 8;

-- OUTPUT (example):
-- +---------------+------+------------+-----------+-------------+------------------------------+
-- | Log_name      | Pos  | Event_type | Server_id | End_log_pos | Info                         |
-- +---------------+------+------------+-----------+-------------+------------------------------+
-- | binlog.000043 | 4    | Format_desc|         1 | 126         | Server ver: 8.0.36           |
-- | binlog.000043 | 8021 | Query      |         1 | 8110        | BEGIN                        |
-- | binlog.000043 | 8110 | Table_map  |         1 | 8170        | table_id: 91 (shop.orders)   |
-- | binlog.000043 | 8170 | Delete_rows|         1 | 9902        | table_id: 91 flags: STMT_END |
-- +---------------+------+------------+-----------+-------------+------------------------------+`],
        [`Recovery runbook: stop writes, restore the base backup to a separate server, apply binlogs up to the bad event, validate, then switch or copy the missing rows back.`,
            r`# Replay from the backup's recorded position up to just before the bad statement (pos 8110)
mysqlbinlog --start-position=158732 --stop-position=8021 binlog.000042 | mysql
# Or skip the bad transaction and continue after it
mysqlbinlog --start-position=9902 binlog.000043 binlog.000044 | mysql
# GTID setups: exclude a single transaction instead
#   SET GTID_NEXT='uuid:1234'; BEGIN; COMMIT; SET GTID_NEXT=AUTOMATIC;

# OUTPUT:
# (no errors; verify)  SELECT COUNT(*) FROM shop.orders;  ->  15234`],
        [`<b>Advantages:</b> near-zero data loss (RPO of seconds), reverses human errors, works with any consistent backup, and can restore into a clone for investigation.`,
            r`-- Restore into a scratch instance, query the lost rows, copy only those back:
INSERT INTO prod.orders SELECT * FROM scratch.orders WHERE id BETWEEN 1 AND 15234
ON DUPLICATE KEY UPDATE total = VALUES(total);   -- VALUES() deprecated in 8.0.20 but still works

-- OUTPUT:
-- Query OK, 15234 rows affected (1.20 sec)`],
        [`<b>Disadvantages:</b> needs binlogs kept and archived, replay can be slow, mistakes in position or timezone give wrong results, and the process is manual and stressful at 3 AM unless rehearsed.`,
            r`# Time zone pitfall: --stop-datetime is interpreted in the client's local zone
mysqlbinlog --stop-datetime="2026-10-06 09:59:59" binlog.000043 | grep -c "Delete_rows"
# Safer: use positions, or run with TZ set explicitly
TZ=UTC mysqlbinlog --stop-datetime="2026-10-06 04:29:59" binlog.000043 | grep -c "DELETE"

# OUTPUT (example):
# 0`],
        [`<b>Limitations:</b> requires binlog (log_bin on, row-based preferred, sufficient binlog_expire_logs_seconds), cannot recover past purged logs, and cannot undo DDL that was not logged or happened before the backup.`,
            r`SHOW VARIABLES WHERE Variable_name IN ('log_bin','binlog_format','binlog_expire_logs_seconds','sync_binlog');

-- OUTPUT (example):
-- +----------------------------+--------+
-- | Variable_name              | Value  |
-- +----------------------------+--------+
-- | binlog_expire_logs_seconds | 604800 |   -- 7 days: PITR window limit unless archived
-- | binlog_format              | ROW    |
-- | log_bin                    | ON     |
-- | sync_binlog                | 1      |
-- +----------------------------+--------+`],
        `
   Mon 02:00      Mon 10:00        Mon 10:00:01
   [FULL BACKUP]──binlog events────► DELETE FROM orders  (mistake)
        │             │  replay ───────────►│ stop before
        ▼             ▼
   restore  +  mysqlbinlog --stop-position  ==> state at 09:59:59
`,
        `PITR quality is determined by binlog hygiene: sync_binlog=1, row format, off-host streaming (mysqlbinlog --read-from-remote-server --raw --stop-never), retention longer than backup interval, and delayed replicas as a fast alternative. Rehearse the runbook and write the position-finding steps down.`
    ),
};
