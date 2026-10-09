import { Topic } from '../coreJava';

export const reflectionApiInJava: Topic = {
    id: 'reflection-api',
    name: 'Reflection API',

    beginner: [
        {
            content: `<h4>What is Reflection?</h4>
<b>Reflection</b> is the ability of Java code to <b>inspect and manipulate classes, methods, fields, and constructors at runtime</b> - even ones it did not know about at compile time.
<ul>
<li>Normally, you write <code>obj.method()</code> and the compiler resolves everything ahead of time.</li>
<li>With reflection, you can ask "what methods does this object's class have?" and call one <b>by name, as a String</b>, decided while the program is running.</li>
<li>It exists because frameworks (Spring, Hibernate, JUnit, JSON libraries) need to work with classes they were never compiled against - your application classes.</li>
</ul>`
        },
        {
            content: `<h4>Getting a Class&lt;?&gt; Object - Three Ways</h4>
<p>Every loaded class has exactly one <code>Class</code> object representing it, obtainable in three ways:</p>
<ul>
<li><code>ClassName.class</code> - at compile time, when you know the type.</li>
<li><code>object.getClass()</code> - from an existing instance, at runtime.</li>
<li><code>Class.forName("fully.qualified.Name")</code> - purely from a String, useful when the class name is only known at runtime (e.g. read from a config file).</li>
</ul>`,
            codeExamples: [
                `public class Test {
    public static void main(String[] args) throws ClassNotFoundException {
        Class<String> c1 = String.class;
        System.out.println(c1.getName());

        String s = "hello";
        Class<?> c2 = s.getClass();
        System.out.println(c2.getName());

        Class<?> c3 = Class.forName("java.lang.String");
        System.out.println(c3.getName());

        System.out.println(c1 == c2 && c2 == c3); // all the SAME Class object
    }
}
// OUTPUT:
// java.lang.String
// java.lang.String
// java.lang.String
// true`
            ]
        },
        {
            content: `<h4>Inspecting Fields, Methods, and Constructors</h4>
<p>Once you have a <code>Class</code> object, you can list everything the class declares - names, types, and modifiers - without ever creating an instance.</p>`,
            codeExamples: [
                `import java.lang.reflect.*;

public class Test {

    static class Employee {
        private String name = "Pankaj";
        private int salary = 50000;

        public void work() { System.out.println(name + " is working"); }
        private void secretMethod() { System.out.println("Confidential"); }
    }

    public static void main(String[] args) {
        Class<?> clazz = Employee.class;

        System.out.println("Fields:");
        for (Field f : clazz.getDeclaredFields()) {
            System.out.println(" - " + f.getName() + " : " + f.getType().getSimpleName());
        }

        System.out.println("Methods:");
        for (Method m : clazz.getDeclaredMethods()) {
            System.out.println(" - " + m.getName() + "()");
        }
    }
}
// OUTPUT:
// Fields:
//  - name : String
//  - salary : int
// Methods:
//  - work()
//  - secretMethod()`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Creating Objects and Invoking Methods Dynamically</h3>
<p>Reflection can construct a new instance and call methods on it purely by name - this is how a framework creates classes it has never seen at compile time.</p>`,
            codeExamples: [
                `import java.lang.reflect.*;

public class Test {

    public static class Greeter {
        public String greet(String name) { return "Hello, " + name + "!"; }
    }

    public static void main(String[] args) throws Exception {
        Class<?> clazz = Class.forName("Test$Greeter");

        Constructor<?> ctor = clazz.getDeclaredConstructor();
        Object instance = ctor.newInstance(); // like "new Greeter()", chosen at runtime

        Method greetMethod = clazz.getMethod("greet", String.class);
        Object result = greetMethod.invoke(instance, "Pankaj"); // like instance.greet(..)

        System.out.println(result);
    }
}
// OUTPUT:
// Hello, Pankaj!`
            ]
        },
        {
            content: `<h3>Accessing Private Members with setAccessible(true)</h3>
<p>Reflection can bypass normal access-control checks (private/protected) using <code>setAccessible(true)</code> on a <code>Field</code>, <code>Method</code>, or <code>Constructor</code>. This is powerful but dangerous:</p>
<ul>
<li>It breaks <b>encapsulation</b> - the entire point of marking something private.</li>
<li>It can be blocked by a <code>SecurityManager</code> in restricted environments, or by the module system's strong encapsulation (Java 9+, unless the module explicitly <code>opens</code> the package).</li>
<li>It should be reserved for frameworks and tools, not everyday application code.</li>
</ul>`,
            codeExamples: [
                `import java.lang.reflect.*;

public class Test {

    static class Account {
        private double balance = 1000.0;
    }

    public static void main(String[] args) throws Exception {
        Account acc = new Account();

        Field balanceField = Account.class.getDeclaredField("balance");
        // balanceField.get(acc); // works here: nested classes are nestmates (Java 11+)
        // A caller outside the class nest would get IllegalAccessException.

        balanceField.setAccessible(true); // bypass "private"
        System.out.println("Balance: " + balanceField.get(acc));

        balanceField.set(acc, 2000.0); // even modify a private field directly
        System.out.println("New balance: " + balanceField.get(acc));
    }
}
// OUTPUT:
// Balance: 1000.0
// New balance: 2000.0`
            ]
        },
        {
            content: `<h3>Performance Cost - Why Reflection Isn't the Default</h3>
<p>Reflective calls are slower than direct calls, because the JVM cannot apply the same optimizations (such as inlining) it applies to normal method calls - every reflective invocation goes through extra checks (access control, argument matching) at runtime.</p>
<p>This is why frameworks like Spring and Hibernate do the reflective lookup <b>once</b> (e.g. at startup, caching the resolved <code>Method</code>/<code>Field</code> objects) rather than on every call.</p>`,
            codeExamples: [
                `import java.lang.reflect.Method;

public class Test {

    static int square(int x) { return x * x; }

    public static void main(String[] args) throws Exception {
        int iterations = 1_000_000;

        long directStart = System.nanoTime();
        int result = 0;
        for (int i = 0; i < iterations; i++) result = square(i);
        long directTime = System.nanoTime() - directStart;

        Method m = Test.class.getDeclaredMethod("square", int.class);
        long reflectStart = System.nanoTime();
        for (int i = 0; i < iterations; i++) result = (int) m.invoke(null, i);
        long reflectTime = System.nanoTime() - reflectStart;

        System.out.println("Reflection was slower: " + (reflectTime > directTime));
    }
}
// OUTPUT:
// Reflection was slower: true`
            ]
        },
        {
            content: `<h3>Real-World Usage - Why Frameworks Depend on Reflection</h3>
<ul>
<li><b>Spring</b> uses reflection for dependency injection - scanning classes for <code>@Autowired</code> fields/constructors and injecting matching beans without you writing wiring code.</li>
<li><b>Hibernate/JPA</b> uses reflection to map database rows to your entity objects - reading <code>@Column</code>-annotated fields and setting them, even private ones.</li>
<li><b>JUnit</b> uses reflection to discover and invoke every method annotated <code>@Test</code>, without you registering them manually.</li>
<li><b>JSON libraries</b> (Jackson, Gson) use reflection to convert Java objects to/from JSON by reading and setting fields.</li>
</ul>
<p>The common thread: these tools work on <b>classes they were compiled without knowing about</b> - your application code.</p>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is reflection?</td><td>The ability to inspect and manipulate classes, fields, methods, and constructors at runtime, including ones not known at compile time</td></tr>
<tr class='text-center'><td>Name the three ways to obtain a Class object.</td><td>ClassName.class (compile-time), object.getClass() (from an instance), Class.forName("...") (from a String at runtime)</td></tr>
<tr class='text-center'><td>What does setAccessible(true) do, and why is it risky?</td><td>It bypasses private/protected access checks so reflection can read/write/invoke normally-inaccessible members - it breaks encapsulation and can be blocked by the module system or a SecurityManager</td></tr>
<tr class='text-center'><td>Why is reflection slower than a direct method call?</td><td>Every reflective call goes through extra runtime checks (access control, argument matching) that the JVM can't optimize away the way it does for normal, statically-resolved calls</td></tr>
<tr class='text-center'><td>How does Spring's @Autowired actually inject dependencies?</td><td>Spring scans bean classes via reflection at startup, finds annotated fields/constructors, and uses reflection to set matching bean instances into them</td></tr>
<tr class='text-center'><td>How do frameworks mitigate reflection's performance cost?</td><td>By resolving Method/Field objects once (e.g. at startup) and caching them, instead of re-looking them up on every call</td></tr>
</table>`
        }
    ]
};
