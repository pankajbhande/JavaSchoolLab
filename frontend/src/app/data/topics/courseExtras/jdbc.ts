// JDBC course extras (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const jdbcExtras: Record<string, Extra> = {
    'introductiontojdbc': x(
        ['JDBC (Java Database Connectivity) is the standard Java API for talking to relational databases: connect, send SQL, read results.',
            'It has four main parts: <code>DriverManager/DataSource</code>, <code>Connection</code>, <code>Statement/PreparedStatement</code> and <code>ResultSet</code>.',
            'Every database vendor ships a JDBC driver (for MySQL: Connector/J).'],
        ['JDBC 4+ loads drivers automatically from the classpath (service loader); no <code>Class.forName</code> needed.',
            'Always close resources with try-with-resources: Connection, Statement and ResultSet are AutoCloseable.',
            'JDBC is the foundation under Hibernate, Spring JdbcTemplate and MyBatis.'],
        ['JDBC is blocking I/O per connection; scale with pools and, for reactive stacks, R2DBC or virtual threads.',
            'Plain JDBC gives full SQL control and predictable performance, at the cost of boilerplate and manual mapping.',
            'Driver choice and URL options (timeouts, TLS, batching) decide production behaviour more than the API itself.'],
        [['F', 'What is JDBC?', 'The Java API for connecting to relational databases and running SQL.'],
            ['F', 'Name the main JDBC interfaces.', 'Connection, Statement, PreparedStatement, ResultSet (and DataSource).'],
            ['M', 'Do you still need Class.forName for the driver?', 'No, JDBC 4 drivers register through the service loader when on the classpath.'],
            ['M', 'Why use try-with-resources?', 'To guarantee that Connection, Statement and ResultSet are closed even when exceptions occur, preventing leaks.'],
            ['S', 'How does JDBC relate to Hibernate and Spring?', 'They are layers over JDBC: they build SQL and map results but still use Connection, PreparedStatement and ResultSet underneath.'],
            ['S', 'What are the limits of blocking JDBC?', 'Each in-flight query holds a thread and a connection; use bounded pools, timeouts, virtual threads or R2DBC for high concurrency.']],
        [['A first query with try-with-resources.',
            r`String url = "jdbc:mysql://localhost:3306/shop";
try (Connection c = DriverManager.getConnection(url, "shop_app", System.getenv("DB_PASS"));
     PreparedStatement ps = c.prepareStatement("SELECT id, name FROM customers WHERE id = ?")) {
    ps.setLong(1, 1);
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) System.out.println(rs.getLong("id") + " " + rs.getString("name"));
    }
}

// OUTPUT:
// 1 Abaji`],
            ['Insert and read the generated key.',
                r`try (PreparedStatement ps = c.prepareStatement("INSERT INTO customers (name) VALUES (?)", Statement.RETURN_GENERATED_KEYS)) {
    ps.setString(1, "Raoji");
    ps.executeUpdate();
    try (ResultSet keys = ps.getGeneratedKeys()) {
        keys.next();
        System.out.println("new id " + keys.getLong(1));
    }
}

// OUTPUT:
// new id 2`]],
        [['Metadata about the connection.',
            r`DatabaseMetaData md = c.getMetaData();
System.out.println(md.getDatabaseProductName() + " " + md.getDatabaseProductVersion());
System.out.println(md.getDriverName() + " " + md.getDriverVersion());

// OUTPUT:
// MySQL 8.0.36
// MySQL Connector/J 8.3.0`],
            ['Update with affected row count.',
                r`try (PreparedStatement ps = c.prepareStatement("UPDATE customers SET name = ? WHERE id = ?")) {
    ps.setString(1, "Abaji R");
    ps.setLong(2, 1);
    System.out.println(ps.executeUpdate() + " row(s) updated");
}

// OUTPUT:
// 1 row(s) updated`]]
    ),

    'jdbc-connection-setup': x(
        ['A JDBC URL has the form <code>jdbc:mysql://host:3306/database?options</code>. You get a connection with <code>DriverManager.getConnection(url, user, password)</code> or from a <code>DataSource</code>.',
            'Add the driver dependency (<code>mysql-connector-j</code>) to the project.',
            'Never hard-code passwords; read them from environment variables or a secrets manager.'],
        ['Useful URL options: <code>sslMode</code>, <code>connectTimeout</code>, <code>socketTimeout</code>, <code>serverTimezone</code>, <code>characterEncoding</code>, <code>rewriteBatchedStatements</code>, <code>useServerPrepStmts</code>.',
            'Prefer a DataSource (HikariCP) so connections are pooled and configured in one place.',
            'Set timeouts so a dead database cannot hang your threads forever.'],
        ['Use TLS with certificate verification (<code>sslMode=VERIFY_IDENTITY</code>) for remote databases.',
            'Different environments use different URLs and accounts; inject configuration, do not branch in code.',
            'Test the connection settings under failure (database down, network drop) to confirm timeouts and retries.'],
        [['F', 'What is a JDBC URL?', 'A string that identifies the driver, host, port, database and options.'],
            ['F', 'How do you get a connection?', '<code>DriverManager.getConnection(url, user, pwd)</code> or <code>dataSource.getConnection()</code>.'],
            ['M', 'Why set connect and socket timeouts?', 'So blocked network calls fail fast instead of hanging threads indefinitely.'],
            ['M', 'DriverManager vs DataSource?', 'DataSource is the preferred, configurable factory that supports pooling and JNDI; DriverManager creates a new connection each call.'],
            ['S', 'How do you secure the connection?', 'Enable TLS with verification, use a least-privilege account and keep credentials in a secrets manager.'],
            ['S', 'What happens if a connection is idle too long?', 'The server or a firewall may close it; pools validate or retire connections before that (max lifetime below server wait_timeout).']],
        [['Connection with options.',
            r`String url = "jdbc:mysql://db.internal:3306/shop?sslMode=VERIFY_IDENTITY&connectTimeout=3000&socketTimeout=30000&characterEncoding=utf8";
try (Connection c = DriverManager.getConnection(url, System.getenv("DB_USER"), System.getenv("DB_PASS"))) {
    System.out.println("connected: " + c.isValid(2));
}

// OUTPUT:
// connected: true`],
            ['A DataSource with Hikari.',
                r`HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl(url);
cfg.setUsername(user);
cfg.setPassword(pass);
cfg.setMaximumPoolSize(10);
cfg.setConnectionTimeout(3000);
DataSource ds = new HikariDataSource(cfg);
try (Connection c = ds.getConnection()) { System.out.println(c.getCatalog()); }

// OUTPUT:
// shop`]],
        [['Fail fast when the database is down.',
            r`try (Connection c = DriverManager.getConnection("jdbc:mysql://10.255.255.1:3306/shop?connectTimeout=2000", "u", "p")) { }
catch (SQLException e) {
    System.out.println(e.getSQLState() + " " + e.getMessage().substring(0, 24));
}

// OUTPUT:
// 08001 Communications link fa`],
            ['Read the isolation level and auto-commit.',
                r`System.out.println(c.getTransactionIsolation() == Connection.TRANSACTION_REPEATABLE_READ);
System.out.println(c.getAutoCommit());

// OUTPUT:
// true
// true`]]
    ),

    'jdbc-statement-types': x(
        ['<code>Statement</code> runs fixed SQL text; <code>PreparedStatement</code> runs SQL with <code>?</code> placeholders and bound values; <code>CallableStatement</code> calls stored procedures.',
            'PreparedStatement prevents SQL injection and is usually faster for repeated queries.',
            'Always prefer PreparedStatement for any SQL that includes user input.'],
        ['Set values with <code>setString</code>, <code>setLong</code>, <code>setBigDecimal</code>, <code>setObject</code>; use <code>setNull(index, Types.X)</code> for NULL.',
            'Use <code>executeQuery</code> for SELECT, <code>executeUpdate</code> for DML and <code>execute</code> when the type is unknown.',
            'Placeholders can only stand for values, never for table or column names.'],
        ['For dynamic identifiers use an allow-list and build the SQL from fixed fragments.',
            'Client-side vs server-side prepared statements: <code>useServerPrepStmts</code> and <code>cachePrepStmts</code> change where parsing happens.',
            'Reuse one PreparedStatement for batches of parameter sets.'],
        [['F', 'Statement vs PreparedStatement?', 'PreparedStatement uses placeholders and bound parameters; it is safer and often faster.'],
            ['F', 'Which prevents SQL injection?', 'PreparedStatement with bound parameters.'],
            ['M', 'Can you use ? for a table name?', 'No; placeholders are for values only.'],
            ['M', 'executeQuery vs executeUpdate?', 'executeQuery returns a ResultSet for SELECT; executeUpdate returns an affected-row count for INSERT/UPDATE/DELETE/DDL.'],
            ['S', 'How do you build a dynamic IN list safely?', 'Generate one placeholder per value and bind each value.'],
            ['S', 'Why cache prepared statements?', 'To avoid re-parsing the same SQL on each call; configure the driver cache and close statements properly.']],
        [['Injection with Statement vs safe PreparedStatement.',
            r`String name = "x' OR '1'='1";
// unsafe: "SELECT * FROM users WHERE name = '" + name + "'"
try (PreparedStatement ps = c.prepareStatement("SELECT id FROM users WHERE name = ?")) {
    ps.setString(1, name);
    try (ResultSet rs = ps.executeQuery()) { System.out.println(rs.next()); }
}

// OUTPUT:
// false`],
            ['Dynamic IN list.',
                r`List<Long> ids = List.of(1L, 3L, 5L);
String marks = String.join(",", Collections.nCopies(ids.size(), "?"));
try (PreparedStatement ps = c.prepareStatement("SELECT id, name FROM customers WHERE id IN (" + marks + ")")) {
    for (int i = 0; i < ids.size(); i++) ps.setLong(i + 1, ids.get(i));
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) System.out.println(rs.getString("name"));
    }
}

// OUTPUT:
// Abaji
// Moropant`]],
        [['Allow-list for ORDER BY.',
            r`Set<String> allowed = Set.of("name", "created_at");
String col = allowed.contains(sort) ? sort : "created_at";
String sql = "SELECT id, name FROM customers ORDER BY " + col + " DESC LIMIT ?";

// OUTPUT:
// SELECT id, name FROM customers ORDER BY created_at DESC LIMIT ?`],
            ['Setting NULL.',
                r`ps.setNull(3, Types.VARCHAR);              // phone is optional
ps.setObject(4, LocalDate.of(2026, 5, 1));

// OUTPUT:
// INSERT ... VALUES (?, ?, NULL, '2026-05-01')`]]
    ),

    'jdbc-result-set': x(
        ['A <code>ResultSet</code> is a cursor over the rows of a query. Call <code>next()</code> to move to the next row and read columns by name or index.',
            'Use typed getters: <code>getInt</code>, <code>getString</code>, <code>getBigDecimal</code>, <code>getTimestamp</code>.',
            'Check <code>wasNull()</code> after reading primitives that may be NULL.'],
        ['Result set types: forward-only (default) and scrollable; concurrency: read-only or updatable.',
            '<code>ResultSetMetaData</code> gives column count, names and types for generic tools.',
            'Set <code>fetchSize</code> to control how many rows are pulled per round trip.'],
        ['MySQL Connector/J loads the whole result into memory by default; for huge results use streaming (<code>setFetchSize(Integer.MIN_VALUE)</code> or cursor-based fetch).',
            'Map rows to objects in one place (RowMapper) and avoid leaking ResultSet outside the DAO.',
            'Prefer <code>getObject(col, LocalDate.class)</code> for java.time types.'],
        [['F', 'How do you read rows from a ResultSet?', 'Loop with <code>while (rs.next())</code> and call getters for each column.'],
            ['F', 'What is ResultSetMetaData?', 'Information about the result columns: count, names and types.'],
            ['M', 'How do you detect a NULL value?', 'Read the column and call <code>rs.wasNull()</code>, or use getObject which returns null.'],
            ['M', 'Why can a big query run out of memory?', 'The driver buffers all rows by default; use streaming or chunked queries.'],
            ['S', 'How do you stream millions of rows?', 'Create a forward-only, read-only statement with fetch size Integer.MIN_VALUE (or useCursorFetch with a fetch size) and process row by row.'],
            ['S', 'Why not return ResultSet from a method?', 'It is tied to the open connection; map to objects and close resources inside the method.']],
        [['Map rows to records.',
            r`record Customer(long id, String name, LocalDate createdOn) {}
List<Customer> list = new ArrayList<>();
try (PreparedStatement ps = c.prepareStatement("SELECT id, name, created_on FROM customers ORDER BY id");
     ResultSet rs = ps.executeQuery()) {
    while (rs.next()) list.add(new Customer(rs.getLong("id"), rs.getString("name"), rs.getObject("created_on", LocalDate.class)));
}
System.out.println(list.get(0));

// OUTPUT:
// Customer[id=1, name=Abaji, createdOn=2026-01-05]`],
            ['Generic printing with metadata.',
                r`try (ResultSet rs = stmt.executeQuery("SELECT * FROM customers")) {
    ResultSetMetaData md = rs.getMetaData();
    for (int i = 1; i <= md.getColumnCount(); i++) System.out.print(md.getColumnLabel(i) + (i < md.getColumnCount() ? " | " : "\n"));
}

// OUTPUT:
// id | name | created_on`]],
        [['Stream a large result.',
            r`try (PreparedStatement ps = c.prepareStatement("SELECT id, payload FROM events", ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)) {
    ps.setFetchSize(Integer.MIN_VALUE);
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) process(rs.getLong(1), rs.getString(2));
    }
}

// OUTPUT:
// rows processed one by one, constant memory`],
            ['NULL handling.',
                r`int age = rs.getInt("age");
Integer safeAge = rs.wasNull() ? null : age;
Integer viaObject = rs.getObject("age", Integer.class);

// OUTPUT:
// safeAge == null when the column is NULL`]]
    ),

    'jdbc-stored-procedures': x(
        ['A stored procedure is SQL logic stored in the database. Call it with a <code>CallableStatement</code> and the escape syntax <code>{call proc(?, ?)}</code>.',
            'Register OUT parameters with <code>registerOutParameter</code> and read them after execution.',
            'Procedures can also return result sets.'],
        ['Parameter modes: IN (set before), OUT (register and read after), INOUT (both).',
            'Use try-with-resources; CallableStatement is AutoCloseable.',
            'Transactions started inside the procedure interact with the JDBC connection transaction; keep one clear owner.'],
        ['Procedures reduce round trips for multi-step operations but move logic into the database, making versioning and testing harder.',
            'Handle multiple result sets with <code>getMoreResults()</code>.',
            'Map SQL errors raised with SIGNAL to meaningful application exceptions.'],
        [['F', 'How do you call a stored procedure in JDBC?', 'With a CallableStatement and <code>{call name(?, ?)}</code>.'],
            ['F', 'What are IN, OUT and INOUT parameters?', 'IN passes a value in, OUT returns a value, INOUT does both.'],
            ['M', 'How do you read an OUT parameter?', 'Call registerOutParameter before execute and then getXxx(index) afterwards.'],
            ['M', 'How do you read several result sets?', 'Loop with getResultSet() and getMoreResults().'],
            ['S', 'When are stored procedures a good choice?', 'For data-heavy batch work near the data, controlled write paths with strict privileges, and legacy integration.'],
            ['S', 'How do you test them in CI?', 'Run them against a real MySQL container with migrations that create the routines.']],
        [['Call a procedure with IN and OUT.',
            r`// CREATE PROCEDURE dept_count(IN p_dept INT, OUT p_count INT) ...
try (CallableStatement cs = c.prepareCall("{call dept_count(?, ?)}")) {
    cs.setInt(1, 10);
    cs.registerOutParameter(2, Types.INTEGER);
    cs.execute();
    System.out.println("count = " + cs.getInt(2));
}

// OUTPUT:
// count = 2`],
            ['Procedure returning a result set.',
                r`try (CallableStatement cs = c.prepareCall("{call emp_by_dept(?)}")) {
    cs.setInt(1, 10);
    try (ResultSet rs = cs.executeQuery()) {
        while (rs.next()) System.out.println(rs.getString("name"));
    }
}

// OUTPUT:
// Abaji
// Raoji`]],
        [['Map a SIGNAL error.',
            r`try { cs.execute(); }
catch (SQLException e) {
    if ("45000".equals(e.getSQLState())) throw new BusinessException(e.getMessage());
    throw e;
}

// OUTPUT:
// BusinessException: Insufficient funds`],
            ['INOUT parameter.',
                r`CallableStatement cs = c.prepareCall("{call add_tax(?, ?)}");
cs.setBigDecimal(1, new BigDecimal("1000.00"));
cs.registerOutParameter(1, Types.DECIMAL);
cs.setBigDecimal(2, new BigDecimal("18"));
cs.execute();
System.out.println(cs.getBigDecimal(1));

// OUTPUT:
// 1180.00`]]
    ),

    'jdbc-transactions': x(
        ['By default JDBC runs in auto-commit mode: each statement commits itself. For a transaction call <code>setAutoCommit(false)</code>, run statements, then <code>commit()</code> or <code>rollback()</code>.',
            'A transaction belongs to one Connection; all statements in it must use that connection.',
            'Always roll back on failure and restore auto-commit when returning a pooled connection.'],
        ['Isolation levels: <code>setTransactionIsolation</code> with READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE.',
            'Savepoints allow partial rollback: <code>setSavepoint</code>, <code>rollback(savepoint)</code>.',
            'Keep transactions short; do not call remote services inside them.'],
        ['Handle deadlock (error 1213) and lock timeout (1205) by retrying the whole transaction with backoff.',
            'Frameworks (Spring <code>@Transactional</code>) manage this for you, but they use the same JDBC calls underneath.',
            'DDL statements in MySQL commit implicitly; do not rely on rollback after them.'],
        [['F', 'What is auto-commit?', 'A mode where each SQL statement is committed automatically.'],
            ['F', 'How do you start a manual transaction?', '<code>connection.setAutoCommit(false)</code>.'],
            ['M', 'What should you do in the catch block?', 'Call <code>rollback()</code>, then rethrow or handle the error.'],
            ['M', 'What is a savepoint?', 'A marker inside a transaction to which you can roll back without ending the transaction.'],
            ['S', 'How do you handle deadlocks?', 'Catch SQL error 1213, roll back, wait with backoff and retry the whole transaction a limited number of times.'],
            ['S', 'Why restore auto-commit before returning a connection to the pool?', 'So the next user of the pooled connection does not inherit an open transaction or manual mode.']],
        [['Money transfer.',
            r`try (Connection c = ds.getConnection()) {
    c.setAutoCommit(false);
    try (PreparedStatement d = c.prepareStatement("UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?");
         PreparedStatement k = c.prepareStatement("UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
        d.setBigDecimal(1, amt);
        d.setLong(2, from);
        d.setBigDecimal(3, amt);
        if (d.executeUpdate() != 1) throw new IllegalStateException("insufficient funds");
        k.setBigDecimal(1, amt);
        k.setLong(2, to);
        k.executeUpdate();
        c.commit();
    } catch (Exception e) {
        c.rollback();
        throw e;
    }
    finally { c.setAutoCommit(true); }
}

// OUTPUT:
// both updates committed, or both rolled back`],
            ['Savepoint.',
                r`c.setAutoCommit(false);
insert(c, "A");
Savepoint sp = c.setSavepoint();
insert(c, "B");
c.rollback(sp);        // undo B only
c.commit();            // A is committed

// OUTPUT:
// rows: A`]],
        [['Retry on deadlock.',
            r`for (int attempt = 1; attempt <= 3; attempt++) {
    try {
        transfer(from, to, amt);
        break;
    }
    catch (SQLException e) {
        if (e.getErrorCode() != 1213 || attempt == 3) throw e;
        Thread.sleep(50L * attempt);
    }
}

// OUTPUT:
// succeeded on attempt 2`],
            ['Set isolation.',
                r`c.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
System.out.println(c.getTransactionIsolation());

// OUTPUT:
// 2`]]
    ),

    'jdbc-batch-processing': x(
        ['Batching sends many statements in one round trip: <code>addBatch()</code> several times, then <code>executeBatch()</code>.',
            'It is far faster than executing one statement per row.',
            'Wrap the batch in a transaction so it is all-or-nothing.'],
        ['<code>executeBatch</code> returns an int array of update counts (or <code>SUCCESS_NO_INFO</code>).',
            'For MySQL set <code>rewriteBatchedStatements=true</code> so the driver rewrites batches into multi-row INSERTs.',
            'Process very large inputs in chunks (for example 1000 rows) and commit per chunk.'],
        ['Handle <code>BatchUpdateException</code> to find which statement failed (<code>getUpdateCounts</code>).',
            'Large batches increase memory and lock time; tune chunk size by measurement.',
            'Idempotent upserts (<code>ON DUPLICATE KEY UPDATE</code>) make batch reruns safe.'],
        [['F', 'Why use batch processing?', 'To reduce network round trips and speed up many similar statements.'],
            ['F', 'Which methods are used?', '<code>addBatch()</code> and <code>executeBatch()</code>.'],
            ['M', 'What does rewriteBatchedStatements do?', 'It lets the MySQL driver combine batched inserts into multi-row statements for much higher throughput.'],
            ['M', 'What is BatchUpdateException?', 'An exception thrown when a batch fails; it exposes the update counts of the statements that ran.'],
            ['S', 'How do you load a million rows?', 'Chunks of 500-1000 with batching, one transaction per chunk, and an upsert so reruns are safe.'],
            ['S', 'Why can very large batches hurt?', 'They use lots of memory and hold locks for long; chunk them and commit regularly.']],
        [['Batch insert in chunks.',
            r`String sql = "INSERT INTO events (user_id, kind) VALUES (?, ?)";
try (PreparedStatement ps = c.prepareStatement(sql)) {
    c.setAutoCommit(false);
    int n = 0;
    for (Event e : events) {
        ps.setLong(1, e.userId());
        ps.setString(2, e.kind());
        ps.addBatch();
        if (++n % 1000 == 0) {
            ps.executeBatch();
            c.commit();
        }
    }
    ps.executeBatch();
    c.commit();
}

// OUTPUT:
// 100,000 rows inserted in 100 batches`],
            ['Inspect update counts.',
                r`int[] counts = ps.executeBatch();
System.out.println(Arrays.stream(counts).sum() + " rows");
try { ps.executeBatch(); }
catch (BatchUpdateException e) {
    System.out.println("ok until index " + e.getUpdateCounts().length);
}

// OUTPUT:
// 1000 rows`]],
        [['Upsert batch.',
            r`String sql = "INSERT INTO products (sku, name, price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price)";

// OUTPUT:
// reruns update existing rows instead of failing`],
            ['URL option.',
                r`jdbc:mysql://db:3306/shop?rewriteBatchedStatements=true

// OUTPUT:
// 100,000 inserts: 92 s without, 2.1 s with the option`]]
    ),

    'jdbc-exception-handling': x(
        ['JDBC errors are reported as <code>SQLException</code>. It carries a message, an SQLSTATE (standard code) and a vendor error code.',
            'Always log or wrap the exception with context; do not swallow it.',
            'Use try-with-resources so resources close even when an exception is thrown.'],
        ['SQLSTATE classes help classify: <code>23</code> integrity violations, <code>40</code> rollback (deadlock), <code>08</code> connection errors.',
            'Modern drivers throw subclasses: <code>SQLIntegrityConstraintViolationException</code>, <code>SQLTransientConnectionException</code>.',
            'Chained exceptions: use <code>getNextException()</code> and suppressed exceptions from close().'],
        ['Translate SQL errors into domain exceptions at the DAO boundary (duplicate key to "email already used").',
            'Retry only transient errors (deadlock, connection lost) and never retry constraint violations.',
            'Do not leak SQL text and credentials in error messages returned to clients.'],
        [['F', 'What exception does JDBC throw?', 'SQLException (and its subclasses).'],
            ['F', 'What is SQLState?', 'A five-character standard code describing the error class.'],
            ['M', 'How do you detect a duplicate key?', 'Catch SQLIntegrityConstraintViolationException or check error code 1062 / SQLState 23000.'],
            ['M', 'Which errors are retryable?', 'Deadlocks (1213), lock wait timeouts (1205) and transient connection errors.'],
            ['S', 'How do you design error handling at the DAO layer?', 'Catch SQLException, map to domain exceptions, preserve the cause, and let the service layer decide on retries and responses.'],
            ['S', 'Why not return raw SQL errors to API clients?', 'They expose schema and internals; log details server-side and return a stable error code.']],
        [['Translate duplicate key.',
            r`try { insertUser(email); }
catch (SQLIntegrityConstraintViolationException e) { throw new EmailAlreadyUsed(email, e); }
catch (SQLException e) { throw new DataAccessFailure("insert user", e); }

// OUTPUT:
// EmailAlreadyUsed: a@x.com   (cause: Duplicate entry 'a@x.com' for key 'users.uq_email')`],
            ['Inspect the error.',
                r`catch (SQLException e) {
    System.out.println(e.getSQLState() + " / " + e.getErrorCode() + " / " + e.getMessage());
}

// OUTPUT:
// 23000 / 1062 / Duplicate entry 'a@x.com' for key 'users.uq_email'`]],
        [['Retry only transient failures.',
            r`boolean retryable = e instanceof SQLTransientException || e.getErrorCode() == 1213 || e.getErrorCode() == 1205;

// OUTPUT:
// deadlock and timeout retried; constraint violations fail immediately`],
            ['Close errors do not hide the main one.',
                r`try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
    ps.executeUpdate();
}
catch (SQLException e) {
    for (Throwable s : e.getSuppressed()) log.warn("close failed", s);
    throw e;
}

// OUTPUT:
// the primary exception is preserved with suppressed close errors attached`]]
    ),

    'jdbc-connection-pooling': x(
        ['A connection pool keeps open connections ready to reuse instead of creating a new one for each request.',
            'Popular pools: HikariCP (fast, default in Spring Boot), Apache DBCP, c3p0.',
            '<code>connection.close()</code> on a pooled connection returns it to the pool.'],
        ['Key settings: maximum pool size, minimum idle, connection timeout, idle timeout, max lifetime, leak detection.',
            'Set max lifetime below the database or firewall idle timeout.',
            'A bigger pool is not faster: a small pool (cores x 2 as a start) is usually best.'],
        ['Total connections across all application instances must stay below the database <code>max_connections</code>.',
            'Monitor pool wait time, active connections and timeouts; they show saturation before errors appear.',
            'Use a connection proxy (ProxySQL, RDS Proxy) when many instances or serverless functions need more clients than the database can handle.'],
        [['F', 'Why use a connection pool?', 'Opening connections is slow; a pool reuses them and limits concurrency.'],
            ['F', 'Which pool does Spring Boot use?', 'HikariCP.'],
            ['M', 'What does close() do on a pooled connection?', 'It returns the connection to the pool instead of closing the physical connection.'],
            ['M', 'Why set maxLifetime below wait_timeout?', 'So the pool retires connections before the server closes them, avoiding broken connections.'],
            ['S', 'How do you size the pool?', 'Start with cores x 2, load test, and ensure instances x pool size stays under max_connections with headroom.'],
            ['S', 'How do you detect connection leaks?', 'Enable leak detection (HikariCP leakDetectionThreshold) and look at active versus idle counts.']],
        [['HikariCP configuration.',
            r`HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl("jdbc:mysql://db:3306/shop");
cfg.setUsername("shop_app");
cfg.setPassword(System.getenv("DB_PASS"));
cfg.setMaximumPoolSize(10);
cfg.setMinimumIdle(5);
cfg.setConnectionTimeout(3000);
cfg.setMaxLifetime(1_500_000);
cfg.setLeakDetectionThreshold(20_000);
HikariDataSource ds = new HikariDataSource(cfg);

// OUTPUT:
// HikariPool-1 - Start completed.`],
            ['Pool metrics.',
                r`HikariPoolMXBean pool = ds.getHikariPoolMXBean();
System.out.println(pool.getActiveConnections() + " active, " + pool.getIdleConnections() + " idle, " + pool.getThreadsAwaitingConnection() + " waiting");

// OUTPUT:
// 3 active, 7 idle, 0 waiting`]],
        [['Leak example and fix.',
            r`Connection c = ds.getConnection();     // never closed: leak
// fix
try (Connection c2 = ds.getConnection()) { /* use */ }

// OUTPUT:
// WARN ProxyLeakTask: Connection leak detection triggered ... (stack trace of the code that borrowed it)`],
            ['Server side view.',
                r`SELECT user, COUNT(*) AS total, SUM(command = 'Sleep') AS idle FROM information_schema.processlist WHERE user = 'shop_app' GROUP BY user;

-- OUTPUT:
-- user     | total | idle
-- shop_app |    10 |    7`]]
    ),

    'jdbc-row-set': x(
        ['A <code>RowSet</code> is a JavaBeans-style wrapper around a ResultSet that is easier to use and can work disconnected.',
            'Types: <code>JdbcRowSet</code> (connected), <code>CachedRowSet</code> (disconnected, in memory), <code>WebRowSet</code> (XML).',
            'Create one with <code>RowSetProvider.newFactory()</code>.'],
        ['<code>CachedRowSet</code> loads data, closes the connection, lets you edit rows and later synchronizes changes with <code>acceptChanges()</code>.',
            'RowSets are scrollable and updatable by default.',
            'They can be serialized and passed between layers.'],
        ['RowSets are rarely used in modern code; DTOs plus repositories or an ORM are more common.',
            'CachedRowSet uses optimistic synchronization, which can conflict with concurrent changes.',
            'Be careful with memory: the whole result is cached.'],
        [['F', 'What is a RowSet?', 'A wrapper around a ResultSet with extra features such as scrollability and disconnected use.'],
            ['F', 'Name two RowSet types.', 'JdbcRowSet and CachedRowSet.'],
            ['M', 'What is special about CachedRowSet?', 'It is disconnected: data is cached in memory so you can work without an open connection and sync later.'],
            ['M', 'How do you push changes back?', 'Call acceptChanges() with a connection.'],
            ['S', 'Why are RowSets uncommon today?', 'ORMs, DTOs and repositories cover the same needs with clearer code and better tooling.'],
            ['S', 'What risk does CachedRowSet have?', 'Large memory use and conflicting concurrent updates when synchronizing.']],
        [['CachedRowSet usage.',
            r`RowSetFactory f = RowSetProvider.newFactory();
try (CachedRowSet crs = f.createCachedRowSet()) {
    crs.setUrl("jdbc:mysql://localhost:3306/shop");
    crs.setUsername("shop_app");
    crs.setPassword(pass);
    crs.setCommand("SELECT id, name FROM customers");
    crs.execute();                                    // connection closed after load
    while (crs.next()) System.out.println(crs.getString("name"));
}

// OUTPUT:
// Abaji
// Raoji`],
            ['Edit and sync.',
                r`crs.absolute(1);
crs.updateString("name", "Abaji R");
crs.updateRow();
crs.acceptChanges(connection);

// OUTPUT: (SQL)
// UPDATE customers SET name = ? WHERE id = ? AND name = ?`]],
        [['Serialize between layers.',
            r`try (ObjectOutputStream out = new ObjectOutputStream(new FileOutputStream("customers.ser"))) {
    out.writeObject(crs);
}

// OUTPUT:
// customers.ser contains the cached rows (no live connection)`],
            ['Compare with a DTO list.',
                r`List<Customer> dtos = repo.findAll();     // simpler, typed, no JDBC types leaked

// OUTPUT:
// preferred in modern code`]]
    ),

    'jdbc-best-practices': x(
        ['Use PreparedStatement for all SQL, try-with-resources for all resources, and a connection pool.',
            'Keep transactions short and always roll back on errors.',
            'Never log or expose passwords and never build SQL with string concatenation.'],
        ['Put data access in DAOs or repositories, map rows in one place, and keep SQL in constants or files.',
            'Set timeouts (connect, socket, query) and a sensible fetch size.',
            'Index columns you filter and join on, and verify plans with EXPLAIN.'],
        ['Use batching for bulk writes and streaming for large reads.',
            'Retry only transient errors with backoff; make operations idempotent.',
            'Monitor pool metrics, slow queries and error rates; add integration tests with a real database.'],
        [['F', 'Name three JDBC best practices.', 'PreparedStatement, try-with-resources and connection pooling.'],
            ['F', 'Why never concatenate user input into SQL?', 'It allows SQL injection.'],
            ['M', 'How do you avoid connection leaks?', 'Use try-with-resources everywhere and enable pool leak detection.'],
            ['M', 'Why set timeouts?', 'To prevent threads from waiting forever on a stuck network or query.'],
            ['S', 'How do you structure a JDBC data layer?', 'Repository interfaces, DataSource injected, RowMapper functions, explicit transaction boundaries in services, and tests against a container.'],
            ['S', 'How do you tune JDBC performance?', 'Batch writes, stream reads, right-size pool, indexes, prepared statement caching and fewer round trips.']],
        [['A small DAO with all the practices.',
            r`public class CustomerDao {
    private final DataSource ds;
    public Optional<Customer> find(long id) throws SQLException {
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement("SELECT id, name FROM customers WHERE id = ?")) {
            ps.setQueryTimeout(5);
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(new Customer(rs.getLong(1), rs.getString(2))) : Optional.empty();
            }
        }
    }
}

// OUTPUT:
// Optional[Customer[id=1, name=Abaji]]`],
            ['Integration test with Testcontainers.',
                r`@Testcontainers class CustomerDaoIT {
    @Container static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");
    @Test void findsCustomer() throws Exception { /* create schema, insert, assert dao.find(1) */ }
}

// OUTPUT:
// tests run against a real MySQL`]],
        [['Query timeout.',
            r`ps.setQueryTimeout(5);
// MySQL error when exceeded
// OUTPUT:
// java.sql.SQLTimeoutException: Statement cancelled due to timeout or client request`],
            ['Explain plan check.',
                r`EXPLAIN SELECT id, name FROM customers WHERE email = 'a@x.com';

-- OUTPUT:
-- type  | key
-- const | uq_email`]]
    )
};

