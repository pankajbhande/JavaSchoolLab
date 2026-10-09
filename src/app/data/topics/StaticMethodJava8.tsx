import { Topic } from '../coreJava';

export const staticMethodJava8: Topic = {
    id: 'java8-static-method',
    name: 'Static Method',
    beginner: [
        {
            content:
                `<h3>Static Method (in Interfaces)</h3>
<p>Java 8 lets an interface hold <b>static methods</b> with a body. Before Java 8, an interface could only have abstract methods. Now it can also have default and static methods. A static method is called on the interface itself, so no object is needed.</p>

<h4>Before vs After Java 8:</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2">
<tr><th>Aspect</th><th>Before Java 8</th><th>Java 8 Update</th></tr>
<tr><td>Interface methods</td><td>Interfaces could only have abstract methods (no body)</td><td>Introduced static methods in interfaces</td></tr>
<tr><td>What it means</td><td>—</td><td>Interfaces can now have static methods with a body (implementation)</td></tr>
<tr><td>Why it's useful</td><td>—</td><td>To create utility or helper methods related to the interface</td></tr>
<tr><td>How to use</td><td>—</td><td>Static methods are called using the interface name, not through implementing classes</td></tr>
</table>

<h4>Key Features of Static Methods in Interfaces:</h4>
<ol>
<li><b>Utility methods:</b> they hold helpers related to the interface that need no instance.</li>
<li><b>Direct invocation:</b> call them with the interface name, as in <code>MyInterface.staticMethod()</code>.</li>
<li><b>Syntax:</b> write <code>static</code> before the return type and give the method a body. See the code below.</li>
</ol>
`,
            codeExamples: [
                `// Example: interface with a static method
package com.javaschoollab.demo;

public interface MyInterface {
    void existingMethod(String str); // Abstract method

    static void staticMethod() {
        System.out.println("This is a static method in an interface.");
    }
}

// Implementing the interface
package com.javaschoollab.demo;

public class MyClass implements MyInterface {
    @Override
    public void existingMethod(String str) {
        System.out.println("Existing method: " + str);
    }

    public static void main(String[] args) {
        MyClass obj = new MyClass();
        obj.existingMethod("Hello");       // Calling the abstract method
        MyInterface.staticMethod();        // Calling the static method from the interface
    }
}
// OUTPUT:
// Existing method: Hello
// This is a static method in an interface.`
            ]
        },
        {
            content:
                `<h4>Explanation</h4>
<p><b>MyInterface.java</b></p>
<ul>
<li>It has an abstract method <code>existingMethod</code> and a static method <code>staticMethod</code> with a body.</li>
</ul>
<p><b>MyClass.java</b></p>
<ul>
<li>It implements <code>MyInterface</code> and gives a body to <code>existingMethod</code>.</li>
<li><code>main</code> calls the abstract method on an instance and the static method on the interface.</li>
</ul>`,
            codeExamples: [
                `// Example 02: Interface with a static method
package com.javaschoollab.demo;

public interface Example {
    static void x1() {
        System.out.println("this is static method");
    }
}

// Implementing class
package com.javaschoollab.demo;

public class MainTest implements Example {
    public static void main(String[] args) {
        Example.x1();
    }
}
// OUTPUT: this is static method`
            ]
        },
        {
            content:
                `<h4>Explanation</h4>
<p><b>Interface (Example)</b></p>
<ul>
<li>It has a static method <code>x1</code> that prints a message.</li>
</ul>
<p><b>Implementing class (MainTest)</b></p>
<ul>
<li>It implements <code>Example</code> but does not inherit <code>x1</code>.</li>
<li><code>main</code> calls <code>x1</code> directly on the <code>Example</code> interface.</li>
</ul>`,
            codeExamples: [
                `// Example 03: Utility class - static methods for common tasks,
// callable without ever creating a MathUtility instance
package com.javaschoollab.demo;

public class MathUtility {
    public static int add(int a, int b) { return a + b; }
    public static int subtract(int a, int b) { return a - b; }
    public static int multiply(int a, int b) { return a * b; }
    public static int divide(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("Divider cannot be zero.");
        }
        return a / b;
    }
}

package com.javaschoollab.demo;

public class Main {
    public static void main(String[] args) {
        System.out.println("Addition: " + MathUtility.add(5, 3));
        System.out.println("Subtraction: " + MathUtility.subtract(5, 3));
        System.out.println("Multiplication: " + MathUtility.multiply(5, 3));
        System.out.println("Division: " + MathUtility.divide(5, 3));
    }
}
// OUTPUT:
// Addition: 8
// Subtraction: 2
// Multiplication: 15
// Division: 1`,

                `// Example 04: Static method in an interface, used as a utility method
package com.javaschoollab.demo;

public interface MyInterface {
    static void printMessage(String message) {
        System.out.println("Message: " + message);
    }
}

package com.javaschoollab.demo;

public class Main {
    public static void main(String[] args) {
        MyInterface.printMessage("Hello from static method in interface!");
    }
}
// OUTPUT: Message: Hello from static method in interface!`,

                `// Example 05: Static block - runs once, when the class is first loaded,
// to initialize static variables
package com.javaschoollab.demo;

public class StaticBlockExample {
    static int count;

    static {
        count = 10; // Static block to initialize static variable
        System.out.println("Static block executed.");
    }

    public static void main(String[] args) {
        System.out.println("Count: " + count);
    }
}
// OUTPUT:
// Static block executed.
// Count: 10`,

                `// Example 06: Singleton pattern - restricts a class to exactly one instance
package com.javaschoollab.demo;

public class Singleton {
    private static Singleton instance;

    private Singleton() {
        // Private constructor to prevent instantiation
    }

    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }

    public void showMessage() {
        System.out.println("Hello from Singleton!");
    }
}

package com.javaschoollab.demo;

public class Main {
    public static void main(String[] args) {
        Singleton singleton = Singleton.getInstance();
        singleton.showMessage();
    }
}
// OUTPUT: Hello from Singleton!`,

                `// Example 07: Static import - access static members without
// qualifying them with the class name
package com.javaschoollab.demo;

import static java.lang.Math.*;

public class MathOperations {
    public static void main(String[] args) {
        System.out.println("Square root of 16: " + sqrt(16));
        System.out.println("Power of 2^3: " + pow(2, 3));
        System.out.println("PI: " + PI);
    }
}
// OUTPUT:
// Square root of 16: 4.0
// Power of 2^3: 8.0
// PI: 3.141592653589793`
            ]
        },
        {
            content: `<h4>Benefits of Static Methods in Interfaces:</h4>
<ol>
<li><b>Encapsulation:</b> utility methods stay next to the interface they belong to.</li>
<li><b>No separate utility class:</b> helpers are defined inside the interface itself.</li>
<li><b>Readability:</b> related methods sit together in one place.</li>
</ol>`
        }
    ],

    expert: [
        {
            content: `<h3>Static Methods Are NOT Inherited by Implementing Classes</h3>
<p>Unlike default methods, an interface static method belongs only to the interface. It is <strong>not</strong> inherited by implementing classes, and it cannot be called on an instance or overridden. This is the classic interview trap.</p>`,
            codeExamples: [
                `public class StaticNotInheritedDemo {

    interface Vehicle {
        static void honk() {
            System.out.println("Beep from Vehicle interface");
        }
    }

    static class Car implements Vehicle {
        // Car does NOT inherit honk() - this is a brand-new, unrelated static method
        static void honk() {
            System.out.println("Beep from Car class");
        }
    }

    public static void main(String[] args) {
        Vehicle.honk();   // must call through the interface name
        Car.honk();        // Car's own static method, not an override

        Car c = new Car();
        // c.honk();       // legal but poor style: a CLASS static is reachable
        //                 // via an instance; an INTERFACE static is not
    }
}
// OUTPUT:
// Beep from Vehicle interface
// Beep from Car class`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can an interface's static method be inherited by an implementing class?</td><td>No - it belongs only to the interface and must be called via the interface name (InterfaceName.method())</td></tr>
<tr class='text-center'><td>Can a static interface method be overridden?</td><td>No - static methods are resolved at compile time and are not part of dynamic dispatch, so "overriding" does not apply</td></tr>
<tr class='text-center'><td>Why were static methods added to interfaces in Java 8?</td><td>To let related utility/helper logic (like Comparator.comparing()) live directly on the interface instead of in a separate utility companion class</td></tr>
<tr class='text-center'><td>Difference between a default method and a static method in an interface?</td><td>A default method is inherited and overridable by implementing classes; a static method belongs solely to the interface and is called through the interface name</td></tr>
</table>`
        }
    ]
};
