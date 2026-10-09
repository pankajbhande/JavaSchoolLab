// Modules 17-18 (Indexes, Query Optimization) extras.
import { x, r, type Extra } from './extra';

export const e07: Record<string, Extra> = {
    'What is an Index?': x(
        ['An index is a separate sorted structure that lets MySQL find rows without scanning the whole table, like a book index.',
            'Create one with <code>CREATE INDEX idx_email ON users(email);</code>.',
            'Indexes speed up reads (WHERE, JOIN, ORDER BY) but slow writes and use disk.'],
        ['Index columns used in WHERE, JOIN and ORDER BY, starting with the most selective and frequently filtered.',
            'Each INSERT/UPDATE/DELETE must maintain every index on the table, so do not index everything.',
            'Use <code>EXPLAIN</code> to confirm an index is actually used.'],
        ['Indexes cost memory in the buffer pool; a few well-designed composite indexes beat many single-column ones.',
            'Remove unused and duplicate indexes (<code>sys.schema_unused_indexes</code>, <code>sys.schema_redundant_indexes</code>).',
            'Design indexes from the query workload, not from table columns.'],
        [['F', 'What is an index?', 'A data structure that speeds up data retrieval by keeping sorted references to rows.'],
            ['F', 'What is the downside of too many indexes?', 'Slower writes, more storage and more memory use.'],
            ['M', 'Which columns should you index?', 'Columns in frequent WHERE, JOIN, ORDER BY and GROUP BY clauses, ideally selective ones.'],
            ['M', 'How do you check that a query uses an index?', '<code>EXPLAIN SELECT ...</code> and look at <code>key</code> and <code>type</code>.'],
            ['S', 'How do you find unused indexes?', 'Query <code>sys.schema_unused_indexes</code> over a representative period of uptime.'],
            ['S', 'How do you design indexes for a workload?', 'Collect top queries (digest table), group by access pattern, and create composite indexes that serve filters plus ordering with minimal overlap.']],
        [['Index speeds up a lookup.',
            r`CREATE TABLE people (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(80), city VARCHAR(30));
EXPLAIN SELECT id FROM people WHERE email = 'a@x.com';
CREATE INDEX idx_email ON people (email);
EXPLAIN SELECT id FROM people WHERE email = 'a@x.com';

-- OUTPUT: (example)
-- before: type=ALL  key=NULL      rows=100000
-- after : type=ref  key=idx_email rows=1`],
            ['List indexes.',
                r`SHOW INDEX FROM people;

-- OUTPUT: (trimmed)
-- Key_name  | Column_name
-- PRIMARY   | id
-- idx_email | email`]],
        [['Find redundant indexes.',
            r`SELECT table_name, redundant_index_name, dominant_index_name FROM sys.schema_redundant_indexes WHERE table_schema = DATABASE();

-- OUTPUT: (example)
-- table_name | redundant_index_name | dominant_index_name
-- people     | idx_a                | idx_a_b`],
            ['Index maintenance cost shows on bulk insert.',
                r`-- 1M rows: no secondary indexes ~ 8 s, 5 secondary indexes ~ 30 s
SELECT COUNT(*) FROM information_schema.statistics WHERE table_name = 'people';

-- OUTPUT:
-- COUNT(*)
-- 2`]]
    ),

    'B-Tree Indexes': x(
        ['The default MySQL index type is a B-tree (B+tree in InnoDB): a balanced, sorted tree of pages.',
            'It supports equality (=), ranges (&gt;, &lt;, BETWEEN), prefix LIKE and ORDER BY.',
            'Lookups take a few page reads even for millions of rows.'],
        ['InnoDB pages are 16 KB; each node holds many keys, so the tree is shallow (usually 3-4 levels).',
            'Leaf pages are linked, making range scans fast.',
            'Random inserts cause page splits; ordered inserts append efficiently.'],
        ['Tree height grows slowly, so lookup cost is nearly constant; the real cost is cache misses when the index does not fit in the buffer pool.',
            'Wide keys reduce fan-out, increasing height and I/O; keep keys small.',
            'Fill factor and fragmentation: heavy random deletes/updates leave pages half empty; rebuild with <code>ALTER TABLE ... ENGINE=InnoDB</code> when needed.'],
        [['F', 'What type of index does InnoDB use by default?', 'B-tree (B+tree).'],
            ['F', 'What queries benefit from a B-tree?', 'Equality, range, prefix LIKE and ordering.'],
            ['M', 'Why are B-trees shallow?', 'Each page holds hundreds of keys, so even millions of rows need only 3-4 levels.'],
            ['M', 'Why do random UUID keys hurt?', 'Inserts go to random leaf pages, causing splits, fragmentation and poor cache locality.'],
            ['S', 'How do key size and page size affect performance?', 'Smaller keys increase fan-out, reduce tree height and improve cache efficiency.'],
            ['S', 'How do you fix a fragmented index?', 'Rebuild with OPTIMIZE TABLE or ALTER TABLE ... ENGINE=InnoDB (online), ideally during low traffic.']],
        [['Range query uses the B-tree order.',
            r`ALTER TABLE people ADD INDEX idx_city (city);
EXPLAIN SELECT id FROM people WHERE city BETWEEN 'A' AND 'D';

-- OUTPUT: (example)
-- type  | key      | rows
-- range | idx_city | 2400`],
            ['Index size on disk.',
                r`SELECT index_name, ROUND(stat_value * @@innodb_page_size / 1024 / 1024, 2) AS mb
FROM mysql.innodb_index_stats WHERE database_name = DATABASE() AND table_name = 'people' AND stat_name = 'size';

-- OUTPUT: (example)
-- index_name | mb
-- PRIMARY    | 12.00
-- idx_city   |  5.00`]],
        [['Estimate tree height from rows.',
            r`SELECT CEIL(LOG(1000000) / LOG(500)) AS approx_levels;

-- OUTPUT:
-- approx_levels
-- 3`],
            ['Rebuild a fragmented table.',
                r`ALTER TABLE people ENGINE=InnoDB;

-- OUTPUT:
-- Query OK, 0 rows affected  (table and indexes rebuilt online)`]]
    ),

    'Clustered vs Secondary Index': x(
        ['In InnoDB the table itself is the clustered index: rows are stored in primary-key order inside the PK B-tree.',
            'Every other index is a secondary index: it stores its columns plus the primary key value.',
            'A secondary lookup finds the PK, then does a second lookup in the clustered index (bookmark lookup).'],
        ['Primary-key lookups are the fastest because the row is right at the leaf.',
            'Secondary indexes silently include the PK columns, so you can use them for covering queries on (indexed cols + PK).',
            'Large PKs enlarge every secondary index.'],
        ['Choose a short, monotonic PK: it keeps the clustered tree compact and inserts sequential.',
            'Use covering indexes to avoid the second lookup on hot queries.',
            'Without an explicit PK InnoDB uses the first unique NOT NULL index or a hidden 6-byte row id.'],
        [['F', 'What is a clustered index?', 'The primary key index where InnoDB stores the full rows in key order.'],
            ['F', 'How many clustered indexes can a table have?', 'One.'],
            ['M', 'What does a secondary index store?', 'The indexed columns plus the primary key value.'],
            ['M', 'What is a bookmark (back) lookup?', 'After finding the PK in a secondary index, MySQL reads the full row from the clustered index.'],
            ['S', 'Why should the PK be small and monotonic?', 'Small keys shrink every secondary index; monotonic keys append to the right of the tree, avoiding page splits.'],
            ['S', 'How do you avoid bookmark lookups?', 'Create a covering index including all selected columns so the query is answered from the index alone.']],
        [['Secondary index covers PK.',
            r`CREATE TABLE ord (id BIGINT PRIMARY KEY, customer_id INT, total DECIMAL(8,2), KEY idx_cust (customer_id));
EXPLAIN SELECT id FROM ord WHERE customer_id = 5;

-- OUTPUT: (example)
-- type | key      | Extra
-- ref  | idx_cust | Using index      (id comes from the index itself)`],
            ['Needs a row lookup for total.',
                r`EXPLAIN SELECT total FROM ord WHERE customer_id = 5;

-- OUTPUT: (example)
-- type | key      | Extra
-- ref  | idx_cust | NULL            (back to clustered index for total)`]],
        [['Make it covering.',
            r`ALTER TABLE ord ADD INDEX idx_cust_total (customer_id, total);
EXPLAIN SELECT total FROM ord WHERE customer_id = 5;

-- OUTPUT: (example)
-- key            | Extra
-- idx_cust_total | Using index`],
            ['Random PK causes splits; compare sizes.',
                r`SELECT table_name, ROUND(data_length/1024/1024) AS data_mb, ROUND(index_length/1024/1024) AS idx_mb FROM information_schema.tables WHERE table_name IN ('ord_uuid','ord_seq');

-- OUTPUT: (example)
-- table_name | data_mb | idx_mb
-- ord_uuid   |     780 |    410
-- ord_seq    |     520 |    230`]]
    ),

    'Composite Index & Leftmost Prefix': x(
        ['A composite index covers several columns: <code>INDEX (last_name, first_name, city)</code>.',
            'MySQL can use it from the left: (a), (a,b), (a,b,c) work; (b) or (c) alone does not use it efficiently.',
            'Column order matters most.'],
        ['Rule of thumb: equality columns first, then the range column, then ORDER BY columns.',
            'A range condition stops index use for columns after it.',
            'A composite (a,b) makes a separate index on (a) redundant.'],
        ['Order by selectivity and query shape, not blindly highest cardinality first; test with EXPLAIN on real data.',
            'Index skip scan in 8.0.13 can use a composite when the leading column has few values, but do not rely on it.',
            'Include columns of GROUP BY / ORDER BY to avoid filesort and temporary tables.'],
        [['F', 'What is a composite index?', 'An index on two or more columns.'],
            ['F', 'Will INDEX (a,b) help WHERE b = 1?', 'Generally no, because the leftmost column a is not constrained.'],
            ['M', 'What is the leftmost prefix rule?', 'The index can be used for queries that filter the leading columns in order: a, then a+b, then a+b+c.'],
            ['M', 'Why does a range on a stop later columns being used?', 'After a range the following columns are not in sorted order within the scanned range, so they cannot be seeked.'],
            ['S', 'How do you order columns in a composite index?', 'Equality predicates first, then one range column, then ordering columns; validate with EXPLAIN and cardinality.'],
            ['S', 'What is index skip scan?', 'MySQL 8.0.13+ can scan a composite index without the leading column predicate if that column has few distinct values; it is a fallback, not a design.']],
        [['Leftmost prefix demo.',
            r`CREATE TABLE emp2 (id INT PRIMARY KEY, last_name VARCHAR(20), first_name VARCHAR(20), city VARCHAR(20), KEY idx_name_city (last_name, first_name, city));
EXPLAIN SELECT id FROM emp2 WHERE last_name = 'Rao' AND first_name = 'Asha';
EXPLAIN SELECT id FROM emp2 WHERE first_name = 'Asha';

-- OUTPUT: (example)
-- first: type=ref key=idx_name_city key_len=...  uses 2 columns
-- second: type=index key=idx_name_city (full index scan, not a seek)`],
            ['Range stops later columns.',
                r`EXPLAIN SELECT id FROM emp2 WHERE last_name = 'Rao' AND first_name > 'A' AND city = 'Pune';

-- OUTPUT: (example)
-- type  | key           | key_len
-- range | idx_name_city | 164   (city used only as a filter, not a seek)`]],
        [['Index that serves filter plus sort.',
            r`ALTER TABLE ord ADD INDEX idx_cust_date (customer_id, created_at);
EXPLAIN SELECT id FROM ord WHERE customer_id = 5 ORDER BY created_at DESC LIMIT 10;

-- OUTPUT: (example)
-- type | key           | Extra
-- ref  | idx_cust_date | Backward index scan`],
            ['Redundant single column index.',
                r`SELECT redundant_index_name, dominant_index_name FROM sys.schema_redundant_indexes WHERE table_name = 'ord';

-- OUTPUT:
-- redundant_index_name | dominant_index_name
-- idx_cust             | idx_cust_date`]]
    ),

    'Unique & Prefix Indexes': x(
        ['A unique index forbids duplicate values and also speeds lookups. A prefix index indexes only the first N characters of a string column.',
            'Create prefix: <code>CREATE INDEX idx_title ON posts (title(20));</code>',
            'Prefix indexes are needed for long strings and TEXT columns.'],
        ['Choose the prefix length by selectivity: compare <code>COUNT(DISTINCT LEFT(col,N))</code> with <code>COUNT(DISTINCT col)</code>.',
            'Prefix indexes cannot be covering indexes and cannot be used for ORDER BY of the full value.',
            'Unique prefix indexes enforce uniqueness only on the prefix, which can wrongly reject different values.'],
        ['Alternatives to long indexed strings: a hash column (<code>CRC32</code>/<code>SHA2</code>) with an index plus equality check, or a generated column.',
            'Index key length limit is 3072 bytes in InnoDB (utf8mb4 is 4 bytes per char).',
            'Do not use UNIQUE on prefixes unless the semantic rule is truly "prefix is unique".'],
        [['F', 'What is a prefix index?', 'An index on the first N characters of a string column.'],
            ['F', 'What does a unique index do?', 'Prevents duplicate values and speeds up lookups.'],
            ['M', 'How do you pick the prefix length?', 'Choose the smallest N whose number of distinct prefixes is close to the number of distinct full values.'],
            ['M', 'Limitation of prefix indexes?', 'They cannot cover queries or fully support ORDER BY on the whole column.'],
            ['S', 'How to index a 1000-character URL for equality lookup?', 'Add a generated column with SHA2/CRC hash, index it, and query hash plus the full value to filter collisions.'],
            ['S', 'Why is a UNIQUE prefix index dangerous?', 'Two different values with the same prefix are rejected as duplicates.']],
        [['Pick a prefix length.',
            r`SELECT COUNT(DISTINCT title) AS full_cnt, COUNT(DISTINCT LEFT(title,10)) AS p10, COUNT(DISTINCT LEFT(title,20)) AS p20 FROM posts;

-- OUTPUT: (example)
-- full_cnt | p10   | p20
--    98000 | 81000 | 97500`],
            ['Create and use it.',
                r`CREATE INDEX idx_title ON posts (title(20));
EXPLAIN SELECT id FROM posts WHERE title = 'Intro to MySQL Indexes';

-- OUTPUT: (example)
-- type | key       | key_len
-- ref  | idx_title | 83`]],
        [['Hash column for long values.',
            r`ALTER TABLE links ADD COLUMN url_hash BINARY(32) AS (UNHEX(SHA2(url,256))) STORED, ADD INDEX idx_hash (url_hash);
SELECT id FROM links WHERE url_hash = UNHEX(SHA2('https://example.com/a',256)) AND url = 'https://example.com/a';

-- OUTPUT:
-- id
-- 17`],
            ['Unique prefix pitfall.',
                r`CREATE TABLE u (v VARCHAR(50), UNIQUE KEY uq_prefix (v(5)));
INSERT INTO u VALUES ('abcdef1'), ('abcdef2');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'abcde' for key 'u.uq_prefix'`]]
    ),

    'Full-Text & Spatial Indexes': x(
        ['A FULLTEXT index supports searching words inside text with MATCH ... AGAINST. A SPATIAL index supports geographic queries on geometry columns.',
            'Create: <code>FULLTEXT (title, body)</code> and <code>SPATIAL INDEX (location)</code>.',
            'Normal B-tree indexes cannot search inside text or by area.'],
        ['FULLTEXT works with InnoDB and MyISAM; it ignores stop words and short words by default (<code>innodb_ft_min_token_size</code>).',
            'Spatial indexes use R-trees and need NOT NULL geometry columns with an SRID.',
            'Spatial functions: <code>ST_Distance_Sphere</code>, <code>ST_Contains</code>.'],
        ['For advanced relevance, typo tolerance and facets use a search engine; MySQL FULLTEXT is fine for basic site search.',
            'Spatial: store points with SRID 4326 and use ST_Distance_Sphere with a bounding-box pre-filter.',
            'Large FULLTEXT updates are async in the FTS cache; plan for slight indexing delay.'],
        [['F', 'What is a FULLTEXT index?', 'An index that lets you search for words in text columns.'],
            ['F', 'What is a spatial index used for?', 'Fast queries on geometric/geographic data such as points and polygons.'],
            ['M', 'What data structure does a spatial index use?', 'An R-tree.'],
            ['M', 'Why does a FULLTEXT search ignore some words?', 'Stop words and tokens shorter than the minimum token size are not indexed.'],
            ['S', 'When move from FULLTEXT to Elasticsearch?', 'When you need typo tolerance, synonyms, faceting, ranking tuning or very large corpora.'],
            ['S', 'How do you run a nearby search efficiently?', 'Bounding box with MBRContains using the spatial index, then refine by ST_Distance_Sphere.']],
        [['FULLTEXT search.',
            r`CREATE TABLE docs (id INT PRIMARY KEY, title VARCHAR(100), body TEXT, FULLTEXT KEY ft_all (title, body));
INSERT INTO docs VALUES (1,'MySQL indexes','B-tree and hash indexes explained'),(2,'Cooking','Pasta recipes');
SELECT id, title FROM docs WHERE MATCH(title, body) AGAINST ('indexes');

-- OUTPUT:
-- id | title
--  1 | MySQL indexes`],
            ['Spatial index and distance.',
                r`CREATE TABLE shops (id INT PRIMARY KEY, loc POINT NOT NULL SRID 4326, SPATIAL INDEX (loc));
INSERT INTO shops VALUES (1, ST_SRID(POINT(18.52, 73.85), 4326));
SELECT id, ROUND(ST_Distance_Sphere(loc, ST_SRID(POINT(18.53, 73.86), 4326))) AS meters FROM shops;

-- OUTPUT: (example)
-- id | meters
--  1 | 1546`]],
        [['Relevance score.',
            r`SELECT id, MATCH(title, body) AGAINST ('mysql indexes') AS score FROM docs ORDER BY score DESC;

-- OUTPUT: (example)
-- id | score
--  1 | 1.2
--  2 | 0`],
            ['Minimum word size setting.',
                r`SHOW VARIABLES LIKE 'innodb_ft_min_token_size';

-- OUTPUT:
-- Variable_name            | Value
-- innodb_ft_min_token_size | 3`]]
    ),

    'Covering Index': x(
        ['A covering index contains every column the query needs, so MySQL answers from the index without reading the table rows.',
            'EXPLAIN shows <code>Using index</code>.',
            'It avoids the extra lookup in the clustered index.'],
        ['Include filter columns first, then ORDER BY columns, then selected columns at the end.',
            'Because secondary indexes already contain the primary key, you can select the PK for free.',
            '8.0 supports <code>INCLUDE</code>-like behaviour only by adding columns to the index key.'],
        ['Covering indexes are the biggest single win for read-heavy list queries, but each extra column grows the index and slows writes.',
            'Keep covering indexes narrow: only for hot, stable queries.',
            'Watch for TEXT/BLOB columns, which cannot be fully included.'],
        [['F', 'What is a covering index?', 'An index that contains all columns a query needs.'],
            ['F', 'How do you know a query is covered?', 'EXPLAIN Extra shows "Using index".'],
            ['M', 'Why is it faster?', 'No lookup into the clustered index (no random row reads).'],
            ['M', 'Do you need to add the primary key to the index?', 'No, InnoDB secondary indexes already include it.'],
            ['S', 'How wide should covering indexes be?', 'Only as wide as needed for critical queries; wide indexes cost memory and write time.'],
            ['S', 'How do you find candidate covering indexes?', 'Top queries by time from the digest, where rows examined are high and the SELECT list is small.']],
        [['Make a list query index-only.',
            r`CREATE TABLE orders2 (id BIGINT PRIMARY KEY, customer_id INT, status VARCHAR(10), total DECIMAL(8,2), note TEXT);
ALTER TABLE orders2 ADD INDEX idx_cov (customer_id, status, total);
EXPLAIN SELECT status, total FROM orders2 WHERE customer_id = 7;

-- OUTPUT: (example)
-- type | key     | Extra
-- ref  | idx_cov | Using index`],
            ['Selecting an uncovered column breaks it.',
                r`EXPLAIN SELECT status, note FROM orders2 WHERE customer_id = 7;

-- OUTPUT: (example)
-- type | key     | Extra
-- ref  | idx_cov | NULL`]],
        [['Covering with ORDER BY and LIMIT.',
            r`ALTER TABLE orders2 ADD INDEX idx_cov2 (customer_id, id, status);
EXPLAIN SELECT id, status FROM orders2 WHERE customer_id = 7 ORDER BY id DESC LIMIT 20;

-- OUTPUT: (example)
-- key      | Extra
-- idx_cov2 | Backward index scan; Using index`],
            ['Compare rows read.',
                r`EXPLAIN ANALYZE SELECT status, total FROM orders2 WHERE customer_id = 7;

-- OUTPUT: (example)
-- -> Covering index lookup on orders2 using idx_cov (customer_id=7)  (actual time=0.03..0.2 rows=40)`]]
    ),

    'Index Selectivity & Cardinality': x(
        ['Cardinality is the number of distinct values in a column; selectivity is distinct values divided by total rows (closer to 1 is better).',
            'A unique column has the best selectivity; a boolean flag has very poor selectivity.',
            'The optimizer uses these statistics to decide whether to use an index.'],
        ['<code>SHOW INDEX</code> reports estimated cardinality; refresh with <code>ANALYZE TABLE</code>.',
            'A low-selectivity index (status with 3 values) is rarely useful alone, but can help inside a composite or with skewed values.',
            'Histograms (8.0) help the optimizer with skewed non-indexed columns.'],
        ['Data skew matters: status = "NEW" may be 0.1% of rows (great for an index) while "DONE" is 90% (scan is better).',
            'Persistent statistics sample pages; for very large or skewed tables raise <code>innodb_stats_persistent_sample_pages</code>.',
            'Create histograms on filtered but unindexed columns: <code>ANALYZE TABLE t UPDATE HISTOGRAM ON col</code>.'],
        [['F', 'What is cardinality?', 'The number of distinct values in a column or index.'],
            ['F', 'What is selectivity?', 'Distinct values divided by total rows; higher means the index narrows results better.'],
            ['M', 'Why is an index on a boolean column often useless?', 'Each value matches a large fraction of rows, so a scan is cheaper than many index lookups.'],
            ['M', 'How do you refresh statistics?', '<code>ANALYZE TABLE tablename;</code>'],
            ['S', 'When can a low-cardinality index still help?', 'When the queried value is rare (skewed), or as the leading column of a composite with other selective columns.'],
            ['S', 'What are histograms for?', 'They give the optimizer value distribution for columns without indexes, improving row estimates and join order.']],
        [['Compute selectivity.',
            r`SELECT COUNT(DISTINCT status) / COUNT(*) AS sel_status, COUNT(DISTINCT customer_id) / COUNT(*) AS sel_customer FROM orders2;

-- OUTPUT: (example)
-- sel_status | sel_customer
--     0.0001 |       0.2300`],
            ['See cardinality estimates.',
                r`ANALYZE TABLE orders2;
SELECT index_name, cardinality FROM information_schema.statistics WHERE table_name = 'orders2';

-- OUTPUT: (example)
-- index_name | cardinality
-- PRIMARY    |      100000
-- idx_cov    |       23000`]],
        [['Skewed value check.',
            r`SELECT status, COUNT(*) AS n, ROUND(COUNT(*) / SUM(COUNT(*)) OVER () * 100, 2) AS pct FROM orders2 GROUP BY status;

-- OUTPUT: (example)
-- status | n     | pct
-- NEW    |   120 |  0.12
-- DONE   | 91000 | 91.00`],
            ['Create a histogram.',
                r`ANALYZE TABLE orders2 UPDATE HISTOGRAM ON status WITH 8 BUCKETS;

-- OUTPUT:
-- Table          | Op        | Msg_type | Msg_text
-- shop.orders2   | histogram | status   | Histogram statistics created for column 'status'.`]]
    ),

    'EXPLAIN': x(
        ['EXPLAIN shows how MySQL plans to run a query: which indexes, join order and access types.',
            'Use it as <code>EXPLAIN SELECT ...</code> and read the columns type, key, rows and Extra.',
            'Good access types: const, eq_ref, ref, range. Bad: ALL (full table scan).'],
        ['Key columns: <code>type</code> (access method), <code>key</code> (index used), <code>rows</code> (estimated rows), <code>Extra</code> (Using index, Using filesort, Using temporary).',
            '<code>EXPLAIN FORMAT=TREE</code> and <code>FORMAT=JSON</code> give more detail.',
            'EXPLAIN only estimates; it does not run the query.'],
        ['Estimates can be wrong with stale statistics or skew; verify with EXPLAIN ANALYZE.',
            'Look for large <code>rows x filtered</code>, filesort on large sets, temporary tables, and non-sargable predicates.',
            'Treat plans as part of code review for critical queries; capture baseline plans to detect regressions after upgrades.'],
        [['F', 'What does EXPLAIN do?', 'Shows the execution plan MySQL will use for a query.'],
            ['F', 'Which type value is the worst?', 'ALL: a full table scan.'],
            ['M', 'What do Using filesort and Using temporary mean?', 'The sort or grouping could not use an index and needs extra work (memory/disk).'],
            ['M', 'Order the access types from best to worst.', 'system, const, eq_ref, ref, range, index, ALL.'],
            ['S', 'Why can EXPLAIN be misleading?', 'It uses statistics and estimates; actual row counts and timing can differ, so use EXPLAIN ANALYZE.'],
            ['S', 'How do you prevent plan regressions?', 'Keep statistics fresh, version and test critical query plans, use optimizer hints or index hints sparingly, and monitor slow queries after deploys.']],
        [['Basic EXPLAIN.',
            r`EXPLAIN SELECT id FROM orders2 WHERE customer_id = 7 AND status = 'NEW';

-- OUTPUT: (example)
-- id | select_type | table   | type | key     | key_len | rows | filtered | Extra
--  1 | SIMPLE      | orders2 | ref  | idx_cov | 48      |   12 |   100.00 | Using index`],
            ['Tree format.',
                r`EXPLAIN FORMAT=TREE SELECT * FROM orders2 WHERE customer_id = 7;

-- OUTPUT: (example)
-- -> Index lookup on orders2 using idx_cov (customer_id=7)  (cost=1.4 rows=12)`]],
        [['Spot a full scan caused by a function.',
            r`EXPLAIN SELECT id FROM orders2 WHERE YEAR(created_at) = 2026;

-- OUTPUT: (example)
-- type | key  | rows   | Extra
-- ALL  | NULL | 100000 | Using where`],
            ['Rewrite as a range.',
                r`EXPLAIN SELECT id FROM orders2 WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01';

-- OUTPUT: (example)
-- type  | key        | rows
-- range | idx_created | 8200`]]
    ),

    'EXPLAIN ANALYZE': x(
        ['EXPLAIN ANALYZE actually runs the query and shows estimated versus actual rows and time for each step (MySQL 8.0.18+).',
            'Syntax: <code>EXPLAIN ANALYZE SELECT ...</code>.',
            'Use it to find which step of a plan is slow.'],
        ['Read each node: <code>actual time=first_row..last_row rows=N loops=L</code>.',
            'Compare estimated rows to actual rows; big gaps mean bad statistics or skew.',
            'Be careful with DML: it executes the statement (use in a transaction and roll back, or on a SELECT).'],
        ['Total time of a node is roughly time x loops; the real cost of nested loops is in the inner side loops count.',
            'Combine with the slow log and digest to pick targets, then verify the fix by repeating EXPLAIN ANALYZE.',
            'In production prefer replicas and off-peak runs for heavy statements.'],
        [['F', 'What is EXPLAIN ANALYZE?', 'An EXPLAIN that runs the query and reports actual times and row counts.'],
            ['F', 'Which version introduced it?', 'MySQL 8.0.18.'],
            ['M', 'What do rows and loops mean?', 'rows = rows per loop, loops = how many times the node ran; total rows = rows x loops.'],
            ['M', 'Why can it be dangerous on UPDATE/DELETE?', 'It executes the statement, so changes occur; wrap in a transaction and roll back.'],
            ['S', 'How do you use it to find a bad join?', 'Look for a node where actual rows greatly exceed estimates or where an inner loop repeats many times without an index.'],
            ['S', 'How to benchmark fixes reliably?', 'Warm cache, repeat runs, compare actual rows and time per node, and test with production-like data.']],
        [['Compare estimates and actuals.',
            r`EXPLAIN ANALYZE SELECT c.name, COUNT(*) FROM customers c JOIN orders2 o ON o.customer_id = c.id WHERE o.status = 'NEW' GROUP BY c.id;

-- OUTPUT: (example, trimmed)
-- -> Group aggregate  (actual time=3.1..3.2 rows=95 loops=1)
--    -> Nested loop inner join  (cost=1.2 rows=120) (actual time=0.1..2.9 rows=120 loops=1)
--       -> Index lookup on o using idx_status (status='NEW')  (rows=120) (actual rows=120 loops=1)
--       -> Single-row index lookup on c using PRIMARY  (actual rows=1 loops=120)`],
            ['Safe use with DML.',
                r`START TRANSACTION;
EXPLAIN ANALYZE UPDATE orders2 SET status = 'DONE' WHERE status = 'NEW';
ROLLBACK;

-- OUTPUT: (example)
-- -> Update orders2 (rows=120) (actual time=1.8..1.8 rows=0 loops=1)`]],
        [['A slow plan shows its culprit.',
            r`EXPLAIN ANALYZE SELECT * FROM orders2 WHERE note LIKE '%refund%';

-- OUTPUT: (example)
-- -> Filter: (note like '%refund%')  (cost=10000 rows=11000) (actual time=0.2..420 rows=35 loops=1)
--    -> Table scan on orders2  (actual time=0.1..380 rows=100000 loops=1)`],
            ['After adding a FULLTEXT index.',
                r`EXPLAIN ANALYZE SELECT * FROM orders2 WHERE MATCH(note) AGAINST ('refund');

-- OUTPUT: (example)
-- -> Full-text index search on orders2  (actual time=1.1..1.3 rows=35 loops=1)`]]
    ),

    'Full Table Scan vs Index Scan': x(
        ['A full table scan reads every row (type=ALL). An index scan or lookup reads only the needed index entries or rows.',
            'Scans are fine for small tables; for large tables they are slow.',
            'Add an index on the filtered column to avoid them.'],
        ['Index access types: <code>ref</code>/<code>eq_ref</code> (lookups), <code>range</code> (range scan), <code>index</code> (full index scan), <code>ALL</code> (full table scan).',
            'Even with an index, the optimizer may choose a scan when most rows match.',
            '"Using index" means a covering index scan, not a table scan.'],
        ['A full index scan (type=index) is still O(n); it is better than ALL only because indexes are narrower.',
            'Scans are good for analytics (read sequentially, prefetch); lookups are good for OLTP.',
            'Plan flips (index to scan) occur when statistics change; pin with hints only as a last resort.'],
        [['F', 'What is a full table scan?', 'Reading every row of the table to find matches.'],
            ['F', 'How do you avoid it?', 'Create an appropriate index and write sargable conditions.'],
            ['M', 'Why might MySQL ignore an index?', 'The predicate matches many rows, the function wraps the column, types mismatch or statistics suggest a scan is cheaper.'],
            ['M', 'Is type=index a table scan?', 'It scans the whole index, not the table; faster than ALL but still linear.'],
            ['S', 'When is a scan the right choice?', 'For small tables or queries that touch a large fraction of rows, especially analytical reads.'],
            ['S', 'How do you stop plan flips?', 'Keep stats fresh, avoid skew-sensitive predicates, use histograms, and as last resort index hints or optimizer switches.']],
        [['Scan vs lookup.',
            r`EXPLAIN SELECT * FROM orders2 WHERE note = 'x';               -- no index
EXPLAIN SELECT * FROM orders2 WHERE id = 5;                    -- primary key

-- OUTPUT: (example)
-- type | key     | rows
-- ALL  | NULL    | 100000
-- const| PRIMARY | 1`],
            ['Index scan still O(n).',
                r`EXPLAIN SELECT COUNT(*) FROM orders2;

-- OUTPUT: (example)
-- type  | key     | Extra
-- index | idx_cov | Using index`]],
        [['Optimizer picks scan when value is common.',
            r`EXPLAIN SELECT id FROM orders2 WHERE status = 'DONE';

-- OUTPUT: (example)
-- type | key  | rows  | filtered
-- ALL  | NULL | 98000 | 91.00`],
            ['Rare value uses the index.',
                r`EXPLAIN SELECT id FROM orders2 WHERE status = 'NEW';

-- OUTPUT: (example)
-- type | key        | rows
-- ref  | idx_status |  120`]]
    ),

    'Join Algorithms': x(
        ['MySQL joins tables with algorithms: Nested Loop Join (default), Block Nested Loop (older) and Hash Join (8.0.18+).',
            'Nested loop: for each row in the outer table, look up matching rows in the inner table (best with an index).',
            'Hash join: build a hash table of one input and probe it with the other (best without indexes).'],
        ['Nested loop with an index on the inner join column is fast for selective OLTP queries.',
            'Hash join helps large unindexed equi-joins; it uses <code>join_buffer_size</code> memory and may spill to disk.',
            'EXPLAIN FORMAT=TREE shows "Inner hash join" or "Nested loop inner join".'],
        ['The driving (outer) table should be the one with fewer rows after filters; the optimizer picks it from statistics.',
            'Hash join does not replace indexes: for OLTP point lookups keep indexes on join columns.',
            'Tune <code>join_buffer_size</code> per session for specific big reports instead of globally.'],
        [['F', 'What is a nested loop join?', 'For each row of the first table, search the second table for matches.'],
            ['F', 'Which algorithm is used when no index exists on the join column?', 'Hash join (8.0.18+) or block nested loop in older versions.'],
            ['M', 'How do you see the join algorithm?', '<code>EXPLAIN FORMAT=TREE</code> shows nested loop or hash join.'],
            ['M', 'What controls hash join memory?', '<code>join_buffer_size</code>; spills to disk when exceeded.'],
            ['S', 'Why not rely on hash joins for OLTP?', 'They must read the whole build input; point lookups through indexes are far cheaper for selective queries.'],
            ['S', 'How is the join order chosen?', 'By cost-based optimization using table/index statistics; a bad estimate leads to a bad order, fixable by stats, histograms or hints.']],
        [['See hash join.',
            r`EXPLAIN FORMAT=TREE SELECT a.id FROM big_a a JOIN big_b b ON b.val = a.val;

-- OUTPUT: (example)
-- -> Inner hash join (b.val = a.val)
--     -> Table scan on b
--     -> Hash
--         -> Table scan on a`],
            ['Add an index and see nested loop.',
                r`ALTER TABLE big_b ADD INDEX idx_val (val);
EXPLAIN FORMAT=TREE SELECT a.id FROM big_a a JOIN big_b b ON b.val = a.val WHERE a.id < 100;

-- OUTPUT: (example)
-- -> Nested loop inner join
--     -> Index range scan on a using PRIMARY (id < 100)
--     -> Index lookup on b using idx_val (val = a.val)`]],
        [['Session-level buffer for a heavy report.',
            r`SET SESSION join_buffer_size = 64 * 1024 * 1024;
SELECT COUNT(*) FROM big_a a JOIN big_b b ON b.val = a.val;

-- OUTPUT:
-- COUNT(*)
-- 1203455`],
            ['Force join order only as a last resort.',
                r`SELECT STRAIGHT_JOIN a.id FROM small s JOIN big_a a ON a.s_id = s.id WHERE s.flag = 1;

-- OUTPUT:
-- id
-- 5`]]
    ),

    'Temporary Tables & Filesort in Plans': x(
        ['<code>Using temporary</code> means MySQL builds an internal temp table (often for GROUP BY, DISTINCT or UNION). <code>Using filesort</code> means it sorts rows itself.',
            'Both are extra work and can spill to disk on large sets.',
            'They are not always bad for small results.'],
        ['Avoid filesort by creating an index in ORDER BY order matching the filter columns.',
            'Avoid temporary tables by grouping on indexed columns, or by lowering the number of rows before grouping.',
            'Memory limits: <code>tmp_table_size</code>, <code>max_heap_table_size</code>, <code>sort_buffer_size</code>.'],
        ['MySQL 8 uses the TempTable engine and spills to disk files when memory limits are exceeded; check <code>Created_tmp_disk_tables</code>.',
            'A large sort with LIMIT uses a priority queue and is cheaper than a full sort.',
            'Window functions and ORDER BY on expressions often need sorts; precompute and index generated columns.'],
        [['F', 'What does Using filesort mean?', 'MySQL performs an extra sorting pass because no index gives the required order.'],
            ['F', 'What does Using temporary mean?', 'MySQL creates a temporary table to process the query.'],
            ['M', 'How do you remove a filesort?', 'Add an index whose column order matches WHERE equality columns followed by the ORDER BY columns.'],
            ['M', 'Which variables control in-memory temp table size?', '<code>tmp_table_size</code> and <code>max_heap_table_size</code>.'],
            ['S', 'How do you monitor disk temp table usage?', 'Compare <code>Created_tmp_disk_tables</code> to <code>Created_tmp_tables</code>; investigate the queries via digest.'],
            ['S', 'Is filesort always slow?', 'No, small sorts in memory are cheap; it hurts when sorting large sets or spilling to disk.']],
        [['Spot them in a plan.',
            r`EXPLAIN SELECT customer_id, COUNT(*) FROM orders2 GROUP BY status;

-- OUTPUT: (example)
-- type | key  | Extra
-- ALL  | NULL | Using temporary`],
            ['Index removes both.',
                r`ALTER TABLE orders2 ADD INDEX idx_status_cust (status, customer_id);
EXPLAIN SELECT status, COUNT(*) FROM orders2 GROUP BY status;

-- OUTPUT: (example)
-- type  | key             | Extra
-- index | idx_status_cust | Using index`]],
        [['Disk temp table counters.',
            r`SHOW GLOBAL STATUS LIKE 'Created_tmp%tables';

-- OUTPUT: (example)
-- Variable_name           | Value
-- Created_tmp_disk_tables |   120
-- Created_tmp_tables      | 52000`],
            ['Top queries creating temp tables.',
                r`SELECT digest_text, sum_created_tmp_disk_tables FROM performance_schema.events_statements_summary_by_digest ORDER BY sum_created_tmp_disk_tables DESC LIMIT 1;

-- OUTPUT: (example)
-- digest_text                               | sum_created_tmp_disk_tables
-- SELECT ... GROUP BY ... ORDER BY ...      |                         90`]]
    ),

    'Cost, Cardinality & Slow Queries': x(
        ['The optimizer assigns a cost to each possible plan and picks the cheapest, using row estimates (cardinality).',
            'Slow queries are those that take longer than <code>long_query_time</code> and are logged in the slow query log.',
            'Fixing slow queries usually means adding or fixing an index, or rewriting the query.'],
        ['Enable the slow log: <code>slow_query_log=1</code>, <code>long_query_time=1</code>, <code>log_queries_not_using_indexes</code> if useful.',
            'Summarise slow logs with <code>mysqldumpslow</code> or Percona <code>pt-query-digest</code>.',
            'Check <code>Rows_examined</code> vs <code>Rows_sent</code>: a big gap means wasted work.'],
        ['Use performance_schema digests to rank queries by total time, not just single slow executions: a 5 ms query run 10M times matters more.',
            'Cost model constants live in <code>mysql.server_cost</code> and <code>mysql.engine_cost</code>; rarely tuned.',
            'Build a regular review loop: top 10 queries weekly, regress after deployments.'],
        [['F', 'What is the slow query log?', 'A log of queries that exceed <code>long_query_time</code>.'],
            ['F', 'How do you enable it?', '<code>SET GLOBAL slow_query_log = ON; SET GLOBAL long_query_time = 1;</code>'],
            ['M', 'What does a big Rows_examined vs Rows_sent gap mean?', 'The query reads many rows to return few, usually a missing or unusable index.'],
            ['M', 'Which tool summarizes slow logs?', 'mysqldumpslow or pt-query-digest.'],
            ['S', 'Why rank by total time?', 'Frequent medium-speed queries consume more total resources than rare slow ones.'],
            ['S', 'How do you stop regressions after deploys?', 'Compare digest metrics before and after, set alerts on p95 latency and rows examined, and review plans for changed queries.']],
        [['Enable the slow log.',
            r`SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 0.5;
SHOW VARIABLES LIKE 'slow_query_log%';

-- OUTPUT: (example)
-- Variable_name       | Value
-- slow_query_log      | ON
-- slow_query_log_file | /var/lib/mysql/host-slow.log`],
            ['Top queries by total time.',
                r`SELECT LEFT(digest_text, 60) AS q, count_star AS calls, ROUND(sum_timer_wait/1e12, 2) AS total_s
FROM performance_schema.events_statements_summary_by_digest ORDER BY sum_timer_wait DESC LIMIT 3;

-- OUTPUT: (example)
-- q                                      | calls  | total_s
-- SELECT * FROM orders WHERE customer_id | 900000 | 410.55`]],
        [['Rows examined ratio.',
            r`SELECT LEFT(digest_text, 50) AS q, sum_rows_examined / NULLIF(sum_rows_sent, 0) AS examined_per_sent
FROM performance_schema.events_statements_summary_by_digest WHERE sum_rows_sent > 0 ORDER BY examined_per_sent DESC LIMIT 2;

-- OUTPUT: (example)
-- q                                  | examined_per_sent
-- SELECT * FROM posts WHERE title LIK | 1450.2`],
            ['Look at cost constants.',
                r`SELECT cost_name, cost_value FROM mysql.server_cost;

-- OUTPUT: (example)
-- cost_name                 | cost_value
-- disk_temptable_create_cost | NULL   (default used)`]]
    )
};
