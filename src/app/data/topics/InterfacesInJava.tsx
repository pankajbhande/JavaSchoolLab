import { Topic } from '../coreJava';

export const interfacesInJava: Topic = {
    id: 'interfaces-in-java',
    name: 'Interfaces in Java',

    beginner: [
        {
            content: `<h4>What is an Interface?</h4>
An <b>interface</b> is a contract — it declares <b>what</b> a class must be able to do, without saying <b>how</b>. Any class that <code>implements</code> an interface promises to provide real implementations for its abstract methods.
<ul>
<li>Before Java 8, an interface could only have abstract methods (and constants) — 100% abstraction.</li>
<li>Since Java 8, interfaces can also have <b>default</b> and <b>static</b> methods with real bodies.</li>
<li>A class uses <code>implements</code> to fulfil an interface's contract; an interface uses <code>extends</code> to inherit from another interface.</li>
</ul>`
        },
        {
            content: `<h4>Basic Interface and Implementation</h4>
Every abstract method declared in an interface must be overridden by the implementing class (unless the class itself is abstract).`,
            codeExamples: [
                `interface Vehicle {
    void start(); // implicitly public abstract
}

class Car implements Vehicle {
    @Override
    public void start() {
        System.out.println("Car started with a key turn");
    }
}

public class InterfaceDemo {
    public static void main(String[] args) {
        Vehicle v = new Car(); // reference type is the interface
        v.start();
    }
}
// OUTPUT:
// Car started with a key turn`
            ]
        },
        {
            content: `<h4>Constants in Interfaces</h4>
Any field declared in an interface is implicitly <code>public static final</code> — a constant. It cannot be reassigned, and it belongs to the interface itself, not to any implementing instance.`,
            codeExamples: [
                `interface Config {
    int MAX_USERS = 100; // implicitly public static final
}

class Server implements Config {
    void printLimit() {
        System.out.println("Max users allowed: " + MAX_USERS);
    }
}

public class ConstantsDemo {
    public static void main(String[] args) {
        new Server().printLimit();
        System.out.println("Accessed directly: " + Config.MAX_USERS);
    }
}
// OUTPUT:
// Max users allowed: 100
// Accessed directly: 100`
            ]
        },
        {
            content: `<h4>Default Methods (Java 8+)</h4>
A <code>default</code> method provides a <b>real implementation</b> directly inside the interface. It exists so an interface can gain new methods over time <b>without breaking every class that already implements it</b> — old implementers simply inherit the default behavior instead of failing to compile.`,
            codeExamples: [
                `interface Vehicle {
    void start();

    default void honk() { // has a real body
        System.out.println("Beep beep!");
    }
}

class Bike implements Vehicle {
    @Override
    public void start() {
        System.out.println("Bike started with a kick");
    }
    // honk() is NOT overridden — inherited from the interface
}

public class DefaultMethodDemo {
    public static void main(String[] args) {
        Bike bike = new Bike();
        bike.start();
        bike.honk(); // uses the interface's default implementation
    }
}
// OUTPUT:
// Bike started with a kick
// Beep beep!`
            ]
        },
        {
            content: `<h4>Static Methods on Interfaces (Java 8+)</h4>
An interface can also declare <code>static</code> utility methods. They belong to the interface itself (called as <code>InterfaceName.method()</code>) and are <b>not</b> inherited by implementing classes.`,
            codeExamples: [
                `interface MathOps {
    static int square(int x) { // belongs to the interface, not instances
        return x * x;
    }
}

public class StaticMethodDemo {
    public static void main(String[] args) {
        int result = MathOps.square(6); // called on the interface directly
        System.out.println(result);
    }
}
// OUTPUT:
// 36`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Multiple Interface Inheritance &amp; the Diamond Problem</h3>
A class can <code>implement</code> multiple interfaces — Java's answer to "multiple inheritance of type" without the classic diamond problem of multiple inheritance of state. But if two interfaces provide <b>the same default method signature</b>, the implementing class faces an ambiguity the compiler refuses to guess at:<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">interface A { default void hello() { System.out.println("A"); } }
interface B { default void hello() { System.out.println("B"); } }

class C implements A, B { }
// COMPILE ERROR: class C inherits unrelated defaults for hello() from A and B</pre>
The fix: <code>C</code> must explicitly override <code>hello()</code> and decide what to do — including optionally delegating to one parent via <code>InterfaceName.super.method()</code>.<br>`,
            codeExamples: [
                `interface A {
    default void hello() { System.out.println("Hello from A"); }
}
interface B {
    default void hello() { System.out.println("Hello from B"); }
}

class C implements A, B {
    @Override
    public void hello() {
        A.super.hello(); // explicitly pick A's version
        B.super.hello(); // explicitly pick B's version too, if desired
        System.out.println("Hello from C's own override");
    }
}

public class DiamondDemo {
    public static void main(String[] args) {
        new C().hello();
    }
}
// OUTPUT:
// Hello from A
// Hello from B
// Hello from C's own override`
            ]
        },
        {
            content: `<h3>Functional Interfaces — the Bridge to Lambdas</h3>
A <b>functional interface</b> is an interface with exactly <b>one abstract method</b> (it may still have any number of default/static methods). The <code>@FunctionalInterface</code> annotation isn't required, but it makes the compiler enforce the "single abstract method" rule and documents intent. Functional interfaces are what make lambda expressions and method references possible — a lambda is simply an inline implementation of that one abstract method.<br>`,
            codeExamples: [
                `@FunctionalInterface
interface Calculator {
    int operate(int a, int b); // the ONE abstract method

    default void describe() { // allowed - doesn't count against the "one abstract method" rule
        System.out.println("A calculator that combines two ints");
    }
}

public class FunctionalInterfaceDemo {
    public static void main(String[] args) {
        Calculator add = (a, b) -> a + b;      // lambda implements operate()
        Calculator multiply = (a, b) -> a * b;

        System.out.println("Add: " + add.operate(3, 4));
        System.out.println("Multiply: " + multiply.operate(3, 4));
        add.describe();
    }
}
// OUTPUT:
// Add: 7
// Multiply: 12
// A calculator that combines two ints`
            ]
        },
        {
            content: `<h3>Interface vs Abstract Class</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Interface</th><th>Abstract Class</th></tr>
<tr class='text-center'><td>Multiple inheritance</td><td>A class can implement many interfaces</td><td>A class can extend only one abstract class</td></tr>
<tr class='text-center'><td>State (instance fields)</td><td>Only constants (public static final)</td><td>Can have real instance fields with any access modifier</td></tr>
<tr class='text-center'><td>Constructors</td><td>No</td><td>Yes — run during subclass construction via super()</td></tr>
<tr class='text-center'><td>Method bodies</td><td>default/static methods only (Java 8+)</td><td>Any mix of abstract and fully implemented methods</td></tr>
<tr class='text-center'><td>Best used for</td><td>Defining a capability/contract across unrelated classes</td><td>Sharing common state + partial implementation among closely related classes</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why were default methods added to interfaces in Java 8?</td><td>So existing interfaces (like those in the Collections framework) could gain new methods without breaking every class that already implemented them</td></tr>
<tr class='text-center'><td>Are fields in an interface mutable?</td><td>No — every interface field is implicitly public static final, i.e. a constant</td></tr>
<tr class='text-center'><td>What happens if a class implements two interfaces with the same default method?</td><td>Compile error unless the class explicitly overrides that method, optionally calling InterfaceName.super.method() to pick a specific parent's version</td></tr>
<tr class='text-center'><td>What makes an interface a "functional interface"?</td><td>It declares exactly one abstract method (default/static methods don't count), making it a valid target for a lambda expression</td></tr>
<tr class='text-center'><td>Can an interface have a static method inherited by implementing classes?</td><td>No — static interface methods belong to the interface itself and must be called as InterfaceName.method()</td></tr>
<tr class='text-center'><td>Interface vs abstract class — when do you pick which?</td><td>Interface for a capability shared across unrelated classes (multiple implementable); abstract class when related classes should share real state and partial implementation</td></tr>
</table>`
        }
    ]
};
