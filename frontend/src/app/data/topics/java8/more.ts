import { block, topic, type Sub } from './kit';

// ---- 10. CompletableFuture and concurrency ----
const cf: Sub[] = [
    ['Introduction to CompletableFuture', 'A future you can complete by hand and chain with callbacks, so you do not block waiting for it.',
`CompletableFuture<String> f = CompletableFuture.supplyAsync(() -> "result");
System.out.println(f.join());
// OUTPUT: result`],
    ['runAsync()', 'Runs a task on a background thread. Returns <code>CompletableFuture&lt;Void&gt;</code>.',
`CompletableFuture<Void> f = CompletableFuture.runAsync(() -> System.out.println("background work"));
f.join();
// OUTPUT: background work`],
    ['supplyAsync()', 'Runs a task that returns a value on a background thread.',
`CompletableFuture<Integer> f = CompletableFuture.supplyAsync(() -> 6 * 7);
System.out.println(f.join());
// OUTPUT: 42`],
    ['thenApply()', 'Transforms the result (like <code>map</code>).',
`System.out.println(CompletableFuture.supplyAsync(() -> 5).thenApply(n -> n * 2).join());
// OUTPUT: 10`],
    ['thenAccept()', 'Consumes the result and returns nothing.',
`CompletableFuture.supplyAsync(() -> "Pune").thenAccept(c -> System.out.println("City " + c)).join();
// OUTPUT: City Pune`],
    ['thenRun()', 'Runs an action after completion, ignoring the result.',
`CompletableFuture.supplyAsync(() -> 1).thenRun(() -> System.out.println("finished")).join();
// OUTPUT: finished`],
    ['thenCompose()', 'Chains a step that itself returns a <code>CompletableFuture</code> (like <code>flatMap</code>).',
`CompletableFuture<Integer> f = CompletableFuture.supplyAsync(() -> 10)
        .thenCompose(n -> CompletableFuture.supplyAsync(() -> n + 5));
System.out.println(f.join());
// OUTPUT: 15`],
    ['thenCombine()', 'Combines the results of two independent futures.',
`CompletableFuture<Integer> a = CompletableFuture.supplyAsync(() -> 20);
CompletableFuture<Integer> b = CompletableFuture.supplyAsync(() -> 22);
System.out.println(a.thenCombine(b, Integer::sum).join());
// OUTPUT: 42`],
    ['allOf()', 'Completes when all futures complete. Its result is <code>Void</code>; read each future yourself.',
`CompletableFuture<String> a = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> b = CompletableFuture.supplyAsync(() -> "B");
CompletableFuture.allOf(a, b).join();
System.out.println(a.join() + b.join());
// OUTPUT: AB`],
    ['anyOf()', 'Completes as soon as one of the futures completes.',
`CompletableFuture<Object> first = CompletableFuture.anyOf(
        CompletableFuture.supplyAsync(() -> "fast"),
        new CompletableFuture<String>());   // this one never completes
System.out.println(first.join());
// OUTPUT: fast`],
    ['exceptionally()', 'Supplies a fallback value when the stage failed.',
`System.out.println(CompletableFuture.<Integer>supplyAsync(() -> { throw new IllegalStateException("boom"); })
        .exceptionally(ex -> -1).join());
// OUTPUT: -1`],
    ['handle()', 'Runs for both success and failure; you get the result and the exception.',
`System.out.println(CompletableFuture.<Integer>supplyAsync(() -> 10 / 0)
        .handle((value, ex) -> ex == null ? "ok " + value : "failed").join());
// OUTPUT: failed`],
    ['whenComplete()', 'Observes the result or exception without changing it.',
`CompletableFuture.supplyAsync(() -> "done")
        .whenComplete((value, ex) -> System.out.println("completed with " + value))
        .join();
// OUTPUT: completed with done`],
    ['join()', 'Waits for the result. Throws an unchecked <code>CompletionException</code> on failure.',
`System.out.println(CompletableFuture.supplyAsync(() -> "v").join());
// OUTPUT: v`],
    ['get()', 'Waits for the result. Throws checked <code>InterruptedException</code> and <code>ExecutionException</code>.',
`try {
    System.out.println(CompletableFuture.supplyAsync(() -> "v").get());
} catch (InterruptedException | ExecutionException e) {
    e.printStackTrace();
}
// OUTPUT: v`],
    ['Asynchronous Execution', 'Pass your own <code>Executor</code> to control the threads. The default is the common ForkJoin pool.',
`ExecutorService pool = Executors.newFixedThreadPool(2);
CompletableFuture<String> f = CompletableFuture.supplyAsync(() -> Thread.currentThread().getName().startsWith("pool") ? "own pool" : "other", pool);
System.out.println(f.join());
pool.shutdown();
// OUTPUT: own pool`],
    ['Combining Asynchronous Tasks', 'Run independent calls at the same time and merge the results.',
`CompletableFuture<String> user = CompletableFuture.supplyAsync(() -> "Asha");
CompletableFuture<Integer> orders = CompletableFuture.supplyAsync(() -> 3);
System.out.println(user.thenCombine(orders, (u, n) -> u + " has " + n + " orders").join());
// OUTPUT: Asha has 3 orders`],
    ['Exception Handling', 'Use <code>exceptionally</code> or <code>handle</code> at the end of the chain.',
`String result = CompletableFuture.supplyAsync(() -> { if (true) throw new RuntimeException("db down"); return "data"; })
        .thenApply(String::toUpperCase)
        .exceptionally(ex -> "fallback")
        .join();
System.out.println(result);
// OUTPUT: fallback`],
    ['CompletionStage', 'The interface <code>CompletableFuture</code> implements. It describes the chaining methods only.',
`CompletionStage<String> stage = CompletableFuture.completedFuture("x");
System.out.println(stage.thenApply(s -> s + "y").toCompletableFuture().join());
// OUTPUT: xy`],
    ['ConcurrentHashMap Enhancements', 'Java 8 added <code>forEach</code>, <code>reduce</code>, <code>search</code> with a parallelism threshold, plus <code>mappingCount()</code> and <code>newKeySet()</code>.',
`ConcurrentHashMap<String, Integer> m = new ConcurrentHashMap<>();
m.put("a", 1); m.put("b", 2); m.put("c", 3);
System.out.println(m.reduceValues(1, Integer::sum));
System.out.println(m.mappingCount());
m.merge("a", 10, Integer::sum);   // atomic
System.out.println(m.get("a"));
// OUTPUT:
// 6
// 3
// 11`],
    ['LongAdder', 'A counter that spreads updates over cells, so it is faster than <code>AtomicLong</code> under heavy contention.',
`LongAdder hits = new LongAdder();
IntStream.range(0, 1000).parallel().forEach(i -> hits.increment());
System.out.println(hits.sum());
// OUTPUT: 1000`],
    ['DoubleAdder', 'The same idea for <code>double</code> totals.',
`DoubleAdder total = new DoubleAdder();
IntStream.range(0, 100).parallel().forEach(i -> total.add(0.5));
System.out.println(total.sum());
// OUTPUT: 50.0`],
    ['StampedLock', 'A lock with an optimistic read mode that does not block writers.',
`StampedLock lock = new StampedLock();
int[] value = {5};
long stamp = lock.tryOptimisticRead();
int copy = value[0];
if (!lock.validate(stamp)) {              // a writer got in: fall back to a real read lock
    stamp = lock.readLock();
    try { copy = value[0]; } finally { lock.unlockRead(stamp); }
}
System.out.println(copy);
// OUTPUT: 5`],
];
export const java8Concurrency = topic('java8-complete-completablefuture', 'Java 8 Complete: CompletableFuture and Concurrency Enhancements', cf.map(block), [
    ['thenApply vs thenCompose?', 'thenApply maps a value to a value. thenCompose maps a value to another CompletableFuture and flattens it.'],
    ['join vs get?', 'Both wait for the result. get throws checked exceptions; join throws unchecked CompletionException.'],
    ['Why LongAdder over AtomicLong?', 'Under heavy contention LongAdder spreads updates over several cells and sums them on read, which scales better.'],
]);

