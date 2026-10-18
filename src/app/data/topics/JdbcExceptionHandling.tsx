import { Topic } from '../coreJava';

export const jdbcExceptionHandling: Topic = {
    id: 'jdbc-exception-handling',
    name: 'JDBC Exception Handling',
    beginner: [
        {
            content: `Almost every JDBC method that talks to the database can throw <code>SQLException</code>, a checked
exception. Handling it correctly - and closing resources properly - is what separates toy code from
production-safe code. As usual, we use <code>employees(id, name, salary, department)</code>.`
        },
        {
            content: `<h3>1. Catching SQLException</h3>
<code>SQLException</code> carries three useful pieces of information: a human-readable message, a
vendor-specific error code, and a standardized 5-character SQLState.`,
            codeExamples: [`import java.sql.*;

public class SqlExceptionDemo {
    public static void main(String[] args) {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "wrongPassword");
             Statement stmt = con.createStatement()) {

            stmt.executeQuery("SELECT * FROM employees");

        } catch (SQLException e) {
            System.out.println("Message: " + e.getMessage());
            System.out.println("SQLState: " + e.getSQLState());
            System.out.println("Error Code: " + e.getErrorCode());
        }
    }
}
// OUTPUT:
// Message: Access denied for user 'root'@'localhost' (using password: YES)
// SQLState: 28000
// Error Code: 1045`]
        },
        {
            content: `<h3>2. try-with-resources: Auto-Closing Connection, Statement, ResultSet</h3>
<code>Connection</code>, <code>Statement</code>, and <code>ResultSet</code> all implement
<code>AutoCloseable</code>. Declaring them in a try-with-resources statement guarantees they are closed
- in reverse order of declaration - even if an exception is thrown, with no manual
<code>finally</code> block needed.`,
            codeExamples: [`import java.sql.*;

public class TryWithResourcesDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/company";

        try (Connection con = DriverManager.getConnection(url, "root", "password");
             PreparedStatement pstmt = con.prepareStatement("SELECT name FROM employees WHERE id = ?")) {

            pstmt.setInt(1, 1);

            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    System.out.println("Employee: " + rs.getString("name"));
                }
            }
        } catch (SQLException e) {
            System.out.println("Database error: " + e.getMessage());
        }
        // rs, pstmt, and con are all closed automatically, in that order
    }
}
// OUTPUT:
// Employee: Ajabrao`]
        },
        {
            content: `<h4>3. What Happens Without try-with-resources</h4>
Forgetting to close resources leaks database cursors and connections. This version shows the manual
(error-prone) equivalent - notice how much boilerplate is needed just to close things safely.`,
            codeExamples: [`import java.sql.*;

public class ManualCloseDemo {
    public static void main(String[] args) {
        Connection con = null;
        Statement stmt = null;
        ResultSet rs = null;
        try {
            con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/company", "root", "password");
            stmt = con.createStatement();
            rs = stmt.executeQuery("SELECT name FROM employees");
            while (rs.next()) {
                System.out.println(rs.getString("name"));
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            // must close in reverse order, and each close() can itself throw!
            try { if (rs != null) rs.close(); } catch (SQLException ignored) {}
            try { if (stmt != null) stmt.close(); } catch (SQLException ignored) {}
            try { if (con != null) con.close(); } catch (SQLException ignored) {}
        }
    }
}
// OUTPUT:
// Ajabrao
// Bhavna
// Chetan`]
        }
    ],

    expert: [
        {
            content: `<h3>The SQLException Hierarchy</h3>
<code>java.sql.SQLException</code> extends <code>java.lang.Exception</code> (it is checked) and has
several specialized subclasses that let you branch handling logic by failure category instead of
parsing error messages.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Class</th><th>Thrown When</th></tr>
<tr class='text-center'><td>SQLException</td><td>Base class - any general database access error</td></tr>
<tr class='text-center'><td>SQLTimeoutException</td><td>A driver/DB-enforced operation (e.g. query, login) exceeds its configured timeout</td></tr>
<tr class='text-center'><td>SQLIntegrityConstraintViolationException</td><td>A constraint (unique key, foreign key, not-null) is violated</td></tr>
<tr class='text-center'><td>SQLSyntaxErrorException</td><td>Malformed SQL text</td></tr>
<tr class='text-center'><td>BatchUpdateException</td><td>One or more statements in a batch (see Batch Processing topic) fail</td></tr>
<tr class='text-center'><td>SQLTransientException</td><td>A transient error where retrying the same operation might succeed (e.g. brief network blip)</td></tr>
<tr class='text-center'><td>SQLRecoverableException</td><td>Recovery is required first: close the connection, obtain a new one, then retry the WHOLE transaction</td></tr>
</table>`
        },
        {
            content: `<h3>Chained Exceptions and getNextException()</h3>
Unlike ordinary Java exceptions which chain via <code>getCause()</code>, JDBC drivers can also attach a
sibling chain of <code>SQLException</code>s via <code>getNextException()</code> - used when a single
operation (notably a batch) produces multiple independent database-side errors that all need to be
reported, not just the first one.`,
            codeExamples: [`try {
    // ... batch operation that fails on multiple statements ...
} catch (SQLException e) {
    SQLException current = e;
    while (current != null) {
        System.out.println("Error: " + current.getMessage() + " SQLState=" + current.getSQLState());
        current = current.getNextException();
    }
}`]
        },
        {
            content: `<h3>Production Pitfall: Resource Leaks from Not Closing Connections</h3>
The single most common JDBC bug in production code is a connection that is opened but never reliably
closed on every code path - especially the exception path. Symptoms build up slowly: the pool's active
connections climb over hours/days until <code>getConnection()</code> starts timing out with
"connection is not available, request timed out" even though the database itself is healthy. Root
causes seen repeatedly in real codebases: <br>
• Manual <code>finally</code> blocks that close <code>rs</code> and <code>stmt</code> but forget
<code>con</code> (or vice versa). <br>
• An exception thrown between <code>getConnection()</code> and the try block that should have wrapped it. <br>
• Returning early from a method before reaching the close() calls. <br><br>
try-with-resources eliminates essentially all of these, which is why it is considered mandatory, not
optional, for JDBC code in any real codebase.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Is SQLException checked or unchecked?</td><td>Checked - it extends java.lang.Exception, so calling code must catch it or declare it with throws.</td></tr>
<tr><td>What three pieces of diagnostic info does SQLException expose?</td><td>getMessage() (human-readable text), getSQLState() (standardized 5-character state code), and getErrorCode() (vendor-specific numeric code).</td></tr>
<tr><td>Why does JDBC have getNextException() in addition to getCause()?</td><td>A single operation like a batch can produce multiple independent database errors; getNextException() chains all of them as siblings, while getCause() reflects normal Java exception wrapping.</td></tr>
<tr><td>What does try-with-resources guarantee for Connection/Statement/ResultSet?</td><td>They are all AutoCloseable, so try-with-resources closes them automatically in reverse declaration order, even when an exception is thrown, without needing manual finally blocks.</td></tr>
<tr><td>What is the most common real-world JDBC resource leak, and its symptom?</td><td>Connections opened but not reliably closed on every code path (especially exception paths), which slowly exhausts the connection pool until getConnection() starts timing out.</td></tr>
<tr><td>Give an example of a specific SQLException subclass and when it's thrown.</td><td>SQLIntegrityConstraintViolationException is thrown when an INSERT/UPDATE violates a unique key, foreign key, or not-null constraint.</td></tr>
<tr><td>What does BatchUpdateException.getUpdateCounts() tell you?</td><td>The affected-row counts for the statements in the batch that completed before/around the failure, useful for figuring out how much of the batch actually succeeded.</td></tr>
</table>`
        }
    ]
};
