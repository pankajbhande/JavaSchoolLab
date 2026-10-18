import { Topic } from '../coreJava';

export const optionalEnhancements: Topic = {
                        id: 'optional-11',
                        name: 'Optional Enhancements',
                        beginner: [
                            {
                                content: `<h3>Optional Enhancements in Java 11</h3>
<h4>Introduction</h4>
Java 9, 10 and 11 each extended the <strong>Optional</strong> class - Java 9 added <code>ifPresentOrElse()</code>, <code>or()</code> and <code>stream()</code>, Java 10 added the no-arg <code>orElseThrow()</code>, and Java 11 added <code>isEmpty()</code>, making it more expressive for handling values that may be absent.

<h4>New Methods</h4>
<ul>
<li><strong>isEmpty()</strong> — returns true if no value is present (the opposite of <code>isPresent()</code>); reads better in checks for absence</li>
<li><strong>ifPresentOrElse(action, emptyAction)</strong> — runs the action if a value is present, otherwise runs emptyAction; removes if-else boilerplate</li>
<li><strong>or(supplier)</strong> — returns this Optional if it has a value, otherwise an Optional made by the supplier; enables fallback chains</li>
<li><strong>stream()</strong> — converts the Optional to a Stream of 0 or 1 element; plugs into Stream pipelines</li>
</ul>`,
                                codeExamples: [
`// Optional enhancements — Basic Usage
import java.util.Optional;

public class OptionalBasic {
    public static void main(String[] args) {
        Optional<String> name = Optional.of("Java 11");
        Optional<String> empty = Optional.empty();

        // isEmpty() — opposite of isPresent()
        System.out.println(name.isEmpty());   // false
        System.out.println(empty.isEmpty());  // true

        // ifPresentOrElse() — handle both cases
        name.ifPresentOrElse(
            val -> System.out.println("Found: " + val),
            () -> System.out.println("Not found")
        );
        // Output: Found: Java 11

        empty.ifPresentOrElse(
            val -> System.out.println("Found: " + val),
            () -> System.out.println("Not found")
        );
        // Output: Not found

        // or() — return alternative Optional
        Optional<String> result = empty.or(() -> Optional.of("Default Value"));
        System.out.println(result.get()); // Default Value

        // stream() — convert to Stream
        long count = name.stream().count();
        System.out.println("Stream count: " + count); // 1
    }
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>Optional Enhancements — Intermediate Usage</h3>
<h4>Chaining Optionals with or()</h4>
The <strong>or()</strong> method enables a fallback chain of Optional values, trying each supplier in sequence until a value is found.

<h4>Integrating Optional with Streams</h4>
The <strong>stream()</strong> method allows flattening a collection of Optionals into a Stream of present values using <strong>flatMap()</strong>.

<h4>Best Practices</h4>
<ul>
<li>Use <strong>isEmpty()</strong> for guard clauses and early returns</li>
<li>Use <strong>ifPresentOrElse()</strong> instead of manual if-else blocks</li>
<li>Chain <strong>or()</strong> for cascading fallback logic</li>
<li>Use <strong>stream()</strong> with <strong>flatMap()</strong> to drop empty Optionals from collections</li>
</ul>`,
                                codeExamples: [
`// Optional intermediate patterns
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class OptionalIntermediate {
    // Simulate data sources
    static Optional<String> findInCache(String key) {
        return Optional.empty(); // cache miss
    }

    static Optional<String> findInDatabase(String key) {
        return Optional.empty(); // db miss
    }

    static Optional<String> findInRemoteService(String key) {
        return Optional.of("Remote-" + key); // found remotely
    }

    public static void main(String[] args) {
        // Chaining with or() — cascading fallback
        String result = findInCache("user1")
            .or(() -> findInDatabase("user1"))
            .or(() -> findInRemoteService("user1"))
            .orElse("Not Found");
        System.out.println(result); // Remote-user1

        // Flattening List<Optional<T>> to List<T> using stream()
        List<Optional<String>> optionals = List.of(
            Optional.of("Alpha"),
            Optional.empty(),
            Optional.of("Beta"),
            Optional.empty(),
            Optional.of("Gamma")
        );

        List<String> values = optionals.stream()
            .flatMap(Optional::stream)  // converts each Optional to 0 or 1 element stream
            .collect(Collectors.toList());
        System.out.println(values); // [Alpha, Beta, Gamma]
    }
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Optional Enhancements — Expert Deep Dive</h3>
<h4>Internal Implementation</h4>
<ul>
<li><strong>isEmpty()</strong> simply returns <code>value == null</code> internally</li>
<li><strong>or()</strong> returns <code>this</code> if a value is present, otherwise calls the supplier</li>
<li><strong>stream()</strong> returns <code>Stream.of(value)</code> or <code>Stream.empty()</code></li>
<li><strong>ifPresentOrElse()</strong> uses a simple null check to pick which action to run</li>
</ul>

<h4>Comparison: Java 8 vs Java 11 Optional</h4>
<ul>
<li><strong>Java 8:</strong> <code>isPresent()</code>, <code>ifPresent()</code>, <code>orElse()</code>, <code>orElseGet()</code>, <code>map()</code>, <code>flatMap()</code>, <code>filter()</code></li>
<li><strong>Java 9:</strong> <code>ifPresentOrElse()</code>, <code>or()</code>, <code>stream()</code></li>
<li><strong>Java 10:</strong> <code>orElseThrow()</code> (no-arg version)</li>
<li><strong>Java 11:</strong> <code>isEmpty()</code></li>
</ul>

<h4>Quick Q&amp;A</h4>
<ul>
<li><strong>orElse() vs or()?</strong> — <code>orElse()</code> returns the unwrapped value T; <code>or()</code> returns an <code>Optional&lt;T&gt;</code> for further chaining</li>
<li><strong>Is Optional serializable?</strong> — No, by design. Do not use it for fields.</li>
<li><strong>Optional as a method parameter?</strong> — No, it is designed for return types only</li>
</ul>`,
                                codeExamples: [
`// Expert Optional patterns
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;
import java.util.stream.Collectors;

public class OptionalExpert {
    // Service layer pattern with Optional chaining
    record User(String name, Optional<String> email) {}
    record Config(Optional<String> primaryDb, Optional<String> fallbackDb) {}

    public static void main(String[] args) {
        // Complex chaining with map and or
        Config config = new Config(Optional.empty(), Optional.of("jdbc:mysql://fallback"));

        String dbUrl = config.primaryDb()
            .or(config::fallbackDb)
            .map(url -> url + "?timeout=5000")
            .orElseThrow(() -> new RuntimeException("No database configured!"));
        System.out.println("DB URL: " + dbUrl);

        // Flattening nested Optionals
        List<User> users = List.of(
            new User("Anaji", Optional.of("anaji@mail.com")),
            new User("Baji", Optional.empty()),
            new User("Chimnaji", Optional.of("charlie@mail.com"))
        );

        List<String> emails = users.stream()
            .map(User::email)
            .flatMap(Optional::stream)
            .collect(Collectors.toList());
        System.out.println("Emails: " + emails);

        // Conditional processing without if-else
        Optional<String> data = Optional.of("IMPORTANT_DATA");
        data.ifPresentOrElse(
            d -> {
                System.out.println("Processing: " + d);
                System.out.println("Length: " + d.length());
            },
            () -> System.err.println("No data to process!")
        );
    }
}`
                                ]
                            }
                        ]
};
