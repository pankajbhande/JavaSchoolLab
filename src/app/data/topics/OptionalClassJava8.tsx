import { Topic } from '../coreJava';

export const optionalClassJava8: Topic = {
    id: 'java8-optional-class',
    name: 'Optional Class',
    beginner: [
        {
            content: `<h3>Optional Class</h3>
<p>Java 8 introduced the <code>Optional</code> class to handle null values more gracefully. It lowers the risk of <code>NullPointerException</code> and makes a missing value explicit.</p>
<p>It is a public final class in the <code>java.util</code> package, so you must import it. Its methods let you check whether a value is present.</p>
<p><b>Why?</b> Calling a method on a null reference fails:</p>
<pre><code>package com.test;
public class MapDemo {
    public static void main(String[] args) {
        String[] str = new String[10];
        String lowercaseString = str[5].toLowerCase();
        System.out.print(lowercaseString);
    }
}
// Exception in thread "main" java.lang.NullPointerException
//     at com.test.MapDemo.main(MapDemo.java:5)</code></pre>`,
            codeExamples: [
                `package com.test;
import java.util.Optional;

public class MapDemo {
public static void main(String[] args) {
String[] str = new String[10];
Optional<String> checkNull = Optional.ofNullable(str[5]);
if (checkNull.isPresent()) { // check for value is present or not
String lowercaseString = str[5].toLowerCase();
System.out.print(lowercaseString);
} else
System.out.println("string value is not present");
}
}

Output
string value is not present.`
            ]
        },
        {
            content: `<h4>Key Features of Optional Class</h4>
<ol>
<li><b>Presence or absence:</b> an <code>Optional</code> holds a value that is either present or absent (null).</li>
<li><b>Methods:</b> many methods handle the present and absent cases.</li>
</ol>
<h4>Common Methods</h4>
<ul>
<li><code>empty()</code>: returns an empty Optional.<br><code>Optional&lt;String&gt; emptyOpt = Optional.empty();</code></li>
<li><code>of(T value)</code>: returns an Optional holding the non-null value.<br><code>Optional&lt;String&gt; opt = Optional.of("Hello");</code></li>
<li><code>ofNullable(T value)</code>: returns an Optional with the value, or an empty Optional if the value is null.<br><code>Optional&lt;String&gt; nullableOpt = Optional.ofNullable(null);</code></li>
<li><code>isPresent()</code>: returns true if a value is present, otherwise false.<br><code>boolean isPresent = opt.isPresent();</code></li>
<li><code>ifPresent(Consumer&lt;? super T&gt; consumer)</code>: runs the action with the value if present, otherwise does nothing.<br><code>opt.ifPresent(value -&gt; System.out.println("Value is: " + value));</code></li>
<li><code>orElse(T other)</code>: returns the value if present, otherwise returns <code>other</code>.<br><code>String value = nullableOpt.orElse("Default Value");</code></li>
<li><code>orElseGet(Supplier&lt;? extends T&gt; other)</code>: returns the value if present, otherwise calls the supplier and returns its result.<br><code>String value = nullableOpt.orElseGet(() -&gt; "Default Value from Supplier");</code></li>
<li><code>orElseThrow(Supplier&lt;? extends X&gt; exceptionSupplier)</code>: returns the value if present, otherwise throws the exception the supplier creates.<br><code>nullableOpt.orElseThrow(() -&gt; new IllegalArgumentException("Value is absent"));</code></li>
</ul>`,
            codeExamples: [
                `Example Code: Here's a simple example to illustrate the use of Optional:
package com.javaschoollab.demo;
import java.util.Optional;
public class OptionalExample {
public static void main(String[] args) {
// Creating an Optional with a non-null value
Optional<String> nonEmptyOpt = Optional.of("Hello, World!");
// Creating an Optional that can be empty
Optional<String> emptyOpt = Optional.empty();
// Creating an Optional that might be null
Optional<String> nullableOpt = Optional.ofNullable(null);
// Checking if the value is present
if (nonEmptyOpt.isPresent()) {
System.out.println("Value: " + nonEmptyOpt.get());
}
// Using ifPresent to perform an action if a value is present
nonEmptyOpt.ifPresent(
    value -> System.out.println("Value using ifPresent: " + value));
// Providing a default value if the Optional is empty
String value = nullableOpt.orElse("Default Value");
System.out.println("Value with orElse: " + value);
// Using orElseGet with a supplier
value = nullableOpt.orElseGet(() -> "Default Value from Supplier");

System.out.println("Value with orElseGet: " + value);
// Throwing an exception if the value is absent
try {
value = nullableOpt.orElseThrow(
    () -> new IllegalArgumentException("Value is absent"));
System.out.println("Value with orElseThrow: " + value);
} catch (Exception e) {
System.err.println(e.getMessage());
}
}
}


OUTPUT:
Value: Hello, World!
Value using ifPresent: Hello, World!
Value with orElse: Default Value
Value with orElseGet: Default Value from Supplier
Value is absent`
            ]
        },
        {
            content: `<h4>Explanation</h4>
<ol>
<li><b>Creating Optionals</b>
<ul>
<li><code>Optional.of("Hello, World!")</code> creates an Optional with a non-null value.</li>
<li><code>Optional.empty()</code> creates an empty Optional.</li>
<li><code>Optional.ofNullable(null)</code> creates an empty Optional here; it accepts null safely.</li>
</ul></li>
<li><b>Checking presence</b>
<ul>
<li><code>isPresent()</code> checks if a value is present.</li>
<li><code>ifPresent()</code> performs an action if a value is present.</li>
</ul></li>
<li><b>Providing default values</b>
<ul>
<li><code>orElse("Default Value")</code> gives a default if the Optional is empty.</li>
<li><code>orElseGet(() -&gt; "Default Value from Supplier")</code> gives a default from a supplier if the Optional is empty.</li>
</ul></li>
<li><b>Throwing exceptions</b>
<ul>
<li><code>orElseThrow(() -&gt; new IllegalArgumentException("Value is absent"))</code> throws if the Optional is empty.</li>
</ul></li>
</ol>
<p>In short, <code>Optional</code> handles missing values gracefully, lowers the risk of null pointer exceptions and keeps code readable.</p>`,
            codeExamples: [
                `Example 1: Combining Optionals

You can combine two Optional objects using methods like flatMap.
package com.javaschoollab.demo;
import java.util.Optional;
public class OptionalCombineExample {
public static void main(String[] args) {
Optional<String> firstName = Optional.of("Pankaj");
Optional<String> lastName = Optional.of("Bhande");
// Combining Optionals
Optional<String> fullName =
    firstName.flatMap(fn -> lastName.map(ln -> fn + " " + ln));
fullName.ifPresent(name -> System.out.println("Full Name: " + name));
}
}

OUTPUT: Full Name: Pankaj Bhande


Example 2: Filtering Values
You can use the filter method to conditionally process the value within an Optional.
package com.javaschoollab.demo;
import java.util.Optional;
public class OptionalFilterExample {
public static void main(String[] args) {
Optional<String> opt = Optional.of("Hello Pankaj");
// Filter the value
Optional<String> filteredOpt = opt.filter(value -> value.contains("Pankaj"));
filteredOpt.ifPresent(value -> System.out.println("Filtered Value: " + value));
}
}

OUTPUT: Filtered Value: Hello Pankaj


Example 3: Chaining Optionals
You can chain multiple Optional methods to perform more complex operations.
package com.javaschoollab.demo;
import java.util.Optional;

public class OptionalChainExample {
public static void main(String[] args) {
String input = "Java Optional Demo";
Optional<String> result = Optional.of(input).map(String::toLowerCase)
.map(value -> value.replace(" ", "_"))
.filter(value -> value.length() > 10);
result.ifPresent(value -> System.out.println("Processed Value: " + value));
}
}

OUTPUT: Processed Value: java_optional_demo


Example 4: Using orElseThrow for Exceptions
You can use orElseThrow to throw an exception if the value is absent.
package com.javaschoollab.demo;
import java.util.Optional;
public class OptionalOrElseThrowExample {
public static void main(String[] args) {
Optional<String> emptyOpt = Optional.empty();
try {
String value = emptyOpt.orElseThrow(
    () -> new IllegalStateException("Value is absent"));
System.out.println("Value: " + value);
} catch (Exception e) {
System.err.println(e.getMessage());
}
}
}

OUTPUT: Value is absent


Example 5: Using map and flatMap
The map and flatMap methods are useful for transforming values within an Optional.
package com.javaschoollab.demo;
import java.util.Optional;

class User {
private String email;
public User(String email) {
this.email = email;
}
public Optional<String> getEmail() {
return Optional.ofNullable(email);
}
}
public class OptionalMapExample {
public static void main(String[] args) {
User user = new User("pankaj.bhande01@gmail.com");
// Using map to transform the value
Optional<String> email = user.getEmail().map(String::toUpperCase);
email.ifPresent(System.out::println);
// Using flatMap to avoid nested Optional
Optional<String> upperCaseEmail =
Optional.of(user).flatMap(User::getEmail).map(String::toUpperCase);
upperCaseEmail.ifPresent(System.out::println);
}
}

OUTPUT:
PANKAJ.BHANDE01@GMAIL.COM
PANKAJ.BHANDE01@GMAIL.COM


Example 6: Avoiding Null Checks
Using Optional to avoid null checks and handle potential null values gracefully.
package com.javaschoollab.demo;
import java.util.Optional;
public class OptionalAvoidNullExample {
public static void main(String[] args) {
String possiblyNull = null;

// Wrapping a potentially null value
Optional<String> opt = Optional.ofNullable(possiblyNull);
// Using ifPresent to handle the value if it's present
opt.ifPresent(value -> System.out.println("Value: " + value));
// Providing a default value if absent
String result = opt.orElse("Default Value");
System.out.println("Result: " + result);
}
}

OUTPUT: Result: Default Value`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>Optional - Imperative Null-Checking vs Functional Chaining</h3>
Side-by-side proof of why Optional reduces bugs: a nested-null-check pyramid vs a flat, fail-safe chain that reads top-to-bottom.<br>`,
            codeExamples: [
                `import java.util.Optional;

public class OptionalVsNullCheckDemo {

    static class Address {
        String city;
        Address(String city) { this.city = city; }
        String getCity() { return city; }
    }
    static class Person {
        Address address;
        Person(Address a) { this.address = a; }
        Address getAddress() { return address; }
    }

    // ---- Old imperative style: nested null checks (error-prone pyramid) ----
    static String getCityOldWay(Person p) {
        if (p != null) {
            Address a = p.getAddress();
            if (a != null) {
                String city = a.getCity();
                if (city != null) {
                    return city.toUpperCase();
                }
            }
        }
        return "UNKNOWN";
    }

    // ---- Java 8 style: flat Optional chain, NPE-safe by construction ----
    static String getCityOptionalWay(Person p) {
        return Optional.ofNullable(p)
                .map(Person::getAddress)
                .map(Address::getCity)
                .map(String::toUpperCase)
                .orElse("UNKNOWN");
    }

    public static void main(String[] args) {
        Person full = new Person(new Address("Pune"));
        Person noAddress = new Person(null);
        Person nullPerson = null;

        System.out.println("Old way, full:       " + getCityOldWay(full));
        System.out.println("Old way, noAddress:  " + getCityOldWay(noAddress));
        System.out.println("Old way, nullPerson: " + getCityOldWay(nullPerson));

        System.out.println("Optional, full:       " + getCityOptionalWay(full));
        System.out.println("Optional, noAddress:  " + getCityOptionalWay(noAddress));
        System.out.println("Optional, nullPerson: " + getCityOptionalWay(nullPerson));
    }
}
// OUTPUT:
// Old way, full:       PUNE
// Old way, noAddress:  UNKNOWN
// Old way, nullPerson: UNKNOWN
// Optional, full:       PUNE
// Optional, noAddress:  UNKNOWN
// Optional, nullPerson: UNKNOWN`
            ]
        },
        {
            content: `<h4>Common Optional Anti-Patterns (Interview Traps)</h4>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Anti-Pattern</th><th>Why It's Wrong</th><th>Correct Approach</th></tr>
<tr class='text-center'><td>opt.get() without isPresent() check</td><td>Throws NoSuchElementException - defeats the purpose of Optional</td><td>Use orElse / orElseGet / orElseThrow / ifPresent</td></tr>
<tr class='text-center'><td>Optional&lt;T&gt; as a method parameter</td><td>Forces caller to wrap values; not idiomatic, adds overhead</td><td>Use overloading or plain nullable parameter; reserve Optional for return types</td></tr>
<tr class='text-center'><td>Optional field in a class</td><td>Optional is not Serializable and adds needless indirection to state</td><td>Keep the field nullable; expose Optional only from the getter if desired</td></tr>
<tr class='text-center'><td>opt.isPresent() then opt.get()</td><td>Verbose, reintroduces the imperative style Optional was meant to remove</td><td>Prefer map/filter/ifPresent/orElse chains</td></tr>
</table>`
        }
    ]
};
