import { Topic } from '../coreJava';

export const dataConcept: Topic = {
    id: 'data-concept',
    name: 'Data',
    beginner: [
        {
            content: `<h3>What is Data?</h3>
Data is any piece of information a program works with - numbers, text, true/false answers, dates, images, and so on. A program's job, at its core, is to take some data in, transform it, and produce new data out. <br><br>
In Java, every piece of data has a <strong>type</strong>, which tells the compiler what kind of values are allowed and what operations make sense on it.<br>`,
            codeExamples: [`public class WhatIsData {
    public static void main(String[] args) {
        int quantity = 5;          // numeric data
        String item = "Notebook";   // text data
        boolean inStock = true;     // true/false data

        System.out.println(quantity + " x " + item + " in stock: " + inStock);
    }
}
// OUTPUT:
// 5 x Notebook in stock: true`]
        },
        {
            content: `<h3>Primitive Data Types</h3>
Java has 8 built-in "primitive" types for the most basic kinds of data - whole numbers, decimals, single characters, and booleans. They hold raw values directly, not references.<br>`,
            codeExamples: [`public class PrimitiveTypes {
    public static void main(String[] args) {
        int wholeNumber = 42;
        double decimalNumber = 3.14;
        char letter = 'A';
        boolean flag = false;

        System.out.println(wholeNumber + " " + decimalNumber + " " + letter + " " + flag);
    }
}
// OUTPUT:
// 42 3.14 A false`]
        },
        {
            content: `<h3>Reference (Object) Data</h3>
Beyond primitives, data can also be an <strong>object</strong> - a bundle of related values and behavior, like a String (text), an array (a list of values), or a custom class (e.g. Student). These are called "reference types" because the variable holds a pointer to the data, not the data itself.<br>`,
            codeExamples: [`public class ObjectData {
    public static void main(String[] args) {
        String name = "Raghunath";        // object: a sequence of characters
        int[] marks = {90, 85, 88};    // object: a collection of ints

        System.out.println("Name: " + name);
        System.out.println("First mark: " + marks[0]);
    }
}
// OUTPUT:
// Name: Raghunath
// First mark: 90`]
        },
        {
            content: `<h3>Why Data Types Matter</h3>
The type of data determines how much memory it needs and what operations are valid. You can add two numbers, but adding a number and a boolean directly makes no sense - the compiler catches this kind of mistake for you before the program ever runs.<br>`,
            codeExamples: [`public class WhyTypesMatter {
    public static void main(String[] args) {
        int a = 10;
        int b = 20;
        System.out.println("Sum: " + (a + b)); // valid: number + number

        boolean isReady = true;
        // int bad = a + isReady; // COMPILE ERROR: cannot add int and boolean
        System.out.println("isReady: " + isReady);
    }
}
// OUTPUT:
// Sum: 30
// isReady: true`]
        },
    ],
    expert: [
        {
            content: `<h3>Primitive vs Reference Data - Where It Lives</h3>
This distinction drives almost everything about how Java manages memory and passes data around.<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Primitive Data</th><th>Reference (Object) Data</th></tr>
<tr class='text-center'><td>Examples</td><td>int, double, char, boolean, long, float, byte, short</td><td>String, arrays, custom classes, wrapper classes</td></tr>
<tr class='text-center'><td>Storage</td><td>Actual value stored directly in the variable's slot</td><td>Variable holds a reference (address); actual data lives on the heap</td></tr>
<tr class='text-center'><td>Default value (as field)</td><td>0 / 0.0 / false / '\\u0000'</td><td>null</td></tr>
<tr class='text-center'><td>Copy behavior</td><td>Assignment copies the value</td><td>Assignment copies the reference (both point to same object)</td></tr>
</table>`,
            codeExamples: [`public class PrimitiveVsReference {
    public static void main(String[] args) {
        int x = 5;
        int y = x;      // copies the VALUE
        y = 99;
        System.out.println("x=" + x + " y=" + y); // x untouched

        int[] arr1 = {1, 2, 3};
        int[] arr2 = arr1; // copies the REFERENCE
        arr2[0] = 99;
        System.out.println("arr1[0]=" + arr1[0]); // arr1 IS affected
    }
}
// OUTPUT:
// x=5 y=99
// arr1[0]=99`]
        },
        {
            content: `<h3>The 8 Primitive Types - Size and Range</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Size</th><th>Typical Use</th></tr>
<tr class='text-center'><td>byte</td><td>1 byte</td><td>Small integers, memory-tight arrays</td></tr>
<tr class='text-center'><td>short</td><td>2 bytes</td><td>Rarely used, legacy interop</td></tr>
<tr class='text-center'><td>int</td><td>4 bytes</td><td>Default choice for whole numbers</td></tr>
<tr class='text-center'><td>long</td><td>8 bytes</td><td>Very large whole numbers (timestamps, IDs)</td></tr>
<tr class='text-center'><td>float</td><td>4 bytes</td><td>Decimal numbers, low precision needs</td></tr>
<tr class='text-center'><td>double</td><td>8 bytes</td><td>Default choice for decimal numbers</td></tr>
<tr class='text-center'><td>char</td><td>2 bytes</td><td>A single Unicode character</td></tr>
<tr class='text-center'><td>boolean</td><td>JVM-dependent (conceptually 1 bit)</td><td>true/false flags</td></tr>
</table>`,
            codeExamples: [`public class TypeSizes {
    public static void main(String[] args) {
        System.out.println("int range: " + Integer.MIN_VALUE + " to " + Integer.MAX_VALUE);
        System.out.println("byte range: " + Byte.MIN_VALUE + " to " + Byte.MAX_VALUE);
    }
}
// OUTPUT:
// int range: -2147483648 to 2147483647
// byte range: -128 to 127`]
        },
        {
            content: `<h3>Wrapper Classes: Bridging Primitives and Objects</h3>
Since primitives are not objects, Java provides a wrapper class for each one (int -> Integer, double -> Double, etc.) so primitive data can be used where objects are required - like in collections (List&lt;Integer&gt;). <strong>Autoboxing</strong> and <strong>unboxing</strong> convert between the two automatically.<br>`,
            codeExamples: [`import java.util.ArrayList;
import java.util.List;

public class WrapperDemo {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(); // List can't hold primitive int directly
        numbers.add(10);   // autoboxing: int 10 -> Integer.valueOf(10)
        numbers.add(20);

        int total = numbers.get(0) + numbers.get(1); // unboxing: Integer -> int
        System.out.println("Total: " + total);
    }
}
// OUTPUT:
// Total: 30`]
        },
        {
            content: `<h3>Type Conversion: Widening vs Narrowing</h3>
Data of one type can often be converted to another. Widening (small type -> big type) happens automatically because no data is lost. Narrowing (big type -> small type) requires an explicit cast because precision or range can be lost.<br>`,
            codeExamples: [`public class TypeConversion {
    public static void main(String[] args) {
        int wholeNumber = 100;
        double widened = wholeNumber; // widening: automatic, no data loss
        System.out.println("Widened: " + widened);

        double preciseValue = 9.99;
        int narrowed = (int) preciseValue; // narrowing: explicit cast, fraction is lost
        System.out.println("Narrowed: " + narrowed);
    }
}
// OUTPUT:
// Widened: 100.0
// Narrowed: 9`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between primitive and reference data types?</td><td>Primitives store the actual value directly; references store the address of an object living on the heap</td></tr>
<tr class='text-center'><td>Why does Java need wrapper classes?</td><td>To let primitive values be treated as objects, e.g. for use in generic collections like List&lt;Integer&gt;</td></tr>
<tr class='text-center'><td>What is autoboxing?</td><td>The compiler's automatic conversion of a primitive value into its corresponding wrapper object</td></tr>
<tr class='text-center'><td>Why is a narrowing conversion required to be explicit?</td><td>Because it can lose data (precision or range), so the compiler forces the programmer to acknowledge the risk with a cast</td></tr>
<tr class='text-center'><td>What is the default value of an uninitialized boolean instance field?</td><td>false</td></tr>
<tr class='text-center'><td>Is String a primitive type in Java?</td><td>No - String is a reference type (a class), even though it behaves like a value type in many ways</td></tr>
<tr class='text-center'><td>What happens if you assign a double literal to an int variable directly?</td><td>Compile error - it's a narrowing conversion and requires an explicit cast</td></tr>
</table>`
        },
    ],
};
