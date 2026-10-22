import type { TopicExtra } from './courseMerges';
import { blk } from './jsRoadmapKit';

const singletonExtra: TopicExtra = {
    beginner: [
        blk(`<div style="border-left:4px solid #0d9488;padding:8px 12px;background:rgba(13,148,136,0.08)">
<h4>In one minute</h4>
<p>A <b>Singleton</b> is a class that allows <b>exactly one object</b> to exist, and gives everybody the same <b>global access point</b> to it. You hide the constructor (<b>private constructor</b>), keep the single object in a <b>static field</b>, and hand it out through a <b>getInstance()</b> method. Whoever asks gets the same object.</p>
</div>
<h4>Real-life analogies</h4>
<ul>
<li><b>The Principal of a school:</b> many students, one principal. Anyone who says "the principal" means the same person.</li>
<li><b>The ticket window of a fort:</b> if every visitor opened a new window, the counts would never add up. One window keeps one running total.</li>
<li><b>The national flag at the Red Fort:</b> there is one flag on the mast; everybody looks at the same one.</li>
</ul>
<h4>Where you see it in Java, the JDK and Spring</h4>
<ul>
<li><code>java.lang.Runtime.getRuntime()</code> always returns the same Runtime object of the JVM.</li>
<li><code>java.awt.Desktop.getDesktop()</code> and <code>java.lang.System</code> (static, one per JVM).</li>
<li><b>Spring beans</b> are <b>singleton scoped</b> by default: one object per ApplicationContext (managed by the container, not by a private constructor).</li>
<li>Logger factories such as <code>LogManager</code> and enum constants are one-instance-per-JVM by design.</li>
</ul>
<h4>Structure (text diagram)</h4>
<pre>
+--------------------------------+
|           Singleton            |
+--------------------------------+
| - instance : Singleton  (static)|
| - Singleton()           (private)|
+--------------------------------+
| + getInstance() : Singleton    |
+--------------------------------+
      ^           ^           ^
      |           |           |
   Client A    Client B    Client C   --> all receive the SAME object
</pre>
<h4>When to use</h4>
<ul>
<li>Exactly one object is a business rule: configuration, logger, cache, connection pool, ticket counter.</li>
<li>The object is expensive to build and safe to share.</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>When you only want "easy access to something" - a global variable in disguise hurts testing.</li>
<li>When the object holds per-user or per-request data (it would be shared by everyone).</li>
<li>When you can simply pass the object as a constructor argument (dependency injection).</li>
</ul>`),
        blk(`<h4>Sample 1 - An app settings holder (eager singleton)</h4>
<p>This version creates the object <b>eagerly</b>, when the class loads. It is the simplest thread-safe form because the JVM guarantees class loading happens once. Notice the <code>==</code> check: both variables point to the very same object.</p>`,
            `// Eager singleton: settings of a fort-tour app
public class SingletonSettingsDemo {

    public static void main(String[] args) {
        AppSettings first = AppSettings.getInstance();
        AppSettings second = AppSettings.getInstance();

        first.setCity("Jaipur");

        System.out.println("Second sees city = " + second.getCity());
        System.out.println("Same object? " + (first == second));
    }
}

class AppSettings {

    // created once, when the class is loaded
    private static final AppSettings INSTANCE = new AppSettings();

    private String city = "Delhi";

    private AppSettings() {
        System.out.println("AppSettings created");
    }

    public static AppSettings getInstance() {
        return INSTANCE;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }
}
// OUTPUT:
// AppSettings created
// Second sees city = Jaipur
// Same object? true`),
        blk(`<h4>Sample 2 - A visitor counter shared by two gates</h4>
<p>Two different parts of the program (the "gates") never see each other, yet the total is correct because both talk to the one counter. This is the classic reason to use a Singleton. This version is <b>lazy</b>: the object is created on the first call, and <code>synchronized</code> keeps it safe.</p>`,
            `// Lazy singleton: one counter used by two gates
public class SingletonCounterDemo {

    public static void main(String[] args) {
        Gate eastGate = new Gate("East Gate");
        Gate westGate = new Gate("West Gate");

        eastGate.enter(3);
        westGate.enter(2);
        eastGate.enter(1);

        System.out.println("Total visitors = " + VisitorCounter.getInstance().getTotal());
    }
}

class VisitorCounter {

    private static VisitorCounter instance;

    private int total;

    private VisitorCounter() {
    }

    // synchronized: only one thread can create the object
    public static synchronized VisitorCounter getInstance() {
        if (instance == null) {
            instance = new VisitorCounter();
        }
        return instance;
    }

    public void add(int count) {
        total += count;
    }

    public int getTotal() {
        return total;
    }
}

class Gate {

    private final String name;

    Gate(String name) {
        this.name = name;
    }

    void enter(int visitors) {
        VisitorCounter.getInstance().add(visitors);
        System.out.println(name + " let in " + visitors);
    }
}
// OUTPUT:
// East Gate let in 3
// West Gate let in 2
// East Gate let in 1
// Total visitors = 6`)
    ],
    intermediate: [
        blk(`<h4>Variant 1 - Enum singleton</h4>
<p><b>What it shows:</b> a singleton written as an <b>enum</b> with one constant. <b>Why:</b> the JVM guarantees one instance, it is thread-safe, and it is immune to reflection and serialization attacks. Joshua Bloch calls this the best way to write a singleton in Java.</p>`,
            `// Enum singleton: simplest and safest form
public class SingletonEnumDemo {

    public static void main(String[] args) {
        CityRegistry.INSTANCE.register("Agra");
        CityRegistry.INSTANCE.register("Udaipur");

        CityRegistry other = CityRegistry.INSTANCE;
        other.register("Jodhpur");

        System.out.println("Cities = " + CityRegistry.INSTANCE.getCities());
        System.out.println("Same? " + (other == CityRegistry.INSTANCE));
    }
}

enum CityRegistry {

    INSTANCE;

    private final java.util.List<String> cities = new java.util.ArrayList<>();

    public void register(String city) {
        cities.add(city);
    }

    public java.util.List<String> getCities() {
        return cities;
    }
}
// OUTPUT:
// Cities = [Agra, Udaipur, Jodhpur]
// Same? true`),
        blk(`<h4>Variant 2 - Initialization-on-demand holder idiom</h4>
<p><b>What it shows:</b> a lazy singleton with <b>no synchronized</b> and no volatile. <b>Why:</b> the inner <code>Holder</code> class is loaded only when <code>getInstance()</code> is first called, and the JVM runs class initialisation exactly once and thread-safely. You get laziness and speed together.</p>`,
            `// Holder idiom: lazy and thread-safe without locks
public class SingletonHolderDemo {

    public static void main(String[] args) {
        System.out.println("Program started");

        PriceList list = PriceList.getInstance();
        System.out.println("Ticket price = " + list.priceOf("Amber Fort"));
        System.out.println("Same? " + (list == PriceList.getInstance()));
    }
}

class PriceList {

    private final java.util.Map<String, Integer> prices = new java.util.HashMap<>();

    private PriceList() {
        System.out.println("PriceList loading...");
        prices.put("Amber Fort", 100);
        prices.put("Red Fort", 35);
    }

    // not loaded until getInstance() is called
    private static class Holder {
        private static final PriceList INSTANCE = new PriceList();
    }

    public static PriceList getInstance() {
        return Holder.INSTANCE;
    }

    public int priceOf(String monument) {
        return prices.getOrDefault(monument, 0);
    }
}
// OUTPUT:
// Program started
// PriceList loading...
// Ticket price = 100
// Same? true`),
        blk(`<h4>Variant 3 - Double-checked locking with volatile</h4>
<p><b>What it shows:</b> a lazy singleton that locks only while the object does not exist yet. <b>Why <code>volatile</code>:</b> without it, another thread may see a half-constructed object because of instruction reordering. Four threads race here, but only one object is built.</p>`,
            `// Double-checked locking: volatile is mandatory
public class SingletonDclDemo {

    public static void main(String[] args) throws InterruptedException {
        Thread[] workers = new Thread[4];

        for (int i = 0; i < workers.length; i++) {
            workers[i] = new Thread(() -> TicketPrinter.getInstance());
            workers[i].start();
        }

        for (Thread worker : workers) {
            worker.join();
        }

        System.out.println("Objects created = " + TicketPrinter.getCreated());
    }
}

class TicketPrinter {

    private static volatile TicketPrinter instance;

    private static int created;

    private TicketPrinter() {
        created++;
    }

    public static TicketPrinter getInstance() {
        if (instance == null) {                    // 1st check: no lock
            synchronized (TicketPrinter.class) {
                if (instance == null) {            // 2nd check: with lock
                    instance = new TicketPrinter();
                }
            }
        }
        return instance;
    }

    public static int getCreated() {
        return created;
    }
}
// OUTPUT:
// Objects created = 1`),
        blk(`<h4>Variant 4 - Singleton registry (one instance per key)</h4>
<p><b>What it shows:</b> a registry that keeps one object per name, created on demand. <b>Why:</b> sometimes you need "one per city" or "one per tenant", not one for the whole JVM. <code>computeIfAbsent</code> gives atomic creation.</p>`,
            `// Registry: one instance per key
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class SingletonRegistryDemo {

    public static void main(String[] args) {
        CityOffice pune1 = CityOffice.of("Pune");
        CityOffice pune2 = CityOffice.of("Pune");
        CityOffice nashik = CityOffice.of("Nashik");

        System.out.println("Pune same object? " + (pune1 == pune2));
        System.out.println("Pune vs Nashik same? " + (pune1 == nashik));
        System.out.println("Offices created = " + CityOffice.count());
    }
}

class CityOffice {

    private static final Map<String, CityOffice> OFFICES = new ConcurrentHashMap<>();

    private final String city;

    private CityOffice(String city) {
        this.city = city;
        System.out.println("Opening office in " + city);
    }

    public static CityOffice of(String city) {
        return OFFICES.computeIfAbsent(city, CityOffice::new);
    }

    public static int count() {
        return OFFICES.size();
    }

    public String getCity() {
        return city;
    }
}
// OUTPUT:
// Opening office in Pune
// Opening office in Nashik
// Pune same object? true
// Pune vs Nashik same? false
// Offices created = 2`),
        blk(`<h4>Variant 5 - Surviving serialization with readResolve</h4>
<p><b>What it shows:</b> deserializing a singleton normally creates a <b>second object</b>. <b>Why <code>readResolve()</code>:</b> it lets you replace the freshly read object with the real singleton. (An enum does this for free.)</p>`,
            `// Serialization can break a singleton; readResolve repairs it
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

public class SingletonSerialDemo {

    public static void main(String[] args) throws Exception {
        Treasury original = Treasury.getInstance();

        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(original);
        }

        Treasury copy;
        try (ObjectInputStream in = new ObjectInputStream(
                new ByteArrayInputStream(bytes.toByteArray()))) {
            copy = (Treasury) in.readObject();
        }

        System.out.println("Same after deserialization? " + (original == copy));
    }
}

class Treasury implements Serializable {

    private static final Treasury INSTANCE = new Treasury();

    private Treasury() {
    }

    public static Treasury getInstance() {
        return INSTANCE;
    }

    // called after reading: return the real singleton
    private Object readResolve() {
        return INSTANCE;
    }
}
// OUTPUT:
// Same after deserialization? true`),
        blk(`<h4>Common mistakes and how to avoid them</h4>
<ul>
<li><b>Lazy getInstance() without synchronization:</b> two threads can both see null and build two objects. Use the holder idiom, an enum, or synchronized.</li>
<li><b>Double-checked locking without volatile:</b> a thread may read a partly built object. Always declare the field <code>volatile</code>.</li>
<li><b>Mutable shared state with no protection:</b> one instance does not make its fields thread-safe. Guard them or use concurrent collections.</li>
<li><b>Forgetting reflection and serialization:</b> both can create a second object. Prefer an enum, or add <code>readResolve()</code> and throw from the constructor if the instance exists.</li>
<li><b>Hidden dependencies:</b> calling <code>X.getInstance()</code> everywhere makes classes hard to unit-test. Inject it through a constructor instead.</li>
</ul>
<h4>Singleton vs Static class (comparison)</h4>
<table border="1" cellpadding="6" style="border-collapse:collapse">
<tr><th>Point</th><th>Singleton</th><th>Static utility class</th></tr>
<tr><td>Object exists?</td><td>Yes, one object</td><td>No object, only static methods</td></tr>
<tr><td>Implements interface / inheritance</td><td>Yes</td><td>No</td></tr>
<tr><td>Lazy initialisation</td><td>Possible</td><td>Loaded with the class</td></tr>
<tr><td>Can hold state per object</td><td>Yes</td><td>Only static state</td></tr>
<tr><td>Easy to mock in tests</td><td>Yes, if behind an interface</td><td>Hard</td></tr>
</table>`)
    ],
    expert: [
        blk(`<h4>Real-time example 1 - Central logging service</h4>
<p>A logging service is the textbook singleton: every class writes to the same sink, and the order of messages must be preserved. The log method is <b>synchronized</b> so concurrent callers do not interleave. In production you would use SLF4J/Logback, but the shape is identical.</p>`,
            `// Logging service singleton with levels
import java.util.ArrayList;
import java.util.List;

public class SingletonLoggerService {

    public static void main(String[] args) {
        AppLogger log = AppLogger.getInstance();

        log.info("Booking service started");
        new PaymentModule().pay("Rohit", 1500);
        new PaymentModule().pay("Sneha", 0);

        System.out.println("---- log dump ----");
        for (String line : log.getLines()) {
            System.out.println(line);
        }
    }
}

class AppLogger {

    private static final AppLogger INSTANCE = new AppLogger();

    private final List<String> lines = new ArrayList<>();

    private int sequence;

    private AppLogger() {
    }

    public static AppLogger getInstance() {
        return INSTANCE;
    }

    private synchronized void write(String level, String message) {
        sequence++;
        lines.add("#" + sequence + " [" + level + "] " + message);
    }

    public void info(String message) {
        write("INFO", message);
    }

    public void error(String message) {
        write("ERROR", message);
    }

    public List<String> getLines() {
        return new ArrayList<>(lines);
    }
}

class PaymentModule {

    void pay(String customer, int amount) {
        AppLogger log = AppLogger.getInstance();   // same logger everywhere
        if (amount <= 0) {
            log.error("Invalid amount for " + customer);
            return;
        }
        log.info(customer + " paid Rs " + amount);
    }
}
// OUTPUT:
// ---- log dump ----
// #1 [INFO] Booking service started
// #2 [INFO] Rohit paid Rs 1500
// #3 [ERROR] Invalid amount for Sneha`),
        blk(`<h4>Real-time example 2 - Configuration loader</h4>
<p>Configuration is read once at start-up and then shared read-only. Loading in the constructor, making the map unmodifiable, and exposing typed getters keeps the singleton safe to share between threads without any locks.</p>`,
            `// Config loader singleton: read once, share read-only
import java.io.IOException;
import java.io.StringReader;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class SingletonConfigLoaderDemo {

    public static void main(String[] args) {
        AppConfig config = AppConfig.get();

        System.out.println("Fort = " + config.getString("fort.name", "unknown"));
        System.out.println("Max visitors = " + config.getInt("fort.max", 0));
        System.out.println("Missing key = " + config.getString("fort.x", "default-value"));
    }
}

class AppConfig {

    private static final String SOURCE = "fort.name=Kumbhalgarh"
            + System.lineSeparator()
            + "fort.max=5000";

    private final Map<String, String> values;

    private AppConfig() {
        Properties props = new Properties();
        try {
            props.load(new StringReader(SOURCE));
        } catch (IOException e) {
            throw new IllegalStateException("Cannot load config", e);
        }
        Map<String, String> temp = new HashMap<>();
        for (String key : props.stringPropertyNames()) {
            temp.put(key, props.getProperty(key));
        }
        values = Collections.unmodifiableMap(temp);   // read-only after loading
    }

    private static class Holder {
        private static final AppConfig INSTANCE = new AppConfig();
    }

    public static AppConfig get() {
        return Holder.INSTANCE;
    }

    public String getString(String key, String fallback) {
        return values.getOrDefault(key, fallback);
    }

    public int getInt(String key, int fallback) {
        String raw = values.get(key);
        return raw == null ? fallback : Integer.parseInt(raw.trim());
    }
}
// OUTPUT:
// Fort = Kumbhalgarh
// Max visitors = 5000
// Missing key = default-value`),
        blk(`<h4>Sample mini project - Fort ticket booking desk</h4>
<p>One file, several small classes. The <code>TicketDesk</code> singleton issues unique ticket numbers and keeps the day's revenue, while separate <code>Visitor</code> and <code>Ticket</code> objects are ordinary. This is the realistic split: the singleton owns shared state, everything else stays normal.</p>`,
            `// Mini project: ticket desk singleton with revenue report
import java.util.ArrayList;
import java.util.List;

public class SingletonTicketDeskProject {

    public static void main(String[] args) {
        TicketDesk desk = TicketDesk.getInstance();

        desk.sell(new Visitor("Aarav", 12), "Amber Fort");
        desk.sell(new Visitor("Meera", 34), "Amber Fort");
        desk.sell(new Visitor("Kabir", 67), "City Palace");

        desk.printReport();
    }
}

class Visitor {

    final String name;
    final int age;

    Visitor(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

class Ticket {

    final int number;
    final Visitor visitor;
    final String place;
    final int price;

    Ticket(int number, Visitor visitor, String place, int price) {
        this.number = number;
        this.visitor = visitor;
        this.place = place;
        this.price = price;
    }

    @Override
    public String toString() {
        return "T" + number + " " + visitor.name + " -> " + place + " Rs " + price;
    }
}

class TicketDesk {

    private static final TicketDesk INSTANCE = new TicketDesk();

    private final List<Ticket> sold = new ArrayList<>();

    private int nextNumber = 1001;

    private TicketDesk() {
    }

    public static TicketDesk getInstance() {
        return INSTANCE;
    }

    public synchronized Ticket sell(Visitor visitor, String place) {
        int price = priceFor(visitor);
        Ticket ticket = new Ticket(nextNumber++, visitor, place, price);
        sold.add(ticket);
        return ticket;
    }

    private int priceFor(Visitor visitor) {
        if (visitor.age < 15 || visitor.age >= 60) {
            return 50;                              // child / senior discount
        }
        return 100;
    }

    public void printReport() {
        int revenue = 0;
        for (Ticket ticket : sold) {
            System.out.println(ticket);
            revenue += ticket.price;
        }
        System.out.println("Tickets = " + sold.size() + ", revenue = Rs " + revenue);
    }
}
// OUTPUT:
// T1001 Aarav -> Amber Fort Rs 50
// T1002 Meera -> Amber Fort Rs 100
// T1003 Kabir -> City Palace Rs 50
// Tickets = 3, revenue = Rs 200`),
        blk(`<h4>Thread-safety, testing and Spring notes</h4>
<ul>
<li><b>Thread-safety:</b> creation safety (enum, holder, DCL+volatile) is separate from <b>state safety</b>. A singleton that holds a mutable list needs <code>synchronized</code>, locks, or a concurrent collection.</li>
<li><b>Testing:</b> a hard-coded <code>getInstance()</code> call cannot be replaced by a mock. Put an interface in front (<code>Logger</code>), pass it through the constructor, and let only the composition root call <code>getInstance()</code>. If you must reset state in tests, expose a package-private <code>reset()</code>.</li>
<li><b>Spring:</b> the default bean scope is <b>singleton</b>: one instance per container, created by Spring, no private constructor needed. Other scopes are <code>prototype</code>, <code>request</code> and <code>session</code>. Two containers (or class loaders) still give two instances, so "one per JVM" is not guaranteed.</li>
<li><b>Class loaders and clusters:</b> in an application server or a multi-node cluster, "one instance" really means one per class loader / per node. Use a database or a distributed cache for truly global state.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>God singleton:</b> one class that does config, caching, logging and business logic.</li>
<li><b>Global mutable state:</b> any class can change it, so bugs are impossible to trace.</li>
<li><b>Singleton as a service locator:</b> classes pull their dependencies out of thin air, hiding what they need.</li>
<li><b>Lifetime leaks:</b> a singleton that holds references to short-lived objects keeps them from being garbage-collected.</li>
</ul>`)
    ],
    interviewQA: [
        ['Which is the best way to implement a Singleton in Java?', 'An enum with a single constant: the JVM guarantees one instance, it is thread-safe and protects against reflection and serialization. If you need laziness with a normal class, use the initialization-on-demand holder idiom.'],
        ['Why must the instance field be volatile in double-checked locking?', 'Without volatile the JVM may reorder the write of the reference before the constructor finishes, so another thread can see a non-null but half-built object. Volatile forbids that reordering.'],
        ['How can a Singleton be broken, and how do you prevent it?', 'Reflection (setAccessible on the private constructor), serialization/deserialization, cloning, and multiple class loaders. Prevent with an enum, readResolve(), throwing from the constructor when an instance exists, and not implementing Cloneable.'],
        ['What is the difference between a Singleton and a static class?', 'A singleton is a real object: it can implement interfaces, be passed around, be lazy and be mocked. A static class only has static members and cannot be polymorphic.'],
        ['Is a Spring singleton bean the same as the Singleton pattern?', 'No. Spring creates one instance per ApplicationContext and per bean definition; the class itself can still be instantiated elsewhere. The GoF pattern enforces one instance per class loader through the class itself.'],
        ['Why is Singleton often called an anti-pattern?', 'It is global state, it hides dependencies, it makes unit testing difficult and it couples classes to a concrete type. Dependency injection with a singleton-scoped object gives the benefit without the drawbacks.'],
        ['Is the synchronized getInstance() a good solution?', 'It is correct but locks on every call, which costs under heavy contention. The holder idiom or an eagerly created static final instance avoids the lock entirely.']
    ]
};

