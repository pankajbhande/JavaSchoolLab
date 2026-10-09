// Deep dive, modules 22-26 (Views, Stored Procedures, Stored Functions, Triggers, Cursors).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d09: Record<string, Deep> = {
    'CREATE, ALTER & DROP VIEW': dv(
        [`A view stores only its SELECT definition in the data dictionary. When you query a view MySQL either merges the definition into your statement (ALGORITHM=MERGE, the default when possible) so indexes of the base tables are used, or materializes it into a temporary table (TEMPTABLE) when it contains GROUP BY, DISTINCT, UNION, aggregates or LIMIT.`,
            r`CREATE VIEW emp_dept AS SELECT e.id, e.name, d.name AS dept, e.salary FROM emp e JOIN departments d ON d.id = e.dept;
EXPLAIN SELECT * FROM emp_dept WHERE id = 1;
SELECT table_name, view_definition, is_updatable FROM information_schema.views WHERE table_name = 'emp_dept';

-- OUTPUT: (example)
-- EXPLAIN shows tables e and d directly (the view was merged): type=const / const
-- table_name | is_updatable
-- emp_dept   | NO`],
        [`Options: <code>CREATE OR REPLACE</code>, <code>ALTER VIEW</code>, column lists, <code>ALGORITHM</code>, <code>DEFINER</code>, <code>SQL SECURITY</code>, <code>WITH CHECK OPTION</code>. Drop with <code>DROP VIEW IF EXISTS</code>.`,
            r`CREATE OR REPLACE ALGORITHM=MERGE SQL SECURITY INVOKER VIEW active_users (id, email) AS SELECT id, email FROM users WHERE status = 'ACTIVE' WITH CASCADED CHECK OPTION;
ALTER VIEW active_users AS SELECT id, email, created_at FROM users WHERE status = 'ACTIVE';
SHOW CREATE VIEW active_users\G
DROP VIEW IF EXISTS active_users;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: views on views several levels deep (hidden cost and hard debugging), SELECT * in the definition (columns fixed at creation time), and base table changes that silently break the view. Name columns and check dependent views after migrations.`,
            r`CREATE VIEW v_orders AS SELECT * FROM orders;
ALTER TABLE orders ADD COLUMN channel VARCHAR(10);
SELECT * FROM v_orders LIMIT 1;                 -- new column NOT included
ALTER TABLE orders DROP COLUMN total;
SELECT * FROM v_orders LIMIT 1;

-- OUTPUT:
-- ERROR 1356 (HY000): View 'shop.v_orders' references invalid table(s) or column(s) or function(s) or definer/invoker of view lack rights to use them`],
        [`A TEMPTABLE view cannot push filters into its aggregate, so it computes everything first. Compare the plans, and consider a summary table when a view is queried often.`,
            r`CREATE VIEW dept_stats AS SELECT dept, COUNT(*) AS n, AVG(salary) AS avg_sal FROM emp GROUP BY dept;
EXPLAIN SELECT * FROM dept_stats WHERE dept = 10;
EXPLAIN SELECT dept, COUNT(*), AVG(salary) FROM emp WHERE dept = 10 GROUP BY dept;

-- OUTPUT: (example)
-- first : derived table materialized (older versions) / merged with the filter pushed down (8.0 can push conditions into derived tables)
-- second: type=ref key=idx_dept`],
        [`Real-world: a stable reporting layer. Applications and BI tools read views; the physical tables can change underneath, with the views adapted in the same migration.`,
            r`CREATE OR REPLACE VIEW report_orders AS
SELECT o.id AS order_id, o.created_at, c.name AS customer, o.total, o.status FROM orders o JOIN customers c ON c.id = o.customer_id;
GRANT SELECT ON shop.report_orders TO 'bi'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Updatable Views': dv(
        [`A view is updatable when each view row maps to exactly one base table row: no aggregates, DISTINCT, GROUP BY, UNION, window functions or subqueries in the select list. MySQL rewrites INSERT, UPDATE and DELETE on the view into the same statement on the base table.`,
            r`CREATE VIEW hr_emp AS SELECT id, name, salary, dept FROM emp WHERE dept = 10 WITH CHECK OPTION;
UPDATE hr_emp SET salary = salary + 1000 WHERE id = 1;
SELECT table_name, is_updatable FROM information_schema.views WHERE table_name IN ('hr_emp','dept_stats');

-- OUTPUT:
-- table_name | is_updatable
-- hr_emp     | YES
-- dept_stats | NO`],
        [`WITH CHECK OPTION rejects changes that would make a row disappear from the view (LOCAL checks this view, CASCADED also checks underlying views). Multi-table join views can update columns of one base table per statement.`,
            r`UPDATE hr_emp SET dept = 20 WHERE id = 1;
CREATE VIEW emp_with_dept AS SELECT e.id, e.name, d.name AS dept_name FROM emp e JOIN departments d ON d.id = e.dept;
UPDATE emp_with_dept SET name = 'Asha R' WHERE id = 1;       -- allowed: only emp columns changed

-- OUTPUT:
-- ERROR 1369 (HY000): CHECK OPTION failed 'shop.hr_emp'`],
        [`Mistakes: expecting an INSERT through a view that omits NOT NULL columns without defaults, updating derived columns, and assuming a join view can change both tables in one statement. Check <code>IS_UPDATABLE</code> and test writes.`,
            r`INSERT INTO hr_emp (id, name) VALUES (99, 'Zed');                  -- salary NOT NULL, no default
UPDATE emp_with_dept SET dept_name = 'X' WHERE id = 1;               -- column of the other table plus ... not allowed together

-- OUTPUT:
-- ERROR 1423 (HY000): Field of view 'shop.hr_emp' underlying table doesn't have a default value`],
        [`Updates through a view cost the same as on the base table, plus the check evaluation. Make sure the view's WHERE is indexable, since the rewritten statement uses it.`,
            r`EXPLAIN UPDATE hr_emp SET salary = salary + 100 WHERE dept = 10;

-- OUTPUT: (example)
-- type  | key      | rows
-- range | idx_dept | 1200`],
        [`Real-world: keep an old table name working after a rename or split by exposing an updatable compatibility view, giving old applications time to migrate.`,
            r`RENAME TABLE customers TO customer_accounts;
CREATE VIEW customers AS SELECT * FROM customer_accounts;
INSERT INTO customers (name) VALUES ('Asha');       -- still works through the view

-- OUTPUT:
-- Query OK, 1 row affected`]
    ),

    'Views for Security': dv(
        [`Security via views works through privileges: a user is granted SELECT on the view, not on the base table. With <code>SQL SECURITY DEFINER</code> the view runs with the creator's rights, so the user can read the exposed columns and rows without any grant on the underlying table.`,
            r`CREATE DEFINER='view_owner'@'localhost' SQL SECURITY DEFINER VIEW emp_public AS SELECT id, name, dept FROM emp;
GRANT SELECT ON shop.emp_public TO 'hr_reader'@'%';
-- as hr_reader:
SELECT id, name FROM shop.emp_public LIMIT 1;
SELECT salary FROM shop.emp;

-- OUTPUT:
-- id | name
--  1 | Asha
-- ERROR 1142 (42000): SELECT command denied to user 'hr_reader'@'localhost' for table 'emp'`],
        [`Techniques: column hiding, row filtering, data masking with functions, and tenant filters. INVOKER security applies the caller's rights and enables per-user filters using <code>USER()</code>.`,
            r`CREATE VIEW payments_masked AS SELECT id, CONCAT('**** **** **** ', RIGHT(card_no, 4)) AS card, amount FROM payments;
CREATE SQL SECURITY INVOKER VIEW my_orders AS SELECT * FROM orders WHERE customer_email = SUBSTRING_INDEX(USER(), '@', 1);
SELECT * FROM payments_masked LIMIT 1;

-- OUTPUT:
-- id | card                | amount
--  1 | **** **** **** 4242 | 500.00`],
        [`Mistakes: a powerful DEFINER (a view owned by root exposes whatever it reads), forgetting that views are not row-level security by themselves, and masking in views while the base table is still readable elsewhere. Use a minimal-privilege definer and verify with the real restricted account.`,
            r`CREATE USER 'view_owner'@'localhost' IDENTIFIED BY 'x';
GRANT SELECT (id, name, dept) ON shop.emp TO 'view_owner'@'localhost';      -- column-level grant only
SELECT user, host FROM mysql.user WHERE user = 'view_owner';
SELECT table_name, definer, security_type FROM information_schema.views WHERE table_schema = 'shop';

-- OUTPUT:
-- table_name | definer             | security_type
-- emp_public | view_owner@localhost| DEFINER`],
        [`Row filters in views must stay indexable. A tenant filter on an indexed column keeps queries fast; a function on the column does not.`,
            r`CREATE VIEW tenant1_orders AS SELECT * FROM orders WHERE tenant_id = 1;
EXPLAIN SELECT * FROM tenant1_orders WHERE status = 'NEW';

-- OUTPUT: (example)
-- type | key               (uses idx_tenant_status)`],
        [`Real-world: support staff can see customers and orders but never card data or password hashes; analysts get masked and aggregated views; the base tables are accessible only to the application and DBAs.`,
            r`CREATE ROLE 'support_ro';
GRANT SELECT ON shop.customers_public TO 'support_ro';
GRANT SELECT ON shop.orders_public TO 'support_ro';
GRANT 'support_ro' TO 'agent1'@'%';
SET DEFAULT ROLE 'support_ro' TO 'agent1'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Views vs Tables vs Stored Procedures': dv(
        [`A table stores rows. A view stores a query and is expanded at execution time. A stored procedure stores a program and runs when called; its results are returned as result sets or OUT parameters, and it cannot be used in a FROM clause. Only tables occupy data space.`,
            r`CREATE TABLE t_emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT);
CREATE VIEW v_high AS SELECT * FROM t_emp WHERE salary > 50000;
CREATE PROCEDURE p_high() SELECT * FROM t_emp WHERE salary > 50000;
SELECT table_name, table_type FROM information_schema.tables WHERE table_name IN ('t_emp','v_high');
SELECT routine_name, routine_type FROM information_schema.routines WHERE routine_name = 'p_high';

-- OUTPUT:
-- table_name | table_type
-- t_emp      | BASE TABLE
-- v_high     | VIEW
-- routine_name | routine_type
-- p_high       | PROCEDURE`],
        [`Use views to name and reuse queries, procedures for multi-step actions with control flow and transactions, and generated columns or summary tables to store computed results. MySQL has no native materialized views; emulate with a table refreshed by an event.`,
            r`CREATE TABLE mv_dept_totals (dept INT PRIMARY KEY, total DECIMAL(14,2), refreshed_at DATETIME);
CREATE EVENT ev_refresh_mv ON SCHEDULE EVERY 1 HOUR DO
  REPLACE INTO mv_dept_totals SELECT dept, SUM(salary), NOW() FROM emp GROUP BY dept;
SELECT * FROM mv_dept_totals;

-- OUTPUT:
-- dept | total  | refreshed_at
--   10 | 105000 | 2026-05-01 10:00:00`],
        [`Mistakes: using a procedure where a view fits (cannot join it), putting business logic in views with side effects expectations, and treating a view as a cache (it is not). Choose by the job: read shape, action, or stored result.`,
            r`SELECT * FROM p_high;                         -- procedures are not tables
SELECT * FROM v_high v JOIN departments d ON d.id = v.id;     -- views join like tables

-- OUTPUT:
-- ERROR 1146 (42S02): Table 'shop.p_high' doesn't exist`],
        [`A view costs the query it contains each time; a materialized table costs refresh work but reads instantly. Compare the timing and choose the refresh interval from freshness needs.`,
            r`-- view: 2.1 s (aggregates 50M rows on every read)
-- summary table refreshed hourly: 3 ms reads, 40 s refresh once per hour
SELECT TIMESTAMPDIFF(MINUTE, refreshed_at, NOW()) AS data_age_minutes FROM mv_dept_totals LIMIT 1;

-- OUTPUT:
-- data_age_minutes
-- 23`],
        [`Real-world layering: tables for data, views for stable reads and security, procedures for controlled multi-step writes with strict EXECUTE privileges and no direct table access for applications.`,
            r`REVOKE ALL ON shop.* FROM 'shop_app'@'%';
GRANT SELECT ON shop.report_orders TO 'shop_app'@'%';
GRANT EXECUTE ON PROCEDURE shop.place_order TO 'shop_app'@'%';
CALL place_order(7, 'A1', 2);

-- OUTPUT:
-- Query OK, 1 row affected`]
    ),

    'CREATE PROCEDURE & CALL': dv(
        [`A stored procedure is compiled to an internal instruction set and cached per connection the first time it is called. CALL executes it inside the calling session, so it sees session variables, current database and the open transaction. Result sets produced inside are returned to the client.`,
            r`DELIMITER //
CREATE PROCEDURE emp_by_dept(IN p_dept INT)
BEGIN
  SELECT id, name, salary FROM emp WHERE dept = p_dept ORDER BY id;
END //
DELIMITER ;
CALL emp_by_dept(10);

-- OUTPUT:
-- id | name | salary
--  1 | Asha |  60000
--  2 | Ravi |  45000`],
        [`Options: characteristics (<code>DETERMINISTIC</code>, <code>READS SQL DATA</code>, <code>MODIFIES SQL DATA</code>), <code>SQL SECURITY</code>, <code>COMMENT</code>, and multiple result sets. Inspect with SHOW CREATE PROCEDURE and the information_schema.routines table.`,
            r`CREATE PROCEDURE transfer(IN p_from INT, IN p_to INT, IN p_amt DECIMAL(10,2))
  MODIFIES SQL DATA SQL SECURITY DEFINER COMMENT 'atomic transfer'
BEGIN
  START TRANSACTION;
  UPDATE acct SET bal = bal - p_amt WHERE id = p_from;
  UPDATE acct SET bal = bal + p_amt WHERE id = p_to;
  COMMIT;
END;
SHOW CREATE PROCEDURE transfer\G
DROP PROCEDURE IF EXISTS transfer;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: forgetting DELIMITER in the client, parameter names clashing with column names, no error handling around transactions, and deploying procedures by hand. Prefix parameters (p_), add handlers, and version procedures in migrations.`,
            r`CREATE PROCEDURE bad(IN dept INT) SELECT * FROM emp WHERE dept = dept;     -- always true: compares the column to itself
CALL bad(10);

-- OUTPUT:
-- (returns all rows; rename the parameter to p_dept)`],
        [`Procedures save network round trips for multi-statement operations, but their plans and execution are per statement, so index tuning still applies inside them. Profile with the statement digest tables, which break routines down by statement.`,
            r`SELECT event_name, count_star, ROUND(sum_timer_wait/1e9) AS total_ms FROM performance_schema.events_statements_summary_by_program WHERE object_name = 'transfer';

-- OUTPUT: (example)
-- event_name              | count_star | total_ms
-- statement/sp/stmt       |    9120000 |   412000`],
        [`Real-world: batch operations close to the data, such as closing a billing period, with one call from a scheduler and a single privilege to execute it.`,
            r`DELIMITER //
CREATE PROCEDURE close_month(IN p_month DATE)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
  START TRANSACTION;
  INSERT INTO monthly_totals (month, customer_id, total) SELECT p_month, customer_id, SUM(total) FROM orders WHERE created_at >= p_month AND created_at < p_month + INTERVAL 1 MONTH GROUP BY customer_id;
  UPDATE billing_state SET closed_month = p_month;
  COMMIT;
END //
DELIMITER ;
CALL close_month('2026-04-01');

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'IN, OUT & INOUT Parameters': dv(
        [`Parameters are passed by value for IN, and OUT/INOUT copy the value back into a user variable (<code>@var</code>) when the procedure ends. An OUT parameter starts as NULL inside the procedure. INOUT passes the caller's current value in and returns the modified value.`,
            r`DELIMITER //
CREATE PROCEDURE dept_count(IN p_dept INT, OUT p_count INT)
BEGIN SELECT COUNT(*) INTO p_count FROM emp WHERE dept = p_dept; END //
CREATE PROCEDURE add_tax(INOUT p_amount DECIMAL(10,2), IN p_rate DECIMAL(4,2))
BEGIN SET p_amount = ROUND(p_amount * (1 + p_rate / 100), 2); END //
DELIMITER ;
CALL dept_count(10, @c); SELECT @c;
SET @a = 1000; CALL add_tax(@a, 18); SELECT @a;

-- OUTPUT:
-- @c      @a
--  2    1180.00`],
        [`Use OUT for scalars (status, count, new id), result sets for rows, and INOUT sparingly. Return identifiers with <code>LAST_INSERT_ID()</code>. Signal errors with SIGNAL instead of magic OUT codes where possible.`,
            r`DELIMITER //
CREATE PROCEDURE create_customer(IN p_name VARCHAR(40), IN p_email VARCHAR(100), OUT p_id BIGINT, OUT p_status VARCHAR(20))
BEGIN
  DECLARE EXIT HANDLER FOR 1062 SET p_status = 'DUPLICATE_EMAIL';
  INSERT INTO customers (name, email) VALUES (p_name, p_email);
  SET p_id = LAST_INSERT_ID(), p_status = 'OK';
END //
DELIMITER ;
CALL create_customer('Asha', 'a@x.com', @id, @st); SELECT @id, @st;

-- OUTPUT:
-- @id | @st
--   1 | OK`],
        [`Mistakes: expecting OUT parameters to be readable before assignment, user variables leaking between calls, many OUT parameters instead of a result set, and changing a parameter list (breaking callers). Add new procedures or optional behaviour carefully.`,
            r`DELIMITER //
CREATE PROCEDURE bad_out(OUT p_val INT) BEGIN SET p_val = p_val + 1; END //
DELIMITER ;
SET @x = 5; CALL bad_out(@x); SELECT @x;

-- OUTPUT:
-- @x
-- NULL        (OUT starts as NULL inside: NULL + 1 = NULL)`],
        [`Parameters have fixed types; passing a wider value is converted or truncated. Declare precise types so implicit conversions do not defeat indexes inside the procedure.`,
            r`DELIMITER //
CREATE PROCEDURE find_user(IN p_phone VARCHAR(20)) SELECT id FROM users WHERE phone = p_phone; //     -- same type as the column: index used
DELIMITER ;
CALL find_user('9876543210');

-- OUTPUT:
-- id
-- 12`],
        [`Real-world API style: procedures return a status code OUT parameter and the data as a result set, and applications map status codes to messages.`,
            r`CALL withdraw(1, 5000, @status);
SELECT @status;

-- OUTPUT:
-- @status
-- INSUFFICIENT_FUNDS`]
    ),

    'Variables, IF & CASE in Procedures': dv(
        [`Local variables (<code>DECLARE</code>) exist only inside their BEGIN...END block and must be declared first; user variables (<code>@x</code>) belong to the session. Control flow statements (IF, CASE) are interpreted by the procedure engine, evaluating each condition in order. A NULL condition is treated as false.`,
            r`DELIMITER //
CREATE PROCEDURE grade(IN p_score INT, OUT p_grade CHAR(1))
BEGIN
  DECLARE v_msg VARCHAR(20) DEFAULT 'n/a';
  IF p_score IS NULL THEN SET p_grade = NULL;
  ELSEIF p_score >= 90 THEN SET p_grade = 'A';
  ELSEIF p_score >= 75 THEN SET p_grade = 'B';
  ELSE SET p_grade = 'C';
  END IF;
END //
DELIMITER ;
CALL grade(82, @g); SELECT @g;

-- OUTPUT:
-- @g
-- B`],
        [`Forms: <code>IF ... ELSEIF ... END IF</code>, simple and searched <code>CASE</code> statements, <code>SELECT ... INTO</code> to fill variables, <code>SET var = (subquery)</code>, and <code>SIGNAL</code> for errors.`,
            r`DELIMITER //
CREATE PROCEDURE ship_cost(IN p_zone CHAR(1), OUT p_cost DECIMAL(6,2))
BEGIN
  CASE p_zone
    WHEN 'A' THEN SET p_cost = 40;
    WHEN 'B' THEN SET p_cost = 70;
    ELSE SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unknown zone';
  END CASE;
END //
DELIMITER ;
CALL ship_cost('Z', @c);

-- OUTPUT:
-- ERROR 1644 (45000): Unknown zone`],
        [`Mistakes: SELECT INTO returning zero or several rows (warning or error), DECLARE after statements, and long IF chains better expressed as data in a table. Handle NOT FOUND and keep logic simple.`,
            r`DELIMITER //
CREATE PROCEDURE one_name(IN p_id INT, OUT p_name VARCHAR(20))
BEGIN
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET p_name = 'unknown';
  SELECT name INTO p_name FROM emp WHERE id = p_id;
END //
DELIMITER ;
CALL one_name(999, @n); SELECT @n;

-- OUTPUT:
-- @n
-- unknown`],
        [`Logic inside procedures runs in a single thread per call. For rule-heavy decisions, move the rules into a table and join to it, which scales with indexes and is editable without redeploying code.`,
            r`CREATE TABLE ship_rates (zone CHAR(1) PRIMARY KEY, cost DECIMAL(6,2));
INSERT INTO ship_rates VALUES ('A',40),('B',70);
SELECT cost FROM ship_rates WHERE zone = 'B';

-- OUTPUT:
-- cost
-- 70.00`],
        [`Real-world: discount calculation with tiers, written as a searched CASE so the rules read top to bottom and the first match wins.`,
            r`SELECT order_id, total, CASE WHEN total >= 10000 THEN 0.15 WHEN total >= 5000 THEN 0.10 WHEN total >= 1000 THEN 0.05 ELSE 0 END AS discount_rate FROM orders LIMIT 3;

-- OUTPUT:
-- order_id | total   | discount_rate
--        1 | 12000.00|          0.15`]
    ),

    'Loops in Procedures': dv(
        [`MySQL has three loop forms. <code>WHILE</code> checks the condition before each pass, <code>REPEAT ... UNTIL</code> checks after (runs at least once), and <code>LOOP</code> runs until an explicit <code>LEAVE label</code>. <code>ITERATE label</code> jumps to the next pass. Each pass executes statements one at a time in the procedure engine.`,
            r`DELIMITER //
CREATE PROCEDURE sum_odd(IN p_n INT, OUT p_sum INT)
BEGIN
  DECLARE i INT DEFAULT 0;
  SET p_sum = 0;
  lp: LOOP
    SET i = i + 1;
    IF i > p_n THEN LEAVE lp; END IF;
    IF i MOD 2 = 0 THEN ITERATE lp; END IF;
    SET p_sum = p_sum + i;
  END LOOP;
END //
DELIMITER ;
CALL sum_odd(10, @s); SELECT @s;

-- OUTPUT:
-- @s
-- 25`],
        [`Use loops for control (batching, retries, generating data) and set-based SQL for data work. REPEAT and WHILE equivalents: <code>WHILE i &lt; n DO ... END WHILE</code> and <code>REPEAT ... UNTIL i &gt;= n END REPEAT</code>.`,
            r`DELIMITER //
CREATE PROCEDURE seed_nums(IN p_n INT)
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= p_n DO INSERT INTO nums (n) VALUES (i); SET i = i + 1; END WHILE;
END //
DELIMITER ;
-- set-based equivalent (much faster)
INSERT INTO nums (n) WITH RECURSIVE s(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM s WHERE n < 1000) SELECT n FROM s;

-- OUTPUT:
-- Query OK, 1000 rows affected`],
        [`Mistakes: row-by-row loops over large tables, forgetting to change the loop variable (infinite loop), and no batch commit. Always bound loops and prefer set operations.`,
            r`-- slow: 1,000,000 single-row inserts ~ 240 s
-- fast: one INSERT ... SELECT ~ 3 s
INSERT INTO archive SELECT * FROM events WHERE created_at < '2025-01-01';

-- OUTPUT:
-- Query OK, 1000000 rows affected (3.1 sec)`],
        [`For maintenance jobs, loop in batches with LIMIT, stop when no rows are affected, sleep briefly between batches, and watch replica lag.`,
            r`DELIMITER //
CREATE PROCEDURE purge_events()
BEGIN
  DECLARE n INT DEFAULT 1;
  WHILE n > 0 DO
    DELETE FROM events WHERE created_at < NOW() - INTERVAL 90 DAY LIMIT 2000;
    SET n = ROW_COUNT();
    DO SLEEP(0.2);
  END WHILE;
END //
DELIMITER ;
CALL purge_events();

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Real-world: retry with backoff inside a procedure for a lock-sensitive update, bounded to a fixed number of attempts.`,
            r`DELIMITER //
CREATE PROCEDURE safe_update(IN p_sku VARCHAR(10))
BEGIN
  DECLARE attempts INT DEFAULT 0; DECLARE ok INT DEFAULT 0;
  retry: WHILE attempts < 3 AND ok = 0 DO
    BEGIN
      DECLARE CONTINUE HANDLER FOR 1213, 1205 SET attempts = attempts + 1;
      UPDATE stock SET qty = qty - 1 WHERE sku = p_sku AND qty > 0;
      SET ok = IF(ROW_COUNT() > 0, 1, 0);
      IF ok = 0 THEN SET attempts = attempts + 1; END IF;
    END;
  END WHILE;
END //
DELIMITER ;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Error Handling in Procedures': dv(
        [`Handlers react to conditions raised while a procedure runs. An <code>EXIT</code> handler ends the enclosing BEGIN...END block after running; a <code>CONTINUE</code> handler resumes after the failing statement. Conditions can be SQLEXCEPTION, SQLWARNING, NOT FOUND, a SQLSTATE or a MySQL error number.`,
            r`DELIMITER //
CREATE PROCEDURE safe_transfer(IN p_from INT, IN p_to INT, IN p_amt DECIMAL(10,2))
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transfer failed';
  END;
  START TRANSACTION;
  UPDATE acct SET bal = bal - p_amt WHERE id = p_from;
  UPDATE acct SET bal = bal + p_amt WHERE id = p_to;
  COMMIT;
END //
DELIMITER ;
CALL safe_transfer(1, 2, 999999);

-- OUTPUT:
-- ERROR 1644 (45000): Transfer failed`],
        [`Tools: <code>SIGNAL</code> raises your own error, <code>RESIGNAL</code> rethrows or changes it, <code>GET DIAGNOSTICS</code> reads the error details (message, error number, SQLSTATE), and named conditions make handlers readable.`,
            r`DELIMITER //
CREATE PROCEDURE try_insert()
BEGIN
  DECLARE v_msg TEXT; DECLARE v_code INT;
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
  BEGIN GET DIAGNOSTICS CONDITION 1 v_msg = MESSAGE_TEXT, v_code = MYSQL_ERRNO; SELECT v_code AS code, v_msg AS message; END;
  INSERT INTO acct VALUES (1, 5);
END //
DELIMITER ;
CALL try_insert();

-- OUTPUT:
-- code | message
-- 1062 | Duplicate entry '1' for key 'acct.PRIMARY'`],
        [`Mistakes: handlers that swallow errors silently, EXIT handlers without ROLLBACK, logging errors inside the transaction that then rolls them back, and exposing internal messages to users. Log outside the transaction and return stable codes.`,
            r`DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN END;      -- swallows everything: the caller thinks it succeeded
-- better:
DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

-- OUTPUT:
-- (the original error reaches the caller after the rollback)`],
        [`Handlers add little overhead. The real cost is retries and rolled-back work, so make operations idempotent and short; use error codes to distinguish retryable errors (1213, 1205) from permanent ones (1062, 1452).`,
            r`DECLARE retryable CONDITION FOR SQLSTATE '40001';
DECLARE EXIT HANDLER FOR retryable BEGIN ROLLBACK; SET @needs_retry = 1; END;

-- OUTPUT:
-- (the caller checks @needs_retry and re-runs the procedure)`],
        [`Real-world: a payment procedure maps technical errors to business error codes, so API layers return proper responses without parsing messages.`,
            r`DELIMITER //
CREATE PROCEDURE pay(IN p_order BIGINT, IN p_key CHAR(36), OUT p_code VARCHAR(20))
BEGIN
  DECLARE EXIT HANDLER FOR 1062 BEGIN ROLLBACK; SET p_code = 'DUPLICATE'; END;
  DECLARE EXIT HANDLER FOR 1452 BEGIN ROLLBACK; SET p_code = 'UNKNOWN_ORDER'; END;
  START TRANSACTION;
  INSERT INTO payments (order_id, idempotency_key, amount) SELECT id, p_key, total FROM orders WHERE id = p_order;
  UPDATE orders SET status = 'PAID' WHERE id = p_order;
  COMMIT; SET p_code = 'OK';
END //
DELIMITER ;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'CREATE FUNCTION': dv(
        [`A stored function takes parameters, returns exactly one scalar value and can be used inside expressions. It runs once per row where it is called, inside the calling statement, and it cannot return a result set or control transactions. With binary logging on, you must declare its determinism or data access.`,
            r`DELIMITER //
CREATE FUNCTION gst(p_price DECIMAL(10,2)) RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN RETURN ROUND(p_price * 0.18, 2); END //
DELIMITER ;
SELECT name, price, gst(price) AS tax, price + gst(price) AS total FROM products LIMIT 2;

-- OUTPUT:
-- name | price  | tax   | total
-- Pen  |  10.00 |  1.80 |  11.80
-- Book | 150.50 | 27.09 | 177.59`],
        [`Characteristics: <code>DETERMINISTIC</code>, <code>NOT DETERMINISTIC</code>, <code>NO SQL</code>, <code>READS SQL DATA</code>, <code>MODIFIES SQL DATA</code>, <code>SQL SECURITY</code>. Functions can read tables but should not modify them when used in queries.`,
            r`CREATE FUNCTION dept_name(p_id INT) RETURNS VARCHAR(30) READS SQL DATA RETURN (SELECT name FROM departments WHERE id = p_id);
CREATE FUNCTION rnd() RETURNS INT NOT DETERMINISTIC NO SQL RETURN FLOOR(RAND() * 100);
SELECT dept_name(10), rnd() BETWEEN 0 AND 99 AS in_range;

-- OUTPUT:
-- dept_name(10) | in_range
-- HR            |        1`],
        [`Mistakes: omitting a characteristic (error 1418 with binary logging), calling a lookup function per row on a big table (hidden N+1), and using functions in WHERE on indexed columns. Replace per-row lookups with joins.`,
            r`SELECT e.name, dept_name(e.dept) FROM emp e;                                 -- one lookup per row
SELECT e.name, d.name FROM emp e JOIN departments d ON d.id = e.dept;          -- one join

-- OUTPUT:
-- name | name
-- Asha | HR`],
        [`A function call in WHERE or ORDER BY prevents index use on the argument column and runs for every candidate row. Use generated columns or compute outside the predicate.`,
            r`ALTER TABLE products ADD COLUMN price_with_gst DECIMAL(10,2) AS (price + ROUND(price * 0.18, 2)) STORED, ADD INDEX idx_pwg (price_with_gst);
SELECT id FROM products WHERE price_with_gst BETWEEN 100 AND 200;

-- OUTPUT:
-- id
-- 7`],
        [`Real-world: a function that formats a business identifier consistently across reports and procedures, so the rule lives in one place.`,
            r`DELIMITER //
CREATE FUNCTION invoice_no(p_year INT, p_seq INT) RETURNS VARCHAR(20) DETERMINISTIC
RETURN CONCAT('INV-', p_year, '-', LPAD(p_seq, 6, '0')) //
DELIMITER ;
SELECT invoice_no(2026, 42);

-- OUTPUT:
-- invoice_no(2026, 42)
-- INV-2026-000042`]
    ),

    'Deterministic Functions': dv(
        [`DETERMINISTIC tells MySQL that the function always returns the same result for the same arguments (and no hidden state). The server does not verify it. The flag matters for replication safety (statement-based logging), for generated columns and functional indexes (which require deterministic expressions) and for optimizer assumptions.`,
            r`DELIMITER //
CREATE FUNCTION circle_area(r DOUBLE) RETURNS DOUBLE DETERMINISTIC RETURN PI() * r * r //
CREATE FUNCTION now_label() RETURNS VARCHAR(20) NOT DETERMINISTIC NO SQL RETURN DATE_FORMAT(NOW(), '%Y-%m-%d') //
DELIMITER ;
SELECT routine_name, is_deterministic FROM information_schema.routines WHERE routine_name IN ('circle_area','now_label');

-- OUTPUT:
-- routine_name | is_deterministic
-- circle_area  | YES
-- now_label    | NO`],
        [`Use the data-access characteristic that matches reality: <code>NO SQL</code> (pure computation), <code>READS SQL DATA</code> (queries tables), <code>MODIFIES SQL DATA</code> (writes). A function that reads tables is not mathematically deterministic and should not be declared so.`,
            r`CREATE FUNCTION tax_rate(p_country CHAR(2)) RETURNS DECIMAL(5,2) READS SQL DATA RETURN (SELECT rate FROM tax_rates WHERE country = p_country);
SELECT tax_rate('IN');
ALTER TABLE circles ADD COLUMN area DOUBLE AS (PI() * radius * radius) STORED;

-- OUTPUT:
-- tax_rate('IN')
-- 18.00`],
        [`Mistakes: marking a function that reads tables or uses RAND()/NOW() as DETERMINISTIC (replicas can diverge, indexes on generated columns become wrong), and using a user-defined function in a generated column (not allowed).`,
            r`CREATE FUNCTION wrong() RETURNS INT DETERMINISTIC RETURN FLOOR(RAND() * 10);     -- lying about determinism
ALTER TABLE t ADD COLUMN c INT AS (wrong()) STORED;

-- OUTPUT:
-- ERROR 3763 (HY000): Expression of generated column 'c' contains a disallowed function: wrong.`],
        [`Deterministic expressions can be materialized and indexed through generated columns and functional indexes, trading storage for fast predicates.`,
            r`CREATE INDEX idx_lower_email ON users ((LOWER(email)));
EXPLAIN SELECT id FROM users WHERE LOWER(email) = 'a@x.com';

-- OUTPUT: (example)
-- type | key
-- ref  | idx_lower_email`],
        [`Real-world: a deterministic normalization function used by both the application and database, so imports, lookups and uniqueness all treat values the same way.`,
            r`DELIMITER //
CREATE FUNCTION norm_phone(p VARCHAR(30)) RETURNS VARCHAR(20) DETERMINISTIC NO SQL
RETURN REGEXP_REPLACE(p, '[^0-9+]', '') //
DELIMITER ;
ALTER TABLE customers ADD COLUMN phone_norm VARCHAR(20) AS (norm_phone(phone)) STORED;

-- OUTPUT:
-- ERROR 3763 (HY000): Expression of generated column 'phone_norm' contains a disallowed function: norm_phone.
-- (use the built-in REGEXP_REPLACE directly in the generated column instead)`]
    ),

    'Stored Function vs Procedure': dv(
        [`A function is an expression: it is called inside SQL, returns one value and is limited (no result sets, no COMMIT or ROLLBACK, restricted DDL). A procedure is a statement: you CALL it, it can return result sets and OUT parameters and may control transactions. They differ in where and how they can be invoked.`,
            r`DELIMITER //
CREATE FUNCTION bonus(p_sal INT) RETURNS INT DETERMINISTIC RETURN p_sal / 10 //
CREATE PROCEDURE give_bonus() BEGIN UPDATE emp SET salary = salary + bonus(salary); END //
DELIMITER ;
SELECT name, bonus(salary) AS b FROM emp;
CALL give_bonus();

-- OUTPUT:
-- name  | b
-- Asha  | 6000
-- Ravi  | 4500`],
        [`Quick rules: need a value in a query → function; need to perform actions, return several rows or manage a transaction → procedure. Privileges differ: EXECUTE is granted per routine type and name.`,
            r`GRANT EXECUTE ON FUNCTION shop.bonus TO 'report'@'%';
GRANT EXECUTE ON PROCEDURE shop.give_bonus TO 'payroll'@'%';
SELECT routine_type, routine_name FROM information_schema.routines WHERE routine_schema = 'shop';

-- OUTPUT:
-- routine_type | routine_name
-- FUNCTION     | bonus
-- PROCEDURE    | give_bonus`],
        [`Mistakes: trying to COMMIT inside a function, calling a procedure in SELECT, and a modifying function used in queries (replication hazards). Keep functions pure and put side effects in procedures.`,
            r`CREATE FUNCTION f() RETURNS INT BEGIN COMMIT; RETURN 1; END;
SELECT give_bonus();

-- OUTPUT:
-- ERROR 1422 (HY000): Explicit or implicit commit is not allowed in stored function or trigger.
-- ERROR 1305 (42000): FUNCTION shop.give_bonus does not exist`],
        [`Cost: a function runs per row, so it multiplies with row count; a procedure runs once per call. Measure the effect by comparing the function-based query with an equivalent join or expression.`,
            r`SELECT COUNT(*), SUM(bonus(salary)) FROM big_emp;                         -- function called 5M times
SELECT COUNT(*), SUM(salary / 10) FROM big_emp;                             -- inlined expression

-- OUTPUT: (example)
-- function version 9.4 s, inlined version 0.6 s`],
        [`Real-world: reusable rounding and formatting functions in reports, and procedures for each business operation (place order, cancel order, close period) with explicit transactions and error codes.`,
            r`SELECT invoice_no(YEAR(created_at), id) AS inv, money_fmt(total) AS total FROM orders LIMIT 2;
CALL place_order(7, 'A1', 2, @order_id, @status);

-- OUTPUT:
-- inv             | total
-- INV-2026-000001 | 1,200.00`]
    ),

    'BEFORE Triggers': dv(
        [`A row-level trigger runs once per affected row inside the same statement and transaction. BEFORE triggers run before the row is written, with <code>NEW</code> values that you may modify and <code>OLD</code> values for UPDATE/DELETE. Raising an error aborts the statement.`,
            r`DELIMITER //
CREATE TRIGGER trg_users_bi BEFORE INSERT ON users FOR EACH ROW
BEGIN
  SET NEW.email = LOWER(TRIM(NEW.email));
  IF NEW.created_at IS NULL THEN SET NEW.created_at = NOW(); END IF;
END //
DELIMITER ;
INSERT INTO users (email) VALUES ('  Asha@Example.COM ');
SELECT email, created_at IS NOT NULL AS has_ts FROM users ORDER BY id DESC LIMIT 1;

-- OUTPUT:
-- email            | has_ts
-- asha@example.com |      1`],
        [`Events: BEFORE INSERT/UPDATE/DELETE. Several triggers per event are allowed with <code>FOLLOWS</code>/<code>PRECEDES</code>. List them in information_schema.triggers. Use SIGNAL to reject invalid changes.`,
            r`DELIMITER //
CREATE TRIGGER trg_acct_bu BEFORE UPDATE ON acct FOR EACH ROW
BEGIN
  IF NEW.bal < 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Negative balance not allowed'; END IF;
END //
DELIMITER ;
SELECT trigger_name, action_timing, event_manipulation FROM information_schema.triggers WHERE trigger_schema = DATABASE();
UPDATE acct SET bal = -1 WHERE id = 1;

-- OUTPUT:
-- ERROR 1644 (45000): Negative balance not allowed`],
        [`Mistakes: heavy logic in triggers (runs for every row), triggers that update the same table (not allowed), forgetting they do not fire for cascaded foreign key actions or TRUNCATE, and hidden behaviour that surprises developers. Prefer CHECK, defaults and generated columns when they suffice.`,
            r`CREATE TRIGGER trg_bad BEFORE UPDATE ON acct FOR EACH ROW UPDATE acct SET bal = 0 WHERE id = NEW.id;

-- OUTPUT:
-- ERROR 1442 (HY000): Can't update table 'acct' in stored function/trigger because it is already used by statement which invoked this stored function/trigger.`],
        [`Triggers add per-row cost: a bulk insert of one million rows runs the trigger a million times. Measure the overhead and keep trigger bodies tiny.`,
            r`-- 1M rows: without trigger 6 s, with BEFORE INSERT normalizing trigger 11 s, with AFTER INSERT audit trigger 38 s
SELECT ROUND(11 / 6, 1) AS before_trigger_overhead_x;

-- OUTPUT:
-- before_trigger_overhead_x
-- 1.8`],
        [`Real-world: enforce a rule that must hold for every writer, including ad hoc SQL, such as keeping an updated_by column and rejecting edits to closed periods.`,
            r`DELIMITER //
CREATE TRIGGER trg_ledger_bu BEFORE UPDATE ON ledger FOR EACH ROW
BEGIN
  IF OLD.period_closed = 1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Closed period cannot be modified'; END IF;
  SET NEW.updated_by = USER(), NEW.updated_at = NOW();
END //
DELIMITER ;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'AFTER Triggers': dv(
        [`AFTER triggers run after the row has been written but still inside the same transaction. NEW and OLD are read-only. If the trigger fails, the whole triggering statement rolls back. They are used for side effects in other tables: audit rows, summaries, outbox events.`,
            r`DELIMITER //
CREATE TRIGGER trg_orders_ai AFTER INSERT ON orders FOR EACH ROW
BEGIN
  INSERT INTO order_events (order_id, kind, at) VALUES (NEW.id, 'CREATED', NOW());
  UPDATE customer_stats SET order_count = order_count + 1, last_order_at = NOW() WHERE customer_id = NEW.customer_id;
END //
DELIMITER ;
INSERT INTO orders (customer_id, total) VALUES (1, 100);
SELECT order_count FROM customer_stats WHERE customer_id = 1;

-- OUTPUT:
-- order_count
-- 3`],
        [`AFTER INSERT can read <code>NEW.id</code> (including auto-increment values). AFTER UPDATE can compare OLD and NEW to log only real changes. AFTER DELETE can archive <code>OLD</code> rows.`,
            r`DELIMITER //
CREATE TRIGGER trg_emp_au AFTER UPDATE ON emp FOR EACH ROW
BEGIN
  IF NOT (OLD.salary <=> NEW.salary) THEN INSERT INTO salary_history (emp_id, old_salary, new_salary, changed_at) VALUES (NEW.id, OLD.salary, NEW.salary, NOW()); END IF;
END //
CREATE TRIGGER trg_orders_ad AFTER DELETE ON orders FOR EACH ROW INSERT INTO orders_archive SELECT OLD.*; //
DELIMITER ;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: maintaining counters on hot rows (lock contention), calling slow external systems, cascades of triggers triggering triggers, and relying on triggers for FK cascade or TRUNCATE (they do not fire). Use an outbox and async processing for integration.`,
            r`UPDATE customer_stats SET order_count = order_count + 1 WHERE customer_id = 1;      -- hot row: every order for this customer serializes here
INSERT INTO outbox (event, payload) VALUES ('ORDER_CREATED', JSON_OBJECT('id', NEW.id));   -- append-only: no contention

-- OUTPUT:
-- (append-only inserts scale; a single counter row does not)`],
        [`AFTER triggers extend the transaction time and lock duration of the triggering statement. Keep them small, index the tables they touch, and monitor lock waits on those tables.`,
            r`SHOW GLOBAL STATUS LIKE 'Innodb_row_lock_waits';
SELECT object_name, COUNT(*) FROM performance_schema.data_locks GROUP BY object_name;

-- OUTPUT: (example)
-- Innodb_row_lock_waits | 8120
-- customer_stats        | 14      (the trigger target is the contention point)`],
        [`Real-world: a transactional outbox filled by a trigger lets an external relay publish events reliably, because the event row commits atomically with the data change.`,
            r`DELIMITER //
CREATE TRIGGER trg_orders_outbox AFTER INSERT ON orders FOR EACH ROW
INSERT INTO outbox (aggregate, event, payload) VALUES ('order', 'ORDER_CREATED', JSON_OBJECT('id', NEW.id, 'total', NEW.total)); //
DELIMITER ;
SELECT id, event FROM outbox WHERE processed_at IS NULL ORDER BY id LIMIT 3;

-- OUTPUT:
-- id | event
--  7 | ORDER_CREATED`]
    ),

    'Audit Logging with Triggers': dv(
        [`An audit trigger copies change details into an append-only audit table in the same transaction, so the audit row exists if and only if the change committed. It works for any writer, including manual SQL. Capture table, key, action, old and new values, database user, application user and time.`,
            r`CREATE TABLE audit_log (id BIGINT PRIMARY KEY AUTO_INCREMENT, tbl VARCHAR(30), row_id BIGINT, action VARCHAR(10), old_data JSON, new_data JSON, db_user VARCHAR(80), app_user VARCHAR(40), at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3), KEY idx_row (tbl, row_id, at));
DELIMITER //
CREATE TRIGGER trg_emp_audit AFTER UPDATE ON emp FOR EACH ROW
INSERT INTO audit_log (tbl, row_id, action, old_data, new_data, db_user, app_user)
VALUES ('emp', NEW.id, 'UPDATE', JSON_OBJECT('salary', OLD.salary, 'dept', OLD.dept), JSON_OBJECT('salary', NEW.salary, 'dept', NEW.dept), CURRENT_USER(), @app_user); //
DELIMITER ;
SET @app_user = 'asha'; UPDATE emp SET salary = 62000 WHERE id = 1;
SELECT action, old_data, new_data, app_user FROM audit_log;

-- OUTPUT:
-- action | old_data                          | new_data                          | app_user
-- UPDATE | {"dept": 10, "salary": 61000}     | {"dept": 10, "salary": 62000}     | asha`],
        [`Application user: set a session variable on connection checkout (<code>SET @app_user = ...</code>). Log only real changes by comparing OLD and NEW with the NULL-safe operator. Protect the audit table with grants (INSERT only for writers).`,
            r`REVOKE UPDATE, DELETE ON shop.audit_log FROM 'shop_app'@'%';
GRANT SELECT ON shop.audit_log TO 'auditor'@'%';
SELECT at, action, old_data->>'$.salary' AS old_sal, new_data->>'$.salary' AS new_sal FROM audit_log WHERE tbl = 'emp' AND row_id = 1 ORDER BY at;

-- OUTPUT:
-- at                      | action | old_sal | new_sal
-- 2026-05-01 10:00:00.120 | UPDATE | 61000   | 62000`],
        [`Mistakes: auditing every table at full detail (volume explodes), forgetting INSERT and DELETE triggers, no index on (table, row id), and letting application accounts change or delete audit rows. Audit what matters and secure the table.`,
            r`SELECT table_name, ROUND((data_length + index_length) / 1073741824, 2) AS gb FROM information_schema.tables WHERE table_name = 'audit_log';
ALTER TABLE audit_log PARTITION BY RANGE (TO_DAYS(at)) (PARTITION p202605 VALUES LESS THAN (TO_DAYS('2026-06-01')), PARTITION pmax VALUES LESS THAN MAXVALUE);

-- OUTPUT:
-- table_name | gb
-- audit_log  | 84.20`],
        [`Triggers write on every change, increasing latency and binlog volume. For very high write rates use binlog-based change data capture (for example Debezium) which adds no write overhead to the primary.`,
            r`-- trigger audit: +1 insert per change in the same transaction
-- CDC audit: reads the binlog asynchronously, no extra writes
SHOW VARIABLES WHERE Variable_name IN ('binlog_format','binlog_row_image');

-- OUTPUT:
-- binlog_format  | ROW
-- binlog_row_image | FULL`],
        [`Real-world compliance query: who changed this employee's salary last quarter, and from what to what.`,
            r`SELECT at, app_user, old_data->>'$.salary' AS from_sal, new_data->>'$.salary' AS to_sal FROM audit_log
WHERE tbl = 'emp' AND row_id = 1 AND at >= '2026-01-01' AND at < '2026-04-01' AND action = 'UPDATE' ORDER BY at;

-- OUTPUT:
-- at                      | app_user | from_sal | to_sal
-- 2026-02-14 09:20:00.000 | hr_anita | 58000    | 61000`]
    ),

    'When to Avoid Triggers': dv(
        [`Triggers are invisible to the code that fires them: the application sees one statement, but the server runs more work per row. This hidden behaviour makes performance, locking and debugging harder, and triggers behave differently with bulk loads, replication tools and foreign key cascades.`,
            r`SELECT trigger_schema, event_object_table, action_timing, event_manipulation, trigger_name FROM information_schema.triggers WHERE trigger_schema = 'shop' ORDER BY event_object_table;

-- OUTPUT: (example)
-- event_object_table | action_timing | event_manipulation | trigger_name
-- orders             | AFTER         | INSERT             | trg_orders_ai
-- orders             | AFTER         | UPDATE             | trg_orders_au      (two triggers on the hottest table)`],
        [`Alternatives: CHECK constraints, DEFAULT/generated columns, application services, scheduled jobs, binlog CDC, and the transactional outbox pattern. Choose triggers only for rules that must apply to every writer.`,
            r`ALTER TABLE acct ADD CONSTRAINT chk_bal CHECK (bal >= 0);                                    -- replaces a validation trigger
ALTER TABLE emp MODIFY updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;   -- replaces a timestamp trigger
ALTER TABLE order_items ADD COLUMN line_total DECIMAL(12,2) AS (qty * unit_price) STORED;              -- replaces a calculation trigger

-- OUTPUT:
-- Query OK, 0 rows affected (x3)`],
        [`Mistakes: business workflows in triggers, trigger chains, expecting triggers during bulk imports with disabled checks, and no tests for triggers. Document each trigger and test it.`,
            r`TRUNCATE TABLE orders;                          -- DELETE triggers do not fire
DELETE FROM customers WHERE id = 1;               -- ON DELETE CASCADE removes orders but does not fire orders' triggers

-- OUTPUT:
-- Query OK, 0 rows affected     (audit rows were never written)`],
        [`Quantify the overhead before deciding: time a bulk operation with and without the triggers.`,
            r`SET @t0 = NOW(6);
INSERT INTO orders (customer_id, total) SELECT customer_id, total FROM orders_staging;
SELECT TIMESTAMPDIFF(MICROSECOND, @t0, NOW(6)) / 1000000 AS seconds;

-- OUTPUT: (example)
-- seconds
-- 41.2         (4.1 s with triggers dropped)`],
        [`Real-world: replace "send an email when an order is created" triggers with a transactional outbox and a worker; the database stays fast and the integration becomes retryable and observable.`,
            r`START TRANSACTION;
INSERT INTO orders (customer_id, total) VALUES (7, 100);
INSERT INTO outbox (event, payload) VALUES ('ORDER_CREATED', JSON_OBJECT('orderId', LAST_INSERT_ID()));
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`]
    ),

    'Declaring, Opening & Fetching Cursors': dv(
        [`A cursor is a server-side handle on a SELECT result used inside stored programs. DECLARE defines it (after variables, before handlers), OPEN executes the query (results are materialized or streamed), FETCH moves forward one row into variables, and CLOSE releases it. Cursors are read-only and forward-only in MySQL.`,
            r`DELIMITER //
CREATE PROCEDURE list_names()
BEGIN
  DECLARE v_name VARCHAR(20); DECLARE done INT DEFAULT 0;
  DECLARE c CURSOR FOR SELECT name FROM emp ORDER BY id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  OPEN c;
  read_loop: LOOP
    FETCH c INTO v_name;
    IF done THEN LEAVE read_loop; END IF;
    SELECT v_name AS name;
  END LOOP;
  CLOSE c;
END //
DELIMITER ;
CALL list_names();

-- OUTPUT: (one result set per row)
-- name
-- Asha`],
        [`The cursor query can use parameters and variables, joins and ORDER BY. Fetch several columns into several variables in order. The NOT FOUND handler signals the end; reset the flag when reusing it for another cursor.`,
            r`DELIMITER //
CREATE PROCEDURE pay_report(IN p_dept INT, OUT p_total DECIMAL(14,2))
BEGIN
  DECLARE v_id INT; DECLARE v_sal INT; DECLARE done INT DEFAULT 0;
  DECLARE c CURSOR FOR SELECT id, salary FROM emp WHERE dept = p_dept;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  SET p_total = 0; OPEN c;
  lp: LOOP FETCH c INTO v_id, v_sal; IF done THEN LEAVE lp; END IF; SET p_total = p_total + v_sal; END LOOP;
  CLOSE c;
END //
DELIMITER ;
CALL pay_report(10, @t); SELECT @t;

-- OUTPUT:
-- @t
-- 105000.00`],
        [`Mistakes: wrong declaration order (error 1337), using the loop variables before checking the done flag (processing the last row twice), not closing cursors, and using a cursor for work SQL can do in one statement.`,
            r`SELECT SUM(salary) FROM emp WHERE dept = 10;        -- one statement replaces the whole cursor

-- OUTPUT:
-- SUM(salary)
-- 105000`],
        [`Cursors process rows one by one with per-row overhead; a set-based statement is often tens to hundreds of times faster. If a cursor is needed, keep the query narrow, indexed and ordered by the primary key.`,
            r`-- 1,000,000 rows: cursor loop ~ 240 s;  UPDATE ... JOIN ~ 2.5 s
SELECT ROUND(240 / 2.5) AS times_slower;

-- OUTPUT:
-- times_slower
-- 96`],
        [`Real-world: a one-off data repair that must call a routine for each row (with side effects that cannot be expressed in SQL) and logs failures to a table, committing in chunks.`,
            r`DELIMITER //
CREATE PROCEDURE repair_batch()
BEGIN
  DECLARE v_id BIGINT; DECLARE done INT DEFAULT 0; DECLARE n INT DEFAULT 0;
  DECLARE c CURSOR FOR SELECT id FROM orders WHERE needs_fix = 1 ORDER BY id LIMIT 5000;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  OPEN c;
  lp: LOOP FETCH c INTO v_id; IF done THEN LEAVE lp; END IF;
    CALL fix_order(v_id); SET n = n + 1;
  END LOOP;
  CLOSE c;
  SELECT n AS fixed;
END //
DELIMITER ;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Cursor Loops & Handlers': dv(
        [`The standard cursor loop is LOOP, FETCH, test the NOT FOUND flag, process, repeat. The handler runs when FETCH finds no row and sets the flag; the loop must test it right after FETCH because the variables still hold the previous row's values.`,
            r`DELIMITER //
CREATE PROCEDURE apply_bonus()
BEGIN
  DECLARE v_id INT; DECLARE done INT DEFAULT 0; DECLARE n INT DEFAULT 0;
  DECLARE c CURSOR FOR SELECT id FROM emp WHERE salary < 50000;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  OPEN c;
  lp: LOOP
    FETCH c INTO v_id;
    IF done = 1 THEN LEAVE lp; END IF;
    UPDATE emp SET salary = salary + 2000 WHERE id = v_id;
    SET n = n + 1;
  END LOOP;
  CLOSE c;
  SELECT n AS updated;
END //
DELIMITER ;
CALL apply_bonus();

-- OUTPUT:
-- updated
-- 1`],
        [`Nested cursors need an inner BEGIN...END block with its own handler and flag, so the inner NOT FOUND does not end the outer loop. Add specific handlers (for example for duplicate keys) inside the loop to skip bad rows.`,
            r`DELIMITER //
CREATE PROCEDURE nested_demo()
BEGIN
  DECLARE d_id INT; DECLARE done_outer INT DEFAULT 0;
  DECLARE c_dept CURSOR FOR SELECT id FROM departments;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_outer = 1;
  OPEN c_dept;
  outer_lp: LOOP
    FETCH c_dept INTO d_id; IF done_outer THEN LEAVE outer_lp; END IF;
    BEGIN
      DECLARE e_id INT; DECLARE done_inner INT DEFAULT 0;
      DECLARE c_emp CURSOR FOR SELECT id FROM emp WHERE dept = d_id;
      DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_inner = 1;
      OPEN c_emp;
      inner_lp: LOOP FETCH c_emp INTO e_id; IF done_inner THEN LEAVE inner_lp; END IF; /* process employee */ END LOOP;
      CLOSE c_emp;
    END;
  END LOOP;
  CLOSE c_dept;
END //
DELIMITER ;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: sharing one flag between nested cursors, processing before checking the flag, and a handler declared for all errors that hides real problems. Declare precise handlers and keep each scope clean.`,
            r`-- wrong: processes the last row twice
-- FETCH c INTO v; UPDATE ... WHERE id = v; IF done THEN LEAVE lp; END IF;
-- right: check first
-- FETCH c INTO v; IF done THEN LEAVE lp; END IF; UPDATE ... WHERE id = v;

-- OUTPUT:
-- (the right order touches each row exactly once)`],
        [`Large cursor jobs should commit in chunks and be restartable. Track the last processed id and resume from it, so a failure does not lose hours of work.`,
            r`UPDATE job_progress SET last_id = 5000 WHERE job = 'repair';
SELECT last_id FROM job_progress WHERE job = 'repair';
-- next run: WHERE id > last_id ORDER BY id LIMIT 5000

-- OUTPUT:
-- last_id
-- 5000`],
        [`Real-world: migrate rows to a new schema with per-row validation and a rejects table, so bad rows are recorded and the job continues.`,
            r`DELIMITER //
CREATE PROCEDURE migrate_rows()
BEGIN
  DECLARE v_id BIGINT; DECLARE done INT DEFAULT 0;
  DECLARE c CURSOR FOR SELECT id FROM legacy_orders ORDER BY id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  OPEN c;
  lp: LOOP FETCH c INTO v_id; IF done THEN LEAVE lp; END IF;
    BEGIN
      DECLARE EXIT HANDLER FOR SQLEXCEPTION INSERT INTO migration_rejects (legacy_id, reason) VALUES (v_id, 'insert failed');
      INSERT INTO orders (legacy_id, customer_id, total) SELECT id, customer_id, total FROM legacy_orders WHERE id = v_id;
    END;
  END LOOP;
  CLOSE c;
END //
DELIMITER ;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'Cursors vs Set-Based SQL': dv(
        [`Set-based SQL gives the optimizer the whole problem: it can choose indexes, join algorithms, batching and read-ahead. A cursor loop issues one statement per row, each paying parse/dispatch overhead and a separate index lookup. The work is the same logically but far larger in practice.`,
            r`-- cursor style: one UPDATE per row
-- set style: one statement
UPDATE emp e JOIN dept_bonus b ON b.dept = e.dept SET e.salary = e.salary + b.amount;
SELECT ROW_COUNT();

-- OUTPUT:
-- ROW_COUNT()
-- 120450        (one statement, one plan)`],
        [`Common cursor-to-SQL conversions: running totals → window SUM OVER; row comparisons with previous → LAG/LEAD; conditional updates → CASE; hierarchies → recursive CTE; ranking → ROW_NUMBER/RANK; per-group top N → window or LATERAL.`,
            r`SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running_total, amount - LAG(amount) OVER (ORDER BY id) AS change FROM payments;
UPDATE emp SET salary = CASE WHEN salary < 50000 THEN salary * 1.10 WHEN salary < 70000 THEN salary * 1.05 ELSE salary END;

-- OUTPUT:
-- id | amount | running_total | change
--  1 |    100 |           100 | NULL
--  2 |     50 |           150 | -50`],
        [`Mistakes: porting procedural logic row by row from another system, and keeping a cursor because "it works". Rewrite the logic declaratively; verify equal results on a copy.`,
            r`-- verify the rewrite against the cursor result on a copy of the data
SELECT COUNT(*) FROM emp_cursor_result r JOIN emp_set_result s USING (id) WHERE r.salary <> s.salary;

-- OUTPUT:
-- COUNT(*)
-- 0           (identical results)`],
        [`When a loop is unavoidable, batch it: process ranges of primary keys per statement instead of per row, commit each batch, and pause on replication lag.`,
            r`UPDATE big_table SET flag = 1 WHERE id BETWEEN 1 AND 10000 AND flag = 0;
UPDATE big_table SET flag = 1 WHERE id BETWEEN 10001 AND 20000 AND flag = 0;
SHOW REPLICA STATUS\G

-- OUTPUT:
-- Query OK, 10000 rows affected   (x N batches; Seconds_Behind_Source stays low)`],
        [`Real-world: a nightly job rewritten from a cursor that took 3 hours to a set-based pipeline that takes 4 minutes, with the same results and far fewer locks held per second.`,
            r`INSERT INTO daily_balances (account_id, day, balance)
SELECT account_id, CURDATE(), SUM(amount) OVER (PARTITION BY account_id) FROM ledger WHERE posted_on = CURDATE()
ON DUPLICATE KEY UPDATE balance = VALUES(balance);

-- OUTPUT:
-- Query OK, 48211 rows affected (4.2 sec)`]
    )
};