// ---- 11. Base64 ----
const b64: Sub[] = [
    ['Introduction to Base64 Encoding', 'Base64 writes binary data as text using 64 safe characters. It is encoding, not encryption.',
`byte[] raw = {72, 105};   // "Hi"
System.out.println(Base64.getEncoder().encodeToString(raw));
// OUTPUT: SGk=`],
    ['Basic Encoder and Decoder', 'Uses the standard alphabet (A-Z, a-z, 0-9, +, /) with padding.',
`Base64.Encoder enc = Base64.getEncoder();
Base64.Decoder dec = Base64.getDecoder();
String text = enc.encodeToString("JavaSchoolLab".getBytes());
System.out.println(text + " -> " + new String(dec.decode(text)));
// OUTPUT: SmF2YVNjaG9vbExhYg== -> JavaSchoolLab`],
    ['URL-Safe Encoder and Decoder', 'Uses <code>-</code> and <code>_</code> instead of <code>+</code> and <code>/</code>, safe in URLs and file names.',
`byte[] data = {(byte) 0xfb, (byte) 0xff};
System.out.println(Base64.getEncoder().encodeToString(data));
System.out.println(Base64.getUrlEncoder().encodeToString(data));
// OUTPUT:
// +/8=
// -_8=`],
    ['MIME Encoder and Decoder', 'Breaks lines at 76 characters, used for email attachments.',
`String mime = Base64.getMimeEncoder().encodeToString(new byte[100]);
System.out.println(mime.contains("\\r\\n"));
System.out.println(Base64.getMimeDecoder().decode(mime).length);
// OUTPUT:
// true
// 100`],
    ['Encoding Strings', 'Convert the string to bytes first. Use UTF-8 explicitly.',
`String encoded = Base64.getEncoder().encodeToString("नमस्ते".getBytes(StandardCharsets.UTF_8));
System.out.println(encoded);
// OUTPUT: 4KSo4KSu4KS44KWN4KSk4KWH`],
    ['Decoding Strings', 'Decode to bytes, then build the string with the same charset.',
`byte[] bytes = Base64.getDecoder().decode("SmF2YQ==");
System.out.println(new String(bytes, StandardCharsets.UTF_8));
// OUTPUT: Java`],
    ['Encoding and Decoding Byte Arrays', '<code>encode</code> returns bytes, <code>encodeToString</code> returns text.',
`byte[] in = {1, 2, 3, 4};
byte[] enc = Base64.getEncoder().encode(in);
byte[] out = Base64.getDecoder().decode(enc);
System.out.println(new String(enc) + " " + Arrays.equals(in, out));
// OUTPUT: AQIDBA== true`],
];
export const java8Base64 = topic('java8-complete-base64', 'Java 8 Complete: Base64 API', b64.map(block), [
    ['Is Base64 encryption?', 'No. It is reversible encoding. Anyone can decode it, so never use it to protect secrets.'],
]);

