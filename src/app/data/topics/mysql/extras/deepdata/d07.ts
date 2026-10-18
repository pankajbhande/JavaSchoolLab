// Deep dive, modules 17-18 (Indexes, Query Optimization).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d07: Record<string, Deep> = {
    'What is an Index?': dv(
        [`An index is a separate B-tree keyed by the indexed columns, whose entries point to rows. Without it the engine reads every row (a table scan). With it the engine descends 3-4 pages to the first match and then reads neighbouring entries in sorted order, which is why indexes serve equality, ranges, ordering and grouping.`,
            r`CREATE TABLE people (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(80), city VARCHAR(30), age INT);
-- 1,000,000 rows loaded
EXPLAIN SELECT id FROM people WHERE email = 'a@x.com';
CREATE INDEX idx_email ON people (email);
EXPLAIN SELECT id FROM people WHERE email = 'a@x.com';

-- OUTPUT: (example)
-- before: type=ALL  rows=998000 key=NULL
-- after : type=ref  rows=1      key=idx_email`],
        [`Create indexes with CREATE INDEX, ALTER TABLE ADD INDEX, or inline. Variants: UNIQUE, composite, prefix, descending, functional, FULLTEXT, SPATIAL, and INVISIBLE indexes (8.0) that the optimizer ignores so you can test dropping safely.`,
            r`CREATE INDEX idx_city_age ON people (city, age DESC);
ALTER TABLE people ADD UNIQUE INDEX uq_email (email);
CREATE INDEX idx_lower_email ON people ((LOWER(email)));
ALTER TABLE people ALTER INDEX idx_city_age INVISIBLE;        -- test: queries behave as if it were dropped
ALTER TABLE people ALTER INDEX idx_city_age VISIBLE;
SHOW INDEX FROM people;

-- OUTPUT:
-- Query OK, 0 rows affected (x5)`],
        [`Mistakes: indexing every column, indexing low-selectivity flags alone, duplicate and redundant indexes, and functions on the indexed column in queries. Each index slows writes and uses memory; find waste with the sys schema.`,
            r`SELECT table_name, redundant_index_name, dominant_index_name FROM sys.schema_redundant_indexes WHERE table_schema = 'shop';
SELECT object_name, index_name FROM sys.schema_unused_indexes WHERE object_schema = 'shop';

-- OUTPUT: (example)
-- table_name | redundant_index_name | dominant_index_name
-- orders     | idx_customer         | idx_customer_created
-- object_name | index_name
-- people      | idx_old_city`],
        [`Indexes cost write time: every INSERT, DELETE and indexed UPDATE maintains each index. Measure bulk insert speed with and without secondary indexes, and add indexes after large loads.`,
            r`-- 1M rows: no secondary index ~ 8 s; 5 secondary indexes ~ 31 s
SELECT COUNT(*) AS index_count FROM information_schema.statistics WHERE table_schema = 'shop' AND table_name = 'people';
SHOW STATUS LIKE 'Innodb_rows_inserted';

-- OUTPUT:
-- index_count
-- 6`],
        [`Real-world method: collect the top queries by total time, design one composite index per access pattern, test it as INVISIBLE or on a copy, compare EXPLAIN ANALYZE, then roll out with online DDL.`,
            r`ALTER TABLE orders ADD INDEX idx_cust_status_created (customer_id, status, created_at), ALGORITHM=INPLACE, LOCK=NONE;
EXPLAIN ANALYZE SELECT id FROM orders WHERE customer_id = 7 AND status = 'NEW' ORDER BY created_at DESC LIMIT 20;

-- OUTPUT: (example)
-- -> Index lookup on orders using idx_cust_status_created (customer_id=7, status='NEW') (reverse)  (actual time=0.04..0.1 rows=20)`]
    ),

    'B-Tree Indexes': dv(
        [`An InnoDB index is a B+tree of 16 KB pages: internal pages hold keys and child pointers, leaf pages hold entries and are chained left to right. A page with 8-byte keys holds hundreds of entries, so a 100-million-row table needs only about 4 levels. Range scans walk the leaf chain without going back up.`,
            r`SELECT index_name, stat_name, stat_value, stat_description FROM mysql.innodb_index_stats WHERE database_name = 'shop' AND table_name = 'orders' AND stat_name IN ('n_leaf_pages','size');
SELECT CEIL(LOG(100000000) / LOG(400)) AS approx_levels_for_100m_rows;

-- OUTPUT: (example)
-- index_name | stat_name    | stat_value
-- PRIMARY    | n_leaf_pages |      22000
-- approx_levels_for_100m_rows
-- 4`],
        [`A B-tree supports equality, ranges, prefix LIKE, ORDER BY, MIN/MAX, and the leftmost prefix of composite keys. It does not help with suffix or contains LIKE, with functions on the column, or with conditions that skip the leading column.`,
            r`EXPLAIN SELECT id FROM orders WHERE created_at BETWEEN '2026-05-01' AND '2026-05-07';          -- range: yes
EXPLAIN SELECT id FROM customers WHERE name LIKE 'As%';                                           -- prefix: yes
EXPLAIN SELECT id FROM customers WHERE name LIKE '%sha';                                          -- suffix: no seek
EXPLAIN SELECT MIN(created_at) FROM orders;                                                       -- index end: instant

-- OUTPUT: (example)
-- range / range / index (full index scan) / Select tables optimized away`],
        [`Mistakes: random keys (UUIDv4) causing page splits and fragmentation, very wide keys lowering fan-out, and never rebuilding indexes after heavy churn. Watch page fill and rebuild when needed.`,
            r`SELECT table_name, ROUND(data_free / 1048576) AS free_mb, ROUND(data_length / 1048576) AS data_mb FROM information_schema.tables WHERE table_schema = 'shop' ORDER BY data_free DESC LIMIT 2;
ALTER TABLE events ENGINE = InnoDB;          -- rebuild table and indexes online

-- OUTPUT: (example)
-- table_name | free_mb | data_mb
-- events     |    4200 |   11000`],
        [`The buffer pool caches index pages. A hot index that fits in memory makes lookups cost zero disk reads. Compare the index size to the pool and check hit rates.`,
            r`SELECT ROUND(SUM(stat_value) * @@innodb_page_size / 1073741824, 2) AS index_gb FROM mysql.innodb_index_stats WHERE database_name = 'shop' AND stat_name = 'size';
SELECT @@innodb_buffer_pool_size / 1073741824 AS pool_gb;

-- OUTPUT:
-- index_gb
-- 18.40
-- pool_gb
-- 24.0000          (all indexes fit: lookups are served from memory)`],
        [`Real-world: monotonic keys such as auto-increment ids and time-ordered UUIDs append at the right edge, keep pages full and make bulk insert fast; plan the key type to match the access pattern.`,
            r`SHOW STATUS LIKE 'Innodb_buffer_pool_pages_dirty';
SELECT table_name, ROUND(index_length / data_length, 2) AS idx_to_data_ratio FROM information_schema.tables WHERE table_name IN ('orders_seq','orders_uuid4');

-- OUTPUT: (example)
-- table_name   | idx_to_data_ratio
-- orders_seq   | 0.44
-- orders_uuid4 | 0.88`]
    ),

    'Clustered vs Secondary Index': dv(
        [`In InnoDB the table is the clustered index: its leaf pages hold full rows ordered by the primary key. A secondary index leaf holds its key columns plus the primary key. A query that needs other columns first finds the primary key in the secondary index, then performs a lookup in the clustered index (a "bookmark lookup").`,
            r`CREATE TABLE ord (id BIGINT PRIMARY KEY, customer_id INT, total DECIMAL(10,2), note VARCHAR(200), KEY idx_customer (customer_id));
EXPLAIN SELECT id FROM ord WHERE customer_id = 7;
EXPLAIN SELECT total FROM ord WHERE customer_id = 7;

-- OUTPUT: (example)
-- first : key=idx_customer Extra=Using index       (id is stored in the secondary index entry)
-- second: key=idx_customer Extra=NULL              (extra lookup per row to read total)`],
        [`Control the cost of lookups: choose a small primary key, add covering secondary indexes for hot queries, and use deferred joins when a query selects wide rows after sorting by a narrow index.`,
            r`ALTER TABLE ord ADD INDEX idx_customer_total (customer_id, total);
EXPLAIN SELECT total FROM ord WHERE customer_id = 7;
SELECT o.* FROM ord o JOIN (SELECT id FROM ord WHERE customer_id = 7 ORDER BY total DESC LIMIT 20) x ON x.id = o.id;

-- OUTPUT: (example)
-- Extra=Using index              (no clustered lookup needed)`],
        [`Mistakes: wide or random primary keys (copied into every secondary index), updating primary key values, and expecting a secondary index scan to be cheap when it returns a large fraction of rows (many random lookups). The optimizer then prefers a table scan.`,
            r`EXPLAIN SELECT * FROM ord WHERE customer_id BETWEEN 1 AND 90000;     -- most of the table: scan chosen
EXPLAIN SELECT * FROM ord FORCE INDEX (idx_customer) WHERE customer_id BETWEEN 1 AND 90000;

-- OUTPUT: (example)
-- first : type=ALL                (cheaper than 800k bookmark lookups)
-- second: type=range              (much slower in practice)`],
        [`Check how many bytes each secondary index entry carries and whether a covering index is worth it: if the extra columns are small, covering removes the random reads.`,
            r`SELECT index_name, ROUND(SUM(stat_value) * @@innodb_page_size / 1048576) AS mb FROM mysql.innodb_index_stats WHERE database_name = 'shop' AND table_name = 'ord' AND stat_name = 'size' GROUP BY index_name;

-- OUTPUT: (example)
-- index_name         | mb
-- PRIMARY            | 520
-- idx_customer       | 120
-- idx_customer_total | 150`],
        [`Real-world: a feed query returns many columns but sorts by a narrow key. Fetch ids from the narrow covering index, then fetch rows by primary key, reducing random I/O.`,
            r`SELECT p.id, p.title, p.body FROM posts p JOIN (SELECT id FROM posts WHERE user_id = 7 ORDER BY created_at DESC, id DESC LIMIT 20) x ON x.id = p.id ORDER BY p.created_at DESC, p.id DESC;

-- OUTPUT:
-- id | title | body
-- 88 | ...   | ...`]
    ),

    'Composite Index & Leftmost Prefix': dv(
        [`A composite index sorts entries by the first column, then by the second within equal first values, and so on. A lookup can seek only through a prefix of those columns: equality on leading columns, then at most one range. Columns after a range column are used for filtering inside the scanned range, not for seeking.`,
            r`CREATE TABLE emp (id INT PRIMARY KEY, last_name VARCHAR(30), first_name VARCHAR(30), city VARCHAR(30), KEY idx_name_city (last_name, first_name, city));
EXPLAIN SELECT id FROM emp WHERE last_name = 'Rao' AND first_name = 'Abaji';
EXPLAIN SELECT id FROM emp WHERE first_name = 'Abaji';
EXPLAIN SELECT id FROM emp WHERE last_name = 'Rao' AND city = 'Pune';

-- OUTPUT: (example)
-- first : type=ref   key_len=...(2 columns used)
-- second: type=index (full index scan, leading column missing)
-- third : type=ref   uses only last_name for seeking; city is filtered`],
        [`Rules of thumb for ordering columns: equality predicates first, then the range column, then ORDER BY columns; put the most selective equality first only when queries differ. MySQL 8.0.13+ may use skip scan when the leading column has few values.`,
            r`ALTER TABLE orders ADD INDEX idx_cust_status_created (customer_id, status, created_at);
EXPLAIN SELECT id FROM orders WHERE customer_id = 7 AND status = 'PAID' AND created_at >= '2026-05-01' ORDER BY created_at;
EXPLAIN SELECT id FROM orders WHERE customer_id = 7 AND status IN ('NEW','PAID') ORDER BY created_at;

-- OUTPUT: (example)
-- first : type=range  key_len covers all three columns, no filesort
-- second: type=range  but ORDER BY created_at needs a sort across the two status ranges (Using filesort)`],
        [`Mistakes: wrong column order, many overlapping indexes, and a range column placed before equality columns. Remove indexes that are prefixes of others: (a) is redundant when (a,b) exists.`,
            r`SELECT table_name, redundant_index_name, dominant_index_name FROM sys.schema_redundant_indexes WHERE table_schema = 'shop';
ALTER TABLE orders DROP INDEX idx_customer;          -- covered by idx_cust_status_created

-- OUTPUT:
-- table_name | redundant_index_name | dominant_index_name
-- orders     | idx_customer         | idx_cust_status_created`],
        [`Sorting through the index removes filesort. The index must match the equality columns, then the ORDER BY columns in the same direction (or all reversed).`,
            r`EXPLAIN SELECT id FROM orders WHERE customer_id = 7 AND status = 'NEW' ORDER BY created_at DESC LIMIT 20;
CREATE INDEX idx_mixed ON orders (customer_id, status, created_at DESC, id ASC);

-- OUTPUT: (example)
-- type | key                     | Extra
-- ref  | idx_cust_status_created | Backward index scan`],
        [`Real-world: design the index from the query, not from the table. For the order history screen "my orders by status, newest first" the index (customer_id, status, created_at, id) serves list, count and keyset pagination.`,
            r`SELECT id, total, created_at FROM orders WHERE customer_id = 7 AND status = 'PAID' AND (created_at, id) < ('2026-05-01', 9120) ORDER BY created_at DESC, id DESC LIMIT 20;

-- OUTPUT:
-- id   | total  | created_at
-- 9118 | 450.00 | 2026-04-30 09:58:11`]
    ),

    'Unique & Prefix Indexes': dv(
        [`A unique index is a B-tree that also rejects duplicate keys. A prefix index stores only the first N characters (or bytes) of a string column, making the index much smaller; entries with the same prefix are then compared on the full value in the row, so selectivity depends on how distinct the prefixes are.`,
            r`SELECT COUNT(DISTINCT title) AS full_cnt, COUNT(DISTINCT LEFT(title, 8)) AS p8, COUNT(DISTINCT LEFT(title, 16)) AS p16, COUNT(DISTINCT LEFT(title, 24)) AS p24 FROM posts;
CREATE INDEX idx_title16 ON posts (title(16));

-- OUTPUT: (example)
-- full_cnt | p8     | p16    | p24
--   980000 | 640000 | 951000 | 976000       (16 chars gives ~97% of the full selectivity)`],
        [`Uses: UNIQUE for business rules; prefix indexes for long VARCHAR/TEXT; hash columns for very long strings; functional unique indexes for case-insensitive rules. Prefix indexes cannot cover queries or serve ORDER BY on the whole value.`,
            r`CREATE UNIQUE INDEX uq_slug ON articles (slug);
CREATE INDEX idx_body_prefix ON articles (body(100));
ALTER TABLE links ADD COLUMN url_hash BINARY(32) AS (UNHEX(SHA2(url, 256))) STORED, ADD INDEX idx_url_hash (url_hash);
SELECT id FROM links WHERE url_hash = UNHEX(SHA2('https://example.com/a', 256)) AND url = 'https://example.com/a';

-- OUTPUT:
-- id
-- 17`],
        [`Mistakes: UNIQUE on a prefix (different values rejected as duplicates), index key length over the limit (3072 bytes in InnoDB DYNAMIC rows), and a prefix too short to be selective.`,
            r`CREATE TABLE u (v VARCHAR(50), UNIQUE KEY uq_prefix (v(5)));
INSERT INTO u VALUES ('abcdef1'), ('abcdef2');
CREATE INDEX idx_wide ON big_text (a(3000), b(3000));

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'abcde' for key 'u.uq_prefix'
-- ERROR 1071 (42000): Specified key was too long; max key length is 3072 bytes`],
        [`Smaller keys mean more entries per page, a shallower tree and a smaller buffer pool footprint. Measure index size before and after shortening.`,
            r`SELECT index_name, ROUND(SUM(stat_value) * @@innodb_page_size / 1048576) AS mb FROM mysql.innodb_index_stats WHERE table_name = 'posts' AND stat_name = 'size' GROUP BY index_name;

-- OUTPUT: (example)
-- index_name  | mb
-- idx_title   | 410          (full VARCHAR(255) utf8mb4)
-- idx_title16 |  62`],
        [`Real-world: deduplicating imported URLs or documents uses a hash unique key, so equality lookups are tiny and exact, and collisions are checked by comparing the full value.`,
            r`CREATE TABLE seen_urls (id BIGINT PRIMARY KEY AUTO_INCREMENT, url TEXT NOT NULL, url_hash BINARY(32) AS (UNHEX(SHA2(url, 256))) STORED, UNIQUE KEY uq_hash (url_hash));
INSERT IGNORE INTO seen_urls (url) VALUES ('https://example.com/a'), ('https://example.com/a');
SELECT COUNT(*) FROM seen_urls;

-- OUTPUT:
-- COUNT(*)
-- 1`]
    ),

    'Full-Text & Spatial Indexes': dv(
        [`A FULLTEXT index stores an inverted index: for each word (token) a list of document ids and positions, with relevance statistics. MATCH AGAINST looks tokens up directly instead of scanning text. A SPATIAL index is an R-tree over minimum bounding rectangles, so geometric queries visit only nearby boxes.`,
            r`CREATE TABLE docs (id INT PRIMARY KEY, title VARCHAR(100), body TEXT, FULLTEXT KEY ft_docs (title, body));
INSERT INTO docs VALUES (1,'MySQL indexes','B-tree and hash indexes'),(2,'Cooking','pasta recipes');
SELECT id, title, MATCH(title, body) AGAINST ('indexes') AS score FROM docs WHERE MATCH(title, body) AGAINST ('indexes');

-- OUTPUT:
-- id | title         | score
--  1 | MySQL indexes | 0.62`],
        [`FULLTEXT modes: natural language, boolean (+must -not "phrase" prefix*), and query expansion; token size and stop words are configurable; the ngram parser handles CJK. Spatial: POINT/POLYGON columns with SRID and functions like ST_Distance_Sphere and ST_Contains.`,
            r`SELECT id FROM docs WHERE MATCH(title, body) AGAINST ('+mysql -pasta "hash indexes"' IN BOOLEAN MODE);
CREATE TABLE shops (id INT PRIMARY KEY, loc POINT NOT NULL SRID 4326, SPATIAL INDEX idx_loc (loc));
SELECT id FROM shops WHERE ST_Distance_Sphere(loc, ST_SRID(POINT(18.52, 73.85), 4326)) < 2000;

-- OUTPUT:
-- id
-- 1`],
        [`Mistakes: expecting FULLTEXT to find short or stop words, using LIKE '%x%' for word search, putting geometry into non-indexed columns, and ignoring SRID (distance results differ). Check <code>innodb_ft_min_token_size</code>.`,
            r`SHOW VARIABLES LIKE 'innodb_ft_min_token_size';
SELECT id FROM docs WHERE MATCH(title, body) AGAINST ('db');     -- 2-letter word: not indexed with token size 3

-- OUTPUT:
-- Variable_name            | Value
-- innodb_ft_min_token_size | 3
-- Empty set`],
        [`Bulk-load first and create the FULLTEXT index afterwards, since building it row by row is slow. For nearby searches prefilter with a bounding box so the R-tree is used before the exact distance function.`,
            r`SELECT id FROM shops WHERE MBRContains(ST_Buffer(ST_SRID(POINT(18.52, 73.85), 4326), 0.02), loc)
  AND ST_Distance_Sphere(loc, ST_SRID(POINT(18.52, 73.85), 4326)) < 2000;

-- OUTPUT:
-- id
-- 1`],
        [`Real-world: a help-centre search with FULLTEXT ranking, restricted to published articles, and a "stores near me" query using the spatial index.`,
            r`SELECT id, title, MATCH(title, body) AGAINST ('refund policy') AS score FROM articles WHERE status = 'PUBLISHED' AND MATCH(title, body) AGAINST ('refund policy') ORDER BY score DESC LIMIT 5;

-- OUTPUT:
-- id | title            | score
-- 12 | Refund policy    | 3.4`]
    ),

    'Covering Index': dv(
        [`When every column a query needs is in one secondary index, InnoDB answers it from the index leaf pages alone, with no clustered index lookup. Secondary indexes already include the primary key, so selecting the primary key is free. EXPLAIN shows "Using index".`,
            r`CREATE TABLE orders2 (id BIGINT PRIMARY KEY, customer_id INT, status VARCHAR(10), total DECIMAL(10,2), note TEXT, KEY idx_cov (customer_id, status, total));
EXPLAIN SELECT id, status, total FROM orders2 WHERE customer_id = 7;
EXPLAIN SELECT id, note FROM orders2 WHERE customer_id = 7;

-- OUTPUT: (example)
-- first : key=idx_cov Extra=Using index
-- second: key=idx_cov Extra=NULL`],
        [`Order columns: equality filters first, then range/order columns, then payload columns at the end. MySQL has no INCLUDE columns, so payload columns become part of the key. Keep it narrow and only for hot queries.`,
            r`ALTER TABLE orders2 ADD INDEX idx_list (customer_id, status, id, total);
EXPLAIN SELECT id, total FROM orders2 WHERE customer_id = 7 AND status = 'PAID' ORDER BY id DESC LIMIT 20;

-- OUTPUT: (example)
-- type | key      | Extra
-- ref  | idx_list | Backward index scan; Using index`],
        [`Mistakes: covering indexes with TEXT/BLOB columns (cannot), many wide covering indexes that slow writes and fill memory, and selecting extra columns that silently break the coverage. Select exactly what you cover.`,
            r`EXPLAIN SELECT * FROM orders2 WHERE customer_id = 7;                 -- not covered
EXPLAIN SELECT id, status, total FROM orders2 WHERE customer_id = 7;  -- covered

-- OUTPUT: (example)
-- first : Extra=NULL (bookmark lookups)       second: Extra=Using index`],
        [`Covering indexes shine for list pages, existence checks and counts. Compare rows read and time with EXPLAIN ANALYZE.`,
            r`EXPLAIN ANALYZE SELECT COUNT(*) FROM orders2 WHERE customer_id = 7 AND status = 'PAID';

-- OUTPUT: (example)
-- -> Aggregate: count(0)  -> Covering index lookup on orders2 using idx_cov (customer_id=7, status='PAID')  (actual time=0.03..0.2 rows=40)`],
        [`Real-world: an autocomplete or lookup endpoint that returns two columns for thousands of requests per second. A narrow covering index keeps it entirely in memory.`,
            r`ALTER TABLE products ADD INDEX idx_search (category_id, active, name, id);
SELECT id, name FROM products WHERE category_id = 5 AND active = 1 AND name LIKE 'pe%' ORDER BY name LIMIT 10;

-- OUTPUT:
-- id | name
--  7 | Pen`]
    ),

    'Index Selectivity & Cardinality': dv(
        [`Cardinality is the estimated number of distinct values in an index; selectivity is cardinality divided by rows. InnoDB estimates cardinality by sampling pages (persistent statistics), and the optimizer uses it to estimate how many rows a lookup returns and whether using the index is cheaper than scanning.`,
            r`ANALYZE TABLE orders;
SELECT index_name, column_name, cardinality FROM information_schema.statistics WHERE table_name = 'orders' ORDER BY index_name, seq_in_index;

-- OUTPUT: (example)
-- index_name   | column_name | cardinality
-- PRIMARY      | id          |     1800000
-- idx_customer | customer_id |      410000
-- idx_status   | status      |           5`],
        [`Tools: ANALYZE TABLE (refresh statistics), sample page settings, and histograms (8.0) for columns without indexes or with skewed values. Histograms tell the optimizer how values are distributed.`,
            r`ANALYZE TABLE orders UPDATE HISTOGRAM ON status, channel WITH 16 BUCKETS;
SELECT column_name, JSON_EXTRACT(histogram, '$.sampling-rate') AS rate, JSON_EXTRACT(histogram, '$."number-of-buckets-specified"') AS buckets FROM information_schema.column_statistics WHERE table_name = 'orders';

-- OUTPUT:
-- column_name | rate | buckets
-- status      | 1.0  | 16`],
        [`Mistakes: judging an index by cardinality alone (skew matters), stale statistics after a bulk load, and indexing booleans. A value matching 90% of rows is better scanned; a value matching 0.1% is a great index lookup even on a low-cardinality column.`,
            r`SELECT status, COUNT(*) AS n, ROUND(100 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct FROM orders GROUP BY status;
EXPLAIN SELECT id FROM orders WHERE status = 'DONE';
EXPLAIN SELECT id FROM orders WHERE status = 'DISPUTED';

-- OUTPUT: (example)
-- DONE 91.2%: type=ALL      DISPUTED 0.03%: type=ref key=idx_status`],
        [`Wrong estimates cause wrong join orders. Compare estimated and actual rows in EXPLAIN ANALYZE; a big gap means refresh statistics, add a histogram or an index.`,
            r`EXPLAIN ANALYZE SELECT COUNT(*) FROM orders WHERE channel = 'APP' AND status = 'NEW';

-- OUTPUT: (example)
-- -> Filter: ((orders.channel = 'APP') and (orders.status = 'NEW'))  (cost=185000 rows=9000) (actual time=0.1..380 rows=210 loops=1)
-- estimate 9000 vs actual 210: correlated columns, consider a composite index or histogram`],
        [`Real-world: after a large import the optimizer chose a bad plan until statistics were refreshed. Make ANALYZE TABLE part of the load procedure.`,
            r`LOAD DATA LOCAL INFILE '/data/orders.csv' INTO TABLE orders FIELDS TERMINATED BY ',';
ANALYZE TABLE orders, order_items;
SET GLOBAL innodb_stats_persistent_sample_pages = 100;

-- OUTPUT:
-- Table        | Op      | Msg_type | Msg_text
-- shop.orders  | analyze | status   | OK`]
    ),

    'EXPLAIN': dv(
        [`EXPLAIN shows the plan the optimizer would use without running the query: the table order, access type, candidate and chosen keys, key length used, estimated rows and filter percentage, and Extra notes. Read it from the first row (driving table) downward.`,
            r`EXPLAIN SELECT o.id, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.created_at >= '2026-05-01' AND c.country = 'IN';

-- OUTPUT: (example)
-- id | select_type | table | type   | possible_keys | key         | key_len | rows  | filtered | Extra
--  1 | SIMPLE      | o     | range  | idx_created   | idx_created | 5       | 51000 |   100.00 | Using index condition
--  1 | SIMPLE      | c     | eq_ref | PRIMARY       | PRIMARY     | 8       |     1 |    10.00 | Using where`],
        [`Formats: tabular, <code>FORMAT=TREE</code> (iterator tree), <code>FORMAT=JSON</code> (costs and used columns), and <code>EXPLAIN ANALYZE</code> (actual execution). Access types from best to worst: system, const, eq_ref, ref, range, index, ALL.`,
            r`EXPLAIN FORMAT=TREE SELECT * FROM orders WHERE customer_id = 7;
EXPLAIN FORMAT=JSON SELECT * FROM orders WHERE customer_id = 7\G
EXPLAIN FOR CONNECTION 31;          -- plan of a running statement

-- OUTPUT: (example)
-- -> Index lookup on orders using idx_customer (customer_id=7)  (cost=1.4 rows=12)`],
        [`Mistakes: trusting estimated rows blindly, ignoring key_len (shows how many index columns are really used), missing "Using filesort/temporary", and testing on tiny data where a scan looks fine. Test with production-sized data.`,
            r`EXPLAIN SELECT id FROM orders WHERE customer_id = 7 AND status = 'NEW' AND created_at > '2026-05-01';
-- key_len 8   => only customer_id used
-- key_len 8+32 => customer_id and status used

-- OUTPUT: (example)
-- key=idx_cust_status_created  key_len=47  (the three columns are used)`],
        [`Use EXPLAIN to find the fix pattern: full scan means missing or unusable index; filesort means order not served; temporary means grouping not served; big rows x filtered means a poor predicate order. Re-run after each change.`,
            r`EXPLAIN SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY COUNT(*) DESC;
ALTER TABLE orders ADD INDEX idx_status (status);
EXPLAIN SELECT status, COUNT(*) FROM orders GROUP BY status ORDER BY COUNT(*) DESC;

-- OUTPUT: (example)
-- before: type=ALL   Extra=Using temporary; Using filesort
-- after : type=index key=idx_status Extra=Using index; Using temporary; Using filesort (small result)`],
        [`Real-world: add an EXPLAIN check in code review for every new query on a big table, and keep the plan in the pull request. Plans change as data grows, so recheck periodically from the digest.`,
            r`SELECT digest_text, count_star, avg_timer_wait/1e9 AS avg_ms FROM performance_schema.events_statements_summary_by_digest ORDER BY sum_timer_wait DESC LIMIT 1;
EXPLAIN SELECT ... ;      -- paste the digest query with real parameters

-- OUTPUT: (example)
-- digest_text                          | count_star | avg_ms
-- SELECT ... FROM orders WHERE ...     |     912000 | 3.2`]
    ),

    'EXPLAIN ANALYZE': dv(
        [`EXPLAIN ANALYZE executes the query and reports, for each iterator node, the estimated cost and rows next to the actual first-row time, last-row time, rows returned and number of loops. Actual rows multiplied by loops is the real work done by that node.`,
            r`EXPLAIN ANALYZE SELECT c.name, COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id WHERE o.status = 'NEW' GROUP BY c.id;

-- OUTPUT: (example)
-- -> Group aggregate: count(0)  (actual time=3.4..3.6 rows=95 loops=1)
--    -> Nested loop inner join  (cost=1.2 rows=120) (actual time=0.1..3.2 rows=120 loops=1)
--       -> Index lookup on o using idx_status (status='NEW')  (rows=120) (actual time=0.05..0.9 rows=120 loops=1)
--       -> Single-row index lookup on c using PRIMARY (id=o.customer_id)  (actual time=0.01..0.01 rows=1 loops=120)`],
        [`Because it runs the statement, wrap DML in a transaction and roll back. Read nodes bottom-up for data flow; compare cost estimates with actual rows to see where the optimizer was wrong.`,
            r`START TRANSACTION;
EXPLAIN ANALYZE UPDATE orders SET status = 'DONE' WHERE status = 'NEW' AND created_at < '2026-01-01';
ROLLBACK;
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 7 ORDER BY created_at DESC LIMIT 20;

-- OUTPUT: (example)
-- -> Update orders (rows=0) (actual time=210..210 rows=0 loops=1)   ...`],
        [`Mistakes: running it on a production primary during peak, testing DML without rollback, comparing cold-cache and warm-cache runs, and reading only the top line. Run twice, discard the first, compare actual rows.`,
            r`-- bad: unexpected change on production
EXPLAIN ANALYZE DELETE FROM sessions WHERE expires_at < NOW();
-- good: replica or transaction + rollback
START TRANSACTION; EXPLAIN ANALYZE DELETE FROM sessions WHERE expires_at < NOW(); ROLLBACK;

-- OUTPUT:
-- (the delete executed but was rolled back)`],
        [`Look for the node where actual time jumps, estimated and actual rows differ greatly, or loops are large. Fixes: add an index, rewrite the predicate, update statistics or add a histogram.`,
            r`EXPLAIN ANALYZE SELECT * FROM orders WHERE note LIKE '%refund%' ORDER BY id DESC LIMIT 20;

-- OUTPUT: (example)
-- -> Limit: 20 row(s)  (actual time=0.3..412 rows=20 loops=1)
--    -> Filter: (orders.note like '%refund%')  (cost=190000 rows=21000) (actual time=0.3..412 rows=20 loops=1)
--       -> Index scan on orders using PRIMARY (reverse)  (actual time=0.1..380 rows=1100000 loops=1)`],
        [`Real-world: a regression after a release. Capture the plan with EXPLAIN ANALYZE on a replica using the exact parameters from the slow log, compare with the previous plan and fix the index or the query.`,
            r`-- parameters taken from the slow query log entry
EXPLAIN ANALYZE SELECT id, total FROM orders WHERE customer_id = 7 AND status = 'NEW' ORDER BY created_at DESC LIMIT 20;
ALTER TABLE orders ADD INDEX idx_cust_status_created (customer_id, status, created_at);

-- OUTPUT:
-- before: actual time=0.2..95  (filesort of 14000 rows)    after: actual time=0.04..0.1 rows=20`]
    ),

    'Full Table Scan vs Index Scan': dv(
        [`A full table scan (type ALL) reads every leaf page of the clustered index in order, which is fast sequential I/O. An index lookup (ref, range) jumps to specific entries and then, if needed, does random lookups into the clustered index. When a query touches a large share of the table, the sequential scan wins.`,
            r`EXPLAIN SELECT * FROM orders WHERE status = 'DONE';           -- 91% of rows
EXPLAIN SELECT * FROM orders WHERE status = 'DISPUTED';        -- 0.03% of rows

-- OUTPUT: (example)
-- first : type=ALL                 (scan is cheaper than 1.6M random lookups)
-- second: type=ref key=idx_status`],
        [`Access types: <code>const/eq_ref</code> (single row), <code>ref</code> (equality), <code>range</code>, <code>index</code> (full index scan: reads a whole index, narrower than the table) and <code>ALL</code>. Index hints and optimizer switches can steer the choice when estimates are wrong.`,
            r`SELECT COUNT(*) FROM orders;                                     -- index scan of the smallest index
EXPLAIN SELECT /*+ NO_INDEX(orders idx_status) */ id FROM orders WHERE status = 'NEW';
EXPLAIN SELECT id FROM orders USE INDEX (idx_status) WHERE status = 'NEW';
EXPLAIN SELECT id FROM orders IGNORE INDEX (idx_status) WHERE status = 'NEW';

-- OUTPUT: (example)
-- the hints change type between ALL and ref`],
        [`Mistakes: forcing an index that is not selective, assuming "index used" means fast (a full index scan is still O(n)), and ignoring predicates that make the column unusable (function, mismatched type, leading wildcard).`,
            r`EXPLAIN SELECT id FROM orders WHERE DATE(created_at) = '2026-05-01';       -- type=ALL
EXPLAIN SELECT id FROM orders WHERE created_at >= '2026-05-01' AND created_at < '2026-05-02';   -- type=range
EXPLAIN SELECT id FROM orders WHERE customer_id = '7';                       -- string to int: still fine
EXPLAIN SELECT id FROM users WHERE phone = 9876543210;                       -- VARCHAR vs INT: ALL

-- OUTPUT: (example)
-- ALL / range / ref / ALL`],
        [`Scans are right for analytics (large fractions, sequential read-ahead) and wrong for OLTP point queries. Use summary tables, partition pruning and replicas for analytics so scans do not evict hot OLTP pages.`,
            r`SELECT COUNT(*), SUM(total) FROM orders WHERE created_at >= '2026-01-01';          -- big range scan: run on a replica
SHOW STATUS LIKE 'Innodb_buffer_pool_read_ahead%';

-- OUTPUT: (example)
-- Innodb_buffer_pool_read_ahead | 912330`],
        [`Real-world: an "admin search" page does a leading-wildcard LIKE on a 50M-row table and times out. Replace it with a FULLTEXT index or a prefix search and add a mandatory filter.`,
            r`ALTER TABLE customers ADD FULLTEXT KEY ft_name_email (name, email);
SELECT id, name FROM customers WHERE MATCH(name, email) AGAINST ('+abaji*' IN BOOLEAN MODE) AND status = 'ACTIVE' LIMIT 20;

-- OUTPUT:
-- id | name
--  1 | Abaji`]
    ),

    'Join Algorithms': dv(
        [`MySQL implements joins as nested loops: for each row of the driving table it looks up matching rows in the next table. With an index on the inner column this is an index nested loop (cheap per row). Without one, MySQL 8.0.18+ uses a hash join: build a hash table of the smaller input in memory, then probe it with the other.`,
            r`EXPLAIN FORMAT=TREE SELECT COUNT(*) FROM big_a a JOIN big_b b ON b.val = a.val;
ALTER TABLE big_b ADD INDEX idx_val (val);
EXPLAIN FORMAT=TREE SELECT COUNT(*) FROM big_a a JOIN big_b b ON b.val = a.val WHERE a.id < 100;

-- OUTPUT: (example)
-- first : -> Inner hash join (b.val = a.val)  -> Table scan on b  -> Hash -> Table scan on a
-- second: -> Nested loop inner join  -> Index range scan on a  -> Index lookup on b using idx_val`],
        [`Choosing: indexes make nested loops efficient for selective OLTP joins; hash joins suit large equi-joins without indexes (reports). Memory comes from <code>join_buffer_size</code>; when exceeded the hash join spills chunks to disk.`,
            r`SET SESSION join_buffer_size = 128 * 1024 * 1024;
SELECT /*+ NO_HASH_JOIN(a, b) */ COUNT(*) FROM big_a a JOIN big_b b ON b.val = a.val;
SELECT /*+ JOIN_ORDER(small, big) */ COUNT(*) FROM small JOIN big ON big.small_id = small.id;

-- OUTPUT:
-- COUNT(*)
-- 120450889`],
        [`Mistakes: relying on hash join for latency-sensitive queries, joining on mismatched types or collations (index not usable, even hash join cannot compare efficiently), and leaving huge join buffers globally. Fix types and add the index.`,
            r`SELECT a.id FROM a JOIN b ON a.code = b.code;      -- a.code utf8mb4_0900_ai_ci, b.code utf8mb4_unicode_ci: conversion on each row
ALTER TABLE b MODIFY code VARCHAR(20) COLLATE utf8mb4_0900_ai_ci;

-- OUTPUT:
-- Query OK, 1200000 rows affected (after the change the join uses the index)`],
        [`The join order matters more than the algorithm: start from the most selective table. Statistics decide; fix them with ANALYZE, histograms or, rarely, join-order hints.`,
            r`EXPLAIN ANALYZE SELECT COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.country = 'IN' AND o.status = 'NEW';

-- OUTPUT: (example)
-- -> Nested loop inner join  (actual rows=4100 loops=1)
--     -> Index lookup on o using idx_status (status='NEW') (actual rows=9000)
--     -> Filter: (c.country = 'IN')  -> Single-row index lookup on c using PRIMARY (loops=9000)`],
        [`Real-world: a nightly report joining two 100M-row tables without a join index ran 40 minutes with block nested loop on MySQL 5.7 and 6 minutes with hash join after upgrading to 8.0.`,
            r`SELECT COUNT(*) FROM events e JOIN sessions s ON s.session_id = e.session_id WHERE e.day = '2026-05-01';
SHOW SESSION STATUS LIKE 'Handler_read_%';

-- OUTPUT: (example)
-- COUNT(*)
-- 48211034`]
    ),

    'Temporary Tables & Filesort in Plans': dv(
        [`"Using temporary" means MySQL builds an internal table to hold intermediate rows (for GROUP BY, DISTINCT, UNION, derived tables or some ORDER BY). "Using filesort" means rows are sorted by the server instead of read in index order. Small ones stay in memory (TempTable engine / sort buffer); big ones spill to disk files.`,
            r`EXPLAIN SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id ORDER BY COUNT(*) DESC;
EXPLAIN SELECT id FROM orders ORDER BY total DESC LIMIT 10;

-- OUTPUT: (example)
-- first : Extra=Using temporary; Using filesort
-- second: Extra=Using filesort   (priority queue of 10 rows: cheap)`],
        [`Settings: <code>tmp_table_size</code>, <code>max_heap_table_size</code>, <code>temptable_max_ram</code>, <code>sort_buffer_size</code>, <code>max_length_for_sort_data</code>. Counters: <code>Created_tmp_tables</code>, <code>Created_tmp_disk_tables</code>, <code>Sort_merge_passes</code>.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Created_tmp_tables','Created_tmp_disk_tables','Sort_merge_passes','Sort_range','Sort_rows');
SHOW VARIABLES LIKE 'tmp_table_size';

-- OUTPUT: (example)
-- Created_tmp_tables      | 5200811
-- Created_tmp_disk_tables |   31200
-- Sort_merge_passes       |     120`],
        [`Mistakes: sorting or grouping on TEXT columns (forces disk), ORDER BY on an expression, large OFFSET sorts, and raising memory limits globally instead of fixing the query. Add the right index or reduce the rows first.`,
            r`ALTER TABLE orders ADD INDEX idx_customer_total (customer_id, total);
EXPLAIN SELECT id, total FROM orders WHERE customer_id = 7 ORDER BY total DESC LIMIT 20;

-- OUTPUT: (example)
-- type | key                | Extra
-- ref  | idx_customer_total | Backward index scan        (no filesort)`],
        [`Find which statements create disk temporary tables and fix the worst. The digest table counts them.`,
            r`SELECT LEFT(digest_text, 70) AS q, sum_created_tmp_disk_tables AS disk_tmp, sum_sort_merge_passes AS merge_passes FROM performance_schema.events_statements_summary_by_digest ORDER BY sum_created_tmp_disk_tables DESC LIMIT 3;

-- OUTPUT: (example)
-- q                                          | disk_tmp | merge_passes
-- SELECT ... GROUP BY ... ORDER BY note      |    18200 |          0`],
        [`Real-world: a dashboard query grouped by a TEXT column created a disk temp table on every refresh. Group by a short generated column or a lookup id instead.`,
            r`ALTER TABLE tickets ADD COLUMN category_id INT NULL;
SELECT category_id, COUNT(*) FROM tickets GROUP BY category_id;        -- was GROUP BY category_text

-- OUTPUT:
-- category_id | COUNT(*)
-- 3           |     410`]
    ),

    'Cost, Cardinality & Slow Queries': dv(
        [`The optimizer assigns each plan a cost from constants for reading pages, evaluating conditions and creating temporary tables (<code>mysql.server_cost</code>, <code>mysql.engine_cost</code>), multiplied by estimated row counts. It picks the lowest cost, so wrong cardinality estimates produce slow plans even with correct indexes.`,
            r`SELECT cost_name, cost_value, default_value FROM mysql.server_cost;
EXPLAIN FORMAT=JSON SELECT * FROM orders WHERE customer_id = 7\G

-- OUTPUT: (example)
-- cost_name                  | cost_value | default_value
-- row_evaluate_cost          | NULL       | 0.1
-- disk_temptable_create_cost | NULL       | 20
-- "query_cost": "1.40"`],
        [`Find slow queries with the slow query log (<code>long_query_time</code>, <code>log_slow_extra</code>), the Performance Schema digest table, and <code>sys.statement_analysis</code>. Rank by total time (calls x average) and by rows examined per row sent.`,
            r`SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 0.5;
SELECT query, exec_count, total_latency, rows_examined_avg FROM sys.statement_analysis ORDER BY total_latency DESC LIMIT 3;

-- OUTPUT: (example)
-- query                          | exec_count | total_latency | rows_examined_avg
-- SELECT ... FROM orders WHERE   |     412000 | 15.2 min      | 18400`],
        [`Mistakes: tuning single slow queries while a frequent medium-speed query consumes the most time, ignoring Rows_examined, and measuring on a cold cache. Prioritise by total resource use.`,
            r`SELECT LEFT(digest_text, 60) AS q, count_star, ROUND(sum_timer_wait/1e12, 1) AS total_s, ROUND(sum_rows_examined / NULLIF(sum_rows_sent, 0)) AS examined_per_sent
FROM performance_schema.events_statements_summary_by_digest ORDER BY sum_timer_wait DESC LIMIT 3;

-- OUTPUT: (example)
-- q                                         | count_star | total_s | examined_per_sent
-- SELECT * FROM orders WHERE customer_id    |     912000 |   410.5 |            12
-- SELECT * FROM events WHERE note LIKE ...  |       5200 |   380.2 |         94000      (a rare but very wasteful query)`],
        [`Close the loop: change, re-measure, keep a baseline. Capture plans before and after, and keep the improvement in a changelog so regressions are visible.`,
            r`-- baseline
EXPLAIN ANALYZE SELECT ... ;   -- actual time=0.2..95 rows=20
ALTER TABLE orders ADD INDEX idx_cust_status_created (customer_id, status, created_at);
EXPLAIN ANALYZE SELECT ... ;   -- actual time=0.04..0.1 rows=20

-- OUTPUT:
-- 950x faster; record before/after in the pull request`],
        [`Real-world: after each release compare digests with the previous release and alert on queries whose average latency or rows examined grew by more than a set threshold.`,
            r`SELECT digest, ROUND(avg_timer_wait/1e9, 2) AS avg_ms, ROUND(sum_rows_examined / count_star) AS rows_examined_avg FROM performance_schema.events_statements_summary_by_digest WHERE schema_name = 'shop' ORDER BY avg_timer_wait DESC LIMIT 3;

-- OUTPUT: (example)
-- digest           | avg_ms | rows_examined_avg
-- 8b1f...          | 412.30 |            250000`]
    )
};
