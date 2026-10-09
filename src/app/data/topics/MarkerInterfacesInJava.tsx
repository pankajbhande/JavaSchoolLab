import { Topic } from '../coreJava';

export const markerInterfacesInJava: Topic = {
    id: 'marker-interfaces',
    name: 'Marker Interfaces in Java',

    beginner: [
        {
            content: `<h4>What Is a Marker Interface?</h4>
<p>A <b>marker interface</b> (also called a "tag interface") is an interface with <b>no methods and no fields</b>. It exists only so a class can be <b>tagged</b> with a type.</p>
<ul>
<li>Implementing it adds no behavior directly.</li>
<li>Other code checks <code>instanceof SomeMarker</code> and changes behavior based on the tag.</li>
<li>It attaches metadata to a class through the type system, which was the way before annotations existed.</li>
</ul>`,
            codeExamples: [
                `// A marker interface: completely empty
public interface Auditable {
}

public class Order implements Auditable {
    // implementing Auditable adds no methods to override
}`
            ]
        },
        {
            content: `<h4>Classic Built-in Marker Interfaces</h4>
<ul>
<li><code>java.io.Serializable</code> - the class can be converted to a byte stream.</li>
<li><code>Cloneable</code> - the class allows <code>Object.clone()</code>.</li>
<li><code>java.rmi.Remote</code> - the class can be called across a network via RMI.</li>
</ul>
<p>None of these declare any methods. The JVM and standard library check for them with <code>instanceof</code> before doing the operation.</p>`
        },
        {
            content: `<h4>How the JVM Actually Uses the Tag</h4>
<p>The classic example is serialization. <code>ObjectOutputStream.writeObject()</code> checks <code>instanceof Serializable</code> before it writes an object.</p>`,
            codeExamples: [
                `import java.io.*;

class NotSerializable { int value = 10; }
class IsSerializable implements Serializable { int value = 10; }

public class MarkerDemo {
    public static void main(String[] args) throws IOException {
        ObjectOutputStream out = new ObjectOutputStream(new ByteArrayOutputStream());

        try {
            out.writeObject(new NotSerializable());
        } catch (NotSerializableException e) {
            System.out.println("Failed: " + e.getMessage());
        }

        out.writeObject(new IsSerializable());
        System.out.println("Succeeded: IsSerializable was written fine");
    }
}
// OUTPUT:
// Failed: NotSerializable
// Succeeded: IsSerializable was written fine`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Writing Your Own Marker Interface</h3>
<p>You can define a marker interface for your own checks, for example to tag entities that belong in an audit log.</p>`,
            codeExamples: [
                `interface Auditable { }

class Order implements Auditable {
    String id = "ORD-1";
}
class TempCache { // NOT auditable
    String id = "CACHE-1";
}

public class AuditLogger {
    static void log(Object obj) {
        if (obj instanceof Auditable) {
            System.out.println("Auditing: " + obj.getClass().getSimpleName());
        } else {
            System.out.println("Skipping (not auditable): "
                + obj.getClass().getSimpleName());
        }
    }

    public static void main(String[] args) {
        log(new Order());
        log(new TempCache());
    }
}
// OUTPUT:
// Auditing: Order
// Skipping (not auditable): TempCache`
            ]
        },
        {
            content: `<h3>Marker Interfaces vs Annotations - Which to Use Today</h3>
<p>Since Java 5, annotations (see <b>Annotations in Java</b>) can do the same "tag a type" job. Modern code prefers them for new designs.</p>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Marker Interface</th><th>Annotation</th></tr>
<tr class='text-center'><td>Can carry metadata/values</td><td>No - it's just a type</td><td>Yes - @Retention, custom fields like @Author(name="...")</td></tr>
<tr class='text-center'><td>Checkable via</td><td>instanceof (compile + runtime type check)</td><td>Reflection (isAnnotationPresent, getAnnotation)</td></tr>
<tr class='text-center'><td>Enforced by the compiler</td><td>Yes - it's a real type in the class hierarchy</td><td>No - purely metadata unless a tool/framework enforces it</td></tr>
<tr class='text-center'><td>Can be applied to</td><td>Only classes (via implements)</td><td>Classes, methods, fields, parameters, etc.</td></tr>
<tr class='text-center'><td>Typical modern usage</td><td>Legacy APIs (Serializable, Cloneable) kept for compatibility</td><td>Preferred for new "tag this" designs (Spring's @Component, JPA's @Entity)</td></tr>
</table>
<p>Marker interfaces remain in the JDK because changing <code>Serializable</code> or <code>Cloneable</code> now would break a huge amount of existing code. For new code, an annotation is usually the more flexible choice.</p>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a marker interface?</td><td>An interface with no methods or fields, used purely to tag a class with a type that other code can check via instanceof</td></tr>
<tr class='text-center'><td>Name two built-in marker interfaces.</td><td>Serializable and Cloneable (also Remote for RMI)</td></tr>
<tr class='text-center'><td>How does ObjectOutputStream use Serializable?</td><td>It checks instanceof Serializable before writing an object, throwing NotSerializableException if the check fails</td></tr>
<tr class='text-center'><td>Why are annotations often preferred over marker interfaces today?</td><td>Annotations can carry metadata/values, apply to more than just classes, and don't force implementing a type just to be "tagged"</td></tr>
<tr class='text-center'><td>Does implementing Cloneable give you a working clone() method?</td><td>No - it only enables Object.clone() to succeed without throwing CloneNotSupportedException; you still need to override clone() yourself</td></tr>
</table>`
        }
    ]
};
