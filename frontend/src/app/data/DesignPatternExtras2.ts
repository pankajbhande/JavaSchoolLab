import type { TopicExtra } from './courseMerges';
import { blk } from './jsRoadmapKit';

const adapter: TopicExtra = {
    beginner: [
        blk(`<h4>In one minute</h4>
<p>An <b>Adapter</b> sits between a client that expects interface <i>A</i> and a class that offers interface <i>B</i>. The client calls A; the adapter translates the call into B. Neither side changes. Think "converter", not "new feature".</p>

<h4>Everyday analogies</h4>
<ul>
<li><b>Travel plug adapter</b>: your charger stays the same, the wall socket stays the same, the adapter sits between them.</li>
<li><b>Card reader</b>: a microSD card cannot talk to a USB port, the reader converts the signals.</li>
<li><b>Human translator</b>: a Hindi speaker and a Tamil speaker both stay as they are; the translator maps sentences one way and the other.</li>
</ul>

<h4>Where you see it in Java / JDK / Spring</h4>
<ul>
<li><code>java.io.InputStreamReader</code> adapts a byte <code>InputStream</code> to the character <code>Reader</code> interface.</li>
<li><code>java.util.Arrays.asList(...)</code> adapts an array to <code>List</code>.</li>
<li><code>java.util.Collections.enumeration(...)</code> and <code>Enumeration.asIterator()</code> convert between old and new iteration APIs.</li>
<li><code>Executors.callable(Runnable)</code> adapts a <code>Runnable</code> to a <code>Callable</code>.</li>
<li>Spring MVC's <code>HandlerAdapter</code> lets <code>DispatcherServlet</code> call very different controller styles through one interface.</li>
</ul>

<h4>Structure (object adapter)</h4>
<pre>
Client ---&gt; Target (interface)
                ^
                |  implements
             Adapter ---has-a---&gt; Adaptee (incompatible class)
</pre>

<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it when you must reuse a class whose source you cannot (or should not) change: legacy code, a third-party SDK, generated code.</li>
<li>Use it when several vendors expose similar features with different method names.</li>
<li>Do NOT use it when you own both sides: just rename the method or change the interface.</li>
<li>Do NOT use it to add behaviour (that is Decorator) or to simplify many classes (that is Facade).</li>
</ul>

<h4>Sample: a Fahrenheit sensor behind a Celsius interface</h4>
<p>The weather station code only understands Celsius. A purchased sensor reports Fahrenheit. The adapter converts, so no existing code changes.</p>`,
`// AdapterBeginnerDemo - Fahrenheit sensor adapted to a Celsius interface
import java.util.List;

public class AdapterBeginnerDemo {
    public static void main(String[] args) {
        List<CelsiusSensor> sensors = List.of(
                new ProbeAdapter(new FahrenheitProbe("Jaipur", 104.0)),
                new ProbeAdapter(new FahrenheitProbe("Shimla", 59.0)));

        for (CelsiusSensor s : sensors) {
            System.out.printf("%s: %.1f C%n", s.city(), s.readCelsius());
        }
    }
}

interface CelsiusSensor {
    String city();

    double readCelsius();
}

// Third-party class we cannot change
class FahrenheitProbe {
    private final String location;
    private final double fahrenheit;

    FahrenheitProbe(String location, double fahrenheit) {
        this.location = location;
        this.fahrenheit = fahrenheit;
    }

    String getLocation() {
        return location;
    }

    double getFahrenheit() {
        return fahrenheit;
    }
}

// The adapter converts units and method names
class ProbeAdapter implements CelsiusSensor {
    private final FahrenheitProbe probe;

    ProbeAdapter(FahrenheitProbe probe) {
        this.probe = probe;
    }

    @Override
    public String city() {
        return probe.getLocation();
    }

    @Override
    public double readCelsius() {
        return (probe.getFahrenheit() - 32) * 5 / 9; // F to C
    }
}
// OUTPUT:
// Jaipur: 40.0 C
// Shimla: 15.0 C`),
    ],
    intermediate: [
        blk(`<h4>Sample 1: object adapter (composition)</h4>
<p><b>What it shows:</b> the adapter holds the legacy object as a field and delegates to it. <b>Why:</b> this is the default choice, because it works with any subclass of the adaptee and is easy to swap or mock.</p>`,
`// AdapterObjectDemo - object adapter: wrap the legacy courier API

public class AdapterObjectDemo {
    public static void main(String[] args) {
        Courier courier = new CargoAdapter(new OldCargoSystem());
        System.out.println(courier.ship("Udaipur", 3));
        System.out.println(courier.ship("Gwalior", 12));
    }
}

interface Courier {
    String ship(String city, int weightKg);
}

// Legacy API with a different vocabulary
class OldCargoSystem {
    String dispatchParcel(String destination, double grams) {
        return "Parcel to " + destination + " (" + (int) grams + " g) dispatched";
    }
}

class CargoAdapter implements Courier {
    private final OldCargoSystem cargo; // composition

    CargoAdapter(OldCargoSystem cargo) {
        this.cargo = cargo;
    }

    @Override
    public String ship(String city, int weightKg) {
        double grams = weightKg * 1000.0; // translate kg to grams
        return cargo.dispatchParcel(city, grams);
    }
}
// OUTPUT:
// Parcel to Udaipur (3000 g) dispatched
// Parcel to Gwalior (12000 g) dispatched`),
        blk(`<h4>Sample 2: class adapter (inheritance)</h4>
<p><b>What it shows:</b> the adapter <i>extends</i> the adaptee and <i>implements</i> the target. <b>Why:</b> it can reach protected members and avoids one extra object, but it locks you to one concrete adaptee and needs a language that allows it (in Java the target must be an interface).</p>`,
`// AdapterClassDemo - class adapter using inheritance

public class AdapterClassDemo {
    public static void main(String[] args) {
        TicketPrinter printer = new TicketMachineAdapter();
        printer.printTicket("Amer Fort", 4);
        printer.printTicket("Kumbhalgarh", 2);
    }
}

interface TicketPrinter {
    void printTicket(String fort, int adults);
}

class LegacyTicketMachine {
    protected int pricePerHead = 50;

    protected String stamp(String text) {
        return "** " + text + " **";
    }
}

// Extends the adaptee, implements the target
class TicketMachineAdapter extends LegacyTicketMachine implements TicketPrinter {
    @Override
    public void printTicket(String fort, int adults) {
        int total = pricePerHead * adults; // uses the protected field directly
        System.out.println(stamp(fort + " x" + adults + " = Rs " + total));
    }
}
// OUTPUT:
// ** Amer Fort x4 = Rs 200 **
// ** Kumbhalgarh x2 = Rs 100 **`),
        blk(`<h4>Sample 3: a JDK-style adapter, Enumeration to Iterator</h4>
<p><b>What it shows:</b> adapting the legacy <code>Enumeration</code> (Vector, Hashtable era) to the modern <code>Iterator</code>. <b>Why:</b> new code can use for-each and streams with old APIs. The JDK does the same in <code>Collections.list</code> and <code>Enumeration.asIterator()</code>.</p>`,
`// AdapterEnumDemo - adapt Enumeration to Iterator
import java.util.Enumeration;
import java.util.Iterator;
import java.util.Vector;

public class AdapterEnumDemo {
    public static void main(String[] args) {
        Vector<String> forts = new Vector<>();
        forts.add("Golconda");
        forts.add("Gwalior");
        forts.add("Chittorgarh");

        Iterator<String> it = new EnumerationIterator<>(forts.elements());
        while (it.hasNext()) {
            System.out.println("Fort: " + it.next());
        }

        // The JDK ships the same adapter
        Iterator<String> builtIn = forts.elements().asIterator();
        System.out.println("Built-in first: " + builtIn.next());
    }
}

class EnumerationIterator<T> implements Iterator<T> {
    private final Enumeration<T> source;

    EnumerationIterator(Enumeration<T> source) {
        this.source = source;
    }

    @Override
    public boolean hasNext() {
        return source.hasMoreElements(); // old name -> new name
    }

    @Override
    public T next() {
        return source.nextElement();
    }
}
// OUTPUT:
// Fort: Golconda
// Fort: Gwalior
// Fort: Chittorgarh
// Built-in first: Golconda`),
        blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Fat adapter</b>: putting business rules in it. An adapter only translates names, units and formats.</li>
<li>Leaking the adaptee type through the target interface, so clients still depend on the vendor class.</li>
<li>Swallowing exceptions during translation; map them to your own exception type instead.</li>
<li>Creating an adapter when you own the code and could simply refactor.</li>
<li>Forgetting round-trip loss, e.g. converting double to int silently drops precision.</li>
</ul>

<h4>Adapter vs Facade vs Proxy vs Decorator</h4>
<table>
<tr><th>Pattern</th><th>Interface of the wrapper</th><th>Intent</th><th>Wraps</th></tr>
<tr><td><b>Adapter</b></td><td>Different from the wrapped one</td><td>Make incompatible APIs fit</td><td>Usually one object</td></tr>
<tr><td><b>Decorator</b></td><td>Same as the wrapped one</td><td>Add behaviour</td><td>One object, stackable</td></tr>
<tr><td><b>Proxy</b></td><td>Same as the wrapped one</td><td>Control access (lazy, cache, security)</td><td>One object</td></tr>
<tr><td><b>Facade</b></td><td>New, simpler interface</td><td>Hide a complex subsystem</td><td>Many objects</td></tr>
</table>`),
    ],
    expert: [
        blk(`<h4>Real-time example 1: payment gateway adapter</h4>
<p>The checkout talks to one <code>PaymentProcessor</code> interface. Each vendor has its own method names, amount units (rupees vs paise) and result codes. Adapters hide all that, so adding a vendor never touches checkout code.</p>`,
`// PaymentGatewayAdapterDemo - one interface, two incompatible vendors
import java.util.Locale;

public class PaymentGatewayAdapterDemo {
    static void checkout(PaymentProcessor p, String name, String order, double amount) {
        String result = p.pay(order, amount) ? "PAID" : "FAILED";
        System.out.println(name + " " + order + " Rs " + amount + " -> " + result);
    }

    public static void main(String[] args) {
        checkout(new VendorAAdapter(), "VendorA", "ORD-101", 1299.50);
        checkout(new VendorAAdapter(), "VendorA", "ORD-102", 75000.00);
        checkout(new VendorBAdapter(), "VendorB", "ORD-103", 49999.99);
        checkout(new VendorBAdapter(), "VendorB", "ORD-104", 90000.00);
    }
}

interface PaymentProcessor {
    boolean pay(String orderId, double rupees);
}

// Vendor A takes paise and returns a numeric status code
class VendorAClient {
    int makePayment(String ref, long paise) {
        return paise > 0 && paise < 5_000_000 ? 200 : 400;
    }
}

// Vendor B takes a text amount and returns a word
class VendorBSdk {
    String charge(String reference, String amount, String currency) {
        return Double.parseDouble(amount) <= 50000 ? "APPROVED" : "DECLINED";
    }
}

class VendorAAdapter implements PaymentProcessor {
    private final VendorAClient client = new VendorAClient();

    @Override
    public boolean pay(String orderId, double rupees) {
        long paise = Math.round(rupees * 100); // rupees to paise
        return client.makePayment(orderId, paise) == 200;
    }
}

class VendorBAdapter implements PaymentProcessor {
    private final VendorBSdk sdk = new VendorBSdk();

    @Override
    public boolean pay(String orderId, double rupees) {
        String amount = String.format(Locale.ROOT, "%.2f", rupees);
        return "APPROVED".equals(sdk.charge(orderId, amount, "INR"));
    }
}
// OUTPUT:
// VendorA ORD-101 Rs 1299.5 -> PAID
// VendorA ORD-102 Rs 75000.0 -> FAILED
// VendorB ORD-103 Rs 49999.99 -> PAID
// VendorB ORD-104 Rs 90000.0 -> FAILED`),
        blk(`<h4>Real-time example 2: logging adapter (the SLF4J idea)</h4>
<p>Application code logs through its own <code>AppLogger</code>. The adapter plugs in <code>java.util.logging</code>, so the logging library can be swapped without touching business classes. This is exactly how SLF4J bindings and Spring's commons-logging bridge work.</p>`,
`// LoggingAdapterDemo - adapt java.util.logging to an application logger
import java.util.logging.Handler;
import java.util.logging.Level;
import java.util.logging.LogRecord;
import java.util.logging.Logger;

public class LoggingAdapterDemo {
    public static void main(String[] args) {
        Logger jul = Logger.getLogger("orders");
        jul.setUseParentHandlers(false);
        jul.addHandler(new ConsoleHandler2());

        AppLogger log = new JulLoggerAdapter(jul);
        log.info("Order ORD-7 placed from Nagpur");
        log.error("Stock missing for SKU-42");
    }
}

interface AppLogger {
    void info(String message);

    void error(String message);
}

class JulLoggerAdapter implements AppLogger {
    private final Logger delegate;

    JulLoggerAdapter(Logger delegate) {
        this.delegate = delegate;
    }

    @Override
    public void info(String message) {
        delegate.log(Level.INFO, message);
    }

    @Override
    public void error(String message) {
        delegate.log(Level.SEVERE, message); // SEVERE is JUL's name for error
    }
}

// Prints records in our own simple format
class ConsoleHandler2 extends Handler {
    @Override
    public void publish(LogRecord record) {
        System.out.println("[" + record.getLevel() + "] " + record.getMessage());
    }

    @Override
    public void flush() {
    }

    @Override
    public void close() {
    }
}
// OUTPUT:
// [INFO] Order ORD-7 placed from Nagpur
// [SEVERE] Stock missing for SKU-42`),
        blk(`<h4>Sample mini project: travel-booking aggregator</h4>
<p>Three suppliers return fares in three shapes. One adapter per supplier converts them into a common <code>Fare</code> record; the aggregator then picks the cheapest. Run it and read the result table.</p>`,
`// TravelAggregatorDemo - adapters normalise three supplier APIs
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class TravelAggregatorDemo {
    public static void main(String[] args) {
        List<FareSource> sources = List.of(new RailAdapter(), new BusAdapter(), new AirAdapter());
        List<Fare> fares = new ArrayList<>();

        for (FareSource s : sources) {
            fares.add(s.cheapest("Delhi", "Jaipur"));
        }

        fares.sort(Comparator.comparingInt(Fare::rupees));
        for (Fare f : fares) {
            System.out.printf("%-14s Rs %5d  %4d min%n", f.carrier(), f.rupees(), f.minutes());
        }
        System.out.println("Cheapest: " + fares.get(0).carrier());
    }
}

record Fare(String carrier, int rupees, int minutes) {
}

interface FareSource {
    Fare cheapest(String from, String to);
}

// Supplier 1: returns a CSV-like string
class RailApi {
    String lookup(String route) {
        return "Rajdhani,2150,960";
    }
}

// Supplier 2: returns parallel arrays
class BusApi {
    String[] names() {
        return new String[] {"RedBus-Volvo"};
    }

    int[] pricesInPaise() {
        return new int[] {95000};
    }

    int[] hours() {
        return new int[] {13};
    }
}

// Supplier 3: already a small object, but with other names
class AirApi {
    String airline = "IndiGo";
    double fareInThousands = 4.8;
    int durationMinutes = 125;
}

class RailAdapter implements FareSource {
    public Fare cheapest(String from, String to) {
        String[] p = new RailApi().lookup(from + "-" + to).split(",");
        return new Fare(p[0], Integer.parseInt(p[1]), Integer.parseInt(p[2]));
    }
}

class BusAdapter implements FareSource {
    public Fare cheapest(String from, String to) {
        BusApi api = new BusApi();
        return new Fare(api.names()[0], api.pricesInPaise()[0] / 100, api.hours()[0] * 60);
    }
}

class AirAdapter implements FareSource {
    public Fare cheapest(String from, String to) {
        AirApi api = new AirApi();
        return new Fare(api.airline, (int) (api.fareInThousands * 1000), api.durationMinutes);
    }
}
// OUTPUT:
// RedBus-Volvo   Rs   950   780 min
// Rajdhani       Rs  2150   960 min
// IndiGo         Rs  4800   125 min
// Cheapest: RedBus-Volvo`),
        blk(`<h4>Testing, Spring and performance notes</h4>
<ul>
<li><b>Testing</b>: depend on the target interface, then unit-test each adapter with a fake adaptee and assert on unit conversions and edge values (zero, negative, null).</li>
<li><b>Spring</b>: register adapters as beans and inject them by interface, optionally as <code>Map&lt;String, PaymentProcessor&gt;</code> keyed by bean name to pick a vendor at runtime. <code>HandlerAdapter</code>, <code>HttpMessageConverter</code> and <code>JpaVendorAdapter</code> are framework examples.</li>
<li><b>Performance</b>: an adapter adds one call; the cost is only in conversion (parsing, boxing). Avoid re-parsing on every call, convert once and cache.</li>
<li>Keep adapters in an <b>anti-corruption layer</b> package so vendor types never appear in your domain model.</li>
</ul>

<h4>Anti-patterns</h4>
<ul>
<li><b>Adapter chain</b>: adapting an adapter of an adapter; refactor to one translation.</li>
<li><b>Two-way god adapter</b> that implements five interfaces.</li>
<li>Using reflection-based generic adapters everywhere, which hides errors until runtime.</li>
</ul>`),
    ],
    interviewQA: [
        ['What problem does the Adapter pattern solve?', 'It lets a client use a class whose interface does not match what the client expects, by wrapping that class in an adapter that translates calls. The adaptee and the client stay unchanged, which supports the Open/Closed principle.'],
        ['Class adapter vs object adapter?', 'A class adapter inherits from the adaptee and implements the target; an object adapter holds the adaptee as a field and delegates. Java prefers object adapters because they use composition, work with subclasses of the adaptee and are easier to test.'],
        ['Give two Adapter examples in the JDK.', 'InputStreamReader (bytes to characters), Arrays.asList (array to List), Collections.enumeration and Enumeration.asIterator, Executors.callable (Runnable to Callable).'],
        ['How is Adapter different from Facade?', 'Adapter changes the interface of one class to match an expected one. Facade defines a new, simpler interface over a whole subsystem of many classes.'],
        ['How is Adapter different from Decorator and Proxy?', 'Decorator and Proxy keep the same interface as the wrapped object (adding behaviour or controlling access). Adapter deliberately exposes a different interface.'],
        ['Where would you put adapters in a layered application?', 'At the boundary to external systems (an anti-corruption layer or infrastructure package), so domain code depends only on your own interfaces and vendor types never leak inward.'],
    ],
};

