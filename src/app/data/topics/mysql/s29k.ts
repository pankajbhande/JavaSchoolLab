// Module 29 (JSON in MySQL): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s29k: Record<string, DeepDive> = {
    'JSON Data Type & JSON_OBJECT / JSON_ARRAY': dd(
        [`MySQL 5.7+ has a native <b>JSON</b> column type. The server validates the text on write, stores it in a compact binary format (not as text) and normalises it: keys are sorted by length then bytewise, and whitespace is dropped. <code>JSON_OBJECT()</code> and <code>JSON_ARRAY()</code> build JSON values from SQL values.`,
            r`CREATE TABLE profile (
  id  INT PRIMARY KEY AUTO_INCREMENT,
  doc JSON NOT NULL                              -- validated on every write
);

INSERT INTO profile (doc)
VALUES (JSON_OBJECT('name', 'Abaji',              -- key/value pairs
                    'age',  30,
                    'skills', JSON_ARRAY('sql', 'java')));   -- a JSON array

SELECT doc FROM profile;                         -- note the normalised key order

-- OUTPUT:
-- +---------------------------------------------------------+
-- | doc                                                     |
-- +---------------------------------------------------------+
-- | {"age": 30, "name": "Abaji", "skills": ["sql", "java"]} |
-- +------------------------------------------------------+`],
        [`Not every attribute deserves its own column. Product specs, user preferences, webhook payloads and API responses have a shape that varies per row or changes often. JSON lets you store them without a schema migration for each new field, while still being validated and queryable.`,
            r`-- Validate and inspect JSON values with built-in functions
SELECT JSON_VALID('{"a": 1}')            AS ok_obj,     -- 1 = valid
       JSON_VALID('{a: 1}')              AS bad_obj,    -- 0 = keys must be quoted
       JSON_TYPE(JSON_OBJECT('k', 1))    AS t_obj,
       JSON_TYPE('[1, 2]')               AS t_arr,
       JSON_TYPE('1')                    AS t_int;

-- OUTPUT:
-- +--------+---------+--------+-------+---------+
-- | ok_obj | bad_obj | t_obj  | t_arr | t_int   |
-- +--------+---------+--------+-------+---------+
-- |      1 |       0 | OBJECT | ARRAY | INTEGER |
-- +--------+---------+--------+-------+---------+`],
        [`Real use: an API layer builds its response directly in SQL. <code>JSON_ARRAYAGG</code> and <code>JSON_OBJECTAGG</code> turn grouped rows into nested documents, so the application receives one ready-made JSON string per order.`,
            r`CREATE TABLE line_item (order_id INT, sku VARCHAR(10), qty INT);
INSERT INTO line_item VALUES (1,'P1',2),(1,'P2',1),(2,'P3',5);

SELECT JSON_OBJECT('order', order_id,
                   'items', JSON_ARRAYAGG(JSON_OBJECT('sku', sku, 'qty', qty))) AS payload
FROM   line_item
GROUP  BY order_id
ORDER  BY order_id;

-- OUTPUT (example; array element order is not guaranteed):
-- +------------------------------------------------------------------------+
-- | payload                                                                |
-- +------------------------------------------------------------------------+
-- | {"items": [{"qty": 2, "sku": "P1"}, {"qty": 1, "sku": "P2"}], "order": 1} |
-- | {"items": [{"qty": 5, "sku": "P3"}], "order": 2}                       |
-- +------------------------------------------------------------------------+`],
        [`<b>Advantages:</b> flexible schema, automatic validation, a rich function set, and efficient <i>partial updates</i>: <code>JSON_SET</code>, <code>JSON_INSERT</code>, <code>JSON_REPLACE</code>, <code>JSON_REMOVE</code> and <code>JSON_ARRAY_APPEND</code> change one path without you rewriting the whole document in application code.`,
            r`UPDATE profile
SET    doc = JSON_SET(doc, '$.age', 31, '$.city', 'Pune')   -- update one key, add another
WHERE  id = 1;

UPDATE profile
SET    doc = JSON_ARRAY_APPEND(doc, '$.skills', 'docker')   -- push onto the array
WHERE  id = 1;

SELECT doc FROM profile WHERE id = 1;

-- OUTPUT:
-- +-----------------------------------------------------------------------------------+
-- | doc                                                                               |
-- +-----------------------------------------------------------------------------------+
-- | {"age": 31, "city": "Pune", "name": "Abaji", "skills": ["sql", "java", "docker"]} |
-- +-----------------------------------------------------------------------------------+`],
        [`<b>Disadvantages:</b> the structure is not enforced (a typo in a key silently creates a new key), there are no foreign keys into a JSON value, and large documents are costly to read and update. Invalid JSON text is rejected at write time, which is good but must be handled by the application.`,
            r`INSERT INTO profile (doc) VALUES ('{name: "x"}');   -- keys must be double-quoted

-- OUTPUT:
-- ERROR 3140 (22032): Invalid JSON text: "Missing a name for object member."
--   at position 1 in value for column 'profile.doc'.`],
        [`<b>Limitations:</b> a JSON column cannot be indexed directly (only through generated columns or functional/multi-valued indexes), the document size is bounded by <code>max_allowed_packet</code>, and numbers beyond DOUBLE/BIGINT precision lose accuracy. JSON columns also cannot have a plain literal DEFAULT (an expression default is allowed from 8.0.13).`,
            r`CREATE INDEX idx_doc ON profile (doc);               -- direct index on JSON

-- OUTPUT:
-- ERROR 3152 (42000): JSON column 'doc' supports indexing only via generated
--   columns on a specified JSON path.`],
        `
   SQL values                           JSON column (binary, validated)
   'Abaji', 30, JSON_ARRAY(...)  ---->   +----------------------------------+
        |                               | header | key table | value table |
   JSON_OBJECT / JSON_ARRAY             +----------------------------------+
                                        keys sorted: len, then bytes
                                             |
                  +--------------------------+-------------------------+
                  v                          v                         v
          doc->'$.k' read            JSON_SET partial update    generated column
          (lookup, no re-parse)      (in-place when it fits)    + index for search
`,
        `Use JSON for genuinely variable or opaque data (payloads, settings, long-tail attributes), never as a way to avoid modelling the core entity. Keep anything you filter, join or constrain on in real columns. Plan for document growth, because every update to a large document is a read-modify-write of that row, and prefer storing small documents (a few KB) rather than a whole object graph.`
    ),

    'JSON_EXTRACT & JSON_VALUE': dd(
        [`<code>JSON_EXTRACT(doc, path)</code> returns the value at a JSON path as a JSON value (so strings keep their quotes). <code>doc-&gt;'$.k'</code> is shorthand for it, and <code>doc-&gt;&gt;'$.k'</code> additionally unquotes the result to a plain SQL string. <code>JSON_VALUE</code> (8.0.21+) extracts a scalar and converts it to a SQL type with <code>RETURNING</code>.`,
            r`CREATE TABLE person (id INT PRIMARY KEY, doc JSON);
INSERT INTO person VALUES
 (1, '{"name":"Abaji", "score":9,   "address":{"city":"Pune"},  "tags":["sql","java"]}'),
 (2, '{"name":"Raoji", "score":10,  "address":{"city":"Delhi"}, "tags":[]}'),
 (3, '{"name":"Moropant","score":100, "address":{"city":"Pune"},  "tags":["java"]}');

SELECT doc->'$.name'                    AS as_json,       -- JSON string, quoted
       doc->>'$.name'                   AS as_text,       -- unquoted SQL string
       JSON_EXTRACT(doc, '$.address.city') AS city_json   -- nested path
FROM   person WHERE id = 1;

-- OUTPUT:
-- +---------+---------+-----------+
-- | as_json | as_text | city_json |
-- +---------+---------+-----------+
-- | "Abaji" | Abaji   | "Pune"    |
-- +---------+---------+-----------+`],
        [`Application queries need typed values, not JSON fragments. <code>JSON_VALUE ... RETURNING</code> gives a correctly typed column, and <code>ON EMPTY / ON ERROR</code> clauses let you supply defaults instead of NULLs or surprises.`,
            r`SELECT id,
       JSON_VALUE(doc, '$.score' RETURNING UNSIGNED) + 1            AS next_score,  -- numeric
       JSON_VALUE(doc, '$.nickname' DEFAULT 'none' ON EMPTY)        AS nickname     -- missing key
FROM   person
ORDER  BY id;

-- OUTPUT:
-- +----+------------+----------+
-- | id | next_score | nickname |
-- +----+------------+----------+
-- |  1 |         10 | none     |
-- |  2 |         11 | none     |
-- |  3 |        101 | none     |
-- +----+------------+----------+`],
        [`Real use: filter on one attribute, read an array element, count array members, and expand an array into rows with <code>JSON_TABLE</code> (8.0.4+) so it can be joined and grouped like a normal table.`,
            r`-- Filter on a nested value, show the first tag and the tag count
SELECT id, doc->>'$.tags[0]' AS first_tag, JSON_LENGTH(doc, '$.tags') AS n_tags
FROM   person
WHERE  doc->>'$.address.city' = 'Pune';

-- Expand arrays into rows
SELECT p.id, jt.tag
FROM   person p,
       JSON_TABLE(p.doc, '$.tags[*]' COLUMNS (tag VARCHAR(20) PATH '$')) AS jt
ORDER  BY p.id, jt.tag;

-- OUTPUT:
-- +----+-----------+--------+
-- | id | first_tag | n_tags |
-- +----+-----------+--------+
-- |  1 | sql       |      2 |
-- |  3 | java      |      1 |
-- +----+-----------+--------+
-- +----+------+
-- | id | tag  |
-- +----+------+
-- |  1 | java |
-- |  1 | sql  |
-- |  3 | java |
-- +----+------+`],
        [`<b>Advantages:</b> path expressions reach any depth, wildcards (<code>$.tags[*]</code>, <code>$**.city</code>) match many values at once, and <code>JSON_TABLE</code> bridges JSON and relational worlds.`,
            r`SELECT JSON_EXTRACT(doc, '$.tags[*]')  AS all_tags,     -- wildcard returns an array
       JSON_EXTRACT(doc, '$**.city')    AS all_cities    -- any key named city, any depth
FROM   person WHERE id = 1;

-- OUTPUT:
-- +----------------+--------------+
-- | all_tags       | all_cities   |
-- +----------------+--------------+
-- | ["sql", "java"]| ["Pune"]     |
-- +----------------+--------------+`],
        [`<b>Disadvantages:</b> a missing path does not raise an error, it returns NULL, so a typo in a key name looks like "no data". Also, <code>-&gt;&gt;</code> returns text, so sorting or comparing numbers extracted that way is textual unless you cast.`,
            r`SELECT id, doc->>'$.score' AS score
FROM   person
ORDER  BY doc->>'$.score';                       -- text sort: '10' < '100' < '9'

SELECT doc->>'$.nme' AS typo_key FROM person WHERE id = 1;   -- silently NULL

-- OUTPUT:
-- +----+-------+
-- | id | score |
-- +----+-------+
-- |  2 | 10    |
-- |  3 | 100   |
-- |  1 | 9     |
-- +----+-------+
-- +----------+
-- | typo_key |
-- +----------+
-- | NULL     |
-- +----------+`],
        [`<b>Limitations:</b> the <code>-&gt;</code> and <code>-&gt;&gt;</code> operators accept only a column and a literal path (no expressions as path); keys with spaces or special characters need double quotes inside the path; <code>JSON_VALUE</code> needs 8.0.21 or later.`,
            r`INSERT INTO person VALUES (4, '{"first name": "Zed", "score": 7}');

SELECT doc->>'$."first name"' AS fname FROM person WHERE id = 4;   -- quote the key
SELECT doc->>'$.first name'   AS broken FROM person WHERE id = 4;  -- invalid path

-- OUTPUT:
-- +-------+
-- | fname |
-- +-------+
-- | Zed   |
-- +-------+
-- ERROR 3143 (42000): Invalid JSON path expression. The error is around character position 8.`],
        `
   doc = {"name":"Abaji","address":{"city":"Pune"},"tags":["sql","java"]}

   $                     whole document
   $.name                ----------------------->  "Abaji"       (-> keeps quotes)
   $.address.city        ----------------------->  "Pune"
   $.tags[0]             ----------------------->  "sql"
   $.tags[*]             ----------------------->  ["sql","java"]
   $**.city              any depth wildcard

   ->   JSON_EXTRACT                 returns JSON
   ->>  JSON_UNQUOTE(JSON_EXTRACT)   returns SQL text
   JSON_VALUE(... RETURNING type)    returns typed scalar
`,
        `Standardise on one extraction style per codebase and always cast to the type you compare or sort on. For attributes used in WHERE, JOIN or ORDER BY on large tables, promote them to a generated column with an index instead of extracting on every row. Treat NULL-for-missing-key as a data quality risk and guard it with CHECK or JSON_SCHEMA_VALID.`
    ),

    'JSON Indexes & Generated Columns': dd(
        [`A JSON column cannot be indexed directly. You index a <b>generated column</b> (a column computed from an expression such as <code>doc-&gt;&gt;'$.email'</code>), or use a <b>functional index</b> on an expression, or a <b>multi-valued index</b> (8.0.17+) that indexes every element of a JSON array. A <b>VIRTUAL</b> generated column is computed on read; a <b>STORED</b> one is written to disk.`,
            r`CREATE TABLE cust (
  id    INT PRIMARY KEY,
  doc   JSON,
  email VARCHAR(100) GENERATED ALWAYS AS (doc->>'$.email') VIRTUAL,  -- computed, not stored
  KEY idx_email (email)                                              -- secondary index on it
);
INSERT INTO cust (id, doc) VALUES
 (1, '{"email":"abaji@x.com","score":9, "tags":["sql","java"]}'),
 (2, '{"email":"raoji@x.com","score":10,"tags":["go"]}'),
 (3, '{"email":"moropant@x.com","score":100,"tags":["java"]}');

EXPLAIN SELECT id FROM cust WHERE email = 'abaji@x.com';

-- OUTPUT (example, partial columns):
-- +----+-------------+-------+------+-----------+------+
-- | id | select_type | table | type | key       | rows |
-- +----+-------------+-------+------+-----------+------+
-- |  1 | SIMPLE      | cust  | ref  | idx_email |    1 |
-- +----+-------------+-------+------+-----------+------+`],
        [`Without an index, every JSON filter is a full table scan that parses each document. With an index the same filter becomes a B-tree lookup, which is the difference between milliseconds and minutes on millions of rows.`,
            r`-- Functional index: index the expression itself (no visible extra column)
CREATE INDEX idx_score ON cust ((CAST(doc->>'$.score' AS UNSIGNED)));

-- The query must use the SAME expression to qualify
EXPLAIN SELECT id FROM cust WHERE CAST(doc->>'$.score' AS UNSIGNED) = 10;

-- OUTPUT (example, partial columns):
-- +----+-------------+-------+------+-----------+------+
-- | id | select_type | table | type | key       | rows |
-- +----+-------------+-------+------+-----------+------+
-- |  1 | SIMPLE      | cust  | ref  | idx_score |    1 |
-- +----+-------------+-------+------+-----------+------+`],
        [`Real use: searching "which customers have the tag java" over an array. A multi-valued index stores one index entry per array element and is used by <code>MEMBER OF</code>, <code>JSON_CONTAINS</code> and <code>JSON_OVERLAPS</code>.`,
            r`CREATE INDEX idx_tags ON cust ((CAST(doc->'$.tags' AS CHAR(20) ARRAY)));

SELECT id FROM cust WHERE 'java' MEMBER OF (doc->'$.tags') ORDER BY id;
EXPLAIN SELECT id FROM cust WHERE 'java' MEMBER OF (doc->'$.tags');

-- OUTPUT (example for the EXPLAIN, partial columns):
-- +----+
-- | id |
-- +----+
-- |  1 |
-- |  3 |
-- +----+
-- +----+-------------+-------+------+----------+------+
-- | id | select_type | table | type | key      | rows |
-- +----+-------------+-------+------+----------+------+
-- |  1 | SIMPLE      | cust  | ref  | idx_tags |    2 |
-- +----+-------------+-------+------+----------+------+`],
        [`<b>Advantages:</b> a generated column documents which JSON attribute is "promoted", can be a normal column in SELECT lists, and can carry NOT NULL or UNIQUE rules. Virtual columns cost no disk for the value itself; only the index is stored.`,
            r`-- Uniqueness on a JSON attribute, enforced by a unique index on the generated column
ALTER TABLE cust ADD UNIQUE KEY uq_email (email);
INSERT INTO cust (id, doc) VALUES (4, '{"email":"abaji@x.com"}');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'abaji@x.com' for key 'cust.uq_email'`],
        [`<b>Disadvantages:</b> each index adds write cost and storage; a STORED column also duplicates the data on disk; and adding a STORED column rebuilds the table. The extracted text from <code>-&gt;&gt;</code> uses a binary-style (case-sensitive) collation, which can surprise you when you expect case-insensitive email matching.`,
            r`SELECT id FROM cust WHERE email = 'ABAJI@X.COM';     -- case-sensitive compare

-- OUTPUT:
-- Empty set (0.00 sec)`],
        [`<b>Limitations:</b> the optimiser uses a functional index only when the query expression matches the indexed one exactly (same cast, same path). A multi-valued index allows only one array part per index, cannot be used for covering reads or ORDER BY, and is 8.0.17+ only.`,
            r`-- Different cast than the index definition: the index is NOT used
EXPLAIN SELECT id FROM cust WHERE CAST(doc->>'$.score' AS SIGNED) = 10;

-- OUTPUT (example, partial columns):
-- +----+-------------+-------+------+------+------+
-- | id | select_type | table | type | key  | rows |
-- +----+-------------+-------+------+------+------+
-- |  1 | SIMPLE      | cust  | ALL  | NULL |    3 |
-- +----+-------------+-------+------+------+------+`],
        `
   JSON doc column (not indexable)
        |
        +--> generated col  email = doc->>'$.email'   --> B-tree  idx_email
        |        (VIRTUAL: computed on read, STORED: kept on disk)
        |
        +--> functional index  ((CAST(doc->>'$.score' AS UNSIGNED)))
        |        query must repeat the identical expression
        |
        +--> multi-valued index ((CAST(doc->'$.tags' AS CHAR(20) ARRAY)))
                 one index entry per array element
                 used by MEMBER OF / JSON_CONTAINS / JSON_OVERLAPS
`,
        `Index only the 2 to 4 attributes your queries really use; if you find yourself indexing many JSON paths, those attributes belong in real columns. Prefer VIRTUAL generated columns with an index (cheap to add online in many cases) unless you need the value stored for other reasons. Verify with EXPLAIN after every change, because expression mismatch silently falls back to a full scan.`
    ),

    'JSON vs Relational Columns': dd(
        [`Both can hold the same facts. <b>Relational columns</b> give you types, constraints, foreign keys, statistics and simple indexes. <b>JSON</b> gives you a flexible shape and one column for many optional attributes. The best design is usually hybrid: core attributes as columns, the long tail as JSON.`,
            r`-- Relational: every attribute is a typed column
CREATE TABLE product_rel (
  id INT PRIMARY KEY, name VARCHAR(50) NOT NULL,
  price DECIMAL(8,2) NOT NULL, color VARCHAR(20), size VARCHAR(5)
);
-- Hybrid: core columns + JSON for optional attributes
CREATE TABLE product_hyb (
  id INT PRIMARY KEY, name VARCHAR(50) NOT NULL,
  price DECIMAL(8,2) NOT NULL, attrs JSON
);
INSERT INTO product_rel VALUES (1,'Shirt',499.00,'blue','M');
INSERT INTO product_hyb VALUES (1,'Shirt',499.00,'{"color":"blue","size":"M"}'),
                               (2,'Laptop',55000.00,'{"ram_gb":16,"cpu":"i7"}');
SELECT id, name, attrs FROM product_hyb ORDER BY id;

-- OUTPUT:
-- +----+--------+-----------------------------------+
-- | id | name   | attrs                             |
-- +----+--------+-----------------------------------+
-- |  1 | Shirt  | {"size": "M", "color": "blue"}    |
-- |  2 | Laptop | {"cpu": "i7", "ram_gb": 16}       |
-- +----+--------+-----------------------------------+`],
        [`The relational way needs a column (and a migration) for every attribute of every product type, so a catalogue with thousands of different attributes becomes a table of mostly NULLs. The classic alternative, EAV (entity-attribute-value), is slow and untyped. JSON solves the "sparse, evolving attributes" problem.`,
            r`-- Adding a new attribute: relational needs DDL, JSON needs none
ALTER TABLE product_rel ADD COLUMN material VARCHAR(20);      -- DDL, schema change

UPDATE product_hyb
SET    attrs = JSON_SET(attrs, '$.material', 'cotton')         -- plain DML
WHERE  id = 1;
SELECT attrs FROM product_hyb WHERE id = 1;

-- OUTPUT:
-- +------------------------------------------------------+
-- | attrs                                                |
-- +------------------------------------------------------+
-- | {"size": "M", "color": "blue", "material": "cotton"} |
-- +------------------------------------------------------+`],
        [`Real use: an e-commerce catalogue keeps price, stock and category as columns (filtered, joined, aggregated constantly) and technical specs as JSON (displayed and occasionally filtered). Money and counts stay relational so SUM, constraints and foreign keys work natively.`,
            r`SELECT name, price
FROM   product_hyb
WHERE  price < 1000                                    -- fast, typed, indexable column
  AND  attrs->>'$.color' = 'blue';                     -- long-tail attribute from JSON

-- OUTPUT:
-- +-------+--------+
-- | name  | price  |
-- +-------+--------+
-- | Shirt | 499.00 |
-- +-------+--------+`],
        [`<b>JSON advantages:</b> no migrations for new optional attributes, natural fit for documents from APIs, fewer joins. <b>Relational advantages:</b> type safety, NOT NULL/UNIQUE/FOREIGN KEY/CHECK, accurate optimiser statistics, narrow rows and cheap updates. You can still add rules to JSON with <code>JSON_SCHEMA_VALID</code> in a CHECK constraint (8.0.17+).`,
            r`ALTER TABLE product_hyb ADD CONSTRAINT chk_attrs CHECK (
  attrs IS NULL OR JSON_SCHEMA_VALID(
    '{"type":"object","properties":{"ram_gb":{"type":"number"}}}', attrs)
);

INSERT INTO product_hyb VALUES (3,'Phone',20000.00,'{"ram_gb":"eight"}');  -- wrong type

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'chk_attrs' is violated.`],
        [`<b>Disadvantages of JSON:</b> no foreign keys into it, weaker optimiser statistics (selectivity of JSON paths is guessed), every access pays an extraction cost, large documents slow row reads, and aggregating requires casts. <b>Disadvantages of relational:</b> rigid shape, sparse NULL-heavy tables, frequent DDL.`,
            r`-- Aggregating a JSON number needs an explicit conversion every time
SELECT SUM(JSON_VALUE(attrs, '$.ram_gb' RETURNING UNSIGNED)) AS total_ram
FROM   product_hyb;

-- OUTPUT:
-- +-----------+
-- | total_ram |
-- +-----------+
-- |        16 |
-- +-----------+`],
        [`<b>Limitations:</b> a JSON column is read as a whole when selected, a covering index cannot cover a JSON path unless it is a generated column, and replication or binlog (row format) records the full document for many updates unless <code>binlog_row_value_options=PARTIAL_JSON</code> is set.`,
            r`-- Reduce binlog volume for partial JSON updates (row-based replication)
SET GLOBAL binlog_row_value_options = 'PARTIAL_JSON';
SHOW VARIABLES LIKE 'binlog_row_value_options';

-- OUTPUT:
-- +--------------------------+--------------+
-- | Variable_name            | Value        |
-- +--------------------------+--------------+
-- | binlog_row_value_options | PARTIAL_JSON |
-- +--------------------------+--------------+`],
        `
   Entity: product
   +------------------------+--------------------------------------+
   |  RELATIONAL COLUMNS    |  JSON column (attrs)                 |
   |  id, name, price,      |  {"color":"blue","size":"M"}         |
   |  stock, category_id    |  {"ram_gb":16,"cpu":"i7"}            |
   |                        |                                      |
   |  typed, constrained,   |  flexible, optional, sparse          |
   |  indexed, joined       |  index via generated column if hot   |
   +------------------------+--------------------------------------+
        everything you filter / join / sum  -->  column
        everything you only display / rarely filter  -->  JSON
`,
        `Model the stable core relationally and let JSON carry only genuinely variable attributes; promote a JSON key to a real column the moment it becomes a join key, a frequent filter or a constraint. Document the allowed JSON shape with JSON_SCHEMA_VALID, and keep documents small. If most of your data ends up in JSON and you need cross-document queries, evaluate a document store instead of fighting the relational engine.`
    ),
};
