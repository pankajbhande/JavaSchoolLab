// Deep dive, module 1 (Database Fundamentals).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d01: Record<string, Deep> = {
    'What is a Database?': dv(
        [`A database server is a long-running process that owns the data files. Clients never read those files directly: they send commands over a connection, the server parses them, plans them, executes them against pages cached in memory, and writes changes to a log before the data files are updated. This is why a database stays correct when ten users write at once or when the power fails mid-write.`,
            r`-- Everything you do goes through the server: ask the server about itself
SELECT @@version AS server_version, @@datadir AS data_directory, @@port AS port;
SHOW ENGINES;

-- OUTPUT:
-- server_version | data_directory                           | port
-- 8.0.36         | C:\ProgramData\MySQL\MySQL Server 8.0\Data | 3306
-- (SHOW ENGINES lists InnoDB as DEFAULT: it provides transactions and crash recovery)`],
        [`The same idea can be created with different levels of structure. A server holds many databases, a database holds tables, and a table holds typed columns. You create each level with its own statement, and you can inspect each level from the system catalog (<code>information_schema</code>).`,
            r`CREATE DATABASE IF NOT EXISTS library CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE library;
CREATE TABLE books (id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(120) NOT NULL, published DATE);
SELECT schema_name, default_character_set_name FROM information_schema.schemata WHERE schema_name = 'library';
SELECT table_name, engine, table_rows FROM information_schema.tables WHERE table_schema = 'library';

-- OUTPUT:
-- schema_name | default_character_set_name
-- library     | utf8mb4
-- table_name | engine | table_rows
-- books      | InnoDB |          0`],
        [`The classic beginner mistake is treating a database like a spreadsheet: storing lists in one cell, repeating the same fact in many rows, or relying on row order. The database cannot protect you from data it has no rules for. Fix it by giving every fact one home, a primary key and constraints.`,
            r`-- BAD: a list in one cell, no key, no rules
CREATE TABLE students_bad (name VARCHAR(50), courses VARCHAR(200));
INSERT INTO students_bad VALUES ('Abaji', 'SQL,Java,Python'), ('Abaji', 'SQL');   -- duplicate person, inconsistent

-- GOOD: one fact per row, keys and constraints
CREATE TABLE students (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) NOT NULL);
CREATE TABLE enrolments (student_id INT, course VARCHAR(30), PRIMARY KEY (student_id, course),
  FOREIGN KEY (student_id) REFERENCES students(id));
INSERT INTO students (name) VALUES ('Abaji');
INSERT INTO enrolments VALUES (1,'SQL'),(1,'Java'),(1,'SQL');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-SQL' for key 'enrolments.PRIMARY'   (the database stops the duplicate)`],
        [`Databases are fast because they avoid reading everything. An index is a sorted structure that finds a row in a handful of page reads, and the buffer pool keeps hot pages in RAM. You can see the difference by asking the optimizer for its plan before and after adding an index.`,
            r`CREATE TABLE people (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(80), city VARCHAR(30));
-- imagine 1,000,000 rows loaded here
EXPLAIN SELECT id FROM people WHERE email = 'a@x.com';
ALTER TABLE people ADD INDEX idx_email (email);
EXPLAIN SELECT id FROM people WHERE email = 'a@x.com';

-- OUTPUT: (example)
-- before: type=ALL  key=NULL      rows=998000   (reads every row)
-- after : type=ref  key=idx_email rows=1        (jumps straight to the row)`],
        [`A realistic first design: a small library system. It shows the three ideas a beginner must master together: tables for entities, keys for identity, and relationships through foreign keys. Notice that the loan table records <em>when</em> something happened, not just that it did.`,
            r`CREATE TABLE members (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(60) NOT NULL, email VARCHAR(100) UNIQUE NOT NULL);
CREATE TABLE loans (id INT PRIMARY KEY AUTO_INCREMENT, member_id INT NOT NULL, book_id INT NOT NULL,
  borrowed_on DATE NOT NULL DEFAULT (CURRENT_DATE), returned_on DATE NULL,
  FOREIGN KEY (member_id) REFERENCES members(id), FOREIGN KEY (book_id) REFERENCES books(id));
INSERT INTO members (name, email) VALUES ('Abaji','abaji@example.com');
INSERT INTO books (title) VALUES ('Learning SQL');
INSERT INTO loans (member_id, book_id) VALUES (1, 1);
SELECT m.name, b.title, l.borrowed_on, l.returned_on IS NULL AS still_out
FROM loans l JOIN members m ON m.id = l.member_id JOIN books b ON b.id = l.book_id;

-- OUTPUT:
-- name  | title        | borrowed_on | still_out
-- Abaji | Learning SQL | 2026-05-01  | 1`]
    ),

    'DBMS vs RDBMS': dv(
        [`An RDBMS adds the relational model on top of storage: data lives in tables whose rows are identified by keys, and relationships are expressed by matching key values rather than by pointers. Because of that, the engine can verify relationships (foreign keys) and answer questions declaratively (SQL joins) without you writing navigation code.`,
            r`-- RDBMS behaviour you get for free: the engine checks relationships
CREATE TABLE dept (id INT PRIMARY KEY, name VARCHAR(20)) ENGINE=InnoDB;
CREATE TABLE emp  (id INT PRIMARY KEY, dept_id INT NOT NULL, FOREIGN KEY (dept_id) REFERENCES dept(id)) ENGINE=InnoDB;
INSERT INTO dept VALUES (1,'HR');
INSERT INTO emp VALUES (1, 1);
INSERT INTO emp VALUES (2, 9);

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails`],
        [`Inside MySQL the difference shows up as a choice of storage engine. InnoDB behaves like a full RDBMS (transactions, foreign keys, crash recovery); MyISAM behaves more like a simple DBMS (table locks, no transactions). You can compare them directly by trying the same operations on both.`,
            r`CREATE TABLE t_innodb (id INT PRIMARY KEY) ENGINE=InnoDB;
CREATE TABLE t_myisam (id INT PRIMARY KEY) ENGINE=MyISAM;
START TRANSACTION; INSERT INTO t_innodb VALUES (1); INSERT INTO t_myisam VALUES (1); ROLLBACK;
SELECT (SELECT COUNT(*) FROM t_innodb) AS innodb_rows, (SELECT COUNT(*) FROM t_myisam) AS myisam_rows;

-- OUTPUT:
-- innodb_rows | myisam_rows
--           0 |           1     (MyISAM cannot roll back)`],
        [`A common mistake is assuming every MySQL table gives RDBMS guarantees. A table created on an old default or a MyISAM engine silently accepts foreign key syntax but ignores it. Always verify the engine, and treat missing constraints as a bug, not as flexibility.`,
            r`-- MyISAM parses the FOREIGN KEY clause but does not enforce it
CREATE TABLE child_bad (id INT PRIMARY KEY, parent_id INT, FOREIGN KEY (parent_id) REFERENCES dept(id)) ENGINE=MyISAM;
INSERT INTO child_bad VALUES (1, 999);
SELECT * FROM child_bad;

-- Fix: convert and then clean the orphan rows
ALTER TABLE child_bad ENGINE=InnoDB;

-- OUTPUT:
-- id | parent_id
--  1 |       999      (an orphan row that a real RDBMS would have rejected)`],
        [`RDBMS rules cost a little on every write (checks, locks, logs), but they save far more time in debugging. You can measure what the integrity checks cost, and you can also see that a covering index keeps the check cheap because the parent lookup is a primary-key hit.`,
            r`EXPLAIN INSERT INTO emp (id, dept_id) VALUES (3, 1);
SHOW STATUS LIKE 'Handler_read_key';

-- OUTPUT: (example)
-- the foreign key check performs one primary-key lookup on dept (type=const)
-- Handler_read_key increases by 1 per checked row`],
        [`In a real system the relational model pays off when requirements change. A report asking "which departments have more than 2 employees and what do they earn" is a single declarative query over related tables; with a non-relational file store you would write loops and joins by hand.`,
            r`SELECT d.name AS department, COUNT(*) AS staff, ROUND(AVG(e.salary)) AS avg_salary
FROM dept d JOIN emp_pay e ON e.dept_id = d.id
GROUP BY d.id, d.name
HAVING COUNT(*) > 2
ORDER BY avg_salary DESC;

-- OUTPUT: (example)
-- department | staff | avg_salary
-- Engineering|     8 |      82000
-- Sales      |     5 |      54000`]
    ),

    'What is MySQL?': dv(
        [`MySQL has a layered architecture: a connection layer (threads, authentication), an SQL layer (parser, optimizer, executor) and a pluggable storage-engine layer (InnoDB by default). Your SQL text is parsed into a tree, optimized into a plan using table statistics, and executed by calling the storage engine for rows.`,
            r`-- Ask the server which layers/features are active
SELECT @@version, @@version_comment, @@default_storage_engine, @@character_set_server, @@sql_mode\G

-- OUTPUT: (example)
-- @@version: 8.0.36
-- @@version_comment: MySQL Community Server - GPL
-- @@default_storage_engine: InnoDB
-- @@character_set_server: utf8mb4
-- @@sql_mode: ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,...`],
        [`You can talk to MySQL in several ways: the <code>mysql</code> client, MySQL Shell, Workbench, or any driver. Variables can be read at three scopes: global (server), session (your connection), and per statement through hints. Knowing the scope tells you who is affected by a change.`,
            r`SELECT @@global.max_connections AS global_value, @@session.sql_mode AS session_mode;
SET SESSION sql_mode = 'STRICT_ALL_TABLES';        -- only my connection
SET GLOBAL max_connections = 300;                  -- everyone, until restart
SET PERSIST max_connections = 300;                 -- everyone, survives restart

-- OUTPUT:
-- Query OK, 0 rows affected (x3)`],
        [`Typical mistakes: using the old 3-byte <code>utf8</code> charset, running with a loose <code>sql_mode</code>, and developing on one MySQL version while production runs another. The charset one is the most damaging because it silently loses emoji and some characters.`,
            r`CREATE TABLE msg_bad (t VARCHAR(20)) CHARACTER SET utf8mb3;
INSERT INTO msg_bad VALUES ('hello 😀');

CREATE TABLE msg_ok (t VARCHAR(20)) CHARACTER SET utf8mb4;
INSERT INTO msg_ok VALUES ('hello 😀');
SELECT t FROM msg_ok;

-- OUTPUT:
-- ERROR 1366 (HY000): Incorrect string value: '\xF0\x9F\x98\x80' for column 't' at row 1
-- t
-- hello 😀`],
        [`The two biggest levers for MySQL performance are memory for the buffer pool and proper indexes. Checking the buffer pool hit rate tells you in one query whether reads are coming from RAM or disk.`,
            r`SELECT ROUND((1 - Innodb_buffer_pool_reads.v / Innodb_buffer_pool_read_requests.v) * 100, 2) AS hit_rate_pct
FROM (SELECT VARIABLE_VALUE AS v FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads') Innodb_buffer_pool_reads,
     (SELECT VARIABLE_VALUE AS v FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') Innodb_buffer_pool_read_requests;

-- OUTPUT: (example)
-- hit_rate_pct
-- 99.87`],
        [`A first production habit: never develop as root. Create an application user, grant only the privileges it needs, and connect with it. This one practice limits the blast radius of bugs and leaks.`,
            r`CREATE DATABASE shop CHARACTER SET utf8mb4;
CREATE USER 'shop_app'@'localhost' IDENTIFIED BY 'Str0ng#Passw0rd';
GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'shop_app'@'localhost';
SHOW GRANTS FOR 'shop_app'@'localhost';

-- OUTPUT:
-- GRANT USAGE ON *.* TO shop_app@localhost
-- GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO shop_app@localhost`]
    ),

    'Database, Table, Row & Column': dv(
        [`Physically, an InnoDB table is a B-tree ordered by the primary key; each leaf page (16 KB) stores many rows, and each row stores its column values plus hidden fields (transaction id and roll pointer). A column is not stored separately: values of one row sit together, which is why reading a whole row is cheap and reading one column of a million rows still reads whole pages.`,
            r`CREATE TABLE products (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(40) NOT NULL, price DECIMAL(8,2) NOT NULL);
INSERT INTO products (name, price) VALUES ('Pen',10),('Book',150),('Bag',799);
SELECT table_name, avg_row_length, data_length, index_length FROM information_schema.tables WHERE table_name = 'products';

-- OUTPUT: (example)
-- table_name | avg_row_length | data_length | index_length
-- products   |           5461 |       16384 |            0     (one 16 KB page holds all 3 rows)`],
        [`A column definition is a name plus a type plus optional rules. You can add defaults, generated values, comments and visibility. Generated columns compute a value from other columns so it can never drift out of sync.`,
            r`CREATE TABLE order_lines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  qty INT NOT NULL CHECK (qty > 0),
  unit_price DECIMAL(8,2) NOT NULL,
  line_total DECIMAL(10,2) AS (qty * unit_price) STORED COMMENT 'always qty x price',
  note VARCHAR(100) NULL DEFAULT NULL
);
INSERT INTO order_lines (qty, unit_price) VALUES (3, 12.50);
SELECT qty, unit_price, line_total FROM order_lines;

-- OUTPUT:
-- qty | unit_price | line_total
--   3 |      12.50 |      37.50`],
        [`Mistakes: relying on row order, using SELECT * in application code, and mixing up a row with a record in the application. Rows have no inherent order; only ORDER BY gives one. The fix is always to name columns and to order explicitly.`,
            r`INSERT INTO products (name, price) VALUES ('Cap', 50);
SELECT * FROM products;                              -- order not guaranteed, columns may change later
SELECT id, name, price FROM products ORDER BY id;    -- explicit and stable

-- OUTPUT:
-- id | name | price
--  1 | Pen  |  10.00
--  2 | Book | 150.00
--  3 | Bag  | 799.00
--  4 | Cap  |  50.00`],
        [`Row width affects performance: more rows per page means fewer page reads. Choosing types carefully and moving rarely-used large columns out of the main table keeps scans fast. You can measure rows per page with simple arithmetic from the catalog.`,
            r`SELECT table_name, table_rows, avg_row_length, ROUND(16384 / NULLIF(avg_row_length, 0)) AS approx_rows_per_page
FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'products';

-- OUTPUT: (with realistic data)
-- table_name | table_rows | avg_row_length | approx_rows_per_page
-- products   |    1200000 |             62 |                  264`],
        [`A real onboarding task: read the structure of an unfamiliar database. Start from the catalog to list tables, columns and row counts, then sample a few rows. This is the first thing you do on a new project.`,
            r`SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = 'shop' ORDER BY table_rows DESC;
SELECT column_name, column_type, is_nullable, column_key FROM information_schema.columns WHERE table_schema = 'shop' AND table_name = 'orders' ORDER BY ordinal_position;

-- OUTPUT: (example)
-- table_name  | table_rows
-- order_items |    1840211
-- orders      |     612044
-- column_name | column_type  | is_nullable | column_key
-- id          | bigint       | NO          | PRI
-- customer_id | bigint       | NO          | MUL
-- total       | decimal(10,2)| NO          |`]
    ),

    'Schema': dv(
        [`In MySQL the words schema and database are synonyms: both map to a directory of tables inside the data directory. The catalog table <code>information_schema.schemata</code> lists them, and a fully qualified name <code>schema.table</code> lets one statement touch several.`,
            r`SELECT schema_name, default_character_set_name, default_collation_name FROM information_schema.schemata WHERE schema_name IN ('shop','hr');
SELECT o.id, c.name FROM shop.orders o JOIN hr.staff c ON c.id = o.created_by LIMIT 1;

-- OUTPUT:
-- schema_name | default_character_set_name | default_collation_name
-- shop        | utf8mb4                    | utf8mb4_0900_ai_ci
-- hr          | utf8mb4                    | utf8mb4_0900_ai_ci`],
        [`Schema design means choosing tables, columns, types, keys and constraints. You can read the full definition of any table with <code>SHOW CREATE TABLE</code>, and you can export only the structure (no data) with <code>mysqldump --no-data</code> to review or version it.`,
            r`SHOW CREATE TABLE orders\G
-- shell: mysqldump -u root -p --no-data --routines shop > shop_schema.sql

-- OUTPUT: (example)
-- Create Table: CREATE TABLE orders (
--   id bigint NOT NULL AUTO_INCREMENT, customer_id bigint NOT NULL, total decimal(10,2) NOT NULL,
--   PRIMARY KEY (id), KEY idx_customer (customer_id),
--   CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`],
        [`A frequent mistake is letting schemas drift between environments: a column added by hand in production that no migration knows about. Comparing catalogs finds the difference quickly.`,
            r`-- run on both environments, then diff the outputs
SELECT table_name, column_name, column_type, is_nullable, column_default
FROM information_schema.columns WHERE table_schema = 'shop' ORDER BY table_name, ordinal_position;

-- OUTPUT: (diff result)
-- < orders.note  varchar(100) YES NULL      (exists only in production: untracked change)`],
        [`Schema choices decide performance for years. Wide VARCHAR(255) everywhere, missing foreign key indexes, and wrong types cost memory in every query. A catalog query can flag columns that look oversized or tables without a primary key.`,
            r`SELECT t.table_name FROM information_schema.tables t
LEFT JOIN information_schema.statistics s ON s.table_schema = t.table_schema AND s.table_name = t.table_name AND s.index_name = 'PRIMARY'
WHERE t.table_schema = 'shop' AND t.table_type = 'BASE TABLE' AND s.index_name IS NULL;

-- OUTPUT:
-- table_name
-- legacy_import     (table with no primary key: fix it)`],
        [`A realistic team workflow: all schema changes are migration files in version control, applied by CI, and the production catalog is periodically compared to the expected one to catch drift.`,
            r`-- V7__add_orders_channel.sql   (reviewed in a pull request)
ALTER TABLE orders ADD COLUMN channel VARCHAR(20) NOT NULL DEFAULT 'WEB', ALGORITHM=INSTANT;

SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 2;

-- OUTPUT:
-- version | description         | success
-- 7       | add orders channel  | 1
-- 6       | add customers index | 1`]
    ),

    'Primary Key & Foreign Key Basics': dv(
        [`A primary key creates a unique index and, in InnoDB, becomes the clustered index: the table rows are stored in primary key order. A foreign key adds a second index on the child column (if none exists) and a check on every insert/update/delete that the referenced parent row exists. The check takes a shared lock on the parent row.`,
            r`CREATE TABLE customers (id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(40));
CREATE TABLE orders (id BIGINT PRIMARY KEY AUTO_INCREMENT, customer_id BIGINT NOT NULL, total DECIMAL(10,2),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id));
SHOW INDEX FROM orders;

-- OUTPUT: (trimmed)
-- Key_name        | Column_name
-- PRIMARY         | id
-- fk_orders_customer | customer_id       (index created automatically for the foreign key)`],
        [`Keys can be declared inline, at the end of the table, or added later. Foreign keys accept actions: RESTRICT, CASCADE, SET NULL on delete or update. Choose per relationship: cascade for owned children, restrict for independent data.`,
            r`ALTER TABLE orders DROP FOREIGN KEY fk_orders_customer;
ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
  ON DELETE RESTRICT ON UPDATE CASCADE;
SELECT constraint_name, delete_rule, update_rule FROM information_schema.referential_constraints WHERE table_name = 'orders';

-- OUTPUT:
-- constraint_name    | delete_rule | update_rule
-- fk_orders_customer | RESTRICT    | CASCADE`],
        [`Mistakes: foreign key type mismatch (INT vs BIGINT, signed vs unsigned, different charset), forgetting the index on the child column in logical (unconstrained) references, and cascading deletes on big trees. Error 1215/3780 means the two columns are not compatible.`,
            r`CREATE TABLE bad_child (id INT PRIMARY KEY, customer_id INT, FOREIGN KEY (customer_id) REFERENCES customers(id));   -- parent is BIGINT

-- OUTPUT:
-- ERROR 3780 (HY000): Referencing column 'customer_id' and referenced column 'id' in foreign key constraint 'bad_child_ibfk_1' are incompatible.

-- Fix: use the same type
CREATE TABLE good_child (id INT PRIMARY KEY, customer_id BIGINT, FOREIGN KEY (customer_id) REFERENCES customers(id));`],
        [`Primary key size multiplies through every secondary index. A BIGINT key is 8 bytes; a 36-character UUID string in utf8mb4 can be 144 bytes in every index entry. Compare index sizes to see the effect.`,
            r`SELECT table_name, ROUND(data_length/1048576,1) AS data_mb, ROUND(index_length/1048576,1) AS index_mb
FROM information_schema.tables WHERE table_name IN ('orders_bigint_pk','orders_uuid_pk');

-- OUTPUT: (example, 5M rows each)
-- table_name       | data_mb | index_mb
-- orders_bigint_pk |   410.0 |    180.0
-- orders_uuid_pk   |   780.0 |    690.0`],
        [`A real design decision: do you allow deleting a customer who has orders? Most businesses say no, so use RESTRICT and "deactivate" instead. The database then protects history even if the application has a bug.`,
            r`DELETE FROM customers WHERE id = 1;
UPDATE customers SET status = 'INACTIVE', deleted_at = NOW() WHERE id = 1;

-- OUTPUT:
-- ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails (shop.orders, CONSTRAINT fk_orders_customer ...)
-- Query OK, 1 row affected`]
    ),

    'Candidate, Composite & Unique Keys': dv(
        [`Every UNIQUE constraint is backed by a unique B-tree index; the engine checks it on each write by looking for an existing entry. A composite key sorts by the first column, then the second, so lookups on the left column alone still use the index but on the second column alone do not (leftmost prefix).`,
            r`CREATE TABLE enrolments (student_id INT, course_id INT, enrolled_on DATE, PRIMARY KEY (student_id, course_id));
EXPLAIN SELECT * FROM enrolments WHERE student_id = 7;      -- uses the primary key prefix
EXPLAIN SELECT * FROM enrolments WHERE course_id = 3;       -- cannot seek (second column only)

-- OUTPUT: (example)
-- query 1: type=ref  key=PRIMARY
-- query 2: type=index key=PRIMARY (scans the whole index)`],
        [`UNIQUE can be single or composite, named or unnamed, and MySQL 8 supports functional and prefix unique indexes. Name constraints so error messages and migrations are readable.`,
            r`CREATE TABLE members (
  id INT PRIMARY KEY AUTO_INCREMENT, tenant_id INT NOT NULL, email VARCHAR(120) NOT NULL, national_id CHAR(12) NULL,
  CONSTRAINT uq_tenant_email UNIQUE (tenant_id, email),
  CONSTRAINT uq_national UNIQUE (national_id)
);
INSERT INTO members (tenant_id, email) VALUES (1,'a@x.com'),(2,'a@x.com');     -- same email in different tenants is fine
INSERT INTO members (tenant_id, email) VALUES (1,'a@x.com');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-a@x.com' for key 'members.uq_tenant_email'`],
        [`Mistakes: expecting UNIQUE to reject duplicate NULLs, forgetting case-insensitive collations treat "A@x.com" and "a@x.com" as equal, and choosing a composite key with the columns in the wrong order for the queries you run.`,
            r`INSERT INTO members (tenant_id, email, national_id) VALUES (3,'n1@x.com',NULL),(3,'n2@x.com',NULL);   -- allowed: NULLs are distinct
INSERT INTO members (tenant_id, email) VALUES (3,'N1@X.COM');

-- OUTPUT:
-- Query OK, 2 rows affected
-- ERROR 1062 (23000): Duplicate entry '3-N1@X.COM' for key 'members.uq_tenant_email'    (case-insensitive collation)`],
        [`Composite key column order is a performance decision. Put the column you always filter by first. A key (tenant_id, email) serves "all rows of a tenant" and "one email in a tenant", while (email, tenant_id) serves neither as well.`,
            r`EXPLAIN SELECT id FROM members WHERE tenant_id = 1;
EXPLAIN SELECT id FROM members WHERE tenant_id = 1 AND email = 'a@x.com';

-- OUTPUT: (example)
-- both use key uq_tenant_email: type=ref and type=const/ref (uses 1 and 2 key parts)`],
        [`Soft-deleted rows break plain UNIQUE (a deleted email blocks re-registration). A generated column that is NULL for deleted rows gives "unique among active rows" because NULLs never collide.`,
            r`ALTER TABLE members ADD COLUMN deleted_at DATETIME NULL,
  ADD COLUMN active_email VARCHAR(120) AS (IF(deleted_at IS NULL, email, NULL)) VIRTUAL,
  ADD UNIQUE KEY uq_active_email (tenant_id, active_email);
UPDATE members SET deleted_at = NOW() WHERE tenant_id = 1 AND email = 'a@x.com';
INSERT INTO members (tenant_id, email) VALUES (1, 'a@x.com');

-- OUTPUT:
-- Query OK, 1 row affected   (re-registration allowed after soft delete)`]
    ),

    'Constraints Overview': dv(
        [`Constraints are checked by the SQL layer (NOT NULL, CHECK, DEFAULT) and by InnoDB indexes (PRIMARY KEY, UNIQUE, FOREIGN KEY) at statement time. If any row violates a rule the whole statement is rolled back, not just that row, which is what keeps tables consistent under concurrency.`,
            r`CREATE TABLE accounts (id INT PRIMARY KEY, owner VARCHAR(30) NOT NULL, balance DECIMAL(10,2) NOT NULL DEFAULT 0, CONSTRAINT chk_bal CHECK (balance >= 0));
INSERT INTO accounts VALUES (1,'Abaji',100),(2,'Raoji',-5),(3,'Moropant',50);
SELECT COUNT(*) FROM accounts;

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'chk_bal' is violated.
-- COUNT(*)
-- 0           (the whole multi-row INSERT was rejected)`],
        [`Constraints can be inspected and changed after creation: list them from the catalog, add new ones with ALTER, and in MySQL 8.0.16+ toggle CHECK constraints between ENFORCED and NOT ENFORCED to stage a rollout.`,
            r`SELECT constraint_name, constraint_type FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'accounts';
ALTER TABLE accounts ALTER CONSTRAINT chk_bal NOT ENFORCED;
ALTER TABLE accounts ALTER CONSTRAINT chk_bal ENFORCED;

-- OUTPUT:
-- constraint_name | constraint_type
-- PRIMARY         | PRIMARY KEY
-- chk_bal         | CHECK`],
        [`Mistakes: relying only on application validation, forgetting NOT NULL (so "required" fields hold NULLs), and writing CHECKs that depend on other rows (not allowed). NULL passes a CHECK, so combine CHECK with NOT NULL.`,
            r`CREATE TABLE people (id INT PRIMARY KEY, age INT CHECK (age >= 18));
INSERT INTO people VALUES (1, NULL);     -- passes the CHECK: NULL is "unknown", not false
SELECT * FROM people;

-- Fix: make it required
ALTER TABLE people MODIFY age INT NOT NULL;

-- OUTPUT:
-- id | age
--  1 | NULL`],
        [`Adding a constraint to a big, live table validates every row. Do it safely: find violators first, fix them, then add the constraint, and watch for metadata lock waits.`,
            r`SELECT COUNT(*) AS violators FROM orders WHERE total < 0;
UPDATE orders SET total = 0 WHERE total < 0 LIMIT 10000;
SET SESSION lock_wait_timeout = 5;
ALTER TABLE orders ADD CONSTRAINT chk_total CHECK (total >= 0);

-- OUTPUT:
-- violators
-- 0
-- Query OK, 0 rows affected`],
        [`Layered validation in a real application: the UI gives friendly messages, the service checks business rules, and the database enforces invariants as a final guard. When a bug slips through the upper layers, the database rejects the bad write instead of storing it.`,
            r`-- application passes a negative quantity through a bug; the database refuses
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (1, 7, -3, 10.00);

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'order_items_chk_1' is violated.`]
    ),

    'One-to-One Relationship': dv(
        [`One-to-one is a one-to-many with a rule: the foreign key column in the child is also unique (or is the child primary key). The unique index is what prevents a second child row for the same parent.`,
            r`CREATE TABLE users (id BIGINT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(100) NOT NULL);
CREATE TABLE user_profiles (user_id BIGINT PRIMARY KEY, bio VARCHAR(200), FOREIGN KEY (user_id) REFERENCES users(id));
INSERT INTO users (email) VALUES ('a@x.com');
INSERT INTO user_profiles VALUES (1, 'DBA');
INSERT INTO user_profiles VALUES (1, 'Second');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'user_profiles.PRIMARY'`],
        [`Two ways to model it: shared primary key (child PK = parent id) or a separate surrogate key plus a UNIQUE foreign key. Pick the shared key for pure extensions, the surrogate when the child could later have its own references.`,
            r`CREATE TABLE user_settings (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL UNIQUE, theme VARCHAR(10) DEFAULT 'light',
  FOREIGN KEY (user_id) REFERENCES users(id));
INSERT INTO user_settings (user_id) VALUES (1);
SELECT u.email, s.theme FROM users u LEFT JOIN user_settings s ON s.user_id = u.id;

-- OUTPUT:
-- email   | theme
-- a@x.com | light`],
        [`Mistakes: forgetting the UNIQUE (so it silently becomes one-to-many), creating the parent without the child and assuming it exists, and using INNER JOIN so parents without a child vanish from reports. Use LEFT JOIN when the child is optional.`,
            r`INSERT INTO users (email) VALUES ('b@x.com');       -- no profile yet
SELECT u.email, p.bio FROM users u JOIN user_profiles p ON p.user_id = u.id;          -- hides b@x.com
SELECT u.email, p.bio FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id;     -- shows both

-- OUTPUT:
-- first query : 1 row (a@x.com)
-- second query: 2 rows (b@x.com with NULL bio)`],
        [`Splitting a table helps when some columns are large or rarely used. The hot table stays narrow so more rows fit per page. Measure the effect with the catalog.`,
            r`SELECT table_name, avg_row_length FROM information_schema.tables WHERE table_name IN ('employees_wide','employees_core');

-- OUTPUT: (example)
-- table_name     | avg_row_length
-- employees_wide |           2240    (photo and resume inline)
-- employees_core |            120    (7 rows per page becomes 136)`],
        [`A real pattern: credentials in a separate table with stricter privileges. Reporting users can read the profile table but have no grant on the credentials table, so a leaked reporting account cannot expose password hashes.`,
            r`CREATE TABLE user_credentials (user_id BIGINT PRIMARY KEY, password_hash CHAR(60) NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id));
GRANT SELECT ON shop.users TO 'report'@'%';
GRANT SELECT ON shop.user_profiles TO 'report'@'%';
-- no grant on user_credentials for 'report'
SELECT * FROM user_credentials;     -- as report

-- OUTPUT:
-- ERROR 1142 (42000): SELECT command denied to user 'report'@'localhost' for table 'user_credentials'`]
    ),

    'One-to-Many Relationship': dv(
        [`In a one-to-many relationship the child table stores the parent key. When you join, MySQL typically scans the parent rows (after filters) and, for each, does an index lookup into the child by that foreign key, which is why the child foreign key must be indexed.`,
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT NOT NULL, total DECIMAL(8,2), KEY idx_customer (customer_id),
  FOREIGN KEY (customer_id) REFERENCES customers(id));
EXPLAIN SELECT c.name, o.total FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.id = 1;

-- OUTPUT: (example)
-- table | type  | key          | rows
-- c     | const | PRIMARY      |    1
-- o     | ref   | idx_customer |   12`],
        [`Query the relationship from either side: parent with child counts, children with parent details, parents with no children, and parents with more than N children.`,
            r`INSERT INTO customers VALUES (1,'Abaji'),(2,'Raoji'); INSERT INTO orders VALUES (10,1,500),(11,1,250);
SELECT c.name, COUNT(o.id) AS orders, COALESCE(SUM(o.total),0) AS spent FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name;
SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) > 1;

