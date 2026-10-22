import type { TopicExtra } from './courseMerges';
import { blk } from './jsRoadmapKit';

const observerExtra: TopicExtra = {
  beginner: [
    blk(`
<h4>In one minute</h4>
<p>The <b>Observer pattern</b> lets one object, the <b>subject</b> (also called publisher), keep a list of <b>observers</b> (subscribers) and tell all of them whenever its state changes. The subject only knows that each observer has an <code>update</code> method, so you can add or remove observers without touching the subject.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Railway platform announcements</b>: one announcer, many waiting passengers who react in their own way.</li>
<li><b>Weather alert SMS</b>: the met office changes a forecast and every registered phone gets a message.</li>
<li><b>Stock-market ticker</b>: a price change is pushed to every trader screen and every alert rule.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>java.beans.PropertyChangeListener</code> and <code>PropertyChangeSupport</code> for bound properties.</li>
<li>Swing and JavaFX listeners such as <code>ActionListener</code> and <code>ChangeListener</code>.</li>
<li><code>java.util.Observable</code> and <code>Observer</code> (deprecated since Java 9, prefer the alternatives).</li>
<li><code>java.util.concurrent.Flow</code> and <code>SubmissionPublisher</code> for reactive streams.</li>
<li>Spring <code>ApplicationEvent</code>, <code>ApplicationListener</code> and <code>@EventListener</code>.</li>
</ul>
<h4>Structure</h4>
<pre>
Subject (Publisher)             Observer (Subscriber)
+------------------+  1..*     +------------------+
| attach(o)        |---------->| update(data)     |
| detach(o)        |           +------------------+
| notifyObservers()|                    ^
+------------------+          +---------+---------+
        ^                     |                   |
 ConcreteSubject         SmsObserver        DisplayObserver
</pre>
<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it when a change in one object must update an unknown or changing number of other objects.</li>
<li>Use it for event systems, UI updates, notifications and audit hooks.</li>
<li>Avoid it when there is exactly one fixed receiver; a plain method call is simpler.</li>
<li>Avoid it when the order of notifications really matters; observers should not depend on each other.</li>
</ul>
<h4>Small program: weather office with lambdas</h4>
<p>Because the observer interface has one method, a lambda or <code>Consumer</code> can act as an observer. No extra classes are needed.</p>
`, `// Observer with lambdas: a weather office notifies listeners
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class ObsBeginWeatherDemo {
    public static void main(String[] args) {
        ObsBeginWeatherOffice office = new ObsBeginWeatherOffice();

        office.subscribe(report -> System.out.println("SMS  -> " + report));
        office.subscribe(report -> System.out.println("Board-> " + report.toUpperCase()));

        office.publish("Pune", 28);
        office.publish("Jaipur", 41);
    }
}

class ObsBeginWeatherOffice {
    private final List<Consumer<String>> listeners = new ArrayList<>();

    void subscribe(Consumer<String> listener) {
        listeners.add(listener);
    }

    void publish(String city, int temperature) {
        String report = city + " is " + temperature + " C";
        for (Consumer<String> listener : listeners) {
            listener.accept(report); // every observer gets the same report
        }
    }
}

// OUTPUT:
// SMS  -> Pune is 28 C
// Board-> PUNE IS 28 C
// SMS  -> Jaipur is 41 C
// Board-> JAIPUR IS 41 C`),
  ],
  intermediate: [
    blk(`
<h4>Push versus pull notification</h4>
<p><b>WHAT:</b> two ways to hand data to observers. In <b>push</b> the subject sends the new values as arguments. In <b>pull</b> the subject sends only itself and the observer asks for what it needs.</p>
<p><b>WHY:</b> push is simple but forces every observer to receive data it may not need. Pull keeps the interface stable when the subject grows new fields.</p>
`, `// Push vs pull observers on a fort ticket counter
import java.util.ArrayList;
import java.util.List;

public class ObsPushPullDemo {
    public static void main(String[] args) {
        ObsFortCounter counter = new ObsFortCounter("Raigad");

        counter.addPush((fort, total) -> System.out.println("PUSH: " + fort + " sold " + total));
        counter.addPull(c -> System.out.println("PULL: " + c.getFort() + " now " + c.getSold()));

        counter.sell(20);
        counter.sell(15);
    }
}

interface ObsPushListener {
    void onSold(String fort, int total); // push: data comes as arguments
}

interface ObsPullListener {
    void onChange(ObsFortCounter counter); // pull: observer queries the subject
}

class ObsFortCounter {
    private final List<ObsPushListener> pushList = new ArrayList<>();
    private final List<ObsPullListener> pullList = new ArrayList<>();
    private final String fort;
    private int sold;

    ObsFortCounter(String fort) {
        this.fort = fort;
    }

    void addPush(ObsPushListener l) {
        pushList.add(l);
    }

    void addPull(ObsPullListener l) {
        pullList.add(l);
    }

    String getFort() {
        return fort;
    }

    int getSold() {
        return sold;
    }

    void sell(int count) {
        sold += count;
        pushList.forEach(l -> l.onSold(fort, sold));
        pullList.forEach(l -> l.onChange(this));
    }
}

// OUTPUT:
// PUSH: Raigad sold 20
// PULL: Raigad now 20
// PUSH: Raigad sold 35
// PULL: Raigad now 35`),
    blk(`
<h4>Generic observer with unsubscribe handle</h4>
<p><b>WHAT:</b> a reusable <code>ObsTopic&lt;T&gt;</code> where <code>subscribe</code> returns a <code>Runnable</code> that removes the listener.</p>
<p><b>WHY:</b> forgetting to unsubscribe is the number one <b>memory leak</b> in observer code: the subject holds a strong reference to every listener. Returning a handle makes cleanup easy and explicit.</p>
`, `// Generic subject with an unsubscribe handle
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class ObsGenericTopicDemo {
    public static void main(String[] args) {
        ObsTopic<ObsPrice> topic = new ObsTopic<>();

        Runnable cancelA = topic.subscribe(p -> System.out.println("A sees " + p));
        topic.subscribe(p -> System.out.println("B sees " + p.symbol()));

        topic.publish(new ObsPrice("TCS", 3850.5));
        cancelA.run(); // A unsubscribes
        topic.publish(new ObsPrice("INFY", 1520.0));

        System.out.println("Listeners left: " + topic.count());
    }
}

class ObsTopic<T> {
    private final List<Consumer<T>> listeners = new ArrayList<>();

    Runnable subscribe(Consumer<T> listener) {
        listeners.add(listener);
        return () -> listeners.remove(listener); // call this to unsubscribe
    }

    void publish(T value) {
        for (Consumer<T> l : new ArrayList<>(listeners)) { // copy: safe if one unsubscribes
            l.accept(value);
        }
    }

    int count() {
        return listeners.size();
    }
}

record ObsPrice(String symbol, double value) {
}

// OUTPUT:
// A sees ObsPrice[symbol=TCS, value=3850.5]
// B sees TCS
// B sees INFY
// Listeners left: 1`),
    blk(`
<h4>JDK PropertyChangeSupport</h4>
<p><b>WHAT:</b> the JDK already ships an observer toolkit for bean properties. <code>PropertyChangeSupport</code> manages listeners and fires an event only when the old and new values differ.</p>
<p><b>WHY:</b> in real projects you often reuse this instead of hand-writing the list handling.</p>
`, `// Using java.beans.PropertyChangeSupport
import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

public class ObsBeansDemo {
    public static void main(String[] args) {
        ObsEmployee emp = new ObsEmployee();

        emp.addListener(e -> System.out.println(
                e.getPropertyName() + ": " + e.getOldValue() + " -> " + e.getNewValue()));

        emp.setCity("Nashik");
        emp.setCity("Nashik"); // same value, no event
        emp.setCity("Satara");
    }
}

class ObsEmployee {
    private final PropertyChangeSupport support = new PropertyChangeSupport(this);
    private String city = "Nagpur";

    void addListener(PropertyChangeListener l) {
        support.addPropertyChangeListener(l);
    }

    void setCity(String newCity) {
        String old = this.city;
        this.city = newCity;
        support.firePropertyChange("city", old, newCity); // skipped if equal
    }
}

// OUTPUT:
// city: Nagpur -> Nashik
// city: Nashik -> Satara`),
    blk(`
<h4>Topic-based event bus</h4>
<p><b>WHAT:</b> observers subscribe to a named topic instead of to a single subject, so one bus serves many kinds of news.</p>
<p><b>WHY:</b> publishers and subscribers no longer know each other at all; this is the idea behind message brokers and Spring events.</p>
`, `// A tiny topic-based event bus (news agency)
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

public class ObsNewsBusDemo {
    public static void main(String[] args) {
        ObsNewsBus bus = new ObsNewsBus();

        bus.subscribe("sports", h -> System.out.println("  Cricket fan: " + h));
        bus.subscribe("sports", h -> System.out.println("  Sports desk: " + h));
        bus.subscribe("tech", h -> System.out.println("  Developer: " + h));

        bus.publish("sports", "India wins the final");
        bus.publish("tech", "Java 21 adopted widely");
        bus.publish("travel", "No subscribers here");
    }
}

class ObsNewsBus {
    private final Map<String, List<Consumer<String>>> topics = new HashMap<>();

    void subscribe(String topic, Consumer<String> handler) {
        topics.computeIfAbsent(topic, k -> new ArrayList<>()).add(handler);
    }

    void publish(String topic, String headline) {
        List<Consumer<String>> handlers = topics.getOrDefault(topic, List.of());
        System.out.println("[" + topic + "] delivering to " + handlers.size() + " reader(s)");
        handlers.forEach(h -> h.accept(headline));
    }
}

// OUTPUT:
// [sports] delivering to 2 reader(s)
//   Cricket fan: India wins the final
//   Sports desk: India wins the final
// [tech] delivering to 1 reader(s)
//   Developer: Java 21 adopted widely
// [travel] delivering to 0 reader(s)`),
    blk(`
<h4>Common mistakes</h4>
<ul>
<li><b>Memory leak</b>: observers never removed keep the subject (and everything they reference) alive. Always provide <code>unsubscribe</code>, or hold <code>WeakReference</code> observers.</li>
<li><b>ConcurrentModificationException</b>: an observer that unsubscribes while the list is being iterated. Iterate over a copy or use <code>CopyOnWriteArrayList</code>.</li>
<li><b>Update storms and cycles</b>: observer A changes the subject, which notifies A again. Guard with a flag or compare old and new values.</li>
<li><b>One failing observer stops the rest</b>: wrap each call in try/catch so one exception does not block the others.</li>
<li><b>Depending on notification order</b>: the order is an implementation detail, do not rely on it.</li>
</ul>
<h4>Observer compared with similar patterns</h4>
<table>
<tr><th>Pattern</th><th>Relationship</th><th>Key difference</th></tr>
<tr><td>Observer</td><td>one subject to many observers</td><td>subject knows its observers directly</td></tr>
<tr><td>Mediator</td><td>many colleagues through one hub</td><td>hub coordinates and contains logic</td></tr>
<tr><td>Pub-Sub / Event Bus</td><td>publishers and subscribers via a broker</td><td>full decoupling through a channel</td></tr>
<tr><td>Chain of Responsibility</td><td>one request passed along handlers</td><td>usually one handler acts, not all</td></tr>
</table>
`),
  ],
  expert: [
    blk(`
<h4>Real-time example 1: order events with error isolation</h4>
<p>An e-commerce order service publishes typed events. Inventory, billing and email listeners react. A faulty listener must never break checkout, so each call is isolated and failures are reported.</p>
`, `// Typed order events with isolated listeners
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.function.Consumer;

public class ObsOrderEventsDemo {
    public static void main(String[] args) {
        ObsOrderPublisher publisher = new ObsOrderPublisher();

        publisher.register(e -> System.out.println("Inventory reserved for #" + e.orderId()));
        publisher.register(e -> {
            if (e.amount() > 50000) {
                throw new IllegalStateException("fraud check failed");
            }
            System.out.println("Billing charged Rs " + e.amount());
        });
        publisher.register(e -> System.out.println("Mail sent to " + e.customer()));

        publisher.publish(new ObsOrderPlaced(101, "Asha", 1999.0));
        publisher.publish(new ObsOrderPlaced(102, "Vikram", 75000.0));

        System.out.println("Failures: " + publisher.getFailures());
    }
}

record ObsOrderPlaced(int orderId, String customer, double amount) {
}

class ObsOrderPublisher {
    private final List<Consumer<ObsOrderPlaced>> listeners = new CopyOnWriteArrayList<>();
    private final List<String> failures = new ArrayList<>();

    void register(Consumer<ObsOrderPlaced> listener) {
        listeners.add(listener);
    }

    void publish(ObsOrderPlaced event) {
        for (Consumer<ObsOrderPlaced> l : listeners) {
            try {
                l.accept(event);
            } catch (RuntimeException ex) {
                failures.add("order " + event.orderId() + ": " + ex.getMessage());
            }
        }
    }

    List<String> getFailures() {
        return failures;
    }
}

// OUTPUT:
// Inventory reserved for #101
// Billing charged Rs 1999.0
// Mail sent to Asha
// Inventory reserved for #102
// Mail sent to Vikram
// Failures: [order 102: fraud check failed]`),
    blk(`
<h4>Real-time example 2: re-entrant safe notifications</h4>
<p>A seat-booking subject has an observer that reacts to a change by changing the subject again (it releases a waiting-list seat). Notifying immediately would recurse. This version queues events and drains them in order, which keeps the output predictable.</p>
`, `// Queueing events so observers may change the subject safely
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;
import java.util.function.IntConsumer;

public class ObsReentrantDemo {
    public static void main(String[] args) {
        ObsSeatPool pool = new ObsSeatPool(2);

        pool.observe(free -> System.out.println("Free seats: " + free));
        pool.observe(free -> {
            if (free < 0) {
                System.out.println("Overbooked, releasing one waiting seat");
                pool.change(1); // changes the subject from inside an observer
            }
        });

        pool.change(-1);
        pool.change(-2);
    }
}

class ObsSeatPool {
    private final List<IntConsumer> observers = new ArrayList<>();
    private final Deque<Integer> pending = new ArrayDeque<>();
    private boolean draining;
    private int free;

    ObsSeatPool(int free) {
        this.free = free;
    }

    void observe(IntConsumer o) {
        observers.add(o);
    }

    void change(int delta) {
        free += delta;
        pending.add(free); // remember the value, notify later
        if (draining) {
            return; // an outer call is already draining the queue
        }
        draining = true;
        while (!pending.isEmpty()) {
            int value = pending.poll();
            observers.forEach(o -> o.accept(value));
        }
        draining = false;
    }
}

// OUTPUT:
// Free seats: 1
// Free seats: -1
// Overbooked, releasing one waiting seat
// Free seats: 0`),
    blk(`
<h4>Sample mini project: Fort ticket dashboard</h4>
<p>Several small classes work together: a subject (<code>ObsTicketOffice</code>), three observers (a live display, a revenue tracker and a sold-out alert) and a demo that prints a readable result.</p>
`, `// Mini project: fort ticket counter with three observers
import java.util.ArrayList;
import java.util.List;

public class ObsFortDashboard {
    public static void main(String[] args) {
        ObsTicketOffice office = new ObsTicketOffice("Sinhagad", 10);

        office.addListener(new ObsLiveDisplay());
        office.addListener(new ObsRevenueTracker(50));
        office.addListener(new ObsSoldOutAlert());

        office.sell(4);
        office.sell(8);
        office.sell(6);
    }
}

interface ObsTicketListener {
    void onSale(String fort, int quantity, int remaining);
}

class ObsTicketOffice {
    private final List<ObsTicketListener> listeners = new ArrayList<>();
    private final String fort;
    private int remaining;

    ObsTicketOffice(String fort, int capacity) {
        this.fort = fort;
        this.remaining = capacity;
    }

    void addListener(ObsTicketListener listener) {
        listeners.add(listener);
    }

    boolean sell(int quantity) {
        if (quantity > remaining) {
            System.out.println("Rejected: only " + remaining + " left at " + fort);
            return false;
        }
        remaining -= quantity;
        for (ObsTicketListener l : listeners) {
            l.onSale(fort, quantity, remaining);
        }
        return true;
    }
}

class ObsLiveDisplay implements ObsTicketListener {
    public void onSale(String fort, int quantity, int remaining) {
        System.out.println("DISPLAY " + fort + ": " + remaining + " tickets left");
    }
}

class ObsRevenueTracker implements ObsTicketListener {
    private final int price;
    private int revenue;

    ObsRevenueTracker(int price) {
        this.price = price;
    }

    public void onSale(String fort, int quantity, int remaining) {
        revenue += quantity * price;
        System.out.println("REVENUE total Rs " + revenue);
    }
}

class ObsSoldOutAlert implements ObsTicketListener {
    public void onSale(String fort, int quantity, int remaining) {
        if (remaining == 0) {
            System.out.println("ALERT " + fort + " is SOLD OUT");
        }
    }
}

// OUTPUT:
// DISPLAY Sinhagad: 6 tickets left
// REVENUE total Rs 200
// Rejected: only 6 left at Sinhagad
// DISPLAY Sinhagad: 0 tickets left
// REVENUE total Rs 500
// ALERT Sinhagad is SOLD OUT`),
    blk(`
<h4>Thread safety, testing and Spring notes</h4>
<ul>
<li><b>Thread safety</b>: use <code>CopyOnWriteArrayList</code> for read-mostly listener lists; never call unknown observer code while holding a lock (risk of deadlock). Publish from a snapshot of the state.</li>
<li><b>Asynchronous delivery</b>: hand events to an <code>ExecutorService</code> if observers are slow, but then ordering and error handling become your job.</li>
<li><b>Testing</b>: register a recording lambda (it adds to a list) and assert on the list; test unsubscribe and exception isolation explicitly.</li>
<li><b>Spring</b>: inject <code>ApplicationEventPublisher</code> and call <code>publishEvent(new OrderPlacedEvent(...))</code>; listeners use <code>@EventListener</code>. Add <code>@TransactionalEventListener</code> to react only after a commit and <code>@Async</code> for background handling.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Event spaghetti</b>: dozens of events triggering each other so nobody can follow the flow.</li>
<li><b>Fat events</b> that carry the whole domain graph, coupling observers to subject internals.</li>
<li><b>Business-critical logic hidden in a listener</b> that can be silently unregistered.</li>
</ul>
`),
  ],
  interviewQA: [
    ['What problem does Observer solve?', 'It removes tight coupling between an object whose state changes and the objects that must react. The subject only knows an observer interface, so observers can be added or removed at runtime without changing it.'],
    ['Push or pull model: how do you choose?', 'Push sends the data with the notification, which is simple but may send unneeded data. Pull passes the subject so the observer fetches only what it needs, which keeps the interface stable when the subject evolves.'],
    ['How can Observer cause a memory leak, and how do you avoid it?', 'The subject holds strong references to its observers, so an observer that is never unsubscribed cannot be garbage collected (the lapsed listener problem). Provide unsubscribe, return a removal handle, or store WeakReferences.'],
    ['How do you make notification safe when observers unsubscribe during the callback?', 'Iterate over a copy of the list or use CopyOnWriteArrayList so the iteration is not affected by concurrent modification.'],
    ['Why was java.util.Observable deprecated?', 'It is a class, so a subject cannot extend anything else, setChanged is protected, it is not thread safe and gives no event typing. Use PropertyChangeSupport, Flow, or your own listener interfaces.'],
    ['What is the difference between Observer and Pub-Sub?', 'In Observer the subject knows its observers directly. In Pub-Sub a broker or channel sits between publishers and subscribers, so they never know each other and can even run in different processes.'],
    ['How does Spring implement Observer?', 'ApplicationEventPublisher publishes events, and beans annotated with @EventListener (or implementing ApplicationListener) receive them. Events can be handled asynchronously with @Async or after commit with @TransactionalEventListener.'],
  ],
};