const decorator: TopicExtra = {
    beginner: [
        blk(`<h4>In one minute</h4>
<p>A <b>Decorator</b> wraps an object that has the <i>same interface</i> and adds behaviour before or after delegating to it. Because a decorator is itself a valid component, decorators can be stacked like layers of an onion, in any combination, at runtime. It replaces an explosion of subclasses such as <code>SugarMilkCoffee</code>, <code>SugarCoffee</code>, <code>MilkCoffee</code>.</p>

<h4>Everyday analogies</h4>
<ul>
<li><b>Gift wrapping</b>: the gift is the same, you add paper, then a ribbon, then a card.</li>
<li><b>Clothes</b>: you add a shirt, a sweater, a jacket; each layer adds warmth without changing you.</li>
<li><b>Pizza toppings</b>: base price plus each topping, chosen per order.</li>
</ul>

<h4>Where you see it in Java / JDK / Spring</h4>
<ul>
<li><code>java.io</code>: <code>BufferedInputStream</code>, <code>DataInputStream</code>, <code>GZIPOutputStream</code> all wrap another stream (<code>FilterInputStream</code> is the abstract decorator).</li>
<li><code>Collections.unmodifiableList</code>, <code>synchronizedList</code>, <code>checkedList</code> wrap a collection and tweak its behaviour.</li>
<li><code>HttpServletRequestWrapper</code> and <code>HttpServletResponseWrapper</code> in the Servlet API.</li>
<li>Spring: <code>BeanPostProcessor</code>-created wrappers and <code>ServerHttpRequestDecorator</code> in WebFlux.</li>
</ul>

<h4>Structure</h4>
<pre>
Component (interface)
   ^                  ^
   |                  |
ConcreteComponent   Decorator ---has-a---&gt; Component
                       ^
              LoudDecorator, StampDecorator ...

client -&gt; Stamp( Loud( Plain ) )   // each layer calls the next
</pre>

<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it to add optional features in many combinations without a subclass per combination.</li>
<li>Use it when responsibilities must be added or removed at runtime.</li>
<li>Do NOT use it when the order of wrapping is hard to reason about for your team, or when you need to remove a middle layer later.</li>
<li>Do NOT use it when the interface is huge: every decorator must forward every method.</li>
</ul>

<h4>Sample: message formatting layers</h4>
<p>A plain message is wrapped by a trimming layer, a shouting layer and a stamp layer. Each layer is independent; changing the stack changes the result.</p>`,
`// DecoratorBeginnerDemo - stack small text decorators

public class DecoratorBeginnerDemo {
    public static void main(String[] args) {
        Message raw = new PlainMessage("   fort gates open at nine   ");
        System.out.println("[" + raw.text() + "]");

        Message tidy = new TrimDecorator(raw);
        System.out.println("[" + tidy.text() + "]");

        Message loud = new StampDecorator(new ShoutDecorator(tidy), "Jaisalmer Desk");
        System.out.println(loud.text()); // three layers deep
    }
}

interface Message {
    String text();
}

class PlainMessage implements Message {
    private final String body;

    PlainMessage(String body) {
        this.body = body;
    }

    @Override
    public String text() {
        return body;
    }
}

// Base decorator: holds the wrapped message and forwards by default
abstract class MessageDecorator implements Message {
    protected final Message inner;

    MessageDecorator(Message inner) {
        this.inner = inner;
    }
}

class TrimDecorator extends MessageDecorator {
    TrimDecorator(Message inner) {
        super(inner);
    }

    @Override
    public String text() {
        return inner.text().trim();
    }
}

class ShoutDecorator extends MessageDecorator {
    ShoutDecorator(Message inner) {
        super(inner);
    }

    @Override
    public String text() {
        return inner.text().toUpperCase() + "!";
    }
}

class StampDecorator extends MessageDecorator {
    private final String sender;

    StampDecorator(Message inner, String sender) {
        super(inner);
        this.sender = sender;
    }

    @Override
    public String text() {
        return inner.text() + " - " + sender;
    }
}
// OUTPUT:
// [   fort gates open at nine   ]
// [fort gates open at nine]
// FORT GATES OPEN AT NINE! - Jaisalmer Desk`),
    ],
    intermediate: [
        blk(`<h4>Sample 1: writing your own java.io decorator</h4>
<p><b>What it shows:</b> a <code>FilterReader</code> subclass that upper-cases every character, stacked with the JDK's <code>BufferedReader</code>. <b>Why:</b> this is how the real I/O library is designed; once you can write one filter you understand all of <code>java.io</code>.</p>`,
`// DecoratorStreamsDemo - custom FilterReader stacked with BufferedReader
import java.io.BufferedReader;
import java.io.FilterReader;
import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;

// A decorator over any Reader: upper-cases what passes through

public class DecoratorStreamsDemo {
    public static void main(String[] args) throws IOException {
        String data = "line one: pune" + System.lineSeparator() + "line two: nashik";

        // BufferedReader( UpperCaseReader( StringReader ) )
        try (BufferedReader reader = new BufferedReader(
                new UpperCaseReader(new StringReader(data)))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }
    }
}

class UpperCaseReader extends FilterReader {
    UpperCaseReader(Reader in) {
        super(in);
    }

    @Override
    public int read() throws IOException {
        int c = super.read();
        return c == -1 ? c : Character.toUpperCase(c);
    }

    @Override
    public int read(char[] buf, int off, int len) throws IOException {
        int n = super.read(buf, off, len);
        for (int i = off; i < off + n && n > 0; i++) {
            buf[i] = Character.toUpperCase(buf[i]);
        }
        return n;
    }
}
// OUTPUT:
// LINE ONE: PUNE
// LINE TWO: NASHIK`),
        blk(`<h4>Sample 2: pricing rules as decorators</h4>
<p><b>What it shows:</b> a base bill wrapped by discount, GST and delivery decorators. <b>Why:</b> every rule is tiny and testable on its own, and the shop can switch rules per customer by building a different stack.</p>`,
`// DecoratorPricingDemo - billing rules stacked as decorators

public class DecoratorPricingDemo {
    public static void main(String[] args) {
        Bill walkIn = new GstDecorator(new BaseBill("Rajasthani Thali", 500));
        Bill member = new DeliveryDecorator(
                new GstDecorator(new DiscountDecorator(new BaseBill("Rajasthani Thali", 500), 10)));

        System.out.printf("%s => %.2f%n", walkIn.describe(), walkIn.amount());
        System.out.printf("%s => %.2f%n", member.describe(), member.amount());
    }
}

interface Bill {
    double amount();

    String describe();
}

class BaseBill implements Bill {
    private final String item;
    private final double price;

    BaseBill(String item, double price) {
        this.item = item;
        this.price = price;
    }

    public double amount() {
        return price;
    }

    public String describe() {
        return item + " " + price;
    }
}

class DiscountDecorator implements Bill {
    private final Bill inner;
    private final int percent;

    DiscountDecorator(Bill inner, int percent) {
        this.inner = inner;
        this.percent = percent;
    }

    public double amount() {
        return inner.amount() * (100 - percent) / 100.0;
    }

    public String describe() {
        return inner.describe() + " | -" + percent + "%";
    }
}

class GstDecorator implements Bill {
    private final Bill inner;

    GstDecorator(Bill inner) {
        this.inner = inner;
    }

    public double amount() {
        return inner.amount() * 1.18; // 18 percent GST
    }

    public String describe() {
        return inner.describe() + " | +GST 18%";
    }
}

class DeliveryDecorator implements Bill {
    private final Bill inner;

    DeliveryDecorator(Bill inner) {
        this.inner = inner;
    }

    public double amount() {
        return inner.amount() + 40;
    }

    public String describe() {
        return inner.describe() + " | +delivery 40";
    }
}
// OUTPUT:
// Rajasthani Thali 500.0 | +GST 18% => 590.00
// Rajasthani Thali 500.0 | -10% | +GST 18% | +delivery 40 => 571.00`),
        blk(`<h4>Sample 3: wrapping order matters</h4>
<p><b>What it shows:</b> the same two decorators in two orders give different results. <b>Why:</b> a stack is a pipeline; compress-then-encrypt is valid, encrypt-then-compress is useless. Always document the intended order.</p>`,
`// DecoratorOrderDemo - the order of wrapping changes the outcome

public class DecoratorOrderDemo {
    public static void main(String[] args) {
        TextSource a = new RepeatDecorator(new ShiftDecorator(new FixedSource()));
        TextSource b = new ShiftDecorator(new RepeatDecorator(new FixedSource()));

        System.out.println("shift then repeat: " + a.read());
        System.out.println("repeat then shift: " + b.read());
    }
}

interface TextSource {
    String read();
}

class FixedSource implements TextSource {
    public String read() {
        return "abc";
    }
}

class ShiftDecorator implements TextSource {
    private final TextSource inner;

    ShiftDecorator(TextSource inner) {
        this.inner = inner;
    }

    public String read() {
        StringBuilder sb = new StringBuilder();
        for (char c : inner.read().toCharArray()) {
            sb.append((char) (c + 1)); // shift each letter by one
        }
        return sb.toString();
    }
}

class RepeatDecorator implements TextSource {
    private final TextSource inner;

    RepeatDecorator(TextSource inner) {
        this.inner = inner;
    }

    public String read() {
        String s = inner.read();
        return s + "-" + s.toUpperCase(); // duplicate in upper case
    }
}
// OUTPUT:
// shift then repeat: bcd-BCD
// repeat then shift: bcd.BCD`),
        blk(`<h4>Sample 4: JDK collection decorators</h4>
<p><b>What it shows:</b> <code>Collections.unmodifiableList</code> and <code>checkedList</code> are decorators over a normal list. <b>Why:</b> you can hand out a read-only <i>view</i> of internal state without copying it, and the view still reflects later changes.</p>`,
`// DecoratorCollectionsDemo - JDK wrappers around a List
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DecoratorCollectionsDemo {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Nagpur"));
        List<String> readOnly = Collections.unmodifiableList(cities); // decorator

        try {
            readOnly.add("Surat");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify the view");
        }

        cities.add("Indore"); // change the underlying list
        System.out.println("View sees: " + readOnly);

        @SuppressWarnings({"unchecked", "rawtypes"})
        List<String> checked = Collections.checkedList(new ArrayList<String>(), String.class);
        List raw = checked;
        try {
            raw.add(42); // wrong type, rejected at once
        } catch (ClassCastException e) {
            System.out.println("checkedList rejected an Integer");
        }
    }
}
// OUTPUT:
// Cannot modify the view
// View sees: [Pune, Nagpur, Indore]
// checkedList rejected an Integer`),
        blk(`<h4>Common mistakes</h4>
<ul>
<li>Forgetting to forward a method in a decorator, so the wrapped behaviour silently disappears.</li>
<li>Relying on object identity or <code>instanceof</code> of the concrete component: a wrapped object is no longer that class.</li>
<li>Making decorators stateful and sharing one instance between stacks.</li>
<li>Allowing nonsensical orders (encrypt then compress) without documenting or enforcing the order, for example with a builder.</li>
<li>Using Decorator when the extra behaviour is a single fixed feature; a plain method is simpler.</li>
</ul>

<h4>Decorator vs similar patterns</h4>
<table>
<tr><th>Pattern</th><th>Same interface?</th><th>Purpose</th><th>Typical stacking</th></tr>
<tr><td><b>Decorator</b></td><td>Yes</td><td>Add responsibilities</td><td>Many layers, chosen by the client</td></tr>
<tr><td><b>Proxy</b></td><td>Yes</td><td>Control access / lifecycle</td><td>Usually one, often built by the proxy itself</td></tr>
<tr><td><b>Adapter</b></td><td>No</td><td>Convert interface</td><td>One</td></tr>
<tr><td><b>Composite</b></td><td>Yes</td><td>Treat group like one object</td><td>Many children, not layers</td></tr>
<tr><td><b>Chain of Responsibility</b></td><td>Handler chain</td><td>One handler may stop the chain</td><td>Each link decides to pass on</td></tr>
</table>`),
    ],
    expert: [
        blk(`<h4>Real-time example 1: request handler middleware</h4>
<p>Web frameworks (servlet filters, Spring interceptors, Express middleware) are decorators in disguise. Here a flaky service is wrapped by retry, then by logging, without the service knowing. The retry layer is the interesting one: it re-calls the inner handler.</p>`,
`// HandlerMiddlewareDemo - logging and retry decorators over a flaky service

public class HandlerMiddlewareDemo {
    public static void main(String[] args) {
        Handler plain = new LoggingHandler(new FlakyInventoryService());
        try {
            plain.handle("SKU-Jodhpur-1");
        } catch (RuntimeException e) {
            System.out.println("plain stack gave up");
        }

        Handler resilient = new LoggingHandler(new RetryHandler(new FlakyInventoryService(), 3));
        resilient.handle("SKU-Jodhpur-2");
    }
}

interface Handler {
    String handle(String request);
}

// Fails twice, then succeeds, like a service warming up
class FlakyInventoryService implements Handler {
    private int calls = 0;

    public String handle(String request) {
        calls++;
        if (calls < 3) {
            throw new IllegalStateException("timeout #" + calls);
        }
        return "stock for " + request + " = 17";
    }
}

class RetryHandler implements Handler {
    private final Handler inner;
    private final int maxAttempts;

    RetryHandler(Handler inner, int maxAttempts) {
        this.inner = inner;
        this.maxAttempts = maxAttempts;
    }

    public String handle(String request) {
        RuntimeException last = null;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return inner.handle(request);
            } catch (RuntimeException e) {
                last = e; // remember and try again
            }
        }
        throw last;
    }
}

class LoggingHandler implements Handler {
    private final Handler inner;

    LoggingHandler(Handler inner) {
        this.inner = inner;
    }

    public String handle(String request) {
        System.out.println("-> " + request);
        try {
            String response = inner.handle(request);
            System.out.println("<- " + response);
            return response;
        } catch (RuntimeException e) {
            System.out.println("<- FAILED " + e.getMessage());
            throw e;
        }
    }
}
// OUTPUT:
// -> SKU-Jodhpur-1
// <- FAILED timeout #1
// plain stack gave up
// -> SKU-Jodhpur-2
// <- stock for SKU-Jodhpur-2 = 17`),
        blk(`<h4>Real-time example 2: caching decorator over a repository</h4>
<p>A slow repository (database) is wrapped by a caching decorator that implements the same interface. Callers do not change; hit and miss counts prove the cache works. This is the idea behind Spring's <code>@Cacheable</code>, although Spring builds the wrapper as a proxy.</p>`,
`// CachingRepositoryDemo - a caching decorator hides slow lookups
import java.util.HashMap;
import java.util.Map;

public class CachingRepositoryDemo {
    public static void main(String[] args) {
        SlowDatabaseRepository db = new SlowDatabaseRepository();
        CachingRepository repo = new CachingRepository(db);

        int[] ids = {1, 2, 1, 1, 2, 3, 3};
        for (int id : ids) {
            System.out.println("customer " + id + " = " + repo.findName(id));
        }

        System.out.println("hits=" + repo.hits + " misses=" + repo.misses
                + " dbQueries=" + db.queries);
    }
}

interface CustomerRepository {
    String findName(int id);
}

class SlowDatabaseRepository implements CustomerRepository {
    int queries = 0;

    public String findName(int id) {
        queries++; // pretend this costs 200 ms
        return switch (id) {
            case 1 -> "Anita Rao";
            case 2 -> "Vikram Singh";
            default -> "unknown";
        };
    }
}

class CachingRepository implements CustomerRepository {
    private final CustomerRepository inner;
    private final Map<Integer, String> cache = new HashMap<>();
    int hits = 0;
    int misses = 0;

    CachingRepository(CustomerRepository inner) {
        this.inner = inner;
    }

    public String findName(int id) {
        if (cache.containsKey(id)) {
            hits++;
            return cache.get(id);
        }
        misses++;
        String value = inner.findName(id);
        cache.put(id, value);
        return value;
    }
}
// OUTPUT:
// customer 1 = Anita Rao
// customer 2 = Vikram Singh
// customer 1 = Anita Rao
// customer 1 = Anita Rao
// customer 2 = Vikram Singh
// customer 3 = unknown
// customer 3 = unknown
// hits=4 misses=3 dbQueries=3`),
        blk(`<h4>Sample mini project: fort entry ticket with add-ons</h4>
<p>A base ticket is wrapped by optional add-ons (guide, audio kit, parking). A small receipt printer walks the layers through <code>lines()</code> so each add-on shows up as its own line. Three visitors choose three different stacks.</p>`,
`// FortTicketMiniProject - add-on decorators with a printed receipt
import java.util.ArrayList;
import java.util.List;

public class FortTicketMiniProject {
    static void print(String visitor, Ticket t) {
        System.out.println("== " + visitor + " ==");
        t.lines().forEach(l -> System.out.println("  " + l));
        System.out.println("  TOTAL : " + t.price());
    }

    public static void main(String[] args) {
        print("Meera", new EntryTicket("Mehrangarh"));
        print("Arjun", new GuideAddOn(new EntryTicket("Mehrangarh")));
        Ticket full = new ParkingAddOn(
                new AudioAddOn(new GuideAddOn(new EntryTicket("Mehrangarh"))));
        print("Kabir", full);
    }
}

interface Ticket {
    int price();

    List<String> lines();
}

class EntryTicket implements Ticket {
    private final String fort;

    EntryTicket(String fort) {
        this.fort = fort;
    }

    public int price() {
        return 100;
    }

    public List<String> lines() {
        List<String> out = new ArrayList<>();
        out.add("Entry " + fort + " : 100");
        return out;
    }
}

abstract class AddOn implements Ticket {
    protected final Ticket base;

    AddOn(Ticket base) {
        this.base = base;
    }

    abstract String label();

    abstract int cost();

    public int price() {
        return base.price() + cost();
    }

    public List<String> lines() {
        List<String> out = base.lines();
        out.add(label() + " : " + cost());
        return out;
    }
}

class GuideAddOn extends AddOn {
    GuideAddOn(Ticket base) {
        super(base);
    }

    String label() {
        return "Guide";
    }

    int cost() {
        return 250;
    }
}

class AudioAddOn extends AddOn {
    AudioAddOn(Ticket base) {
        super(base);
    }

    String label() {
        return "Audio kit";
    }

    int cost() {
        return 80;
    }
}

class ParkingAddOn extends AddOn {
    ParkingAddOn(Ticket base) {
        super(base);
    }

    String label() {
        return "Parking";
    }

    int cost() {
        return 50;
    }
}
// OUTPUT:
// == Meera ==
//   Entry Mehrangarh : 100
//   TOTAL : 100
// == Arjun ==
//   Entry Mehrangarh : 100
//   Guide : 250
//   TOTAL : 350
// == Kabir ==
//   Entry Mehrangarh : 100
//   Guide : 250
//   Audio kit : 80
//   Parking : 50
//   TOTAL : 480`),
        blk(`<h4>Testing, Spring and performance notes</h4>
<ul>
<li><b>Testing</b>: test each decorator against a mock or stub of the interface and verify it forwards exactly once (or the right number of times for retry). Test a few real stacks as integration tests, especially ordering.</li>
<li><b>Spring</b>: <code>@Transactional</code>, <code>@Cacheable</code> and <code>@Async</code> are applied by wrapping your bean in a generated proxy that decorates it. Use <code>@Primary</code> or <code>@Qualifier</code> and a configuration class to assemble explicit decorator stacks of your own beans.</li>
<li><b>Performance</b>: each layer adds a virtual call and maybe an allocation; fine for dozens of layers, but avoid creating a new stack per element in a hot loop. Buffering decorators (<code>BufferedInputStream</code>) are decorators that <i>improve</i> performance.</li>
<li>Prefer the builder or factory that returns the interface, so callers never see the concrete wrapping order.</li>
</ul>

<h4>Anti-patterns</h4>
<ul>
<li><b>Decorator soup</b>: ten layers where nobody knows which one changed the result; log the stack in debug mode.</li>
<li><b>Leaky decorator</b>: adding public methods that only exist on one decorator, forcing casts in clients.</li>
<li>Using inheritance for the same effect (<code>MilkSugarCoffee</code>) and creating a class explosion.</li>
</ul>`),
    ],
    interviewQA: [
        ['What is the Decorator pattern?', 'A structural pattern that adds responsibilities to an object dynamically by wrapping it in objects that share its interface. It is a flexible alternative to subclassing for extending behaviour.'],
        ['Why is Decorator better than inheritance for optional features?', 'Inheritance fixes behaviour at compile time and needs a subclass per combination. Decorators are combined at runtime, so n features need n small classes instead of 2^n subclasses.'],
        ['Name Decorator examples in the JDK.', 'BufferedInputStream, DataInputStream and GZIPOutputStream (FilterInputStream family), BufferedReader, Collections.unmodifiableList and synchronizedList, and the Servlet request and response wrappers.'],
        ['Decorator vs Proxy: what is the difference?', 'Both implement the same interface and hold a reference to the real object. A decorator adds behaviour and is usually assembled by the client; a proxy controls access (lazy loading, security, remote call) and often manages the real object itself.'],
        ['Does the order of decorators matter?', 'Yes. Each layer sees the result of the inner layers, so compress-then-encrypt differs from encrypt-then-compress, and a discount before tax differs from tax before discount. Document or encode the order in a builder.'],
        ['What are the drawbacks of Decorator?', 'Many small classes, harder debugging through several layers, order sensitivity, and identity or instanceof checks no longer work on the wrapped component.'],
    ],
};

