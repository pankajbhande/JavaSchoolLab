// Deep dive, modules 14-16 (Relationships & Database Design, Normalization, Keys).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d06: Record<string, Deep> = {
    'Designing One-to-One Tables': dv(
        [`In a one-to-one design the child row is located by the parent key. With a shared primary key (child PK = parent id) the child clustered index is ordered the same way as the parent, so a join is a pair of primary-key lookups. A UNIQUE foreign key on a separate surrogate key gives the same guarantee through a unique secondary index.`,
            r`CREATE TABLE accounts (id BIGINT PRIMARY KEY AUTO_INCREMENT, owner VARCHAR(40) NOT NULL);
CREATE TABLE account_settings (account_id BIGINT PRIMARY KEY, theme VARCHAR(10) DEFAULT 'light', notify BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE);
EXPLAIN SELECT a.owner, s.theme FROM accounts a JOIN account_settings s ON s.account_id = a.id WHERE a.id = 1;

-- OUTPUT: (example)
-- table | type  | key
-- a     | const | PRIMARY
-- s     | const | PRIMARY`],
        [`Choices: shared PK vs surrogate + UNIQUE FK; optional vs mandatory child; ON DELETE CASCADE for owned data. Create both rows in one transaction, and read optional children with LEFT JOIN.`,
            r`START TRANSACTION;
INSERT INTO accounts (owner) VALUES ('Abaji');
INSERT INTO account_settings (account_id) VALUES (LAST_INSERT_ID());
COMMIT;
SELECT a.owner, COALESCE(s.theme, 'default') AS theme FROM accounts a LEFT JOIN account_settings s ON s.account_id = a.id;

-- OUTPUT:
-- owner | theme
-- Abaji | light`],
        [`Mistakes: forgetting the UNIQUE or PK on the child (becomes one-to-many), splitting tables that are always read together, and assuming the database can force the child to exist. Add the key and merge tables that gain nothing from the split.`,
            r`CREATE TABLE bad_profile (id INT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, bio VARCHAR(100));
INSERT INTO bad_profile (user_id, bio) VALUES (1,'a'),(1,'b');       -- allowed: not actually one-to-one
ALTER TABLE bad_profile ADD UNIQUE KEY uq_user (user_id);

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1' for key 'bad_profile.uq_user'     (clean data first, then add the key)`],
        [`Split for performance only when it pays off: move large or rarely used columns to the child so the hot table has more rows per page. Compare row sizes before and after.`,
            r`SELECT table_name, avg_row_length, ROUND(16384 / avg_row_length) AS rows_per_page FROM information_schema.tables WHERE table_name IN ('employees_wide','employees_hot');

-- OUTPUT: (example)
-- table_name     | avg_row_length | rows_per_page
-- employees_wide |           2400 |             7
-- employees_hot  |            140 |           117`],
        [`Real-world: credentials, PII and payment data live in separate one-to-one tables with stricter grants, encryption and auditing than the main profile table.`,
            r`CREATE TABLE user_pii (user_id BIGINT PRIMARY KEY, national_id VARBINARY(64), dob DATE, FOREIGN KEY (user_id) REFERENCES users(id)) ENCRYPTION='Y';
GRANT SELECT ON shop.users TO 'support'@'%';
-- no grant on user_pii for the support role
SELECT * FROM user_pii;

-- OUTPUT:
-- ERROR 1142 (42000): SELECT command denied to user 'support'@'localhost' for table 'user_pii'`]
    ),

    'Designing One-to-Many & Many-to-Many Tables': dv(
        [`One-to-many stores the parent key in the child. Many-to-many needs a junction table whose composite primary key makes (a, b) unique and clusters rows by a; a secondary index (b, a) serves the opposite direction. Together they cover every join path with index lookups.`,
            r`CREATE TABLE products (id BIGINT PRIMARY KEY, name VARCHAR(60));
CREATE TABLE tags (id INT PRIMARY KEY, label VARCHAR(30) UNIQUE);
CREATE TABLE product_tags (product_id BIGINT, tag_id INT, PRIMARY KEY (product_id, tag_id), KEY idx_tag_product (tag_id, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, FOREIGN KEY (tag_id) REFERENCES tags(id));
EXPLAIN SELECT product_id FROM product_tags WHERE tag_id = 3;

-- OUTPUT: (example)
-- type | key             | Extra
-- ref  | idx_tag_product | Using index`],
        [`Design checklist: name keys consistently, choose ON DELETE by ownership, store relationship attributes in the link table, snapshot values that must not change (price at order time), and index both directions.`,
            r`CREATE TABLE order_items (
  order_id BIGINT NOT NULL, line_no INT NOT NULL, product_id BIGINT NOT NULL, qty INT NOT NULL CHECK (qty > 0),
  unit_price DECIMAL(10,2) NOT NULL,            -- snapshot of the price when ordered
  PRIMARY KEY (order_id, line_no), KEY idx_product (product_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE, FOREIGN KEY (product_id) REFERENCES products(id));

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: comma-separated id lists, storing relationship data on the wrong entity, missing reverse index, and referencing the current product price instead of a snapshot (history changes when prices change).`,
            r`-- BAD: list in a column
SELECT * FROM products WHERE FIND_IN_SET('hot', tag_list);
-- GOOD: junction table with an index
SELECT p.id, p.name FROM tags t JOIN product_tags pt ON pt.tag_id = t.id JOIN products p ON p.id = pt.product_id WHERE t.label = 'hot';

-- OUTPUT:
-- id | name
--  7 | Pen`],
        [`The junction table is usually the largest table. Keep its keys small, avoid wide extra columns, and use covering indexes so lookups never touch the table rows.`,
            r`SELECT table_name, table_rows, ROUND((data_length + index_length) / 1073741824, 2) AS gb FROM information_schema.tables WHERE table_name IN ('product_tags','order_items');

-- OUTPUT: (example)
-- table_name  | table_rows | gb
-- order_items |   54000000 | 6.80
-- product_tags|   12000000 | 0.90`],
        [`Real-world: tags and search. "Products having all of these tags" uses GROUP BY ... HAVING COUNT(DISTINCT) over the junction index.`,
            r`SELECT pt.product_id FROM product_tags pt JOIN tags t ON t.id = pt.tag_id WHERE t.label IN ('organic','vegan','gluten-free')
GROUP BY pt.product_id HAVING COUNT(DISTINCT t.id) = 3;

-- OUTPUT:
-- product_id
-- 118
-- 342`]
    ),

    'Junction (Bridge) Tables': dv(
        [`A junction table has one row per link. Its composite primary key clusters rows by the first column, so all links of one parent are physically adjacent and read together; the second index serves the reverse lookup. InnoDB also keeps the primary key columns in the secondary index automatically.`,
            r`CREATE TABLE user_roles (user_id BIGINT NOT NULL, role_id INT NOT NULL, granted_on DATE NOT NULL DEFAULT (CURRENT_DATE), granted_by BIGINT NULL,
  PRIMARY KEY (user_id, role_id), KEY idx_role_user (role_id, user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (role_id) REFERENCES roles(id));
SHOW INDEX FROM user_roles;

-- OUTPUT: (trimmed)
-- Key_name      | Seq_in_index | Column_name
-- PRIMARY       | 1            | user_id
-- PRIMARY       | 2            | role_id
-- idx_role_user | 1            | role_id`],
        [`Variants: pure link table, link with attributes, link with its own surrogate id (when other tables reference the link), and temporal links with valid-from/valid-to to keep history.`,
            r`CREATE TABLE memberships (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, team_id BIGINT NOT NULL,
  valid_from DATE NOT NULL, valid_to DATE NULL, UNIQUE KEY uq_open (user_id, team_id, valid_from));
SELECT user_id FROM memberships WHERE team_id = 5 AND valid_from <= CURDATE() AND (valid_to IS NULL OR valid_to >= CURDATE());

-- OUTPUT:
-- user_id
-- 7`],
        [`Mistakes: duplicate links because there is no composite key, missing reverse index, and deleting parents without cleaning links (use ON DELETE CASCADE or application logic). Detect duplicates and orphans with simple queries.`,
            r`SELECT user_id, role_id, COUNT(*) FROM user_roles_legacy GROUP BY user_id, role_id HAVING COUNT(*) > 1;
SELECT ur.user_id FROM user_roles ur LEFT JOIN users u ON u.id = ur.user_id WHERE u.id IS NULL;

-- OUTPUT:
-- user_id | role_id | COUNT(*)
-- 7       |       2 |        3       (duplicates to remove before adding the primary key)`],
        [`Large junction tables benefit from covering index scans for counts and existence checks. Measure with EXPLAIN that both directions show "Using index".`,
            r`EXPLAIN SELECT COUNT(*) FROM user_roles WHERE role_id = 2;
EXPLAIN SELECT role_id FROM user_roles WHERE user_id = 7;

-- OUTPUT: (example)
-- first : key=idx_role_user Extra=Using index
-- second: key=PRIMARY       Extra=Using index`],
        [`Real-world: permission checks. "Does user 7 have permission P?" is an indexed lookup through two junction tables and must stay fast, so verify the plan.`,
            r`SELECT EXISTS (SELECT 1 FROM user_roles ur JOIN role_permissions rp ON rp.role_id = ur.role_id JOIN permissions p ON p.id = rp.permission_id WHERE ur.user_id = 7 AND p.code = 'orders.refund') AS allowed;

-- OUTPUT:
-- allowed
-- 1`]
    ),

    'Referential Integrity': dv(
        [`Referential integrity is enforced by InnoDB at statement time: inserting or updating a child checks that the parent key exists (a shared lock on the parent record), and deleting or updating a parent applies the declared action by looking up matching child rows through the child's index.`,
            r`CREATE TABLE customers (id INT PRIMARY KEY) ENGINE=InnoDB;
CREATE TABLE orders (id INT PRIMARY KEY, customer_id INT NOT NULL, KEY idx_c (customer_id), FOREIGN KEY (customer_id) REFERENCES customers(id)) ENGINE=InnoDB;
INSERT INTO orders VALUES (1, 99);

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails (shop.orders, CONSTRAINT orders_ibfk_1 FOREIGN KEY (customer_id) REFERENCES customers (id))`],
        [`Control checks with <code>foreign_key_checks</code> for bulk loads and restores, and inspect rules through the catalog. Re-enable and verify afterwards, because disabled checks let bad rows in.`,
            r`SET foreign_key_checks = 0;
-- load data in any order
SET foreign_key_checks = 1;
SELECT constraint_name, table_name, referenced_table_name, update_rule, delete_rule FROM information_schema.referential_constraints WHERE constraint_schema = DATABASE();

-- OUTPUT:
-- constraint_name | table_name | referenced_table_name | update_rule | delete_rule
-- orders_ibfk_1   | orders     | customers             | NO ACTION   | NO ACTION`],
        [`Mistakes: disabling checks and forgetting to re-validate, orphans created by deletes outside the database's knowledge (no FK), and foreign keys to non-unique columns. Audit orphans with an anti-join on a schedule.`,
            r`SELECT o.id FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL;

-- OUTPUT:
-- id
-- 42       (a row that bypassed integrity while checks were off)`],
        [`Foreign key checks take locks and run index lookups on every write. On very hot parents consider moving to application-level integrity with reconciliation, only after measuring contention.`,
            r`SELECT object_name, index_name, lock_mode FROM performance_schema.data_locks WHERE object_name = 'customers';
SELECT * FROM sys.innodb_lock_waits;

-- OUTPUT: (example)
-- object_name | index_name | lock_mode
-- customers   | PRIMARY    | S,REC_NOT_GAP`],
        [`Real-world across services: you cannot have a foreign key between databases, so store the other service's id, validate through its API or events, and run reconciliation jobs that flag dangling references.`,
            r`SELECT p.id, p.customer_ref FROM payments p LEFT JOIN customer_snapshot s ON s.id = p.customer_ref WHERE s.id IS NULL AND p.created_at >= NOW() - INTERVAL 1 DAY;

-- OUTPUT:
-- id | customer_ref
-- 90 | c-4412           (alert: payment references a customer unknown to this service)`]
    ),

    'Cascading Operations': dv(
        [`With ON DELETE CASCADE InnoDB deletes matching child rows inside the same statement and transaction, recursively through further foreign keys (up to a depth limit). Each cascaded deletion takes row locks and writes undo and redo like a normal delete, but does not fire triggers on the child table.`,
            r`CREATE TABLE posts (id INT PRIMARY KEY);
CREATE TABLE comments (id INT PRIMARY KEY, post_id INT NOT NULL, KEY idx_post (post_id), FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE);
INSERT INTO posts VALUES (1); INSERT INTO comments VALUES (1,1),(2,1);
DELETE FROM posts WHERE id = 1;
SELECT COUNT(*) FROM comments;

-- OUTPUT:
-- COUNT(*)
-- 0`],
        [`Actions: <code>CASCADE</code>, <code>SET NULL</code> (column must be nullable), <code>RESTRICT</code>/<code>NO ACTION</code>. ON UPDATE CASCADE propagates key changes (rarely needed with surrogate keys).`,
            r`ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_1;
ALTER TABLE comments MODIFY post_id INT NULL, ADD FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL ON UPDATE CASCADE;
SELECT delete_rule, update_rule FROM information_schema.referential_constraints WHERE table_name = 'comments';

-- OUTPUT:
-- delete_rule | update_rule
-- SET NULL    | CASCADE`],
        [`Mistakes: cascading deletes over millions of rows (huge transaction, long locks, replica lag), cascades that silently destroy audit data, and triggers expected on cascaded rows (they do not fire). Prefer soft deletes and batch purges for big trees.`,
            r`SELECT COUNT(*) FROM comments WHERE post_id = 1;          -- how big would the cascade be?
UPDATE posts SET deleted_at = NOW() WHERE id = 1;           -- soft delete, children untouched
DELETE FROM comments WHERE post_id = 1 LIMIT 5000;          -- batched purge later

-- OUTPUT:
-- COUNT(*)
-- 2400000`],
        [`A giant cascade holds locks for its whole duration and generates a big binlog event. Measure the affected rows first and purge children in batches before deleting the parent.`,
            r`DELETE FROM comments WHERE post_id = 1 LIMIT 5000;     -- repeat until ROW_COUNT() = 0
DELETE FROM posts WHERE id = 1;                          -- now a trivial cascade

-- OUTPUT:
-- Query OK, 5000 rows affected   (x480), then Query OK, 1 row affected`],
        [`Real-world: owned data (order lines, session rows, draft attachments) uses CASCADE; shared or historical data (customers, products referenced by orders) uses RESTRICT so deletes must be deliberate.`,
            r`CREATE TABLE order_lines (order_id BIGINT NOT NULL, line_no INT NOT NULL, product_id BIGINT NOT NULL, PRIMARY KEY (order_id, line_no),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT);

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Data Redundancy & Functional Dependency': dv(
        [`A functional dependency A → B means every value of A determines exactly one value of B (employee id determines name). Redundancy appears when a non-key attribute depends on something that is not the whole key, so the same fact is stored in many rows and can become inconsistent.`,
            r`CREATE TABLE orders_flat (order_id INT, customer_id INT, customer_name VARCHAR(30), customer_city VARCHAR(30), item VARCHAR(30));
INSERT INTO orders_flat VALUES (1,7,'Abaji','Pune','Pen'),(2,7,'Abaji','Pune','Book'),(3,7,'Abaji','Delhi','Bag');
-- test the dependency customer_id -> customer_city
SELECT customer_id, COUNT(DISTINCT customer_city) AS cities FROM orders_flat GROUP BY customer_id HAVING cities > 1;

-- OUTPUT:
-- customer_id | cities
-- 7           |      2        (the dependency is violated: inconsistent data)`],
        [`Find dependencies with GROUP BY + HAVING COUNT(DISTINCT). Decompose by moving the dependent columns to a table keyed by the determinant, and replace them with a foreign key.`,
            r`CREATE TABLE customers (id INT PRIMARY KEY, name VARCHAR(30), city VARCHAR(30));
INSERT INTO customers SELECT customer_id, MAX(customer_name), MAX(customer_city) FROM orders_flat GROUP BY customer_id;
CREATE TABLE orders_n (order_id INT PRIMARY KEY, customer_id INT, item VARCHAR(30), FOREIGN KEY (customer_id) REFERENCES customers(id));
INSERT INTO orders_n SELECT order_id, customer_id, item FROM orders_flat;

-- OUTPUT:
-- Query OK, 1 row affected   Query OK, 3 rows affected`],
        [`Mistakes: normalizing without confirming the real business rule (data samples can mislead), and "fixing" inconsistent rows by guessing. Ask which value is correct before merging.`,
            r`SELECT customer_id, customer_city, COUNT(*) AS n, MAX(order_id) AS latest_order FROM orders_flat GROUP BY customer_id, customer_city;

-- OUTPUT:
-- customer_id | customer_city | n | latest_order
-- 7           | Pune          | 2 |            2
-- 7           | Delhi         | 1 |            3      (which one is current? ask the business)`],
        [`Redundancy costs storage, cache and write amplification: updating one fact touches many rows. Compare the cost of renaming a city in both designs.`,
            r`UPDATE orders_flat SET customer_city = 'Mumbai' WHERE customer_id = 7;       -- touches every order row
UPDATE customers SET city = 'Mumbai' WHERE id = 7;                             -- touches one row

-- OUTPUT:
-- Query OK, 3 rows affected
-- Query OK, 1 row affected`],
        [`Real-world: some redundancy is intentional. An invoice stores the customer's address as it was on the day of sale, because later address changes must not rewrite history. That is a snapshot, not a normalization error.`,
            r`CREATE TABLE invoices (id BIGINT PRIMARY KEY, customer_id BIGINT NOT NULL, billing_name VARCHAR(80) NOT NULL, billing_address VARCHAR(200) NOT NULL, issued_on DATE NOT NULL);
INSERT INTO invoices SELECT 1001, c.id, c.name, c.address, CURDATE() FROM customers c WHERE c.id = 7;

-- OUTPUT:
-- Query OK, 1 row affected`]
    ),

    '1NF': dv(
        [`First normal form requires atomic values: each cell holds one value of one type, rows are unique, and there are no repeating groups. Atomicity is what lets the engine index, compare and join the values; a comma-separated list is opaque to all of them.`,
            r`CREATE TABLE contacts_bad (id INT PRIMARY KEY, phones VARCHAR(100));
INSERT INTO contacts_bad VALUES (1, '999,888'), (2, '777');
SELECT id FROM contacts_bad WHERE FIND_IN_SET('888', phones);       -- full scan, no index
CREATE TABLE contact_phones (contact_id INT, phone VARCHAR(20), PRIMARY KEY (contact_id, phone), KEY idx_phone (phone));
INSERT INTO contact_phones VALUES (1,'999'),(1,'888'),(2,'777');
SELECT contact_id FROM contact_phones WHERE phone = '888';          -- index lookup

-- OUTPUT:
-- id
-- 1
-- contact_id
-- 1`],
        [`Migrate a list column into rows with JSON_TABLE or a numbers table, then drop the old column. Repeating columns (phone1, phone2, phone3) are converted the same way with UNION ALL.`,
            r`INSERT INTO contact_phones SELECT c.id, jt.phone FROM contacts_bad c,
  JSON_TABLE(CONCAT('["', REPLACE(c.phones, ',', '","'), '"]'), '$[*]' COLUMNS (phone VARCHAR(20) PATH '$')) jt;
SELECT id, phone1 AS phone FROM wide_contacts WHERE phone1 IS NOT NULL
UNION ALL SELECT id, phone2 FROM wide_contacts WHERE phone2 IS NOT NULL
UNION ALL SELECT id, phone3 FROM wide_contacts WHERE phone3 IS NOT NULL;

-- OUTPUT:
-- id | phone
--  1 | 999
--  1 | 888`],
        [`Mistakes: JSON arrays for data you query by element, delimiters inside values, and a "fixed number of columns" for a variable count. Use JSON only for opaque payloads, otherwise a child table.`,
            r`SELECT id FROM contacts_bad WHERE phones LIKE '%88%';       -- also matches 888, 188, 880...
ALTER TABLE contacts_bad DROP COLUMN phones;

-- OUTPUT:
-- id
-- 1                    (wrong matches are easy with substring tests on lists)`],
        [`Child-table lookups use indexes and constraints; list columns use scans. Verify with EXPLAIN, and measure the speed difference at scale.`,
            r`EXPLAIN SELECT contact_id FROM contact_phones WHERE phone = '888';
EXPLAIN SELECT id FROM contacts_bad WHERE FIND_IN_SET('888', phones);

-- OUTPUT: (example)
-- first : type=ref key=idx_phone rows=1
-- second: type=ALL key=NULL rows=2400000`],
        [`Real-world: user interests, skills and tags always belong in child tables so you can ask "who has skill X" or count users per tag with ordinary joins and indexes.`,
            r`CREATE TABLE user_skills (user_id BIGINT, skill_id INT, level TINYINT NOT NULL DEFAULT 1, PRIMARY KEY (user_id, skill_id), KEY idx_skill (skill_id, user_id));
SELECT s.name, COUNT(*) AS users FROM user_skills us JOIN skills s ON s.id = us.skill_id GROUP BY s.id, s.name ORDER BY users DESC LIMIT 3;

-- OUTPUT:
-- name | users
-- SQL  |  412
-- Java |  380`]
    ),

    '2NF': dv(
        [`Second normal form applies when the key is composite: every non-key column must depend on the whole key, not part of it. A column that depends on only one key part is repeated for every row sharing that part, so it is stored redundantly and can drift.`,
            r`CREATE TABLE order_items_bad (order_id INT, product_id INT, product_name VARCHAR(40), qty INT, PRIMARY KEY (order_id, product_id));
INSERT INTO order_items_bad VALUES (1,5,'Pen',2),(2,5,'Pen',1),(3,5,'Gel Pen',4);
SELECT product_id, COUNT(DISTINCT product_name) AS names FROM order_items_bad GROUP BY product_id;

-- OUTPUT:
-- product_id | names
-- 5          |     2         (product_name depends only on product_id: partial dependency)`],
        [`Fix by moving the partially dependent column into a table keyed by that part, and keep the composite-key table for facts about the pair (quantity, price at time of order).`,
            r`CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(40) NOT NULL);
INSERT INTO products SELECT product_id, MAX(product_name) FROM order_items_bad GROUP BY product_id;
CREATE TABLE order_items (order_id INT, product_id INT, qty INT NOT NULL, PRIMARY KEY (order_id, product_id), FOREIGN KEY (product_id) REFERENCES products(id));
INSERT INTO order_items SELECT order_id, product_id, qty FROM order_items_bad;

-- OUTPUT:
-- Query OK, 1 row affected   Query OK, 3 rows affected`],
        [`Mistakes: confusing a partial dependency with a deliberate snapshot. A unit price copied at order time depends on the whole (order, product) fact, so it belongs in the link table; the product's current name does not.`,
            r`ALTER TABLE order_items ADD COLUMN unit_price DECIMAL(10,2) NOT NULL DEFAULT 0;       -- price when ordered: correct here
UPDATE order_items oi JOIN products_price pp ON pp.product_id = oi.product_id SET oi.unit_price = pp.price;

-- OUTPUT:
-- Query OK, 3 rows affected`],
        [`Redundant partial-dependency columns inflate the biggest table in the system. Compare the size before and after the split.`,
            r`SELECT table_name, avg_row_length, table_rows FROM information_schema.tables WHERE table_name IN ('order_items_bad','order_items');

-- OUTPUT: (example)
-- table_name      | avg_row_length | table_rows
-- order_items_bad |             92 |   54000000
-- order_items     |             48 |   54000000      (about 2.4 GB saved)`],
        [`Real-world: renaming a product used to need an update on millions of order lines; after normalization it is one row, and old orders can still show the historical name if a snapshot column was kept intentionally.`,
            r`UPDATE products SET name = 'Gel Pen v2' WHERE id = 5;
SELECT oi.order_id, p.name FROM order_items oi JOIN products p ON p.id = oi.product_id WHERE oi.order_id = 1;

-- OUTPUT:
-- Query OK, 1 row affected
-- order_id | name
--        1 | Gel Pen v2`]
    ),

    '3NF': dv(
        [`Third normal form removes transitive dependencies: a non-key column must not depend on another non-key column. If department name depends on department id and department id depends on the employee id, the name belongs with the department, not in every employee row.`,
            r`CREATE TABLE emp_bad (id INT PRIMARY KEY, name VARCHAR(30), dept_id INT, dept_name VARCHAR(30), dept_city VARCHAR(30));
INSERT INTO emp_bad VALUES (1,'Abaji',10,'HR','Pune'),(2,'Raoji',10,'HR','Pune'),(3,'Moropant',20,'IT','Delhi');
SELECT dept_id, COUNT(*) AS emp_rows, COUNT(DISTINCT dept_name, dept_city) AS dept_facts FROM emp_bad GROUP BY dept_id;

-- OUTPUT:
-- dept_id | emp_rows | dept_facts
--      10 |        2 |          1       (the same department fact is stored twice)`],
        [`Decompose: create a table for the determinant (dept_id) holding its dependent columns, reference it with a foreign key, and drop the copied columns.`,
            r`CREATE TABLE departments (id INT PRIMARY KEY, name VARCHAR(30) NOT NULL, city VARCHAR(30) NOT NULL);
INSERT INTO departments SELECT DISTINCT dept_id, dept_name, dept_city FROM emp_bad;
CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(30) NOT NULL, dept_id INT NOT NULL, KEY idx_dept (dept_id), FOREIGN KEY (dept_id) REFERENCES departments(id));
INSERT INTO emp SELECT id, name, dept_id FROM emp_bad;

-- OUTPUT:
-- Query OK, 2 rows affected   Query OK, 3 rows affected`],
        [`Mistakes: keeping derived data such as totals as stored columns without maintenance, and copying lookup values into every row. If you need a copy for speed it is denormalization: document it and keep it in sync.`,
            r`UPDATE emp_bad SET dept_city = 'Mumbai' WHERE id = 1;           -- only one of two HR rows changed
SELECT DISTINCT dept_city FROM emp_bad WHERE dept_id = 10;

-- OUTPUT:
-- dept_city
-- Mumbai
-- Pune           (update anomaly: department 10 now has two cities)`],
        [`3NF costs a join to read an employee with their department, but the join is a primary-key lookup. Check the plan to confirm it is cheap before denormalizing.`,
            r`EXPLAIN SELECT e.name, d.name, d.city FROM emp e JOIN departments d ON d.id = e.dept_id WHERE e.id = 1;

-- OUTPUT: (example)
-- table | type  | key
-- e     | const | PRIMARY
-- d     | const | PRIMARY        (two single-row lookups)`],
        [`Real-world: the "address" of a customer, the country of a city, the category of a product are classic transitive dependencies; keeping them in their own tables makes a change one update and keeps reports consistent.`,
            r`SELECT p.name AS product, c.name AS category, pc.name AS parent_category FROM products p JOIN categories c ON c.id = p.category_id LEFT JOIN categories pc ON pc.id = c.parent_id WHERE p.id = 7;

-- OUTPUT:
-- product | category | parent_category
-- Pen     | Stationery | Office`]
    ),

    'BCNF': dv(
        [`Boyce-Codd normal form is stricter than 3NF: for every functional dependency X → Y, X must be a superkey. A violation shows up when two candidate keys overlap and a non-superkey attribute determines part of a key, producing redundancy even in a 3NF table.`,
            r`-- rule: each teacher teaches exactly one subject (teacher -> subject), a student can have each subject once
CREATE TABLE enrol_bad (student INT, subject VARCHAR(10), teacher VARCHAR(10), PRIMARY KEY (student, subject));
INSERT INTO enrol_bad VALUES (1,'SQL','Rao'),(2,'SQL','Rao'),(1,'Java','Iyer');
SELECT teacher, COUNT(DISTINCT subject) AS subjects FROM enrol_bad GROUP BY teacher;

-- OUTPUT:
-- teacher | subjects
-- Rao     |        1
-- Iyer    |        1           (teacher determines subject, but teacher is not a key)`],
        [`Decompose so that every determinant is a key: one table for teacher → subject, one for student → teacher. Enforce teacher → subject with a primary key on teacher.`,
            r`CREATE TABLE teacher_subject (teacher VARCHAR(10) PRIMARY KEY, subject VARCHAR(10) NOT NULL);
CREATE TABLE student_teacher (student INT, teacher VARCHAR(10), PRIMARY KEY (student, teacher), FOREIGN KEY (teacher) REFERENCES teacher_subject(teacher));
INSERT INTO teacher_subject VALUES ('Rao','SQL'),('Iyer','Java');
INSERT INTO student_teacher VALUES (1,'Rao'),(2,'Rao'),(1,'Iyer');

-- OUTPUT:
-- Query OK, 3 rows affected`],
        [`Mistakes: over-normalizing without reason, and losing the ability to enforce a rule. In the decomposed design "a student cannot take the same subject twice" is no longer a simple key; enforce it with a view and a trigger, or accept 3NF.`,
            r`INSERT INTO teacher_subject VALUES ('Nair','SQL');
INSERT INTO student_teacher VALUES (1,'Nair');       -- student 1 now has SQL twice (Rao and Nair); the original key (student, subject) is lost
SELECT st.student, ts.subject, COUNT(*) FROM student_teacher st JOIN teacher_subject ts USING (teacher) GROUP BY st.student, ts.subject HAVING COUNT(*) > 1;

-- OUTPUT:
-- student | subject | COUNT(*)
--       1 | SQL     |        2`],
        [`BCNF decomposition may need extra joins; confirm the join paths are indexed and that the read pattern justifies the change. Rebuild the original shape with a view when applications need it.`,
            r`CREATE VIEW enrol_view AS SELECT st.student, ts.subject, st.teacher FROM student_teacher st JOIN teacher_subject ts ON ts.teacher = st.teacher;
EXPLAIN SELECT * FROM enrol_view WHERE student = 1;

-- OUTPUT: (example)
-- student_teacher: type=ref key=PRIMARY;  teacher_subject: type=eq_ref key=PRIMARY`],
        [`Real-world: most teams aim for 3NF and apply BCNF only where an overlapping-key anomaly is actually observed, for example room and time slot scheduling tables.`,
            r`-- schedule rule: a room at a time hosts one class; an instructor teaches in one room at a time
CREATE TABLE schedule (room VARCHAR(10), slot DATETIME, class_id INT, instructor INT, UNIQUE KEY uq_room_slot (room, slot), UNIQUE KEY uq_instr_slot (instructor, slot));
INSERT INTO schedule VALUES ('R1','2026-05-04 09:00',10,1);
INSERT INTO schedule VALUES ('R2','2026-05-04 09:00',11,1);

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-2026-05-04 09:00:00' for key 'schedule.uq_instr_slot'`]
    ),

    'Denormalization': dv(
        [`Denormalization stores redundant data deliberately to remove joins or aggregations from hot read paths. It trades extra storage and write cost for read speed, so it is only justified by measurement. The redundant data must have a single source of truth and a defined way to stay in sync.`,
            r`-- measure first: how slow is the normalized query?
EXPLAIN ANALYZE SELECT o.id, SUM(i.qty * i.unit_price) FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.customer_id = 7 GROUP BY o.id;
ALTER TABLE orders ADD COLUMN total DECIMAL(12,2) NOT NULL DEFAULT 0;
UPDATE orders o SET total = (SELECT COALESCE(SUM(qty * unit_price), 0) FROM order_items i WHERE i.order_id = o.id);

-- OUTPUT: (example)
-- before: nested loop join + temporary aggregate, 18 ms
-- after : SELECT id, total FROM orders WHERE customer_id = 7  0.2 ms`],
        [`Techniques: stored summary columns, copied lookup values, generated columns (always consistent inside a row), summary tables, and counter tables. Pick the one whose synchronisation is simplest.`,
            r`ALTER TABLE order_items ADD COLUMN line_total DECIMAL(12,2) AS (qty * unit_price) STORED;
CREATE TABLE customer_stats (customer_id BIGINT PRIMARY KEY, orders INT NOT NULL DEFAULT 0, spent DECIMAL(14,2) NOT NULL DEFAULT 0);
INSERT INTO customer_stats SELECT customer_id, COUNT(*), SUM(total) FROM orders GROUP BY customer_id;

-- OUTPUT:
-- Query OK, 4200 rows affected`],
        [`Mistakes: denormalizing without reconciliation, updating the copy in a different transaction than the source, and counters on one hot row. Update in the same transaction or recompute, and always add a drift check query.`,
            r`SELECT o.id FROM orders o JOIN (SELECT order_id, SUM(qty * unit_price) AS s FROM order_items GROUP BY order_id) x ON x.order_id = o.id WHERE o.total <> x.s;

-- OUTPUT:
-- id
-- 812         (drifted: total does not equal the sum of the lines)`],
        [`Hot counters contend for one row lock. Spread writes over several slots and sum them on read, or aggregate asynchronously in batches.`,
            r`CREATE TABLE counter_slots (name VARCHAR(30), slot TINYINT, value BIGINT NOT NULL DEFAULT 0, PRIMARY KEY (name, slot));
INSERT INTO counter_slots VALUES ('page_views', FLOOR(RAND() * 16), 1) ON DUPLICATE KEY UPDATE value = value + 1;
SELECT name, SUM(value) AS total FROM counter_slots GROUP BY name;

-- OUTPUT:
-- name       | total
-- page_views | 90421`],
        [`Real-world: a product listing shows rating and review count on every card. Store them on the product, update them transactionally when a review is added, and run a nightly reconciliation.`,
            r`START TRANSACTION;
INSERT INTO reviews (product_id, user_id, stars) VALUES (7, 1, 5);
UPDATE products SET review_count = review_count + 1, rating_sum = rating_sum + 5 WHERE id = 7;
COMMIT;
SELECT id, ROUND(rating_sum / NULLIF(review_count, 0), 1) AS avg_rating, review_count FROM products WHERE id = 7;

-- OUTPUT:
-- id | avg_rating | review_count
--  7 |        4.6 |          128`]
    ),

    'Alternate Key': dv(
        [`An alternate key is any candidate key not chosen as the primary key. In MySQL it is a UNIQUE NOT NULL index. It is a normal secondary index that stores the primary key value, so lookups by it need a second step into the clustered index unless the query is covered.`,
            r`CREATE TABLE app_users (id BIGINT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(120) NOT NULL, username VARCHAR(30) NOT NULL, name VARCHAR(60),
  UNIQUE KEY uq_email (email), UNIQUE KEY uq_username (username));
EXPLAIN SELECT id FROM app_users WHERE email = 'a@x.com';
EXPLAIN SELECT name FROM app_users WHERE email = 'a@x.com';

-- OUTPUT: (example)
-- first : type=const key=uq_email Extra=Using index     (id is in the index)
-- second: type=const key=uq_email Extra=NULL            (lookup into the clustered index for name)`],
        [`Foreign keys may reference an alternate key, and you can mark which key is the "business key" by naming. Composite alternate keys and functional unique keys express rules such as case-insensitive uniqueness.`,
            r`CREATE TABLE login_audit (id BIGINT PRIMARY KEY AUTO_INCREMENT, username VARCHAR(30) NOT NULL, at DATETIME NOT NULL, FOREIGN KEY (username) REFERENCES app_users(username));
CREATE UNIQUE INDEX uq_email_lower ON app_users ((LOWER(email)));
SELECT constraint_name, referenced_column_name FROM information_schema.key_column_usage WHERE table_name = 'login_audit' AND referenced_table_name IS NOT NULL;

-- OUTPUT:
-- constraint_name   | referenced_column_name
-- login_audit_ibfk_1 | username`],
        [`Mistakes: nullable alternate keys (many NULLs are allowed, so uniqueness is not guaranteed), forgetting collation effects, and using a long string as an alternate key that bloats every index. Make them NOT NULL and keep them short.`,
            r`CREATE TABLE codes (id INT PRIMARY KEY, code VARCHAR(10), UNIQUE KEY uq_code (code));
INSERT INTO codes VALUES (1, NULL), (2, NULL);       -- allowed
ALTER TABLE codes MODIFY code VARCHAR(10) NOT NULL;

-- OUTPUT:
-- ERROR 1138 (22004): Invalid use of NULL value     (clean existing NULLs first)`],
        [`Each alternate key is another B-tree to maintain on every write and another structure in the buffer pool. Keep only those used for lookups or required for integrity, and drop unused ones.`,
            r`SELECT * FROM sys.schema_unused_indexes WHERE object_schema = 'shop';
SELECT * FROM sys.schema_redundant_indexes WHERE table_schema = 'shop';

-- OUTPUT: (example)
-- object_name | index_name
-- app_users   | idx_old_username`],
        [`Real-world: expose a stable public identifier (UUID) as an alternate key while the internal BIGINT stays the primary key, so URLs do not leak counts and shards can generate ids independently.`,
            r`ALTER TABLE orders ADD COLUMN public_id BINARY(16) NOT NULL DEFAULT (UUID_TO_BIN(UUID(), 1)), ADD UNIQUE KEY uq_public_id (public_id);
SELECT id FROM orders WHERE public_id = UUID_TO_BIN('11ef0a52-3c1d-8b23-9e66-0242ac110002', 1);

-- OUTPUT:
-- id
-- 9120`]
    ),

    'Natural Key vs Surrogate Key': dv(
        [`In InnoDB the primary key is the clustered index and is copied into every secondary index entry. A short, monotonic surrogate key (BIGINT AUTO_INCREMENT) keeps the tree compact and inserts sequential; a long or random natural key makes every index larger and splits pages.`,
            r`CREATE TABLE cust_nat (email VARCHAR(120) PRIMARY KEY, name VARCHAR(40), KEY idx_name (name));
CREATE TABLE cust_sur (id BIGINT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(120) NOT NULL UNIQUE, name VARCHAR(40), KEY idx_name (name));
SELECT table_name, ROUND(data_length/1048576,1) AS data_mb, ROUND(index_length/1048576,1) AS index_mb FROM information_schema.tables WHERE table_name IN ('cust_nat','cust_sur');

-- OUTPUT: (example, 5M rows)
-- table_name | data_mb | index_mb
-- cust_nat   |   720.0 |   410.0        (idx_name stores the 120-byte email as pointer)
-- cust_sur   |   510.0 |   290.0`],
        [`Options: auto-increment ids, UUIDv7/ULID (time-ordered, globally unique), snowflake ids, and natural keys for tiny stable reference data such as ISO country codes (CHAR(2)). Keep natural uniqueness as a UNIQUE constraint.`,
            r`CREATE TABLE countries (code CHAR(2) PRIMARY KEY, name VARCHAR(60));             -- stable natural key
CREATE TABLE customers (id BIGINT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(120) NOT NULL, country CHAR(2) NOT NULL,
  UNIQUE KEY uq_email (email), FOREIGN KEY (country) REFERENCES countries(code));
INSERT INTO countries VALUES ('IN','India');
INSERT INTO customers (email, country) VALUES ('a@x.com','IN');

-- OUTPUT:
-- Query OK, 1 row affected`],
        [`Mistakes: using an email or phone as the primary key (changes ripple through every child table), random UUIDv4 strings (page splits), and exposing sequential ids publicly (enumeration). Keep the surrogate internal and add a separate public id.`,
            r`UPDATE cust_nat SET email = 'new@x.com' WHERE email = 'a@x.com';      -- with ON UPDATE CASCADE this rewrites every child row and index entry
UPDATE cust_sur SET email = 'new@x.com' WHERE id = 1;                  -- one row

-- OUTPUT:
-- Query OK, 1 row affected   (plus cascaded updates in all child tables for the natural key)`],
        [`Insert speed differs: monotonic keys append at the right edge, random keys land anywhere. Compare time and fragmentation for sequential and random keys of the same size.`,
            r`-- 1M inserts
-- AUTO_INCREMENT BIGINT : ~ 6 s,  table 44 MB,  fill factor ~ 94 %
-- UUID v4 CHAR(36)       : ~ 24 s, table 96 MB,  fill factor ~ 69 %
-- UUID v7 BINARY(16)     : ~ 8 s,  table 52 MB,  fill factor ~ 90 %

SELECT 24 / 6 AS random_key_slowdown;

-- OUTPUT:
-- random_key_slowdown
-- 4.0000`],
        [`Real-world: distributed systems need ids generated without a central counter. A time-ordered UUID in BINARY(16) gives uniqueness and good locality.`,
            r`CREATE TABLE events (id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID(), 1)), kind VARCHAR(20) NOT NULL, created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3));
INSERT INTO events (kind) VALUES ('login'), ('logout');
SELECT BIN_TO_UUID(id, 1) AS id, kind FROM events ORDER BY id;

-- OUTPUT:
-- id                                   | kind
-- 11ef0a52-3c1d-8b23-9e66-0242ac110002 | login`]
    ),

    'Primary Key vs Unique Key': dv(
        [`Both are backed by unique B-tree indexes, but the primary key is the clustered index: the leaf level stores the full row. A unique key is a secondary index whose leaf stores the key columns plus the primary key. That is why PK lookups return rows directly and unique-key lookups need an extra step for non-covered columns.`,
            r`CREATE TABLE members (id BIGINT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(100) NOT NULL, nick VARCHAR(30), bio TEXT, UNIQUE KEY uq_email (email), UNIQUE KEY uq_nick (nick));
EXPLAIN SELECT * FROM members WHERE id = 1;
EXPLAIN SELECT * FROM members WHERE email = 'a@x.com';

-- OUTPUT: (example)
-- PK    : type=const key=PRIMARY
-- unique: type=const key=uq_email (then a lookup in the clustered index for the rest)`],
        [`Differences in syntax and behaviour: one PRIMARY KEY per table (no NULLs), many UNIQUE keys (NULLs allowed, multiple NULLs allowed), the PK is named PRIMARY, only the PK defines the clustering, and replication tools prefer the PK.`,
            r`INSERT INTO members (email, nick) VALUES ('a@x.com', NULL), ('b@x.com', NULL);       -- two NULL nicks: fine for UNIQUE
INSERT INTO members (id, email) VALUES (NULL, 'c@x.com');                         -- id gets AUTO_INCREMENT
SHOW KEYS FROM members WHERE Non_unique = 0;

-- OUTPUT:
-- Key_name | Column_name | Non_unique
-- PRIMARY  | id          | 0
-- uq_email | email       | 0
-- uq_nick  | nick        | 0`],
        [`Mistakes: no primary key (InnoDB invents a hidden one and row-based replication becomes slow), promoting a nullable unique column to a primary key (impossible), and expecting UNIQUE to reject duplicate NULLs. Define an explicit PK on every table.`,
            r`SELECT t.table_name FROM information_schema.tables t LEFT JOIN information_schema.statistics s ON s.table_schema = t.table_schema AND s.table_name = t.table_name AND s.index_name = 'PRIMARY'
WHERE t.table_schema = DATABASE() AND t.table_type = 'BASE TABLE' AND s.index_name IS NULL;

-- OUTPUT:
-- table_name
-- legacy_import        (needs a primary key)`],
        [`Choose the primary key for physical effects (size, order) and unique keys for business rules. Changing the PK later rebuilds the table and every secondary index, so decide early.`,
            r`ALTER TABLE members DROP PRIMARY KEY, ADD PRIMARY KEY (tenant_id, id), ALGORITHM=COPY;

-- OUTPUT:
-- Query OK, 5000000 rows affected (2 min 41 sec)      (full rebuild: plan a maintenance window or use gh-ost)`],
        [`Real-world: multi-tenant tables put tenant_id first in the primary key so each tenant's rows are contiguous, with a unique key on (tenant_id, email) for the business rule.`,
            r`CREATE TABLE tenant_users (tenant_id INT NOT NULL, id BIGINT NOT NULL AUTO_INCREMENT, email VARCHAR(120) NOT NULL, PRIMARY KEY (tenant_id, id), KEY (id), UNIQUE KEY uq_tenant_email (tenant_id, email));
EXPLAIN SELECT id FROM tenant_users WHERE tenant_id = 3 AND email = 'a@x.com';

-- OUTPUT: (example)
-- type  | key             | Extra
-- const | uq_tenant_email | Using index`]
    )
};
