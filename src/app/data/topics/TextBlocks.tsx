import { Topic } from '../coreJava';

export const textBlocks: Topic = {
                        id: 'text-blocks',
                        name: 'Text Blocks',
                        beginner: [
                            {
                                content: `<h3>Text Blocks in Java</h3>
<h4>Introduction</h4>
<p><strong>Text blocks</strong> were introduced as a preview in Java 13 and finalized in Java 15 (so they are available in Java 17 LTS). They let you write multi-line string literals between triple double quotes (<strong>"""</strong>). This makes it easy to embed HTML, JSON, SQL, and other formatted text.</p>

<h4>Key Features</h4>
<ul>
<li>Multi-line strings without concatenation or \\n escape sequences</li>
<li>Automatic indentation handling</li>
<li>Triple-quote delimiters: <strong>"""text"""</strong></li>
<li>The opening """ must be followed by a line terminator</li>
<li>The closing """ position decides how much indentation is stripped</li>
</ul>

<h4>Benefits</h4>
<ul>
<li>Much better readability for embedded code or data</li>
<li>Less string concatenation boilerplate</li>
<li>Common indentation is removed automatically</li>
<li>All old escape sequences work, plus two new ones</li>
</ul>`,
                                codeExamples: [
`// Text Blocks — Basic Usage
public class TextBlockBasic {
    public static void main(String[] args) {
        // OLD way — painful string concatenation
        String htmlOld = "<html>\\n" +
            "    <body>\\n" +
            "        <p>Hello, World</p>\\n" +
            "    </body>\\n" +
            "</html>";

        // NEW way — text block
        String htmlNew = """
                <html>
                    <body>
                        <p>Hello, World</p>
                    </body>
                </html>
                """;

        System.out.println(htmlNew);

        // JSON example
        String json = """
                {
                    "name": "Java",
                    "version": 17,
                    "features": ["records", "sealed classes", "text blocks"]
                }
                """;
        System.out.println(json);

        // SQL example
        String sql = """
                SELECT name, age
                FROM users
                WHERE age > 18
                ORDER BY name ASC
                """;
        System.out.println(sql);
    }
}

// OUTPUT:
// <html>
//     <body>
//         <p>Hello, World</p>
//     </body>
// </html>
//
// { "name": "Java", "version": 17, ... }   (printed on separate lines)
// SELECT name, age
// FROM users
// WHERE age > 18
// ORDER BY name ASC`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Text Blocks — Intermediate Usage</h3>
<h4>Indentation Management</h4>
<p>The position of the closing <strong>"""</strong> determines how much leading whitespace is stripped. Moving it left or right changes the indentation of the resulting string.</p>

<h4>Escape Sequences</h4>
<ul>
<li><strong>\\s</strong> — keeps trailing whitespace (a space fence)</li>
<li><strong>\\</strong> (backslash at end of line) — suppresses the newline (line continuation)</li>
<li>All traditional escapes work: \\n, \\t, \\", \\\\</li>
</ul>

<h4>String Methods with Text Blocks</h4>
<p>Text blocks produce regular String objects, so all String methods work: formatted(), replace(), indent(), stripIndent().</p>

<h4>Best Practices</h4>
<ul>
<li>Align the closing """ with the content for clean output</li>
<li>Use text blocks for HTML, JSON, SQL, XML, and regex patterns</li>
<li>Use formatted() or String.format() for parameterized text blocks</li>
<li>Prefer text blocks over multi-line string concatenation</li>
</ul>`,
                                codeExamples: [
`// Text Blocks — Intermediate Usage
public class TextBlockIntermediate {
    public static void main(String[] args) {
        // Line continuation with backslash
        String singleLine = """
                This is a very long line that we want to \\
                keep on a single line in the output but \\
                break across multiple lines in source code.""";
        System.out.println(singleLine);

        // Trailing space preservation with \\s
        String table = """
                Name   \\s
                Alice  \\s
                Bob    \\s
                """;
        System.out.println(table);

        // Using formatted() for parameterized text blocks
        String name = "Alice";
        int age = 30;
        String greeting = """
                Hello, %s!
                You are %d years old.
                Welcome to Java 17.
                """.formatted(name, age);
        System.out.println(greeting);

        // Text block with embedded quotes (no escaping needed for single ")
        String quote = """
                She said "Hello" and he replied "Hi".
                No escaping needed for double quotes!
                Only triple quotes \\"\\"\\" need escaping.
                """;
        System.out.println(quote);

        // Controlling indentation: closing """ is 4 spaces left of the text
        String indented = """
                text keeps 4 spaces
                for all lines
            """;
        String noIndent = """
                no indent left
                because closing is level with the text
                """;
        System.out.println("Indented: [" + indented + "]");
        System.out.println("No indent: [" + noIndent + "]");
    }
}

// OUTPUT:
// This is a very long line that we want to keep on a single line in the output ...
// Name
// Alice
// Bob
// Hello, Alice!
// You are 30 years old.
// Welcome to Java 17.
// She said "Hello" and he replied "Hi".
// No escaping needed for double quotes!
// Only triple quotes """ need escaping.
// Indented: [    text keeps 4 spaces
//     for all lines
// ]
// No indent: [no indent left
// because closing is level with the text
// ]`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Text Blocks — Expert Deep Dive</h3>
<h4>How Indentation Stripping Works</h4>
<ul>
<li>The compiler finds the <strong>minimum common indentation</strong> across all content lines and the closing """</li>
<li>This minimum indentation is stripped from every line</li>
<li>The same algorithm is available as <strong>String.stripIndent()</strong></li>
<li>Trailing whitespace on each line is also removed (unless \\s is used)</li>
</ul>

<h4>Compilation</h4>
<ul>
<li>Text blocks are compile-time constants, interned like regular string literals</li>
<li>In bytecode, a text block is a regular String constant (ldc instruction)</li>
<li>Indent stripping and escape handling happen at compile time, not runtime</li>
</ul>

<h4>Quick Questions</h4>
<ul>
<li><strong>Q: Are text blocks a new type?</strong> — No, they produce regular java.lang.String objects</li>
<li><strong>Q: How is indentation determined?</strong> — By the minimum leading whitespace common to all lines and the closing """</li>
<li><strong>Q: Can text blocks be used in annotations?</strong> — Yes, since they are compile-time constants</li>
<li><strong>Q: What is the \\s escape?</strong> — A "space fence" that prevents trailing whitespace stripping</li>
<li><strong>Q: Performance impact?</strong> — None at runtime; all processing is at compile time</li>
</ul>`,
                                codeExamples: [
`// Expert Text Block patterns
public class TextBlockExpert {
    // Text blocks as compile-time constants in annotations
    // @Query("""
    //     SELECT u FROM User u WHERE u.active = true
    //     """)

    // Template pattern using formatted()
    static String generateClass(String className, String field, String type) {
        return """
                public class %1$s {
                    private %2$s %3$s;

                    public %1$s(%2$s %3$s) {
                        this.%3$s = %3$s;
                    }

                    public %2$s get%4$s() {
                        return %3$s;
                    }
                }
                """.formatted(
                    className, type, field,
                    field.substring(0, 1).toUpperCase() + field.substring(1)
                );
    }

    public static void main(String[] args) {
        // String interning — text blocks are interned
        String a = """
                Hello""";
        String b = "Hello";
        System.out.println(a == b);  // true — same interned reference!

        // stripIndent() and translateEscapes() methods
        String raw = "    Hello\\n    World";
        System.out.println("stripIndent:\\n" + raw.stripIndent());

        String escaped = "Hello\\\\nWorld";
        System.out.println("translateEscapes: " + escaped.translateEscapes());

        // Code generation with text blocks
        String generatedCode = generateClass("Person", "name", "String");
        System.out.println("Generated class:");
        System.out.println(generatedCode);

        // Complex JSON template
        String apiResponse = """
                {
                    "status": "%s",
                    "code": %d,
                    "data": {
                        "items": [%s],
                        "total": %d
                    }
                }
                """.formatted("success", 200, "\\"item1\\", \\"item2\\"", 2);
        System.out.println(apiResponse);
    }
}

// OUTPUT:
// true
// stripIndent:
// Hello
// World
// translateEscapes: Hello
// World
// Generated class:
// public class Person {
//     private String name;
//     public Person(String name) { this.name = name; }  (one member per line)
//     public String getName() { return name; }
// }
// { "status": "success", "code": 200, ... }  (printed over several lines)`
                                ]
                            }
                        ]
};
