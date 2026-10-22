import { block, group, topic, type Sub } from './kit';

// ---- 4. Method References ----
const mr: Sub[] = [
    ['Introduction to Method References', 'A method reference is a short lambda that just calls an existing method: <code>Class::method</code>.',
`Consumer<String> a = s -> System.out.println(s);   // lambda
Consumer<String> b = System.out::println;          // same, shorter
b.accept("Hello");
// OUTPUT: Hello`],
    ['Static Method References: ClassName::staticMethod', 'Refers to a static method.',
`Function<String, Integer> parse = Integer::parseInt;
System.out.println(parse.apply("42") + 1);
// OUTPUT: 43`],
    ['Instance Method References: object::instanceMethod', 'Refers to a method of one specific, existing object.',
`String prefix = "Fort ";
Function<String, String> add = prefix::concat;
System.out.println(add.apply("Raigad"));
// OUTPUT: Fort Raigad`],
    ['Arbitrary Object Instance Method References: ClassName::instanceMethod', 'The first lambda argument becomes the object the method is called on.',
`Function<String, Integer> len = String::length;   // s -> s.length()
BiPredicate<String, String> eq = String::equalsIgnoreCase;   // (a, b) -> a.equalsIgnoreCase(b)
System.out.println(len.apply("Pune") + " " + eq.test("a", "A"));
// OUTPUT: 4 true`],
    ['Constructor References: ClassName::new', 'Refers to a constructor.',
`Supplier<List<String>> make = ArrayList::new;
Function<String, StringBuilder> wrap = StringBuilder::new;
List<String> list = make.get();
list.add("x");
System.out.println(list + " " + wrap.apply("sb"));
// OUTPUT: [x] sb`],
    ['Method References with Functional Interfaces', 'Any functional interface with a matching signature can take one.',
`BinaryOperator<Integer> add = Integer::sum;
UnaryOperator<String> upper = String::toUpperCase;
System.out.println(add.apply(2, 3) + " " + upper.apply("ok"));
// OUTPUT: 5 OK`],
    ['Method References with Collections', 'Common in <code>forEach</code>, <code>map</code> and <code>sort</code>.',
`List<String> names = Arrays.asList("Ravi", "Amit");
names.stream().map(String::toUpperCase).sorted().forEach(System.out::println);
// OUTPUT:
// AMIT
// RAVI`],
    ['Lambda Expressions vs Method References', 'Use a method reference when the lambda only forwards its arguments. Keep a lambda when you add logic.',
`List<String> names = Arrays.asList("ravi", "amit");
names.forEach(n -> System.out.println(n));                       // forwards only: use a reference
names.forEach(n -> System.out.println(n.toUpperCase() + "!"));   // extra logic: keep the lambda
// OUTPUT:
// ravi
// amit
// RAVI!
// AMIT!`],
];
export const java8MethodRefs = topic('java8-complete-method-references', 'Java 8 Complete: Method References', mr.map(block), [
    ['Name the four kinds of method reference.', 'Static (Integer::parseInt), bound instance (obj::method), unbound instance (String::length), constructor (ArrayList::new).'],
]);

