import { Topic } from '../coreJava';

export const switchExpressions: Topic = {
                        id: 'switch-expressions',
                        name: 'Switch Expressions',
                        beginner: [
                            {
                                content: `<h3>Switch Expressions in Java</h3>
<h4>Introduction</h4>
<p><strong>Switch expressions</strong> were finalized in Java 14 and are a core part of Java 17. They extend the traditional switch statement: it can return a value, use arrow syntax, and avoid fall-through bugs.</p>

<h4>Key Features</h4>
<ul>
<li><strong>Arrow syntax (-&gt;)</strong> — No fall-through, no break needed</li>
<li><strong>Returns a value</strong> — Switch can be used as an expression</li>
<li><strong>yield keyword</strong> — Returns a value from a block in switch expression</li>
<li><strong>Multiple labels</strong> — Comma-separated case values</li>
<li><strong>Exhaustiveness</strong> — Compiler ensures all cases are covered when used as expression</li>
</ul>

<h4>Old Switch vs New Switch</h4>
<ul>
<li>Old: switch statement with break, fall-through risk</li>
<li>New: switch expression with arrows, no fall-through, returns value</li>
</ul>`,
                                codeExamples: [
`// Switch Expressions — Basic Usage
public class SwitchExpressionBasic {
    public static void main(String[] args) {
        // OLD switch statement
        String day1 = "MONDAY";
        String type1;
        switch (day1) {
            case "MONDAY":
            case "TUESDAY":
            case "WEDNESDAY":
            case "THURSDAY":
            case "FRIDAY":
                type1 = "Weekday";
                break;
            case "SATURDAY":
            case "SUNDAY":
                type1 = "Weekend";
                break;
            default:
                type1 = "Unknown";
        }

        // NEW switch expression with arrow syntax
        String day2 = "SATURDAY";
        String type2 = switch (day2) {
            case "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY" -> "Weekday";
            case "SATURDAY", "SUNDAY" -> "Weekend";
            default -> "Unknown";
        };

        System.out.println(day1 + " is a " + type1);  // MONDAY is a Weekday
        System.out.println(day2 + " is a " + type2);  // SATURDAY is a Weekend

        // Switch expression returning int
        int month = 3;
        int daysInMonth = switch (month) {
            case 1, 3, 5, 7, 8, 10, 12 -> 31;
            case 4, 6, 9, 11 -> 30;
            case 2 -> 28;
            default -> throw new IllegalArgumentException("Invalid month: " + month);
        };
        System.out.println("Days in month " + month + ": " + daysInMonth);
    }
}

// OUTPUT:
// MONDAY is a Weekday
// SATURDAY is a Weekend
// Days in month 3: 31`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Switch Expressions — Intermediate Usage</h3>
<h4>The yield Keyword</h4>
<p>When a case in a switch expression needs a block of code (not just a single expression), use <strong>yield</strong> to return the value from that block.</p>

<h4>Switch Expressions with Enums</h4>
<p>Switch expressions work naturally with enums and can be exhaustive without a default case if all enum constants are covered.</p>

<h4>Combining Arrows and Blocks</h4>
<p>You can mix single-expression arrows with block arrows that use yield.</p>

<h4>Best Practices</h4>
<ul>
<li>Prefer arrow syntax over colon syntax for new code</li>
<li>Use switch expressions instead of if-else chains for type mapping</li>
<li>Let the compiler check exhaustiveness — avoid unnecessary default cases with enums</li>
<li>Use yield in blocks, not break</li>
</ul>`,
                                codeExamples: [
`// Switch Expressions — Intermediate Usage
enum Season { SPRING, SUMMER, AUTUMN, WINTER }

public class SwitchExpressionIntermediate {

    // Using yield for block expressions
    static String describeNumber(int num) {
        return switch (num) {
            case 0 -> "zero";
            case 1, 2, 3 -> "small";
            default -> {
                if (num < 0) {
                    yield "negative (" + num + ")";
                } else if (num < 100) {
                    yield "medium (" + num + ")";
                } else {
                    yield "large (" + num + ")";
                }
            }
        };
    }

    // Exhaustive switch with enum — no default needed
    static String seasonActivity(Season season) {
        return switch (season) {
            case SPRING -> "Gardening";
            case SUMMER -> "Swimming";
            case AUTUMN -> "Hiking";
            case WINTER -> "Skiing";
            // No default needed — all enum values covered!
        };
    }

    // Switch expression with complex logic in blocks
    static double calculateDiscount(String customerType, double amount) {
        return switch (customerType) {
            case "PREMIUM" -> {
                double discount = amount * 0.20;
                System.out.println("Premium discount applied: " + discount);
                yield discount;
            }
            case "REGULAR" -> {
                double discount = amount * 0.10;
                System.out.println("Regular discount applied: " + discount);
                yield discount;
            }
            case "NEW" -> amount * 0.05;
            default -> 0.0;
        };
    }

    public static void main(String[] args) {
        System.out.println(describeNumber(-5));   // negative (-5)
        System.out.println(describeNumber(42));   // medium (42)
        System.out.println(describeNumber(150));  // large (150)

        for (Season s : Season.values()) {
            System.out.println(s + " -> " + seasonActivity(s));
        }

        double discount = calculateDiscount("PREMIUM", 100.0);
    }
}

// OUTPUT:
// negative (-5)
// medium (42)
// large (150)
// SPRING -> Gardening
// SUMMER -> Swimming
// AUTUMN -> Hiking
// WINTER -> Skiing
// Premium discount applied: 20.0`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Switch Expressions — Expert Deep Dive</h3>
<h4>Bytecode and Internal Handling</h4>
<ul>
<li>Arrow-form switch compiles to the same kind of bytecode as the traditional switch (tableswitch/lookupswitch)</li>
<li>The compiler eliminates fall-through at the source level</li>
<li>yield compiles similar to a labeled break with a value assignment</li>
<li>Exhaustiveness is checked at compile time; the compiler also adds a hidden default that throws an error (IncompatibleClassChangeError, or MatchException in Java 21) if an enum changes later</li>
</ul>

<h4>Switch Expressions vs if-else Chains</h4>
<ul>
<li>Switch expressions use tableswitch/lookupswitch for O(1) dispatch</li>
<li>If-else chains use sequential comparison — O(n)</li>
<li>Switch expressions are more readable for multi-way branching</li>
</ul>

<h4>Interview Questions</h4>
<ul>
<li><strong>Q: Difference between yield and return?</strong> — yield returns a value from a switch expression block; return exits the method</li>
<li><strong>Q: Can switch expressions have side effects?</strong> — Yes, but the primary purpose is to produce a value</li>
<li><strong>Q: What if a new enum constant is added?</strong> — Compiler error for non-exhaustive switch expression, ensuring safety</li>
<li><strong>Q: Can null be used as a case label?</strong> — In Java 21 with pattern matching, yes. Before that, null causes NullPointerException</li>
</ul>`,
                                codeExamples: [
`// Expert Switch Expressions
public class SwitchExpressionExpert {

    // Type patterns in case labels: preview in Java 17-20,
    // standard only from Java 21 (JEP 441)
    sealed interface Result permits Success, Failure, Pending {}
    record Success(String data) implements Result {}
    record Failure(String error, int code) implements Result {}
    record Pending(long estimatedMs) implements Result {}

    static String handleResult(Result result) {
        return switch (result) {
            case Success s -> "Success: " + s.data();
            case Failure f -> {
                if (f.code() >= 500) {
                    yield "Server Error [" + f.code() + "]: " + f.error();
                } else {
                    yield "Client Error [" + f.code() + "]: " + f.error();
                }
            }
            case Pending p -> "Pending... ETA: " + p.estimatedMs() + "ms";
        };
    }

    // Performance: switch expression for strategy selection
    interface MathOp { double apply(double a, double b); }

    static MathOp getOperation(char op) {
        return switch (op) {
            case '+' -> (a, b) -> a + b;
            case '-' -> (a, b) -> a - b;
            case '*' -> (a, b) -> a * b;
            case '/' -> (a, b) -> {
                if (b == 0) throw new ArithmeticException("Division by zero");
                return a / b;
            };
            default -> throw new UnsupportedOperationException("Op: " + op);
        };
    }

    public static void main(String[] args) {
        // Sealed type handling
        var results = java.util.List.of(
            new Success("Data loaded"),
            new Failure("Not Found", 404),
            new Failure("Internal Error", 500),
            new Pending(3000)
        );
        results.forEach(r -> System.out.println(handleResult(r)));

        // Strategy pattern with switch
        MathOp add = getOperation('+');
        MathOp mul = getOperation('*');
        System.out.println("5 + 3 = " + add.apply(5, 3));
        System.out.println("5 * 3 = " + mul.apply(5, 3));
    }
}

// OUTPUT:
// Success: Data loaded
// Client Error [404]: Not Found
// Server Error [500]: Internal Error
// Pending... ETA: 3000ms
// 5 + 3 = 8.0
// 5 * 3 = 15.0`
                                ]
                            }
                        ]
};
