import { block, group, topic, type Sub } from './kit';

const A: Sub[] = [
    ['Introduction to Streams', 'A stream is a sequence of elements that supports pipelines of operations. It does not store data and does not change its source.',
`List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5);
System.out.println(nums.stream().filter(n -> n > 2).count());
System.out.println(nums);   // source unchanged
// OUTPUT:
// 3
// [1, 2, 3, 4, 5]`],
    ['Creating Streams', 'Streams come from collections, arrays, values, generators and files.',
`Stream<String> s1 = Arrays.asList("a", "b").stream();
Stream<String> s2 = Stream.of("c", "d");
Stream<Integer> s3 = Stream.iterate(1, n -> n * 2).limit(4);
Stream<Double> s4 = Stream.generate(() -> 1.5).limit(2);
System.out.println(s3.collect(Collectors.toList()));
// OUTPUT: [1, 2, 4, 8]`],
    ['Stream from Collections', 'Every <code>Collection</code> has <code>stream()</code> and <code>parallelStream()</code>.',
`Set<String> forts = new TreeSet<>(Arrays.asList("Torna", "Raigad"));
forts.stream().forEach(System.out::println);
// OUTPUT:
// Raigad
// Torna`],
    ['Stream from Arrays', '<code>Arrays.stream(array)</code> works for objects and primitives, and takes a range.',
`int[] marks = {40, 55, 90, 72};
System.out.println(Arrays.stream(marks).sum());
System.out.println(Arrays.stream(marks, 1, 3).sum());   // indexes 1 and 2
// OUTPUT:
// 257
// 145`],
    ['Stream from Values: Stream.of()', 'Build a stream from a list of values.',
`Stream.of("Pune", "Nashik", "Satara").forEach(System.out::println);
// OUTPUT:
// Pune
// Nashik
// Satara`],
    ['Empty Streams', '<code>Stream.empty()</code> is a safe return value instead of null.',
`Stream<String> none = Stream.empty();
System.out.println(none.count());
// OUTPUT: 0`],
    ['Stream from Files', '<code>Files.lines</code> reads a file lazily, one line per element. Close it with try-with-resources.',
`try (Stream<String> lines = Files.lines(Paths.get("cities.txt"))) {
    lines.filter(l -> !l.isEmpty()).forEach(System.out::println);
} catch (IOException e) {
    e.printStackTrace();
}
// OUTPUT: every non-empty line of cities.txt`],
    ['Stream Pipeline', 'A pipeline is source, then zero or more intermediate operations, then one terminal operation.',
`List<String> result = Stream.of("pune", "delhi", "goa")   // source
        .filter(c -> c.length() > 3)                       // intermediate
        .map(String::toUpperCase)                          // intermediate
        .collect(Collectors.toList());                     // terminal
System.out.println(result);
// OUTPUT: [PUNE, DELHI]`],
    ['Lazy Evaluation', 'Intermediate operations do nothing until a terminal operation runs.',
`Stream<Integer> s = Stream.of(1, 2, 3).peek(n -> System.out.println("seen " + n));
System.out.println("no terminal yet");
s.collect(Collectors.toList());   // the terminal operation starts the work
// OUTPUT:
// no terminal yet
// seen 1
// seen 2
// seen 3`],
    ['Stream Characteristics', 'A stream can be ORDERED, DISTINCT, SORTED or SIZED, depending on its source.',
`Spliterator<Integer> sp = new TreeSet<>(Arrays.asList(3, 1, 2)).spliterator();
System.out.println(sp.hasCharacteristics(Spliterator.SORTED));
System.out.println(sp.hasCharacteristics(Spliterator.DISTINCT));
// OUTPUT:
// true
// true`],
    ['Stream vs Collection', 'A collection stores elements and can be reused. A stream computes elements on demand and is used once.',
`List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3));
list.add(4);                                  // a collection stores data and can change
Stream<Integer> stream = list.stream();       // a stream only describes a computation
System.out.println(stream.map(n -> n * 2).collect(Collectors.toList()));
// OUTPUT: [2, 4, 6, 8]`],
    ['Stream Reusability', 'A stream cannot be used after a terminal operation.',
`Stream<String> s = Stream.of("a", "b");
s.count();
s.count();   // IllegalStateException: stream has already been operated upon or closed
// OUTPUT: java.lang.IllegalStateException`],
];