const chainExtra: TopicExtra = {
  beginner: [
    blk(`
<h4>In one minute</h4>
<p>In <b>Chain of Responsibility</b> a request travels along a line of <b>handlers</b>. Each handler either deals with the request or passes it to its <b>successor</b>. The sender does not know which handler will finally process it, and handlers can be re-ordered or added without changing the sender.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Bank loan approval</b>: clerk, manager, regional head. Small loans stop at the clerk, big ones climb the ladder.</li>
<li><b>Customer support levels</b>: L1 agent, L2 engineer, L3 developer. The ticket moves up until someone can solve it.</li>
<li><b>Airport security</b>: ticket check, baggage scan, body scan. Each stage can stop the passenger or let them continue.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li>Servlet <code>javax.servlet.Filter</code> and <code>FilterChain.doFilter(request, response)</code>.</li>
<li>Spring Security <code>SecurityFilterChain</code> and Spring MVC <code>HandlerInterceptor</code>.</li>
<li><code>java.util.logging.Logger</code> passing records to parent loggers; Log4j and Logback appender chains.</li>
<li>The <code>try / catch</code> blocks of Java: an exception goes up the call stack until some handler catches it.</li>
<li><code>java.util.function.Function.andThen</code> style pipelines are a functional cousin.</li>
</ul>
<h4>Structure</h4>
<pre>
Client --> [Handler A] --next--> [Handler B] --next--> [Handler C]
              |                     |                     |
        handles or passes     handles or passes     handles or ends

abstract Handler { Handler next; handle(request) }
</pre>
<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it when more than one object may handle a request and the handler is not known in advance.</li>
<li>Use it for validation pipelines, approval workflows, request filters and event bubbling.</li>
<li>Use it when the set of handlers and their order should be configurable at runtime.</li>
<li>Avoid it when exactly one object always handles the request; a direct call is clearer.</li>
<li>Avoid very long chains where a request may fall off the end unhandled and nobody notices.</li>
</ul>
<h4>Small program: support ticket levels</h4>
<p>Each level handles tickets up to its own severity and passes harder ones on. The last line reports what happens when nobody can handle the request.</p>
`, `// Chain of Responsibility: support levels

public class ChBeginSupportDemo {
    public static void main(String[] args) {
        ChBeginSupport l1 = new ChBeginLevel1();
        l1.linkTo(new ChBeginLevel2());

        l1.handle(1);
        l1.handle(4);
        l1.handle(9);
    }
}
abstract class ChBeginSupport {
    private ChBeginSupport next;

    ChBeginSupport linkTo(ChBeginSupport next) {
        this.next = next;
        return next; // lets us write a.linkTo(b).linkTo(c)
    }

    void handle(int severity) {
        if (canHandle(severity)) {
            System.out.println(name() + " solved severity " + severity);
        } else if (next != null) {
            System.out.println(name() + " escalates severity " + severity);
            next.handle(severity);
        } else {
            System.out.println("Nobody could solve severity " + severity);
        }
    }

    abstract boolean canHandle(int severity);

    abstract String name();
}

class ChBeginLevel1 extends ChBeginSupport {
    boolean canHandle(int severity) {
        return severity <= 2;
    }

    String name() {
        return "L1 agent";
    }
}

class ChBeginLevel2 extends ChBeginSupport {
    boolean canHandle(int severity) {
        return severity <= 5;
    }

    String name() {
        return "L2 engineer";
    }
}

// OUTPUT:
// L1 agent solved severity 1
// L1 agent escalates severity 4
// L2 engineer solved severity 4
// L1 agent escalates severity 9
// Nobody could solve severity 9`),
  ],
  intermediate: [
    blk(`
<h4>Approval workflow with a functional chain</h4>
<p><b>WHAT:</b> a leave or expense approval where each approver is a lambda-backed handler with its own limit.</p>
<p><b>WHY:</b> shows that handlers do not need one class each. A small record plus a limit is enough, and the chain is built from a list.</p>
`, `// Expense approval chain built from a list
import java.util.List;

public class ChApprovalDemo {
    public static void main(String[] args) {
        ChExpenseChain chain = new ChExpenseChain(List.of(
                new ChApprover("Team Lead", 5000),
                new ChApprover("Manager", 25000),
                new ChApprover("Director", 100000)));

        System.out.println(chain.approve("Ravi", 3200));
        System.out.println(chain.approve("Meena", 18000));
        System.out.println(chain.approve("Sunil", 250000));
    }
}

record ChApprover(String title, double limit) {
}

class ChExpenseChain {
    private final List<ChApprover> approvers;

    ChExpenseChain(List<ChApprover> approvers) {
        this.approvers = approvers;
    }

    String approve(String employee, double amount) {
        for (ChApprover a : approvers) {
            if (amount <= a.limit()) {
                return employee + " Rs " + amount + " approved by " + a.title();
            }
        }
        return employee + " Rs " + amount + " REJECTED: above every limit";
    }
}

// OUTPUT:
// Ravi Rs 3200.0 approved by Team Lead
// Meena Rs 18000.0 approved by Manager
// Sunil Rs 250000.0 REJECTED: above every limit`),
    blk(`
<h4>Validation chain that collects every error</h4>
<p><b>WHAT:</b> a chain where each validator checks one rule and always passes control on, so all problems are collected.</p>
<p><b>WHY:</b> a chain does not have to stop at the first handler. In validation you often want a full list of errors, not only the first one.</p>
`, `// Validation chain: every link adds its own error
import java.util.ArrayList;
import java.util.List;

public class ChValidationDemo {
    public static void main(String[] args) {
        ChValidator first = new ChEmailRule();
        first.then(new ChPasswordRule()).then(new ChAgeRule());

        List<String> errors = new ArrayList<>();
        first.validate(new ChSignup("asha.example.com", "abc", 16), errors);
        System.out.println("Errors: " + errors);

        errors.clear();
        first.validate(new ChSignup("ravi@example.com", "strongPass1", 30), errors);
        System.out.println("Errors: " + errors);
    }
}

record ChSignup(String email, String password, int age) {
}

abstract class ChValidator {
    private ChValidator next;

    ChValidator then(ChValidator next) {
        this.next = next;
        return next;
    }

    void validate(ChSignup s, List<String> errors) {
        check(s, errors);
        if (next != null) {
            next.validate(s, errors); // always continue
        }
    }

    abstract void check(ChSignup s, List<String> errors);
}

class ChEmailRule extends ChValidator {
    void check(ChSignup s, List<String> errors) {
        if (!s.email().contains("@")) {
            errors.add("email must contain @");
        }
    }
}

class ChPasswordRule extends ChValidator {
    void check(ChSignup s, List<String> errors) {
        if (s.password().length() < 8) {
            errors.add("password shorter than 8 characters");
        }
    }
}

class ChAgeRule extends ChValidator {
    void check(ChSignup s, List<String> errors) {
        if (s.age() < 18) {
            errors.add("must be 18 or older");
        }
    }
}

// OUTPUT:
// Errors: [email must contain @, password shorter than 8 characters, must be 18 or older]
// Errors: []`),
    blk(`
<h4>Logging levels chain</h4>
<p><b>WHAT:</b> a console logger, a file logger and an alert logger, each reacting to a minimum level. A message may be handled by several links.</p>
<p><b>WHY:</b> this is the classic "pass it on even if I handled it" variant, used by log frameworks.</p>
`, `// Logging chain: several handlers may act on one message

public class ChLoggerDemo {
    public static void main(String[] args) {
        ChLogger chain = new ChConsoleLogger();
        chain.setNext(new ChFileLogger()).setNext(new ChAlertLogger());

        chain.log(ChLogger.INFO, "Server started");
        chain.log(ChLogger.WARN, "Disk 85% full");
        chain.log(ChLogger.ERROR, "Database down");
    }
}
abstract class ChLogger {
    static final int INFO = 1;
    static final int WARN = 2;
    static final int ERROR = 3;

    private final int level;
    private ChLogger next;

    ChLogger(int level) {
        this.level = level;
    }

    ChLogger setNext(ChLogger next) {
        this.next = next;
        return next;
    }

    void log(int messageLevel, String text) {
        if (messageLevel >= level) {
            write(text);
        }
        if (next != null) {
            next.log(messageLevel, text); // keep going
        }
    }

    abstract void write(String text);
}

class ChConsoleLogger extends ChLogger {
    ChConsoleLogger() {
        super(INFO);
    }

    void write(String text) {
        System.out.println("console: " + text);
    }
}

class ChFileLogger extends ChLogger {
    ChFileLogger() {
        super(WARN);
    }

    void write(String text) {
        System.out.println("file   : " + text);
    }
}

class ChAlertLogger extends ChLogger {
    ChAlertLogger() {
        super(ERROR);
    }

    void write(String text) {
        System.out.println("ALERT  : " + text);
    }
}

// OUTPUT:
// console: Server started
// console: Disk 85% full
// file   : Disk 85% full
// console: Database down
// file   : Database down
// ALERT  : Database down`),
    blk(`
<h4>Servlet-style filter chain</h4>
<p><b>WHAT:</b> a mini <code>FilterChain</code> where each filter does work before and after the next one, like authentication, logging and compression filters.</p>
<p><b>WHY:</b> this is the form you will meet in real web frameworks. A filter decides whether to call <code>chain.next()</code>, so it can also short-circuit the request.</p>
`, `// Mini servlet-like filter chain with before/after work
import java.util.ArrayList;
import java.util.List;

public class ChFilterDemo {
    public static void main(String[] args) {
        ChFilterChain chain = new ChFilterChain();

        chain.add((req, c) -> {
            System.out.println("  log: before " + req);
            c.next(req);
            System.out.println("  log: after " + req);
        });
        chain.add((req, c) -> {
            if (req.contains("admin")) {
                System.out.println("  auth: 403 forbidden, chain stopped");
                return; // short circuit
            }
            c.next(req);
        });

        System.out.println("Request /home");
        chain.next("/home");

        ChFilterChain second = new ChFilterChain();
        second.add((req, c) -> {
            System.out.println("  auth: blocking " + req);
        });
        System.out.println("Request /admin");
        second.next("/admin");
    }
}

interface ChFilter {
    void apply(String request, ChFilterChain chain);
}

class ChFilterChain {
    private final List<ChFilter> filters = new ArrayList<>();
    private int position;

    ChFilterChain add(ChFilter f) {
        filters.add(f);
        return this;
    }

    void next(String request) {
        if (position < filters.size()) {
            ChFilter f = filters.get(position++);
            f.apply(request, this);
        } else {
            System.out.println("  servlet handles " + request);
        }
    }
}

// OUTPUT:
// Request /home
//   log: before /home
//   servlet handles /home
//   log: after /home
// Request /admin
//   auth: blocking /admin`),
    blk(`
<h4>Common mistakes</h4>
<ul>
<li><b>Infinite chain</b>: linking a handler back to an earlier one creates a cycle. Build chains in one place and never reuse a node twice.</li>
<li><b>Request falls off the end</b>: if no handler matches, nothing happens silently. Add a default last handler or throw an exception.</li>
<li><b>Forgetting to call next</b>: a handler that handles the request but should also let others act must still forward it.</li>
<li><b>Order dependence hidden in code</b>: authentication must run before authorization. Document the order and test it.</li>
<li><b>Stack depth</b>: recursive chains with hundreds of links can overflow the stack; use a loop over a list.</li>
</ul>
<h4>Chain of Responsibility compared with similar patterns</h4>
<table>
<tr><th>Pattern</th><th>Idea</th><th>Key difference</th></tr>
<tr><td>Chain of Responsibility</td><td>pass a request along candidates</td><td>sender does not know the receiver</td></tr>
<tr><td>Decorator</td><td>wrap an object to add behavior</td><td>every wrapper acts, and the object keeps its interface</td></tr>
<tr><td>Command</td><td>turn a request into an object</td><td>one known receiver executes it</td></tr>
<tr><td>Observer</td><td>notify all subscribers</td><td>all observers react, not one of many</td></tr>
<tr><td>Strategy</td><td>choose one algorithm</td><td>the client picks it, no passing along</td></tr>
</table>
`),
  ],
  expert: [
    blk(`
<h4>Real-time example 1: HTTP-like request pipeline</h4>
<p>A request goes through rate limiting, authentication and role authorization. Each stage returns a result, so the first failing stage produces a clear status code. This is how API gateways and Spring Security behave.</p>
`, `// Request pipeline: rate limit, authentication, authorization
import java.util.HashMap;
import java.util.Map;

public class ChPipelineDemo {
    public static void main(String[] args) {
        ChStage head = new ChRateLimit();
        head.setNext(new ChAuthenticate()).setNext(new ChAuthorize());

        System.out.println(head.process(new ChRequest("asha", "tok-1", "/home")));
        System.out.println(head.process(new ChRequest("ravi", "xyz", "/home")));
        System.out.println(head.process(new ChRequest("ravi", "tok-2", "/admin/users")));
        System.out.println(head.process(new ChRequest("ravi", "tok-2", "/home")));
        System.out.println(head.process(new ChRequest("root", "tok-9", "/admin/users")));
    }
}

record ChRequest(String user, String token, String path) {
}

record ChResponse(int status, String body) {
}

abstract class ChStage {
    private ChStage next;

    ChStage setNext(ChStage next) {
        this.next = next;
        return next;
    }

    ChResponse process(ChRequest r) {
        ChResponse failure = check(r);
        if (failure != null) {
            return failure; // stop the chain
        }
        return next == null ? new ChResponse(200, "OK " + r.path()) : next.process(r);
    }

    abstract ChResponse check(ChRequest r);
}

class ChRateLimit extends ChStage {
    private final Map<String, Integer> hits = new HashMap<>();

    ChResponse check(ChRequest r) {
        int count = hits.merge(r.user(), 1, Integer::sum);
        return count > 2 ? new ChResponse(429, "too many requests") : null;
    }
}

class ChAuthenticate extends ChStage {
    ChResponse check(ChRequest r) {
        return r.token().startsWith("tok-") ? null : new ChResponse(401, "bad token");
    }
}

class ChAuthorize extends ChStage {
    ChResponse check(ChRequest r) {
        boolean adminPath = r.path().startsWith("/admin");
        boolean isAdmin = r.user().equals("root");
        return adminPath && !isAdmin ? new ChResponse(403, "admins only") : null;
    }
}

// OUTPUT:
// ChResponse[status=200, body=OK /home]
// ChResponse[status=401, body=bad token]
// ChResponse[status=403, body=admins only]
// ChResponse[status=429, body=too many requests]
// ChResponse[status=200, body=OK /admin/users]`),
    blk(`
<h4>Real-time example 2: event bubbling in a UI tree</h4>
<p>A click is offered first to the innermost widget; if it is not consumed it bubbles to its parent, as in Swing, JavaFX and the browser DOM. The chain here is the parent link of each widget.</p>
`, `// Event bubbling: child to parent until someone consumes the click

public class ChBubbleDemo {
    public static void main(String[] args) {
        ChWidget window = new ChWidget("Window", null, false);
        ChWidget panel = new ChWidget("Panel", window, true);
        ChWidget label = new ChWidget("Label", panel, false);
        ChWidget orphan = new ChWidget("Orphan", null, false);

        label.click();
        System.out.println("--");
        orphan.click();
    }
}
class ChWidget {
    private final String name;
    private final ChWidget parent;
    private final boolean consumes;

    ChWidget(String name, ChWidget parent, boolean consumes) {
        this.name = name;
        this.parent = parent;
        this.consumes = consumes;
    }

    void click() {
        System.out.println(name + " received click");
        if (consumes) {
            System.out.println(name + " consumed it");
        } else if (parent != null) {
            parent.click(); // bubble up
        } else {
            System.out.println("click ignored");
        }
    }
}

// OUTPUT:
// Label received click
// Panel received click
// Panel consumed it
// --
// Orphan received click
// click ignored`),
    blk(`
<h4>Sample mini project: loan approval desk</h4>
<p>A bank desk processes loan applications. The chain has a credit check, an amount-based approver ladder and a final audit trail. Several small classes cooperate and the demo prints a decision for each applicant.</p>
`, `// Mini project: loan approval with credit check and approver ladder
import java.util.ArrayList;
import java.util.List;

public class ChLoanDesk {
    public static void main(String[] args) {
        ChLoanHandler chain = new ChCreditCheck();
        chain.setNext(new ChOfficer()).setNext(new ChBranchManager());

        List<ChLoan> loans = new ArrayList<>();
        loans.add(new ChLoan("Kiran", 540, 100000));
        loans.add(new ChLoan("Divya", 710, 150000));
        loans.add(new ChLoan("Mohan", 760, 750000));
        loans.add(new ChLoan("Neha", 800, 2500000));

        for (ChLoan loan : loans) {
            System.out.println(loan.applicant() + ": " + chain.decide(loan).text);
        }
    }
}

record ChLoan(String applicant, int score, double amount) {
}

class ChDecision {
    final String text;
    final boolean finished;

    ChDecision(String text, boolean finished) {
        this.text = text;
        this.finished = finished;
    }
}

abstract class ChLoanHandler {
    private ChLoanHandler next;

    ChLoanHandler setNext(ChLoanHandler next) {
        this.next = next;
        return next;
    }

    ChDecision decide(ChLoan loan) {
        ChDecision d = tryHandle(loan);
        if (d.finished || next == null) {
            return d;
        }
        return next.decide(loan);
    }

    abstract ChDecision tryHandle(ChLoan loan);
}

class ChCreditCheck extends ChLoanHandler {
    ChDecision tryHandle(ChLoan loan) {
        if (loan.score() < 600) {
            return new ChDecision("declined, credit score " + loan.score(), true);
        }
        return new ChDecision("credit ok", false);
    }
}

class ChOfficer extends ChLoanHandler {
    ChDecision tryHandle(ChLoan loan) {
        if (loan.amount() <= 200000) {
            return new ChDecision("approved by Loan Officer", true);
        }
        return new ChDecision("needs higher approval", false);
    }
}

class ChBranchManager extends ChLoanHandler {
    ChDecision tryHandle(ChLoan loan) {
        if (loan.amount() <= 1000000) {
            return new ChDecision("approved by Branch Manager", true);
        }
        return new ChDecision("sent to head office", true);
    }
}

// OUTPUT:
// Kiran: declined, credit score 540
// Divya: approved by Loan Officer
// Mohan: approved by Branch Manager
// Neha: sent to head office`),
    blk(`
<h4>Thread safety, testing and Spring notes</h4>
<ul>
<li><b>Thread safety</b>: build the chain once and treat it as immutable; handlers must keep no per-request state in fields. Per-request data belongs in the request object or method arguments.</li>
<li><b>Testing</b>: unit-test each handler alone with a fake next handler, then test the assembled chain for order and for the "nobody handles it" case.</li>
<li><b>Spring</b>: Spring injects a <code>List&lt;Handler&gt;</code> of all beans of a type, sorted by <code>@Order</code>. Loop over that list instead of hand-linking. Spring Security uses an ordered <code>SecurityFilterChain</code> and MVC uses <code>HandlerInterceptor</code>.</li>
<li><b>Resilience</b>: keep failure handling explicit, for example a final handler that logs unhandled requests.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>God handler</b>: one link with a huge if-else, which defeats the pattern.</li>
<li><b>Handlers that mutate shared global state</b> and depend on running in a specific order.</li>
<li><b>Chains used where a Map lookup would do</b>: if the handler can be chosen by a key, use a Map of strategies.</li>
</ul>
`),
  ],
  interviewQA: [
    ['What is Chain of Responsibility and what does it decouple?', 'A request is passed along a chain of handlers, and each one decides to handle it or forward it. It decouples the sender from the concrete receiver, because the sender only holds a reference to the first handler.'],
    ['Does exactly one handler process a request?', 'Not necessarily. In the classic form the first capable handler stops the chain. In the pipeline form (servlet filters, loggers) many handlers act and each one forwards the request.'],
    ['Where is it used in Java and Spring?', 'Servlet Filter and FilterChain, Spring Security SecurityFilterChain, Spring MVC HandlerInterceptor, java.util.logging parent loggers, and the exception propagation through catch blocks.'],
    ['What happens if no handler can process the request?', 'It is silently dropped unless you handle it. Good designs add a default final handler or throw an exception so the failure is visible.'],
    ['How do you avoid cycles and deep recursion in a chain?', 'Build the chain from an ordered list in one place and iterate with a loop or an index, instead of hand-linking nodes that can be linked twice. A list based chain also avoids stack overflow for very long chains.'],
    ['How does it differ from Decorator?', 'A decorator always delegates to the wrapped object and adds behavior while keeping the same interface. A chain handler may stop the request and does not necessarily wrap anything; the purpose is selecting who handles it.'],
    ['How would you test a chain?', 'Test each handler in isolation with a stub next handler, then test the full chain in order with representative requests, including the unhandled case and short-circuiting.'],
  ],
};

