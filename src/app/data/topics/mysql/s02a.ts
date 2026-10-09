// Module 2 (MySQL Installation & Environment), part A.
// Shell blocks use "#" for inline comments; every block ends with a "-- OUTPUT:" section.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s02a: Record<string, DeepDive> = {
    'Installing MySQL': dd(
        [`Installing MySQL puts the server (<code>mysqld</code>), client tools and default data directory on your machine. Options: Windows MSI installer, Linux package manager (apt, yum), macOS dmg or Homebrew, or a Docker image.`,
            r`# Ubuntu / Debian
sudo apt update
sudo apt install mysql-server -y          # server + client from the distro repo
mysql --version                           # confirm what was installed

-- OUTPUT (example):
-- mysql  Ver 8.0.36-0ubuntu0.22.04.1 for Linux on x86_64 ((Ubuntu))`],
        [`You need a local server to practise SQL, run integration tests and develop apps without touching production. A repeatable install means every developer has the same version.`,
            r`# Docker: a throw-away, version-pinned MySQL in one command
docker run -d --name mysql8 -e MYSQL_ROOT_PASSWORD=Secret#123 -p 3306:3306 mysql:8.0
docker ps --filter name=mysql8            # confirm it is running

-- OUTPUT (example):
-- CONTAINER ID   IMAGE       STATUS         PORTS                    NAMES
-- 9c1d2e3f4a5b   mysql:8.0   Up 8 seconds   0.0.0.0:3306->3306/tcp   mysql8`],
        [`Dev laptops use the installer or Docker; production uses managed services (RDS, Cloud SQL) or configuration-managed packages with a pinned minor version.`,
            r`# RHEL / CentOS / Rocky: add Oracle's repo then install
sudo dnf install mysql-community-server -y
sudo systemctl enable --now mysqld        # start now and on every boot
sudo grep 'temporary password' /var/log/mysqld.log    # first-run root password

-- OUTPUT (example):
-- [Note] A temporary password is generated for root@localhost: Xk3;9aBc#t`],
        [`<b>Advantages:</b> free, quick (minutes), cross-platform, and Docker gives disposable, reproducible environments.`,
            r`# Run two versions side by side on different ports
docker run -d --name my57 -e MYSQL_ROOT_PASSWORD=pw -p 3307:3306 mysql:5.7
docker run -d --name my80 -e MYSQL_ROOT_PASSWORD=pw -p 3308:3306 mysql:8.0

-- OUTPUT (example):
-- 5f0c...   (container id printed for each)`],
        [`<b>Disadvantages:</b> distro repos often lag the newest release; Windows installers add services and registry entries that are tedious to clean; containers need a volume or data disappears.`,
            r`# Without a volume, removing the container deletes the data
docker rm -f mysql8
docker run -d --name mysql8 -e MYSQL_ROOT_PASSWORD=pw -p 3306:3306 mysql:8.0
# ...previous databases are gone. Use: -v mysqldata:/var/lib/mysql

-- OUTPUT:
-- (a fresh, empty server: SHOW DATABASES lists only system schemas)`],
        [`<b>Limitations:</b> the port may already be taken, the OS user needs admin rights, and some distros ship MariaDB under the name mysql.`,
            r`# Port 3306 busy: the new server will not start
sudo ss -ltnp | grep 3306                 # who owns the port?

-- OUTPUT (example):
-- LISTEN 0 151 *:3306 *:* users:(("mysqld",pid=1021,fd=24))
-- [ERROR] [MY-010119] [Server] Aborting   (seen in the second server's log)`],
        `
   package / MSI / docker pull
          │
          ▼
   ┌────────────────┐   first start   ┌──────────────────┐
   │ binaries       │ ───────────────►│ initialise data  │
   │ mysqld, mysql  │                 │ dir, root account│
   └────────────────┘                 └──────────────────┘
          │ systemctl start mysql / Services / docker start
          ▼
   listening on 3306  ◄── clients connect
`,
        `Pin an exact version (8.0.x or the current LTS) in Docker tags or package holds, use utf8mb4 from day one, and treat the install as code (Ansible, Terraform or managed service). Never run production data in a container without a persistent volume and backups.`
    ),

    'MySQL Server & Client': dd(
        [`MySQL is client/server. The <b>server</b> (<code>mysqld</code>) owns the data and listens on a port. A <b>client</b> (mysql CLI, Workbench, a JDBC driver) connects, sends SQL and prints results. They can run on different machines.`,
            r`# Server process
ps -ef | grep mysqld | head -1
# Client talks to it over TCP
mysql -h 127.0.0.1 -P 3306 -u root -p -e "SELECT 'hello from server' AS msg"

-- OUTPUT (example):
-- mysql  1021  1  0 09:01 ?  00:00:03 /usr/sbin/mysqld
-- +-------------------+
-- | msg               |
-- +-------------------+
-- | hello from server |
-- +-------------------+`],
        [`Separating them lets many applications share one managed data service, and lets you upgrade, secure and scale the server independently of client code.`,
            r`-- From any client: which server and which client connection am I?
SELECT @@hostname AS server_host, CONNECTION_ID() AS my_conn, USER() AS client_user;

-- OUTPUT (example):
-- +-------------+---------+----------------+
-- | server_host | my_conn | client_user    |
-- +-------------+---------+----------------+
-- | db01        |      42 | root@10.0.0.5  |
-- +-------------+---------+----------------+`],
        [`App servers (clients) in one subnet connect to a database host; DBAs connect with the CLI; BI tools connect read-only to a replica.`,
            r`-- Everyone connected right now (clients as seen by the server)
SELECT id, user, host, db, command FROM information_schema.processlist;

-- OUTPUT (example):
-- +----+---------+----------------+------+---------+
-- | id | user    | host           | db   | command |
-- +----+---------+----------------+------+---------+
-- | 42 | root    | 10.0.0.5:51322 | NULL | Query   |
-- | 57 | app_usr | 10.0.1.7:40110 | shop | Sleep   |
-- +----+---------+----------------+------+---------+`],
        [`<b>Advantages:</b> central data, central security, many simultaneous clients, language-neutral wire protocol.`,
            r`# The same server answers a Python, Java or shell client identically
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected'"

-- OUTPUT (example):
-- +-------------------+-------+
-- | Variable_name     | Value |
-- +-------------------+-------+
-- | Threads_connected | 2     |
-- +-------------------+-------+`],
        [`<b>Disadvantages:</b> network latency on every call, a single server is a single point of failure, and connection management becomes your job.`,
            r`# Server down: every client fails at once
mysql -h db01 -u app -p -e "SELECT 1"

-- OUTPUT:
-- ERROR 2003 (HY000): Can't connect to MySQL server on 'db01:3306' (111)`],
        [`<b>Limitations:</b> max_connections (default 151) caps concurrent clients; each connection uses memory and a thread.`,
            r`SHOW VARIABLES LIKE 'max_connections';

-- OUTPUT:
-- +-----------------+-------+
-- | Variable_name   | Value |
-- +-----------------+-------+
-- | max_connections | 151   |
-- +-----------------+-------+
-- (the 152nd client gets ERROR 1040: Too many connections)`],
        `
   mysql CLI ─┐
   Workbench ─┼──► TCP 3306 / socket ──► mysqld ──► data directory
   JDBC app  ─┤        (protocol)         │  threads, caches, engines
   Python    ─┘                           └──► logs
   CLIENTS                                   SERVER
`,
        `Keep servers on private networks, require TLS and per-app accounts, and front them with connection pooling (HikariCP, ProxySQL) so thousands of app threads become tens of server connections.`
    ),

    'MySQL Workbench': dd(
        [`<b>MySQL Workbench</b> is Oracle's free GUI for MySQL: a SQL editor, visual schema designer (EER diagrams), server administration (users, status) and data import/export.`,
            r`-- In Workbench's SQL editor: Ctrl+Enter runs the current statement.
-- The editor sends ordinary SQL; nothing here is Workbench-specific.
SELECT SCHEMA() AS current_db, CURRENT_USER() AS login_user;

-- OUTPUT (example):
-- +------------+----------------+
-- | current_db | login_user     |
-- +------------+----------------+
-- | NULL       | root@localhost |
-- +------------+----------------+`],
        [`Beginners learn faster seeing tables, rows and diagrams; teams share and review schema visually; DBAs inspect performance without typing every command.`,
            r`-- Reverse-engineer: Workbench can draw this schema as an EER diagram
CREATE TABLE wb_parent (id INT PRIMARY KEY);
CREATE TABLE wb_child  (id INT PRIMARY KEY, p_id INT, FOREIGN KEY (p_id) REFERENCES wb_parent(id));
-- Database > Reverse Engineer ... draws the two boxes with an FK arrow

-- OUTPUT:
-- Query OK, 0 rows affected (two statements)`],
        [`Used for ad-hoc queries, running EXPLAIN visually, exporting a table to CSV, comparing schemas and generating forward-engineer scripts from a model.`,
            r`-- Visual Explain in Workbench is built on this plan
EXPLAIN FORMAT=JSON SELECT * FROM wb_child WHERE p_id = 1;

-- OUTPUT (trimmed, example):
-- {"query_block": {"table": {"table_name": "wb_child", "access_type": "ref", "key": "p_id"}}}`],
        [`<b>Advantages:</b> low learning curve, schema modelling, performance dashboard, saved connections, free.`,
            r`-- Performance dashboard reads these same counters
SHOW GLOBAL STATUS LIKE 'Questions';

-- OUTPUT (example):
-- +---------------+--------+
-- | Variable_name | Value  |
-- +---------------+--------+
-- | Questions     | 128734 |
-- +---------------+--------+`],
        [`<b>Disadvantages:</b> GUI clicks are not repeatable or reviewable; it can freeze on very large result sets; auto-commit and safe-update defaults surprise users.`,
            r`-- Workbench enables "safe updates" by default; this fails without a key in WHERE
UPDATE wb_child SET p_id = NULL;

-- OUTPUT:
-- Error Code: 1175. You are using safe update mode and you tried to update a table
-- without a WHERE that uses a KEY column.`],
        [`<b>Limitations:</b> no native Linux ARM or very latest OS builds sometimes lag; not meant for scripted automation or production runbooks (use the CLI or Shell).`,
            r`# Automation needs a scriptable client, not a GUI
mysql -u root -p -e "SELECT COUNT(*) AS n FROM information_schema.tables" --batch --skip-column-names

-- OUTPUT (example):
-- 287`],
        `
   ┌──────────── MySQL Workbench ─────────────┐
   │ SQL Editor │ Schema Designer │ Admin     │
   └────────────────┬─────────────────────────┘
                    │ standard MySQL protocol
                    ▼
                 mysqld
`,
        `Use the GUI to explore and design, but commit the resulting DDL to version control and apply it via migrations. For production access prefer least-privilege accounts, read-only replicas and audited bastions over shared root in a desktop tool.`
    ),

    'MySQL Shell': dd(
        [`<b>MySQL Shell (mysqlsh)</b> is an advanced client with three modes: SQL, JavaScript and Python. It supports the X DevAPI (port 33060), scripting, and administration of InnoDB Cluster and replica sets.`,
            r`# Connect with the URI form and switch modes
mysqlsh root@localhost:3306
 MySQL  localhost:3306 ssl  JS > \sql             # switch to SQL mode
 MySQL  localhost:3306 ssl  SQL > SELECT 1+1 AS two;

-- OUTPUT:
-- +-----+
-- | two |
-- +-----+
-- |   2 |
-- +-----+`],
        [`The classic <code>mysql</code> client is great for typing SQL but weak for scripting and cluster management. Shell adds real programming, JSON output and AdminAPI helpers.`,
            r`# Run a JavaScript one-liner against the server, no interactive session
mysqlsh --js -u root -p --uri root@localhost -e "print(session.runSql('SELECT VERSION()').fetchOne()[0])"

-- OUTPUT (example):
-- 8.0.36`],
        [`DBAs use <code>dba.createCluster()</code> to build InnoDB Cluster, the dump and load utilities for fast logical backups, and the upgrade checker before a major upgrade.`,
            r`# Pre-upgrade compatibility report
mysqlsh root@localhost -- util checkForServerUpgrade

-- OUTPUT (example, trimmed):
-- The MySQL server at localhost:3306, version 8.0.30, will now be checked for compatibility
-- issues for upgrade to MySQL 8.0.36 ...
-- No fatal errors were found that would prevent an upgrade.`],
        [`<b>Advantages:</b> scripting in JS or Python, multi-threaded dump/load utilities, JSON output, cluster tooling, X DevAPI document store.`,
            r`# Fast parallel logical dump of one schema
mysqlsh root@localhost -- util dumpSchemas ["shop"] /backup/shop_dump --threads 4

-- OUTPUT (example):
-- Dump duration: 00:00:02s
-- Rows written: 120034
-- Bytes written: 8.1 MB`],
        [`<b>Disadvantages:</b> another tool to install, learn and keep in step with the server version; output formats differ from the classic client.`,
            r`# Classic client batch output vs Shell: different default table formatting and flags
mysqlsh --sql -u root -p --table -e "SELECT 1 AS x"

-- OUTPUT:
-- +---+
-- | x |
-- +---+
-- | 1 |
-- +---+`],
        [`<b>Limitations:</b> X Protocol (33060) must be enabled and reachable; some AdminAPI features require MySQL 8.0 with GTID and a specific topology.`,
            r`# X Protocol port check
mysql -u root -p -e "SHOW VARIABLES LIKE 'mysqlx_port'"

-- OUTPUT:
-- +---------------+-------+
-- | Variable_name | Value |
-- +---------------+-------+
-- | mysqlx_port   | 33060 |
-- +---------------+-------+`],
        `
   mysqlsh
   ├─ SQL mode ─────────► classic protocol 3306
   ├─ JavaScript mode ──► X DevAPI        33060
   └─ Python mode
        └─ dba.* / util.* : cluster, dump, load, upgrade checks
`,
        `Use Shell for automation, parallel dump/load, cluster operations and upgrade checks; keep plain mysql for quick manual SQL. Script cluster changes in Shell so topology edits are reviewable code, not console history.`
    ),
};
