import { Topic } from '../coreJava';

export const designPatternFundamentals: Topic = {
    id: 'design-pattern-fundamentals',
    name: 'Design Pattern Fundamentals',
    beginner: [
        {
            content: `
<h3>What is a Design Pattern?</h3>
<p>
A <b>Design Pattern</b> is a <b>proven, reusable solution</b> to a commonly occurring problem
in software design. It is not finished code that you copy-paste — it is a <b>template / blueprint</b>
that you adapt to your own situation.
</p>

<h4>Real-Life Analogy:</h4>
<ul>
<li>Building architects use standard blueprints for staircases, doors, and windows instead of inventing a new design every time.</li>
<li>Cooking recipes are "patterns" — the same recipe (pattern) can be used with different ingredients (your actual classes).</li>
<li>Traffic signals are a standard "pattern" for solving the problem of managing intersections safely, used all over the world.</li>
</ul>

<h4>Why do we need Design Patterns?</h4>
<ul>
<li>They are <b>battle-tested</b> solutions — used and refined by thousands of developers.</li>
<li>They give developers a <b>common vocabulary</b> ("just use a Singleton here") to communicate design ideas quickly.</li>
<li>They help avoid <b>reinventing the wheel</b> for problems that are already solved.</li>
<li>They make code more <b>maintainable, flexible, and easy to extend</b>.</li>
</ul>

<h4>Without Patterns vs With Patterns:</h4>
<ul>
<li>Without patterns → every developer solves the same problem differently → inconsistent, hard-to-maintain code.</li>
<li>With patterns → team follows a shared, well-understood structure → predictable and easier to review.</li>
</ul>
`,
        },
        {
            content: `
<h3>The Gang of Four (GoF)</h3>
<p>
In 1994, four authors — <b>Erich Gamma, Richard Helm, Ralph Johnson, and Jiva Vlissides</b> —
wrote a book called <i>"Design Patterns: Elements of Reusable Object-Oriented Software"</i>.
Because there were four authors, they are famously called the <b>"Gang of Four" (GoF)</b>.
</p>

<h4>What did they do?</h4>
<ul>
<li>They studied thousands of real object-oriented software designs.</li>
<li>They extracted <b>23 common, recurring solutions</b> and documented them formally.</li>
<li>These 23 patterns are today known as the <b>GoF Design Patterns</b> — the foundation of modern design pattern learning.</li>
</ul>

<h4>The 3 Categories of GoF Patterns:</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Category</th>
<th>Purpose</th>
<th>Examples</th>
</tr>
<tr>
<td>Creational</td>
<td>Deals with <b>how objects are created</b></td>
<td>Singleton, Factory, Builder, Prototype, Abstract Factory</td>
</tr>
<tr>
<td>Structural</td>
<td>Deals with <b>how classes/objects are composed</b> into larger structures</td>
<td>Adapter, Decorator, Facade, Proxy, Composite, Bridge, Flyweight</td>
</tr>
<tr>
<td>Behavioral</td>
<td>Deals with <b>how objects communicate</b> and share responsibility</td>
<td>Observer, Strategy, Command, Iterator, Template Method, State, Visitor, Memento, Interpreter, Mediator, Chain of Responsibility</td>
</tr>
</table>
`,
        },
        {
            content: `
<h3>UML Basics — How Patterns Are Described</h3>
<p>
Design patterns are almost always explained using a <b>UML (Unified Modeling Language) class diagram</b>.
To understand any pattern's diagram, you must know 4 basic relationship arrows.
</p>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
1) Association   :  ClassA -------> ClassB        ("uses a")
2) Aggregation    :  ClassA <>----- ClassB        ("has a", weak ownership)
3) Composition    :  ClassA &lt;#&gt;----- ClassB        ("owns a", strong ownership)
4) Inheritance    :  ClassA -------|&gt; ClassB       ("is a", extends/implements)
</pre>

<h4>Simple meaning of each arrow:</h4>
<ul>
<li><b>Association</b>: One class simply knows about / calls another class. Example: a Driver class uses a Car class.</li>
<li><b>Aggregation</b>: "Has-a" relationship where the child can exist independently. Example: a Team has Players, but Players can exist without the Team.</li>
<li><b>Composition</b>: Strong "has-a" relationship where the child <b>cannot exist</b> without the parent. Example: a House has Rooms — destroy the House, the Rooms are gone too.</li>
<li><b>Inheritance</b>: "Is-a" relationship. Example: Dog extends Animal, or a class implements an interface.</li>
</ul>

<h4>Why this matters for patterns?</h4>
<p>
Every GoF pattern diagram is drawn using these 4 arrows. Once you recognize them,
you can read <b>any</b> pattern diagram in any book or website confidently.
</p>
`,
        },
        {
            content: `
<h3>How to Choose the Right Pattern?</h3>
<p>
Beginners often get confused about "which pattern to use when". Here is a simple
decision flow to think through the problem step-by-step.
</p>

<h4>Step-by-Step Decision Flow:</h4>
<ul>
<li><b>Step 1 — Ask:</b> Is my problem about <i>creating objects</i>? → Look at <b>Creational</b> patterns (Singleton, Factory, Builder...).</li>
<li><b>Step 2 — Ask:</b> Is my problem about <i>composing/structuring classes or objects together</i>? → Look at <b>Structural</b> patterns (Adapter, Decorator, Facade...).</li>
<li><b>Step 3 — Ask:</b> Is my problem about <i>how objects talk to each other or share responsibility</i>? → Look at <b>Behavioral</b> patterns (Observer, Strategy, Command...).</li>
<li><b>Step 4 — Narrow down</b> within the category based on the exact need:
  <ul>
  <li>Need only ONE instance? → Singleton</li>
  <li>Need to build a complex object step-by-step? → Builder</li>
  <li>Need to add behavior without changing the class? → Decorator</li>
  <li>Need to notify multiple listeners on change? → Observer</li>
  </ul>
</li>
<li><b>Step 5 — Don't force it:</b> If no pattern fits naturally, plain simple code is better than a forced pattern.</li>
</ul>

<h4>Golden Rule:</h4>
<p>
"Patterns are a means to write flexible, maintainable code — not a checklist to complete."
Apply a pattern only when the <b>problem it solves</b> is actually present in your code.
</p>
`,
        },
    ],
    expert: [
        {
            content: `
<h3>SOLID Principles — The Foundation Behind Good Pattern Usage</h3>
<p>
Design patterns work well only when the underlying code follows good object-oriented design principles.
The most important set of these principles is <b>SOLID</b>, introduced by Robert C. Martin (Uncle Baji).
</p>

<h4>S — Single Responsibility Principle (SRP)</h4>
<p>A class should have <b>only one reason to change</b> — i.e., it should do only one job.</p>
`,
            codeExamples: [
                `// BAD: Invoice class does calculation AND printing AND saving
class Invoice {
    double calculateTotal() { return 100.0; }
    void printInvoice() { /* printing logic */ }
    void saveToDatabase() { /* database logic */ }
}

// GOOD: Separate responsibility into separate classes
class Invoice {
    double calculateTotal() { return 100.0; }
}

class InvoicePrinter {
    void print(Invoice invoice) { /* printing logic */ }
}

class InvoiceRepository {
    void save(Invoice invoice) { /* database logic */ }
}`,
            ],
        },
        {
            content: `
<h4>O — Open/Closed Principle (OCP)</h4>
<p>Classes should be <b>open for extension but closed for modification</b>. Add new behavior by adding new code, not by editing existing tested code.</p>
`,
            codeExamples: [
                `// BAD: Modifying this class every time a new shape is added
class AreaCalculator {
    double calculate(Object shape) {
        if (shape instanceof Circle) { /* ... */ }
        else if (shape instanceof Rectangle) { /* ... */ }
        // every new shape needs another else-if here (violates OCP)
        return 0;
    }
}

// GOOD: Extend via polymorphism, no modification needed
interface Shape {
    double area();
}

class Circle implements Shape {
    double radius;
    public double area() { return Math.PI * radius * radius; }
}

class Rectangle implements Shape {
    double length, width;
    public double area() { return length * width; }
}

// AreaCalculator never changes when a new Shape is added
class AreaCalculator {
    double calculate(Shape shape) {
        return shape.area();
    }
}`,
            ],
        },
        {
            content: `
<h4>L — Liskov Substitution Principle (LSP)</h4>
<p>Objects of a subclass should be <b>replaceable</b> with objects of the parent class without breaking the application.</p>
`,
            codeExamples: [
                `// BAD: Violates LSP - Ostrich cannot fly, breaks the contract
class Bird {
    void fly() { System.out.println("Flying"); }
}

class Ostrich extends Bird {
    @Override
    void fly() {
        throw new UnsupportedOperationException("Ostrich can't fly!");
    }
}

// GOOD: Separate the flying capability into its own abstraction
interface Bird { }

interface FlyingBird extends Bird {
    void fly();
}

class Sparrow implements FlyingBird {
    public void fly() { System.out.println("Flying"); }
}

class Ostrich implements Bird {
    // no fly() forced on it - contract is respected
}`,
            ],
        },
        {
            content: `
<h4>I — Interface Segregation Principle (ISP)</h4>
<p>Clients should not be forced to depend on methods they do not use. Prefer <b>many small interfaces</b> over one large "fat" interface.</p>
`,
            codeExamples: [
                `// BAD: Fat interface forces unrelated methods on every implementer
interface Worker {
    void work();
    void eat();
}

class Robot implements Worker {
    public void work() { System.out.println("Working"); }
    public void eat() { throw new UnsupportedOperationException(); } // Robots don't eat!
}

// GOOD: Segregate into smaller, focused interfaces
interface Workable {
    void work();
}

interface Eatable {
    void eat();
}

class Human implements Workable, Eatable {
    public void work() { System.out.println("Working"); }
    public void eat() { System.out.println("Eating"); }
}

class Robot implements Workable {
    public void work() { System.out.println("Working"); }
}`,
            ],
        },
        {
            content: `
<h4>D — Dependency Inversion Principle (DIP)</h4>
<p>High-level modules should not depend on low-level modules. Both should <b>depend on abstractions</b> (interfaces), not concrete classes.</p>
`,
            codeExamples: [
                `// BAD: High-level class directly depends on low-level concrete class
class MySQLDatabase {
    void save(String data) { System.out.println("Saved to MySQL"); }
}

class UserService {
    MySQLDatabase database = new MySQLDatabase(); // tight coupling
    void saveUser(String data) { database.save(data); }
}

// GOOD: Depend on abstraction, not implementation
interface Database {
    void save(String data);
}

class MySQLDatabase implements Database {
    public void save(String data) { System.out.println("Saved to MySQL"); }
}

class MongoDatabase implements Database {
    public void save(String data) { System.out.println("Saved to MongoDB"); }
}

class UserService {
    private final Database database; // depends on abstraction

    UserService(Database database) {
        this.database = database;
    }

    void saveUser(String data) { database.save(data); }
}`,
            ],
        },
        {
            content: `
<h3>Anti-Patterns — The Opposite of Good Pattern Usage</h3>
<p>
While design patterns are proven <b>good</b> solutions, <b>anti-patterns</b> are common
<b>bad</b> practices that look like a solution but actually create long-term problems.
Knowing them helps you recognize when your code needs a real design pattern.
</p>

<h4>God Object (a.k.a. God Class)</h4>
<ul>
<li>A single class that does <b>everything</b> — validation, business logic, database access, UI, email sending, etc.</li>
<li>Violates Single Responsibility Principle badly.</li>
<li>Extremely hard to test, maintain, or extend.</li>
<li><b>Fix:</b> Break it down using SRP, Facade, or Strategy patterns.</li>
</ul>

<h4>Spaghetti Code</h4>
<ul>
<li>Code with tangled control flow, deep nesting, and no clear structure — like a plate of spaghetti, everything is interconnected.</li>
<li>Usually caused by skipping design altogether and just "making it work".</li>
<li>Very hard to trace bugs or add new features safely.</li>
<li><b>Fix:</b> Introduce clear layering (Template Method, Strategy, Chain of Responsibility) and enforce SOLID principles.</li>
</ul>

<h4>Other Common Anti-Patterns</h4>
<ul>
<li><b>Golden Hammer</b> — Using your favorite pattern/tool for every problem, even when it doesn't fit.</li>
<li><b>Copy-Paste Programming</b> — Duplicating code instead of extracting a reusable abstraction.</li>
<li><b>Magic Numbers/Strings</b> — Hardcoding values instead of using constants/config.</li>
</ul>

<h4>Key Takeaway</h4>
<p>
Design patterns exist specifically to <b>prevent</b> these anti-patterns. A codebase riddled with
God Objects and Spaghetti Code is almost always a codebase that ignored SOLID principles and design patterns.
</p>
`,
        },
        {
            content: `
<h3>Interview Questions — Design Pattern Fundamentals</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>#</th>
<th>Question</th>
<th>Short Answer</th>
</tr>
<tr>
<td>1</td>
<td>What is a design pattern?</td>
<td>A proven, reusable solution/template for a commonly occurring software design problem.</td>
</tr>
<tr>
<td>2</td>
<td>Who are the Gang of Four (GoF)?</td>
<td>Erich Gamma, Richard Helm, Ralph Johnson, Jiva Vlissides — authors of the original 23 design patterns book.</td>
</tr>
<tr>
<td>3</td>
<td>What are the 3 categories of GoF patterns?</td>
<td>Creational (object creation), Structural (class/object composition), Behavioral (object communication).</td>
</tr>
<tr>
<td>4</td>
<td>Why not just use design patterns everywhere?</td>
<td>Overusing patterns adds unnecessary complexity (Golden Hammer anti-pattern) — apply only when the problem genuinely fits.</td>
</tr>
<tr>
<td>5</td>
<td>How are design patterns typically documented?</td>
<td>Using UML class diagrams showing association, aggregation, composition, and inheritance relationships.</td>
</tr>
<tr>
<td>6</td>
<td>What is the difference between Aggregation and Composition?</td>
<td>Aggregation is a weak "has-a" where the child can exist independently; Composition is a strong "has-a" where the child's lifecycle depends on the parent.</td>
</tr>
<tr>
<td>7</td>
<td>What is SOLID and how does it relate to design patterns?</td>
<td>SOLID is a set of 5 OOP design principles; well-designed patterns naturally follow SOLID principles.</td>
</tr>
<tr>
<td>8</td>
<td>What is a God Object anti-pattern?</td>
<td>A single class that takes on too many responsibilities, violating SRP and becoming hard to maintain.</td>
</tr>
<tr>
<td>9</td>
<td>How do you decide which design pattern to use?</td>
<td>First identify whether the problem is about creation, structure, or behavior, then narrow down based on the exact need — never force a pattern that doesn't fit.</td>
</tr>
</table>
`,
        },
    ],
};
