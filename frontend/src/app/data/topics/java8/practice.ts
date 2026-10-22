import { block, group, topic, type Sub } from './kit';

const EMP = `class Employee {
    private final String name, dept; private final double salary;
    Employee(String name, String dept, double salary) { this.name = name; this.dept = dept; this.salary = salary; }
    String getName() { return name; } String getDept() { return dept; } double getSalary() { return salary; }
    public String toString() { return name; }
}
List<Employee> emps = Arrays.asList(
    new Employee("Asha", "IT", 90000), new Employee("Ravi", "IT", 70000),
    new Employee("Sam", "HR", 50000), new Employee("Zoya", "HR", 65000), new Employee("Amit", "Sales", 40000));
`;

const S: Sub[] = [
    ['1. Find even and odd numbers', 'Split with <code>filter</code>, or use <code>partitioningBy</code>.',
`List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8);
System.out.println(nums.stream().filter(n -> n % 2 == 0).collect(Collectors.toList()));
System.out.println(nums.stream().filter(n -> n % 2 != 0).collect(Collectors.toList()));
// OUTPUT:
// [2, 4, 6, 8]
// [1, 3, 5, 7]`],
    ['2. Find duplicate elements', 'An element is a duplicate when <code>Set.add</code> returns false.',
`List<Integer> nums = Arrays.asList(1, 2, 3, 2, 4, 3, 5);
Set<Integer> seen = new HashSet<>();
System.out.println(nums.stream().filter(n -> !seen.add(n)).collect(Collectors.toSet()));
// OUTPUT: [2, 3]`],
    ['3. Find unique elements', '<code>distinct()</code> keeps one of each. To keep only values that appear once, count them.',
`List<Integer> nums = Arrays.asList(1, 2, 3, 2, 4, 3, 5);
System.out.println(nums.stream().distinct().collect(Collectors.toList()));
System.out.println(nums.stream().collect(Collectors.groupingBy(n -> n, LinkedHashMap::new, Collectors.counting()))
        .entrySet().stream().filter(e -> e.getValue() == 1).map(Map.Entry::getKey).collect(Collectors.toList()));
// OUTPUT:
// [1, 2, 3, 4, 5]
// [1, 4, 5]`],
    ['4. Count element frequencies', 'Group by the element and count.',
`List<String> words = Arrays.asList("fort", "city", "fort", "river", "city", "fort");
Map<String, Long> freq = words.stream().collect(Collectors.groupingBy(Function.identity(), TreeMap::new, Collectors.counting()));
System.out.println(freq);
// OUTPUT: {city=2, fort=3, river=1}`],
    ['5. Find the first non-repeated character', 'Count characters in order, then take the first with count 1.',
`String s = "swiss";
Character first = s.chars().mapToObj(c -> (char) c)
        .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()))
        .entrySet().stream().filter(e -> e.getValue() == 1).map(Map.Entry::getKey).findFirst().orElse(null);
System.out.println(first);
// OUTPUT: w`],
    ['6. Find the first repeated character', 'The first character for which <code>Set.add</code> returns false.',
`String s = "programming";
Set<Character> seen = new HashSet<>();
Character rep = s.chars().mapToObj(c -> (char) c).filter(c -> !seen.add(c)).findFirst().orElse(null);
System.out.println(rep);
// OUTPUT: r`],
    ['7. Find the maximum and minimum numbers', 'Use <code>max</code> and <code>min</code>, or an <code>IntStream</code>.',
`List<Integer> nums = Arrays.asList(45, 12, 89, 33, 7);
System.out.println(nums.stream().max(Integer::compare).get() + " " + nums.stream().min(Integer::compare).get());
IntSummaryStatistics st = nums.stream().mapToInt(n -> n).summaryStatistics();
System.out.println(st.getMax() + " " + st.getMin());
// OUTPUT:
// 89 7
// 89 7`],
    ['8. Find the second-highest number', 'Distinct, sort descending, skip one.',
`List<Integer> nums = Arrays.asList(45, 12, 89, 89, 33, 7);
System.out.println(nums.stream().distinct().sorted(Comparator.reverseOrder()).skip(1).findFirst().get());
// OUTPUT: 45`],
    ['9. Sort numbers in ascending and descending order', '<code>sorted()</code> and <code>sorted(reverseOrder())</code>.',
`List<Integer> nums = Arrays.asList(5, 3, 9, 1);
System.out.println(nums.stream().sorted().collect(Collectors.toList()));
System.out.println(nums.stream().sorted(Comparator.reverseOrder()).collect(Collectors.toList()));
// OUTPUT:
// [1, 3, 5, 9]
// [9, 5, 3, 1]`],
    ['10. Sort employees by salary', 'Use <code>comparingDouble</code>, with <code>reversed()</code> for highest first.',
EMP + `emps.stream().sorted(Comparator.comparingDouble(Employee::getSalary)).forEach(e -> System.out.print(e + " "));
System.out.println();
emps.stream().sorted(Comparator.comparingDouble(Employee::getSalary).reversed()).forEach(e -> System.out.print(e + " "));
// OUTPUT:
// Amit Sam Zoya Ravi Asha
// Asha Ravi Zoya Sam Amit`],
    ['11. Find the highest-paid employee', '<code>max</code> with a salary comparator.',
EMP + `System.out.println(emps.stream().max(Comparator.comparingDouble(Employee::getSalary)).get());
// OUTPUT: Asha`],
    ['12. Group employees by department', '<code>groupingBy</code> on the department.',
EMP + `Map<String, List<Employee>> byDept = emps.stream().collect(Collectors.groupingBy(Employee::getDept, TreeMap::new, Collectors.toList()));
System.out.println(byDept);
// OUTPUT: {HR=[Sam, Zoya], IT=[Asha, Ravi], Sales=[Amit]}`],
    ['13. Count employees in each department', 'Add <code>counting()</code> as the downstream collector.',
EMP + `System.out.println(emps.stream().collect(Collectors.groupingBy(Employee::getDept, TreeMap::new, Collectors.counting())));
// OUTPUT: {HR=2, IT=2, Sales=1}`],
    ['14. Find the highest-paid employee in each department', '<code>groupingBy</code> with <code>maxBy</code>.',
EMP + `Map<String, Optional<Employee>> top = emps.stream().collect(Collectors.groupingBy(Employee::getDept, TreeMap::new,
        Collectors.maxBy(Comparator.comparingDouble(Employee::getSalary))));
top.forEach((d, e) -> System.out.println(d + " -> " + e.get()));
// OUTPUT:
// HR -> Zoya
// IT -> Asha
// Sales -> Amit`],
    ['15. Partition numbers into even and odd groups', '<code>partitioningBy</code> always gives a <code>true</code> and a <code>false</code> list.',
`Map<Boolean, List<Integer>> parts = IntStream.rangeClosed(1, 8).boxed().collect(Collectors.partitioningBy(n -> n % 2 == 0));
System.out.println("even=" + parts.get(true) + " odd=" + parts.get(false));
// OUTPUT: even=[2, 4, 6, 8] odd=[1, 3, 5, 7]`],
    ['16. Convert a list into a map', '<code>toMap</code> with a key and a value function. Add a merge function if keys can repeat.',
EMP + `Map<String, Double> salaryByName = emps.stream().collect(Collectors.toMap(Employee::getName, Employee::getSalary));
System.out.println(salaryByName.get("Ravi"));
// OUTPUT: 70000.0`],
    ['17. Convert a list of strings to uppercase', '<code>map(String::toUpperCase)</code>.',
`List<String> forts = Arrays.asList("raigad", "torna", "sinhagad");
System.out.println(forts.stream().map(String::toUpperCase).collect(Collectors.toList()));
// OUTPUT: [RAIGAD, TORNA, SINHAGAD]`],
    ['18. Flatten a list of lists', '<code>flatMap(List::stream)</code>.',
`List<List<Integer>> nested = Arrays.asList(Arrays.asList(1, 2), Arrays.asList(3, 4), Arrays.asList(5));
System.out.println(nested.stream().flatMap(List::stream).collect(Collectors.toList()));
// OUTPUT: [1, 2, 3, 4, 5]`],
    ['19. Join strings with delimiters', '<code>Collectors.joining</code>.',
`List<String> cities = Arrays.asList("Pune", "Nashik", "Satara");
System.out.println(cities.stream().collect(Collectors.joining(", ", "[", "]")));
// OUTPUT: [Pune, Nashik, Satara]`],
    ['20. Calculate sum and average using streams', '<code>mapToInt</code> then <code>sum</code> and <code>average</code>.',
`List<Integer> marks = Arrays.asList(80, 65, 90, 75);
int sum = marks.stream().mapToInt(Integer::intValue).sum();
double avg = marks.stream().mapToInt(Integer::intValue).average().orElse(0);
System.out.println(sum + " " + avg);
// OUTPUT: 310 77.5`],
];

