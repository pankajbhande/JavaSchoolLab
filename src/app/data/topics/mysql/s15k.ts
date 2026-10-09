// Module 15 (Normalization), part K: redundancy, 1NF, 2NF.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s15k: Record<string, DeepDive> = {
    'Data Redundancy & Functional Dependency': dd(
        [`<b>Redundancy</b> is the same fact stored in more than one place. A <b>functional dependency (FD)</b> <code>A -&gt; B</code> means: if two rows have the same A they must have the same B (product_id determines product_name). Normalization is the discipline of removing redundancy that FDs reveal.`,
            r`-- One flat table that mixes orders, products and customers
CREATE TABLE order_flat (
    order_id INT, product_id INT, product_name VARCHAR(30), unit_price DECIMAL(8,2),
    cust_name VARCHAR(30), cust_city VARCHAR(30), qty INT,
    PRIMARY KEY (order_id, product_id)
);
INSERT INTO order_flat VALUES
 (1,7,'Pen', 10.00,'Asha','Pune', 3),
 (1,8,'Book',50.00,'Asha','Pune', 1),
 (2,7,'Pen', 10.00,'Ravi','Delhi',5);
SELECT * FROM order_flat;

-- OUTPUT:
-- +----------+------------+--------------+------------+-----------+-----------+------+
-- | order_id | product_id | product_name | unit_price | cust_name | cust_city | qty  |
-- +----------+------------+--------------+------------+-----------+-----------+------+
-- |        1 |          7 | Pen          |      10.00 | Asha      | Pune      |    3 |
-- |        1 |          8 | Book         |      50.00 | Asha      | Pune      |    1 |
-- |        2 |          7 | Pen          |      10.00 | Ravi      | Delhi     |    5 |
-- +----------+------------+--------------+------------+-----------+-----------+------+
-- "Pen/10.00" and "Asha/Pune" are repeated: product_id -> name,price  and  order_id -> customer.`],
        [`Redundant copies drift apart. A single price change must touch every row that repeats it, and missing one produces a database that contradicts itself, which no query can fix afterwards.`,
            r`-- Update anomaly: the price is changed on only one of the Pen rows
UPDATE order_flat SET unit_price = 12.00 WHERE order_id = 1 AND product_id = 7;

SELECT product_id, COUNT(DISTINCT unit_price) AS prices
FROM order_flat GROUP BY product_id ORDER BY product_id;

-- OUTPUT:
-- +------------+--------+
-- | product_id | prices |
-- +------------+--------+
-- |          7 |      2 |        <- Pen now has two prices
-- |          8 |      1 |
-- +------------+--------+`],
        [`Data engineers check a suspected FD with a GROUP BY: if any left-hand value maps to more than one right-hand value, the dependency does not hold. An empty result means the data is consistent with it.`,
            r`-- Test the FD  product_id -> product_name  (reset the price first so only names matter)
SELECT product_id
FROM order_flat
GROUP BY product_id
HAVING COUNT(DISTINCT product_name) > 1;         -- violators of the dependency

-- OUTPUT:
-- Empty set (0.00 sec)

-- Test order_id -> cust_city  (expected to hold too)
SELECT order_id FROM order_flat GROUP BY order_id HAVING COUNT(DISTINCT cust_city) > 1;
-- OUTPUT:
-- Empty set (0.00 sec)`],
        [`<b>Advantages of studying FDs:</b> they tell you exactly which attributes belong together, which sets are keys, and where to cut a table into smaller, anomaly-free tables.`,
            r`-- Candidate-key check using the FDs: does (order_id, product_id) determine everything?
SELECT COUNT(*) AS rows_total,
       COUNT(DISTINCT order_id, product_id) AS distinct_keys
FROM order_flat;

-- OUTPUT:
-- +------------+---------------+
-- | rows_total | distinct_keys |
-- +------------+---------------+
-- |          3 |             3 |
-- +------------+---------------+
-- Equal counts: the pair is a key, and every other column is a function of it.`],
        [`<b>Disadvantages:</b> FDs cannot be proven from data. A query can only show that the current rows do not violate a dependency; the real rule comes from the business. Small samples satisfy many accidental FDs.`,
            r`-- On this tiny sample, qty looks like it "determines" cust_name... by accident
SELECT qty FROM order_flat GROUP BY qty HAVING COUNT(DISTINCT cust_name) > 1;

-- OUTPUT:
-- Empty set (0.00 sec)
-- Yet nothing in the business says quantity decides the customer; do not model it.`],
        [`<b>Limitations:</b> a flat table also suffers insertion and deletion anomalies: you cannot record a product that has not been ordered yet, and deleting the last order for a product erases the product itself.`,
            r`INSERT INTO order_flat (product_id, product_name, unit_price) VALUES (9,'Pencil',5.00);

-- OUTPUT:
-- ERROR 1364 (HY000): Field 'order_id' doesn't have a default value

-- Deletion anomaly: the Book row is the only record of the Book product
DELETE FROM order_flat WHERE product_id = 8;     -- product 8 is now unknown to the database`],
        `
   order_flat  (order_id, product_id | product_name, unit_price, cust_name, cust_city, qty)
                  │          │               ▲   ▲                ▲   ▲        ▲
                  │          └─ product_id ──┘───┘   (FD)         │   │        │
                  └──────── order_id ────────────────────────────┘───┘        │
                  └────────────── (order_id, product_id) ─────────────────────┘
   Each arrow is a functional dependency; each one points at a table waiting to be split out.
`,
        `List the FDs from business rules before drawing tables, then confirm them with GROUP BY checks on real data as a sanity test, never as proof. Redundancy is a defect in the write path (anomalies) but sometimes a deliberate feature of the read path, so the goal is controlled redundancy, not zero redundancy.`
    ),

    '1NF': dd(
        [`A table is in <b>First Normal Form</b> when every column holds a single atomic value (no lists in a cell), there are no repeating column groups (phone1, phone2, phone3), and every row is uniquely identifiable by a key.`,
            r`-- Violates 1NF: a list inside one column
CREATE TABLE person_bad (id INT PRIMARY KEY, name VARCHAR(20), phones VARCHAR(60));
INSERT INTO person_bad VALUES (1,'Asha','98450,98451'),(2,'Ravi','99000');

-- 1NF fix: one phone per row in a child table
CREATE TABLE person (id INT PRIMARY KEY, name VARCHAR(20));
CREATE TABLE person_phone (person_id INT, phone VARCHAR(15),
    PRIMARY KEY (person_id, phone), FOREIGN KEY (person_id) REFERENCES person(id));
INSERT INTO person VALUES (1,'Asha'),(2,'Ravi');
INSERT INTO person_phone VALUES (1,'98450'),(1,'98451'),(2,'99000');
SELECT * FROM person_phone ORDER BY person_id, phone;

-- OUTPUT:
-- +-----------+-------+
-- | person_id | phone |
-- +-----------+-------+
-- |         1 | 98450 |
-- |         1 | 98451 |
-- |         2 | 99000 |
-- +-----------+-------+`],
        [`Lists in a cell cannot be searched with an index, validated per item, or joined. Each query becomes string surgery and every rule has to be re-implemented in application code.`,
            r`-- Finding the owner of phone 98451: pattern matching, full scan, false positives possible
SELECT name FROM person_bad WHERE phones LIKE '%98451%';

-- 1NF version: exact match on an indexed column
SELECT p.name FROM person p
JOIN person_phone pp ON pp.person_id = p.id
WHERE pp.phone = '98451';

-- OUTPUT (both):
-- +------+
-- | name |
-- +------+
-- | Asha |
-- +------+`],
        [`Spreadsheet imports often arrive with repeating columns (phone1, phone2, phone3). Converting them to rows is a routine ETL step, here written with UNION ALL.`,
            r`CREATE TABLE import_wide (id INT, phone1 VARCHAR(15), phone2 VARCHAR(15), phone3 VARCHAR(15));
INSERT INTO import_wide VALUES (1,'98450','98451',NULL),(2,'99000',NULL,NULL);

SELECT id, phone FROM (
    SELECT id, phone1 AS phone FROM import_wide
    UNION ALL SELECT id, phone2 FROM import_wide
    UNION ALL SELECT id, phone3 FROM import_wide
) AS x
WHERE phone IS NOT NULL
ORDER BY id, phone;

-- OUTPUT:
-- +------+-------+
-- | id   | phone |
-- +------+-------+
-- |    1 | 98450 |
-- |    1 | 98451 |
-- |    2 | 99000 |
-- +------+-------+`],
        [`<b>Advantages:</b> each value can be constrained, indexed, counted and joined on its own, and there is no limit of "three phones".`,
            r`SELECT p.name, COUNT(pp.phone) AS phone_count
FROM person p LEFT JOIN person_phone pp ON pp.person_id = p.id
GROUP BY p.id, p.name ORDER BY p.id;

INSERT INTO person_phone VALUES (1,'98450');       -- duplicate phone for the same person

-- OUTPUT (first query):          OUTPUT (insert):
-- +------+-------------+         ERROR 1062 (23000): Duplicate entry '1-98450' for key
-- | name | phone_count |         'person_phone.PRIMARY'
-- +------+-------------+
-- | Asha |           2 |
-- | Ravi |           1 |
-- +------+-------------+`],
        [`<b>Disadvantages:</b> more rows and more joins, and displaying the data as one line needs aggregation to put the list back together.`,
            r`SELECT p.name, GROUP_CONCAT(pp.phone ORDER BY pp.phone) AS phones
FROM person p JOIN person_phone pp ON pp.person_id = p.id
GROUP BY p.id, p.name ORDER BY p.id;

-- OUTPUT:
-- +------+-------------+
-- | name | phones      |
-- +------+-------------+
-- | Asha | 98450,98451 |
-- | Ravi | 99000       |
-- +------+-------------+`],
        [`<b>Limitations:</b> "atomic" depends on how the data is used. A DATE has year, month and day parts yet is treated as atomic because queries use it as a unit, and MySQL allows JSON columns, which hold structured values by design.`,
            r`SELECT d, YEAR(d) AS y, MONTH(d) AS m
FROM (SELECT DATE '2026-10-06' AS d) AS t;       -- one atomic column, parts extractable

-- OUTPUT:
-- +------------+------+------+
-- | d          | y    | m    |
-- +------------+------+------+
-- | 2026-10-06 | 2026 |   10 |
-- +------------+------+------+`],
        `
   NOT 1NF                          1NF
   ┌────┬──────┬─────────────┐      ┌────┬──────┐     ┌───────────┬───────┐
   │ id │ name │ phones      │      │ id │ name │     │ person_id │ phone │
   ├────┼──────┼─────────────┤      ├────┼──────┤     ├───────────┼───────┤
   │  1 │ Asha │ 98450,98451 │ ──►  │  1 │ Asha │◄────│     1     │ 98450 │
   └────┴──────┴─────────────┘      └────┴──────┘     │     1     │ 98451 │
        list in one cell                               └───────────┴───────┘
`,
        `1NF is non-negotiable for data you filter, join or constrain. For opaque payloads that you only store and return (webhook bodies, user preferences), a JSON column is a pragmatic exception, but index any field you search through a generated column and keep a relational column for anything with an integrity rule.`
    ),

    '2NF': dd(
        [`A table is in <b>Second Normal Form</b> when it is in 1NF and no non-key column depends on <i>part</i> of a composite key. In order_flat the key is (order_id, product_id), but product_name depends only on product_id, a partial dependency. Fix it by moving that data to its own table.`,
            r`-- Split order_flat: product facts depend on product_id alone
CREATE TABLE product (product_id INT PRIMARY KEY, product_name VARCHAR(30), unit_price DECIMAL(8,2));
CREATE TABLE order_item (
    order_id INT, product_id INT, qty INT,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id)
);
INSERT INTO product    VALUES (7,'Pen',10.00),(8,'Book',50.00);
INSERT INTO order_item VALUES (1,7,3),(1,8,1),(2,7,5);
SELECT i.order_id, p.product_name, i.qty
FROM order_item i JOIN product p ON p.product_id = i.product_id
ORDER BY i.order_id, p.product_name;

-- OUTPUT:
-- +----------+--------------+------+
-- | order_id | product_name | qty  |
-- +----------+--------------+------+
-- |        1 | Book         |    1 |
-- |        1 | Pen          |    3 |
-- |        2 | Pen          |    5 |
-- +----------+--------------+------+`],
        [`Partial dependencies cause update, insert and delete anomalies: the same product facts repeat in every order that includes it. After the split, each product fact exists exactly once.`,
            r`UPDATE product SET unit_price = 12.00 WHERE product_id = 7;   -- one row, every order sees it
SELECT product_id, unit_price FROM product ORDER BY product_id;

-- OUTPUT:
-- Query OK, 1 row affected
-- +------------+------------+
-- | product_id | unit_price |
-- +------------+------------+
-- |          7 |      12.00 |
-- |          8 |      50.00 |
-- +------------+------------+`],
        [`Careful: an order must usually keep the price <i>at the time of sale</i>. That column depends on the whole key (this product in this order), so storing price in order_item is correct and is not a 2NF violation. Normal forms follow the real business rule.`,
            r`ALTER TABLE order_item ADD COLUMN sold_price DECIMAL(8,2);    -- snapshot of the price at sale time
UPDATE order_item i JOIN product p ON p.product_id = i.product_id
SET i.sold_price = 10.00 WHERE p.product_id = 7;                 -- sales made at the old price
SELECT order_id, product_id, sold_price FROM order_item WHERE product_id = 7 ORDER BY order_id;

-- OUTPUT:
-- +----------+------------+------------+
-- | order_id | product_id | sold_price |
-- +----------+------------+------------+
-- |        1 |          7 |      10.00 |
-- |        2 |          7 |      10.00 |
-- +----------+------------+------------+
-- Product list price is now 12.00, history stays 10.00.`],
        [`<b>Advantages:</b> the decomposition is <i>lossless</i>: joining the pieces gives back exactly the original data, with smaller rows and no repeated facts.`,
            r`-- Reconstruct and compare row count with the original 3 rows
SELECT COUNT(*) AS rebuilt_rows
FROM order_item i JOIN product p ON p.product_id = i.product_id;

-- OUTPUT:
-- +--------------+
-- | rebuilt_rows |
-- +--------------+
-- |            3 |
-- +--------------+`],
        [`<b>Disadvantages:</b> reading an order now requires a join, and more tables mean more keys, more indexes and more places to forget a foreign key.`,
            r`EXPLAIN SELECT i.order_id, p.product_name
FROM order_item i JOIN product p ON p.product_id = i.product_id WHERE i.order_id = 1;

-- OUTPUT (example, trimmed):
-- | table | type   | key     | ref                         | rows |
-- | i     | ref    | PRIMARY | const                       |    2 |
-- | p     | eq_ref | PRIMARY | shop.i.product_id           |    1 |
-- Two lookups instead of one row; cheap with indexes, but not free.`],
        [`<b>Limitations:</b> 2NF only matters for composite keys. A table with a single-column primary key is automatically in 2NF, yet it can still hold transitive dependencies (see 3NF).`,
            r`-- Single-column PK, so automatically 2NF, but dept_name depends on dept_id, not on emp_id
CREATE TABLE emp (emp_id INT PRIMARY KEY, name VARCHAR(20), dept_id INT, dept_name VARCHAR(20));
INSERT INTO emp VALUES (1,'Asha',10,'IT'),(2,'Ravi',10,'IT');
SELECT dept_id, dept_name, COUNT(*) AS copies FROM emp GROUP BY dept_id, dept_name;

-- OUTPUT:
-- +---------+-----------+--------+
-- | dept_id | dept_name | copies |
-- +---------+-----------+--------+
-- |      10 | IT        |      2 |      <- repeated fact survives 2NF
-- +---------+-----------+--------+`],
        `
   BEFORE (key = order_id + product_id)       AFTER 2NF
   ┌───────┬───────┬──────────────┬─────┐     product                 order_item
   │ order │ prod  │ product_name │ qty │     ┌──────┬──────┐         ┌───────┬──────┬─────┐
   └───────┴───┬───┴──────▲───────┴─────┘     │ prod │ name │◄────────│ order │ prod │ qty │
               └──────────┘                    └──────┴──────┘   FK    └───────┴──────┴─────┘
        name depends on prod only (partial)    every column now depends on its whole key
`,
        `Apply 2NF whenever you see a composite key and a column that mentions only half of it. Keep columns that genuinely belong to the whole key, such as the price at the time of sale, even when they look duplicated. In transactional systems prefer a surrogate key on the fact table and a UNIQUE on the business pair.`
    ),
};
