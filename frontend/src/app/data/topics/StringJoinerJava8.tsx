import { Topic } from '../coreJava';

export const stringJoinerJava8: Topic = {
    id: 'java8-string-joiner',
    name: 'String Joiner',
    beginner: [
        {
            content: `<h3>Java String Joiner</h3>
<p>Java 8 added the <code>StringJoiner</code> class to build a sequence of strings separated by a delimiter. It is a final class in the <code>java.util</code> package.</p>
<p>It handles delimiters, prefixes and suffixes for you. You pass a delimiter such as a comma (,) or hyphen (-) and add the parts.</p>
<h4>Key Features of StringJoiner:</h4>
<ol>
<li><b>Delimiter:</b> separates each string you add.</li>
<li><b>Optional prefix and suffix:</b> added around the final result.</li>
</ol>`,
            codeExamples: [
                `Example: 01 => Using StringJoiner without Prefix and Suffix
package com.javaschoollab.demo;
import java.util.StringJoiner;
public class Example {
    public static void main(String[] args) {
        StringJoiner stringJoiner = new StringJoiner(","); // comma as delimiter
        // Adding values to StringJoiner
        stringJoiner.add("Sheru");
        stringJoiner.add("Dheeraj");
        stringJoiner.add("Pankaj");

        System.out.println(stringJoiner);
    }
}

// OUTPUT: Sheru,Dheeraj,Pankaj`
            ]
        },
        {
            content: `<p><b>Explanation:</b></p>
<ol>
<li><b>Creating a StringJoiner:</b>
<ul>
<li><code>new StringJoiner(",")</code> uses a comma as the delimiter and no prefix or suffix.</li>
<li>To get brackets, use the three-argument form <code>new StringJoiner(", ", "[", "]")</code>.</li>
</ul></li>
<li><b>Adding strings:</b>
<ul>
<li><code>add("Sheru")</code>, <code>add("Dheeraj")</code> and <code>add("Pankaj")</code> append each value.</li>
</ul></li>
<li><b>Generating the result:</b>
<ul>
<li><code>System.out.println(stringJoiner)</code> calls <code>toString()</code> and prints <code>Sheru,Dheeraj,Pankaj</code>.</li>
</ul></li>
</ol>`,
            codeExamples: [
                `Example:02 => Merging StringJoiner Instances
You can also merge two StringJoiner instances using the merge method:
package com.javaschoollab.demo;
import java.util.StringJoiner;
public class MergeStringJoinerExample {
    public static void main(String[] args) {
        // Create first StringJoiner
        StringJoiner joiner1 = new StringJoiner(", ", "{", "}");
        joiner1.add("Udgir");
        joiner1.add("Latur");
        // Create second StringJoiner
        StringJoiner joiner2 = new StringJoiner(", ", "{", "}");
        joiner2.add("Pune");
        joiner2.add("Mumbai");
        // Merge joiner2 into joiner1
        joiner1.merge(joiner2);
        // Print the merged result
        System.out.println(joiner1.toString());
    }
}

// OUTPUT: {Udgir, Latur, Pune, Mumbai}`
            ]
        },
        {
            content:
                `<p><b>Explanation:</b></p>
<ol>
<li><b>Creating and adding:</b> two joiners (<code>joiner1</code> and <code>joiner2</code>) are created and filled with strings.</li>
<li><b>Merging:</b> <code>joiner1.merge(joiner2)</code> adds the contents of <code>joiner2</code> to <code>joiner1</code>. Only the parts are added, so <code>joiner2</code> prefix and suffix are not repeated.</li>
<li><b>Result:</b> <code>joiner1.toString()</code> prints <code>{Udgir, Latur, Pune, Mumbai}</code>.</li>
</ol>

<h4>Benefits of StringJoiner:</h4>
<ul>
<li><b>Ease of use:</b> delimiter, prefix and suffix are handled for you.</li>
<li><b>Readability:</b> no manual concatenation or last-separator checks.</li>
<li><b>Merging:</b> <code>merge()</code> combines several joiners.</li>
<li><b>Streams:</b> works with Java Streams through <code>Collectors.joining()</code>.</li>
</ul>

<h4>Limits of StringJoiner:</h4>
<ul>
<li><b>Java 8 or later:</b> not available in older versions.</li>
<li><b>Overkill for simple cases:</b> a plain <code>+</code> is enough for two or three parts.</li>
<li><b>Speed:</b> <code>StringBuilder</code> is lighter for many free-form appends.</li>
</ul>

<h4>Common Uses of StringJoiner in Java 8:</h4>

<h5>1. Building delimited strings (such as CSV)</h5>
<pre><code>StringJoiner joiner = new StringJoiner(", ");
joiner.add("Anaji").add("Baji").add("Chimnaji");
System.out.println(joiner);   // Anaji, Baji, Chimnaji</code></pre>

<h5>2. Formatting output with prefix and suffix</h5>
<pre><code>StringJoiner joiner = new StringJoiner(", ", "[", "]");
joiner.add("Red").add("Green").add("Blue");
System.out.println(joiner);   // [Red, Green, Blue]</code></pre>

<h5>3. Generating SQL text (use bound parameters for user data)</h5>
<pre><code>StringJoiner joiner = new StringJoiner(", ", "SELECT ", " FROM table");
joiner.add("column1").add("column2").add("column3");
System.out.println(joiner);   // SELECT column1, column2, column3 FROM table</code></pre>

<h5>4. Joining collection elements</h5>
<pre><code>List&lt;String&gt; items = Arrays.asList("item1", "item2", "item3");
StringJoiner joiner = new StringJoiner(", ");
items.forEach(joiner::add);
System.out.println(joiner);   // item1, item2, item3</code></pre>

<h5>5. Logging and debugging</h5>
<pre><code>StringJoiner joiner = new StringJoiner(" | ");
joiner.add("INFO").add("2024-11-26").add("Application started");
System.out.println(joiner);   // INFO | 2024-11-26 | Application started</code></pre>

<h5>6. Combining multiple joiners</h5>
<pre><code>StringJoiner joiner1 = new StringJoiner(", ", "{", "}");
joiner1.add("Java").add("Python");
StringJoiner joiner2 = new StringJoiner(", ", "{", "}");
joiner2.add("C++").add("JavaScript");
joiner1.merge(joiner2);
System.out.println(joiner1);  // {Java, Python, C++, JavaScript}</code></pre>`
        }
    ],
    intermediate: [
        {
            content: `<h3>Collectors.joining() - Building Delimited Strings from a Stream</h3>
Collectors.joining() is the Stream-API equivalent of StringJoiner - it concatenates stream elements with an optional delimiter, prefix, and suffix, replacing manual StringBuilder loops.<br>`,
            codeExamples: [
                `import java.util.List;
import java.util.stream.Collectors;

public class CollectorsJoiningDemo {
    public static void main(String[] args) {
        List<String> names = List.of("Sheru", "Pankaj", "Dheeraj");

        String joined = names.stream().collect(Collectors.joining(", ", "[", "]"));
        System.out.println(joined);
    }
}
// OUTPUT: [Sheru, Pankaj, Dheeraj]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The "Empty Value" Trap</h3>
When a <code>StringJoiner</code> has a prefix/suffix but nothing was ever added, <code>toString()</code> returns just <code>prefix + suffix</code> - not an empty string. <code>setEmptyValue()</code> lets you override that fallback with a custom string, which only takes effect while the joiner is still empty.<br>`,
            codeExamples: [
                `import java.util.StringJoiner;

public class EmptyValueDemo {
    public static void main(String[] args) {
        StringJoiner joiner = new StringJoiner(", ", "[", "]");
        System.out.println("Before setEmptyValue(): '" + joiner + "'");

        joiner.setEmptyValue("(no items)");
        System.out.println("After setEmptyValue():  '" + joiner + "'");

        joiner.add("Java");
        System.out.println("After adding an item:   '" + joiner + "'"); // setEmptyValue() no longer applies
    }
}
// OUTPUT:
// Before setEmptyValue(): '[]'
// After setEmptyValue():  '(no items)'
// After adding an item:   '[Java]'`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does StringJoiner return if nothing was ever added, with a prefix/suffix set?</td><td>Just the prefix concatenated with the suffix (e.g. "[]"), unless setEmptyValue() overrides that default</td></tr>
<tr class='text-center'><td>How is StringJoiner related to Collectors.joining()?</td><td>Collectors.joining() is built on top of StringJoiner internally - it's the Stream-API-friendly way to get the same delimiter/prefix/suffix behavior as a terminal collect operation</td></tr>
<tr class='text-center'><td>Is StringJoiner mutable?</td><td>Yes - add() and merge() mutate the same instance in place, unlike String's immutable concatenation</td></tr>
<tr class='text-center'><td>When would you prefer StringBuilder over StringJoiner?</td><td>When you don't need a delimiter/prefix/suffix pattern and are doing high-frequency, low-overhead concatenation - StringJoiner adds a small amount of bookkeeping for the delimiter logic</td></tr>
</table>`
        }
    ]
};