const B: Sub[] = [
    ['filter()', 'Keeps the elements that satisfy a <code>Predicate</code>.',
`System.out.println(Stream.of(1, 2, 3, 4, 5, 6).filter(n -> n % 2 == 0).collect(Collectors.toList()));
// OUTPUT: [2, 4, 6]`],
    ['map()', 'Turns each element into one new element.',
`System.out.println(Stream.of("fort", "city").map(String::length).collect(Collectors.toList()));
// OUTPUT: [4, 4]`],
    ['flatMap()', 'Turns each element into a stream and joins them into one.',
`List<List<String>> groups = Arrays.asList(Arrays.asList("a", "b"), Arrays.asList("c"));
System.out.println(groups.stream().flatMap(List::stream).collect(Collectors.toList()));
// OUTPUT: [a, b, c]`],
    ['distinct()', 'Removes duplicates using <code>equals</code>.',
`System.out.println(Stream.of(1, 2, 2, 3, 1).distinct().collect(Collectors.toList()));
// OUTPUT: [1, 2, 3]`],
    ['sorted()', 'Sorts in natural order, or with a <code>Comparator</code>.',
`System.out.println(Stream.of(3, 1, 2).sorted().collect(Collectors.toList()));
System.out.println(Stream.of(3, 1, 2).sorted(Comparator.reverseOrder()).collect(Collectors.toList()));
// OUTPUT:
// [1, 2, 3]
// [3, 2, 1]`],
    ['limit()', 'Keeps the first n elements. It also stops an infinite stream.',
`System.out.println(Stream.iterate(1, n -> n + 1).limit(5).collect(Collectors.toList()));
// OUTPUT: [1, 2, 3, 4, 5]`],
    ['skip()', 'Drops the first n elements.',
`System.out.println(Stream.of(1, 2, 3, 4, 5).skip(3).collect(Collectors.toList()));
// OUTPUT: [4, 5]`],
    ['peek()', 'Runs an action on each element as it passes, mainly for debugging.',
`List<Integer> out = Stream.of(1, 2, 3)
        .peek(n -> System.out.println("before " + n))
        .map(n -> n * 10)
        .collect(Collectors.toList());
System.out.println(out);
// OUTPUT:
// before 1
// before 2
// before 3
// [10, 20, 30]`],
    ['mapToInt()', 'Maps to an <code>IntStream</code> so you can use <code>sum</code> and <code>average</code>.',
`System.out.println(Stream.of("a", "bb", "ccc").mapToInt(String::length).sum());
// OUTPUT: 6`],
    ['mapToLong()', 'Maps to a <code>LongStream</code>.',
`System.out.println(Stream.of(1, 2, 3).mapToLong(n -> n * 1_000_000_000L).sum());
// OUTPUT: 6000000000`],
    ['mapToDouble()', 'Maps to a <code>DoubleStream</code>.',
`System.out.println(Stream.of(10, 20).mapToDouble(n -> n * 1.5).sum());
// OUTPUT: 45.0`],
    ['boxed()', 'Turns a primitive stream back into a stream of objects.',
`List<Integer> list = IntStream.rangeClosed(1, 3).boxed().collect(Collectors.toList());
System.out.println(list);
// OUTPUT: [1, 2, 3]`],
];