const F: Sub[] = [
    ['21. Create a custom functional interface', 'One abstract method, marked with <code>@FunctionalInterface</code>.',
`@FunctionalInterface
interface Discount { double apply(double price); }

Discount festival = p -> p * 0.8;
System.out.println(festival.apply(500));
// OUTPUT: 400.0`],
    ['22. Use Predicate to filter values', '<code>Predicate</code> as the argument of <code>filter</code>.',
`Predicate<String> longName = s -> s.length() > 4;
System.out.println(Arrays.asList("Amit", "Ravi", "Sinhagad", "Raigad").stream().filter(longName).collect(Collectors.toList()));
// OUTPUT: [Sinhagad, Raigad]`],
    ['23. Use Function to transform values', '<code>Function</code> as the argument of <code>map</code>.',
`Function<String, Integer> length = String::length;
System.out.println(Arrays.asList("Pune", "Goa").stream().map(length).collect(Collectors.toList()));
// OUTPUT: [4, 3]`],
    ['24. Use Consumer to print values', '<code>Consumer</code> as the argument of <code>forEach</code>.',
`Consumer<String> printer = s -> System.out.println("City: " + s);
Arrays.asList("Pune", "Goa").forEach(printer);
// OUTPUT:
// City: Pune
// City: Goa`],
    ['25. Use Supplier to generate values', '<code>Supplier</code> with <code>Stream.generate</code>.',
`Random r = new Random(1);
Supplier<Integer> dice = () -> r.nextInt(6) + 1;
System.out.println(Stream.generate(dice).limit(5).count());
Supplier<String> id = () -> "ID-" + 42;
System.out.println(id.get());
// OUTPUT:
// 5
// ID-42`],
    ['26. Chain multiple predicates', '<code>and</code>, <code>or</code>, <code>negate</code>.',
`Predicate<Integer> positive = n -> n > 0;
Predicate<Integer> even = n -> n % 2 == 0;
Predicate<Integer> small = n -> n < 100;
System.out.println(Stream.of(-4, 6, 7, 120, 88).filter(positive.and(even).and(small)).collect(Collectors.toList()));
// OUTPUT: [6, 88]`],
    ['27. Chain multiple functions', '<code>andThen</code> goes left to right.',
`Function<String, String> trim = String::trim;
Function<String, String> upper = String::toUpperCase;
Function<String, String> exclaim = s -> s + "!";
System.out.println(trim.andThen(upper).andThen(exclaim).apply("  hello "));
// OUTPUT: HELLO!`],
    ['28. Sort a list using a lambda', 'Pass a comparator lambda to <code>sort</code>.',
`List<String> names = new ArrayList<>(Arrays.asList("Sinhagad", "Torna", "Raigad"));
names.sort((a, b) -> a.length() - b.length());
System.out.println(names);
// OUTPUT: [Torna, Raigad, Sinhagad]`],
    ['29. Demonstrate method references', 'Static, bound, unbound.',
`Function<String, Integer> parse = Integer::parseInt;   // static
Consumer<String> out = System.out::println;            // bound to System.out
Function<String, String> up = String::toUpperCase;     // unbound: s -> s.toUpperCase()
out.accept(up.apply("ok") + parse.apply("7"));
// OUTPUT: OK7`],
    ['30. Demonstrate constructor references', '<code>ClassName::new</code>, including arrays.',
`Supplier<ArrayList<String>> listMaker = ArrayList::new;
Function<String, StringBuilder> sbMaker = StringBuilder::new;
IntFunction<int[]> arrayMaker = int[]::new;
System.out.println(listMaker.get().size() + " " + sbMaker.apply("abc").reverse() + " " + arrayMaker.apply(3).length);
// OUTPUT: 0 cba 3`],
];

