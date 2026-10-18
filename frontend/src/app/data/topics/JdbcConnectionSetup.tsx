import { Topic } from '../coreJava';

export const jdbcConnectionSetup: Topic = {
    id: 'jdbc-connection-setup',
    name: 'Connection Setup',
    beginner: [
        {
            content: `Before you can run any SQL from Java, you need a live <strong>Connection</strong> to the database. <br><br>
Throughout this topic we assume a MySQL database <code>company</code> with a table: <br><br>
<code>employees(id INT, name VARCHAR(50), salary DOUBLE, department VARCHAR(50))</code> <br><br>
Setting up a connection has three ingredients: <br>
• The JDBC <strong>driver</strong> (a JAR on your classpath, e.g. <code>mysql-connector-j</code>). <br>
• A <strong>connection URL</strong> describing where the database lives. <br>
• Credentials (<strong>username</strong> / <strong>password</strong>).`
        },
        {
            content: `<h3>1. Loading the Driver</h3>
Modern JDBC (4.0+) auto-discovers the driver JAR on the classpath, so you usually do not need to call
anything explicitly. Older code (and some interview answers) still show <code>Class.forName(...)</code> -
it is harmless to include, it just forces the driver class to load early.`,
            codeExamples: [`public class LoadDriverDemo {
    public static void main(String[] args) throws ClassNotFoundException {
        // Optional in modern JDBC - forces the driver class to load and
        // register itself with DriverManager right now instead of lazily.
        Class.forName("com.mysql.cj.jdbc.Driver");
        System.out.println("Driver loaded successfully");
    }
}
// OUTPUT:
// Driver loaded successfully`]
        },
        {
            content: `<h3>2. DriverManager.getConnection()</h3>
<code>DriverManager.getConnection(url, user, password)</code> opens a real network connection to the
database and returns a <code>Connection</code> object. This is the single most important object in JDBC -
every <code>Statement</code>, transaction, and query flows through it.`,
            codeExamples: [`import java.sql.Connection;
import java.sql.DriverManager;

public class GetConnectionDemo {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:mysql://localhost:3306/company";
        String user = "root";
        String password = "password";

        Connection con = DriverManager.getConnection(url, user, password);
        System.out.println("Connected: " + !con.isClosed());

        con.close();
    }
}
// OUTPUT:
// Connected: true`]
        },
        {
            content: `<h3>3. Anatomy of a Connection URL</h3>
A JDBC URL has three parts: the fixed <code>jdbc:</code> prefix, the vendor sub-protocol, and connection
details.<br><br>
<code>jdbc:mysql://localhost:3306/company</code> <br>
• <code>jdbc:</code> - always present, tells DriverManager this is a JDBC URL. <br>
• <code>mysql:</code> - the sub-protocol; DriverManager uses this to pick the matching driver. <br>
• <code>//localhost:3306</code> - host and port the database server listens on (3306 is MySQL's default). <br>
• <code>/company</code> - the specific database (schema) to connect to. <br><br>
You can also append options, e.g. <code>?useSSL=false&amp;serverTimezone=UTC</code>.`
        },
        {
            content: `<h4>Handling Connection Failures</h4>
If the host is unreachable, the credentials are wrong, or the database does not exist,
<code>getConnection()</code> throws a checked <code>SQLException</code>. Always handle it - do not let a
down database crash your whole application with an unchecked stack trace.`,
            codeExamples: [`import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class ConnectionFailureDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/company";

        try (Connection con = DriverManager.getConnection(url, "root", "wrongPassword")) {
            System.out.println("Connected!");
        } catch (SQLException e) {
            System.out.println("Failed to connect: " + e.getMessage());
            System.out.println("SQL State: " + e.getSQLState());
            System.out.println("Error Code: " + e.getErrorCode());
        }
    }
}
// OUTPUT:
// Failed to connect: Access denied for user 'root'@'localhost' (using password: YES)
// SQL State: 28000
// Error Code: 1045`]
        }
    ],

    expert: [
        {
            content: `<h3>What Actually Happens Inside getConnection()</h3>
<code>DriverManager.getConnection(url, user, pwd)</code> loops through every registered <code>Driver</code>
(loaded either explicitly via <code>Class.forName</code> or auto-registered via the JDBC 4.0 Service
Provider mechanism, <code>META-INF/services/java.sql.Driver</code>) and calls
<code>driver.acceptsURL(url)</code> on each until one returns true. That driver then opens the actual
TCP socket, performs the database's authentication handshake, and negotiates protocol/charset details
before the <code>Connection</code> object is handed back.<br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">DriverManager.getConnection(url, user, pwd)
   |
   |-- for each registered Driver d:
   |       if d.acceptsURL(url) -> d.connect(url, props)
   |
   v
Chosen Driver opens TCP socket -> DB auth handshake -> Connection object returned</pre>
This lookup happens on <em>every single call</em> - there is no caching at the DriverManager level,
which is exactly why raw <code>DriverManager</code> connections do not scale (see the Connection Pooling
topic).`
        },
        {
            content: `<h3>Connection URL Options That Matter in Production</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Parameter</th><th>Purpose</th><th>Common Pitfall</th></tr>
<tr class='text-center'><td>useSSL</td><td>Encrypts the wire protocol</td><td>Leaving it unset in newer MySQL drivers throws a loud warning and may default to a slow SSL negotiation</td></tr>
<tr class='text-center'><td>serverTimezone</td><td>Aligns JVM and DB timezone for date/time columns</td><td>Mismatch silently shifts timestamps by hours - a notorious production bug</td></tr>
<tr class='text-center'><td>connectTimeout</td><td>Milliseconds to wait for the socket to open</td><td>Default can be very long, so a dead DB host hangs the app thread instead of failing fast</td></tr>
<tr class='text-center'><td>autoReconnect</td><td>Attempts to silently reopen a dropped connection</td><td>Deprecated/unreliable in MySQL Connector/J - masks real failures instead of surfacing them; pools handle this better</td></tr>
<tr class='text-center'><td>characterEncoding</td><td>Controls text encoding over the wire</td><td>Mismatched encoding corrupts non-ASCII names (e.g. accented characters in "name" column)</td></tr>
</table>`
        },
        {
            content: `<h3>Common Pitfall: Leaking Connections on Startup</h3>
A frequent production bug: opening a <code>Connection</code> in a static initializer or singleton
without ever closing it, because "the app needs a DB connection the whole time it runs." This defeats
pooling, holds a socket (and often a DB-side session/lock) for the app's entire lifetime, and can exhaust
the database's <code>max_connections</code> limit when the app is scaled to multiple instances.<br><br>
The fix is almost always: don't hold a single long-lived raw connection - obtain short-lived connections
from a pool (<code>DataSource</code>) per unit of work, and always close them (ideally via
try-with-resources) as soon as the work is done.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Is Class.forName() required to load a JDBC driver today?</td><td>No - since JDBC 4.0, drivers on the classpath are auto-registered via the Service Provider mechanism (META-INF/services/java.sql.Driver); Class.forName() is legacy but harmless.</td></tr>
<tr><td>What are the three parts of a JDBC URL like jdbc:mysql://localhost:3306/company?</td><td>The fixed jdbc: prefix, the vendor sub-protocol (mysql), and the connection details (host, port, database name), optionally followed by query-string options.</td></tr>
<tr><td>What exception type does getConnection() throw on failure?</td><td>A checked java.sql.SQLException, which also carries a vendor-specific error code and a standardized SQLState string.</td></tr>
<tr><td>How does DriverManager pick which Driver to use for a URL?</td><td>It iterates all registered Driver instances and calls acceptsURL(url) on each until one returns true.</td></tr>
<tr><td>Why is opening a Connection considered expensive?</td><td>It involves a TCP handshake plus the database's authentication and session-setup steps, typically tens of milliseconds - far more than executing a simple query.</td></tr>
<tr><td>What problem can the serverTimezone URL parameter cause if misconfigured?</td><td>Timestamp/date values can be silently shifted by hours because the JVM and database disagree on timezone interpretation.</td></tr>
<tr><td>Why is holding one static long-lived Connection for an app's entire lifetime a bad idea?</td><td>It defeats connection pooling, ties up a DB-side session/lock indefinitely, and can exhaust the database's max_connections limit under scale.</td></tr>
</table>`
        }
    ]
};
