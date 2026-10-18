// Core Java extras, part 10: Java 11 and Java 17 features (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const java10Extras: Record<string, Extra> = {
    'var-keyword': x(
        ['<b>Type inference</b>: <code>var</code> (Java 10) lets the compiler work out the type of a local variable from its initializer, as in <code>var list = new ArrayList&lt;String&gt;();</code>.',
            '<b>Static typing</b>: the type is fixed at compile time. <code>var</code> is not a dynamic type.',
            '<b>Where it works</b>: local variables, for-loops and try-with-resources. It does not work for fields, method parameters or return types.'],
        ['<b>Initializer required</b>: <code>var x;</code> and <code>var x = null;</code> do not compile.',
            '<b>Readability rule</b>: use <code>var</code> when the right-hand side shows the type. Write the type when it adds clarity.',
            '<b>Lambda parameters</b>: Java 11 allows <code>(var a, var b) -&gt; a + b</code>. This is useful when you need annotations on the parameters.'],
        ['<b>Exact type</b>: <code>var x = new ArrayList&lt;String&gt;()</code> is an <code>ArrayList</code>, not a <code>List</code>. Declare the interface type if you want it.',
            '<b>Anonymous types</b>: with <code>var</code> you can call the extra methods of an anonymous class object.',
            '<b>Naming</b>: keep names descriptive, because with <code>var</code> the name carries the meaning.'],
        [['F', 'What does var do?', 'It makes the compiler infer a local variable type from the initializer.'],
            ['F', 'Is var dynamic typing?', 'No, the type is fixed at compile time.'],
            ['M', 'Where can var not be used?', 'Fields, method parameters, return types, and without an initializer.'],
            ['M', 'What type does var x = new ArrayList&lt;String&gt;() have?', 'ArrayList&lt;String&gt;, not List&lt;String&gt;.'],
            ['S', 'When does var hurt readability?', 'When the right-hand side does not reveal the type, such as var result = service.process().'],
            ['S', 'What does var in lambda parameters allow?', 'Adding annotations (like @NonNull) to inferred lambda parameters.']],
        [['Use var for obvious types, loops and resources.',
            r`var names = new ArrayList<String>();
names.add("Abaji");
var counts = new HashMap<String, List<Integer>>();
counts.computeIfAbsent("a", k -> new ArrayList<>()).add(1);
for (var e : counts.entrySet()) System.out.println(e.getKey() + "=" + e.getValue());
try (var in = new java.io.StringReader("x")) { System.out.println((char) in.read()); }

// OUTPUT:
// a=[1]
// x`],
            ['var keeps the exact type, not the interface.',
                r`var list = new ArrayList<Integer>();
list.ensureCapacity(100);                      // ArrayList method is available
List<Integer> asList = new ArrayList<>();
// asList.ensureCapacity(100);                 // error: List has no such method
var anon = new Object() { int hidden = 7; };
System.out.println(anon.hidden);

// OUTPUT:
// 7`]],
        [['Declarations that do not compile.',
            r`// var x;                    // error: cannot infer type for local variable x
// var y = null;             // error: variable initializer is 'null'
// var z = {1, 2};           // error: array initializer needs an explicit type
var arr = new int[]{1, 2};
System.out.println(arr.length);

// OUTPUT:
// 2`],
            ['When var hurts readability.',
                r`var user = repo.findById(7);          // what is it? Optional<User>? User? unclear
Optional<User> clear = repo.findById(7);

// OUTPUT:
// prefer the explicit type when the call does not reveal it`]]
    ),

    'string-methods-11': x(
        ['<b>Six new methods</b>: <code>isBlank()</code>, <code>strip()</code>, <code>stripLeading()</code>, <code>stripTrailing()</code>, <code>repeat(n)</code> and <code>lines()</code>.',
            '<b>Blank check</b>: <code>isBlank()</code> is true for an empty string or one with only whitespace.',
            '<b>strip vs trim</b>: <code>strip()</code> removes Unicode whitespace, while <code>trim()</code> removes only characters up to the space (U+0020).'],
        ['<b>Line stream</b>: <code>lines()</code> returns a <code>Stream&lt;String&gt;</code> and splits on any line terminator.',
            '<b>Repeat</b>: <code>repeat(3)</code> builds repeated text, for example <code>"-".repeat(20)</code>.',
            '<b>Later additions</b>: <code>indent</code> and <code>transform</code> came in Java 12; <code>formatted</code>, <code>stripIndent</code> and <code>translateEscapes</code> in Java 15.'],
        ['<b>Input checks</b>: prefer <code>strip</code> and <code>isBlank</code> over <code>trim</code> and <code>isEmpty</code>. Note that a non-breaking space (U+00A0) is not whitespace for either <code>strip</code> or <code>trim</code>.',
            '<b>Lazy lines</b>: <code>lines()</code> is lazy and memory friendly for large text compared with <code>split("\\n")</code>.',
            '<b>Bad count</b>: <code>repeat</code> with a negative count throws <code>IllegalArgumentException</code>.'],
        [['F', 'What does isBlank do?', 'Returns true if the string is empty or contains only whitespace.'],
            ['F', 'What does repeat do?', 'Returns the string repeated n times.'],
            ['M', 'strip() vs trim()?', 'strip removes all Unicode whitespace; trim removes only characters at or below U+0020.'],
            ['M', 'isBlank vs isEmpty?', 'isEmpty checks length zero; isBlank also treats whitespace-only text as blank.'],
            ['S', 'Why use lines() over split?', 'It handles all line terminators and returns a lazy stream without creating a regex split array.'],
            ['S', 'What happens with repeat(-1)?', 'IllegalArgumentException.']],
        [['The new methods.',
            r`String s = "\u2003 hello \u2003";
System.out.println(s.trim().length() + " " + s.strip().length());
System.out.println("  ".isBlank() + " " + "".isEmpty() + " " + "  ".isEmpty());
System.out.println("ab".repeat(3) + " " + "=".repeat(10));
System.out.println("one\ntwo\r\nthree".lines().map(String::toUpperCase).toList());
System.out.println("[" + "  x ".stripLeading() + "][" + "  x ".stripTrailing() + "]");

// OUTPUT:
// 9 5
// true true false
// ababab ==========
// [ONE, TWO, THREE]
// [x ][  x]`],
            ['Input validation.',
                r`static boolean valid(String name) {
    return name != null && !name.isBlank() && name.strip().length() <= 20;
}
System.out.println(valid(" Abaji ") + " " + valid("   ") + " " + valid(null));

// OUTPUT:
// true false false`]],
        [['trim vs strip with Unicode space.',
            r`String em = "\u2003text\u2003";   // em space is Unicode whitespace
System.out.println(em.trim().length() + " " + em.strip().length());

// OUTPUT:
// 6 4`],
            ['Count lines.',
                r`String text = "a\n\nb\n";
System.out.println(text.lines().count() + " " + text.split("\n").length);

// OUTPUT:
// 3 3`]]
    ),

    'http-client': x(
        ['<b>Standard client</b>: Java 11 added <code>java.net.http.HttpClient</code> with <code>HttpRequest</code> and <code>HttpResponse</code>.',
            '<b>Sync and async</b>: it supports HTTP/1.1 and HTTP/2. Use <code>send</code> to wait, or <code>sendAsync</code> to get a <code>CompletableFuture</code>.',
            '<b>Replaces</b> the old <code>HttpURLConnection</code>.'],
        ['<b>Reuse the client</b>: build it once, for example <code>HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build()</code>.',
            '<b>Build requests</b> with <code>HttpRequest.newBuilder(URI.create(url)).header(...).POST(BodyPublishers.ofString(json)).build()</code>.',
            '<b>Body handlers</b> pick the response type: <code>BodyHandlers.ofString()</code>, <code>ofFile</code>, <code>ofLines</code>, <code>ofInputStream</code>.'],
        ['<b>Timeouts and status</b>: set connect and per-request timeouts, and check <code>statusCode()</code>. A 404 or 500 is not an exception.',
            '<b>Executor and redirects</b>: the client has its own executor, so configure it for async load. Use <code>followRedirects(Redirect.NORMAL)</code> to follow redirects.',
            '<b>Resilience</b>: for retries, backoff and circuit breaking use a library (Resilience4j) or a small wrapper. Send authentication headers securely.'],
        [['F', 'What is the Java 11 HTTP Client?', 'A modern built-in client for HTTP/1.1 and HTTP/2 in java.net.http.'],
            ['F', 'How do you send a request?', 'Build an HttpRequest and call client.send(request, BodyHandlers.ofString()).'],
            ['M', 'How do you make asynchronous calls?', 'client.sendAsync returns a CompletableFuture&lt;HttpResponse&lt;T&gt;&gt;.'],
            ['M', 'Does a 404 throw an exception?', 'No, you must check response.statusCode().'],
            ['S', 'Why reuse one HttpClient instance?', 'It manages connection pooling and threads; creating one per request wastes resources.'],
            ['S', 'How do you add resilience?', 'Timeouts, retries with backoff for idempotent requests, circuit breakers and limited concurrency.']],
        [['GET and POST.',
            r`HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(5))
    .followRedirects(HttpClient.Redirect.NORMAL)
    .build();
HttpRequest get = HttpRequest.newBuilder(URI.create("https://api.example.com/users/1"))
    .header("Accept", "application/json")
    .timeout(Duration.ofSeconds(10))
    .GET().build();
HttpResponse<String> res = client.send(get, HttpResponse.BodyHandlers.ofString());
System.out.println(res.statusCode() + " "
    + res.headers().firstValue("content-type").orElse("?"));
HttpRequest post = HttpRequest.newBuilder(URI.create("https://api.example.com/users"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString("{\"name\":\"Abaji\"}"))
    .build();

// OUTPUT: (example)
// 200 application/json`],
            ['Async calls in parallel.',
                r`List<String> urls = List.of("https://a.example/1", "https://a.example/2");
List<CompletableFuture<String>> fs = urls.stream()
    .map(u -> client.sendAsync(HttpRequest.newBuilder(URI.create(u)).build(),
            HttpResponse.BodyHandlers.ofString())
        .thenApply(HttpResponse::body))
    .toList();
fs.forEach(f -> System.out.println(f.join().length()));

// OUTPUT: (varies)
// 1250
// 980`]],
        [['Status is not an exception.',
            r`HttpRequest req = HttpRequest.newBuilder(
    URI.create("https://api.example.com/missing")).build();
HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
if (res.statusCode() >= 400)
    throw new IllegalStateException("HTTP " + res.statusCode() + ": " + res.body());

// OUTPUT:
// IllegalStateException: HTTP 404 ...`],
            ['Download to a file.',
                r`HttpRequest req = HttpRequest.newBuilder(
    URI.create("https://example.com/report.pdf")).build();
client.send(req, HttpResponse.BodyHandlers.ofFile(Path.of("report.pdf")));

// OUTPUT:
// report.pdf saved without loading it all in memory`]]
    ),

    'optional-11': x(
        ['<b>Java 11</b> added <code>Optional.isEmpty()</code>, the opposite of <code>isPresent()</code>.',
            '<b>Java 10</b> added <code>orElseThrow()</code> with no arguments (throws <code>NoSuchElementException</code>), a clearer alternative to <code>get()</code>.',
            '<b>Java 9</b> added <code>ifPresentOrElse</code>, <code>or</code> and <code>stream</code>.'],
        ['<b>Readability:</b> <code>opt.isEmpty()</code> reads better than <code>!opt.isPresent()</code>.',
            '<b>Lazy fallback:</b> <code>opt.or(() -&gt; other)</code> calls the supplier only when the Optional is empty.',
            '<b>Streams:</b> <code>opt.stream()</code> gives a 0 or 1 element stream (handy with <code>flatMap</code>).'],
        ['<b>Absence is a bug:</b> use <code>orElseThrow()</code>; for domain errors pass a supplier, <code>orElseThrow(() -&gt; new X(...))</code>.',
            '<b>Filtering empties:</b> use <code>Predicate.not(Optional::isEmpty)</code> in streams.',
            '<b>Scope:</b> Optional is a return type tool, not a field type.'],
        [['F', 'What does Optional.isEmpty do?', 'Returns true when no value is present.'],
            ['F', 'What does orElseThrow() without arguments do?', 'Returns the value or throws NoSuchElementException.'],
            ['M', 'How do you provide a fallback Optional?', 'opt.or(() -> Optional.of(default)).'],
            ['M', 'How do you turn an Optional into a stream?', 'opt.stream(), giving zero or one element.'],
            ['S', 'Why prefer orElseThrow() to get()?', 'The name states the intent that absence is an error, avoiding silent misuse of get().'],
            ['S', 'How do you flatten a list of Optionals?', 'list.stream().flatMap(Optional::stream).toList().']],
        [['The convenience methods.',
            r`Optional<String> a = Optional.empty(), b = Optional.of("x");
System.out.println(a.isEmpty() + " " + b.isEmpty() + " "
    + a.or(() -> Optional.of("alt")).get() + " " + b.orElseThrow());
List<Optional<Integer>> l = List.of(Optional.of(1), Optional.empty(), Optional.of(3));
System.out.println(l.stream().flatMap(Optional::stream)
    .mapToInt(Integer::intValue).sum());
b.ifPresentOrElse(v -> System.out.println("got " + v),
    () -> System.out.println("none"));

// OUTPUT:
// true false alt x
// 4
// got x`],
            ['Domain exception.',
                r`static Order find(long id) {
    return repo.findById(id)
        .orElseThrow(() -> new OrderNotFoundException(id));
}

// OUTPUT:
// OrderNotFoundException for unknown ids`]],
        [['Fallback chain.',
            r`Optional<String> fromCache = Optional.empty(), fromDb = Optional.of("db-value");
String value = fromCache.or(() -> fromDb).orElse("default");
System.out.println(value);

// OUTPUT:
// db-value`],
            ['Empty orElseThrow.',
                r`try {
    Optional.empty().orElseThrow();
} catch (NoSuchElementException e) {
    System.out.println(e.getMessage());
}

// OUTPUT:
// No value present`]]
    ),

    'files-11': x(
        ['<b>Simple text files</b>: Java 11 added <code>Files.readString(path)</code> and <code>Files.writeString(path, text)</code>.',
            '<b>Path.of</b>: <code>Path.of("a.txt")</code> creates a path (replaces <code>Paths.get</code>).',
            '<b>Defaults</b>: both use UTF-8 and throw <code>IOException</code>.'],
        ['<b>Open options</b>: <code>writeString</code> accepts <code>StandardOpenOption.APPEND</code>, <code>CREATE</code>, <code>TRUNCATE_EXISTING</code>.',
            '<b>Large files</b>: use <code>Files.lines(path)</code>, which streams lazily (close it).',
            '<b>Compare</b>: <code>Files.mismatch(a, b)</code> (added in Java 12) returns the first differing position (-1 if equal).'],
        ['<b>Memory</b>: <code>readString</code> holds the whole file in memory, so avoid it for very large files.',
            '<b>Atomic write</b>: write a temp file, then <code>Files.move</code> with <code>ATOMIC_MOVE</code>.',
            '<b>Close streams</b>: use try-with-resources for <code>Files.lines</code>, <code>Files.list</code>, <code>Files.walk</code>.'],
        [['F', 'How do you read a whole text file in Java 11?', 'Files.readString(Path.of("file.txt")).'],
            ['F', 'How do you write text to a file?', 'Files.writeString(path, text).'],
            ['M', 'How do you append to a file?', 'Files.writeString(path, text, StandardOpenOption.CREATE, StandardOpenOption.APPEND).'],
            ['M', 'What charset do these methods use?', 'UTF-8 by default.'],
            ['S', 'Why not use readString for big files?', 'It loads everything into memory; stream with Files.lines or a buffered reader.'],
            ['S', 'How do you write a file atomically?', 'Write to a temporary file in the same directory, then Files.move with ATOMIC_MOVE and REPLACE_EXISTING.']],
        [['Read, write, append.',
            r`Path p = Path.of("notes.txt");
Files.writeString(p, "line1\n");
Files.writeString(p, "line2\n", StandardOpenOption.APPEND);
String all = Files.readString(p);
System.out.println(all.lines().count() + " " + all.strip());
try (Stream<String> lines = Files.lines(p)) {
    System.out.println(lines.filter(l -> l.endsWith("2")).findFirst().orElse("?"));
}

// OUTPUT:
// 2 line1
// line2
// line2`],
            ['Compare files and atomic write.',
                r`Path a = Path.of("a.txt"), b = Path.of("b.txt");
Files.writeString(a, "same");
Files.writeString(b, "same");
System.out.println(Files.mismatch(a, b));   // needs Java 12 or later
Path tmp = Files.createTempFile(a.toAbsolutePath().getParent(), "cfg", ".tmp");
Files.writeString(tmp, "new content");
Files.move(tmp, a, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);

// OUTPUT:
// -1`]],
        [['Missing file.',
            r`try {
    Files.readString(Path.of("nope.txt"));
} catch (NoSuchFileException e) {
    System.out.println("missing " + e.getMessage());
}

// OUTPUT:
// missing nope.txt`],
            ['Charset.',
                r`Files.writeString(Path.of("hi.txt"), "नमस्ते", StandardCharsets.UTF_8);
System.out.println(Files.readString(Path.of("hi.txt"), StandardCharsets.UTF_8));

// OUTPUT:
// नमस्ते`]]
    ),

    'sealed-classes': x(
        ['<b>Sealed type</b>: a class or interface that limits who may extend or implement it, for example <code>sealed interface Shape permits Circle, Square {}</code> (Java 17).',
            '<b>Subclass modifier</b>: each permitted subclass must be <code>final</code>, <code>sealed</code> or <code>non-sealed</code>.',
            '<b>Location</b>: permitted classes sit in the same module, or in the same package when there is no named module.'],
        ['<b>Exhaustive switch</b>: sealed types give a closed set of subtypes, so a <code>switch</code> over them needs no <code>default</code> (pattern matching for switch is final in Java 21).',
            '<b>Algebraic data types</b>: records plus sealed interfaces model "one of several shapes of data".',
            '<b>Omitting permits</b>: if the permitted subclasses are in the same source file, <code>permits</code> may be left out.'],
        ['<b>Domain modelling</b>: use sealed hierarchies for states and results (Success/Failure, payment methods), interpreters and ASTs.',
            '<b>Safe change</b>: adding a permitted subtype breaks every incomplete exhaustive <code>switch</code>, so you find all places to update.',
            '<b>Design choice</b>: prefer sealed types over open inheritance when you control all variants; use <code>non-sealed</code> to reopen part of the hierarchy.'],
        [['F', 'What is a sealed class?', 'A class or interface that limits which other classes can extend or implement it.'],
            ['F', 'Which modifiers must permitted subclasses have?', 'final, sealed or non-sealed.'],
            ['M', 'Why are sealed types useful with switch?', 'The compiler knows all subtypes, so a switch can be exhaustive without a default branch.'],
            ['M', 'What does non-sealed mean?', 'The subclass opens its own part of the hierarchy for unrestricted extension.'],
            ['S', 'When should you prefer sealed over an open hierarchy?', 'When the set of variants is fixed and known, like states or result types, so the compiler can check completeness.'],
            ['S', 'How do sealed types help with maintenance?', 'Adding a variant makes every incomplete switch fail to compile, revealing all affected code.']],
        [['Sealed hierarchy with exhaustive switch.',
            r`sealed interface Payment permits Card, Upi, Cash {}
record Card(String last4) implements Payment {}
record Upi(String vpa) implements Payment {}
enum Cash implements Payment { INSTANCE }
static String describe(Payment p) {
    return switch (p) {
        case Card c -> "card ****" + c.last4();
        case Upi u -> "upi " + u.vpa();
        case Cash c -> "cash";
    };
}
System.out.println(describe(new Card("4242")) + " | "
    + describe(new Upi("a@bank")) + " | " + describe(Cash.INSTANCE));

// OUTPUT:
// card ****4242 | upi a@bank | cash`],
            ['Result type.',
                r`sealed interface Result<T> permits Ok, Err {}
record Ok<T>(T value) implements Result<T> {}
record Err<T>(String message) implements Result<T> {}
static Result<Integer> parse(String s) {
    try {
        return new Ok<>(Integer.parseInt(s));
    } catch (NumberFormatException e) {
        return new Err<>("bad: " + s);
    }
}
for (String s : List.of("7", "x")) {
    System.out.println(switch (parse(s)) {
        case Ok<Integer> ok -> "ok " + ok.value();
        case Err<Integer> er -> er.message();
    });
}

// OUTPUT:
// ok 7
// bad: x`]],
        [['Unpermitted subclass.',
            r`sealed interface Shape permits Circle {}
record Circle() implements Shape {}
// record Hexagon() implements Shape {}     // error: class is not allowed to extend sealed class: Shape

// OUTPUT:
// compile-time error`],
            ['Reopen with non-sealed.',
                r`sealed abstract class Vehicle permits Car, Plugin {}
final class Car extends Vehicle {}
non-sealed class Plugin extends Vehicle {}
class MyPlugin extends Plugin {}               // allowed because Plugin is non-sealed

// OUTPUT:
// MyPlugin compiles`]]
    ),

    'pattern-matching': x(
        ['<b>Pattern matching</b> for <code>instanceof</code> (Java 16) tests the type and binds a variable in one step: <code>if (obj instanceof String s) { s.length(); }</code>.',
            'It removes the <b>explicit cast</b> after the check.',
            'The <b>binding variable</b> is in scope only where the test is definitely true.'],
        ['<b>Extra conditions</b>: <code>if (o instanceof String s &amp;&amp; s.length() &gt; 3)</code>.',
            '<b>Negation</b> with an early exit: <code>if (!(o instanceof String s)) return; s.length();</code> (<b>flow scoping</b>).',
            '<b>equals</b>: <code>return o instanceof Point p &amp;&amp; x == p.x;</code> is short and null-safe.'],
        ['<b>Foundation</b>: switch patterns and record patterns (Java 21) build on it.',
            '<b>Design</b>: prefer polymorphism when you control the types; use patterns for sealed data and for types you cannot modify.',
            '<b>Generics</b>: a pattern such as <code>List&lt;String&gt; l</code> compiles only when the cast is safe, for example from <code>Collection&lt;String&gt;</code>; from <code>Object</code> use <code>List&lt;?&gt;</code>.'],
        [['F', 'What is pattern matching for instanceof?', 'A test that checks a type and declares a typed variable in one expression.'],
            ['F', 'What problem does it solve?', 'It removes the redundant cast after an instanceof check.'],
            ['M', 'Where is the pattern variable in scope?', 'Where the compiler can prove the match succeeded, such as the true branch or after a negated early return.'],
            ['M', 'Can you combine it with &&?', 'Yes, the binding is available on the right side of &&.'],
            ['S', 'How does it simplify equals?', 'return o instanceof Point p && x == p.x && y == p.y; with no explicit cast.'],
            ['S', 'Pattern matching vs polymorphism?', 'Use polymorphism for behavior you own; use patterns for closed data types or foreign types.']],
        [['Binding and guards.',
            r`static String info(Object o) {
    if (o instanceof String s && !s.isBlank()) return "string of " + s.length();
    if (o instanceof Integer i && i > 10) return "big int " + i;
    if (!(o instanceof List<?> l)) return "other";
    return "list of " + l.size();
}
System.out.println(info("hello") + ", " + info(42) + ", " + info(List.of(1, 2)) + ", " + info(3.5));

// OUTPUT:
// string of 5, big int 42, list of 2, other`],
            ['equals with patterns.',
                r`final class Point {
    final int x, y;
    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
    @Override public boolean equals(Object o) {
        return o instanceof Point p && x == p.x && y == p.y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
}
System.out.println(new Point(1, 2).equals(new Point(1, 2)) + " " + new Point(1, 2).equals("x"));

// OUTPUT:
// true false`]],
        [['Scope.',
            r`Object o = "text";
if (o instanceof String s) { System.out.println(s.length()); }
// System.out.println(s);        // error: cannot find symbol (s is not in scope here)
if (!(o instanceof String t)) { return; }
System.out.println(t.toUpperCase());       // t is in scope after the early return

// OUTPUT:
// 4
// TEXT`],
            ['Always-true pattern warning.',
                r`String str = "x";
// if (str instanceof String s) {}   // Java 21+ allows it; Java 16-20: compile error
//                                   // (the type is always a subtype of the pattern type)

// OUTPUT:
// (nothing printed; the check is commented out)`]]
    ),

    'records': x(
        ['A <b>record</b> is a concise immutable data carrier: <code>record Point(int x, int y) {}</code> (final in Java 16).',
            'The compiler generates the <b>constructor</b>, <b>accessors</b> (<code>x()</code>, <code>y()</code>), <code>equals</code>, <code>hashCode</code> and <code>toString</code>.',
            'Record <b>fields</b> are <code>private final</code>; the class is implicitly <code>final</code> and extends <code>java.lang.Record</code>.'],
        ['Add validation in a <b>compact constructor</b>: <code>Point { if (x &lt; 0) throw ...; }</code>.',
            '<b>Allowed</b>: extra methods, static members and interfaces. <b>Not allowed</b>: instance fields and <code>extends</code>.',
            '<b>Shallow immutability</b>: if a component is a mutable list, copy it with <code>List.copyOf</code>.'],
        ['<b>Use for</b> DTOs, value objects, map keys, tuples and results. <b>Avoid for</b> JPA entities (they need a no-arg constructor and mutability).',
            '<b>Frameworks</b>: Jackson (2.12+), Spring and others support records.',
            '<b>Local records</b> are handy for intermediate stream results.'],
        [['F', 'What is a record?', 'A compact immutable data class whose accessors, equals, hashCode and toString are generated.'],
            ['F', 'Can a record extend a class?', 'No, it implicitly extends Record; it can implement interfaces.'],
            ['M', 'What is a compact constructor?', 'A constructor without a parameter list used to validate or normalize components before fields are assigned.'],
            ['M', 'Are records fully immutable?', 'Only shallowly: mutable components such as lists can still change unless copied.'],
            ['S', 'When not to use records?', 'For JPA entities, classes needing mutable state or inheritance.'],
            ['S', 'How do records help with equality?', 'equals and hashCode are generated from all components, giving value semantics.']],
        [['Record with validation and method.',
            r`record Range(int lo, int hi) {
    Range {
        if (lo > hi) throw new IllegalArgumentException(lo + " > " + hi);
    }
    int length() { return hi - lo; }
    static Range of(int a, int b) {
        return new Range(Math.min(a, b), Math.max(a, b));
    }
}
Range r = Range.of(9, 3);
System.out.println(r + " " + r.length() + " "
    + r.equals(new Range(3, 9)) + " " + r.lo());

// OUTPUT:
// Range[lo=3, hi=9] 6 true 3`],
            ['Defensive copy.',
                r`record Team(String name, List<String> members) {
    Team { members = List.copyOf(members); }
}
List<String> src = new ArrayList<>(List.of("a"));
Team t = new Team("x", src);
src.add("b");
System.out.println(t.members());
record Pair<A, B>(A first, B second) {}
System.out.println(new Pair<>("k", 1));

// OUTPUT:
// [a]
// Pair[first=k, second=1]`]],
        [['Cannot add instance fields.',
            r`// record P(int x) { int extra; }   // error: must be static
record P(int x) { static int count; }
System.out.println(new P(1).x());

// OUTPUT:
// 1`],
            ['Local record in a stream.',
                r`record WordLen(String w, int n) {}
System.out.println(Stream.of("aa", "b", "cccc")
    .map(w -> new WordLen(w, w.length()))
    .sorted(Comparator.comparingInt(WordLen::n).reversed())
    .findFirst().get());

// OUTPUT:
// WordLen[w=cccc, n=4]`]]
    ),

    'switch-expressions': x(
        ['<b>Switch expression</b> (Java 14): produces a value, e.g. <code>String s = switch (day) { case 1, 7 -&gt; "weekend"; default -&gt; "weekday"; };</code>.',
            '<b>Arrow form</b> (<code>-&gt;</code>): no fall-through and no <code>break</code> needed.',
            '<b>Multiple labels</b> per case: <code>case 1, 2, 3 -&gt;</code>.'],
        ['<b>yield</b>: returns a value from a block, e.g. <code>case 5 -&gt; { log(); yield "five"; }</code>.',
            '<b>Exhaustive</b>: cover all values, or add <code>default</code> (enums and sealed types can skip it when every constant or subtype is covered).',
            '<b>Colon syntax</b> (<code>case X:</code>) can also be an expression, but it needs <code>yield</code> and it still falls through.'],
        ['<b>Safer code</b>: no missing-<code>break</code> bugs and no unassigned variables.',
            '<b>Enums</b>: skip <code>default</code> so adding a constant gives a compile error where it is not handled.',
            '<b>Impossible cases</b>: throw in the branch, e.g. <code>default -&gt; throw new IllegalStateException();</code>.'],
        [['F', 'What is a switch expression?', 'A switch that returns a value, using arrows or yield.'],
            ['F', 'Does the arrow form fall through?', 'No.'],
            ['M', 'What does yield do?', 'It returns a value from a switch expression block.'],
            ['M', 'Must a switch expression be exhaustive?', 'Yes; use default or cover all enum or sealed subtypes.'],
            ['S', 'How does an enum switch help maintenance?', 'Without default, adding an enum constant breaks compilation where it is not handled.'],
            ['S', 'Why are arrow switches safer than colon switches?', 'They remove accidental fall-through and always produce a result.']],
        [['Value-producing switch.',
            r`enum Day { MON, TUE, SAT, SUN }
static String kind(Day d) {
    return switch (d) { case SAT, SUN -> "weekend"; case MON, TUE -> "weekday"; };
}
static int length(String s) {
    return switch (s) {
        case "one" -> 1;
        case "two" -> 2;
        default -> { System.out.println("unknown " + s); yield -1; }
    };
}
System.out.println(kind(Day.SAT) + " " + kind(Day.MON) + " " + length("two") + " " + length("zzz"));

// OUTPUT:
// unknown zzz
// weekend weekday 2 -1`],
            ['Throwing for impossible cases.',
                r`static double discount(String tier) {
    return switch (tier) {
        case "GOLD" -> 0.2;
        case "SILVER" -> 0.1;
        case "BASIC" -> 0;
        default -> throw new IllegalArgumentException("unknown tier " + tier);
    };
}
System.out.println(discount("GOLD"));
try { discount("X"); } catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }

// OUTPUT:
// 0.2
// unknown tier X`]],
        [['Not exhaustive.',
            r`int n = 3;
String s = switch (n) { case 1 -> "one"; };
// error: the switch expression does not cover all possible input values

// OUTPUT:
// compile-time error`],
            ['Old style with yield.',
                r`int code = 2;
String name = switch (code) {
    case 1: yield "one";
    case 2: yield "two";
    default: yield "many";
};
System.out.println(name);

// OUTPUT:
// two`]]
    ),

    'text-blocks': x(
        ['<b>Text block</b>: a multi-line string literal between triple quotes, <code>"""</code> ... <code>"""</code> (final in Java 15).',
            '<b>No escapes needed</b>: no <code>\\n</code> and no escaped quotes, so JSON, SQL and HTML look as they are.',
            '<b>Opening delimiter</b>: the opening <code>"""</code> must be followed by a newline.'],
        ['<b>Incidental indentation</b> is stripped, based on the least indented line and the closing delimiter position.',
            '<b>Escapes</b>: <code>\\n</code> and <code>\\"""</code> work; a trailing backslash joins lines; <code>\\s</code> keeps a trailing space.',
            '<b>Values</b>: use <code>.formatted(args)</code> to insert them.'],
        ['<b>Good uses</b>: embedded SQL, JSON, HTML, XML and regex-like text. For SQL values, use prepared statements, not <code>formatted</code>.',
            '<b>Line endings</b> are normalized to <code>\\n</code>.',
            '<b>Same processing</b> is exposed for regular strings by <code>stripIndent()</code> and <code>translateEscapes()</code>.'],
        [['F', 'What is a text block?', 'A multi-line string literal delimited by triple double quotes.'],
            ['F', 'Why use it?', 'To write multi-line text like JSON or SQL without escapes and concatenation.'],
            ['M', 'How is indentation handled?', 'The common leading whitespace is removed, using the closing delimiter position as one candidate.'],
            ['M', 'How do you insert values?', 'Call formatted(...) or String.format on the text block.'],
            ['S', 'Why not build SQL with formatted values?', 'It allows SQL injection; use PreparedStatement parameters even with text blocks.'],
            ['S', 'How do you keep a trailing space or avoid a newline?', 'Use \\s for a space and a trailing backslash to continue the line.']],
        [['JSON and SQL.',
            r`String json = """
    {
      "name": "%s",
      "age": %d
    }
    """.formatted("Abaji", 30);
String sql = """
    SELECT id, name
      FROM users
     WHERE active = ?
     ORDER BY name
    """;
System.out.print(json);
System.out.println(sql.lines().count());

// OUTPUT:
// {
//   "name": "Abaji",
//   "age": 30
// }
// 4`],
            ['Escapes and joining.',
                r`String s = """
    He said "hi" \
    and left\s\
    ok""";
System.out.println(s + "|" + s.length());

// OUTPUT:
// He said "hi" and left ok|24`]],
        [['Closing delimiter controls indentation.',
            r`String a = """
        indented
    """;          // closing delimiter is less indented: keeps 4 spaces
String b = """
        indented""";    // no trailing newline, no extra indent
System.out.println("[" + a + "]" + "[" + b + "]");

// OUTPUT:
// [    indented
// ][indented]`],
            ['SQL injection warning.',
                r`String bad = """
    SELECT * FROM users WHERE name = '%s'
    """.formatted(userInput);           // injectable
// use: connection.prepareStatement("SELECT * FROM users WHERE name = ?") and setString

// OUTPUT:
// always bind parameters`]]
    )
};

