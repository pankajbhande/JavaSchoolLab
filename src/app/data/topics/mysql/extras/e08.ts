// Modules 19-21 (Transactions, Isolation Levels, Locks & Concurrency) extras.
import { x, r, type Extra } from './extra';

export const e08: Record<string, Extra> = {
    'ACID Properties': x(
        ['ACID describes reliable transactions: Atomicity (all or nothing), Consistency (rules stay valid), Isolation (concurrent transactions do not interfere), Durability (committed data survives crashes).',
            'InnoDB supports ACID; MyISAM does not.',
            'Classic example: a bank transfer debits one account and credits another as one unit.'],
        ['Atomicity uses the undo log; durability uses the redo log flushed at commit.',
            'Isolation is configurable through isolation levels and implemented with MVCC and locks.',
            'Consistency means constraints (PK, FK, CHECK, UNIQUE) hold after each transaction, but business rules still need correct code.'],
        ['Durability depends on settings: <code>innodb_flush_log_at_trx_commit=1</code> and <code>sync_binlog=1</code> for full safety; relaxing them trades safety for speed.',
            'ACID is per node; across services you need sagas, outbox or two-phase commit, which change guarantees.',
            'Know what your isolation level really promises before relying on it for invariants.'],
        [['F', 'What does ACID stand for?', 'Atomicity, Consistency, Isolation, Durability.'],
            ['F', 'Which MySQL engine supports ACID?', 'InnoDB.'],
            ['M', 'How does InnoDB provide atomicity and durability?', 'Atomicity through the undo log (rollback), durability through the redo log written at commit.'],
            ['M', 'Which settings make commits fully durable?', '<code>innodb_flush_log_at_trx_commit=1</code> and <code>sync_binlog=1</code>.'],
            ['S', 'Do ACID guarantees extend across microservices?', 'No; each database is ACID locally. Cross-service consistency needs sagas, outbox pattern or distributed transactions.'],
            ['S', 'Is consistency in ACID the same as in CAP?', 'No. ACID consistency means valid state per constraints; CAP consistency means all nodes see the same data.']],
        [['Atomicity demo.',
            r`CREATE TABLE acct (id INT PRIMARY KEY, bal DECIMAL(10,2) NOT NULL CHECK (bal >= 0));
INSERT INTO acct VALUES (1,1000),(2,0);
START TRANSACTION;
UPDATE acct SET bal = bal - 500 WHERE id = 1;
UPDATE acct SET bal = bal - 600 WHERE id = 1;   -- violates CHECK
ROLLBACK;
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT:
-- bal
-- 1000.00`],
            ['Check durability settings.',
                r`SHOW VARIABLES WHERE Variable_name IN ('innodb_flush_log_at_trx_commit','sync_binlog');

-- OUTPUT:
-- innodb_flush_log_at_trx_commit | 1
-- sync_binlog                    | 1`]],
        [['Consistency: constraint rejects an invalid state.',
            r`UPDATE acct SET bal = bal - 2000 WHERE id = 1;

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'acct_chk_1' is violated.`],
            ['Isolation: reader does not see uncommitted data.',
                r`-- session A
START TRANSACTION; UPDATE acct SET bal = 0 WHERE id = 1;
-- session B
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT: (session B)
-- bal
-- 1000.00`]]
    ),

    'START TRANSACTION, COMMIT & ROLLBACK': x(
        ['<code>START TRANSACTION</code> (or BEGIN) opens a transaction, <code>COMMIT</code> saves the changes, <code>ROLLBACK</code> cancels them.',
            'By default MySQL runs in autocommit mode: each statement commits itself.',
            'Inside a transaction, other sessions do not see your changes until COMMIT.'],
        ['Keep transactions short: they hold locks and undo history until they end.',
            'DDL statements (CREATE, ALTER, DROP, TRUNCATE) cause an implicit commit.',
            'Check autocommit with <code>SELECT @@autocommit</code>; set it to 0 to start transactions implicitly.'],
        ['Long-running or forgotten transactions block purge (history list grows), hold locks and cause lock waits and replication lag.',
            'Handle deadlocks (error 1213) and lock timeouts (1205) with a bounded retry of the whole transaction.',
            'Never do remote calls or user waits inside a transaction.'],
        [['F', 'How do you undo changes in a transaction?', '<code>ROLLBACK;</code>'],
            ['F', 'What is autocommit?', 'A mode where each statement is committed automatically; on by default.'],
            ['M', 'Which statements cause an implicit commit?', 'DDL such as CREATE/ALTER/DROP/TRUNCATE and some administrative statements.'],
            ['M', 'What happens if the connection drops mid-transaction?', 'The server rolls back the uncommitted transaction.'],
            ['S', 'How do you detect long transactions?', 'Query <code>information_schema.innodb_trx</code> ordered by trx_started.'],
            ['S', 'How do you handle deadlocks in code?', 'Catch error 1213 and retry the whole transaction with backoff, keeping lock order consistent to reduce them.']],
        [['Commit and rollback.',
            r`START TRANSACTION;
UPDATE acct SET bal = bal - 100 WHERE id = 1;
UPDATE acct SET bal = bal + 100 WHERE id = 2;
COMMIT;
SELECT id, bal FROM acct ORDER BY id;

-- OUTPUT:
-- id | bal
--  1 | 900.00
--  2 | 100.00`],
            ['Rollback restores values.',
                r`START TRANSACTION;
DELETE FROM acct;
ROLLBACK;
SELECT COUNT(*) FROM acct;

-- OUTPUT:
-- COUNT(*)
-- 2`]],
        [['Find long transactions.',
            r`SELECT trx_id, trx_started, TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS secs, trx_rows_locked
FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 3;

-- OUTPUT: (example)
-- trx_id | trx_started         | secs | trx_rows_locked
-- 12345  | 2026-05-01 10:00:00 |  900 | 120`],
            ['DDL commits implicitly.',
                r`START TRANSACTION;
INSERT INTO acct VALUES (3, 5);
CREATE TABLE tmp_x (id INT);   -- implicit COMMIT
ROLLBACK;
SELECT COUNT(*) FROM acct WHERE id = 3;

-- OUTPUT:
-- COUNT(*)
-- 1`]]
    ),

    'SAVEPOINT': x(
        ['A SAVEPOINT marks a point inside a transaction to which you can partially roll back without ending the transaction.',
            'Commands: <code>SAVEPOINT name</code>, <code>ROLLBACK TO SAVEPOINT name</code>, <code>RELEASE SAVEPOINT name</code>.',
            'Everything before the savepoint is kept.'],
        ['Rolling back to a savepoint undoes statements after it but keeps locks acquired earlier in InnoDB.',
            'Savepoints let batch jobs skip a failing item and continue.',
            'ORMs use savepoints for nested transactions (<code>REQUIRES_NEW</code> is different: it uses a new transaction).'],
        ['Many savepoints add overhead; use for coarse steps, not per row in huge loops.',
            'Transaction semantics with savepoints complicate retry logic; keep recovery logic simple.',
            'After ROLLBACK TO, the transaction is still open and must be committed or rolled back.'],
        [['F', 'What is a savepoint?', 'A named point in a transaction you can roll back to.'],
            ['F', 'Does ROLLBACK TO end the transaction?', 'No, the transaction remains open.'],
            ['M', 'Does rolling back to a savepoint release row locks?', 'Not necessarily; InnoDB keeps locks acquired before the savepoint and may keep some after.'],
            ['M', 'How do you remove a savepoint?', '<code>RELEASE SAVEPOINT name;</code>'],
            ['S', 'How do ORMs use savepoints?', 'Nested @Transactional(NESTED) or atomic() blocks create savepoints to allow partial rollback within one outer transaction.'],
            ['S', 'Savepoint vs separate transaction?', 'A savepoint stays inside the outer atomic unit; a separate transaction commits independently and can leave partial results.']],
        [['Partial rollback.',
            r`START TRANSACTION;
INSERT INTO acct VALUES (10, 100);
SAVEPOINT sp1;
INSERT INTO acct VALUES (11, 200);
ROLLBACK TO SAVEPOINT sp1;
COMMIT;
SELECT id FROM acct WHERE id >= 10;

-- OUTPUT:
-- id
-- 10`],
            ['Release a savepoint.',
                r`START TRANSACTION;
SAVEPOINT a;
RELEASE SAVEPOINT a;
ROLLBACK TO SAVEPOINT a;

-- OUTPUT:
-- ERROR 1305 (42000): SAVEPOINT a does not exist`]],
        [['Batch import skipping bad rows (stored procedure pattern).',
            r`-- for each row: SAVEPOINT row_sp; INSERT ...; on error ROLLBACK TO SAVEPOINT row_sp;
START TRANSACTION;
SAVEPOINT row_sp; INSERT INTO acct VALUES (20, -1); -- fails CHECK
ROLLBACK TO SAVEPOINT row_sp;
INSERT INTO acct VALUES (21, 50);
COMMIT;

-- OUTPUT:
-- (row 21 inserted, row 20 skipped, transaction committed)`],
            ['Spring nested transaction (Java).',
                r`@Transactional(propagation = Propagation.NESTED)
public void importRow(Row r) { repo.save(r); }

-- OUTPUT:
-- SAVEPOINT SAVEPOINT_1  ...  ROLLBACK TO SAVEPOINT SAVEPOINT_1 on exception`]]
    ),

    'READ UNCOMMITTED': x(
        ['The lowest isolation level: a transaction can read changes that other transactions have not committed yet (dirty reads).',
            'It is rarely used because data can be read and then rolled back.',
            'Set it with <code>SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;</code>'],
        ['Reads can see data that never officially existed.',
            'It avoids some read locking, but InnoDB reads are already non-locking under MVCC, so the benefit is small.',
            'Writes still lock rows.'],
        ['Use only for approximate monitoring on hot tables where exactness does not matter.',
            'Better alternatives: replicas for reporting, snapshot reads, caching.',
            'Never use it for money or inventory.'],
        [['F', 'What problem does READ UNCOMMITTED allow?', 'Dirty reads: seeing uncommitted changes of other transactions.'],
            ['F', 'Is it the safest level?', 'No, it is the least safe level.'],
            ['M', 'Why is it rarely beneficial in InnoDB?', 'InnoDB consistent reads at higher levels do not take shared locks anyway, so the performance gain is minimal.'],
            ['M', 'Which anomalies can occur?', 'Dirty, non-repeatable and phantom reads.'],
            ['S', 'When could it be acceptable?', 'For rough live counters or debugging dashboards where seeing in-flight values is harmless.'],
            ['S', 'How do you avoid dirty reads in reporting?', 'Use READ COMMITTED/REPEATABLE READ on a replica, or snapshot-based exports.']],
        [['Dirty read demo.',
            r`-- session A
START TRANSACTION; UPDATE acct SET bal = 0 WHERE id = 1;
-- session B
SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT: (session B)
-- bal
-- 0.00`],
            ['Session A rolls back, B read data that never existed.',
                r`-- session A
ROLLBACK;
-- session B
SELECT bal FROM acct WHERE id = 1;

-- OUTPUT:
-- bal
-- 1000.00`]],
        [['Check current level.',
            r`SELECT @@transaction_isolation;

-- OUTPUT:
-- @@transaction_isolation
-- REPEATABLE-READ`],
            ['Set for a single transaction.',
                r`SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
START TRANSACTION;
SELECT COUNT(*) FROM events;
COMMIT;

-- OUTPUT:
-- COUNT(*)
-- 1204331`]]
    ),

    'READ COMMITTED': x(
        ['READ COMMITTED means each statement sees only data committed before that statement started.',
            'It prevents dirty reads but allows non-repeatable reads and phantoms.',
            'It is the default in PostgreSQL and Oracle, and popular in MySQL for high concurrency.'],
        ['Every SELECT gets a fresh snapshot, so repeating a query in the same transaction can return different rows.',
            'It takes fewer gap locks, reducing deadlocks and lock waits for write-heavy workloads.',
            'With binlog_format=ROW it is safe for replication; statement format is limited.'],
        ['Many large systems choose READ COMMITTED to lower locking, accepting that logic must tolerate non-repeatable reads.',
            'Use explicit locking (<code>FOR UPDATE</code>) or optimistic version checks for invariants.',
            'Requires binlog_format=ROW or MIXED for correct replication.'],
        [['F', 'What does READ COMMITTED prevent?', 'Dirty reads.'],
            ['F', 'Can the same SELECT return different results inside one transaction?', 'Yes, if another transaction commits in between.'],
            ['M', 'Why does READ COMMITTED reduce deadlocks?', 'InnoDB uses fewer gap/next-key locks, so fewer ranges are locked.'],
            ['M', 'Which binlog format is needed?', 'ROW (or MIXED) for safe replication.'],
            ['S', 'Why would a team switch MySQL to READ COMMITTED?', 'To reduce lock contention and deadlocks in write-heavy OLTP, with logic tolerant of non-repeatable reads.'],
            ['S', 'How do you protect invariants under READ COMMITTED?', 'Use unique constraints, SELECT ... FOR UPDATE, atomic UPDATE with conditions, or optimistic versioning.']],
        [['Non-repeatable read.',
            r`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION;
SELECT bal FROM acct WHERE id = 1;      -- 1000
-- another session commits: UPDATE acct SET bal = 900 WHERE id = 1;
SELECT bal FROM acct WHERE id = 1;      -- 900
COMMIT;

-- OUTPUT:
-- 1000.00
-- 900.00`],
            ['Atomic conditional update avoids lost update.',
                r`UPDATE acct SET bal = bal - 100 WHERE id = 1 AND bal >= 100;
SELECT ROW_COUNT();

-- OUTPUT:
-- ROW_COUNT()
-- 1`]],
        [['Change the global default.',
            r`SET GLOBAL TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT @@global.transaction_isolation;

-- OUTPUT:
-- READ-COMMITTED`],
            ['Config file equivalent.',
                r`[mysqld]
transaction-isolation = READ-COMMITTED
binlog_format = ROW

-- OUTPUT: (after restart)
-- @@transaction_isolation = READ-COMMITTED`]]
    ),

    'REPEATABLE READ': x(
        ['REPEATABLE READ is the default isolation level in InnoDB. A transaction sees a consistent snapshot taken at its first read.',
            'Repeating the same SELECT gives the same rows, even if others commit changes.',
            'It prevents dirty and non-repeatable reads.'],
        ['InnoDB also prevents most phantom reads using next-key locks for locking reads and a snapshot for plain reads.',
            'Writes see the latest committed data, not the snapshot, which can surprise people (UPDATE affects rows newer than the snapshot).',
            'Long transactions at this level keep old row versions alive, growing undo.'],
        ['Gap and next-key locks under REPEATABLE READ can cause unexpected lock waits and deadlocks on range queries.',
            'Mixed snapshot reads and current reads in one transaction produce subtle anomalies; use FOR UPDATE for decisions.',
            'Monitor history list length; keep transactions short.'],
        [['F', 'What is the default isolation level in InnoDB?', 'REPEATABLE READ.'],
            ['F', 'What does it guarantee?', 'Repeated consistent reads return the same data within a transaction.'],
            ['M', 'How does InnoDB reduce phantoms at this level?', 'Next-key (record + gap) locks on locking reads, plus snapshot reads for plain SELECT.'],
            ['M', 'Can an UPDATE affect rows not visible in your snapshot?', 'Yes, writes operate on the latest committed rows (current read).'],
            ['S', 'Why can REPEATABLE READ cause deadlocks?', 'Gap and next-key locks lock ranges, so concurrent inserts/updates on nearby keys can block each other.'],
            ['S', 'Why monitor the history list length?', 'Long snapshots prevent purge of undo records, bloating the undo tablespace and slowing queries.']],
        [['Repeatable read demo.',
            r`START TRANSACTION;
SELECT bal FROM acct WHERE id = 1;          -- 1000
-- other session: UPDATE acct SET bal = 900 WHERE id = 1; COMMIT;
SELECT bal FROM acct WHERE id = 1;          -- still 1000
COMMIT;

-- OUTPUT:
-- 1000.00
-- 1000.00`],
            ['Current read versus snapshot read.',
                r`START TRANSACTION;
SELECT bal FROM acct WHERE id = 1;                      -- snapshot: 1000
SELECT bal FROM acct WHERE id = 1 FOR UPDATE;           -- current: 900
COMMIT;

-- OUTPUT:
-- 1000.00
-- 900.00`]],
        [['Monitor undo history.',
            r`SELECT count FROM information_schema.innodb_metrics WHERE name = 'trx_rseg_history_len';

-- OUTPUT: (example)
-- count
-- 245`],
            ['Switch level for one session.',
                r`SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT @@transaction_isolation;

-- OUTPUT:
-- REPEATABLE-READ`]]
    ),

    'SERIALIZABLE': x(
        ['SERIALIZABLE is the strictest level: transactions behave as if they ran one after another.',
            'InnoDB turns plain SELECTs into <code>LOCK IN SHARE MODE</code> reads when autocommit is off.',
            'It prevents dirty, non-repeatable and phantom reads but greatly reduces concurrency.'],
        ['Readers block writers and vice versa, so lock waits and deadlocks rise.',
            'Use only for short critical sections that truly need full isolation.',
            'Often a targeted <code>SELECT ... FOR UPDATE</code> at a lower level is enough.'],
        ['Serializable throughput drops sharply under contention; design with retries.',
            'Prefer constraints and conditional updates over blanket serializable isolation.',
            'Test under concurrency to see the cost before adopting.'],
        [['F', 'Which level is the strictest?', 'SERIALIZABLE.'],
            ['F', 'What is the downside?', 'Much lower concurrency and more lock waits/deadlocks.'],
            ['M', 'How does InnoDB implement it?', 'By making ordinary reads locking reads (shared locks) inside transactions.'],
            ['M', 'When use it?', 'Rarely, for short critical sections needing strict correctness that cannot be achieved with simpler constraints.'],
            ['S', 'Alternatives to SERIALIZABLE for invariants?', 'Unique constraints, atomic conditional updates, SELECT ... FOR UPDATE, optimistic locking or queueing writes.'],
            ['S', 'How should applications behave under SERIALIZABLE?', 'Expect failures; retry the whole transaction on deadlock or lock timeout.']],
        [['Readers block writers.',
            r`-- session A
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION; SELECT * FROM acct WHERE id = 1;
-- session B
UPDATE acct SET bal = bal + 1 WHERE id = 1;

-- OUTPUT: (session B waits)
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction`],
            ['Phantom prevented.',
                r`-- session A (SERIALIZABLE)
START TRANSACTION; SELECT COUNT(*) FROM acct WHERE bal > 500;
-- session B tries INSERT INTO acct VALUES (99, 800) and waits until A commits

-- OUTPUT: (A)
-- COUNT(*)
-- 1`]],
        [['Cheaper invariant with conditional update.',
            r`UPDATE inventory SET qty = qty - 1 WHERE sku = 'A1' AND qty > 0;
SELECT ROW_COUNT();

-- OUTPUT:
-- ROW_COUNT()
-- 1   (0 means sold out)`],
            ['Retry loop concept.',
                r`-- pseudo-code
-- for attempt in 1..3: try { run tx } catch (1213 or 1205) { sleep(backoff); }

-- OUTPUT:
-- succeeded on attempt 2`]]
    ),

    'Dirty, Non-Repeatable & Phantom Reads': x(
        ['Dirty read: reading uncommitted data. Non-repeatable read: the same row changes between two reads. Phantom read: the same range query returns new rows.',
            'Isolation levels decide which of these can happen.',
            'READ UNCOMMITTED allows all three; SERIALIZABLE allows none.'],
        ['Table: READ COMMITTED prevents dirty only; REPEATABLE READ prevents dirty and non-repeatable (and mostly phantoms in InnoDB); SERIALIZABLE prevents all.',
            'Phantoms involve rows appearing or disappearing from a range or count.',
            'Choose a level based on which anomalies your logic can tolerate.'],
        ['Anomalies appear as rare production bugs (double booking, negative stock); reproduce with two sessions and sleeps.',
            'Fix by the narrowest tool: constraint, conditional update, FOR UPDATE, or a higher isolation level.',
            'Write tests that run two transactions concurrently for critical flows.'],
        [['F', 'What is a dirty read?', 'Reading data from another transaction that has not committed.'],
            ['F', 'What is a phantom read?', 'A repeated range query returns additional or missing rows because another transaction inserted or deleted.'],
            ['M', 'Which level prevents non-repeatable reads?', 'REPEATABLE READ and SERIALIZABLE.'],
            ['M', 'Difference between non-repeatable and phantom?', 'Non-repeatable: a row you read changes. Phantom: the set of rows matching a condition changes.'],
            ['S', 'How do you test for isolation anomalies?', 'Open two sessions, interleave statements deterministically, or use concurrency tests/Jepsen-style harnesses.'],
            ['S', 'How does InnoDB handle phantoms at REPEATABLE READ?', 'Snapshot reads do not see new rows; locking reads use next-key locks to block inserts into the scanned range.']],
        [['Non-repeatable read at READ COMMITTED.',
            r`-- A: START TRANSACTION; SELECT bal FROM acct WHERE id=1;   -- 1000
-- B: UPDATE acct SET bal = 900 WHERE id=1; COMMIT;
-- A: SELECT bal FROM acct WHERE id=1;                      -- 900

-- OUTPUT:
-- 1000.00 then 900.00`],
            ['Phantom at READ COMMITTED.',
                r`-- A: SELECT COUNT(*) FROM acct WHERE bal > 500;   -- 1
-- B: INSERT INTO acct VALUES (30, 700); COMMIT;
-- A: SELECT COUNT(*) FROM acct WHERE bal > 500;   -- 2

-- OUTPUT:
-- 1 then 2`]],
        [['Locking read blocks the phantom (REPEATABLE READ).',
            r`-- A: START TRANSACTION; SELECT * FROM acct WHERE bal > 500 FOR UPDATE;
-- B: INSERT INTO acct VALUES (31, 800);   -- waits (gap lock)

-- OUTPUT: (B)
-- (blocked until A commits or lock wait timeout)`],
            ['Matrix of anomalies.',
                r`SELECT 'READ UNCOMMITTED' AS level, 'yes' AS dirty, 'yes' AS non_repeatable, 'yes' AS phantom
UNION ALL SELECT 'READ COMMITTED','no','yes','yes'
UNION ALL SELECT 'REPEATABLE READ','no','no','mostly no (InnoDB)'
UNION ALL SELECT 'SERIALIZABLE','no','no','no';

-- OUTPUT:
-- level            | dirty | non_repeatable | phantom
-- READ UNCOMMITTED | yes   | yes            | yes
-- READ COMMITTED   | no    | yes            | yes
-- REPEATABLE READ  | no    | no             | mostly no (InnoDB)
-- SERIALIZABLE     | no    | no             | no`]]
    ),

    'Lost Update': x(
        ['A lost update happens when two transactions read the same value, both change it, and the second write overwrites the first.',
            'Example: two users read stock = 10, both subtract 1 and write 9, but it should be 8.',
            'Avoid it with atomic updates like <code>SET qty = qty - 1</code>.'],
        ['Fixes: atomic expression update, <code>SELECT ... FOR UPDATE</code> (pessimistic), version column check (optimistic).',
            'Isolation level alone does not prevent it under READ COMMITTED; REPEATABLE READ in InnoDB still allows read-modify-write races with plain SELECT.',
            'Use affected-row counts to detect failed optimistic updates.'],
        ['Optimistic locking scales well for low conflict; pessimistic locking suits high conflict hot rows.',
            'For counters under heavy contention use sharded counters or queues.',
            'Always read-modify-write inside the database (single statement) when possible.'],
        [['F', 'What is a lost update?', 'One transaction’s change is overwritten by another that read the old value.'],
            ['F', 'Simplest fix?', 'Do the change in one atomic statement: <code>UPDATE ... SET qty = qty - 1</code>.'],
            ['M', 'How does SELECT ... FOR UPDATE prevent it?', 'It locks the row so a second transaction must wait until the first commits.'],
            ['M', 'How does optimistic locking work?', 'Include a version in the WHERE; if ROW_COUNT is 0, someone else changed it and you retry.'],
            ['S', 'Pessimistic or optimistic?', 'Optimistic for low contention and long user think time; pessimistic for short, high-conflict critical sections.'],
            ['S', 'How to handle a hot counter row?', 'Use sharded counter rows, batch/aggregate in memory or a queue, and sum on read.']],
        [['Racy read-modify-write.',
            r`-- A: SELECT qty FROM stock WHERE sku='A';          -- 10
-- B: SELECT qty FROM stock WHERE sku='A';          -- 10
-- A: UPDATE stock SET qty = 9 WHERE sku='A';
-- B: UPDATE stock SET qty = 9 WHERE sku='A';       -- should be 8

-- OUTPUT:
-- qty = 9  (one decrement lost)`],
            ['Atomic fix.',
                r`UPDATE stock SET qty = qty - 1 WHERE sku = 'A' AND qty > 0;

-- OUTPUT:
-- Query OK, 1 row affected   (two sessions end at 8)`]],
        [['Optimistic locking.',
            r`UPDATE products SET price = 120, version = version + 1 WHERE id = 7 AND version = 3;
SELECT ROW_COUNT();

-- OUTPUT:
-- ROW_COUNT()
-- 0     (stale version: reload and retry)`],
            ['Pessimistic locking.',
                r`START TRANSACTION;
SELECT qty FROM stock WHERE sku = 'A' FOR UPDATE;
UPDATE stock SET qty = qty - 1 WHERE sku = 'A';
COMMIT;

-- OUTPUT:
-- qty
-- 10`]]
    ),

    'Shared & Exclusive Locks': x(
        ['A shared (S) lock allows reading and lets others also read. An exclusive (X) lock is needed to write and blocks others from reading with locks or writing.',
            'Multiple S locks can coexist; an X lock is exclusive.',
            'In SQL: <code>FOR SHARE</code> takes S locks; <code>FOR UPDATE</code> takes X locks.'],
        ['Plain consistent SELECTs take no locks in InnoDB (MVCC).',
            'UPDATE and DELETE take X locks on rows they touch.',
            'Compatibility: S with S is fine; S with X or X with X must wait.'],
        ['Inspect locks with <code>performance_schema.data_locks</code> and <code>data_lock_waits</code> (8.0).',
            'Keep lock hold time short and access rows in a consistent order.',
            'Locking reads inside long transactions are a main source of contention.'],
        [['F', 'What is a shared lock?', 'A read lock that allows other readers but blocks writers.'],
            ['F', 'What is an exclusive lock?', 'A write lock that blocks other readers (locking) and writers.'],
            ['M', 'Do plain SELECTs take locks in InnoDB?', 'No, they use consistent snapshot reads.'],
            ['M', 'Which statement takes an S lock?', '<code>SELECT ... FOR SHARE</code> (LOCK IN SHARE MODE).'],
            ['S', 'How do you see who blocks whom?', 'Query <code>sys.innodb_lock_waits</code> or <code>performance_schema.data_lock_waits</code>.'],
            ['S', 'How to reduce lock contention?', 'Shorter transactions, indexed predicates to lock fewer rows, consistent lock order, lower isolation or optimistic approaches.']],
        [['Shared vs exclusive.',
            r`-- A
START TRANSACTION; SELECT * FROM acct WHERE id = 1 FOR SHARE;
-- B
SELECT * FROM acct WHERE id = 1 FOR SHARE;      -- works
UPDATE acct SET bal = bal + 1 WHERE id = 1;      -- waits

-- OUTPUT: (B update)
-- (blocked until A commits)`],
            ['See current locks.',
                r`SELECT object_name, index_name, lock_type, lock_mode, lock_data FROM performance_schema.data_locks;

-- OUTPUT: (example)
-- object_name | index_name | lock_type | lock_mode | lock_data
-- acct        | NULL       | TABLE     | IS        | NULL
-- acct        | PRIMARY    | RECORD    | S,REC_NOT_GAP | 1`]],
        [['Who blocks whom.',
            r`SELECT waiting_pid, waiting_query, blocking_pid, blocking_query FROM sys.innodb_lock_waits;

-- OUTPUT: (example)
-- waiting_pid | waiting_query            | blocking_pid | blocking_query
-- 22          | UPDATE acct SET bal = ...|           19 | NULL (idle in transaction)`],
            ['Kill the blocker.',
                r`KILL 19;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Row-Level vs Table Locks': x(
        ['Row-level locks lock only the rows touched (InnoDB). Table locks lock the whole table (MyISAM, or <code>LOCK TABLES</code>).',
            'Row locks allow many sessions to work on different rows of the same table at once.',
            'InnoDB uses row locks by default, plus intention locks on the table.'],
        ['InnoDB row locks are placed on index entries; a query without a useful index may lock many rows (or effectively all).',
            'Intention locks (IS, IX) at table level signal that row locks exist; they conflict only with table-level locks.',
            '<code>LOCK TABLES</code> is rarely needed in InnoDB and blocks concurrency.'],
        ['A missing index on the WHERE column of an UPDATE can lock far more rows than needed, causing contention; always index update/delete predicates.',
            'Metadata locks (MDL) also exist: DDL waits for open transactions on a table and blocks new ones behind it.',
            'Long transactions plus ALTER TABLE cause "Waiting for table metadata lock" pile-ups.'],
        [['F', 'Which locking does InnoDB use?', 'Row-level locking.'],
            ['F', 'What is a table lock?', 'A lock on the entire table, blocking other writers or readers.'],
            ['M', 'Why can an UPDATE without an index lock many rows?', 'InnoDB must scan and lock the rows it examines, which can be most of the table.'],
            ['M', 'What are intention locks?', 'Table-level IS/IX locks showing that a transaction has row locks, enabling quick conflict checks with table locks.'],
            ['S', 'What is a metadata lock and why does ALTER TABLE hang?', 'MDL protects table structure; ALTER waits for open transactions and queues new queries behind it, causing pile-ups.'],
            ['S', 'How do you run DDL safely?', 'Ensure no long transactions, set <code>lock_wait_timeout</code>, use online DDL or gh-ost, and run in low traffic.']],
        [['Index limits locked rows.',
            r`EXPLAIN UPDATE orders2 SET status = 'X' WHERE customer_id = 7;

-- OUTPUT: (example)
-- type  | key     | rows
-- range | idx_cov | 12      (locks about 12 rows, not the whole table)`],
            ['Explicit table lock.',
                r`LOCK TABLES acct WRITE;
UPDATE acct SET bal = bal + 1;
UNLOCK TABLES;

-- OUTPUT:
-- Query OK, 3 rows affected`]],
        [['Metadata lock pile-up.',
            r`SELECT object_name, lock_type, lock_status, owner_thread_id FROM performance_schema.metadata_locks WHERE object_name = 'acct';

-- OUTPUT: (example)
-- object_name | lock_type    | lock_status | owner_thread_id
-- acct        | SHARED_READ  | GRANTED     | 31
-- acct        | EXCLUSIVE    | PENDING     | 40`],
            ['Fail fast on DDL.',
                r`SET SESSION lock_wait_timeout = 5;
ALTER TABLE acct ADD COLUMN note VARCHAR(20);

-- OUTPUT:
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction`]]
    ),

    'Record, Gap & Next-Key Locks': x(
        ['InnoDB has record locks (on an index entry), gap locks (the gap between entries) and next-key locks (record plus the gap before it).',
            'They are used mainly at REPEATABLE READ to prevent phantoms.',
            'A gap lock stops other transactions from inserting into the locked range.'],
        ['Range queries with locking reads (<code>FOR UPDATE</code>) lock the scanned range and the gap after it.',
            'Unique index equality on an existing row takes only a record lock; non-unique or missing keys take gap/next-key locks.',
            'At READ COMMITTED gap locks are mostly disabled.'],
        ['Gap locks are a frequent hidden cause of deadlocks and insert stalls; inspect <code>data_locks</code> with lock_mode like <code>X,GAP</code>.',
            'Two sessions can both hold the same gap lock (they do not conflict) and then deadlock on inserts.',
            'Design queries to use unique equality when possible, narrow ranges and proper indexes.'],
        [['F', 'What is a gap lock?', 'A lock on the space between index records, preventing inserts there.'],
            ['F', 'What is a next-key lock?', 'A record lock plus a gap lock on the gap before the record.'],
            ['M', 'When does InnoDB take only a record lock?', 'For an equality search on a unique index that finds an existing row.'],
            ['M', 'Which isolation level mostly avoids gap locks?', 'READ COMMITTED.'],
            ['S', 'Why do gap locks cause deadlocks?', 'Two transactions can hold compatible gap locks on the same gap, then both try to insert into it and wait for each other.'],
            ['S', 'How do you diagnose it?', '<code>SHOW ENGINE INNODB STATUS</code> latest deadlock section and <code>performance_schema.data_locks</code> showing GAP lock modes.']],
        [['Gap lock blocks insert.',
            r`-- table has ids 10 and 20
-- A
START TRANSACTION; SELECT * FROM t WHERE id BETWEEN 11 AND 19 FOR UPDATE;   -- locks the gap
-- B
INSERT INTO t VALUES (15);

-- OUTPUT: (B)
-- (waits; then ERROR 1205 Lock wait timeout exceeded)`],
            ['See gap locks.',
                r`SELECT index_name, lock_mode, lock_data FROM performance_schema.data_locks WHERE object_name = 't';

-- OUTPUT: (example)
-- index_name | lock_mode | lock_data
-- PRIMARY    | X,GAP     | 20`]],
        [['Same query at READ COMMITTED.',
            r`SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
START TRANSACTION; SELECT * FROM t WHERE id BETWEEN 11 AND 19 FOR UPDATE;
-- B: INSERT INTO t VALUES (15);  succeeds

-- OUTPUT:
-- Query OK, 1 row affected`],
            ['Unique equality takes a record lock only.',
                r`START TRANSACTION; SELECT * FROM t WHERE id = 10 FOR UPDATE;
SELECT lock_mode FROM performance_schema.data_locks WHERE lock_type = 'RECORD';

-- OUTPUT:
-- lock_mode
-- X,REC_NOT_GAP`]]
    ),

    'SELECT ... FOR UPDATE': x(
        ['<code>SELECT ... FOR UPDATE</code> reads rows and locks them exclusively until the transaction ends, so nobody else can modify them.',
            'Use it when you read a value and then update based on it.',
            'It must be inside a transaction to be useful.'],
        ['Add <code>NOWAIT</code> to fail immediately or <code>SKIP LOCKED</code> to skip locked rows (8.0), perfect for job queues.',
            'Lock only needed rows with an indexed WHERE; otherwise you lock many rows or gaps.',
            '<code>FOR SHARE</code> takes a shared lock instead.'],
        ['<code>SKIP LOCKED</code> enables scalable work queues in MySQL (multiple workers claim different rows).',
            'Keep the locked section short; avoid network calls while holding locks.',
            'Acquire locks in a consistent order (by primary key) to prevent deadlocks.'],
        [['F', 'What does FOR UPDATE do?', 'Locks the selected rows so other transactions cannot change them until you commit or roll back.'],
            ['F', 'Does it work outside a transaction?', 'With autocommit on, the lock is released immediately, so it is not useful; use it inside START TRANSACTION.'],
            ['M', 'What do NOWAIT and SKIP LOCKED do?', 'NOWAIT errors immediately if rows are locked; SKIP LOCKED ignores locked rows and returns the rest.'],
            ['M', 'Why index the WHERE of FOR UPDATE?', 'Without an index InnoDB locks every scanned row, blocking unrelated work.'],
            ['S', 'How do you build a job queue with it?', '<code>SELECT id FROM jobs WHERE status="NEW" ORDER BY id LIMIT 10 FOR UPDATE SKIP LOCKED</code>, mark them in progress, commit.'],
            ['S', 'How avoid deadlocks with multi-row locking?', 'Always lock rows in the same order (e.g. ascending id) and keep transactions short.']],
        [['Safe transfer.',
            r`START TRANSACTION;
SELECT bal FROM acct WHERE id IN (1,2) ORDER BY id FOR UPDATE;
UPDATE acct SET bal = bal - 100 WHERE id = 1;
UPDATE acct SET bal = bal + 100 WHERE id = 2;
COMMIT;

-- OUTPUT:
-- bal
-- 900.00
-- 100.00`],
            ['NOWAIT fails fast.',
                r`SELECT * FROM acct WHERE id = 1 FOR UPDATE NOWAIT;

-- OUTPUT: (when locked by another session)
-- ERROR 3572 (HY000): Statement aborted because lock(s) could not be acquired immediately and NOWAIT is set.`]],
        [['Work queue with SKIP LOCKED.',
            r`START TRANSACTION;
SELECT id FROM jobs WHERE status = 'NEW' ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED;
UPDATE jobs SET status = 'RUNNING' WHERE id IN (1, 2);
COMMIT;

-- OUTPUT:
-- id
-- 1
-- 2`],
            ['Unindexed predicate locks too much.',
                r`EXPLAIN SELECT * FROM jobs WHERE payload = 'x' FOR UPDATE;

-- OUTPUT: (example)
-- type | key  | rows
-- ALL  | NULL | 50000     (locks all scanned rows)`]]
    ),

    'Lock Contention & Deadlocks': x(
        ['Lock contention is when transactions wait for each other’s locks. A deadlock is a cycle of waits where nobody can proceed.',
            'InnoDB detects deadlocks, rolls back one transaction (the victim) and returns error 1213.',
            'You must retry the failed transaction.'],
        ['Reduce them: keep transactions short, lock rows in a consistent order, index predicates, avoid user waits inside transactions.',
            'Lock wait timeout (error 1205, default 50 s) is different from a deadlock.',
            'See the latest deadlock in <code>SHOW ENGINE INNODB STATUS</code>; log all with <code>innodb_print_all_deadlocks=ON</code>.'],
        ['Design for retries: idempotent operations and bounded retry with jitter.',
            'Hot rows (counters, sequences) cause contention; shard them or use queues.',
            'Monitor: lock waits, deadlock counts (<code>Innodb_deadlocks</code>), long transactions and p99 latency.'],
        [['F', 'What is a deadlock?', 'Two or more transactions each wait for locks held by the other, so none can continue.'],
            ['F', 'What does MySQL do on deadlock?', 'It rolls back one transaction and returns error 1213.'],
            ['M', 'How do you reduce deadlocks?', 'Consistent lock order, short transactions, good indexes and lower isolation where acceptable.'],
            ['M', 'Deadlock vs lock wait timeout?', 'Deadlock is a detected cycle (immediate rollback); timeout happens after waiting innodb_lock_wait_timeout seconds.'],
            ['S', 'How do you analyze a deadlock?', 'Read the LATEST DETECTED DEADLOCK section: queries, locks held and waited, then fix lock order or indexes.'],
            ['S', 'How do you keep a system stable under contention?', 'Retry with backoff, remove hot rows, queue writes, shorten critical sections and set sensible timeouts.']],
        [['Create a deadlock.',
            r`-- A: START TRANSACTION; UPDATE acct SET bal = bal WHERE id = 1;
-- B: START TRANSACTION; UPDATE acct SET bal = bal WHERE id = 2;
-- A: UPDATE acct SET bal = bal WHERE id = 2;   -- waits for B
-- B: UPDATE acct SET bal = bal WHERE id = 1;   -- deadlock

-- OUTPUT: (B)
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction`],
            ['Read the deadlock report.',
                r`SHOW ENGINE INNODB STATUS\G

-- OUTPUT: (excerpt)
-- LATEST DETECTED DEADLOCK
-- *** (1) TRANSACTION: ... UPDATE acct ... WAITING FOR THIS LOCK TO BE GRANTED
-- *** (2) TRANSACTION: ... HOLDS THE LOCK(S)
-- *** WE ROLL BACK TRANSACTION (2)`]],
        [['Consistent lock order avoids it.',
            r`START TRANSACTION;
SELECT id FROM acct WHERE id IN (1,2) ORDER BY id FOR UPDATE;   -- always ascending
UPDATE acct SET bal = bal - 10 WHERE id = 1;
UPDATE acct SET bal = bal + 10 WHERE id = 2;
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`],
            ['Log all deadlocks.',
                r`SET GLOBAL innodb_print_all_deadlocks = ON;
SHOW GLOBAL STATUS LIKE 'Innodb_deadlocks';

-- OUTPUT: (example)
-- Variable_name    | Value
-- Innodb_deadlocks | 3`]]
    )
};
