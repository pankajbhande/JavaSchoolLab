import { Topic } from '../coreJava';

export const throwAndThrowsInJava: Topic = {
                        id: 'exception-handling3',
                        name: 'throw and throws in Java',
                        beginner: [
                            {
                                content: `<code>throw</code> and <code>throws</code> look similar but do completely different jobs - one actually raises an exception, the other just announces that a method might raise one. <br><br>

Below is one small, runnable code + output for each: <br>`
                            },

                            {
                                content: `<h3>1. throw — manually raising an exception</h3>
The <code>throw</code> keyword is used inside a method body to actually create and hand off an exception object at the exact point something goes wrong. <br>
Syntax: <code>throw new ArithmeticException();</code> <br>`,
                                codeExamples: [`public class Example {
    public static void checkNum(int num) {
        if (num < 1) {
            throw new IllegalArgumentException("Must be positive: " + num);
        }
        System.out.println("Square of " + num + " is " + (num * num));
    }

    public static void main(String[] args) {
        checkNum(-3);
    }
}
// OUTPUT:
// Exception in thread "main" java.lang.IllegalArgumentException: Must be positive: -3
//     at Example.checkNum(Example.java:4)
//     at Example.main(Example.java:10)`]
                            },

                            {
                                content: `<h3>2. throws — declaring that a method might throw</h3>
The <code>throws</code> keyword is used in a <strong>method signature</strong> to declare that the method might throw a particular (checked) exception type. It doesn't throw anything itself - it just forces any caller to either catch that exception or declare it too. <br>
Syntax: <br>
<code>void readFile() throws IOException { ... }</code> <br>`,
                                codeExamples: [`import java.io.IOException;

public class FileReaderDemo {

    // Declares it MIGHT throw IOException - does not throw it here
    static void readConfig() throws IOException {
        boolean fileMissing = true;
        if (fileMissing) {
            throw new IOException("config.txt not found");
        }
        System.out.println("Config loaded");
    }

    public static void main(String[] args) {
        try {
            readConfig();
        } catch (IOException e) {
            System.out.println("Handled: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Handled: config.txt not found`]
                            },

                            {
                                content: `<h3>throw vs throws — Quick Comparison</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>throw</th>
<th>throws</th>
</tr>
<tr class='text-center'><td>What it is</td><td>A statement</td><td>A clause (keyword in a method signature)</td></tr>
<tr class='text-center'><td>What follows it</td><td>A single exception object (<code>throw new XException()</code>)</td><td>One or more exception types, comma-separated</td></tr>
<tr class='text-center'><td>Where it appears</td><td>Inside a method or block body</td><td>In the method signature, after the parameter list</td></tr>
<tr class='text-center'><td>Effect</td><td>Actually raises/hands off the exception right now</td><td>Just declares a possibility - forces the caller to handle it</td></tr>
<tr class='text-center'><td>Can you use multiple?</td><td>No - only one exception object per throw statement</td><td>Yes - <code>throws IOException, SQLException</code></td></tr>
</table>`
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Checked Exceptions Force Your Hand</h3>
If you <code>throw</code> a <strong>checked</strong> exception (anything extending <code>Exception</code> but not <code>RuntimeException</code>), the compiler forces you to do one of two things: catch it in a surrounding try-catch, or declare it with <code>throws</code> so the caller deals with it. Unchecked exceptions (<code>RuntimeException</code> and its subclasses) have no such requirement.<br>`,
                                codeExamples: [
                                    `// COMPILE ERROR EXAMPLE - what happens if you forget both
import java.io.IOException;

public class BrokenDemo {
    static void readConfig() {          // no "throws IOException" here
        throw new IOException("config.txt not found");
        // COMPILE ERROR: unreported exception IOException;
        // must be caught or declared to be thrown
    }

    public static void main(String[] args) {
        readConfig();
    }
}`,
                                    `// FIX 1 - declare it with throws
import java.io.IOException;

public class FixWithThrows {
    static void readConfig() throws IOException {
        throw new IOException("config.txt not found");
    }

    public static void main(String[] args) throws IOException {
        readConfig();
    }
}
// (compiles fine - caller (main) also declares throws IOException)`,
                                    `// FIX 2 - catch it locally instead
import java.io.IOException;

public class FixWithTryCatch {
    static void readConfig() {
        try {
            throw new IOException("config.txt not found");
        } catch (IOException e) {
            System.out.println("Handled locally: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        readConfig();
    }
}
// OUTPUT:
// Handled locally: config.txt not found`
                                ]
                            },

                            {
                                content: `<h3>Throwing a Custom Exception</h3>
Business-specific error conditions are usually modelled as a custom exception class, then raised with <code>throw</code> exactly like a built-in exception.<br>`,
                                codeExamples: [
                                    `class InsufficientFundException extends RuntimeException {
    InsufficientFundException(String message) {
        super(message);
    }
}

class Account {
    private int balance = 3000;

    int balance() {
        return balance;
    }

    void withdraw(int amount) {
        if (amount > balance) {
            throw new InsufficientFundException("Insufficient balance");
        }
        balance = balance - amount;
    }
}

public class InsufficientFundDemo {
    public static void main(String[] args) {
        Account account = new Account();
        System.out.println("Current balance : " + account.balance());
        account.withdraw(3500);
        System.out.println("Current balance : " + account.balance());
    }
}
// OUTPUT:
// Current balance : 3000
// Exception in thread "main" InsufficientFundException: Insufficient balance
//     at Account.withdraw(InsufficientFundDemo.java:16)
//     at InsufficientFundDemo.main(InsufficientFundDemo.java:26)`
                                ]
                            },

                            {
                                content: `<h3>Re-throwing a Caught Exception</h3>
Inside a <code>catch</code> block you can inspect, log, wrap, or simply re-throw the same exception (or a new one) using <code>throw</code> - the enclosing method must then either handle it too or declare it with <code>throws</code>.<br>`,
                                codeExamples: [
                                    `import java.io.IOException;

public class RethrowDemo {

    static void loadFile() throws IOException {
        try {
            throw new IOException("Invalid input");
        } catch (IOException e) {
            System.out.println("Logged before rethrow: " + e.getMessage());
            throw e;   // re-throw the same exception object
        }
    }

    public static void main(String[] args) {
        try {
            loadFile();
        } catch (IOException e) {
            System.out.println("Handled at top level: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Logged before rethrow: Invalid input
// Handled at top level: Invalid input`
                                ]
                            },

                            {
                                content: `<h3>Multiple Exceptions in One throws Clause</h3>
A single method can declare more than one checked exception type, comma-separated, if different parts of its body can fail in different ways.<br>`,
                                codeExamples: [
                                    `import java.io.IOException;
import java.sql.SQLException;

public class MultiThrowsDemo {

    static void syncData(boolean networkFails) throws IOException, SQLException {
        if (networkFails) {
            throw new IOException("Network unreachable");
        }
        throw new SQLException("Duplicate key");
    }

    public static void main(String[] args) {
        try {
            syncData(true);
        } catch (IOException e) {
            System.out.println("IO problem: " + e.getMessage());
        } catch (SQLException e) {
            System.out.println("DB problem: " + e.getMessage());
        }
    }
}
// OUTPUT:
// IO problem: Network unreachable`
                                ]
                            },

                            {
                                content: `<h3>throws and Method Overriding</h3>
When overriding a method, the overriding method can declare <strong>fewer or narrower</strong> checked exceptions than the parent (or none at all) - but it can <strong>never declare a new or broader</strong> checked exception than the one declared in the overridden method. Unchecked exceptions are exempt from this rule entirely.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Parent.method() throws IOException
  |
  +-- Child A: throws IOException        -> OK (same)
  +-- Child B: throws FileNotFoundException -> OK (narrower, subclass of IOException)
  +-- Child C: throws (nothing)           -> OK (narrower still, drops it entirely)
  +-- Child D: throws SQLException        -> COMPILE ERROR (new, unrelated checked exception)
  +-- Child E: throws Exception           -> COMPILE ERROR (broader than IOException)</pre>`,
                                codeExamples: [
                                    `import java.io.FileNotFoundException;
import java.io.IOException;

class Parent {
    void readData() throws IOException {
        System.out.println("Parent reading data");
    }
}

// OK: narrows IOException to FileNotFoundException
class ChildNarrower extends Parent {
    @Override
    void readData() throws FileNotFoundException {
        System.out.println("Child reading data (narrower checked exception)");
    }
}

// OK: drops the checked exception entirely
class ChildNoThrows extends Parent {
    @Override
    void readData() {
        System.out.println("Child reading data (no checked exception declared)");
    }
}

public class OverrideThrowsDemo {
    public static void main(String[] args) throws IOException {
        Parent p1 = new ChildNarrower();
        Parent p2 = new ChildNoThrows();
        p1.readData();
        p2.readData();
    }
}
// OUTPUT:
// Child reading data (narrower checked exception)
// Child reading data (no checked exception declared)`,
                                    `// COMPILE ERROR EXAMPLE - overriding method broadens the checked exception
import java.io.IOException;

class Parent {
    void readData() throws IOException {
        System.out.println("Parent reading data");
    }
}

class BrokenChild extends Parent {
    @Override
    void readData() throws Exception {   // Exception is BROADER than IOException
        System.out.println("Not allowed");
    }
    // COMPILE ERROR: readData() in BrokenChild cannot override readData()
    // in Parent - overridden method does not throw Exception
}`
                                ]
                            },

                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between throw and throws?</td><td>throw actually raises one exception object at a specific point in code; throws is a method-signature clause that declares one or more possible checked exception types</td></tr>
<tr class='text-center'><td>Can you write multiple exceptions after throw?</td><td>No - throw always takes exactly one exception object; throws can list several comma-separated types</td></tr>
<tr class='text-center'><td>Is throws needed for unchecked exceptions?</td><td>No - RuntimeException and its subclasses can be thrown freely without any throws declaration</td></tr>
<tr class='text-center'><td>What happens if you throw a checked exception without catching or declaring it?</td><td>Compile error: "unreported exception ... must be caught or declared to be thrown"</td></tr>
<tr class='text-center'><td>Can an overriding method add a new checked exception not in the parent's throws clause?</td><td>No - it can only keep the same, narrow it (subclass), or drop it entirely; adding a new or broader checked exception is a compile error</td></tr>
<tr class='text-center'><td>Can throw appear more than once in the same method?</td><td>Yes - a method can have several throw statements in different branches, each raising a different exception</td></tr>
</table>`
                            }
                        ]
};