export const java10Deep: Record<string, Deep> = {
    'var-keyword': dv(
        [`<code>var</code> is a reserved type name, not a keyword. The compiler replaces it with the type inferred from the initializer. That type can even be one you cannot write by hand, such as an anonymous class or an intersection type. The bytecode is identical to writing the type yourself. Inference looks at the right-hand side only, so a bare diamond like <code>new ArrayList&lt;&gt;()</code> infers <code>ArrayList&lt;Object&gt;</code>.`,
            r`var list = new ArrayList<>();                 // ArrayList<Object>
list.add("text");
var map = new HashMap<String, List<Integer>>();
var stream = Stream.of(1, "a");  // intersection type of Integer and String
var anon = new Object() {
    String hello() { return "hi"; }
};
System.out.println(list.getClass().getSimpleName() + " " + anon.hello());
var x = 1;
var y = 1L;
var z = 1.0f;
var c = 'c';
Object[] boxed = {x, y, z, c};
for (var o : boxed) System.out.print(o.getClass().getSimpleName() + " ");

// OUTPUT:
// ArrayList hi
// Integer Long Float Character`],
        [`OpenJDK style guideline: use <code>var</code> when the initializer makes the type clear, such as a constructor call, a cast or a factory method like <code>of</code>. Avoid it when a method call hides the type. Avoid it for literals when the exact primitive matters, because <code>var b = 1</code> is an <code>int</code>, not a <code>byte</code>.`,
            r`var customers = repo.findAllByRegion(region);   // unclear: List? Page? Stream?
List<Customer> clear = repo.findAllByRegion(region);  // clearer
var total = new BigDecimal("10.50");           // obvious
var buf = new byte[1024];
BiFunction<Integer, Integer, Integer> add = (@NonNull var a, @NonNull var b) -> a + b;

// OUTPUT:
// (no console output: the first line hides its type, the others show it)`],
        [`Two common mistakes are shown below. First, a variable keeps its inferred type, so you cannot assign a different type later. Second, <code>var</code> gives <code>ArrayList</code>, not <code>List</code>, so you cannot swap the implementation. Also remember: a ternary can infer a surprising type, and <code>var</code> is not allowed for fields. Declare the interface type when later code depends on it.`,
            r`var sum = 0;
// sum = 1.5;       // error: possible lossy conversion from double to int
var result = true ? 1 : "a";  // inferred: Serializable & Comparable<...>
var items = new ArrayList<String>();
// items = new LinkedList<String>();  // error: LinkedList is not an ArrayList
List<String> flexible = new ArrayList<>();
flexible = new LinkedList<>();

// OUTPUT:
// (no console output: declare List<String> if you want to swap implementations)`],
        [`There is no run-time or performance difference, because <code>var</code> only affects the source. It cuts noise from long generic types. If it hides a type, turn on your IDE type hints.`,
            r`Map<String, Map<LocalDate, List<TransactionSummary>>> verbose =
    new HashMap<String, Map<LocalDate, List<TransactionSummary>>>();
var concise =
    new HashMap<String, Map<LocalDate, List<TransactionSummary>>>();

// OUTPUT:
// (no console output: both lines compile to the same bytecode)`],
        [`Typical uses are loops over map entries and try-with-resources. Many teams adopt one rule: use <code>var</code> when the type is obvious from the right side.`,
            r`for (var entry : stockByWarehouse.entrySet()) {
    var warehouse = entry.getKey();
    var items = entry.getValue();
    for (var item : items) {
        System.out.println(warehouse + ": " + item.sku());
    }
}
try (var conn = dataSource.getConnection();
     var ps = conn.prepareStatement(SQL)) {
    // use ps here
}

// OUTPUT:
// (illustrative: prints one line per item, for example  North: A-100)`]
    ),

    'string-methods-11': dv(
        [`<code>String.isBlank</code> uses <code>Character.isWhitespace</code> across the string; <code>strip</code> uses <code>Character.isWhitespace</code> (Unicode aware), whereas <code>trim</code> removes any code point <code>&lt;= U+0020</code>. <code>repeat</code> allocates the final array once and uses <code>System.arraycopy</code> doubling. <code>lines()</code> returns a lazy <code>Stream</code> backed by a spliterator scanning for <code>\\n</code>, <code>\\r</code> and <code>\\r\\n</code>. Compact strings (Latin-1 vs UTF-16) keep these operations cheap.`,
            r`String s = "\u2009ok\u2009\n";
System.out.println(s.trim().length() + " " + s.strip().length());
System.out.println(Character.isWhitespace('\u00A0') + " "
    + Character.isSpaceChar('\u00A0'));
String report = "=".repeat(20) + "\n" + "Title".indent(2) + "=".repeat(20);
System.out.println(report);
System.out.println("a\r\nb\rc\nd".lines().count());

// OUTPUT:
// 4 2
// false true
// ====================
//   Title
// ====================
// 4`],
        [`The new methods combine well with streams. Here <code>lines()</code> feeds a pipeline that drops blank lines, strips each line and collects the words. The same sample also tries <code>transform</code>, <code>translateEscapes</code> and <code>stripIndent</code>, which need a newer Java than 11.`,
            r`String text = """
    First line
       indented line

    last line
    """;
List<String> words = text.lines()
    .filter(Predicate.not(String::isBlank))   // drop blank lines
    .map(String::strip)                       // trim each line
    .flatMap(l -> Arrays.stream(l.split("\\s+")))
    .toList();                                // Java 16+
System.out.println(words);
System.out.println("hello".transform(String::toUpperCase)   // Java 12
    .transform(s -> s + "!"));
System.out.println("a\\tb".translateEscapes().equals("a\tb")  // Java 15
    + " " + "  x".stripIndent());

// OUTPUT:
// [First, line, indented, line, last, line]
// HELLO!
// true x`],
        [`Common mistakes are listed below. Clean input once, at the point where it enters your program.
<ul>
<li><b>trim for user input</b>: it misses Unicode spaces. Even <code>strip</code> misses the non-breaking space (U+00A0), so replace it first.</li>
<li><b>isEmpty instead of isBlank</b>: <code>"  ".isEmpty()</code> is false.</li>
<li><b>split("\\n") on Windows text</b>: it leaves a trailing <code>\\r</code> on each line.</li>
<li><b>Ignoring immutability</b>: <code>s.strip();</code> alone does nothing, so keep the result.</li>
</ul>`,
            r`String input = " Abaji ";   // pasted from a web page
String fixed = input.replace(' ', ' ').strip();
System.out.println(input.trim().equals("Abaji") + " "
    + input.strip().equals("Abaji") + " " + "Abaji".equals(fixed));
String win = "a\r\nb";
System.out.println(win.split("\n")[0].length() + " " + win.lines().toList());

// OUTPUT:
// false false true
// 2 [a, b]`],
        [`<code>lines()</code> reads the text on demand and does not build a whole split array. <code>repeat</code> is faster than a loop with concatenation. For heavy text work, use <code>StringBuilder</code>, precompile regexes used in hot loops, and stream files with <code>Files.lines</code> instead of reading everything.`,
            r`long t = System.nanoTime();
String big = "line of text\n".repeat(1_000_000);
long count = big.lines().filter(l -> l.startsWith("line")).count();
long ms = (System.nanoTime() - t) / 1_000_000;
System.out.println(count + " ms=" + ms);

// OUTPUT: (varies)
// 1000000 ms=120`],
        [`Real-world: validating form fields, cleaning imported CSV values, and building formatted console reports.`,
            r`static String clean(String raw) {
    if (raw == null || raw.isBlank()) return null;
    return raw.strip().replaceAll("\\s+", " ");   // squeeze inner spaces
}
System.out.println(clean("  Abaji    Rao  ") + " " + clean("   "));
System.out.println("-".repeat(30));

// OUTPUT:
// Abaji Rao null
// ------------------------------`]
    ),

    'http-client': dv(
        [`<code>HttpClient</code> is immutable and thread-safe. Internally it uses a selector manager thread and an executor for dispatching responses; connections are pooled and HTTP/2 multiplexes streams over one connection. Requests are immutable; <code>BodyPublisher</code> supplies the request body (strings, files, byte arrays, streams) and a <code>BodyHandler</code> turns the response into a <code>BodySubscriber</code> consumed as a reactive stream. WebSocket support is built in via <code>newWebSocketBuilder</code>. The virtual-thread executor below needs Java 21.`,
            r`HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(3))
    .executor(Executors.newVirtualThreadPerTaskExecutor())   // Java 21+
    .build();
HttpRequest req = HttpRequest.newBuilder(URI.create("https://example.com"))
    .timeout(Duration.ofSeconds(5)).build();
HttpResponse<Stream<String>> lines =
    client.send(req, HttpResponse.BodyHandlers.ofLines());
System.out.println(lines.version() + " " + lines.statusCode());
lines.body().limit(2).forEach(System.out::println);

// OUTPUT: (example)
// HTTP_2 200
// <!doctype html>
// <html>`],
        [`Production usage of the client:<ul><li>One shared client per host or service.</li><li>JSON with Jackson (<code>ObjectMapper</code>).</li><li>Authentication headers added in wrapper methods.</li><li>Retry with exponential backoff and jitter, only for idempotent calls.</li><li>Circuit breaker and bulkhead (Resilience4j).</li><li>Metrics and tracing headers.</li><li>Proxy and TLS setup (<code>sslContext</code>, <code>proxy</code>) and cookies (<code>CookieManager</code>).</li><li>Large bodies streamed with <code>ofInputStream</code> or <code>ofFile</code>.</li></ul>`,
            r`ObjectMapper om = new ObjectMapper();
static <T> T get(HttpClient c, String url, Class<T> type, ObjectMapper om)
        throws Exception {
    HttpRequest req = HttpRequest.newBuilder(URI.create(url))
        .header("Authorization", "Bearer " + token())
        .header("Accept", "application/json")
        .timeout(Duration.ofSeconds(5))
        .GET().build();
    for (int attempt = 1; ; attempt++) {
        HttpResponse<String> r = c.send(req, HttpResponse.BodyHandlers.ofString());
        if (r.statusCode() == 200) return om.readValue(r.body(), type);
        if (r.statusCode() < 500 || attempt == 3)
            throw new IOException("HTTP " + r.statusCode() + " " + r.body());
        long backoff = (long) (200 * Math.pow(2, attempt));   // 400, 800 ms
        Thread.sleep(backoff + ThreadLocalRandom.current().nextInt(100)); // jitter
    }
}

// OUTPUT:
// 5xx responses are retried up to 3 times, 4xx fail immediately`],
        [`Common mistakes:<ul><li>No timeouts. A hung server blocks forever. Set a request timeout as well as a connect timeout.</li><li>Creating a client per request.</li><li>Ignoring status codes.</li><li>Leaking secrets in logs, such as URLs with tokens.</li><li>Not closing streaming bodies.</li><li>Calling <code>join()</code> inside async chains, which blocks the common pool.</li><li>Retrying non-idempotent POSTs.</li><li>Disabling TLS verification.</li></ul>`,
            r`HttpClient client = HttpClient.newHttpClient();
URI slow = URI.create("https://slow.example.com");
// Wrong: no timeout, may wait indefinitely for a response
HttpRequest noTimeout = HttpRequest.newBuilder(slow).build();
// Right: fail after 5 seconds
HttpRequest withTimeout = HttpRequest.newBuilder(slow)
    .timeout(Duration.ofSeconds(5)).build();
try {
    client.send(withTimeout, HttpResponse.BodyHandlers.ofString());
} catch (HttpTimeoutException e) {
    System.out.println("timed out: " + e.getMessage());
}

// OUTPUT:
// timed out: request timed out`],
        [`Ways to improve throughput:<ul><li>HTTP/2 multiplexing and a shared client cut connection setup.</li><li>Use async calls or virtual threads (Java 21) for fan-out.</li><li>Limit concurrency with a semaphore to protect the remote service.</li><li>Stream large bodies instead of buffering them.</li><li>Tune the connection pool with system properties such as <code>jdk.httpclient.connectionPoolSize</code>.</li></ul>`,
            r`Semaphore limit = new Semaphore(20);
List<CompletableFuture<Integer>> calls = ids.stream()
    .map(id -> CompletableFuture.supplyAsync(() -> {
        try {
            limit.acquire();                       // wait for a free slot
            try {
                URI uri = URI.create("https://api.example.com/items/" + id);
                return client.send(HttpRequest.newBuilder(uri).build(),
                    HttpResponse.BodyHandlers.ofString()).statusCode();
            } finally { limit.release();
            }
        } catch (Exception e) { throw new CompletionException(e);
        }
    }, Executors.newVirtualThreadPerTaskExecutor()))
    .toList();

// OUTPUT:
// at most 20 requests in flight at once`],
        [`Real-world: calling a payment API with idempotency keys, a health check with short timeouts, and downloading large files with <code>ofFile</code>. Wrap the client in a small class so tests can replace it with a fake.`,
            r`interface PaymentApi { Receipt charge(Charge c) throws IOException; }
class HttpPaymentApi implements PaymentApi {
    private final HttpClient client;
    private final ObjectMapper om;
    HttpPaymentApi(HttpClient client, ObjectMapper om) {
        this.client = client;
        this.om = om;
    }
    public Receipt charge(Charge c) throws IOException {
        try {
            HttpRequest r = HttpRequest.newBuilder(
                    URI.create("https://pay.example.com/v1/charges"))
                .header("Idempotency-Key", c.idempotencyKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(om.writeValueAsString(c)))
                .timeout(Duration.ofSeconds(10))
                .build();
            HttpResponse<String> res =
                client.send(r, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() != 200)
                throw new IOException("payment failed: " + res.statusCode());
            return om.readValue(res.body(), Receipt.class);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException(e);
        }
    }
}

// OUTPUT:
// safe retries thanks to the idempotency key; easily replaced by a fake in tests`]
    ),

    'optional-11': dv(
        [`<code>orElseThrow()</code> throws <code>NoSuchElementException("No value present")</code> and is the clearer replacement for <code>get()</code>, because the name signals intent. Optional is a <b>value-based class</b>: do not compare it by identity, synchronize on it, or serialize it.`,
            r`Optional<String> o = Optional.empty();
System.out.println(o.isEmpty() + " " + o.stream().count() + " "
    + Optional.of(1).stream().count());
System.out.println(Optional.of("v").or(() -> Optional.of("never")).get());
try {
    o.orElseThrow();
} catch (NoSuchElementException e) {
    System.out.println(e.getMessage());
}
List<String> names = Stream.of("a", "b", "c")
    .map(n -> n.equals("b") ? Optional.<String>empty() : Optional.of(n))
    .flatMap(Optional::stream)
    .toList();
System.out.println(names);

// OUTPUT:
// true 0 1
// v
// No value present
// [a, c]`],
        [`Idioms combining the new methods:
<ul>
<li><code>filter(Predicate.not(Optional::isEmpty))</code> for streams of Optionals</li>
<li><code>or</code> for layered lookups (cache, database, remote), evaluated lazily</li>
<li><code>ifPresentOrElse</code> to avoid if/else</li>
<li><code>mapToInt</code> in streams to get an <code>OptionalInt</code></li>
<li><code>orElseThrow</code> in services to map absence to domain exceptions (Spring Data repositories return Optional)</li>
</ul>`,
            r`record User(long id, String source) {}
static Optional<User> fromCache(long id) { return Optional.empty(); }
static Optional<User> fromDb(long id) {
    return Optional.of(new User(id, "db"));
}
static Optional<User> fromRemote(long id) {
    System.out.println("remote call");
    return Optional.empty();
}
// later sources run only when needed
Optional<User> user = fromCache(1)
    .or(() -> fromDb(1))
    .or(() -> fromRemote(1));
user.ifPresentOrElse(
    u -> System.out.println("found in " + u.source()),
    () -> System.out.println("not found"));
OptionalInt maxLen = Stream.of("a", "bbb").mapToInt(String::length).max();

// OUTPUT:
// found in db`],
        [`Common mistakes:
<ul>
<li>Calling <code>isEmpty()</code> then <code>get()</code> (use the functional style instead)</li>
<li>Mixing null checks with Optional</li>
<li>Returning null instead of an Optional</li>
<li>Using Optional parameters (use overloads)</li>
<li>Using Optional to model collections or booleans</li>
<li>Catching <code>NoSuchElementException</code> from <code>orElseThrow()</code> as control flow (throw a meaningful exception instead)</li>
</ul>`,
            r`static Optional<String> badNull() { return null; }   // never
// avoid Optional parameters; overload or use null-safe types
static String name(Optional<String> opt) { return opt.orElse("n/a"); }
// return an empty list instead
Optional<List<String>> alsoBad = Optional.of(List.of());
System.out.println(name(Optional.empty()));

// OUTPUT:
// n/a`],
        [`Optional chains allocate small objects that escape analysis usually removes after inlining; in hot loops over primitives use <code>OptionalInt</code> or plain null checks. Optional creation in a tight loop of millions of elements is rarely a bottleneck compared with I/O. Prefer clarity unless a profiler shows otherwise.`,
            r`int[] data = IntStream.range(0, 5_000_000).toArray();
long t = System.nanoTime();
long s = 0;
for (int v : data) {
    s += Optional.of(v).filter(x -> x % 2 == 0).orElse(0);
}
System.out.println(s + " ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// 6249997500000 ms=30`],
        [`Real-world: a layered configuration lookup (command line, environment, file, default) built with <code>or</code> and <code>orElse</code>.`,
            r`static Optional<String> setting(String key) {
    String envName = key.toUpperCase().replace('.', '_');
    return Optional.ofNullable(System.getProperty(key))
        .or(() -> Optional.ofNullable(System.getenv(envName)))
        .or(() -> fromFile(key));
}
static Optional<String> fromFile(String key) { return Optional.empty(); }
int port = setting("server.port").map(Integer::parseInt).orElse(8080);

// OUTPUT:
// system property wins, then environment variable, then file, then default 8080`]
    ),

    'files-11': dv(
        [`<code>Files.readString</code> reads all bytes and decodes them (it uses a fast path for UTF-8 and throws <code>MalformedInputException</code> for invalid bytes); <code>writeString</code> encodes and writes with the given <code>OpenOption</code>s (default: CREATE, TRUNCATE_EXISTING, WRITE). Files are accessed through the NIO.2 <code>Path</code> abstraction (file systems, including zip file systems), and operations like <code>Files.copy</code> and <code>Files.move</code> are native-assisted. <code>Files.mismatch</code> (Java 12 and later) compares contents efficiently.`,
            r`Path dir = Files.createTempDirectory("demo");
Path f = dir.resolve("a.txt");
Files.writeString(f, "héllo");
System.out.println(Files.size(f) + " " + Files.readString(f).length()
    + " " + Files.readAllBytes(f).length);
Files.writeString(f, "\nmore", StandardOpenOption.APPEND);
try {
    Files.readString(f, StandardCharsets.US_ASCII);
} catch (MalformedInputException e) {
    System.out.println("not ASCII");
}
// a zip file is also a file system
URI zipUri = URI.create("jar:" + dir.resolve("x.zip").toUri());
try (FileSystem zip = FileSystems.newFileSystem(zipUri, Map.of("create", "true"))) {
    Files.writeString(zip.getPath("/in.txt"), "inside zip");
}

// OUTPUT:
// 6 5 6
// not ASCII`],
        [`Robust file patterns: atomic replace (temp file + <code>ATOMIC_MOVE</code>), safe temp files (<code>createTempFile</code> with delete on exit or try-finally cleanup), directory walking (<code>Files.walk</code>, <code>Files.find</code>, <code>walkFileTree</code>), attributes (<code>Files.getLastModifiedTime</code>, <code>readAttributes</code>), permissions (POSIX) and file locking via <code>FileChannel.lock</code>, watching changes with <code>WatchService</code>, and symlink handling (<code>NOFOLLOW_LINKS</code>). Normalize and validate paths to prevent path traversal.`,
            r`static Path safeResolve(Path base, String userPath) {
    Path p = base.resolve(userPath).normalize();
    if (!p.startsWith(base.normalize())) {
        throw new SecurityException("path traversal: " + userPath);
    }
    return p;
}
Path base = Path.of("/srv/uploads");
System.out.println(safeResolve(base, "reports/a.txt"));
try {
    safeResolve(base, "../etc/passwd");
} catch (SecurityException e) {
    System.out.println(e.getMessage());
}
// walk two levels deep and close the stream
try (Stream<Path> s = Files.walk(Path.of("."), 2)) {
    System.out.println(s.filter(Files::isRegularFile).count() >= 0);
}

// OUTPUT:
// /srv/uploads/reports/a.txt
// path traversal: ../etc/passwd
// true`],
        [`Mistakes: <code>readString</code> on huge files (OutOfMemoryError), forgetting to close <code>Files.lines/walk/list</code> streams (file handle leaks), platform default charsets in old APIs (<code>FileReader</code>), non-atomic overwrites (partial files after a crash), trusting user paths (path traversal), checking existence then acting (race: use the operation and handle exceptions), and string concatenation for paths (use <code>resolve</code>).`,
            r`Path p = Path.of("data.txt");
if (Files.exists(p)) {
    // another process may delete it right here (race)
    Files.readString(p);   // better: call it and handle NoSuchFileException
}
// platform dependent: hard-coded separator
String badPath = "/srv/" + "x" + "\\" + "y.txt";
// portable: let Path join the parts
Path goodPath = Path.of("/srv").resolve("x").resolve("y.txt");

// OUTPUT:
// (no output: use resolve and handle exceptions)`],
        [`I/O dominates cost: read big files by streaming (<code>Files.newBufferedReader</code>, <code>Files.lines</code>), write with buffers, use <code>Files.copy</code> for bulk copies, memory-map for random access, and avoid many tiny files. Large text processing should be incremental with constant memory.`,
            r`long errors;
// streaming: constant memory
try (Stream<String> lines = Files.lines(Path.of("app.log"))) {
    errors = lines.filter(l -> l.contains(" ERROR ")).count();
}
// whole file: memory grows with the file size
String whole = Files.readString(Path.of("app.log"));

// OUTPUT:
// (no output: the streaming version handles multi-gigabyte logs)`],
        [`Real-world: a config reloader and an exporter that writes atomically so readers never see half-written files.`,
            r`static void writeAtomically(Path target, String content) throws IOException {
    Path dir = target.toAbsolutePath().getParent();   // same folder as the target
    Path tmp = Files.createTempFile(dir, "cfg-", ".tmp");
    try {
        Files.writeString(tmp, content);
        Files.move(tmp, target,
            StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
    } finally {
        Files.deleteIfExists(tmp);   // no-op after a successful move
    }
}

// OUTPUT:
// (no output: readers see the old or the new file, never a partial one)`]
    ),

    'sealed-classes': dv(
        [`<p>The compiler records the <code>PermittedSubclasses</code> attribute in the class file. The JVM checks it when loading subclasses, and an unpermitted subclass fails with <code>IncompatibleClassChangeError</code>.</p>
<ul>
<li>Permitted subclasses must be in the same module (or the same package when there is no named module).</li>
<li>They must directly extend the sealed class.</li>
<li>Each must be <code>final</code>, <code>sealed</code> or <code>non-sealed</code> (records and enums are implicitly final).</li>
<li>Reflection: <code>Class.isSealed()</code> and <code>getPermittedSubclasses()</code>.</li>
</ul>`,
            r`sealed interface Shape permits Circle, Rect, Poly {}
record Circle(double r) implements Shape {}
record Rect(double w, double h) implements Shape {}
sealed interface Poly extends Shape permits Triangle {}
record Triangle(double b, double h) implements Poly {}
System.out.println(Shape.class.isSealed() + " "
    + Arrays.stream(Shape.class.getPermittedSubclasses())
            .map(Class::getSimpleName).toList());
static double area(Shape s) {
    return switch (s) {
        case Circle c -> Math.PI * c.r() * c.r();
        case Rect r -> r.w() * r.h();
        case Triangle t -> 0.5 * t.b() * t.h();   // Poly is sealed: only Triangle
    };
}
System.out.printf("%.1f%n", area(new Triangle(4, 3)));

// OUTPUT:
// true [Circle, Rect, Poly]
// 6.0`],
        [`<p>Sealed types plus records are called <b>algebraic data types</b>: a sum type (one of several variants) built from product types (records).</p>
<ul>
<li>Typical models: expression trees (interpreters), commands and events, HTTP or RPC results.</li>
<li>State machines (<code>Idle | Running | Failed</code>) and error handling without exceptions (<code>Result</code>).</li>
<li>Exhaustive switches over sealed types often replace the Visitor pattern. They fail to compile when a variant is added.</li>
</ul>`,
            r`sealed interface Expr permits Num, Add, Mul, Neg {}
record Num(double v) implements Expr {}
record Add(Expr l, Expr r) implements Expr {}
record Mul(Expr l, Expr r) implements Expr {}
record Neg(Expr e) implements Expr {}
static double eval(Expr e) {
    return switch (e) {
        case Num n -> n.v();
        case Add a -> eval(a.l()) + eval(a.r());
        case Mul m -> eval(m.l()) * eval(m.r());
        case Neg n -> -eval(n.e());
    };
}
static String show(Expr e) {
    return switch (e) {
        case Num n -> String.valueOf(n.v());
        case Add a -> "(" + show(a.l()) + " + " + show(a.r()) + ")";
        case Mul m -> show(m.l()) + " * " + show(m.r());
        case Neg n -> "-" + show(n.e());
    };
}
Expr ex = new Add(new Num(2), new Mul(new Num(3), new Neg(new Num(4))));
System.out.println(show(ex) + " = " + eval(ex));

// OUTPUT:
// (2.0 + 3.0 * -4.0) = -10.0`],
        [`<p>Common mistakes:</p>
<ul>
<li>Sealing a hierarchy that needs third-party extension.</li>
<li>Forgetting that permitted subclasses must be in the same module or package.</li>
<li>Making everything sealed, which makes the design rigid.</li>
<li>Leaving a <code>default</code> branch that hides new variants. You lose the compile-time check.</li>
<li>Adding variants to a public library type. Clients' switches break, so version carefully.</li>
<li>Mixing sealed types with proxy-based frameworks.</li>
</ul>`,
            r`static String name(Shape s) {
    return switch (s) {
        case Circle c -> "circle";
        case Rect r -> "rect";
        default -> "other";    // default hides a newly added variant
    };
}
// better: no default, so adding a variant breaks the build here and forces a decision

// OUTPUT:
// remove default branches for sealed switches`],
        [`<p>Sealed types add no run-time cost beyond a class-load check. Their main gain is clearer code, and the closed set of subtypes can also help the JIT. In Java 21, pattern switches compile to <code>invokedynamic</code> type switches, which are efficient and often better than long if-else chains.</p>`,
            r`// javap -v Shape.class
//   PermittedSubclasses: Circle, Rect, Poly

// OUTPUT:
// the permitted classes are listed in the class file`],
        [`<p>Real-world: an order lifecycle as a sealed hierarchy. Each state carries only valid data, so impossible states (shipped without an address) cannot be represented.</p>`,
            r`sealed interface OrderState permits Created, Paid, Shipped, Cancelled {}
record Created(Instant at) implements OrderState {}
record Paid(Instant at, String paymentId) implements OrderState {}
record Shipped(Instant at, String trackingNo, String address)
    implements OrderState {}
record Cancelled(Instant at, String reason) implements OrderState {}
static boolean canCancel(OrderState s) {
    return switch (s) {
        case Created c -> true;
        case Paid p -> true;
        case Shipped sh -> false;
        case Cancelled c -> false;
    };
}

// OUTPUT:
// states carry exactly the data valid for them`]
    ),

    'pattern-matching': dv(
        [`<code>x instanceof T t</code> compiles to an <code>instanceof</code> check plus a checked cast and assignment to the binding variable. The compiler tracks <i>definite matching</i> (flow scoping). The variable <code>t</code> is in scope:
<ul>
<li>in the true branch of the <code>if</code></li>
<li>to the right of <code>&amp;&amp;</code></li>
<li>after <code>if (!(x instanceof T t)) return;</code></li>
<li>to the right of <code>||</code>, when the left side is a negated test such as <code>!(x instanceof T t) || t.ok()</code></li>
</ul>
The binding is a normal local variable (not final unless declared).`,
            r`static String f(Object o) {
    if (!(o instanceof CharSequence cs)) return "not text";
    if (cs.length() == 0 || !(cs instanceof String s)) return "empty or not a String";
    return s.toUpperCase();      // s is in scope here: both tests above were false
}
Object o = "x";
boolean b = o instanceof String s && s.length() == 1;
if (!(o instanceof Integer i) || i < 0)
    System.out.println("not a non-negative integer");
System.out.println(f("abc") + " " + f(new StringBuilder("q")) + " "
    + f(5) + " " + b);

// OUTPUT:
// not a non-negative integer
// ABC empty or not a String not text true`],
        [`Where it shines:
<ul>
<li><code>equals</code> implementations</li>
<li>visiting unknown types (JSON values, AST nodes from libraries)</li>
<li>handling mixed collections</li>
<li>bridging into switch patterns and record patterns (Java 21: <code>if (o instanceof Point(int x, int y))</code>)</li>
</ul>
It complements polymorphism, it does not replace it: if you own the hierarchy, put behavior in the types.`,
            r`record Point(int x, int y) {}
static String describe(Object o) {
    // record pattern (Java 21)
    if (o instanceof Point(int x, int y) && x == y) return "diagonal point " + x;
    if (o instanceof Map<?, ?> m && m.get("id") instanceof Integer id)
        return "map with id " + id;
    return "other";
}
System.out.println(describe(new Point(2, 2)) + " | "
    + describe(Map.of("id", 7)) + " | " + describe("x"));

// OUTPUT:
// diagonal point 2 | map with id 7 | other`],
        [`Common mistakes:
<ul>
<li>repeating the check and cast the old way</li>
<li>re-using the binding name in the same scope (compile error)</li>
<li>pattern variables that shadow fields</li>
<li>long <code>instanceof</code> chains where a switch pattern fits better</li>
<li>using patterns where an interface method would remove the type test</li>
<li>unchecked generic patterns: <code>o instanceof List&lt;String&gt; l</code> is an error unless the cast is provably safe</li>
</ul>`,
            r`Object o = List.of("a");
// if (o instanceof List<String> l) {}
//   error: Object cannot be safely cast to List<String>
if (o instanceof List<?> l) System.out.println(l.size());
String s = "outer";
// if (o instanceof String s) {}
//   error: variable s is already defined

// OUTPUT:
// 1`],
        [`The generated code is the same as a manual instanceof plus cast, so there is no performance change. The JIT optimizes type checks well; for many alternatives, a switch pattern (Java 21) uses a type switch bootstrap that can be faster than sequential instanceof chains.`,
            r`// Java 21: switch (o) { case Integer i -> ...; case String s -> ...; case Point p -> ...; default -> ... }
// compiles to invokedynamic SwitchBootstraps.typeSwitch(...)

// OUTPUT:
// a single dispatch instead of repeated instanceof checks`],
        [`Real-world: handling events of different types from a library, and writing small null-safe <code>equals</code> implementations.`,
            r`void handle(Object event) {
    if (event instanceof OrderPlaced op && op.total() > 1000)
        alerts.notifyLargeOrder(op);
    else if (event instanceof PaymentFailed pf)
        retry.schedule(pf.orderId());
    else if (event instanceof String raw && raw.startsWith("{"))
        log.debug("raw json event {}", raw);
}

// OUTPUT:
// each event type is handled without casts`]
    ),

    'records': dv(
        [`<p>A record compiles to a final class extending <code>java.lang.Record</code>. It has private final fields, a canonical constructor and accessor methods. Its <code>equals</code>, <code>hashCode</code> and <code>toString</code> use <code>invokedynamic</code> (the <code>ObjectMethods</code> bootstrap).</p>
<ul>
<li>The <b>compact constructor</b> runs before the fields are assigned and may reassign the parameters.</li>
<li>Records can implement interfaces and declare static members, nested types, annotations and generic parameters.</li>
<li><code>Class.getRecordComponents()</code> lists the components at run time.</li>
</ul>`,
            r`record Temp(double celsius) implements Comparable<Temp> {
    static final Temp FREEZING = new Temp(0);
    Temp {
        if (celsius < -273.15)
            throw new IllegalArgumentException("below absolute zero");
        celsius = Math.round(celsius * 100) / 100.0;   // normalize
    }
    double fahrenheit() { return celsius * 9 / 5 + 32; }
    public int compareTo(Temp o) {
        return Double.compare(celsius, o.celsius);
    }
}
System.out.println(new Temp(36.6666) + " " + new Temp(100).fahrenheit()
    + " " + new Temp(1).compareTo(Temp.FREEZING) + " " + Temp.class.isRecord());
System.out.println(Arrays.stream(Temp.class.getRecordComponents())
    .map(RecordComponent::getName).toList());

// OUTPUT:
// Temp[celsius=36.67] 212.0 1 true
// [celsius]`],
        [`<p><b>Good uses</b></p>
<ul>
<li>DTOs and API responses (Jackson 2.12+ supports records)</li>
<li>Keys in maps and sets</li>
<li>Tuples and intermediate stream results (local records)</li>
<li>Events, commands and immutable configuration</li>
<li>Record patterns such as <code>case Point(int x, int y)</code> (Java 21)</li>
<li>With-style copies: write <code>withX</code> methods yourself, because records have no built-in withers</li>
</ul>
<p><b>Avoid records for</b> entities with identity and lifecycle (JPA), classes with many optional fields (use a builder), and classes that need inheritance.</p>`,
            r`record Customer(long id, String name, Address addr) {}
record Address(String city, String zip) {}
Object o = new Customer(1, "Abaji", new Address("Pune", "411001"));
// Record pattern in instanceof: Java 21
if (o instanceof Customer(long id, String name, Address(String city, var zip)))
    System.out.println(id + " " + name + " " + city + " " + zip);
record Stat(String key, long count) {}
Map<String, Long> counts = Stream.of("a", "b", "a")
    .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
System.out.println(counts.entrySet().stream()
    .map(e -> new Stat(e.getKey(), e.getValue()))
    .sorted(Comparator.comparingLong(Stat::count).reversed())
    .findFirst().get());
record Config(String url, int pool) {
    Config withPool(int p) { return new Config(url, p); }
}
System.out.println(new Config("db", 5).withPool(20));

// OUTPUT:
// 1 Abaji Pune 411001
// Stat[key=a, count=2]
// Config[url=db, pool=20]`],
        [`<p><b>Common mistakes</b></p>
<ul>
<li>Mutable components (arrays, lists) break immutability. Copy them in the compact constructor.</li>
<li>Arrays use identity in the generated <code>equals</code>. Override <code>equals</code> or use a <code>List</code>.</li>
<li>Overriding an accessor so it behaves differently from the field surprises callers.</li>
<li>Frameworks that expect a no-arg constructor, or JPA entities, do not work with records.</li>
<li>Sensitive fields appear in the generated <code>toString</code>. Override it.</li>
<li>Adding or removing components changes the serialized form (deserialization uses the canonical constructor).</li>
</ul>`,
            r`record Bytes(byte[] data) {}
System.out.println(new Bytes(new byte[]{1}).equals(new Bytes(new byte[]{1})));
// false: arrays compare by identity
record User(String name, String password) {
    @Override public String toString() { return "User[name=" + name + "]"; }
}
System.out.println(new User("abaji", "secret"));
record Safe(List<String> items) {
    Safe { items = List.copyOf(items); }
}  // fix

// OUTPUT:
// false
// User[name=abaji]`],
        [`<ul>
<li>Records are normal objects: allocation and field access cost the same as a handwritten class.</li>
<li>The generated <code>equals</code> and <code>hashCode</code> are efficient (method handles).</li>
<li>Immutable records are safe and cheap to share between threads.</li>
<li>Project Valhalla may later allow value records without identity, for a flatter memory layout.</li>
</ul>`,
            r`record P(int x, int y) {}
Set<P> seen = new HashSet<>();
long t = System.nanoTime();
for (int i = 0; i < 1_000_000; i++) seen.add(new P(i % 1000, i / 1000));
System.out.println(seen.size() + " ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// 1000000 ms=150`],
        [`<p>Real-world uses: API layer DTOs, immutable events in an event-driven system, and cache keys with composite fields.</p>`,
            r`public record CreateOrderRequest(
    @NotBlank String customerId,
    @NotEmpty List<@Valid Line> lines) {}
public record Line(@NotBlank String sku, @Positive int qty) {}
@PostMapping("/orders")
ResponseEntity<OrderResponse> create(@Valid @RequestBody CreateOrderRequest req) {
    return ResponseEntity.ok(service.create(req));
}
record CacheKey(String tenant, long userId, Locale locale) {}

// OUTPUT:
// validation annotations work on record components`]
    ),

    'switch-expressions': dv(
        [`How it works inside:<ul><li>Compiles to <code>tableswitch</code> or <code>lookupswitch</code> (enums via ordinal mapping, strings via <code>hashCode</code> then <code>equals</code>) and pushes the result on the stack.</li><li>Arrow cases have no fall-through; a block case must <code>yield</code> a value on every path.</li><li>The compiler checks exhaustiveness: enums and sealed types need every constant or subtype, otherwise a <code>default</code> is required.</li><li>If an enum gains a constant after compilation (separate compilation), a <code>MatchException</code> (Java 21) or <code>IncompatibleClassChangeError</code> (older) is thrown at run time.</li></ul>`,
            r`enum Level { LOW, MEDIUM, HIGH }
static int weight(Level l) {
    return switch (l) {
        case LOW -> 1;
        case MEDIUM -> 5;
        case HIGH -> { int base = 10; yield base * 2; }
    };
}
// Pattern switch: standard from Java 21
static String kind(Object o) {
    return switch (o) {
        case Integer i when i < 0 -> "negative";
        case Integer i -> "int " + i;
        case String s -> "text";
        case null -> "null";
        default -> "other";
    };
}
System.out.println(weight(Level.HIGH) + " " + kind(-3) + " " + kind(7)
    + " " + kind(null) + " " + kind(2.5));

// OUTPUT:
// 20 negative int 7 null other`],
        [`Idioms:<ul><li>Replace if-else ladders and maps of lambdas with switch expressions.</li><li>Return directly: <code>return switch ...</code>.</li><li>Use multiple labels, and throw in the <code>default</code> branch.</li><li>Combine with enums and sealed interfaces; add guards (<code>when</code>) and patterns in Java 21.</li><li>Keep branch bodies short; delegate to methods.</li><li>Arrow and colon forms cannot be mixed in one switch.</li></ul>`,
            r`static double shipping(String region, double kg) {
    return switch (region) {
        case "IN", "LK" -> kg <= 1 ? 40 : 40 + (kg - 1) * 15;
        case "US" -> 120 + kg * 30;
        case "EU", "UK" -> { double base = 100; yield base + kg * 25; }
        default -> throw new IllegalArgumentException("no shipping to " + region);
    };
}
System.out.println(shipping("IN", 3) + " " + shipping("EU", 2) + " " + shipping("US", 1));

// OUTPUT:
// 70.0 150.0 150.0`],
        [`Common mistakes:<ul><li>Forgetting <code>yield</code> in a block.</li><li>Mixing colon and arrow styles in one switch.</li><li>Adding a <code>default</code> that hides a missing enum case (you lose compile-time exhaustiveness).</li><li>Relying on fall-through in the colon form by accident.</li><li>Side effects in cases that obscure the computed value.</li><li>A null selector throws <code>NullPointerException</code>. Check for null first, or use <code>case null</code> (Java 21).</li></ul>`,
            r`Level level = Level.LOW;
// With default: a new constant EXTREME compiles silently and hits default
String a = switch (level) { case LOW -> "l"; case MEDIUM -> "m"; default -> "other"; };
// Without default: a new constant breaks the build here, so you must decide
String b = switch (level) { case LOW -> "l"; case MEDIUM -> "m"; case HIGH -> "h"; };
String sel = null;
try {
    switch (sel) { case "x" -> System.out.println("x"); default -> System.out.println("d"); }
} catch (NullPointerException e) {
    System.out.println("null selector");
}

// OUTPUT:
// null selector`],
        [`Performance:<ul><li>Same as the old switch: dense int cases use a jump table, strings use hash lookups.</li><li>Pattern switches use a type-switch call site that caches the dispatch.</li><li>Prefer switch to long if-else chains for readability; the order of cases rarely matters.</li></ul>`,
            r`// javap -c shows: tableswitch { 1: ..., 2: ..., default: ... } for dense ints
//                  lookupswitch for sparse values
// string switch: hashCode() -> lookupswitch -> equals()

// OUTPUT:
// constant-time dispatch (no program output; this is what javap shows)`],
        [`Real-world: mapping HTTP status classes, parsing commands, computing prices per tier, and converting enums to display text without scattered ifs.`,
            r`static String message(int status) {
    return switch (status / 100) {
        case 2 -> "success";
        case 3 -> "redirect";
        case 4 -> status == 404 ? "not found" : "client error";
        case 5 -> "server error";
        default -> "unknown";
    };
}
System.out.println(message(204) + " " + message(404) + " " + message(503));

// OUTPUT:
// success not found server error`]
    ),

    'text-blocks': dv(
        [`Text block processing (JLS 3.10.6) happens at compile time: line terminators are normalized to <code>\\n</code>, incidental whitespace is removed (the smallest indentation among non-blank lines and the closing delimiter line), trailing spaces on each line are stripped, then escape sequences are interpreted. New escapes: <code>\\&lt;newline&gt;</code> (line continuation) and <code>\\s</code> (space). The result is an ordinary interned <code>String</code> constant.`,
            r`String a = """
    one
      two
    three""";
String b = "one\n  two\nthree";
System.out.println(a.equals(b) + " " + (a == b));
String c = """
    trailing spaces removed
    keep\s\s
    """;
System.out.print(c.replace(" ", "."));

// OUTPUT:
// true true
// trailing.spaces.removed
// keep..`],
        [`Typical uses: embedded SQL, JSON, XML or HTML templates, GraphQL queries, shell snippets, and expected output in tests. Combine them with <code>formatted</code>, <code>String.format</code>, <code>stripIndent</code> and <code>translateEscapes</code>. Java 21 string templates were only a preview and have since been removed, so use <code>formatted</code>. For HTML or SQL, never concatenate untrusted data: bind parameters or escape it.`,
            r`String query = """
    query($id: ID!) {
      user(id: $id) { name email }
    }
    """;
String items = Stream.of("a", "b").map(s -> "  <li>" + s + "</li>")
    .collect(Collectors.joining("\n"));
String html = """
    <ul>
    %s
    </ul>
    """.formatted(items);
String expected = """
    {"id":1,"name":"Abaji"}""";
System.out.println(html.lines().count() + " " + query.contains("user(id")
    + " " + expected.length());

// OUTPUT:
// 4 true 22`],
        [`Common mistakes:<ul>
<li>Forgetting the newline after the opening delimiter.</li>
<li>Misjudging indentation: the closing <code>"""</code> position changes stripping.</li>
<li>Mixing tabs and spaces.</li>
<li>Expecting trailing spaces to stay: they are removed silently. Use <code>\\s</code> to keep them.</li>
<li>Embedding unescaped triple quotes.</li>
<li>Building SQL with <code>formatted</code> from user input.</li>
<li>Relying on <code>\\r\\n</code>: it is normalized to <code>\\n</code>.</li>
</ul>`,
            r`// String bad = """text""";   // error: missing line terminator after opening """
String quotes = """
    She said \"""hello\"""
    """;
System.out.println(quotes.strip());

// OUTPUT:
// She said """hello"""`],
        [`Text blocks are compile-time constants, so they cost no more at run time than concatenation. Large embedded resources (megabytes) belong in files loaded at runtime (classpath resources), not in source.`,
            r`// large or shared queries: load from a file
String sql = Files.readString(Path.of("queries/report.sql"));
// short queries: fine in code
static final String SMALL = """
    SELECT id FROM t WHERE x = ?
    """;

// OUTPUT:
// small statements in code, large ones as resources`],
        [`Real-world: a repository with readable multi-line SQL and prepared statement parameters, and JSON fixtures in tests.`,
            r`private static final String FIND_ACTIVE = """
    SELECT o.id, o.total, c.name
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
     WHERE o.status = ?
       AND o.created_at >= ?
     ORDER BY o.created_at DESC
    """;
try (PreparedStatement ps = conn.prepareStatement(FIND_ACTIVE)) {
    ps.setString(1, "PAID");
    ps.setTimestamp(2, Timestamp.from(since));
    // run the query ...
}

// OUTPUT:
// readable SQL, safe parameter binding`]
    )
};