// ---- 5. Default and Static Methods in Interfaces ----
const di: Sub[] = [
    ['Default Methods', 'A method with a body inside an interface, marked <code>default</code>.',
`interface Vehicle { default String start() { return "Engine on"; } }
class Car implements Vehicle {}
System.out.println(new Car().start());
// OUTPUT: Engine on`],
    ['Static Methods in Interfaces', 'Belong to the interface and are not inherited.',
`interface Util { static int twice(int n) { return n * 2; } }
System.out.println(Util.twice(21));
// OUTPUT: 42`],
    ['Defining Method Implementations in Interfaces', 'A default method can call the abstract methods of the same interface.',
`interface Shape {
    double area();
    default String info() { return "Area is " + area(); }
}
Shape sq = () -> 16.0;
System.out.println(sq.info());
// OUTPUT: Area is 16.0`],
    ['Overriding Default Methods', 'A class (or sub-interface) can replace the default behavior.',
`interface Greeter { default String hi() { return "Hello"; } }
class Marathi implements Greeter { public String hi() { return "Namaskar"; } }
System.out.println(new Marathi().hi());
// OUTPUT: Namaskar`],
    ['Multiple Inheritance Conflicts', 'If two interfaces give the same default method, the class must say which one wins.',
`interface A { default String who() { return "A"; } }
interface B { default String who() { return "B"; } }
class C implements A, B { }   // COMPILE ERROR: types A and B are incompatible; must override who()
// OUTPUT: compile error`],
    ['Resolving Default Method Conflicts', 'Override the method and pick with <code>Interface.super.method()</code>.',
`interface A { default String who() { return "A"; } }
interface B { default String who() { return "B"; } }
class C implements A, B { public String who() { return A.super.who() + B.super.who(); } }
System.out.println(new C().who());
// OUTPUT: AB`],
    ['Interface vs Abstract Class', 'An interface cannot hold state (instance fields) or constructors; an abstract class can. A class can implement many interfaces but extend one class.',
`interface Walks { default String move() { return "walk"; } }
abstract class Animal { String name = "animal"; abstract String sound(); }
class Dog extends Animal implements Walks { String sound() { return "Woof"; } }
Dog d = new Dog();
System.out.println(d.name + " " + d.sound() + " " + d.move());
// OUTPUT: animal Woof walk`],
    ['Calling Interface Static Methods', 'Always through the interface name, never through an object or implementing class.',
`interface Util { static String tag() { return "util"; } }
class Impl implements Util {}
System.out.println(Util.tag());
// Impl.tag();   // COMPILE ERROR
// OUTPUT: util`],
    ['Backward Compatibility of Interfaces', 'Default methods let the JDK add methods such as <code>forEach</code> to <code>Iterable</code> without breaking existing implementations.',
`class MyList implements Iterable<String> {
    public Iterator<String> iterator() { return Arrays.asList("a", "b").iterator(); }
}
new MyList().forEach(System.out::println);   // forEach is a default method of Iterable
// OUTPUT:
// a
// b`],
];
export const java8DefaultStatic = topic('java8-complete-default-static-methods', 'Java 8 Complete: Default and Static Methods in Interfaces', di.map(block), [
    ['Why were default methods added?', 'To add new methods to old interfaces (like Collection.stream) without breaking classes that already implement them.'],
    ['How do you resolve a default method conflict?', 'Override it in the class and call the one you want with InterfaceName.super.method().'],
]);

