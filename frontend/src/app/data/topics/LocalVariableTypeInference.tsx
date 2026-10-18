import { Topic } from '../coreJava';

export const localVariableTypeInference: Topic = {
                        id: 'var-keyword',
                        name: 'Local Variable Type Inference (var)',
                        beginner: [
                            {
                                content: `<h3>Local Variable Type Inference (var)</h3>
<h4>Introduction</h4>
Java 10 introduced the <strong>var</strong> keyword (enhanced in Java 11) which allows local variable type inference. Instead of explicitly declaring the type of a local variable, you can use <strong>var</strong> and let the compiler infer the type from the initializer expression.<br><br>

<h4>Key Features</h4>
• <strong>var</strong> is not a keyword but a reserved type name<br>
• The compiler infers the type at compile time — it is NOT dynamic typing<br>
• Can only be used for local variables with initializers<br>
• Improves code readability by reducing boilerplate<br><br>

<h4>Basic Syntax</h4>
• <strong>var name = "Java";</strong> — compiler infers String<br>
• <strong>var count = 10;</strong> — compiler infers int<br>
• <strong>var list = new ArrayList&lt;String&gt;();</strong> — compiler infers ArrayList&lt;String&gt;<br><br>

<h4>Limitations</h4>
• Cannot be used for class fields (instance/static variables)<br>
• Cannot be used for method parameters<br>
• Cannot be used for method return types<br>
• Cannot be used with null initializer: <strong>var x = null;</strong> is invalid<br>
• Cannot be used with lambda expressions without explicit target type`,
                                codeExamples: [
`// Basic var usage
public class VarExample {
    public static void main(String[] args) {
        // Instead of: String name = "Java 11";
        var name = "Java 11";

        // Instead of: int number = 42;
        var number = 42;

        // Instead of: List<String> fruits = new ArrayList<>();
        var fruits = new ArrayList<String>();
        fruits.add("Apple");
        fruits.add("Banana");

        // Instead of: Map<String, Integer> map = new HashMap<>();
        var map = new HashMap<String, Integer>();
        map.put("one", 1);
        map.put("two", 2);

        System.out.println(name);       // Java 11
        System.out.println(number);     // 42
        System.out.println(fruits);     // [Apple, Banana]
        System.out.println(map);        // {one=1, two=2}
    }
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Local Variable Type Inference — Intermediate Usage</h3>
<h4>Using var in Loops</h4>
The <strong>var</strong> keyword works naturally in for-each and traditional for loops, making iteration code cleaner.<br><br>

<h4>Using var with Try-With-Resources</h4>
<strong>var</strong> can simplify resource management in try-with-resources blocks.<br><br>

<h4>var with Anonymous Classes</h4>
When used with anonymous classes, <strong>var</strong> captures the anonymous type, giving access to additional methods defined in the anonymous class.<br><br>

<h4>Best Practices</h4>
• Use <strong>var</strong> when the type is obvious from the right-hand side<br>
• Avoid <strong>var</strong> when it reduces readability<br>
• Use meaningful variable names when using <strong>var</strong> to maintain clarity<br>
• <strong>var</strong> works well with the diamond operator and factory methods<br>
• Prefer <strong>var</strong> in local contexts where the scope is small`,
                                codeExamples: [
`// var in loops and try-with-resources
import java.io.*;
import java.util.*;

public class VarIntermediate {
    public static void main(String[] args) throws Exception {
        // var in for-each loop
        var names = List.of("Anaji", "Baji", "Chimnaji");
        for (var name : names) {
            System.out.println(name.toUpperCase());
        }

        // var in traditional for loop
        for (var i = 0; i < 5; i++) {
            System.out.println("Count: " + i);
        }

        // var with try-with-resources
        try (var reader = new BufferedReader(new FileReader("test.txt"))) {
            var line = reader.readLine();
            System.out.println(line);
        }

        // var with Stream API
        var stream = names.stream()
            .filter(n -> n.startsWith("A"))
            .map(String::toUpperCase);
        stream.forEach(System.out::println);

        // var with Map.entry iteration
        var map = Map.of("Java", 11, "Kotlin", 1);
        for (var entry : map.entrySet()) {
            System.out.println(entry.getKey() + " -> " + entry.getValue());
        }
    }
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Local Variable Type Inference — Expert Deep Dive</h3>
<h4>How var Works Internally</h4>
• The <strong>var</strong> keyword is handled entirely at compile time<br>
• The compiled bytecode is identical whether you use <strong>var</strong> or an explicit type<br>
• The compiler infers from the STANDALONE type of the initializer. Poly expressions are rejected, which is why var f = () -&gt; {} and var a = {1,2} are compile errors<br>
• <strong>var</strong> does NOT make Java dynamically typed — it is still statically typed<br><br>

<h4>var vs Explicit Types — When to Choose</h4>
• Use explicit types when working with interfaces: <strong>List&lt;String&gt; list = new ArrayList&lt;&gt;();</strong><br>
• Using <strong>var</strong> with <strong>new ArrayList&lt;String&gt;()</strong> infers <strong>ArrayList</strong>, not <strong>List</strong><br>
• This can inadvertently couple code to implementation details<br><br>

<h4>Common Interview Questions</h4>
• <strong>Q: Is var a keyword in Java?</strong> — No, it is a reserved type name. You can still use "var" as a variable name.<br>
• <strong>Q: Does var make Java dynamically typed?</strong> — No, the type is inferred at compile time and is fixed.<br>
• <strong>Q: Can var be used with generics?</strong> — Yes, but be careful with diamond operator inference.<br>
• <strong>Q: What happens with var x = null?</strong> — Compilation error, as the type cannot be inferred from null.`,
                                codeExamples: [
`// Expert-level var scenarios
import java.util.*;

public class VarExpert {
    public static void main(String[] args) {
        // var infers ArrayList, not List (coupling to implementation)
        var list = new ArrayList<String>();  // type is ArrayList<String>
        // List<String> list = new ArrayList<>(); // preferred for abstraction

        // var with diamond operator — infers ArrayList<Object>
        // var ambiguous = new ArrayList<>(); // infers ArrayList<Object>

        // var with anonymous class gives access to extra methods
        var obj = new Object() {
            String greet() { return "Hello from anonymous!"; }
        };
        System.out.println(obj.greet()); // Works! Type is the anonymous class

        // var is a reserved type name, not a keyword
        // You can use it as a variable name (though not recommended)
        String var = "This is valid!";
        System.out.println(var);

        // var with ternary — both branches must be compatible
        var result = (args.length > 0) ? "Has args" : "No args";
        // type is String

        // var with intersection types
        var comparable = (Comparable<String> & Serializable) "test";
    }
}`
                                ]
                            }
                        ]
};
