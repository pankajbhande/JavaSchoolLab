import { Topic } from '../coreJava';

export const jdbcBestPractices: Topic = {
    id: 'jdbc-best-practices',
    name: 'JDBC Production Best Practices',
    beginner: [
        {
            content: `Having seen connections, statements, transactions, batching, pooling, and exceptions individually, this
topic pulls them together into the habits real production code follows. As always, our example table is
<code>employees(id, name, salary, department)</code>.`
        },
        {
            content: `<h3>1. Never Scatter Raw JDBC Calls Through Business Code</h3>
Mixing SQL and JDBC boilerplate directly inside business logic makes code hard to test and duplicate-
prone. The <strong>DAO (Data Access Object)</strong> pattern isolates all database access behind a
small, focused interface.`,
            codeExamples: [`import java.sql.*;
import java.util.*;

public class EmployeeDao {
    private final javax.sql.DataSource dataSource;

    public EmployeeDao(javax.sql.DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Optional<Employee> findById(int id) throws SQLException {
        String sql = "SELECT id, name, salary, department FROM employees WHERE id = ?";
        try (Connection con = dataSource.getConnection();
             PreparedStatement pstmt = con.prepareStatement(sql)) {

            pstmt.setInt(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new Employee(
                            rs.getInt("id"), rs.getString("name"),
                            rs.getDouble("salary"), rs.getString("department")));
                }
                return Optional.empty();
            }
        }
    }

    record Employee(int id, String name, double salary, String department) {}
}
// Business code calls dao.findById(1) and never sees a Connection or SQL string.`]
        },
        {
            content: `<h3>2. Always try-with-resources, Always PreparedStatement</h3>
Two rules with almost no exceptions in production code: close JDBC resources with try-with-resources,
and use <code>PreparedStatement</code> (never raw <code>Statement</code> with concatenated values) for
anything touching external input.`,
            codeExamples: [`public boolean updateSalary(int id, double newSalary, javax.sql.DataSource ds) throws SQLException {
    String sql = "UPDATE employees SET salary = ? WHERE id = ?";
    try (Connection con = ds.getConnection();
         PreparedStatement pstmt = con.prepareStatement(sql)) {
        pstmt.setDouble(1, newSalary);
        pstmt.setInt(2, id);
        return pstmt.executeUpdate() == 1;
    }
}
// OUTPUT (id=1 exists):
// true`]
        },
        {
            content: `<h3>3. Get Connections from a Pool, Not DriverManager</h3>
Production code obtains a <code>DataSource</code> (backed by HikariCP or similar) configured once at
startup, and every DAO method borrows/returns a connection through it - never calling
<code>DriverManager.getConnection()</code> per request.`
        }
    ],

    expert: [
        {
            content: `<h3>The DAO Pattern in Depth</h3>
A well-formed DAO: <br>
• Accepts a <code>DataSource</code> (or connection-supplying abstraction) via constructor injection,
never opens connections itself with hardcoded credentials. <br>
• Fully materializes results (into POJOs/records) before returning - never leaks a live
<code>ResultSet</code> or <code>Connection</code> past its own methods (see the ResultSet topic's
"used after close" pitfall). <br>
• Keeps one method = one unit of work, so transaction boundaries are obvious and can be composed by a
calling service layer that manages <code>commit()</code>/<code>rollback()</code> when multiple DAO calls
must be atomic. <br>
• Wraps <code>SQLException</code> into an application-specific unchecked exception at the boundary,
so callers throughout the codebase aren't forced to handle checked SQL exceptions everywhere.`
        },
        {
            content: `<h3>Symptom -&gt; Root Cause -&gt; Diagnosis -&gt; Fix</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Root Cause</th><th>Diagnosis</th><th>Fix</th></tr>
<tr class='text-center'><td>Pool's active connections grow steadily until getConnection() times out</td><td>Connections opened but not closed on some code path (esp. exceptions)</td><td>Pool metrics show active count rising and never dropping; thread dumps/leak-detection logs show connections opened long ago</td><td>Use try-with-resources everywhere; enable HikariCP's leakDetectionThreshold to log stack traces of long-held connections</td></tr>
<tr class='text-center'><td>Random getConnection() timeouts under moderate load, DB itself is idle</td><td>Pool exhaustion - maximumPoolSize too small, or connections held too long (e.g. slow external call made while holding a connection)</td><td>Pool stats show maxPoolSize reached with high wait counts while DB CPU/connections are low</td><td>Right-size the pool (see the sizing formula in Connection Pooling), and never hold a connection across a slow non-DB operation</td></tr>
<tr class='text-center'><td>Specific queries take seconds instead of milliseconds under production data volume</td><td>Missing index on a WHERE/JOIN/ORDER BY column, fine at small dev-data scale</td><td>EXPLAIN/EXPLAIN ANALYZE shows a full table scan instead of an index seek</td><td>Add the appropriate index; verify with EXPLAIN that the plan now uses it, and monitor slow-query logs going forward</td></tr>
<tr class='text-center'><td>Occasional SQL injection findings in security scans</td><td>Raw Statement with string-concatenated user input somewhere in the codebase</td><td>Grep for Statement/executeQuery combined with string concatenation or "+ variable"</td><td>Replace with PreparedStatement and bound parameters; add a static-analysis rule to prevent regressions</td></tr>
<tr class='text-center'><td>Bulk import job runs far longer than expected</td><td>Per-row executeUpdate() instead of batched inserts, or auto-commit left on during the loop</td><td>Profiling shows time dominated by network round-trips rather than DB CPU</td><td>Use addBatch()/executeBatch() in chunks with auto-commit off, per the Batch Processing topic</td></tr>
</table>`
        },
        {
            content: `<h3>Defense in Depth: PreparedStatement Is Not the Whole Story</h3>
Parameterized queries eliminate classic SQL injection through bound values, but production security
also requires: least-privilege database accounts (the app's DB user should not have DROP/ALTER
permissions it never needs), never building dynamic table/column names from user input (parameter
binding cannot protect identifiers, only values - identifiers must be validated against an allow-list),
and treating ORM-generated or hand-rolled dynamic SQL fragments with the same scrutiny as raw
concatenation, since ORMs can still be misused to build unsafe queries (e.g. native/HQL queries built
with string concatenation).`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the DAO pattern and why is it used with JDBC?</td><td>Data Access Object - it isolates all SQL/JDBC calls behind a focused interface/class so business logic never directly handles Connections, Statements, or SQL strings, improving testability and reducing duplication.</td></tr>
<tr><td>Why must a DAO fully materialize results before returning them?</td><td>Because ResultSet/Connection are only valid while open; returning a live ResultSet after its try-with-resources block closes throws an exception when accessed, so rows should be mapped into POJOs/records inside the DAO method.</td></tr>
<tr><td>What three things should essentially every JDBC production method use together?</td><td>A pooled DataSource (not DriverManager) for connections, PreparedStatement for any SQL with external input, and try-with-resources to guarantee closing.</td></tr>
<tr><td>A connection pool's active count keeps rising until timeouts occur - what's the likely cause and fix?</td><td>A connection leak from a code path (often an exception path) that opens but never closes a Connection; fix by auditing for missing try-with-resources and enabling leak detection.</td></tr>
<tr><td>Why can't PreparedStatement parameter binding protect a dynamically chosen table or column name?</td><td>Bound parameters are only substituted as literal data values, not SQL syntax/identifiers; a variable table/column name must instead be validated against a fixed allow-list before being concatenated into the SQL text.</td></tr>
<tr><td>A specific query suddenly becomes slow only in production, not in dev - what's the first thing to check?</td><td>Run EXPLAIN/EXPLAIN ANALYZE on the query against production-scale data to check whether it's doing a full table scan due to a missing index, since dev data volumes often hide this.</td></tr>
<tr><td>Why should auto-commit be disabled during a large batch import?</td><td>Leaving auto-commit on forces a commit after every individual statement, adding massive per-row overhead; disabling it and committing per chunk (with addBatch/executeBatch) is dramatically faster.</td></tr>
</table>`
        }
    ]
};
