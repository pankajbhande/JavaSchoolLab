import { Topic } from '../coreJava';

export const prototypePattern: Topic = {
    id: 'prototype-pattern',
    name: 'Prototype Pattern',

    beginner: [
        {
            content: `<h4>Real-Life Example:</h4>
<ul>
<li>Photocopying a document instead of retyping it from scratch</li>
<li>Cloning a cell in biology - a new cell is created by copying an existing one</li>
<li>Duplicating a slide in PowerPoint instead of creating a new one from a blank template</li>
</ul>

<h4>What is Prototype Pattern?</h4>
<p>
The <b>Prototype Pattern</b> is a Creational Pattern that creates
<b>new objects by cloning an existing object (the prototype)</b>,
instead of creating them from scratch using <code>new</code>.
</p>

<h4>Why do we need it?</h4>
<ul>
<li>Object creation is expensive (heavy database call, complex calculation, network call)</li>
<li>We need many similar objects that differ only slightly</li>
<li>Cloning is faster than re-running the entire construction logic</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Implement <code>Cloneable</code> interface</li>
<li>Step 2: Override <code>clone()</code> method</li>
<li>Step 3: Call <code>super.clone()</code> inside it</li>
<li>Step 4: Client calls <code>clone()</code> instead of <code>new</code></li>
</ul>`,
            codeExamples: [
                `package com.javaschoollab.demo;

public class Sheep implements Cloneable {

    private String name;

    public Sheep(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    public static void main(String[] args) throws CloneNotSupportedException {
        Sheep dolly = new Sheep("Dolly");
        Sheep clonedSheep = (Sheep) dolly.clone();

        System.out.println(dolly.getName());
        System.out.println(clonedSheep.getName());
        System.out.println(dolly == clonedSheep);

        // OUTPUT:
        // Dolly
        // Dolly
        // false
    }
}`
            ]
        },
        {
            content: `<h4>Shallow Clone vs Deep Clone</h4>
<p>
The default <code>Object.clone()</code> performs a <b>shallow clone</b>:
primitive fields are copied by value, but object/array reference fields
still point to the <b>same</b> objects as the original. A <b>deep clone</b>
copies referenced objects as well, so the clone is fully independent.
</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Type</th>
<th>Primitive Fields</th>
<th>Reference Fields</th>
</tr>
<tr>
<td>Shallow Clone</td>
<td>Copied by value</td>
<td>Same reference shared (not safe for mutable objects)</td>
</tr>
<tr>
<td>Deep Clone</td>
<td>Copied by value</td>
<td>New independent copy created</td>
</tr>
</table>`,
            codeExamples: [
                `class Address {
    String city;
    Address(String city) { this.city = city; }
}

class Person implements Cloneable {
    String name;
    Address address; // reference field

    Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone(); // shallow clone
    }
}

public class ShallowCloneDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Address addr = new Address("Pune");
        Person p1 = new Person("Anandrao", addr);
        Person p2 = (Person) p1.clone();

        p2.address.city = "Mumbai"; // modifies shared Address!

        System.out.println(p1.address.city);
        System.out.println(p2.address.city);
        // OUTPUT:
        // Mumbai
        // Mumbai
        // (p1 got affected too because address reference is shared)
    }
}`
            ]
        }
    ],

    expert: [
        {
            content: `<h4>Deep Clone via Overriding clone() on Nested Objects</h4>
<p>
To achieve a true deep clone, every mutable reference field must also
be cloned inside the containing object's <code>clone()</code> method.
</p>`,
            codeExamples: [
                `class Address implements Cloneable {
    String city;
    Address(String city) { this.city = city; }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}

class Person implements Cloneable {
    String name;
    Address address;

    Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        Person cloned = (Person) super.clone();
        cloned.address = (Address) address.clone(); // deep clone the reference field
        return cloned;
    }
}

public class DeepCloneDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Person p1 = new Person("Anandrao", new Address("Pune"));
        Person p2 = (Person) p1.clone();

        p2.address.city = "Mumbai";

        System.out.println(p1.address.city); // Pune
        System.out.println(p2.address.city); // Mumbai
    }
}`
            ]
        },
        {
            content: `<h4>Deep Clone via Copy Constructor (Preferred by Many Teams)</h4>
<p>
Many Java experts (including Joshua Bloch in <i>Effective Java</i>)
recommend <b>avoiding</b> <code>Cloneable</code>/<code>clone()</code>
entirely because of its design flaws, and instead using a
<b>copy constructor</b> or a static factory copy method.
</p>`,
            codeExamples: [
                `class Address {
    String city;
    Address(String city) { this.city = city; }

    // Copy constructor
    Address(Address other) {
        this.city = other.city;
    }
}

class Person {
    String name;
    Address address;

    Person(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    // Copy constructor - creates a fully independent deep copy
    Person(Person other) {
        this.name = other.name;
        this.address = new Address(other.address);
    }
}`
            ]
        },
        {
            content: `<h4>Deep Clone via Serialization</h4>
<p>
For complex object graphs, serializing and deserializing an object
produces a completely independent deep copy without manually cloning
every nested field. This is slower but very convenient.
</p>`,
            codeExamples: [
                `import java.io.*;

public class DeepCloneUsingSerialization {

    public static <T extends Serializable> T deepClone(T object) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream(baos);
        oos.writeObject(object);

        ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
        ObjectInputStream ois = new ObjectInputStream(bais);

        @SuppressWarnings("unchecked")
        T clone = (T) ois.readObject();
        return clone;
    }
}`
            ]
        },
        {
            content: `<h4>Prototype Registry</h4>
<p>
When there are multiple types of prototype objects, a <b>Prototype
Registry</b> (a Map of pre-configured prototype instances) lets the
client fetch and clone a prototype by key, instead of knowing how to
construct each type.
</p>`,
            codeExamples: [
                `import java.util.HashMap;
import java.util.Map;

abstract class Shape implements Cloneable {
    abstract void draw();

    @Override
    public Object clone() throws CloneNotSupportedException {
        return super.clone();
    }
}

class Circle extends Shape {
    void draw() { System.out.println("Drawing Circle"); }
}

class Square extends Shape {
    void draw() { System.out.println("Drawing Square"); }
}

class ShapeRegistry {
    private static final Map<String, Shape> registry = new HashMap<>();

    static {
        registry.put("circle", new Circle());
        registry.put("square", new Square());
    }

    public static Shape getShape(String key) throws CloneNotSupportedException {
        Shape prototype = registry.get(key);
        return (Shape) prototype.clone();
    }
}

public class RegistryDemo {
    public static void main(String[] args) throws CloneNotSupportedException {
        Shape shape = ShapeRegistry.getShape("circle");
        shape.draw();
        // OUTPUT:
        // Drawing Circle
    }
}`
            ]
        },
        {
            content: `<h4>When is Cloning Faster than Construction?</h4>
<ul>
<li>Object requires an expensive database or network call to initialize</li>
<li>Object requires heavy computation (loading large config, parsing a file)</li>
<li>Many near-identical objects need to be created repeatedly (e.g. game objects, document templates)</li>
</ul>

<h4>Pitfalls of <code>Object.clone()</code></h4>
<ul>
<li><code>clone()</code> bypasses constructors, so invariants set up in constructors may not run</li>
<li>Default behavior is shallow clone - easy to accidentally share mutable state</li>
<li><code>Cloneable</code> is a marker interface with no methods - it does not actually declare <code>clone()</code>, which is confusing</li>
<li><code>CloneNotSupportedException</code> is a checked exception, adding boilerplate</li>
<li>Cloning <code>final</code> fields that reference mutable objects is tricky since they can't be reassigned in <code>clone()</code></li>
<li>Joshua Bloch's <i>Effective Java</i> explicitly recommends preferring copy constructors/factories over <code>Cloneable</code></li>
</ul>

<h4>Prototype Pattern + SOLID Principles</h4>
<ul>
<li><b>S - Single Responsibility</b> → Cloning logic lives inside the object itself, separate from client code</li>
<li><b>O - Open Closed</b> → New prototype types can be added to a registry without modifying client code</li>
</ul>

<h4>Real-World Usage</h4>
<ul>
<li>Java - <code>ArrayList.clone()</code>, <code>HashMap.clone()</code> (shallow clones of collections)</li>
<li>Spring - Bean scope <code>prototype</code> creates a new bean instance per request (conceptually related, though implemented differently)</li>
<li>Java <code>Object.clone()</code> mechanism itself, used in graphics/game engines to duplicate shapes/sprites</li>
</ul>

<h4>Prototype vs Factory vs Builder</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Pattern</th>
<th>Creates Object By</th>
<th>Best When</th>
</tr>
<tr>
<td>Prototype</td>
<td>Cloning an existing instance</td>
<td>Construction is expensive and objects are similar</td>
</tr>
<tr>
<td>Factory</td>
<td>Calling <code>new</code> internally based on input</td>
<td>Client needs a fresh object of a chosen type</td>
</tr>
<tr>
<td>Builder</td>
<td>Step-by-step field assignment</td>
<td>Object has many optional fields</td>
</tr>
</table>

<h4>When NOT to Use Prototype?</h4>
<ul>
<li>When object construction is already cheap and simple</li>
<li>When deep cloning would be more complex/error-prone than just creating a new object</li>
<li>When objects hold non-cloneable resources like open file handles or sockets</li>
</ul>`
        }
    ]
};