-- OUTPUT:
-- Abaji | 2 | 750.00      Raoji | 0 | 0.00
-- Raoji
-- 1`],
        [`Mistakes: joining and then summing parent columns (fan-out inflates totals), forgetting to index the foreign key when the constraint is not declared, and deleting a parent with a cascade that wipes millions of children in one transaction.`,
            r`-- parent amount repeated for each child row: wrong total
SELECT SUM(c.credit_limit) FROM customers c JOIN orders o ON o.customer_id = c.id;      -- counts Abaji twice

-- correct: aggregate the child first or use EXISTS
SELECT SUM(c.credit_limit) FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

-- OUTPUT:
-- first query double counts; second returns the true total`],
        [`For large one-to-many lists use a composite index that matches the filter and sort, so MySQL reads the page of orders in order without a sort.`,
            r`ALTER TABLE orders ADD INDEX idx_customer_created (customer_id, created_at);
EXPLAIN SELECT id, total FROM orders WHERE customer_id = 1 ORDER BY created_at DESC LIMIT 20;

-- OUTPUT: (example)
-- type | key                 | Extra
-- ref  | idx_customer_created| Backward index scan        (no filesort)`],
        [`Real life: an order history screen. Keyset pagination keeps page 500 as fast as page 1, and the composite index serves both the filter and the order.`,
            r`SELECT id, total, created_at FROM orders