// ---- 6. Optional ----
const op: Sub[] = [
    ['Introduction to Optional<T>', 'A container that holds a value or nothing. It makes "might be missing" part of the return type.',
`Optional<String> maybe = Optional.of("Raigad");
System.out.println(maybe);
// OUTPUT: Optional[Raigad]`],
    ['Optional.of()', 'Wraps a non-null value. Passing null throws <code>NullPointerException</code>.',
`System.out.println(Optional.of("x").get());
// Optional.of(null);   // NullPointerException
// OUTPUT: x`],
    ['Optional.ofNullable()', 'Wraps a value that may be null: null becomes empty.',
`String city = null;
System.out.println(Optional.ofNullable(city).isPresent());
// OUTPUT: false`],
    ['Optional.empty()', 'An Optional with no value.',
`Optional<String> none = Optional.empty();
System.out.println(none);
// OUTPUT: Optional.empty`],
    ['isPresent()', 'True when a value is present.',
`System.out.println(Optional.of(1).isPresent() + " " + Optional.empty().isPresent());
// OUTPUT: true false`],
    ['isEmpty() (Java 11+)', 'The opposite of <code>isPresent()</code>. Not available in Java 8.',
`System.out.println(Optional.empty().isEmpty());   // Java 11+
// Java 8 equivalent: !opt.isPresent()
// OUTPUT: true`],
    ['ifPresent()', 'Runs an action only when a value is there.',
`Optional.of("Pune").ifPresent(c -> System.out.println("City: " + c));
Optional.<String>empty().ifPresent(c -> System.out.println("never printed"));
// OUTPUT: City: Pune`],
    ['ifPresentOrElse() (Java 9+)', 'Runs one action if present, another if empty. Not available in Java 8.',
`Optional.<String>empty().ifPresentOrElse(
        v -> System.out.println("got " + v),
        () -> System.out.println("nothing"));   // Java 9+
// OUTPUT: nothing`],
    ['get()', 'Returns the value, or throws <code>NoSuchElementException</code> when empty. Prefer the safer methods.',
`System.out.println(Optional.of("v").get());
// Optional.empty().get();   // NoSuchElementException
// OUTPUT: v`],
    ['orElse()', 'The value, or a default.',
`System.out.println(Optional.<String>empty().orElse("Guest"));
// OUTPUT: Guest`],
    ['orElseGet()', 'The value, or the result of a <code>Supplier</code>, which runs only when needed.',
`System.out.println(Optional.<String>empty().orElseGet(() -> "Computed"));
// OUTPUT: Computed`],
    ['orElseThrow()', 'The value, or throws the exception you supply.',
`try {
    Optional.<String>empty().orElseThrow(() -> new IllegalArgumentException("No user"));
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage());
}
// OUTPUT: No user`],
    ['map()', 'Transforms the value if present. Empty stays empty.',
`System.out.println(Optional.of("pune").map(String::toUpperCase).orElse("?"));
// OUTPUT: PUNE`],
    ['flatMap()', 'Like <code>map</code>, for a function that itself returns an Optional. Avoids <code>Optional&lt;Optional&gt;</code>.',
`Optional<String> id = Optional.of("7");
Optional<Integer> n = id.flatMap(s -> Optional.of(Integer.parseInt(s)));
System.out.println(n.get() + 1);
// OUTPUT: 8`],
    ['filter()', 'Keeps the value only if it passes a test.',
`System.out.println(Optional.of(5).filter(n -> n > 10).isPresent());
// OUTPUT: false`],
    ['Optional vs Null', 'Optional forces the caller to deal with absence. A null return is easy to forget.',
`static String findName(int id) { return id == 1 ? "Asha" : null; }
static Optional<String> findNameSafe(int id) { return Optional.ofNullable(findName(id)); }
// findName(2).length();   // NullPointerException
System.out.println(findNameSafe(2).map(String::length).orElse(0));
// OUTPUT: 0`],
    ['Optional with Streams', '<code>findFirst</code>, <code>min</code>, <code>max</code> and <code>reduce</code> return Optionals.',
`System.out.println(Stream.of("a", "bb").filter(s -> s.length() > 1).findFirst().orElse("none"));
// OUTPUT: bb`],
    ['Optional with Repository Results', 'In Spring Data, <code>findById</code> returns an Optional.',
`// Optional<User> user = userRepository.findById(10L);
// return user.orElseThrow(() -> new UserNotFoundException(10L));
Optional<String> user = Optional.of("Asha");   // stand-in for the repository result
System.out.println(user.orElseThrow(() -> new RuntimeException("not found")));
// OUTPUT: Asha`],
    ['orElse() vs orElseGet()', '<code>orElse</code> always evaluates its argument. <code>orElseGet</code> only when empty.',
`static String slow() { System.out.println("slow() called"); return "default"; }
Optional.of("value").orElse(slow());
System.out.println("---");
Optional.of("value").orElseGet(() -> slow());
// OUTPUT:
// slow() called
// ---`],
    ['Best Practices for Optional', 'Use it as a return type. Do not use it for fields, parameters or collections. Never call <code>get()</code> without checking.',
`// Good: return type
static Optional<String> find(String key) { return Optional.ofNullable(key); }
// Avoid: Optional fields and parameters
// Avoid: opt.isPresent() ? opt.get() : x   -> use opt.orElse(x)
System.out.println(find(null).orElse("default"));
// OUTPUT: default`],
];
export const java8Optional = topic('java8-complete-optional', 'Java 8 Complete: Optional Class', op.map(block), [
    ['Why use Optional?', 'It makes a possibly missing result explicit in the method signature and avoids unchecked null handling.'],
    ['orElse vs orElseGet?', 'orElse evaluates its argument always; orElseGet runs the supplier only if the Optional is empty.'],
    ['Where should Optional not be used?', 'Fields, method parameters, and collections (return an empty collection instead).'],
]);

