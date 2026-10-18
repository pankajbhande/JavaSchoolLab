import { Topic } from '../coreJava';

export const nestedAndInnerClasses: Topic = {
    id: 'nested-inner-classes',
    name: 'Nested & Inner Classes',

    beginner: [
        {
            content: `<h4>What is a Nested Class?</h4>
<p>A class declared <b>inside another class</b> is called a <b>nested class</b>. The class that contains it is called the <b>outer class</b>.</p>
<p>Java groups nested classes into two big families:</p>
<ul>
<li><b>Static nested class</b> — declared with <code>static</code>, behaves like a top-level class that just happens to live inside another class's namespace.</li>
<li><b>Inner class (non-static)</b> — NOT declared <code>static</code>; every inner class instance is tied to a specific instance of the outer class.</li>
</ul>
<p>Inner classes are further split into: <b>member inner class</b>, <b>local inner class</b> (inside a method), and <b>anonymous inner class</b> (no name at all).</p>`
        },
        {
            content: `<h4>Static Nested Class</h4>
A static nested class does <b>not</b> hold a reference to any outer object. It can be created directly using the outer class's name, without needing an outer instance first — just like any other class.`,
            codeExamples: [
                `public class Outer {
    static int outerStatic = 100;

    static class Nested {
        void show() {
            // can access outer's static members directly
            System.out.println("outerStatic = " + outerStatic);
        }
    }

    public static void main(String[] args) {
        Outer.Nested nested = new Outer.Nested(); // no outer instance needed
        nested.show();
    }
}
// OUTPUT:
// outerStatic = 100`
            ]
        },
        {
            content: `<h4>Inner Class (Member Inner Class)</h4>
A (non-static) inner class holds an <b>implicit reference</b> to the outer object that created it — that's why you must go through an outer instance to create one, using <code>outer.new Inner()</code>.`,
            codeExamples: [
                `public class Outer {
    int outerField = 42;

    class Inner {
        void show() {
            // can access outer's instance members directly
            System.out.println("outerField = " + outerField);
        }
    }

    public static void main(String[] args) {
        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner(); // requires an outer instance
        inner.show();
    }
}
// OUTPUT:
// outerField = 42`
            ]
        },
        {
            content: `<h4>Local Class (Defined Inside a Method)</h4>
A class declared <b>inside a method body</b> is a local class. It is only visible within that method, and it can capture <code>final</code>/effectively-final local variables from the enclosing method.`,
            codeExamples: [
                `public class Outer {
    void process() {
        int multiplier = 3; // effectively final

        class Calculator { // local class
            int multiply(int x) {
                return x * multiplier; // captures the local variable
            }
        }

        Calculator calc = new Calculator();
        System.out.println(calc.multiply(10));
    }

    public static void main(String[] args) {
        new Outer().process();
    }
}
// OUTPUT:
// 30`
            ]
        },
        {
            content: `<h4>Anonymous Inner Class</h4>
An anonymous inner class is a class with <b>no name</b> that is declared and instantiated in a single expression — usually to provide a one-off implementation of an interface or to override a method of an existing class.`,
            codeExamples: [
                `interface Greeting {
    void greet();
}

public class AnonymousDemo {
    public static void main(String[] args) {
        Greeting g = new Greeting() { // anonymous class implementing Greeting
            @Override
            public void greet() {
                System.out.println("Hello from an anonymous class!");
            }
        };
        g.greet();
    }
}
// OUTPUT:
// Hello from an anonymous class!`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why Anonymous Classes Were the Pre-Lambda Way to Implement Functional Interfaces</h3>
Before Java 8, an anonymous inner class was the standard way to pass "a piece of behavior" as an argument (e.g. to <code>Runnable</code>, <code>Comparator</code>, or event listeners) since Java had no lambda syntax. A lambda expression is essentially syntactic sugar over exactly this pattern — for a functional interface (single abstract method), the compiler can infer everything an anonymous class needed to spell out by hand.<br>`,
            codeExamples: [
                `import java.util.*;

public class AnonymousVsLambda {
    public static void main(String[] args) {
        List<String> names =
            new ArrayList<>(Arrays.asList("Chimnaji", "Anaji", "Baji"));

        // Old style — anonymous inner class implementing Comparator
        names.sort(new Comparator<String>() {
            @Override
            public int compare(String a, String b) {
                return a.compareTo(b);
            }
        });
        System.out.println("Anonymous class sort: " + names);

        // Modern style — lambda, same effect, far less boilerplate
        names.sort((a, b) -> b.compareTo(a));
        System.out.println("Lambda sort: " + names);
    }
}
// OUTPUT:
// Anonymous class sort: [Anaji, Baji, Chimnaji]
// Lambda sort: [Chimnaji, Baji, Anaji]`
            ]
        },
        {
            content: `<h3>Memory/GC Implication: Inner Classes Hold a Reference to Their Outer Instance</h3>
Because every (non-static) inner class instance secretly stores a reference back to the outer object that created it (accessible via <code>Outer.this</code>), the outer object <b>cannot be garbage collected</b> while any of its inner class instances are still reachable — even if nothing else in the program references the outer object directly. This is a classic source of memory leaks, especially with long-lived inner class instances (e.g. event listeners, callbacks) held by something outside the outer object's own lifecycle.<br><br>
A static nested class has no such hidden reference, so it does not keep its "outer" class instance alive.<br>`,
            codeExamples: [
                `public class LeakDemo {
    int[] bigArray = new int[1_000_000]; // pretend this is expensive to keep around

    class Inner {
        // holds an implicit reference to the LeakDemo instance (Outer.this)
    }

    static class StaticNested {
        // holds NO reference to any LeakDemo instance
    }

    public static void main(String[] args) {
        LeakDemo outer = new LeakDemo();
        LeakDemo.Inner inner = outer.new Inner();
        outer = null; // drop our own reference to "outer"...

        // ...but "inner" still keeps the LeakDemo object (and bigArray) alive,
        // because Inner holds Outer.this internally.
        System.out.println("inner is still holding its outer instance alive: "
            + (inner != null));
    }
}
// OUTPUT:
// inner is still holding its outer instance alive: true`
            ]
        },
        {
            content: `<h3>Accessing the Enclosing Instance Explicitly — Outer.this</h3>
When a variable name inside an inner class is shadowed (the inner class declares a field with the same name as the outer class), you can still reach the outer field explicitly with <code>Outer.this.fieldName</code>.<br>`,
            codeExamples: [
                `public class Outer {
    int value = 10;

    class Inner {
        int value = 20;

        void show() {
            System.out.println("Inner value: " + this.value);
            System.out.println("Outer value: " + Outer.this.value);
        }
    }

    public static void main(String[] args) {
        Outer outer = new Outer();
        Outer.Inner inner = outer.new Inner();
        inner.show();
    }
}
// OUTPUT:
// Inner value: 20
// Outer value: 10`
            ]
        },
        {
            content: `<h3>Static Nested Class vs Inner Class — Compared</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Static Nested Class</th><th>Inner Class (Non-Static)</th></tr>
<tr class='text-center'><td>Needs an outer instance to create?</td><td>No — <code>new Outer.Nested()</code></td><td>Yes — <code>outer.new Inner()</code></td></tr>
<tr class='text-center'><td>Implicit reference to outer instance?</td><td>No</td><td>Yes (accessible as <code>Outer.this</code>)</td></tr>
<tr class='text-center'><td>Can access outer instance (non-static) members?</td><td>No — only outer's static members</td><td>Yes — directly</td></tr>
<tr class='text-center'><td>Keeps outer instance alive (GC)?</td><td>No</td><td>Yes, as long as the inner instance is reachable</td></tr>
<tr class='text-center'><td>Typical use</td><td>Helper/builder classes logically scoped to the outer class</td><td>Classes that genuinely need to operate on an outer instance's state</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the key difference between a static nested class and an inner class?</td><td>An inner class holds an implicit reference to its enclosing outer instance; a static nested class does not</td></tr>
<tr class='text-center'><td>How do you instantiate a non-static inner class from outside the outer class?</td><td><code>Outer outer = new Outer(); Outer.Inner inner = outer.new Inner();</code></td></tr>
<tr class='text-center'><td>Can a static nested class access the outer class's instance (non-static) fields?</td><td>No — it can only access the outer class's static members, since it has no reference to any particular outer instance</td></tr>
<tr class='text-center'><td>Why can inner classes cause memory leaks?</td><td>Because they secretly hold a reference to their outer instance, keeping that outer object reachable (and un-collectible) for as long as the inner instance is reachable</td></tr>
<tr class='text-center'><td>What variables can a local/anonymous class capture from its enclosing method?</td><td>Only <code>final</code> or effectively-final local variables — variables that are never reassigned after initialization</td></tr>
<tr class='text-center'><td>How did lambdas change the need for anonymous inner classes?</td><td>For functional interfaces (single abstract method), a lambda replaces the anonymous-class boilerplate entirely, though anonymous classes are still needed for interfaces with multiple methods or to extend a concrete class</td></tr>
</table>`
        }
    ]
};