// ---- 12. String enhancements ----
const str: Sub[] = [
    ['String.join()', 'Joins values with a delimiter.',
`System.out.println(String.join("-", "2026", "01", "26"));
// OUTPUT: 2026-01-26`],
    ['StringJoiner', 'Builds a delimited string step by step.',
`StringJoiner sj = new StringJoiner(", ");
sj.add("Raigad").add("Torna");
System.out.println(sj);
// OUTPUT: Raigad, Torna`],
    ['Joining Multiple Strings', 'Add as many parts as needed.',
`StringJoiner sj = new StringJoiner("/");
for (String part : new String[]{"usr", "local", "bin"}) sj.add(part);
System.out.println(sj);
// OUTPUT: usr/local/bin`],
    ['Custom Delimiters', 'Any string can be the delimiter.',
`System.out.println(String.join(" | ", "A", "B", "C"));
System.out.println(String.join("", "no", "gap"));
// OUTPUT:
// A | B | C
// nogap`],
    ['Prefix and Suffix', 'The three-argument <code>StringJoiner</code> adds them around the result.',
`StringJoiner sj = new StringJoiner(",", "{", "}");
sj.add("1").add("2");
System.out.println(sj);
// OUTPUT: {1,2}`],
    ['Joining Collections of Strings', '<code>String.join</code> accepts any <code>Iterable</code> of <code>CharSequence</code>.',
`List<String> cities = Arrays.asList("Pune", "Nashik", "Satara");
System.out.println(String.join(", ", cities));
// OUTPUT: Pune, Nashik, Satara`],
];
export const java8StringEnhancements = topic('java8-complete-string-enhancements', 'Java 8 Complete: String Enhancements', str.map(block), [
    ['String.join or StringJoiner?', 'String.join for an existing set of values. StringJoiner when you add pieces one at a time or need a prefix and suffix.'],
]);

