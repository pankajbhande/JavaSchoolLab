import { Topic } from '../coreJava';

export const returnObjectFromMethod: Topic = {
                        id: 'return-object',
                        name: 'Return Object from Method',

                        beginner: [
                            {
                                content: `
<ul>
<li>In industry, methods usually return <b>objects</b> instead of primitive data types.</li>
<li>One method call can hand back several related values bundled together, so the caller does not juggle separate <code>int</code> and <code>String</code> returns.</li>
<li>This makes code more <b>reusable</b> and <b>maintainable</b>.</li>
</ul>

<h4>Basic Object Return</h4>
<p>A method can return an object of its own class type, just like it can return an <code>int</code> or a <code>String</code>.</p>
          `,
                                codeExamples: [
                                    `package com.test;

public class Employee {

    public Employee addEmployee() {
        Employee employee = new Employee();
        return employee;   // returning object
    }

    public static void main(String[] args) {
        Employee e = new Employee();
        Employee result = e.addEmployee();
        System.out.println("result is null: " + (result == null));
    }
}

// OUTPUT:
// result is null: false`
                                ]
                            },
                            {
                                content: `
<h4>Printing a Returned Object (Without toString)</h4>
If <code>toString()</code> is not overridden, printing the object prints its default reference text: <code>fully.qualified.ClassName@hashcode</code>.
          `,
                                codeExamples: [
                                    `package com.test;

public class Employee {

    int id = 101;
    String name = "Pankaj";
    String city = "Pune";

    public Employee addEmployee() {
        Employee emp = new Employee();
        return emp;
    }

    public static void main(String[] args) {
        Employee e = new Employee();
        Employee returned = e.addEmployee();
        System.out.println(returned);
    }
}

// OUTPUT:
// com.test.Employee@7852e922 (exact hash varies each run)`
                                ]
                            },
                            {
                                content: `
<h4>Printing a Returned Object (With toString)</h4>
Override <code>toString()</code> so the returned object prints something meaningful instead of a memory reference.
          `,
                                codeExamples: [
                                    `package com.test;

public class Employee {

    int id = 101;
    String name = "Pankaj";
    String city = "Pune";

    @Override
    public String toString() {
        return "Employee [id=" + id + ", name=" + name + ", city=" + city + "]";
    }

    public Employee addEmployee() {
        Employee emp = new Employee();
        return emp;
    }

    public static void main(String[] args) {
        Employee e = new Employee();
        System.out.println(e.addEmployee());
    }
}

// OUTPUT:
// Employee [id=101, name=Pankaj, city=Pune]`
                                ]
                            },
                            {
                                content: `
<h4>Getter-Style Method Returning an Object</h4>
Instead of returning a raw <code>int</code> id, a method can construct and return the whole object that owns that id - the caller then reads whichever field it needs.
          `,
                                codeExamples: [
                                    `package com.test;

class Employee {
    int id;

    Employee(int id) {
        this.id = id;
    }
}

public class Test {

    public static Employee getEmployeeById() {
        int id = 10;
        return new Employee(id);   // object returned instead of a plain int
    }

    public static void main(String[] args) {
        Employee e = getEmployeeById();
        System.out.println(e.id);
    }
}

// OUTPUT:
// 10`
                                ]
                            },
                            {
                                content: `
<h4>Why This Matters: Bundling Multiple Values Into One Return</h4>
A Java method can only <code>return</code> one value. If a method needs to hand back an id, a name, and a city, you cannot return three separate primitives. Returning one <b>object</b> that carries all three fields is the standard fix.
          `,
                                codeExamples: [
                                    `package com.test;

class Employee {
    int id;
    String name;
    String city;

    Employee(int id, String name, String city) {
        this.id = id;
        this.name = name;
        this.city = city;
    }
}

public class Test {

    public static Employee getEmployeeDetails() {
        int id = 10;
        String name = "Pankaj";
        String city = "Pune";
        return new Employee(id, name, city);   // one object carries all 3 values
    }

    public static void main(String[] args) {
        Employee e = getEmployeeDetails();
        System.out.println("id=" + e.id);
        System.out.println("name=" + e.name);
        System.out.println("city=" + e.city);
    }
}

// OUTPUT:
// id=10
// name=Pankaj
// city=Pune`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h4>Returning a Newly Created Object (Factory-Style Method)</h4>
A method can construct an object on the heap and hand back a reference to it - the caller's variable simply points to that same heap object.<br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">createEmployee()
      |
  new Employee()  -----> Heap: Employee{id=10, name="Pankaj"}
      |
   return emp            ^
      |                  |
   caller's "e" ---------+</pre>
          `,
                                codeExamples: [
                                    `package com.test;

public class Employee {
    int id;
    String name;

    public Employee(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public static Employee createEmployee() {
        Employee emp = new Employee(10, "Pankaj");   // created on heap
        return emp;                                   // reference handed back
    }

    public static void main(String[] args) {
        Employee e = createEmployee();
        System.out.println("id=" + e.id + ", name=" + e.name);
    }
}

// Output:
// id=10, name=Pankaj`
                                ]
                            },
                            {
                                content: `
<h4>Returning "this" for Method Chaining (Fluent API)</h4>
Returning <b>this</b> from an instance method lets calls be chained together - the pattern used by StringBuilder and most builder classes.<br>
                          `,
                                codeExamples: [
                                    `package com.test;

public class EmployeeBuilder {
    private String name;
    private String city;
    private int age;

    public EmployeeBuilder setName(String name) {
        this.name = name;
        return this;      // return the same object -> chaining
    }

    public EmployeeBuilder setCity(String city) {
        this.city = city;
        return this;
    }

    public EmployeeBuilder setAge(int age) {
        this.age = age;
        return this;
    }

    @Override
    public String toString() {
        return "Employee[name=" + name + ", city=" + city + ", age=" + age + "]";
    }

    public static void main(String[] args) {
        EmployeeBuilder emp = new EmployeeBuilder()
                .setName("Pankaj")
                .setCity("Pune")
                .setAge(28);

        System.out.println(emp);
    }
}

// Output:
// Employee[name=Pankaj, city=Pune, age=28]`
                                ]
                            },
                            {
                                content: `
<h4>New Object Every Call vs a Shared/Cached Object</h4>
A factory method can either build a <b>brand-new object every time</b> it is called, or hand back a reference to the <b>same cached/shared object</b> (common in caches, flyweights, and singletons). The two behave very differently once the caller starts mutating what it got back.<br>
                          `,
                                codeExamples: [
                                    `package com.test;

public class Config {
    private static final Config SHARED = new Config();
    public int value = 100;

    // Returns a NEW object every call
    public static Config newInstance() {
        return new Config();
    }

    // Returns the SAME cached object every call
    public static Config sharedInstance() {
        return SHARED;
    }

    public static void main(String[] args) {
        Config a = newInstance();
        Config b = newInstance();
        a.value = 999;
        System.out.println("Independent objects -> b.value = " + b.value);

        Config c = sharedInstance();
        Config d = sharedInstance();
        c.value = 999;
        System.out.println("Shared object -> d.value = " + d.value);
    }
}

// OUTPUT:
// Independent objects -> b.value = 100
// Shared object -> d.value = 999`
                                ]
                            },
                            {
                                content: `
<h4>Danger: Returning a Mutable Internal Reference</h4>
Returning a mutable field directly (like a List) leaks a live reference to your internal state - external code can silently modify it. The fix is a <b>defensive copy</b>.<br>
                          `,
                                codeExamples: [
                                    `package com.test;

import java.util.ArrayList;
import java.util.List;

public class Team {
    private List<String> members = new ArrayList<>();

    public Team() {
        members.add("Pankaj");
        members.add("Rahul");
    }

    // BAD: exposes internal list directly
    public List<String> getMembersUnsafe() {
        return members;
    }

    // GOOD: defensive copy, caller cannot change internal state
    public List<String> getMembersSafe() {
        return new ArrayList<>(members);
    }

    public static void main(String[] args) {
        Team team = new Team();

        List<String> leaked = team.getMembersUnsafe();
        leaked.add("Hacker");     // silently changes Team's internal list!
        System.out.println("After unsafe leak: " + team.getMembersUnsafe());

        List<String> copy = team.getMembersSafe();
        copy.add("Another");      // does NOT affect Team's internal list
        System.out.println("After safe copy:  " + team.getMembersSafe());
    }
}

// OUTPUT:
// After unsafe leak: [Pankaj, Rahul, Hacker]
// After safe copy:  [Pankaj, Rahul, Hacker]
// (the safe call shows no "Another"; "Hacker" is there from the earlier leak)`
                                ]
                            },
                            {
                                content: `
<h4>Returning null vs Optional&lt;T&gt; (Java 8+)</h4>
Returning <b>null</b> to signal "no result" forces every caller to remember a null check, or risk a NullPointerException. <b>Optional&lt;T&gt;</b> makes the "may be absent" case explicit in the method signature.<br>
                          `,
                                codeExamples: [
                                    `package com.test;

import java.util.Optional;

public class Test {

    // Old style: returns null if not found
    public static Employee findByIdUnsafe(int id) {
        return null; // pretend "not found"
    }

    // Better: returns Optional, forces caller to handle absence
    public static Optional<Employee> findByIdSafe(int id) {
        return Optional.empty(); // pretend "not found"
    }

    public static void main(String[] args) {
        Employee e1 = findByIdUnsafe(99);
        // System.out.println(e1.id);   // would throw NullPointerException!
        System.out.println("Unsafe result is null: " + (e1 == null));

        Optional<Employee> e2 = findByIdSafe(99);
        System.out.println("Safe result present: " + e2.isPresent());
        String fallback = e2.map(emp -> emp.name).orElse("Unknown");
        System.out.println("Safe fallback name: " + fallback);
    }
}

class Employee {
    int id;
    String name;
}

// Output:
// Unsafe result is null: true
// Safe result present: false
// Safe fallback name: Unknown`
                                ]
                            },
                            {
                                content: `
<h4>Common Interview Questions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why return an object instead of multiple primitives?</td><td>A method can only return one value; bundling related values into an object is the standard way to return "multiple" results</td></tr>
<tr class='text-center'><td>Returning a local primitive vs a local object</td><td>A primitive returns a copy of the value; an object returns a copy of the reference - the caller still points to the same heap object the method created</td></tr>
<tr class='text-center'><td>Returning an array vs a Collection</td><td>Both leak a mutable reference to internal state the same way - always consider a defensive copy or an unmodifiable wrapper</td></tr>
<tr class='text-center'><td>Covariant return types</td><td>An overriding method may narrow the return type to a subtype of the parent's declared return type (e.g. Animal reproduce() overridden to return Dog)</td></tr>
<tr class='text-center'><td>Returning "this" from a void-intent method</td><td>Only do this deliberately for fluent/builder APIs - it changes the method's contract from "do something" to "do something and let me chain"</td></tr>
<tr class='text-center'><td>null vs Optional as a return value</td><td>null forces every caller to remember a check; Optional makes "may be absent" part of the method's signature, which the compiler and IDE can nudge callers to handle</td></tr>
</table>
                          `
                            }
                        ]
                    };