const interpreterExtra: TopicExtra = {
  beginner: [
    blk(`
<h4>In one minute</h4>
<p>The <b>Interpreter pattern</b> gives you a way to evaluate sentences of a small <b>language</b>. You write one class per <b>grammar rule</b>. Terminal rules (a number, a variable) answer directly, and non-terminal rules (add, and, or) combine child expressions. Together the objects form an <b>abstract syntax tree</b> and calling <code>interpret()</code> on the root evaluates the whole sentence.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Sheet music</b>: a musician reads symbols (the grammar) and turns them into sound.</li>
<li><b>Calculator</b>: you type 2 + 3 * 4 and it knows the rules of arithmetic.</li>
<li><b>Road signs and Morse code</b>: a fixed small vocabulary with fixed rules of meaning.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>java.util.regex.Pattern</code> compiles a regular expression into a matcher tree.</li>
<li><code>java.text.Format</code> and <code>MessageFormat</code> interpret format strings.</li>
<li>Spring Expression Language: <code>SpelExpressionParser</code>, <code>Expression.getValue(context)</code>.</li>
<li><code>javax.el.ExpressionFactory</code> (JSP / Jakarta Expression Language) and JPA query strings.</li>
<li>Ant / Gradle build scripts and SQL parsers use the same idea at larger scale.</li>
</ul>
<h4>Structure</h4>
<pre>
interface Expression { int interpret(Context ctx) }

   AddExpression ----- left, right : Expression
   NumberExpression    (terminal)
   VariableExpression  (terminal, looks up Context)

 "a + (b + 2)"  becomes the tree:
          Add
         /   \
   Variable   Add
     a       /   \
        Variable Number
           b        2
</pre>
<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it for a <b>small, stable grammar</b>: rules engines, filters, formulas, simple query languages.</li>
<li>Use it when you must evaluate the same sentence many times, since the tree is built once.</li>
<li>Avoid it for big languages: dozens of classes and slow tree walking. Use a parser generator (ANTLR) or an existing engine like SpEL.</li>
<li>Avoid it when plain Java lambdas or a Map of functions already solve the problem.</li>
</ul>
<h4>Small program: boolean rule expressions</h4>
<p>Here the grammar is tiny: variables, AND, OR. The tree for <code>vip OR (member AND coupon)</code> is built by hand and evaluated with different contexts.</p>
`, `// Interpreter: boolean expressions over named flags
import java.util.Map;

public class InBeginRulesDemo {
    public static void main(String[] args) {
        // vip OR (member AND coupon)
        InBeginExpr rule = new InBeginOr(
                new InBeginFlag("vip"),
                new InBeginAnd(new InBeginFlag("member"), new InBeginFlag("coupon")));

        System.out.println("vip only      : " + rule.interpret(Map.of("vip", true)));
        Map<String, Boolean> both = Map.of("member", true, "coupon", true);
        System.out.println("member+coupon : " + rule.interpret(both));
        System.out.println("member only   : " + rule.interpret(Map.of("member", true)));
    }
}

interface InBeginExpr {
    boolean interpret(Map<String, Boolean> context);
}

class InBeginFlag implements InBeginExpr {
    private final String name;

    InBeginFlag(String name) {
        this.name = name;
    }

    public boolean interpret(Map<String, Boolean> context) {
        return context.getOrDefault(name, false); // terminal rule
    }
}

class InBeginAnd implements InBeginExpr {
    private final InBeginExpr left;
    private final InBeginExpr right;

    InBeginAnd(InBeginExpr left, InBeginExpr right) {
        this.left = left;
        this.right = right;
    }

    public boolean interpret(Map<String, Boolean> context) {
        return left.interpret(context) && right.interpret(context);
    }
}

class InBeginOr implements InBeginExpr {
    private final InBeginExpr left;
    private final InBeginExpr right;

    InBeginOr(InBeginExpr left, InBeginExpr right) {
        this.left = left;
        this.right = right;
    }

    public boolean interpret(Map<String, Boolean> context) {
        return left.interpret(context) || right.interpret(context);
    }
}

// OUTPUT:
// vip only      : true
// member+coupon : true
// member only   : false`),
  ],
  intermediate: [
    blk(`
<h4>Arithmetic tree with variables and printing</h4>
<p><b>WHAT:</b> modern Java records as expression nodes. The same tree is both evaluated and printed.</p>
<p><b>WHY:</b> the tree is data, so you can do many things with it (evaluate, print, optimize) without re-reading the source text. A <code>Map</code> acts as the <b>context</b> that supplies variable values.</p>
`, `// Expression tree: evaluate and print the same tree
import java.util.Map;

public class InTreeDemo {
    public static void main(String[] args) {
        // price * qty + shipping
        InExpr bill = new InAdd(new InMul(new InVar("price"), new InVar("qty")), new InVar("ship"));

        System.out.println("Formula: " + bill.show());
        System.out.println("Order 1: " + bill.eval(Map.of("price", 250, "qty", 4, "ship", 40)));
        System.out.println("Order 2: " + bill.eval(Map.of("price", 99, "qty", 10, "ship", 0)));
        System.out.println("Constant: " + new InAdd(new InNum(2), new InNum(3)).eval(Map.of()));
    }
}

interface InExpr {
    int eval(Map<String, Integer> ctx);

    String show();
}

record InNum(int value) implements InExpr {
    public int eval(Map<String, Integer> ctx) {
        return value;
    }

    public String show() {
        return String.valueOf(value);
    }
}

record InVar(String name) implements InExpr {
    public int eval(Map<String, Integer> ctx) {
        return ctx.get(name);
    }

    public String show() {
        return name;
    }
}

record InAdd(InExpr left, InExpr right) implements InExpr {
    public int eval(Map<String, Integer> ctx) {
        return left.eval(ctx) + right.eval(ctx);
    }

    public String show() {
        return "(" + left.show() + " + " + right.show() + ")";
    }
}

record InMul(InExpr left, InExpr right) implements InExpr {
    public int eval(Map<String, Integer> ctx) {
        return left.eval(ctx) * right.eval(ctx);
    }

    public String show() {
        return "(" + left.show() + " * " + right.show() + ")";
    }
}

// OUTPUT:
// Formula: ((price * qty) + ship)
// Order 1: 1040
// Order 2: 990
// Constant: 5`),
    blk(`
<h4>Parsing text into the tree</h4>
<p><b>WHAT:</b> a small <b>recursive descent parser</b> that turns the text "2 + 3 * (4 - 1)" into nodes and evaluates it. One method per grammar rule: expression, term, factor.</p>
<p><b>WHY:</b> the pattern itself does not parse text; a separate parser builds the tree. Seeing both together shows how precedence (multiplication before addition) comes from the grammar layering.</p>
`, `// Recursive descent parser for + - * / and parentheses

public class InCalcDemo {
    public static void main(String[] args) {
        String[] sums = {"2 + 3 * 4", "(2 + 3) * 4", "100 / 5 - 3 * (2 + 1)", "7"};

        for (String s : sums) {
            System.out.println(s + " = " + new InCalcParser(s).parse().eval());
        }
    }
}
interface InCalcNode {
    int eval();
}

class InCalcParser {
    private final String text;
    private int pos;

    InCalcParser(String text) {
        this.text = text;
    }

    InCalcNode parse() {
        InCalcNode node = expression();
        skip();
        if (pos != text.length()) {
            throw new IllegalArgumentException("Unexpected char at " + pos);
        }
        return node;
    }

    private InCalcNode expression() {
        InCalcNode left = term();
        while (peek() == '+' || peek() == '-') {
            char op = text.charAt(pos++);
            InCalcNode l = left;
            InCalcNode r = term();
            left = op == '+' ? () -> l.eval() + r.eval() : () -> l.eval() - r.eval();
        }
        return left;
    }

    private InCalcNode term() {
        InCalcNode left = factor();
        while (peek() == '*' || peek() == '/') {
            char op = text.charAt(pos++);
            InCalcNode l = left;
            InCalcNode r = factor();
            left = op == '*' ? () -> l.eval() * r.eval() : () -> l.eval() / r.eval();
        }
        return left;
    }

    private InCalcNode factor() {
        skip();
        if (peek() == '(') {
            pos++;
            InCalcNode inner = expression();
            skip();
            pos++; // closing bracket
            return inner;
        }
        int start = pos;
        while (pos < text.length() && Character.isDigit(text.charAt(pos))) {
            pos++;
        }
        int value = Integer.parseInt(text.substring(start, pos));
        return () -> value;
    }

    private char peek() {
        skip();
        return pos < text.length() ? text.charAt(pos) : ' ';
    }

    private void skip() {
        while (pos < text.length() && text.charAt(pos) == ' ') {
            pos++;
        }
    }
}

// OUTPUT:
// 2 + 3 * 4 = 14
// (2 + 3) * 4 = 20
// 100 / 5 - 3 * (2 + 1) = 11
// 7 = 7`),
    blk(`
<h4>A rule engine for business conditions</h4>
<p><b>WHAT:</b> text rules such as "age &gt;= 18 and city == Pune or vip == yes" are turned into condition, AND and OR expression classes and evaluated against a record of fields.</p>
<p><b>WHY:</b> business users change rules often. With the interpreter, the rules live in data (a string or a database row), not in compiled code.</p>
`, `// Rule engine: conditions joined by and / or
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class InRuleEngineDemo {
    static InRule compile(String text) {
        List<InRule> orGroups = new ArrayList<>();
        for (String group : text.split(" or ")) {
            List<InRule> conditions = new ArrayList<>();
            for (String c : group.split(" and ")) {
                String[] t = c.trim().split(" ");
                conditions.add(new InCondition(t[0], t[1], t[2]));
            }
            orGroups.add(new InAllOf(conditions));
        }
        return new InAnyOf(orGroups);
    }

    public static void main(String[] args) {
        InRule rule = compile("age >= 18 and city == Pune or vip == yes");

        System.out.println(rule.test(Map.of("age", "25", "city", "Pune", "vip", "no")));
        System.out.println(rule.test(Map.of("age", "25", "city", "Surat", "vip", "no")));
        System.out.println(rule.test(Map.of("age", "12", "city", "Surat", "vip", "yes")));
    }
}

interface InRule {
    boolean test(Map<String, String> fields);
}

class InCondition implements InRule {
    private final String field;
    private final String op;
    private final String expected;

    InCondition(String field, String op, String expected) {
        this.field = field;
        this.op = op;
        this.expected = expected;
    }

    public boolean test(Map<String, String> fields) {
        String actual = fields.getOrDefault(field, "");
        if (op.equals("==")) {
            return actual.equals(expected);
        }
        int a = Integer.parseInt(actual);
        int b = Integer.parseInt(expected);
        return op.equals(">=") ? a >= b : a < b;
    }
}

class InAnyOf implements InRule {
    private final List<InRule> parts;

    InAnyOf(List<InRule> parts) {
        this.parts = parts;
    }

    public boolean test(Map<String, String> fields) {
        return parts.stream().anyMatch(p -> p.test(fields));
    }
}

class InAllOf implements InRule {
    private final List<InRule> parts;

    InAllOf(List<InRule> parts) {
        this.parts = parts;
    }

    public boolean test(Map<String, String> fields) {
        return parts.stream().allMatch(p -> p.test(fields));
    }
}

// OUTPUT:
// true
// false
// true`),
    blk(`
<h4>Postfix (RPN) interpreter with a stack</h4>
<p><b>WHAT:</b> a language with no brackets: "5 1 2 + 4 * + 3 -". Each token either pushes a number or applies an operator to the top of a stack.</p>
<p><b>WHY:</b> for tiny languages a <b>Map of operators</b> replaces one class per rule, giving the same open-for-extension idea in far fewer lines.</p>
`, `// Postfix interpreter using a stack and an operator table
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.function.IntBinaryOperator;

public class InPostfixDemo {
    private static final Map<String, IntBinaryOperator> OPS = Map.of(
            "+", (a, b) -> a + b,
            "-", (a, b) -> a - b,
            "*", (a, b) -> a * b,
            "/", (a, b) -> a / b);

    static int run(String program) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (String token : program.split(" ")) {
            IntBinaryOperator op = OPS.get(token);
            if (op == null) {
                stack.push(Integer.parseInt(token)); // a number
            } else {
                int right = stack.pop();
                int left = stack.pop();
                stack.push(op.applyAsInt(left, right));
            }
        }
        return stack.pop();
    }

    public static void main(String[] args) {
        System.out.println("3 4 + = " + run("3 4 +"));
        System.out.println("5 1 2 + 4 * + 3 - = " + run("5 1 2 + 4 * + 3 -"));
        System.out.println("100 4 / 5 * = " + run("100 4 / 5 *"));
    }
}

// OUTPUT:
// 3 4 + = 7
// 5 1 2 + 4 * + 3 - = 14
// 100 4 / 5 * = 125`),
    blk(`
<h4>Common mistakes</h4>
<ul>
<li><b>Using the pattern for a large language</b>: the class count explodes and tree walking is slow. Switch to ANTLR or an embedded engine like SpEL.</li>
<li><b>Mixing parsing with evaluation</b>: keep the parser (text to tree) separate from the expressions (tree to value).</li>
<li><b>Ignoring errors</b>: bad input should raise a clear exception with the position, not a <code>NullPointerException</code>.</li>
<li><b>Re-parsing on every call</b>: parse once, cache the tree, evaluate many times.</li>
<li><b>Evaluating untrusted expressions</b> that can call arbitrary methods (a risk with SpEL and scripting engines). Restrict the context.</li>
<li><b>Ambiguous grammar</b>: forgetting precedence rules gives wrong results such as 2 + 3 * 4 equal to 20.</li>
</ul>
<h4>Interpreter compared with similar patterns</h4>
<table>
<tr><th>Pattern</th><th>Purpose</th><th>Relation to Interpreter</th></tr>
<tr><td>Composite</td><td>tree of part-whole objects</td><td>the expression tree is a Composite</td></tr>
<tr><td>Visitor</td><td>add operations to a tree</td><td>use it when you need many operations (print, optimize, evaluate)</td></tr>
<tr><td>Strategy</td><td>swap an algorithm</td><td>no grammar, one chosen algorithm</td></tr>
<tr><td>Command</td><td>request as an object</td><td>a script is often a list of commands run by an interpreter</td></tr>
<tr><td>Flyweight</td><td>share small objects</td><td>terminal symbols can be shared flyweights</td></tr>
</table>
`),
  ],
  expert: [
    blk(`
<h4>Real-time example 1: payroll formula engine with a parse cache</h4>
<p>HR defines salary formulas as text, for example <code>basic + basic * 0.4 - tax</code>. The engine parses each distinct formula once, caches the tree and evaluates it for every employee. The printed parse count proves that the cache works.</p>
`, `// Payroll formulas: parse once, evaluate for many employees
import java.util.HashMap;
import java.util.Map;

public class InPayrollDemo {
    public static void main(String[] args) {
        InPayEngine engine = new InPayEngine();
        String formula = "basic + basic * 0.4 - tax";

        Map<String, Double> asha = Map.of("basic", 50000.0, "tax", 4500.0);
        Map<String, Double> ravi = Map.of("basic", 72000.0, "tax", 9800.0);

        System.out.println("Asha : " + engine.compute(formula, asha));
        System.out.println("Ravi : " + engine.compute(formula, ravi));
        System.out.println("Net  : " + engine.compute("(basic - tax) / 12", asha));
        System.out.println("Formulas parsed: " + engine.getParses());
    }
}

interface InPayNode {
    double eval(Map<String, Double> vars);
}

class InPayParser {
    private final String text;
    private int pos;

    InPayParser(String text) {
        this.text = text;
    }

    InPayNode parse() {
        return expression();
    }

    private InPayNode expression() {
        InPayNode left = term();
        while (peek() == '+' || peek() == '-') {
            char op = text.charAt(pos++);
            InPayNode l = left;
            InPayNode r = term();
            left = op == '+' ? v -> l.eval(v) + r.eval(v) : v -> l.eval(v) - r.eval(v);
        }
        return left;
    }

    private InPayNode term() {
        InPayNode left = factor();
        while (peek() == '*' || peek() == '/') {
            char op = text.charAt(pos++);
            InPayNode l = left;
            InPayNode r = factor();
            left = op == '*' ? v -> l.eval(v) * r.eval(v) : v -> l.eval(v) / r.eval(v);
        }
        return left;
    }

    private InPayNode factor() {
        if (peek() == '(') {
            pos++;
            InPayNode inner = expression();
            peek();
            pos++;
            return inner;
        }
        int start = pos;
        while (pos < text.length() && (Character.isLetterOrDigit(text.charAt(pos))
                || text.charAt(pos) == '.')) {
            pos++;
        }
        String word = text.substring(start, pos);
        if (Character.isLetter(word.charAt(0))) {
            return v -> v.get(word); // variable lookup
        }
        double number = Double.parseDouble(word);
        return v -> number;
    }

    private char peek() {
        while (pos < text.length() && text.charAt(pos) == ' ') {
            pos++;
        }
        return pos < text.length() ? text.charAt(pos) : ' ';
    }
}

class InPayEngine {
    private final Map<String, InPayNode> cache = new HashMap<>();
    private int parses;

    double compute(String formula, Map<String, Double> vars) {
        InPayNode tree = cache.computeIfAbsent(formula, f -> {
            parses++;
            return new InPayParser(f).parse();
        });
        return tree.eval(vars);
    }

    int getParses() {
        return parses;
    }
}

// OUTPUT:
// Asha : 65500.0
// Ravi : 91000.0
// Net  : 3791.6666666666665
// Formulas parsed: 2`),
    blk(`
<h4>Real-time example 2: boolean search query</h4>
<p>A document search page lets users type <code>java AND (spring OR boot) AND NOT legacy</code>. A parser with one method per grammar rule builds predicates over the words of each document. This is the shape of the query parsers inside search tools.</p>
`, `// Search query language: AND, OR, NOT and brackets
import java.util.List;
import java.util.Set;
import java.util.function.Predicate;

public class InSearchDemo {
    public static void main(String[] args) {
        List<String> titles = List.of("java spring tutorial", "java boot guide",
                "java legacy servlets", "python flask intro", "spring boot legacy notes");
        String query = "java AND ( spring OR boot ) AND NOT legacy";
        Predicate<Set<String>> matcher = new InQueryParser(query).parse();

        System.out.println("Query: " + query);
        for (String title : titles) {
            Set<String> words = Set.of(title.split(" "));
            System.out.println((matcher.test(words) ? "MATCH  " : "skip   ") + title);
        }
    }
}

class InQueryParser {
    private final String[] tokens;
    private int pos;

    InQueryParser(String query) {
        String spaced = query.replace("(", " ( ").replace(")", " ) ").trim();
        this.tokens = spaced.split(" +");
    }

    Predicate<Set<String>> parse() {
        return or();
    }

    private Predicate<Set<String>> or() {
        Predicate<Set<String>> left = and();
        while (pos < tokens.length && tokens[pos].equals("OR")) {
            pos++;
            left = left.or(and());
        }
        return left;
    }

    private Predicate<Set<String>> and() {
        Predicate<Set<String>> left = not();
        while (pos < tokens.length && tokens[pos].equals("AND")) {
            pos++;
            left = left.and(not());
        }
        return left;
    }

    private Predicate<Set<String>> not() {
        if (tokens[pos].equals("NOT")) {
            pos++;
            return not().negate();
        }
        return primary();
    }

    private Predicate<Set<String>> primary() {
        String token = tokens[pos++];
        if (token.equals("(")) {
            Predicate<Set<String>> inner = or();
            pos++; // closing bracket
            return inner;
        }
        return words -> words.contains(token.toLowerCase());
    }
}

// OUTPUT:
// Query: java AND ( spring OR boot ) AND NOT legacy
// MATCH  java spring tutorial
// MATCH  java boot guide
// skip   java legacy servlets
// skip   python flask intro
// skip   spring boot legacy notes`),
    blk(`
<h4>Sample mini project: robot command language</h4>
<p>A robot on a grid understands <code>MOVE n</code>, <code>LEFT</code>, <code>RIGHT</code> and <code>REPEAT n [ ... ]</code>. The program text is parsed into command objects (the grammar classes) and then interpreted against a robot context. Nested loops show why the tree structure matters.</p>
`, `// Mini project: a tiny robot language with nested REPEAT
import java.util.ArrayList;
import java.util.List;

public class InRobotDemo {
    public static void main(String[] args) {
        String script = "MOVE 2 RIGHT MOVE 3 REPEAT 2 [ LEFT MOVE 1 RIGHT MOVE 1 ] LEFT";
        List<InCommand> program = new InScriptParser(script).parseBlock();

        InRobot robot = new InRobot();
        System.out.println("Start : " + robot.where());
        program.forEach(c -> c.run(robot));
        System.out.println("Script: " + script);
        System.out.println("End   : " + robot.where());
    }
}

class InRobot {
    int x;
    int y;
    int dir; // 0 north, 1 east, 2 south, 3 west

    String where() {
        String[] names = {"North", "East", "South", "West"};
        return "(" + x + "," + y + ") facing " + names[dir];
    }
}

interface InCommand {
    void run(InRobot robot);
}

class InMove implements InCommand {
    private final int steps;

    InMove(int steps) {
        this.steps = steps;
    }

    public void run(InRobot r) {
        int[] dx = {0, 1, 0, -1};
        int[] dy = {1, 0, -1, 0};
        r.x += dx[r.dir] * steps;
        r.y += dy[r.dir] * steps;
    }
}

class InTurn implements InCommand {
    private final int delta;

    InTurn(int delta) {
        this.delta = delta;
    }

    public void run(InRobot r) {
        r.dir = (r.dir + delta + 4) % 4;
    }
}

class InRepeat implements InCommand {
    private final int times;
    private final List<InCommand> body;

    InRepeat(int times, List<InCommand> body) {
        this.times = times;
        this.body = body;
    }

    public void run(InRobot r) {
        for (int i = 0; i < times; i++) {
            body.forEach(c -> c.run(r));
        }
    }
}

class InScriptParser {
    private final String[] tokens;
    private int pos;

    InScriptParser(String script) {
        this.tokens = script.split(" +");
    }

    List<InCommand> parseBlock() {
        List<InCommand> list = new ArrayList<>();
        while (pos < tokens.length && !tokens[pos].equals("]")) {
            String word = tokens[pos++];
            switch (word) {
                case "MOVE" -> list.add(new InMove(Integer.parseInt(tokens[pos++])));
                case "LEFT" -> list.add(new InTurn(-1));
                case "RIGHT" -> list.add(new InTurn(1));
                case "REPEAT" -> {
                    int times = Integer.parseInt(tokens[pos++]);
                    pos++; // skip [
                    List<InCommand> body = parseBlock();
                    pos++; // skip ]
                    list.add(new InRepeat(times, body));
                }
                default -> throw new IllegalArgumentException("Unknown word " + word);
            }
        }
        return list;
    }
}

// OUTPUT:
// Start : (0,0) facing North
// Script: MOVE 2 RIGHT MOVE 3 REPEAT 2 [ LEFT MOVE 1 RIGHT MOVE 1 ] LEFT
// End   : (5,4) facing North`),
    blk(`
<h4>Thread safety, testing and Spring notes</h4>
<ul>
<li><b>Thread safety</b>: an expression tree built from immutable nodes (records, final fields) can be shared by many threads. Keep all mutable state in the <b>context</b> object, one per evaluation.</li>
<li><b>Testing</b>: test each node alone, then the parser with a table of (text, expected value) pairs, including malformed input and operator precedence.</li>
<li><b>Spring</b>: use SpEL instead of writing your own. <code>new SpelExpressionParser().parseExpression("price * qty").getValue(context, Double.class)</code>. Use <code>SimpleEvaluationContext</code> for untrusted input so that method calls and type references are blocked.</li>
<li><b>Performance</b>: parse once and cache; SpEL can also compile hot expressions to bytecode.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Hand-rolled mini language that keeps growing</b> into loops, functions and variables. At that point use a real parser tool or embed a scripting language.</li>
<li><b>Executing user text with eval-style engines without sandboxing</b>, which opens injection holes.</li>
<li><b>A single giant switch</b> over token strings instead of grammar classes or a table of operators.</li>
</ul>
`),
  ],
  interviewQA: [
    ['What is the Interpreter pattern?', 'It defines a representation for the grammar of a language as a class hierarchy plus an interpreter that evaluates sentences by walking an expression tree. Terminal expressions answer directly and non-terminal expressions combine children.'],
    ['Which design pattern does the expression tree resemble?', 'Composite. Non-terminal expressions hold child expressions exactly like a composite holds children, and a call on the root recurses through the tree.'],
    ['When is Interpreter a bad choice?', 'For complex grammars. Each rule is a class, so the hierarchy grows large and slow to maintain. Use a parser generator such as ANTLR or an existing engine like SpEL instead.'],
    ['Where does Java use it?', 'java.util.regex.Pattern, java.text.MessageFormat, Spring Expression Language, Jakarta Expression Language and JPQL or SQL parsing internals.'],
    ['What is the role of the Context?', 'It carries the global information of one evaluation, for example variable values or an output buffer, so the expression nodes themselves stay immutable and reusable across evaluations.'],
    ['How do you add a new operation such as pretty-print to an expression tree?', 'Either add a method to every node, or apply the Visitor pattern so that new operations (print, optimize, type-check) live in separate visitor classes without touching the nodes.'],
    ['Does the pattern include parsing?', 'No. The pattern defines the tree and its evaluation; a separate parser (often recursive descent) converts text into the tree. Many descriptions blur the two.'],
  ],
};

