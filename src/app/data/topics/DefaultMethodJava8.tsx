import { Topic } from '../coreJava';

export const defaultMethodJava8: Topic = {
    id: 'java8-default-method',
    name: 'Default Method',
    beginner: [
        {
            content:
                `<h3>Default methods / Defender Methods</h3>
<p>Java 8 introduced default methods (also called defender methods). They let an interface carry method bodies.</p>
<p>The goal is to make interfaces flexible and keep old code working, especially in the Java Collections Framework.</p>
<p>A method inside an interface that is marked with <code>default</code> is a default method. It is not abstract.</p>

<h4>Key Points about Default Methods</h4>
<ol>
<li><b>Declaration:</b>
<ul>
<li>A default method is declared in an interface with the <code>default</code> keyword.</li>
<li>It gives a default body that implementing classes can use as is.</li>
</ul>
</li>
<li><b>Purpose:</b>
<ul>
<li>Add new methods to an interface without breaking existing implementations.</li>
<li>Share common behavior across many classes.</li>
</ul>
</li>
<li><b>Syntax:</b> see the code below.</li>
</ol>`,
            codeExamples: [
                `// Example 01: Interface with a default method
package com.javaschoollab.demo;

public interface MyInterface {
    void existingMethod(String str); // Abstract method

    default void defaultMethod() {
        System.out.println("This is a default method.");
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
        obj.existingMethod("Hello");   // Calling the abstract method
        obj.defaultMethod();           // Calling the default method
    }
}
// OUTPUT:
// Existing method: Hello
// This is a default method.`
            ]
        },
        {
            content:
                `<h4>Code Explanation</h4>
<ol>
<li><b>MyInterface.java:</b>
<ul>
<li>It declares the abstract method <code>existingMethod</code>.</li>
<li>It also declares the default method <code>defaultMethod</code> with a body.</li>
</ul>
</li>
<li><b>MyClass.java:</b>
<ul>
<li>It implements <code>MyInterface</code>.</li>
<li>It must implement the abstract method <code>existingMethod</code>.</li>
<li>The <code>main</code> method calls both the implemented method and the inherited default method.</li>
</ul>
</li>
</ol>
<p>Example 02 below uses only a default method, so the class needs no body at all.</p>`,
            codeExamples: [
                `// Example 02: Class inherits a default method as is
package com.javaschoollab.demo;

public interface Example {
    default void m1() {
        System.out.println("this is default m1 method");
    }
}

package com.test;

import com.javaschoollab.demo.Example;

public class TestMain implements Example {
    public static void main(String[] args) {
        TestMain testMain = new TestMain();
        testMain.m1();
    }
}
// OUTPUT:
// this is default m1 method`
            ]
        },
        {
            content: `<h4>Advantages of Default Methods</h4>
<ol>
<li><b>Backward compatibility:</b> add new methods to an interface without breaking old implementations.</li>
<li><b>Multiple inheritance of behavior:</b> a class can inherit method bodies from several interfaces.</li>
<li><b>Less boilerplate:</b> common code lives once in the interface.</li>
</ol>

<h4>Considerations</h4>
<ol>
<li><b>Diamond problem:</b> if two interfaces give the same default method, the class must override it to remove the ambiguity.</li>
<li><b>Use with care:</b> keep interface hierarchies simple so the code stays easy to follow.</li>
</ol>`
        }
    ],
    expert: [
        {
            content: `<h3>Default Methods and the "Diamond Problem"</h3>
<p>Interfaces can now carry behavior. So Java needed rules for the classic diamond problem: what happens when a class implements two interfaces that give the SAME default method?</p>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        InterfaceA                InterfaceB
      default hello()           default hello()
             \\                       /
              \\                     /
               \\                   /
                 class C implements A, B
                 // COMPILE ERROR unless C overrides hello()
                 // "class C inherits unrelated defaults for hello() from A and B"</pre>

<h4>Resolution Rules (in priority order)</h4>
<ol>
<li><strong>Classes always win</strong> - a method from the class itself or its superclass beats any interface default.</li>
<li><strong>More specific interface wins</strong> - if interface B extends A and overrides the default method, B's version wins.</li>
<li><strong>Explicit override required</strong> - if two unrelated interfaces give the same default method, the class MUST override it. It may delegate with <code>InterfaceName.super.methodName()</code>. Otherwise it is a compile-time error.</li>
</ol>`,
            codeExamples: [
                `public class DiamondProblemDemo {

    interface A {
        default void hello() { System.out.println("Hello from A"); }
    }

    interface B {
        default void hello() { System.out.println("Hello from B"); }
    }

    // Must explicitly resolve the conflict
    static class C implements A, B {
        @Override
        public void hello() {
            A.super.hello(); // explicitly choose A's version
            B.super.hello(); // explicitly choose B's version
            System.out.println("Hello from C (resolved)");
        }
    }

    public static void main(String[] args) {
        new C().hello();
    }
}
// OUTPUT:
// Hello from A
// Hello from B
// Hello from C (resolved)`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why were default methods introduced in Java 8?</td><td>To let existing interfaces (like those in the Collections Framework) add new methods without breaking every class that already implements them</td></tr>
<tr class='text-center'><td>Can a default method be overridden?</td><td>Yes - an implementing class can override it just like a normal inherited method</td></tr>
<tr class='text-center'><td>What happens if a class implements two interfaces with the same default method?</td><td>Compile-time error unless the class explicitly overrides the method and resolves the conflict (optionally via InterfaceName.super.method())</td></tr>
<tr class='text-center'><td>Does a default method count toward the "single abstract method" rule for functional interfaces?</td><td>No - only abstract methods count; an interface can have one abstract method plus any number of default/static methods and still be a valid functional interface</td></tr>
<tr class='text-center'><td>If a class method and an interface default method conflict, which wins?</td><td>The class's own (or inherited superclass) method always wins over any interface default</td></tr>
</table>`
        }
    ]
};
