import { Topic } from '../coreJava';

export const thisAndSuperKeywords: Topic = {
    id: 'this-super',
    name: 'This and Super Keywords',

    beginner: [
        {
            content: `<h4>What are this and super?</h4>
<ul>
<li><code>this</code> refers to the <b>current object</b> — the instance whose method or constructor is currently executing.</li>
<li><code>super</code> refers to the <b>parent class part</b> of that same object — it gives access to parent members that the child class might hide or override.</li>
<li>Both keywords can be used with variables, methods, and constructors.</li>
</ul>
<p>Both also have a constructor-chaining form — <code>this()</code> calls another constructor of the same class, and <code>super()</code> calls the parent's constructor. That behavior (including the "must be first statement" rule) is covered in depth in the <b>Constructor Chaining</b> topic — here we focus on <code>this</code>/<code>super</code> as everyday keywords for fields and methods.</p>`
        },

        {
            content: `<h4>this — Resolving a Field vs Parameter Name Clash</h4>
When a constructor (or method) parameter has the <b>same name</b> as an instance field, the parameter shadows the field inside that block. <code>this.fieldName</code> explicitly targets the instance field, so the assignment isn't just the parameter being assigned to itself.`,
            codeExamples: [
                `class Student {
    String name;

    Student(String name) {
        this.name = name;  // this.name (field) = name (parameter)
    }
}

public class ThisFieldDemo {
    public static void main(String[] args) {
        Student s = new Student("Pankaj");
        System.out.println("Name: " + s.name);
    }
}
// OUTPUT:
// Name: Pankaj`
            ]
        },

        {
            content: `<h4>this — Calling the Current Object's Own Method</h4>
Inside a class, <code>this.methodName()</code> calls a method on the current object. Writing just <code>methodName()</code> works identically — Java implicitly adds <code>this</code> — but it can be written explicitly for clarity.`,
            codeExamples: [
                `class Greeter {
    void sayHello() {
        System.out.println("Hello!");
    }

    void greetUser() {
        this.sayHello();   // calling own method via this
    }
}

public class ThisMethodDemo {
    public static void main(String[] args) {
        new Greeter().greetUser();
    }
}
// OUTPUT:
// Hello!`
            ]
        },

        {
            content: `<h4>super — Accessing a Field Hidden by the Child Class</h4>
When a child class declares a field with the <b>same name</b> as one in its parent, the child's field <i>hides</i> the parent's — both copies exist. <code>super.fieldName</code> reaches the parent's copy directly from inside the child.`,
            codeExamples: [
                `class Animal {
    String name = "Dog";
}

class Pet extends Animal {
    String name = "Puppy";

    void display() {
        System.out.println("this name: " + this.name);
        System.out.println("super name: " + super.name);
    }
}

public class SuperFieldDemo {
    public static void main(String[] args) {
        new Pet().display();
    }
}
// OUTPUT:
// this name: Puppy
// super name: Dog`
            ]
        },

        {
            content: `<h4>super — Calling a Parent Method Overridden by the Child</h4>
When a child class overrides a parent method, calling it normally always runs the child's version. <code>super.methodName()</code> is how the child explicitly invokes the parent's original implementation.`,
            codeExamples: [
                `class Parent {
    void test() {
        System.out.println("Parent class method.");
    }
}

class Child extends Parent {
    void test() {
        super.test();   // explicitly calls Parent's version
    }
}

public class SuperMethodDemo {
    public static void main(String[] args) {
        new Child().test();
    }
}
// OUTPUT:
// Parent class method.`
            ]
        }
    ],

    expert: [
        {
            content: `<h4>this Cannot Be Used in a Static Context</h4>
<code>this</code> refers to the current <b>instance</b> — but a <code>static</code> method or block belongs to the class itself, not to any particular object, so there is no instance for <code>this</code> to refer to. Using <code>this</code> inside a static context is a <b>compile-time error</b>. This ties directly into the <b>Static Keyword</b> topic: static members are resolved at the class level, before (or even without) any object existing.<br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">class Demo {
    int value = 10;

    static void show() {
        System.out.println(this.value);
        // COMPILE ERROR:
        // "non-static variable this cannot be referenced
        //  from a static context"
    }
}</pre>
The fix is to either drop <code>static</code> from the method, or access the value through an actual object reference instead of <code>this</code>.`,
            codeExamples: [
                `class Demo {
    int value = 10;

    // Non-static method: 'this' works fine here
    void showInstance() {
        System.out.println("this.value = " + this.value);
    }

    // Static method: must use an object reference, never 'this'
    static void showViaObject() {
        Demo d = new Demo();
        System.out.println("d.value = " + d.value);
    }
}

public class StaticThisDemo {
    public static void main(String[] args) {
        new Demo().showInstance();
        Demo.showViaObject();
    }
}
// OUTPUT:
// this.value = 10
// d.value = 10`
            ]
        },

        {
            content: `<h4>super — Extending Behavior Instead of Replacing It</h4>
A very common override pattern: the child overrides a method, calls <code>super.method()</code> first (or last) to run the parent's original logic, and then adds its own extra behavior on top. This lets the child <b>extend</b> the parent's behavior instead of fully rewriting it — avoiding duplicated logic.`,
            codeExamples: [
                `class Report {
    void generate() {
        System.out.println("Generating base report...");
    }
}

class DetailedReport extends Report {
    @Override
    void generate() {
        super.generate();                 // run the parent's base logic first
        System.out.println("Adding detailed charts...");  // then extend it
    }
}

public class ExtendBehaviorDemo {
    public static void main(String[] args) {
        new DetailedReport().generate();
    }
}
// OUTPUT:
// Generating base report...
// Adding detailed charts...`
            ]
        },

        {
            content: `<h4>Field Hiding vs Method Overriding Through super</h4>
Fields in Java are <b>not polymorphic</b> — which field is accessed is decided by the <b>reference type</b> at compile time. Methods (unless static/private/final) ARE polymorphic — dynamic dispatch always picks the actual object's most-overridden version, <em>even when accessed through a parent-typed reference</em>. <code>super</code> inside a child class always reaches the parent's field directly, but <code>super.method()</code> is the only way to bypass dynamic dispatch and force the parent's implementation to run.<br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Reference type Parent p = new Child();

p.field   -> resolved by REFERENCE TYPE (Parent)   -> Parent's field
p.method()-> resolved by ACTUAL OBJECT TYPE (Child) -> Child's overridden method

Inside Child:
this.field   -> Child's own field
super.field  -> Parent's field (direct, unambiguous)
this.method()  -> dynamic dispatch -> Child's version
super.method() -> explicitly forces -> Parent's version</pre>`,
            codeExamples: [
                `class Parent {
    String label = "Parent-Field";

    void greet() {
        System.out.println("Parent greet()");
    }
}

class Child extends Parent {
    String label = "Child-Field";   // hides Parent.label, does not override it

    @Override
    void greet() {                  // overrides Parent.greet()
        System.out.println("Child greet()");
    }

    void show() {
        System.out.println("this.label  = " + this.label);
        System.out.println("super.label = " + super.label);  // reaches hidden parent field

        this.greet();    // Child greet() - normal dynamic dispatch
        super.greet();   // Parent greet() - explicitly bypasses override
    }
}

public class HidingVsOverridingDemo {
    public static void main(String[] args) {
        new Child().show();

        // Field access resolved by reference type; method access by object type
        Parent p = new Child();
        System.out.println("p.label (via Parent ref) = " + p.label);   // Parent's field
        p.greet();                                                     // still Child's method
    }
}
// OUTPUT:
// this.label  = Child-Field
// super.label = Parent-Field
// Child greet()
// Parent greet()
// p.label (via Parent ref) = Parent-Field
// Child greet()`
            ]
        },

        {
            content: `<h4>this — Passing the Current Object to Another Method</h4>
<code>this</code> can be passed as an argument so another object gets a reference back to the caller — common in listener/callback/helper registration patterns.`,
            codeExamples: [
                `class Logger {
    void log(Task t) {
        System.out.println("Logging task: " + t.name);
    }
}

class Task {
    String name;
    Task(String name) { this.name = name; }

    void run(Logger logger) {
        logger.log(this);   // pass current object to the helper
    }
}

public class PassThisDemo {
    public static void main(String[] args) {
        Task task = new Task("Backup");
        task.run(new Logger());
    }
}
// OUTPUT:
// Logging task: Backup`
            ]
        },

        {
            content: `<h4>this vs super — Quick Comparison</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>this</th><th>super</th></tr>
<tr class='text-center'><td>Refers to the current class object</td><td>Refers to the immediate parent class object</td></tr>
<tr class='text-center'><td>Used to access current class members</td><td>Used to access parent class members hidden/overridden by the child</td></tr>
<tr class='text-center'><td>Can be used in any non-static context</td><td>Can only be used inside a subclass</td></tr>
<tr class='text-center'><td>Cannot be used in a static context</td><td>Cannot be used in a static context</td></tr>
<tr class='text-center'><td>this() chains to another constructor of the same class</td><td>super() chains to the parent class constructor</td></tr>
</table>

<h4>Interview Questions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why can't this/super be used in a static method?</td><td>Static methods belong to the class, not to any instance, so there is no current object for this/super to refer to — compile error</td></tr>
<tr class='text-center'><td>Does super.field always give the "right" value?</td><td>Yes — fields aren't polymorphic, so super.field is a direct, unambiguous lookup on the parent's own copy</td></tr>
<tr class='text-center'><td>Why does super.method() work differently from super.field?</td><td>Instance methods use dynamic dispatch (resolved by actual object type); super.method() is the explicit way to bypass that and force the parent's version</td></tr>
<tr class='text-center'><td>If Parent p = new Child(); what does p.field return?</td><td>Parent's field — field access is resolved by the reference type at compile time, not the actual object</td></tr>
<tr class='text-center'><td>If Parent p = new Child(); what does p.method() return (if overridden)?</td><td>Child's overridden method — method calls are resolved by the actual object type at runtime</td></tr>
<tr class='text-center'><td>Can this be reassigned, e.g. this = obj;?</td><td>No — this is a keyword, not a variable; reassigning it is a compile error</td></tr>
<tr class='text-center'><td>Where are the this()/super() constructor-chaining rules covered?</td><td>In depth in the Constructor Chaining topic — including the "must be the first statement" rule</td></tr>
</table>`
        }
    ]
};
