// Deep dive, modules 32-36 (Users & Security, SQL Injection, Backup, Binary Logs, Replication).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d11: Record<string, Deep> = {
    'CREATE, ALTER & DROP USER': dv(
        [`Accounts are rows in the <code>mysql.user</code> system table keyed by user and host. At login the server picks the most specific matching host pattern, runs the authentication plugin (default <code>caching_sha2_password</code>, which stores a salted SHA-256 hash and caches successful verifications) and loads the account's privileges into memory.`,
            r`CREATE USER 'app'@'10.0.1.%' IDENTIFIED BY 'Str0ng#Pass1';
SELECT user, host, plugin, account_locked, password_expired, password_last_changed FROM mysql.user WHERE user = 'app';

-- OUTPUT:
-- user | host     | plugin                | account_locked | password_expired | password_last_changed
-- app  | 10.0.1.% | caching_sha2_password | N              | N                | 2026-05-01 10:00:00`],
        [`Options: authentication plugin, TLS requirement, password expiry and reuse policy, failed-login lockout, resource limits, comment and attributes, default roles. ALTER USER changes any of them; DROP USER removes the account and its grants.`,
            r`CREATE USER 'svc_report'@'%' IDENTIFIED WITH caching_sha2_password BY 'Rep0rt#Pass'
  REQUIRE SSL PASSWORD EXPIRE INTERVAL 90 DAY PASSWORD HISTORY 5 FAILED_LOGIN_ATTEMPTS 5 PASSWORD_LOCK_TIME 1
  WITH MAX_USER_CONNECTIONS 10 MAX_QUERIES_PER_HOUR 20000 COMMENT 'BI reporting';
ALTER USER 'svc_report'@'%' ACCOUNT LOCK;
DROP USER IF EXISTS 'old_user'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected (x3)`],
        [`Mistakes: wildcard hosts for everything, one shared account for several services, leaving anonymous or test accounts, and rotating passwords with downtime. Use dual passwords and per-service accounts.`,
            r`ALTER USER 'svc_app'@'10.0.%' IDENTIFIED BY 'NewPass#2026x' RETAIN CURRENT PASSWORD;
-- deploy the new secret everywhere, then:
ALTER USER 'svc_app'@'10.0.%' DISCARD OLD PASSWORD;
SELECT user, host FROM mysql.user WHERE user = '' OR host = '%';

-- OUTPUT:
-- user | host
-- test | %             (remove this account)`],
        [`Authentication has a cost: the caching plugin makes repeated logins cheap, but connection storms still hurt. Pool connections and avoid per-request logins; monitor aborted connects.`,
            r`SHOW GLOBAL STATUS LIKE 'Aborted_connects';
SHOW GLOBAL STATUS LIKE 'Connection_errors%';

-- OUTPUT: (example)
-- Aborted_connects | 120
-- Connection_errors_max_connections | 0`],
        [`Real-world account lifecycle: create accounts through migration scripts, lock instead of drop when someone leaves (to keep audit history), and review accounts quarterly against an expected list.`,
            r`SELECT user, host, account_locked, password_last_changed FROM mysql.user WHERE password_last_changed < NOW() - INTERVAL 180 DAY AND user NOT LIKE 'mysql.%';

-- OUTPUT:
-- user  | host | account_locked | password_last_changed
-- jdoe  | %    | N              | 2025-09-12 08:11:00`]
    ),

    'GRANT, REVOKE & SHOW GRANTS': dv(
        [`Privileges are stored at several levels: global (<code>mysql.user</code>), schema (<code>mysql.db</code>), table, column and routine, plus dynamic privileges. When a statement runs, the server checks the most general level that allows it and falls back to more specific ones. Changes by GRANT and REVOKE take effect for new statements without FLUSH PRIVILEGES.`,
            r`CREATE USER 'shop_app'@'%' IDENTIFIED BY 'S3cure#Pass9';
GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'shop_app'@'%';
GRANT EXECUTE ON PROCEDURE shop.place_order TO 'shop_app'@'%';
SHOW GRANTS FOR 'shop_app'@'%';

-- OUTPUT:
-- GRANT USAGE ON *.* TO shop_app@%
-- GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO shop_app@%
-- GRANT EXECUTE ON PROCEDURE shop.place_order TO shop_app@%`],
        [`Granularity: global, per schema, per table, per column (<code>GRANT SELECT (name, dept) ON emp</code>), per routine, plus <code>WITH GRANT OPTION</code> (avoid for apps) and partial revokes. Use roles to attach sets of privileges.`,
            r`GRANT SELECT (id, name, dept) ON shop.emp TO 'hr_reader'@'%';
REVOKE SELECT (dept) ON shop.emp FROM 'hr_reader'@'%';
REVOKE INSERT, UPDATE, DELETE ON shop.* FROM 'shop_app'@'%';
SHOW GRANTS FOR 'hr_reader'@'%';

-- OUTPUT:
-- GRANT SELECT (id, name) ON shop.emp TO hr_reader@%`],
        [`Mistakes: GRANT ALL for applications, granting on <code>*.*</code>, forgetting that revoking a table grant does not remove a schema-level grant that still allows it, and not testing with the real account. Verify with the restricted login.`,
            r`-- connected as shop_app
DROP TABLE shop.orders;
SELECT salary FROM shop.emp;

-- OUTPUT:
-- ERROR 1142 (42000): DROP command denied to user 'shop_app'@'localhost' for table 'orders'
-- ERROR 1142 (42000): SELECT command denied to user 'shop_app'@'localhost' for table 'emp'`],
        [`Large privilege tables are cached; thousands of accounts and per-table grants increase memory and slow account loading. Prefer roles and schema-level grants.`,
            r`SELECT COUNT(*) AS users FROM mysql.user;
SELECT COUNT(*) AS table_grants FROM mysql.tables_priv;

-- OUTPUT:
-- users | table_grants
--   140 |          920`],
        [`Real-world privilege review: list who can do what on the sensitive schema, then compare against an expected baseline in version control.`,
            r`SELECT grantee, privilege_type, is_grantable FROM information_schema.schema_privileges WHERE table_schema = 'shop' ORDER BY grantee, privilege_type;

-- OUTPUT:
-- grantee         | privilege_type | is_grantable
-- 'shop_app'@'%'  | DELETE         | NO
-- 'shop_app'@'%'  | SELECT         | NO`]
    ),

    'Roles & Privileges': dv(
        [`A role is an account-like object that holds privileges but cannot log in. Granting a role to a user gives that user the privileges only while the role is active in the session. Roles are stored in <code>mysql.user</code> and the role graph is in <code>mysql.role_edges</code>.`,
            r`CREATE ROLE 'report_ro';
GRANT SELECT ON shop.* TO 'report_ro';
CREATE USER 'bi'@'%' IDENTIFIED BY 'B1#Report9';
GRANT 'report_ro' TO 'bi'@'%';
SET DEFAULT ROLE 'report_ro' TO 'bi'@'%';
SELECT from_user, to_user, default_role FROM mysql.role_edges;   -- illustrative

-- OUTPUT:
-- from_user | to_user | default_role
-- report_ro | bi      | Y`],
        [`Activate with <code>SET DEFAULT ROLE</code> (at login), <code>SET ROLE</code> (in session), or the <code>activate_all_roles_on_login</code> variable. Roles can be nested; <code>mandatory_roles</code> grants roles to everyone.`,
            r`SET ROLE 'report_ro';
SELECT CURRENT_ROLE();
SHOW GRANTS FOR 'bi'@'%' USING 'report_ro';
SET GLOBAL activate_all_roles_on_login = ON;
SET PERSIST mandatory_roles = 'report_ro';

-- OUTPUT:
-- CURRENT_ROLE()
-- report_ro@%`],
        [`Mistakes: granting a role and expecting immediate effect (it must be active), too many overlapping roles, and managing roles by hand per environment. Keep roles in migration scripts and review them like code.`,
            r`SELECT CURRENT_ROLE();
SELECT * FROM shop.orders LIMIT 1;

-- OUTPUT:
-- CURRENT_ROLE()
-- NONE
-- ERROR 1142 (42000): SELECT command denied to user 'bi'@'localhost' for table 'orders'     (role granted but not active)`],
        [`Roles reduce privilege-table size and administrative errors: change a role once and all members change. Measure by comparing grants per user before and after.`,
            r`SELECT COUNT(*) AS direct_grants FROM mysql.db WHERE user = 'bi';
SELECT COUNT(*) AS role_grants FROM mysql.role_edges WHERE to_user = 'bi';

-- OUTPUT:
-- direct_grants | role_grants
--             0 |           1`],
        [`Real-world model: functional roles (app_rw, report_ro, migrator, dba_ro) granted to service accounts, with an access review that lists each user's roles.`,
            r`SELECT to_user AS account, GROUP_CONCAT(from_user ORDER BY from_user) AS roles FROM mysql.role_edges GROUP BY to_user;

-- OUTPUT:
-- account  | roles
-- bi       | report_ro
-- shop_app | app_rw`]
    ),

    'Least Privilege & Application Users': dv(
        [`Least privilege means every account has exactly the permissions its job needs. An application account normally needs DML (SELECT, INSERT, UPDATE, DELETE) and EXECUTE on its schema, and nothing else: no DDL, no FILE, no PROCESS, no SUPER or dynamic admin privileges, and no access to other schemas.`,
            r`CREATE USER 'orders_app'@'10.0.1.%' IDENTIFIED BY 'A#pp-Secret1' REQUIRE SSL;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders.* TO 'orders_app'@'10.0.1.%';
CREATE USER 'orders_migrate'@'10.0.9.5' IDENTIFIED BY 'M#ig-Secret1';
GRANT ALL ON orders.* TO 'orders_migrate'@'10.0.9.5';

-- OUTPUT:
-- Query OK, 0 rows affected (x4)`],
        [`Separate accounts by duty: runtime (DML), migration (DDL, used only in the pipeline), read-only reporting, and administrators. Restrict host patterns, require TLS, set connection limits, and keep credentials in a secrets manager.`,
            r`CREATE USER 'orders_ro'@'10.0.3.%' IDENTIFIED BY 'R#o-Secret1' WITH MAX_USER_CONNECTIONS 20;
GRANT SELECT ON orders.* TO 'orders_ro'@'10.0.3.%';
SELECT user, host, ssl_type, max_user_connections FROM mysql.user WHERE user LIKE 'orders_%';

-- OUTPUT:
-- user           | host      | ssl_type | max_user_connections
-- orders_app     | 10.0.1.%  | ANY      |                    0
-- orders_ro      | 10.0.3.%  |          |                   20`],
        [`Mistakes: using root in applications, sharing credentials across services, wide host patterns, and over-privileged migration tools left in production. Audit regularly for risky global privileges.`,
            r`SELECT user, host FROM mysql.user WHERE Super_priv = 'Y' OR File_priv = 'Y' OR Grant_priv = 'Y' OR Process_priv = 'Y';
SELECT grantee, privilege_type FROM information_schema.user_privileges WHERE privilege_type IN ('SUPER','FILE','PROCESS','SHUTDOWN');

-- OUTPUT: (example)
-- user    | host
-- root    | localhost
-- legacy  | %             (should not exist)`],
        [`Limit damage from leaked credentials: per-user connection limits, resource limits, network restrictions, short-lived credentials from a vault, and alerts for logins from unusual hosts.`,
            r`ALTER USER 'orders_app'@'10.0.1.%' WITH MAX_USER_CONNECTIONS 60 MAX_QUERIES_PER_HOUR 5000000;
SELECT user, host, total_connections, current_connections FROM performance_schema.accounts WHERE user = 'orders_app';

-- OUTPUT:
-- user       | host      | total_connections | current_connections
-- orders_app | 10.0.1.12 |            204411 |                  12`],
        [`Real-world datasource configuration: a dedicated user, TLS with certificate verification, and the password injected from a secrets manager, not stored in the repository.`,
            r`spring.datasource.url=jdbc:mysql://db.internal:3306/orders?sslMode=VERIFY_IDENTITY&connectTimeout=3000
spring.datasource.username=orders_app
spring.datasource.password=(injected at runtime from the secrets manager)

-- OUTPUT:
-- HikariPool-1 - Start completed.   (connected with least privileges over TLS)`]
    ),

    'How SQL Injection Works': dv(
        [`SQL injection happens when untrusted input becomes part of the SQL text. The parser cannot tell your code from the attacker's text, so quotes and keywords in the input change the structure of the statement. This is a parsing problem, not a data problem: the fix is to keep SQL and data separate.`,
            r`-- vulnerable application code:  "SELECT * FROM users WHERE name = '" + name + "' AND pwd = '" + pwd + "'"
-- attacker sends name = admin' --   (the rest becomes a comment)
SELECT * FROM users WHERE name = 'admin' -- ' AND pwd = '';

-- OUTPUT:
-- id | name  | role
--  1 | admin | ADMIN        (password check bypassed)`],
        [`Attack families: in-band (UNION to read other tables), error-based, boolean/time-based blind (infer data from true/false or delays), second-order (stored input used unsafely later), and injection in ORDER BY, LIMIT or identifiers that cannot be parameterized.`,
            r`SELECT name, email FROM products WHERE id = 0 UNION SELECT username, password_hash FROM users;      -- UNION extraction
SELECT * FROM products WHERE id = 1 AND IF(SUBSTRING(DATABASE(), 1, 1) = 's', SLEEP(5), 0);           -- time-based blind
SELECT * FROM products ORDER BY (SELECT IF(1 = 1, price, name));                                       -- injection in ORDER BY

-- OUTPUT:
-- name  | email
-- admin | $2a$10$abc...`],
        [`Mistakes: relying on escaping functions or blacklists, trusting input from "internal" sources, building ORDER BY or table names from input, and showing database errors to users. Use parameters for values and allow-lists for identifiers.`,
            r`-- allow-list for identifiers (application code)
-- if (!List.of("name", "price", "created_at").contains(sortColumn)) sortColumn = "created_at";
-- if (!List.of("ASC", "DESC").contains(direction)) direction = "DESC";
SELECT id, name, price FROM products ORDER BY price DESC LIMIT 20;

-- OUTPUT:
-- id | name | price
--  7 | Bag  | 799.00`],
        [`Defence in depth limits impact: least-privilege accounts (no FILE or DDL), no stacked queries (<code>multiStatements=false</code>), generic error pages, WAF rules and monitoring for unusual queries.`,
            r`SHOW GRANTS FOR 'shop_app'@'%';
-- JDBC: do not enable allowMultiQueries
SELECT 1; DROP TABLE users;

-- OUTPUT:
-- ERROR 1064 (42000): You have an error in your SQL syntax     (stacked statements rejected by the driver/server settings)`],
        [`Real-world detection: unusual SQL shapes show up in the digest table. A query containing UNION SELECT from information_schema or a SLEEP call from the application account is a strong alert.`,
            r`SELECT LEFT(digest_text, 80) AS q, count_star, first_seen FROM performance_schema.events_statements_summary_by_digest
WHERE digest_text LIKE '%information_schema%' OR digest_text LIKE '%SLEEP(%' OR digest_text LIKE '%UNION SELECT%' ORDER BY first_seen DESC LIMIT 3;

-- OUTPUT: (example)
-- q                                              | count_star | first_seen
-- SELECT ... UNION SELECT username , password... |          3 | 2026-05-01 03:12:44`]
    ),

    'Prepared Statements & Parameterized Queries': dv(
        [`With a prepared statement the SQL text with placeholders (<code>?</code>) is sent and parsed first; parameter values are sent afterwards as typed data in a separate protocol message. The values can never change the structure of the statement, which is why this removes SQL injection for values. The parsed statement can also be reused with different parameters.`,
            r`PREPARE find_user FROM 'SELECT id, name FROM users WHERE email = ?';
SET @e = 'a@x.com'' OR ''1''=''1';
EXECUTE find_user USING @e;
DEALLOCATE PREPARE find_user;

-- OUTPUT:
-- Empty set          (the attack string is just an email value that matches nothing)`],
        [`Drivers expose it as <code>PreparedStatement</code> (JDBC), parameter lists in <code>cursor.execute(sql, params)</code> (Python), <code>execute('... ?', [v])</code> (Node mysql2), <code>PDO::prepare</code> (PHP). Server-side prepares parse once per connection; client-side emulation escapes values in the driver. Placeholders can only replace values, not identifiers or keywords.`,
            r`try (PreparedStatement ps = conn.prepareStatement("SELECT id, name FROM users WHERE email = ? AND status = ?")) {
    ps.setString(1, email); ps.setString(2, "ACTIVE");
    try (ResultSet rs = ps.executeQuery()) { while (rs.next()) { /* use */ } }
}
cur.execute("SELECT id FROM users WHERE email = %s", (email,))
const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

-- OUTPUT:
-- (all three bind email as data)`],
        [`Mistakes: building the SQL string with concatenation "just for the table name", dynamic IN lists with the wrong number of placeholders, LIKE patterns with unescaped wildcards, and unclosed statements piling up (<code>max_prepared_stmt_count</code>).`,
            r`-- dynamic IN list: generate placeholders, bind every value
-- String marks = String.join(",", Collections.nCopies(ids.size(), "?"));
-- "SELECT * FROM orders WHERE id IN (" + marks + ")"
SHOW GLOBAL STATUS LIKE 'Prepared_stmt_count';
SHOW VARIABLES LIKE 'max_prepared_stmt_count';

-- OUTPUT:
-- Prepared_stmt_count     | 412
-- max_prepared_stmt_count | 16382`],
        [`Prepared statements give small speed gains for repeated statements (no re-parse), and large safety gains. Configure driver caches (<code>cachePrepStmts</code>, <code>prepStmtCacheSize</code>, <code>useServerPrepStmts</code>) sensibly; test for statement leaks under load.`,
            r`jdbc:mysql://db:3306/shop?useServerPrepStmts=true&cachePrepStmts=true&prepStmtCacheSize=250&prepStmtCacheSqlLimit=2048&rewriteBatchedStatements=true

-- OUTPUT:
-- Statements parsed once per connection, batches rewritten to multi-row inserts`],
        [`Real-world search endpoint with optional filters: fixed SQL fragments chosen by code, every value bound, and sort columns from an allow-list.`,
            r`-- built in code from fixed fragments:
-- sql = "SELECT id, name, price FROM products WHERE 1=1"
-- if (category != null) { sql += " AND category_id = ?"; params.add(category); }
-- if (minPrice != null) { sql += " AND price >= ?"; params.add(minPrice); }
-- sql += " ORDER BY " + allowedSort(sortColumn) + " LIMIT ?"
SELECT id, name, price FROM products WHERE 1=1 AND category_id = 5 AND price >= 100 ORDER BY price LIMIT 20;

-- OUTPUT:
-- id | name | price
--  9 | Pen+ | 120.00`]
    ),

    'Logical vs Physical Backup': dv(
        [`A logical backup (mysqldump, mysqlpump, MySQL Shell dump) reads the data through SQL and writes statements or delimited text; restore replays them, rebuilding indexes. A physical backup (Percona XtraBackup, MySQL Enterprise Backup, filesystem or cloud snapshot) copies the data files and the redo log, so restore is a file copy plus crash recovery.`,
            r`mysqldump -u backup -p --single-transaction --routines --triggers --events shop > shop.sql            # logical
xtrabackup --backup --target-dir=/backups/full-2026-05-01 && xtrabackup --prepare --target-dir=/backups/full-2026-05-01   # physical

-- OUTPUT:
-- shop.sql (readable SQL)        /backups/full-2026-05-01 (copy of data files, ready to restore)`],
        [`Choose by size, RTO and portability. Logical: portable between versions and platforms, easy partial restores, slow for big data. Physical: very fast backup and restore, same version and architecture, partial restores need transportable tablespaces. Snapshots need consistency (flush/quiesce or InnoDB crash recovery).`,
            r`util.dumpInstance('/backup/logical', {threads: 8, compression: 'zstd'})
xtrabackup --backup --compress --parallel=8 --target-dir=/backups/phys
FLUSH TABLES WITH READ LOCK; -- snapshot the volume; UNLOCK TABLES;

-- OUTPUT:
-- dump: Duration 00:03:10 for 100 GB    physical: 00:11:40 for 100 GB`],
        [`Mistakes: no restore test, backups stored on the same disk as the database, backups without the binlog position (no point-in-time recovery), and inconsistent snapshots of live files. Always record coordinates and verify restores.`,
            r`mysqldump --single-transaction --source-data=2 shop > shop.sql
grep -m1 "CHANGE REPLICATION SOURCE TO" shop.sql

-- OUTPUT:
-- -- CHANGE REPLICATION SOURCE TO SOURCE_LOG_FILE='binlog.000042', SOURCE_LOG_POS=1543;`],
        [`Restore time dominates RTO. A 500 GB logical restore can take many hours because of index builds; the physical restore of the same data is minutes to an hour. Measure on your data.`,
            r`SELECT ROUND(500 * 1024 / (60 * 200), 1) AS physical_restore_minutes_at_200mb_s;
-- logical restore of the same 500 GB: ~ 18 hours

-- OUTPUT:
-- physical_restore_minutes_at_200mb_s
-- 42.7`],
        [`Real-world strategy: nightly physical backups for fast recovery, continuous binlog archiving for point-in-time recovery, and a weekly logical dump of critical schemas for portability and migrations.`,
            r`-- cron
-- 02:00 xtrabackup full (Sunday) / incremental (other days)
-- continuous: mysqlbinlog --read-from-remote-server --raw --stop-never
-- 04:00 Sunday: mysqlsh dumpSchemas ['shop','billing']

-- OUTPUT:
-- three recovery paths: fast physical, point-in-time via binlog, portable logical`]
    ),

    'mysqldump & Restore': dv(
        [`mysqldump connects as a client and reads each table with SELECT; with <code>--single-transaction</code> it starts a consistent-snapshot transaction so InnoDB tables are dumped at one point in time without blocking writers. Output is SQL: CREATE TABLE statements and multi-row INSERTs. Restore replays the file through the mysql client.`,
            r`mysqldump -u backup -p --single-transaction --routines --triggers --events --set-gtid-purged=OFF shop > shop.sql
mysql -u root -p -e "CREATE DATABASE shop_restore"
mysql -u root -p shop_restore < shop.sql
mysql -u root -p -e "SELECT COUNT(*) FROM shop_restore.orders"

-- OUTPUT:
-- COUNT(*)
-- 612044`],
        [`Useful options: <code>--no-data</code> (schema only), <code>--where</code> (subset), <code>--tables</code>, <code>--ignore-table</code>, <code>--compress</code>, <code>--source-data=2</code> (record binlog position), <code>--hex-blob</code>, <code>--default-character-set=utf8mb4</code>. Pipe through gzip for size.`,
            r`mysqldump -u root -p --no-data --routines shop > schema_only.sql
mysqldump -u root -p shop orders --where="created_at >= '2026-01-01'" > orders_2026.sql
mysqldump -u root -p --single-transaction shop | gzip > shop_2026-05-01.sql.gz
mysqldump -u root -p --all-databases --events --routines --triggers > all.sql

-- OUTPUT:
-- (four dump files)`],
        [`Mistakes: forgetting <code>--single-transaction</code> on InnoDB (locks tables), omitting routines and events, restoring into a server with different sql_mode or charset, and putting the password on the command line. Use an option file or login path.`,
            r`# ~/.my.cnf (chmod 600)
[client]
user=backup
password=***
mysqldump --single-transaction --routines shop > shop.sql

-- OUTPUT:
-- (no password on the command line or in shell history)`],
        [`Speed up large dumps and restores: dump on a replica, use parallel tools (MySQL Shell, mydumper), relax durability during restore (<code>innodb_flush_log_at_trx_commit=2</code>, bigger redo log), disable foreign key and unique checks inside the dump, and avoid extra indexes until load finishes.`,
            r`SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL sync_binlog = 0;
mysql -u root -p shop_restore < shop.sql          -- header disables FOREIGN_KEY_CHECKS and UNIQUE_CHECKS
SET GLOBAL innodb_flush_log_at_trx_commit = 1;
SET GLOBAL sync_binlog = 1;

-- OUTPUT:
-- restore time cut by about half; restore settings reset to safe values afterwards`],
        [`Real-world verification: restore the latest dump into a scratch server nightly, compare table counts and checksums with production, and alert when they differ.`,
            r`CHECKSUM TABLE shop.orders, shop_restore.orders;
SELECT (SELECT COUNT(*) FROM shop.orders) - (SELECT COUNT(*) FROM shop_restore.orders) AS difference;

-- OUTPUT:
-- Table                | Checksum
-- shop.orders          | 2918457613
-- shop_restore.orders  | 2918457613
-- difference
-- 0`]
    ),

    'Backup Strategies: Full & Incremental': dv(
        [`A full backup captures everything at one point in time. An incremental backup captures only changes since a previous backup: XtraBackup incrementals copy changed pages (tracked by LSN), and binary logs record every change as a stream. Restoring needs the full backup plus each incremental (or the binlogs) in order.`,
            r`xtrabackup --backup --target-dir=/b/full
xtrabackup --backup --target-dir=/b/inc1 --incremental-basedir=/b/full
xtrabackup --backup --target-dir=/b/inc2 --incremental-basedir=/b/inc1
cat /b/inc2/xtrabackup_checkpoints

-- OUTPUT:
-- backup_type = incremental
-- from_lsn = 412988871    to_lsn = 413420133`],
        [`Design from RPO and RTO: frequent fulls shorten restores but cost storage; incrementals save space but lengthen restores; continuous binlog archiving gives near-zero RPO. Retention policy, encryption and off-site copies belong in the plan.`,
            r`mysqlbinlog --read-from-remote-server --host=db --user=repl --raw --stop-never --result-file=/backup/binlogs/ binlog.000042
-- retention: 7 daily fulls, 4 weekly fulls, 12 monthly fulls, binlogs for 14 days

-- OUTPUT:
-- (binlog files streamed continuously to the backup host)`],
        [`Mistakes: a broken incremental chain (one missing file makes later ones useless), untested restores, backups readable by everyone, and retention shorter than the time to notice a problem. Verify the chain and protect the files.`,
            r`xtrabackup --prepare --apply-log-only --target-dir=/b/full
xtrabackup --prepare --apply-log-only --target-dir=/b/full --incremental-dir=/b/inc1
xtrabackup --prepare --target-dir=/b/full --incremental-dir=/b/inc2

-- OUTPUT:
-- completed OK!    (full backup now contains the changes of inc1 and inc2)`],
        [`Backup load affects production I/O. Throttle, run on a replica, and watch lag and latency. Compress and encrypt on the way out with parallel streams.`,
            r`xtrabackup --backup --throttle=200 --parallel=4 --compress --encrypt=AES256 --encrypt-key-file=/secure/key --stream=xbstream > /backup/full.xbstream

-- OUTPUT:
-- completed OK!    (I/O limited to 200 operations per second)`],
        [`Real-world schedule with monitoring: weekly full, daily incremental, continuous binlogs, a nightly automated restore test, and an alert when the last verified backup is older than 26 hours.`,
            r`SELECT backup_name, finished_at, verified_at, TIMESTAMPDIFF(HOUR, verified_at, NOW()) AS hours_since_verified FROM ops.backup_catalog ORDER BY finished_at DESC LIMIT 2;

-- OUTPUT:
-- backup_name      | finished_at         | verified_at         | hours_since_verified
-- inc-2026-05-01   | 2026-05-01 03:10:00 | 2026-05-01 05:40:00 |                    5`]
    ),

    'Point-in-Time Recovery': dv(
        [`Point-in-time recovery restores a backup and then replays binary log events up to a chosen moment, such as just before an accidental DELETE. It relies on two things: a backup that records the binlog position it corresponds to, and an unbroken sequence of binlog files from that position to the target time.`,
            r`# 1. restore the last full backup (recorded position: binlog.000042:1543)
# 2. replay until just before the incident
mysqlbinlog --start-position=1543 --stop-datetime="2026-05-01 10:14:00" binlog.000042 binlog.000043 | mysql -u root -p

-- OUTPUT:
-- (all changes before 10:14:00 applied; the bad statement at 10:14:05 is not)`],
        [`Choose the stop point by time (<code>--stop-datetime</code>) or exact position (<code>--stop-position</code>); skip a single bad transaction with GTIDs; extract only certain databases (<code>--database</code>); decode row events to read what changed (<code>--base64-output=DECODE-ROWS -vv</code>).`,
            r`mysqlbinlog --base64-output=DECODE-ROWS -vv --start-datetime="2026-05-01 10:10:00" --stop-datetime="2026-05-01 10:20:00" binlog.000043 | grep -n "DELETE FROM"
mysqlbinlog --database=shop --stop-position=9102 binlog.000043 | mysql -u root -p shop_recovered

-- OUTPUT:
-- 8841:### DELETE FROM shop.orders
-- (stop-position 9102 is the end of the last good transaction)`],
        [`Mistakes: recovering straight into production (do it on a side server first), missing or purged binlogs, non-ROW formats that make decoding hard, and no practice. Rehearse the whole procedure and keep binlog retention longer than the backup interval.`,
            r`SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';
SHOW BINARY LOGS;

-- OUTPUT:
-- binlog_expire_logs_seconds | 604800       (7 days: enough for weekly full backups)
-- binlog.000041 | 157286400 ...`],
        [`Recovery time is the sum of restoring the backup and replaying the binlog; large binlog volumes replay slowly because they run through one thread. Shorten it with more frequent backups and by recovering only the affected tables.`,
            r`mysqldump -u root -p shop_recovered orders > orders_recovered.sql
mysql -u root -p shop < orders_recovered.sql

-- OUTPUT:
-- (only the damaged table is restored into production; the rest stayed online)`],
        [`Real-world incident: an UPDATE without WHERE ruined a column at 10:14. The team restored last night's backup to a side server, replayed the binlog until 10:13:59, exported the column and patched production with a join update.`,
            r`UPDATE shop.customers c JOIN recovered.customers r ON r.id = c.id SET c.phone = r.phone;

-- OUTPUT:
-- Query OK, 120450 rows affected`]
    ),

    'Binary Log Basics': dv(
        [`The binary log is a sequence of numbered files (<code>binlog.000001...</code>) plus an index file. Each committed transaction is written as a group of events in commit order, together with a header describing the server, format and (with GTIDs) the transaction id. It is separate from the InnoDB redo log: redo is for crash recovery, the binlog is for replication and point-in-time recovery.`,
            r`SHOW BINARY LOGS;
SHOW BINARY LOG STATUS;
SHOW BINLOG EVENTS IN 'binlog.000042' LIMIT 4;

-- OUTPUT: (example)
-- Log_name      | File_size
-- binlog.000041 | 157286400
-- binlog.000042 |     42115
-- Pos | Event_type     | Info
-- 4   | Format_desc    | Server ver: 8.0.36
-- 157 | Query          | BEGIN`],
        [`Key settings: <code>log_bin</code>, <code>server_id</code>, <code>binlog_format</code>, <code>binlog_row_image</code>, <code>max_binlog_size</code>, <code>binlog_expire_logs_seconds</code>, <code>sync_binlog</code>, <code>binlog_cache_size</code>. Rotate with <code>FLUSH BINARY LOGS</code>.`,
            r`SET PERSIST binlog_expire_logs_seconds = 604800;
SET PERSIST sync_binlog = 1;
FLUSH BINARY LOGS;
PURGE BINARY LOGS BEFORE '2026-04-24 00:00:00';

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: deleting binlog files from the operating system (index and replicas break), retention too short for the backup cycle or a downed replica, and a full disk from unbounded binlogs. Purge with SQL and monitor space.`,
            r`SELECT ROUND(SUM(file_size) / 1073741824, 1) AS binlog_gb FROM performance_schema.binary_log_transaction_compression_stats;
-- shell: df -h /var/lib/mysql

-- OUTPUT: (illustrative)
-- binlog_gb
-- 24.8`],
        [`Binary logging costs write I/O and durability fsyncs. <code>sync_binlog=1</code> and <code>innodb_flush_log_at_trx_commit=1</code> give full durability; group commit amortizes the fsyncs across concurrent commits. Large transactions fill the binlog cache and spill to disk.`,
            r`SHOW GLOBAL STATUS LIKE 'Binlog_cache%';
SHOW GLOBAL STATUS LIKE 'Binlog_commits';

-- OUTPUT: (example)
-- Binlog_cache_disk_use | 412        (transactions that did not fit the cache)
-- Binlog_cache_use      | 9120344`],
        [`Real-world sizing: binlog retention must cover your longest backup interval plus recovery time and the longest tolerated replica outage, with disk headroom for write bursts.`,
            r`SELECT 7 AS retention_days, ROUND(24.8 / 1, 1) AS gb_per_day, ROUND(7 * 24.8, 1) AS disk_needed_gb;

-- OUTPUT:
-- retention_days | gb_per_day | disk_needed_gb
--              7 |       24.8 |          173.6`]
    ),

    'Binlog Formats: Statement, Row & Mixed': dv(
        [`In STATEMENT format the binlog stores the SQL text, so replicas re-execute it: compact, but unsafe when results depend on time, random values, user variables or storage details. In ROW format it stores the before and after images of each changed row, so replicas apply exact changes. MIXED chooses statement logging and falls back to row for unsafe statements.`,
            r`SELECT @@binlog_format, @@binlog_row_image;
UPDATE orders SET token = UUID(), updated_at = NOW() WHERE id = 1;

-- OUTPUT: (STATEMENT format)
-- Warning 1287: Unsafe statement written to the binary log using statement format since BINLOG_FORMAT = STATEMENT.
-- (ROW format logs the exact new values, so replicas get identical data)`],
        [`ROW is the default and required for READ COMMITTED safety, change data capture and some features. <code>binlog_row_image</code> can be FULL, MINIMAL or NOBLOB to reduce size; MINIMAL logs only changed columns plus the key.`,
            r`SET PERSIST binlog_format = 'ROW';
SET PERSIST binlog_row_image = 'MINIMAL';
mysqlbinlog --base64-output=DECODE-ROWS -vv binlog.000042 | head -12

-- OUTPUT: (example)
-- ### UPDATE shop.orders
-- ### WHERE @1=1
-- ### SET   @3=120.00         (only the changed column and the key)`],
        [`Mistakes: statement format with non-deterministic functions, tables without primary keys under ROW format (replicas scan for each row), and huge multi-row updates creating enormous binlog events. Give every table a primary key and batch large changes.`,
            r`SELECT t.table_name FROM information_schema.tables t LEFT JOIN information_schema.statistics s ON s.table_schema=t.table_schema AND s.table_name=t.table_name AND s.index_name='PRIMARY' WHERE t.table_schema='shop' AND t.table_type='BASE TABLE' AND s.index_name IS NULL;

-- OUTPUT:
-- table_name
-- legacy_import       (row-based replication of this table will be very slow)`],
        [`Row format log size grows with rows changed, not statement length: one UPDATE of 10 million rows writes 10 million row images. Compare sizes and batch big maintenance jobs.`,
            r`SHOW BINARY LOGS;
UPDATE logs SET archived = 1 WHERE archived = 0 LIMIT 10000;
SHOW BINARY LOGS;

-- OUTPUT: (example)
-- the binlog grew by about 3.4 MB for 10,000 changed rows`],
        [`Real-world: change data capture. Tools such as Debezium read ROW events to produce an ordered stream of inserts, updates and deletes for search indexes, caches and warehouses, with no triggers and no extra writes on the primary.`,
            r`SHOW VARIABLES WHERE Variable_name IN ('binlog_format','binlog_row_image','binlog_row_metadata','log_bin');

-- OUTPUT:
-- binlog_format       | ROW
-- binlog_row_image    | FULL
-- binlog_row_metadata | FULL      (column names included for CDC consumers)`]
    ),

    'Binlog for Replication & Recovery': dv(
        [`A replica runs an I/O thread that connects to the source, reads binlog events and appends them to its own relay log, and an SQL (applier) thread that executes the relay log events. The position is tracked by file and offset or by GTID set, so the replica can resume after a restart.`,
            r`SHOW REPLICA STATUS\G

-- OUTPUT: (excerpt)
-- Replica_IO_Running: Yes
-- Replica_SQL_Running: Yes
-- Source_Log_File: binlog.000042   Read_Source_Log_Pos: 1543
-- Retrieved_Gtid_Set: 3e11...:1-1850   Executed_Gtid_Set: 3e11...:1-1850
-- Seconds_Behind_Source: 0`],
        [`The same stream serves recovery: restore a backup then apply binlog events from the recorded position. Tools: <code>mysqlbinlog</code>, <code>SHOW BINLOG EVENTS</code>, <code>CHANGE REPLICATION SOURCE TO</code>, relay log settings and compression of the binlog (<code>binlog_transaction_compression</code>).`,
            r`CHANGE REPLICATION SOURCE TO SOURCE_HOST='10.0.0.1', SOURCE_USER='repl', SOURCE_PASSWORD='***', SOURCE_AUTO_POSITION=1, SOURCE_SSL=1;
START REPLICA;
SET PERSIST binlog_transaction_compression = ON;
SHOW RELAY LOGS;

-- OUTPUT:
-- Log_name         | File_size
-- relay-bin.000007 | 1048576`],
        [`Mistakes: purging binlogs a replica still needs (it cannot catch up and must be rebuilt), keeping binlogs only on the primary (lost with the server), and running replicas with different formats or versions without testing. Archive binlogs off-host and monitor the oldest required file.`,
            r`SHOW BINARY LOGS;
SHOW REPLICA STATUS\G
-- Last_IO_Error: Got fatal error 1236 from source when reading data from binary log: 'Could not find first log file name in binary log index file'

-- OUTPUT:
-- (the replica needs a fresh clone: restore a backup and start replication from its GTID set)`],
        [`Apply speed decides lag. Multi-threaded replication (<code>replica_parallel_workers</code>, <code>replica_parallel_type=LOGICAL_CLOCK</code>) applies independent transactions in parallel. Large transactions and missing primary keys slow the applier.`,
            r`SET GLOBAL replica_parallel_type = 'LOGICAL_CLOCK';
SET GLOBAL replica_parallel_workers = 8;
SET GLOBAL replica_preserve_commit_order = ON;
SELECT worker_id, last_applied_transaction FROM performance_schema.replication_applier_status_by_worker;

-- OUTPUT:
-- worker_id | last_applied_transaction
-- 1         | 3e11...:1850`],
        [`Real-world: continuous off-host binlog archiving gives point-in-time recovery even if the primary and its disks are lost.`,
            r`mysqlbinlog --read-from-remote-server --host=primary --user=repl --raw --stop-never --result-file=/backup/binlogs/ binlog.000042
aws s3 sync /backup/binlogs/ s3://dr-backups/binlogs/ --storage-class STANDARD_IA

-- OUTPUT:
-- upload: binlogs/binlog.000043 to s3://dr-backups/binlogs/binlog.000043`]
    ),

    'Source/Replica Architecture': dv(
        [`In asynchronous replication the source commits and returns to the client without waiting for replicas. Replicas pull the binlog, copy it to a relay log and replay it. Replicas are therefore always slightly behind. Writes go to the source; reads that tolerate staleness can go to replicas.`,
            r`-- source my.cnf
[mysqld]
server_id = 1
log_bin = binlog
gtid_mode = ON
enforce_gtid_consistency = ON
binlog_format = ROW

CREATE USER 'repl'@'%' IDENTIFIED BY 'R3pl#Pass1';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Topologies: one replica, several replicas, chained replicas, delayed replicas (protect against mistakes), multi-source replication, and group-based clusters. Replicas should be read-only (<code>super_read_only</code>). Provision a replica from a backup that records its GTID set.`,
            r`-- on the replica
CHANGE REPLICATION SOURCE TO SOURCE_HOST='10.0.0.1', SOURCE_USER='repl', SOURCE_PASSWORD='R3pl#Pass1', SOURCE_AUTO_POSITION=1, SOURCE_DELAY=3600;
START REPLICA;
SET PERSIST super_read_only = ON;
SHOW REPLICA STATUS\G

-- OUTPUT: (excerpt)
-- Replica_IO_Running: Yes   Replica_SQL_Running: Yes   SQL_Delay: 3600`],
        [`Mistakes: writing to a replica (diverging data), reading your own writes from a replica (stale reads), different <code>server_id</code> values missing, and ignoring errors (a stopped SQL thread). Route read-your-writes to the primary, or wait for the GTID.`,
            r`INSERT INTO orders (customer_id, total) VALUES (1, 1);
SELECT @@gtid_executed;
-- on the replica, before reading
SELECT WAIT_FOR_EXECUTED_GTID_SET('3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1851', 1) AS caught_up;

-- OUTPUT:
-- caught_up
-- 0         (0 means the replica has applied the transaction)`],
        [`Replicas offload reads and backups. Scale reads by adding replicas behind a router or proxy that keeps lagging nodes out of the pool. The primary still limits write throughput.`,
            r`SELECT member_host, member_state, member_role FROM performance_schema.replication_group_members;
SELECT @@read_only, @@super_read_only;

-- OUTPUT:
-- 1 | 1`],
        [`Real-world: reporting runs on a replica, nightly backups run on another replica, and a delayed replica one hour behind gives a safety net against accidental deletes.`,
            r`SHOW REPLICA STATUS\G

-- OUTPUT: (excerpt, delayed replica)
-- SQL_Delay: 3600   Seconds_Behind_Source: 3600   (use it to recover from a mistaken DELETE made within the last hour)`]
    ),

    'Asynchronous & Semi-Synchronous Replication': dv(
        [`In asynchronous replication a transaction is committed on the source without waiting for any replica. If the source fails right after, recent commits that never reached a replica are lost. In semi-synchronous replication the source waits, before returning COMMIT to the client, until at least one replica acknowledges that it has received and logged the event (the acknowledgement point is configurable).`,
            r`INSTALL PLUGIN rpl_semi_sync_source SONAME 'semisync_source.so';
SET GLOBAL rpl_semi_sync_source_enabled = 1;
SET GLOBAL rpl_semi_sync_source_wait_for_replica_count = 1;
SET GLOBAL rpl_semi_sync_source_timeout = 1000;
SHOW STATUS LIKE 'Rpl_semi_sync_source_status';

-- OUTPUT:
-- Variable_name               | Value
-- Rpl_semi_sync_source_status | ON`],
        [`Settings: <code>rpl_semi_sync_source_wait_point</code> (AFTER_SYNC is lossless), <code>wait_for_replica_count</code>, <code>timeout</code>. On the replica enable <code>rpl_semi_sync_replica_enabled</code> and restart the I/O thread. For stronger guarantees use Group Replication.`,
            r`INSTALL PLUGIN rpl_semi_sync_replica SONAME 'semisync_replica.so';
SET GLOBAL rpl_semi_sync_replica_enabled = 1;
STOP REPLICA IO_THREAD; START REPLICA IO_THREAD;
SHOW VARIABLES LIKE 'rpl_semi_sync_source_wait_point';

-- OUTPUT:
-- rpl_semi_sync_source_wait_point | AFTER_SYNC`],
        [`Mistakes: assuming semi-sync guarantees the replica has applied the data (only received), forgetting the timeout fallback to asynchronous mode, and placing the acknowledging replica far away. Monitor the status and the fallback counters.`,
            r`SHOW STATUS WHERE Variable_name IN ('Rpl_semi_sync_source_status','Rpl_semi_sync_source_yes_tx','Rpl_semi_sync_source_no_tx','Rpl_semi_sync_source_clients');

-- OUTPUT: (example)
-- Rpl_semi_sync_source_status | ON
-- Rpl_semi_sync_source_yes_tx | 482113
-- Rpl_semi_sync_source_no_tx  |    120       (commits that fell back to async)`],
        [`Semi-sync adds the replica round trip to every commit, so use a nearby replica for the acknowledgement. Measure commit latency with and without it.`,
            r`SELECT ROUND(AVG_TIMER_WAIT / 1e9, 2) AS avg_commit_ms FROM performance_schema.events_statements_summary_by_digest WHERE digest_text LIKE 'COMMIT%';

-- OUTPUT: (example)
-- async: 0.9 ms   semi-sync same AZ: 1.8 ms   semi-sync cross-region: 62 ms
-- avg_commit_ms
-- 1.84`],
        [`Real-world: payment systems use semi-sync (or Group Replication) with a replica in another availability zone, accepting extra commit latency to avoid losing acknowledged payments on a primary crash.`,
            r`SHOW STATUS LIKE 'Rpl_semi_sync_source_status';
SHOW REPLICA STATUS\G

-- OUTPUT:
-- Rpl_semi_sync_source_status | ON`]
    ),

    'Replication Lag': dv(
        [`Lag is the delay between a commit on the source and its application on the replica. It has three parts: transfer time to the relay log, queueing in the relay log, and apply time. <code>Seconds_Behind_Source</code> is computed from event timestamps, so it can mislead (zero while stalled, jumps after idle periods).`,
            r`SHOW REPLICA STATUS\G

-- OUTPUT: (excerpt)
-- Seconds_Behind_Source: 37
-- Replica_SQL_Running_State: Waiting for dependent transaction to commit
-- Relay_Log_Space: 804212736`],
        [`Common causes: large transactions, single-threaded apply, replica hardware or I/O weaker than the source, missing primary keys under row format, heavy reads on the replica, and DDL. Mitigations: parallel workers, smaller transactions, indexes and key columns, better I/O.`,
            r`SET GLOBAL replica_parallel_type = 'LOGICAL_CLOCK';
SET GLOBAL replica_parallel_workers = 16;
SET GLOBAL replica_preserve_commit_order = ON;
SELECT worker_id, applying_transaction, last_applied_transaction FROM performance_schema.replication_applier_status_by_worker;

-- OUTPUT:
-- worker_id | applying_transaction | last_applied_transaction
-- 1         | 3e11...:1852         | 3e11...:1851`],
        [`Mistakes: trusting Seconds_Behind_Source alone, reading from a lagging replica for critical data, and running huge batch jobs in one transaction. Use a heartbeat table for accurate lag and batch maintenance with throttling.`,
            r`-- on the source, every second
REPLACE INTO ops.heartbeat (id, ts) VALUES (1, NOW(6));
-- on the replica
SELECT TIMESTAMPDIFF(MICROSECOND, ts, NOW(6)) / 1000000 AS lag_seconds FROM ops.heartbeat WHERE id = 1;

-- OUTPUT:
-- lag_seconds
-- 0.84`],
        [`Application strategy: route read-your-writes to the primary, route others only to replicas below a lag threshold, and fall back to the primary when lag is high. Proxies (ProxySQL, MySQL Router) can enforce lag limits.`,
            r`UPDATE mysql_servers SET max_replication_lag = 5 WHERE hostgroup_id = 20;
LOAD MYSQL SERVERS TO RUNTIME;
SELECT hostname, status, max_replication_lag FROM runtime_mysql_servers;

-- OUTPUT:
-- hostname | status | max_replication_lag
-- replica1 | ONLINE |                   5`],
        [`Real-world: a nightly purge once caused 40 minutes of lag. The fix was batching deletes by 2,000 rows with a pause that waits for lag to drop under a threshold before the next batch.`,
            r`DELETE FROM events WHERE created_at < NOW() - INTERVAL 90 DAY LIMIT 2000;
-- loop: sleep until (SELECT lag_seconds FROM replica_lag) < 3 before the next batch

-- OUTPUT:
-- Query OK, 2000 rows affected   (replication lag stays below 3 seconds)`]
    ),

    'Read Replicas & Failover': dv(
        [`A read replica serves read-only queries. Failover promotes a replica to primary when the primary fails: stop replication on the candidate, make sure it applied everything it received, make it writable, point other replicas and clients at it, and fence the old primary so it cannot accept writes (avoiding split-brain).`,
            r`STOP REPLICA;
RESET REPLICA ALL;
SET GLOBAL super_read_only = OFF;
SET GLOBAL read_only = OFF;
SELECT @@read_only, @@gtid_executed;

-- OUTPUT:
-- @@read_only | @@gtid_executed
-- 0           | 3e11...:1-1850`],
        [`Routing options: application-level read/write split, ProxySQL query rules, MySQL Router ports (6446 read/write, 6447 read-only), or cloud endpoints. Automated failover tools: InnoDB Cluster, Orchestrator, MHA, managed services.`,
            r`INSERT INTO mysql_query_rules (rule_id, active, match_digest, destination_hostgroup, apply) VALUES (1, 1, '^SELECT .* FOR UPDATE', 10, 1), (2, 1, '^SELECT', 20, 1), (3, 1, '.*', 10, 1);
LOAD MYSQL QUERY RULES TO RUNTIME;

-- OUTPUT:
-- Query OK, 3 rows affected   (hostgroup 10 = primary, 20 = replicas)`],
        [`Mistakes: split-brain from an old primary that comes back writable, promoting a lagging replica (lost transactions), clients that cache the old address, and untested failover. Fence, check GTIDs and drill regularly.`,
            r`SELECT GTID_SUBTRACT('3e11...:1-1900', @@gtid_executed) AS missing_on_candidate;
SET PERSIST super_read_only = ON;       -- fence the old primary when it returns

-- OUTPUT:
-- missing_on_candidate
-- 3e11...:1851-1900         (50 transactions would be lost: choose a more advanced replica or recover them)`],
        [`Read replicas scale reads linearly until replication lag or the primary's write rate becomes the limit. Measure per-replica query load and lag, and add replicas before saturation.`,
            r`SELECT host, COUNT(*) AS connections FROM information_schema.processlist GROUP BY host ORDER BY connections DESC LIMIT 3;
SHOW GLOBAL STATUS LIKE 'Threads_running';

-- OUTPUT: (example)
-- Threads_running | 14`],
        [`Real-world failover drill: kill the primary in a staging copy of production, measure detection and promotion time, verify no lost or duplicated writes, and record the result against the RTO target.`,
            r`SELECT COUNT(*) AS rows_after, MAX(id) AS max_id FROM orders;
-- compare with the counts captured before the failure

-- OUTPUT:
-- rows_after | max_id
-- 612044     | 612044          (no lost writes; recovery completed in 27 seconds)`]
    ),

    'GTID': dv(
        [`A GTID is <code>source_uuid:transaction_number</code>, assigned at commit and written to the binlog with the transaction. Each server tracks the set of GTIDs it has executed (<code>gtid_executed</code>). A replica using auto-positioning tells the source its executed set, and the source sends exactly the missing transactions, so file names and offsets are not needed.`,
            r`SELECT @@gtid_mode, @@enforce_gtid_consistency, @@server_uuid;
SELECT @@gtid_executed;
CHANGE REPLICATION SOURCE TO SOURCE_AUTO_POSITION = 1;

-- OUTPUT:
-- @@gtid_mode | @@enforce_gtid_consistency | @@server_uuid
-- ON          | ON                         | 3e11fa47-71ca-11e1-9e33-c80aa9429562
-- 3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1850`],
        [`Operations: compare sets with <code>GTID_SUBTRACT</code>, wait for a transaction with <code>WAIT_FOR_EXECUTED_GTID_SET</code>, skip a failing transaction by committing an empty one with its GTID, and enable GTIDs online through the permissive modes.`,
            r`STOP REPLICA;
SET GTID_NEXT = '3e11fa47-71ca-11e1-9e33-c80aa9429562:1851';
BEGIN; COMMIT;
SET GTID_NEXT = 'AUTOMATIC';
START REPLICA;
SELECT GTID_SUBTRACT('3e11...:1-1900', '3e11...:1-1850') AS missing;

-- OUTPUT:
-- missing
-- 3e11...:1851-1900`],
        [`Mistakes: errant transactions (writes made directly on a replica) that block promotion, statements not allowed under GTID consistency (non-transactional engines mixed in a transaction), and enabling GTID in one step on a busy system. Detect errant GTIDs and step through the modes.`,
            r`-- on a replica: find GTIDs that the source does not have
SELECT GTID_SUBTRACT(@@gtid_executed, '3e11...:1-1850') AS errant;
SET GLOBAL gtid_mode = OFF_PERMISSIVE;
SET GLOBAL gtid_mode = ON_PERMISSIVE;
SET GLOBAL gtid_mode = ON;

-- OUTPUT:
-- errant
-- 9a1b...:1-3          (fix before any failover)`],
        [`GTIDs make replica creation and failover faster and less error-prone, and let proxies check freshness. Their cost is small: the gtid tables and binlog headers. Keep <code>gtid_executed</code> compact by letting the server compress it periodically.`,
            r`SELECT COUNT(*) AS rows_in_gtid_table FROM mysql.gtid_executed;
SET GLOBAL gtid_executed_compression_period = 1000;

-- OUTPUT:
-- rows_in_gtid_table
-- 4`],
        [`Real-world: read-your-writes. After a write on the primary, capture its GTID and ask the replica to wait for it before reading, so the user always sees their own change.`,
            r`INSERT INTO orders (customer_id, total) VALUES (1, 500);
SELECT @@global.gtid_executed;                    -- on the primary
SELECT WAIT_FOR_EXECUTED_GTID_SET('3e11...:1-1851', 1);   -- on the replica

-- OUTPUT:
-- 0       (the replica has applied the write; safe to read)`]
    ),

    'Replication Monitoring': dv(
        [`Replication health has three layers: are the I/O and SQL threads running, how far behind is the replica, and is the data identical. MySQL exposes them through <code>SHOW REPLICA STATUS</code> and Performance Schema replication tables; consistency needs checksum tools.`,
            r`SELECT channel_name, service_state, last_error_message FROM performance_schema.replication_applier_status_by_coordinator;
SELECT channel_name, source_uuid, service_state, last_heartbeat_timestamp FROM performance_schema.replication_connection_status;

-- OUTPUT: (example)
-- channel_name | service_state | last_error_message
--              | ON            |
-- source_uuid  | service_state | last_heartbeat_timestamp
-- 3e11fa47...  | ON            | 2026-05-01 10:00:00`],
        [`Collect metrics with exporters (mysqld_exporter, PMM, cloud monitoring): <code>Seconds_Behind_Source</code>, thread states, retrieved vs executed GTID gaps, relay log space, apply worker states, semi-sync status. Heartbeat tables (pt-heartbeat) give accurate lag.`,
            r`SELECT worker_id, thread_id, service_state, last_error_number, last_error_message FROM performance_schema.replication_applier_status_by_worker;
SELECT GTID_SUBTRACT(Retrieved_Gtid_Set, Executed_Gtid_Set) FROM (SELECT 'x' AS Retrieved_Gtid_Set, 'y' AS Executed_Gtid_Set) t;

-- OUTPUT:
-- worker_id | service_state | last_error_number
-- 1         | ON            |                 0`],
        [`Mistakes: alerting only on thread state (silent lag), no checksum for silent divergence, no alert on read_only changes, and ignoring the error log. Combine liveness, lag and consistency checks.`,
            r`pt-table-checksum --host=primary --user=chk --password=*** --databases=shop

-- OUTPUT: (example)
-- TS ERRORS DIFFS ROWS CHUNKS SKIPPED TIME TABLE
-- 05-01 0 0 612044 12 0 6.1 shop.orders        (DIFFS 0 means identical)`],
        [`Alert on symptoms and capacity: stopped threads, lag above a threshold for several minutes, relay log space growth, and GTID gaps. Keep dashboards for trends and let alerts page only when action is needed.`,
            r`- alert: MySQLReplicaLagHigh
  expr: mysql_slave_status_seconds_behind_master > 30
  for: 5m
- alert: MySQLReplicationStopped
  expr: mysql_slave_status_slave_sql_running == 0 or mysql_slave_status_slave_io_running == 0
  for: 1m

-- OUTPUT:
-- alerts fire only when the condition persists`],
        [`Real-world remediation runbook: if the SQL thread stops on an error, read Last_SQL_Error, decide whether to skip (with GTID), fix data, or rebuild the replica from a backup; record the cause.`,
            r`SHOW REPLICA STATUS\G
-- Last_SQL_Error: Could not execute Update_rows event on table shop.orders; Can't find record in 'orders'
-- decision: the row was changed directly on the replica -> rebuild the replica from a fresh backup

-- OUTPUT:
-- (replica rebuilt and replication resumed with no data loss)`]
    )
};