const C: Sub[] = [
    ['forEach()', 'Runs an action on each element. Order is not guaranteed on a parallel stream.',
`Stream.of("a", "b", "c").forEach(System.out::print);
// OUTPUT: abc`],
    ['forEachOrdered()', 'Runs the action in encounter order, even on a parallel stream.',
`IntStream.rangeClosed(1, 5).parallel().forEachOrdered(System.out::print);
// OUTPUT: 12345`],
    ['collect()', 'Gathers the elements into a collection or a summary.',
`Set<String> set = Stream.of("a", "b", "a").collect(Collectors.toSet());
System.out.println(set);
// OUTPUT: [a, b]`],
    ['toArray()', 'Collects into an array. Pass a constructor reference to get the right type.',
`String[] arr = Stream.of("a", "b").toArray(String[]::new);
System.out.println(arr.length + " " + arr[1]);
// OUTPUT: 2 b`],
    ['reduce()', 'Combines all elements into one value.',
`System.out.println(Stream.of(1, 2, 3, 4).reduce(0, Integer::sum));
System.out.println(Stream.of(1, 2, 3, 4).reduce(Integer::max).get());
// OUTPUT:
// 10
// 4`],
    ['count()', 'Returns the number of elements as a <code>long</code>.',
`System.out.println(Stream.of("a", "b", "c").count());
// OUTPUT: 3`],
    ['min()', 'Smallest element by a <code>Comparator</code>, as an <code>Optional</code>.',
`System.out.println(Stream.of(5, 2, 8).min(Integer::compare).get());
// OUTPUT: 2`],
    ['max()', 'Largest element by a <code>Comparator</code>, as an <code>Optional</code>.',
`System.out.println(Stream.of(5, 2, 8).max(Integer::compare).get());
// OUTPUT: 8`],
    ['anyMatch()', 'True if at least one element matches. Stops at the first match.',
`System.out.println(Stream.of(1, 2, 3).anyMatch(n -> n > 2));
// OUTPUT: true`],
    ['allMatch()', 'True only if every element matches.',
`System.out.println(Stream.of(2, 4, 6).allMatch(n -> n % 2 == 0));
// OUTPUT: true`],
    ['noneMatch()', 'True if no element matches.',
`System.out.println(Stream.of(1, 3, 5).noneMatch(n -> n % 2 == 0));
// OUTPUT: true`],
    ['findFirst()', 'The first element, as an <code>Optional</code>. Respects order.',
`System.out.println(Stream.of("x", "y").findFirst().get());
// OUTPUT: x`],
    ['findAny()', 'Any element, as an <code>Optional</code>. Cheaper on parallel streams.',
`System.out.println(Stream.of("x", "y").findAny().isPresent());
// OUTPUT: true`],
];