const iteratorExtra: TopicExtra = {
  beginner: [
    blk(`
<h4>In one minute</h4>
<p>The <b>Iterator pattern</b> gives you a standard way to walk through the elements of a collection one by one without knowing how the collection stores them. The collection hands out an <b>iterator</b> with <code>hasNext()</code> and <code>next()</code>; the caller never touches the array, tree or linked nodes inside.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>TV remote channel button</b>: "next channel" works whether channels come from cable, dish or internet.</li>
<li><b>Tour guide in a fort</b>: visits the gates one after another; you just follow, you do not need the map.</li>
<li><b>Bookmark in a book</b>: remembers the current position without changing the book.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>java.util.Iterator</code>, <code>ListIterator</code> and <code>Iterable</code> (the interface that makes the for-each loop work).</li>
<li>Every <code>Collection</code> (<code>ArrayList</code>, <code>HashSet</code>, <code>TreeMap.entrySet()</code>) returns an iterator.</li>
<li><code>java.util.Scanner</code> and <code>StringTokenizer</code>; <code>Spliterator</code> and <code>Stream</code> are modern relatives.</li>
<li>JDBC <code>ResultSet.next()</code> is a cursor style iterator over database rows.</li>
<li>Spring Data <code>Page</code>, <code>Slice</code> and <code>Streamable</code> iterate query results in pages.</li>
</ul>
<h4>Structure</h4>
<pre>
interface Iterable&lt;T&gt;  { Iterator&lt;T&gt; iterator(); }
interface Iterator&lt;T&gt;  { boolean hasNext(); T next(); }

 FortList (Iterable) ---creates---> FortIterator
   [Raigad, Sinhagad, Torna]          index = 0 -> 1 -> 2 -> end

 for (String f : fortList) { ... }   // compiler calls iterator() for you
</pre>
<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it when you build your own collection or data source (tree, graph, pages from an API) and want for-each to work.</li>
<li>Use it to offer several traversal orders (forward, reverse, filtered) over the same data.</li>
<li>Use it to hide internal representation so you can change it later.</li>
<li>Avoid writing it for a plain array or list: the language already provides it.</li>
<li>Avoid sharing one iterator between threads; iterators hold position state.</li>
</ul>
<h4>Small program: a for-each friendly collection</h4>
<p>Implementing <code>Iterable&lt;T&gt;</code> is all that is needed for the enhanced for loop. The iterator here is an anonymous class over a plain array.</p>
`, `// Iterator: a custom collection usable in for-each
import java.util.Iterator;

public class ItBeginDemo {
    public static void main(String[] args) {
        ItBeginFortList list = new ItBeginFortList();

        for (String fort : list) { // compiler calls list.iterator()
            System.out.println("Visiting " + fort);
        }

        Iterator<String> it = list.iterator();
        it.next(); // skip the first one by hand
        System.out.println("Second fort: " + it.next());
    }
}

class ItBeginFortList implements Iterable<String> {
    private final String[] forts = {"Raigad", "Sinhagad", "Torna", "Pratapgad"};

    public Iterator<String> iterator() {
        return new Iterator<String>() {
            private int index = 0;

            public boolean hasNext() {
                return index < forts.length;
            }

            public String next() {
                return forts[index++];
            }
        };
    }
}

// OUTPUT:
// Visiting Raigad
// Visiting Sinhagad
// Visiting Torna
// Visiting Pratapgad
// Second fort: Sinhagad`),
  ],
  intermediate: [
    blk(`
<h4>Generic collection with forward and reverse iterators</h4>
<p><b>WHAT:</b> a generic bookshelf that is <code>Iterable&lt;T&gt;</code> and also offers a <code>reversed()</code> view, which is simply another <code>Iterable</code>.</p>
<p><b>WHY:</b> the client chooses the traversal order, and the shelf keeps its array private. The same idea is used by <code>List.reversed()</code> in Java 21 and by <code>descendingIterator()</code> in <code>Deque</code>.</p>
`, `// Generic shelf with forward and reverse iteration
import java.util.Iterator;
import java.util.NoSuchElementException;

public class ItShelfDemo {
    public static void main(String[] args) {
        ItShelf<String> shelf = new ItShelf<>(5);
        shelf.add("Java");
        shelf.add("Spring");
        shelf.add("Hibernate");

        System.out.print("Forward : ");
        for (String s : shelf) {
            System.out.print(s + " ");
        }

        System.out.println();
        System.out.print("Reverse : ");
        for (String s : shelf.reversed()) {
            System.out.print(s + " ");
        }
        System.out.println();
    }
}

class ItShelf<T> implements Iterable<T> {
    private final Object[] items;
    private int size;

    ItShelf(int capacity) {
        items = new Object[capacity];
    }

    void add(T item) {
        items[size++] = item;
    }

    public Iterator<T> iterator() {
        return new Iterator<T>() {
            private int index = 0;

            public boolean hasNext() {
                return index < size;
            }

            @SuppressWarnings("unchecked")
            public T next() {
                if (!hasNext()) {
                    throw new NoSuchElementException();
                }
                return (T) items[index++];
            }
        };
    }

    Iterable<T> reversed() {
        return () -> new Iterator<T>() {
            private int index = size - 1;

            public boolean hasNext() {
                return index >= 0;
            }

            @SuppressWarnings("unchecked")
            public T next() {
                return (T) items[index--];
            }
        };
    }
}

// OUTPUT:
// Forward : Java Spring Hibernate 
// Reverse : Hibernate Spring Java `),
    blk(`
<h4>Fail-fast iterators, safe removal and ListIterator</h4>
<p><b>WHAT:</b> three behaviors of the JDK iterators: removing inside a for-each throws <code>ConcurrentModificationException</code>, <code>Iterator.remove()</code> is the safe way, and <code>ListIterator</code> can go both directions and replace elements.</p>
<p><b>WHY:</b> this is the most common iterator bug in real code and a favorite interview question.</p>
`, `// Fail-fast, Iterator.remove and ListIterator
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

public class ItFailFastDemo {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>(List.of("Pune", "Delhi", "Agra", "Nagpur"));

        List<String> copy = new ArrayList<>(cities);

        try {
            for (String c : copy) {
                if (c.startsWith("D")) {
                    copy.remove(c); // modifies the list behind the iterator's back
                }
            }
        } catch (java.util.ConcurrentModificationException ex) {
            System.out.println("Caught: " + ex.getClass().getSimpleName());
        }

        Iterator<String> it = cities.iterator();
        while (it.hasNext()) {
            if (it.next().startsWith("D")) {
                it.remove(); // safe removal through the iterator
            }
        }
        System.out.println("After remove: " + cities);

        ListIterator<String> li = cities.listIterator();
        while (li.hasNext()) {
            li.set(li.next().toUpperCase()); // replace in place
        }
        while (li.hasPrevious()) {
            System.out.print(li.previous() + " "); // walk backwards
        }
        System.out.println();
    }
}

// OUTPUT:
// Caught: ConcurrentModificationException
// After remove: [Pune, Agra, Nagpur]
// NAGPUR AGRA PUNE `),
    blk(`
<h4>Tree traversal iterator</h4>
<p><b>WHAT:</b> an in-order iterator for a binary search tree. It uses an explicit stack of nodes to remember where it is.</p>
<p><b>WHY:</b> a tree has no simple index. The iterator hides the stack and gives clients sorted output with an ordinary for-each loop.</p>
`, `// In-order iterator for a binary search tree
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Iterator;

public class ItTreeDemo {
    public static void main(String[] args) {
        ItTree tree = new ItTree();
        for (int v : new int[] {50, 30, 70, 20, 40, 60, 80, 35}) {
            tree.insert(v);
        }

        StringBuilder sb = new StringBuilder();
        for (int v : tree) {
            sb.append(v).append(' ');
        }
        System.out.println("Sorted: " + sb.toString().trim());
    }
}

class ItTree implements Iterable<Integer> {
    private static class Node {
        int value;
        Node left;
        Node right;

        Node(int value) {
            this.value = value;
        }
    }

    private Node root;

    void insert(int value) {
        root = insert(root, value);
    }

    private Node insert(Node node, int value) {
        if (node == null) {
            return new Node(value);
        }
        if (value < node.value) {
            node.left = insert(node.left, value);
        } else {
            node.right = insert(node.right, value);
        }
        return node;
    }

    public Iterator<Integer> iterator() {
        Deque<Node> stack = new ArrayDeque<>();
        pushLeft(stack, root);
        return new Iterator<Integer>() {
            public boolean hasNext() {
                return !stack.isEmpty();
            }

            public Integer next() {
                Node n = stack.pop();
                pushLeft(stack, n.right); // the right subtree comes next
                return n.value;
            }
        };
    }

    private void pushLeft(Deque<Node> stack, Node node) {
        while (node != null) {
            stack.push(node);
            node = node.left;
        }
    }
}

// OUTPUT:
// Sorted: 20 30 35 40 50 60 70 80`),
    blk(`
<h4>Lazy and filtering iterators</h4>
<p><b>WHAT:</b> an infinite Fibonacci iterator and a wrapper that filters any iterator with a predicate.</p>
<p><b>WHY:</b> an iterator computes the next value only when asked. That makes infinite or very large sequences possible, and wrappers can be stacked, like decorators.</p>
`, `// Lazy infinite iterator plus a filtering wrapper
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.function.Predicate;

public class ItLazyDemo {
    public static void main(String[] args) {
        Iterator<Long> evens = new ItFilter<>(new ItFibonacci(), n -> n % 2 == 0);

        List<Long> firstSix = new ArrayList<>();
        while (firstSix.size() < 6) {
            firstSix.add(evens.next());
        }
        System.out.println("Even Fibonacci numbers: " + firstSix);
    }
}

class ItFibonacci implements Iterator<Long> {
    private long a = 0;
    private long b = 1;

    public boolean hasNext() {
        return true; // never ends
    }

    public Long next() {
        long result = a;
        long sum = a + b;
        a = b;
        b = sum;
        return result;
    }
}

class ItFilter<T> implements Iterator<T> {
    private final Iterator<T> source;
    private final Predicate<T> test;
    private T pending;
    private boolean ready;

    ItFilter(Iterator<T> source, Predicate<T> test) {
        this.source = source;
        this.test = test;
    }

    public boolean hasNext() {
        while (!ready && source.hasNext()) {
            T candidate = source.next();
            if (test.test(candidate)) {
                pending = candidate;
                ready = true;
            }
        }
        return ready;
    }

    public T next() {
        hasNext();
        ready = false;
        return pending;
    }
}

// OUTPUT:
// Even Fibonacci numbers: [0, 2, 8, 34, 144, 610]`),
    blk(`
<h4>Common mistakes</h4>
<ul>
<li><b>Modifying the collection while iterating</b> (except via <code>Iterator.remove()</code>) gives <code>ConcurrentModificationException</code>. Use <code>removeIf</code> or the iterator.</li>
<li><b>Calling next() without hasNext()</b>: throw <code>NoSuchElementException</code> in your own iterator, as the contract says.</li>
<li><b>Returning the same iterator instance from iterator()</b>: each call must return a fresh iterator, otherwise nested loops break.</li>
<li><b>Exposing the internal list</b> through the iterator, so callers can modify it. Offer read-only views.</li>
<li><b>Sharing iterators between threads</b> without synchronization.</li>
<li><b>Forgetting remove()</b> support: the default <code>remove()</code> throws <code>UnsupportedOperationException</code>, which is fine if documented.</li>
</ul>
<h4>Iterator compared with similar approaches</h4>
<table>
<tr><th>Approach</th><th>Control</th><th>Notes</th></tr>
<tr><td>Iterator (external)</td><td>caller pulls with next()</td><td>caller can stop, skip, interleave several</td></tr>
<tr><td>forEach / internal iteration</td><td>collection pushes elements</td><td>shorter, cannot break easily</td></tr>
<tr><td>Stream</td><td>pipeline of lazy operations</td><td>one-shot, good for transformations</td></tr>
<tr><td>Visitor</td><td>operation applied to each element</td><td>separates operation from structure, element types may differ</td></tr>
<tr><td>Composite</td><td>tree structure</td><td>iterators are often used to traverse composites</td></tr>
</table>
`),
  ],
  expert: [
    blk(`
<h4>Real-time example 1: lazily paginated remote data</h4>
<p>A client reads orders from a remote API that returns 3 records per page. The iterator fetches the next page only when the current one is used up, so memory stays small and no request is made for pages the caller never reaches. The fetch messages show the laziness. Spring Data and many SDKs use this design.</p>
`, `// Paginated iterator: fetches the next page only when needed
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

public class ItPagedDemo {
    public static void main(String[] args) {
        ItPagedOrders orders = new ItPagedOrders(new ItRemoteApi(), 3);

        int count = 0;
        for (String id : orders) {
            System.out.println(id);
            if (++count == 4) {
                System.out.println("stop early, pages 2 and 3 are never fetched");
                break;
            }
        }
    }
}

class ItRemoteApi {
    private final List<String> all = List.of("ORD-1", "ORD-2", "ORD-3", "ORD-4",
            "ORD-5", "ORD-6", "ORD-7", "ORD-8");

    List<String> fetchPage(int page, int size) {
        System.out.println("  [api] fetching page " + page);
        int from = Math.min(page * size, all.size());
        int to = Math.min(from + size, all.size());
        return all.subList(from, to);
    }
}

class ItPagedOrders implements Iterable<String> {
    private final ItRemoteApi api;
    private final int pageSize;

    ItPagedOrders(ItRemoteApi api, int pageSize) {
        this.api = api;
        this.pageSize = pageSize;
    }

    public Iterator<String> iterator() {
        return new Iterator<String>() {
            private int page = 0;
            private List<String> current = List.of();
            private int index = 0;

            public boolean hasNext() {
                if (index < current.size()) {
                    return true;
                }
                current = api.fetchPage(page++, pageSize);
                index = 0;
                return !current.isEmpty();
            }

            public String next() {
                if (!hasNext()) {
                    throw new NoSuchElementException();
                }
                return current.get(index++);
            }
        };
    }
}

// OUTPUT:
//   [api] fetching page 0
// ORD-1
// ORD-2
// ORD-3
//   [api] fetching page 1
// ORD-4
// stop early, pages 2 and 3 are never fetched`),
    blk(`
<h4>Real-time example 2: merging sorted log streams</h4>
<p>Two servers write timestamped log lines in order. A merge iterator wraps both source iterators, peeks at their heads and always returns the older line, so you get one sorted stream without loading everything in memory. This is the core of external merge sort and of log aggregation tools.</p>
`, `// Merge iterator over two already sorted sources
import java.util.Iterator;
import java.util.List;

public class ItMergeDemo {
    public static void main(String[] args) {
        List<String> serverA = List.of("10:00 A start", "10:05 A job done", "10:30 A idle");
        List<String> serverB = List.of("10:01 B start", "10:02 B error", "10:40 B stop",
                "10:50 B halt");

        ItMerge merged = new ItMerge(serverA.iterator(), serverB.iterator());
        while (merged.hasNext()) {
            System.out.println(merged.next());
        }
    }
}

class ItMerge implements Iterator<String> {
    private final Iterator<String> first;
    private final Iterator<String> second;
    private String headA;
    private String headB;

    ItMerge(Iterator<String> first, Iterator<String> second) {
        this.first = first;
        this.second = second;
        this.headA = first.hasNext() ? first.next() : null;
        this.headB = second.hasNext() ? second.next() : null;
    }

    public boolean hasNext() {
        return headA != null || headB != null;
    }

    public String next() {
        boolean takeA = headB == null || (headA != null && headA.compareTo(headB) <= 0);
        String result;
        if (takeA) {
            result = headA;
            headA = first.hasNext() ? first.next() : null;
        } else {
            result = headB;
            headB = second.hasNext() ? second.next() : null;
        }
        return result;
    }
}

// OUTPUT:
// 10:00 A start
// 10:01 B start
// 10:02 B error
// 10:05 A job done
// 10:30 A idle
// 10:40 B stop
// 10:50 B halt`),
    blk(`
<h4>Sample mini project: music playlist player</h4>
<p>A playlist offers several iterators over the same songs: forward, reverse, only one genre, and an endless looping one that is limited by the caller. Small classes (song, playlist, iterators) cooperate and the program prints the listening order of each mode.</p>
`, `// Mini project: playlist with forward, reverse, genre and loop modes
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class ItPlayerDemo {
    static void play(String label, Iterator<ItSong> it, int limit) {
        StringBuilder sb = new StringBuilder(label + ": ");
        int played = 0;
        while (it.hasNext() && played < limit) {
            sb.append(it.next().title()).append(" | ");
            played++;
        }
        System.out.println(sb);
    }

    public static void main(String[] args) {
        ItPlaylist list = new ItPlaylist();
        list.add("Jai Ho", "film");
        list.add("Raga Yaman", "classical");
        list.add("Kun Faya Kun", "sufi");
        list.add("Raga Bhairavi", "classical");

        play("Forward  ", list.iterator(), 10);
        play("Reverse  ", list.reverse(), 10);
        play("Classical", list.ofGenre("classical"), 10);
        play("Loop x6  ", list.loop(), 6);
    }
}

record ItSong(String title, String genre) {
}

class ItPlaylist implements Iterable<ItSong> {
    private final List<ItSong> songs = new ArrayList<>();

    void add(String title, String genre) {
        songs.add(new ItSong(title, genre));
    }

    public Iterator<ItSong> iterator() {
        return songs.iterator();
    }

    Iterator<ItSong> reverse() {
        return new Iterator<ItSong>() {
            private int index = songs.size() - 1;

            public boolean hasNext() {
                return index >= 0;
            }

            public ItSong next() {
                return songs.get(index--);
            }
        };
    }

    Iterator<ItSong> ofGenre(String genre) {
        return songs.stream().filter(s -> s.genre().equals(genre)).iterator();
    }

    Iterator<ItSong> loop() {
        return new Iterator<ItSong>() {
            private int index = 0;

            public boolean hasNext() {
                return !songs.isEmpty();
            }

            public ItSong next() {
                return songs.get(index++ % songs.size());
            }
        };
    }
}

// OUTPUT:
// Forward  : Jai Ho | Raga Yaman | Kun Faya Kun | Raga Bhairavi | 
// Reverse  : Raga Bhairavi | Kun Faya Kun | Raga Yaman | Jai Ho | 
// Classical: Raga Yaman | Raga Bhairavi | 
// Loop x6  : Jai Ho | Raga Yaman | Kun Faya Kun | Raga Bhairavi | Jai Ho | Raga Yaman | `),
    blk(`
<h4>Thread safety, testing and Spring notes</h4>
<ul>
<li><b>Thread safety</b>: iterators of <code>ArrayList</code> and <code>HashMap</code> are <b>fail-fast</b> and not thread safe. <code>CopyOnWriteArrayList</code> iterates over a snapshot (weakly consistent, never throws), and <code>ConcurrentHashMap</code> iterators are weakly consistent. One iterator belongs to one thread.</li>
<li><b>Resources</b>: an iterator over a file or a database cursor holds resources. Use try-with-resources (an <code>AutoCloseable</code> iterator or a <code>Stream</code>) so that the cursor is closed even when the loop breaks early.</li>
<li><b>Testing</b>: check empty collection, one element, many elements, <code>NoSuchElementException</code> at the end, and that two iterators over the same collection are independent.</li>
<li><b>Spring Data</b>: repository methods can return a <code>Stream</code> or <code>Slice</code> to read big result sets lazily; always close the stream inside a transaction.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Copying the whole collection</b> into a new list just to return an iterator, which wastes memory.</li>
<li><b>Index loops over a LinkedList</b> (get(i) is O(n)), making loops O(n squared). Use the iterator.</li>
<li><b>Iterators with hidden side effects</b>, such as hasNext() that consumes data twice or triggers network calls each time.</li>
</ul>
`),
  ],
  interviewQA: [
    ['What does the Iterator pattern provide?', 'A uniform way to traverse the elements of an aggregate sequentially without exposing its representation. In Java it is Iterable plus Iterator, which makes the for-each loop work on any collection.'],
    ['What is the difference between Iterator and ListIterator?', 'ListIterator works only on lists. It can move backwards (hasPrevious, previous), report indexes, and modify the list with set and add, while Iterator only moves forward and supports remove.'],
    ['What is fail-fast and how does it work?', 'ArrayList and HashMap iterators compare an expected modCount with the collection modCount on each call and throw ConcurrentModificationException if they differ. It is a best-effort bug detector, not a guarantee against concurrency problems.'],
    ['How do you safely remove elements while iterating?', 'Use Iterator.remove(), or Collection.removeIf(predicate), or iterate over a copy. Calling list.remove inside a for-each triggers ConcurrentModificationException.'],
    ['Internal versus external iteration?', 'External iteration (Iterator) lets the caller control the pace with next(). Internal iteration (forEach, streams) lets the collection drive the loop, giving less code and easy parallelism but less control.'],
    ['How do you make your own class work in a for-each loop?', 'Implement Iterable of T and return a new Iterator from iterator(). The compiler turns for (T x : obj) into calls to iterator(), hasNext() and next().'],
    ['Why do CopyOnWriteArrayList iterators never throw ConcurrentModificationException?', 'They iterate over a snapshot array taken when the iterator was created; writers copy the array, so the snapshot never changes. The cost is memory and copying on every write, and the iterator does not see later updates.'],
  ],
};

