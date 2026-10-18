import { Topic } from '../coreJava';

export const customExceptionsInJava: Topic = {
    id: 'custom-exceptions',
    name: 'Custom Exceptions in Java',

    beginner: [
        {
            content: `<h4>Why Create a Custom Exception?</h4>
<p>Java ships with generic exceptions like <code>IllegalArgumentException</code> or <code>RuntimeException</code>, but they do not show <b>domain meaning</b>.</p>
<ul>
<li>A custom exception names the exact business failure. <code>InsufficientFundsException</code> says far more than <code>RuntimeException("balance too low")</code>.</li>
<li>Callers can <code>catch</code> that failure type separately from every other error.</li>
<li>It can carry extra domain data (an error code, an account id) that a generic exception has no field for.</li>
</ul>
<p>A custom exception is just a normal class that <b>extends</b> one of Java's existing exception classes.</p>`
        },
        {
            content: `<h4>Extending Exception (Checked) vs RuntimeException (Unchecked)</h4>
<ul>
<li>Extend <code>Exception</code> (checked) when a caller can recover and must be forced to handle it. The compiler requires a <code>try/catch</code> or a <code>throws</code> declaration.</li>
<li>Extend <code>RuntimeException</code> (unchecked) for a <b>programming error or an unrecoverable business rule violation</b>. No <code>throws</code> declaration is required.</li>
<li>Always call <code>super(message)</code> so <code>getMessage()</code> works. Add a <code>super(message, cause)</code> constructor too, so it can wrap another exception.</li>
</ul>`,
            codeExamples: [
                `// Checked - caller MUST handle or declare it
public class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

// Unchecked - caller is not forced to handle it
public class InvalidAccountStateException extends RuntimeException {
    public InvalidAccountStateException(String message) {
        super(message);
    }
}`
            ]
        },
        {
            content: `<h4>A Working Custom Exception in Action</h4>
<p>Throwing and catching a custom checked exception looks like any built-in exception. The only difference is that the type name carries real meaning.</p>`,
            codeExamples: [
                `class InsufficientFundsException extends Exception {
    public InsufficientFundsException(String message) {
        super(message);
    }
}

public class BankAccount {
    private double balance;

    public BankAccount(double balance) {
        this.balance = balance;
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(
                "Cannot withdraw " + amount + ", balance is only " + balance);
        }
        balance -= amount;
        System.out.println("Withdrew " + amount
            + ", remaining balance: " + balance);
    }

    public static void main(String[] args) {
        BankAccount account = new BankAccount(500.0);
        try {
            account.withdraw(200.0);
            account.withdraw(1000.0);
        } catch (InsufficientFundsException e) {
            System.out.println("Transaction failed: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Withdrew 200.0, remaining balance: 300.0
// Transaction failed: Cannot withdraw 1000.0, balance is only 300.0`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Adding Extra Fields to a Custom Exception</h3>
<p>A plain exception only carries a message. A custom exception can carry <b>structured data</b>, such as an error code. Callers read it directly instead of parsing the message text.</p>`,
            codeExamples: [
                `class InsufficientFundsException extends Exception {
    private final String errorCode;
    private final double shortfall;

    public InsufficientFundsException(
            String message, String errorCode, double shortfall) {
        super(message);
        this.errorCode = errorCode;
        this.shortfall = shortfall;
    }

    public String getErrorCode() { return errorCode; }
    public double getShortfall() { return shortfall; }
}

public class Test {
    public static void main(String[] args) {
        try {
            double balance = 300.0, requested = 1000.0;
            throw new InsufficientFundsException(
                "Insufficient funds", "ERR_FUNDS_001", requested - balance);
        } catch (InsufficientFundsException e) {
            System.out.println("Message: " + e.getMessage());
            System.out.println("Code: " + e.getErrorCode());
            System.out.println("Shortfall: " + e.getShortfall());
        }
    }
}
// OUTPUT:
// Message: Insufficient funds
// Code: ERR_FUNDS_001
// Shortfall: 700.0`
            ]
        },
        {
            content: `<h3>Exception Chaining - Preserving the Original Cause</h3>
<p>When you catch a low-level exception (for example from JDBC or file I/O) and throw a higher-level one, do not discard the original. Pass it as the <b>cause</b>. The root-cause stack trace then stays available for debugging.</p>`,
            codeExamples: [
                `class DataAccessException extends RuntimeException {
    public DataAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class Repository {
    void save() {
        try {
            throw new java.sql.SQLException("Connection timed out");
        } catch (java.sql.SQLException e) {
            // Wrap the low-level exception, but keep its cause
            throw new DataAccessException("Failed to save record", e);
        }
    }

    public static void main(String[] args) {
        try {
            new Repository().save();
        } catch (DataAccessException e) {
            System.out.println("Caught: " + e.getMessage());
            System.out.println("Root cause: " + e.getCause().getMessage());
        }
    }
}
// OUTPUT:
// Caught: Failed to save record
// Root cause: Connection timed out`
            ]
        },
        {
            content: `<h3>Best Practices for Custom Exceptions</h3>
<ul>
<li><b>Name it clearly</b> and end it with "Exception": <code>OrderNotFoundException</code>, not <code>OrderError</code>.</li>
<li><b>Never swallow it silently.</b> An empty <code>catch</code> block hides real failures.</li>
<li><b>Do not overuse checked exceptions.</b> Forcing every caller to declare <code>throws</code> for something they cannot fix only adds boilerplate.</li>
<li><b>Keep the hierarchy shallow.</b> One or two custom types per domain is usually enough.</li>
<li><b>Always provide a message.</b> A bare <code>super()</code> is nearly useless when reading a stack trace at 2 AM.</li>
</ul>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why create a custom exception instead of using RuntimeException directly?</td><td>It gives the failure a meaningful, catchable type name and lets it carry domain-specific data</td></tr>
<tr class='text-center'><td>When should a custom exception extend Exception vs RuntimeException?</td><td>Exception (checked) when callers must handle/declare a recoverable failure; RuntimeException (unchecked) for programmer errors or unrecoverable states</td></tr>
<tr class='text-center'><td>How do you preserve the original exception when wrapping it?</td><td>Pass it as the cause via super(message, cause); retrieve it later with getCause()</td></tr>
<tr class='text-center'><td>What's a common anti-pattern with custom exceptions?</td><td>Catching them and doing nothing (silently swallowing), or overusing checked exceptions everywhere</td></tr>
<tr class='text-center'><td>Can a custom exception carry extra fields beyond a message?</td><td>Yes - add private final fields (like an error code) with getters, set via the constructor</td></tr>
</table>`
        }
    ]
};