const O: Sub[] = [
    ['31. Handle null values using Optional', 'Wrap, transform, and give a default.',
`String name = null;
String result = Optional.ofNullable(name).map(String::trim).map(String::toUpperCase).orElse("UNKNOWN");
System.out.println(result);
// OUTPUT: UNKNOWN`],
    ['32. Demonstrate orElse() vs orElseGet()', 'Only <code>orElseGet</code> skips the work when a value exists.',
`static String expensive() { System.out.println("computing default..."); return "default"; }

System.out.println(Optional.of("value").orElse(expensive()));
System.out.println(Optional.of("value").orElseGet(() -> expensive()));
// OUTPUT:
// computing default...
// value
// value`],
    ['33. Calculate the difference between two dates', '<code>Period</code> for years/months/days, <code>ChronoUnit</code> for a total.',
`LocalDate start = LocalDate.of(2024, 1, 15), end = LocalDate.of(2026, 3, 20);
Period p = Period.between(start, end);
System.out.println(p.getYears() + "y " + p.getMonths() + "m " + p.getDays() + "d");
System.out.println(ChronoUnit.DAYS.between(start, end) + " days");
// OUTPUT:
// 2y 2m 5d
// 795 days`],
    ['34. Format a date into a required pattern', '<code>DateTimeFormatter.ofPattern</code>.',
`LocalDateTime t = LocalDateTime.of(2026, 1, 26, 18, 45);
System.out.println(t.format(DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy hh:mm a")));
System.out.println(t.format(DateTimeFormatter.ISO_LOCAL_DATE));
// OUTPUT:
// Monday, 26 January 2026 06:45 PM
// 2026-01-26`],
    ['35. Convert UTC time to another timezone', 'Take the UTC instant and view it in a zone.',
`ZonedDateTime utc = ZonedDateTime.of(2026, 1, 26, 12, 0, 0, 0, ZoneId.of("UTC"));
System.out.println(utc.withZoneSameInstant(ZoneId.of("Asia/Kolkata")));
System.out.println(utc.withZoneSameInstant(ZoneId.of("America/New_York")));
// OUTPUT:
// 2026-01-26T17:30+05:30[Asia/Kolkata]
// 2026-01-26T07:00-05:00[America/New_York]`],
];

