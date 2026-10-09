import { Topic } from '../coreJava';

export const objectClassDeepDive: Topic = {
    id: 'object-class',
    name: 'The Object Class in Java',

    beginner: [
        {
            content: `<h4>Object - the Root of Every Java Class</h4>
<p>Every class you write - even one with no <code>extends</code> clause - <b>implicitly extends</b> <code>java.lang.Object</code>.</p>
<ul>
<li>This is called a <b>single-rooted class hierarchy</b>: every object, of every type, is-a <code>Object</code>.</li>
<li>Because of this, every object automatically inherits a small set of methods defined on <code>Object</code>, whether you write them or not.</li>
<li>That's why a method like <code>list.add(anything)</code> can accept literally any object - <code>Object</code> is the universal type.</li>
</ul>`,
            codeExamples: [
                `public class Employee {
    // no "extends" written, but this still extends Object
}

public class Test {
    public static void main(String[] args) {
        Employee e = new Employee();
        System.out.println(e instanceof Object);
    }
}
// OUTPUT:
// true`
            ]
        },
        {
            content: `<h4>toString() - the Default Text Representation</h4>
The default <code>Object.toString()</code> returns <code>fully.qualified.ClassName@hexHashCode</code>. Overriding it is one of the most common things every class does.`,
            codeExamples: [
                `class Point {
    int x = 3, y = 4;
}

class NamedPoint {
    int x = 3, y = 4;
    @Override
    public String toString() {
        return "(" + x + ", " + y + ")";
    }
}

public class Test {
    public static void main(String[] args) {
        System.out.println(new Point());       // default Object.toString()
        System.out.println(new NamedPoint());  // overridden
    }
}
// OUTPUT:
// Point@<some-hash>
// (3, 4)`
            ]
        },
        {
            content: `<h4>getClass() - Runtime Type Information</h4>
<code>getClass()</code> returns the object's actual runtime <code>Class&lt;?&gt;</code> - and unlike <code>toString()</code> or <code>equals()</code>, it <b>cannot be overridden</b> (it's declared <code>final</code> in <code>Object</code>).`,
            codeExamples: [
                `public class Test {
    public static void main(String[] args) {
        Object obj = "Hello";
        System.out.println(obj.getClass().getName());
        System.out.println(obj.getClass().getSimpleName());
    }
}
// OUTPUT:
// java.lang.String
// String`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>equals() and hashCode() - Just a Pointer Here</h3>
<code>Object</code> also declares <code>equals(Object)</code> (default: reference equality, <code>==</code>) and <code>hashCode()</code> (default: an identity-based hash). Overriding these correctly - and together - is a big enough topic to have its own dedicated page: see <b>equals() and hashCode() Contract</b> for the full contract, the classic HashMap-breaking bug, and how to fix it.`
        },
        {
            content: `<h3>clone() - Just a Pointer Here Too</h3>
<code>Object.clone()</code> performs a protected, low-level field-by-field copy, but it only works if the class implements the <code>Cloneable</code> marker interface - otherwise it throws <code>CloneNotSupportedException</code>. The shallow-vs-deep-copy nuance and why many teams avoid <code>clone()</code> entirely are covered in <b>Object Cloning</b>.`
        },
        {
            content: `<h3>finalize() - Deprecated Since Java 9</h3>
<code>Object.finalize()</code> used to run just before an object was garbage collected, intended as a last-chance cleanup hook. It is <b>deprecated since Java 9</b> and scheduled for eventual removal, because:
<ul>
<li>There's <b>no guarantee when</b> (or even if) it will run - the garbage collector decides, not your code.</li>
<li>A slow or throwing <code>finalize()</code> can silently degrade GC performance for the whole application.</li>
<li>It made resource leaks (unclosed files, sockets) intermittent and very hard to reproduce.</li>
</ul>
The modern replacements are <b>try-with-resources</b> (deterministic, immediate cleanup via <code>AutoCloseable</code>) and, for genuinely GC-triggered cleanup, <code>java.lang.ref.Cleaner</code>.`,
            codeExamples: [
                `public class LegacyResource {
    @Override
    @SuppressWarnings("removal")
    protected void finalize() throws Throwable {
        System.out.println("finalize() called - but WHEN is unpredictable!");
        super.finalize();
    }
}
// There is no reliable "OUTPUT" here - finalize() may run late, or never,
// which is exactly why it should not be relied on for cleanup.`
            ]
        },
        {
            content: `<h3>wait() / notify() / notifyAll() - Just a Pointer Here</h3>
Every object also inherits <code>wait()</code>, <code>notify()</code>, and <code>notifyAll()</code> because Java's built-in thread coordination is implemented on every object's own monitor. Calling any of these <b>without holding the object's monitor</b> (i.e. outside a <code>synchronized</code> block on that object) throws <code>IllegalMonitorStateException</code>. The full mechanics belong to multithreading - see the <b>Synchronization in Java</b> and <b>Multithreading in Java</b> topics for the complete picture.`,
            codeExamples: [
                `public class Test {
    public static void main(String[] args) {
        Object lock = new Object();
        try {
            lock.wait(); // called WITHOUT synchronized(lock) { ... }
        } catch (IllegalMonitorStateException e) {
            System.out.println("Caught: " + e.getClass().getSimpleName());
        } catch (InterruptedException e) {
            // not reached here
        }
    }
}
// OUTPUT:
// Caught: IllegalMonitorStateException`
            ]
        },
        {
            content: `<h3>All Object Methods at a Glance</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>Purpose</th><th>Overridable?</th></tr>
<tr class='text-center'><td>toString()</td><td>Text representation</td><td>Yes - very commonly overridden</td></tr>
<tr class='text-center'><td>equals(Object)</td><td>Logical equality check</td><td>Yes - must be paired with hashCode()</td></tr>
<tr class='text-center'><td>hashCode()</td><td>Integer hash for hash-based collections</td><td>Yes - must stay consistent with equals()</td></tr>
<tr class='text-center'><td>getClass()</td><td>Runtime type info</td><td>No - declared final</td></tr>
<tr class='text-center'><td>clone()</td><td>Field-by-field copy</td><td>Yes, but requires implementing Cloneable</td></tr>
<tr class='text-center'><td>finalize()</td><td>Pre-GC cleanup hook</td><td>Deprecated since Java 9 - avoid</td></tr>
<tr class='text-center'><td>wait()/notify()/notifyAll()</td><td>Thread coordination via the object's monitor</td><td>No - declared final</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why does every Java class implicitly extend Object?</td><td>Java uses a single-rooted class hierarchy, so every type shares a common base with a baseline set of behaviors</td></tr>
<tr class='text-center'><td>Can getClass() be overridden?</td><td>No - it's declared final in Object</td></tr>
<tr class='text-center'><td>Why is finalize() deprecated?</td><td>Its execution timing is unpredictable and it can silently hurt GC performance; try-with-resources/Cleaner replace it</td></tr>
<tr class='text-center'><td>What happens if you call wait() outside a synchronized block?</td><td>IllegalMonitorStateException - you must hold the object's monitor first</td></tr>
<tr class='text-center'><td>What's the default toString() output format?</td><td>fully.qualified.ClassName@hexHashCode</td></tr>
</table>`
        }
    ]
};
