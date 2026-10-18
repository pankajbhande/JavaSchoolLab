import { Topic } from '../coreJava';

export const recordPatterns: Topic = {
                        id: 'record-patterns',
                        name: 'Record Patterns',
                        beginner: [
                            {
                                content: `<h3>Record Patterns in Java 21</h3>
<h4>Introduction</h4>
<strong>Record Patterns</strong> (finalized in Java 21, JEP 440) allow you to <strong>destructure</strong> record values directly in pattern matching. Instead of matching a record and then manually extracting its components, you can extract (deconstruct) the components inline.<br><br>

<h4>Key Features</h4>
• Destructure records directly in instanceof and switch patterns<br>
• Extract component values without calling accessor methods<br>
• Can be nested for deep destructuring<br>
• Works with sealed hierarchies for exhaustive matching<br><br>

<h4>Basic Syntax</h4>
• <strong>if (obj instanceof Point(var x, var y))</strong> — extracts x and y from Point record<br>
• <strong>case Point(var x, var y)</strong> — same in switch<br>
• Components are bound to local variables for immediate use`,
                                codeExamples: [
`// Record Patterns — Basic Usage
record Point(int x, int y) {}
record Line(Point start, Point end) {}

public class RecordPatternBasic {
    // WITHOUT record patterns (Java 16 style)
    static void printPointOld(Object obj) {
        if (obj instanceof Point p) {
            int x = p.x();  // manual extraction
            int y = p.y();
            System.out.println("Point: (" + x + ", " + y + ")");
        }
    }

    // WITH record patterns (Java 21)
    static void printPointNew(Object obj) {
        if (obj instanceof Point(int x, int y)) {  // destructured!
            System.out.println("Point: (" + x + ", " + y + ")");
        }
    }

    // Nested record patterns
    static void printLine(Object obj) {
        if (obj instanceof Line(Point(var x1, var y1), Point(var x2, var y2))) {
            System.out.println("Line from (" + x1 + "," + y1 +
                             ") to (" + x2 + "," + y2 + ")");
        }
    }

    public static void main(String[] args) {
        Point p = new Point(3, 4);
        printPointOld(p);   // Point: (3, 4)
        printPointNew(p);   // Point: (3, 4)

        Line line = new Line(new Point(0, 0), new Point(10, 20));
        printLine(line);    // Line from (0,0) to (10,20)
    }
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Record Patterns — Intermediate Usage</h3>
<h4>Record Patterns in Switch</h4>
Record patterns work in switch expressions and statements, enabling powerful multi-way destructuring.<br><br>

<h4>Combining with Guards</h4>
Use <strong>when</strong> guards with record patterns to add conditions on the destructured values.<br><br>

<h4>Working with Sealed Hierarchies</h4>
Record patterns combined with sealed interfaces enable exhaustive, type-safe pattern matching.<br><br>

<h4>Best Practices</h4>
• Use <strong>var</strong> for type inference in record patterns when the type is obvious<br>
• Leverage nested patterns for deep data structures<br>
• Combine with sealed types for exhaustive matching<br>
• Use guard clauses (when) for conditional matching`,
                                codeExamples: [
`// Record Patterns — Intermediate Usage
sealed interface Shape permits Circle, Rectangle, Triangle {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Triangle(double base, double height) implements Shape {}

record Colored<T>(T shape, String color) {}

public class RecordPatternIntermediate {
    // Switch with record patterns
    static double area(Shape shape) {
        return switch (shape) {
            case Circle(var r)         -> Math.PI * r * r;
            case Rectangle(var w, var h) -> w * h;
            case Triangle(var b, var h)  -> 0.5 * b * h;
        };
    }

    // Guards with record patterns
    static String classify(Shape shape) {
        return switch (shape) {
            case Circle(var r) when r > 10    -> "Large circle (r=" + r + ")";
            case Circle(var r)                -> "Small circle (r=" + r + ")";
            case Rectangle(var w, var h) when w == h -> "Square (" + w + "x" + h + ")";
            case Rectangle(var w, var h)      -> "Rectangle (" + w + "x" + h + ")";
            case Triangle(var b, var h)       -> "Triangle (base=" + b + ")";
        };
    }

    // Nested generic record patterns
    static String describeColored(Colored<Shape> colored) {
        return switch (colored) {
            case Colored(Circle(var r), var c) -> c + " circle with radius " + r;
            case Colored(Rectangle(var w, var h), var c) -> c + " rectangle " + w + "x" + h;
            case Colored(Triangle(var b, var h), var c) -> c + " triangle base=" + b;
        };
    }

    public static void main(String[] args) {
        System.out.println(area(new Circle(5)));           // 78.53981633974483
        System.out.println(area(new Rectangle(4, 6)));     // 24.0

        System.out.println(classify(new Circle(15)));      // Large circle (r=15.0)
        System.out.println(classify(new Rectangle(5, 5))); // Square (5.0x5.0)

        var colored = new Colored<Shape>(new Circle(7), "Red");
        System.out.println(describeColored(colored)); // Red circle with radius 7
    }
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Record Patterns — Expert Deep Dive</h3>
<h4>Internal Mechanism</h4>
• Record patterns use the record's <strong>canonical deconstruction</strong> — calling accessor methods in order<br>
• The compiler generates instanceof checks followed by accessor calls<br>
• Nested patterns generate chained checks and extractions<br>
• Type inference (var) in patterns uses the record component's declared type<br><br>

<h4>Pattern Matching Completeness</h4>
• With sealed types, the compiler performs exhaustiveness analysis<br>
• Each permitted subtype's record components are known at compile time<br>
• No default/catch-all branch needed when all subtypes are covered<br><br>

<h4>Interview Questions</h4>
• <strong>Q: How do record patterns differ from regular pattern matching?</strong> — Record patterns add destructuring, extracting components inline rather than just binding the whole object<br>
• <strong>Q: Can record patterns be nested?</strong> — Yes, to any depth, for deep destructuring<br>
• <strong>Q: Do record patterns work with non-record classes?</strong> — No, only with records that have a well-defined canonical constructor<br>
• <strong>Q: Performance impact?</strong> — Minimal; compiles to normal accessor calls with type checks`,
                                codeExamples: [
`// Expert Record Patterns
sealed interface Expr permits Num, Add, Mul, Neg {}
record Num(double value) implements Expr {}
record Add(Expr left, Expr right) implements Expr {}
record Mul(Expr left, Expr right) implements Expr {}
record Neg(Expr expr) implements Expr {}

public class RecordPatternExpert {
    // Recursive evaluation with deep pattern matching
    static double eval(Expr expr) {
        return switch (expr) {
            case Num(var v)        -> v;
            case Add(var l, var r) -> eval(l) + eval(r);
            case Mul(var l, var r) -> eval(l) * eval(r);
            case Neg(var e)        -> -eval(e);
        };
    }

    // Optimization pass — constant folding with nested patterns
    static Expr simplify(Expr expr) {
        return switch (expr) {
            // 0 + x = x
            case Add(Num(var v), var right) when v == 0 -> simplify(right);
            // x + 0 = x
            case Add(var left, Num(var v)) when v == 0 -> simplify(left);
            // 1 * x = x
            case Mul(Num(var v), var right) when v == 1 -> simplify(right);
            // x * 0 = 0
            case Mul(var left, Num(var v)) when v == 0 -> new Num(0);
            // Double negation: --x = x
            case Neg(Neg(var inner)) -> simplify(inner);
            // Recursively simplify sub-expressions
            case Add(var l, var r) -> new Add(simplify(l), simplify(r));
            case Mul(var l, var r) -> new Mul(simplify(l), simplify(r));
            case Neg(var e)        -> new Neg(simplify(e));
            case Num n             -> n;
        };
    }

    public static void main(String[] args) {
        // (3 + 4) * 2 = 14
        Expr expr = new Mul(new Add(new Num(3), new Num(4)), new Num(2));
        System.out.println("Result: " + eval(expr));

        // Simplification: 0 + (1 * x) = x
        Expr complex = new Add(new Num(0), new Mul(new Num(1), new Num(42)));
        Expr simplified = simplify(complex);
        System.out.println("Simplified result: " + eval(simplified));
        // Result: 14.0
        // Simplified result: 42.0
    }
}`
                                ]
                            }
                        ]
};
