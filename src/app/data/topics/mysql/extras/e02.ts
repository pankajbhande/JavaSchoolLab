// Modules 2-3 (Installation & Environment, SQL Basics) extras.
import { x, r, type Extra } from './extra';

export const e02: Record<string, Extra> = {
    'Installing MySQL': x(
        ['Download the MySQL Installer (Windows) or use the package manager (<code>apt</code>, <code>brew</code>, <code>yum</code>); choose "MySQL Server" plus Workbench.',
            'During setup you set the root password and the port (default 3306). Remember both.',
            'Verify with <code>mysql --version</code> and by logging in with <code>mysql -u root -p</code>.'],
        ['Run MySQL in Docker for development: one command gives a disposable, version-pinned server.',
            'Know the install layout: binaries, data directory, config file (<code>my.ini</code> on Windows, <code>my.cnf</code> on Linux), and the service name.',
            'Run <code>mysql_secure_installation</code> (or equivalent) to remove test data and anonymous users.'],
        ['Pin exact minor versions in every environment; upgrades change defaults (auth plugin, charset, optimizer).',
            'Prefer managed services or containers with persistent volumes for production; never keep data inside an ephemeral container layer.',
            'Automate installs and config with IaC (Ansible, Terraform, Helm) so servers are reproducible.'],
        [['F', 'How do you check that MySQL is installed?', '<code>mysql --version</code> and connect with <code>mysql -u root -p</code>.'],
            ['F', 'What is the default MySQL port?', '3306.'],
            ['M', 'How do you run MySQL quickly for development?', 'Docker: <code>docker run -e MYSQL_ROOT_PASSWORD=pw -p 3306:3306 mysql:8</code> with a volume for data.'],
            ['M', 'Where is the configuration file?', 'Linux: <code>/etc/mysql/my.cnf</code> (or <code>/etc/my.cnf</code>); Windows: <code>my.ini</code> in the install or ProgramData directory.'],
            ['S', 'What do you decide before a production install?', 'Version, storage and filesystem, memory sizing (buffer pool), charset/collation, backups, monitoring, users and network exposure.'],
            ['S', 'Why not upgrade a major version in place without testing?', 'Optimizer, defaults, deprecated features and authentication can change. Test on a clone with real queries and plan rollback via backup or replica.']],
        [['Confirm your server version and uptime after installing.',
            r`SELECT VERSION();
SHOW GLOBAL STATUS LIKE 'Uptime';

-- OUTPUT: (example)
-- VERSION()
-- 8.0.36
-- Variable_name | Value
-- Uptime        | 120`],
            ['Find the data directory and port that your install uses.',
                r`SHOW VARIABLES WHERE Variable_name IN ('datadir','port');

-- OUTPUT: (example)
-- Variable_name | Value
-- datadir       | C:\ProgramData\MySQL\MySQL Server 8.0\Data\
-- port          | 3306`]],
        [['Docker based dev server (shell commands).',
            r`docker run --name mysql-dev -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -v mysqldata:/var/lib/mysql -d mysql:8.0
docker exec -it mysql-dev mysql -uroot -psecret -e "SELECT 1"

-- OUTPUT:
-- 1
-- 1`],
            ['Create an application user right after install instead of using root.',
                r`CREATE USER 'app'@'localhost' IDENTIFIED BY 'Str0ng#Pass';
GRANT ALL ON school.* TO 'app'@'localhost';
SHOW GRANTS FOR 'app'@'localhost';

-- OUTPUT: (trimmed)
-- GRANT USAGE ON *.* TO app@localhost
-- GRANT ALL PRIVILEGES ON school.* TO app@localhost`]]
    ),

    'MySQL Server & Client': x(
        ['The server (<code>mysqld</code>) stores data and runs queries. A client (CLI, Workbench, your app) connects and sends SQL.',
            'They talk over TCP (port 3306), a Unix socket or a named pipe.',
            'You can have many clients connected to one server at the same time.'],
        ['Each client connection gets a session with its own variables, current database and transaction.',
            'The command-line client is <code>mysql</code>; other client programs include <code>mysqldump</code>, <code>mysqladmin</code> and drivers (JDBC, mysqlclient, mysql2).',
            'Use <code>SHOW PROCESSLIST</code> to see connected clients and what they run.'],
        ['The server is thread-per-connection by default, so unlimited connections are not free; use pooling and set <code>max_connections</code> sensibly.',
            'Network exposure: bind to private interfaces, require TLS, and firewall port 3306.',
            'Client and server version mismatches affect authentication plugins (caching_sha2_password vs mysql_native_password).'],
        [['F', 'What is the difference between MySQL server and client?', 'The server stores and processes data; the client connects to send SQL and show results.'],
            ['F', 'Name some MySQL clients.', 'mysql CLI, MySQL Workbench, DBeaver, application drivers.'],
            ['M', 'How does a client connect?', 'Through TCP (host:port), a Unix socket locally or Windows named pipe, with a user and password.'],
            ['M', 'What is a session?', 'The state of one connection: its variables, current database, transaction and temporary tables.'],
            ['S', 'Why do apps use connection pools?', 'Opening a connection costs a handshake, authentication and a server thread. Pools reuse connections and cap concurrency.'],
            ['S', 'How do you secure server/client traffic?', 'Enable TLS (<code>require_secure_transport</code>), restrict host grants, bind addresses and firewall rules.']],
        [['Count active connections.',
            r`SHOW STATUS LIKE 'Threads_connected';

-- OUTPUT: (example)
-- Variable_name     | Value
-- Threads_connected | 3`],
            ['Show the maximum allowed connections.',
                r`SHOW VARIABLES LIKE 'max_connections';

-- OUTPUT:
-- Variable_name   | Value
-- max_connections | 151`]],
        [['Session variables are per client.',
            r`SET @name = 'Asha';
SELECT @name;
-- another client session:
SELECT @name;

-- OUTPUT:
-- Asha
-- NULL`],
            ['Check whether the current connection uses TLS.',
                r`SHOW SESSION STATUS LIKE 'Ssl_cipher';

-- OUTPUT: (example)
-- Variable_name | Value
-- Ssl_cipher    | TLS_AES_256_GCM_SHA384`]]
    ),

    'MySQL Workbench': x(
        ['MySQL Workbench is the official graphical tool: write SQL, browse tables, design diagrams and manage users.',
            'Create a connection (host, port, user), double-click it, and run queries in the SQL editor with the lightning button.',
            'Use the schema panel to see tables and right-click for "Select Rows".'],
        ['Reverse-engineer an EER diagram from a database, or forward-engineer a diagram into SQL.',
            'Use the Performance Reports and query "Visual Explain" to inspect plans.',
            'Turn off "safe updates" only knowingly; it protects against UPDATE/DELETE without a key in WHERE.'],
        ['GUI tools are for exploration; production changes go through versioned migrations, not clicks.',
            'Do not connect Workbench directly to production with powerful accounts; use read-only users and bastion/VPN.',
            'Alternative clients (DBeaver, DataGrip) may suit teams that use multiple databases.'],
        [['F', 'What is MySQL Workbench?', 'The official GUI to design, query and administer MySQL.'],
            ['F', 'How do you run a query in Workbench?', 'Type it in the SQL editor and press Ctrl+Enter (current statement) or the lightning icon.'],
            ['M', 'What is an EER diagram?', 'Enhanced Entity-Relationship diagram: a visual model of tables, keys and relationships that can generate or reverse-engineer SQL.'],
            ['M', 'What is safe-updates mode?', 'A session setting (<code>sql_safe_updates=1</code>) that rejects UPDATE/DELETE without a key-based WHERE or LIMIT.'],
            ['S', 'Should teams make schema changes in Workbench?', 'No. Generate scripts if needed but commit them as migrations so changes are reviewed and repeatable.'],
            ['S', 'How do you limit risk when developers use GUIs against production?', 'Read-only accounts, VPN/bastion access, query auditing and restricted privileges.']],
        [['Check whether safe updates is on in your session.',
            r`SELECT @@sql_safe_updates;

-- OUTPUT: (Workbench default)
-- @@sql_safe_updates
-- 1`],
            ['See what safe updates blocks.',
                r`SET sql_safe_updates = 1;
DELETE FROM students;

-- OUTPUT:
-- ERROR 1175 (HY000): You are using safe update mode and you tried to update a table without a WHERE that uses a KEY column.`]],
        [['The Workbench "Select Rows" shortcut runs this query.',
            r`SELECT * FROM school.students LIMIT 1000;

-- OUTPUT:
-- id | name
--  1 | Asha
--  2 | Ravi`],
            ['Export the same data from the CLI instead (repeatable).',
                r`mysqldump -u root -p school students > students.sql

-- OUTPUT:
-- (file students.sql created with CREATE TABLE and INSERT statements)`]]
    ),

    'MySQL Shell': x(
        ['MySQL Shell (<code>mysqlsh</code>) is an advanced command-line client that supports SQL, JavaScript and Python modes.',
            'Start it with <code>mysqlsh root@localhost</code> and switch modes with <code>\\sql</code>, <code>\\js</code>, <code>\\py</code>.',
            'It formats results nicely and can manage InnoDB Cluster.'],
        ['The shell has utilities for fast dump/load (<code>util.dumpInstance</code>, <code>util.loadDump</code>) that are parallel and much faster than mysqldump.',
            'Use the X DevAPI for document-style access on port 33060.',
            'Scriptable in JavaScript or Python for administration tasks.'],
        ['AdminAPI in MySQL Shell sets up and monitors InnoDB Cluster, ClusterSet and Replica sets.',
            'Use dump/load utilities for migrations between servers and cloud; check compatibility with <code>util.checkForServerUpgrade()</code> before upgrades.',
            'Automation: run shell scripts in CI for health checks and schema validation.'],
        [['F', 'What is MySQL Shell?', 'An advanced client with SQL, JavaScript and Python modes plus admin utilities.'],
            ['F', 'How do you switch to SQL mode?', 'Type <code>\\sql</code>.'],
            ['M', 'Why use util.dumpInstance over mysqldump?', 'It is multi-threaded, chunks large tables, and loads faster with <code>util.loadDump</code>.'],
            ['M', 'What is port 33060?', 'The default port of the X Protocol used by MySQL Shell and X DevAPI.'],
            ['S', 'How does AdminAPI help with HA?', 'It automates creating and managing InnoDB Cluster: provisioning members, joining, rebooting and checking status.'],
            ['S', 'How can the shell help with upgrades?', '<code>util.checkForServerUpgrade()</code> reports incompatibilities such as deprecated syntax or removed features before you upgrade.']],
        [['Run a SQL statement from the shell in one line (shell command).',
            r`mysqlsh --sql -u root -p -e "SELECT 1+1 AS two"

-- OUTPUT:
-- two
-- 2`],
            ['Dump a schema with the shell utility (JS mode).',
                r`util.dumpSchemas(['school'], '/backup/school', {threads: 4})

-- OUTPUT: (summary)
-- Duration: 00:00:02s
-- Schemas dumped: 1
-- Tables dumped: 1`]],
        [['Python mode example.',
            r`\py
result = session.run_sql("SELECT COUNT(*) FROM school.students")
print(result.fetch_one()[0])

-- OUTPUT:
-- 2`],
            ['Check the cluster status (AdminAPI).',
                r`var c = dba.getCluster();
c.status()

-- OUTPUT: (trimmed)
-- { "clusterName": "prod", "defaultReplicaSet": { "status": "OK", "topology": {...} } }`]]
    ),

    'Connecting to MySQL & Basic CLI Commands': x(
        ['Connect with <code>mysql -u root -p</code> and type the password. Use <code>-h</code> for host and <code>-P</code> for port.',
            'Useful commands: <code>SHOW DATABASES;</code>, <code>USE db;</code>, <code>SHOW TABLES;</code>, <code>DESCRIBE t;</code>, <code>EXIT</code>.',
            'Every SQL statement ends with a semicolon.'],
        ['Run one statement without entering the shell: <code>mysql -u root -p -e "SELECT 1"</code>; run a script with <code>mysql -u root -p db &lt; file.sql</code>.',
            'Use <code>\\G</code> instead of <code>;</code> for vertical output of wide rows.',
            'Do not put the password on the command line (<code>-pPASSWORD</code>); it appears in history and process lists. Use a login path or option file.'],
        ['Use <code>mysql_config_editor</code> to store credentials securely (login paths) for scripts.',
            'Use dedicated, least-privilege accounts and TLS for remote connections.',
            'For application connections use JDBC/driver URLs with timeouts and TLS options, never root.'],
        [['F', 'How do you connect to MySQL from the command line?', '<code>mysql -u username -p</code> and enter the password; add <code>-h host</code> if remote.'],
            ['F', 'How do you exit?', '<code>EXIT;</code>, <code>QUIT;</code> or Ctrl+D.'],
            ['M', 'How do you run a .sql file?', '<code>mysql -u user -p dbname &lt; script.sql</code> or inside the shell <code>SOURCE script.sql;</code>.'],
            ['M', 'What does \\G do?', 'Ends the statement and prints each row vertically, useful for wide tables.'],
            ['S', 'How do you avoid passwords in scripts?', 'Use <code>mysql_config_editor</code> login paths, an option file with restricted permissions, or secrets from a vault.'],
            ['S', 'How do you troubleshoot "Access denied"?', 'Check user@host match, authentication plugin, password, grants, and whether the server resolves the host the way you expect (skip-name-resolve, IP vs hostname).']],
        [['Connect and show who you are.',
            r`mysql -u root -p
SELECT USER(), CURRENT_USER(), DATABASE();

-- OUTPUT: (example)
-- USER()         | CURRENT_USER() | DATABASE()
-- root@localhost | root@localhost | NULL`],
            ['Run a statement without opening the shell and print vertically.',
                r`mysql -u root -p -e "SELECT id, name FROM school.students WHERE id=1\G"

-- OUTPUT:
-- *************************** 1. row ***************************
--   id: 1
-- name: Asha`]],
        [['Run a script file.',
            r`mysql> SOURCE C:/scripts/seed.sql;

-- OUTPUT:
-- Query OK, 3 rows affected (0.01 sec)
-- Records: 3  Duplicates: 0  Warnings: 0`],
            ['Show connection details.',
                r`STATUS;

-- OUTPUT: (trimmed)
-- Connection id:   12
-- Current database: school
-- Connection:      localhost via TCP/IP
-- Server version:  8.0.36`]]
    ),

    'Creating Users': x(
        ['Create a user with <code>CREATE USER</code>, then give permissions with <code>GRANT</code>.',
            'A MySQL account is user plus host: <code>app@localhost</code> and <code>app@%</code> are different accounts.',
            'Never use root for applications.'],
        ['Grant only what is needed: <code>GRANT SELECT, INSERT, UPDATE ON shop.* TO ...</code>.',
            'Remember <code>FLUSH PRIVILEGES</code> is not needed after CREATE USER/GRANT; only after editing grant tables directly.',
            'Use <code>ALTER USER ... PASSWORD EXPIRE</code> and password policies for rotation.'],
        ['Authentication plugin matters: caching_sha2_password is the 8.0 default; older drivers may need mysql_native_password.',
            'Use roles to manage groups of privileges and reduce drift.',
            'Separate accounts for app, migrations (DDL), read-only reporting and admin.'],
        [['F', 'How do you create a user?', "<code>CREATE USER 'name'@'host' IDENTIFIED BY 'password';</code>"],
            ['F', 'What does @localhost mean?', 'The account can connect only from the same machine.'],
            ['M', 'Why separate accounts for migrations and the app?', 'The app needs DML only; DDL privileges are risky if the app is compromised.'],
            ['M', 'What is a role?', 'A named set of privileges that you grant to users, easing management.'],
            ['S', 'How do you rotate passwords without downtime?', 'MySQL 8 dual passwords: <code>ALTER USER ... IDENTIFIED BY new RETAIN CURRENT PASSWORD</code>, update apps, then <code>DISCARD OLD PASSWORD</code>.'],
            ['S', 'What makes a host pattern risky?', "<code>'%'</code> allows any host. Prefer specific IPs/subnets or private network rules."]],
        [['Create a read-only reporting user and verify.',
            r`CREATE USER 'report'@'localhost' IDENTIFIED BY 'R3port#1';
GRANT SELECT ON school.* TO 'report'@'localhost';
SHOW GRANTS FOR 'report'@'localhost';

-- OUTPUT:
-- GRANT USAGE ON *.* TO report@localhost
-- GRANT SELECT ON school.* TO report@localhost`],
            ['Try a forbidden write as that user.',
                r`-- connected as report@localhost
INSERT INTO school.students VALUES (9,'X');

-- OUTPUT:
-- ERROR 1142 (42000): INSERT command denied to user 'report'@'localhost' for table 'students'`]],
        [['Role-based setup.',
            r`CREATE ROLE 'reader';
GRANT SELECT ON school.* TO 'reader';
GRANT 'reader' TO 'report'@'localhost';
SET DEFAULT ROLE 'reader' TO 'report'@'localhost';

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['List users.',
                r`SELECT user, host, plugin FROM mysql.user WHERE user IN ('report','app');

-- OUTPUT: (example)
-- user   | host      | plugin
-- app    | localhost | caching_sha2_password
-- report | localhost | caching_sha2_password`]]
    ),

    'MySQL Configuration & Data Directory': x(
        ['MySQL reads settings from a config file (<code>my.cnf</code> / <code>my.ini</code>) when it starts.',
            'The data directory holds databases as folders and files; find it with <code>SHOW VARIABLES LIKE "datadir"</code>.',
            'Do not edit or delete files in the data directory while the server runs.'],
        ['Settings can be changed at runtime with <code>SET GLOBAL</code> (lost on restart) or persisted with <code>SET PERSIST</code> (8.0).',
            'Important settings: <code>innodb_buffer_pool_size</code>, <code>max_connections</code>, <code>character_set_server</code>, <code>log_bin</code>, <code>slow_query_log</code>.',
            'Config sections: <code>[mysqld]</code> for the server, <code>[client]</code> for clients.'],
        ['Size the buffer pool to roughly 60-75% of RAM on a dedicated host; too large swaps, too small causes disk reads.',
            'Keep config in version control; use <code>performance_schema.variables_info</code> to see where each value came from.',
            'Put data, redo logs and binlogs on fast, separate, monitored storage with free-space alerts.'],
        [['F', 'Where does MySQL store data?', 'In the data directory (<code>datadir</code>).'],
            ['F', 'What is my.cnf?', 'The MySQL configuration file read at startup.'],
            ['M', 'Difference between SET GLOBAL and SET PERSIST?', 'SET GLOBAL changes the value until restart; SET PERSIST also writes it to <code>mysqld-auto.cnf</code> so it survives restarts.'],
            ['M', 'Which setting matters most for InnoDB performance?', '<code>innodb_buffer_pool_size</code>.'],
            ['S', 'How do you find where a setting came from?', 'Query <code>performance_schema.variables_info</code> (set_by: COMMAND_LINE, CONFIG, PERSISTED).'],
            ['S', 'What happens if the data disk fills?', 'Writes fail, transactions stall and the server can stop. Monitor space, rotate binlogs, and keep headroom for temporary tables and backups.']],
        [['Show important server settings.',
            r`SHOW VARIABLES WHERE Variable_name IN ('innodb_buffer_pool_size','max_connections','datadir');

-- OUTPUT: (example)
-- innodb_buffer_pool_size | 134217728
-- max_connections         | 151
-- datadir                 | C:\ProgramData\MySQL\MySQL Server 8.0\Data`],
            ['Change a setting and persist it.',
                r`SET PERSIST max_connections = 300;
SELECT @@max_connections;

-- OUTPUT:
-- @@max_connections
-- 300`]],
        [['A minimal config file.',
            r`[mysqld]
character-set-server = utf8mb4
innodb_buffer_pool_size = 2G
slow_query_log = 1
long_query_time = 1

-- OUTPUT: (after restart)
-- SHOW VARIABLES LIKE 'slow_query_log'; => ON`],
            ['See where each variable came from.',
                r`SELECT variable_name, variable_source FROM performance_schema.variables_info
WHERE variable_name IN ('max_connections','slow_query_log');

-- OUTPUT: (example)
-- max_connections | PERSISTED
-- slow_query_log  | CONFIG`]]
    ),

    'Starting & Stopping the MySQL Service': x(
        ['On Windows use Services (<code>services.msc</code>) or <code>net start MySQL80</code> / <code>net stop MySQL80</code>.',
            'On Linux use <code>sudo systemctl start|stop|restart mysql</code> (service name may be <code>mysqld</code>).',
            'Check state with <code>systemctl status mysql</code> or by trying to connect.'],
        ['Prefer a clean shutdown (<code>SHUTDOWN</code> or the service stop) so InnoDB flushes and no crash recovery is needed.',
            'If the server will not start, read the error log first.',
            '<code>mysqld --initialize</code> creates a new data directory; do not run it on an existing one.'],
        ['<code>innodb_fast_shutdown=0</code> before major upgrades forces a full purge and change-buffer merge for a cleaner upgrade.',
            'Rolling restarts of replicas, then switchover of the primary, minimise downtime.',
            'Watch for long transactions before maintenance; shutdown waits for them to finish or roll back.'],
        [['F', 'How do you start MySQL on Windows?', '<code>net start MySQL80</code> or via Services.'],
            ['F', 'How do you stop MySQL on Linux?', '<code>sudo systemctl stop mysql</code>.'],
            ['M', 'Where do you look if MySQL fails to start?', 'The error log (path from <code>SHOW VARIABLES LIKE "log_error"</code>), plus <code>journalctl -u mysql</code>.'],
            ['M', 'What is a clean vs crash shutdown?', 'Clean flushes dirty pages and checkpoints, so restart is fast. A crash requires redo-log recovery at startup.'],
            ['S', 'How do you restart a replicated primary with minimal impact?', 'Restart replicas first, promote one (switchover), then restart the old primary as a replica.'],
            ['S', 'Why set innodb_fast_shutdown=0 before an upgrade?', 'It makes shutdown complete all purge and change-buffer merges, so the new version starts with clean data files.']],
        [['Stop and start the service (Windows PowerShell).',
            r`net stop MySQL80
net start MySQL80

-- OUTPUT:
-- The MySQL80 service was stopped successfully.
-- The MySQL80 service was started successfully.`],
            ['Shut down from SQL.',
                r`SHUTDOWN;

-- OUTPUT:
-- Query OK, 0 rows affected  (server stops; client loses connection)`]],
        [['Find the error log location.',
            r`SHOW VARIABLES LIKE 'log_error';

-- OUTPUT: (example)
-- Variable_name | Value
-- log_error     | C:\ProgramData\MySQL\MySQL Server 8.0\Data\HOST.err`],
            ['Confirm uptime after restart.',
                r`SHOW GLOBAL STATUS LIKE 'Uptime';

-- OUTPUT: (example)
-- Uptime | 12`]]
    ),

    'Database Operations: CREATE, SHOW, USE & DROP': x(
        ['<code>CREATE DATABASE name;</code> makes a database; <code>SHOW DATABASES;</code> lists them; <code>USE name;</code> selects one; <code>DROP DATABASE name;</code> deletes it with everything inside.',
            'Add <code>IF NOT EXISTS</code> / <code>IF EXISTS</code> so scripts can be re-run.',
            'DROP is permanent. There is no undo unless you have a backup.'],
        ['Set charset and collation at creation: <code>CREATE DATABASE app CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;</code>.',
            'Use <code>SELECT DATABASE();</code> to confirm the current database before running DML.',
            'Grant privileges per database to limit damage.'],
        ['Avoid giving applications <code>DROP</code> on production schemas.',
            'In migrations, never rely on <code>DROP DATABASE</code> for resets outside test environments; guard with environment checks.',
            'Case sensitivity of database names depends on OS and <code>lower_case_table_names</code>; set it at initialization and keep it consistent across environments.'],
        [['F', 'How do you create and delete a database?', '<code>CREATE DATABASE x;</code> and <code>DROP DATABASE x;</code>.'],
            ['F', 'What does USE do?', 'Selects the default database for subsequent statements.'],
            ['M', 'What does IF NOT EXISTS do?', 'Skips creation without an error when the database already exists.'],
            ['M', 'How do you choose a charset?', 'Use utf8mb4 for full Unicode; pick a collation per language and case-sensitivity requirements.'],
            ['S', 'Why can database names differ in case across servers?', 'On Linux names are case sensitive, on Windows not, controlled by <code>lower_case_table_names</code>. Mismatches break deployments; standardize on lowercase.'],
            ['S', 'How do you prevent accidental DROP DATABASE in prod?', 'Least-privilege accounts, separate admin credentials, change approval, backups with tested restore and protection tools or cloud deletion protection.']],
        [['Create a database with utf8mb4, use it and show the definition.',
            r`CREATE DATABASE IF NOT EXISTS shop CHARACTER SET utf8mb4;
USE shop;
SHOW CREATE DATABASE shop;

-- OUTPUT:
-- Database | Create Database
-- shop     | CREATE DATABASE shop /*!40100 DEFAULT CHARACTER SET utf8mb4 */`],
            ['Drop it safely.',
                r`DROP DATABASE IF EXISTS shop;
SHOW DATABASES LIKE 'shop';

-- OUTPUT:
-- Empty set (0.00 sec)`]],
        [['Idempotent setup script.',
            r`DROP DATABASE IF EXISTS demo;
CREATE DATABASE demo;
USE demo;
SELECT DATABASE();

-- OUTPUT:
-- DATABASE()
-- demo`],
            ['Pattern search of databases.',
                r`SHOW DATABASES LIKE 'd%';

-- OUTPUT:
-- Database (d%)
-- demo`]]
    ),

    'Table Operations: CREATE, SHOW & DESCRIBE': x(
        ['<code>CREATE TABLE</code> defines columns and types; <code>SHOW TABLES</code> lists tables; <code>DESCRIBE t</code> shows columns.',
            'Always add a primary key. <code>AUTO_INCREMENT</code> generates ids.',
            '<code>SHOW CREATE TABLE t</code> prints the exact DDL.'],
        ['Specify <code>ENGINE=InnoDB</code> (default) and a charset explicitly in important scripts.',
            'Create tables from queries with <code>CREATE TABLE new AS SELECT ...</code> (no keys copied) or <code>CREATE TABLE new LIKE old</code> (structure and indexes).',
            'Use meaningful constraints at creation: NOT NULL, DEFAULT, UNIQUE, CHECK.'],
        ['Think about indexes at table creation; adding them on a big table later is slower and riskier.',
            'Choose types for the long run: INT overflow at 2.1 billion has taken down real systems; use BIGINT where growth is plausible.',
            'Add audit columns (created_at, updated_at) and consider soft delete, tenant id and optimistic-lock version where relevant.'],
        [['F', 'How do you create a table?', '<code>CREATE TABLE t (id INT PRIMARY KEY, name VARCHAR(50));</code>'],
            ['F', 'How do you see a table structure?', '<code>DESCRIBE t;</code> or <code>SHOW CREATE TABLE t;</code>'],
            ['M', 'Difference between CREATE TABLE ... LIKE and ... AS SELECT?', 'LIKE copies structure and indexes with no data; AS SELECT copies data (and types) but no indexes or constraints.'],
            ['M', 'What does AUTO_INCREMENT do?', 'Generates the next integer automatically for new rows; gaps can occur after rollbacks or failed inserts.'],
            ['S', 'How do you avoid running out of ids?', 'Use BIGINT (UNSIGNED where needed), monitor the max value, and plan the migration before reaching about 70%.'],
            ['S', 'Which audit columns do you add to every table?', 'created_at, updated_at (ON UPDATE CURRENT_TIMESTAMP), often created_by/updated_by and a version column for optimistic locking.']],
        [['Create <code>employees</code> with audit columns and describe it.',
            r`CREATE TABLE employees (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(60) NOT NULL,
  salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
DESCRIBE employees;

-- OUTPUT: (trimmed)
-- Field | Type          | Null | Key | Default
-- id    | bigint        | NO   | PRI | NULL
-- name  | varchar(60)   | NO   |     | NULL
-- salary| decimal(10,2) | NO   |     | 0.00`],
            ['Clone the structure into a backup table.',
                r`CREATE TABLE employees_copy LIKE employees;
SHOW TABLES LIKE 'employees%';

-- OUTPUT:
-- Tables_in_demo (employees%)
-- employees
-- employees_copy`]],
        [['updated_at changes automatically.',
            r`INSERT INTO employees (name, salary) VALUES ('Asha', 50000);
UPDATE employees SET salary = 55000 WHERE name = 'Asha';
SELECT name, created_at <> updated_at AS changed FROM employees;

-- OUTPUT: (if a second passed)
-- name | changed
-- Asha |       1`],
            ['See the next auto-increment value.',
                r`SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='employees';

-- OUTPUT:
-- AUTO_INCREMENT
-- 2`]]
    ),

    'ALTER TABLE': x(
        ['<code>ALTER TABLE</code> changes an existing table: add, modify or drop columns, add indexes and constraints, rename.',
            'Example: <code>ALTER TABLE employees ADD COLUMN email VARCHAR(100);</code>',
            'Back up or test first; some changes rebuild the whole table.'],
        ['Use <code>ADD COLUMN ... AFTER col</code> to place columns, <code>MODIFY</code> to change a type, <code>CHANGE</code> to rename and retype, <code>DROP COLUMN</code> to remove.',
            'Specify <code>ALGORITHM=INPLACE, LOCK=NONE</code> (or INSTANT) so MySQL fails instead of blocking if the change is not online.',
            'Adding a NOT NULL column to a populated table needs a DEFAULT.'],
        ['Large-table changes: check online DDL support, run during low traffic, monitor replication lag, or use gh-ost / pt-online-schema-change.',
            '<code>ALGORITHM=INSTANT</code> (8.0) adds columns without rebuilding, but only for supported operations.',
            'Follow expand-contract: add new, dual-write, backfill, switch reads, then drop old in a later release.'],
        [['F', 'How do you add a column?', '<code>ALTER TABLE t ADD COLUMN c INT;</code>'],
            ['F', 'How do you delete a column?', '<code>ALTER TABLE t DROP COLUMN c;</code>'],
            ['M', 'Difference between MODIFY and CHANGE?', 'MODIFY changes the definition; CHANGE can also rename the column (needs old and new name).'],
            ['M', 'Why can ALTER TABLE be dangerous on big tables?', 'It may copy the table, block writes and lag replicas. Check algorithm and lock options.'],
            ['S', 'What is ALGORITHM=INSTANT?', 'A metadata-only change (such as adding a column at the end) that completes immediately without rebuilding data.'],
            ['S', 'How do you change a column type with zero downtime?', 'Add a new column, dual write in the app, backfill in batches, switch reads, then drop the old column; or use an online schema-change tool.']],
        [['Add, modify and drop a column.',
            r`ALTER TABLE employees ADD COLUMN email VARCHAR(80) AFTER name;
ALTER TABLE employees MODIFY email VARCHAR(120) NOT NULL DEFAULT '';
ALTER TABLE employees DROP COLUMN email;

-- OUTPUT:
-- Query OK, 0 rows affected
-- Query OK, 0 rows affected
-- Query OK, 0 rows affected`],
            ['Add an index and a unique constraint.',
                r`ALTER TABLE employees ADD INDEX idx_name (name);
ALTER TABLE employees ADD CONSTRAINT uq_emp UNIQUE (name, salary);
SHOW INDEX FROM employees;

-- OUTPUT: (trimmed)
-- Key_name | Column_name
-- PRIMARY  | id
-- idx_name | name
-- uq_emp   | name
-- uq_emp   | salary`]],
        [['Fail fast if the change is not online.',
            r`ALTER TABLE employees ADD COLUMN dept INT, ALGORITHM=INSTANT;

-- OUTPUT:
-- Query OK, 0 rows affected (0.02 sec)`],
            ['Rename a column and a table.',
                r`ALTER TABLE employees RENAME COLUMN name TO full_name;
ALTER TABLE employees RENAME TO staff;
SHOW TABLES LIKE 'staff';

-- OUTPUT:
-- Tables_in_demo (staff)
-- staff`]]
    ),

    'DROP, TRUNCATE & RENAME': x(
        ['<code>DROP TABLE</code> removes the table and its data. <code>TRUNCATE TABLE</code> removes all rows but keeps the table. <code>RENAME TABLE</code> changes the name.',
            'TRUNCATE is faster than DELETE for emptying a table and resets AUTO_INCREMENT.',
            'DROP and TRUNCATE cannot be rolled back (DDL auto-commits).'],
        ['DELETE removes selected rows, can use WHERE and can be rolled back; TRUNCATE removes all rows, is DDL, and fires no delete triggers.',
            'TRUNCATE is blocked on tables referenced by foreign keys (unless checks are disabled).',
            '<code>RENAME TABLE a TO b, c TO a</code> swaps names atomically, useful for table swaps.'],
        ['The atomic rename swap pattern: build <code>new</code>, then <code>RENAME TABLE live TO old, new TO live</code> for near-instant cutover.',
            'DROP on a very large table can stall the server (buffer pool and file removal); move or truncate data in chunks and drop during quiet periods.',
            'Protect production with permissions, safe-delete workflows (rename to <code>_deleted</code> first, drop after a retention period).'],
        [['F', 'Difference between DELETE, TRUNCATE and DROP?', 'DELETE removes chosen rows (rollback possible); TRUNCATE removes all rows quickly and resets auto-increment; DROP removes the whole table.'],
            ['F', 'How do you rename a table?', '<code>RENAME TABLE old TO new;</code> or <code>ALTER TABLE old RENAME TO new;</code>.'],
            ['M', 'Can TRUNCATE be rolled back?', 'No, it is DDL and causes an implicit commit.'],
            ['M', 'Why does TRUNCATE fail with a foreign key?', 'Because child tables reference the table; truncate would bypass FK checks, so it is refused unless FK checks are disabled.'],
            ['S', 'How do you swap a table in production atomically?', '<code>RENAME TABLE live TO live_old, live_new TO live;</code> executes as one atomic operation.'],
            ['S', 'Safer alternative to dropping a table in prod?', 'Rename it with a suffix, wait through a retention window, then drop after confirming nothing uses it.']],
        [['Compare DELETE and TRUNCATE on auto-increment.',
            r`CREATE TABLE t (id INT PRIMARY KEY AUTO_INCREMENT, v INT);
INSERT INTO t (v) VALUES (1),(2);
DELETE FROM t;
INSERT INTO t (v) VALUES (3);
SELECT id FROM t;
TRUNCATE TABLE t;
INSERT INTO t (v) VALUES (4);
SELECT id FROM t;

-- OUTPUT:
-- id
-- 3
-- id
-- 1`],
            ['Rename a table and verify.',
                r`RENAME TABLE t TO t_old;
SHOW TABLES LIKE 't%';

-- OUTPUT:
-- Tables_in_demo (t%)
-- t_old`]],
        [['Atomic table swap.',
            r`CREATE TABLE prices_new LIKE prices;
-- load prices_new ...
RENAME TABLE prices TO prices_old, prices_new TO prices;

-- OUTPUT:
-- Query OK, 0 rows affected`],
            ['DELETE can roll back but TRUNCATE cannot.',
                r`START TRANSACTION; DELETE FROM t_old; ROLLBACK;
SELECT COUNT(*) FROM t_old;
START TRANSACTION; TRUNCATE TABLE t_old; ROLLBACK;
SELECT COUNT(*) FROM t_old;

-- OUTPUT:
-- COUNT(*)
-- 1
-- COUNT(*)
-- 0`]]
    )
};
