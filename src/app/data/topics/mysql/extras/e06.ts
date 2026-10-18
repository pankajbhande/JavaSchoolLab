// Modules 14-16 (Database Design, Normalization, Keys) extras.
import { x, r, type Extra } from './extra';

export const e06: Record<string, Extra> = {
    'Designing One-to-One Tables': x(
        ['One-to-one means a row in A matches at most one row in B. Make the child foreign key UNIQUE, or use it as the primary key.',
            'Use it for optional extra data (profile), large rarely used columns or sensitive data.',
            'Read both sides with a JOIN (LEFT JOIN when the child is optional).'],
        ['Shared primary key: child PK = parent id. It is compact and guarantees one row per parent.',
            'Separate surrogate key plus UNIQUE FK is flexible if the relation may later become one-to-many.',
            'Create both rows in one transaction.'],
        ['Split for a measurable reason: hot/cold columns, security boundary or subtype data; otherwise merge into one table.',
            'MySQL cannot force that the child must exist; enforce with transactions or application rules.',
            'ORMs: JPA <code>@OneToOne @MapsId</code> maps the shared primary key.'],
        [['F', 'How do you create a one-to-one relationship?', 'Foreign key in the child that is also UNIQUE (or the child primary key).'],
            ['F', 'Give an example.', 'User and user_profile, person and passport.'],
            ['M', 'Shared PK vs UNIQUE FK?', 'Shared PK is simplest and structurally one-to-one; UNIQUE FK allows its own id and later flexibility.'],
            ['M', 'How do you list parents without a child?', 'LEFT JOIN child and filter <code>child.parent_id IS NULL</code>.'],
            ['S', 'Why split instead of one wide table?', 'To keep the hot table small, isolate sensitive columns with separate privileges, or model optional subtype data.'],
            ['S', 'Can the DB enforce that a child must exist?', 'Not with plain constraints; use application logic, triggers or merge the tables.']],
        [['Create one-to-one with shared PK.',
            r`CREATE TABLE accounts (id INT PRIMARY KEY, owner VARCHAR(30));
CREATE TABLE account_settings (account_id INT PRIMARY KEY, theme VARCHAR(10), FOREIGN KEY (account_id) REFERENCES accounts(id));
INSERT INTO accounts VALUES (1,'Abaji');
INSERT INTO account_settings VALUES (1,'dark');
SELECT a.owner, s.theme FROM accounts a JOIN account_settings s ON s.account_id = a.id;

-- OUTPUT:
-- owner | theme
-- Abaji | dark`],
            ['Second settings row is rejected.',
                r`INSERT INTO account_settings VALUES (1,'light');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'account_settings.PRIMARY'`]],
        [['Optional child with LEFT JOIN.',
            r`SELECT a.owner, COALESCE(s.theme,'default') AS theme FROM accounts a LEFT JOIN account_settings s ON s.account_id = a.id;

-- OUTPUT:
-- owner | theme
-- Abaji | dark`],
            ['Atomic creation.',
                r`START TRANSACTION;
INSERT INTO accounts VALUES (2,'Raoji');
INSERT INTO account_settings VALUES (2,'light');
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`]]
    ),

    'Designing One-to-Many & Many-to-Many Tables': x(
        ['One-to-many: the child table has a foreign key to the parent. Many-to-many: add a junction table with two foreign keys.',
            'Index every foreign key column.',
            'Name keys clearly (<code>customer_id</code>, <code>order_id</code>).'],
        ['Choose ON DELETE rules by ownership: CASCADE for owned children (order lines), RESTRICT for independent entities.',
            'Junction tables use a composite primary key (a_id, b_id), plus a reverse index (b_id, a_id).',
            'Put relationship attributes (quantity, role, date) in the junction table.'],
        ['When a junction table has its own lifecycle (order_items with price at purchase), give it a surrogate key and treat it as an entity.',
            'Snapshot values that must not change later (price at purchase, address at shipping) instead of joining to current data.',
            'Plan growth: the junction table is usually the largest table; keep its columns narrow.'],
        [['F', 'How do you design one-to-many?', 'Put the parent id as a foreign key in the child table.'],
            ['F', 'How do you design many-to-many?', 'Create a junction table with foreign keys to both tables.'],
            ['M', 'Where does an attribute like quantity belong?', 'In the junction table, because it describes the link.'],
            ['M', 'CASCADE or RESTRICT?', 'CASCADE when children cannot exist without the parent (order items); RESTRICT when deletion should be deliberate.'],
            ['S', 'Why store price in order_items instead of reading products.price?', 'Prices change; the order must keep the price at purchase time for correct history and audit.'],
            ['S', 'How do you make junction lookups fast in both directions?', 'Composite PK (a,b) for A to B and a secondary index (b,a) for B to A.']],
        [['Orders and items design.',
            r`CREATE TABLE orders (id INT PRIMARY KEY AUTO_INCREMENT, customer_id INT NOT NULL, placed_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(30), price DECIMAL(8,2));
CREATE TABLE order_items (order_id INT, product_id INT, qty INT NOT NULL, unit_price DECIMAL(8,2) NOT NULL,
  PRIMARY KEY (order_id, product_id), INDEX idx_prod (product_id, order_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, FOREIGN KEY (product_id) REFERENCES products(id));
SHOW INDEX FROM order_items;

-- OUTPUT: (trimmed)
-- Key_name | Column_name
-- PRIMARY  | order_id
-- PRIMARY  | product_id
-- idx_prod | product_id
-- idx_prod | order_id`],
            ['Order total from snapshot prices.',
                r`SELECT order_id, SUM(qty * unit_price) AS total FROM order_items GROUP BY order_id;

-- OUTPUT:
-- order_id | total
--        1 | 900.00`]],
        [['Cascade delete of owned children.',
            r`DELETE FROM orders WHERE id = 1;
SELECT COUNT(*) FROM order_items WHERE order_id = 1;

-- OUTPUT:
-- COUNT(*)
-- 0`],
            ['Reverse lookup uses the second index.',
                r`EXPLAIN SELECT order_id FROM order_items WHERE product_id = 7;

-- OUTPUT: (example)
-- type | key      | Extra
-- ref  | idx_prod | Using index`]]
    ),

    'Junction (Bridge) Tables': x(
        ['A junction (bridge, link) table resolves a many-to-many relationship into two one-to-many relationships.',
            'It contains the primary keys of both tables as foreign keys.',
            'Example: student_courses(student_id, course_id).'],
        ['Composite PK prevents duplicate links; add extra columns for link data (enrolled_on, role, status).',
            'Index both directions.',
            'Query through it with two joins.'],
        ['If the link is referenced by other tables or has many attributes, promote it to an entity with its own id.',
            'Large junction tables dominate size; use compact key types and consider partitioning by time.',
            'Soft-deleting links needs a unique rule such as unique on (a_id, b_id, active_flag).'],
        [['F', 'What is a junction table?', 'A table that links two tables in a many-to-many relationship by storing both keys.'],
            ['F', 'What is its primary key?', 'Usually the pair of foreign keys.'],
            ['M', 'Why index both directions?', 'Queries go A to B and B to A; the composite PK covers one direction, a reverse index covers the other.'],
            ['M', 'Where do relationship attributes go?', 'As columns of the junction table.'],
            ['S', 'When give a junction table its own surrogate id?', 'When other tables reference link rows or the same pair can repeat over time (history).'],
            ['S', 'How to keep history of links?', 'Add valid_from/valid_to (temporal link) and allow only one open row per pair.']],
        [['Users and roles.',
            r`CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE roles (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE user_roles (user_id INT, role_id INT, granted_on DATE, PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (role_id) REFERENCES roles(id));
INSERT INTO users VALUES (1,'Abaji'); INSERT INTO roles VALUES (1,'ADMIN'),(2,'EDITOR');
INSERT INTO user_roles VALUES (1,1,'2026-01-01'),(1,2,'2026-01-02');
SELECT u.name, r.name AS role FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id;

-- OUTPUT:
-- name  | role
-- Abaji | ADMIN
-- Abaji | EDITOR`],
            ['Users having both roles.',
                r`SELECT user_id FROM user_roles WHERE role_id IN (1,2) GROUP BY user_id HAVING COUNT(DISTINCT role_id) = 2;

-- OUTPUT:
-- user_id
-- 1`]],
        [['Temporal link table.',
            r`CREATE TABLE membership (user_id INT, team_id INT, valid_from DATE, valid_to DATE NULL, PRIMARY KEY (user_id, team_id, valid_from));
SELECT user_id FROM membership WHERE team_id = 5 AND valid_to IS NULL;

-- OUTPUT:
-- user_id
-- 1`],
            ['Duplicate link rejected.',
                r`INSERT INTO user_roles VALUES (1,1,'2026-02-01');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-1' for key 'user_roles.PRIMARY'`]]
    ),

    'Referential Integrity': x(
        ['Referential integrity means every foreign key value must match an existing primary key in the parent (or be NULL).',
            'It prevents orphan rows: orders without customers.',
            'InnoDB enforces it through foreign key constraints.'],
        ['Actions on parent change: RESTRICT/NO ACTION (block), CASCADE (propagate), SET NULL.',
            'FK checks can be disabled for loads with <code>SET foreign_key_checks = 0</code>; re-enable and validate afterwards.',
            'The child column and parent key must have matching types and be indexed.'],
        ['Without FKs, integrity depends on every code path; add reconciliation jobs that find orphans.',
            'Orphan detection query: LEFT JOIN parent WHERE parent.id IS NULL.',
            'In sharded or cross-service data, referential integrity becomes eventual: use ids, outbox events and periodic audits.'],
        [['F', 'What is referential integrity?', 'The guarantee that foreign keys always point to existing parent rows.'],
            ['F', 'What are orphan rows?', 'Child rows whose parent no longer exists.'],
            ['M', 'How do you temporarily bypass FK checks for a bulk load?', '<code>SET foreign_key_checks = 0;</code>, load, then set it back to 1 and verify data.'],
            ['M', 'How do you find orphans?', 'LEFT JOIN child to parent and filter for NULL parent.'],
            ['S', 'How do you keep integrity across microservices?', 'Reference by id, validate through APIs/events, use idempotent consumers and periodic reconciliation.'],
            ['S', 'What cost do FKs add?', 'Extra index lookups and locks on parent rows for every child write, which can contend on hot parents.']],
        [['Block orphan insert and parent delete.',
            r`CREATE TABLE p (id INT PRIMARY KEY) ENGINE=InnoDB;
CREATE TABLE c (id INT PRIMARY KEY, p_id INT, FOREIGN KEY (p_id) REFERENCES p(id)) ENGINE=InnoDB;
INSERT INTO c VALUES (1, 99);

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails`],
            ['Find orphans in an unconstrained table.',
                r`SELECT o.id FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL;

-- OUTPUT:
-- id
-- 42`]],
        [['Disable and re-enable checks.',
            r`SET foreign_key_checks = 0;
INSERT INTO c VALUES (2, 77);
SET foreign_key_checks = 1;
SELECT c.id FROM c LEFT JOIN p ON p.id = c.p_id WHERE p.id IS NULL;

-- OUTPUT:
-- id
-- 2`],
            ['Inspect the constraint rules.',
                r`SELECT constraint_name, update_rule, delete_rule FROM information_schema.referential_constraints WHERE constraint_schema = DATABASE();

-- OUTPUT:
-- constraint_name | update_rule | delete_rule
-- c_ibfk_1        | NO ACTION   | NO ACTION`]]
    ),

    'Cascading Operations': x(
        ['Cascading means a change in the parent is applied to children automatically: <code>ON DELETE CASCADE</code>, <code>ON UPDATE CASCADE</code>.',
            'Other actions: SET NULL, RESTRICT, NO ACTION.',
            'CASCADE deletes dependent rows without extra code.'],
        ['Use CASCADE only for true ownership (order → order_items). For independent data prefer RESTRICT.',
            'Cascades do not fire triggers on child rows in InnoDB for the cascaded action.',
            'Updating primary keys with ON UPDATE CASCADE is rare; avoid changing keys.'],
        ['A cascade can delete millions of rows in one transaction, growing undo, locking and lagging replicas; use batched deletes or soft delete for big trees.',
            'Cascade chains across many tables are hard to reason about and audit.',
            'Binlog contains only the parent delete in statement format; row format logs affected rows, which is also why large cascades inflate it.'],
        [['F', 'What does ON DELETE CASCADE do?', 'Deletes child rows automatically when the parent is deleted.'],
            ['F', 'What does ON DELETE SET NULL do?', 'Sets the child foreign key to NULL when the parent is deleted.'],
            ['M', 'Do cascaded deletes fire triggers?', 'In InnoDB, actions caused by foreign key cascades do not activate triggers on the child table.'],
            ['M', 'When avoid CASCADE?', 'When the data has independent value, audit needs, or children are huge in number.'],
            ['S', 'How to delete a very large customer safely?', 'Soft delete first, then purge children in batches by primary key range outside peak hours.'],
            ['S', 'Why do big cascades hurt replication?', 'One transaction produces a huge binlog event and a long apply on replicas, increasing lag.']],
        [['Cascade demo.',
            r`CREATE TABLE blog (id INT PRIMARY KEY);
CREATE TABLE comment (id INT PRIMARY KEY, blog_id INT, FOREIGN KEY (blog_id) REFERENCES blog(id) ON DELETE CASCADE);
INSERT INTO blog VALUES (1); INSERT INTO comment VALUES (1,1),(2,1);
DELETE FROM blog WHERE id = 1;
SELECT COUNT(*) FROM comment;

-- OUTPUT:
-- COUNT(*)
-- 0`],
            ['SET NULL demo.',
                r`CREATE TABLE note (id INT PRIMARY KEY, blog_id INT NULL, FOREIGN KEY (blog_id) REFERENCES blog(id) ON DELETE SET NULL);
INSERT INTO blog VALUES (2); INSERT INTO note VALUES (1,2);
DELETE FROM blog WHERE id = 2;
SELECT blog_id FROM note;

-- OUTPUT:
-- blog_id
-- NULL`]],
        [['Batched purge instead of one huge cascade.',
            r`DELETE FROM comment WHERE blog_id = 1 LIMIT 1000;
-- repeat until 0 rows, then:
DELETE FROM blog WHERE id = 1;

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Soft-delete pattern.',
                r`UPDATE blog SET deleted_at = NOW() WHERE id = 1;
SELECT id FROM blog WHERE deleted_at IS NULL;

-- OUTPUT:
-- Empty set`]]
    ),

    'Data Redundancy & Functional Dependency': x(
        ['Data redundancy means the same fact is stored in several places, such as a customer’s address repeated on every order.',
            'It causes anomalies: update (change in some places only), insert and delete anomalies.',
            'A functional dependency A → B means A determines B (employee_id → name).'],
        ['Find dependencies to find bad design: if city depends on zip and zip is not the key, then city should live in a zip table.',
            'Keys are attributes that functionally determine all others.',
            'Normalization removes redundancy by decomposing tables along dependencies.'],
        ['Not all redundancy is bad: deliberate duplication for performance or history (price at order time) is fine when documented and controlled.',
            'Redundancy shows up as inconsistent reports; build reconciliation queries to detect it.',
            'Functional dependencies are business rules; confirm them with domain experts, not only data samples.'],
        [['F', 'What is data redundancy?', 'Storing the same data in multiple places.'],
            ['F', 'What problems does it cause?', 'Update, insert and delete anomalies and wasted space.'],
            ['M', 'What is a functional dependency?', 'A relationship where one set of attributes determines another (A → B).'],
            ['M', 'Give an update anomaly example.', 'Changing a customer’s phone in one order row but not others leaves conflicting values.'],
            ['S', 'Is all redundancy bad?', 'No; snapshots (price at purchase) and read-optimized copies are legitimate if updated through a controlled path.'],
            ['S', 'How can data reveal dependency violations?', 'GROUP BY the determinant and check COUNT(DISTINCT dependent) &gt; 1.']],
        [['Redundant design.',
            r`CREATE TABLE orders_flat (order_id INT, customer VARCHAR(20), customer_city VARCHAR(20), item VARCHAR(20));
INSERT INTO orders_flat VALUES (1,'Abaji','Pune','Pen'),(2,'Abaji','Pune','Book'),(3,'Abaji','Delhi','Bag');
SELECT customer, COUNT(DISTINCT customer_city) AS cities FROM orders_flat GROUP BY customer;

-- OUTPUT:
-- customer | cities
-- Abaji    | 2        (inconsistent: city depends on customer)`],
            ['Fix with a separate table.',
                r`CREATE TABLE customers_n (name VARCHAR(20) PRIMARY KEY, city VARCHAR(20));
INSERT INTO customers_n VALUES ('Abaji','Pune');
SELECT * FROM customers_n;

-- OUTPUT:
-- name  | city
-- Abaji | Pune`]],
        [['Detect a violated dependency.',
            r`SELECT customer FROM orders_flat GROUP BY customer HAVING COUNT(DISTINCT customer_city) > 1;

-- OUTPUT:
-- customer
-- Abaji`],
            ['Deliberate snapshot is fine.',
                r`SELECT oi.product_id, oi.unit_price AS price_when_ordered, p.price AS price_now FROM order_items oi JOIN products p ON p.id = oi.product_id;

-- OUTPUT:
-- product_id | price_when_ordered | price_now
--          1 |             100.00 |    120.00`]]
    ),

    '1NF': x(
        ['First Normal Form: every column holds a single atomic value, there are no repeating groups, and each row is unique.',
            'Bad: <code>phones = "999,888"</code> in one cell. Good: one row per phone in a child table.',
            'A primary key identifies each row.'],
        ['Comma-separated lists, repeating columns (phone1, phone2, phone3) and arrays violate 1NF.',
            'They break searching, indexing, constraints and joins.',
            'JSON columns are acceptable for truly opaque payloads, not for data you filter and join on.'],
        ['1NF violations show up as <code>FIND_IN_SET</code>, <code>LIKE "%,5,%"</code> and sprawling columns; refactor to child tables.',
            'Migrate safely: create the child table, backfill by splitting values, switch the app, drop the old column.',
            'Atomicity is contextual: a full address may be atomic for shipping labels but not for city-level analytics.'],
        [['F', 'What is 1NF?', 'Each column holds atomic values, no repeating groups and rows are unique.'],
            ['F', 'Is a comma-separated phone list in 1NF?', 'No, it must be split into separate rows.'],
            ['M', 'Why are repeated columns (phone1, phone2) bad?', 'Fixed limit, many NULLs, awkward queries and no easy constraints.'],
            ['M', 'Are JSON columns a 1NF violation?', 'They can be if you store queryable relational data in them; fine for flexible payloads.'],
            ['S', 'How to migrate a CSV column into rows?', 'Use a numbers table or JSON_TABLE to explode values into a child table, then drop the column.'],
            ['S', 'Why does FIND_IN_SET signal a design problem?', 'It cannot use indexes and means a list was stored in one column instead of a relationship.']],
        [['Violating 1NF and the query pain.',
            r`CREATE TABLE contacts_bad (id INT, phones VARCHAR(50));
INSERT INTO contacts_bad VALUES (1,'999,888'),(2,'777');
SELECT id FROM contacts_bad WHERE FIND_IN_SET('888', phones);

-- OUTPUT:
-- id
-- 1`],
            ['1NF design.',
                r`CREATE TABLE contact_phones (contact_id INT, phone VARCHAR(15), PRIMARY KEY (contact_id, phone));
INSERT INTO contact_phones VALUES (1,'999'),(1,'888'),(2,'777');
SELECT contact_id FROM contact_phones WHERE phone = '888';

-- OUTPUT:
-- contact_id
-- 1`]],
        [['Explode the CSV into rows with JSON_TABLE.',
            r`SELECT c.id, jt.phone FROM contacts_bad c,
JSON_TABLE(CONCAT('["', REPLACE(c.phones, ',', '","'), '"]'), '$[*]' COLUMNS (phone VARCHAR(15) PATH '$')) jt;

-- OUTPUT:
-- id | phone
--  1 | 999
--  1 | 888
--  2 | 777`],
            ['Count phones per contact.',
                r`SELECT contact_id, COUNT(*) AS n FROM contact_phones GROUP BY contact_id;

-- OUTPUT:
-- contact_id | n
--          1 | 2
--          2 | 1`]]
    ),

    '2NF': x(
        ['Second Normal Form: the table is in 1NF and no non-key column depends on only part of a composite key.',
            'It matters only for composite keys.',
            'Example: in order_items(order_id, product_id, product_name), product_name depends only on product_id.'],
        ['Fix by moving partial dependencies to their own table: products(product_id, product_name).',
            'Tables with a single-column primary key are automatically in 2NF if in 1NF.',
            'Look for columns that repeat for each value of part of the key.'],
        ['Partial dependencies cause update anomalies in large link tables where one product name is repeated millions of times.',
            'Keep a deliberate snapshot (unit_price at order time) distinct from a partial dependency (product name that should follow the product).',
            'Review composite-key tables during design review for stray descriptive columns.'],
        [['F', 'What is 2NF?', '1NF plus no partial dependency of non-key columns on part of a composite key.'],
            ['F', 'When is 2NF relevant?', 'When the primary key is composite.'],
            ['M', 'Give an example of a partial dependency.', 'order_items(order_id, product_id, product_name): product_name depends on product_id only.'],
            ['M', 'How do you fix it?', 'Move product_name to a products table keyed by product_id.'],
            ['S', 'Is unit_price in order_items a partial dependency?', 'Not if it is the price at order time, which depends on the full (order, product) pair; it is a deliberate snapshot.'],
            ['S', 'How do you detect 2NF issues in an existing schema?', 'Check composite-key tables for columns that vary only with one key part (GROUP BY that part, check distinct values).']],
        [['Partial dependency table.',
            r`CREATE TABLE items_bad (order_id INT, product_id INT, product_name VARCHAR(20), qty INT, PRIMARY KEY (order_id, product_id));
INSERT INTO items_bad VALUES (1,5,'Pen',2),(2,5,'Pen',1);
SELECT product_id, COUNT(DISTINCT product_name) AS names FROM items_bad GROUP BY product_id;

-- OUTPUT:
-- product_id | names
--          5 | 1       (product_name repeated per order)`],
            ['2NF solution.',
                r`CREATE TABLE products2 (product_id INT PRIMARY KEY, product_name VARCHAR(20));
CREATE TABLE items_ok (order_id INT, product_id INT, qty INT, PRIMARY KEY (order_id, product_id));
INSERT INTO products2 VALUES (5,'Pen');
SELECT i.order_id, p.product_name FROM items_ok i JOIN products2 p USING (product_id);

-- OUTPUT: (after inserting items)
-- order_id | product_name
--        1 | Pen`]],
        [['Rename once instead of in millions of rows.',
            r`UPDATE products2 SET product_name = 'Gel Pen' WHERE product_id = 5;

-- OUTPUT:
-- Query OK, 1 row affected`],
            ['Detect a partial dependency.',
                r`SELECT product_id FROM items_bad GROUP BY product_id HAVING COUNT(DISTINCT product_name) > 1;

-- OUTPUT:
-- Empty set  (names consistent now, but they are still redundant)`]]
    ),

    '3NF': x(
        ['Third Normal Form: 2NF plus no non-key column depends on another non-key column (no transitive dependency).',
            'Example: employee(id, dept_id, dept_name): dept_name depends on dept_id, not on id.',
            'Fix: put departments in their own table.'],
        ['Slogan: every non-key attribute depends on "the key, the whole key and nothing but the key".',
            'Typical transitive cases: zip → city, product → category name, country → currency.',
            '3NF removes most update anomalies and is the usual target for OLTP.'],
        ['3NF can cost extra joins on hot read paths; denormalize deliberately with measurements.',
            'Beware synthetic "dependencies" that are really business choices (price at time of sale).',
            'Document every deliberate violation with its reason and its maintenance mechanism.'],
        [['F', 'What is 3NF?', '2NF plus no transitive dependencies between non-key columns.'],
            ['F', 'Example of a transitive dependency?', 'emp(id, dept_id, dept_name): dept_name depends on dept_id.'],
            ['M', 'Remember the 3NF rule.', 'Non-key columns depend on the key, the whole key and nothing but the key.'],
            ['M', 'How to convert to 3NF?', 'Move the dependent attributes into a new table keyed by the determinant and reference it by foreign key.'],
            ['S', 'When would you intentionally violate 3NF?', 'For read performance on proven hot paths, stable reference data copies or analytics models, with a defined sync mechanism.'],
            ['S', 'How do you detect transitive dependencies in data?', 'GROUP BY the suspected determinant (dept_id) and check if the dependent column is always unique per group.']],
        [['Transitive dependency.',
            r`CREATE TABLE emp_bad (id INT PRIMARY KEY, name VARCHAR(20), dept_id INT, dept_name VARCHAR(20));
INSERT INTO emp_bad VALUES (1,'Abaji',10,'HR'),(2,'Raoji',10,'HR'),(3,'Moropant',20,'IT');
SELECT dept_id, COUNT(*) AS rows_n, COUNT(DISTINCT dept_name) AS names FROM emp_bad GROUP BY dept_id;

-- OUTPUT:
-- dept_id | rows_n | names
--      10 |      2 |     1`],
            ['3NF solution.',
                r`CREATE TABLE dept3 (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE emp3 (id INT PRIMARY KEY, name VARCHAR(20), dept_id INT, FOREIGN KEY (dept_id) REFERENCES dept3(id));
INSERT INTO dept3 VALUES (10,'HR'),(20,'IT');
INSERT INTO emp3 VALUES (1,'Abaji',10),(2,'Raoji',10),(3,'Moropant',20);
SELECT e.name, d.name AS dept FROM emp3 e JOIN dept3 d ON d.id = e.dept_id;

-- OUTPUT:
-- name     | dept
-- Abaji    | HR
-- Raoji    | HR
-- Moropant | IT`]],
        [['Rename a department once.',
            r`UPDATE dept3 SET name = 'People Ops' WHERE id = 10;

-- OUTPUT:
-- Query OK, 1 row affected`],
            ['Anomaly in the unnormalized version: rename misses rows.',
                r`UPDATE emp_bad SET dept_name = 'People Ops' WHERE id = 1;
SELECT DISTINCT dept_name FROM emp_bad WHERE dept_id = 10;

-- OUTPUT:
-- dept_name
-- People Ops
-- HR`]]
    ),

    'BCNF': x(
        ['Boyce-Codd Normal Form is a stricter 3NF: for every functional dependency X → Y, X must be a candidate key (a superkey).',
            'It matters when a table has several overlapping candidate keys.',
            'Most 3NF tables are already BCNF.'],
        ['Classic case: a table where a non-key attribute determines part of a key (teacher → subject in (student, subject, teacher)).',
            'Decomposing to BCNF can lose the ability to enforce some dependencies with simple constraints.',
            'In practice teams target 3NF and fix BCNF only where anomalies appear.'],
        ['BCNF decomposition is lossless but may not be dependency-preserving; sometimes 3NF is the practical optimum.',
            'Use unique constraints on the determinants to enforce dependencies the decomposition keeps.',
            'Validate with real business rules; sample data can mislead.'],
        [['F', 'What is BCNF?', 'A table where every determinant is a candidate key.'],
            ['F', 'Is BCNF stricter than 3NF?', 'Yes.'],
            ['M', 'Give a BCNF violation example.', 'enrol(student, subject, teacher) with teacher → subject: teacher is a determinant but not a key.'],
            ['M', 'Can 3NF tables violate BCNF?', 'Yes, when candidate keys overlap.'],
            ['S', 'What is the downside of forcing BCNF?', 'It can lose dependency preservation, so some rules need extra constraints or code.'],
            ['S', 'How do you enforce teacher → subject after decomposition?', 'A teacher_subject table with UNIQUE (teacher); then enrol references teacher only.']],
        [['BCNF violation.',
            r`CREATE TABLE enrol_bad (student INT, subject VARCHAR(10), teacher VARCHAR(10), PRIMARY KEY (student, subject));
INSERT INTO enrol_bad VALUES (1,'SQL','Rao'),(2,'SQL','Rao'),(1,'Java','Iyer');
SELECT teacher, COUNT(DISTINCT subject) AS subjects FROM enrol_bad GROUP BY teacher;

-- OUTPUT:
-- teacher | subjects
-- Rao     | 1           (teacher determines subject)
-- Iyer    | 1`],
            ['BCNF decomposition.',
                r`CREATE TABLE teacher_subject (teacher VARCHAR(10) PRIMARY KEY, subject VARCHAR(10));
CREATE TABLE enrol_ok (student INT, teacher VARCHAR(10), PRIMARY KEY (student, teacher), FOREIGN KEY (teacher) REFERENCES teacher_subject(teacher));
INSERT INTO teacher_subject VALUES ('Rao','SQL'),('Iyer','Java');
SELECT e.student, t.subject FROM enrol_ok e JOIN teacher_subject t USING (teacher);

-- OUTPUT: (after inserts)
-- student | subject
--       1 | SQL`]],
        [['Enforcement of the dependency via PK.',
            r`INSERT INTO teacher_subject VALUES ('Rao','Java');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'Rao' for key 'teacher_subject.PRIMARY'`],
            ['Rebuild the original view.',
                r`CREATE VIEW enrol_view AS SELECT e.student, t.subject, t.teacher FROM enrol_ok e JOIN teacher_subject t USING (teacher);
SELECT * FROM enrol_view;

-- OUTPUT:
-- student | subject | teacher
--       1 | SQL     | Rao`]]
    ),

    'Denormalization': x(
        ['Denormalization deliberately adds redundancy to speed up reads, such as storing a total or a name copy.',
            'It trades write complexity and storage for fewer joins.',
            'Normalize first, denormalize only when measurements justify it.'],
        ['Common forms: summary/counter columns, copied columns, pre-joined tables, summary tables, caches.',
            'You must keep copies in sync: in the same transaction, via triggers, events or jobs.',
            'Document each denormalized column and its source of truth.'],
        ['Prefer read models (materialized aggregates, search indexes, cache) over polluting the core schema.',
            'Use generated columns for derived values inside the same row; use counter tables for hot counters to avoid row contention.',
            'Add reconciliation jobs that recompute and compare to catch drift.'],
        [['F', 'What is denormalization?', 'Adding redundancy on purpose to make reads faster.'],
            ['F', 'Why do it?', 'To avoid expensive joins or aggregations on hot paths.'],
            ['M', 'What is the cost?', 'More storage, more complex writes and risk of inconsistent copies.'],
            ['M', 'How do you keep a denormalized total correct?', 'Update it in the same transaction as the detail change, or recompute with a job and reconcile.'],
            ['S', 'Counter column or COUNT(*)?', 'A counter avoids repeated scans but needs maintenance and can contend; use striped counters or a summary table for hot rows.'],
            ['S', 'How do you decide to denormalize?', 'Measure with EXPLAIN ANALYZE and real load; try indexes, query rewrite and caching first.']],
        [['Order total column maintained with a transaction.',
            r`ALTER TABLE orders ADD COLUMN total DECIMAL(10,2) NOT NULL DEFAULT 0;
START TRANSACTION;
INSERT INTO order_items (order_id, product_id, qty, unit_price) VALUES (1, 7, 2, 50.00);
UPDATE orders SET total = total + 100.00 WHERE id = 1;
COMMIT;
SELECT total FROM orders WHERE id = 1;

-- OUTPUT:
-- total
-- 100.00`],
            ['Reconciliation query.',
                r`SELECT o.id FROM orders o JOIN (SELECT order_id, SUM(qty*unit_price) AS s FROM order_items GROUP BY order_id) x ON x.order_id = o.id WHERE o.total <> x.s;

-- OUTPUT:
-- Empty set   (no drift)`]],
        [['Generated column keeps in-row values consistent.',
            r`ALTER TABLE order_items ADD COLUMN line_total DECIMAL(10,2) AS (qty * unit_price) STORED;
SELECT qty, unit_price, line_total FROM order_items LIMIT 1;

-- OUTPUT:
-- qty | unit_price | line_total
--   2 |      50.00 |     100.00`],
            ['Summary table for dashboards.',
                r`INSERT INTO daily_sales (day, revenue) SELECT DATE(placed_at), SUM(total) FROM orders GROUP BY DATE(placed_at)
ON DUPLICATE KEY UPDATE revenue = VALUES(revenue);

-- OUTPUT:
-- Query OK, 2 rows affected`]]
    ),

    'Alternate Key': x(
        ['An alternate key is a candidate key that was not chosen as the primary key.',
            'Example: user id is the primary key; email and username are alternate keys.',
            'In MySQL, define alternate keys with UNIQUE NOT NULL.'],
        ['Alternate keys give business-level uniqueness and fast lookups by that column.',
            'Foreign keys can reference an alternate key (UNIQUE), though referencing the PK is conventional.',
            'Name unique constraints (<code>uq_users_email</code>).'],
        ['Keep alternate keys short and stable; they are also indexes that consume memory.',
            'Changing an alternate key (email change) is easy because it is not used as the clustered key; this is a reason to use surrogate PKs.',
            'Case/collation rules define what counts as duplicate; decide them deliberately.'],
        [['F', 'What is an alternate key?', 'A candidate key not selected as the primary key.'],
            ['F', 'How do you define one in MySQL?', 'UNIQUE (and NOT NULL if required).'],
            ['M', 'Can a foreign key reference an alternate key?', 'Yes, if it is UNIQUE (or PK) and types match.'],
            ['M', 'Why not make email the primary key?', 'It can change and is long; a surrogate PK keeps references and indexes small and stable.'],
            ['S', 'How do alternate keys impact index size?', 'Each unique key is a secondary index that stores the primary key too, increasing size with a large PK.'],
            ['S', 'How do you handle case-insensitive uniqueness?', 'Use a ci collation or store normalized lowercase in a unique column.']],
        [['Primary and alternate keys.',
            r`CREATE TABLE app_users (id BIGINT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(80) NOT NULL, username VARCHAR(30) NOT NULL,
  UNIQUE KEY uq_email (email), UNIQUE KEY uq_username (username));
INSERT INTO app_users (email, username) VALUES ('a@x.com','abaji');
INSERT INTO app_users (email, username) VALUES ('b@x.com','abaji');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'abaji' for key 'app_users.uq_username'`],
            ['Look up by an alternate key.',
                r`SELECT id FROM app_users WHERE email = 'a@x.com';

-- OUTPUT:
-- id
-- 1`]],
        [['Reference an alternate key.',
            r`CREATE TABLE login_events (id INT PRIMARY KEY, username VARCHAR(30), FOREIGN KEY (username) REFERENCES app_users(username));

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['List unique keys.',
                r`SELECT index_name, column_name FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'app_users' AND non_unique = 0;

-- OUTPUT:
-- index_name  | column_name
-- PRIMARY     | id
-- uq_email    | email
-- uq_username | username`]]
    ),

    'Natural Key vs Surrogate Key': x(
        ['A natural key is real-world data that identifies a row (email, passport number). A surrogate key is a system-generated meaningless id (AUTO_INCREMENT, UUID).',
            'Surrogate keys are stable and compact; natural keys can change.',
            'Most designs use a surrogate PK plus UNIQUE on natural keys.'],
        ['Natural keys are good as UNIQUE constraints and for lookup; weak as primary keys because values change, can be long and sometimes get reused.',
            'Composite natural keys make foreign keys wide.',
            'Surrogate keys leak meaning if exposed (guessable counts); expose a separate public id if needed.'],
        ['Time-ordered ids (UUIDv7, ULID, Snowflake) give global uniqueness with good index locality.',
            'Auto-increment is simple but limits multi-writer or sharded systems.',
            'Natural keys still win for reference tables with truly stable codes (ISO country code).'],
        [['F', 'What is a surrogate key?', 'A generated identifier with no business meaning.'],
            ['F', 'What is a natural key?', 'A real-world attribute that uniquely identifies the row.'],
            ['M', 'Why not use email as primary key?', 'It changes, is long, and every child table and index would copy it.'],
            ['M', 'Surrogate PK plus natural UNIQUE: why both?', 'The surrogate keeps references small and stable; the unique constraint enforces business uniqueness.'],
            ['S', 'AUTO_INCREMENT vs UUID?', 'Auto-increment is compact and ordered but central; UUIDs are globally unique but large and random unless time-ordered (v7).'],
            ['S', 'How to avoid exposing sequential ids?', 'Add a separate random public id (UUID/ULID) and keep the integer PK internal.']],
        [['Natural vs surrogate design.',
            r`CREATE TABLE country (code CHAR(2) PRIMARY KEY, name VARCHAR(40));         -- stable natural key
CREATE TABLE customer (id BIGINT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(80) UNIQUE NOT NULL, country_code CHAR(2),
  FOREIGN KEY (country_code) REFERENCES country(code));
INSERT INTO country VALUES ('IN','India');
INSERT INTO customer (email, country_code) VALUES ('a@x.com','IN');
SELECT c.id, c.email, k.name FROM customer c JOIN country k ON k.code = c.country_code;

-- OUTPUT:
-- id | email   | name
--  1 | a@x.com | India`],
            ['Email change with a surrogate key touches one row.',
                r`UPDATE customer SET email = 'new@x.com' WHERE id = 1;

-- OUTPUT:
-- Query OK, 1 row affected`]],
        [['Public id alongside internal id.',
            r`ALTER TABLE customer ADD COLUMN public_id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)), ADD UNIQUE KEY uq_public (public_id);
SELECT id, BIN_TO_UUID(public_id, 1) IS NOT NULL AS has_uuid FROM customer;

-- OUTPUT:
-- id | has_uuid
--  1 |        1`],
            ['Natural key problem: changed value needs cascades.',
                r`UPDATE customer_nat SET email = 'new@x.com' WHERE email = 'a@x.com';   -- email was the PK

-- OUTPUT:
-- Query OK, 1 row affected   (plus ON UPDATE CASCADE work in every child table)`]]
    ),

    'Primary Key vs Unique Key': x(
        ['Both enforce uniqueness. A table has one primary key (NOT NULL) and can have many unique keys (NULLs allowed).',
            'The primary key is the main row identifier; unique keys are alternate identifiers.',
            'In InnoDB the primary key is the clustered index.'],
        ['Unique keys allow multiple NULLs in MySQL; primary keys never allow NULL.',
            'Foreign keys normally reference the primary key.',
            'Both create an index automatically.'],
        ['Primary key choice shapes physical storage and every secondary index; unique key choice shapes lookup and constraint behaviour.',
            'A table without an explicit PK relies on the hidden row id, which hurts replication tools and ORMs.',
            'Unique keys on nullable columns rarely mean what people expect; add NOT NULL when uniqueness must always hold.'],
        [['F', 'Primary key vs unique key?', 'Primary key: one per table, no NULLs, row identity. Unique key: many allowed, NULLs permitted.'],
            ['F', 'Does a unique key create an index?', 'Yes.'],
            ['M', 'How many NULLs may a UNIQUE column hold in MySQL?', 'Any number, since NULL is never equal to NULL.'],
            ['M', 'Which key is clustered in InnoDB?', 'The primary key.'],
            ['S', 'Why does the PK affect secondary indexes?', 'Each secondary index entry stores the PK value to find the row, so a large PK enlarges every index.'],
            ['S', 'How does a unique key behave in replication and online DDL?', 'Row-based replication uses the PK (or unique non-null key) to locate rows; tables without a good key replicate slowly.']],
        [['Compare behaviour.',
            r`CREATE TABLE k (id INT PRIMARY KEY, code VARCHAR(5) UNIQUE);
INSERT INTO k VALUES (1,NULL),(2,NULL),(3,'A');
INSERT INTO k VALUES (4,'A');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'A' for key 'k.code'`],
            ['Primary key rejects NULL.',
                r`INSERT INTO k VALUES (NULL,'B');

-- OUTPUT:
-- ERROR 1048 (23000): Column 'id' cannot be null`]],
        [['Show keys of the table.',
            r`SHOW INDEX FROM k;

-- OUTPUT: (trimmed)
-- Key_name | Column_name | Non_unique
-- PRIMARY  | id          | 0
-- code     | code        | 0`],
            ['Tables without PK cause slow row-based replication (check).',
                r`SELECT t.table_name FROM information_schema.tables t LEFT JOIN information_schema.statistics s
  ON s.table_schema=t.table_schema AND s.table_name=t.table_name AND s.index_name='PRIMARY'
WHERE t.table_schema = DATABASE() AND t.table_type = 'BASE TABLE' AND s.index_name IS NULL;

-- OUTPUT:
-- Empty set  (all tables have a primary key)`]]
    )
};
