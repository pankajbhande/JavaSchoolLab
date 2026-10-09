import { Topic } from '../coreJava';

export const polymorphismInJava: Topic = {
                        id: 'Polymorphism in java',
                        name: 'Polymorphism in Java',
                        beginner: [
                            {
                                content: `<p>One entity that behaves differently in different cases is called <strong>Polymorphism</strong>.</p>
<p>Real-life examples:</p>
<ul>
<li>A light switch — the same switch turns lights on or off.</li>
<li>A person — an employee at office, a customer at a mall, a passenger on a bus, a student at school, a son at home.</li>
<li>A smartphone — one device that sends texts, makes calls, sends mail, and does video calls.</li>
</ul>
<p>We achieve polymorphism in Java in 2 ways:</p>
<ol>
<li><strong>Method Overloading</strong> — Compile Time Polymorphism / Early Binding / Static Binding</li>
<li><strong>Method Overriding</strong> — Runtime Polymorphism / Late Binding / Dynamic Binding</li>
</ol>
<p>Below is one small, runnable code + output for each:</p>`
                            },

                            {
                                content: `<h4>1. Method Overloading — same method name, different number of arguments</h4>
<p>Rules: the method name must be the same; parameters must differ (in count, type, or order); return type and access specifier can be anything. No super/sub-class relationship is needed.</p>`,
                                codeExamples: [
                                    `public class TestMain {
    void add(int a, int b) {
        System.out.println(a + b);
    }
    void add(int a, int b, int c) {
        System.out.println(a + b + c);
    }

    public static void main(String[] args) {
        TestMain obj = new TestMain();
        obj.add(10, 5);       // calls add(int, int)
        obj.add(5, 10, 15);   // calls add(int, int, int)
    }
}
// OUTPUT:
// 15
// 30`
                                ]
                            },

                            {
                                content: `<h4>2. Method Overloading — same method name, different data type of arguments</h4>`,
                                codeExamples: [
                                    `public class TestMain {
    void add(int a, int b) {
        System.out.println("int add: " + (a + b));
    }
    void add(double a, double b) {
        System.out.println("double add: " + (a + b));
    }

    public static void main(String[] args) {
        TestMain obj = new TestMain();
        obj.add(10, 5);        // matches int version
        obj.add(10.5, 11.5);   // matches double version
    }
}
// OUTPUT:
// int add: 15
// double add: 22.0`
                                ]
                            },

                            {
                                content: `<h4>3. Method Overriding — same method name, same arguments, but Parent/Child classes</h4>
<p>Rules: the method name and parameters must be the same; return type must be the same (or covariant); access can be widened but not narrowed. This needs a super/sub-class relationship, unlike overloading.</p>`,
                                codeExamples: [
                                    `class A {
    void m1() {
        System.out.println("class A - m1() method");
    }
}

class B extends A {
    @Override
    void m1() {
        System.out.println("class B - m1() method");
    }
    void m7() {
        System.out.println("class B - m7() method");
    }
}

public class TestMain {
    public static void main(String[] args) {
        B b = new B();
        b.m1(); // overridden version runs
        b.m7();
    }
}
// OUTPUT:
// class B - m1() method
// class B - m7() method`
                                ]
                            },

                            {
                                content: `<h4>4. Proof: Overloading is resolved at compile time, Overriding is resolved at runtime</h4>
<p>With overloading, the compiler picks the version from the arguments you wrote. With overriding, even if the reference type is the parent class, the actual object's overridden method runs. This is decided at runtime (dynamic dispatch).</p>`,
                                codeExamples: [
                                    `class A {
    void greet() {
        System.out.println("Hello from A");
    }
}

class B extends A {
    @Override
    void greet() {
        System.out.println("Hello from B");
    }
}

public class TestMain {
    public static void main(String[] args) {
        A ref = new B(); // Parent reference, Child object
        ref.greet();     // runtime polymorphism - decides based on actual object (B)
    }
}
// OUTPUT:
// Hello from B`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Why Overloading Is Compile-Time and Overriding Is Runtime</h3>
<p>Overloading is resolved by the compiler. It looks only at the reference type and the argument types, so the JVM never needs to know the actual object.</p>
<p>Overriding is resolved at run time from the object's actual type (through the method table, called the vtable). So the same call site can run different code depending on which object is really there.</p>`,
                            },

                            {
                                content: `<h3>Overload Resolution Order: Exact Match → Widening → Autoboxing → Varargs</h3>
<p>When several overloads could match a call, Java prefers them in this order. This is a classic interview trap.</p>
<ol>
<li>Exact type match.</li>
<li>Widening primitive conversion (int → long → double).</li>
<li>Autoboxing / unboxing.</li>
<li>Varargs (last resort).</li>
</ol>`,
                                codeExamples: [
                                    `public class OverloadResolutionDemo {
    static void show(int x)          { System.out.println("int version"); }
    static void show(long x)         { System.out.println("long version (widening)"); }
    static void show(Integer x)      { System.out.println("Integer version (autoboxing)"); }
    static void show(int... x)       { System.out.println("varargs version"); }

    public static void main(String[] args) {
        show(5);
        // int argument matches "int version" exactly - widening/boxing/varargs
        // are never even considered once an exact match exists.
    }
}
// OUTPUT:
// int version`
                                ]
                            },

                            {
                                content: `<h3>Access Modifier Rule: Can Widen, Cannot Narrow</h3>
<p>An overriding method must have the same or wider access than the method it overrides, never narrower. <code>protected</code> can be widened to <code>public</code>, but <code>public</code> can never be narrowed to <code>protected</code> in a subclass.</p>`,
                                codeExamples: [
                                    `class Parent {
    protected void show() {
        System.out.println("Parent show()");
    }
}

class Child extends Parent {
    @Override
    public void show() {           // widened protected -> public: OK
        System.out.println("Child show()");
    }
}

// class InvalidChild extends Parent {
//     @Override
//     private void show() { }     // COMPILE ERROR: cannot reduce visibility
// }

public class TestMain {
    public static void main(String[] args) {
        Parent p = new Child();
        p.show();
    }
}
// OUTPUT:
// Child show()`
                                ]
                            },

                            {
                                content: `<h3>Proof: static Methods Are Hidden, Not Overridden</h3>
<p>A static method belongs to the class, not to an object, so it cannot take part in runtime polymorphism. Declaring the same static method in a subclass is called <strong>method hiding</strong>. The version that runs is chosen by the reference type at compile time, not by the object's actual type.</p>`,
                                codeExamples: [
                                    `class A {
    static void hello() {
        System.out.println("Static hello from A");
    }
}

class B extends A {
    static void hello() {
        System.out.println("Static hello from B");
    }
}

public class TestMain {
    public static void main(String[] args) {
        A ref = new B();
        ref.hello();  // uses reference type A, NOT the actual object B
        A.hello();
        B.hello();
    }
}
// OUTPUT:
// Static hello from A
// Static hello from A
// Static hello from B`
                                ]
                            },

                            {
                                content: `<h3>Proof: private and final Methods Cannot Be Overridden</h3>
<p><code>private</code> methods are not inherited, so a same-named method in the subclass is a brand-new, unrelated method, not an override. <code>final</code> methods forbid overriding, and the compiler enforces it.</p>`,
                                codeExamples: [
                                    `class Parent {
    private void secret() {
        System.out.println("Parent secret()");
    }
    final void locked() {
        System.out.println("Parent locked()");
    }
}

class Child extends Parent {
    // This is a NEW method, not an override - private methods aren't inherited
    private void secret() {
        System.out.println("Child secret() - unrelated method");
    }

    // @Override
    // void locked() { }
    // COMPILE ERROR: cannot override final method locked() in Parent
}

public class TestMain {
    public static void main(String[] args) {
        new Child();
        System.out.println("Compiles fine - private methods can't be overridden, only final would block it");
    }
}
// OUTPUT:
// Compiles fine - private methods can't be overridden, only final would block it`
                                ]
                            },

                            {
                                content: `<h3>Real-World Use: Runtime Polymorphism for Extensible Business Rules</h3>
<p>A common pattern: define a method in a base type and override it in each concrete class. The calling code stays unchanged as new types are added. A new payment, interest or seat-tier type is just one new subclass.</p>`,
                                codeExamples: [
                                    `abstract class Bank {
    abstract double getInterestRate();
}

class SBI extends Bank {
    double getInterestRate() { return 6.5; }
}

class HDFC extends Bank {
    double getInterestRate() { return 7.0; }
}

public class TestMain {
    static void printRate(Bank bank) {
        System.out.println("Interest Rate: " + bank.getInterestRate() + "%");
    }

    public static void main(String[] args) {
        printRate(new SBI());
        printRate(new HDFC());
        // Adding a new bank later only means adding a new subclass -
        // printRate() itself never needs to change.
    }
}
// OUTPUT:
// Interest Rate: 6.5%
// Interest Rate: 7.0%`
                                ]
                            },

                            {
                                content: `<h3>Quick Comparison</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Overloading</th><th>Overriding</th></tr>
<tr class='text-center'><td>Also called</td><td>Compile-time / Static / Early Binding</td><td>Runtime / Dynamic / Late Binding</td></tr>
<tr class='text-center'><td>Class relationship</td><td>Not required (same class)</td><td>Required (subclass)</td></tr>
<tr class='text-center'><td>Parameters</td><td>Must differ</td><td>Must be identical</td></tr>
<tr class='text-center'><td>Return type</td><td>Can be anything</td><td>Same or covariant</td></tr>
<tr class='text-center'><td>Access modifier</td><td>Can be anything</td><td>Same or wider only</td></tr>
<tr class='text-center'><td>static methods</td><td>Can be overloaded</td><td>Cannot be overridden (only hidden)</td></tr>
<tr class='text-center'><td>private / final methods</td><td>Can be overloaded</td><td>Cannot be overridden</td></tr>
</table>`
                            },

                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What are the two types of polymorphism in Java?</td><td>Compile-time (method overloading) and runtime (method overriding)</td></tr>
<tr class='text-center'><td>Can return type alone distinguish two overloaded methods?</td><td>No - overloads must differ in parameter list (count/type/order); return type alone is not enough and causes a compile error</td></tr>
<tr class='text-center'><td>Why can't static methods be overridden?</td><td>Static methods are resolved at compile time by the reference type (method hiding), not at runtime by the object's actual type - overriding requires dynamic dispatch, which only applies to instance methods</td></tr>
<tr class='text-center'><td>Can a constructor be overridden?</td><td>No - constructors aren't inherited at all, so there's nothing to override (though they can be overloaded within the same class)</td></tr>
<tr class='text-center'><td>What is a covariant return type?</td><td>An overriding method may narrow its return type to a subtype of what the parent method declared (e.g. Animal reproduce() overridden to return Dog)</td></tr>
</table>`
                            }
                        ]
                    };