export const jdbcDeep: Record<string, Deep> = {
    'introductiontojdbc': dv(
        [`JDBC is a set of interfaces; the driver supplies the implementation. A connection is a socket to the server speaking the MySQL protocol. A PreparedStatement sends the SQL (client-side emulation or server-side prepare), parameters are bound as typed values, the server executes and returns a result set that the driver wraps in a ResultSet. Closing in reverse order releases the cursor, the statement and finally the connection.`,
            r`try (Connection c = ds.getConnection();                                  // borrow a connection (socket)
     PreparedStatement ps = c.prepareStatement("SELECT id FROM orders WHERE customer_id = ?")) {
    ps.setLong(1, 7);                                                      // typed parameter
    try (ResultSet rs = ps.executeQuery()) {                               // cursor over rows
        while (rs.next()) System.out.println(rs.getLong(1));
    }
}                                                                          // closed in reverse order

// OUTPUT:
// 101
// 118`],
        [`Ways to get a connection: <code>DriverManager</code> (simple, new connection each time), <code>DataSource</code> (pooled, configurable), JNDI lookups in application servers. Ways to run SQL: <code>Statement</code>, <code>PreparedStatement</code>, <code>CallableStatement</code>. Ways to read: ResultSet getters, <code>getObject</code> with a type, RowSet.`,
            r`Connection a = DriverManager.getConnection(url, user, pass);               // simple, unpooled
Connection b = dataSource.getConnection();                                  // pooled
Object v = rs.getObject("created_on");                                      // driver-chosen type
LocalDate d = rs.getObject("created_on", LocalDate.class);                  // explicit type
String s = rs.getString("name");

// OUTPUT:
// DataSource connections are returned to the pool on close()`],
        [`Typical mistakes: not closing resources (leaks), concatenating SQL, ignoring timeouts, reading a column by wrong name, and swallowing SQLException. Use try-with-resources, parameters and meaningful exception handling.`,
            r`Statement st = c.createStatement();
ResultSet rs = st.executeQuery("SELECT * FROM users WHERE name = '" + name + "'");    // injection + leak
// correct
try (PreparedStatement ps = c.prepareStatement("SELECT id FROM users WHERE name = ?")) {
    ps.setString(1, name);
}

// OUTPUT:
// the first form leaks the statement and result set and is injectable`],
        [`Round trips dominate JDBC cost: each execute is a network call. Fewer, larger operations (batching, joins instead of loops, selecting only needed columns) beat many small ones.`,
            r`// 1000 customers + their order counts
// N+1: 1 + 1000 queries (about 1.2 s)
for (Customer cu : customers) { count(cu.id()); }
// one query (about 8 ms)
// SELECT c.id, COUNT(o.id) FROM customers c LEFT JOIN orders o ON o.customer_id = c.id GROUP BY c.id

// OUTPUT:
// 150x faster by reducing round trips`],
        [`Real-world: a tiny repository class wraps JDBC, and services call it. The same code is tested against a container and reused by scheduled jobs.`,
            r`public class OrderRepository {
    private final DataSource ds;
    public long insert(long customerId, BigDecimal total) throws SQLException {
        try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement("INSERT INTO orders (customer_id, total) VALUES (?, ?)", Statement.RETURN_GENERATED_KEYS)) {
            ps.setLong(1, customerId);
            ps.setBigDecimal(2, total);
            ps.executeUpdate();
            try (ResultSet k = ps.getGeneratedKeys()) {
                k.next();
                return k.getLong(1);
            }
        }
    }
}

// OUTPUT:
// 9121      (the new order id)`]
    ),

    'jdbc-connection-setup': dv(
        [`Opening a connection performs a TCP connect, optional TLS handshake, protocol handshake, authentication (caching_sha2_password involves a challenge and, on first use, an RSA exchange unless TLS is on) and session setup (charset, time zone, isolation, autocommit). That costs milliseconds, which is why pools exist. URL options become properties that tune this and later behaviour.`,
            r`Properties p = new Properties();
p.setProperty("user", "shop_app");
p.setProperty("password", System.getenv("DB_PASS"));
p.setProperty("sslMode", "VERIFY_IDENTITY");
p.setProperty("connectTimeout", "3000");
p.setProperty("socketTimeout", "30000");
long t0 = System.nanoTime();
try (Connection c = DriverManager.getConnection("jdbc:mysql://db.internal:3306/shop", p)) {
    System.out.println((System.nanoTime() - t0) / 1_000_000 + " ms to connect");
}

// OUTPUT:
// 38 ms to connect       (TLS and authentication included)`],
        [`Important URL properties: <code>sslMode</code>, <code>serverTimezone</code>/<code>connectionTimeZone</code>, <code>characterEncoding</code>, <code>allowPublicKeyRetrieval</code>, <code>useServerPrepStmts</code>, <code>cachePrepStmts</code>, <code>rewriteBatchedStatements</code>, <code>useCursorFetch</code>, <code>defaultFetchSize</code>, <code>failOverReadOnly</code> and multi-host failover URLs.`,
            r`jdbc:mysql://db1:3306,db2:3306/shop?sslMode=REQUIRED&serverTimezone=UTC&useServerPrepStmts=true&cachePrepStmts=true&prepStmtCacheSize=250&rewriteBatchedStatements=true&defaultFetchSize=1000

// OUTPUT:
// session: UTC time zone, TLS, prepared statement cache, batch rewrite, cursor fetch size 1000`],
        [`Mistakes: no timeouts, <code>allowPublicKeyRetrieval=true</code> on untrusted networks, mismatched time zone settings (dates off by hours), and connecting as root. Always set timeouts, verify TLS and use a dedicated account.`,
            r`// wrong time zone handling
ps.setTimestamp(1, Timestamp.valueOf(LocalDateTime.of(2026, 5, 1, 10, 0)));
// store UTC and convert at the edge
ps.setObject(1, OffsetDateTime.now(ZoneOffset.UTC));

// OUTPUT:
// stored 2026-05-01 10:00:00 UTC regardless of the application server time zone`],
        [`Connection storms (hundreds of services restarting) overwhelm authentication and thread creation. Pools, jittered retries and a thread cache on the server (<code>thread_cache_size</code>) smooth this out.`,
            r`SHOW GLOBAL STATUS WHERE Variable_name IN ('Connections','Threads_created','Threads_cached','Aborted_connects');

-- OUTPUT:
-- Connections     | 9120344
-- Threads_created |     412
-- Threads_cached  |      54`],
        [`Real-world configuration externalized per environment: the code reads the URL, user and password from environment variables so the same artifact runs everywhere.`,
            r`HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl(System.getenv("DB_URL"));
cfg.setUsername(System.getenv("DB_USER"));
cfg.setPassword(System.getenv("DB_PASS"));
cfg.setMaximumPoolSize(Integer.parseInt(System.getenv().getOrDefault("DB_POOL", "10")));

// OUTPUT:
// dev: pool 5 against localhost    prod: pool 10 against db.internal with TLS`]
    ),

    'jdbc-statement-types': dv(
        [`With a Statement the full SQL text is parsed on every call. With a PreparedStatement the driver (or the server, with server-side prepares) parses a template once and reuses it; parameter values travel as typed data in the binary protocol, so they are never interpreted as SQL. CallableStatement adds OUT parameter handling for procedures.`,
            r`String sql = "SELECT id, name FROM customers WHERE email = ?";
try (PreparedStatement ps = c.prepareStatement(sql)) {
    for (String e : emails) {
        ps.setString(1, e);                       // same template, new value
        try (ResultSet rs = ps.executeQuery()) { if (rs.next()) System.out.println(rs.getString("name")); }
    }
}

// OUTPUT:
// Abaji
// Raoji`],
        [`Execution methods: <code>executeQuery</code>, <code>executeUpdate</code>, <code>executeLargeUpdate</code>, <code>execute</code>, <code>executeBatch</code>. Options: <code>RETURN_GENERATED_KEYS</code>, result set type and concurrency, fetch size, max rows, query timeout.`,
            r`try (PreparedStatement ps = c.prepareStatement("INSERT INTO orders (customer_id, total) VALUES (?, ?)", Statement.RETURN_GENERATED_KEYS)) {
    ps.setQueryTimeout(5);
    ps.setMaxRows(100);
    ps.setLong(1, 7);
    ps.setBigDecimal(2, new BigDecimal("500.00"));
    long affected = ps.executeLargeUpdate();
    try (ResultSet k = ps.getGeneratedKeys()) {
        k.next();
        System.out.println(affected + " row, id " + k.getLong(1));
    }
}

// OUTPUT:
// 1 row, id 9121`],
        [`Mistakes: Statement with string concatenation, a new PreparedStatement per row in a loop (no reuse), forgetting to close statements (server-side prepared statement leak, error 1461), and binding wrong types (implicit conversion kills indexes).`,
            r`// bad: converts the column on every row
ps.setString(1, "9876543210");          // phone column is BIGINT: compare as a number instead
ps.setLong(1, 9876543210L);

// leak symptom
// OUTPUT:
// SQLException: Can't create more than max_prepared_stmt_count statements (current value: 16382)`],
        [`Performance options: reuse statements, enable statement caching (<code>cachePrepStmts</code>), use server-side prepares for repeated hot queries, and batch writes. Measure with and without; client-side emulation is often fastest for one-off queries.`,
            r`jdbc:mysql://db/shop?useServerPrepStmts=true&cachePrepStmts=true&prepStmtCacheSize=250&prepStmtCacheSqlLimit=2048

// OUTPUT:
// hot query latency: 0.42 ms (server prepared) vs 0.51 ms (client side) at 20k qps`],
        [`Real-world search: dynamic filters built from fixed fragments with every value bound, an allow-listed sort column, and a bounded page size.`,
            r`StringBuilder sql = new StringBuilder("SELECT id, name, price FROM products WHERE 1 = 1");
List<Object> params = new ArrayList<>();
if (category != null) {
    sql.append(" AND category_id = ?");
    params.add(category);
}
if (maxPrice != null) {
    sql.append(" AND price <= ?");
    params.add(maxPrice);
}
sql.append(" ORDER BY ").append(Set.of("name", "price").contains(sort) ? sort : "name").append(" LIMIT ?");
params.add(Math.min(size, 100));
try (PreparedStatement ps = c.prepareStatement(sql.toString())) {
    for (int i = 0; i < params.size(); i++) ps.setObject(i + 1, params.get(i));
}

// OUTPUT:
// SELECT id, name, price FROM products WHERE 1 = 1 AND category_id = ? ORDER BY price LIMIT ?`]
    ),

    'jdbc-result-set': dv(
        [`A ResultSet is a cursor positioned before the first row. By default MySQL Connector/J fetches the entire result into client memory (store result) and the cursor walks that buffer. Streaming mode (fetch size Integer.MIN_VALUE) reads rows one at a time from the socket; cursor fetch (<code>useCursorFetch</code>) asks the server for chunks.`,
            r`try (PreparedStatement ps = c.prepareStatement("SELECT id, name FROM customers ORDER BY id");
     ResultSet rs = ps.executeQuery()) {
    System.out.println("before first: " + rs.isBeforeFirst());
    while (rs.next()) System.out.println(rs.getRow() + ": " + rs.getString("name"));
}

// OUTPUT:
// before first: true
// 1: Abaji
// 2: Raoji`],
        [`Types: <code>TYPE_FORWARD_ONLY</code> (default), <code>TYPE_SCROLL_INSENSITIVE</code>; concurrency <code>CONCUR_READ_ONLY</code> or <code>CONCUR_UPDATABLE</code>. Navigate with next, previous, absolute, relative; read with typed getters; update in place with updateXxx and updateRow. Holdability controls whether a commit closes it.`,
            r`try (Statement st = c.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);
     ResultSet rs = st.executeQuery("SELECT id, name FROM customers ORDER BY id")) {
    rs.last();
    System.out.println("rows: " + rs.getRow());
    rs.absolute(1);
    rs.updateString("name", "Abaji R");
    rs.updateRow();
}

// OUTPUT:
// rows: 2`],
        [`Mistakes: reading by wrong index or name, ignoring NULL for primitives, using SELECT * (column order changes break index reads), and keeping a ResultSet open across layers. Read by label, use wrapper types or wasNull, and map inside the DAO.`,
            r`int age = rs.getInt("age");                      // NULL becomes 0
boolean wasNull = rs.wasNull();
Integer safe = rs.getObject("age", Integer.class);   // NULL stays null

// OUTPUT:
// age = 0, wasNull = true, safe = null`],
        [`Memory is the main risk: a 5-million-row result with default settings can exhaust the heap. Stream with fetch size, add LIMIT/keyset chunks, or push aggregation into SQL.`,
            r`try (PreparedStatement ps = c.prepareStatement("SELECT id, payload FROM events", ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY)) {
    ps.setFetchSize(Integer.MIN_VALUE);               // stream
    try (ResultSet rs = ps.executeQuery()) {
        long n = 0;
        while (rs.next()) n++;
        System.out.println(n);
    }
}

// OUTPUT:
// 5000000      (heap stays flat)`],
        [`Real-world: a CSV export streams rows straight to the response output without holding them all in memory.`,
            r`try (ResultSet rs = ps.executeQuery(); Writer w = new BufferedWriter(new OutputStreamWriter(response.getOutputStream(), UTF_8))) {
    while (rs.next()) { w.write(rs.getLong("id") + "," + csv(rs.getString("name")) + "\n"); }
}

// OUTPUT:
// id,name
// 1,Abaji`]
    ),

    'jdbc-stored-procedures': dv(
        [`A CallableStatement sends a CALL to the server. IN values are bound like prepared parameters; OUT and INOUT values come back in the final packet, which the driver stores so getXxx can read them after execution. Result sets produced inside the procedure are returned before the OUT values and must be consumed first.`,
            r`// CREATE PROCEDURE transfer(IN p_from INT, IN p_to INT, IN p_amt DECIMAL(10,2), OUT p_status VARCHAR(20))
try (CallableStatement cs = c.prepareCall("{call transfer(?, ?, ?, ?)}")) {
    cs.setInt(1, 1);
    cs.setInt(2, 2);
    cs.setBigDecimal(3, new BigDecimal("100.00"));
    cs.registerOutParameter(4, Types.VARCHAR);
    cs.execute();
    System.out.println(cs.getString(4));
}

// OUTPUT:
// OK`],
        [`Calling styles: escape syntax <code>{call name(?)}</code>, <code>{? = call fn(?)}</code> for functions, named parameters (driver dependent), and plain <code>CALL name(?)</code> through a PreparedStatement. Multiple result sets are walked with <code>getMoreResults()</code>.`,
            r`try (CallableStatement cs = c.prepareCall("{call report_summary(?)}")) {
    cs.setInt(1, 2026);
    boolean hasRs = cs.execute();
    while (hasRs) {
        try (ResultSet rs = cs.getResultSet()) { while (rs.next()) System.out.println(rs.getString(1)); }
        hasRs = cs.getMoreResults();
    }
}
try (CallableStatement fn = c.prepareCall("{? = call gst(?)}")) {
    fn.registerOutParameter(1, Types.DECIMAL);
    fn.setBigDecimal(2, new BigDecimal("100"));
    fn.execute();
}

// OUTPUT:
// Q1 ... Q2 ...`],
        [`Mistakes: reading OUT parameters before consuming result sets, forgetting registerOutParameter, procedures that start their own transaction while the JDBC connection also manages one, and losing error details. Define one transaction owner and map SQLSTATE 45000 messages.`,
            r`try { cs.execute(); }
catch (SQLException e) {
    if ("45000".equals(e.getSQLState())) throw new BusinessException(e.getMessage());     // raised with SIGNAL in the procedure
    throw e;
}

// OUTPUT:
// BusinessException: Insufficient funds`],
        [`A procedure saves round trips but its cost is inside the database. Monitor procedure statements through the Performance Schema and keep logic that scales with data close to it, while keeping business rules testable in code where practical.`,
            r`SELECT object_name, count_star, ROUND(sum_timer_wait / 1e9) AS total_ms FROM performance_schema.events_statements_summary_by_program WHERE object_type = 'PROCEDURE' ORDER BY sum_timer_wait DESC LIMIT 2;

-- OUTPUT:
-- object_name | count_star | total_ms
-- transfer    |    9120000 |   412000`],
        [`Real-world: month-end closing runs as one stored procedure called from a scheduled Java job, with a timeout and a clear status result.`,
            r`try (CallableStatement cs = c.prepareCall("{call close_month(?, ?)}")) {
    cs.setQueryTimeout(600);
    cs.setDate(1, java.sql.Date.valueOf("2026-04-01"));
    cs.registerOutParameter(2, Types.VARCHAR);
    cs.execute();
    log.info("close_month status = {}", cs.getString(2));
}

// OUTPUT:
// close_month status = OK`]
    ),

    'jdbc-transactions': dv(
        [`A JDBC transaction is the MySQL session transaction: <code>setAutoCommit(false)</code> issues START TRANSACTION behaviour, statements run on that one connection, <code>commit()</code> sends COMMIT and <code>rollback()</code> sends ROLLBACK. InnoDB holds row locks until the end, undo is kept for rollback and snapshots, and the redo log is flushed at commit.`,
            r`c.setAutoCommit(false);
try (PreparedStatement p1 = c.prepareStatement("UPDATE acct SET bal = bal - ? WHERE id = ? AND bal >= ?");
     PreparedStatement p2 = c.prepareStatement("UPDATE acct SET bal = bal + ? WHERE id = ?")) {
    p1.setBigDecimal(1, amt);
    p1.setLong(2, 1);
    p1.setBigDecimal(3, amt);
    if (p1.executeUpdate() == 0) {
        c.rollback();
        return;
    }
    p2.setBigDecimal(1, amt);
    p2.setLong(2, 2);
    p2.executeUpdate();
    c.commit();
}

// OUTPUT: (SQL)
// SET autocommit=0; UPDATE ...; UPDATE ...; COMMIT`],
        [`Tools: isolation (<code>setTransactionIsolation</code>), read-only hint (<code>setReadOnly(true)</code>), savepoints, <code>SELECT ... FOR UPDATE</code>, optimistic version checks (<code>WHERE version = ?</code>), and distributed transactions (XA) when needed.`,
            r`c.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
c.setReadOnly(true);
PreparedStatement lock = c.prepareStatement("SELECT balance FROM accounts WHERE id = ? FOR UPDATE");
PreparedStatement opt = c.prepareStatement("UPDATE docs SET body = ?, version = version + 1 WHERE id = ? AND version = ?");

// OUTPUT:
// optimistic update affected 0 rows => someone else changed it`],
        [`Mistakes: transactions left open on pooled connections, one transaction spread across several connections (not a transaction), user think-time inside a transaction, and ignoring deadlocks. Always commit or roll back in finally, restore auto-commit, retry deadlocks.`,
            r`Connection c = ds.getConnection();
try {
    c.setAutoCommit(false);
    work(c);
    c.commit();
}
catch (Exception e) {
    c.rollback();
    throw e;
}
finally {
    c.setAutoCommit(true);
    c.close();
}

// OUTPUT:
// the pooled connection is returned clean`],
        [`Short transactions scale. Measure lock waits and transaction age; shorten by doing slow work (HTTP calls, file I/O) before or after the transaction.`,
            r`SELECT trx_id, trx_started, TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS secs, trx_rows_locked FROM information_schema.innodb_trx ORDER BY trx_started LIMIT 2;

-- OUTPUT:
-- trx_id | trx_started         | secs | trx_rows_locked
-- 77123  | 2026-05-01 10:00:00 |  412 |              12     (too long: find the code path)`],
        [`Real-world transactional outbox: the business row and an event row are written in the same JDBC transaction, and a separate publisher sends events afterwards.`,
            r`c.setAutoCommit(false);
long orderId = insertOrder(c, customerId, total);
try (PreparedStatement ps = c.prepareStatement("INSERT INTO outbox (event, payload) VALUES (?, ?)")) {
    ps.setString(1, "ORDER_CREATED");
    ps.setString(2, "{\"orderId\":" + orderId + "}");
    ps.executeUpdate();
}
c.commit();

// OUTPUT:
// order and event committed atomically`]
    ),

    'jdbc-batch-processing': dv(
        [`Without batching each executeUpdate is one network round trip plus one server-side statement. addBatch stores parameter sets client-side; executeBatch sends them together. With <code>rewriteBatchedStatements=true</code> Connector/J rewrites compatible INSERTs into one multi-row INSERT (and other batches into multi-statement packets), cutting latency dramatically.`,
            r`String sql = "INSERT INTO events (user_id, kind) VALUES (?, ?)";
try (PreparedStatement ps = c.prepareStatement(sql)) {
    for (int i = 0; i < 1000; i++) {
        ps.setLong(1, i);
        ps.setString(2, "click");
        ps.addBatch();
    }
    int[] counts = ps.executeBatch();
    System.out.println(counts.length + " statements in one round trip");
}

// OUTPUT: (with rewriteBatchedStatements=true)
// 1000 statements in one round trip   (sent as: INSERT ... VALUES (...),(...),... )`],
        [`Variants: batch of one prepared statement with many parameter sets; batch of different statements on a Statement; large counts with <code>executeLargeBatch</code>; chunking; upserts; and generated keys for batches (supported with rewrite in recent drivers).`,
            r`int batchSize = 1000, n = 0;
c.setAutoCommit(false);
try (PreparedStatement ps = c.prepareStatement("INSERT INTO products (sku, name, price) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price)")) {
    for (Product p : products) {
        ps.setString(1, p.sku());
        ps.setString(2, p.name());
        ps.setBigDecimal(3, p.price());
        ps.addBatch();
        if (++n % batchSize == 0) {
            ps.executeBatch();
            c.commit();
        }
    }
    ps.executeBatch();
    c.commit();
}

// OUTPUT:
// idempotent import; reruns update existing rows`],
        [`Mistakes: forgetting the driver option (batches still send one statement at a time), a single enormous batch (memory and lock time), no transaction control, and not handling BatchUpdateException. Chunk, commit per chunk and inspect the update counts on failure.`,
            r`try {
    ps.executeBatch();
    c.commit();
}
catch (BatchUpdateException e) {
    c.rollback();
    int[] done = e.getUpdateCounts();
    log.error("batch failed after {} statements", done.length, e);
}

// OUTPUT:
// batch failed after 412 statements (Duplicate entry ...)`],
        [`Throughput scales with chunk size up to a point, then memory and lock time cost more than the saved round trips. Measure rows per second for several sizes.`,
            r`// 100,000 rows
// one by one: 92 s     batch 100: 6.3 s     batch 1000: 2.1 s     batch 10000: 2.0 s (diminishing)
System.out.println(92.0 / 2.1);

// OUTPUT:
// 43.8095...`],
        [`Real-world nightly import: read a file, validate, batch in chunks with an upsert, record counts and rejected rows.`,
            r`try (BufferedReader in = Files.newBufferedReader(path)) {
    String line;
    int n = 0, rejected = 0;
    while ((line = in.readLine()) != null) {
        Product p = parse(line);
        if (p == null) {
            rejected++;
            continue;
        }
        bind(ps, p);
        ps.addBatch();
        if (++n % 1000 == 0) {
            ps.executeBatch();
            c.commit();
        }
    }
    ps.executeBatch();
    c.commit();
    log.info("imported {} rows, rejected {}", n, rejected);
}

// OUTPUT:
// imported 412330 rows, rejected 12`]
    ),

    'jdbc-exception-handling': dv(
        [`When the server returns an error packet, the driver maps the MySQL error number and SQLSTATE to a Java exception. Specific subclasses (integrity violation, timeout, transient, non-transient connection) exist in JDBC 4. The exception chain holds the message, vendor code, SQLSTATE and the cause; try-with-resources attaches close failures as suppressed exceptions.`,
            r`try (PreparedStatement ps = c.prepareStatement("INSERT INTO users (email) VALUES (?)")) {
    ps.setString(1, "a@x.com");
    ps.executeUpdate();
} catch (SQLIntegrityConstraintViolationException e) {
    System.out.println("duplicate: " + e.getErrorCode() + " " + e.getSQLState());
} catch (SQLTimeoutException e) {
    System.out.println("timeout");
} catch (SQLException e) {
    System.out.println("other: " + e.getMessage());
}

// OUTPUT:
// duplicate: 1062 23000`],
        [`Common MySQL codes: 1062 duplicate key, 1451/1452 foreign key violations, 1213 deadlock, 1205 lock wait timeout, 1048 null not allowed, 1406 data too long, 2006/2013 connection lost. SQLSTATE classes: 23 integrity, 40 transaction rollback, 08 connection, 42 syntax/access.`,
            r`switch (e.getErrorCode()) {
    case 1062 -> throw new DuplicateException(e);
    case 1452 -> throw new InvalidReferenceException(e);
    case 1213, 1205 -> throw new RetryableException(e);
    default -> throw new DataAccessFailure(e);
}

// OUTPUT:
// RetryableException (caller retries the whole transaction)`],
        [`Mistakes: catching Exception and ignoring it, retrying non-transient errors forever, losing the original cause, showing SQL messages to users, and rolling back only some resources. Preserve causes, classify errors and log with context.`,
            r`// bad
try { dao.save(o); } catch (Exception e) { }
// good
try { dao.save(o); }
catch (DuplicateException e) { throw new ConflictException("order already exists", e); }
catch (RetryableException e) { retry.run(() -> dao.save(o)); }

// OUTPUT:
// 409 Conflict {"code":"ORDER_EXISTS"}   (no SQL details exposed)`],
        [`Retries must be bounded with backoff and jitter, and only for transient errors. Measure retry counts: a rising rate signals contention that needs a design fix, not more retries.`,
            r`int attempts = 0;
while (true) {
    try {
        service.transfer(from, to, amt);
        break;
    }
    catch (RetryableException e) {
        if (++attempts >= 3) throw e;
        Thread.sleep((long) (50 * Math.pow(2, attempts) + ThreadLocalRandom.current().nextInt(30)));
    }
}

// OUTPUT:
// transfer succeeded after 2 retries`],
        [`Real-world: a DAO boundary translates SQL errors into domain exceptions, so services and controllers never see JDBC types.`,
            r`public long create(Customer c) {
    try (Connection cn = ds.getConnection(); PreparedStatement ps = cn.prepareStatement("INSERT INTO customers (email, name) VALUES (?, ?)", RETURN_GENERATED_KEYS)) {
        ps.setString(1, c.email());
        ps.setString(2, c.name());
        ps.executeUpdate();
        try (ResultSet k = ps.getGeneratedKeys()) {
            k.next();
            return k.getLong(1);
        }
    } catch (SQLIntegrityConstraintViolationException e) { throw new EmailAlreadyUsed(c.email(), e);
    }
      catch (SQLException e) { throw new DataAccessFailure("create customer", e); }
}

// OUTPUT:
// EmailAlreadyUsed: a@x.com`]
    ),

    'jdbc-connection-pooling': dv(
        [`A pool opens connections ahead of time and keeps them in a concurrent data structure. getConnection hands out an idle one (or creates one up to the maximum, or waits up to the connection timeout). The returned object is a proxy: close() resets state (auto-commit, isolation, read-only) and returns the physical connection to the pool. A housekeeper thread retires old or broken connections.`,
            r`HikariConfig cfg = new HikariConfig();
cfg.setJdbcUrl(url);
cfg.setUsername(user);
cfg.setPassword(pass);
cfg.setMaximumPoolSize(10);
cfg.setMinimumIdle(10);  // fixed-size pool: recommended
cfg.setConnectionTimeout(3000);
cfg.setMaxLifetime(1_500_000);
cfg.setKeepaliveTime(300_000);
cfg.addDataSourceProperty("cachePrepStmts", "true");
HikariDataSource ds = new HikariDataSource(cfg);

// OUTPUT:
// HikariPool-1 - Start completed.`],
        [`Tuning settings: pool size, <code>connectionTimeout</code>, <code>maxLifetime</code>, <code>idleTimeout</code>, <code>keepaliveTime</code>, <code>validationTimeout</code>, <code>leakDetectionThreshold</code>, <code>connectionInitSql</code>, and metrics integration (Micrometer). Spring Boot exposes them as <code>spring.datasource.hikari.*</code>.`,
            r`spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=3000
spring.datasource.hikari.max-lifetime=1500000
spring.datasource.hikari.keepalive-time=300000
spring.datasource.hikari.leak-detection-threshold=20000
management.metrics.enable.hikaricp=true

// OUTPUT: (metrics)
// hikaricp.connections.active, hikaricp.connections.pending, hikaricp.connections.timeout`],
        [`Mistakes: oversized pools, summed pools above max_connections, a connection held during slow external calls, never closing connections, and maxLifetime longer than the server or firewall idle timeout (broken pipe). Use short transactions and size from measurements.`,
            r`// application log
// HikariPool-1 - Connection is not available, request timed out after 3000ms (total=10, active=10, idle=0, waiting=37)
// cause: slow queries and long transactions hold connections, not a pool that is too small

// OUTPUT:
// fix the slow path first; then reconsider the size`],
        [`Pool size and throughput: more connections than the database can execute in parallel only add queueing and contention. Test sizes under realistic load and look at p99 latency, not only throughput.`,
            r`// load test results (same service, same database)
// pool  5: 3,900 rps, p99  34 ms
// pool 10: 4,800 rps, p99  22 ms
// pool 50: 4,900 rps, p99  61 ms
// pool 200: 4,100 rps, p99 190 ms

// OUTPUT:
// best: 10 connections`],
        [`Real-world: many service instances share one database. Each service gets a capped pool, a proxy multiplexes the rest, and an alert fires when total connections pass 70% of max_connections.`,
            r`SELECT user, COUNT(*) AS conns FROM information_schema.processlist GROUP BY user ORDER BY conns DESC;
SELECT @@max_connections AS max_connections, VARIABLE_VALUE AS max_used FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Max_used_connections';

-- OUTPUT:
-- user         | conns
-- orders_app   |    60
-- payments_app |    40`]
    ),

    'jdbc-row-set': dv(
        [`RowSet types extend ResultSet. A JdbcRowSet keeps its connection and wraps a ResultSet as a JavaBean (properties like url, command, username). A CachedRowSet reads all rows into memory, then disconnects; edits are tracked per row (original and current values), and acceptChanges reconnects, checks the original values against the database (optimistic) and applies updates.`,
            r`RowSetFactory factory = RowSetProvider.newFactory();
try (CachedRowSet crs = factory.createCachedRowSet()) {
    crs.setCommand("SELECT id, name FROM customers WHERE id < ?");
    crs.setInt(1, 10);
    crs.execute(connection);                         // loads rows into memory
    System.out.println(crs.size() + " rows cached, connection no longer needed");
}

// OUTPUT:
// 2 rows cached, connection no longer needed`],
        [`Other types: <code>FilteredRowSet</code> (client-side filtering with predicates), <code>JoinRowSet</code> (join cached row sets in memory), <code>WebRowSet</code> (read and write XML). Pagination: <code>setPageSize</code> and <code>nextPage</code>.`,
            r`CachedRowSet crs = factory.createCachedRowSet();
crs.setPageSize(100);
crs.setCommand("SELECT id, name FROM customers ORDER BY id");
crs.execute(connection);
do { while (crs.next()) process(crs.getLong("id")); } while (crs.nextPage());

FilteredRowSet frs = factory.createFilteredRowSet();
frs.setFilter(new Predicate() {
    public boolean evaluate(RowSet rs) {
        try { return rs.getInt("age") > 30; } catch (SQLException e) { return false; }
    }
    public boolean evaluate(Object v, int col) { return true; }
    public boolean evaluate(Object v, String col) { return true; }
});

// OUTPUT:
// paged load of the cached customers; client-side filter on age`],
        [`Mistakes: caching big results (memory), assuming acceptChanges is safe under concurrent writers (it fails when originals changed), and using RowSets across threads. They are mostly historical; prefer DTO lists and explicit UPDATE statements.`,
            r`crs.absolute(1);
crs.updateString("name", "Abaji R");
crs.updateRow();
try { crs.acceptChanges(connection); }
catch (SyncProviderException e) {
    System.out.println("conflict: another transaction changed the row");
}

// OUTPUT:
// conflict: another transaction changed the row`],
        [`Cost model: the whole result lives in the heap, and acceptChanges issues one UPDATE per changed row with all original column values in the WHERE clause. For large or hot tables write explicit SQL.`,
            r`UPDATE customers SET name = ? WHERE id = ? AND name = ? AND email = ? AND created_on = ?;
-- shape of the generated statement

-- OUTPUT:
-- Query OK, 1 row affected   (0 rows affected => synchronization conflict)`],
        [`Real-world: a legacy desktop form loads a small lookup list into a CachedRowSet, lets the user edit offline, and synchronizes later; new code would use DTOs and explicit updates.`,
            r`List<Customer> dtos = new ArrayList<>();
for (crs.beforeFirst(); crs.next(); ) dtos.add(new Customer(crs.getLong("id"), crs.getString("name")));
// modern replacement: repository.findAll() and repository.save(dto)

// OUTPUT:
// the same data as a simple list of records`]
    ),

    'jdbc-best-practices': dv(
        [`Production JDBC is about discipline around a small API: every resource closed, every statement parameterized, every call bounded in time, every transaction short and explicit, and every failure classified. Most outages trace to leaks, missing timeouts or long transactions rather than SQL syntax.`,
            r`public <T> T inTransaction(SqlFunction<Connection, T> work) throws SQLException {
    try (Connection c = ds.getConnection()) {
        c.setAutoCommit(false);
        try {
            T r = work.apply(c);
            c.commit();
            return r;
        }
        catch (Exception e) {
            c.rollback();
            throw e;
        }
        finally { c.setAutoCommit(true); }
    }
}

// OUTPUT:
// one place that owns commit, rollback and cleanup for every unit of work`],
        [`Configuration checklist: pool with leak detection, connect/socket/query timeouts, TLS with verification, a least-privilege account, <code>rewriteBatchedStatements</code>, a sensible fetch size for large reads, statement caching where it helps, and read replicas for reporting.`,
            r`spring.datasource.hikari.leak-detection-threshold=20000
jdbc:mysql://db:3306/shop?sslMode=VERIFY_IDENTITY&connectTimeout=3000&socketTimeout=30000&rewriteBatchedStatements=true&defaultFetchSize=1000
ps.setQueryTimeout(10);

// OUTPUT:
// any stuck call fails within 10 seconds instead of hanging a thread`],
        [`Mistakes: logging parameters that contain secrets, huge IN lists, SELECT * with wide rows, querying in loops, unbounded result sets, and tests that mock the database so SQL errors only appear in production. Add integration tests against a real MySQL and limit result sizes.`,
            r`// unbounded
SELECT * FROM events;
// bounded and indexed
SELECT id, kind, created_at FROM events WHERE user_id = ? AND created_at >= ? ORDER BY created_at DESC, id DESC LIMIT 100;

// OUTPUT:
// the bounded form returns at most 100 rows using an index`],
        [`Observe: pool metrics, slow query log, digest tables, statements per request and rows examined. Review the top queries weekly and fix indexes or access patterns.`,
            r`SELECT LEFT(digest_text, 60) AS q, count_star, ROUND(avg_timer_wait/1e9, 2) AS avg_ms, ROUND(sum_rows_examined / count_star) AS rows_examined FROM performance_schema.events_statements_summary_by_digest ORDER BY sum_timer_wait DESC LIMIT 3;

-- OUTPUT:
-- q                                     | count_star | avg_ms | rows_examined
-- SELECT id , name FROM customers WHERE | 9120344    | 0.42   | 1`],
        [`Real-world service template: DataSource bean, repositories with explicit SQL, a transaction helper, a health check query, and Testcontainers tests running migrations before each test class.`,
            r`@Bean HealthIndicator db(DataSource ds) {
    return () -> { try (Connection c = ds.getConnection()) {
        return c.isValid(2) ? Health.up().build() : Health.down().build();
    } catch (SQLException e) { return Health.down(e).build(); }
    };
}

// OUTPUT:
// {"status":"UP","components":{"db":{"status":"UP"}}}`]
    )
};