// ---- 7. Date and Time ----
const dt: Sub[] = [
    ['LocalDate', 'A date with no time and no time zone.',
`LocalDate d = LocalDate.of(2026, 1, 26);
System.out.println(d + " " + d.getDayOfWeek());
// OUTPUT: 2026-01-26 MONDAY`],
    ['LocalTime', 'A time of day with no date.',
`LocalTime t = LocalTime.of(14, 30);
System.out.println(t.plusMinutes(45));
// OUTPUT: 15:15`],
    ['LocalDateTime', 'Date and time, no time zone.',
`LocalDateTime dt = LocalDateTime.of(2026, 3, 1, 9, 0);
System.out.println(dt.plusHours(5));
// OUTPUT: 2026-03-01T14:00`],
    ['ZonedDateTime', 'Date, time and a time zone.',
`ZonedDateTime pune = ZonedDateTime.of(2026, 3, 1, 9, 0, 0, 0, ZoneId.of("Asia/Kolkata"));
System.out.println(pune);
// OUTPUT: 2026-03-01T09:00+05:30[Asia/Kolkata]`],
    ['OffsetDateTime', 'Date and time with a fixed offset from UTC.',
`OffsetDateTime o = OffsetDateTime.of(2026, 3, 1, 9, 0, 0, 0, ZoneOffset.ofHoursMinutes(5, 30));
System.out.println(o);
// OUTPUT: 2026-03-01T09:00+05:30`],
    ['OffsetTime', 'A time with a fixed offset from UTC.',
`OffsetTime ot = OffsetTime.of(9, 0, 0, 0, ZoneOffset.UTC);
System.out.println(ot);
// OUTPUT: 09:00Z`],
    ['Instant', 'A point on the timeline in UTC, measured from 1970-01-01T00:00:00Z.',
`Instant epoch = Instant.ofEpochSecond(0);
System.out.println(epoch + " " + epoch.plusSeconds(86400));
// OUTPUT: 1970-01-01T00:00:00Z 1970-01-02T00:00:00Z`],
    ['Period', 'An amount of time in years, months and days.',
`Period p = Period.between(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 3, 15));
System.out.println(p + " -> " + p.getMonths() + " months " + p.getDays() + " days");
// OUTPUT: P2M14D -> 2 months 14 days`],
    ['Duration', 'An amount of time in hours, minutes, seconds.',
`Duration d = Duration.between(LocalTime.of(9, 0), LocalTime.of(17, 30));
System.out.println(d + " = " + d.toMinutes() + " minutes");
// OUTPUT: PT8H30M = 510 minutes`],
    ['ZoneId', 'Identifies a time zone by region.',
`ZoneId z = ZoneId.of("America/New_York");
System.out.println(z + " " + ZoneId.of("Asia/Kolkata").getId());
// OUTPUT: America/New_York Asia/Kolkata`],
    ['ZoneOffset', 'A fixed offset from UTC.',
`ZoneOffset ist = ZoneOffset.ofHoursMinutes(5, 30);
System.out.println(ist + " " + ist.getTotalSeconds());
// OUTPUT: +05:30 19800`],
    ['Year', 'A year, with a leap-year check.',
`System.out.println(Year.of(2028).isLeap() + " " + Year.isLeap(2027));
// OUTPUT: true false`],
    ['YearMonth', 'A year and month, such as a billing month.',
`YearMonth ym = YearMonth.of(2028, 2);
System.out.println(ym.lengthOfMonth() + " " + ym.atEndOfMonth());
// OUTPUT: 29 2028-02-29`],
    ['MonthDay', 'A month and day, such as a birthday, with no year.',
`MonthDay md = MonthDay.of(8, 15);
System.out.println(md + " " + md.isValidYear(2027));
// OUTPUT: --08-15 true`],
    ['DateTimeFormatter', 'Formats and parses date-times with a pattern.',
`DateTimeFormatter f = DateTimeFormatter.ofPattern("dd MMM yyyy");
System.out.println(LocalDate.of(2026, 1, 26).format(f));
// OUTPUT: 26 Jan 2026`],
    ['Creating Dates and Times', 'Use <code>of()</code> with the values.',
`System.out.println(LocalDate.of(2026, Month.AUGUST, 15));
System.out.println(LocalDateTime.of(2026, 8, 15, 6, 30));
// OUTPUT:
// 2026-08-15
// 2026-08-15T06:30`],
    ['Getting Current Date and Time', 'Use <code>now()</code>.',
`LocalDate today = LocalDate.now();
LocalDateTime nowTime = LocalDateTime.now();
System.out.println(today.equals(nowTime.toLocalDate()));
// OUTPUT: true   (unless the clock passes midnight between the two calls)`],
    ['Parsing Date and Time', 'Turn text into a date. ISO format needs no pattern.',
`LocalDate iso = LocalDate.parse("2026-01-26");
LocalDate custom = LocalDate.parse("26/01/2026", DateTimeFormatter.ofPattern("dd/MM/yyyy"));
System.out.println(iso.equals(custom));
// OUTPUT: true`],
    ['Formatting Date and Time', 'Turn a date into text.',
`LocalDateTime dt = LocalDateTime.of(2026, 1, 26, 15, 5);
System.out.println(dt.format(DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a")));
// OUTPUT: 26-01-2026 03:05 PM`],
    ['Adding Days, Months, and Years', '<code>plusDays</code>, <code>plusMonths</code>, <code>plusYears</code> return a new object.',
`LocalDate d = LocalDate.of(2026, 1, 31);
System.out.println(d.plusDays(1) + " " + d.plusMonths(1) + " " + d.plusYears(1));
// OUTPUT: 2026-02-01 2026-02-28 2027-01-31`],
    ['Subtracting Days, Months, and Years', '<code>minusDays</code>, <code>minusMonths</code>, <code>minusYears</code>.',
`LocalDate d = LocalDate.of(2026, 3, 31);
System.out.println(d.minusDays(1) + " " + d.minusMonths(1) + " " + d.minusYears(1));
// OUTPUT: 2026-03-30 2026-02-28 2025-03-31`],
    ['Comparing Dates', '<code>isBefore</code>, <code>isAfter</code>, <code>isEqual</code>, <code>compareTo</code>.',
`LocalDate a = LocalDate.of(2026, 1, 1), b = LocalDate.of(2026, 6, 1);
System.out.println(a.isBefore(b) + " " + a.isAfter(b) + " " + a.isEqual(a));
// OUTPUT: true false true`],
    ['Calculating Date Differences', '<code>ChronoUnit.between</code> for one unit, <code>Period</code> for years-months-days.',
`LocalDate a = LocalDate.of(2026, 1, 1), b = LocalDate.of(2026, 3, 1);
System.out.println(ChronoUnit.DAYS.between(a, b) + " days");
// OUTPUT: 59 days`],
    ['Timezone Conversion', '<code>withZoneSameInstant</code> keeps the moment and changes the zone.',
`ZonedDateTime pune = ZonedDateTime.of(2026, 3, 1, 9, 0, 0, 0, ZoneId.of("Asia/Kolkata"));
System.out.println(pune.withZoneSameInstant(ZoneId.of("UTC")));
// OUTPUT: 2026-03-01T03:30Z[UTC]`],
    ['UTC and Offset Handling', 'Store and transfer time in UTC, show it in the viewer zone.',
`Instant stored = Instant.parse("2026-03-01T03:30:00Z");
System.out.println(stored.atZone(ZoneId.of("Asia/Kolkata")).toLocalTime());
// OUTPUT: 09:00`],
    ['Leap Year Checking', '<code>isLeapYear()</code> on a date, or <code>Year.isLeap()</code>.',
`System.out.println(LocalDate.of(2100, 1, 1).isLeapYear() + " " + LocalDate.of(2096, 1, 1).isLeapYear());
// OUTPUT: false true`],
    ['Date Validation', 'Invalid dates throw <code>DateTimeException</code>.',
`try {
    LocalDate.of(2026, 2, 30);
} catch (DateTimeException e) {
    System.out.println("Invalid: " + e.getMessage());
}
// OUTPUT: Invalid: Invalid date 'FEBRUARY 30'`],
    ['Converting Legacy Date and Calendar', 'Bridge old and new with <code>toInstant</code> and <code>Date.from</code>.',
`Date legacy = new Date(0L);
LocalDateTime ldt = LocalDateTime.ofInstant(legacy.toInstant(), ZoneOffset.UTC);
Date back = Date.from(ldt.toInstant(ZoneOffset.UTC));
System.out.println(ldt + " " + back.getTime());
// OUTPUT: 1970-01-01T00:00 0`],
    ['Immutable Date-Time Objects', 'Every change returns a new object, so they are thread-safe.',
`LocalDate d = LocalDate.of(2026, 1, 1);
d.plusDays(10);                        // result ignored
System.out.println(d);                 // unchanged
System.out.println(d.plusDays(10));
// OUTPUT:
// 2026-01-01
// 2026-01-11`],
];
export const java8DateTime = topic('java8-complete-date-time-api', 'Java 8 Complete: New Date and Time API', [
    group('A. Core Classes', 'The <code>java.time</code> classes and when to use each.'),
    ...dt.slice(0, 15).map(block),
    group('B. Date and Time Operations', 'Everyday tasks: create, parse, format, compare, convert.'),
    ...dt.slice(15).map(block),
], [
    ['Why is java.time better than Date and Calendar?', 'Immutable and thread-safe, clear types (LocalDate vs Instant), months from 1 and a fluent API.'],
    ['Period vs Duration?', 'Period is date-based (years, months, days). Duration is time-based (hours, minutes, seconds).'],
]);