const factoryExtra: TopicExtra = {
    beginner: [
        blk(`<div style="border-left:4px solid #0d9488;padding:8px 12px;background:rgba(13,148,136,0.08)">
<h4>In one minute</h4>
<p>A <b>Factory</b> is a method (or class) whose only job is to <b>create objects</b> for you. The caller says <i>what</i> it needs ("sms"), the factory decides <i>which class</i> to build and returns it through a common <b>interface</b>. The client never writes <code>new ConcreteClass()</code>, so adding a new type does not change the client code.</p>
</div>
<h4>Real-life analogies</h4>
<ul>
<li><b>A restaurant kitchen:</b> you order "Paneer Tikka"; you do not go into the kitchen and cook it. The kitchen (factory) decides how it is made.</li>
<li><b>A vehicle showroom:</b> you ask for "a scooter" and the showroom hands over a ready vehicle.</li>
<li><b>A courier counter:</b> you say "express" or "normal" and the counter picks the right delivery process.</li>
</ul>
<h4>Where you see it in Java, the JDK and Spring</h4>
<ul>
<li><code>Calendar.getInstance()</code>, <code>NumberFormat.getCurrencyInstance()</code> and <code>LocalDate.of(...)</code> are <b>static factory methods</b>.</li>
<li><code>List.of(...)</code>, <code>Optional.of(...)</code>, <code>Integer.valueOf(...)</code>, <code>Executors.newFixedThreadPool(...)</code>.</li>
<li><code>DocumentBuilderFactory.newInstance()</code> and <code>Connection</code> objects from <code>DriverManager.getConnection()</code>.</li>
<li><b>Spring:</b> <code>BeanFactory</code> / <code>ApplicationContext.getBean()</code> and <code>@Bean</code> methods are factories for objects.</li>
</ul>
<h4>Structure (text diagram)</h4>
<pre>
 Client ---asks "sms"---&gt; NotificationFactory
                               |  decides
                               v
                +-----------------------------+
                | Notification (interface)    |
                +-----------------------------+
                    ^             ^
                    |             |
               EmailNotification  SmsNotification
</pre>
<h4>When to use</h4>
<ul>
<li>The exact class is known only at run time (user choice, config file, request parameter).</li>
<li>Object creation is complicated (many steps, defaults) and you want it in one place.</li>
<li>You want to add new product types without editing the client.</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>There is only one concrete class and no likely second one - a plain <code>new</code> is simpler.</li>
<li>The factory would just forward to a constructor with no decision and no extra logic.</li>
<li>You end up with a giant if-else factory that is edited for every new type (use a registry instead).</li>
</ul>`),
        blk(`<h4>Sample 1 - Notification factory</h4>
<p>The client only knows the <code>Notification</code> interface and a text key. Adding "whatsapp" later means one new class and one new line in the factory; <code>main</code> does not change.</p>`,
            `// Simple factory: choose a notification channel by name
public class FactoryNotificationDemo {

    public static void main(String[] args) {
        String[] channels = {"email", "sms", "push"};

        for (String channel : channels) {
            Notification notification = NotificationFactory.create(channel);
            notification.send("Your fort ticket is confirmed");
        }
    }
}

interface Notification {

    void send(String message);
}

class EmailNotification implements Notification {

    public void send(String message) {
        System.out.println("EMAIL: " + message);
    }
}

class SmsNotification implements Notification {

    public void send(String message) {
        System.out.println("SMS: " + message);
    }
}

class PushNotification implements Notification {

    public void send(String message) {
        System.out.println("PUSH: " + message);
    }
}

class NotificationFactory {

    static Notification create(String channel) {
        switch (channel.toLowerCase()) {
            case "email":
                return new EmailNotification();
            case "sms":
                return new SmsNotification();
            case "push":
                return new PushNotification();
            default:
                throw new IllegalArgumentException("Unknown channel: " + channel);
        }
    }
}
// OUTPUT:
// EMAIL: Your fort ticket is confirmed
// SMS: Your fort ticket is confirmed
// PUSH: Your fort ticket is confirmed`),
        blk(`<h4>Sample 2 - Transport factory with the fare calculated inside the product</h4>
<p>Here every product has behaviour (<code>fare</code>). The caller never needs to know which class computes it - this is the real benefit of returning an interface.</p>`,
            `// Factory returning objects that carry their own behaviour
public class FactoryTransportDemo {

    public static void main(String[] args) {
        int distance = 120;

        String[] modes = {"bus", "train", "taxi"};

        for (String mode : modes) {
            Transport transport = TransportFactory.get(mode);
            System.out.println(transport.name() + " fare for " + distance
                    + " km = Rs " + transport.fare(distance));
        }
    }
}

interface Transport {

    String name();

    int fare(int km);
}

class Bus implements Transport {

    public String name() {
        return "Bus";
    }

    public int fare(int km) {
        return km * 2;
    }
}

class Train implements Transport {

    public String name() {
        return "Train";
    }

    public int fare(int km) {
        return km;
    }
}

class Taxi implements Transport {

    public String name() {
        return "Taxi";
    }

    public int fare(int km) {
        return 50 + km * 12;       // base charge + per km
    }
}

class TransportFactory {

    static Transport get(String mode) {
        if (mode.equals("bus")) {
            return new Bus();
        }
        if (mode.equals("train")) {
            return new Train();
        }
        if (mode.equals("taxi")) {
            return new Taxi();
        }
        throw new IllegalArgumentException("No such transport: " + mode);
    }
}
// OUTPUT:
// Bus fare for 120 km = Rs 240
// Train fare for 120 km = Rs 120
// Taxi fare for 120 km = Rs 1490`)
    ],
    intermediate: [
        blk(`<h4>Variant 1 - Parameterised factory using an enum</h4>
<p><b>What it shows:</b> the factory takes an <b>enum</b> instead of a String. <b>Why:</b> a typo like "smss" becomes a compile error, and a <code>switch</code> over an enum can be checked by the compiler for missing cases.</p>`,
            `// Parameterised factory with an enum key (type-safe)
public class FactoryEnumParamDemo {

    public static void main(String[] args) {
        for (Level level : Level.values()) {
            Ticket ticket = TicketFactory.create(level, "Amber Fort");
            System.out.println(ticket.describe());
        }
    }
}

enum Level {
    GENERAL, VIP, FOREIGNER
}

interface Ticket {

    String describe();
}

class GeneralTicket implements Ticket {

    private final String place;

    GeneralTicket(String place) {
        this.place = place;
    }

    public String describe() {
        return "General ticket for " + place + " : Rs 100";
    }
}

class VipTicket implements Ticket {

    private final String place;

    VipTicket(String place) {
        this.place = place;
    }

    public String describe() {
        return "VIP ticket for " + place + " : Rs 500 + guide";
    }
}

class ForeignerTicket implements Ticket {

    private final String place;

    ForeignerTicket(String place) {
        this.place = place;
    }

    public String describe() {
        return "Foreigner ticket for " + place + " : Rs 550";
    }
}

class TicketFactory {

    static Ticket create(Level level, String place) {
        return switch (level) {                       // compiler checks all cases
            case GENERAL -> new GeneralTicket(place);
            case VIP -> new VipTicket(place);
            case FOREIGNER -> new ForeignerTicket(place);
        };
    }
}
// OUTPUT:
// General ticket for Amber Fort : Rs 100
// VIP ticket for Amber Fort : Rs 500 + guide
// Foreigner ticket for Amber Fort : Rs 550`),
        blk(`<h4>Variant 2 - Factory with a Map registry of Suppliers</h4>
<p><b>What it shows:</b> instead of an if-else chain, a <code>Map&lt;String, Supplier&gt;</code> stores how to build each type. <b>Why:</b> the factory follows the <b>Open/Closed Principle</b>: new types register themselves, the factory code never changes.</p>`,
            `// Registry-based factory: no if-else chain
import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

public class FactoryRegistryDemo {

    public static void main(String[] args) {
        ShapeRegistry.register("circle", Circle::new);
        ShapeRegistry.register("square", Square::new);
        // a new type is added without touching the registry class
        ShapeRegistry.register("triangle", () -> new Shape() {
            public String draw() {
                return "Drawing a triangle";
            }
        });

        for (String key : new String[] {"circle", "square", "triangle"}) {
            System.out.println(ShapeRegistry.create(key).draw());
        }

        try {
            ShapeRegistry.create("hexagon");
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}

interface Shape {

    String draw();
}

class Circle implements Shape {

    public String draw() {
        return "Drawing a circle";
    }
}

class Square implements Shape {

    public String draw() {
        return "Drawing a square";
    }
}

class ShapeRegistry {

    private static final Map<String, Supplier<Shape>> MAKERS = new HashMap<>();

    static void register(String key, Supplier<Shape> maker) {
        MAKERS.put(key, maker);
    }

    static Shape create(String key) {
        Supplier<Shape> maker = MAKERS.get(key);
        if (maker == null) {
            throw new IllegalArgumentException("Unregistered shape: " + key);
        }
        return maker.get();
    }
}
// OUTPUT:
// Drawing a circle
// Drawing a square
// Drawing a triangle
// Error: Unregistered shape: hexagon`),
        blk(`<h4>Variant 3 - Static factory methods (Effective Java, Item 1)</h4>
<p><b>What it shows:</b> a class with a private constructor and named creation methods. <b>Why:</b> names such as <code>of</code>, <code>zero</code>, <code>fromPaise</code> explain intent, can return a cached object, and can validate input - things a constructor cannot do.</p>`,
            `// Static factory methods instead of public constructors
public class FactoryStaticMethodsDemo {

    public static void main(String[] args) {
        Money fee = Money.ofRupees(250);
        Money tip = Money.fromPaise(1575);
        Money none = Money.zero();

        System.out.println("Fee  = " + fee);
        System.out.println("Tip  = " + tip);
        System.out.println("Zero = " + none);
        System.out.println("Zero reused? " + (none == Money.zero()));
        System.out.println("Total = " + fee.plus(tip));
    }
}

final class Money {

    private static final Money ZERO = new Money(0);

    private final long paise;

    private Money(long paise) {
        this.paise = paise;
    }

    static Money zero() {
        return ZERO;                              // cached, no new object
    }

    static Money ofRupees(long rupees) {
        return new Money(rupees * 100);
    }

    static Money fromPaise(long paise) {
        if (paise < 0) {
            throw new IllegalArgumentException("Negative money");
        }
        return new Money(paise);
    }

    Money plus(Money other) {
        return new Money(paise + other.paise);
    }

    @Override
    public String toString() {
        return "Rs " + (paise / 100) + "." + String.format("%02d", paise % 100);
    }
}
// OUTPUT:
// Fee  = Rs 250.00
// Tip  = Rs 15.75
// Zero = Rs 0.00
// Zero reused? true
// Total = Rs 265.75`),
        blk(`<h4>Variant 4 - The classic GoF Factory Method (subclass decides)</h4>
<p><b>What it shows:</b> an abstract creator with a <code>createDocument()</code> method that subclasses override, while shared logic stays in the base class. <b>Why:</b> the base class contains the workflow (<code>open</code>) and only the "which object" step varies - the Template Method idea combined with a factory.</p>`,
            `// GoF Factory Method: subclasses choose the product
public class FactoryMethodCreatorDemo {

    public static void main(String[] args) {
        Application[] apps = {new PdfApplication(), new WordApplication()};

        for (Application app : apps) {
            app.open("Fort_History");
        }
    }
}

interface Document {

    String render();
}

class PdfDocument implements Document {

    public String render() {
        return "PDF page with fixed layout";
    }
}

class WordDocument implements Document {

    public String render() {
        return "Editable Word document";
    }
}

abstract class Application {

    // the factory method: subclasses decide the concrete product
    protected abstract Document createDocument();

    // shared workflow that uses the factory method
    public void open(String name) {
        Document document = createDocument();
        System.out.println("Opening " + name + " -> " + document.render());
    }
}

class PdfApplication extends Application {

    protected Document createDocument() {
        return new PdfDocument();
    }
}

class WordApplication extends Application {

    protected Document createDocument() {
        return new WordDocument();
    }
}
// OUTPUT:
// Opening Fort_History -> PDF page with fixed layout
// Opening Fort_History -> Editable Word document`),
        blk(`<h4>Common mistakes and how to avoid them</h4>
<ul>
<li><b>Returning the concrete type:</b> if the factory returns <code>EmailNotification</code> instead of <code>Notification</code>, clients are coupled again. Always return the interface.</li>
<li><b>Growing if-else chain:</b> every new type edits the factory. Switch to a registry map or a <code>ServiceLoader</code>.</li>
<li><b>Returning null for unknown input:</b> causes NullPointerException far from the cause. Throw <code>IllegalArgumentException</code> or return <code>Optional</code>.</li>
<li><b>Factory that also holds business logic:</b> keep it to creation only.</li>
<li><b>Stringly-typed keys:</b> prefer an enum to avoid typo bugs.</li>
</ul>
<h4>Factory Method vs Abstract Factory (comparison)</h4>
<table border="1" cellpadding="6" style="border-collapse:collapse">
<tr><th>Point</th><th>Factory (Method)</th><th>Abstract Factory</th></tr>
<tr><td>Creates</td><td>One product type</td><td>A family of related products</td></tr>
<tr><td>Mechanism</td><td>One method, often overridden</td><td>An interface with several create methods</td></tr>
<tr><td>Typical example</td><td>Notification by channel</td><td>Button + Checkbox for one theme</td></tr>
<tr><td>Adding a new product kind</td><td>Easy</td><td>Hard (every factory changes)</td></tr>
<tr><td>Adding a new family</td><td>Add a subclass or branch</td><td>Easy (add one factory)</td></tr>
</table>`)
    ],
    expert: [
        blk(`<h4>Real-time example 1 - Payment gateway selection</h4>
<p>An e-commerce app supports several gateways. The checkout code asks a factory for a gateway based on the customer's choice and never mentions Razorpay or PayPal. Unknown gateways are rejected with a clear error.</p>`,
            `// Payment gateway factory used by a checkout service
import java.util.Map;

public class FactoryPaymentGatewayDemo {

    public static void main(String[] args) {
        Checkout checkout = new Checkout();

        checkout.pay("UPI", 499);
        checkout.pay("CARD", 2999);
        checkout.pay("NETBANKING", 1200);
        checkout.pay("BITCOIN", 10);
    }
}

interface PaymentGateway {

    String charge(int amount);
}

class UpiGateway implements PaymentGateway {

    public String charge(int amount) {
        return "UPI collect request sent for Rs " + amount;
    }
}

class CardGateway implements PaymentGateway {

    public String charge(int amount) {
        int fee = amount * 2 / 100;               // 2 percent card fee
        return "Card charged Rs " + (amount + fee) + " (fee Rs " + fee + ")";
    }
}

class NetBankingGateway implements PaymentGateway {

    public String charge(int amount) {
        return "Redirected to bank page for Rs " + amount;
    }
}

class GatewayFactory {

    private static final Map<String, PaymentGateway> GATEWAYS = Map.of(
            "UPI", new UpiGateway(),
            "CARD", new CardGateway(),
            "NETBANKING", new NetBankingGateway());

    static PaymentGateway forMethod(String method) {
        PaymentGateway gateway = GATEWAYS.get(method);
        if (gateway == null) {
            throw new IllegalArgumentException("Unsupported method: " + method);
        }
        return gateway;
    }
}

class Checkout {

    void pay(String method, int amount) {
        try {
            PaymentGateway gateway = GatewayFactory.forMethod(method);
            System.out.println(method + " -> " + gateway.charge(amount));
        } catch (IllegalArgumentException e) {
            System.out.println(method + " -> FAILED: " + e.getMessage());
        }
    }
}
// OUTPUT:
// UPI -> UPI collect request sent for Rs 499
// CARD -> Card charged Rs 3058 (fee Rs 59)
// NETBANKING -> Redirected to bank page for Rs 1200
// BITCOIN -> FAILED: Unsupported method: BITCOIN`),
        blk(`<h4>Real-time example 2 - Report exporter chosen by file extension</h4>
<p>The same data is exported to CSV or JSON depending on the requested file name. The factory inspects the extension, so the reporting module stays closed for modification when a new format (for example XML) is added.</p>`,
            `// Exporter factory picks a format from the file name
import java.util.List;

public class FactoryReportExporterDemo {

    public static void main(String[] args) {
        List<String[]> rows = List.of(
                new String[] {"Jaipur", "Amber Fort", "100"},
                new String[] {"Delhi", "Red Fort", "35"});

        String[] files = {"report.csv", "report.json", "report.pdf"};

        for (String file : files) {
            System.out.println("== " + file + " ==");
            try {
                Exporter exporter = ExporterFactory.forFile(file);
                System.out.println(exporter.export(rows));
            } catch (IllegalArgumentException e) {
                System.out.println("Cannot export: " + e.getMessage());
            }
        }
    }
}

interface Exporter {

    String export(List<String[]> rows);
}

class CsvExporter implements Exporter {

    public String export(List<String[]> rows) {
        StringBuilder out = new StringBuilder("city,place,price");
        for (String[] row : rows) {
            out.append(System.lineSeparator()).append(String.join(",", row));
        }
        return out.toString();
    }
}

class JsonExporter implements Exporter {

    public String export(List<String[]> rows) {
        StringBuilder out = new StringBuilder("[");
        for (int i = 0; i < rows.size(); i++) {
            String[] r = rows.get(i);
            if (i > 0) {
                out.append(",");
            }
            out.append("{'city':'").append(r[0]).append("','place':'").append(r[1])
                    .append("','price':").append(r[2]).append("}");
        }
        return out.append("]").toString();
    }
}

class ExporterFactory {

    static Exporter forFile(String fileName) {
        if (fileName.endsWith(".csv")) {
            return new CsvExporter();
        }
        if (fileName.endsWith(".json")) {
            return new JsonExporter();
        }
        throw new IllegalArgumentException("Unsupported format: " + fileName);
    }
}
// OUTPUT:
// == report.csv ==
// city,place,price
// Jaipur,Amber Fort,100
// Delhi,Red Fort,35
// == report.json ==
// [{'city':'Jaipur','place':'Amber Fort','price':100},{'city':'Delhi','place':'Red Fort','price':35}]
// == report.pdf ==
// Cannot export: Unsupported format: report.pdf`),
        blk(`<h4>Sample mini project - Tour package builder service</h4>
<p>A small booking engine: a <code>PackageFactory</code> creates <code>TourPackage</code> objects for a destination type, a <code>BookingService</code> prices them with a group discount, and <code>main</code> prints a readable summary. Each class has one clear job.</p>`,
            `// Mini project: tour packages created by a factory
import java.util.ArrayList;
import java.util.List;

public class FactoryTourProject {

    public static void main(String[] args) {
        BookingService service = new BookingService();

        service.book("FORT", "Rajasthan", 4);
        service.book("BEACH", "Goa", 2);
        service.book("HILL", "Manali", 6);

        service.printSummary();
    }
}

abstract class TourPackage {

    protected final String region;

    TourPackage(String region) {
        this.region = region;
    }

    abstract int pricePerPerson();

    abstract String highlights();
}

class FortTour extends TourPackage {

    FortTour(String region) {
        super(region);
    }

    int pricePerPerson() {
        return 12000;
    }

    String highlights() {
        return "Fort visits, folk night, camel safari";
    }
}

class BeachTour extends TourPackage {

    BeachTour(String region) {
        super(region);
    }

    int pricePerPerson() {
        return 9000;
    }

    String highlights() {
        return "Beach resort, water sports";
    }
}

class HillTour extends TourPackage {

    HillTour(String region) {
        super(region);
    }

    int pricePerPerson() {
        return 15000;
    }

    String highlights() {
        return "Snow point, trekking, bonfire";
    }
}

class PackageFactory {

    static TourPackage create(String type, String region) {
        return switch (type) {
            case "FORT" -> new FortTour(region);
            case "BEACH" -> new BeachTour(region);
            case "HILL" -> new HillTour(region);
            default -> throw new IllegalArgumentException("Unknown type " + type);
        };
    }
}

class BookingService {

    private final List<String> lines = new ArrayList<>();

    private int grandTotal;

    void book(String type, String region, int people) {
        TourPackage pkg = PackageFactory.create(type, region);
        int total = pkg.pricePerPerson() * people;
        if (people >= 5) {
            total = total * 90 / 100;               // 10 percent group discount
        }
        grandTotal += total;
        lines.add(region + " (" + people + " people): Rs " + total + " | " + pkg.highlights());
    }

    void printSummary() {
        lines.forEach(System.out::println);
        System.out.println("Grand total = Rs " + grandTotal);
    }
}
// OUTPUT:
// Rajasthan (4 people): Rs 48000 | Fort visits, folk night, camel safari
// Goa (2 people): Rs 18000 | Beach resort, water sports
// Manali (6 people): Rs 81000 | Snow point, trekking, bonfire
// Grand total = Rs 147000`),
        blk(`<h4>Thread-safety, testing and Spring notes</h4>
<ul>
<li><b>Thread-safety:</b> a factory with no mutable state is automatically thread-safe. If you use a registry map that is filled at start-up and then read-only, use <code>Map.of</code> or <code>ConcurrentHashMap</code>.</li>
<li><b>Testing:</b> test the factory with one assertion per key (returns the right type, throws for unknown). Because clients depend on the interface, they are tested with a fake product.</li>
<li><b>Spring:</b> inject <code>Map&lt;String, PaymentGateway&gt;</code> and Spring fills it with all beans keyed by bean name - a ready-made registry factory. <code>@Bean</code> methods and <code>FactoryBean&lt;T&gt;</code> are the container's own factories; <code>ObjectProvider&lt;T&gt;</code> creates prototype beans on demand.</li>
<li><b>ServiceLoader:</b> <code>java.util.ServiceLoader</code> discovers implementations from the classpath so even the registry needs no manual registration.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Switch-statement factory growing forever:</b> every release edits the same class. Use registration.</li>
<li><b>Factory plus Singleton plus static state:</b> hidden global state makes tests order-dependent.</li>
<li><b>Over-engineering:</b> a factory in front of a single class with no variation is just noise.</li>
<li><b>Reflection with Class.forName on user input:</b> a security hole; map known keys to known classes instead.</li>
</ul>`)
    ],
    interviewQA: [
        ['What problem does the Factory pattern solve?', 'It removes the direct use of new ConcreteClass() from client code. The client asks for a product by a key or through an interface; creation logic lives in one place, so adding types does not change the client.'],
        ['Simple Factory vs Factory Method vs Abstract Factory?', 'Simple Factory is one class with a static method that decides. Factory Method defers the decision to subclasses by overriding a creation method. Abstract Factory is an interface that creates a whole family of related products.'],
        ['Why are static factory methods often better than constructors?', 'They have names, can return cached or subtype instances, can return null-safe results or Optionals, and hide the concrete class. Examples: List.of, Integer.valueOf, LocalDate.of.'],
        ['How do you avoid the growing if-else in a factory?', 'Use a registry: Map from key to Supplier (or Function). Types register themselves at start-up, so the factory stays unchanged. In Spring, inject a Map of beans; in plain Java use ServiceLoader.'],
        ['Does the factory pattern violate the Open/Closed Principle?', 'A switch-based factory does, because it is edited for every new type. A registry-based or subclass-based (Factory Method) design keeps it closed for modification and open for extension.'],
        ['What should a factory return for an unknown key?', 'Throw IllegalArgumentException (fail fast) or return Optional. Returning null spreads NullPointerExceptions into callers.'],
        ['How is a Spring BeanFactory related to this pattern?', 'BeanFactory/ApplicationContext is a factory that builds, wires and returns objects by name or type. Dependency injection is the more powerful modern replacement for hand-written factories in many cases.']
    ]
};

