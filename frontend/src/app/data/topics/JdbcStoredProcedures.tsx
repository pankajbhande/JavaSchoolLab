import { Topic } from '../coreJava';

export const jdbcStoredProcedures: Topic = {
    id: 'jdbc-stored-procedures',
    name: 'CallableStatement & Stored Procedures',
    beginner: [
        {
            content: `A <strong>stored procedure</strong> is a block of SQL logic saved inside the database itself and
invoked by name. JDBC calls stored procedures through <strong>CallableStatement</strong>, which extends
PreparedStatement and adds support for IN, OUT, and INOUT parameters. <br><br>
We'll keep using the <code>employees(id, name, salary, department)</code> table.`
        },
        {
            content: `<h3>1. A Simple IN-Parameter Procedure</h3>
Assume this procedure already exists in the database: <br><br>
<code>CREATE PROCEDURE GiveRaise(IN empId INT, IN amount DOUBLE)
BEGIN UPDATE employees SET salary = salary + amount WHERE id = empId; END</code>`,
            codeExamples: [`import java.sql.*;

public class GiveRaiseDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             CallableStatement cstmt = con.prepareCall("{call GiveRaise(?, ?)}")) {

            cstmt.setInt(1, 1);       // empId
            cstmt.setDouble(2, 5000); // amount

            cstmt.execute();
            System.out.println("Raise applied");
        }
    }
}
// OUTPUT:
// Raise applied`]
        },
        {
            content: `<h3>2. An OUT Parameter</h3>
Assume: <code>CREATE PROCEDURE GetEmployeeCount(OUT total INT)
BEGIN SELECT COUNT(*) INTO total FROM employees; END</code><br><br>
OUT parameters must be registered with <code>registerOutParameter()</code> before execution, declaring
the SQL type the database will fill in.`,
            codeExamples: [`import java.sql.*;

public class EmployeeCountDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             CallableStatement cstmt = con.prepareCall("{call GetEmployeeCount(?)}")) {

            cstmt.registerOutParameter(1, Types.INTEGER);
            cstmt.execute();

            int total = cstmt.getInt(1);
            System.out.println("Total employees: " + total);
        }
    }
}
// OUTPUT:
// Total employees: 3`]
        },
        {
            content: `<h3>3. Mixing IN and OUT (and INOUT)</h3>
Assume: <code>CREATE PROCEDURE GetDeptAverage(IN dept VARCHAR(50), OUT avgSalary DOUBLE)
BEGIN SELECT AVG(salary) INTO avgSalary FROM employees WHERE department = dept; END</code>`,
            codeExamples: [`import java.sql.*;

public class DeptAverageDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password");
             CallableStatement cstmt = con.prepareCall("{call GetDeptAverage(?, ?)}")) {

            cstmt.setString(1, "IT");                     // IN param
            cstmt.registerOutParameter(2, Types.DOUBLE);   // OUT param

            cstmt.execute();

            double avg = cstmt.getDouble(2);
            System.out.println("IT average salary: " + avg);
        }
    }
}
// OUTPUT:
// IT average salary: 68500.0`]
        }
    ],

    expert: [
        {
            content: `<h3>JDBC Escape Syntax and How CallableStatement Executes</h3>
The curly-brace syntax <code>{call procName(?, ?)}</code> (and <code>{? = call func(?)}</code> for
functions returning a value) is standardized <strong>JDBC escape syntax</strong> - the driver rewrites
it into the vendor's native stored-procedure call syntax before sending it over the wire. This is why
the same Java code (mostly) works against MySQL, Oracle, and PostgreSQL despite each having different
native CALL syntax.<br><br>
Internally, <code>CallableStatement</code> extends <code>PreparedStatement</code>, so it inherits
precompilation and IN-parameter binding; it layers OUT-parameter registration and retrieval
(<code>registerOutParameter</code> + <code>getXxx(index)</code> after execution) on top.`
        },
        {
            content: `<h3>IN vs OUT vs INOUT Parameters</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Parameter Mode</th><th>Direction</th><th>Java Side</th></tr>
<tr class='text-center'><td>IN</td><td>Java -> Database</td><td>setXxx(index, value), same as PreparedStatement</td></tr>
<tr class='text-center'><td>OUT</td><td>Database -> Java</td><td>registerOutParameter(index, sqlType) before execute(), getXxx(index) after</td></tr>
<tr class='text-center'><td>INOUT</td><td>Java &lt;-&gt; Database</td><td>Both setXxx(index, value) AND registerOutParameter(index, sqlType) before execute()</td></tr>
</table>
<br>
A subtle but important rule: for INOUT parameters, the <code>setXxx</code> call and the
<code>registerOutParameter</code> call can be made in either order, but both are required - forgetting
<code>registerOutParameter</code> on an INOUT/OUT parameter throws
<code>SQLException: Parameter not registered as output</code> when you try to read it back.`
        },
        {
            content: `<h3>Production Consideration: Stored Procedures vs Application-Level Logic</h3>
Pushing logic into stored procedures reduces round-trips (the whole "transfer money" flow runs in one
network call instead of several) and can be significantly faster for bulk/set-based operations. The
trade-off: procedure logic is harder to unit test, version-control alongside application code, and code
-review compared to Java, and it ties business logic to a specific database vendor's procedural
language (T-SQL, PL/SQL, etc.), hurting portability. Most teams reserve stored procedures for
performance-critical, set-based operations and keep ordinary business logic in the application layer.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What interface does CallableStatement extend?</td><td>PreparedStatement, so it inherits ? placeholder binding and precompilation, and adds stored-procedure invocation support.</td></tr>
<tr><td>What must you do before reading an OUT parameter's value?</td><td>Call registerOutParameter(index, sqlType) before execute(); reading it beforehand or without registering throws an exception.</td></tr>
<tr><td>What is the JDBC escape syntax for calling a procedure?</td><td>{call procedureName(?, ?, ...)}, which the driver translates into the database's native CALL syntax.</td></tr>
<tr><td>How do you call a stored function that returns a value, as opposed to a procedure?</td><td>Using {? = call functionName(?)} - the first ? represents the function's return value and must also be registered as an OUT parameter.</td></tr>
<tr><td>What is required to use an INOUT parameter correctly?</td><td>Both setXxx(index, value) to send the input value AND registerOutParameter(index, sqlType) to be able to read the updated value back after execution.</td></tr>
<tr><td>Why might a team avoid putting business logic in stored procedures?</td><td>It is harder to unit test and version alongside application code, and ties logic to a vendor-specific procedural SQL dialect, hurting portability and code review workflows.</td></tr>
<tr><td>When are stored procedures a clear performance win?</td><td>For set-based/bulk operations where doing the work in the database avoids multiple network round-trips compared to equivalent per-row Java logic.</td></tr>
</table>`
        }
    ]
};
