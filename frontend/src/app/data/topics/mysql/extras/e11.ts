// Modules 32-36 (Users & Security, SQL Injection, Backup, Binary Logs, Replication) extras.
import { x, r, type Extra } from './extra';

export const e11: Record<string, Extra> = {
    'CREATE, ALTER & DROP USER': x(
        ['<code>CREATE USER</code> adds an account, <code>ALTER USER</code> changes password or settings, <code>DROP USER</code> removes it.',
            'An account is <code>user@host</code>; the host part limits where the user can connect from.',
            'Always use strong passwords and never share root.'],
        ['Useful options: <code>PASSWORD EXPIRE INTERVAL 90 DAY</code>, <code>FAILED_LOGIN_ATTEMPTS</code>, <code>WITH MAX_USER_CONNECTIONS</code>, <code>REQUIRE SSL</code>.',
            'Lock accounts with <code>ACCOUNT LOCK</code> instead of dropping when you need to preserve grants.',
            'Check accounts via <code>SELECT user, host FROM mysql.user</code>.'],
        ['MySQL 8 supports dual passwords for zero-downtime rotation: <code>RETAIN CURRENT PASSWORD</code>.',
            'Use password validation component and external authentication (LDAP, PAM, IAM auth for cloud) for centralized control.',
            'Automate account lifecycle with IaC and review accounts periodically; remove anonymous and wildcard-host users.'],
        [['F', 'How do you create and delete a user?', '<code>CREATE USER "u"@"host" IDENTIFIED BY "pw";</code> and <code>DROP USER "u"@"host";</code>.'],
            ['F', 'What does the host part do?', 'Restricts from which machines the user can connect.'],
            ['M', 'How do you lock an account?', '<code>ALTER USER "u"@"host" ACCOUNT LOCK;</code>'],
            ['M', 'How do you require TLS for a user?', '<code>ALTER USER ... REQUIRE SSL;</code>'],
            ['S', 'How do you rotate a password with no downtime?', 'Use <code>RETAIN CURRENT PASSWORD</code>, deploy the new secret, then <code>DISCARD OLD PASSWORD</code>.'],
            ['S', 'How do you enforce a password policy?', 'Enable the validate_password component, set expiry/history rules and use central auth where possible.']],
        [['Create with policy.',
            r`CREATE USER 'svc_app'@'10.0.%' IDENTIFIED BY 'Xk9#mQ2v!zL'
  PASSWORD EXPIRE INTERVAL 90 DAY FAILED_LOGIN_ATTEMPTS 5 PASSWORD_LOCK_TIME 1
  WITH MAX_USER_CONNECTIONS 50 REQUIRE SSL;
SELECT user, host, password_lifetime FROM mysql.user WHERE user = 'svc_app';

-- OUTPUT:
-- user    | host   | password_lifetime
-- svc_app | 10.0.% | 90`],
            ['Zero-downtime password rotation.',
                r`ALTER USER 'svc_app'@'10.0.%' IDENTIFIED BY 'NewPass#2026x' RETAIN CURRENT PASSWORD;
-- deploy new secret to applications, then:
ALTER USER 'svc_app'@'10.0.%' DISCARD OLD PASSWORD;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Find risky accounts.',
            r`SELECT user, host FROM mysql.user WHERE host = '%' OR user = '';

-- OUTPUT: (example)
-- user | host
-- test | %`],
            ['Lock and drop.',
                r`ALTER USER 'test'@'%' ACCOUNT LOCK;
DROP USER 'test'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'GRANT, REVOKE & SHOW GRANTS': x(
        ['<code>GRANT</code> gives privileges, <code>REVOKE</code> removes them, <code>SHOW GRANTS FOR user</code> lists them.',
            'Example: <code>GRANT SELECT, INSERT ON shop.* TO "app"@"%";</code>.',
            'Privileges can be global, per database, per table or per column.'],
        ['Grant the minimum required (least privilege); avoid <code>ALL PRIVILEGES</code> and <code>WITH GRANT OPTION</code> for apps.',
            'Levels: <code>*.*</code> global, <code>db.*</code>, <code>db.table</code>, column lists.',
            'Privilege changes apply to new connections (some to existing sessions at next statement).'],
        ['Use roles to manage privileges for groups and review grants regularly.',
            'Separate accounts for app (DML), migration (DDL), read-only reporting and admin.',
            'Audit privilege use with the audit log plugin and alert on privilege changes.'],
        [['F', 'What does GRANT do?', 'Gives a user specific permissions.'],
            ['F', 'How do you see a user’s permissions?', '<code>SHOW GRANTS FOR "user"@"host";</code>'],
            ['M', 'What is WITH GRANT OPTION?', 'Lets the user pass on the same privileges to others; avoid for application accounts.'],
            ['M', 'Can you grant on specific columns?', 'Yes: <code>GRANT SELECT (name, dept) ON shop.emp TO ...</code>.'],
            ['S', 'How do you design privileges for an application?', 'Separate accounts per duty, DML only for the app, DDL only for the migration tool, read-only for BI, all restricted by host and schema.'],
            ['S', 'How to detect privilege creep?', 'Periodic report of grants per user compared with a baseline and alerts on GRANT statements through audit logging.']],
        [['Least privilege app user.',
            r`CREATE USER 'shop_app'@'%' IDENTIFIED BY 'S3cure#Pass9';
GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'shop_app'@'%';
SHOW GRANTS FOR 'shop_app'@'%';

-- OUTPUT:
-- GRANT USAGE ON *.* TO shop_app@%
-- GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO shop_app@%`],
            ['Column-level grant and revoke.',
                r`GRANT SELECT (id, name, dept) ON shop.emp TO 'hr_reader'@'%';
REVOKE SELECT (dept) ON shop.emp FROM 'hr_reader'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Denied operation.',
            r`-- as shop_app
DROP TABLE shop.emp;

-- OUTPUT:
-- ERROR 1142 (42000): DROP command denied to user 'shop_app'@'localhost' for table 'emp'`],
            ['Audit all grants.',
                r`SELECT grantee, table_schema, privilege_type FROM information_schema.schema_privileges ORDER BY grantee;

-- OUTPUT: (example)
-- grantee         | table_schema | privilege_type
-- 'shop_app'@'%'  | shop         | SELECT`]]
    ),

    'Roles & Privileges': x(
        ['A role is a named bundle of privileges that you grant to users: <code>CREATE ROLE reader; GRANT SELECT ON shop.* TO reader; GRANT reader TO user;</code>.',
            'Roles make permissions easier to manage for many users.',
            'Users must activate roles: <code>SET DEFAULT ROLE</code> or <code>SET ROLE</code>.'],
        ['Roles are accounts that cannot log in by default (locked), stored in mysql.user.',
            '<code>SET DEFAULT ROLE ALL TO user</code> activates all granted roles at login.',
            'Check active roles with <code>SELECT CURRENT_ROLE()</code>.'],
        ['Model roles by job function (app_rw, report_ro, migrator, dba_readonly) and keep them in version control.',
            'Combine with host and TLS restrictions at the user level.',
            'Avoid role explosion; review unused roles.'],
        [['F', 'What is a role in MySQL?', 'A named set of privileges that can be granted to users.'],
            ['F', 'Why use roles?', 'To manage permissions for groups of users in one place.'],
            ['M', 'Why is my role not working after GRANT?', 'The role is not active; set a default role or use SET ROLE.'],
            ['M', 'How do you see current roles?', '<code>SELECT CURRENT_ROLE();</code>'],
            ['S', 'How to structure roles for an organisation?', 'Functional roles (read-only, read-write, migrations, admin) granted to users or service accounts, kept in migration scripts and audited.'],
            ['S', 'What is a mandatory role?', 'A role listed in <code>mandatory_roles</code> that is granted to every user automatically.']],
        [['Create and use a role.',
            r`CREATE ROLE 'report_ro';
GRANT SELECT ON shop.* TO 'report_ro';
CREATE USER 'bi'@'%' IDENTIFIED BY 'B1#Report9';
GRANT 'report_ro' TO 'bi'@'%';
SET DEFAULT ROLE 'report_ro' TO 'bi'@'%';
SHOW GRANTS FOR 'bi'@'%' USING 'report_ro';

-- OUTPUT:
-- GRANT USAGE ON *.* TO bi@%
-- GRANT SELECT ON shop.* TO bi@%
-- GRANT report_ro@% TO bi@%`],
            ['Check active role in a session.',
                r`SELECT CURRENT_ROLE();

-- OUTPUT:
-- CURRENT_ROLE()
-- report_ro@%`]],
        [['Mandatory role for everyone.',
            r`SET PERSIST mandatory_roles = 'report_ro';

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Drop a role.',
                r`DROP ROLE 'report_ro';

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Least Privilege & Application Users': x(
        ['Least privilege means each account has only the permissions it needs. Applications should never connect as root.',
            'Create a dedicated user per application with rights only on its own schema.',
            'Limit the host, enforce TLS and use strong passwords.'],
        ['Typical split: app user (DML), migration user (DDL), read-only reporting user, admin/DBA users.',
            'Do not grant FILE, SUPER, PROCESS, GRANT OPTION or global privileges to apps.',
            'Use separate accounts per environment and per service.'],
        ['A compromised app account should not be able to drop tables or read other schemas; combine least privilege with network segmentation and secrets management (Vault, KMS).',
            'Rotate credentials and use short-lived credentials (IAM auth, Vault dynamic secrets).',
            'Log and alert on connections from unexpected hosts.'],
        [['F', 'What is least privilege?', 'Giving an account only the permissions it needs, nothing more.'],
            ['F', 'Should an application use the root user?', 'No, never.'],
            ['M', 'Which privileges should apps not have?', 'DROP, CREATE, ALTER, FILE, SUPER, GRANT OPTION and global privileges.'],
            ['M', 'Why separate migration and app users?', 'Schema change rights are powerful; the running app should not have them.'],
            ['S', 'How do you limit blast radius of a leaked credential?', 'Per-service accounts, host restrictions, network policies, short-lived credentials and no cross-schema privileges.'],
            ['S', 'How should secrets be handled?', 'Stored in a secrets manager, injected at runtime, rotated regularly and never in source control.']],
        [['App versus migration accounts.',
            r`CREATE USER 'orders_app'@'10.0.1.%' IDENTIFIED BY 'A9#kLm2Qx!';
GRANT SELECT, INSERT, UPDATE, DELETE ON orders.* TO 'orders_app'@'10.0.1.%';
CREATE USER 'orders_migrate'@'10.0.2.5' IDENTIFIED BY 'M7#pLz3Vw!';
GRANT ALL PRIVILEGES ON orders.* TO 'orders_migrate'@'10.0.2.5';

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Verify an app cannot alter schema.',
                r`-- as orders_app
ALTER TABLE orders.orders ADD COLUMN x INT;

-- OUTPUT:
-- ERROR 1142 (42000): ALTER command denied to user 'orders_app'@'10.0.1.7' for table 'orders'`]],
        [['Find over-privileged accounts.',
            r`SELECT user, host FROM mysql.user WHERE Super_priv = 'Y' OR Grant_priv = 'Y' OR File_priv = 'Y';

-- OUTPUT: (example)
-- user | host
-- root | localhost`],
            ['Spring Boot datasource using a dedicated user (config).',
                r`spring.datasource.url=jdbc:mysql://db.internal:3306/orders?sslMode=VERIFY_IDENTITY
spring.datasource.username=orders_app
spring.datasource.password=(injected from the secrets manager at runtime)

-- OUTPUT:
-- Application connects with minimum privileges over TLS`]]
    ),

    'How SQL Injection Works': x(
        ['SQL injection happens when user input is concatenated into a SQL string, letting an attacker change the query.',
            'Example: <code>"SELECT * FROM users WHERE name = \'" + input + "\'"</code> with input <code>\' OR \'1\'=\'1</code>.',
            'It can expose, change or delete data.'],
        ['Attack types: classic (in-band), blind (true/false or time-based), UNION-based data extraction, second-order (stored then used).',
            'Even numeric fields and ORDER BY columns can be injectable.',
            'Error messages shown to users help attackers; hide them.'],
        ['Defense in depth: parameterized queries everywhere, least privilege accounts, input validation by allow-list, WAF and monitoring.',
            'Dynamic identifiers (table or column names, ORDER BY direction) cannot be parameters; map from an allow-list.',
            'ORMs reduce risk but native queries and string-built JPQL/HQL remain vulnerable.'],
        [['F', 'What is SQL injection?', 'An attack where malicious input changes the meaning of a SQL query.'],
            ['F', 'How is it prevented?', 'With parameterized queries (prepared statements) instead of string concatenation.'],
            ['M', 'Can ORDER BY be injected?', 'Yes; identifiers cannot be bound as parameters, so validate against an allow-list of columns and directions.'],
            ['M', 'What is blind SQL injection?', 'The attacker infers data from true/false responses or timing without seeing results directly.'],
            ['S', 'What is second-order injection?', 'Malicious input is stored safely, then later used unsafely in another query.'],
            ['S', 'Which controls limit damage if injection happens?', 'Least-privilege DB accounts, no stacked queries, separation of schemas, monitoring and WAF rules.']],
        [['Vulnerable query.',
            r`-- application builds:  "SELECT * FROM users WHERE name = '" + name + "' AND pwd = '" + pwd + "'"
-- attacker sends name = admin' --
SELECT * FROM users WHERE name = 'admin' -- ' AND pwd = ''

-- OUTPUT:
-- id | name  | role
--  1 | admin | ADMIN      (password check bypassed)`],
            ['Data extraction with UNION.',
                r`-- id = 0 UNION SELECT user, password_hash FROM users
SELECT name, email FROM products WHERE id = 0 UNION SELECT username, password_hash FROM users;

-- OUTPUT:
-- name  | email
-- admin | $2a$10$abc...`]],
        [['Time-based blind probe.',
            r`SELECT * FROM products WHERE id = 1 AND IF(SUBSTRING(DATABASE(),1,1)='s', SLEEP(5), 0);

-- OUTPUT:
-- (response delayed 5 seconds => first letter of database name is s)`],
            ['Allow-list for ORDER BY.',
                r`-- application code: if (!List.of("name","price").contains(col)) col = "name";
SELECT name, price FROM products ORDER BY price DESC;

-- OUTPUT:
-- name | price
-- Bag  | 799.00`]]
    ),

    'Prepared Statements & Parameterized Queries': x(
        ['A prepared statement sends the SQL with placeholders (?) first and the values separately, so input is always treated as data, never as SQL.',
            'Java: <code>PreparedStatement ps = c.prepareStatement("SELECT * FROM users WHERE email = ?"); ps.setString(1, email);</code>.',
            'It prevents SQL injection and can be faster for repeated queries.'],
        ['In MySQL: <code>PREPARE s FROM "..."; EXECUTE s USING @v; DEALLOCATE PREPARE s;</code>.',
            'Drivers may emulate prepared statements client-side (<code>useServerPrepStmts=false</code> default in Connector/J); both are safe if parameters are bound, but server-side gives parse reuse.',
            'Placeholders cannot replace identifiers or keywords.'],
        ['Server-side prepared statements cache plans per connection; with pools set <code>cachePrepStmts</code> and <code>prepStmtCacheSize</code> carefully.',
            'Large IN lists need dynamic placeholder counts; generate "?,?,?" safely.',
            'ORMs use parameters by default; audit native queries and string-built fragments.'],
        [['F', 'What is a prepared statement?', 'A SQL template with placeholders that is executed with separately supplied values.'],
            ['F', 'Why does it prevent SQL injection?', 'Values are sent as data, so they cannot change the query structure.'],
            ['M', 'Can you use a placeholder for a table or column name?', 'No; use an allow-list and build the identifier yourself.'],
            ['M', 'How do you handle an IN list safely?', 'Generate the right number of ? placeholders and bind each value.'],
            ['S', 'Server-side vs client-side prepared statements?', 'Server-side parses once and reuses it per connection; client-side emulation escapes values in the driver. Both prevent injection when used correctly.'],
            ['S', 'Which settings affect statement caching in Connector/J?', '<code>useServerPrepStmts</code>, <code>cachePrepStmts</code>, <code>prepStmtCacheSize</code>, <code>prepStmtCacheSqlLimit</code>.']],
        [['Server-side prepared statement.',
            r`PREPARE find_user FROM 'SELECT id, name FROM users WHERE email = ?';
SET @e = 'a@x.com'' OR ''1''=''1';
EXECUTE find_user USING @e;
DEALLOCATE PREPARE find_user;

-- OUTPUT:
-- Empty set    (the malicious text is treated as a literal email value)`],
            ['Java JDBC example.',
                r`try (PreparedStatement ps = conn.prepareStatement("SELECT id, name FROM users WHERE email = ?")) {
    ps.setString(1, email);
    try (ResultSet rs = ps.executeQuery()) { while (rs.next()) { /* use */ } }
}

-- OUTPUT:
-- Query executed with email bound as a parameter, never concatenated`]],
        [['Dynamic IN list.',
            r`// Java: String marks = String.join(",", Collections.nCopies(ids.size(), "?"));
// String sql = "SELECT * FROM users WHERE id IN (" + marks + ")";

-- OUTPUT:
-- SELECT * FROM users WHERE id IN (?,?,?)`],
            ['Connection string for statement caching.',
                r`jdbc:mysql://db:3306/shop?useServerPrepStmts=true&cachePrepStmts=true&prepStmtCacheSize=250&prepStmtCacheSqlLimit=2048

-- OUTPUT:
-- Prepared statements parsed once per connection and cached`]]
    ),

    'Logical vs Physical Backup': x(
        ['A logical backup exports data as SQL statements (mysqldump). A physical backup copies the actual data files (Percona XtraBackup, MySQL Enterprise Backup, snapshots).',
            'Logical backups are portable and easy to restore partly; physical backups are faster for big databases.',
            'You need at least one tested restore path.'],
        ['Logical: slower to take and restore, readable, works across versions and platforms, small restores of single tables are easy.',
            'Physical: very fast backup/restore, hot backup possible with XtraBackup, same version and architecture constraints.',
            'Filesystem or cloud snapshots need quiescing or InnoDB crash recovery to be consistent.'],
        ['Choose by RTO/RPO: multi-hundred GB databases need physical or snapshot backups plus binlogs for point-in-time recovery.',
            'Keep multiple tiers: frequent snapshots, daily physical backup, binlog archive, periodic logical dump for portability.',
            'Encrypt and store backups off-site; monitor backup size and duration.'],
        [['F', 'What is a logical backup?', 'A backup in the form of SQL statements, such as mysqldump output.'],
            ['F', 'What is a physical backup?', 'A copy of the database files themselves.'],
            ['M', 'Which is faster to restore for large data?', 'Physical backups.'],
            ['M', 'Which is more portable between versions?', 'Logical backups.'],
            ['S', 'How do you choose a backup method?', 'From database size, RTO/RPO, version/platform portability and operational skills; large systems combine physical backups with binlog archiving.'],
            ['S', 'How can snapshots be made consistent?', 'Use InnoDB with crash recovery on restore, or flush tables with read lock/ backup locks, and keep binlog coordinates.']],
        [['Logical backup of a database.',
            r`mysqldump -u root -p --single-transaction --routines --triggers shop > shop.sql

-- OUTPUT:
-- (shop.sql created: CREATE TABLE and INSERT statements, routines and triggers)`],
            ['Physical backup with XtraBackup.',
                r`xtrabackup --backup --user=backup --password=*** --target-dir=/backups/full-2026-05-01
xtrabackup --prepare --target-dir=/backups/full-2026-05-01

-- OUTPUT:
-- completed OK!   (data files copied and made consistent)`]],
        [['Restore comparison (conceptual).',
            r`-- 500 GB database
-- logical restore (mysql < dump.sql): ~ 18 hours
-- physical restore (copy-back):       ~ 40 minutes

-- OUTPUT:
-- Choose physical for large datasets with strict RTO`],
            ['Record binlog position with the backup.',
                r`mysqldump --single-transaction --source-data=2 shop > shop.sql
-- shop.sql contains: -- CHANGE REPLICATION SOURCE TO SOURCE_LOG_FILE='binlog.000042', SOURCE_LOG_POS=1543;

-- OUTPUT:
-- Binlog coordinates saved for point-in-time recovery`]]
    ),

    'mysqldump & Restore': x(
        ['<code>mysqldump</code> creates a logical backup: <code>mysqldump -u root -p dbname &gt; backup.sql</code>. Restore with <code>mysql -u root -p dbname &lt; backup.sql</code>.',
            'Dump all databases with <code>--all-databases</code> or one table by naming it.',
            'It produces SQL you can read and edit.'],
        ['Important flags: <code>--single-transaction</code> (consistent InnoDB snapshot without locks), <code>--routines --triggers --events</code>, <code>--source-data</code>, <code>--set-gtid-purged</code>.',
            'Compress: <code>| gzip &gt; backup.sql.gz</code>.',
            'Always test a restore to a scratch server.'],
        ['For big data prefer <code>mysqlpump</code>/MySQL Shell dump utilities (parallel) or physical backups.',
            'Restoring into production needs care: disable foreign key checks during load and use the same SQL mode/collation.',
            'Do not store passwords on the command line; use an option file with restricted permissions.'],
        [['F', 'How do you back up a database?', '<code>mysqldump -u user -p dbname &gt; backup.sql</code>'],
            ['F', 'How do you restore it?', '<code>mysql -u user -p dbname &lt; backup.sql</code>'],
            ['M', 'Why use --single-transaction?', 'It takes a consistent InnoDB snapshot without blocking writes.'],
            ['M', 'How do you include stored procedures and triggers?', 'Use <code>--routines --triggers --events</code> (triggers are on by default).'],
            ['S', 'How do you speed up dump and restore?', 'Use MySQL Shell <code>util.dumpInstance/loadDump</code> (parallel) or physical backups; tune restore with larger redo log and relaxed durability temporarily.'],
            ['S', 'How do you verify a backup?', 'Restore to a test server, run integrity checks and row counts, and compare checksums.']],
        [['Dump and compress.',
            r`mysqldump -u backup -p --single-transaction --routines --events shop | gzip > shop_2026-05-01.sql.gz

-- OUTPUT:
-- shop_2026-05-01.sql.gz  (compressed dump file)`],
            ['Restore into a new database.',
                r`mysql -u root -p -e "CREATE DATABASE shop_restore"
gunzip < shop_2026-05-01.sql.gz | mysql -u root -p shop_restore
mysql -u root -p -e "SELECT COUNT(*) FROM shop_restore.orders"

-- OUTPUT:
-- COUNT(*)
-- 120450`]],
        [['Dump a single table with a filter.',
            r`mysqldump -u root -p shop orders --where="created_at >= '2026-01-01'" > orders_2026.sql

-- OUTPUT:
-- (orders_2026.sql with only matching rows)`],
            ['Credentials without a password flag.',
                r`# ~/.my.cnf (chmod 600)
[client]
user=backup
password=***

-- OUTPUT:
-- mysqldump shop > shop.sql   (no password on the command line)`]]
    ),

    'Backup Strategies: Full & Incremental': x(
        ['A full backup copies everything. An incremental backup copies only what changed since the last backup (or last full).',
            'Typical plan: weekly full, daily incremental, plus binary logs for point-in-time recovery.',
            'The schedule must match how much data you can afford to lose (RPO).'],
        ['Incremental in MySQL: XtraBackup incremental (changed pages) or archived binary logs.',
            'Restore needs the full backup plus every incremental or binlog in order.',
            'Keep multiple generations and test restore regularly.'],
        ['Define RPO and RTO first, then design: continuous binlog shipping gives near-zero RPO; frequent snapshots reduce RTO.',
            'Protect backups: encrypt, store off-site/immutable, restrict access and monitor success.',
            'Automate verification: periodic restore-and-check jobs that alert on failure.'],
        [['F', 'Full vs incremental backup?', 'Full copies all data; incremental copies only the changes since the previous backup.'],
            ['F', 'What are binary logs useful for in backups?', 'Replaying changes after the last backup for point-in-time recovery.'],
            ['M', 'What is needed to restore from an incremental chain?', 'The base full backup plus all incrementals (or binlogs) in sequence.'],
            ['M', 'What are RPO and RTO?', 'RPO: how much data loss is acceptable (time). RTO: how long recovery may take.'],
            ['S', 'How do you achieve a near-zero RPO?', 'Continuous binlog archiving or synchronous replication to another node, plus regular full backups.'],
            ['S', 'How do you prove backups work?', 'Scheduled automated restores into an isolated environment with data validation and alerting.']],
        [['Full then incremental with XtraBackup.',
            r`xtrabackup --backup --target-dir=/b/full
xtrabackup --backup --target-dir=/b/inc1 --incremental-basedir=/b/full

-- OUTPUT:
-- completed OK!   (inc1 holds only changed pages)`],
            ['Archive binary logs.',
                r`mysqlbinlog --read-from-remote-server --host=db --raw --stop-never binlog.000042

-- OUTPUT:
-- (binlog files streamed to local disk continuously)`]],
        [['Weekly schedule (cron).',
            r`0 2 * * 0  /opt/backup/full.sh      # Sunday full
0 2 * * 1-6 /opt/backup/inc.sh      # Mon-Sat incremental

-- OUTPUT:
-- (backups created nightly, retained 30 days)`],
            ['Backup success monitoring.',
                r`SELECT MAX(finished_at) AS last_backup, TIMESTAMPDIFF(HOUR, MAX(finished_at), NOW()) AS hours_ago FROM backup_log WHERE status = 'OK';

-- OUTPUT:
-- last_backup         | hours_ago
-- 2026-05-01 02:14:00 |         9`]]
    ),

    'Point-in-Time Recovery': x(
        ['Point-in-time recovery (PITR) restores the database to a chosen moment, for example just before a bad DELETE.',
            'Method: restore the last full backup, then replay binary logs up to the target time or position.',
            'It requires binary logging to be enabled before the incident.'],
        ['Use <code>mysqlbinlog --start-position / --stop-position</code> or <code>--stop-datetime</code> and pipe into mysql.',
            'Find the bad statement by scanning binlogs; stop just before it.',
            'With GTIDs you can skip a specific transaction.'],
        ['Practice PITR in drills; incidents are stressful and mistakes are costly.',
            'Restore to a separate server first, verify, then extract and re-apply only the damaged tables if production kept running.',
            'Keep binlog retention longer than your backup interval and protect binlog files like backups.'],
        [['F', 'What is point-in-time recovery?', 'Restoring data to a specific moment using a backup plus binary logs.'],
            ['F', 'What must be enabled?', 'Binary logging.'],
            ['M', 'How do you replay binlogs?', '<code>mysqlbinlog binlog.000042 --stop-datetime="2026-05-01 10:14:00" | mysql -u root -p</code>'],
            ['M', 'How do you skip a destructive statement?', 'Stop at the position before it and continue from the position after it, or with GTID, set the gtid to be skipped.'],
            ['S', 'How do you recover one table without taking production down?', 'Restore the backup and binlogs to a side server to the right time, export the table, and import into production.'],
            ['S', 'What can break PITR?', 'Missing binlogs, expired retention, non-deterministic statements in statement format, or no tested procedure.']],
        [['Replay until just before the incident.',
            r`mysqlbinlog --start-position=1543 --stop-datetime="2026-05-01 10:14:00" binlog.000042 binlog.000043 | mysql -u root -p

-- OUTPUT:
-- (changes applied up to 10:14:00; the bad DELETE at 10:14:05 is not replayed)`],
            ['Find the offending statement.',
                r`mysqlbinlog --base64-output=DECODE-ROWS -vv binlog.000043 | grep -n "DELETE FROM orders"

-- OUTPUT:
-- 8841:### DELETE FROM shop.orders
-- (note the "at 9102" position just before it)`]],
        [['Recover into a side server and copy back one table.',
            r`mysqldump -u root -p recovered orders > orders_recovered.sql
mysql -u root -p shop < orders_recovered.sql

-- OUTPUT:
-- (orders table restored in production)`],
            ['Check binlog retention.',
                r`SHOW VARIABLES LIKE 'binlog_expire_logs_seconds';

-- OUTPUT:
-- Variable_name             | Value
-- binlog_expire_logs_seconds | 604800`]]
    ),

    'Binary Log Basics': x(
        ['The binary log (binlog) records every change to data (INSERT, UPDATE, DELETE, DDL) in order.',
            'It is used for replication and point-in-time recovery.',
            'Enable with <code>log_bin</code> (on by default in MySQL 8).'],
        ['List logs with <code>SHOW BINARY LOGS</code> and the current position with <code>SHOW BINARY LOG STATUS</code> (or SHOW MASTER STATUS in older versions).',
            'Files rotate by size (<code>max_binlog_size</code>) and expire by <code>binlog_expire_logs_seconds</code>.',
            'Read them with the <code>mysqlbinlog</code> tool.'],
        ['<code>sync_binlog=1</code> makes each commit durable in the binlog at a performance cost.',
            'Binlog disk space and I/O matter on write-heavy systems; monitor growth and retention.',
            'Never delete binlog files manually; use <code>PURGE BINARY LOGS</code> so replicas and indexes stay consistent.'],
        [['F', 'What is the binary log?', 'A log of all data changes in order, used for replication and recovery.'],
            ['F', 'How do you list binary logs?', '<code>SHOW BINARY LOGS;</code>'],
            ['M', 'What does sync_binlog=1 do?', 'Flushes the binlog to disk at every transaction commit for durability.'],
            ['M', 'How do you remove old binlogs safely?', '<code>PURGE BINARY LOGS BEFORE "date"</code> or set expiry retention.'],
            ['S', 'How do you size binlog retention?', 'Longest of: backup interval for PITR, replica downtime tolerance and audit needs, balanced against disk.'],
            ['S', 'Why not delete binlog files from the OS?', 'The index file and replicas would break; use PURGE so the server updates state correctly.']],
        [['Inspect binary logs.',
            r`SHOW BINARY LOGS;

-- OUTPUT: (example)
-- Log_name      | File_size
-- binlog.000041 | 157286400
-- binlog.000042 |  42115`],
            ['Peek at events.',
                r`SHOW BINLOG EVENTS IN 'binlog.000042' LIMIT 3;

-- OUTPUT: (example)
-- Pos | Event_type  | Info
-- 4   | Format_desc | Server ver: 8.0.36
-- 126 | Previous_gtids |
-- 157 | Query       | BEGIN`]],
        [['Set retention to 7 days.',
            r`SET PERSIST binlog_expire_logs_seconds = 604800;

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Purge old logs.',
                r`PURGE BINARY LOGS BEFORE '2026-04-24 00:00:00';

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Binlog Formats: Statement, Row & Mixed': x(
        ['The binlog format decides what is logged: STATEMENT logs the SQL text, ROW logs the changed rows, MIXED picks automatically.',
            'ROW is the default and safest in MySQL 8.',
            'Set with <code>binlog_format</code>.'],
        ['STATEMENT is small but unsafe for non-deterministic functions (NOW(), UUID(), RAND()) and some statements.',
            'ROW is exact and deterministic but produces larger logs for bulk changes.',
            'MIXED logs statements normally and rows for unsafe ones.'],
        ['ROW format is required for READ COMMITTED isolation safety, CDC tools (Debezium) and reliable replication.',
            '<code>binlog_row_image=MINIMAL</code> reduces size by logging only changed columns plus keys.',
            'Large updates/deletes inflate row logs; batch and monitor.'],
        [['F', 'Name the binlog formats.', 'STATEMENT, ROW and MIXED.'],
            ['F', 'Which is the default in MySQL 8?', 'ROW.'],
            ['M', 'Why is statement format risky?', 'Non-deterministic statements can produce different results on replicas.'],
            ['M', 'What is binlog_row_image?', 'Controls how much of each row is logged: FULL, MINIMAL or NOBLOB.'],
            ['S', 'Why do CDC tools need ROW format?', 'They need before/after row images, which statement logs do not contain.'],
            ['S', 'How do large deletes affect row format?', 'Every deleted row is logged, so a mass DELETE creates a huge binlog; batch the operation.']],
        [['Check and set format.',
            r`SELECT @@binlog_format, @@binlog_row_image;

-- OUTPUT:
-- @@binlog_format | @@binlog_row_image
-- ROW             | FULL`],
            ['Statement format hazard.',
                r`UPDATE orders SET created_at = NOW(), token = UUID() WHERE id = 1;

-- OUTPUT: (with STATEMENT format)
-- Warning 1287: Unsafe statement written to the binary log using statement format`]],
        [['Minimal row image.',
            r`SET PERSIST binlog_row_image = 'MINIMAL';

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['Read row events.',
                r`mysqlbinlog --base64-output=DECODE-ROWS -vv binlog.000042 | head -20

-- OUTPUT: (excerpt)
-- ### UPDATE shop.orders
-- ### WHERE @1=1 @2=7 @3=100.00
-- ### SET   @1=1 @2=7 @3=120.00`]]
    ),

    'Binlog for Replication & Recovery': x(
        ['Replicas copy the primary’s binary log events and apply them. For recovery, you replay binlog events after restoring a backup.',
            'So the binlog powers both high availability and PITR.',
            'The primary writes events; replicas read them through a network connection.'],
        ['Replication threads: the replica I/O (receiver) thread copies events to a relay log; the SQL (applier) thread executes them.',
            'Binlog position or GTID tells the replica where to continue.',
            'Keep binlogs long enough for a lagging or temporarily down replica to catch up.'],
        ['If a replica needs events that were purged, you must rebuild it from a backup.',
            'GTIDs make failover and recovery simpler by identifying transactions globally.',
            'For recovery, store binlogs off-host in near real time (mysqlbinlog --stop-never) so a lost primary does not lose its log.'],
        [['F', 'How does the binlog support replication?', 'Replicas read events from it and apply them to stay in sync.'],
            ['F', 'How does it support recovery?', 'Replaying events after restoring a backup brings data to a later point in time.'],
            ['M', 'What are the I/O and SQL threads?', 'I/O thread fetches events into the relay log; SQL thread applies them.'],
            ['M', 'What happens if the required binlog is purged?', 'The replica cannot continue and must be re-provisioned from a backup.'],
            ['S', 'How do you protect against losing binlogs when the primary dies?', 'Stream binlogs to remote storage continuously or use semi-sync/group replication.'],
            ['S', 'Why use GTIDs?', 'They identify each transaction uniquely, simplifying failover, replica rebuild and skipping/auditing transactions.']],
        [['Replica status.',
            r`SHOW REPLICA STATUS\G

-- OUTPUT: (excerpt)
-- Replica_IO_Running: Yes
-- Replica_SQL_Running: Yes
-- Seconds_Behind_Source: 0`],
            ['Primary status.',
                r`SHOW BINARY LOG STATUS;

-- OUTPUT:
-- File          | Position | Executed_Gtid_Set
-- binlog.000042 |     1543 | 3e11fa47-...:1-1850`]],
        [['Relay log files on the replica.',
            r`SHOW RELAY LOGS;

-- OUTPUT: (example)
-- Log_name           | File_size
-- relay-bin.000007   | 1048576`],
            ['Stream binlogs off-host.',
                r`mysqlbinlog --read-from-remote-server --host=primary --user=repl --raw --stop-never --result-file=/backup/binlogs/ binlog.000042

-- OUTPUT:
-- (new events appended to local files continuously)`]]
    ),

    'Source/Replica Architecture': x(
        ['In replication one server (source/primary) accepts writes and one or more replicas copy its changes.',
            'Replicas are read-only copies used for reads, reports and backups.',
            'Application writes go to the source; reads can go to replicas.'],
        ['Setup: enable binlog and server_id on source, create a replication user, point the replica at the source (<code>CHANGE REPLICATION SOURCE TO ...</code>) and start it.',
            'Replication is asynchronous by default: replicas may lag.',
            'Topologies: single replica, multiple replicas, chain (replica of replica), multi-source.'],
        ['Reading from replicas means handling stale reads: route read-your-writes traffic to the primary or use session tokens/GTID wait.',
            'Replicas can be a bottleneck if single-threaded apply; use multi-threaded replication (<code>replica_parallel_workers</code>).',
            'Consider semi-sync or Group Replication for stronger durability.'],
        [['F', 'What is source/replica replication?', 'A setup where changes on the source server are copied to one or more replica servers.'],
            ['F', 'Where should writes go?', 'To the source (primary) server.'],
            ['M', 'Why can a replica show old data?', 'Replication is asynchronous, so replicas can lag behind the source.'],
            ['M', 'How do you start a replica?', 'Run CHANGE REPLICATION SOURCE TO with host, user and position/GTID, then START REPLICA.'],
            ['S', 'How do you handle read-your-writes with replicas?', 'Read from the primary right after writes, use GTID-based wait (<code>WAIT_FOR_EXECUTED_GTID_SET</code>) or sticky sessions.'],
            ['S', 'How to speed up replica apply?', 'Multi-threaded replication with logical clock, indexes on replicas for row events and avoiding giant transactions.']],
        [['Configure the source.',
            r`-- my.cnf (source)
[mysqld]
server_id = 1
log_bin = binlog
gtid_mode = ON
enforce_gtid_consistency = ON

-- OUTPUT: (after restart)
-- SELECT @@server_id, @@gtid_mode;  =>  1 | ON`],
            ['Connect the replica.',
                r`CREATE USER 'repl'@'%' IDENTIFIED BY 'R3pl#Pass1';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
-- on the replica:
CHANGE REPLICATION SOURCE TO SOURCE_HOST='10.0.0.1', SOURCE_USER='repl', SOURCE_PASSWORD='R3pl#Pass1', SOURCE_AUTO_POSITION=1;
START REPLICA;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Verify.',
            r`SHOW REPLICA STATUS\G

-- OUTPUT: (excerpt)
-- Replica_IO_Running: Yes
-- Replica_SQL_Running: Yes
-- Last_Error:`],
            ['Read-only replica.',
                r`SET PERSIST super_read_only = ON;
INSERT INTO shop.orders (customer_id, total) VALUES (1, 1);

-- OUTPUT:
-- ERROR 1290 (HY000): The MySQL server is running with the --super-read-only option so it cannot execute this statement`]]
    ),

    'Asynchronous & Semi-Synchronous Replication': x(
        ['Asynchronous replication: the source commits without waiting for replicas. Semi-synchronous: the source waits until at least one replica has received the event.',
            'Async is fastest but a crash can lose recent commits that never reached a replica.',
            'Semi-sync reduces that loss at a small latency cost.'],
        ['Semi-sync setting: <code>rpl_semi_sync_source_enabled</code> and <code>rpl_semi_sync_source_wait_for_replica_count</code> (via plugins/components).',
            'If no replica acknowledges within a timeout, the source falls back to async.',
            'Received is not the same as applied: a replica can still lag in applying.'],
        ['For no data loss use Group Replication or InnoDB Cluster (consensus-based) or cloud-managed multi-AZ storage replication.',
            'Semi-sync with AFTER_SYNC (lossless) ensures committed data reached a replica before the client sees success.',
            'Measure latency impact between data centers; semi-sync across regions can be costly.'],
        [['F', 'Async vs semi-sync replication?', 'Async does not wait for replicas; semi-sync waits for at least one replica to acknowledge receipt.'],
            ['F', 'Which has potential data loss on primary crash?', 'Asynchronous replication.'],
            ['M', 'What happens if semi-sync times out?', 'It falls back to asynchronous replication.'],
            ['M', 'Does semi-sync guarantee the replica applied the transaction?', 'No, only that it received and logged it to its relay log.'],
            ['S', 'How do you achieve zero data loss?', 'Use Group Replication/InnoDB Cluster with majority commit, or semi-sync with careful failover automation and AFTER_SYNC.'],
            ['S', 'Trade-offs of semi-sync across regions?', 'Commit latency includes round trip time to the replica, which may be unacceptable; choose nearby replicas for acks.']],
        [['Enable semi-sync on the source.',
            r`INSTALL PLUGIN rpl_semi_sync_source SONAME 'semisync_source.so';
SET GLOBAL rpl_semi_sync_source_enabled = 1;
SET GLOBAL rpl_semi_sync_source_timeout = 1000;
SHOW STATUS LIKE 'Rpl_semi_sync_source_status';

-- OUTPUT:
-- Variable_name               | Value
-- Rpl_semi_sync_source_status | ON`],
            ['Enable on the replica.',
                r`INSTALL PLUGIN rpl_semi_sync_replica SONAME 'semisync_replica.so';
SET GLOBAL rpl_semi_sync_replica_enabled = 1;
STOP REPLICA IO_THREAD; START REPLICA IO_THREAD;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Check ack counters.',
            r`SHOW STATUS LIKE 'Rpl_semi_sync_source_yes_tx';

-- OUTPUT: (example)
-- Variable_name                | Value
-- Rpl_semi_sync_source_yes_tx  | 482113`],
            ['Fallback to async detected.',
                r`SHOW STATUS LIKE 'Rpl_semi_sync_source_status';

-- OUTPUT: (after timeout)
-- Rpl_semi_sync_source_status | OFF`]]
    ),

    'Replication Lag': x(
        ['Replication lag is the delay between a change on the source and its application on a replica.',
            'See it with <code>Seconds_Behind_Source</code> in <code>SHOW REPLICA STATUS</code>.',
            'Reads from a lagging replica show old data.'],
        ['Causes: big transactions, single-threaded apply, heavy replica load, slow disks, missing indexes for row-based updates, network issues.',
            'Mitigate with multi-threaded replication, smaller batches, indexes on replicas and better hardware.',
            'Seconds_Behind_Source can be misleading; use heartbeat tables for accurate lag.'],
        ['Design apps to tolerate lag: read-your-writes on primary, lag-aware routing (ProxySQL), circuit-break to the primary when lag is high.',
            'Alert on lag thresholds and trends, not only absolute values.',
            'Large DDL or bulk updates are classic lag sources; throttle them and use online schema tools that observe lag.'],
        [['F', 'What is replication lag?', 'The delay before changes on the source appear on the replica.'],
            ['F', 'Where do you see it?', 'In <code>SHOW REPLICA STATUS</code> as Seconds_Behind_Source.'],
            ['M', 'Common causes of lag?', 'Large transactions, single-threaded apply, load on the replica, I/O slowness and missing indexes.'],
            ['M', 'How do you speed up apply?', 'Enable parallel workers (<code>replica_parallel_workers</code>), use smaller transactions and add indexes.'],
            ['S', 'Why can Seconds_Behind_Source mislead?', 'It is based on event timestamps and can be zero during stalls or jump after idle periods; use a heartbeat table.'],
            ['S', 'How does an app cope with lag?', 'Route recent-write reads to the primary, use lag-aware proxies and avoid reading from replicas for critical consistency.']],
        [['Check lag.',
            r`SHOW REPLICA STATUS\G

-- OUTPUT: (excerpt)
-- Seconds_Behind_Source: 37
-- Replica_SQL_Running_State: Waiting for dependent transaction to commit`],
            ['Enable parallel apply.',
                r`SET GLOBAL replica_parallel_type = 'LOGICAL_CLOCK';
SET GLOBAL replica_parallel_workers = 8;
SET GLOBAL replica_preserve_commit_order = ON;
STOP REPLICA SQL_THREAD; START REPLICA SQL_THREAD;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Heartbeat lag measurement.',
            r`-- source: every second
REPLACE INTO ops.heartbeat (id, ts) VALUES (1, NOW(6));
-- replica:
SELECT TIMESTAMPDIFF(MICROSECOND, ts, NOW(6)) / 1000000 AS lag_seconds FROM ops.heartbeat WHERE id = 1;

-- OUTPUT:
-- lag_seconds
-- 0.84`],
            ['Per-worker apply status.',
                r`SELECT worker_id, last_applied_transaction, applying_transaction FROM performance_schema.replication_applier_status_by_worker;

-- OUTPUT: (example)
-- worker_id | last_applied_transaction | applying_transaction
-- 1         | 3e11...:1850             | 3e11...:1852`]]
    ),

    'Read Replicas & Failover': x(
        ['A read replica serves read-only queries to reduce load on the primary. Failover promotes a replica to primary when the primary fails.',
            'Reads can scale by adding replicas; writes still go to one primary.',
            'Failover can be manual or automatic.'],
        ['Routing: application-level read/write split, or a proxy such as ProxySQL / MySQL Router that sends writes to the primary and reads to replicas.',
            'Promotion steps: stop writes to the old primary, ensure the chosen replica has applied everything (GTID), make it writable, point others to it.',
            'Fence the old primary so it cannot accept writes.'],
        ['Split-brain (two writable primaries) is the worst failure; use fencing (STONITH), consensus (Group Replication/Orchestrator with Raft) and clear leader election.',
            'Test failover regularly; automatic failover without drills is risky.',
            'Account for data loss in async replication: transactions not yet replicated may be lost or need reconciliation.'],
        [['F', 'What is a read replica?', 'A copy of the database used for read-only queries to offload the primary.'],
            ['F', 'What is failover?', 'Switching to a standby server (promoting a replica) when the primary fails.'],
            ['M', 'How do apps use read replicas?', 'Through read/write splitting in code or via a proxy such as ProxySQL or MySQL Router.'],
            ['M', 'What is split-brain?', 'Two nodes both acting as the writable primary, causing divergent data.'],
            ['S', 'How do you promote a replica safely?', 'Fence the old primary, ensure the candidate applied all received transactions, set it writable, repoint other replicas and applications.'],
            ['S', 'How do you avoid data loss on failover?', 'Semi-sync/Group Replication for durability, or reconcile from the old primary’s binlog when it is recoverable.']],
        [['Promote a replica.',
            r`STOP REPLICA;
RESET REPLICA ALL;
SET GLOBAL super_read_only = OFF;
SET GLOBAL read_only = OFF;

-- OUTPUT:
-- Query OK, 0 rows affected   (this node is now writable)`],
            ['Wait for GTIDs before reading (read-your-writes).',
                r`SELECT WAIT_FOR_EXECUTED_GTID_SET('3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1850', 1) AS ok;

-- OUTPUT:
-- ok
-- 0     (0 = replica caught up within 1 second)`]],
        [['ProxySQL read/write rules.',
            r`INSERT INTO mysql_query_rules (rule_id, active, match_digest, destination_hostgroup, apply) VALUES (1, 1, '^SELECT', 20, 1);
INSERT INTO mysql_query_rules (rule_id, active, match_digest, destination_hostgroup, apply) VALUES (2, 1, '.*', 10, 1);

-- OUTPUT:
-- Query OK, 1 row affected   (hostgroup 10 = primary, 20 = replicas)`],
            ['Fence a failed primary.',
                r`SET PERSIST super_read_only = ON;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'GTID': x(
        ['A GTID (Global Transaction ID) uniquely identifies every transaction, written as <code>source_uuid:sequence</code>.',
            'With GTIDs a replica asks "give me everything I have not executed" instead of tracking file and position.',
            'Enable with <code>gtid_mode=ON</code> and <code>enforce_gtid_consistency=ON</code>.'],
        ['<code>SOURCE_AUTO_POSITION=1</code> lets replicas find their place automatically.',
            'Failover is simpler: a new primary and any replica agree on which transactions are applied.',
            'Skip a bad transaction by injecting an empty transaction with its GTID.'],
        ['Constraints: no CREATE TABLE ... SELECT in older versions, no mixing non-transactional engines in one transaction; enforce_gtid_consistency checks these.',
            'Compare <code>gtid_executed</code> sets to detect divergence or errant transactions on replicas.',
            'Backups should record the GTID set to rebuild replicas precisely.'],
        [['F', 'What is a GTID?', 'A unique identifier of a transaction across all servers in a replication topology.'],
            ['F', 'What is the benefit?', 'Simpler replica setup and failover without binlog file/position bookkeeping.'],
            ['M', 'What is SOURCE_AUTO_POSITION?', 'A replica setting to use GTIDs to determine where to start reading from the source.'],
            ['M', 'How do you skip a failing transaction with GTID?', 'Set <code>gtid_next</code> to that GTID, run an empty transaction, then set gtid_next back to AUTOMATIC.'],
            ['S', 'What is an errant transaction?', 'A transaction executed on a replica but not on the primary, which can break failover; detect by comparing GTID sets.'],
            ['S', 'How do you enable GTID on a running system?', 'Step through <code>gtid_mode</code> OFF_PERMISSIVE, ON_PERMISSIVE, ON while ensuring all servers progress together.']],
        [['See executed GTIDs.',
            r`SELECT @@gtid_executed;

-- OUTPUT:
-- @@gtid_executed
-- 3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1850`],
            ['Skip a transaction.',
                r`STOP REPLICA;
SET GTID_NEXT = '3e11fa47-71ca-11e1-9e33-c80aa9429562:1851';
BEGIN; COMMIT;
SET GTID_NEXT = 'AUTOMATIC';
START REPLICA;

-- OUTPUT:
-- Query OK, 0 rows affected`]],
        [['Detect errant transactions.',
            r`SELECT GTID_SUBTRACT(@@gtid_executed, '3e11fa47-71ca-11e1-9e33-c80aa9429562:1-1850') AS errant;

-- OUTPUT:
-- errant
-- 9a1b...:1-3     (executed here, not on the source)`],
            ['Replica using auto position.',
                r`CHANGE REPLICATION SOURCE TO SOURCE_AUTO_POSITION = 1;

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'Replication Monitoring': x(
        ['Monitor replication to know if replicas are running and how far behind they are.',
            'Check <code>SHOW REPLICA STATUS</code>: Replica_IO_Running, Replica_SQL_Running, Seconds_Behind_Source and Last_Error.',
            'Set alerts for stopped threads and growing lag.'],
        ['Performance Schema tables: <code>replication_connection_status</code>, <code>replication_applier_status</code>, <code>replication_applier_status_by_worker</code>.',
            'Track binlog and relay log disk usage and GTID gaps.',
            'Use dashboards (Prometheus mysqld_exporter, Percona PMM, CloudWatch).'],
        ['Alert on errors, lag, thread state, GTID divergence, and replica read-only flag changes.',
            'Automate safe responses: remove lagging replicas from the read pool and page for stopped replication.',
            'Test the monitoring by simulating failures regularly.'],
        [['F', 'How do you check replication health?', '<code>SHOW REPLICA STATUS\\G</code> and look at both thread states and lag.'],
            ['F', 'What are the key fields?', 'Replica_IO_Running, Replica_SQL_Running, Seconds_Behind_Source, Last_Error.'],
            ['M', 'Which tables show replication status in Performance Schema?', 'replication_connection_status and replication_applier_status tables.'],
            ['M', 'What should you alert on?', 'Stopped threads, errors, lag above a threshold, and large GTID differences.'],
            ['S', 'How do you detect silent divergence?', 'Run checksum tools (pt-table-checksum) periodically and compare GTID sets.'],
            ['S', 'How do you make read pools safe?', 'Remove replicas from rotation automatically when lag or errors exceed thresholds, and add them back when healthy.']],
        [['Quick health query.',
            r`SELECT channel_name, service_state, last_error_message FROM performance_schema.replication_applier_status_by_coordinator;

-- OUTPUT: (example)
-- channel_name | service_state | last_error_message
--              | ON            |`],
            ['Connection details.',
                r`SELECT source_uuid, service_state, last_heartbeat_timestamp FROM performance_schema.replication_connection_status;

-- OUTPUT: (example)
-- source_uuid | service_state | last_heartbeat_timestamp
-- 3e11fa47... | ON            | 2026-05-01 10:00:00`]],
        [['Detect divergence.',
            r`pt-table-checksum --host=primary --user=chk --password=*** --databases=shop

-- OUTPUT: (example)
-- TS ERRORS DIFFS ROWS CHUNKS SKIPPED TIME TABLE
-- 05-01 0 0 120450 12 0 4.2 shop.orders`],
            ['Prometheus alert rule.',
                r`- alert: MySQLReplicaLagHigh
  expr: mysql_slave_status_seconds_behind_master > 30
  for: 5m

-- OUTPUT:
-- Alert fires when lag stays above 30 s for 5 minutes`]]
    )
};
