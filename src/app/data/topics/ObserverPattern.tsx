import { Topic } from '../coreJava';

export const observerPattern: Topic = {
    id: 'observer-pattern',
    name: 'Observer Pattern',
    beginner: [
        {
            content: `
Observer Pattern defines a <b>one-to-many dependency</b> between objects so that when one object changes state, all its dependents are notified automatically.</p>

<h4>Real-Life Example:</h4>
<ul>
<li>YouTube channel and its subscribers</li>
<li>Newspaper publisher and its readers</li>
<li>Stock price and investors watching it</li>
</ul>
<p>
When a YouTuber uploads a new video, every subscriber gets notified instantly.
The YouTuber (Subject) doesn't need to know who exactly is watching -
it just broadcasts the update to everyone who has subscribed.
</p>

<h4>Why do we need Observer Pattern?</h4>
<ul>
<li>To keep multiple objects in sync with one source of truth</li>
<li>To avoid tight coupling between the subject and the objects reacting to it</li>
<li>To support dynamic add/remove of listeners at runtime</li>
</ul>

<h4>Basic Structure:</h4>
<ul>
<li><code>Subject</code> - maintains a list of observers, provides subscribe/unsubscribe/notify methods</li>
<li><code>Observer</code> - defines the update() method that gets called on change</li>
<li>Concrete Subject - holds actual state and triggers notifyObservers()</li>
<li>Concrete Observer - reacts to the notification</li>
</ul>
`,
            codeExamples: [
                `package com.javaschoollab.demo;

import java.util.ArrayList;
import java.util.List;

// Step 1: Observer interface
interface Subscriber {
    void update(String videoTitle);
}

// Step 2: Subject interface
interface Subject {
    void subscribe(Subscriber s);
    void unsubscribe(Subscriber s);
    void notifySubscribers();
}

// Step 3: Concrete Subject
class NewsPublisher implements Subject {

    private List<Subscriber> subscribers = new ArrayList<>();
    private String latestVideo;

    public void subscribe(Subscriber s) {
        subscribers.add(s);
    }

    public void unsubscribe(Subscriber s) {
        subscribers.remove(s);
    }

    public void notifySubscribers() {
        for (Subscriber s : subscribers) {
            s.update(latestVideo);
        }
    }

    public void uploadVideo(String title) {
        this.latestVideo = title;
        System.out.println("New video uploaded: " + title);
        notifySubscribers();
    }
}

// Step 4: Concrete Observer
class Viewer implements Subscriber {

    private String name;

    public Viewer(String name) {
        this.name = name;
    }

    public void update(String videoTitle) {
        System.out.println(name + " received notification: " + videoTitle);
    }
}

// Step 5: Client Code
public class Test {
    public static void main(String[] args) {
        NewsPublisher channel = new NewsPublisher();

        Viewer raoji = new Viewer("Raoji");
        Viewer prataprao = new Viewer("Prataprao");

        channel.subscribe(raoji);
        channel.subscribe(prataprao);

        channel.uploadVideo("Observer Pattern Explained");
    }
}`
            ]
        }
    ],

    expert: [
        {
            content: `
<h3><code>java.util.Observer</code> and <code>java.util.Observable</code> (Deprecated)</h3>
<p>
Java had built-in support for the Observer pattern via <code>java.util.Observer</code> and
<code>java.util.Observable</code> since JDK 1.0. Both were <b>deprecated since Java 9</b> because:
</p>
<ul>
<li><code>Observable</code> is a class, not an interface - forces inheritance instead of composition</li>
<li>Not thread-safe by design</li>
<li>No support for typed events or ordering guarantees</li>
<li>Not serializable and does not fit modern event-driven models</li>
</ul>
<p>
Modern Java code should implement custom Subject/Observer interfaces (as shown in beginner section),
use <code>PropertyChangeListener</code>, or rely on framework-level event systems like Spring's
ApplicationEvent, or reactive streams.
</p>
`,
            codeExamples: [
                `// Legacy - java.util.Observer / Observable (deprecated since Java 9)
import java.util.Observable;
import java.util.Observer;

class WeatherStation extends Observable {
    public void setTemperature(int temp) {
        setChanged();
        notifyObservers(temp);
    }
}

class TemperatureDisplay implements Observer {
    public void update(Observable o, Object arg) {
        System.out.println("Temperature updated: " + arg);
    }
}`
            ]
        },
        {
            content: `
<h3>Spring's Event Model: ApplicationEvent / ApplicationListener</h3>
<p>
Spring Framework implements the Observer pattern internally through its
<code>ApplicationEventPublisher</code>, <code>ApplicationEvent</code>, and
<code>ApplicationListener</code> abstractions. Beans can publish events and other beans
can listen for them without any direct coupling.
</p>
<ul>
<li><code>ApplicationEventPublisher.publishEvent()</code> - acts as the Subject</li>
<li><code>@EventListener</code> or implementing <code>ApplicationListener&lt;T&gt;</code> - acts as the Observer</li>
<li>Supports synchronous and asynchronous (<code>@Async</code>) notification</li>
<li>Used heavily for decoupled modules - e.g. sending a welcome email after user registration</li>
</ul>
`,
            codeExamples: [
                `// Custom event
public class UserRegisteredEvent extends ApplicationEvent {
    private final String email;

    public UserRegisteredEvent(Object source, String email) {
        super(source);
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}

// Publisher (Subject)
@Service
public class UserService {

    @Autowired
    private ApplicationEventPublisher publisher;

    public void register(String email) {
        // ... save user
        publisher.publishEvent(new UserRegisteredEvent(this, email));
    }
}

// Listener (Observer)
@Component
public class WelcomeEmailListener {

    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        System.out.println("Sending welcome email to " + event.getEmail());
    }
}`
            ]
        },
        {
            content: `
<h3>Observer Pattern and Reactive Streams</h3>
<p>
Reactive programming (RxJava, Project Reactor, <code>java.util.concurrent.Flow</code> introduced in
Java 9) is essentially the Observer pattern taken to its logical extreme, with added support for
backpressure, error handling, and completion signals.
</p>
<ul>
<li><code>Publisher</code> ≈ Subject</li>
<li><code>Subscriber</code> ≈ Observer, but with <code>onNext()</code>, <code>onError()</code>, <code>onComplete()</code></li>
<li><code>Subscription</code> - allows the Observer to request items and control backpressure (missing in classic Observer)</li>
</ul>
<p>
This is why understanding Observer deeply makes reactive systems (Reactor's <code>Flux</code>/<code>Mono</code>,
RxJava's <code>Observable</code>) much easier to reason about.
</p>

<h4>Common Mistakes</h4>
<ul>
<li>Forgetting to unsubscribe → memory leaks (classic issue in UI frameworks and long-lived subjects)</li>
<li>Notifying observers inside a lock, causing deadlocks if observer logic re-enters the subject</li>
<li>Observers throwing exceptions and breaking notification to the remaining observers</li>
<li>Using Observer where a simple direct method call would suffice (over-engineering)</li>
</ul>

<h4>Observer vs Pub-Sub</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Aspect</th>
<th>Observer</th>
<th>Publish-Subscribe</th>
</tr>
<tr>
<td>Coupling</td>
<td>Subject knows its observer list directly</td>
<td>Decoupled via message broker/event bus</td>
</tr>
<tr>
<td>Communication</td>
<td>In-process, synchronous typically</td>
<td>Often cross-process, asynchronous</td>
</tr>
<tr>
<td>Example</td>
<td>Swing ActionListener, Spring events</td>
<td>Kafka, RabbitMQ</td>
</tr>
</table>

<h4>When NOT to use Observer?</h4>
<ul>
<li>When there is only one listener and a direct call is simpler</li>
<li>When notification order and consistency guarantees are critical (Observer gives no ordering guarantee by default)</li>
<li>When you need backpressure or async delivery - prefer reactive streams instead</li>
</ul>
`
        }
    ]
};
