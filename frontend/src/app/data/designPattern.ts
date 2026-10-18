// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const designPattern: Course[] = [
    {

        id: 'design-patterns',
        name: 'Design Patterns in Java',
        icon: 'design_patterns_icon.png',
        subTopics: [
            {
                id: 'creational-patterns',
                name: 'Creational Patterns',
                topics: [
                    {
                        id: 'singleton-pattern',
                        name: 'Singleton Pattern',
                        beginner: [
                            {
                                content: `
Singleton Pattern ensures that only <b>one object</b> of a class is created in the entire application.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Database Connection</li>
<li>Printer Spooler</li>
<li>Configuration Manager</li>
</ul>

<h4>Why do we need Singleton?</h4>
<ul>
<li>To save memory</li>
<li>To maintain global access</li>
<li>To control object creation</li>
</ul>

<h4>Basic Rules:</h4>
<ul>
<li>Private constructor</li>
<li>Static instance variable</li>
<li>Public static method to get instance</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public class Singleton {

    // Step 1: Create static instance
    private static Singleton instance;

    // Step 2: Make constructor private
    private Singleton() {
        System.out.println("Singleton Created");
    }

    // Step 3: Public method to access object
    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }

    public static void main(String[] args) {
        Singleton obj1 = Singleton.getInstance();
        Singleton obj2 = Singleton.getInstance();

        System.out.println(obj1.hashCode());
        System.out.println(obj2.hashCode());
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<p>The Singleton Pattern ensures that a class has only one instance and provides a global point of access to it.</p>
<h4>Why?</h4>
`,
                                codeExamples: [`package com.javaschoollab.demo; 
public class SingletonTest { 
private static SingletonTest s; 
private static SingletonTest test() { 
 s = new SingletonTest(); 
 return s; 
 } 
public static void main(String args[]) { 
 System.out.println("one instance=" + SingletonTest.s.test().hashCode()); 
 System.out.println("two instance=" + SingletonTest.s.test().hashCode()); 
 System.out.println("three instance=" + SingletonTest.s.test().hashCode()); 
 } 
} 
`]
                            },
                            {
                                content: `In the above program, we have created the 3 instance of same class but I want to create only 1 instance 
of class then I should go for singleton design pattern. <br><br>
<h4>When? </h4>
If you have business requirement in which only 1 object is created then you should go for singleton 
design pattern.<br><br>

<h4>Steps to create the singleton design pattern as</h4><br>

<div class='bg-secondary border border-primary p-2'>
Step- 1 : Create class singleton and static member of class.<br> 
package com.javaschoollab.demo; <br>
public class Singleton { <br>
private static Singleton singletonobject; <br>
} <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step- 2 : Make constructor as private <br>
package com.javaschoollab.demo; <br>
public class Singleton { <br>
private static Singleton singletonobject; <br>
private singleton(){ <br>
 } <br>
} <br>
 </div><br>

<div class='bg-secondary border border-primary p-2'>
Step- 3 : Create the method for checking the references and use synchronized block instead of 
method. <br>
package com.javaschoollab.demo; <br>
 
public static Singleton getSingletonObject() { <br>
synchronized (Singleton.class) { <br>
 if (singletonobject == null) { <br>
 singletonobject = new Singleton(); <br>
 } else { <br>
 return singletonobject; <br>
 } <br>
 return singletonobject; <br>
 } <br>
} <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step- 4 : We can still able to create the copy of object by cloning it using object clone method. <br>
Override the object clone method to prevent cloning as below. <br>
(If singleton class will implements clonable interface ->class Singleton implements Clonable and 
override object clone method into singleton class) <br>
public static void main(String[] args) throws CloneNotSupportedException { <br>
 Singleton obj1 = Singleton.getSingletonObject(); <br>
 Singleton obj2 = (Singleton) obj1.clone(); <br>
 System.out.println("object 1>>"+obj1.hashCode()); <br>
 System.out.println("object 2>>"+obj2.hashCode()); <br>
} <br>
OUTPUT=object 1>>2018699554 <br>
object 2>>1311053135 <br>
 
This again violates the design principle. We need to override the object clone method which throws <br>
CloneNotSupportedException. <br>
@Override <br>
protected Object clone() throws CloneNotSupportedException { <br>
// TODO Auto-generated method stub<br>
throw new CloneNotSupportedException("Singleton cannot be cloned"); // super.clone() would NOT prevent cloning<br>
} <br>
OUTPUT=object 1>>2018699554 <br>
object 2>>1311053135 <br>
</div><br>
`, codeExamples: [`package com.javaschoollab.demo; 
 
import java.io.Serializable; 
public class Singleton implements Cloneable { 
private static Singleton singletonobject; 
private Singleton() { 
 } 
public static Singleton getSingletonObject() { 
 synchronized (Singleton.class) { 
 if (singletonobject == null) { 
 singletonobject = new Singleton(); 
 } else { 
 return singletonobject; 
 } 
 return singletonobject; 
 } 
 } 
@Override
protected Object clone() throws CloneNotSupportedException { 
 // TODO Auto-generated method stub
 return super.clone(); 
 } 
public static void main(String[] args) throws CloneNotSupportedException { 
 Singleton obj1 = Singleton.getSingletonObject(); 
 Singleton obj2 = (Singleton) obj1.clone(); 
 System.out.println("object 1>>" + obj1.hashCode()); 
 System.out.println("object 2>>" + obj2.hashCode()); 
 } 
}`]
                            },
                            {
                                content: `<h4>Singleton Pattern with Serialization</h4>
        Some times in distributed system, we need to implement serializable interface in singleton class so that 
we can store it state in file system and retrieve it later point. <br>

<div class='bg-secondary border border-primary p-2'>
package com.javaschoollab.demo; <br>
import java.io.Serializable; <br>
public class Singleton implements Cloneable, Serializable { <br>
private static Singleton singletonobject; <br>
private Singleton() { <br>
 } <br>
public static Singleton getSingletonObject() { <br>
 synchronized (Singleton.class) { <br>
 if (singletonobject == null) { <br>
 singletonobject = new Singleton(); <br>
 } else { <br>
 return singletonobject; <br>
 } <br>
 return singletonobject; <br>
 } <br>
 } <br>
@Override<br>
protected Object clone() throws CloneNotSupportedException { <br>
 // TODO Auto-generated method stub<br>
 return super.clone(); <br>
 } <br>
} <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step- 2 : Create class singleton with serialization <br>
package com.javaschoollab.demo; <br>
import java.io.FileInputStream; <br>
import java.io.FileOutputStream; <br>
import java.io.ObjectInput; <br>
import java.io.ObjectInputStream; <br>
import java.io.ObjectOutput; <br>
import java.io.ObjectOutputStream; <br>
import java.io.Serializable; <br>
public class SingletonSerializedTest implements Serializable { <br>

private static final long serialVersionUID = 1L; <br>
public static void main(String[] args) { <br>
 try { <br>
 Singleton instance1 = Singleton.getSingletonObject(); <br>
 ObjectOutput out = new ObjectOutputStream(new FileOutputStream("E:\\test.txt")); <br>
 out.writeObject(instance1); <br>
 out.close(); <br>
 ObjectInput in = new ObjectInputStream(new FileInputStream("E:\\test.txt"));  <br>
 Singleton instance2 = (Singleton) in.readObject();  <br>
 in.close();  <br>
 System.out.println("instance 1>>" + instance1.hashCode());  <br>
 System.out.println("instance 2>>" + instance2.hashCode());  <br>
 } catch (Exception e) {  <br>
 e.printStackTrace();  <br>
 }  <br>
 }  <br>
}  <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step- 3 : Create the input and output for reading and writing the object .  <br>
ObjectOutput out = new ObjectOutputStream(new FileOutputStream("D:\\test.txt"));  <br>
out.writeObject(instance1);  <br>
out.close();  <br>
// deserailize from file to object <br>
ObjectInput in = new ObjectInputStream(new FileInputStream("D:\\test.txt"));  <br>
Singleton instance2 = (Singleton) in.readObject();  <br>
in.close();  <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step- 4 : Run program to check output.  <br>
instance1 hashCode:- 625576447  <br>
instance2 hashCode:- 1494279232  <br> <br>
It is prove that singleton object is not preserved during deserialization. Because both instance have 
different hashcode.  <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step- 5 : To overcome this problem, we need to override the readResolve() method into singleton class.  <br>
protected Object readResolve() {  <br>
return singletonobject;  <br>
}  <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step- 6 : After Running SingletonSerializedTest Program, you will get the output as  <br>
instance1 hashCode:- 625576447  <br>
instance2 hashCode:- 625576447 <br>
</div><br>

`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h4>Thread-Safe Singleton (Double Checked Locking)</h4>
<p>This ensures only one instance is created even in multithreaded environment.</p>
`,
                                codeExamples: [
                                    `public class Singleton {

    private static volatile Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
}`
                                ]
                            },
                            {
                                content: `
<h4>Bill Pugh Singleton Implementation (Best Practice)</h4>
<p>Uses inner static helper class. Thread-safe without synchronized.</p>
`,
                                codeExamples: [
                                    `public class Singleton {

    private Singleton() {}

    private static class Helper {
        private static final Singleton INSTANCE = new Singleton();
    }

    public static Singleton getInstance() {
        return Helper.INSTANCE;
    }
}`
                                ]
                            },
                            {
                                content: `
<h4>Singleton Using Enum (Most Secure Way)</h4>
<p>
✔ Prevents reflection attack<br>
✔ Prevents serialization issue<br>
✔ Prevents cloning issue<br>
✔ Thread-safe by default
</p>
`,
                                codeExamples: [
                                    `public enum Singleton {

    INSTANCE;

    public void showMessage() {
        System.out.println("Singleton using Enum");
    }

    public static void main(String[] args) {
        Singleton obj1 = Singleton.INSTANCE;
        Singleton obj2 = Singleton.INSTANCE;

        System.out.println(obj1.hashCode());
        System.out.println(obj2.hashCode());
    }
}`
                                ]
                            },
                            {
                                content: `
<h4>Common Singleton Issues & Solutions</h4>

<ul>
<li><b>Reflection:</b> Can break singleton → Use enum</li>
<li><b>Serialization:</b> Use readResolve()</li>
<li><b>Cloning:</b> Override clone() method</li>
<li><b>Multithreading:</b> Use Double Checked Locking or Bill Pugh</li>
</ul>

<h4>When NOT to use Singleton?</h4>
<ul>
<li>When dependency injection is better</li>
<li>When class has state changes frequently</li>
<li>When testing requires multiple instances</li>
</ul>
`
                            }
                        ]

                    },


                    {
                        id: 'factory design pattern ',
                        name: 'Factory Design Pattern ',

                        beginner: [
                            {
                                content: `
Factory Design Pattern is used to create objects <b>without exposing object creation logic</b> to the client.</p>

<h4>Simple Meaning:</h4>
<p>
Instead of using <code>new</code> keyword everywhere,
we create objects using a <b>Factory class</b>.
</p><br>

<h4>Why Factory Pattern?</h4>
<ul>
<li>Removes tight coupling</li>
<li>Centralizes object creation</li>
<li>Makes code cleaner</li>
</ul><br>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create Interface</li>
<li>Step 2: Create Concrete Classes</li>
<li>Step 3: Create Factory Class</li>
<li>Step 4: Call Factory from Client</li>
</ul><br>

<h4>Real Life Example:</h4>
<p>Shape Factory → Circle, Rectangle, Square</p>
`,
                                codeExamples: [
                                    `// Step 1: Create Interface
interface Shape {
    void draw();
}

// Step 2: Create Concrete Classes
class Circle implements Shape {
    public void draw() {
        System.out.println("Drawing Circle");
    }
}

class Rectangle implements Shape {
    public void draw() {
        System.out.println("Drawing Rectangle");
    }
}

// Step 3: Create Factory
class ShapeFactory {
    public static Shape getShape(String type) {
        if(type.equalsIgnoreCase("circle")) {
            return new Circle();
        } else if(type.equalsIgnoreCase("rectangle")) {
            return new Rectangle();
        }
        throw new IllegalArgumentException("Invalid Shape");
    }
}

// Step 4: Client Code
public class Test {
    public static void main(String[] args) {
        Shape shape = ShapeFactory.getShape("circle");
        shape.draw();
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `Design the factory method in which multiple objects are stored called as Factory Design Pattern. <br>

• The Factory Design Pattern is a Creational Pattern that provides an interface for creating 
objects but allows subclasses or methods to decide which class to instantiate. <br>

• It promotes loose coupling by removing the need to bind application-specific classes into code.<br><br>

<h4>  Key Points  </h4>
• Encapsulates Object Creation → Centralized place for creating objects. <br>
• Loose Coupling → Client code doesn’t know which class it gets, only the interface. <br>
• Promotes Reusability & Flexibility → Easy to add new product types. <br>
• Return Common Interface / Superclass → Factory method returns a parent type. <br>
• Real-Life Example → IRCTC Website. <br><br>

<h4> Advantages </h4>
• Centralized object creation. <br>
• Reduces tight coupling. <br>
• Makes code more maintainable & scalable. <br><br>

<h4>Disadvantages </h4>
• Adds extra classes (slightly more complexity). <br>
• Sometimes makes debugging harder due to indirect instantiation. <br><br>

<h4>Why? </h4>
• Sometime our application or frameworks don’t know what kind of object has to create at run time. <br>
It only knows when it has to create. <br>
• Another issue is that class will contain object of another classes, this can be easily achieved by just 
using the new keyword and the class constructor. The problem with this approach is that it is very 
hard coded approach to create the object as this creates dependency between two classes. <br>

To overcome this above situation, we should go for factory pattern. <br><br>

<h4>When? </h4>
When user wants the specific object at run time.<br><br>

<h4>Example </h4>
Suppose we have requirement to book AC ticket for First tier, second tier and Third tier. <br>
Step 1: Create the interface Booking. <br>
Step 2: Create the concreate class First tier will implement the same interface. <br>
Step 3: Create the concreate class Second tier will implement the same interface. <br>
Step 4: Create the concreate class Third tier will implement the same interface. <br>
Step 5: Create class BookingFactory to generate the object of concreate class. <br>
Step 6: Create the factory class to get the object of concreate class by passing the data. <br><br>


<div class='bg-secondary border border-primary p-2'>
Step 1: Create the interface Booking <br>
package com.javaschoollab.demo; <br>
public interface Booking { // Step: 01<br>
public String getACClass(); <br>
} <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step 2: Create the concreate class First tier will implement the same interface <br>
package com.javaschoollab.demo; <br>
public class FirstTier implements Booking { <br>
@Override<br>
public String getACClass() { <br>
 return "first class-AC- Seat availability:10"; <br>
 } <br>
} <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step 3: Create the concreate class Second tier will implement the same interface <br>
package com.javaschoollab.demo; <br>
public class SecondTier implements Booking { <br>
@Override<br>
public String getACClass() { <br>
 return "Second class- AC- Seat availability:8"; <br>
 } <br>
} <br>
</div> <br>

<div class='bg-secondary border border-primary p-2'>
Step 4: Create the concreate class Third tier will implement the same interface  <br>
package com.javaschoollab.demo;  <br>
public class ThirdTier implements Booking {  <br>
@Override <br>
public String getACClass() {  <br>
 return "Third class-AC Seat availability:2";  <br>
 }  <br>
}  <br>
</div> <br>

<div class='bg-secondary border border-primary p-2'>
Step 5: Create class BookingFactory to generate the object of concreate class. <br>
package com.javaschoollab.demo; <br>
 
public class BookingFactory { <br>
// Design the factory method here<br>
// We Takes input should be first, second, third<br>
public static Booking createBooking(String input) { <br>
 if (input.equalsIgnoreCase("first")) { <br>
 return new FirstTier(); <br>
 } else if (input.equalsIgnoreCase("second")) { <br>
 return new SecondTier(); <br>
 } else if (input.equalsIgnoreCase("third")) { <br>
 return new ThirdTier(); <br>
 } <br>
 throw new IllegalArgumentException("Invalid input from user.."); <br>
 } <br>
} <br>
</div><br>

<div class='bg-secondary border border-primary p-2'>
Step 6: Create the factory class to get the object of concreate class by passing the data.<br>
package com.javaschoollab.demo; <br>
 
import java.util.Scanner; <br>
public class TestMain { <br>
public static void main(String[] args) { <br>
 try { <br>
 String booking; <br>
 System.out.println("Enter the AC class type>>"); <br>
 Scanner scanner = new Scanner(System.in); <br>
 booking = scanner.next(); <br>
 Booking b = BookingFactory.createBooking(booking); <br>
 System.out.println(b.getACClass()); <br>
 scanner.close(); <br>
 } catch (Exception e) { <br>
 e.printStackTrace(); <br>
 } <br>
 } <br>
} <br><br>
OUTPUT <br>
Enter the AC class type>> <br>
first<br>
first class-AC- Seat availability:10 <br>
</div>
`
                            }
                        ],

                        expert: [
                            {
                                content: `<h4>Problem in Simple Factory</h4>
<p>
Using multiple <code>if-else</code> blocks violates 
<b>Open Closed Principle (OCP)</b>.
Every new type requires modifying factory class.
</p>

<h4>Solution: Use Polymorphism (Factory Method Pattern)</h4>
`,
                                codeExamples: [
                                    `// Product Interface
interface Notification {
    void send();
}

// Concrete Products
class EmailNotification implements Notification {
    public void send() {
        System.out.println("Sending Email");
    }
}

class SMSNotification implements Notification {
    public void send() {
        System.out.println("Sending SMS");
    }
}

// Abstract Creator
abstract class NotificationFactory {
    public abstract Notification createNotification();
}

// Concrete Creators
class EmailFactory extends NotificationFactory {
    public Notification createNotification() {
        return new EmailNotification();
    }
}

class SMSFactory extends NotificationFactory {
    public Notification createNotification() {
        return new SMSNotification();
    }
}

// Client
public class Test {
    public static void main(String[] args) {
        NotificationFactory factory = new EmailFactory();
        Notification notification = factory.createNotification();
        notification.send();
    }
}`
                                ]
                            },
                            {
                                content: `
<h4>Factory Using Enum (Cleaner Approach)</h4>
<p>
Removes if-else and improves readability.
</p>
`,
                                codeExamples: [
                                    `enum ShapeType {
    CIRCLE, RECTANGLE
}

class ShapeFactory {
    public static Shape getShape(ShapeType type) {
        switch(type) {
            case CIRCLE:
                return new Circle();
            case RECTANGLE:
                return new Rectangle();
            default:
                throw new IllegalArgumentException("Invalid type");
        }
    }
}`
                                ]
                            },
                            {
                                content: `
<h4>Factory Pattern in Frameworks</h4>

<ul>
<li>Spring → BeanFactory</li>
<li>Hibernate → SessionFactory</li>
<li>Java → Calendar.getInstance()</li>
<li>JDBC → DriverManager.getConnection()</li>
</ul>

<h4>When NOT to Use Factory?</h4>
<ul>
<li>When object creation is simple</li>
<li>When only one implementation exists</li>
</ul>

<h4>Factory vs Abstract Factory</h4>
<ul>
<li>Factory → Creates one product</li>
<li>Abstract Factory → Creates families of related products</li>
</ul>
`
                            },

                            {
                                content: `
<h3>Factory Pattern with Dependency Injection (Spring Example)</h3>

<p>
Modern applications rarely use manual factories. 
Instead, frameworks like <b>Spring</b> internally use Factory pattern
with Dependency Injection.
</p>

<h4>How Spring Uses Factory?</h4>
<ul>
<li>BeanFactory</li>
<li>ApplicationContext</li>
<li>@Bean annotated methods</li>
</ul>

<p>
Spring container decides which object to create at runtime.
Client only depends on interface.
</p>
`,
                                codeExamples: [
                                    `// Service Interface
public interface PaymentService {
    void pay();
}

// Implementations
@Component
public class CreditCardPayment implements PaymentService {
    public void pay() {
        System.out.println("Paid using Credit Card");
    }
}

@Component
public class UpiPayment implements PaymentService {
    public void pay() {
        System.out.println("Paid using UPI");
    }
}

// Spring automatically works like a factory
@Autowired
private PaymentService paymentService;`
                                ]
                            },
                            {
                                content: `
<h3>Factory with Reflection (Dynamic Object Creation)</h3>

<p>
Instead of using if-else or switch,
we can dynamically create objects using Reflection.
This makes factory fully dynamic.
</p>

<h4>⚠️ Used in Frameworks & Libraries</h4>
`,
                                codeExamples: [
                                    `public class DynamicFactory {

    public static Object createInstance(String className) {
        try {
            Class<?> clazz = Class.forName(className);
            return clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) {
        Object obj = createInstance("com.javaschoollab.demo.Circle");
        System.out.println(obj.getClass().getName());
    }
}`
                                ]
                            },
                            {
                                content: `
<h3>Factory with Registry Pattern</h3>

<p>
Instead of modifying factory every time,
we can register objects in Map.
This follows Open Closed Principle properly.
</p>

<h4>Best for Scalable Systems</h4>
`,
                                codeExamples: [
                                    `import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

class ShapeFactory {

    private static final Map<String, Supplier<Shape>> registry = new HashMap<>();

    static {
        registry.put("circle", Circle::new);
        registry.put("rectangle", Rectangle::new);
    }

    public static Shape getShape(String type) {
        Supplier<Shape> shape = registry.get(type.toLowerCase());
        if (shape != null) {
            return shape.get();
        }
        throw new IllegalArgumentException("Invalid shape type");
    }
}`
                                ]
                            },
                            {
                                content: `
<h3>Thread-Safe Factory</h3>

<p>
If factory manages shared resources,
it must be thread-safe.
</p>

<h4>Example:</h4>
`,
                                codeExamples: [
                                    `public class ConnectionFactory {

    private static volatile Connection connection;

    public static Connection getConnection() {
        if (connection == null) {
            synchronized (ConnectionFactory.class) {
                if (connection == null) {
                    connection = createConnection();
                }
            }
        }
        return connection;
    }

    private static Connection createConnection() {
        // DB logic
        return null;
    }
}`
                                ]
                            },
                            {
                                content: `
<h3>Factory Pattern + SOLID Principles</h3>

<h4>How Factory Supports SOLID:</h4>
<ul>
<li><b>S - Single Responsibility</b> → Object creation separated</li>
<li><b>O - Open Closed</b> → Add new product without modifying client</li>
<li><b>L - Liskov Substitution</b> → Subtypes replace parent type</li>
<li><b>D - Dependency Inversion</b> → Depend on abstraction</li>
</ul>

<h4>Common Mistakes</h4>
<ul>
<li>Putting business logic inside factory</li>
<li>Using too many if-else blocks</li>
<li>Violating OCP</li>
<li>Creating God Factory class</li>
</ul>
`
                            },
                            {
                                content: `
<h3>Real Industry Use Cases</h3>

<ul>
<li>JDBC DriverManager → Returns driver implementation</li>
<li>Calendar.getInstance()</li>
<li>LoggerFactory in SLF4J</li>
<li>Spring BeanFactory</li>
<li>Hibernate SessionFactory</li>
<li>Microservices → Strategy selection based on config</li>
</ul>

<h4>Performance Consideration</h4>
<ul>
<li>Factory adds slight abstraction overhead</li>
<li>Reflection-based factory is slower</li>
<li>Best approach → Registry or Dependency Injection</li>
</ul>
`
                            },
                            {
                                content: `
<h3>Factory vs Factory Method vs Abstract Factory</h3>


<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Type</th>
<th>Creates</th>
<th>Complexity</th>
</tr>
<tr>
<td>Simple Factory</td>
<td>One type of object</td>
<td>Low</td>
</tr>
<tr>
<td>Factory Method</td>
<td>Delegates creation to subclasses</td>
<td>Medium</td>
</tr>
<tr>
<td>Abstract Factory</td>
<td>Family of related objects</td>
<td>High</td>
</tr>
</table><br>

<p>
Factory Method is a step towards Abstract Factory.
</p>
`
                            }

                        ]
                    },

                    {
                        id: 'abstract-factory-pattern',
                        name: 'Abstract Factory Pattern',
                        beginner: [
                            {
                                content: `
Abstract Factory Pattern provides an interface for creating <b>families of related objects</b> without specifying their concrete classes - it's essentially a "factory of factories".</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A cross-platform UI toolkit that produces matching Button + Checkbox + ScrollBar for Windows OR macOS</li>
<li>A vehicle factory producing matching Engine + Tyres + Body for a Car OR a Bike</li>
</ul>

<h4>Why do we need Abstract Factory?</h4>
<ul>
<li>To ensure a group of related products are used together consistently (you never accidentally mix a Windows Button with a Mac Checkbox)</li>
<li>To keep client code independent of concrete product classes</li>
<li>To make swapping an entire "family" of products a one-line change</li>
</ul>

<h4>Factory Method vs Abstract Factory:</h4>
<ul>
<li>Factory Method creates ONE product via a single overridable method</li>
<li>Abstract Factory creates a FAMILY of related products via multiple methods on one factory interface</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Product interfaces
interface Button { void render(); }
interface Checkbox { void render(); }

// Windows family
class WindowsButton implements Button {
    public void render() { System.out.println("Rendering a Windows-style button"); }
}
class WindowsCheckbox implements Checkbox {
    public void render() { System.out.println("Rendering a Windows-style checkbox"); }
}

// Mac family
class MacButton implements Button {
    public void render() { System.out.println("Rendering a Mac-style button"); }
}
class MacCheckbox implements Checkbox {
    public void render() { System.out.println("Rendering a Mac-style checkbox"); }
}

// Abstract Factory - declares creation methods for the WHOLE family
interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class WindowsFactory implements UIFactory {
    public Button createButton() { return new WindowsButton(); }
    public Checkbox createCheckbox() { return new WindowsCheckbox(); }
}

class MacFactory implements UIFactory {
    public Button createButton() { return new MacButton(); }
    public Checkbox createCheckbox() { return new MacCheckbox(); }
}

public class AbstractFactoryDemo {
    public static void main(String[] args) {
        // Swapping the whole UI family is a single line change
        UIFactory factory = new MacFactory();

        Button button = factory.createButton();
        Checkbox checkbox = factory.createCheckbox();

        button.render();
        checkbox.render();
    }
}
// OUTPUT:
// Rendering a Mac-style button
// Rendering a Mac-style checkbox`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'builder-pattern',
                        name: 'Builder Pattern',
                        beginner: [
                            {
                                content: `
Builder Pattern constructs a <b>complex object step by step</b>, separating the construction process from the final representation - avoiding constructors with a huge number of parameters ("telescoping constructors").</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Building a House (foundation, walls, roof, paint - each step optional/configurable)</li>
<li>Building a Meal order (burger, with/without cheese, with/without fries, drink size)</li>
<li>Java's own <code>StringBuilder</code> and <code>StringBuffer</code></li>
</ul>

<h4>Why do we need Builder?</h4>
<ul>
<li>To avoid constructors with 6, 8, 10+ parameters that are impossible to read at the call site</li>
<li>To make optional parameters truly optional, instead of forcing null placeholders</li>
<li>To make the object immutable once built</li>
<li>To read fluently: <code>new Pizza.Builder().size(12).cheese(true).build()</code></li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

public class Pizza {
    // All fields final - object is immutable once built
    private final int size;
    private final boolean cheese;
    private final boolean pepperoni;
    private final boolean mushrooms;

    private Pizza(Builder builder) {
        this.size = builder.size;
        this.cheese = builder.cheese;
        this.pepperoni = builder.pepperoni;
        this.mushrooms = builder.mushrooms;
    }

    @Override
    public String toString() {
        return "Pizza{size=" + size + ", cheese=" + cheese
                + ", pepperoni=" + pepperoni + ", mushrooms=" + mushrooms + "}";
    }

    // Static nested Builder class
    public static class Builder {
        private final int size; // required
        private boolean cheese = false;     // optional, sensible default
        private boolean pepperoni = false;  // optional
        private boolean mushrooms = false;  // optional

        public Builder(int size) {
            this.size = size; // required field passed to the builder's constructor
        }

        public Builder cheese(boolean value) { this.cheese = value; return this; }         // fluent chaining
        public Builder pepperoni(boolean value) { this.pepperoni = value; return this; }
        public Builder mushrooms(boolean value) { this.mushrooms = value; return this; }

        public Pizza build() {
            return new Pizza(this);
        }
    }

    public static void main(String[] args) {
        Pizza pizza = new Pizza.Builder(12)
                .cheese(true)
                .mushrooms(true)
                .build(); // pepperoni left at its default (false)

        System.out.println(pizza);
    }
}
// OUTPUT: Pizza{size=12, cheese=true, pepperoni=false, mushrooms=true}`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'prototype-pattern',
                        name: 'Prototype Pattern',
                        beginner: [
                            {
                                content: `
Prototype Pattern creates new objects by <b>copying (cloning) an existing object</b> instead of building it from scratch - useful when object creation is expensive (heavy DB call, complex computation) but a near-identical copy is cheap.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Photocopying a document instead of retyping it</li>
<li>Cloning a fully-configured game character/enemy template to spawn new instances</li>
<li>Java's own <code>Object.clone()</code> and the <code>Cloneable</code> interface</li>
</ul>

<h4>Why do we need Prototype?</h4>
<ul>
<li>To avoid re-running expensive initialization logic for every new object</li>
<li>To create objects without depending on their concrete class (works via an interface reference)</li>
<li>To easily produce variations of a "base" configured object</li>
</ul>

<h4>Shallow vs Deep Clone:</h4>
<ul>
<li>Shallow clone copies primitive fields directly but COPIES THE REFERENCE for object fields - both the original and the clone point to the SAME nested object</li>
<li>Deep clone recursively clones nested objects too, so the clone is fully independent</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

class Sheep implements Cloneable {
    private String name;
    private int age;

    public Sheep(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public Sheep clone() {
        try {
            return (Sheep) super.clone(); // shallow clone - fine here since fields are primitives/String
        } catch (CloneNotSupportedException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public String toString() {
        return name + " (age " + age + ")";
    }

    public static void main(String[] args) {
        Sheep dolly = new Sheep("Dolly", 1);

        // Clone instead of re-running expensive setup logic
        Sheep clone1 = dolly.clone();
        Sheep clone2 = dolly.clone();

        System.out.println(dolly);
        System.out.println(clone1);
        System.out.println(clone2);
        System.out.println("dolly == clone1 ? " + (dolly == clone1)); // false - different objects
    }
}
// OUTPUT:
// Dolly (age 1)
// Dolly (age 1)
// Dolly (age 1)
// dolly == clone1 ? false`
                                ]
                            }
                        ]
                    }
                ]
            },

            {
                id: 'structural-patterns',
                name: 'Structural Patterns',
                topics: [
                    {
                        id: 'adapter-pattern',
                        name: 'Adapter Pattern',
                        beginner: [
                            {
                                content: `
Adapter Pattern lets two <b>incompatible interfaces work together</b> by wrapping one of them in an object (the adapter) that translates calls between them.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A travel plug adapter that lets a US plug fit into an Indian socket</li>
<li>A memory card reader that lets an SD card connect to a USB port</li>
<li>Java's own <code>Arrays.asList()</code> adapting an array to the <code>List</code> interface</li>
</ul>

<h4>Why do we need Adapter?</h4>
<ul>
<li>To reuse existing/legacy code that has an incompatible interface, without modifying it</li>
<li>To let two independently-developed classes collaborate</li>
<li>To integrate a third-party library's class into your own interface</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Existing (legacy) class with an incompatible interface - we can't/won't modify it
class LegacyPrinter {
    public void printOldFormat(String text) {
        System.out.println("[Legacy] " + text);
    }
}

// Target interface our client code expects
interface ModernPrinter {
    void print(String text);
}

// Adapter - translates ModernPrinter calls into LegacyPrinter calls
class PrinterAdapter implements ModernPrinter {
    private LegacyPrinter legacyPrinter;

    public PrinterAdapter(LegacyPrinter legacyPrinter) {
        this.legacyPrinter = legacyPrinter;
    }

    @Override
    public void print(String text) {
        legacyPrinter.printOldFormat(text); // delegates to the incompatible legacy method
    }
}

public class AdapterDemo {
    public static void main(String[] args) {
        ModernPrinter printer = new PrinterAdapter(new LegacyPrinter());
        printer.print("Hello via Adapter"); // client only ever talks to ModernPrinter
    }
}
// OUTPUT: [Legacy] Hello via Adapter`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'decorator-pattern',
                        name: 'Decorator Pattern',
                        beginner: [
                            {
                                content: `
Decorator Pattern attaches <b>additional responsibilities to an object dynamically</b>, by wrapping it in decorator objects - a flexible alternative to subclassing for extending behavior.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Coffee shop: base Coffee, then wrap it with Milk, then Sugar, then Whipped Cream - each adds cost/description</li>
<li>Java's own <code>BufferedReader(new FileReader(...))</code> and <code>InputStreamReader</code> chains</li>
</ul>

<h4>Why do we need Decorator?</h4>
<ul>
<li>To add behavior to individual objects at RUNTIME, without affecting other instances of the same class</li>
<li>To avoid an explosion of subclasses for every combination of features (e.g. MilkSugarCoffee, SugarCreamCoffee, ...)</li>
<li>To keep each responsibility in its own small class (Single Responsibility Principle)</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Component interface
interface Coffee {
    String getDescription();
    double getCost();
}

// Concrete component - the base object being decorated
class SimpleCoffee implements Coffee {
    public String getDescription() { return "Coffee"; }
    public double getCost() { return 50.0; }
}

// Base decorator - wraps a Coffee and implements the same interface
abstract class CoffeeDecorator implements Coffee {
    protected Coffee decoratedCoffee;
    public CoffeeDecorator(Coffee coffee) { this.decoratedCoffee = coffee; }
}

// Concrete decorators - each adds its own behavior, then delegates to the wrapped object
class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) { super(coffee); }
    public String getDescription() { return decoratedCoffee.getDescription() + " + Milk"; }
    public double getCost() { return decoratedCoffee.getCost() + 10.0; }
}

class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) { super(coffee); }
    public String getDescription() { return decoratedCoffee.getDescription() + " + Sugar"; }
    public double getCost() { return decoratedCoffee.getCost() + 5.0; }
}

public class DecoratorDemo {
    public static void main(String[] args) {
        Coffee order = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
        // Wrapping order: SimpleCoffee -> Milk -> Sugar

        System.out.println(order.getDescription() + " = Rs. " + order.getCost());
    }
}
// OUTPUT: Coffee + Milk + Sugar = Rs. 65.0`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'facade-pattern',
                        name: 'Facade Pattern',
                        beginner: [
                            {
                                content: `
Facade Pattern provides a <b>single, simplified interface</b> in front of a complex subsystem made up of many interacting classes - the client talks only to the facade.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A car's ignition button - one press ("start") hides fuel injection, spark plugs, starter motor, battery checks</li>
<li>A hotel "concierge" who coordinates room service, laundry, and cab booking behind one request</li>
</ul>

<h4>Why do we need Facade?</h4>
<ul>
<li>To hide the complexity of a subsystem with many classes behind one easy-to-use entry point</li>
<li>To reduce coupling between client code and a subsystem's internal classes</li>
<li>To provide a simpler, higher-level API without removing access to the underlying subsystem for advanced use cases</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Complex subsystem classes - client should NOT need to know about all of these
class CPU {
    void freeze() { System.out.println("CPU: freezing"); }
    void jump(long position) { System.out.println("CPU: jumping to " + position); }
    void execute() { System.out.println("CPU: executing"); }
}
class Memory {
    void load(long position, byte[] data) { System.out.println("Memory: loading data at " + position); }
}
class HardDrive {
    byte[] read(long lba, int size) {
        System.out.println("HardDrive: reading boot sector");
        return new byte[size];
    }
}

// Facade - one simple method hides the whole subsystem's coordination logic
class ComputerFacade {
    private CPU cpu = new CPU();
    private Memory memory = new Memory();
    private HardDrive hardDrive = new HardDrive();

    public void start() {
        cpu.freeze();
        memory.load(0, hardDrive.read(0, 1024));
        cpu.jump(0);
        cpu.execute();
    }
}

public class FacadeDemo {
    public static void main(String[] args) {
        ComputerFacade computer = new ComputerFacade();
        computer.start(); // client calls ONE method instead of coordinating CPU/Memory/HardDrive itself
    }
}
// OUTPUT:
// CPU: freezing
// HardDrive: reading boot sector
// Memory: loading data at 0
// CPU: jumping to 0
// CPU: executing`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'proxy-pattern',
                        name: 'Proxy Pattern',
                        beginner: [
                            {
                                content: `
Proxy Pattern provides a <b>placeholder/surrogate object</b> that controls access to another (often expensive or remote) object - the proxy implements the same interface, so the client can't tell the difference.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A credit card is a proxy for your bank account - it controls and checks access before money moves</li>
<li>A security guard checking ID before letting someone into a building (access control proxy)</li>
<li>Lazy-loading a huge image - a lightweight proxy stands in until the real image is actually needed</li>
</ul>

<h4>Why do we need Proxy?</h4>
<ul>
<li><strong>Lazy initialization (Virtual Proxy):</strong> delay creating an expensive object until it's actually used</li>
<li><strong>Access control (Protection Proxy):</strong> check permissions before delegating to the real object</li>
<li><strong>Logging/Caching:</strong> add cross-cutting behavior around calls without changing the real object</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Common interface implemented by both the real object and its proxy
interface Image {
    void display();
}

// Real (expensive) object
class RealImage implements Image {
    private String filename;

    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk(); // expensive - simulate a slow disk read
    }

    private void loadFromDisk() {
        System.out.println("Loading " + filename + " from disk...");
    }

    public void display() {
        System.out.println("Displaying " + filename);
    }
}

// Proxy - defers creating the expensive RealImage until display() is actually called
class ProxyImage implements Image {
    private RealImage realImage;
    private String filename;

    public ProxyImage(String filename) {
        this.filename = filename; // cheap - no disk load yet
    }

    public void display() {
        if (realImage == null) {
            realImage = new RealImage(filename); // loaded only on first use
        }
        realImage.display();
    }
}

public class ProxyDemo {
    public static void main(String[] args) {
        Image image = new ProxyImage("photo.png"); // no disk load happens here
        System.out.println("Image object created, but not loaded yet.");

        image.display(); // NOW it loads from disk
        image.display(); // second call reuses the already-loaded RealImage
    }
}
// OUTPUT:
// Image object created, but not loaded yet.
// Loading photo.png from disk...
// Displaying photo.png
// Displaying photo.png`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'bridge-pattern',
                        name: 'Bridge Pattern',
                        beginner: [
                            {
                                content: `
The Bridge Pattern <b>decouples an abstraction from its implementation</b> so the two can vary independently - instead of one growing inheritance tree, you split it into two smaller, separately-extensible hierarchies connected by composition.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A TV remote (abstraction) working with different TV brands (implementation) - the remote's buttons stay the same regardless of which brand it controls</li>
<li>A universal charger (abstraction) working with different phone brands' charging circuits</li>
<li>A payment app (abstraction) working with different payment gateway implementations</li>
</ul>

<h4>Why do we need Bridge?</h4>
<ul>
<li>When a class varies along <strong>two independent dimensions</strong> (e.g. shape type AND color), plain inheritance forces a subclass per combination (RedCircle, GreenCircle, RedSquare, GreenSquare...) - this explodes quickly</li>
<li>Bridge splits the two dimensions into separate hierarchies joined by a reference, so either side can grow without touching the other</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Implementation hierarchy - "how" the work actually gets done
interface Device {
    void turnOn();
    void turnOff();
}

class TV implements Device {
    public void turnOn()  { System.out.println("TV is now ON"); }
    public void turnOff() { System.out.println("TV is now OFF"); }
}

class Radio implements Device {
    public void turnOn()  { System.out.println("Radio is now ON"); }
    public void turnOff() { System.out.println("Radio is now OFF"); }
}

// Abstraction hierarchy - "what" the client asks for
abstract class RemoteControl {
    protected Device device; // the bridge - a reference, not inheritance

    public RemoteControl(Device device) {
        this.device = device;
    }

    abstract void power();
}

class BasicRemote extends RemoteControl {
    private boolean on = false;

    public BasicRemote(Device device) {
        super(device);
    }

    void power() {
        if (on) { device.turnOff(); } else { device.turnOn(); }
        on = !on;
    }
}

public class BridgeDemo {
    public static void main(String[] args) {
        RemoteControl tvRemote = new BasicRemote(new TV());
        tvRemote.power();

        RemoteControl radioRemote = new BasicRemote(new Radio());
        radioRemote.power();
    }
}
// OUTPUT:
// TV is now ON
// Radio is now ON`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h4>Bridge vs Adapter</h4>
Both use composition and both involve an interface, but the intent differs: <strong>Adapter</strong> is applied <em>after the fact</em> to make two already-existing, incompatible interfaces work together; <strong>Bridge</strong> is designed <em>up front</em> so an abstraction and its implementation can be developed and extended independently from day one.<br><br>

<h4>Real-World Usage</h4>
JDBC is a textbook real Bridge: your Java code programs against the abstraction (<code>java.sql.Connection</code>, <code>Statement</code>), while each database vendor ships its own driver as the implementation side - swapping MySQL for PostgreSQL never requires changing your application code.<br><br>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Bridge solve?</td><td>Class explosion when a type has two or more independently varying dimensions - it splits them into separate hierarchies joined by composition</td></tr>
<tr class='text-center'><td>Bridge vs Adapter - what's the real difference?</td><td>Adapter retrofits incompatible interfaces after the fact; Bridge is designed up front to let abstraction and implementation evolve independently</td></tr>
<tr class='text-center'><td>Give a real JDK/framework example of Bridge</td><td>JDBC - Connection/Statement is the abstraction, each vendor's driver is the implementation</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: 'composite-pattern',
                        name: 'Composite Pattern',
                        beginner: [
                            {
                                content: `
The Composite Pattern lets you treat <b>individual objects</b> and <b>groups of objects</b> through the <b>same interface</b>, so client code doesn't need to know whether it's dealing with a single item or a whole tree of them.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A file system - a File and a Folder (which can contain Files and other Folders) both expose the same "get size" operation</li>
<li>An org chart - an individual employee and an entire department both respond to "list all members"</li>
<li>A UI toolkit - a single Button and a Panel full of widgets both respond to "render"</li>
</ul>

<h4>Why do we need Composite?</h4>
<ul>
<li>Represent part-whole (tree) hierarchies naturally</li>
<li>Let client code call the same method on a leaf or an entire branch without an if/else check for "is this one item or many?"</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.List;

// Common interface for both leaf (File) and composite (Folder)
interface FileSystemItem {
    void showDetails(String indent);
}

// Leaf
class FileItem implements FileSystemItem {
    private String name;

    public FileItem(String name) {
        this.name = name;
    }

    public void showDetails(String indent) {
        System.out.println(indent + "File: " + name);
    }
}

// Composite - holds other FileSystemItems (Files OR Folders)
class Folder implements FileSystemItem {
    private String name;
    private List<FileSystemItem> children = new ArrayList<>();

    public Folder(String name) {
        this.name = name;
    }

    public void add(FileSystemItem item) {
        children.add(item);
    }

    public void showDetails(String indent) {
        System.out.println(indent + "Folder: " + name);
        for (FileSystemItem item : children) {
            item.showDetails(indent + "  "); // same call, works for File or Folder
        }
    }
}

public class CompositeDemo {
    public static void main(String[] args) {
        Folder root = new Folder("root");
        FileItem readme = new FileItem("README.md");
        Folder src = new Folder("src");
        src.add(new FileItem("Main.java"));

        root.add(readme);
        root.add(src);

        root.showDetails(""); // client just calls showDetails - no type checks needed
    }
}
// OUTPUT:
// Folder: root
//   File: README.md
//   Folder: src
//     File: Main.java`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h4>When to Use Composite</h4>
Reach for Composite whenever your domain is naturally a <strong>tree</strong> and you find yourself writing "if this is a single item, do X; if it's a group, loop and do X to each" - Composite eliminates that branch entirely by giving both cases the same interface.<br><br>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What structural problem does Composite solve?</td><td>Letting client code treat a single object and a group/tree of objects uniformly through one shared interface</td></tr>
<tr class='text-center'><td>Give an example of Composite in the JDK</td><td>java.awt.Container extends Component - a Container can hold other Components, including other Containers</td></tr>
<tr class='text-center'><td>What's the trade-off of Composite?</td><td>Leaf-only operations (like "add child") must still exist on the shared interface even though a leaf can't meaningfully support them, unless you accept throwing UnsupportedOperationException</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: 'flyweight-pattern',
                        name: 'Flyweight Pattern',
                        beginner: [
                            {
                                content: `
The Flyweight Pattern reduces memory usage by <b>sharing common state</b> across many similar objects instead of storing that state redundantly in each one.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A text editor - every occurrence of the letter "A" in a document can share ONE glyph/font object instead of each character owning its own copy</li>
<li>A game with thousands of trees on a map - the 3D model/texture (shared) is reused; only each tree's x/y position (unique) is stored per instance</li>
</ul>

<h4>Intrinsic vs Extrinsic State</h4>
<ul>
<li><strong>Intrinsic state</strong> - shared, immutable, stored once inside the flyweight object (e.g. the character's font/shape)</li>
<li><strong>Extrinsic state</strong> - unique per usage, passed in from outside at the point of use, NOT stored in the flyweight (e.g. the character's x/y position on screen)</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

import java.util.HashMap;
import java.util.Map;

// Flyweight - stores only shared (intrinsic) state
class CharacterStyle {
    private final String font; // intrinsic - shared across many characters

    public CharacterStyle(String font) {
        this.font = font;
        System.out.println("Creating NEW style object for font: " + font);
    }

    // position is extrinsic - passed in, not stored here
    public void render(char c, int position) {
        System.out.println("Rendering '" + c + "' at position " + position + " using font " + font);
    }
}

// Factory - ensures each distinct font only creates ONE shared flyweight
class CharacterStyleFactory {
    private static final Map<String, CharacterStyle> cache = new HashMap<>();

    public static CharacterStyle getStyle(String font) {
        return cache.computeIfAbsent(font, CharacterStyle::new);
    }
}

public class FlyweightDemo {
    public static void main(String[] args) {
        CharacterStyle style1 = CharacterStyleFactory.getStyle("Arial");
        style1.render('H', 0);

        CharacterStyle style2 = CharacterStyleFactory.getStyle("Arial"); // reuses the SAME object
        style2.render('i', 1);

        System.out.println("Same shared object? " + (style1 == style2));
    }
}
// OUTPUT:
// Creating NEW style object for font: Arial
// Rendering 'H' at position 0 using font Arial
// Rendering 'i' at position 1 using font Arial
// Same shared object? true`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h4>A Built-In JDK Flyweight: Integer Caching</h4>
<code>Integer.valueOf(int)</code> caches and reuses <code>Integer</code> objects for values -128 to 127 - this is exactly the Flyweight idea baked into the JDK itself, which is why <code>Integer a = 100; Integer b = 100; a == b</code> is <code>true</code>, but the same comparison for 1000 is <code>false</code> (outside the cached range, a new object is created each time).<br><br>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Flyweight solve?</td><td>Excessive memory usage when creating a very large number of similar objects, by sharing their common (intrinsic) state instead of duplicating it</td></tr>
<tr class='text-center'><td>Difference between intrinsic and extrinsic state?</td><td>Intrinsic state is shared and stored inside the flyweight; extrinsic state is unique per use and supplied by the caller at call time, never stored in the flyweight</td></tr>
<tr class='text-center'><td>Name a Flyweight example already in the JDK</td><td>Integer.valueOf() caching Integer objects in the range -128 to 127</td></tr>
</table>`
                            }
                        ]
                    }
                ]
            },

            {
                id: 'behavioral-patterns',
                name: 'Behavioral Patterns',
                topics: [
                    {
                        id: 'observer-pattern',
                        name: 'Observer Pattern',
                        beginner: [
                            {
                                content: `
Observer Pattern defines a <b>one-to-many dependency</b> between objects, so that when one object (the "subject") changes state, all its dependents ("observers") are notified and updated automatically.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>YouTube channel subscribers get notified whenever the channel uploads a new video</li>
<li>Newspaper/magazine subscription - all subscribers get the new edition automatically</li>
<li>Java's own <code>java.util.Observer</code> (legacy) and any GUI event-listener system</li>
</ul>

<h4>Why do we need Observer?</h4>
<ul>
<li>To notify multiple dependent objects about a state change without tightly coupling them to the subject</li>
<li>To let observers be added/removed at runtime without changing the subject's code</li>
<li>It's the foundation of event-driven and reactive programming (pub-sub systems)</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.List;

// Observer interface
interface Subscriber {
    void update(String videoTitle);
}

// Concrete observers
class EmailSubscriber implements Subscriber {
    private String name;
    public EmailSubscriber(String name) { this.name = name; }
    public void update(String videoTitle) {
        System.out.println("Email to " + name + ": New video uploaded - " + videoTitle);
    }
}

// Subject - maintains the list of observers and notifies them
class YouTubeChannel {
    private List<Subscriber> subscribers = new ArrayList<>();

    public void subscribe(Subscriber subscriber) {
        subscribers.add(subscriber);
    }

    public void uploadVideo(String title) {
        System.out.println("Channel uploaded: " + title);
        notifyAllSubscribers(title); // one state change -> many notifications
    }

    private void notifyAllSubscribers(String title) {
        for (Subscriber s : subscribers) {
            s.update(title);
        }
    }
}

public class ObserverDemo {
    public static void main(String[] args) {
        YouTubeChannel channel = new YouTubeChannel();
        channel.subscribe(new EmailSubscriber("Pankaj"));
        channel.subscribe(new EmailSubscriber("Sheru"));

        channel.uploadVideo("Design Patterns in Java - Observer Pattern");
    }
}
// OUTPUT:
// Channel uploaded: Design Patterns in Java - Observer Pattern
// Email to Pankaj: New video uploaded - Design Patterns in Java - Observer Pattern
// Email to Sheru: New video uploaded - Design Patterns in Java - Observer Pattern`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'chain-of-responsibility-pattern',
                        name: 'Chain of Responsibility Pattern',
                        beginner: [
                            {
                                content: `
Chain of Responsibility lets you pass a request along a <b>chain of handlers</b>. Each handler decides either to process the request or pass it to the next handler.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>ATM cash dispenser — handles request using 2000, 500, 100 notes in a chain</li>
<li>Tech support escalation — L1 support tries first, then L2, then L3</li>
<li>Leave approval — Manager approves small leaves, Director approves longer ones</li>
</ul>

<h4>Why do we need it?</h4>
<ul>
<li>Decouples sender of a request from its receivers</li>
<li>Multiple objects get a chance to handle the request</li>
<li>New handlers can be added without changing existing code</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create abstract <code>Handler</code> with a <code>setNext()</code> method</li>
<li>Step 2: Create concrete handlers that either handle or forward the request</li>
<li>Step 3: Client builds the chain and sends request to the first handler</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Step 1: Abstract Handler
abstract class LeaveApprover {
    protected LeaveApprover next;

    public void setNext(LeaveApprover next) {
        this.next = next;
    }

    public abstract void processRequest(int days);
}

// Step 2: Concrete Handlers
class Manager extends LeaveApprover {
    public void processRequest(int days) {
        if (days <= 2) {
            System.out.println("Manager approved " + days + " day(s) leave");
        } else if (next != null) {
            next.processRequest(days);
        }
    }
}

class Director extends LeaveApprover {
    public void processRequest(int days) {
        if (days <= 7) {
            System.out.println("Director approved " + days + " day(s) leave");
        } else if (next != null) {
            next.processRequest(days);
        }
    }
}

class VP extends LeaveApprover {
    public void processRequest(int days) {
        System.out.println("VP approved " + days + " day(s) leave");
    }
}

// Step 3: Client
public class Test {
    public static void main(String[] args) {
        LeaveApprover manager = new Manager();
        LeaveApprover director = new Director();
        LeaveApprover vp = new VP();

        manager.setNext(director);
        director.setNext(vp);

        manager.processRequest(1);
        manager.processRequest(5);
        manager.processRequest(15);
    }
}
// OUTPUT:
// Manager approved 1 day(s) leave
// Director approved 5 day(s) leave
// VP approved 15 day(s) leave`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
<h3>ATM Cash Dispenser — Full Chain Example</h3>
<p>
A very common interview example: dispensing cash using the fewest number of currency notes,
where each handler is responsible for one denomination and passes the remainder down the chain.
</p>
`,
                                codeExamples: [
                                    `abstract class CurrencyHandler {
    protected CurrencyHandler next;
    protected int denomination;

    CurrencyHandler(int denomination) {
        this.denomination = denomination;
    }

    public void setNext(CurrencyHandler next) {
        this.next = next;
    }

    public void dispense(int amount) {
        int numNotes = amount / denomination;
        int remainder = amount % denomination;

        if (numNotes > 0) {
            System.out.println(numNotes + " x " + denomination + " note(s) dispensed");
        }
        if (remainder != 0 && next != null) {
            next.dispense(remainder);
        }
    }
}

public class ATMDispenser {
    public static void main(String[] args) {
        CurrencyHandler h2000 = new CurrencyHandler(2000) {};
        CurrencyHandler h500 = new CurrencyHandler(500) {};
        CurrencyHandler h100 = new CurrencyHandler(100) {};

        h2000.setNext(h500);
        h500.setNext(h100);

        h2000.dispense(3700);
    }
}
// OUTPUT:
// 1 x 2000 note(s) dispensed
// 3 x 500 note(s) dispensed
// 2 x 100 note(s) dispensed`
                                ]
                            },
                            {
                                content: `
<h3>Servlet Filters — A Real Chain of Responsibility Example</h3>
<p>
The Java Servlet API's <code>Filter</code> mechanism is a textbook production use of Chain
of Responsibility. Each filter processes the request/response and then decides whether to
pass control to the next filter using <code>FilterChain.doFilter()</code>.
</p>
`,
                                codeExamples: [
                                    `public class AuthFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        System.out.println("Checking authentication...");
        chain.doFilter(req, res);
    }
}`
                                ]
                            },
                            {
                                content: `
<h3>Chain of Responsibility vs Decorator</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Chain of Responsibility</th>
<th>Decorator</th>
</tr>
<tr>
<td>Intent</td>
<td>Pass request until someone handles it</td>
<td>Add extra behavior/wrapping around an object</td>
</tr>
<tr>
<td>Execution</td>
<td>Usually only ONE handler processes it (or a subset), can stop early</td>
<td>Every decorator in the stack always executes</td>
</tr>
<tr>
<td>Structure</td>
<td>Linked list of handlers</td>
<td>Nested wrapper objects</td>
</tr>
<tr>
<td>Example</td>
<td>Servlet Filters, Leave Approval, ATM Dispenser</td>
<td>BufferedReader wrapping Reader, java.io streams</td>
</tr>
</table>

<h4>Common Mistakes</h4>
<ul>
<li>Forgetting to call <code>next</code> handler — request silently gets dropped</li>
<li>Creating a circular chain (A → B → A), leading to infinite loops</li>
<li>Not having a default/terminal handler that guarantees the request is eventually handled</li>
</ul>
`
                            },
                            {
                                content: `
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>#</th><th>Question</th><th>Short Answer</th></tr>
<tr><td>1</td><td>What is Chain of Responsibility?</td><td>A behavioral pattern that passes a request along a chain of handlers until one of them handles it</td></tr>
<tr><td>2</td><td>What problem does it solve?</td><td>Decouples the sender of a request from the specific object that will handle it</td></tr>
<tr><td>3</td><td>Give a real Java framework example.</td><td>Servlet Filters — each Filter decides whether to handle/modify the request and call chain.doFilter() to continue</td></tr>
<tr><td>4</td><td>What's a common bug with this pattern?</td><td>Forgetting to forward to the next handler, silently dropping the request</td></tr>
<tr><td>5</td><td>Chain of Responsibility vs Decorator?</td><td>CoR usually stops at the first handler that processes the request; Decorator always runs every wrapper in the stack</td></tr>
<tr><td>6</td><td>How do you prevent infinite loops in a chain?</td><td>Build the chain as a strict acyclic structure and always terminate with a handler that has next = null</td></tr>
</table>
`
                            }
                        ]
                    },

                    {
                        id: 'interpreter-pattern',
                        name: 'Interpreter Pattern',
                        beginner: [
                            {
                                content: `
<h3>What is the Interpreter Pattern?</h3>
<p>
The Interpreter Pattern defines a way to <b>evaluate language grammar or expressions</b>.
It represents each rule of the grammar as a class, and combines these classes to
interpret sentences (expressions) in that language.
</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A <b>calculator</b> that reads <code>"3 + 5 * 2"</code> and evaluates the result.</li>
<li>A traffic signal controller interpreting simple rule sentences like "IF car THEN stop".</li>
<li>A basic search engine interpreting boolean queries like <code>"java AND spring"</code>.</li>
</ul>

<h4>Why do we need Interpreter Pattern?</h4>
<ul>
<li>To evaluate expressions written in a simple custom language or grammar.</li>
<li>To break a complex expression into smaller, manageable expression objects.</li>
<li>To make grammar rules easy to extend by adding new expression classes.</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li><b>Expression (interface)</b> — declares an <code>interpret()</code> method.</li>
<li><b>Terminal Expression</b> — represents the basic elements of grammar (e.g., a number).</li>
<li><b>Non-Terminal Expression</b> — represents rules combining other expressions (e.g., addition, multiplication).</li>
<li><b>Client</b> — builds the expression tree and calls <code>interpret()</code>.</li>
</ul>
`,
                                codeExamples: [
                                    `interface Expression {
    int interpret();
}

class NumberExpression implements Expression {
    private int number;

    public NumberExpression(int number) {
        this.number = number;
    }

    @Override
    public int interpret() {
        return number;
    }
}

class AddExpression implements Expression {
    private Expression leftExpression;
    private Expression rightExpression;

    public AddExpression(Expression left, Expression right) {
        this.leftExpression = left;
        this.rightExpression = right;
    }

    @Override
    public int interpret() {
        return leftExpression.interpret() + rightExpression.interpret();
    }
}

class MultiplyExpression implements Expression {
    private Expression leftExpression;
    private Expression rightExpression;

    public MultiplyExpression(Expression left, Expression right) {
        this.leftExpression = left;
        this.rightExpression = right;
    }

    @Override
    public int interpret() {
        return leftExpression.interpret() * rightExpression.interpret();
    }
}

public class Test {
    public static void main(String[] args) {

        Expression three = new NumberExpression(3);
        Expression five = new NumberExpression(5);
        Expression two = new NumberExpression(2);

        Expression multiply = new MultiplyExpression(five, two);
        Expression add = new AddExpression(three, multiply);

        System.out.println("Result: " + add.interpret());
    }
}
// OUTPUT:
// Result: 13`
                                ]
                            },
                            {
                                content: `
<h4>How It Works — Step by Step</h4>
<ul>
<li>Every number (3, 5, 2) becomes a <b>NumberExpression</b> (Terminal Expression).</li>
<li>The multiplication "5 * 2" becomes a <b>MultiplyExpression</b> wrapping the two numbers.</li>
<li>The addition "3 + (5*2)" becomes an <b>AddExpression</b> wrapping the number and the multiply expression.</li>
<li>Calling <code>interpret()</code> on the outermost expression recursively evaluates the whole tree.</li>
</ul>

<h4>Expression Tree Diagram:</h4>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
              AddExpression
              /           \\\\
      NumberExpression(3)   MultiplyExpression
                              /           \\\\
                    NumberExpression(5)  NumberExpression(2)
</pre>

<p>
Each node "interprets itself" and passes the result up to its parent —
this is a classic <b>recursive tree evaluation</b>.
</p>
`
                            }
                        ],
                        expert: [
                            {
                                content: `
<h3>Where Interpreter Pattern is Actually Used</h3>
<ul>
<li><b>Regex engines</b> — a regular expression is compiled into a tree of terminal/non-terminal expressions and interpreted against input text.</li>
<li><b>SQL parsers</b> — query language grammar (SELECT, WHERE, JOIN clauses) is parsed into an expression tree and interpreted/executed.</li>
<li><b>Rule engines</b> — business rule engines (like Drools) interpret condition expressions such as <code>"age > 18 AND country == 'IN'"</code>.</li>
<li><b>Spring Expression Language (SpEL)</b> — <code>@Value("#{someBean.someProperty}")</code> is parsed and interpreted internally using this pattern.</li>
<li><b>Template engines</b> — interpreting placeholders like <code>{{ name }}</code> in templates.</li>
</ul>

<h4>Terminal vs Non-Terminal Expressions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Type</th>
<th>Meaning</th>
<th>Example</th>
</tr>
<tr>
<td>Terminal Expression</td>
<td>Leaf node of the grammar tree — cannot be broken down further</td>
<td>NumberExpression, VariableExpression</td>
</tr>
<tr>
<td>Non-Terminal Expression</td>
<td>Combines one or more other expressions to form a grammar rule</td>
<td>AddExpression, MultiplyExpression, AndExpression, OrExpression</td>
</tr>
</table>
`,
                                codeExamples: [
                                    `interface BooleanExpression {
    boolean interpret(String context);
}

class TerminalExpression implements BooleanExpression {
    private String data;

    public TerminalExpression(String data) {
        this.data = data;
    }

    @Override
    public boolean interpret(String context) {
        return context.contains(data);
    }
}

class AndExpression implements BooleanExpression {
    private BooleanExpression left;
    private BooleanExpression right;

    public AndExpression(BooleanExpression left, BooleanExpression right) {
        this.left = left;
        this.right = right;
    }

    @Override
    public boolean interpret(String context) {
        return left.interpret(context) && right.interpret(context);
    }
}

public class RuleEngineTest {
    public static void main(String[] args) {
        BooleanExpression java = new TerminalExpression("java");
        BooleanExpression spring = new TerminalExpression("spring");

        BooleanExpression javaAndSpring = new AndExpression(java, spring);

        System.out.println(javaAndSpring.interpret("java spring developer"));
        System.out.println(javaAndSpring.interpret("java developer"));
    }
}
// OUTPUT:
// true
// false`
                                ]
                            },
                            {
                                content: `
<h3>Why Interpreter is Rarely Used in Production</h3>
<ul>
<li><b>Performance:</b> Deeply nested expression trees mean deeply nested recursive calls — this becomes slow for complex grammars.</li>
<li><b>Class explosion:</b> Every grammar rule needs its own class, so a moderately complex language quickly results in dozens of expression classes.</li>
<li><b>Maintainability:</b> Hand-written interpreters are hard to extend and debug compared to using a dedicated parsing tool.</li>
<li><b>Better alternatives exist:</b> Real-world parsing needs (SQL, DSLs, config languages) are almost always solved using mature parser generator libraries like <b>ANTLR</b>, <b>JavaCC</b>, or existing libraries (e.g., <code>javax.script</code>, Spring's SpEL parser) instead of writing a hand-rolled Interpreter pattern.</li>
</ul>

<h4>When Interpreter Pattern IS still a reasonable choice</h4>
<ul>
<li>The grammar is <b>very small and simple</b> (a handful of rules).</li>
<li>The grammar is <b>unlikely to grow</b> significantly.</li>
<li>You need something quick and don't want the overhead of a full parser generator toolchain.</li>
</ul>

<h3>Interpreter vs Visitor Pattern</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Interpreter Pattern</th>
<th>Visitor Pattern</th>
</tr>
<tr>
<td>Purpose</td>
<td>Evaluate/interpret a grammar or language expression</td>
<td>Add new operations to an existing object structure without changing its classes</td>
</tr>
<tr>
<td>Where logic lives</td>
<td>Each expression class implements its own <code>interpret()</code> logic</td>
<td>Logic lives in a separate Visitor class, objects just <code>accept()</code> the visitor</td>
</tr>
<tr>
<td>Extending with new operations</td>
<td>Hard - requires modifying/adding expression classes</td>
<td>Easy - just add a new Visitor implementation</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>#</th><th>Question</th><th>Short Answer</th></tr>
<tr><td>1</td><td>What is the Interpreter Pattern?</td><td>A behavioral pattern that represents grammar rules as classes and evaluates expressions using an interpret() method</td></tr>
<tr><td>2</td><td>What is a Terminal Expression?</td><td>A leaf-level expression in the grammar that cannot be broken down further (e.g., a number or variable)</td></tr>
<tr><td>3</td><td>What is a Non-Terminal Expression?</td><td>An expression that combines other expressions to represent a grammar rule (e.g., addition, AND, OR)</td></tr>
<tr><td>4</td><td>Give a real-world example of Interpreter usage.</td><td>Regex engines, SQL parsers, rule engines, and Spring's SpEL expression evaluation</td></tr>
<tr><td>5</td><td>Why is Interpreter rarely used in large production systems?</td><td>Performance issues with deep recursion, class explosion for complex grammars, and better alternatives like ANTLR exist</td></tr>
<tr><td>6</td><td>Interpreter vs Visitor pattern?</td><td>Interpreter evaluates a grammar/language expression tree; Visitor adds new operations to an existing object structure without modifying it</td></tr>
</table>
`
                            }
                        ]
                    },

                    {
                        id: 'iterator-pattern',
                        name: 'Iterator Pattern',
                        beginner: [
                            {
                                content: `
Iterator Pattern provides a way to <b>access elements of a collection sequentially</b> without exposing its underlying representation (array, list, tree, etc.).</p>

<h4>Real-Life Example:</h4>
<p>
A TV remote lets you browse channels one by one using the "Next" / "Previous" buttons.
You don't need to know whether the channels are stored as a list, an array, or fetched from a server -
the remote just gives you one channel at a time.
</p>

<h4>Why do we need Iterator Pattern?</h4>
<ul>
<li>To traverse a collection without exposing its internal structure</li>
<li>To provide a uniform way of iterating over different types of collections</li>
<li>To support multiple simultaneous traversals of the same collection</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li><code>Iterator</code> - interface with hasNext() and next() methods</li>
<li>Concrete Iterator - implements traversal logic for a specific collection</li>
<li><code>Aggregate</code> (Collection) - interface with a createIterator() method</li>
<li>Concrete Aggregate - returns a Concrete Iterator for itself</li>
</ul>
`,
                                codeExamples: [
                                    `interface MyIterator<T> {
    boolean hasNext();
    T next();
}

interface Collection<T> {
    MyIterator<T> createIterator();
}

class BookCollection implements Collection<String> {

    private String[] books;
    private int count = 0;

    public BookCollection(int size) {
        books = new String[size];
    }

    public void addBook(String title) {
        if (count < books.length) {
            books[count++] = title;
        }
    }

    public MyIterator<String> createIterator() {
        return new BookIterator();
    }

    private class BookIterator implements MyIterator<String> {

        private int index = 0;

        public boolean hasNext() {
            return index < count;
        }

        public String next() {
            return books[index++];
        }
    }
}

public class Test {
    public static void main(String[] args) {
        BookCollection collection = new BookCollection(3);
        collection.addBook("Effective Java");
        collection.addBook("Clean Code");
        collection.addBook("Head First Design Patterns");

        MyIterator<String> iterator = collection.createIterator();

        while (iterator.hasNext()) {
            System.out.println(iterator.next());
        }
    }
}
// OUTPUT:
// Effective Java
// Clean Code
// Head First Design Patterns`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
<h3>Java's Built-in <code>Iterator</code> and <code>Iterable</code></h3>
<p>
The JDK already implements the Iterator pattern via <code>java.util.Iterator</code> and
<code>java.lang.Iterable</code>. Implementing <code>Iterable</code> in your own class lets it be
used directly in a for-each loop, integrating naturally with the rest of the Collections framework.
</p>
`,
                                codeExamples: [
                                    `import java.util.Iterator;

class BookCollection implements Iterable<String> {

    private String[] books;
    private int count = 0;

    public BookCollection(int size) {
        books = new String[size];
    }

    public void addBook(String title) {
        if (count < books.length) {
            books[count++] = title;
        }
    }

    @Override
    public Iterator<String> iterator() {
        return new Iterator<String>() {
            private int index = 0;

            public boolean hasNext() {
                return index < count;
            }

            public String next() {
                return books[index++];
            }
        };
    }
}

public class Test {
    public static void main(String[] args) {
        BookCollection collection = new BookCollection(2);
        collection.addBook("Effective Java");
        collection.addBook("Clean Code");

        for (String book : collection) {
            System.out.println(book);
        }
    }
}
// OUTPUT:
// Effective Java
// Clean Code`
                                ]
                            },
                            {
                                content: `
<h3>Fail-Fast vs Fail-Safe Iterators</h3>
<p>
Java Collections provide two categories of iterators depending on how they behave when the
underlying collection is modified during iteration.
</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Fail-Fast</th>
<th>Fail-Safe</th>
</tr>
<tr>
<td>Behavior on modification</td>
<td>Throws <code>ConcurrentModificationException</code> immediately</td>
<td>Iterates over a snapshot/copy, no exception</td>
</tr>
<tr>
<td>Underlying mechanism</td>
<td>Uses an internal modCount checked on every next()</td>
<td>Works on a cloned/copy-on-write structure</td>
</tr>
<tr>
<td>Examples</td>
<td><code>ArrayList</code>, <code>HashMap</code>, <code>HashSet</code></td>
<td><code>CopyOnWriteArrayList</code>, <code>ConcurrentHashMap</code></td>
</tr>
</table>
`,
                                codeExamples: [
                                    `import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class Test {
    public static void main(String[] args) {

        List<String> list = new ArrayList<>(List.of("A", "B", "C"));
        try {
            for (String s : list) {
                // Must not be the second-to-last element: removing that leaves
                // cursor == size, hasNext() returns false and no CME is ever thrown.
                if (s.equals("A")) {
                    list.remove(s);
                }
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("Fail-Fast: ConcurrentModificationException thrown");
        }

        List<String> safeList = new CopyOnWriteArrayList<>(List.of("A", "B", "C"));
        for (String s : safeList) {
            if (s.equals("B")) {
                safeList.remove(s);
            }
        }
        System.out.println("Fail-Safe result: " + safeList);
    }
}
// OUTPUT:
// Fail-Fast: ConcurrentModificationException thrown
// Fail-Safe result: [A, C]`
                                ]
                            },
                            {
                                content: `
<h3><code>ConcurrentModificationException</code> - Why It Happens</h3>
<p>
Fail-fast iterators (like those returned by <code>ArrayList</code>) track a <code>modCount</code>
field on the collection. Every structural modification (add/remove) increments it. The iterator
captures the modCount at creation and compares it on every call to <code>next()</code> - if they
differ, it throws <code>ConcurrentModificationException</code> to warn you early rather than let the
program silently misbehave.
</p>

<h4>Correct Way to Remove While Iterating</h4>
`,
                                codeExamples: [
                                    `List<String> list = new ArrayList<>(List.of("A", "B", "C"));
Iterator<String> it = list.iterator();

while (it.hasNext()) {
    String value = it.next();
    if (value.equals("B")) {
        it.remove();
    }
}

System.out.println(list);
// OUTPUT:
// [A, C]`
                                ]
                            },
                            {
                                content: `
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>#</th><th>Question</th><th>Short Answer</th></tr>
<tr><td>1</td><td>What is the Iterator Pattern?</td><td>A behavioral pattern that lets you access elements of a collection sequentially without exposing its internal structure</td></tr>
<tr><td>2</td><td>Where does Java implement this pattern natively?</td><td>java.util.Iterator and java.lang.Iterable - implementing Iterable enables the for-each loop</td></tr>
<tr><td>3</td><td>Why does removing an element in a for-each loop throw an exception?</td><td>The for-each loop uses a fail-fast iterator internally; direct collection modification during iteration is detected via modCount and throws ConcurrentModificationException</td></tr>
<tr><td>4</td><td>What's the safe way to remove elements while iterating?</td><td>Use Iterator.remove() instead of Collection.remove(), which keeps modCount in sync</td></tr>
<tr><td>5</td><td>Fail-fast vs fail-safe iterators?</td><td>Fail-fast throws ConcurrentModificationException on concurrent modification (ArrayList, HashMap); fail-safe iterates a snapshot/copy with no exception (CopyOnWriteArrayList, ConcurrentHashMap)</td></tr>
<tr><td>6</td><td>When would you prefer Stream API over Iterator?</td><td>For bulk map/filter/reduce style processing, since Stream is more expressive than manual iteration</td></tr>
</table>
`
                            }
                        ]
                    },

                    {
                        id: 'mediator-pattern',
                        name: 'Mediator Pattern',
                        beginner: [
                            {
                                content: `
Mediator Pattern defines an object that <b>coordinates communication</b> between a group of other objects, so they don't talk to each other directly.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Air Traffic Control Tower — planes don't talk to each other directly, tower coordinates them</li>
<li>Chat Room — users send messages through a mediator, not directly to every other user</li>
<li>Airport Ground Staff Coordination</li>
</ul>

<h4>Why do we need it?</h4>
<ul>
<li>Without a mediator, every object needs a reference to every other object (many-to-many mess)</li>
<li>Mediator centralizes communication logic in one place</li>
<li>Reduces tight coupling between components</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li>Step 1: Create a <code>Mediator</code> interface</li>
<li>Step 2: Create a concrete mediator implementing coordination logic</li>
<li>Step 3: Colleague objects (e.g., <code>User</code>) hold a reference to the mediator only</li>
<li>Step 4: Colleagues communicate via the mediator, never directly</li>
</ul>
`,
                                codeExamples: [
                                    `import java.util.ArrayList;
import java.util.List;

interface ChatMediator {
    void sendMessage(String message, User sender);
    void addUser(User user);
}

abstract class User {
    protected ChatMediator mediator;
    protected String name;

    public User(ChatMediator mediator, String name) {
        this.mediator = mediator;
        this.name = name;
    }

    public abstract void send(String message);
    public abstract void receive(String message);
}

class ChatUser extends User {
    public ChatUser(ChatMediator mediator, String name) {
        super(mediator, name);
    }

    public void send(String message) {
        System.out.println(this.name + " sends: " + message);
        mediator.sendMessage(message, this);
    }

    public void receive(String message) {
        System.out.println(this.name + " received: " + message);
    }
}

class ChatRoom implements ChatMediator {
    private List<User> users = new ArrayList<>();

    public void addUser(User user) {
        users.add(user);
    }

    public void sendMessage(String message, User sender) {
        for (User user : users) {
            if (user != sender) {
                user.receive(message);
            }
        }
    }
}

public class Test {
    public static void main(String[] args) {
        ChatMediator chatRoom = new ChatRoom();

        User anaji = new ChatUser(chatRoom, "Anaji");
        User baji = new ChatUser(chatRoom, "Baji");
        User charlie = new ChatUser(chatRoom, "Chimnaji");

        chatRoom.addUser(anaji);
        chatRoom.addUser(baji);
        chatRoom.addUser(charlie);

        anaji.send("Hi everyone!");
    }
}
// OUTPUT:
// Anaji sends: Hi everyone!
// Baji received: Hi everyone!
// Chimnaji received: Hi everyone!`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
<h3>How Mediator Reduces Coupling</h3>
<p>
Without Mediator, N objects that need to talk to each other require up to
<code>N*(N-1)</code> direct references — a many-to-many mesh of dependencies.
With Mediator, every object needs only ONE reference — to the mediator — turning
the relationship into many-to-one.
</p>
`,
                                codeExamples: [
                                    `Without Mediator:                With Mediator:

  A --- B                           A
  | \\\\ / |                          |
  |  X  |                          M --- B
  | / \\\\ |                          |
  C --- D                           C, D`
                                ]
                            },
                            {
                                content: `
<h3>Mediator vs Facade</h3>
<p>
Both patterns introduce an intermediary object, but their purpose is different.
</p>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Mediator</th>
<th>Facade</th>
</tr>
<tr>
<td>Intent</td>
<td>Coordinates two-way communication between colleague objects</td>
<td>Provides a simplified one-way entry point to a subsystem</td>
</tr>
<tr>
<td>Colleagues aware of it?</td>
<td>Yes — colleagues explicitly call the mediator</td>
<td>No — subsystem classes don't know Facade exists</td>
</tr>
<tr>
<td>Example</td>
<td>Chat room, Air traffic control</td>
<td>Simplified API over multiple complex services</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h3>Real-World Use — GUI Frameworks & Event Buses</h3>
<ul>
<li><b>GUI frameworks</b> — a Dialog acts as mediator between buttons, textboxes, checkboxes, so widgets don't reference each other directly</li>
<li><b>Event Bus / Message Bus</b> (e.g., Spring's <code>ApplicationEventPublisher</code>) — publishers and subscribers don't know each other, the bus mediates</li>
<li><b>MVC Controllers</b> — often act as mediators between View and Model components</li>
</ul>

<h4>Common Mistakes</h4>
<ul>
<li>Letting the mediator grow into a "God Object" containing all business logic</li>
<li>Colleague objects still holding direct references to each other "just in case"</li>
<li>Not splitting mediator responsibilities when it becomes too large — consider multiple smaller mediators</li>
</ul>
`
                            },
                            {
                                content: `
<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>#</th><th>Question</th><th>Short Answer</th></tr>
<tr><td>1</td><td>What is the Mediator Pattern?</td><td>A behavioral pattern that centralizes communication between related objects through a single mediator instead of direct references</td></tr>
<tr><td>2</td><td>What problem does it solve?</td><td>Avoids a many-to-many mesh of direct dependencies between objects, replacing it with a many-to-one relationship to the mediator</td></tr>
<tr><td>3</td><td>Mediator vs Observer?</td><td>Mediator coordinates two-way communication between known colleagues; Observer is a one-to-many notification where the subject doesn't know what observers do with the update</td></tr>
<tr><td>4</td><td>Mediator vs Facade?</td><td>Mediator coordinates two-way communication colleagues are aware of; Facade simplifies one-way access to a subsystem the client is unaware of internally</td></tr>
<tr><td>5</td><td>Give a real-world Java example.</td><td>Spring's ApplicationEventPublisher acts as a mediator between event publishers and listeners</td></tr>
<tr><td>6</td><td>What's the main risk of overusing Mediator?</td><td>The mediator itself can grow into a "God Object" holding too much business logic</td></tr>
</table>
`
                            }
                        ]
                    },

                    {
                        id: 'strategy-pattern',
                        name: 'Strategy Pattern',
                        beginner: [
                            {
                                content: `
Strategy Pattern defines a <b>family of interchangeable algorithms</b>, encapsulates each one in its own class, and lets the client swap between them at runtime - without changing the code that uses them.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A navigation app choosing between "fastest route", "shortest route", or "avoid tolls" strategies</li>
<li>A checkout page letting a customer pay by Credit Card, UPI, or PayPal - each is a different payment strategy</li>
<li>Java's own <code>Comparator</code> passed into <code>Collections.sort(list, comparator)</code></li>
</ul>

<h4>Why do we need Strategy?</h4>
<ul>
<li>To eliminate long if-else/switch chains that pick behavior based on a type flag</li>
<li>To let each algorithm be tested, extended, and swapped independently (Open/Closed Principle)</li>
<li>To let the algorithm vary independently from the client that uses it</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Strategy interface
interface PaymentStrategy {
    void pay(int amount);
}

// Concrete strategies
class CreditCardPayment implements PaymentStrategy {
    public void pay(int amount) { System.out.println("Paid Rs." + amount + " using Credit Card"); }
}

class UpiPayment implements PaymentStrategy {
    public void pay(int amount) { System.out.println("Paid Rs." + amount + " using UPI"); }
}

// Context - holds a reference to a strategy and delegates to it
class ShoppingCart {
    private PaymentStrategy paymentStrategy;

    public void setPaymentStrategy(PaymentStrategy strategy) {
        this.paymentStrategy = strategy; // strategy can be swapped at runtime
    }

    public void checkout(int amount) {
        paymentStrategy.pay(amount); // delegates - ShoppingCart doesn't know/care HOW payment happens
    }
}

public class StrategyDemo {
    public static void main(String[] args) {
        ShoppingCart cart = new ShoppingCart();

        cart.setPaymentStrategy(new CreditCardPayment());
        cart.checkout(1500);

        cart.setPaymentStrategy(new UpiPayment()); // swap strategy at runtime
        cart.checkout(750);
    }
}
// OUTPUT:
// Paid Rs.1500 using Credit Card
// Paid Rs.750 using UPI`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'command-pattern',
                        name: 'Command Pattern',
                        beginner: [
                            {
                                content: `
Command Pattern turns a <b>request into a standalone object</b> containing everything needed to perform an action (or undo it) - decoupling the object that invokes an operation from the object that knows how to perform it.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>A TV remote control - each button is a Command object that knows what device action to trigger</li>
<li>Restaurant order slips - a waiter writes a command that the kitchen executes later, independently</li>
<li>Undo/redo functionality in text editors</li>
</ul>

<h4>Why do we need Command?</h4>
<ul>
<li>To decouple the sender (the button/invoker) from the receiver (the object that does the actual work)</li>
<li>To support undo/redo by keeping a history of executed Command objects</li>
<li>To queue, log, or schedule requests as objects instead of executing them immediately</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Command interface
interface Command {
    void execute();
}

// Receiver - knows HOW to actually perform the action
class Light {
    void turnOn() { System.out.println("Light is ON"); }
    void turnOff() { System.out.println("Light is OFF"); }
}

// Concrete commands - each wraps a receiver + the action to invoke on it
class LightOnCommand implements Command {
    private Light light;
    public LightOnCommand(Light light) { this.light = light; }
    public void execute() { light.turnOn(); }
}

class LightOffCommand implements Command {
    private Light light;
    public LightOffCommand(Light light) { this.light = light; }
    public void execute() { light.turnOff(); }
}

// Invoker - triggers a command without knowing what it actually does
class RemoteControl {
    private Command command;
    public void setCommand(Command command) { this.command = command; }
    public void pressButton() { command.execute(); }
}

public class CommandDemo {
    public static void main(String[] args) {
        Light livingRoomLight = new Light();
        RemoteControl remote = new RemoteControl();

        remote.setCommand(new LightOnCommand(livingRoomLight));
        remote.pressButton(); // invoker doesn't know it's turning ON a light

        remote.setCommand(new LightOffCommand(livingRoomLight));
        remote.pressButton();
    }
}
// OUTPUT:
// Light is ON
// Light is OFF`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'template-method-pattern',
                        name: 'Template Method Pattern',
                        beginner: [
                            {
                                content: `
Template Method Pattern defines the <b>skeleton of an algorithm</b> in a base class method, deferring some of its individual steps to subclasses - the overall sequence stays fixed, but specific steps can be customized.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>Making tea vs coffee - both follow "boil water -> brew -> pour in cup -> add condiments", but "brew" and "add condiments" differ</li>
<li>A standardized exam-checking process where the overall flow is fixed but subject-specific grading differs</li>
</ul>

<h4>Why do we need Template Method?</h4>
<ul>
<li>To avoid duplicating the common parts of an algorithm across multiple subclasses</li>
<li>To enforce a fixed overall structure/sequence while still allowing customization of individual steps</li>
<li>To let subclasses override only what varies ("hook" methods) - this is the Hollywood Principle: "don't call us, we'll call you"</li>
</ul>
`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Abstract class defines the algorithm's skeleton
abstract class Beverage {

    // Template method - the fixed algorithm, marked final so subclasses can't change the sequence
    public final void prepareRecipe() {
        boilWater();
        brew();          // varies per subclass
        pourInCup();
        addCondiments();  // varies per subclass
    }

    private void boilWater() { System.out.println("Boiling water"); }
    private void pourInCup() { System.out.println("Pouring into cup"); }

    protected abstract void brew();          // subclasses MUST implement
    protected abstract void addCondiments(); // subclasses MUST implement
}

class Tea extends Beverage {
    protected void brew() { System.out.println("Steeping the tea"); }
    protected void addCondiments() { System.out.println("Adding lemon"); }
}

class Coffee extends Beverage {
    protected void brew() { System.out.println("Dripping coffee through filter"); }
    protected void addCondiments() { System.out.println("Adding sugar and milk"); }
}

public class TemplateMethodDemo {
    public static void main(String[] args) {
        Beverage tea = new Tea();
        tea.prepareRecipe(); // same 4-step sequence every time, only brew()/addCondiments() differ

        System.out.println("---");

        Beverage coffee = new Coffee();
        coffee.prepareRecipe();
    }
}
// OUTPUT:
// Boiling water
// Steeping the tea
// Pouring into cup
// Adding lemon
// ---
// Boiling water
// Dripping coffee through filter
// Pouring into cup
// Adding sugar and milk`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'memento-pattern',
                        name: 'Memento Pattern',
                        beginner: [
                            {
                                content: `<h4>What is Memento Pattern?</h4>
Memento Pattern captures and externalizes an object's <b>internal state</b> so it can be restored later - without violating <b>encapsulation</b> (no other object ever sees the fields being snapshotted directly).<br><br>

<h4>Real-Life Example:</h4>
• A text editor's <b>Undo</b> feature - each save point remembers the document's exact content.<br>
• A video game's <b>checkpoint/save</b> system - restoring a saved game returns the world to that exact state.<br><br>

<h4>Why do we need Memento?</h4>
• To implement undo/redo without exposing an object's private internals to whoever manages the history.<br>
• To let an object's state be saved and restored while keeping that state's representation private to the object itself.<br><br>

<h4>The Three Roles</h4>
• <b>Originator</b> - the object whose state is being saved; creates a Memento and can restore itself from one.<br>
• <b>Memento</b> - an immutable snapshot of the Originator's state at a point in time.<br>
• <b>Caretaker</b> - stores Mementos (e.g. in a stack/history) but never looks inside them - it just hands them back to the Originator when asked.<br>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

import java.util.ArrayDeque;
import java.util.Deque;

// Memento - immutable state snapshot
class EditorMemento {
    private final String content;
    EditorMemento(String content) { this.content = content; }
    String getContent() { return content; } // only the Originator reads this
}

// Originator - creates and restores from Mementos
class TextEditor {
    private String content = "";

    void write(String text) { content += text; }
    String getContent() { return content; }

    EditorMemento save() { return new EditorMemento(content); }
    void restore(EditorMemento m) { this.content = m.getContent(); }
}

// Caretaker - stores Mementos without inspecting them
class History {
    private final Deque<EditorMemento> stack = new ArrayDeque<>();
    void push(EditorMemento m) { stack.push(m); }
    EditorMemento pop() { return stack.pop(); }
}

public class MementoDemo {
    public static void main(String[] args) {
        TextEditor editor = new TextEditor();
        History history = new History();

        editor.write("Hello");
        history.push(editor.save());          // snapshot: "Hello"

        editor.write(", World");
        history.push(editor.save());          // snapshot: "Hello, World"

        editor.write("!!!");
        System.out.println("Current: " + editor.getContent());

        editor.restore(history.pop());        // undo to last save point
        System.out.println("After undo: " + editor.getContent());

        editor.restore(history.pop());        // undo again
        System.out.println("After undo again: " + editor.getContent());
    }
}
// OUTPUT:
// Current: Hello, World!!!
// After undo: Hello, World
// After undo again: Hello`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Why Encapsulation Is Preserved</h3>
The <code>EditorMemento</code>'s state is only readable by the <code>TextEditor</code> (Originator) that created it - the <code>History</code> (Caretaker) only ever calls <code>push()</code>/<code>pop()</code> and never touches <code>getContent()</code> itself. This is the entire point of the pattern: the Caretaker can manage <i>when</i> to save/restore without ever knowing <i>what</i> is being saved.<br><br>
In stricter designs, the Memento class is made a private inner class of the Originator, or its state-reading method is package-private - so only the Originator's own package can access it at all.<br>`
                            },
                            {
                                content: `<h3>Memento vs Command Pattern</h3>
Both patterns are commonly used to implement undo, but they capture different things:<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Memento</th><th>Command</th></tr>
<tr class='text-center'><td>What it stores</td><td>A snapshot of state (data)</td><td>An action/request (behavior), sometimes with its inverse</td></tr>
<tr class='text-center'><td>Undo mechanism</td><td>Restore a previous snapshot directly</td><td>Execute a stored "undo" operation, or re-derive the prior state</td></tr>
<tr class='text-center'><td>Best fit</td><td>State is small/cheap to snapshot wholesale</td><td>Operations are naturally reversible (e.g. insert -&gt; delete)</td></tr>
</table>
<br>
In real editors, the two are often combined: a Command represents "what the user did," while a Memento captures the state needed to reverse it cleanly.<br>`
                            },
                            {
                                content: `<h3>The Memory Cost Tradeoff</h3>
Storing a full snapshot on every change can get expensive for large objects. Real systems mitigate this by:<br>
• Storing <b>diffs/deltas</b> instead of full copies where possible.<br>
• Capping the undo history depth (discarding the oldest Mementos).<br>
• Using structural sharing (immutable data structures) so unrelated parts of the state aren't duplicated.<br><br>

<h4>Common Mistakes</h4>
• Letting the Caretaker read or mutate a Memento's internal fields - defeats the whole purpose of the pattern.<br>
• Making Memento mutable - a later change to the "saved" state would corrupt every restore point that shares it.<br>
• Snapshotting far more state than is actually needed to restore correctly.<br><br>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Memento solve?</td><td>Capturing and restoring an object's internal state (for undo/checkpoints) without exposing that state's internal representation to outside code</td></tr>
<tr class='text-center'><td>What are the three roles in Memento?</td><td>Originator (owns the state, creates/restores Mementos), Memento (the immutable snapshot), Caretaker (stores Mementos without inspecting them)</td></tr>
<tr class='text-center'><td>How does Memento preserve encapsulation?</td><td>Only the Originator can read a Memento's internal state; the Caretaker just stores and returns opaque Memento objects</td></tr>
<tr class='text-center'><td>Memento vs Command for undo?</td><td>Memento restores by replacing state with a saved snapshot; Command undoes by executing a stored reverse operation - they're often combined</td></tr>
<tr class='text-center'><td>What's the main downside of Memento?</td><td>Memory cost - storing many full-state snapshots can be expensive, mitigated with diffs or a capped history size</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: 'state-pattern',
                        name: 'State Pattern',
                        beginner: [
                            {
                                content: `<h4>What is State Pattern?</h4>
State Pattern lets an object change its <b>behavior</b> when its internal state changes - it looks to the outside world as if the object changed its class.<br><br>

<h4>Real-Life Example:</h4>
• A <b>Traffic Light</b> - behaves differently in Red, Yellow, and Green states.<br>
• An <b>ATM Machine</b> - behaves differently when a card is inserted vs when it isn't.<br>
• A <b>Media Player</b> - Play, Pause, and Stop states each respond differently to the same button presses.<br><br>

<h4>Why do we need State Pattern?</h4>
• Avoids huge if-else/switch blocks that branch on the current state everywhere in the code.<br>
• Each state's behavior lives in its own dedicated class, instead of being scattered.<br>
• New states can be added without touching any existing state class.<br><br>

<h4>Basic Structure</h4>
• Step 1 - Create a <code>State</code> interface.<br>
• Step 2 - Create concrete state classes implementing it.<br>
• Step 3 - Create a <code>Context</code> class that holds a reference to the current state.<br>
• Step 4 - The Context delegates behavior to whichever state object it currently holds.<br>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Step 1: State interface
interface ATMState {
    void insertCard(ATMMachine atm);
    void ejectCard(ATMMachine atm);
    void requestCash(ATMMachine atm, int amount);
}

// Step 2: Concrete states
class NoCardState implements ATMState {
    public void insertCard(ATMMachine atm) {
        System.out.println("Card Inserted");
        atm.setState(atm.getHasCardState());
    }
    public void ejectCard(ATMMachine atm) {
        System.out.println("No card to eject");
    }
    public void requestCash(ATMMachine atm, int amount) {
        System.out.println("Insert card first");
    }
}

class HasCardState implements ATMState {
    public void insertCard(ATMMachine atm) {
        System.out.println("Card already inserted");
    }
    public void ejectCard(ATMMachine atm) {
        System.out.println("Card Ejected");
        atm.setState(atm.getNoCardState());
    }
    public void requestCash(ATMMachine atm, int amount) {
        System.out.println("Dispensing Rs." + amount);
        atm.setState(atm.getNoCardState());
    }
}

// Step 3: Context class
class ATMMachine {
    private final ATMState hasCardState = new HasCardState();
    private final ATMState noCardState = new NoCardState();
    private ATMState currentState = noCardState;

    public void setState(ATMState state) { this.currentState = state; }
    public ATMState getHasCardState() { return hasCardState; }
    public ATMState getNoCardState() { return noCardState; }

    // Step 4: Delegate to current state
    public void insertCard() { currentState.insertCard(this); }
    public void ejectCard() { currentState.ejectCard(this); }
    public void requestCash(int amount) { currentState.requestCash(this, amount); }
}

public class StateDemo {
    public static void main(String[] args) {
        ATMMachine atm = new ATMMachine();
        atm.requestCash(500);
        atm.insertCard();
        atm.requestCash(500);
    }
}
// OUTPUT:
// Insert card first
// Card Inserted
// Dispensing Rs.500`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>State vs Strategy Pattern</h3>
State and Strategy look structurally identical (both plug an interface implementation into a context), but their <b>intent</b> differs:<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>State</th><th>Strategy</th></tr>
<tr class='text-center'><td>Intent</td><td>Object changes behavior as its internal state changes</td><td>Client chooses which algorithm to use</td></tr>
<tr class='text-center'><td>Who switches implementation</td><td>The state objects themselves (self-transition)</td><td>The client, from outside</td></tr>
<tr class='text-center'><td>Awareness</td><td>States often know about each other / the next state</td><td>Strategies are independent, unaware of each other</td></tr>
<tr class='text-center'><td>Example</td><td>ATM, Traffic Light, Order status</td><td>Comparator, Sorting algorithm, Payment method</td></tr>
</table>`
                            },
                            {
                                content: `<h3>Thread Lifecycle - A Real JDK Example of State</h3>
Java's <code>Thread</code> class is a great real-world analogy for the State pattern. A thread moves through states - <code>NEW</code>, <code>RUNNABLE</code>, <code>BLOCKED</code>, <code>WAITING</code>, <code>TIMED_WAITING</code>, <code>TERMINATED</code> - and its allowed operations change depending on which state it's in, exactly like the ATM example.<br>
• <code>Thread.State</code> enum represents the current state.<br>
• The JVM internally manages transitions (you can't call <code>start()</code> twice, for example).<br>
• The behavior of <code>join()</code>/<code>interrupt()</code> differs depending on the current state.<br>`,
                                codeExamples: [
                                    `Thread t = new Thread(() -> {
    try { Thread.sleep(1000); } catch (InterruptedException e) {}
});
System.out.println(t.getState()); // NEW
t.start();
System.out.println(t.getState()); // RUNNABLE or TIMED_WAITING`
                                ]
                            },
                            {
                                content: `<h3>State Machine Libraries</h3>
For complex workflows (order processing, approval flows), hand-rolled State pattern classes can get unwieldy. Real projects often use dedicated state machine libraries instead:<br>
• <b>Spring Statemachine</b> - declarative state/transition configuration for Spring apps.<br>
• <b>Squirrel State Machine</b> - a lightweight Java state machine library.<br>
• <b>Enum-based state machines</b> - using an <code>EnumMap</code> of allowed transitions.<br><br>

<h4>Common Mistakes</h4>
• Putting transition logic in the Context instead of the State classes.<br>
• Creating a new state object on every call instead of reusing singletons (as the ATM example does with <code>hasCardState</code>/<code>noCardState</code>).<br>
• Forgetting to guard illegal transitions (e.g. requesting cash with no card inserted).<br><br>

<h4>When NOT to Use State Pattern</h4>
• When there are only 2-3 simple states with trivial behavior - a simple flag/if-else may be enough.<br>
• When states never change behavior, only data.<br><br>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does State solve?</td><td>Avoids scattered if-else/switch blocks by giving each state its own class, so an object's behavior changes cleanly as its state changes</td></tr>
<tr class='text-center'><td>State vs Strategy - what's the real difference?</td><td>Same structure, different intent: State changes behavior driven by internal state transitions; Strategy lets the client pick an algorithm from outside</td></tr>
<tr class='text-center'><td>Who triggers a state transition?</td><td>Typically the state objects themselves, by calling setState() on the context after handling a request</td></tr>
<tr class='text-center'><td>Give a real JDK example of the State pattern idea.</td><td>Thread's lifecycle states (NEW, RUNNABLE, BLOCKED, WAITING, TERMINATED) - allowed operations differ per state</td></tr>
<tr class='text-center'><td>When should you avoid the State pattern?</td><td>When there are only a couple of trivial states - a simple boolean/if-else is simpler and avoids unnecessary classes</td></tr>
</table>`
                            }
                        ]
                    },

                    {
                        id: 'visitor-pattern',
                        name: 'Visitor Pattern',
                        beginner: [
                            {
                                content: `<h4>What is Visitor Pattern?</h4>
Visitor Pattern lets you add <b>new operations</b> to a group of classes without modifying those classes themselves.<br><br>

<h4>Real-Life Example:</h4>
• A <b>Tax Auditor</b> - visits different account types (Savings, Current) and applies different rules to each, without the account classes knowing anything about tax rules.<br>
• A <b>Shopping Cart discount calculator</b> - "visits" different item types (Book, Electronics) and applies different discount logic per type.<br><br>

<h4>Why do we need it?</h4>
• Adding a new operation normally means modifying every element class to support it.<br>
• Visitor moves that operation's logic into a separate Visitor class instead.<br>
• Keeps the element classes stable while the set of operations can keep growing.<br><br>

<h4>Basic Structure</h4>
• Step 1 - Create a <code>Visitor</code> interface with a <code>visit()</code> method overloaded for each element type.<br>
• Step 2 - Each element class implements <code>accept(Visitor v)</code>.<br>
• Step 3 - <code>accept()</code> calls back <code>visitor.visit(this)</code> - this is <b>double dispatch</b>.<br>
• Step 4 - A concrete Visitor implements the actual logic for each element type.<br>`,
                                codeExamples: [
                                    `package com.javaschoollab.demo;

// Step 2: Element interface
interface Item {
    void accept(Visitor visitor);
}

class Book implements Item {
    private double price;
    public Book(double price) { this.price = price; }
    public double getPrice() { return price; }
    public void accept(Visitor visitor) { visitor.visit(this); } // Step 3: double dispatch
}

class Electronics implements Item {
    private double price;
    public Electronics(double price) { this.price = price; }
    public double getPrice() { return price; }
    public void accept(Visitor visitor) { visitor.visit(this); } // Step 3: double dispatch
}

// Step 1: Visitor interface
interface Visitor {
    void visit(Book book);
    void visit(Electronics electronics);
}

// Step 4: Concrete Visitor
class PriceVisitor implements Visitor {
    private double total = 0;

    public void visit(Book book) {
        total += book.getPrice(); // no tax on books
        System.out.println("Book price: " + book.getPrice());
    }

    public void visit(Electronics electronics) {
        double priceWithTax = electronics.getPrice() * 1.18; // 18% tax
        total += priceWithTax;
        System.out.println("Electronics price with tax: " + priceWithTax);
    }

    public double getTotal() { return total; }
}

public class VisitorDemo {
    public static void main(String[] args) {
        Item[] items = { new Book(500), new Electronics(1000) };

        PriceVisitor visitor = new PriceVisitor();
        for (Item item : items) {
            item.accept(visitor);
        }

        System.out.println("Total: " + visitor.getTotal());
    }
}
// OUTPUT:
// Book price: 500.0
// Electronics price with tax: 1180.0
// Total: 1680.0`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `<h3>Double Dispatch Explained</h3>
Java method overloading is resolved at compile time based on the <b>static type</b> of the argument - normally just single dispatch on the object a method is called on. Visitor Pattern achieves <b>double dispatch</b> - the method actually invoked depends on BOTH the runtime type of the element AND the runtime type of the visitor.<br>
• First dispatch - <code>item.accept(visitor)</code> resolves by the actual runtime type of <code>item</code> (Book or Electronics).<br>
• Second dispatch - inside <code>accept()</code>, <code>visitor.visit(this)</code> now has a compile-time-known static type for <code>this</code> (Book or Electronics), so the correct overloaded <code>visit()</code> is picked.<br>
• This two-step trick is how Visitor simulates polymorphic dispatch based on two objects instead of one.<br>`
                            },
                            {
                                content: `<h3>Open/Closed Principle - Adding Operations Without Modifying Classes</h3>
To add a new operation (e.g. a <code>DiscountVisitor</code>), you simply create a new class implementing <code>Visitor</code>. The <code>Book</code> and <code>Electronics</code> classes are never touched again - this satisfies the Open/Closed Principle perfectly for adding new <b>operations</b>.<br>`,
                                codeExamples: [
                                    `class DiscountVisitor implements Visitor {
    public void visit(Book book) {
        System.out.println("10% discount on book");
    }
    public void visit(Electronics electronics) {
        System.out.println("5% discount on electronics");
    }
}
// Book and Electronics classes were NOT modified to add this new operation`
                                ]
                            },
                            {
                                content: `<h3>The Tradeoff - Adding New Element Types Is Expensive</h3>
Visitor Pattern flips the usual extensibility tradeoff:<br>
• Easy - adding new <b>operations</b> (just write a new Visitor implementation).<br>
• Hard - adding new <b>element types</b> (e.g. a <code>Furniture</code> class) requires adding a new <code>visit(Furniture)</code> method to the <code>Visitor</code> interface AND to every existing concrete visitor.<br><br>
So Visitor is best used when the set of element classes is stable/rarely changes, but the set of operations performed on them grows frequently.<br><br>

<h4>Real Use - Abstract Syntax Trees (AST) / Compiler Design</h4>
• Compilers represent source code as an AST with node types like <code>BinaryExpr</code>, <code>IfStatement</code>, <code>MethodDecl</code>.<br>
• Different phases (type checking, optimization, code generation, pretty-printing) are each implemented as a separate Visitor over the same fixed set of AST node types.<br>
• This keeps each compiler phase in its own class instead of scattering logic across every node class.<br><br>

<h4>Common Mistakes</h4>
• Using Visitor when element types change frequently (causes cascading interface changes across every visitor).<br>
• Forgetting to implement <code>accept()</code> consistently on every element subclass.<br>
• Putting mutable state inside the Visitor without resetting it between traversals.<br><br>

<h4>Visitor vs Iterator</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Visitor</th><th>Iterator</th></tr>
<tr class='text-center'><td>Purpose</td><td>Perform a type-specific operation on each element</td><td>Sequentially traverse elements without exposing structure</td></tr>
<tr class='text-center'><td>Adds new behavior?</td><td>Yes, via new visitor classes</td><td>No, only traversal</td></tr>
<tr class='text-center'><td>Element type awareness</td><td>Visitor is aware of every concrete element type</td><td>Iterator is unaware of element types, it just returns items</td></tr>
</table>
<br>

<h4>When NOT to Use Visitor</h4>
• When the class hierarchy of elements changes often.<br>
• When there's only one operation ever needed - a simple method on the class is simpler.<br>
• When the double-dispatch complexity isn't worth it for a small, stable set of operations.<br><br>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Visitor solve?</td><td>Lets you add new operations to a fixed set of element classes without modifying those classes</td></tr>
<tr class='text-center'><td>What is double dispatch?</td><td>Method selection based on the runtime types of TWO objects (the element and the visitor) instead of just one, achieved via accept()/visit() calling each other</td></tr>
<tr class='text-center'><td>What's the main tradeoff of Visitor?</td><td>Adding new operations is easy (new Visitor class); adding new element types is hard (must update the Visitor interface and every existing visitor)</td></tr>
<tr class='text-center'><td>Where is Visitor commonly used in real systems?</td><td>Compilers/interpreters operating on an Abstract Syntax Tree, where each compiler phase is a separate Visitor</td></tr>
<tr class='text-center'><td>Visitor vs Iterator - what's the difference?</td><td>Iterator just traverses elements without adding behavior; Visitor performs a type-specific operation on each element it visits</td></tr>
</table>`
                            }
                        ]
                    }
                ]
            },

        ],

        cheatNotes: [

            // ===== Design Pattern Fundamentals =====
            "Design pattern - Proven, reusable solution to a common software design problem.",
            "Gang of Four (GoF) - 23 classic design patterns grouped into 3 categories.",
            "3 categories - Creational, Structural, and Behavioral patterns.",
            "SRP - Single Responsibility: a class should have only one reason to change.",
            "OCP - Open/Closed: open for extension, closed for modification.",
            "LSP - Liskov Substitution: subtypes must be substitutable for base types.",
            "ISP - Interface Segregation: prefer many small interfaces over one large one.",
            "DIP - Dependency Inversion: depend on abstractions, not concrete classes.",

            // ===== Creational Patterns =====
            "Creational patterns deal with object creation mechanisms.",
            "Singleton - Ensures only ONE instance of a class exists globally.",
            "Singleton: constructor must be private; expose static getInstance().",
            "Eager initialization - Creates the singleton instance at class loading time.",
            "Lazy initialization - Creates the instance only when first requested.",
            "Double-checked locking - Thread-safe lazy singleton with minimal synchronization.",
            "Bill Pugh Singleton - Uses a static inner holder class for lazy, thread-safe init.",
            "Enum Singleton - Most secure form, immune to reflection and serialization attacks.",
            "Override readResolve()/clone() to prevent breaking Singleton via serialization/cloning.",
            "Factory Method - Delegates object creation to subclasses via a factory method.",
            "Abstract Factory - Creates families of related objects without specifying concrete classes.",
            "Builder - Constructs complex objects step-by-step, separating construction from representation.",
            "Prototype - Creates new objects by cloning an existing instance.",
            "Object Pool - Reuses expensive objects from a pool instead of recreating them.",
            "Spring BeanFactory/ApplicationContext - Real-world Factory + Singleton usage.",

            // ===== Structural Patterns =====
            "Structural patterns deal with composing classes/objects into larger structures.",
            "Adapter - Converts one interface into another expected by the client.",
            "Decorator - Adds new behavior to an object dynamically without altering its class.",
            "Facade - Provides a simplified unified interface to a complex subsystem.",
            "Proxy - Provides a placeholder/surrogate to control access to another object.",
            "Composite - Composes objects into tree structures for part-whole hierarchies.",
            "Bridge - Decouples abstraction from implementation so both can vary independently.",
            "Flyweight - Shares common state across many objects to save memory.",
            "java.io.BufferedReader wrapping Reader is a real-world Decorator example.",

            // ===== Behavioral Patterns =====
            "Behavioral patterns deal with communication and responsibility between objects.",
            "Observer - Notifies dependent objects automatically when subject state changes.",
            "Strategy - Encapsulates interchangeable algorithms, selected at runtime.",
            "Command - Encapsulates a request as an object, enabling undo/queueing.",
            "Iterator - Provides sequential access to elements without exposing internals.",
            "Template Method - Defines an algorithm skeleton, letting subclasses override steps.",
            "State - Allows an object to alter behavior when its internal state changes.",
            "Chain of Responsibility - Passes a request along a chain of handlers.",
            "Mediator - Centralizes complex communication between a set of objects.",
            "Visitor - Separates an algorithm from the object structure it operates on.",
            "java.util.Comparator is a real-world Strategy pattern example.",
            "Java Collections' Iterator interface is a real-world Iterator pattern example.",

            // ===== Practical Guidance =====
            "Avoid large if-else/switch blocks in factories using a Registry Pattern (Map).",
            "Reflection-based factory enables dynamic object creation from class names.",
            "Prefer composition over inheritance when applying Structural/Behavioral patterns.",
            "Overusing patterns adds needless complexity - apply only when the problem fits."
        ],

        interviewQuestions: [

            {
                company: "TCS / Infosys / Wipro",
                questions: [
                    "What is Singleton Pattern?",
                    "What is Factory Design Pattern?",
                    "Why constructor is private in Singleton?",
                    "Give real-time example of both patterns.",
                    "Are Singleton and Factory Creational patterns?"
                ]
            },

            {
                company: "Accenture / Cognizant",
                questions: [
                    "How to make Singleton thread-safe?",
                    "What is Double Checked Locking?",
                    "How does Factory promote loose coupling?",
                    "Difference between Factory and Abstract Factory?",
                    "Can Factory and Singleton be combined?"
                ]
            },

            {
                company: "Capgemini / HCL / Tech Mahindra",
                questions: [
                    "How to prevent Singleton from Serialization breaking?",
                    "How to prevent cloning in Singleton?",
                    "How to remove if-else from Factory?",
                    "Factory vs Strategy Pattern?",
                    "Advantages and disadvantages of both patterns?"
                ]
            },

            {
                company: "Product Based Companies",
                questions: [
                    "Explain Bill Pugh Singleton implementation.",
                    "How Reflection can break Singleton?",
                    "Design Payment system using Factory.",
                    "Explain Registry-based Factory.",
                    "Singleton vs Dependency Injection?"
                ]
            },

            {
                company: "FAANG Level",
                questions: [
                    "Design scalable thread-safe Singleton.",
                    "Implement dynamic Factory using Reflection.",
                    "How Singleton violates SOLID principles?",
                    "Factory Pattern in Microservices architecture?",
                    "Design pluggable system using Factory Pattern."
                ]
            }

        ]
    }
]
