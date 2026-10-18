import { Topic } from '../coreJava';

export const forEachMethodJava8: Topic = {
    id: 'java8-foreach-method',
    name: 'forEach Method',
    beginner: [
        {
            content:
                `<h3>forEach() Method</h3>
<ul>
<li>The <code>forEach()</code> method was added in Java 8. It runs a given action on each element of a collection, map or stream.</li>
<li>You write the action as a lambda expression, so the loop is short and easy to read.</li>
</ul>

<h4>Key Features of forEach():</h4>
<ol>
<li><b>Iterable interface:</b> available on every class that implements <code>Iterable</code>, such as <code>List</code> and <code>Set</code>.
<ul>
<li>Syntax: <code>default void forEach(Consumer&lt;? super T&gt; action)</code></li>
</ul>
</li>
<li><b>Stream interface:</b> available on stream objects as a terminal operation.
<ul>
<li>Syntax: <code>void forEach(Consumer&lt;? super T&gt; action)</code></li>
</ul>
</li>
</ol>`,
            codeExamples: [
                `// Example: forEach() with a List (Iterable)
package com.javaschoollab.demo;

import java.util.Arrays;
import java.util.List;

public class ForEachExample {
    public static void main(String[] args) {
        List<String> fruits = Arrays.asList("Apple", "Banana", "Cherry");

        // Using forEach() method with a lambda expression
        fruits.forEach(fruit -> System.out.println(fruit));
    }
}
// OUTPUT:
// Apple
// Banana
// Cherry`
            ]
        },
        {
            content: `<h4>Explanation: Iterable interface</h4>
<ul>
<li>The lambda <code>fruit -&gt; System.out.println(fruit)</code> is the <code>Consumer</code>. It receives each element of the list in turn.</li>
</ul>`,
            codeExamples: [
                `// Example: forEach() with a Stream
package com.javaschoollab.demo;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

public class StreamForEachExample {
    public static void main(String[] args) {
        List<String> list = Arrays.asList("Sheru", "Pankaj", "Dheeraj");

        // Creating a stream and using forEach() method
        Stream<String> listStream = list.stream();
        listStream.forEach(name -> System.out.println(name));
    }
}
// OUTPUT:
// Sheru
// Pankaj
// Dheeraj`
            ]
        },
        {
            content: `<h4>Explanation: Stream interface</h4>
<ul>
<li>The list is converted to a stream, and <code>forEach()</code> prints each element.</li>
</ul>

<h4>Benefits of forEach():</h4>
<ol>
<li><b>Conciseness:</b> shorter and more readable than a traditional loop.</li>
<li><b>Functional style:</b> the action is passed in as a function, so the code is easy to maintain.</li>
<li><b>Lambda expressions:</b> the action for each element is defined in one line.</li>
</ol>`,
            codeExamples: [
                `// Example 01: forEach with a Map
package com.javaschoollab.demo;

import java.util.HashMap;
import java.util.Map;

public class MapDemo {
    public static void main(String[] args) {
        Map<String, String> map = new HashMap<String, String>();
        map.put("10", "Sheru");
        map.put("11", "Dheeraj");
        map.put("12", "Pankaj");
        map.forEach((k, v) -> System.out.println("Key = " + k + ", Value = " + v));
    }
}
// OUTPUT: (HashMap order is not guaranteed)
// Key = 11, Value = Dheeraj
// Key = 12, Value = Pankaj
// Key = 10, Value = Sheru`,
                `// Example 02: forEach with a List
// Shows a lambda and a method reference over the same list
package com.javaschoollab.demo;

import java.util.Arrays;
import java.util.List;

public class ForEachListExample {
    public static void main(String[] args) {
        List<String> items = Arrays.asList("Item1", "Item2", "Item3", "Item4");
        // Using forEach() method with lambda expression
        items.forEach(item -> System.out.println(item));
        // Using method reference
        items.forEach(System.out::println);
    }
}
// OUTPUT:
// Item1
// Item2
// Item3
// Item4
// Item1
// Item2
// Item3
// Item4`,
                `// Example 03: forEach with a Map (entries, keys and values)
package com.javaschoollab.demo;

import java.util.HashMap;
import java.util.Map;

public class ForEachMapExample {
    public static void main(String[] args) {
        Map<Integer, String> map = new HashMap<>();
        map.put(1, "One");
        map.put(2, "Two");
        map.put(3, "Three");
        // Key and value together
        map.forEach((key, value) -> System.out.println(key + " = " + value));
        // Keys only
        map.keySet().forEach(System.out::println);
        // Values only
        map.values().forEach(System.out::println);
    }
}
// OUTPUT:
// 1 = One
// 2 = Two
// 3 = Three
// 1
// 2
// 3
// One
// Two
// Three`,
                `// Example 04: forEach with a Set
package com.javaschoollab.demo;

import java.util.HashSet;
import java.util.Set;

public class ForEachSetExample {
    public static void main(String[] args) {
        Set<String> set = new HashSet<>();
        set.add("Element1");
        set.add("Element2");
        set.add("Element3");
        // Using forEach() method with lambda expression
        set.forEach(element -> System.out.println(element));
        // Using method reference
        set.forEach(System.out::println);
    }
}
// OUTPUT: (HashSet order is unspecified; the set is printed twice)
// Element1
// Element2
// Element3
// Element1
// Element2
// Element3`,
                `// Example 05: forEach with an array
// Arrays.asList wraps the array so we can call forEach
package com.javaschoollab.demo;

import java.util.Arrays;

public class ForEachArrayExample {
    public static void main(String[] args) {
        String[] array = { "A", "B", "C", "D" };
        // Convert array to list and use forEach() method
        Arrays.asList(array).forEach(element -> System.out.println(element));
        // Using method reference
        Arrays.asList(array).forEach(System.out::println);
    }
}
// OUTPUT:
// A
// B
// C
// D
// A
// B
// C
// D`,
                `// Example 06: forEach with a stream and filter
package com.javaschoollab.demo;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class ForEachStreamExample {
    public static void main(String[] args) {
        List<String> names = Arrays.asList("Sheru", "Pankaj", "Dheeraj", "Udgir");
        // forEach after filter
        names.stream().filter(name -> name.startsWith("S")).forEach(System.out::println);
        // Collect first, then forEach
        List<String> filteredNames = names.stream()
                .filter(name -> name.contains("a"))
                .collect(Collectors.toList());
        filteredNames.forEach(System.out::println);
    }
}
// OUTPUT:
// Sheru
// Pankaj
// Dheeraj`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>forEach() Cannot Break, Return, or Modify the Collection Mid-Iteration</h3>
<ul>
<li><code>forEach()</code> takes a <code>Consumer</code>, so there is no way to <code>break</code> out early.</li>
<li><code>return</code> inside the lambda only ends that one call of the Consumer. It works like <code>continue</code>.</li>
<li>Adding or removing elements of the source collection while <code>forEach()</code> runs throws <code>ConcurrentModificationException</code>, just like a for-each loop.</li>
</ul>`,
            codeExamples: [
                `import java.util.*;

public class ForEachLimitationsDemo {
    public static void main(String[] args) {
        List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5));

        // "return" only skips the current element, it does NOT break the loop
        numbers.forEach(n -> {
            if (n == 3) return; // skips printing 3, iteration continues
            System.out.println("Value: " + n);
        });

        // Structural change during forEach() throws an exception
        try {
            numbers.forEach(n -> {
                if (n == 2) numbers.remove(Integer.valueOf(2));
            });
        } catch (ConcurrentModificationException e) {
            System.out.println("Caught: " + e.getClass().getSimpleName());
        }
    }
}
// OUTPUT:
// Value: 1
// Value: 2
// Value: 4
// Value: 5
// Caught: ConcurrentModificationException`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Can you break out of a forEach() loop early?</td><td>No. Consumer has no way to signal "stop". Use a traditional for-each loop, or a stream with a short-circuiting operation like anyMatch() or findFirst().</td></tr>
<tr class='text-center'><td>What happens if you remove an element from a list while iterating it with forEach()?</td><td>It throws ConcurrentModificationException, the same as in a regular for-each loop.</td></tr>
<tr class='text-center'><td>Which interfaces provide forEach()?</td><td>Iterable (default method, used by List and Set), Map (its own version taking a BiConsumer for key and value), and Stream (a terminal operation).</td></tr>
<tr class='text-center'><td>Is Map.forEach() the same signature as Iterable.forEach()?</td><td>No. Map.forEach() takes a BiConsumer&lt;K,V&gt;, so both key and value are available. Iterable.forEach() takes a single-argument Consumer&lt;T&gt;.</td></tr>
</table>`
        }
    ]
};
