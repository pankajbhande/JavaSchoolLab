import { Topic } from '../coreJava';

export const variablesConcept: Topic = {
    id: 'variables-concept',
    name: 'Variables',
    beginner: [
        {
            content: `<h3>What is a Variable?</h3>
A variable is a named location in memory that holds a value your program can use and change while it runs. <br><br>
Think of it like a labeled box: the label (variable name) never changes, but you can swap out what's inside the box (the value) as your program executes. <br><br>
In Java, every variable must have a <strong>type</strong> declared before it can be used - this tells the compiler what kind of data (and how much memory) the box can hold.<br>`,
            codeExamples: [`public class VariableDemo {
    public static void main(String[] args) {
        int age = 25;          // a "box" named age, holding an integer
        System.out.println("Age = " + age);

        age = 26;               // same box, new value
        System.out.println("Age after birthday = " + age);
    }
}
// OUTPUT:
// Age = 25
// Age after birthday = 26`]
        },
        {
            content: `<h3>Declaring vs Initializing</h3>
<strong>Declaration</strong> tells the compiler "this name exists and this is its type." <strong>Initialization</strong> gives it a starting value. You can do both together, or declare now and initialize later.<br>`,
            codeExamples: [`public class DeclareInit {
    public static void main(String[] args) {
        int score;      // declaration only - no value yet
        score = 100;     // initialization - now it has a value

        double price = 49.99; // declaration + initialization together

        System.out.println("Score: " + score);
        System.out.println("Price: " + price);
    }
}
// OUTPUT:
// Score: 100
// Price: 49.99`]
        },
        {
            content: `<h3>Naming Rules for Variables</h3>
• Must start with a letter, underscore (_), or dollar sign ($) - never a digit. <br>
• Can contain letters, digits, underscores, and dollar signs after the first character. <br>
• Case-sensitive: <code>age</code> and <code>Age</code> are different variables. <br>
• By convention, Java variable names use <strong>camelCase</strong> (e.g. <code>studentName</code>, <code>totalMarks</code>). <br>
• Cannot use reserved keywords like <code>int</code>, <code>class</code>, <code>public</code> as variable names.<br>`,
            codeExamples: [`public class NamingRules {
    public static void main(String[] args) {
        int studentAge = 20;     // valid - camelCase
        String _hidden = "ok";    // valid - starts with underscore
        // int 2ndPlace = 5;      // INVALID - cannot start with a digit
        // int class = 1;         // INVALID - "class" is a reserved keyword

        System.out.println(studentAge + " " + _hidden);
    }
}
// OUTPUT:
// 20 ok`]
        },
        {
            content: `<h3>Variables Can Change - That's the Point</h3>
The word "variable" literally means "able to vary." Unlike a constant, a variable's stored value can be reassigned any number of times during program execution, which is what allows programs to react to input, loop, and compute.<br>`,
            codeExamples: [`public class ChangingValue {
    public static void main(String[] args) {
        int counter = 0;
        counter = counter + 1;
        counter = counter + 1;
        counter = counter + 1;
        System.out.println("Counter is now: " + counter);
    }
}
// OUTPUT:
// Counter is now: 3`]
        },
    ],
    expert: [
        {
            content: `<h3>Categories of Variables in Java</h3>
Java has three kinds of variables, distinguished by where they are declared and how long they live:<br><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Type</th><th>Declared Where</th><th>Lifetime</th><th>Default Value?</th></tr>
<tr class='text-center'><td>Local variable</td><td>Inside a method/block</td><td>Only while the method/block executes</td><td>No - must be initialized before use</td></tr>
<tr class='text-center'><td>Instance variable</td><td>Inside class, outside any method</td><td>As long as the object exists</td><td>Yes - gets a default (0, null, false, etc.)</td></tr>
<tr class='text-center'><td>Static (class) variable</td><td>Inside class, marked <code>static</code></td><td>Entire program run, shared by all objects</td><td>Yes - gets a default</td></tr>
</table>`,
            codeExamples: [`public class VariableKinds {
    static int staticVar = 10;      // static: one copy shared by all objects
    int instanceVar;                 // instance: one copy per object, default 0

    void show() {
        int localVar = 5;            // local: exists only inside this method
        System.out.println("static=" + staticVar + " instance=" + instanceVar + " local=" + localVar);
    }

    public static void main(String[] args) {
        new VariableKinds().show();
        new VariableKinds().show(); // instanceVar resets to 0 for a new object, staticVar is shared
    }
}
// OUTPUT:
// static=10 instance=0 local=5
// static=10 instance=0 local=5`]
        },
        {
            content: `<h3>Variables Are Not Values - They Are References to Storage</h3>
Conceptually a variable binds a <strong>name</strong> to a <strong>memory slot</strong>. For primitives, that slot directly holds the value. For objects, the slot holds a reference (an address) pointing to the object's data on the heap. This distinction explains a lot of confusing behavior for beginners.<br><br>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">int x = 10;              String s = new String("hi");

Stack:                   Stack:            Heap:
+---+                    +-------+         +------+
| x | 10                 |   s   |--------&gt;| "hi" |
+---+                    +-------+         +------+</pre>`,
            codeExamples: [`public class ReferenceVsValue {
    public static void main(String[] args) {
        int a = 5;
        int b = a;   // b gets a COPY of the value 5
        b = 20;
        System.out.println("a=" + a + " b=" + b); // a unaffected

        StringBuilder sb1 = new StringBuilder("hi");
        StringBuilder sb2 = sb1; // sb2 points to the SAME object as sb1
        sb2.append("!");
        System.out.println("sb1=" + sb1 + " sb2=" + sb2); // both changed
    }
}
// OUTPUT:
// a=5 b=20
// sb1=hi! sb2=hi!`]
        },
        {
            content: `<h3>Scope and Shadowing</h3>
A variable's <strong>scope</strong> is the region of code where it can be referenced. Local variables are scoped to the block <code>{ }</code> they are declared in and disappear once that block ends. When an inner scope declares a variable with the same name as an outer one, Java either flags it as a compile error (for local-in-local) or allows "shadowing" (for instance variables hidden by local ones).<br>`,
            codeExamples: [`public class ScopeDemo {
    int value = 100; // instance variable

    void demo() {
        int value = 5; // shadows the instance variable inside this method
        System.out.println("local value = " + value);
        System.out.println("this.value = " + this.value); // access shadowed one explicitly
    }

    public static void main(String[] args) {
        new ScopeDemo().demo();

        for (int i = 0; i < 2; i++) {
            int temp = i * 10; // temp only exists inside this loop block
            System.out.println("temp = " + temp);
        }
        // System.out.println(temp); // COMPILE ERROR: temp is out of scope here
    }
}
// OUTPUT:
// local value = 5
// this.value = 100
// temp = 0
// temp = 10`]
        },
        {
            content: `<h3>final Variables: Write-Once</h3>
Marking a variable <code>final</code> makes it assignable exactly once. This is how Java expresses "constant" at the variable level - useful for values that must never change after being set, and required for local variables captured by lambdas/anonymous classes.<br>`,
            codeExamples: [`public class FinalVariable {
    static final double PI_APPROX = 3.14159; // constant, assigned once at declaration

    public static void main(String[] args) {
        final int limit = 10;
        System.out.println("Limit = " + limit);
        // limit = 20; // COMPILE ERROR: cannot assign a value to final variable limit
        System.out.println("PI_APPROX = " + PI_APPROX);
    }
}
// OUTPUT:
// Limit = 10
// PI_APPROX = 3.14159`]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the difference between a local and an instance variable?</td><td>Local variables live inside a method/block and must be initialized before use; instance variables belong to an object, live as long as the object, and get default values automatically</td></tr>
<tr class='text-center'><td>Do local variables get default values in Java?</td><td>No - the compiler forces you to initialize them before first use, unlike instance/static variables</td></tr>
<tr class='text-center'><td>What happens when you assign one object reference variable to another?</td><td>Both variables end up pointing to the same object on the heap - changes through either reference are visible via both</td></tr>
<tr class='text-center'><td>What is variable shadowing?</td><td>When a variable in an inner scope has the same name as one in an outer scope, hiding the outer one within that inner scope</td></tr>
<tr class='text-center'><td>What does the final keyword do to a variable?</td><td>Makes it assignable only once - any later reassignment is a compile-time error</td></tr>
<tr class='text-center'><td>Can a static variable be accessed without creating an object?</td><td>Yes - it belongs to the class itself, so it can be accessed via ClassName.variableName</td></tr>
<tr class='text-center'><td>Why must a lambda only capture effectively final local variables?</td><td>Because the lambda may outlive the method's stack frame, so Java copies the value at capture time and forbids further reassignment to keep that copy consistent</td></tr>
</table>`
        },
    ],
};
