// Module 17 (Indexes), part B.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s17b: Record<string, DeepDive> = {
    'Unique & Prefix Indexes': dd(
        [`A <b>UNIQUE index</b> is a B-Tree that also rejects duplicate keys (NULLs are allowed and may repeat). A <b>prefix index</b> indexes only the first N characters/bytes of a string column, e.g. <code>url(20)</code>, to save space.`,
            r`CREATE TABLE users (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  bio   TEXT,
  UNIQUE KEY uq_email (email),        -- no two users share an email
  KEY idx_bio (bio(30))               -- prefix index: only first 30 chars (required for TEXT)
);
INSERT INTO users(email) VALUES ('a@x.com');
INSERT INTO users(email) VALUES ('a@x.com');    -- duplicate

-- OUTPUT:
-- Query OK, 1 row affected
-- ERROR 1062 (23000): Duplicate entry 'a@x.com' for key 'users.uq_email'`],
        [`Uniqueness is best enforced by the database, not application code (which races under concurrency). Prefix indexes exist because TEXT/BLOB columns cannot be indexed in full and long VARCHARs make fat trees.`,
            r`-- Pick a prefix length that keeps selectivity close to the full column.
CREATE TABLE urls (u VARCHAR(200));
INSERT INTO urls VALUES ('https://a.com/x'),('https://a.com/y'),('https://b.org/z'),('https://c.net/q');

SELECT COUNT(DISTINCT u)                AS full_sel,
       COUNT(DISTINCT LEFT(u,13))       AS p13,
       COUNT(DISTINCT LEFT(u,16))       AS p16
FROM urls;

-- OUTPUT:
-- +----------+-----+-----+
-- | full_sel | p13 | p16 |
-- +----------+-----+-----+
-- |        4 |   3 |   4 |      <- 16 chars is enough here, 13 loses uniqueness
-- +----------+-----+-----+`],
        [`Real use: UNIQUE on email, username, SKU, (tenant_id, external_id); prefix on long URLs, file paths and tokens where the first 10-20 characters discriminate well.`,
            r`-- Composite unique: unique per tenant, not globally. NULL values do not conflict.
CREATE TABLE sku (tenant INT, code VARCHAR(20), UNIQUE KEY uq_t_code (tenant, code));
INSERT INTO sku VALUES (1,'A'),(2,'A'),(1,NULL),(1,NULL);   -- all accepted
SELECT COUNT(*) AS n FROM sku;

-- OUTPUT:
-- +---+
-- | n |
-- +---+
-- | 4 |
-- +---+`],
        [`<b>Advantages:</b> UNIQUE gives correctness plus fast lookups and lets <code>INSERT ... ON DUPLICATE KEY UPDATE</code> work; prefix indexes shrink index size and speed up writes.`,
            r`-- UNIQUE enables atomic upsert, race-free.
INSERT INTO users(email) VALUES ('b@x.com')
ON DUPLICATE KEY UPDATE bio = 'seen again';       -- first time: insert
INSERT INTO users(email) VALUES ('b@x.com')
ON DUPLICATE KEY UPDATE bio = 'seen again';       -- second time: update
SELECT email, bio FROM users WHERE email = 'b@x.com';

-- OUTPUT:
-- +---------+------------+
-- | email   | bio        |
-- +---------+------------+
-- | b@x.com | seen again |
-- +---------+------------+`],
        [`<b>Disadvantages:</b> unique checks add locking on insert (and can deadlock); prefix indexes cannot be used as <b>covering</b> indexes, cannot satisfy ORDER BY fully, and a poor prefix length gives many false candidates.`,
            r`-- A prefix index is never covering: the full value must be read from the row.
EXPLAIN SELECT bio FROM users WHERE bio LIKE 'hello%';

-- OUTPUT (Extra):
-- +-------------+
-- | Extra       |
-- +-------------+
-- | Using where |    <- no "Using index": table row must be fetched to verify the whole value
-- +-------------+`],
        [`<b>Limitations:</b> InnoDB prefix length max 767 bytes (REDUNDANT/COMPACT) or 3072 bytes (DYNAMIC, default); with utf8mb4 that is 768 characters. Case/accent rules follow the collation, so 'A' and 'a' collide under utf8mb4_0900_ai_ci. A unique index cannot span a hash expression without a generated column.`,
            r`-- Case-insensitive collation => these two collide on a UNIQUE key.
CREATE TABLE tag (name VARCHAR(20) UNIQUE) COLLATE utf8mb4_0900_ai_ci;
INSERT INTO tag VALUES ('Java');
INSERT INTO tag VALUES ('java');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'java' for key 'tag.name'`],
        `
   full index on url(200)            prefix index url(16)
   +---------------------------+     +------------------+
   | https://a.com/xyz...(200) |     | https://a.com/x  |  -> candidates
   +---------------------------+     +------------------+
   big entries, fewer per page       small entries, more per page
                                     then re-check full value in the row

   UNIQUE: insert -> probe index -> found? -> ERROR 1062
`,
        `Use UNIQUE for every natural business key; it is the only safe race-proof guard. For long strings consider a generated column holding a hash (e.g. SHA2 or CRC32) with an index instead of a prefix when equality search is the only need. Choose prefix length by measuring selectivity, not by guessing.`
    ),

    'Full-Text & Spatial Indexes': dd(
        [`A <b>FULLTEXT</b> index (InnoDB: inverted index of word to document) powers natural-language search with <code>MATCH ... AGAINST</code>. A <b>SPATIAL</b> index is an R-Tree over geometry columns (POINT, POLYGON) used for location queries.`,
            r`CREATE TABLE article (
  id    INT PRIMARY KEY,
  title VARCHAR(100),
  body  TEXT,
  FULLTEXT KEY ft_title_body (title, body)       -- inverted index
) ENGINE=InnoDB;
INSERT INTO article VALUES
 (1,'MySQL indexing','B-tree and fulltext indexes explained'),
 (2,'Cooking pasta','boil water add salt'),
 (3,'Index tuning','choose good indexes for MySQL queries');

SELECT id, title FROM article WHERE MATCH(title, body) AGAINST('mysql');

-- OUTPUT:
-- +----+----------------+
-- | id | title          |
-- +----+----------------+
-- |  1 | MySQL indexing |
-- |  3 | Index tuning   |
-- +----+----------------+`],
        [`<code>LIKE '%word%'</code> cannot use a B-Tree and scans everything; it also has no ranking. FULLTEXT tokenises words, ignores stop-words, and returns a relevance score. Spatial indexes make "within 5 km" a tree probe, not a calculation on every row.`,
            r`-- Relevance score and boolean mode operators (+ must, - must not, * prefix).
SELECT id, MATCH(title, body) AGAINST('mysql indexes') AS score
FROM article
WHERE MATCH(title, body) AGAINST('+mysql -tuning' IN BOOLEAN MODE);

-- OUTPUT (example):
-- +----+---------------------+
-- | id | score               |
-- +----+---------------------+
-- |  1 |  0.2272727340459824 |
-- +----+---------------------+`],
        [`Real use: site search, help-desk ticket search, log keyword search (small scale); store locator and geofencing with POINT + SPATIAL index and ST_Distance_Sphere or ST_Contains.`,
            r`-- Spatial index requires NOT NULL geometry and an SRID (use 4326 for lat/long on Earth).
CREATE TABLE store (
  id  INT PRIMARY KEY,
  loc POINT NOT NULL SRID 4326,
  SPATIAL INDEX sp_loc (loc)
);
INSERT INTO store VALUES (1, ST_GeomFromText('POINT(18.52 73.85)', 4326)),   -- Pune-ish (lat long order for SRID 4326)
                         (2, ST_GeomFromText('POINT(28.61 77.20)', 4326));   -- Delhi-ish

-- Distance in km from a reference point to each store.
SELECT id, ROUND(ST_Distance(loc, ST_GeomFromText('POINT(18.52 73.85)', 4326)) / 1000) AS km
FROM store ORDER BY km;

-- OUTPUT (example):
-- +----+------+
-- | id | km   |
-- +----+------+
-- |  1 |    0 |
-- |  2 | 1170 |
-- +----+------+`],
        [`<b>Advantages:</b> fast word search with ranking, boolean operators, query expansion, ngram parser for CJK; R-Tree makes bounding-box and containment queries sub-linear.`,
            r`-- Boolean prefix search.
SELECT title FROM article WHERE MATCH(title, body) AGAINST('index*' IN BOOLEAN MODE);

-- OUTPUT:
-- +----------------+
-- | title          |
-- +----------------+
-- | MySQL indexing |
-- | Index tuning   |
-- +----------------+`],
        [`<b>Disadvantages:</b> FULLTEXT is not a search engine: no fuzzy matching or stemming, results of newly inserted rows appear only after commit, large DML is slower, and relevance tuning is limited. Spatial index only helps MBR-based functions.`,
            r`-- Words shorter than innodb_ft_min_token_size (default 3) and stop-words are not indexed.
SELECT id FROM article WHERE MATCH(title, body) AGAINST('and');   -- 'and' is in the default stop-word list

-- OUTPUT:
-- Empty set (0.00 sec)      <- 'and' is a stop-word, nothing matches`],
        [`<b>Limitations:</b> MATCH columns must equal exactly the columns of one FULLTEXT index; the 50 percent threshold rule applies in natural mode only for MyISAM, not InnoDB; spatial indexes require NOT NULL columns, and SRID-aware functions must use matching SRIDs.`,
            r`-- Columns in MATCH must correspond to an existing FULLTEXT index.
SELECT id FROM article WHERE MATCH(title) AGAINST('mysql');

-- OUTPUT:
-- ERROR 1191 (HY000): Can't find FULLTEXT index matching the column list`],
        `
   documents                 inverted index (FULLTEXT)
   1: "mysql indexing"       mysql    -> [1, 3]
   2: "cooking pasta"        indexing -> [1]
   3: "index tuning mysql"   pasta    -> [2]
                             query 'mysql' -> docs 1,3 (ranked)

   SPATIAL (R-Tree): nested bounding rectangles
   +----------------------+
   | R1 +-----+  +----+   |   query box overlaps R1 only
   |    | s1  |  | s2 |   |   -> examine s1, skip R2 subtree
   +----------------------+
`,
        `Use FULLTEXT for modest, in-database search where operational simplicity wins; move to Elasticsearch/OpenSearch when you need typo tolerance, facets, analyzers or scale. For geo, keep SRID consistent across tables and use ST_Distance_Sphere with a bounding-box pre-filter so the spatial index is actually used.`
    ),

    'Covering Index': dd(
        [`A <b>covering index</b> contains every column a query needs, so MySQL answers it from the index alone without reading the table rows. EXPLAIN shows <code>Using index</code> in Extra.`,
            r`CREATE TABLE sales (
  id INT PRIMARY KEY, cust INT, amount DECIMAL(8,2), note VARCHAR(100),
  KEY idx_cust_amt (cust, amount)           -- contains both columns the query below needs
);
INSERT INTO sales VALUES (1,7,10.00,'x'),(2,7,25.50,'y'),(3,8,5.00,'z');

EXPLAIN SELECT cust, SUM(amount) FROM sales WHERE cust = 7 GROUP BY cust;

-- OUTPUT (partial):
-- +------+---------------+-------------+
-- | type | key           | Extra       |
-- +------+---------------+-------------+
-- | ref  | idx_cust_amt  | Using index |
-- +------+---------------+-------------+`],
        [`Row fetches are the expensive part of an index lookup: each one may be a random disk read into the clustered index. Eliminating them can turn a slow query into a memory-only one, especially for large result sets.`,
            r`-- Selecting a column that is not in the index forces row lookups.
EXPLAIN SELECT cust, note FROM sales WHERE cust = 7;       -- note not in index
EXPLAIN SELECT cust, amount, id FROM sales WHERE cust = 7; -- id (PK) is implicitly in every secondary index

-- OUTPUT (Extra):
-- +-------------+
-- | NULL        |    <- must read table row for note
-- | Using index |    <- covered by (cust, amount, id)
-- +-------------+`],
        [`Real use: hot list/dashboard queries (counts, sums by key), existence checks, pagination of ids, and "deferred join" tricks where a covering index finds the ids first and the table is read only for the page.`,
            r`-- Deferred join pagination: scan the narrow covering index, then fetch only 2 rows.
SELECT s.*
FROM (SELECT id FROM sales WHERE cust = 7 ORDER BY amount DESC LIMIT 2) AS p
JOIN sales s ON s.id = p.id;

-- OUTPUT:
-- +----+------+--------+------+
-- | id | cust | amount | note |
-- +----+------+--------+------+
-- |  2 |    7 |  25.50 | y    |
-- |  1 |    7 |  10.00 | x    |
-- +----+------+--------+------+`],
        [`<b>Advantages:</b> avoids the clustered-index lookup, reduces random I/O, keeps hot data compact in the buffer pool, and often removes the sort too.`,
            r`-- MySQL 8: INCLUDE-style trick - add trailing columns purely to cover.
ALTER TABLE sales ADD KEY idx_cover (cust, amount, note(20));   -- prefix: not truly covering for note
SHOW INDEX FROM sales WHERE Key_name = 'idx_cover';

-- OUTPUT (partial):
-- +----------+--------------+-------------+-----------+
-- | Key_name | Seq_in_index | Column_name | Sub_part  |
-- +----------+--------------+-------------+-----------+
-- | idx_cover|            1 | cust        | NULL      |
-- | idx_cover|            2 | amount      | NULL      |
-- | idx_cover|            3 | note        | 20        |
-- +----------+--------------+-------------+-----------+`],
        [`<b>Disadvantages:</b> a wide covering index uses more memory and slows writes; it is tuned to a specific query, so changing the SELECT list silently breaks covering; SELECT * almost never covers.`,
            r`-- SELECT * destroys covering.
EXPLAIN SELECT * FROM sales WHERE cust = 7;

-- OUTPUT (Extra):
-- +-------+
-- | NULL  |     <- (example) row lookups needed for every match
-- +-------+`],
        [`<b>Limitations:</b> there is no INCLUDE clause in MySQL (unlike SQL Server/PostgreSQL), so covering columns also join the sort key; prefix-indexed, TEXT/BLOB and spatial columns cannot cover; max key length applies.`,
            r`-- No INCLUDE syntax in MySQL.
CREATE INDEX idx_inc ON sales (cust) INCLUDE (amount);

-- OUTPUT:
-- ERROR 1064 (42000): You have an error in your SQL syntax ... near 'INCLUDE (amount)'`],
        `
   Normal secondary lookup            Covering lookup
   idx(cust) ---> PK id               idx(cust,amount) --> value found in leaf
        |                                   |
        v                                   v
   clustered tree --> row --> amount   return (Extra: Using index)
   (2 trees touched)                   (1 tree touched)
`,
        `Add covering columns only for the few queries that dominate load and are stable. Weigh the extra index bytes against saved I/O; use the sys schema and Handler_read_* counters to prove the gain. Avoid SELECT * in application code so covering remains possible.`
    ),

    'Index Selectivity & Cardinality': dd(
        [`<b>Cardinality</b> is the estimated number of distinct values in an index. <b>Selectivity</b> = distinct values / total rows (0 to 1). High selectivity (near 1, like email) means an index narrows to few rows; low selectivity (like gender) does not.`,
            r`CREATE TABLE person (id INT PRIMARY KEY, gender CHAR(1), email VARCHAR(40), KEY(gender), KEY(email));
INSERT INTO person VALUES (1,'M','a@x'),(2,'F','b@x'),(3,'M','c@x'),(4,'F','d@x');

SELECT COUNT(DISTINCT gender)/COUNT(*) AS sel_gender,
       COUNT(DISTINCT email)/COUNT(*)  AS sel_email
FROM person;

-- OUTPUT:
-- +------------+-----------+
-- | sel_gender | sel_email |
-- +------------+-----------+
-- |     0.5000 |    1.0000 |
-- +------------+-----------+`],
        [`The optimizer decides whether an index is worth using from cardinality statistics. If a predicate matches more than roughly 20-30 percent of rows, scanning the table sequentially is cheaper than thousands of random index lookups, so the index is ignored.`,
            r`-- SHOW INDEX exposes the optimizer's cardinality estimate.
SHOW INDEX FROM person;

-- OUTPUT (partial, example):
-- +----------+-------------+-------------+
-- | Key_name | Column_name | Cardinality |
-- +----------+-------------+-------------+
-- | PRIMARY  | id          |           4 |
-- | gender   | gender      |           2 |
-- | email    | email       |           4 |
-- +----------+-------------+-------------+`],
        [`Real use: decide index order in composites (selective column early, unless ordering needs dictate otherwise), spot useless indexes, and refresh stale statistics after bulk loads so plans stay good.`,
            r`-- Statistics are sampled; refresh after big data changes.
ANALYZE TABLE person;

-- MySQL 8: histograms help when the column is NOT indexed or data is skewed.
ANALYZE TABLE person UPDATE HISTOGRAM ON gender WITH 4 BUCKETS;

-- OUTPUT:
-- +------------------+---------+----------+----------+
-- | Table            | Op      | Msg_type | Msg_text |
-- +------------------+---------+----------+----------+
-- | db.person        | analyze | status   | OK       |
-- | db.person        | histogram | status | Histogram statistics created for column 'gender'. |
-- +------------------+---------+----------+----------+`],
        [`<b>Advantages:</b> measuring selectivity turns indexing from guesswork into evidence; stats guide join order and index choice automatically; histograms fix skew misestimates.`,
            r`-- Inspect the histogram MySQL built.
SELECT JSON_EXTRACT(histogram, '$."histogram-type"') AS htype,
       JSON_EXTRACT(histogram, '$."number-of-buckets-specified"') AS buckets
FROM information_schema.column_statistics
WHERE table_name = 'person' AND column_name = 'gender';

-- OUTPUT:
-- +---------------+---------+
-- | htype         | buckets |
-- +---------------+---------+
-- | "singleton"   | 4       |
-- +---------------+---------+`],
        [`<b>Disadvantages:</b> InnoDB statistics are sampled (default 20 pages), so cardinality can be badly off on skewed or huge tables, causing wrong plans; low-selectivity indexes still cost write time.`,
            r`-- Increase sampling for better estimates on a specific table.
ALTER TABLE person STATS_SAMPLE_PAGES = 100;
SHOW VARIABLES LIKE 'innodb_stats_persistent_sample_pages';

-- OUTPUT:
-- +--------------------------------------+-------+
-- | Variable_name                        | Value |
-- +--------------------------------------+-------+
-- | innodb_stats_persistent_sample_pages | 20    |
-- +--------------------------------------+-------+`],
        [`<b>Limitations:</b> low-selectivity columns are still useful when the value is rare (skew): "status='FAILED'" at 0.01 percent benefits even though status has 3 distinct values. Cardinality of a composite index only counts its leading prefixes, and histograms are ignored for indexed-equality lookups that use index dives.`,
            r`-- Skew example: a rare value is selective even if the column is not.
CREATE TABLE job (id INT PRIMARY KEY, st VARCHAR(8), KEY(st));
-- (imagine 1,000,000 rows: 999,990 'DONE' and 10 'FAILED')
EXPLAIN SELECT id FROM job WHERE st = 'FAILED';   -- index used
EXPLAIN SELECT id FROM job WHERE st = 'DONE';     -- optimizer prefers scanning

-- OUTPUT (type, example on such data):
-- +-------+
-- | ref   |
-- | index |    <- or ALL: most rows match, index no help
-- +-------+`],
        `
   selectivity = distinct / rows

   email   1.00  |############################| great index
   city    0.05  |##                          | ok with other columns
   gender  0.00  |                            | poor (2 values)

   WHERE gender='F' -> 50% of rows -> optimizer: full scan cheaper
`,
        `Do not index by rule of thumb; index by workload plus data distribution. For skewed columns use histograms (8.0+) and watch for plan flips after statistics refresh; pin critical plans with index hints or optimizer hints only as a last resort. Schedule ANALYZE TABLE after bulk loads.`
    ),
};