const D: Sub[] = [
    ['Collectors.toList()', 'Collects into a <code>List</code>.',
`System.out.println(Stream.of("a", "b").collect(Collectors.toList()));
// OUTPUT: [a, b]`],
    ['Collectors.toSet()', 'Collects into a <code>Set</code>, dropping duplicates.',
`System.out.println(Stream.of(1, 1, 2).collect(Collectors.toSet()));
// OUTPUT: [1, 2]`],
    ['Collectors.toMap()', 'Collects into a <code>Map</code>. Duplicate keys throw unless you pass a merge function.',
`Map<String, Integer> m = Stream.of("fox", "bear").collect(Collectors.toMap(s -> s, String::length));
System.out.println(m.get("fox") + " " + m.get("bear"));
Map<Integer, String> byLen = Stream.of("fox", "owl").collect(Collectors.toMap(String::length, s -> s, (a, b) -> a + "," + b));
System.out.println(byLen);
// OUTPUT:
// 3 4
// {3=fox,owl}`],
    ['Collectors.toCollection()', 'Collects into a collection type you choose.',
`TreeSet<String> sorted = Stream.of("b", "a", "c").collect(Collectors.toCollection(TreeSet::new));
System.out.println(sorted);
// OUTPUT: [a, b, c]`],
    ['Collectors.joining()', 'Joins strings, with an optional delimiter, prefix and suffix.',
`System.out.println(Stream.of("a", "b", "c").collect(Collectors.joining(", ", "[", "]")));
// OUTPUT: [a, b, c]`],
    ['Collectors.groupingBy()', 'Groups elements into a <code>Map</code> by a key function.',
`System.out.println(Stream.of("fox", "owl", "bear").collect(Collectors.groupingBy(String::length)));
// OUTPUT: {3=[fox, owl], 4=[bear]}`],
    ['Collectors.partitioningBy()', 'Splits into exactly two groups: <code>true</code> and <code>false</code>.',
`System.out.println(Stream.of(1, 2, 3, 4).collect(Collectors.partitioningBy(n -> n % 2 == 0)));
// OUTPUT: {false=[1, 3], true=[2, 4]}`],
    ['Collectors.counting()', 'Counts elements. Mostly used as a downstream collector.',
`System.out.println(Stream.of("a", "b", "a").collect(Collectors.groupingBy(s -> s, Collectors.counting())));
// OUTPUT: {a=2, b=1}`],
    ['Collectors.summingInt()', 'Sums an int value taken from each element.',
`System.out.println(Stream.of("a", "bb", "ccc").collect(Collectors.summingInt(String::length)));
// OUTPUT: 6`],
    ['Collectors.averagingInt()', 'Average of an int value, as a <code>Double</code>.',
`System.out.println(Stream.of(10, 20, 40).collect(Collectors.averagingInt(n -> n)));
// OUTPUT: 23.333333333333332`],
    ['Collectors.summarizingInt()', 'Count, sum, min, average and max in one pass.',
`IntSummaryStatistics st = Stream.of(10, 20, 30).collect(Collectors.summarizingInt(n -> n));
System.out.println(st);
// OUTPUT: IntSummaryStatistics{count=3, sum=60, min=10, average=20.000000, max=30}`],
    ['Collectors.maxBy()', 'The largest element by a comparator, as an <code>Optional</code>.',
`System.out.println(Stream.of(3, 9, 5).collect(Collectors.maxBy(Integer::compare)).get());
// OUTPUT: 9`],
    ['Collectors.minBy()', 'The smallest element by a comparator, as an <code>Optional</code>.',
`System.out.println(Stream.of(3, 9, 5).collect(Collectors.minBy(Integer::compare)).get());
// OUTPUT: 3`],
    ['Collectors.mapping()', 'Transforms elements before they reach a downstream collector.',
`System.out.println(Stream.of("fox", "owl", "bear")
        .collect(Collectors.groupingBy(String::length, Collectors.mapping(String::toUpperCase, Collectors.toList()))));
// OUTPUT: {3=[FOX, OWL], 4=[BEAR]}`],
    ['Collectors.reducing()', 'A reduction used as a downstream collector.',
`System.out.println(Stream.of(1, 2, 3, 4).collect(Collectors.reducing(0, Integer::sum)));
// OUTPUT: 10`],
    ['Collectors.collectingAndThen()', 'Collects, then applies a final function to the result.',
`List<String> fixed = Stream.of("a", "b").collect(Collectors.collectingAndThen(Collectors.toList(), Collections::unmodifiableList));
System.out.println(fixed);
// OUTPUT: [a, b]`],
];

const E: Sub[] = [
    ['IntStream', 'A stream of primitive <code>int</code> values, with no boxing.',
`IntStream.of(3, 1, 2).sorted().forEach(System.out::print);
// OUTPUT: 123`],
    ['LongStream', 'A stream of primitive <code>long</code> values.',
`System.out.println(LongStream.rangeClosed(1, 15).reduce(1L, (a, b) -> a * b));
// OUTPUT: 1307674368000`],
    ['DoubleStream', 'A stream of primitive <code>double</code> values.',
`System.out.println(DoubleStream.of(1.5, 2.5, 3.0).sum());
// OUTPUT: 7.0`],
    ['range()', 'Numbers from start up to, but not including, end.',
`System.out.println(IntStream.range(0, 5).boxed().collect(Collectors.toList()));
// OUTPUT: [0, 1, 2, 3, 4]`],
    ['rangeClosed()', 'Numbers from start up to and including end.',
`System.out.println(IntStream.rangeClosed(1, 5).sum());
// OUTPUT: 15`],
    ['sum()', 'Adds all values. Empty stream gives 0.',
`System.out.println(IntStream.of(4, 5, 6).sum());
// OUTPUT: 15`],
    ['average()', 'Returns an <code>OptionalDouble</code>, because a stream may be empty.',
`System.out.println(IntStream.of(4, 5, 6).average().getAsDouble());
System.out.println(IntStream.empty().average().isPresent());
// OUTPUT:
// 5.0
// false`],
    ['summaryStatistics()', 'Count, sum, min, average and max together.',
`IntSummaryStatistics st = IntStream.of(4, 8, 6).summaryStatistics();
System.out.println(st.getMin() + " " + st.getMax() + " " + st.getAverage() + " " + st.getCount());
// OUTPUT: 4 8 6.0 3`],
    ['mapToObj()', 'Turns each primitive into an object.',
`System.out.println(IntStream.rangeClosed(1, 3).mapToObj(i -> "Lesson " + i).collect(Collectors.toList()));
// OUTPUT: [Lesson 1, Lesson 2, Lesson 3]`],
    ['boxed()', 'Wraps primitives as <code>Integer</code>, <code>Long</code> or <code>Double</code>.',
`System.out.println(IntStream.of(3, 1, 2).boxed().sorted(Comparator.reverseOrder()).collect(Collectors.toList()));
// OUTPUT: [3, 2, 1]`],
    ['asLongStream()', 'Widens an <code>IntStream</code> to a <code>LongStream</code>, to avoid overflow.',
`System.out.println(IntStream.of(2_000_000_000, 2_000_000_000).asLongStream().sum());
// OUTPUT: 4000000000`],
    ['asDoubleStream()', 'Widens an <code>IntStream</code> or <code>LongStream</code> to a <code>DoubleStream</code>.',
`System.out.println(IntStream.of(1, 2).asDoubleStream().map(d -> d / 2).sum());
// OUTPUT: 1.5`],
];

