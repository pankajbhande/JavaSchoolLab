import { Topic } from '../coreJava';

export const varargsInJava: Topic = {
    id: 'varargs',
    name: 'Varargs in Java',

    beginner: [
        {
            content: `<h4>What are Varargs?</h4>
<b>Varargs</b> (variable-length arguments), written as <code>Type... name</code>, let a method accept <b>zero, one, or many</b> arguments of the same type without the caller having to build an array by hand.
<ul>
<li>Inside the method body, the varargs parameter behaves exactly like an <b>array</b> - <code>int... nums</code> is usable as <code>int[] nums</code>.</li>
<li>Introduced in Java 5, mainly to simplify APIs like <code>String.format(...)</code> and <code>Arrays.asList(...)</code>.</li>
</ul>`
        },
        {
            content: `<h4>Calling a Varargs Method</h4>
A varargs method can be called with any number of matching arguments - including none - or with an actual array.`,
            codeExamples: [
                `public class VarargsBasicDemo {

    static int sum(int... nums) {
        int total = 0;
        for (int n : nums) {
            total += n;
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println(sum());              // zero arguments
        System.out.println(sum(5));             // one argument
        System.out.println(sum(1, 2, 3, 4));    // many arguments
        System.out.println(sum(new int[]{10, 20})); // an array works too
    }
}
// OUTPUT:
// 0
// 5
// 10
// 30`
            ]
        },
        {
            content: `<h4>Varargs Must Be the LAST Parameter</h4>
A method can mix normal parameters with a varargs parameter, but the varargs parameter must always come <b>last</b>, and only <b>one</b> varargs parameter is allowed per method - the compiler needs to know unambiguously where the fixed parameters end and the variable-length part begins.`,
            codeExamples: [
                `public class VarargsPositionDemo {

    static void printScores(String student, int... scores) { // varargs LAST: valid
        System.out.print(student + ": ");
        for (int s : scores) {
            System.out.print(s + " ");
        }
        System.out.println();
    }

    // static void bad(int... s, String name) { }  // ERROR: varargs must be last
    // static void bad2(int... a, int... b) { }     // ERROR: only one varargs allowed

    public static void main(String[] args) {
        printScores("Pankaj", 90, 85, 95);
    }
}
// OUTPUT:
// Pankaj: 90 85 95`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Varargs is Just Syntactic Sugar for an Array</h3>
At the bytecode level, <code>Type... name</code> compiles down to exactly <code>Type[] name</code> - the compiler automatically wraps the passed arguments into an array before the call. This is why the parameter can be used as an array inside the method, and why passing an actual array directly also works (no double-wrapping happens).
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">void sum(int... nums)      compiles to      void sum(int[] nums)

sum(1, 2, 3)   -->   compiler builds new int[]{1, 2, 3}, then calls sum(that array)
sum(existingArray)  -->  the array is passed directly, no extra wrapping</pre>`
        },
        {
            content: `<h3>Overload Resolution Trap — Specific Arity Wins Over Varargs</h3>
When a call matches <b>both</b> a fixed-arity overload and a varargs overload, Java always prefers the <b>more specific, fixed-arity</b> version. Varargs is deliberately treated as the "last resort" match.`,
            codeExamples: [
                `public class OverloadResolutionDemo {

    static void show(int a, int b) {
        System.out.println("Fixed two-arg version: " + a + ", " + b);
    }

    static void show(int... nums) {
        System.out.println("Varargs version, count=" + nums.length);
    }

    public static void main(String[] args) {
        show(1, 2);       // matches BOTH - fixed-arity wins
        show(1, 2, 3);    // only varargs matches
        show();           // only varargs matches (zero args)
    }
}
// OUTPUT:
// Fixed two-arg version: 1, 2
// Varargs version, count=3
// Varargs version, count=0`
            ]
        },
        {
            content: `<h3>Heap Pollution with Generic Varargs — @SafeVarargs</h3>
Combining varargs with generics (e.g. <code>List&lt;T&gt;... lists</code>) is legal but risky. Arrays keep their type at runtime, but generics are erased. So the compiler can only create a <b>raw</b> array underneath. A wrong type can then slip in with no <code>ClassCastException</code> at that point. This problem is called <b>heap pollution</b>.
<ul>
<li>The compiler warns: <code>"unchecked generic array creation"</code>.</li>
<li><code>@SafeVarargs</code> (allowed on <code>static</code>, <code>final</code> and <code>private</code> methods, and constructors) tells the compiler "trust me, this method does nothing unsafe with the varargs array". It suppresses the warning.</li>
<li>Use it only if the method never stores into the array or leaks it. It is a promise, not a fix.</li>
</ul>`,
            codeExamples: [
                `import java.util.List;
import java.util.Arrays;

public class SafeVarargsDemo {

    @SafeVarargs   // promise: nothing unsafe is done with lists
    static <T> List<T> firstNonEmpty(List<T>... lists) {
        for (List<T> l : lists) {
            if (!l.isEmpty()) return l;
        }
        return List.of();
    }

    public static void main(String[] args) {
        List<String> result = firstNonEmpty(List.of(), Arrays.asList("Java", "Spring"));
        System.out.println(result);
    }
}
// OUTPUT:
// [Java, Spring]`
            ]
        },
        {
            content: `<h3>Real-World Varargs — printf / String.format</h3>
The most familiar varargs API in the JDK is <code>String.format(String pattern, Object... args)</code>. <code>System.out.printf</code> calls it, so you can pass any number of values.`,
            codeExamples: [
                `public class PrintfVarargsDemo {
    public static void main(String[] args) {
        System.out.printf("Name: %s, Age: %d%n", "Pankaj", 28);
        System.out.printf("Sum of %d, %d, %d = %d%n", 1, 2, 3, 6);
    }
}
// OUTPUT:
// Name: Pankaj, Age: 28
// Sum of 1, 2, 3 = 6`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What type is a varargs parameter treated as inside the method?</td><td>An array of that type - int... nums behaves exactly like int[] nums inside the method body</td></tr>
<tr class='text-center'><td>Where must a varargs parameter be positioned?</td><td>Last in the parameter list, and a method can have at most one varargs parameter</td></tr>
<tr class='text-center'><td>If both a fixed-arity and varargs overload match a call, which wins?</td><td>The fixed-arity (more specific) overload - varargs is only chosen when no fixed-arity overload matches</td></tr>
<tr class='text-center'><td>What is heap pollution in the context of varargs?</td><td>Combining generics with varargs creates an unchecked raw array underneath, which can let incompatible types be stored without an immediate ClassCastException</td></tr>
<tr class='text-center'><td>What does @SafeVarargs actually do?</td><td>It suppresses the "unchecked generic array creation" compiler warning - it is a developer promise, not a runtime safety guarantee, and only applies to static, final or private methods, or constructors</td></tr>
<tr class='text-center'><td>Can you pass zero arguments to a varargs method?</td><td>Yes - the method receives an array of length 0, not null</td></tr>
</table>`
        }
    ]
};