const mediatorExtra: TopicExtra = {
  beginner: [
    blk(`
<h4>In one minute</h4>
<p>The <b>Mediator pattern</b> puts an object in the middle so that other objects (the <b>colleagues</b>) do not talk to each other directly. Each colleague only knows the mediator, and the mediator knows the rules about who must react to what. Many-to-many links become many-to-one links, which are far easier to change.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Air traffic control tower</b>: pilots never talk to each other, they talk to the tower, which decides who lands first.</li>
<li><b>Wedding planner</b>: caterer, decorator and band coordinate through one person.</li>
<li><b>Group chat server</b>: members send to the server, the server delivers to the others.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>java.util.Timer</code> and <code>ScheduledExecutorService</code> coordinate tasks and threads.</li>
<li><code>java.util.concurrent.ExecutorService</code> sits between the code submitting tasks and the worker threads.</li>
<li>Spring MVC <code>DispatcherServlet</code> mediates between request, controllers, view resolvers and handlers.</li>
<li>Spring <code>ApplicationContext</code> and <code>ApplicationEventPublisher</code> let beans interact without direct references.</li>
<li><code>javax.swing</code> dialogs often use a controller class that links buttons, lists and text fields.</li>
</ul>
<h4>Structure</h4>
<pre>
Without mediator:            With mediator:

 A &lt;--&gt; B                         A ---+
 |  \\/  |                               |
 |  /\\  |                         B ---[Mediator]--- C
 C &lt;--&gt; D                               |
 (6 links)                       D ---+   (4 links)

interface Mediator { void notify(Colleague sender, String event) }
</pre>
<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it when many objects talk to many others and the web of references is hard to follow.</li>
<li>Use it to reuse components: a colleague with no references to its siblings can be reused elsewhere.</li>
<li>Use it for UI form logic, chat rooms, workflow coordination and traffic control.</li>
<li>Avoid it for two objects only; a direct call is simpler.</li>
<li>Avoid a mediator that grows into a <b>god object</b> holding all the business logic of the system.</li>
</ul>
<h4>Small program: a tiny group chat</h4>
<p>Users never hold references to other users. The chat room forwards each message to everyone except the sender.</p>
`, `// Mediator: a chat room between users
import java.util.ArrayList;
import java.util.List;

public class MeBeginChatDemo {
    public static void main(String[] args) {
        MeBeginRoom room = new MeBeginRoom();
        MeBeginUser asha = new MeBeginUser("Asha", room);
        MeBeginUser ravi = new MeBeginUser("Ravi", room);
        new MeBeginUser("Meena", room);

        asha.say("Meeting at 5");
        ravi.say("Ok, I will join");
    }
}

class MeBeginRoom {
    private final List<MeBeginUser> users = new ArrayList<>();

    void join(MeBeginUser user) {
        users.add(user);
    }

    void send(MeBeginUser from, String text) {
        for (MeBeginUser u : users) {
            if (u != from) {
                u.receive(from.getName(), text); // the room decides who gets it
            }
        }
    }
}

class MeBeginUser {
    private final String name;
    private final MeBeginRoom room;

    MeBeginUser(String name, MeBeginRoom room) {
        this.name = name;
        this.room = room;
        room.join(this);
    }

    String getName() {
        return name;
    }

    void say(String text) {
        room.send(this, text);
    }

    void receive(String from, String text) {
        System.out.println(name + " got from " + from + ": " + text);
    }
}

// OUTPUT:
// Ravi got from Asha: Meeting at 5
// Meena got from Asha: Meeting at 5
// Asha got from Ravi: Ok, I will join
// Meena got from Ravi: Ok, I will join`),
  ],
  intermediate: [
    blk(`
<h4>Air traffic control tower</h4>
<p><b>WHAT:</b> planes ask the tower for the runway. The tower keeps the only state (who is using the runway) and queues the others.</p>
<p><b>WHY:</b> the safety rule "one plane at a time" lives in one place. Planes stay simple and know nothing about other planes.</p>
`, `// Air traffic control: the tower owns the runway rule
import java.util.ArrayDeque;
import java.util.Queue;

public class MeTowerDemo {
    public static void main(String[] args) {
        MeTower tower = new MeTower();
        MePlane ai101 = new MePlane("AI-101", tower);
        MePlane sg202 = new MePlane("SG-202", tower);
        MePlane ig303 = new MePlane("6E-303", tower);

        ai101.approach();
        sg202.approach();
        ig303.approach();
        ai101.touchDown();
        sg202.touchDown();
        ig303.touchDown();
    }
}

class MeTower {
    private String onRunway;
    private final Queue<String> waiting = new ArrayDeque<>();

    void requestLanding(String flight) {
        if (onRunway == null) {
            onRunway = flight;
            System.out.println("Tower: " + flight + " cleared to land");
        } else {
            waiting.add(flight);
            System.out.println("Tower: " + flight + " hold, runway busy with " + onRunway);
        }
    }

    void landed(String flight) {
        System.out.println("Tower: " + flight + " has landed");
        onRunway = waiting.poll();
        if (onRunway != null) {
            System.out.println("Tower: " + onRunway + " cleared to land");
        }
    }
}

class MePlane {
    private final String flight;
    private final MeTower tower;

    MePlane(String flight, MeTower tower) {
        this.flight = flight;
        this.tower = tower;
    }

    void approach() {
        tower.requestLanding(flight);
    }

    void touchDown() {
        tower.landed(flight);
    }
}

// OUTPUT:
// Tower: AI-101 cleared to land
// Tower: SG-202 hold, runway busy with AI-101
// Tower: 6E-303 hold, runway busy with AI-101
// Tower: AI-101 has landed
// Tower: SG-202 cleared to land
// Tower: SG-202 has landed
// Tower: 6E-303 cleared to land
// Tower: 6E-303 has landed`),
    blk(`
<h4>UI form with dependent controls</h4>
<p><b>WHAT:</b> a registration form with a checkbox, two text fields and a submit button. The button is enabled only when both fields are filled and the terms are accepted.</p>
<p><b>WHY:</b> without a mediator every control would reference the others (the button asks the text fields, the checkbox asks the button...). With it, each control only reports "I changed" and the form mediator applies all enabling rules.</p>
`, `// Form mediator: the button state depends on other controls
import java.util.HashMap;
import java.util.Map;

public class MeFormDemo {
    public static void main(String[] args) {
        MeForm form = new MeForm();
        MeControl name = new MeControl("name", form);
        MeControl email = new MeControl("email", form);
        MeControl terms = new MeControl("terms", form);

        name.set("Kavita");
        email.set("kavita@example.com");
        terms.set("yes");
        email.set("");
        email.set("kavita@mail.in");
    }
}

class MeForm {
    private final Map<String, String> values = new HashMap<>();
    private boolean termsAccepted;
    private boolean submitEnabled;

    void changed(String control, String value) {
        if (control.equals("terms")) {
            termsAccepted = value.equals("yes");
        } else {
            values.put(control, value);
        }
        boolean enabled = termsAccepted
                && !values.getOrDefault("name", "").isBlank()
                && values.getOrDefault("email", "").contains("@");
        if (enabled != submitEnabled) {
            submitEnabled = enabled;
            System.out.println("  Submit button is now " + (enabled ? "ENABLED" : "disabled"));
        }
    }
}

class MeControl {
    private final String name;
    private final MeForm form;

    MeControl(String name, MeForm form) {
        this.name = name;
        this.form = form;
    }

    void set(String value) {
        System.out.println(name + " set to '" + value + "'");
        form.changed(name, value);
    }
}

// OUTPUT:
// name set to 'Kavita'
// email set to 'kavita@example.com'
// terms set to 'yes'
//   Submit button is now ENABLED
// email set to ''
//   Submit button is now disabled
// email set to 'kavita@mail.in'
//   Submit button is now ENABLED`),
    blk(`
<h4>Auction house with bidders</h4>
<p><b>WHAT:</b> bidders place bids with the auctioneer. It rejects low bids, remembers the highest one and tells the previous leader that they were outbid.</p>
<p><b>WHY:</b> bidders never know each other. Rules (minimum raise, who gets informed) can change in the auctioneer without touching bidder classes.</p>
`, `// Auctioneer mediates between bidders
import java.util.ArrayList;
import java.util.List;

public class MeAuctionDemo {
    public static void main(String[] args) {
        MeAuction auction = new MeAuction();
        MeBidder asha = new MeBidder("Asha", auction);
        MeBidder ravi = new MeBidder("Ravi", auction);

        asha.bid(1000);
        ravi.bid(1050);
        ravi.bid(1200);
        asha.bid(1300);
        auction.close();
    }
}

class MeAuction {
    private final List<MeBidder> bidders = new ArrayList<>();
    private MeBidder leader;
    private int highest;

    void register(MeBidder b) {
        bidders.add(b);
    }

    void bid(MeBidder from, int amount) {
        if (amount < highest + 100) {
            from.inform("bid " + amount + " rejected, minimum raise is 100");
            return;
        }
        if (leader != null && leader != from) {
            leader.inform("you were outbid by " + from.getName() + " at " + amount);
        }
        leader = from;
        highest = amount;
        System.out.println("Auctioneer: new highest " + amount + " by " + from.getName());
    }

    void close() {
        System.out.println("SOLD to " + leader.getName() + " for Rs " + highest);
    }
}

class MeBidder {
    private final String name;
    private final MeAuction auction;

    MeBidder(String name, MeAuction auction) {
        this.name = name;
        this.auction = auction;
        auction.register(this);
    }

    String getName() {
        return name;
    }

    void bid(int amount) {
        auction.bid(this, amount);
    }

    void inform(String message) {
        System.out.println("  " + name + " notified: " + message);
    }
}

// OUTPUT:
// Auctioneer: new highest 1000 by Asha
//   Ravi notified: bid 1050 rejected, minimum raise is 100
//   Asha notified: you were outbid by Ravi at 1200
// Auctioneer: new highest 1200 by Ravi
//   Ravi notified: you were outbid by Asha at 1300
// Auctioneer: new highest 1300 by Asha
// SOLD to Asha for Rs 1300`),
    blk(`
<h4>Multi-room chat with membership</h4>
<p><b>WHAT:</b> one chat server (the mediator) holds several named rooms. Users join and leave rooms and messages reach only the members of that room.</p>
<p><b>WHY:</b> it shows that a mediator can manage groups and routing rules, which is what separates it from a simple observer list.</p>
`, `// A chat server mediating several rooms
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class MeRoomsDemo {
    public static void main(String[] args) {
        MeChatServer server = new MeChatServer();

        server.join("java", "Asha");
        server.join("java", "Ravi");
        server.join("cricket", "Ravi");
        server.join("cricket", "Meena");

        server.post("java", "Asha", "Records are great");
        server.post("cricket", "Meena", "Who won?");
        server.leave("java", "Ravi");
        server.post("java", "Asha", "Anyone here?");
        server.post("java", "Meena", "Hello");
    }
}

class MeChatServer {
    private final Map<String, Set<String>> rooms = new HashMap<>();

    void join(String room, String user) {
        rooms.computeIfAbsent(room, r -> new HashSet<>()).add(user);
        System.out.println(user + " joined #" + room);
    }

    void leave(String room, String user) {
        rooms.getOrDefault(room, new HashSet<>()).remove(user);
        System.out.println(user + " left #" + room);
    }

    void post(String room, String user, String text) {
        Set<String> members = rooms.getOrDefault(room, Set.of());
        if (!members.contains(user)) {
            System.out.println("Server: " + user + " is not in #" + room);
            return;
        }
        members.stream().filter(m -> !m.equals(user)).sorted()
                .forEach(m -> System.out.println("  to " + m + " [#" + room + "] "
                        + user + ": " + text));
    }
}

// OUTPUT:
// Asha joined #java
// Ravi joined #java
// Ravi joined #cricket
// Meena joined #cricket
//   to Ravi [#java] Asha: Records are great
//   to Ravi [#cricket] Meena: Who won?
// Ravi left #java
// Server: Meena is not in #java`),
    blk(`
<h4>Common mistakes</h4>
<ul>
<li><b>God mediator</b>: the mediator accumulates all business logic and becomes huge. Split it by area (one per dialog, per room, per workflow).</li>
<li><b>Colleagues that still talk to each other</b>, which defeats the purpose and keeps the coupling.</li>
<li><b>Mediator holding strong references forever</b>: colleagues that leave must be unregistered, like observers.</li>
<li><b>Circular notification</b>: colleague A triggers mediator, which triggers A again. Guard with state checks.</li>
<li><b>Using a mediator where an event is enough</b>: if no coordination rule exists, a simple Observer is lighter.</li>
</ul>
<h4>Mediator compared with similar patterns</h4>
<table>
<tr><th>Pattern</th><th>Communication</th><th>Key difference</th></tr>
<tr><td>Mediator</td><td>many colleagues, one hub</td><td>hub holds coordination rules, colleagues know the hub</td></tr>
<tr><td>Observer</td><td>one subject to many observers</td><td>one-way broadcast, no rules about what others do</td></tr>
<tr><td>Facade</td><td>simplified entry to a subsystem</td><td>subsystem classes do not know the facade, flow is one-way</td></tr>
<tr><td>Command</td><td>request as an object</td><td>often sent through a mediator or bus</td></tr>
<tr><td>Chain of Responsibility</td><td>request passes along handlers</td><td>sequential handlers, not a central hub</td></tr>
</table>
`),
  ],
  expert: [
    blk(`
<h4>Real-time example 1: order orchestration with rollback</h4>
<p>An order needs three steps: reserve stock, charge payment, book shipping. The services never call each other. An orchestrator (a mediator) calls them in order and, when a step fails, asks the earlier services to undo their work. This is the idea behind the saga pattern in microservices.</p>
`, `// Order orchestrator mediating inventory, payment and shipping
import java.util.ArrayList;
import java.util.List;

public class MeOrderDemo {
    public static void main(String[] args) {
        MeOrchestrator rich = new MeOrchestrator(
                List.of(new MeStock(), new MePayment(9000), new MeShipping()));
        MeOrchestrator poor = new MeOrchestrator(
                List.of(new MeStock(), new MePayment(1000), new MeShipping()));

        System.out.println("Result: " + rich.place("A-1"));
        System.out.println("Result: " + poor.place("A-2"));
    }
}

interface MeStep {
    String name();

    boolean execute(String order);

    void undo(String order);
}

class MeStock implements MeStep {
    public String name() {
        return "inventory";
    }

    public boolean execute(String order) {
        System.out.println("  inventory: reserved items for " + order);
        return true;
    }

    public void undo(String order) {
        System.out.println("  inventory: released items for " + order);
    }
}

class MePayment implements MeStep {
    private final double balance;

    MePayment(double balance) {
        this.balance = balance;
    }

    public String name() {
        return "payment";
    }

    public boolean execute(String order) {
        boolean ok = balance >= 5000;
        System.out.println("  payment: " + (ok ? "charged Rs 5000" : "declined, low balance"));
        return ok;
    }

    public void undo(String order) {
        System.out.println("  payment: refunded for " + order);
    }
}

class MeShipping implements MeStep {
    public String name() {
        return "shipping";
    }

    public boolean execute(String order) {
        System.out.println("  shipping: booked courier for " + order);
        return true;
    }

    public void undo(String order) {
        System.out.println("  shipping: cancelled for " + order);
    }
}

class MeOrchestrator {
    private final List<MeStep> steps;

    MeOrchestrator(List<MeStep> steps) {
        this.steps = steps;
    }

    boolean place(String order) {
        System.out.println("Order " + order);
        List<MeStep> done = new ArrayList<>();
        for (MeStep step : steps) {
            if (!step.execute(order)) {
                System.out.println("  failed at " + step.name() + ", rolling back");
                for (int i = done.size() - 1; i >= 0; i--) {
                    done.get(i).undo(order);
                }
                return false;
            }
            done.add(step);
        }
        return true;
    }
}

// OUTPUT:
// Order A-1
//   inventory: reserved items for A-1
//   payment: charged Rs 5000
//   shipping: booked courier for A-1
// Result: true
// Order A-2
//   inventory: reserved items for A-2
//   payment: declined, low balance
//   failed at payment, rolling back
//   inventory: released items for A-2
// Result: false`),
    blk(`
<h4>Real-time example 2: moderated chat with policies</h4>
<p>The chat hub enforces rules that no user class knows about: muted users cannot post, banned words are masked, and every message is stored in a history for audit. Because all traffic goes through one place, new policies are added in one class.</p>
`, `// Chat hub enforcing mute, word filter and history
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class MeModeratedDemo {
    public static void main(String[] args) {
        MeModeratedHub hub = new MeModeratedHub();
        MeMember asha = new MeMember("Asha", hub);
        MeMember ravi = new MeMember("Ravi", hub);
        hub.register(asha);
        hub.register(ravi);

        asha.say("this is not spam");
        hub.mute("Ravi");
        ravi.say("hello everyone");
        asha.say("welcome back");

        System.out.println("History: " + hub.getHistory());
    }
}

class MeModeratedHub {
    private final Set<String> muted = new HashSet<>();
    private final Set<String> banned = Set.of("spam", "scam");
    private final List<String> history = new ArrayList<>();
    private final List<MeMember> members = new ArrayList<>();

    void register(MeMember m) {
        members.add(m);
    }

    void mute(String name) {
        muted.add(name);
    }

    void publish(MeMember from, String text) {
        if (muted.contains(from.name())) {
            from.deliver("hub", "you are muted");
            return;
        }
        String clean = text;
        for (String word : banned) {
            clean = clean.replace(word, "****");
        }
        history.add(from.name() + ": " + clean);
        for (MeMember m : members) {
            if (m != from) {
                m.deliver(from.name(), clean);
            }
        }
    }

    List<String> getHistory() {
        return history;
    }
}

record MeMember(String name, MeModeratedHub hub) {
    void say(String text) {
        hub.publish(this, text);
    }

    void deliver(String from, String text) {
        System.out.println(name + " <- " + from + ": " + text);
    }
}

// OUTPUT:
// Ravi <- Asha: this is not ****
// Ravi <- hub: you are muted
// Ravi <- Asha: welcome back
// History: [Asha: this is not ****, Asha: welcome back]`),
    blk(`
<h4>Sample mini project: smart home hub</h4>
<p>Four devices (motion sensor, lights, alarm, thermostat) never refer to each other. The hub translates events into actions: motion at night turns lights on, opening the door while armed rings the alarm, and a "goodnight" scene switches several devices at once.</p>
`, `// Mini project: smart home hub coordinating devices
import java.util.HashMap;
import java.util.Map;

public class MeSmartHomeDemo {
    public static void main(String[] args) {
        MeHomeHub hub = new MeHomeHub();
        for (String n : new String[] {"sensor", "lights", "alarm", "thermostat", "door"}) {
            hub.add(new MeDevice(n));
        }

        hub.event("sensor", "motion"); // daytime, nothing happens
        hub.setNight(true);
        hub.event("sensor", "motion");
        hub.event("remote", "goodnight");
        hub.event("door", "opened");
    }
}

class MeHomeHub {
    private final Map<String, MeDevice> devices = new HashMap<>();
    private boolean night;

    void add(MeDevice d) {
        devices.put(d.name(), d);
    }

    void setNight(boolean night) {
        this.night = night;
    }

    void event(String source, String what) {
        System.out.println("[event] " + source + " -> " + what);
        if (source.equals("sensor") && what.equals("motion") && night) {
            devices.get("lights").command("on");
        } else if (source.equals("door") && what.equals("opened")) {
            if (devices.get("alarm").isOn()) {
                devices.get("alarm").command("ring");
                devices.get("lights").command("on");
            }
        } else if (source.equals("remote") && what.equals("goodnight")) {
            devices.get("lights").command("off");
            devices.get("alarm").command("arm");
            devices.get("thermostat").command("24 C");
        }
    }
}

class MeDevice {
    private final String name;
    private boolean on;

    MeDevice(String name) {
        this.name = name;
    }

    String name() {
        return name;
    }

    boolean isOn() {
        return on;
    }

    void command(String cmd) {
        if (cmd.equals("on") || cmd.equals("arm")) {
            on = true;
        } else if (cmd.equals("off")) {
            on = false;
        }
        System.out.println("   " + name + " executes '" + cmd + "'");
    }
}

// OUTPUT:
// [event] sensor -> motion
// [event] sensor -> motion
//    lights executes 'on'
// [event] remote -> goodnight
//    lights executes 'off'
//    alarm executes 'arm'
//    thermostat executes '24 C'
// [event] door -> opened
//    alarm executes 'ring'
//    lights executes 'on'`),
    blk(`
<h4>Thread safety, testing and Spring notes</h4>
<ul>
<li><b>Thread safety</b>: if colleagues run on different threads, the mediator is shared state. Use <code>CopyOnWriteArrayList</code> or concurrent maps for registrations, and keep each reaction short. Never call colleague code while holding the mediator lock.</li>
<li><b>Asynchronous mediators</b>: a message queue or an <code>ExecutorService</code> in the middle turns the mediator into a message broker, with ordering and retry questions.</li>
<li><b>Testing</b>: test colleagues with a fake mediator that records notifications, and test the mediator with fake colleagues that record commands. Because colleagues have one dependency each, mocking is easy.</li>
<li><b>Spring</b>: the <code>DispatcherServlet</code> is a mediator; for your own code use a service or orchestrator bean, or <code>ApplicationEventPublisher</code> for loose coupling. Libraries such as Spring Integration and Camel provide full mediation routes.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>God mediator</b> with thousands of lines of if-else, replace it with smaller mediators or rule tables.</li>
<li><b>Hidden mediator through a global singleton</b>, which makes tests and reuse hard.</li>
<li><b>Mediator that exposes colleagues' internals</b>, so rules leak back into colleague classes.</li>
</ul>
`),
  ],
  interviewQA: [
    ['What problem does the Mediator solve?', 'It reduces the many-to-many dependencies between objects. Instead of every object referencing the others, each one references only the mediator, which contains the interaction logic. This makes the colleagues easier to reuse and change.'],
    ['How is Mediator different from Observer?', 'Observer is a one-way broadcast from a subject to observers and defines no rules about what they do. A mediator coordinates two-way interaction between peers and encapsulates the rules about who reacts to what. The two are often combined: the mediator can use observers internally.'],
    ['What is the main risk of the pattern?', 'The mediator can turn into a god object that knows too much and is hard to maintain. Keep each mediator focused on one interaction area and move reusable logic back into colleagues.'],
    ['Give examples from the JDK or Spring.', 'ExecutorService and Timer mediate between task submitters and threads; Spring DispatcherServlet mediates requests, handlers and views; ApplicationContext events decouple beans.'],
    ['How is Mediator different from Facade?', 'A facade gives a simpler one-way entry to a subsystem, and the subsystem classes do not know it exists. A mediator is known by its colleagues and they communicate through it in both directions.'],
    ['How would you unit test a colleague?', 'Pass a fake mediator that records notify calls and assert the right events were sent. Since the colleague has only the mediator dependency, no other collaborators have to be built.'],
    ['Where does a message broker or saga orchestrator fit?', 'An orchestrator is a mediator at service level: it calls services in order and triggers compensation when one fails, so the services themselves do not depend on each other.'],
  ],
};