const F: Sub[] = [
    ['Sequential Streams', 'The default: one thread, encounter order.',
`System.out.println(Stream.of(1, 2, 3).isParallel());
// OUTPUT: false`],
    ['Parallel Streams', 'Split the work across the common ForkJoin pool. Worth it only for large, CPU-bound, independent work.',
`System.out.println(IntStream.rangeClosed(1, 1000).parallel().sum());
// OUTPUT: 500500`],
    ['Short-Circuit Operations', '<code>limit</code>, <code>findFirst</code>, <code>anyMatch</code> and others can stop early, even on an infinite stream.',
`System.out.println(Stream.iterate(1, n -> n + 1).filter(n -> n % 7 == 0).findFirst().get());
// OUTPUT: 7`],
    ['Stateful vs Stateless Operations', '<code>filter</code> and <code>map</code> look at one element. <code>sorted</code> and <code>distinct</code> must remember others.',
`// Stateless: each element is handled alone. Stateful: sorted() has to see all elements first.
System.out.println(Stream.of(3, 1, 2).map(n -> n * 2).sorted().collect(Collectors.toList()));
// OUTPUT: [2, 4, 6]`],
    ['Intermediate vs Terminal Operations', 'Intermediate operations return a stream and are lazy. A terminal operation runs the pipeline and returns a result or nothing.',
`Stream<Integer> lazy = Stream.of(1, 2, 3).map(n -> n * 2);   // nothing computed yet
List<Integer> done = lazy.collect(Collectors.toList());      // terminal: runs now
System.out.println(done);
// OUTPUT: [2, 4, 6]`],
    ['Stream Ordering', 'Ordered sources (List, arrays) keep order. HashSet does not promise any.',
`System.out.println(Stream.of("c", "a", "b").collect(Collectors.toList()));
System.out.println(Stream.of("c", "a", "b").unordered().sorted().collect(Collectors.toList()));
// OUTPUT:
// [c, a, b]
// [a, b, c]`],
    ['Primitive Streams vs Object Streams', 'Primitive streams avoid boxing and offer <code>sum</code> and <code>average</code>.',
`System.out.println(Stream.of(1, 2, 3).mapToInt(Integer::intValue).sum());   // primitive
System.out.println(Stream.of(1, 2, 3).reduce(0, Integer::sum));            // objects, boxing each step
// OUTPUT:
// 6
// 6`],
    ['map() vs flatMap()', '<code>map</code> keeps one output per input (it may nest). <code>flatMap</code> flattens.',
`List<String> lines = Arrays.asList("a b", "c d");
System.out.println(lines.stream().map(l -> l.split(" ")).count());
System.out.println(lines.stream().flatMap(l -> Arrays.stream(l.split(" "))).count());
// OUTPUT:
// 2
// 4`],
    ['reduce() vs collect()', '<code>reduce</code> combines immutable values. <code>collect</code> fills a mutable container such as a list or a map.',
`System.out.println(Stream.of("a", "b").reduce("", String::concat));              // reduce
System.out.println(Stream.of("a", "b").collect(Collectors.joining()));           // collect, faster for strings
// OUTPUT:
// ab
// ab`],
    ['Stream Exception Handling', 'Lambdas cannot throw checked exceptions. Catch inside the lambda.',
`System.out.println(Stream.of("1", "x", "3").map(s -> {
    try { return Integer.parseInt(s); }
    catch (NumberFormatException e) { return -1; }
}).collect(Collectors.toList()));
// OUTPUT: [1, -1, 3]`],
    ['Duplicate Element Handling', '<code>distinct()</code> removes duplicates, <code>toSet()</code> too.',
`System.out.println(Stream.of(1, 2, 2, 3, 3, 3).distinct().count());
// OUTPUT: 3`],
    ['Finding Duplicate Elements', 'Use a <code>Set</code> and <code>filter</code> on <code>add</code> returning false.',
`Set<Integer> seen = new HashSet<>();
System.out.println(Stream.of(1, 2, 2, 3, 3, 3).filter(n -> !seen.add(n)).collect(Collectors.toSet()));
// OUTPUT: [2, 3]`],
    ['Finding Element Frequencies', 'Group by the element and count.',
`System.out.println(Stream.of("a", "b", "a", "c", "a").collect(Collectors.groupingBy(Function.identity(), Collectors.counting())));
// OUTPUT: {a=3, b=1, c=1}`],
    ['Grouping Objects by Properties', 'Group a list of objects by one field.',
`class City { String name, state; City(String n, String s) { name = n; state = s; } String getState() { return state; } String getName() { return name; } }
List<City> cities = Arrays.asList(new City("Pune", "MH"), new City("Nashik", "MH"), new City("Surat", "GJ"));
Map<String, List<String>> byState = cities.stream()
        .collect(Collectors.groupingBy(City::getState, Collectors.mapping(City::getName, Collectors.toList())));
System.out.println(byState);
// OUTPUT: {GJ=[Surat], MH=[Pune, Nashik]}`],
    ['Sorting Objects by Multiple Fields', 'Chain <code>thenComparing</code> for tie-breaks.',
`class City { String name, state; City(String n, String s) { name = n; state = s; } String getState() { return state; } String getName() { return name; } }
List<City> cities = Arrays.asList(new City("Pune", "MH"), new City("Surat", "GJ"), new City("Nashik", "MH"));
cities.stream().sorted(Comparator.comparing(City::getState).thenComparing(City::getName))
        .forEach(c -> System.out.println(c.state + " " + c.name));
// OUTPUT:
// GJ Surat
// MH Nashik
// MH Pune`],
];

export const java8Streams = topic('java8-complete-stream-api', 'Java 8 Complete: Stream API', [
    group('A. Stream Fundamentals', 'What a stream is, where it comes from and how a pipeline runs.'),
    ...A.map(block),
    group('B. Intermediate Operations', 'Operations that return another stream and run lazily.'),
    ...B.map(block),
    group('C. Terminal Operations', 'Operations that start the pipeline and produce a result.'),
    ...C.map(block),
    group('D. Collectors API', 'Ready-made collectors for <code>collect()</code>.'),
    ...D.map(block),
    group('E. Primitive Streams', '<code>IntStream</code>, <code>LongStream</code> and <code>DoubleStream</code>.'),
    ...E.map(block),
    group('F. Advanced Stream Concepts', 'Parallelism, laziness, ordering and common patterns.'),
    ...F.map(block),
], [
    ['What is the difference between a stream and a collection?', 'A collection stores data. A stream is a one-time pipeline of operations over a source and stores nothing.'],
    ['When should you not use a parallel stream?', 'For small data, blocking or I/O work, shared mutable state, or when order matters.'],
    ['reduce() or collect()?', 'reduce for combining immutable values into one. collect for building a mutable container.'],
]);
