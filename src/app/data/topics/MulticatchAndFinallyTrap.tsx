import { Topic } from '../coreJava';

export const multicatchAndFinallyTrap: Topic = {
    id: 'multicatch-finally-trap',
    name: 'Multi-catch Block and the try-finally Return Trap',

    beginner: [
        {
            content: `<h4>Multi-catch (Java 7+)</h4>
Before Java 7, handling two unrelated exception types the same way meant either <b>duplicating</b> the catch block, or catching the broad <code>Exception</code> type and losing precision. <b>Multi-catch</b> lets one block handle several exception types with the <code>|</code> operator.`,
            codeExamples: [
                `import java.io.IOException;
import java.sql.SQLException;

public class Test {
    static void risky(int mode) throws IOException, SQLException {
        if (mode == 1) throw new IOException("disk error");
        if (mode == 2) throw new SQLException("db error");
    }

    public static void main(String[] args) {
        for (int mode = 1; mode <= 2; mode++) {
            try {
                risky(mode);
            } catch (IOException | SQLException e) {
                System.out.println("Handled: " + e.getClass().getSimpleName()
                        + " - " + e.getMessage());
            }
        }
    }
}
// OUTPUT:
// Handled: IOException - disk error
// Handled: SQLException - db error`
            ]
        },
        {
            content: `<h4>The Subtype Rule for Multi-catch</h4>
The types in a multi-catch must NOT be related by inheritance - if one is already a subtype of another, catching both together is redundant and the compiler rejects it outright.`,
            codeExamples: [
                `public class Test {
    static void demo() {
        try {
            throw new java.io.FileNotFoundException("missing");
        }
        // COMPILE ERROR: FileNotFoundException is already a subtype of IOException -
        // "Alternatives in a multi-catch statement cannot be related by subclassing"
        // catch (java.io.FileNotFoundException | java.io.IOException e) { }
        catch (java.io.IOException e) {
            System.out.println("Just catch the common supertype instead: " + e.getMessage());
        }
    }
    public static void main(String[] args) {
        demo();
    }
}
// OUTPUT:
// Just catch the common supertype instead: missing`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The try-finally Return Trap</h3>
A <code>finally</code> block always runs - but if it contains its OWN <code>return</code> statement, that return <b>completely overrides</b> whatever the <code>try</code> block was doing, including <b>silently discarding any exception that was about to propagate</b>. The caller never even sees the exception happened.`,
            codeExamples: [
                `public class Test {
    static int riskyCalculation() {
        try {
            throw new RuntimeException("Something went wrong!");
        } finally {
            return 42; // this return WINS - the exception above is completely swallowed
        }
    }

    public static void main(String[] args) {
        int result = riskyCalculation(); // no exception reaches here at all
        System.out.println("Result: " + result);
    }
}
// OUTPUT:
// Result: 42`
            ]
        },
        {
            content: `<h3>Why This Happens</h3>
When a <code>finally</code> block completes via its own <code>return</code> (or <code>break</code>/<code>continue</code>/another <code>throw</code>), that <b>abrupt completion replaces</b> whatever completion the <code>try</code>/<code>catch</code> was already in the middle of - even an in-flight exception. The JLS is explicit about this: a <code>finally</code> clause that completes abruptly for reason <code>S</code> causes the whole <code>try</code> statement to complete for reason <code>S</code>, and the original reason is <b>discarded, not chained</b> (unlike the suppressed-exception mechanism in try-with-resources).`,
            codeExamples: [
                `public class Test {
    static int trickyReturn() {
        try {
            return 1;
        } finally {
            return 2; // even a NORMAL return from try gets overridden
        }
    }
    public static void main(String[] args) {
        System.out.println(trickyReturn());
    }
}
// OUTPUT:
// 2`
            ]
        },
        {
            content: `<h3>Why This Is a Serious Anti-Pattern</h3>
<ul>
<li>It <b>hides real failures</b> - calling code has no idea an exception was ever thrown; it just gets a value back as if everything succeeded.</li>
<li>It is <b>almost never intentional</b> - most developers write a <code>return</code> in <code>finally</code> by accident.</li>
<li>Static analysis tools (like SonarQube, Error Prone) flag <code>return</code>/<code>throw</code>/<code>break</code>/<code>continue</code> inside <code>finally</code> as a bug pattern.</li>
<li>The fix is simple: use <code>finally</code> only for <b>cleanup</b> (closing resources, releasing locks) - never for producing the method's result.</li>
</ul>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does multi-catch let you do?</td><td>Handle multiple unrelated exception types in a single catch block using the | operator, avoiding duplicated handling code</td></tr>
<tr class='text-center'><td>Can you multi-catch a type and its own supertype together?</td><td>No - it's a compile-time error since the alternatives would be redundant (related by subclassing)</td></tr>
<tr class='text-center'><td>What happens if finally contains a return statement while try is throwing?</td><td>The finally's return wins completely - the exception is discarded and never reaches the caller</td></tr>
<tr class='text-center'><td>Does a return in finally override even a normal (non-exceptional) return from try?</td><td>Yes - any abrupt completion in finally (return/break/continue/throw) always overrides whatever try/catch was doing</td></tr>
<tr class='text-center'><td>What's the correct way to use finally?</td><td>Only for cleanup (closing resources, releasing locks) - never to produce or override the method's actual return value</td></tr>
</table>`
        }
    ]
};
