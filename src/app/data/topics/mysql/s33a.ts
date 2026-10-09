// Module 33 (SQL Injection): deep dives.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s33a: Record<string, DeepDive> = {
    'How SQL Injection Works': dd(
        [`<b>SQL injection</b> happens when untrusted input is concatenated into SQL text, so the input is parsed as SQL <i>code</i> instead of a <i>value</i>. The attacker changes the structure of the statement, not just its data.`,
            r`-- The application builds this string by concatenation:
--   "SELECT id, name FROM users WHERE name = '" + input + "' AND pwd = '" + pwd + "'"
-- Attacker types:  name = admin' --   (the quote closes the string, -- comments out the rest)
-- The server therefore receives this statement:
SELECT id, name FROM users WHERE name = 'admin' -- ' AND pwd = 'x';
-- Password check is now a comment -> login succeeds as admin.

-- OUTPUT (example):
-- +----+-------+
-- | id | name  |
-- +----+-------+
-- |  1 | admin |
-- +----+-------+`],
        [`Databases cannot tell which parts of a statement the developer meant as code and which came from a user. Understanding the attack is the only way to see why parameter binding (not escaping tricks) is the fix.`,
            r`-- Tautology: the classic OR 1=1 turns a filter into "match everything".
-- Input for id:  0 OR 1=1
SELECT id, email FROM users WHERE id = 0 OR 1=1;

-- OUTPUT (example):
-- +----+-------------------+
-- | id | email             |
-- +----+-------------------+
-- |  1 | admin@corp.com    |
-- |  2 | ann@corp.com      |
-- |  3 | bob@corp.com      |
-- +----+-------------------+`],
        [`Real breaches (Heartland, TalkTalk, countless CMS plugins) used injection to dump tables. Typical attack styles: UNION-based data theft, error-based, boolean/time-blind, and stacked queries where the driver allows multi-statements.`,
            r`-- UNION-based exfiltration: attacker appends a second SELECT with the same column count.
-- Input for q:  zzz' UNION SELECT user, authentication_string FROM mysql.user --
SELECT id, title FROM products WHERE title = 'zzz'
UNION SELECT user, authentication_string FROM mysql.user -- ';

-- Time-based blind probe (no data shown, but response time leaks 1 bit):
SELECT id FROM products WHERE id = 1 AND IF(SUBSTRING(VERSION(),1,1)='8', SLEEP(3), 0);

-- OUTPUT (example):
-- +--------+-------------------------------------------+
-- | id     | title                                     |
-- +--------+-------------------------------------------+
-- | root   | $A$005$...hash...                         |
-- | app    | $A$005$...hash...                         |
-- +--------+-------------------------------------------+
-- (second query: returns after ~3 s when the server is 8.x)`],
        [`<b>Why it is worth knowing:</b> detection is simple in testing (a single quote causes a syntax error), exploitation tools are automated, and the impact ranges from data theft to full takeover. Knowing the shapes helps you review code and write WAF/audit rules.`,
            r`-- Detecting probes in the general log / performance_schema: look for tell-tale tokens.
SELECT DIGEST_TEXT, COUNT_STAR
FROM   performance_schema.events_statements_summary_by_digest
WHERE  DIGEST_TEXT LIKE '%SLEEP (%'          -- time-based probes
   OR  DIGEST_TEXT LIKE '%UNION SELECT%'     -- union probes
ORDER  BY COUNT_STAR DESC LIMIT 5;

-- OUTPUT (example):
-- +----------------------------------------------+------------+
-- | DIGEST_TEXT                                  | COUNT_STAR |
-- +----------------------------------------------+------------+
-- | SELECT ... WHERE id = ? AND IF ( ... SLEEP ( ?) |      42 |
-- +----------------------------------------------+------------+`],
        [`<b>Disadvantages of the vulnerable pattern:</b> data theft and tampering, authentication bypass, and (with FILE privilege) reading or writing server files. Every query built by hand is a new attack surface.`,
            r`-- Damage depends on privileges. If the app account has FILE, injection can read files:
SELECT LOAD_FILE('/etc/passwd');             -- needs FILE privilege and secure_file_priv permitting it
-- Check how exposed your server is:
SHOW VARIABLES LIKE 'secure_file_priv';      -- empty = anywhere (bad), NULL = disabled (good)

-- OUTPUT (example):
-- +------------------+-------+
-- | Variable_name    | Value |
-- +------------------+-------+
-- | secure_file_priv | NULL  |
-- +------------------+-------+`],
        [`<b>Limitations of attackers (and of defenders):</b> a single connection normally cannot run stacked statements (multi-statement is off by default in most drivers), and identifiers or LIMIT/ORDER BY parts cannot be parameterized, so they need allow-lists.`,
            r`-- Stacked statements usually fail: the server rejects a second statement unless the
-- client explicitly enabled CLIENT_MULTI_STATEMENTS.
SELECT 1; DROP TABLE users;
-- ERROR 1064 (42000): You have an error in your SQL syntax ... near 'DROP TABLE users' (when multi-statement is off)

-- Identifiers cannot be bound with ?, so build them from a fixed allow-list in app code:
--   allowed = {"name","created_at"};  col = allowed.contains(input) ? input : "name";
SELECT id, name FROM users ORDER BY created_at DESC;

-- OUTPUT:
-- ERROR 1064 (42000): You have an error in your SQL syntax; check the manual ... near 'DROP TABLE users' at line 1`],
        `
   user input ──► string concat ──► "SELECT ... WHERE name='" + x + "'"
                                         │
                      x = admin' --      ▼
                              SELECT ... WHERE name='admin' -- '
                                         │  parser sees extra SQL
                                         ▼
        DATA became CODE ──► auth bypass / UNION dump / blind probes

   Safe path:  SQL text (fixed) ──► PREPARE ──► plan   +   values bound separately
`,
        `Treat injection as a design rule, not a patch: no string-built SQL anywhere, ORM or driver binding by default, allow-lists for identifiers, and an app account with minimum privileges so a bug cannot become a breach. Add defence in depth (WAF, query auditing, no FILE privilege, separate read-only accounts), but never rely on escaping or WAFs as the primary control.`
    ),

    'Prepared Statements & Parameterized Queries': dd(
        [`A <b>prepared statement</b> sends the SQL text with <code>?</code> placeholders first; the server parses it once. Values are sent later as data, so they can never change the statement structure.`,
            r`-- Server-side prepared statement in plain SQL (drivers do the same over the binary protocol)
PREPARE find_user FROM 'SELECT id, name FROM users WHERE name = ? AND pwd_hash = ?';
SET @n = 'admin'' --';                       -- hostile value, treated purely as a string
SET @p = 'x';
EXECUTE find_user USING @n, @p;              -- binds values, no parsing of the value
DEALLOCATE PREPARE find_user;                -- free server memory

-- OUTPUT:
-- Empty set (0.00 sec)      -- no user is literally named  admin' --`],
        [`Escaping functions are easy to get wrong (character sets, numeric contexts). Binding removes the problem by separating code and data at the protocol level.`,
            r`-- Numeric context: escaping quotes does NOT help here, binding does.
PREPARE p FROM 'SELECT id, email FROM users WHERE id = ?';
SET @id = '0 OR 1=1';                        -- hostile text
EXECUTE p USING @id;                         -- converted to the number 0, not parsed as SQL
DEALLOCATE PREPARE p;

-- OUTPUT:
-- Empty set, 1 warning (0.00 sec)
-- Warning 1292: Truncated incorrect DOUBLE value: '0 OR 1=1'  (the attack became a harmless value)`],
        [`In applications: JDBC <code>PreparedStatement</code>, Python <code>cursor.execute(sql, params)</code>, Node <code>mysql2</code> <code>execute()</code>, PHP PDO, and every ORM. Reused statements also skip repeated parsing.`,
            r`-- What the driver does for  INSERT ... VALUES (?, ?)  repeated in a batch:
PREPARE ins FROM 'INSERT INTO orders (user_id, total) VALUES (?, ?)';
SET @u = 7, @t = 19.99;  EXECUTE ins USING @u, @t;
SET @u = 8, @t = 5.00;   EXECUTE ins USING @u, @t;   -- reuse: parsed once, run twice
DEALLOCATE PREPARE ins;

-- Check how many prepared statements the server is holding:
SHOW GLOBAL STATUS LIKE 'Prepared_stmt_count';

-- OUTPUT (example):
-- +---------------------+-------+
-- | Variable_name       | Value |
-- +---------------------+-------+
-- | Prepared_stmt_count | 0     |
-- +---------------------+-------+`],
        [`<b>Advantages:</b> eliminates value-injection, enables plan/parse reuse, avoids manual quoting and type formatting, and gives cleaner, safer code.`,
            r`-- The statement digest is identical for any value, so monitoring groups them nicely:
SELECT DIGEST_TEXT, COUNT_STAR
FROM   performance_schema.events_statements_summary_by_digest
WHERE  DIGEST_TEXT LIKE 'SELECT id , name FROM users WHERE name = ?%';

-- OUTPUT (example):
-- +-----------------------------------------------------+------------+
-- | DIGEST_TEXT                                         | COUNT_STAR |
-- +-----------------------------------------------------+------------+
-- | SELECT id , name FROM users WHERE name = ? AND ...  |      10234 |
-- +-----------------------------------------------------+------------+`],
        [`<b>Disadvantages:</b> an extra round trip for the first PREPARE (unless the driver pipelines it), server memory per prepared statement (limited by max_prepared_stmt_count), and some drivers only emulate preparation client-side.`,
            r`-- Server memory guard rail:
SHOW VARIABLES LIKE 'max_prepared_stmt_count';
-- Forgetting DEALLOCATE / closing statements in a pool leaks them until the limit is hit:
-- ERROR 1461 (42000): Can't create more than max_prepared_stmt_count statements (current value: 16382)

-- OUTPUT:
-- +-------------------------+-------+
-- | Variable_name           | Value |
-- +-------------------------+-------+
-- | max_prepared_stmt_count | 16382 |
-- +-------------------------+-------+`],
        [`<b>Limitations:</b> placeholders only stand for values. Table names, column names, ORDER BY direction and the IN-list length cannot be a single ?.`,
            r`-- Not allowed: a placeholder for an identifier
PREPARE bad FROM 'SELECT * FROM ? WHERE id = 1';
-- ERROR 1064 (42000): You have an error in your SQL syntax ... near '? WHERE id = 1'

-- Pattern for dynamic identifiers: validate against an allow-list, then CONCAT only the safe name.
SET @col = 'created_at';                                   -- came from a validated allow-list
SET @sql = CONCAT('SELECT id FROM users ORDER BY ', @col, ' DESC LIMIT ?');
PREPARE ok FROM @sql;
SET @lim = 3;
EXECUTE ok USING @lim;
DEALLOCATE PREPARE ok;

-- OUTPUT (example):
-- +----+
-- | id |
-- +----+
-- | 90 |
-- | 89 |
-- | 88 |
-- +----+`],
        `
   App                                      MySQL server
   ───                                      ────────────
   1. PREPARE "... WHERE name = ?"  ─────►  parse + validate  ──► statement handle #5
   2. EXECUTE #5 with ['admin'' --'] ────►  bind as VALUE (never re-parsed)
   3. rows  ◄──────────────────────────────  run plan
   4. CLOSE #5                      ─────►  free memory

   SQL structure fixed at step 1; data arrives at step 2 -> injection impossible
`,
        `Make parameter binding the only allowed way to run SQL (lint/ban string concatenation). Watch for drivers that emulate prepares client-side (for example useServerPrepStmts=false in Connector/J): they escape rather than bind, which is still safe with correct charsets but different in behaviour and plan caching. Pair with least-privilege accounts and allow-listed dynamic identifiers; for stored procedures, never build dynamic SQL from raw parameters.`
    ),
};