// ---- 13. Arrays ----
const arr: Sub[] = [
    ['Arrays.parallelSort()', 'Sorts a large array using several threads.',
`int[] a = {5, 2, 9, 1, 7};
Arrays.parallelSort(a);
System.out.println(Arrays.toString(a));
// OUTPUT: [1, 2, 5, 7, 9]`],
    ['Arrays.stream()', 'Turns an array into a stream.',
`String[] names = {"Ravi", "Amit"};
System.out.println(Arrays.stream(names).map(String::toUpperCase).collect(Collectors.toList()));
// OUTPUT: [RAVI, AMIT]`],
    ['Arrays.setAll()', 'Fills an array by index.',
`int[] squares = new int[5];
Arrays.setAll(squares, i -> i * i);
System.out.println(Arrays.toString(squares));
// OUTPUT: [0, 1, 4, 9, 16]`],
    ['Arrays.parallelSetAll()', 'Same as <code>setAll</code>, filled in parallel.',
`long[] cubes = new long[5];
Arrays.parallelSetAll(cubes, i -> (long) i * i * i);
System.out.println(Arrays.toString(cubes));
// OUTPUT: [0, 1, 8, 27, 64]`],
    ['Arrays.parallelPrefix()', 'Running total (or any cumulative operation) in place.',
`int[] a = {1, 2, 3, 4};
Arrays.parallelPrefix(a, Integer::sum);
System.out.println(Arrays.toString(a));
// OUTPUT: [1, 3, 6, 10]`],
    ['Sorting Primitive Arrays', '<code>Arrays.sort</code> on primitives is ascending only. For descending, box first.',
`int[] a = {3, 1, 2};
Arrays.sort(a);
System.out.println(Arrays.toString(a));
Integer[] desc = Arrays.stream(a).boxed().sorted(Comparator.reverseOrder()).toArray(Integer[]::new);
System.out.println(Arrays.toString(desc));
// OUTPUT:
// [1, 2, 3]
// [3, 2, 1]`],
    ['Sorting Object Arrays', 'Object arrays take a <code>Comparator</code>.',
`String[] names = {"Sam", "Amit", "Ravi"};
Arrays.sort(names, Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
System.out.println(Arrays.toString(names));
// OUTPUT: [Sam, Amit, Ravi]`],
    ['Parallel Array Processing', 'Combine parallel streams over arrays for large data.',
`int[] big = IntStream.rangeClosed(1, 1_000_000).toArray();
System.out.println(Arrays.stream(big).parallel().asLongStream().sum());
// OUTPUT: 500000500000`],
];
export const java8Arrays = topic('java8-complete-arrays-enhancements', 'Java 8 Complete: Arrays Enhancements', arr.map(block), [
    ['When is parallelSort faster?', 'On large arrays (thousands of elements and up) with several cores. For small arrays it falls back to sequential sort.'],
]);

