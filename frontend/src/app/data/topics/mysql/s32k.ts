// Module 32 (User Management & Security): deep dives.
// Note: SHOW GRANTS prints identifiers wrapped in backticks; outputs below are shown without them.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s32k: Record<string, DeepDive> = {
    'CREATE, ALTER & DROP USER': dd(
        [`In MySQL an account is the pair <b>'user'@'host'</b>: the same name from a different host is a different account. <code>CREATE USER</code> makes it (with an authentication plugin, default <code>caching_sha2_password</code> in 8.0), <code>ALTER USER</code> changes password, lock state, limits and TLS rules, and <code>DROP USER</code> removes it with all its privileges.`,
            r`CREATE USER 'app'@'10.0.%'                       -- may connect only from 10.0.x.x
  IDENTIFIED BY 'S3cret!passw0rd'
  PASSWORD EXPIRE INTERVAL 90 DAY                 -- force rotation every 90 days
  FAILED_LOGIN_ATTEMPTS 5 PASSWORD_LOCK_TIME 1;   -- lock 1 day after 5 bad logins (8.0.19+)

SELECT user, host, plugin, password_expired, account_locked
FROM   mysql.user WHERE user = 'app';

-- OUTPUT:
-- +------+--------+-----------------------+------------------+----------------+
-- | user | host   | plugin                | password_expired | account_locked |
-- +------+--------+-----------------------+------------------+----------------+
-- | app  | 10.0.% | caching_sha2_password | N                | N              |
-- +------+--------+-----------------------+------------------+----------------+`],
        [`Every client must be identifiable so that privileges, audit trails and limits are per person or per application, not shared. Because the host is part of the identity, you can allow an account only from the application subnet and keep it useless from anywhere else.`,
            r`CREATE USER 'baji'@'localhost' IDENTIFIED BY 'Baji!Pass12345';
CREATE USER 'baji'@'%'         IDENTIFIED BY 'Other!Pass12345';   -- a different account!

-- Run after connecting as baji:
SELECT USER() AS asked_as, CURRENT_USER() AS matched_account;

-- OUTPUT (example, connecting from another machine):
-- +----------------+-----------------+
-- | asked_as       | matched_account |
-- +----------------+-----------------+
-- | baji@10.0.3.17  | baji@%           |
-- +----------------+-----------------+`],
        [`Real use: joiner/leaver processes and service accounts. A new service gets its own account with a connection cap and mandatory TLS. A leaver is locked first (reversible) and dropped later.`,
            r`ALTER USER 'app'@'10.0.%'
  REQUIRE SSL                                     -- refuse unencrypted connections
  WITH MAX_USER_CONNECTIONS 20;                   -- cap parallel sessions

SELECT user, host, ssl_type, max_user_connections
FROM   mysql.user WHERE user = 'app';

-- OUTPUT:
-- +------+--------+----------+----------------------+
-- | user | host   | ssl_type | max_user_connections |
-- +------+--------+----------+----------------------+
-- | app  | 10.0.% | ANY      |                   20 |
-- +------+--------+----------+----------------------+`],
        [`<b>Advantages:</b> per-account password policy, expiry, lockout, resource limits and TLS requirements are declarative SQL; <code>ACCOUNT LOCK</code> disables an account while keeping its grants, and <code>RENAME USER</code> moves privileges with it.`,
            r`ALTER USER 'app'@'10.0.%' ACCOUNT LOCK;         -- offboarding step 1: reversible
-- A login attempt now fails:

-- OUTPUT:
-- ERROR 3118 (HY000): Access denied for user 'app'@'10.0.0.5'. Account is locked.`],
        [`<b>Disadvantages:</b> dropping a user does not end its open sessions (they keep running until they disconnect or are killed), and objects whose <code>DEFINER</code> was that user (views, routines, triggers, events) fail afterwards.`,
            r`CREATE USER 'etl'@'%' IDENTIFIED BY 'Etl!Pass1234567';
CREATE DEFINER = 'etl'@'%' VIEW v_one AS SELECT 1 AS x;      -- defined by etl
DROP USER 'etl'@'%';
SELECT * FROM v_one;

-- OUTPUT:
-- ERROR 1449 (HY000): The user specified as a definer ('etl'@'%') does not exist`],
        [`<b>Limitations:</b> user names are at most 32 characters, hosts at most 255; account matching uses the most specific host first (so a stray anonymous or wildcard account can shadow what you expect); and password complexity is enforced only if the <code>validate_password</code> component is installed.`,
            r`CREATE USER 'weak'@'%' IDENTIFIED BY 'abc';       -- with validate_password enabled

-- OUTPUT:
-- ERROR 1819 (HY000): Your password does not satisfy the current policy requirements`],
        `
   client connects as  baji  from 10.0.3.17
        |
        v   mysql.user  (sorted: most specific host first)
   +-----------------+-----------------------------+
   | 'baji'@'10.0.3.%'| plugin, password, TLS, limit|   <- matched first if present
   | 'baji'@'%'       |                             |
   +-----------------+-----------------------------+
        |
        v   authenticate (caching_sha2_password) + lock/expiry checks
        v
   session with CURRENT_USER() = matched account  --> privileges apply
`,
        `Create one account per application and per human administrator, restrict hosts, require TLS, and set expiry and lockout policies. Prefer ACCOUNT LOCK before DROP USER, check for DEFINER dependencies before dropping, and kill remaining sessions. For large organisations delegate authentication to LDAP/SSO plugins or a secrets manager that rotates credentials, instead of long-lived static passwords.`
    ),

    'GRANT, REVOKE & SHOW GRANTS': dd(
        [`<code>GRANT</code> gives privileges to an account at a chosen scope: global (<code>*.*</code>), a database (<code>db.*</code>), a table (<code>db.tbl</code>), specific columns, or a routine. <code>REVOKE</code> removes them, and <code>SHOW GRANTS FOR</code> displays what an account has. In MySQL 8 the user must already exist (GRANT no longer creates users).`,
            r`CREATE DATABASE shop;
CREATE TABLE shop.customers (id INT PRIMARY KEY, name VARCHAR(50), card_no VARCHAR(20));
CREATE USER 'app'@'%' IDENTIFIED BY 'App!Pass123456';

GRANT SELECT, INSERT, UPDATE ON shop.* TO 'app'@'%';     -- database scope
SHOW GRANTS FOR 'app'@'%';

-- OUTPUT (identifiers shown without backticks):
-- +----------------------------------------------------------+
-- | Grants for app@%                                         |
-- +----------------------------------------------------------+
-- | GRANT USAGE ON *.* TO 'app'@'%'                          |
-- | GRANT SELECT, INSERT, UPDATE ON shop.* TO 'app'@'%'      |
-- +----------------------------------------------------------+`],
        [`Authentication says who you are; <b>authorisation</b> says what you may do. Without GRANT a new account can do nothing except log in (USAGE). Narrow grants limit the damage of a bug, a leaked password or an injection attack.`,
            r`-- A reporting user may see names but never card numbers: column-level grant
CREATE USER 'report'@'%' IDENTIFIED BY 'Rep!Pass1234567';
GRANT SELECT (id, name) ON shop.customers TO 'report'@'%';

-- Connected as report:
SELECT id, name FROM shop.customers;
SELECT card_no FROM shop.customers;

-- OUTPUT:
-- Empty set (0.00 sec)
-- ERROR 1143 (42000): SELECT command denied to user 'report'@'localhost'
--   for column 'card_no' in table 'customers'`],
        [`Real use: changing duties. When a team gains write access to one table, grant just that; when a project ends, revoke it. Auditors ask "who can do what", answered by SHOW GRANTS and the privilege tables.`,
            r`REVOKE UPDATE ON shop.* FROM 'app'@'%';                -- tighten later
GRANT  SELECT ON shop.customers TO 'report'@'%' WITH GRANT OPTION;   -- may pass it on

SELECT grantee, table_schema, privilege_type
FROM   information_schema.schema_privileges
WHERE  grantee = '''app''@''%'''
ORDER  BY privilege_type;

-- OUTPUT:
-- +---------+--------------+----------------+
-- | GRANTEE | TABLE_SCHEMA | PRIVILEGE_TYPE |
-- +---------+--------------+----------------+
-- | 'app'@'%' | shop       | INSERT         |
-- | 'app'@'%' | shop       | SELECT         |
-- +---------+--------------+----------------+`],
        [`<b>Advantages:</b> fine-grained (column, table, database, routine), changes by GRANT and REVOKE take effect without restarting the server, and SHOW GRANTS gives a precise, copyable audit.`,
            r`SHOW GRANTS FOR 'report'@'%';

-- OUTPUT (identifiers shown without backticks):
-- +-----------------------------------------------------------------------------+
-- | Grants for report@%                                                         |
-- +-----------------------------------------------------------------------------+
-- | GRANT USAGE ON *.* TO 'report'@'%'                                          |
-- | GRANT SELECT ON shop.customers TO 'report'@'%' WITH GRANT OPTION           |
-- | GRANT SELECT (id, name) ON shop.customers TO 'report'@'%'                  |
-- +-----------------------------------------------------------------------------+`],
        [`<b>Disadvantages:</b> broad grants are easy to write and hard to undo (<code>GRANT ALL ON *.*</code> makes an account a de facto administrator), and privileges cached by existing sessions may apply only from the next connection or <code>USE</code>.`,
            r`GRANT ALL PRIVILEGES ON *.* TO 'app'@'%';          -- dangerous: global, every privilege
SHOW GRANTS FOR 'app'@'%';

-- OUTPUT (shortened):
-- | GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, RELOAD, SHUTDOWN, PROCESS,
--   FILE, GRANT OPTION, SUPER, ... ON *.* TO 'app'@'%' |
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'app'@'%';   -- undo it`],
        [`<b>Limitations:</b> you cannot carve an exception out of a broader grant: revoking one table when the grant is on <code>shop.*</code> fails (MySQL 8.0.16+ has <i>partial revokes</i> only for global grants when <code>partial_revokes</code> is ON). GRANT also cannot create users in MySQL 8 and there are no row-level privileges.`,
            r`GRANT SELECT ON shop.* TO 'app'@'%';
REVOKE SELECT ON shop.customers FROM 'app'@'%';           -- grant was at database level
GRANT SELECT ON shop.customers TO 'ghost'@'%';            -- user does not exist

-- OUTPUT:
-- ERROR 1147 (42000): There is no such grant defined for user 'app' on host '%'
--   on table 'customers'
-- ERROR 1410 (42000): You are not allowed to create a user with GRANT`],
        `
   scope (widest -> narrowest)            example
   global        *.*                      GRANT SUPER ON *.* ...        (admin)
   database      shop.*                   GRANT SELECT, INSERT ON shop.*
   table         shop.customers           GRANT SELECT ON shop.customers
   column        (id, name)               GRANT SELECT (id, name) ON ...
   routine       PROCEDURE shop.p         GRANT EXECUTE ON PROCEDURE ...

   access check =  global OR database OR table OR column privilege (union)
   REVOKE removes exactly what was granted at that scope, nothing more
`,
        `Grant at the narrowest scope that works and avoid ON *.* for anything but DBAs. Store grants as versioned migration scripts (or role definitions) rather than ad-hoc commands, and review SHOW GRANTS periodically. When you need row-level or column masking, put a view with SQL SECURITY DEFINER in front and grant access only to the view.`
    ),

    'Roles & Privileges': dd(
        [`A <b>role</b> is a named bundle of privileges. You create roles, grant privileges to the role, then grant the role to many users. Changing the role's privileges changes every member at once. Roles exist from MySQL 8.0.`,
            r`CREATE ROLE 'r_read', 'r_write';
GRANT SELECT                ON shop.* TO 'r_read';
GRANT INSERT, UPDATE, DELETE ON shop.* TO 'r_write';

CREATE USER 'ann'@'%' IDENTIFIED BY 'Ann!Pass1234567';
GRANT 'r_read', 'r_write' TO 'ann'@'%';              -- membership
SHOW GRANTS FOR 'ann'@'%';

-- OUTPUT (identifiers shown without backticks):
-- +------------------------------------------------+
-- | Grants for ann@%                               |
-- +------------------------------------------------+
-- | GRANT USAGE ON *.* TO 'ann'@'%'                |
-- | GRANT 'r_read'@'%','r_write'@'%' TO 'ann'@'%'  |
-- +------------------------------------------------+`],
        [`Granting privileges user by user does not scale: 50 analysts means 50 identical GRANT lists that drift apart. Roles model job functions (analyst, support, developer), so onboarding is one statement and audits are readable.`,
            r`SHOW GRANTS FOR 'ann'@'%' USING 'r_read', 'r_write';     -- expand what the roles give

-- OUTPUT (identifiers shown without backticks):
-- +-----------------------------------------------------------------+
-- | Grants for ann@%                                                |
-- +-----------------------------------------------------------------+
-- | GRANT USAGE ON *.* TO 'ann'@'%'                                 |
-- | GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'ann'@'%'     |
-- | GRANT 'r_read'@'%','r_write'@'%' TO 'ann'@'%'                   |
-- +-----------------------------------------------------------------+`],
        [`Real use: roles per team, activated by default for members, with a server-wide <code>mandatory_roles</code> setting for baseline access. A user can also switch roles for the current session.`,
            r`SET DEFAULT ROLE ALL TO 'ann'@'%';       -- activate granted roles at every login

-- After ann logs in:
SELECT CURRENT_ROLE() AS active_roles;
SET ROLE 'r_read';                          -- narrow down for this session
SELECT CURRENT_ROLE() AS active_roles;

-- OUTPUT (identifiers shown without backticks):
-- +-------------------------+
-- | active_roles            |
-- +-------------------------+
-- | r_read@%,r_write@%      |
-- +-------------------------+
-- +--------------+
-- | active_roles |
-- +--------------+
-- | r_read@%     |
-- +--------------+`],
        [`<b>Advantages:</b> central maintenance, least-privilege sessions (activate only what you need), clearer audits, and a role can include other roles to build a hierarchy.`,
            r`CREATE ROLE 'r_admin';
GRANT 'r_read', 'r_write' TO 'r_admin';              -- role of roles
GRANT CREATE, DROP ON shop.* TO 'r_admin';
GRANT 'r_admin' TO 'dba1'@'%';

-- OUTPUT:
-- Query OK, 0 rows affected (0.01 sec)`],
        [`<b>Disadvantages:</b> a granted role is <i>not active</i> until it is made a default role or the user runs <code>SET ROLE</code>. Users who forget this see confusing "access denied" errors right after being granted a role.`,
            r`CREATE USER 'bea'@'%' IDENTIFIED BY 'Bea!Pass1234567';
GRANT 'r_read' TO 'bea'@'%';                          -- granted, but not a default role

-- Connected as bea:
SELECT COUNT(*) FROM shop.customers;

-- OUTPUT (example):
-- ERROR 1142 (42000): SELECT command denied to user 'bea'@'localhost'
--   for table 'customers'`],
        [`<b>Limitations:</b> roles are stored as locked accounts that cannot log in; role names share the user namespace (each is 'name'@'host', host defaults to %); and privileges of a role granted <i>after</i> a session started appear only after <code>SET ROLE</code> or reconnect.`,
            r`-- Trying to log in as a role
-- mysql -u r_read -p

-- OUTPUT (example):
-- ERROR 3118 (HY000): Access denied for user 'r_read'@'localhost'. Account is locked.`],
        `
   privileges --GRANT--> role  --GRANT--> user
                                 ^
   r_read  (SELECT)       ---+   |
   r_write (INSERT,...)   ---+---+--> ann   default roles active at login
   r_admin (r_read, r_write, DDL) ---> dba1
                     |
   SET ROLE / SET DEFAULT ROLE decides what is ACTIVE in the session
`,
        `Define roles by job function, grant privileges only to roles, and attach roles to users; never mix direct grants and role grants for the same duty. Set default roles explicitly (or activate_all_roles_on_login) and document the choice, and use mandatory_roles for the baseline. Keep an admin role separate from day-to-day roles so privileged power is activated deliberately.`
    ),

    'Least Privilege & Application Users': dd(
        [`<b>Least privilege</b> means every account gets only the rights its job requires and nothing more. For applications that typically means separate accounts for runtime (DML only), reporting (read only), and schema migration (DDL), never the root account.`,
            r`CREATE USER 'shop_app'@'10.0.%' IDENTIFIED BY 'App!Runtime12345';   -- runtime
CREATE USER 'shop_ro'@'10.0.%'  IDENTIFIED BY 'Ro!Report1234567';     -- reports
CREATE USER 'shop_mig'@'10.0.1.%' IDENTIFIED BY 'Mig!Deploy123456';   -- migrations only

GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'shop_app'@'10.0.%';
GRANT SELECT                         ON shop.* TO 'shop_ro'@'10.0.%';
GRANT ALL PRIVILEGES                 ON shop.* TO 'shop_mig'@'10.0.1.%';   -- one schema only

SHOW GRANTS FOR 'shop_app'@'10.0.%';

-- OUTPUT (identifiers shown without backticks):
-- +--------------------------------------------------------------------------+
-- | Grants for shop_app@10.0.%                                               |
-- +--------------------------------------------------------------------------+
-- | GRANT USAGE ON *.* TO 'shop_app'@'10.0.%'                                |
-- | GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'shop_app'@'10.0.%'    |
-- +--------------------------------------------------------------------------+`],
        [`Applications get compromised (SQL injection, leaked config, a vulnerable library). The database account is the last line of defence: with DML-only rights an attacker cannot DROP tables, read other schemas, load files or create new users.`,
            r`-- Connected as shop_app: the damage an injected statement can do is limited
DROP TABLE shop.customers;
SELECT * FROM mysql.user;
SELECT LOAD_FILE('/etc/passwd');

-- OUTPUT:
-- ERROR 1142 (42000): DROP command denied to user 'shop_app'@'10.0.0.5' for table 'customers'
-- ERROR 1142 (42000): SELECT command denied to user 'shop_app'@'10.0.0.5' for table 'user'
-- +-----------------------+
-- | LOAD_FILE('/etc/passwd') |
-- +-----------------------+
-- | NULL                  |
-- +-----------------------+`],
        [`Real use: the connection string for each service uses its own account, and credentials come from a secrets store. Passwords are rotated without downtime using <b>dual passwords</b> (8.0.14+): the old password keeps working until the fleet has the new one.`,
            r`# application.properties (credentials injected from a secret store, not committed)
# spring.datasource.url=jdbc:mysql://db.internal:3306/shop?sslMode=VERIFY_IDENTITY
# spring.datasource.username=shop_app
# spring.datasource.password=<injected at runtime>

-- Zero-downtime rotation
ALTER USER 'shop_app'@'10.0.%' IDENTIFIED BY 'New!Runtime98765' RETAIN CURRENT PASSWORD;
-- ... roll out the new secret to all instances ...
ALTER USER 'shop_app'@'10.0.%' DISCARD OLD PASSWORD;

-- OUTPUT:
-- Query OK, 0 rows affected (0.01 sec)
-- Query OK, 0 rows affected (0.01 sec)`],
        [`<b>Advantages:</b> smaller blast radius, clear accountability per service, safe reporting access for analysts, and views let you expose only selected columns without any row-level feature in the server.`,
            r`CREATE VIEW shop.v_customer_public
  SQL SECURITY DEFINER AS SELECT id, name FROM shop.customers;   -- hides card_no
GRANT SELECT ON shop.v_customer_public TO 'shop_ro'@'10.0.%';

-- Connected as shop_ro:
SELECT * FROM shop.v_customer_public LIMIT 1;
SELECT card_no FROM shop.customers;

-- OUTPUT (example):
-- +----+-------+
-- | id | name  |
-- +----+-------+
-- |  1 | Abaji |
-- +----+-------+
-- ERROR 1142 (42000): SELECT command denied to user 'shop_ro'@'10.0.0.8' for table 'customers'`],
        [`<b>Disadvantages:</b> more accounts and grants to manage, more places for a wrong host pattern to lock out a service, and migrations that must run under a separate, more powerful account complicate deployment pipelines.`,
            r`-- The runtime account cannot run a schema change - by design
-- Connected as shop_app:
ALTER TABLE shop.customers ADD COLUMN email VARCHAR(100);

-- OUTPUT:
-- ERROR 1142 (42000): ALTER command denied to user 'shop_app'@'10.0.0.5' for table 'customers'`],
        [`<b>Limitations:</b> MySQL has no row-level security, so tenant isolation must be done with views, separate schemas or application logic; privileges alone cannot limit a user to certain rows. Also, privilege names like FILE, SUPER, PROCESS and RELOAD are global-only and must never be granted to application accounts.`,
            r`-- Audit: which accounts hold powerful global privileges?
SELECT grantee, privilege_type
FROM   information_schema.user_privileges
WHERE  privilege_type IN ('SUPER', 'FILE', 'PROCESS', 'GRANT OPTION')
ORDER  BY grantee;

-- OUTPUT (example; only DBA accounts should appear):
-- +-----------------+----------------+
-- | GRANTEE         | PRIVILEGE_TYPE |
-- +-----------------+----------------+
-- | 'root'@'localhost' | FILE        |
-- | 'root'@'localhost' | GRANT OPTION|
-- | 'root'@'localhost' | PROCESS     |
-- | 'root'@'localhost' | SUPER       |
-- +-----------------+----------------+`],
        `
   Internet --> App servers --> MySQL
                  |
   runtime  (shop_app)   DML on shop.*          <- used by the running service
   reports  (shop_ro)    SELECT on views        <- BI tools, analysts
   migrate  (shop_mig)   DDL on shop.*          <- CI/CD pipeline only, restricted host
   admin    (named DBAs) roles, SUPER-like      <- humans, MFA/bastion, audited
        |
   each: restricted host + TLS + rotated secret + connection limit
`,
        `Split accounts by function, restrict by host and require TLS, keep secrets in a vault with dual-password rotation, and run migrations from a pipeline identity that is not available to the running application. Review grants regularly with an automated audit of SUPER, FILE, GRANT OPTION and wildcard-host accounts, and layer defences: parameterised queries first, least privilege second, network controls third.`
    ),
};
