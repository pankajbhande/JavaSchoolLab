import { Topic } from '../coreJava';

export const introductionToJdbc: Topic = {
                        id: 'introductiontojdbc',
                        name: 'Introduction to JDBC',
                        beginner: [
                            {
                                content: `JDBC (Java Database Connectivity) is an API for connecting and executing queries with databases.

 JDBC Components:
 • DriverManager: Manages database drivers
 • Connection: Establishes connection to database
 • Statement: Executes SQL queries
 • ResultSet: Holds query results
 • SQLException: Handles database errors`,
                                codeExamples: [
                                    `import java.sql.*;

 public class JDBCExample {
     public static void main(String[] args) {
         String url = "jdbc:mysql://localhost:3306/school";
         String user = "root";
         String password = "password";

         try {
             // Load driver
             Class.forName("com.mysql.cj.jdbc.Driver");

             // Establish connection
             Connection con = DriverManager.getConnection(url, user, password);

             // Create statement
             Statement stmt = con.createStatement();

             // Execute query
             ResultSet rs = stmt.executeQuery("SELECT * FROM students");

             // Process results
             while (rs.next()) {
                 System.out.println(rs.getInt("id") + " " + rs.getString("name"));
             }

             // Close connections
             rs.close();
             stmt.close();
             con.close();
         } catch (Exception e) {
             e.printStackTrace();
         }
     }
 }`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>JDBC Architecture - How the Pieces Fit Together</h3>
JDBC is a layer of interfaces defined in <code>java.sql</code> / <code>javax.sql</code>. Your code only ever talks to these interfaces - the actual database-specific work is done by a <strong>driver</strong> (a JAR supplied by the database vendor, e.g. <code>mysql-connector-j</code>, <code>ojdbc</code>, <code>postgresql</code>) that implements them.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Your Application
      |
      | Class.forName(...) / DriverManager.getConnection(url, user, pwd)
      v
+----------------+        registers with        +------------------------+
|  DriverManager |------------------------------>|  Driver (vendor JAR)   |
+----------------+                               +------------------------+
      |                                                     |
      | returns                                             | talks to
      v                                                     v
+----------------+                               +------------------------+
|   Connection   |<----------------------------->|   Actual Database      |
+----------------+       TCP / native protocol   +------------------------+
      |
      | createStatement() / prepareStatement(sql) / prepareCall(proc)
      v
+----------------+     +--------------------+     +----------------------+
|   Statement    | --> | PreparedStatement  | --> | CallableStatement    |
+----------------+     +--------------------+     +----------------------+
      |
      | executeQuery(sql)
      v
+----------------+
|   ResultSet    |   <-- cursor over rows returned by the database
+----------------+</pre>

<h4>Role of each component</h4>
• <strong>DriverManager</strong>: maintains a registry of loaded <code>Driver</code> implementations and hands out <code>Connection</code> objects by matching the JDBC URL prefix (e.g. <code>jdbc:mysql:</code>) to the right driver. <br>
• <strong>Driver</strong>: vendor-specific implementation that knows the wire protocol of a particular database. Since JDBC 4.0, drivers are auto-discovered via <code>META-INF/services/java.sql.Driver</code> (Service Provider Interface), so <code>Class.forName("com.mysql.cj.jdbc.Driver")</code> is usually no longer required, though it's still seen in legacy code. <br>
• <strong>Connection</strong>: represents a live session/socket with the database - the most expensive object to create (network handshake, authentication). <br>
• <strong>Statement family</strong>: the vehicle for sending SQL and receiving results - see the comparison below. <br>
• <strong>ResultSet</strong>: a forward-moving (by default) cursor over the result rows; it stays open only as long as its parent <code>Statement</code>/<code>Connection</code> is open.<br>`
                            },
                            {
                                content: `<h3>Statement vs PreparedStatement vs CallableStatement</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Statement</th>
<th>PreparedStatement</th>
<th>CallableStatement</th>
</tr>
<tr class='text-center'><td>Purpose</td><td>Static/ad-hoc SQL</td><td>Parameterized SQL, reused with different values</td><td>Calling stored procedures/functions</td></tr>
<tr class='text-center'><td>SQL compiled</td><td>Every execution (usually)</td><td>Once, then re-used (query plan cached by DB)</td><td>Once, procedure already compiled in DB</td></tr>
<tr class='text-center'><td>Parameters</td><td>None - values string-concatenated into SQL</td><td><code>?</code> placeholders bound via <code>setXxx()</code></td><td><code>?</code> placeholders + IN/OUT/INOUT params</td></tr>
<tr class='text-center'><td>SQL Injection risk</td><td>High if user input is concatenated</td><td>Effectively eliminated - values are sent as data, never parsed as SQL</td><td>Same protection as PreparedStatement</td></tr>
<tr class='text-center'><td>Performance (repeated calls)</td><td>Slower - re-parsed each time</td><td>Faster - plan can be cached/reused</td><td>Fast - procedure logic lives in DB</td></tr>
<tr class='text-center'><td>Extends</td><td>-</td><td>Statement</td><td>PreparedStatement</td></tr>
</table>
<br>`
                            },
                            {
                                content: `<h3>Proof: SQL Injection with Statement vs Safe PreparedStatement</h3>
Concatenating user input directly into SQL text lets an attacker change the meaning of the query. Below, entering <code>' OR '1'='1</code> as the "username" turns the WHERE clause into something that is always true, exposing every row.<br><br>
This example requires a live database with a <code>users</code> table to actually run - it is shown here as complete, correct JDBC code with the exact behaviour explained in comments.<br>`,
                                codeExamples: [
                                    `import java.sql.*;

public class VulnerableLogin {
    public static void main(String[] args) throws SQLException {
        Connection con = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/school", "root", "password");

        String usernameFromUser = "admin' OR '1'='1"; // attacker-supplied input
        String passwordFromUser = "anything";

        Statement stmt = con.createStatement();

        // DANGEROUS: string concatenation builds SQL from raw input
        String sql = "SELECT * FROM users WHERE username = '" + usernameFromUser +
                     "' AND password = '" + passwordFromUser + "'";
        System.out.println("Executed SQL: " + sql);

        ResultSet rs = stmt.executeQuery(sql);
        while (rs.next()) {
            System.out.println("Logged in as: " + rs.getString("username"));
        }
        rs.close();
        stmt.close();
        con.close();
    }
}
// OUTPUT (against a users table with several rows, run on a live DB):
// Executed SQL: SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = 'anything'
// Logged in as: admin
// Logged in as: anaji
// Logged in as: admin      <-- AND binds tighter than OR, so this matched the admin row
//                            and bypassed the password check entirely`,
                                    `import java.sql.*;

public class SafeLogin {
    public static void main(String[] args) throws SQLException {
        Connection con = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/school", "root", "password");

        String usernameFromUser = "admin' OR '1'='1"; // same malicious input
        String passwordFromUser = "anything";

        // SAFE: "?" placeholders - values are never parsed as SQL syntax
        String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
        try (PreparedStatement pstmt = con.prepareStatement(sql)) {
            pstmt.setString(1, usernameFromUser);
            pstmt.setString(2, passwordFromUser);

            try (ResultSet rs = pstmt.executeQuery()) {
                boolean found = false;
                while (rs.next()) {
                    found = true;
                    System.out.println("Logged in as: " + rs.getString("username"));
                }
                if (!found) {
                    System.out.println("Login failed: no matching user");
                }
            }
        }
        con.close();
    }
}
// OUTPUT (run on a live DB - the malicious string is treated as a literal value):
// Login failed: no matching user`
                                ]
                            },
                            {
                                content: `<h3>CallableStatement - Invoking a Stored Procedure</h3>
Requires a live database with the referenced stored procedure created beforehand (e.g. a MySQL/Oracle procedure <code>GetStudentCount</code> that returns a count via an OUT parameter).<br>`,
                                codeExamples: [
                                    `import java.sql.*;

public class CallableStatementDemo {
    public static void main(String[] args) throws SQLException {
        Connection con = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/school", "root", "password");

        // Assumes: CREATE PROCEDURE GetStudentCount(OUT total INT)
        //          BEGIN SELECT COUNT(*) INTO total FROM students; END
        try (CallableStatement cstmt = con.prepareCall("{call GetStudentCount(?)}")) {
            cstmt.registerOutParameter(1, Types.INTEGER);
            cstmt.execute();
            int total = cstmt.getInt(1);
            System.out.println("Total students: " + total);
        }
        con.close();
    }
}
// OUTPUT (on a live DB with, say, 42 rows in the students table):
// Total students: 42`
                                ]
                            },
                            {
                                content: `<h3>Connection Pooling - Why Production Code Never Calls DriverManager Directly</h3>
Opening a <code>Connection</code> involves a TCP handshake, authentication, and session setup on the database side - typically tens of milliseconds. Creating and destroying a connection per request under real traffic quickly exhausts database resources and kills throughput.<br><br>

A <strong>connection pool</strong> (e.g. HikariCP, Apache Commons DBCP, or a pool built into an app server / <code>DataSource</code>) solves this by:<br>
• Opening a fixed number of connections once, up front. <br>
• Handing out an already-open connection when the application calls <code>dataSource.getConnection()</code>. <br>
• Reclaiming the connection back into the pool (not actually closing the socket) when the application calls <code>connection.close()</code>. <br>
• Validating/recycling connections that go stale or are held too long. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Without pooling                       With pooling
------------------                     -------------
Request 1 -> open conn -> close        Request 1 -> borrow conn --\\
Request 2 -> open conn -> close                                    |--> Pool (N pre-opened
Request 3 -> open conn -> close        Request 2 -> borrow conn --/      real connections)
   (handshake cost paid every time)    Request 3 -> borrow conn --/
                                           (handshake cost paid ONCE at startup)</pre>

<code>DriverManager.getConnection()</code> is fine for demos and this course's simple examples, but production code obtains a <code>javax.sql.DataSource</code> from a pool and calls <code>dataSource.getConnection()</code> instead - the calling code doesn't change (still <code>Connection</code>, <code>Statement</code>, <code>ResultSet</code>), only where the connection comes from changes.<br>`,
                                codeExamples: [
                                    `// Typical pattern with HikariCP (requires the HikariCP jar on the classpath)
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import java.sql.*;

public class PooledDbAccess {
    public static void main(String[] args) throws SQLException {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:mysql://localhost:3306/school");
        config.setUsername("root");
        config.setPassword("password");
        config.setMaximumPoolSize(10); // pool keeps up to 10 real connections ready

        DataSource dataSource = new HikariDataSource(config);

        // Each call below borrows a connection from the pool instead of
        // opening a brand-new socket to the database.
        try (Connection con = dataSource.getConnection();
             PreparedStatement pstmt = con.prepareStatement("SELECT COUNT(*) FROM students");
             ResultSet rs = pstmt.executeQuery()) {
            if (rs.next()) {
                System.out.println("Student count: " + rs.getInt(1));
            }
        }
        // con.close() above returns the connection to the pool, it is not
        // actually torn down - the next caller reuses it instantly.
    }
}
// OUTPUT (against a live pooled DB):
// Student count: 42`
                                ]
                            },
                            {
                                content: `<h3>Transaction Management - setAutoCommit, commit, rollback</h3>
By default a JDBC connection runs in <strong>auto-commit mode</strong>: every individual SQL statement is committed to the database the instant it executes. For a multi-step operation that must succeed or fail as a single unit (e.g. debit one account and credit another), auto-commit is wrong - a crash between the two statements would leave the data inconsistent.<br><br>

The fix: turn auto-commit off, run all the statements, then explicitly <code>commit()</code> if everything succeeded or <code>rollback()</code> if any step failed.<br>`,
                                codeExamples: [
                                    `import java.sql.*;

public class TransferFundsDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/bank";
        try (Connection con = DriverManager.getConnection(url, "root", "password")) {

            con.setAutoCommit(false); // start a manual transaction

            try (PreparedStatement debit = con.prepareStatement(
                     "UPDATE accounts SET balance = balance - ? WHERE id = ?");
                 PreparedStatement credit = con.prepareStatement(
                     "UPDATE accounts SET balance = balance + ? WHERE id = ?")) {

                debit.setDouble(1, 500);
                debit.setInt(2, 101);
                debit.executeUpdate();

                // Simulate a failure AFTER the debit but BEFORE the credit
                // by uncommenting the next line - without a transaction,
                // this would leave account 101 permanently short of 500.
                // if (true) throw new RuntimeException("Network glitch");

                credit.setDouble(1, 500);
                credit.setInt(2, 202);
                credit.executeUpdate();

                con.commit(); // both updates succeeded - make them permanent together
                System.out.println("Transfer committed successfully");

            } catch (Exception ex) {
                con.rollback(); // undo the debit too - all-or-nothing
                System.out.println("Transfer failed, rolled back: " + ex.getMessage());
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
// OUTPUT (happy path, run on a live DB):
// Transfer committed successfully
//
// OUTPUT (if the simulated failure line is uncommented):
// Transfer failed, rolled back: Network glitch
// (account 101's balance is unchanged - the partial debit was undone)`
                                ]
                            },
                            {
                                content: `<h3>try-with-resources for JDBC Objects</h3>
<code>Connection</code>, <code>Statement</code>, <code>PreparedStatement</code>, <code>CallableStatement</code>, and <code>ResultSet</code> all implement <code>AutoCloseable</code>. Just like in the Exception Handling module, try-with-resources guarantees each of these is closed - in reverse order of creation - even if an exception is thrown, without needing a manual <code>finally</code> block.<br>`,
                                codeExamples: [
                                    `import java.sql.*;

public class TryWithResourcesJdbc {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/school";

        // Connection, PreparedStatement and ResultSet are all declared as
        // resources - the JVM closes rs, then pstmt, then con automatically,
        // even if executeQuery() or the loop below throws.
        try (Connection con = DriverManager.getConnection(url, "root", "password");
             PreparedStatement pstmt = con.prepareStatement("SELECT id, name FROM students WHERE id > ?")) {

            pstmt.setInt(1, 0);

            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    System.out.println(rs.getInt("id") + " " + rs.getString("name"));
                }
            }

        } catch (SQLException e) {
            System.out.println("Database error: " + e.getMessage());
        }
        // No explicit rs.close() / pstmt.close() / con.close() needed - all
        // three were closed automatically when each try block exited.
    }
}
// OUTPUT (against a live students table with rows 1..3):
// 1 Ajabrao
// 2 Bhavna
// 3 Chetan`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between Statement and PreparedStatement?</td><td>Statement executes static SQL that is re-parsed every time and is vulnerable to SQL injection via string concatenation; PreparedStatement uses "?" placeholders, is compiled/cached once, is faster on repeated execution, and prevents SQL injection because parameter values are sent as data, never parsed as SQL syntax.</td></tr>
<tr class='text-center'><td>Why does PreparedStatement prevent SQL injection?</td><td>Bound parameters are transmitted to the database separately from the SQL text and substituted as literal values, not as part of the query grammar, so an attacker's input can never change the structure of the query.</td></tr>
<tr class='text-center'><td>What is a CallableStatement used for?</td><td>Invoking stored procedures/functions in the database, including support for IN, OUT and INOUT parameters via registerOutParameter().</td></tr>
<tr class='text-center'><td>What is connection pooling and why is it needed?</td><td>A pool of pre-opened Connection objects that are borrowed and returned instead of opened/closed per request; it avoids the expensive TCP handshake and authentication cost of creating a new connection every time, which is critical for throughput in production.</td></tr>
<tr class='text-center'><td>What does setAutoCommit(false) do?</td><td>Disables the default behaviour where every statement is committed immediately, allowing multiple statements to be grouped into one transaction that is committed or rolled back as a unit via commit()/rollback().</td></tr>
<tr class='text-center'><td>What happens if you call rollback() after commit()?</td><td>Nothing to undo - once commit() succeeds the changes are permanent; rollback() only reverts statements executed since the last commit (or since the transaction began).</td></tr>
<tr class='text-center'><td>Why use try-with-resources with JDBC objects?</td><td>Connection, Statement and ResultSet all implement AutoCloseable; try-with-resources guarantees they are closed in reverse order automatically, even on exception, avoiding leaked connections/cursors that manual finally blocks are prone to forgetting.</td></tr>
<tr class='text-center'><td>What is the role of DriverManager?</td><td>It maintains the registry of loaded JDBC Driver implementations and returns a Connection by matching the "jdbc:&lt;subprotocol&gt;:" prefix of the URL to the appropriate registered driver.</td></tr>
<tr class='text-center'><td>Is Class.forName("...Driver") still required in modern JDBC?</td><td>No - since JDBC 4.0, drivers are auto-registered via the Service Provider mechanism (META-INF/services/java.sql.Driver) as long as the driver JAR is on the classpath; the explicit Class.forName call is legacy but harmless.</td></tr>
<tr class='text-center'><td>What is the default cursor behaviour of a ResultSet?</td><td>Forward-only and read-only by default - you can only call next() to move ahead one row at a time, unless the Statement/PreparedStatement is created with TYPE_SCROLL_INSENSITIVE and CONCUR_UPDATABLE for scrollable/updatable result sets.</td></tr>
</table>`
                            }
                        ]
                    };