// ---- 14. Annotations ----
const ann: Sub[] = [
    ['Repeating Annotations', 'Java 8 lets you put the same annotation on one element more than once.',
`@Retention(RetentionPolicy.RUNTIME) @interface Roles { Role[] value(); }
@Retention(RetentionPolicy.RUNTIME) @Repeatable(Roles.class) @interface Role { String value(); }

@Role("admin") @Role("editor")
class Account {}

for (Role r : Account.class.getAnnotationsByType(Role.class)) System.out.println(r.value());
// OUTPUT:
// admin
// editor`],
    ['@Repeatable', 'Names the container annotation that stores the repeated ones.',
`@Retention(RetentionPolicy.RUNTIME) @interface Tags { Tag[] value(); }
@Retention(RetentionPolicy.RUNTIME) @Repeatable(Tags.class) @interface Tag { String value(); }   // container is Tags

@Tag("a") @Tag("b")
class Item {}
System.out.println(Item.class.getAnnotation(Tags.class).value().length);
// OUTPUT: 2`],
    ['Type Annotations', 'Annotations can now go on any use of a type, with <code>ElementType.TYPE_USE</code>.',
`@Target(ElementType.TYPE_USE) @interface NonNull {}

static int length(@NonNull String s) { return s.length(); }
System.out.println(length("Raigad"));
// OUTPUT: 6`],
    ['Annotations on Generic Types', 'Annotate the type argument itself.',
`@Target(ElementType.TYPE_USE) @interface NonEmpty {}

List<@NonEmpty String> names = new ArrayList<>();
names.add("Asha");
System.out.println(names);
// OUTPUT: [Asha]`],
    ['Annotations on Type Parameters', '<code>ElementType.TYPE_PARAMETER</code> allows an annotation on <code>T</code> in <code>class Box&lt;T&gt;</code>.',
`@Target(ElementType.TYPE_PARAMETER) @interface Immutable {}

class Box<@Immutable T> { T value; Box(T v) { value = v; } }
System.out.println(new Box<>("fort").value);
// OUTPUT: fort`],
    ['Annotations on Type Uses', 'Places include <code>new</code>, casts, <code>implements</code> and <code>throws</code>.',
`@Target(ElementType.TYPE_USE) @interface Checked {}

Object o = "text";
String s = (@Checked String) o;           // on a cast
List<String> list = new @Checked ArrayList<>();   // on new
System.out.println(s + list);
// OUTPUT: text[]`],
    ['Annotation Processing Fundamentals', 'Read annotations at runtime with reflection (needs <code>RetentionPolicy.RUNTIME</code>). Tools like Spring and JUnit do this.',
`@Retention(RetentionPolicy.RUNTIME) @interface Info { String author(); }

@Info(author = "Pankaj")
class Service {}
System.out.println(Service.class.getAnnotation(Info.class).author());
// OUTPUT: Pankaj`],
];
export const java8Annotations = topic('java8-complete-annotation-enhancements', 'Java 8 Complete: Annotation Enhancements', ann.map(block), [
    ['What does @Repeatable need?', 'A container annotation holding an array of the repeatable one, named in @Repeatable(Container.class).'],
]);

// ---- 15. Reflection ----
const refl: Sub[] = [
    ['Method Parameter Reflection', 'Java 8 can read the real parameter names at runtime.',
`// compile with: javac -parameters Demo.java
class Demo { public void register(String email, int age) {} }
Method m = Demo.class.getMethod("register", String.class, int.class);
for (Parameter p : m.getParameters()) System.out.println(p.getName());
// OUTPUT:
// email
// age`],
    ['Parameter Class', '<code>java.lang.reflect.Parameter</code> describes one method or constructor parameter.',
`Method m = String.class.getMethod("indexOf", String.class, int.class);
for (Parameter p : m.getParameters()) System.out.println(p.getType().getSimpleName());
// OUTPUT:
// String
// int`],
    ['getName()', 'The parameter name, or <code>arg0</code>, <code>arg1</code> when not compiled with <code>-parameters</code>.',
`Parameter p = Demo.class.getMethod("register", String.class, int.class).getParameters()[0];
System.out.println(p.getName());
// OUTPUT: email   (or arg0 without -parameters)`],
    ['isNamePresent()', 'True only when the class file kept the real names.',
`Parameter p = Demo.class.getMethod("register", String.class, int.class).getParameters()[0];
System.out.println(p.isNamePresent());
// OUTPUT: true   (false without -parameters)`],
    ['Compiling with -parameters', 'The flag stores names in the class file. In Maven set <code>&lt;parameters&gt;true&lt;/parameters&gt;</code> for the compiler plugin.',
`// javac -parameters Demo.java
// Maven: maven-compiler-plugin -> <configuration><parameters>true</parameters></configuration>
// Spring Boot's parent POM already turns this on.
System.out.println("flag stores parameter names in the .class file");
// OUTPUT: flag stores parameter names in the .class file`],
    ['Accessing Method Parameter Names at Runtime', 'Frameworks use this to bind request values by name.',
`Method m = Demo.class.getMethod("register", String.class, int.class);
String names = Arrays.stream(m.getParameters()).map(Parameter::getName).collect(Collectors.joining(", "));
System.out.println(names);
// OUTPUT: email, age`],
];
export const java8Reflection = topic('java8-complete-reflection-enhancements', 'Java 8 Complete: Reflection Enhancements', refl.map(block), [
    ['Why do parameter names show as arg0?', 'The class was compiled without -parameters, so the names were not stored.'],
]);

