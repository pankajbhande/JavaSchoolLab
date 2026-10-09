// Module 22 (Views), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s22k: Record<string, DeepDive> = {
    'CREATE, ALTER & DROP VIEW': dd(
        [`A <b>view</b> is a named, stored <code>SELECT</code>. It holds no data of its own; every time you query it, MySQL runs the underlying query. <code>CREATE VIEW</code> defines it, <code>ALTER VIEW</code> (or <code>CREATE OR REPLACE</code>) changes it, <code>DROP VIEW</code> removes it.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Asha','IT',900),(2,'Ben','HR',700),(3,'Cy','IT',800);

CREATE VIEW v_it AS
SELECT id, name, salary FROM emp WHERE dept = 'IT';   -- stored query only

SELECT * FROM v_it;

-- OUTPUT:
-- +----+-------+--------+
-- | id | name  | salary |
-- +----+-------+--------+
-- |  1 | Asha  |    900 |
-- |  3 | Cy    |    800 |
-- +----+-------+--------+`],
        [`Complex joins and filters get repeated across reports and services. A view gives them one name, one place to fix, and one stable interface even when the base tables are reorganised.`,
            r`-- Wrap a join once, reuse it everywhere.
CREATE TABLE dept (code VARCHAR(10) PRIMARY KEY, boss VARCHAR(20));
INSERT INTO dept VALUES ('IT','Rao'),('HR','Meena');

CREATE OR REPLACE VIEW v_emp_boss AS
SELECT e.name, e.dept, d.boss
FROM emp e JOIN dept d ON d.code = e.dept;

SELECT * FROM v_emp_boss WHERE dept = 'HR';

-- OUTPUT:
-- +------+------+--------+
-- | name | dept | boss   |
-- +------+------+--------+
-- | Ben  | HR   | Meena  |
-- +------+------+--------+`],
        [`Used for reporting layers, API read models, hiding column renames during migrations, and giving analysts a safe, simple surface. Inspect definitions with <code>SHOW CREATE VIEW</code> or information_schema.`,
            r`ALTER VIEW v_it AS
SELECT id, name, salary, dept FROM emp WHERE dept = 'IT';   -- add a column

SELECT table_name, is_updatable FROM information_schema.views WHERE table_schema = DATABASE();
DROP VIEW IF EXISTS v_emp_boss;

-- OUTPUT:
-- +------------+--------------+
-- | TABLE_NAME | IS_UPDATABLE |
-- +------------+--------------+
-- | v_emp_boss | YES          |
-- | v_it       | YES          |
-- +------------+--------------+`],
        [`<b>Advantages:</b> reuse, simpler queries, one definition to maintain, abstraction over schema changes, and column-level access control.`,
            r`-- Rename a base column, keep the old name for consumers via the view.
ALTER TABLE emp RENAME COLUMN salary TO pay;
CREATE OR REPLACE VIEW v_it AS
SELECT id, name, pay AS salary FROM emp WHERE dept = 'IT';
SELECT name, salary FROM v_it WHERE id = 1;

-- OUTPUT:
-- +-------+--------+
-- | name  | salary |
-- +-------+--------+
-- | Asha  |    900 |
-- +-------+--------+`],
        [`<b>Disadvantages:</b> hides cost (a simple-looking view may join five tables); nested views get slow and hard to debug; a view is not materialised, so nothing is cached.`,
            r`EXPLAIN SELECT * FROM v_it WHERE id = 3;     -- the optimizer merges the view into the base query

-- OUTPUT (key columns):
-- +-------------+-------+-------+------+
-- | select_type | table | type  | key  |
-- +-------------+-------+-------+------+
-- | SIMPLE      | emp   | const | PRIMARY |
-- +-------------+-------+-------+------+   <- v_it does not appear; it was merged`],
        [`<b>Limitations:</b> no indexes on a view itself; MySQL has no materialised views; the SELECT cannot contain a user variable or a temporary table; a view that depends on a dropped table becomes invalid and errors when used.`,
            r`CREATE TABLE tmp_x (a INT);
CREATE VIEW v_bad AS SELECT * FROM tmp_x;
DROP TABLE tmp_x;
SELECT * FROM v_bad;
CHECK TABLE v_bad;

-- OUTPUT:
-- ERROR 1356 (HY000): View 'db.v_bad' references invalid table(s) or column(s) or function(s)
--                     or definer/invoker of view lack rights to use them`],
        r`  app query                       MySQL
  SELECT ... FROM v_it  ----->  view definition (stored text in data dictionary)
                                    |  merge (or temp table)
                                    v
                       SELECT ... FROM emp WHERE dept='IT'
                                    |
                               base table rows

  CREATE VIEW / ALTER VIEW / DROP VIEW change only the definition, never data`,
        `Use views as a stable read contract, not as a performance tool. Keep them shallow (one or two levels), pick ALGORITHM = MERGE where possible, and for real precomputation use a summary table refreshed by an event or job.`
    ),

    'Updatable Views': dd(
        [`An <b>updatable view</b> lets you run <code>INSERT</code>, <code>UPDATE</code> and <code>DELETE</code> against it and MySQL forwards the change to the single base table. It must have a clear one-to-one mapping to rows.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), dept VARCHAR(10), salary INT);
INSERT INTO emp VALUES (1,'Asha','IT',900),(2,'Ben','HR',700);
CREATE VIEW v_it AS SELECT id, name, dept, salary FROM emp WHERE dept = 'IT';

UPDATE v_it SET salary = 950 WHERE id = 1;     -- changes base table emp
SELECT id, salary FROM emp WHERE id = 1;

-- OUTPUT:
-- +----+--------+
-- | id | salary |
-- +----+--------+
-- |  1 |    950 |
-- +----+--------+`],
        [`Apps can keep using the old table name via a view during a migration, or give a department a window onto just its own rows while still letting it edit them. <code>WITH CHECK OPTION</code> stops edits that would push a row out of the view.`,
            r`CREATE OR REPLACE VIEW v_it AS
SELECT id, name, dept, salary FROM emp WHERE dept = 'IT'
WITH CHECK OPTION;                              -- rows must keep satisfying dept='IT'

UPDATE v_it SET dept = 'HR' WHERE id = 1;       -- would leave the view

-- OUTPUT:
-- ERROR 1369 (HY000): CHECK OPTION failed 'db.v_it'`],
        [`Real use: multi-tenant tables where each tenant view filters <code>tenant_id</code> with CHECK OPTION, so a tenant can never write another tenant's rows.`,
            r`CREATE TABLE doc (id INT AUTO_INCREMENT PRIMARY KEY, tenant INT NOT NULL, title VARCHAR(30));
CREATE VIEW doc_t7 AS SELECT id, tenant, title FROM doc WHERE tenant = 7 WITH CHECK OPTION;

INSERT INTO doc_t7 (tenant, title) VALUES (7, 'ok');       -- accepted
INSERT INTO doc_t7 (tenant, title) VALUES (8, 'leak');     -- rejected

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 1369 (HY000): CHECK OPTION failed 'db.doc_t7'`],
        [`<b>Advantages:</b> transparent writes through an abstraction; CHECK OPTION enforces row-level rules; LOCAL and CASCADED options control nested views.`,
            r`SELECT table_name, is_updatable, check_option
FROM information_schema.views WHERE table_name IN ('v_it','doc_t7');

-- OUTPUT:
-- +------------+--------------+--------------+
-- | TABLE_NAME | IS_UPDATABLE | CHECK_OPTION |
-- +------------+--------------+--------------+
-- | doc_t7     | YES          | CASCADED     |
-- | v_it       | YES          | CASCADED     |
-- +------------+--------------+--------------+`],
        [`<b>Disadvantages:</b> easy to forget that a write lands in a table with defaults, triggers and constraints; rows can vanish from the view after an update unless CHECK OPTION is used.`,
            r`-- Without CHECK OPTION the row silently leaves the view.
CREATE OR REPLACE VIEW v_it AS SELECT id, name, dept, salary FROM emp WHERE dept='IT';
UPDATE v_it SET dept = 'HR' WHERE id = 1;
SELECT COUNT(*) AS in_view FROM v_it;

-- OUTPUT:
-- +---------+
-- | in_view |
-- +---------+
-- |       0 |
-- +---------+`],
        [`<b>Limitations:</b> a view is NOT updatable if it uses aggregates, GROUP BY, HAVING, DISTINCT, UNION, window functions or certain subqueries; multi-table join views allow only changes touching one base table; INSERT needs every NOT NULL column without default to be exposed.`,
            r`CREATE VIEW v_sum AS SELECT dept, SUM(salary) AS total FROM emp GROUP BY dept;
UPDATE v_sum SET total = 0 WHERE dept = 'IT';

-- OUTPUT:
-- ERROR 1288 (HY000): The target table v_sum of the UPDATE is not updatable`],
        r`  UPDATE v_it SET salary=950 WHERE id=1
          |
          v   (MERGE algorithm: rewrite against base table)
  UPDATE emp SET salary=950 WHERE id=1 AND dept='IT'
          |
          v
     emp row  (triggers, FKs, constraints all still apply)

  Updatable : single table, 1 view row = 1 base row
  Not       : GROUP BY, DISTINCT, UNION, aggregate, window, some subqueries`,
        `Make views writable only deliberately, always with WITH CHECK OPTION, and test constraints through them. For complex writes prefer stored procedures or explicit table DML so the behaviour is visible in code review.`
    ),

    'Views for Security': dd(
        [`A view can expose only chosen columns and rows of a table. If users get <code>SELECT</code> on the view but no privilege on the table, they see just the allowed slice. <code>SQL SECURITY DEFINER</code> runs the view with the creator's rights.`,
            r`CREATE TABLE staff (id INT PRIMARY KEY, name VARCHAR(20), email VARCHAR(30), salary INT, ssn CHAR(9));
INSERT INTO staff VALUES (1,'Asha','a@x.com',900,'111223333'),(2,'Ben','b@x.com',700,'222334444');

CREATE VIEW v_staff_public AS SELECT id, name, email FROM staff;   -- no salary, no ssn

SELECT * FROM v_staff_public;

-- OUTPUT:
-- +----+------+---------+
-- | id | name | email   |
-- +----+------+---------+
-- |  1 | Asha | a@x.com |
-- |  2 | Ben  | b@x.com |
-- +----+------+---------+`],
        [`MySQL privileges are granted per table or per column, but not per row. Views add row-level filtering and computed masking so you can follow least privilege without duplicating data.`,
            r`CREATE USER 'report'@'%' IDENTIFIED BY 'S3cret!pass';
GRANT SELECT ON mydb.v_staff_public TO 'report'@'%';     -- view only, not the table

-- connected as report:
SELECT salary FROM mydb.staff;

-- OUTPUT:
-- ERROR 1142 (42000): SELECT command denied to user 'report'@'localhost' for table 'staff'`],
        [`Real use: support staff see masked emails and last four digits; each region sees only its rows via <code>CURRENT_USER()</code>-based views; auditors get read-only views.`,
            r`CREATE VIEW v_staff_masked AS
SELECT id, name,
       CONCAT('***-**-', RIGHT(ssn, 4)) AS ssn,       -- mask all but last 4
       CONCAT(LEFT(email, 1), '***@', SUBSTRING_INDEX(email, '@', -1)) AS email
FROM staff;
SELECT * FROM v_staff_masked WHERE id = 1;

-- OUTPUT:
-- +----+------+-------------+-----------+
-- | id | name | ssn         | email     |
-- +----+------+-------------+-----------+
-- |  1 | Asha | ***-**-3333 | a***@x.com|
-- +----+------+-------------+-----------+`],
        [`<b>Advantages:</b> least privilege, row and column filtering, masking, a single audited entry point, and no change to the underlying schema.`,
            r`-- DEFINER view: callers need rights only on the view.
CREATE DEFINER = 'admin'@'localhost' SQL SECURITY DEFINER VIEW v_my_rows AS
SELECT id, name FROM staff WHERE name = SUBSTRING_INDEX(CURRENT_USER(), '@', 1);
SHOW CREATE VIEW v_my_rows\G

-- OUTPUT (example, trimmed):
-- View: v_my_rows
-- Create View: CREATE ALGORITHM=UNDEFINED DEFINER=admin@localhost SQL SECURITY DEFINER VIEW ...`],
        [`<b>Disadvantages:</b> not a complete defence: DEFINER views run with elevated rights, so a poorly written one leaks data; users can still infer data through side channels such as error messages or timing, and functions with side effects can leak rows.`,
            r`-- A user with access to the view calls a function that sees rows before the view filter.
-- Mitigate with SQL SECURITY INVOKER or by revoking CREATE FUNCTION/PROCEDURE rights.
CREATE OR REPLACE SQL SECURITY INVOKER VIEW v_staff_public AS SELECT id, name, email FROM staff;
SHOW GRANTS FOR 'report'@'%';

-- OUTPUT (example):
-- +------------------------------------------------------------+
-- | Grants for report@%                                        |
-- +------------------------------------------------------------+
-- | GRANT USAGE ON *.* TO report@%                             |
-- | GRANT SELECT ON mydb.v_staff_public TO report@%            |
-- +------------------------------------------------------------+`],
        [`<b>Limitations:</b> a view cannot hide the existence of rows from someone who has the table; row filters based on CURRENT_USER are only as strong as your user naming; INVOKER views need rights on the base tables too. Roles in MySQL 8 simplify granting.`,
            r`CREATE ROLE 'reader';
GRANT SELECT ON mydb.v_staff_public TO 'reader';
GRANT 'reader' TO 'report'@'%';
SET DEFAULT ROLE ALL TO 'report'@'%';
SHOW GRANTS FOR 'report'@'%' USING 'reader';

-- OUTPUT (example):
-- | GRANT SELECT ON mydb.v_staff_public TO reader |`],
        r`   user 'report'                                  table staff
      |                                       +-----------------------------+
      | SELECT * FROM v_staff_public          | id | name | email | salary  |
      v                                       +-----------------------------+
   +---------------------+   only these --->   id   name   email   (columns)
   | view v_staff_public |   filter rows ->    WHERE region = ...
   +---------------------+   salary, ssn never reach the user
      |
      X  direct SELECT on staff -> ERROR 1142 (no privilege)`,
        `Combine views with roles, least-privilege accounts and DEFINER set to a locked-down no-login account. Do not rely on views alone for compliance; add encryption, auditing (audit plugin) and column masking at the app tier where needed.`
    ),

    'Views vs Tables vs Stored Procedures': dd(
        [`A <b>table</b> stores data. A <b>view</b> stores a query and gives a virtual table. A <b>stored procedure</b> stores a program (statements, logic, parameters) that you <code>CALL</code>. Choosing correctly decides performance, security and maintainability.`,
            r`CREATE TABLE orders (id INT PRIMARY KEY, cust INT, amt INT);
INSERT INTO orders VALUES (1,7,50),(2,7,70),(3,8,20);

CREATE VIEW v_cust_total AS SELECT cust, SUM(amt) AS total FROM orders GROUP BY cust;   -- virtual table

DELIMITER //
CREATE PROCEDURE p_cust_total(IN c INT) BEGIN SELECT SUM(amt) AS total FROM orders WHERE cust = c; END //
DELIMITER ;

SELECT * FROM v_cust_total;  CALL p_cust_total(7);

-- OUTPUT:
-- +------+-------+     +-------+
-- | cust | total |     | total |
-- +------+-------+     +-------+
-- |    7 |   120 |     |   120 |
-- |    8 |    20 |     +-------+
-- +------+-------+`],
        [`Each tool solves a different problem. Tables persist facts. Views simplify and secure reads and can be joined or filtered further. Procedures run multi-step logic with transactions, loops and side effects, and can take parameters and write data.`,
            r`-- A view can be filtered and joined like a table; a procedure result cannot.
SELECT * FROM v_cust_total WHERE total > 50;                      -- composable
SELECT o.id, v.total FROM orders o JOIN v_cust_total v ON v.cust = o.cust;

-- CALL p_cust_total(7) cannot appear in FROM or a JOIN.

-- OUTPUT:
-- +------+-------+
-- | cust | total |
-- +------+-------+
-- |    7 |   120 |
-- +------+-------+`],
        [`Rule of thumb: store it in a table if it is a fact you must keep; use a view for a reusable read shape; use a procedure for a unit of work (transfer money, close a month) that needs validation, several writes and one atomic commit. Use a summary table when a view is too slow.`,
            r`-- Summary table = view result physically stored and refreshed.
CREATE TABLE cust_total_cache AS SELECT cust, SUM(amt) AS total FROM orders GROUP BY cust;
ALTER TABLE cust_total_cache ADD PRIMARY KEY (cust);
SELECT total FROM cust_total_cache WHERE cust = 7;       -- index lookup, no aggregation

-- OUTPUT:
-- +-------+
-- | total |
-- +-------+
-- |   120 |
-- +-------+`],
        [`<b>Advantages:</b> tables give speed and indexes; views give abstraction and security with no data duplication; procedures give logic close to data, fewer round trips and one permission surface (<code>GRANT EXECUTE</code>).`,
            r`GRANT EXECUTE ON PROCEDURE mydb.p_cust_total TO 'report'@'%';     -- app can run it, nothing else
SHOW GRANTS FOR 'report'@'%';

-- OUTPUT (example):
-- | GRANT EXECUTE ON PROCEDURE mydb.p_cust_total TO report@% |`],
        [`<b>Disadvantages:</b> tables cost storage and need maintenance; views can hide expensive queries; procedures are hard to version, test and debug, tie logic to MySQL and can overload the database CPU.`,
            r`-- Cost hidden behind a view: aggregation runs on every call.
EXPLAIN SELECT * FROM v_cust_total WHERE cust = 7;

-- OUTPUT (key columns):
-- +-------------+------------+------+---------------------------+
-- | select_type | table      | type | Extra                     |
-- +-------------+------------+------+---------------------------+
-- | PRIMARY     | <derived2> | ref  | NULL                      |
-- | DERIVED     | orders     | ALL  | Using temporary           |
-- +-------------+------------+------+---------------------------+   (example)`],
        [`<b>Limitations:</b> views cannot take parameters or hold variables or multiple statements; procedures cannot be used inside a SELECT (functions can); tables have no logic of their own. MySQL has no materialised views or table-valued functions.`,
            r`-- A view cannot take an argument.
CREATE VIEW v_for(c INT) AS SELECT * FROM orders WHERE cust = c;

-- OUTPUT:
-- ERROR 1064 (42000): You have an error in your SQL syntax; check the manual ... near '(c INT) AS'`],
        r`             data?     parameters?   logic?    usable in FROM?   writes?
  TABLE       yes        no            no        yes               yes
  VIEW        no         no            no        yes               limited
  PROCEDURE   no         yes           yes       no (CALL only)    yes

  table  = what we KNOW        view = how we LOOK at it
  procedure = what we DO       summary table = a view we cached`,
        `Keep business rules in one place: in a modern stack that is usually the application, with views for read contracts and procedures for a few hot, set-based or security-critical operations. Whatever you choose, keep DDL in version control and migrate it with a tool like Flyway or Liquibase.`
    ),
};
