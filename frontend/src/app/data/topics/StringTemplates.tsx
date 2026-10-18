import { Topic } from '../coreJava';

export const stringTemplates: Topic = {
                        id: 'string-templates',
                        name: 'String Templates (Preview)',
                        beginner: [
                            {
                                content: `<h3>String Templates (Preview) in Java 21</h3>
<h4>Introduction</h4>
<strong>String Templates</strong> (JEP 430, preview in Java 21) introduce a new way to embed expressions directly in strings using the <strong>STR template processor</strong>. This is Java's answer to string interpolation found in languages like Kotlin, C#, and JavaScript.

<h4>Key Features</h4>
<ul>
<li><strong>STR processor</strong> — built-in processor for string interpolation</li>
<li><strong>\\{expression}</strong> — embeds any Java expression in a template</li>
<li><strong>Template processors</strong> — pluggable: STR, FMT, RAW, or your own</li>
<li><strong>Checked at compile time</strong> — the template syntax is verified by the compiler</li>
<li><strong>Safer</strong> — a custom processor can validate or escape embedded values</li>
</ul>

<h4>Note</h4>
<p><strong>WITHDRAWN FEATURE - this syntax does not compile on any current JDK.</strong> String Templates (JEP 430/459) were a preview in Java 21, re-previewed in Java 22, and then removed in JDK 23. They exist in no current release, even with <strong>--enable-preview</strong>. This page is retained for historical context only; use <code>String.format()</code>, <code>formatted()</code> or a <code>StringBuilder</code> instead.</p>

<h4>Basic Syntax</h4>
<ul>
<li><strong>STR."Hello \\{name}"</strong> — puts the value of <code>name</code> into the string</li>
<li>The expression inside <code>\\{}</code> can be any valid Java expression</li>
</ul>`,
                                codeExamples: [
`// String Templates — Basic Usage (Preview, --enable-preview required)
// Note: Enable preview features to compile:
// javac --enable-preview --source 21 StringTemplateBasic.java
// java --enable-preview StringTemplateBasic

public class StringTemplateBasic {
    public static void main(String[] args) {
        String name = "Java";
        int version = 21;

        // OLD ways of string composition
        String old1 = "Hello " + name + " " + version;      // concatenation
        String old2 = String.format("Hello %s %d", name, version); // format
        String old3 = new StringBuilder("Hello ").append(name)
            .toString();                                    // builder

        // NEW: String Template with STR processor
        String greeting = STR."Hello \\{name} \\{version}";
        System.out.println(greeting);  // Hello Java 21

        // Expressions inside templates
        int x = 10, y = 20;
        String math = STR."\\{x} + \\{y} = \\{x + y}";
        System.out.println(math);  // 10 + 20 = 30

        // Method calls in templates
        String upper = STR."Name in uppercase: \\{name.toUpperCase()}";
        System.out.println(upper);  // Name in uppercase: JAVA

        // Multi-line string templates
        String html = STR."""
                <html>
                    <body>
                        <h1>Welcome, \\{name}!</h1>
                        <p>Version: \\{version}</p>
                    </body>
                </html>
                """;
        System.out.println(html);
    }
}

// OUTPUT:
// Hello Java 21
// 10 + 20 = 30
// Name in uppercase: JAVA
// <html>
//     <body>
//         <h1>Welcome, Java!</h1>
//         <p>Version: 21</p>
//     </body>
// </html>`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>String Templates — Intermediate Usage</h3>
<h4>Complex Expressions</h4>
<p>Template expressions can contain any Java expression: method calls, ternary operators, array access, and more.</p>

<h4>FMT Template Processor</h4>
<p>The <strong>FMT</strong> processor supports format specifiers (like printf) inside templates, combining the convenience of templates with the precision of formatted output.</p>

<h4>Template Processor Architecture</h4>
<p>A <strong>StringTemplate</strong> is created from the template literal. A <strong>template processor</strong> then transforms it. STR is the standard processor; FMT adds formatting; you can create custom processors.</p>

<h4>Best Practices</h4>
<ul>
<li>Use <b>STR</b> for simple interpolation</li>
<li>Use <b>FMT</b> when formatted output is needed (currency, decimals, alignment)</li>
<li>Consider <b>custom processors</b> for SQL, HTML, or JSON to prevent injection</li>
<li>Templates are more readable than concatenation for complex strings</li>
</ul>`,
                                codeExamples: [
`// String Templates — Intermediate Usage (Preview)
import java.time.LocalDate;
import java.util.List;

public class StringTemplateIntermediate {
    record Product(String name, double price, int quantity) {}

    public static void main(String[] args) {
        // Complex expressions in templates
        var products = List.of(
            new Product("Laptop", 999.99, 5),
            new Product("Mouse", 29.99, 50),
            new Product("Keyboard", 79.99, 30)
        );

        // Ternary and method calls in templates
        for (var p : products) {
            String status = p.quantity() > 20 ? "In Stock" : "Low Stock";
            String line = STR."\\{p.name()}: $\\{p.price()} (\\{status})";
            System.out.println(line);
        }

        // FMT processor for formatted output
        System.out.println("\\nFormatted Product List:");
        for (var p : products) {
            String formatted =
                FMT."%-15s\\{p.name()} $%8.2f\\{p.price()} x %3d\\{p.quantity()}";
            System.out.println(formatted);
        }

        // Date and computed values
        var today = LocalDate.now();
        double total = products.stream().mapToDouble(p -> p.price() * p.quantity()).sum();

        String report = STR."""
                ================================
                Inventory Report - \\{today}
                ================================
                Total Products: \\{products.size()}
                Total Value:    $\\{String.format("%.2f", total)}
                Average Price:  $\\{String.format("%.2f", total / products.size())}
                ================================
                """;
        System.out.println(report);
    }
}

// OUTPUT (the date depends on the day you run it):
// Laptop: $999.99 (Low Stock)
// Mouse: $29.99 (In Stock)
// Keyboard: $79.99 (In Stock)
//
// Formatted Product List:
// Laptop          $  999.99 x   5
// Mouse           $   29.99 x  50
// Keyboard        $   79.99 x  30
// ================================
// Inventory Report - 2025-01-15
// ================================
// Total Products: 3
// Total Value:    $8899.15
// Average Price:  $2966.38
// ================================`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>String Templates — Expert Deep Dive</h3>
<h4>Custom Template Processors</h4>
<p>You can create custom template processors by implementing the <strong>StringTemplate.Processor</strong> interface. This enables domain-specific processing like SQL sanitization, HTML escaping, or JSON validation.</p>

<h4>How Templates Work Internally</h4>
<ul>
<li>The compiler splits the template into <strong>fragments</strong> (literal parts) and <strong>values</strong> (expression results)</li>
<li>A <strong>StringTemplate</strong> object holds both fragments and values</li>
<li>The processor's <strong>process()</strong> method receives the StringTemplate and produces the result</li>
<li>STR simply concatenates fragments and values</li>
<li>Custom processors can validate, sanitize, or transform the output</li>
</ul>

<h4>Security Benefits</h4>
<ul>
<li><b>SQL injection:</b> a SQL processor can bind values with a PreparedStatement</li>
<li><b>XSS:</b> an HTML processor can escape special characters</li>
<li>Unlike string concatenation, templates keep structure and data separate</li>
</ul>

<h4>Quick Q&amp;A</h4>
<ul>
<li><strong>Q: Are String Templates compiled differently?</strong> — Yes, the compiler creates a StringTemplate object that is processed at runtime</li>
<li><strong>Q: Can a template processor return non-String types?</strong> — Yes, the Processor interface is generic: Processor&lt;R, E&gt; (R is the result type, E the exception type)</li>
</ul>`,
                                codeExamples: [
`// Expert String Templates — Custom Processor (Preview)
import java.lang.StringTemplate;

public class StringTemplateExpert {
    // Custom processor that escapes HTML entities
    static final StringTemplate.Processor<String, RuntimeException> HTML =
        template -> {
            StringBuilder sb = new StringBuilder();
            var fragments = template.fragments();
            var values = template.values();

            for (int i = 0; i < fragments.size(); i++) {
                sb.append(fragments.get(i));
                if (i < values.size()) {
                    // Escape HTML special characters in values
                    String escaped = values.get(i).toString()
                        .replace("&", "&amp;")
                        .replace("<", "&lt;")
                        .replace(">", "&gt;")
                        .replace("\\"", "&quot;");
                    sb.append(escaped);
                }
            }
            return sb.toString();
        };

    // Custom processor that creates JSON safely
    static final StringTemplate.Processor<String, RuntimeException> JSON =
        template -> {
            StringBuilder sb = new StringBuilder();
            var fragments = template.fragments();
            var values = template.values();

            for (int i = 0; i < fragments.size(); i++) {
                sb.append(fragments.get(i));
                if (i < values.size()) {
                    Object val = values.get(i);
                    if (val instanceof String s) {
                        sb.append("\\"").append(
                            s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"")
                        ).append("\\"");
                    } else {
                        sb.append(val);
                    }
                }
            }
            return sb.toString();
        };

    public static void main(String[] args) {
        // HTML escaping — prevents XSS
        String userInput = "<script>alert('xss')</script>";
        String safe = HTML."<p>User said: \\{userInput}</p>";
        System.out.println(safe);
        // <p>User said: &lt;script&gt;alert('xss')&lt;/script&gt;</p>

        // JSON processor
        String name = "O'Brien";
        int age = 30;
        String json = JSON."{ \\"name\\": \\{name}, \\"age\\": \\{age} }";
        System.out.println(json);

        // RAW processor — access template structure
        StringTemplate raw = RAW."Hello \\{name}, age \\{age}";
        System.out.println("Fragments: " + raw.fragments());
        System.out.println("Values: " + raw.values());
    }
}

// OUTPUT:
// <p>User said: &lt;script&gt;alert('xss')&lt;/script&gt;</p>
// { "name": "O'Brien", "age": 30 }
// Fragments: [Hello , , age , ]
// Values: [O'Brien, 30]`
                                ]
                            }
                        ]
};
