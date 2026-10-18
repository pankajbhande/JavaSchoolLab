// Module 28 (Window Functions), part B: partitions, frames, running totals, top-N.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s28b: Record<string, DeepDive> = {
    'PARTITION BY & Window Frames': dd(
        [`<code>OVER (PARTITION BY ... ORDER BY ... frame)</code> has three parts. <b>PARTITION BY</b> splits rows into independent groups (like GROUP BY without collapsing). <b>ORDER BY</b> orders rows inside each partition. The <b>frame</b> (<code>ROWS</code> or <code>RANGE BETWEEN ... AND ...</code>) picks which rows around the current row feed the function.`,
            r`CREATE TABLE sales (region VARCHAR(5), mon INT, amt INT);
INSERT INTO sales VALUES ('N',1,10),('N',2,20),('N',3,30),('S',1,5),('S',2,15);

SELECT region, mon, amt,
       SUM(amt) OVER (PARTITION BY region)                    AS region_total,  -- whole partition
       SUM(amt) OVER (PARTITION BY region ORDER BY mon)       AS running        -- start .. current row
FROM sales ORDER BY region, mon;

-- OUTPUT:
-- +--------+-----+-----+--------------+---------+
-- | region | mon | amt | region_total | running |
-- +--------+-----+-----+--------------+---------+
-- | N      |   1 |  10 |           60 |      10 |
-- | N      |   2 |  20 |           60 |      30 |
-- | N      |   3 |  30 |           60 |      60 |
-- | S      |   1 |   5 |           20 |       5 |
-- | S      |   2 |  15 |           20 |      20 |
-- +--------+-----+-----+--------------+---------+`],
        [`GROUP BY gives one row per group, losing the detail. Reports usually need both the detail row and the group figure side by side (each sale and its share of the region). Frames add the "sliding" dimension: last 3 rows, next 2 rows, whole partition.`,
            r`-- Each row's share of its region total - detail and aggregate together
SELECT region, mon, amt,
       ROUND(100 * amt / SUM(amt) OVER (PARTITION BY region), 1) AS pct_of_region
FROM sales ORDER BY region, mon;

-- OUTPUT:
-- +--------+-----+-----+---------------+
-- | region | mon | amt | pct_of_region |
-- +--------+-----+-----+---------------+
-- | N      |   1 |  10 |          16.7 |
-- | N      |   2 |  20 |          33.3 |
-- | N      |   3 |  30 |          50.0 |
-- | S      |   1 |   5 |          25.0 |
-- | S      |   2 |  15 |          75.0 |
-- +--------+-----+-----+---------------+`],
        [`Real use: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW for 3-period moving figures, UNBOUNDED PRECEDING for cumulative totals, and a named <code>WINDOW w AS (...)</code> shared by several columns so the definition is written once.`,
            r`SELECT region, mon, amt,
       SUM(amt) OVER w AS sum_prev1_cur,       -- previous row + current row
       MAX(amt) OVER w AS max_prev1_cur
FROM sales
WINDOW w AS (PARTITION BY region ORDER BY mon
             ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)       -- frame defined once
ORDER BY region, mon;

-- OUTPUT:
-- +--------+-----+-----+---------------+---------------+
-- | region | mon | amt | sum_prev1_cur | max_prev1_cur |
-- +--------+-----+-----+---------------+---------------+
-- | N      |   1 |  10 |            10 |            10 |
-- | N      |   2 |  20 |            30 |            20 |
-- | N      |   3 |  30 |            50 |            30 |
-- | S      |   1 |   5 |             5 |             5 |
-- | S      |   2 |  15 |            20 |            15 |
-- +--------+-----+-----+---------------+---------------+`],
        [`<b>Advantages:</b> one query yields detail plus aggregates, partitions are independent (no cross-group leakage), frames give precise control, and any aggregate (SUM, AVG, COUNT, MIN, MAX) can be windowed.`,
            r`-- ROWS counts physical rows; RANGE counts value peers - difference shows with ties
CREATE TABLE t (v INT);
INSERT INTO t VALUES (1),(2),(2),(3);
SELECT v,
  SUM(v) OVER (ORDER BY v ROWS  BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS by_rows,
  SUM(v) OVER (ORDER BY v RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS by_range
FROM t;

-- OUTPUT:
-- +------+---------+----------+
-- | v    | by_rows | by_range |
-- +------+---------+----------+
-- |    1 |       1 |        1 |
-- |    2 |       3 |        5 |   <- RANGE includes both peer rows with v = 2
-- |    2 |       5 |        5 |
-- |    3 |       8 |        8 |
-- +------+---------+----------+`],
        [`<b>Disadvantages:</b> the default frame depends on whether ORDER BY is present (no ORDER BY: whole partition; with ORDER BY: RANGE UNBOUNDED PRECEDING to CURRENT ROW), which surprises people; large partitions need sorting and memory.`,
            r`-- Same SUM, different meaning depending on ORDER BY
SELECT mon, amt,
       SUM(amt) OVER ()               AS no_order,      -- whole set
       SUM(amt) OVER (ORDER BY mon)   AS with_order     -- cumulative (default frame)
FROM sales WHERE region = 'N';

-- OUTPUT:
-- +-----+-----+----------+------------+
-- | mon | amt | no_order | with_order |
-- +-----+-----+----------+------------+
-- |   1 |  10 |       60 |         10 |
-- |   2 |  20 |       60 |         30 |
-- |   3 |  30 |       60 |         60 |
-- +-----+-----+----------+------------+`],
        [`<b>Limitations:</b> RANGE with a numeric or interval offset (<code>RANGE BETWEEN 7 PRECEDING ...</code>) needs a single numeric/temporal ORDER BY expression; GROUPS frames and EXCLUDE are not supported in MySQL; window functions cannot be nested inside each other.`,
            r`-- Time-based range frame: sum of the last 7 days (inclusive), by value not by row count
CREATE TABLE ev (d DATE, n INT);
INSERT INTO ev VALUES ('2025-01-01',1),('2025-01-05',2),('2025-01-09',4);
SELECT d, n,
  SUM(n) OVER (ORDER BY d RANGE BETWEEN INTERVAL 7 DAY PRECEDING AND CURRENT ROW) AS last_7d
FROM ev;

-- OUTPUT:
-- +------------+---+---------+
-- | d          | n | last_7d |
-- +------------+---+---------+
-- | 2025-01-01 | 1 |       1 |
-- | 2025-01-05 | 2 |       3 |
-- | 2025-01-09 | 4 |       6 |   <- 01-01 fell out of the 7-day range (01-02..01-09)
-- +------------+---+---------+`],
        `
   PARTITION BY region   ->  [ N: r1 r2 r3 ]   [ S: r1 r2 ]   (independent)

   inside one partition, ordered by mon:
        r1    r2    r3    r4    r5
                    ^ current row
   ROWS BETWEEN 2 PRECEDING AND CURRENT ROW      -> [ r1  r2  r3 ]
   ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING      ->     [ r2  r3  r4 ]
   ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT  -> [ r1 .. r3 ]
`,
        `Be explicit about frames in production SQL: write ROWS or RANGE yourself instead of trusting defaults, and use a named WINDOW so related columns cannot drift apart. Prefer ROWS (cheaper, deterministic) unless you truly want value-based peers. Back each partition/order combination with a matching index and watch memory: huge partitions spill to temporary tables on disk.`
    ),

    'Running Totals & Moving Averages': dd(
        [`A <b>running total</b> is a cumulative <code>SUM</code> over an ordered window ending at the current row. A <b>moving average</b> is an <code>AVG</code> over a small sliding frame, which smooths noisy data.`,
            r`CREATE TABLE tx (id INT PRIMARY KEY, day DATE, amount INT);
INSERT INTO tx VALUES (1,'2025-01-01',100),(2,'2025-01-02',-30),(3,'2025-01-03',50),(4,'2025-01-04',20);

SELECT id, day, amount,
       SUM(amount) OVER (ORDER BY day, id
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS balance
FROM tx;                                    -- account balance after each transaction

-- OUTPUT:
-- +----+------------+--------+---------+
-- | id | day        | amount | balance |
-- +----+------------+--------+---------+
-- |  1 | 2025-01-01 |    100 |     100 |
-- |  2 | 2025-01-02 |    -30 |      70 |
-- |  3 | 2025-01-03 |     50 |     120 |
-- |  4 | 2025-01-04 |     20 |     140 |
-- +----+------------+--------+---------+`],
        [`Balances, cumulative revenue, inventory levels and trend lines are everywhere in finance and analytics. Before MySQL 8.0 you used a correlated subquery (O(n squared)) or a fragile <code>@var := @var + x</code> trick; window frames are one clean pass.`,
            r`-- The old way (avoid): correlated subquery, recomputed for every row
SELECT t.id,
       (SELECT SUM(x.amount) FROM tx x WHERE x.day <= t.day AND x.id <= t.id) AS balance_old
FROM tx t;
-- Same numbers, but quadratic work. The window version above is linear.

-- OUTPUT:
-- +----+-------------+
-- | id | balance_old |
-- +----+-------------+
-- |  1 |         100 |
-- |  2 |          70 |
-- |  3 |         120 |
-- |  4 |         140 |
-- +----+-------------+`],
        [`Real use: a 3-day moving average on sales, running total per customer (PARTITION BY), percent of year-to-date, and "days until the balance goes negative" checks.`,
            r`CREATE TABLE sales (day DATE, units INT);
INSERT INTO sales VALUES ('2025-02-01',10),('2025-02-02',20),('2025-02-03',30),('2025-02-04',40),('2025-02-05',20);

SELECT day, units,
       ROUND(AVG(units) OVER (ORDER BY day
             ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS ma3,   -- up to 3 rows
       COUNT(*) OVER (ORDER BY day
             ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)    AS n_used  -- rows actually in frame
FROM sales;

-- OUTPUT:
-- +------------+-------+-------+--------+
-- | day        | units | ma3   | n_used |
-- +------------+-------+-------+--------+
-- | 2025-02-01 |    10 | 10.00 |      1 |
-- | 2025-02-02 |    20 | 15.00 |      2 |
-- | 2025-02-03 |    30 | 20.00 |      3 |
-- | 2025-02-04 |    40 | 30.00 |      3 |
-- | 2025-02-05 |    20 | 30.00 |      3 |
-- +------------+-------+-------+--------+`],
        [`<b>Advantages:</b> linear-time, readable, composable with PARTITION BY (per-customer or per-account totals), and the frame states the business rule (3 rows, 7 days) in the SQL itself.`,
            r`-- Running total that restarts for every customer
CREATE TABLE pay (cust VARCHAR(3), seq INT, amt INT);
INSERT INTO pay VALUES ('A',1,10),('A',2,5),('B',1,7),('B',2,3),('B',3,1);
SELECT cust, seq, amt,
       SUM(amt) OVER (PARTITION BY cust ORDER BY seq) AS cust_running
FROM pay ORDER BY cust, seq;

-- OUTPUT:
-- +------+-----+-----+--------------+
-- | cust | seq | amt | cust_running |
-- +------+-----+-----+--------------+
-- | A    |   1 |  10 |           10 |
-- | A    |   2 |   5 |           15 |
-- | B    |   1 |   7 |            7 |
-- | B    |   2 |   3 |           10 |
-- | B    |   3 |   1 |           11 |
-- +------+-----+-----+--------------+`],
        [`<b>Disadvantages:</b> the first rows have a shorter frame, so early moving averages are based on fewer points (use NULL-ing with COUNT(*) check if you need full windows); a non-unique ORDER BY with the default RANGE frame lumps ties together.`,
            r`-- Tie trap: two transactions on the same day with default frame
CREATE TABLE tt (day DATE, amt INT);
INSERT INTO tt VALUES ('2025-03-01',10),('2025-03-01',5),('2025-03-02',1);
SELECT day, amt, SUM(amt) OVER (ORDER BY day) AS running FROM tt;

-- OUTPUT:
-- +------------+-----+---------+
-- | day        | amt | running |
-- +------------+-----+---------+
-- | 2025-03-01 |  10 |      15 |   <- both same-day rows show 15
-- | 2025-03-01 |   5 |      15 |
-- | 2025-03-02 |   1 |      16 |
-- +------------+-----+---------+   (fix: ORDER BY day, id with ROWS frame)`],
        [`<b>Limitations:</b> a cumulative total over a table of tens of millions of rows must sort and buffer each partition; results are not stored, so repeated dashboards recompute them; and a window result cannot be used in WHERE without a wrapper query.`,
            r`-- Filter on a running total: wrap it
SELECT * FROM (
  SELECT id, SUM(amount) OVER (ORDER BY day, id) AS balance FROM tx
) b
WHERE balance > 100;

-- OUTPUT:
-- +----+---------+
-- | id | balance |
-- +----+---------+
-- |  3 |     120 |
-- |  4 |     140 |
-- +----+---------+`],
        `
   amount:     100    -30     50     20
   frame:      [100]  [100,-30] [100,-30,50] [100,-30,50,20]
   SUM (run):  100     70     120    140

   moving average, 3-row frame:
   units:   10   20   30   40   20
            [10]                         -> 10
            [10 20]                      -> 15
            [10 20 30]                   -> 20
                 [20 30 40]              -> 30
                      [30 40 20]         -> 30
`,
        `For dashboards over big history, precompute daily aggregates into a summary table and apply windows on that small table instead of the raw fact table. Always order by a unique key with ROWS frames for reproducibility, store monetary values as DECIMAL or integer minor units, and decide explicitly how to treat the partial window at the start of the series.`
    ),

    'Top-N per Group': dd(
        [`"Top-N per group" (best 3 products in each category, latest order per customer) is the most common window-function interview and production pattern: rank rows inside each partition with <code>ROW_NUMBER</code>/<code>RANK</code>/<code>DENSE_RANK</code>, then filter on the rank in an outer query or CTE.`,
            r`CREATE TABLE products (id INT PRIMARY KEY, category VARCHAR(10), name VARCHAR(10), sales INT);
INSERT INTO products VALUES
 (1,'Phone','P1',500),(2,'Phone','P2',900),(3,'Phone','P3',700),(4,'Phone','P4',100),
 (5,'Laptop','L1',300),(6,'Laptop','L2',800);

WITH ranked AS (
  SELECT category, name, sales,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) AS rn   -- rank per category
  FROM products
)
SELECT category, name, sales, rn
FROM   ranked
WHERE  rn <= 2                                  -- top 2 in each category
ORDER  BY category, rn;

-- OUTPUT:
-- +----------+------+-------+----+
-- | category | name | sales | rn |
-- +----------+------+-------+----+
-- | Laptop   | L2   |   800 |  1 |
-- | Laptop   | L1   |   300 |  2 |
-- | Phone    | P2   |   900 |  1 |
-- | Phone    | P3   |   700 |  2 |
-- +----------+------+-------+----+`],
        [`<code>LIMIT</code> applies to the whole result, not to each group. Before 8.0 people used self-joins counting greater rows, or variables; both are slow or unreliable. Window functions express the intent directly.`,
            r`-- LIMIT 2 gives the top 2 overall - NOT per category
SELECT category, name, sales FROM products ORDER BY sales DESC LIMIT 2;

-- OUTPUT:
-- +----------+------+-------+
-- | category | name | sales |
-- +----------+------+-------+
-- | Phone    | P2   |   900 |
-- | Laptop   | L2   |   800 |
-- +----------+------+-------+`],
        [`Real use: the top 3 customers per region, each user's most recent login, the highest-paid employee per department, newest 5 comments per post for a feed.`,
            r`-- Latest row per group (N = 1) with ties kept: use RANK or DENSE_RANK instead of ROW_NUMBER
SELECT category, name, sales
FROM  (SELECT *, RANK() OVER (PARTITION BY category ORDER BY sales DESC) AS rk FROM products) t
WHERE rk = 1
ORDER BY category;

-- OUTPUT:
-- +----------+------+-------+
-- | category | name | sales |
-- +----------+------+-------+
-- | Laptop   | L2   |   800 |
-- | Phone    | P2   |   900 |
-- +----------+------+-------+`],
        [`<b>Advantages:</b> one table scan, controllable tie behaviour (ROW_NUMBER exactly N rows, RANK/DENSE_RANK keep ties), works with any N, and is easy to modify.`,
            r`-- Tie-aware version: DENSE_RANK <= 2 returns every row tied inside the top 2 distinct scores
CREATE TABLE s (g CHAR(1), v INT);
INSERT INTO s VALUES ('x',10),('x',10),('x',9),('x',5);
SELECT g, v FROM (SELECT g, v, DENSE_RANK() OVER (PARTITION BY g ORDER BY v DESC) AS d FROM s) t
WHERE d <= 2;

-- OUTPUT:
-- +---+----+
-- | g | v  |
-- +---+----+
-- | x | 10 |
-- | x | 10 |
-- | x |  9 |
-- +---+----+`],
        [`<b>Disadvantages:</b> ranks every row before filtering, so on a huge table it sorts all partitions even when you want only 3 per group. A lateral join or a loop over the group table can be faster when the groups are few and indexed.`,
            r`-- MySQL 8.0.14+ alternative: LATERAL derived table with LIMIT per group (index-friendly)
CREATE TABLE cats (category VARCHAR(10) PRIMARY KEY);
INSERT INTO cats SELECT DISTINCT category FROM products;

SELECT c.category, p.name, p.sales
FROM   cats c
JOIN   LATERAL (SELECT name, sales FROM products x
                WHERE x.category = c.category
                ORDER BY sales DESC LIMIT 2) p       -- LIMIT applies per category
ORDER  BY c.category, p.sales DESC;

-- OUTPUT:
-- +----------+------+-------+
-- | category | name | sales |
-- +----------+------+-------+
-- | Laptop   | L2   |   800 |
-- | Laptop   | L1   |   300 |
-- | Phone    | P2   |   900 |
-- | Phone    | P3   |   700 |
-- +----------+------+-------+`],
        [`<b>Limitations:</b> the rank cannot be filtered in the same query level (wrap with a CTE or derived table); ROW_NUMBER picks arbitrary rows among ties unless you add a tie-breaker; and a missing supporting index forces a filesort of the whole table.`,
            r`-- Add a deterministic tie-breaker and a supporting index
CREATE INDEX idx_cat_sales ON products (category, sales DESC, id);   -- 8.0 supports DESC indexes
SELECT category, name, sales
FROM  (SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC, id) AS rn FROM products) t
WHERE rn = 1 ORDER BY category;

-- OUTPUT:
-- +----------+------+-------+
-- | category | name | sales |
-- +----------+------+-------+
-- | Laptop   | L2   |   800 |
-- | Phone    | P2   |   900 |
-- +----------+------+-------+`],
        `
   products
   +-----------------------------+      PARTITION BY category
   | Phone  P2 900  -> rn 1  keep|      ORDER BY sales DESC
   | Phone  P3 700  -> rn 2  keep|
   | Phone  P1 500  -> rn 3  drop|      WHERE rn <= 2
   | Phone  P4 100  -> rn 4  drop|
   | Laptop L2 800  -> rn 1  keep|
   | Laptop L1 300  -> rn 2  keep|
   +-----------------------------+
`,
        `Default to ROW_NUMBER in a CTE with a unique tie-breaker and a composite index (group, sort_col DESC, id). If the group count is small relative to rows and N is tiny, test the LATERAL ... LIMIT form, which can stop early per group. Decide on tie semantics as a product requirement (exactly N rows vs all ties) and document it, since RANK and ROW_NUMBER return different counts.`
    ),
};
