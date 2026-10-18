import { Topic } from '../coreJava';

export const jdbcStatementTypes: Topic = {
    id: 'jdbc-statement-types',
    name: 'Statement vs PreparedStatement',
    beginner: [
        {
            content: `JDBC gives you two everyday ways to send SQL to the database: <strong>Statement</strong> and
<strong>PreparedStatement</strong>. Using the wrong one for user-supplied values is one of the most
common security bugs in real applications. <br><br>
We'll use the familiar <code>employees(id, name, salary, department)</code> table for every example.`
        },
        {
            content: `<h3>1. Statement - Basic Static SQL</h3>
<code>Statement</code> sends the SQL text exactly as written, with no separation between code and data.
It is fine for fixed queries with no external input.`,
            codeExamples: [`import java.sql.*;

public class StatementDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             Statement stmt = con.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT name, salary FROM employees WHERE department = 'IT'")) {

            while (rs.next()) {
                System.out.println(rs.getString("name") + " - " + rs.getDouble("salary"));
            }
        }
    }
}
// OUTPUT:
// Ajabrao - 65000.0
// Bhavna - 72000.0`]
        },
        {
            content: `<h3>2. The Problem: Building SQL with String Concatenation</h3>
As soon as a value comes from outside (a form field, an API parameter), concatenating it into the SQL
string is dangerous - the value can change the meaning of the query.`,
            codeExamples: [`import java.sql.*;

public class UnsafeSearch {
    public static void main(String[] args) throws SQLException {
        String userInput = "Sales' OR '1'='1"; // attacker-controlled department name

        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             Statement stmt = con.createStatement()) {

            String sql = "SELECT name FROM employees WHERE department = '" + userInput + "'";
            System.out.println("Executed SQL: " + sql);

            ResultSet rs = stmt.executeQuery(sql);
            while (rs.next()) {
                System.out.println(rs.getString("name"));
            }
        }
    }
}
// OUTPUT:
// Executed SQL: SELECT name FROM employees WHERE department = 'Sales' OR '1'='1'
// Ajabrao
// Bhavna
// Chetan        <-- every employee leaked, not just Sales department`]
        },
        {
            content: `<h3>3. PreparedStatement - Parameterized and Safe</h3>
<code>PreparedStatement</code> uses <code>?</code> placeholders. Values are bound with <code>setXxx()</code>
methods and sent to the database separately from the SQL text, so they can never alter the query
structure.`,
            codeExamples: [`import java.sql.*;

public class PreparedStatementDemo {
    public static void main(String[] args) throws SQLException {
        String userInput = "Sales' OR '1'='1"; // same malicious input as before

        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             PreparedStatement pstmt = con.prepareStatement(
                     "SELECT name FROM employees WHERE department = ?")) {

            pstmt.setString(1, userInput);

            try (ResultSet rs = pstmt.executeQuery()) {
                boolean any = false;
                while (rs.next()) {
                    any = true;
                    System.out.println(rs.getString("name"));
                }
                if (!any) System.out.println("No employees found");
            }
        }
    }
}
// OUTPUT:
// No employees found    <-- malicious string is treated as a literal department name`]
        },
        {
            content: `<h4>PreparedStatement for Inserts/Updates</h4>
The same <code>?</code> binding pattern is used for INSERT/UPDATE, and <code>executeUpdate()</code>
returns the number of affected rows.`,
            codeExamples: [`import java.sql.*;

public class InsertEmployeeDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             PreparedStatement pstmt = con.prepareStatement(
                     "INSERT INTO employees (name, salary, department) VALUES (?, ?, ?)")) {

            pstmt.setString(1, "Deepa");
            pstmt.setDouble(2, 58000);
            pstmt.setString(3, "HR");

            int rows = pstmt.executeUpdate();
            System.out.println("Rows inserted: " + rows);
        }
    }
}
// OUTPUT:
// Rows inserted: 1`]
        }
    ],

    expert: [
        {
            content: `<h3>How PreparedStatement Actually Prevents Injection</h3>
The SQL text with <code>?</code> placeholders is sent to the database and parsed/compiled into an
execution plan <em>once</em>, before any parameter values exist. The bound values are then sent in a
separate protocol message and substituted into the already-parsed plan as literal data. Because parsing
happens before the values are even known, there is no way for a value to be re-interpreted as SQL
syntax - injection is structurally impossible for values bound this way (it is still possible to
misuse PreparedStatement by concatenating raw strings into the SQL text itself before preparing it,
which defeats the protection entirely).`
        },
        {
            content: `<h3>Statement vs PreparedStatement - Detailed Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Statement</th><th>PreparedStatement</th></tr>
<tr class='text-center'><td>SQL parsing</td><td>Re-parsed by the DB every execution</td><td>Parsed/compiled once, execution plan reused</td></tr>
<tr class='text-center'><td>SQL injection</td><td>Vulnerable if values are concatenated</td><td>Immune when placeholders are used correctly</td></tr>
<tr class='text-center'><td>Performance - single execution</td><td>Slightly faster (no prepare round-trip)</td><td>Slightly slower (extra prepare step)</td></tr>
<tr class='text-center'><td>Performance - repeated execution</td><td>Pays parse cost every time</td><td>Amortizes parse cost, much faster in loops/batches</td></tr>
<tr class='text-center'><td>Type safety</td><td>Manual string formatting of values</td><td>setInt/setString/setDouble etc. handle escaping and type conversion</td></tr>
<tr class='text-center'><td>Typical use</td><td>One-off DDL or fixed admin queries</td><td>Almost everything involving external/user input</td></tr>
</table>`
        },
        {
            content: `<h3>Production Pitfall: PreparedStatement Cache Bloat</h3>
Building SQL like <code>"SELECT * FROM employees WHERE id IN (" + placeholders + ")"</code> with a
variable number of placeholders generates a <em>different SQL string</em> for every distinct list size
(1 param, 2 params, 3 params...). Each distinct string is a separate entry in the database's prepared
statement cache, which can bloat memory and reduce cache hit rate under load. Prefer a fixed-shape
query (e.g. a single "= ANY(?)" style array parameter, or IN with a capped/padded list) when the
database supports it, to keep the cache small and effective.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Why does PreparedStatement prevent SQL injection but Statement does not?</td><td>PreparedStatement sends the SQL text and parses it before parameter values are known; bound values are transmitted separately as literal data and can never alter the parsed query structure, unlike string-concatenated Statement SQL.</td></tr>
<tr><td>Does PreparedStatement offer any protection if you build the SQL string with concatenation before calling prepareStatement?</td><td>No - the protection only applies to values bound via setXxx() and ? placeholders; concatenating raw input into the SQL text defeats it completely.</td></tr>
<tr><td>Is PreparedStatement always faster than Statement?</td><td>Not for a single one-off execution (it adds a prepare round-trip); it wins clearly when the same SQL shape is executed repeatedly, since the parse/plan cost is paid once.</td></tr>
<tr><td>Which interface does PreparedStatement extend?</td><td>java.sql.Statement, and CallableStatement in turn extends PreparedStatement.</td></tr>
<tr><td>What method is used to run an INSERT/UPDATE/DELETE, and what does it return?</td><td>executeUpdate(), which returns an int representing the number of rows affected.</td></tr>
<tr><td>What is a real-world pitfall with dynamically-sized IN (?, ?, ...) clauses?</td><td>Each distinct number of placeholders produces a different SQL string, bloating the database's prepared statement cache and lowering its hit rate under load.</td></tr>
<tr><td>Can Statement objects be reused for multiple different queries?</td><td>Yes, but each execute call re-sends and re-parses whatever SQL text is passed, unlike a PreparedStatement which is bound to one fixed SQL shape.</td></tr>
</table>`
        }
    ]
};