// ---- 16. Nashorn ----
const nas: Sub[] = [
    ['Introduction to Nashorn', 'A JavaScript engine inside the JDK. Added in Java 8, deprecated in Java 11 and removed in Java 15.',
`ScriptEngine engine = new ScriptEngineManager().getEngineByName("nashorn");
System.out.println(engine != null ? "Nashorn available (Java 8-14)" : "Not available (Java 15+)");
// OUTPUT: Nashorn available (Java 8-14)`],
    ['ScriptEngineManager', 'Finds script engines by name.',
`ScriptEngineManager manager = new ScriptEngineManager();
ScriptEngine js = manager.getEngineByName("nashorn");
System.out.println(js.getFactory().getLanguageName());
// OUTPUT: ECMAScript`],
    ['Executing JavaScript from Java', '<code>eval</code> runs a script string.',
`ScriptEngine js = new ScriptEngineManager().getEngineByName("nashorn");
js.eval("print('Hello from JavaScript')");
// OUTPUT: Hello from JavaScript`],
    ['Evaluating JavaScript Expressions', '<code>eval</code> returns the value of the expression.',
`ScriptEngine js = new ScriptEngineManager().getEngineByName("nashorn");
Object result = js.eval("6 * 7");
System.out.println(result);
// OUTPUT: 42`],
    ['Java and JavaScript Interoperability', 'Pass Java values in with <code>put</code>, call JavaScript functions with <code>Invocable</code>, and use Java classes from the script.',
`ScriptEngine js = new ScriptEngineManager().getEngineByName("nashorn");
js.eval("function greet(n) { return 'Hi ' + n + ' ' + java.lang.Math.max(3, 9); }");
Object r = ((Invocable) js).invokeFunction("greet", "Asha");
System.out.println(r);
// OUTPUT: Hi Asha 9`],
];
export const java8Nashorn = topic('java8-complete-nashorn', 'Java 8 Complete: Nashorn JavaScript Engine', nas.map(block), [
    ['Can you use Nashorn on Java 17?', 'No. It was removed in Java 15. Use GraalVM JavaScript as a replacement.'],
]);

