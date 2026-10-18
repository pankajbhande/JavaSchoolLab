import { Topic } from '../coreJava';

export const exceptionHandlingInJava: Topic = {
                        id: 'exception-handling',
                        name: 'Exception Handling in Java',
                        beginner: [
                            {
                                content: `<p>An <strong>exception</strong> is an abnormal condition that occurs during the execution of a program and stops the normal flow of the application.</p>
<p>Exception handling in Java is about managing these errors gracefully so they do not crash your program unexpectedly.</p>
<p>Below is one small, runnable code + output for each core building block:</p>`
                            },

                            {
                                content: `<h4>1. Proof: an unhandled exception stops the program</h4>
Without any exception handling, once an error occurs the rest of the program never runs.`,
                                codeExamples: [
                                    `public class Test {
    public static void main(String[] args) {
        System.out.println("First line");
        System.out.println("Second line");
        System.out.println("Third line");
        int a = 10 / 0;               // exception happens here
        System.out.println("Fourth line");   // never runs
        System.out.println("Fifth line");    // never runs
    }
}
// OUTPUT:
// First line
// Second line
// Third line
// Exception in thread "main" java.lang.ArithmeticException: / by zero
//     at Test.main(Test.java:6)`
                                ]
                            },

                            {
                                content: `<h4>2. try-catch — catching the exception so the program keeps running</h4>
Wrapping the risky code in a <code>try</code> block, with a matching <code>catch</code> block, lets the rest of the program continue even after the error.`,
                                codeExamples: [
                                    `public class Test {
    public static void main(String[] args) {
        System.out.println("First line");
        System.out.println("Second line");
        System.out.println("Third line");
        try {
            int a = 10 / 0;
        } catch (Exception e) {
            System.out.println(e);
        }
        System.out.println("Fourth line");
        System.out.println("Fifth line");
    }
}
// OUTPUT:
// First line
// Second line
// Third line
// java.lang.ArithmeticException: / by zero
// Fourth line
// Fifth line`
                                ]
                            },

                            {
                                content: `<h4>3. finally — code that always runs, exception or not</h4>
The <code>finally</code> block executes whether or not an exception was thrown, and even if the <code>catch</code> block itself doesn't run - it's the standard place to close files, connections, or release resources.`,
                                codeExamples: [
                                    `public class FinallyDemo {
    public static void main(String[] args) {
        try {
            System.out.println("Inside try");
            int a = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Inside catch: " + e.getMessage());
        } finally {
            System.out.println("Inside finally - always runs");
        }
        System.out.println("Program continues");
    }
}
// OUTPUT:
// Inside try
// Inside catch: / by zero
// Inside finally - always runs
// Program continues`
                                ]
                            },

                            {
                                content: `<h4>4. Multiple catch blocks — handling different exception types differently</h4>
You can chain multiple <code>catch</code> blocks after one <code>try</code>; Java picks the first one whose type matches the exception that was actually thrown.`,
                                codeExamples: [
                                    `public class MultiCatchDemo {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3};
        try {
            System.out.println(numbers[5]);   // out of bounds
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic problem: " + e.getMessage());
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array index problem: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("Some other problem: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Array index problem: Index 5 out of bounds for length 3`
                                ]
                            },

                            {
                                content: `<h4>5. Common Runtime (Unchecked) Exceptions You'll Actually Hit</h4>
These are the exceptions beginners run into constantly. They're all unchecked (subclasses of <code>RuntimeException</code>), so the compiler never forces you to handle them - but real code should anyway.<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Exception</th><th>When it happens</th></tr>
<tr class='text-center'><td>ArithmeticException</td><td>Integer division by zero</td></tr>
<tr class='text-center'><td>NullPointerException</td><td>Calling a method/field on a null reference</td></tr>
<tr class='text-center'><td>ArrayIndexOutOfBoundsException</td><td>Accessing an array index outside its valid range</td></tr>
<tr class='text-center'><td>NumberFormatException</td><td><code>Integer.parseInt(...)</code> (or similar) given text that isn't a valid number</td></tr>
<tr class='text-center'><td>InputMismatchException</td><td><code>Scanner.nextInt()</code> (or similar) given input of the wrong type</td></tr>
<tr class='text-center'><td>IllegalStateException</td><td>Calling a method when the object isn't in the right state - e.g. <code>Iterator.remove()</code> before <code>next()</code></td></tr>
</table>`,
                                codeExamples: [
                                    `public class CommonExceptionsDemo {
    public static void main(String[] args) {
        try {
            String str = null;
            System.out.println(str.length());
        } catch (NullPointerException e) {
            System.out.println("NPE: " + e);   // message text varies by Java version
        }

        try {
            int a = Integer.parseInt("25+");
        } catch (NumberFormatException e) {
            System.out.println("NFE: " + e);
        }

        try {
            java.util.ArrayList<String> list = new java.util.ArrayList<>();
            list.add("a");
            java.util.Iterator<String> itr = list.iterator();
            itr.remove();   // remove() called before next()
        } catch (IllegalStateException e) {
            System.out.println("ISE: " + e);
        }
    }
}
// OUTPUT:
// NPE: java.lang.NullPointerException (newer Java adds a detail message)
// NFE: java.lang.NumberFormatException: For input string: "25+"
// ISE: java.lang.IllegalStateException`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>The Exception Class Hierarchy</h3>
<code>Throwable</code> sits at the top of the hierarchy and is the superclass of everything that can be thrown. Both <code>Exception</code> and <code>Error</code> extend it.

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Throwable
  +-- Error                      (JVM/system-level problems - usually not caught)
  |     +-- OutOfMemoryError
  |     +-- StackOverflowError
  |
  +-- Exception                  (application-level problems - meant to be caught)
        +-- IOException          (checked - compiler forces you to handle it)
        +-- SQLException         (checked)
        +-- RuntimeException     (unchecked - compiler does NOT force handling)
              +-- ArithmeticException
              +-- NullPointerException
              +-- ArrayIndexOutOfBoundsException</pre>
<br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Class</th><th>Meaning</th></tr>
<tr class='text-center'><td>Throwable</td><td>Superclass of everything throwable/catchable</td></tr>
<tr class='text-center'><td>Error</td><td>Serious problems from the environment/JVM (e.g. out of memory) - not caused by application logic, and generally not caught</td></tr>
<tr class='text-center'><td>Exception</td><td>Problems an application should anticipate and handle</td></tr>
</table>
<br>
A full checked-vs-unchecked comparison, with more examples, is covered in the next topic in this module.<br>`
                            },

                            {
                                content: `<h3>Proof: finally Runs Even When try Has a return</h3>
A <code>return</code> inside <code>try</code> doesn't skip <code>finally</code> - the JVM runs <code>finally</code> right before actually returning. This is a classic interview trap, especially when <code>finally</code> also has a <code>return</code>.<br>`,
                                codeExamples: [
                                    `public class FinallyReturnDemo {
    static int test() {
        try {
            return 1;
        } finally {
            System.out.println("finally runs before the value is returned");
        }
    }

    static int trap() {
        try {
            return 1;
        } finally {
            return 2;   // this silently overrides the try's return value!
        }
    }

    public static void main(String[] args) {
        System.out.println(test());
        System.out.println(trap());
    }
}
// OUTPUT:
// finally runs before the value is returned
// 1
// 2`
                                ]
                            },

                            {
                                content: `<h3>try-with-resources — Automatic Resource Cleanup (Java 7+)</h3>
Any resource implementing <code>AutoCloseable</code> declared in the <code>try(...)</code> parentheses is closed automatically, in reverse order, once the block ends - even if an exception is thrown. This replaces manually closing resources in a <code>finally</code> block.<br>`,
                                codeExamples: [
                                    `class MyResource implements AutoCloseable {
    String name;
    MyResource(String name) { this.name = name; }

    void use() {
        System.out.println(name + " in use");
    }

    @Override
    public void close() {
        System.out.println(name + " closed");
    }
}

public class TryWithResourcesDemo {
    public static void main(String[] args) {
        try (MyResource r1 = new MyResource("Resource-1");
             MyResource r2 = new MyResource("Resource-2")) {
            r1.use();
            r2.use();
        }
        // No finally block needed - both resources auto-close here,
        // in reverse order: Resource-2 first, then Resource-1.
    }
}
// OUTPUT:
// Resource-1 in use
// Resource-2 in use
// Resource-2 closed
// Resource-1 closed`
                                ]
                            },

                            {
                                content: `<h3>Custom Exceptions</h3>
For business-specific error conditions, define your own exception class by extending <code>Exception</code> (checked) or <code>RuntimeException</code> (unchecked) - this lets calling code catch your exact error type and read a meaningful message.<br>`,
                                codeExamples: [
                                    `class InsufficientBalanceException extends RuntimeException {
    InsufficientBalanceException(String message) {
        super(message);
    }
}

class BankAccount {
    double balance;
    BankAccount(double balance) { this.balance = balance; }

    void withdraw(double amount) {
        if (amount > balance) {
            throw new InsufficientBalanceException(
                "Cannot withdraw " + amount + ", balance is only " + balance);
        }
        balance -= amount;
    }
}

public class CustomExceptionDemo {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount(1000);
        try {
            acc.withdraw(5000);
        } catch (InsufficientBalanceException e) {
            System.out.println("Transaction failed: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Transaction failed: Cannot withdraw 5000.0, balance is only 1000.0`
                                ]
                            },

                            {
                                content: `<h3>Exception Chaining — Preserving the Root Cause</h3>
When you catch a low-level exception and re-throw a higher-level one, pass the original exception as the <strong>cause</strong> so the full failure chain is still visible for debugging - never swallow the original exception silently.<br>`,
                                codeExamples: [
                                    `class DataAccessException extends RuntimeException {
    DataAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}

public class ExceptionChainingDemo {
    static void queryDatabase() {
        throw new ArithmeticException("division error inside query logic");
    }

    static void loadUser() {
        try {
            queryDatabase();
        } catch (ArithmeticException e) {
            // wrap it, but keep the original cause attached
            throw new DataAccessException("Failed to load user", e);
        }
    }

    public static void main(String[] args) {
        try {
            loadUser();
        } catch (DataAccessException e) {
            System.out.println("Top-level error: " + e.getMessage());
            System.out.println("Root cause: " + e.getCause());
        }
    }
}
// OUTPUT:
// Top-level error: Failed to load user
// Root cause: java.lang.ArithmeticException: division error inside query logic`
                                ]
                            },

                            {
                                content: `<h3>Catch Block Ordering — Child Must Come Before Parent</h3>
When catching a class and one of its subclasses, the <b>more specific (child) exception's catch block must come first</b>. If the parent's catch block came first, it would catch everything - including the child type - leaving the child's catch block unreachable, which is a <b>compile-time error</b> in Java.
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">try {
    // ...
}
catch (Exception e) {              // parent - catches everything
}
catch (ArithmeticException e1) {   // ERROR: unreachable, already caught above
}</pre>`,
                                codeExamples: [
                                    `public class CatchOrderDemo {
    public static void main(String[] args) {
        try {
            int a = 10 / 0;
        } catch (ArithmeticException e1) {   // child - must come first
            System.out.println("Specific: " + e1);
        } catch (Exception e) {              // parent - comes last, catches the rest
            System.out.println("General: " + e);
        }
    }
}
// OUTPUT:
// Specific: java.lang.ArithmeticException: / by zero`
                                ]
                            },

                            {
                                content: `<h3>try / catch / finally — Which Combinations Compile</h3>
<code>try</code> can never stand alone - it must be followed by at least one <code>catch</code>, a <code>finally</code>, or both.<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Combination</th><th>Allowed?</th></tr>
<tr class='text-center'><td>try alone</td><td>No - must be followed by catch and/or finally</td></tr>
<tr class='text-center'><td>try + catch</td><td>Yes</td></tr>
<tr class='text-center'><td>try + finally (no catch)</td><td>Yes</td></tr>
<tr class='text-center'><td>try + catch + finally</td><td>Yes</td></tr>
<tr class='text-center'><td>try + multiple catch (child before parent)</td><td>Yes</td></tr>
<tr class='text-center'><td>try + multiple catch (parent before child)</td><td>No - compile error, parent catch makes the child catch unreachable</td></tr>
</table>
<br>
<h4>Catch vs. finally</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>catch</th><th>finally</th></tr>
<tr class='text-center'><td>Runs only if the try block actually throws a matching exception</td><td>Runs whether or not an exception occurred</td></tr>
<tr class='text-center'><td>A try can have multiple catch blocks</td><td>Only one finally block per try</td></tr>
<tr class='text-center'><td>Used to handle/recover from an exception</td><td>Used for cleanup (closing files, DB connections, streams), not exception handling</td></tr>
</table>`
                            },

                            {
                                content: `<h3>ConcurrentModificationException</h3>
Thrown when a collection is structurally modified (elements added/removed) directly while it's being iterated, instead of going through the iterator's own <code>remove()</code>. It's an unchecked subclass of <code>RuntimeException</code>.<br>`,
                                codeExamples: [
                                    `import java.util.ArrayList;
import java.util.List;

public class ConcurrentModificationDemo {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("a");
        list.add("b");
        list.add("c");

        try {
            for (String s : list) {
                // Removing the second-to-last element ("b") would NOT throw:
                // hasNext() turns false and the loop just ends.
                if (s.equals("a")) {
                    list.remove(s);   // modifying the list while the for-each iterates it
                }
            }
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("Caught: " + e);
        }
    }
}
// OUTPUT:
// Caught: java.util.ConcurrentModificationException`
                                ]
                            }
                        ]
};