const abstractFactoryExtra: TopicExtra = {
    beginner: [
        blk(`<div style="border-left:4px solid #0d9488;padding:8px 12px;background:rgba(13,148,136,0.08)">
<h4>In one minute</h4>
<p>An <b>Abstract Factory</b> is a "factory of factories": one interface with <b>several create methods</b>, each making one part of a <b>product family</b>. You choose one concrete factory (for example the Dark theme) and everything it builds - button, menu, checkbox - <b>matches</b>. The client code talks only to the abstract interfaces, so switching the whole family is a one-line change.</p>
</div>
<h4>Real-life analogies</h4>
<ul>
<li><b>A furniture showroom with styles:</b> choose "Modern" and you get a modern sofa, table and chair that look right together; choose "Classic" and the whole set changes.</li>
<li><b>A car company's plant:</b> the "SUV line" makes SUV engine, SUV tyres and SUV body; the "Hatchback line" makes the matching hatchback parts.</li>
<li><b>A thali:</b> pick "South Indian" and every item (rice, sambar, chutney) belongs to that cuisine; pick "Punjabi" and they all change together.</li>
</ul>
<h4>Where you see it in Java, the JDK and Spring</h4>
<ul>
<li><code>javax.xml.parsers.DocumentBuilderFactory</code> and <code>TransformerFactory</code> produce a consistent family of XML tools for one implementation.</li>
<li><b>JDBC:</b> a <code>Connection</code> creates matching <code>Statement</code>, <code>PreparedStatement</code> and <code>ResultSet</code> objects for one database vendor.</li>
<li><code>java.awt.Toolkit</code> and Swing's <code>LookAndFeel</code> create a family of widgets for one look.</li>
<li><b>Spring:</b> profile-specific configuration classes (<code>@Profile("mysql")</code> vs <code>@Profile("postgres")</code>) each provide a matching set of beans.</li>
</ul>
<h4>Structure (text diagram)</h4>
<pre>
        Client
          |  uses only abstractions
          v
  +------------------+        +-----------+   +-----------+
  | GUIFactory       |------&gt; | Button    |   | Menu      |
  | createButton()   |        +-----------+   +-----------+
  | createMenu()     |           ^     ^        ^     ^
  +------------------+           |     |        |     |
     ^            ^         LightBtn DarkBtn LightMenu DarkMenu
     |            |
 LightFactory  DarkFactory   (each builds ONE matching family)
</pre>
<h4>When to use</h4>
<ul>
<li>Your code must work with several families of related products and keep them consistent.</li>
<li>You want to swap a whole platform, theme, vendor or region at once.</li>
<li>You want to hide the concrete product classes from the client.</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>You have only one product type (a plain Factory Method is enough).</li>
<li>There is only one family and no plan for another.</li>
<li>New <i>kinds</i> of products are added often: every factory interface and implementation must change.</li>
</ul>`),
        blk(`<h4>Sample 1 - Light and Dark theme families</h4>
<p>The <code>Screen</code> class receives a <code>ThemeFactory</code> and builds a button and a label from it. Because both come from the same factory, they can never be from different themes.</p>`,
            `// Abstract Factory: two theme families
public class AbstractFactoryThemeDemo {

    public static void main(String[] args) {
        new Screen(new LightThemeFactory()).show();
        new Screen(new DarkThemeFactory()).show();
    }
}

interface Button {

    String paint();
}

interface Label {

    String paint();
}

class LightButton implements Button {

    public String paint() {
        return "[ white button ]";
    }
}

class LightLabel implements Label {

    public String paint() {
        return "black text on white";
    }
}

class DarkButton implements Button {

    public String paint() {
        return "[ black button ]";
    }
}

class DarkLabel implements Label {

    public String paint() {
        return "white text on black";
    }
}

interface ThemeFactory {

    Button createButton();

    Label createLabel();
}

class LightThemeFactory implements ThemeFactory {

    public Button createButton() {
        return new LightButton();
    }

    public Label createLabel() {
        return new LightLabel();
    }
}

class DarkThemeFactory implements ThemeFactory {

    public Button createButton() {
        return new DarkButton();
    }

    public Label createLabel() {
        return new DarkLabel();
    }
}

class Screen {

    private final Button button;
    private final Label label;

    Screen(ThemeFactory factory) {
        this.button = factory.createButton();
        this.label = factory.createLabel();
    }

    void show() {
        System.out.println(button.paint() + " + " + label.paint());
    }
}
// OUTPUT:
// [ white button ] + black text on white
// [ black button ] + white text on black`),
        blk(`<h4>Sample 2 - Regional meal combos</h4>
<p>Each cuisine factory builds a matching main dish and drink. The caller prints a combo without knowing a single concrete class.</p>`,
            `// Abstract Factory: cuisine families of main dish plus drink
public class AbstractFactoryMealDemo {

    public static void main(String[] args) {
        MealFactory[] factories = {new SouthIndianFactory(), new PunjabiFactory()};

        for (MealFactory factory : factories) {
            MainDish dish = factory.createDish();
            Drink drink = factory.createDrink();
            System.out.println(factory.region() + " combo: " + dish.name()
                    + " with " + drink.name() + " = Rs " + (dish.price() + drink.price()));
        }
    }
}

interface MainDish {

    String name();

    int price();
}

interface Drink {

    String name();

    int price();
}

interface MealFactory {

    String region();

    MainDish createDish();

    Drink createDrink();
}

class MasalaDosa implements MainDish {

    public String name() {
        return "Masala Dosa";
    }

    public int price() {
        return 90;
    }
}

class FilterCoffee implements Drink {

    public String name() {
        return "Filter Coffee";
    }

    public int price() {
        return 30;
    }
}

class ButterChicken implements MainDish {

    public String name() {
        return "Butter Chicken";
    }

    public int price() {
        return 280;
    }
}

class Lassi implements Drink {

    public String name() {
        return "Sweet Lassi";
    }

    public int price() {
        return 60;
    }
}

class SouthIndianFactory implements MealFactory {

    public String region() {
        return "South Indian";
    }

    public MainDish createDish() {
        return new MasalaDosa();
    }

    public Drink createDrink() {
        return new FilterCoffee();
    }
}

class PunjabiFactory implements MealFactory {

    public String region() {
        return "Punjabi";
    }

    public MainDish createDish() {
        return new ButterChicken();
    }

    public Drink createDrink() {
        return new Lassi();
    }
}
// OUTPUT:
// South Indian combo: Masala Dosa with Filter Coffee = Rs 120
// Punjabi combo: Butter Chicken with Sweet Lassi = Rs 340`)
    ],
    intermediate: [
        blk(`<h4>Variant 1 - Database vendor families</h4>
<p><b>What it shows:</b> a factory per database vendor creating a matching <code>Connection</code> and <code>QueryBuilder</code>. <b>Why:</b> MySQL uses <code>LIMIT</code> while Oracle uses <code>FETCH FIRST</code>; the pairing must stay consistent, and the application code should not care.</p>`,
            `// Abstract Factory: database vendor families
public class AbstractFactoryDbDemo {

    public static void main(String[] args) {
        DbFactory[] vendors = {new MySqlFactory(), new OracleFactory()};

        for (DbFactory vendor : vendors) {
            Connection connection = vendor.createConnection();
            QueryBuilder query = vendor.createQueryBuilder();

            System.out.println(connection.open());
            System.out.println(query.topRows("forts", 5));
        }
    }
}

interface Connection {

    String open();
}

interface QueryBuilder {

    String topRows(String table, int count);
}

interface DbFactory {

    Connection createConnection();

    QueryBuilder createQueryBuilder();
}

class MySqlConnection implements Connection {

    public String open() {
        return "Connected to MySQL on port 3306";
    }
}

class MySqlQueryBuilder implements QueryBuilder {

    public String topRows(String table, int count) {
        return "SELECT * FROM " + table + " LIMIT " + count;
    }
}

class OracleConnection implements Connection {

    public String open() {
        return "Connected to Oracle on port 1521";
    }
}

class OracleQueryBuilder implements QueryBuilder {

    public String topRows(String table, int count) {
        return "SELECT * FROM " + table + " FETCH FIRST " + count + " ROWS ONLY";
    }
}

class MySqlFactory implements DbFactory {

    public Connection createConnection() {
        return new MySqlConnection();
    }

    public QueryBuilder createQueryBuilder() {
        return new MySqlQueryBuilder();
    }
}

class OracleFactory implements DbFactory {

    public Connection createConnection() {
        return new OracleConnection();
    }

    public QueryBuilder createQueryBuilder() {
        return new OracleQueryBuilder();
    }
}
// OUTPUT:
// Connected to MySQL on port 3306
// SELECT * FROM forts LIMIT 5
// Connected to Oracle on port 1521
// SELECT * FROM forts FETCH FIRST 5 ROWS ONLY`),
        blk(`<h4>Variant 2 - Regional tax and currency family</h4>
<p><b>What it shows:</b> a factory per country creating a tax calculator and a currency formatter. <b>Why:</b> mixing Indian tax rules with a US currency format would be a bug; one factory per region makes that impossible. The invoice service is completely region-agnostic.</p>`,
            `// Abstract Factory: region rules for an invoice
public class AbstractFactoryRegionDemo {

    public static void main(String[] args) {
        InvoiceService india = new InvoiceService(new IndiaFactory());
        InvoiceService usa = new InvoiceService(new UsaFactory());

        System.out.println(india.invoice(1000));
        System.out.println(usa.invoice(1000));
    }
}

interface TaxCalculator {

    double tax(double amount);
}

interface CurrencyFormatter {

    String format(double amount);
}

interface RegionFactory {

    TaxCalculator createTax();

    CurrencyFormatter createFormatter();
}

class GstCalculator implements TaxCalculator {

    public double tax(double amount) {
        return amount * 0.18;               // 18 percent GST
    }
}

class RupeeFormatter implements CurrencyFormatter {

    public String format(double amount) {
        return "Rs " + String.format("%.2f", amount);
    }
}

class SalesTaxCalculator implements TaxCalculator {

    public double tax(double amount) {
        return amount * 0.07;               // 7 percent sales tax
    }
}

class DollarFormatter implements CurrencyFormatter {

    public String format(double amount) {
        return "$" + String.format("%.2f", amount);
    }
}

class IndiaFactory implements RegionFactory {

    public TaxCalculator createTax() {
        return new GstCalculator();
    }

    public CurrencyFormatter createFormatter() {
        return new RupeeFormatter();
    }
}

class UsaFactory implements RegionFactory {

    public TaxCalculator createTax() {
        return new SalesTaxCalculator();
    }

    public CurrencyFormatter createFormatter() {
        return new DollarFormatter();
    }
}

class InvoiceService {

    private final TaxCalculator taxCalculator;
    private final CurrencyFormatter formatter;

    InvoiceService(RegionFactory factory) {
        this.taxCalculator = factory.createTax();
        this.formatter = factory.createFormatter();
    }

    String invoice(double amount) {
        double tax = taxCalculator.tax(amount);
        return "Net " + formatter.format(amount) + " + tax " + formatter.format(tax)
                + " = " + formatter.format(amount + tax);
    }
}
// OUTPUT:
// Net Rs 1000.00 + tax Rs 180.00 = Rs 1180.00
// Net $1000.00 + tax $70.00 = $1070.00`),
        blk(`<h4>Variant 3 - Choosing the factory at run time from configuration</h4>
<p><b>What it shows:</b> the only place that names concrete factories is one small selector method; everything else uses the interface. <b>Why:</b> this is how real applications switch families based on a config value or environment, with no recompilation of the client.</p>`,
            `// Selecting the concrete factory from a configuration value
import java.util.Map;
import java.util.function.Supplier;

public class AbstractFactoryConfigDemo {

    private static final Map<String, Supplier<StorageFactory>> FAMILIES = Map.of(
            "local", LocalStorageFactory::new,
            "cloud", CloudStorageFactory::new);

    public static void main(String[] args) {
        String[] configValues = {"local", "cloud"};

        for (String value : configValues) {
            StorageFactory factory = FAMILIES.get(value).get();   // only place we choose
            BackupApp app = new BackupApp(factory);
            app.run("fort-photos");
        }
    }
}

interface Uploader {

    String upload(String name);
}

interface Encryptor {

    String encrypt(String name);
}

interface StorageFactory {

    Uploader createUploader();

    Encryptor createEncryptor();
}

class LocalStorageFactory implements StorageFactory {

    public Uploader createUploader() {
        return name -> "copied " + name + " to D:/backup";
    }

    public Encryptor createEncryptor() {
        return name -> name + ".zip (no encryption)";
    }
}

class CloudStorageFactory implements StorageFactory {

    public Uploader createUploader() {
        return name -> "uploaded " + name + " to cloud bucket";
    }

    public Encryptor createEncryptor() {
        return name -> name + ".enc (AES-256)";
    }
}

class BackupApp {

    private final Uploader uploader;
    private final Encryptor encryptor;

    BackupApp(StorageFactory factory) {
        this.uploader = factory.createUploader();
        this.encryptor = factory.createEncryptor();
    }

    void run(String folder) {
        System.out.println(encryptor.encrypt(folder));
        System.out.println(uploader.upload(folder));
    }
}
// OUTPUT:
// fort-photos.zip (no encryption)
// copied fort-photos to D:/backup
// fort-photos.enc (AES-256)
// uploaded fort-photos to cloud bucket`),
        blk(`<h4>Variant 4 - Factory of factories (FactoryProducer)</h4>
<p><b>What it shows:</b> one more level: a producer that hands out the right Abstract Factory by a category key. <b>Why:</b> when you have several independent families (shapes and colours here), clients ask one entry point for the factory they need.</p>`,
            `// Factory producer: a factory that returns factories
public class AbstractFactoryProducerDemo {

    public static void main(String[] args) {
        AssetFactory pngFactory = FactoryProducer.getFactory("png");
        AssetFactory svgFactory = FactoryProducer.getFactory("svg");

        System.out.println(pngFactory.createLogo().describe());
        System.out.println(pngFactory.createIcon().describe());
        System.out.println(svgFactory.createLogo().describe());
        System.out.println(svgFactory.createIcon().describe());
    }
}

interface Logo {

    String describe();
}

interface Icon {

    String describe();
}

interface AssetFactory {

    Logo createLogo();

    Icon createIcon();
}

class PngFactory implements AssetFactory {

    public Logo createLogo() {
        return () -> "Logo as 512x512 PNG bitmap";
    }

    public Icon createIcon() {
        return () -> "Icon as 64x64 PNG bitmap";
    }
}

class SvgFactory implements AssetFactory {

    public Logo createLogo() {
        return () -> "Logo as scalable SVG vector";
    }

    public Icon createIcon() {
        return () -> "Icon as scalable SVG vector";
    }
}

class FactoryProducer {

    static AssetFactory getFactory(String format) {
        if (format.equals("png")) {
            return new PngFactory();
        }
        if (format.equals("svg")) {
            return new SvgFactory();
        }
        throw new IllegalArgumentException("Unknown format: " + format);
    }
}
// OUTPUT:
// Logo as 512x512 PNG bitmap
// Icon as 64x64 PNG bitmap
// Logo as scalable SVG vector
// Icon as scalable SVG vector`),
        blk(`<h4>Common mistakes and how to avoid them</h4>
<ul>
<li><b>Using one factory for unrelated products:</b> an Abstract Factory is for <i>families</i> that must be used together. Otherwise use separate Factory Methods.</li>
<li><b>Leaking concrete types:</b> if the client casts to <code>DarkButton</code> the benefit is lost. Keep the client on the interfaces.</li>
<li><b>Mixing factories in one object:</b> do not create a button from the light factory and a label from the dark one. Inject one factory and use only it.</li>
<li><b>Interface explosion:</b> adding a new product kind (a Slider) means editing the factory interface and every implementation. Plan the product list before choosing this pattern.</li>
<li><b>Hard-coding <code>new DarkThemeFactory()</code> in many places:</b> create it once at the composition root (or in a config selector) and pass it down.</li>
</ul>
<h4>Abstract Factory vs Factory Method (comparison)</h4>
<table border="1" cellpadding="6" style="border-collapse:collapse">
<tr><th>Point</th><th>Abstract Factory</th><th>Factory Method</th></tr>
<tr><td>Scope</td><td>Family of related products</td><td>Single product</td></tr>
<tr><td>Typical structure</td><td>Interface with several create methods</td><td>One overridable method</td></tr>
<tr><td>Extension: new variant (family)</td><td>Add one factory class</td><td>Add one subclass</td></tr>
<tr><td>Extension: new product kind</td><td>Touches every factory</td><td>Not applicable</td></tr>
<tr><td>Guarantees consistency</td><td>Yes, by construction</td><td>No</td></tr>
<tr><td>Often implemented with</td><td>Several Factory Methods inside one class</td><td>Template Method</td></tr>
</table>`)
    ],
    expert: [
        blk(`<h4>Real-time example 1 - Repository layer for two databases</h4>
<p>A service layer must run against MySQL in development and PostgreSQL in production. The factory returns a matching <code>Repository</code> and <code>IdGenerator</code> pair: MySQL uses auto-increment, PostgreSQL uses sequences. The business service is identical for both.</p>`,
            `// Realistic: DAO family per database, service stays unchanged
import java.util.ArrayList;
import java.util.List;

public class AbstractFactoryRepositoryDemo {

    public static void main(String[] args) {
        List<DaoFactory> factories = List.of(new MySqlDaoFactory(), new PostgresDaoFactory());

        for (DaoFactory factory : factories) {
            BookingService service = new BookingService(factory);
            service.book("Amber Fort", "Anita");
            service.book("City Palace", "Rahul");
            service.printAll();
        }
    }
}

interface IdGenerator {

    String nextId();
}

interface BookingRepository {

    void save(String id, String description);

    List<String> findAll();
}

interface DaoFactory {

    IdGenerator createIdGenerator();

    BookingRepository createRepository();
}

class AutoIncrementGenerator implements IdGenerator {

    private int counter;

    public String nextId() {
        counter++;
        return "MY-" + counter;
    }
}

class SequenceGenerator implements IdGenerator {

    private int sequence = 5000;

    public String nextId() {
        sequence += 10;
        return "PG-" + sequence;
    }
}

class InMemoryRepository implements BookingRepository {

    private final String dialect;
    private final List<String> rows = new ArrayList<>();

    InMemoryRepository(String dialect) {
        this.dialect = dialect;
    }

    public void save(String id, String description) {
        rows.add(dialect + " row " + id + " : " + description);
    }

    public List<String> findAll() {
        return rows;
    }
}

class MySqlDaoFactory implements DaoFactory {

    public IdGenerator createIdGenerator() {
        return new AutoIncrementGenerator();
    }

    public BookingRepository createRepository() {
        return new InMemoryRepository("mysql");
    }
}

class PostgresDaoFactory implements DaoFactory {

    public IdGenerator createIdGenerator() {
        return new SequenceGenerator();
    }

    public BookingRepository createRepository() {
        return new InMemoryRepository("postgres");
    }
}

class BookingService {

    private final IdGenerator ids;
    private final BookingRepository repository;

    BookingService(DaoFactory factory) {
        this.ids = factory.createIdGenerator();
        this.repository = factory.createRepository();
    }

    void book(String place, String customer) {
        repository.save(ids.nextId(), customer + " booked " + place);
    }

    void printAll() {
        repository.findAll().forEach(System.out::println);
    }
}
// OUTPUT:
// mysql row MY-1 : Anita booked Amber Fort
// mysql row MY-2 : Rahul booked City Palace
// postgres row PG-5010 : Anita booked Amber Fort
// postgres row PG-5020 : Rahul booked City Palace`),
        blk(`<h4>Real-time example 2 - Country-specific messaging kit</h4>
<p>A notification service sends the same business event in each country's style: the language of the greeting and the preferred channel come as a matching pair from one factory. New countries are added by writing one more factory.</p>`,
            `// Realistic: greeting + channel family per country
import java.util.List;

public class AbstractFactoryMessagingDemo {

    public static void main(String[] args) {
        List<MessagingKit> kits = List.of(new IndiaKit(), new FranceKit());

        for (MessagingKit kit : kits) {
            OrderNotifier notifier = new OrderNotifier(kit);
            notifier.orderShipped("Kavya", "ORD-77");
        }
    }
}

interface Greeting {

    String hello(String name);
}

interface Channel {

    void deliver(String text);
}

interface MessagingKit {

    Greeting createGreeting();

    Channel createChannel();
}

class IndiaKit implements MessagingKit {

    public Greeting createGreeting() {
        return name -> "Namaste " + name + ", ";
    }

    public Channel createChannel() {
        return text -> System.out.println("[WhatsApp] " + text);
    }
}

class FranceKit implements MessagingKit {

    public Greeting createGreeting() {
        return name -> "Bonjour " + name + ", ";
    }

    public Channel createChannel() {
        return text -> System.out.println("[Email] " + text);
    }
}

class OrderNotifier {

    private final Greeting greeting;
    private final Channel channel;

    OrderNotifier(MessagingKit kit) {
        this.greeting = kit.createGreeting();
        this.channel = kit.createChannel();
    }

    void orderShipped(String customer, String orderId) {
        channel.deliver(greeting.hello(customer) + "order " + orderId + " has shipped.");
    }
}
// OUTPUT:
// [WhatsApp] Namaste Kavya, order ORD-77 has shipped.
// [Email] Bonjour Kavya, order ORD-77 has shipped.`),
        blk(`<h4>Sample mini project - Vehicle assembly line</h4>
<p>Two assembly lines (Car and Bike) each produce a matching <code>Engine</code>, <code>Tyre</code> and <code>Body</code>. The <code>AssemblyPlant</code> builds and costs a vehicle without knowing which family it is working with; a final report prints one readable summary per vehicle.</p>`,
            `// Mini project: vehicle families through an abstract factory
import java.util.ArrayList;
import java.util.List;

public class AbstractFactoryVehicleProject {

    public static void main(String[] args) {
        AssemblyPlant plant = new AssemblyPlant();

        plant.assemble("Hatchback", new CarLine());
        plant.assemble("Commuter", new BikeLine());
        plant.assemble("Sedan", new CarLine());

        plant.report();
    }
}

interface Engine {

    String spec();

    int cost();
}

interface Tyre {

    String spec();

    int cost();
}

interface Body {

    String spec();

    int cost();
}

interface VehicleLine {

    Engine createEngine();

    Tyre createTyre();

    Body createBody();
}

class CarEngine implements Engine {

    public String spec() {
        return "1200cc petrol";
    }

    public int cost() {
        return 150000;
    }
}

class CarTyre implements Tyre {

    public String spec() {
        return "4 x radial 15 inch";
    }

    public int cost() {
        return 24000;
    }
}

class CarBody implements Body {

    public String spec() {
        return "steel monocoque";
    }

    public int cost() {
        return 200000;
    }
}

class BikeEngine implements Engine {

    public String spec() {
        return "125cc single cylinder";
    }

    public int cost() {
        return 20000;
    }
}

class BikeTyre implements Tyre {

    public String spec() {
        return "2 x tubeless 17 inch";
    }

    public int cost() {
        return 3500;
    }
}

class BikeBody implements Body {

    public String spec() {
        return "tubular frame";
    }

    public int cost() {
        return 12000;
    }
}

class CarLine implements VehicleLine {

    public Engine createEngine() {
        return new CarEngine();
    }

    public Tyre createTyre() {
        return new CarTyre();
    }

    public Body createBody() {
        return new CarBody();
    }
}

class BikeLine implements VehicleLine {

    public Engine createEngine() {
        return new BikeEngine();
    }

    public Tyre createTyre() {
        return new BikeTyre();
    }

    public Body createBody() {
        return new BikeBody();
    }
}

class AssemblyPlant {

    private final List<String> lines = new ArrayList<>();

    private int total;

    void assemble(String model, VehicleLine line) {
        Engine engine = line.createEngine();
        Tyre tyre = line.createTyre();
        Body body = line.createBody();

        int cost = engine.cost() + tyre.cost() + body.cost();
        total += cost;
        lines.add(model + ": " + engine.spec() + ", " + tyre.spec() + ", "
                + body.spec() + " -> Rs " + cost);
    }

    void report() {
        lines.forEach(System.out::println);
        System.out.println("Total build cost = Rs " + total);
    }
}
// OUTPUT:
// Hatchback: 1200cc petrol, 4 x radial 15 inch, steel monocoque -> Rs 374000
// Commuter: 125cc single cylinder, 2 x tubeless 17 inch, tubular frame -> Rs 35500
// Sedan: 1200cc petrol, 4 x radial 15 inch, steel monocoque -> Rs 374000
// Total build cost = Rs 783500`),
        blk(`<h4>Thread-safety, testing and Spring notes</h4>
<ul>
<li><b>Thread-safety:</b> stateless factories are safe to share, so keep them immutable and make them singletons (or Spring singleton beans). Products can be per-call objects.</li>
<li><b>Testing:</b> write a <b>FakeFactory</b> that returns stub products and pass it to the client; no real database or network is needed. Also write one test per concrete factory that asserts all products belong to the same family.</li>
<li><b>Spring:</b> use <code>@Profile</code> or <code>@ConditionalOnProperty</code> so exactly one configuration class (the family) is active, each declaring its matching <code>@Bean</code> methods. Spring Boot's <b>auto-configuration</b> is essentially an abstract factory chosen by classpath and properties.</li>
<li><b>Dependency injection vs Abstract Factory:</b> with a DI container you often do not write the factory at all - you swap a whole module of beans. Keep the explicit pattern for plain Java or when the family is chosen at run time.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Fat factory interface:</b> 15 create methods that no single client needs. Split by cohesion.</li>
<li><b>Static global factory:</b> <code>Factories.current</code> mutated at run time creates mixed families and test pollution.</li>
<li><b>Instanceof checks on products:</b> a sign the abstraction is wrong.</li>
<li><b>Premature abstraction:</b> building three layers for a family that will never get a second member.</li>
</ul>`)
    ],
    interviewQA: [
        ['What is the Abstract Factory pattern?', 'A creational pattern that gives an interface for creating families of related objects without naming their concrete classes. The client picks a concrete factory once and every product it creates belongs to the same family.'],
        ['How does Abstract Factory differ from Factory Method?', 'Factory Method creates a single product through one overridable method. Abstract Factory groups several factory methods in one interface to create a whole family. Abstract Factory is often implemented using Factory Methods.'],
        ['What is the main drawback of Abstract Factory?', 'Adding a new product kind forces changes to the abstract factory interface and every concrete factory. Adding a new family is easy; adding a new kind of product is hard.'],
        ['Give a real JDK example.', 'DocumentBuilderFactory and TransformerFactory in JAXP; JDBC Connection producing matching Statement and ResultSet; Swing LookAndFeel producing a consistent set of widgets.'],
        ['How does it support the Open/Closed and Dependency Inversion principles?', 'The client depends only on abstractions (DIP), and new families are added as new classes without editing the client (OCP).'],
        ['How would you test code that uses an Abstract Factory?', 'Inject a fake factory returning stub or mock products, and add tests per concrete factory verifying that it creates the expected, mutually consistent products.'],
        ['What is a factory of factories?', 'A FactoryProducer (or similar) that returns the correct Abstract Factory for a given key, so clients have a single entry point to obtain factories.'],
        ['How do Spring profiles relate to this pattern?', 'A profile activates one configuration class whose @Bean methods supply a consistent set of beans, which acts like selecting a concrete factory for a whole family.']
    ]
};