WHERE customer_id = 1 AND (created_at, id) < ('2026-04-30 10:00:00', 9120)
ORDER BY created_at DESC, id DESC LIMIT 20;

-- OUTPUT:
-- id   | total  | created_at
-- 9118 | 450.00 | 2026-04-30 09:58:11`]
    ),

    'Many-to-Many Relationship': dv(
        [`A many-to-many relationship is stored as a junction table with two foreign keys. Its primary key (a_id, b_id) both prevents duplicate links and is the clustered index, so "all b for a given a" is a contiguous range scan.`,
            r`CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE courses (id INT PRIMARY KEY, title VARCHAR(30));
CREATE TABLE enrolments (student_id INT, course_id INT, enrolled_on DATE NOT NULL, PRIMARY KEY (student_id, course_id),
  KEY idx_course (course_id, student_id),
  FOREIGN KEY (student_id) REFERENCES students(id), FOREIGN KEY (course_id) REFERENCES courses(id));
SHOW INDEX FROM enrolments;

-- OUTPUT: (trimmed)
-- Key_name   | Seq_in_index | Column_name
-- PRIMARY    | 1            | student_id
-- PRIMARY    | 2            | course_id
-- idx_course | 1            | course_id`],
        [`Typical queries: courses of a student, students of a course, students in all of a set of courses, and students in none. The "all of" form uses GROUP BY with HAVING COUNT(DISTINCT).`,
            r`SELECT s.name FROM students s JOIN enrolments e ON e.student_id = s.id WHERE e.course_id IN (10, 11) GROUP BY s.id, s.name HAVING COUNT(DISTINCT e.course_id) = 2;   -- both courses
