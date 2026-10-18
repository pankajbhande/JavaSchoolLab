import { Topic } from '../coreJava';

export const finalKeyword: Topic = {
    id: "final-keyword",
    name: "Final Keyword",

    beginner: [
        {
            content: `<ul>
<li><b>final</b> is a keyword in Java that can be applied to <b>variables, methods, and classes</b>.</li>
<li>In every case, <b>final</b> is used to <b>restrict modification</b>:</li>
<li><ul>
<li>final <b>variable</b>: the value cannot be reassigned (acts like a constant).</li>
<li>final <b>method</b>: cannot be overridden by a subclass.</li>
<li>final <b>class</b>: cannot be extended/inherited at all.</li>
</ul></li>
</ul>
<p>Below is one small, runnable example (with proof) for each of the three uses.</p>`
        },
        {
            content: `<h4>1. Final Variable</h4>
<ul>
<li>A variable declared with <b>final</b> is called a final variable.</li>
<li>Once a value is assigned, it <b>cannot be changed</b> - final variables behave like constants.</li>
</ul>`,
            codeExamples: [
                `package com.test;

public class FinalDemo {
    public static void main(String[] args) {
        final int a = 5;
        System.out.println(a);
    }
}
// OUTPUT:
// 5`
            ]
        },
        {
            content: `<h4>Final Variable - Compile Time Error</h4>
<ul>
<li>Any attempt to reassign a final variable's value causes a <b>compile-time error</b>.</li>
</ul>`,
            codeExamples: [
                `package com.test;

public class FinalDemo {
    public static void main(String[] args) {
        final int a = 5;
        // a++;
        // COMPILE ERROR: cannot assign a value to final variable a
    }
}
// OUTPUT:
// (does not compile if the line is uncommented)`
            ]
        },
        {
            content: `<h4>2. Final Method</h4>
<ul>
<li>A method declared with <b>final</b> is called a final method.</li>
<li>Final methods <b>cannot be overridden</b> by a subclass.</li>
</ul>`,
            codeExamples: [
                `package com.test;

class X {
    public final void x1() {
        System.out.println("Class X method");
    }
}

class Y extends X {
    // public void x1() { }
    // COMPILE ERROR: x1() in Y cannot override x1() in X
    // (overridden method is final)
}

public class FinalDemo {
    public static void main(String[] args) {
        new X().x1();
    }
}
// OUTPUT:
// Class X method`
            ]
        },
        {
            content: `<h4>3. Final Class</h4>
<ul>
<li>A class declared with <b>final</b> cannot be <b>extended/inherited</b> at all.</li>
<li><code>String</code>, <code>Integer</code> and every wrapper class are examples of final classes in the JDK.</li>
</ul>`,
            codeExamples: [
                `package com.test;

final class Demo {
    void show() {
        System.out.println("Demo class");
    }
}

// class Sub extends Demo { }
// COMPILE ERROR: cannot inherit from final Demo

public class FinalDemo {
    public static void main(String[] args) {
        new Demo().show();
    }
}
// OUTPUT:
// Demo class`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>final Applies to Three Things - Quick Recap</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Applied to</th><th>Effect</th></tr>
<tr class='text-center'><td>Variable</td><td>Value can be assigned only once - acts as a constant</td></tr>
<tr class='text-center'><td>Method</td><td>Cannot be overridden by any subclass (can still be overloaded)</td></tr>
<tr class='text-center'><td>Class</td><td>Cannot be extended/inherited by any subclass</td></tr>
</table>`
        },
        {
            content: `<h3>Blank Final Variable</h3>
<ul>
<li>A <b>blank final</b> variable is declared <b>without an initializer</b>.</li>
<li>It must be assigned <b>exactly once</b>, in an initializer block or in <b>every</b> constructor of the class.</li>
<li>If even one constructor path forgets to assign it, that is a <b>compile-time error</b>.</li>
</ul>`,
            codeExamples: [
                `package com.test;

class Employee {
    final int id; // blank final - no initializer here

    Employee(int id) {
        this.id = id; // must assign exactly once, in the constructor
    }
}

public class FinalDemo {
    public static void main(String[] args) {
        Employee e = new Employee(101);
        System.out.println(e.id);
    }
}
// OUTPUT:
// 101`
            ]
        },
        {
            content: `<h3>Final Reference vs Immutable Object</h3>
<ul>
<li><b>final</b> on a reference variable only stops <b>reassignment</b> of that reference.</li>
<li>It does <b>not</b> make the object itself immutable - mutable fields can still change via setters.</li>
<li><code>emp = new Employee();</code> after a final assignment is a <b>compile-time error</b>, but <code>emp.setName(...)</code> works fine.</li>
</ul>`,
            codeExamples: [
                `package com.test;

class Employee {
    String name;
    void setName(String name) { this.name = name; }
}

public class FinalDemo {
    public static void main(String[] args) {
        final Employee emp = new Employee();
        emp.setName("Pankaj");   // OK: mutating the object is allowed
        System.out.println(emp.name);

        // emp = new Employee();
        // COMPILE ERROR: cannot assign a value to final variable emp
    }
}
// OUTPUT:
// Pankaj`
            ]
        },
        {
            content: `<h3>Final Parameters</h3>
<ul>
<li>A method parameter declared <b>final</b> cannot be reassigned inside the method body.</li>
<li>Used mainly for defensive coding: it signals (and enforces) that the parameter's value stays untouched.</li>
</ul>`,
            codeExamples: [
                `package com.test;

public class FinalDemo {
    static int square(final int n) {
        // n = n * n;
        // COMPILE ERROR: cannot assign a value to final variable n
        return n * n;
    }

    public static void main(String[] args) {
        System.out.println(square(5));
    }
}
// OUTPUT:
// 25`
            ]
        },
        {
            content: `<h3>Effectively Final - Why Lambdas &amp; Anonymous Classes Need It</h3>
<ul>
<li>A local variable that is <b>never reassigned</b> after initialization is called <b>effectively final</b>, even without the <code>final</code> keyword.</li>
<li>Any local variable or parameter used inside a <b>lambda</b> or <b>anonymous inner class</b> must be <b>final or effectively final</b>.</li>
<li>Reason: the lambda may outlive the method call (for example, stored and run later). The compiler <b>copies the value when the lambda is created</b>, so it forbids capturing a variable that could still change.</li>
</ul>`,
            codeExamples: [
                `package com.test;

import java.util.function.Supplier;

public class FinalDemo {
    public static void main(String[] args) {
        int count = 10;              // effectively final - never reassigned
        Supplier<Integer> supplier = () -> count * 2;  // lambda captures it
        System.out.println(supplier.get());

        // count = 20;
        // COMPILE ERROR: if uncommented, count is no longer effectively
        // final, and the lambda above would fail to compile
    }
}
// OUTPUT:
// 20`
            ]
        },
        {
            content: `<h3>final + static = True Constant</h3>
<ul>
<li><b>static</b> alone means "one copy shared by the class"; <b>final</b> alone means "cannot be reassigned".</li>
<li>Combined, <code>static final</code> gives a single class-wide constant - the standard way to declare true constants in Java.</li>
<li>Convention: name constants in <b>UPPER_CASE</b> with underscores, e.g. <code>MAX_USERS</code>.</li>
</ul>`,
            codeExamples: [
                `package com.test;

class AppConfig {
    static final int MAX_USERS = 100;
    static final String APP_NAME = "JavaSchoolLab";
}

public class FinalDemo {
    public static void main(String[] args) {
        System.out.println(AppConfig.APP_NAME + " allows "
                + AppConfig.MAX_USERS + " users");
    }
}
// OUTPUT:
// JavaSchoolLab allows 100 users`
            ]
        },
        {
            content: `<h3>Final Class in the JDK - Why String/Wrapper Classes Are Final</h3>
<ul>
<li><code>String</code>, <code>Integer</code>, and every wrapper class (<code>Double</code>, <code>Boolean</code>, etc.) are <b>final</b>.</li>
<li>Reasons: it locks in <b>immutability</b>, protects the <b>String Pool</b> from a mutable subclass changing behavior, and closes <b>security</b> holes (for example, a fake String subclass slipping past code that trusts String).</li>
</ul>`,
            codeExamples: [
                `package com.test;

final class SecurityToken {
    private final String value;
    SecurityToken(String value) { this.value = value; }
    String getValue() { return value; }
}

// class FakeToken extends SecurityToken { }
// COMPILE ERROR: cannot inherit from final SecurityToken

public class FinalDemo {
    public static void main(String[] args) {
        SecurityToken token = new SecurityToken("ABC123");
        System.out.println(token.getValue());
    }
}
// OUTPUT:
// ABC123`
            ]
        },
        {
            content: `<h3>Performance: Does final Make Code Faster?</h3>
<ul>
<li>Common folklore says "final helps the JIT inline methods and speeds things up."</li>
<li>Reality: the <b>JIT compiler</b> can already inline non-final methods in most cases (using class hierarchy analysis). It only has to undo that work if a subclass later overrides the method.</li>
<li><b>final</b> mainly helps the <b>compiler and the developer reason about correctness</b>. Any speed effect is usually negligible, so use final for <b>design intent and safety</b>, not as a performance trick.</li>
</ul>`
        },
        {
            content: `<h3>final Is Not Allowed on Interface Methods</h3>
<ul>
<li>The Java Language Specification does not permit the <code>final</code> modifier on <b>any interface method</b> (abstract, default or static). It is a <b>compile-time error</b>.</li>
<li>Intuition: an abstract method has no body to protect, and a default method that could never be overridden would defeat the purpose of an interface as a flexible contract.</li>
<li>Related fact: any field declared in an interface is <b>implicitly <code>public static final</code></b>, so interfaces hold only constants, never mutable state.</li>
</ul>`,
            codeExamples: [
                `interface Config {
    // final void load();
    // COMPILE ERROR: modifier 'final' not allowed here

    // default final void reset() { }
    // COMPILE ERROR: illegal combination of modifiers: 'default' and 'final'

    int MAX_RETRIES = 5;   // implicitly: public static final int MAX_RETRIES = 5;
}

public class FinalDemo {
    public static void main(String[] args) {
        System.out.println(Config.MAX_RETRIES);
        // Config.MAX_RETRIES = 10;
        // COMPILE ERROR: cannot assign a value to final variable MAX_RETRIES
    }
}
// OUTPUT:
// 5`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Difference between final, finally, finalize()?</td><td>final = keyword restricting modification (variable/method/class); finally = block that always runs after try/catch for cleanup; finalize() = deprecated Object method GC used to call before reclaiming memory - the three are unrelated</td></tr>
<tr class='text-center'><td>Can a final method be overloaded?</td><td>Yes - final only blocks overriding, not overloading in the same class</td></tr>
<tr class='text-center'><td>Can a final class have subclasses?</td><td>No - a final class can never be extended</td></tr>
<tr class='text-center'><td>What is a blank final variable?</td><td>A final variable declared without an initializer; it must be assigned exactly once in every constructor</td></tr>
<tr class='text-center'><td>Does final on a reference make the object immutable?</td><td>No - it only prevents reassigning the reference itself; the object's mutable fields can still change via its own methods</td></tr>
<tr class='text-center'><td>Why must lambdas/anonymous classes only use final or effectively final locals?</td><td>They may execute after the enclosing method returns, so the compiler captures the variable's value at creation time; allowing reassignment would create a mismatch between the captured value and the live variable</td></tr>
<tr class='text-center'><td>Why are String and wrapper classes final?</td><td>To preserve immutability, protect the String Pool, and prevent security exploits via malicious subclassing</td></tr>
<tr class='text-center'><td>Does final always improve performance?</td><td>Not meaningfully - modern JITs can already inline non-final methods; use final for correctness/design intent, not as a performance trick</td></tr>
<tr class='text-center'><td>Can an interface method be declared final?</td><td>No - never, for abstract, default, or static interface methods alike; it's a compile-time error in all three cases</td></tr>
</table>`
        }
    ]
};
