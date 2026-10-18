// Module 4 (Data Types), part A.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s04a: Record<string, DeepDive> = {
    'Numeric Types: INT, BIGINT, SMALLINT & TINYINT': dd(
        [`Integer types differ in storage and range: TINYINT 1 byte (-128..127), SMALLINT 2 (-32768..32767), MEDIUMINT 3, INT 4 (about +-2.1 billion), BIGINT 8 (about +-9.2e18). Add <code>UNSIGNED</code> to double the positive range.`,
            r`CREATE TABLE nums (t TINYINT, s SMALLINT, i INT, b BIGINT);
INSERT INTO nums VALUES (127, 32767, 2147483647, 9223372036854775807);   -- each at its max
SELECT * FROM nums;

-- OUTPUT:
-- +-----+-------+------------+---------------------+
-- | t   | s     | i          | b                   |
-- +-----+-------+------------+---------------------+
-- | 127 | 32767 | 2147483647 | 9223372036854775807 |
-- +-----+-------+------------+---------------------+`],
        [`Choosing the smallest type that fits saves disk, memory and index size; choosing too small causes overflow errors in production at the worst time.`,
            r`INSERT INTO nums (t) VALUES (128);              -- one above TINYINT max

-- OUTPUT:
-- ERROR 1264 (22003): Out of range value for column 't' at row 1`],
        [`Ages and flags use TINYINT UNSIGNED, counters use INT, user ids INT UNSIGNED, and event or order ids that may pass 4 billion use BIGINT.`,
            r`CREATE TABLE event_log (
    id     BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,   -- will never run out
    status TINYINT UNSIGNED NOT NULL DEFAULT 0,          -- 0..255 status code
    hits   INT UNSIGNED NOT NULL DEFAULT 0
);
INSERT INTO event_log (status) VALUES (2),(1);
SELECT * FROM event_log;

-- OUTPUT:
-- +----+--------+------+
-- | id | status | hits |
-- +----+--------+------+
-- |  1 |      2 |    0 |
-- |  2 |      1 |    0 |
-- +----+--------+------+`],
        [`<b>Advantages:</b> exact, fast arithmetic, tiny storage, great for keys and counters. <code>UNSIGNED</code> doubles the max for non-negative data.`,
            r`CREATE TABLE u8 (x TINYINT UNSIGNED);       -- 0..255 in the same 1 byte
INSERT INTO u8 VALUES (255);
SELECT x, x + 1 AS next_value FROM u8;        -- arithmetic is done in a wider type

-- OUTPUT:
-- +-----+------------+
-- | x   | next_value |
-- +-----+------------+
-- | 255 |        256 |
-- +-----+------------+`],
        [`<b>Disadvantages:</b> bigger types cost space in every index; the display width in INT(11) is meaningless (it affects nothing, deprecated in 8.0).`,
            r`-- INT(3) still stores 2147483647; the number only hints at ZEROFILL padding
CREATE TABLE w (x INT(3));
INSERT INTO w VALUES (123456);
SELECT x FROM w;

-- OUTPUT (with a deprecation warning on 8.0.17+):
-- +--------+
-- | x      |
-- +--------+
-- | 123456 |
-- +--------+`],
        [`<b>Limitations:</b> in strict mode (default) out-of-range inserts fail; with strict mode off MySQL silently clips to the max, hiding bugs. AUTO_INCREMENT stops at the type's max and then errors.`,
            r`CREATE TABLE tiny_ids (id TINYINT AUTO_INCREMENT PRIMARY KEY);
INSERT INTO tiny_ids VALUES (127);
INSERT INTO tiny_ids VALUES (NULL);       -- needs 128

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '127' for key 'tiny_ids.PRIMARY'`],
        `
   type        bytes   signed range                    unsigned max
   TINYINT       1     -128 .. 127                     255
   SMALLINT      2     -32,768 .. 32,767               65,535
   MEDIUMINT     3     -8,388,608 .. 8,388,607         16,777,215
   INT           4     -2.147e9 .. 2.147e9             4.29e9
   BIGINT        8     -9.22e18 .. 9.22e18             1.84e19
`,
        `Use BIGINT UNSIGNED for ids of anything that grows unbounded; use the smallest type for lookup columns, since every secondary index copies the PK. Never rely on INT(N) display width, and keep sql_mode strict.`
    ),

    'DECIMAL, FLOAT & DOUBLE': dd(
        [`<b>DECIMAL(p,s)</b> is exact fixed-point (p total digits, s after the point) for money. <b>FLOAT</b> (4 bytes) and <b>DOUBLE</b> (8 bytes) are approximate binary floating point for scientific data.`,
            r`CREATE TABLE price (d DECIMAL(10,2), f FLOAT, db DOUBLE);
INSERT INTO price VALUES (0.10, 0.10, 0.10);
SELECT d, f, db FROM price;

-- OUTPUT:
-- +------+------+------+
-- | d    | f    | db   |
-- +------+------+------+
-- | 0.10 |  0.1 |  0.1 |
-- +------+------+------+`],
        [`Binary floating point cannot represent 0.1 exactly, so sums drift. Accounting must be exact to the paisa, so it uses DECIMAL.`,
            r`SELECT 0.1 + 0.2 = 0.3                    AS decimal_equal,        -- literals are DECIMAL
       CAST(0.1 AS DOUBLE) + CAST(0.2 AS DOUBLE) = CAST(0.3 AS DOUBLE) AS double_equal;

-- OUTPUT:
-- +---------------+--------------+
-- | decimal_equal | double_equal |
-- +---------------+--------------+
-- |             1 |            0 |
-- +---------------+--------------+`],
        [`Prices, balances and tax use DECIMAL(12,2) or DECIMAL(19,4); measurements, coordinates and ML scores use DOUBLE or FLOAT.`,
            r`CREATE TABLE invoice (id INT, amt DECIMAL(12,2));
INSERT INTO invoice VALUES (1,19.99),(2,0.01),(3,100.00);
SELECT SUM(amt) AS total, ROUND(SUM(amt) * 0.18, 2) AS gst FROM invoice;

-- OUTPUT:
-- +--------+-------+
-- | total  | gst   |
-- +--------+-------+
-- | 120.00 | 21.60 |
-- +--------+-------+`],
        [`<b>Advantages:</b> DECIMAL gives exact results and predictable rounding; FLOAT and DOUBLE are compact and very fast with huge range.`,
            r`SELECT 1e308 * 10 AS big_double_attempt;      -- DOUBLE range is about 1.8e308

-- OUTPUT:
-- ERROR 1690 (22003): DOUBLE value is out of range in '(1e308 * 10)'`],
        [`<b>Disadvantages:</b> DECIMAL uses more storage and is slower than native floats; FLOAT and DOUBLE accumulate rounding errors and cannot be compared with = safely.`,
            r`CREATE TABLE f_sum (x DOUBLE);
INSERT INTO f_sum VALUES (0.1),(0.2);
SELECT SUM(x) = 0.3 AS equals_point3, SUM(x) AS value FROM f_sum;

-- OUTPUT:
-- +---------------+---------------------+
-- | equals_point3 | value               |
-- +---------------+---------------------+
-- |             0 | 0.30000000000000004 |
-- +---------------+---------------------+`],
        [`<b>Limitations:</b> DECIMAL max is 65 digits (30 after the point); excess fractional digits are rounded, and values beyond the declared precision are rejected.`,
            r`INSERT INTO price (d) VALUES (123456789.99);   -- needs 9+2 = 11 digits, column holds 10
INSERT INTO price (d) VALUES (1.005);            -- rounds to 1.01 with a note

-- OUTPUT:
-- ERROR 1264 (22003): Out of range value for column 'd' at row 1
-- Query OK, 1 row affected, 1 warning   -- Note 1265: Data truncated for column 'd'`],
        `
   DECIMAL(10,2)           FLOAT / DOUBLE
   digits stored exactly   binary fraction, approximate
   12345678.90             0.1 -> 0.100000000000000005551...
   money, tax, balances    sensors, GPS, statistics
   slower, bigger          fast, compact, IEEE-754
`,
        `Money = DECIMAL, or integer minor units (paise) in BIGINT when you want the fastest and unambiguous arithmetic. Never use FLOAT for currency or equality filters; if you must compare doubles, use a tolerance or round first.`
    ),

    'CHAR & VARCHAR': dd(
        [`<b>CHAR(n)</b> is fixed length, right-padded with spaces (padding stripped on read). <b>VARCHAR(n)</b> is variable length and stores a 1 or 2 byte length prefix plus the actual bytes. n counts characters, not bytes.`,
            r`CREATE TABLE names (c CHAR(5), v VARCHAR(5));
INSERT INTO names VALUES ('ab', 'ab');
SELECT c, v, LENGTH(c) AS len_c, LENGTH(v) AS len_v FROM names;

-- OUTPUT:
-- +------+------+-------+-------+
-- | c    | v    | len_c | len_v |
-- +------+------+-------+-------+
-- | ab   | ab   |     2 |     2 |
-- +------+------+-------+-------+`],
        [`Choose by data shape: fixed-width codes (country codes, hashes) fit CHAR; names and emails vary, so VARCHAR saves space. The wrong choice wastes storage or breaks comparisons.`,
            r`-- CHAR suits fixed codes
CREATE TABLE country (code CHAR(2) PRIMARY KEY, name VARCHAR(60));
INSERT INTO country VALUES ('IN','India'),('US','United States');
SELECT * FROM country WHERE code = 'IN';

-- OUTPUT:
-- +------+-------+
-- | code | name  |
-- +------+-------+
-- | IN   | India |
-- +------+-------+`],
        [`Typical sizes: email VARCHAR(254), URL VARCHAR(2048), name VARCHAR(100), UUID text CHAR(36), SHA-256 hex CHAR(64). Always use utf8mb4 so emoji and all scripts fit.`,
            r`CREATE TABLE users (
    id    INT PRIMARY KEY,
    email VARCHAR(254) CHARACTER SET utf8mb4 NOT NULL,
    hash  CHAR(64) CHARACTER SET ascii NOT NULL      -- ascii = 1 byte per char
);
SELECT CHAR_LENGTH('héllo') AS chars, LENGTH('héllo') AS bytes;

-- OUTPUT:
-- +-------+-------+
-- | chars | bytes |
-- +-------+-------+
-- |     5 |     6 |
-- +-------+-------+`],
        [`<b>Advantages:</b> VARCHAR saves space and is flexible; CHAR is slightly faster for fixed-width and avoids row-length changes on update.`,
            r`SELECT 'a' = 'a ' COLLATE utf8mb4_general_ci AS pad_space,   -- PAD SPACE: trailing blanks ignored
       'a' = 'a ' COLLATE utf8mb4_0900_ai_ci  AS no_pad;      -- NO PAD (8.0 default): they count

-- OUTPUT:
-- +----------+--------+
-- | pad_space | no_pad |
-- +----------+--------+
-- |        1 |      0 |
-- +----------+--------+`],
        [`<b>Disadvantages:</b> oversized VARCHAR still costs memory in temp tables and sorts (MySQL allocates the max); CHAR wastes space on short values; trailing-space rules differ by collation.`,
            r`-- Do not declare VARCHAR(10000) "just in case": sorts and temp tables size to the max
CREATE TABLE sloppy (note VARCHAR(10000) CHARACTER SET utf8mb4);   -- 4 bytes x 10000 = 40000 bytes max

-- OUTPUT:
-- Query OK, 0 rows affected  (works, but each sort buffer row is reserved at full size)`],
        [`<b>Limitations:</b> the row-size limit 65,535 bytes is shared by all columns (utf8mb4 uses up to 4 bytes per char, so VARCHAR(16383) is the max single column); CHAR max is 255; an index key is limited to 3072 bytes.`,
            r`CREATE TABLE too_big (v VARCHAR(20000) CHARACTER SET utf8mb4);

-- OUTPUT:
-- ERROR 1074 (42000): Column length too big for column 'v' (max = 16383); use BLOB or TEXT instead`],
        `
   CHAR(5)   'ab'  -> [a][b][ ][ ][ ]        fixed 5 chars
   VARCHAR(5)'ab'  -> [len=2][a][b]          1-2 byte prefix + data
   utf8mb4 : up to 4 bytes / char     ascii : 1 byte / char
`,
        `Default to VARCHAR sized to a real bound, CHAR only for fixed-width codes, and ASCII charset for hex hashes and UUID strings to halve index size. Store UUIDs as BINARY(16) when index size and insert locality matter.`
    ),

    'TEXT, MEDIUMTEXT & LONGTEXT': dd(
        [`TEXT types hold long character data: TINYTEXT 255 bytes, TEXT 64 KB, MEDIUMTEXT 16 MB, LONGTEXT 4 GB. They are stored off-page when large, unlike VARCHAR which is mostly stored inline.`,
            r`CREATE TABLE article (id INT PRIMARY KEY, title VARCHAR(120), body TEXT);
INSERT INTO article VALUES (1,'Intro', REPEAT('MySQL ', 1000));
SELECT id, title, LENGTH(body) AS bytes FROM article;

-- OUTPUT:
-- +----+-------+-------+
-- | id | title | bytes |
-- +----+-------+-------+
-- |  1 | Intro |  6000 |
-- +----+-------+-------+`],
        [`Blog posts, comments, descriptions and JSON-as-text outgrow VARCHAR limits. TEXT stores them without hitting the row-size ceiling.`,
            r`SELECT id, CHAR_LENGTH(body) AS chars FROM article WHERE body LIKE '%MySQL%';

-- OUTPUT:
-- +----+-------+
-- | id | chars |
-- +----+-------+
-- |  1 |  6000 |
-- +----+-------+`],
        [`CMS pages, product descriptions, logs and emails use TEXT or MEDIUMTEXT; short, searched fields stay VARCHAR. Large binary files belong in object storage, not LONGTEXT.`,
            r`-- Pick MEDIUMTEXT for up to 16 MB documents
ALTER TABLE article ADD COLUMN html MEDIUMTEXT;
SHOW COLUMNS FROM article LIKE 'html';

-- OUTPUT:
-- | html | mediumtext | YES | | NULL | |`],
        [`<b>Advantages:</b> huge capacity; only the pointer lives in the row, so row-size limits are not a problem; supports FULLTEXT indexes.`,
            r`ALTER TABLE article ADD FULLTEXT INDEX ft_body (title, body);
SELECT COUNT(*) AS hits FROM article WHERE MATCH(title, body) AGAINST ('MySQL');

-- OUTPUT:
-- +------+
-- | hits |
-- +------+
-- |    1 |
-- +------+`],
        [`<b>Disadvantages:</b> TEXT cannot have a DEFAULT (before 8.0.13 expression defaults), fetching it needs extra page reads, and big sorts spill to disk temp tables. Avoid <code>SELECT *</code> on tables with TEXT.`,
            r`CREATE TABLE no_default (t TEXT DEFAULT 'abc');

-- OUTPUT:
-- ERROR 1101 (42000): BLOB, TEXT, GEOMETRY or JSON column 't' can't have a default value
-- (allowed only as expression: DEFAULT ('abc') on 8.0.13+)`],
        [`<b>Limitations:</b> a normal index needs a prefix length; the packet limit max_allowed_packet caps what a single statement can carry.`,
            r`CREATE INDEX idx_body ON article (body);                 -- no prefix: not allowed
CREATE INDEX idx_body ON article (body(100));             -- prefix index works

-- OUTPUT:
-- ERROR 1170 (42000): BLOB/TEXT column 'body' used in key specification without a key length
-- Query OK, 0 rows affected`],
        `
   VARCHAR(255)   inline in the row page
   TEXT / LONGTEXT:   row ──► [20-byte pointer] ──► overflow pages
   TINYTEXT 255 B | TEXT 64 KB | MEDIUMTEXT 16 MB | LONGTEXT 4 GB
`,
        `Keep hot rows narrow: move big text to a separate table or object storage and select it only when needed. Use FULLTEXT or an external search engine instead of LIKE '%word%' scans over TEXT.`
    ),
};
