import { Topic } from '../coreJava';

export const abstractionInJava: Topic = {
                        id: `Abstraction in Java`,
                        name: `Abstraction in Java`,
                        beginner: [
                            {
                                content: `<p>Data abstraction means hiding the details and showing only the essential information to the user.</p>
<p>Java gives two tools for abstraction: abstract classes and interfaces (interfaces are covered below).</p>
<p>The <code>abstract</code> keyword is a non-access modifier. It is used on classes and methods:</p>
<ul>
<li><b>Abstract class</b>: a restricted class that cannot be used to create objects. To use it, another class must extend it.</li>
<li><b>Abstract method</b>: a method with no body. It is declared in an abstract class (or an interface). The subclass provides the body.</li>
</ul>`,
                                codeExamples: [
                                    `abstract class Animal {
    public abstract void animalSound();   // no body
    public void sleep() {                 // normal method
        System.out.println("Zzz");
    }
}

// OUTPUT:
// (declaration only; Animal cannot be instantiated)`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<p>Abstraction is hiding the internal details and showing only the important functions to the end user.</p>
<p>Real-life examples:</p>
<ol>
<li>Car: you use the steering wheel and pedals, not the engine internals.</li>
<li>ATM machine.</li>
<li>TV remote.</li>
<li>Sending an SMS: you type the text and press send. You do not know how the message is delivered.</li>
</ol>
<h4>How to achieve abstraction in Java?</h4>
<p>There are 2 ways:</p>
<ol>
<li>Abstract class (0 to 100% abstraction)</li>
<li>Interface (up to 100% abstraction)</li>
</ol>
<h4>1. Abstract Class</h4>
<ul>
<li>An abstract class is declared with the <code>abstract</code> keyword.</li>
<li>It can contain abstract methods, concrete methods, both, or neither.</li>
<li>It can have constructors.</li>
<li>A class cannot extend more than one abstract class (no multiple inheritance with classes).</li>
</ul>
<p>If a class declares an abstract method, the class itself must be abstract.</p>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public abstract class Test {          // abstract class
    public abstract void x1();        // abstract method: no body
    abstract void x2();               // access modifier is optional
    public static final int a = 10;   // a normal constant is allowed
}

// OUTPUT:
// (declaration only; compiles without error)`
                                ]
                            },
                            {
                                content: `<h4>How to implement abstract methods?</h4>
<p>Create a class that extends the abstract class and overrides every abstract method.</p>
<p>If the subclass does not want to override them, it must also be declared <code>abstract</code>.</p>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public abstract class Test {
    abstract void x1();
    abstract void x2();
}

// the implementation class
public class Example extends Test {
    @Override
    void x1() { System.out.println("x1 method.."); }
    @Override
    void x2() { System.out.println("x2 method.."); }
}

public class Main {
    public static void main(String[] args) {
        Example example = new Example();
        example.x1();
        example.x2();
    }
}

// OUTPUT:
// x1 method..
// x2 method..`
                                ]
                            },
                            {
                                content: `<h4>2. Interface</h4>
<ul>
<li>Interface methods are <code>public abstract</code> by default.</li>
<li>Interface variables are <code>public static final</code> by default.</li>
<li>If you leave out <code>public</code> or <code>abstract</code>, the compiler adds them for you.</li>
<li>Design to interfaces: code against the interface and keep the implementation behind it.</li>
<li>An interface method with a body (without <code>default</code>, <code>static</code> or <code>private</code>) is a compile error.</li>
</ul>
<p>All four methods below mean the same thing:</p>`,
                                codeExamples: [
                                    `public interface A {
    public abstract void x1();   // allowed
    public void x2();            // allowed
    abstract void x3();          // allowed
    void x4();                   // allowed (most common style)
    int LIMIT = 5;               // public static final
}

// OUTPUT:
// (declaration only; compiles without error)`
                                ]
                            },
                            {
                                content: `<h4>Does Java support multiple inheritance?</h4>
<ul>
<li>With classes: <b>No</b>. A class extends only one class.</li>
<li>With interfaces: <b>Yes</b>. A class can implement many interfaces, and an interface can extend many interfaces.</li>
</ul>
<h4>Combinations to try on your computer</h4>
<ul>
<li>interface extends interface</li>
<li>interface extends interface1 and interface2</li>
<li>class implements interface</li>
<li>class implements interface1 and interface2</li>
<li>class extends class implements interface</li>
<li>class extends class implements interface1 and interface2</li>
</ul>`,
                                codeExamples: [
                                    `interface A { }
interface B { }
interface C extends A, B { }          // interface extends many interfaces

// OUTPUT:
// (declaration only; compiles without error)`
                                ]
                            },
                            {
                                content: `<div class='bg-blue-200 p-3 '>
<h3 class='text-center'>Interview Questions </h3>
<h4>1. What is Abstraction in Java?</h4>
<h4>2. How to achieve or implement Abstraction in Java?</h4>
<h4>3. What is Abstract class in Java? How to define it?</h4>
<h4>4. What is the difference between abstract class and concrete class?</h4>
<p>Ans: There are 2 main differences:</p>
<ul>
<li>We cannot create an object of an abstract class. Only objects of its concrete (non-abstract) subclasses can be created.</li>
<li>An abstract class can have abstract methods. A concrete class cannot.</li>
</ul>
<h4>5. What is Abstract in Java?</h4>
<p>Ans: <code>abstract</code> is a non-access modifier. It applies to classes, methods and nested classes (interfaces are abstract by nature).</p>
<h4>6. Can the abstract modifier be applied to variables?</h4>
<p>Ans: No.</p>
<h4>7. What is an abstract method in Java?</h4>
<p>Ans: A method declared with <code>abstract</code> and without a body. It has only a signature followed by a semicolon.</p>
<p>Syntax: <code>abstract type methodName(arguments);</code></p>
<p>Example: <code>abstract void msg();</code></p>
<h4>8. Can an abstract method be static?</h4>
<p>Ans: No.</p>
<h4>9. Can an abstract method be private?</h4>
<p>Ans: No. An abstract method must be overridden in the child class, and a private method is not visible there.</p>
<h4>10. What is a concrete method in Java?</h4>
<p>Ans: A method that always has a body. It is also called a complete method.</p>
</div>`
                            }
                        ],
                        expert: [
                            {
                                content: `<h4>1. Abstract Class</h4>
<ul>
<li>We cannot create an object of an abstract class.</li>
<li>To use its abstract methods, extend the class and override them.</li>
<li>A subclass that does not override every abstract method must also be declared <code>abstract</code>.</li>
<li>If any method in a class is abstract, the class must be declared <code>abstract</code>.</li>
</ul>
<div class='bg-secondary p-2'>
<h4>Advantages of Abstraction</h4>
<ol>
<li>It reduces the complexity of viewing things.</li>
<li>It avoids code duplication and increases reusability.</li>
<li>It increases security, because only essential details are shown to the user.</li>
<li>It improves maintainability and modularity: a big system splits into smaller parts.</li>
<li>The user focuses on what an object does, not how it does it.</li>
<li>We can change the internal implementation without affecting users, as long as the interface stays the same. For example, disk brakes and drum brakes work differently inside, but both are used through the same pedal.</li>
</ol>
</div>
<div class='bg-blue-100 p-2'>
<h4>Disadvantages of Abstraction</h4>
<ol>
<li>It can make it harder to understand and debug how the system works, especially for people who do not know the layers.</li>
<li>Used badly, it adds complexity and increases development time.</li>
<li>Too many layers add indirection and can cost some performance.</li>
</ol>
</div>
<h4>2. Interface</h4>
<ul>
<li>In a company, senior engineers or team leads often design the interface. Developers then implement it with the business logic.</li>
<li>We cannot create an object of an interface.</li>
<li>An interface defines the methods. The implementing class provides the bodies.</li>
<li>Before Java 8, an interface could not have method bodies. Java 8 added <code>default</code> and <code>static</code> methods.</li>
<li>Java 9 added <code>private</code> methods in interfaces.</li>
<li>Java supports multiple inheritance through interfaces, but not through classes.</li>
<li>An interface does not have a constructor.</li>
</ul>`,
                                codeExamples: [
                                    `public interface A {
    void x1();
}

public class Test implements A {
    @Override
    public void x1() {               // must be public
        System.out.println("Test-x1 method");
    }
}

public class TestExample {
    public static void main(String[] args) {
        Test test = new Test();
        test.x1();
    }
}

// OUTPUT:
// Test-x1 method`,
                                    `interface A { void x1(); }
interface B { void x1(); }           // same signature as A

public class Test implements A, B {  // one method satisfies both
    @Override
    public void x1() {
        System.out.println("Test-x1 method");
    }
}

public class TestExample {
    public static void main(String[] args) {
        new Test().x1();
    }
}

// OUTPUT:
// Test-x1 method`
                                ]
                            },
                            {
                                content: `<h4>Why interface?</h4>
<p>Suppose Amazon wants to add SBI bank payment code to its shopping cart, so customers can pay for their orders.</p>
<p>SBI could share its <code>Transaction</code> class directly. But then Amazon would see SBI database code and business logic, which is a security risk.</p>
<p>The solution: SBI publishes only an interface (<code>Transactionid</code>) and keeps the implementation (<code>TransactionImpl</code>) private. Amazon codes against the interface.</p>
<p>Both sides reach their goal: Amazon can pay, and SBI keeps its internals hidden.</p>`,
                                codeExamples: [
                                    `// SBI side: interface (shared) and implementation (private)
interface Transactionid {
    void withdrawAmt(int amtToWithdraw);
}

class TransactionImpl implements Transactionid {
    public void withdrawAmt(int amtToWithdraw) {   // must be public
        // withdraw logic, SBI DB connection and update (hidden)
        System.out.println("Withdrawn " + amtToWithdraw);
    }
}

// Amazon side: knows only the interface
class Test {
    public static void main(String[] args) {
        Transactionid ti = new TransactionImpl();
        ti.withdrawAmt(500);
    }
}

// OUTPUT:
// Withdrawn 500`
                                ]
                            },
                            {
                                content: `<div class='bg-blue-200 p-2'>
<h3 class='text-center'>Interview Questions</h3>
<h4>1. When to use an abstract class in Java?</h4>
<p>Ans: When related classes share common code or state and also need their own versions of some methods.</p>
<h4>2. When to use an abstract method in Java?</h4>
<p>Ans: Use it in two cases:</p>
<ul>
<li>The same method must perform different tasks depending on the object calling it.</li>
<li>The method must be overridden in the non-abstract subclasses.</li>
</ul>
<h4>3. Is an abstract class pure abstraction in Java?</h4>
<p>Ans: No. It gives 0 to 100% abstraction.</p>
<h4>4. Can we create an object of an abstract class?</h4>
<p>Ans: No, but we can create an object of its subclass.</p>
<h4>5. Can an abstract class have no abstract method?</h4>
<p>Ans: Yes.</p>
<h4>6. Can an abstract class have a constructor?</h4>
<p>Ans: Yes.</p>
<h4>7. Can we achieve multiple inheritance through abstract classes?</h4>
<p>Ans: No.</p>
<h4>8. Can we make an abstract class without the abstract keyword?</h4>
<p>Ans: No. The class must be declared with <code>abstract</code>.</p>
<h4>9. Can we define an abstract method inside a concrete class?</h4>
<p>Ans: No. The code below gives a compile-time error.</p>
<pre><code>class Test {
    abstract void show();
}</code></pre>
<h4>10. What is the difference between abstraction and encapsulation?</h4>
<p>Ans: Abstraction hides implementation details from users. Encapsulation wraps data and code into a single unit.</p>
<h4>11. Why does an abstract class have a constructor if we cannot create its object?</h4>
<p>Ans: We can create an object of its subclass. The subclass constructor calls the abstract class constructor with <code>super(...)</code> in its first line. So the abstract class constructor runs as part of creating the subclass object.</p>
<p>Every class, abstract ones included, gets an implicit no-arg constructor when none is declared. A subclass fails to compile only when the parent declares only constructors with arguments and the child never calls one of them.</p>
<h4>12. What are the advantages of an abstract class?</h4>
<ul>
<li>It makes programs more flexible, because subclasses implement abstract methods in their own way.</li>
<li>The same abstract method can do different tasks depending on the object.</li>
<li>Code is easier to manage.</li>
</ul>
</div>`
                            }
                        ]
                    };
