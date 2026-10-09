import { Topic } from '../coreJava';

export const initializerBlocks: Topic = {
    id: 'initializer-blocks',
    name: 'Instance and Static Initializer Blocks',

    beginner: [
        {
            content: `<h4>What are Initializer Blocks?</h4>
<p>Java has two kinds of code blocks inside a class body (not inside any method) that run <b>automatically</b>, without being called:</p>
<ul>
<li><b>Instance initializer block</b>: <code>{ ... }</code> - runs <b>every time</b> an object is created, right before the constructor body.</li>
<li><b>Static initializer block</b>: <code>static { ... }</code> - runs <b>exactly once</b>, when the class is first loaded by the JVM, before any object of it is created.</li>
</ul>
<p>Both exist to run initialization logic that is more complex than a simple one-line field assignment.</p>`
        },
        {
            content: `<h4>Instance Initializer Block</h4>
An instance block runs for <b>every</b> object created, in textual order with the field initializers, and before the rest of the constructor body.`,
            codeExamples: [
                `public class InstanceBlockDemo {
    int id;

    { // instance initializer block
        System.out.println("Instance block running");
        id = 100;
    }

    InstanceBlockDemo() {
        System.out.println("Constructor running, id=" + id);
    }

    public static void main(String[] args) {
        new InstanceBlockDemo();
        System.out.println("---");
        new InstanceBlockDemo();   // runs again for the second object
    }
}
// OUTPUT:
// Instance block running
// Constructor running, id=100
// ---
// Instance block running
// Constructor running, id=100`
            ]
        },
        {
            content: `<h4>Static Initializer Block</h4>
A static block runs <b>once</b>, when the class is loaded - no matter how many objects are created afterward.`,
            codeExamples: [
                `public class StaticBlockDemo {
    static int counter;

    static { // static initializer block - runs once
        System.out.println("Static block running");
        counter = 1000;
    }

    public static void main(String[] args) {
        System.out.println("Before any object, counter=" + counter);
        new StaticBlockDemo();
        new StaticBlockDemo();   // static block does NOT run again
        System.out.println("After 2 objects, counter=" + counter);
    }
}
// OUTPUT:
// Static block running
// Before any object, counter=1000
// After 2 objects, counter=1000`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Full Execution Order — Single Class, Multiple Constructors</h3>
For a single class, the order is: <b>static block (once, on class load)</b> -&gt; <b>instance field initializers + instance blocks (textual order, every object)</b> -&gt; <b>constructor body</b>. Proven below with two different constructors:`,
            codeExamples: [
                `public class ExecutionOrderDemo {
    static { System.out.println("1. Static block"); }

    int id = printAndReturn("2. Instance field initializer", 0);

    { System.out.println("3. Instance initializer block"); }

    static int printAndReturn(String msg, int value) {
        System.out.println(msg);
        return value;
    }

    ExecutionOrderDemo() {
        System.out.println("4. No-arg constructor body");
    }

    ExecutionOrderDemo(int x) {
        System.out.println("4. Int constructor body, x=" + x);
    }

    public static void main(String[] args) {
        System.out.println("--- creating first object ---");
        new ExecutionOrderDemo();
        System.out.println("--- creating second object ---");
        new ExecutionOrderDemo(99);
    }
}
// OUTPUT:
// 1. Static block
// --- creating first object ---
// 2. Instance field initializer
// 3. Instance initializer block
// 4. No-arg constructor body
// --- creating second object ---
// 2. Instance field initializer
// 3. Instance initializer block
// 4. Int constructor body, x=99`
            ]
        },
        {
            content: `<h3>Why Use an Instance Block? — Shared Logic Across Constructors</h3>
An instance initializer block is a way to share setup logic across <b>every</b> constructor <b>without</b> constructor chaining via <code>this(...)</code>. It always runs regardless of which overloaded constructor the caller picks - useful when several constructors need the same baseline setup but otherwise differ.`,
            codeExamples: [
                `import java.util.ArrayList;
import java.util.List;

public class Employee {
    List<String> roles;   // shared setup, wanted in every constructor

    {
        roles = new ArrayList<>();
        roles.add("Employee");   // every Employee gets this baseline role
        System.out.println("Baseline roles initialized");
    }

    Employee() {
        System.out.println("No-arg constructor");
    }

    Employee(String extraRole) {
        roles.add(extraRole);
        System.out.println("Constructor with extra role: " + extraRole);
    }

    public static void main(String[] args) {
        Employee e1 = new Employee();
        System.out.println(e1.roles);

        Employee e2 = new Employee("Manager");
        System.out.println(e2.roles);
    }
}
// OUTPUT:
// Baseline roles initialized
// No-arg constructor
// [Employee]
// Baseline roles initialized
// Constructor with extra role: Manager
// [Employee, Manager]`
            ]
        },
        {
            content: `<h3>Why Use a Static Block? — One-Time Setup</h3>
A static block is the natural place for setup that must happen exactly <b>once</b> per class - e.g. initializing a static resource, loading configuration, or populating a lookup table that is too complex for a single-expression field initializer.`,
            codeExamples: [
                `import java.util.HashMap;
import java.util.Map;

public class CountryCodeLookup {
    static final Map<String, String> CODES = new HashMap<>();

    static {
        CODES.put("IN", "India");
        CODES.put("US", "United States");
        CODES.put("UK", "United Kingdom");
        System.out.println("Table loaded once, size=" + CODES.size());
    }

    public static void main(String[] args) {
        System.out.println(CountryCodeLookup.CODES.get("IN"));
        System.out.println(CountryCodeLookup.CODES.get("US"));
    }
}
// OUTPUT:
// Table loaded once, size=3
// India
// United States`
            ]
        },
        {
            content: `<h3>Execution Order With Inheritance</h3>
When a subclass object is created, initialization always flows <b>top-down through the static phase first (for the whole hierarchy), then top-down through the instance phase</b> per object:
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">new Child()
  |
  1. Parent static block/fields   (once, on class load)
  2. Child static block/fields    (once, on class load)
  |
  3. Parent instance fields + instance block
  4. Parent constructor body
  5. Child instance fields + instance block
  6. Child constructor body</pre>
Note that <b>all</b> static initialization for the whole hierarchy completes before <b>any</b> instance initialization begins, because loading the Child class forces the JVM to first fully initialize the Parent class.`,
            codeExamples: [
                `class Parent {
    static { System.out.println("1. Parent static block"); }
    { System.out.println("3. Parent instance block"); }
    Parent() { System.out.println("4. Parent constructor"); }
}

public class Child extends Parent {
    static { System.out.println("2. Child static block"); }
    { System.out.println("5. Child instance block"); }
    Child() { System.out.println("6. Child constructor"); }

    public static void main(String[] args) {
        new Child();
    }
}
// OUTPUT:
// 1. Parent static block
// 2. Child static block
// 3. Parent instance block
// 4. Parent constructor
// 5. Child instance block
// 6. Child constructor`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many times does a static block run?</td><td>Exactly once, when the class is first loaded by the JVM - regardless of how many objects are created</td></tr>
<tr class='text-center'><td>How many times does an instance block run?</td><td>Once per object created - every time, right before the constructor body</td></tr>
<tr class='text-center'><td>What's the full order for a single class?</td><td>Static block (once, class load) -> instance field initializers + instance blocks (every object, textual order) -> constructor body</td></tr>
<tr class='text-center'><td>What's the order with inheritance?</td><td>Parent static -> Child static -> Parent instance (fields/blocks) -> Parent constructor -> Child instance (fields/blocks) -> Child constructor</td></tr>
<tr class='text-center'><td>Why use an instance block instead of just putting code in every constructor?</td><td>It guarantees the logic runs for every constructor automatically, without needing this() chaining or duplicating code across overloads</td></tr>
<tr class='text-center'><td>What's a typical real use of a static block?</td><td>One-time setup that's too complex for a single field initializer expression - e.g. populating a static lookup Map, loading configuration</td></tr>
</table>`
        }
    ]
};
