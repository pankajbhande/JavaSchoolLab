import { Topic } from '../coreJava';

export const wrapperClass: Topic = {
                        id: 'wrapper-class',
                        name: 'Wrapper Class',

                        beginner: [
                            {
                                content: `
<h4>What is a Wrapper Class?</h4>
A Wrapper Class is a predefined class (in the <b>java.lang</b> package) that "wraps" a primitive data type inside an object. Every primitive type (<b>int</b>, <b>double</b>, <b>boolean</b>, etc.) has a matching wrapper class (<b>Integer</b>, <b>Double</b>, <b>Boolean</b>, etc.) that stores the same value, but as an object.<br><br>

<h4>Why do we need Wrapper Classes?</h4>
Primitives are fast and lightweight, but plain values - they don't behave like objects. Wrapper classes exist to bridge that gap:<br><br>
1. <b>Collections need objects</b> - classes like <b>ArrayList</b> and <b>HashMap</b> can only store objects, never primitives directly.<br>
2. <b>Object methods</b> - wrapper objects support useful methods like <b>toString()</b>, <b>equals()</b>, and <b>compareTo()</b> that a bare primitive can't offer.<br>
3. <b>Null is allowed</b> - a wrapper variable can hold <b>null</b> to represent "no value", something a primitive can never do.<br>
4. <b>Utility conversions</b> - wrapper classes provide handy static methods like <b>parseInt()</b> to convert between Strings and numbers.
              `
                            },
                            {
                                content: `
<h4>The 8 Wrapper Classes</h4>
Java has exactly 8 primitive types, and each one has exactly one matching wrapper class:<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Primitive Type</th><th>Wrapper Class</th></tr>
<tr class='text-center'><td>byte</td><td>Byte</td></tr>
<tr class='text-center'><td>short</td><td>Short</td></tr>
<tr class='text-center'><td>int</td><td>Integer</td></tr>
<tr class='text-center'><td>long</td><td>Long</td></tr>
<tr class='text-center'><td>float</td><td>Float</td></tr>
<tr class='text-center'><td>double</td><td>Double</td></tr>
<tr class='text-center'><td>char</td><td>Character</td></tr>
<tr class='text-center'><td>boolean</td><td>Boolean</td></tr>
</table>
              `
                            },
                            {
                                content: `
<h4>Autoboxing - Primitive to Object</h4>
<b>Autoboxing</b> is the automatic conversion of a primitive value into its wrapper object, done by the compiler. You don't have to write <b>new Integer(...)</b> yourself - simply assigning a primitive to a wrapper-typed variable is enough.<br>
              `,
                                codeExamples: [
                                    `public class AutoboxingDemo {
    public static void main(String[] args) {
        int a = 20;           // primitive
        Integer i = a;        // autoboxing: int -> Integer
        System.out.println(i);
    }
}
// OUTPUT:
// 20`
                                ]
                            },
                            {
                                content: `
<h4>Unboxing - Object to Primitive</h4>
<b>Unboxing</b> is the reverse: automatically converting a wrapper object back into its primitive value. This happens whenever a wrapper object is assigned to (or used as) a primitive.<br>
              `,
                                codeExamples: [
                                    `public class UnboxingDemo {
    public static void main(String[] args) {
        Integer i = 20;        // wrapper object
        int b = i;             // unboxing: Integer -> int
        System.out.println(b);
    }
}
// OUTPUT:
// 20`
                                ]
                            },
                            {
                                content: `
<h4>Useful Wrapper Methods</h4>
Wrapper classes ship with static helper methods that make conversions easy:<br><br>
1. <b>parseInt(String)</b> - converts a String into a primitive <b>int</b>.<br>
2. <b>valueOf(...)</b> - returns a wrapper object for a primitive or a String.<br>
3. <b>toString()</b> - returns the String representation of the wrapped value.<br>
              `,
                                codeExamples: [
                                    `public class WrapperMethodsDemo {
    public static void main(String[] args) {
        int x = Integer.parseInt("42");      // String -> primitive int
        Integer y = Integer.valueOf("42");   // String -> Integer object
        String s = y.toString();             // Integer -> String

        System.out.println(x);
        System.out.println(y);
        System.out.println(s);
    }
}
// OUTPUT:
// 42
// 42
// 42`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
<h4>Integer Caching (-128 to 127)</h4>
Java caches <b>Integer</b> objects for values from -128 to 127 (the <b>IntegerCache</b>). When autoboxing a value in that range, the same cached object is reused, so <b>==</b> comparison returns true. Outside that range, each autoboxed value creates a new heap object, so <b>==</b> returns false.<br>
              `,
                                codeExamples: [
                                    `public class IntegerCacheDemo {
    public static void main(String[] args) {
        Integer a = 100;
        Integer b = 100;
        System.out.println(a == b); // within cache range

        Integer c = 200;
        Integer d = 200;
        System.out.println(c == d); // outside cache range

        System.out.println(c.equals(d)); // value comparison, always correct
    }
}
// OUTPUT:
// true
// false
// true`
                                ]
                            },
                            {
                                content: `
<h4>NullPointerException Risk from Unboxing</h4>
A wrapper variable can legally hold <b>null</b>. But the moment that <b>null</b> is unboxed - used inside an <b>if</b> condition, in arithmetic, or as a method argument expecting a primitive - Java throws a <b>NullPointerException</b>. This is one of the most common real-world wrapper bugs, especially with fields that were never initialized or values missing from a database/map.<br>
              `,
                                codeExamples: [
                                    `public class UnboxingNpeDemo {
    public static void main(String[] args) {
        Integer count = null;

        try {
            int total = count + 1;   // unboxing null throws NPE
            System.out.println(total);
        } catch (NullPointerException e) {
            System.out.println("Caught: unboxing null in arithmetic");
        }

        Boolean flag = null;
        try {
            if (flag) {               // unboxing null Boolean throws NPE
                System.out.println("never reached");
            }
        } catch (NullPointerException e) {
            System.out.println("Caught: unboxing null in if condition");
        }
    }
}
// OUTPUT:
// Caught: unboxing null in arithmetic
// Caught: unboxing null in if condition`
                                ]
                            },
                            {
                                content: `
<h4>Autoboxing/Unboxing Cost in Loops</h4>
Using <b>Integer</b> instead of <b>int</b> inside a tight loop causes a new wrapper object to be created on every autobox, adding allocation and garbage-collection overhead that a primitive <b>int</b> never incurs. Prefer primitives for counters/accumulators and only box when an API (like Collections) requires an object.<br>
              `,
                                codeExamples: [
                                    `public class BoxingCostDemo {
    public static void main(String[] args) {
        Integer sum = 0;        // each += below autoboxes a new Integer
        for (int i = 0; i < 5; i++) {
            sum += i;             // unbox sum, add, autobox result again
        }
        System.out.println(sum);

        int fastSum = 0;         // no boxing at all, just primitive math
        for (int i = 0; i < 5; i++) {
            fastSum += i;
        }
        System.out.println(fastSum);
    }
}
// OUTPUT:
// 10
// 10`
                                ]
                            },
                            {
                                content: `
<h4>Wrapper Classes Are Immutable</h4>
Like <b>String</b>, wrapper objects can never change the value they hold once created. Reassigning a wrapper variable doesn't mutate the existing object - it points the reference at a brand-new object.<br>
              `,
                                codeExamples: [
                                    `public class WrapperImmutableDemo {
    public static void main(String[] args) {
        Integer original = 10;
        Integer reassigned = original;
        reassigned = reassigned + 5;   // creates a NEW Integer object

        System.out.println(original);    // unchanged
        System.out.println(reassigned);  // new object, new value
    }
}
// OUTPUT:
// 10
// 15`
                                ]
                            },
                            {
                                content: `
<h4>parseInt() vs valueOf() and NumberFormatException</h4>
<b>Integer.parseInt(String)</b> returns a primitive <b>int</b>. <b>Integer.valueOf(String)</b> returns a boxed <b>Integer</b> (using the cache when possible). Both throw <b>NumberFormatException</b> if the string isn't a valid number.<br>
              `,
                                codeExamples: [
                                    `public class ParseDemo {
    public static void main(String[] args) {
        int x = Integer.parseInt("42");     // primitive
        Integer y = Integer.valueOf("42");  // boxed, cached
        System.out.println(x);
        System.out.println(y);

        try {
            int bad = Integer.parseInt("abc");
        } catch (NumberFormatException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }
}
// OUTPUT:
// 42
// 42
// Caught: For input string: "abc"`
                                ]
                            },
                            {
                                content: `
<h4>Common Interview Traps</h4>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Trap</th><th>Why it happens</th></tr>
<tr class='text-center'><td>NullPointerException on unboxing null Integer in arithmetic</td><td>Integer x = null; int y = x + 1; unboxes null, throws NPE</td></tr>
<tr class='text-center'><td>== vs .equals() for wrappers</td><td>== compares references (only reliable inside the -128..127 cache); .equals() always compares values</td></tr>
<tr class='text-center'><td>Ternary autoboxing NPE</td><td>Mixing an int and an Integer in a ternary makes the result type int, so the Integer branch is unboxed. Only the branch actually chosen is evaluated, so the NPE happens only when the null wrapper is chosen. With flag = true the code below prints 1; set flag = false to see the NullPointerException</td></tr>
</table>
<br>
              `,
                                codeExamples: [
                                    `public class TernaryUnboxingTrap {
    public static void main(String[] args) {
        Integer nullable = null;
        boolean flag = true;

        try {
            // Ternary promotes both branches to int, forcing unboxing of 'nullable'
            int result = flag ? 1 : nullable;
            System.out.println(result);
        } catch (NullPointerException e) {
            System.out.println("Caught: ternary forced unboxing of null");
        }
    }
}
// OUTPUT:
// 1`
                                ]
                            },
                            {
                                content: `
<h4>Radix-Based Parsing and MIN_VALUE/MAX_VALUE Constants</h4>
Numeric wrapper classes accept an optional <b>radix</b> (base) argument in <b>parseInt()</b>/<b>valueOf()</b>, useful for parsing binary, octal, or hex strings. Every numeric wrapper also ships <b>MIN_VALUE</b>/<b>MAX_VALUE</b> constants describing its representable range.<br>
              `,
                                codeExamples: [
                                    `public class RadixAndRangeDemo {
    public static void main(String[] args) {
        int fromBinary = Integer.parseInt("101", 2);   // base-2
        int fromHex = Integer.parseInt("1F", 16);       // base-16

        System.out.println(fromBinary);
        System.out.println(fromHex);
        System.out.println(Integer.MIN_VALUE);
        System.out.println(Integer.MAX_VALUE);
    }
}
// OUTPUT:
// 5
// 31
// -2147483648
// 2147483647`
                                ]
                            },
                            {
                                content: `
<h4>Interview Questions</h4>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the 8 wrapper classes in Java?</td><td>Byte, Short, Integer, Long, Float, Double, Character, Boolean</td></tr>
<tr class='text-center'><td>Why do we need wrapper classes if we have primitives?</td><td>Collections/generics only work with objects, wrapper objects support useful methods, and only wrappers can hold null</td></tr>
<tr class='text-center'><td>What is autoboxing vs unboxing?</td><td>Autoboxing = compiler auto-converts primitive to wrapper; unboxing = compiler auto-converts wrapper back to primitive</td></tr>
<tr class='text-center'><td>What is the Integer cache?</td><td>Integer.valueOf() (used implicitly by autoboxing) reuses cached objects for values -128 to 127, so == works there but not for larger values</td></tr>
<tr class='text-center'><td>Are wrapper objects mutable?</td><td>No, they are immutable, just like String - every "change" creates a new object</td></tr>
<tr class='text-center'><td>What causes NPE with wrappers?</td><td>Unboxing a null wrapper reference, e.g. using it in arithmetic, an if condition, or a ternary expression</td></tr>
</table>
              `
                            }
                        ]
                    };
