// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const enterprisePatternsPart1: Course[] = [
  {
    id: 'enterprise-patterns-1',
    name: 'Enterprise Design Patterns',
    icon: 'Building2',
    subTopics: [
      {
        id: 'enterprise-patterns',
        name: 'Enterprise Design Patterns',
        topics: [

          // ----- MVC Pattern -----
          {
            id: 'mvc-pattern',
            name: 'MVC (Model-View-Controller) Pattern',
            beginner: [
              {
                content: `<h3>What is the MVC Pattern?</h3>
<strong>MVC (Model-View-Controller)</strong> splits an application into three interconnected parts so that each concern - data, presentation, and control flow - can change independently without breaking the others.<br>
<br>
• <strong>Model</strong> - holds the application's data and business logic (e.g. a <code>User</code> or <code>Order</code> class).<br>
• <strong>View</strong> - renders the data to the user (an HTML page, JSON response, or console output).<br>
• <strong>Controller</strong> - receives input, talks to the Model, and picks which View to render.<br>
<br>
<h4>Why Split Things Up?</h4>
Without MVC, a single class ends up doing data access, business rules, and rendering all at once - a change to the UI risks breaking business logic, and vice versa. MVC isolates each responsibility so multiple people can work on the same app without stepping on each other.<br>`,
                codeExamples: [
                  `import java.util.*;

// ---- Model ----
class Student {
    private String name;
    private String course;

    public Student(String name, String course) {
        this.name = name;
        this.course = course;
    }

    public String getName() { return name; }
    public String getCourse() { return course; }
}

// ---- View ----
class StudentView {
    public void printStudentDetails(String name, String course) {
        System.out.println("Student: " + name);
        System.out.println("Course: " + course);
    }
}

// ---- Controller ----
class StudentController {
    private Student model;
    private StudentView view;

    public StudentController(Student model, StudentView view) {
        this.model = model;
        this.view = view;
    }

    public void updateView() {
        view.printStudentDetails(model.getName(), model.getCourse());
    }
}

public class MvcDemo {
    public static void main(String[] args) {
        Student model = new Student("Pankaj", "Java Programming");
        StudentView view = new StudentView();
        StudentController controller = new StudentController(model, view);

        controller.updateView();
    }
}
// OUTPUT:
// Student: Pankaj
// Course: Java Programming`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>MVC in Real Frameworks - Spring MVC</h3>
Spring MVC is a concrete, industry-standard implementation of this pattern:<br>
<br>
• A <code>@Controller</code>/<code>@RestController</code> class receives the HTTP request.<br>
• It calls a Service layer, which operates on Model objects (entities/DTOs).<br>
• It returns a logical view name (for server-rendered pages) or the Model data directly as JSON (for REST APIs), and Spring's <strong>DispatcherServlet</strong> (a Front Controller) resolves and renders the actual View.<br><br>
So "MVC" in a Spring app isn't just a naming convention - it's this exact separation, enforced by the framework's own request-handling pipeline.<br>`,
                codeExamples: [
                  `// Conceptual Spring MVC controller - illustrative, not a full runnable program
@Controller
public class StudentController {

    @Autowired
    private StudentService studentService; // talks to the Model layer

    @GetMapping("/student/{id}")
    public String getStudent(@PathVariable int id, Model model) {
        Student student = studentService.findById(id); // Model
        model.addAttribute("student", student);
        return "studentView"; // View name resolved by DispatcherServlet
    }
}`
                ]
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does MVC solve?</td><td>It separates data, presentation, and control flow so each can change independently, improving maintainability and enabling parallel development</td></tr>
<tr class='text-center'><td>What is the Controller's job?</td><td>Receiving input/requests, coordinating with the Model, and selecting which View renders the response - it should not contain business logic itself</td></tr>
<tr class='text-center'><td>How does Spring MVC implement this pattern?</td><td>DispatcherServlet acts as the entry point (Front Controller), delegates to @Controller classes, which use Service/Model layers and return a View name or data</td></tr>
<tr class='text-center'><td>Can the View talk directly to the Model?</td><td>In classic Smalltalk-80 MVC the View holds a reference to the Model, observes it directly and is notified of changes. It is WEB (Model-2) MVC where the Controller assembles model data and hands it to the View. Either way the View shouldn't mutate the Model or contain business logic</td></tr>
</table>`
              }
            ]
          },

          // ----- Front Controller Pattern -----
          {
            id: 'front-controller-pattern',
            name: 'Front Controller Pattern',
            beginner: [
              {
                content: `<h3>What is the Front Controller Pattern?</h3>
A <strong>Front Controller</strong> is a single, centralized entry point that handles every incoming request for an application, before dispatching it to the right handler. Instead of every page/servlet independently doing authentication, logging, and routing, one component does it once, consistently, for all requests.<br>
<br>
<h4>Without a Front Controller</h4>
Each servlet/page repeats the same boilerplate: check login, log the request, pick a view, handle errors - duplicated everywhere, easy to get inconsistent.<br>
<br>
<h4>With a Front Controller</h4>
One controller intercepts every request, performs the shared logic once, then delegates to a specific handler for that request's actual business work.<br>`,
                codeExamples: [
                  `import java.util.*;

// Front Controller - single entry point for every request
class FrontController {
    public void dispatchRequest(String requestType) {
        System.out.println("Front Controller: logging request -> " + requestType);
        System.out.println("Front Controller: checking authentication...");

        if (requestType.equalsIgnoreCase("HOME")) {
            new HomeCommand().execute();
        } else if (requestType.equalsIgnoreCase("STUDENT")) {
            new StudentCommand().execute();
        } else {
            System.out.println("404 - No handler found for: " + requestType);
        }
    }
}

class HomeCommand {
    void execute() { System.out.println("Rendering Home Page"); }
}

class StudentCommand {
    void execute() { System.out.println("Rendering Student Page"); }
}

public class FrontControllerDemo {
    public static void main(String[] args) {
        FrontController fc = new FrontController();
        fc.dispatchRequest("HOME");
        fc.dispatchRequest("STUDENT");
    }
}
// OUTPUT:
// Front Controller: logging request -> HOME
// Front Controller: checking authentication...
// Rendering Home Page
// Front Controller: logging request -> STUDENT
// Front Controller: checking authentication...
// Rendering Student Page`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Real-World Front Controllers</h3>
• <strong>Spring MVC's DispatcherServlet</strong> is a textbook Front Controller - every HTTP request for the app passes through it first, and it delegates to the matching <code>@Controller</code> method.<br>
• <strong>Servlet Filter chains</strong> can also implement cross-cutting Front-Controller-style behavior (auth, logging, CORS) applied uniformly before requests reach any servlet.<br><br>
The benefit compounds as an application grows: adding a new cross-cutting concern (e.g. rate limiting) means changing ONE place instead of every page/handler.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a Front Controller?</td><td>A single centralized entry point for all requests, which performs shared logic (auth, logging) once and then delegates to specific handlers</td></tr>
<tr class='text-center'><td>Name a real Front Controller in Java web frameworks</td><td>Spring MVC's DispatcherServlet</td></tr>
<tr class='text-center'><td>What's the main benefit over per-page handling?</td><td>Shared/cross-cutting logic lives in one place instead of being duplicated (and potentially inconsistent) across every page/servlet</td></tr>
</table>`
              }
            ]
          },

          // ----- Page Controller Pattern -----
          {
            id: 'page-controller-pattern',
            name: 'Page Controller Pattern',
            beginner: [
              {
                content: `<h3>What is the Page Controller Pattern?</h3>
A <strong>Page Controller</strong> assigns one controller class (or method) per page or request type - each controller handles exactly one kind of request end-to-end, from input to choosing the response. This is the direct opposite structural choice from Front Controller's single shared entry point.<br>
<br>
<h4>When It Fits</h4>
• Simple sites/apps with a small, fixed set of distinct pages, where each page's logic is genuinely independent.<br>
• Easier to understand for a single page in isolation - there's no shared dispatch machinery to trace through.<br>
<br>
<h4>When It Doesn't Scale Well</h4>
Cross-cutting concerns (auth, logging) must be repeated in every Page Controller, unless you also introduce a Front Controller or Filter layer on top - which is exactly why real frameworks combine both (Front Controller for shared concerns, Page-Controller-like <code>@Controller</code> methods for specific request handling).<br>`,
                codeExamples: [
                  `// Each request type gets its own dedicated controller
class HomePageController {
    void handleRequest() {
        System.out.println("HomePageController: rendering home page");
    }
}

class StudentPageController {
    void handleRequest() {
        System.out.println("StudentPageController: rendering student page");
    }
}

public class PageControllerDemo {
    public static void main(String[] args) {
        new HomePageController().handleRequest();
        new StudentPageController().handleRequest();
    }
}
// OUTPUT:
// HomePageController: rendering home page
// StudentPageController: rendering student page`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Page Controller vs Front Controller</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Page Controller</th><th>Front Controller</th></tr>
<tr class='text-center'><td>Entry points</td><td>One controller per page/request type</td><td>A single shared entry point for all requests</td></tr>
<tr class='text-center'><td>Cross-cutting logic</td><td>Repeated per controller unless factored out separately</td><td>Centralized once</td></tr>
<tr class='text-center'><td>Best fit</td><td>Small apps, few distinct simple pages</td><td>Larger apps needing consistent shared behavior</td></tr>
</table>
<br>
In practice, Spring MVC's individual <code>@Controller</code> methods act like Page Controllers for their specific routes, while DispatcherServlet still serves as the overarching Front Controller - the two patterns are commonly combined, not mutually exclusive.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does Page Controller differ from Front Controller?</td><td>Page Controller assigns one handler per page/request type; Front Controller routes all requests through one shared entry point</td></tr>
<tr class='text-center'><td>Are the two patterns mutually exclusive?</td><td>No - Spring MVC combines both: DispatcherServlet is the Front Controller, and individual @Controller methods act like Page Controllers per route</td></tr>
</table>`
              }
            ]
          },

          // ----- Application Controller Pattern -----
          {
            id: 'application-controller-pattern',
            name: 'Application Controller Pattern',
            beginner: [
              {
                content: `<h3>What is the Application Controller Pattern?</h3>
An <strong>Application Controller</strong> centralizes screen/view navigation and command-selection logic in one place, separate from the Front Controller. The Front Controller handles "which request came in", while the Application Controller handles "given this action, which view/command comes next" - useful when navigation flow is complex (e.g. multi-step wizards, workflow-driven UIs).<br>`,
                codeExamples: [
                  `import java.util.*;

// Application Controller centralizes "action -> next view" navigation logic
class ApplicationController {
    private Map<String, String> flowMap = new HashMap<>();

    public ApplicationController() {
        flowMap.put("START", "PersonalInfoView");
        flowMap.put("PersonalInfoView", "AddressView");
        flowMap.put("AddressView", "ConfirmationView");
    }

    public String getNextView(String currentStep) {
        return flowMap.getOrDefault(currentStep, "ErrorView");
    }
}

public class ApplicationControllerDemo {
    public static void main(String[] args) {
        ApplicationController appController = new ApplicationController();

        String step = "START";
        for (int i = 0; i < 3; i++) {
            String next = appController.getNextView(step);
            System.out.println(step + " -> " + next);
            step = next;
        }
    }
}
// OUTPUT:
// START -> PersonalInfoView
// PersonalInfoView -> AddressView
// AddressView -> ConfirmationView`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Application Controller vs Front Controller</h3>
These are complementary, not competing: the Front Controller is the single request entry point (handles EVERY incoming request); the Application Controller is invoked BY specific handlers to decide navigation/command flow when that flow is non-trivial (e.g. depends on prior steps, user role, or business state). Simple apps skip a dedicated Application Controller entirely and let each handler pick its own next view directly.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does an Application Controller centralize?</td><td>Navigation/command-selection logic - deciding which view or command comes next given the current action/state</td></tr>
<tr class='text-center'><td>How is it different from a Front Controller?</td><td>Front Controller handles every incoming request as the entry point; Application Controller is about deciding navigation flow once inside request handling</td></tr>
<tr class='text-center'><td>When is a dedicated Application Controller worth it?</td><td>When navigation logic is complex (multi-step wizards, workflow/state-dependent screens) - simple apps can let each handler pick its own next view</td></tr>
</table>`
              }
            ]
          },

          // ----- Service Layer Pattern -----
          {
            id: 'service-layer-pattern',
            name: 'Service Layer Pattern',
            beginner: [
              {
                content: `<h3>What is the Service Layer Pattern?</h3>
A <strong>Service Layer</strong> is a dedicated layer that defines an application's business-logic boundary/API. Controllers call into Service classes; Service classes coordinate domain objects, repositories, and (often) transactions - keeping business rules out of the Controller and out of raw data-access code.<br>
<br>
<h4>Why It Matters</h4>
• Controllers stay thin - just translating HTTP requests into service calls.<br>
• Business logic lives in ONE testable, reusable place instead of being scattered across controllers or duplicated per entry point (web, batch job, CLI all reuse the same Service).<br>
• Transaction boundaries (commit/rollback) typically wrap a Service method, not individual repository calls.<br>`,
                codeExamples: [
                  `import java.util.*;

// ---- Repository (data access) ----
class StudentRepository {
    private Map<Integer, String> db = new HashMap<>();

    void save(int id, String name) { db.put(id, name); }
    String findById(int id) { return db.get(id); }
}

// ---- Service Layer (business logic boundary) ----
class StudentService {
    private StudentRepository repository = new StudentRepository();

    public void registerStudent(int id, String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name cannot be empty");
        }
        repository.save(id, name); // business rule enforced before persisting
        System.out.println("Registered student: " + name);
    }

    public String getStudentName(int id) {
        return repository.findById(id);
    }
}

// ---- Controller (thin - delegates to Service) ----
public class ServiceLayerDemo {
    public static void main(String[] args) {
        StudentService service = new StudentService();
        service.registerStudent(1, "Pankaj");
        System.out.println("Lookup: " + service.getStudentName(1));
    }
}
// OUTPUT:
// Registered student: Pankaj
// Lookup: Pankaj`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Service Layer in Spring</h3>
Spring's <code>@Service</code> annotation marks a class as this exact layer. Combined with <code>@Transactional</code> on a Service method, Spring wraps that entire method - including all its repository calls - in a single database transaction, so a failure partway through rolls back everything cleanly. This is precisely why business logic and transaction boundaries belong at the Service layer, not scattered in Controllers or Repositories.<br>`,
                codeExamples: [
                  `// Conceptual Spring example - illustrative, not a full runnable program
@Service
public class StudentService {

    @Autowired
    private StudentRepository repository;

    @Transactional
    public void registerStudent(Student student) {
        validate(student);
        repository.save(student);
        // any exception here rolls back the save too
    }
}`
                ]
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What belongs in a Service Layer?</td><td>Business logic and orchestration between domain objects/repositories - not raw data access, not HTTP/request handling</td></tr>
<tr class='text-center'><td>Why keep Controllers thin?</td><td>So business logic is reusable across multiple entry points (web, batch, CLI) and is easier to unit test in isolation from HTTP concerns</td></tr>
<tr class='text-center'><td>Where do transaction boundaries typically live?</td><td>Around Service methods (e.g. @Transactional), so a whole business operation commits or rolls back as one unit</td></tr>
</table>`
              }
            ]
          },

          // ----- Domain Model Pattern -----
          {
            id: 'domain-model-pattern',
            name: 'Domain Model Pattern',
            beginner: [
              {
                content: `<h3>What is the Domain Model Pattern?</h3>
A <strong>Domain Model</strong> is an object model of the business domain that combines BOTH data AND behavior in the same objects - a <code>BankAccount</code> class doesn't just hold a balance field, it also has a <code>withdraw()</code> method that enforces the business rule (can't go below zero) directly on itself.<br>
<br>
<h4>Domain Model vs Anemic Domain Model</h4>
An <strong>anemic domain model</strong> (an anti-pattern, not this pattern) has classes that are just data bags (getters/setters only), with ALL logic living in separate Service classes. A true Domain Model pushes behavior that belongs to the data onto the data's own class.<br>`,
                codeExamples: [
                  `// Rich Domain Model - behavior lives WITH the data
class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            throw new IllegalStateException("Insufficient funds");
        }
        balance -= amount; // business rule enforced right here, on the object itself
    }

    public void deposit(double amount) {
        balance += amount;
    }

    public double getBalance() { return balance; }
}

public class DomainModelDemo {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(100.0);
        account.deposit(50.0);
        account.withdraw(30.0);

        System.out.println("Final balance: " + account.getBalance());

        try {
            account.withdraw(1000.0);
        } catch (IllegalStateException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}
// OUTPUT:
// Final balance: 120.0
// Error: Insufficient funds`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Anemic Domain Model - The Contrasting Anti-Pattern</h3>
The same example rewritten as an anemic model pushes ALL logic out into a Service, leaving <code>BankAccount</code> as a pure data holder:<br>`,
                codeExamples: [
                  `// Anemic model: no behavior on the class itself
class AnemicBankAccount {
    private double balance;
    public double getBalance() { return balance; }
    public void setBalance(double balance) { this.balance = balance; }
}

// All logic pushed into a Service instead - the object itself knows nothing
class AnemicBankAccountService {
    void withdraw(AnemicBankAccount acc, double amount) {
        if (amount > acc.getBalance()) {
            throw new IllegalStateException("Insufficient funds");
        }
        acc.setBalance(acc.getBalance() - amount);
    }
}
// Downsides: business rules can be bypassed by any code calling setBalance()
// directly, and the rule (can't overdraw) isn't co-located with the data it protects.`
                ]
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What defines a (rich) Domain Model?</td><td>Objects that combine data AND behavior - business rules live as methods on the objects they protect, not in a separate service only</td></tr>
<tr class='text-center'><td>What is an anemic domain model?</td><td>An anti-pattern where domain classes are pure getter/setter data bags, with all logic pushed into external Service classes - loses encapsulation of business rules</td></tr>
<tr class='text-center'><td>What's the risk of an anemic model?</td><td>Business rules can be bypassed by any code that calls the setters directly, since the object itself doesn't enforce its own invariants</td></tr>
</table>`
              }
            ]
          },

          // ----- Transaction Script Pattern -----
          {
            id: 'transaction-script-pattern',
            name: 'Transaction Script Pattern',
            beginner: [
              {
                content: `<h3>What is the Transaction Script Pattern?</h3>
<strong>Transaction Script</strong> organizes business logic as a set of procedural methods/scripts - one script per business transaction/use-case (e.g. <code>placeOrder()</code>, <code>cancelOrder()</code>), each running top-to-bottom: validate input, do the work, save results. There's no rich object model - just straightforward procedures operating on simple data.<br>
<br>
<h4>When It Fits</h4>
Great for simple applications with straightforward, mostly-independent business rules - it's easy to read top-to-bottom and quick to write. It intentionally trades object-oriented elegance for procedural simplicity.<br>
<br>
<h4>When It Breaks Down</h4>
As business rules grow more complex and start overlapping between transactions, logic gets duplicated across scripts (since there's no shared object to hold it) - that's exactly the point where a Domain Model pays off instead.<br>`,
                codeExamples: [
                  `import java.util.*;

// Transaction Script: one procedural method per business transaction
class OrderTransactionScript {

    Map<Integer, Double> inventory = new HashMap<>(Map.of(101, 50.0));

    public void placeOrder(int productId, int quantity) {
        // Step 1: validate
        if (!inventory.containsKey(productId)) {
            System.out.println("Order failed: product not found");
            return;
        }
        // Step 2: do the work (procedural, top-to-bottom)
        double price = inventory.get(productId);
        double total = price * quantity;
        // Step 3: "save"/report result
        System.out.println("Order placed. Total: " + total);
    }
}

public class TransactionScriptDemo {
    public static void main(String[] args) {
        OrderTransactionScript script = new OrderTransactionScript();
        script.placeOrder(101, 3);
        script.placeOrder(999, 1);
    }
}
// OUTPUT:
// Order placed. Total: 150.0
// Order failed: product not found`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Transaction Script vs Domain Model</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Transaction Script</th><th>Domain Model</th></tr>
<tr class='text-center'><td>Structure</td><td>Procedural methods, one per use-case</td><td>Rich objects with behavior + data</td></tr>
<tr class='text-center'><td>Best for</td><td>Simple, largely-independent business rules</td><td>Complex, interrelated business rules</td></tr>
<tr class='text-center'><td>Code reuse across use-cases</td><td>Hard - logic duplicates across scripts</td><td>Natural - shared logic lives on shared objects</td></tr>
<tr class='text-center'><td>Learning curve</td><td>Low - reads top-to-bottom</td><td>Higher - requires understanding object collaboration</td></tr>
</table>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is Transaction Script?</td><td>Organizing business logic as procedural methods, one per business transaction, executed top-to-bottom</td></tr>
<tr class='text-center'><td>When does it break down?</td><td>When business rules overlap across transactions - logic ends up duplicated since there's no shared domain object to hold it</td></tr>
<tr class='text-center'><td>What's the natural next step when complexity grows?</td><td>Migrating shared logic into a Domain Model, where behavior lives on the objects it operates on instead of in disconnected scripts</td></tr>
</table>`
              }
            ]
          },

          // ----- Repository Pattern -----
          {
            id: 'repository-pattern',
            name: 'Repository Pattern',
            beginner: [
              {
                content: `<h3>What is the Repository Pattern?</h3>
A <strong>Repository</strong> mediates between the domain/business layer and the data-mapping layer, exposing a collection-like interface for accessing domain objects - callers work with methods like <code>findById()</code>, <code>save()</code>, <code>findAll()</code> as if they were querying an in-memory collection, without knowing or caring whether the data actually comes from a database, a file, or an in-memory cache.<br>
<br>
<h4>Why It's Useful</h4>
• The rest of the application depends only on the Repository's interface, not on SQL/JDBC/JPA details.<br>
• Swapping the underlying storage (e.g. moving from an in-memory list to a real database) means changing ONE implementation, not every caller.<br>
• Makes unit testing easy - swap in a fake/in-memory Repository implementation instead of hitting a real database.<br>`,
                codeExamples: [
                  `import java.util.*;

// Domain object
class Product {
    int id;
    String name;
    Product(int id, String name) { this.id = id; this.name = name; }
}

// Repository interface - collection-like API, storage-agnostic
interface ProductRepository {
    void save(Product product);
    Product findById(int id);
    List<Product> findAll();
}

// One concrete implementation (in-memory here; could be JDBC/JPA-backed instead)
class InMemoryProductRepository implements ProductRepository {
    private Map<Integer, Product> store = new HashMap<>();

    public void save(Product product) { store.put(product.id, product); }
    public Product findById(int id) { return store.get(id); }
    public List<Product> findAll() { return new ArrayList<>(store.values()); }
}

public class RepositoryDemo {
    public static void main(String[] args) {
        ProductRepository repo = new InMemoryProductRepository();
        repo.save(new Product(1, "Laptop"));
        repo.save(new Product(2, "Mouse"));

        Product found = repo.findById(1);
        System.out.println("Found: " + found.name);
        System.out.println("Total products: " + repo.findAll().size());
    }
}
// OUTPUT:
// Found: Laptop
// Total products: 2`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Repository vs DAO</h3>
The two are closely related and often conflated, but conceptually differ in intent:<br>
<br>
• <strong>DAO (Data Access Object)</strong> is typically table/entity-centric - it directly wraps CRUD operations against one specific data source (SQL statements, JDBC calls).<br>
• <strong>Repository</strong> is domain-centric - it presents a collection-like abstraction over the domain model, and may internally delegate to one or more DAOs. Repository sits one level of abstraction higher, closer to the business/domain language.<br><br>
In modern Spring applications, <strong>Spring Data JPA</strong> repositories (interfaces extending <code>JpaRepository&lt;Entity, ID&gt;</code>) blur this line further - you get a full Repository-style API auto-implemented for you, backed by JPA/Hibernate underneath. A dedicated "DAO" topic elsewhere covers the lower-level data-access details in depth.<br>`,
                codeExamples: [
                  `// Conceptual Spring Data JPA example - illustrative, not a full runnable program
public interface ProductRepository extends JpaRepository<Product, Integer> {
    // save(), findById(), findAll(), delete() are all provided automatically
    List<Product> findByNameContaining(String keyword); // derived query method
}`
                ]
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does a Repository abstract away?</td><td>The underlying data source/storage mechanism - callers use a collection-like API without knowing if data comes from SQL, a file, or memory</td></tr>
<tr class='text-center'><td>How is Repository different from DAO?</td><td>DAO is typically table/entity-centric CRUD wrapping one data source directly; Repository is domain-centric and may compose multiple DAOs behind a collection-like abstraction</td></tr>
<tr class='text-center'><td>Why does this pattern make testing easier?</td><td>Since code depends on the Repository interface, tests can substitute an in-memory fake implementation instead of needing a real database</td></tr>
<tr class='text-center'><td>How does Spring Data JPA relate to this pattern?</td><td>It auto-generates Repository implementations from interfaces (e.g. extending JpaRepository), backed by JPA/Hibernate, so you get the pattern's benefits with minimal boilerplate</td></tr>
</table>`
              }
            ]
          }

        ]
      }
    ],
    cheatNotes: [
      'MVC - separates Model (data), View (presentation), Controller (control flow)',
      'Front Controller - single entry point for all requests (e.g. Spring DispatcherServlet)',
      'Page Controller - one controller per page/request type',
      'Service Layer - defines the business-logic boundary; keeps Controllers thin',
      'Domain Model - rich objects with data + behavior together; opposite of anemic model',
      'Transaction Script - procedural, one method per business transaction; simple but doesn\'t scale to complex rules',
      'Repository - collection-like abstraction over data access; Repository is domain-centric, DAO is data-source-centric'
    ],
    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'What are the three components of MVC and what does each one own?',
          'How does Spring MVC\'s DispatcherServlet implement the Front Controller pattern?',
          'When would you choose Page Controller over Front Controller?',
          'What is the difference between an Application Controller and a Front Controller?',
          'Why should business logic live in a Service Layer instead of a Controller?',
          'What is an anemic domain model, and why is it considered an anti-pattern?',
          'When does Transaction Script stop being a good fit for an application?',
          'What is the key conceptual difference between Repository and DAO?',
          'How does Spring Data JPA relate to the Repository pattern?',
          'Why is @Transactional typically placed on Service methods rather than Repository methods?'
        ]
      }
    ]
  }
];
