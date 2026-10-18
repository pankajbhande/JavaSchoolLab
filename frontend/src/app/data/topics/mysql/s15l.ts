// Module 15 (Normalization), part L: 3NF, BCNF, Denormalization.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s15l: Record<string, DeepDive> = {
    '3NF': dd(
        [`A table is in <b>Third Normal Form</b> when it is in 2NF and no non-key column depends on another non-key column (no <i>transitive</i> dependency). Memory aid: every attribute depends on the key, the whole key, and nothing but the key.`,
            r`-- Violates 3NF: order_id -> cust_id -> cust_name, cust_city
CREATE TABLE orders_bad (order_id INT PRIMARY KEY, cust_id INT, cust_name VARCHAR(20), cust_city VARCHAR(20));
INSERT INTO orders_bad VALUES (1,5,'Abaji','Pune'),(2,5,'Abaji','Pune'),(3,6,'Raoji','Delhi');

-- 3NF: customer facts move to a customer table
CREATE TABLE customer (cust_id INT PRIMARY KEY, cust_name VARCHAR(20), cust_city VARCHAR(20));
CREATE TABLE orders (order_id INT PRIMARY KEY, cust_id INT,
    FOREIGN KEY (cust_id) REFERENCES customer(cust_id));
INSERT INTO customer VALUES (5,'Abaji','Pune'),(6,'Raoji','Delhi');
INSERT INTO orders   VALUES (1,5),(2,5),(3,6);
SELECT o.order_id, c.cust_name, c.cust_city
FROM orders o JOIN customer c ON c.cust_id = o.cust_id ORDER BY o.order_id;

-- OUTPUT:
-- +----------+-----------+-----------+
-- | order_id | cust_name | cust_city |
-- +----------+-----------+-----------+
-- |        1 | Abaji     | Pune      |
-- |        2 | Abaji     | Pune      |
-- |        3 | Raoji     | Delhi     |
-- +----------+-----------+-----------+`],
        [`With the transitive dependency left in, Abaji moving cities means updating every one of her orders. Miss one and the database disagrees with itself about where she lives.`,
            r`-- Un-normalized: one UPDATE touches several rows and can be partial
UPDATE orders_bad SET cust_city = 'Mumbai' WHERE order_id = 1;   -- forgot orders 2

SELECT cust_id, COUNT(DISTINCT cust_city) AS cities FROM orders_bad GROUP BY cust_id;

-- 3NF: a single row changes
UPDATE customer SET cust_city = 'Mumbai' WHERE cust_id = 5;

-- OUTPUT (first query):
-- +---------+--------+
-- | cust_id | cities |
-- +---------+--------+
-- |       5 |      2 |      <- customer 5 lives in two cities?
-- |       6 |      1 |
-- +---------+--------+`],
        [`Typical 3NF splits: address data out of orders, department name out of employee, category name out of product, city and pincode out of address. Reporting joins them back with views.`,
            r`CREATE VIEW order_report AS
SELECT o.order_id, c.cust_name, c.cust_city
FROM orders o JOIN customer c ON c.cust_id = o.cust_id;

SELECT * FROM order_report WHERE cust_city = 'Mumbai';

-- OUTPUT:
-- +----------+-----------+-----------+
-- | order_id | cust_name | cust_city |
-- +----------+-----------+-----------+
-- |        1 | Abaji     | Mumbai    |
-- |        2 | Abaji     | Mumbai    |
-- +----------+-----------+-----------+`],
        [`<b>Advantages:</b> each fact has one home, so there are no update, insert or delete anomalies, storage is smaller and constraints (UNIQUE name, CHECK city) can be applied once.`,
            r`-- A customer can now exist before any order is placed (no insertion anomaly)
INSERT INTO customer VALUES (7,'Mina','Goa');
SELECT COUNT(*) AS customers_without_orders
FROM customer c LEFT JOIN orders o ON o.cust_id = c.cust_id WHERE o.order_id IS NULL;

-- OUTPUT:
-- +--------------------------+
-- | customers_without_orders |
-- +--------------------------+
-- |                        1 |
-- +--------------------------+`],
        [`<b>Disadvantages:</b> more joins per read. At large scale those joins, and the extra indexes they need, are measurable costs on hot read paths.`,
            r`EXPLAIN SELECT order_id, cust_name FROM order_report;

-- OUTPUT (example, trimmed):
-- | table | type   | key     | rows |
-- | o     | index  | cust_id |    3 |
-- | c     | eq_ref | PRIMARY |    1 |      <- one extra lookup per order row`],
        [`<b>Limitations:</b> 3NF still allows a dependency whose right side is part of a candidate key (X -&gt; prime attribute). Tables with overlapping candidate keys can be in 3NF and still show anomalies, which BCNF resolves.`,
            r`-- Each teacher teaches ONE subject (teacher -> subject), a student has one teacher per subject
CREATE TABLE enrol3 (student VARCHAR(10), subject VARCHAR(10), teacher VARCHAR(10),
    PRIMARY KEY (student, subject));
INSERT INTO enrol3 VALUES ('Abaji','Math','Rao'),('Raoji','Math','Rao'),('Abaji','Physics','Iyer');
SELECT * FROM enrol3 ORDER BY student, subject;

-- OUTPUT:
-- +---------+---------+---------+
-- | student | subject | teacher |
-- +---------+---------+---------+
-- | Abaji   | Math    | Rao     |
-- | Abaji   | Physics | Iyer    |
-- | Raoji   | Math    | Rao     |
-- +---------+---------+---------+
-- In 3NF (subject is a prime attribute) yet "Rao teaches Math" is stored twice: see BCNF.`],
        `
   orders_bad                              3NF
   order_id ──► cust_id ──► cust_name       orders(order_id, cust_id) ──FK──► customer(cust_id, name, city)
                      └───► cust_city
   key ──► non-key ──► non-key  (transitive)   every non-key column depends on its own table's key only
`,
        `Design to 3NF by default for OLTP, then measure. Expose the joined shape through views so application code stays simple, and denormalize only specific, measured hot paths. For snapshot data (prices, addresses on a shipped order), copy deliberately and document why.`
    ),

    'BCNF': dd(
        [`<b>Boyce-Codd Normal Form</b> is a stricter 3NF: for every functional dependency X -&gt; Y, X must be a <b>superkey</b> (a key or a superset of one). In enrol3, teacher -&gt; subject holds but teacher alone is not a key, so the table violates BCNF.`,
            r`-- BCNF decomposition of enrol3 (teacher -> subject)
CREATE TABLE teacher_subject (teacher VARCHAR(10) PRIMARY KEY, subject VARCHAR(10) NOT NULL);
CREATE TABLE student_teacher (
    student VARCHAR(10), teacher VARCHAR(10),
    PRIMARY KEY (student, teacher),
    FOREIGN KEY (teacher) REFERENCES teacher_subject(teacher)
);
INSERT INTO teacher_subject VALUES ('Rao','Math'),('Iyer','Physics');
INSERT INTO student_teacher VALUES ('Abaji','Rao'),('Raoji','Rao'),('Abaji','Iyer');
SELECT st.student, ts.subject, st.teacher
FROM student_teacher st JOIN teacher_subject ts ON ts.teacher = st.teacher
ORDER BY st.student, ts.subject;

-- OUTPUT:
-- +---------+---------+---------+
-- | student | subject | teacher |
-- +---------+---------+---------+
-- | Abaji   | Math    | Rao     |
-- | Abaji   | Physics | Iyer    |
-- | Raoji   | Math    | Rao     |
-- +---------+---------+---------+`],
        [`In the 3NF design nothing stops contradictory data: the rule "a teacher teaches one subject" is not backed by any key, so a bad row is accepted silently.`,
            r`-- enrol3 table from the 3NF topic: Rao now "teaches" Physics too, contradicting Math
INSERT INTO enrol3 VALUES ('Mina','Physics','Rao');       -- accepted by the PK (Mina, Physics)

SELECT teacher, COUNT(DISTINCT subject) AS subjects FROM enrol3 GROUP BY teacher ORDER BY teacher;

-- OUTPUT:
-- +---------+----------+
-- | teacher | subjects |
-- +---------+----------+
-- | Iyer    |        1 |
-- | Rao     |        2 |      <- violates teacher -> subject, undetected by the database
-- +---------+----------+`],
        [`Anywhere two independent keys overlap (room and time slots, instructor and subject, warehouse and region) BCNF appears. The decomposition turns the rule into a primary key so the engine enforces it.`,
            r`INSERT INTO teacher_subject VALUES ('Rao','Physics');   -- try the same contradiction after decomposition

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'Rao' for key 'teacher_subject.PRIMARY'`],
        [`<b>Advantages:</b> every dependency is guaranteed by a key, so the redundancy and anomalies caused by dependencies are eliminated completely, and rules are enforced declaratively.`,
            r`-- Change what Rao teaches: one row instead of every enrolment row
UPDATE teacher_subject SET subject = 'Statistics' WHERE teacher = 'Rao';
SELECT * FROM teacher_subject ORDER BY teacher;

-- OUTPUT:
-- +---------+------------+
-- | teacher | subject    |
-- +---------+------------+
-- | Iyer    | Physics    |
-- | Rao     | Statistics |
-- +---------+------------+`],
        [`<b>Disadvantages:</b> BCNF decomposition can lose <i>dependency preservation</i>. The original rule "a student has one teacher per subject" cannot be a key in the new tables, so the database can no longer enforce it declaratively.`,
            r`-- Abaji now has two Math teachers: allowed by PRIMARY KEY (student, teacher)
INSERT INTO teacher_subject VALUES ('Das','Statistics');
INSERT INTO student_teacher VALUES ('Abaji','Das');         -- Rao and Das both teach Abaji statistics

SELECT st.student, ts.subject, COUNT(*) AS teachers
FROM student_teacher st JOIN teacher_subject ts ON ts.teacher = st.teacher
GROUP BY st.student, ts.subject HAVING COUNT(*) > 1;

-- OUTPUT:
-- +---------+------------+----------+
-- | student | subject    | teachers |
-- +---------+------------+----------+
-- | Abaji   | Statistics |        2 |
-- +---------+------------+----------+`],
        [`<b>Limitations:</b> a lossless, dependency-preserving BCNF decomposition does not always exist. When it does not, you choose between BCNF (and a trigger or application check) or 3NF (and a stored redundancy).`,
            r`-- Workaround for the lost rule: enforce it with a trigger or a periodic check query.
-- A declarative alternative keeps a redundant column so a UNIQUE key can express it:
ALTER TABLE student_teacher ADD COLUMN subject VARCHAR(10);
ALTER TABLE student_teacher ADD UNIQUE KEY uq_student_subject (student, subject);
SHOW INDEX FROM student_teacher WHERE Key_name = 'uq_student_subject';

-- OUTPUT (example, trimmed):
-- | Table           | Non_unique | Key_name           | Seq_in_index | Column_name |
-- | student_teacher |          0 | uq_student_subject |            1 | student     |
-- | student_teacher |          0 | uq_student_subject |            2 | subject     |
-- (The subject copy must be kept equal to teacher_subject.subject; that is the price.)`],
        `
   enrol3 (3NF, not BCNF)                      BCNF split
   key: (student, subject)                     teacher_subject             student_teacher
   teacher ──► subject  (teacher not a key)    ┌─────────┬─────────┐       ┌─────────┬─────────┐
                                               │ teacher*│ subject │◄──────│ student │ teacher │
   determinant must be a (super)key ─────────► └─────────┴─────────┘  FK   └─────────┴─────────┘
                                                 * PRIMARY KEY            PK(student, teacher)
`,
        `Go to BCNF when the violating dependency is a real, frequently-edited business rule; stay at 3NF when decomposition would lose an important rule you cannot enforce cheaply. Document the decision, and back any non-key rule with a trigger, a check job, or a redundant column plus UNIQUE as shown.`
    ),

    'Denormalization': dd(
        [`<b>Denormalization</b> is the deliberate addition of redundancy to a normalized design to make reads faster or simpler. Typical forms: stored totals, counters, copied columns, and pre-aggregated summary tables.`,
            r`CREATE TABLE d_orders (id INT PRIMARY KEY, customer VARCHAR(20), item_count INT NOT NULL DEFAULT 0, total DECIMAL(10,2) NOT NULL DEFAULT 0);
CREATE TABLE d_item (order_id INT, line_no INT, price DECIMAL(8,2), qty INT,
    PRIMARY KEY (order_id, line_no));
START TRANSACTION;
INSERT INTO d_orders (id, customer) VALUES (1,'Abaji');
INSERT INTO d_item VALUES (1,1,10.00,3),(1,2,50.00,1);
UPDATE d_orders SET item_count = 2, total = 10.00*3 + 50.00*1 WHERE id = 1;   -- stored copy of the aggregate
COMMIT;
SELECT id, item_count, total FROM d_orders;

-- OUTPUT:
-- +----+------------+-------+
-- | id | item_count | total |
-- +----+------------+-------+
-- |  1 |          2 | 80.00 |
-- +----+------------+-------+`],
        [`Listing screens, dashboards and APIs read totals constantly but change them rarely. Computing SUM over joins on every read costs CPU and I/O; a stored value answers in a single indexed row.`,
            r`-- Normalized read: aggregate every time
SELECT o.id, SUM(i.price * i.qty) AS total
FROM d_orders o JOIN d_item i ON i.order_id = o.id GROUP BY o.id;

-- Denormalized read: just a column
SELECT id, total FROM d_orders;

-- OUTPUT (both):
-- +----+-------+
-- | id | total |
-- +----+-------+
-- |  1 | 80.00 |
-- +----+-------+`],
        [`Analytics systems maintain summary tables incrementally. Here each sale updates a daily total with an upsert, so reports read one row per day instead of scanning millions of sales.`,
            r`CREATE TABLE daily_sales (day DATE PRIMARY KEY, orders INT NOT NULL, revenue DECIMAL(12,2) NOT NULL);
INSERT INTO daily_sales VALUES ('2026-10-06', 1, 80.00)
ON DUPLICATE KEY UPDATE orders = orders + 1, revenue = revenue + 80.00;   -- first sale: inserts
INSERT INTO daily_sales VALUES ('2026-10-06', 1, 25.00)
ON DUPLICATE KEY UPDATE orders = orders + 1, revenue = revenue + 25.00;   -- second sale: updates
SELECT * FROM daily_sales;

-- OUTPUT:
-- +------------+--------+---------+
-- | day        | orders | revenue |
-- +------------+--------+---------+
-- | 2026-10-06 |      2 |  105.00 |
-- +------------+--------+---------+`],
        [`<b>Advantages:</b> faster reads, fewer joins, simpler queries. A STORED generated column gives a <i>safe</i> kind of redundancy: the engine recomputes it, so it can never drift.`,
            r`CREATE TABLE d_line (
    id INT PRIMARY KEY, price DECIMAL(8,2), qty INT,
    line_total DECIMAL(10,2) AS (price * qty) STORED      -- derived and always correct
);
INSERT INTO d_line (id, price, qty) VALUES (1,10.00,3);
UPDATE d_line SET qty = 4 WHERE id = 1;
SELECT * FROM d_line;

-- OUTPUT:
-- +----+-------+------+------------+
-- | id | price | qty  | line_total |
-- +----+-------+------+------------+
-- |  1 | 10.00 |    4 |      40.00 |
-- +----+-------+------+------------+`],
        [`<b>Disadvantages:</b> the copy can drift from the truth. Any code path that changes an item without updating the order total (a manual fix, a forgotten API, a failed job) leaves wrong numbers that look right.`,
            r`UPDATE d_item SET qty = 5 WHERE order_id = 1 AND line_no = 1;     -- total column not updated

-- Drift detector: stored total versus recomputed total
SELECT o.id, o.total AS stored, SUM(i.price * i.qty) AS actual
FROM d_orders o JOIN d_item i ON i.order_id = o.id
GROUP BY o.id, o.total HAVING o.total <> SUM(i.price * i.qty);

-- OUTPUT:
-- +----+--------+--------+
-- | id | stored | actual |
-- +----+--------+--------+
-- |  1 |  80.00 | 100.00 |
-- +----+--------+--------+`],
        [`<b>Limitations:</b> generated columns are row-local: they may use only deterministic expressions over the same row, not other tables, subqueries or functions like NOW(). Cross-table copies therefore need triggers, application code or batch jobs.`,
            r`CREATE TABLE bad_gen (id INT, created DATETIME AS (NOW()) STORED);

-- OUTPUT (example):
-- ERROR 3102 (HY000): Expression of generated column 'created' contains a disallowed function: now.

-- Keep cross-table aggregates correct with a repair statement run by a job:
UPDATE d_orders o
JOIN (SELECT order_id, SUM(price*qty) AS s, COUNT(*) AS c FROM d_item GROUP BY order_id) x
  ON x.order_id = o.id
SET o.total = x.s, o.item_count = x.c;`],
        `
   Normalized                         Denormalized
   orders ──< items                   orders (id, ..., item_count, total)   <- copy
      read = JOIN + SUM                    read = one indexed row
      write = 1 table                      write = items + keep the copy in sync
   Correct by construction            Fast reads, needs a sync strategy:
                                       generated column | trigger | app transaction | batch job
`,
        `Normalize first, denormalize with evidence: an EXPLAIN or slow-log entry that shows the join or aggregate is the bottleneck. Choose the safest mechanism available (generated column, then same-transaction update, then trigger, then async job), add a drift-detection query to monitoring, and record each denormalized column and its source of truth in the schema documentation.`
    ),
};
