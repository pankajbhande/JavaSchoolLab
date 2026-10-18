import { Topic } from '../coreJava';
import singleinheritance from '../../../assets/singleinheritance.png';
import multilevelinheritance from '../../../assets/multilevelinheritance.png';
import hireachicalinheritance from '../../../assets/hireachicalinheritance.png';
import multipleinheritance from '../../../assets/multipleinheritance.png';
import hybridinheritance from '../../../assets/hybridinheritance.png';
import aggregationImg from '../../../assets/1.png';

export const inheritanceTypes: Topic = {
                        id: `Inheritance Types`,
                        name: `Inheritance Types`,
                        beginner: [
                            {
                                content: `Java supports several "shapes" of inheritance between classes, depending on how many super classes and sub classes are involved. In this topic we cover each shape with a small runnable demo. (Overriding and dynamic dispatch are covered in the "Inheritance in Java" topic. Here we focus only on the class-hierarchy shapes.)
<p>The shapes are:</p>
<ul>
<li>Single Inheritance</li>
<li>Multilevel Inheritance</li>
<li>Hierarchical Inheritance</li>
<li>Multiple Inheritance (not supported via classes - covered in Expert Level)</li>
<li>Hybrid Inheritance (not supported via classes - covered in Expert Level)</li>
</ul>`
                            },
                            {
                                content: `<h3>1. Single Inheritance</h3>
One super class and exactly one sub class.<br>
<img src="${singleinheritance}" alt="Single Inheritance diagram" class="d-block mx-auto" style="height:300px"/><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Insurance            (Super Class)
    |
    |  extends
    |
HealthInsurance      (Sub Class)</pre>`,
                                codeExamples: [
                                    `public class Insurance { // Super Class ( Parent )
    void getInsuranceDetails() {
        System.out.println("this is insurance details..");
    }
}

class HealthInsurance extends Insurance { // Sub Class (Child)
    void getHealthInsuranceDetails() {
        System.out.println("this is health insurance details.");
    }

    public static void main(String[] args) {
        HealthInsurance hi = new HealthInsurance();
        hi.getInsuranceDetails();
        hi.getHealthInsuranceDetails();
    }
}
// OUTPUT:
// this is insurance details..
// this is health insurance details.`
                                ]
                            },
                            {
                                content: `<h3>2. Multilevel Inheritance</h3>
A chain of inheritance: a class inherits from a class, which itself inherits from another class (A &rarr; B &rarr; C). Each level automatically gets everything from every level above it.<br>
<img src="${multilevelinheritance}" alt="Multilevel Inheritance diagram" class="d-block mx-auto" style="height:300px"/><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Account              (Grandparent)
    |
    |  extends
    |
CurrentAccount       (Parent)
    |
    |  extends
    |
SavingAccount        (Child)</pre>`,
                                codeExamples: [
                                    `class Account {
    void getAccountDetails() {
        System.out.println("This is account details..");
    }
}

class CurrentAccount extends Account {
    void getCurrentAccountDetails() {
        System.out.println("This is current account details");
    }
}

class SavingAccount extends CurrentAccount {
    void getSavingAccountDetails() {
        System.out.println("This is saving account details");
    }

    public static void main(String[] args) {
        SavingAccount savingAccount = new SavingAccount();
        savingAccount.getAccountDetails();        // from Account (grandparent)
        savingAccount.getCurrentAccountDetails(); // from CurrentAccount (parent)
        savingAccount.getSavingAccountDetails();  // its own
    }
}
// OUTPUT:
// This is account details..
// This is current account details
// This is saving account details`
                                ]
                            },
                            {
                                content: `<h3>3. Hierarchical Inheritance</h3>
One parent class is inherited by many sub classes independently. The sub classes do not know about each other and cannot see one another's members.<br>
<img src="${hireachicalinheritance}" alt="Hierarchical Inheritance diagram" class="d-block mx-auto" style="height:300px"/><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">                Loan                (Parent)
        /        |        \\
       /         |         \\
 HomeLoan   PersonalLoan   CarLoan   (Children)</pre>`,
                                codeExamples: [
                                    `class Loan {
    void getLoanDetails() {
        System.out.println("this is loan details");
    }
}

class HomeLoan extends Loan {
    void getHomeLoanDetails() {
        System.out.println("this is home loan details..");
    }
}

class PersonalLoan extends Loan {
    void getPersonalLoanDetails() {
        System.out.println("this is personal loan details");
    }
}

class CarLoan extends Loan {
    void getCarLoanDetails() {
        System.out.println("this is car loan details.");
    }

    public static void main(String[] args) {
        HomeLoan homeLoan = new HomeLoan();
        CarLoan carLoan = new CarLoan();
        PersonalLoan personalLoan = new PersonalLoan();
        homeLoan.getLoanDetails();
        homeLoan.getHomeLoanDetails();
        carLoan.getCarLoanDetails();
        personalLoan.getPersonalLoanDetails();
        // carLoan.getHomeLoanDetails(); // COMPILE ERROR: siblings cannot see each other
    }
}
// OUTPUT:
// this is loan details
// this is home loan details..
// this is car loan details.
// this is personal loan details`
                                ]
                            },
                            {
                                content: `<h4>Quick Recap</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Shape</th><th>Example</th></tr>
<tr class='text-center'><td>Single</td><td>1 parent &rarr; 1 child</td><td>Insurance &rarr; HealthInsurance</td></tr>
<tr class='text-center'><td>Multilevel</td><td>1 parent &rarr; 1 child &rarr; 1 grandchild (chain)</td><td>Account &rarr; CurrentAccount &rarr; SavingAccount</td></tr>
<tr class='text-center'><td>Hierarchical</td><td>1 parent &rarr; many children</td><td>Loan &rarr; HomeLoan, PersonalLoan, CarLoan</td></tr>
</table>
<br>
Java does NOT allow a class to <code>extends</code> two classes at the same time (Multiple Inheritance of classes), and therefore also disallows Hybrid Inheritance built purely out of classes. The Expert Level below explains exactly why, and how interfaces give you the same power safely.`
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Why Java Does NOT Support Multiple Inheritance (of Classes)</h3>
If a class could extend two classes that each declare the same method, the compiler would not know which version the sub class should inherit. This is the classic <strong>Diamond Problem</strong>:<br>
<img src="${multipleinheritance}" alt="Multiple Inheritance diamond problem diagram" class="d-block mx-auto" style="height:300px"/><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">class A { void m1() { ... } }
class B { void m1() { ... } }
class C extends A, B {   // NOT LEGAL JAVA
    // Which m1() does C inherit? A's or B's?
}</pre>
Both A and B provide their own <code>m1()</code>. If C could extend both, calling <code>c.m1()</code> would be ambiguous, because the compiler has no rule to pick a winner. Java's designers avoided this whole class of bugs by allowing a class to extend only one class.
<p>The following would-be code is illegal and does not compile:</p>`,
                                codeExamples: [
                                    `class A {
    void msg() {
        System.out.println("Hello");
    }
}

class B {
    void msg() {
        System.out.println("Welcome");
    }
}

// class C extends A, B {   // COMPILE ERROR: class cannot extend multiple classes
//     public static void main(String[] args) {
//         C obj = new C();
//         obj.msg(); // Ambiguous: A's msg() or B's msg()?
//     }
// }
// Java simply does not offer this syntax - "extends A, B" for classes is a
// compile-time error: "class, interface, or enum expected" / "'{' expected"`
                                ]
                            },
                            {
                                content: `<h3>How Java Achieves Multiple Inheritance Safely - via Interfaces</h3>
A class can <code>implements</code> any number of interfaces. Before Java 8, interfaces only declared abstract methods with no body, so there was nothing to conflict. The implementing class always had to supply exactly one, unambiguous body. This gives Java "multiple inheritance of type" without the diamond problem.`,
                                codeExamples: [
                                    `interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

class Duck implements Flyable, Swimmable { // multiple interfaces - perfectly legal
    public void fly() {
        System.out.println("Duck flies");
    }
    public void swim() {
        System.out.println("Duck swims");
    }

    public static void main(String[] args) {
        Duck d = new Duck();
        d.fly();
        d.swim();
    }
}
// OUTPUT:
// Duck flies
// Duck swims`
                                ]
                            },
                            {
                                content: `<h3>Java 8 default methods bring the diamond problem back - and how it's resolved</h3>
Since Java 8, interfaces can have <code>default</code> methods with a body. This reintroduces the diamond problem: if two interfaces implemented by the same class declare the SAME default method, Java cannot silently pick one. It forces the implementing class to override the method and resolve the clash itself.`,
                                codeExamples: [
                                    `interface Walker {
    default void move() {
        System.out.println("Walker: walking");
    }
}

interface Swimmer {
    default void move() {
        System.out.println("Swimmer: swimming");
    }
}

// class Amphibian implements Walker, Swimmer { }
// COMPILE ERROR: class Amphibian inherits unrelated defaults for move() from
// types Walker and Swimmer - Amphibian MUST override move() to resolve the clash.

class Amphibian implements Walker, Swimmer {
    @Override
    public void move() { // mandatory override to resolve the conflict
        Walker.super.move();   // explicitly choose Walker's version...
        Swimmer.super.move();  // ...and/or Swimmer's version
        System.out.println("Amphibian: I can do both");
    }

    public static void main(String[] args) {
        new Amphibian().move();
    }
}
// OUTPUT:
// Walker: walking
// Swimmer: swimming
// Amphibian: I can do both`
                                ]
                            },
                            {
                                content: `<h3>Hybrid Inheritance</h3>
Hybrid inheritance combines more than one of the above types in the same design (for example, hierarchical + multiple). Since it includes multiple inheritance, Java cannot support it with classes alone. It is easily achieved with a mix of class inheritance (<code>extends</code>) and interfaces (<code>implements</code>, for the "multiple" part):<br>
<img src="${hybridinheritance}" alt="Hybrid Inheritance diagram" class="d-block mx-auto" style="height:350px"/><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        Vehicle (class)          Electric (interface)
             |                        |
             |  extends               |  implements
             |                        |
         Car (class) --------------------
             |
             |  extends
             |
         SportsCar (class)</pre>`,
                                codeExamples: [
                                    `interface Electric {
    default void charge() {
        System.out.println("Charging battery...");
    }
}

class Vehicle {
    void drive() {
        System.out.println("Vehicle is driving");
    }
}

class Car extends Vehicle implements Electric { // class + interface
    void park() {
        System.out.println("Car is parked");
    }
}

class SportsCar extends Car { // multilevel on top of the hybrid mix
    void turboBoost() {
        System.out.println("SportsCar turbo boost!");
    }

    public static void main(String[] args) {
        SportsCar sc = new SportsCar();
        sc.drive();       // from Vehicle
        sc.charge();      // from Electric interface (default method)
        sc.park();        // from Car
        sc.turboBoost();  // its own
    }
}
// OUTPUT:
// Vehicle is driving
// Charging battery...
// Car is parked
// SportsCar turbo boost!`
                                ]
                            },
                            {
                                content: `<h3>Aggregation (HAS-A) - an alternative to Inheritance for code reuse</h3>
When there is no real IS-A relationship, prefer composing objects instead of inheriting. If a class holds a reference to another class as a field, that is Aggregation (HAS-A). It gives code reuse (via delegation) without forcing an inheritance hierarchy.<br>
<img src="${aggregationImg}" alt="Aggregation example diagram" class="d-block mx-auto" style="height:200px"/><br>`,
                                codeExamples: [
                                    `class Operation {
    int square(int n) {
        return n * n;
    }
}

class Circle {
    Operation op; // aggregation - Circle HAS-A Operation
    double pi = 3.14;

    double area(int radius) {
        op = new Operation();
        int rsquare = op.square(radius); // delegates the calculation
        return pi * rsquare;
    }

    public static void main(String[] args) {
        Circle c = new Circle();
        System.out.println(c.area(5));
    }
}
// OUTPUT:
// 78.5`,
                                    `class Address {
    String city, state, country;
    Address(String city, String state, String country) {
        this.city = city;
        this.state = state;
        this.country = country;
    }
}

class Emp {
    int id;
    String name;
    Address address; // Emp HAS-A Address

    Emp(int id, String name, Address address) {
        this.id = id;
        this.name = name;
        this.address = address;
    }

    void display() {
        System.out.println(id + " " + name);
        System.out.println(address.city + " " + address.state + " " + address.country);
    }

    public static void main(String[] args) {
        Address address1 = new Address("Mumbai", "Maharashtra", "India");
        Emp e = new Emp(111, "Sheru", address1);
        e.display();
    }
}
// OUTPUT:
// 111 Sheru
// Mumbai Maharashtra India`
                                ]
                            },
                            {
                                content: `<h3>Types of Inheritance - Summary Table</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Supported via classes?</th><th>Supported via interfaces?</th></tr>
<tr class='text-center'><td>Single</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Multilevel</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Hierarchical</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Multiple</td><td>No (diamond problem)</td><td>Yes (class implements many interfaces)</td></tr>
<tr class='text-center'><td>Hybrid</td><td>No (contains multiple)</td><td>Yes (class + several interfaces)</td></tr>
</table>`
                            },
                            {
                                content: `<div class='bg-secondary border border-primary p-2'>
<h4 class='text-center'>Interview Questions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the types of inheritance in Java?</td><td>Single, Multilevel, and Hierarchical are directly supported via classes. Multiple and Hybrid are not supported via classes but are achievable via interfaces.</td></tr>
<tr><td>Why doesn't Java support multiple inheritance of classes?</td><td>To avoid the Diamond Problem - if two super classes declare the same method, the compiler has no unambiguous rule for which implementation the sub class should inherit.</td></tr>
<tr><td>How does Java achieve multiple-inheritance-like behavior?</td><td>A class can implement any number of interfaces (multiple inheritance of type). Prior to Java 8, interfaces had no method bodies, so there was nothing to conflict.</td></tr>
<tr><td>Do Java 8 default methods reintroduce the diamond problem?</td><td>Yes - if two implemented interfaces declare the same default method, the implementing class gets a compile error and MUST override that method itself to resolve the ambiguity (optionally calling Interface.super.method()).</td></tr>
<tr><td>What is hybrid inheritance and why isn't it supported via classes?</td><td>It's a combination of more than one inheritance type (e.g. hierarchical + multiple). Since it includes multiple inheritance as a sub-case, it inherits the same diamond-problem restriction and must be built using a mix of class extends + interface implements.</td></tr>
<tr><td>What is Aggregation and how does it relate to inheritance?</td><td>Aggregation is a HAS-A relationship (a class holds a reference to another class as a field). It's an alternative to inheritance for code reuse when no true IS-A relationship exists.</td></tr>
</table>
</div>`
                            }
                        ]
                    };
