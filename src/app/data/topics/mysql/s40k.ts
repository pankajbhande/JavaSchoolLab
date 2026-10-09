// Module 40 (MVCC), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s40k: Record<string, DeepDive> = {
    'What is MVCC?': dd(
        [`<b>MVCC</b> (Multi-Version Concurrency Control) lets InnoDB keep several versions of a row at once so readers see a consistent snapshot without blocking writers, and writers do not block readers. The motto: readers never block writers, writers never block readers.`,
            r`-- Session A starts a snapshot, session B changes the row, A still sees the old value
CREATE TABLE acct (id INT PRIMARY KEY, bal INT);
INSERT INTO acct VALUES (1, 100);

-- Session A:
START TRANSACTION;
SELECT bal FROM acct WHERE id = 1;          -- snapshot taken at this first read

-- Session B (autocommit):
UPDATE acct SET bal = 150 WHERE id = 1;

-- Session A again:
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT:
-- A first read : 100
-- A second read: 100     <- still the snapshot, B's change is invisible to A`],
        [`Locking every read would serialize the whole system: a long report would freeze all updates. MVCC gives consistent reads without locks, which is why InnoDB scales for mixed read and write workloads.`,
            r`-- Reader is not blocked by an uncommitted writer
-- Session B:
START TRANSACTION; UPDATE acct SET bal = 999 WHERE id = 1;   -- not committed, row is locked
-- Session A (plain SELECT, no waiting):
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT:
-- +------+
-- | bal  |
-- +------+
-- |  150 |      returned instantly from the old version, not blocked by B's lock
-- +------+`],
        [`Every web request reading a catalogue while orders are being written benefits. Reports and backups with --single-transaction rely on MVCC to read a stable view of a live database.`,
            r`-- Consistent online logical backup: one snapshot, no table locks
-- shell:
--   mysqldump --single-transaction --routines --triggers shop > shop.sql
-- (internally: START TRANSACTION WITH CONSISTENT SNAPSHOT; then dumps every table)

-- OUTPUT (example):
-- -- Dump completed, writers were never blocked during the dump`],
        [`<b>Advantages:</b> high read concurrency, no read locks, repeatable reads inside a transaction, and consistent backups and reports on live data.`,
            r`-- Explicitly start a snapshot at BEGIN time (not at first read)
START TRANSACTION WITH CONSISTENT SNAPSHOT;
SELECT COUNT(*) AS rows_seen FROM acct;

-- OUTPUT:
-- +-----------+
-- | rows_seen |
-- +-----------+
-- |         1 |
-- +-----------+`],
        [`<b>Disadvantages:</b> old versions occupy undo space until purged, long-running transactions keep them alive, and each row carries extra hidden columns (6-byte transaction id and 7-byte roll pointer).`,
            r`-- Purge lag: history list length grows when an old transaction stays open
SELECT COUNT AS history_list_length FROM information_schema.INNODB_METRICS
WHERE NAME = 'trx_rseg_history_len';

-- OUTPUT (example):
-- +---------------------+
-- | history_list_length |
-- +---------------------+
-- |             2400118 |
-- +---------------------+`],
        [`<b>Limitations:</b> MVCC applies to plain (non-locking) SELECTs; statements such as SELECT ... FOR UPDATE, UPDATE and DELETE read the latest committed version and take locks. It does not exist in the MEMORY engine.`,
            r`-- Locking read ignores the snapshot and sees the latest committed data
-- Session A (snapshot still shows 100 from before):
SELECT bal FROM acct WHERE id = 1;              -- 100
SELECT bal FROM acct WHERE id = 1 FOR UPDATE;   -- latest committed value, takes a lock

-- OUTPUT:
-- 100
-- 150      <- current version, not the snapshot`],
        `
   row id=1 versions (newest first)
   ┌──────────────────────┐   roll ptr   ┌──────────────────────┐   roll ptr   ┌─────────────────┐
   │ bal=150 trx=105      │ ───────────► │ bal=100 trx=90       │ ───────────► │ older ... (undo)│
   └──────────────────────┘              └──────────────────────┘              └─────────────────┘
   reader with snapshot older than trx 105 follows the chain back to bal=100
`,
        `MVCC trades storage and purge work for concurrency, so the operational risk is the forgotten open transaction. Set idle-transaction timeouts, alert on history list length and oldest-transaction age, and keep application transactions short.`
    ),

    'Consistent Reads & Read Views': dd(
        [`A <b>consistent (non-locking) read</b> is a plain SELECT that returns data as of a point in time, using a <b>read view</b>: an internal snapshot listing which transactions were active when it was created. Rows changed by transactions not visible to that view are reconstructed from undo.`,
            r`-- Default level REPEATABLE READ: the read view is created at the FIRST consistent read
SELECT @@transaction_isolation AS iso;
START TRANSACTION;
SELECT COUNT(*) FROM acct;                   -- read view created here

-- OUTPUT:
-- +-----------------+
-- | iso             |
-- +-----------------+
-- | REPEATABLE-READ |
-- +-----------------+`],
        [`Within one transaction you want one stable picture of the data: totals that add up, no rows that appear and vanish between two SELECTs. The read view provides that without locking.`,
            r`-- READ COMMITTED creates a fresh read view for EVERY statement
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT bal FROM acct WHERE id = 1;           -- 100
-- other session commits: UPDATE acct SET bal = 150 WHERE id = 1;
SELECT bal FROM acct WHERE id = 1;           -- new statement, new read view
COMMIT;

-- OUTPUT:
-- first : 100
-- second: 150      <- non-repeatable read is allowed at READ COMMITTED`],
        [`Reporting transactions use REPEATABLE READ for stable results; high-throughput OLTP often picks READ COMMITTED to hold fewer gap locks and shorter-lived versions. Consistent snapshot is explicit with WITH CONSISTENT SNAPSHOT.`,
            r`-- REPEATABLE READ: second read in the same transaction is the same snapshot
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
START TRANSACTION;
SELECT bal FROM acct WHERE id = 1;           -- 100, read view created
-- other session commits bal = 150
SELECT bal FROM acct WHERE id = 1;           -- still 100
COMMIT;
SELECT bal FROM acct WHERE id = 1;           -- new transaction, new snapshot

-- OUTPUT:
-- 100
-- 100
-- 150`],
        [`<b>Advantages:</b> stable results, no locks taken, and cheap: no copying of data, only version lookups through undo.`,
            r`-- A plain SELECT sets no row locks: confirm no lock entries for this transaction
SELECT COUNT(*) AS my_locks FROM performance_schema.data_locks
WHERE ENGINE_TRANSACTION_ID = (SELECT trx_id FROM information_schema.INNODB_TRX
                               WHERE trx_mysql_thread_id = CONNECTION_ID());

-- OUTPUT (example):
-- +----------+
-- | my_locks |
-- +----------+
-- |        0 |
-- +----------+`],
        [`<b>Disadvantages:</b> a stale snapshot can mislead logic (read then write based on old data), and the surprise "lost update" or write-skew appears when you compute in the app from snapshot values.`,
            r`-- Snapshot says 100, but UPDATE operates on the latest committed value
-- Session A: START TRANSACTION; SELECT bal ... -> 100
-- Session B: UPDATE acct SET bal = bal + 50 WHERE id = 1; COMMIT;   (now 150)
-- Session A:
UPDATE acct SET bal = bal + 10 WHERE id = 1;     -- applies to 150, not 100
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT:
-- +------+
-- | bal  |
-- +------+
-- |  160 |      A now sees its own write on top of the latest value
-- +------+`],
        [`<b>Limitations:</b> a read view only affects consistent reads; the read view of REPEATABLE READ starts at the first read, not at BEGIN; and DDL such as ALTER TABLE is not versioned, so a snapshot cannot read through it.`,
            r`-- After another session changes the table structure, the old snapshot is invalidated
-- Session A: START TRANSACTION; SELECT * FROM acct;
-- Session B: ALTER TABLE acct ADD COLUMN note VARCHAR(10);
-- Session A:
SELECT * FROM acct;

-- OUTPUT:
-- ERROR 1412 (HY000): Table definition has changed, please retry transaction`],
        `
   REPEATABLE READ                         READ COMMITTED
   BEGIN ──► 1st SELECT ─┐                 BEGIN ──► SELECT ─► [view 1]
                         ▼                          SELECT ─► [view 2]
                    [ one read view ]               SELECT ─► [view 3]
   all later SELECTs reuse it               each statement sees newest commits
`,
        `Pick the isolation level per workload: REPEATABLE READ (default) for consistent multi-statement reads, READ COMMITTED for lower lock footprint and fresher data in OLTP. Never assume a read-then-write is safe: use SELECT ... FOR UPDATE or an atomic UPDATE for read-modify-write logic.`
    ),

    'Undo Logs & Transaction IDs': dd(
        [`Every InnoDB row has hidden columns: <code>DB_TRX_ID</code> (id of the transaction that last changed it) and <code>DB_ROLL_PTR</code> (pointer to the undo record holding the previous version). Undo logs chain these versions together. Each read-write transaction gets an increasing transaction id.`,
            r`-- See your own transaction id (assigned when a transaction first writes)
START TRANSACTION;
INSERT INTO acct VALUES (5, 500);
SELECT trx_id, trx_state, trx_rows_modified
FROM information_schema.INNODB_TRX WHERE trx_mysql_thread_id = CONNECTION_ID();

-- OUTPUT (example):
-- +--------+-----------+-------------------+
-- | trx_id | trx_state | trx_rows_modified |
-- +--------+-----------+-------------------+
-- | 105233 | RUNNING   |                 1 |
-- +--------+-----------+-------------------+`],
        [`To give readers old versions and to roll back, InnoDB must remember what each row looked like before. Undo records are that memory, and transaction ids tell the engine which version belongs to whom.`,
            r`-- Undo tablespaces hold the undo logs (MySQL 8: separate undo_001, undo_002 files)
SELECT NAME, FILE_SIZE / 1024 / 1024 AS mb, STATE
FROM information_schema.INNODB_TABLESPACES WHERE NAME LIKE 'innodb_undo%';

-- OUTPUT (example):
-- +-----------------+------+--------+
-- | NAME            | mb   | STATE  |
-- +-----------------+------+--------+
-- | innodb_undo_001 | 16.0 | active |
-- | innodb_undo_002 | 16.0 | active |
-- +-----------------+------+--------+`],
        [`Background <b>purge threads</b> delete undo records and physically remove delete-marked rows once no active read view can need them. Undo space can shrink automatically when truncation is enabled.`,
            r`# my.cnf settings controlling undo
[mysqld]
innodb_undo_log_truncate = ON      # shrink undo tablespaces after purge
innodb_max_undo_log_size = 1G      # threshold that triggers truncation
innodb_purge_threads     = 4       # parallel purge workers

# OUTPUT:
# SELECT @@innodb_undo_log_truncate;  -> 1`],
        [`<b>Advantages:</b> cheap rollback, version chain gives readers old data with no copying at read time, and undo doubles as input for crash recovery of uncommitted transactions.`,
            r`-- Rollback relies on undo: 1 million row change reverted by walking undo records
START TRANSACTION;
UPDATE acct SET bal = bal + 1;               -- writes undo for every row
ROLLBACK;
SELECT SUM(bal) FROM acct;

-- OUTPUT (example):
-- +----------+
-- | SUM(bal) |
-- +----------+
-- |      650 |
-- +----------+   unchanged`],
        [`<b>Disadvantages:</b> huge updates create huge undo and take long to roll back (rolling back is often slower than the original change); long read views block purge; secondary-index lookups of old versions are costlier.`,
            r`-- Find the oldest transaction that is pinning undo
SELECT trx_id, trx_started, trx_mysql_thread_id
FROM information_schema.INNODB_TRX ORDER BY trx_started LIMIT 1;

-- OUTPUT (example):
-- +--------+---------------------+---------------------+
-- | trx_id | trx_started         | trx_mysql_thread_id |
-- +--------+---------------------+---------------------+
-- | 99871  | 2026-10-05 22:14:03 |                 311 |   <- open for 10+ hours
-- +--------+---------------------+---------------------+`],
        [`<b>Limitations:</b> transaction ids are 48-bit and shared across the instance, read-only transactions (autocommit SELECTs) get no id until they write, and the number of concurrent write transactions is bounded by rollback segments (128 per undo tablespace).`,
            r`-- Kill the offender after confirming it is idle
KILL 311;

-- OUTPUT:
-- Query OK, 0 rows affected
-- (purge can now reclaim undo up to the newest read view)`],
        `
   Clustered index record for id=1:
   ┌────────┬──────────────┬───────────────────┬───────┐
   │ id = 1 │ DB_TRX_ID=105│ DB_ROLL_PTR ──┐   │ bal   │
   └────────┴──────────────┴───────────────┼───┴───────┘
                                           ▼
        UNDO: (trx 98, bal=120) ──► (trx 90, bal=100) ──► (insert marker)
   purge thread removes undo older than the oldest live read view
`,
        `Treat undo as a shared resource: keep transactions short, batch big updates in chunks (for example 5,000 rows per transaction), and enable undo truncation. Alert on history list length and the age of the oldest transaction, since a single idle connection can quietly degrade the whole instance.`
    ),

    'Visibility Rules & Snapshot Isolation': dd(
        [`When a read view is created InnoDB records <code>up_limit_id</code> (lowest active trx id), <code>low_limit_id</code> (next id to be assigned) and the list of active ids. A row version with <code>DB_TRX_ID</code> below the low limit and not in the active list was committed before the snapshot and is visible; otherwise follow the undo chain to an older version. This gives snapshot-style isolation for reads.`,
            r`-- Rules for row version with trx id T and a read view (creator C):
--   T == C                          -> visible (my own change)
--   T <  up_limit_id                -> visible (committed before every active trx)
--   T >= low_limit_id               -> NOT visible (started after the snapshot)
--   up_limit_id <= T < low_limit_id -> visible only if T is NOT in the active list

-- OUTPUT (example for read view: up=101, low=106, active={101,103}):
--   T=99  visible   | T=102 visible (committed) | T=103 not visible (active) | T=107 not visible`],
        [`Without clear visibility rules two readers could disagree about which rows exist. Deterministic rules make every transaction see a coherent state that matches some point in time.`,
            r`-- Phantom prevention demo at REPEATABLE READ: consistent read does not see new rows
-- Session A: START TRANSACTION; SELECT COUNT(*) FROM acct;      -- 1
-- Session B: INSERT INTO acct VALUES (9, 90); COMMIT;
-- Session A:
SELECT COUNT(*) AS cnt FROM acct;                                -- still snapshot

-- OUTPUT:
-- +-----+
-- | cnt |
-- +-----+
-- |   1 |
-- +-----+`],
        [`The isolation levels map to read view timing: READ COMMITTED builds a view per statement; REPEATABLE READ builds one per transaction; SERIALIZABLE turns plain SELECTs into shared-lock reads; READ UNCOMMITTED reads latest versions without visibility checks.`,
            r`-- Set isolation for the next transaction only, then inspect it
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT @@transaction_isolation AS iso;
COMMIT;

-- OUTPUT:
-- +----------------+
-- | iso            |
-- +----------------+
-- | READ-COMMITTED |
-- +----------------+`],
        [`<b>Advantages:</b> consistent, lock-free reads that match a point in time; no dirty reads; repeatable reads without range locks for plain SELECTs.`,
            r`-- Dirty read is impossible at the default level
-- Session B: START TRANSACTION; UPDATE acct SET bal = 777 WHERE id = 1;   (uncommitted)
-- Session A (REPEATABLE READ or READ COMMITTED):
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT:
-- +------+
-- | bal  |
-- +------+
-- |  100 |       B's uncommitted 777 is invisible
-- +------+`],
        [`<b>Disadvantages:</b> InnoDB REPEATABLE READ is not full snapshot isolation for writes: a transaction can modify rows committed after its snapshot (it sees them when it writes), producing write skew and surprising phantoms through locking reads.`,
            r`-- Phantom through a mix of snapshot read and locking read at REPEATABLE READ
-- Session A: START TRANSACTION; SELECT COUNT(*) FROM acct;               -- 1 (snapshot)
-- Session B: INSERT INTO acct VALUES (9, 90); COMMIT;
-- Session A:
SELECT COUNT(*) FROM acct FOR UPDATE;                                     -- locking read: latest data

-- OUTPUT:
-- +----------+
-- | COUNT(*) |
-- +----------+
-- |        2 |    <- the row appeared, snapshot and locking reads disagree
-- +----------+`],
        [`<b>Limitations:</b> visibility is per row version, so it cannot protect invariants spanning rows (for example "at least one doctor on call"); that requires locking reads, SERIALIZABLE, or constraints. Secondary-index entries carry only max trx id per page, so some old-version checks need a clustered-index lookup.`,
            r`-- Enforce a cross-row invariant with explicit locking, not with snapshot reads
START TRANSACTION;
SELECT COUNT(*) FROM doctors WHERE on_call = 1 FOR UPDATE;   -- locks the matching range
UPDATE doctors SET on_call = 0 WHERE id = 7;
COMMIT;

-- OUTPUT:
-- Query OK (a concurrent second transaction would block here, preventing write skew)`],
        `
   read view: up_limit=101  low_limit=106  active={101,103}
   trx id:   ...99 ─ 100 ─ 101 ─ 102 ─ 103 ─ 104 ─ 105 │ 106 ─ 107 ...
   status:   visible ───────────┤ per active list ├────│ not visible (future)
                                 101 hidden, 102 visible, 103 hidden, 104 visible
   not visible? ─► follow DB_ROLL_PTR into undo ─► test the older version again
`,
        `Know which guarantees you actually have: InnoDB gives snapshot reads plus gap and next-key locking for locking reads, which is not the same as serializable. For invariants across rows, use SELECT ... FOR UPDATE, unique constraints or SERIALIZABLE, and keep isolation level and retry-on-deadlock logic part of the application design.`
    )
};
