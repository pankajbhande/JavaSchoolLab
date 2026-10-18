import { Topic } from '../coreJava';

export const jdbcResultSet: Topic = {
    id: 'jdbc-result-set',
    name: 'ResultSet & Metadata',
    beginner: [
        {
            content: `A <strong>ResultSet</strong> is the table of rows returned by a query - it acts like a cursor that
starts positioned <em>before</em> the first row. Continuing with our
<code>employees(id, name, salary, department)</code> table.`
        },
        {
            content: `<h3>1. Navigating with next()</h3>
Calling <code>next()</code> moves the cursor forward one row and returns <code>true</code> if a row
exists, or <code>false</code> once you're past the last row. This is why every ResultSet loop is a
<code>while (rs.next())</code>.`,
            codeExamples: [`import java.sql.*;

public class ResultSetNextDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             Statement stmt = con.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, name, salary FROM employees")) {

            while (rs.next()) {
                System.out.println(rs.getInt("id") + " " + rs.getString("name") + " " + rs.getDouble("salary"));
            }
        }
    }
}
// OUTPUT:
// 1 Ajabrao 65000.0
// 2 Bhavna 72000.0
// 3 Chetan 58000.0`]
        },
        {
            content: `<h4>Reading Columns by Name vs Index</h4>
Columns can be read by name (<code>rs.getString("name")</code>) or 1-based index
(<code>rs.getString(2)</code>). By-name is clearer and survives column reordering; by-index is
marginally faster and common in tight loops.`,
            codeExamples: [`ResultSet rs = stmt.executeQuery("SELECT id, name FROM employees WHERE id = 1");
if (rs.next()) {
    int idByIndex = rs.getInt(1);      // 1st column
    String nameByName = rs.getString("name");
    System.out.println(idByIndex + " " + nameByName);
}
// OUTPUT:
// 1 Ajabrao`]
        },
        {
            content: `<h3>2. ResultSet Types: Forward-Only vs Scrollable</h3>
By default a ResultSet is <strong>TYPE_FORWARD_ONLY</strong> - you can only move ahead with
<code>next()</code>. Requesting a scrollable type lets you move backward, jump to a row, or revisit
rows.`,
            codeExamples: [`import java.sql.*;

public class ScrollableResultSetDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             Statement stmt = con.createStatement(
                     ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_READ_ONLY);
             ResultSet rs = stmt.executeQuery("SELECT id, name FROM employees")) {

            rs.last(); // jump to the last row
            System.out.println("Last employee: " + rs.getString("name"));

            rs.first(); // jump back to the first row
            System.out.println("First employee: " + rs.getString("name"));
        }
    }
}
// OUTPUT:
// Last employee: Chetan
// First employee: Ajabrao`]
        },
        {
            content: `<h3>3. ResultSetMetaData - Discovering Column Info at Runtime</h3>
<code>rs.getMetaData()</code> returns a <code>ResultSetMetaData</code> object describing the columns
of the result - useful when the query (or its columns) is not known until runtime.`,
            codeExamples: [`import java.sql.*;

public class MetaDataDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             Statement stmt = con.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT id, name, salary FROM employees")) {

            ResultSetMetaData meta = rs.getMetaData();
            int columnCount = meta.getColumnCount();

            for (int i = 1; i <= columnCount; i++) {
                System.out.println(meta.getColumnName(i) + " : " + meta.getColumnTypeName(i));
            }
        }
    }
}
// OUTPUT:
// id : INT
// name : VARCHAR
// salary : DOUBLE`]
        }
    ],

    expert: [
        {
            content: `<h3>The Three ResultSet Types and Two Concurrency Modes</h3>
<code>Connection.createStatement(int resultSetType, int resultSetConcurrency)</code> controls cursor
capabilities. Not every combination is supported by every driver/database - unsupported combinations
silently downgrade or throw <code>SQLFeatureNotSupportedException</code> depending on the driver.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Movement</th><th>Sees Concurrent DB Changes?</th></tr>
<tr class='text-center'><td>TYPE_FORWARD_ONLY</td><td>next() only, no going back</td><td>N/A - streams as it goes, lowest overhead</td></tr>
<tr class='text-center'><td>TYPE_SCROLL_INSENSITIVE</td><td>first/last/previous/absolute(n)</td><td>No - snapshot taken at query time</td></tr>
<tr class='text-center'><td>TYPE_SCROLL_SENSITIVE</td><td>first/last/previous/absolute(n)</td><td>Yes (driver-dependent) - reflects underlying changes</td></tr>
</table>
<br>
Concurrency is set independently: <code>CONCUR_READ_ONLY</code> (default) vs
<code>CONCUR_UPDATABLE</code>, the latter allowing <code>rs.updateXxx()</code> + <code>rs.updateRow()</code>
to modify the database directly through the cursor.`
        },
        {
            content: `<h3>DatabaseMetaData - Introspecting the Whole Database</h3>
Beyond a single result, <code>Connection.getMetaData()</code> returns a <code>DatabaseMetaData</code>
object exposing the database's capabilities and schema - table lists, primary keys, driver version,
supported SQL features. Tools like IDE database explorers and ORMs (Hibernate's schema validation, for
example) are built almost entirely on this API.`,
            codeExamples: [`import java.sql.*;

public class DatabaseMetaDataDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password")) {

            DatabaseMetaData dbMeta = con.getMetaData();
            System.out.println("DB Product: " + dbMeta.getDatabaseProductName());
            System.out.println("Driver Version: " + dbMeta.getDriverVersion());

            try (ResultSet tables = dbMeta.getTables(null, null, "%", new String[]{"TABLE"})) {
                while (tables.next()) {
                    System.out.println("Table: " + tables.getString("TABLE_NAME"));
                }
            }
        }
    }
}
// OUTPUT:
// DB Product: MySQL
// Driver Version: mysql-connector-j-8.x.x
// Table: employees`]
        },
        {
            content: `<h3>Production Pitfall: Using a ResultSet After Its Statement Closes</h3>
A <code>ResultSet</code> is only valid while its parent <code>Statement</code>/<code>Connection</code>
remains open. A very common bug: returning a raw ResultSet (or an Iterator wrapping it) from a DAO
method, then trying to iterate it after the try-with-resources block that created it has already closed
the connection - this throws <code>SQLException: Operation not allowed after ResultSet closed</code>.
The fix is to fully materialize the data you need (e.g. into a <code>List&lt;Employee&gt;</code>)
<em>inside</em> the try block, before the resources close, and return that.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the default ResultSet type and concurrency mode?</td><td>TYPE_FORWARD_ONLY and CONCUR_READ_ONLY - a one-directional, read-only cursor.</td></tr>
<tr><td>What does next() return once you're past the last row?</td><td>false - it never throws, so a while(rs.next()) loop terminates naturally.</td></tr>
<tr><td>Difference between TYPE_SCROLL_INSENSITIVE and TYPE_SCROLL_SENSITIVE?</td><td>Both allow moving forward/backward/jumping to a row, but INSENSITIVE works off a snapshot taken at query time while SENSITIVE can (driver-dependent) reflect concurrent changes made by other transactions.</td></tr>
<tr><td>What is ResultSetMetaData used for?</td><td>Discovering column count, names, and SQL types of a ResultSet at runtime, useful when the query shape isn't known at compile time (e.g. generic reporting tools).</td></tr>
<tr><td>What is DatabaseMetaData used for, and how is it different from ResultSetMetaData?</td><td>It describes the whole database (tables, keys, driver/DB version, supported features) via Connection.getMetaData(), whereas ResultSetMetaData describes only the columns of one specific ResultSet.</td></tr>
<tr><td>Why does iterating a ResultSet after its Statement is closed throw an exception?</td><td>A ResultSet is a live cursor bound to its parent Statement/Connection; closing them releases the underlying database cursor, so any subsequent access throws SQLException.</td></tr>
<tr><td>What must you set to make a ResultSet updatable via updateRow()?</td><td>Create the Statement with CONCUR_UPDATABLE concurrency (and typically a scrollable type), then call rs.updateXxx(column, value) followed by rs.updateRow().</td></tr>
</table>`
        }
    ]
};
