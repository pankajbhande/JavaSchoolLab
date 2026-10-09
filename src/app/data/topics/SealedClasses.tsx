import { Topic } from '../coreJava';

export const sealedClasses: Topic = {
                        id: 'sealed-classes',
                        name: 'Sealed Classes',
                        beginner: [
                            {
                                content: `<h3>Sealed Classes in Java 17</h3>
<h4>Introduction</h4>
<p><strong>Sealed classes</strong> became a standard feature in Java 17. They let you restrict which classes or interfaces can extend or implement a given class or interface. This gives you fine-grained control over the class hierarchy.</p>

<h4>Key Keywords</h4>
<ul>
<li><strong>sealed</strong> — Declares a class or interface as sealed (restricted)</li>
<li><strong>permits</strong> — Lists the allowed subclasses or implementations</li>
<li><strong>non-sealed</strong> — A subclass that opens up further extension</li>
<li><strong>final</strong> — A subclass that cannot be extended any more</li>
</ul>

<h4>Rules for Sealed Classes</h4>
<ul>
<li>Permitted subclasses must extend the sealed class directly</li>
<li>Each permitted subclass must be <strong>final</strong>, <strong>sealed</strong>, or <strong>non-sealed</strong></li>
<li>Permitted subclasses must be in the same module (or the same package if there is no named module)</li>
<li>The compiler enforces the hierarchy at compile time</li>
</ul>`,
                                codeExamples: [
`// Sealed Classes — Basic Example
public abstract sealed class Shape permits Circle, Rectangle, Triangle {
    abstract double area();
}

final class Circle extends Shape {
    double radius;

    Circle(double radius) {
        this.radius = radius;
    }

    @Override
    double area() {
        return Math.PI * radius * radius;
    }
}

final class Rectangle extends Shape {
    double width, height;

    Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    @Override
    double area() {
        return width * height;
    }
}

final class Triangle extends Shape {
    double base, height;

    Triangle(double base, double height) {
        this.base = base;
        this.height = height;
    }

    @Override
    double area() {
        return 0.5 * base * height;
    }
}

// Usage
class Main {
    public static void main(String[] args) {
        Shape circle = new Circle(5);
        Shape rect = new Rectangle(4, 6);
        Shape tri = new Triangle(3, 8);

        System.out.println("Circle area: " + circle.area());
        System.out.println("Rectangle area: " + rect.area());
        System.out.println("Triangle area: " + tri.area());
    }
}

// OUTPUT:
// Circle area: 78.53981633974483
// Rectangle area: 24.0
// Triangle area: 12.0`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Sealed Classes — Intermediate Usage</h3>
<h4>Sealed Interfaces</h4>
<p>Interfaces can also be sealed. This restricts which classes or interfaces can implement them.</p>

<h4>Hierarchical Sealing</h4>
<p>A permitted subclass of a sealed class can itself be sealed. This creates a controlled, multi-level hierarchy.</p>

<h4>non-sealed Subclasses</h4>
<p>Using <strong>non-sealed</strong> on a subclass lets anyone extend it. The hierarchy is open again at that point.</p>

<h4>Best Practices</h4>
<ul>
<li>Use sealed classes for domain models with a fixed set of types (for example payment types or AST nodes)</li>
<li>Combine them with <strong>records</strong> for compact data types in the hierarchy</li>
<li>Prefer <strong>final</strong> subclasses unless extension is really needed</li>
<li>Use sealed classes to make pattern matching exhaustive</li>
</ul>`,
                                codeExamples: [
`// Sealed interfaces and hierarchical sealing
sealed interface Payment permits CreditCard, BankTransfer, DigitalWallet {
    double amount();
    String describe();
}

// final — no further subclassing
record CreditCard(double amount, String cardNumber) implements Payment {
    public String describe() {
        int n = cardNumber.length();
        return "Credit Card ending in " + cardNumber.substring(n - 4);
    }
}

// final record — cannot be extended
record BankTransfer(double amount, String bankCode) implements Payment {
    public String describe() {
        return "Bank Transfer via " + bankCode;
    }
}

// non-sealed — open for extension
non-sealed class DigitalWallet implements Payment {
    private double amount;
    private String provider;

    DigitalWallet(double amount, String provider) {
        this.amount = amount;
        this.provider = provider;
    }

    public double amount() { return amount; }
    public String describe() { return provider + " wallet payment"; }
}

// Since DigitalWallet is non-sealed, this is allowed:
class PayPal extends DigitalWallet {
    PayPal(double amount) { super(amount, "PayPal"); }
}

class Main {
    static void processPayment(Payment payment) {
        System.out.println(payment.describe() + " - $" + payment.amount());
    }

    public static void main(String[] args) {
        processPayment(new CreditCard(100.0, "4111111111111234"));
        processPayment(new BankTransfer(500.0, "SWIFT-ABC"));
        processPayment(new PayPal(25.50));
    }
}

// OUTPUT:
// Credit Card ending in 1234 - $100.0
// Bank Transfer via SWIFT-ABC - $500.0
// PayPal wallet payment - $25.5`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Sealed Classes — Expert Deep Dive</h3>
<h4>Internal Representation</h4>
<ul>
<li>The compiler stores the allowed subclasses in the <strong>PermittedSubclasses</strong> attribute of the class file</li>
<li>The JVM checks the sealed hierarchy when classes are loaded</li>
<li>Reflection API: <strong>Class.isSealed()</strong> and <strong>Class.getPermittedSubclasses()</strong></li>
</ul>

<h4>Sealed Classes + Pattern Matching</h4>
<p>Sealed classes allow exhaustive pattern matching in switch expressions (final in Java 21, preview in Java 17). The compiler knows all possible subtypes, so no default branch is needed.</p>

<h4>Interview Questions</h4>
<ul>
<li><strong>Q: Why were sealed classes introduced?</strong> — To control inheritance precisely and to support exhaustive pattern matching</li>
<li><strong>Q: Can a sealed class be abstract?</strong> — Yes</li>
<li><strong>Q: What happens if a non-permitted class extends a sealed class?</strong> — Compilation error</li>
<li><strong>Q: How do sealed classes differ from final classes?</strong> — Final prevents all extension; sealed allows only the listed subclasses</li>
</ul>`,
                                codeExamples: [
`// Expert: Sealed classes with pattern matching
sealed interface Expr permits Num, Add, Mul, Neg {
    // Abstract Syntax Tree for expressions
}

record Num(double value) implements Expr {}
record Add(Expr left, Expr right) implements Expr {}
record Mul(Expr left, Expr right) implements Expr {}
record Neg(Expr operand) implements Expr {}

class ExprEvaluator {
    // Exhaustive pattern matching (Java 21; preview in 17)
    static double evaluate(Expr expr) {
        return switch (expr) {
            case Num n -> n.value();
            case Add a -> evaluate(a.left()) + evaluate(a.right());
            case Mul m -> evaluate(m.left()) * evaluate(m.right());
            case Neg n -> -evaluate(n.operand());
            // No default needed — compiler knows all cases are covered!
        };
    }

    static String prettyPrint(Expr expr) {
        return switch (expr) {
            case Num n -> String.valueOf(n.value());
            case Add a -> "(" + prettyPrint(a.left()) + " + "
                    + prettyPrint(a.right()) + ")";
            case Mul m -> "(" + prettyPrint(m.left()) + " * "
                    + prettyPrint(m.right()) + ")";
            case Neg n -> "-(" + prettyPrint(n.operand()) + ")";
        };
    }

    public static void main(String[] args) {
        // (3 + 4) * -(2)
        Expr expr = new Mul(
            new Add(new Num(3), new Num(4)),
            new Neg(new Num(2))
        );

        System.out.println("Expression: " + prettyPrint(expr));
        System.out.println("Result: " + evaluate(expr));

        // Reflection
        System.out.println("Expr is sealed: " + Expr.class.isSealed());
        for (var sub : Expr.class.getPermittedSubclasses()) {
            System.out.println("Permitted: " + sub.getSimpleName());
        }
    }
}

// OUTPUT:
// Expression: ((3.0 + 4.0) * -(2.0))
// Result: -14.0
// Expr is sealed: true
// Permitted: Num
// Permitted: Add
// Permitted: Mul
// Permitted: Neg`
                                ]
                            }
                        ]
};