SELECT s.name FROM students s WHERE NOT EXISTS (SELECT 1 FROM enrolments e WHERE e.student_id = s.id);                                                  -- none

-- OUTPUT:
-- name
-- Abaji
-- Moropant`],
        [`Mistakes: storing comma-separated ids, omitting the reverse index, and putting relationship data (grade, role) in one of the two main tables. Comma-separated lists defeat joins, constraints and indexes.`,
            r`-- BAD
CREATE TABLE courses_bad (id INT PRIMARY KEY, title VARCHAR(30), student_ids VARCHAR(200));
SELECT * FROM courses_bad WHERE FIND_IN_SET('7', student_ids);     -- full scan, no foreign keys

-- GOOD
SELECT c.title FROM courses c JOIN enrolments e ON e.course_id = c.id WHERE e.student_id = 7;

-- OUTPUT:
-- the bad version cannot use an index; the good version uses the primary key prefix`],
        [`Junction tables become the biggest tables in a system. Keep keys compact, and verify that both lookup directions use an index only (covering) scan.`,
            r`EXPLAIN SELECT course_id FROM enrolments WHERE student_id = 7;
EXPLAIN SELECT student_id FROM enrolments WHERE course_id = 10;

-- OUTPUT: (example)
-- both: type=ref, Extra=Using index   (answered from the index without touching the table)`],
        [`A real feature: "recommended courses": students who took the same courses as you also took X. It is a self join of the junction table.`,
            r`SELECT e2.course_id, COUNT(*) AS peers
