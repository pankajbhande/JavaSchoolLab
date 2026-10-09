// Module 1 (Database Fundamentals), part B.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s01b: Record<string, DeepDive> = {
    'Constraints Overview': dd(
        [`<b>Constraints</b> are rules attached to columns or tables that the database enforces on every write: PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, DEFAULT and CHECK (enforced from MySQL 8.0.16).`,
            r`CREATE TABLE product (
    id    INT           PRIMARY KEY,                 -- unique + not null
    sku   VARCHAR(20)   NOT NULL UNIQUE,             -- required and unique
    price DECIMAL(8,2)  NOT NULL DEFAULT 0.00,       -- fallback value
    qty   INT           NOT NULL CHECK (qty >= 0)    -- business rule
);
INSERT INTO product (id, sku, qty) VALUES (1,'P-1',5);
SELECT * FROM product;

-- OUTPUT:
-- +----+------+-------+-----+
-- | id | sku  | price | qty |
-- +----+------+-------+-----+
-- |  1 | P-1  |  0.00 |   5 |
-- +----+------+-------+-----+`],
        [`Application code has bugs and many apps write to the same data. Constraints are the last line of defence that keeps bad data out, whoever the writer is.`,
            r`INSERT INTO product (id, sku, qty) VALUES (2,'P-2',-3);   -- negative stock

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'product_chk_1' is violated.`],
        [`Typical use: email UNIQUE, status DEFAULT 'NEW', amount CHECK (amount > 0), orders.customer_id FK. Migrations add them with ALTER TABLE.`,
            r`ALTER TABLE product ADD CONSTRAINT chk_price CHECK (price >= 0);   -- add a rule later
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'product';

-- OUTPUT (example):
-- +-----------------+-----------------+
-- | CONSTRAINT_NAME | CONSTRAINT_TYPE |
-- +-----------------+-----------------+
-- | PRIMARY         | PRIMARY KEY     |
-- | sku             | UNIQUE          |
-- | product_chk_1   | CHECK           |
-- | chk_price       | CHECK           |
-- +-----------------+-----------------+`],
        [`<b>Advantages:</b> central, declarative, always enforced, documented in the schema and used by the optimizer (unique keys).`,
            r`-- Defaults fill gaps automatically
INSERT INTO product (id, sku, qty) VALUES (3,'P-3',1);
SELECT price FROM product WHERE id = 3;

-- OUTPUT:
-- +-------+
-- | price |
-- +-------+
-- |  0.00 |
-- +-------+`],
        [`<b>Disadvantages:</b> each check costs write time; error messages are generic; adding a constraint to a large dirty table can fail or lock.`,
            r`-- Adding a rule to existing bad data fails
-- product row 1 already has qty = 5, which breaks the new rule
ALTER TABLE product ADD CONSTRAINT chk_big CHECK (qty < 3);        -- row 1 has qty 5

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'chk_big' is violated.`],
        [`<b>Limitations:</b> CHECK cannot reference other tables or non-deterministic functions; before 8.0.16 CHECK was parsed and ignored; FK needs InnoDB.`,
            r`ALTER TABLE product ADD CONSTRAINT chk_now CHECK (qty < RAND() * 100);

-- OUTPUT:
-- ERROR 3814 (HY000): An expression of a check constraint 'chk_now' contains
-- disallowed function: rand.`],
        `
   INSERT / UPDATE ──► constraint gate ──► table
                       ├─ NOT NULL  : value present?
                       ├─ UNIQUE/PK : no duplicate?
                       ├─ CHECK     : rule true?
                       ├─ FK        : parent exists?
                       └─ DEFAULT   : fill missing
                          fail = ERROR, statement rolled back
`,
        `Put invariants that must never be violated in constraints, and soft or changing business rules in the application. Name constraints explicitly (uq_, fk_, chk_) so migrations and error messages are readable, and add them before data grows.`
    ),

    'One-to-One Relationship': dd(
        [`In a <b>one-to-one</b> relationship each row in table A matches at most one row in table B and vice versa, e.g. a user and the single profile row for that user. Implement it with a FK that is also UNIQUE (or the child's PK).`,
            r`CREATE TABLE app_user (id INT PRIMARY KEY, login VARCHAR(30));
CREATE TABLE user_profile (
    user_id INT PRIMARY KEY,                       -- PK = FK enforces 1:1
    bio     VARCHAR(200),
    FOREIGN KEY (user_id) REFERENCES app_user(id)
);
INSERT INTO app_user VALUES (1,'asha');
INSERT INTO user_profile VALUES (1,'Loves SQL');
SELECT u.login, p.bio FROM app_user u JOIN user_profile p ON p.user_id = u.id;

-- OUTPUT:
-- +-------+-----------+
-- | login | bio       |
-- +-------+-----------+
-- | asha  | Loves SQL |
-- +-------+-----------+`],
        [`Splitting rarely used or sensitive columns into their own table keeps the hot table narrow and lets you apply different privileges or storage.`,
            r`-- Second profile for the same user is rejected
INSERT INTO user_profile VALUES (1,'Another bio');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'user_profile.PRIMARY'`],
        [`Examples: user and passport details, employee and payroll record, order and invoice header. Many apps keep large BLOB or audit data in a 1:1 side table.`,
            r`-- LEFT JOIN shows users who have no profile yet (optional side)
INSERT INTO app_user VALUES (2,'ravi');
SELECT u.login, p.bio
FROM app_user u LEFT JOIN user_profile p ON p.user_id = u.id;

-- OUTPUT:
-- +-------+-----------+
-- | login | bio       |
-- +-------+-----------+
-- | asha  | Loves SQL |
-- | ravi  | NULL      |
-- +-------+-----------+`],
        [`<b>Advantages:</b> keeps the main table small and cache-friendly; isolates sensitive data; models true uniqueness.`,
            r`-- The narrow table scans fast because big text lives elsewhere
SELECT COUNT(*) AS users FROM app_user;

-- OUTPUT:
-- +-------+
-- | users |
-- +-------+
-- |     2 |
-- +-------+`],
        [`<b>Disadvantages:</b> an extra join to read both halves, and two inserts must stay in step.`,
            r`-- Creating a user with a profile needs two statements in one transaction
START TRANSACTION;
INSERT INTO app_user VALUES (3,'mina');
INSERT INTO user_profile VALUES (3,'Hello');
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected
-- Query OK, 1 row affected`],
        [`<b>Limitations:</b> MySQL cannot enforce that the child row must exist (mandatory on both sides); that needs application logic or deferred constraints, which MySQL lacks.`,
            r`-- User 2 legally exists without any profile: "must have one" cannot be declared
SELECT COUNT(*) AS users_without_profile
FROM app_user u LEFT JOIN user_profile p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- OUTPUT:
-- +-----------------------+
-- | users_without_profile |
-- +-----------------------+
-- |                     1 |
-- +-----------------------+`],
        `
   app_user                    user_profile
   ┌────┬───────┐              ┌─────────┬───────────┐
   │ id │ login │ 1 ────── 0..1│ user_id │ bio       │
   │ PK │       │              │ PK + FK │           │
   └────┴───────┘              └─────────┴───────────┘
`,
        `Use 1:1 splits for vertical partitioning (hot vs cold columns), security boundaries or optional large payloads, not by habit. If both sides are always read together and always exist, merging into one table is simpler and faster.`
    ),

    'One-to-Many Relationship': dd(
        [`In a <b>one-to-many</b> relationship one parent row relates to many child rows, but each child belongs to one parent: one customer, many orders. The FK lives on the "many" side.`,
            r`CREATE TABLE customer (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE orders (
    id          INT PRIMARY KEY,
    customer_id INT NOT NULL,                       -- FK on the many side
    amount      DECIMAL(8,2),
    FOREIGN KEY (customer_id) REFERENCES customer(id)
);
INSERT INTO customer VALUES (1,'Asha');
INSERT INTO orders VALUES (1,1,100),(2,1,250),(3,1,75);
SELECT c.name, COUNT(*) AS orders FROM customer c JOIN orders o ON o.customer_id = c.id GROUP BY c.name;

-- OUTPUT:
-- +------+--------+
-- | name | orders |
-- +------+--------+
-- | Asha |      3 |
-- +------+--------+`],
        [`Storing the customer name inside every order duplicates it and invites inconsistency. A child table with a key reference stores each fact once.`,
            r`-- Rename once, every order reflects it through the join
UPDATE customer SET name = 'Asha K' WHERE id = 1;
SELECT o.id, c.name FROM orders o JOIN customer c ON c.id = o.customer_id LIMIT 2;

-- OUTPUT:
-- +----+--------+
-- | id | name   |
-- +----+--------+
-- |  1 | Asha K |
-- |  2 | Asha K |
-- +----+--------+`],
        [`The most common relationship: department-employees, category-products, post-comments, order-order_items.`,
            r`-- Total per parent
SELECT customer_id, SUM(amount) AS total FROM orders GROUP BY customer_id;

-- OUTPUT:
-- +-------------+--------+
-- | customer_id | total  |
-- +-------------+--------+
-- |           1 | 425.00 |
-- +-------------+--------+`],
        [`<b>Advantages:</b> no duplication, simple to model and query, FK index speeds child lookups.`,
            r`-- InnoDB auto-creates an index on the FK column
SHOW INDEX FROM orders;

-- OUTPUT (trimmed):
-- | Key_name    | Column_name |
-- | PRIMARY     | id          |
-- | customer_id | customer_id |`],
        [`<b>Disadvantages:</b> reading parent and children needs a join; deleting a parent must decide what happens to children.`,
            r`DELETE FROM customer WHERE id = 1;           -- children still exist

-- OUTPUT:
-- ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails`],
        [`<b>Limitations:</b> a child cannot have two parents in the same relationship (that is many-to-many); a child row cannot be moved to a non-existent parent.`,
            r`UPDATE orders SET customer_id = 42 WHERE id = 1;   -- no such customer

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails`],
        `
   customer (1)                    orders (many)
   ┌────┬──────┐                   ┌────┬─────────────┬────────┐
   │  1 │ Asha │ ◄──┬──────────────│  1 │      1      │ 100.00 │
   └────┴──────┘    ├──────────────│  2 │      1      │ 250.00 │
                    └──────────────│  3 │      1      │  75.00 │
`,
        `Always index the FK column (InnoDB does automatically) and pick ON DELETE behaviour deliberately: RESTRICT for business data, CASCADE only for true ownership like order lines. For very hot parents, watch FK lock contention on the parent row.`
    ),

    'Many-to-Many Relationship': dd(
        [`In a <b>many-to-many</b> relationship rows on both sides relate to many on the other: students and courses. A relational DB cannot store it in two tables directly; you add a <b>junction (bridge) table</b> holding both FKs.`,
            r`CREATE TABLE student (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE course  (id INT PRIMARY KEY, title VARCHAR(30));
CREATE TABLE enrolment (
    student_id INT,
    course_id  INT,
    PRIMARY KEY (student_id, course_id),               -- each pair once
    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (course_id)  REFERENCES course(id)
);
INSERT INTO student VALUES (1,'Asha'),(2,'Ravi');
INSERT INTO course  VALUES (10,'SQL'),(20,'Java');
INSERT INTO enrolment VALUES (1,10),(1,20),(2,10);
SELECT s.name, c.title FROM student s
JOIN enrolment e ON e.student_id = s.id JOIN course c ON c.id = e.course_id ORDER BY s.name, c.title;

-- OUTPUT:
-- +------+-------+
-- | name | title |
-- +------+-------+
-- | Asha | Java  |
-- | Asha | SQL   |
-- | Ravi | SQL   |
-- +------+-------+`],
        [`Putting a list of course ids in one column breaks atomic values, blocks indexing and makes counting painful. The junction table keeps each link as a normal row.`,
            r`-- Which students take SQL? A plain indexed query on the junction table
SELECT student_id FROM enrolment WHERE course_id = 10;

-- OUTPUT:
-- +------------+
-- | student_id |
-- +------------+
-- |          1 |
-- |          2 |
-- +------------+`],
        [`Real examples: products and tags, actors and movies, users and roles, doctors and patients. The junction often carries its own attributes (enrolled_on, grade).`,
            r`ALTER TABLE enrolment ADD COLUMN grade CHAR(1);       -- attribute of the relationship
UPDATE enrolment SET grade = 'A' WHERE student_id = 1 AND course_id = 10;
SELECT * FROM enrolment WHERE grade IS NOT NULL;

-- OUTPUT:
-- +------------+-----------+-------+
-- | student_id | course_id | grade |
-- +------------+-----------+-------+
-- |          1 |        10 | A     |
-- +------------+-----------+-------+`],
        [`<b>Advantages:</b> normalised, supports attributes on the link, each side queryable in both directions.`,
            r`-- Count both directions
SELECT course_id, COUNT(*) AS students FROM enrolment GROUP BY course_id;

-- OUTPUT:
-- +-----------+----------+
-- | course_id | students |
-- +-----------+----------+
-- |        10 |        2 |
-- |        20 |        1 |
-- +-----------+----------+`],
        [`<b>Disadvantages:</b> reads need two joins, and the junction can grow very large (rows = links).`,
            r`-- Reverse lookups need a secondary index on (course_id, student_id)
ALTER TABLE enrolment ADD INDEX idx_course_student (course_id, student_id);

-- OUTPUT:
-- Query OK, 0 rows affected (0.03 sec)`],
        [`<b>Limitations:</b> the composite PK serves only lookups that start with student_id; there is no native many-to-many column type.`,
            r`EXPLAIN SELECT * FROM enrolment WHERE course_id = 20;   -- uses the extra index, not the PK

-- OUTPUT (example, trimmed):
-- | type | key                | Extra       |
-- | ref  | idx_course_student | Using index |`],
        `
   student            enrolment (junction)          course
   ┌────┬──────┐      ┌────────────┬───────────┐   ┌────┬───────┐
   │  1 │ Asha │◄─────│ student_id │ course_id │──►│ 10 │ SQL   │
   │  2 │ Ravi │◄─────│     1      │    10     │   │ 20 │ Java  │
   └────┴──────┘      │     1      │    20     │   └────┴───────┘
                      │     2      │    10     │
                      └────────────┴───────────┘
`,
        `Make the junction PK composite (no surrogate unless the link has its own identity) and add the reverse-order index for the other direction. Store link attributes there; if the link becomes a business entity (enrolment with fees), promote it to a first-class table.`
    ),

    'Relational Database Concepts': dd(
        [`The <b>relational model</b> (E. F. Codd, 1970) stores data as <b>relations</b> (tables) of <b>tuples</b> (rows) with <b>attributes</b> (columns). Core ideas: keys, domains (types), integrity rules, and set-based operations (selection, projection, join).`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Asha','IT',900),(2,'Ravi','HR',700),(3,'Mina','IT',800);
-- Selection (rows) + Projection (columns)
SELECT name, salary FROM emp WHERE dept = 'IT';

-- OUTPUT:
-- +------+--------+
-- | name | salary |
-- +------+--------+
-- | Asha |    900 |
-- | Mina |    800 |
-- +------+--------+`],
        [`Because queries state <i>what</i> you want, not <i>how</i> to find it, the optimizer can choose the best plan and the same SQL keeps working as data grows or indexes change.`,
            r`-- Declarative: no loops. The engine decides how.
SELECT dept, AVG(salary) AS avg_sal FROM emp GROUP BY dept;

-- OUTPUT:
-- +------+---------+
-- | dept | avg_sal |
-- +------+---------+
-- | IT   | 850.0000|
-- | HR   | 700.0000|
-- +------+---------+`],
        [`Everyday work is relational algebra in SQL clothes: union of two result sets, join to combine, difference to find missing.`,
            r`-- Set operation: union of two relations
SELECT name FROM emp WHERE dept = 'IT'
UNION
SELECT name FROM emp WHERE salary < 800;

-- OUTPUT:
-- +------+
-- | name |
-- +------+
-- | Asha |
-- | Mina |
-- | Ravi |
-- +------+`],
        [`<b>Advantages:</b> data independence (storage can change without changing queries), integrity rules, a strong formal basis for optimization.`,
            r`-- Data independence: add an index, queries unchanged, plan improves
CREATE INDEX idx_dept ON emp (dept);
EXPLAIN SELECT * FROM emp WHERE dept = 'IT';

-- OUTPUT (example, trimmed):
-- | type | key      | rows |
-- | ref  | idx_dept |    2 |`],
        [`<b>Disadvantages:</b> impedance mismatch with object models (hence ORMs), and NULL brings three-valued logic that surprises beginners.`,
            r`-- NULL is "unknown": comparisons are neither true nor false
SELECT NULL = NULL AS eq, NULL IS NULL AS is_null;

-- OUTPUT:
-- +------+---------+
-- | eq   | is_null |
-- +------+---------+
-- | NULL |       1 |
-- +------+---------+`],
        [`<b>Limitations:</b> a strict relation is a set (no duplicates, no order), but SQL tables are bags: duplicates and order need explicit constraints and ORDER BY.`,
            r`CREATE TABLE bag (x INT);                   -- no key: duplicates allowed
INSERT INTO bag VALUES (1),(1);
SELECT COUNT(*) AS n, COUNT(DISTINCT x) AS distinct_n FROM bag;

-- OUTPUT:
-- +---+------------+
-- | n | distinct_n |
-- +---+------------+
-- | 2 |          1 |
-- +---+------------+`],
        `
   Relation (table)          emp(id, name, dept, salary)   <- schema
   Tuple (row)               (1, Asha, IT, 900)
   Attribute (column)        salary : INT                  <- domain
   Operators:  σ select   π project   ⋈ join   ∪ union   − difference
`,
        `Think in sets, not loops: replace row-by-row application logic with joins and aggregates. Design with keys and functional dependencies first (normalisation), then denormalise only where measured read cost justifies it.`
    ),

    'SQL vs MySQL': dd(
        [`<b>SQL</b> (Structured Query Language) is the standard language (ANSI/ISO) for talking to relational databases. <b>MySQL</b> is one product that implements SQL, plus its own extensions. SQL is the language; MySQL is the engine.`,
            r`-- Standard SQL works on any RDBMS
SELECT 1 + 1 AS two;

-- MySQL-specific: administrative extras like SHOW
SHOW DATABASES;

-- OUTPUT (first query):
-- +-----+
-- | two |
-- +-----+
-- |   2 |
-- +-----+`],
        [`Knowing the difference lets you write portable queries and recognise vendor-only features before they lock you in.`,
            r`-- Row limiting differs by vendor
-- MySQL / PostgreSQL : SELECT ... LIMIT 3
-- SQL Server         : SELECT TOP 3 ...
-- Oracle 12c+/ANSI   : SELECT ... FETCH FIRST 3 ROWS ONLY
SELECT n FROM (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) t ORDER BY n LIMIT 3;

-- OUTPUT:
-- +---+
-- | n |
-- +---+
-- | 1 |
-- | 2 |
-- | 3 |
-- +---+`],
        [`In real teams SQL skills transfer across MySQL, PostgreSQL and SQL Server, while administration (backup, replication, config) is product-specific.`,
            r`-- MySQL extension: INSERT ... ON DUPLICATE KEY UPDATE (upsert)
CREATE TABLE hits (page VARCHAR(20) PRIMARY KEY, n INT);
INSERT INTO hits VALUES ('home',1) ON DUPLICATE KEY UPDATE n = n + 1;
INSERT INTO hits VALUES ('home',1) ON DUPLICATE KEY UPDATE n = n + 1;
SELECT * FROM hits;

-- OUTPUT:
-- +------+------+
-- | page | n    |
-- +------+------+
-- | home |    2 |
-- +------+------+`],
        [`<b>Advantages of standard SQL:</b> portable skills and mostly portable queries. <b>Advantages of MySQL:</b> practical extras such as upsert, simple admin and wide hosting.`,
            r`-- Standard ANSI quoting uses double quotes; MySQL defaults to backticks unless told
SET SESSION sql_mode = CONCAT(@@sql_mode, ',ANSI_QUOTES');
SELECT 5 AS "five";                              -- alias in ANSI style

-- OUTPUT:
-- +------+
-- | five |
-- +------+
-- |    5 |
-- +------+`],
        [`<b>Disadvantages:</b> vendor extensions reduce portability; each product also treats edge cases (NULL ordering, case sensitivity, GROUP BY rules) differently.`,
            r`-- Case-sensitivity of table names depends on OS and lower_case_table_names
SHOW VARIABLES LIKE 'lower_case_table_names';

-- OUTPUT (example, Linux default):
-- +------------------------+-------+
-- | Variable_name          | Value |
-- +------------------------+-------+
-- | lower_case_table_names | 0     |
-- +------------------------+-------+`],
        [`<b>Limitations:</b> MySQL historically lacked some standard features (INTERSECT and EXCEPT only from 8.0.31, no FULL OUTER JOIN, no deferred constraints).`,
            r`-- FULL OUTER JOIN is not supported; emulate with UNION of LEFT and RIGHT joins
SELECT a.x FROM (SELECT 1 x) a FULL OUTER JOIN (SELECT 2 x) b ON a.x = b.x;

-- OUTPUT:
-- ERROR 1064 (42000): You have an error in your SQL syntax ... near 'OUTER JOIN'`],
        `
   SQL  (standard language: SELECT, JOIN, GROUP BY ...)
     │ implemented by
     ├── MySQL       (+ ON DUPLICATE KEY, LIMIT, SHOW ...)
     ├── PostgreSQL  (+ RETURNING, arrays ...)
     ├── SQL Server  (T-SQL: TOP, ...)
     └── Oracle      (PL/SQL, FETCH FIRST ...)
`,
        `Write ANSI-leaning SQL for business queries and isolate vendor-specific code (upserts, pagination, JSON) behind a repository layer or documented list. Portability is rarely free, so decide consciously which MySQL extensions are worth the lock-in.`
    ),
};
