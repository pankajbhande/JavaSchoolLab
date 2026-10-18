import { Topic } from '../coreJava';

export const referencesInJava: Topic = {
    id: 'references-in-java',
    name: 'References',
    beginner: [
        {
            content: `<h3>A Reference Is Not the Object</h3>
In Java, when you write <code>Student s1 = new Student();</code>, the variable <strong>s1</strong> does NOT
hold the actual Student object. It holds a <em>reference</em> - basically an address that tells the JVM
"the real object lives over there in the Heap." <br><br>
Think of a reference like a house's <em>address written on a piece of paper</em>. The paper (variable) is
small and easy to carry around; the actual house (object) is the big thing sitting at that address.`
        },
        {
            content: `<h3>Copying a Reference Copies the Address, Not the Object</h3>
When you assign one reference variable to another, you are copying the address - both variables now point
to the exact same object in memory. No new object is created.`,
            codeExamples: [`public class ReferenceCopyDemo {
    int balance;

    ReferenceCopyDemo(int balance) {
        this.balance = balance;
    }

    public static void main(String[] args) {
        ReferenceCopyDemo account1 = new ReferenceCopyDemo(1000);
        ReferenceCopyDemo account2 = account1; // copies the reference, not the object

        account2.balance = 5000; // modifies the SAME object

        System.out.println("account1.balance = " + account1.balance);
        System.out.println("account2.balance = " + account2.balance);
    }
}
// OUTPUT:
// account1.balance = 5000
// account2.balance = 5000`]
        },
        {
            content: `<h3>A Reference Can Point to Nothing: <code>null</code></h3>
A reference variable that isn't pointing to any object holds the special value <code>null</code>. Trying to
use a null reference to call a method throws a <code>NullPointerException</code>.`,
            codeExamples: [`public class NullReferenceDemo {
    public static void main(String[] args) {
        String name = null;
        System.out.println("Before: " + name);

        try {
            System.out.println(name.length()); // using a null reference
        } catch (NullPointerException e) {
            System.out.println("Caught: NullPointerException");
        }
    }
}
// OUTPUT:
// Before: null
// Caught: NullPointerException`]
        },
        {
            content: `<h3>Two References, Two Different Objects</h3>
If instead you create two separate objects with <code>new</code>, each reference points to its own,
independent object - changing one never affects the other.`,
            codeExamples: [`public class IndependentObjectsDemo {
    int balance;

    IndependentObjectsDemo(int balance) {
        this.balance = balance;
    }

    public static void main(String[] args) {
        IndependentObjectsDemo account1 = new IndependentObjectsDemo(1000);
        IndependentObjectsDemo account2 = new IndependentObjectsDemo(1000);

        account2.balance = 5000;

        System.out.println("account1.balance = " + account1.balance);
        System.out.println("account2.balance = " + account2.balance);
    }
}
// OUTPUT:
// account1.balance = 1000
// account2.balance = 5000`]
        },
        {
            content: `<h3>Reference Equality (<code>==</code>) vs Value Equality (<code>equals()</code>)</h3>
<code>==</code> on objects checks whether two references point to the SAME object in memory, not whether
their contents look equal. Use <code>equals()</code> to compare the actual content.`,
            codeExamples: [`public class EqualityDemo {
    public static void main(String[] args) {
        String a = new String("hello");
        String b = new String("hello");

        System.out.println(a == b);        // same content, different objects
        System.out.println(a.equals(b));   // compares actual characters
    }
}
// OUTPUT:
// false
// true`]
        }
    ],

    expert: [
        {
            content: `<h3>References Are Pass-by-Value Too</h3>
Java is strictly <strong>pass-by-value</strong>, even for objects. What gets copied when you pass an object
to a method is the reference (the address) itself - not the object it points to. This is a subtle but
critical distinction: <br><br>
• You CAN mutate the object's fields through the copied reference (both point to the same object). <br>
• You CANNOT make the caller's reference point to a different object by reassigning the parameter inside
the method - that only rebinds the local copy of the reference.`,
            codeExamples: [`public class PassByValueDemo {
    int value;

    PassByValueDemo(int value) { this.value = value; }

    static void mutate(PassByValueDemo obj) {
        obj.value = 99; // mutates the shared object - visible to caller
    }

    static void reassign(PassByValueDemo obj) {
        obj = new PassByValueDemo(999); // rebinds local copy only - NOT visible to caller
    }

    public static void main(String[] args) {
        PassByValueDemo p = new PassByValueDemo(1);

        mutate(p);
        System.out.println("After mutate: " + p.value);

        reassign(p);
        System.out.println("After reassign: " + p.value);
    }
}
// OUTPUT:
// After mutate: 99
// After reassign: 99`]
        },
        {
            content: `<h3>Reference Layout: Diagram</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Stack (or local vars)          Heap
+----------------+             +----------------------+
| account1  ---------------->  | ReferenceCopyDemo obj |
+----------------+             |  balance = 5000       |
| account2  ---------------->  +----------------------+
+----------------+                       ^
                                          |
                    both references point to the SAME heap object</pre>
Only the arrows (addresses) live on the stack (for local variables); the object itself always lives on the
heap.`
        },
        {
            content: `<h3>Types of References the JVM Recognizes (GC-Relevant)</h3>
Beyond ordinary "strong" references, <code>java.lang.ref</code> exposes weaker reference types that change
how the Garbage Collector treats the referenced object: <br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Reference Type</th><th>GC Behavior</th><th>Typical Use</th></tr>
<tr class='text-center'><td>Strong (normal)</td><td>Never collected while reachable</td><td>Everyday variables/fields</td></tr>
<tr class='text-center'><td>Soft (SoftReference)</td><td>Collected only when memory is low</td><td>Memory-sensitive caches</td></tr>
<tr class='text-center'><td>Weak (WeakReference)</td><td>Collected at the next GC cycle if no strong refs remain</td><td>WeakHashMap, listener maps, avoiding leaks</td></tr>
<tr class='text-center'><td>Phantom (PhantomReference)</td><td>Object already finalized; used only for cleanup notification</td><td>Resource cleanup tracking</td></tr>
</table>`
        },
        {
            content: `<h3>Common Bugs and Misconceptions</h3>
• <strong>"Java is pass-by-reference."</strong> False - Java is always pass-by-value; what's passed for
objects is a copy of the reference value, not the object, and not a reference-to-the-reference. <br>
• <strong>Holding onto references longer than needed causes memory leaks.</strong> A static field or a
long-lived collection that keeps a strong reference to objects you're "done with" prevents the GC from
ever reclaiming them - a very common leak pattern in Java. <br>
• <strong>Confusing <code>==</code> with <code>.equals()</code></strong> on wrapper types and Strings is
one of the most common real-world bugs, especially since small cached Integers (-128 to 127) make
<code>==</code> "accidentally" work sometimes. <br>
• <strong>Assuming setting a reference to <code>null</code> immediately frees memory.</strong> It only
removes one path to the object; the object is reclaimed only when the GC runs AND no other reference
exists.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Is Java pass-by-value or pass-by-reference?</td><td>Always pass-by-value; for objects, the value passed is a copy of the reference (address), not the object itself</td></tr>
<tr><td>What happens when you assign one reference variable to another?</td><td>The address is copied - both variables now point to the same object, no new object is created</td></tr>
<tr><td>What does a <code>null</code> reference mean?</td><td>The variable currently points to no object; using it to call a method throws NullPointerException</td></tr>
<tr><td>What's the difference between <code>==</code> and <code>.equals()</code> for objects?</td><td><code>==</code> compares reference addresses (identity); <code>.equals()</code> compares logical content, as defined by the class</td></tr>
<tr><td>Can a method reassign the caller's object reference?</td><td>No - reassigning a parameter inside a method only changes the local copy of the reference, not the caller's variable</td></tr>
<tr><td>What is a WeakReference used for?</td><td>To reference an object without preventing the GC from collecting it, useful for caches and avoiding memory leaks</td></tr>
<tr><td>Does setting a reference to null immediately free the object's memory?</td><td>No - it only removes that one path to the object; actual reclamation happens later during GC if no other references exist</td></tr>
</table>`
        }
    ]
};
