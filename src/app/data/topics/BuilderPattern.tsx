import { Topic } from '../coreJava';

export const builderPattern: Topic = {
    id: 'builder-pattern',
    name: 'Builder Pattern',

    beginner: [
        {
            content: `<h4>Real-Life Example:</h4>
<ul>
<li>Ordering a Pizza - you choose size, crust, toppings one step at a time, and finally get a finished Pizza.</li>
<li>Making a Sandwich at Subway - bread, veggies, sauce, cheese added step by step.</li>
<li>Filling an Online Form step by step and submitting at the end.</li>
</ul>

<h4>What is Builder Pattern?</h4>
<p>
The <b>Builder Pattern</b> is a Creational Pattern used to construct a
<b>complex object step-by-step</b>. It separates the construction of an
object from its final representation, so the same construction process
can create different representations.
</p>

<h4>Why do we need it? (Telescoping Constructor Problem)</h4>
<p>
Imagine a class with many optional fields (name, address, phone, email...).
Without Builder, developers create <b>multiple overloaded constructors</b>
to handle every combination of optional parameters. This is called the
<b>Telescoping Constructor Problem</b>.
</p>
<ul>
<li>Too many constructors - hard to read and maintain</li>
<li>Client must remember parameter order</li>
<li>Passing <code>null</code> for unused optional fields is error-prone</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create the target class (Product) with a private constructor</li>
<li>Step 2: Create a static/nested Builder class with the same fields</li>
<li>Step 3: Builder provides setter-like methods that return the Builder itself (fluent style)</li>
<li>Step 4: Builder has a <code>build()</code> method that returns the final object</li>
</ul>`,
            codeExamples: [
                `// Telescoping Constructor Problem (Bad Approach)
public class User {
    private String name;
    private int age;
    private String address;
    private String phone;

    // Constructor 1
    public User(String name, int age) { ... }

    // Constructor 2
    public User(String name, int age, String address) { ... }

    // Constructor 3
    public User(String name, int age, String address, String phone) { ... }

    // Very hard to manage as fields grow!
}`
            ]
        },
        {
            content: `<h4>Solving it with Builder Pattern</h4>
<p>
We build a <code>Pizza</code> object step-by-step using a fluent Builder.
Each method returns <code>this</code> so calls can be chained.
</p>`,
            codeExamples: [
                `package com.javaschoollab.demo;

public class Pizza {

    // Required
    private final String size;

    // Optional
    private final boolean cheese;
    private final boolean pepperoni;
    private final boolean mushroom;

    // Private constructor - only Builder can create Pizza
    private Pizza(Builder builder) {
        this.size = builder.size;
        this.cheese = builder.cheese;
        this.pepperoni = builder.pepperoni;
        this.mushroom = builder.mushroom;
    }

    @Override
    public String toString() {
        return "Pizza{size=" + size + ", cheese=" + cheese +
                ", pepperoni=" + pepperoni + ", mushroom=" + mushroom + "}";
    }

    // Static nested Builder class
    public static class Builder {
        private final String size;   // required
        private boolean cheese;      // optional
        private boolean pepperoni;   // optional
        private boolean mushroom;    // optional

        public Builder(String size) {
            this.size = size;
        }

        public Builder cheese(boolean value) {
            this.cheese = value;
            return this;
        }

        public Builder pepperoni(boolean value) {
            this.pepperoni = value;
            return this;
        }

        public Builder mushroom(boolean value) {
            this.mushroom = value;
            return this;
        }

        public Pizza build() {
            return new Pizza(this);
        }
    }

    public static void main(String[] args) {
        Pizza pizza = new Pizza.Builder("Large")
                .cheese(true)
                .pepperoni(true)
                .build();

        System.out.println(pizza);
        // OUTPUT:
        // Pizza{size=Large, cheese=true, pepperoni=true, mushroom=false}
    }
}`
            ]
        },
        {
            content: `<h4>Classic Builder vs Fluent Builder</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Type</th>
<th>Method Return Type</th>
<th>Chaining</th>
</tr>
<tr>
<td>Classic Builder (GoF)</td>
<td><code>void</code> setter methods, separate Director class</td>
<td>Not chained</td>
</tr>
<tr>
<td>Fluent Builder</td>
<td>Returns <code>this</code> (the Builder)</td>
<td>Chained method calls</td>
</tr>
</table><br>

<p>Most modern Java code (including Lombok's <code>@Builder</code>) uses the <b>fluent</b> style since it reads naturally, like a sentence.</p>`
        }
    ],

    expert: [
        {
            content: `<h4>Immutable Objects with Builder</h4>
<p>
Builder Pattern is the most common way to create <b>immutable objects</b>
with many optional fields. The target class exposes only getters,
all fields are <code>final</code>, and the only way to construct an
instance is through the Builder.
</p>`,
            codeExamples: [
                `public final class User {
    private final String name;
    private final int age;
    private final String email;

    private User(Builder b) {
        this.name = b.name;
        this.age = b.age;
        this.email = b.email;
    }

    public String getName() { return name; }
    public int getAge() { return age; }
    public String getEmail() { return email; }

    public static class Builder {
        private String name;
        private int age;
        private String email;

        public Builder name(String name) { this.name = name; return this; }
        public Builder age(int age) { this.age = age; return this; }
        public Builder email(String email) { this.email = email; return this; }

        public User build() {
            if (name == null) {
                throw new IllegalStateException("name is required");
            }
            return new User(this);
        }
    }
}`
            ]
        },
        {
            content: `<h4>Lombok's <code>@Builder</code> Annotation</h4>
<p>
In real projects, writing a Builder class manually for every entity is
repetitive. <b>Lombok</b> generates the entire Builder boilerplate at
compile time using a single annotation.
</p>`,
            codeExamples: [
                `import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
@Builder
public class Employee {
    private String name;
    private int age;
    private String department;
}

// Usage
public class Test {
    public static void main(String[] args) {
        Employee emp = Employee.builder()
                .name("Pankaj")
                .age(28)
                .department("IT")
                .build();

        System.out.println(emp);
        // OUTPUT:
        // Employee(name=Pankaj, age=28, department=IT)
    }
}`
            ]
        },
        {
            content: `<h4>StringBuilder - A Real-World Builder Example</h4>
<p>
<code>StringBuilder</code> in the JDK itself is a Builder Pattern
implementation. It constructs a final <code>String</code> step-by-step
via chained <code>append()</code> calls, without creating a new
immutable String at every intermediate step (unlike direct
<code>String</code> concatenation).
</p>`,
            codeExamples: [
                `StringBuilder sb = new StringBuilder();
sb.append("Hello")
  .append(", ")
  .append("World")
  .append("!");

System.out.println(sb.toString());
// OUTPUT:
// Hello, World!`
            ]
        },
        {
            content: `<h4>Builder Pattern + SOLID Principles</h4>
<ul>
<li><b>S - Single Responsibility</b> → Object construction logic is separated from the object's own behavior</li>
<li><b>O - Open Closed</b> → New optional fields can be added to the Builder without breaking existing client code</li>
<li><b>D - Dependency Inversion</b> → Client depends on the fluent Builder API, not on multiple constructor signatures</li>
</ul>

<h4>Builder Pattern in Frameworks</h4>
<ul>
<li>Java - <code>StringBuilder</code>, <code>StringBuffer</code></li>
<li>Java - <code>Stream.Builder</code></li>
<li>Spring - <code>UriComponentsBuilder</code>, <code>MockMvcRequestBuilders</code></li>
<li>Lombok - <code>@Builder</code> annotation</li>
<li>OkHttp - <code>Request.Builder</code>, <code>OkHttpClient.Builder</code></li>
</ul>`
        },
        {
            content: `<h4>Common Mistakes</h4>
<ul>
<li>Making Builder fields mutable after <code>build()</code> is called - can allow object state to change unexpectedly</li>
<li>Not validating required fields inside <code>build()</code></li>
<li>Using Builder for simple classes with 2-3 fields - unnecessary overhead</li>
<li>Reusing the same Builder instance to build multiple different objects without resetting state</li>
</ul>

<h4>Builder vs Factory Pattern</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Builder</th>
<th>Factory</th>
</tr>
<tr>
<td>Purpose</td>
<td>Construct a complex object step-by-step</td>
<td>Return one ready-made object of a chosen type</td>
</tr>
<tr>
<td>Number of Steps</td>
<td>Multiple chained calls</td>
<td>Single method call</td>
</tr>
<tr>
<td>Best For</td>
<td>Objects with many optional fields</td>
<td>Choosing among multiple implementations of an interface</td>
</tr>
<tr>
<td>Object State</td>
<td>Usually builds immutable objects</td>
<td>Can return mutable or immutable objects</td>
</tr>
</table>

<h4>When NOT to Use Builder?</h4>
<ul>
<li>When the class has very few (1-2) fields</li>
<li>When all fields are mandatory and there is no optional configuration</li>
<li>When object creation is already simple with a constructor</li>
</ul>`
        }
    ]
};
