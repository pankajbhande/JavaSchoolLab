import { Topic } from '../coreJava';

export const classesAndObjects: Topic = {
                        id: 'classes-objects',
                        name: 'Classes and Objects',
                        beginner: [
                            {
                                content: `<p>A class is a blueprint for creating objects. An object is an instance of a class.</p>
<h4>Key Concepts</h4>
<ul>
<li><b>Class</b>: template that defines properties and behaviors</li>
<li><b>Object</b>: instance of a class</li>
<li><b>Fields</b>: variables that hold the state</li>
<li><b>Methods</b>: functions that define behavior</li>
<li><b>Constructor</b>: special method that initializes objects</li>
</ul>`,
                                codeExamples: [
                                    `// Class and Object Example
public class Student {
    // Fields
    String name;
    int rollNumber;

    // Constructor
    public Student(String name, int rollNumber) {
        this.name = name;
        this.rollNumber = rollNumber;
    }

    // Method
    public void displayInfo() {
        System.out.println("Name: " + name);
        System.out.println("Roll Number: " + rollNumber);
    }

    public static void main(String[] args) {
        // Creating object
        Student student1 = new Student("Jiva", 101);
        student1.displayInfo();
    }
}
// OUTPUT:
// Name: Jiva
// Roll Number: 101`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `<p><code>Object</code> is the parent class of all classes in Java. It is the topmost class and lives in the <code>java.lang</code> package.</p>
<p>Every class is directly or indirectly derived from <code>Object</code>. If a class does not extend any other class, it is a direct child of <code>Object</code>.</p>
<h4>Methods of the Object class</h4>
<ol>
<li><code>public final Class getClass()</code></li>
<li><code>public int hashCode()</code></li>
<li><code>public boolean equals(Object obj)</code></li>
<li><code>protected Object clone() throws CloneNotSupportedException</code></li>
<li><code>public String toString()</code></li>
<li><code>public final void notify()</code></li>
<li><code>public final void notifyAll()</code></li>
<li><code>public final void wait()</code></li>
<li><code>public final void wait(long timeout)</code></li>
<li><code>public final void wait(long timeout, int nanos)</code></li>
<li><code>protected void finalize() throws Throwable</code></li>
</ol>
<h3>1. public final Class getClass()</h3>
<p>It returns the runtime class of the object (its metadata, such as the class name).</p>`,
                                codeExamples: [
                                    `package com.test;

public class Test {
    public static void main(String[] args) {
        Test test = new Test();
        System.out.println(test.getClass().getName());
        System.out.println(test.getClass().getSimpleName());
    }
}
// OUTPUT:
// com.test.Test
// Test`
                                ]
                            },
                            {
                                content: `<h3>2. public int hashCode()</h3>

<p>Every object has a hash code, an <code>int</code> derived by the JVM. It is NOT guaranteed unique: two distinct objects may legally share one, which is why hash buckets fall back to <code>equals()</code>.</p>
<p>Hash-based collections such as <code>HashMap</code> use the hash code to pick the bucket where an object is stored.</p>
<p>Note: the default <code>hashCode()</code> is a native method (written in C or C++), so you cannot see its Java body.</p>`,
                                codeExamples: [
                                    `package com.test;

public class Test1 {
    public static void main(String[] args) {
        Test1 test2 = new Test1();
        Test1 test3 = new Test1();
        System.out.println(test2.hashCode());
        System.out.println(test3.hashCode());
    }
}
// OUTPUT: (values differ on each run)
// 1163157884
// 1956725890`
                                ]
                            },
                            {
                                content: `<h3>3. public boolean equals(Object obj)</h3>
<p>It compares the given object with this object. The default <code>equals()</code> in <code>Object</code> compares references (addresses), not field contents. Classes such as <code>String</code> override it to compare contents.</p>`,
                                codeExamples: [`package com.test;

public class Test3 {
    int empId;
    String empName;

    public static void main(String[] args) {
        Test3 test3 = new Test3();
        test3.empId = 1;
        test3.empName = "ashok";
        Test3 test4 = new Test3();
        test4.empId = 2;
        test4.empName = "ram";
        System.out.println(test3.equals(test4));
    }
}
// OUTPUT:
// false`, `package com.test;

public class Test3 {
    int empId;
    String empName;

    public static void main(String[] args) {
        Test3 test3 = new Test3();
        test3.empId = 1;
        test3.empName = "ashok";
        Test3 test4 = new Test3();
        test4.empId = 2;
        test4.empName = "ram";
        test3 = test4;   // both now point to the same object
        System.out.println(test3.equals(test4));
    }
}
// OUTPUT:
// true`
                                ]
                            },
                            {
                                content: `<h3>4. protected Object clone() throws CloneNotSupportedException</h3>
<p>It creates and returns a copy (clone) of this object. The class must implement <code>Cloneable</code>.</p>`,
                                codeExamples: [
                                    `package com.test;

// clone() creates a copy of the object
public class Test4 implements Cloneable {
    int x;

    public static void main(String[] args) throws CloneNotSupportedException {
        Test4 test4 = new Test4();
        test4.x = 50;
        System.out.println("first object is>>" + test4.x);
        Object test5 = test4.clone();
        System.out.println("second object is>>" + test5.toString());
    }
}
// OUTPUT: (hash differs on each run)
// first object is>>50
// second object is>>com.test.Test4@1b6d3586`
                                ]
                            }, {
                                content: `<p>In the second output line above we get <code>ClassName@hash</code> instead of the value. To fix this, override <code>toString()</code>.</p>`,
                                codeExamples: [`package com.test;

// clone() creates a copy of the object
public class Test4 implements Cloneable {
    int x;

    public static void main(String[] args) throws CloneNotSupportedException {
        Test4 test4 = new Test4();
        test4.x = 50;
        System.out.println("first object is>>" + test4.x);
        Object test5 = test4.clone();
        System.out.println("second object is>>" + test5.toString());
    }

    @Override
    public String toString() {
        return "Test4 [x=" + x + "]";
    }
}
// OUTPUT:
// first object is>>50
// second object is>>Test4 [x=50]`]
                            },
                            {
                                content: `<h3>5. public String toString() </h3>
<p>It returns the string representation of this object.</p>`,
                                codeExamples: [`package com.test;

public class Employee {
    int id;
    String employeeName;
    String employeeCity;

    @Override
    public String toString() {
        return "Employee [id=" + id + ", employeeName=" + employeeName
                + ", employeeCity=" + employeeCity + "]";
    }

    public static void main(String[] args) {
        Employee employee = new Employee();
        employee.id = 10;
        employee.employeeName = "ajay";
        employee.employeeCity = "pune";
        System.out.println(employee);
    }
}
// OUTPUT:
// Employee [id=10, employeeName=ajay, employeeCity=pune]`]
                            },
                            {
                                content: `<h3>6. Thread and cleanup methods</h3>
<div class='bg-secondary border border-primary p-2'>
<h4>public final void notify()</h4>
<p>It wakes up a single thread that is waiting on this object's monitor.</p>
</div>
<div class='bg-secondary border border-primary p-2'>
<h4>public final void notifyAll()</h4>
<p>It wakes up all threads that are waiting on this object's monitor.</p>
</div>
<div class='bg-secondary border border-primary p-2'>
<h4>public final void wait(long timeout) throws InterruptedException</h4>
<p>It makes the current thread wait for the given milliseconds, or until another thread calls notify() or notifyAll().</p>
</div>
<div class='bg-secondary border border-primary p-2'>
<h4>public final void wait(long timeout, int nanos) throws InterruptedException</h4>
<p>Same as above, with an extra nanosecond part in the timeout.</p>
</div>
<div class='bg-secondary border border-primary p-2'>
<h4>public final void wait() throws InterruptedException</h4>
<p>It makes the current thread wait until another thread calls notify() or notifyAll().</p>
</div>
<div class='bg-secondary border border-primary p-2'>
<h4>protected void finalize() throws Throwable</h4>
<p>The garbage collector used to call it before collecting the object. It is deprecated for removal since Java 18, so do not rely on it.</p>
</div>`
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Class as a Blueprint, Object as an Instance</h3>
A class defines the shape of state and behaviour, but it doesn't occupy heap memory itself. Each <code>new</code> call creates an independent object on the heap with its own copy of the instance fields.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">class Employee { int id; String name; }        (blueprint - no memory yet)

Stack                          Heap
------                         ----------------------
e1  ----------------------->   Employee Object #1
                                id = 101, name = "Pankaj"

e2  ----------------------->   Employee Object #2
                                id = 102, name = "Raghunath"</pre>

Two objects created from the same class never share instance state - changing <code>e1.name</code> has no effect on <code>e2.name</code>.<br>`,
                                codeExamples: [
                                    `class Employee {
    int id;
    String name;
}

public class BlueprintDemo {
    public static void main(String[] args) {
        Employee e1 = new Employee();
        e1.id = 101; e1.name = "Pankaj";

        Employee e2 = new Employee();
        e2.id = 102; e2.name = "Raghunath";

        e1.name = "Pankaj Updated";
        System.out.println(e1.name);
        System.out.println(e2.name);
    }
}
// OUTPUT:
// Pankaj Updated
// Raghunath`
                                ]
                            },
                            {
                                content: `<h3>Object Creation — Step by Step</h3>
When <code>new</code> runs, four things happen in order:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">new Employee()
      |
      v
1. Heap memory allocated for the object
      |
      v
2. Fields set to their default values (0, false, null...)
      |
      v
3. Instance initializer blocks run (top to bottom)
      |
      v
4. Constructor body runs
      |
      v
Reference returned to the caller</pre>

Because default values are assigned <strong>before</strong> the constructor body runs, a field read at the very start of the constructor already has its default - not garbage, and not yet whatever the constructor is about to set.<br>`,
                                codeExamples: [
                                    `public class Employee {
    int salary;

    public Employee() {
        // default value is already set here
        System.out.println("Before assignment, salary = " + salary);
        salary = 50000;
        System.out.println("After assignment, salary = " + salary);
    }

    public static void main(String[] args) {
        new Employee();
    }
}
// OUTPUT:
// Before assignment, salary = 0
// After assignment, salary = 50000`
                                ]
                            },
                            {
                                content: `<h3>Anonymous Objects</h3>
An object created and used inline, without ever being assigned to a variable. Useful for one-off calls where you don't need to keep a reference around afterwards.<br>`,
                                codeExamples: [
                                    `class Employee {
    void displayInfo() {
        System.out.println("Employee record printed");
    }
}

public class AnonymousObjectDemo {
    public static void main(String[] args) {
        new Employee().displayInfo();   // anonymous object - no variable holds it
        // The object becomes eligible for garbage collection right after this line
    }
}
// OUTPUT:
// Employee record printed`
                                ]
                            },
                            {
                                content: `<h3>Object Identity vs Value Equality</h3>
Every object carries its own identity, independent of its field values. The default <code>toString()</code> prints <code>ClassName@hexHashCode</code>, and <code>==</code> compares references, not contents.<br><br>

Two objects with identical field values are still two different objects unless you explicitly override <code>equals()</code> to compare by value.<br>`,
                                codeExamples: [
                                    `class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
}

public class IdentityDemo {
    public static void main(String[] args) {
        Point p1 = new Point(5, 5);
        Point p2 = new Point(5, 5);

        System.out.println(p1);                 // default toString(): Point@hashcode
        System.out.println(p1 == p2);            // reference comparison
        System.out.println(p1.x == p2.x && p1.y == p2.y); // manual value comparison
    }
}
// OUTPUT:
// Point@1b6d3586
// false
// true`
                                ]
                            },
                            {
                                content: `<h3>Common Interview Traps</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Class vs Object, in one line each</td><td>Class = blueprint/template; Object = a concrete instance built from that blueprint</td></tr>
<tr class='text-center'><td>Do objects of the same class share instance fields?</td><td>No - each object has its own copy. Only static fields are shared across all instances</td></tr>
<tr class='text-center'><td>How is an object reference passed to a method?</td><td>The reference itself is passed by value (a copy of the reference), but both the original and the copy point to the same object on the heap - so mutating fields through either one is visible to both</td></tr>
<tr class='text-center'><td>Can you have a class with zero objects ever created?</td><td>Yes - e.g. a utility class with only static methods, which by convention is often given a private constructor</td></tr>
</table>
<br>
<strong>Golden rule:</strong> the class exists once at compile/load time; objects are created (and destroyed by the GC) as many times as the program needs, each with its own independent state on the heap.<br>`
                            }
                        ]
                    };
