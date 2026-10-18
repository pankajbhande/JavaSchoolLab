// Module 2 (MySQL Installation & Environment), part B.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s02b: Record<string, DeepDive> = {
    'Connecting to MySQL & Basic CLI Commands': dd(
        [`The <code>mysql</code> command-line client connects to a server with host, port, user and password, then accepts SQL ending in <code>;</code> plus client commands such as <code>status</code> and <code>exit</code>.`,
            r`# Connect (-p prompts for the password; never put it on the command line in real life)
mysql -h localhost -P 3306 -u root -p
mysql> SELECT CURRENT_USER();

-- OUTPUT:
-- +----------------+
-- | CURRENT_USER() |
-- +----------------+
-- | root@localhost |
-- +----------------+`],
        [`Every task, from a quick check to a restore, starts with a connection. Knowing the handful of CLI commands makes you productive on any server, even without a GUI.`,
            r`mysql> SHOW DATABASES;          -- list schemas
mysql> USE mysql;                -- choose one
mysql> SHOW TABLES LIKE 'user';  -- list tables matching a pattern

-- OUTPUT:
-- +------------------------+
-- | Tables_in_mysql (user) |
-- +------------------------+
-- | user                   |
-- +------------------------+`],
        [`Admins run one-off commands with <code>-e</code>, pipe SQL files with <code>&lt;</code>, and connect over a UNIX socket locally or TLS remotely.`,
            r`# Run a statement and exit
mysql -u root -p -e "SELECT COUNT(*) AS dbs FROM information_schema.schemata"
# Run a script file
mysql -u root -p shop < create_schema.sql

-- OUTPUT (example, first command):
-- +-----+
-- | dbs |
-- +-----+
-- |   6 |
-- +-----+`],
        [`<b>Advantages:</b> fast, scriptable, available everywhere, tiny footprint, works over SSH.`,
            r`mysql> status                   -- client command: connection details
mysql> \G                         -- end a statement with \G for vertical output
mysql> SELECT VERSION()\G

-- OUTPUT (example):
-- *************************** 1. row ***************************
-- VERSION(): 8.0.36`],
        [`<b>Disadvantages:</b> no visual aids; typos in multi-line statements are painful; a password on the command line leaks into history and process lists.`,
            r`# Warning shown when you pass the password inline
mysql -u root -pSecret123 -e "SELECT 1"

-- OUTPUT:
-- mysql: [Warning] Using a password on the command line interface can be insecure.`],
        [`<b>Limitations:</b> accounts are host-specific ('root'@'localhost' is not 'root'@'%'), and a failed login is reported with the same generic message for security.`,
            r`mysql -h db01 -u root -p
# wrong password or wrong host entry in the grant tables:

-- OUTPUT:
-- ERROR 1045 (28000): Access denied for user 'root'@'10.0.0.5' (using password: YES)`],
        `
   mysql -h HOST -P PORT -u USER -p [DB]
        │
        ├─ local  : UNIX socket / named pipe (no network)
        └─ remote : TCP 3306 (+ TLS)
              ▼
   mysql> statement ;   ──► result table ──► exit / quit / Ctrl+D
`,
        `Use option files (login paths via mysql_config_editor) instead of inline passwords, require TLS for remote use, and give humans and applications separate accounts. Log in as root only for administration.`
    ),

    'Creating Users': dd(
        [`A MySQL account is <code>'user'@'host'</code>. <code>CREATE USER</code> makes it; <code>GRANT</code> gives privileges. By default a new user can do almost nothing.`,
            r`CREATE USER 'app'@'localhost' IDENTIFIED BY 'Str0ng#Pass1';    -- account + password
GRANT SELECT, INSERT, UPDATE ON shop.* TO 'app'@'localhost';       -- limited rights
SHOW GRANTS FOR 'app'@'localhost';

-- OUTPUT:
-- +---------------------------------------------------------------------+
-- | Grants for app@localhost                                            |
-- +---------------------------------------------------------------------+
-- | GRANT USAGE ON *.* TO app@localhost                                 |
-- | GRANT SELECT, INSERT, UPDATE ON shop.* TO app@localhost             |
-- +---------------------------------------------------------------------+`],
        [`Using root in an application means one bug or injection can drop everything. Separate accounts give auditing and blast-radius control.`,
            r`-- App user cannot drop tables
-- (connected as app)
DROP TABLE shop.orders;

-- OUTPUT:
-- ERROR 1142 (42000): DROP command denied to user 'app'@'localhost' for table 'orders'`],
        [`Typical set: an admin user, an application read-write user, a read-only reporting user, and a backup user, each restricted by host.`,
            r`CREATE USER 'report'@'10.0.%' IDENTIFIED BY 'R3port#Pwd';    -- any 10.0.x.x host
GRANT SELECT ON shop.* TO 'report'@'10.0.%';
SELECT user, host FROM mysql.user WHERE user IN ('app','report');

-- OUTPUT:
-- +--------+-----------+
-- | user   | host      |
-- +--------+-----------+
-- | app    | localhost |
-- | report | 10.0.%    |
-- +--------+-----------+`],
        [`<b>Advantages:</b> fine-grained privileges, per-host restriction, password policies, account locking and expiry.`,
            r`ALTER USER 'report'@'10.0.%' PASSWORD EXPIRE INTERVAL 90 DAY;   -- force rotation
ALTER USER 'app'@'localhost' ACCOUNT LOCK;                        -- disable quickly

-- OUTPUT:
-- Query OK, 0 rows affected (0.01 sec)`],
        [`<b>Disadvantages:</b> account per host combination multiplies entries; password handling needs care; revoking requires knowing what was granted.`,
            r`-- 'app'@'%' and 'app'@'localhost' are two different accounts
CREATE USER 'app'@'%' IDENTIFIED BY 'x';
SELECT user, host FROM mysql.user WHERE user = 'app';

-- OUTPUT:
-- +------+-----------+
-- | user | host      |
-- +------+-----------+
-- | app  | %         |
-- | app  | localhost |
-- +------+-----------+`],
        [`<b>Limitations:</b> creating an existing user errors; user names max 32 characters; the default plugin in 8.0 is caching_sha2_password, which older drivers may not support.`,
            r`CREATE USER 'app'@'localhost' IDENTIFIED BY 'again';

-- OUTPUT:
-- ERROR 1396 (HY000): Operation CREATE USER failed for 'app'@'localhost'`],
        `
   CREATE USER 'app'@'host'  ──►  mysql.user (account)
   GRANT priv ON db.tbl      ──►  privilege tables
   login attempt: (user, host, password) ─► match account ─► check privileges per statement
`,
        `Apply least privilege: one account per application, minimal grants, host restrictions, strong plugin (caching_sha2_password), and rotate credentials from a secrets manager. Prefer roles for groups of privileges (MySQL 8.0).`
    ),

    'MySQL Configuration & Data Directory': dd(
        [`The server reads settings from an option file (<code>my.cnf</code> on Linux, <code>my.ini</code> on Windows). The <b>data directory</b> (<code>datadir</code>) holds InnoDB files, system tables, logs and one folder per schema.`,
            r`# /etc/mysql/my.cnf  (or my.ini on Windows)
[mysqld]
port            = 3306
datadir         = /var/lib/mysql           # where data files live
character-set-server = utf8mb4
innodb_buffer_pool_size = 1G                # main memory cache

-- OUTPUT:
-- (no output; file is read at the next server start)`],
        [`Defaults suit a laptop, not production. Tuning memory, logging, character sets and durability to your workload requires editing configuration.`,
            r`SHOW VARIABLES LIKE 'datadir';
SHOW VARIABLES LIKE 'innodb_buffer_pool_size';

-- OUTPUT (example):
-- +---------------+-----------------+
-- | Variable_name | Value           |
-- +---------------+-----------------+
-- | datadir       | /var/lib/mysql/ |
-- +---------------+-----------------+
-- | innodb_buffer_pool_size | 134217728 |`],
        [`DBAs set values in the file for permanence and use <code>SET PERSIST</code> (8.0) for runtime changes that survive restarts, written to <code>mysqld-auto.cnf</code>.`,
            r`SET PERSIST max_connections = 300;                 -- change now and keep after restart
SELECT variable_name, variable_value FROM performance_schema.persisted_variables;

-- OUTPUT:
-- +-----------------+----------------+
-- | VARIABLE_NAME   | VARIABLE_VALUE |
-- +-----------------+----------------+
-- | max_connections | 300            |
-- +-----------------+----------------+`],
        [`<b>Advantages:</b> many knobs, dynamic variables change without restart, per-schema folders and files are easy to locate.`,
            r`# Look inside the data directory
ls /var/lib/mysql

-- OUTPUT (example):
-- auto.cnf  binlog.000001  ib_buffer_pool  ibdata1  ib_logfile0  mysql  mysql.ibd  shop  sys  ...`],
        [`<b>Disadvantages:</b> wrong values can slow or crash the server; settings are spread across files, command line and persisted config; copying files by hand corrupts data.`,
            r`-- Which file set which value? (8.0)
SELECT variable_name, variable_source, variable_path
FROM performance_schema.variables_info WHERE variable_name = 'max_connections';

-- OUTPUT (example):
-- +-----------------+-----------------+----------------------+
-- | VARIABLE_NAME   | VARIABLE_SOURCE | VARIABLE_PATH        |
-- +-----------------+-----------------+----------------------+
-- | max_connections | PERSISTED       | /var/lib/mysql/mysqld-auto.cnf |
-- +-----------------+-----------------+----------------------+`],
        [`<b>Limitations:</b> static variables (like <code>innodb_log_file_size</code> in old versions or <code>datadir</code>) need a restart, and a wrong option name stops the server from starting.`,
            r`SET GLOBAL datadir = '/new/path';

-- OUTPUT:
-- ERROR 1238 (HY000): Variable 'datadir' is a read only variable`],
        `
   my.cnf  ──read at start──►  mysqld ──► datadir
   [client] [mysqld]                      ├─ ibdata1, undo_*, #innodb_redo
   precedence: /etc/my.cnf                ├─ mysql/ (system tables)
   ~/.my.cnf < command line               ├─ shop/ (per-schema files .ibd)
                                          └─ binlog.*, error log
`,
        `Keep configuration in version control and templated per instance size; set innodb_buffer_pool_size to about 60-75 percent of RAM on a dedicated host; place data, redo and binlogs on suitable disks. Never edit or copy datadir files while the server runs.`
    ),

    'Starting & Stopping the MySQL Service': dd(
        [`MySQL runs as a background service. On Linux use <code>systemctl</code> (<code>mysql</code> or <code>mysqld</code>), on Windows <code>net start MySQL80</code> or the Services app. A clean stop flushes buffers and finishes transactions.`,
            r`sudo systemctl start mysql           # start now
sudo systemctl status mysql          # is it up?

-- OUTPUT (example, trimmed):
-- * mysql.service - MySQL Community Server
--      Active: active (running) since Tue 2026-10-06 09:00:01 UTC; 5min ago`],
        [`You must restart after changing static options, patching or upgrading, and stop cleanly before maintenance so no data is lost and recovery is quick.`,
            r`sudo systemctl restart mysql         # stop then start
sudo systemctl enable mysql          # start automatically at boot
sudo systemctl is-enabled mysql

-- OUTPUT:
-- enabled`],
        [`Ops teams script restarts, check readiness before routing traffic, and use <code>mysqladmin</code> for a quick health ping.`,
            r`mysqladmin -u root -p ping          # is the server answering?
mysqladmin -u root -p shutdown       # graceful shutdown through the protocol

-- OUTPUT:
-- mysqld is alive`],
        [`<b>Advantages:</b> systemd restarts crashed servers, logs to the journal, and start-on-boot is one command.`,
            r`sudo journalctl -u mysql -n 3 --no-pager     # recent service log lines

-- OUTPUT (example):
-- Oct 06 09:00:01 db01 systemd[1]: Starting MySQL Community Server...
-- Oct 06 09:00:05 db01 systemd[1]: Started MySQL Community Server.`],
        [`<b>Disadvantages:</b> killing the process (kill -9) or power loss forces crash recovery on the next start, which can take minutes with big redo logs.`,
            r`# After an unclean stop the error log shows InnoDB recovery
sudo tail -n 2 /var/log/mysql/error.log

-- OUTPUT (example):
-- [Note] [MY-012551] [InnoDB] Database was not shut down normally!
-- [Note] [MY-013575] [InnoDB] Starting crash recovery.`],
        [`<b>Limitations:</b> a stop waits for open transactions, and the unit name, paths and the root requirement differ across distros and Windows.`,
            r`SHOW VARIABLES LIKE 'innodb_fast_shutdown';   -- 1 = quick, 2 = crash-like, 0 = full purge

-- OUTPUT:
-- +----------------------+-------+
-- | Variable_name        | Value |
-- +----------------------+-------+
-- | innodb_fast_shutdown | 1     |
-- +----------------------+-------+`],
        `
   systemctl start ─► mysqld ─► open data files ─► (crash recovery?) ─► accept clients
   systemctl stop  ─► stop new conns ─► flush dirty pages ─► checkpoint ─► exit
   kill -9 / power loss ──────────────────────────────────► recovery on next start
`,
        `Always stop gracefully, drain connections at the load balancer first, and set a long enough systemd TimeoutStopSec for big buffer pools. In HA setups promote a replica instead of restarting the primary when you can.`
    ),
};
