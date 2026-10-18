import { Topic } from '../coreJava';

export const dataTypesAndVariables: Topic = {
                        id: 'data-types',
                        name: 'Data Types and Variables',
                        beginner: [
                            {
                                content: `<h3>What is a Variable?</h3>
A variable is a named container that holds a value in memory. In Java, every variable must be declared with a <strong>type</strong> before it is used - Java is a <strong>statically typed</strong> language, so once a variable's type is fixed, it cannot hold a value of a different type.<br><br>
Declaring a variable follows the pattern: <code>type name = value;</code><br>
For example: <code>int age = 25;</code> declares a variable named <code>age</code> of type <code>int</code> and initializes it with the value 25.<br>`
                            },
                            {
                                content: `<h3>The 8 Primitive Data Types</h3>
Java has exactly <strong>8 primitive data types</strong>, split into 4 categories - integers, floating-point numbers, characters, and boolean:<br><br>

• <strong>byte</strong>: 8-bit integer (-128 to 127)<br>
• <strong>short</strong>: 16-bit integer (-32,768 to 32,767)<br>
• <strong>int</strong>: 32-bit integer (-2³¹ to 2³¹-1) - the default choice for whole numbers<br>
• <strong>long</strong>: 64-bit integer (-2⁶³ to 2⁶³-1) - for very large whole numbers<br>
• <strong>float</strong>: 32-bit floating point (decimal) number<br>
• <strong>double</strong>: 64-bit floating point (decimal) number - the default choice for decimals<br>
• <strong>char</strong>: a single 16-bit Unicode character<br>
• <strong>boolean</strong>: true or false only<br>`
                            },
                            {
                                content: `<h4>Declaring Integer Types: byte, short, int, long</h4>
Whole numbers are stored using <code>byte</code>, <code>short</code>, <code>int</code>, or <code>long</code>, depending on how large the value can get. A <code>long</code> literal needs an <code>L</code> suffix so the compiler knows it isn't a (smaller) int.<br>`,
                                codeExamples: [
                                    `public class IntegerTypesDemo {
    public static void main(String[] args) {
        byte age = 25;
        short year = 2026;
        int population = 100000;
        long distanceToSun = 149600000000L; // L suffix required for large values

        System.out.println("byte age: " + age);
        System.out.println("short year: " + year);
        System.out.println("int population: " + population);
        System.out.println("long distanceToSun: " + distanceToSun);
    }
}
// OUTPUT:
// byte age: 25
// short year: 2026
// int population: 100000
// long distanceToSun: 149600000000`
                                ]
                            },
                            {
                                content: `<h4>Declaring float, double, char, and boolean</h4>
Decimal numbers use <code>float</code> or <code>double</code>, single characters use <code>char</code> (in single quotes), and true/false values use <code>boolean</code>. A <code>float</code> literal needs an <code>f</code> suffix, otherwise the compiler treats any decimal literal as a <code>double</code>.<br>`,
                                codeExamples: [
                                    `public class OtherTypesDemo {
    public static void main(String[] args) {
        float rate = 3.5f;      // f suffix required
        double price = 99.99;   // decimal literals default to double
        char grade = 'A';       // single character, single quotes
        boolean isActive = true;

        System.out.println("float rate: " + rate);
        System.out.println("double price: " + price);
        System.out.println("char grade: " + grade);
        System.out.println("boolean isActive: " + isActive);
    }
}
// OUTPUT:
// float rate: 3.5
// double price: 99.99
// char grade: A
// boolean isActive: true`
                                ]
                            },
                            {
                                content: `<h3>Primitive Types at a Glance</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Size</th><th>Range / Values</th><th>Default</th></tr>
<tr class='text-center'><td>byte</td><td>8 bits</td><td>-128 to 127</td><td>0</td></tr>
<tr class='text-center'><td>short</td><td>16 bits</td><td>-32,768 to 32,767</td><td>0</td></tr>
<tr class='text-center'><td>int</td><td>32 bits</td><td>-2³¹ to 2³¹-1</td><td>0</td></tr>
<tr class='text-center'><td>long</td><td>64 bits</td><td>-2⁶³ to 2⁶³-1</td><td>0L</td></tr>
<tr class='text-center'><td>float</td><td>32 bits</td><td>IEEE 754 floating-point</td><td>0.0f</td></tr>
<tr class='text-center'><td>double</td><td>64 bits</td><td>IEEE 754 floating-point</td><td>0.0d</td></tr>
<tr class='text-center'><td>char</td><td>16 bits</td><td>\\u0000 to \\uFFFF</td><td>'\\u0000'</td></tr>
<tr class='text-center'><td>boolean</td><td>JVM-specific</td><td>true / false</td><td>false</td></tr>
</table>
<br>
This is exactly what a compiler-generated (default) constructor fills instance variables with when you don't assign them a value yourself - 0 for numbers, false for boolean, and null for objects.<br>`
                            },
                            {
                                content: `<h3>Primitive vs Reference (Non-Primitive) Types</h3>
Java data types fall into two families:<br><br>

• <strong>Primitive types</strong> (the 8 above) directly hold their value in memory.<br>
• <strong>Reference types</strong> - String, arrays, and every class/interface/enum - hold a reference (pointer) to an object stored elsewhere in memory. The 8 primitive types each have a matching <strong>wrapper class</strong> that lets them be treated as objects when needed: <code>Byte</code>, <code>Short</code>, <code>Integer</code>, <code>Long</code>, <code>Float</code>, <code>Double</code>, <code>Character</code>, <code>Boolean</code>.<br><br>

A key visible difference: an uninitialized reference-type field defaults to <code>null</code> (no object assigned), while an uninitialized primitive defaults to a zero-like value.<br>`,
                                codeExamples: [
                                    `public class PrimitiveVsReferenceDemo {
    int score;           // primitive - default value
    String name;         // reference - default value

    public static void main(String[] args) {
        PrimitiveVsReferenceDemo obj = new PrimitiveVsReferenceDemo();
        System.out.println("score (primitive): " + obj.score);
        System.out.println("name (reference): " + obj.name);

        int a = 10;          // holds the value directly
        Integer b = 10;      // wrapper object holding an int
        String text = "Java"; // reference type

        System.out.println("a: " + a);
        System.out.println("b: " + b);
        System.out.println("text: " + text);
    }
}
// OUTPUT:
// score (primitive): 0
// name (reference): null
// a: 10
// b: 10
// text: Java`
                                ]
                            },
                            {
                                content: `<h3>1. Definition</h3>
• A <b>data type</b> tells Java what kind of value a box can hold and how much memory that box needs. <br>
• A <b>variable</b> is the named box itself. You give it a name, a type and a value. <br>
• Java is <b>statically typed</b>. You must declare the type first, and the compiler checks every use of it. <br>
• There are two families. <b>Primitive types</b> hold the value directly: byte, short, int, long, float, double, char, boolean. <b>Reference types</b> hold the address of an object: String, arrays, classes, interfaces, enums. <br><br>

<h3>2. Purpose of This Topic</h3>
• To let the compiler <b>reserve the right amount of memory</b>. An int needs 4 bytes, a long needs 8. <br>
• To <b>catch mistakes at compile time</b> instead of at run time in a live bank screen. <br>
• To decide <b>which operations are legal</b>. You can divide two ints, you cannot divide two booleans. <br>
• To make code <b>self documenting</b>. When you read double gstAmount you already know it holds a decimal. <br><br>

<h3>3. Need of This Topic</h3>
• Every single Java program starts with variables, so this is the first door you must walk through. <br>
• Choosing a wrong type causes real bugs, like storing an Aadhaar number in an int and losing digits. <br>
• Money handled in double gives wrong paise. Indian billing systems must know this from day one. <br>
• Later topics like arrays, methods, collections and generics all sit on top of types. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: types, variables and why the type matters
// College fee counter for a Pune engineering college

public class FeeCounterDemo {

    public static void main(String[] args) {

        // POINT 1: primitive types hold the value directly
        int studentId = 101;                 // 4 bytes, whole number
        long aadhaarNumber = 987612345678L;  // 8 bytes, note the L suffix
        double marksPercent = 78.45;         // decimal
        char section = 'A';                  // single character
        boolean feePaid = true;              // only true or false

        // POINT 1: reference type, holds the address of an object
        String studentName = "Ananya Kulkarni";

        // POINT 2: WRONG. An Aadhaar number does not fit in an int.
        // int wrongAadhaar = 987612345678;  // compile error: integer number too large

        // POINT 2: RIGHT. Use long for very large whole numbers.
        System.out.println("Aadhaar stored safely: " + aadhaarNumber);

        // POINT 3: WRONG. Money in double loses paise.
        double wrongFee = 0.1 + 0.2;
        System.out.println("WRONG money maths: " + wrongFee);

        // POINT 3: RIGHT for display maths, count in paise as a long.
        long paise = 10 + 20;
        System.out.println("RIGHT money in paise: " + paise);

        System.out.println("Student " + studentId + " " + studentName);
        System.out.println("Section " + section + ", marks " + marksPercent + "%");
        System.out.println("Fee paid: " + feePaid);
    }
}
// OUTPUT:
// Aadhaar stored safely: 987612345678
// WRONG money maths: 0.30000000000000004
// RIGHT money in paise: 30
// Student 101 Ananya Kulkarni
// Section A, marks 78.45%
// Fee paid: true`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
• <b>Errors are caught early.</b> The compiler refuses wrong assignments before the code ever runs. <br>
• <b>Memory is used well.</b> A byte for age uses 1 byte instead of 4, which matters in large arrays. <br>
• <b>Speed.</b> Primitives sit in the stack and need no object header, so loops over them are fast. <br>
• <b>Readable code.</b> The type acts like a small piece of documentation on every line. <br>
• <b>Tool support.</b> Your IDE can autocomplete and refactor safely because it knows every type. <br><br>

<h3>5. Disadvantages</h3>
• <b>More typing.</b> You must write the type everywhere, although var helps for local variables. <br>
• <b>Overflow is silent.</b> An int that crosses its limit wraps around instead of throwing an error. <br>
• <b>float and double are not exact.</b> They are wrong for money and for equality checks. <br>
• <b>Two worlds.</b> Primitives and their wrapper classes behave differently, which confuses beginners. <br>
• <b>Default values hide bugs.</b> A field left as 0 or null may look like real data. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5: the good side and the traps
// Bank interest calculation for a small co operative bank

public class TypeAdvantageDemo {

    // POINT 5: fields get default values, this can hide a bug
    static int pendingLoans;        // defaults to 0
    static String branchName;       // defaults to null

    public static void main(String[] args) {

        // ADVANTAGE 4: memory saving, age never crosses 127
        byte customerAge = 34;
        System.out.println("Age in 1 byte: " + customerAge);

        // ADVANTAGE 4: the compiler stops a wrong assignment
        // int wrong = "12345";   // WRONG: incompatible types, caught at compile time
        int rightValue = 12345;   // RIGHT
        System.out.println("Compiler checked value: " + rightValue);

        // DISADVANTAGE 5: silent overflow
        int maxInt = Integer.MAX_VALUE;
        System.out.println("Max int      : " + maxInt);
        System.out.println("WRONG max + 1: " + (maxInt + 1));   // wraps to negative
        long safeSum = (long) maxInt + 1;                        // RIGHT
        System.out.println("RIGHT as long: " + safeSum);

        // DISADVANTAGE 5: double is not exact
        double balance = 1000.10 - 1000.00;
        System.out.println("WRONG double diff: " + balance);
        long balancePaise = 100010 - 100000;                     // RIGHT, count paise
        System.out.println("RIGHT paise diff : " + balancePaise);

        // DISADVANTAGE 5: defaults look like real data
        System.out.println("Pending loans (default): " + pendingLoans);
        System.out.println("Branch name (default)  : " + branchName);
    }
}
// OUTPUT:
// Age in 1 byte: 34
// Compiler checked value: 12345
// Max int      : 2147483647
// WRONG max + 1: -2147483648
// RIGHT as long: 2147483648
// WRONG double diff: 0.10000000002037268
// RIGHT paise diff : 10
// Pending loans (default): 0
// Branch name (default)  : null`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>IRCTC ticket booking:</b> pnrNumber is a long, seatNumber is an int, coach is a char and isTatkal is a boolean. <br>
• <b>SBI net banking:</b> balance is never a double. It is stored as paise in a long, or as BigDecimal. <br>
• <b>Swiggy order screen:</b> orderId is a long, itemCount is an int, rating is a float and address is a String. <br>
• <b>College attendance portal:</b> a boolean array of 100 entries marks present or absent for one lecture. <br>
• <b>Global example, an airline system:</b> flightNumber is a String because it has letters, like AI 302. <br>
• <b>Weather app:</b> temperature is a double because 28.6 degrees needs the decimal part. <br><br>

<b>Simple rule for students:</b> whole numbers use int, big whole numbers use long, decimals for science use double, money uses long paise or BigDecimal, yes or no uses boolean, and text uses String.`,
                                codeExamples: [
                                    `// Point 6: one small train booking record using the right type for each field

public class TrainBookingDemo {

    public static void main(String[] args) {

        // REAL TIME: IRCTC style booking record
        long pnrNumber = 4512789034L;      // too big for int, so long
        String passengerName = "Raghunath Verma";
        int age = 27;                      // int is enough
        char coach = 'B';                  // one character
        int seatNumber = 42;
        boolean tatkal = false;
        long fareInPaise = 145050L;        // Rs 1450.50 stored as paise
        double journeyHours = 12.5;        // decimal is fine here

        System.out.println("PNR       : " + pnrNumber);
        System.out.println("Passenger : " + passengerName + ", age " + age);
        System.out.println("Seat      : " + coach + "-" + seatNumber);
        System.out.println("Tatkal    : " + tatkal);

        // RIGHT: convert paise back to rupees only when printing
        long rupees = fareInPaise / 100;
        long paisePart = fareInPaise % 100;
        System.out.println("Fare      : Rs " + rupees + "." + paisePart);

        System.out.println("Duration  : " + journeyHours + " hours");

        // WRONG way that many beginners try
        // double fare = 1450.50;
        // System.out.println(fare * 3);   // risky: double drifts on other fares

        // RIGHT way for three tickets
        long threeTickets = fareInPaise * 3;
        System.out.println("Three tickets: Rs " + (threeTickets / 100)
                + "." + (threeTickets % 100));
    }
}
// OUTPUT:
// PNR       : 4512789034
// Passenger : Raghunath Verma, age 27
// Seat      : B-42
// Tatkal    : false
// Fare      : Rs 1450.50
// Duration  : 12.5 hours
// Three tickets: Rs 4351.50`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `Memory management, immutability, and performance considerations for data types:<br>

<h4>Memory Allocation:</h4>

• Primitive LOCAL variables: stored in the stack frame. Primitive FIELDS live inside their object on the heap (or with the class, for statics)<br>
• Objects: Stored in heap (slower access)<br>
• String Pool: Special memory region for strings<br><br>

<h3>Immutability:</h3>

<h4>Wrapper classes and String are immutable for: </h4>

• Thread safety<br>
• Security<br>
• Performance (caching)<br>

<h4>Performance Considerations:</h4>

• Use primitives when possible (less memory overhead)<br>
• Avoid unnecessary boxing/unboxing<br>
• String concatenation: Use StringBuilder for loops<br>
• Consider memory footprint in large collections<br>`,
                                codeExamples: [
                                    `// Performance Comparison
public class PerformanceExample {
    public static void main(String[] args) {
        // Bad: Using Integer in performance-critical code
        long start = System.nanoTime();
        Integer sum1 = 0;
        for (int i = 0; i < 1000000; i++) {
            sum1 += i; // Autoboxing overhead
        }
        long end = System.nanoTime();
        System.out.println("With Integer: " + (end - start) + " ns");

        // Good: Using primitive int
        start = System.nanoTime();
        int sum2 = 0;
        for (int i = 0; i < 1000000; i++) {
            sum2 += i;
        }
        end = System.nanoTime();
        System.out.println("With int: " + (end - start) + " ns");
    }
}
// OUTPUT (timings vary by machine):
// With Integer: 4800000 ns
// With int: 1200000 ns`
                                ]
                            },
                            {
                                content: `<h3>Java Data Types — The Full Hierarchy</h3>
Java data types split into two families:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                    Java Data Types
                           |
              +------------+------------+
              |                         |
         Primitive                 Reference
          Types                     Types
              |                         |
       +------+------+          +-------+--------+
       |             |          |                |
   Numeric       Boolean      Classes         Interfaces
       |
  +----+-----+
  |          |
Integral   Floating
  |          |
byte       float
short      double
int
long
char</pre>

The JLS guarantees the range/semantics of each primitive type, but does not mandate one fixed physical memory size for every variable (e.g. boolean's exact bit representation is JVM-implementation-specific).<br>`,
                                codeExamples: [
                                    `public class DataTypeRanges {
    public static void main(String[] args) {
        byte b = 10;
        short s = 2026;
        int i = 100000;
        long l = 9000000000L;
        float f = 99.50f;
        double d = 50000.75;
        char c = 'A';
        boolean flag = true;

        System.out.println("byte: " + b);
        System.out.println("short: " + s);
        System.out.println("int: " + i);
        System.out.println("long: " + l);
        System.out.println("float: " + f);
        System.out.println("double: " + d);
        System.out.println("char: " + c);
        System.out.println("boolean: " + flag);
    }
}
// OUTPUT:
// byte: 10
// short: 2026
// int: 100000
// long: 9000000000
// float: 99.5
// double: 50000.75
// char: A
// boolean: true`
                                ]
                            },
                            {
                                content: `<h3>Literal Suffixes — Why L, f, and d Matter</h3>
By default, an integer literal (e.g. <code>10</code>) is typed as <code>int</code>, and a decimal literal (e.g. <code>19.99</code>) is typed as <code>double</code>. The <code>L</code>/<code>l</code> suffix marks a <code>long</code> literal, and the <code>f</code>/<code>F</code> suffix marks a <code>float</code> literal - the <code>d</code>/<code>D</code> suffix for <code>double</code> is legal but optional since it's already the default. Skipping a required suffix is a compile-time error, not a runtime one.<br>`,
                                codeExamples: [
                                    `public class LiteralSuffixDemo {
    public static void main(String[] args) {
        long bigNumber = 10000000000L; // L required: 10000000000 overflows int's range
        float price = 19.99f;          // f required: 19.99 is a double literal by default
        double amount = 19.99;         // d/D optional: decimal literals already default to double

        System.out.println(bigNumber);
        System.out.println(price);
        System.out.println(amount);

        // long bad = 10000000000;  // COMPILE ERROR: integer literal out of range for int
        // float badPrice = 19.99;  // COMPILE ERROR: incompatible types: double cannot be converted to float
    }
}
// OUTPUT:
// 10000000000
// 19.99
// 19.99`
                                ]
                            },
                            {
                                content: `<h3>Floating-Point Precision (Why double + double can surprise you)</h3>
Binary floating-point cannot represent many decimal fractions exactly, so:<br>`,
                                codeExamples: [
                                    `public class PrecisionDemo {
    public static void main(String[] args) {
        double result = 0.1 + 0.2;
        System.out.println(result);
    }
}
// OUTPUT:
// 0.30000000000000004`,
                                    `import java.math.BigDecimal;

public class MoneyDemo {
    public static void main(String[] args) {
        // Correct: exact decimal representation
        BigDecimal amount = new BigDecimal("10.50");
        BigDecimal tax = new BigDecimal("0.50");
        System.out.println(amount.add(tax));
    }
}
// OUTPUT:
// 11.00`
                                ]
                            },
                            {
                                content: `<h3>Narrowing Conversion &amp; Data Loss</h3>
A larger type converted to a smaller one requires an explicit cast — and the value may not survive intact:<br>`,
                                codeExamples: [
                                    `public class NarrowingDemo {
    public static void main(String[] args) {
        double salary = 50000.75;
        int value = (int) salary;
        System.out.println(value);

        int x = 130;
        byte b = (byte) x;   // 130 doesn't fit in a byte (-128 to 127)
        System.out.println(b);
    }
}
// OUTPUT:
// 50000
// -126`
                                ]
                            },
                            {
                                content: `<h3>Integer Overflow — Silent Wraparound, No Exception</h3>
Primitive integer arithmetic in Java does <strong>not</strong> throw an exception on overflow - it silently wraps around from the maximum value back to the minimum (and vice versa). This is a classic interview trap and a real source of bugs.<br>`,
                                codeExamples: [
                                    `public class OverflowDemo {
    public static void main(String[] args) {
        int max = Integer.MAX_VALUE;
        System.out.println(max);
        int overflowed = max + 1;
        System.out.println(overflowed); // wraps around to MIN_VALUE

        int min = Integer.MIN_VALUE;
        System.out.println(min);
        int underflowed = min - 1;
        System.out.println(underflowed); // wraps around to MAX_VALUE
    }
}
// OUTPUT:
// 2147483647
// -2147483648
// -2147483648
// 2147483647`
                                ]
                            },
                            {
                                content: `<h3>Type Promotion in Expressions</h3>
Arithmetic on <code>byte</code>/<code>short</code> operands is promoted to <code>int</code> — a classic interview trap:<br>`,
                                codeExamples: [
                                    `public class PromotionDemo {
    public static void main(String[] args) {
        byte a = 10;
        byte b = 20;

        // byte c = a + b;   // Compile-time error: a + b is int, not byte
        int c = a + b;        // Correct
        byte d = (byte) (a + b); // Also correct, with explicit cast

        System.out.println(c);
        System.out.println(d);

        char ch = 'A';
        int result = ch + 1;
        char next = (char) (ch + 1);
        System.out.println(result);
        System.out.println(next);
    }
}
// OUTPUT:
// 30
// 30
// 66
// B`
                                ]
                            },
                            {
                                content: `<h3>Local vs Instance vs Static Variables</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Feature</th><th>Local</th><th>Instance</th><th>Static</th></tr>
<tr class='text-center'><td>Declared</td><td>Inside method/block</td><td>Inside class, outside methods</td><td>Inside class with static</td></tr>
<tr class='text-center'><td>Belongs to</td><td>Method/block execution</td><td>Object</td><td>Class</td></tr>
<tr class='text-center'><td>Default value</td><td>No</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>static allowed</td><td>No</td><td>No</td><td>Yes</td></tr>
<tr class='text-center'><td>Lifetime</td><td>Method/block execution</td><td>Object lifetime</td><td>Class/runtime lifetime</td></tr>
<tr class='text-center'><td>Shared</td><td>No</td><td>No</td><td>Yes</td></tr>
</table>
<br>
Local variables never get automatic default values — they must be definitely assigned before use, or the compiler rejects the program.<br>`,
                                codeExamples: [
                                    `class Employee {
    static String company = "ABC";  // static: shared across all instances

    int id;          // instance: unique per object
    String name;     // instance: unique per object

    void calculate() {
        int result = 100;   // local: only exists during this method call
        System.out.println(result);
    }
}

public class VariableScopeDemo {
    public static void main(String[] args) {
        Employee e1 = new Employee();
        e1.id = 101; e1.name = "Pankaj";

        Employee e2 = new Employee();
        e2.id = 102; e2.name = "Raghunath";

        System.out.println(e1.name + " works at " + e1.company);
        System.out.println(e2.name + " works at " + e2.company);
        e1.calculate();
    }
}
// OUTPUT:
// Pankaj works at ABC
// Raghunath works at ABC
// 100`
                                ]
                            },
                            {
                                content: `<h3>Autoboxing, Unboxing &amp; the null Trap</h3>
Java automatically converts between primitives and their wrapper objects when needed - useful, but unboxing a <code>null</code> throws <code>NullPointerException</code>:<br>`,
                                codeExamples: [
                                    `public class BoxingDemo {
    public static void main(String[] args) {
        int x = 10;
        Integer obj = x;        // autoboxing: int -> Integer
        int y = obj;             // unboxing: Integer -> int
        System.out.println(y);

        Integer value = null;
        try {
            int z = value;       // unboxing null -> NPE
        } catch (NullPointerException e) {
            System.out.println("Caught: unboxing null throws NPE");
        }
    }
}
// OUTPUT:
// 10
// Caught: unboxing null throws NPE`,
                                    `public class IntegerEqualityDemo {
    public static void main(String[] args) {
        Integer a = 1000;
        Integer b = 1000;
        System.out.println(a == b);       // reference comparison
        System.out.println(a.equals(b));  // value comparison

        Integer c = 100;
        Integer d = 100;
        System.out.println(c == d);       // true: Integer cache (-128 to 127)
    }
}
// OUTPUT:
// false
// true
// true`
                                ]
                            },
                            {
                                content: `<h3>var — Local Variable Type Inference (Java 10+)</h3>
<code>var</code> infers the compile-time type from the initializer - Java remains <strong>statically typed</strong>, it just saves you from typing the type explicitly.<br>`,
                                codeExamples: [
                                    `public class VarDemo {
    public static void main(String[] args) {
        var age = 30;          // inferred as int
        var name = "Pankaj";   // inferred as String

        // age = "Pankaj";     // Compile-time error: age's type is fixed as int

        System.out.println(age);
        System.out.println(name);

        // var x;              // Invalid: no initializer to infer from
        // var y = null;       // Invalid: null has no inferable type
    }
}
// OUTPUT:
// 30
// Pankaj`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How many primitive types does Java have?</td><td>8: byte, short, int, long, float, double, char, boolean</td></tr>
<tr class='text-center'><td>What's the default value of an uninitialized instance variable vs a local variable?</td><td>Instance variables get an automatic default (0/false/null); local variables get none and must be assigned before use</td></tr>
<tr class='text-center'><td>Why does int overflow not throw an exception?</td><td>Java's primitive integer arithmetic wraps around silently (two's-complement); use Math.addExact()/multiplyExact() if you need overflow to throw</td></tr>
<tr class='text-center'><td>Why is float f = 10.5; a compile error?</td><td>10.5 is a double literal by default; it needs an explicit f suffix (10.5f) or a cast</td></tr>
<tr class='text-center'><td>What happens when you unbox a null Integer?</td><td>Throws NullPointerException at the point of unboxing</td></tr>
<tr class='text-center'><td>Why does byte c = a + b; fail for two byte variables?</td><td>Binary arithmetic promotes byte/short operands to int; the result must be explicitly cast back to byte</td></tr>
<tr class='text-center'><td>What's the difference between primitive and reference types?</td><td>Primitives store their value directly; reference types store a pointer to an object on the heap and default to null</td></tr>
<tr class='text-center'><td>Is Java statically or dynamically typed?</td><td>Statically typed - types are checked at compile time, including when var is used for inference</td></tr>
</table>
<br>

<h3>Quick Revision — Decision Tree</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Need a value?
    |
    +-- Whole number?
    |      +-- Normal range -> int
    |      `+"`"+`-- Larger range -> long
    |
    +-- Decimal?
    |      +-- Scientific/general -> double
    |      `+"`"+`-- Exact decimal/financial -> BigDecimal
    |
    +-- True/False? -> boolean
    +-- Single UTF-16 code unit? -> char
    `+"`"+`-- Object/Text/Collection? -> Reference type</pre>

<strong>Interview-level definition:</strong> a data type defines the kind of value a variable can represent and the operations allowed on it. Java has 8 primitive types and a broad set of reference types (classes, interfaces, arrays, enums, records). A variable is a named entity associated with a value or object reference, and Java is statically typed - types are determined and checked at compile time.<br>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
• A data type in the JVM is a <b>contract about the bit pattern and the legal operations</b> on it. The compiler erases nothing about primitives, so int stays int in the bytecode. <br>
• Primitives map to JVM slots. int, float, short, byte, char and boolean use one slot, long and double use two slots in the local variable table. <br>
• boolean has <b>no dedicated bytecode</b>. The JVM stores it as an int of 0 or 1 and uses baload and bastore for boolean arrays. <br>
• Reference types hold a 4 or 8 byte pointer. With <b>compressed oops</b>, enabled by default under a 32 GB heap, references stay 4 bytes. <br>
• <b>var</b> is not a type. It is local variable type inference and the compiler still writes the exact static type into the class file. <br><br>

<h3>2. Purpose of This Topic (Advanced)</h3>
• To pick a representation that <b>survives production scale</b>, where 10 million rows make the difference between int and Integer worth gigabytes. <br>
• To reason about <b>numeric promotion</b>, so you know that byte plus byte gives int, and that a compound assignment hides a cast. <br>
• To choose the correct <b>money type</b>. BigDecimal with an explicit scale and RoundingMode, or a long of minor units. <br>
• To understand <b>autoboxing cost</b> and the Integer cache from minus 128 to 127, which breaks reference equality tests. <br><br>

<h3>3. Need of This Topic (Advanced)</h3>
• Interviewers ask about int overflow, float equality and Integer caching in almost every Java interview. <br>
• Financial and telecom systems fail audits when rounding is left to double. <br>
• Memory tuning for a high throughput service starts with removing boxed types from hot paths. <br>
• Reading someone else's legacy code means spotting silent narrowing in compound assignments. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level: promotion, caching and hidden casts

import java.math.BigDecimal;
import java.math.RoundingMode;

public class AdvancedTypeMechanicsDemo {

    public static void main(String[] args) {

        // POINT 2: numeric promotion. byte plus byte is evaluated as int.
        byte a = 10, b = 20;
        // byte wrong = a + b;          // WRONG: compile error, int cannot fit in byte
        byte right = (byte) (a + b);    // RIGHT: explicit cast
        System.out.println("Promoted then cast: " + right);

        // POINT 2: compound assignment hides a narrowing cast
        byte counter = 120;
        counter += 10;                  // silently becomes (byte)(counter + 10)
        System.out.println("Hidden cast overflow: " + counter);

        // POINT 2: the Integer cache, minus 128 to 127
        Integer p1 = 127, p2 = 127;
        Integer q1 = 128, q2 = 128;
        System.out.println("127 == 127 : " + (p1 == p2));   // true, cached
        System.out.println("128 == 128 : " + (q1 == q2));   // false, new objects
        System.out.println("equals     : " + q1.equals(q2));// RIGHT way

        // POINT 3: float equality is unsafe
        double f = 0.1 * 3;
        System.out.println("0.1 * 3 == 0.3 : " + (f == 0.3));

        // POINT 3: money the correct way
        BigDecimal price = new BigDecimal("1450.505");
        BigDecimal gst = price.multiply(new BigDecimal("0.18"));
        BigDecimal total = price.add(gst).setScale(2, RoundingMode.HALF_UP);
        System.out.println("Total with GST: Rs " + total);

        // WRONG: new BigDecimal(double) carries the binary error
        System.out.println("WRONG BigDecimal: " + new BigDecimal(0.1));
        System.out.println("RIGHT BigDecimal: " + new BigDecimal("0.1"));
    }
}
// OUTPUT:
// Promoted then cast: 30
// Hidden cast overflow: -126
// 127 == 127 : true
// 128 == 128 : false
// equals     : true
// 0.1 * 3 == 0.3 : false
// Total with GST: Rs 1711.60
// WRONG BigDecimal: 0.1000000000000000055511151231257827021181583404541015625
// RIGHT BigDecimal: 0.1`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
• <b>Predictable layout.</b> Primitive arrays are flat and cache friendly, so a long array of 1 million entries is 8 MB with no per element header. <br>
• <b>JIT friendliness.</b> HotSpot can keep primitives in CPU registers and can vectorise simple loops over primitive arrays. <br>
• <b>Escape analysis and scalar replacement</b> can remove short lived objects entirely when types are simple. <br>
• <b>Strong static typing enables safe refactoring</b> across a million line codebase, which dynamic languages cannot offer. <br>
• <b>BigDecimal gives auditable arithmetic</b> with an explicit scale, which regulators accept. <br><br>

<h3>5. Disadvantages (Advanced)</h3>
• <b>Boxed types cost heavily.</b> An Integer is about 16 bytes plus a 4 byte reference against 4 bytes for an int, so a List of 1 million Integers is roughly 20 MB against 4 MB. <br>
• <b>Autoboxing in a loop</b> creates garbage and can dominate GC time in a hot path. <br>
• <b>Unboxing a null wrapper</b> throws NullPointerException at a line that looks harmless. <br>
• <b>Generics cannot hold primitives,</b> so you pay boxing or you use specialised streams like IntStream. <br>
• <b>BigDecimal is slow and allocation heavy,</b> so it is wrong for a tight risk engine loop. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level: boxing cost and the null unboxing trap

import java.util.HashMap;
import java.util.Map;

public class BoxingCostDemo {

    public static void main(String[] args) {

        int size = 2000000;

        // ADVANTAGE 4: primitive array, flat and fast
        long start = System.nanoTime();
        long[] primitive = new long[size];
        long sum1 = 0;
        for (int i = 0; i < size; i++) {
            primitive[i] = i;
            sum1 += primitive[i];
        }
        long primitiveMs = (System.nanoTime() - start) / 1000000;

        // DISADVANTAGE 5: boxed version allocates an object per element
        start = System.nanoTime();
        Long[] boxed = new Long[size];
        long sum2 = 0;
        for (int i = 0; i < size; i++) {
            boxed[i] = (long) i;     // autoboxing
            sum2 += boxed[i];        // unboxing
        }
        long boxedMs = (System.nanoTime() - start) / 1000000;

        System.out.println("Primitive sum " + sum1 + " in about " + primitiveMs + " ms");
        System.out.println("Boxed     sum " + sum2 + " in about " + boxedMs + " ms");
        System.out.println("Boxed is normally several times slower and much larger");

        // DISADVANTAGE 5: unboxing a null wrapper
        Map<String, Integer> balances = new HashMap<>();
        balances.put("ACC001", 5000);

        // WRONG: the key is missing, get returns null, unboxing throws NPE
        try {
            int wrong = balances.get("ACC999");
            System.out.println(wrong);
        } catch (NullPointerException e) {
            System.out.println("WRONG path threw NullPointerException on unboxing");
        }

        // RIGHT: use getOrDefault so a primitive always has a value
        int rightValue = balances.getOrDefault("ACC999", 0);
        System.out.println("RIGHT path balance: " + rightValue);
    }
}
// OUTPUT (timings vary by machine):
// Primitive sum 1999999000000 in about 8 ms
// Boxed     sum 1999999000000 in about 45 ms
// Boxed is normally several times slower and much larger
// WRONG path threw NullPointerException on unboxing
// RIGHT path balance: 0`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
<ul>
<li><b>Core banking ledger:</b> amounts kept as long minor units inside the engine, converted to BigDecimal only at the report boundary. This removes rounding drift across millions of postings.</li>
<li><b>UPI switch:</b> transaction ids as long, status as an enum rather than a String, so comparison is a pointer check.</li>
<li><b>Market data feed:</b> prices as int ticks with a fixed scale, since double comparison in a matching engine is unacceptable.</li>
<li><b>Telecom CDR processing:</b> primitive long arrays instead of List&lt;Long&gt;, which can cut a very large heap several times over.</li>
<li><b>Global example, an ad serving platform:</b> IntStream and LongAdder used instead of boxed counters to avoid GC pressure at 100k requests per second.</li>
<li><b>Aadhaar or account numbers:</b> always stored as String when they may have leading zeros, never as int.</li>
</ul>
<p><b>Interview answers to keep ready</b></p>
<ul>
<li><b>Why is 0.1 plus 0.2 not 0.3 in Java?</b> IEEE 754 binary cannot represent 0.1 exactly.</li>
<li><b>Why is Integer 127 == 127 true but 128 == 128 false?</b> The Integer cache holds -128 to 127; larger values are new objects.</li>
<li><b>What is the size of a boolean?</b> The JLS does not define it. In practice a field or array element often takes one byte.</li>
<li><b>Why is String not a primitive?</b> It is an immutable object with methods and a shared pool.</li>
</ul>`,
                                codeExamples: [
                                    `// Point 6 at expert level: a ledger that stores minor units and reports in BigDecimal

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

public class LedgerMinorUnitsDemo {

    // amount is always in paise, never a double
    record Posting(String account, long amountPaise, String narration) { }

    private static BigDecimal toRupees(long paise) {
        return BigDecimal.valueOf(paise, 2);   // scale 2, exact, no double involved
    }

    public static void main(String[] args) {

        List<Posting> ledger = new ArrayList<>();
        ledger.add(new Posting("SBI-001", 1450050L, "Salary credit"));
        ledger.add(new Posting("SBI-001", -25075L, "UPI to Swiggy"));
        ledger.add(new Posting("SBI-001", -100000L, "SIP debit"));
        ledger.add(new Posting("SBI-001", 3333L, "Interest"));

        long balancePaise = 0;
        for (Posting p : ledger) {
            balancePaise += p.amountPaise();     // exact integer maths
            System.out.println(p.narration() + " : Rs " + toRupees(p.amountPaise()));
        }

        System.out.println("Closing balance: Rs " + toRupees(balancePaise));

        // WRONG: the same run using double drifts
        double wrongBalance = 0.0;
        for (Posting p : ledger) {
            wrongBalance += p.amountPaise() / 100.0;
        }
        System.out.println("WRONG double balance: " + wrongBalance);

        // REPORT boundary: apply GST with an explicit rounding mode
        BigDecimal fee = new BigDecimal("199.99");
        BigDecimal gst = fee.multiply(new BigDecimal("0.18"))
                            .setScale(2, RoundingMode.HALF_UP);
        System.out.println("Fee Rs " + fee + " plus GST Rs " + gst
                + " equals Rs " + fee.add(gst));
    }
}
// OUTPUT:
// Salary credit : Rs 14500.50
// UPI to Swiggy : Rs -250.75
// SIP debit : Rs -1000.00
// Interest : Rs 33.33
// Closing balance: Rs 13283.08
// WRONG double balance: 13283.080000000002
// Fee Rs 199.99 plus GST Rs 36.00 equals Rs 235.99`
                                ]
                            }
                        ],

};
