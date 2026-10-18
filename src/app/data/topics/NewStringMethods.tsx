import { Topic } from '../coreJava';

export const newStringMethods: Topic = {
                        id: 'string-methods-11',
                        name: 'New String Methods',
                        beginner: [
                            {
                                content: `<h3>New String Methods in Java 11</h3>
<h4>Introduction</h4>
Java 11 introduced several useful methods to the <strong>String</strong> class that simplify common string operations. These methods reduce the need for external libraries like Apache Commons Lang.<br><br>

<h4>New Methods Overview</h4>
• <strong>isBlank()</strong> — Returns true if the string is empty or contains only whitespace<br>
• <strong>lines()</strong> — Returns a Stream of lines extracted from the string<br>
• <strong>strip()</strong> — Removes leading and trailing whitespace (Unicode-aware)<br>
• <strong>stripLeading()</strong> — Removes leading whitespace only<br>
• <strong>stripTrailing()</strong> — Removes trailing whitespace only<br>
• <strong>repeat(int n)</strong> — Returns the string repeated n times<br><br>

<h4>strip() vs trim()</h4>
• <strong>trim()</strong> removes characters with ASCII value &lt;= 32 (space)<br>
• <strong>strip()</strong> removes all Unicode whitespace characters<br>
• <strong>strip()</strong> is the preferred modern approach`,
                                codeExamples: [
`// Java 11 String Methods — Basic Usage
public class StringMethods11 {
    public static void main(String[] args) {
        // isBlank() — checks empty or whitespace only
        System.out.println("".isBlank());        // true
        System.out.println("   ".isBlank());     // true
        System.out.println("Java".isBlank());    // false

        // strip() — removes leading and trailing whitespace
        String padded = "  Hello Java 11  ";
        System.out.println(padded.strip());          // "Hello Java 11"
        System.out.println(padded.stripLeading());   // "Hello Java 11  "
        System.out.println(padded.stripTrailing());  // "  Hello Java 11"

        // repeat(n) — repeats the string n times
        String star = "*";
        System.out.println(star.repeat(5));  // "*****"
        System.out.println("Ha".repeat(3));  // "HaHaHa"

        // lines() — splits string into stream of lines
        String multiline = "Line1\\nLine2\\nLine3";
        multiline.lines().forEach(System.out::println);
        // Output: Line1
        //         Line2
        //         Line3
    }
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>New String Methods — Intermediate Usage</h3>
<h4>Combining String Methods with Streams</h4>
The new String methods integrate seamlessly with the Stream API, enabling powerful text processing pipelines.<br><br>

<h4>Practical Use Cases</h4>
• Parsing multi-line text data with <strong>lines()</strong> and filtering with <strong>isBlank()</strong><br>
• Building formatted output with <strong>repeat()</strong><br>
• Cleaning user input with <strong>strip()</strong> variants<br>
• Processing CSV or log data line by line<br><br>

<h4>Best Practices</h4>
• Prefer <strong>strip()</strong> over <strong>trim()</strong> for Unicode compatibility<br>
• Use <strong>isBlank()</strong> instead of <strong>trim().isEmpty()</strong><br>
• Use <strong>lines()</strong> instead of <strong>split("\\n")</strong> for better performance with large strings`,
                                codeExamples: [
`// Intermediate String methods usage
import java.util.stream.Collectors;

public class StringMethodsIntermediate {
    public static void main(String[] args) {
        // Processing multi-line text
        String csvData = """
            Name, Age, City
            Anaji, 30, New York

            Baji, 25, London

            Chimnaji, 35, Tokyo
            """;

        // Filter out blank lines and strip whitespace
        var cleanLines = csvData.lines()
            .filter(line -> !line.isBlank())
            .map(String::strip)
            .collect(Collectors.toList());
        cleanLines.forEach(System.out::println);

        // Building a formatted table border
        String border = "-".repeat(40);
        String header = "| " + "Name".repeat(1) + " ".repeat(10) + "| Age |";
        System.out.println(border);
        System.out.println(header);
        System.out.println(border);

        // Counting non-blank lines
        String text = "Hello\\n\\n  \\nWorld\\n  Java  \\n";
        long nonBlankCount = text.lines()
            .filter(line -> !line.isBlank())
            .count();
        System.out.println("Non-blank lines: " + nonBlankCount); // 3

        // strip() vs trim() with Unicode whitespace
        String unicodeSpaced = "\\u2000Hello\\u2000"; // Unicode space
        System.out.println(unicodeSpaced.trim());   // may not remove Unicode spaces
        System.out.println(unicodeSpaced.strip());  // removes Unicode spaces
    }
}

// OUTPUT:
// Name, Age, City
// Anaji, 30, New York
// Baji, 25, London
// Chimnaji, 35, Tokyo
// ----------------------------------------
// | Name          | Age |
// ----------------------------------------
// Non-blank lines: 3
//  Hello      (trim keeps the Unicode spaces)
// Hello`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>New String Methods — Expert Deep Dive</h3>
<h4>Internal Implementation</h4>
• <strong>strip()</strong> uses <strong>Character.isWhitespace()</strong> which handles Unicode, while <strong>trim()</strong> uses <strong>c &lt;= ' '</strong><br>
• <strong>lines()</strong> returns a lazy Stream — lines are computed on demand, making it memory-efficient for large strings<br>
• <strong>repeat()</strong> allocates the final array once and fills it with <strong>System.arraycopy()</strong>, so it is fast<br>
• <strong>isBlank()</strong> checks <strong>Character.isWhitespace()</strong> for each code point<br><br>

<h4>Performance Considerations</h4>
• <strong>lines()</strong> is lazy, while <strong>split("\\n")</strong> builds the whole array of substrings at once<br>
• <strong>repeat()</strong> is optimized and faster than manual StringBuilder loops<br>
• <strong>isBlank()</strong> short-circuits on the first non-whitespace character<br><br>

<h4>Quick Facts</h4>
• <strong>repeat(0)</strong> returns an empty string ""<br>
• <strong>lines()</strong> is lazy, so it processes lines on demand`,
                                codeExamples: [
`// Expert-level String methods
import java.util.stream.Collectors;

public class StringMethodsExpert {
    public static void main(String[] args) {
        // Performance comparison: lines() vs split()
        String largeText = "line\\n".repeat(10000);

        // lines() is lazy — only processes what's needed
        long startLines = System.nanoTime();
        long count1 = largeText.lines().count();
        long endLines = System.nanoTime();

        // split() creates all substrings eagerly
        long startSplit = System.nanoTime();
        long count2 = largeText.split("\\n").length;
        long endSplit = System.nanoTime();

        System.out.println("lines(): " + (endLines - startLines) + " ns");
        System.out.println("split(): " + (endSplit - startSplit) + " ns");

        // Unicode whitespace handling
        // \\u2000 = EN QUAD, \\u3000 = IDEOGRAPHIC SPACE
        String unicode = "\\u2000\\u3000Hello World\\u2000\\u3000";
        System.out.println("trim: [" + unicode.trim() + "]");
        System.out.println("strip: [" + unicode.strip() + "]");

        // repeat() builds the result in one allocation
        String pattern = "AB";
        String repeated = pattern.repeat(5); // "ABABABABAB"

        // Combining methods for text processing pipeline
        String logData = "  INFO: Server started  \\n  \\n  ERROR: Connection failed  \\n  \\n  WARN: Low memory  ";
        var errors = logData.lines()
            .filter(line -> !line.isBlank())
            .map(String::strip)
            .filter(line -> line.startsWith("ERROR"))
            .collect(Collectors.toList());
        System.out.println("Errors: " + errors);
    }
}

// OUTPUT: (timings vary)
// lines(): 1200000 ns
// split(): 900000 ns
// trim: [  Hello World  ]   (Unicode spaces stay)
// strip: [Hello World]
// Errors: [ERROR: Connection failed]`
                                ]
                            }
                        ]
};
