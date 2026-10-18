// Module 16 (Keys), part K.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s16k: Record<string, DeepDive> = {
    'Alternate Key': dd(
        [`An <b>alternate key</b> is a candidate key that was <i>not</i> chosen as the primary key. It still identifies a row uniquely, so in MySQL you declare it as <code>UNIQUE</code> (and normally <code>NOT NULL</code>).`,
            r`CREATE TABLE app_user (
    id       BIGINT       AUTO_INCREMENT PRIMARY KEY,   -- chosen candidate key
    email    VARCHAR(80)  NOT NULL UNIQUE,              -- alternate key 1
    username VARCHAR(30)  NOT NULL UNIQUE               -- alternate key 2
);
INSERT INTO app_user (email, username) VALUES ('abaji@x.com','abaji'),('raoji@x.com','raoji');
SHOW INDEX FROM app_user;

-- OUTPUT (example, trimmed):
-- +----------+------------+----------+-------------+
-- | Table    | Non_unique | Key_name | Column_name |
-- +----------+------------+----------+-------------+
-- | app_user |          0 | PRIMARY  | id          |
-- | app_user |          0 | email    | email       |
-- | app_user |          0 | username | username    |
-- +----------+------------+----------+-------------+`],
        [`People and systems look rows up by what they know (an email at login, an ISBN at a till), not by an internal id. Alternate keys make those lookups both unique and fast, and prevent two accounts for one email.`,
            r`EXPLAIN SELECT id FROM app_user WHERE email = 'abaji@x.com';

-- OUTPUT (example, trimmed):
-- +------+-------+-------+------+
-- | type | key   | ref   | rows |
-- +------+-------+-------+------+
-- | const| email | const |    1 |
-- +------+-------+-------+------+`],
        [`A foreign key may reference any unique key in InnoDB, not only the primary key. Referencing a stable alternate key like a country code makes child tables readable without a join.`,
            r`CREATE TABLE country (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    code CHAR(2) NOT NULL UNIQUE,                  -- alternate key
    name VARCHAR(30)
);
CREATE TABLE city (
    id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(30), country_code CHAR(2),
    FOREIGN KEY (country_code) REFERENCES country(code)   -- references the alternate key
);
INSERT INTO country (code, name) VALUES ('IN','India');
INSERT INTO city (name, country_code) VALUES ('Pune','IN');
SELECT name, country_code FROM city;

-- OUTPUT:
-- +------+--------------+
-- | name | country_code |
-- +------+--------------+
-- | Pune | IN           |
-- +------+--------------+`],
        [`<b>Advantages:</b> the database guarantees uniqueness of every real-world identifier you care about, not just the surrogate id.`,
            r`INSERT INTO app_user (email, username) VALUES ('abaji@x.com','asha2');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'abaji@x.com' for key 'app_user.email'`],
        [`<b>Disadvantages:</b> each alternate key is another B-tree: extra disk, extra memory and extra work on every insert and update. And a nullable alternate key allows many NULLs, so declare NOT NULL when the value is mandatory.`,
            r`CREATE TABLE weak (id INT PRIMARY KEY, passport VARCHAR(20) UNIQUE);   -- NULL allowed
INSERT INTO weak VALUES (1,NULL),(2,NULL),(3,'P123');
SELECT * FROM weak ORDER BY id;

-- OUTPUT:
-- +----+----------+
-- | id | passport |
-- +----+----------+
-- |  1 | NULL     |
-- |  2 | NULL     |
-- |  3 | P123     |
-- +----+----------+`],
        [`<b>Limitations:</b> uniqueness follows the column collation. The default utf8mb4_0900_ai_ci ignores case and accents, so 'Abaji@x.com' collides with 'abaji@x.com'. That is often desirable for email, but not for case-sensitive identifiers. Index keys are also limited to 3072 bytes.`,
            r`INSERT INTO app_user (email, username) VALUES ('ABAJI@X.COM','asha3');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry 'ABAJI@X.COM' for key 'app_user.email'

-- Case-sensitive identifier: pick a binary-ish collation for that column
-- ALTER TABLE app_user MODIFY username VARCHAR(30) COLLATE utf8mb4_0900_as_cs NOT NULL;`],
        `
   Candidate keys of app_user:   {id}    {email}    {username}
                                   │         │           │
                                   ▼         └─────┬─────┘
                              PRIMARY KEY     ALTERNATE KEYS
                              (clustered)     UNIQUE, NOT NULL  (secondary indexes)
                                   ▲               ▲
                                   └── FKs may reference either ──┘
`,
        `Declare every identifier the business treats as unique as an alternate key, even if you always join on the surrogate. Normalise values before they reach the index (lower-case email, trim spaces), and mind index width: a long VARCHAR alternate key is stored in the index and increases buffer-pool pressure.`
    ),

    'Natural Key vs Surrogate Key': dd(
        [`A <b>natural key</b> is made of real-world data that already identifies the row (email, ISBN, country code). A <b>surrogate key</b> is a meaningless value created by the database (AUTO_INCREMENT, UUID) whose only job is to identify the row.`,
            r`-- Natural PK: the ISBN itself
CREATE TABLE book_nat  (isbn CHAR(13) PRIMARY KEY, title VARCHAR(50));
-- Surrogate PK: a generated number, ISBN kept as an alternate key
CREATE TABLE book_sur  (id BIGINT AUTO_INCREMENT PRIMARY KEY, isbn CHAR(13) NOT NULL UNIQUE, title VARCHAR(50));
INSERT INTO book_nat VALUES ('9780131103627','The C Programming Language');
INSERT INTO book_sur (isbn, title) VALUES ('9780131103627','The C Programming Language');
SELECT * FROM book_sur;

-- OUTPUT:
-- +----+---------------+----------------------------+
-- | id | isbn          | title                      |
-- +----+---------------+----------------------------+
-- |  1 | 9780131103627 | The C Programming Language |
-- +----+---------------+----------------------------+`],
        [`Real-world identifiers change: people change email, companies reissue codes, standards rename things. A natural PK that changes must be rewritten in every child table. A surrogate never has to change.`,
            r`CREATE TABLE u_nat (email VARCHAR(60) PRIMARY KEY);
CREATE TABLE u_log (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(60),
    FOREIGN KEY (email) REFERENCES u_nat(email) ON UPDATE CASCADE);
INSERT INTO u_nat VALUES ('abaji@old.com');
INSERT INTO u_log (email) VALUES ('abaji@old.com');
UPDATE u_nat SET email = 'abaji@new.com';        -- rewrites parent AND every child row
SELECT * FROM u_log;

-- OUTPUT:
-- +----+--------------+
-- | id | email        |
-- +----+--------------+
-- |  1 | abaji@new.com |
-- +----+--------------+`],
        [`Most OLTP systems use BIGINT AUTO_INCREMENT. Distributed systems that generate ids on many nodes use UUIDs; MySQL 8 offers UUID_TO_BIN with a swap flag so time-ordered UUIDs insert sequentially and stay index-friendly.`,
            r`CREATE TABLE evt (
    id      BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID(), 1)),   -- ordered, 16 bytes
    payload VARCHAR(30)
);
INSERT INTO evt (payload) VALUES ('signup'),('login');
SELECT BIN_TO_UUID(id, 1) AS id, payload FROM evt ORDER BY id;

-- OUTPUT (example):
-- +--------------------------------------+---------+
-- | id                                   | payload |
-- +--------------------------------------+---------+
-- | 11ef8a1c-3b52-7f0e-9a31-0242ac110002 | signup  |
-- | 11ef8a1c-3b52-8a11-9a31-0242ac110002 | login   |
-- +--------------------------------------+---------+`],
        [`<b>Advantages of surrogate keys:</b> short, fixed width and immutable. In InnoDB every secondary index entry stores the primary key, so a narrow PK shrinks all indexes. Inserts in increasing order also avoid page splits.`,
            r`INSERT INTO book_sur (isbn, title) VALUES ('9780201633610','Design Patterns');
SELECT LAST_INSERT_ID() AS new_id;               -- id handed back to the application

-- OUTPUT:
-- +--------+
-- | new_id |
-- +--------+
-- |      2 |
-- +--------+`],
        [`<b>Disadvantages of surrogate keys:</b> they carry no meaning and prevent no real-world duplicates. If you forget a UNIQUE on the natural identifier, the same book can be entered twice under different ids.`,
            r`CREATE TABLE book_oops (id INT AUTO_INCREMENT PRIMARY KEY, isbn CHAR(13), title VARCHAR(50));  -- no UNIQUE
INSERT INTO book_oops (isbn, title) VALUES ('9780131103627','C Book'),('9780131103627','C Book');
SELECT id, isbn FROM book_oops;

-- OUTPUT:
-- +----+---------------+
-- | id | isbn          |
-- +----+---------------+
-- |  1 | 9780131103627 |
-- |  2 | 9780131103627 |      <- same book twice
-- +----+---------------+`],
        [`<b>Limitations:</b> an AUTO_INCREMENT column has a ceiling (INT is about 2.1 billion; use BIGINT UNSIGNED for large tables), can have gaps after rollbacks and failed inserts, and sequential public ids can be guessed by outsiders. Natural keys have their own limits: width, change, privacy.`,
            r`CREATE TABLE tiny (id INT AUTO_INCREMENT PRIMARY KEY);
INSERT INTO tiny VALUES (2147483647);            -- INT maximum
INSERT INTO tiny VALUES (NULL);                  -- next value would overflow

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '2147483647' for key 'tiny.PRIMARY'`],
        `
   Natural key                          Surrogate key
   PK = email VARCHAR(60)               PK = id BIGINT (8 bytes)    + UNIQUE(email)
   ┌──────────────────┐                 ┌────┬──────────────────┐
   │ abaji@x.com       │                 │  1 │ abaji@x.com       │
   └──────────────────┘                 └────┴──────────────────┘
   meaningful, wide, can change         meaningless, narrow, never changes
   copied into every child + 2nd index  copied into every child + 2nd index (small)
`,
        `Use a surrogate PK with a UNIQUE constraint on each natural identifier: you get a small immutable key for joins and indexes plus real-world integrity. Choose BIGINT auto-increment for single-writer OLTP, ordered UUID or snowflake ids when many writers or shards create ids, and keep a natural PK only for small, stable code tables such as country or currency.`
    ),

    'Primary Key vs Unique Key': dd(
        [`Both enforce uniqueness, but they differ in role. A table has <b>one</b> primary key, which can never contain NULL and is the row's identity (and the InnoDB clustered index). A table can have <b>many</b> unique keys, which may allow NULLs and are alternate access paths.`,
            r`CREATE TABLE emp (
    id    INT         PRIMARY KEY,                 -- 1 per table, NOT NULL, clustered
    email VARCHAR(60) UNIQUE,                      -- many allowed, NULLs allowed
    pan   CHAR(10)    UNIQUE
);
SHOW INDEX FROM emp;

-- OUTPUT (example, trimmed):
-- +-------+------------+----------+-------------+
-- | Table | Non_unique | Key_name | Column_name |
-- +-------+------------+----------+-------------+
-- | emp   |          0 | PRIMARY  | id          |
-- | emp   |          0 | email    | email       |
-- | emp   |          0 | pan      | pan         |
-- +-------+------------+----------+-------------+`],
        [`You need both: the primary key says "this is row number N" for joins, foreign keys and updates; unique keys say "no two rows may share this business value". One mechanism cannot do both jobs.`,
            r`-- PK identifies the row to change; UNIQUE protects the business rule
INSERT INTO emp VALUES (1,'abaji@x.com','ABCDE1234F');
UPDATE emp SET email = 'abaji@corp.com' WHERE id = 1;       -- identify by PK
INSERT INTO emp VALUES (2,'abaji@corp.com','ZZZZZ9999Z');   -- breaks the unique rule

-- OUTPUT:
-- Query OK, 1 row affected
-- Rows matched: 1  Changed: 1  Warnings: 0
-- ERROR 1062 (23000): Duplicate entry 'abaji@corp.com' for key 'emp.email'`],
        [`Optional identifiers (a tax number that some customers lack) belong in a UNIQUE column that allows NULL. A PK cannot be NULL, so it suits only mandatory identity.`,
            r`INSERT INTO emp VALUES (3,NULL,NULL),(4,NULL,NULL);     -- many NULLs in UNIQUE columns
SELECT id, email FROM emp WHERE email IS NULL ORDER BY id;

-- OUTPUT:
-- +----+-------+
-- | id | email |
-- +----+-------+
-- |  3 | NULL  |
-- |  4 | NULL  |
-- +----+-------+`],
        [`<b>Advantages of unique keys:</b> they can be composite, so they express rules like "one seat per show", and there can be several per table.`,
            r`CREATE TABLE booking (
    id INT PRIMARY KEY AUTO_INCREMENT, show_id INT, seat VARCHAR(4),
    UNIQUE KEY uq_show_seat (show_id, seat)        -- the pair must be unique
);
INSERT INTO booking (show_id, seat) VALUES (1,'A1'),(1,'A2'),(2,'A1');
INSERT INTO booking (show_id, seat) VALUES (1,'A1');

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-A1' for key 'booking.uq_show_seat'`],
        [`<b>Disadvantages:</b> a table without a primary key is allowed by default, and InnoDB then silently picks the first UNIQUE NOT NULL index or creates a hidden 6-byte row id. That hurts replication, row-based binlog performance and online tools. Teams enforce a PK with a server setting.`,
            r`SET SESSION sql_require_primary_key = 1;         -- 8.0.13+
CREATE TABLE no_pk (a INT UNIQUE);

-- OUTPUT:
-- ERROR 3750 (HY000): Unable to create or change a table without a primary key, when the
-- system variable 'sql_require_primary_key' is set. Add a primary key to the table or unset
-- this variable to avoid this message. Note that tables without a primary key can cause
-- performance problems in row-based replication, so please consult your DBA before changing this setting.`],
        [`<b>Limitations:</b> primary key columns must be NOT NULL (MySQL rejects an explicit NULL), the key is always named PRIMARY, and changing it rebuilds the whole table and every secondary index because the clustered index is rewritten.`,
            r`CREATE TABLE bad_pk (a INT NULL, PRIMARY KEY (a));

-- OUTPUT:
-- ERROR 1171 (42000): All parts of a PRIMARY KEY must be NOT NULL; if you need NULL in a key,
-- use UNIQUE instead

-- Changing a PK is a table rebuild; plan it as a migration:
-- ALTER TABLE emp DROP PRIMARY KEY, ADD PRIMARY KEY (id, email);   -- copies the table`],
        `
                      PRIMARY KEY                     UNIQUE KEY
   per table          exactly 1                       0..many
   NULL allowed       never                           yes (many NULLs)
   InnoDB structure   clustered index (the table)     secondary index -> stores PK value
   default name       PRIMARY                         column or chosen name
   FK target          yes (usual)                     yes (allowed)
   purpose            row identity                    business uniqueness / alternate lookup
`,
        `Give every table a short, immutable primary key, and add UNIQUE constraints for each business identifier. Turn on sql_require_primary_key in production, because key-less tables cause replication lag and block tools such as online schema change. Remember that every unique index adds write cost and that the clustered PK is stored inside every secondary index entry.`
    ),
};
