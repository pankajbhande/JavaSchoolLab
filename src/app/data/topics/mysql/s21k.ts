// Module 21 (Locks & Concurrency), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s21k: Record<string, DeepDive> = {
    'Shared & Exclusive Locks': dd(
        [`InnoDB has two basic row lock modes. A <b>shared (S) lock</b> lets a transaction read a row and allows other readers to share it; an <b>exclusive (X) lock</b> lets a transaction change or delete a row and blocks every other S or X request on that row. Plain <code>SELECT</code> takes no lock at all (it reads a snapshot).`,
            r`-- Session A takes a shared lock, session B tries to write.
CREATE TABLE acct (id INT PRIMARY KEY, bal INT) ENGINE=InnoDB;
INSERT INTO acct VALUES (1,100),(2,200);

-- Session A
START TRANSACTION;
SELECT bal FROM acct WHERE id = 1 FOR SHARE;      -- S lock on row 1 (MySQL 8 syntax)

-- Session B (while A is still open)
UPDATE acct SET bal = 0 WHERE id = 1;             -- needs X lock -> waits

-- OUTPUT (session B after innodb_lock_wait_timeout = 50s):
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction`],
        [`Without locks two transactions could change the same row at once and one update would be lost, or a transaction could act on data that is about to vanish. The S/X matrix is the minimum rule set that keeps concurrent writers safe while still letting many readers run together.`,
            r`-- Lost update prevented: both sessions do read-modify-write on balance.
-- Session A                                   -- Session B
START TRANSACTION;                             START TRANSACTION;
SELECT bal FROM acct WHERE id=1 FOR UPDATE;   -- B: same SELECT ... FOR UPDATE blocks here
UPDATE acct SET bal = bal - 30 WHERE id=1;
COMMIT;                                        -- B is released, now reads 70, not 100
SELECT bal FROM acct WHERE id=1;

-- OUTPUT (session B after A commits):
-- +------+
-- | bal  |
-- +------+
-- |   70 |
-- +------+`],
        [`Use S locks when you must make sure a parent row is not deleted or changed while you insert a child (InnoDB does this automatically for foreign keys). Use X locks (<code>FOR UPDATE</code>, UPDATE, DELETE) for read-then-write flows such as inventory and balances. Inspect current locks in <code>performance_schema.data_locks</code>.`,
            r`-- See which locks are currently held (MySQL 8).
SELECT object_name, index_name, lock_type, lock_mode, lock_data
FROM performance_schema.data_locks
WHERE object_name = 'acct';

-- OUTPUT (example):
-- +-------------+------------+-----------+---------------+-----------+
-- | object_name | index_name | lock_type | lock_mode     | lock_data |
-- +-------------+------------+-----------+---------------+-----------+
-- | acct        | NULL       | TABLE     | IX            | NULL      |
-- | acct        | PRIMARY    | RECORD    | X,REC_NOT_GAP | 1         |
-- +-------------+------------+-----------+---------------+-----------+`],
        [`<b>Advantages:</b> correctness under concurrency; many readers can share; consistent reads (MVCC) need no locks so reads never block writes in normal SELECTs.`,
            r`-- Compatibility: two S locks coexist, so both FOR SHARE succeed.
-- Session A: START TRANSACTION; SELECT * FROM acct WHERE id=1 FOR SHARE;
-- Session B: START TRANSACTION; SELECT * FROM acct WHERE id=1 FOR SHARE;   -- no wait
-- Plain SELECT in session C is never blocked either:
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT:
-- +------+
-- | bal  |
-- +------+
-- |  100 |
-- +------+`],
        [`<b>Disadvantages:</b> locks are held until COMMIT or ROLLBACK, so long transactions block others; S-then-upgrade-to-X patterns cause deadlocks (two sessions each hold S and both want X).`,
            r`-- Classic upgrade deadlock.
-- A: SELECT * FROM acct WHERE id=1 FOR SHARE;
-- B: SELECT * FROM acct WHERE id=1 FOR SHARE;
-- A: UPDATE acct SET bal=1 WHERE id=1;     -- waits for B's S lock
-- B: UPDATE acct SET bal=2 WHERE id=1;     -- would wait for A -> cycle
SHOW ENGINE INNODB STATUS;                   -- LATEST DETECTED DEADLOCK section

-- OUTPUT (session B):
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction`],
        [`<b>Limitations:</b> locks live only inside a transaction (with autocommit=1 they release immediately); MyISAM has no row locks; lock waiting is bounded by <code>innodb_lock_wait_timeout</code> (default 50 s); locks are on index records, so a missing index widens them.`,
            r`SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';
SET SESSION innodb_lock_wait_timeout = 5;    -- fail fast in this session
SHOW VARIABLES LIKE 'innodb_lock_wait_timeout';

-- OUTPUT:
-- +--------------------------+-------+
-- | Variable_name            | Value |
-- +--------------------------+-------+
-- | innodb_lock_wait_timeout | 50    |   <- first SHOW
-- | innodb_lock_wait_timeout | 5     |   <- second SHOW
-- +--------------------------+-------+`],
        r`Lock compatibility (Y = both can hold it)

              held: S      held: X
  request S :   Y            N
  request X :   N            N

  plain SELECT ----> snapshot (MVCC), no lock
  FOR SHARE    ----> S lock on index records
  UPDATE/FOR UPDATE -> X lock on index records
  table level: IS / IX intention locks announce row locks below`,
        `Prefer MVCC reads and keep X-lock windows tiny: do the lock, change, commit in one short transaction. Avoid S-then-X upgrades; take FOR UPDATE up front. Always retry on error 1213 and 1205 in the application layer.`
    ),

    'Row-Level vs Table Locks': dd(
        [`<b>Row-level locks</b> (InnoDB) lock only the index records a statement touches, so different rows can be changed in parallel. <b>Table locks</b> (<code>LOCK TABLES</code>, MyISAM, DDL metadata locks) lock the whole table and serialize access.`,
            r`-- Row lock: two sessions update different rows at the same time.
-- Session A: START TRANSACTION; UPDATE acct SET bal=bal+1 WHERE id=1;
-- Session B: START TRANSACTION; UPDATE acct SET bal=bal+1 WHERE id=2;   -- no wait
-- Table lock: blocks everyone else
LOCK TABLES acct WRITE;     -- whole table, this session only may use it
UNLOCK TABLES;

-- OUTPUT:
-- Query OK, 1 row affected   (A)
-- Query OK, 1 row affected   (B, runs concurrently)
-- Query OK, 0 rows affected  (LOCK TABLES)`],
        [`Row locks give high write concurrency for OLTP workloads; table locks are simple and cheap, and are needed for backups, maintenance or bulk loads where you want exclusivity. Knowing which one you are getting explains most "why is my query stuck" cases.`,
            r`-- A DDL statement waits for a metadata lock held by an open transaction.
-- A: START TRANSACTION; SELECT * FROM acct;          -- holds shared MDL, never committed
-- B: ALTER TABLE acct ADD COLUMN note VARCHAR(20);   -- waits for MDL
SELECT object_name, lock_type, lock_status
FROM performance_schema.metadata_locks WHERE object_name = 'acct';

-- OUTPUT (example):
-- +-------------+---------------------+-------------+
-- | object_name | lock_type           | lock_status |
-- +-------------+---------------------+-------------+
-- | acct        | SHARED_READ         | GRANTED     |
-- | acct        | EXCLUSIVE           | PENDING     |
-- +-------------+---------------------+-------------+`],
        [`Real use: web checkout updates thousands of different orders concurrently (row locks); nightly <code>mysqldump</code> of MyISAM tables uses table locks; online schema change tools watch metadata locks. Intention locks (IS, IX) sit on the table to let InnoDB check table-level conflicts cheaply.`,
            r`-- Intention lock appears on the table when a row lock is taken.
START TRANSACTION;
UPDATE acct SET bal = bal + 5 WHERE id = 1;
SELECT lock_type, lock_mode FROM performance_schema.data_locks WHERE object_name='acct';
COMMIT;

-- OUTPUT (example):
-- +-----------+---------------+
-- | lock_type | lock_mode     |
-- +-----------+---------------+
-- | TABLE     | IX            |
-- | RECORD    | X,REC_NOT_GAP |
-- +-----------+---------------+`],
        [`<b>Advantages of row locks:</b> parallel writers, small blast radius, rollback of single rows. <b>Table locks:</b> almost no memory, no deadlocks, fast for bulk or read-mostly work.`,
            r`-- Bulk load faster with an explicit table lock on a MyISAM staging table.
CREATE TABLE stage (id INT, v INT) ENGINE=MyISAM;
LOCK TABLES stage WRITE;
INSERT INTO stage VALUES (1,1),(2,2),(3,3);
UNLOCK TABLES;
SELECT COUNT(*) AS n FROM stage;

-- OUTPUT:
-- +---+
-- | n |
-- +---+
-- | 3 |
-- +---+`],
        [`<b>Disadvantages:</b> row locks use more memory and CPU and can deadlock; table locks block all writers (and readers for WRITE) so concurrency collapses; a stray open transaction blocks DDL.`,
            r`-- Without a usable index the UPDATE locks every scanned row (looks like a table lock).
CREATE TABLE tl (id INT PRIMARY KEY, grp INT) ENGINE=InnoDB;   -- no index on grp
START TRANSACTION;
UPDATE tl SET id = id WHERE grp = 3;      -- full scan: X lock on each row scanned
SELECT COUNT(*) AS locked FROM performance_schema.data_locks WHERE object_name='tl' AND lock_type='RECORD';

-- OUTPUT (example, 4 rows in table):
-- +--------+
-- | locked |
-- +--------+
-- |      5 |    <- every row plus supremum record
-- +--------+`],
        [`<b>Limitations:</b> <code>LOCK TABLES</code> is released implicitly by START TRANSACTION and cannot be used inside stored programs the same way; InnoDB table locks via LOCK TABLES do not replace row locks; MyISAM has only table locks and no transactions.`,
            r`LOCK TABLES acct READ;
UPDATE acct SET bal = 1 WHERE id = 1;   -- not allowed under a READ lock
UNLOCK TABLES;

-- OUTPUT:
-- ERROR 1099 (HY000): Table 'acct' was locked with a READ lock and can't be updated`],
        r`  OLTP (InnoDB)                      Maintenance / MyISAM
  +-----+  row 1  X (session A)          +----------------------+
  |tbl  |  row 2  X (session B)  ok      | table  WRITE lock    |
  |     |  row 3  free                   | everyone else waits  |
  +-----+                                +----------------------+
  IX on table + X on records             MDL: DDL vs open transactions

  concurrency:  row lock  >>>  table lock
  overhead   :  row lock  >>>  table lock`,
        `Default to InnoDB row locks and design indexes so statements touch few rows. Treat metadata locks as an operational hazard: set lock_wait_timeout for DDL, kill idle transactions, and use online DDL or gh-ost/pt-osc for big tables.`
    ),

    'Record, Gap & Next-Key Locks': dd(
        [`Under REPEATABLE READ, InnoDB locks more than the rows it finds. A <b>record lock</b> locks one index record. A <b>gap lock</b> locks the open interval between two index records (stopping inserts there). A <b>next-key lock</b> is a record lock plus the gap before it, and is the default range lock.`,
            r`CREATE TABLE gl (id INT PRIMARY KEY, v INT, KEY (v)) ENGINE=InnoDB;
INSERT INTO gl VALUES (1,10),(2,20),(3,30);

START TRANSACTION;
SELECT * FROM gl WHERE v BETWEEN 15 AND 25 FOR UPDATE;   -- locks v=20 record and gaps around it
SELECT index_name, lock_mode, lock_data FROM performance_schema.data_locks WHERE object_name='gl' AND lock_type='RECORD';

-- OUTPUT (example):
-- +------------+-----------+-----------+
-- | index_name | lock_mode | lock_data |
-- +------------+-----------+-----------+
-- | v          | X         | 20, 2     |   <- next-key: (10,20]
-- | v          | X,GAP     | 30, 3     |   <- gap (20,30)
-- | PRIMARY    | X,REC_NOT_GAP | 2     |
-- +------------+-----------+-----------+`],
        [`Gap locks exist to prevent <b>phantom rows</b>: if a range scan could be re-run and see a newly inserted row, repeatable read would be broken. Locking the gap makes the range stable for the transaction.`,
            r`-- Session A locked the range v in (10,30]. Session B tries to insert inside it.
INSERT INTO gl VALUES (4, 25);            -- Session B

-- OUTPUT (after timeout):
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
-- But inserting outside the gap works:
-- INSERT INTO gl VALUES (5, 50);   -> Query OK, 1 row affected`],
        [`Real impact: a "check then insert" job locking a range can freeze unrelated inserts on a busy table, and gap locks are a classic source of surprising deadlocks between two inserters. Unique-index equality lookups on an existing row use only a record lock, avoiding gaps.`,
            r`START TRANSACTION;
SELECT * FROM gl WHERE id = 2 FOR UPDATE;     -- unique index, row exists -> record lock only
SELECT lock_mode, lock_data FROM performance_schema.data_locks WHERE object_name='gl' AND lock_type='RECORD';

-- OUTPUT (example):
-- +---------------+-----------+
-- | lock_mode     | lock_data |
-- +---------------+-----------+
-- | X,REC_NOT_GAP | 2         |
-- +---------------+-----------+`],
        [`<b>Advantages:</b> real phantom protection at REPEATABLE READ, and replication-safe statement-based logging; no application code needed.`,
            r`-- Reads inside the transaction stay identical because the gap cannot gain rows.
START TRANSACTION;
SELECT COUNT(*) FROM gl WHERE v > 10 FOR UPDATE;   -- 2
-- other session cannot insert v=15 here
SELECT COUNT(*) FROM gl WHERE v > 10 FOR UPDATE;   -- still 2
COMMIT;

-- OUTPUT:
-- +----------+
-- | COUNT(*) |
-- +----------+
-- |        2 |
-- +----------+   (both times)`],
        [`<b>Disadvantages:</b> wide locks reduce insert concurrency, raise deadlock probability, and are hard to reason about. Gap locks do not conflict with each other (two sessions can hold the same gap), but both then block inserts.`,
            r`-- Two sessions hold the same gap, then both insert into it -> deadlock.
-- A: SELECT * FROM gl WHERE id = 15 FOR UPDATE;   -- id 15 missing -> gap lock (10..)
-- B: SELECT * FROM gl WHERE id = 15 FOR UPDATE;   -- also gets the gap, no wait
-- A: INSERT INTO gl VALUES (15, 1);               -- waits on B's gap
-- B: INSERT INTO gl VALUES (15, 2);               -- cycle

-- OUTPUT:
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction`],
        [`<b>Limitations:</b> gap locking applies to REPEATABLE READ and SERIALIZABLE; at READ COMMITTED gap locks are mostly disabled (only for foreign-key and duplicate-key checks). Gap locks need an index; a scan without one locks everything.`,
            r`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;   -- no gap locks for ordinary range scans
START TRANSACTION;
SELECT * FROM gl WHERE v BETWEEN 15 AND 25 FOR UPDATE;
SELECT lock_mode, lock_data FROM performance_schema.data_locks WHERE object_name='gl' AND lock_type='RECORD';

-- OUTPUT (example):
-- +---------------+-----------+
-- | lock_mode     | lock_data |
-- +---------------+-----------+
-- | X,REC_NOT_GAP | 20, 2     |
-- | X,REC_NOT_GAP | 2         |
-- +---------------+-----------+`],
        r`index v:   10      20      30
             |  gap  |  gap  |  gap   |
       ------o-------o-------o--------o------>

  record lock : [20]            only that entry
  gap lock    : (10,20)         no inserts in the open interval
  next-key    : (10,20]         gap + record  (default, REPEATABLE READ)
  supremum    : (30, +inf)      last gap`,
        `If gap locks hurt, move hot paths to READ COMMITTED with row-based binary logging, or use unique-key equality access. Always examine data_locks when tuning write contention; the right fix is usually a better index, not a bigger timeout.`
    ),

    'SELECT ... FOR UPDATE': dd(
        [`<code>SELECT ... FOR UPDATE</code> reads rows and places exclusive locks on them for the rest of the transaction. Others can neither update them nor lock them until you commit, so you can safely read, decide, then write.`,
            r`CREATE TABLE stock (sku VARCHAR(10) PRIMARY KEY, qty INT NOT NULL) ENGINE=InnoDB;
INSERT INTO stock VALUES ('A1', 5);

START TRANSACTION;
SELECT qty FROM stock WHERE sku = 'A1' FOR UPDATE;   -- X lock on the row
UPDATE stock SET qty = qty - 1 WHERE sku = 'A1';
COMMIT;                                               -- lock released

-- OUTPUT (SELECT):
-- +-----+
-- | qty |
-- +-----+
-- |   5 |
-- +-----+`],
        [`A plain read-then-write has a race: two buyers read qty = 1, both decide to buy, stock goes negative. Locking at read time serialises them without changing isolation level for the whole app.`,
            r`-- Session B arrives while A holds the lock; B waits, then sees the updated value.
START TRANSACTION;
SELECT qty FROM stock WHERE sku = 'A1' FOR UPDATE;   -- blocks until A commits
-- A committed: qty is now 4
UPDATE stock SET qty = qty - 1 WHERE sku='A1' AND qty > 0;
COMMIT;

-- OUTPUT (B's SELECT, after waiting):
-- +-----+
-- | qty |
-- +-----+
-- |   4 |
-- +-----+`],
        [`Used for seat booking, inventory reservation, job queues (pick one pending job), balance transfers. MySQL 8 adds <code>NOWAIT</code> (fail instantly) and <code>SKIP LOCKED</code> (ignore locked rows), ideal for work queues.`,
            r`CREATE TABLE jobs (id INT PRIMARY KEY, state VARCHAR(8)) ENGINE=InnoDB;
INSERT INTO jobs VALUES (1,'NEW'),(2,'NEW'),(3,'NEW');

START TRANSACTION;
SELECT id FROM jobs WHERE state='NEW' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;  -- worker 1
-- worker 2 running the same query at the same time gets the next unlocked row

-- OUTPUT:
-- worker 1:            worker 2:
-- +----+               +----+
-- | id |               | id |
-- +----+               +----+
-- |  1 |               |  2 |
-- +----+               +----+`],
        [`<b>Advantages:</b> simple pessimistic concurrency control; correct under any isolation level; NOWAIT and SKIP LOCKED give non-blocking behaviour.`,
            r`START TRANSACTION;
SELECT * FROM stock WHERE sku = 'A1' FOR UPDATE NOWAIT;   -- if locked elsewhere: error at once

-- OUTPUT (when another session holds the row):
-- ERROR 3572 (HY000): Statement aborted because lock(s) could not be acquired immediately
--                     and NOWAIT is set.`],
        [`<b>Disadvantages:</b> holds locks while the application thinks (user pauses, network calls) and blocks others; wide scans lock many rows and gaps; ordering mistakes cause deadlocks.`,
            r`-- Deadlock from opposite lock order.
-- A: SELECT * FROM stock WHERE sku='A1' FOR UPDATE;
-- B: SELECT * FROM stock WHERE sku='B1' FOR UPDATE;
-- A: SELECT * FROM stock WHERE sku='B1' FOR UPDATE;   -- waits for B
-- B: SELECT * FROM stock WHERE sku='A1' FOR UPDATE;   -- waits for A

-- OUTPUT (victim):
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction`],
        [`<b>Limitations:</b> only meaningful inside a transaction (autocommit releases immediately); needs InnoDB; locks index records so filter on an index; <code>OF tbl</code> restricts which table in a join is locked.`,
            r`-- Autocommit on: the lock vanishes right after the statement.
SET autocommit = 1;
SELECT qty FROM stock WHERE sku = 'A1' FOR UPDATE;
SELECT COUNT(*) AS locks FROM performance_schema.data_locks WHERE object_name='stock';

-- OUTPUT:
-- +-------+
-- | locks |
-- +-------+
-- |     0 |
-- +-------+`],
        r`   worker A                 stock row 'A1'               worker B
   BEGIN
   SELECT .. FOR UPDATE ----->  [X locked by A]
                                                         SELECT .. FOR UPDATE
                                                         (waits...)
   UPDATE qty = qty-1
   COMMIT  ------------------>  [released] ------------>  gets lock, reads fresh qty

   SKIP LOCKED : B jumps to the next free row instead of waiting
   NOWAIT      : B gets error 3572 immediately`,
        `Use pessimistic locks for hot, high-contention rows and optimistic version columns (UPDATE ... WHERE version = ?) for low contention. Always lock in a consistent key order, keep the transaction short, and use SKIP LOCKED for queue tables.`
    ),

    'Lock Contention & Deadlocks': dd(
        [`<b>Lock contention</b> is many transactions waiting for the same locks. A <b>deadlock</b> is a cycle of waits (A waits for B, B waits for A). InnoDB detects deadlocks, rolls back the cheaper transaction (the victim) and returns error 1213.`,
            r`-- Reproduce a deadlock with two sessions.
-- A: START TRANSACTION; UPDATE acct SET bal=bal+1 WHERE id=1;
-- B: START TRANSACTION; UPDATE acct SET bal=bal+1 WHERE id=2;
-- A: UPDATE acct SET bal=bal+1 WHERE id=2;     -- waits for B
-- B: UPDATE acct SET bal=bal+1 WHERE id=1;     -- cycle detected

-- OUTPUT (session B):
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction`],
        [`Contention reduces throughput and raises latency; deadlocks are inevitable in busy systems, so you need to know how to see, handle and reduce them rather than hope they never occur.`,
            r`-- Who is blocking whom right now (MySQL 8 sys schema).
SELECT waiting_pid, waiting_query, blocking_pid, blocking_query
FROM sys.innodb_lock_waits;

-- OUTPUT (example):
-- +-------------+-------------------------------------+--------------+----------------+
-- | waiting_pid | waiting_query                       | blocking_pid | blocking_query |
-- +-------------+-------------------------------------+--------------+----------------+
-- |          42 | UPDATE acct SET bal=0 WHERE id = 1  |           37 | NULL           |
-- +-------------+-------------------------------------+--------------+----------------+`],
        [`In production: wrap transactions in a retry loop for error 1213, log the last deadlock (<code>innodb_print_all_deadlocks=ON</code>), and kill long blockers found with <code>sys.innodb_lock_waits</code>.`,
            r`SHOW ENGINE INNODB STATUS\G
-- Look for the section:
-- ------------------------
-- LATEST DETECTED DEADLOCK
-- ------------------------
-- *** (1) TRANSACTION: ... UPDATE acct SET bal=bal+1 WHERE id=2
-- *** (2) TRANSACTION: ... UPDATE acct SET bal=bal+1 WHERE id=1
-- *** WE ROLL BACK TRANSACTION (2)
SET GLOBAL innodb_print_all_deadlocks = ON;     -- also write every deadlock to the error log

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`<b>Advantages of InnoDB handling:</b> automatic detection in milliseconds, automatic rollback of one side, the other proceeds; rich diagnostics in performance_schema and sys.`,
            r`-- Application retry pattern (pseudo-SQL flow).
-- attempt = 0
-- loop:
--   START TRANSACTION; ...work...; COMMIT;
--   on error 1213 or 1205: ROLLBACK; attempt++; sleep(backoff); retry (max 3)
SELECT VARIABLE_VALUE AS deadlocks FROM performance_schema.global_status WHERE VARIABLE_NAME='Innodb_deadlocks';

-- OUTPUT (example):
-- +-----------+
-- | deadlocks |
-- +-----------+
-- | 3         |
-- +-----------+`],
        [`<b>Disadvantages:</b> deadlock rollback loses work; detection itself costs CPU under extreme load; contention can cascade into thread pile-up and connection exhaustion.`,
            r`-- Under heavy hot-row load deadlock detection can be turned off (use a short timeout instead).
SHOW VARIABLES LIKE 'innodb_deadlock_detect';
SET GLOBAL innodb_deadlock_detect = OFF;      -- only for extreme hot-row workloads
SET GLOBAL innodb_lock_wait_timeout = 5;

-- OUTPUT:
-- +------------------------+-------+
-- | Variable_name          | Value |
-- +------------------------+-------+
-- | innodb_deadlock_detect | ON    |
-- +------------------------+-------+`],
        [`<b>Limitations:</b> InnoDB sees only its own row locks; deadlocks that involve table locks (LOCK TABLES) or metadata locks across engines may not be detected and resolve only by timeout. The whole transaction is rolled back on 1213, but only the statement on 1205 by default.`,
            r`-- Lock-wait timeout rolls back just the statement unless this is ON.
SHOW VARIABLES LIKE 'innodb_rollback_on_timeout';

-- OUTPUT:
-- +----------------------------+-------+
-- | Variable_name              | Value |
-- +----------------------------+-------+
-- | innodb_rollback_on_timeout | OFF   |
-- +----------------------------+-------+`],
        r`  Session A                    Session B
  lock row 1  (held)           lock row 2  (held)
      |                            |
      v                            v
  wants row 2 -----waits-----> held by B
  held by A  <-----waits------ wants row 1

        A ---> B ---> A     cycle -> InnoDB picks victim, ROLLBACK, error 1213

  Fix: same lock order, short transactions, good indexes, retry`,
        `Prevent deadlocks by design: touch rows in one global order, keep transactions short, index every filter, and avoid mixed gap/insert patterns. Accept that some will still happen and make every write path idempotent and retry-safe with backoff.`
    ),
};