FROM enrolments e1 JOIN enrolments e2 ON e2.student_id = e1.student_id AND e2.course_id <> e1.course_id
WHERE e1.course_id = 10 AND e2.course_id NOT IN (SELECT course_id FROM enrolments WHERE student_id = 7)
GROUP BY e2.course_id ORDER BY peers DESC LIMIT 3;

-- OUTPUT: (example)
-- course_id | peers
-- 14        | 120
-- 11        |  95`]
    ),

    'Relational Database Concepts': dv(
        [`SQL operations map to relational algebra: WHERE is selection, the SELECT list is projection, JOIN is a join, UNION/EXCEPT are set operations, GROUP BY is aggregation. The optimizer exploits the algebra (for example pushing filters below joins) because the results are provably the same.`,
            r`-- selection + projection + join in one declarative statement
SELECT e.name, d.name AS dept
FROM emp e JOIN departments d ON d.id = e.dept       -- join
WHERE e.salary > 50000                                -- selection
;                                                     -- projection: only name, dept

EXPLAIN FORMAT=TREE SELECT e.name FROM emp e JOIN departments d ON d.id = e.dept WHERE e.salary > 50000;

-- OUTPUT: (example)
-- -> Nested loop inner join
--     -> Filter: (e.salary > 50000)   (the filter runs before the join: pushed down)`],
        [`The same question can often be written several ways: join, IN, EXISTS or set operations. They are equivalent in meaning but differ in clarity and sometimes in plan.`,
            r`SELECT name FROM emp WHERE dept IN (SELECT id FROM departments WHERE name = 'HR');
