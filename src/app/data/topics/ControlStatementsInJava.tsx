import { Topic } from '../coreJava';
import ifImg from '../../../assets/ifif.jpeg';
import ifElseImg from '../../../assets/ifelse.png';
import ifElseLadderImg from '../../../assets/ifelseladder.png';
import ifNestedImg from '../../../assets/ifnested.png';
import switchCaseImg from '../../../assets/switchcase.png';

export const controlStatementsInJava: Topic = {
                        id: "Control Statements in Java",
                        name: "Control Statements in Java",
                        beginner: [
                            {
                                content: `Control statements in Java manage the flow of program execution by allowing the code to make decisions, repeat tasks, or jump to different parts of the code. <br><br>
There are 5 common types of control statements: <br>
1. if statement <br>
2. if-else statement <br>
3. if-else-if ladder <br>
4. Nested if statement <br>
5. switch statement <br><br>

Here is the basic decision-flow every if/else-if ladder follows: <br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        condition?
        /       \\
      true      false
       |           |
   run if-block  run else-block</pre>`
                            },
                            {
                                content: `<h3>1. if statement</h3>
The <code>if</code> block runs only when its condition is <code>true</code>. If the condition is <code>false</code>, the block is simply skipped.<br>
<div class="bg-secondary border border-primary p-3">
Syntax-<br>
if (condition) { <br>
&nbsp;&nbsp;statement 1; <br>
}
</div>
<h4>Flowchart of if:</h4>
<img src="${ifImg}" alt="Flowchart of if statement" class="d-block mx-auto h-80"/>`,
                                codeExamples: [
                                    `public class IfDemo {
    public static void main(String[] args) {
        int a = 10;
        if (a < 50) {
            System.out.println("a is smaller");
        }
    }
}
// OUTPUT:
// a is smaller`
                                ]
                            },
                            {
                                content: `<h3>2. if-else statement</h3>
When the condition is <code>true</code> the <code>if</code> block runs; when it is <code>false</code> the <code>else</code> block runs instead. Exactly one of the two blocks executes.<br>
<div class="bg-secondary border border-primary p-3">
Syntax-<br>
if (condition) { <br>
&nbsp;&nbsp;statement 1; // runs when condition is true <br>
} else { <br>
&nbsp;&nbsp;statement 2; // runs when condition is false <br>
}
</div>
<h4>Flowchart of if-else:</h4>
<img src="${ifElseImg}" alt="Flowchart of if-else statement" class="d-block mx-auto h-80"/>`,
                                codeExamples: [
                                    `public class IfElseDemo {
    public static void main(String[] args) {
        int a = 10;
        if (a > 50) {
            System.out.println("a is greater.");
        } else {
            System.out.println("a is smaller.");
        }
    }
}
// OUTPUT:
// a is smaller.`
                                ]
                            },
                            {
                                content: `<h3>3. if-else-if ladder</h3>
Used to pick exactly one branch out of many conditions. Java checks each condition top to bottom and runs the block for the first one that is <code>true</code> - if none match, the final <code>else</code> runs.<br>
<div class="bg-secondary border border-primary p-3">
Syntax-<br>
if (condition 1) { statement 1; } <br>
else if (condition 2) { statement 2; } <br>
else if (condition 3) { statement 3; } <br>
else { statement 4; } // runs only if all conditions are false
</div>
<h4>Flowchart of if-else-if ladder:</h4>
<img src="${ifElseLadderImg}" alt="Flowchart of if-else-if ladder" class="d-block mx-auto h-96"/>`,
                                codeExamples: [
                                    `public class GradeLadderDemo {
    public static void main(String[] args) {
        int marks = 70;
        if (marks >= 50 && marks < 60) {
            System.out.println("D grade");
        } else if (marks >= 60 && marks < 70) {
            System.out.println("C grade");
        } else if (marks >= 70 && marks < 80) {
            System.out.println("B grade");
        } else if (marks >= 80 && marks <= 100) {
            System.out.println("A grade");
        } else {
            System.out.println("incorrect input");
        }
    }
}
// OUTPUT:
// B grade`
                                ]
                            },
                            {
                                content: `<h3>4. Nested if statement</h3>
An <code>if</code> block placed inside another <code>if</code> block. The inner condition is checked only when the outer condition is already <code>true</code>.<br>
<div class="bg-secondary border border-primary p-3">
Syntax-<br>
if (condition 1) { <br>
&nbsp;&nbsp;if (condition 2) { <br>
&nbsp;&nbsp;&nbsp;&nbsp;statement 1; // runs when both conditions are true <br>
&nbsp;&nbsp;} else { <br>
&nbsp;&nbsp;&nbsp;&nbsp;statement 2; // runs when condition 1 is true but condition 2 is false <br>
&nbsp;&nbsp;} <br>
}
</div>
<h4>Flowchart of nested if:</h4>
<img src="${ifNestedImg}" alt="Flowchart of nested if statement" class="d-block mx-auto h-96"/>`,
                                codeExamples: [
                                    `public class NestedIfDemo {
    public static void main(String[] args) {
        int age = 18;
        if (age >= 18) {           // outer condition
            if (age <= 32) {       // inner condition
                System.out.println("Candidate is applicable for UPSC exam");
            } else {
                System.out.println("Candidate is not applicable for UPSC exam");
            }
        }
    }
}
// OUTPUT:
// Candidate is applicable for UPSC exam`
                                ]
                            },
                            {
                                content: `<h3>5. switch statement</h3>
The <code>switch</code> statement executes the block that matches the value of an expression. It works with <code>byte</code>, <code>short</code>, <code>int</code>, <code>char</code>, <code>String</code> and <code>enum</code> types. Each <code>case</code> should end with <code>break</code> so only that one block runs; <code>default</code> runs when no case matches. Case values must be unique (no duplicates).<br>
<div class="bg-secondary border border-primary p-3">
Syntax-<br>
switch (expression) { <br>
&nbsp;&nbsp;case value1: statement 1; break; <br>
&nbsp;&nbsp;case value2: statement 2; break; <br>
&nbsp;&nbsp;default: default statement; <br>
}
</div>
<h4>Flowchart of switch:</h4>
<img src="${switchCaseImg}" alt="Flowchart of switch statement" class="d-block mx-auto h-96"/>`,
                                codeExamples: [
                                    `public class SwitchDemo {
    public static void main(String[] args) {
        int number = 2;
        switch (number) {
            case 1:
                System.out.println("this is 1 number");
                break;
            case 2:
                System.out.println("this is 2 number");
                break;
            case 3:
                System.out.println("this is 3 number");
                break;
            default:
                System.out.println("Invalid input");
        }
    }
}
// OUTPUT:
// this is 2 number`
                                ]
                            },
                            {
                                content: `<h3>What happens if you forget break in a switch?</h3>
Without <code>break</code>, execution "falls through" into every case below the matching one, until it hits a <code>break</code> or reaches the end of the switch. This is a very common beginner bug.<br>`,
                                codeExamples: [
                                    `public class FallThroughBeginnerDemo {
    public static void main(String[] args) {
        int day = 1;
        switch (day) {
            case 1:
                System.out.println("Monday");
            case 2:
                System.out.println("Tuesday");
            default:
                System.out.println("Some other day");
        }
    }
}
// OUTPUT (no break -> falls through every case below the match):
// Monday
// Tuesday
// Some other day`
                                ]
                            },
                            {
                                content: `<h3>1. Definition</h3>
• A <b>control statement</b> is a statement that decides which line of code runs next. Without them a program would only run top to bottom, once. <br>
• Java has three kinds. <b>Decision making</b> with if, if else, else if ladder, nested if and switch. <b>Looping</b> with for, while, do while and the enhanced for. <b>Jump</b> with break, continue and return. <br>
• A decision statement always tests a <b>boolean condition</b>. Java will not accept an int here, so if of 1 is a compile error unlike C. <br>
• <b>switch</b> compares one value against many constant labels, and since Java 14 it can also be an expression that returns a value with the arrow form. <br><br>

<h3>2. Purpose of This Topic</h3>
• To let a program <b>react to data</b>, for example give a discount only when the bill crosses two thousand rupees. <br>
• To <b>validate input</b> before using it, such as checking that a withdrawal amount is not more than the balance. <br>
• To <b>choose one path out of many</b> cleanly with switch instead of a long chain of if else. <br>
• To <b>stop early</b> when the answer is already known, using return or break. <br><br>

<h3>3. Need of This Topic</h3>
• Every real application is full of rules. Fee concession, loan eligibility, seat availability, all of them are conditions. <br>
• Without conditions you cannot write even a simple login check. <br>
• A missing else or a wrong condition order is one of the most common bugs in business logic. <br>
• Interviewers test switch fall through and the dangling else in almost every beginner round. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3: if, else if ladder, nested if and switch in one program
// Income tax slab and a college grade calculator

public class ControlBasicsDemo {

    // POINT 2: choose one path out of many
    static String grade(int marks) {
        if (marks < 0 || marks > 100) {
            return "INVALID";        // POINT 2: validate first
        } else if (marks >= 90) {
            return "A+";
        } else if (marks >= 75) {
            return "A";
        } else if (marks >= 60) {
            return "B";
        } else if (marks >= 40) {
            return "C";
        } else {
            return "FAIL";
        }
    }

    // POINT 1: nested if for a loan decision
    static String loanDecision(int cibil, long monthlyIncome, boolean salaried) {
        if (cibil >= 750) {
            if (monthlyIncome >= 50000) {
                return salaried ? "APPROVED at 9.2 percent" : "APPROVED at 10.5 percent";
            } else {
                return "APPROVED with a lower limit";
            }
        } else {
            return "REJECTED, improve your CIBIL score";
        }
    }

    public static void main(String[] args) {

        System.out.println("Marks 92 grade: " + grade(92));
        System.out.println("Marks 61 grade: " + grade(61));
        System.out.println("Marks 35 grade: " + grade(35));
        System.out.println("Marks -5 grade: " + grade(-5));

        System.out.println(loanDecision(780, 90000, true));
        System.out.println(loanDecision(780, 30000, false));
        System.out.println(loanDecision(690, 90000, true));

        // POINT 1: classic switch with break
        int dayNumber = 3;
        switch (dayNumber) {
            case 1:
                System.out.println("Monday, staff meeting");
                break;
            case 2:
                System.out.println("Tuesday, lab session");
                break;
            case 3:
                System.out.println("Wednesday, internal exam");
                break;
            default:
                System.out.println("Regular class day");
        }

        // POINT 1: WRONG, a missing break causes fall through
        int wrongDay = 1;
        System.out.print("Fall through demo: ");
        switch (wrongDay) {
            case 1:
                System.out.print("Monday ");
                // no break, so it falls into case 2
            case 2:
                System.out.print("Tuesday ");
                break;
            default:
                System.out.print("Other ");
        }
        System.out.println();

        // POINT 1: RIGHT, the arrow form never falls through
        String meal = switch (dayNumber) {
            case 1, 2 -> "Poha and tea";
            case 3, 4 -> "Idli and sambar";
            default   -> "Roti and sabzi";
        };
        System.out.println("Canteen menu: " + meal);
    }
}
// OUTPUT:
// Marks 92 grade: A+
// Marks 61 grade: B
// Marks 35 grade: FAIL
// Marks -5 grade: INVALID
// APPROVED at 9.2 percent
// APPROVED with a lower limit
// REJECTED, improve your CIBIL score
// Wednesday, internal exam
// Fall through demo: Monday Tuesday
// Canteen menu: Idli and sambar`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages</h3>
• <b>Programs become intelligent.</b> The same code gives different results for different customers. <br>
• <b>Rules stay readable.</b> An else if ladder reads almost like the policy document it came from. <br>
• <b>switch is faster and clearer</b> than a long chain of equality tests on the same variable. <br>
• <b>Early return keeps code flat,</b> which is much easier to read than deep nesting. <br>
• <b>The compiler helps.</b> An enhanced switch on an enum warns you when a new constant is not handled. <br><br>

<h3>5. Disadvantages</h3>
• <b>Deep nesting becomes unreadable.</b> Four levels of if inside if is the classic arrow shaped code smell. <br>
• <b>Missing break causes fall through</b> in the old switch form and produces very confusing output. <br>
• <b>Condition order matters.</b> Putting the widest condition first makes every later branch unreachable in practice. <br>
• <b>A stray semicolon after if</b> silently makes the body run always, and it still compiles. <br>
• <b>Comparing objects with double equals</b> inside a condition compares addresses, not values. <br>
• <b>Too many branches</b> is often a sign you should use polymorphism or a map instead. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5: common condition bugs and the clean fix

import java.util.HashMap;
import java.util.Map;

public class ControlPitfallDemo {

    // DISADVANTAGE 5: WRONG order, the widest test comes first
    static String wrongDiscount(int billRupees) {
        if (billRupees > 500) {
            return "5 percent";
        } else if (billRupees > 2000) {
            return "10 percent";     // can never be reached
        } else if (billRupees > 5000) {
            return "20 percent";     // can never be reached
        }
        return "No discount";
    }

    // ADVANTAGE 4: RIGHT order, narrowest first
    static String rightDiscount(int billRupees) {
        if (billRupees > 5000) {
            return "20 percent";
        } else if (billRupees > 2000) {
            return "10 percent";
        } else if (billRupees > 500) {
            return "5 percent";
        }
        return "No discount";
    }

    // ADVANTAGE 4: early return removes deep nesting
    static String checkout(String user, Integer cartCount, boolean paymentOk) {
        if (user == null) return "Login required";
        if (cartCount == null || cartCount == 0) return "Cart is empty";
        if (!paymentOk) return "Payment failed";
        return "Order placed for " + user;
    }

    public static void main(String[] args) {

        System.out.println("WRONG for Rs 6000: " + wrongDiscount(6000));
        System.out.println("RIGHT for Rs 6000: " + rightDiscount(6000));

        System.out.println(checkout(null, 3, true));
        System.out.println(checkout("Divya", 0, true));
        System.out.println(checkout("Divya", 3, false));
        System.out.println(checkout("Divya", 3, true));

        // DISADVANTAGE 5: a stray semicolon after if
        int stock = 0;
        if (stock > 0);                       // WRONG, empty body
        {
            System.out.println("WRONG: this prints even with zero stock");
        }

        // RIGHT version
        if (stock > 0) {
            System.out.println("In stock");
        } else {
            System.out.println("RIGHT: out of stock");
        }

        // DISADVANTAGE 5: too many branches, replaced by a map lookup
        Map<String, Integer> courierDays = new HashMap<>();
        courierDays.put("MUMBAI", 1);
        courierDays.put("PUNE", 2);
        courierDays.put("DELHI", 3);
        courierDays.put("GUWAHATI", 6);

        String city = "DELHI";
        int days = courierDays.getOrDefault(city, 7);
        System.out.println("Delivery to " + city + " in " + days + " days");
    }
}
// OUTPUT:
// WRONG for Rs 6000: 5 percent
// RIGHT for Rs 6000: 20 percent
// Login required
// Cart is empty
// Payment failed
// Order placed for Divya
// WRONG: this prints even with zero stock
// RIGHT: out of stock
// Delivery to DELHI in 3 days`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples</h3>
• <b>ATM withdrawal:</b> if the amount is more than the balance, reject. If it is not a multiple of one hundred, reject. Otherwise dispense. <br>
• <b>IRCTC booking:</b> switch on the quota, general, tatkal, ladies or senior citizen, to pick the fare rule. <br>
• <b>College admission portal:</b> nested if for category, marks and domicile to decide the merit list. <br>
• <b>Electricity board:</b> slab wise billing with an else if ladder on units consumed. <br>
• <b>Swiggy delivery fee:</b> if the order is above three hundred rupees the fee is zero, else forty rupees, plus a rain surcharge. <br>
• <b>Global example, a traffic light controller:</b> a switch on the current colour decides the next colour. <br><br>

<b>Student tip:</b> write the conditions in the same order the rulebook writes them, most specific first, and always add a final else so no input silently falls through.`,
                                codeExamples: [
                                    `// Point 6: an electricity bill with slabs and an ATM guard

public class ControlRealTimeDemo {

    // Real time: Maharashtra style slab billing
    static double electricityBill(int units) {
        double amount;
        if (units <= 100) {
            amount = units * 4.5;
        } else if (units <= 300) {
            amount = (100 * 4.5) + ((units - 100) * 7.2);
        } else if (units <= 500) {
            amount = (100 * 4.5) + (200 * 7.2) + ((units - 300) * 10.4);
        } else {
            amount = (100 * 4.5) + (200 * 7.2) + (200 * 10.4)
                   + ((units - 500) * 12.8);
        }
        double dutyPercent = (units > 300) ? 0.16 : 0.10;
        return amount + (amount * dutyPercent);
    }

    // Real time: ATM guard clauses
    static String withdraw(long balancePaise, long requestPaise) {
        if (requestPaise <= 0) return "Enter a valid amount";
        if (requestPaise % 10000 != 0) return "Only multiples of Rs 100 allowed";
        if (requestPaise > balancePaise) return "Insufficient balance";
        if (requestPaise > 2500000) return "Daily limit is Rs 25000";
        return "Dispensed Rs " + (requestPaise / 100);
    }

    // Real time: traffic light using a switch expression
    static String nextLight(String current) {
        return switch (current) {
            case "RED"    -> "GREEN";
            case "GREEN"  -> "YELLOW";
            case "YELLOW" -> "RED";
            default       -> "BLINKING YELLOW";
        };
    }

    public static void main(String[] args) {

        int[] readings = {80, 250, 450, 720};
        for (int units : readings) {
            System.out.printf("Units %3d bill Rs %.2f%n", units, electricityBill(units));
        }

        long balance = 4500000L;   // Rs 45000
        System.out.println(withdraw(balance, 0));
        System.out.println(withdraw(balance, 25050));
        System.out.println(withdraw(balance, 9000000));
        System.out.println(withdraw(balance, 3000000));
        System.out.println(withdraw(balance, 500000));

        String light = "RED";
        for (int k = 0; k < 4; k++) {
            System.out.println(light + " turns to " + nextLight(light));
            light = nextLight(light);
        }
    }
}
// OUTPUT:
// Units  80 bill Rs 396.00
// Units 250 bill Rs 1683.00
// Units 450 bill Rs 4002.00
// Units 720 bill Rs 7871.76
// Enter a valid amount
// Only multiples of Rs 100 allowed
// Insufficient balance
// Daily limit is Rs 25000
// Dispensed Rs 5000
// RED turns to GREEN
// GREEN turns to YELLOW
// YELLOW turns to RED
// RED turns to GREEN`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Decision Flow — if / else-if / else</h3>
Each condition is evaluated top to bottom; the first one that is <strong>true</strong> runs its block and the rest are skipped:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        condition1?
        /        \\
      true       false
       |            |
   run block1   condition2?
                /        \\
              true       false
               |            |
           run block2   run else block</pre>

Only <strong>one</strong> branch of the ladder ever executes per run — this differs from a fall-through switch, where multiple cases can execute unless you stop them explicitly.<br>`,
                                codeExamples: [
                                    `public class GradeDemo {
    public static void main(String[] args) {
        int marks = 82;
        if (marks >= 90) {
            System.out.println("Grade: O");
        } else if (marks >= 75) {
            System.out.println("Grade: A");
        } else if (marks >= 50) {
            System.out.println("Grade: B");
        } else {
            System.out.println("Grade: F");
        }
    }
}
// OUTPUT:
// Grade: A`
                                ]
                            },
                            {
                                content: `<h3>Ternary Operator vs if-else</h3>
The ternary operator <code>condition ? valueIfTrue : valueIfFalse</code> is an <strong>expression</strong> — it produces a value and can be used inline (e.g. inside an assignment or a method call). <code>if-else</code> is a <strong>statement</strong> — it controls flow but does not itself produce a value. Use ternary for short, single-value decisions; use if-else once you need multiple statements per branch, side effects, or more than 2-3 branches (nested ternaries hurt readability fast).<br>`,
                                codeExamples: [
                                    `public class TernaryVsIfElseDemo {
    public static void main(String[] args) {
        int a = 10, b = 20;

        // Ternary - concise, single expression
        int max1 = (a > b) ? a : b;

        // Equivalent if-else - more verbose, but easier to extend with more logic
        int max2;
        if (a > b) {
            max2 = a;
        } else {
            max2 = b;
        }

        System.out.println("max1 = " + max1);
        System.out.println("max2 = " + max2);
    }
}
// OUTPUT:
// max1 = 20
// max2 = 20`
                                ]
                            },
                            {
                                content: `<h3>Nested Conditionals and Short-Circuit Evaluation</h3>
Java's <code>&amp;&amp;</code> and <code>||</code> are <strong>short-circuiting</strong>: for <code>&amp;&amp;</code>, if the left operand is <code>false</code>, the right operand is never evaluated (the whole expression is already <code>false</code>); for <code>||</code>, if the left operand is <code>true</code>, the right operand is skipped. This is commonly used to avoid a nested if and to guard against errors like null dereferences or division by zero.<br>`,
                                codeExamples: [
                                    `public class ShortCircuitDemo {
    static boolean sideEffect(String label, boolean value) {
        System.out.println("Evaluated: " + label);
        return value;
    }

    public static void main(String[] args) {
        System.out.println("--- && short-circuit ---");
        if (sideEffect("left(false)", false) && sideEffect("right", true)) {
            System.out.println("both true");
        }

        System.out.println("--- || short-circuit ---");
        if (sideEffect("left(true)", true) || sideEffect("right", true)) {
            System.out.println("at least one true");
        }

        System.out.println("--- nested-if replaced by && (avoids NullPointerException) ---");
        String text = null;
        if (text != null && text.length() > 0) {
            System.out.println("non-empty text");
        } else {
            System.out.println("text is null or empty - right side of && was never evaluated");
        }
    }
}
// OUTPUT:
// --- && short-circuit ---
// Evaluated: left(false)
// --- || short-circuit ---
// Evaluated: left(true)
// at least one true
// --- nested-if replaced by && (avoids NullPointerException) ---
// text is null or empty - right side of && was never evaluated`
                                ]
                            },
                            {
                                content: `<h3>Switch Fall-Through — With and Without break</h3>
Without <code>break</code>, execution "falls through" and keeps running every case below the matching one until it hits a <code>break</code> or the end of the switch:<br>`,
                                codeExamples: [
                                    `public class FallThroughDemo {
    public static void main(String[] args) {
        int day = 2;
        switch (day) {
            case 1:
                System.out.println("Monday");
            case 2:
                System.out.println("Tuesday");
            case 3:
                System.out.println("Wednesday");
            default:
                System.out.println("Some other day");
        }
    }
}
// OUTPUT (no break -> falls through from case 2 onward):
// Tuesday
// Wednesday
// Some other day`,
                                    `public class WithBreakDemo {
    public static void main(String[] args) {
        int day = 2;
        switch (day) {
            case 1:
                System.out.println("Monday");
                break;
            case 2:
                System.out.println("Tuesday");
                break;
            case 3:
                System.out.println("Wednesday");
                break;
            default:
                System.out.println("Some other day");
        }
    }
}
// OUTPUT (with break -> only the matching case runs):
// Tuesday`
                                ]
                            },
                            {
                                content: `<h3>switch on String and enum</h3>
Besides <code>byte/short/int/char</code>, <code>switch</code> also accepts <code>String</code> (matched via <code>.equals()</code>/<code>hashCode()</code> internally) and <code>enum</code> (matched by constant name, no need to qualify with the enum type in the case labels). enum is generally preferred for a fixed, closed set of options because the compiler can help catch missing/misspelled cases.<br>`,
                                codeExamples: [
                                    `public class SwitchOnStringDemo {
    public static void main(String[] args) {
        String city = "Pune";
        switch (city) {
            case "Mumbai":
                System.out.println("Financial capital");
                break;
            case "Pune":
                System.out.println("Oxford of the East");
                break;
            default:
                System.out.println("Unknown city");
        }
    }
}
// OUTPUT:
// Oxford of the East`,
                                    `public class SwitchOnEnumDemo {
    enum Day { MON, TUE, WED, THU, FRI, SAT, SUN }

    public static void main(String[] args) {
        Day today = Day.SAT;
        switch (today) {
            case SAT:
            case SUN:
                System.out.println("Weekend");
                break;
            default:
                System.out.println("Weekday");
        }
    }
}
// OUTPUT:
// Weekend`
                                ]
                            },
                            {
                                content: `<h3>Modern Switch Expressions (Java 14+)</h3>
A switch <strong>expression</strong> uses arrow syntax (<code>-&gt;</code>), returns a value directly, and never falls through — no <code>break</code> needed. <code>yield</code> is used when a case needs a multi-statement block that still produces a value.<br>`,
                                codeExamples: [
                                    `// Classic switch STATEMENT — verbose, needs a mutable variable + break
public class ClassicSwitchDemo {
    public static void main(String[] args) {
        int day = 3;
        String name;
        switch (day) {
            case 1:
                name = "Monday";
                break;
            case 2:
                name = "Tuesday";
                break;
            case 3:
                name = "Wednesday";
                break;
            default:
                name = "Unknown";
        }
        System.out.println(name);
    }
}
// OUTPUT:
// Wednesday`,
                                    `// Modern switch EXPRESSION — concise, no fall-through, no break
public class SwitchExpressionDemo {
    public static void main(String[] args) {
        int day = 3;
        String name = switch (day) {
            case 1 -> "Monday";
            case 2 -> "Tuesday";
            case 3 -> "Wednesday";
            default -> {
                String fallback = "Unknown";
                yield fallback;   // yield returns a value from a block case
            }
        };
        System.out.println(name);
    }
}
// OUTPUT:
// Wednesday`
                                ]
                            },
                            {
                                content: `<h3>Pattern Matching for Switch (Java 21)</h3>
A switch can now match on an object's <strong>type</strong> directly in the case label, including a dedicated <code>null</code> case — removing the need for manual <code>instanceof</code> + cast chains.<br>`,
                                codeExamples: [
                                    `public class PatternSwitchDemo {
    static String describe(Object obj) {
        return switch (obj) {
            case null -> "It's null";
            case Integer i -> "Integer: " + i;
            case String s -> "String of length " + s.length();
            case int[] arr -> "int array of size " + arr.length;
            default -> "Unknown type: " + obj.getClass().getSimpleName();
        };
    }

    public static void main(String[] args) {
        System.out.println(describe(42));
        System.out.println(describe("Hello"));
        System.out.println(describe(new int[]{1, 2, 3}));
        System.out.println(describe(null));
        System.out.println(describe(3.14));
    }
}
// OUTPUT:
// Integer: 42
// String of length 5
// int array of size 3
// It's null
// Unknown type: Double`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question / Trap</th><th>Answer</th></tr>
<tr class='text-center'><td>Missing break in a classic switch</td><td>Fall-through — runs every case below the match</td></tr>
<tr class='text-center'><td>switch on a null String</td><td>Throws NullPointerException at runtime</td></tr>
<tr class='text-center'><td>switch on String vs int vs enum</td><td>All are supported, but String switch uses .equals()/hashCode() internally — slightly heavier than int; enum is preferred for a fixed, closed set of options</td></tr>
<tr class='text-center'><td>Duplicate case labels</td><td>Compile-time error</td></tr>
<tr class='text-center'><td>Forgetting default</td><td>No error, but unmatched values silently do nothing (classic switch) or the compiler may require exhaustiveness (switch expression)</td></tr>
<tr class='text-center'><td>Difference between switch statement and switch expression</td><td>Statement executes code and does not return a value, can fall through; expression (Java 14+) evaluates to a value, uses -&gt;, never falls through</td></tr>
<tr class='text-center'><td>When to use ternary vs if-else?</td><td>Ternary for a short single-value decision inline; if-else once you need multiple statements, side effects, or several branches</td></tr>
<tr class='text-center'><td>Why do &amp;&amp; and || matter for control flow?</td><td>Short-circuit evaluation skips the right operand when the result is already determined — commonly used to guard against null/zero before a nested if would otherwise be needed</td></tr>
</table>
<br>
<strong>Rule of thumb:</strong> prefer if-else for a few boolean-style conditions or ranges; prefer switch (ideally the modern expression form) when branching on one variable's discrete set of values — it's clearer and the compiler can catch missing cases.<br>`
                            },
                            {
                                content: `<h3>1. Definition (Advanced)</h3>
• At bytecode level a control statement is a <b>conditional jump</b>. if compiles to ifeq, if_icmplt and friends, and the compiler usually inverts your condition so the fall through path is the common one. <br>
• <b>switch has two bytecodes.</b> tableswitch is an O of 1 jump table used when the case labels are dense, and lookupswitch is a binary search used when they are sparse. This is why switch on dense ints is faster than an if chain. <br>
• <b>switch on String</b> is compiled into two switches, first on hashCode with an equals check, then on an index, so it is still not a linear scan. <br>
• A <b>switch expression</b> must be exhaustive and yields a value, using arrow labels or the yield keyword. On a sealed type or an enum the compiler proves exhaustiveness for you. <br>
• <b>Pattern matching for switch</b> lets you match on type and deconstruct records, replacing the visitor pattern for closed hierarchies. <br><br>

<h3>2. Purpose of This Topic (Advanced)</h3>
• To make illegal states <b>impossible to forget</b>, by letting the compiler fail the build when a new enum constant appears. <br>
• To keep hot paths <b>branch predictor friendly</b>, ordering conditions so the common case is checked first. <br>
• To replace <b>long conditional chains with polymorphism, strategy maps or a rules table</b> when branching grows past a handful of cases. <br>
• To handle <b>null explicitly</b>, since a switch on a null String throws NullPointerException unless you write case null. <br><br>

<h3>3. Need of This Topic (Advanced)</h3>
• Production defects cluster in badly ordered or incomplete conditionals, especially after a new business rule is added. <br>
• Cyclomatic complexity is measured directly from branch count, and code review gates fail on it. <br>
• Interviewers ask about tableswitch against lookupswitch, and about why switch on String works. <br>
• Trading and telecom systems care about branch misprediction, which costs tens of cycles per wrong guess. <br>`,
                                codeExamples: [
                                    `// Points 1, 2 and 3 at expert level: exhaustive switch, patterns and null handling

public class AdvancedControlDemo {

    enum PaymentMode { UPI, CARD, NETBANKING, WALLET }

    sealed interface Settlement permits Instant, Batch, Manual { }
    record Instant(String utr) implements Settlement { }
    record Batch(String batchId, int count) implements Settlement { }
    record Manual(String officer, String reason) implements Settlement { }

    // POINT 1: exhaustive on an enum, no default needed, compiler checks it
    static long feePaise(PaymentMode mode, long amountPaise) {
        return switch (mode) {
            case UPI        -> 0L;
            case CARD       -> Math.round(amountPaise * 0.018);
            case NETBANKING -> 1500L;
            case WALLET     -> Math.max(100L, amountPaise / 500);
        };
    }

    // POINT 1: pattern matching for switch on a sealed hierarchy
    static String describe(Settlement s) {
        return switch (s) {
            case Instant i            -> "Instant settlement, UTR " + i.utr();
            case Batch b when b.count() > 100
                                      -> "Large batch " + b.batchId() + " of " + b.count();
            case Batch b              -> "Batch " + b.batchId() + " of " + b.count();
            case Manual m             -> "Manual by " + m.officer()
                                         + " because " + m.reason();
        };
    }

    // POINT 2: switch on String with an explicit null label
    static String routeCity(String city) {
        return switch (city) {
            case null            -> "City missing, using default hub";
            case "MUMBAI", "PUNE" -> "West hub";
            case "DELHI"          -> "North hub";
            case "CHENNAI"        -> "South hub";
            default               -> "Central hub";
        };
    }

    public static void main(String[] args) {

        for (PaymentMode m : PaymentMode.values()) {
            System.out.println(m + " fee on Rs 2500 is paise " + feePaise(m, 250000L));
        }

        System.out.println(describe(new Instant("UTR9981234")));
        System.out.println(describe(new Batch("B-77", 250)));
        System.out.println(describe(new Batch("B-78", 12)));
        System.out.println(describe(new Manual("R. Sharma", "chargeback")));

        System.out.println(routeCity("PUNE"));
        System.out.println(routeCity(null));

        // WRONG before case null existed: this threw NullPointerException
        // switch (someNullString) { case "A": break; }
    }
}
// OUTPUT:
// UPI fee on Rs 2500 is paise 0
// CARD fee on Rs 2500 is paise 4500
// NETBANKING fee on Rs 2500 is paise 1500
// WALLET fee on Rs 2500 is paise 500
// Instant settlement, UTR UTR9981234
// Large batch B-77 of 250
// Batch B-78 of 12
// Manual by R. Sharma because chargeback
// West hub
// City missing, using default hub`
                                ]
                            },
                            {
                                content: `<h3>4. Advantages (Advanced)</h3>
• <b>Compile time exhaustiveness.</b> Adding an enum constant or a permitted subtype breaks the build in every switch expression that forgot it, which is exactly what you want. <br>
• <b>Constant time dispatch.</b> tableswitch on dense values is a single indexed jump, unaffected by the number of cases. <br>
• <b>No fall through and no accidental scope leak</b> with arrow labels, and pattern variables are scoped to the branch that binds them. <br>
• <b>Guard clauses flatten methods,</b> which lowers cyclomatic complexity and makes unit tests one per guard. <br>
• <b>Branch prediction rewards ordering.</b> Putting the ninety nine percent case first keeps the pipeline full. <br><br>

<h3>5. Disadvantages (Advanced)</h3>
• <b>Branching on type is a design smell</b> for open hierarchies. Polymorphism belongs there, switch belongs on closed ones. <br>
• <b>Old style switch scopes all cases in one block,</b> so a variable declared in case one is visible, though unassigned, in case two. <br>
• <b>Unpredictable branches are expensive.</b> A fifty fifty condition in a hot loop can cost more than the work inside it. <br>
• <b>Deeply nested conditionals resist testing,</b> since path count grows exponentially with nesting depth. <br>
• <b>A default branch hides new cases,</b> which defeats the exhaustiveness the compiler could have given you. <br>`,
                                codeExamples: [
                                    `// Points 4 and 5 at expert level: strategy map beats a branch chain, and branch cost

import java.util.EnumMap;
import java.util.Map;
import java.util.function.LongUnaryOperator;

public class BranchDesignDemo {

    enum Channel { UPI, IMPS, NEFT, RTGS }

    // WRONG at scale: every new channel edits this method, and reviewers miss cases
    static long wrongCharge(Channel c, long amountPaise) {
        if (c == Channel.UPI) return 0L;
        else if (c == Channel.IMPS) return 500L;
        else if (c == Channel.NEFT) return 250L;
        else return 2500L;                 // a new channel silently lands here
    }

    // RIGHT: a strategy table, open for extension and easy to unit test
    static final Map<Channel, LongUnaryOperator> CHARGES = new EnumMap<>(Channel.class);
    static {
        CHARGES.put(Channel.UPI,  amount -> 0L);
        CHARGES.put(Channel.IMPS, amount -> Math.max(500L, amount / 2000));
        CHARGES.put(Channel.NEFT, amount -> 250L);
        CHARGES.put(Channel.RTGS, amount -> 2500L);
    }

    static long rightCharge(Channel c, long amountPaise) {
        LongUnaryOperator rule = CHARGES.get(c);
        if (rule == null) {
            throw new IllegalStateException("No charge rule for " + c);
        }
        return rule.applyAsLong(amountPaise);
    }

    public static void main(String[] args) {

        for (Channel c : Channel.values()) {
            System.out.println(c + " wrong " + wrongCharge(c, 5000000L)
                    + " right " + rightCharge(c, 5000000L));
        }

        // DISADVANTAGE 5: an unpredictable branch in a hot loop
        int size = 5000000;
        int[] data = new int[size];
        java.util.Random rnd = new java.util.Random(42);
        for (int k = 0; k < size; k++) {
            data[k] = rnd.nextInt(100);
        }

        long start = System.nanoTime();
        long branchy = 0;
        for (int v : data) {
            if (v > 50) branchy += v;         // unpredictable, about fifty fifty
        }
        long branchyMs = (System.nanoTime() - start) / 1000000;

        start = System.nanoTime();
        long branchFree = 0;
        for (int v : data) {
            // RIGHT for hot paths: arithmetic instead of a branch
            int mask = (50 - v) >> 31;        // -1 when v > 50, else 0
            branchFree += v & mask;
        }
        long branchFreeMs = (System.nanoTime() - start) / 1000000;

        System.out.println("Branchy sum    " + branchy + " in about " + branchyMs + " ms");
        System.out.println("Branch free sum " + branchFree
                + " in about " + branchFreeMs + " ms");
    }
}
// OUTPUT (timings vary):
// UPI wrong 0 right 0
// IMPS wrong 500 right 2500
// NEFT wrong 250 right 250
// RTGS wrong 2500 right 2500
// Branchy sum 187... in about 25 ms
// Branch free sum 187... in about 6 ms`
                                ]
                            },
                            {
                                content: `<h3>6. Real Time Examples (Advanced)</h3>
• <b>Payment switch:</b> a sealed Transaction hierarchy plus a pattern matching switch, so adding a new rail fails the build until every handler is updated. <br>
• <b>Order state machine in e commerce:</b> an EnumMap of allowed transitions instead of nested if, which makes an illegal transition impossible. <br>
• <b>Rule engine for insurance underwriting:</b> conditions stored as data rows, evaluated in a loop, so business users change rules without a release. <br>
• <b>Fraud scoring:</b> the cheapest and most selective check runs first, so ninety percent of traffic exits after one comparison. <br>
• <b>Global example, a protocol parser:</b> a dense tableswitch on the message type byte gives constant time dispatch at line rate. <br>
• <b>Feature toggles:</b> a single map lookup replaces dozens of if statements scattered across services. <br><br>

<b>Interview answers to keep ready</b><br>
• Difference between tableswitch and lookupswitch? Dense labels give a jump table, sparse labels give a binary search. <br>
• Why does switch on String work? The compiler switches on hashCode first, then confirms with equals. <br>
• When should you replace if else with polymorphism? When you are branching on type in an open hierarchy. <br>
• What happens on a null in a switch? NullPointerException, unless you write case null in a modern switch. <br>`,
                                codeExamples: [
                                    `// Point 6 at expert level: an order state machine driven by a transition table

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;

public class OrderStateMachineDemo {

    enum State { CREATED, PAID, PACKED, SHIPPED, DELIVERED, CANCELLED, REFUNDED }

    // RIGHT: legal transitions declared once as data, not as scattered if statements
    static final Map<State, EnumSet<State>> ALLOWED = new EnumMap<>(State.class);
    static {
        ALLOWED.put(State.CREATED,   EnumSet.of(State.PAID, State.CANCELLED));
        ALLOWED.put(State.PAID,      EnumSet.of(State.PACKED, State.REFUNDED));
        ALLOWED.put(State.PACKED,    EnumSet.of(State.SHIPPED, State.REFUNDED));
        ALLOWED.put(State.SHIPPED,   EnumSet.of(State.DELIVERED));
        ALLOWED.put(State.DELIVERED, EnumSet.noneOf(State.class));
        ALLOWED.put(State.CANCELLED, EnumSet.noneOf(State.class));
        ALLOWED.put(State.REFUNDED,  EnumSet.noneOf(State.class));
    }

    static State move(State from, State to) {
        EnumSet<State> next = ALLOWED.get(from);
        if (next == null || !next.contains(to)) {
            throw new IllegalStateException("Illegal move " + from + " to " + to);
        }
        return to;
    }

    // Exhaustive switch expression, a new State breaks this at compile time
    static String customerMessage(State s) {
        return switch (s) {
            case CREATED   -> "Order placed, please pay";
            case PAID      -> "Payment received, packing soon";
            case PACKED    -> "Packed at the Bhiwandi warehouse";
            case SHIPPED   -> "Out for delivery";
            case DELIVERED -> "Delivered, thank you";
            case CANCELLED -> "Order cancelled";
            case REFUNDED  -> "Refund credited in 5 working days";
        };
    }

    public static void main(String[] args) {

        State s = State.CREATED;
        System.out.println(customerMessage(s));

        s = move(s, State.PAID);
        System.out.println(customerMessage(s));

        s = move(s, State.PACKED);
        System.out.println(customerMessage(s));

        s = move(s, State.SHIPPED);
        System.out.println(customerMessage(s));

        // WRONG: a shipped order cannot go back to cancelled
        try {
            move(s, State.CANCELLED);
        } catch (IllegalStateException e) {
            System.out.println("Blocked: " + e.getMessage());
        }

        s = move(s, State.DELIVERED);
        System.out.println(customerMessage(s));
    }
}
// OUTPUT:
// Order placed, please pay
// Payment received, packing soon
// Packed at the Bhiwandi warehouse
// Out for delivery
// Blocked: Illegal move SHIPPED to CANCELLED
// Delivered, thank you`
                                ]
                            }
                        ]

};
