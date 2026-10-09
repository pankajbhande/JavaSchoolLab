import { Topic } from '../coreJava';
import operator1 from '../../../assets/operator1.png';
import operator2 from '../../../assets/operator2.png';
import operator3 from '../../../assets/operator3.png';
import operator4 from '../../../assets/operator4.png';

export const operatorsInJava: Topic = {
                        id: "operators",
                        name: "Operators in Java",

                        beginner: [

                            {
                                content: `<p>Operators are special symbols or keywords used to perform operations on variables and values.</p>
<p>Examples: <code>+ - * / = == &amp; | &amp;&amp; ||</code>. They help manipulate data and control program execution efficiently.</p>
<p>Below is one small, runnable code sample with output for each type of operator:</p>`
                            },


                            {
                                content: `
<h4>1) Arithmetic Operators</h4>
<p>Used to perform mathematical calculations.</p>
<p>Operators:</p>
<ul>
<li><code>+</code> Addition</li>
<li><code>-</code> Subtraction</li>
<li><code>*</code> Multiplication</li>
<li><code>/</code> Division</li>
<li><code>%</code> Modulus (remainder)</li>
</ul>
`,
                                codeExamples: [
                                    `int a = 10, b = 3;

System.out.println(a + b); // 13
System.out.println(a - b); // 7
System.out.println(a * b); // 30
System.out.println(a / b); // 3
System.out.println(a % b); // 1`
                                ]
                            },

                            {
                                content: `
<h4>2) Logical AND (&amp;&amp;) Operator</h4>
<ul>
<li>Returns <code>true</code> only if BOTH conditions are true</li>
<li>The second condition is skipped if the first is false</li>
</ul>
<img src="${operator1}" alt="Truth table for Logical AND operator" class="d-block mx-auto" />
`,
                                codeExamples: [
                                    `int x = 10, y = 20;

System.out.println(x < y && x > 5);   // true
System.out.println(x > y && x > 5);   // false`
                                ]
                            },

                            {
                                content: `
<h4>3) Logical OR (||) Operator</h4>
<ul>
<li>Returns <code>true</code> if ANY one condition is true</li>
<li>The second condition is skipped if the first is true</li>
</ul>
<img src="${operator2}" alt="Truth table for Logical OR operator" class="d-block mx-auto" />
`,
                                codeExamples: [
                                    `int x = 10, y = 20;

System.out.println(x > y || x < y);   // true
System.out.println(x > y || x > 30);  // false`
                                ]
                            },

                            {
                                content: `
<h4>4) Relational Operators</h4>
<p>Used to compare two values. The result is always <code>true</code> or <code>false</code>.</p>
<p>Operators:</p>
<ul>
<li><code>&gt;</code> Greater than</li>
<li><code>&lt;</code> Less than</li>
<li><code>&gt;=</code> Greater than or equal to</li>
<li><code>&lt;=</code> Less than or equal to</li>
<li><code>==</code> Equal to</li>
<li><code>!=</code> Not equal to</li>
</ul>
`,
                                codeExamples: [
                                    `int a = 10, b = 20;

System.out.println(a > b);   // false
System.out.println(a < b);   // true
System.out.println(a == b);  // false
System.out.println(a != b);  // true`
                                ]
                            },

                            {
                                content: `
<h4>5) Assignment Operator</h4>
<p>Used to assign a value to a variable.</p>
<p>Syntax:</p>
<p><code>variable = value;</code></p>
`,
                                codeExamples: [
                                    `int x = 50;
System.out.println(x); // 50`
                                ]
                            },

                            {
                                content: `
<h4>6) Bitwise AND (&amp;) Operator</h4>
<ul>
<li>Always checks BOTH conditions</li>
<li>Runs the second condition even if the first is false</li>
</ul>
<img src="${operator3}" alt="Truth table for Bitwise AND operator" class="d-block mx-auto" />
`,
                                codeExamples: [
                                    `int x = 10, y = 20;

System.out.println(x < y & x > 5);  // true
System.out.println(x > y & x > 5);  // false`
                                ]
                            },

                            {
                                content: `
<h4>7) Bitwise OR (|) Operator</h4>
<ul>
<li>Always checks BOTH conditions</li>
<li>Runs the second condition even if the first is true</li>
</ul>
<img src="${operator4}" alt="Truth table for Bitwise OR operator" class="d-block mx-auto" />
`,
                                codeExamples: [
                                    `int x = 10, y = 20;

System.out.println(x < y | x > 50); // true
System.out.println(x > y | x > 50); // false`
                                ]
                            },

                            {
                                content: `
<h4>8) Unary Operators</h4>
<p>Used to increase or decrease a value by 1.</p>
<p>Operators:</p>
<ul>
<li><code>++</code> Increment</li>
<li><code>--</code> Decrement</li>
</ul>
`,
                                codeExamples: [
                                    `int a = 10;

a++;
System.out.println(a); // 11

a--;
System.out.println(a); // 10`
                                ]
                            },

                            {
                                content: `
<h4>9) Ternary Operator</h4>
<p>Shorthand for an if-else statement that returns a value.</p>
<p>Syntax:</p>
<p><code>condition ? value_if_true : value_if_false</code></p>
`,
                                codeExamples: [
                                    `int a = 10, b = 20;

int max = (a > b) ? a : b;
System.out.println(max); // 20`
                                ]
                            },

                            {
                                content: `
<h4>10) Shift Operators</h4>
<ul>
<li>Right shift <code>&gt;&gt;</code> moves the bits of the left operand to the right by the number of places given by the right operand.</li>
<li>Left shift <code>&lt;&lt;</code> moves the bits of the left operand to the left by the number of places given by the right operand.</li>
</ul>
`,
                                codeExamples: [
                                    `int x = 10;

System.out.println(x << 2); // 40
System.out.println(x >> 1); // 5`
                                ]
                            },

                            {
                                content: `
<h4>11) Dot (.) Operator</h4>
<p>Used to access the variables and methods of a class or object.</p>
`,
                                codeExamples: [
                                    `class Demo {
    void show() {
        System.out.println("Dot operator example");
    }

    public static void main(String[] args) {
        Demo obj = new Demo();
        obj.show(); // using dot operator
    }
}`
                                ]
                            },

                            {
                                content: `
<h4>12) new Operator</h4>
<p>Used to create an object of a class.</p>
`,
                                codeExamples: [
                                    `class Test {
    Test() {
        System.out.println("Object created");
    }

    public static void main(String[] args) {
        Test t = new Test(); // new operator
    }
}`
                                ]
                            },

                            {
                                content: `
<h4>13) instanceof Operator</h4>
<p>Checks whether an object is an instance of a class or interface (or one of its subtypes). It returns <code>true</code> or <code>false</code>. It is commonly used before an explicit cast to avoid a <code>ClassCastException</code>.</p>
`,
                                codeExamples: [
                                    `class Animal {}
class Dog extends Animal {}

public class InstanceofDemo {
    public static void main(String[] args) {
        Animal a = new Dog();

        System.out.println(a instanceof Dog);      // true
        System.out.println(a instanceof Animal);   // true
        // a instanceof String  -> COMPILE ERROR: Animal and String are unrelated
    }
}
// OUTPUT:
// true
// true`
                                ]
                            },

                            {
                                content: `<h3>1. Definition</h3>
• An <b>operator</b> is a special symbol that tells Java to perform an action on one, two or three values. The values it works on are called <b>operands</b>. <br>
• Java groups operators into families. <b>Arithmetic</b> like plus minus star slash percent, <b>relational</b> like less than and double equals, <b>logical</b> like and or not, <b>assignment</b> like equals and plus equals, <b>unary</b> like plus plus and minus minus, <b>bitwise</b> like and or xor and the shifts, and the <b>ternary</b> question mark colon. <br>
• Every expression built with operators produces a <b>value and a type</b>, which Java works out at compile time. <br>
• Operators follow <b>precedence</b>, which decides who runs first, and <b>associativity</b>, which decides the direction when precedence is equal. <br><br>

<h3>2. Purpose of This Topic</h3>
• To do the actual <b>calculation work</b> in a program, from a simple total to an EMI formula. <br>
• To <b>compare and decide</b>, which is what if statements and loops depend on. <br>
• To write <b>short readable expressions</b> instead of long method calls for simple maths. <br>
• To manipulate <b>bits and flags</b> efficiently in low level or performance sensitive code. <br><br>

<h3>3. Need of This Topic</h3>
• Nothing useful happens in a program without operators. Even printing a total needs the plus operator. <br>
• Wrong precedence causes silent bugs, like a GST calculation that adds before it multiplies. <br>
• The difference between double equals and equals is the single most common beginner mistake with Strings. <br>
• Integer division dropping the decimal part is a classic bug in percentage and average calculations. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: operator families in one billing program

public class OperatorBasicsDemo {

    public static void main(String[] args) {

        // POINT 1: arithmetic operators
        int itemsBought = 7;
        int pricePerItem = 249;
        int subTotal = itemsBought * pricePerItem;
        System.out.println("Subtotal: Rs " + subTotal);

        // POINT 1: modulus gives the remainder
        int boxSize = 3;
        int fullBoxes = itemsBought / boxSize;
        int loose = itemsBought % boxSize;
        System.out.println("Full boxes: " + fullBoxes + ", loose items: " + loose);

        // POINT 3: WRONG. Integer division throws away the decimal part.
        int marksScored = 7, totalMarks = 9;
        int wrongPercent = (marksScored / totalMarks) * 100;
        System.out.println("WRONG percent: " + wrongPercent);

        // POINT 3: RIGHT. Multiply first, or use a double.
        double rightPercent = (marksScored * 100.0) / totalMarks;
        System.out.println("RIGHT percent: " + rightPercent);

        // POINT 1: relational and logical operators
        int age = 20;
        boolean hasAadhaar = true;
        boolean canVote = (age >= 18) && hasAadhaar;
        System.out.println("Can vote: " + canVote);

        // POINT 2: ternary operator, a short if else that returns a value
        String category = (age < 13) ? "Child" : (age < 20) ? "Teen" : "Adult";
        System.out.println("Category: " + category);

        // POINT 1: unary operators
        int stock = 10;
        System.out.println("Post increment prints old value: " + (stock++));
        System.out.println("Now stock is: " + stock);
        System.out.println("Pre increment prints new value: " + (++stock));

        // POINT 1: compound assignment
        int cart = 100;
        cart += 50;
        cart -= 20;
        cart *= 2;
        System.out.println("Cart after compound assignment: " + cart);

        // POINT 3: WRONG for Strings, double equals compares references
        String a = new String("SBI");
        String b = new String("SBI");
        System.out.println("WRONG a == b   : " + (a == b));
        System.out.println("RIGHT a.equals : " + a.equals(b));
    }
}
// OUTPUT:
// Subtotal: Rs 1743
// Full boxes: 2, loose items: 1
// WRONG percent: 0
// RIGHT percent: 77.77777777777777
// Can vote: true
// Category: Adult
// Post increment prints old value: 10
// Now stock is: 11
// Pre increment prints new value: 12
// Cart after compound assignment: 260
// WRONG a == b   : false
// RIGHT a.equals : true`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
• <b>Very short code.</b> One symbol replaces a whole method call, so formulas read like maths. <br>
• <b>Fast.</b> Arithmetic and bitwise operators map almost directly to single CPU instructions. <br>
• <b>Short circuit saves work.</b> With double ampersand the right side is skipped when the left is false, which also avoids null checks blowing up. <br>
• <b>Ternary keeps code compact</b> for simple either or choices inside an expression. <br>
• <b>Compound assignment reduces repetition</b> and makes the intent clear. <br><br>

<h3>5. Disadvantages</h3>
• <b>Precedence surprises.</b> Without brackets, a formula can quietly compute the wrong thing. <br>
• <b>Integer division truncates,</b> so averages and percentages come out as zero. <br>
• <b>Overflow is silent.</b> Multiplying two large ints wraps around with no warning. <br>
• <b>Double equals on objects</b> compares addresses, not contents. <br>
• <b>Nested ternaries and clever bit tricks</b> become unreadable for the next developer. <br>
• <b>Single ampersand and single pipe do not short circuit,</b> so both sides always run and a null check may fail. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5: precedence, overflow and short circuit

public class OperatorPitfallDemo {

    static String customerName = null;

    public static void main(String[] args) {

        // DISADVANTAGE 5: precedence bug in a GST calculation
        int price = 1000;
        double gstRate = 0.18;

        // WRONG: * and / run before + , so the sum is not halved
        double wrongTotal = price + price * gstRate / 2 + 50;
        // RIGHT: brackets say exactly what you mean
        double rightTotal = ((price + (price * gstRate)) / 2) + 50;

        System.out.println("WRONG total: " + wrongTotal);
        System.out.println("RIGHT total: " + rightTotal);

        // DISADVANTAGE 5: silent int overflow
        int seats = 100000;
        int pricePerSeat = 50000;
        int wrongRevenue = seats * pricePerSeat;          // overflows
        long rightRevenue = (long) seats * pricePerSeat;  // RIGHT
        System.out.println("WRONG revenue: " + wrongRevenue);
        System.out.println("RIGHT revenue: " + rightRevenue);

        // ADVANTAGE 4: short circuit protects the null reference
        if (customerName != null && customerName.length() > 3) {
            System.out.println("Long name");
        } else {
            System.out.println("Short circuit saved us from a NullPointerException");
        }

        // DISADVANTAGE 5: single ampersand does not short circuit
        try {
            if (customerName != null & customerName.length() > 3) {
                System.out.println("never reached");
            }
        } catch (NullPointerException e) {
            System.out.println("Single ampersand evaluated both sides and threw NPE");
        }

        // DISADVANTAGE 5: a nested ternary nobody can read
        int score = 72;
        String grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D";
        System.out.println("Grade: " + grade + " (readable only because it is short)");
    }
}
// OUTPUT:
// WRONG total: 1140.0
// RIGHT total: 640.0
// WRONG revenue: 705032704
// RIGHT revenue: 5000000000
// Short circuit saved us from a NullPointerException
// Single ampersand evaluated both sides and threw NPE
// Grade: C (readable only because it is short)`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>Electricity bill:</b> slab charges use relational operators, and the total uses arithmetic plus a ternary for the subsidy. <br>
• <b>ATM machine:</b> the note dispenser uses division and modulus to work out how many 500 and 100 rupee notes to give. <br>
• <b>Ola or Uber fare:</b> base fare plus per kilometre rate, with a surge multiplier applied by a ternary during peak hours. <br>
• <b>College result page:</b> percentage uses double division, and pass or fail uses the logical and operator across subjects. <br>
• <b>Cricket scoreboard:</b> strike rate is runs times 100 divided by balls, done in double to keep the decimal. <br>
• <b>Global example, file permissions:</b> read write execute flags are stored as bits and checked with the bitwise and operator. <br><br>

<b>Golden rule:</b> if you have to pause and think about the order, add brackets. Brackets cost nothing at run time and save hours of debugging.`,
                                codeExamples: [
                                    `// Point 6: an ATM note dispenser and an Ola style fare calculator

public class OperatorRealTimeDemo {

    // Real time example: ATM dispensing notes with division and modulus
    static void dispense(int amount) {
        if (amount % 100 != 0) {
            System.out.println("ATM gives only multiples of 100");
            return;
        }
        int remaining = amount;
        int[] notes = {2000, 500, 200, 100};
        System.out.println("Dispensing Rs " + amount);
        for (int note : notes) {
            int count = remaining / note;     // how many of this note
            remaining = remaining % note;     // what is left
            if (count > 0) {
                System.out.println("  " + count + " x Rs " + note);
            }
        }
    }

    // Real time example: cab fare with a surge multiplier
    static double fare(double km, int hour, boolean nightRide) {
        double base = 45.0;
        double perKm = 12.5;

        // ternary picks the surge factor
        boolean peak = (hour >= 9 && hour <= 11) || (hour >= 18 && hour <= 21);
        double surge = peak ? 1.6 : 1.0;

        double total = (base + (km * perKm)) * surge;
        total += nightRide ? 30.0 : 0.0;      // night charge
        return total;
    }

    public static void main(String[] args) {

        dispense(3700);
        dispense(2550);

        System.out.println("Morning peak 12 km fare: Rs " + fare(12, 10, false));
        System.out.println("Afternoon 12 km fare   : Rs " + fare(12, 15, false));
        System.out.println("Night 12 km fare       : Rs " + fare(12, 23, true));

        // Global example: file permission bits checked with bitwise and
        int READ = 4, WRITE = 2, EXECUTE = 1;
        int userPerm = READ | WRITE;                  // 6
        System.out.println("Permission value: " + userPerm);
        System.out.println("Can read   : " + ((userPerm & READ) != 0));
        System.out.println("Can execute: " + ((userPerm & EXECUTE) != 0));
    }
}
// OUTPUT:
// Dispensing Rs 3700
//   1 x Rs 2000
//   3 x Rs 500
//   1 x Rs 200
// ATM gives only multiples of 100
// Morning peak 12 km fare: Rs 312.0
// Afternoon 12 km fare   : Rs 195.0
// Night 12 km fare       : Rs 225.0
// Permission value: 6
// Can read   : true
// Can execute: false`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Operator Precedence &amp; Associativity</h3>
<p>When an expression mixes multiple operators, precedence decides which runs first. Associativity decides the direction when precedence is equal.</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Category</th><th>Operators</th><th>Associativity</th></tr>
<tr class='text-center'><td>Postfix</td><td>expr++ expr--</td><td>Left to right</td></tr>
<tr class='text-center'><td>Unary</td><td>++expr --expr + - ! ~</td><td>Right to left</td></tr>
<tr class='text-center'><td>Multiplicative</td><td>* / %</td><td>Left to right</td></tr>
<tr class='text-center'><td>Additive</td><td>+ -</td><td>Left to right</td></tr>
<tr class='text-center'><td>Shift</td><td>&lt;&lt; &gt;&gt; &gt;&gt;&gt;</td><td>Left to right</td></tr>
<tr class='text-center'><td>Relational</td><td>&lt; &gt; &lt;= &gt;= instanceof</td><td>Left to right</td></tr>
<tr class='text-center'><td>Equality</td><td>== !=</td><td>Left to right</td></tr>
<tr class='text-center'><td>Bitwise AND</td><td>&amp;</td><td>Left to right</td></tr>
<tr class='text-center'><td>Bitwise XOR</td><td>^</td><td>Left to right</td></tr>
<tr class='text-center'><td>Bitwise OR</td><td>|</td><td>Left to right</td></tr>
<tr class='text-center'><td>Logical AND</td><td>&amp;&amp;</td><td>Left to right</td></tr>
<tr class='text-center'><td>Logical OR</td><td>||</td><td>Left to right</td></tr>
<tr class='text-center'><td>Ternary</td><td>?:</td><td>Right to left</td></tr>
<tr class='text-center'><td>Assignment</td><td>= += -= *= /=</td><td>Right to left</td></tr>
</table>
<p>Multiplicative operators bind tighter than additive ones, so <code>2 + 3 * 4</code> evaluates the multiplication first.</p>`,
                                codeExamples: [
                                    `public class PrecedenceDemo {
    public static void main(String[] args) {
        int result = 2 + 3 * 4;         // * before +
        System.out.println(result);

        int result2 = (2 + 3) * 4;      // parentheses override precedence
        System.out.println(result2);

        boolean b = 5 > 3 && 2 < 4 || false;   // relational -> && -> ||
        System.out.println(b);
    }
}
// OUTPUT:
// 14
// 20
// true`
                                ]
                            },
                            {
                                content: `<h3>Bitwise Operators &amp; Signed vs Unsigned Shift</h3>
<p><code>&amp;</code>, <code>|</code>, <code>^</code>, <code>~</code> operate bit by bit. <code>&gt;&gt;</code> is a <strong>signed</strong> right shift (keeps the sign bit). <code>&gt;&gt;&gt;</code> is an <strong>unsigned</strong> right shift (always fills with zeros). The difference only shows up with negative numbers.</p>`,
                                codeExamples: [
                                    `public class BitwiseDemo {
    public static void main(String[] args) {
        int a = 12;   // 0000 1100
        int b = 10;   // 0000 1010

        System.out.println(a & b);   // AND
        System.out.println(a | b);   // OR
        System.out.println(a ^ b);   // XOR
        System.out.println(~a);      // NOT (bitwise complement)

        int n = -8;
        System.out.println(n >> 1);    // signed: sign bit preserved
        System.out.println(n >>> 1);   // unsigned: zero-filled from the left
    }
}
// OUTPUT:
// 8
// 14
// 6
// -13
// -4
// 2147483644`
                                ]
                            },
                            {
                                content: `<h3>Short-Circuit (&amp;&amp;, ||) vs Non-Short-Circuit (&amp;, |)</h3>
<p><code>&amp;&amp;</code> and <code>||</code> skip the right-hand operand when the result is already decided. <code>&amp;</code> and <code>|</code> on booleans always evaluate BOTH sides. This matters when the right side has a side effect.</p>`,
                                codeExamples: [
                                    `public class ShortCircuitDemo {
    static int calls = 0;

    static boolean check() {
        calls++;
        return true;
    }

    public static void main(String[] args) {
        calls = 0;
        boolean r1 = false && check();   // short-circuits: check() never runs
        System.out.println("&& calls: " + calls);

        calls = 0;
        boolean r2 = false & check();    // always evaluates both sides
        System.out.println("& calls: " + calls);
    }
}
// OUTPUT:
// && calls: 0
// & calls: 1`
                                ]
                            },
                            {
                                content: `<h3>Increment/Decrement Gotchas &amp; Ternary Type Promotion</h3>
<p><code>x++</code> (post-increment) returns the OLD value, then increments. <code>++x</code> (pre-increment) increments first, then returns the new value. Mixing both in one expression is a classic interview trap.</p>`,
                                codeExamples: [
                                    `public class IncrementDemo {
    public static void main(String[] args) {
        int i = 5;
        i = i++ + ++i;
        // Step 1: i++  -> evaluates to 5, i becomes 6
        // Step 2: ++i  -> i becomes 7, evaluates to 7
        // Step 3: 5 + 7 = 12, assigned back to i
        System.out.println(i);
    }
}
// OUTPUT:
// 12`,
                                    `public class TernaryPromotionDemo {
    public static void main(String[] args) {
        int a = 10;
        double b = 20.5;

        // Ternary promotes both branches to a common type (double here)
        double result = true ? a : b;
        System.out.println(result);

        Object mixed = false ? a : b;   // still promoted to Double, not Integer
        System.out.println(mixed);
    }
}
// OUTPUT:
// 10.0
// 20.5`
                                ]
                            },
                            {
                                content: `<h3>Common Interview Traps</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Code</th><th>Result</th><th>Why</th></tr>
<tr class='text-center'><td>Integer.MAX_VALUE + 1</td><td>-2147483648</td><td>int overflow silently wraps around (two's complement)</td></tr>
<tr class='text-center'><td>10 / 0</td><td>ArithmeticException</td><td>integer division by zero throws at runtime</td></tr>
<tr class='text-center'><td>10.0 / 0</td><td>Infinity</td><td>floating-point division by zero yields Infinity, not an exception</td></tr>
<tr class='text-center'><td>"a" instanceof String s</td><td>true, s bound</td><td>pattern matching for instanceof (Java 16+) casts and binds in one step</td></tr>
<tr class='text-center'><td>1 + 2 + "x"</td><td>"3x"</td><td>left-to-right: numeric addition first, then string concatenation</td></tr>
<tr class='text-center'><td>"x" + 1 + 2</td><td>"x12"</td><td>left-to-right: string concatenation forces the rest to be treated as strings</td></tr>
</table>`,
                                codeExamples: [
                                    `public class OverflowAndPatternDemo {
    public static void main(String[] args) {
        System.out.println(Integer.MAX_VALUE + 1);

        try {
            System.out.println(10 / 0);
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        }
        System.out.println(10.0 / 0);

        Object obj = "hello";
        if (obj instanceof String s) {       // pattern matching for instanceof
            System.out.println(s.toUpperCase());
        }

        System.out.println(1 + 2 + "x");
        System.out.println("x" + 1 + 2);
    }
}
// OUTPUT:
// -2147483648
// Caught: / by zero
// Infinity
// HELLO
// 3x
// x12`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does Java support operator overloading?</td><td>No - unlike C++, Java deliberately does not allow operators like + or == to be redefined for custom classes. The only built-in exception is + for String concatenation, which the compiler handles specially, not something a class can opt into itself</td></tr>
<tr class='text-center'><td>Why did Java leave out operator overloading?</td><td>To keep operator behavior predictable and code easy to read - overloaded operators in other languages can silently do very different things than their symbol suggests</td></tr>
<tr class='text-center'><td>What's the instanceof operator used for?</td><td>Checking whether an object is an instance of a given type at runtime, before an unsafe cast; Java 16+ pattern matching lets it cast and bind to a variable in the same expression</td></tr>
<tr class='text-center'><td>Why does 10.0 / 0 not throw, but 10 / 0 does?</td><td>Floating-point division by zero is well-defined by IEEE 754 (produces Infinity/NaN); integer division by zero has no such representation, so the JVM throws ArithmeticException</td></tr>
<tr class='text-center'><td>What is operator precedence and why does it matter?</td><td>It's the order in which operators are evaluated when an expression mixes several of them (e.g. * before +); getting it wrong silently produces the wrong result rather than a compile error</td></tr>
<tr class='text-center'><td>Difference between == and .equals() for objects?</td><td>== compares references (are these the same object in memory); .equals() compares logical/value equality as defined by the class - for wrapper types and String this distinction is a classic interview trap</td></tr>
</table>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
• An operator in the JLS is defined by <b>an evaluation order, a promotion rule and a result type</b>. Java always evaluates the left operand fully before the right one, which makes side effects predictable unlike C. <br>
• <b>Binary numeric promotion</b> applies to arithmetic and comparison. If either side is double the other becomes double, else float, else long, else both become int. So byte plus short is an int. <br>
• <b>Compound assignment carries an implicit cast.</b> The JLS defines e1 op equals e2 as e1 equals cast of type of e1 applied to e1 op e2, which is why a byte compound assignment compiles but can overflow. <br>
• <b>Bitwise shifts mask the shift distance.</b> For int the right operand is taken modulo 32, for long modulo 64, so shifting an int by 32 does nothing at all. <br>
• The <b>signed shift keeps the sign bit</b> while the unsigned right shift, three greater than signs, always brings in zeros. <br><br>

<h3>2. Purpose of This Topic (Advanced)</h3>
• To write <b>numerically correct code</b> under promotion, truncation toward zero and IEEE 754 rules. <br>
• To use <b>bit manipulation</b> where it genuinely pays, such as flag sets, hashing, and index masking in ring buffers. <br>
• To reason about <b>the ternary operator's own promotion rule</b>, which can unbox and throw a NullPointerException. <br>
• To understand <b>instanceof pattern matching</b> and switch expressions as modern replacements for chains of relational tests. <br><br>

<h3>3. Need of This Topic (Advanced)</h3>
• Interview questions about i equals i plus plus and about the ternary NPE separate careful developers from careless ones. <br>
• A hash bucket index computed with modulus instead of an and mask is measurably slower in a hot map. <br>
• Financial rounding with the percent operator on negative numbers surprises people, because Java truncates toward zero. <br>
• Concurrency bugs come from assuming plus plus is atomic when it is really a read, a modify and a write. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level: promotion, shift masking and the ternary NPE

import java.util.HashMap;
import java.util.Map;

public class AdvancedOperatorDemo {

    public static void main(String[] args) {

        // POINT 1: the classic i = i++ puzzle. The old value is saved first.
        int i = 5;
        i = i++;
        System.out.println("i = i++ leaves i as: " + i);

        int j = 5;
        j = ++j;
        System.out.println("j = ++j leaves j as: " + j);

        // POINT 1: shift distance is masked, int uses modulo 32
        int value = 1;
        System.out.println("1 << 32 is: " + (value << 32));   // same as << 0
        System.out.println("1 << 33 is: " + (value << 33));   // same as << 1

        // POINT 1: signed against unsigned right shift
        int negative = -16;
        System.out.println("-16 >> 2  : " + (negative >> 2));    // keeps the sign
        System.out.println("-16 >>> 2 : " + (negative >>> 2));   // fills with zeros

        // POINT 3: modulus on a negative number truncates toward zero
        System.out.println("-7 % 3  : " + (-7 % 3));
        System.out.println("Math.floorMod(-7, 3): " + Math.floorMod(-7, 3));

        // POINT 2: the ternary unboxes and can throw a NullPointerException
        Map<String, Integer> limits = new HashMap<>();
        limits.put("GOLD", 500000);
        Integer bronzeLimit = limits.get("BRONZE");   // null

        try {
            // WRONG: one branch is int, so the whole expression unboxes the null
            int limit = true ? bronzeLimit : 0;
            System.out.println(limit);
        } catch (NullPointerException e) {
            System.out.println("WRONG ternary threw NPE while unboxing null");
        }

        // RIGHT: keep both branches the same reference type, or default first
        int rightLimit = (bronzeLimit != null) ? bronzeLimit : 0;
        System.out.println("RIGHT limit: " + rightLimit);

        // POINT 2: and masking instead of modulus for a power of two capacity
        int capacity = 16;                       // must be a power of two
        int hash = "meera@okhdfc".hashCode();
        int indexByMod = Math.floorMod(hash, capacity);
        int indexByMask = hash & (capacity - 1);
        System.out.println("Mod index  : " + indexByMod);
        System.out.println("Mask index : " + indexByMask + " (same, and faster)");
    }
}
// OUTPUT:
// i = i++ leaves i as: 5
// j = ++j leaves j as: 6
// 1 << 32 is: 1
// 1 << 33 is: 2
// -16 >> 2  : -4
// -16 >>> 2 : 1073741820
// -7 % 3  : -1
// Math.floorMod(-7, 3): 2
// WRONG ternary threw NPE while unboxing null
// RIGHT limit: 0
// Mod index  : <depends on hash>
// Mask index : <same value, and faster>`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
• <b>Single instruction cost.</b> Integer arithmetic, shifts and comparisons compile to one or two machine instructions after JIT. <br>
• <b>Branch free tricks.</b> Bit masks and Math.max let the CPU avoid a branch, which matters when branch prediction fails. <br>
• <b>Short circuit gives a natural guard order,</b> which lets you write a null check and a use in one condition safely. <br>
• <b>Math.addExact and multiplyExact</b> turn silent overflow into a clear ArithmeticException. <br>
• <b>Switch expressions with arrow labels</b> remove fall through bugs and give exhaustiveness checking. <br><br>

<h3>5. Disadvantages (Advanced)</h3>
• <b>plus plus is not atomic.</b> Under threads it loses updates, and only AtomicInteger or a lock fixes it. <br>
• <b>Bit tricks hurt maintainability</b> and are often no faster than the plain version once the JIT has run. <br>
• <b>Floating point comparison with double equals</b> is unreliable, and NaN is not even equal to itself. <br>
• <b>Negative zero</b> makes 0.0 equals equals minus 0.0 true while Double.compare says they differ. <br>
• <b>String concatenation inside a loop</b> with plus creates a new object every pass and is quadratic. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level: lost updates, exact maths and float traps

import java.util.concurrent.atomic.AtomicLong;

public class OperatorConcurrencyDemo {

    static long unsafeCounter = 0;
    static final AtomicLong safeCounter = new AtomicLong();

    public static void main(String[] args) throws Exception {

        // DISADVANTAGE 5: plus plus is read, modify, write. Threads lose updates.
        Runnable unsafe = () -> {
            for (int k = 0; k < 100000; k++) {
                unsafeCounter++;          // WRONG under threads
            }
        };
        Runnable safe = () -> {
            for (int k = 0; k < 100000; k++) {
                safeCounter.incrementAndGet();   // RIGHT
            }
        };

        Thread t1 = new Thread(unsafe), t2 = new Thread(unsafe);
        Thread t3 = new Thread(safe), t4 = new Thread(safe);
        t1.start(); t2.start(); t3.start(); t4.start();
        t1.join(); t2.join(); t3.join(); t4.join();

        System.out.println("Expected      : 200000");
        System.out.println("WRONG counter : " + unsafeCounter + " (usually less)");
        System.out.println("RIGHT counter : " + safeCounter.get());

        // ADVANTAGE 4: exact arithmetic instead of silent wrap
        try {
            int bad = Math.multiplyExact(100000, 50000);
            System.out.println(bad);
        } catch (ArithmeticException e) {
            System.out.println("multiplyExact reported: " + e.getMessage());
        }

        // DISADVANTAGE 5: NaN and negative zero
        double nan = 0.0 / 0.0;
        System.out.println("NaN == NaN            : " + (nan == nan));
        System.out.println("Double.isNaN(nan)     : " + Double.isNaN(nan));
        System.out.println("0.0 == -0.0           : " + (0.0 == -0.0));
        System.out.println("Double.compare(0,-0)  : " + Double.compare(0.0, -0.0));

        // DISADVANTAGE 5: concatenation in a loop
        long start = System.nanoTime();
        String slow = "";
        for (int k = 0; k < 20000; k++) {
            slow += "x";                     // WRONG, quadratic
        }
        long slowMs = (System.nanoTime() - start) / 1000000;

        start = System.nanoTime();
        StringBuilder sb = new StringBuilder();
        for (int k = 0; k < 20000; k++) {
            sb.append("x");                  // RIGHT, linear
        }
        long fastMs = (System.nanoTime() - start) / 1000000;

        System.out.println("Concat loop  : about " + slowMs + " ms, length "
                + slow.length());
        System.out.println("Builder loop : about " + fastMs + " ms, length "
                + sb.length());
    }
}
// OUTPUT (numbers vary):
// Expected      : 200000
// WRONG counter : 143927 (usually less)
// RIGHT counter : 200000
// multiplyExact reported: integer overflow
// NaN == NaN            : false
// Double.isNaN(nan)     : true
// 0.0 == -0.0           : true
// Double.compare(0,-0)  : 1
// Concat loop  : about 180 ms, length 20000
// Builder loop : about 1 ms, length 20000`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
• <b>HashMap in the JDK:</b> the bucket index is hash and capacity minus one, which works only because the table size is always a power of two. <br>
• <b>Kafka and ring buffers:</b> the next slot is computed with an and mask so the wrap around costs nothing. <br>
• <b>Feature flags in a banking core:</b> thirty flags packed into one int, checked with a bitwise and, saving a whole object per record. <br>
• <b>Risk engine:</b> Math.addExact used on exposure totals so an overflow becomes a loud failure and not a wrong number on a dashboard. <br>
• <b>UPI throughput counters:</b> LongAdder rather than plus plus, because it splits contention across cells. <br>
• <b>Global example, a game engine:</b> branch free clamping with bit masks in the inner rendering loop. <br><br>

<b>Interview answers to keep ready</b><br>
• Why does i equals i plus plus not change i? The old value is pushed on the stack before the increment and then assigned back. <br>
• Difference between greater greater and greater greater greater? The first preserves the sign bit, the second always shifts in zeros. <br>
• Is plus plus atomic? No. Use AtomicInteger, LongAdder or synchronisation. <br>
• Why is x equals equals y unreliable for double? Because of binary rounding. Compare with a tolerance or with BigDecimal. <br>`,
                                codeExamples: [
                                    `// Point 6 at expert level: packed feature flags and a masked ring buffer

public class BitFlagRingBufferDemo {

    // Real time: thirty banking feature flags packed into one int
    static final int FLAG_UPI        = 1;        // 0000 0001
    static final int FLAG_NEFT       = 1 << 1;   // 0000 0010
    static final int FLAG_INTL_CARD  = 1 << 2;   // 0000 0100
    static final int FLAG_LOCKER     = 1 << 3;   // 0000 1000
    static final int FLAG_NRI        = 1 << 4;   // 0001 0000

    static boolean has(int flags, int flag) {
        return (flags & flag) != 0;
    }

    static int enable(int flags, int flag) {
        return flags | flag;
    }

    static int disable(int flags, int flag) {
        return flags & ~flag;
    }

    // Real time: fixed size ring buffer indexed with an and mask
    static class RingBuffer {
        private final String[] slots;
        private final int mask;
        private int writeIndex = 0;

        RingBuffer(int capacityPowerOfTwo) {
            // WRONG: any capacity would force a modulus on every write
            // RIGHT: force a power of two so we can mask instead
            this.slots = new String[capacityPowerOfTwo];
            this.mask = capacityPowerOfTwo - 1;
        }

        void write(String event) {
            slots[writeIndex & mask] = event;
            writeIndex++;
        }

        String read(int logicalIndex) {
            return slots[logicalIndex & mask];
        }
    }

    public static void main(String[] args) {

        int customerFlags = 0;
        customerFlags = enable(customerFlags, FLAG_UPI);
        customerFlags = enable(customerFlags, FLAG_NEFT);
        customerFlags = enable(customerFlags, FLAG_LOCKER);
        customerFlags = disable(customerFlags, FLAG_NEFT);

        System.out.println("Flag bits    : " + Integer.toBinaryString(customerFlags));
        System.out.println("UPI enabled  : " + has(customerFlags, FLAG_UPI));
        System.out.println("NEFT enabled : " + has(customerFlags, FLAG_NEFT));
        System.out.println("NRI enabled  : " + has(customerFlags, FLAG_NRI));

        RingBuffer buffer = new RingBuffer(4);
        buffer.write("TXN-1");
        buffer.write("TXN-2");
        buffer.write("TXN-3");
        buffer.write("TXN-4");
        buffer.write("TXN-5");      // wraps over TXN-1 with no modulus

        for (int k = 0; k < 4; k++) {
            System.out.println("slot " + k + " holds " + buffer.read(k));
        }
    }
}
// OUTPUT:
// Flag bits    : 1001
// UPI enabled  : true
// NEFT enabled : false
// NRI enabled  : false
// slot 0 holds TXN-5
// slot 1 holds TXN-2
// slot 2 holds TXN-3
// slot 3 holds TXN-4`
                                ]
                            }
                        ]
};