// ---- 17. Spliterator ----
const spl: Sub[] = [
    ['Introduction to Spliterator', 'Traverses elements like an iterator and can also split itself in two, so a stream can work in parallel.',
`Spliterator<String> sp = Arrays.asList("a", "b", "c").spliterator();
System.out.println(sp.estimateSize());
// OUTPUT: 3`],
    ['tryAdvance()', 'Processes one element if there is one. Returns <code>false</code> when finished.',
`Spliterator<String> sp = Arrays.asList("a", "b").spliterator();
sp.tryAdvance(System.out::println);
sp.tryAdvance(System.out::println);
System.out.println(sp.tryAdvance(System.out::println));
// OUTPUT:
// a
// b
// false`],
    ['forEachRemaining()', 'Processes everything that is left.',
`Spliterator<Integer> sp = Arrays.asList(1, 2, 3).spliterator();
sp.tryAdvance(n -> {});
sp.forEachRemaining(System.out::println);
// OUTPUT:
// 2
// 3`],
    ['trySplit()', 'Hands back a new Spliterator for about half of the elements, or <code>null</code>.',
`Spliterator<Integer> right = Arrays.asList(1, 2, 3, 4).spliterator();
Spliterator<Integer> left = right.trySplit();
left.forEachRemaining(n -> System.out.print(n + " "));
System.out.print("| ");
right.forEachRemaining(n -> System.out.print(n + " "));
// OUTPUT: 1 2 | 3 4`],
    ['estimateSize()', 'An estimate of how many elements remain.',
`Spliterator<Integer> sp = Arrays.asList(1, 2, 3, 4).spliterator();
sp.trySplit();
System.out.println(sp.estimateSize());
// OUTPUT: 2`],
    ['characteristics()', 'A bit mask describing the source, tested with <code>hasCharacteristics</code>.',
`Spliterator<Integer> sp = new ArrayList<>(Arrays.asList(1, 2)).spliterator();
System.out.println((sp.characteristics() & Spliterator.ORDERED) != 0);
// OUTPUT: true`],
    ['ORDERED', 'Elements have a defined encounter order, like a <code>List</code>.',
`System.out.println(Arrays.asList(1).spliterator().hasCharacteristics(Spliterator.ORDERED));
// OUTPUT: true`],
    ['DISTINCT', 'No two elements are equal, like a <code>Set</code>.',
`System.out.println(new HashSet<>(Arrays.asList(1)).spliterator().hasCharacteristics(Spliterator.DISTINCT));
// OUTPUT: true`],
    ['SORTED', 'Elements follow a sort order, like a <code>TreeSet</code>.',
`System.out.println(new TreeSet<>(Arrays.asList(2, 1)).spliterator().hasCharacteristics(Spliterator.SORTED));
// OUTPUT: true`],
    ['SIZED', '<code>estimateSize</code> is an exact count before traversal.',
`System.out.println(Arrays.asList(1, 2).spliterator().hasCharacteristics(Spliterator.SIZED));
// OUTPUT: true`],
    ['NONNULL', 'The source never gives null. Concurrent collections often report it.',
`System.out.println(new ConcurrentLinkedQueue<>(Arrays.asList(1)).spliterator().hasCharacteristics(Spliterator.NONNULL));
// OUTPUT: true`],
    ['IMMUTABLE', 'The source cannot be changed structurally while traversing.',
`System.out.println(new CopyOnWriteArrayList<>(Arrays.asList(1)).spliterator().hasCharacteristics(Spliterator.IMMUTABLE));
// OUTPUT: true`],
    ['CONCURRENT', 'The source can be changed safely by other threads while traversing.',
`System.out.println(new ConcurrentLinkedQueue<>(Arrays.asList(1)).spliterator().hasCharacteristics(Spliterator.CONCURRENT));
// OUTPUT: true`],
    ['SUBSIZED', 'Every piece made by <code>trySplit</code> is also SIZED.',
`Spliterator<Integer> sp = Arrays.asList(1, 2, 3, 4).spliterator();
System.out.println(sp.hasCharacteristics(Spliterator.SUBSIZED));
// OUTPUT: true`],
    ['Spliterator vs Iterator', 'An Iterator goes one by one. A Spliterator can also split for parallel work and reports characteristics.',
`Iterator<Integer> it = Arrays.asList(1, 2, 3, 4).iterator();       // hasNext / next only
Spliterator<Integer> sp = Arrays.asList(1, 2, 3, 4).spliterator(); // can also trySplit
System.out.println(sp.trySplit() != null);
// OUTPUT: true`],
    ['Spliterator in Parallel Processing', 'A parallel stream keeps calling <code>trySplit</code> until the pieces are small, then runs them on different threads.',
`List<Integer> nums = IntStream.rangeClosed(1, 10_000).boxed().collect(Collectors.toList());
System.out.println(nums.parallelStream().mapToInt(Integer::intValue).sum());
// OUTPUT: 50005000`],
];
export const java8Spliterator = topic('java8-complete-spliterator', 'Java 8 Complete: Spliterator', spl.map(block), [
    ['Spliterator vs Iterator?', 'Iterator traverses sequentially. Spliterator can split off part of its data for parallel traversal and describes the source with characteristics.'],
]);