SELECT name FROM emp e WHERE EXISTS (SELECT 1 FROM departments d WHERE d.id = e.dept AND d.name = 'HR');
SELECT e.name FROM emp e JOIN departments d ON d.id = e.dept WHERE d.name = 'HR';

-- OUTPUT: (all three)
-- name
-- Abaji
-- Raoji`],
        [`Mistakes with NULL: it is not a value but "unknown", so comparisons give unknown. NOT IN with a NULL returns nothing, = NULL never matches, and aggregates skip NULLs. Use IS NULL, NOT EXISTS and COALESCE.`,
            r`SELECT NULL = NULL AS eq, NULL IS NULL AS is_null, 5 NOT IN (1, NULL) AS not_in, COALESCE(NULL, 0) AS fixed;

-- OUTPUT:
-- eq   | is_null | not_in | fixed
-- NULL |       1 | NULL   |     0`],
        [`Because SQL is declarative, you can improve performance by changing physical design (indexes, statistics) without touching the query. Compare the plan before and after.`,
            r`EXPLAIN SELECT * FROM emp WHERE dept = 10 AND salary > 50000;
CREATE INDEX idx_dept_salary ON emp (dept, salary);
EXPLAIN SELECT * FROM emp WHERE dept = 10 AND salary > 50000;