const facade: TopicExtra = {
    beginner: [
        blk(`<h4>In one minute</h4>
<p>A <b>Facade</b> is one easy class placed in front of a group of complicated classes (a <b>subsystem</b>). Clients call one or two simple methods such as <code>checkout()</code>; the facade calls the many subsystem classes in the right order. The subsystem is not hidden or locked: advanced users can still use it directly.</p>

<h4>Everyday analogies</h4>
<ul>
<li><b>Hotel reception</b>: you say "I want a room"; reception talks to housekeeping, billing and security for you.</li>
<li><b>Car ignition button</b>: one press starts fuel pump, starter motor, ECU and dashboard.</li>
<li><b>Travel agent</b>: one call books flight, hotel and cab.</li>
</ul>

<h4>Where you see it in Java / JDK / Spring</h4>
<ul>
<li><code>java.nio.file.Files</code>: <code>Files.readAllLines(path)</code> hides channels, buffers, decoders and closing.</li>
<li><code>java.net.http.HttpClient</code> hides sockets, TLS, redirects and threading behind <code>send()</code>.</li>
<li><code>javax.faces.context.FacesContext</code>, <code>java.sql.DriverManager</code>, and <code>Executors</code> (factory methods over thread pools).</li>
<li>Spring: <code>JdbcTemplate</code>, <code>RestTemplate</code> and <code>JmsTemplate</code> are facades over verbose low-level APIs; a <code>@Service</code> class is the facade of your business layer.</li>
<li>SLF4J's <code>LoggerFactory</code> is a facade over logging libraries.</li>
</ul>

<h4>Structure</h4>
<pre>
Client ---&gt; Facade ---&gt; SubsystemA
                  ---&gt; SubsystemB
                  ---&gt; SubsystemC
(client may still use A, B, C directly if it needs fine control)
</pre>

<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it to give a simple entry point to a complex library or legacy system.</li>
<li>Use it to layer a system: one facade per layer reduces coupling between layers.</li>
<li>Do NOT use it to hide a badly designed subsystem forever; fix the design if you own it.</li>
<li>Do NOT let the facade become a god class that contains the business logic itself; it should only coordinate.</li>
</ul>

<h4>Sample: a good-night routine for a smart home</h4>
<p>Three devices must be switched in a fixed order. The facade offers one method; the client does not know the order.</p>`,
`// FacadeBeginnerDemo - one button controls three devices

public class FacadeBeginnerDemo {
    public static void main(String[] args) {
        SmartHomeFacade home = new SmartHomeFacade();
        System.out.println("-- Good night --");
        home.goodNight();
        System.out.println("-- Leaving --");
        home.leaveHome();
    }
}

class Lights {
    void off() {
        System.out.println("Lights: all off");
    }
}

class Fan {
    void setSpeed(int level) {
        System.out.println("Fan: speed " + level);
    }
}

class Alarm {
    void arm(String mode) {
        System.out.println("Alarm: armed in " + mode + " mode");
    }
}

// The facade coordinates the subsystem classes
class SmartHomeFacade {
    private final Lights lights = new Lights();
    private final Fan fan = new Fan();
    private final Alarm alarm = new Alarm();

    void goodNight() {
        lights.off();
        fan.setSpeed(2);
        alarm.arm("night");
    }

    void leaveHome() {
        lights.off();
        fan.setSpeed(0);
        alarm.arm("away");
    }
}
// OUTPUT:
// -- Good night --
// Lights: all off
// Fan: speed 2
// Alarm: armed in night mode
// -- Leaving --
// Lights: all off
// Fan: speed 0
// Alarm: armed in away mode`),
    ],
    intermediate: [
        blk(`<h4>Sample 1: home theatre facade</h4>
<p><b>What it shows:</b> the textbook case, a facade starting and stopping five components in order. <b>Why:</b> the client avoids a dozen calls that must happen in exactly the right sequence, and the facade is the single place to change that sequence.</p>`,
`// HomeTheatreFacadeDemo - start and stop a movie with one call

public class HomeTheatreFacadeDemo {
    public static void main(String[] args) {
        HomeTheatreFacade theatre = new HomeTheatreFacade();
        theatre.watchMovie("Lagaan");
        theatre.endMovie();
    }
}

class Projector {
    void on() {
        System.out.println("Projector on");
    }

    void off() {
        System.out.println("Projector off");
    }
}

class SoundSystem {
    void on() {
        System.out.println("Sound system on");
    }

    void setVolume(int v) {
        System.out.println("Volume set to " + v);
    }

    void off() {
        System.out.println("Sound system off");
    }
}

class StreamingPlayer {
    void play(String movie) {
        System.out.println("Playing " + movie);
    }

    void stop() {
        System.out.println("Player stopped");
    }
}

class RoomLights {
    void dim(int percent) {
        System.out.println("Lights dimmed to " + percent + "%");
    }
}

class HomeTheatreFacade {
    private final Projector projector = new Projector();
    private final SoundSystem sound = new SoundSystem();
    private final StreamingPlayer player = new StreamingPlayer();
    private final RoomLights lights = new RoomLights();

    void watchMovie(String movie) {
        System.out.println("Get ready to watch " + movie);
        lights.dim(10);
        projector.on();
        sound.on();
        sound.setVolume(12);
        player.play(movie);
    }

    void endMovie() {
        System.out.println("Shutting down");
        player.stop();
        sound.off();
        projector.off();
        lights.dim(100);
    }
}
// OUTPUT:
// Get ready to watch Lagaan
// Lights dimmed to 10%
// Projector on
// Sound system on
// Volume set to 12
// Playing Lagaan
// Shutting down
// Player stopped
// Sound system off
// Projector off
// Lights dimmed to 100%`),
        blk(`<h4>Sample 2: order checkout facade</h4>
<p><b>What it shows:</b> a facade returning a result object while hiding four services (inventory, payment, shipping, notification). <b>Why:</b> the web controller needs one call and one result; the rules about order, and what happens when one step refuses, live in one place.</p>`,
`// OrderCheckoutFacadeDemo - one checkout call, four services

public class OrderCheckoutFacadeDemo {
    public static void main(String[] args) {
        CheckoutFacade checkout = new CheckoutFacade();
        System.out.println(checkout.placeOrder("Rahul", "SKU-9", 2, 4500, "Jaipur"));
        System.out.println(checkout.placeOrder("Sneha", "SKU-9", 9, 9000, "Pune"));
        System.out.println(checkout.placeOrder("Imran", "SKU-3", 1, 55000, "Lucknow"));
    }
}

class InventoryService {
    boolean reserve(String sku, int qty) {
        return qty <= 5; // pretend stock is 5
    }
}

class PaymentService {
    boolean charge(String customer, double amount) {
        return amount < 20000;
    }
}

class ShippingService {
    String schedule(String city) {
        return "TRK-" + city.toUpperCase().substring(0, 3) + "-1001";
    }
}

class NotificationService {
    void send(String customer, String text) {
        System.out.println("  SMS to " + customer + ": " + text);
    }
}

class CheckoutFacade {
    private final InventoryService inventory = new InventoryService();
    private final PaymentService payment = new PaymentService();
    private final ShippingService shipping = new ShippingService();
    private final NotificationService notifier = new NotificationService();

    String placeOrder(String customer, String sku, int qty, double total, String city) {
        if (!inventory.reserve(sku, qty)) {
            return "REJECTED: out of stock";
        }
        if (!payment.charge(customer, total)) {
            return "REJECTED: payment failed";
        }
        String tracking = shipping.schedule(city);
        notifier.send(customer, "Order shipped, tracking " + tracking);
        return "OK " + tracking;
    }
}
// OUTPUT:
//   SMS to Rahul: Order shipped, tracking TRK-JAI-1001
// OK TRK-JAI-1001
// REJECTED: out of stock
// REJECTED: payment failed`),
        blk(`<h4>Sample 3: a facade inside the JDK, java.nio.file.Files</h4>
<p><b>What it shows:</b> a write, read and delete round trip with three one-line calls. <b>Why:</b> the old way needs streams, writers, buffers and finally blocks; <code>Files</code> is a facade over all of that, which is exactly the benefit you want from your own facades.</p>`,
`// FilesFacadeDemo - the JDK Files class as a facade
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class FilesFacadeDemo {
    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("forts", ".txt");

        Files.write(file, List.of("Red Fort", "Agra Fort", "Fatehpur Sikri"));
        List<String> lines = Files.readAllLines(file);
        System.out.println("Read " + lines.size() + " lines: " + lines);

        Files.writeString(file, "Only one line");
        System.out.println("Now: " + Files.readString(file));
        System.out.println("Size in bytes: " + Files.size(file));

        Files.delete(file);
        System.out.println("Exists after delete: " + Files.exists(file));
    }
}
// OUTPUT:
// Read 3 lines: [Red Fort, Agra Fort, Fatehpur Sikri]
// Now: Only one line
// Size in bytes: 13
// Exists after delete: false`),
        blk(`<h4>Common mistakes</h4>
<ul>
<li><b>God facade</b>: it grows to hundreds of methods and holds business rules. Split into several facades by use case.</li>
<li>Forcing every access through the facade and removing power-user access to the subsystem.</li>
<li>Making subsystem classes depend on the facade (a cycle). The dependency goes one way: facade to subsystem.</li>
<li>Returning subsystem types from the facade, so clients are coupled to them after all.</li>
<li>Swallowing errors: the facade should translate subsystem failures into meaningful exceptions or result objects.</li>
</ul>

<h4>Facade vs Adapter vs Mediator vs Proxy</h4>
<table>
<tr><th>Pattern</th><th>Goal</th><th>Direction of knowledge</th><th>Number of objects behind it</th></tr>
<tr><td><b>Facade</b></td><td>Simplify use of a subsystem</td><td>Facade knows subsystem; subsystem does not know facade</td><td>Many</td></tr>
<tr><td><b>Adapter</b></td><td>Convert one interface to another</td><td>Adapter knows adaptee</td><td>Usually one</td></tr>
<tr><td><b>Mediator</b></td><td>Let peers talk without knowing each other</td><td>Peers know the mediator</td><td>Many peers</td></tr>
<tr><td><b>Proxy</b></td><td>Control access, same interface</td><td>Proxy knows real subject</td><td>One</td></tr>
</table>`),
    ],
    expert: [
        blk(`<h4>Real-time example 1: trip planner as an aggregating facade (API gateway / BFF)</h4>
<p>A mobile app needs weather, hotel price and cab estimate on one screen. The facade calls the three services in parallel with <code>CompletableFuture</code> and returns one combined answer, so the app makes a single request. This is the backend-for-frontend and API gateway idea at class level.</p>`,
`// TripPlannerFacadeDemo - parallel aggregation behind one facade
import java.util.concurrent.CompletableFuture;

public class TripPlannerFacadeDemo {
    public static void main(String[] args) {
        TripPlannerFacade planner = new TripPlannerFacade();

        for (String city : new String[] {"Goa", "Mysuru"}) {
            TripSummary t = planner.plan(city);
            System.out.println(t.city() + ": " + t.weather() + ", hotel " + t.hotel()
                    + "/night, cab " + t.cab());
            System.out.println("  3 nights estimate: Rs " + t.estimate(3));
        }
    }
}

class WeatherService {
    String forecast(String city) {
        return city.equals("Goa") ? "31C humid" : "24C clear";
    }
}

class HotelService {
    int nightlyRate(String city) {
        return city.equals("Goa") ? 5200 : 3100;
    }
}

class CabService {
    int airportFare(String city) {
        return city.equals("Goa") ? 900 : 650;
    }
}

record TripSummary(String city, String weather, int hotel, int cab) {
    int estimate(int nights) {
        return hotel * nights + cab * 2;
    }
}

class TripPlannerFacade {
    private final WeatherService weather = new WeatherService();
    private final HotelService hotels = new HotelService();
    private final CabService cabs = new CabService();

    TripSummary plan(String city) {
        // Start the three lookups in parallel
        CompletableFuture<String> w = CompletableFuture.supplyAsync(() -> weather.forecast(city));
        CompletableFuture<Integer> h =
                CompletableFuture.supplyAsync(() -> hotels.nightlyRate(city));
        CompletableFuture<Integer> c = CompletableFuture.supplyAsync(() -> cabs.airportFare(city));

        return new TripSummary(city, w.join(), h.join(), c.join());
    }
}
// OUTPUT:
// Goa: 31C humid, hotel 5200/night, cab 900
//   3 nights estimate: Rs 17400
// Mysuru: 24C clear, hotel 3100/night, cab 650
//   3 nights estimate: Rs 10600`),
        blk(`<h4>Real-time example 2: transactional facade with compensation</h4>
<p>A facade that calls several services must decide what happens when step 3 fails. Here the booking facade releases the seat if payment fails (a tiny saga). In Spring the same job is done by a <code>@Transactional</code> service method; across services you need compensating actions as shown.</p>`,
`// BookingFacadeCompensationDemo - undo earlier steps when a later one fails
import java.util.ArrayList;
import java.util.List;

public class BookingFacadeCompensationDemo {
    public static void main(String[] args) {
        BookingFacade facade = new BookingFacade(new WalletService(1000));
        System.out.println("Result: " + facade.book("12A", 700));
        System.out.println("Result: " + facade.book("12B", 700));
    }
}

class SeatService {
    private final List<String> held = new ArrayList<>();

    void hold(String seat) {
        held.add(seat);
        System.out.println("Seat " + seat + " held");
    }

    void release(String seat) {
        held.remove(seat);
        System.out.println("Seat " + seat + " released");
    }
}

class WalletService {
    private int balance;

    WalletService(int balance) {
        this.balance = balance;
    }

    void debit(int amount) {
        if (amount > balance) {
            throw new IllegalStateException("insufficient balance " + balance);
        }
        balance -= amount;
        System.out.println("Debited " + amount + ", left " + balance);
    }
}

class BookingFacade {
    private final SeatService seats = new SeatService();
    private final WalletService wallet;

    BookingFacade(WalletService wallet) {
        this.wallet = wallet;
    }

    boolean book(String seat, int fare) {
        seats.hold(seat);
        try {
            wallet.debit(fare);
            System.out.println("Booking confirmed for " + seat);
            return true;
        } catch (IllegalStateException e) {
            System.out.println("Payment problem: " + e.getMessage());
            seats.release(seat); // compensate the first step
            return false;
        }
    }
}
// OUTPUT:
// Seat 12A held
// Debited 700, left 300
// Booking confirmed for 12A
// Result: true
// Seat 12B held
// Payment problem: insufficient balance 300
// Seat 12B released
// Result: false`),
        blk(`<h4>Sample mini project: hotel front desk</h4>
<p>Guests only talk to <code>FrontDesk</code>. Behind it, rooms, billing and key cards cooperate. Check-in assigns a room and issues a key; check-out totals the nights and frees the room.</p>`,
`// HotelFrontDeskMiniProject - a facade over rooms, billing and key cards
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;

public class HotelFrontDeskMiniProject {
    public static void main(String[] args) {
        FrontDesk desk = new FrontDesk();
        System.out.println(desk.checkIn("Asha", 2));
        System.out.println(desk.checkIn("Bhaskar", 1));
        System.out.println(desk.checkIn("Chitra", 3));
        System.out.println(desk.checkIn("Dev", 1));
        System.out.println(desk.checkOut("Bhaskar"));
        System.out.println(desk.checkIn("Dev", 1));
    }
}

class RoomInventory {
    private final Deque<Integer> free = new ArrayDeque<>();

    RoomInventory() {
        for (int r = 101; r <= 103; r++) {
            free.add(r);
        }
    }

    Integer assign() {
        return free.poll();
    }

    void release(int room) {
        free.addFirst(room);
    }
}

class Billing {
    private final Map<String, Integer> nightsByGuest = new HashMap<>();

    void open(String guest, int nights) {
        nightsByGuest.put(guest, nights);
    }

    int close(String guest, int rate) {
        return nightsByGuest.remove(guest) * rate;
    }
}

class KeyCards {
    String issue(String guest, int room) {
        return "KEY-" + room + "-" + guest.charAt(0);
    }
}

class FrontDesk {
    private final RoomInventory rooms = new RoomInventory();
    private final Billing billing = new Billing();
    private final KeyCards keys = new KeyCards();
    private final Map<String, Integer> roomOf = new HashMap<>();

    String checkIn(String guest, int nights) {
        Integer room = rooms.assign();
        if (room == null) {
            return guest + ": sorry, hotel is full";
        }
        roomOf.put(guest, room);
        billing.open(guest, nights);
        return guest + ": room " + room + ", " + keys.issue(guest, room);
    }

    String checkOut(String guest) {
        int room = roomOf.remove(guest);
        rooms.release(room);
        return guest + ": paid Rs " + billing.close(guest, 2500) + ", room " + room + " free";
    }
}
// OUTPUT:
// Asha: room 101, KEY-101-A
// Bhaskar: room 102, KEY-102-B
// Chitra: room 103, KEY-103-C
// Dev: sorry, hotel is full
// Bhaskar: paid Rs 2500, room 102 free
// Dev: room 102, KEY-102-D`),
        blk(`<h4>Testing, Spring and performance notes</h4>
<ul>
<li><b>Testing</b>: inject the subsystem collaborators through the constructor so a unit test can pass mocks and verify call order with Mockito's <code>InOrder</code>. Keep one integration test with the real subsystem.</li>
<li><b>Spring</b>: a <code>@Service</code> facade with constructor-injected beans is the standard way to expose a use case to controllers; put <code>@Transactional</code> on the facade method so all steps share one transaction. In microservices, an API gateway or BFF plays the same role over the network.</li>
<li><b>Performance</b>: a facade is a convenient place to batch calls, run independent calls in parallel (as in the trip planner) and add caching or timeouts. Do not hide an N+1 call pattern behind a friendly method name.</li>
<li>Keep facades thin and stateless so they scale and are thread safe.</li>
</ul>

<h4>Anti-patterns</h4>
<ul>
<li><b>Facade as dumping ground</b>: unrelated methods collected in one <code>ApplicationManager</code>.</li>
<li><b>Pass-through facade</b> that just renames subsystem methods; it adds a class and no simplification.</li>
<li><b>Chatty facade</b> returning internal entities to remote clients, forcing many follow-up calls.</li>
</ul>`),
    ],
    interviewQA: [
        ['What is the Facade pattern?', 'A structural pattern that provides a single, simplified interface to a set of classes in a subsystem. It makes the subsystem easier to use and reduces coupling between clients and the subsystem internals.'],
        ['Does a Facade hide the subsystem completely?', 'No. It offers a convenient path for common tasks, but the subsystem classes remain accessible for clients that need full control. Hiding is optional and is not the main point.'],
        ['Give examples of Facade in the JDK and Spring.', 'java.nio.file.Files, HttpClient, Executors; in Spring JdbcTemplate, RestTemplate, JmsTemplate, and service-layer classes that coordinate repositories.'],
        ['Facade vs Adapter?', 'Adapter converts one interface into another that a client expects, usually wrapping one class. Facade defines a new simpler interface over many classes. Adapter is about compatibility, Facade about simplicity.'],
        ['How do you avoid a God-object facade?', 'Create several facades, each for one use case or module, keep them free of business rules (delegate to the subsystem), and keep dependencies one-directional.'],
        ['How does Facade relate to microservices?', 'An API gateway or backend-for-frontend is a facade at service level: it aggregates calls to several services into one client-friendly endpoint, and can add authentication, caching and rate limiting.'],
    ],
};

