import { Topic } from '../coreJava';

export const streamApiJava8: Topic = {
    id: 'java8-stream-api',
    name: 'Stream API',
    beginner: [
        {
            content:
                `<h3>Java 8 Stream</h3>
<p>Java 8 added the package <code>java.util.stream</code>. It holds the classes, interfaces and enums for functional-style operations on elements. Import it to use streams.</p>
<p>A stream has these features:</p>
<ul>
<li><b>No storage:</b> a stream does not store elements. It carries them from a source (a collection, an array or an I/O channel) through a pipeline of operations.</li>
<li><b>Functional:</b> operations do not change the source. Filtering a stream built from a collection gives a new stream without the filtered elements. The collection is untouched.</li>
<li><b>Lazy:</b> the code runs only when a result is needed.</li>
<li><b>Single use:</b> like an <code>Iterator</code>, a stream is visited once. Create a new stream to visit the elements again.</li>
</ul>
<p>You can use a stream to filter, collect, print and convert one data structure into another. The examples below show these operations.</p>`,
            codeExamples: [
                `Example of Stream API Demonstration

 Filtering and Iterating Collection
 Filtering Collection by using Stream
 Filtering Collection without using Stream
 reduce() Method in Collection
 Sum by using Collectors Methods
 Find Max and Min Product Price
 count() Method in Collection
 Convert List into Set

 Convert List into Map

package com.javaschoollab.demo;
import java.util.*;
import java.util.stream.Collectors;
class Product {
int id;
String name;
double price;
//--------------------------------------------------------------------
// Generate Constructor Using Fields
public Product(int id, String name, double price) {
this.id = id;
this.name = name;
this.price = price;
}
//--------------------------------------------------------------------
// Generate Getter and Setter
public int getId() {
return id;
}
public String getName() {
return name;
}
public double getPrice() {
return price;
}
//--------------------------------------------------------------------
// Generate toString() Method
@Override
public String toString() {
return "Product{id=" + id + ", name='" + name + "', price=" + price + "}";
}
//--------------------------------------------------------------------
}

public class StreamApiDemo {
public static void main(String[] args) {
List<Product> products = Arrays.asList(
    new Product(1, "Laptop", 800), new Product(2, "Smartphone", 500),
    new Product(3, "Tablet", 300), new Product(4, "Smartwatch", 200),
    new Product(5, "Headphones", 100));

// Filtering and Iterating Collection
System.out.println("Filtering and Iterating Collection:");
products.stream().filter(p -> p.getPrice() > 300).forEach(System.out::println);
// Filtering Collection by using Stream
System.out.println("\\nFiltering Collection by using Stream:");

List<Product> filteredProducts = products.stream()
    .filter(p -> p.getPrice() > 300).collect(Collectors.toList());
filteredProducts.forEach(System.out::println);
// Filtering Collection without using Stream
System.out.println("\\nFiltering Collection without using Stream:");
List<Product> filteredProductsWithoutStream = new ArrayList<>();
for (Product p : products) {
if (p.getPrice() > 300) {
filteredProductsWithoutStream.add(p);
}
}
for (Product p : filteredProductsWithoutStream) {
System.out.println(p);
}
// reduce() Method in Collection
System.out.println("\\nUsing reduce() Method:");
double totalPrice = products.stream().map(Product::getPrice).reduce(0.0, Double::sum);
System.out.println("Total Price: " + totalPrice);
// Sum by using Collectors Methods
System.out.println("\\nSum by using Collectors:");
double sumPrice = products.stream().collect(Collectors.summingDouble(Product::getPrice));
System.out.println("Sum of Prices: " + sumPrice);
// Find Max and Min Product Price

System.out.println("\\nFind Max and Min Product Price:");
Product maxPriceProduct = products.stream().max(Comparator.comparing(Product::getPrice))
.orElseThrow(NoSuchElementException::new);
Product minPriceProduct = products.stream().min(Comparator.comparing(Product::getPrice))
.orElseThrow(NoSuchElementException::new);
System.out.println("Max Price Product: " + maxPriceProduct);
System.out.println("Min Price Product: " + minPriceProduct);
// count() Method in Collection
System.out.println("\\nCount Method:");
long count = products.stream().filter(p -> p.getPrice() > 300).count();
System.out.println("Count of Products with Price > 300: " + count);
// Convert List into Set
System.out.println("\\nConvert List into Set:");
Set<Product> productSet = products.stream().collect(Collectors.toSet());
productSet.forEach(System.out::println);
// Convert List into Map
System.out.println("\\nConvert List into Map:");
Map<Integer, String> productMap = products.stream()
    .collect(Collectors.toMap(Product::getId, Product::getName));
productMap.forEach((id, name) -> System.out.println("ID: " + id + ", Name: " + name));
}
}


OUTPUT:
Filtering and Iterating Collection:
Product{id=1, name='Laptop', price=800.0}
Product{id=2, name='Smartphone', price=500.0}
Filtering Collection by using Stream:
Product{id=1, name='Laptop', price=800.0}
Product{id=2, name='Smartphone', price=500.0}
Filtering Collection without using Stream:
Product{id=1, name='Laptop', price=800.0}
Product{id=2, name='Smartphone', price=500.0}
Using reduce() Method:
Total Price: 1900.0


Sum by using Collectors:
Sum of Prices: 1900.0
Find Max and Min Product Price:
Max Price Product: Product{id=1, name='Laptop', price=800.0}
Min Price Product: Product{id=5, name='Headphones', price=100.0}
Count Method:
Count of Products with Price > 300: 2
Convert List into Set:
Product{id=1, name='Laptop', price=800.0}
Product{id=2, name='Smartphone', price=500.0}
Product{id=5, name='Headphones', price=100.0}
Product{id=4, name='Smartwatch', price=200.0}
Product{id=3, name='Tablet', price=300.0}
Convert List into Map:
ID: 1, Name: Laptop
ID: 2, Name: Smartphone
ID: 3, Name: Tablet
ID: 4, Name: Smartwatch
ID: 5, Name: Headphones`
            ]
        },
        {
            content:
                `<p>Explanation of the example above:</p>
<ol>
<li><b>Product class:</b> holds the <code>id</code>, <code>name</code> and <code>price</code> of a product.</li>
<li><b>Filtering and iterating:</b> keeps products with a price above 300 and prints them.</li>
<li><b>Filtering with a stream:</b> filters and collects the result into a list.</li>
<li><b>Filtering without a stream:</b> the traditional way, with a for-each loop.</li>
<li><b><code>reduce()</code>:</b> adds up the prices of all products.</li>
<li><b><code>Collectors.summingDouble</code>:</b> sums the prices of all products.</li>
<li><b><code>max</code> and <code>min</code>:</b> find the products with the highest and lowest price.</li>
<li><b><code>count()</code>:</b> counts the products with a price above 300.</li>
<li><b>List to Set:</b> converts the list into a set. A <code>HashSet</code> has no fixed order, so the printed order can differ.</li>
<li><b>List to Map:</b> uses product ids as keys and product names as values.</li>
</ol>
<p>The Streams API (Java 8) processes sequences of elements in a functional and declarative way. You can filter, map and reduce data without changing the original source.</p>
<h4>Key Features of Java Streams</h4>
<ol>
<li><b>Functional programming:</b> functional-style operations give readable, short code.</li>
<li><b>Lazy evaluation:</b> intermediate operations do not run until a terminal operation is called. This avoids needless work.</li>
<li><b>Pipeline processing:</b> operations are chained into a pipeline.</li>
<li><b>Parallel processing:</b> streams can run in parallel to use multicore processors.</li>
</ol>
<h4>Stream Operations</h4>
<ol>
<li><b>Intermediate operations</b> return a new stream and are lazy. Examples: <code>filter</code>, <code>map</code>, <code>sorted</code>.</li>
<li><b>Terminal operations</b> produce a result or a side effect and end the pipeline. Examples: <code>forEach</code>, <code>collect</code>, <code>reduce</code>.</li>
</ol>`,
            codeExamples: [
                `Example: 01 => Creating and Using Streams

package com.javaschoollab.demo;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
public class StreamExample {
public static void main(String[] args) {
List<String> names = Arrays.asList("Sheru", "Pankaj", "Dheeraj", "Udgir");

// Filtering and collecting names that start with 'S'

List<String> filteredNames = names.stream()
    .filter(name -> name.startsWith("S")).collect(Collectors.toList());
System.out.println("Filtered Names: " + filteredNames);
// Mapping and collecting the lengths of names
List<Integer> nameLengths = names.stream().map(String::length).collect(Collectors.toList());
System.out.println("Name Lengths: " + nameLengths);
// Reducing to concatenate all names
String concatenatedNames = names.stream()
    .reduce("", (partialString, element) -> partialString + element);
System.out.println("Concatenated Names: " + concatenatedNames);
}
}


OUTPUT:
Filtered Names: [Sheru]
Name Lengths: [5, 6, 7, 5]
Concatenated Names: SheruPankajDheerajUdgir`
            ]
        },
        {
            content:
                `<p>Explanation:</p>
<ol>
<li><b>Creating a stream:</b> <code>names.stream()</code> creates a stream from the list.</li>
<li><b>Filtering:</b> <code>filter(name -&gt; name.startsWith("S"))</code> keeps only names that start with "S".</li>
<li><b>Collecting:</b> <code>collect(Collectors.toList())</code> gathers the results into a list.</li>
<li><b>Mapping:</b> <code>map(String::length)</code> turns each name into its length.</li>
<li><b>Reducing:</b> <code>reduce("", (partialString, element) -&gt; partialString + element)</code> joins all names into one string.</li>
</ol>
<h4>Parallel Streams</h4>
<p>You can use a parallel stream to run the work on several cores.</p>`,
            codeExamples: [
                `package com.javaschoollab.demo;
import java.util.Arrays;
import java.util.List;

public class ParallelStreamExample {
public static void main(String[] args) {
List<String> names = Arrays.asList("Sheru", "Pankaj", "Dheeraj", "Udgir");
// Using parallel stream
names.parallelStream()
    .filter(name -> name.startsWith("S")).forEach(System.out::println);
}
}


OUTPUT: Sheru`
            ]
        },
        {
            content:
                `<h4>Summary</h4>
<p>The Streams API brings functional programming to Java and gives more readable, maintainable code. Lazy evaluation, pipelines and parallel execution make collections easier to work with. More examples follow.</p>`,
            codeExamples: [
                `Example 1: Filtering and Mapping

Filter out empty strings from a list and then convert the remaining strings to uppercase.

package com.javaschoollab.demo;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
public class FilterMapExample {
public static void main(String[] args) {
List<String> names = Arrays.asList("Sheru", "", "Pankaj", "Dheeraj", "");
// Filter non-empty strings and convert to uppercase
List<String> filteredNames = names.stream()
.filter(name -> !name.isEmpty())
.map(String::toUpperCase)
.collect(Collectors.toList());
System.out.println("Filtered and Uppercase Names: " + filteredNames);
}
}


OUTPUT: Filtered and Uppercase Names: [SHERU, PANKAJ, DHEERAJ]


Example 2: Sorting
Sort a list of integers.

package com.javaschoollab.demo;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
public class SortExample {
public static void main(String[] args) {
List<Integer> numbers = Arrays.asList(3, 7, 2, 8, 1, 5);
// Sort the numbers
List<Integer> sortedNumbers = numbers.stream().sorted().collect(Collectors.toList());
System.out.println("Sorted Numbers: " + sortedNumbers);
}
}


OUTPUT: Sorted Numbers: [1, 2, 3, 5, 7, 8]


Example 3: Distinct and Limit
Get distinct elements and limit the result to a certain number.

package com.javaschoollab.demo;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
public class DistinctLimitExample {
public static void main(String[] args) {
List<String> items = Arrays.asList("Apple", "Banana", "Apple", "Orange", "Banana", "Apple");
// Get distinct items and limit the result to 3
List<String> distinctItems = items.stream()
.distinct()
.limit(3)
.collect(Collectors.toList());
System.out.println("Distinct Items: " + distinctItems);
}
}


OUTPUT: Distinct Items: [Apple, Banana, Orange]


Example 4: Reduce
Calculate the sum of a list of integers using reduce.

package com.javaschoollab.demo;
import java.util.Arrays;
import java.util.List;
public class ReduceExample {
public static void main(String[] args) {
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);
// Calculate the sum
int sum = numbers.stream().reduce(0, Integer::sum);
System.out.println("Sum: " + sum);
}
}


OUTPUT: Sum: 15


Example 5: Grouping By
Group a list of strings by their length.

package com.javaschoollab.demo;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
public class GroupByExample {
public static void main(String[] args) {
List<String> items = Arrays.asList("Apple", "Banana", "Cherry", "Date");
// Group items by length
Map<Integer, List<String>> groupedByLength = items.stream()
.collect(Collectors.groupingBy(String::length));
System.out.println("Grouped by Length: " + groupedByLength);
}
}


OUTPUT: Grouped by Length: {4=[Date], 5=[Apple], 6=[Banana, Cherry]}


Example 6: Partitioning By
Partition a list of integers into even and odd numbers.

package com.javaschoollab.demo;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
public class PartitionByExample {
public static void main(String[] args) {
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
// Partition numbers into even and odd
Map<Boolean, List<Integer>> partitioned = numbers.stream()
.collect(Collectors.partitioningBy(num -> num % 2 == 0));
System.out.println("Even Numbers: " + partitioned.get(true));
System.out.println("Odd Numbers: " + partitioned.get(false));
}
}


OUTPUT:
Even Numbers: [2, 4, 6, 8, 10]
Odd Numbers: [1, 3, 5, 7, 9]


Example 7: Parallel Stream
Process a list of numbers in parallel.

package com.javaschoollab.demo;
import java.util.Arrays;
import java.util.List;
public class ParallelStreamExample {
public static void main(String[] args) {
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
// Process numbers in parallel
numbers.parallelStream()
    .forEach(num -> System.out.println("Number: " + num + " - "
        + Thread.currentThread().getName()));
}
}


OUTPUT:
Number: 7 - main
Number: 4 - ForkJoinPool.commonPool-worker-5
Number: 6 - main
Number: 8 - ForkJoinPool.commonPool-worker-5
Number: 5 - ForkJoinPool.commonPool-worker-3
Number: 3 - ForkJoinPool.commonPool-worker-1
Number: 10 - ForkJoinPool.commonPool-worker-5
Number: 9 - ForkJoinPool.commonPool-worker-4
Number: 1 - main
Number: 2 - ForkJoinPool.commonPool-worker-2`
            ]
        }
    ],
    intermediate: [
        {
            content: `<h3>Primitive Streams - IntStream, LongStream, DoubleStream</h3>
Wrapping every int in an Integer for a Stream&lt;Integer&gt; wastes memory and boxing/unboxing cycles. IntStream/LongStream/DoubleStream operate directly on primitives and add numeric-only operations like sum(), average(), and range()/rangeClosed().<br>`,
            codeExamples: [
                `import java.util.stream.IntStream;

public class PrimitiveStreamDemo {
    public static void main(String[] args) {
        // range() is exclusive of the end, rangeClosed() is inclusive
        int sum = IntStream.rangeClosed(1, 10).sum();
        System.out.println("Sum 1 to 10: " + sum);

        double avg = IntStream.of(4, 8, 15, 16, 23, 42).average().orElse(0);
        System.out.println("Average: " + avg);

        // boxed() converts IntStream back to Stream<Integer> when objects are needed
        IntStream.range(0, 5).boxed().forEach(n -> System.out.print(n + " "));
    }
}
// OUTPUT:
// Sum 1 to 10: 55
// Average: 18.0
// 0 1 2 3 4 `
            ]
        },
        {
            content: `<h3>Stream.iterate() and Stream.generate() - Infinite Streams</h3>
Streams don't have to come from a collection. iterate() builds an infinite stream by repeatedly applying a function to the previous value; generate() builds one by repeatedly calling a Supplier. Both are lazy, so they must be bounded with limit() before a terminal operation.<br>`,
            codeExamples: [
                `import java.util.stream.Stream;

public class StreamIterateGenerateDemo {
    public static void main(String[] args) {
        // iterate: seed, then apply function repeatedly - first 5 powers of 2
        Stream.iterate(1, n -> n * 2)
              .limit(5)
              .forEach(n -> System.out.print(n + " "));
        System.out.println();

        // generate: Supplier called repeatedly - 3 fixed greeting strings
        Stream.generate(() -> "Hi")
              .limit(3)
              .forEach(System.out::println);
    }
}
// OUTPUT:
// 1 2 4 8 16
// Hi
// Hi
// Hi`
            ]
        },
        {
            content: `<h3>Stream.concat() - Merging Two Streams</h3>
Stream.concat() lazily concatenates two streams into one, in order, without materializing either stream first.<br>`,
            codeExamples: [
                `import java.util.List;
import java.util.stream.Stream;

public class StreamConcatDemo {
    public static void main(String[] args) {
        Stream<String> first = Stream.of("Sheru", "Pankaj");
        Stream<String> second = Stream.of("Dheeraj", "Udgir");

        Stream.concat(first, second).forEach(System.out::println);
    }
}
// OUTPUT:
// Sheru
// Pankaj
// Dheeraj
// Udgir`
            ]
        },
        {
            content: `<h3>Collectors.groupingBy() with a Downstream Collector</h3>
groupingBy() alone produces a Map&lt;Key, List&lt;Element&gt;&gt;. Passing a second, "downstream" collector (counting(), mapping(), summingInt()...) lets you reduce each group to something other than a plain list - e.g. a count per group.<br>`,
            codeExamples: [
                `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class GroupingByDownstreamDemo {
    public static void main(String[] args) {
        List<String> names = List.of("Sheru", "Sam", "Pankaj", "Prataprao", "Dheeraj");

        // Group by first letter, then count how many names fall in each group
        Map<Character, Long> countByFirstLetter = names.stream()
            .collect(Collectors.groupingBy(n -> n.charAt(0), Collectors.counting()));

        System.out.println(countByFirstLetter);
    }
}
// OUTPUT: {D=1, P=2, S=2}`
            ]
        },
        {
            content: `<h3>Collectors.partitioningBy() with a Downstream Collector</h3>
partitioningBy() is a specialized groupingBy() that always splits into exactly two groups keyed by true/false. Combined with a downstream collector it can, for example, count each partition directly instead of returning the raw lists.<br>`,
            codeExamples: [
                `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class PartitioningByDownstreamDemo {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

        Map<Boolean, Long> countByEvenOdd = numbers.stream()
            .collect(Collectors.partitioningBy(n -> n % 2 == 0, Collectors.counting()));

        System.out.println("Even count: " + countByEvenOdd.get(true));
        System.out.println("Odd count: " + countByEvenOdd.get(false));
    }
}
// OUTPUT:
// Even count: 5
// Odd count: 5`
            ]
        },
        {
            content: `<h3>Collectors.toMap() with a Merge Function</h3>
Collectors.toMap() throws IllegalStateException if two elements produce the same key. A third "merge function" argument tells it how to resolve duplicate keys instead of crashing - here we keep the higher salary.<br>`,
            codeExamples: [
                `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CollectorsToMapMergeDemo {
    record Employee(String department, String name, double salary) {}

    public static void main(String[] args) {
        List<Employee> employees = List.of(
            new Employee("IT", "Pankaj", 60000),
            new Employee("IT", "Sheru", 75000),
            new Employee("HR", "Dheeraj", 50000)
        );

        // Duplicate "IT" keys resolved by keeping the higher salary
        Map<String, Double> maxSalaryByDept = employees.stream()
            .collect(Collectors.toMap(Employee::department, Employee::salary, Double::max));

        System.out.println(maxSalaryByDept);
    }
}
// OUTPUT: {HR=50000.0, IT=75000.0}`
            ]
        },
        {
            content: `<h3>IntSummaryStatistics - One Pass, Five Metrics</h3>
Collectors.summarizingInt() (or IntStream.summaryStatistics()) computes count, sum, min, max, and average in a single pass over the data, avoiding five separate stream traversals.<br>`,
            codeExamples: [
                `import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.stream.Collectors;

public class IntSummaryStatisticsDemo {
    record Product(String name, int price) {}

    public static void main(String[] args) {
        List<Product> products = List.of(
            new Product("Laptop", 800),
            new Product("Tablet", 300),
            new Product("Phone", 500)
        );

        IntSummaryStatistics stats = products.stream()
            .collect(Collectors.summarizingInt(Product::price));

        System.out.println("Count: " + stats.getCount());
        System.out.println("Sum: " + stats.getSum());
        System.out.println("Min: " + stats.getMin());
        System.out.println("Max: " + stats.getMax());
        System.out.println("Average: " + stats.getAverage());
    }
}
// OUTPUT:
// Count: 3
// Sum: 1600
// Min: 300
// Max: 800
// Average: 533.3333333333334`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Stream Pipeline Internals - Laziness Proven</h3>
A Stream pipeline does nothing until a <strong>terminal operation</strong> is invoked. Intermediate operations (filter, map, sorted, peek) are just descriptions that get fused and executed element-by-element only when a terminal operation (forEach, collect, reduce, count...) pulls elements through. Below, peek() proves this: notice the interleaved order rather than "all filters, then all maps".<br>`,
            codeExamples: [
                `import java.util.*;
import java.util.stream.*;

public class LazyStreamDemo {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Sheru", "Pankaj", "Dheeraj", "Udgir");

        System.out.println("Building pipeline (nothing prints yet)...");
        Stream<String> pipeline = names.stream()
                .peek(n -> System.out.println("filter-stage saw: " + n))
                .filter(n -> n.length() > 5)
                .peek(n -> System.out.println("map-stage saw:    " + n))
                .map(String::toUpperCase);

        System.out.println("Pipeline built, still nothing executed.");
        System.out.println("Now invoking terminal operation collect():");
        List<String> result = pipeline.collect(Collectors.toList());
        System.out.println("Result: " + result);
    }
}
// OUTPUT:
// Building pipeline (nothing prints yet)...
// Pipeline built, still nothing executed.
// Now invoking terminal operation collect():
// filter-stage saw: Sheru
// filter-stage saw: Pankaj
// map-stage saw:    Pankaj
// filter-stage saw: Dheeraj
// map-stage saw:    Dheeraj
// filter-stage saw: Udgir
// Result: [PANKAJ, DHEERAJ]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can a Stream be reused after a terminal operation?</td><td>No - once a terminal operation runs, the stream is considered consumed; calling another operation on it throws IllegalStateException</td></tr>
<tr class='text-center'><td>Are intermediate operations eager or lazy?</td><td>Lazy - filter/map/sorted just build a pipeline description; nothing executes until a terminal operation (collect/forEach/reduce/count) is invoked</td></tr>
<tr class='text-center'><td>Difference between map() and flatMap()?</td><td>map() transforms each element 1-to-1 (can produce a stream of streams for nested structures); flatMap() transforms each element into a stream and flattens all of them into one flat stream</td></tr>
<tr class='text-center'><td>Does a Stream modify its source collection?</td><td>No - stream operations like filter() produce a new stream/result; the original source collection is left untouched</td></tr>
<tr class='text-center'><td>What's the difference between Stream and parallelStream()?</td><td>stream() processes elements sequentially on one thread; parallelStream() splits the work across multiple threads via the common ForkJoin pool - useful for large datasets with CPU-heavy, independent per-element work</td></tr>
</table>`
        }
    ]
};