-- OUTPUT: (example)
-- before: type=ALL   rows=500000
-- after : type=range key=idx_dept_salary rows=1200      (same SQL, much faster)`],
        [`Relational thinking solves reporting problems cleanly. A department salary summary with the percentage of company payroll is a grouped aggregate plus a window function over the result.`,
            r`SELECT d.name, SUM(e.salary) AS payroll, ROUND(SUM(e.salary) / SUM(SUM(e.salary)) OVER () * 100, 1) AS pct_of_company
FROM emp e JOIN departments d ON d.id = e.dept GROUP BY d.id, d.name ORDER BY payroll DESC;

-- OUTPUT:
-- name | payroll | pct_of_company
-- IT   |  700000 | 57.4
-- HR   |  520000 | 42.6`]
    ),

    'SQL vs MySQL': dv(
        [`SQL is a standard language; each database implements the standard plus extensions. MySQL parses your SQL text with its own grammar, so statements valid in PostgreSQL or Oracle may fail, and MySQL-only syntax (AUTO_INCREMENT, backticks, LIMIT) may not run elsewhere.`,
            r`-- MySQL-specific vs portable equivalents
SELECT IFNULL(NULL, 'x') AS mysql_only, COALESCE(NULL, 'x') AS portable;
SELECT id FROM emp ORDER BY id LIMIT 2;                          -- MySQL / PostgreSQL
-- SELECT id FROM emp ORDER BY id FETCH FIRST 2 ROWS ONLY;       -- standard SQL (supported by Oracle, PostgreSQL)

