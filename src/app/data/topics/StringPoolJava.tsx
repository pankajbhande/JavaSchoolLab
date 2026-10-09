import { Topic } from '../coreJava';

export const stringPoolJava: Topic = {
    id: 'string-pool-java',
    name: 'String Pool',
    beginner: [
        {
            content: `<h3>Strings Are Special in Java</h3>
Strings are used so heavily in every Java program that the JVM has a dedicated optimization for them called
the <strong>String Pool</strong> (also called the String Constant Pool or String Intern Pool). It's a special
area in memory that stores unique String literals so identical text doesn't get duplicated over and over.`
        },
        {
            content: `<h3>String Literals Share the Same Object</h3>
When you create a String using a literal (double quotes), Java checks the pool first. If an identical String
already exists there, it reuses it instead of creating a new object.`,
            codeExamples: [`public class StringLiteralDemo {
    public static void main(String[] args) {
        String a = "hello";
        String b = "hello";

        System.out.println(a == b); // both point to the SAME pooled object
    }
}
// OUTPUT:
// true`]
        },
        {
            content: `<h3><code>new String()</code> Skips the Pool</h3>
Using the <code>new</code> keyword with String always creates a brand-new object on the Heap, even if an
identical literal already exists in the pool.`,
            codeExamples: [`public class NewStringDemo {
    public static void main(String[] args) {
        String a = "hello";
        String b = new String("hello");

        System.out.println(a == b);      // different objects
        System.out.println(a.equals(b)); // same content
    }
}
// OUTPUT:
// false
// true`]
        },
        {
            content: `<h3>Bringing a String Into the Pool with <code>intern()</code></h3>
The <code>intern()</code> method looks up the String's content in the pool. If found, it returns the pooled
reference; if not, it adds the String's content to the pool and returns that reference.`,
            codeExamples: [`public class InternDemo {
    public static void main(String[] args) {
        String a = "hello";
        String b = new String("hello").intern();

        System.out.println(a == b); // now both reference the pooled "hello"
    }
}
// OUTPUT:
// true`]
        },
        {
            content: `<h3>Why This Saves Memory</h3>
Imagine an application that stores "India" as a city/country name a million times across different objects.
Without pooling, that could mean a million separate String objects holding identical text. With the pool,
all million literal usages share ONE object.`,
            codeExamples: [`public class MemorySavingDemo {
    public static void main(String[] args) {
        String[] countries = new String[3];
        countries[0] = "India";
        countries[1] = "India";
        countries[2] = "India";

        // all three array slots reference the SAME pooled "India" object
        System.out.println(countries[0] == countries[1]);
        System.out.println(countries[1] == countries[2]);
    }
}
// OUTPUT:
// true
// true`]
        }
    ],

    expert: [
        {
            content: `<h3>Where the Pool Actually Lives</h3>
Historically (Java 6 and earlier), the String Pool lived in <strong>PermGen</strong>, a fixed-size area
prone to <code>OutOfMemoryError: PermGen space</code> if too many Strings were interned. Since
<strong>Java 7</strong>, the pool was moved into the main <strong>Heap</strong> itself, which lets it grow
dynamically and be garbage collected like any other heap data, drastically reducing intern-related
OutOfMemoryErrors in practice.`
        },
        {
            content: `<h3>Compile-Time Constant Folding</h3>
The pool doesn't just apply to simple literals - the compiler also folds constant expressions at compile
time, so they resolve to the same pooled String even though the source doesn't look identical.`,
            codeExamples: [`public class ConstantFoldingDemo {
    public static void main(String[] args) {
        String a = "hello";
        String b = "hel" + "lo"; // compiler folds this into "hello" at COMPILE time

        String prefix = "hel";
        String c = prefix + "lo"; // NOT folded - prefix is a variable, resolved at RUNTIME

        System.out.println(a == b); // true: both are the same compile-time constant
        System.out.println(a == c); // false: c is built at runtime via StringBuilder
    }
}
// OUTPUT:
// true
// false`]
        },
        {
            content: `<h3>String Pool Diagram</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Heap
+-----------------------------------------------------+
|  String Pool (part of Heap since Java 7)              |
|   "hello"  <----------------------+                   |
+-----------------------------------|-------------------+
                                     |
Stack                                |
+----------------+                   |
| a  ---------------------------------                 (literal "hello")
| b  ---------------------------------                 (literal "hello")
| c  -----------------> +----------------------+       (new String("hello"))
+----------------+       | new String object   |       lives OUTSIDE the pool
                          |  "hello"             |       on general heap
                          +----------------------+</pre>`
        },
        {
            content: `<h3>String Pool: Key Facts Compared</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>String literal <code>"x"</code></th><th><code>new String("x")</code></th></tr>
<tr class='text-center'><td>Location</td><td>String Pool (in Heap since Java 7)</td><td>General Heap (outside pool)</td></tr>
<tr class='text-center'><td>Reused if content matches?</td><td>Yes, automatically</td><td>No, always a new object</td></tr>
<tr class='text-center'><td><code>==</code> with identical literal</td><td>true</td><td>false</td></tr>
<tr class='text-center'><td>Eligible for GC</td><td>Only if unreferenced pool-wide (rare)</td><td>As soon as unreachable, like any object</td></tr>
<tr class='text-center'><td>Can be added to pool manually?</td><td>N/A (already there)</td><td>Yes, via <code>.intern()</code></td></tr>
</table>`
        },
        {
            content: `<h3>Common Bugs and Misconceptions</h3>
• <strong>Comparing Strings with <code>==</code> instead of <code>.equals()</code></strong> - works
"by accident" for literals due to pooling, then silently breaks in production once a String comes from
user input, a database, or <code>new String(...)</code>. Always use <code>.equals()</code> for content
comparison. <br>
• <strong>"Interning everything improves performance."</strong> Over-interning large numbers of unique
runtime Strings can bloat the pool and increase lookup/GC cost - only intern Strings you know will repeat
often. <br>
• <strong>Assuming the pool still causes PermGen OutOfMemoryError</strong> in modern Java - since Java 7 the
pool lives in the regular Heap, so this specific historical failure mode mostly no longer applies. <br>
• <strong>Forgetting that <code>StringBuilder.toString()</code> never returns a pooled String</strong>, even
if the resulting text matches an existing literal exactly - it's a fresh Heap object unless you call
<code>.intern()</code> on it.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the String Pool?</td><td>A special memory area that stores unique String literals so identical text is shared instead of duplicated</td></tr>
<tr><td>Where does the String Pool live in modern Java?</td><td>Inside the main Heap, since Java 7 (previously in PermGen before that)</td></tr>
<tr><td>Does <code>new String("x")</code> use the pool?</td><td>No - it always creates a new object on the general heap, bypassing the pool</td></tr>
<tr><td>What does <code>String.intern()</code> do?</td><td>Returns the pooled reference for that content, adding it to the pool first if not already present</td></tr>
<tr><td>Why is <code>==</code> risky for comparing Strings?</td><td>It compares references, not content; it may accidentally work for pooled literals but fail for equal-content Strings from <code>new</code>, user input, or concatenation at runtime</td></tr>
<tr><td>Are compile-time constant expressions like <code>"hel" + "lo"</code> pooled?</td><td>Yes, the compiler folds them into a single literal at compile time, so they resolve to the pooled instance</td></tr>
<tr><td>Is runtime concatenation like <code>prefix + "lo"</code> pooled automatically?</td><td>No, it's built via StringBuilder at runtime and produces a new, non-pooled object unless <code>.intern()</code> is called</td></tr>
</table>`
        }
    ]
};
