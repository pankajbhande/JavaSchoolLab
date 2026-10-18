import { Topic } from '../coreJava';

export const annotationsInJava: Topic = {
    id: 'annotations',
    name: 'Annotations in Java',

    beginner: [
        {
            content: `<h4>What is an Annotation?</h4>
<p>An <b>annotation</b> is <b>metadata</b> attached to code - a class, method, field, or parameter - using the <code>@AnnotationName</code> syntax.</p>
<ul>
<li>Annotations do <b>not</b> change what the code does by themselves; the compiler, a tool, or a framework reads them and decides what to do.</li>
<li>They attach extra information that the compiler, runtime or tools can act on, without changing the actual logic.</li>
</ul>`,
            codeExamples: [
                `public class Test {

    @Deprecated
    static void oldMethod() {
        System.out.println("Please stop using me");
    }

    public static void main(String[] args) {
        // No warning here: javac skips deprecation warnings in the same class.
        // Call it from a DIFFERENT class to see the warning.
        oldMethod();
    }
}
// OUTPUT:
// Please stop using me`
            ]
        },
        {
            content: `<h4>@Override - Catching Mistakes at Compile Time</h4>
<p><code>@Override</code> tells the compiler "this method is meant to override a method from the parent class or interface." If it does not override anything (for example, a typo in the method name or signature), the compiler gives an error instead of silently creating a new, unrelated method.</p>`,
            codeExamples: [
                `public class Test {

    static class Animal {
        void makeSound() { System.out.println("Some sound"); }
    }

    static class Dog extends Animal {
        @Override
        void makeSound() { System.out.println("Bark"); }

        // @Override
        // void makeSund() { }   // COMPILE ERROR if uncommented: typo, no override
    }

    public static void main(String[] args) {
        new Dog().makeSound();
    }
}
// OUTPUT:
// Bark`
            ]
        },
        {
            content: `<h4>Other Common Built-in Annotations</h4>
<ul>
<li><code>@Deprecated</code> - marks an element as outdated; using it from another class gives a compiler warning.</li>
<li><code>@SuppressWarnings("...")</code> - hides one category of compiler warning (for example <code>"unchecked"</code>) for that element.</li>
<li><code>@FunctionalInterface</code> - states that an interface has exactly one abstract method; the compiler gives an error if a second one is added.</li>
<li><code>@SafeVarargs</code> - on a final, static or private varargs method, promises that it does nothing unsafe with its generic varargs array, which removes the related warning.</li>
</ul>`,
            codeExamples: [
                `import java.util.ArrayList;
import java.util.List;

public class Test {

    @FunctionalInterface
    interface Greeter {
        String greet(String name);
        // String bye(String name);  // COMPILE ERROR if uncommented: 2nd method
    }

    @SuppressWarnings("unchecked")
    static List<String> unsafeCast(Object obj) {
        return (List<String>) obj; // would normally warn: unchecked cast
    }

    public static void main(String[] args) {
        Greeter g = name -> "Hello, " + name;
        System.out.println(g.greet("Pankaj"));

        List<String> result = unsafeCast(new ArrayList<String>());
        result.add("Java");
        System.out.println(result);
    }
}
// OUTPUT:
// Hello, Pankaj
// [Java]`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Meta-Annotations - Annotations That Describe Annotations</h3>
<p>When you write your own annotation, you configure it with annotations that apply to annotations themselves:</p>
<ul>
<li><code>@Retention</code> - how long the annotation is kept: <code>SOURCE</code> (discarded by the compiler, e.g. <code>@Override</code>), <code>CLASS</code> (kept in the .class file but not visible at run time; the default), or <code>RUNTIME</code> (kept and readable through reflection).</li>
<li><code>@Target</code> - which kinds of elements it can be applied to (<code>TYPE</code>, <code>METHOD</code>, <code>FIELD</code>, <code>PARAMETER</code>, etc.).</li>
<li><code>@Documented</code> - includes the annotation in generated Javadoc.</li>
<li><code>@Inherited</code> - lets a subclass pick up a class-level annotation from its parent class.</li>
<li><code>@Repeatable</code> - allows the same annotation more than once on the same element.</li>
</ul>`,
            codeExamples: [
                `import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Author {
    String name();
    String date() default "unknown";
}

public class Test {

    @Author(name = "Pankaj", date = "2026-01-01")
    public void newFeature() {
        System.out.println("Feature running");
    }

    public static void main(String[] args) {
        new Test().newFeature();
    }
}
// OUTPUT:
// Feature running`
            ]
        },
        {
            content: `<h3>Reading Custom Annotations at Runtime via Reflection</h3>
<p>A <code>RUNTIME</code> annotation can be read back with the Reflection API. This is how frameworks like Spring and JPA find and act on your annotations without wiring code from you.</p>`,
            codeExamples: [
                `import java.lang.annotation.*;
import java.lang.reflect.Method;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Author {
    String name();
}

public class Test {

    static class Service {
        @Author(name = "Pankaj")
        public void run() { }
    }

    public static void main(String[] args) throws Exception {
        Method method = Service.class.getMethod("run");

        if (method.isAnnotationPresent(Author.class)) {
            Author a = method.getAnnotation(Author.class);
            System.out.println("Author: " + a.name());
        }
    }
}
// OUTPUT:
// Author: Pankaj`
            ]
        },
        {
            content: `<h3>Real-World Framework Usage (Why This Matters)</h3>
<p>Annotations are how modern Java frameworks avoid boilerplate configuration:</p>
<ul>
<li><b>Spring</b>: <code>@Component</code>, <code>@Service</code> and <code>@Repository</code> mark a class for Spring to manage as a bean; <code>@Autowired</code> asks Spring to inject a dependency; <code>@RestController</code> and <code>@GetMapping</code> link HTTP routes to methods.</li>
<li><b>JPA/Hibernate</b>: <code>@Entity</code> maps a class to a database table; <code>@Id</code> and <code>@Column</code> map fields to columns.</li>
<li><b>JUnit</b>: <code>@Test</code> marks a method as a test case for the runner to find and execute.</li>
</ul>
<p>In every case, the framework scans your classes at startup using reflection, finds the annotations and builds its behavior around them. The annotation does nothing by itself; the framework that reads it does the work.</p>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Does an annotation change program behavior by itself?</td><td>No - it is pure metadata; only a compiler check, tool, or framework reading it (typically via reflection) decides what to do with it</td></tr>
<tr class='text-center'><td>What are the three RetentionPolicy values?</td><td>SOURCE (compiler-only, e.g. @Override), CLASS (kept in bytecode but not runtime-visible, the default), RUNTIME (readable via reflection)</td></tr>
<tr class='text-center'><td>Why must a framework annotation use RUNTIME retention?</td><td>Because frameworks like Spring/Hibernate read annotations via reflection while the application is running, which requires RUNTIME retention to still be present in the loaded class</td></tr>
<tr class='text-center'><td>What does @Target control?</td><td>Which kinds of program elements (class, method, field, parameter, etc.) the annotation is legal to apply to</td></tr>
<tr class='text-center'><td>What does @FunctionalInterface actually enforce?</td><td>That the interface has exactly one abstract method - the compiler errors if a second one is added, protecting lambda-expression compatibility</td></tr>
<tr class='text-center'><td>How does Spring's @Autowired actually work under the hood?</td><td>Spring scans beans via reflection at startup, finds fields/constructors annotated @Autowired, and injects a matching bean - the annotation just marks intent, Spring's container does the actual wiring</td></tr>
</table>`
        }
    ]
};
