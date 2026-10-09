import { Topic } from '../coreJava';

export const jdbcTransactions: Topic = {
    id: 'jdbc-transactions',
    name: 'Transactions',
    beginner: [
        {
            content: `A <strong>transaction</strong> groups multiple SQL statements so they succeed or fail together as one
unit. We'll model the classic example: transferring money between two rows of an
<code>accounts(id, holder, balance)</code> table, alongside our usual
<code>employees(id, name, salary, department)</code> table for simpler examples.`
        },
        {
            content: `<h3>1. Auto-Commit Mode (the Default)</h3>
By default, every statement you execute is committed to the database immediately - this is called
<strong>auto-commit</strong>. It's convenient for single statements, but dangerous for multi-step
operations.`,
            codeExamples: [`import java.sql.*;

public class AutoCommitDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password")) {

            System.out.println("Auto-commit by default: " + con.getAutoCommit());

            try (PreparedStatement pstmt = con.prepareStatement(
                    "UPDATE employees SET salary = salary + 1000 WHERE id = 1")) {
                pstmt.executeUpdate(); // committed instantly, no way to undo from here
            }
        }
    }
}
// OUTPUT:
// Auto-commit by default: true`]
        },
        {
            content: `<h3>2. Turning Off Auto-Commit</h3>
<code>con.setAutoCommit(false)</code> starts a manual transaction. Nothing is permanent until you call
<code>commit()</code>.`,
            codeExamples: [`Connection con = DriverManager.getConnection(
        "jdbc:mysql://localhost:3306/company", "root", "password");
con.setAutoCommit(false);
// ... run statements ...
// nothing is saved to disk/visible to other connections yet`]
        },
        {
            content: `<h3>3. The Classic Example: Transferring Money</h3>
Debiting one account and crediting another must happen together - if the app crashes between the two
updates without a transaction, money simply vanishes.`,
            codeExamples: [`import java.sql.*;

public class TransferMoneyDemo {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/bank";

        try (Connection con = DriverManager.getConnection(url, "root", "password")) {
            con.setAutoCommit(false);

            try (PreparedStatement debit = con.prepareStatement(
                     "UPDATE accounts SET balance = balance - ? WHERE id = ?");
                 PreparedStatement credit = con.prepareStatement(
                     "UPDATE accounts SET balance = balance + ? WHERE id = ?")) {

                debit.setDouble(1, 1000);
                debit.setInt(2, 101);
                debit.executeUpdate();

                credit.setDouble(1, 1000);
                credit.setInt(2, 202);
                credit.executeUpdate();

                con.commit();
                System.out.println("Transfer of 1000 completed");
            } catch (SQLException e) {
                con.rollback();
                System.out.println("Transfer failed, rolled back");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
// OUTPUT:
// Transfer of 1000 completed`]
        },
        {
            content: `<h3>4. Savepoints - Partial Rollback</h3>
A <code>Savepoint</code> marks a point inside a transaction you can roll back to, without undoing
everything before it.`,
            codeExamples: [`import java.sql.*;

public class SavepointDemo {
    public static void main(String[] args) throws SQLException {
        try (Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/company", "root", "password")) {
            con.setAutoCommit(false);

            try (PreparedStatement raise = con.prepareStatement(
                    "UPDATE employees SET salary = salary + 2000 WHERE department = 'IT'")) {
                raise.executeUpdate();

                Savepoint sp1 = con.setSavepoint("afterItRaise");

                try (PreparedStatement badUpdate = con.prepareStatement(
                        "UPDATE employees SET salary = salary - 999999 WHERE department = 'Sales'")) {
                    badUpdate.executeUpdate();
                    // Suppose we decide this second update was a mistake:
                    con.rollback(sp1); // undo only the Sales update, keep the IT raise
                }

                con.commit(); // commits just the IT raise
                System.out.println("IT raise committed, Sales change rolled back");
            }
        }
    }
}
// OUTPUT:
// IT raise committed, Sales change rolled back`]
        }
    ],

    expert: [
        {
            content: `<h3>ACID in the Context of JDBC</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Property</th><th>Meaning</th><th>JDBC's Role</th></tr>
<tr class='text-center'><td>Atomicity</td><td>All statements in the transaction succeed, or none do</td><td>setAutoCommit(false) + commit()/rollback() define the unit</td></tr>
<tr class='text-center'><td>Consistency</td><td>DB moves from one valid state to another</td><td>Enforced mainly by DB constraints; JDBC just delivers the statements</td></tr>
<tr class='text-center'><td>Isolation</td><td>Concurrent transactions don't see each other's uncommitted changes</td><td>con.setTransactionIsolation(level) controls the isolation level</td></tr>
<tr class='text-center'><td>Durability</td><td>Once committed, changes survive crashes</td><td>Guaranteed by the DB engine after commit() returns successfully</td></tr>
</table>`
        },
        {
            content: `<h3>Transaction Isolation Levels</h3>
JDBC exposes standard isolation levels via <code>Connection.setTransactionIsolation()</code>, though not
every database supports every level (MySQL/InnoDB defaults to REPEATABLE_READ, most others to
READ_COMMITTED).
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Level</th><th>Dirty Read</th><th>Non-Repeatable Read</th><th>Phantom Read</th></tr>
<tr class='text-center'><td>TRANSACTION_READ_UNCOMMITTED</td><td>Possible</td><td>Possible</td><td>Possible</td></tr>
<tr class='text-center'><td>TRANSACTION_READ_COMMITTED</td><td>Prevented</td><td>Possible</td><td>Possible</td></tr>
<tr class='text-center'><td>TRANSACTION_REPEATABLE_READ</td><td>Prevented</td><td>Prevented</td><td>Possible</td></tr>
<tr class='text-center'><td>TRANSACTION_SERIALIZABLE</td><td>Prevented</td><td>Prevented</td><td>Prevented</td></tr>
</table>
<br>
Higher isolation reduces anomalies but increases locking/contention and can hurt throughput - a classic
production trade-off, not a "always pick the strictest" decision.`,
            codeExamples: [`con.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);`]
        },
        {
            content: `<h3>Production Pitfall: Forgetting to Restore Auto-Commit, and Connection Pool Interaction</h3>
When a <code>Connection</code> comes from a pool, calling <code>setAutoCommit(false)</code> and then
returning the connection to the pool without ever calling <code>commit()</code>/<code>rollback()</code>
(or restoring auto-commit) leaves the <em>next</em> borrower of that pooled connection unknowingly inside
someone else's half-open transaction. Well-behaved pools (HikariCP included) reset auto-commit on
return, but relying on that silently is fragile - always explicitly commit/rollback in a
<code>finally</code> block or try-with-resources, and treat "forgot to close/finish a transaction" as a
top-tier category of connection leak bugs.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the default auto-commit setting for a new Connection?</td><td>true - every statement is committed immediately unless setAutoCommit(false) is called.</td></tr>
<tr><td>What does commit() do, and what does rollback() do?</td><td>commit() makes all statements since the last commit permanent; rollback() undoes all statements since the last commit (or the start of the transaction).</td></tr>
<tr><td>What is a Savepoint used for?</td><td>Marking an intermediate point in a transaction so rollback(savepoint) can undo only statements after that point, while keeping earlier changes intact until the final commit/rollback.</td></tr>
<tr><td>Name the four ACID properties and how JDBC relates to each.</td><td>Atomicity (commit/rollback define the unit), Consistency (mostly enforced by DB constraints), Isolation (set via setTransactionIsolation), Durability (guaranteed by the DB once commit() succeeds).</td></tr>
<tr><td>What is a dirty read, and which isolation level allows it?</td><td>Reading uncommitted changes made by another transaction; only TRANSACTION_READ_UNCOMMITTED allows it.</td></tr>
<tr><td>Why is a stricter isolation level not always the right choice?</td><td>Stricter levels (e.g. SERIALIZABLE) prevent more anomalies but increase locking and reduce concurrency/throughput, so the level should match the actual consistency requirement.</td></tr>
<tr><td>What danger exists when returning a connection to a pool without committing or rolling back?</td><td>The next code that borrows the same pooled connection can inherit a half-open transaction or unexpected auto-commit state, unless the pool explicitly resets it on return.</td></tr>
</table>`
        }
    ]
};
