import { Topic } from '../coreJava';

export const genericsInJava: Topic = {
    id: 'generics',
    name: 'Generics in Java',

    beginner: [
        {
            content: `<h4>Why Generics Exist</h4>
Before generics (pre-Java 5), collections stored plain <code>Object</code> references. That meant:<br><br>
• No compile-time type checking - you could put anything into a <code>List</code>.<br>
• Every read required an explicit, unsafe cast.<br>
• Mistakes only surfaced at <b>runtime</b> as a <code>ClassCastException</code>, often far from where the bad value was inserted.<br><br>
<b>Generics</b> let a class or method be parameterized by a <b>type</b>, so the compiler enforces correctness before the program ever runs.<br>`,
            codeExamples: [
                `import java.util.ArrayList;
import java.util.List;

public class WithoutGenerics {
    public static void main(String[] args) {
        List list = new ArrayList();   // raw type - no type safety
        list.add("Java");
        list.add(100);                  // compiles fine - allowed to mix types!

        String s = (String) list.get(0); // must cast manually
        System.out.println(s);

        try {
            String bad = (String) list.get(1); // runtime failure, not compile-time
        } catch (ClassCastException e) {
            System.out.println("ClassCastException at runtime: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Java
// ClassCastException at runtime: class java.lang.Integer cannot be cast to class java.lang.String`
            ]
        },
        {
            content: `<h4>Generics Fix This at Compile Time</h4>
With a generic type like <code>List&lt;String&gt;</code>, the compiler rejects an incompatible <code>add()</code> call outright, and no cast is needed on read - the compiler inserts the cast for you invisibly and guarantees it will succeed.<br>`,
            codeExamples: [
                `import java.util.ArrayList;
import java.util.List;

public class WithGenerics {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("Java");
        // list.add(100);   // COMPILE ERROR: incompatible types

        String s = list.get(0); // no cast needed
        System.out.println(s);
    }
}
// OUTPUT:
// Java`
            ]
        },
        {
            content: `<h4>Generic Classes</h4>
A class can declare its own type parameter (conventionally a single uppercase letter like <code>T</code>) in angle brackets, and use it as if it were a real type throughout the class body.<br>`,
            codeExamples: [
                `public class Box<T> {
    private T value;

    public void set(T value) { this.value = value; }
    public T get() { return value; }

    public static void main(String[] args) {
        Box<String> stringBox = new Box<>();
        stringBox.set("Hello");
        System.out.println(stringBox.get());

        Box<Integer> intBox = new Box<>();
        intBox.set(42);
        System.out.println(intBox.get());
    }
}
// OUTPUT:
// Hello
// 42`
            ]
        },
        {
            content: `<h4>Generic Methods</h4>
A single method can be generic even inside a non-generic class - the type parameter is declared right before the return type. The compiler usually infers <code>T</code> automatically from the argument, so you rarely need to specify it explicitly.<br>`,
            codeExamples: [
                `public class Test {

    public static <T> void printArray(T[] array) {
        for (T element : array) {
            System.out.print(element + " ");
        }
        System.out.println();
    }

    public static void main(String[] args) {
        Integer[] nums = {1, 2, 3};
        String[] words = {"Java", "Generics"};
        printArray(nums);
        printArray(words);
    }
}
// OUTPUT:
// 1 2 3
// Java Generics`
            ]
        },
        {
            content: `<h4>Bounded Type Parameters</h4>
<code>&lt;T extends Number&gt;</code> restricts <code>T</code> to <code>Number</code> or any of its subclasses (<code>Integer</code>, <code>Double</code>, etc.) - despite the keyword <code>extends</code>, this also works for bounding to an interface. This lets the generic code call <code>Number</code> methods like <code>doubleValue()</code> on values of type <code>T</code>, which plain <code>&lt;T&gt;</code> would not allow.<br>`,
            codeExamples: [
                `public class Calculator<T extends Number> {

    public double add(T a, T b) {
        return a.doubleValue() + b.doubleValue(); // only possible because T is bounded to Number
    }

    public static void main(String[] args) {
        Calculator<Integer> intCalc = new Calculator<>();
        System.out.println(intCalc.add(3, 4));

        Calculator<Double> doubleCalc = new Calculator<>();
        System.out.println(doubleCalc.add(2.5, 1.5));

        // Calculator<String> bad = new Calculator<>(); // COMPILE ERROR: String is not a Number
    }
}
// OUTPUT:
// 7.0
// 4.0`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Wildcards - ?, ? extends T, ? super T</h3>
A wildcard is used when the exact type parameter doesn't matter, only a relationship to it does. There are three forms:<br><br>
• <code>List&lt;?&gt;</code> - unbounded wildcard, "a list of some unknown type."<br>
• <code>List&lt;? extends T&gt;</code> - upper-bounded, "a list of T or any subtype" - you can safely <b>read</b> T out of it, but cannot add anything (the compiler doesn't know the exact subtype).<br>
• <code>List&lt;? super T&gt;</code> - lower-bounded, "a list of T or any supertype" - you can safely <b>write</b> T into it, but reads only guarantee an <code>Object</code>.<br>`,
            codeExamples: [
                `import java.util.List;
import java.util.ArrayList;

public class WildcardDemo {

    // Producer: only reading from the list -> use "extends"
    static double sumOfList(List<? extends Number> list) {
        double sum = 0;
        for (Number n : list) sum += n.doubleValue();
        // list.add(10); // COMPILE ERROR: cannot add to a "? extends Number" list
        return sum;
    }

    // Consumer: only writing into the list -> use "super"
    static void addIntegers(List<? super Integer> list) {
        list.add(1);
        list.add(2);
        // Integer x = list.get(0); // COMPILE ERROR: only guaranteed to be Object
    }

    public static void main(String[] args) {
        List<Integer> ints = List.of(1, 2, 3);
        System.out.println(sumOfList(ints));

        List<Number> numbers = new ArrayList<>();
        addIntegers(numbers);
        System.out.println(numbers);
    }
}
// OUTPUT:
// 6.0
// [1, 2]`
            ]
        },
        {
            content: `<h3>PECS - Producer Extends, Consumer Super</h3>
PECS is the standard mnemonic (from <b>Effective Java</b>) for choosing between <code>extends</code> and <code>super</code>:<br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">If the parameterized type PRODUCES values you read -> use extends
If the parameterized type CONSUMES values you write -> use super
If it does both (read AND write)                    -> don't use a wildcard at all</pre>

<code>Collections.copy(List&lt;? super T&gt; dest, List&lt;? extends T&gt; src)</code> from the JDK is the textbook example: <code>src</code> only produces values (extends), <code>dest</code> only consumes them (super).<br>`
        },
        {
            content: `<h3>Type Erasure - The Runtime Reality</h3>
Java generics are implemented via <b>type erasure</b>: generic type information exists only at <b>compile time</b> for type-checking, and is then stripped ("erased") from the bytecode. At runtime, <code>List&lt;String&gt;</code> and <code>List&lt;Integer&gt;</code> are literally the same class: <code>List</code>.<br><br>
This has real consequences:<br>
• You <b>cannot</b> do <code>new T()</code> or <code>new T[10]</code> inside a generic class - the JVM doesn't know what <code>T</code> actually is at runtime.<br>
• <code>instanceof</code> cannot check a parameterized type: <code>obj instanceof List&lt;String&gt;</code> is a compile error; only <code>obj instanceof List&lt;?&gt;</code> is allowed.<br>
• Two generic instantiations are equal via <code>getClass()</code> at runtime, even though the compiler treated them as different types.<br>`,
            codeExamples: [
                `import java.util.ArrayList;
import java.util.List;

public class ErasureDemo {
    public static void main(String[] args) {
        List<String> strings = new ArrayList<>();
        List<Integer> integers = new ArrayList<>();

        System.out.println(strings.getClass() == integers.getClass()); // same erased class at runtime

        // System.out.println(strings instanceof List<String>); // COMPILE ERROR
        System.out.println(strings instanceof List<?>);
    }
}
// OUTPUT:
// true
// true`
            ]
        },
        {
            content: `<h3>Raw Types - Legacy Compatibility, Not Recommended</h3>
A <b>raw type</b> is a generic class used without its type parameter (e.g. plain <code>List</code> instead of <code>List&lt;String&gt;</code>). Raw types exist purely for <b>backward compatibility</b> with pre-Java-5 code, and using them today produces an "unchecked" compiler warning and throws away all of generics' compile-time safety.<br>`,
            codeExamples: [
                `import java.util.ArrayList;
import java.util.List;

public class RawTypeDemo {
    public static void main(String[] args) {
        List raw = new ArrayList();     // raw type: unchecked warning
        raw.add("Java");
        raw.add(42);                     // compiles - no type checking at all

        List<String> typed = raw;        // unchecked assignment warning
        // Fails only when actually read as a String:
        try {
            for (Object o : typed) {
                String s = (String) o;   // implicit cast fails on the Integer
                System.out.println(s);
            }
        } catch (ClassCastException e) {
            System.out.println("Failed at runtime due to raw type mixing: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Java
// Failed at runtime due to raw type mixing: class java.lang.Integer cannot be cast to class java.lang.String`
            ]
        },
        {
            content: `<h3>Multiple Bounds</h3>
A type parameter can be bounded by <b>one class and multiple interfaces</b> at once, joined with <code>&amp;</code> - the class (if any) must come first.<br>`,
            codeExamples: [
                `public class Test {

    interface Named { String getName(); }

    static <T extends Number & Named> void describe(T value) {
        System.out.println(value.getName() + " = " + value.doubleValue());
    }

    static class Score extends Number implements Named {
        private final double value;
        private final String name;
        Score(double value, String name) { this.value = value; this.name = name; }
        public String getName() { return name; }
        public int intValue() { return (int) value; }
        public long longValue() { return (long) value; }
        public float floatValue() { return (float) value; }
        public double doubleValue() { return value; }
    }

    public static void main(String[] args) {
        describe(new Score(95.5, "Midterm"));
    }
}
// OUTPUT:
// Midterm = 95.5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem do generics solve?</td><td>They move type-checking from runtime (ClassCastException) to compile time, and remove the need for manual casts</td></tr>
<tr class='text-center'><td>What is type erasure?</td><td>The compiler enforces generic type rules at compile time, then strips the type parameters from the bytecode - List&lt;String&gt; and List&lt;Integer&gt; are the same class at runtime</td></tr>
<tr class='text-center'><td>Why can't you write "new T()" inside a generic class?</td><td>Because of type erasure, the JVM has no runtime knowledge of what T actually is, so it cannot allocate an instance of it</td></tr>
<tr class='text-center'><td>What does PECS mean?</td><td>Producer Extends, Consumer Super - use "? extends T" for a source you only read from, "? super T" for a destination you only write to</td></tr>
<tr class='text-center'><td>Why can't you add to a List&lt;? extends Number&gt;?</td><td>The compiler only knows it's "some subtype of Number," not which one, so it can't guarantee any specific value you add would be type-compatible</td></tr>
<tr class='text-center'><td>What's a raw type and why avoid it?</td><td>A generic type used without its parameter (e.g. plain List) - it exists only for legacy compatibility and disables all generic type-safety, producing unchecked warnings</td></tr>
</table>`
        }
    ]
};
