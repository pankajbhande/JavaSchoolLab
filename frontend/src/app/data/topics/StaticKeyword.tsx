import { Topic } from '../coreJava';

export const staticKeyword: Topic = {
    id: 'static-keyword',
    name: 'Static Keyword',

    beginner: [
        {
            content: `<h4>What is the Static Keyword?</h4>
<ul>
<li>The <b>static</b> keyword is used to create class-level members.</li>
<li>Static members belong to the <b>class</b>, not to individual objects.</li>
<li>Only one copy of a static member is ever created in memory - all objects share it.</li>
</ul>
<p><b>Where can static be used?</b></p>
<ul>
<li>Variable, method, block, and nested (inner) class.</li>
<li>Local variables and constructors can never be static.</li>
</ul>
<p><b>Why use static?</b></p>
<ul>
<li>Saves memory - no need to duplicate the same data per object.</li>
<li>Shares common data/behavior among all objects of a class.</li>
</ul>`,
            codeExamples: [
                `class HelloStatic {
    static int number = 100;

    public static void main(String[] args) {
        System.out.println(number);
    }
}
// OUTPUT:
// 100`
            ]
        },
        {
            content: `<h4>Static Variable - Shared Across All Objects</h4>
<p>A variable declared with <b>static</b> is also called a <b>class variable</b>. It is stored once (per class), and every object reads/writes that same copy - so if one object changes it, every other object sees the change.</p>
<p>Below, a <code>Counter</code> object increments the shared <code>count</code> field in its constructor every time a new object is created:</p>`,
            codeExamples: [
                `class Counter {
    static int count = 0;   // ONE copy shared by every Counter object

    Counter() {
        count++;              // increments the shared copy
    }
}

public class StaticVariableDemo {
    public static void main(String[] args) {
        new Counter();
        new Counter();
        new Counter();

        System.out.println("Total objects created: " + Counter.count);
    }
}
// OUTPUT:
// Total objects created: 3`
            ]
        },
        {
            content: `<h4>Static Method - Called Without Creating an Object</h4>
A method declared with <b>static</b> belongs to the class rather than to any object, so it can be called directly using the class name - no <code>new</code> keyword required.`,
            codeExamples: [
                `class Greeting {
    static void sayHello() {
        System.out.println("Hello from a static method!");
    }
}

public class StaticMethodDemo {
    public static void main(String[] args) {
        Greeting.sayHello();   // called on the class - no object needed
    }
}
// OUTPUT:
// Hello from a static method!`
            ]
        },
        {
            content: `<h4>Static Block - Runs Once When the Class Loads</h4>
<p>A <b>static block</b> is a group of statements that run exactly once, automatically, just before the class is <b>first actively used</b> (first object creation, static method call, or non-constant static field read).</p>
<p>Class initialization is lazy. So for any class other than the one declaring <code>main()</code>, the static block runs after <code>main()</code> has already started. It is commonly used to set up static resources.</p>`,
            codeExamples: [
                `class Config {
    static String appName;

    static {
        System.out.println("Static block: loading configuration...");
        appName = "JavaSchoolLab";
    }
}

public class StaticBlockDemo {
    public static void main(String[] args) {
        System.out.println("main() started");
        System.out.println("App name: " + Config.appName);
    }
}
// OUTPUT:
// main() started
// Static block: loading configuration...
// App name: JavaSchoolLab
// (Config is a separate class, so its static block runs at the first field read.)`
            ]
        },
        {
            content: `<h4>Why is main() Itself Static?</h4>
<p>The JVM calls <code>main()</code> to start a program <b>before any object of that class exists</b>. An instance method can only be called on an object, and there is no object yet at startup. So <code>main()</code> must be <b>static</b>, and the JVM calls it directly on the class.</p>`,
            codeExamples: [
                `public class MainDemo {
    public static void main(String[] args) {
        System.out.println("JVM called main() directly - no object needed");
    }
}
// OUTPUT:
// JVM called main() directly - no object needed`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Where Static Members Live in Memory</h3>
<p>A <code>static</code> variable belongs to the class, not any single object - every instance reads and writes the <strong>same</strong> memory location. Class metadata (method code, field layout) lives in <strong>Metaspace</strong> (native memory, which replaced PermGen in JDK 8). The static field values are kept once per class on the <strong>Heap</strong>, in the class's <code>Class</code> object. Each object's own (non-static) fields are stored separately on the Heap.</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">JVM Memory Layout
+--------------------------------------------+
| Metaspace                                   |
|   Employee class metadata (methods, layout) |
+--------------------------------------------+
| Heap                                        |
|   Employee.class -> static employeeCount=3  |  ONE shared copy
|   e1 -> Employee { id: 1 }                  |
|   e2 -> Employee { id: 2 }                  |
|   e3 -> Employee { id: 3 }                  |  each object's own "id"
+--------------------------------------------+</pre>`,
            codeExamples: [
                `class Employee {
    static int employeeCount = 0;   // shared by all instances
    int id;                         // one per object

    Employee() {
        employeeCount++;            // increments the ONE shared copy
        id = employeeCount;
    }
}

public class StaticCounterDemo {
    public static void main(String[] args) {
        Employee e1 = new Employee();
        Employee e2 = new Employee();
        Employee e3 = new Employee();

        System.out.println("e1 id: " + e1.id);
        System.out.println("e2 id: " + e2.id);
        System.out.println("e3 id: " + e3.id);
        System.out.println("Total employees: " + Employee.employeeCount);
    }
}
// OUTPUT:
// e1 id: 1
// e2 id: 2
// e3 id: 3
// Total employees: 3`
            ]
        },
        {
            content: `<h3>Static Initialization Order: Class Loading vs Object Creation</h3>
<p>Static blocks and static variables initialize <strong>once</strong>, in top-to-bottom order, when the class is first actively used - before that class's first object is constructed. Instance initializer blocks and constructors, by contrast, run <strong>every time</strong> a new object is created.</p>
<p>Multiple static blocks in the same class all run once, in the order they are written:</p>`,
            codeExamples: [
                `class InitOrderDemo {
    static {
        System.out.println("1. Static block (runs once, at class load)");
    }

    {
        System.out.println("2. Instance block (runs on every object creation)");
    }

    InitOrderDemo() {
        System.out.println("3. Constructor (runs on every object creation)");
    }
}

public class InitOrderTest {
    public static void main(String[] args) {
        System.out.println("main() started");
        new InitOrderDemo();
        System.out.println("---");
        new InitOrderDemo();
    }
}
// OUTPUT:
// main() started
// 1. Static block (runs once, at class load)
// 2. Instance block (runs on every object creation)
// 3. Constructor (runs on every object creation)
// ---
// 2. Instance block (runs on every object creation)
// 3. Constructor (runs on every object creation)`,
                `import java.util.HashMap;
import java.util.Map;

class CountryCodes {
    static Map<String, String> codeMap = new HashMap<>();

    static {
        System.out.println("Static block 1: initializing map");
        codeMap.put("IN", "India");
    }

    static {
        System.out.println("Static block 2: adding more entries");
        codeMap.put("US", "United States");
    }

    static void printMap() {
        System.out.println(codeMap);
    }
}

public class StaticBlockOrderDemo {
    public static void main(String[] args) {
        System.out.println("main() started");
        CountryCodes.printMap();
    }
}
// OUTPUT:
// main() started
// Static block 1: initializing map
// Static block 2: adding more entries
// {IN=India, US=United States}`
            ]
        },
        {
            content: `<h3>Static Methods Are Hidden, Not Overridden</h3>
<p>True overriding is resolved using the object's <strong>runtime type</strong> (dynamic binding) - that is what makes polymorphism work for instance methods.</p>
<p>Static methods belong to the class, not to any object. So they are resolved using the <strong>reference's declared (compile-time) type</strong> instead. This is called <strong>method hiding</strong>, and it is NOT polymorphic.</p>`,
            codeExamples: [
                `class Parent {
    static void greet() {
        System.out.println("Static greet in Parent");
    }
}

class Child extends Parent {
    static void greet() {
        System.out.println("Static greet in Child");
    }
}

public class StaticHidingDemo {
    public static void main(String[] args) {
        Parent p = new Child();   // reference type Parent, object type Child

        p.greet();                // resolved by REFERENCE type (Parent), not object type
        Child.greet();
        Parent.greet();
    }
}
// OUTPUT:
// Static greet in Parent
// Static greet in Child
// Static greet in Parent`
            ]
        },
        {
            content: `<h3>Static Methods Cannot Touch Instance State Directly</h3>
<p>A <code>static</code> method has no implicit <code>this</code>, so it cannot directly reference instance (non-static) fields or methods, and cannot use <code>this</code>/<code>super</code>. It can only call other static members directly, or reach instance members through an explicit object reference.</p>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">class Demo {
    int instanceField = 10;

    static void staticMethod() {
        // System.out.println(instanceField);
        // COMPILE ERROR: non-static field 'instanceField'
        // cannot be referenced from a static context
    }
}</pre>
<p>The fix is either to make the field static too, or to access it via an object: <code>new Demo().instanceField</code>.</p>`,
            codeExamples: [
                `class Demo {
    int instanceField = 10;
    static int staticField = 20;

    static void staticMethod() {
        System.out.println(staticField);              // OK: static to static
        System.out.println(new Demo().instanceField); // OK: via an object
    }
}

public class StaticMethodAccessDemo {
    public static void main(String[] args) {
        Demo.staticMethod();
    }
}
// OUTPUT:
// 20
// 10`
            ]
        },
        {
            content: `<h3>Static Nested Class vs Non-Static Inner Class</h3>
<p>A <strong>static nested class</strong> behaves like a top-level class placed inside another for grouping. It does NOT need an instance of the outer class, and cannot access the outer class's instance members directly.</p>
<p>A <strong>non-static inner class</strong> is tied to an enclosing instance. It must be created through an outer object, and it CAN access the outer instance's fields and methods directly.</p>`,
            codeExamples: [
                `class Outer {
    int outerField = 100;

    static class StaticNested {
        void show() {
            System.out.println("Static nested class - no outer instance needed");
        }
    }

    class Inner {
        void show() {
            System.out.println("Inner class - can access outerField: " + outerField);
        }
    }
}

public class NestedVsInnerDemo {
    public static void main(String[] args) {
        // Static nested class: no outer instance required
        Outer.StaticNested nested = new Outer.StaticNested();
        nested.show();

        // Non-static inner class: requires an outer instance
        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner();
        inner.show();
    }
}
// OUTPUT:
// Static nested class - no outer instance needed
// Inner class - can access outerField: 100`
            ]
        },
        {
            content: `<h3>Common Interview Traps</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Trap</th><th>Explanation</th></tr>
<tr class='text-center'><td>Static methods "override"</td><td>Not real overriding - it's <strong>method hiding</strong>. The subclass's static method shadows the parent's; resolution is by reference type, not the runtime object, unlike true polymorphism</td></tr>
<tr class='text-center'><td>static import misuse</td><td>Overusing <code>import static</code> makes code ambiguous about which class a method belongs to - readability suffers even though it compiles fine</td></tr>
<tr class='text-center'><td>Memory leaks via static fields</td><td>A static field lives for the entire class lifetime (effectively the app's lifetime). A static List/Map that keeps growing and is never cleared holds references forever, preventing garbage collection</td></tr>
<tr class='text-center'><td>Static + inheritance</td><td>Static members ARE inherited (accessible via subclass name) but are not polymorphic - calling a static method through a subclass reference still resolves at compile time based on the reference's declared type</td></tr>
</table>
<p><strong>Rule of thumb:</strong> use <code>static</code> for class-wide constants, helper methods that do not need object state, factory methods, and one-time initialization - never for anything that should vary per object.</p>`
        },
        {
            content: `<h3>Historical Trivia: Running a Class Without main()</h3>
<p>Before <strong>JDK 1.7</strong>, a class with no <code>main()</code> could still run. The logic went in a static block that ended with <code>System.exit(0)</code>. The static block ran during class loading, before the JVM looked for <code>main()</code>.</p>
<p>Since <strong>JDK 1.7</strong>, this trick no longer works. The JVM checks for <code>public static void main(String[] args)</code> upfront and refuses to run the class if it is missing.</p>`,
            codeExamples: [
                `class NoMainDemo {
    static {
        System.out.println("static block is invoked");
        System.exit(0);
    }
}
// Pre-JDK 1.7 OUTPUT:
// static block is invoked
//
// JDK 1.7+ OUTPUT:
// Error: Main method not found in class NoMainDemo, please define the main method as:
//    public static void main(String[] args)
// or a JavaFX application class must extend javafx.application.Application`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the purpose of the static keyword?</td><td>It marks a member (variable, method, or nested class) as belonging to the class itself rather than to instances - so it is shared among all instances of the class.</td></tr>
<tr><td>What is a static variable?</td><td>A class-level variable shared among all instances. It is initialized once, at class load time, and retains its value across all objects.</td></tr>
<tr><td>What is a static method?</td><td>A method that belongs to the class rather than any specific instance. It can be called without creating an object, and can only directly access other static members.</td></tr>
<tr><td>What is a static block?</td><td>A static initializer used to set up static variables. It runs once when the class is loaded into memory, before any object is created or static method is called.</td></tr>
<tr><td>Static block vs constructor - what's the difference?</td><td>A static block initializes static variables and runs once at class load. A constructor initializes instance variables and runs every time an object is created.</td></tr>
<tr><td>Can a class be static?</td><td>A top-level class cannot be static, but a <strong>nested</strong> class can - this is called a static nested class, and it does not need an instance of the outer class.</td></tr>
<tr><td>Why use the static keyword?</td><td>For memory management, utility/helper methods that need no object state, defining constants, and implementing patterns like Singleton.</td></tr>
<tr><td>Can static methods be overridden?</td><td>No - they belong to the class, not instances, so they cannot be overridden. A subclass can define a same-signature static method, but that only <strong>hides</strong> the parent's version.</td></tr>
<tr><td>Static method vs instance method?</td><td>A static method belongs to the class and needs no object to be called; it can only access static members. An instance method belongs to an object, needs an instance, and can access both static and instance members.</td></tr>
<tr><td>Can a static method access instance variables/methods?</td><td>Not directly - it has no <code>this</code> reference. It can only reach instance members through an explicit object reference.</td></tr>
</table>`
        }
    ]
};
