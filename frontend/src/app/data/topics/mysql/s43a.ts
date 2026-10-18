// Module 43 (MySQL with Backend Applications), part A.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s43a: Record<string, DeepDive> = {
    'MySQL with Java & Spring Boot': dd(
        [`Spring Boot talks to MySQL through <b>JDBC</b> (Connector/J). Spring auto-configures a <code>DataSource</code> (HikariCP pool) from <code>application.properties</code>, and <code>JdbcTemplate</code> or JPA runs the SQL.`,
            r`// application.properties
// spring.datasource.url=jdbc:mysql://localhost:3306/shop?useSSL=true&serverTimezone=UTC
// spring.datasource.username=app
// spring.datasource.password=read-from-env-DB_PASSWORD
// spring.datasource.hikari.maximum-pool-size=10

@Service
class ProductService {
    private final JdbcTemplate jdbc;
    ProductService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    String nameOf(long id) {
        return jdbc.queryForObject("SELECT name FROM products WHERE id = ?", String.class, id);
    }
}
// nameOf(1)

// OUTPUT:
// "Keyboard"`],
        [`Plain JDBC needs boilerplate: open connection, prepare, bind, map rows, close, handle exceptions. Spring removes it and adds transactions, pooling and exception translation.`,
            r`// Without Spring: you manage everything
try (Connection c = DriverManager.getConnection(url, user, pw);
     PreparedStatement ps = c.prepareStatement("SELECT name FROM products WHERE id = ?")) {
    ps.setLong(1, 1L);
    try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) System.out.println(rs.getString("name"));
    }
}   // try-with-resources closes ResultSet, Statement, Connection

// OUTPUT:
// Keyboard`],
        [`Real services use <code>@Transactional</code> so that several statements commit or roll back together, e.g. placing an order and reducing stock.`,
            r`@Service
class OrderService {
    private final JdbcTemplate jdbc;
    OrderService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional                                   // BEGIN ... COMMIT; RuntimeException => ROLLBACK
    void place(long productId, int qty) {
        jdbc.update("INSERT INTO orders(product_id, qty) VALUES (?, ?)", productId, qty);
        int n = jdbc.update("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?", qty, productId, qty);
        if (n == 0) throw new IllegalStateException("out of stock");   // rolls the INSERT back
    }
}

// OUTPUT:
// place(1, 5) with stock 3 -> IllegalStateException, orders table unchanged`],
        [`<b>Advantages:</b> auto-configuration, pooled connections, declarative transactions, consistent exceptions (DataAccessException), easy testing with Testcontainers.`,
            r`// Test against a real MySQL 8 container
@Testcontainers @SpringBootTest
class RepoTest {
    @Container static MySQLContainer<?> db = new MySQLContainer<>("mysql:8.0");
    @DynamicPropertySource static void p(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", db::getJdbcUrl);
        r.add("spring.datasource.username", db::getUsername);
        r.add("spring.datasource.password", db::getPassword);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0 (example)`],
        [`<b>Disadvantages:</b> hidden magic (proxy-based @Transactional is skipped on self-invocation), pool and timezone misconfiguration cause subtle bugs, driver upgrades change defaults.`,
            r`@Service
class Bad {
    @Transactional void inner() { /* ... */ }
    void outer() { inner(); }       // BUG: call on this bypasses the Spring proxy => NO transaction
}
// Fix: move inner() to another bean, or call through an injected self reference.

// OUTPUT:
// No exception, but the work runs without a transaction (silent bug)`],
        [`<b>Limitations:</b> pool size cannot exceed server max_connections across all instances; long transactions hold a connection; DECIMAL must map to BigDecimal, never double.`,
            r`// 20 app instances x pool 10 = 200 connections against max_connections = 150 => failures
// Size: total = instances * maximum-pool-size  must stay below max_connections (minus admin).
BigDecimal price = rs.getBigDecimal("price");     // exact
double wrong     = rs.getDouble("price");         // 0.1 + 0.2 style drift

// OUTPUT:
// price=19.99 (BigDecimal)  vs  19.989999999999998 after arithmetic (double)`],
        `
   Controller ─► @Service (@Transactional) ─► JdbcTemplate / JPA
                                                    │
                                              HikariCP pool (10)
                                                    │ JDBC (Connector/J)
                                                    ▼
                                               MySQL 8 (3306)
`,
        `Set pool size from database capacity, not from thread counts; keep transactions short and free of remote calls; use Flyway/Liquibase for schema and Testcontainers for tests so dev equals production. Pin the driver version and set serverTimezone explicitly.`
    ),

    'MySQL with Python & Django': dd(
        [`Python connects to MySQL with <code>mysqlclient</code> or <code>PyMySQL</code>; Django adds an ORM, migrations and an admin on top, configured through the <code>DATABASES</code> setting.`,
            r`# settings.py
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": "shop", "USER": "app", "PASSWORD": "secret",
        "HOST": "127.0.0.1", "PORT": "3306",
        "CONN_MAX_AGE": 60,                       # reuse connections for 60 s
        "OPTIONS": {"charset": "utf8mb4", "init_command": "SET sql_mode='STRICT_ALL_TABLES'"},
    }
}
print(DATABASES["default"]["ENGINE"])

# OUTPUT:
# django.db.backends.mysql`],
        [`Raw drivers return tuples and need manual SQL; Django maps rows to Python objects, builds queries safely, and tracks schema in migrations.`,
            r`import pymysql
con = pymysql.connect(host="127.0.0.1", user="app", password="secret", database="shop")
with con.cursor() as cur:
    cur.execute("SELECT id, name FROM products WHERE price > %s", (10,))   # parameterised
    print(cur.fetchall())
con.close()

# OUTPUT: (example)
# ((1, 'Keyboard'), (2, 'Mouse'))`],
        [`Typical Django usage: models, queries via the ORM, and <code>transaction.atomic()</code> for multi-step writes.`,
            r`from django.db import models, transaction

class Product(models.Model):
    name  = models.CharField(max_length=100)
    stock = models.IntegerField()

@transaction.atomic
def sell(pid, qty):
    p = Product.objects.select_for_update().get(pk=pid)    # SELECT ... FOR UPDATE
    if p.stock < qty: raise ValueError("out of stock")
    p.stock -= qty; p.save()

sell(1, 2)
print(Product.objects.get(pk=1).stock)

# OUTPUT: (example, starting stock 10)
# 8`],
        [`<b>Advantages:</b> fast development, built-in migrations, protection against SQL injection, admin UI, queryset laziness for composing filters.`,
            r`qs = Product.objects.filter(stock__gt=0).order_by("name")[:2]   # lazy: no SQL yet
print(str(qs.query))                                             # inspect generated SQL

# OUTPUT:
# SELECT shop_product.id, shop_product.name, shop_product.stock FROM shop_product WHERE shop_product.stock > 0 ORDER BY shop_product.name ASC LIMIT 2`],
        [`<b>Disadvantages:</b> ORM can emit inefficient SQL (N+1), mysqlclient needs C libraries to install, and the ORM hides MySQL specifics such as index hints.`,
            r`# N+1 trap
for o in Order.objects.all()[:100]:
    print(o.customer.name)        # 1 query for orders + 100 queries for customers
# Fix: Order.objects.select_related("customer")

# OUTPUT:
# 101 queries (example) -> with select_related: 1 query`],
        [`<b>Limitations:</b> Django needs MySQL 8.0+ for modern versions, has no native support for some MySQL features (partitioning, generated columns need RunSQL), and one migration history is tied to one database.`,
            r`from django.db import migrations
class Migration(migrations.Migration):
    dependencies = [("shop", "0001_initial")]
    operations = [migrations.RunSQL(
        "ALTER TABLE shop_product ADD COLUMN total_val DECIMAL(12,2) AS (stock*10) STORED",
        "ALTER TABLE shop_product DROP COLUMN total_val")]

# OUTPUT:
# Applying shop.0002_generated_col... OK`],
        `
   views.py ─► Django ORM ─► SQL compiler ─► mysqlclient / PyMySQL ─► MySQL
                  │                                   ▲
            migrations/  ─────── schema changes ──────┘
            CONN_MAX_AGE keeps the connection open between requests
`,
        `Use persistent connections with a pool in front (ProxySQL) for many workers, keep migrations reviewed for lock impact, and drop to raw SQL for reporting. Always use utf8mb4 and strict mode to avoid silent truncation.`
    ),

    'MySQL with Node.js, .NET, PHP & Go': dd(
        [`Every language has a MySQL driver speaking the same wire protocol: <b>mysql2</b> (Node.js), <b>MySqlConnector</b> (.NET), <b>PDO/mysqli</b> (PHP), <b>go-sql-driver/mysql</b> (Go). Concepts are the same: pool, parameters, transactions.`,
            r`// Node.js (mysql2/promise)
const mysql = require('mysql2/promise');
async function main() {
  const pool = mysql.createPool({ host: 'localhost', user: 'app', password: 'secret', database: 'shop', connectionLimit: 10 });
  const [rows] = await pool.execute('SELECT id, name FROM products WHERE id = ?', [1]);
  console.log(rows);
}
main();

// OUTPUT:
// [ { id: 1, name: 'Keyboard' } ]`],
        [`Teams choose languages by skill and ecosystem; the database must be usable from all of them with identical safety rules (parameters, UTF-8, timeouts).`,
            r`// Go (database/sql)
db, _ := sql.Open("mysql", "app:secret@tcp(127.0.0.1:3306)/shop?parseTime=true&charset=utf8mb4")
db.SetMaxOpenConns(10); db.SetConnMaxLifetime(5 * time.Minute)
var name string
_ = db.QueryRow("SELECT name FROM products WHERE id = ?", 1).Scan(&name)
fmt.Println(name)

// OUTPUT:
// Keyboard`],
        [`A polyglot company often has a PHP legacy site, a .NET back-office and Go microservices on one MySQL cluster, so shared conventions matter more than the driver.`,
            r`// PHP (PDO) - prepared statement, exceptions on error
$pdo = new PDO('mysql:host=127.0.0.1;dbname=shop;charset=utf8mb4', 'app', 'secret',
               [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$st = $pdo->prepare('SELECT name FROM products WHERE id = ?');
$st->execute([1]);
echo $st->fetchColumn();

// OUTPUT:
// Keyboard`],
        [`<b>Advantages:</b> mature drivers, async/streaming support (Node, Go), strong typing (.NET), same SQL everywhere.`,
            r`// .NET (MySqlConnector + Dapper)
using var conn = new MySqlConnection("Server=localhost;Database=shop;User=app;Password=secret;");
var name = await conn.QuerySingleAsync<string>("SELECT name FROM products WHERE id = @id", new { id = 1 });
Console.WriteLine(name);

// OUTPUT:
// Keyboard`],
        [`<b>Disadvantages:</b> defaults differ (autocommit, timezone, DATETIME handling, integer sizes: BIGINT as string in Node), so the same query may behave differently per language.`,
            r`// Node: BIGINT beyond 2^53 loses precision unless told otherwise
const pool = mysql.createPool({ /* ... */ supportBigNumbers: true, bigNumberStrings: true });
const [r] = await pool.query('SELECT 9007199254740993 AS big');
console.log(r[0].big);

// OUTPUT:
// '9007199254740993'   (string; a plain number would print 9007199254740992)`],
        [`<b>Limitations:</b> classic PHP has no built-in pool (each request connects, hence ProxySQL), Node single thread blocks on CPU work, and each driver has its own TLS and auth-plugin support.`,
            r`// PHP-FPM: persistent connection helps but is per worker, not shared
$pdo = new PDO($dsn, $u, $p, [PDO::ATTR_PERSISTENT => true]);
// Budget: fpm workers (50) x servers (4) = 200 possible connections.

// OUTPUT:
// 200 potential connections -> ensure max_connections > 200 or add a proxy`],
        `
   Node  mysql2  ─┐
   .NET  MySqlConn├─► MySQL wire protocol ─► auth ─► session ─► SQL
   PHP   PDO     ─┤       (TCP 3306, TLS)
   Go    go-sql  ─┘
   Common rules: pool, ? parameters, utf8mb4, timeouts, UTC
`,
        `Standardise a connection checklist across languages: utf8mb4, UTC, explicit timeouts, pool limits, parameter binding, and BIGINT/DECIMAL handling. Centralise pooling with a proxy when many short-lived processes exist.`
    ),

    'Connection Pooling': dd(
        [`A <b>connection pool</b> keeps a fixed set of open database connections and lends them to requests, avoiding the cost of TCP + TLS + authentication on every query.`,
            r`// HikariCP
HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:mysql://localhost:3306/shop");
cfg.setUsername("app"); cfg.setPassword("secret");
cfg.setMaximumPoolSize(10);          // hard ceiling
cfg.setMinimumIdle(2);
cfg.setConnectionTimeout(3000);      // ms to wait for a free connection
HikariDataSource ds = new HikariDataSource(cfg);
try (Connection c = ds.getConnection()) { System.out.println(c.isValid(1)); }

// OUTPUT:
// true`],
        [`Opening a connection costs several milliseconds and a server thread. At 1000 requests/s that is wasteful and can exhaust max_connections.`,
            r`# Without pool: connect per request (slow)       With pool: borrow and return (fast)
import time, pymysql
t=time.perf_counter()
for _ in range(100):
    c = pymysql.connect(host="127.0.0.1", user="app", password="secret"); c.close()
print(round((time.perf_counter()-t)*1000/100,2), "ms per connect")

# OUTPUT: (example)
# 3.8 ms per connect   (a pooled borrow is ~0.01 ms)`],
        [`Every production app uses one: HikariCP (Java), SQLAlchemy QueuePool (Python), mysql2 createPool (Node), database/sql (Go); ProxySQL pools at the infrastructure level.`,
            r`# SQLAlchemy
from sqlalchemy import create_engine, text
engine = create_engine("mysql+pymysql://app:secret@127.0.0.1/shop",
                       pool_size=10, max_overflow=5, pool_pre_ping=True, pool_recycle=1800)
with engine.connect() as c:
    print(c.execute(text("SELECT 1")).scalar())

# OUTPUT:
# 1`],
        [`<b>Advantages:</b> lower latency, bounded load on the server, health checks (pre-ping), back-pressure when the pool is full.`,
            r`SELECT user, COUNT(*) AS conns
FROM   information_schema.PROCESSLIST
GROUP  BY user;

-- OUTPUT: (example)
-- user | conns
-- app  |    10      (constant, even under 500 req/s)`],
        [`<b>Disadvantages:</b> a leaked connection (not closed) starves the pool; session state (SET variables, temp tables) can leak to the next borrower; too-large pools hurt performance.`,
            r`// LEAK: connection never returned => pool exhausted after N requests
Connection c = ds.getConnection();
c.createStatement().executeQuery("SELECT 1");
// forgot c.close()

// OUTPUT:
// SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 3000ms`],
        [`<b>Limitations:</b> servers close idle connections after wait_timeout, so the pool must recycle sooner; pool size is bounded by max_connections shared across instances.`,
            r`SELECT @@wait_timeout AS server_idle_s;     -- 28800 by default
-- Pool must retire connections before the server or a firewall kills them:
--   hikari maxLifetime = 1800000 ms (30 min), keepalive-time = 300000 ms
--   Formula: instances * pool_size  <  max_connections - reserved

-- OUTPUT:
-- server_idle_s
-- 28800`],
        `
   Request threads (200)            Pool (10)              MySQL
   ┌──┐┌──┐┌──┐ ...  borrow ──►  [c1][c2]...[c10] ──────►  10 threads
   └──┘└──┘└──┘      ◄── return   waiters queue here          running
        ▲ if all busy: wait up to connectionTimeout, then fail
`,
        `Small pools are faster: start near cores*2 + spindles and measure. Keep transactions short, set maxLifetime below wait_timeout, and in a fleet put ProxySQL in front so pool math stays predictable.`
    ),

    'Prepared Statements in Applications': dd(
        [`A <b>prepared statement</b> sends the SQL shape with <code>?</code> placeholders first, then the values separately. The server never mixes data into the SQL text, so injection is impossible and the plan can be reused.`,
            r`// Java
String sql = "SELECT id, name FROM users WHERE email = ? AND active = ?";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, "a@b.com");
    ps.setBoolean(2, true);
    try (ResultSet rs = ps.executeQuery()) { while (rs.next()) System.out.println(rs.getString("name")); }
}

// OUTPUT:
// Abaji`],
        [`String concatenation puts user input into the command language. A value such as <code>' OR '1'='1</code> then changes the meaning of the query (SQL injection).`,
            r`# VULNERABLE
email = "x' OR '1'='1"
sql = "SELECT * FROM users WHERE email = '" + email + "'"
print(sql)
# SAFE: cursor.execute("SELECT * FROM users WHERE email = %s", (email,))

# OUTPUT:
# SELECT * FROM users WHERE email = 'x' OR '1'='1'      (returns every user!)`],
        [`All production code binds parameters. Batch inserts reuse one prepared statement many times.`,
            r`PreparedStatement ps = conn.prepareStatement("INSERT INTO events(type, ts) VALUES (?, ?)");
for (String t : new String[]{"login", "click", "logout"}) {
    ps.setString(1, t); ps.setTimestamp(2, new Timestamp(System.currentTimeMillis()));
    ps.addBatch();
}
int[] n = ps.executeBatch();
System.out.println(n.length + " rows");
// add rewriteBatchedStatements=true to the JDBC URL for a true multi-row INSERT

// OUTPUT:
// 3 rows`],
        [`<b>Advantages:</b> immune to injection for values, correct type and escaping handled by the driver, parse cost saved on server-side prepares, cleaner code.`,
            r`-- Server-side syntax (what the binary protocol does underneath)
PREPARE find_user FROM 'SELECT id, name FROM users WHERE email = ?';
SET @e = 'a@b.com';
EXECUTE find_user USING @e;
DEALLOCATE PREPARE find_user;

-- OUTPUT:
-- id | name
--  7 | Abaji`],
        [`<b>Disadvantages:</b> Connector/J by default emulates prepares client-side; server prepares cost an extra round trip for one-shot queries; a cached plan for a skewed parameter can be suboptimal.`,
            r`// Enable real server-side prepares and a statement cache
// jdbc:mysql://host/shop?useServerPrepStmts=true&cachePrepStmts=true&prepStmtCacheSize=250&prepStmtCacheSqlLimit=2048
SHOW GLOBAL STATUS LIKE 'Prepared_stmt_count';

-- OUTPUT: (example)
-- Prepared_stmt_count | 240`],
        [`<b>Limitations:</b> placeholders bind values only, never identifiers or keywords (table name, ORDER BY column, ASC/DESC) and cannot expand an IN list of unknown length.`,
            r`# Dynamic identifiers must be whitelisted, not bound
allowed = {"name", "created_at"}
col = "created_at"
assert col in allowed
sql = "SELECT id FROM users ORDER BY " + col + " DESC LIMIT %s"   # col whitelisted, limit bound
print(sql)

# OUTPUT:
# SELECT id FROM users ORDER BY created_at DESC LIMIT %s`],
        `
   App ── "SELECT .. WHERE email = ?" ──► parse + plan (once)
   App ── values ["a@b.com"] ───────────► bind + execute (many times)
                         data is never parsed as SQL => no injection
   max_prepared_stmt_count caps statements per server
`,
        `Make parameter binding a code-review rule and ban string-built SQL by linting. Whitelist dynamic identifiers, watch max_prepared_stmt_count when pools are large (each connection holds its own prepared statements), and tune the statement cache size.`
    )
};
