import { Topic } from '../coreJava';

export const exceptionHandlingInterviewQA: Topic = {
                        id: 'error2',
                        name: 'Exception Handling Interview Question & Answer',
                        beginner: [
                            {
                                content: `
<h3>Exception Basics</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  "><tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Exception Handling? Explain types of Exception.</td><td>Exception Handling is a mechanism in Java to handle runtime errors so that the normal flow of the application is not disrupted. It is done using try, catch, finally, throw and throws. Exceptions are broadly classified into two types: Checked Exceptions (checked at compile time, e.g. IOException, SQLException) and Unchecked Exceptions (occur at runtime, e.g. NullPointerException, ArithmeticException). Errors (like OutOfMemoryError, StackOverflowError) are a separate category representing serious problems not meant to be handled by applications.</td></tr>
<tr><td>What is the difference between Exception and Error?</td><td>Exception represents a condition that a program can catch and recover from (e.g. NullPointerException, IOException); it is a subclass of java.lang.Exception. Error represents a serious problem that a normal application should not try to catch or handle (e.g. OutOfMemoryError, StackOverflowError); it is a subclass of java.lang.Error. Both extend java.lang.Throwable.</td></tr>
<tr><td>What is the difference between Checked and Unchecked Exceptions?</td><td>Checked Exceptions are checked by the compiler at compile time; the method must either handle them with try-catch or declare them with throws (e.g. IOException, SQLException, ClassNotFoundException). Unchecked Exceptions (also called Runtime Exceptions) are not checked at compile time and occur due to programming errors; they extend RuntimeException (e.g. NullPointerException, ArrayIndexOutOfBoundsException, ArithmeticException).</td></tr>
</table>

<h3>Keywords and finally</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  "><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which keywords are used for handling exceptions in Java?</td><td>Java provides five keywords for exception handling: <b>try</b> (block containing code that might throw an exception), <b>catch</b> (block that handles the exception thrown by the try block), <b>finally</b> (block that always executes, used for cleanup), <b>throw</b> (used to explicitly throw an exception), and <b>throws</b> (used in a method signature to declare the exceptions a method may throw).</td></tr>
<tr><td>Explain the finally block.</td><td>The finally block is always executed after the try block, whether an exception occurs or not, and whether or not it is caught. It is typically used to release resources such as closing files, database connections or network sockets. The finally block will NOT execute only if the JVM is shut down using System.exit() inside the try block, or if the JVM crashes.</td></tr>
<tr><td>How do you handle multiple exceptions in Java?</td><td>Multiple exceptions can be handled in two ways. 1) Single catch block with a common superclass: if the exceptions share a hierarchy, catching the base exception type (e.g. Exception) in one catch block handles all of them. 2) Multi-catch block: a single try can be followed by multiple catch blocks, or Java 7+ allows combining exception types in one catch clause using the pipe (|) operator, e.g. catch (IOException | SQLException e).</td></tr>
</table>
`,
                                codeExamples: [
`public class MultiCatchDemo {
    public static void main(String[] args) {
        try {
            String[] arr = new String[3];
            System.out.println(arr[5].length()); // throws ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException | NullPointerException e) {
            System.out.println("Caught in multi-catch: " + e.getClass().getSimpleName());
        } finally {
            System.out.println("Finally block always executes");
        }
    }
}
// OUTPUT:
// Caught in multi-catch: ArrayIndexOutOfBoundsException
// Finally block always executes`
                                ]
                            },
                            {
                                content: `
<h3>Custom Exceptions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  "><tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a custom exception? How do you create a custom exception class?</td><td>A custom exception (also called a user-defined exception) is an exception class created by the programmer to represent application-specific error conditions, since the built-in exceptions (like IOException, NullPointerException) may not always fit business requirements. Steps: 1) Create a class that extends java.lang.Exception (for a checked exception) or java.lang.RuntimeException (for an unchecked exception) — unchecked is generally preferred unless callers must be forced to handle it. 2) Provide constructors, typically one that accepts a String message and calls super(message). 3) Throw an instance of it using the throw keyword where the error condition occurs.</td></tr>
<tr><td>What is ConcurrentModificationException?</td><td>ConcurrentModificationException occurs when a collection is structurally modified (e.g. an element added or removed) while it is being iterated using an iterator or for-each loop, without going through the iterator's own remove() method. It is an unchecked exception and a direct subclass of RuntimeException. It is commonly avoided by using Iterator.remove() or classes from java.util.concurrent such as CopyOnWriteArrayList.</td></tr>
</table>
`
                            }
                        ],
                        expert: [
                            {
                                content: `
<h3>try/catch/finally Mechanics</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  "><tr><th>Question</th><th>Answer</th></tr>
<tr><td>What happens if both the try/catch block and the finally block return a value?</td><td>If a finally block contains a return statement, it overrides any return value from the try or catch block, and any exception being propagated is suppressed. This is generally considered bad practice because it silently swallows exceptions and return values; finally should be reserved for cleanup, not for returning values.</td></tr>
<tr><td>Can a finally block prevent an exception from propagating?</td><td>Yes. If the finally block itself throws an exception or executes a return/break/continue, it discards whatever exception was being propagated from the try/catch block, and only the finally block's outcome is visible to the caller. This is a common source of subtle bugs.</td></tr>
<tr><td>What is exception chaining?</td><td>Exception chaining is the practice of wrapping a lower-level exception inside a higher-level, more meaningful exception while preserving the original exception as the "cause". Java supports this via the Throwable(Throwable cause) constructor and initCause() method, and the wrapped exception can be retrieved later using getCause(). This preserves the full stack trace for debugging while allowing higher-level, business-relevant exception types to be thrown.</td></tr>
</table>
`,
                                codeExamples: [
`public class FinallyReturnDemo {
    static int test() {
        try {
            return 1;
        } finally {
            return 2; // overrides the try block's return value
        }
    }

    public static void main(String[] args) {
        System.out.println("Result: " + test());
    }
}
// OUTPUT:
// Result: 2`,
`public class ExceptionChainingDemo {
    static void readConfig() throws ApplicationException {
        try {
            throw new java.io.IOException("File not found");
        } catch (java.io.IOException e) {
            throw new ApplicationException("Failed to load configuration", e);
        }
    }

    public static void main(String[] args) {
        try {
            readConfig();
        } catch (ApplicationException e) {
            System.out.println("Caught: " + e.getMessage());
            System.out.println("Cause: " + e.getCause());
        }
    }
}

class ApplicationException extends Exception {
    public ApplicationException(String message, Throwable cause) {
        super(message, cause);
    }
}
// OUTPUT:
// Caught: Failed to load configuration
// Cause: java.io.IOException: File not found`
                                ]
                            },
                            {
                                content: `
<h3>try-with-resources &amp; Best Practices</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  "><tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is try-with-resources and why is it preferred over a finally block for closing resources?</td><td>try-with-resources (introduced in Java 7) automatically closes any resource that implements java.lang.AutoCloseable (or Closeable) when the try block exits, whether normally or via an exception. It removes the need for a manual finally block to call close(), reduces boilerplate, and correctly handles suppressed exceptions (if both the try body and the close() call throw, the close() exception is "suppressed" and attached to the primary exception, retrievable via getSuppressed()).</td></tr>
<tr><td>What is the difference between throw and throws?</td><td>throw is used inside a method body to explicitly throw a single exception instance at runtime (e.g. throw new IllegalArgumentException("bad input")). throws is used in a method signature to declare that the method may propagate one or more checked exceptions to its caller, without handling them itself (e.g. public void readFile() throws IOException).</td></tr>
<tr><td>What are some best practices for exception handling in Java?</td><td>Key best practices include: catch only exceptions you can meaningfully handle; avoid catching generic Exception or Throwable unless rethrowing or logging at a boundary; never leave catch blocks empty; prefer unchecked exceptions for programming errors and checked exceptions for recoverable conditions the caller must address; always clean up resources (prefer try-with-resources over manual finally); preserve the original cause when wrapping exceptions; and avoid using exceptions for normal control flow since they are relatively expensive and hurt readability.</td></tr>
</table>
`,
                                codeExamples: [
`public class TryWithResourcesDemo {
    static class Resource implements AutoCloseable {
        public void use() {
            System.out.println("Using resource");
        }
        @Override
        public void close() {
            System.out.println("Resource closed automatically");
        }
    }

    public static void main(String[] args) {
        try (Resource r = new Resource()) {
            r.use();
        }
    }
}
// OUTPUT:
// Using resource
// Resource closed automatically`
                                ]
                            }
                        ]
};
