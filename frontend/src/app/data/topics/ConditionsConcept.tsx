import { Topic } from '../coreJava';

export const conditionsConcept: Topic = {
    id: 'conditions-concept',
    name: 'Conditions',
    beginner: [
        {
            content: `<h3>What is a Condition?</h3>
A condition is an expression that evaluates to either <code>true</code> or <code>false</code>. Programs use conditions to make decisions - to run one block of code instead of another depending on the current state of the data.<br>`,
            codeExamples: [`public class WhatIsCondition {
    public static void main(String[] args) {
        int age = 20;
        boolean isAdult = age >= 18; // this expression is a condition
        System.out.println("Is adult: " + isAdult);
    }
}
// OUTPUT:
// Is adult: true`]
        },
        {
            content: `<h3>The if Statement</h3>
The <code>if</code> statement runs a block of code only when its condition is true. If the condition is false, the block is simply skipped.<br>`,
            codeExamples: [`public class IfDemo {
    public static void main(String[] args) {
        int temperature = 35;
        if (temperature > 30) {
            System.out.println("It's hot today!");
        }
        System.out.println("Program continues");
    }
}
// OUTPUT:
// It's hot today!
// Program continues`]
        },
        {
            content: `<h3>if-else: Two Paths</h3>
Adding <code>else</code> gives your program a second path to take when the condition is false, so exactly one of the two blocks always runs.<br>`,
            codeExamples: [`public class IfElseDemo {
    public static void main(String[] args) {
        int marks = 35;
        if (marks >= 40) {
            System.out.println("Pass");
        } else {
            System.out.println("Fail");
        }
    }
}
// OUTPUT:
// Fail`]
        },
        {
            content: `<h3>Multiple Conditions with else-if</h3>
When there are more than two possible outcomes, chain conditions with <code>else if</code>. Java checks them top to bottom and runs the first one that is true.<br>`,
            codeExamples: [`public class ElseIfDemo {
    public static void main(String[] args) {
        int marks = 72;
        if (marks >= 90) {
            System.out.println("Grade A");
        } else if (marks >= 60) {
            System.out.println("Grade B");
        } else {
            System.out.println("Grade C");
        }
    }
}
// OUTPUT:
// Grade B`]
        },
        {
            content: `<h3>Combining Conditions: && and ||</h3>
Simple conditions can be combined into compound ones: <code>&&</code> (AND) requires both sides to be true; <code>||</code> (OR) requires at least one side to be true.<br>`,
            codeExamples: [`public class CombinedConditions {
    public static void main(String[] args) {
        int age = 25;
        boolean hasLicense = true;
        if (age >= 18 && hasLicense) {
            System.out.println("Allowed to drive");
        } else {
            System.out.println("Not allowed to drive");
        }
    }
}
// OUTPUT:
// Allowed to drive`]
        },
    ],
    expert: [
        {
            content: `<h3>How Java Evaluates Conditions: Short-Circuiting</h3>
Java's logical operators <code>&&</code> and <code>||</code> are <strong>short-circuiting</strong>: they stop evaluating as soon as the result is already determined. This isn't just an optimization - it's often relied upon to avoid errors, like checking an object isn't null before dereferencing it.<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Operator</th><th>Stops Early When</th><th>Non-short-circuit Equivalent</th></tr>
<tr class='text-center'><td>&&</td><td>Left side is false (result must be false)</td><td>& (evaluates both sides always)</td></tr>
<tr class='text-center'><td>||</td><td>Left side is true (result must be true)</td><td>| (evaluates both sides always)</td></tr>
</table>`,
            codeExamples: [`public class ShortCircuitDemo {
    public static void main(String[] args) {
        String name = null;

        // Safe: short-circuit && skips name.length() when name == null is true is false...
        // actually the check order matters - null check comes FIRST
        if (name != null && name.length() > 0) {
            System.out.println("Name has content");
        } else {
            System.out.println("Name is null or empty - avoided NullPointerException");
        }

        // Demonstrating that the right side is never evaluated:
        if (true || riskyCheck()) {
            System.out.println("riskyCheck() was never called");
        }
    }
    static boolean riskyCheck() {
        throw new RuntimeException("Should never run!");
    }
}
// OUTPUT:
// Name is null or empty - avoided NullPointerException
// riskyCheck() was never called`]
        },
        {
            content: `<h3>The switch Statement: A Structured Alternative to else-if Chains</h3>
When checking one variable against many discrete values, a long else-if chain gets unwieldy. <code>switch</code> expresses this more clearly, and modern Java's arrow syntax also avoids the classic "fall-through" bug of forgetting <code>break</code>.<br>`,
            codeExamples: [`public class SwitchDemo {
    public static void main(String[] args) {
        int day = 3;

        // Classic switch - requires break to avoid fall-through
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
                System.out.println("Other day");
        }

        // Modern arrow switch (Java 14+) - no fall-through, no break needed
        String dayName = switch (day) {
            case 1 -> "Monday";
            case 2 -> "Tuesday";
            case 3 -> "Wednesday";
            default -> "Other day";
        };
        System.out.println(dayName);
    }
}
// OUTPUT:
// Wednesday
// Wednesday`]
        },
        {
            content: `<h3>The Ternary Operator: A Condition as an Expression</h3>
The ternary operator <code>condition ? valueIfTrue : valueIfFalse</code> lets you use a condition to directly produce a value, instead of writing a full if-else block just to assign a variable.<br>`,
            codeExamples: [`public class TernaryDemo {
    public static void main(String[] args) {
        int score = 55;

        // Without ternary
        String result1;
        if (score >= 40) { result1 = "Pass"; } else { result1 = "Fail"; }

        // With ternary - same logic, one line
        String result2 = (score >= 40) ? "Pass" : "Fail";

        System.out.println(result1);
        System.out.println(result2);
    }
}
// OUTPUT:
// Pass
// Pass`]
        },
        {
            content: `<h3>Common Condition Pitfalls</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pitfall</th><th>Why It's a Problem</th></tr>
<tr class='text-center'><td>Using = instead of == </td><td>= is assignment, == is comparison; Java's boolean-only if condition thankfully catches this at compile time for non-boolean types</td></tr>
<tr class='text-center'><td>Comparing objects (e.g. String) with ==</td><td>== compares references, not content; use .equals() to compare values</td></tr>
<tr class='text-center'><td>Forgetting break in a classic switch</td><td>Execution "falls through" into the next case unintentionally</td></tr>
<tr class='text-center'><td>Deeply nested if-else chains</td><td>Hard to read/maintain - often better refactored into switch, early returns, or separate methods</td></tr>
</table>`,
            codeExamples: [`public class ConditionPitfalls {
    public static void main(String[] args) {
        String a = new String("hello");
        String b = new String("hello");

        System.out.println(a == b);        // false - different objects, comparing references
        System.out.println(a.equals(b));    // true - same content
    }
}
// OUTPUT:
// false
// true`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is short-circuit evaluation?</td><td>&& and || stop evaluating as soon as the overall result is already determined, skipping the right-hand operand when possible</td></tr>
<tr class='text-center'><td>What is the difference between & and && in a condition?</td><td>& always evaluates both operands; && short-circuits and skips the right side when the left already determines the result</td></tr>
<tr class='text-center'><td>Why should you use .equals() instead of == for Strings?</td><td>== compares object references (memory addresses); .equals() compares actual character content</td></tr>
<tr class='text-center'><td>What happens if you omit break in a classic switch statement?</td><td>Execution falls through and continues into the next case's code until a break or the end of the switch</td></tr>
<tr class='text-center'><td>Can a switch statement's condition be a String in Java?</td><td>Yes, since Java 7 switch supports String, along with int/char/enum and their wrapper types</td></tr>
<tr class='text-center'><td>What type must an if condition evaluate to in Java?</td><td>boolean - unlike some languages, Java does not allow ints or other types to be used directly as truthy/falsy conditions</td></tr>
<tr class='text-center'><td>When is a ternary expression preferred over if-else?</td><td>When the sole purpose of the branch is to compute/assign a single value - it's more concise for simple cases</td></tr>
</table>`
        },
    ],
};