const builderExtra: TopicExtra = {
    beginner: [
        blk(`<div style="border-left:4px solid #0d9488;padding:8px 12px;background:rgba(13,148,136,0.08)">
<h4>In one minute</h4>
<p>A <b>Builder</b> constructs a complex object <b>step by step</b>. Instead of one constructor with ten confusing parameters, you call readable methods (<code>.size("large").extraCheese()</code>) and finish with <code>.build()</code>. It solves the <b>telescoping constructor</b> problem, lets you skip optional values, and can produce an <b>immutable</b> object that is checked once, at the end.</p>
</div>
<h4>Real-life analogies</h4>
<ul>
<li><b>Ordering a sandwich at a counter:</b> bread, filling, sauce, extras - you add each choice in turn and the sandwich is made at the end.</li>
<li><b>Building a house:</b> foundation, walls, roof, paint in a fixed order, by a builder following your plan.</li>
<li><b>Filling a railway reservation form:</b> name, age, train, class, berth preference - many fields, some optional, one submit button.</li>
</ul>
<h4>Where you see it in Java, the JDK and Spring</h4>
<ul>
<li><code>StringBuilder</code> and <code>StringBuffer</code> (append step by step, then <code>toString()</code>).</li>
<li><code>java.util.stream.Stream.Builder</code>, <code>Locale.Builder</code>, <code>java.net.http.HttpRequest.newBuilder()</code>, <code>ProcessBuilder</code>.</li>
<li><code>Calendar.Builder</code> and <code>DateTimeFormatterBuilder</code>.</li>
<li><b>Spring:</b> <code>UriComponentsBuilder</code>, <code>BeanDefinitionBuilder</code>, <code>RestClient.builder()</code>, Spring Security's <code>http.authorizeHttpRequests(...)</code> chain; <b>Lombok</b> generates builders with <code>@Builder</code>.</li>
</ul>
<h4>Structure (text diagram)</h4>
<pre>
 Client
   |  Laptop.builder().cpu("i7").ram(16).ssd(512).build()
   v
+----------------------+   build()   +-----------------+
| Laptop.Builder       |-----------&gt; | Laptop          |
| - cpu, ram, ssd...   |             | (immutable)     |
| + cpu(..) : Builder  |             | - cpu, ram, ... |
| + ram(..) : Builder  |             +-----------------+
| + build() : Laptop   |
+----------------------+
 each setter returns "this" so calls can be chained
</pre>
<h4>When to use</h4>
<ul>
<li>A class has many fields and several are optional.</li>
<li>You want an immutable object but still want readable creation code.</li>
<li>Construction needs validation across several fields or several steps.</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>The class has two or three required fields - a simple constructor is clearer.</li>
<li>The object is mutable and short-lived; plain setters are enough.</li>
<li>You would write a builder by hand for each of dozens of classes without Lombok or records.</li>
</ul>`),
        blk(`<h4>Sample 1 - The problem and the fix: laptop configuration</h4>
<p>The first line shows how unreadable a long constructor call is (what is <code>true</code>? what is <code>512</code>?). The builder version names every value.</p>`,
            `// Builder replaces a confusing multi-argument constructor
public class BuilderLaptopDemo {

    public static void main(String[] args) {
        // unclear: which number is RAM, which is storage?
        Laptop plain = new Laptop("i5", 8, 512, true, false);
        System.out.println(plain);

        // clear: every value has a name; optional ones can be skipped
        Laptop built = new Laptop.Builder("i7")
                .ramGb(16)
                .storageGb(1024)
                .backlitKeyboard()
                .build();
        System.out.println(built);
    }
}

class Laptop {

    private final String cpu;
    private final int ramGb;
    private final int storageGb;
    private final boolean backlit;
    private final boolean touchScreen;

    Laptop(String cpu, int ramGb, int storageGb, boolean backlit, boolean touchScreen) {
        this.cpu = cpu;
        this.ramGb = ramGb;
        this.storageGb = storageGb;
        this.backlit = backlit;
        this.touchScreen = touchScreen;
    }

    private Laptop(Builder b) {
        this(b.cpu, b.ramGb, b.storageGb, b.backlit, b.touchScreen);
    }

    static class Builder {

        private final String cpu;                 // required
        private int ramGb = 8;                    // optional with default
        private int storageGb = 256;
        private boolean backlit;
        private boolean touchScreen;

        Builder(String cpu) {
            this.cpu = cpu;
        }

        Builder ramGb(int ramGb) {
            this.ramGb = ramGb;
            return this;
        }

        Builder storageGb(int storageGb) {
            this.storageGb = storageGb;
            return this;
        }

        Builder backlitKeyboard() {
            this.backlit = true;
            return this;
        }

        Builder touchScreen() {
            this.touchScreen = true;
            return this;
        }

        Laptop build() {
            return new Laptop(this);
        }
    }

    @Override
    public String toString() {
        return "Laptop[" + cpu + ", " + ramGb + "GB RAM, " + storageGb + "GB, backlit="
                + backlit + ", touch=" + touchScreen + "]";
    }
}
// OUTPUT:
// Laptop[i5, 8GB RAM, 512GB, backlit=true, touch=false]
// Laptop[i7, 16GB RAM, 1024GB, backlit=true, touch=false]`),
        blk(`<h4>Sample 2 - A burger order with default values</h4>
<p>Unspecified options fall back to sensible defaults, so the simplest order is a one-liner and a complex one is still readable.</p>`,
            `// Builder with defaults: simple and complex orders
import java.util.ArrayList;
import java.util.List;

public class BuilderBurgerDemo {

    public static void main(String[] args) {
        Burger simple = new Burger.Builder().build();

        Burger loaded = new Burger.Builder()
                .patty("paneer")
                .addTopping("cheese")
                .addTopping("onion")
                .addTopping("jalapeno")
                .sauce("mint mayo")
                .build();

        System.out.println(simple);
        System.out.println(loaded);
    }
}

class Burger {

    private final String patty;
    private final String sauce;
    private final List<String> toppings;

    private Burger(Builder builder) {
        this.patty = builder.patty;
        this.sauce = builder.sauce;
        this.toppings = new ArrayList<>(builder.toppings);   // defensive copy
    }

    static class Builder {

        private String patty = "aloo tikki";
        private String sauce = "ketchup";
        private final List<String> toppings = new ArrayList<>();

        Builder patty(String patty) {
            this.patty = patty;
            return this;
        }

        Builder sauce(String sauce) {
            this.sauce = sauce;
            return this;
        }

        Builder addTopping(String topping) {
            toppings.add(topping);
            return this;
        }

        Burger build() {
            return new Burger(this);
        }
    }

    @Override
    public String toString() {
        return patty + " burger, " + sauce + ", toppings=" + toppings;
    }
}
// OUTPUT:
// aloo tikki burger, ketchup, toppings=[]
// paneer burger, mint mayo, toppings=[cheese, onion, jalapeno]`)
    ],
    intermediate: [
        blk(`<h4>Variant 1 - Builder with validation in build()</h4>
<p><b>What it shows:</b> required fields and cross-field rules are checked in <code>build()</code>. <b>Why:</b> an object that exists is guaranteed valid, so the rest of the program never needs defensive checks. Errors are reported with clear messages instead of a half-built object.</p>`,
            `// Validation happens once, in build()
import java.time.LocalDate;

public class BuilderValidationDemo {

    public static void main(String[] args) {
        Booking ok = new Booking.Builder()
                .guest("Ishita")
                .hotel("Taj Lake Palace")
                .checkIn(LocalDate.of(2026, 3, 10))
                .checkOut(LocalDate.of(2026, 3, 13))
                .build();
        System.out.println(ok);

        try {
            new Booking.Builder()
                    .guest("Vikram")
                    .hotel("Rambagh Palace")
                    .checkIn(LocalDate.of(2026, 3, 10))
                    .checkOut(LocalDate.of(2026, 3, 9))
                    .build();
        } catch (IllegalStateException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
    }
}

class Booking {

    private final String guest;
    private final String hotel;
    private final LocalDate checkIn;
    private final LocalDate checkOut;

    private Booking(Builder b) {
        this.guest = b.guest;
        this.hotel = b.hotel;
        this.checkIn = b.checkIn;
        this.checkOut = b.checkOut;
    }

    static class Builder {

        private String guest;
        private String hotel;
        private LocalDate checkIn;
        private LocalDate checkOut;

        Builder guest(String guest) {
            this.guest = guest;
            return this;
        }

        Builder hotel(String hotel) {
            this.hotel = hotel;
            return this;
        }

        Builder checkIn(LocalDate checkIn) {
            this.checkIn = checkIn;
            return this;
        }

        Builder checkOut(LocalDate checkOut) {
            this.checkOut = checkOut;
            return this;
        }

        Booking build() {
            if (guest == null || hotel == null) {
                throw new IllegalStateException("guest and hotel are required");
            }
            if (checkIn == null || checkOut == null) {
                throw new IllegalStateException("dates are required");
            }
            if (!checkOut.isAfter(checkIn)) {
                throw new IllegalStateException("check-out must be after check-in");
            }
            return new Booking(this);
        }
    }

    @Override
    public String toString() {
        long nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);
        return guest + " at " + hotel + " for " + nights + " nights";
    }
}
// OUTPUT:
// Ishita at Taj Lake Palace for 3 nights
// Rejected: check-out must be after check-in`),
        blk(`<h4>Variant 2 - Record plus a hand-written builder (Lombok-style)</h4>
<p><b>What it shows:</b> a Java <b>record</b> gives an immutable value class for free, and a small nested builder adds named, optional parameters plus a <code>toBuilder()</code> copy. <b>Why:</b> this is what Lombok's <code>@Builder</code> generates; with records you need almost no boilerplate.</p>`,
            `// Record with a nested builder and toBuilder() for copies
public class BuilderRecordDemo {

    public static void main(String[] args) {
        Student first = Student.builder()
                .name("Neha")
                .city("Pune")
                .marks(86)
                .build();

        // a modified copy: the original record is never changed
        Student improved = first.toBuilder().marks(93).build();

        System.out.println(first);
        System.out.println(improved);
    }
}

record Student(String name, String city, int marks) {

    static Builder builder() {
        return new Builder();
    }

    Builder toBuilder() {
        return new Builder().name(name).city(city).marks(marks);
    }

    static class Builder {

        private String name = "unknown";
        private String city = "unknown";
        private int marks;

        Builder name(String name) {
            this.name = name;
            return this;
        }

        Builder city(String city) {
            this.city = city;
            return this;
        }

        Builder marks(int marks) {
            this.marks = marks;
            return this;
        }

        Student build() {
            return new Student(name, city, marks);
        }
    }
}
// OUTPUT:
// Student[name=Neha, city=Pune, marks=86]
// Student[name=Neha, city=Pune, marks=93]`),
        blk(`<h4>Variant 3 - Director controlling the build order</h4>
<p><b>What it shows:</b> the classic GoF form. A <code>Director</code> knows the recipe (which steps, in what order); different builders produce different representations from the same steps. <b>Why:</b> the same construction process can create an HTML page or a plain-text page.</p>`,
            `// GoF Builder with a Director and two representations
public class BuilderDirectorDemo {

    public static void main(String[] args) {
        PageDirector director = new PageDirector();

        TextPageBuilder text = new TextPageBuilder();
        director.buildNoticePage(text, "Fort closed", "Closed on Monday for repairs");
        System.out.println(text.result());

        HtmlPageBuilder html = new HtmlPageBuilder();
        director.buildNoticePage(html, "Fort closed", "Closed on Monday for repairs");
        System.out.println(html.result());
    }
}

interface PageBuilder {

    void title(String text);

    void paragraph(String text);

    void footer(String text);
}

class TextPageBuilder implements PageBuilder {

    private final StringBuilder out = new StringBuilder();

    public void title(String text) {
        out.append("== ").append(text.toUpperCase()).append(" ==").append(System.lineSeparator());
    }

    public void paragraph(String text) {
        out.append(text).append(System.lineSeparator());
    }

    public void footer(String text) {
        out.append("-- ").append(text);
    }

    String result() {
        return out.toString();
    }
}

class HtmlPageBuilder implements PageBuilder {

    private final StringBuilder out = new StringBuilder();

    public void title(String text) {
        out.append("<h1>").append(text).append("</h1>");
    }

    public void paragraph(String text) {
        out.append("<p>").append(text).append("</p>");
    }

    public void footer(String text) {
        out.append("<footer>").append(text).append("</footer>");
    }

    String result() {
        return out.toString();
    }
}

class PageDirector {

    // the recipe: always title, paragraph, footer in this order
    void buildNoticePage(PageBuilder builder, String title, String body) {
        builder.title(title);
        builder.paragraph(body);
        builder.footer("Archaeological Survey");
    }
}
// OUTPUT:
// == FORT CLOSED ==
// Closed on Monday for repairs
// -- Archaeological Survey
// <h1>Fort closed</h1><p>Closed on Monday for repairs</p><footer>Archaeological Survey</footer>`),
        blk(`<h4>Variant 4 - Step builder (compiler enforces required fields)</h4>
<p><b>What it shows:</b> each step returns a different interface, so <code>build()</code> only becomes available after all required values are given. <b>Why:</b> you move validation from run time to compile time; forgetting <code>to()</code> does not compile.</p>`,
            `// Step builder: required order enforced by types
public class BuilderStepDemo {

    public static void main(String[] args) {
        Journey journey = Journey.start()
                .from("Mumbai")
                .to("Goa")
                .seats(3)
                .build();

        System.out.println(journey);
        // Journey.start().from("Mumbai").build();   // does not compile: to() missing
    }
}

class Journey {

    private final String from;
    private final String to;
    private final int seats;

    private Journey(String from, String to, int seats) {
        this.from = from;
        this.to = to;
        this.seats = seats;
    }

    interface FromStep {

        ToStep from(String city);
    }

    interface ToStep {

        SeatStep to(String city);
    }

    interface SeatStep {

        BuildStep seats(int count);
    }

    interface BuildStep {

        Journey build();
    }

    static FromStep start() {
        return new StepImpl();
    }

    private static class StepImpl implements FromStep, ToStep, SeatStep, BuildStep {

        private String from;
        private String to;
        private int seats;

        public ToStep from(String city) {
            this.from = city;
            return this;
        }

        public SeatStep to(String city) {
            this.to = city;
            return this;
        }

        public BuildStep seats(int count) {
            this.seats = count;
            return this;
        }

        public Journey build() {
            return new Journey(from, to, seats);
        }
    }

    @Override
    public String toString() {
        return seats + " seats from " + from + " to " + to;
    }
}
// OUTPUT:
// 3 seats from Mumbai to Goa`),
        blk(`<h4>Variant 5 - Immutable object with a collection and defensive copying</h4>
<p><b>What it shows:</b> the builder collects repeated values (recipients) and the product stores an unmodifiable copy. <b>Why:</b> if you keep the builder's list, later calls on the builder - or on the exposed list - would silently change an "immutable" object.</p>`,
            `// Immutable product that owns a defensive copy of the builder list
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BuilderImmutableDemo {

    public static void main(String[] args) {
        Email.Builder builder = new Email.Builder("Fort trip plan")
                .to("asha@example.com")
                .to("rohan@example.com");

        Email email = builder.build();

        builder.to("late@example.com");          // does NOT affect the built email

        System.out.println(email);

        try {
            email.recipients().add("hacker@example.com");
        } catch (UnsupportedOperationException e) {
            System.out.println("Recipients are read-only");
        }
    }
}

final class Email {

    private final String subject;
    private final List<String> recipients;

    private Email(Builder builder) {
        this.subject = builder.subject;
        this.recipients = Collections.unmodifiableList(new ArrayList<>(builder.recipients));
    }

    List<String> recipients() {
        return recipients;
    }

    static class Builder {

        private final String subject;
        private final List<String> recipients = new ArrayList<>();

        Builder(String subject) {
            this.subject = subject;
        }

        Builder to(String address) {
            recipients.add(address);
            return this;
        }

        Email build() {
            if (recipients.isEmpty()) {
                throw new IllegalStateException("at least one recipient");
            }
            return new Email(this);
        }
    }

    @Override
    public String toString() {
        return "Email '" + subject + "' to " + recipients;
    }
}
// OUTPUT:
// Email 'Fort trip plan' to [asha@example.com, rohan@example.com]
// Recipients are read-only`),
        blk(`<h4>Common mistakes and how to avoid them</h4>
<ul>
<li><b>Forgetting to return this:</b> a setter that returns void breaks the chain. Every builder method must return the builder.</li>
<li><b>Validating in setters instead of build():</b> cross-field rules (check-out after check-in) can only be checked once all values are known.</li>
<li><b>Reusing a builder after build():</b> if the product shares the builder's list, later changes leak into it. Copy collections in the product constructor.</li>
<li><b>Making the product mutable anyway:</b> public setters on the product defeat the purpose. Keep fields <code>final</code>.</li>
<li><b>Builder for everything:</b> for two or three fields use a constructor or a record directly.</li>
</ul>
<h4>Builder vs Factory (comparison)</h4>
<table border="1" cellpadding="6" style="border-collapse:collapse">
<tr><th>Point</th><th>Builder</th><th>Factory</th></tr>
<tr><td>Goal</td><td>Assemble one complex object in steps</td><td>Choose which class to instantiate</td></tr>
<tr><td>Result</td><td>Usually one class, many configurations</td><td>Different classes behind one interface</td></tr>
<tr><td>Client input</td><td>Many values, often optional</td><td>Usually a key or type</td></tr>
<tr><td>Creation call</td><td>Many method calls then build()</td><td>One method call</td></tr>
<tr><td>Typical example</td><td>HttpRequest, StringBuilder</td><td>Calendar.getInstance(), List.of()</td></tr>
<tr><td>Can combine?</td><td colspan="2">Yes - a factory can return a pre-configured builder.</td></tr>
</table>`)
    ],
    expert: [
        blk(`<h4>Real-time example 1 - HTTP request builder</h4>
<p>A tiny REST client model: method, URL, headers, query parameters and an optional JSON body. The builder produces an immutable request and validates that a body is only sent with POST or PUT. This mirrors <code>java.net.http.HttpRequest.newBuilder()</code>.</p>`,
            `// Realistic: immutable HTTP request with validation
import java.util.LinkedHashMap;
import java.util.Map;

public class BuilderHttpRequestDemo {

    public static void main(String[] args) {
        HttpCall get = new HttpCall.Builder("GET", "https://api.example.com/forts")
                .query("city", "Jaipur")
                .query("limit", "5")
                .header("Accept", "application/json")
                .build();
        System.out.println(get.describe());

        HttpCall post = new HttpCall.Builder("POST", "https://api.example.com/bookings")
                .header("Content-Type", "application/json")
                .body("{'fort':'Amber','people':4}")
                .build();
        System.out.println(post.describe());

        try {
            new HttpCall.Builder("GET", "https://api.example.com/forts").body("oops").build();
        } catch (IllegalStateException e) {
            System.out.println("Invalid: " + e.getMessage());
        }
    }
}

final class HttpCall {

    private final String method;
    private final String url;
    private final Map<String, String> headers;
    private final Map<String, String> query;
    private final String body;

    private HttpCall(Builder b) {
        this.method = b.method;
        this.url = b.url;
        this.headers = new LinkedHashMap<>(b.headers);
        this.query = new LinkedHashMap<>(b.query);
        this.body = b.body;
    }

    String describe() {
        StringBuilder text = new StringBuilder(method + " " + url);
        if (!query.isEmpty()) {
            String joined = query.entrySet().stream()
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(java.util.stream.Collectors.joining("&"));
            text.append("?").append(joined);
        }
        text.append(" headers=").append(headers.keySet());
        if (body != null) {
            text.append(" body=").append(body);
        }
        return text.toString();
    }

    static class Builder {

        private final String method;
        private final String url;
        private final Map<String, String> headers = new LinkedHashMap<>();
        private final Map<String, String> query = new LinkedHashMap<>();
        private String body;

        Builder(String method, String url) {
            this.method = method;
            this.url = url;
        }

        Builder header(String name, String value) {
            headers.put(name, value);
            return this;
        }

        Builder query(String name, String value) {
            query.put(name, value);
            return this;
        }

        Builder body(String body) {
            this.body = body;
            return this;
        }

        HttpCall build() {
            boolean allowsBody = method.equals("POST") || method.equals("PUT");
            if (body != null && !allowsBody) {
                throw new IllegalStateException(method + " cannot have a body");
            }
            return new HttpCall(this);
        }
    }
}
// OUTPUT:
// GET https://api.example.com/forts?city=Jaipur&limit=5 headers=[Accept]
// POST https://api.example.com/bookings headers=[Content-Type] body={'fort':'Amber','people':4}
// Invalid: GET cannot have a body`),
        blk(`<h4>Real-time example 2 - Report builder with sections and totals</h4>
<p>A sales report is assembled from a title, any number of line items and an optional footer. The builder keeps the running total, so the finished report object is read-only and consistent.</p>`,
            `// Realistic: sales report assembled step by step
import java.util.ArrayList;
import java.util.List;

public class BuilderReportDemo {

    public static void main(String[] args) {
        Report report = new Report.Builder("Monthly sales - Rajasthan")
                .line("Amber Fort tickets", 1200, 100)
                .line("Audio guides", 300, 150)
                .line("Souvenirs", 85, 400)
                .footer("Prepared by accounts team")
                .build();

        System.out.println(report.render());
    }
}

class Report {

    private final String title;
    private final List<String> lines;
    private final int total;
    private final String footer;

    private Report(Builder b) {
        this.title = b.title;
        this.lines = new ArrayList<>(b.lines);
        this.total = b.total;
        this.footer = b.footer;
    }

    String render() {
        StringBuilder out = new StringBuilder();
        out.append(title).append(System.lineSeparator());
        lines.forEach(l -> out.append("  ").append(l).append(System.lineSeparator()));
        out.append("TOTAL = Rs ").append(total);
        if (footer != null) {
            out.append(System.lineSeparator()).append(footer);
        }
        return out.toString();
    }

    static class Builder {

        private final String title;
        private final List<String> lines = new ArrayList<>();
        private int total;
        private String footer;

        Builder(String title) {
            this.title = title;
        }

        Builder line(String item, int quantity, int unitPrice) {
            int amount = quantity * unitPrice;
            total += amount;
            lines.add(item + " : " + quantity + " x " + unitPrice + " = " + amount);
            return this;
        }

        Builder footer(String footer) {
            this.footer = footer;
            return this;
        }

        Report build() {
            return new Report(this);
        }
    }
}
// OUTPUT:
// Monthly sales - Rajasthan
//   Amber Fort tickets : 1200 x 100 = 120000
//   Audio guides : 300 x 150 = 45000
//   Souvenirs : 85 x 400 = 34000
// TOTAL = Rs 199000
// Prepared by accounts team`),
        blk(`<h4>Sample mini project - SQL query builder</h4>
<p>A small fluent SQL builder with a <code>Condition</code> class, a <code>Query</code> product and a <code>QueryBuilder</code>. It validates that a table exists, supports several WHERE conditions, ordering and a limit, and prints the final SQL. Typical of libraries such as jOOQ or Hibernate Criteria.</p>`,
            `// Mini project: fluent SQL query builder
import java.util.ArrayList;
import java.util.List;

public class BuilderSqlProject {

    public static void main(String[] args) {
        Query forts = QueryBuilder.select("name", "city", "ticket_price")
                .from("forts")
                .where(new Condition("city", "=", "'Jaipur'"))
                .where(new Condition("ticket_price", "<", "200"))
                .orderBy("ticket_price")
                .limit(5)
                .build();

        Query all = QueryBuilder.select("*").from("cities").build();

        System.out.println(forts.sql());
        System.out.println(all.sql());

        try {
            QueryBuilder.select("name").build();
        } catch (IllegalStateException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}

class Condition {

    private final String column;
    private final String operator;
    private final String value;

    Condition(String column, String operator, String value) {
        this.column = column;
        this.operator = operator;
        this.value = value;
    }

    String text() {
        return column + " " + operator + " " + value;
    }
}

class Query {

    private final String sql;

    Query(String sql) {
        this.sql = sql;
    }

    String sql() {
        return sql;
    }
}

class QueryBuilder {

    private final List<String> columns;
    private final List<Condition> conditions = new ArrayList<>();
    private String table;
    private String orderColumn;
    private int limit = -1;

    private QueryBuilder(List<String> columns) {
        this.columns = columns;
    }

    static QueryBuilder select(String... columns) {
        return new QueryBuilder(List.of(columns));
    }

    QueryBuilder from(String table) {
        this.table = table;
        return this;
    }

    QueryBuilder where(Condition condition) {
        conditions.add(condition);
        return this;
    }

    QueryBuilder orderBy(String column) {
        this.orderColumn = column;
        return this;
    }

    QueryBuilder limit(int limit) {
        this.limit = limit;
        return this;
    }

    Query build() {
        if (table == null) {
            throw new IllegalStateException("FROM table is required");
        }
        StringBuilder sql = new StringBuilder("SELECT ");
        sql.append(String.join(", ", columns)).append(" FROM ").append(table);

        for (int i = 0; i < conditions.size(); i++) {
            sql.append(i == 0 ? " WHERE " : " AND ").append(conditions.get(i).text());
        }
        if (orderColumn != null) {
            sql.append(" ORDER BY ").append(orderColumn);
        }
        if (limit > 0) {
            sql.append(" LIMIT ").append(limit);
        }
        return new Query(sql.toString());
    }
}
// OUTPUT:
// SELECT name, city, ticket_price FROM forts WHERE city = 'Jaipur' AND ticket_price < 200 ORDER BY ticket_price LIMIT 5
// SELECT * FROM cities
// Error: FROM table is required`),
        blk(`<h4>Thread-safety, testing and Spring notes</h4>
<ul>
<li><b>Thread-safety:</b> a <b>builder is not thread-safe</b> and should not be shared; create one per object. The built product, being immutable with final fields, is safely shareable between threads without locks.</li>
<li><b>Testing:</b> test valid builds, each validation failure, defaults, and that changing the builder after <code>build()</code> does not change the product. For equality in tests, give the product <code>equals</code>/<code>hashCode</code> (records do it for you).</li>
<li><b>Lombok:</b> <code>@Builder</code> generates the nested builder; <code>@Builder.Default</code> sets defaults, <code>toBuilder = true</code> adds <code>toBuilder()</code>, and <code>@Singular</code> creates add-one methods for collections.</li>
<li><b>Spring:</b> <code>UriComponentsBuilder</code>, <code>MockMvcRequestBuilders</code>, <code>WebClient.builder()</code> and <code>RestClient.builder()</code> are everyday builders. Configuration objects built with a builder can be exposed as a <code>@Bean</code> so the finished immutable object is injected, not the builder.</li>
<li><b>Jackson:</b> annotate with <code>@JsonDeserialize(builder = ...)</code> to deserialize JSON into an immutable object through its builder.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Builder that returns a different mutable object each time</b> but exposes setters on the product.</li>
<li><b>Telescoping builders:</b> a builder with forty methods signals the class itself is too large; split it.</li>
<li><b>Skipping validation</b> so that <code>build()</code> returns objects in illegal states.</li>
<li><b>Shared static builder:</b> reusing one builder instance across threads or requests leaks state.</li>
</ul>`)
    ],
    interviewQA: [
        ['What problem does the Builder pattern solve?', 'The telescoping constructor and the JavaBean inconsistency problems: objects with many optional parameters. A builder sets values by name step by step, validates once, and returns a complete (often immutable) object.'],
        ['How is Builder different from Factory?', 'A factory decides which class to create and usually takes one key; a builder assembles one complex object from many steps. Factory returns the product at once, Builder returns it after build().'],
        ['What is the role of the Director in the GoF Builder?', 'The Director encapsulates the construction sequence and calls the builder steps in the right order, so the same process can create different representations with different builders. Modern fluent builders often omit it.'],
        ['Why make the product immutable and copy collections?', 'So that once built, no one can alter its state: no setters, final fields, and defensive copies (or unmodifiable lists) prevent changes through retained references to the builder or exposed lists.'],
        ['Where should validation go: setters or build()?', 'In build(). Only then are all values present, so cross-field rules (end after start) can be checked and an invalid object can never be created.'],
        ['How does Lombok @Builder relate to the pattern?', 'It generates the nested builder class, fluent methods and build() at compile time; @Builder.Default, @Singular and toBuilder refine it. It removes boilerplate but the pattern is the same.'],
        ['Name Builders in the JDK.', 'StringBuilder, HttpRequest.newBuilder(), ProcessBuilder, Stream.builder(), Locale.Builder and DateTimeFormatterBuilder.'],
        ['Is a builder thread-safe?', 'Normally no. Use one builder per thread/object; the built immutable product is the thing you share.']
    ]
};