-- OUTPUT:
-- mysql_only | portable
-- x          | x`],
        [`The statement families are DDL (structure), DML (data change), DQL (queries), DCL (permissions) and TCL (transactions). Learn them as a map: every statement you write belongs to one family and behaves accordingly (for example DDL auto-commits in MySQL).`,
            r`CREATE TABLE demo (id INT PRIMARY KEY);          -- DDL (auto-commits)
INSERT INTO demo VALUES (1);                      -- DML
SELECT * FROM demo;                               -- DQL
GRANT SELECT ON shop.demo TO 'report'@'%';        -- DCL
START TRANSACTION; DELETE FROM demo; ROLLBACK;    -- TCL

-- OUTPUT:
-- id
-- 1`],
        [`Mistakes: writing code that only works in one dialect without knowing, ignoring sql_mode (so bad data is silently accepted), and using double quotes for strings (valid in MySQL by default, an identifier quote in standard SQL).`,
            r`SELECT 'text' AS single_quoted;                  -- portable string literal
SET SESSION sql_mode = CONCAT(@@sql_mode, ',ANSI_QUOTES');
SELECT "text" AS now_an_identifier;                -- fails: "text" is treated as a column name

-- OUTPUT:
-- single_quoted
-- text
-- ERROR 1054 (42S22): Unknown column 'text' in 'field list'`],
        [`Strict mode is a performance and correctness feature: it turns silent truncation into errors so bad data never enters. Check it and keep it on in every environment.`,
            r`SELECT @@sql_mode LIKE '%STRICT_TRANS_TABLES%' AS strict_on;
CREATE TABLE s (c VARCHAR(3));
INSERT INTO s VALUES ('abcdef');

-- OUTPUT:
-- strict_on
-- 1
-- ERROR 1406 (22001): Data too long for column 'c' at row 1     (without strict mode: silently stored as 'abc')`],
        [`In a real migration project you list dialect differences first. A small compatibility table drives the rewrite and the tests.`,
            r`SELECT 'LIMIT n' AS mysql, 'FETCH FIRST n ROWS ONLY' AS standard
UNION ALL SELECT 'IFNULL(a,b)', 'COALESCE(a,b)'
UNION ALL SELECT 'AUTO_INCREMENT', 'GENERATED ... AS IDENTITY'
UNION ALL SELECT 'NOW()', 'CURRENT_TIMESTAMP';

-- OUTPUT:
-- mysql          | standard
-- LIMIT n        | FETCH FIRST n ROWS ONLY
-- IFNULL(a,b)    | COALESCE(a,b)
-- AUTO_INCREMENT | GENERATED ... AS IDENTITY
-- NOW()          | CURRENT_TIMESTAMP`]
    )
};
