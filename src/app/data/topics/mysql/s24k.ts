// Module 24 (Stored Functions), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s24k: Record<string, DeepDive> = {
    'CREATE FUNCTION': dd(
        [`A <b>stored function</b> is a named routine that takes parameters, <code>RETURNS</code> exactly one scalar value, and can be used inside any expression, such as <code>SELECT</code>, <code>WHERE</code> or <code>ORDER BY</code>. Unlike procedures, you do not CALL it.`,
            r`DELIMITER //
CREATE FUNCTION add_tax(price DECIMAL(10,2), rate DECIMAL(4,2))
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
  RETURN ROUND(price * (1 + rate), 2);
END //
DELIMITER ;

SELECT add_tax(200, 0.18) AS gross;

-- OUTPUT:
-- +--------+
-- | gross  |
-- +--------+
-- | 236.00 |
-- +--------+`],
        [`Built-in functions cannot cover every business rule. A stored function encapsulates a calculation once (tax, age band, formatted name) and lets any query reuse it, keeping logic consistent across applications.`,
            r`CREATE TABLE person (id INT PRIMARY KEY, first VARCHAR(10), last VARCHAR(10), dob DATE);
INSERT INTO person VALUES (1,'Asha','Rao','2000-05-10'),(2,'Ben','Kumar','1980-01-01');

DELIMITER //
CREATE FUNCTION full_name(f VARCHAR(10), l VARCHAR(10)) RETURNS VARCHAR(25) DETERMINISTIC
BEGIN
  RETURN CONCAT(l, ', ', f);
END //
DELIMITER ;

SELECT id, full_name(first, last) AS who FROM person;

-- OUTPUT:
-- +----+-------------+
-- | id | who         |
-- +----+-------------+
-- |  1 | Rao, Asha   |
-- |  2 | Kumar, Ben  |
-- +----+-------------+`],
        [`Real use: currency conversion, slug generation, custom validators, age or fiscal-year helpers and lookups used in reports. Manage with <code>SHOW CREATE FUNCTION</code>, <code>DROP FUNCTION</code> and <code>GRANT EXECUTE</code>.`,
            r`DELIMITER //
CREATE FUNCTION age_on(d DATE, ref DATE) RETURNS INT DETERMINISTIC
BEGIN
  RETURN TIMESTAMPDIFF(YEAR, d, ref);
END //
DELIMITER ;

SELECT first, age_on(dob, '2024-06-01') AS age FROM person;

-- OUTPUT:
-- +-------+-----+
-- | first | age |
-- +-------+-----+
-- | Asha  |  24 |
-- | Ben   |  44 |
-- +-------+-----+`],
        [`<b>Advantages:</b> usable anywhere an expression is allowed; one definition for a rule; typed result; can read tables (with READS SQL DATA).`,
            r`-- Function inside WHERE and ORDER BY.
SELECT first FROM person
WHERE age_on(dob, '2024-06-01') > 30
ORDER BY full_name(first, last);

-- OUTPUT:
-- +-------+
-- | first |
-- +-------+
-- | Ben   |
-- +-------+`],
        [`<b>Disadvantages:</b> called once per row, so cost multiplies; wrapping an indexed column in a function disables the index (not sargable); hard to optimise and debug.`,
            r`CREATE INDEX idx_dob ON person(dob);
EXPLAIN SELECT * FROM person WHERE age_on(dob, '2024-06-01') > 30;   -- scans every row
EXPLAIN SELECT * FROM person WHERE dob < '1994-06-01';               -- can use idx_dob

-- OUTPUT (type column):
-- ALL     <- function on the column
-- range   <- plain comparison`],
        [`<b>Limitations:</b> a function must RETURN one scalar; it cannot return a result set, and cannot use statements that return result sets, COMMIT/ROLLBACK, or most DDL. With binary logging on, you must declare DETERMINISTIC, NO SQL or READS SQL DATA, or you get error 1418 (unless <code>log_bin_trust_function_creators=1</code> or you have SUPER).`,
            r`DELIMITER //
CREATE FUNCTION bad_fn() RETURNS INT
BEGIN
  RETURN 1;                     -- no DETERMINISTIC / NO SQL / READS SQL DATA characteristic
END //
DELIMITER ;

-- OUTPUT (binary logging enabled):
-- ERROR 1418 (HY000): This function has none of DETERMINISTIC, NO SQL, or READS SQL DATA in its
--                     declaration and binary logging is enabled (you *might* want to use the less
--                     safe log_bin_trust_function_creators variable)`],
        r`  SELECT id, add_tax(price, 0.18) FROM items;
                  |
      for each row |  (called N times)
                  v
        +------------------------+
        | FUNCTION add_tax(...)  |
        |   RETURNS DECIMAL      |
        |   BEGIN ... RETURN x   |   exactly ONE scalar value
        +------------------------+
                  |
                  v
          value placed into the result column / WHERE / ORDER BY`,
        `Use stored functions for small, pure, reusable calculations. Avoid table lookups inside them on large scans (hidden N+1 inside the engine), keep them sargable-friendly by never wrapping indexed columns, and prefer generated columns when the result must be indexed.`
    ),

    'Deterministic Functions': dd(
        [`A function is <b>DETERMINISTIC</b> if the same inputs always give the same output. You declare it with the keyword; MySQL trusts the declaration and does not verify it. Alternatives are <code>NOT DETERMINISTIC</code> (default), plus data-access hints <code>NO SQL</code>, <code>READS SQL DATA</code>, <code>MODIFIES SQL DATA</code>.`,
            r`DELIMITER //
CREATE FUNCTION area(r DOUBLE) RETURNS DOUBLE
DETERMINISTIC NO SQL
BEGIN
  RETURN ROUND(PI() * r * r, 2);       -- depends only on r
END //
DELIMITER ;

SELECT area(2) AS a;

-- OUTPUT:
-- +-------+
-- | a     |
-- +-------+
-- | 12.57 |
-- +-------+`],
        [`The declaration matters for safe replication and binary logging: statement-based replication replays the function on replicas, so a non-deterministic function (using NOW, RAND, UUID) can give different results on the source and replica. MySQL therefore demands you state your intent.`,
            r`DELIMITER //
CREATE FUNCTION today_label() RETURNS VARCHAR(20)
NOT DETERMINISTIC READS SQL DATA
BEGIN
  RETURN CONCAT('Date: ', CURDATE());      -- changes every day
END //
DELIMITER ;
SELECT today_label();

-- OUTPUT (example):
-- +-------------------+
-- | today_label()     |
-- +-------------------+
-- | Date: 2026-10-06  |
-- +-------------------+`],
        [`Real use: label pure calculations DETERMINISTIC so they can be used in generated columns and functional indexes (MySQL 8 requires deterministic expressions there); mark clock or random based ones NOT DETERMINISTIC.`,
            r`CREATE TABLE price (id INT PRIMARY KEY, net DECIMAL(10,2),
  gross DECIMAL(10,2) AS (net * 1.18) STORED);          -- built-in expression is deterministic
INSERT INTO price(id, net) VALUES (1, 100);
CREATE INDEX idx_gross ON price(gross);
SELECT id, gross FROM price;

-- OUTPUT:
-- +----+--------+
-- | id | gross  |
-- +----+--------+
-- |  1 | 118.00 |
-- +----+--------+`],
        [`<b>Advantages:</b> safe replication, correct caching assumptions by the optimizer and eligibility for generated columns and indexes; the declaration documents intent.`,
            r`-- Stored functions are not allowed in generated columns, so use built-ins there:
CREATE TABLE t2 (a INT, b INT AS (a * 2) VIRTUAL);
INSERT INTO t2(a) VALUES (21);
SELECT * FROM t2;

-- OUTPUT:
-- +------+------+
-- | a    | b    |
-- +------+------+
-- |   21 |   42 |
-- +------+------+`],
        [`<b>Disadvantages:</b> MySQL does not check your claim; a function wrongly declared DETERMINISTIC can return stale or inconsistent data and corrupt replicas silently; declaring NOT DETERMINISTIC may disable optimisations.`,
            r`DELIMITER //
CREATE FUNCTION lying() RETURNS DOUBLE DETERMINISTIC NO SQL
BEGIN
  RETURN RAND();                          -- not deterministic, but declared so (BUG)
END //
DELIMITER ;
SELECT lying() = lying() AS same;

-- OUTPUT (example):
-- +------+
-- | same |
-- +------+
-- |    0 |
-- +------+     <- a truly deterministic function would give 1`],
        [`<b>Limitations:</b> there is no automatic verification; deterministic functions still run per row (MySQL does not memoise results across rows); with binlog_format=ROW the risk is much smaller than with STATEMENT.`,
            r`SHOW VARIABLES LIKE 'binlog_format';
SHOW VARIABLES LIKE 'log_bin_trust_function_creators';

-- OUTPUT (example):
-- +---------------+-------+
-- | Variable_name | Value |
-- +---------------+-------+
-- | binlog_format | ROW   |
-- +---------------+-------+
-- | log_bin_trust_function_creators | OFF |`],
        r`  same input ---> function ---> same output ?

  DETERMINISTIC       area(r), tax(price)        replica-safe, index-friendly
  NOT DETERMINISTIC   NOW(), RAND(), UUID()      differs per run

  data access hint:  NO SQL | READS SQL DATA | MODIFIES SQL DATA | CONTAINS SQL
  MySQL TRUSTS the keywords -- it never checks them`,
        `Be honest in the declaration; it is a contract with replication and the optimizer. Use ROW-based binary logging, keep functions free of side effects, and never mark a function using time, randomness or mutable tables as DETERMINISTIC.`
    ),

    'Stored Function vs Procedure': dd(
        [`A <b>function</b> returns one value and is used inside expressions. A <b>procedure</b> is invoked with <code>CALL</code>, can return many result sets and OUT parameters, and can freely change data and manage transactions.`,
            r`DELIMITER //
CREATE FUNCTION sq(n INT) RETURNS INT DETERMINISTIC NO SQL RETURN n * n //
CREATE PROCEDURE sq_p(IN n INT, OUT r INT) BEGIN SET r = n * n; END //
DELIMITER ;

SELECT sq(7) AS by_function;        -- inside an expression
CALL sq_p(7, @r);  SELECT @r AS by_procedure;

-- OUTPUT:
-- +-------------+     +--------------+
-- | by_function |     | by_procedure |
-- +-------------+     +--------------+
-- |          49 |     |           49 |
-- +-------------+     +--------------+`],
        [`Choosing wrongly forces awkward workarounds: you cannot filter by a procedure result, and you cannot COMMIT inside a function. Knowing the split tells you which one to write for each job.`,
            r`-- Function composes with SQL clauses; a procedure cannot.
SELECT n FROM (SELECT 3 AS n UNION SELECT 8) t WHERE sq(n) > 20;

-- OUTPUT:
-- +---+
-- | n |
-- +---+
-- | 8 |
-- +---+`],
        [`Rule of thumb: function for a pure calculation or lookup used in queries; procedure for a business action (create order, transfer funds, purge data) with transactions, multiple statements and result sets.`,
            r`DELIMITER //
CREATE PROCEDURE close_month(IN m CHAR(7))
BEGIN
  START TRANSACTION;
  INSERT INTO summary SELECT m, SUM(amt) FROM orders WHERE DATE_FORMAT(created,'%Y-%m') = m;
  DELETE FROM orders WHERE DATE_FORMAT(created,'%Y-%m') = m;
  COMMIT;                                -- allowed in a procedure only
END //
DELIMITER ;

-- OUTPUT (CALL close_month('2024-05')):
-- Query OK, 0 rows affected`],
        [`<b>Function pros:</b> composable in SELECT, WHERE, JOIN and ORDER BY; typed return. <b>Procedure pros:</b> transactions, multiple result sets, OUT and INOUT parameters, any DML and most DDL-like control flow.`,
            r`-- Procedure may return result sets; function may not.
DELIMITER //
CREATE PROCEDURE two_sets() BEGIN SELECT 1 AS a; SELECT 2 AS b; END //
DELIMITER ;
CALL two_sets();

-- OUTPUT:
-- +---+     +---+
-- | a |     | b |
-- +---+     +---+
-- | 1 |     | 2 |
-- +---+     +---+`],
        [`<b>Cons:</b> a function runs per row and can hide big costs; a procedure cannot be composed into a query, and returns values only via OUT or result sets.`,
            r`-- Function reading another table = hidden query per row.
DELIMITER //
CREATE FUNCTION cust_total(c INT) RETURNS INT READS SQL DATA
BEGIN
  DECLARE t INT;
  SELECT IFNULL(SUM(amt),0) INTO t FROM orders WHERE cust = c;
  RETURN t;
END //
DELIMITER ;
SELECT cust, cust_total(cust) FROM (SELECT DISTINCT cust FROM orders) c;   -- N hidden queries

-- OUTPUT:
-- +------+-----------------+
-- | cust | cust_total(cust)|
-- +------+-----------------+
-- |    7 |             120 |
-- |    8 |              20 |
-- +------+-----------------+`],
        [`<b>Limitations of functions:</b> no result sets, no explicit COMMIT, ROLLBACK or START TRANSACTION, no dynamic SQL (PREPARE), no DDL; they cannot modify the table being read by the calling statement (error 1442). Procedures cannot appear in expressions.`,
            r`DELIMITER //
CREATE FUNCTION bad_fn2() RETURNS INT
MODIFIES SQL DATA
BEGIN
  COMMIT;
  RETURN 1;
END //
DELIMITER ;

-- OUTPUT:
-- ERROR 1422 (HY000): Explicit or implicit commit is not allowed in stored function or trigger.`],
        r`                    FUNCTION                    PROCEDURE
  invoked by     expression (SELECT f(x))          CALL p(x)
  returns        1 scalar (RETURN)                 OUT params / result sets
  transactions   no COMMIT / ROLLBACK              yes
  in WHERE/JOIN  yes                               no
  runs           once per row                      once per call

   calculation  ---> FUNCTION          action / workflow ---> PROCEDURE`,
        `Default to built-ins and plain SQL, add a function only for a reused pure calculation, and a procedure only for a transactional unit of work. Watch per-row function cost in execution plans and slow-log reviews, and keep both under version control with tests.`
    ),
};
