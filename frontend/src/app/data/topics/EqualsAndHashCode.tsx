import { Topic } from '../coreJava';

export const equalsAndHashCode: Topic = {
    id: 'equals-hashcode',
    name: 'equals() and hashCode() Contract',

    beginner: [
        {
            content: `<h4>The Default Behavior (from Object)</h4>
Every Java class inherits <code>equals()</code> and <code>hashCode()</code> from <code>Object</code> if it does not override them:
<ul>
<li><code>Object.equals(other)</code> — compares by <b>reference</b> (<code>==</code>); true only if both variables point to the exact same object in memory.</li>
<li><code>Object.hashCode()</code> — returns an <b>identity hash</b>, usually based on the object's identity, so two different objects almost always get different hash codes.</li>
</ul>`,
            codeExamples: [
                `class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
}

public class DefaultEqualsDemo {
    public static void main(String[] args) {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(1, 2); // same x,y, but a DIFFERENT object

        System.out.println(p1 == p2);        // reference comparison
        System.out.println(p1.equals(p2));   // default equals() = same as ==
        System.out.println(p1.hashCode() == p2.hashCode()); // almost certainly false
    }
}
// OUTPUT:
// false
// false
// false`
            ]
        },
        {
            content: `<h4>Why Override equals() — Value-Based Comparison</h4>
Most of the time, you want two objects to be "equal" if they represent the <b>same value</b> — not the same memory address. Overriding <code>equals()</code> lets you define exactly what "equal" means for your class.`,
            codeExamples: [
                `import java.util.Objects;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Point)) return false;
        Point other = (Point) obj;
        return this.x == other.x && this.y == other.y;
    }
}

public class OverriddenEqualsDemo {
    public static void main(String[] args) {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(1, 2);

        System.out.println(p1 == p2);       // still false - different objects
        System.out.println(p1.equals(p2));  // true - same x,y, our own rule
    }
}
// OUTPUT:
// false
// true`
            ]
        },
        {
            content: `<h4>The Rule: If You Override equals(), You MUST Override hashCode() Too</h4>
Java's contract requires: <b>if two objects are equal according to equals(), they MUST return the same hashCode()</b>. Hash-based collections (<code>HashMap</code>, <code>HashSet</code>, <code>Hashtable</code>) rely on this rule to find objects — breaking it silently corrupts lookups.`,
            codeExamples: [
                `import java.util.Objects;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Point)) return false;
        Point other = (Point) obj;
        return this.x == other.x && this.y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y); // consistent with equals()
    }
}

public class ConsistentHashCodeDemo {
    public static void main(String[] args) {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(1, 2);

        System.out.println(p1.equals(p2));                 // true
        System.out.println(p1.hashCode() == p2.hashCode()); // true - required by the contract
    }
}
// OUTPUT:
// true
// true`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Classic Bug: Overriding equals() WITHOUT hashCode() Breaks HashMap/HashSet</h3>
A <code>HashMap</code>/<code>HashSet</code> first uses <code>hashCode()</code> to find the right "bucket," and only then uses <code>equals()</code> to check candidates within that bucket. If <code>equals()</code> says two objects are equal but they land in <b>different buckets</b> because <code>hashCode()</code> wasn't overridden consistently, a lookup for an "equal" key will search the wrong bucket entirely and silently fail to find it.<br>`,
            codeExamples: [
                `import java.util.HashSet;
import java.util.Set;

// BROKEN: equals() overridden, hashCode() left as the default (identity hash)
class BrokenPoint {
    int x, y;
    BrokenPoint(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof BrokenPoint)) return false;
        BrokenPoint other = (BrokenPoint) obj;
        return this.x == other.x && this.y == other.y;
    }
    // hashCode() NOT overridden - still uses identity hash from Object
}

public class BrokenHashDemo {
    public static void main(String[] args) {
        Set<BrokenPoint> set = new HashSet<>();
        set.add(new BrokenPoint(1, 2));

        boolean found = set.contains(new BrokenPoint(1, 2)); // "equal" by our rules...
        System.out.println("Found equal point in set: " + found);
        // false! Different identity hashCode() sends it to a different bucket,
        // so HashSet never even calls equals() to compare them.
    }
}
// OUTPUT:
// Found equal point in set: false`,
                `import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

// FIXED: hashCode() overridden consistently with equals()
class FixedPoint {
    int x, y;
    FixedPoint(int x, int y) { this.x = x; this.y = y; }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof FixedPoint)) return false;
        FixedPoint other = (FixedPoint) obj;
        return this.x == other.x && this.y == other.y;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}

public class FixedHashDemo {
    public static void main(String[] args) {
        Set<FixedPoint> set = new HashSet<>();
        set.add(new FixedPoint(1, 2));

        boolean found = set.contains(new FixedPoint(1, 2));
        System.out.println("Found equal point in set: " + found);
    }
}
// OUTPUT:
// Found equal point in set: true`
            ]
        },
        {
            content: `<h3>The Full Contract</h3>
<ul>
<li><b>Reflexive:</b> <code>x.equals(x)</code> must always be true.</li>
<li><b>Symmetric:</b> <code>x.equals(y)</code> must equal <code>y.equals(x)</code>.</li>
<li><b>Transitive:</b> if <code>x.equals(y)</code> and <code>y.equals(z)</code>, then <code>x.equals(z)</code> must also be true.</li>
<li><b>Consistent:</b> repeated calls to <code>x.equals(y)</code> must keep returning the same result, as long as neither object's compared fields change.</li>
<li><b>Non-null:</b> <code>x.equals(null)</code> must return false.</li>
<li><b>hashCode() agreement:</b> equal objects (per <code>equals()</code>) MUST return the same <code>hashCode()</code>. The reverse is <b>not</b> required: unequal objects CAN share a hashCode (a <b>hash collision</b>); hash-based collections then fall back to <code>equals()</code> within the same bucket.</li>
</ul>`
        },
        {
            content: `<h3>Objects.equals() and Objects.hash() — Null-Safe Helpers</h3>
Manually writing <code>equals()</code>/<code>hashCode()</code> with several fields is error-prone (null checks, combining hash values correctly). <code>java.util.Objects</code> provides null-safe helpers that do this correctly.<br>`,
            codeExamples: [
                `import java.util.Objects;

class Employee {
    String name;
    Integer id; // nullable on purpose, to show the null-safety

    Employee(String name, Integer id) {
        this.name = name;
        this.id = id;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Employee)) return false;
        Employee other = (Employee) obj;
        // Objects.equals handles nulls safely
        return Objects.equals(name, other.name) && Objects.equals(id, other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, id); // combines multiple fields into one hash
    }
}

public class ObjectsHelperDemo {
    public static void main(String[] args) {
        Employee e1 = new Employee("Pankaj", null);
        Employee e2 = new Employee("Pankaj", null);

        System.out.println(e1.equals(e2));  // true - null id handled safely
        System.out.println(e1.hashCode() == e2.hashCode()); // true
    }
}
// OUTPUT:
// true
// true`
            ]
        },
        {
            content: `<h3>Records Auto-Generate Both Correctly (Java 16+)</h3>
A <code>record</code> automatically generates <code>equals()</code>, <code>hashCode()</code>, and <code>toString()</code> based on all of its components, already correctly consistent with each other — no manual boilerplate needed for the common case.<br>`,
            codeExamples: [
                `record Point(int x, int y) {}

public class RecordEqualsDemo {
    public static void main(String[] args) {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(1, 2);

        System.out.println(p1.equals(p2));                  // true - auto-generated, value-based
        System.out.println(p1.hashCode() == p2.hashCode());  // true - consistent by construction
    }
}
// OUTPUT:
// true
// true`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does the default (Object) equals() do?</td><td>Reference comparison - equivalent to ==, true only if both variables point to the exact same object</td></tr>
<tr class='text-center'><td>Why must you override hashCode() whenever you override equals()?</td><td>Because equal objects (per equals()) MUST produce the same hashCode - otherwise HashMap/HashSet look in the wrong bucket and silently fail to find "equal" objects</td></tr>
<tr class='text-center'><td>Do unequal objects need different hashCodes?</td><td>No - a hash collision (unequal objects, same hashCode) is legal; hash-based collections then fall back to equals() to tell them apart within the same bucket</td></tr>
<tr class='text-center'><td>What are the 4 properties equals() must satisfy?</td><td>Reflexive, symmetric, transitive, and consistent</td></tr>
<tr class='text-center'><td>What does Objects.hash() do?</td><td>Combines multiple field hash codes into one int, null-safely, sparing you from writing that logic by hand</td></tr>
<tr class='text-center'><td>Do records need manual equals()/hashCode() overrides?</td><td>No - records auto-generate both based on all their components, already mutually consistent</td></tr>
</table>`
        }
    ]
};
