import { Topic } from '../coreJava';

export const differentWayToReturn: Topic = {
                        id: 'Different way to return to the method in java.',
                        name: 'Different way to return to the method in java.',

                        beginner: [
                            {
                                content: `
<h4>Returning a Primitive Value</h4>
A method can return a <b>primitive type</b> (int, double, boolean, etc.) - the caller gets a <b>copy of the value</b>, not a reference.
          `,
                                codeExamples: [
                                    `package com.test;

public class PrimitiveReturnDemo {

    static int square(int n) {
        return n * n;   // returns a copy of an int
    }

    public static void main(String[] args) {
        int result = square(5);
        System.out.println("result=" + result);
    }
}

// OUTPUT:
// result=25`
                                ]
                            },
                            {
                                content: `
<h4>Returning an Object</h4>
Instead of a primitive, a method can return a whole object - useful when the caller needs more than one related piece of data.
          `,
                                codeExamples: [
                                    `package com.test;

class Employee {
    int id;
    String name;

    Employee(int id, String name) {
        this.id = id;
        this.name = name;
    }
}

public class ObjectReturnDemo {

    static Employee createEmployee() {
        return new Employee(101, "Pankaj");   // returns object reference
    }

    public static void main(String[] args) {
        Employee e = createEmployee();
        System.out.println("id=" + e.id + ", name=" + e.name);
    }
}

// OUTPUT:
// id=101, name=Pankaj`
                                ]
                            },
                            {
                                content: `
<h4>Returning an Array</h4>
A method can return an array when it needs to hand back a fixed-size group of values of the same type.
          `,
                                codeExamples: [
                                    `package com.test;

public class ArrayReturnDemo {

    static int[] firstThreeSquares() {
        return new int[]{1, 4, 9};
    }

    public static void main(String[] args) {
        int[] squares = firstThreeSquares();
        for (int s : squares) {
            System.out.println(s);
        }
    }
}

// OUTPUT:
// 1
// 4
// 9`
                                ]
                            },
                            {
                                content: `
<h4>Returning Nothing - void</h4>
A method declared <code>void</code> returns no value at all. It can still use a bare <code>return;</code> (no value after it) to exit early.
          `,
                                codeExamples: [
                                    `package com.test;

public class VoidReturnDemo {

    static void printIfPositive(int n) {
        if (n <= 0) {
            return;   // exits early, no value returned
        }
        System.out.println("Positive: " + n);
    }

    public static void main(String[] args) {
        printIfPositive(5);
        printIfPositive(-2);   // silently returns, prints nothing
        System.out.println("Done");
    }
}

// OUTPUT:
// Positive: 5
// Done`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h4>Returning a List / Collection</h4>
Just like an array, a method can return a <code>List</code> (or any <code>Collection</code>) so the caller can iterate over a variable number of results.
          `,
                                codeExamples: [
                                    `package com.test;

import java.util.ArrayList;
import java.util.List;

public class CollectionReturnDemo {

    static List<String> getCities() {
        List<String> cities = new ArrayList<>();
        cities.add("Pune");
        cities.add("Mumbai");
        cities.add("Nagpur");
        return cities;
    }

    public static void main(String[] args) {
        for (String city : getCities()) {
            System.out.println(city);
        }
    }
}

// OUTPUT:
// Pune
// Mumbai
// Nagpur`
                                ]
                            },
                            {
                                content: `<h3>Returning Multiple Values from a Method</h3>
A Java method can only <code>return</code> one value - there is no native tuple/multi-return syntax. To hand back several related values at once, bundle them into a single object or array. The standard workarounds, from best to worst:<br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Approach</th><th>Notes</th></tr>
<tr class='text-center'><td>record (Java 16+)</td><td>Cleanest - type-safe, immutable, auto toString/equals/hashCode</td></tr>
<tr class='text-center'><td>Small wrapper class</td><td>Same idea pre-Java 16, more boilerplate</td></tr>
<tr class='text-center'><td>Array/List of Object</td><td>Type-unsafe, needs casting - avoid</td></tr>
<tr class='text-center'><td>Mutable holder / out-parameter</td><td>Pass an object in, mutate it - works but less idiomatic in Java</td></tr>
</table>
<br>`,
                                codeExamples: [
                                    `package com.test;

public class MultiReturnDemo {
    record Pair(int min, int max) {}

    static Pair minMax(int[] arr) {
        int min = arr[0], max = arr[0];
        for (int n : arr) {
            if (n < min) min = n;
            if (n > max) max = n;
        }
        return new Pair(min, max);
    }

    public static void main(String[] args) {
        Pair result = minMax(new int[]{5, 2, 9, 1, 7});
        System.out.println("min=" + result.min() + ", max=" + result.max());
    }
}
// OUTPUT:
// min=1, max=9`
                                ]
                            },
                            {
                                content: `
<h4>Returning "this" for Method Chaining (Fluent API)</h4>
An instance method can return <code>this</code> (the current object) instead of a new object - each call returns the same instance, letting calls be chained one after another. This is the pattern used by StringBuilder and most builder classes.<br>
          `,
                                codeExamples: [
                                    `package com.test;

public class OrderBuilder {
    private String item = "";
    private int qty = 0;

    public OrderBuilder item(String item) {
        this.item = item;
        return this;   // return the same object -> chaining
    }

    public OrderBuilder qty(int qty) {
        this.qty = qty;
        return this;
    }

    @Override
    public String toString() {
        return "Order[item=" + item + ", qty=" + qty + "]";
    }

    public static void main(String[] args) {
        OrderBuilder order = new OrderBuilder().item("Laptop").qty(2);
        System.out.println(order);
    }
}

// OUTPUT:
// Order[item=Laptop, qty=2]`
                                ]
                            },
                            {
                                content: `
<h4>Returning a Functional Interface / Lambda</h4>
A method can return an instance of a functional interface (like <code>Supplier&lt;T&gt;</code>) - effectively returning "behavior" rather than a plain value. The caller decides when to actually invoke it.<br>
          `,
                                codeExamples: [
                                    `package com.test;

import java.util.function.Supplier;

public class LambdaReturnDemo {

    static Supplier<String> greeter(String name) {
        return () -> "Hello, " + name + "!";   // returns a lambda
    }

    public static void main(String[] args) {
        Supplier<String> greet = greeter("Pankaj");
        System.out.println("Not called yet");
        System.out.println(greet.get());   // invoked here
    }
}

// OUTPUT:
// Not called yet
// Hello, Pankaj!`
                                ]
                            },
                            {
                                content: `<h3>Guard Clauses (Multiple Returns) vs Single Exit Point</h3>
Two competing styles for the same logic - both are valid, but readability differs:
<ul>
<li><strong>Guard clauses</strong> - return early for invalid/edge cases, keeping the "happy path" unindented and easy to scan.</li>
<li><strong>Single-return style</strong> - one return statement at the very end, using nested if/else to build the result.</li>
</ul>
Modern Java style generally favors guard clauses for validation-heavy methods.`,
                                codeExamples: [
                                    `package com.test;

public class ReturnStyleDemo {

    // Guard-clause style: early returns for invalid input
    static String classifyGuard(int score) {
        if (score < 0 || score > 100) return "Invalid";
        if (score >= 90) return "A";
        if (score >= 75) return "B";
        return "C";
    }

    // Single-exit-point style: one return at the end
    static String classifySingleExit(int score) {
        String result;
        if (score < 0 || score > 100) {
            result = "Invalid";
        } else if (score >= 90) {
            result = "A";
        } else if (score >= 75) {
            result = "B";
        } else {
            result = "C";
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println(classifyGuard(95));
        System.out.println(classifySingleExit(95));
        System.out.println(classifyGuard(150));
    }
}
// OUTPUT:
// A
// A
// Invalid`
                                ]
                            },
                            {
                                content: `<h3>"Returning" via Output Parameters (void methods)</h3>
A void method can still hand data back to the caller by mutating an object passed in - common with StringBuilder/collections, but should be used sparingly since it hides the "output" from the method signature.<br>`,
                                codeExamples: [
                                    `package com.test;
import java.util.List;

public class OutputParamDemo {

    // "Returns" by appending to the passed-in StringBuilder
    static void appendGreeting(StringBuilder sb, String name) {
        sb.append("Hello, ").append(name).append("! ");
    }

    // "Returns" by adding to the passed-in List
    static void collectEvens(int[] source, List<Integer> out) {
        for (int n : source) {
            if (n % 2 == 0) out.add(n);
        }
    }

    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        appendGreeting(sb, "Pankaj");
        appendGreeting(sb, "Raghunath");
        System.out.println(sb);

        java.util.List<Integer> evens = new java.util.ArrayList<>();
        collectEvens(new int[]{1, 2, 3, 4, 5, 6}, evens);
        System.out.println(evens);
    }
}
// OUTPUT:
// Hello, Pankaj! Hello, Raghunath!
// [2, 4, 6]`
                                ]
                            },
                            {
                                content: `<h3>Returning a Stream Instead of a Materialized List</h3>
A method can return a lazily-evaluated <code>Stream&lt;T&gt;</code> instead of fully building a <code>List&lt;T&gt;</code> up front - elements are only computed as the caller consumes them, which can save memory/work for large or infinite sequences.<br>`,
                                codeExamples: [
                                    `package com.test;
import java.util.stream.Stream;

public class StreamReturnDemo {

    static Stream<Integer> squaresUpTo(int n) {
        return Stream.iterate(1, i -> i + 1)
                      .limit(n)
                      .map(i -> i * i);
    }

    public static void main(String[] args) {
        squaresUpTo(5).forEach(System.out::println);
    }
}
// OUTPUT:
// 1
// 4
// 9
// 16
// 25`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can a Java method return more than one value?</td><td>Not directly - a method has exactly one return type. Bundle multiple values into an object, record, or array instead</td></tr>
<tr class='text-center'><td>Difference between returning a primitive and an object?</td><td>A primitive returns a copy of the value; an object returns a copy of the reference, so the caller still points to the same heap object</td></tr>
<tr class='text-center'><td>Is unreachable code after a return statement allowed?</td><td>No - any statement placed after an unconditional return in the same block is a compile-time error</td></tr>
<tr class='text-center'><td>What happens to return inside try + finally?</td><td>finally still runs before the method actually returns; a return inside finally silently overrides the try's return value</td></tr>
<tr class='text-center'><td>Is a bare return; valid in a void method?</td><td>Yes - it exits the method early with no value, same idea as a guard clause</td></tr>
<tr class='text-center'><td>Why return this from a method?</td><td>To support method chaining / fluent APIs (e.g. StringBuilder, builder classes) - each call returns the same object so calls can be linked together</td></tr>
<tr class='text-center'><td>Can a method return a lambda?</td><td>Yes - a method can return any functional interface type (e.g. Supplier, Function); the caller decides when to actually invoke it</td></tr>
<tr class='text-center'><td>Array vs Collection as a return type?</td><td>Both leak a mutable reference to internal state the same way - consider a defensive copy or an unmodifiable wrapper for either</td></tr>
</table>
`
                            }
                        ]
                    };