const proxy: TopicExtra = {
    beginner: [
        blk(`<h4>In one minute</h4>
<p>A <b>Proxy</b> is a stand-in object with the <i>same interface</i> as the real object (the <b>real subject</b>). Callers talk to the proxy; the proxy decides whether, when and how to forward the call. That gives you a place to add laziness, security checks, caching, logging or remote access without touching the real class or the callers.</p>

<h4>Everyday analogies</h4>
<ul>
<li><b>Cheque or UPI</b>: it stands in for cash and the bank decides whether to release money.</li>
<li><b>Company receptionist</b>: you reach the manager only if the receptionist lets you in.</li>
<li><b>Power of attorney</b>: someone acts on your behalf but within limits.</li>
</ul>

<h4>Kinds of proxy</h4>
<ul>
<li><b>Virtual proxy</b>: creates the expensive object only when first needed (lazy loading).</li>
<li><b>Protection proxy</b>: checks permissions before forwarding.</li>
<li><b>Remote proxy</b>: represents an object in another process or machine (RMI stub, REST client).</li>
<li><b>Caching / smart-reference proxy</b>: remembers results, counts references, logs calls.</li>
</ul>

<h4>Where you see it in Java / JDK / Spring</h4>
<ul>
<li><code>java.lang.reflect.Proxy</code> creates proxies at runtime from interfaces (JDK dynamic proxy).</li>
<li><code>Collections.synchronizedMap</code> style wrappers and RMI stubs (<code>java.rmi</code>).</li>
<li>Hibernate lazy loading: an entity reference is a generated subclass proxy that loads its row on first access.</li>
<li>Spring AOP: <code>@Transactional</code>, <code>@Cacheable</code>, <code>@Async</code>, <code>@Secured</code> work because Spring injects a proxy (JDK proxy or CGLIB subclass) instead of your bean.</li>
</ul>

<h4>Structure</h4>
<pre>
Client ---&gt; Subject (interface)
                ^            ^
                |            |
          RealSubject  &lt;---- Proxy  (has-a RealSubject, same interface)
</pre>

<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it for lazy loading, access control, caching, logging, or hiding network calls behind a normal interface.</li>
<li>Do NOT use it when a simple <code>if</code> inside the class is enough and there is only one such concern.</li>
<li>Do NOT forget the cost: hidden remote calls look like cheap local calls, which is dangerous in loops.</li>
</ul>

<h4>Sample: a lazy report proxy</h4>
<p>Building a report is slow. The proxy creates it on the first <code>show()</code> call only, so a program that never shows the report never pays for it.</p>`,
`// ProxyBeginnerDemo - lazy creation of an expensive object

public class ProxyBeginnerDemo {
    public static void main(String[] args) {
        Report report = new LazyReportProxy("March");
        System.out.println("Proxy created, nothing built yet");

        System.out.println("First show:");
        report.show();

        System.out.println("Second show:");
        report.show(); // reuses the real object
    }
}

interface Report {
    void show();
}

class SalesReport implements Report {
    private final String month;

    SalesReport(String month) {
        this.month = month;
        System.out.println("  (building report for " + month + " - slow)");
    }

    @Override
    public void show() {
        System.out.println("  Sales report " + month + ": Rs 12,40,000");
    }
}

class LazyReportProxy implements Report {
    private final String month;
    private SalesReport real; // created only when needed

    LazyReportProxy(String month) {
        this.month = month;
    }

    @Override
    public void show() {
        if (real == null) {
            real = new SalesReport(month);
        }
        real.show();
    }
}
// OUTPUT:
// Proxy created, nothing built yet
// First show:
//   (building report for March - slow)
//   Sales report March: Rs 12,40,000
// Second show:
//   Sales report March: Rs 12,40,000`),
    ],
    intermediate: [
        blk(`<h4>Sample 1: protection proxy</h4>
<p><b>What it shows:</b> the same interface with a role check in front of the real account. <b>Why:</b> security rules stay out of the business class and cannot be forgotten by a caller, because callers only receive the proxy.</p>`,
`// ProxyProtectionDemo - role-based access in front of a real object

public class ProxyProtectionDemo {
    public static void main(String[] args) {
        BankAccount real = new SavingsAccount();
        BankAccount asClerk = new AccountSecurityProxy(real, "CLERK");
        BankAccount asOwner = new AccountSecurityProxy(real, "OWNER");

        asClerk.withdraw(500);
        asOwner.withdraw(2500);
        System.out.println("Balance seen by clerk: " + asClerk.balance());
    }
}

interface BankAccount {
    void withdraw(int amount);

    int balance();
}

class SavingsAccount implements BankAccount {
    private int money = 10000;

    public void withdraw(int amount) {
        money -= amount;
        System.out.println("Withdrew " + amount + ", balance " + money);
    }

    public int balance() {
        return money;
    }
}

class AccountSecurityProxy implements BankAccount {
    private final BankAccount real;
    private final String role;

    AccountSecurityProxy(BankAccount real, String role) {
        this.real = real;
        this.role = role;
    }

    public void withdraw(int amount) {
        if (!role.equals("OWNER")) {
            System.out.println("Denied: " + role + " cannot withdraw");
            return;
        }
        real.withdraw(amount);
    }

    public int balance() {
        return real.balance(); // everybody may look
    }
}
// OUTPUT:
// Denied: CLERK cannot withdraw
// Withdrew 2500, balance 7500
// Balance seen by clerk: 7500`),
        blk(`<h4>Sample 2: JDK dynamic proxy for logging and timing</h4>
<p><b>What it shows:</b> one <code>InvocationHandler</code> that logs every call of <i>any</i> interface. <b>Why:</b> hand-written proxies need one class per interface; a dynamic proxy generates the class at runtime, which is how Spring AOP and many mocking libraries work.</p>`,
`// ProxyDynamicDemo - java.lang.reflect.Proxy with one generic handler
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.util.Arrays;

public class ProxyDynamicDemo {
    public static void main(String[] args) {
        CityService real = new CityServiceImpl();

        CityService proxy = (CityService) Proxy.newProxyInstance(
                CityService.class.getClassLoader(),
                new Class<?>[] {CityService.class},
                new LoggingHandler(real));

        proxy.describe("Udaipur");
        proxy.population("Kota");
        System.out.println("Is proxy class: " + Proxy.isProxyClass(proxy.getClass()));
    }
}

interface CityService {
    String describe(String city);

    int population(String city);
}

class CityServiceImpl implements CityService {
    public String describe(String city) {
        return city + " is a historic city";
    }

    public int population(String city) {
        return city.length() * 100000;
    }
}

class LoggingHandler implements InvocationHandler {
    private final Object target;

    LoggingHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, java.lang.reflect.Method method, Object[] args)
            throws Throwable {
        System.out.println("CALL " + method.getName() + Arrays.toString(args));
        Object result = method.invoke(target, args); // forward to the real object
        System.out.println("RETURN " + result);
        return result;
    }
}
// OUTPUT:
// CALL describe[Udaipur]
// RETURN Udaipur is a historic city
// CALL population[Kota]
// RETURN 400000
// Is proxy class: true`),
        blk(`<h4>Sample 3: rate-limiting proxy (smart reference)</h4>
<p><b>What it shows:</b> a proxy that counts calls and refuses after a quota. <b>Why:</b> API clients and gateways protect a scarce resource this way, and the real service stays unaware.</p>`,
`// ProxyRateLimitDemo - allow only a few calls per window

public class ProxyRateLimitDemo {
    public static void main(String[] args) {
        SmsGateway gateway = new RateLimitedSmsProxy(new RealSmsGateway(), 2);

        for (int i = 1; i <= 4; i++) {
            System.out.println("msg " + i + ": " + gateway.send("98765" + i, "OTP 4821"));
        }
    }
}

interface SmsGateway {
    String send(String number, String text);
}

class RealSmsGateway implements SmsGateway {
    public String send(String number, String text) {
        return "sent to " + number;
    }
}

class RateLimitedSmsProxy implements SmsGateway {
    private final SmsGateway real;
    private final int limit;
    private int used = 0;

    RateLimitedSmsProxy(SmsGateway real, int limit) {
        this.real = real;
        this.limit = limit;
    }

    public String send(String number, String text) {
        if (used >= limit) {
            return "blocked: quota of " + limit + " reached";
        }
        used++;
        return real.send(number, text) + " (" + used + "/" + limit + ")";
    }
}
// OUTPUT:
// msg 1: sent to 987651 (1/2)
// msg 2: sent to 987652 (2/2)
// msg 3: blocked: quota of 2 reached
// msg 4: blocked: quota of 2 reached`),
        blk(`<h4>Sample 4: remote proxy with a hidden network call</h4>
<p><b>What it shows:</b> a local-looking interface whose proxy "serializes" the request to a fake server. <b>Why:</b> RMI stubs, gRPC stubs and Feign clients do exactly this; the caller writes <code>weather.today(...)</code> and never sees the transport.</p>`,
`// ProxyRemoteDemo - a client proxy that talks to a simulated server
import java.util.HashMap;
import java.util.Map;

public class ProxyRemoteDemo {
    public static void main(String[] args) {
        WeatherRemoteProxy proxy = new WeatherRemoteProxy();
        WeatherApi api = proxy;

        System.out.println("Chennai: " + api.today("Chennai"));
        System.out.println("Shillong: " + api.today("Shillong"));
        System.out.println("Network calls made: " + proxy.requests());
    }
}

interface WeatherApi {
    String today(String city);
}

// Plays the role of the remote machine
class FakeServer {
    private final Map<String, String> data = new HashMap<>();

    FakeServer() {
        data.put("chennai", "34C humid");
        data.put("shillong", "17C rain");
    }

    String handle(String requestLine) {
        String city = requestLine.substring(requestLine.indexOf('=') + 1);
        return data.getOrDefault(city, "no data");
    }
}

class WeatherRemoteProxy implements WeatherApi {
    private final FakeServer server = new FakeServer();
    private int requests = 0;

    public String today(String city) {
        requests++;
        String wire = "GET /weather?city=" + city.toLowerCase(); // build the request
        System.out.println("  [network] " + wire);
        return server.handle(wire);
    }

    int requests() {
        return requests;
    }
}
// OUTPUT:
//   [network] GET /weather?city=chennai
// Chennai: 34C humid
//   [network] GET /weather?city=shillong
// Shillong: 17C rain
// Network calls made: 2`),
        blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Self-invocation</b> in Spring: a method calling another method of the same bean bypasses the proxy, so <code>@Transactional</code> or <code>@Cacheable</code> on the inner method does nothing.</li>
<li>Comparing with <code>==</code> or <code>getClass()</code>: a proxy is a different class from the target.</li>
<li>JDK dynamic proxies need an interface; for classes Spring uses CGLIB, which cannot proxy <code>final</code> classes or methods.</li>
<li>Making a lazy proxy that is not thread safe, creating the real object twice.</li>
<li>Hiding expensive remote calls behind innocent-looking getters and calling them in loops.</li>
</ul>

<h4>Proxy vs Decorator vs Adapter vs Facade</h4>
<table>
<tr><th>Pattern</th><th>Interface</th><th>Who creates the wrapped object</th><th>Typical purpose</th></tr>
<tr><td><b>Proxy</b></td><td>Same as subject</td><td>Often the proxy (lazy, remote)</td><td>Control access, lifecycle, location</td></tr>
<tr><td><b>Decorator</b></td><td>Same as component</td><td>The client passes it in</td><td>Add behaviour, stackable</td></tr>
<tr><td><b>Adapter</b></td><td>Different</td><td>Client or adapter</td><td>Make it compatible</td></tr>
<tr><td><b>Facade</b></td><td>New simplified</td><td>Facade</td><td>Simplify a subsystem</td></tr>
</table>`),
    ],
    expert: [
        blk(`<h4>Real-time example 1: a generic caching proxy</h4>
<p>One dynamic proxy factory that caches the result of any <i>read-only</i> method by method name and arguments. Business code stays free of cache logic; the hit counter shows the saving. This is the core of what Spring's <code>@Cacheable</code> does.</p>`,
`// CachingProxyDemo - generic result cache built on a dynamic proxy
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CachingProxyDemo {
    public static void main(String[] args) {
        SlowRates real = new SlowRates();
        CachingHandler handler = new CachingHandler(real);
        ExchangeRates rates = (ExchangeRates) Proxy.newProxyInstance(
                ExchangeRates.class.getClassLoader(),
                new Class<?>[] {ExchangeRates.class},
                handler);

        System.out.println(rates.rate("USD", "INR"));
        System.out.println(rates.rate("USD", "INR"));
        System.out.println(rates.rate("EUR", "INR"));
        System.out.println(rates.rate("USD", "INR"));

        System.out.println("real lookups=" + real.lookups + " cache hits=" + handler.hits);
    }
}

interface ExchangeRates {
    double rate(String from, String to);
}

class SlowRates implements ExchangeRates {
    int lookups = 0;

    public double rate(String from, String to) {
        lookups++; // imagine a slow remote call
        return from.equals("USD") && to.equals("INR") ? 83.2 : 1.0;
    }
}

class CachingHandler implements InvocationHandler {
    private final Object target;
    private final Map<List<Object>, Object> cache = new HashMap<>();
    int hits = 0;

    CachingHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        List<Object> key = List.of(method.getName(), Arrays.asList(args));
        if (cache.containsKey(key)) {
            hits++;
            return cache.get(key);
        }
        Object value = method.invoke(target, args);
        cache.put(key, value);
        return value;
    }
}
// OUTPUT:
// 83.2
// 83.2
// 1.0
// 83.2
// real lookups=2 cache hits=2`),
        blk(`<h4>Real-time example 2: how Spring-style @Transactional works</h4>
<p>A custom annotation plus a dynamic proxy that begins a "transaction" before methods marked <code>@Tx</code>, commits on success and rolls back when an exception escapes. This is a simplified version of what Spring's transaction proxy does around your service bean.</p>`,
`// TransactionProxyDemo - annotation-driven proxy, the idea behind @Transactional
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;

public class TransactionProxyDemo {
    public static void main(String[] args) {
        TransferService service = (TransferService) Proxy.newProxyInstance(
                TransferService.class.getClassLoader(),
                new Class<?>[] {TransferService.class},
                new TxHandler(new TransferServiceImpl()));

        System.out.println("fee " + service.quote(2500));
        service.transfer("ACC-1", "ACC-2", 3000);

        try {
            service.transfer("ACC-1", "ACC-3", 9000);
        } catch (IllegalArgumentException e) {
            System.out.println("caller saw: " + e.getMessage());
        }
    }
}

@Retention(RetentionPolicy.RUNTIME)
@interface Tx {
}

interface TransferService {
    @Tx
    void transfer(String from, String to, int amount);

    int quote(int amount);
}

class TransferServiceImpl implements TransferService {
    public void transfer(String from, String to, int amount) {
        System.out.println("  moving " + amount + " from " + from + " to " + to);
        if (amount > 5000) {
            throw new IllegalArgumentException("limit exceeded");
        }
    }

    public int quote(int amount) {
        return amount / 100; // fee, not transactional
    }
}

class TxHandler implements InvocationHandler {
    private final Object target;

    TxHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // Look at the annotation on the implementation method
        Method impl = target.getClass().getMethod(method.getName(), method.getParameterTypes());
        boolean tx = method.isAnnotationPresent(Tx.class) || impl.isAnnotationPresent(Tx.class);

        if (!tx) {
            return method.invoke(target, args);
        }
        System.out.println("BEGIN " + method.getName());
        try {
            Object result = method.invoke(target, args);
            System.out.println("COMMIT");
            return result;
        } catch (InvocationTargetException e) {
            System.out.println("ROLLBACK because " + e.getCause().getMessage());
            throw e.getCause();
        }
    }
}
// OUTPUT:
// fee 25
// BEGIN transfer
//   moving 3000 from ACC-1 to ACC-2
// COMMIT
// BEGIN transfer
//   moving 9000 from ACC-1 to ACC-3
// ROLLBACK because limit exceeded
// caller saw: limit exceeded`),
        blk(`<h4>Sample mini project: secure document vault</h4>
<p>Three proxies in one chain: a security proxy (who may read), an audit proxy (who did what) and a lazy loader for the heavy document body. The real <code>Vault</code> knows none of this.</p>`,
`// DocumentVaultMiniProject - security, audit and lazy loading proxies
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class DocumentVaultMiniProject {
    public static void main(String[] args) {
        List<String> auditLog = new ArrayList<>();
        Document doc = new AuditedDocument(
                new SecureDocument(new LazyDocument("land-deed.pdf"), Set.of("meena", "raghav")),
                auditLog);

        System.out.println("vault opened, nothing loaded yet");
        System.out.println(doc.read("meena"));
        System.out.println(doc.read("intruder"));
        System.out.println(doc.read("raghav"));

        System.out.println("Audit log:");
        auditLog.forEach(line -> System.out.println("  " + line));
    }
}

interface Document {
    String read(String user);
}

class StoredDocument implements Document {
    private final String name;

    StoredDocument(String name) {
        this.name = name;
        System.out.println("  [disk] loading " + name);
    }

    public String read(String user) {
        return "contents of " + name;
    }
}

class LazyDocument implements Document {
    private final String name;
    private Document real;

    LazyDocument(String name) {
        this.name = name;
    }

    public String read(String user) {
        if (real == null) {
            real = new StoredDocument(name);
        }
        return real.read(user);
    }
}

class SecureDocument implements Document {
    private final Document next;
    private final Set<String> allowed;

    SecureDocument(Document next, Set<String> allowed) {
        this.next = next;
        this.allowed = allowed;
    }

    public String read(String user) {
        if (!allowed.contains(user)) {
            return "ACCESS DENIED for " + user;
        }
        return next.read(user);
    }
}

class AuditedDocument implements Document {
    private final Document next;
    private final List<String> log;

    AuditedDocument(Document next, List<String> log) {
        this.next = next;
        this.log = log;
    }

    public String read(String user) {
        String result = next.read(user);
        log.add(user + " -> " + (result.startsWith("ACCESS") ? "denied" : "granted"));
        return result;
    }
}
// OUTPUT:
// vault opened, nothing loaded yet
//   [disk] loading land-deed.pdf
// contents of land-deed.pdf
// ACCESS DENIED for intruder
// contents of land-deed.pdf
// Audit log:
//   meena -> granted
//   intruder -> denied
//   raghav -> granted`),
        blk(`<h4>Testing, Spring and performance notes</h4>
<ul>
<li><b>Testing</b>: test the real subject without the proxy, then test the proxy with a stub subject (does it forward? does it block when it should? is the lazy object created once?). For dynamic proxies, assert on the recorded calls.</li>
<li><b>Spring</b>: understand the two proxy types. JDK proxies need an interface; CGLIB (the default for classes in Spring Boot) subclasses your bean, so classes and methods must not be <code>final</code>. Calls made through <code>this</code> skip the proxy; fix by moving the method to another bean.</li>
<li><b>Hibernate</b>: a lazy entity is a proxy; reading it after the session closes throws <code>LazyInitializationException</code>. Fetch what you need inside the transaction (join fetch, DTO projection).</li>
<li><b>Performance</b>: reflection-based proxies cost a few hundred nanoseconds per call and block inlining; negligible next to I/O. Caching proxies need eviction and a bounded size or they leak memory.</li>
</ul>

<h4>Anti-patterns</h4>
<ul>
<li><b>Proxy hell</b>: proxies of proxies where no one knows which layer applied which rule.</li>
<li>Logging full request bodies in a logging proxy, leaking secrets or personal data.</li>
<li>A cache proxy with no invalidation, serving stale prices indefinitely.</li>
</ul>`),
    ],
    interviewQA: [
        ['What is the Proxy pattern?', 'A structural pattern where a stand-in object with the same interface controls access to a real object. The proxy can delay creation, check permissions, cache, log or forward the call to a remote object.'],
        ['Name the main types of proxy.', 'Virtual (lazy creation), protection (access control), remote (local representative of a remote object), and smart reference or caching (counting, logging, caching).'],
        ['What is a JDK dynamic proxy and how does it differ from CGLIB?', 'java.lang.reflect.Proxy generates, at runtime, a class implementing given interfaces and routes all calls to an InvocationHandler. CGLIB generates a subclass of a concrete class instead, so it works without interfaces but cannot handle final classes or methods.'],
        ['Why does @Transactional sometimes not work when a method calls another method of the same class?', 'Spring applies the behaviour in a proxy around the bean. A call through this goes straight to the target and bypasses the proxy, so the advice never runs. Move the method to another bean or inject the proxy.'],
        ['Proxy vs Decorator?', 'Both wrap an object with the same interface. A decorator adds behaviour and is composed by the client; a proxy controls access to the object and often creates or locates it itself. The intent differs more than the structure.'],
        ['How does Hibernate use the Proxy pattern?', 'getReference and lazy associations return a generated proxy subclass holding only the id; the SQL runs when you first call a getter other than getId. Outside an open session this causes LazyInitializationException.'],
    ],
};

