// Module 26 (Cursors): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s26a: Record<string, DeepDive> = {
    'Declaring, Opening & Fetching Cursors': dd(
        [`A <b>cursor</b> lets a stored program walk through a query result <i>one row at a time</i>. The life cycle is fixed: <code>DECLARE</code> (with the SELECT) - <code>OPEN</code> (runs the query) - <code>FETCH ... INTO</code> variables (repeat) - <code>CLOSE</code>. Cursors exist only inside stored procedures, functions and triggers.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT);
INSERT INTO emp VALUES (1,'Abaji',50000),(2,'Raoji',60000),(3,'Moropant',70000);

DELIMITER $$
CREATE PROCEDURE first_two()
BEGIN
  DECLARE v_id INT;                       -- 1. variables first (order matters:
  DECLARE v_name VARCHAR(20);             --    variables, cursors, then handlers)
  DECLARE cur CURSOR FOR                  -- 2. declare the cursor with its SELECT
    SELECT id, name FROM emp ORDER BY id;

  OPEN cur;                               -- 3. executes the query
  FETCH cur INTO v_id, v_name;            -- 4. read row 1 into the variables
  SELECT v_id AS id, v_name AS name;
  FETCH cur INTO v_id, v_name;            --    read row 2
  SELECT v_id AS id, v_name AS name;
  CLOSE cur;                              -- 5. release the result set
END$$
DELIMITER ;
CALL first_two();

-- OUTPUT:
-- +----+-------+
-- | id | name  |
-- +----+-------+
-- |  1 | Abaji |
-- +----+-------+
-- +----+-------+
-- | id | name  |
-- +----+-------+
-- |  2 | Raoji |
-- +------+------+`],
        [`Plain SQL is set-based and cannot say "for each row, run these several statements with branching". A cursor gives a procedural loop when each row needs custom logic, such as calling another procedure per row.`,
            r`-- Per-row logic with branching: label each employee by salary band
DELIMITER $$
CREATE PROCEDURE band_one()
BEGIN
  DECLARE v_name VARCHAR(20);
  DECLARE v_sal  INT;
  DECLARE cur CURSOR FOR SELECT name, salary FROM emp WHERE id = 3;
  OPEN cur;
  FETCH cur INTO v_name, v_sal;                    -- one row is enough for the demo
  SELECT v_name AS name,
         IF(v_sal >= 65000, 'HIGH', 'MID') AS band; -- branch per fetched row
  CLOSE cur;
END$$
DELIMITER ;
CALL band_one();

-- OUTPUT:
-- +----------+------+
-- | name     | band |
-- +----------+------+
-- | Moropant | HIGH |
-- +-------+------+`],
        [`Real uses: legacy data migrations that must call a routine per row, sending each pending job row to a queue table, generating dynamic SQL per table name from <code>information_schema</code>, and row-by-row reconciliation.`,
            r`-- Generate one statement per table - a classic admin cursor use
DELIMITER $$
CREATE PROCEDURE list_tables()
BEGIN
  DECLARE v_t VARCHAR(64);
  DECLARE done INT DEFAULT 0;
  DECLARE cur CURSOR FOR
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE' ORDER BY 1;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;  -- fires after last row
  OPEN cur;
  lp: LOOP
    FETCH cur INTO v_t;
    IF done THEN LEAVE lp; END IF;
    SELECT CONCAT('ANALYZE TABLE ', v_t, ';') AS stmt;  -- build the command text
  END LOOP;
  CLOSE cur;
END$$
DELIMITER ;
CALL list_tables();

-- OUTPUT (example):
-- +-----------------------+
-- | stmt                  |
-- +-----------------------+
-- | ANALYZE TABLE emp;    |
-- +-----------------------+`],
        [`<b>Advantages:</b> full procedural control per row; can read from any SELECT (joins, ordering); the result can be consumed while keeping other state in variables; and it is read-only and asensitive so it is simple to reason about.`,
            r`-- Advantage: accumulate state across rows in variables
DELIMITER $$
CREATE PROCEDURE sum_salary()
BEGIN
  DECLARE v_sal INT; DECLARE total INT DEFAULT 0; DECLARE done INT DEFAULT 0;
  DECLARE cur CURSOR FOR SELECT salary FROM emp;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  OPEN cur;
  rd: LOOP
    FETCH cur INTO v_sal;
    IF done THEN LEAVE rd; END IF;
    SET total = total + v_sal;               -- running state in a variable
  END LOOP;
  CLOSE cur;
  SELECT total;
END$$
DELIMITER ;
CALL sum_salary();

-- OUTPUT:
-- +--------+
-- | total  |
-- +--------+
-- | 180000 |
-- +--------+`],
        [`<b>Disadvantages:</b> row-by-row is slow (one fetch round of interpreter work per row), consumes server memory for the result set (often a temporary table), and the code is longer than the equivalent SELECT.`,
            r`-- The cursor above does what one statement does:
SELECT SUM(salary) AS total FROM emp;       -- set-based, optimised, one line

-- OUTPUT:
-- +--------+
-- | total  |
-- +--------+
-- | 180000 |
-- +--------+`],
        [`<b>Limitations:</b> read-only (no UPDATE ... WHERE CURRENT OF), non-scrollable (forward only, no FETCH PRIOR), asensitive (do not rely on seeing changes made after OPEN), and declaration order is enforced - declaring a cursor before a variable is a syntax error.`,
            r`-- Limitation: the declaration order is enforced
DELIMITER $$
CREATE PROCEDURE bad_order()
BEGIN
  DECLARE cur CURSOR FOR SELECT id FROM emp;
  DECLARE v INT;                           -- variable AFTER cursor: not allowed
  OPEN cur; CLOSE cur;
END$$
DELIMITER ;

-- OUTPUT:
-- ERROR 1337 (42000): Variable or condition declaration after cursor or handler declaration`],
        `
   DECLARE v_id, v_name ...
   DECLARE cur CURSOR FOR SELECT ...
   DECLARE ... HANDLER FOR NOT FOUND ...
          |
          v
      OPEN cur        run SELECT, materialise result
          |
          v
   +--> FETCH cur INTO v_id, v_name   -- next row, forward only
   |      |  row found ----------------+
   |      |                            |
   +------+ process row                |
          | no more rows -> NOT FOUND handler fires
          v
      CLOSE cur
`,
        `Treat a cursor as a last resort for work that truly needs per-row procedural logic. Remember it materialises the result, so on large tables it costs memory and tmp-disk; limit the SELECT with WHERE and a sensible ORDER, and process in batches (keyset pagination) if you must loop over millions of rows. Keep cursors inside short transactions to avoid long undo history.`
    ),

    'Cursor Loops & Handlers': dd(
        [`MySQL has no "has next" test. When FETCH runs past the last row it raises <b>SQLSTATE 02000 (NOT FOUND)</b>. You catch that with a <code>DECLARE ... HANDLER FOR NOT FOUND</code> that sets a flag, and the loop tests the flag right after the FETCH.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT);
INSERT INTO emp VALUES (1,'Abaji',50000),(2,'Raoji',60000),(3,'Moropant',70000);

DELIMITER $$
CREATE PROCEDURE names_csv()
BEGIN
  DECLARE done INT DEFAULT 0;                        -- loop flag
  DECLARE v_name VARCHAR(20);
  DECLARE acc VARCHAR(200) DEFAULT '';               -- accumulator
  DECLARE cur CURSOR FOR SELECT name FROM emp ORDER BY id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;  -- end-of-data signal

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_name;
    IF done = 1 THEN LEAVE read_loop; END IF;        -- test BEFORE using v_name
    SET acc = CONCAT(acc, IF(acc = '', '', ','), v_name);
  END LOOP;
  CLOSE cur;
  SELECT acc AS names;
END$$
DELIMITER ;
CALL names_csv();

-- OUTPUT:
-- +----------------------+
-- | names                |
-- +----------------------+
-- | Abaji,Raoji,Moropant |
-- +------------------+`],
        [`Without the handler the last FETCH aborts the procedure with error 1329 "No data - zero rows fetched". Handlers are also how you turn errors (duplicate key, deadlock) into controlled flow instead of a crash.`,
            r`-- What happens WITHOUT a NOT FOUND handler
DELIMITER $$
CREATE PROCEDURE no_handler()
BEGIN
  DECLARE v INT;
  DECLARE cur CURSOR FOR SELECT id FROM emp WHERE id > 99;   -- empty result
  OPEN cur;
  FETCH cur INTO v;               -- nothing to fetch
  CLOSE cur;
END$$
DELIMITER ;
CALL no_handler();

-- OUTPUT:
-- ERROR 1329 (02000): No data - zero rows fetched, selected, or processed`],
        [`Real pattern: loop over pending rows, call a procedure for each, and swallow per-row errors while counting failures so one bad row does not abort the batch.`,
            r`CREATE TABLE jobs (id INT PRIMARY KEY, payload VARCHAR(20));
CREATE TABLE done_jobs (id INT PRIMARY KEY);     -- PK makes a duplicate raise an error
INSERT INTO jobs VALUES (1,'a'),(2,'b'),(3,'c');
INSERT INTO done_jobs VALUES (2);                -- job 2 was already processed

DELIMITER $$
CREATE PROCEDURE run_jobs()
BEGIN
  DECLARE done INT DEFAULT 0; DECLARE failed INT DEFAULT 0; DECLARE ok INT DEFAULT 0;
  DECLARE v_id INT;
  DECLARE cur CURSOR FOR SELECT id FROM jobs ORDER BY id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  DECLARE CONTINUE HANDLER FOR 1062 SET failed = failed + 1;  -- duplicate key: count, go on
  OPEN cur;
  lp: LOOP
    FETCH cur INTO v_id;
    IF done THEN LEAVE lp; END IF;
    INSERT INTO done_jobs VALUES (v_id);       -- may raise 1062 for id 2
  END LOOP;
  CLOSE cur;
  SELECT failed AS duplicates;
END$$
DELIMITER ;
CALL run_jobs();

-- OUTPUT:
-- +------------+
-- | duplicates |
-- +------------+
-- |          1 |
-- +------------+`],
        [`<b>Advantages:</b> handlers separate flow control from business logic; CONTINUE lets the loop survive errors; EXIT handlers clean up and leave the block; handlers can be scoped to an inner BEGIN...END.`,
            r`-- Scoped handler: only the inner block tolerates the error
DELIMITER $$
CREATE PROCEDURE scoped()
BEGIN
  DECLARE msg VARCHAR(40) DEFAULT 'start';
  BEGIN
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET msg = 'inner error caught';
    INSERT INTO emp VALUES (1,'dup',1);      -- duplicate PK -> SQLEXCEPTION
  END;
  SELECT msg;
END$$
DELIMITER ;
CALL scoped();

-- OUTPUT:
-- +--------------------+
-- | msg                |
-- +--------------------+
-- | inner error caught |
-- +--------------------+`],
        [`<b>Disadvantages:</b> the flag approach is easy to get wrong. If any other statement in the loop also hits NOT FOUND (for example a <code>SELECT ... INTO</code> returning no row), the flag flips and the loop ends early without an error.`,
            r`-- Classic bug: a SELECT INTO that finds nothing also triggers the NOT FOUND handler
DELIMITER $$
CREATE PROCEDURE buggy()
BEGIN
  DECLARE done INT DEFAULT 0; DECLARE v_id INT; DECLARE x INT; DECLARE n INT DEFAULT 0;
  DECLARE cur CURSOR FOR SELECT id FROM emp;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  OPEN cur;
  lp: LOOP
    FETCH cur INTO v_id;
    IF done THEN LEAVE lp; END IF;
    SELECT salary INTO x FROM emp WHERE id = v_id + 100;  -- no such row -> NOT FOUND!
    SET n = n + 1;
  END LOOP;
  CLOSE cur;
  SELECT n AS rows_processed;
END$$
DELIMITER ;
CALL buggy();

-- OUTPUT:
-- +----------------+
-- | rows_processed |
-- +----------------+
-- |              1 |     <- expected 3; loop quit after the first inner SELECT
-- +----------------+`],
        [`<b>Limitations:</b> you cannot FETCH from a closed cursor (error 1326); a cursor cannot be reused without CLOSE then OPEN; handler declarations must come after cursors; a handler cannot see which statement raised the condition (use GET DIAGNOSTICS to read details).`,
            r`-- Use GET DIAGNOSTICS inside a handler to see what actually failed
DELIMITER $$
CREATE PROCEDURE diag()
BEGIN
  DECLARE code INT; DECLARE txt TEXT;
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1 code = MYSQL_ERRNO, txt = MESSAGE_TEXT;
  END;
  INSERT INTO emp VALUES (1,'dup',1);          -- duplicate PRIMARY KEY
  SELECT code, txt;
END$$
DELIMITER ;
CALL diag();

-- OUTPUT:
-- +------+-----------------------------------+
-- | code | txt                               |
-- +------+-----------------------------------+
-- | 1062 | Duplicate entry '1' for key 'emp.PRIMARY' |
-- +------+-----------------------------------+`],
        `
          OPEN cur
             |
        +--> FETCH cur INTO vars -------------------+
        |        |                                  |
        |   row returned                       no row: SQLSTATE 02000
        |        |                                  |
        |   IF done THEN LEAVE?  <---- handler sets done = 1
        |        | no
        |   process row
        +--------+
             CLOSE cur  <----- after loop
`,
        `Put the NOT FOUND flag logic as tightly around the FETCH as possible. If the loop body needs a lookup that may legitimately return nothing, wrap it in its own BEGIN...END block with a local NOT FOUND handler, or use aggregate/EXISTS patterns that always return a row. Count and log failures in CONTINUE handlers so batch jobs stay observable.`
    ),

    'Cursors vs Set-Based SQL': dd(
        [`SQL is a <b>set-based</b> language: you describe the whole result and the optimiser chooses how to compute it with indexes, joins and parallel-friendly storage code. A cursor forces <b>row-by-row</b> ("RBAR") processing in the stored-program interpreter. Whenever one statement can express the work, it should win.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, name VARCHAR(20), salary INT);
INSERT INTO emp VALUES (1,'Abaji',50000),(2,'Raoji',60000),(3,'Moropant',70000);

-- Task: give everyone below 65000 a 10% raise.
-- SET-BASED (one statement, one pass):
UPDATE emp SET salary = salary * 1.10 WHERE salary < 65000;
SELECT id, salary FROM emp ORDER BY id;

-- OUTPUT:
-- +----+--------+
-- | id | salary |
-- +----+--------+
-- |  1 |  55000 |
-- |  2 |  66000 |
-- |  3 |  70000 |
-- +----+--------+`],
        [`Choosing correctly is a performance and maintainability decision: the cursor version of the same raise needs a procedure, a handler, a loop and one UPDATE per row, which multiplies statements and lock round trips.`,
            r`-- The same raise with a cursor (what NOT to do for plain arithmetic)
DELIMITER $$
CREATE PROCEDURE raise_cursor()
BEGIN
  DECLARE done INT DEFAULT 0; DECLARE v_id INT; DECLARE v_sal INT;
  DECLARE cur CURSOR FOR SELECT id, salary FROM emp WHERE salary < 65000;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
  OPEN cur;
  lp: LOOP
    FETCH cur INTO v_id, v_sal;
    IF done THEN LEAVE lp; END IF;
    UPDATE emp SET salary = v_sal * 1.10 WHERE id = v_id;   -- one UPDATE per row
  END LOOP;
  CLOSE cur;
END$$
DELIMITER ;

-- OUTPUT:
-- 1,000,000 rows (example): set-based UPDATE ~ 6 s   |   cursor loop ~ 15 minutes`],
        [`Where a cursor is still justified: calling a stored procedure for each row, dynamic SQL per row (PREPARE per table name), side effects that cannot be a single statement, and tiny result sets where clarity matters more than speed.`,
            r`-- Rewrite common "needs a loop" tasks as set-based SQL
-- 1) running total - window function instead of a cursor accumulator
SELECT id, salary, SUM(salary) OVER (ORDER BY id) AS running
FROM emp;
-- 2) per-group top row - ROW_NUMBER instead of nested loops
-- 3) string aggregation - GROUP_CONCAT instead of a CONCAT loop
SELECT GROUP_CONCAT(name ORDER BY id) AS names FROM emp;

-- OUTPUT:
-- +----+--------+---------+
-- | id | salary | running |
-- +----+--------+---------+
-- |  1 |  55000 |   55000 |
-- |  2 |  66000 |  121000 |
-- |  3 |  70000 |  191000 |
-- +----+--------+---------+
-- +----------------------+
-- | names                |
-- +----------------------+
-- | Abaji,Raoji,Moropant |
-- +-----------------+`],
        [`<b>Advantages of set-based:</b> optimiser-chosen plans, index use, one statement and one lock acquisition pass, easy to read and test, and scales roughly linearly.`,
            r`-- EXPLAIN shows the optimiser's plan for set-based work; a cursor has no such plan per loop
EXPLAIN SELECT id FROM emp WHERE salary < 65000;

-- OUTPUT (example):
-- +----+--------+------+---------------+------+---------+-------------+
-- | id | table  | type | possible_keys | key  | rows    | Extra       |
-- +----+--------+------+---------------+------+---------+-------------+
-- |  1 | emp    | ALL  | NULL          | NULL |       3 | Using where |
-- +----+--------+------+---------------+------+---------+-------------+`],
        [`<b>Disadvantages of cursors:</b> slow, memory heavy, long-held locks (rows read inside a transaction stay locked until commit), and hard to parallelise.`,
            r`-- Row-by-row inside one transaction keeps locks for the whole loop
START TRANSACTION;
CALL raise_cursor();            -- touches rows one at a time, X-locks each, holds all
-- other sessions updating those rows now wait until COMMIT
COMMIT;

-- OUTPUT (example):
-- other session: UPDATE emp SET salary = 1 WHERE id = 2;  -- waits ... until COMMIT`],
        [`<b>Limitations of set-based SQL:</b> some tasks genuinely are sequential - state machines, row-dependent recursion (use a recursive CTE first), or calling external routines. Even then, batch it: process in chunks of a few thousand rows rather than one at a time.`,
            r`-- Chunked set-based loop: a few thousand rows per statement, not one
DELIMITER $$
CREATE PROCEDURE purge_old()
BEGIN
  DECLARE n INT DEFAULT 1;
  WHILE n > 0 DO
    DELETE FROM emp WHERE salary < 0 LIMIT 5000;   -- bounded chunk
    SET n = ROW_COUNT();                           -- rows removed this round
    DO SLEEP(0.05);                                -- be kind to replicas
  END WHILE;
END$$
DELIMITER ;

-- OUTPUT:
-- Procedure created; loop ends when a DELETE removes 0 rows`],
        `
   Set-based                            Cursor (RBAR)
   ---------                            -------------
   UPDATE ... WHERE ...                 OPEN cur
        |                               loop: FETCH -> UPDATE one row
        v                                      FETCH -> UPDATE one row
   optimiser + index                           FETCH -> UPDATE one row ...
        |                               CLOSE cur
        v
   one pass over data                   N statements, N plans, N lock steps
   cost ~ O(n) tight                    cost ~ O(n) heavy constant
`,
        `Default to set-based SQL, window functions and recursive CTEs; use cursors only for per-row side effects and keep them small. When looping is unavoidable do it in the application with chunked, keyset-paginated statements - it is easier to monitor, retry and throttle than a long-running stored procedure that pins a connection and a transaction.`
    ),
};