// ---- 8. Collection API enhancements ----
const ce: Sub[] = [
    ['forEach()', 'Defined in <code>Iterable</code>. Runs a <code>Consumer</code> for each element.',
`List<String> forts = Arrays.asList("Raigad", "Torna");
forts.forEach(f -> System.out.println(f));
// OUTPUT:
// Raigad
// Torna`],
    ['removeIf()', 'Removes the elements matching a <code>Predicate</code>.',
`List<Integer> nums = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5, 6));
nums.removeIf(n -> n % 2 == 0);
System.out.println(nums);
// OUTPUT: [1, 3, 5]`],
    ['stream()', 'Creates a sequential stream from a collection.',
`System.out.println(Arrays.asList(1, 2, 3).stream().mapToInt(n -> n).sum());
// OUTPUT: 6`],
    ['parallelStream()', 'Creates a parallel stream from a collection.',
`System.out.println(Arrays.asList(1, 2, 3).parallelStream().mapToInt(n -> n).sum());
// OUTPUT: 6`],
    ['List.replaceAll()', 'Replaces every element with the result of a <code>UnaryOperator</code>.',
`List<String> names = new ArrayList<>(Arrays.asList("ravi", "amit"));
names.replaceAll(String::toUpperCase);
System.out.println(names);
// OUTPUT: [RAVI, AMIT]`],
    ['List.sort()', 'Sorts in place with a <code>Comparator</code> (null means natural order).',
`List<Integer> nums = new ArrayList<>(Arrays.asList(3, 1, 2));
nums.sort(null);
System.out.println(nums);
nums.sort(Comparator.reverseOrder());
System.out.println(nums);
// OUTPUT:
// [1, 2, 3]
// [3, 2, 1]`],
    ['Map.forEach()', 'Visits each entry with a <code>BiConsumer</code>.',
`Map<String, Integer> m = new LinkedHashMap<>();
m.put("Raigad", 1674);
m.put("Torna", 1646);
m.forEach((fort, year) -> System.out.println(fort + " -> " + year));
// OUTPUT:
// Raigad -> 1674
// Torna -> 1646`],
    ['Map.getOrDefault()', 'The value for the key, or a default when absent.',
`Map<String, Integer> m = new HashMap<>();
m.put("a", 1);
System.out.println(m.getOrDefault("a", 0) + " " + m.getOrDefault("z", 0));
// OUTPUT: 1 0`],
    ['Map.putIfAbsent()', 'Puts only if the key is missing (or maps to null). Returns the old value.',
`Map<String, Integer> m = new HashMap<>();
System.out.println(m.putIfAbsent("a", 1));
System.out.println(m.putIfAbsent("a", 2));
System.out.println(m);
// OUTPUT:
// null
// 1
// {a=1}`],
    ['Map.remove(key, value)', 'Removes the entry only if the key currently maps to that value.',
`Map<String, Integer> m = new HashMap<>();
m.put("a", 1);
System.out.println(m.remove("a", 2) + " " + m.remove("a", 1) + " " + m);
// OUTPUT: false true {}`],
    ['Map.replace()', 'Replaces the value only if the key is present.',
`Map<String, Integer> m = new HashMap<>();
m.put("a", 1);
m.replace("a", 10);
m.replace("z", 99);   // absent: nothing happens
System.out.println(m);
// OUTPUT: {a=10}`],
    ['Map.replaceAll()', 'Replaces every value using a <code>BiFunction</code>.',
`Map<String, Integer> m = new HashMap<>();
m.put("a", 1);
m.put("b", 2);
m.replaceAll((k, v) -> v * 100);
System.out.println(m);
// OUTPUT: {a=100, b=200}`],
    ['Map.compute()', 'Recalculates a value whether the key is present or not. Returning null removes it.',
`Map<String, Integer> m = new HashMap<>();
m.compute("a", (k, v) -> v == null ? 1 : v + 1);
m.compute("a", (k, v) -> v == null ? 1 : v + 1);
System.out.println(m);
// OUTPUT: {a=2}`],
    ['Map.computeIfAbsent()', 'Computes and stores a value only when the key is missing. Ideal for a map of lists.',
`Map<String, List<String>> byState = new HashMap<>();
byState.computeIfAbsent("MH", k -> new ArrayList<>()).add("Pune");
byState.computeIfAbsent("MH", k -> new ArrayList<>()).add("Nashik");
System.out.println(byState);
// OUTPUT: {MH=[Pune, Nashik]}`],
    ['Map.computeIfPresent()', 'Recomputes a value only when the key exists.',
`Map<String, Integer> stock = new HashMap<>();
stock.put("pen", 10);
stock.computeIfPresent("pen", (k, v) -> v - 3);
stock.computeIfPresent("book", (k, v) -> v - 3);
System.out.println(stock);
// OUTPUT: {pen=7}`],
    ['Map.merge()', 'Inserts the value, or combines it with the existing one. Perfect for counting.',
`Map<String, Integer> count = new TreeMap<>();
for (String w : "to be or not to be".split(" ")) count.merge(w, 1, Integer::sum);
System.out.println(count);
// OUTPUT: {be=2, not=1, or=1, to=2}`],
    ['Iteration Using Lambdas', 'Replace the explicit loop with <code>forEach</code>.',
`List<Integer> nums = Arrays.asList(1, 2, 3);
nums.forEach(n -> System.out.print(n * n + " "));
// OUTPUT: 1 4 9`],
    ['Sorting with Comparator', 'Pass a comparator built from a key.',
`List<String> names = new ArrayList<>(Arrays.asList("Sam", "Amit", "Ravi"));
names.sort(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
System.out.println(names);
// OUTPUT: [Sam, Amit, Ravi]`],
    ['Filtering Collections', 'Use a stream with <code>filter</code> to build a new list.',
`List<Integer> nums = Arrays.asList(5, 12, 8, 20);
System.out.println(nums.stream().filter(n -> n > 10).collect(Collectors.toList()));
// OUTPUT: [12, 20]`],
    ['Transforming Collections', 'Use <code>map</code> to change each element.',
`List<String> names = Arrays.asList("ravi", "amit");
System.out.println(names.stream().map(String::toUpperCase).collect(Collectors.toList()));
// OUTPUT: [RAVI, AMIT]`],
    ['Removing Elements Conditionally', '<code>removeIf</code> is safe. Removing inside a for-each loop throws.',
`List<Integer> nums = new ArrayList<>(Arrays.asList(1, 2, 3, 4));
nums.removeIf(n -> n > 2);
// for (Integer n : nums) nums.remove(n);   // ConcurrentModificationException
System.out.println(nums);
// OUTPUT: [1, 2]`],
    ['Processing Map Entries', 'Stream the <code>entrySet()</code> to filter, sort and collect.',
`Map<String, Integer> marks = new HashMap<>();
marks.put("Asha", 82); marks.put("Ravi", 45); marks.put("Sam", 91);
marks.entrySet().stream()
        .filter(e -> e.getValue() > 50)
        .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
        .forEach(e -> System.out.println(e.getKey() + " " + e.getValue()));
// OUTPUT:
// Sam 91
// Asha 82`],
    ['Converting Collections to Streams', 'Call <code>stream()</code>. For a map, stream its keys, values or entries.',
`Map<String, Integer> m = new HashMap<>();
m.put("a", 1); m.put("b", 2);
System.out.println(m.values().stream().mapToInt(Integer::intValue).sum());
// OUTPUT: 3`],
];
export const java8CollectionApi = topic('java8-complete-collection-enhancements', 'Java 8 Complete: Collection API Enhancements', [
    group('A. Iterable and Collection', '<code>forEach</code>, <code>removeIf</code>, <code>stream</code> and <code>parallelStream</code>.'),
    ...ce.slice(0, 4).map(block),
    group('B. List Enhancements', '<code>replaceAll</code> and <code>sort</code>.'),
    ...ce.slice(4, 6).map(block),
    group('C. Map Enhancements', 'New default methods on <code>Map</code>.'),
    ...ce.slice(6, 16).map(block),
    group('D. Collection Processing', 'Everyday patterns that combine lambdas, streams and these methods.'),
    ...ce.slice(16).map(block),
], [
    ['compute vs computeIfAbsent vs computeIfPresent vs merge?', 'compute: always. computeIfAbsent: only if key missing. computeIfPresent: only if key exists. merge: insert the value or combine it with the existing one.'],
    ['Why is removeIf better than removing in a loop?', 'It is safe against ConcurrentModificationException and often faster.'],
]);

