// Module 1 (Database Fundamentals) extras.
import { x, r, type Extra } from './extra';

export const e01: Record<string, Extra> = {
    'What is a Database?': x(
        ['A database is an organised collection of data stored so that it can be searched, updated and kept consistent by many users at once.',
            'Files (CSV, Excel) cannot safely handle concurrent writers, fast lookups or rules like "email must be unique". A database can.',
            'Common kinds: relational (MySQL, PostgreSQL), document (MongoDB), key-value (Redis), graph (Neo4j). MySQL is relational.'],
        ['Think in terms of the workload: OLTP (many small reads/writes, MySQL) versus OLAP (few huge scans, a warehouse).',
            'Durability comes from the write-ahead log and fsync settings, not from "saving a file"; know what <code>innodb_flush_log_at_trx_commit</code> trades.',
            'Data lives in a data directory, but applications must only touch it through the server, never by copying files while it runs.'],
        ['Pick the database from access patterns, consistency needs and scale, not fashion; polyglot persistence is normal (MySQL + Redis + search).',
            'The database is usually the hardest tier to scale horizontally, so schema and query discipline early is cheaper than sharding later.',
            'Treat the schema as a public contract: other services, reports and ETL jobs depend on it.'],
        [['F', 'What is a database?', 'An organised, persistent collection of data managed by software that supports querying, concurrent access and integrity rules.'],
            ['F', 'Why not store data in text files?', 'Files have no concurrency control, indexing, constraints or transactions, so they become slow and inconsistent as data and users grow.'],
            ['M', 'What is the difference between OLTP and OLAP?', 'OLTP serves many short transactions (orders, logins); OLAP runs long analytical scans and aggregates. MySQL is mainly OLTP; analytics usually goes to a warehouse or replica.'],
            ['M', 'What does "durable" mean for a database?', 'Once a commit is acknowledged the data survives a crash. InnoDB achieves it with the redo log flushed to disk at commit.'],
            ['S', 'How would you choose between MySQL and a NoSQL store?', 'List the entities, relationships, query shapes, consistency and scale. Relational data with joins and transactions fits MySQL; massive key lookups, flexible documents or graph traversals may justify a specialised store.'],
            ['S', 'Why is the database often the bottleneck?', 'It holds shared mutable state, so it cannot be cloned freely like stateless app servers. Scaling needs replicas, caching, partitioning or sharding, each with consistency trade-offs.']],
        [['Create a database <code>school</code>, a table <code>students(id, name)</code>, insert two rows and read them back.',
            r`CREATE DATABASE IF NOT EXISTS school;
USE school;
CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(40));
INSERT INTO students VALUES (1,'Abaji'),(2,'Raoji');
SELECT * FROM students;

-- OUTPUT:
-- id | name
--  1 | Abaji
--  2 | Raoji`],
            ['List all databases on the server and show which one is currently selected.',
                r`SHOW DATABASES;
SELECT DATABASE();

-- OUTPUT: (example)
-- Database
-- information_schema
-- mysql
-- performance_schema
-- school
-- sys
-- DATABASE()
-- school`]],
        [['A database holds many tables; the server holds many databases. Inspect that hierarchy.',
            r`SELECT table_schema, COUNT(*) AS tables_count
FROM   information_schema.tables
WHERE  table_schema = 'school'
GROUP  BY table_schema;

-- OUTPUT:
-- table_schema | tables_count
-- school       |            1`],
            ['Data survives a reconnect because it is stored by the server, not the session.',
                r`-- session 1
INSERT INTO school.students VALUES (3,'Moropant');
-- exit, reconnect (session 2)
SELECT COUNT(*) FROM school.students;

-- OUTPUT:
-- COUNT(*)
-- 3`]]
    ),

    'DBMS vs RDBMS': x(
        ['A DBMS is software that manages data; an RDBMS is a DBMS that stores data in related tables and uses SQL.',
            'RDBMS adds rows and columns, keys, relationships and constraints. MySQL, PostgreSQL, Oracle and SQL Server are RDBMS.',
            'Classic interview line: all RDBMS are DBMS, not all DBMS are RDBMS (for example MongoDB or a file-based system).'],
        ['An RDBMS enforces integrity through primary keys, foreign keys and constraints; a plain DBMS often leaves this to the application.',
            'RDBMS supports ACID transactions and a declarative query language, so you describe what you want, not how to fetch it.',
            'Not every RDBMS feature is equal: MySQL engines differ (InnoDB has transactions and foreign keys, MyISAM does not).'],
        ['Relational does not mean slow or old: the optimizer, indexes and joins let one declarative query replace pages of procedural code.',
            'The relational model gives data independence: you can change storage and indexes without changing queries.',
            'Pick non-relational only when the relational constraint becomes the actual problem (schema agility, scale-out writes, graph traversal).'],
        [['F', 'Difference between DBMS and RDBMS?', 'DBMS manages data in any structure (files, hierarchies). RDBMS stores data in tables with relationships, supports SQL, keys and ACID.'],
            ['F', 'Name three RDBMS products.', 'MySQL, PostgreSQL, Oracle (also SQL Server, MariaDB).'],
            ['M', 'Is every table in an RDBMS guaranteed to have relationships?', 'No. The model supports relationships, but a table can stand alone. Relationships exist where foreign keys or logical references are defined.'],
            ['M', 'Which MySQL storage engine gives you full RDBMS behaviour?', 'InnoDB: transactions, row locks, foreign keys, crash recovery. MyISAM lacks them.'],
            ['S', 'What does "declarative" mean in SQL and why does it matter?', 'You state the result, the optimizer chooses the plan. This lets the engine change plans as data grows without code changes.'],
            ['S', 'When is a relational model a poor fit?', 'Highly nested variable documents, huge write-heavy key-value traffic, or deep graph traversals; there a document, key-value or graph store may be simpler or cheaper.']],
        [['Show that InnoDB enforces a foreign key (an RDBMS feature).',
            r`CREATE TABLE dept (id INT PRIMARY KEY, name VARCHAR(20)) ENGINE=InnoDB;
CREATE TABLE emp  (id INT PRIMARY KEY, dept_id INT, FOREIGN KEY (dept_id) REFERENCES dept(id)) ENGINE=InnoDB;
INSERT INTO emp VALUES (1, 99);

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails`],
            ['Check the storage engine of a table.',
                r`SELECT table_name, engine FROM information_schema.tables WHERE table_schema = DATABASE();

-- OUTPUT: (example)
-- table_name | engine
-- dept       | InnoDB
-- emp        | InnoDB`]],
        [['Relational data lives in separate related tables joined by keys.',
            r`INSERT INTO dept VALUES (1,'HR');
INSERT INTO emp  VALUES (1,1);
SELECT e.id, d.name FROM emp e JOIN dept d ON d.id = e.dept_id;

-- OUTPUT:
-- id | name
--  1 | HR`],
            ['ACID transaction: either both inserts happen or neither.',
                r`START TRANSACTION;
INSERT INTO dept VALUES (2,'IT');
INSERT INTO emp  VALUES (2,2);
ROLLBACK;
SELECT COUNT(*) FROM dept WHERE id = 2;

-- OUTPUT:
-- COUNT(*)
-- 0`]]
    ),

    'What is MySQL?': x(
        ['MySQL is a free, open-source relational database server that stores data in tables and is queried with SQL.',
            'It follows a client-server model: your app or the <code>mysql</code> CLI connects to the server over TCP (port 3306 by default).',
            'It is owned by Oracle; MariaDB is a community fork. Both speak almost the same SQL.'],
        ['Know the main pieces: server (<code>mysqld</code>), client tools, storage engines (InnoDB by default), data directory, config file (<code>my.cnf</code> / <code>my.ini</code>).',
            'Check the version first: features like window functions, CTEs and <code>EXPLAIN ANALYZE</code> need 8.0+.',
            'Use <code>utf8mb4</code> and a sensible collation; plain <code>utf8</code> in MySQL is only 3 bytes and breaks emoji.'],
        ['MySQL is strongest as a transactional OLTP store with read replicas; know its limits (single-writer primary, replication lag, schema-change cost on big tables).',
            'Managed offerings (RDS, Cloud SQL, Aurora) change operations but not SQL semantics; verify version and parameter differences.',
            'Plan upgrades (5.7 to 8.0) with query-plan and collation regression tests; defaults changed (auth plugin, charset).'],
        [['F', 'What is MySQL?', 'An open-source relational database management system that uses SQL, owned by Oracle.'],
            ['F', 'What is the default port of MySQL?', '3306.'],
            ['M', 'What is the default storage engine and why?', 'InnoDB: ACID transactions, row-level locking, foreign keys and crash recovery.'],
            ['M', 'What is the difference between utf8 and utf8mb4 in MySQL?', 'MySQL utf8 stores up to 3 bytes per character and cannot store 4-byte characters such as emoji; utf8mb4 is real UTF-8.'],
            ['S', 'How does MySQL differ from PostgreSQL in practice?', 'MySQL is simpler to run and very strong for OLTP with replicas; PostgreSQL offers richer SQL, extensions and stricter standards. Choose on feature needs and team skills.'],
            ['S', 'What are common MySQL production risks?', 'Replication lag, long transactions, unindexed queries, online schema changes on big tables, and single-primary write limits.']],
        [['Print the server version and current user.',
            r`SELECT VERSION(), CURRENT_USER();

-- OUTPUT: (example)
-- VERSION() | CURRENT_USER()
-- 8.0.36    | root@localhost`],
            ['Show the default storage engine and character set.',
                r`SHOW VARIABLES WHERE Variable_name IN ('default_storage_engine','character_set_server');

-- OUTPUT: (example)
-- Variable_name        | Value
-- character_set_server | utf8mb4
-- default_storage_engine | InnoDB`]],
        [['Confirm a database can store emoji only with utf8mb4.',
            r`CREATE TABLE notes (t VARCHAR(20)) CHARACTER SET utf8mb4;
INSERT INTO notes VALUES ('ok 😀');
SELECT t, CHAR_LENGTH(t) AS chars, LENGTH(t) AS bytes FROM notes;

-- OUTPUT:
-- t     | chars | bytes
-- ok 😀 |     4 |     7`],
            ['Peek at what the server is running right now.',
                r`SHOW PROCESSLIST;

-- OUTPUT: (example)
-- Id | User | Host            | db     | Command | Time | State    | Info
--  5 | root | localhost:51234 | school | Query   |    0 | executing| SHOW PROCESSLIST`]]
    ),

    'Database, Table, Row & Column': x(
        ['A server holds databases; a database holds tables; a table holds rows (records) and columns (fields).',
            'Each column has a name and a data type; each row is one item, such as one student.',
            'Use <code>DESCRIBE table</code> to see columns and <code>SELECT * FROM table</code> to see rows.'],
        ['Choose column types carefully: they decide storage, range, indexing speed and correctness (INT vs BIGINT, DECIMAL for money).',
            'Row order is not guaranteed without <code>ORDER BY</code>; never rely on insertion order.',
            'A table without a primary key is a smell: replication, ORMs and tools all behave better with one.'],
        ['Wide tables with many nullable columns hint at a missing entity; split or use a subtype table.',
            'Row size affects how many rows fit per 16 KB InnoDB page, so narrow rows mean fewer page reads and better cache use.',
            'Name things consistently (snake_case, singular or plural by convention); renames later are expensive across services.'],
        [['F', 'What is a row and a column?', 'A row is one record (a horizontal line); a column is one attribute with a data type (a vertical field).'],
            ['F', 'What is the difference between a database and a table?', 'A database is a container of tables and other objects; a table stores the actual rows.'],
            ['M', 'Is the order of rows in a table defined?', 'No. Without ORDER BY the engine may return rows in any order; InnoDB often returns primary-key order but that is not a guarantee.'],
            ['M', 'How do you list columns of a table?', '<code>DESCRIBE t</code>, <code>SHOW COLUMNS FROM t</code> or query <code>information_schema.columns</code>.'],
            ['S', 'Why does row width matter?', 'InnoDB reads 16 KB pages. Narrower rows mean more rows per page, fewer I/Os and better buffer-pool hit rates.'],
            ['S', 'When would you split one wide table into two?', 'When some columns are large or rarely used (blobs, audit data) or have different access patterns or permissions; a one-to-one table keeps the hot table small.']],
        [['Create <code>products(id, name, price)</code>, insert 3 rows and count the columns using DESCRIBE.',
            r`CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(30), price DECIMAL(8,2));
INSERT INTO products VALUES (1,'Pen',10.00),(2,'Book',150.50),(3,'Bag',799.00);
DESCRIBE products;

-- OUTPUT:
-- Field | Type         | Null | Key | Default | Extra
-- id    | int          | NO   | PRI | NULL    |
-- name  | varchar(30)  | YES  |     | NULL    |
-- price | decimal(8,2) | YES  |     | NULL    |`],
            ['Select only two columns and only the rows that cost more than 100.',
                r`SELECT name, price FROM products WHERE price > 100;

-- OUTPUT:
-- name | price
-- Book | 150.50
-- Bag  | 799.00`]],
        [['Read table structure from the catalog.',
            r`SELECT column_name, data_type, is_nullable
FROM   information_schema.columns
WHERE  table_schema = DATABASE() AND table_name = 'products'
ORDER  BY ordinal_position;

-- OUTPUT:
-- column_name | data_type | is_nullable
-- id          | int       | NO
-- name        | varchar   | YES
-- price       | decimal   | YES`],
            ['Row count versus column count.',
                r`SELECT COUNT(*) AS row_count FROM products;
SELECT COUNT(*) AS col_count FROM information_schema.columns WHERE table_name='products' AND table_schema=DATABASE();

-- OUTPUT:
-- row_count
-- 3
-- col_count
-- 3`]]
    ),

    'Schema': x(
        ['In MySQL a schema is the same as a database: a named collection of tables, views and routines.',
            '"Schema" also describes the design of tables (columns, types, keys), as in "the schema of the orders table".',
            '<code>CREATE SCHEMA shop</code> and <code>CREATE DATABASE shop</code> do exactly the same thing.'],
        ['Unlike PostgreSQL or SQL Server, MySQL has no separate schema level inside a database; you use multiple databases instead.',
            'Qualify names (<code>shop.orders</code>) in scripts that touch more than one database to avoid running against the wrong one.',
            'Keep DDL in version control and apply it with a migration tool so every environment has the same schema.'],
        ['Cross-database joins work inside one server, but they couple services; microservices should own separate schemas and not share tables.',
            'Schema changes on large tables are operations, not edits: plan online DDL, expand/contract and rollbacks.',
            'Use <code>information_schema</code> and schema-diff checks in CI to catch drift between environments.'],
        [['F', 'What is a schema in MySQL?', 'A synonym for a database; also the structural definition of tables and columns.'],
            ['F', 'Command to see all schemas?', '<code>SHOW DATABASES;</code> or <code>SHOW SCHEMAS;</code>.'],
            ['M', 'How does MySQL schema differ from PostgreSQL schema?', 'In PostgreSQL a schema is a namespace inside a database. In MySQL schema equals database, so there is no extra level.'],
            ['M', 'How do you query a table in another schema?', 'Prefix with the schema name: <code>SELECT * FROM other_db.table_name;</code> provided you have privileges.'],
            ['S', 'How do you manage schema across environments?', 'Versioned migrations (Flyway/Liquibase), review in pull requests, apply in CI/CD, and validate drift against production.'],
            ['S', 'Should services share one schema?', 'Generally no. Shared tables create hidden coupling and block independent releases; use APIs or events, or at least separate schemas with ownership.']],
        [['Create a schema, switch to it and confirm it is empty.',
            r`CREATE SCHEMA IF NOT EXISTS hr;
USE hr;
SHOW TABLES;

-- OUTPUT:
-- Empty set (0.00 sec)`],
            ['Query a table using the fully qualified name without USE.',
                r`SELECT * FROM school.students LIMIT 1;

-- OUTPUT:
-- id | name
--  1 | Abaji`]],
        [['The schema as a catalog: list every schema with its table count.',
            r`SELECT table_schema, COUNT(*) AS tables
FROM   information_schema.tables
WHERE  table_schema NOT IN ('mysql','sys','information_schema','performance_schema')
GROUP  BY table_schema;

-- OUTPUT: (example)
-- table_schema | tables
-- hr           |      0
-- school       |      1`],
            ['Show the DDL that defines a table.',
                r`SHOW CREATE TABLE school.students\G

-- OUTPUT: (example)
-- Table: students
-- Create Table: CREATE TABLE students (
--   id int NOT NULL,
--   name varchar(40) DEFAULT NULL,
--   PRIMARY KEY (id)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`]]
    ),

    'Primary Key & Foreign Key Basics': x(
        ['A primary key (PK) uniquely identifies each row: no duplicates, no NULL. A foreign key (FK) points to a PK in another table.',
            'A table has one primary key but can have many foreign keys.',
            'FK values must exist in the parent table, so you cannot create an order for a customer that does not exist.'],
        ['Prefer a short, stable, meaningless PK (<code>BIGINT AUTO_INCREMENT</code>) over natural values like email that can change.',
            'InnoDB stores the table in primary-key order (clustered), and every secondary index carries the PK, so a fat PK bloats all indexes.',
            'Index the FK column in the child; MySQL does this automatically for FKs, but not for logical references without a constraint.'],
        ['UUID primary keys cause random inserts and page splits; use ordered IDs (UUIDv7, ULID, or auto-increment plus public id).',
            'FKs add locking and write cost; some very high-scale systems drop them and enforce integrity in code, accepting the risk.',
            'Choose ON DELETE behaviour deliberately (RESTRICT, CASCADE, SET NULL); accidental cascades delete data silently.'],
        [['F', 'What is a primary key?', 'A column (or set) that uniquely identifies each row and cannot be NULL.'],
            ['F', 'What is a foreign key?', 'A column that references the primary key of another table to enforce a relationship.'],
            ['M', 'Can a table have two primary keys?', 'No, only one, but it can be composite (several columns). Other unique needs use UNIQUE keys.'],
            ['M', 'What happens if you delete a parent row that has children?', 'By default (RESTRICT/NO ACTION) the delete fails. With ON DELETE CASCADE the children are deleted; with SET NULL their FK becomes NULL.'],
            ['S', 'Why is the primary key choice important in InnoDB?', 'The table is a clustered B-tree on the PK, and every secondary index stores the PK. A big or random PK slows inserts and enlarges all indexes.'],
            ['S', 'Should you use foreign keys at massive scale?', 'They guarantee integrity but add lock and write overhead and complicate sharding and online schema change. Many large systems drop them and use application checks and reconciliation jobs.']],
        [['Create <code>customers</code> and <code>orders</code> with a PK and FK and try to insert an order for a missing customer.',
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT, FOREIGN KEY (customer_id) REFERENCES customers(id));
INSERT INTO orders VALUES (1, 5);

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails`],
            ['Insert a duplicate primary key and read the error.',
                r`INSERT INTO customers VALUES (1,'Abaji');
INSERT INTO customers VALUES (1,'Raoji');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'customers.PRIMARY'`]],
        [['Valid parent then child; join them.',
            r`INSERT INTO orders VALUES (10, 1);
SELECT o.id AS order_id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id;

-- OUTPUT:
-- order_id | name
--       10 | Abaji`],
            ['See the restrict rule in action when deleting the parent.',
                r`DELETE FROM customers WHERE id = 1;

-- OUTPUT:
-- ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails`]]
    ),

    'Candidate, Composite & Unique Keys': x(
        ['A candidate key is any column set that could uniquely identify a row; one is chosen as the primary key, the others are alternates.',
            'A composite key uses two or more columns together, such as (student_id, course_id).',
            'A unique key forbids duplicates but, unlike a primary key, allows NULLs and a table can have many.'],
        ['In MySQL a UNIQUE index allows multiple NULLs, because NULL is not equal to NULL.',
            'Composite keys are ideal for junction tables, and column order matters for index use (leftmost prefix).',
            'Natural candidate keys (email, national id) are good UNIQUE constraints even when a surrogate PK is used.'],
        ['Composite primary keys are copied into every secondary index and every child FK; for deep hierarchies, a single surrogate key is lighter.',
            'Unique constraints on soft-deleted rows need care: add a deleted-at or active flag into the unique key, or use generated columns.',
            'Case-insensitive collations make "A@x.com" and "a@x.com" collide on UNIQUE, which is usually desired for email.'],
        [['F', 'What is a candidate key?', 'Any minimal set of columns that uniquely identifies rows. One becomes the primary key.'],
            ['F', 'Difference between primary and unique key?', 'PK: one per table, no NULL. Unique: many per table, NULLs allowed (multiple in MySQL).'],
            ['M', 'What is a composite key and when do you use it?', 'A key of several columns, used when no single column is unique, such as the pair in a many-to-many link table.'],
            ['M', 'Does UNIQUE allow multiple NULLs in MySQL?', 'Yes. Each NULL is treated as distinct.'],
            ['S', 'How do you make email unique only among non-deleted users?', 'Use a generated column such as <code>active_email = IF(deleted_at IS NULL, email, NULL)</code> with a UNIQUE index on it, so deleted rows yield NULL and never collide.'],
            ['S', 'Composite PK or surrogate PK for a junction table?', 'The composite (a_id, b_id) is natural, compact and prevents duplicates. Add a surrogate only if other tables must reference the link row itself.']],
        [['Create <code>enrollments</code> with a composite primary key (student_id, course_id) and insert the same pair twice.',
            r`CREATE TABLE enrollments (student_id INT, course_id INT, PRIMARY KEY (student_id, course_id));
INSERT INTO enrollments VALUES (1,10);
INSERT INTO enrollments VALUES (1,10);

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-10' for key 'enrollments.PRIMARY'`],
            ['Add a UNIQUE key on email and insert two NULL emails.',
                r`CREATE TABLE members (id INT PRIMARY KEY, email VARCHAR(80) UNIQUE);
INSERT INTO members VALUES (1,NULL),(2,NULL);
SELECT * FROM members;

-- OUTPUT:
-- id | email
--  1 | NULL
--  2 | NULL`]],
        [['The same student may enrol in different courses; same course by different students is also fine.',
            r`INSERT INTO enrollments VALUES (1,11),(2,10);
SELECT * FROM enrollments ORDER BY student_id, course_id;

-- OUTPUT:
-- student_id | course_id
--          1 |        10
--          1 |        11
--          2 |        10`],
            ['Inspect keys on a table.',
                r`SHOW INDEX FROM members;

-- OUTPUT: (example, trimmed)
-- Key_name | Column_name | Non_unique
-- PRIMARY  | id          | 0
-- email    | email       | 0`]]
    ),

    'Constraints Overview': x(
        ['Constraints are rules the database enforces on data: PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT and CHECK.',
            'They protect data quality at the lowest level, no matter which application writes.',
            'A violated constraint makes the statement fail with an error, so no bad row is stored.'],
        ['CHECK constraints are enforced from MySQL 8.0.16; in older versions they were parsed and ignored.',
            'Name constraints explicitly (<code>CONSTRAINT chk_age CHECK (age &gt;= 18)</code>) so error messages and migrations are clear.',
            'Enforce rules in both app and DB: the app gives friendly messages, the DB is the last line of defence.'],
        ['Constraints are cheap compared with the cost of cleaning corrupt data; add them at design time because adding later requires validating all rows.',
            'Adding a constraint to a big table can block or rebuild it; backfill and validate in steps.',
            'Business rules that span rows or tables (balance cannot go negative across accounts) still need transactions, locks or triggers.'],
        [['F', 'Name the constraints in MySQL.', 'PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT and CHECK.'],
            ['F', 'What happens when a constraint is violated?', 'The statement fails with an error and the data is not changed.'],
            ['M', 'Does MySQL enforce CHECK constraints?', 'Yes from 8.0.16. Earlier versions accepted the syntax but ignored it.'],
            ['M', 'What does NOT NULL do compared to DEFAULT?', 'NOT NULL forbids missing values; DEFAULT supplies a value when none is given. Together they guarantee a value.'],
            ['S', 'How do you add a constraint to a large live table safely?', 'Clean existing data first, add it in a low-traffic window or with online DDL, and for FKs make sure the child column is indexed to avoid long locks.'],
            ['S', 'Where should business rules live, DB or app?', 'Both: simple invariants (not null, unique, range, FK) in the DB; workflow and cross-entity rules in the service layer protected by transactions.']],
        [['Create <code>accounts</code> with NOT NULL, DEFAULT and CHECK and attempt a bad insert.',
            r`CREATE TABLE accounts (
  id INT PRIMARY KEY,
  owner VARCHAR(30) NOT NULL,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT chk_balance CHECK (balance >= 0)
);
INSERT INTO accounts (id, owner, balance) VALUES (1,'Abaji',-5);

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'chk_balance' is violated.`],
            ['Insert a row using the default balance.',
                r`INSERT INTO accounts (id, owner) VALUES (2,'Raoji');
SELECT id, balance FROM accounts WHERE id = 2;

-- OUTPUT:
-- id | balance
--  2 |    0.00`]],
        [['List constraints on a table from the catalog.',
            r`SELECT constraint_name, constraint_type
FROM   information_schema.table_constraints
WHERE  table_schema = DATABASE() AND table_name = 'accounts';

-- OUTPUT:
-- constraint_name | constraint_type
-- PRIMARY         | PRIMARY KEY
-- chk_balance     | CHECK`],
            ['NOT NULL blocks a missing owner.',
                r`INSERT INTO accounts (id, owner) VALUES (3, NULL);

-- OUTPUT:
-- ERROR 1048 (23000): Column 'owner' cannot be null`]]
    ),

    'One-to-One Relationship': x(
        ['In a one-to-one relationship one row in table A relates to at most one row in table B (user and profile).',
            'Implement it with a foreign key that is also UNIQUE (or the child primary key equals the parent id).',
            'Often used to split rarely used or sensitive columns out of a main table.'],
        ['The child can be optional (0..1) or required; the database cannot force that the child row exists, only that there is at most one.',
            'Read both sides with a JOIN; use LEFT JOIN when the child may be missing.',
            'If both tables are always loaded together, consider merging them to remove the join.'],
        ['One-to-one splits are a tool for hot/cold column separation, security separation and subtype tables (class-table inheritance).',
            'Shared primary keys make joins and ORMs (JPA @MapsId) simple and cheap.',
            'Do not use one-to-one to hide a design that really is one-to-many; confirm the business rule first.'],
        [['F', 'Give an example of one-to-one.', 'A user and a passport, or user and profile: each user has at most one profile and each profile belongs to one user.'],
            ['F', 'How is it implemented?', 'Foreign key in the child referencing the parent, with UNIQUE (or PK = FK) so only one child row can exist per parent.'],
            ['M', 'Why not just put everything in one table?', 'For performance (hot vs cold columns), security (separate privileges) or to model optional extra data without many NULL columns.'],
            ['M', 'How do you get parents without a child?', '<code>LEFT JOIN child ON ... WHERE child.parent_id IS NULL</code>.'],
            ['S', 'How can you enforce that every parent has a child?', 'Not with plain constraints; use a transaction that inserts both, a trigger, or merge the tables. Circular NOT NULL FKs are not possible without deferred constraints.'],
            ['S', 'Primary-key sharing versus a separate surrogate id?', 'Shared PK is compact and guarantees 1:1 structurally. A separate id plus UNIQUE FK is flexible if the child may later become one-to-many.']],
        [['Create <code>persons</code> and <code>passports</code> as one-to-one and try to add two passports for one person.',
            r`CREATE TABLE persons (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE passports (person_id INT PRIMARY KEY, number VARCHAR(15), FOREIGN KEY (person_id) REFERENCES persons(id));
INSERT INTO persons VALUES (1,'Abaji');
INSERT INTO passports VALUES (1,'P123'),(1,'P999');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'passports.PRIMARY'`],
            ['List persons without a passport.',
                r`INSERT INTO persons VALUES (2,'Raoji');
INSERT INTO passports VALUES (1,'P123');
SELECT p.name FROM persons p LEFT JOIN passports pp ON pp.person_id = p.id WHERE pp.person_id IS NULL;

-- OUTPUT:
-- name
-- Raoji`]],
        [['Read both halves with a join.',
            r`SELECT p.name, pp.number FROM persons p JOIN passports pp ON pp.person_id = p.id;

-- OUTPUT:
-- name  | number
-- Abaji | P123`],
            ['UNIQUE foreign key alternative with its own id.',
                r`CREATE TABLE licenses (id INT PRIMARY KEY AUTO_INCREMENT, person_id INT UNIQUE NOT NULL, no VARCHAR(15),
  FOREIGN KEY (person_id) REFERENCES persons(id));
INSERT INTO licenses (person_id, no) VALUES (1,'L55');
INSERT INTO licenses (person_id, no) VALUES (1,'L56');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'licenses.person_id'`]]
    ),

    'One-to-Many Relationship': x(
        ['One row in the parent relates to many rows in the child: one customer has many orders.',
            'The "many" side holds the foreign key (<code>orders.customer_id</code>).',
            'This is the most common relationship in databases.'],
        ['Always index the foreign key column in the child, so joins and parent lookups are fast.',
            'Use <code>GROUP BY parent_id</code> with <code>COUNT</code> to see how many children each parent has, and LEFT JOIN to include parents with none.',
            'Decide the delete rule: RESTRICT (safe), CASCADE (owned children), SET NULL (optional link).'],
        ['Very large children per parent (millions of events per device) call for composite indexes (parent_id, created_at) and possibly partitioning.',
            'Pagination on the child list should be keyset on (parent_id, id), not OFFSET.',
            'ORMs make one-to-many easy but also make N+1 easy; load children in batches.'],
        [['F', 'Give an example of one-to-many.', 'One customer places many orders; each order belongs to one customer.'],
            ['F', 'Which table holds the foreign key?', 'The "many" side (child table).'],
            ['M', 'How do you count orders per customer including those with none?', '<code>customers LEFT JOIN orders ... GROUP BY customers.id</code> with <code>COUNT(orders.id)</code>.'],
            ['M', 'What does ON DELETE CASCADE do?', 'Deleting a parent row automatically deletes its child rows.'],
            ['S', 'How do you keep a one-to-many list fast at scale?', 'Index (parent_id, sort_col), use keyset pagination, cap page size, and archive or partition old children.'],
            ['S', 'Is cascade delete safe in production?', 'It can remove huge amounts of data in one transaction, locking and bloating the undo log. Prefer soft delete or batched deletes for big graphs.']],
        [['Create customers and orders, insert one customer with two orders and list orders per customer.',
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT NOT NULL, total DECIMAL(8,2),
  FOREIGN KEY (customer_id) REFERENCES customers(id));
INSERT INTO customers VALUES (1,'Abaji'),(2,'Raoji');
INSERT INTO orders VALUES (10,1,500),(11,1,250);
SELECT c.name, COUNT(o.id) AS orders FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name;

-- OUTPUT:
-- name  | orders
-- Abaji | 2
-- Raoji | 0`],
            ['Find customers who have more than one order.',
                r`SELECT customer_id FROM orders GROUP BY customer_id HAVING COUNT(*) > 1;

-- OUTPUT:
-- customer_id
-- 1`]],
        [['Sum per parent.',
            r`SELECT c.name, SUM(o.total) AS spent FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id, c.name;

-- OUTPUT:
-- name  | spent
-- Abaji | 750.00`],
            ['ON DELETE CASCADE removes children with the parent.',
                r`ALTER TABLE orders DROP FOREIGN KEY orders_ibfk_1;
ALTER TABLE orders ADD FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
DELETE FROM customers WHERE id = 1;
SELECT COUNT(*) FROM orders;

-- OUTPUT:
-- COUNT(*)
-- 0`]]
    ),

    'Many-to-Many Relationship': x(
        ['Many rows in A relate to many rows in B: students and courses.',
            'Relational databases cannot store this directly; you add a third table (junction, bridge or link table) holding both ids.',
            'The junction table normally has a composite primary key made of the two foreign keys.'],
        ['Extra data about the relationship (enrolled_on, grade) belongs in the junction table.',
            'Index both directions: the composite PK covers (a_id, b_id); add an index on (b_id, a_id) for the reverse lookup.',
            'Querying needs two joins: A to link to B.'],
        ['If the link table grows its own behaviour (an order line between order and product) model it as a real entity with its own id.',
            'Large junction tables dominate storage; keep the key columns small and consider partitioning.',
            'Avoid storing comma-separated ids in a column; it breaks joins, constraints and indexing.'],
        [['F', 'How do you model many-to-many?', 'With a junction table containing foreign keys to both tables.'],
            ['F', 'Example of many-to-many?', 'Students and courses, authors and books, users and roles.'],
            ['M', 'What should the primary key of the junction table be?', 'Usually the composite (a_id, b_id), which also prevents duplicate links.'],
            ['M', 'Where do you store an attribute like enrolment date?', 'In the junction table, because it describes the relationship, not either entity.'],
            ['S', 'Why not store a list of ids in a column?', 'It violates first normal form; you cannot enforce foreign keys, index membership or join efficiently.'],
            ['S', 'When does a junction table become an entity?', 'When the link has its own lifecycle, identity or many attributes, such as order_items, which need their own id and constraints.']],
        [['Model students and courses and list each student with their courses.',
            r`CREATE TABLE students (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE courses  (id INT PRIMARY KEY, title VARCHAR(30));
CREATE TABLE enrolments (student_id INT, course_id INT, enrolled_on DATE,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id), FOREIGN KEY (course_id) REFERENCES courses(id));
INSERT INTO students VALUES (1,'Abaji'),(2,'Raoji');
INSERT INTO courses VALUES (10,'SQL'),(11,'Java');
INSERT INTO enrolments VALUES (1,10,'2026-01-05'),(1,11,'2026-01-06'),(2,10,'2026-01-07');
SELECT s.name, c.title FROM students s JOIN enrolments e ON e.student_id=s.id JOIN courses c ON c.id=e.course_id ORDER BY s.name, c.title;

-- OUTPUT:
-- name  | title
-- Abaji | Java
-- Abaji | SQL
-- Raoji | SQL`],
            ['Count students per course.',
                r`SELECT c.title, COUNT(*) AS students FROM courses c JOIN enrolments e ON e.course_id=c.id GROUP BY c.id, c.title;

-- OUTPUT:
-- title | students
-- SQL   |        2
-- Java  |        1`]],
        [['Students not enrolled in anything.',
            r`INSERT INTO students VALUES (3,'Moropant');
SELECT s.name FROM students s LEFT JOIN enrolments e ON e.student_id = s.id WHERE e.student_id IS NULL;

-- OUTPUT:
-- name
-- Moropant`],
            ['Duplicate links are rejected by the composite key.',
                r`INSERT INTO enrolments VALUES (1,10,'2026-02-01');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-10' for key 'enrolments.PRIMARY'`]]
    ),

    'Relational Database Concepts': x(
        ['Data is stored in tables (relations) made of rows (tuples) and columns (attributes).',
            'Tables are linked by keys, not by physical pointers, and you query with SQL.',
            'Core ideas: primary key, foreign key, constraints, normalization and transactions.'],
        ['Relational algebra underlies SQL: selection (WHERE), projection (SELECT columns), join, union, difference.',
            'Integrity types: entity (PK not null), referential (FK valid), domain (types/checks).',
            'ACID transactions make multi-statement changes safe.'],
        ['The relational model separates logical design from physical storage; you can add indexes or change storage without rewriting queries.',
            'NULL introduces three-valued logic (TRUE, FALSE, UNKNOWN); many bugs come from forgetting it.',
            'Normalize for integrity, denormalize deliberately for read performance, and measure.'],
        [['F', 'What is a relation?', 'A table: a set of rows with the same columns.'],
            ['F', 'What is a tuple and an attribute?', 'Tuple = row; attribute = column.'],
            ['M', 'What are the three kinds of integrity?', 'Entity (unique, non-null PK), referential (valid FK), domain (valid values via types and checks).'],
            ['M', 'What is three-valued logic?', 'Comparisons with NULL give UNKNOWN, not TRUE or FALSE, so <code>NULL = NULL</code> is not true; use IS NULL.'],
            ['S', 'Why is SQL called declarative?', 'You specify what data you want; the optimizer decides the access paths, join order and algorithms.'],
            ['S', 'Is SQL truly relational?', 'Not entirely: tables can contain duplicates (bags, not sets) and NULLs, which the pure relational model disallows. Good design uses keys and NOT NULL to stay close to the model.']],
        [['Show that NULL does not equal NULL.',
            r`SELECT NULL = NULL AS eq, NULL IS NULL AS is_null;

-- OUTPUT:
-- eq   | is_null
-- NULL |       1`],
            ['Project and select: only the name of students with id greater than 1.',
                r`SELECT name FROM students WHERE id > 1;

-- OUTPUT:
-- name
-- Raoji
-- Moropant`]],
        [['A relational join combining two relations.',
            r`SELECT s.name, c.title FROM students s JOIN enrolments e ON e.student_id=s.id JOIN courses c ON c.id=e.course_id WHERE s.id = 2;

-- OUTPUT:
-- name  | title
-- Raoji | SQL`],
            ['Set difference with NOT EXISTS (students not in any course).',
                r`SELECT name FROM students s WHERE NOT EXISTS (SELECT 1 FROM enrolments e WHERE e.student_id = s.id);

-- OUTPUT:
-- name
-- Moropant`]]
    ),

    'SQL vs MySQL': x(
        ['SQL is the language used to talk to relational databases. MySQL is a database product that understands SQL.',
            'Other products also use SQL with small differences: PostgreSQL, Oracle, SQL Server.',
            'Analogy: SQL is like English; MySQL is one speaker of it.'],
        ['SQL is a standard (ANSI/ISO) with many dialect extensions; MySQL has its own functions and syntax such as <code>LIMIT</code>, <code>AUTO_INCREMENT</code>, backtick quoting.',
            'Portable SQL sticks to the standard parts; use vendor features only when they pay off.',
            'Language categories: DDL (CREATE), DML (INSERT), DQL (SELECT), DCL (GRANT), TCL (COMMIT).'],
        ['Dialect differences hit migrations: <code>LIMIT</code> vs <code>FETCH FIRST</code>, <code>IFNULL</code> vs <code>COALESCE</code>, identity vs auto-increment, date functions.',
            'ORMs hide dialects but leak when you use native queries; test against the real engine, not an in-memory substitute.',
            'Know <code>sql_mode</code>: strict mode changes whether bad data errors or silently truncates.'],
        [['F', 'What is the difference between SQL and MySQL?', 'SQL is a query language; MySQL is a relational database management system that implements SQL.'],
            ['F', 'Name the SQL command categories.', 'DDL, DML, DQL, DCL, TCL.'],
            ['M', 'Which MySQL-specific features are not standard SQL?', '<code>AUTO_INCREMENT</code>, <code>LIMIT</code> (non-standard form), backtick identifiers, <code>ON DUPLICATE KEY UPDATE</code>, <code>REPLACE</code>.'],
            ['M', 'What is sql_mode and why does it matter?', 'A setting that controls strictness. With STRICT_TRANS_TABLES invalid values raise errors; without it MySQL may truncate or coerce silently.'],
            ['S', 'How do you write portable SQL?', 'Use standard constructs (COALESCE, CASE, ANSI joins, FETCH FIRST where supported), avoid vendor functions, and cover important queries with tests on each target database.'],
            ['S', 'Why not test with H2 or SQLite when production is MySQL?', 'Dialect, type, locking and optimizer behaviour differ, so tests can pass while production fails. Use a real MySQL container (Testcontainers).']],
        [['Run one query in each style: DQL, DML and DDL.',
            r`CREATE TABLE t (id INT);          -- DDL
INSERT INTO t VALUES (1);          -- DML
SELECT * FROM t;                   -- DQL

-- OUTPUT:
-- id
--  1`],
            ['Show the current sql_mode.',
                r`SELECT @@sql_mode;

-- OUTPUT: (example)
-- ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION`]],
        [['Portable vs MySQL-specific null handling.',
            r`SELECT COALESCE(NULL, 'x') AS standard_way, IFNULL(NULL, 'x') AS mysql_way;

-- OUTPUT:
-- standard_way | mysql_way
-- x            | x`],
            ['Strict mode rejects a too-long value.',
                r`CREATE TABLE s (c VARCHAR(3));
INSERT INTO s VALUES ('abcdef');

-- OUTPUT: (strict mode)
-- ERROR 1406 (22001): Data too long for column 'c' at row 1`]]
    )
};
