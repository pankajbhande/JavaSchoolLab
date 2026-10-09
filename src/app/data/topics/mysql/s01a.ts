// Module 1 (Database Fundamentals), part A.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s01a: Record<string, DeepDive> = {
    'What is a Database?': dd(
        [`A <b>database</b> is an organised collection of data stored so that programs can store, find, change and protect it reliably. Unlike a loose file, a database adds structure, indexing, concurrency control and crash recovery.`,
            r`-- A database groups related tables; here we create one and put one fact in it
CREATE DATABASE school_demo;                 -- new empty database
USE school_demo;                             -- make it the current one
CREATE TABLE student (id INT, name VARCHAR(40));   -- structure for the facts
INSERT INTO student VALUES (1, 'Asha');      -- store a fact
SELECT * FROM student;                       -- read it back

-- OUTPUT:
-- +------+------+
-- | id   | name |
-- +------+------+
-- |    1 | Asha |
-- +------+------+`],
        [`Spreadsheets and text files break down when many users write at once, when data must stay consistent after a power cut, or when you must find one row among millions in milliseconds. A database solves sharing, integrity, speed and security together.`,
            r`-- Finding one row in a file means scanning it all; a database uses an index
CREATE TABLE big (id INT PRIMARY KEY, note VARCHAR(20));
INSERT INTO big VALUES (1,'a'),(2,'b'),(3,'c');
EXPLAIN SELECT * FROM big WHERE id = 2;      -- shows the optimizer uses the PK, not a scan

-- OUTPUT (example, trimmed):
-- +----+-------+-------+---------+-------+------+
-- | id | table | type  | key     | ref   | rows |
-- +----+-------+-------+---------+-------+------+
-- |  1 | big   | const | PRIMARY | const |    1 |
-- +----+-------+-------+---------+-------+------+`],
        [`Every shop checkout, bank transfer, booking and login reads or writes a database. A web request typically opens a connection, runs a few SQL statements inside a transaction and returns.`,
            r`-- A typical order write: two facts must be saved together or not at all
CREATE TABLE orders (id INT PRIMARY KEY, total DECIMAL(8,2));
START TRANSACTION;                           -- begin an atomic unit
INSERT INTO orders VALUES (101, 499.00);     -- the sale
COMMIT;                                      -- make it permanent and visible
SELECT COUNT(*) AS orders_saved FROM orders;

-- OUTPUT:
-- +--------------+
-- | orders_saved |
-- +--------------+
-- |            1 |
-- +--------------+`],
        [`<b>Advantages:</b> persistent storage, fast indexed lookup, many concurrent users, integrity rules, security (users and privileges), backup and recovery.`,
            r`-- Integrity rule enforced by the database itself, not by every app
CREATE TABLE acct (id INT PRIMARY KEY, balance DECIMAL(10,2) NOT NULL CHECK (balance >= 0));
INSERT INTO acct VALUES (1, 100.00);         -- accepted
INSERT INTO acct VALUES (2, -5.00);          -- rejected by the CHECK rule

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 3819 (HY000): Check constraint 'acct_chk_1' is violated.`],
        [`<b>Disadvantages:</b> needs administration (backups, tuning, upgrades), a server to run, schema design effort, and licence or hardware cost at scale. A simple config file is cheaper for tiny data.`,
            r`-- Cost of structure: you must design columns before you can store anything
INSERT INTO ghost_table VALUES (1);          -- table was never designed or created

-- OUTPUT:
-- ERROR 1146 (42S02): Table 'school_demo.ghost_table' doesn't exist`],
        [`<b>Limitations:</b> one server has finite CPU, RAM and disk; very large write volumes need sharding or replication; relational schemas are awkward for deeply nested or constantly changing document shapes.`,
            r`-- A single row has a hard size ceiling (65,535 bytes across non-BLOB columns)
CREATE TABLE too_wide (a VARCHAR(40000) CHARACTER SET utf8mb4, b VARCHAR(40000) CHARACTER SET utf8mb4);

-- OUTPUT:
-- ERROR 1118 (42000): Row size too large. The maximum row size for the used table type,
-- not counting BLOBs, is 65535.`],
        `
   Application ──SQL──►  Database Server  ──►  Disk
   (Java/Python)         ┌───────────────┐     ┌────────────┐
                         │ parser        │     │ data files │
                         │ optimizer     │     │ redo/undo  │
                         │ storage engine│     │ binlog     │
                         └───────────────┘     └────────────┘
   Many clients share one consistent copy of the data.
`,
        `A database is the system of record, so design for its failure modes first: backups and restore tests, replication, and an exit plan. Keep business invariants (keys, NOT NULL, CHECK) in the schema so every client benefits, and avoid using it as a queue or file store.`
    ),

    'DBMS vs RDBMS': dd(
        [`A <b>DBMS</b> is any software that manages data (files, hierarchical, key-value, document). An <b>RDBMS</b> is a DBMS that stores data in related tables, uses SQL and enforces relational rules (keys, constraints, ACID). MySQL, PostgreSQL and Oracle are RDBMSs.`,
            r`-- RDBMS signature: tables + keys linking them
CREATE TABLE dept (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE emp  (id INT PRIMARY KEY, name VARCHAR(30), dept_id INT,
                   FOREIGN KEY (dept_id) REFERENCES dept(id));   -- relation between tables
INSERT INTO dept VALUES (1,'IT');
INSERT INTO emp  VALUES (10,'Ravi',1);
SELECT e.name, d.name AS dept FROM emp e JOIN dept d ON d.id = e.dept_id;

-- OUTPUT:
-- +------+------+
-- | name | dept |
-- +------+------+
-- | Ravi | IT   |
-- +------+------+`],
        [`Older file-based or hierarchical systems duplicated data and let programs break it. The relational model removes redundancy and lets the engine guarantee that references stay valid.`,
            r`-- Without relations, a typo creates an orphan; with an FK the engine refuses it
INSERT INTO emp VALUES (11,'Mina',99);       -- department 99 does not exist

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails
-- (school_demo.emp, CONSTRAINT emp_ibfk_1 FOREIGN KEY (dept_id) REFERENCES dept (id))`],
        [`Banks, ERP, e-commerce and HR systems use an RDBMS because they need accuracy and transactions. Non-relational DBMSs (Redis, MongoDB) are chosen for caches, documents and flexible schemas.`,
            r`-- RDBMS gives ACID: a failed step undoes the whole unit
CREATE TABLE bank (id INT PRIMARY KEY, bal INT);
INSERT INTO bank VALUES (1,500),(2,100);
START TRANSACTION;
UPDATE bank SET bal = bal - 200 WHERE id = 1;   -- debit
-- crash or error happens here
ROLLBACK;                                       -- debit is undone
SELECT * FROM bank;

-- OUTPUT:
-- +----+------+
-- | id | bal  |
-- +----+------+
-- |  1 |  500 |
-- |  2 |  100 |
-- +----+------+`],
        [`<b>Advantages of RDBMS:</b> standard SQL, joins across tables, integrity constraints, ACID transactions, mature tooling.`,
            r`-- One standard language across vendors: aggregate over a join
SELECT d.name, COUNT(e.id) AS staff
FROM dept d LEFT JOIN emp e ON e.dept_id = d.id
GROUP BY d.name;

-- OUTPUT:
-- +------+-------+
-- | name | staff |
-- +------+-------+
-- | IT   |     1 |
-- +------+-------+`],
        [`<b>Disadvantages:</b> rigid schema, joins cost CPU at huge scale, and horizontal write scaling is hard.`,
            r`-- Changing the schema of a big table is a deliberate operation, not an ad-hoc write
ALTER TABLE emp ADD COLUMN phone VARCHAR(15);   -- every existing row gains the column
DESCRIBE emp;

-- OUTPUT (trimmed):
-- | phone   | varchar(15) | YES  |     | NULL    |       |`],
        [`<b>Limitations:</b> a plain DBMS (e.g. a key-value store) may offer no joins or constraints; a single-node RDBMS caps at one machine unless you add replication or sharding.`,
            r`-- Storage-engine choice matters: MyISAM is a DBMS-style engine without FK or transactions
SHOW ENGINES;                                   -- InnoDB is the transactional default

-- OUTPUT (trimmed):
-- | Engine | Support | Transactions | XA  | Savepoints |
-- | InnoDB | DEFAULT | YES          | YES | YES        |
-- | MyISAM | YES     | NO           | NO  | NO         |`],
        `
   DBMS (any data manager)
   ├── File / Hierarchical / Network
   ├── NoSQL: key-value | document | graph
   └── RDBMS ─ tables + keys + SQL + ACID
        ├── MySQL      ├── PostgreSQL
        └── Oracle     └── SQL Server
`,
        `Choose RDBMS when correctness and ad-hoc querying matter, and add specialised stores (cache, search, document) around it rather than instead of it. The usual mistake is dropping integrity to gain a flexibility you never needed.`
    ),

    'What is MySQL?': dd(
        [`<b>MySQL</b> is an open-source relational database server (now owned by Oracle) that speaks SQL over TCP port 3306. It uses pluggable storage engines; <b>InnoDB</b> is the default and provides transactions, row locking and crash recovery.`,
            r`-- Ask the server who it is
SELECT VERSION() AS version, @@port AS port, @@default_storage_engine AS engine;

-- OUTPUT (example):
-- +---------+------+--------+
-- | version | port | engine |
-- +---------+------+--------+
-- | 8.0.36  | 3306 | InnoDB |
-- +---------+------+--------+`],
        [`Teams need a free, fast, widely-supported relational database with good tooling and hosting everywhere (AWS RDS, Azure, GCP, shared hosting). MySQL is the "M" in the LAMP stack for exactly this reason.`,
            r`-- Built-in features you do not have to install separately
SELECT NOW() AS now_ts, UUID() AS id, JSON_OBJECT('k', 1) AS doc;

-- OUTPUT (example):
-- +---------------------+--------------------------------------+----------+
-- | now_ts              | id                                   | doc      |
-- +---------------------+--------------------------------------+----------+
-- | 2026-10-06 10:00:00 | 3f2c9a52-... (example)               | {"k": 1} |
-- +---------------------+--------------------------------------+----------+`],
        [`WordPress, Facebook (early), Uber, Booking and countless Spring Boot / Django / Laravel apps run on MySQL. Apps connect through a driver (JDBC, mysqlclient, PDO).`,
            r`-- What an app sees: the user and database of the current connection
SELECT CURRENT_USER() AS who, DATABASE() AS db, CONNECTION_ID() AS conn;

-- OUTPUT (example):
-- +----------------+--------+------+
-- | who            | db     | conn |
-- +----------------+--------+------+
-- | app_user@%     | shop   |   27 |
-- +----------------+--------+------+`],
        [`<b>Advantages:</b> free community edition, easy install, fast reads, mature replication, huge community and managed cloud offerings.`,
            r`-- Replication and many engines are available out of the box
SHOW VARIABLES LIKE 'log_bin';                  -- binary log drives replication

-- OUTPUT (example):
-- +---------------+-------+
-- | Variable_name | Value |
-- +---------------+-------+
-- | log_bin       | ON    |
-- +---------------+-------+`],
        [`<b>Disadvantages:</b> fewer advanced SQL features than PostgreSQL historically (some, like window functions and CTEs, only arrived in 8.0), and Oracle controls the roadmap.`,
            r`-- Features differ by version: window functions need MySQL 8.0+
SELECT ROW_NUMBER() OVER (ORDER BY id) AS rn FROM (SELECT 1 AS id UNION SELECT 2) t;

-- OUTPUT on 8.0:                      OUTPUT on 5.7:
-- +----+                              -- ERROR 1064 (42000): You have an error in your
-- | rn |                              -- SQL syntax ... near '(ORDER BY id)'
-- +----+
-- |  1 |
-- |  2 |`],
        [`<b>Limitations:</b> single-primary writes by default, no native sharding (use Vitess or app-level), max_allowed_packet (64 MB default, 1 GB max) limits big BLOBs and rows, and some DDL still blocks.`,
            r`-- Statements larger than max_allowed_packet are rejected
SELECT @@max_allowed_packet / 1024 / 1024 AS mb;

-- OUTPUT (example, default 8.0 = 64 MB):
-- +--------+
-- | mb     |
-- +--------+
-- | 64.0000|
-- +--------+`],
        `
   Client ──► Connection layer ──► Parser/Optimizer ──► Storage engine API
   (JDBC)     (threads, auth)      (plan)              ├─ InnoDB (default)
                                                       ├─ MyISAM
                                                       └─ MEMORY ...
`,
        `Standardise on InnoDB, MySQL 8.0 LTS-style versions and utf8mb4. Plan scale-out early (read replicas, then partitioning or Vitess) because single-writer topology is the main ceiling. Prefer managed services unless you can staff DBA work.`
    ),

    'Database, Table, Row & Column': dd(
        [`A <b>database</b> (schema) contains <b>tables</b>. A table is a grid: each <b>column</b> has a name and data type; each <b>row</b> (record/tuple) is one entity such as one student.`,
            r`CREATE DATABASE IF NOT EXISTS uni;            -- container
USE uni;
CREATE TABLE student (
    id   INT,                                  -- column 1
    name VARCHAR(30),                          -- column 2
    age  INT                                   -- column 3
);
INSERT INTO student VALUES (1,'Asha',20),(2,'Ravi',22);   -- two rows
SELECT * FROM student;

-- OUTPUT:
-- +------+------+------+
-- | id   | name | age  |
-- +------+------+------+
-- |    1 | Asha |   20 |
-- |    2 | Ravi |   22 |
-- +------+------+------+`],
        [`Splitting data into tables of one subject each (students, courses) avoids repeating facts. Columns with types let the engine validate and store compactly; rows let you address one entity.`,
            r`-- Column types reject nonsense: age must be a number
INSERT INTO student VALUES (3,'Mina','twenty');

-- OUTPUT:
-- ERROR 1366 (HY000): Incorrect integer value: 'twenty' for column 'age' at row 1`],
        [`A shop has tables like <code>customers</code>, <code>products</code>, <code>orders</code>. Reporting selects specific columns and filters rows.`,
            r`-- Projection = choose columns; selection = choose rows
SELECT name, age            -- columns
FROM student
WHERE age > 20;             -- rows

-- OUTPUT:
-- +------+------+
-- | name | age  |
-- +------+------+
-- | Ravi |   22 |
-- +------+------+`],
        [`<b>Advantages:</b> a uniform, easy-to-picture model; every row has the same shape so tools, indexes and reports are simple.`,
            r`-- Introspect the shape of any table
SHOW COLUMNS FROM student;

-- OUTPUT:
-- +-------+-------------+------+-----+---------+-------+
-- | Field | Type        | Null | Key | Default | Extra |
-- +-------+-------------+------+-----+---------+-------+
-- | id    | int         | YES  |     | NULL    |       |
-- | name  | varchar(30) | YES  |     | NULL    |       |
-- | age   | int         | YES  |     | NULL    |       |
-- +-------+-------------+------+-----+---------+-------+`],
        [`<b>Disadvantages:</b> every row carries every column, so sparse attributes waste space (as NULLs), and rows have no inherent order.`,
            r`-- Rows have no guaranteed order unless you say so
SELECT name FROM student;                       -- order not promised
SELECT name FROM student ORDER BY name DESC;    -- order guaranteed

-- OUTPUT (second query):
-- +------+
-- | name |
-- +------+
-- | Ravi |
-- | Asha |
-- +------+`],
        [`<b>Limitations:</b> max 4096 columns per table (InnoDB about 1017), 64 characters for identifiers, and 65,535 bytes of row width excluding BLOB/TEXT.`,
            r`-- Identifier names are limited to 64 characters
CREATE TABLE this_table_name_is_deliberately_made_far_too_long_to_be_accepted_by_mysql_ok (x INT);

-- OUTPUT:
-- ERROR 1059 (42000): Identifier name 'this_table_name_is_...' is too long`],
        `
   Database: uni
   └── Table: student
        ┌────┬──────┬─────┐
        │ id │ name │ age │   <- columns (name + type)
        ├────┼──────┼─────┤
        │  1 │ Asha │  20 │   <- row (one record)
        │  2 │ Ravi │  22 │
        └────┴──────┴─────┘
`,
        `Model one entity per table, name things consistently (snake_case, singular or plural, but pick one) and give every table a primary key. Prefer narrow, well-typed columns; they shrink indexes and buffer-pool usage far more than they cost in design time.`
    ),

    'Schema': dd(
        [`A <b>schema</b> is the blueprint of a database: tables, columns, types, keys and constraints. In MySQL the words <code>SCHEMA</code> and <code>DATABASE</code> are synonyms: <code>CREATE SCHEMA</code> equals <code>CREATE DATABASE</code>.`,
            r`CREATE SCHEMA library;                        -- same as CREATE DATABASE library
SHOW DATABASES LIKE 'library';

-- OUTPUT:
-- +----------------------+
-- | Database (library)   |
-- +----------------------+
-- | library              |
-- +----------------------+`],
        [`A named blueprint lets teams agree on the shape of data, version it in source control and apply it to dev, test and production identically.`,
            r`-- Schema as code: one script that can be re-run
USE library;
CREATE TABLE IF NOT EXISTS book (
    id    INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL
);
SHOW CREATE TABLE book;

-- OUTPUT (trimmed):
-- CREATE TABLE book (
--   id int NOT NULL AUTO_INCREMENT,
--   title varchar(100) NOT NULL,
--   PRIMARY KEY (id)
-- ) ENGINE=InnoDB`],
        [`Real deployments keep one schema per application or tenant and refer across them with <code>schema.table</code> names.`,
            r`-- Cross-schema reference using qualified names
CREATE SCHEMA billing;
CREATE TABLE billing.invoice (id INT PRIMARY KEY);
INSERT INTO billing.invoice VALUES (1);
SELECT COUNT(*) AS n FROM billing.invoice;      -- no USE needed

-- OUTPUT:
-- +---+
-- | n |
-- +---+
-- | 1 |
-- +---+`],
        [`<b>Advantages:</b> isolates applications, allows per-schema privileges, and the INFORMATION_SCHEMA exposes the blueprint as queryable data.`,
            r`SELECT table_name, table_rows
FROM information_schema.tables
WHERE table_schema = 'library';                 -- list tables of one schema

-- OUTPUT (example):
-- +------------+------------+
-- | TABLE_NAME | TABLE_ROWS |
-- +------------+------------+
-- | book       |          0 |
-- +------------+------------+`],
        [`<b>Disadvantages:</b> schema changes (migrations) on large tables are slow or risky, and changing a design late is expensive.`,
            r`-- Dropping a column is irreversible without a backup
ALTER TABLE library.book ADD COLUMN isbn CHAR(13);
ALTER TABLE library.book DROP COLUMN isbn;      -- data in it is gone

-- OUTPUT:
-- Query OK, 0 rows affected (0.05 sec)`],
        [`<b>Limitations:</b> unlike PostgreSQL, MySQL has no separate namespace layer inside a database, so a schema equals a database; cross-schema foreign keys work only within the same server and engine.`,
            r`-- There is no CREATE SCHEMA ... inside a database; nesting is not supported
CREATE SCHEMA library.sub1;

-- OUTPUT:
-- ERROR 1064 (42000): You have an error in your SQL syntax ... near '.sub1'`],
        `
   MySQL server
   ├── schema = database : library
   │     ├── book
   │     └── member
   └── schema = database : billing
         └── invoice          (library.book , billing.invoice)
`,
        `Treat schema as a versioned artifact: migrate with a tool (Flyway, Liquibase), review DDL like code and rehearse it on a production-sized copy. Use separate schemas for bounded contexts, but remember cross-schema joins couple deployments.`
    ),

    'Primary Key & Foreign Key Basics': dd(
        [`A <b>primary key (PK)</b> uniquely identifies each row (unique and NOT NULL, one per table). A <b>foreign key (FK)</b> is a column that holds another table's PK, creating a link and a rule that the referenced row must exist.`,
            r`CREATE TABLE author (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE book (
    id        INT PRIMARY KEY,
    title     VARCHAR(50),
    author_id INT,
    FOREIGN KEY (author_id) REFERENCES author(id)   -- link to author.id
);
INSERT INTO author VALUES (1,'Tagore');
INSERT INTO book   VALUES (10,'Gitanjali',1);
SELECT b.title, a.name FROM book b JOIN author a ON a.id = b.author_id;

-- OUTPUT:
-- +-----------+--------+
-- | title     | name   |
-- +-----------+--------+
-- | Gitanjali | Tagore |
-- +-----------+--------+`],
        [`Without a PK you cannot reliably update or delete one specific row; without an FK, rows can point at things that do not exist.`,
            r`-- PK blocks duplicates
INSERT INTO author VALUES (1,'Someone Else');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'author.PRIMARY'`],
        [`Orders reference customers, order lines reference orders and products. Every join in reporting follows an FK path.`,
            r`-- FK stops orphan rows
INSERT INTO book VALUES (11,'Ghost Book',99);       -- author 99 absent

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails`],
        [`<b>Advantages:</b> guaranteed uniqueness and referential integrity; the PK is also the clustered index in InnoDB, so lookups by it are fastest.`,
            r`-- Lookup by PK is a single-row access
EXPLAIN SELECT * FROM author WHERE id = 1;

-- OUTPUT (example, trimmed):
-- | table  | type  | key     | rows |
-- | author | const | PRIMARY |    1 |`],
        [`<b>Disadvantages:</b> FKs add checks on every write and take locks on parent rows; a wide PK is copied into every secondary index.`,
            r`-- Parent cannot be removed while children exist (default RESTRICT)
DELETE FROM author WHERE id = 1;

-- OUTPUT:
-- ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails`],
        [`<b>Limitations:</b> InnoDB only (not MyISAM); parent and child column types must match; partitioned tables cannot have FKs; only one PK per table (but it may be composite).`,
            r`CREATE TABLE two_pk (a INT PRIMARY KEY, b INT PRIMARY KEY);

-- OUTPUT:
-- ERROR 1068 (42000): Multiple primary key defined`],
        `
   author (PK id)                book (PK id, FK author_id)
   ┌────┬────────┐               ┌────┬───────────┬───────────┐
   │  1 │ Tagore │ ◄─────────────│ 10 │ Gitanjali │     1     │
   └────┴────────┘   references  └────┴───────────┴───────────┘
`,
        `Prefer short, immutable, meaningless PKs (BIGINT auto-increment or ordered UUID) for InnoDB. Declare FKs in OLTP schemas for integrity; in extreme-scale or sharded systems teams sometimes drop them and enforce integrity in code, accepting the risk.`
    ),

    'Candidate, Composite & Unique Keys': dd(
        [`A <b>candidate key</b> is any minimal column set that could uniquely identify a row; one becomes the PK, the rest are alternates. A <b>composite key</b> uses two or more columns together. A <b>unique key</b> enforces uniqueness but, unlike a PK, may allow NULLs and a table can have many.`,
            r`CREATE TABLE person (
    id     INT PRIMARY KEY,               -- chosen candidate key -> primary key
    email  VARCHAR(60) UNIQUE,            -- another candidate key -> unique key
    aadhar CHAR(12)    UNIQUE
);
INSERT INTO person VALUES (1,'a@x.com','111122223333');
SHOW INDEX FROM person;

-- OUTPUT (trimmed):
-- | Key_name | Non_unique | Column_name |
-- | PRIMARY  |          0 | id          |
-- | email    |          0 | email       |
-- | aadhar   |          0 | aadhar      |`],
        [`Real identity is often more than one column (a student in a course, an order line in an order). Composite keys model that exactly, and unique keys protect natural identifiers like email.`,
            r`CREATE TABLE enrol (
    student_id INT,
    course_id  INT,
    PRIMARY KEY (student_id, course_id)   -- composite: the pair must be unique
);
INSERT INTO enrol VALUES (1,100),(1,101),(2,100);
INSERT INTO enrol VALUES (1,100);          -- same pair again

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-100' for key 'enrol.PRIMARY'`],
        [`Login systems use unique email; junction tables use composite PKs; payroll uses a surrogate PK plus a unique employee code.`,
            r`-- Enforce "one email per account" at the database level
INSERT INTO person VALUES (2,'a@x.com','444455556666');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'a@x.com' for key 'person.email'`],
        [`<b>Advantages:</b> declarative integrity; unique keys double as indexes for fast lookup; composite keys avoid a meaningless extra column in junction tables.`,
            r`-- Unique indexes make the lookup fast
EXPLAIN SELECT id FROM person WHERE email = 'a@x.com';

-- OUTPUT (example, trimmed):
-- | type  | key   | key_len | rows |
-- | const | email | 243     |    1 |`],
        [`<b>Disadvantages:</b> wide composite PKs enlarge every secondary index, and each unique key costs extra write work and space.`,
            r`-- Index size grows with key width; check it
SELECT index_name, stat_value * @@innodb_page_size / 1024 AS kb
FROM mysql.innodb_index_stats
WHERE table_name = 'person' AND stat_name = 'size';

-- OUTPUT (example):
-- +------------+------+
-- | index_name | kb   |
-- +------------+------+
-- | PRIMARY    |   16 |
-- | email      |   16 |
-- | aadhar     |   16 |
-- +------------+------+`],
        [`<b>Limitations:</b> a UNIQUE column may hold many NULLs (NULL is not equal to NULL); max 16 columns and 3072 bytes in an InnoDB index key.`,
            r`CREATE TABLE u (v INT UNIQUE);
INSERT INTO u VALUES (NULL),(NULL),(1);        -- both NULLs accepted
SELECT * FROM u;

-- OUTPUT:
-- +------+
-- | v    |
-- +------+
-- | NULL |
-- | NULL |
-- |    1 |
-- +------+`],
        `
   Candidate keys:  {id}   {email}   {aadhar}   {first,last,dob}
                      │
                      ├─► PRIMARY KEY   (one, NOT NULL)
                      └─► UNIQUE keys   (alternates, NULL allowed)
   Composite: PRIMARY KEY (student_id, course_id)
`,
        `Pick a short surrogate as the PK, keep natural identifiers (email, tax id) as UNIQUE, and use composite PKs for pure junction tables. Remember InnoDB clusters on the PK, so key width and insertion order directly affect page splits and index size.`
    ),
};
