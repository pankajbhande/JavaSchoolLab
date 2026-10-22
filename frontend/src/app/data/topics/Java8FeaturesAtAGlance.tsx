import { Topic } from '../coreJava';

// All 40 headline Java 8 features, one short example each. Every snippet is a fragment: put it inside main() (imports shown where needed).
export const java8FeaturesAtAGlance: Topic = {
    id: 'java8-features-at-a-glance',
    name: 'Java 8 Features at a Glance',
    beginner: [
        {
            content: `<h3>1. Lambda Expressions</h3>
Write concise implementations of functional interfaces.<br>`,
            codeExamples: [
                `Runnable r = () -> System.out.println("Hello Lambda");
r.run();
// OUTPUT: Hello Lambda`
            ]
        },
        {
            content: `<h3>2. Functional Interfaces</h3>
Interfaces containing exactly one abstract method.<br>`,
            codeExamples: [
                `interface Greeter { String greet(String name); }

Greeter g = n -> "Hi " + n;
System.out.println(g.greet("Asha"));
// OUTPUT: Hi Asha`
            ]
        },
        {
            content: `<h3>3. @FunctionalInterface</h3>
Annotation to validate functional interfaces at compile time.<br>`,
            codeExamples: [
                `@FunctionalInterface
interface Calc { int apply(int a, int b); }
// Adding a second abstract method here would be a compile error.

Calc add = (a, b) -> a + b;
System.out.println(add.apply(2, 3));
// OUTPUT: 5`
            ]
        },
        {
            content: `<h3>4. Stream API</h3>
Process collections using functional-style operations.<br>`,
            codeExamples: [
                `import java.util.*;

List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);
int sumOfEvenSquares = nums.stream().filter(n -> n % 2 == 0).mapToInt(n -> n * n).sum();
System.out.println(sumOfEvenSquares);
// OUTPUT: 56`
            ]
        },
        {
            content: `<h3>5. Method References</h3>
Refer to existing methods using <code>::</code> syntax.<br>`,
            codeExamples: [
                `import java.util.*;

List<String> cities = Arrays.asList("Pune", "Delhi");
cities.forEach(System.out::println);
// OUTPUT:
// Pune
// Delhi`
            ]
        },
        {
            content: `<h3>6. Constructor References</h3>
Refer to constructors using <code>ClassName::new</code>.<br>`,
            codeExamples: [
                `import java.util.*;
import java.util.function.Supplier;

Supplier<List<String>> maker = ArrayList::new;
List<String> list = maker.get();
list.add("fort");
System.out.println(list);
// OUTPUT: [fort]`
            ]
        },
        {
            content: `<h3>7. Default Methods</h3>
Define methods with implementations inside interfaces.<br>`,
            codeExamples: [
                `interface Vehicle {
    default String start() { return "Engine started"; }
}
class Car implements Vehicle {}

System.out.println(new Car().start());
// OUTPUT: Engine started`
            ]
        },
        {
            content: `<h3>8. Static Methods in Interfaces</h3>
Define static methods inside interfaces.<br>`,
            codeExamples: [
                `interface MathUtil {
    static int square(int x) { return x * x; }
}

System.out.println(MathUtil.square(6));
// OUTPUT: 36`
            ]
        },
        {
            content: `<h3>9. Optional Class</h3>
Handle potentially absent values more safely.<br>`,
            codeExamples: [
                `import java.util.Optional;

Optional<String> name = Optional.ofNullable(null);
System.out.println(name.orElse("Guest"));
// OUTPUT: Guest`
            ]
        },
        {
            content: `<h3>10. New Date and Time API</h3>
Use <code>java.time</code> classes for date and time operations.<br>`,
            codeExamples: [
                `import java.time.LocalDate;

LocalDate d = LocalDate.of(2024, 1, 31).plusDays(1);
System.out.println(d);
// OUTPUT: 2024-02-01`
            ]
        },
        {
            content: `<h3>11. Collectors API</h3>
Collect stream results into lists, sets, maps, and grouped data.<br>`,
            codeExamples: [
                `import java.util.*;
import java.util.stream.Collectors;

List<String> words = Arrays.asList("fox", "owl", "bear");
System.out.println(words.stream().collect(Collectors.groupingBy(String::length)));
// OUTPUT: {3=[fox, owl], 4=[bear]}`
            ]
        },
        {
            content: `<h3>12. Parallel Streams</h3>
Process stream elements in parallel.<br>`,
            codeExamples: [
                `import java.util.stream.IntStream;

long total = IntStream.rangeClosed(1, 100).parallel().sum();
System.out.println(total);
// OUTPUT: 5050`
            ]
        },
        {
            content: `<h3>13. Predicate Functional Interface</h3>
Test a condition and return a boolean.<br>`,
            codeExamples: [
                `import java.util.function.Predicate;

Predicate<Integer> isAdult = age -> age >= 18;
System.out.println(isAdult.test(20));
// OUTPUT: true`
            ]
        },
        {
            content: `<h3>14. Function Functional Interface</h3>
Accept input and produce output.<br>`,
            codeExamples: [
                `import java.util.function.Function;

Function<String, Integer> length = String::length;
System.out.println(length.apply("lambda"));
// OUTPUT: 6`
            ]
        },
        {
            content: `<h3>15. Consumer Functional Interface</h3>
Accept input and perform an operation without returning a result.<br>`,
            codeExamples: [
                `import java.util.function.Consumer;

Consumer<String> shout = s -> System.out.println(s.toUpperCase());
shout.accept("hello");
// OUTPUT: HELLO`
            ]
        },
        {
            content: `<h3>16. Supplier Functional Interface</h3>
Supply a value without accepting input.<br>`,
            codeExamples: [
                `import java.util.function.Supplier;

Supplier<Double> pi = () -> 3.14;
System.out.println(pi.get());
// OUTPUT: 3.14`
            ]
        },
        {
            content: `<h3>17. BiPredicate</h3>
Test a condition using two inputs.<br>`,
            codeExamples: [
                `import java.util.function.BiPredicate;

BiPredicate<String, Integer> longer = (s, n) -> s.length() > n;
System.out.println(longer.test("Pune", 3));
// OUTPUT: true`
            ]
        },
        {
            content: `<h3>18. BiFunction</h3>
Accept two inputs and produce an output.<br>`,
            codeExamples: [
                `import java.util.function.BiFunction;

BiFunction<Integer, Integer, Integer> multiply = (a, b) -> a * b;
System.out.println(multiply.apply(4, 5));
// OUTPUT: 20`
            ]
        },
        {
            content: `<h3>19. BiConsumer</h3>
Accept two inputs and perform an operation.<br>`,
            codeExamples: [
                `import java.util.function.BiConsumer;

BiConsumer<String, Integer> show = (k, v) -> System.out.println(k + "=" + v);
show.accept("fort", 7);
// OUTPUT: fort=7`
            ]
        },
        {
            content: `<h3>20. UnaryOperator</h3>
Accept and return the same type.<br>`,
            codeExamples: [
                `import java.util.function.UnaryOperator;

UnaryOperator<String> trim = String::trim;
System.out.println("[" + trim.apply("  hi  ") + "]");
// OUTPUT: [hi]`
            ]
        },
        {
            content: `<h3>21. BinaryOperator</h3>
Accept two values of the same type and return that type.<br>`,
            codeExamples: [
                `import java.util.function.BinaryOperator;

BinaryOperator<Integer> max = BinaryOperator.maxBy(Integer::compare);
System.out.println(max.apply(8, 3));
// OUTPUT: 8`
            ]
        },
        {
            content: `<h3>22. forEach()</h3>
Iterate over collection or stream elements.<br>`,
            codeExamples: [
                `import java.util.*;

List<Integer> nums = Arrays.asList(1, 2, 3);
nums.forEach(n -> System.out.print(n * 10 + " "));
// OUTPUT: 10 20 30`
            ]
        },
        {
            content: `<h3>23. removeIf()</h3>
Remove collection elements matching a condition.<br>`,
            codeExamples: [
                `import java.util.*;

List<Integer> nums = new ArrayList<>(Arrays.asList(1, 2, 3, 4));
nums.removeIf(n -> n % 2 == 0);
System.out.println(nums);
// OUTPUT: [1, 3]`
            ]
        },
        {
            content: `<h3>24. replaceAll()</h3>
Replace collection elements using an operator.<br>`,
            codeExamples: [
                `import java.util.*;

List<String> names = new ArrayList<>(Arrays.asList("ann", "bob"));
names.replaceAll(String::toUpperCase);
System.out.println(names);
// OUTPUT: [ANN, BOB]`
            ]
        },
        {
            content: `<h3>25. sort()</h3>
Sort lists using a comparator.<br>`,
            codeExamples: [
                `import java.util.*;

List<String> names = new ArrayList<>(Arrays.asList("Raj", "Amit", "Zoya"));
names.sort(Comparator.comparing(String::length));
System.out.println(names);
// OUTPUT: [Raj, Amit, Zoya]`
            ]
        },
        {
            content: `<h3>26. Map.forEach()</h3>
Iterate over map entries using a <code>BiConsumer</code>.<br>`,
            codeExamples: [
                `import java.util.*;

Map<String, Integer> m = new LinkedHashMap<>();
m.put("Pune", 1);
m.put("Delhi", 2);
m.forEach((k, v) -> System.out.println(k + " -> " + v));
// OUTPUT:
// Pune -> 1
// Delhi -> 2`
            ]
        },
        {
            content: `<h3>27. Map.computeIfAbsent()</h3>
Compute and add a value if a key is absent.<br>`,
            codeExamples: [
                `import java.util.*;

Map<String, List<String>> forts = new HashMap<>();
forts.computeIfAbsent("Maharashtra", k -> new ArrayList<>()).add("Raigad");
System.out.println(forts);
// OUTPUT: {Maharashtra=[Raigad]}`
            ]
        },
        {
            content: `<h3>28. Map.computeIfPresent()</h3>
Recompute a value if a key exists.<br>`,
            codeExamples: [
                `import java.util.*;

Map<String, Integer> stock = new HashMap<>();
stock.put("pen", 10);
stock.computeIfPresent("pen", (k, v) -> v + 5);
stock.computeIfPresent("book", (k, v) -> v + 5);   // absent: nothing happens
System.out.println(stock);
// OUTPUT: {pen=15}`
            ]
        },
        {
            content: `<h3>29. Map.getOrDefault()</h3>
Return a default value when a key is absent.<br>`,
            codeExamples: [
                `import java.util.*;

Map<String, Integer> m = new HashMap<>();
m.put("a", 1);
System.out.println(m.getOrDefault("z", 0));
// OUTPUT: 0`
            ]
        },
        {
            content: `<h3>30. Map.merge()</h3>
Merge a new value with an existing value.<br>`,
            codeExamples: [
                `import java.util.*;

Map<String, Integer> count = new HashMap<>();
for (String w : "a b a".split(" ")) count.merge(w, 1, Integer::sum);
System.out.println(count);
// OUTPUT: {a=2, b=1}`
            ]
        },
        {
            content: `<h3>31. CompletableFuture Improvements</h3>
Support asynchronous and non-blocking task composition.<br>`,
            codeExamples: [
                `import java.util.concurrent.CompletableFuture;

String result = CompletableFuture.supplyAsync(() -> "async")
        .thenApply(s -> s + " done")
        .join();
System.out.println(result);
// OUTPUT: async done`
            ]
        },
        {
            content: `<h3>32. Base64 API</h3>
Encode and decode Base64 data.<br>`,
            codeExamples: [
                `import java.util.Base64;

String enc = Base64.getEncoder().encodeToString("Java".getBytes());
System.out.println(enc + " -> " + new String(Base64.getDecoder().decode(enc)));
// OUTPUT: SmF2YQ== -> Java`
            ]
        },
        {
            content: `<h3>33. Nashorn JavaScript Engine</h3>
Execute JavaScript from Java; deprecated in Java 11 and removed in Java 15.<br>`,
            codeExamples: [
                `import javax.script.*;

// Works only on Java 8 to 14
ScriptEngine js = new ScriptEngineManager().getEngineByName("nashorn");
System.out.println(js.eval("6 * 7"));   // throws ScriptException
// OUTPUT: 42`
            ]
        },
        {
            content: `<h3>34. Repeating Annotations</h3>
Apply the same annotation multiple times to a declaration.<br>`,
            codeExamples: [
                `import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME) @interface Roles { Role[] value(); }
@Retention(RetentionPolicy.RUNTIME) @Repeatable(Roles.class) @interface Role { String value(); }

@Role("admin") @Role("user")
class Account {}

System.out.println(Account.class.getAnnotationsByType(Role.class).length);
// OUTPUT: 2`
            ]
        },
        {
            content: `<h3>35. Type Annotations</h3>
Apply annotations to types and type uses.<br>`,
            codeExamples: [
                `import java.lang.annotation.*;
import java.util.*;

@Target(ElementType.TYPE_USE) @interface NonNull {}

List<@NonNull String> names = new ArrayList<>();   // annotates the type argument
names.add("Asha");
System.out.println(names);
// OUTPUT: [Asha]`
            ]
        },
        {
            content: `<h3>36. Method Parameter Reflection</h3>
Retrieve method parameter names when compiled with <code>-parameters</code>.<br>`,
            codeExamples: [
                `import java.lang.reflect.*;

// compile with: javac -parameters Demo.java
Method m = Demo.class.getMethod("add", int.class, int.class);
for (Parameter p : m.getParameters()) System.out.print(p.getName() + " ");
// OUTPUT: first second   (without -parameters: arg0 arg1)`
            ]
        },
        {
            content: `<h3>37. StringJoiner</h3>
Join strings using delimiters, prefixes, and suffixes.<br>`,
            codeExamples: [
                `import java.util.StringJoiner;

StringJoiner sj = new StringJoiner(", ", "[", "]");
sj.add("red").add("green");
System.out.println(sj);
// OUTPUT: [red, green]`
            ]
        },
        {
            content: `<h3>38. Arrays Parallel Sort</h3>
Sort arrays using parallel processing.<br>`,
            codeExamples: [
                `import java.util.Arrays;

int[] a = {5, 2, 9, 1};
Arrays.parallelSort(a);
System.out.println(Arrays.toString(a));
// OUTPUT: [1, 2, 5, 9]`
            ]
        },
        {
            content: `<h3>39. Spliterator</h3>
Support traversal and partitioning of elements, including for parallel processing.<br>`,
            codeExamples: [
                `import java.util.*;

Spliterator<Integer> first = Arrays.asList(1, 2, 3, 4).spliterator();
Spliterator<Integer> second = first.trySplit();   // splits the data into two halves
second.forEachRemaining(n -> System.out.print(n + " "));
// OUTPUT: 1 2`
            ]
        },
        {
            content: `<h3>40. IntStream, LongStream, DoubleStream</h3>
Process primitive numeric values efficiently, with no boxing.<br>`,
            codeExamples: [
                `import java.util.stream.*;

System.out.println(IntStream.range(1, 5).sum());
System.out.println(DoubleStream.of(1.5, 2.5).average().getAsDouble());
// OUTPUT:
// 10
// 2.0`
            ]
        }
    ]
};
