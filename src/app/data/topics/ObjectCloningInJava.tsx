import { Topic } from '../coreJava';

export const objectCloningInJava: Topic = {
    id: 'object-cloning',
    name: 'Object Cloning',

    beginner: [
        {
            content: `<h4>What is Object Cloning?</h4>
<p><b>Object cloning</b> means creating an exact copy of an existing object - a new object with the same field values, sitting at a different memory address from the original.</p>
<ul>
<li>Java provides a built-in way to do this via <code>Object.clone()</code>.</li>
<li>A plain assignment like <code>Employee e2 = e1;</code> does <b>not</b> clone anything - it just copies the <b>reference</b>, so <code>e1</code> and <code>e2</code> point to the same object.</li>
<li>Cloning creates a genuinely separate object in memory.</li>
</ul>`
        },
        {
            content: `<h4>The Cloneable Interface</h4>
<p><code>Cloneable</code> is a <b>marker interface</b> - it declares no methods at all. Its only job is to act as a flag telling the JVM "this class is allowed to be cloned".</p>
<ul>
<li><code>Object.clone()</code> is a <code>protected native</code> method defined on every class (since every class extends <code>Object</code>).</li>
<li>If you call <code>clone()</code> on a class that does <b>not</b> implement <code>Cloneable</code>, the JVM throws <code>CloneNotSupportedException</code> at runtime.</li>
<li>To make a class cloneable: implement <code>Cloneable</code>, and override <code>clone()</code> as <code>public</code> (widening its visibility from <code>protected</code>).</li>
</ul>`,
            codeExamples: [
                `class Point implements Cloneable {
    int x, y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public Point clone() throws CloneNotSupportedException {
        return (Point) super.clone();
    }
}

public class CloneDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Point p1 = new Point(10, 20);
        Point p2 = p1.clone();

        System.out.println("p1 == p2: " + (p1 == p2));
        System.out.println("p2.x=" + p2.x + ", p2.y=" + p2.y);
    }
}
// OUTPUT:
// p1 == p2: false
// p2.x=10, p2.y=20`
            ]
        },
        {
            content: `<h4>Without Cloneable — CloneNotSupportedException</h4>
<p>Forgetting <code>implements Cloneable</code> compiles fine, but calling <code>super.clone()</code> throws at runtime:</p>`,
            codeExamples: [
                `class NotCloneable {   // does NOT implement Cloneable
    int value = 5;

    public NotCloneable makeCopy() throws CloneNotSupportedException {
        return (NotCloneable) super.clone();   // Object.clone() checks Cloneable internally
    }
}

public class NoCloneableDemo {
    public static void main(String[] args) {
        NotCloneable obj = new NotCloneable();
        try {
            obj.makeCopy();
        } catch (CloneNotSupportedException e) {
            System.out.println("Caught: " + e.getClass().getSimpleName());
        }
    }
}
// OUTPUT:
// Caught: CloneNotSupportedException`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Shallow Copy — clone()'s Default Behavior</h3>
<p><code>Object.clone()</code> performs a <b>shallow copy</b>:</p>
<ul>
<li>Primitive fields (int, boolean, etc.) are copied <b>by value</b> - the clone gets its own independent copy.</li>
<li>Reference-type fields (objects, arrays) are copied <b>by reference</b> - the clone's field points to the <b>same</b> underlying object as the original. Nothing is duplicated beneath the surface.</li>
</ul>
<p>This is fine when every field is a primitive or an immutable type, but it is a trap the moment a field is a mutable object.</p>`,
            codeExamples: [
                `class Address {
    String city;
    Address(String city) { this.city = city; }
}

class Employee implements Cloneable {
    String name;
    Address address;   // mutable reference field

    Employee(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    @Override
    public Employee clone() throws CloneNotSupportedException {
        return (Employee) super.clone();   // shallow copy
    }
}

public class ShallowCopyBugDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Employee original = new Employee("Pankaj", new Address("Pune"));
        Employee copy = original.clone();

        System.out.println("Same address object? " + (original.address == copy.address));

        copy.address.city = "Mumbai";   // mutating through the clone...
        System.out.println("original.address.city = " + original.address.city); // ...corrupts the original!
    }
}
// OUTPUT:
// Same address object? true
// original.address.city = Mumbai`
            ]
        },
        {
            content: `<h3>Deep Copy — Fixing the Shallow-Copy Bug</h3>
<p>A <b>deep copy</b> clones every mutable object reachable from the object, not just the top-level fields. The fix: explicitly clone (or reconstruct) the nested mutable field inside <code>clone()</code>.</p>`,
            codeExamples: [
                `class Address implements Cloneable {
    String city;
    Address(String city) { this.city = city; }

    @Override
    public Address clone() throws CloneNotSupportedException {
        return (Address) super.clone();
    }
}

class Employee implements Cloneable {
    String name;
    Address address;

    Employee(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    @Override
    public Employee clone() throws CloneNotSupportedException {
        Employee copy = (Employee) super.clone();
        copy.address = this.address.clone();   // deep copy the mutable field
        return copy;
    }
}

public class DeepCopyFixDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Employee original = new Employee("Pankaj", new Address("Pune"));
        Employee copy = original.clone();

        System.out.println("Same address object? " + (original.address == copy.address));

        copy.address.city = "Mumbai";
        System.out.println("original.address.city = " + original.address.city); // original is now safe
    }
}
// OUTPUT:
// Same address object? false
// original.address.city = Pune`
            ]
        },
        {
            content: `<h3>Why Many Teams Avoid clone() Entirely</h3>
<p>Joshua Bloch's <i>Effective Java</i> recommends <b>avoiding <code>Object.clone()</code></b> in new code, because the mechanism is fragile:</p>
<ul>
<li>It bypasses the normal constructor entirely (a clone is created without calling <b>any</b> constructor of the class).</li>
<li>Every mutable field must be deep-copied by hand, and it is easy to forget one - the bug above compiles perfectly fine.</li>
<li>The checked <code>CloneNotSupportedException</code> is awkward for a mechanism that should always work once <code>Cloneable</code> is implemented.</li>
<li><code>Cloneable</code> does not declare <code>clone()</code>, so the type alone cannot tell you a class is properly cloneable.</li>
</ul>
<p>The recommended alternatives:</p>
<ul>
<li><b>Copy constructor</b>: <code>Employee(Employee other) { this.name = other.name; this.address = new Address(other.address); }</code></li>
<li><b>Static factory method</b>: <code>static Employee copyOf(Employee other) { ... }</code></li>
</ul>
<p>Both are simpler, do not throw a checked exception, and give you full control over what gets deep-copied.</p>`,
            codeExamples: [
                `class Address {
    String city;
    Address(String city) { this.city = city; }
    Address(Address other) { this.city = other.city; }   // copy constructor
}

class Employee {
    String name;
    Address address;

    Employee(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // Copy constructor - no clone(), no Cloneable, no checked exception
    Employee(Employee other) {
        this.name = other.name;
        this.address = new Address(other.address);
    }
}

public class CopyConstructorDemo {
    public static void main(String[] args) {
        Employee original = new Employee("Pankaj", new Address("Pune"));
        Employee copy = new Employee(original);

        copy.address.city = "Mumbai";
        System.out.println("original.address.city = " + original.address.city);
    }
}
// OUTPUT:
// original.address.city = Pune`
            ]
        },
        {
            content: `<h3>clone() vs Copy Constructor</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Object.clone()</th><th>Copy Constructor / Static Factory</th></tr>
<tr class='text-center'><td>Requires Cloneable</td><td>Yes</td><td>No</td></tr>
<tr class='text-center'><td>Calls a constructor</td><td>No - object is created without one</td><td>Yes - normal object creation</td></tr>
<tr class='text-center'><td>Checked exception</td><td>CloneNotSupportedException</td><td>None needed</td></tr>
<tr class='text-center'><td>Deep copy control</td><td>Must override clone() correctly for every mutable field</td><td>Explicit, readable, easy to review</td></tr>
<tr class='text-center'><td>Can copy to a different type</td><td>No</td><td>Yes (a static factory can return a different concrete type)</td></tr>
<tr class='text-center'><td>Effective Java recommendation</td><td>Avoid</td><td>Preferred</td></tr>
</table>
<br>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does Cloneable do?</td><td>Nothing by itself - it's a marker interface with no methods, it just flags a class as "allowed to be cloned" for Object.clone()'s internal check</td></tr>
<tr class='text-center'><td>What happens if you call clone() without implementing Cloneable?</td><td>Object.clone() throws CloneNotSupportedException at runtime</td></tr>
<tr class='text-center'><td>Is Object.clone() a shallow or deep copy?</td><td>Shallow - primitives are copied by value, but reference fields still point to the same shared objects as the original</td></tr>
<tr class='text-center'><td>How do you get a deep copy?</td><td>Manually clone (or reconstruct) every mutable reference field inside your overridden clone() method</td></tr>
<tr class='text-center'><td>Does clone() call the class's constructor?</td><td>No - the JVM copies the object's memory directly, bypassing every constructor</td></tr>
<tr class='text-center'><td>Why do many style guides recommend against clone()?</td><td>It's error-prone (easy to miss a deep-copy field), bypasses constructors, and forces a checked exception - a copy constructor or static factory method is simpler and safer</td></tr>
</table>`
        }
    ]
};
