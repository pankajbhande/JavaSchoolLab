import { Topic } from '../coreJava';

export const methodsInJava: Topic = {
    id: 'methods-in-java',
    name: 'Methods in Java',

    beginner: [
        {
            content: `<h4>What is a Method?</h4>
A <b>method</b> is a named block of code that performs a specific task, defined inside a class. Methods exist so logic can be written <b>once</b> and reused via a simple call, instead of copy-pasting the same code everywhere.<br><br>

<b>Anatomy of a method:</b>`,
            codeExamples: [
                `public int add(int a, int b) {
    return a + b;
}
// public       -> access modifier (who can call this method)
// int          -> return type (the type of value it hands back)
// add          -> method name
// (int a, int b) -> parameter list (inputs)
// { return a + b; } -> method body`
            ]
        },
        {
            content: `<h4>Calling a Method</h4>
A method runs only when it's <b>called</b> - defining it doesn't execute anything by itself. Call it using <code>objectName.methodName(arguments)</code> for instance methods.`,
            codeExamples: [
                `public class Calculator {
    int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        Calculator calc = new Calculator();
        int result = calc.add(5, 3);   // calling the method
        System.out.println("Result: " + result);
    }
}
// OUTPUT:
// Result: 8`
            ]
        },
        {
            content: `<h4>Parameters vs Arguments</h4>
<ul>
<li><b>Parameters</b> are the variables listed in the method's definition (<code>int a, int b</code>).</li>
<li><b>Arguments</b> are the actual values passed in when the method is called (<code>5, 3</code>).</li>
</ul>
<p>People often use the two words interchangeably, but technically a parameter is the placeholder, an argument is the real value plugged into it.</p>`
        },
        {
            content: `<h4>void vs Value-Returning Methods</h4>
A method's return type says what kind of value it hands back to the caller - or <code>void</code> if it doesn't return anything at all.`,
            codeExamples: [
                `public class MethodTypesDemo {

    // void: performs an action, returns nothing
    static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }

    // returns an int
    static int square(int n) {
        return n * n;
    }

    public static void main(String[] args) {
        greet("Pankaj");            // just prints, nothing to store
        int result = square(6);     // returns a value we can store/use
        System.out.println("Square: " + result);
    }
}
// OUTPUT:
// Hello, Pankaj!
// Square: 36`
            ]
        },
        {
            content: `<h4>Method Overloading</h4>
Java lets multiple methods share the <b>same name</b> in the same class, as long as their <b>parameter lists differ</b> (different number, type, or order of parameters). The compiler picks the right one based on the arguments you pass at the call site.`,
            codeExamples: [
                `public class OverloadDemo {

    static int add(int a, int b) {
        return a + b;
    }

    static double add(double a, double b) {
        return a + b;
    }

    static int add(int a, int b, int c) {
        return a + b + c;
    }

    public static void main(String[] args) {
        System.out.println(add(2, 3));         // calls int version
        System.out.println(add(2.5, 3.5));     // calls double version
        System.out.println(add(1, 2, 3));      // calls 3-arg version
    }
}
// OUTPUT:
// 5
// 6.0
// 6`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Pass-by-Value — Even for Objects</h3>
Java is <b>strictly pass-by-value</b> - always. For primitives, a copy of the value is passed. For objects, a copy of the <b>reference</b> (the address) is passed - not the object itself. This distinction is one of the most misunderstood/asked interview topics in Java.<br><br>

Because the reference is copied, the method CAN mutate the object it points to (both copies point to the same heap object), but reassigning the parameter inside the method never affects the caller's original reference.`,
            codeExamples: [
                `import java.util.ArrayList;
import java.util.List;

public class PassByValueDemo {

    static void mutateContents(List<String> list) {
        list.add("added inside method");   // mutates the SAME object - visible outside
    }

    static void reassignReference(List<String> list) {
        list = new ArrayList<>();          // reassigns the LOCAL copy of the reference only
        list.add("only visible inside this method");
    }

    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Pankaj");

        mutateContents(names);
        System.out.println("After mutateContents: " + names);

        reassignReference(names);
        System.out.println("After reassignReference: " + names);
    }
}
// OUTPUT:
// After mutateContents: [Pankaj, added inside method]
// After reassignReference: [Pankaj, added inside method]`
            ]
        },
        {
            content: `<h3>Overload Resolution — Which Method Actually Gets Picked</h3>
When multiple overloads could technically match, the compiler prefers, in order: (1) an <b>exact type match</b>, (2) a match via <b>widening</b> primitive conversion (e.g. int -> long), (3) a match via <b>autoboxing</b> (int -> Integer), (4) a match via <b>varargs</b> - varargs is always the last resort.`,
            codeExamples: [
                `public class OverloadResolutionDemo {

    static void show(long x)    { System.out.println("long version: " + x); }
    static void show(Integer x) { System.out.println("Integer version: " + x); }
    static void show(int... x)  { System.out.println("varargs version"); }

    public static void main(String[] args) {
        show(5);   // int argument: no exact int overload here,
                   // widening (int->long) is preferred over autoboxing (int->Integer),
                   // which is preferred over varargs
    }
}
// OUTPUT:
// long version: 5`
            ]
        },
        {
            content: `<h3>Return Type Alone Cannot Distinguish Overloads</h3>
Two methods with the same name and same parameter list, differing only by return type, do NOT compile as valid overloads - the compiler can't tell them apart from the call site alone.`,
            codeExamples: [
                `public class InvalidOverload {
    int compute(int x) { return x * 2; }
    // double compute(int x) { return x * 2.0; }
    // COMPILE ERROR: method compute(int) is already defined
}`
            ]
        },
        {
            content: `<h3>Static vs Instance Methods</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Instance Method</th><th>Static Method</th></tr>
<tr class='text-center'><td>Belongs to</td><td>An object</td><td>The class itself</td></tr>
<tr class='text-center'><td>Called via</td><td>objectRef.method()</td><td>ClassName.method() (or unqualified within the same class)</td></tr>
<tr class='text-center'><td>Can access instance fields directly?</td><td>Yes</td><td>No - only static fields, unless given an object reference</td></tr>
<tr class='text-center'><td>Can be overridden?</td><td>Yes (runtime polymorphism)</td><td>No - can only be hidden, resolved at compile time</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can a method mutate an object passed into it?</td><td>Yes, since both the caller's and the parameter's references point to the same heap object - but reassigning the parameter itself never affects the caller's reference</td></tr>
<tr class='text-center'><td>Why can't two methods differ only by return type?</td><td>The compiler resolves which overload to call based on the arguments at the call site, not the expected return type, so an ambiguous case would be uncompilable</td></tr>
</table>`
        }
    ]
};