// ---- 9. Comparator ----
const cmp: Sub[] = [
    ['Lambda-Based Comparator', 'Write the comparison directly.',
`List<Integer> nums = new ArrayList<>(Arrays.asList(3, 1, 2));
nums.sort((a, b) -> a - b);
System.out.println(nums);
// OUTPUT: [1, 2, 3]`],
    ['Comparator.comparing()', 'Builds a comparator from a key extractor.',
`List<String> words = new ArrayList<>(Arrays.asList("pear", "fig", "apple"));
words.sort(Comparator.comparing(String::length));
System.out.println(words);
// OUTPUT: [fig, pear, apple]`],
    ['Comparator.comparingInt()', 'Like <code>comparing</code> for an int key, with no boxing.',
`List<String> words = new ArrayList<>(Arrays.asList("pear", "fig", "apple"));
words.sort(Comparator.comparingInt(String::length));
System.out.println(words);
// OUTPUT: [fig, pear, apple]`],
    ['Comparator.comparingLong()', 'For a long key.',
`List<Long> ids = new ArrayList<>(Arrays.asList(30L, 10L, 20L));
ids.sort(Comparator.comparingLong(Long::longValue));
System.out.println(ids);
// OUTPUT: [10, 20, 30]`],
    ['Comparator.comparingDouble()', 'For a double key.',
`List<Double> prices = new ArrayList<>(Arrays.asList(9.5, 2.25, 4.0));
prices.sort(Comparator.comparingDouble(Double::doubleValue));
System.out.println(prices);
// OUTPUT: [2.25, 4.0, 9.5]`],
    ['thenComparing()', 'A tie-breaker applied when the first comparator says equal.',
`List<String> names = new ArrayList<>(Arrays.asList("Sam", "Amy", "Bob", "Alexander"));
names.sort(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
System.out.println(names);
// OUTPUT: [Amy, Bob, Sam, Alexander]`],
    ['reversed()', 'Flips the order of a comparator.',
`List<Integer> nums = new ArrayList<>(Arrays.asList(1, 3, 2));
nums.sort(Comparator.<Integer>naturalOrder().reversed());
System.out.println(nums);
// OUTPUT: [3, 2, 1]`],
    ['naturalOrder()', 'The comparator that uses <code>compareTo</code>.',
`List<String> names = new ArrayList<>(Arrays.asList("b", "c", "a"));
names.sort(Comparator.naturalOrder());
System.out.println(names);
// OUTPUT: [a, b, c]`],
    ['reverseOrder()', 'The opposite of natural order.',
`List<String> names = new ArrayList<>(Arrays.asList("b", "c", "a"));
names.sort(Comparator.reverseOrder());
System.out.println(names);
// OUTPUT: [c, b, a]`],
    ['nullsFirst()', 'Wraps a comparator so null values come first.',
`List<String> names = new ArrayList<>(Arrays.asList("b", null, "a"));
names.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
System.out.println(names);
// OUTPUT: [null, a, b]`],
    ['nullsLast()', 'Wraps a comparator so null values come last.',
`List<String> names = new ArrayList<>(Arrays.asList("b", null, "a"));
names.sort(Comparator.nullsLast(Comparator.naturalOrder()));
System.out.println(names);
// OUTPUT: [a, b, null]`],
    ['Ascending Sorting', 'The default direction.',
`System.out.println(Stream.of(5, 3, 9).sorted().collect(Collectors.toList()));
// OUTPUT: [3, 5, 9]`],
    ['Descending Sorting', 'Use <code>reverseOrder()</code> or <code>reversed()</code>.',
`System.out.println(Stream.of(5, 3, 9).sorted(Comparator.reverseOrder()).collect(Collectors.toList()));
// OUTPUT: [9, 5, 3]`],
    ['Multi-Level Sorting', 'Chain several <code>thenComparing</code> calls, each with its own direction.',
`class Emp { String dept, name; Emp(String d, String n) { dept = d; name = n; } String getDept() { return dept; } String getName() { return name; } }
List<Emp> list = Arrays.asList(new Emp("IT", "Sam"), new Emp("HR", "Zoya"), new Emp("IT", "Amit"));
list.stream().sorted(Comparator.comparing(Emp::getDept).thenComparing(Emp::getName, Comparator.reverseOrder()))
        .forEach(e -> System.out.println(e.dept + " " + e.name));
// OUTPUT:
// HR Zoya
// IT Sam
// IT Amit`],
    ['Sorting Employees by Salary and Name', 'A classic interview question: highest salary first, then name A to Z.',
`class Emp { String name; double salary; Emp(String n, double s) { name = n; salary = s; } String getName() { return name; } double getSalary() { return salary; } }
List<Emp> emps = Arrays.asList(new Emp("Ravi", 50000), new Emp("Amit", 70000), new Emp("Asha", 70000));
emps.sort(Comparator.comparingDouble(Emp::getSalary).reversed().thenComparing(Emp::getName));
emps.forEach(e -> System.out.println(e.name + " " + e.salary));
// OUTPUT:
// Amit 70000.0
// Asha 70000.0
// Ravi 50000.0`],
];
export const java8Comparator = topic('java8-complete-comparator-enhancements', 'Java 8 Complete: Comparator Enhancements', cmp.map(block), [
    ['How do you sort by two fields in Java 8?', 'Comparator.comparing(A::f1).thenComparing(A::f2). Add reversed() or a comparator argument for direction.'],
    ['How do you sort with null values?', 'Wrap the comparator with Comparator.nullsFirst or nullsLast.'],
]);
