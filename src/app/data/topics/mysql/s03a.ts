// Module 3 (SQL Basics).
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s03a: Record<string, DeepDive> = {
    'Database Operations: CREATE, SHOW, USE & DROP': dd(
        [`<code>CREATE DATABASE</code> makes a schema, <code>SHOW DATABASES</code> lists them, <code>USE</code> selects the default one for the session and <code>DROP DATABASE</code> deletes it with everything inside.`,
            r`CREATE DATABASE shop CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;   -- new schema
SHOW DATABASES;                                                          -- list all
USE shop;                                                                -- make current
SELECT DATABASE() AS current_db;

-- OUTPUT:
-- +------------+
-- | current_db |
-- +------------+
-- | shop       |
-- +------------+`],
        [`Each application needs its own namespace, character set and privileges. Dropping and recreating test databases is a daily developer task.`,
            r`CREATE DATABASE IF NOT EXISTS shop;      -- safe to re-run: no error if it exists
DROP DATABASE IF EXISTS scratch;           -- safe cleanup

-- OUTPUT:
-- Query OK, 1 row affected, 1 warning (0.00 sec)   -- warning: database exists
-- Query OK, 0 rows affected, 1 warning (0.00 sec)  -- warning: database doesn't exist`],
        [`CI pipelines create a fresh schema per test run; production DBAs create schemas with an explicit charset and revoke DROP from applications.`,
            r`SHOW CREATE DATABASE shop;                -- exact definition incl. charset

-- OUTPUT:
-- CREATE DATABASE shop /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */
-- /*!80016 DEFAULT ENCRYPTION='N' */`],
        [`<b>Advantages:</b> one-line isolation, per-schema privileges and backups, cheap to create.`,
            r`SHOW DATABASES LIKE 'sh%';                -- filter the list

-- OUTPUT:
-- +-----------------+
-- | Database (sh%)  |
-- +-----------------+
-- | shop            |
-- +-----------------+`],
        [`<b>Disadvantages:</b> <code>DROP DATABASE</code> is instant and irreversible (DDL auto-commits), and a missing <code>USE</code> sends statements to the wrong schema.`,
            r`DROP DATABASE shop;
SELECT * FROM shop.orders;

-- OUTPUT:
-- Query OK, 3 rows affected (0.04 sec)       -- number of dropped tables
-- ERROR 1146 (42S02): Table 'shop.orders' doesn't exist`],
        [`<b>Limitations:</b> names up to 64 characters, case sensitivity follows the OS, and a database cannot be renamed (RENAME DATABASE was removed); use dump/restore or move tables.`,
            r`RENAME DATABASE shop TO shop2;

-- OUTPUT:
-- ERROR 1064 (42000): You have an error in your SQL syntax ... near 'DATABASE shop TO shop2'`],
        `
   CREATE DATABASE ─► SHOW DATABASES ─► USE db ─► work (tables...) ─► DROP DATABASE
                                          │
                       session default schema (DATABASE())
`,
        `Create schemas via migrations with explicit charset and collation, not by hand. Deny DROP on production for application users and require a backup check before any DROP. Qualify names (db.table) in scripts rather than relying on USE.`
    ),

    'Table Operations: CREATE, SHOW & DESCRIBE': dd(
        [`<code>CREATE TABLE</code> defines columns and constraints, <code>SHOW TABLES</code> lists tables, <code>DESCRIBE</code> (or <code>SHOW COLUMNS</code>) shows a table's structure.`,
            r`CREATE DATABASE IF NOT EXISTS shop; USE shop;
CREATE TABLE customer (
    id         INT          NOT NULL AUTO_INCREMENT,    -- surrogate key
    name       VARCHAR(50)  NOT NULL,
    email      VARCHAR(80)  UNIQUE,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,  -- auto-filled
    PRIMARY KEY (id)
) ENGINE=InnoDB;
SHOW TABLES;

-- OUTPUT:
-- +----------------+
-- | Tables_in_shop |
-- +----------------+
-- | customer       |
-- +----------------+`],
        [`You must define a structure before storing rows. Clear types and constraints in the CREATE statement prevent bad data later.`,
            r`DESCRIBE customer;

-- OUTPUT:
-- +------------+-------------+------+-----+-------------------+-------------------+
-- | Field      | Type        | Null | Key | Default           | Extra             |
-- +------------+-------------+------+-----+-------------------+-------------------+
-- | id         | int         | NO   | PRI | NULL              | auto_increment    |
-- | name       | varchar(50) | NO   |     | NULL              |                   |
-- | email      | varchar(80) | YES  | UNI | NULL              |                   |
-- | created_at | timestamp   | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
-- +------------+-------------+------+-----+-------------------+-------------------+`],
        [`Developers copy a table's shape with <code>CREATE TABLE ... LIKE</code>, and capture the exact DDL with <code>SHOW CREATE TABLE</code> for version control.`,
            r`CREATE TABLE customer_archive LIKE customer;    -- same columns and indexes, no data
SHOW CREATE TABLE customer_archive\G

-- OUTPUT (trimmed):
-- Create Table: CREATE TABLE customer_archive (
--   id int NOT NULL AUTO_INCREMENT,
--   name varchar(50) NOT NULL,
--   ...
--   PRIMARY KEY (id), UNIQUE KEY email (email)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`],
        [`<b>Advantages:</b> declarative structure, rich options (engine, charset, comments), self-documenting via DESCRIBE.`,
            r`CREATE TABLE customer_copy AS SELECT id, name FROM customer;   -- shape + data from a query
SELECT COUNT(*) AS rows_copied FROM customer_copy;

-- OUTPUT:
-- +-------------+
-- | rows_copied |
-- +-------------+
-- |           0 |
-- +-------------+`],
        [`<b>Disadvantages:</b> CREATE TABLE ... AS SELECT does not copy keys or indexes, and a poor first design is costly to change on big tables.`,
            r`DESCRIBE customer_copy;           -- note: no PRI key, no AUTO_INCREMENT

-- OUTPUT (trimmed):
-- | id   | int         | NO | | 0    |   |
-- | name | varchar(50) | NO | | NULL |   |`],
        [`<b>Limitations:</b> max 4096 columns (about 1017 for InnoDB), at most 16 columns per index, row size 65,535 bytes, and a table with an existing name raises an error unless IF NOT EXISTS is used.`,
            r`CREATE TABLE customer (id INT);

-- OUTPUT:
-- ERROR 1050 (42S01): Table 'customer' already exists`],
        `
   CREATE TABLE ─► definition stored in data dictionary
                ─► .ibd file created (file-per-table)
   SHOW TABLES    : names          DESCRIBE : columns
   SHOW CREATE TABLE : full DDL    INFORMATION_SCHEMA.COLUMNS : queryable
`,
        `Design the table on paper first: key choice, types, nullability, charset. Keep DDL in migration files, name constraints explicitly, and set ENGINE and COMMENT where it helps. Use IF NOT EXISTS only in idempotent bootstrap scripts, not to hide drift.`
    ),

    'ALTER TABLE': dd(
        [`<code>ALTER TABLE</code> changes an existing table: add, modify or drop columns, indexes and constraints, rename things and change options. It is how schemas evolve.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20));
ALTER TABLE emp ADD COLUMN salary DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER name;   -- add column
ALTER TABLE emp MODIFY COLUMN name VARCHAR(50) NOT NULL;                         -- change type
ALTER TABLE emp ADD INDEX idx_name (name);                                       -- add index
DESCRIBE emp;

-- OUTPUT:
-- +--------+---------------+------+-----+---------+-------+
-- | Field  | Type          | Null | Key | Default | Extra |
-- +--------+---------------+------+-----+---------+-------+
-- | id     | int           | NO   | PRI | NULL    |       |
-- | name   | varchar(50)   | NO   | MUL | NULL    |       |
-- | salary | decimal(10,2) | NO   |     | 0.00    |       |
-- +--------+---------------+------+-----+---------+-------+`],
        [`Requirements change: a new field, a longer name, a new rule. Rebuilding the table by hand would be slow and error-prone.`,
            r`ALTER TABLE emp RENAME COLUMN name TO full_name;        -- 8.0 syntax
ALTER TABLE emp CHANGE COLUMN full_name emp_name VARCHAR(60);   -- rename + retype
ALTER TABLE emp DROP COLUMN salary;
SHOW COLUMNS FROM emp;

-- OUTPUT:
-- +----------+-------------+------+-----+---------+-------+
-- | Field    | Type        | Null | Key | Default | Extra |
-- +----------+-------------+------+-----+---------+-------+
-- | id       | int         | NO   | PRI | NULL    |       |
-- | emp_name | varchar(60) | YES  |     | NULL    |       |
-- +----------+-------------+------+-----+---------+-------+`],
        [`Production migrations (Flyway, Liquibase, Rails/Django) are sequences of ALTER statements. Large tables use online DDL or tools like gh-ost / pt-online-schema-change.`,
            r`-- Ask for an online, non-blocking change; fail instead of silently locking
ALTER TABLE emp ADD COLUMN dept_id INT, ALGORITHM=INPLACE, LOCK=NONE;

-- OUTPUT:
-- Query OK, 0 rows affected (0.02 sec)
-- Records: 0  Duplicates: 0  Warnings: 0`],
        [`<b>Advantages:</b> keeps data while changing structure; INSTANT algorithm (8.0) adds a column in constant time; many ops run online.`,
            r`ALTER TABLE emp ADD COLUMN note VARCHAR(10), ALGORITHM=INSTANT;   -- metadata-only change

-- OUTPUT:
-- Query OK, 0 rows affected (0.01 sec)`],
        [`<b>Disadvantages:</b> some alters rebuild the whole table (copy), blocking or slowing writes and needing extra disk; dropping a column loses data permanently.`,
            r`-- Changing a column type usually needs a full table copy
ALTER TABLE emp MODIFY emp_name TEXT, ALGORITHM=INPLACE;

-- OUTPUT:
-- ERROR 1846 (0A000): ALGORITHM=INPLACE is not supported. Reason: Cannot change column type INPLACE. Try ALGORITHM=COPY.`],
        [`<b>Limitations:</b> MySQL DDL is not transactional (it auto-commits and cannot be rolled back), a failed ALTER on a huge table is expensive, and replicas must also apply the change.`,
            r`START TRANSACTION;
ALTER TABLE emp ADD COLUMN x INT;          -- implicit COMMIT happens here
ROLLBACK;                                  -- too late: column x stays
SHOW COLUMNS FROM emp LIKE 'x';

-- OUTPUT:
-- | x | int | YES | | NULL | |`],
        `
   ALTER TABLE ... ADD / MODIFY / CHANGE / DROP / RENAME
        │
        ├─ INSTANT : change only metadata       (fast)
        ├─ INPLACE : rebuild inside engine      (online-ish)
        └─ COPY    : create new table, copy rows (slow, blocks)
`,
        `Explicitly state ALGORITHM and LOCK so a migration fails fast instead of locking production. For big tables use gh-ost or pt-osc, deploy in backward-compatible steps (add nullable, backfill, switch, drop later) and watch replica lag.`
    ),

    'DROP, TRUNCATE & RENAME': dd(
        [`<code>DROP TABLE</code> removes a table and its data. <code>TRUNCATE TABLE</code> empties it but keeps the structure. <code>RENAME TABLE</code> changes names atomically.`,
            r`CREATE TABLE log_a (id INT AUTO_INCREMENT PRIMARY KEY, msg VARCHAR(20));
INSERT INTO log_a (msg) VALUES ('x'),('y'),('z');
TRUNCATE TABLE log_a;                         -- all rows gone, AUTO_INCREMENT reset
INSERT INTO log_a (msg) VALUES ('new');
SELECT * FROM log_a;

-- OUTPUT:
-- +----+------+
-- | id | msg  |
-- +----+------+
-- |  1 | new  |
-- +----+------+`],
        [`Cleaning test data, retiring old tables and swapping a rebuilt table into place are routine; each command has different speed, safety and side effects.`,
            r`-- DELETE vs TRUNCATE
INSERT INTO log_a (msg) VALUES ('p'),('q');
DELETE FROM log_a;                            -- row by row, can ROLLBACK, keeps counter
INSERT INTO log_a (msg) VALUES ('after');
SELECT id FROM log_a;

-- OUTPUT:
-- +----+
-- | id |
-- +----+
-- |  4 |
-- +----+`],
        [`The classic zero-downtime swap: build a new table, then rename both in one atomic statement.`,
            r`CREATE TABLE log_new LIKE log_a;
RENAME TABLE log_a TO log_old, log_new TO log_a;    -- atomic swap
SHOW TABLES LIKE 'log%';

-- OUTPUT:
-- +----------------------------+
-- | Tables_in_shop (log%)      |
-- +----------------------------+
-- | log_a                      |
-- | log_old                    |
-- +----------------------------+`],
        [`<b>Advantages:</b> TRUNCATE is much faster than DELETE for all rows (drops and recreates), DROP frees disk, RENAME is atomic and instant.`,
            r`DROP TABLE IF EXISTS log_old;               -- no error if missing
SHOW TABLES LIKE 'log_old';

-- OUTPUT:
-- Empty set (0.00 sec)`],
        [`<b>Disadvantages:</b> TRUNCATE and DROP implicitly commit and cannot be rolled back; TRUNCATE does not fire DELETE triggers.`,
            r`START TRANSACTION;
TRUNCATE TABLE log_a;
ROLLBACK;                                     -- does nothing: TRUNCATE already committed
SELECT COUNT(*) AS n FROM log_a;

-- OUTPUT:
-- +---+
-- | n |
-- +---+
-- | 0 |
-- +---+`],
        [`<b>Limitations:</b> a table referenced by a foreign key cannot be dropped or truncated while the FK exists (unless FK checks are disabled, which is dangerous).`,
            r`CREATE TABLE p (id INT PRIMARY KEY);
CREATE TABLE c (id INT PRIMARY KEY, p_id INT, FOREIGN KEY (p_id) REFERENCES p(id));
TRUNCATE TABLE p;

-- OUTPUT:
-- ERROR 1701 (42000): Cannot truncate a table referenced in a foreign key constraint
-- (shop.c, CONSTRAINT c_ibfk_1)`],
        `
              rows   structure  rollback  triggers  speed   counter
   DELETE      yes     keep       yes      fire     slow    kept
   TRUNCATE    all     keep       NO       no       fast    reset
   DROP        all     removed    NO       no       fast    n/a
   RENAME      -       renamed    NO (atomic, instant)
`,
        `Make destructive commands unreachable for application accounts, take a backup or rename to *_old and drop later, and prefer RENAME swaps for rebuilds. Use DELETE with batches for partial purges on busy tables; use partition drops for time-based retention.`
    ),
};
