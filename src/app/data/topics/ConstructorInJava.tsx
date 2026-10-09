import { Topic } from '../coreJava';
import defaultTable from '../../../assets/defaulttable.png';

export const constructorInJava: Topic = {
                        id: `Contructor in java`,
                        name: `Constructor in Java`,
                        beginner: [
                            {
                                content: `<p>A <b>constructor</b> in Java is a special block of code used to initialize objects when they are created.</p>
<p>It is automatically called when an instance of a class is created using the <code>new</code> keyword.</p>
<h4>Key Characteristics</h4>
<ul>
<li><b>Same Name as Class:</b> A constructor must have the exact same name as the class it belongs to.</li>
<li><b>No Return Type:</b> It does not have a return type, not even <code>void</code>. Adding a return type makes it a regular method.</li>
<li><b>Automatic Invocation:</b> Java calls it for you when the object is created.</li>
<li><b>Initialization Logic:</b> It sets the starting values of the object's fields and does any set-up, so the object is valid from the start.</li>
</ul>
<p>There are 2 types of constructor:</p>
<ol>
<li><b>Default constructor</b> (no-argument constructor)</li>
<li><b>Parameterized constructor</b> (takes arguments)</li>
</ol>
<p>Below is one small, runnable code + output for each:</p>`
                            },

                            {
                                content: `<h4>1. Default Constructor (No-Argument Constructor)</h4>
<p>A constructor that takes no arguments is a no-argument constructor. If you write no constructor at all, the compiler adds one for you; that one is the <b>default constructor</b>. Below, we write the no-argument constructor ourselves.</p>`,
                                codeExamples: [
                                    `public class Test {
    String name;

    public Test() { // Default Constructor
        name = "Default_Constructor";
    }

    public static void main(String[] args) {
        Test test = new Test(); // Calling Constructor
        System.out.println("Name is >> " + test.name);
    }
}
// OUTPUT:
// Name is >> Default_Constructor`
                                ]
                            },

                            {
                                content: `<h4>Proof: When you write NO constructor, the compiler silently inserts one</h4>
<p>Here we have not written any constructor. The compiler adds a default one. Fields that nobody sets keep their default values (0 for <code>int</code>, <code>false</code> for <code>boolean</code>, <code>null</code> for objects).</p>`,
                                codeExamples: [
                                    `public class Main {
    int a;
    boolean b;

    public static void main(String[] args) {
        Main obj = new Main(); // compiler-generated default constructor runs
        System.out.println("a = " + obj.a);
        System.out.println("b = " + obj.b);
    }
}
// OUTPUT:
// a = 0
// b = false`
                                ]
                            },

                            {
                                content: `<h4>Default values assigned by the compiler-generated constructor:</h4>
<img src="${defaultTable}" alt="Default values table for Java data types" class="d-block mx-auto" style="height: 350px;" />`
                            },

                            {
                                content: `<h4>2. Parameterized Constructor</h4>
<p>A constructor with arguments is called a parameterized constructor. It lets you set an object's fields to specific values at creation time.</p>`,
                                codeExamples: [
                                    `public class Example {
    int id;
    String name;
    String city;

    public Example(int userId, String userName, String userCity) {
        id = userId;
        name = userName;
        city = userCity;
        System.out.println("id >> " + id);
        System.out.println("name >> " + name);
        System.out.println("city >> " + city);
    }

    public static void main(String[] args) {
        Example example = new Example(10, "Pankaj", "Udgir");
    }
}
// OUTPUT:
// id >> 10
// name >> Pankaj
// city >> Udgir`
                                ]
                            },

                            {
                                content: `<h4>Proof: once you write ANY constructor, the free default one disappears</h4>
<p>The compiler adds a no-argument constructor only when the class declares none at all. Once you write one, <code>new Example()</code> no longer compiles.</p>`,
                                codeExamples: [
                                    `public class Example {
    int id;
    public Example(int userId) { // one constructor written
        id = userId;
    }
    public static void main(String[] args) {
        Example e1 = new Example(5); // OK
        // Example e2 = new Example();
        // COMPILE ERROR: no suitable constructor found for Example()
    }
}
// OUTPUT:
// (no output; the commented line would not compile)`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<h3>What is the Use of a Constructor?</h3>
<p>It runs code at object creation, mostly to set the starting values of the instance variables.</p>
<p>A constructor can be called in these ways:</p>
<ul>
<li><code>new Employee()</code>: creates an object (the usual way).</li>
<li><code>this(...)</code>: calls another constructor of the same class.</li>
<li><code>super(...)</code>: calls the parent class constructor.</li>
<li><code>Class.forName("com.test.Employee").getDeclaredConstructor().newInstance()</code>: reflection.</li>
</ul>
<h4><b>Constructor overloading</b>: a class can have many constructors with the same name and different parameters.</h4>`,
                                codeExamples: [
                                    `package com.test;

public class Example {
    int id;
    String name;
    String city;

    // Constructor 1: three parameters
    public Example(int id, String name, String city) {
        // this.x is the field; plain x is the parameter
        this.id = id;
        this.name = name;
        this.city = city;
        System.out.println(id + " " + name + " " + city);
    }

    // Constructor 2: two parameters
    public Example(String name, String city) {
        this.name = name;
        this.city = city;
        System.out.println(name + " " + city);
    }

    public static void main(String[] args) {
        new Example(10, "Pankaj", "Udgir");  // picks constructor 1
        new Example("Dheeraj", "Latur");     // picks constructor 2
    }
}
// OUTPUT:
// 10 Pankaj Udgir
// Dheeraj Latur`
                                ]
                            },
                            {
                                content: `
                <h4>Note</h4>
<ul>
<li>A constructor <b>cannot be overridden</b>, because constructors are not inherited. A subclass has its own constructors.</li>
<li>A <b>private constructor</b> is mostly used in the <b>singleton design pattern</b>.</li>
</ul>`
                            },

                            {
                                content: `<h4>1. What is a Constructor?</h4>
<ul>
<li>A constructor sets up the initial state of a new object.</li>
<li>Like a method, it holds statements, but they run once, when the object is created.</li>
</ul>

<h4>2. Is there a <b>Copy Constructor</b> in Java?</h4>
<ul>
<li>Java has no built-in copy constructor and does not generate one. You write your own: <code>Student(Student other)</code>.</li>
<li>Other ways to copy an object: assign field values one by one, or use the <code>clone()</code> method of <code>Object</code>.</li>
</ul>

<h4>3. What is <b>Constructor Chaining</b>?</h4>
<p>Calling one constructor from another is called constructor chaining. Use <code>this(...)</code> for the same class and <code>super(...)</code> for the parent class. When you create a child object, the parent constructor runs first, then the child constructor.</p>
<p>Rules:</p>
<ol>
<li><code>this(...)</code> or <code>super(...)</code> must be the first statement of the constructor.</li>
<li>Constructors cannot call each other in a loop (compile error).</li>
<li>At least one constructor must not use <code>this(...)</code>, so the chain can end.</li>
</ol>`,
                                codeExamples: [
                                    `// Constructor chaining in the same class using this()
class Temp {
    Temp() {                    // constructor 1
        this(5);                // calls constructor 2
        System.out.println("The Default constructor");
    }

    Temp(int x) {               // constructor 2
        this(5, 15);            // calls constructor 3
        System.out.println(x);
    }

    Temp(int x, int y) {        // constructor 3
        System.out.println(x * y);
    }

    public static void main(String[] args) {
        new Temp();             // starts at constructor 1
    }
}
// OUTPUT:
// 75
// 5
// The Default constructor`
                                ]
                            },
                            {
                                content: `<h4>4. Can a parent constructor call a child constructor?</h4>
<p>No. Java has no way to call a subclass constructor from a superclass constructor.</p>

<h4>5. What happens if you give a constructor a return type?</h4>
<p>It is no longer a constructor. A member with a return type is a normal method, even if it has the class name. It compiles, but most tools warn about it.</p>`,
                                codeExamples: [
                                    `package com.test;

public class Test {
    int Test() {            // a normal method, not a constructor
        return 0;
    }

    public static void main(String[] args) {
        Test t = new Test(); // uses the default constructor
        System.out.println(t.Test());
    }
}
// OUTPUT:
// 0`
                                ]
                            },
                            {
                                content: `<h4>6. What is a no-arg constructor?</h4>
<p>A constructor without parameters is a <b>no-arg constructor</b>. The default constructor that the compiler adds is always a no-arg constructor.</p>`,
                                codeExamples: [
                                    `public class ABC {
    public ABC() {          // no-arg constructor written by you
        System.out.println("ABC created");
    }

    public static void main(String[] args) {
        new ABC();
    }
}
// OUTPUT:
// ABC created`
                                ]
                            },
                            {
                                content: `<h4>7. How is a no-arg constructor different from the default constructor?</h4>
<ul>
<li>A <b>no-arg constructor</b> is any constructor without parameters, written by you or added by the compiler.</li>
<li>The <b>default constructor</b> is the one the compiler adds when the class has no constructor. It has no parameters and no <code>throws</code> clause.</li>
<li>In <code>Object</code>, its body is empty. In every other class, it just calls <code>super()</code>.</li>
</ul>

<h4>8. What are private constructors and where are they used?</h4>
<ul>
<li>A constructor can have an access modifier like any method.</li>
<li>A <b>private</b> constructor can be called only inside its own class.</li>
<li>Uses: the <b>Singleton</b> pattern, static factory methods, and utility classes that must not be created.</li>
</ul>

<h4>9. When do we need constructor overloading?</h4>
<ul>
<li>When objects can be created in different ways, for example with or without optional values.</li>
<li>The compiler picks the constructor by the number and types of the arguments.</li>
</ul>

<h4>10. Are there destructors in Java?</h4>
<ul>
<li>No. The garbage collector frees memory, and you cannot predict when (or whether) an object is removed.</li>
<li>To release resources such as files, use <code>try-with-resources</code> and <code>AutoCloseable</code>.</li>
</ul>

<h4>11. Can we override a constructor?</h4>
<ul>
<li>No. Constructors are not inherited, and a constructor name must match its own class.</li>
<li>A subclass has its own constructors and can call the parent one with <code>super(...)</code>.</li>
</ul>

<h4>12. Can a constructor be final?</h4>
<ul>
<li>No. <code>final</code> is not allowed on a constructor, because constructors are not inherited, so there is nothing to override.</li>
<li>A constructor can be <code>private</code>, for example in a Singleton.</li>
</ul>

<h4>13. How do you handle exceptions in constructors?</h4>
<ul>
<li>A constructor can use <code>try-catch</code> inside, or declare <code>throws</code> and let the caller handle it.</li>
<li>If a constructor throws, the object is not created, so throw early for invalid arguments.</li>
</ul>

<h4>14. Can a constructor call a method?</h4>
<ul>
<li>Yes. Avoid calling overridable methods, because the subclass fields are not ready yet.</li>
</ul>
`
                            }

                        ],
                        expert: [
                            {
                                content: `<h3>Default Constructor vs No-Arg Constructor You Write</h3>
<p>The compiler adds a default constructor only when your class declares <strong>none</strong> at all. Once you write any constructor, even a parameterized one, the free default constructor is gone.</p>`,
                                codeExamples: [
                                    `class Employee {
    int id;
    Employee(int id) {          // you defined ONE constructor
        this.id = id;
    }
}

public class DefaultCtorDemo {
    public static void main(String[] args) {
        Employee e = new Employee(101);
        System.out.println(e.id);

        // Employee e2 = new Employee();
        // Compile-time error: no suitable constructor found for Employee()
        // because the compiler stops inserting the default once you write your own.
    }
}
// OUTPUT:
// 101`
                                ]
                            },
                            {
                                content: `<h3>Constructor Overloading</h3>
<p>A class can have several constructors with different parameter lists. The compiler picks the one that matches the arguments.</p>`,
                                codeExamples: [
                                    `class Product {
    String name;
    double price;
    int quantity;

    Product() {
        this.name = "Unnamed";
        this.price = 0.0;
        this.quantity = 0;
    }

    Product(String name, double price) {
        this.name = name;
        this.price = price;
        this.quantity = 1;
    }

    Product(String name, double price, int quantity) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    void print() {
        System.out.println(name + " | " + price + " | " + quantity);
    }
}

public class OverloadDemo {
    public static void main(String[] args) {
        new Product().print();
        new Product("Pen", 10.0).print();
        new Product("Notebook", 40.0, 3).print();
    }
}
// OUTPUT:
// Unnamed | 0.0 | 0
// Pen | 10.0 | 1
// Notebook | 40.0 | 3`
                                ]
                            },
                            {
                                content: `<h3>Object Initialization Order</h3>
<p>When an object is created, Java runs things in a fixed order:</p>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Class loading (once per class, first use only)
  |
  +-- Static variable initializers + static blocks (top to bottom)
        |
        v
Object creation (new)
  |
  +-- Parent class construction runs FIRST (implicit super())
  |     +-- Parent's instance initializer blocks + field initializers
  |     `+"`"+`-- Parent's constructor body
  |
  +-- Instance initializer blocks + field initializers (this class)
        |
        v
  Constructor body (this class)</pre>`,
                                codeExamples: [
                                    `class Parent {
    static { System.out.println("1. Parent static block"); }
    { System.out.println("3. Parent instance block"); }
    Parent() { System.out.println("4. Parent constructor"); }
}

class Child extends Parent {
    static { System.out.println("2. Child static block"); }
    { System.out.println("5. Child instance block"); }
    Child() { System.out.println("6. Child constructor"); }
}

public class InitOrderDemo {
    public static void main(String[] args) {
        new Child();
    }
}
// OUTPUT:
// 1. Parent static block
// 2. Child static block
// 3. Parent instance block
// 4. Parent constructor
// 5. Child instance block
// 6. Child constructor`
                                ]
                            },
                            {
                                content: `<h3>What Modifiers Are (and Aren't) Allowed on a Constructor</h3>
<p>Constructors are <strong>not inherited</strong>. Only access modifiers apply to them, never <code>abstract</code>, <code>static</code>, <code>final</code> or <code>synchronized</code>.</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Modifier</th><th>Allowed on constructor?</th><th>Why</th></tr>
<tr class='text-center'><td>public / private / protected / default</td><td>Yes</td><td>Controls who can instantiate the class (e.g. private for Singleton)</td></tr>
<tr class='text-center'><td>abstract</td><td>No</td><td>An abstract member has no body, but a constructor must run initialization logic</td></tr>
<tr class='text-center'><td>static</td><td>No</td><td>Constructors build a specific instance; static means "belongs to the class", which is contradictory</td></tr>
<tr class='text-center'><td>final</td><td>No</td><td>final prevents overriding, but constructors are never inherited/overridden in the first place</td></tr>
<tr class='text-center'><td>synchronized</td><td>No</td><td>No other thread can see a partially-constructed object's reference yet, so there's nothing to synchronize against</td></tr>
</table>`
                            },
                            {
                                content: `<h3>Common Interview Traps</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Trap</th><th>Answer</th></tr>
<tr class='text-center'><td>Constructor vs Method</td><td>Constructor: no return type, same name as class, runs once at creation. Method: has a return type (or void), any name, callable anytime</td></tr>
<tr class='text-center'><td>Calling an overridable method from a constructor</td><td>Dangerous. The subclass version may run before the subclass fields are initialized</td></tr>
<tr class='text-center'><td>Private constructors</td><td>Used for Singleton (blocks outside <code>new</code>) and static-only utility classes like <code>Math</code></td></tr>
</table>`,
                                codeExamples: [
                                    `class Parent {
    Parent() {
        init();   // calling an overridable method from the constructor
    }
    void init() {
        System.out.println("Parent.init");
    }
}

class Child extends Parent {
    int value = 10;   // not yet assigned when Parent's constructor runs

    @Override
    void init() {
        System.out.println("Child.init, value = " + value);
    }
}

public class OverridableCtorCallDemo {
    public static void main(String[] args) {
        new Child();
    }
}
// OUTPUT:
// Child.init, value = 0
// (value is 0, not 10: the Child field initializer has not run yet
//  when the Parent constructor calls the overridden init())`,
                                    `class Singleton {
    private static final Singleton INSTANCE = new Singleton();

    private Singleton() { }   // private: nobody else can "new" this class

    static Singleton getInstance() {
        return INSTANCE;
    }
}

public class SingletonDemo {
    public static void main(String[] args) {
        Singleton a = Singleton.getInstance();
        Singleton b = Singleton.getInstance();
        System.out.println(a == b);
    }
}
// OUTPUT:
// true`
                                ]
                            }
                        ]
                    };
