import { Topic } from '../coreJava';

export const facadePattern: Topic = {
    id: 'facade-pattern',
    name: 'Facade Pattern',
    beginner: [
        {
            content: `
<h4>Real-Life Example:</h4>
<p>
Think of starting a <b>car</b> with the ignition key (or push-button start).
Behind the scenes, dozens of subsystems activate — fuel injection, battery
check, starter motor, spark plugs, computer diagnostics — but you don't deal
with any of that directly. You just turn the key, and a simple interface
("start the engine") hides all the complexity underneath.
</p>
<ul>
<li>Car ignition key hiding engine complexity</li>
<li>A restaurant waiter taking your order instead of you talking to the kitchen directly</li>
<li>A single "Book Trip" button hiding flight + hotel + cab booking</li>
</ul>
`
        },
        {
            content: `
<h4>Why do we need Facade Pattern?</h4>
<p>
Large systems have many interacting subsystems/classes, each with its own
interface. Asking client code to talk to all of them directly creates tight
coupling and makes the system hard to use and hard to change. The Facade
Pattern provides a <b>single, simplified interface</b> to a set of interfaces
in a subsystem, without hiding the subsystem entirely — advanced clients can
still access subsystem classes directly if needed.
</p>
<ul>
<li>Reduces complexity for the client</li>
<li>Decouples client code from subsystem internals</li>
<li>Provides a single entry point to a group of related operations</li>
</ul>
`
        },
        {
            content: `
<h4>Basic Structure:</h4>
<ul>
<li><b>Subsystem classes</b> — the complex parts (DVD Player, Projector, Lights)</li>
<li><b>Facade</b> — a single class exposing simple methods that internally coordinate the subsystem classes</li>
<li><b>Client</b> — only talks to the Facade</li>
</ul>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
Client --> HomeTheaterFacade --> DvdPlayer
                              --> Projector
                              --> Lights
</pre>
`
        },
        {
            content: `
<h4>Example: Home Theater Facade</h4>
`,
            codeExamples: [
                `// Subsystem classes
class DvdPlayer {
    public void on() { System.out.println("DVD Player ON"); }
    public void play(String movie) { System.out.println("Playing movie: " + movie); }
    public void off() { System.out.println("DVD Player OFF"); }
}

class Projector {
    public void on() { System.out.println("Projector ON"); }
    public void wideScreenMode() { System.out.println("Projector in widescreen mode"); }
    public void off() { System.out.println("Projector OFF"); }
}

class Lights {
    public void dim(int level) { System.out.println("Lights dimmed to " + level + "%"); }
    public void on() { System.out.println("Lights ON"); }
}

// Facade
class HomeTheaterFacade {
    private final DvdPlayer dvdPlayer;
    private final Projector projector;
    private final Lights lights;

    public HomeTheaterFacade(DvdPlayer dvdPlayer, Projector projector, Lights lights) {
        this.dvdPlayer = dvdPlayer;
        this.projector = projector;
        this.lights = lights;
    }

    // Simple, high-level method hiding subsystem complexity
    public void watchMovie(String movie) {
        System.out.println("Get ready to watch a movie...");
        lights.dim(10);
        projector.on();
        projector.wideScreenMode();
        dvdPlayer.on();
        dvdPlayer.play(movie);
    }

    public void endMovie() {
        System.out.println("Shutting down home theater...");
        dvdPlayer.off();
        projector.off();
        lights.on();
    }
}

// Client
public class Test {
    public static void main(String[] args) {
        HomeTheaterFacade homeTheater =
            new HomeTheaterFacade(new DvdPlayer(), new Projector(), new Lights());

        homeTheater.watchMovie("Inception");
        homeTheater.endMovie();
    }
}`
            ]
        }
    ],
    expert: [
        {
            content: `
<h3>Facade in Layered Architecture</h3>
<p>
In real enterprise applications, the <b>Service layer</b> is essentially a
Facade over multiple DAOs/repositories, validators, and external clients.
The Controller only talks to the Service, and never touches DAOs directly —
this keeps the Controller simple and centralizes business orchestration.
</p>
`,
            codeExamples: [
                `// Subsystem: DAOs
class UserDao {
    User findById(long id) { /* DB call */ return new User(); }
}
class OrderDao {
    void save(Order order) { /* DB call */ }
}
class EmailClient {
    void sendConfirmation(String email) { /* SMTP call */ }
}

// Facade: Service layer
class OrderService {
    private final UserDao userDao = new UserDao();
    private final OrderDao orderDao = new OrderDao();
    private final EmailClient emailClient = new EmailClient();

    // Single simplified operation hiding subsystem coordination
    public void placeOrder(long userId, Order order) {
        User user = userDao.findById(userId);
        orderDao.save(order);
        emailClient.sendConfirmation(user.getEmail());
    }
}

class User { String getEmail() { return "user@example.com"; } }
class Order { }`
            ]
        },
        {
            content: `
<h3>Real Industry Examples</h3>
<ul>
<li><code>javax.faces.context.FacesContext</code> in JSF — a single object
that facades access to the request, response, session, and rendering
subsystems.</li>
<li>Spring's <code>JdbcTemplate</code> — facades raw JDBC's
Connection/Statement/ResultSet handling and exception translation behind a
few simple methods.</li>
<li><code>RestTemplate</code> / <code>WebClient</code> — facade over the
lower-level HTTP client machinery.</li>
<li>Slf4j <code>Logger</code> — a facade over multiple logging
implementations (Log4j, Logback, java.util.logging).</li>
</ul>
`
        },
        {
            content: `
<h3>Facade vs Adapter vs Mediator</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Pattern</th>
<th>Purpose</th>
</tr>
<tr>
<td>Facade</td>
<td>Simplify access to a complex subsystem (subsystem is unaware of the Facade)</td>
</tr>
<tr>
<td>Adapter</td>
<td>Convert one interface into another interface a client expects</td>
</tr>
<tr>
<td>Mediator</td>
<td>Centralize communication between objects that are aware of the mediator</td>
</tr>
</table>
`
        },
        {
            content: `
<h4>Common Mistakes</h4>
<ul>
<li>Turning the Facade into a "God Object" that contains business logic
instead of pure coordination — violates Single Responsibility.</li>
<li>Forcing all access through the Facade even when advanced clients
legitimately need subsystem-level control — Facade should not remove direct
access, only make the common path simpler.</li>
<li>Adding too many unrelated operations into one Facade — split into
multiple focused Facades instead.</li>
</ul>

<h4>When NOT to use Facade</h4>
<ul>
<li>When the subsystem is already simple — an extra layer just adds
indirection with no benefit.</li>
<li>When clients genuinely need fine-grained control over subsystem
behavior that a simplified interface would hide.</li>
</ul>
`
        }
    ]
};
