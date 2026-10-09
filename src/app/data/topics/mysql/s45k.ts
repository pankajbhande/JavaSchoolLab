// Module 45 (Database Design for Real Projects).
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s45k: Record<string, DeepDive> = {
    'E-commerce Schema': dd(
        [`An e-commerce schema separates <b>who</b> buys (customers), <b>what</b> is sold (products), and <b>what happened</b> (orders and order_items). Orders are one-to-many with order_items; order_items is the bridge between orders and products.`,
            r`-- Core e-commerce tables (MySQL 8, InnoDB, utf8mb4)
CREATE TABLE customers (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(190)    NOT NULL,
    name       VARCHAR(100)    NOT NULL,
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_customers_email (email)
) ENGINE=InnoDB;

CREATE TABLE products (
    id    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(150)  NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),   -- money is DECIMAL, never FLOAT
    stock INT           NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE orders (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT UNSIGNED NOT NULL,
    status      ENUM('NEW','PAID','SHIPPED','CANCELLED') NOT NULL DEFAULT 'NEW',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY ix_orders_customer (customer_id, created_at),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB;

CREATE TABLE order_items (
    order_id   BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    qty        INT NOT NULL CHECK (qty > 0),
    unit_price DECIMAL(10,2) NOT NULL,                 -- price snapshot at purchase time
    PRIMARY KEY (order_id, product_id),
    CONSTRAINT fk_oi_order   FOREIGN KEY (order_id)   REFERENCES orders(id),
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

SHOW TABLES;

-- OUTPUT:
-- +----------------+
-- | Tables_in_shop |
-- +----------------+
-- | customers      |
-- | order_items    |
-- | orders         |
-- | products       |
-- +----------------+`],
        [`Why not store the product price only in products? Prices change. An order must remember what the customer actually <b>paid</b>, so order_items copies the price at purchase time. Reading the live price would rewrite history.`,
            r`CREATE TABLE products    (id INT PRIMARY KEY, name VARCHAR(50), price DECIMAL(10,2));
CREATE TABLE order_items (order_id INT, product_id INT, qty INT, unit_price DECIMAL(10,2));
INSERT INTO products    VALUES (1, 'Keyboard', 50.00);
INSERT INTO order_items VALUES (1, 1, 2, 50.00);        -- bought 2 at 50.00

UPDATE products SET price = 60.00 WHERE id = 1;         -- price rise next week

SELECT oi.qty * oi.unit_price AS paid_snapshot,
       oi.qty * p.price       AS wrong_live_price
FROM   order_items oi JOIN products p ON p.id = oi.product_id;

-- OUTPUT:
-- +---------------+------------------+
-- | paid_snapshot | wrong_live_price |
-- +---------------+------------------+
-- |        100.00 |           120.00 |
-- +---------------+------------------+`],
        [`Typical business questions: revenue per customer, best sellers, orders to ship. Cancelled orders must not count as revenue.`,
            r`CREATE TABLE customers   (id INT PRIMARY KEY, name VARCHAR(50));
CREATE TABLE orders      (id INT PRIMARY KEY, customer_id INT, status VARCHAR(10));
CREATE TABLE order_items (order_id INT, product_id INT, qty INT, unit_price DECIMAL(10,2));
INSERT INTO customers   VALUES (1,'Asha'),(2,'Ravi');
INSERT INTO orders      VALUES (1,1,'PAID'),(2,1,'PAID'),(3,2,'CANCELLED');
INSERT INTO order_items VALUES (1,1,2,50.00),(2,2,1,20.00),(3,1,1,50.00);

SELECT c.name, SUM(oi.qty * oi.unit_price) AS revenue
FROM   customers c
JOIN   orders o       ON o.customer_id = c.id AND o.status = 'PAID'
JOIN   order_items oi ON oi.order_id   = o.id
GROUP  BY c.id, c.name
ORDER  BY revenue DESC;

-- OUTPUT:
-- +------+---------+
-- | name | revenue |
-- +------+---------+
-- | Asha |  120.00 |
-- +------+---------+`],
        [`<b>Advantages:</b> foreign keys, CHECK constraints and the composite primary key make bad data impossible at the database level, not just in application code.`,
            r`CREATE TABLE products (id INT PRIMARY KEY, name VARCHAR(50));
CREATE TABLE order_items (
    order_id INT, product_id INT, qty INT CHECK (qty > 0),
    PRIMARY KEY (order_id, product_id),
    CONSTRAINT fk_oi_product FOREIGN KEY (product_id) REFERENCES products(id)
);
INSERT INTO products VALUES (1, 'Keyboard');
INSERT INTO order_items VALUES (10, 99, 1);             -- product 99 does not exist
INSERT INTO order_items VALUES (10, 1, 0);              -- qty 0 is invalid

-- OUTPUT:
-- ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails
-- ERROR 3819 (HY000): Check constraint 'order_items_chk_1' is violated.`],
        [`<b>Disadvantages:</b> normalised data needs joins to rebuild an order, and concurrent buyers can oversell stock if the check and the update are separate steps.`,
            r`CREATE TABLE products (id INT PRIMARY KEY, stock INT NOT NULL);
INSERT INTO products VALUES (1, 3);

-- WRONG: SELECT stock, check in app, then UPDATE  => two buyers both see 3
-- RIGHT: one atomic conditional update
UPDATE products SET stock = stock - 5 WHERE id = 1 AND stock >= 5;
SELECT ROW_COUNT() AS rows_changed;                     -- 0 means: not enough stock

-- OUTPUT:
-- +--------------+
-- | rows_changed |
-- +--------------+
-- |            0 |
-- +--------------+`],
        [`<b>Limitations:</b> a fixed-column products table cannot hold attributes that differ per product (color, RAM, size). Use a JSON column for the flexible part and keep the searchable core in real columns.`,
            r`CREATE TABLE products (
    id    INT PRIMARY KEY,
    name  VARCHAR(50),
    attrs JSON                                          -- flexible per-category attributes
);
INSERT INTO products VALUES
  (1, 'Laptop', '{"ram_gb": 16, "color": "grey"}'),
  (2, 'Shirt',  '{"size": "M",  "color": "red"}');

SELECT name, attrs->>'$.color' AS color
FROM   products
WHERE  attrs->>'$.color' = 'red';

-- OUTPUT:
-- +-------+-------+
-- | name  | color |
-- +-------+-------+
-- | Shirt | red   |
-- +-------+-------+`],
        `
   customers 1 ───< orders 1 ───< order_items >─── 1 products
   +--------+      +----------+   +-------------+    +----------+
   | id  PK |      | id    PK |   | order_id PK |    | id    PK |
   | email  |      | cust  FK |   | product_id  |    | name     |
   +--------+      | status   |   |   (PK, FK)  |    | price    |
                   +----------+   | qty         |    | stock    |
                                  | unit_price  | <- price snapshot
                                  +-------------+
`,
        `Keep money as DECIMAL, snapshot prices, and make stock changes atomic with conditional UPDATEs. Expect the catalogue to need search (Elasticsearch) and the orders table to need archiving or partitioning by date at scale; model addresses and payments as separate tables so PII can be isolated and encrypted.`
    ),

    'Banking Schema': dd(
        [`A banking schema is built on correctness: <b>accounts</b> hold the balance, and an append-only <b>ledger</b> records every movement. A transfer is two ledger rows (debit and credit) inside one transaction.`,
            r`CREATE TABLE accounts (
    id      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    owner   VARCHAR(100)  NOT NULL,
    balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    CONSTRAINT chk_balance CHECK (balance >= 0)         -- no overdraft
) ENGINE=InnoDB;

CREATE TABLE ledger (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    account_id BIGINT UNSIGNED NOT NULL,
    amount     DECIMAL(15,2)   NOT NULL,                -- signed: debit negative, credit positive
    ref        VARCHAR(40)     NOT NULL,                -- transfer id shared by both rows
    created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    KEY ix_ledger_account (account_id, created_at),
    CONSTRAINT fk_ledger_acc FOREIGN KEY (account_id) REFERENCES accounts(id)
) ENGINE=InnoDB;

DESCRIBE accounts;

-- OUTPUT:
-- +---------+---------------+------+-----+---------+----------------+
-- | Field   | Type          | Null | Key | Default | Extra          |
-- +---------+---------------+------+-----+---------+----------------+
-- | id      | bigint unsigned | NO | PRI | NULL    | auto_increment |
-- | owner   | varchar(100)  | NO   |     | NULL    |                |
-- | balance | decimal(15,2) | NO   |     | 0.00    |                |
-- +---------+---------------+------+-----+---------+----------------+`],
        [`A single balance column tells you <i>what</i> but not <i>why</i>. Auditors need history: the ledger can always reproduce the balance, and a mismatch reveals bugs or fraud.`,
            r`CREATE TABLE ledger (id INT AUTO_INCREMENT PRIMARY KEY, account_id INT, amount DECIMAL(15,2), ref VARCHAR(20));
INSERT INTO ledger (account_id, amount, ref) VALUES
  (1,  1000.00, 'deposit'),
  (1,  -250.00, 'T-1'),     -- transfer out
  (2,   250.00, 'T-1');     -- transfer in

SELECT account_id, SUM(amount) AS balance_from_ledger
FROM   ledger
GROUP  BY account_id;

-- OUTPUT:
-- +------------+---------------------+
-- | account_id | balance_from_ledger |
-- +------------+---------------------+
-- |          1 |              750.00 |
-- |          2 |              250.00 |
-- +------------+---------------------+`],
        [`The transfer procedure: lock both accounts, move money, write both ledger rows, commit. Any failure rolls everything back.`,
            r`CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL(15,2) NOT NULL CHECK (balance >= 0));
CREATE TABLE ledger (id INT AUTO_INCREMENT PRIMARY KEY, account_id INT, amount DECIMAL(15,2), ref VARCHAR(20));
INSERT INTO accounts VALUES (1, 1000.00), (2, 0.00);

START TRANSACTION;
  SELECT id FROM accounts WHERE id IN (1,2) ORDER BY id FOR UPDATE;   -- lock in id order
  UPDATE accounts SET balance = balance - 250 WHERE id = 1;
  UPDATE accounts SET balance = balance + 250 WHERE id = 2;
  INSERT INTO ledger (account_id, amount, ref) VALUES (1, -250, 'T-1'), (2, 250, 'T-1');
COMMIT;

SELECT * FROM accounts;

-- OUTPUT:
-- +----+---------+
-- | id | balance |
-- +----+---------+
-- |  1 |  750.00 |
-- |  2 |  250.00 |
-- +----+---------+`],
        [`<b>Advantages:</b> the CHECK constraint is the last line of defence: even buggy code cannot create a negative balance. MySQL 8.0.16+ enforces CHECK.`,
            r`CREATE TABLE accounts (id INT PRIMARY KEY, balance DECIMAL(15,2) NOT NULL,
                       CONSTRAINT chk_bal CHECK (balance >= 0));
INSERT INTO accounts VALUES (1, 100.00);
UPDATE accounts SET balance = balance - 500 WHERE id = 1;    -- would go to -400

-- OUTPUT:
-- ERROR 3819 (HY000): Check constraint 'chk_bal' is violated.`],
        [`<b>Disadvantages:</b> row locks create contention on hot accounts, and two transfers in opposite directions can deadlock if they lock rows in different orders.`,
            r`-- Session A: transfer 1 -> 2            Session B: transfer 2 -> 1
-- A: UPDATE accounts SET balance = balance - 10 WHERE id = 1;   (A holds row 1)
-- B: UPDATE accounts SET balance = balance - 10 WHERE id = 2;   (B holds row 2)
-- A: UPDATE accounts SET balance = balance + 10 WHERE id = 2;   (A waits for B)
-- B: UPDATE accounts SET balance = balance + 10 WHERE id = 1;   (B waits for A)  => cycle
-- FIX: always lock the lower id first
SELECT id FROM accounts WHERE id IN (1,2) ORDER BY id FOR UPDATE;

-- OUTPUT:
-- ERROR 1213 (40001): Deadlock found when trying to get lock; try restarting transaction
-- (one victim is rolled back; with ordered locking this no longer occurs)`],
        [`<b>Limitations:</b> MySQL has no append-only table type, so immutability of the ledger is enforced with a trigger. Run a reconciliation query regularly to compare balances with the ledger.`,
            r`CREATE TABLE ledger (id INT AUTO_INCREMENT PRIMARY KEY, amount DECIMAL(15,2));
INSERT INTO ledger (amount) VALUES (100.00);

DELIMITER //
CREATE TRIGGER trg_ledger_no_update BEFORE UPDATE ON ledger
FOR EACH ROW BEGIN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'ledger rows are immutable';
END//
DELIMITER ;

UPDATE ledger SET amount = 999 WHERE id = 1;

-- OUTPUT:
-- ERROR 1644 (45000): ledger rows are immutable`],
        `
   Transfer T-1 (one transaction)
   +----------+  -250   +--------------------+  +250   +----------+
   | acct 1   | ------> | ledger  (append)   | <------ | acct 2   |
   | balance  |         | T-1 debit  -250    |         | balance  |
   +----------+         | T-1 credit +250    |         +----------+
        ^               +--------------------+              ^
        +------- SUM(ledger) must equal balance -------------+
`,
        `Use InnoDB with REPEATABLE READ or READ COMMITTED, short transactions, and a fixed lock order. Add an idempotency key (unique ref) so a retried transfer cannot post twice. At scale, shard by account and treat the ledger as the source of truth, with balances as a derived cache that a nightly job reconciles.`
    ),

    'Social Media Schema': dd(
        [`A social schema is mostly many-to-many relationships: users follow users, like posts, and comment on posts. Composite primary keys make each relationship unique by construction.`,
            r`CREATE TABLE users (
    id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    handle   VARCHAR(30) NOT NULL UNIQUE,
    bio      VARCHAR(255)
);
CREATE TABLE posts (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL,
    body       VARCHAR(500)    NOT NULL,
    like_count INT UNSIGNED    NOT NULL DEFAULT 0,       -- denormalised counter
    created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY ix_posts_user_time (user_id, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE follows (
    follower_id BIGINT UNSIGNED NOT NULL,
    followee_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (follower_id, followee_id),
    KEY ix_followee (followee_id),                       -- who follows me?
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (followee_id) REFERENCES users(id)
);
CREATE TABLE likes (
    user_id BIGINT UNSIGNED NOT NULL,
    post_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);
SHOW TABLES;

-- OUTPUT:
-- +-------------------+
-- | Tables_in_social  |
-- +-------------------+
-- | follows           |
-- | likes             |
-- | posts             |
-- | users             |
-- +-------------------+`],
        [`Without a unique pair, a user could follow the same person twice and inflate counts. The composite primary key rejects the duplicate and INSERT IGNORE makes a double-click harmless.`,
            r`CREATE TABLE follows (follower_id INT, followee_id INT, PRIMARY KEY (follower_id, followee_id));
INSERT INTO follows VALUES (1, 2);
INSERT INTO follows VALUES (1, 2);                       -- duplicate => error
INSERT IGNORE INTO follows VALUES (1, 2);                -- silently skipped
SELECT ROW_COUNT() AS inserted;

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-2' for key 'follows.PRIMARY'
-- +----------+
-- | inserted |
-- +----------+
-- |        0 |
-- +----------+`],
        [`The home feed: latest posts from the people I follow. The follows primary key and the (user_id, created_at) index make this a join plus a sort.`,
            r`CREATE TABLE follows (follower_id INT, followee_id INT);
CREATE TABLE posts (id INT PRIMARY KEY, user_id INT, body VARCHAR(40), created_at DATETIME);
INSERT INTO follows VALUES (1, 2), (1, 3);
INSERT INTO posts VALUES
  (10, 2, 'hello world',  '2024-05-01 10:00:00'),
  (11, 3, 'lunch time',   '2024-05-01 12:30:00'),
  (12, 4, 'not followed', '2024-05-01 13:00:00'),
  (13, 2, 'good night',   '2024-05-01 22:00:00');

SELECT p.id, p.user_id, p.body
FROM   follows f
JOIN   posts   p ON p.user_id = f.followee_id
WHERE  f.follower_id = 1
ORDER  BY p.created_at DESC
LIMIT  3;

-- OUTPUT:
-- +----+---------+-------------+
-- | id | user_id | body        |
-- +----+---------+-------------+
-- | 13 |       2 | good night  |
-- | 11 |       3 | lunch time  |
-- | 10 |       2 | hello world |
-- +----+---------+-------------+`],
        [`<b>Advantages:</b> likes are cheap to write and to count thanks to the (user_id, post_id) key, and one user can never like the same post twice.`,
            r`CREATE TABLE likes (user_id INT, post_id INT, PRIMARY KEY (user_id, post_id));
INSERT INTO likes VALUES (1,10),(2,10),(3,10),(1,11);

SELECT post_id, COUNT(*) AS likes FROM likes GROUP BY post_id ORDER BY post_id;

-- OUTPUT:
-- +---------+-------+
-- | post_id | likes |
-- +---------+-------+
-- |      10 |     3 |
-- |      11 |     1 |
-- +---------+-------+`],
        [`<b>Disadvantages:</b> counting likes on every page view is expensive for viral posts, so a counter column is kept. Update it in the same transaction as the like row.`,
            r`CREATE TABLE posts (id INT PRIMARY KEY, like_count INT NOT NULL DEFAULT 0);
CREATE TABLE likes (user_id INT, post_id INT, PRIMARY KEY (user_id, post_id));
INSERT INTO posts VALUES (10, 0);

START TRANSACTION;
  INSERT INTO likes VALUES (1, 10);
  UPDATE posts SET like_count = like_count + 1 WHERE id = 10;
COMMIT;
SELECT * FROM posts;

-- OUTPUT:
-- +----+------------+
-- | id | like_count |
-- +----+------------+
-- | 10 |          1 |
-- +----+------------+`],
        [`<b>Limitations:</b> relational joins are poor at deep graph questions. Friends-of-friends needs a self join, and arbitrary depth needs a recursive CTE; huge graphs belong in a graph store.`,
            r`CREATE TABLE follows (follower_id INT, followee_id INT, PRIMARY KEY (follower_id, followee_id));
INSERT INTO follows VALUES (1,2),(2,3),(2,4),(1,3);

-- People followed by the people I follow, that I do not already follow
SELECT DISTINCT f2.followee_id AS suggestion
FROM   follows f1
JOIN   follows f2 ON f2.follower_id = f1.followee_id
WHERE  f1.follower_id = 1
  AND  f2.followee_id <> 1
  AND  f2.followee_id NOT IN (SELECT followee_id FROM follows WHERE follower_id = 1);

-- OUTPUT:
-- +------------+
-- | suggestion |
-- +------------+
-- |          4 |
-- +------------+`],
        `
   users ---< posts ---< likes >--- users
     |  \                           ^
     |   +---< follows >------------+   follows(follower, followee)
     |                                  PK(follower, followee) = no duplicates
   Feed = follows JOIN posts ORDER BY created_at DESC LIMIT n
`,
        `Feeds are the scaling problem: fan-out on read (the join above) is simple but slows for users who follow thousands; fan-out on write (a per-user feed table or Redis list) trades storage and write cost for fast reads. Use keyset pagination (created_at, id) rather than OFFSET, and move counters and timelines to a cache once like traffic is hot.`
    ),

    'Job Portal Schema': dd(
        [`A job portal links companies that post jobs, candidates who apply, and skills that connect both. Applications are a many-to-many between jobs and candidates with a status; skills are many-to-many with both jobs and candidates.`,
            r`CREATE TABLE companies  (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL);
CREATE TABLE jobs (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    title      VARCHAR(120) NOT NULL,
    salary_min DECIMAL(10,2), salary_max DECIMAL(10,2),
    posted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FULLTEXT KEY ft_title (title)
);
CREATE TABLE candidates  (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(190) UNIQUE);
CREATE TABLE skills      (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(50) NOT NULL UNIQUE);
CREATE TABLE job_skills       (job_id INT, skill_id INT, PRIMARY KEY (job_id, skill_id));
CREATE TABLE candidate_skills (candidate_id INT, skill_id INT, PRIMARY KEY (candidate_id, skill_id));
CREATE TABLE applications (
    job_id       INT NOT NULL,
    candidate_id INT NOT NULL,
    status       ENUM('APPLIED','SHORTLISTED','REJECTED','HIRED') NOT NULL DEFAULT 'APPLIED',
    applied_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (job_id, candidate_id)                   -- one application per candidate per job
);
SHOW TABLES;

-- OUTPUT:
-- +------------------+
-- | Tables_in_portal |
-- +------------------+
-- | applications     |
-- | candidate_skills |
-- | candidates       |
-- | companies        |
-- | job_skills       |
-- | jobs             |
-- | skills           |
-- +------------------+`],
        [`Recruiters need ranked matches, not a flat list. Skill tables let SQL count how many required skills each candidate has.`,
            r`CREATE TABLE job_skills       (job_id INT, skill_id INT);
CREATE TABLE candidate_skills (candidate_id INT, skill_id INT);
CREATE TABLE candidates       (id INT, name VARCHAR(20));
INSERT INTO candidates       VALUES (1,'Asha'),(2,'Ravi');
INSERT INTO job_skills       VALUES (1,1),(1,2);          -- job 1 needs Java(1), SQL(2)
INSERT INTO candidate_skills VALUES (1,1),(1,2),(2,1);    -- Asha: both, Ravi: Java only

SELECT c.name,
       COUNT(*)                                             AS matched,
       (SELECT COUNT(*) FROM job_skills WHERE job_id = 1)   AS required
FROM   candidates c
JOIN   candidate_skills cs ON cs.candidate_id = c.id
JOIN   job_skills js       ON js.skill_id = cs.skill_id AND js.job_id = 1
GROUP  BY c.id, c.name
ORDER  BY matched DESC;

-- OUTPUT:
-- +------+---------+----------+
-- | name | matched | required |
-- +------+---------+----------+
-- | Asha |       2 |        2 |
-- | Ravi |       1 |        2 |
-- +------+---------+----------+`],
        [`Candidates search by title, and recruiters track the funnel: how many applications are at each status for a job.`,
            r`CREATE TABLE applications (job_id INT, candidate_id INT, status VARCHAR(12));
INSERT INTO applications VALUES
  (1,1,'APPLIED'),(1,2,'SHORTLISTED'),(1,3,'APPLIED'),(1,4,'HIRED'),(2,1,'APPLIED');

SELECT status, COUNT(*) AS n
FROM   applications
WHERE  job_id = 1
GROUP  BY status
ORDER  BY n DESC, status;

-- OUTPUT:
-- +-------------+---+
-- | status      | n |
-- +-------------+---+
-- | APPLIED     | 2 |
-- | HIRED       | 1 |
-- | SHORTLISTED | 1 |
-- +-------------+---+`],
        [`<b>Advantages:</b> the application primary key stops duplicate applications, and ENUM status keeps values valid and compact.`,
            r`CREATE TABLE applications (
    job_id INT, candidate_id INT,
    status ENUM('APPLIED','SHORTLISTED','REJECTED','HIRED') NOT NULL DEFAULT 'APPLIED',
    PRIMARY KEY (job_id, candidate_id)
);
INSERT INTO applications (job_id, candidate_id) VALUES (1, 1);
INSERT INTO applications (job_id, candidate_id) VALUES (1, 1);     -- applied twice
UPDATE applications SET status = 'PENDING' WHERE job_id = 1;      -- not an allowed value

-- OUTPUT:
-- ERROR 1062 (23000): Duplicate entry '1-1' for key 'applications.PRIMARY'
-- ERROR 1265 (01000): Data truncated for column 'status' at row 1   (strict mode: error)`],
        [`<b>Disadvantages:</b> LIKE '%java%' cannot use an index. Use a FULLTEXT index and MATCH ... AGAINST for keyword search.`,
            r`CREATE TABLE jobs (id INT PRIMARY KEY, title VARCHAR(100), FULLTEXT KEY ft_title (title));
INSERT INTO jobs VALUES (1,'Senior Java Developer'),(2,'Python Developer'),(3,'Data Analyst');

SELECT id, title
FROM   jobs
WHERE  MATCH(title) AGAINST ('java' IN NATURAL LANGUAGE MODE);

-- OUTPUT:
-- +----+-----------------------+
-- | id | title                 |
-- +----+-----------------------+
-- |  1 | Senior Java Developer |
-- +----+-----------------------+`],
        [`<b>Limitations:</b> InnoDB FULLTEXT ignores short words (innodb_ft_min_token_size is 3) and a list of stopwords, so searching "C" or "it" finds nothing. Salary ranges need two columns and an overlap test.`,
            r`SELECT @@innodb_ft_min_token_size AS min_token;

CREATE TABLE jobs (id INT PRIMARY KEY, title VARCHAR(50), salary_min INT, salary_max INT);
INSERT INTO jobs VALUES (1,'A',40000,60000),(2,'B',70000,90000),(3,'C',55000,75000);

-- Jobs whose range overlaps the wanted 50000..65000
SELECT id FROM jobs WHERE salary_min <= 65000 AND salary_max >= 50000;

-- OUTPUT:
-- +-----------+
-- | min_token |
-- +-----------+
-- |         3 |
-- +-----------+
-- +----+
-- | id |
-- +----+
-- |  1 |
-- |  3 |
-- +----+`],
        `
   companies --< jobs --< applications >-- candidates
                  |                            |
                  +--< job_skills >-- skills --< candidate_skills
   Match score = COUNT(candidate skills that are in job_skills) / COUNT(job_skills)
`,
        `Keep the relational core for applications and state changes, but plan a search engine (Elasticsearch or OpenSearch) once you need typo tolerance, relevance ranking and facets; FULLTEXT is a good first step. Add a status history table to audit the hiring funnel, and treat candidate data as PII with retention and deletion rules.`
    )
};
