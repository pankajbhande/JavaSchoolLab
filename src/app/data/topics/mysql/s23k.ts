// Module 23 (Stored Procedures), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s23k: Record<string, DeepDive> = {
    'CREATE PROCEDURE & CALL': dd(
        [`A <b>stored procedure</b> is a named block of SQL kept inside the server. You create it once with <code>CREATE PROCEDURE</code> and run it with <code>CALL</code>. Because the body contains semicolons, client tools need <code>DELIMITER</code> to change the statement terminator while defining it.`,
            r`DELIMITER //
CREATE PROCEDURE hello()
BEGIN
  SELECT 'Hello from MySQL' AS msg;      -- body can hold many statements
END //
DELIMITER ;

CALL hello();

-- OUTPUT:
-- +------------------+
-- | msg              |
-- +------------------+
-- | Hello from MySQL |
-- +------------------+`],
        [`Without procedures every client re-sends the same multi-statement logic over the network and each application re-implements it. A procedure centralises the logic, saves round trips and lets you grant <code>EXECUTE</code> without table access.`,
            r`CREATE TABLE acct (id INT PRIMARY KEY, bal INT);
INSERT INTO acct VALUES (1,100),(2,50);

DELIMITER //
CREATE PROCEDURE transfer_1_to_2()
BEGIN
  START TRANSACTION;
  UPDATE acct SET bal = bal - 10 WHERE id = 1;
  UPDATE acct SET bal = bal + 10 WHERE id = 2;
  COMMIT;
END //
DELIMITER ;

CALL transfer_1_to_2();
SELECT * FROM acct;

-- OUTPUT:
-- +----+-----+
-- | id | bal |
-- +----+-----+
-- |  1 |  90 |
-- |  2 |  60 |
-- +----+-----+`],
        [`Used for month-end closing, batch cleanup, audit-logged operations and as a stable API for legacy apps. Manage them with <code>SHOW CREATE PROCEDURE</code>, <code>information_schema.routines</code>, <code>ALTER</code> (characteristics only) and <code>DROP PROCEDURE</code>.`,
            r`SELECT routine_name, routine_type, security_type
FROM information_schema.routines WHERE routine_schema = DATABASE();

DROP PROCEDURE IF EXISTS hello;
-- To change the body: DROP and CREATE again (ALTER cannot edit the body).

-- OUTPUT:
-- +-------------------+--------------+---------------+
-- | ROUTINE_NAME      | ROUTINE_TYPE | SECURITY_TYPE |
-- +-------------------+--------------+---------------+
-- | hello             | PROCEDURE    | DEFINER       |
-- | transfer_1_to_2   | PROCEDURE    | DEFINER       |
-- +-------------------+--------------+---------------+`],
        [`<b>Advantages:</b> fewer round trips, reuse across applications, one place for rules, precompiled per session, and fine-grained <code>GRANT EXECUTE</code> with <code>SQL SECURITY DEFINER</code>.`,
            r`-- Give an app user the right to run only this procedure.
CREATE USER 'app'@'%' IDENTIFIED BY 'S3cret!pass';
GRANT EXECUTE ON PROCEDURE mydb.transfer_1_to_2 TO 'app'@'%';

-- as app: CALL mydb.transfer_1_to_2();   works
-- as app: SELECT * FROM mydb.acct;       denied

-- OUTPUT (second statement):
-- ERROR 1142 (42000): SELECT command denied to user 'app'@'localhost' for table 'acct'`],
        [`<b>Disadvantages:</b> logic lives outside normal source control and CI; debugging is primitive (no breakpoints); business logic on the DB server consumes scarce DB CPU; hard to unit-test.`,
            r`-- No built-in debugger: you debug with SELECT statements and a log table.
CREATE TABLE dbg (ts DATETIME DEFAULT NOW(), msg VARCHAR(100));
DELIMITER //
CREATE PROCEDURE traced()
BEGIN
  INSERT INTO dbg(msg) VALUES ('start');
  INSERT INTO dbg(msg) VALUES ('end');
END //
DELIMITER ;
CALL traced();  SELECT msg FROM dbg;

-- OUTPUT:
-- +-------+
-- | msg   |
-- +-------+
-- | start |
-- | end   |
-- +-------+`],
        [`<b>Limitations:</b> a procedure cannot be used in a SELECT; it cannot return a value (use OUT parameters or result sets); recursion is disabled by default (<code>max_sp_recursion_depth = 0</code>); no COMMIT-free DDL inside some contexts; no stored procedure overloading by parameters.`,
            r`SHOW VARIABLES LIKE 'max_sp_recursion_depth';
SELECT hello() ;          -- procedure used like a function

-- OUTPUT:
-- +------------------------+-------+
-- | Variable_name          | Value |
-- +------------------------+-------+
-- | max_sp_recursion_depth | 0     |
-- +------------------------+-------+
-- ERROR 1305 (42000): FUNCTION mydb.hello does not exist`],
        r`  client                                MySQL server
  CALL transfer_1_to_2();  --------->   +-----------------------------+
        (one round trip)                | procedure body (stored)     |
                                        |  START TRANSACTION          |
                                        |  UPDATE acct ...            |
                                        |  UPDATE acct ...            |
                                        |  COMMIT                     |
  <---------- OK / result sets -------  +-----------------------------+

  vs. app sending 4 statements = 4 round trips`,
        `Use procedures for a small number of atomic, chatty or privileged operations. Keep them thin, version them as migration scripts, and cover them with integration tests; large business logic is usually cheaper to scale in the application tier.`
    ),

    'IN, OUT & INOUT Parameters': dd(
        [`Procedure parameters have a direction. <b>IN</b> (default) passes a value in. <b>OUT</b> sends a value back; its starting value inside is NULL. <b>INOUT</b> goes in, can be changed, and comes back. Callers receive OUT and INOUT values through user variables such as <code>@total</code>.`,
            r`DELIMITER //
CREATE PROCEDURE emp_count(IN dept_name VARCHAR(20), OUT n INT)
BEGIN
  SELECT COUNT(*) INTO n FROM emp WHERE dept = dept_name;    -- fill the OUT parameter
END //
DELIMITER ;

CALL emp_count('IT', @n);
SELECT @n AS it_staff;

-- OUTPUT:
-- +----------+
-- | it_staff |
-- +----------+
-- |        2 |
-- +----------+`],
        [`Procedures cannot return values like functions. OUT and INOUT parameters are how a procedure hands scalar results, status codes or running totals back without a result set.`,
            r`DELIMITER //
CREATE PROCEDURE add_tax(INOUT price DECIMAL(10,2), IN rate DECIMAL(4,2))
BEGIN
  SET price = price * (1 + rate);            -- modify the caller's variable
END //
DELIMITER ;

SET @p = 200.00;
CALL add_tax(@p, 0.18);
SELECT @p AS with_tax;

-- OUTPUT:
-- +----------+
-- | with_tax |
-- +----------+
-- |   236.00 |
-- +----------+`],
        [`Real use: return a generated order id, a success flag, or a message together with a result set. Application drivers register OUT parameters (JDBC <code>CallableStatement.registerOutParameter</code>).`,
            r`DELIMITER //
CREATE PROCEDURE new_order(IN c INT, OUT order_id BIGINT, OUT ok TINYINT)
BEGIN
  INSERT INTO orders(cust) VALUES (c);
  SET order_id = LAST_INSERT_ID();           -- id generated by the insert
  SET ok = 1;
END //
DELIMITER ;

CALL new_order(7, @oid, @ok);
SELECT @oid AS order_id, @ok AS ok;

-- OUTPUT (example):
-- +----------+----+
-- | order_id | ok |
-- +----------+----+
-- |       42 |  1 |
-- +----------+----+`],
        [`<b>Advantages:</b> typed, self-documenting interface; several return values at once; INOUT supports accumulators.`,
            r`DELIMITER //
CREATE PROCEDURE min_max(IN dept_name VARCHAR(20), OUT lo INT, OUT hi INT)
BEGIN
  SELECT MIN(salary), MAX(salary) INTO lo, hi FROM emp WHERE dept = dept_name;
END //
DELIMITER ;
CALL min_max('IT', @lo, @hi);
SELECT @lo AS lo, @hi AS hi;

-- OUTPUT:
-- +------+------+
-- | lo   | hi   |
-- +------+------+
-- |  800 |  900 |
-- +------+------+`],
        [`<b>Disadvantages:</b> OUT values are carried in session variables, which are easy to forget or clash; an OUT parameter is NULL on entry, a common source of bugs; no default values for parameters.`,
            r`DELIMITER //
CREATE PROCEDURE bad_out(OUT n INT)
BEGIN
  SET n = n + 1;                 -- n is NULL on entry, so result stays NULL
END //
DELIMITER ;
SET @x = 5;
CALL bad_out(@x);
SELECT @x AS x;

-- OUTPUT:
-- +------+
-- | x    |
-- +------+
-- | NULL |
-- +------+`],
        [`<b>Limitations:</b> parameters cannot have defaults or be optional; you cannot pass a literal or an expression for OUT or INOUT (must be a variable); no array or table parameters (use a temporary table or JSON); the call must supply exactly the declared number of arguments.`,
            r`CALL emp_count('IT');           -- missing argument
CALL emp_count('IT', 5);         -- literal for an OUT parameter

-- OUTPUT:
-- ERROR 1318 (42000): Incorrect number of arguments for PROCEDURE mydb.emp_count; expected 2, got 1
-- ERROR 1414 (42000): OUT or INOUT argument 2 for routine mydb.emp_count is not a variable or NEW pseudo-variable in BEFORE trigger`],
        r`   caller                         procedure emp_count(IN dept, OUT n)
  'IT'  ---- IN  --------------->  dept_name = 'IT'
  @n    <--- OUT ----------------  n = COUNT(*)   (n starts as NULL)
  @p    <--> INOUT --------------  price   (read, change, return)

  IN    value copied in
  OUT   value copied out at the end of the call
  INOUT both`,
        `Prefer a result set for tabular output and OUT parameters for small status values. Never rely on session variables across pooled connections without resetting them, and keep parameter lists short and stable because they form the procedure's public contract.`
    ),

    'Variables, IF & CASE in Procedures': dd(
        [`Inside a procedure you declare <b>local variables</b> with <code>DECLARE name TYPE [DEFAULT v]</code> (at the start of a BEGIN block), assign with <code>SET</code> or <code>SELECT ... INTO</code>, and branch with <code>IF ... ELSEIF ... ELSE ... END IF</code> and <code>CASE ... END CASE</code>.`,
            r`DELIMITER //
CREATE PROCEDURE grade(IN score INT)
BEGIN
  DECLARE g CHAR(1) DEFAULT 'F';           -- local variable
  IF score >= 90 THEN SET g = 'A';
  ELSEIF score >= 75 THEN SET g = 'B';
  ELSEIF score >= 50 THEN SET g = 'C';
  END IF;
  SELECT score, g AS grade;
END //
DELIMITER ;
CALL grade(80);

-- OUTPUT:
-- +-------+-------+
-- | score | grade |
-- +-------+-------+
-- |    80 | B     |
-- +-------+-------+`],
        [`Real logic needs state and decisions: compute a discount, validate input, pick a path. Plain SQL has CASE expressions, but only procedures can run different statements depending on a condition.`,
            r`DELIMITER //
CREATE PROCEDURE day_type(IN d INT)         -- 1=Mon ... 7=Sun
BEGIN
  CASE
    WHEN d IN (6,7) THEN SELECT 'Weekend' AS kind;
    WHEN d BETWEEN 1 AND 5 THEN SELECT 'Weekday' AS kind;
    ELSE SELECT 'Invalid' AS kind;
  END CASE;                                  -- no match and no ELSE -> error 1339
END //
DELIMITER ;
CALL day_type(7);

-- OUTPUT:
-- +---------+
-- | kind    |
-- +---------+
-- | Weekend |
-- +---------+`],
        [`Real use: tiered pricing, status transitions (only PAID orders can ship), and defensive input checks that <code>SIGNAL</code> a clear error. Simple CASE compares one expression to values; searched CASE evaluates conditions.`,
            r`DELIMITER //
CREATE PROCEDURE ship_order(IN oid INT)
BEGIN
  DECLARE st VARCHAR(10);
  SELECT status INTO st FROM orders WHERE id = oid;      -- SELECT ... INTO a variable
  CASE st
    WHEN 'PAID' THEN UPDATE orders SET status = 'SHIPPED' WHERE id = oid;
    WHEN 'NEW'  THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not paid';
    ELSE SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot ship';
  END CASE;
END //
DELIMITER ;

-- OUTPUT (order 5 has status NEW):
-- CALL ship_order(5);
-- ERROR 1644 (45000): Order not paid`],
        [`<b>Advantages:</b> real procedural control next to the data; typed locals; <code>SELECT ... INTO</code> loads values; SIGNAL gives meaningful errors.`,
            r`DELIMITER //
CREATE PROCEDURE swap_demo()
BEGIN
  DECLARE a INT DEFAULT 1;
  DECLARE b INT DEFAULT 2;
  DECLARE t INT;
  SET t = a;  SET a = b;  SET b = t;
  SELECT a, b;
END //
DELIMITER ;
CALL swap_demo();

-- OUTPUT:
-- +------+------+
-- | a    | b    |
-- +------+------+
-- |    2 |    1 |
-- +------+------+`],
        [`<b>Disadvantages:</b> DECLARE order rules are strict (variables, then conditions, cursors, handlers); a variable named like a column silently wins over the column, a notorious bug; no block-scoped variables other than nested BEGIN blocks.`,
            r`DELIMITER //
CREATE PROCEDURE shadow(IN name VARCHAR(20))     -- parameter named like column emp.name
BEGIN
  SELECT COUNT(*) AS n FROM emp WHERE name = name;   -- compares the parameter to itself!
END //
DELIMITER ;
CALL shadow('Asha');

-- OUTPUT:
-- +---+
-- | n |
-- +---+
-- | 3 |      <- counts every row, expected 1. Rename the parameter: p_name.
-- +---+`],
        [`<b>Limitations:</b> locals exist only during the call (use @user variables for session state); DECLARE must be first in its block; CASE without a matching WHEN and no ELSE raises error 1339 (Case not found); no GOTO-free structured exceptions beyond handlers.`,
            r`DELIMITER //
CREATE PROCEDURE nocase(IN x INT)
BEGIN
  CASE x WHEN 1 THEN SELECT 'one'; END CASE;
END //
DELIMITER ;
CALL nocase(2);

-- OUTPUT:
-- ERROR 1339 (20000): Case not found for CASE statement`],
        r`  BEGIN
    DECLARE g CHAR(1) DEFAULT 'F';        variables first
    IF score >= 90   -----> SET g='A'
    ELSEIF score >= 75 ---> SET g='B'
    ELSE             -----> keep default
    END IF;
    CASE x WHEN 1 THEN .. WHEN 2 THEN .. ELSE .. END CASE;
  END

  condition --> true branch only runs; others skipped`,
        `Name parameters and variables with a prefix (p_, v_) to avoid column shadowing. Keep branching logic shallow; if a procedure becomes a decision tree, move rules into a table or into application code where they can be tested.`
    ),

    'Loops in Procedures': dd(
        [`MySQL has three loop forms. <code>WHILE cond DO ... END WHILE</code> tests before each pass. <code>REPEAT ... UNTIL cond END REPEAT</code> tests after (runs at least once). <code>LOOP ... END LOOP</code> runs forever until you <code>LEAVE</code> its label; <code>ITERATE</code> skips to the next pass.`,
            r`DELIMITER //
CREATE PROCEDURE sum_to(IN n INT)
BEGIN
  DECLARE i INT DEFAULT 1;
  DECLARE s INT DEFAULT 0;
  WHILE i <= n DO
    SET s = s + i;
    SET i = i + 1;
  END WHILE;
  SELECT s AS total;
END //
DELIMITER ;
CALL sum_to(5);

-- OUTPUT:
-- +-------+
-- | total |
-- +-------+
-- |    15 |
-- +-------+`],
        [`SQL is set-based, but sometimes you must repeat work: seed test data, process a queue in batches, walk a hierarchy, or run an operation on a list. Loops make that possible inside the server.`,
            r`CREATE TABLE seq (n INT);
DELIMITER //
CREATE PROCEDURE fill_seq(IN k INT)
BEGIN
  DECLARE i INT DEFAULT 0;
  lp: LOOP
    SET i = i + 1;
    IF i > k THEN LEAVE lp; END IF;       -- exit
    IF i = 2 THEN ITERATE lp; END IF;      -- skip 2
    INSERT INTO seq VALUES (i);
  END LOOP lp;
END //
DELIMITER ;
CALL fill_seq(4);  SELECT * FROM seq;

-- OUTPUT:
-- +------+
-- | n    |
-- +------+
-- |    1 |
-- |    3 |
-- |    4 |
-- +------+`],
        [`Real use: delete old rows in small batches so locks and undo stay small (a very common production pattern).`,
            r`DELIMITER //
CREATE PROCEDURE purge_old()
BEGIN
  DECLARE n INT DEFAULT 1;
  REPEAT
    DELETE FROM logs WHERE created < NOW() - INTERVAL 90 DAY LIMIT 1000;   -- small batch
    SET n = ROW_COUNT();                                                  -- rows deleted
    DO SLEEP(0.1);                                                       -- let replicas catch up
  UNTIL n = 0 END REPEAT;
END //
DELIMITER ;

-- OUTPUT (CALL purge_old()):
-- Query OK, 0 rows affected`],
        [`<b>Advantages:</b> procedural iteration at the data; labelled LEAVE and ITERATE give precise control; batching reduces lock time.`,
            r`DELIMITER //
CREATE PROCEDURE factorial(IN n INT, OUT f BIGINT)
BEGIN
  SET f = 1;
  WHILE n > 1 DO SET f = f * n; SET n = n - 1; END WHILE;
END //
DELIMITER ;
CALL factorial(5, @f);  SELECT @f AS result;

-- OUTPUT:
-- +--------+
-- | result |
-- +--------+
-- |    120 |
-- +--------+`],
        [`<b>Disadvantages:</b> row-by-row loops are far slower than one set-based statement; easy to write an infinite loop that hogs a connection; long loops inside one transaction hold locks.`,
            r`-- Slow way: loop with 100000 single-row inserts.
-- Fast way: one set-based statement (MySQL 8 recursive CTE).
SET SESSION cte_max_recursion_depth = 100000;
INSERT INTO seq
WITH RECURSIVE g(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM g WHERE n < 100000)
SELECT n FROM g;

-- OUTPUT:
-- Query OK, 100000 rows affected   (about 20x faster than the loop, example)`],
        [`<b>Limitations:</b> no FOR loop and no foreach over a result set (use a cursor); LEAVE and ITERATE work only on labelled blocks or loops; no BREAK or CONTINUE keywords; no timeout other than <code>max_execution_time</code> for SELECT or killing the connection.`,
            r`DELIMITER //
CREATE PROCEDURE bad_leave()
BEGIN
  WHILE 1 = 1 DO
    LEAVE nolabel;            -- label does not exist
  END WHILE;
END //
DELIMITER ;

-- OUTPUT:
-- ERROR 1308 (42000): LEAVE with no matching label: nolabel`],
        r`  WHILE i<=n DO        test  -->  body  -->  test  -->  ...        (0..n times)
  REPEAT .. UNTIL c    body  -->  test  -->  body  -->  ...        (1..n times)
  lp: LOOP             body  -->  IF .. LEAVE lp  --> body ...
                                  |        |
                              ITERATE lp   exit
  One set-based statement  >>>  loop doing one row per pass`,
        `Reach for a loop only when set-based SQL, window functions or recursive CTEs cannot express the job. Batch loops with LIMIT, commit between batches, add a sleep for replication lag, and always include a guaranteed exit condition.`
    ),

    'Error Handling in Procedures': dd(
        [`Errors are handled with <b>handlers</b>: <code>DECLARE CONTINUE|EXIT HANDLER FOR condition statement</code>. A condition can be an SQLSTATE, a MySQL error number, <code>SQLEXCEPTION</code>, <code>SQLWARNING</code> or <code>NOT FOUND</code>. <code>SIGNAL</code> raises your own error and <code>RESIGNAL</code> rethrows.`,
            r`DELIMITER //
CREATE PROCEDURE safe_insert(IN i INT)
BEGIN
  DECLARE EXIT HANDLER FOR 1062               -- duplicate key
    SELECT 'Duplicate id, skipped' AS msg;
  INSERT INTO acct(id, bal) VALUES (i, 0);
  SELECT 'Inserted' AS msg;
END //
DELIMITER ;
CALL safe_insert(1);       -- id 1 already exists

-- OUTPUT:
-- +-----------------------+
-- | msg                   |
-- +-----------------------+
-- | Duplicate id, skipped |
-- +-----------------------+`],
        [`Without handlers an error aborts the call with a raw message and may leave a half-done transaction. Handlers let you roll back cleanly, log, return a friendly status, and continue after expected conditions such as end of cursor.`,
            r`DELIMITER //
CREATE PROCEDURE transfer(IN src INT, IN dst INT, IN amt INT)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;                                  -- undo the partial work
    RESIGNAL;                                  -- tell the caller it failed
  END;
  START TRANSACTION;
  UPDATE acct SET bal = bal - amt WHERE id = src;
  UPDATE acct SET bal = bal + amt WHERE id = dst;
  COMMIT;
END //
DELIMITER ;

-- OUTPUT (CALL transfer(1,2,10)):
-- Query OK, 0 rows affected`],
        [`Real use: transactional procedures with ROLLBACK on failure, validation using SIGNAL with a custom SQLSTATE 45000, and cursor loops that exit on <code>NOT FOUND</code>. Use <code>GET DIAGNOSTICS</code> to read the error number and text.`,
            r`DELIMITER //
CREATE PROCEDURE with_diag()
BEGIN
  DECLARE code INT; DECLARE txt VARCHAR(200);
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1 code = MYSQL_ERRNO, txt = MESSAGE_TEXT;
    SELECT code, txt;
  END;
  INSERT INTO nosuchtable VALUES (1);
END //
DELIMITER ;
CALL with_diag();

-- OUTPUT:
-- +------+----------------------------------+
-- | code | txt                              |
-- +------+----------------------------------+
-- | 1146 | Table 'mydb.nosuchtable' doesn't exist |
-- +------+----------------------------------+`],
        [`<b>Advantages:</b> atomic units of work, clear custom errors via SIGNAL, structured diagnostics, and clean cursor termination.`,
            r`DELIMITER //
CREATE PROCEDURE withdraw(IN id_ INT, IN amt INT)
BEGIN
  DECLARE cur INT;
  SELECT bal INTO cur FROM acct WHERE id = id_ FOR UPDATE;
  IF cur < amt THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient funds', MYSQL_ERRNO = 5001;
  END IF;
  UPDATE acct SET bal = bal - amt WHERE id = id_;
END //
DELIMITER ;
CALL withdraw(2, 9999);

-- OUTPUT:
-- ERROR 5001 (45000): Insufficient funds`],
        [`<b>Disadvantages:</b> handler scope and DECLARE ordering are tricky; a CONTINUE handler can hide a real failure; swallowing errors makes bugs invisible; no TRY and CATCH nesting like other languages.`,
            r`DELIMITER //
CREATE PROCEDURE swallow()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;   -- silently ignores EVERYTHING
  INSERT INTO acct(id, bal) VALUES (1, 0);                -- duplicate, ignored
  SELECT 'done, but nothing was inserted' AS msg;
END //
DELIMITER ;
CALL swallow();

-- OUTPUT:
-- +--------------------------------+
-- | msg                            |
-- +--------------------------------+
-- | done, but nothing was inserted |
-- +--------------------------------+`],
        [`<b>Limitations:</b> handlers cannot catch errors raised in their own body for the same condition; RESIGNAL and GET DIAGNOSTICS only work inside a handler; the diagnostics area is limited; DDL implicitly commits and cannot be rolled back; a handler for a duplicate (1062) must be declared after variables and cursors.`,
            r`DELIMITER //
CREATE PROCEDURE ddl_demo()
BEGIN
  START TRANSACTION;
  INSERT INTO acct VALUES (9, 0);
  CREATE TABLE tmp_audit (x INT);     -- implicit COMMIT happens here
  ROLLBACK;                           -- too late, the insert is already committed
END //
DELIMITER ;
CALL ddl_demo();  SELECT COUNT(*) AS n FROM acct WHERE id = 9;

-- OUTPUT:
-- +---+
-- | n |
-- +---+
-- | 1 |
-- +---+`],
        r`  BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION  ----+
    START TRANSACTION;                          |
    stmt 1                                      |
    stmt 2  --- error 1062/1213/... ------------+--> handler body
    COMMIT;                                          ROLLBACK; RESIGNAL;
  END                                                  |
                                                       v
                                         caller receives the original error

  CONTINUE handler : resume after the failing statement
  EXIT handler     : leave the enclosing BEGIN..END`,
        `Standardise one error contract: EXIT HANDLER FOR SQLEXCEPTION with ROLLBACK then RESIGNAL, and SIGNAL SQLSTATE 45000 with distinct MYSQL_ERRNO values for business errors. Make the application retry only on deadlock (1213) and lock wait (1205) errors.`
    ),
};
