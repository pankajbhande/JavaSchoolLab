// Module 31 (Temporary Tables): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s31k: Record<string, DeepDive> = {
    'CREATE TEMPORARY TABLE': dd(
        [`<code>CREATE TEMPORARY TABLE</code> makes a real table that exists only for your connection. It is invisible to other sessions, is not listed by <code>SHOW TABLES</code>, and is dropped automatically when the session ends. You can create it empty or fill it from a query.`,
            r`CREATE TABLE orders (id INT PRIMARY KEY, customer VARCHAR(10), amount INT);
INSERT INTO orders VALUES (1,'A',100),(2,'A',300),(3,'B',50),(4,'B',70),(5,'C',500);

CREATE TEMPORARY TABLE tmp_top AS                  -- structure + data from a query
SELECT customer, SUM(amount) AS total
FROM   orders GROUP BY customer HAVING SUM(amount) > 100;

SELECT * FROM tmp_top ORDER BY customer;
SHOW TABLES;                                       -- the temporary table is not listed

-- OUTPUT:
-- +----------+-------+
-- | customer | total |
-- +----------+-------+
-- | A        |   400 |
-- | B        |   120 |
-- | C        |   500 |
-- +----------+-------+
-- +----------------+
-- | Tables_in_mydb |
-- +----------------+
-- | orders         |
-- +----------------+`],
        [`Complex work often needs an intermediate result that is reused, indexed or updated step by step: ETL stages, report building, de-duplication, batch processing. A temporary table is private scratch space, so concurrent sessions never collide and no clean-up job is needed.`,
            r`-- You can give it a key and add indexes, like any table
CREATE TEMPORARY TABLE tmp_ids (
  id INT PRIMARY KEY,
  flag TINYINT NOT NULL DEFAULT 0
);
INSERT INTO tmp_ids (id) SELECT id FROM orders WHERE amount >= 100;
ALTER TABLE tmp_ids ADD INDEX idx_flag (flag);

SELECT COUNT(*) AS staged FROM tmp_ids;

-- OUTPUT:
-- +--------+
-- | staged |
-- +--------+
-- |      3 |
-- +--------+`],
        [`Real use: a multi-step report. Step 1 materialises the heavy aggregation once, step 2 enriches it, step 3 returns the final rows, and the intermediate set can be queried several times without being recomputed.`,
            r`-- Step 2: enrich the staged data (a window function avoids reading tmp_top twice)
SELECT customer, total, ROUND(100 * total / SUM(total) OVER (), 1) AS pct
FROM   tmp_top
ORDER  BY total DESC;

-- Step 3: clean up explicitly when the work unit is done
DROP TEMPORARY TABLE tmp_top;

-- OUTPUT:
-- +----------+-------+------+
-- | customer | total | pct  |
-- +----------+-------+------+
-- | C        |   500 | 49.0 |
-- | A        |   400 | 39.2 |
-- | B        |   120 | 11.8 |
-- +----------+-------+------+`],
        [`<b>Advantages:</b> per-session isolation (two sessions can each have a temp table with the same name), automatic cleanup, only the <code>CREATE TEMPORARY TABLES</code> privilege is needed, and temp tables are not written to the redo log like permanent tables, so they are cheap to fill. A temp table can even shadow a permanent table of the same name.`,
            r`CREATE TEMPORARY TABLE orders (x INT);           -- hides the real orders in THIS session
SELECT * FROM orders;
DROP TEMPORARY TABLE orders;                      -- the TEMPORARY keyword is the safety net
SELECT COUNT(*) AS real_rows FROM orders;         -- the permanent table is back

-- OUTPUT:
-- Empty set (0.00 sec)
-- +-----------+
-- | real_rows |
-- +-----------+
-- |         5 |
-- +-----------+`],
        [`<b>Disadvantages:</b> the table belongs to one connection. After a reconnect, or when a connection pool or proxy hands you a different physical connection, it is gone, which causes intermittent "table doesn't exist" errors. Writing replicated statements that use temp tables also needs care with statement-based binary logging.`,
            r`-- Session 1:
CREATE TEMPORARY TABLE t1 (a INT);
-- (connection drops and the pool gives you a new one)
-- Session 2:
SELECT * FROM t1;

-- OUTPUT:
-- ERROR 1146 (42S02): Table 'mydb.t1' doesn't exist`],
        [`<b>Limitations:</b> a temporary table cannot be referenced twice in one query (a self-join fails), cannot be renamed with <code>RENAME TABLE</code> (use <code>ALTER TABLE ... RENAME</code>), cannot be used in a view, and cannot have foreign keys.`,
            r`CREATE TEMPORARY TABLE tmp_top (customer VARCHAR(10), total INT);
SELECT a.customer FROM tmp_top a JOIN tmp_top b ON a.customer = b.customer;
CREATE VIEW v_top AS SELECT * FROM tmp_top;
RENAME TABLE tmp_top TO tmp_top2;

-- OUTPUT:
-- ERROR 1137 (HY000): Can't reopen table: 'a'
-- ERROR 1352 (HY000): View's SELECT refers to a temporary table 'tmp_top'
-- ERROR 1146 (42S02): Table 'mydb.tmp_top' doesn't exist`],
        `
   Session A                 Session B
   +-----------------+       +-----------------+
   | tmp_top (own)   |       | tmp_top (own)   |    same name, different tables
   | tmp_ids         |       |                 |
   +--------+--------+       +--------+--------+
            |                         |
            |   permanent tables are shared:   orders, customers ...
            v                         v
   disconnect  --> temp tables dropped automatically

   lookup order:  TEMPORARY table  first,  then permanent table
`,
        `Use temporary tables for bounded, single-connection pipelines: ETL steps, large intermediate sets that need indexes, or work you want to inspect between steps. Always DROP TEMPORARY TABLE at the end of a unit of work, name them with a clear prefix (tmp_), and avoid them behind transaction-mode connection poolers or proxies that multiplex sessions. In replicated setups prefer ROW binlog format, where temporary tables are not replicated at all.`
    ),

    'Temporary Table vs CTE vs Permanent Table': dd(
        [`Three ways to hold an intermediate result. A <b>CTE</b> lives for one statement. A <b>temporary table</b> lives for one session. A <b>permanent (staging) table</b> lives until someone drops it and is visible to everyone with privileges.`,
            r`CREATE TABLE sales (id INT PRIMARY KEY, region VARCHAR(10), amt INT);
INSERT INTO sales VALUES (1,'N',10),(2,'N',30),(3,'S',20),(4,'S',40),(5,'S',60);

-- 1) CTE: one statement
WITH x AS (SELECT region, SUM(amt) AS s FROM sales GROUP BY region)
SELECT region FROM x WHERE s > 50;

-- 2) TEMPORARY table: one session
CREATE TEMPORARY TABLE tmp_x AS SELECT region, SUM(amt) AS s FROM sales GROUP BY region;
SELECT region FROM tmp_x WHERE s > 50;

-- 3) Permanent staging table: until dropped
CREATE TABLE stg_x AS SELECT region, SUM(amt) AS s FROM sales GROUP BY region;
SELECT region FROM stg_x WHERE s > 50;

-- OUTPUT (each of the three):
-- +--------+
-- | region |
-- +--------+
-- | S      |
-- +--------+`],
        [`The choice decides who can see the data, how long it lives, whether it can be indexed, and what it does to your transaction. Picking wrongly means stale staging tables, lost data after reconnects, or silent commits in the middle of a transaction.`,
            r`-- Reuse across statements: only the table forms keep the data
SELECT SUM(s) AS grand_total FROM tmp_x;           -- statement 1 uses tmp_x
SELECT COUNT(*) AS regions    FROM tmp_x;          -- statement 2 reuses it, no recompute

-- OUTPUT:
-- +-------------+
-- | grand_total |
-- +-------------+
-- |         160 |
-- +-------------+
-- +---------+
-- | regions |
-- +---------+
-- |       2 |
-- +---------+`],
        [`Real use: a nightly load. Data is first loaded into a permanent staging table (so it survives crashes and can be inspected by DBAs), validated, then swapped into the live table. A reporting page uses a CTE for readability. A long one-connection batch job uses a temporary table.`,
            r`-- Staging pattern: load, validate, then publish
CREATE TABLE stg_sales_load LIKE sales;
INSERT INTO stg_sales_load SELECT * FROM sales WHERE amt >= 20;       -- stand-in for a bulk load

SELECT COUNT(*) AS bad_rows FROM stg_sales_load WHERE amt IS NULL;    -- validation

RENAME TABLE sales TO sales_old, stg_sales_load TO sales;             -- atomic swap
SELECT COUNT(*) AS live_rows FROM sales;

-- OUTPUT:
-- +----------+
-- | bad_rows |
-- +----------+
-- |        0 |
-- +----------+
-- +-----------+
-- | live_rows |
-- +-----------+
-- |         4 |
-- +-----------+`],
        [`<b>Advantages:</b> CTE - best readability, may be merged into the outer query, supports recursion. Temporary table - indexable, reusable, private, no cleanup job. Permanent table - durable, visible to other sessions and tools, can be partitioned, backed up and audited.`,
            r`-- A CTE used twice in one statement: written once, so the logic cannot diverge
WITH t AS (SELECT region, SUM(amt) AS s FROM stg_x GROUP BY region)
SELECT 'max' AS kind, region FROM t WHERE s = (SELECT MAX(s) FROM t)
UNION ALL
SELECT 'min', region FROM t WHERE s = (SELECT MIN(s) FROM t);

-- OUTPUT:
-- +------+--------+
-- | kind | region |
-- +------+--------+
-- | max  | S      |
-- | min  | N      |
-- +------+--------+`],
        [`<b>Disadvantages:</b> CTE - cannot be indexed or reused in the next statement. Temporary table - tied to a connection, extra write cost, awkward with pooling. Permanent staging table - must be cleaned up, collides if two jobs use the same name, and old ones accumulate.`,
            r`-- Forgotten staging tables pile up; list them for a clean-up review
SELECT table_name, table_rows
FROM   information_schema.tables
WHERE  table_schema = DATABASE() AND table_name LIKE 'stg%';

-- OUTPUT (example):
-- +---------------+------------+
-- | TABLE_NAME    | TABLE_ROWS |
-- +---------------+------------+
-- | stg_x         |          2 |
-- +---------------+------------+`],
        [`<b>Limitations:</b> creating a permanent table is DDL, and DDL causes an <b>implicit commit</b> that ends your open transaction; a temporary table does not. This is the most important practical difference.`,
            r`CREATE TABLE audit (n INT) ENGINE=InnoDB;

START TRANSACTION;
INSERT INTO audit VALUES (1);
CREATE TEMPORARY TABLE tmp_a (a INT);              -- no implicit commit
ROLLBACK;
SELECT COUNT(*) AS after_temp FROM audit;          -- insert was undone

START TRANSACTION;
INSERT INTO audit VALUES (2);
CREATE TABLE perm_b (b INT);                       -- DDL: implicit COMMIT
ROLLBACK;                                          -- nothing left to roll back
SELECT COUNT(*) AS after_perm FROM audit;          -- insert survived

-- OUTPUT:
-- +------------+
-- | after_temp |
-- +------------+
-- |          0 |
-- +------------+
-- +------------+
-- | after_perm |
-- +------------+
-- |          1 |
-- +------------+`],
        `
                  lifetime           visible to      indexable   transaction effect
   CTE            1 statement        that statement  no          none
   TEMP TABLE     1 session          this session    yes         CREATE does not commit
   PERMANENT      until DROP         everyone        yes         CREATE = implicit COMMIT

   readability, one query ------------------------>  CTE
   big / reused / index needed, one connection ---->  TEMPORARY TABLE
   must survive crash, inspect, share, audit ------>  permanent staging table
`,
        `Default to CTEs, move to a temporary table when EXPLAIN or the slow log shows a repeated expensive intermediate or a missing index, and use permanent staging tables for durable multi-step pipelines with explicit batch ids and a clean-up policy. Never create permanent tables inside a transaction you expect to roll back, and in pooled or proxied environments avoid session-bound state altogether.`
    ),
};