const bridge: TopicExtra = {
    beginner: [
        blk(`<h4>In one minute</h4>
<p>A <b>Bridge</b> splits one big class into <i>two separate hierarchies</i> that can grow independently: the <b>abstraction</b> (what the client uses, e.g. a notification type) and the <b>implementor</b> (how the work is done, e.g. SMS or email). The abstraction holds a reference to an implementor and delegates to it. This avoids a class explosion: 3 notification types and 4 channels need 3 + 4 = 7 classes, not 3 x 4 = 12.</p>

<h4>Everyday analogies</h4>
<ul>
<li><b>Remote control and TV</b>: any remote (basic, smart) can work with any device (TV, AC, music system) through a shared button protocol.</li>
<li><b>Light switch and bulb</b>: you can change the switch design or the bulb type independently.</li>
<li><b>Driver and car</b>: a driver (abstraction) can use any vehicle (implementation) that has pedals and a wheel.</li>
</ul>

<h4>Where you see it in Java / JDK / Spring</h4>
<ul>
<li><b>JDBC</b>: <code>DriverManager</code> / <code>Connection</code> (abstraction) and vendor drivers (implementors) are developed separately.</li>
<li><b>AWT</b>: <code>java.awt.Component</code> classes delegate to platform <code>peer</code> objects.</li>
<li><b>SLF4J</b>: the logging API and the binding to Logback or Log4j.</li>
<li>Spring's <code>PlatformTransactionManager</code>, and <code>JpaVendorAdapter</code> separate "what" from "which vendor".</li>
</ul>

<h4>Structure</h4>
<pre>
Abstraction  ---has-a--&gt;  Implementor (interface)
     ^                         ^           ^
RefinedAbstraction        ConcreteImplA  ConcreteImplB

   (what to do)   ====bridge====   (how it is done)
</pre>

<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it when a class varies along two independent dimensions (type x platform, shape x colour, report x format).</li>
<li>Use it to swap the implementation at runtime or to hide it from clients.</li>
<li>Do NOT use it when there is only one dimension; a plain interface and implementations is enough.</li>
<li>Do NOT use it up front "just in case"; introduce it when the second dimension actually appears.</li>
</ul>

<h4>Sample: notification types times channels</h4>
<p>Two message types (alert, reminder) work over two channels (SMS, email). Adding a push channel later needs one new class and no change to the message types.</p>`,
`// BridgeBeginnerDemo - message types bridged to delivery channels

public class BridgeBeginnerDemo {
    public static void main(String[] args) {
        new AlertNotice(new SmsChannel()).send("98100-11111");
        new AlertNotice(new EmailChannel()).send("ops@fort.example");
        new ReminderNotice(new SmsChannel(), "Diwali sale").send("98100-22222");
        new ReminderNotice(new EmailChannel(), "Board meeting").send("md@fort.example");
    }
}

interface Channel {
    void deliver(String to, String text);
}

class SmsChannel implements Channel {
    public void deliver(String to, String text) {
        System.out.println("SMS to " + to + ": " + text);
    }
}

class EmailChannel implements Channel {
    public void deliver(String to, String text) {
        System.out.println("Email to " + to + ": " + text);
    }
}

// The abstraction holds the bridge to a Channel
abstract class Notice {
    protected final Channel channel;

    Notice(Channel channel) {
        this.channel = channel;
    }

    abstract void send(String to);
}

class AlertNotice extends Notice {
    AlertNotice(Channel channel) {
        super(channel);
    }

    void send(String to) {
        channel.deliver(to, "ALERT: server room temperature high");
    }
}

class ReminderNotice extends Notice {
    private final String event;

    ReminderNotice(Channel channel, String event) {
        super(channel);
        this.event = event;
    }

    void send(String to) {
        channel.deliver(to, "Reminder: " + event + " tomorrow");
    }
}
// OUTPUT:
// SMS to 98100-11111: ALERT: server room temperature high
// Email to ops@fort.example: ALERT: server room temperature high
// SMS to 98100-22222: Reminder: Diwali sale tomorrow
// Email to md@fort.example: Reminder: Board meeting tomorrow`),
    ],
    intermediate: [
        blk(`<h4>Sample 1: shapes bridged to renderers</h4>
<p><b>What it shows:</b> the classic two hierarchies, shapes (circle, rectangle) and renderers (text, SVG-like markup). <b>Why:</b> a new renderer (say, JSON) works with every shape automatically, and a new shape works with every renderer.</p>`,
`// BridgeShapesDemo - shape hierarchy x renderer hierarchy

public class BridgeShapesDemo {
    public static void main(String[] args) {
        Renderer[] renderers = {new TextRenderer(), new SvgRenderer()};

        for (Renderer r : renderers) {
            System.out.println(new Circle(r, 5).draw());
            System.out.println(new Rectangle(r, 4, 3).draw());
        }
    }
}

interface Renderer {
    String drawCircle(int radius);

    String drawRect(int w, int h);
}

class TextRenderer implements Renderer {
    public String drawCircle(int radius) {
        return "circle of radius " + radius;
    }

    public String drawRect(int w, int h) {
        return "rectangle " + w + "x" + h;
    }
}

class SvgRenderer implements Renderer {
    public String drawCircle(int radius) {
        return "<circle r=" + radius + " />";
    }

    public String drawRect(int w, int h) {
        return "<rect width=" + w + " height=" + h + " />";
    }
}

abstract class Shape {
    protected final Renderer renderer;

    Shape(Renderer renderer) {
        this.renderer = renderer;
    }

    abstract String draw();
}

class Circle extends Shape {
    private final int radius;

    Circle(Renderer renderer, int radius) {
        super(renderer);
        this.radius = radius;
    }

    String draw() {
        return renderer.drawCircle(radius);
    }
}

class Rectangle extends Shape {
    private final int w;
    private final int h;

    Rectangle(Renderer renderer, int w, int h) {
        super(renderer);
        this.w = w;
        this.h = h;
    }

    String draw() {
        return renderer.drawRect(w, h);
    }
}
// OUTPUT:
// circle of radius 5
// rectangle 4x3
// <circle r=5 />
// <rect width=4 height=3 />`),
        blk(`<h4>Sample 2: remote control with a refined abstraction</h4>
<p><b>What it shows:</b> a basic remote and an advanced remote (extends the abstraction) driving a TV or a radio (implementors). <b>Why:</b> refinements of the abstraction add features (mute) using only the implementor interface, so they work for every device.</p>`,
`// BridgeRemoteDemo - remotes (abstraction) over devices (implementor)

public class BridgeRemoteDemo {
    public static void main(String[] args) {
        Device tv = new Television();
        BasicRemote basic = new BasicRemote(tv);
        basic.togglePower();
        basic.volumeUp();
        System.out.println("TV volume " + tv.volume());

        Device radio = new Radio();
        AdvancedRemote advanced = new AdvancedRemote(radio);
        advanced.togglePower();
        advanced.volumeUp();
        advanced.volumeUp();
        advanced.volumeUp();
        advanced.volumeUp();
        System.out.println("Radio volume " + radio.volume());
        advanced.mute();
        System.out.println("Radio after mute " + radio.volume());
    }
}

interface Device {
    boolean isOn();

    void setPower(boolean on);

    int volume();

    void setVolume(int v);
}

class Television implements Device {
    private boolean on;
    private int volume = 20;

    public boolean isOn() {
        return on;
    }

    public void setPower(boolean on) {
        this.on = on;
        System.out.println("TV power " + (on ? "ON" : "OFF"));
    }

    public int volume() {
        return volume;
    }

    public void setVolume(int v) {
        volume = Math.max(0, Math.min(100, v));
    }
}

class Radio implements Device {
    private boolean on;
    private int volume = 5;

    public boolean isOn() {
        return on;
    }

    public void setPower(boolean on) {
        this.on = on;
        System.out.println("Radio power " + (on ? "ON" : "OFF"));
    }

    public int volume() {
        return volume;
    }

    public void setVolume(int v) {
        volume = Math.max(0, Math.min(30, v)); // radio has a lower maximum
    }
}

class BasicRemote {
    protected final Device device;

    BasicRemote(Device device) {
        this.device = device;
    }

    void togglePower() {
        device.setPower(!device.isOn());
    }

    void volumeUp() {
        device.setVolume(device.volume() + 10);
    }
}

class AdvancedRemote extends BasicRemote {
    AdvancedRemote(Device device) {
        super(device);
    }

    void mute() {
        device.setVolume(0);
    }
}
// OUTPUT:
// TV power ON
// TV volume 30
// Radio power ON
// Radio volume 30
// Radio after mute 0`),
        blk(`<h4>Sample 3: a JDBC-style driver bridge with runtime switching</h4>
<p><b>What it shows:</b> a <code>Repository</code> abstraction that can switch its storage driver while running. <b>Why:</b> this is the idea behind JDBC: your code is written once against the abstraction and the vendor driver is chosen by configuration.</p>`,
`// BridgeDriverDemo - repository over interchangeable storage drivers
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BridgeDriverDemo {
    public static void main(String[] args) {
        CustomerRepository repo = new CustomerRepository(new MemoryDriver());
        repo.save("1", "Lakshmi");
        System.out.println(repo.driverName() + " -> " + repo.find("1"));

        repo.switchDriver(new LoggedDriver()); // swap implementation at runtime
        repo.save("2", "Gopal");
        repo.save("2", "Gopal Das");
        System.out.println(repo.driverName() + " -> " + repo.find("2"));
        System.out.println("old data in new driver: " + repo.find("1"));
    }
}

interface StorageDriver {
    void write(String key, String value);

    String read(String key);

    String name();
}

class MemoryDriver implements StorageDriver {
    private final Map<String, String> map = new HashMap<>();

    public void write(String key, String value) {
        map.put(key, value);
    }

    public String read(String key) {
        return map.get(key);
    }

    public String name() {
        return "memory";
    }
}

class LoggedDriver implements StorageDriver {
    private final List<String> journal = new ArrayList<>();

    public void write(String key, String value) {
        journal.add(key + "=" + value);
    }

    public String read(String key) {
        for (int i = journal.size() - 1; i >= 0; i--) {
            String entry = journal.get(i);
            if (entry.startsWith(key + "=")) {
                return entry.substring(key.length() + 1);
            }
        }
        return null;
    }

    public String name() {
        return "journal(" + journal.size() + " entries)";
    }
}

class CustomerRepository {
    private StorageDriver driver;

    CustomerRepository(StorageDriver driver) {
        this.driver = driver;
    }

    void switchDriver(StorageDriver newDriver) {
        driver = newDriver;
    }

    void save(String id, String name) {
        driver.write("cust:" + id, name);
    }

    String find(String id) {
        return driver.read("cust:" + id);
    }

    String driverName() {
        return driver.name();
    }
}
// OUTPUT:
// memory -> Lakshmi
// journal(2 entries) -> Gopal Das
// old data in new driver: null`),
        blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Premature bridge</b>: splitting into two hierarchies when only one dimension exists.</li>
<li>Choosing the wrong split: the implementor interface should contain primitive operations, the abstraction the higher-level operations built from them.</li>
<li>Letting the abstraction know the concrete implementor (casts, <code>instanceof</code>), which destroys the independence.</li>
<li>Making the implementor interface too wide, so every new implementor must write dozens of methods.</li>
<li>Confusing it with Adapter: Bridge is planned up front for independent variation; Adapter is a fix after the fact.</li>
</ul>

<h4>Bridge vs Adapter vs Strategy vs Abstract Factory</h4>
<table>
<tr><th>Pattern</th><th>When designed</th><th>Core idea</th><th>Typical sign</th></tr>
<tr><td><b>Bridge</b></td><td>Up front</td><td>Two hierarchies vary independently</td><td>Abstraction subclasses plus implementor subclasses</td></tr>
<tr><td><b>Adapter</b></td><td>After the fact</td><td>Make existing classes fit</td><td>One wrapper per incompatible class</td></tr>
<tr><td><b>Strategy</b></td><td>Any time</td><td>Swap one algorithm</td><td>Context plus interchangeable strategy; no abstraction hierarchy</td></tr>
<tr><td><b>Abstract Factory</b></td><td>Up front</td><td>Create families of related objects</td><td>Often used together with Bridge to create the implementor</td></tr>
</table>`),
    ],
    expert: [
        blk(`<h4>Real-time example 1: cross-platform UI toolkit (the AWT idea)</h4>
<p>Widgets (button, checkbox) are the abstraction; platform peers (desktop, web) are the implementors. Application code builds widgets once. To support a mobile theme you add one peer class and touch no widget.</p>`,
`// UiToolkitBridgeDemo - widgets bridged to platform peers
import java.util.List;

public class UiToolkitBridgeDemo {
    public static void main(String[] args) {
        for (Peer peer : List.of(new DesktopPeer(), new WebPeer())) {
            System.out.println("-- " + peer.getClass().getSimpleName() + " --");
            CheckBox terms = new CheckBox(peer, "Accept terms");
            System.out.println(new PushButton(peer, "Pay now").render());
            System.out.println(terms.render());
            terms.toggle();
            System.out.println(terms.render());
        }
    }
}

interface Peer {
    String paintBox(String label);

    String paintTick(String label, boolean checked);
}

class DesktopPeer implements Peer {
    public String paintBox(String label) {
        return "[ " + label + " ]";
    }

    public String paintTick(String label, boolean checked) {
        return (checked ? "[x] " : "[ ] ") + label;
    }
}

class WebPeer implements Peer {
    public String paintBox(String label) {
        return "<button>" + label + "</button>";
    }

    public String paintTick(String label, boolean checked) {
        return "<input type=checkbox" + (checked ? " checked" : "") + "> " + label;
    }
}

abstract class Widget {
    protected final Peer peer;

    Widget(Peer peer) {
        this.peer = peer;
    }

    abstract String render();
}

class PushButton extends Widget {
    private final String label;

    PushButton(Peer peer, String label) {
        super(peer);
        this.label = label;
    }

    String render() {
        return peer.paintBox(label);
    }
}

class CheckBox extends Widget {
    private final String label;
    private boolean checked;

    CheckBox(Peer peer, String label) {
        super(peer);
        this.label = label;
    }

    void toggle() {
        checked = !checked;
    }

    String render() {
        return peer.paintTick(label, checked);
    }
}
// OUTPUT:
// -- DesktopPeer --
// [ Pay now ]
// [ ] Accept terms
// [x] Accept terms
// -- WebPeer --
// <button>Pay now</button>
// <input type=checkbox> Accept terms
// <input type=checkbox checked> Accept terms`),
        blk(`<h4>Real-time example 2: alerting with severity levels and fallback channels</h4>
<p>The severity (info, critical) decides <i>which</i> channels get the message; each channel decides <i>how</i> to send it. A critical alert tries every channel in order until one succeeds, which is a real operations pattern (pager, then call, then SMS).</p>`,
`// AlertingBridgeDemo - severity abstraction over channel implementors
import java.util.List;

public class AlertingBridgeDemo {
    public static void main(String[] args) {
        List<AlertChannel> channels = List.of(new PagerChannel(false), new SlackChannel());

        new InfoAlert(channels).raise("nightly backup finished");
        new CriticalAlert(channels).raise("payment API down in Mumbai region");
    }
}

interface AlertChannel {
    boolean send(String text);

    String name();
}

class PagerChannel implements AlertChannel {
    private final boolean reachable;

    PagerChannel(boolean reachable) {
        this.reachable = reachable;
    }

    public boolean send(String text) {
        System.out.println("  pager: " + (reachable ? "delivered" : "unreachable"));
        return reachable;
    }

    public String name() {
        return "pager";
    }
}

class SlackChannel implements AlertChannel {
    public boolean send(String text) {
        System.out.println("  slack: #ops <- " + text);
        return true;
    }

    public String name() {
        return "slack";
    }
}

abstract class Alert {
    protected final List<AlertChannel> channels;

    Alert(List<AlertChannel> channels) {
        this.channels = channels;
    }

    abstract void raise(String text);
}

class InfoAlert extends Alert {
    InfoAlert(List<AlertChannel> channels) {
        super(channels);
    }

    void raise(String text) {
        System.out.println("INFO: only the first channel");
        channels.get(channels.size() - 1).send(text);
    }
}

class CriticalAlert extends Alert {
    CriticalAlert(List<AlertChannel> channels) {
        super(channels);
    }

    void raise(String text) {
        System.out.println("CRITICAL: escalate until someone is reached");
        for (AlertChannel c : channels) {
            if (c.send("CRITICAL " + text)) {
                return;
            }
        }
        System.out.println("  nobody reached!");
    }
}
// OUTPUT:
// INFO: only the first channel
//   slack: #ops <- nightly backup finished
// CRITICAL: escalate until someone is reached
//   pager: unreachable
//   slack: #ops <- CRITICAL payment API down in Mumbai region`),
        blk(`<h4>Sample mini project: report generator, report type x output format</h4>
<p>Two report types and three formats give six outputs from only five classes (and a new format costs one class). Each report only describes its rows; the format decides how they look.</p>`,
`// ReportBridgeMiniProject - report types bridged to output formats
import java.util.List;
import java.util.Map;

public class ReportBridgeMiniProject {
    public static void main(String[] args) {
        List<Format> formats = List.of(new PlainFormat(), new CsvFormat(), new MarkdownFormat());

        for (Format f : formats) {
            System.out.println(new SalesReport(f).render());
            System.out.println(new StockReport(f).render());
            System.out.println();
        }
    }
}

interface Format {
    String title(String text);

    String row(String key, int value);
}

class PlainFormat implements Format {
    public String title(String text) {
        return text.toUpperCase();
    }

    public String row(String key, int value) {
        return key + ": " + value;
    }
}

class CsvFormat implements Format {
    public String title(String text) {
        return "# " + text;
    }

    public String row(String key, int value) {
        return key + "," + value;
    }
}

class MarkdownFormat implements Format {
    public String title(String text) {
        return "## " + text;
    }

    public String row(String key, int value) {
        return "- **" + key + "** = " + value;
    }
}

abstract class Report {
    protected final Format format;

    Report(Format format) {
        this.format = format;
    }

    abstract String heading();

    abstract Map<String, Integer> data();

    String render() {
        StringBuilder sb = new StringBuilder(format.title(heading()));
        data().forEach((k, v) -> sb.append(System.lineSeparator()).append(format.row(k, v)));
        return sb.toString();
    }
}

class SalesReport extends Report {
    SalesReport(Format format) {
        super(format);
    }

    String heading() {
        return "Sales by city";
    }

    Map<String, Integer> data() {
        return Map.of("Mumbai", 920);
    }
}

class StockReport extends Report {
    StockReport(Format format) {
        super(format);
    }

    String heading() {
        return "Stock in warehouse";
    }

    Map<String, Integer> data() {
        return Map.of("Rice bags", 340);
    }
}
// OUTPUT:
// SALES BY CITY
// Mumbai: 920
// STOCK IN WAREHOUSE
// Rice bags: 340
// 
// # Sales by city
// Mumbai,920
// # Stock in warehouse
// Rice bags,340
// 
// ## Sales by city
// - **Mumbai** = 920
// ## Stock in warehouse
// - **Rice bags** = 340
// `),
        blk(`<h4>Testing, Spring and performance notes</h4>
<ul>
<li><b>Testing</b>: test each implementor against the implementor contract (a shared abstract test class), and test each abstraction with a fake implementor that records calls. You test n + m things instead of n x m combinations.</li>
<li><b>Spring</b>: inject the implementor into the abstraction through the constructor, choose it with <code>@Profile</code>, <code>@ConditionalOnProperty</code> or a <code>@Qualifier</code>. Typical pairs are <code>NotificationService</code> with <code>MessageSender</code> beans, or a <code>ReportService</code> with <code>ExportFormat</code> beans collected as a <code>Map&lt;String, ExportFormat&gt;</code>.</li>
<li><b>Performance</b>: one extra indirection per call, negligible. Keep implementors stateless where possible so one instance is shared.</li>
<li>Combine with Abstract Factory when the implementor must be created consistently for a whole family of abstractions.</li>
</ul>

<h4>Anti-patterns</h4>
<ul>
<li><b>Leaky bridge</b>: the abstraction casts the implementor to a concrete class to use a special feature.</li>
<li><b>Bridge to nowhere</b>: an implementor interface with exactly one implementation that will never change.</li>
<li>Duplicating the same logic in every implementor instead of lifting it into the abstraction (template-method style).</li>
</ul>`),
    ],
    interviewQA: [
        ['What is the Bridge pattern?', 'It decouples an abstraction from its implementation so the two can vary independently. The abstraction holds a reference to an implementor interface and delegates the low-level work to it.'],
        ['What problem does Bridge solve?', 'The class explosion caused by inheritance on two independent dimensions. With m abstractions and n implementations, inheritance gives m x n classes, Bridge gives m + n.'],
        ['How is Bridge different from Adapter?', 'Bridge is designed up front so abstraction and implementation evolve separately. Adapter is applied afterwards to make an existing incompatible class fit an expected interface.'],
        ['How is Bridge different from Strategy?', 'Structurally similar (composition with an interface), but Strategy swaps one algorithm inside a context. Bridge separates a whole hierarchy of abstractions from a hierarchy of implementations.'],
        ['Give a real Java example of Bridge.', 'JDBC: your code uses Connection and Statement (abstraction) and the database vendor driver is the implementor. AWT component and peer, and SLF4J API with its bindings, follow the same idea.'],
        ['How would you add a new output format or platform without changing existing code?', 'Add one new class implementing the implementor interface and register or inject it. All existing abstractions work with it unchanged, which respects the Open/Closed principle.'],
    ],
};

