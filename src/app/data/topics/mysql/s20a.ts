// Module 20 (Transaction Isolation Levels).
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s20a: Record<string, DeepDive> = {
    'READ UNCOMMITTED': dd(
        [`The weakest isolation level: a transaction can read rows that other transactions have changed but not yet committed (<b>dirty reads</b>). InnoDB does no consistent-snapshot reads at this level; it simply reads the latest version of each row.`,
            r`CREATE TABLE acct (id INT PRIMARY KEY, bal INT) ENGINE=InnoDB;
INSERT INTO acct VALUES (1,100);

-- Session A:
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
START TRANSACTION;
SELECT bal FROM acct WHERE id = 1;       -- reads whatever is physically there now

-- OUTPUT:
-- +------+
-- |  100 |
-- +------+`],
        [`It exists for maximum read concurrency and speed when slightly wrong data is acceptable (rough counters, monitoring). It avoids creating read views, but gives up correctness guarantees.`,
            r`-- Session B (separate connection) changes a row but has not committed.
START TRANSACTION;
UPDATE acct SET bal = 0 WHERE id = 1;     -- NOT committed

-- Session A (READ UNCOMMITTED) reads again:
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT (Session A):
-- +------+
-- |    0 |      <- dirty read of B's uncommitted value
-- +------+`],
        [`Real use: almost never in production. Occasionally for approximate dashboards over append-only data, or ad hoc monitoring where blocking is worse than inaccuracy.`,
            r`-- Per-statement alternative to lowering the whole session level: none in MySQL (no NOLOCK hint).
-- Set only for one transaction:
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;   -- applies to the NEXT transaction only
START TRANSACTION;
SELECT COUNT(*) AS approx_rows FROM acct;
COMMIT;

-- OUTPUT:
-- +-------------+
-- | approx_rows |
-- +-------------+
-- |           1 |
-- +-------------+`],
        [`<b>Advantages:</b> no read locks and no snapshot overhead for plain SELECTs; readers are never blocked by writers.`,
            r`SELECT @@transaction_isolation;

-- OUTPUT (session set above):
-- +-------------------------+
-- | @@transaction_isolation |
-- +-------------------------+
-- | READ-UNCOMMITTED        |
-- +-------------------------+`],
        [`<b>Disadvantages:</b> dirty reads: you can act on data that is later rolled back; also non-repeatable reads and phantoms. Results may be inconsistent within a single query (half of a multi-row update visible).`,
            r`-- B rolls back after A already used the value.
-- Session B:
ROLLBACK;

-- Session A:
SELECT bal FROM acct WHERE id = 1;     -- earlier saw 0, a value that never officially existed

-- OUTPUT (Session A):
-- +------+
-- |  100 |      <- A earlier made decisions on "0"
-- +------+`],
        [`<b>Limitations:</b> writes (UPDATE, DELETE, SELECT ... FOR UPDATE) still take locks, so only plain reads are affected; statement-based binary logging is not allowed at this level in some configurations, because it can be unsafe for replication (use ROW format).`,
            r`-- READ UNCOMMITTED with binlog_format=STATEMENT is rejected for InnoDB writes:
SET SESSION binlog_format = 'STATEMENT';
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
UPDATE acct SET bal = bal + 1 WHERE id = 1;

-- OUTPUT:
-- ERROR 1665 (HY000): Cannot execute statement: impossible to write to binary log since
--   BINLOG_FORMAT = STATEMENT and at least one table uses a storage engine limited to row-based logging.`],
        `
   Tx B: UPDATE bal=0 ......(uncommitted)......... ROLLBACK
                |
   Tx A:        +--> SELECT bal  => 0   (DIRTY: B never committed)
`,
        `Avoid READ UNCOMMITTED for anything that drives business decisions. If reader/writer blocking is the problem, MVCC at READ COMMITTED already gives non-blocking reads without dirty data. Consider read replicas for heavy analytics instead.`
    ),

    'READ COMMITTED': dd(
        [`At <b>READ COMMITTED</b> each statement sees only data committed before that <i>statement</i> started. Dirty reads are gone, but two identical SELECTs in the same transaction can return different results (non-repeatable reads) because each statement gets a fresh snapshot.`,
            r`CREATE TABLE price (id INT PRIMARY KEY, p INT) ENGINE=InnoDB;
INSERT INTO price VALUES (1,100);

SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT p FROM price WHERE id = 1;       -- snapshot #1

-- OUTPUT:
-- +------+
-- |  100 |
-- +------+`],
        [`It is the default in PostgreSQL, Oracle and SQL Server, and a popular choice for MySQL OLTP because it takes fewer locks (no gap locks for most statements) and reduces deadlocks while avoiding dirty data.`,
            r`-- Session B commits a change between A's two reads.
-- Session B:  UPDATE price SET p = 120 WHERE id = 1;  (autocommit)

-- Session A (still in its transaction):
SELECT p FROM price WHERE id = 1;       -- new statement, new snapshot

-- OUTPUT (Session A):
-- +------+
-- |  120 |     <- differs from the first read in the same transaction
-- +------+`],
        [`Real use: high-concurrency web OLTP, systems migrating from Oracle/PostgreSQL, workloads suffering gap-lock deadlocks under REPEATABLE READ. Requires binlog_format=ROW.`,
            r`SET GLOBAL TRANSACTION ISOLATION LEVEL READ COMMITTED;   -- new connections
SET GLOBAL binlog_format = 'ROW';                          -- required for safe replication
SELECT @@global.transaction_isolation AS iso;

-- OUTPUT:
-- +------------------+
-- | iso              |
-- +------------------+
-- | READ-COMMITTED   |
-- +------------------+`],
        [`<b>Advantages:</b> no dirty reads, short-lived locks (rows examined but not matched are unlocked right away), gap locking disabled for searches and index scans, fewer deadlocks, semi-consistent reads on UPDATE.`,
            r`-- Under READ COMMITTED, a range UPDATE does not block inserts into the gap.
-- Session A:  START TRANSACTION; UPDATE price SET p = p WHERE id BETWEEN 1 AND 10;
-- Session B:  INSERT INTO price VALUES (5, 50);     -- succeeds immediately (no gap lock)

-- OUTPUT (Session B):
-- Query OK, 1 row affected`],
        [`<b>Disadvantages:</b> non-repeatable reads and phantoms; a report running several queries may see inconsistent totals; each statement builds a new read view (small cost).`,
            r`-- Inconsistent totals inside one transaction.
START TRANSACTION;
SELECT SUM(p) AS s1 FROM price;     -- e.g. 170
-- (other session inserts and commits a row of 30)
SELECT SUM(p) AS s2 FROM price;     -- e.g. 200
COMMIT;

-- OUTPUT (example):
-- s1 = 170, s2 = 200     <- phantom row appeared between statements`],
        [`<b>Limitations:</b> binary logging must be ROW format; statement-based replication is unsafe here. It does not stop lost updates by itself: read-modify-write needs FOR UPDATE or atomic UPDATE.`,
            r`SET SESSION binlog_format = 'STATEMENT';
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
UPDATE price SET p = p + 1 WHERE id = 1;

-- OUTPUT:
-- ERROR 1665 (HY000): Cannot execute statement: impossible to write to binary log since
--   BINLOG_FORMAT = STATEMENT and at least one table uses a storage engine limited to row-based logging.
--   InnoDB is limited to row-logging when transaction isolation level is READ COMMITTED or READ UNCOMMITTED.`],
        `
   Tx A:  BEGIN
          SELECT p --> 100   (snapshot at stmt start)
                               Tx B: UPDATE p=120; COMMIT
          SELECT p --> 120   (NEW snapshot: non-repeatable read)
          COMMIT
`,
        `READ COMMITTED is a pragmatic OLTP default when you want fewer locks and deadlocks and your code tolerates non-repeatable reads. Use explicit FOR UPDATE or optimistic version columns for read-modify-write, and run consistent reports on a replica or inside REPEATABLE READ snapshots.`
    ),

    'REPEATABLE READ': dd(
        [`<b>REPEATABLE READ</b> is InnoDB's default. The first consistent read in a transaction creates a snapshot (read view); all later plain SELECTs in that transaction see the same data even if others commit changes. InnoDB also uses next-key locks to prevent most phantoms for locking reads.`,
            r`CREATE TABLE price (id INT PRIMARY KEY, p INT) ENGINE=InnoDB;
INSERT INTO price VALUES (1,100);

SELECT @@transaction_isolation;           -- default level

-- OUTPUT:
-- +-------------------------+
-- | @@transaction_isolation |
-- +-------------------------+
-- | REPEATABLE-READ         |
-- +-------------------------+`],
        [`Many business operations (reports, multi-step calculations) need to see a stable view of the data. Repeatable read gives that without blocking writers, thanks to MVCC and undo-log version chains.`,
            r`-- Session A:
START TRANSACTION;
SELECT p FROM price WHERE id = 1;       -- snapshot taken here: 100

-- Session B:  UPDATE price SET p = 150 WHERE id = 1;  (autocommit, committed)

-- Session A:
SELECT p FROM price WHERE id = 1;       -- still the snapshot

-- OUTPUT (Session A, second read):
-- +------+
-- |  100 |
-- +------+`],
        [`Real use: default for most MySQL OLTP, consistent backups (mysqldump --single-transaction relies on it), reports. Caution: the snapshot is only for plain reads; UPDATE and locking reads see the latest committed data.`,
            r`-- Locking reads / writes ignore the snapshot and use "current read".
-- Session A (same transaction as above):
SELECT p FROM price WHERE id = 1 FOR UPDATE;     -- current read: sees 150

UPDATE price SET p = p + 1 WHERE id = 1;          -- operates on 150, not 100

-- OUTPUT:
-- +------+
-- |  150 |
-- +------+`],
        [`<b>Advantages:</b> consistent snapshot for the whole transaction, no dirty or non-repeatable reads, next-key locking protects range queries from phantoms, readers do not block writers.`,
            r`-- Phantoms are hidden from plain reads in the same snapshot.
-- Session A:  START TRANSACTION; SELECT COUNT(*) FROM price;   -- 1
-- Session B:  INSERT INTO price VALUES (2, 10);  COMMIT;
-- Session A:  SELECT COUNT(*) FROM price;                       -- still 1

-- OUTPUT (Session A, second read):
-- +----------+
-- | COUNT(*) |
-- +----------+
-- |        1 |
-- +----------+`],
        [`<b>Disadvantages:</b> gap and next-key locks block inserts into ranges and raise deadlock risk; long transactions keep old undo versions alive; mixing snapshot reads and current reads gives surprising results.`,
            r`-- Gap lock on a range blocks another session's insert.
-- Session A:  START TRANSACTION; SELECT * FROM price WHERE id BETWEEN 10 AND 20 FOR UPDATE;
-- Session B:  INSERT INTO price VALUES (15, 1);      -- waits...

-- OUTPUT (Session B, after innodb_lock_wait_timeout = 50s):
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction`],
        [`<b>Limitations:</b> the snapshot is established at the first consistent read, not at BEGIN (use WITH CONSISTENT SNAPSHOT for explicit start); phantoms can still appear when you mix a current read after a snapshot read; it does not prevent lost updates for read-modify-write done in application code.`,
            r`-- Snapshot started by the first read, or explicitly:
START TRANSACTION WITH CONSISTENT SNAPSHOT;
-- Phantom via current read: UPDATE touches a row the snapshot cannot see, then it becomes visible.
-- Session B: INSERT INTO price VALUES (3, 5); COMMIT;
UPDATE price SET p = p WHERE id = 3;     -- modifies the row (current read)
SELECT p FROM price WHERE id = 3;        -- now visible to this transaction

-- OUTPUT:
-- +------+
-- |    5 |
-- +------+`],
        `
   Tx A:  BEGIN
          SELECT -> snapshot S0 -----------------------------+
          ...                          Tx B: UPDATE; COMMIT   |
          SELECT -> still reads S0 (via undo version chain) <-+
          UPDATE / FOR UPDATE -> current read (latest committed)
`,
        `Stay on REPEATABLE READ unless gap-lock deadlocks or contention hurt you. Keep transactions short so undo history (see history list length) stays small, always add retry logic for deadlocks, and use FOR UPDATE or SERIALIZABLE-like patterns where the invariant spans several rows.`
    ),

    'SERIALIZABLE': dd(
        [`<b>SERIALIZABLE</b> is the strictest level. In InnoDB it behaves like REPEATABLE READ but converts every plain SELECT into <code>SELECT ... FOR SHARE</code> (when autocommit is off), so readers take shared next-key locks and writers cannot sneak in.`,
            r`CREATE TABLE seat (id INT PRIMARY KEY, taken TINYINT) ENGINE=InnoDB;
INSERT INTO seat VALUES (1,0),(2,0);

SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;
SELECT taken FROM seat WHERE id = 1;     -- implicitly takes a shared lock on the row

-- OUTPUT:
-- +-------+
-- |     0 |
-- +-------+`],
        [`Some invariants span many rows (no overlapping bookings, sum constraints). Serializable makes transactions behave as if they ran one at a time, so such logic is correct without extra locking code.`,
            r`-- Another session trying to modify the row we read must wait.
-- Session B:
UPDATE seat SET taken = 1 WHERE id = 1;     -- blocks until A commits/rolls back

-- OUTPUT (Session B, if A is still open):
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction`],
        [`Real use: financial invariants, small critical sections, audits. Rarely the global setting; usually set per transaction for a specific operation.`,
            r`-- Use it surgically for one transaction.
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;   -- affects only the next transaction
START TRANSACTION;
SELECT COUNT(*) AS free FROM seat WHERE taken = 0;    -- range read: shared next-key locks
UPDATE seat SET taken = 1 WHERE id = 2;
COMMIT;

-- OUTPUT:
-- +------+
-- | free |
-- +------+
-- |    2 |
-- +------+`],
        [`<b>Advantages:</b> no dirty reads, non-repeatable reads or phantoms; simplest correctness reasoning; protects against write skew-style anomalies by blocking.`,
            r`SELECT @@transaction_isolation;

-- OUTPUT (inside the session set above):
-- +-------------------------+
-- | SERIALIZABLE            |
-- +-------------------------+`],
        [`<b>Disadvantages:</b> heavy locking: readers block writers and vice versa, throughput drops, and deadlocks become frequent (two sessions each holding a shared lock then trying to update the same row).`,
            r`-- Classic deadlock: both take shared locks, then both try to upgrade.
-- A: SELECT * FROM seat WHERE id = 1;        B: SELECT * FROM seat WHERE id = 1;
-- A: UPDATE seat SET taken=1 WHERE id=1;     (waits for B's S lock)
-- B: UPDATE seat SET taken=1 WHERE id=1;     (waits for A's S lock) -> deadlock

-- OUTPUT (victim session):
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction`],
        [`<b>Limitations:</b> with autocommit=1 a plain SELECT is not locked (it is a consistent non-locking read in its own transaction); InnoDB's version is lock-based, not SSI like PostgreSQL, so there is no serialisation-failure retry model, only lock waits and deadlocks.`,
            r`SET autocommit = 1;
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT * FROM seat;          -- single statement: plain consistent read, no shared lock

-- OUTPUT:
-- +----+-------+
-- | id | taken |
-- +----+-------+
-- |  1 |     0 |
-- |  2 |     0 |
-- +----+-------+`],
        `
   isolation   dirty  non-rep  phantom(plain/locking)  locking
   ----------- -----  -------  ----------------------  --------------
   READ UNCOMM  yes     yes      yes                    none for reads
   READ COMM    no      yes      yes                    record only
   REPEAT READ  no      no       mostly no (next-key)   next-key
   SERIALIZABLE no      no       no                     S next-key on reads
`,
        `Use SERIALIZABLE only for small, well-understood critical sections; for most invariants a unique constraint, a single atomic UPDATE, or SELECT ... FOR UPDATE on a guard row is cheaper. If you adopt it, budget for retries on deadlock and measure throughput under load.`
    ),

    'Dirty, Non-Repeatable & Phantom Reads': dd(
        [`Three classic anomalies. <b>Dirty read</b>: reading another transaction's uncommitted change. <b>Non-repeatable read</b>: re-reading the same row gives a different value because someone committed an UPDATE. <b>Phantom read</b>: re-running a range query returns extra (or fewer) rows because someone committed an INSERT/DELETE.`,
            r`CREATE TABLE acct (id INT PRIMARY KEY, bal INT, owner VARCHAR(5)) ENGINE=InnoDB;
INSERT INTO acct VALUES (1,100,'amy'),(2,200,'bob');

-- Summary of what each level prevents in MySQL/InnoDB:
SELECT 'READ UNCOMMITTED' AS lvl, 'dirty yes' AS dirty, 'non-rep yes' AS nonrep, 'phantom yes' AS phantom
UNION ALL SELECT 'READ COMMITTED', 'dirty no', 'non-rep yes', 'phantom yes'
UNION ALL SELECT 'REPEATABLE READ', 'dirty no', 'non-rep no', 'phantom mostly no'
UNION ALL SELECT 'SERIALIZABLE', 'dirty no', 'non-rep no', 'phantom no';

-- OUTPUT:
-- +------------------+-----------+-------------+-------------------+
-- | lvl              | dirty     | nonrep      | phantom           |
-- +------------------+-----------+-------------+-------------------+
-- | READ UNCOMMITTED | dirty yes | non-rep yes | phantom yes       |
-- | READ COMMITTED   | dirty no  | non-rep yes | phantom yes       |
-- | REPEATABLE READ  | dirty no  | non-rep no  | phantom mostly no |
-- | SERIALIZABLE     | dirty no  | non-rep no  | phantom no        |
-- +------------------+-----------+-------------+-------------------+`],
        [`Knowing the anomaly vocabulary lets you choose the cheapest isolation level that is still correct, and diagnose "impossible" bugs such as totals that do not add up or balances that jump during a report.`,
            r`-- Non-repeatable read (READ COMMITTED):
-- A: BEGIN; SELECT bal FROM acct WHERE id=1;            -> 100
-- B: UPDATE acct SET bal=90 WHERE id=1; COMMIT;
-- A: SELECT bal FROM acct WHERE id=1;                   -> 90   (same row, new value)

-- OUTPUT:
-- first read : 100
-- second read:  90`],
        [`Real bugs: reports whose parts disagree (phantoms), "check then act" logic that sees stale rows, and dirty reads of rolled-back orders in fulfilment systems.`,
            r`-- Phantom (READ COMMITTED): the range count changes inside one transaction.
-- A: BEGIN; SELECT COUNT(*) FROM acct WHERE bal > 50;   -> 2
-- B: INSERT INTO acct VALUES (3, 300, 'cy'); COMMIT;
-- A: SELECT COUNT(*) FROM acct WHERE bal > 50;          -> 3  (phantom row)

-- OUTPUT:
-- first count : 2
-- second count: 3`],
        [`<b>Advantages of knowing them:</b> you can map each anomaly to a prevention tool: dirty reads -> use READ COMMITTED+, non-repeatable -> REPEATABLE READ snapshot, phantoms -> next-key locks or SERIALIZABLE.`,
            r`-- REPEATABLE READ hides the phantom from plain SELECTs but a current read reveals it.
-- A: BEGIN; SELECT COUNT(*) FROM acct;                  -> 3  (snapshot)
-- B: INSERT INTO acct VALUES (4, 10, 'di'); COMMIT;
-- A: SELECT COUNT(*) FROM acct;                         -> 3  (hidden)
-- A: SELECT COUNT(*) FROM acct FOR UPDATE;              -> 4  (locking read sees it)

-- OUTPUT:
-- 3, 3, 4`],
        [`<b>Disadvantages:</b> the strictest fixes cost concurrency, and some anomalies (lost update, write skew) are not in the classic three, so a correct level does not guarantee a correct application.`,
            r`-- Write skew under REPEATABLE READ: two doctors both go off-call.
-- A: SELECT COUNT(*) FROM oncall WHERE on_duty=1;  -> 2    B: same -> 2
-- A: UPDATE oncall SET on_duty=0 WHERE doc='x';    B: UPDATE oncall SET on_duty=0 WHERE doc='y';
-- both commit -> zero doctors on call, rule broken

-- OUTPUT:
-- on_duty count after both commit: 0`],
        [`<b>Limitations:</b> the SQL standard defines levels by these three anomalies only, but InnoDB's actual behaviour differs (REPEATABLE READ prevents most phantoms; READ UNCOMMITTED still locks writes). Always test on the engine you run.`,
            r`SELECT @@transaction_isolation AS current_level, @@global.transaction_isolation AS global_level;

-- OUTPUT:
-- +-----------------+-----------------+
-- | current_level   | global_level    |
-- +-----------------+-----------------+
-- | REPEATABLE-READ | REPEATABLE-READ |
-- +-----------------+-----------------+`],
        `
   DIRTY          A reads B's UNCOMMITTED write   (B later rolls back)
   NON-REPEATABLE A reads row, B UPDATE+COMMIT, A reads row again -> value changed
   PHANTOM        A reads range, B INSERT+COMMIT, A reads range again -> extra row

   level:  RU   RC   RR   SER
   dirty    Y    N    N    N
   nonrep   Y    Y    N    N
   phantom  Y    Y    ~N   N
`,
        `Pick isolation per invariant: the guarantee you need is about business rules (no overbooking, no negative balance), not anomaly names. Encode rules in constraints and atomic statements first, then add FOR UPDATE or stricter isolation only where a multi-row invariant remains.`
    ),

    'Lost Update': dd(
        [`A <b>lost update</b> happens when two transactions read the same value, each computes a new value in the application, and both write: the second write overwrites the first, so one update vanishes. It is a read-modify-write race, not covered by the classic three anomalies.`,
            r`CREATE TABLE counter (id INT PRIMARY KEY, n INT, ver INT DEFAULT 0) ENGINE=InnoDB;
INSERT INTO counter VALUES (1, 10, 0);

-- A: SELECT n FROM counter WHERE id=1;            -> 10
-- B: SELECT n FROM counter WHERE id=1;            -> 10
-- A: UPDATE counter SET n = 10 + 1 WHERE id=1;    -- app computed 11
-- B: UPDATE counter SET n = 10 + 5 WHERE id=1;    -- app computed 15, overwrites A
SELECT n FROM counter WHERE id = 1;

-- OUTPUT:
-- +------+
-- |   15 |      <- A's +1 was lost (correct total: 16)
-- +------+`],
        [`Counters, stock levels, balances and edited documents are all read-modify-write. If correctness matters you must stop the race; neither READ COMMITTED nor REPEATABLE READ snapshots alone prevent it when the arithmetic is done in the app.`,
            r`-- Fix 1: atomic UPDATE - the database reads and writes under one row lock.
UPDATE counter SET n = n + 1 WHERE id = 1;
UPDATE counter SET n = n + 5 WHERE id = 1;
SELECT n FROM counter WHERE id = 1;

-- OUTPUT:
-- +------+
-- |   21 |      <- 15 + 1 + 5, nothing lost
-- +------+`],
        [`Real use: pessimistic locking with SELECT ... FOR UPDATE for short critical sections, optimistic locking with a version column for user-edited records (HTTP forms, ORMs like JPA @Version).`,
            r`-- Fix 2: pessimistic lock - the second session waits for the first to finish.
START TRANSACTION;
SELECT n FROM counter WHERE id = 1 FOR UPDATE;     -- takes an exclusive row lock
UPDATE counter SET n = 21 + 1 WHERE id = 1;        -- app-computed value is now safe
COMMIT;

-- OUTPUT:
-- +------+
-- |   21 |
-- +------+
-- Query OK, 1 row affected`],
        [`<b>Advantages of the fixes:</b> atomic updates are simplest and fastest; FOR UPDATE gives full control; optimistic versioning scales well with rare conflicts and holds no locks while a user thinks.`,
            r`-- Fix 3: optimistic locking with a version column.
UPDATE counter SET n = 30, ver = ver + 1 WHERE id = 1 AND ver = 0;   -- ver we read earlier
SELECT ROW_COUNT() AS rows_changed;                                    -- 0 means someone else won

-- OUTPUT (success path):
-- +--------------+
-- | rows_changed |
-- +--------------+
-- |            1 |
-- +--------------+`],
        [`<b>Disadvantages:</b> pessimistic locks reduce concurrency and can deadlock; optimistic updates require the application to detect zero affected rows and retry or report a conflict.`,
            r`-- Optimistic conflict: stale version, nothing updated.
UPDATE counter SET n = 99, ver = ver + 1 WHERE id = 1 AND ver = 0;   -- ver is already 1
SELECT ROW_COUNT() AS rows_changed;

-- OUTPUT:
-- +--------------+
-- | rows_changed |
-- +--------------+
-- |            0 |      <- app must re-read and retry
-- +--------------+`],
        [`<b>Limitations:</b> MySQL does not raise "could not serialize" errors at REPEATABLE READ like PostgreSQL: InnoDB lets the second UPDATE proceed on the latest committed row, so detection is your job. Multi-row invariants may need locks on a guard row or SERIALIZABLE.`,
            r`-- Under REPEATABLE READ, the snapshot read is stale but the UPDATE applies to the latest row.
-- A: BEGIN; SELECT n FROM counter WHERE id=1;   -> 21 (snapshot)
-- B: UPDATE counter SET n = 100 WHERE id=1; COMMIT;
-- A: UPDATE counter SET n = 21 + 1 WHERE id=1;  -- silently overwrites B's 100: lost update!
-- A: COMMIT;   -> n = 22

-- OUTPUT:
-- n = 22   (B's change lost; no error is raised)`],
        `
   n=10
   A: read 10 -----------------> write 11 --+
   B: read 10 -----> write 15 --------------+--> final = 11 or 15, expected 16
                                  (one update lost)

   Fixes:  UPDATE n = n + 1   |   SELECT .. FOR UPDATE   |   WHERE ver = :ver
`,
        `Prefer the cheapest correct tool: atomic expression updates first, then optimistic versioning for human-speed edits, then FOR UPDATE for critical sections. Add a retry loop with backoff for deadlocks, and keep read-modify-write transactions as short as possible.`
    ),
};
