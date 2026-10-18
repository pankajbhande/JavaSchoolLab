// Modules 22-26 (Views, Stored Procedures, Stored Functions, Triggers, Cursors) extras.
import { x, r, type Extra } from './extra';

export const e09: Record<string, Extra> = {
    'CREATE, ALTER & DROP VIEW': x(
        ['A view is a saved SELECT that behaves like a virtual table. Create it with <code>CREATE VIEW v AS SELECT ...</code>.',
            'Change it with <code>ALTER VIEW</code> or <code>CREATE OR REPLACE VIEW</code>; remove with <code>DROP VIEW</code>.',
            'Query it like a table: <code>SELECT * FROM v</code>.'],
        ['A view stores no data (unless you build a summary table); each query runs the underlying SELECT.',
            'Views simplify complex joins and give a stable interface when tables change.',
            '<code>SHOW CREATE VIEW v</code> shows its definition.'],
        ['Layered views (views on views) hide cost; the optimizer merges simple views but materializes complex ones (GROUP BY, DISTINCT, UNION) into temp tables.',
            'Use <code>ALGORITHM=MERGE</code> or <code>TEMPTABLE</code> deliberately; check with EXPLAIN.',
            'Version view changes with migrations; dropping a column in a base table can break views silently until queried.'],
        [['F', 'What is a view?', 'A stored query that works like a virtual table.'],
            ['F', 'Does a view store data?', 'No, it runs the underlying query each time.'],
            ['M', 'How do you modify a view definition?', '<code>CREATE OR REPLACE VIEW</code> or <code>ALTER VIEW</code>.'],
            ['M', 'MERGE vs TEMPTABLE algorithm?', 'MERGE inlines the view into the outer query; TEMPTABLE materializes it into a temp table first.'],
            ['S', 'Why can views hurt performance?', 'Nested or aggregating views can force temp tables and prevent index use through the view.'],
            ['S', 'How do you manage views in releases?', 'Treat them as code in migrations, test dependent views after base table changes, and check <code>information_schema.views</code> for broken ones.']],
        [['Create and use a view.',
            r`CREATE VIEW emp_dept AS
SELECT e.id, e.name, d.name AS dept FROM emp e JOIN departments d ON d.id = e.dept;
SELECT * FROM emp_dept WHERE dept = 'HR';

-- OUTPUT:
-- id | name  | dept
--  1 | Abaji | HR
--  2 | Raoji | HR`],
            ['Replace and drop.',
                r`CREATE OR REPLACE VIEW emp_dept AS SELECT e.id, e.name, d.name AS dept, e.salary FROM emp e JOIN departments d ON d.id = e.dept;
DROP VIEW IF EXISTS emp_dept;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['See the definition.',
            r`SHOW CREATE VIEW emp_dept\G

-- OUTPUT: (excerpt)
-- View: emp_dept
-- Create View: CREATE ... VIEW emp_dept AS select e.id AS id, e.name AS name ...`],
            ['Find invalid views.',
                r`SELECT table_name FROM information_schema.views WHERE table_schema = DATABASE();
CHECK TABLE emp_dept;

-- OUTPUT: (example)
-- Table          | Op    | Msg_type | Msg_text
-- shop.emp_dept  | check | status   | OK`]]
    ),

    'Updatable Views': x(
        ['A simple view on one table can be updated: INSERT, UPDATE and DELETE on the view change the underlying table.',
            'Views with GROUP BY, DISTINCT, aggregates, UNION or some joins are not updatable.',
            'Use <code>WITH CHECK OPTION</code> to stop changes that make a row disappear from the view.'],
        ['Join views can sometimes be updated, but only one base table per statement.',
            'Columns derived from expressions cannot be updated.',
            'Check updatability in <code>information_schema.views.is_updatable</code>.'],
        ['Updatable views are useful for backward-compatible table rename/split migrations (a view with the old name).',
            'Keep write paths simple; routing writes through views complicates debugging.',
            'WITH CHECK OPTION enforces row-level policies (like tenant filters) at the view layer.'],
        [['F', 'Can you update through a view?', 'Yes, if it is simple (single table, no aggregates or DISTINCT).'],
            ['F', 'What does WITH CHECK OPTION do?', 'Rejects inserts/updates that would produce rows not visible through the view.'],
            ['M', 'Which views are not updatable?', 'Those with aggregates, GROUP BY, DISTINCT, UNION, subqueries in some places or derived columns.'],
            ['M', 'How do you check if a view is updatable?', 'Query <code>information_schema.views</code> column IS_UPDATABLE.'],
            ['S', 'How can views help migrate a renamed table?', 'Rename the table and create a view with the old name so old code keeps working during the transition.'],
            ['S', 'Is a view a security boundary for multi-tenancy?', 'It can restrict rows with a filter and CHECK OPTION, but combine with proper grants; do not rely on views alone.']],
        [['Updating through a view.',
            r`CREATE VIEW hr_emp AS SELECT id, name, salary FROM emp WHERE dept = 10 WITH CHECK OPTION;
UPDATE hr_emp SET salary = salary + 1000 WHERE id = 1;
SELECT salary FROM emp WHERE id = 1;

-- OUTPUT:
-- salary
-- 61000`],
            ['CHECK OPTION blocks escaping rows.',
                r`INSERT INTO hr_emp (id, name, salary) VALUES (9, 'Zed', 1);   -- dept not in view columns => dept NULL
UPDATE hr_emp SET salary = 5 WHERE id = 1;                       -- allowed
-- Changing dept would violate:
-- ERROR 1369 (HY000): CHECK OPTION failed 'shop.hr_emp'

-- OUTPUT:
-- ERROR 1369 (HY000): CHECK OPTION failed 'shop.hr_emp'`]],
        [['Check updatability.',
            r`SELECT table_name, is_updatable FROM information_schema.views WHERE table_schema = DATABASE();

-- OUTPUT:
-- table_name | is_updatable
-- hr_emp     | YES
-- dept_stats | NO`],
            ['Compatibility view after rename.',
                r`RENAME TABLE customers TO customer_accounts;
CREATE VIEW customers AS SELECT * FROM customer_accounts;
SELECT COUNT(*) FROM customers;

-- OUTPUT:
-- COUNT(*)
-- 120`]]
    ),

    'Views for Security': x(
        ['A view can expose only some columns or rows of a table, hiding sensitive data like salary or password hashes.',
            'Grant users access to the view, not the base table.',
            'Example: HR sees names and departments but not salaries.'],
        ['Use <code>SQL SECURITY DEFINER</code> (runs with the creator’s rights) or <code>INVOKER</code> (caller’s rights) intentionally.',
            'Combine views with column-level or table grants for least privilege.',
            'Views can mask data: show last 4 digits of a card number.'],
        ['DEFINER views are an escalation vector if the definer is powerful; use dedicated low-privilege definer accounts.',
            'Masking in views is not a substitute for encryption or access auditing.',
            'Prefer MySQL roles plus views, and test with the actual restricted account.'],
        [['F', 'How can a view improve security?', 'By exposing only allowed columns/rows and granting access to the view instead of the table.'],
            ['F', 'Can a user query a view without access to the base table?', 'Yes, if granted on the view and the view is DEFINER security.'],
            ['M', 'DEFINER vs INVOKER?', 'DEFINER runs with the privileges of the account that created the view; INVOKER uses the caller’s privileges.'],
            ['M', 'How do you mask data with a view?', 'Use functions like <code>CONCAT("****", RIGHT(card, 4))</code> in the select list.'],
            ['S', 'Risk of DEFINER views?', 'A powerful definer exposes more data than intended; use a minimal-privilege definer and review grants.'],
            ['S', 'Are views enough for compliance?', 'No; you also need encryption, auditing, network controls and column-level access policies.']],
        [['Hide salary from HR readers.',
            r`CREATE VIEW emp_public AS SELECT id, name, dept FROM emp;
CREATE USER 'hr_reader'@'%' IDENTIFIED BY 'Hr#Pass1';
GRANT SELECT ON shop.emp_public TO 'hr_reader'@'%';
-- as hr_reader:
SELECT salary FROM shop.emp;

-- OUTPUT:
-- ERROR 1142 (42000): SELECT command denied to user 'hr_reader'@'localhost' for table 'emp'`],
            ['Mask a card number.',
                r`CREATE VIEW payments_masked AS SELECT id, CONCAT('**** **** **** ', RIGHT(card_no, 4)) AS card, amount FROM payments;
SELECT * FROM payments_masked LIMIT 1;

-- OUTPUT:
-- id | card                | amount
--  1 | **** **** **** 4242 | 500.00`]],
        [['Security INVOKER view.',
            r`CREATE SQL SECURITY INVOKER VIEW my_orders AS SELECT * FROM orders WHERE customer_id = (SELECT id FROM customers WHERE email = SUBSTRING_INDEX(USER(), '@', 1));

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Check who defines each view.',
                r`SELECT table_name, definer, security_type FROM information_schema.views WHERE table_schema = DATABASE();

-- OUTPUT: (example)
-- table_name | definer        | security_type
-- emp_public | admin@localhost| DEFINER`]]
    ),

    'Views vs Tables vs Stored Procedures': x(
        ['A table stores data. A view is a saved query that looks like a table. A stored procedure is saved code you CALL, which can do many statements.',
            'Views are for reading data in a simplified way; procedures are for actions and logic.',
            'Only tables hold data on disk.'],
        ['Views return a result set you can filter and join; procedures cannot be used in a FROM clause.',
            'Procedures can modify data, use variables, loops and transactions; views cannot.',
            'Use a view when you need reusable query logic and a procedure when you need a workflow.'],
        ['Business logic in procedures reduces round trips but couples logic to the database, complicates testing and deployments.',
            'Many teams keep logic in application code and use views only for reporting and compatibility.',
            'Materialized-view needs (precomputed aggregates) must be built manually with tables and refresh jobs in MySQL.'],
        [['F', 'Difference between a view and a table?', 'A table stores data; a view stores a query and presents its result as a virtual table.'],
            ['F', 'View vs stored procedure?', 'A view is a query you can SELECT from; a procedure is code you CALL that can perform multiple actions.'],
            ['M', 'Can you use a stored procedure in a FROM clause?', 'No; use a view, a table function (not in MySQL) or temp table instead.'],
            ['M', 'Does MySQL have materialized views?', 'Not natively; emulate with a summary table refreshed by events or jobs.'],
            ['S', 'Where should business logic live?', 'Usually in the application for testability and deployment; procedures for data-heavy batch operations close to the data.'],
            ['S', 'How do you emulate a materialized view?', 'A table filled by INSERT ... SELECT on a schedule (EVENT) or incrementally by triggers/jobs, with a refresh timestamp.']],
        [['Compare the three.',
            r`CREATE VIEW v_hr AS SELECT * FROM emp WHERE dept = 10;                        -- query
CREATE PROCEDURE raise_salary(IN pct INT) UPDATE emp SET salary = salary * (1 + pct/100);  -- action
SELECT COUNT(*) FROM v_hr;
CALL raise_salary(10);

-- OUTPUT:
-- COUNT(*)
-- 2
-- Query OK, 3 rows affected`],
            ['Procedure not allowed in FROM.',
                r`SELECT * FROM raise_salary;

-- OUTPUT:
-- ERROR 1146 (42S02): Table 'shop.raise_salary' doesn't exist`]],
        [['Materialized view emulation.',
            r`CREATE TABLE mv_dept_totals (dept INT PRIMARY KEY, total DECIMAL(12,2), refreshed_at DATETIME);
CREATE EVENT ev_refresh ON SCHEDULE EVERY 1 HOUR DO
  REPLACE INTO mv_dept_totals SELECT dept, SUM(salary), NOW() FROM emp GROUP BY dept;

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['List objects by type.',
                r`SELECT table_type, COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() GROUP BY table_type;

-- OUTPUT:
-- table_type | COUNT(*)
-- BASE TABLE |        8
-- VIEW       |        3`]]
    ),

    'CREATE PROCEDURE & CALL': x(
        ['A stored procedure is a named block of SQL saved in the database and run with <code>CALL name(args)</code>.',
            'In the mysql client change the delimiter while defining: <code>DELIMITER //</code> ... <code>END //</code> <code>DELIMITER ;</code>.',
            'Drop with <code>DROP PROCEDURE name</code>.'],
        ['Procedures can run several statements, control flow, transactions and return result sets.',
            'They reduce network round trips for multi-step operations.',
            'View definitions with <code>SHOW CREATE PROCEDURE</code>.'],
        ['Version stored routines like code (migrations), keep them small and idempotent.',
            'Debugging and profiling are weaker than in application code; log through tables or signals.',
            'Execution plans are cached per connection; behaviour can vary with parameters (parameter sniffing is milder in MySQL but exists).'],
        [['F', 'What is a stored procedure?', 'Saved SQL code that you execute with CALL.'],
            ['F', 'Why change the DELIMITER?', 'So the client does not end the statement at the first semicolon inside the procedure body.'],
            ['M', 'Advantages of procedures?', 'Fewer round trips, reuse, centralised logic and privilege control through EXECUTE grants.'],
            ['M', 'Disadvantages?', 'Harder to test, version, debug and scale; logic is tied to the database engine.'],
            ['S', 'When are procedures a good choice?', 'Batch data operations close to the data, controlled write paths with strict privileges, legacy integration.'],
            ['S', 'How do you deploy procedures safely?', 'Put them in migrations, use CREATE OR... style with DROP IF EXISTS, test in CI against a real MySQL and keep backward-compatible signatures.']],
        [['Simple procedure.',
            r`DELIMITER //
CREATE PROCEDURE emp_by_dept(IN d INT)
BEGIN
  SELECT id, name, salary FROM emp WHERE dept = d ORDER BY id;
END //
DELIMITER ;
CALL emp_by_dept(10);

-- OUTPUT:
-- id | name  | salary
--  1 | Abaji | 60000
--  2 | Raoji | 45000`],
            ['Transactional procedure.',
                r`DELIMITER //
CREATE PROCEDURE transfer(IN a INT, IN b INT, IN amt DECIMAL(10,2))
BEGIN
  START TRANSACTION;
  UPDATE acct SET bal = bal - amt WHERE id = a;
  UPDATE acct SET bal = bal + amt WHERE id = b;
  COMMIT;
END //
DELIMITER ;
CALL transfer(1, 2, 100);

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Inspect and drop.',
            r`SHOW CREATE PROCEDURE emp_by_dept\G
DROP PROCEDURE IF EXISTS emp_by_dept;

-- OUTPUT:
-- Procedure: emp_by_dept ... (definition shown), then Query OK`],
            ['Restrict execution.',
                r`GRANT EXECUTE ON PROCEDURE shop.transfer TO 'app'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'IN, OUT & INOUT Parameters': x(
        ['IN passes a value into the procedure. OUT returns a value to the caller. INOUT passes a value in and returns the modified value.',
            'Receive OUT values in a session variable: <code>CALL p(@result)</code> then <code>SELECT @result</code>.',
            'IN is the default.'],
        ['Parameters are typed; names should not clash with column names (prefix with p_).',
            'OUT parameters are NULL inside the procedure until assigned.',
            'For many rows, return a result set instead of OUT parameters.'],
        ['Prefer returning result sets for data and OUT only for scalars like counts or status codes.',
            'Version procedure signatures carefully: changing parameters breaks callers.',
            'Use a consistent status/error convention (OUT p_status, SIGNAL for errors).'],
        [['F', 'What are IN, OUT and INOUT?', 'IN: input value. OUT: output value. INOUT: input and output.'],
            ['F', 'How do you read an OUT parameter?', 'Pass a user variable like @r and select it after CALL.'],
            ['M', 'Why prefix parameters with p_?', 'To avoid ambiguity with column names inside queries.'],
            ['M', 'When use a result set instead of OUT?', 'For multiple rows or multiple columns of data.'],
            ['S', 'How do you evolve a procedure signature?', 'Add new procedures or optional trailing parameters via a new routine name, deprecate the old one, migrate callers.'],
            ['S', 'Why avoid heavy OUT use?', 'It couples callers to variables and hides contracts; result sets and SIGNAL errors are clearer.']],
        [['OUT parameter.',
            r`DELIMITER //
CREATE PROCEDURE dept_count(IN p_dept INT, OUT p_cnt INT)
BEGIN
  SELECT COUNT(*) INTO p_cnt FROM emp WHERE dept = p_dept;
END //
DELIMITER ;
CALL dept_count(10, @c);
SELECT @c;

-- OUTPUT:
-- @c
-- 2`],
            ['INOUT parameter.',
                r`DELIMITER //
CREATE PROCEDURE add_tax(INOUT p_amount DECIMAL(10,2), IN p_rate DECIMAL(4,2))
BEGIN
  SET p_amount = p_amount * (1 + p_rate / 100);
END //
DELIMITER ;
SET @amt = 1000; CALL add_tax(@amt, 18);
SELECT @amt;

-- OUTPUT:
-- @amt
-- 1180.00`]],
        [['Name clash pitfall.',
            r`-- parameter named dept hides column dept
CREATE PROCEDURE bad(IN dept INT) SELECT * FROM emp WHERE dept = dept;
CALL bad(10);

-- OUTPUT:
-- (all rows returned: dept = dept is always true)`],
            ['Status code via OUT.',
                r`CALL transfer_safe(1, 2, 5000, @status);
SELECT @status;

-- OUTPUT:
-- @status
-- INSUFFICIENT_FUNDS`]]
    ),

    'Variables, IF & CASE in Procedures': x(
        ['Declare local variables with <code>DECLARE v INT DEFAULT 0;</code> and set them with <code>SET</code> or <code>SELECT ... INTO</code>.',
            '<code>IF ... THEN ... ELSEIF ... ELSE ... END IF;</code> and <code>CASE</code> add decisions.',
            'DECLARE must be at the start of a BEGIN block.'],
        ['User variables (<code>@x</code>) live for the session; local variables live in the block.',
            'CASE can be a statement (in procedures) or an expression (in SQL).',
            '<code>SELECT ... INTO</code> must return exactly one row or you get an error.'],
        ['Use SIGNAL to raise errors with SQLSTATE and messages for invalid input.',
            'Beware of variable name collisions with columns and of NULL handling in IF conditions (NULL is not true).',
            'Keep logic simple; complex branching belongs in application code.'],
        [['F', 'How do you declare a variable in a procedure?', '<code>DECLARE name TYPE [DEFAULT value];</code>'],
            ['F', 'IF syntax?', '<code>IF cond THEN ... ELSEIF ... ELSE ... END IF;</code>'],
            ['M', 'Local vs user variable?', 'Local variables exist only inside the BEGIN...END block; user variables (@x) last for the session.'],
            ['M', 'What if SELECT INTO returns no row?', 'Warning "No data" and variable unchanged (or error with a handler).'],
            ['S', 'How do you raise a custom error?', '<code>SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "..."</code>.'],
            ['S', 'Why avoid heavy logic in procedures?', 'Testing, debugging and observability are weak compared to application code.']],
        [['Branching with variables.',
            r`DELIMITER //
CREATE PROCEDURE grade(IN p_score INT, OUT p_grade CHAR(1))
BEGIN
  IF p_score >= 90 THEN SET p_grade = 'A';
  ELSEIF p_score >= 75 THEN SET p_grade = 'B';
  ELSE SET p_grade = 'C';
  END IF;
END //
DELIMITER ;
CALL grade(82, @g); SELECT @g;

-- OUTPUT:
-- @g
-- B`],
            ['CASE and SIGNAL.',
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
-- ERROR 1644 (45000): Unknown zone`]],
        [['SELECT INTO a variable.',
            r`DELIMITER //
CREATE PROCEDURE top_salary(OUT p_name VARCHAR(20))
BEGIN
  DECLARE v_max INT;
  SELECT MAX(salary) INTO v_max FROM emp;
  SELECT name INTO p_name FROM emp WHERE salary = v_max LIMIT 1;
END //
DELIMITER ;
CALL top_salary(@n); SELECT @n;

-- OUTPUT:
-- @n
-- Moropant`],
            ['NULL in IF is not true.',
                r`SELECT IF(NULL > 5, 'yes', 'no') AS result;

-- OUTPUT:
-- result
-- no`]]
    ),

    'Loops in Procedures': x(
        ['MySQL has <code>WHILE</code>, <code>REPEAT ... UNTIL</code> and <code>LOOP</code> with <code>LEAVE</code> and <code>ITERATE</code>.',
            'Use them to repeat steps, for example generating test data or batching deletes.',
            'Each loop needs a counter or a condition that eventually ends it.'],
        ['<code>WHILE cond DO ... END WHILE</code> checks before running; <code>REPEAT ... UNTIL cond END REPEAT</code> checks after.',
            '<code>LEAVE label</code> exits a loop; <code>ITERATE label</code> jumps to the next pass.',
            'Prefer set-based SQL to row-by-row loops where possible.'],
        ['Loops with per-row statements are slow; batch (<code>LIMIT 1000</code>) and commit between batches for large maintenance jobs.',
            'Always add a safety counter to avoid infinite loops.',
            'Long loops hold locks; commit regularly in batch jobs and handle replication lag.'],
        [['F', 'Which loops does MySQL have?', 'WHILE, REPEAT and LOOP.'],
            ['F', 'How do you exit a LOOP?', 'With <code>LEAVE label</code>.'],
            ['M', 'WHILE vs REPEAT?', 'WHILE tests before each pass; REPEAT runs at least once and tests after.'],
            ['M', 'Why prefer set-based SQL?', 'The engine optimises whole-set operations; loops execute statement by statement and are slower.'],
            ['S', 'How do you purge millions of rows safely in a procedure?', 'Loop deleting in batches with LIMIT, commit each batch, sleep or check replica lag, and stop on 0 rows.'],
            ['S', 'How to prevent infinite loops?', 'Use a bounded counter, deterministic exit and monitoring/timeouts.']],
        [['Fill test data with WHILE.',
            r`DELIMITER //
CREATE PROCEDURE seed(IN n INT)
BEGIN
  DECLARE i INT DEFAULT 1;
  WHILE i <= n DO
    INSERT INTO nums VALUES (i);
    SET i = i + 1;
  END WHILE;
END //
DELIMITER ;
CREATE TABLE nums (n INT); CALL seed(5); SELECT COUNT(*) FROM nums;

-- OUTPUT:
-- COUNT(*)
-- 5`],
            ['LEAVE and ITERATE.',
                r`DELIMITER //
CREATE PROCEDURE odd_sum(OUT s INT)
BEGIN
  DECLARE i INT DEFAULT 0;
  SET s = 0;
  lp: LOOP
    SET i = i + 1;
    IF i > 10 THEN LEAVE lp; END IF;
    IF i MOD 2 = 0 THEN ITERATE lp; END IF;
    SET s = s + i;
  END LOOP;
END //
DELIMITER ;
CALL odd_sum(@s); SELECT @s;

-- OUTPUT:
-- @s
-- 25`]],
        [['Batched purge loop.',
            r`DELIMITER //
CREATE PROCEDURE purge_old()
BEGIN
  DECLARE n INT DEFAULT 1;
  WHILE n > 0 DO
    DELETE FROM events WHERE created_at < NOW() - INTERVAL 90 DAY LIMIT 1000;
    SET n = ROW_COUNT();
    DO SLEEP(0.1);
  END WHILE;
END //
DELIMITER ;

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Set-based alternative to a loop.',
                r`INSERT INTO nums SELECT seq FROM (WITH RECURSIVE s(seq) AS (SELECT 1 UNION ALL SELECT seq+1 FROM s WHERE seq < 1000) SELECT seq FROM s) t;

-- OUTPUT:
-- Query OK, 1000 rows affected`]]
    ),

    'Error Handling in Procedures': x(
        ['Use <code>DECLARE ... HANDLER</code> to catch errors in a procedure, and <code>SIGNAL</code> to raise your own errors.',
            'Common handler: <code>DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; END;</code>.',
            'EXIT handlers leave the block; CONTINUE handlers resume after the failing statement.'],
        ['Handlers can target SQLEXCEPTION, SQLWARNING, NOT FOUND or specific error numbers/SQLSTATE.',
            '<code>GET DIAGNOSTICS</code> reads the error message and number.',
            '<code>RESIGNAL</code> rethrows after cleanup.'],
        ['Pair transaction control with an EXIT handler so failures always roll back.',
            'Log errors to a table in an autonomous way (separate connection) because the main transaction rolls back its logs.',
            'Return stable error codes to applications; do not leak internal messages.'],
        [['F', 'How do you catch errors in a procedure?', 'With DECLARE HANDLER.'],
            ['F', 'How do you raise an error?', '<code>SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "msg";</code>'],
            ['M', 'EXIT vs CONTINUE handler?', 'EXIT leaves the BEGIN...END block; CONTINUE resumes with the next statement.'],
            ['M', 'How do you read the error details?', '<code>GET DIAGNOSTICS CONDITION 1 msg = MESSAGE_TEXT, code = MYSQL_ERRNO;</code>'],
            ['S', 'How do you log an error when the transaction rolls back?', 'Logs written in the same transaction vanish; write to an external log, a separate connection or a non-transactional table such as one from application code.'],
            ['S', 'How do you design error contracts for procedures?', 'Use SIGNAL with consistent SQLSTATEs and codes documented for callers, and map them to API errors.']],
        [['Rollback on error.',
            r`DELIMITER //
CREATE PROCEDURE safe_transfer(IN a INT, IN b INT, IN amt DECIMAL(10,2))
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transfer failed';
  END;
  START TRANSACTION;
  UPDATE acct SET bal = bal - amt WHERE id = a;
  UPDATE acct SET bal = bal + amt WHERE id = b;
  COMMIT;
END //
DELIMITER ;
CALL safe_transfer(1, 2, 999999);

-- OUTPUT:
-- ERROR 1644 (45000): Transfer failed`],
            ['Diagnostics.',
                r`DELIMITER //
CREATE PROCEDURE try_insert()
BEGIN
  DECLARE msg TEXT; DECLARE code INT;
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
  BEGIN GET DIAGNOSTICS CONDITION 1 msg = MESSAGE_TEXT, code = MYSQL_ERRNO; SELECT code, msg; END;
  INSERT INTO acct VALUES (1, 5);
END //
DELIMITER ;
CALL try_insert();

-- OUTPUT:
-- code | msg
-- 1062 | Duplicate entry '1' for key 'acct.PRIMARY'`]],
        [['NOT FOUND handler.',
            r`DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

-- OUTPUT: (used with cursors; sets done when FETCH has no more rows)`],
            ['RESIGNAL after cleanup.',
                r`DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

-- OUTPUT:
-- (original error is returned to the caller after rollback)`]]
    ),

    'CREATE FUNCTION': x(
        ['A stored function takes parameters and returns one value, and can be used inside SQL: <code>SELECT tax(price)</code>.',
            'Syntax: <code>CREATE FUNCTION f(a INT) RETURNS INT DETERMINISTIC BEGIN ... RETURN x; END</code>.',
            'Drop with <code>DROP FUNCTION</code>.'],
        ['Functions must declare DETERMINISTIC, NO SQL or READS SQL DATA when binary logging is on.',
            'They cannot return result sets and cannot use transactions control statements.',
            'Use them for reusable calculations and formatting.'],
        ['A function called in WHERE on an indexed column prevents index use and runs per row; avoid in hot queries.',
            'Not allowed to modify data when called from a query in some contexts; side effects are risky for replication.',
            'Consider generated columns or application logic for performance-sensitive calculations.'],
        [['F', 'What is a stored function?', 'A routine that returns a single value and can be used in SQL expressions.'],
            ['F', 'How does it differ from a procedure?', 'A function returns a value and is called inside queries; a procedure is run with CALL.'],
            ['M', 'Why must functions be declared DETERMINISTIC or similar?', 'With binary logging, MySQL needs to know if the function is safe for replication.'],
            ['M', 'Can a function return a table?', 'No, only a scalar value.'],
            ['S', 'Why are functions in WHERE risky?', 'They run per row and block index usage.'],
            ['S', 'Alternatives for reusable calculations?', 'Generated columns, views, application code, or precomputed columns.']],
        [['Simple tax function.',
            r`DELIMITER //
CREATE FUNCTION tax(p_price DECIMAL(10,2)) RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
  RETURN ROUND(p_price * 0.18, 2);
END //
DELIMITER ;
SELECT name, price, tax(price) AS gst FROM products;

-- OUTPUT:
-- name | price  | gst
-- Pen  |  10.00 |  1.80
-- Book | 150.50 | 27.09`],
            ['Use it in a query.',
                r`SELECT SUM(tax(total)) AS total_tax FROM orders;

-- OUTPUT:
-- total_tax
-- 4210.00`]],
        [['Binary log requirement error.',
            r`CREATE FUNCTION rnd() RETURNS INT BEGIN RETURN FLOOR(RAND()*10); END;

-- OUTPUT:
-- ERROR 1418 (HY000): This function has none of DETERMINISTIC, NO SQL, or READS SQL DATA in its declaration and binary logging is enabled`],
            ['Fix with a characteristic.',
                r`CREATE FUNCTION rnd() RETURNS INT NOT DETERMINISTIC NO SQL RETURN FLOOR(RAND()*10);
SELECT rnd();

-- OUTPUT:
-- rnd()
-- 7`]]
    ),

    'Deterministic Functions': x(
        ['A deterministic function always returns the same result for the same inputs. <code>DETERMINISTIC</code> tells MySQL so.',
            'Example: a tax calculation is deterministic; a function using RAND() or NOW() is not.',
            'Not deterministic is the default if you declare nothing.'],
        ['The optimizer may use the DETERMINISTIC hint, and it matters for safe replication of statement-based logs.',
            'Wrongly marking a function DETERMINISTIC can cause inconsistent replicas or wrong cached results.',
            'MySQL does not verify your claim.'],
        ['Mark functions accurately: nondeterminism leaks into replication and generated columns (generated columns require deterministic expressions).',
            'Functions that read tables are not deterministic in the mathematical sense; declare READS SQL DATA, not DETERMINISTIC.',
            'Prefer pure functions; isolate time and randomness at the call site.'],
        [['F', 'What is a deterministic function?', 'One that returns the same output for the same input every time.'],
            ['F', 'Is a function using RAND() deterministic?', 'No.'],
            ['M', 'Does MySQL verify DETERMINISTIC?', 'No; it trusts your declaration.'],
            ['M', 'Why does it matter?', 'Replication safety, optimizer decisions and use in generated columns.'],
            ['S', 'What happens if a non-deterministic function is wrongly marked deterministic?', 'Replicas may diverge and results may be reused or optimized incorrectly.'],
            ['S', 'How should functions that read tables be declared?', 'READS SQL DATA, without DETERMINISTIC.']],
        [['Deterministic vs not.',
            r`CREATE FUNCTION circle_area(r DOUBLE) RETURNS DOUBLE DETERMINISTIC RETURN PI() * r * r;
CREATE FUNCTION today_label() RETURNS VARCHAR(20) NOT DETERMINISTIC NO SQL RETURN DATE_FORMAT(NOW(), '%Y-%m-%d');
SELECT ROUND(circle_area(2), 2) AS area, today_label() IS NOT NULL AS ok;

-- OUTPUT:
-- area  | ok
-- 12.57 |  1`],
            ['Used in a generated column (must be deterministic expression).',
                r`ALTER TABLE circles ADD COLUMN area DOUBLE AS (PI() * radius * radius) STORED;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Reads data: declare READS SQL DATA.',
            r`CREATE FUNCTION dept_name(p_id INT) RETURNS VARCHAR(20) READS SQL DATA
RETURN (SELECT name FROM departments WHERE id = p_id);
SELECT dept_name(10);

-- OUTPUT:
-- dept_name(10)
-- HR`],
            ['Check routine characteristics.',
                r`SELECT routine_name, is_deterministic, sql_data_access FROM information_schema.routines WHERE routine_schema = DATABASE();

-- OUTPUT:
-- routine_name | is_deterministic | sql_data_access
-- circle_area  | YES              | CONTAINS SQL
-- dept_name    | NO               | READS SQL DATA`]]
    ),

    'Stored Function vs Procedure': x(
        ['A function returns one value and is used inside SQL expressions. A procedure is run with CALL and can return result sets or OUT parameters.',
            'Functions are for calculations; procedures are for actions.',
            'Procedures can use transactions; functions cannot.'],
        ['Functions: single RETURN value, can be used in SELECT/WHERE; restricted statements (no COMMIT, no result sets).',
            'Procedures: IN/OUT/INOUT, multiple result sets, transaction control, dynamic SQL via prepared statements.',
            'Privileges: EXECUTE is granted separately for each.'],
        ['Functions in queries can silently run once per row; check complexity before using them on large tables.',
            'Use procedures for administrative or batch tasks; use application code for complex business rules.',
            'Document side effects: functions that modify data are problematic in replication and queries.'],
        [['F', 'Function vs procedure?', 'A function returns a value used in queries; a procedure is invoked with CALL and can perform many actions.'],
            ['F', 'Can a function be used in SELECT?', 'Yes.'],
            ['M', 'Which can control transactions?', 'Procedures, not functions.'],
            ['M', 'Which returns result sets?', 'Procedures.'],
            ['S', 'Which to choose for a reusable calculation?', 'A deterministic function (or generated column) for pure calculations.'],
            ['S', 'Which to choose for a batch cleanup?', 'A procedure (or better, an application job) with batching and transaction control.']],
        [['Both side by side.',
            r`CREATE FUNCTION bonus(p_sal INT) RETURNS INT DETERMINISTIC RETURN p_sal * 10 / 100;
CREATE PROCEDURE give_bonus() UPDATE emp SET salary = salary + bonus(salary);
SELECT name, bonus(salary) AS b FROM emp;
CALL give_bonus();

-- OUTPUT:
-- name     | b
-- Abaji    | 6000
-- Raoji    | 4500
-- Moropant | 7000`],
            ['Function cannot control transactions.',
                r`CREATE FUNCTION f() RETURNS INT BEGIN COMMIT; RETURN 1; END;

-- OUTPUT:
-- ERROR 1422 (HY000): Explicit or implicit commit is not allowed in stored function or trigger.`]],
        [['Privileges differ per routine.',
            r`GRANT EXECUTE ON FUNCTION shop.bonus TO 'app'@'%';
GRANT EXECUTE ON PROCEDURE shop.give_bonus TO 'admin'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['List routines by type.',
                r`SELECT routine_type, COUNT(*) FROM information_schema.routines WHERE routine_schema = DATABASE() GROUP BY routine_type;

-- OUTPUT:
-- routine_type | COUNT(*)
-- FUNCTION     | 3
-- PROCEDURE    | 2`]]
    ),

    'BEFORE Triggers': x(
        ['A trigger is code that runs automatically when a row is inserted, updated or deleted. BEFORE triggers run before the change is written.',
            'Use NEW.col for the new value and OLD.col for the old value.',
            'BEFORE triggers can modify NEW values or reject the change with SIGNAL.'],
        ['Typical uses: normalize data (lowercase email), set defaults, validate rules too complex for CHECK.',
            'You can have several triggers per event with <code>FOLLOWS</code> / <code>PRECEDES</code> ordering.',
            'Triggers run for each affected row.'],
        ['Triggers are invisible to application developers, which makes behaviour hard to debug; document and test them.',
            'They add latency to every write and can hide lock contention.',
            'Prefer constraints, generated columns and application logic when they can do the job.'],
        [['F', 'What is a BEFORE trigger?', 'A trigger that runs before a row is inserted, updated or deleted.'],
            ['F', 'What are NEW and OLD?', 'NEW refers to the incoming row values; OLD to the existing row values.'],
            ['M', 'Can a BEFORE trigger change the inserted value?', 'Yes, by assigning to NEW.column.'],
            ['M', 'How do you reject a change in a trigger?', 'Raise an error with SIGNAL.'],
            ['S', 'Why are triggers considered risky?', 'Hidden logic, per-row overhead, interaction with bulk loads/replication and harder debugging.'],
            ['S', 'When are BEFORE triggers justified?', 'Data normalization or validation that must apply to every writer, including ad hoc SQL and multiple applications.']],
        [['Normalize email on insert.',
            r`DELIMITER //
CREATE TRIGGER trg_users_bi BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  SET NEW.email = LOWER(TRIM(NEW.email));
END //
DELIMITER ;
INSERT INTO users (email) VALUES ('  Abaji@Example.COM ');
SELECT email FROM users ORDER BY id DESC LIMIT 1;

-- OUTPUT:
-- email
-- abaji@example.com`],
            ['Validation with SIGNAL.',
                r`DELIMITER //
CREATE TRIGGER trg_acct_bu BEFORE UPDATE ON acct
FOR EACH ROW
BEGIN
  IF NEW.bal < 0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Negative balance not allowed'; END IF;
END //
DELIMITER ;
UPDATE acct SET bal = -1 WHERE id = 1;

-- OUTPUT:
-- ERROR 1644 (45000): Negative balance not allowed`]],
        [['List triggers.',
            r`SELECT trigger_name, event_manipulation, action_timing, event_object_table FROM information_schema.triggers WHERE trigger_schema = DATABASE();

-- OUTPUT:
-- trigger_name | event_manipulation | action_timing | event_object_table
-- trg_users_bi | INSERT             | BEFORE        | users
-- trg_acct_bu  | UPDATE             | BEFORE        | acct`],
            ['Order multiple triggers.',
                r`CREATE TRIGGER trg_users_bi2 BEFORE INSERT ON users FOR EACH ROW FOLLOWS trg_users_bi SET NEW.created_at = NOW();

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'AFTER Triggers': x(
        ['AFTER triggers run after the row change has been made. They are used for side effects such as writing to another table.',
            'In AFTER triggers NEW and OLD are read-only.',
            'Typical use: audit logs, maintaining summary tables.'],
        ['AFTER triggers run inside the same transaction as the triggering statement; if they fail, the whole statement rolls back.',
            'Do not call external systems from triggers.',
            'AFTER INSERT can use NEW.id (including auto-increment value).'],
        ['Summary maintenance in triggers creates hot rows and contention; consider asynchronous aggregation.',
            'Trigger chains (trigger causing updates that fire other triggers) are fragile; MySQL limits recursion but design to avoid it.',
            'Bulk imports multiply trigger cost; consider disabling logic for controlled loads or using batch aggregates.'],
        [['F', 'When does an AFTER trigger run?', 'After the row has been inserted, updated or deleted.'],
            ['F', 'Can an AFTER trigger change NEW values?', 'No, they are read-only.'],
            ['M', 'What happens if an AFTER trigger fails?', 'The triggering statement fails and rolls back.'],
            ['M', 'Typical AFTER trigger use?', 'Auditing and keeping derived tables in sync.'],
            ['S', 'Why avoid maintaining counters in AFTER triggers on hot tables?', 'They update the same summary row for every write, causing lock contention; use sharded counters or async jobs.'],
            ['S', 'Are triggers fired by cascaded foreign key actions?', 'In InnoDB, cascaded FK actions do not fire triggers on the child table.']],
        [['Maintain a counter.',
            r`DELIMITER //
CREATE TRIGGER trg_orders_ai AFTER INSERT ON orders
FOR EACH ROW
BEGIN
  UPDATE customer_stats SET order_count = order_count + 1 WHERE customer_id = NEW.customer_id;
END //
DELIMITER ;
INSERT INTO orders (customer_id, total) VALUES (1, 100);
SELECT order_count FROM customer_stats WHERE customer_id = 1;

-- OUTPUT:
-- order_count
-- 3`],
            ['Failure rolls back the statement.',
                r`INSERT INTO orders (customer_id, total) VALUES (999, 100);   -- no stats row => trigger raises error

-- OUTPUT:
-- ERROR 1644 (45000): customer stats missing`]],
        [['Delete trigger to archive.',
            r`DELIMITER //
CREATE TRIGGER trg_orders_ad AFTER DELETE ON orders
FOR EACH ROW INSERT INTO orders_archive SELECT OLD.*;
//
DELIMITER ;
DELETE FROM orders WHERE id = 1;
SELECT COUNT(*) FROM orders_archive;

-- OUTPUT:
-- COUNT(*)
-- 1`],
            ['Drop the trigger.',
                r`DROP TRIGGER IF EXISTS trg_orders_ad;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Audit Logging with Triggers': x(
        ['Audit logging records who changed what and when. A trigger can copy old and new values into an audit table on every change.',
            'Store table name, row id, action, old/new values, user and timestamp.',
            'It works even for changes made outside your application.'],
        ['Use <code>USER()</code> or <code>CURRENT_USER()</code> for the DB user; the application user needs a session variable (<code>SET @app_user = ...</code>).',
            'Store changed values as JSON for flexibility.',
            'Partition or archive the audit table; it grows quickly.'],
        ['Triggers audit within the same transaction, so audit rows are atomic with changes; this is a strength.',
            'For high-volume systems prefer binlog-based CDC (Debezium) to avoid write amplification.',
            'Protect the audit table with privileges: app users can INSERT via trigger but not UPDATE/DELETE.'],
        [['F', 'What is audit logging?', 'Recording who changed what and when.'],
            ['F', 'How can triggers help?', 'They automatically write a row to an audit table on each insert, update or delete.'],
            ['M', 'How do you capture the application user?', 'Set a session variable at connection start (<code>SET @app_user = "abaji"</code>) and read it in the trigger.'],
            ['M', 'Why make the audit table append-only?', 'To prevent tampering; grant only INSERT to writers and SELECT to auditors.'],
            ['S', 'Triggers vs binlog CDC for auditing?', 'Triggers are simple and transactional but add write cost; CDC from the binlog is asynchronous and adds no write overhead.'],
            ['S', 'How do you keep an audit table manageable?', 'Partition by month, compress or archive old partitions, index by (table, row id, time).']],
        [['Audit trigger with JSON.',
            r`CREATE TABLE audit_log (id BIGINT AUTO_INCREMENT PRIMARY KEY, tbl VARCHAR(30), row_id INT, action VARCHAR(10),
  old_data JSON, new_data JSON, db_user VARCHAR(80), app_user VARCHAR(40), at DATETIME DEFAULT CURRENT_TIMESTAMP);
DELIMITER //
CREATE TRIGGER trg_emp_au AFTER UPDATE ON emp FOR EACH ROW
BEGIN
  INSERT INTO audit_log (tbl, row_id, action, old_data, new_data, db_user, app_user)
  VALUES ('emp', NEW.id, 'UPDATE', JSON_OBJECT('salary', OLD.salary), JSON_OBJECT('salary', NEW.salary), CURRENT_USER(), @app_user);
END //
DELIMITER ;
SET @app_user = 'abaji';
UPDATE emp SET salary = 62000 WHERE id = 1;
SELECT tbl, row_id, old_data, new_data, app_user FROM audit_log;

-- OUTPUT:
-- tbl | row_id | old_data          | new_data          | app_user
-- emp |      1 | {"salary": 61000} | {"salary": 62000} | abaji`],
            ['Append-only privileges.',
                r`REVOKE UPDATE, DELETE ON shop.audit_log FROM 'app'@'%';
GRANT SELECT ON shop.audit_log TO 'auditor'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Query the history of one row.',
            r`SELECT at, action, old_data->>'$.salary' AS old_sal, new_data->>'$.salary' AS new_sal FROM audit_log WHERE tbl='emp' AND row_id = 1 ORDER BY at;

-- OUTPUT:
-- at                  | action | old_sal | new_sal
-- 2026-05-01 10:00:00 | UPDATE | 61000   | 62000`],
            ['Partition the audit table by month.',
                r`ALTER TABLE audit_log PARTITION BY RANGE (TO_DAYS(at)) (
  PARTITION p202605 VALUES LESS THAN (TO_DAYS('2026-06-01')),
  PARTITION pmax VALUES LESS THAN MAXVALUE);

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'When to Avoid Triggers': x(
        ['Avoid triggers when simple constraints, application code or generated columns can do the job.',
            'Triggers hide logic: developers read the application code and do not realise a trigger changes data.',
            'They slow bulk operations because they fire per row.'],
        ['Problems: hidden side effects, hard debugging, ordering issues, cascade interactions, replication/CDC surprises.',
            'Bulk loads fire triggers per row; batch imports can become 10-100x slower.',
            'Triggers are not fired by FK cascades in InnoDB and not by TRUNCATE.'],
        ['Use explicit service-layer code or events for business workflows; use outbox tables for integration.',
            'Keep triggers only for cross-cutting data integrity (auditing, normalization) and keep them tiny and tested.',
            'Add monitoring on trigger count and review them in schema reviews.'],
        [['F', 'Why can triggers be bad?', 'They hide logic, slow writes and are hard to debug.'],
            ['F', 'What are better alternatives?', 'Constraints, generated columns, application logic or scheduled jobs.'],
            ['M', 'How do triggers affect bulk loads?', 'They run per row, making large imports much slower.'],
            ['M', 'Do TRUNCATE or FK cascades fire triggers?', 'No, in InnoDB neither fires row triggers.'],
            ['S', 'How do you integrate with other systems without triggers?', 'Transactional outbox table written by the app plus a relay process or CDC from the binlog.'],
            ['S', 'How do you govern triggers in a team?', 'Require documentation, tests and review for each trigger, keep a catalogue and prefer visible code paths.']],
        [['Replace a validation trigger with CHECK.',
            r`ALTER TABLE acct ADD CONSTRAINT chk_bal CHECK (bal >= 0);
UPDATE acct SET bal = -5 WHERE id = 1;

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'chk_bal' is violated.`],
            ['Replace a timestamp trigger with a default.',
                r`ALTER TABLE emp MODIFY updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Measure trigger overhead.',
            r`-- load 100k rows with and without trigger
-- without: 1.9 s, with AFTER INSERT audit trigger: 14.2 s
SELECT COUNT(*) FROM audit_log;

-- OUTPUT:
-- COUNT(*)
-- 100000`],
            ['Transactional outbox instead of a trigger calling services.',
                r`START TRANSACTION;
INSERT INTO orders (customer_id, total) VALUES (1, 100);
INSERT INTO outbox (aggregate, event, payload) VALUES ('order', 'ORDER_CREATED', JSON_OBJECT('customer', 1));
COMMIT;

-- OUTPUT:
-- Query OK, 1 row affected`]]
    ),

    'Declaring, Opening & Fetching Cursors': x(
        ['A cursor lets a stored program process a query result one row at a time.',
            'Steps: <code>DECLARE c CURSOR FOR SELECT ...</code>, <code>OPEN c</code>, <code>FETCH c INTO vars</code>, <code>CLOSE c</code>.',
            'Cursors exist only inside stored programs.'],
        ['Declarations order: variables, cursors, then handlers.',
            'A NOT FOUND handler signals the end of data.',
            'Cursors are read-only and forward-only in MySQL.'],
        ['Cursors materialize results and run row by row; use them only when set-based SQL cannot express the logic.',
            'Keep the cursor query narrow and indexed.',
            'Close cursors promptly to release resources.'],
        [['F', 'What is a cursor?', 'A pointer to a query result that lets you read rows one at a time.'],
            ['F', 'Where can cursors be used in MySQL?', 'Only inside stored procedures, functions and triggers.'],
            ['M', 'What is the declaration order?', 'Variables first, then cursors, then handlers.'],
            ['M', 'Are MySQL cursors scrollable or updatable?', 'No, they are forward-only and read-only.'],
            ['S', 'Why are cursors slow?', 'They process rows one at a time and add per-row overhead compared with set operations.'],
            ['S', 'When are cursors justified?', 'Row-by-row logic that depends on previous rows or calls routines per row and cannot be expressed in SQL.']],
        [['Basic cursor.',
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
    SELECT v_name;
  END LOOP;
  CLOSE c;
END //
DELIMITER ;
CALL list_names();

-- OUTPUT: (three result sets)
-- Abaji
-- Raoji
-- Moropant`],
            ['Accumulate in a cursor.',
                r`DELIMITER //
CREATE PROCEDURE total_salary(OUT p_total INT)
BEGIN
  DECLARE s INT; DECLARE done INT DEFAULT 0;
  DECLARE c CURSOR FOR SELECT salary FROM emp;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  SET p_total = 0; OPEN c;
  lp: LOOP FETCH c INTO s; IF done THEN LEAVE lp; END IF; SET p_total = p_total + s; END LOOP;
  CLOSE c;
END //
DELIMITER ;
CALL total_salary(@t); SELECT @t;

-- OUTPUT:
-- @t
-- 175000`]],
        [['Set-based equivalent is simpler.',
            r`SELECT SUM(salary) FROM emp;

-- OUTPUT:
-- SUM(salary)
-- 175000`],
            ['Order mistake.',
                r`-- handler declared before the cursor
-- ERROR 1337 (42000): Variable or condition declaration after handler declaration

-- OUTPUT:
-- ERROR 1337 (42000): Variable or condition declaration after handler declaration`]]
    ),

    'Cursor Loops & Handlers': x(
        ['A cursor loop fetches until no rows remain. A <code>NOT FOUND</code> handler sets a flag to leave the loop.',
            'Pattern: LOOP, FETCH, check done flag, process, repeat.',
            'Always reset the flag if you reuse it.'],
        ['After the handler fires, the FETCH variables keep the last values; test the flag right after FETCH.',
            'Nested cursors need separate flags/handlers via inner BEGIN blocks.',
            'Handle errors inside the loop with specific handlers if one row can fail.'],
        ['For batch jobs, commit every N rows to avoid huge transactions.',
            'Log progress and failures to a table so the job can resume.',
            'Prefer chunked set-based updates (UPDATE ... LIMIT) to cursors when possible.'],
        [['F', 'How does a cursor loop end?', 'A NOT FOUND handler sets a flag after the last FETCH and the loop leaves.'],
            ['F', 'Where do you check the flag?', 'Immediately after FETCH, before processing the variables.'],
            ['M', 'How do you use two cursors?', 'Give each its own done flag and wrap inner cursor logic in a nested BEGIN...END block with its own handler.'],
            ['M', 'Why check the flag right after FETCH?', 'Otherwise you process the stale values from the previous row.'],
            ['S', 'How to make a cursor-based job restartable?', 'Track processed ids or a high-water mark in a progress table and resume from it.'],
            ['S', 'How to avoid giant transactions in cursor jobs?', 'Commit every batch (for example 1000 rows) and handle errors per batch.']],
        [['Per-row processing with error handling.',
            r`DELIMITER //
CREATE PROCEDURE apply_bonus()
BEGIN
  DECLARE v_id INT; DECLARE done INT DEFAULT 0; DECLARE cnt INT DEFAULT 0;
  DECLARE c CURSOR FOR SELECT id FROM emp WHERE salary < 50000;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  OPEN c;
  lp: LOOP
    FETCH c INTO v_id;
    IF done THEN LEAVE lp; END IF;
    UPDATE emp SET salary = salary + 2000 WHERE id = v_id;
    SET cnt = cnt + 1;
  END LOOP;
  CLOSE c;
  SELECT cnt AS updated;
END //
DELIMITER ;
CALL apply_bonus();

-- OUTPUT:
-- updated
-- 1`],
            ['Equivalent set-based statement.',
                r`UPDATE emp SET salary = salary + 2000 WHERE salary < 50000;

-- OUTPUT:
-- Query OK, 1 row affected`]],
        [['Restartable chunk processing.',
            r`UPDATE jobs_progress SET last_id = 5000 WHERE job = 'bonus';
SELECT last_id FROM jobs_progress WHERE job = 'bonus';

-- OUTPUT:
-- last_id
-- 5000`],
            ['Commit every 1000 rows (concept).',
                r`-- inside the loop: SET cnt = cnt + 1; IF cnt MOD 1000 = 0 THEN COMMIT; END IF;

-- OUTPUT:
-- (transaction size bounded to 1000 rows)`]]
    ),

    'Cursors vs Set-Based SQL': x(
        ['Set-based SQL works on all rows at once; cursors process one row at a time.',
            'Set-based statements are usually much faster and simpler.',
            'Rule: think in sets first; use a cursor only when you must.'],
        ['The optimizer can parallelize, use indexes and batch I/O for set operations; cursors defeat this.',
            'Window functions, joins, CASE and recursive CTEs replace most cursor logic.',
            'A row loop of 1M iterations means 1M statement executions.'],
        ['Cursor-style logic belongs in application code with batching if row logic is complex, with chunked transactions.',
            'If you must loop, process in chunks and avoid per-row network round trips.',
            'Benchmark both approaches on realistic volumes; the gap is often 10-1000x.'],
        [['F', 'Why is set-based SQL preferred?', 'It is faster and clearer because the engine processes whole sets efficiently.'],
            ['F', 'When use a cursor?', 'When row-by-row logic cannot be expressed in a set-based statement.'],
            ['M', 'Which features replace many cursors?', 'Joins, CASE, window functions and recursive CTEs.'],
            ['M', 'Why are cursors slow?', 'Per-row execution overhead and no set optimizations.'],
            ['S', 'How do you convert a running-total cursor?', 'Use <code>SUM(x) OVER (ORDER BY ...)</code>.'],
            ['S', 'How do you batch a necessary loop?', 'Chunk by primary key ranges, commit per chunk and track progress.']],
        [['Running total: cursor vs window.',
            r`SELECT id, amount, SUM(amount) OVER (ORDER BY id) AS running FROM payments;

-- OUTPUT:
-- id | amount | running
--  1 |    100 |     100
--  2 |     50 |     150
--  3 |     25 |     175`],
            ['Conditional update without a loop.',
                r`UPDATE emp SET salary = CASE WHEN salary < 50000 THEN salary * 1.10 WHEN salary < 70000 THEN salary * 1.05 ELSE salary END;

-- OUTPUT:
-- Query OK, 2 rows affected`]],
        [['Chunked update by ranges.',
            r`UPDATE big_table SET flag = 1 WHERE id BETWEEN 1 AND 10000 AND flag = 0;
UPDATE big_table SET flag = 1 WHERE id BETWEEN 10001 AND 20000 AND flag = 0;

-- OUTPUT:
-- Query OK, 10000 rows affected`],
            ['Compare timings (conceptual).',
                r`-- cursor over 1,000,000 rows: ~ 240 s
-- single UPDATE ... JOIN: ~ 2.5 s

-- OUTPUT:
-- 96x faster with set-based SQL`]]
    )
};
