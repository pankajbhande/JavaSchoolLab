import { Topic } from '../coreJava';

export const serializationInJava: Topic = {
                        id: `Serialization in Java`,
                        name: `Serialization in Java`,

                        beginner: [
                            {
                                content: `<h4>What is Serialization?</h4>
<b>Serialization</b> is the process of converting an object's state into a byte stream, so it can be saved to a file, sent over a network, or stored in a database.<br>
<b>Deserialization</b> is the reverse process - reading that byte stream back and reconstructing the original object in memory.<br><br>
Serialization in Java is implemented using <code>ObjectOutputStream</code> (to write) and <code>ObjectInputStream</code> (to read).<br>`
                            },

                            {
                                content: `<h4>How to Implement Serialization</h4>
• A class must implement the <b>Serializable</b> interface to allow its objects to be serialized.<br>
• <code>Serializable</code> is a <b>marker interface</b> - it has no methods to implement. It simply tells the JVM "objects of this class are allowed to be converted into a byte stream."<br>
• <code>ObjectOutputStream</code> is used for serialization (writing the object out).<br>
• <code>ObjectInputStream</code> is used for deserialization (reading the object back in).<br><br>
Below, the <code>Student</code> class implements <code>Serializable</code>: <br>`,
                                codeExamples: [
                                    `import java.io.Serializable;

public class Student implements Serializable {

    private static final long serialVersionUID = 1L;

    String firstname;
    String lastname;
    String city;
}
// A plain data holder - no methods needed to make it serializable,
// just implementing the marker interface is enough.`
                                ]
                            },

                            {
                                content: `<h4>Serializing an Object (Object -> File)</h4>
Create the object, then write it out with <code>ObjectOutputStream.writeObject()</code>.`,
                                codeExamples: [
                                    `import java.io.FileOutputStream;
import java.io.ObjectOutputStream;

public class SerializeStudent {

    public static void main(String[] args) {

        Student s = new Student();
        s.firstname = "Pankaj";
        s.lastname = "Bhande";
        s.city = "Pune";

        try {
            FileOutputStream fos = new FileOutputStream("student.ser");
            ObjectOutputStream oos = new ObjectOutputStream(fos);

            oos.writeObject(s);

            oos.close();
            fos.close();

            System.out.println("Serialization is done...");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
// OUTPUT:
// Serialization is done...`
                                ]
                            },

                            {
                                content: `<h4>Deserializing an Object (File -> Object)</h4>
Read the same file back with <code>ObjectInputStream.readObject()</code> and print the fields to prove the object's state came back intact.`,
                                codeExamples: [
                                    `import java.io.FileInputStream;
import java.io.ObjectInputStream;

public class DeserializeStudent {

    public static void main(String[] args) {

        try {
            FileInputStream fis = new FileInputStream("student.ser");
            ObjectInputStream ois = new ObjectInputStream(fis);

            Student s = (Student) ois.readObject();

            System.out.println(s.firstname);
            System.out.println(s.lastname);
            System.out.println(s.city);

            ois.close();
            fis.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
// OUTPUT:
// Pankaj
// Bhande
// Pune`
                                ]
                            },

                            {
                                content: `<h4>Important Points to Remember</h4>
• <code>ObjectOutputStream</code> and <code>ObjectInputStream</code> are used for serialization and deserialization respectively.<br>
• <b>Static</b> variables are not serialized, because they belong to the class, not to any single object instance.<br>
• If a superclass implements <code>Serializable</code>, all of its subclasses are serializable by default (the marker is inherited).<br>
• Every <code>Serializable</code> class has a version number called <b>serialVersionUID</b>, used to verify compatibility during deserialization.<br>
• Serialization/deserialization is <b>platform-independent</b> - you can serialize an object on one platform and deserialize it on a completely different one, since the byte stream format doesn't depend on the OS or JVM implementation.<br><br>

<h4>Where Is Serialization Used?</h4>
• Storing a list of objects (e.g. Student objects) to disk instead of writing custom parsing logic.<br>
• Sending Java objects as messages between processes (e.g. a chat application, or between JVMs over a network).<br>
• Caching computed objects, or sending them across RMI/distributed calls.<br>`
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>Object -> Byte Stream -> Object</h3>
<code>Serializable</code> is a <strong>marker interface</strong> - it declares no methods. It just tells the JVM "this class is allowed to be converted into a byte stream."<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   Object (in memory)
        |
        | ObjectOutputStream.writeObject()
        v
   Byte Stream  ------->  File / Network / Byte Array
        |
        | ObjectInputStream.readObject()
        v
   Object (reconstructed)</pre>

Below, <code>ByteArrayOutputStream</code>/<code>ByteArrayInputStream</code> are used instead of real files, so the whole round-trip runs safely in memory.<br>`,
                                codeExamples: [
                                    `import java.io.*;

class Student implements Serializable {
    private static final long serialVersionUID = 1L;
    String firstname;
    String lastname;
    Student(String firstname, String lastname) {
        this.firstname = firstname;
        this.lastname = lastname;
    }
}

public class SerializeRoundTrip {
    public static void main(String[] args) throws Exception {
        Student s = new Student("Pankaj", "Bhande");

        // Serialize to an in-memory byte array
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(s);
        }

        // Deserialize back into a new object
        ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
        try (ObjectInputStream ois = new ObjectInputStream(bais)) {
            Student restored = (Student) ois.readObject();
            System.out.println(restored.firstname);
            System.out.println(restored.lastname);
        }
    }
}
// OUTPUT:
// Pankaj
// Bhande`
                                ]
                            },
                            {
                                content: `<h3>serialVersionUID - Version Compatibility</h3>
Every <code>Serializable</code> class has a version number used to verify that the sender and receiver of a serialized object agree on the class structure.<br><br>

<h4>If you don't declare it explicitly</h4>
The serialization runtime (ObjectStreamClass) derives one at (de)serialization time from the class structure - javac never emits a serialVersionUID. This is <strong>fragile</strong>: if you later add/remove a field and recompile, the auto-generated UID changes.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Old serialized object (UID = 1234)
        |
        | class structure changes, no explicit serialVersionUID
        v
New class version (UID = 5678, auto-generated)
        |
        | ois.readObject() on the OLD byte stream
        v
InvalidClassException: local class incompatible</pre>

<strong>Best practice:</strong> always declare <code>private static final long serialVersionUID = 1L;</code> explicitly, and only bump it deliberately when you intentionally break backward compatibility.<br>`
                            },
                            {
                                content: `<h3>transient - Skipping Sensitive/Derived Fields</h3>
A <code>transient</code> field is excluded from serialization entirely. After deserialization, it comes back as its <strong>default value</strong> (null for objects, 0/false for primitives) - not the value it held before serialization.<br>`,
                                codeExamples: [
                                    `import java.io.*;

class User implements Serializable {
    private static final long serialVersionUID = 1L;
    String username;
    transient String password; // never persisted
    User(String username, String password) {
        this.username = username;
        this.password = password;
    }
}

public class TransientDemo {
    public static void main(String[] args) throws Exception {
        User u = new User("pankaj", "SuperSecret123");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(u);
        }

        ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
        try (ObjectInputStream ois = new ObjectInputStream(bais)) {
            User restored = (User) ois.readObject();
            System.out.println(restored.username);
            System.out.println(restored.password); // lost on purpose
        }
    }
}
// OUTPUT:
// pankaj
// null`
                                ]
                            },
                            {
                                content: `<h3>Serialization and Inheritance</h3>
• Static fields are never serialized - they belong to the class, not the object instance.<br>
• If a superclass implements <code>Serializable</code>, every subclass is automatically serializable too.<br>
• If a superclass is <strong>NOT</strong> serializable, its fields are not written out either. During deserialization, only that non-serializable superclass's no-arg constructor runs (via reflection) to initialize its part of the object - so its fields fall back to whatever that constructor sets, not their previous values.<br>`,
                                codeExamples: [
                                    `import java.io.*;

class Vehicle {                 // NOT Serializable
    String type;
    Vehicle() {
        type = "Unknown";       // runs during deserialization too
    }
}

class Car extends Vehicle implements Serializable {
    private static final long serialVersionUID = 1L;
    String model;
    Car(String type, String model) {
        this.type = type;
        this.model = model;
    }
}

public class InheritanceDemo {
    public static void main(String[] args) throws Exception {
        Car c = new Car("Sedan", "Mustang");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(c);
        }

        ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
        try (ObjectInputStream ois = new ObjectInputStream(bais)) {
            Car restored = (Car) ois.readObject();
            System.out.println(restored.model);   // came from Car - preserved
            System.out.println(restored.type);    // came from Vehicle - reset by its constructor
        }
    }
}
// OUTPUT:
// Mustang
// Unknown`
                                ]
                            },
                            {
                                content: `<h3>Serializing Object Graphs</h3>
If a <code>Serializable</code> object holds a reference to another object, that referenced object must <strong>also</strong> implement <code>Serializable</code> - otherwise serialization fails at runtime with <code>NotSerializableException</code>, even though the outer class compiles fine.<br>`,
                                codeExamples: [
                                    `import java.io.*;

class Engine {              // does NOT implement Serializable
    String type = "V8";
}

class Car implements Serializable {
    private static final long serialVersionUID = 1L;
    String model;
    Engine engine;          // reference to a non-serializable class
    Car(String model, Engine engine) {
        this.model = model;
        this.engine = engine;
    }
}

public class ObjectGraphDemo {
    public static void main(String[] args) {
        Car car = new Car("Mustang", new Engine());
        try (ObjectOutputStream oos = new ObjectOutputStream(new ByteArrayOutputStream())) {
            oos.writeObject(car);
        } catch (NotSerializableException e) {
            System.out.println("Failed: " + e.getMessage());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
// OUTPUT:
// Failed: Engine`
                                ]
                            },
                            {
                                content: `<h3>Custom Serialization: writeObject / readObject</h3>
Sometimes the default field-by-field serialization isn't enough - for example, encrypting a value before it's written, or recomputing a derived field after reading. Declaring private <code>writeObject</code>/<code>readObject</code> methods lets a class hook into the process while still using the standard <code>Serializable</code> mechanism.<br>`,
                                codeExamples: [
                                    `import java.io.*;

class Account implements Serializable {
    private static final long serialVersionUID = 1L;
    String owner;
    transient double balance; // package-private so the demo class below can read it; private would not compile from a separate top-level class

    Account(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }

    private void writeObject(ObjectOutputStream oos) throws IOException {
        oos.defaultWriteObject();          // writes non-transient fields (owner)
        oos.writeDouble(balance * 100);    // custom: store balance in cents
    }

    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        ois.defaultReadObject();           // restores owner
        balance = ois.readDouble() / 100;  // custom: convert cents back to balance
    }
}

public class CustomSerializationDemo {
    public static void main(String[] args) throws Exception {
        Account a = new Account("Pankaj", 250.50);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(a);
        }

        ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());
        try (ObjectInputStream ois = new ObjectInputStream(bais)) {
            Account restored = (Account) ois.readObject();
            System.out.println(restored.owner);
            System.out.println(restored.balance);
        }
    }
}
// OUTPUT:
// Pankaj
// 250.5`
                                ]
                            },
                            {
                                content: `<h3>Common Interview Traps</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Claim</th><th>Reality</th></tr>
<tr class='text-center'><td>Static fields get serialized</td><td>No - static fields belong to the class, not the instance, so they're skipped entirely</td></tr>
<tr class='text-center'><td>The constructor runs during deserialization</td><td>No - the object is rebuilt via reflection; only the FIRST non-serializable superclass's no-arg constructor runs</td></tr>
<tr class='text-center'><td>If a superclass is Serializable, subclasses are too</td><td>Yes - Serializable is inherited automatically</td></tr>
<tr class='text-center'><td>transient fields keep their value after deserialization</td><td>No - they reset to the type's default value</td></tr>
</table>
<br>

<h3>Serializable vs Externalizable</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Serializable</th><th>Externalizable</th></tr>
<tr class='text-center'><td>Methods to implement</td><td>None (marker interface)</td><td>writeExternal() / readExternal()</td></tr>
<tr class='text-center'><td>Control over format</td><td>JVM-default, automatic</td><td>Fully manual, you decide exactly what's written</td></tr>
<tr class='text-center'><td>Performance</td><td>Slower (uses reflection)</td><td>Faster (explicit, no reflection overhead)</td></tr>
<tr class='text-center'><td>Public no-arg constructor</td><td>Not required</td><td>Required - called during deserialization</td></tr>
</table>
<br>
<strong>Rule of thumb:</strong> use plain <code>Serializable</code> for everyday DTOs; reach for <code>Externalizable</code> only when you need precise control over the wire format or serialization performance is critical.<br>`
                            },
                            {
                                content: `<div class="bg-secondary p-2 rounded-md">
<h4>Important Interview Questions</h4>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is serialization and deserialization?</td><td>Serialization converts an object's state into a byte stream; deserialization reconstructs the object from that byte stream</td></tr>
<tr class='text-center'><td>Why is Serializable a marker interface?</td><td>It declares no methods - it just flags the class to the JVM as "safe to serialize", relying on reflection to do the actual work</td></tr>
<tr class='text-center'><td>What is the transient keyword used for?</td><td>To exclude a field from serialization; it comes back as the default value (null/0/false) after deserialization</td></tr>
<tr class='text-center'><td>Why aren't static variables serialized?</td><td>They belong to the class itself, not to any individual object instance, so there's no "object state" to save</td></tr>
<tr class='text-center'><td>What is serialVersionUID and why does it matter?</td><td>A version number that verifies the sender and receiver agree on the class structure; a mismatch throws InvalidClassException during deserialization</td></tr>
</table>
</div>`
                            }
                        ]
                    };
