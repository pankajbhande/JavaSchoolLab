import { Topic } from '../coreJava';

export const tryWithResources: Topic = {
    id: 'try-with-resources',
    name: 'try-with-resources',

    beginner: [
        {
            content: `<h4>What is try-with-resources?</h4>
<b>try-with-resources</b> (Java 7+) is a special form of <code>try</code> that automatically <b>closes</b> any resource declared in its parentheses once the block finishes - whether it finishes normally or by throwing an exception.<br><br>
• A "resource" here means any object implementing <code>AutoCloseable</code> - files, database connections, sockets, streams, etc.<br>
• It removes the need to manually write a <code>finally</code> block that calls <code>close()</code>.<br>
• Syntax: <code>try (Resource r = new Resource()) { ... }</code>`
        },
        {
            content: `<h4>The AutoCloseable Interface</h4>
<code>AutoCloseable</code> declares a single method: <code>void close() throws Exception;</code>.<br>
• Any class implementing it can be used inside <code>try (...)</code>.<br>
• Many familiar JDK classes already implement it: <code>FileReader</code>, <code>BufferedReader</code>, <code>Connection</code> (JDBC), <code>Scanner</code>, etc.<br>
• You can make your own classes work with try-with-resources by implementing it yourself.`,
            codeExamples: [
                `class Resource implements AutoCloseable {
    String name;

    Resource(String name) {
        this.name = name;
        System.out.println("Opening " + name);
    }

    void use() {
        System.out.println("Using " + name);
    }

    @Override
    public void close() {
        System.out.println("Closing " + name);
    }
}

public class TryWithResourcesBasicDemo {
    public static void main(String[] args) {
        try (Resource r = new Resource("Resource-1")) {
            r.use();
        }
        System.out.println("Done - close() already ran automatically");
    }
}
// OUTPUT:
// Opening Resource-1
// Using Resource-1
// Closing Resource-1
// Done - close() already ran automatically`
            ]
        },
        {
            content: `<h4>The Old Way — Manual try/finally</h4>
Before Java 7, closing a resource safely meant a verbose, easy-to-get-wrong <code>try/finally</code>:`,
            codeExamples: [
                `class Resource implements AutoCloseable {
    String name;
    Resource(String name) { this.name = name; System.out.println("Opening " + name); }
    void use() { System.out.println("Using " + name); }
    @Override public void close() { System.out.println("Closing " + name); }
}

public class OldStyleCleanupDemo {
    public static void main(String[] args) {
        Resource r = new Resource("Resource-1");
        try {
            r.use();
        } finally {
            r.close();   // must remember this - and it must be here, not after the try
        }
    }
}
// OUTPUT:
// Opening Resource-1
// Using Resource-1
// Closing Resource-1`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Multiple Resources — Closed in Reverse Declaration Order</h3>
When several resources are declared in the same <code>try (...)</code>, separated by semicolons, Java closes them in the <b>opposite</b> order they were opened - the last one opened is the first one closed, mirroring how nested try/finally blocks would behave.`,
            codeExamples: [
                `class Resource implements AutoCloseable {
    String name;
    Resource(String name) { this.name = name; System.out.println("Opening " + name); }
    @Override public void close() { System.out.println("Closing " + name); }
}

public class MultipleResourcesOrderDemo {
    public static void main(String[] args) {
        try (Resource a = new Resource("A"); Resource b = new Resource("B"); Resource c = new Resource("C")) {
            System.out.println("Using A, B, C");
        }
    }
}
// OUTPUT:
// Opening A
// Opening B
// Opening C
// Using A, B, C
// Closing C
// Closing B
// Closing A`
            ]
        },
        {
            content: `<h3>Java 9+ — Effectively-Final Variable Enhancement</h3>
Originally, a resource had to be <b>declared</b> inside the <code>try (...)</code> parentheses. Since Java 9, you can instead reference an existing <b>effectively final</b> variable (one never reassigned after initialization) without redeclaring it - useful when the resource was created earlier or is reused.`,
            codeExamples: [
                `class Resource implements AutoCloseable {
    String name;
    Resource(String name) { this.name = name; System.out.println("Opening " + name); }
    void use() { System.out.println("Using " + name); }
    @Override public void close() { System.out.println("Closing " + name); }
}

public class Java9EffectivelyFinalDemo {
    public static void main(String[] args) {
        Resource r = new Resource("Resource-1");   // effectively final - never reassigned
        try (r) {                                   // Java 9+: reuse the variable directly
            r.use();
        }
    }
}
// OUTPUT:
// Opening Resource-1
// Using Resource-1
// Closing Resource-1`
            ]
        },
        {
            content: `<h3>Suppressed Exceptions — When Both the Body AND close() Throw</h3>
If an exception is thrown inside the <code>try</code> body <b>and</b> <code>close()</code> also throws while cleaning up, Java does NOT lose either one:<br>
• The exception from the <code>try</code> body is treated as the <b>primary</b> exception - it's the one that actually propagates.<br>
• The exception thrown by <code>close()</code> is attached to the primary one as a <b>suppressed exception</b>, retrievable via <code>getSuppressed()</code>.<br><br>
This is a major improvement over manual <code>try/finally</code>, where an exception thrown in <code>finally</code> used to <b>completely replace</b> (and hide) the original exception from the <code>try</code> body.`,
            codeExamples: [
                `class FaultyResource implements AutoCloseable {
    @Override
    public void close() throws Exception {
        throw new Exception("close() failed");
    }
}

public class SuppressedExceptionDemo {
    public static void main(String[] args) {
        try {
            try (FaultyResource r = new FaultyResource()) {
                throw new RuntimeException("body failed");
            }
        } catch (Exception e) {
            System.out.println("Primary: " + e.getMessage());
            for (Throwable suppressed : e.getSuppressed()) {
                System.out.println("Suppressed: " + suppressed.getMessage());
            }
        }
    }
}
// OUTPUT:
// Primary: body failed
// Suppressed: close() failed`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What interface must a resource implement to be used in try-with-resources?</td><td>AutoCloseable (or its stricter sub-interface Closeable, used by java.io classes)</td></tr>
<tr class='text-center'><td>In what order are multiple resources closed?</td><td>Reverse of declaration order - the last resource opened is the first one closed</td></tr>
<tr class='text-center'><td>What happens if the try body AND close() both throw?</td><td>The try body's exception is primary and propagates; close()'s exception is attached to it as a "suppressed" exception, retrievable via getSuppressed()</td></tr>
<tr class='text-center'><td>How is this better than manual try/finally?</td><td>Old-style finally silently discarded the original exception if finally also threw; try-with-resources preserves both via suppression</td></tr>
<tr class='text-center'><td>Do you still need a finally block with try-with-resources?</td><td>Only for cleanup logic unrelated to closing the declared resources - the resource's close() is already guaranteed automatically</td></tr>
<tr class='text-center'><td>What changed in Java 9 for try-with-resources?</td><td>You can pass an existing effectively-final variable directly in the try(...) parentheses instead of always declaring a new one</td></tr>
</table>`
        }
    ]
};
