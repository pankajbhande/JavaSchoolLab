import { Topic } from '../coreJava';

export const jdbcConnectionPooling: Topic = {
    id: 'jdbc-connection-pooling',
    name: 'Connection Pooling',
    beginner: [
        {
            content: `Every example so far opened a fresh <code>Connection</code> with <code>DriverManager</code>. That's
fine for learning, but real applications serving many requests against
<code>employees(id, name, salary, department)</code> need something smarter: a <strong>connection
pool</strong>.`
        },
        {
            content: `<h3>1. Why Raw DriverManager Connections Don't Scale</h3>
Opening a connection involves a TCP handshake and database authentication - typically tens of
milliseconds. If every web request opens and closes its own connection, that overhead is paid on every
single request, and the database's limited connection slots can be exhausted under load.`,
            codeExamples: [`// Doing this per HTTP request does not scale:
Connection con = DriverManager.getConnection(url, user, password); // ~20-50ms overhead
// ... use con ...
con.close(); // socket torn down, all that setup cost is thrown away`]
        },
        {
            content: `<h3>2. The DataSource Interface</h3>
<code>javax.sql.DataSource</code> is JDBC's standard abstraction for "something that hands out
connections." A pooling library implements it; your application code barely changes - instead of
<code>DriverManager.getConnection(...)</code> you call <code>dataSource.getConnection()</code>.`,
            codeExamples: [`import javax.sql.DataSource;
import java.sql.*;

public class DataSourceUsageDemo {
    public static void main(String[] args) throws SQLException {
        DataSource dataSource = createPooledDataSource(); // set up elsewhere, once

        try (Connection con = dataSource.getConnection();
             PreparedStatement pstmt = con.prepareStatement("SELECT COUNT(*) FROM employees");
             ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                System.out.println("Employee count: " + rs.getInt(1));
            }
        }
        // con.close() here returns the connection to the pool, it does not
        // actually close the underlying socket.
    }

    static DataSource createPooledDataSource() {
        // See the HikariCP example below.
        return null;
    }
}
// OUTPUT:
// Employee count: 3`]
        },
        {
            content: `<h3>3. HikariCP - the De Facto Standard Pool</h3>
HikariCP is configured once at application startup, then handed out via a
<code>Connection con = dataSource.getConnection()</code> call anywhere you need a connection.`,
            codeExamples: [`import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import java.sql.*;

public class HikariSetupDemo {
    public static void main(String[] args) throws SQLException {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/company");
        config.setUsername("root");
        config.setPassword("password");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000); // ms to wait for a free connection

        DataSource dataSource = new HikariDataSource(config);

        try (Connection con = dataSource.getConnection();
             Statement stmt = con.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT name FROM employees WHERE department = 'IT'")) {
            while (rs.next()) {
                System.out.println(rs.getString("name"));
            }
        }
    }
}
// OUTPUT:
// Aarav
// Bhavna`]
        }
    ],

    expert: [
        {
            content: `<h3>How a Connection Pool Works Internally</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Startup:  pool opens minimumIdle real connections up front (handshake cost paid once)

getConnection():
   pool has an idle connection? --> hand it out immediately (borrowed)
   pool at maximumPoolSize and all busy? --> caller blocks up to connectionTimeout,
                                              then throws SQLTransientConnectionException

close() (on the wrapped Connection):
   NOT a real close - the physical socket stays open
   connection is validated/reset (auto-commit restored, pending transaction
   rolled back if any) and returned to the idle set for reuse</pre>
This is why pooled <code>Connection</code> objects are actually thin proxy/wrapper objects around a
real JDBC connection - calling <code>close()</code> on the proxy triggers pool bookkeeping instead of a
socket teardown.`
        },
        {
            content: `<h3>DriverManager vs DataSource/Pool - Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>DriverManager</th><th>Pooled DataSource</th></tr>
<tr class='text-center'><td>Connection creation</td><td>New TCP handshake every call</td><td>Reuses pre-opened connections</td></tr>
<tr class='text-center'><td>Cost per "getConnection"</td><td>Tens of milliseconds</td><td>Sub-millisecond (borrow from idle set)</td></tr>
<tr class='text-center'><td>Behavior under load</td><td>Can exhaust DB's max_connections</td><td>Caps concurrent connections at maximumPoolSize</td></tr>
<tr class='text-center'><td>close() semantics</td><td>Actually closes the socket</td><td>Returns connection to the pool for reuse</td></tr>
<tr class='text-center'><td>Typical use</td><td>Demos, scripts, learning</td><td>Any real web/service application</td></tr>
</table>`
        },
        {
            content: `<h3>Pool Sizing - Beyond "Just Set It High"</h3>
A larger pool is not automatically better - each pooled connection consumes a real database-side
resource (memory, a worker thread/process on some databases), and too many connections can cause more
contention than they relieve, since the database itself has a limited number of CPU cores to actually
execute queries concurrently. HikariCP's own guidance, echoing research from PostgreSQL's
"PgBouncer" documentation, suggests a starting formula: <br><br>
<code>connections = ((core_count * 2) + effective_spindle_count)</code> <br><br>
For a typical modern server with SSD storage (effective_spindle_count ~= 1) and 8 cores, that's roughly
<strong>17 connections</strong> - often far smaller than the "just use 100" instinct, and it should be
tuned per-service and validated with load testing, not treated as a universal constant.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Why doesn't DriverManager.getConnection() scale for production traffic?</td><td>Every call pays a full TCP handshake and DB authentication cost (tens of milliseconds), and under load it can exhaust the database's max_connections limit since nothing caps concurrent connection creation.</td></tr>
<tr><td>What does calling close() on a pooled Connection actually do?</td><td>It does not close the underlying socket - it resets connection state (auto-commit, pending transaction) and returns the connection to the pool's idle set for the next borrower.</td></tr>
<tr><td>What interface does a connection pool implement so application code stays unchanged?</td><td>javax.sql.DataSource - code calls dataSource.getConnection() instead of DriverManager.getConnection(url, user, pwd).</td></tr>
<tr><td>What happens when getConnection() is called and the pool is exhausted?</td><td>The caller blocks up to the configured connection timeout, then throws a timeout/connection-unavailable exception (e.g. SQLTransientConnectionException in HikariCP) rather than blocking forever.</td></tr>
<tr><td>Why isn't a bigger maximumPoolSize always better?</td><td>Each connection consumes real database-side resources, and the database can only execute so many queries concurrently given its CPU cores; oversized pools can increase contention rather than throughput.</td></tr>
<tr><td>What does HikariCP's pool sizing formula suggest, roughly?</td><td>connections = (core_count * 2) + effective_spindle_count - for an 8-core SSD-backed server that's roughly 17, much smaller than many teams' first instinct.</td></tr>
<tr><td>What is a typical symptom of connection pool exhaustion in production?</td><td>getConnection() calls start timing out or throwing even though the database itself is healthy, because all pooled connections are checked out and none are being returned (often due to a leak - see Exception Handling topic).</td></tr>
</table>`
        }
    ]
};