const C: Sub[] = [
    ['36. Execute asynchronous tasks using CompletableFuture', '<code>supplyAsync</code> then <code>thenApply</code>.',
`CompletableFuture<String> task = CompletableFuture.supplyAsync(() -> "order-101")
        .thenApply(id -> "Processed " + id);
System.out.println(task.join());
// OUTPUT: Processed order-101`],
    ['37. Combine two asynchronous results', '<code>thenCombine</code>.',
`CompletableFuture<Double> price = CompletableFuture.supplyAsync(() -> 250.0);
CompletableFuture<Double> tax = CompletableFuture.supplyAsync(() -> 45.0);
System.out.println(price.thenCombine(tax, Double::sum).join());
// OUTPUT: 295.0`],
    ['38. Handle asynchronous exceptions', '<code>exceptionally</code> for a fallback, <code>handle</code> for both outcomes.',
`CompletableFuture<Integer> risky = CompletableFuture.supplyAsync(() -> 10 / 0);
System.out.println(risky.exceptionally(ex -> -1).join());
System.out.println(risky.handle((v, ex) -> ex != null ? "failed: " + ex.getCause().getClass().getSimpleName() : "ok").join());
// OUTPUT:
// -1
// failed: ArithmeticException`],
    ['39. Wait for multiple asynchronous tasks', '<code>allOf</code>, then read each result.',
`List<CompletableFuture<Integer>> tasks = IntStream.rangeClosed(1, 3)
        .mapToObj(i -> CompletableFuture.supplyAsync(() -> i * 10)).collect(Collectors.toList());
CompletableFuture.allOf(tasks.toArray(new CompletableFuture[0])).join();
System.out.println(tasks.stream().map(CompletableFuture::join).collect(Collectors.toList()));
// OUTPUT: [10, 20, 30]`],
    ['40. Compare sequential and parallel stream processing', 'Measure both. Parallel only wins for large, CPU-heavy, independent work.',
`long t1 = System.nanoTime();
long a = LongStream.rangeClosed(1, 50_000_000L).sum();
long t2 = System.nanoTime();
long b = LongStream.rangeClosed(1, 50_000_000L).parallel().sum();
long t3 = System.nanoTime();
System.out.println(a == b);
System.out.println("sequential ms=" + (t2 - t1) / 1_000_000 + " parallel ms=" + (t3 - t2) / 1_000_000);
// OUTPUT:
// true
// sequential ms=... parallel ms=...   (times differ per machine)`],
];

export const java8PracticeQuestions = topic('java8-complete-practical-coding-questions', 'Java 8 Practical Coding Questions', [
    group('Stream API Programs', 'Questions 1 to 20. Each answer is a short program with its output.'),
    ...S.map(block),
    group('Functional Interface Programs', 'Questions 21 to 30.'),
    ...F.map(block),
    group('Optional and Date-Time Programs', 'Questions 31 to 35.'),
    ...O.map(block),
    group('Concurrency Programs', 'Questions 36 to 40.'),
    ...C.map(block),
    { content: `<h3>Recommended order for Java Spring Boot interviews</h3>Lambda Expressions, Functional Interfaces, Stream API, Collectors, Comparator, Optional, Date-Time API, Map Enhancements, CompletableFuture, then Advanced Stream coding questions.<br><br><b>Version note:</b> methods marked Java 9+ or Java 11+ in these lessons (<code>ifPresentOrElse</code>, <code>isEmpty</code>) are not Java 8 features.<br>` },
], [
    ['How do you find duplicates in a list with streams?', 'Keep a HashSet and filter elements for which set.add returns false, or group by element and keep counts above 1.'],
    ['How do you get the highest-paid employee per department?', 'groupingBy(dept, maxBy(comparingDouble(salary))).'],
    ['When is a parallel stream slower than a sequential one?', 'With small data, cheap operations, shared mutable state or blocking calls, the cost of splitting and merging dominates.'],
]);
