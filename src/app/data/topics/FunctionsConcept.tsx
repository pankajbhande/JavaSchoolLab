import { Topic } from '../coreJava';

export const functionsConcept: Topic = {
    id: 'functions-concept',
    name: 'Functions',
    beginner: [
        {
            content: `<h3>What is a Function?</h3>
A function (called a "method" in Java when it belongs to a class) is a named, reusable block of code that performs a specific task. Instead of copy-pasting the same logic everywhere it's needed, you define it once and "call" it by name wherever it's needed.<br>`,
            codeExamples: [`public class WhatIsFunction {
    static void greet() {
        System.out.println("Hello, welcome!");
    }

    public static void main(String[] args) {
        greet(); // calling the function
        greet(); // calling it again - no need to rewrite the logic
    }
}
// OUTPUT:
// Hello, welcome!
// Hello, welcome!`]
        },
        {
            content: `<h3>Parameters: Feeding Data In</h3>
Functions become far more useful when they can accept input. Parameters are placeholders in the function definition; when you call the function, you supply actual values (arguments) for them.<br>`,
            codeExamples: [`public class ParametersDemo {
    static void greet(String name) { // "name" is the parameter
        System.out.println("Hello, " + name + "!");
    }

    public static void main(String[] args) {
        greet("Asha");   // "Asha" is the argument
        greet("Vikram");
    }
}
// OUTPUT:
// Hello, Asha!
// Hello, Vikram!`]
        },
        {
            content: `<h3>Return Values: Getting Data Out</h3>
A function can send a result back to whoever called it, using <code>return</code>. The function's declared return type tells you what kind of value to expect.<br>`,
            codeExamples: [`public class ReturnValueDemo {
    static int square(int number) {
        return number * number; // sends the result back
    }

    public static void main(String[] args) {
        int result = square(5); // result now holds 25
        System.out.println("Square: " + result);
    }
}
// OUTPUT:
// Square: 25`]
        },
        {
            content: `<h3>Why Break Code into Functions?</h3>
Functions make programs easier to read, test, and fix, because each one handles one clear job. This idea is called <strong>modularity</strong> - build the program from small, well-named, independent pieces rather than one giant block of code.<br>`,
            codeExamples: [`public class WhyFunctions {
    static int add(int a, int b) { return a + b; }
    static int multiply(int a, int b) { return a * b; }

    public static void main(String[] args) {
        int sum = add(4, 5);
        int product = multiply(4, 5);
        System.out.println("Sum: " + sum + ", Product: " + product);
    }
}
// OUTPUT:
// Sum: 9, Product: 20`]
        },
    ],
    expert: [
        {
            content: `<h3>Java Passes Everything by Value</h3>
A common point of confusion: Java is <strong>always</strong> pass-by-value - there is no pass-by-reference. What varies is <em>what</em> the value is: for primitives, the value is the actual data (a copy is passed, so the caller's variable is untouched). For objects, the value is a copy of the <strong>reference</strong> (the address) - so the method can modify the object's internal state through that reference, but reassigning the parameter itself never affects the caller's variable.<br>`,
            codeExamples: [`public class PassByValueDemo {
    static void tryToChangePrimitive(int x) {
        x = 999; // only changes the local copy
    }
    static void changeObjectState(int[] arr) {
        arr[0] = 999; // modifies the object THROUGH the copied reference
    }
    static void reassignReference(int[] arr) {
        arr = new int[]{111, 222}; // reassigns the LOCAL copy of the reference only
    }

    public static void main(String[] args) {
        int num = 5;
        tryToChangePrimitive(num);
        System.out.println("num after call: " + num); // unchanged

        int[] data = {1, 2, 3};
        changeObjectState(data);
        System.out.println("data[0] after call: " + data[0]); // changed - same object

        reassignReference(data);
        System.out.println("data[0] after reassign attempt: " + data[0]); // still 999 - original object untouched
    }
}
// OUTPUT:
// num after call: 5
// data[0] after call: 999
// data[0] after reassign attempt: 999`]
        },
        {
            content: `<h3>The Call Stack: Where Function Calls Live</h3>
Every function call gets its own stack frame holding its parameters, local variables, and the address to return to. Calling a function pushes a frame; returning pops it. This is why each call to a function is independent, even recursive calls to itself.<br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">main() calls square(5)

Stack (grows downward):
+---------------------+
| main() frame         |
|   result = ?          |
+---------------------+
| square(5) frame       |   &lt;- pushed on call
|   number = 5           |
+---------------------+   &lt;- popped on return, result flows back to main</pre>`,
            codeExamples: [`public class CallStackDemo {
    static int square(int number) {
        int result = number * number; // lives only in this frame
        return result;
    }

    public static void main(String[] args) {
        int answer = square(5); // pushes a frame, runs it, pops it, gets 25 back
        System.out.println("Answer: " + answer);
    }
}
// OUTPUT:
// Answer: 25`]
        },
        {
            content: `<h3>Overloading: Same Name, Different Signatures</h3>
Java allows multiple functions (methods) to share a name as long as their parameter lists differ in type, number, or order - this is called <strong>overloading</strong>. The compiler picks the correct one to call based on the arguments provided, at compile time.<br>`,
            codeExamples: [`public class OverloadingDemo {
    static int add(int a, int b) { return a + b; }
    static double add(double a, double b) { return a + b; }
    static int add(int a, int b, int c) { return a + b + c; }

    public static void main(String[] args) {
        System.out.println(add(2, 3));         // matches (int, int)
        System.out.println(add(2.5, 3.5));      // matches (double, double)
        System.out.println(add(1, 2, 3));       // matches (int, int, int)
    }
}
// OUTPUT:
// 5
// 6.0
// 6`]
        },
        {
            content: `<h3>Pure vs Impure Functions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Pure Function</th><th>Impure Function</th></tr>
<tr class='text-center'><td>Output depends on</td><td>Only its input parameters</td><td>Input parameters AND/OR external/mutable state</td></tr>
<tr class='text-center'><td>Side effects</td><td>None - doesn't modify anything outside itself</td><td>May print, modify fields, write files, etc.</td></tr>
<tr class='text-center'><td>Same input -> same output?</td><td>Always</td><td>Not guaranteed</td></tr>
<tr class='text-center'><td>Easy to test?</td><td>Very easy - fully predictable</td><td>Harder - depends on external state</td></tr>
</table>`,
            codeExamples: [`public class PureVsImpure {
    static int total = 0; // shared mutable state

    // Pure: output depends only on input, no side effects
    static int square(int x) {
        return x * x;
    }

    // Impure: modifies external state "total" - a side effect
    static void addToTotal(int x) {
        total += x;
    }

    public static void main(String[] args) {
        System.out.println(square(4)); // always 16, no matter how many times called
        System.out.println(square(4));

        addToTotal(5);
        addToTotal(5); // same argument, but total keeps growing - not predictable from input alone
        System.out.println("total: " + total);
    }
}
// OUTPUT:
// 16
// 16
// total: 10`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Is Java pass-by-value or pass-by-reference?</td><td>Always pass-by-value - for objects, the "value" being passed is a copy of the reference, not the object itself</td></tr>
<tr class='text-center'><td>If you reassign an object parameter inside a method, does the caller see the change?</td><td>No - only the local copy of the reference is reassigned; the caller's original reference still points to the original object</td></tr>
<tr class='text-center'><td>What is method overloading?</td><td>Defining multiple methods with the same name but different parameter lists (type/number/order), resolved at compile time</td></tr>
<tr class='text-center'><td>What is a pure function?</td><td>A function whose output depends only on its inputs and produces no observable side effects</td></tr>
<tr class='text-center'><td>What does each function call get on the call stack?</td><td>Its own independent stack frame holding parameters, local variables, and the return address</td></tr>
<tr class='text-center'><td>Can two overloaded methods differ only by return type?</td><td>No - return type alone is not enough to distinguish overloads; the compiler needs a difference in the parameter list</td></tr>
<tr class='text-center'><td>What is a side effect in the context of functions?</td><td>Any observable change a function makes outside its own local scope, such as modifying a field, printing, or writing to a file</td></tr>
</table>`
        },
    ],
};
