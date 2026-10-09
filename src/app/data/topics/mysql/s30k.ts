// Module 30 (Full-Text Search): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s30k: Record<string, DeepDive> = {
    'FULLTEXT Indexes': dd(
        [`A <b>FULLTEXT index</b> is an inverted index: it splits text into words (tokens), and for each word stores the list of rows that contain it. It makes word search fast, where <code>LIKE '%word%'</code> would read every row. InnoDB (and MyISAM) support it on CHAR, VARCHAR and TEXT columns.`,
            r`CREATE TABLE articles (
  id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200),
  body  TEXT,
  FULLTEXT KEY ft_title_body (title, body)        -- one index over two columns
) ENGINE=InnoDB;

INSERT INTO articles (title, body) VALUES
 ('MySQL Tutorial',   'How to install and run MySQL server'),
 ('Optimizing MySQL', 'Indexes make MySQL queries fast'),
 ('Java Streams',     'Functional pipelines in Java'),
 ('Backup Basics',    'Use mysqldump to back up a MySQL database'),
 ('Python Basics',    'Variables loops and functions in Python'),
 ('Cooking Pasta',    'Boil water add salt and pasta'),
 ('Gardening Tips',   'Water plants in the morning');

SHOW INDEX FROM articles WHERE Index_type = 'FULLTEXT';

-- OUTPUT (example, partial columns):
-- +----------+---------------+--------------+-------------+------------+
-- | Table    | Key_name      | Seq_in_index | Column_name | Index_type |
-- +----------+---------------+--------------+-------------+------------+
-- | articles | ft_title_body |            1 | title       | FULLTEXT   |
-- | articles | ft_title_body |            2 | body        | FULLTEXT   |
-- +----------+---------------+--------------+-------------+------------+`],
        [`<code>LIKE '%mysql%'</code> cannot use a B-tree index (leading wildcard), so it scans the whole table, and it knows nothing about words or relevance. A FULLTEXT index turns the same search into an index lookup and can rank the results.`,
            r`EXPLAIN SELECT id FROM articles WHERE body LIKE '%MySQL%';
EXPLAIN SELECT id FROM articles WHERE MATCH(title, body) AGAINST('mysql');

-- OUTPUT (example, partial columns):
-- +----+-------------+----------+----------+---------------+---------------+------+
-- | id | select_type | table    | type     | possible_keys | key           | rows |
-- +----+-------------+----------+----------+---------------+---------------+------+
-- |  1 | SIMPLE      | articles | ALL      | NULL          | NULL          |    7 |
-- +----+-------------+----------+----------+---------------+---------------+------+
-- +----+-------------+----------+----------+---------------+---------------+------+
-- |  1 | SIMPLE      | articles | fulltext | ft_title_body | ft_title_body |    1 |
-- +----+-------------+----------+----------+---------------+---------------+------+`],
        [`Real use: blog, help-centre, product and ticket search. You combine the text match with ordinary filters (category, status, date) in the same WHERE, and tune the index settings (minimum word length, stopwords, ngram parser for Chinese/Japanese/Korean) for your content.`,
            r`-- Text match plus a normal filter
SELECT id, title FROM articles
WHERE  MATCH(title, body) AGAINST('mysql')
  AND  id > 1
ORDER  BY id;

-- Tuning knob (set in my.cnf, then rebuild the index)
SHOW VARIABLES LIKE 'innodb_ft_min_token_size';

-- OUTPUT:
-- +----+------------------+
-- | id | title            |
-- +----+------------------+
-- |  2 | Optimizing MySQL |
-- |  4 | Backup Basics    |
-- +----+------------------+
-- +--------------------------+-------+
-- | Variable_name            | Value |
-- +--------------------------+-------+
-- | innodb_ft_min_token_size | 3     |
-- +--------------------------+-------+`],
        [`<b>Advantages:</b> built in (no extra servers), transactional storage, automatic maintenance when rows change, relevance ranking, and it combines with SQL joins and filters.`,
            r`SELECT id, title,
       MATCH(title, body) AGAINST('mysql') AS score      -- relevance as a float
FROM   articles
WHERE  MATCH(title, body) AGAINST('mysql')
ORDER  BY score DESC;

-- OUTPUT (example; the exact scores differ):
-- +----+------------------+--------------------+
-- | id | title            | score              |
-- +----+------------------+--------------------+
-- |  1 | MySQL Tutorial   | 0.3646776080131531 |
-- |  2 | Optimizing MySQL | 0.3646776080131531 |
-- |  4 | Backup Basics    | 0.1823388040065765 |
-- +----+------------------+--------------------+`],
        [`<b>Disadvantages:</b> it matches whole tokens only: no stemming (optimizing and optimize are different words), no typo tolerance, no synonyms and no partial-word match in natural language mode.`,
            r`SELECT id FROM articles WHERE MATCH(title, body) AGAINST('mysq');       -- partial word
SELECT id FROM articles WHERE MATCH(title, body) AGAINST('optimize');    -- stem differs

-- OUTPUT:
-- Empty set (0.00 sec)
-- Empty set (0.00 sec)`],
        [`<b>Limitations:</b> words shorter than <code>innodb_ft_min_token_size</code> (3) and stopwords (a, the, and, ...) are not indexed; the MATCH column list must equal a FULLTEXT index; and a changed token size or stopword list needs the index rebuilt.`,
            r`SELECT * FROM INFORMATION_SCHEMA.INNODB_FT_DEFAULT_STOPWORD LIMIT 3;   -- never indexed

SELECT id FROM articles WHERE MATCH(title) AGAINST('mysql');            -- no index on title alone

-- OUTPUT:
-- +-------+
-- | value |
-- +-------+
-- | a     |
-- | about |
-- | an    |
-- +-------+
-- ERROR 1191 (HY000): Can't find FULLTEXT index matching the column list`],
        `
   row 1: "MySQL Tutorial ... install and run MySQL server"
   row 2: "Optimizing MySQL ... Indexes make MySQL queries fast"
   row 4: "Backup Basics ... Use mysqldump to back up a MySQL database"
                |
        tokenise (drop stopwords, words shorter than 3 chars)
                v
   inverted index                  word        -> rows (+ positions)
   +--------------------------+    mysql       -> 1, 2, 4
   | ft_title_body            |    tutorial    -> 1
   +--------------------------+    optimizing  -> 2
                                   backup     -> 4
   MATCH(...) AGAINST('mysql') = lookup 'mysql' -> rows 1,2,4 (ranked)
`,
        `Full-text is excellent for "search box over one database" at millions of rows. Decide analysers up front (minimum token size, stopword table, ngram for CJK) because changing them means a rebuild. Remember that heavy bulk loads are faster with the index added afterwards, and that the index maintains an in-memory cache that is merged lazily (OPTIMIZE TABLE with innodb_optimize_fulltext_only can compact it).`
    ),

    'MATCH ... AGAINST': dd(
        [`<code>MATCH(col1, col2) AGAINST('words' [mode])</code> is the query side of a FULLTEXT index. In a WHERE clause it filters; in a SELECT list it returns a floating-point <b>relevance score</b> (0 means no match). The default mode is natural language.`,
            r`CREATE TABLE docs (
  id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(100), body TEXT,
  FULLTEXT KEY ft (title, body)
) ENGINE=InnoDB;
INSERT INTO docs (title, body) VALUES
 ('MySQL Tutorial',   'How to install and run MySQL server'),
 ('Optimizing MySQL', 'Indexes make MySQL queries fast'),
 ('Backup Basics',    'Use mysqldump to back up a MySQL database'),
 ('Java Streams',     'Functional pipelines in Java'),
 ('Cooking Pasta',    'Boil water add salt and pasta'),
 ('Gardening Tips',   'Water plants in the morning');

SELECT id, title FROM docs
WHERE  MATCH(title, body) AGAINST('install')
ORDER  BY id;

-- OUTPUT:
-- +----+----------------+
-- | id | title          |
-- +----+----------------+
-- |  1 | MySQL Tutorial |
-- +----+----------------+`],
        [`Search results must be ordered by how well they match, not by id. MATCH returns that score, so "best first" needs no extra code. Several words in the query are treated as alternatives: a row matching more of them (or matching rarer ones) ranks higher.`,
            r`SELECT id, title,
       MATCH(title, body) AGAINST('mysql backup') AS score
FROM   docs
WHERE  MATCH(title, body) AGAINST('mysql backup')       -- same expression: computed once
ORDER  BY score DESC;

-- OUTPUT (example; scores vary with the data):
-- +----+------------------+--------------------+
-- | id | title            | score              |
-- +----+------------------+--------------------+
-- |  3 | Backup Basics    | 0.7133517265319824 |
-- |  1 | MySQL Tutorial   | 0.3646776080131531 |
-- |  2 | Optimizing MySQL | 0.3646776080131531 |
-- +----+------------------+--------------------+`],
        [`Real use: the user types a search string into the application; you bind it as a parameter (never concatenate it) and return the top N with a score cut-off. Always keep the user's text in the AGAINST argument, which is a constant at execution time.`,
            r`SET @q = 'mysql server';                              -- value comes from the application

SELECT id, title
FROM   docs
WHERE  MATCH(title, body) AGAINST(@q)
ORDER  BY MATCH(title, body) AGAINST(@q) DESC
LIMIT  2;

-- OUTPUT (example):
-- +----+------------------+
-- | id | title            |
-- +----+------------------+
-- |  1 | MySQL Tutorial   |
-- |  2 | Optimizing MySQL |
-- +----+------------------+`],
        [`<b>Advantages:</b> a SQL-native ranked search that can be mixed with joins, filters and LIMIT; when the same MATCH expression appears in WHERE and ORDER BY, the engine evaluates it once.`,
            r`SELECT d.id, d.title
FROM   docs d
JOIN   (SELECT 3 AS id) pick ON pick.id = d.id          -- join with ordinary data
WHERE  MATCH(d.title, d.body) AGAINST('mysqldump');

-- OUTPUT:
-- +----+---------------+
-- | id | title         |
-- +----+---------------+
-- |  3 | Backup Basics |
-- +----+---------------+`],
        [`<b>Disadvantages:</b> scores are relative to the whole corpus, so they cannot be compared across different queries or stored as absolute values. Also, InnoDB indexes only <i>committed</i> data: a row inserted in an open transaction is not found by full-text search until the commit.`,
            r`START TRANSACTION;
INSERT INTO docs (title, body) VALUES ('Replication', 'Source and replica servers');
SELECT COUNT(*) AS before_commit FROM docs WHERE MATCH(title, body) AGAINST('replication');
COMMIT;
SELECT COUNT(*) AS after_commit  FROM docs WHERE MATCH(title, body) AGAINST('replication');

-- OUTPUT:
-- +---------------+
-- | before_commit |
-- +---------------+
-- |             0 |
-- +---------------+
-- +--------------+
-- | after_commit |
-- +--------------+
-- |            1 |
-- +--------------+`],
        [`<b>Limitations:</b> the MATCH column list must match a FULLTEXT index exactly; the AGAINST argument must be a constant or a variable, not a column of another table (so no row-by-row "find similar" join); and the 'mysql' style words must be at least the minimum token length.`,
            r`SELECT a.id, b.id
FROM   docs a JOIN docs b
  ON   MATCH(b.title) AGAINST(a.title);                  -- column as search text

-- OUTPUT:
-- ERROR 1210 (HY000): Incorrect arguments to AGAINST`],
        `
   user text ---> AGAINST('mysql backup')
                       |
                       v
   tokenise -> look each word up in the inverted index
                       |
              rows containing ANY word  (natural language mode)
                       |
              score = f(term frequency, rarity, field length)
                       v
   WHERE keeps score > 0       ORDER BY score DESC     LIMIT n
`,
        `Wrap search in a thin repository method that validates and bounds user input (length, count), binds it as a parameter, and always applies LIMIT. Do not expose raw scores to users and do not build features that depend on a score being stable between releases. If you need joins by similarity or per-row matching, full-text in MySQL is the wrong tool.`
    ),

    'Natural Language vs Boolean Mode': dd(
        [`<b>Natural language mode</b> (the default) treats the query as free text: any word may match and rows are ranked by relevance. <b>Boolean mode</b> (<code>IN BOOLEAN MODE</code>) lets you write rules with operators: <code>+</code> must contain, <code>-</code> must not contain, <code>*</code> prefix wildcard, <code>"..."</code> exact phrase, <code>&gt;</code> and <code>&lt;</code> raise or lower a word's weight, and <code>( )</code> grouping.`,
            r`CREATE TABLE articles (
  id INT PRIMARY KEY AUTO_INCREMENT, title VARCHAR(100), body TEXT,
  FULLTEXT KEY ft (title, body)
) ENGINE=InnoDB;
INSERT INTO articles (title, body) VALUES
 ('MySQL Tutorial',   'How to install and run MySQL server'),
 ('Optimizing MySQL', 'Indexes make MySQL queries fast'),
 ('Java Streams',     'Functional pipelines in Java'),
 ('Backup Basics',    'Use mysqldump to back up a MySQL database'),
 ('Python Basics',    'Variables loops and functions in Python'),
 ('Cooking Pasta',    'Boil water add salt and pasta'),
 ('Gardening Tips',   'Water plants in the morning');

-- must contain mysql, must NOT contain backup
SELECT id, title FROM articles
WHERE  MATCH(title, body) AGAINST('+mysql -backup' IN BOOLEAN MODE)
ORDER  BY id;

-- OUTPUT:
-- +----+------------------+
-- | id | title            |
-- +----+------------------+
-- |  1 | MySQL Tutorial   |
-- |  2 | Optimizing MySQL |
-- +----+------------------+`],
        [`Users want precise searches ("both words", "exclude this", "exact phrase", "starts with"). Natural language mode cannot express them, and without operators every extra word widens the result instead of narrowing it.`,
            r`-- Natural language: OR semantics, widens the result
SELECT id FROM articles WHERE MATCH(title, body) AGAINST('java python') ORDER BY id;

-- Boolean: AND semantics, narrows the result
SELECT id FROM articles
WHERE  MATCH(title, body) AGAINST('+java +python' IN BOOLEAN MODE);

-- OUTPUT:
-- +----+
-- | id |
-- +----+
-- |  3 |
-- |  5 |
-- +----+
-- Empty set (0.00 sec)`],
        [`Real use: an advanced-search box. A prefix wildcard gives type-ahead style matching, a quoted phrase finds "mysql server" as adjacent words, and plain words without operators remain optional (OR).`,
            r`SELECT id, title FROM articles
WHERE  MATCH(title, body) AGAINST('optim*' IN BOOLEAN MODE);         -- prefix: Optimizing

SELECT id, title FROM articles
WHERE  MATCH(title, body) AGAINST('"mysql server"' IN BOOLEAN MODE); -- exact phrase

-- OUTPUT:
-- +----+------------------+
-- | id | title            |
-- +----+------------------+
-- |  2 | Optimizing MySQL |
-- +----+------------------+
-- +----+----------------+
-- | id | title          |
-- +----+----------------+
-- |  1 | MySQL Tutorial |
-- +----+----------------+`],
        [`<b>Advantages of boolean mode:</b> explicit control, prefix search, phrases, exclusion, and weight tweaks. <b>Advantages of natural language:</b> zero syntax to learn and relevance-ranked output for casual queries.`,
            r`-- Boost one word over another with > and <
SELECT id, title,
       MATCH(title, body) AGAINST('>mysql <backup' IN BOOLEAN MODE) AS score
FROM   articles
WHERE  MATCH(title, body) AGAINST('mysql backup' IN BOOLEAN MODE)
ORDER  BY score DESC, id;

-- OUTPUT (example; scores vary):
-- +----+------------------+--------------------+
-- | id | title            | score              |
-- +----+------------------+--------------------+
-- |  1 | MySQL Tutorial   | 0.7293552160263062 |
-- |  2 | Optimizing MySQL | 0.7293552160263062 |
-- |  4 | Backup Basics    | 0.3646776080131531 |
-- +----+------------------+--------------------+`],
        [`<b>Disadvantages:</b> the operator syntax is strict, so raw user input containing stray symbols such as a trailing plus can raise a syntax error; without ORDER BY the boolean results are not guaranteed to be sorted by relevance; and you must sanitise or escape operator characters if you want plain-text behaviour.`,
            r`SELECT id FROM articles
WHERE  MATCH(title, body) AGAINST('mysql +' IN BOOLEAN MODE);       -- dangling operator

-- OUTPUT (example):
-- ERROR 1064 (42000): syntax error, unexpected $end`],
        [`<b>Limitations:</b> stopwords and short words still are not indexed, and a required stopword makes the whole query return nothing. A leading wildcard (<code>*sql</code>) is not supported, so suffix search needs a different technique (for example an extra reversed-text column).`,
            r`SELECT id FROM articles
WHERE  MATCH(title, body) AGAINST('+the +mysql' IN BOOLEAN MODE);  -- 'the' is a stopword

-- OUTPUT:
-- Empty set (0.00 sec)`],
        `
                      NATURAL LANGUAGE            BOOLEAN
   input              'mysql backup'              '+mysql -oracle "full text" opt*'
   default logic      OR                          words optional, operators decide
   operators          none                        + - * "" ( ) > < ~
   result order       by relevance                not guaranteed (use ORDER BY score)
   typical use        search box                  advanced search / filters
`,
        `Offer natural language by default and boolean as an explicit "advanced" option. Never pass user input unchanged into boolean mode: strip or escape the operator characters, or build the boolean string yourself from validated tokens. Test the empty-result and stopword behaviours explicitly, since they are the most common support complaints.`
    ),

    'Full-Text vs Elasticsearch/OpenSearch': dd(
        [`MySQL full-text is a feature inside your database; <b>Elasticsearch / OpenSearch</b> is a separate distributed search engine built on Lucene. Both use inverted indexes, but a search engine adds analysers (stemming, synonyms, language rules), fuzzy matching, faceting and horizontal scaling.`,
            r`-- Assumes the articles table (id, title, body, FULLTEXT ft_title_body) with 7 rows
-- MySQL: word search with ranking
SELECT id, title FROM articles
WHERE  MATCH(title, body) AGAINST('database backup')
ORDER  BY MATCH(title, body) AGAINST('database backup') DESC LIMIT 3;

-- Elasticsearch / OpenSearch: the same intent as a JSON request
-- GET /articles/_search
-- { "query": { "multi_match": { "query": "database backup",
--                               "fields": ["title^2", "body"],
--                               "fuzziness": "AUTO" } },
--   "size": 3 }

-- OUTPUT (MySQL, example):
-- +----+---------------+
-- | id | title         |
-- +----+---------------+
-- |  4 | Backup Basics |
-- +----+---------------+`],
        [`Choose by requirements. MySQL full-text suffices when search is one feature of an app with moderate data. A search engine is needed for typo tolerance, language-aware stemming, synonyms, autocomplete, faceted counts, geo search, or search over hundreds of millions of documents.`,
            r`-- A typo: MySQL has no fuzziness
SELECT id FROM articles WHERE MATCH(title, body) AGAINST('backpu');

-- OUTPUT:
-- Empty set (0.00 sec)

-- Elasticsearch with "fuzziness": "AUTO" would still return "Backup Basics"
-- (it measures edit distance between 'backpu' and 'backup').`],
        [`Real use: the database stays the single source of truth, and a search engine is a derived index. Changes are published through a transactional <b>outbox</b> table written in the same transaction as the data; a worker reads it and updates the search index.`,
            r`CREATE TABLE search_outbox (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  op ENUM('upsert','delete') NOT NULL,
  sent TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

START TRANSACTION;
UPDATE articles SET title = 'Backup Basics v2' WHERE id = 4;          -- the data change
INSERT INTO search_outbox (article_id, op) VALUES (4, 'upsert');      -- same transaction
COMMIT;

-- Worker: claim a batch without blocking other workers
SELECT id, article_id, op FROM search_outbox
WHERE  sent = 0 ORDER BY id LIMIT 100 FOR UPDATE SKIP LOCKED;

-- OUTPUT:
-- +----+------------+--------+
-- | id | article_id | op     |
-- +----+------------+--------+
-- |  1 |          4 | upsert |
-- +----+------------+--------+`],
        [`<b>MySQL advantages:</b> no extra system to run, same transaction and security model, joins with relational data, instantly consistent after commit. <b>Engine advantages:</b> rich analysis, fuzzy and phrase scoring (BM25), facets, scalable shards and replicas, and no load on the OLTP database.`,
            r`-- MySQL: search and relational data in one statement
SELECT a.id, a.title, c.name AS category
FROM   articles a
JOIN   (SELECT 4 AS id, 'Operations' AS name) c ON c.id = a.id
WHERE  MATCH(a.title, a.body) AGAINST('mysqldump');

-- OUTPUT:
-- +----+------------------+------------+
-- | id | title            | category   |
-- +----+------------------+------------+
-- |  4 | Backup Basics v2 | Operations |
-- +----+------------------+------------+`],
        [`<b>MySQL disadvantages:</b> no stemming, typo tolerance or synonyms, basic relevance, and search load shares CPU and buffer pool with transactions. <b>Engine disadvantages:</b> a second cluster to operate and secure, eventual consistency (search lags the database), and a pipeline that can fail or drift.`,
            r`-- Monitoring the lag of the search pipeline: unsent changes and the oldest one
SELECT COUNT(*) AS backlog, MIN(created_at) AS oldest
FROM   search_outbox WHERE sent = 0;

-- OUTPUT (example):
-- +---------+---------------------+
-- | backlog | oldest              |
-- +---------+---------------------+
-- |       1 | 2026-10-06 09:14:02 |
-- +---------+---------------------+`],
        [`<b>Limitations:</b> MySQL full-text lives on one server (no sharding of the index; replicas copy everything), supports few languages out of the box (ngram and MeCab parsers for CJK), and has no built-in facets or aggregations over matches. A search engine is not a database: no multi-row transactions, and you must be able to rebuild the index from MySQL at any time.`,
            r`-- Rebuild path: the index must be reproducible from the source of truth
SELECT COUNT(*) AS rows_to_reindex FROM articles;

-- OUTPUT:
-- +-----------------+
-- | rows_to_reindex |
-- +-----------------+
-- |               7 |
-- +-----------------+`],
        `
   WRITE PATH                                       READ PATH
   app --> MySQL (source of truth)                  app --> search box
            |  one transaction                          |
            +--> data row                      small/medium:  MySQL MATCH ... AGAINST
            +--> search_outbox row             large/fuzzy:   Elasticsearch / OpenSearch
                      |
                 worker (poll / CDC)  ---->  search index (derived, rebuildable)
                                              lag = seconds (eventual consistency)
`,
        `Start with MySQL full-text and move to a dedicated engine only when a measured requirement (typo tolerance, language analysis, facets, scale, or protecting OLTP latency) justifies the operational cost. If you do split, keep MySQL authoritative, publish changes through an outbox or binlog-based CDC (not dual writes from the app), make indexing idempotent, and build a full-reindex job from day one.`
    ),
};