const prototypeExtra: TopicExtra = {
    beginner: [
        blk(`<div style="border-left:4px solid #0d9488;padding:8px 12px;background:rgba(13,148,136,0.08)">
<h4>In one minute</h4>
<p>The <b>Prototype</b> pattern creates a new object by <b>copying an existing one</b> (the prototype) instead of building it from scratch with <code>new</code>. It is useful when creating an object is costly (loading data, many settings) or when you want many similar objects that differ only slightly. The key question is always: is the copy <b>shallow</b> (shares inner objects) or <b>deep</b> (copies everything)?</p>
</div>
<h4>Real-life analogies</h4>
<ul>
<li><b>Photocopying a filled form:</b> you copy it once and change only the name and date, rather than rewriting every field.</li>
<li><b>A cell dividing:</b> the new cell starts as a copy of the original.</li>
<li><b>A template Excel file:</b> "Save As" a new file, then edit what differs.</li>
</ul>
<h4>Where you see it in Java, the JDK and Spring</h4>
<ul>
<li><code>Object.clone()</code> with the <code>Cloneable</code> marker interface; arrays have <code>clone()</code> too.</li>
<li>Copy constructors in collections: <code>new ArrayList&lt;&gt;(other)</code>, <code>new HashMap&lt;&gt;(map)</code>, plus <code>List.copyOf(...)</code>.</li>
<li><code>Arrays.copyOf</code>, and <code>Date.clone()</code>.</li>
<li><b>Spring:</b> beans with <code>@Scope("prototype")</code> give a new instance on every request (the container creates a fresh one from the definition); <code>BeanUtils.copyProperties</code> copies state between objects.</li>
</ul>
<h4>Structure (text diagram)</h4>
<pre>
+--------------------+         +----------------------+
| Prototype          |         | Client               |
| + copy() : Prototype| &lt;------ | p2 = p1.copy();      |
+--------------------+         | p2.setName("new");   |
        ^                       +----------------------+
        |
+--------------------+   copy() builds a new object with the
| ConcretePrototype  |   same field values as "this"
| - fields           |
+--------------------+
</pre>
<h4>When to use</h4>
<ul>
<li>Object creation is expensive (database load, parsing, heavy computation) and a copy is cheaper.</li>
<li>You need many objects that are almost the same (game enemies, document templates, test data).</li>
<li>You want to avoid a parallel hierarchy of factories for each class.</li>
</ul>
<h4>When NOT to use</h4>
<ul>
<li>The object is trivial to construct - a normal constructor is simpler.</li>
<li>The object contains resources that cannot be copied (open files, sockets, threads).</li>
<li>Object graphs contain cycles or complex shared references that make deep copies error-prone.</li>
</ul>`),
        blk(`<h4>Sample 1 - Copying an invoice template with a copy method</h4>
<p>Instead of the awkward <code>Cloneable</code>, this uses a plain <code>copy()</code> method in the class. The template stays untouched; each invoice is a copy with only customer and amount changed.</p>`,
            `// Prototype with an explicit copy() method
public class PrototypeInvoiceDemo {

    public static void main(String[] args) {
        Invoice template = new Invoice("JavaSchoolLab Pvt Ltd", "Pune", "GST 18%", 0);

        Invoice first = template.copy();
        first.setCustomer("Asha Traders");
        first.setAmount(12500);

        Invoice second = template.copy();
        second.setCustomer("Mehta Stores");
        second.setAmount(4800);

        System.out.println(template);
        System.out.println(first);
        System.out.println(second);
    }
}

class Invoice {

    private final String company;
    private final String city;
    private final String taxNote;
    private String customer = "-";
    private int amount;

    Invoice(String company, String city, String taxNote, int amount) {
        this.company = company;
        this.city = city;
        this.taxNote = taxNote;
        this.amount = amount;
    }

    // the prototype operation: build a new object from this one
    Invoice copy() {
        Invoice duplicate = new Invoice(company, city, taxNote, amount);
        duplicate.customer = customer;
        return duplicate;
    }

    void setCustomer(String customer) {
        this.customer = customer;
    }

    void setAmount(int amount) {
        this.amount = amount;
    }

    @Override
    public String toString() {
        return company + " (" + city + ") | " + taxNote + " | " + customer + " | Rs " + amount;
    }
}
// OUTPUT:
// JavaSchoolLab Pvt Ltd (Pune) | GST 18% | - | Rs 0
// JavaSchoolLab Pvt Ltd (Pune) | GST 18% | Asha Traders | Rs 12500
// JavaSchoolLab Pvt Ltd (Pune) | GST 18% | Mehta Stores | Rs 4800`),
        blk(`<h4>Sample 2 - Game enemies cloned from a prototype</h4>
<p>A "Soldier" with an expensive set-up (here simulated by a message) is created once. Reinforcements are cheap copies; only position differs.</p>`,
            `// Prototype: spawn many similar enemies cheaply
import java.util.ArrayList;
import java.util.List;

public class PrototypeEnemyDemo {

    public static void main(String[] args) {
        Enemy soldier = new Enemy("Soldier", 100, 15);     // expensive set-up once

        List<Enemy> wave = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            Enemy clone = soldier.copy();
            clone.moveTo(i * 10, 5);
            wave.add(clone);
        }

        wave.forEach(System.out::println);
        System.out.println("Original still at " + soldier);
    }
}

class Enemy {

    private final String type;
    private final int health;
    private final int damage;
    private int x;
    private int y;

    Enemy(String type, int health, int damage) {
        this.type = type;
        this.health = health;
        this.damage = damage;
        System.out.println("Loading model and textures for " + type + "...");
    }

    // private constructor for copying: skips the expensive loading
    private Enemy(Enemy source) {
        this.type = source.type;
        this.health = source.health;
        this.damage = source.damage;
        this.x = source.x;
        this.y = source.y;
    }

    Enemy copy() {
        return new Enemy(this);
    }

    void moveTo(int x, int y) {
        this.x = x;
        this.y = y;
    }

    @Override
    public String toString() {
        return type + " hp=" + health + " dmg=" + damage + " at (" + x + "," + y + ")";
    }
}
// OUTPUT:
// Loading model and textures for Soldier...
// Soldier hp=100 dmg=15 at (10,5)
// Soldier hp=100 dmg=15 at (20,5)
// Soldier hp=100 dmg=15 at (30,5)
// Original still at Soldier hp=100 dmg=15 at (0,0)`)
    ],
    intermediate: [
        blk(`<h4>Variant 1 - Shallow copy versus deep copy with Cloneable</h4>
<p><b>What it shows:</b> <code>super.clone()</code> copies field values, so an inner object (the address) is <b>shared</b> between original and clone. Changing it through the clone changes the original too. <b>Why it matters:</b> this is the number-one prototype bug. The second class overrides <code>clone()</code> to copy the inner object as well.</p>`,
            `// Shallow copy shares inner objects; deep copy does not
public class PrototypeShallowDeepDemo {

    public static void main(String[] args) throws CloneNotSupportedException {
        ShallowPerson original = new ShallowPerson("Arjun", new Address("Jaipur"));
        ShallowPerson shallow = (ShallowPerson) original.clone();
        shallow.address.city = "Udaipur";
        System.out.println("Shallow: original city = " + original.address.city);

        DeepPerson deepOriginal = new DeepPerson("Arjun", new Address("Jaipur"));
        DeepPerson deep = (DeepPerson) deepOriginal.clone();
        deep.address.city = "Udaipur";
        System.out.println("Deep:    original city = " + deepOriginal.address.city);
    }
}

class Address {

    String city;

    Address(String city) {
        this.city = city;
    }
}

class ShallowPerson implements Cloneable {

    String name;
    Address address;

    ShallowPerson(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();                  // address reference is shared
    }
}

class DeepPerson implements Cloneable {

    String name;
    Address address;

    DeepPerson(String name, Address address) {
        this.name = name;
        this.address = address;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        DeepPerson copy = (DeepPerson) super.clone();
        copy.address = new Address(address.city);   // copy the inner object too
        return copy;
    }
}
// OUTPUT:
// Shallow: original city = Udaipur
// Deep:    original city = Jaipur`),
        blk(`<h4>Variant 2 - Copy constructor (the recommended alternative to clone)</h4>
<p><b>What it shows:</b> a constructor that takes an object of the same type and copies it, including a deep copy of the list. <b>Why:</b> no <code>Cloneable</code>, no checked exception, no casts, works with <code>final</code> fields, and the intent is obvious.</p>`,
            `// Copy constructor with a deep-copied list
import java.util.ArrayList;
import java.util.List;

public class PrototypeCopyConstructorDemo {

    public static void main(String[] args) {
        Playlist original = new Playlist("Road trip");
        original.add("Kesariya");
        original.add("Kun Faya Kun");

        Playlist copy = new Playlist(original);       // copy constructor
        copy.rename("Weekend trip");
        copy.add("Chaiyya Chaiyya");

        System.out.println(original);
        System.out.println(copy);
    }
}

class Playlist {

    private String name;
    private final List<String> songs;

    Playlist(String name) {
        this.name = name;
        this.songs = new ArrayList<>();
    }

    // copy constructor: new list, so the two playlists are independent
    Playlist(Playlist other) {
        this.name = other.name;
        this.songs = new ArrayList<>(other.songs);
    }

    void rename(String name) {
        this.name = name;
    }

    void add(String song) {
        songs.add(song);
    }

    @Override
    public String toString() {
        return name + " " + songs;
    }
}
// OUTPUT:
// Road trip [Kesariya, Kun Faya Kun]
// Weekend trip [Kesariya, Kun Faya Kun, Chaiyya Chaiyya]`),
        blk(`<h4>Variant 3 - Prototype registry (cache of ready-made prototypes)</h4>
<p><b>What it shows:</b> a registry that holds named prototypes and hands out copies. <b>Why:</b> clients ask for "student-template" by name and get a fresh independent copy each time, without knowing the class or how it was made.</p>`,
            `// Prototype registry: named templates, fresh copies on demand
import java.util.HashMap;
import java.util.Map;

public class PrototypeRegistryDemo {

    public static void main(String[] args) {
        TemplateRegistry registry = new TemplateRegistry();
        registry.register("diwali", new Greeting("Happy Diwali", "gold", 3));
        registry.register("holi", new Greeting("Happy Holi", "multicolour", 2));

        Greeting forAsha = registry.create("diwali");
        forAsha.setReceiver("Asha");

        Greeting forRavi = registry.create("diwali");
        forRavi.setReceiver("Ravi");

        System.out.println(forAsha);
        System.out.println(forRavi);
        System.out.println(registry.create("holi"));
        System.out.println("Different objects? " + (forAsha != forRavi));
    }
}

class Greeting {

    private final String text;
    private final String theme;
    private final int images;
    private String receiver = "everyone";

    Greeting(String text, String theme, int images) {
        this.text = text;
        this.theme = theme;
        this.images = images;
    }

    Greeting copy() {
        Greeting duplicate = new Greeting(text, theme, images);
        duplicate.receiver = receiver;
        return duplicate;
    }

    void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    @Override
    public String toString() {
        return text + " to " + receiver + " [" + theme + ", " + images + " images]";
    }
}

class TemplateRegistry {

    private final Map<String, Greeting> templates = new HashMap<>();

    void register(String key, Greeting prototype) {
        templates.put(key, prototype);
    }

    Greeting create(String key) {
        Greeting prototype = templates.get(key);
        if (prototype == null) {
            throw new IllegalArgumentException("No template " + key);
        }
        return prototype.copy();               // never hand out the prototype itself
    }
}
// OUTPUT:
// Happy Diwali to Asha [gold, 3 images]
// Happy Diwali to Ravi [gold, 3 images]
// Happy Holi to everyone [multicolour, 2 images]
// Different objects? true`),
        blk(`<h4>Variant 4 - Deep copy through serialization</h4>
<p><b>What it shows:</b> writing an object graph to bytes and reading it back produces a complete deep copy, however deeply nested. <b>Why:</b> it saves writing copy code for large graphs. <b>Cost:</b> every class must implement <code>Serializable</code>, and it is slower than manual copying.</p>`,
            `// Deep copy of a whole object graph using serialization
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class PrototypeSerializationDemo {

    public static void main(String[] args) throws Exception {
        Trip original = new Trip("Rajasthan circuit");
        original.stops.add(new Stop("Jaipur", 2));
        original.stops.add(new Stop("Jodhpur", 1));

        Trip copy = deepCopy(original);
        copy.stops.get(0).nights = 5;                 // change only the copy
        copy.stops.add(new Stop("Jaisalmer", 2));

        System.out.println("Original: " + original);
        System.out.println("Copy:     " + copy);
    }

    static Trip deepCopy(Trip source) throws Exception {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(source);
        }
        try (ObjectInputStream in = new ObjectInputStream(
                new ByteArrayInputStream(bytes.toByteArray()))) {
            return (Trip) in.readObject();
        }
    }
}

class Stop implements Serializable {

    String city;
    int nights;

    Stop(String city, int nights) {
        this.city = city;
        this.nights = nights;
    }

    @Override
    public String toString() {
        return city + "(" + nights + "n)";
    }
}

class Trip implements Serializable {

    String name;
    List<Stop> stops = new ArrayList<>();

    Trip(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return name + " " + stops;
    }
}
// OUTPUT:
// Original: Rajasthan circuit [Jaipur(2n), Jodhpur(1n)]
// Copy:     Rajasthan circuit [Jaipur(5n), Jodhpur(1n), Jaisalmer(2n)]`),
        blk(`<h4>Variant 5 - Copying collections and arrays correctly</h4>
<p><b>What it shows:</b> the everyday "prototype" operations of the JDK and their depth: <code>clone()</code> on an array, <code>new ArrayList&lt;&gt;(list)</code>, and <code>List.copyOf</code>. All are <b>shallow</b>: the container is copied, the elements are shared. <b>Why:</b> you must know this before trusting a "copy" of a list of mutable objects.</p>`,
            `// Collection copies are shallow: elements are shared
import java.util.ArrayList;
import java.util.List;

public class PrototypeCollectionCopyDemo {

    public static void main(String[] args) {
        StringBuilder fort = new StringBuilder("Amber");
        List<StringBuilder> original = new ArrayList<>();
        original.add(fort);

        List<StringBuilder> copy = new ArrayList<>(original);   // new list, same elements
        copy.add(new StringBuilder("Mehrangarh"));               // only the copy grows
        copy.get(0).append(" Fort");                             // shared element changes

        System.out.println("original = " + original);
        System.out.println("copy     = " + copy);

        int[] marks = {70, 80, 90};
        int[] marksCopy = marks.clone();                         // arrays of primitives: fine
        marksCopy[0] = 99;
        System.out.println("marks[0] = " + marks[0] + ", copy[0] = " + marksCopy[0]);
    }
}
// OUTPUT:
// original = [Amber Fort]
// copy     = [Amber Fort, Mehrangarh]
// marks[0] = 70, copy[0] = 99`),
        blk(`<h4>Common mistakes and how to avoid them</h4>
<ul>
<li><b>Shallow copy surprises:</b> mutable fields (lists, dates, other objects) must be copied in the copy method. Test by changing the copy and checking the original.</li>
<li><b>Forgetting <code>implements Cloneable</code>:</b> <code>super.clone()</code> then throws <code>CloneNotSupportedException</code>.</li>
<li><b>Returning the registry's prototype itself:</b> the caller changes it and corrupts the template. Always return a copy.</li>
<li><b>clone() with final fields or inheritance:</b> clone cannot reassign final fields and subclasses can forget to override it. Prefer copy constructors or a <code>copy()</code> method.</li>
<li><b>Copying resources:</b> do not clone sockets, streams or threads; re-open them in the copy.</li>
<li><b>Cyclic references in deep copy:</b> a naive recursive copy loops forever. Serialization handles cycles; hand-written code needs an identity map.</li>
</ul>
<h4>Prototype vs Factory (comparison)</h4>
<table border="1" cellpadding="6" style="border-collapse:collapse">
<tr><th>Point</th><th>Prototype</th><th>Factory</th></tr>
<tr><td>How objects are made</td><td>Copied from an existing instance</td><td>Constructed with new in the factory</td></tr>
<tr><td>Knowledge needed</td><td>A ready prototype object</td><td>The concrete class</td></tr>
<tr><td>State of new object</td><td>Starts with the prototype's current state</td><td>Starts with default state</td></tr>
<tr><td>Best when</td><td>Creation is costly or configuration-heavy</td><td>Class choice varies at run time</td></tr>
<tr><td>Main risk</td><td>Shallow versus deep copy bugs</td><td>Growing switch statements</td></tr>
<tr><td>Can combine?</td><td colspan="2">Yes - a factory can keep prototypes and return copies (a prototype registry).</td></tr>
</table>`)
    ],
    expert: [
        blk(`<h4>Real-time example 1 - Offer-letter template system</h4>
<p>HR keeps an offer-letter template containing fixed clauses and a benefits list. Each candidate gets a deep copy; personal fields and an extra benefit are added to the copy only. The template is never modified, which is exactly why Prototype is used for document generation.</p>`,
            `// Realistic: deep-copied document template for each candidate
import java.util.ArrayList;
import java.util.List;

public class PrototypeOfferLetterDemo {

    public static void main(String[] args) {
        OfferLetter template = new OfferLetter("JavaSchoolLab Technologies");
        template.addBenefit("Health insurance");
        template.addBenefit("20 paid leaves");

        OfferLetter anita = template.copy();
        anita.personalise("Anita Deshmukh", "Backend Developer", 900000);

        OfferLetter imran = template.copy();
        imran.personalise("Imran Sheikh", "QA Engineer", 600000);
        imran.addBenefit("Laptop allowance");

        System.out.println(anita.render());
        System.out.println(imran.render());
        System.out.println("Template benefits: " + template.benefitCount());
    }
}

class OfferLetter {

    private final String company;
    private final List<String> benefits;
    private String candidate = "<name>";
    private String role = "<role>";
    private int salary;

    OfferLetter(String company) {
        this.company = company;
        this.benefits = new ArrayList<>();
    }

    private OfferLetter(OfferLetter source) {
        this.company = source.company;
        this.benefits = new ArrayList<>(source.benefits);   // deep copy of the list
        this.candidate = source.candidate;
        this.role = source.role;
        this.salary = source.salary;
    }

    OfferLetter copy() {
        return new OfferLetter(this);
    }

    void addBenefit(String benefit) {
        benefits.add(benefit);
    }

    void personalise(String candidate, String role, int salary) {
        this.candidate = candidate;
        this.role = role;
        this.salary = salary;
    }

    int benefitCount() {
        return benefits.size();
    }

    String render() {
        return company + " offers " + candidate + " the role of " + role
                + " at Rs " + salary + " per year. Benefits: " + benefits;
    }
}
// OUTPUT:
// JavaSchoolLab Technologies offers Anita Deshmukh the role of Backend Developer at Rs 900000 per year. Benefits: [Health insurance, 20 paid leaves]
// JavaSchoolLab Technologies offers Imran Sheikh the role of QA Engineer at Rs 600000 per year. Benefits: [Health insurance, 20 paid leaves, Laptop allowance]
// Template benefits: 2`),
        blk(`<h4>Real-time example 2 - Game character spawner with prototype registry</h4>
<p>A level loads a few prototype monsters once (the costly step) and spawns hundreds of copies. Using a registry means the spawner works with names from a level file and needs no knowledge of the monster classes. Each copy has its own position and health so damage to one does not affect another.</p>`,
            `// Realistic: spawn monsters from registered prototypes
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class PrototypeSpawnerDemo {

    public static void main(String[] args) {
        MonsterRegistry registry = new MonsterRegistry();
        registry.register("goblin", new Monster("Goblin", 30, 4));
        registry.register("dragon", new Monster("Dragon", 500, 60));

        List<Monster> level = new ArrayList<>();
        level.add(registry.spawn("goblin", 1, 1));
        level.add(registry.spawn("goblin", 4, 2));
        level.add(registry.spawn("dragon", 9, 9));

        level.get(0).takeDamage(25);                  // hurts only the first goblin

        level.forEach(System.out::println);
    }
}

class Monster {

    private final String kind;
    private int health;
    private final int attack;
    private int x;
    private int y;

    Monster(String kind, int health, int attack) {
        this.kind = kind;
        this.health = health;
        this.attack = attack;
    }

    Monster copyAt(int x, int y) {
        Monster copy = new Monster(kind, health, attack);
        copy.x = x;
        copy.y = y;
        return copy;
    }

    void takeDamage(int amount) {
        health = Math.max(0, health - amount);
    }

    @Override
    public String toString() {
        return kind + " hp=" + health + " atk=" + attack + " @(" + x + "," + y + ")";
    }
}

class MonsterRegistry {

    private final Map<String, Monster> prototypes = new LinkedHashMap<>();

    void register(String key, Monster prototype) {
        prototypes.put(key, prototype);
    }

    Monster spawn(String key, int x, int y) {
        return prototypes.get(key).copyAt(x, y);
    }
}
// OUTPUT:
// Goblin hp=5 atk=4 @(1,1)
// Goblin hp=30 atk=4 @(4,2)
// Dragon hp=500 atk=60 @(9,9)`),
        blk(`<h4>Sample mini project - Exam paper generator</h4>
<p>A teacher defines a master question paper (the prototype) once. For each student the system makes a deep copy, stamps the roll number, shuffles nothing but changes the paper code, and prints a readable summary. The master is verified to be untouched at the end - the point of Prototype.</p>`,
            `// Mini project: exam papers copied from a master paper
import java.util.ArrayList;
import java.util.List;

public class PrototypeExamProject {

    public static void main(String[] args) {
        QuestionPaper master = new QuestionPaper("Java Fundamentals", 60);
        master.addQuestion(new Question("What is JVM?", 5));
        master.addQuestion(new Question("Explain polymorphism.", 10));
        master.addQuestion(new Question("Write a singleton.", 10));

        PaperPrinter printer = new PaperPrinter();

        String[] students = {"Pooja", "Sandeep", "Fatima"};
        for (int i = 0; i < students.length; i++) {
            QuestionPaper paper = master.copy();
            paper.assignTo(students[i], 101 + i);
            if (students[i].equals("Fatima")) {
                paper.extendTime(15);                 // special accommodation
            }
            printer.print(paper);
        }

        System.out.println("Master untouched: " + master.summary());
    }
}

class Question {

    private final String text;
    private final int marks;

    Question(String text, int marks) {
        this.text = text;
        this.marks = marks;
    }

    Question copy() {
        return new Question(text, marks);
    }

    int marks() {
        return marks;
    }

    String text() {
        return text;
    }
}

class QuestionPaper {

    private final String subject;
    private int minutes;
    private final List<Question> questions = new ArrayList<>();
    private String student = "-";
    private int roll;

    QuestionPaper(String subject, int minutes) {
        this.subject = subject;
        this.minutes = minutes;
    }

    void addQuestion(Question question) {
        questions.add(question);
    }

    QuestionPaper copy() {
        QuestionPaper duplicate = new QuestionPaper(subject, minutes);
        for (Question q : questions) {
            duplicate.questions.add(q.copy());        // deep copy of every question
        }
        return duplicate;
    }

    void assignTo(String student, int roll) {
        this.student = student;
        this.roll = roll;
    }

    void extendTime(int extra) {
        this.minutes += extra;
    }

    int totalMarks() {
        int total = 0;
        for (Question q : questions) {
            total += q.marks();
        }
        return total;
    }

    String summary() {
        return subject + ", " + minutes + " min, " + questions.size() + " questions, "
                + totalMarks() + " marks";
    }

    String header() {
        return "Roll " + roll + " " + student;
    }
}

class PaperPrinter {

    void print(QuestionPaper paper) {
        System.out.println(paper.header() + " -> " + paper.summary());
    }
}
// OUTPUT:
// Roll 101 Pooja -> Java Fundamentals, 60 min, 3 questions, 25 marks
// Roll 102 Sandeep -> Java Fundamentals, 60 min, 3 questions, 25 marks
// Roll 103 Fatima -> Java Fundamentals, 75 min, 3 questions, 25 marks
// Master untouched: Java Fundamentals, 60 min, 3 questions, 25 marks`),
        blk(`<h4>Thread-safety, testing and Spring notes</h4>
<ul>
<li><b>Thread-safety:</b> a prototype that is only read while copying is safe to share. If threads can modify it, make the <code>copy()</code> method <code>synchronized</code> or keep the prototype immutable and copy-on-write. Never hand out the prototype itself.</li>
<li><b>Testing:</b> assert four things - the copy equals the original (or has the same values), the copy is not the same reference, mutating the copy leaves the original unchanged, and nested objects are different references (deep copy proof).</li>
<li><b>Spring:</b> a bean with <code>@Scope("prototype")</code> is created anew on every <code>getBean</code> or injection point (a singleton bean that needs a fresh prototype each time should use <code>ObjectProvider</code> or <code>@Lookup</code>). Singleton beans are shared; prototype beans' destroy callbacks are not called by the container.</li>
<li><b>Mapping libraries:</b> <code>BeanUtils.copyProperties</code> and MapStruct perform shallow property copies between objects; check nested objects yourself.</li>
<li><b>Records and immutability:</b> immutable objects need no defensive copy of themselves; "copy with a change" is done with a wither or <code>toBuilder()</code>.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Relying on Object.clone() for new code:</b> it is widely regarded as broken design (no constructor call, checked exception, final-field problems).</li>
<li><b>Deep copy by hand everywhere:</b> duplicate copy code that drifts out of date when a field is added; centralise it or use serialization/mapping carefully.</li>
<li><b>Mutable shared prototype:</b> any client changing a global template silently changes every future copy.</li>
<li><b>Cloning to avoid understanding construction:</b> if copies need major changes, a Builder or Factory is clearer.</li>
</ul>`)
    ],
    interviewQA: [
        ['What is the Prototype pattern and when is it useful?', 'It creates new objects by copying an existing instance instead of using new. It is useful when construction is expensive, when many similar objects are needed, or when the exact class is unknown to the client.'],
        ['Shallow copy vs deep copy?', 'A shallow copy duplicates the object but shares its referenced inner objects; a deep copy duplicates the inner objects too. With a shallow copy, mutating a nested object through the clone also changes the original.'],
        ['Why is Object.clone() considered problematic?', 'It bypasses constructors, needs the Cloneable marker, throws a checked exception, does a shallow copy by default, conflicts with final fields and is easy to get wrong in subclasses. Copy constructors or copy methods are preferred.'],
        ['How can you create a deep copy in Java?', 'Override clone() and copy mutable fields, use a copy constructor, serialize and deserialize the object, or use a mapping library; in each case verify that nested objects are different references.'],
        ['What is a Prototype registry?', 'A map of named prototypes. Clients ask for a name and receive a fresh copy, so they do not depend on concrete classes and expensive prototypes are built only once.'],
        ['How does Prototype relate to Spring bean scopes?', 'The prototype scope makes the container return a new bean instance on every request, which is the same intent. Singleton beans are shared; prototype beans are not cached or managed after creation.'],
        ['Does Arrays.copyOf or new ArrayList(list) give a deep copy?', 'No. They create a new container but share the element references, so mutable elements are shared. Copy the elements yourself if you need independence.']
    ]
};

export const designPatternExtras1: Record<string, TopicExtra> = {
    'singleton-pattern': singletonExtra,
    'factory design pattern ': factoryExtra,
    'abstract-factory-pattern': abstractFactoryExtra,
    'builder-pattern': builderExtra,
    'prototype-pattern': prototypeExtra,
};
