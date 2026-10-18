import { Topic } from '../coreJava';

export const java8PlatformEnhancements: Topic = {
    id: 'java8-platform-enhancements',
    name: 'Other Java 8 Enhancements',
    intermediate: [
        {
            content: `<h3>CompletableFuture - Asynchronous Programming</h3>
Java 8 introduced CompletableFuture to write non-blocking, composable asynchronous code - a big upgrade over the plain Future interface, which had no way to chain callbacks or combine multiple async results.<br>`,
            codeExamples: [
                `import java.util.concurrent.CompletableFuture;

public class CompletableFutureDemo {
    public static void main(String[] args) throws Exception {
        CompletableFuture<String> future = CompletableFuture
            .supplyAsync(() -> "Hello")          // runs on a background thread
            .thenApply(s -> s + ", World")       // transform the result
            .thenApply(String::toUpperCase);     // chain another transform

        // join() blocks only here, at the point we actually need the result
        System.out.println(future.join());
    }
}
// OUTPUT: HELLO, WORLD`
            ]
        },
        {
            content: `<h3>Base64 Encoding and Decoding (java.util.Base64)</h3>
Before Java 8, Base64 support required third-party libraries or the internal sun.misc.BASE64Encoder. Java 8 added a standard java.util.Base64 class with Basic, URL-safe, and MIME encoders/decoders.<br>`,
            codeExamples: [
                `import java.util.Base64;
import java.nio.charset.StandardCharsets;

public class Base64Demo {
    public static void main(String[] args) {
        String original = "JavaSchoolLab";

        byte[] raw = original.getBytes(StandardCharsets.UTF_8);
        String encoded = Base64.getEncoder().encodeToString(raw);
        System.out.println("Encoded: " + encoded);

        byte[] back = Base64.getDecoder().decode(encoded);
        System.out.println("Decoded: " + new String(back, StandardCharsets.UTF_8));
    }
}
// OUTPUT:
// Encoded: SmF2YVNjaG9vbExhYg==
// Decoded: JavaSchoolLab`
            ]
        },
        {
            content: `<h3>Repeatable Annotations</h3>
Before Java 8, the same annotation could not be applied more than once to the same element. @Repeatable lets you mark an annotation as repeatable by pointing it to a "container" annotation that holds an array of it.<br>`,
            codeExamples: [
                `import java.lang.annotation.*;

public class RepeatableAnnotationDemo {

    @Retention(RetentionPolicy.RUNTIME)
    @interface Schedules { Schedule[] value(); }

    @Retention(RetentionPolicy.RUNTIME)
    @Repeatable(Schedules.class)
    @interface Schedule { String day(); }

    @Schedule(day = "Monday")
    @Schedule(day = "Wednesday")
    static class ClassSession {}

    public static void main(String[] args) {
        Schedule[] schedules = ClassSession.class.getAnnotationsByType(Schedule.class);
        for (Schedule s : schedules) {
            System.out.println("Scheduled on: " + s.day());
        }
    }
}
// OUTPUT:
// Scheduled on: Monday
// Scheduled on: Wednesday`
            ]
        },
        {
            content: `<h3>Type Annotations (JSR 308)</h3>
Before Java 8, annotations could only target declarations (a class, method, or field). Java 8 extended the @Target meta-annotation with TYPE_USE and TYPE_PARAMETER, so annotations can now appear anywhere a type is used - on generic type arguments, casts, and even implements/throws clauses - enabling stronger static analysis tools (like nullability checkers) to catch bugs at compile time.<br>`,
            codeExamples: [
                `import java.lang.annotation.*;
import java.util.*;

public class TypeAnnotationDemo {

    @Target(ElementType.TYPE_USE)
    @Retention(RetentionPolicy.RUNTIME)
    @interface NonNull {}

    // TYPE_USE lets @NonNull annotate the generic type argument itself,
    // not just the 'names' field declaration
    List<@NonNull String> names = new ArrayList<>();

    static void printLength(@NonNull String value) {
        System.out.println("Length: " + value.length());
    }

    public static void main(String[] args) {
        printLength("JavaSchoolLab");

        // Type annotation on a cast target
        Object obj = "Hello Type Annotations";
        String s = (@NonNull String) obj;
        System.out.println(s);
    }
}
// OUTPUT:
// Length: 13
// Hello Type Annotations`
            ]
        },
        {
            content: `<h3>Arrays.parallelSort() - Multicore Sorting</h3>
Arrays.parallelSort() splits large arrays into chunks, sorts each chunk on a different core using the ForkJoin pool, then merges them - faster than Arrays.sort() on big arrays on multicore machines.<br>`,
            codeExamples: [
                `import java.util.Arrays;

public class ParallelSortDemo {
    public static void main(String[] args) {
        int[] numbers = {9, 3, 7, 1, 8, 2, 6, 4, 5};

        Arrays.parallelSort(numbers);

        System.out.println(Arrays.toString(numbers));
    }
}
// OUTPUT: [1, 2, 3, 4, 5, 6, 7, 8, 9]`
            ]
        },
        {
            content: `<h3>Files.lines() - Reading a File as a Stream</h3>
java.nio.file.Files.lines() reads a file lazily, one line at a time, as a Stream&lt;String&gt; - so it can be filtered, mapped, and collected without loading the whole file into memory, and should always be used inside try-with-resources so the underlying file handle is closed.<br>`,
            codeExamples: [
                `import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

public class FilesLinesDemo {
    public static void main(String[] args) throws IOException {
        Path path = Files.createTempFile("java8-demo", ".txt");
        Files.write(path, Arrays.asList("Sheru", "", "Pankaj", "Dheeraj", ""));

        try (Stream<String> lines = Files.lines(path)) {
            List<String> nonEmpty = lines.filter(line -> !line.trim().isEmpty())
                                         .collect(Collectors.toList());
            System.out.println(nonEmpty);
        }
    }
}
// OUTPUT: [Sheru, Pankaj, Dheeraj]`
            ]
        },
        {
            content: `<h3>PermGen Removed, Replaced by Metaspace</h3>
Java 8 removed the fixed-size PermGen space (a frequent source of java.lang.OutOfMemoryError: PermGen space) and moved class metadata to Metaspace, which lives in native memory and grows automatically instead of a hard-coded limit.<br>`,
            codeExamples: [
                `// Metaspace is a JVM memory-model change, not an API - it is tuned via JVM flags:

// -XX:MetaspaceSize=64m         Size at which a GC is triggered to expand it
// -XX:MaxMetaspaceSize=256m     Hard cap on growth (unlimited by default)
// -XX:MinMetaspaceFreeRatio=40  Minimum free % to avoid shrinking after GC
// -XX:MaxMetaspaceFreeRatio=70  Maximum free % before Metaspace is shrunk

// Before Java 8 (PermGen, fixed-size, common OOM culprit):
// java -XX:PermSize=64m -XX:MaxPermSize=256m -jar app.jar

// Java 8+ (Metaspace, native memory, auto-grows unless capped):
// java -XX:MetaspaceSize=64m -XX:MaxMetaspaceSize=256m -jar app.jar`
            ]
        },
        {
            content: `<h3>Nashorn JavaScript Engine</h3>
Java 8 replaced the older, slower Rhino engine with Nashorn - a faster JavaScript engine built on invokedynamic, embedded directly in the JDK via the javax.script API. It lets Java code evaluate and call into JavaScript at runtime (Nashorn was later deprecated in Java 11 and removed in Java 15, but it shipped as a core Java 8 feature, so run this sample on Java 8 to 14).<br>`,
            codeExamples: [
                `import javax.script.*;

public class NashornEngineDemo {
    public static void main(String[] args) throws ScriptException {
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine engine = manager.getEngineByName("nashorn");

        // Evaluate a JS expression from Java
        Object result = engine.eval("2 + 3 * 4");
        System.out.println("JS result: " + result);

        // Define and call a JS function from Java
        engine.eval("function greet(name) { return 'Hello, ' + name + ' from JS!'; }");
        Invocable invocable = (Invocable) engine;
        Object greeting = invocable.invokeFunction("greet", "Pankaj");
        System.out.println(greeting);
    }
}
// OUTPUT:
// JS result: 14
// Hello, Pankaj from JS!`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>The New Date/Time API (java.time)</h3>
Java 8 replaced the mutable, thread-unsafe <code>Date</code>/<code>Calendar</code> classes with an <strong>immutable</strong>, thread-safe set of types modeled on ISO-8601: <code>LocalDate</code> (date only), <code>LocalTime</code> (time only), <code>LocalDateTime</code> (both, no time zone), <code>Period</code> (date-based amount) and <code>Duration</code> (time-based amount), plus <code>DateTimeFormatter</code> for parsing/formatting.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Old API</th><th>Java 8 Replacement</th><th>Key Difference</th></tr>
<tr class='text-center'><td>java.util.Date</td><td>LocalDate / LocalDateTime</td><td>Immutable, no timezone confusion</td></tr>
<tr class='text-center'><td>java.util.Calendar</td><td>LocalDate + Period/Duration</td><td>Clear separation of date-math vs time-math</td></tr>
<tr class='text-center'><td>SimpleDateFormat</td><td>DateTimeFormatter</td><td>Thread-safe (SimpleDateFormat is NOT)</td></tr>
</table>`,
            codeExamples: [
                `import java.time.*;
import java.time.format.DateTimeFormatter;

public class DateTimeApiDemo {
    public static void main(String[] args) {
        LocalDate date = LocalDate.of(2026, 8, 18);
        LocalTime time = LocalTime.of(10, 30);
        LocalDateTime dateTime = LocalDateTime.of(date, time);

        System.out.println("LocalDate:     " + date);
        System.out.println("LocalTime:     " + time);
        System.out.println("LocalDateTime: " + dateTime);

        LocalDate future = date.plusMonths(2).plusDays(10);
        System.out.println("Future date:   " + future);

        Period period = Period.between(date, future);
        System.out.println("Period between: " + period.getMonths()
            + " months, " + period.getDays() + " days");

        Duration duration = Duration.ofHours(5).plusMinutes(30);
        System.out.println("Duration:      " + duration);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
        System.out.println("Formatted:     " + dateTime.format(formatter));

        // Immutability proof: original date is unchanged after plusMonths()
        System.out.println("Original date unchanged: " + date);
    }
}
// OUTPUT:
// LocalDate:     2026-08-18
// LocalTime:     10:30
// LocalDateTime: 2026-08-18T10:30
// Future date:   2026-10-28
// Period between: 2 months, 10 days
// Duration:      PT5H30M
// Formatted:     18-08-2026 10:30
// Original date unchanged: 2026-08-18`
            ]
        },
        {
            content: `<h3>Interview Questions - Java 8 Features</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is target typing in lambda expressions?</td><td>The process by which the compiler infers a lambda's type from the context (variable type, method parameter, return type) it is assigned to - the target type must be a functional interface.</td></tr>
<tr><td>What is the difference between an anonymous inner class and a lambda expression?</td><td>An anonymous class creates a new .class file, can implement multiple methods and declare its own instance state, and its 'this' refers to itself. A lambda has no separate class overhead for state, can only implement a single-method functional interface, and 'this' refers to the enclosing class.</td></tr>
<tr><td>What is the difference between map() and flatMap() in Streams?</td><td>map() transforms each element into exactly one new element (possibly producing a Stream of Streams for nested structures); flatMap() transforms each element into a Stream and then flattens all those streams into a single flat stream.</td></tr>
<tr><td>Are Stream operations lazy or eager?</td><td>Intermediate operations (filter, map, sorted) are lazy - they only build a pipeline description. Nothing executes until a terminal operation (collect, forEach, reduce, count) is invoked, which then pulls elements through the whole pipeline.</td></tr>
<tr><td>Can a Stream be reused/traversed twice?</td><td>No - once a terminal operation is called, the stream is considered consumed and calling another operation on it throws IllegalStateException. A new stream must be created from the source to traverse again.</td></tr>
<tr><td>What is the difference between Predicate, Function, Consumer, and Supplier?</td><td>Predicate&lt;T&gt; takes T and returns boolean; Function&lt;T,R&gt; takes T and returns R; Consumer&lt;T&gt; takes T and returns nothing (side effect); Supplier&lt;T&gt; takes no arguments and returns T.</td></tr>
<tr><td>What are the 4 forms of method references?</td><td>Static method (Class::staticMethod), instance method of a particular object (obj::method), instance method of an arbitrary object of a type (Class::instanceMethod), and constructor reference (Class::new).</td></tr>
<tr><td>How does Java resolve the diamond problem with default methods?</td><td>A method from a class always wins over any interface default. Between interfaces, the more specific sub-interface's default wins. If two unrelated interfaces provide conflicting defaults, the implementing class must explicitly override the method (optionally calling InterfaceName.super.method()).</td></tr>
<tr><td>Why is Optional not recommended as a method parameter or class field?</td><td>It adds wrapping overhead and is not idiomatic for inputs/state (Optional is also not Serializable); it is intended mainly as a return type to signal "this method may not have a result" to callers.</td></tr>
<tr><td>Why is java.time considered better than java.util.Date/Calendar?</td><td>java.time types (LocalDate, LocalDateTime, etc.) are immutable and thread-safe, model dates/times explicitly (with/without zone), and separate date-based amounts (Period) from time-based amounts (Duration), unlike the old mutable, non-thread-safe, poorly designed Date/Calendar API.</td></tr>
</table>`
        }
    ]
};
