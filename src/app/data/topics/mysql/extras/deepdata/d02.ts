// Deep dive, modules 2-3 (Installation & Environment, SQL Basics).
import { dv, type Deep } from '../deep';
import { r } from '../extra';

export const d02: Record<string, Deep> = {
    'Installing MySQL': dv(
        [`An installation creates three things: the program files (<code>mysqld</code>, client tools), a data directory initialised with system tables, and a service that starts the server. First start runs <code>mysqld --initialize</code>, which generates the root account and records a temporary password in the error log.`,
            r`# Linux package install and first start
sudo apt install mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
mysql --version

-- OUTPUT:
-- mysql  Ver 8.0.36 for Linux on x86_64 (MySQL Community Server - GPL)`],
        [`Choose the install method by purpose: OS package for servers, MSI installer for Windows desktops, Docker for development and CI, a managed service (RDS, Cloud SQL) for production. Docker gives a disposable, version-pinned instance with a named volume for data.`,
            r`docker run -d --name mysql-dev -p 3306:3306 -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=shop -v mysqldata:/var/lib/mysql mysql:8.0
docker logs mysql-dev --tail 2
docker exec -it mysql-dev mysql -uroot -psecret -e "SELECT VERSION()"

-- OUTPUT:
-- [Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.36'  port: 3306
-- VERSION()
-- 8.0.36`],
        [`Mistakes: installing without a volume (data disappears with the container), exposing port 3306 to the internet, leaving the default empty or well-known root password, and mixing client and server major versions. Bind to localhost or a private network and set a strong password at once.`,
            r`# bad: public port, weak password, no volume
docker run -d -p 0.0.0.0:3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0
# good: loopback only, strong secret from env, persistent volume
docker run -d -p 127.0.0.1:3306:3306 -e MYSQL_ROOT_PASSWORD="$DB_ROOT_PW" -v mysqldata:/var/lib/mysql mysql:8.0

-- OUTPUT:
-- (the second container is reachable only from the same host and keeps its data across restarts)`],
        [`Performance starts at install time: use a filesystem and storage suited to databases (SSD/NVMe, XFS or ext4), disable swap pressure, and set the buffer pool before loading data. A small <code>my.cnf</code> written at install avoids a restart later.`,
            r`# /etc/mysql/conf.d/tuning.cnf
[mysqld]
innodb_buffer_pool_size = 4G
innodb_flush_method = O_DIRECT
max_connections = 200
character-set-server = utf8mb4

-- OUTPUT: (after restart)
-- SELECT @@innodb_buffer_pool_size / 1024 / 1024 / 1024;   =>  4.0000`],
        [`Real-world: a repeatable developer environment. A compose file pins the version, loads an init script and keeps data in a volume so every teammate gets the same database in one command.`,
            r`# docker-compose.yml
services:
  db:
    image: mysql:8.0.36
    environment: { MYSQL_ROOT_PASSWORD: secret, MYSQL_DATABASE: shop }
    ports: ["3306:3306"]
    volumes: [dbdata:/var/lib/mysql, ./init:/docker-entrypoint-initdb.d]
volumes: { dbdata: {} }

-- OUTPUT:
-- docker compose up -d  =>  db  Started   (scripts in ./init run on first start)`]
    ),

    'MySQL Server & Client': dv(
        [`The server listens for connections and creates one thread per client. During connection the handshake negotiates protocol, TLS and an authentication plugin; after success the client sends commands and the server replies with result sets or OK/ERROR packets. The client is just a program that speaks this protocol.`,
            r`-- see your own connection from the server's point of view
SELECT CONNECTION_ID() AS id, USER() AS client_user, CURRENT_USER() AS server_account, @@hostname AS server_host;
SHOW SESSION STATUS LIKE 'Ssl_version';

-- OUTPUT: (example)
-- id | client_user    | server_account | server_host
-- 12 | root@localhost | root@localhost | db1
-- Ssl_version | TLSv1.3`],
        [`Clients connect over TCP, a Unix socket or a Windows named pipe, with options for host, port, user, database and TLS. Option files (<code>~/.my.cnf</code>) keep credentials out of command lines.`,
            r`mysql -h 127.0.0.1 -P 3306 -u shop_app -p shop
mysql --protocol=SOCKET -u root -p
mysql --defaults-file=~/.my.cnf -e "SELECT 1"
mysql --ssl-mode=VERIFY_IDENTITY --ssl-ca=/etc/ssl/ca.pem -h db.internal -u shop_app -p

-- OUTPUT:
-- mysql>   (interactive prompt) or 1 for the -e form`],
        [`Mistakes: using <code>localhost</code> vs <code>127.0.0.1</code> interchangeably (localhost uses a socket, 127.0.0.1 uses TCP and matches different grants), and leaving idle connections open so the server runs out of connections.`,
            r`-- an account created for 'user'@'127.0.0.1' will not match a socket connection from 'localhost'
CREATE USER 'app'@'127.0.0.1' IDENTIFIED BY 'x';
-- mysql -u app -p            (connects via socket as app@localhost)

-- OUTPUT:
-- ERROR 1045 (28000): Access denied for user 'app'@'localhost' (using password: YES)`],
        [`Every connection costs a thread and memory. Watch the ratio of connected to running threads, and use pooling so many app requests share a few connections.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Threads_connected','Threads_running','Max_used_connections');
SELECT @@max_connections AS max_connections;

-- OUTPUT: (example)
-- Threads_connected    | 118
-- Threads_running      |   6
-- Max_used_connections | 143
-- max_connections | 300`],
        [`Real-world: find the sessions that are hogging the server and the clients they come from, then decide whether to fix the app or kill the session.`,
            r`SELECT id, user, host, db, command, time, LEFT(info, 60) AS query FROM information_schema.processlist WHERE command <> 'Sleep' ORDER BY time DESC LIMIT 3;
KILL QUERY 31;

-- OUTPUT: (example)
-- id | user     | host         | db   | command | time | query
-- 31 | report   | 10.0.2.8:5521| shop | Query   |  412 | SELECT ... FROM orders ...
-- Query OK, 0 rows affected`]
    ),

    'MySQL Workbench': dv(
        [`Workbench is a client that wraps the same protocol in a GUI: the SQL editor sends statements, the schema tree runs catalog queries, and the EER diagram tool reads or writes DDL. Everything it does can be reproduced in SQL, which is what you should commit to version control.`,
            r`-- what Workbench runs when you right-click "Select Rows - Limit 1000"
SELECT * FROM shop.orders LIMIT 0, 1000;

-- what the schema tree runs to list tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'shop' ORDER BY table_name;

-- OUTPUT:
-- (grid of rows in the result pane)`],
        [`Useful features: forward/reverse engineering of EER diagrams, Visual Explain for plans, the Performance Dashboard, and data export wizards. Connection settings (SSL, SSH tunnel) live in the connection profile.`,
            r`-- Visual Explain is a graphical form of this
EXPLAIN FORMAT=JSON SELECT c.name, COUNT(*) FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id\G

-- Workbench reverse engineering produces this style of script
SHOW CREATE TABLE orders;

-- OUTPUT:
-- {"query_block": {"select_id": 1, "cost_info": {"query_cost": "412.50"}, "grouping_operation": {...}}}`],
        [`Mistakes: leaving safe-updates on and then bypassing it blindly, running a destructive statement against production because the connection tab looks like development, and editing schema in the GUI without saving a script.`,
            r`-- safe-updates protects you:
UPDATE orders SET status = 'X';

-- OUTPUT:
-- Error Code: 1175. You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column.

-- the right response is a precise statement, not disabling the guard
UPDATE orders SET status = 'X' WHERE id = 42;`],
        [`Workbench helps tune queries: compare the plan before and after adding an index, and read the "Rows examined" and "Duration" in the output panel. Use it to learn, then automate checks in CI.`,
            r`EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 7;
CREATE INDEX idx_orders_customer ON orders (customer_id);
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 7;

-- OUTPUT: (example)
-- before: -> Table scan on orders (actual time=0.1..210 rows=500000)
-- after : -> Index lookup on orders using idx_orders_customer (actual time=0.03..0.2 rows=40)`],
        [`Real-world: use colour-coded connections (red for production), read-only accounts for investigation, and export the final change as a script for the migration tool rather than applying it from the GUI.`,
            r`-- read-only investigation account
CREATE USER 'readonly'@'%' IDENTIFIED BY 'R0#only9';
GRANT SELECT, SHOW VIEW ON shop.* TO 'readonly'@'%';
SHOW GRANTS FOR 'readonly'@'%';

-- OUTPUT:
-- GRANT SELECT, SHOW VIEW ON shop.* TO readonly@%`]
    ),

    'MySQL Shell': dv(
        [`MySQL Shell connects through the classic protocol (3306) or the X protocol (33060) and offers three languages in one session: SQL, JavaScript and Python. Its admin API (<code>dba</code>) drives InnoDB Cluster, and its utilities (<code>util</code>) provide parallel dump and load.`,
            r`mysqlsh root@localhost:3306
\sql
SELECT @@version;
\js
shell.status()
\py
session.run_sql("SELECT 1+1").fetch_one()

-- OUTPUT:
-- 8.0.36
-- MySQL Shell version 8.0.36 ... Connection Id: 14, Current schema: ...
-- [2]`],
        [`Dump and load utilities are multi-threaded and chunk large tables, which makes them far faster than mysqldump for big data. Options include thread count, compression, filters and dry-run checks.`,
            r`util.dumpInstance('/backup/full', {threads: 8, compression: 'zstd', excludeSchemas: ['sandbox']})
util.dumpSchemas(['shop'], '/backup/shop', {threads: 4, dryRun: true})
util.loadDump('/backup/full', {threads: 8, ignoreVersion: false})

-- OUTPUT:
-- Duration: 00:01:12s  Schemas dumped: 4  Tables dumped: 61  Data size: 38.2 GB (compressed 6.1 GB)`],
        [`Mistakes: loading a dump into a server with a different <code>sql_mode</code> or charset, forgetting that loadDump needs <code>local_infile</code>, and running a dump on the primary during peak time. Use a replica or a quiet window and run the compatibility check first.`,
            r`util.checkForServerUpgrade('root@old-db:3306', {targetVersion: '8.4.0'})
-- on the target before loading:
SET GLOBAL local_infile = ON;

-- OUTPUT:
-- The MySQL server at old-db:3306 ... 0 errors, 2 warnings (deprecated syntax found in 2 views)`],
        [`Because dumps run in parallel, tune threads to the number of cores and the storage speed; more threads than disks can slow things down. Compare timing between mysqldump and the shell utility on the same data.`,
            r`-- 100 GB database, same host
-- mysqldump | gzip   : 3 h 20 min dump,  9 h restore
-- util.dumpInstance  : 22 min dump,       41 min restore (8 threads, zstd)

SELECT ROUND(100 * 1024 / (41 * 60), 1) AS restore_mb_per_s;

-- OUTPUT:
-- restore_mb_per_s
-- 41.6`],
        [`Real-world: a cluster in three commands, and a status check you can put in a monitoring script.`,
            r`dba.configureInstance('root@db1:3306')
var cluster = dba.createCluster('prod')
cluster.addInstance('root@db2:3306')
print(cluster.status({extended: 0}).defaultReplicaSet.status)

-- OUTPUT:
-- OK_NO_TOLERANCE      (becomes OK after adding a third instance)`]
    ),

    'Connecting to MySQL & Basic CLI Commands': dv(
        [`The CLI reads your input, splits it at the delimiter (<code>;</code> by default), sends each statement, and prints results. Lines starting with a backslash are client commands, not SQL, so they are handled locally (<code>\\G</code>, <code>\\s</code>, <code>\\u</code>).`,
            r`mysql -u root -p
mysql> STATUS;
mysql> USE shop;
mysql> SELECT DATABASE(), USER(), @@port;

-- OUTPUT:
-- Connection id: 15   Current database: shop   Connection: localhost via TCP/IP   Server version: 8.0.36
-- DATABASE() | USER()        | @@port
-- shop       | root@localhost | 3306`],
        [`Common patterns: run one statement (<code>-e</code>), run a script file (<code>&lt;</code> or <code>SOURCE</code>), print vertically (<code>\\G</code>), page output, and write results to a file with <code>tee</code>.`,
            r`mysql -u root -p -e "SELECT COUNT(*) FROM shop.orders"
mysql -u root -p shop < seed.sql
mysql -u root -p -N -B -e "SELECT id, name FROM shop.customers" > customers.tsv
mysql> pager less -S;
mysql> tee session.log;

-- OUTPUT:
-- COUNT(*)
-- 120450        (and customers.tsv contains tab-separated rows without headers)`],
        [`Mistakes: typing the password on the command line (visible in history), forgetting the semicolon (prompt changes to <code>-&gt;</code>), and pasting a script that includes DELIMITER changes. Use <code>mysql_config_editor</code> to store credentials safely.`,
            r`mysql_config_editor set --login-path=shop --host=db.internal --user=shop_app --password
mysql --login-path=shop -e "SELECT 1"

-- OUTPUT:
-- 1          (no password appears on the command line or in shell history)`],
        [`For large outputs avoid buffering everything: <code>--quick</code> streams rows, and <code>-B</code> batch mode plus <code>-N</code> removes formatting overhead.`,
            r`mysql --quick -B -N -e "SELECT * FROM shop.events" | gzip > events.tsv.gz

-- OUTPUT:
-- events.tsv.gz  (streamed, constant client memory)`],
        [`Real-world: a repeatable smoke test used after each deployment: connect with the application login, check version, row counts and replication state.`,
            r`mysql --login-path=shop -e "
SELECT @@version AS version, @@read_only AS read_only;
SELECT COUNT(*) AS orders FROM shop.orders;
SHOW REPLICA STATUS\G" | head -20

-- OUTPUT:
-- version | read_only
-- 8.0.36  | 0
-- orders
-- 612044`]
    ),

    'Creating Users': dv(
        [`An account row lives in <code>mysql.user</code> as user + host, with an authentication plugin and credential. At login the server picks the most specific matching host entry, then checks the password; grants (global, schema, table, column, routine) are evaluated per statement.`,
            r`CREATE USER 'app'@'10.0.1.%' IDENTIFIED BY 'Str0ng#Pass1';
SELECT user, host, plugin, account_locked, password_expired FROM mysql.user WHERE user = 'app';

-- OUTPUT:
-- user | host     | plugin                | account_locked | password_expired
-- app  | 10.0.1.% | caching_sha2_password | N              | N`],
        [`Options: authentication plugins, password policy, resource limits, TLS requirements, default roles. Account locking disables login but keeps grants.`,
            r`CREATE USER 'svc_report'@'%' IDENTIFIED WITH caching_sha2_password BY 'Rep0rt#Pass'
  REQUIRE SSL PASSWORD EXPIRE INTERVAL 90 DAY WITH MAX_QUERIES_PER_HOUR 5000 MAX_USER_CONNECTIONS 10;
ALTER USER 'svc_report'@'%' ACCOUNT LOCK;
ALTER USER 'svc_report'@'%' ACCOUNT UNLOCK;

-- OUTPUT:
-- Query OK, 0 rows affected (x3)`],
        [`Mistakes: creating '%' hosts for everything, granting ALL, sharing one account across services, and forgetting that <code>'user'@'localhost'</code> and <code>'user'@'%'</code> are separate accounts with separate passwords.`,
            r`SELECT user, host FROM mysql.user WHERE user = 'app';
-- connecting from 10.0.1.5 with a typo in the host pattern:
-- ERROR 1045 (28000): Access denied for user 'app'@'10.0.2.5' (using password: YES)

-- OUTPUT:
-- user | host
-- app  | 10.0.1.%        (no match for 10.0.2.5)`],
        [`Too many unused accounts is also a performance and security cost (the grant tables are cached). List accounts and last-use through the Performance Schema and remove stale ones.`,
            r`SELECT user, host FROM mysql.user WHERE user NOT IN ('mysql.sys','mysql.session','mysql.infoschema','root') ORDER BY user;
SELECT user, host, total_connections, current_connections FROM performance_schema.accounts WHERE user = 'app';

-- OUTPUT:
-- user | host     | total_connections | current_connections
-- app  | 10.0.1.% |            204411 |                  12`],
        [`Real-world account set for one application: runtime, migration and read-only reporting users, each tightly scoped.`,
            r`CREATE USER 'orders_app'@'10.0.1.%' IDENTIFIED BY 'A#pp-Secret1';
CREATE USER 'orders_migrate'@'10.0.9.5' IDENTIFIED BY 'M#ig-Secret1';
CREATE USER 'orders_ro'@'10.0.3.%' IDENTIFIED BY 'R#o-Secret1';
GRANT SELECT, INSERT, UPDATE, DELETE ON orders.* TO 'orders_app'@'10.0.1.%';
GRANT ALL ON orders.* TO 'orders_migrate'@'10.0.9.5';
GRANT SELECT ON orders.* TO 'orders_ro'@'10.0.3.%';

-- OUTPUT:
-- Query OK, 0 rows affected (x6)`]
    ),

    'MySQL Configuration & Data Directory': dv(
        [`At startup mysqld merges option files in a fixed order (global, then user, then command line); later sources override earlier ones. The data directory holds one folder per schema, <code>.ibd</code> tablespace files, redo logs, undo tablespaces, the binary logs and the system tablespace.`,
            r`mysqld --verbose --help | grep -A1 "Default options"
SHOW VARIABLES WHERE Variable_name IN ('datadir','innodb_data_home_dir','log_bin_basename','log_error');

-- OUTPUT: (example)
-- Default options are read from the following files in the given order: /etc/my.cnf /etc/mysql/my.cnf ~/.my.cnf
-- datadir          | /var/lib/mysql/
-- log_bin_basename | /var/lib/mysql/binlog
-- log_error        | /var/log/mysql/error.log`],
        [`Variables have scopes: GLOBAL, SESSION and PERSIST. Dynamic variables change at runtime; static ones need a restart. <code>SET PERSIST</code> writes <code>mysqld-auto.cnf</code>, which survives restarts without editing the main file.`,
            r`SET PERSIST max_connections = 400;
SET PERSIST_ONLY innodb_buffer_pool_instances = 8;      -- static: takes effect after restart
RESET PERSIST max_connections;
SELECT variable_name, variable_source, set_by_user FROM performance_schema.variables_info WHERE variable_name = 'max_connections';

-- OUTPUT:
-- variable_name   | variable_source | set_by_user
-- max_connections | COMPILED        | NULL`],
        [`Mistakes: editing the wrong file (an earlier file is overridden by a later one), changing a static variable and expecting immediate effect, and placing the data directory on the root disk that fills up. Find the effective source of any setting.`,
            r`SELECT variable_name, variable_source, variable_path FROM performance_schema.variables_info WHERE variable_name IN ('innodb_buffer_pool_size','max_connections');

-- OUTPUT:
-- variable_name           | variable_source | variable_path
-- innodb_buffer_pool_size | CONFIG          | /etc/mysql/conf.d/tuning.cnf
-- max_connections         | PERSISTED       | /var/lib/mysql/mysqld-auto.cnf`],
        [`Put data, redo/undo logs and binary logs on fast, separate, monitored volumes, and watch free space. A full disk stops writes immediately.`,
            r`SELECT table_schema, ROUND(SUM(data_length + index_length)/1073741824, 2) AS gb FROM information_schema.tables GROUP BY table_schema ORDER BY gb DESC LIMIT 3;
-- shell: df -h /var/lib/mysql

-- OUTPUT: (example)
-- table_schema | gb
-- shop         | 184.30
-- analytics    |  96.12
-- /dev/nvme1n1  500G  312G  188G  63% /var/lib/mysql`],
        [`Real-world: keep config in version control and apply it with automation, with a health check that confirms the running values match the intended ones after each change.`,
            r`# conf.d/90-prod.cnf (managed by Ansible)
[mysqld]
innodb_buffer_pool_size = 24G
innodb_redo_log_capacity = 8G
slow_query_log = ON
long_query_time = 0.5
binlog_expire_logs_seconds = 604800

-- OUTPUT: (post-deploy check)
-- SELECT @@innodb_buffer_pool_size/1073741824 AS bp_gb, @@slow_query_log, @@long_query_time;  =>  24 | 1 | 0.5`]
    ),

    'Starting & Stopping the MySQL Service': dv(
        [`On start mysqld reads config, opens the data directory, runs InnoDB crash recovery if the last shutdown was unclean (replaying redo and rolling back uncommitted work), then accepts connections. On a clean shutdown it flushes dirty pages and writes a checkpoint, so the next start is quick.`,
            r`sudo systemctl stop mysql
sudo systemctl start mysql
sudo journalctl -u mysql --since "5 minutes ago" | tail -5

-- OUTPUT: (example log lines)
-- [InnoDB] Starting crash recovery from checkpoint LSN=118234567     (only after an unclean stop)
-- [InnoDB] Apply batch completed
-- [Server] /usr/sbin/mysqld: ready for connections.`],
        [`Ways to control it: the service manager, <code>SHUTDOWN</code> from SQL, <code>mysqladmin shutdown</code>, and <code>RESTART</code> (8.0.4+). Windows uses <code>net start/stop</code> or the Services console.`,
            r`mysqladmin -u root -p shutdown
net stop MySQL80 & net start MySQL80
-- from SQL (needs the SHUTDOWN privilege):
RESTART;
SHUTDOWN;

-- OUTPUT:
-- Query OK, 0 rows affected   (server restarts; client reconnects automatically on the next statement)`],
        [`Mistakes: killing mysqld with <code>kill -9</code> (forces crash recovery and risks long startup), restarting during a long transaction rollback, and forgetting that a restart empties the buffer pool cache.`,
            r`-- before a planned restart: look for long transactions and pending work
SELECT trx_id, trx_started, trx_rows_modified FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 3;
SET GLOBAL innodb_fast_shutdown = 1;
SET GLOBAL innodb_buffer_pool_dump_at_shutdown = ON;

-- OUTPUT:
-- (no old transactions: safe to restart)`],
        [`Warm up faster after restart by dumping and reloading the buffer pool content. Without it, queries are slow until the hot pages are read from disk again.`,
            r`SET GLOBAL innodb_buffer_pool_dump_at_shutdown = ON;
SET GLOBAL innodb_buffer_pool_load_at_startup = ON;
SHOW STATUS LIKE 'Innodb_buffer_pool_load_status';

-- OUTPUT:
-- Variable_name                 | Value
-- Innodb_buffer_pool_load_status| Buffer pool(s) load completed at 260501 10:00:42`],
        [`Real-world rolling restart in a replicated setup: restart replicas first, switch over the primary, then restart the old primary, so the application sees only a short blip.`,
            r`-- 1. for each replica: STOP REPLICA; (restart server); START REPLICA; check lag = 0
-- 2. planned switchover with MySQL Shell
var c = dba.getCluster('prod'); c.setPrimaryInstance('db2:3306');
-- 3. restart the old primary db1, it rejoins as a secondary

-- OUTPUT:
-- Primary switched to db2:3306 in 4 seconds`]
    ),

    'Database Operations: CREATE, SHOW, USE & DROP': dv(
        [`A schema is a directory under the data directory plus a row in the data dictionary. <code>CREATE DATABASE</code> adds both and stores default charset and collation; <code>DROP DATABASE</code> deletes every table file inside it and cannot be rolled back.`,
            r`CREATE DATABASE IF NOT EXISTS inventory DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SHOW CREATE DATABASE inventory;
SHOW DATABASES LIKE 'inv%';

-- OUTPUT:
-- Database  | Create Database
-- inventory | CREATE DATABASE inventory /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */`],
        [`Variants: IF NOT EXISTS / IF EXISTS, charset/collation, encryption default, and ALTER DATABASE to change defaults (existing tables keep their own settings).`,
            r`ALTER DATABASE inventory DEFAULT COLLATE utf8mb4_unicode_ci;
CREATE DATABASE secure_db DEFAULT ENCRYPTION = 'Y';
USE inventory;
SELECT DATABASE();

-- OUTPUT:
-- DATABASE()
-- inventory`],
        [`Mistakes: forgetting USE and creating tables in the wrong schema, DROP DATABASE on the wrong connection, and case-sensitivity differences between Linux (case sensitive) and Windows (insensitive) names.`,
            r`SELECT DATABASE();                        -- always check before DDL/DML
DROP DATABASE shop;                         -- no confirmation, no undo

-- safer habit: rename tables to _old first, drop later, and keep a verified backup
RENAME TABLE shop.orders TO shop.orders_old_20260501;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Dropping a database with many large tables can stall the server while files are removed. Drop big tables one at a time in a quiet window, then the empty schema.`,
            r`SELECT table_name, ROUND((data_length+index_length)/1073741824,1) AS gb FROM information_schema.tables WHERE table_schema = 'old_archive' ORDER BY gb DESC;
DROP TABLE old_archive.events_2019;
DROP DATABASE old_archive;

-- OUTPUT:
-- table_name  | gb
-- events_2019 | 42.0`],
        [`Real-world: per-environment databases created by an idempotent script, with a guard that refuses to drop anything unless the environment flag allows it.`,
            r`DROP DATABASE IF EXISTS shop_test;           -- only run in CI, never in production
CREATE DATABASE shop_test DEFAULT CHARACTER SET utf8mb4;
CREATE USER IF NOT EXISTS 'ci'@'%' IDENTIFIED BY 'ci-secret';
GRANT ALL ON shop_test.* TO 'ci'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected (x4)`]
    ),

    'Table Operations: CREATE, SHOW & DESCRIBE': dv(
        [`CREATE TABLE writes a definition into the data dictionary and creates an <code>.ibd</code> tablespace file (file-per-table). The primary key defines the clustered index; secondary indexes are separate B-trees that carry the primary key.`,
            r`CREATE TABLE employees (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(60) NOT NULL,
  dept_id INT NOT NULL,
  salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_dept (dept_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
DESCRIBE employees;

-- OUTPUT:
-- Field   | Type            | Null | Key | Default           | Extra
-- id      | bigint unsigned | NO   | PRI | NULL              | auto_increment
-- name    | varchar(60)     | NO   |     | NULL              |
-- dept_id | int             | NO   | MUL | NULL              |`],
        [`Ways to create tables: from scratch, <code>LIKE</code> (copies structure and indexes), <code>AS SELECT</code> (copies data, not indexes), and <code>TEMPORARY</code>. SHOW commands inspect them.`,
            r`CREATE TABLE employees_copy LIKE employees;
CREATE TABLE high_paid AS SELECT * FROM employees WHERE salary > 100000;
CREATE TEMPORARY TABLE scratch (id INT);
SHOW TABLES LIKE 'emp%';
SHOW TABLE STATUS LIKE 'employees'\G
SHOW CREATE TABLE employees\G

-- OUTPUT:
-- Tables_in_shop (emp%)
-- employees
-- employees_copy`],
        [`Mistakes: no primary key, oversized types, no NOT NULL, using reserved words as names, and creating a table AS SELECT then forgetting it has no keys or indexes.`,
            r`CREATE TABLE copy_bad AS SELECT * FROM employees;
SHOW INDEX FROM copy_bad;
-- Fix: add what was lost
ALTER TABLE copy_bad ADD PRIMARY KEY (id), ADD KEY idx_dept (dept_id);

-- OUTPUT:
-- Empty set      (CREATE TABLE ... AS SELECT copied no indexes)`],
        [`Choose types for the long run: an INT id overflows at about 2.1 billion, and a wide VARCHAR(255) in every row costs cache. Check growth against the type limit.`,
            r`SELECT auto_increment, ROUND(auto_increment / 4294967295 * 100, 2) AS pct_of_unsigned_int
FROM information_schema.tables WHERE table_schema = 'shop' AND table_name = 'orders';

-- OUTPUT: (example)
-- auto_increment | pct_of_unsigned_int
--      912004113 | 21.23`],
        [`Real-world: a table template with audit columns, soft delete and optimistic locking, applied to new tables so every table behaves the same.`,
            r`CREATE TABLE invoices (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  version INT NOT NULL DEFAULT 0,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  deleted_at DATETIME(3) NULL,
  KEY idx_customer (customer_id, created_at)
);

-- OUTPUT:
-- Query OK, 0 rows affected`]
    ),

    'ALTER TABLE': dv(
        [`ALTER TABLE chooses an algorithm: INSTANT (metadata only), INPLACE (rebuilds in place, allows concurrent DML) or COPY (builds a new table and blocks writes). The operation and the version decide which is possible; adding a trailing column is usually INSTANT in 8.0.`,
            r`ALTER TABLE employees ADD COLUMN phone VARCHAR(20) NULL, ALGORITHM=INSTANT;
ALTER TABLE employees ADD INDEX idx_name (name), ALGORITHM=INPLACE, LOCK=NONE;
ALTER TABLE employees MODIFY salary DECIMAL(12,2) NOT NULL, ALGORITHM=COPY;

-- OUTPUT:
-- Query OK, 0 rows affected (0.02 sec)      (instant)
-- Query OK, 0 rows affected (3.4 sec)       (inplace, writes allowed)
-- Query OK, 120450 rows affected (8.1 sec)  (copy, writes blocked)`],
        [`Common forms: add/drop/modify/rename columns, add/drop indexes and constraints, change engine, rename table, and add partitions. Several changes can be combined in one statement so the table is rebuilt only once.`,
            r`ALTER TABLE employees
  ADD COLUMN email VARCHAR(100) AFTER name,
  ADD UNIQUE KEY uq_email (email),
  RENAME COLUMN dept_id TO department_id,
  DROP COLUMN phone;
SHOW CREATE TABLE employees\G

-- OUTPUT:
-- (one table rebuild applies all four changes)`],
        [`Mistakes: running a COPY alter on a huge production table at peak, adding NOT NULL without a default to a populated table, and dropping a column that old application versions still read. Ask the server to fail instead of blocking.`,
            r`ALTER TABLE employees ADD COLUMN grade TINYINT NOT NULL, ALGORITHM=INSTANT;
ALTER TABLE employees MODIFY name VARCHAR(10), ALGORITHM=INPLACE, LOCK=NONE;

-- OUTPUT:
-- ERROR 1364 (HY000): Field 'grade' doesn't have a default value           (existing rows need a default)
-- ERROR 1846 (0A000): ALGORITHM=INPLACE is not supported. Reason: ... Try ALGORITHM=COPY.`],
        [`Monitor long alters and their replica impact. Online DDL runs concurrently with writes but replicas apply it serially, so lag can spike; use gh-ost or pt-online-schema-change with throttling on big tables.`,
            r`SELECT event_name, work_completed, work_estimated FROM performance_schema.events_stages_current WHERE event_name LIKE 'stage/innodb/alter%';
SHOW REPLICA STATUS\G

-- OUTPUT: (example)
-- event_name                          | work_completed | work_estimated
-- stage/innodb/alter table (read PK)  |        4120000 |       12000000`],
        [`Real-world expand/contract rename: never rename a column in place while old code runs. Add the new column, write both, backfill, switch reads, then drop the old column in a later release.`,
            r`ALTER TABLE users ADD COLUMN full_name VARCHAR(120) NULL, ALGORITHM=INSTANT;
UPDATE users SET full_name = name WHERE full_name IS NULL AND id BETWEEN 1 AND 10000;   -- batched backfill
-- release N+1: application reads full_name
ALTER TABLE users DROP COLUMN name;                                                     -- release N+2

-- OUTPUT:
-- Query OK, 10000 rows affected`]
    ),

    'DROP, TRUNCATE & RENAME': dv(
        [`DROP removes the table definition and its tablespace file. TRUNCATE is DDL: it drops and recreates the table (resetting AUTO_INCREMENT) instead of deleting rows one by one, so it is fast, takes a metadata lock and cannot be rolled back. DELETE writes undo and redo for every row.`,
            r`CREATE TABLE t (id INT PRIMARY KEY AUTO_INCREMENT, v INT);
INSERT INTO t (v) VALUES (1),(2),(3);
DELETE FROM t;  INSERT INTO t (v) VALUES (9);  SELECT id FROM t;     -- auto-increment continues
TRUNCATE TABLE t; INSERT INTO t (v) VALUES (9); SELECT id FROM t;    -- auto-increment resets

-- OUTPUT:
-- id
-- 4
-- id
-- 1`],
        [`RENAME TABLE renames atomically and can swap tables in one statement. Variants include moving a table to another schema and renaming multiple tables together.`,
            r`RENAME TABLE orders TO orders_old, orders_new TO orders;           -- atomic swap
RENAME TABLE shop.archive TO cold_storage.archive;                    -- move between schemas
DROP TABLE IF EXISTS tmp_import, tmp_stage;

-- OUTPUT:
-- Query OK, 0 rows affected`],
        [`Mistakes: TRUNCATE on a table referenced by a foreign key (blocked), expecting TRUNCATE to roll back, and dropping a table that views or procedures depend on. Check dependencies and rename first.`,
            r`TRUNCATE TABLE customers;

-- OUTPUT:
-- ERROR 1701 (42000): Cannot truncate a table referenced in a foreign key constraint (shop.orders, CONSTRAINT fk_orders_customer)

SELECT table_name, referenced_table_name FROM information_schema.key_column_usage WHERE referenced_table_name = 'customers';`],
        [`Emptying a huge table: TRUNCATE is instant, while DELETE FROM runs for hours and bloats undo logs. When you need to keep some rows, copy the survivors, then swap names.`,
            r`CREATE TABLE events_keep LIKE events;
INSERT INTO events_keep SELECT * FROM events WHERE created_at >= '2026-01-01';
RENAME TABLE events TO events_old, events_keep TO events;
DROP TABLE events_old;

-- OUTPUT:
-- Query OK, 4200311 rows affected`],
        [`Real-world: a safe drop procedure. Rename first, observe for a retention period (errors show up as "table not found"), then drop.`,
            r`RENAME TABLE reports_v1 TO reports_v1_deleted_20260501;
-- wait two weeks and watch error logs/monitoring, then:
DROP TABLE reports_v1_deleted_20260501;

-- OUTPUT:
-- Query OK, 0 rows affected`]
    )
};
