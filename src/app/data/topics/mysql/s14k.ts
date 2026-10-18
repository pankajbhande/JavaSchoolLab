// Module 14 (Relationships & Database Design), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s14k: Record<string, DeepDive> = {
    'Designing One-to-Many & Many-to-Many Tables': dd(
        [`In a <b>one-to-many</b> design the foreign key lives on the <i>many</i> side: each employee row stores one <code>dept_id</code>. A <b>many-to-many</b> relationship cannot be stored in either table, so it gets a third table holding one row per pair.`,
            r`-- One department has many employees: FK goes on the "many" side
CREATE TABLE dept (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE emp  (
    id      INT PRIMARY KEY,
    name    VARCHAR(30),
    dept_id INT NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES dept(id)
);
INSERT INTO dept VALUES (1,'IT'),(2,'HR');
INSERT INTO emp  VALUES (10,'Abaji',1),(11,'Raoji',1),(12,'Mina',2);
SELECT d.name AS dept, e.name AS emp FROM dept d JOIN emp e ON e.dept_id = d.id ORDER BY e.id;

-- OUTPUT:
-- +------+-------+
-- | dept | emp   |
-- +------+-------+
-- | IT   | Abaji |
-- | IT   | Raoji |
-- | HR   | Mina  |
-- +------+------+`],
        [`Beginners often store a many-to-many list in one column, such as "10,20". It looks easy but breaks indexing, integrity and querying. The design rule exists to avoid exactly this.`,
            r`-- Anti-pattern: comma list in a column
CREATE TABLE bad_student (id INT PRIMARY KEY, name VARCHAR(20), course_ids VARCHAR(50));
INSERT INTO bad_student VALUES (1,'Abaji','10,20'),(2,'Raoji','20');
SELECT name FROM bad_student WHERE FIND_IN_SET(10, course_ids) > 0;   -- full scan, no FK, no index

-- OUTPUT:
-- +-------+
-- | name  |
-- +-------+
-- | Abaji |
-- +-------+
-- Nothing stops course_ids = '10,999' (course 999 may not exist).`],
        [`Shops model orders (one customer, many orders), order items (one order, many items) and products (many orders contain many products) with the same two patterns.`,
            r`CREATE TABLE product (id INT PRIMARY KEY, name VARCHAR(30), price DECIMAL(8,2));
CREATE TABLE orders  (id INT PRIMARY KEY, placed_on DATE);
CREATE TABLE order_item (                      -- many-to-many orders <-> products
    order_id   INT, product_id INT, qty INT NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);
INSERT INTO product VALUES (7,'Pen',10.00),(8,'Book',50.00);
INSERT INTO orders  VALUES (1,'2026-10-01');
INSERT INTO order_item VALUES (1,7,3),(1,8,1);
SELECT o.id AS order_id, p.name, i.qty, i.qty * p.price AS line_total
FROM orders o JOIN order_item i ON i.order_id = o.id JOIN product p ON p.id = i.product_id;

-- OUTPUT:
-- +----------+------+-----+------------+
-- | order_id | name | qty | line_total |
-- +----------+------+-----+------------+
-- |        1 | Pen  |   3 |      30.00 |
-- |        1 | Book |   1 |      50.00 |
-- +----------+------+-----+------------+`],
        [`<b>Advantages:</b> each fact is stored once, the engine enforces the links, and InnoDB automatically indexes the foreign key column so joins from parent to children are fast.`,
            r`SHOW INDEX FROM emp;                          -- FK column dept_id got an index for free

-- OUTPUT (example, trimmed):
-- +-------+------------+----------+-------------+
-- | Table | Non_unique | Key_name | Column_name |
-- +-------+------------+----------+-------------+
-- | emp   |          0 | PRIMARY  | id          |
-- | emp   |          1 | dept_id  | dept_id     |
-- +-------+------------+----------+-------------+`],
        [`<b>Disadvantages:</b> reads need joins, and joining a parent to its children repeats the parent columns on every row. Aggregating parent values after such a join (fan-out) double counts.`,
            r`ALTER TABLE dept ADD COLUMN budget INT DEFAULT 1000;   -- IT budget 1000, HR 1000
SELECT SUM(d.budget) AS wrong_total               -- budget repeated once per employee
FROM dept d JOIN emp e ON e.dept_id = d.id;
SELECT SUM(budget) AS right_total FROM dept;

-- OUTPUT:
-- +-------------+      +-------------+
-- | wrong_total |      | right_total |
-- +-------------+      +-------------+
-- |        3000 |      |        2000 |
-- +-------------+      +-------------+`],
        [`<b>Limitations:</b> the FK and referenced column must have identical types (and signedness, charset), and both tables must be InnoDB. A mismatch is rejected at DDL time.`,
            r`CREATE TABLE emp2 (
    id INT PRIMARY KEY,
    dept_id BIGINT,                             -- parent id is INT
    CONSTRAINT fk_e2 FOREIGN KEY (dept_id) REFERENCES dept(id)
);

-- OUTPUT:
-- ERROR 3780 (HY000): Referencing column 'dept_id' and referenced column 'id' in
-- foreign key constraint 'fk_e2' are incompatible.`],
        `
   One-to-many                       Many-to-many
   dept (1) ───────< emp (N)         student (N) >──── enrol ────< course (M)
   ┌────┐            ┌────┬─────┐       ┌────┐   ┌──────────┬─────────┐   ┌────┐
   │ id │◄───────────│dept│ ... │       │ id │◄──│student_id│course_id│──►│ id │
   └────┘   FK on    └────┴─────┘       └────┘   └──────────┴─────────┘   └────┘
            many side                        two 1:N links + composite PK
`,
        `Model first in terms of cardinality questions: can one X have many Y, and can one Y have many X? Always put the FK on the child, make it NOT NULL when the relationship is mandatory, and promote any M:N to a table the moment it needs its own attributes (date, status, quantity). Resist storing lists in a column; JSON is acceptable for opaque, never-joined data only.`
    ),

    'Junction (Bridge) Tables': dd(
        [`A <b>junction table</b> (bridge, link or associative table) resolves a many-to-many relationship. It holds one row per pair, with a foreign key to each side, usually a composite primary key made of both, and optionally extra columns that describe the pair itself.`,
            r`CREATE TABLE student (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE course  (id INT PRIMARY KEY, title VARCHAR(30));
CREATE TABLE enrolment (
    student_id INT,
    course_id  INT,
    PRIMARY KEY (student_id, course_id),         -- each pair at most once
    CONSTRAINT fk_enr_student FOREIGN KEY (student_id) REFERENCES student(id),
    CONSTRAINT fk_enr_course  FOREIGN KEY (course_id)  REFERENCES course(id)
);
INSERT INTO student VALUES (1,'Abaji'),(2,'Raoji');
INSERT INTO course  VALUES (100,'SQL'),(101,'Java');
INSERT INTO enrolment VALUES (1,100),(1,101),(2,100);
SELECT s.name, c.title FROM student s
JOIN enrolment e ON e.student_id = s.id JOIN course c ON c.id = e.course_id
ORDER BY s.id, c.id;

-- OUTPUT:
-- +-------+-------+
-- | name  | title |
-- +-------+-------+
-- | Abaji | SQL   |
-- | Abaji | Java  |
-- | Raoji | SQL   |
-- +------+-------+`],
        [`Real relationships have properties: when did the student enrol, what grade did they get, what is the line quantity? Those facts belong to the pair, so they need a place in the bridge table, not in either parent.`,
            r`ALTER TABLE enrolment
    ADD COLUMN enrolled_on DATE DEFAULT (CURRENT_DATE),   -- facts about the pair
    ADD COLUMN grade       CHAR(1) NULL;
UPDATE enrolment SET grade = 'A' WHERE student_id = 1 AND course_id = 100;
SELECT student_id, course_id, grade FROM enrolment ORDER BY student_id, course_id;

-- OUTPUT:
-- +------------+-----------+-------+
-- | student_id | course_id | grade |
-- +------------+-----------+-------+
-- |          1 |       100 | A     |
-- |          1 |       101 | NULL  |
-- |          2 |       100 | NULL  |
-- +------------+-----------+-------+`],
        [`Tags on posts, roles for users, products in carts, actors in films and permissions on roles are all junction tables. A report typically collapses the bridge rows back into a list.`,
            r`SELECT s.name, GROUP_CONCAT(c.title ORDER BY c.title) AS courses
FROM student s
JOIN enrolment e ON e.student_id = s.id
JOIN course c    ON c.id = e.course_id
GROUP BY s.id, s.name
ORDER BY s.id;

-- OUTPUT:
-- +-------+----------+
-- | name  | courses  |
-- +-------+----------+
-- | Abaji | Java,SQL |
-- | Raoji | SQL      |
-- +------+-----------+`],
        [`<b>Advantages:</b> the composite PK makes duplicate pairs impossible, and FKs guarantee both sides exist. Either side can be queried and either can change independently.`,
            r`INSERT INTO enrolment (student_id, course_id) VALUES (1,100);   -- same pair twice

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-100' for key 'enrolment.PRIMARY'`],
        [`<b>Disadvantages:</b> more tables, more joins, and more indexes. The PK (student_id, course_id) only serves lookups that start with student_id, so InnoDB adds a second index for course_id, which every insert must also maintain.`,
            r`SHOW INDEX FROM enrolment;

-- OUTPUT (example, trimmed):
-- +-----------+------------+----------------+--------------+-------------+
-- | Table     | Non_unique | Key_name       | Seq_in_index | Column_name |
-- +-----------+------------+----------------+--------------+-------------+
-- | enrolment |          0 | PRIMARY        |            1 | student_id  |
-- | enrolment |          0 | PRIMARY        |            2 | course_id   |
-- | enrolment |          1 | fk_enr_course  |            1 | course_id   |
-- +-----------+------------+----------------+--------------+-------------+`],
        [`<b>Limitations:</b> a bridge row can exist only when both parents exist, so you cannot record a pair first and the entity later; and MySQL has no native many-to-many type, so every query pays the join.`,
            r`INSERT INTO enrolment (student_id, course_id) VALUES (1, 999);   -- course 999 does not exist

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails
-- (school.enrolment, CONSTRAINT fk_enr_course FOREIGN KEY (course_id) REFERENCES course (id))`],
        `
   student                enrolment                   course
   ┌────┬───────┐    ┌────────────┬───────────┬───────┐     ┌─────┬───────┐
   │  1 │ Abaji │◄───│     1      │    100    │ grade │────►│ 100 │ SQL   │
   │  2 │ Raoji │◄┐  │     1      │    101    │ ...   │──┐  │ 101 │ Java  │
   └────┘         │  │     2      │    100    │       │  │  └─────┴───────┘
                  └──│            PK(student_id, course_id)  │
                     └────────────┴───────────┴───────┘     (two FKs, one per side)
`,
        `Decide the bridge PK deliberately: a composite PK is compact and prevents duplicates, but if other tables must reference a single enrolment row, add a surrogate id and keep a UNIQUE (student_id, course_id). Index both directions, and order the composite so the more frequent lookup side comes first. If the bridge grows to billions of rows, partitioning or sharding by one side becomes a design topic.`
    ),

    'Referential Integrity': dd(
        [`<b>Referential integrity</b> means every foreign key value either is NULL or points to an existing row in the parent table. InnoDB enforces it for you on every INSERT, UPDATE and DELETE that touches a foreign key.`,
            r`CREATE TABLE customer (id INT PRIMARY KEY, name VARCHAR(30));
CREATE TABLE orders (
    id          INT PRIMARY KEY,
    customer_id INT,
    CONSTRAINT fk_ord_cust FOREIGN KEY (customer_id) REFERENCES customer(id)
);
INSERT INTO customer VALUES (1,'Abaji');
INSERT INTO orders   VALUES (100,1);             -- ok: customer 1 exists
INSERT INTO orders   VALUES (101,42);            -- orphan attempt

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails
-- (shop.orders, CONSTRAINT fk_ord_cust FOREIGN KEY (customer_id) REFERENCES customer (id))`],
        [`Without enforcement, bugs, manual fixes and race conditions create orphan rows (orders for deleted customers) that make reports wrong and joins silently drop data.`,
            r`-- Same tables but WITHOUT an FK: the orphan is accepted
CREATE TABLE orders_nofk (id INT PRIMARY KEY, customer_id INT);
INSERT INTO orders_nofk VALUES (100,1),(101,42);

-- Orphan hunt: children with no parent
SELECT o.id, o.customer_id
FROM orders_nofk o LEFT JOIN customer c ON c.id = o.customer_id
WHERE c.id IS NULL;

-- OUTPUT:
-- +-----+-------------+
-- | id  | customer_id |
-- +-----+-------------+
-- | 101 |          42 |
-- +-----+-------------+`],
        [`Operations teams inspect the declared rules from the catalog, and DBAs audit them before migrations. The delete and update rule shows what happens to children.`,
            r`SELECT constraint_name, table_name, referenced_table_name, update_rule, delete_rule
FROM information_schema.referential_constraints
WHERE constraint_schema = DATABASE();

-- OUTPUT (example):
-- +--------------+------------+-----------------------+-------------+-------------+
-- | CONSTRAINT_NAME | TABLE_NAME | REFERENCED_TABLE_NAME | UPDATE_RULE | DELETE_RULE |
-- +--------------+------------+-----------------------+-------------+-------------+
-- | fk_ord_cust  | orders     | customer              | NO ACTION   | NO ACTION   |
-- +--------------+------------+-----------------------+-------------+-------------+`],
        [`<b>Advantages:</b> the guarantee lives in one place for every client, and a nullable FK models an optional relationship: NULL means "no parent", and is always allowed.`,
            r`INSERT INTO orders VALUES (102, NULL);          -- guest order, no customer: allowed
SELECT id, customer_id FROM orders ORDER BY id;

-- And the parent is protected too:
DELETE FROM customer WHERE id = 1;                -- order 100 still points at it

-- OUTPUT:
-- +-----+-------------+
-- | id  | customer_id |
-- +-----+-------------+
-- | 100 |           1 |
-- | 102 |        NULL |
-- +-----+-------------+
-- ERROR 1451 (23000): Cannot delete or update a parent row: a foreign key constraint fails`],
        [`<b>Disadvantages:</b> every write checks the other table, and locks the parent row it references. Bulk loads are therefore often done with checks turned off, which can quietly let orphans in.`,
            r`SET foreign_key_checks = 0;                      -- session-level switch, used by dump/restore
INSERT INTO orders VALUES (103, 777);             -- no error, 777 does not exist
SET foreign_key_checks = 1;                       -- constraint is NOT re-verified
SELECT COUNT(*) AS orphans FROM orders o
LEFT JOIN customer c ON c.id = o.customer_id
WHERE o.customer_id IS NOT NULL AND c.id IS NULL;

-- OUTPUT:
-- +---------+
-- | orphans |
-- +---------+
-- |       1 |
-- +---------+`],
        [`<b>Limitations:</b> InnoDB checks each row immediately (no DEFERRABLE constraints like PostgreSQL), so a single statement that inserts a child before its parent fails even if the parent is in the same statement. FKs are also not supported on partitioned tables.`,
            r`CREATE TABLE person (
    id INT PRIMARY KEY, name VARCHAR(20), boss_id INT,
    FOREIGN KEY (boss_id) REFERENCES person(id)
);
INSERT INTO person VALUES (2,'Kid',1),(1,'Boss',NULL);   -- child row is checked first

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails
-- Fix: insert (1,'Boss',NULL) first, or insert in two statements.`],
        `
   parent: customer                 child: orders
   ┌────┬───────┐                   ┌─────┬─────────────┐
   │  1 │ Abaji │◄──────────────────│ 100 │      1      │  valid
   └────┴───────┘                   │ 102 │    NULL     │  valid (optional)
                       X───────────│ 101 │     42      │  REJECTED 1452
   DELETE parent 1 while 100 exists ──► REJECTED 1451 (RESTRICT/NO ACTION)
`,
        `Keep FKs in transactional schemas; they are cheap compared with the cost of one corrupted ledger. If you must drop them (huge sharded systems, online migration tools), replace them with automated orphan-detection jobs and make that a monitored invariant. After any foreign_key_checks=0 load, run the orphan query before re-opening the system.`
    ),

    'Cascading Operations': dd(
        [`A foreign key can declare what happens to child rows when the parent is deleted or its key changes: <code>ON DELETE</code> / <code>ON UPDATE</code> with <b>CASCADE</b> (apply the same change to children), <b>SET NULL</b>, <b>RESTRICT</b> or <b>NO ACTION</b> (block the change, the default).`,
            r`CREATE TABLE author (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE book (
    id INT PRIMARY KEY, title VARCHAR(30), author_id INT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
);
INSERT INTO author VALUES (1,'Tagore'),(2,'Rao');
INSERT INTO book   VALUES (10,'Gitanjali',1),(11,'Gora',1),(12,'Maya',2);
DELETE FROM author WHERE id = 1;                  -- his books go with him
SELECT id, title FROM book;

-- OUTPUT:
-- +----+-------+
-- | id | title |
-- +----+-------+
-- | 12 | Maya  |
-- +----+-------+`],
        [`Different relationships need different behaviour. Order lines should vanish with their order (CASCADE); a ticket should survive its assignee leaving (SET NULL); an invoice must block deleting its customer (RESTRICT).`,
            r`CREATE TABLE staff  (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE ticket (
    id INT PRIMARY KEY, subject VARCHAR(30), assignee_id INT NULL,
    FOREIGN KEY (assignee_id) REFERENCES staff(id) ON DELETE SET NULL
);
INSERT INTO staff  VALUES (1,'Abaji');
INSERT INTO ticket VALUES (500,'Printer down',1);
DELETE FROM staff WHERE id = 1;
SELECT * FROM ticket;

-- OUTPUT:
-- +-----+--------------+-------------+
-- | id  | subject      | assignee_id |
-- +-----+--------------+-------------+
-- | 500 | Printer down | NULL        |
-- +-----+--------------+-------------+`],
        [`ON UPDATE CASCADE is used when a referenced key legitimately changes, for example a code like a department code or a username that is the join key. The change ripples to every child in the same statement.`,
            r`CREATE TABLE country (code CHAR(2) PRIMARY KEY, name VARCHAR(20));
CREATE TABLE city (
    id INT PRIMARY KEY, name VARCHAR(20), country_code CHAR(2),
    FOREIGN KEY (country_code) REFERENCES country(code) ON UPDATE CASCADE
);
INSERT INTO country VALUES ('UK','United Kingdom');
INSERT INTO city    VALUES (1,'London','UK');
UPDATE country SET code = 'GB' WHERE code = 'UK';
SELECT * FROM city;

-- OUTPUT:
-- +----+--------+--------------+
-- | id | name   | country_code |
-- +----+--------+--------------+
-- |  1 | London | GB           |
-- +----+--------+--------------+`],
        [`<b>Advantages:</b> one statement keeps a whole object graph consistent, with no application code, no multi-step cleanup and no chance of forgetting a child table.`,
            r`-- Order with lines: removing the order removes its lines atomically
CREATE TABLE ord  (id INT PRIMARY KEY);
CREATE TABLE line (id INT PRIMARY KEY, ord_id INT,
    FOREIGN KEY (ord_id) REFERENCES ord(id) ON DELETE CASCADE);
INSERT INTO ord  VALUES (1);
INSERT INTO line VALUES (1,1),(2,1),(3,1);
DELETE FROM ord WHERE id = 1;
SELECT COUNT(*) AS lines_left FROM line;

-- OUTPUT:
-- Query OK, 1 row affected                       (cascaded rows are not counted)
-- +------------+
-- | lines_left |
-- +------------+
-- |          0 |
-- +------------+`],
        [`<b>Disadvantages:</b> cascades are powerful and silent: one wrong DELETE on a parent can wipe thousands of child rows across several tables with no warning, and the cascade can hold locks for a long time on large trees. Cascaded changes also do not fire triggers in InnoDB, so audit triggers miss them.`,
            r`-- A customer is deleted by mistake; every order disappears with no error
CREATE TABLE cust (id INT PRIMARY KEY);
CREATE TABLE cord (id INT PRIMARY KEY, cust_id INT,
    FOREIGN KEY (cust_id) REFERENCES cust(id) ON DELETE CASCADE);
INSERT INTO cust VALUES (1);
INSERT INTO cord VALUES (1,1),(2,1),(3,1);
DELETE FROM cust WHERE id = 1;
SELECT COUNT(*) AS orders_left FROM cord;

-- OUTPUT:
-- +-------------+
-- | orders_left |
-- +-------------+
-- |           0 |
-- +-------------+`],
        [`<b>Limitations:</b> InnoDB rejects ON DELETE/UPDATE SET DEFAULT (it is parsed but not supported), cascades stop at a depth of 15 levels, and SET NULL needs a nullable child column.`,
            r`CREATE TABLE p (id INT PRIMARY KEY);
CREATE TABLE c (id INT PRIMARY KEY, p_id INT DEFAULT 0,
    FOREIGN KEY (p_id) REFERENCES p(id) ON DELETE SET DEFAULT);

-- OUTPUT (example):
-- ERROR 1215 (HY000): Cannot add foreign key constraint

CREATE TABLE c2 (id INT PRIMARY KEY, p_id INT NOT NULL,
    FOREIGN KEY (p_id) REFERENCES p(id) ON DELETE SET NULL);   -- SET NULL on NOT NULL column

-- OUTPUT (example):
-- ERROR 1830 (HY000): Column 'p_id' cannot be NOT NULL: needed in a foreign key constraint
-- 'c2_ibfk_1' SET NULL`],
        `
   DELETE author 1
        │
        ▼
   author ──► book (FK ON DELETE ...)
                 ├─ CASCADE   : child rows deleted too
                 ├─ SET NULL  : child FK becomes NULL
                 └─ RESTRICT / NO ACTION : delete refused (default)

   ON UPDATE CASCADE : change parent key  ──► children follow
`,
        `Use CASCADE only for true ownership (composition): order lines, post comments, session rows. Use RESTRICT for reference data and financial records, and prefer soft deletes (a deleted_at column) for anything that is legally or historically important. Because cascades skip triggers and can lock large ranges, delete big trees in batches from the application instead.`
    ),
};