const composite: TopicExtra = {
    beginner: [
        blk(`<h4>In one minute</h4>
<p>A <b>Composite</b> lets you treat a single object (a <b>leaf</b>) and a group of objects (a <b>composite</b> node) through the <i>same interface</i>. A composite holds children that may themselves be composites, so you can build a <b>tree</b> and run one operation (<code>size()</code>, <code>price()</code>, <code>render()</code>) over the whole tree with a single call. The client does not need <code>if (isGroup)</code> checks.</p>

<h4>Everyday analogies</h4>
<ul>
<li><b>Folders and files</b>: a folder holds files and other folders; "size" works on both.</li>
<li><b>Army</b>: an order given to a general passes down through divisions to every soldier.</li>
<li><b>Gift box</b>: a box may contain items and smaller boxes; the total price is the sum of everything inside.</li>
</ul>

<h4>Where you see it in Java / JDK / Spring</h4>
<ul>
<li><code>java.awt.Container</code> contains <code>Component</code>s, and a Container is itself a Component. Swing's <code>JPanel</code> and JavaFX's <code>Parent</code>/<code>Node</code> work the same way.</li>
<li>DOM trees (<code>org.w3c.dom.Node</code>), <code>javax.swing.tree.TreeNode</code>.</li>
<li>Spring Security's <code>CompositeFilter</code>, Spring's <code>CompositePropertySource</code> and Jackson's <code>JsonNode</code> tree.</li>
<li><code>java.util.Map.putAll</code> is not a composite, but a collection of collections often is.</li>
</ul>

<h4>Structure</h4>
<pre>
Component (interface: operation())
   ^                    ^
   |                    |
 Leaf              Composite --has many--&gt; Component
 operation()       operation() { for child: child.operation() }

Tree:   Box
        +-- Book
        +-- Box
            +-- Pen
            +-- Notebook
</pre>

<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it when the data is naturally a part-whole tree and clients should ignore the difference between one and many.</li>
<li>Do NOT use it when the structure is flat; a plain list is simpler.</li>
<li>Be careful when leaves and groups really need very different operations; a shared interface may become awkward.</li>
</ul>

<h4>Sample: a gift box that totals its price</h4>
<p>Items and boxes both implement <code>Priced</code>. The outer box does not care what is inside; it asks every child for its price.</p>`,
`// CompositeBeginnerDemo - gift boxes containing items and boxes
import java.util.ArrayList;
import java.util.List;

public class CompositeBeginnerDemo {
    public static void main(String[] args) {
        Box small = new Box("Desk set").add(new Item("Pen", 40)).add(new Item("Notebook", 120));
        Box gift = new Box("Diwali gift")
                .add(new Item("Kaju Katli", 450))
                .add(small)
                .add(new Item("Diya pack", 90));

        gift.print("");
        System.out.println("Total to pay: " + gift.price());
    }
}

interface Priced {
    int price();

    void print(String indent);
}

class Item implements Priced {
    private final String name;
    private final int price;

    Item(String name, int price) {
        this.name = name;
        this.price = price;
    }

    public int price() {
        return price;
    }

    public void print(String indent) {
        System.out.println(indent + name + " (" + price + ")");
    }
}

class Box implements Priced {
    private final String name;
    private final List<Priced> contents = new ArrayList<>();

    Box(String name) {
        this.name = name;
    }

    Box add(Priced p) {
        contents.add(p);
        return this; // allows chaining
    }

    public int price() {
        int total = 0;
        for (Priced p : contents) {
            total += p.price(); // works for items and nested boxes alike
        }
        return total;
    }

    public void print(String indent) {
        System.out.println(indent + "Box " + name + " = " + price());
        for (Priced p : contents) {
            p.print(indent + "  ");
        }
    }
}
// OUTPUT:
// Box Diwali gift = 700
//   Kaju Katli (450)
//   Box Desk set = 160
//     Pen (40)
//     Notebook (120)
//   Diya pack (90)
// Total to pay: 700`),
    ],
    intermediate: [
        blk(`<h4>Sample 1: file system with size, count and search</h4>
<p><b>What it shows:</b> three operations (size, file count, find by extension) implemented recursively over the same tree. <b>Why:</b> each node answers for itself, so adding a new operation only needs a loop in the composite and a one-liner in the leaf.</p>`,
`// CompositeFileSystemDemo - folders and files with recursive operations
import java.util.ArrayList;
import java.util.List;

public class CompositeFileSystemDemo {
    public static void main(String[] args) {
        FsNode root = new FolderNode("project",
                new FileNode("README.md", 4),
                new FolderNode("src",
                        new FileNode("Main.java", 12),
                        new FileNode("Util.java", 7),
                        new FolderNode("test", new FileNode("MainTest.java", 9))),
                new FolderNode("docs", new FileNode("guide.md", 30)));

        System.out.println("Total size: " + root.sizeKb() + " KB");
        System.out.println("Files: " + root.fileCount());

        List<String> javaFiles = new ArrayList<>();
        root.collect(".java", "", javaFiles);
        javaFiles.forEach(p -> System.out.println("java: " + p));
    }
}

interface FsNode {
    String name();

    int sizeKb();

    int fileCount();

    void collect(String extension, String path, List<String> found);
}

class FileNode implements FsNode {
    private final String name;
    private final int kb;

    FileNode(String name, int kb) {
        this.name = name;
        this.kb = kb;
    }

    public String name() {
        return name;
    }

    public int sizeKb() {
        return kb;
    }

    public int fileCount() {
        return 1;
    }

    public void collect(String extension, String path, List<String> found) {
        if (name.endsWith(extension)) {
            found.add(path + "/" + name);
        }
    }
}

class FolderNode implements FsNode {
    private final String name;
    private final List<FsNode> children = new ArrayList<>();

    FolderNode(String name, FsNode... nodes) {
        this.name = name;
        children.addAll(List.of(nodes));
    }

    public String name() {
        return name;
    }

    public int sizeKb() {
        return children.stream().mapToInt(FsNode::sizeKb).sum();
    }

    public int fileCount() {
        return children.stream().mapToInt(FsNode::fileCount).sum();
    }

    public void collect(String extension, String path, List<String> found) {
        for (FsNode child : children) {
            child.collect(extension, path + "/" + name, found);
        }
    }
}
// OUTPUT:
// Total size: 62 KB
// Files: 5
// java: /project/src/Main.java
// java: /project/src/Util.java
// java: /project/src/test/MainTest.java`),
        blk(`<h4>Sample 2: restaurant menu tree with depth-aware printing</h4>
<p><b>What it shows:</b> a menu made of menus and dishes, printed with indentation and filtered to vegetarian items. <b>Why:</b> the same traversal supports display, filtering and counting; this is the classic "menu of menus" use case.</p>`,
`// CompositeMenuDemo - nested menus with a vegetarian filter
import java.util.ArrayList;
import java.util.List;

public class CompositeMenuDemo {
    public static void main(String[] args) {
        MenuComponent all = new Menu("Dhaba Menu",
                new Menu("Starters",
                        new Dish("Paneer Tikka", 220, true),
                        new Dish("Chicken Tikka", 260, false)),
                new Menu("Mains",
                        new Dish("Dal Makhani", 190, true),
                        new Menu("Biryani",
                                new Dish("Veg Biryani", 210, true),
                                new Dish("Mutton Biryani", 340, false))));

        all.print(0, false);
        System.out.println();
        all.print(0, true);
    }
}

abstract class MenuComponent {
    abstract void print(int depth, boolean vegOnly);
}

class Dish extends MenuComponent {
    private final String name;
    private final int price;
    private final boolean veg;

    Dish(String name, int price, boolean veg) {
        this.name = name;
        this.price = price;
        this.veg = veg;
    }

    void print(int depth, boolean vegOnly) {
        if (vegOnly && !veg) {
            return; // skip non-veg dishes
        }
        System.out.println("  ".repeat(depth) + name + " Rs " + price + (veg ? " (V)" : ""));
    }
}

class Menu extends MenuComponent {
    private final String title;
    private final List<MenuComponent> parts = new ArrayList<>();

    Menu(String title, MenuComponent... items) {
        this.title = title;
        parts.addAll(List.of(items));
    }

    void print(int depth, boolean vegOnly) {
        System.out.println("  ".repeat(depth) + "== " + title + " ==");
        for (MenuComponent part : parts) {
            part.print(depth + 1, vegOnly);
        }
    }
}
// OUTPUT:
// == Dhaba Menu ==
//   == Starters ==
//     Paneer Tikka Rs 220 (V)
//     Chicken Tikka Rs 260
//   == Mains ==
//     Dal Makhani Rs 190 (V)
//     == Biryani ==
//       Veg Biryani Rs 210 (V)
//       Mutton Biryani Rs 340
// 
// == Dhaba Menu ==
//   == Starters ==
//     Paneer Tikka Rs 220 (V)
//   == Mains ==
//     Dal Makhani Rs 190 (V)
//     == Biryani ==
//       Veg Biryani Rs 210 (V)`),
        blk(`<h4>Sample 3: org chart with parent links and flattening with streams</h4>
<p><b>What it shows:</b> a composite where each node knows its parent, so it can print its path to the root, and a <code>stream()</code> method that flattens the whole tree. <b>Why:</b> navigation upward and "give me all nodes as a list" are the two things real tree APIs always need.</p>`,
`// CompositeOrgChartDemo - parent links and a flattening stream
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

public class CompositeOrgChartDemo {
    public static void main(String[] args) {
        Employee intern = new Employee("Tara", "Intern", 3);
        Employee lead = new Employee("Rohit", "Team Lead", 24)
                .add(new Employee("Sana", "Developer", 14))
                .add(intern);
        Employee ceo = new Employee("Usha", "CEO", 90)
                .add(lead)
                .add(new Employee("Dilip", "CFO", 60));

        System.out.println("Everyone: " + ceo.stream().map(Employee::label).toList());
        System.out.println("Cost of Rohit's team: " + lead.teamCost() + " lakh");
        System.out.println("Cost of company: " + ceo.teamCost() + " lakh");
        System.out.println("Chain: " + intern.chainOfCommand());
    }
}

class Employee {
    private final String name;
    private final String title;
    private final int salaryLakh;
    private Employee boss;
    private final List<Employee> reports = new ArrayList<>();

    Employee(String name, String title, int salaryLakh) {
        this.name = name;
        this.title = title;
        this.salaryLakh = salaryLakh;
    }

    Employee add(Employee e) {
        e.boss = this; // set the parent link
        reports.add(e);
        return this;
    }

    // Flatten this node and all descendants
    Stream<Employee> stream() {
        return Stream.concat(Stream.of(this), reports.stream().flatMap(Employee::stream));
    }

    int teamCost() {
        return stream().mapToInt(e -> e.salaryLakh).sum();
    }

    String chainOfCommand() {
        return boss == null ? name : name + " -> " + boss.chainOfCommand();
    }

    String label() {
        return name + " (" + title + ")";
    }
}
// OUTPUT:
// Everyone: [Usha (CEO), Rohit (Team Lead), Sana (Developer), Tara (Intern), Dilip (CFO)]
// Cost of Rohit's team: 41 lakh
// Cost of company: 191 lakh
// Chain: Tara -> Rohit -> Usha`),
        blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Transparent vs safe</b>: putting <code>add/remove</code> on the shared interface lets you call them on a leaf (they must throw or do nothing). Safe designs keep them only on the composite, at the price of a cast or a separate type.</li>
<li>Cycles: adding a node to its own descendant makes recursion loop forever. Check ancestors before attaching.</li>
<li>Recomputing expensive totals on every call in a deep tree; cache and invalidate if profiling shows a cost.</li>
<li>Exposing the internal children list so clients can modify the tree without the parent link being updated.</li>
<li>Deep recursion on very deep trees leading to <code>StackOverflowError</code>; use an explicit stack or iterative traversal.</li>
</ul>

<h4>Composite vs Decorator vs Iterator vs Visitor</h4>
<table>
<tr><th>Pattern</th><th>Relationship to Composite</th><th>Difference</th></tr>
<tr><td><b>Composite</b></td><td>-</td><td>One node holds many children (tree), same interface</td></tr>
<tr><td><b>Decorator</b></td><td>Similar structure</td><td>Wraps exactly one component to add behaviour; no "many children" aggregation</td></tr>
<tr><td><b>Iterator</b></td><td>Often used with it</td><td>Walks the tree without exposing the structure</td></tr>
<tr><td><b>Visitor</b></td><td>Often used with it</td><td>Adds new operations to the tree without changing node classes</td></tr>
<tr><td><b>Chain of Responsibility</b></td><td>Can use parent links</td><td>Passes a request up the tree until a node handles it</td></tr>
</table>`),
    ],
    expert: [
        blk(`<h4>Real-time example 1: UI component tree with propagating state</h4>
<p>A form is a panel of panels and widgets. <code>render()</code> draws recursively as HTML-like text, and <code>setEnabled(false)</code> on any panel disables everything beneath it. This mirrors how Swing, JavaFX and web DOMs behave.</p>`,
`// UiTreeCompositeDemo - nested panels with recursive render and enable
import java.util.ArrayList;
import java.util.List;

public class UiTreeCompositeDemo {
    public static void main(String[] args) {
        Panel address = new Panel("address", new Field("street"), new Field("pincode"));
        Panel form = new Panel("signup", new Field("name"), new Field("email"), address);

        form.render(0);
        System.out.println("--- locking the address section ---");
        address.setEnabled(false);
        form.render(0);
    }
}

interface UiNode {
    void render(int depth);

    void setEnabled(boolean enabled);
}

class Field implements UiNode {
    private final String label;
    private boolean enabled = true;

    Field(String label) {
        this.label = label;
    }

    public void render(int depth) {
        String state = enabled ? "" : " disabled";
        System.out.println("  ".repeat(depth) + "<input " + label + state + ">");
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}

class Panel implements UiNode {
    private final String id;
    private final List<UiNode> children = new ArrayList<>();

    Panel(String id, UiNode... nodes) {
        this.id = id;
        children.addAll(List.of(nodes));
    }

    public void render(int depth) {
        System.out.println("  ".repeat(depth) + "<div id=" + id + ">");
        children.forEach(c -> c.render(depth + 1));
        System.out.println("  ".repeat(depth) + "</div>");
    }

    public void setEnabled(boolean enabled) {
        children.forEach(c -> c.setEnabled(enabled)); // propagate down the tree
    }
}
// OUTPUT:
// <div id=signup>
//   <input name>
//   <input email>
//   <div id=address>
//     <input street>
//     <input pincode>
//   </div>
// </div>
// --- locking the address section ---
// <div id=signup>
//   <input name>
//   <input email>
//   <div id=address>
//     <input street disabled>
//     <input pincode disabled>
//   </div>
// </div>`),
        blk(`<h4>Real-time example 2: composable business rules (specification tree)</h4>
<p>Discount eligibility rules are leaves; AND, OR and NOT are composites that combine other rules. Operations teams can build new rules from small ones without touching code that evaluates them. The same shape appears in Spring Data's <code>Specification</code> and in query builders.</p>`,
`// RuleEngineCompositeDemo - AND, OR, NOT over leaf rules
import java.util.List;

public class RuleEngineCompositeDemo {
    public static void main(String[] args) {
        // (senior OR 5+ orders) AND NOT in Delhi
        Rule discount = new AllOf(
                new AnyOf(new SeniorCitizen(), new MinOrders(5)),
                new Not(new InCity("Delhi")));

        List<Customer> customers = List.of(
                new Customer("Kamla", 67, 1, "Bhopal"),
                new Customer("Vijay", 30, 8, "Delhi"),
                new Customer("Nisha", 28, 6, "Kochi"),
                new Customer("Omar", 35, 2, "Kochi"));

        for (Customer c : customers) {
            System.out.println(c.name() + " eligible: " + discount.test(c));
        }
    }
}

record Customer(String name, int ageYears, int ordersThisYear, String city) {
}

interface Rule {
    boolean test(Customer c);
}

class MinOrders implements Rule {
    private final int min;

    MinOrders(int min) {
        this.min = min;
    }

    public boolean test(Customer c) {
        return c.ordersThisYear() >= min;
    }
}

class InCity implements Rule {
    private final String city;

    InCity(String city) {
        this.city = city;
    }

    public boolean test(Customer c) {
        return c.city().equals(city);
    }
}

class SeniorCitizen implements Rule {
    public boolean test(Customer c) {
        return c.ageYears() >= 60;
    }
}

class AllOf implements Rule {
    private final List<Rule> rules;

    AllOf(Rule... rules) {
        this.rules = List.of(rules);
    }

    public boolean test(Customer c) {
        return rules.stream().allMatch(r -> r.test(c));
    }
}

class AnyOf implements Rule {
    private final List<Rule> rules;

    AnyOf(Rule... rules) {
        this.rules = List.of(rules);
    }

    public boolean test(Customer c) {
        return rules.stream().anyMatch(r -> r.test(c));
    }
}

class Not implements Rule {
    private final Rule rule;

    Not(Rule rule) {
        this.rule = rule;
    }

    public boolean test(Customer c) {
        return !rule.test(c);
    }
}
// OUTPUT:
// Kamla eligible: true
// Vijay eligible: false
// Nisha eligible: true
// Omar eligible: false`),
        blk(`<h4>Sample mini project: holiday itinerary pricing</h4>
<p>A trip is a tree: days contain activities and optional sub-groups. Every node reports its cost, and a group may apply a discount to everything beneath it. The program prints an indented price breakdown.</p>`,
`// ItineraryCompositeMiniProject - trip tree with group discounts
import java.util.ArrayList;
import java.util.List;

public class ItineraryCompositeMiniProject {
    public static void main(String[] args) {
        TripPart trip = new Group("Rajasthan 3-day trip", 0,
                new Group("Day 1 Jaipur", 0,
                        new Activity("Amer Fort entry", 500),
                        new Activity("Hotel night", 3000)),
                new Group("Day 2 Jodhpur", 10,
                        new Activity("Mehrangarh entry", 600),
                        new Activity("Jeep safari", 1400)),
                new Group("Day 3 Udaipur", 0,
                        new Activity("Boat ride", 400),
                        new Group("City palace combo", 25,
                                new Activity("Palace entry", 300),
                                new Activity("Guide", 500))));

        trip.print(0);
        System.out.println("Pay in total: Rs " + trip.cost());
    }
}

abstract class TripPart {
    protected final String label;

    TripPart(String label) {
        this.label = label;
    }

    abstract int cost();

    abstract void print(int depth);
}

class Activity extends TripPart {
    private final int price;

    Activity(String label, int price) {
        super(label);
        this.price = price;
    }

    int cost() {
        return price;
    }

    void print(int depth) {
        System.out.printf("%s%s : %d%n", "  ".repeat(depth), label, price);
    }
}

class Group extends TripPart {
    private final List<TripPart> parts = new ArrayList<>();
    private final int discountPercent;

    Group(String label, int discountPercent, TripPart... items) {
        super(label);
        this.discountPercent = discountPercent;
        parts.addAll(List.of(items));
    }

    int cost() {
        int sum = parts.stream().mapToInt(TripPart::cost).sum();
        return sum - sum * discountPercent / 100;
    }

    void print(int depth) {
        String note = discountPercent > 0 ? " (after " + discountPercent + "% off)" : "";
        System.out.printf("%s%s : %d%s%n", "  ".repeat(depth), label, cost(), note);
        parts.forEach(p -> p.print(depth + 1));
    }
}
// OUTPUT:
// Rajasthan 3-day trip : 6300
//   Day 1 Jaipur : 3500
//     Amer Fort entry : 500
//     Hotel night : 3000
//   Day 2 Jodhpur : 1800 (after 10% off)
//     Mehrangarh entry : 600
//     Jeep safari : 1400
//   Day 3 Udaipur : 1000
//     Boat ride : 400
//     City palace combo : 600 (after 25% off)
//       Palace entry : 300
//       Guide : 500
// Pay in total: Rs 6300`),
        blk(`<h4>Testing, Spring and performance notes</h4>
<ul>
<li><b>Testing</b>: build small trees by hand (empty composite, single leaf, nested three levels, a very wide one) and assert totals. Test that adding a child sets the parent and that cycles are rejected.</li>
<li><b>Spring</b>: a <code>CompositeXxx</code> bean that implements an interface and delegates to <code>List&lt;Xxx&gt;</code> (Spring injects all beans of a type) is the idiomatic composite: for example a <code>CompositeHealthIndicator</code> or your own <code>CompositeNotifier</code> that sends through every registered <code>Notifier</code>. Use <code>@Primary</code> on the composite so callers get it by default.</li>
<li><b>Performance</b>: recursion cost is O(n) per full traversal. Cache aggregates (size, price) when the tree is read far more than it is written, and invalidate on child changes up the parent chain. For very large trees use iterative traversal or streams with care (deep recursion in <code>flatMap</code> is fine, but mutation while streaming is not).</li>
<li><b>Concurrency</b>: make trees immutable (build once, share) or guard structural changes with a lock.</li>
</ul>

<h4>Anti-patterns</h4>
<ul>
<li><b>Type-checking composite</b>: clients keep writing <code>if (node instanceof Folder)</code>, which defeats the pattern; add the needed operation to the interface instead.</li>
<li><b>Fat component interface</b> full of methods that make sense for only one kind of node.</li>
<li>Using Composite for a flat list "because it might become a tree".</li>
</ul>`),
    ],
    interviewQA: [
        ['What is the Composite pattern?', 'A structural pattern that composes objects into tree structures and lets clients treat individual objects (leaves) and compositions of objects uniformly through a common interface.'],
        ['What are the participants of Composite?', 'Component (common interface), Leaf (no children, does the real work), Composite (stores children and forwards operations to them) and the Client which uses only the Component interface.'],
        ['Transparent vs safe composite: what is the trade-off?', 'Transparent puts add/remove in the Component interface, so clients treat everything uniformly but leaves must reject child operations at runtime. Safe puts child management only in the Composite, which is type safe but clients sometimes need to know which kind of node they hold.'],
        ['Give Composite examples in Java.', 'AWT Container and Component, Swing JPanel, JavaFX Node and Parent, the DOM Node tree, Jackson JsonNode, and Spring composite beans such as CompositeFilter or CompositePropertySource.'],
        ['How do you avoid infinite recursion in a composite?', 'Reject attaching a node to itself or to one of its descendants (walk the parent chain before adding), keep trees acyclic by design, and for deep trees use iterative traversal instead of recursion.'],
        ['How do Composite and Visitor work together?', 'Composite gives the tree structure; Visitor adds new operations (export, validate, price) as separate classes that traverse it, so you do not have to change every node class for each new operation.'],
    ],
};

const flyweight: TopicExtra = {
    beginner: [
        blk(`<h4>In one minute</h4>
<p>A <b>Flyweight</b> saves memory by <i>sharing</i> one object among thousands of uses instead of creating a new one each time. The object's data is split in two: <b>intrinsic state</b> (shared, immutable, stored inside the flyweight, e.g. the icon image) and <b>extrinsic state</b> (different per use, passed in by the caller, e.g. x and y position). A <b>flyweight factory</b> hands out the shared instances from a cache.</p>

<h4>Everyday analogies</h4>
<ul>
<li><b>Library copies</b>: one book title shared by many readers over time, not one new book per reader.</li>
<li><b>Rubber stamps</b>: one stamp, used on thousands of pages; the page (extrinsic) changes, the stamp (intrinsic) does not.</li>
<li><b>Font glyphs</b>: the letter shape "a" exists once; the document only stores where each "a" goes.</li>
</ul>

<h4>Where you see it in Java / JDK / Spring</h4>
<ul>
<li><code>Integer.valueOf(int)</code> caches -128 to 127; <code>Boolean.valueOf</code>, <code>Byte.valueOf</code> and <code>Character.valueOf</code> do too.</li>
<li><code>String</code> literals and <code>String.intern()</code> use the string constant pool.</li>
<li>Enums: each constant is a single shared instance.</li>
<li><code>java.util.Collections.emptyList()</code>, <code>List.of()</code> with no args and <code>Optional.empty()</code> return shared singletons.</li>
<li>Connection and thread pools share expensive objects (related idea: object pool, but pooled objects are checked out, flyweights are shared at the same time).</li>
</ul>

<h4>Structure</h4>
<pre>
Client ---&gt; FlyweightFactory ---has---&gt; cache: Map&lt;key, Flyweight&gt;
   |                                          |
   +-- passes extrinsic state -------&gt; Flyweight.operation(extrinsic)

1,000,000 map markers  --&gt;  3 Icon objects + 1,000,000 (x, y) pairs
</pre>

<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it when you need a huge number of similar objects and memory is the bottleneck (profile first).</li>
<li>Use it when most of the object's state can be made immutable and shared.</li>
<li>Do NOT use it when there are few objects, or when objects are mostly unique; you add complexity and gain nothing.</li>
<li>Do NOT share mutable objects: a change by one user would corrupt all the others.</li>
</ul>

<h4>Sample: map markers sharing icons</h4>
<p>Three icon types are created once. A thousand markers only store a reference and a position, and the output proves that the icons are the same objects.</p>`,
`// FlyweightBeginnerDemo - shared icons for many map markers
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Flyweight: immutable intrinsic state only

public class FlyweightBeginnerDemo {
    public static void main(String[] args) {
        List<Marker> markers = new ArrayList<>();
        String[] types = {"hospital", "petrol", "hospital", "atm", "petrol", "hospital"};

        for (int i = 0; i < types.length; i++) {
            markers.add(new Marker(IconFactory.get(types[i]), i * 10, i * 5));
        }

        markers.get(0).icon().draw(markers.get(0).x(), markers.get(0).y());
        markers.get(1).icon().draw(markers.get(1).x(), markers.get(1).y());

        System.out.println("Markers: " + markers.size()
                + ", icon objects: " + IconFactory.created());
        System.out.println("Same icon object? " + (markers.get(0).icon() == markers.get(2).icon()));
    }
}

final class Icon {
    private final String type;

    Icon(String type) {
        this.type = type;
        System.out.println("Creating icon " + type);
    }

    void draw(int x, int y) { // x, y are extrinsic
        System.out.println(type + " icon at (" + x + "," + y + ")");
    }
}

class IconFactory {
    private static final Map<String, Icon> CACHE = new HashMap<>();

    static Icon get(String type) {
        return CACHE.computeIfAbsent(type, Icon::new);
    }

    static int created() {
        return CACHE.size();
    }
}

// What each marker really stores
record Marker(Icon icon, int x, int y) {
}
// OUTPUT:
// Creating icon hospital
// Creating icon petrol
// Creating icon atm
// hospital icon at (0,0)
// petrol icon at (10,5)
// Markers: 6, icon objects: 3
// Same icon object? true`),
    ],
    intermediate: [
        blk(`<h4>Sample 1: characters in a text editor</h4>
<p><b>What it shows:</b> a document of 40 characters that only needs a handful of shared <code>Glyph</code> objects, because the glyph (character plus font) is intrinsic while the position in the text is extrinsic. <b>Why:</b> this is the original example from the Gang of Four book and scales to megabyte documents.</p>`,
`// FlyweightTextDemo - one glyph object per distinct character and font
import java.util.HashMap;
import java.util.Map;

public class FlyweightTextDemo {
    public static void main(String[] args) {
        String text = "jaipur jodhpur jaisalmer";
        GlyphFactory factory = new GlyphFactory();
        Glyph[] document = new Glyph[text.length()];

        for (int i = 0; i < text.length(); i++) {
            document[i] = factory.get(text.charAt(i), "Serif");
        }

        System.out.println("Characters in text: " + document.length);
        System.out.println("Glyph objects created: " + factory.size());
        System.out.println("First three: " + document[0].draw(0) + " " + document[1].draw(1)
                + " " + document[2].draw(2));
        System.out.println("Two a's share one object: " + (document[1] == document[19]));
    }
}

final class Glyph {
    private final char symbol;
    private final String font;

    Glyph(char symbol, String font) {
        this.symbol = symbol;
        this.font = font;
    }

    String draw(int column) { // column is extrinsic
        return symbol + "@" + column;
    }

    String font() {
        return font;
    }
}

class GlyphFactory {
    private final Map<String, Glyph> pool = new HashMap<>();

    Glyph get(char symbol, String font) {
        String key = symbol + "/" + font;
        return pool.computeIfAbsent(key, k -> new Glyph(symbol, font));
    }

    int size() {
        return pool.size();
    }
}
// OUTPUT:
// Characters in text: 24
// Glyph objects created: 14
// First three: j@0 a@1 i@2
// Two a's share one object: true`),
        blk(`<h4>Sample 2: flyweights already inside the JDK</h4>
<p><b>What it shows:</b> the Integer cache boundary, string pooling and <code>Boolean.valueOf</code>. <b>Why:</b> interviewers love this; it explains why <code>==</code> on two <code>Integer</code> objects works for 127 and breaks for 128, and why you must use <code>equals</code>.</p>`,
`// FlyweightJdkDemo - Integer cache, String pool and Boolean

public class FlyweightJdkDemo {
    public static void main(String[] args) {
        Integer a = Integer.valueOf(127);
        Integer b = Integer.valueOf(127);
        Integer c = Integer.valueOf(128);
        Integer d = Integer.valueOf(128);

        System.out.println("127 == 127 -> " + (a == b)); // cached flyweight
        System.out.println("128 == 128 -> " + (c == d)); // two different objects
        System.out.println("128 equals 128 -> " + c.equals(d));

        String s1 = "fort";
        String s2 = "fort";
        String s3 = new String("fort");
        System.out.println("literals same object -> " + (s1 == s2));
        System.out.println("new String same object -> " + (s1 == s3));
        System.out.println("intern same object -> " + (s1 == s3.intern()));

        System.out.println("Boolean.valueOf shared -> "
                + (Boolean.valueOf("true") == Boolean.TRUE));
    }
}
// OUTPUT:
// 127 == 127 -> true
// 128 == 128 -> false
// 128 equals 128 -> true
// literals same object -> true
// new String same object -> false
// intern same object -> true
// Boolean.valueOf shared -> true`),
        blk(`<h4>Sample 3: counting the memory saving</h4>
<p><b>What it shows:</b> the same 100,000 forest trees built twice, once with a new species object per tree and once with a shared one, and a rough byte estimate. <b>Why:</b> it turns "saves memory" into a number you can reason about. (The figures are estimates for the data fields, not an exact JVM measurement.)</p>`,
`// FlyweightMemoryDemo - compare unshared and shared trees
import java.util.HashMap;
import java.util.Map;

public class FlyweightMemoryDemo {
    static final String[] NAMES = {"Teak", "Neem", "Banyan"};

    public static void main(String[] args) {
        int count = 100_000;

        // Version 1: a new Species for every tree
        Tree[] unshared = new Tree[count];
        for (int i = 0; i < count; i++) {
            unshared[i] = new Tree(new Species(NAMES[i % 3], "green"), i % 500, i / 500);
        }

        // Version 2: species come from a factory
        Map<String, Species> pool = new HashMap<>();
        Tree[] shared = new Tree[count];
        for (int i = 0; i < count; i++) {
            Species s = pool.computeIfAbsent(NAMES[i % 3], n -> new Species(n, "green"));
            shared[i] = new Tree(s, i % 500, i / 500);
        }

        long perSpecies = 1024 + 16;
        System.out.println("Trees: " + count);
        System.out.println("Species objects, unshared: " + count);
        System.out.println("Species objects, shared:   " + pool.size());
        long unsharedKb = count * perSpecies / 1024;
        long sharedKb = pool.size() * perSpecies / 1024;
        System.out.println("Approx. texture memory unshared: " + unsharedKb + " KB");
        System.out.println("Approx. texture memory shared:   " + sharedKb + " KB");
        System.out.println("Trees 0 and 3 share species: "
                + (shared[0].species == shared[3].species));
    }
}

final class Species {
    final String name;
    final String leafColor;
    final byte[] texture = new byte[1024]; // heavy intrinsic data

    Species(String name, String leafColor) {
        this.name = name;
        this.leafColor = leafColor;
    }
}

class Tree {
    final Species species;
    final int x;
    final int y;

    Tree(Species species, int x, int y) {
        this.species = species;
        this.x = x;
        this.y = y;
    }
}
// OUTPUT:
// Trees: 100000
// Species objects, unshared: 100000
// Species objects, shared:   3
// Approx. texture memory unshared: 101562 KB
// Approx. texture memory shared:   3 KB
// Trees 0 and 3 share species: true`),
        blk(`<h4>Sample 4: a thread-safe flyweight factory</h4>
<p><b>What it shows:</b> eight threads requesting the same three shared objects from a <code>ConcurrentHashMap</code>. <b>Why:</b> a plain <code>HashMap</code> factory can create duplicates or corrupt itself under concurrency; <code>computeIfAbsent</code> makes creation atomic, so exactly one instance per key exists.</p>`,
`// FlyweightConcurrentDemo - atomic creation of shared instances
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class FlyweightConcurrentDemo {
    public static void main(String[] args) throws InterruptedException {
        String[] codes = {"INR", "USD", "EUR"};
        ExecutorService pool = Executors.newFixedThreadPool(8);

        for (int i = 0; i < 8000; i++) {
            final int n = i;
            pool.submit(() -> CurrencyFactory.of(codes[n % 3]));
        }

        pool.shutdown();
        pool.awaitTermination(10, TimeUnit.SECONDS);

        System.out.println("Requests: 8000");
        System.out.println("Objects created: " + Currency.CREATED.get());
        boolean same = CurrencyFactory.of("INR") == CurrencyFactory.of("INR");
        System.out.println("Same instance: " + same);
    }
}

final class Currency {
    final String code;

    Currency(String code) {
        this.code = code;
        CREATED.incrementAndGet();
    }

    static final AtomicInteger CREATED = new AtomicInteger();
}

class CurrencyFactory {
    private static final ConcurrentHashMap<String, Currency> POOL = new ConcurrentHashMap<>();

    static Currency of(String code) {
        return POOL.computeIfAbsent(code, Currency::new); // atomic per key
    }
}
// OUTPUT:
// Requests: 8000
// Objects created: 3
// Same instance: true`),
        blk(`<h4>Common mistakes</h4>
<ul>
<li><b>Mutable flyweight</b>: any setter on shared state is a bug waiting to happen. Make flyweights <code>final</code> with final fields.</li>
<li>Storing extrinsic state inside the flyweight (for example the position), which defeats the sharing.</li>
<li>Applying it without measuring: a few hundred objects do not need it, and it makes code harder to read.</li>
<li>An unbounded factory cache that grows forever (memory leak); use a bounded key space, a <code>WeakHashMap</code>, or a cache with eviction.</li>
<li>Comparing boxed values with <code>==</code> and relying on the cache range; always use <code>equals</code>.</li>
</ul>

<h4>Flyweight vs Singleton vs Object Pool vs Prototype</h4>
<table>
<tr><th>Pattern</th><th>How many instances</th><th>Shared at the same time?</th><th>Mutable?</th></tr>
<tr><td><b>Flyweight</b></td><td>One per distinct intrinsic state</td><td>Yes, by many clients</td><td>No, immutable</td></tr>
<tr><td><b>Singleton</b></td><td>Exactly one</td><td>Yes</td><td>Usually yes</td></tr>
<tr><td><b>Object Pool</b></td><td>A fixed set of reusable objects</td><td>No, one borrower at a time</td><td>Yes, reset on return</td></tr>
<tr><td><b>Prototype</b></td><td>Many copies of a template</td><td>No, each is a clone</td><td>Yes</td></tr>
</table>`),
    ],
    expert: [
        blk(`<h4>Real-time example 1: game tile map</h4>
<p>A 1,000 by 1,000 map has a million cells, but only four tile types. The map stores one small reference per cell, and each shared <code>TileType</code> carries the heavy data (name, movement cost). This is how real engines store terrain.</p>`,
`// TileMapFlyweightDemo - a million cells, four shared tile types
import java.util.HashMap;
import java.util.Map;

public class TileMapFlyweightDemo {
    public static void main(String[] args) {
        int size = 1000;
        String[] palette = {"grass", "forest", "water", "road"};
        TileType[][] map = new TileType[size][size]; // only references

        for (int y = 0; y < size; y++) {
            for (int x = 0; x < size; x++) {
                map[y][x] = TileTypes.get(palette[(x / 100 + y / 250) % 4]);
            }
        }

        long totalCost = 0;
        for (TileType[] row : map) {
            for (TileType t : row) {
                totalCost += t.moveCost;
            }
        }

        System.out.println("Cells: " + (size * size));
        System.out.println("TileType objects: " + TileTypes.count());
        System.out.println("Total movement cost: " + totalCost);

        StringBuilder sample = new StringBuilder();
        for (int x = 0; x < 400; x += 50) {
            sample.append(map[0][x].symbol);
        }
        System.out.println("Row 0 sample: " + sample);
    }
}

final class TileType {
    final String name;
    final int moveCost;
    final char symbol;

    TileType(String name, int moveCost, char symbol) {
        this.name = name;
        this.moveCost = moveCost;
        this.symbol = symbol;
    }
}

class TileTypes {
    private static final Map<String, TileType> ALL = new HashMap<>();

    static {
        ALL.put("grass", new TileType("grass", 1, '.'));
        ALL.put("forest", new TileType("forest", 3, 'T'));
        ALL.put("water", new TileType("water", 99, '~'));
        ALL.put("road", new TileType("road", 1, '='));
    }

    static TileType get(String name) {
        return ALL.get(name);
    }

    static int count() {
        return ALL.size();
    }
}
// OUTPUT:
// Cells: 1000000
// TileType objects: 4
// Total movement cost: 26000000
// Row 0 sample: ..TT~~==`),
        blk(`<h4>Real-time example 2: invoice lines sharing product and tax data</h4>
<p>An invoice batch has 30,000 lines. Product description and GST slab repeat constantly, so lines keep only references plus quantity (extrinsic). The program verifies identity and computes totals with the shared data.</p>`,
`// InvoiceFlyweightDemo - shared product and tax objects across many lines
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class InvoiceFlyweightDemo {
    public static void main(String[] args) {
        Catalog catalog = new Catalog();
        List<Line> lines = new ArrayList<>();

        for (int i = 0; i < 30000; i++) {
            Product p = switch (i % 3) {
                case 0 -> catalog.product("RICE-5", "Basmati rice 5kg", 480, 5);
                case 1 -> catalog.product("TV-32", "LED TV 32 inch", 14000, 18);
                default -> catalog.product("DAL-1", "Toor dal 1kg", 150, 5);
            };
            lines.add(new Line(p, 1 + i % 4));
        }

        Set<Product> distinctProducts = Collections.newSetFromMap(new IdentityHashMap<>());
        Set<TaxSlab> distinctSlabs = Collections.newSetFromMap(new IdentityHashMap<>());
        double grand = 0;

        for (Line l : lines) {
            distinctProducts.add(l.product());
            distinctSlabs.add(l.product().tax());
            grand += l.total();
        }

        System.out.println("Invoice lines: " + lines.size());
        System.out.println("Distinct Product objects: " + distinctProducts.size());
        System.out.println("Distinct TaxSlab objects: " + distinctSlabs.size());
        System.out.printf("Grand total: Rs %.2f%n", grand);
    }
}

record TaxSlab(String name, int percent) {
}

record Product(String sku, String title, int priceRs, TaxSlab tax) {
}

class Catalog {
    private final Map<String, Product> products = new HashMap<>();
    private final Map<Integer, TaxSlab> slabs = new HashMap<>();

    TaxSlab slab(int percent) {
        return slabs.computeIfAbsent(percent, p -> new TaxSlab("GST" + p, p));
    }

    Product product(String sku, String title, int price, int taxPercent) {
        return products.computeIfAbsent(sku, s -> new Product(s, title, price, slab(taxPercent)));
    }
}

// Extrinsic state: quantity. Everything else is shared.
record Line(Product product, int quantity) {
    double total() {
        double base = (double) product.priceRs() * quantity;
        return base + base * product.tax().percent() / 100.0;
    }
}
// OUTPUT:
// Invoice lines: 30000
// Distinct Product objects: 3
// Distinct TaxSlab objects: 2
// Grand total: Rs 429537500.00`),
        blk(`<h4>Sample mini project: chess set with shared pieces</h4>
<p>There are 32 pieces on a board but only 12 kinds (6 types x 2 colours). Each kind is a flyweight; the board stores references by square. The program lays out the starting position and reports how many objects were really created.</p>`,
`// ChessFlyweightMiniProject - 32 pieces from 12 shared piece types
import java.util.HashMap;
import java.util.Map;

public class ChessFlyweightMiniProject {
    public static void main(String[] args) {
        String[] backRank = {
            "Rook", "Knight", "Bishop", "Queen", "King", "Bishop", "Knight", "Rook"
        };
        Board board = new Board();
        int placed = 0;

        for (int col = 0; col < 8; col++) {
            board.place(0, col, PieceFactory.get(backRank[col], false));
            board.place(1, col, PieceFactory.get("Pawn", false));
            board.place(6, col, PieceFactory.get("Pawn", true));
            board.place(7, col, PieceFactory.get(backRank[col], true));
            placed += 4;
        }

        board.print();
        System.out.println("Pieces on board: " + placed);
        System.out.println("PieceType objects: " + PieceFactory.created());
    }
}

final class PieceType {
    private final String name;
    private final boolean white;

    PieceType(String name, boolean white) {
        this.name = name;
        this.white = white;
    }

    char symbol() {
        char letter = switch (name) {
            case "King" -> 'k';
            case "Queen" -> 'q';
            case "Rook" -> 'r';
            case "Bishop" -> 'b';
            case "Knight" -> 'n';
            default -> 'p';
        };
        return white ? Character.toUpperCase(letter) : letter;
    }
}

class PieceFactory {
    private static final Map<String, PieceType> POOL = new HashMap<>();

    static PieceType get(String name, boolean white) {
        return POOL.computeIfAbsent(name + white, k -> new PieceType(name, white));
    }

    static int created() {
        return POOL.size();
    }
}

class Board {
    private final PieceType[][] squares = new PieceType[8][8];

    void place(int row, int col, PieceType piece) {
        squares[row][col] = piece;
    }

    void print() {
        for (int row = 0; row < 8; row++) {
            StringBuilder line = new StringBuilder();
            for (int col = 0; col < 8; col++) {
                line.append(squares[row][col] == null ? '.' : squares[row][col].symbol());
                line.append(' ');
            }
            System.out.println(line.toString().trim());
        }
    }
}
// OUTPUT:
// r n b q k b n r
// p p p p p p p p
// . . . . . . . .
// . . . . . . . .
// . . . . . . . .
// . . . . . . . .
// P P P P P P P P
// R N B Q K B N R
// Pieces on board: 32
// PieceType objects: 12`),
        blk(`<h4>Testing, Spring and performance notes</h4>
<ul>
<li><b>Testing</b>: assert identity (<code>assertSame</code>) for two requests with the same key, assert that flyweights are immutable (final fields, no setters) and that the factory is thread safe with a concurrent test as in the sample above.</li>
<li><b>Spring</b>: singleton-scoped beans are flyweights of a kind: one shared stateless instance serves every request, which is why beans must not hold per-request state (that is the extrinsic part, pass it as method arguments). Spring's <code>ConcurrentReferenceHashMap</code> and Caffeine caches are common choices for a flyweight pool with eviction.</li>
<li><b>Performance</b>: measure with a profiler or JOL before and after. Gains are largest when intrinsic data is heavy and duplicates are many; the cost is a hash lookup per creation and the risk of memory held by the pool. Keep keys small and well-hashed (records are ideal).</li>
<li>Java tools that help: records for immutable flyweights, <code>computeIfAbsent</code> for atomic creation, and primitive arrays (instead of objects) when even references are too heavy.</li>
</ul>

<h4>Anti-patterns</h4>
<ul>
<li><b>Hidden global cache</b>: a static map nobody can clear, causing leaks in long running servers and flaky tests.</li>
<li><b>Flyweight with identity semantics</b>: code that relies on <code>==</code> for equality of values that are not guaranteed to be pooled.</li>
<li><b>Premature optimisation</b>: introducing sharing before measuring a real memory problem.</li>
</ul>`),
    ],
    interviewQA: [
        ['What is the Flyweight pattern?', 'A structural pattern that reduces memory use by sharing objects. Common immutable data (intrinsic state) lives in a shared flyweight; varying data (extrinsic state) is supplied by the client at each call.'],
        ['Explain intrinsic vs extrinsic state with an example.', 'In a text editor a Glyph holds the character and font (intrinsic, shared). The position of each character in the document is extrinsic and passed to draw(). Intrinsic state is context-independent, extrinsic state is context-dependent.'],
        ['Why does Integer 127 == 127 work but 128 == 128 not?', 'Integer.valueOf caches instances for -128 to 127 (a flyweight). Outside the range each autoboxing creates a new object, so == compares references. Always compare boxed values with equals.'],
        ['Why must flyweights be immutable?', 'They are shared by many clients simultaneously. If one client changed the shared state, every other user would see the change. Immutability also makes them thread safe without locks.'],
        ['How is Flyweight different from Singleton and Object Pool?', 'Singleton has one instance of a class, usually mutable. Flyweight has one instance per distinct intrinsic state, immutable and shared concurrently. An object pool lends out reusable mutable objects one borrower at a time.'],
        ['How do you make a flyweight factory thread safe?', 'Use ConcurrentHashMap.computeIfAbsent (atomic per key) or an initialisation-on-demand holder for a fixed set, and keep the flyweights immutable.'],
    ],
};

export const designPatternExtras2: Record<string, TopicExtra> = {
    'adapter-pattern': adapter,
    'decorator-pattern': decorator,
    'facade-pattern': facade,
    'proxy-pattern': proxy,
    'bridge-pattern': bridge,
    'composite-pattern': composite,
    'flyweight-pattern': flyweight,
};
