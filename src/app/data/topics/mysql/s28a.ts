// Module 28 (Window Functions), part A: ranking, NTILE, LAG/LEAD, FIRST/LAST_VALUE.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s28a: Record<string, DeepDive> = {
    'ROW_NUMBER, RANK & DENSE_RANK': dd(
        [`<b>Window functions</b> compute a value for each row using a set of related rows (the "window") <i>without collapsing rows</i> like GROUP BY does. The three ranking functions number rows by an <code>ORDER BY</code> inside <code>OVER (...)</code>: <code>ROW_NUMBER</code> is always unique, <code>RANK</code> leaves gaps after ties, <code>DENSE_RANK</code> does not.`,
            r`CREATE TABLE scores (student VARCHAR(10), score INT);
INSERT INTO scores VALUES ('Asha',90),('Ravi',85),('Meena',85),('John',70);

SELECT student, score,
       ROW_NUMBER() OVER (ORDER BY score DESC) AS rn,     -- 1,2,3,4 (ties broken arbitrarily)
       RANK()       OVER (ORDER BY score DESC) AS rnk,    -- ties share rank, next rank skips
       DENSE_RANK() OVER (ORDER BY score DESC) AS drnk    -- ties share rank, no gap
FROM   scores
ORDER  BY score DESC, student;

-- OUTPUT (rn for the tied rows may swap - example):
-- +---------+-------+----+-----+------+
-- | student | score | rn | rnk | drnk |
-- +---------+-------+----+-----+------+
-- | Asha    |    90 |  1 |   1 |    1 |
-- | Meena   |    85 |  2 |   2 |    2 |
-- | Ravi    |    85 |  3 |   2 |    2 |
-- | John    |    70 |  4 |   4 |    3 |
-- +---------+-------+----+-----+------+`],
        [`Leaderboards, "second highest salary", de-duplication and pagination all need ranking. Before MySQL 8.0 this required self-joins or user variables; window functions make it declarative and correct.`,
            r`-- Second-highest score, tie-safe, using DENSE_RANK
SELECT student, score
FROM  (SELECT student, score, DENSE_RANK() OVER (ORDER BY score DESC) AS d FROM scores) x
WHERE d = 2;                        -- window functions cannot be in WHERE, so wrap them

-- OUTPUT:
-- +---------+-------+
-- | student | score |
-- +---------+-------+
-- | Ravi    |    85 |
-- | Meena   |    85 |
-- +---------+-------+`],
        [`Real use: de-duplicate rows by keeping <code>ROW_NUMBER() = 1</code> per business key, and rank products within each category by sales.`,
            r`CREATE TABLE contacts (id INT PRIMARY KEY, email VARCHAR(30), created DATE);
INSERT INTO contacts VALUES (1,'a@x.com','2025-01-01'),(2,'a@x.com','2025-02-01'),(3,'b@x.com','2025-01-15');

-- Keep only the newest row per email
SELECT id, email, created
FROM  (SELECT *, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created DESC) AS rn
       FROM contacts) t
WHERE rn = 1
ORDER BY id;

-- OUTPUT:
-- +----+---------+------------+
-- | id | email   | created    |
-- +----+---------+------------+
-- |  2 | a@x.com | 2025-02-01 |
-- |  3 | b@x.com | 2025-01-15 |
-- +----+---------+------------+`],
        [`<b>Advantages:</b> rows are preserved, several rankings in one pass, PARTITION BY ranks per group, and the optimiser sorts once when the OVER clauses match.`,
            r`-- Per-group ranking in a single query
CREATE TABLE emp (name VARCHAR(10), dept VARCHAR(5), sal INT);
INSERT INTO emp VALUES ('A','IT',90),('B','IT',80),('C','HR',70),('D','HR',70);
SELECT name, dept, sal,
       RANK() OVER (PARTITION BY dept ORDER BY sal DESC) AS dept_rank
FROM emp ORDER BY dept, name;

-- OUTPUT:
-- +------+------+-----+-----------+
-- | name | dept | sal | dept_rank |
-- +------+------+-----+-----------+
-- | C    | HR   |  70 |         1 |
-- | D    | HR   |  70 |         1 |
-- | A    | IT   |  90 |         1 |
-- | B    | IT   |  80 |         2 |
-- +------+------+-----+-----------+`],
        [`<b>Disadvantages:</b> ROW_NUMBER on ties is nondeterministic unless you add a unique tie-breaker; the sort can be expensive on large sets; the result cannot be filtered in the same SELECT.`,
            r`-- Make it deterministic with a tie-breaker column
SELECT student, score,
       ROW_NUMBER() OVER (ORDER BY score DESC, student ASC) AS rn   -- student breaks ties
FROM scores ORDER BY rn;

-- OUTPUT:
-- +---------+-------+----+
-- | student | score | rn |
-- +---------+-------+----+
-- | Asha    |    90 |  1 |
-- | Meena   |    85 |  2 |
-- | Ravi    |    85 |  3 |
-- | John    |    70 |  4 |
-- +---------+-------+----+`],
        [`<b>Limitations:</b> window functions are allowed only in SELECT and ORDER BY (not WHERE, GROUP BY or HAVING); they are evaluated after WHERE/GROUP BY/HAVING; and they require MySQL 8.0+.`,
            r`SELECT student FROM scores WHERE ROW_NUMBER() OVER (ORDER BY score) = 1;

-- OUTPUT:
-- ERROR 3593 (HY000): You cannot use the window function 'row_number' in this context.`],
        `
   score:   90   85   85   70
   ---------------------------------
   ROW_NUMBER  1    2    3    4      always unique
   RANK        1    2    2    4      gap after ties
   DENSE_RANK  1    2    2    3      no gap
`,
        `Choose by intent: ROW_NUMBER for "exactly one per group" (dedupe, pagination), RANK for competition-style ranking, DENSE_RANK for "Nth distinct value". Support the OVER (PARTITION BY a ORDER BY b) with a composite index (a, b) so the engine can avoid a filesort, and always add a unique tie-breaker so results are reproducible across runs and replicas.`
    ),

    'NTILE': dd(
        [`<code>NTILE(n)</code> splits the ordered rows of a window into <b>n roughly equal buckets</b> and returns the bucket number (1..n). When rows do not divide evenly, the first buckets get one extra row.`,
            r`CREATE TABLE scores (student VARCHAR(10), score INT);
INSERT INTO scores VALUES ('A',95),('B',90),('C',85),('D',80),('E',75),('F',70),('G',65);

SELECT student, score,
       NTILE(3) OVER (ORDER BY score DESC) AS bucket    -- 7 rows / 3 -> sizes 3,2,2
FROM scores ORDER BY score DESC;

-- OUTPUT:
-- +---------+-------+--------+
-- | student | score | bucket |
-- +---------+-------+--------+
-- | A       |    95 |      1 |
-- | B       |    90 |      1 |
-- | C       |    85 |      1 |
-- | D       |    80 |      2 |
-- | E       |    75 |      2 |
-- | F       |    70 |      3 |
-- | G       |    65 |      3 |
-- +---------+-------+--------+`],
        [`Percentile-style groupings (quartiles, deciles, "top 20% customers") and balanced work distribution (split 1 million ids into 8 equal batches for parallel jobs) need equal-sized groups, not equal-width value ranges.`,
            r`-- Label each student by quartile
SELECT student,
       CASE NTILE(4) OVER (ORDER BY score DESC)
            WHEN 1 THEN 'Top 25%' WHEN 2 THEN 'Upper mid'
            WHEN 3 THEN 'Lower mid' ELSE 'Bottom 25%' END AS band
FROM scores ORDER BY score DESC;

-- OUTPUT:
-- +---------+------------+
-- | student | band       |
-- +---------+------------+
-- | A       | Top 25%    |
-- | B       | Top 25%    |
-- | C       | Upper mid  |
-- | D       | Upper mid  |
-- | E       | Lower mid  |
-- | F       | Lower mid  |
-- | G       | Bottom 25% |
-- +---------+------------+`],
        [`Real use: batch splitting. Assign each row to one of N workers, then each worker processes only its bucket.`,
            r`-- Split work for 2 parallel workers; each worker runs WHERE bucket = :worker
SELECT student, NTILE(2) OVER (ORDER BY student) AS worker FROM scores ORDER BY student;

-- OUTPUT:
-- +---------+--------+
-- | student | worker |
-- +---------+--------+
-- | A       |      1 |
-- | B       |      1 |
-- | C       |      1 |
-- | D       |      1 |
-- | E       |      2 |
-- | F       |      2 |
-- | G       |      2 |
-- +---------+--------+`],
        [`<b>Advantages:</b> one function gives equal-population groups; combined with PARTITION BY you get per-group quartiles; trivial to read.`,
            r`-- Per-group tiles: split each department's staff into 2 halves
CREATE TABLE emp (name VARCHAR(5), dept VARCHAR(5), sal INT);
INSERT INTO emp VALUES ('a','IT',9),('b','IT',8),('c','IT',7),('d','IT',6),('e','HR',5),('f','HR',4);
SELECT name, dept, NTILE(2) OVER (PARTITION BY dept ORDER BY sal DESC) AS half
FROM emp ORDER BY dept, sal DESC;

-- OUTPUT:
-- +------+------+------+
-- | name | dept | half |
-- +------+------+------+
-- | e    | HR   |    1 |
-- | f    | HR   |    2 |
-- | a    | IT   |    1 |
-- | b    | IT   |    1 |
-- | c    | IT   |    2 |
-- | d    | IT   |    2 |
-- +------+------+------+`],
        [`<b>Disadvantages:</b> tied values can land in different buckets (NTILE splits by position, not value), so two people with the same score may get different quartiles.`,
            r`-- Equal scores, different buckets
CREATE TABLE s2 (n VARCHAR(2), score INT);
INSERT INTO s2 VALUES ('a',80),('b',80),('c',80),('d',60);
SELECT n, score, NTILE(2) OVER (ORDER BY score DESC, n) AS b FROM s2;

-- OUTPUT:
-- +---+-------+---+
-- | n | score | b |
-- +---+-------+---+
-- | a |    80 | 1 |
-- | b |    80 | 1 |
-- | c |    80 | 2 |   <- same score as a and b, different bucket
-- | d |    60 | 2 |
-- +---+-------+---+`],
        [`<b>Limitations:</b> the argument must be a positive integer constant or a user variable/parameter (not a column); bucket sizes differ by at most one; with fewer rows than buckets, the higher buckets stay empty.`,
            r`SELECT n, NTILE(10) OVER (ORDER BY n) AS b FROM s2;      -- 4 rows, 10 buckets

-- OUTPUT:
-- +---+---+
-- | n | b |
-- +---+---+
-- | a | 1 |
-- | b | 2 |
-- | c | 3 |
-- | d | 4 |
-- +---+---+     (buckets 5..10 are never used)`],
        `
   7 rows ordered by score DESC, NTILE(3):

   [ A  B  C ] [ D  E ] [ F  G ]
     bucket 1   bucket 2  bucket 3
     (3 rows)   (2 rows)  (2 rows)    extras go to the first buckets
`,
        `NTILE is positional, so use it for load-balancing and approximate percentiles, not for statistically exact bands where ties matter - use PERCENT_RANK or CUME_DIST (also window functions) or explicit value thresholds in that case. For parallel batch splits on huge tables prefer range-splitting on the primary key; NTILE must sort the whole set first.`
    ),

    'LAG & LEAD': dd(
        [`<code>LAG(col, n, default)</code> reads the value from <b>n rows before</b> the current row and <code>LEAD</code> from <b>n rows after</b>, within the ordered partition. They replace self-joins for "compare with previous/next row".`,
            r`CREATE TABLE daily (d DATE, sales INT);
INSERT INTO daily VALUES ('2025-01-01',100),('2025-01-02',130),('2025-01-03',90),('2025-01-04',150);

SELECT d, sales,
       LAG(sales)     OVER (ORDER BY d) AS prev_day,     -- previous row, NULL for the first
       LEAD(sales)    OVER (ORDER BY d) AS next_day,     -- next row, NULL for the last
       sales - LAG(sales, 1, sales) OVER (ORDER BY d) AS change  -- default = own value -> 0
FROM daily ORDER BY d;

-- OUTPUT:
-- +------------+-------+----------+----------+--------+
-- | d          | sales | prev_day | next_day | change |
-- +------------+-------+----------+----------+--------+
-- | 2025-01-01 |   100 |     NULL |      130 |      0 |
-- | 2025-01-02 |   130 |      100 |       90 |     30 |
-- | 2025-01-03 |    90 |      130 |      150 |    -40 |
-- | 2025-01-04 |   150 |       90 |     NULL |     60 |
-- +------------+-------+----------+----------+--------+`],
        [`Time-series analysis is about change: day-over-day growth, gaps between events, session detection. Doing that with self-joins on "previous id" is fragile when ids have gaps.`,
            r`-- Gap detection: find missing days
SELECT d AS from_day, next_d AS to_day
FROM  (SELECT d, LEAD(d) OVER (ORDER BY d) AS next_d FROM daily) x
WHERE DATEDIFF(next_d, d) > 1;                -- more than a day to the next row

-- OUTPUT (after deleting 2025-01-03 for the demo):
-- +------------+------------+
-- | from_day   | to_day     |
-- +------------+------------+
-- | 2025-01-02 | 2025-01-04 |
-- +------------+------------+`],
        [`Real use: month-over-month revenue growth percent, time between a user's consecutive logins, price change history, and detecting status changes in an event log.`,
            r`CREATE TABLE monthly (m CHAR(7), revenue INT);
INSERT INTO monthly VALUES ('2025-01',200),('2025-02',250),('2025-03',225);

SELECT m, revenue,
       ROUND(100 * (revenue - LAG(revenue) OVER (ORDER BY m)) / LAG(revenue) OVER (ORDER BY m), 1) AS growth_pct
FROM monthly;

-- OUTPUT:
-- +---------+---------+------------+
-- | m       | revenue | growth_pct |
-- +---------+---------+------------+
-- | 2025-01 |     200 |       NULL |
-- | 2025-02 |     250 |       25.0 |
-- | 2025-03 |     225 |      -10.0 |
-- +---------+---------+------------+`],
        [`<b>Advantages:</b> single pass over sorted data, offset and default arguments, works per partition (e.g. per customer), far simpler than correlated subqueries.`,
            r`-- Per-customer previous order amount
CREATE TABLE ord (cust VARCHAR(2), seq INT, amt INT);
INSERT INTO ord VALUES ('A',1,10),('A',2,15),('B',1,7),('B',2,3);
SELECT cust, seq, amt, LAG(amt) OVER (PARTITION BY cust ORDER BY seq) AS prev_amt
FROM ord ORDER BY cust, seq;

-- OUTPUT:
-- +------+-----+-----+----------+
-- | cust | seq | amt | prev_amt |
-- +------+-----+-----+----------+
-- | A    |   1 |  10 |     NULL |
-- | A    |   2 |  15 |       10 |
-- | B    |   1 |   7 |     NULL |
-- | B    |   2 |   3 |        7 |
-- +------+-----+-----+----------+`],
        [`<b>Disadvantages:</b> the first/last row yields NULL unless you give a default, NULL arithmetic then propagates, and a missing ORDER BY makes results meaningless.`,
            r`-- NULL propagates unless handled
SELECT d, sales - LAG(sales) OVER (ORDER BY d) AS change_raw,
          sales - COALESCE(LAG(sales) OVER (ORDER BY d), 0) AS change_safe
FROM daily ORDER BY d LIMIT 2;

-- OUTPUT:
-- +------------+------------+-------------+
-- | d          | change_raw | change_safe |
-- +------------+------------+-------------+
-- | 2025-01-01 |       NULL |         100 |
-- | 2025-01-02 |         30 |          30 |
-- +------------+------------+-------------+`],
        [`<b>Limitations:</b> the offset must be a non-negative integer constant (not a column); LAG/LEAD ignore the frame clause (they use the partition order only); only one window ordering per OVER, so comparing "same weekday last year" needs a join or a calendar table.`,
            r`-- Offset is a literal; look back 7 rows for "same weekday last week" on daily data
SELECT d, sales, LAG(sales, 7) OVER (ORDER BY d) AS same_day_last_week FROM daily;

-- OUTPUT:
-- +------------+-------+--------------------+
-- | d          | sales | same_day_last_week |
-- +------------+-------+--------------------+
-- | 2025-01-01 |   100 |               NULL |
-- | 2025-01-02 |   130 |               NULL |
-- | 2025-01-03 |    90 |               NULL |
-- | 2025-01-04 |   150 |               NULL |
-- +------------+-------+--------------------+   (only 4 rows, so no row 7 back)`],
        `
   ordered rows:   r1    r2    r3    r4
                    ^     ^     ^     ^
   LAG(x)  at r3  -----> value of r2       (look back 1)
   LEAD(x) at r3  -----> value of r4       (look ahead 1)
   LAG(x,2) at r3 -----> value of r1
   first row LAG -> NULL (or the default argument)
`,
        `LAG/LEAD are the standard way to do row-to-row deltas. Guarantee a unique, gapless ordering key (or a calendar table joined first) so "previous" really means previous period. Index (partition_key, order_key) to avoid sorting, and test NULL handling explicitly because growth formulas divide by the lagged value.`
    ),

    'FIRST_VALUE & LAST_VALUE': dd(
        [`<code>FIRST_VALUE(expr)</code> returns the value from the first row of the window frame and <code>LAST_VALUE(expr)</code> from the last row of the frame. Careful: with an ORDER BY, the default frame ends at the <i>current row</i>, so LAST_VALUE returns the current row's value unless you widen the frame.`,
            r`CREATE TABLE emp (name VARCHAR(8), dept VARCHAR(4), sal INT);
INSERT INTO emp VALUES ('Asha','IT',90),('Ravi','IT',80),('Meena','IT',70),('Zoya','HR',60),('Omar','HR',50);

SELECT name, dept, sal,
       FIRST_VALUE(name) OVER (PARTITION BY dept ORDER BY sal DESC) AS top_earner
FROM emp ORDER BY dept, sal DESC;

-- OUTPUT:
-- +-------+------+-----+------------+
-- | name  | dept | sal | top_earner |
-- +-------+------+-----+------------+
-- | Zoya  | HR   |  60 | Zoya       |
-- | Omar  | HR   |  50 | Zoya       |
-- | Asha  | IT   |  90 | Asha       |
-- | Ravi  | IT   |  80 | Asha       |
-- | Meena | IT   |  70 | Asha       |
-- +-------+------+-----+------------+`],
        [`You often need to compare each row to the group's best, worst, opening or closing value - "how far is each salary below the department maximum?", "price change since the first quote" - without a separate join.`,
            r`SELECT name, sal,
       FIRST_VALUE(sal) OVER (PARTITION BY dept ORDER BY sal DESC) - sal AS gap_to_top
FROM emp WHERE dept = 'IT' ORDER BY sal DESC;

-- OUTPUT:
-- +-------+-----+------------+
-- | name  | sal | gap_to_top |
-- +-------+-----+------------+
-- | Asha  |  90 |          0 |
-- | Ravi  |  80 |         10 |
-- | Meena |  70 |         20 |
-- +-------+-----+------------+`],
        [`Real use: OHLC style reports (open = first price of the day, close = last price), "latest status per ticket", and baselines for percent-change charts.`,
            r`CREATE TABLE ticks (sym VARCHAR(3), ts TIME, price DECIMAL(6,2));
INSERT INTO ticks VALUES ('XYZ','09:30',10.0),('XYZ','12:00',12.5),('XYZ','15:30',11.0);

SELECT DISTINCT sym,
  FIRST_VALUE(price) OVER w AS open_px,
  LAST_VALUE(price)  OVER w AS close_px            -- needs the full frame (see window w)
FROM ticks
WINDOW w AS (PARTITION BY sym ORDER BY ts
             ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING);  -- whole partition

-- OUTPUT:
-- +-----+--------+----------+
-- | sym | open_px| close_px |
-- +-----+--------+----------+
-- | XYZ |  10.00 |    11.00 |
-- +-----+--------+----------+`],
        [`<b>Advantages:</b> avoids self-joins and correlated MAX subqueries, can pick any column's value (not just the min/max itself), and works per partition. The named WINDOW clause reuses one definition.`,
            r`-- Name of the lowest earner per department (value from another column than the order key)
SELECT DISTINCT dept,
  FIRST_VALUE(name) OVER (PARTITION BY dept ORDER BY sal ASC) AS lowest_paid
FROM emp ORDER BY dept;

-- OUTPUT:
-- +------+-------------+
-- | dept | lowest_paid |
-- +------+-------------+
-- | HR   | Omar        |
-- | IT   | Meena       |
-- +------+-------------+`],
        [`<b>Disadvantages:</b> the LAST_VALUE default-frame trap silently returns wrong data; people forget it and see the current row repeated.`,
            r`-- The trap: default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
SELECT name, sal,
       LAST_VALUE(name) OVER (PARTITION BY dept ORDER BY sal DESC) AS last_name
FROM emp WHERE dept = 'IT' ORDER BY sal DESC;

-- OUTPUT:
-- +-------+-----+-----------+
-- | name  | sal | last_name |
-- +-------+-----+-----------+
-- | Asha  |  90 | Asha      |   <- not Meena: frame stops at the current row
-- | Ravi  |  80 | Ravi      |
-- | Meena |  70 | Meena     |
-- +-------+-----+-----------+`],
        [`<b>Limitations:</b> with RANGE frames, peer rows (equal ORDER BY values) are all inside the frame, so LAST_VALUE may pick any of the tied rows; NULL values are respected unless you use <code>IGNORE NULLS</code>, which MySQL does not support (it supports RESPECT NULLS only).`,
            r`-- Fix the trap with an explicit full frame (or use FIRST_VALUE with reversed ORDER BY)
SELECT name, sal,
  LAST_VALUE(name) OVER (PARTITION BY dept ORDER BY sal DESC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lowest
FROM emp WHERE dept = 'IT' ORDER BY sal DESC;

-- OUTPUT:
-- +-------+-----+--------+
-- | name  | sal | lowest |
-- +-------+-----+--------+
-- | Asha  |  90 | Meena  |
-- | Ravi  |  80 | Meena  |
-- | Meena |  70 | Meena  |
-- +-------+-----+--------+`],
        `
   partition (dept IT) ordered by sal DESC

   row        sal   default frame (to current row)   full frame
   Asha        90   [Asha]                           [Asha Ravi Meena]
   Ravi        80   [Asha Ravi]                      [Asha Ravi Meena]
   Meena       70   [Asha Ravi Meena]                [Asha Ravi Meena]
   FIRST_VALUE = first of frame      LAST_VALUE = last of frame
`,
        `Prefer FIRST_VALUE with the order reversed over LAST_VALUE so you never depend on frame subtleties, or declare a named WINDOW with an explicit ROWS frame and reuse it. For "latest row per group" at scale, ROW_NUMBER = 1 with a supporting index is often cheaper than DISTINCT over a windowed value for every row.`
    ),
};
