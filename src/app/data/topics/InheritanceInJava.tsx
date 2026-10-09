import { Topic } from '../coreJava';

export const inheritanceInJava: Topic = {
                        id: `inheritance in Java`,
                        name: `Inheritance in Java`,
                        beginner: [
                            {
                                content: `In Java, it is possible to inherit attributes and methods from one class to another. <br>
                We group the "inheritance concept" into two categories:<br>

• subclass (child) - the class that inherits from another class<br>
• superclass (parent) - the class being inherited from<br><br>
To inherit from a class, use the extends keyword.<br><br>

In the example below, the Car class (subclass) inherits the attributes and methods from the Vehicle class (superclass):`,
                                codeExamples: [
                                    `class Vehicle {
  protected String brand = "Ford";        // Vehicle attribute
  public void honk() {                    // Vehicle method
    System.out.println("Tuut, tuut!");
  }
}

class Car extends Vehicle {
  private String modelName = "Mustang";    // Car attribute
  public static void main(String[] args) {

    // Create a myCar object
    Car myCar = new Car();

    // Call the honk() method (from the Vehicle class) on the myCar object
    myCar.honk();

    // Show brand (from Vehicle) and modelName (from Car)
    System.out.println(myCar.brand + " " + myCar.modelName);
  }
}
// OUTPUT:
// Tuut, tuut!
// Ford Mustang`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `• Creating a new class by using the functionality of an existing class is called Inheritance.<br>
• It is a mechanism in which one class acquires the property of another class.<br>
• Inheritance means simply reusability.<br>
• It is called as - (IS Relationship)<br><br>
<h4>Example : </h4> IS Relationship<br>
<div class="bg-secondary border border-primary p-2">
package com.javaschoollab.demo; <br>
class Policy { // Policy = Super Class<br>
}<br>
class TermPolicy extends Policy { // TermPolicy = Sub Class wher TermPolicy is Policy<br>
}<br>
</div>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
//Superclass
public class Animal {
public void eat() {
System.out.println("This animal eats food.");
}
}
//Subclass
public class Dog extends Animal {
public void bark() {
System.out.println("The dog barks.");
}
@Override
public void eat() {
System.out.println("The dog eats kibble.");
}
}
//Main Class
public class Main {
public static void main(String[] args) {
Dog myDog = new Dog();
myDog.eat(); // Calls overridden method in Dog class
myDog.bark(); // Calls method in Dog class
}
}
// OUTPUT:
// The dog eats kibble.
// The dog barks.`
                                ]
                            }, {
                                content: `<h4>Note-</h4>
All the parent members are available in the child class, but only if both conditions below hold:<br>
• The access specifier allows it.<br>
• The child class does not redeclare the member.<br><br>

<h4>UML Diagram</h4>
<div class="bg-secondary border border-primary p-2">
Parent -P // Where P = Parent Class & C is the Child Class<br>
|<br>
|<br>
|<br>
Child – C<br>
</div>

<h4>Note-</h4> Below are different names for super and sub class.<br>
<div class="bg-secondary border border-primary p-2">
Super Class->Parent Class->Base Class-> Old Class<br>
Sub Class-> Child Class-> Derived Class -> New Class<br>
</div>
<h4>Note-</h4>
1. Inherit a class by using the extends keyword.<br>
2. When we create an object of the subclass, the superclass part of the object is created too, because superclass members are inherited.<br>
3. We use inheritance for code reusability: we reuse the variables and methods of an existing class.<br>
4. We cannot extend a final class.<br><br>

`},

                        ],
                        expert: [
                            {
                                content: `
                <h3>When to use?</h3>
If we want to extends or increase of features of class then go for inheritance.<br>
<div class="bg-secondary border border-primary p-2">
<h4>Advantages</h4>
1. Modify the attributes / fields / variable in the existing class but this is not good option it will
increase the testing efforts for that class.<br>
2. Add the attributes / fields / variable in the new class, this is the good option we can also reduce
the testing efforts for this.<br>
</div><br><br>


<h3>Why inheritance?</h3>

Suppose a class has the fields firstname, lastname, address, city and mobile number. Later we must add an email. What options do we have?<br>

<h4>How the class will look like</h4>
<div class="bg-secondary border border-primary p-2">
package com.javaschoollab.demo;<br>
class Parent {<br>
String firstname;<br>
String lastname;<br>
String address;<br>
String city;<br>
String mobilenumber;<br>
}<br>
</div><br>
<div class="bg-blue-100 border border-primary p-2 ">
class Child extends Parent{<br>
String email;<br>
}<br>
</div>
<br>
<h4>Note:</h4> We cannot assign parent class to child class- it means<br>
Child c=new Parent(); => Here we can't write new Parent();`
                            },
                            {
                                content: `All the members of super class will be directly inherited into sub class and they are eligible and depends
on access specifiers only. <br>
<h3>Dynamic Dispatch</h3>
Assigning a child object to a parent reference is called <strong>upcasting</strong>. <strong>Dynamic (method) dispatch</strong> is the separate mechanism by which a call to an overridden method is resolved at RUNTIME using the object's actual type.<br>

<h4>Example : </h4>
<div class="bg-secondary border border-primary p-2">
package com.javaschoollab.demo;<br>
class X {<br>
}<br>
</div><br>
<div class="bg-secondary border border-primary p-2">
package com.javaschoollab.demo;<br>
class Y extends X {<br>
}<br>
</div><br>
<div class="bg-secondary border border-primary p-2">
package com.javaschoollab.demo;<br>
class Test {<br>
public static void main(String[] args) {<br>
X x = new Y(); // Here we are assigning the child reference new Y() to parent class as X.<br>
}<br>
}<br>
</div><br>

<div class="bg-blue-100 border border-primary p-2">
Scenario 1 <br>
package com.javaschoollab.demo;<br>
class X { // Super Class: X<br>
int a = 10; // Initialization<br>
int b = 20; // Initialization<br>
void m1() {<br>
System.out.println("Class X- m1() method");<br>
}<br>
void m2() {<br>
System.out.println("Class X- m2() method");<br>
}<br>
}<br>
</div><br>

<div class="bg-blue-100 border border-primary p-2">
package com.javaschoollab.demo;<br>
class Y extends X { // Sub Class: Y<br>
int b = 30; // Initialization<br>
int c = 40; // Initialization<br>
void m2() {<br>
System.out.println("Class Y- m2() method");<br>
}<br>
void m3() {<br>
System.out.println("Class Y- m3() method");<br>
}<br>
}<br>

</div>

Below is one small, runnable proof for every scenario of accessing members through parent vs child references: <br>`
                            },

                            {
                                content: `<h4>Scenario 1: Accessing members through a plain X reference</h4>
Only X's own members are visible - a=10, b=20, m1(), m2(). c and m3() (from Y) don't exist here.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
X x = new X();
System.out.println(x.a);
System.out.println(x.b);
// System.out.println(x.c); // COMPILE ERROR: c is not a member of X
x.m1();
x.m2();
// x.m3(); // COMPILE ERROR: m3() is not a member of X
}
}
// OUTPUT:
// 10
// 20
// Class X- m1() method
// Class X- m2() method`
                                ]
                            },

                            {
                                content: `<h4>Scenario 2: Accessing members through a plain Y reference</h4>
Y has all of X's inherited members plus its own b (shadowed), c, and m3(); m2() is overridden.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
Y y = new Y();
System.out.println(y.a);
System.out.println(y.b);
System.out.println(y.c);
y.m1();
y.m2();
y.m3();
}
}
// OUTPUT:
// 10
// 30
// 40
// Class X- m1() method
// Class Y- m2() method
// Class Y- m3() method`
                                ]
                            },

                            {
                                content: `<h4>Scenario 3: Dynamic Dispatch — assigning a child object to a parent reference</h4>
Here a child object is assigned to a parent variable (<code>X x = new Y();</code>, upcasting).
The reference type (X) decides which <strong>fields</strong> are visible,
but the actual object type (Y) decides which <strong>overridden method</strong> runs (dynamic dispatch).`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
X x = new Y(); // Dynamic Dispatch
System.out.println(x.a);
System.out.println(x.b); // field access is NOT polymorphic - uses reference type X
// System.out.println(x.c); // COMPILE ERROR: c is not visible via X
x.m1();
x.m2(); // method call IS polymorphic - runs Y's overridden version
// x.m3(); // COMPILE ERROR: m3() is not declared in X
}
}
// OUTPUT:
// 10
// 20
// Class X- m1() method
// Class Y- m2() method`
                                ]
                            },

                            {
                                content: `<h4>Scenario 4: Same as Scenario 3, done via assignment instead of declaration</h4>
Note: assigning <code>x = y;</code> after separate declarations behaves identically to
<code>X x = new Y();</code> - both produce the exact same output as Scenario 3.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
X x = new X();
Y y = new Y();
x = y; // same effect as "X x = new Y();"
System.out.println(x.a);
System.out.println(x.b);
x.m1();
x.m2();
}
}
// OUTPUT:
// 10
// 20
// Class X- m1() method
// Class Y- m2() method`
                                ]
                            },

                            {
                                content: `<h4>Scenario 5: Type casting a parent reference back to Y</h4>
Casting <code>(Y) x</code> gives back full access to Y's own members (b=30, c=40, m3()) — equivalent
to working with the object as a plain Y reference (same result as Scenario 2).`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
X x = new Y();
Y y = new Y();
y = (Y) x; // Type casting back to Y
System.out.println(y.a);
System.out.println(y.b);
System.out.println(y.c);
y.m1();
y.m2();
y.m3();
}
}
// OUTPUT:
// 10
// 30
// 40
// Class X- m1() method
// Class Y- m2() method
// Class Y- m3() method`
                                ]
                            },

                            {
                                content: `<h4>Scenario 6: Proof — a parent object CANNOT be assigned to a child reference</h4>
A Y reference must point to an actual Y (or subtype of Y) object. Assigning a plain X object to it
fails at compile time.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
Y y = new X();
// COMPILE ERROR: incompatible types: X cannot be converted to Y
// A parent class object cannot be assigned to a child class reference.
}
}`
                                ]
                            },
                            {
                                content: `
                <div class="bg-blue-100 border border-primary p-2">
package com.javaschoollab.demo;<br>
public class Parent {<br>
int Dheeraj = 5000;<br>
int Sheru = 6000;<br>
void x1() {<br>
System.out.println("Dheeraj From Parent Class");<br>
}<br>
void x2() {<br>
System.out.println("Sheru From Parent Class");<br>
}<br>
}<br>
</div><br>

<div class="bg-blue-100 border border-primary p-2">
package com.javaschoollab.demo;<br>
public class Child extends Parent { // Step: 01<br>
int Sheru = 10000;<br>
int Omkar = 20000;<br>
void x2() {<br>
System.out.println("Sheru From Child Class");<br>
}<br>
void x3() {<br>
System.out.println("Omkar From Child Class");<br>
}<br>
}<br>
</div>

Below is one small, runnable proof for each access scenario between this Parent and Child: <br>`
                            },

                            {
                                content: `<h4>Scenario 1: Parent Class Data Access</h4>
A plain Parent object only sees Parent's own members - Omkar and x3() (defined only in Child) are not visible.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
Parent p = new Parent();
System.out.println(p.Dheeraj);
System.out.println(p.Sheru);
// System.out.println(p.Omkar); // COMPILE ERROR: not in Parent
p.x1();
p.x2();
// p.x3(); // COMPILE ERROR: not in Parent
}
}
// OUTPUT:
// 5000
// 6000
// Dheeraj From Parent Class
// Sheru From Parent Class`
                                ]
                            },

                            {
                                content: `<h4>Scenario 2: Child Class Data Access</h4>
Child inherits Dheeraj from Parent, shadows Sheru with its own value, adds Omkar, and overrides x2().`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
Child c = new Child();
System.out.println(c.Dheeraj); // inherited from Parent
System.out.println(c.Sheru);   // Child's own Sheru shadows Parent's
System.out.println(c.Omkar);   // Child's own field
c.x1(); // inherited from Parent (not overridden)
c.x2(); // overridden in Child
c.x3(); // Child's own method
}
}
// OUTPUT:
// 5000
// 10000
// 20000
// Dheeraj From Parent Class
// Sheru From Child Class
// Omkar From Child Class`
                                ]
                            },

                            {
                                content: `<h4>Scenario 3: Dynamic Dispatch — Parent reference pointing to a Child object</h4>
Field access (Dheeraj, Sheru) is resolved by the <strong>reference type</strong> (Parent), so
Parent's Sheru (6000) is used. Method calls are resolved by the <strong>actual object type</strong>
(Child), so the overridden x2() runs.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
Parent p3 = new Child(); // Dynamic Dispatch
System.out.println(p3.Dheeraj);
System.out.println(p3.Sheru); // reference type Parent -> 6000
// System.out.println(p3.Omkar); // COMPILE ERROR: not visible via Parent reference
p3.x1();
p3.x2(); // method call is polymorphic -> runs Child's overridden version
// p3.x3(); // COMPILE ERROR: x3() not declared on Parent
}
}
// OUTPUT:
// 5000
// 6000
// Dheeraj From Parent Class
// Sheru From Child Class`
                                ]
                            },

                            {
                                content: `<h4>Scenario 4: Same as Scenario 3, done via assignment</h4>
Note: assigning <code>p4 = c4;</code> after separate declarations behaves identically to
<code>Parent p3 = new Child();</code> - same output as Scenario 3.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
Parent p4 = new Parent();
Child c4 = new Child();
p4 = c4; // same effect as "Parent p3 = new Child();"
System.out.println(p4.Dheeraj);
System.out.println(p4.Sheru);
p4.x1();
p4.x2();
}
}
// OUTPUT:
// 5000
// 6000
// Dheeraj From Parent Class
// Sheru From Child Class`
                                ]
                            },

                            {
                                content: `<h4>Scenario 5: Type casting a Parent reference back to Child</h4>
Casting <code>(Child) p5</code> restores full access to Child's own members - same result as Scenario 2.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
Parent p5 = new Child();
Child c5 = new Child();
c5 = (Child) p5; // Type casting back to Child
System.out.println(c5.Dheeraj);
System.out.println(c5.Sheru);
System.out.println(c5.Omkar);
c5.x1();
c5.x2();
c5.x3();
}
}
// OUTPUT:
// 5000
// 10000
// 20000
// Dheeraj From Parent Class
// Sheru From Child Class
// Omkar From Child Class`
                                ]
                            },

                            {
                                content: `<h4>Scenario 6: Proof — a Parent object CANNOT be assigned to a Child reference</h4>
A Child reference must point to an actual Child (or subtype) object. Assigning a plain Parent object
to it fails at compile time.`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;
public class Test {
public static void main(String[] args) {
Child c6 = new Parent();
// COMPILE ERROR: incompatible types: Parent cannot be converted to Child
// We can't assign a Parent class object to a Child class reference.
}
}`
                                ]
                            },

                            {
                                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is inheritance and which keyword achieves it?</td><td>A mechanism where a subclass acquires the fields/methods of a superclass, using the extends keyword</td></tr>
<tr class='text-center'><td>What is "dynamic dispatch"?</td><td>Resolving a call to an overridden method at runtime by the actual object type, not the reference type (e.g. X x = new Y(); x.m2() runs Y's m2). Field access is still resolved by the reference type</td></tr>
<tr class='text-center'><td>Are field accesses polymorphic in Java?</td><td>No - only method calls are polymorphic. Field access through a parent reference always uses the parent's own field, even if the child shadows it with the same name</td></tr>
<tr class='text-center'><td>Can a parent class object be assigned to a child class reference directly?</td><td>No - that's a compile-time error (incompatible types); you'd need an explicit cast, which itself throws ClassCastException at runtime if the object isn't actually an instance of the child class</td></tr>
<tr class='text-center'><td>Why can't you extend a final class?</td><td>final on a class explicitly forbids inheritance - the compiler rejects any attempt to subclass it</td></tr>
<tr class='text-center'><td>What determines which members are inherited?</td><td>The access specifier of each member in the superclass, and whether that member is redeclared (shadowed/overridden) in the subclass</td></tr>
</table>`
                            }

                        ]
                    };