// ---- 18. Other important topics ----
const oth: Sub[] = [
    ['Effectively Final Variables', 'A local variable that is assigned once is effectively final even without the <code>final</code> keyword.',
`int limit = 10;   // never reassigned
Predicate<Integer> small = n -> n < limit;
System.out.println(small.test(5));
// OUTPUT: true`],
    ['Functional Programming Concepts', 'Pure functions, no shared mutable state, and functions as values.',
`Function<Integer, Integer> doubleIt = n -> n * 2;   // pure: same input, same output, no side effects
System.out.println(doubleIt.apply(4) + " " + doubleIt.apply(4));
// OUTPUT: 8 8`],
    ['Higher-Order Functions', 'Functions that take functions or return functions.',
`static Function<Integer, Integer> multiplier(int by) { return n -> n * by; }   // returns a function
System.out.println(multiplier(3).apply(5));
System.out.println(Stream.of(1, 2).map(multiplier(10)).collect(Collectors.toList()));   // takes a function
// OUTPUT:
// 15
// [10, 20]`],
    ['Immutable Objects', 'Objects that cannot change after creation are safe to share between threads, and stream-friendly.',
`final class Point {
    private final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    Point withX(int nx) { return new Point(nx, y); }   // returns a new object
    public String toString() { return x + "," + y; }
}
Point p = new Point(1, 2);
System.out.println(p.withX(9) + " " + p);
// OUTPUT: 9,2 1,2`],
    ['Internal vs External Iteration', 'External: you write the loop. Internal: the library loops and you pass the action.',
`List<Integer> nums = Arrays.asList(1, 2, 3);
for (int n : nums) System.out.print(n);   // external
nums.forEach(System.out::print);          // internal
// OUTPUT: 123123`],
    ['Declarative vs Imperative Programming', 'Imperative says how. Declarative says what.',
`List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);
int imperative = 0;
for (int n : nums) if (n % 2 == 0) imperative += n;
int declarative = nums.stream().filter(n -> n % 2 == 0).mapToInt(n -> n).sum();
System.out.println(imperative + " " + declarative);
// OUTPUT: 12 12`],
    ['Parallel Processing', 'Use <code>parallelStream()</code> for large, independent, CPU-bound work.',
`long count = IntStream.rangeClosed(1, 100_000).parallel().filter(n -> n % 3 == 0).count();
System.out.println(count);
// OUTPUT: 33333`],
    ['Fork/Join Framework', 'Splits a big task into subtasks (fork) and joins their results. Parallel streams use it internally.',
`class SumTask extends RecursiveTask<Long> {
    final int[] a; final int lo, hi;
    SumTask(int[] a, int lo, int hi) { this.a = a; this.lo = lo; this.hi = hi; }
    protected Long compute() {
        if (hi - lo <= 1000) { long s = 0; for (int i = lo; i < hi; i++) s += a[i]; return s; }
        int mid = (lo + hi) / 2;
        SumTask left = new SumTask(a, lo, mid), right = new SumTask(a, mid, hi);
        left.fork();                       // run left in another thread
        return right.compute() + left.join();
    }
}
int[] data = IntStream.rangeClosed(1, 10_000).toArray();
System.out.println(new ForkJoinPool().invoke(new SumTask(data, 0, data.length)));
// OUTPUT: 50005000`],
    ['Common ForkJoinPool', 'Parallel streams and <code>CompletableFuture</code> share one pool, sized to the CPU count minus one.',
`System.out.println(ForkJoinPool.commonPool().getParallelism() >= 1);
// OUTPUT: true`],
    ['Primitive Type Specializations', '<code>IntStream</code>, <code>IntPredicate</code>, <code>ToIntFunction</code> and others avoid boxing.',
`ToIntFunction<String> len = String::length;
IntBinaryOperator add = (a, b) -> a + b;
System.out.println(add.applyAsInt(len.applyAsInt("abc"), 4));
// OUTPUT: 7`],
    ['Functional Composition', 'Build a bigger behavior from small functions.',
`Function<String, String> trim = String::trim;
Function<String, String> upper = String::toUpperCase;
Function<String, Integer> length = String::length;
Function<String, Integer> pipeline = trim.andThen(upper).andThen(length);
System.out.println(pipeline.apply("  java  "));
// OUTPUT: 4`],
];
export const java8Other = topic('java8-complete-other-topics', 'Java 8 Complete: Other Important Topics', oth.map(block), [
    ['Internal vs external iteration?', 'External: you control the loop (for, iterator). Internal: the library iterates and calls your code, so it can optimize or parallelize.'],
    ['What is a higher-order function?', 'A function that takes another function as a parameter or returns one.'],
]);
