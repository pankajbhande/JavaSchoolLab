// Module 6 (CRUD Operations), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s06k: Record<string, DeepDive> = {
    'INSERT': dd(
        [`<b>INSERT</b> adds new rows to a table. You can list the target columns and supply one or many value tuples, copy rows from a query with <code>INSERT ... SELECT</code>, or set columns by name with <code>INSERT ... SET</code>. Columns you leave out get their DEFAULT, their AUTO_INCREMENT value, or NULL.`,
            r`CREATE TABLE emp (
    id     INT PRIMARY KEY AUTO_INCREMENT,
    name   VARCHAR(30) NOT NULL,
    dept   VARCHAR(20) NOT NULL DEFAULT 'General',
    salary DECIMAL(9,2) NOT NULL
);
INSERT INTO emp (name, dept, salary) VALUES ('Asha', 'IT', 60000);      -- one row, columns named
INSERT INTO emp (name, salary)       VALUES ('Ravi', 45000),            -- many rows, one statement
                                            ('Mina', 52000);
SELECT * FROM emp;

-- OUTPUT:
-- +----+------+---------+----------+
-- | id | name | dept    | salary   |
-- +----+------+---------+----------+
-- |  1 | Asha | IT      | 60000.00 |
-- |  2 | Ravi | General | 45000.00 |
-- |  3 | Mina | General | 52000.00 |
-- +----+------+---------+----------+`],
        [`Data enters a database through INSERT: sign-ups, orders, log events, imports. Listing columns explicitly keeps statements valid when someone later adds a column, and multi-row inserts cut network round trips.`,
            r`-- Always name the columns: positional VALUES breaks when the table changes
INSERT INTO emp VALUES (4, 'Kiran');                 -- wrong number of values

-- Retrieve the generated key right after inserting
INSERT INTO emp (name, salary) VALUES ('Dev', 70000);
SELECT LAST_INSERT_ID() AS new_id;

-- OUTPUT:
-- ERROR 1136 (21S01): Column count doesn't match value count at row 1
-- +--------+
-- | new_id |
-- +--------+
-- |      4 |
-- +--------+`],
        [`Real systems use upserts for idempotent writes, bulk <code>INSERT ... SELECT</code> to build summary or archive tables, and <code>INSERT IGNORE</code> for de-duplicating feeds.`,
            r`CREATE TABLE emp_archive LIKE emp;
INSERT INTO emp_archive (name, dept, salary)
SELECT name, dept, salary FROM emp WHERE salary < 50000;     -- copy rows from a query

CREATE TABLE stock (sku VARCHAR(10) PRIMARY KEY, qty INT NOT NULL);
INSERT INTO stock VALUES ('PEN', 10);
INSERT INTO stock VALUES ('PEN', 5) AS new                   -- 8.0.19+ row alias
ON DUPLICATE KEY UPDATE qty = stock.qty + new.qty;           -- add to existing row
SELECT * FROM stock;

-- OUTPUT:
-- +-----+-----+
-- | sku | qty |
-- +-----+-----+
-- | PEN |  15 |
-- +-----+-----+`],
        [`<b>Advantages:</b> simple, atomic per statement, supports batching (hundreds of rows per statement is far faster than one at a time), and combines with ON DUPLICATE KEY UPDATE for idempotency.`,
            r`-- Multi-row insert is all-or-nothing: one bad row cancels the statement
INSERT INTO emp (name, salary) VALUES ('Ok1', 1000), (NULL, 2000), ('Ok3', 3000);
SELECT COUNT(*) AS rows_now FROM emp;

-- OUTPUT:
-- ERROR 1048 (23000): Column 'name' cannot be null
-- +----------+
-- | rows_now |
-- +----------+
-- |        4 |
-- +----------+`],
        [`<b>Disadvantages:</b> every insert maintains all indexes and constraints, so heavy indexing slows writes. Auto-increment values are consumed even when the insert fails or rolls back, leaving gaps. INSERT IGNORE hides errors (truncation, bad values become warnings).`,
            r`INSERT INTO emp (name, salary) VALUES ('Gap', 100);        -- gets id 5
DELETE FROM emp WHERE name = 'Gap';
INSERT INTO emp (name, salary) VALUES ('Next', 200);       -- id 6, never reuses 5
SELECT id, name FROM emp WHERE name IN ('Next');

-- OUTPUT:
-- +----+------+
-- | id | name |
-- +----+------+
-- |  6 | Next |
-- +----+------+`],
        [`<b>Limitations:</b> a statement is capped by <code>max_allowed_packet</code> (64 MB default), very large single inserts hold locks and bloat the undo log, and bulk loads of millions of rows belong in <code>LOAD DATA</code> or chunked batches. The auto-increment counter is per table and lives in memory plus redo (persisted since 8.0).`,
            r`-- Practical batch size: a few hundred to a few thousand rows per statement
SELECT @@max_allowed_packet / 1024 / 1024 AS packet_mb, @@autocommit AS autocommit;

-- OUTPUT (example):
-- +-----------+------------+
-- | packet_mb | autocommit |
-- +-----------+------------+
-- |   64.0000 |          1 |
-- +-----------+------------+`],
        `
   INSERT INTO emp (cols) VALUES (...)
        │
        ▼
   parse ► check NOT NULL / DEFAULT / types ► check CHECK + FK + UNIQUE
        │
        ▼
   write clustered row (PK order) ► update each secondary index
        │
        ▼
   redo log + undo log ► COMMIT ► visible to others
`,
        `Insert in batches inside one transaction (commit every 1,000 to 10,000 rows) for throughput without huge undo. Prefer idempotent upserts so retries are safe, never rely on contiguous auto-increment values, and monitor index count on write-heavy tables. For millions of rows use LOAD DATA INFILE, or disable secondary index work by loading into a staging table first.`
    ),

    'SELECT Basics': dd(
        [`<b>SELECT</b> reads data without changing it. The minimum form is <code>SELECT columns FROM table</code>. Pick columns (projection), rename them with <code>AS</code>, compute expressions, and use <code>SELECT *</code> only for quick exploration. The result is a set of rows with no guaranteed order.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(30), dept VARCHAR(20), salary DECIMAL(9,2));
INSERT INTO emp VALUES (1,'Asha','IT',60000),(2,'Ravi','HR',45000),(3,'Mina','IT',52000);

SELECT name,                          -- plain column
       salary * 12  AS annual_pay,    -- computed column with alias
       'INR'        AS currency       -- constant column
FROM emp;

-- OUTPUT:
-- +------+------------+----------+
-- | name | annual_pay | currency |
-- +------+------------+----------+
-- | Asha |  720000.00 | INR      |
-- | Ravi |  540000.00 | INR      |
-- | Mina |  624000.00 | INR      |
-- +------+------------+----------+`],
        [`Every report, screen and API list starts with a query. Selecting only the columns you need reduces network traffic, memory and lets the engine answer from an index alone (covering index) instead of reading full rows.`,
            r`-- SELECT without FROM works for calculations and server facts
SELECT 2 + 3 AS five, UPPER('mysql') AS shout, CURRENT_DATE() AS today;

-- OUTPUT (example):
-- +------+-------+------------+
-- | five | shout | today      |
-- +------+-------+------------+
-- |    5 | MYSQL | 2026-10-06 |
-- +------+-------+------------+`],
        [`Dashboards, search pages and exports use SELECT with filters, sorting and limits. Table and column aliases keep long joins readable and are the only way to join a table to itself.`,
            r`SELECT e.name AS employee, e.dept
FROM emp AS e                 -- table alias
WHERE e.dept = 'IT';

SELECT DISTINCT dept FROM emp;     -- unique departments only

-- OUTPUT:
-- +----------+------+
-- | employee | dept |
-- +----------+------+
-- | Asha     | IT   |
-- | Mina     | IT   |
-- +----------+------+
-- +------+
-- | dept |
-- +------+
-- | IT   |
-- | HR   |
-- +------+`],
        [`<b>Advantages:</b> declarative (you state what you want, the optimizer picks how), composable with joins, subqueries and functions, and read-only so it takes no row locks under the default isolation level (consistent snapshot reads).`,
            r`-- The optimizer chooses the access path; EXPLAIN reveals it
EXPLAIN SELECT name FROM emp WHERE id = 2;

-- OUTPUT (example, trimmed):
-- +-------+-------+---------+------+
-- | table | type  | key     | rows |
-- +-------+-------+---------+------+
-- | emp   | const | PRIMARY |    1 |
-- +-------+-------+---------+------+`],
        [`<b>Disadvantages:</b> <code>SELECT *</code> breaks when columns are added, reads unneeded data (including big TEXT/BLOB), and blocks index-only plans. Result order is undefined without ORDER BY, and a careless query on a huge table can scan everything.`,
            r`-- Column order of SELECT * depends on table definition; an added column changes the result
ALTER TABLE emp ADD COLUMN city VARCHAR(20) DEFAULT 'Pune';
SELECT * FROM emp WHERE id = 1;

-- OUTPUT:
-- +----+------+------+----------+------+
-- | id | name | dept | salary   | city |
-- +----+------+------+----------+------+
-- |  1 | Asha | IT   | 60000.00 | Pune |
-- +----+------+------+----------+------+`],
        [`<b>Limitations:</b> a table alias is not visible in the same SELECT list's WHERE for column aliases (aliases cannot be used in WHERE), a result can have at most 4096 columns, and the whole result is held by the server or streamed to the client buffer, so very large results need LIMIT or streaming.`,
            r`SELECT salary * 12 AS annual FROM emp WHERE annual > 600000;     -- alias used in WHERE
SELECT salary * 12 AS annual FROM emp HAVING annual > 600000;      -- allowed in HAVING / ORDER BY

-- OUTPUT:
-- ERROR 1054 (42S22): Unknown column 'annual' in 'where clause'
-- +------------+
-- | annual     |
-- +------------+
-- |  720000.00 |
-- |  624000.00 |
-- +------------+`],
        `
   SELECT name, salary*12 AS annual     table emp
   FROM emp                  ───────►   ┌────┬──────┬────────┐
                                        │ id │ name │ salary │
   projection = pick columns            └────┴──────┴────────┘
   selection  = pick rows (WHERE)       result: new temporary rowset
   (source table is never modified)
`,
        `Name columns explicitly in application queries, keep result sets small, and let EXPLAIN verify that hot queries use indexes. Treat SELECT * as a development tool; in production code it hurts covering-index plans and causes silent contract changes. Add ORDER BY wherever the consumer depends on order.`
    ),

    'UPDATE': dd(
        [`<b>UPDATE</b> changes column values in existing rows: <code>UPDATE table SET col = expr WHERE condition</code>. The right-hand side can use the current column values, and several columns can be set in one statement. Without WHERE every row is updated.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(30), dept VARCHAR(20), salary DECIMAL(9,2));
INSERT INTO emp VALUES (1,'Asha','IT',60000),(2,'Ravi','HR',45000),(3,'Mina','IT',52000);

UPDATE emp
SET salary = salary * 1.10,           -- 10 percent raise, computed from the old value
    dept   = 'Tech'
WHERE dept = 'IT';
SELECT id, dept, salary FROM emp ORDER BY id;

-- OUTPUT:
-- Query OK, 2 rows affected (0.01 sec)
-- Rows matched: 2  Changed: 2  Warnings: 0
-- +----+------+----------+
-- | id | dept | salary   |
-- +----+------+----------+
-- |  1 | Tech | 66000.00 |
-- |  2 | HR   | 45000.00 |
-- |  3 | Tech | 57200.00 |
-- +----+------+----------+`],
        [`Data changes: a user edits a profile, an order moves from PAID to SHIPPED, stock decreases. Updating in place keeps one current row instead of piling up versions.`,
            r`-- Atomic arithmetic avoids the read-modify-write race
UPDATE emp SET salary = salary + 500 WHERE id = 2;     -- good: engine does it under a row lock

-- Bad pattern in application code:  x = SELECT salary; then UPDATE SET salary = x + 500
-- two concurrent requests would both read the same x and one raise would be lost

SELECT salary FROM emp WHERE id = 2;

-- OUTPUT:
-- +----------+
-- | salary   |
-- +----------+
-- | 45500.00 |
-- +----------+`],
        [`Multi-table UPDATE with JOIN synchronises data (copy a looked-up value into a table), and <code>ORDER BY ... LIMIT</code> lets you update in batches to keep transactions short.`,
            r`CREATE TABLE dept_bonus (dept VARCHAR(20) PRIMARY KEY, bonus DECIMAL(9,2));
INSERT INTO dept_bonus VALUES ('Tech', 1000), ('HR', 250);

UPDATE emp e
JOIN dept_bonus b ON b.dept = e.dept       -- MySQL multi-table update syntax
SET e.salary = e.salary + b.bonus;
SELECT id, salary FROM emp ORDER BY id;

-- OUTPUT:
-- +----+----------+
-- | id | salary   |
-- +----+----------+
-- |  1 | 67000.00 |
-- |  2 | 45750.00 |
-- |  3 | 58200.00 |
-- +----+----------+`],
        [`<b>Advantages:</b> row-level locking in InnoDB, atomic multi-column changes, expressions and joins in one statement, and a clear affected-row count to detect whether anything happened (optimistic locking uses it).`,
            r`-- Optimistic locking: update only if the version is unchanged
ALTER TABLE emp ADD COLUMN version INT NOT NULL DEFAULT 0;
UPDATE emp SET salary = 70000, version = version + 1
WHERE id = 1 AND version = 0;
SELECT ROW_COUNT() AS rows_changed;      -- 1 = we won, 0 = someone else changed it first

-- OUTPUT:
-- +--------------+
-- | rows_changed |
-- +--------------+
-- |            1 |
-- +--------------+`],
        [`<b>Disadvantages:</b> a forgotten WHERE rewrites the whole table; updating an indexed column rewrites index entries; large updates create big undo logs and long row locks, and replicas apply them as one big transaction (replication lag). Old values are lost unless you audit.`,
            r`-- Safety net for interactive sessions: the server refuses WHERE-less updates
SET sql_safe_updates = 1;
UPDATE emp SET salary = 0;                 -- no WHERE, no key column

-- OUTPUT:
-- ERROR 1175 (HY000): You are using safe update mode and you tried to update a table without
-- a WHERE that uses a KEY column. To disable safe mode, toggle the option in Preferences.`],
        [`<b>Limitations:</b> you cannot update a table using a subquery on that same table directly (ERROR 1093; wrap it in a derived table), the target column list in one statement is evaluated left to right in MySQL (unlike standard SQL), and a no-op update that sets the same value reports 0 rows changed.`,
            r`UPDATE emp SET salary = (SELECT MAX(salary) FROM emp) WHERE id = 2;       -- same table in subquery
UPDATE emp SET salary = (SELECT m FROM (SELECT MAX(salary) AS m FROM emp) x)
WHERE id = 2;                                                              -- workaround

-- OUTPUT:
-- ERROR 1093 (HY000): You can't specify target table 'emp' for update in FROM clause
-- Query OK, 1 row affected (0.00 sec)`],
        `
   UPDATE emp SET salary = salary*1.1 WHERE dept='IT'
        │
        ▼
   find rows (index on dept?) ──► lock each matching row (X lock)
        │
        ▼
   write old version to UNDO ──► change row + indexes ──► REDO log
        │
        ▼
   COMMIT releases locks ──► other sessions see the new value
`,
        `Always write the WHERE first, run it as a SELECT, and wrap risky changes in a transaction so you can ROLLBACK. Batch large updates (for example 5,000 rows by primary-key range) to bound lock time, undo size and replication lag. Make sure the WHERE column is indexed; an unindexed UPDATE locks far more rows than it changes under REPEATABLE READ.`
    ),

    'DELETE': dd(
        [`<b>DELETE</b> removes rows that match a condition: <code>DELETE FROM table WHERE condition</code>. It is DML, fully transactional, logged row by row, fires triggers and respects foreign keys. Without WHERE it deletes every row (slowly); use TRUNCATE to empty a table fast.`,
            r`CREATE TABLE session_log (id INT PRIMARY KEY AUTO_INCREMENT, user_id INT, seen DATE);
INSERT INTO session_log (user_id, seen) VALUES (1,'2026-01-01'),(2,'2026-06-01'),(3,'2026-09-30');

DELETE FROM session_log WHERE seen < '2026-03-01';       -- remove old rows only
SELECT id, user_id FROM session_log;

-- OUTPUT:
-- Query OK, 1 row affected (0.00 sec)
-- +----+---------+
-- | id | user_id |
-- +----+---------+
-- |  2 |       2 |
-- |  3 |       3 |
-- +----+---------+`],
        [`Data must be removed: expired sessions, cancelled drafts, GDPR erasure requests, test data. Deleting with a precise filter keeps tables small, which keeps indexes and scans fast.`,
            r`-- Preview first: the same WHERE as a SELECT
SELECT COUNT(*) AS will_delete FROM session_log WHERE user_id = 3;
START TRANSACTION;
DELETE FROM session_log WHERE user_id = 3;
ROLLBACK;                                      -- changed my mind: nothing is lost
SELECT COUNT(*) AS still_there FROM session_log WHERE user_id = 3;

-- OUTPUT:
-- +-------------+
-- | will_delete |
-- +-------------+
-- |           1 |
-- +-------------+
-- +-------------+
-- | still_there |
-- +-------------+
-- |           1 |
-- +-------------+`],
        [`Production purge jobs delete in small batches with <code>LIMIT</code> to avoid long locks, and many systems prefer soft delete (a <code>deleted_at</code> column) so data is recoverable and auditable.`,
            r`-- Batch purge: repeat until ROW_COUNT() = 0
DELETE FROM session_log
WHERE seen < '2026-07-01'
ORDER BY id
LIMIT 1000;                                    -- bounded work per transaction
SELECT ROW_COUNT() AS deleted_this_round;

-- Soft delete alternative: keep the row, hide it
ALTER TABLE session_log ADD COLUMN deleted_at DATETIME NULL;
UPDATE session_log SET deleted_at = NOW() WHERE id = 3;

-- OUTPUT:
-- +--------------------+
-- | deleted_this_round |
-- +--------------------+
-- |                  1 |
-- +--------------------+`],
        [`<b>Advantages:</b> precise, transactional and reversible before COMMIT, honours FK rules (cascade or restrict), and supports multi-table delete with joins. Space is reused by later inserts.`,
            r`CREATE TABLE tmp_blacklist (user_id INT PRIMARY KEY);
INSERT INTO tmp_blacklist VALUES (2);

DELETE s FROM session_log s                    -- multi-table form: name what to delete from
JOIN tmp_blacklist b ON b.user_id = s.user_id;
SELECT COUNT(*) AS remaining FROM session_log;

-- OUTPUT:
-- +-----------+
-- | remaining |
-- +-----------+
-- |         1 |
-- +-----------+`],
        [`<b>Disadvantages:</b> on huge tables it is slow (every row and index entry is logged), holds locks, bloats undo, and does not shrink the file: freed space stays inside the tablespace until OPTIMIZE TABLE or a rebuild. Deleted auto-increment values are not reused.`,
            r`-- File size does not drop after DELETE; pages are only marked free
DELETE FROM session_log;
SELECT table_rows, data_free > 0 AS has_free_space
FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'session_log';

-- OUTPUT (example):
-- +------------+----------------+
-- | TABLE_ROWS | has_free_space |
-- +------------+----------------+
-- |          0 |              0 |
-- +------------+----------------+
-- (on a large table DATA_FREE would be big until OPTIMIZE TABLE session_log)`],
        [`<b>Limitations:</b> a parent row cannot be deleted while child rows reference it under RESTRICT; you cannot delete from a table using a subquery on the same table without a derived-table workaround; DELETE ... ORDER BY / LIMIT only works for single-table form; and a WHERE-less DELETE cannot be undone after COMMIT.`,
            r`CREATE TABLE parent (id INT PRIMARY KEY);
CREATE TABLE child (id INT PRIMARY KEY, pid INT, FOREIGN KEY (pid) REFERENCES parent(id));
INSERT INTO parent VALUES (1);
INSERT INTO child VALUES (1, 1);
DELETE FROM parent WHERE id = 1;

-- OUTPUT:
-- ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (...)`],
        `
   DELETE vs TRUNCATE vs DROP
   ┌──────────┬─────────────┬───────────────┬──────────────┬────────────┐
   │ command  │ WHERE?      │ logged        │ rollback     │ keeps table│
   ├──────────┼─────────────┼───────────────┼──────────────┼────────────┤
   │ DELETE   │ yes         │ row by row    │ yes          │ yes        │
   │ TRUNCATE │ no          │ minimal (DDL) │ no (implicit │ yes, resets│
   │          │             │               │ commit)      │ AUTO_INC   │
   │ DROP     │ n/a         │ DDL           │ no           │ no         │
   └──────────┴─────────────┴───────────────┴──────────────┴────────────┘
`,
        `Delete in bounded batches during low traffic, always on an indexed predicate, and watch replication lag. For time-based retention, partition by date and DROP PARTITION instead of deleting rows: it is instant and leaves no fragmentation. Prefer soft delete only where recovery or audit is required, and then remember every query must filter it (a view helps).`
    ),
};
