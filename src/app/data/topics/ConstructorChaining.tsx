import { Topic } from '../coreJava';

export const constructorChaining: Topic = {
    id: 'constructor-chaining',
    name: 'Constructor Chaining',

    beginner: [
        {
            content: `<h4>What is Constructor Chaining?</h4>
<p><b>Constructor Chaining</b> is the process of calling one constructor from another constructor.</p>
<ul>
<li>It happens <b>within the same class</b> using <code>this()</code>, or <b>between parent and child classes</b> using <code>super()</code>.</li>
<li>It exists so common initialization logic can live in <b>one place</b> instead of being copy-pasted into every constructor.</li>
</ul>
<p><b>Why use Constructor Chaining?</b></p>
<ul>
<li>Improves code reusability</li>
<li>Maintains a proper, predictable initialization sequence</li>
<li>Makes code clean and easy to maintain</li>
</ul>`
        },

        {
            content: `<h4>Chaining Within the Same Class — this()</h4>
A constructor can call another constructor of the <b>same class</b> using <code>this(...)</code>. This lets a simpler constructor delegate to a more complete one instead of repeating its logic.`,
            codeExamples: [
                `public class Chaining {

    Chaining() {
        this(5);
        System.out.println("Default constructor");
    }

    Chaining(int x) {
        this("Java");
        System.out.println(x);
    }

    Chaining(String str) {
        System.out.println(str);
    }

    public static void main(String[] args) {
        new Chaining();
    }
}
// OUTPUT:
// Java
// 5
// Default constructor`
            ]
        },

        {
            content: `<h4>Chaining to the Parent Class — super()</h4>
When chaining happens between a <b>parent and a child</b> class, we use <code>super(...)</code> to call the parent's constructor. The parent's constructor always finishes running <b>before</b> the child's constructor body executes.<br><br>
If you don't write <code>super()</code> yourself, Java <b>implicitly</b> inserts a call to the parent's no-argument constructor as the first line.`,
            codeExamples: [
                `class Base {
    Base() {
        System.out.println("Base constructor");
    }
}

public class Derived extends Base {
    Derived() {
        // super() is called implicitly here
        System.out.println("Derived constructor");
    }

    public static void main(String[] args) {
        new Derived();
    }
}
// OUTPUT:
// Base constructor
// Derived constructor`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>this() / super() Must Be the FIRST Statement</h3>
<p>Whichever one you use, <code>this()</code> or <code>super()</code> must be the very <b>first statement</b> in the constructor. The compiler enforces this so a well-defined, single initialization path is guaranteed before any other code runs — no field can be touched before the object's "base" state exists.</p>
<p>Putting any statement before it is a <b>compile-time error</b>:</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">public class Employee {
    int id;

    Employee(int id) {
        System.out.println("Creating employee...");
        this(0);   // ERROR: call to this must be first statement in constructor
    }

    Employee() {
        this(-1);
    }
}</pre>
The fix is simply to move the chaining call to the top of the constructor body.`,
            codeExamples: [
                `public class Employee {

    Employee() {
        this(0, "Unknown");
        System.out.println("No-arg constructor finished");
    }

    Employee(int id) {
        this(id, "Unknown");
        System.out.println("Single-arg constructor finished");
    }

    Employee(int id, String name) {
        System.out.println("Two-arg constructor: id=" + id + ", name=" + name);
    }

    public static void main(String[] args) {
        new Employee();
    }
}
// OUTPUT:
// Two-arg constructor: id=0, name=Unknown
// No-arg constructor finished`
            ]
        },

        {
            content: `<h3>What Happens When NEITHER this() Nor super() Is Written</h3>
<p>If a constructor doesn't start with <code>this()</code> or <code>super()</code>, the compiler silently inserts <code>super()</code> as the first statement — calling the parent's <b>no-argument</b> constructor.</p>
<p>But if the parent class has <b>no no-arg constructor</b> (only a parameterized one), the compiler can no longer insert a silent <code>super()</code> — you MUST call <code>super(args)</code> explicitly, or you get a compile-time error:</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">class Vehicle {
    Vehicle(String type) { ... }   // no no-arg constructor
}

class Car extends Vehicle {
    Car() { }   // ERROR: implicit super() needs Vehicle(), which doesn't exist
}</pre>
Fix — call the parameterized parent constructor explicitly:`,
            codeExamples: [
                `class Vehicle {
    String type;
    Vehicle(String type) {
        this.type = type;
        System.out.println("Vehicle constructed: " + type);
    }
}

public class Car extends Vehicle {
    Car() {
        super("Car");   // required: Vehicle has no no-arg constructor
        System.out.println("Car constructed");
    }

    public static void main(String[] args) {
        new Car();
    }
}
// OUTPUT:
// Vehicle constructed: Car
// Car constructed`
            ]
        },

        {
            content: `<h3>Multi-Level Constructor Chaining (3 Classes Deep)</h3>
When a chain of subclasses is instantiated, constructor execution always runs <b>top-down</b> — grandparent first, then parent, then child — even though you call <code>new</code> on the child:<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">new Child()
     |
     v
Child()  --super()--&gt; Parent()  --super()--&gt; GrandParent()
                                                    |
                                          runs FIRST, prints first
                                                    |
                                         Parent() body runs next
                                                    |
                                          Child() body runs last</pre>`,
            codeExamples: [
                `class GrandParent {
    GrandParent() { System.out.println("GrandParent constructor"); }
}

class Parent extends GrandParent {
    Parent() { System.out.println("Parent constructor"); }
}

public class Child extends Parent {
    Child() { System.out.println("Child constructor"); }

    public static void main(String[] args) {
        new Child();
    }
}
// OUTPUT:
// GrandParent constructor
// Parent constructor
// Child constructor`
            ]
        },

        {
            content: `<h3>The Trap: Trying to Use Both this() and super() Together</h3>
Only ONE statement can occupy the "first line" of a constructor, and both <code>this()</code> and <code>super()</code> compete for that position. Allowing both would mean the object's fields could be initialized twice — once through the chained sibling constructor, and again through the parent constructor — breaking Java's guarantee that every object is initialized exactly once, in a well-defined order.<br><br>

So the compiler flatly rejects this:<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">class Base {
    Base() { System.out.println("Base"); }
}

class Sub extends Base {
    Sub() {
        this(10);
    }
    Sub(int x) {
        this();       // ERROR: recursive constructor invocation
        super();      // ERROR: call to super must be first statement
        System.out.println(x);
    }
}</pre>
Exactly one constructor in the chain must be the "base case" that skips <code>this()</code> — that constructor is the one that eventually calls (or implicitly gets) <code>super()</code>.`
        },

        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is constructor chaining?</td><td>Calling one constructor from another — within the same class via this(), or from a subclass to its parent via super()</td></tr>
<tr class='text-center'><td>Can this() and super() both be used in the same constructor?</td><td>No — only one "first statement" is allowed per constructor, so they are mutually exclusive</td></tr>
<tr class='text-center'><td>What happens if you write neither this() nor super()?</td><td>The compiler implicitly inserts super() (parent's no-arg constructor) as the first statement</td></tr>
<tr class='text-center'><td>What if the parent has no no-arg constructor?</td><td>The implicit super() insertion fails, causing a compile error — you must call super(args) explicitly</td></tr>
<tr class='text-center'><td>What happens if this() forms a cycle back to itself?</td><td>Compile-time error: "recursive constructor invocation" — there is no base case to stop it</td></tr>
<tr class='text-center'><td>In a 3-level inheritance chain, which constructor runs first?</td><td>The topmost (grandparent) constructor always finishes first; execution is top-down even though new is called on the child</td></tr>
<tr class='text-center'><td>Why must this()/super() be the first statement?</td><td>So the compiler can guarantee a single, well-defined initialization path before any other code touches the object</td></tr>
</table>`
        }
    ]
};
