// Module 25 (Triggers): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s25a: Record<string, DeepDive> = {
    'BEFORE Triggers': dd(
        [`A <b>BEFORE trigger</b> is a stored routine that MySQL fires automatically <i>before</i> a row is inserted, updated or deleted. Inside it you can read <code>NEW</code> (the incoming row) and <code>OLD</code> (the existing row) and, for INSERT/UPDATE, <b>modify NEW</b> so the corrected value is what actually gets stored.`,
            r`-- Self-contained demo: normalise an e-mail before it is stored
CREATE TABLE users (
  id    INT AUTO_INCREMENT PRIMARY KEY,   -- surrogate key
  email VARCHAR(100) NOT NULL             -- we want it lower-case and trimmed
);

DELIMITER $$                              -- change delimiter so the body can contain ;
CREATE TRIGGER trg_users_bi
BEFORE INSERT ON users                    -- fires before each inserted row
FOR EACH ROW                              -- MySQL has only row-level triggers
BEGIN
  SET NEW.email = LOWER(TRIM(NEW.email)); -- rewrite the value that will be stored
END$$
DELIMITER ;

INSERT INTO users (email) VALUES ('  Alice@Example.COM ');   -- messy input
SELECT id, email FROM users;                                  -- stored value is clean

-- OUTPUT:
-- +----+-------------------+
-- | id | email             |
-- +----+-------------------+
-- |  1 | alice@example.com |
-- +----+-------------------+`],
        [`Rules that must always hold - defaults, normalisation, validation - are safest when the database enforces them, because every client (web app, batch job, DBA console) goes through the same door. BEFORE triggers are the only place where you can <b>fix or reject</b> data before it touches the table; CHECK constraints can reject but cannot rewrite.`,
            r`-- Reject invalid data with SIGNAL (custom error) before it is written
CREATE TABLE accounts (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  balance DECIMAL(10,2) NOT NULL
);

DELIMITER $$
CREATE TRIGGER trg_accounts_bi
BEFORE INSERT ON accounts
FOR EACH ROW
BEGIN
  IF NEW.balance < 0 THEN                                 -- business rule
    SIGNAL SQLSTATE '45000'                               -- 45000 = user-defined error
      SET MESSAGE_TEXT = 'Opening balance cannot be negative';
  END IF;
END$$
DELIMITER ;

INSERT INTO accounts (balance) VALUES (100.00);           -- accepted
INSERT INTO accounts (balance) VALUES (-5.00);            -- rejected, whole statement fails

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 1644 (45000): Opening balance cannot be negative`],
        [`Typical real uses: stamping <code>updated_at</code>/<code>updated_by</code>, generating a slug or code from other columns, defaulting a column from another table's value (something <code>DEFAULT</code> cannot do pre-8.0.13), and guarding state transitions (an order cannot go from SHIPPED back to NEW).`,
            r`-- Guard a state machine: orders may only move forward
CREATE TABLE orders (
  id     INT PRIMARY KEY,
  status ENUM('NEW','PAID','SHIPPED') NOT NULL,   -- ENUM index gives the order
  updated_at DATETIME NULL
);

DELIMITER $$
CREATE TRIGGER trg_orders_bu
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
  IF NEW.status + 0 < OLD.status + 0 THEN          -- +0 gives the ENUM position (not text)
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Status cannot move backwards';
  END IF;
  SET NEW.updated_at = NOW();                      -- always stamp the change
END$$
DELIMITER ;

INSERT INTO orders VALUES (1, 'PAID', NULL);
UPDATE orders SET status = 'SHIPPED' WHERE id = 1; -- allowed
UPDATE orders SET status = 'NEW'     WHERE id = 1; -- blocked

-- OUTPUT:
-- Query OK, 1 row affected   (SHIPPED, updated_at stamped)
-- ERROR 1644 (45000): Status cannot move backwards`],
        [`<b>Advantages:</b> logic runs for every client with no app change; the trigger can modify <code>NEW</code> so no second UPDATE is needed; rejection is atomic with the statement; central, version-able in DDL scripts.`,
            r`-- Advantage: a single BEFORE trigger gives every writer the same default
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(50),
  code  VARCHAR(20)
);
DELIMITER $$
CREATE TRIGGER trg_tickets_bi BEFORE INSERT ON tickets FOR EACH ROW
BEGIN
  IF NEW.code IS NULL THEN
    SET NEW.code = CONCAT('TCK-', UPPER(LEFT(NEW.title, 3)));  -- derived default
  END IF;
END$$
DELIMITER ;
INSERT INTO tickets (title) VALUES ('printer jam');
SELECT * FROM tickets;

-- OUTPUT:
-- +----+-------------+---------+
-- | id | title       | code    |
-- +----+-------------+---------+
-- |  1 | printer jam | TCK-PRI |
-- +----+-------------+---------+`],
        [`<b>Disadvantages:</b> invisible behaviour (a plain INSERT does more than it says), harder debugging and testing, extra cost per row, and AUTO_INCREMENT values in <code>NEW</code> are still 0 at BEFORE time, so you cannot use the new id there.`,
            r`-- Disadvantage: NEW.id is not yet assigned in a BEFORE INSERT trigger
CREATE TABLE t (id INT AUTO_INCREMENT PRIMARY KEY, note VARCHAR(30));
DELIMITER $$
CREATE TRIGGER trg_t_bi BEFORE INSERT ON t FOR EACH ROW
BEGIN
  SET NEW.note = CONCAT('id was ', NEW.id);   -- id is 0 here, not the final value
END$$
DELIMITER ;
INSERT INTO t (note) VALUES ('x');
SELECT * FROM t;

-- OUTPUT:
-- +----+----------+
-- | id | note     |
-- +----+----------+
-- |  1 | id was 0 |
-- +----+----------+`],
        [`<b>Limitations:</b> row-level only (no FOR EACH STATEMENT); no COMMIT/ROLLBACK/START TRANSACTION inside; cannot modify the table that fired it with DML (error 1442); no triggers on views or TEMPORARY tables; cascaded foreign-key actions do NOT fire triggers.`,
            r`-- Limitation: a trigger cannot UPDATE the very table it is attached to
DELIMITER $$
CREATE TRIGGER trg_t_bu BEFORE UPDATE ON t FOR EACH ROW
BEGIN
  UPDATE t SET note = 'oops' WHERE id = NEW.id;   -- illegal self-modification
END$$
DELIMITER ;
UPDATE t SET note = 'y' WHERE id = 1;

-- OUTPUT:
-- ERROR 1442 (HY000): Can't update table 't' in stored function/trigger
--   because it is already used by statement which invoked this stored function/trigger.`],
        `
   INSERT / UPDATE statement
            |
            v
   +---------------------+   for each row
   |   BEFORE trigger    |<--------------+
   |  read OLD / NEW     |               |
   |  edit NEW, or       |               |
   |  SIGNAL = abort     |               |
   +----------+----------+               |
              | (NEW possibly modified)  |
              v                          |
   +---------------------+               |
   |  write row to table |---------------+
   +----------+----------+
              v
   +---------------------+
   |    AFTER trigger    |
   +---------------------+
`,
        `Use BEFORE triggers only for small, deterministic, row-local rules (normalise, default, guard). Anything that crosses tables, calls services or needs observability belongs in the application or a procedure, where it is testable and visible. Prefer CHECK constraints and generated columns when they suffice - they are declarative and cheaper - and document every trigger in migrations because they are the classic source of "who changed this value?" mysteries.`
    ),

    'AFTER Triggers': dd(
        [`An <b>AFTER trigger</b> fires once the row change has succeeded. <code>NEW</code> and <code>OLD</code> are read-only here, so AFTER triggers are for <i>side effects</i>: writing to another table, keeping a summary current, or recording history. Because the row exists, <code>NEW.id</code> already holds the generated AUTO_INCREMENT value.`,
            r`-- Keep a per-customer order counter in sync
CREATE TABLE customers (id INT PRIMARY KEY, order_count INT NOT NULL DEFAULT 0);
CREATE TABLE orders    (id INT AUTO_INCREMENT PRIMARY KEY, customer_id INT NOT NULL);

DELIMITER $$
CREATE TRIGGER trg_orders_ai
AFTER INSERT ON orders                          -- fires after the row is stored
FOR EACH ROW
BEGIN
  UPDATE customers
     SET order_count = order_count + 1          -- side effect on another table
   WHERE id = NEW.customer_id;
END$$
DELIMITER ;

INSERT INTO customers (id) VALUES (7);
INSERT INTO orders (customer_id) VALUES (7), (7);   -- two rows -> trigger fires twice
SELECT * FROM customers;

-- OUTPUT:
-- +----+-------------+
-- | id | order_count |
-- +----+-------------+
-- |  7 |           2 |
-- +----+-------------+`],
        [`Denormalised totals, search tables and history tables must change <i>in the same transaction</i> as the source row, or they drift apart. An AFTER trigger guarantees that: if the outer statement rolls back, the trigger's writes roll back with it.`,
            r`-- Atomicity: the trigger's write is undone when the transaction rolls back
START TRANSACTION;
INSERT INTO orders (customer_id) VALUES (7);          -- trigger bumps order_count to 3
SELECT order_count FROM customers WHERE id = 7;       -- sees 3 inside the transaction
ROLLBACK;                                             -- undo row AND counter
SELECT order_count FROM customers WHERE id = 7;

-- OUTPUT:
-- +-------------+
-- | order_count |
-- +-------------+
-- |           3 |
-- +-------------+
-- +-------------+
-- | order_count |
-- +-------------+
-- |           2 |
-- +-------------+`],
        [`Real uses: stock decrement after an order line, maintaining a rolled-up <code>balance</code>, writing outbox rows for an event publisher, or copying deleted rows to an archive table (AFTER DELETE with <code>OLD</code>).`,
            r`-- Archive deleted rows (AFTER DELETE uses OLD)
CREATE TABLE products         (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE products_archive (id INT, name VARCHAR(30), deleted_at DATETIME);

DELIMITER $$
CREATE TRIGGER trg_products_ad
AFTER DELETE ON products FOR EACH ROW
BEGIN
  INSERT INTO products_archive VALUES (OLD.id, OLD.name, NOW());  -- keep a copy
END$$
DELIMITER ;

INSERT INTO products VALUES (1, 'Lamp');
DELETE FROM products WHERE id = 1;
SELECT id, name FROM products_archive;

-- OUTPUT:
-- +----+------+
-- | id | name |
-- +----+------+
-- |  1 | Lamp |
-- +----+------+`],
        [`<b>Advantages:</b> sees the final row (including generated keys); side effects are transactional with the change; cannot be bypassed by any client; ideal for outbox and summary maintenance.`,
            r`-- Advantage: NEW.id is the real generated id in an AFTER INSERT trigger
CREATE TABLE posts     (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(30));
CREATE TABLE post_log  (post_id INT, msg VARCHAR(40));
DELIMITER $$
CREATE TRIGGER trg_posts_ai AFTER INSERT ON posts FOR EACH ROW
BEGIN
  INSERT INTO post_log VALUES (NEW.id, CONCAT('created: ', NEW.title));
END$$
DELIMITER ;
INSERT INTO posts (title) VALUES ('Hello');
SELECT * FROM post_log;

-- OUTPUT:
-- +---------+----------------+
-- | post_id | msg            |
-- +---------+----------------+
-- |       1 | created: Hello |
-- +---------+----------------+`],
        [`<b>Disadvantages:</b> every row pays an extra statement, so a bulk INSERT of 1 million rows runs the trigger 1 million times; failures inside the trigger fail the original statement; hot summary rows become lock hot-spots.`,
            r`-- Disadvantage: the counter row is locked by each insert until commit
-- Session A:
START TRANSACTION;
INSERT INTO orders (customer_id) VALUES (7);   -- trigger X-locks customers row 7
-- Session B (meanwhile):
INSERT INTO orders (customer_id) VALUES (7);   -- waits for A's lock on customers.id = 7

-- OUTPUT:
-- Session B: blocked until A commits, or
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction`],
        [`<b>Limitations:</b> cannot change NEW (use BEFORE); no transaction control; no output to the client (a SELECT without INTO is forbidden); cannot call a procedure that returns a result set; changes made by cascading FK actions or by replication row events on a replica do not behave like on the source.`,
            r`-- Limitation: a result-returning SELECT is not allowed inside a trigger
DELIMITER $$
CREATE TRIGGER trg_bad AFTER INSERT ON orders FOR EACH ROW
BEGIN
  SELECT 'hello';          -- not allowed to return a result set
END$$
DELIMITER ;

-- OUTPUT:
-- ERROR 1415 (0A000): Not allowed to return a result set from a trigger`],
        `
   client: INSERT INTO orders ...
        |
        v
   [ BEFORE INSERT ] -> row written -> [ AFTER INSERT ]
                                            |
                         +------------------+------------------+
                         v                                     v
              UPDATE customers.order_count          INSERT INTO outbox(...)
                         \                                     /
                          +---- same transaction: COMMIT / ROLLBACK together
`,
        `AFTER triggers are acceptable for cheap, constant-time side effects. Avoid maintaining a single hot counter row on a high-write table (serialises writers) - use periodic aggregation or sharded counters instead. For cross-system events write an outbox row in the trigger and let a separate relay publish it, rather than calling anything external from the database.`
    ),

    'Audit Logging with Triggers': dd(
        [`<b>Audit logging</b> records who changed what, when, and the before/after values. The classic MySQL pattern is an <code>audit</code> table written by AFTER INSERT/UPDATE/DELETE triggers using <code>OLD</code>, <code>NEW</code>, <code>CURRENT_USER()</code> and <code>NOW()</code>.`,
            r`CREATE TABLE salaries (emp_id INT PRIMARY KEY, amount DECIMAL(10,2) NOT NULL);
CREATE TABLE salary_audit (
  audit_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
  emp_id     INT,
  old_amount DECIMAL(10,2),
  new_amount DECIMAL(10,2),
  changed_by VARCHAR(100),        -- who made the change
  changed_at DATETIME             -- when
);

DELIMITER $$
CREATE TRIGGER trg_salaries_au
AFTER UPDATE ON salaries FOR EACH ROW
BEGIN
  IF NOT (OLD.amount <=> NEW.amount) THEN       -- <=> is NULL-safe equality
    INSERT INTO salary_audit (emp_id, old_amount, new_amount, changed_by, changed_at)
    VALUES (OLD.emp_id, OLD.amount, NEW.amount, CURRENT_USER(), NOW());
  END IF;
END$$
DELIMITER ;

INSERT INTO salaries VALUES (1, 50000);
UPDATE salaries SET amount = 55000 WHERE emp_id = 1;
SELECT emp_id, old_amount, new_amount, changed_by FROM salary_audit;

-- OUTPUT (example):
-- +--------+------------+------------+----------------+
-- | emp_id | old_amount | new_amount | changed_by     |
-- +--------+------------+------------+----------------+
-- |      1 |   50000.00 |   55000.00 | app_user@%     |
-- +--------+------------+------------+----------------+`],
        [`Regulations (SOX, GDPR, HIPAA) and ordinary incident work both ask "who changed this value and what was it before?". Application-level logging misses changes made by DBAs, scripts and other services; the database sees them all.`,
            r`-- A direct DBA fix is still captured, because the trigger lives in the database
-- (connected as dba@localhost, bypassing the application entirely)
UPDATE salaries SET amount = 56000 WHERE emp_id = 1;
SELECT old_amount, new_amount, changed_by FROM salary_audit ORDER BY audit_id;

-- OUTPUT (example):
-- +------------+------------+------------------+
-- | old_amount | new_amount | changed_by       |
-- +------------+------------+------------------+
-- |   50000.00 |   55000.00 | app_user@%       |
-- |   55000.00 |   56000.00 | dba@localhost    |
-- +------------+------------+------------------+`],
        [`Real designs: one generic audit table storing JSON snapshots (table name, PK, <code>JSON_OBJECT</code> of old/new) so a single pattern covers many tables; or a shadow <code>_history</code> table per entity with the same columns plus metadata.`,
            r`-- Generic JSON audit: one table for any source table
CREATE TABLE audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tbl VARCHAR(64), pk VARCHAR(64), action CHAR(1),
  old_row JSON, new_row JSON, at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);
CREATE TABLE customers2 (id INT PRIMARY KEY, name VARCHAR(30), city VARCHAR(30));

DELIMITER $$
CREATE TRIGGER trg_cust2_au AFTER UPDATE ON customers2 FOR EACH ROW
BEGIN
  INSERT INTO audit_log (tbl, pk, action, old_row, new_row)
  VALUES ('customers2', NEW.id, 'U',
          JSON_OBJECT('name', OLD.name, 'city', OLD.city),   -- before image
          JSON_OBJECT('name', NEW.name, 'city', NEW.city));  -- after image
END$$
DELIMITER ;

INSERT INTO customers2 VALUES (1, 'Asha', 'Pune');
UPDATE customers2 SET city = 'Mumbai' WHERE id = 1;
SELECT tbl, pk, action, old_row, new_row FROM audit_log;

-- OUTPUT:
-- +------------+----+--------+--------------------------------------+---------------------------------------+
-- | tbl        | pk | action | old_row                              | new_row                               |
-- +------------+----+--------+--------------------------------------+---------------------------------------+
-- | customers2 | 1  | U      | {"city": "Pune", "name": "Asha"}     | {"city": "Mumbai", "name": "Asha"}    |
-- +------------+----+--------+--------------------------------------+---------------------------------------+`],
        [`<b>Advantages:</b> captures every writer; same transaction as the change (no audit gap); no application code; before and after images are both available.`,
            r`-- Advantage: audit rows roll back together with the change - no phantom history
START TRANSACTION;
UPDATE salaries SET amount = 99999 WHERE emp_id = 1;   -- audit row written
ROLLBACK;                                              -- both gone
SELECT COUNT(*) AS audit_rows FROM salary_audit WHERE new_amount = 99999;

-- OUTPUT:
-- +------------+
-- | audit_rows |
-- +------------+
-- |          0 |
-- +------------+`],
        [`<b>Disadvantages:</b> write amplification (every write becomes two), the audit table grows without bound, the user is the <i>connection</i> user (an app pool shows one account, not the end user), and you need three triggers per table.`,
            r`-- Disadvantage: with a shared pool account, CURRENT_USER() is useless for "who"
-- Workaround: the app sets a session variable, the trigger reads it
SET @app_user = 'priya.sharma';        -- set by the app after taking a connection
-- inside the trigger:   COALESCE(@app_user, CURRENT_USER())
SELECT COALESCE(@app_user, CURRENT_USER()) AS actor;

-- OUTPUT:
-- +--------------+
-- | actor        |
-- +--------------+
-- | priya.sharma |
-- +--------------+`],
        [`<b>Limitations:</b> triggers do not fire for TRUNCATE, for DROP TABLE, or for cascading FK deletes; they see only row data, not the SQL text; bulk loads with <code>LOAD DATA</code> do fire row triggers but slowly; and a user with TRIGGER or SUPER privilege can drop the trigger and silently stop auditing.`,
            r`-- Limitation: TRUNCATE bypasses row triggers entirely
TRUNCATE TABLE salaries;                        -- all rows gone, no audit rows written
SELECT COUNT(*) AS audit_rows FROM salary_audit;   -- history of earlier updates only

-- OUTPUT:
-- +------------+
-- | audit_rows |
-- +------------+
-- |          2 |      <- nothing recorded for the truncate itself
-- +------------+`],
        `
   app / DBA / script
          |  UPDATE salaries ...
          v
   +--------------+   AFTER UPDATE trigger    +---------------------+
   |  salaries    |-------------------------->|  salary_audit       |
   | (live data)  |  OLD, NEW, user, time     |  (append-only)      |
   +--------------+                           +----------+----------+
                                                         | archive job
                                                         v
                                              cold storage / SIEM
`,
        `Trigger-based audit is simple and complete for row changes, but it taxes the write path and the audit table needs partitioning by date plus an archive policy. For compliance-grade auditing consider the MySQL Enterprise Audit plugin, binary-log based CDC (Debezium) or system-versioned design in the app, and restrict who may DROP TRIGGER. Always have the application pass the real end-user identity via a session variable.`
    ),

    'When to Avoid Triggers': dd(
        [`Triggers are powerful but hidden: they run implicitly, per row, inside someone else's statement. Avoid them when the logic is complex, crosses systems, is performance-critical, or can be expressed declaratively with constraints, generated columns, foreign keys or application code.`,
            r`-- Prefer declarative tools over a trigger when possible
CREATE TABLE items (
  id    INT PRIMARY KEY,
  price DECIMAL(10,2) NOT NULL,
  qty   INT NOT NULL,
  total DECIMAL(12,2) AS (price * qty) STORED,       -- generated column, no trigger needed
  CONSTRAINT chk_qty CHECK (qty >= 0)               -- enforced in MySQL 8.0.16+
);
INSERT INTO items (id, price, qty) VALUES (1, 9.50, 4);
SELECT id, total FROM items;

-- OUTPUT:
-- +----+-------+
-- | id | total |
-- +----+-------+
-- |  1 | 38.00 |
-- +----+-------+`],
        [`Knowing the alternatives is the real skill: a CHECK for validation, a generated column for derived values, <code>DEFAULT (expr)</code> for defaults, <code>ON UPDATE CURRENT_TIMESTAMP</code> for timestamps, FK actions for cascades, and application services for workflows.`,
            r`-- updated_at without any trigger
CREATE TABLE notes (
  id INT PRIMARY KEY,
  body VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
             ON UPDATE CURRENT_TIMESTAMP             -- engine maintains it
);
INSERT INTO notes (id, body) VALUES (1, 'a');
UPDATE notes SET body = 'b' WHERE id = 1;            -- updated_at refreshed automatically

-- OUTPUT:
-- Rows matched: 1  Changed: 1  (updated_at refreshed by the engine, no trigger)`],
        [`Real red flags: a trigger that INSERTs into a table having its own trigger (cascades of hidden work), a trigger doing a slow lookup, one calling heavy logic during bulk imports, or an ORM test suite that no longer matches production behaviour.`,
            r`-- Find every trigger that exists in a schema (an inventory step before any audit)
SELECT TRIGGER_NAME, EVENT_MANIPULATION AS event, ACTION_TIMING AS timing, EVENT_OBJECT_TABLE AS tbl
FROM   information_schema.TRIGGERS
WHERE  TRIGGER_SCHEMA = DATABASE()
ORDER  BY tbl, timing, event;

-- OUTPUT (example):
-- +----------------+--------+--------+----------+
-- | TRIGGER_NAME   | event  | timing | tbl      |
-- +----------------+--------+--------+----------+
-- | trg_orders_ai  | INSERT | AFTER  | orders   |
-- | trg_salaries_au| UPDATE | AFTER  | salaries |
-- +----------------+--------+--------+----------+`],
        [`<b>Why avoiding them helps:</b> predictable write cost, easy unit testing, clean replication and CDC, and logic that lives in version-controlled application code with proper logging.`,
            r`-- The same "order counter" without a trigger: compute on read, always correct
SELECT c.id, COUNT(o.id) AS order_count
FROM   customers c
LEFT   JOIN orders o ON o.customer_id = c.id
GROUP  BY c.id;                                  -- no stored counter to drift

-- OUTPUT (example):
-- +----+-------------+
-- | id | order_count |
-- +----+-------------+
-- |  7 |           2 |
-- +----+-------------+`],
        [`<b>Costs of avoiding them:</b> rules must be re-implemented in every client, a script or DBA can bypass them, and you must handle consistency yourself (transactions, idempotent jobs).`,
            r`-- Without a trigger, a bypassing writer skips the rule entirely
-- App enforces "email lower-case"; a raw script does not:
INSERT INTO users (email) VALUES ('BOB@EXAMPLE.COM');
SELECT email FROM users WHERE id = 2;

-- OUTPUT:
-- +-----------------+
-- | email           |
-- +-----------------+
-- | BOB@EXAMPLE.COM |    <- rule silently not applied
-- +-----------------+`],
        [`<b>Limitations to remember:</b> triggers are not fired by cascading FK actions, are not allowed on views, and a bulk operation multiplies their cost by the row count - measure before you ship.`,
            r`-- Measure the trigger tax: same bulk insert with and without the trigger
-- 1,000,000 rows into a table WITH an AFTER INSERT audit trigger:
--     typically 2x to 5x slower than the table without it (example)
SHOW TRIGGERS LIKE 'orders';        -- confirm what will fire before a data load
DROP TRIGGER IF EXISTS trg_orders_ai;  -- temporary removal during a controlled bulk load

-- OUTPUT (example):
-- no trigger : 1,000,000 rows in  9.1 s
-- with trigger: 1,000,000 rows in 31.4 s`],
        `
   Need a rule?
      |
      +-- value check ............ CHECK constraint
      +-- derived value .......... generated column
      +-- default / timestamp .... DEFAULT (expr) / ON UPDATE
      +-- cascade ................ FOREIGN KEY ... ON DELETE
      +-- multi-step workflow .... application service / procedure
      +-- audit every writer ..... small AFTER trigger or CDC
      +-- else: trigger (last resort, keep it tiny)
`,
        `Adopt a "triggers by exception" policy: each one needs a written reason, a test, and an owner. Prefer declarative constraints first, then application code, then CDC from the binary log for downstream consumers. Where triggers stay, keep them O(1), side-effect-free outward, and listed in an inventory query run in CI.`
    ),
};
