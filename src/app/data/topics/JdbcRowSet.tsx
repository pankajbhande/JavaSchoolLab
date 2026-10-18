import { Topic } from '../coreJava';

export const jdbcRowSet: Topic = {
    id: 'jdbc-row-set',
    name: 'RowSet',
    beginner: [
        {
            content: `A <strong>RowSet</strong> (<code>javax.sql.RowSet</code>) is a JavaBean-friendly wrapper around
tabular data, built on top of <code>ResultSet</code>. It adds things plain ResultSet lacks: being
easily constructed, configured with setter methods, and (for some flavors) usable after the original
connection is closed. We continue with <code>employees(id, name, salary, department)</code>.`
        },
        {
            content: `<h3>1. RowSet as a JavaBean</h3>
Unlike <code>ResultSet</code>, which you only ever get back from a <code>Statement</code>, a
<code>RowSet</code> implementation can be constructed directly and configured with plain setters -
useful for GUI data-binding and simpler wiring.`,
            codeExamples: [`import javax.sql.rowset.RowSetProvider;
import javax.sql.rowset.CachedRowSet;
import java.sql.SQLException;

public class RowSetBeanDemo {
    public static void main(String[] args) throws SQLException {
        CachedRowSet rowSet = RowSetProvider.newFactory().createCachedRowSet();

        // Configured like a JavaBean, not passed into a constructor
        rowSet.setUrl("jdbc:mysql://localhost:3306/company");
        rowSet.setUsername("root");
        rowSet.setPassword("password");
        rowSet.setCommand("SELECT id, name, salary FROM employees WHERE department = ?");
        rowSet.setString(1, "IT");

        rowSet.execute();

        while (rowSet.next()) {
            System.out.println(rowSet.getString("name") + " - " + rowSet.getDouble("salary"));
        }
        rowSet.close();
    }
}
// OUTPUT:
// Ajabrao - 65000.0
// Bhavna - 72000.0`]
        },
        {
            content: `<h3>2. CachedRowSet - Disconnected Data</h3>
<code>CachedRowSet</code> reads all matching rows into memory and can then be used - read, iterated,
even modified - <em>after</em> its database connection has been closed. This is its defining feature.`,
            codeExamples: [`import javax.sql.rowset.RowSetProvider;
import javax.sql.rowset.CachedRowSet;
import java.sql.*;

public class DisconnectedRowSetDemo {
    public static void main(String[] args) throws SQLException {
        CachedRowSet rowSet;

        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             Statement stmt = con.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, name, salary FROM employees")) {

            rowSet = RowSetProvider.newFactory().createCachedRowSet();
            rowSet.populate(rs); // reads ALL rows into memory now
        }
        // The Connection/Statement/ResultSet above are all closed at this point...

        // ...yet rowSet is still fully usable:
        while (rowSet.next()) {
            System.out.println(rowSet.getString("name"));
        }
        rowSet.close();
    }
}
// OUTPUT:
// Ajabrao
// Bhavna
// Chetan`]
        },
        {
            content: `<h4>3. CachedRowSet Is Serializable</h4>
Because a <code>CachedRowSet</code> holds its data in memory (not a live cursor), it implements
<code>Serializable</code> - it can be written to a file, sent over a network, or passed between JVMs, none
of which is possible with a live <code>ResultSet</code>.`
        }
    ],

    expert: [
        {
            content: `<h3>RowSet Family Overview</h3>
<code>javax.sql.RowSet</code> is an interface with several standard implementations, each suited to a
different scenario:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Implementation</th><th>Connected?</th><th>Typical Use</th></tr>
<tr class='text-center'><td>JdbcRowSet</td><td>Connected (thin wrapper over ResultSet)</td><td>GUI/bean-style access while staying live against the DB</td></tr>
<tr class='text-center'><td>CachedRowSet</td><td>Disconnected, in-memory, serializable</td><td>Read/modify data after closing the connection; sending over RMI</td></tr>
<tr class='text-center'><td>WebRowSet</td><td>Disconnected</td><td>Everything CachedRowSet does, plus XML export/import</td></tr>
<tr class='text-center'><td>FilteredRowSet</td><td>Disconnected (extends CachedRowSet)</td><td>Apply a Predicate to show only rows matching a filter, without a new query</td></tr>
<tr class='text-center'><td>JoinRowSet</td><td>Disconnected (extends CachedRowSet)</td><td>Combine multiple disconnected RowSets into a virtual join, in memory</td></tr>
</table>`
        },
        {
            content: `<h3>ResultSet vs CachedRowSet - Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>ResultSet</th><th>CachedRowSet</th></tr>
<tr class='text-center'><td>Connection required while reading</td><td>Yes - live cursor</td><td>No - fully materialized in memory</td></tr>
<tr class='text-center'><td>Memory usage</td><td>Streams rows, low footprint for large results</td><td>Holds the entire result in memory - risky for huge result sets</td></tr>
<tr class='text-center'><td>Serializable / passable across JVMs</td><td>No</td><td>Yes</td></tr>
<tr class='text-center'><td>Construction</td><td>Only returned by Statement.executeQuery()</td><td>Constructed directly via RowSetProvider, configured like a bean</td></tr>
<tr class='text-center'><td>Offline edits synced back?</td><td>N/A - updates go through the live connection</td><td>Yes - acceptChanges() reconnects and writes back changes made while disconnected</td></tr>
</table>`
        },
        {
            content: `<h3>When RowSet Actually Earns Its Place</h3>
CachedRowSet shines in scenarios like: passing query results to a background report-formatting thread
without holding a database connection open for the duration; caching a small reference/lookup table
(e.g. a department list) in memory to avoid repeated queries; or serializing data across a network
boundary that doesn't have JDBC connectivity. It is a poor fit for large result sets (memory blow-up) or
for anything requiring truly real-time data, since it is a point-in-time snapshot by nature - always
weigh its convenience against the ResultSet-based DAO pattern used in most production codebases, which
usually maps rows into plain Java objects instead.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What package defines RowSet, and what interface does it extend?</td><td>javax.sql.rowset (with the base RowSet interface in javax.sql), and RowSet itself extends ResultSet while adding JavaBean-style configuration and event listeners.</td></tr>
<tr><td>What is the defining feature of CachedRowSet?</td><td>It is disconnected - all rows are read into memory via populate()/execute(), so it remains usable after the originating Connection is closed.</td></tr>
<tr><td>Why is CachedRowSet Serializable but ResultSet is not?</td><td>CachedRowSet holds its data entirely in memory with no live database cursor, so it can be safely serialized/transmitted; ResultSet is a live cursor tied to an open Connection/Statement and cannot be meaningfully serialized.</td></tr>
<tr><td>Name two other RowSet implementations besides CachedRowSet and what they add.</td><td>WebRowSet adds XML import/export; JoinRowSet lets you combine multiple disconnected RowSets into an in-memory virtual join; FilteredRowSet applies a Predicate to filter cached rows.</td></tr>
<tr><td>How do offline changes made to a CachedRowSet get written back to the database?</td><td>Calling acceptChanges() (with a Connection or connection info) reconnects and synchronizes the in-memory changes back to the underlying table.</td></tr>
<tr><td>Why is CachedRowSet a poor fit for very large result sets?</td><td>It materializes the entire result set in memory at once, unlike a streaming ResultSet, risking high memory usage or OutOfMemoryError for large data volumes.</td></tr>
<tr><td>How is a RowSet typically constructed compared to a ResultSet?</td><td>A RowSet implementation is created directly via RowSetProvider.newFactory() and configured with bean-style setters (setUrl, setCommand, etc.), whereas a ResultSet is only ever returned by executing a Statement.</td></tr>
</table>`
        }
    ]
};
