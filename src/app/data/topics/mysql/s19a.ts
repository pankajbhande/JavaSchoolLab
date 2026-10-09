// Module 19 (Transactions).
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s19a: Record<string, DeepDive> = {
    'ACID Properties': dd(
        [`<b>ACID</b> is the contract of a transaction: <b>Atomicity</b> (all or nothing), <b>Consistency</b> (constraints hold before and after), <b>Isolation</b> (concurrent transactions do not see each other's half-done work), <b>Durability</b> (committed data survives a crash). InnoDB implements them with undo logs, redo log, locks/MVCC and the doublewrite buffer.`,
            r`CREATE TABLE acct (id INT PRIMARY KEY, bal DECIMAL(10,2) NOT NULL CHECK (bal >= 0)) ENGINE=InnoDB;
INSERT INTO acct VALUES (1,100.00),(2,50.00);

START TRANSACTION;
UPDATE acct SET bal = bal - 30 WHERE id = 1;   -- debit
UPDATE acct SET bal = bal + 30 WHERE id = 2;   -- credit
COMMIT;                                        -- both changes become permanent together

SELECT * FROM acct;

-- OUTPUT:
-- +----+--------+
-- | id | bal    |
-- +----+--------+
-- |  1 |  70.00 |
-- |  2 |  80.00 |
-- +----+--------+`],
        [`Money transfers, order placement and inventory updates involve several statements that must succeed or fail as a unit. Without ACID a crash or error mid-way leaves data corrupted (money debited but never credited).`,
            r`-- Atomicity + Consistency: the CHECK constraint fails, so the whole transaction is undone.
START TRANSACTION;
UPDATE acct SET bal = bal + 500 WHERE id = 2;     -- ok so far
UPDATE acct SET bal = bal - 500 WHERE id = 1;     -- violates bal >= 0
ROLLBACK;                                         -- we undo the first update too
SELECT bal FROM acct WHERE id = 2;

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'acct_chk_1' is violated.
-- +--------+
-- | bal    |
-- +--------+
-- |  80.00 |      <- the +500 credit was rolled back
-- +--------+`],
        [`Real use: banking, e-commerce checkout, booking systems, ledger entries. Durability is tuned by <code>innodb_flush_log_at_trx_commit</code> (1 = flush redo to disk at every commit, the safe default) and <code>sync_binlog</code>.`,
            r`SHOW VARIABLES WHERE Variable_name IN ('innodb_flush_log_at_trx_commit','sync_binlog','innodb_doublewrite');

-- OUTPUT (defaults):
-- +--------------------------------+-------+
-- | Variable_name                  | Value |
-- +--------------------------------+-------+
-- | innodb_doublewrite             | ON    |
-- | innodb_flush_log_at_trx_commit | 1     |   <- fully durable
-- | sync_binlog                    | 1     |
-- +--------------------------------+-------+`],
        [`<b>Advantages:</b> data integrity under failure and concurrency, simple mental model (all-or-nothing), crash recovery via redo log replay and undo rollback of uncommitted work.`,
            r`-- Autocommit means every single statement is its own atomic transaction.
SELECT @@autocommit;
UPDATE acct SET bal = bal + 1 WHERE id = 1;   -- implicitly committed

-- OUTPUT:
-- +--------------+
-- | @@autocommit |
-- +--------------+
-- |            1 |
-- +--------------+`],
        [`<b>Disadvantages:</b> overhead (logging, locks, undo versions), long transactions bloat undo history and block purge, and strict isolation lowers concurrency.`,
            r`-- Spot long-running transactions that hold undo and locks.
SELECT trx_id, trx_started, TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS age_s
FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 3;

-- OUTPUT (example):
-- +--------+---------------------+-------+
-- | trx_id | trx_started         | age_s |
-- +--------+---------------------+-------+
-- | 421847 | 2024-05-01 10:00:03 |  1840 |   <- 30 minutes old: investigate
-- +--------+---------------------+-------+`],
        [`<b>Limitations:</b> only transactional engines (InnoDB) provide ACID; MyISAM and MEMORY ignore ROLLBACK. DDL statements cause an implicit commit (MySQL 8 DDL is atomic per statement but cannot be rolled back).`,
            r`START TRANSACTION;
INSERT INTO acct VALUES (3, 10.00);
CREATE TABLE tmp_x (a INT);       -- DDL: implicit COMMIT happens here
ROLLBACK;                         -- too late, nothing to roll back
SELECT COUNT(*) AS n FROM acct WHERE id = 3;

-- OUTPUT:
-- +---+
-- | n |
-- +---+
-- | 1 |    <- the insert survived because DDL committed it
-- +---+`],
        `
   BEGIN --> statements --> COMMIT
                 |            |
          undo log (rollback) redo log flushed (durable)

   A tomicity   -> undo log
   C onsistency -> constraints, FK, CHECK
   I solation   -> locks + MVCC snapshots
   D urability  -> redo log + doublewrite buffer
`,
        `Keep transactions short and scoped to one business invariant. Decide durability versus latency explicitly (flush settings, group commit, replication semi-sync) and never rely on application-side retries without idempotency. For cross-service work, ACID ends at the database boundary: use sagas/outbox.`
    ),

    'START TRANSACTION, COMMIT & ROLLBACK': dd(
        [`<code>START TRANSACTION</code> (or <code>BEGIN</code>) opens an explicit transaction and suspends autocommit until it ends. <code>COMMIT</code> makes all its changes permanent and visible; <code>ROLLBACK</code> discards them.`,
            r`CREATE TABLE stock (sku VARCHAR(10) PRIMARY KEY, qty INT) ENGINE=InnoDB;
INSERT INTO stock VALUES ('A',10),('B',5);

START TRANSACTION;                              -- autocommit is now off for this unit
UPDATE stock SET qty = qty - 2 WHERE sku = 'A';
COMMIT;                                         -- persist
SELECT * FROM stock;

-- OUTPUT:
-- +-----+------+
-- | sku | qty  |
-- +-----+------+
-- | A   |    8 |
-- | B   |    5 |
-- +-----+------+`],
        [`Multi-step business operations need a grouping tool. ROLLBACK lets you cancel when a later step fails, so you never leave half-finished data.`,
            r`START TRANSACTION;
UPDATE stock SET qty = qty - 1 WHERE sku = 'B';
SELECT qty FROM stock WHERE sku = 'B';          -- we see our own change: 4
ROLLBACK;                                       -- cancel
SELECT qty FROM stock WHERE sku = 'B';

-- OUTPUT:
-- +------+
-- |    4 |
-- +------+
-- +------+
-- |    5 |     <- restored
-- +------+`],
        [`Real use: checkout flows (decrement stock + create order + payment record), batch imports in chunks, and tests that roll back. Options: <code>START TRANSACTION READ ONLY</code>, <code>WITH CONSISTENT SNAPSHOT</code>, and <code>SET autocommit=0</code>.`,
            r`-- Consistent snapshot read-only transaction: ideal for reports and backups.
START TRANSACTION READ ONLY, WITH CONSISTENT SNAPSHOT;
SELECT SUM(qty) AS total FROM stock;
COMMIT;

-- OUTPUT:
-- +-------+
-- | total |
-- +-------+
-- |    13 |
-- +-------+`],
        [`<b>Advantages:</b> explicit control over atomic units; READ ONLY transactions skip some overhead; COMMIT AND CHAIN starts the next transaction immediately in the same settings.`,
            r`-- Chain: commit and immediately begin a new transaction with the same characteristics.
START TRANSACTION;
UPDATE stock SET qty = qty + 1 WHERE sku = 'A';
COMMIT AND CHAIN;
UPDATE stock SET qty = qty + 1 WHERE sku = 'A';
COMMIT;
SELECT qty FROM stock WHERE sku = 'A';

-- OUTPUT:
-- +------+
-- |   10 |
-- +------+`],
        [`<b>Disadvantages:</b> forgetting COMMIT leaves locks held and connections stuck "idle in transaction"; large transactions are slow to roll back (undo must be applied); errors do not auto-rollback the whole transaction in most cases.`,
            r`-- A statement error does NOT roll back earlier statements in the transaction.
START TRANSACTION;
UPDATE stock SET qty = 99 WHERE sku = 'A';        -- ok
INSERT INTO stock VALUES ('A', 1);                -- duplicate key: only this statement fails
COMMIT;                                           -- first UPDATE is still committed
SELECT qty FROM stock WHERE sku = 'A';

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'A' for key 'stock.PRIMARY'
-- +------+
-- |   99 |
-- +------+`],
        [`<b>Limitations:</b> transactions are per connection (not shared); no nested transactions (a BEGIN inside a transaction implicitly commits the first); DDL, LOCK TABLES and some admin statements implicitly commit; deadlock or lock-wait errors may roll back automatically.`,
            r`START TRANSACTION;
UPDATE stock SET qty = 1 WHERE sku = 'B';
START TRANSACTION;           -- implicit COMMIT of the previous work, then a new transaction
ROLLBACK;
SELECT qty FROM stock WHERE sku = 'B';

-- OUTPUT:
-- +------+
-- |    1 |    <- the first update was committed by the second START TRANSACTION
-- +------+`],
        `
   autocommit=1 (default)          explicit
   stmt -> auto COMMIT             START TRANSACTION
                                      stmt1
                                      stmt2 --error--> ROLLBACK (all undone)
                                      stmt3
                                   COMMIT (all persisted)
`,
        `Always pair BEGIN with COMMIT/ROLLBACK in a try/finally at the application layer, set sensible innodb_lock_wait_timeout, and monitor idle-in-transaction sessions. Retry on deadlock (1213) and lock-wait timeout (1205) with the whole transaction, not just the failed statement. Batch large writes in moderate chunks.`
    ),

    'SAVEPOINT': dd(
        [`A <b>SAVEPOINT</b> marks a named point inside a transaction. <code>ROLLBACK TO SAVEPOINT name</code> undoes work back to that point while the transaction stays open; <code>RELEASE SAVEPOINT</code> removes the marker.`,
            r`CREATE TABLE ledger (id INT AUTO_INCREMENT PRIMARY KEY, note VARCHAR(20)) ENGINE=InnoDB;

START TRANSACTION;
INSERT INTO ledger(note) VALUES ('step 1');
SAVEPOINT after_step1;                            -- marker
INSERT INTO ledger(note) VALUES ('step 2');
ROLLBACK TO SAVEPOINT after_step1;                -- undo only step 2
COMMIT;
SELECT note FROM ledger;

-- OUTPUT:
-- +--------+
-- | note   |
-- +--------+
-- | step 1 |
-- +--------+`],
        [`MySQL has no nested transactions, so savepoints give partial rollback: retry or skip one failing part of a larger unit without losing the work already done.`,
            r`-- Try an optional step; keep the main work if it fails.
START TRANSACTION;
INSERT INTO ledger(note) VALUES ('main work');
SAVEPOINT optional;
INSERT INTO ledger(id, note) VALUES (1, 'dup');   -- duplicate PK -> error
ROLLBACK TO optional;                             -- discard only the failed optional part
COMMIT;
SELECT COUNT(*) AS n FROM ledger;

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'ledger.PRIMARY'
-- +---+
-- | n |
-- +---+
-- | 2 |
-- +---+`],
        [`Real use: import loops where bad rows are skipped, stored procedures with per-item error handling, ORM frameworks (Spring nested transactions map to savepoints).`,
            r`-- Savepoint per item in a batch (conceptual pattern, e.g. inside a stored procedure loop):
--   SAVEPOINT item;  try insert;  on error: ROLLBACK TO item;
START TRANSACTION;
SAVEPOINT s1; INSERT INTO ledger(note) VALUES ('ok-1');
SAVEPOINT s2; INSERT INTO ledger(note) VALUES ('ok-2');
ROLLBACK TO s2;          -- drops ok-2, keeps ok-1; s2 still exists, s1 too
COMMIT;
SELECT note FROM ledger ORDER BY id DESC LIMIT 1;

-- OUTPUT:
-- +------+
-- | note |
-- +------+
-- | ok-1 |
-- +------+`],
        [`<b>Advantages:</b> fine-grained recovery inside one transaction, no need to restart everything, cheap to create (no I/O).`,
            r`-- Multiple savepoints form a stack; rolling back to an older one discards the newer ones.
START TRANSACTION;
INSERT INTO ledger(note) VALUES ('A');
SAVEPOINT p1;
INSERT INTO ledger(note) VALUES ('B');
SAVEPOINT p2;
ROLLBACK TO p1;                    -- p2 is destroyed
ROLLBACK TO p2;                    -- fails
ROLLBACK;

-- OUTPUT:
-- ERROR 1305 (42000): SAVEPOINT p2 does not exist`],
        [`<b>Disadvantages:</b> rolled-back rows still consumed AUTO_INCREMENT values; locks acquired after the savepoint are NOT released by ROLLBACK TO (InnoDB keeps them until the transaction ends); easy to over-complicate logic.`,
            r`START TRANSACTION;
SAVEPOINT sp;
INSERT INTO ledger(note) VALUES ('temp');         -- takes an id from the sequence
ROLLBACK TO sp;
INSERT INTO ledger(note) VALUES ('after');
COMMIT;
SELECT id, note FROM ledger ORDER BY id DESC LIMIT 1;

-- OUTPUT (example):
-- +----+-------+
-- | id | note  |
-- +----+-------+
-- |  5 | after |      <- gap: id 4 was consumed by the rolled-back row
-- +----+-------+`],
        [`<b>Limitations:</b> savepoints vanish on COMMIT or full ROLLBACK; they are not allowed to survive across connections; stored functions and triggers cannot issue transaction control, and ROLLBACK TO does not undo non-transactional table changes. Savepoints are also cleared by implicit commits (DDL).`,
            r`START TRANSACTION;
SAVEPOINT sp1;
CREATE TABLE tmp_sp (a INT);          -- DDL implicit commit: all savepoints are gone
ROLLBACK TO sp1;

-- OUTPUT:
-- ERROR 1305 (42000): SAVEPOINT sp1 does not exist`],
        `
   BEGIN
     insert A
     SAVEPOINT p1  <----+
     insert B           |  ROLLBACK TO p1: B undone,
     SAVEPOINT p2       |  A kept, p2 removed,
     insert C           |  transaction still open
   COMMIT (A persisted)
`,
        `Use savepoints for localised, retryable sub-steps, not as a substitute for sound transaction boundaries. Remember held locks persist until the end, so keep them short, and keep error handling (stored procedure DECLARE HANDLER) consistent with which savepoint it rolls back to.`
    ),
};
