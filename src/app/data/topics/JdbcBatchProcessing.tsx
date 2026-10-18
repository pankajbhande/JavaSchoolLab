import { Topic } from '../coreJava';

export const jdbcBatchProcessing: Topic = {
    id: 'jdbc-batch-processing',
    name: 'Batch Processing',
    beginner: [
        {
            content: `Inserting rows into <code>employees(id, name, salary, department)</code> one at a time, each with its
own round-trip to the database, is slow when you have hundreds or thousands of rows. <strong>Batch
processing</strong> groups multiple statements and sends them together.`
        },
        {
            content: `<h3>1. The Slow Way: One executeUpdate() per Row</h3>
Each call is a separate network round-trip to the database.`,
            codeExamples: [`import java.sql.*;
import java.util.List;

public class SlowInsertDemo {
    public static void main(String[] args) throws SQLException {
        List<String> names = List.of("Ajabrao", "Bhavna", "Chetan");

        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             PreparedStatement pstmt = con.prepareStatement(
                     "INSERT INTO employees (name, salary, department) VALUES (?, ?, ?)")) {

            for (String name : names) {
                pstmt.setString(1, name);
                pstmt.setDouble(2, 50000);
                pstmt.setString(3, "IT");
                pstmt.executeUpdate(); // one round-trip per row
            }
            System.out.println("Inserted " + names.size() + " rows individually");
        }
    }
}
// OUTPUT:
// Inserted 3 rows individually`]
        },
        {
            content: `<h3>2. The Fast Way: addBatch() and executeBatch()</h3>
Queue up statements with <code>addBatch()</code>, then send them all in one shot with
<code>executeBatch()</code>. It returns an <code>int[]</code> where each element is the affected-row
count for that statement in the batch.`,
            codeExamples: [`import java.sql.*;
import java.util.List;

public class BatchInsertDemo {
    public static void main(String[] args) throws SQLException {
        List<String> names = List.of("Deepa", "Esha", "Farhan");

        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             PreparedStatement pstmt = con.prepareStatement(
                     "INSERT INTO employees (name, salary, department) VALUES (?, ?, ?)")) {

            for (String name : names) {
                pstmt.setString(1, name);
                pstmt.setDouble(2, 55000);
                pstmt.setString(3, "HR");
                pstmt.addBatch(); // queue, don't send yet
            }

            int[] results = pstmt.executeBatch(); // one round-trip for all 3
            System.out.println("Rows affected per statement: " + results.length);
        }
    }
}
// OUTPUT:
// Rows affected per statement: 3`]
        },
        {
            content: `<h4>Batching with a Plain Statement</h4>
Batch processing also works with plain <code>Statement</code> for multiple different SQL strings, though
<code>PreparedStatement</code> batching (same SQL, different parameters) is far more common.`,
            codeExamples: [`import java.sql.*;

public class StatementBatchDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             Statement stmt = con.createStatement()) {

            stmt.addBatch("UPDATE employees SET salary = salary + 1000 WHERE department = 'IT'");
            stmt.addBatch("UPDATE employees SET salary = salary + 500 WHERE department = 'HR'");

            int[] counts = stmt.executeBatch();
            System.out.println("Statements executed: " + counts.length);
        }
    }
}
// OUTPUT:
// Statements executed: 2`]
        }
    ],

    expert: [
        {
            content: `<h3>Why Batching Is Faster</h3>
Without batching, each <code>executeUpdate()</code> pays the full round-trip cost: network latency,
server-side statement dispatch, and (for non-prepared statements) re-parsing. Batching amortizes the
network round-trip across many statements - the driver packs multiple parameter sets into fewer wire
messages (with MySQL Connector/J, this requires <code>rewriteBatchedStatements=true</code> in the URL to
actually rewrite the batch into a single multi-row INSERT; without it, "batching" may still send one
statement per row under the hood on some driver versions).`
        },
        {
            content: `<h3>Rough Performance Numbers: Individual vs Batched Inserts</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Rows</th><th>Individual executeUpdate()</th><th>Batched (batch size 500)</th></tr>
<tr class='text-center'><td>1,000</td><td>~2-4 seconds</td><td>~0.2-0.4 seconds</td></tr>
<tr class='text-center'><td>10,000</td><td>~20-40 seconds</td><td>~1.5-3 seconds</td></tr>
<tr class='text-center'><td>100,000</td><td>~3-6 minutes</td><td>~10-20 seconds</td></tr>
</table>
<br>
Exact numbers vary hugely by network latency, DB engine, and hardware - the point is the relative gap:
batching commonly yields a <strong>5-15x</strong> speedup for bulk inserts by collapsing round-trips.`
        },
        {
            content: `<h3>Batch Size Tuning and BatchUpdateException</h3>
Sending one giant batch (e.g. all 1,000,000 rows at once) can exhaust driver/server memory buffers and
makes failures expensive to diagnose - if row 999,000 violates a constraint, you may have already lost
track of which of the prior 998,999 succeeded, depending on driver behavior. Common practice: batch in
chunks of a few hundred to a few thousand rows, calling <code>executeBatch()</code> (and
<code>clearBatch()</code> if reusing the statement) periodically.<br><br>
If any statement in a batch fails, the driver throws <code>BatchUpdateException</code>, whose
<code>getUpdateCounts()</code> tells you how many statements before the failure succeeded (behavior
varies: some drivers stop at the first failure, others continue and report per-statement outcomes with
<code>Statement.EXECUTE_FAILED</code> markers - always check driver-specific docs).`,
            codeExamples: [`import java.sql.*;

public class ChunkedBatchDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             PreparedStatement pstmt = con.prepareStatement(
                     "INSERT INTO employees (name, salary, department) VALUES (?, ?, ?)")) {

            con.setAutoCommit(false);
            int batchSize = 500;
            int count = 0;

            for (int i = 0; i < 5000; i++) {
                pstmt.setString(1, "Employee" + i);
                pstmt.setDouble(2, 50000);
                pstmt.setString(3, "Ops");
                pstmt.addBatch();

                if (++count % batchSize == 0) {
                    pstmt.executeBatch(); // flush every 500 rows
                    pstmt.clearBatch();
                }
            }
            pstmt.executeBatch(); // flush the remainder
            con.commit();
            System.out.println("Inserted 5000 rows in chunks of 500");
        } catch (BatchUpdateException bue) {
            System.out.println("Batch failed after " + bue.getUpdateCounts().length + " statements");
        }
    }
}
// OUTPUT:
// Inserted 5000 rows in chunks of 500`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What do addBatch() and executeBatch() do?</td><td>addBatch() queues a statement's current parameters without sending them; executeBatch() sends the whole queued group in one call and returns an int[] of per-statement affected-row counts.</td></tr>
<tr><td>Why is batching faster than individual executeUpdate() calls?</td><td>It amortizes the network round-trip cost across many statements instead of paying it per row; with some drivers/configurations it also lets the server process the batch as a single multi-row operation.</td></tr>
<tr><td>What MySQL Connector/J URL parameter is often needed to get real batching gains?</td><td>rewriteBatchedStatements=true, which rewrites a batch of inserts into a single multi-row INSERT statement under the hood.</td></tr>
<tr><td>What exception is thrown when a statement in a batch fails?</td><td>BatchUpdateException, whose getUpdateCounts() reports how many statements completed (behavior on partial success varies by driver).</td></tr>
<tr><td>Why not send one enormous batch of a million rows at once?</td><td>It risks exhausting driver/server memory buffers and makes failure diagnosis harder; chunking into a few hundred/thousand rows per executeBatch() call is safer and often just as fast.</td></tr>
<tr><td>Does batching work with plain Statement, not just PreparedStatement?</td><td>Yes - Statement.addBatch(String sql) queues arbitrary SQL strings, though PreparedStatement batching of one parameterized SQL shape is far more common and efficient.</td></tr>
<tr><td>Should auto-commit be on or off during large batch inserts?</td><td>Off - committing after each individual statement inside a large batch adds massive overhead; disable auto-commit, run the batch(es), then commit once (or per chunk).</td></tr>
</table>`
        }
    ]
};
