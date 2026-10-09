import { Topic } from '../coreJava';

export const bridgePattern: Topic = {
    id: 'bridge-pattern',
    name: 'Bridge Pattern',
    beginner: [
        {
            content: `
<h4>Real-Life Example:</h4>
<p>
Think of a <b>TV remote control</b>. The remote (abstraction) knows how to
turn a TV on/off, change channels, adjust volume — but it works with TVs from
different brands (Sony, Samsung, LG) that each implement those operations
differently. The remote's design and the TV's internal implementation can
change and evolve independently, as long as they agree on a common
communication protocol (the "implementation" interface).
</p>
<ul>
<li>TV remote (abstraction) working with different TV brands (implementation)</li>
<li>A universal charger (abstraction) working with different phone brands' charging circuits</li>
<li>A payment app (abstraction) working with different payment gateways</li>
</ul>
`
        },
        {
            content: `
<h4>Why do we need Bridge Pattern?</h4>
<p>
When a class has two independent dimensions of variation — for example
"shape type" (Circle, Square) and "color" (Red, Green) — using plain
inheritance forces you to create a subclass for every combination
(<code>RedCircle</code>, <code>GreenCircle</code>, <code>RedSquare</code>,
<code>GreenSquare</code>...), which explodes quickly. The Bridge Pattern
<b>decouples an abstraction from its implementation</b> so the two can vary
independently, connecting them through composition instead of inheritance.
</p>
<ul>
<li>Avoid class explosion from combining two varying dimensions</li>
<li>Let abstraction and implementation evolve independently</li>
<li>Favor composition over inheritance</li>
</ul>
`
        },
        {
            content: `
<h4>Basic Structure:</h4>
<ul>
<li><b>Abstraction</b> — high-level control layer, holds a reference to an Implementor (e.g. Shape)</li>
<li><b>RefinedAbstraction</b> — extends Abstraction with more specific variants (e.g. Circle, Square)</li>
<li><b>Implementor</b> — interface for the implementation side (e.g. Color)</li>
<li><b>ConcreteImplementor</b> — actual implementation (e.g. Red, Green)</li>
</ul>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
Shape (Abstraction) -----bridge-----> Color (Implementor)
   |                                       |
   +-- Circle                              +-- Red
   +-- Square                              +-- Green
</pre>
`
        },
        {
            content: `
<h4>Example: Shape bridged to Color</h4>
`,
            codeExamples: [
                `// Implementor
interface Color {
    String fill();
}

// ConcreteImplementors
class Red implements Color {
    public String fill() { return "Red"; }
}

class Green implements Color {
    public String fill() { return "Green"; }
}

// Abstraction
abstract class Shape {
    protected Color color; // the "bridge" to the implementation

    protected Shape(Color color) {
        this.color = color;
    }

    public abstract void draw();
}

// RefinedAbstractions
class Circle extends Shape {
    public Circle(Color color) {
        super(color);
    }
    public void draw() {
        System.out.println("Drawing a " + color.fill() + " Circle");
    }
}

class Square extends Shape {
    public Square(Color color) {
        super(color);
    }
    public void draw() {
        System.out.println("Drawing a " + color.fill() + " Square");
    }
}

// Client
public class Test {
    public static void main(String[] args) {
        Shape redCircle = new Circle(new Red());
        Shape greenSquare = new Square(new Green());

        redCircle.draw();   // Drawing a Red Circle
        greenSquare.draw(); // Drawing a Green Square

        // Any Shape can be combined with any Color without new subclasses
        Shape greenCircle = new Circle(new Green());
        greenCircle.draw(); // Drawing a Green Circle
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>Real World Java Usage: JDBC Driver Architecture</h3>
<p>
JDBC is a textbook real-world Bridge. Your application code (the
abstraction: <code>Connection</code>, <code>Statement</code>,
<code>ResultSet</code> interfaces) is decoupled from the actual database
driver implementation (MySQL driver, PostgreSQL driver, Oracle driver — the
implementor side). <code>DriverManager</code> connects the two at runtime,
so you can switch databases by swapping the driver jar, without changing
application code written against the JDBC interfaces.
</p>
`,
            codeExamples: [
                `import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.ResultSet;

public class JdbcBridgeDemo {
    public static void main(String[] args) throws Exception {
        // Abstraction: java.sql.Connection / Statement / ResultSet
        // Implementor: the actual driver loaded at runtime (MySQL, Postgres, etc.)
        Connection connection = DriverManager.getConnection(
            "jdbc:mysql://localhost:3306/testdb", "user", "password");

        Statement statement = connection.createStatement();
        ResultSet resultSet = statement.executeQuery("SELECT * FROM employees");

        while (resultSet.next()) {
            System.out.println(resultSet.getString("name"));
        }

        connection.close();
        // Switching to PostgreSQL only requires changing the JDBC URL + driver jar -
        // application code above stays exactly the same.
    }
}`
            ]
        },
        {
            content: `
<h3>Bridge vs Adapter</h3>
<p>
Bridge and Adapter look structurally similar (both involve composition and
delegation to another interface), but they solve different problems and are
applied at different times.
</p>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Bridge</th>
<th>Adapter</th>
</tr>
<tr>
<td>When applied</td>
<td>Designed up-front, before implementation exists, to let two hierarchies vary independently</td>
<td>Applied after the fact, to make an existing incompatible class work with a client</td>
</tr>
<tr>
<td>Intent</td>
<td>Decouple abstraction from implementation</td>
<td>Convert one interface into another expected interface</td>
</tr>
<tr>
<td>Relationship</td>
<td>Both sides are usually designed together as parallel hierarchies</td>
<td>Adaptee is usually an existing, unrelated class you don't control</td>
</tr>
</table>
`
        },
        {
            content: `
<h4>Common Mistakes</h4>
<ul>
<li>Confusing Bridge with Adapter and applying Bridge retroactively to patch
incompatible interfaces — use Adapter for that instead.</li>
<li>Letting the Abstraction know implementation details of the
ConcreteImplementor — breaks the whole point of decoupling.</li>
<li>Not planning for the two dimensions of variation up front, resulting in
a Bridge that is bolted on rather than designed in.</li>
</ul>

<h4>When NOT to use Bridge</h4>
<ul>
<li>When there is only one dimension of variation — plain inheritance or
Strategy pattern is simpler.</li>
<li>When the abstraction and implementation will never realistically change
independently — the extra indirection isn't worth it.</li>
</ul>

<h4>Bridge + SOLID</h4>
<ul>
<li><b>Open/Closed</b> — new Shapes or new Colors can be added without
touching existing classes.</li>
<li><b>Dependency Inversion</b> — Abstraction depends on the Implementor
interface, not concrete implementations.</li>
</ul>
`
        }
    ]
};
