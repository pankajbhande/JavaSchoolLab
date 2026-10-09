// Deep dive, modules 19-21 (Transactions, Isolation Levels, Locks & Concurrency).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d08: Record<string, Deep> = {
    'ACID Properties': dv(
        [`InnoDB implements ACID with four mechanisms. Atomicity: the undo log lets it roll back a transaction. Consistency: constraints are checked on every statement. Isolation: MVCC read views plus row locks. Durability: the redo log is written (and by default fsynced) at commit, before data pages reach disk.`,
            r`CREATE TABLE acct (id INT PRIMARY KEY, bal DECIMAL(10,2) NOT NULL, CHECK (bal >= 0)) ENGINE=InnoDB;
INSERT INTO acct VALUES (1, 1000), (2, 0);
START TRANSACTION;
UPDATE acct SET bal = bal - 400 WHERE id = 1;
UPDATE acct SET bal = bal + 400 WHERE id = 2;
COMMIT;
SELECT id, bal FROM acct ORDER BY id;

-- OUTPUT:
-- id | bal
--  1 | 600.00
--  2 | 400.00`],
        [`Durability is configurable: <code>innodb_flush_log_at_trx_commit</code> (1 = fsync each commit, 2 = write each commit and fsync each second, 0 = once per second) and <code>sync_binlog</code>. Isolation is set per session or globally; atomicity and consistency are always on for InnoDB.`,
            r`SELECT @@innodb_flush_log_at_trx_commit AS redo_flush, @@sync_binlog AS binlog_sync, @@transaction_isolation AS isolation, @@autocommit AS autocommit;
SET GLOBAL innodb_flush_log_at_trx_commit = 1;
SET GLOBAL sync_binlog = 1;

-- OUTPUT:
-- redo_flush | binlog_sync | isolation       | autocommit
--          1 |           1 | REPEATABLE-READ |          1`],
        [`Mistakes: assuming atomicity across statements without a transaction (autocommit makes each statement its own), using MyISAM tables inside transactions (no rollback), and relaxing durability settings on money data. Verify the engine and the settings.`,
            r`SELECT table_name, engine FROM information_schema.tables WHERE table_schema = DATABASE() AND engine <> 'InnoDB';
UPDATE acct SET bal = bal - 400 WHERE id = 1;       -- autocommit: committed immediately
-- application crashes here: the matching credit never runs

-- OUTPUT:
-- table_name | engine
-- audit_log  | MyISAM       (convert it)`],
        [`Durability costs an fsync per commit. Group commit batches commits from concurrent sessions into one fsync, so throughput rises with concurrency. Relaxing to 2 is a conscious trade of up to a second of commits on an OS crash.`,
            r`SHOW GLOBAL STATUS LIKE 'Innodb_os_log_fsyncs';
SHOW GLOBAL STATUS LIKE 'Innodb_log_writes';

-- OUTPUT: (example)
-- Innodb_os_log_fsyncs | 4120331     (fewer fsyncs than commits thanks to group commit)
-- Innodb_log_writes    | 9120440`],
        [`Real-world: a funds transfer. All four properties matter: both updates or neither, balances never negative, concurrent transfers do not interfere, and a committed transfer survives a crash.`,
            r`START TRANSACTION;
SELECT bal FROM acct WHERE id = 1 FOR UPDATE;
UPDATE acct SET bal = bal - 700 WHERE id = 1;     -- violates CHECK if bal < 700
UPDATE acct SET bal = bal + 700 WHERE id = 2;
COMMIT;

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'acct_chk_1' is violated.      (nothing changed: roll back and report)`]
    ),

    'START TRANSACTION, COMMIT & ROLLBACK': dv(
        [`START TRANSACTION turns autocommit off for the session until COMMIT or ROLLBACK. Changes are made to pages in the buffer pool, undo records are written for rollback, and redo records for durability. COMMIT writes the commit record and releases locks; ROLLBACK applies the undo records in reverse.`,
            r`CREATE TABLE stock (sku VARCHAR(10) PRIMARY KEY, qty INT NOT NULL);
INSERT INTO stock VALUES ('A1', 10);
START TRANSACTION;
UPDATE stock SET qty = qty - 3 WHERE sku = 'A1';
SELECT qty FROM stock WHERE sku = 'A1';      -- 7 (visible to this session only)
ROLLBACK;
SELECT qty FROM stock WHERE sku = 'A1';

-- OUTPUT:
-- 7
-- 10`],
        [`Variants: <code>BEGIN</code>, <code>START TRANSACTION READ ONLY</code>, <code>WITH CONSISTENT SNAPSHOT</code>, <code>SET autocommit = 0</code>, and <code>COMMIT AND CHAIN</code>. DDL and some statements cause an implicit commit.`,
            r`START TRANSACTION READ ONLY;
SELECT COUNT(*) FROM stock;
COMMIT;
START TRANSACTION WITH CONSISTENT SNAPSHOT;
COMMIT AND CHAIN;                                   -- commit and immediately start the next transaction
SET autocommit = 0;                                 -- every statement starts a transaction

-- OUTPUT:
-- COUNT(*)
-- 1`],
        [`Mistakes: transactions left open (locks held, undo grows), user waits inside a transaction, DDL in the middle (implicit commit), and catching errors without rolling back. Always finish with COMMIT or ROLLBACK in finally blocks.`,
            r`START TRANSACTION;
INSERT INTO stock VALUES ('B2', 5);
CREATE TABLE tmp_x (id INT);      -- implicit COMMIT here
ROLLBACK;                         -- too late
SELECT COUNT(*) FROM stock WHERE sku = 'B2';

-- OUTPUT:
-- COUNT(*)
-- 1`],
        [`Keep transactions short. A long transaction blocks purge of undo records (history list grows), holds locks and delays DDL through metadata locks. Find them before they hurt.`,
            r`SELECT trx_id, trx_started, TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS secs, trx_rows_locked, trx_mysql_thread_id FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 3;
SELECT count AS history_list_length FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len';

-- OUTPUT: (example)
-- trx_id | trx_started         | secs | trx_rows_locked | trx_mysql_thread_id
-- 77123  | 2026-05-01 06:12:03 | 14400|              12 |                  44`],
        [`Real-world service pattern: begin, do all reads that decide the outcome with locking reads, write, commit, and retry the whole block on deadlock (error 1213).`,
            r`START TRANSACTION;
SELECT qty FROM stock WHERE sku = 'A1' FOR UPDATE;
UPDATE stock SET qty = qty - 2 WHERE sku = 'A1' AND qty >= 2;
INSERT INTO order_lines (order_id, sku, qty) VALUES (1001, 'A1', 2);
COMMIT;

-- OUTPUT:
-- qty
-- 10`]
    ),

    'SAVEPOINT': dv(
        [`A savepoint records a position in the undo log of the current transaction. ROLLBACK TO SAVEPOINT applies undo records back to that position and keeps the transaction open. Row locks acquired after the savepoint are released in InnoDB, but locks taken before it are kept.`,
            r`START TRANSACTION;
INSERT INTO stock VALUES ('C3', 1);
SAVEPOINT after_c3;
INSERT INTO stock VALUES ('D4', 2);
ROLLBACK TO SAVEPOINT after_c3;
COMMIT;
SELECT sku FROM stock WHERE sku IN ('C3','D4');

-- OUTPUT:
-- sku
-- C3`],
        [`Statements: SAVEPOINT name, ROLLBACK TO name, RELEASE SAVEPOINT name. Using the same name again moves the savepoint. A full COMMIT or ROLLBACK discards all savepoints.`,
            r`START TRANSACTION;
SAVEPOINT s1;
INSERT INTO stock VALUES ('E5', 1);
SAVEPOINT s2;
INSERT INTO stock VALUES ('F6', 1);
ROLLBACK TO s1;                 -- removes E5 and F6, also forgets s2
RELEASE SAVEPOINT s1;
ROLLBACK TO s1;

-- OUTPUT:
-- ERROR 1305 (42000): SAVEPOINT s1 does not exist`],
        [`Mistakes: expecting ROLLBACK TO to end the transaction, expecting it to release all locks, and creating savepoints per row in huge loops (overhead). Remember to COMMIT afterwards.`,
            r`START TRANSACTION;
SAVEPOINT x;
UPDATE stock SET qty = 0 WHERE sku = 'A1';
ROLLBACK TO x;                                  -- undo the update, transaction still open
SELECT @@in_transaction;                        -- not available; use information_schema
SELECT COUNT(*) FROM information_schema.innodb_trx WHERE trx_mysql_thread_id = CONNECTION_ID();

-- OUTPUT:
-- COUNT(*)
-- 1                (still inside a transaction: commit or roll back)`],
        [`Savepoints are cheap for coarse steps. Use them to skip a failing item in a batch while keeping the successful ones in one transaction, rather than one transaction per item.`,
            r`DELIMITER //
CREATE PROCEDURE import_rows()
BEGIN
  DECLARE done INT DEFAULT 0; DECLARE v_sku VARCHAR(10); DECLARE v_qty INT;
  DECLARE c CURSOR FOR SELECT sku, qty FROM staging;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  START TRANSACTION; OPEN c;
  lp: LOOP
    FETCH c INTO v_sku, v_qty; IF done THEN LEAVE lp; END IF;
    SAVEPOINT row_sp;
    BEGIN
      DECLARE EXIT HANDLER FOR SQLEXCEPTION ROLLBACK TO SAVEPOINT row_sp;
      INSERT INTO stock VALUES (v_sku, v_qty);
    END;
  END LOOP;
  CLOSE c; COMMIT;
END //
DELIMITER ;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Real-world: frameworks use savepoints for nested transactions. Spring's NESTED propagation and Django's nested atomic() blocks emit SAVEPOINT and ROLLBACK TO so an inner failure can be handled without aborting the outer unit of work.`,
            r`@Transactional
public void placeOrder(Order o) {
    orders.save(o);
    try { loyalty.addPoints(o); }            // @Transactional(propagation = NESTED)
    catch (RuntimeException e) { log.warn("points skipped", e); }
}

-- OUTPUT: (SQL)
-- SAVEPOINT SAVEPOINT_1; ... ROLLBACK TO SAVEPOINT SAVEPOINT_1;  (order insert is kept)`]
    ),

    'READ UNCOMMITTED': dv(
        [`At READ UNCOMMITTED, plain SELECTs read the latest version of each row without consulting undo, so they can see changes that other transactions have not committed (and may roll back). InnoDB still takes locks for writes, so this level does not make writes unsafe, only reads.`,
            r`-- session A
START TRANSACTION; UPDATE stock SET qty = 0 WHERE sku = 'A1';
-- session B
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SELECT qty FROM stock WHERE sku = 'A1';
-- session A
ROLLBACK;

-- OUTPUT: (session B)
-- qty
-- 0              (a value that never existed after the rollback)`],
        [`Set it for the session, the next transaction, or globally. Check the active level with <code>@@transaction_isolation</code>. It is almost never the right choice.`,
            r`SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;       -- next transaction only
SELECT @@session.transaction_isolation, @@global.transaction_isolation;

-- OUTPUT:
-- READ-UNCOMMITTED | REPEATABLE-READ`],
        [`Mistakes: using it "for speed" (InnoDB consistent reads already take no locks, so the gain is tiny), using it for money or stock decisions, and forgetting it applies to the whole session on pooled connections. Reset the level.`,
            r`SELECT SUM(bal) FROM acct;       -- may include half-applied transfers at this level
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;     -- restore before returning a pooled connection

-- OUTPUT:
-- SUM(bal)
-- 1000.00     (or 1000.00 - 400.00 mid-transfer: inconsistent)`],
        [`The performance difference against READ COMMITTED is negligible in InnoDB. Measure before believing otherwise, and prefer a replica or a snapshot for heavy reporting.`,
            r`-- benchmark: 16 threads, mixed read/write
-- READ UNCOMMITTED: 41,200 tps   READ COMMITTED: 41,050 tps   (within noise)
SELECT 41200 - 41050 AS difference_tps;

-- OUTPUT:
-- difference_tps
-- 150`],
        [`Real-world: the only defensible uses are rough, throwaway monitoring counts on a hot table where being slightly wrong is acceptable, and even then a stats table is better.`,
            r`SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SELECT COUNT(*) AS approx_active_sessions FROM sessions WHERE expires_at > NOW();
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

-- OUTPUT:
-- approx_active_sessions
-- 18204`]
    ),

    'READ COMMITTED': dv(
        [`At READ COMMITTED every statement gets a fresh read view, so it sees only data committed before that statement began, never uncommitted data. Gap locks are mostly disabled for searches and index scans, which reduces blocking and deadlocks. Binary logging must use ROW format for replication safety.`,
            r`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT qty FROM stock WHERE sku = 'A1';            -- 10
-- another session: UPDATE stock SET qty = 7 WHERE sku='A1'; COMMIT;
SELECT qty FROM stock WHERE sku = 'A1';            -- 7 (new read view)
COMMIT;

-- OUTPUT:
-- 10
-- 7`],
        [`Configure per session, per connection pool, or globally in <code>my.cnf</code>. Combine with <code>binlog_format=ROW</code>. Many write-heavy OLTP systems and other databases (PostgreSQL, Oracle) default to it.`,
            r`[mysqld]
transaction-isolation = READ-COMMITTED
binlog_format = ROW

SET GLOBAL TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT @@global.transaction_isolation, @@binlog_format;

-- OUTPUT:
-- READ-COMMITTED | ROW`],
        [`Mistakes: relying on repeatable reads (a report reads the same table twice and totals do not match), using statement-based binlog, and assuming gap protection against phantom inserts. Use explicit locks or constraints for invariants.`,
            r`START TRANSACTION;
SELECT COUNT(*) FROM orders WHERE status = 'NEW';        -- 10
-- another session inserts and commits one NEW order
SELECT COUNT(*) FROM orders WHERE status = 'NEW';        -- 11 (phantom)
COMMIT;

-- OUTPUT:
-- 10
-- 11`],
        [`Fewer gap locks means fewer lock waits and deadlocks on range updates and deletes. Compare lock waits and deadlock counters after switching.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Innodb_row_lock_waits','Innodb_row_lock_time_avg','Innodb_deadlocks');

-- OUTPUT: (before -> after switching)
-- Innodb_row_lock_waits    | 12400 -> 3100
-- Innodb_row_lock_time_avg |   420 ->  95
-- Innodb_deadlocks         |    38 ->   4`],
        [`Real-world: a multi-user inventory system uses READ COMMITTED with atomic conditional updates for correctness, so concurrent orders do not block each other on gap locks.`,
            r`UPDATE stock SET qty = qty - 2 WHERE sku = 'A1' AND qty >= 2;
SELECT ROW_COUNT() AS reserved;

-- OUTPUT:
-- reserved
-- 1            (0 means insufficient stock; no read-then-write race)`]
    ),

    'REPEATABLE READ': dv(
        [`REPEATABLE READ (the InnoDB default) creates one read view at the first consistent read of the transaction. Plain SELECTs read old row versions through undo, so repeated reads agree. Locking reads and writes use the latest committed data and take next-key locks to protect ranges.`,
            r`START TRANSACTION;
SELECT qty FROM stock WHERE sku = 'A1';               -- 10
-- another session: UPDATE stock SET qty = 7 WHERE sku='A1'; COMMIT;
SELECT qty FROM stock WHERE sku = 'A1';               -- still 10 (snapshot)
SELECT qty FROM stock WHERE sku = 'A1' FOR UPDATE;    -- 7 (current read)
COMMIT;

-- OUTPUT:
-- 10
-- 10
-- 7`],
        [`Control the snapshot start with <code>WITH CONSISTENT SNAPSHOT</code>. Use <code>FOR SHARE</code> / <code>FOR UPDATE</code> when a decision depends on the latest data. <code>innodb_locks_unsafe_for_binlog</code> is removed; use READ COMMITTED to avoid gap locks.`,
            r`START TRANSACTION WITH CONSISTENT SNAPSHOT;
SELECT COUNT(*) FROM orders;
-- reports and dumps use this to read a point-in-time view
COMMIT;

-- OUTPUT:
-- COUNT(*)
-- 1800000`],
        [`Mistakes: mixing snapshot reads and writes in one transaction (the write acts on newer rows than the read saw), long-lived transactions that bloat undo, and being surprised by gap locks blocking inserts. Use locking reads for decisions.`,
            r`START TRANSACTION;
SELECT SUM(qty) FROM stock;                            -- snapshot total
-- another session commits +5 on A1
UPDATE stock SET qty = qty + 1 WHERE sku = 'A1';       -- acts on the latest value
SELECT SUM(qty) FROM stock;                            -- now includes the other commit as well
COMMIT;

-- OUTPUT:
-- 10
-- 16`],
        [`Long snapshots keep old versions alive. Watch the history list length and the age of the oldest transaction, and keep reporting transactions short or run them on replicas.`,
            r`SELECT count AS history_list_length FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len';
SELECT MIN(trx_started) AS oldest FROM information_schema.innodb_trx;

-- OUTPUT: (example)
-- history_list_length
-- 912330            (high: a long transaction prevents purge)`],
        [`Real-world: consistent backups and exports rely on the snapshot. mysqldump --single-transaction starts a REPEATABLE READ transaction with a consistent snapshot so the dump is a coherent point-in-time copy without blocking writers.`,
            r`mysqldump --single-transaction --source-data=2 --routines shop > shop.sql

-- OUTPUT:
-- (shop.sql: all tables as of one instant; writers kept running)`]
    ),

    'SERIALIZABLE': dv(
        [`At SERIALIZABLE InnoDB converts plain SELECTs inside a transaction into <code>SELECT ... FOR SHARE</code> (when autocommit is off), so readers take shared next-key locks and block writers to the same ranges. This prevents phantoms and write skew at the cost of concurrency.`,
            r`SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;
SELECT * FROM stock WHERE sku = 'A1';        -- takes a shared lock
-- another session
UPDATE stock SET qty = qty + 1 WHERE sku = 'A1';

-- OUTPUT: (other session)
-- (waits) ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction`],
        [`Use it for short critical sections that must be fully serializable, or prefer narrower tools: unique constraints, conditional updates, SELECT ... FOR UPDATE on the checked rows, or optimistic versioning.`,
            r`SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;          -- just the next transaction
START TRANSACTION;
SELECT COUNT(*) FROM shifts WHERE day = '2026-05-04' AND doctor_on_call = 1;
UPDATE shifts SET doctor_on_call = 0 WHERE day = '2026-05-04' AND doctor = 'Asha';
COMMIT;

-- OUTPUT:
-- COUNT(*)
-- 2`],
        [`Mistakes: global SERIALIZABLE (throughput collapses and deadlocks rise), not retrying after deadlock, and expecting it to fix application logic bugs. Design for retries.`,
            r`-- session A and B both read then update overlapping ranges:
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction
-- handle in code: catch 1213, roll back, retry with backoff (bounded)

SHOW GLOBAL STATUS LIKE 'Innodb_deadlocks';

-- OUTPUT:
-- Innodb_deadlocks | 120`],
        [`Measure the cost: shared locks on every read multiply lock waits. Compare lock wait counters and latency between isolation levels with a realistic concurrent test.`,
            r`-- 64 clients, 90% reads
-- READ COMMITTED : 38,000 tps, p99 18 ms
-- SERIALIZABLE   :  9,200 tps, p99 420 ms
SELECT ROUND(38000 / 9200, 1) AS throughput_ratio;

-- OUTPUT:
-- throughput_ratio
-- 4.1`],
        [`Real-world: use a narrow serializable-like guard instead of global SERIALIZABLE. "At least one doctor on call" is protected by locking the relevant rows.`,
            r`START TRANSACTION;
SELECT * FROM doctors WHERE on_call = 1 FOR UPDATE;      -- locks the rows that define the invariant
UPDATE doctors SET on_call = 0 WHERE id = 7 AND (SELECT COUNT(*) FROM (SELECT id FROM doctors WHERE on_call = 1) x) > 1;
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`]
    ),

    'Dirty, Non-Repeatable & Phantom Reads': dv(
        [`Three read anomalies: a dirty read sees uncommitted data; a non-repeatable read sees a row change between two reads; a phantom read sees a different set of rows for the same predicate. Which are possible depends on the isolation level and on whether the read is a snapshot or a locking read.`,
            r`SELECT 'READ UNCOMMITTED' AS level, 'yes' AS dirty, 'yes' AS non_repeatable, 'yes' AS phantom
UNION ALL SELECT 'READ COMMITTED', 'no', 'yes', 'yes'
UNION ALL SELECT 'REPEATABLE READ (InnoDB)', 'no', 'no', 'no for snapshot reads, blocked for locking reads'
UNION ALL SELECT 'SERIALIZABLE', 'no', 'no', 'no';

-- OUTPUT:
-- level                    | dirty | non_repeatable | phantom
-- READ UNCOMMITTED         | yes   | yes            | yes
-- READ COMMITTED           | no    | yes            | yes
-- REPEATABLE READ (InnoDB) | no    | no             | no for snapshot reads, blocked for locking reads
-- SERIALIZABLE             | no    | no             | no`],
        [`Reproduce each with two sessions. For phantoms use a range predicate; for non-repeatable reads read the same row twice; for dirty reads set READ UNCOMMITTED in the reader.`,
            r`-- phantom at READ COMMITTED
-- A: START TRANSACTION; SELECT COUNT(*) FROM orders WHERE total > 500;      -- 3
-- B: INSERT INTO orders (customer_id, total) VALUES (1, 900); COMMIT;
-- A: SELECT COUNT(*) FROM orders WHERE total > 500;                         -- 4

-- OUTPUT:
-- 3
-- 4`],
        [`Mistakes: assuming REPEATABLE READ stops all phantoms (a later UPDATE acts on newer rows), testing concurrency with one session, and fixing anomalies by raising isolation globally. Fix with targeted locks or constraints.`,
            r`-- A at REPEATABLE READ
START TRANSACTION;
SELECT COUNT(*) FROM orders WHERE total > 500;                   -- 3 (snapshot)
-- B inserts a 900 order and commits
UPDATE orders SET flag = 1 WHERE total > 500;                    -- updates 4 rows including the "phantom"
SELECT COUNT(*) FROM orders WHERE total > 500;                   -- 4: the row appeared

-- OUTPUT:
-- 3
-- 4`],
        [`Locking reads protect ranges with next-key locks at REPEATABLE READ, so inserts into the scanned gap wait. This costs concurrency; use only where the invariant needs it.`,
            r`-- A
START TRANSACTION; SELECT * FROM orders WHERE total BETWEEN 500 AND 1000 FOR UPDATE;
-- B
INSERT INTO orders (customer_id, total) VALUES (1, 700);

-- OUTPUT: (B)
-- (blocked until A commits or lock wait timeout)`],
        [`Real-world: ticket booking must not oversell seats. Instead of a high isolation level, lock the seat rows or enforce uniqueness, so two buyers cannot take the same seat even under READ COMMITTED.`,
            r`CREATE TABLE seat_booking (event_id INT, seat_no INT, user_id BIGINT NOT NULL, PRIMARY KEY (event_id, seat_no));
INSERT INTO seat_booking VALUES (1, 12, 7);
INSERT INTO seat_booking VALUES (1, 12, 9);

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-12' for key 'seat_booking.PRIMARY'`]
    ),

    'Lost Update': dv(
        [`A lost update happens when two transactions read the same value, compute a new value in the application and write it back: the second write overwrites the first without seeing it. It is a read-modify-write race and is not prevented by READ COMMITTED or by plain snapshot reads.`,
            r`-- A: SELECT qty FROM stock WHERE sku='A1';                 -- 10
-- B: SELECT qty FROM stock WHERE sku='A1';                 -- 10
-- A: UPDATE stock SET qty = 9 WHERE sku='A1'; COMMIT;
-- B: UPDATE stock SET qty = 9 WHERE sku='A1'; COMMIT;      -- should have been 8

SELECT qty FROM stock WHERE sku = 'A1';

-- OUTPUT:
-- qty
-- 9            (one decrement was lost)`],
        [`Three fixes: do the arithmetic in SQL (atomic UPDATE), lock the row with SELECT ... FOR UPDATE, or use optimistic locking with a version column and check the affected-row count.`,
            r`UPDATE stock SET qty = qty - 1 WHERE sku = 'A1' AND qty > 0;                                    -- atomic

START TRANSACTION; SELECT qty FROM stock WHERE sku = 'A1' FOR UPDATE; UPDATE stock SET qty = 8 WHERE sku = 'A1'; COMMIT;   -- pessimistic

UPDATE documents SET body = 'new', version = version + 1 WHERE id = 7 AND version = 3;             -- optimistic
SELECT ROW_COUNT() AS saved;

-- OUTPUT:
-- saved
-- 1`],
        [`Mistakes: read in one request and write in another with no version check, overwriting the whole row with stale values from a form, and assuming transactions alone prevent it. Include a version or use column-level atomic updates.`,
            r`UPDATE profiles SET name = 'Asha', phone = '999', city = 'Pune' WHERE id = 1;      -- stale form overwrites a concurrent phone change
UPDATE profiles SET name = 'Asha' WHERE id = 1;                                      -- only update the changed columns

-- OUTPUT:
-- Query OK, 1 row affected`],
        [`Pessimistic locks hold rows during user think time and reduce concurrency; optimistic checks are free until a conflict happens. Choose by conflict rate: optimistic for low conflict, FOR UPDATE for hot short operations.`,
            r`SELECT ROW_COUNT();                      -- 0 means conflict: reload, merge, retry
SELECT trx_state, trx_rows_locked FROM information_schema.innodb_trx;

-- OUTPUT:
-- ROW_COUNT()
-- 0`],
        [`Real-world: a counter incremented by many requests. Use an atomic UPDATE for exactness, and for extremely hot counters spread across slots and sum on read.`,
            r`UPDATE page_stats SET views = views + 1 WHERE page_id = 7;
INSERT INTO counter_slots (name, slot, value) VALUES ('likes:7', FLOOR(RAND() * 8), 1) ON DUPLICATE KEY UPDATE value = value + 1;
SELECT SUM(value) AS likes FROM counter_slots WHERE name = 'likes:7';

-- OUTPUT:
-- likes
-- 8120`]
    ),

    'Shared & Exclusive Locks': dv(
        [`InnoDB uses shared (S) and exclusive (X) locks on records, plus intention locks (IS, IX) on tables. S locks are compatible with S; X is incompatible with everything. Plain consistent SELECTs take no locks; locking reads, UPDATE, DELETE and INSERT do.`,
            r`-- A
START TRANSACTION; SELECT * FROM stock WHERE sku = 'A1' FOR SHARE;
-- B
SELECT * FROM stock WHERE sku = 'A1' FOR SHARE;          -- works
UPDATE stock SET qty = qty + 1 WHERE sku = 'A1';          -- waits for A

SELECT object_name, lock_type, lock_mode, lock_data FROM performance_schema.data_locks;

-- OUTPUT: (example)
-- object_name | lock_type | lock_mode     | lock_data
-- stock       | TABLE     | IS            | NULL
-- stock       | RECORD    | S,REC_NOT_GAP | 'A1'`],
        [`Syntax: <code>FOR SHARE</code> (S lock), <code>FOR UPDATE</code> (X lock), with <code>NOWAIT</code> or <code>SKIP LOCKED</code>. <code>LOCK IN SHARE MODE</code> is the older spelling.`,
            r`SELECT * FROM jobs WHERE status = 'NEW' ORDER BY id LIMIT 5 FOR UPDATE SKIP LOCKED;
SELECT * FROM stock WHERE sku = 'A1' FOR UPDATE NOWAIT;
SELECT * FROM stock WHERE sku = 'A1' FOR SHARE OF stock;

-- OUTPUT:
-- ERROR 3572 (HY000): Statement aborted because lock(s) could not be acquired immediately and NOWAIT is set.   (when locked elsewhere)`],
        [`Mistakes: locking reads on unindexed predicates (every scanned row gets locked), long transactions holding locks, and inconsistent lock order across code paths (deadlocks). Index the predicate and always lock in the same order.`,
            r`EXPLAIN SELECT * FROM jobs WHERE payload = 'x' FOR UPDATE;       -- type=ALL: locks all scanned rows
ALTER TABLE jobs ADD INDEX idx_status (status);
EXPLAIN SELECT * FROM jobs WHERE status = 'NEW' FOR UPDATE;       -- type=ref: locks only matching rows

-- OUTPUT: (example)
-- ALL / ref`],
        [`Lock waits cost latency. Find who waits for whom, how long, and which statement is the blocker, then shorten or reorder transactions.`,
            r`SELECT waiting_pid, LEFT(waiting_query, 40) AS waiting, blocking_pid, LEFT(blocking_query, 40) AS blocking, wait_age FROM sys.innodb_lock_waits;
SHOW GLOBAL STATUS LIKE 'Innodb_row_lock_time%';

-- OUTPUT: (example)
-- waiting_pid | waiting             | blocking_pid | blocking | wait_age
-- 22          | UPDATE stock SET q..|           19 | NULL     | 00:00:42`],
        [`Real-world job queue: workers claim distinct rows with SKIP LOCKED so they never wait on each other.`,
            r`START TRANSACTION;
SELECT id FROM jobs WHERE status = 'NEW' ORDER BY id LIMIT 10 FOR UPDATE SKIP LOCKED;
UPDATE jobs SET status = 'RUNNING', worker = 'w1' WHERE id IN (1,2,3,4,5,6,7,8,9,10);
COMMIT;

-- OUTPUT:
-- id
-- 1  2  3 ... 10`]
    ),

    'Row-Level vs Table Locks': dv(
        [`InnoDB locks individual index records (row-level), so sessions can modify different rows of one table at the same time. Table locks (<code>LOCK TABLES</code>, MyISAM) block the whole table. Metadata locks protect table structure and queue behind long transactions.`,
            r`-- A
START TRANSACTION; UPDATE stock SET qty = qty - 1 WHERE sku = 'A1';
-- B (different row: no wait)
UPDATE stock SET qty = qty - 1 WHERE sku = 'B2';
-- table-level view of both
SELECT object_name, lock_type, lock_mode FROM performance_schema.data_locks WHERE object_name = 'stock';

-- OUTPUT: (example)
-- object_name | lock_type | lock_mode
-- stock       | TABLE     | IX
-- stock       | RECORD    | X,REC_NOT_GAP`],
        [`Explicit table locks: <code>LOCK TABLES t READ/WRITE</code> and <code>FLUSH TABLES WITH READ LOCK</code> (backups), rarely needed with InnoDB. Online DDL uses metadata locks briefly at start and end.`,
            r`LOCK TABLES stock WRITE;
UPDATE stock SET qty = 0;
UNLOCK TABLES;
FLUSH TABLES WITH READ LOCK;      -- global read lock, backups only
UNLOCK TABLES;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: an UPDATE without a usable index (locks every scanned row, effectively the table), DDL queued behind a long transaction (all later queries stack up behind it), and LOCK TABLES in applications. Fail DDL fast with a short lock timeout.`,
            r`SET SESSION lock_wait_timeout = 5;
ALTER TABLE stock ADD COLUMN note VARCHAR(20);
SELECT object_name, lock_type, lock_status, owner_thread_id FROM performance_schema.metadata_locks WHERE object_name = 'stock';

-- OUTPUT:
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
-- stock | EXCLUSIVE   | PENDING | 40
-- stock | SHARED_READ | GRANTED | 31         (an old transaction is blocking the ALTER)`],
        [`Row locks scale concurrency but have per-lock memory and CPU cost; locking millions of rows in one transaction is slow. Batch large updates and index predicates.`,
            r`UPDATE orders SET status = 'ARCHIVED' WHERE id BETWEEN 1 AND 10000 AND status = 'DONE';
SHOW GLOBAL STATUS LIKE 'Innodb_row_lock_current_waits';

-- OUTPUT:
-- Query OK, 8800 rows affected
-- Innodb_row_lock_current_waits | 0`],
        [`Real-world: schema changes at peak hours. Check for open transactions on the table first, use ALGORITHM/LOCK clauses, and a short lock_wait_timeout so the ALTER aborts instead of blocking the application.`,
            r`SELECT trx_id, trx_started, trx_query FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 3;
ALTER TABLE orders ADD INDEX idx_channel (channel), ALGORITHM=INPLACE, LOCK=NONE;

-- OUTPUT:
-- Query OK, 0 rows affected (11.2 sec)`]
    ),

    'Record, Gap & Next-Key Locks': dv(
        [`A record lock locks one index entry. A gap lock locks the open interval between entries (preventing inserts there). A next-key lock is a record lock plus the gap before it. At REPEATABLE READ, locking reads and writes over ranges take next-key locks to stop phantoms.`,
            r`-- table t(id PK) has ids 10, 20, 30
-- A
START TRANSACTION; SELECT * FROM t WHERE id BETWEEN 11 AND 25 FOR UPDATE;
SELECT index_name, lock_mode, lock_data FROM performance_schema.data_locks WHERE object_name = 't';

-- OUTPUT: (example)
-- index_name | lock_mode | lock_data
-- PRIMARY    | X         | 30           (next-key: record 30 and the gap (20,30])
-- PRIMARY    | X,GAP     | 20           (gap before 20)`],
        [`An equality search on a unique index that finds the row takes only a record lock; searches for missing keys, non-unique indexes and ranges take gap or next-key locks. READ COMMITTED disables most gap locking.`,
            r`START TRANSACTION; SELECT * FROM t WHERE id = 20 FOR UPDATE;          -- record lock only
SELECT lock_mode FROM performance_schema.data_locks WHERE object_name = 't' AND lock_type = 'RECORD';
ROLLBACK;
START TRANSACTION; SELECT * FROM t WHERE id = 15 FOR UPDATE;          -- no such row: gap lock (10,20)
SELECT lock_mode, lock_data FROM performance_schema.data_locks WHERE object_name = 't' AND lock_type = 'RECORD';

-- OUTPUT:
-- X,REC_NOT_GAP
-- X,GAP | 20`],
        [`Mistakes: not realising SELECT ... FOR UPDATE on a missing key blocks inserts nearby, deadlocks between sessions holding the same gap lock then inserting, and range deletes locking huge gaps. Use unique-key existence checks and READ COMMITTED where phantoms are acceptable.`,
            r`-- A: START TRANSACTION; SELECT * FROM t WHERE id = 15 FOR UPDATE;    -- gap lock
-- B: START TRANSACTION; SELECT * FROM t WHERE id = 16 FOR UPDATE;    -- gap locks are shared: both succeed
-- A: INSERT INTO t VALUES (15);   waits for B's gap lock
-- B: INSERT INTO t VALUES (16);   deadlock

-- OUTPUT:
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction`],
        [`Diagnose lock footprints with data_locks and the deadlock report. Narrow the lock range with precise, indexed predicates.`,
            r`SELECT engine_transaction_id, index_name, lock_type, lock_mode, lock_status, lock_data FROM performance_schema.data_locks ORDER BY engine_transaction_id;
SHOW ENGINE INNODB STATUS\G

-- OUTPUT: (excerpt)
-- LATEST DETECTED DEADLOCK ... HOLDS THE LOCK(S): RECORD LOCKS space id 41 index PRIMARY ... lock_mode X locks gap before rec`],
        [`Real-world: a "reserve first free slot" routine locked a large gap and caused insert stalls. Switching to READ COMMITTED and claiming by unique key removed the stalls.`,
            r`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
UPDATE slots SET owner = 7 WHERE owner IS NULL ORDER BY id LIMIT 1;
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`]
    ),

    'SELECT ... FOR UPDATE': dv(
        [`SELECT ... FOR UPDATE reads the latest committed version of matching rows and takes exclusive locks on the index records it visits (plus gap locks at REPEATABLE READ). The locks last until the transaction ends. It must run inside a transaction to be useful.`,
            r`START TRANSACTION;
SELECT qty FROM stock WHERE sku = 'A1' FOR UPDATE;
UPDATE stock SET qty = qty - 2 WHERE sku = 'A1';
COMMIT;

-- OUTPUT:
-- qty
-- 10`],
        [`Options: <code>NOWAIT</code> fails immediately, <code>SKIP LOCKED</code> skips locked rows (queues), <code>OF table</code> locks specific tables in a join, <code>FOR SHARE</code> for shared locks. Always add ORDER BY with consistent order for multi-row locking.`,
            r`SELECT id FROM jobs WHERE status = 'NEW' ORDER BY id LIMIT 5 FOR UPDATE SKIP LOCKED;
SELECT a.id, b.id FROM accounts a JOIN balances b ON b.account_id = a.id WHERE a.id IN (1, 2) ORDER BY a.id FOR UPDATE OF a, b;
SELECT * FROM stock WHERE sku = 'A1' FOR UPDATE NOWAIT;

-- OUTPUT:
-- (rows locked for the rest of the transaction)`],
        [`Mistakes: no index on the predicate (locks all scanned rows), locking in different orders (deadlocks), holding locks during network calls, and using it outside a transaction (the lock is released immediately with autocommit on).`,
            r`EXPLAIN SELECT * FROM jobs WHERE payload = 'x' FOR UPDATE;       -- type=ALL
SELECT * FROM stock WHERE sku = 'A1' FOR UPDATE;                    -- autocommit=1: lock released at statement end
SET autocommit = 0;                                                  -- or wrap in START TRANSACTION

-- OUTPUT:
-- type=ALL         (locks every row it scans)`],
        [`Keep the locked section as short as possible and measure lock wait time. Contended hot rows limit throughput; consider splitting the hot row or queueing writes.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Innodb_row_lock_time_avg','Innodb_row_lock_waits');
SELECT * FROM sys.innodb_lock_waits;

-- OUTPUT: (example)
-- Innodb_row_lock_time_avg | 84
-- Innodb_row_lock_waits    | 41200`],
        [`Real-world: seat reservation with a hold. Lock the seat row, check it, insert the hold, commit, then process payment outside the transaction.`,
            r`START TRANSACTION;
SELECT status FROM seats WHERE event_id = 1 AND seat_no = 12 FOR UPDATE;
UPDATE seats SET status = 'HELD', held_by = 7, held_until = NOW() + INTERVAL 5 MINUTE WHERE event_id = 1 AND seat_no = 12 AND status = 'FREE';
COMMIT;

-- OUTPUT:
-- status
-- FREE`]
    ),

    'Lock Contention & Deadlocks': dv(
        [`A deadlock is a cycle of lock waits: A holds X and waits for Y while B holds Y and waits for X. InnoDB detects the cycle by building a wait-for graph and rolls back the transaction that has done the least work (the victim) with error 1213. Lock wait timeout (1205) happens when no cycle exists but the wait is too long.`,
            r`-- A: START TRANSACTION; UPDATE acct SET bal = bal WHERE id = 1;
-- B: START TRANSACTION; UPDATE acct SET bal = bal WHERE id = 2;
-- A: UPDATE acct SET bal = bal WHERE id = 2;       -- waits for B
-- B: UPDATE acct SET bal = bal WHERE id = 1;       -- cycle detected

-- OUTPUT: (B)
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction`],
        [`Tools: <code>SHOW ENGINE INNODB STATUS</code> (latest deadlock), <code>innodb_print_all_deadlocks</code> (log all), <code>performance_schema.data_locks</code>, <code>innodb_lock_wait_timeout</code>, and <code>innodb_deadlock_detect</code>.`,
            r`SET GLOBAL innodb_print_all_deadlocks = ON;
SHOW VARIABLES WHERE Variable_name IN ('innodb_lock_wait_timeout','innodb_deadlock_detect');
SHOW GLOBAL STATUS LIKE 'Innodb_deadlocks';

-- OUTPUT:
-- innodb_lock_wait_timeout | 50
-- innodb_deadlock_detect   | ON
-- Innodb_deadlocks         | 3`],
        [`Mistakes: not retrying, inconsistent lock order, big multi-row updates without indexes, and raising the wait timeout instead of fixing contention. Always lock in a canonical order (for example ascending id) and keep transactions small.`,
            r`START TRANSACTION;
SELECT id FROM acct WHERE id IN (2, 1) ORDER BY id FOR UPDATE;       -- always ascending
UPDATE acct SET bal = bal - 10 WHERE id = 1;
UPDATE acct SET bal = bal + 10 WHERE id = 2;
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`],
        [`Hot rows (counters, sequences, "latest" pointers) serialize all writers. Shard the counter, queue updates, or switch to append-only inserts aggregated later.`,
            r`SELECT object_name, COUNT(*) AS waiting FROM performance_schema.data_lock_waits w JOIN performance_schema.data_locks l ON l.engine_lock_id = w.requesting_engine_lock_id GROUP BY object_name;

-- OUTPUT: (example)
-- object_name | waiting
-- counters    | 48           (a hot row)`],
        [`Real-world retry wrapper: catch 1213 and 1205, roll back, wait with exponential backoff and jitter, and retry the entire transaction a few times before failing.`,
            r`for (int attempt = 1; attempt <= 3; attempt++) {
    try { transferService.transfer(from, to, amount); return; }
    catch (CannotAcquireLockException | DeadlockLoserDataAccessException e) {
        if (attempt == 3) throw e;
        Thread.sleep((long) (50 * Math.pow(2, attempt) + ThreadLocalRandom.current().nextInt(30)));
    }
}

-- OUTPUT:
-- transfer succeeded on attempt 2`]
    )
};