const strategyExtra: TopicExtra = {
  beginner: [
    blk(`
<h4>In one minute</h4>
<p>The <b>Strategy pattern</b> puts each way of doing a job (an <b>algorithm</b>) into its own class behind a common interface. The object that needs the job (the <b>context</b>) holds a reference to the interface, so you can swap the algorithm at run time and add new ones without touching the context. It replaces long if-else or switch blocks that choose behavior.</p>
<h4>More real-life analogies</h4>
<ul>
<li><b>Travel to the airport</b>: walk, auto, metro or cab. The goal is the same, the way differs, and you pick based on time and money.</li>
<li><b>Payment at a shop</b>: cash, UPI, card. The cashier (context) accepts any of them through the same step.</li>
<li><b>Navigation app</b>: fastest, shortest, avoid tolls. Same map, different route algorithm.</li>
</ul>
<h4>Where you see it in Java and Spring</h4>
<ul>
<li><code>java.util.Comparator</code> passed to <code>Collections.sort</code>, <code>List.sort</code> or <code>TreeMap</code>.</li>
<li><code>java.util.concurrent.RejectedExecutionHandler</code> in <code>ThreadPoolExecutor</code>.</li>
<li><code>java.util.function</code> interfaces (<code>Function</code>, <code>Predicate</code>) used as passed-in behavior.</li>
<li><code>javax.crypto.Cipher.getInstance("AES")</code> and <code>MessageDigest.getInstance("SHA-256")</code> pick an algorithm by name.</li>
<li>Spring: <code>PasswordEncoder</code> implementations (BCrypt, Argon2), <code>ResourceLoader</code>, and injecting a <code>Map&lt;String, Service&gt;</code> of beans by name.</li>
</ul>
<h4>Structure</h4>
<pre>
Context                         Strategy (interface)
+--------------------+  has-a   +---------------------+
| strategy           |--------->| execute(data)       |
| setStrategy(s)     |          +---------------------+
| doWork()           |                   ^
+--------------------+          +--------+---------+
                                |        |         |
                           StrategyA StrategyB StrategyC
</pre>
<h4>When to use / when NOT to use</h4>
<ul>
<li>Use it when you have several ways to do the same thing and the choice depends on data, configuration or the user.</li>
<li>Use it to remove a growing if-else or switch that picks an algorithm.</li>
<li>Use it to isolate an algorithm so it can be tested alone.</li>
<li>Avoid it when there are only two stable variants that never change; a boolean is enough.</li>
<li>Avoid it if the client cannot understand the differences, since the client must pick the strategy.</li>
</ul>
<h4>Small program: choosing a travel mode</h4>
<p>One interface <code>estimate(km)</code>, three implementations, and a planner that can switch at run time.</p>
`, `// Strategy: travel time estimates

public class StBeginTravelDemo {
    public static void main(String[] args) {
        StBeginPlanner planner = new StBeginPlanner(new StBeginWalk());
        planner.report("Home to market", 1.5);

        planner.setMode(new StBeginAuto()); // swap the algorithm at run time
        planner.report("Home to station", 6);

        planner.setMode(new StBeginMetro());
        planner.report("Home to airport", 20);
    }
}
interface StBeginTravel {
    double minutes(double km);
}

class StBeginWalk implements StBeginTravel {
    public double minutes(double km) {
        return km * 12; // 5 km per hour
    }
}

class StBeginAuto implements StBeginTravel {
    public double minutes(double km) {
        return 5 + km * 3; // wait time plus 20 km per hour
    }
}

class StBeginMetro implements StBeginTravel {
    public double minutes(double km) {
        return 10 + km * 1.5;
    }
}

class StBeginPlanner {
    private StBeginTravel mode;

    StBeginPlanner(StBeginTravel mode) {
        this.mode = mode;
    }

    void setMode(StBeginTravel mode) {
        this.mode = mode;
    }

    void report(String trip, double km) {
        System.out.println(trip + " (" + km + " km): " + mode.minutes(km) + " min");
    }
}

// OUTPUT:
// Home to market (1.5 km): 18.0 min
// Home to station (6.0 km): 23.0 min
// Home to airport (20.0 km): 40.0 min`),
  ],
  intermediate: [
    blk(`
<h4>Comparator as the JDK strategy</h4>
<p><b>WHAT:</b> the same list of employees is sorted three ways by passing different <code>Comparator</code> objects, including chained and reversed ones.</p>
<p><b>WHY:</b> <code>List.sort</code> is the context and the comparator is the strategy. This is the strategy pattern you use every day without naming it.</p>
`, `// Sorting employees with different Comparator strategies
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class StComparatorDemo {
    static void show(String title, List<StEmployee> list) {
        System.out.println(title);
        for (StEmployee e : list) {
            System.out.println("  " + e.name() + " | " + e.city() + " | " + e.salary());
        }
    }

    public static void main(String[] args) {
        List<StEmployee> staff = new ArrayList<>(List.of(
                new StEmployee("Ravi", "Pune", 52000),
                new StEmployee("Asha", "Delhi", 61000),
                new StEmployee("Meena", "Pune", 48000),
                new StEmployee("Kiran", "Delhi", 61000)));

        staff.sort(Comparator.comparing(StEmployee::name));
        show("By name", staff);

        staff.sort(Comparator.comparingInt(StEmployee::salary).reversed()
                .thenComparing(StEmployee::name));
        show("By salary desc, then name", staff);

        staff.sort(Comparator.comparing(StEmployee::city).thenComparingInt(StEmployee::salary));
        show("By city, then salary", staff);
    }
}

record StEmployee(String name, String city, int salary) {
}

// OUTPUT:
// By name
//   Asha | Delhi | 61000
//   Kiran | Delhi | 61000
//   Meena | Pune | 48000
//   Ravi | Pune | 52000
// By salary desc, then name
//   Asha | Delhi | 61000
//   Kiran | Delhi | 61000
//   Ravi | Pune | 52000
//   Meena | Pune | 48000
// By city, then salary
//   Asha | Delhi | 61000
//   Kiran | Delhi | 61000
//   Meena | Pune | 48000
//   Ravi | Pune | 52000`),
    blk(`
<h4>Lambdas as strategies in a Map</h4>
<p><b>WHAT:</b> because a strategy is usually one method, a lambda replaces a whole class. Discount rules live in a <code>Map</code> from name to <code>UnaryOperator</code>.</p>
<p><b>WHY:</b> less boilerplate and the choice is data driven. Adding a rule is one line, with no change to the checkout class.</p>
`, `// Discount strategies as lambdas
import java.util.Map;
import java.util.function.UnaryOperator;

public class StLambdaDiscountDemo {
    public static void main(String[] args) {
        StCheckout checkout = new StCheckout();
        String[] codes = {"NONE", "FESTIVE10", "FLAT200", "STUDENT", "UNKNOWN"};

        for (String code : codes) {
            System.out.println(code + " on 1500 -> " + checkout.pay(1500, code));
        }
        System.out.println("STUDENT on 800 -> " + checkout.pay(800, "STUDENT"));
    }
}

class StCheckout {
    private final Map<String, UnaryOperator<Double>> rules = Map.of(
            "NONE", total -> total,
            "FESTIVE10", total -> total * 0.90,
            "FLAT200", total -> Math.max(0, total - 200),
            "STUDENT", total -> total > 1000 ? total * 0.85 : total);

    double pay(double total, String code) {
        UnaryOperator<Double> rule = rules.getOrDefault(code, rules.get("NONE"));
        return rule.apply(total);
    }
}

// OUTPUT:
// NONE on 1500 -> 1500.0
// FESTIVE10 on 1500 -> 1350.0
// FLAT200 on 1500 -> 1300.0
// STUDENT on 1500 -> 1275.0
// UNKNOWN on 1500 -> 1500.0
// STUDENT on 800 -> 800.0`),
    blk(`
<h4>Enum strategies</h4>
<p><b>WHAT:</b> each enum constant carries its own algorithm as a lambda passed to the constructor.</p>
<p><b>WHY:</b> the set of strategies is closed and known, you get a type-safe list with <code>values()</code> and no separate classes. Good for tax slabs, operators and shipping modes.</p>
`, `// Enum constants carrying their own algorithm
import java.util.function.DoubleUnaryOperator;

public class StEnumDemo {
    public static void main(String[] args) {
        double weight = 2.5;

        for (StShipping s : StShipping.values()) {
            System.out.println(s.label() + " for " + weight + " kg: Rs " + s.costFor(weight));
        }

        StShipping chosen = StShipping.valueOf("EXPRESS"); // from user input or config
        System.out.println("Chosen: " + chosen + " costs " + chosen.costFor(10));
    }
}

enum StShipping {
    STANDARD("Standard", w -> 40 + w * 10),
    EXPRESS("Express", w -> 90 + w * 25),
    PICKUP("Store pickup", w -> 0);

    private final String label;
    private final DoubleUnaryOperator cost;

    StShipping(String label, DoubleUnaryOperator cost) {
        this.label = label;
        this.cost = cost;
    }

    double costFor(double kg) {
        return cost.applyAsDouble(kg);
    }

    String label() {
        return label;
    }
}

// OUTPUT:
// Standard for 2.5 kg: Rs 65.0
// Express for 2.5 kg: Rs 152.5
// Store pickup for 2.5 kg: Rs 0.0
// Chosen: EXPRESS costs 340.0`),
    blk(`
<h4>Swapping a sorting algorithm</h4>
<p><b>WHAT:</b> a sorter context that receives either bubble sort or selection sort and reports how many comparisons each needed on the same data.</p>
<p><b>WHY:</b> this is strategy in its classic form, an interchangeable algorithm. You could choose by input size (small arrays use simple sorts, large ones use faster ones) and measure objectively.</p>
`, `// Two sorting algorithms behind one interface
import java.util.Arrays;

public class StSortDemo {
    static void run(String name, StSortAlgo algo, int[] original) {
        int[] copy = Arrays.copyOf(original, original.length);
        int comparisons = algo.sort(copy);
        System.out.println(name + ": " + Arrays.toString(copy));
        System.out.println("           comparisons: " + comparisons);
    }

    public static void main(String[] args) {
        int[] marks = {64, 25, 90, 12, 47, 33};

        run("Bubble   ", new StBubble(), marks);
        run("Selection", new StSelection(), marks);
    }
}

interface StSortAlgo {
    int sort(int[] data); // returns the number of comparisons
}

class StBubble implements StSortAlgo {
    public int sort(int[] data) {
        int comparisons = 0;
        for (int i = 0; i < data.length - 1; i++) {
            for (int j = 0; j < data.length - 1 - i; j++) {
                comparisons++;
                if (data[j] > data[j + 1]) {
                    int t = data[j];
                    data[j] = data[j + 1];
                    data[j + 1] = t;
                }
            }
        }
        return comparisons;
    }
}

class StSelection implements StSortAlgo {
    public int sort(int[] data) {
        int comparisons = 0;
        for (int i = 0; i < data.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < data.length; j++) {
                comparisons++;
                if (data[j] < data[min]) {
                    min = j;
                }
            }
            int t = data[i];
            data[i] = data[min];
            data[min] = t;
        }
        return comparisons;
    }
}

// OUTPUT:
// Bubble   : [12, 25, 33, 47, 64, 90]
//            comparisons: 15
// Selection: [12, 25, 33, 47, 64, 90]
//            comparisons: 15`),
    blk(`
<h4>Common mistakes</h4>
<ul>
<li><b>Strategies that need data from the context</b> but get it through ten parameters. Pass one small parameter object or the data itself.</li>
<li><b>Keeping per-call state inside a shared strategy</b> object, which breaks when it is used by several threads. Make strategies stateless or create one per use.</li>
<li><b>Moving the if-else into the client</b> instead of removing it. Use a Map, an enum or dependency injection to select the strategy.</li>
<li><b>No default strategy</b>: a null strategy causes <code>NullPointerException</code>. Provide a null object (do nothing) or a sensible default.</li>
<li><b>Too many tiny classes</b> for a one-line behavior. A lambda is enough.</li>
</ul>
<h4>Strategy compared with similar patterns</h4>
<table>
<tr><th>Pattern</th><th>Varies</th><th>Key difference</th></tr>
<tr><td>Strategy</td><td>an algorithm, chosen by the client</td><td>object has one strategy at a time, no state transitions</td></tr>
<tr><td>State</td><td>behavior depending on internal state</td><td>states switch themselves, the client does not choose</td></tr>
<tr><td>Template Method</td><td>steps of an algorithm in subclasses</td><td>uses inheritance, fixed at compile time</td></tr>
<tr><td>Command</td><td>an action and its parameters</td><td>encapsulates a request (can queue and undo), not an algorithm choice</td></tr>
<tr><td>Decorator</td><td>adds behavior around an object</td><td>stacks wrappers, strategy replaces the behavior</td></tr>
</table>
`),
  ],
  expert: [
    blk(`
<h4>Real-time example 1: pricing engine composing strategies</h4>
<p>A shop calculates the final price with several independent strategies: a customer tier discount, a seasonal offer and tax. Each is a <code>UnaryOperator</code> chosen by data, and they are composed in order. Money uses <code>BigDecimal</code> to avoid floating point errors.</p>
`, `// Pricing pipeline: tier discount, season offer, GST
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.function.UnaryOperator;

public class StPricingDemo {
    public static void main(String[] args) {
        String[] tiers = {"GOLD", "SILVER", "NEW"};

        for (String t : tiers) {
            List<UnaryOperator<BigDecimal>> steps = new ArrayList<>();
            steps.add(StPricing.tier(t));
            steps.add(StPricing.season(true));
            steps.add(StPricing.gst(18));
            System.out.println(t + " pays Rs " + StPricing.finalPrice("2499.00", steps));
        }
    }
}

class StPricing {
    static UnaryOperator<BigDecimal> percentOff(int percent) {
        BigDecimal factor = BigDecimal.valueOf(100 - percent).movePointLeft(2);
        return price -> price.multiply(factor);
    }

    static UnaryOperator<BigDecimal> tier(String tier) {
        return switch (tier) {
            case "GOLD" -> percentOff(15);
            case "SILVER" -> percentOff(8);
            default -> percentOff(0);
        };
    }

    static UnaryOperator<BigDecimal> season(boolean festive) {
        return festive ? percentOff(10) : percentOff(0);
    }

    static UnaryOperator<BigDecimal> gst(int percent) {
        BigDecimal factor = BigDecimal.valueOf(100 + percent).movePointLeft(2);
        return price -> price.multiply(factor);
    }

    static BigDecimal finalPrice(String base, List<UnaryOperator<BigDecimal>> steps) {
        BigDecimal price = new BigDecimal(base);
        for (UnaryOperator<BigDecimal> step : steps) {
            price = step.apply(price);
        }
        return price.setScale(2, RoundingMode.HALF_UP);
    }
}

// OUTPUT:
// GOLD pays Rs 2255.85
// SILVER pays Rs 2441.62
// NEW pays Rs 2653.94`),
    blk(`
<h4>Real-time example 2: retry with pluggable back-off</h4>
<p>A client calls an unreliable service. How long to wait before retry number n is a strategy: none, fixed, or exponential. To keep the program fast and predictable, the code records the delay it <i>would</i> sleep instead of sleeping. Real code would pass the delay to a scheduler.</p>
`, `// Retry policy with interchangeable back-off strategies
import java.util.ArrayList;
import java.util.List;
import java.util.function.IntSupplier;
import java.util.function.IntUnaryOperator;

public class StRetryDemo {
    static IntSupplier failTimes(int failures) {
        int[] calls = {0};
        return () -> ++calls[0] <= failures ? 503 : 200;
    }

    public static void main(String[] args) {
        IntUnaryOperator none = attempt -> 0;
        IntUnaryOperator fixed = attempt -> 500;
        IntUnaryOperator exponential = attempt -> 100 * (1 << (attempt - 1));

        Object[][] cases = {{"none", none}, {"fixed", fixed}, {"exponential", exponential}};
        for (Object[] c : cases) {
            List<Integer> delays = new ArrayList<>();
            StRetryClient client = new StRetryClient((IntUnaryOperator) c[1], 5);
            String result = client.call(failTimes(3), delays);
            System.out.println(c[0] + ": " + result + ", delays " + delays);
        }
        List<Integer> delays = new ArrayList<>();
        System.out.println(new StRetryClient(exponential, 3).call(failTimes(9), delays)
                + ", delays " + delays);
    }
}

class StRetryClient {
    private final IntUnaryOperator backoffMillis;
    private final int maxAttempts;

    StRetryClient(IntUnaryOperator backoffMillis, int maxAttempts) {
        this.backoffMillis = backoffMillis;
        this.maxAttempts = maxAttempts;
    }

    String call(IntSupplier statusOfAttempt, List<Integer> delays) {
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            if (statusOfAttempt.getAsInt() == 200) {
                return "success on attempt " + attempt;
            }
            if (attempt < maxAttempts) {
                delays.add(backoffMillis.applyAsInt(attempt)); // would sleep here
            }
        }
        return "gave up after " + maxAttempts + " attempts";
    }
}

// OUTPUT:
// none: success on attempt 4, delays [0, 0, 0]
// fixed: success on attempt 4, delays [500, 500, 500]
// exponential: success on attempt 4, delays [100, 200, 400]
// gave up after 3 attempts, delays [100, 200]`),
    blk(`
<h4>Sample mini project: ride fare calculator</h4>
<p>A ride app calculates a fare with a vehicle strategy (bike, auto, cab) and a separate surge strategy (normal, rain, peak). The booking class combines the two without knowing any concrete class. It prints a small readable bill for several trips in Indian cities.</p>
`, `// Mini project: ride fare = vehicle strategy x surge strategy
import java.util.List;

public class StRideApp {
    public static void main(String[] args) {
        List<StTrip> trips = List.of(
                new StTrip("Pune", "Hinjewadi", 18),
                new StTrip("Jaipur", "Amer", 11),
                new StTrip("Mumbai", "Bandra", 7));
        StFare[] vehicles = {new StBike(), new StAutoRide(), new StCab()};
        StSurgeLevel[] levels = StSurgeLevel.values();

        for (int i = 0; i < trips.size(); i++) {
            StBooking booking = new StBooking(vehicles[i], levels[i]);
            System.out.println(booking.bill(trips.get(i)));
        }
        System.out.println(new StBooking(new StCab(), StSurgeLevel.PEAK).bill(trips.get(0)));
    }
}

interface StFare {
    double base(double km);

    String name();
}

class StBike implements StFare {
    public double base(double km) {
        return 20 + km * 6;
    }

    public String name() {
        return "Bike";
    }
}

class StAutoRide implements StFare {
    public double base(double km) {
        return 30 + km * 11;
    }

    public String name() {
        return "Auto";
    }
}

class StCab implements StFare {
    public double base(double km) {
        return 60 + km * 16;
    }

    public String name() {
        return "Cab";
    }
}

interface StSurge {
    double multiplier();

    String label();
}

enum StSurgeLevel implements StSurge {
    NORMAL(1.0), RAIN(1.4), PEAK(1.8);

    private final double factor;

    StSurgeLevel(double factor) {
        this.factor = factor;
    }

    public double multiplier() {
        return factor;
    }

    public String label() {
        return name().toLowerCase();
    }
}

record StTrip(String from, String to, double km) {
}

class StBooking {
    private final StFare fare;
    private final StSurge surge;

    StBooking(StFare fare, StSurge surge) {
        this.fare = fare;
        this.surge = surge;
    }

    String bill(StTrip trip) {
        double amount = fare.base(trip.km()) * surge.multiplier();
        return String.format("%-4s %-6s %s-%s %.0f km -> Rs %.2f",
                fare.name(), surge.label(), trip.from(), trip.to(), trip.km(), amount);
    }
}

// OUTPUT:
// Bike normal Pune-Hinjewadi 18 km -> Rs 128.00
// Auto rain   Jaipur-Amer 11 km -> Rs 211.40
// Cab  peak   Mumbai-Bandra 7 km -> Rs 309.60
// Cab  peak   Pune-Hinjewadi 18 km -> Rs 626.40`),
    blk(`
<h4>Thread safety, testing and Spring notes</h4>
<ul>
<li><b>Thread safety</b>: make strategies stateless or immutable so one instance can be shared across threads (<code>Comparator</code> and <code>PasswordEncoder</code> are). If the context lets callers switch the strategy at run time, declare the field <code>volatile</code> or use an <code>AtomicReference</code>.</li>
<li><b>Testing</b>: test each strategy alone with plain unit tests (inputs to expected result), and test the context with a simple fake or lambda strategy. Contract tests can run the same cases against every implementation.</li>
<li><b>Spring</b>: register each strategy as a bean and inject <code>Map&lt;String, PaymentStrategy&gt;</code>; the map key is the bean name, so <code>strategies.get(type)</code> replaces the switch. Use <code>@Qualifier</code> or <code>@ConditionalOnProperty</code> to select one by configuration, and <code>List&lt;Strategy&gt;</code> with a <code>supports(request)</code> method for rule-based selection.</li>
<li><b>Configuration</b>: store the strategy name in config or a database row so behavior can change without a deployment.</li>
</ul>
<h4>Anti-patterns</h4>
<ul>
<li><b>Switch inside the strategy factory that grows forever</b>: register strategies in a Map or let Spring discover them.</li>
<li><b>Strategy that knows the context's internals</b> (passing the entire context object), so it cannot be reused.</li>
<li><b>Single-implementation interface created for hypothetical future needs</b>, which adds indirection without value.</li>
</ul>
`),
  ],
  interviewQA: [
    ['What is the Strategy pattern?', 'It defines a family of algorithms behind one interface, encapsulates each one, and makes them interchangeable. The context delegates to the current strategy, so behavior can change at run time without changing the context.'],
    ['Strategy versus State: what is the difference?', 'Both delegate to an interchangeable object. With Strategy the client picks the algorithm and it usually stays until changed. With State the object changes its behavior as its internal state changes, and the states themselves trigger transitions.'],
    ['How does Strategy support the Open/Closed Principle?', 'A new algorithm is added as a new class or lambda; the context and the other strategies stay untouched. That replaces editing a long if-else every time a variant appears.'],
    ['Name strategy examples in the JDK and Spring.', 'Comparator with Collections.sort, RejectedExecutionHandler in ThreadPoolExecutor, MessageDigest.getInstance by algorithm name, and in Spring the PasswordEncoder implementations and injected Map of beans by name.'],
    ['How do lambdas change the pattern in Java 8 and later?', 'When the strategy has one method, a lambda or method reference replaces a class (Comparator, Function, Predicate). You still use the pattern, with much less boilerplate. Keep classes for strategies with state, several methods or their own dependencies.'],
    ['How do you choose a strategy without if-else?', 'Use a Map from key to strategy, an enum whose constants hold the behavior, or Spring injection of a Map or List of strategies with a supports method.'],
    ['What are the downsides of Strategy?', 'More objects and classes, the client must know the differences to choose well, and a single interface may force strategies to accept parameters they do not need. Do not use it for two stable variants.'],
  ],
};

export const designPatternExtras3: Record<string, TopicExtra> = {
  'observer-pattern': observerExtra,
  'chain-of-responsibility-pattern': chainExtra,
  'interpreter-pattern': interpreterExtra,
  'iterator-pattern': iteratorExtra,
  'mediator-pattern': mediatorExtra,
  'strategy-pattern': strategyExtra,
};
