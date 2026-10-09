// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const enterprisePatternsPart2: Course[] = [
  {
    id: 'enterprise-patterns-2',
    name: 'Enterprise Design Patterns (Data Access)',
    icon: 'Database',
    subTopics: [
      {
        id: 'enterprise-patterns-data',
        name: 'Data Access Patterns',
        topics: [

          // ----- DAO -----
          {
            id: 'dao-pattern',
            name: 'DAO (Data Access Object) Pattern',
            beginner: [
              {
                content: `<h3>What is the DAO Pattern?</h3>
A <strong>Data Access Object (DAO)</strong> abstracts and encapsulates all access to a data source (a database, a file, a web service) behind a well-defined interface. The rest of the application talks to the DAO's interface only - it never writes SQL or touches a <code>Connection</code> object directly.<br>
<br>
• Keeps persistence-specific code (JDBC, SQL) isolated in one layer.<br>
• If the storage technology changes (JDBC -> JPA, MySQL -> PostgreSQL), only the DAO implementation changes - callers are untouched.<br>
• Makes unit testing easier - a service can be tested against a fake/mock DAO without hitting a real database.<br>`,
                codeExamples: [
                  `import java.util.*;

class Employee {
    int id;
    String name;
    Employee(int id, String name) { this.id = id; this.name = name; }
    public String toString() { return "Employee[" + id + ", " + name + "]"; }
}

// DAO interface - the contract the rest of the app depends on
interface EmployeeDao {
    void save(Employee e);
    Employee findById(int id);
    List<Employee> findAll();
}

// Concrete implementation - all "data access" details live only here
class InMemoryEmployeeDao implements EmployeeDao {
    private final Map<Integer, Employee> store = new HashMap<>();

    public void save(Employee e) { store.put(e.id, e); }
    public Employee findById(int id) { return store.get(id); }
    public List<Employee> findAll() { return new ArrayList<>(store.values()); }
}

public class DaoDemo {
    public static void main(String[] args) {
        EmployeeDao dao = new InMemoryEmployeeDao();
        dao.save(new Employee(1, "Pankaj"));
        dao.save(new Employee(2, "Rahul"));

        System.out.println(dao.findById(1));
        System.out.println("All: " + dao.findAll());
    }
}
// OUTPUT:
// Employee[1, Pankaj]
// All: [Employee[1, Pankaj], Employee[2, Rahul]]`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>DAO vs Repository</h3>
These two patterns are frequently confused because both hide persistence details behind an interface, but they solve slightly different problems:<br>
<br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>DAO</th><th>Repository</th></tr>
<tr class='text-center'><td>Focus</td><td>Table/entity-centric CRUD operations</td><td>Collection-like abstraction over the domain model</td></tr>
<tr class='text-center'><td>Typical shape</td><td>save(), findById(), delete(), update()</td><td>add(), remove(), findByX() - reads like an in-memory collection</td></tr>
<tr class='text-center'><td>Origin</td><td>J2EE Core Patterns (data-access layer concern)</td><td>Domain-Driven Design (a domain-layer concept)</td></tr>
<tr class='text-center'><td>Java example</td><td>A plain DAO interface + JDBC implementation</td><td>Spring Data JPA's JpaRepository&lt;T, ID&gt;</td></tr>
</table>
<br>
In practice, Spring Data repositories are often DAOs wearing a Repository-shaped interface - the distinction matters more in strict DDD architectures than in typical Spring Boot CRUD apps.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does DAO solve?</td><td>It isolates all data-access/persistence code behind one interface, so the rest of the app doesn't depend on a specific storage technology</td></tr>
<tr class='text-center'><td>How does DAO help testing?</td><td>Services can depend on the DAO interface and be tested with a fake/in-memory/mock implementation instead of a real database</td></tr>
<tr class='text-center'><td>DAO vs Repository - what's the core difference?</td><td>DAO is table/entity-centric CRUD; Repository is a collection-like abstraction over the domain, a Domain-Driven Design concept</td></tr>
<tr class='text-center'><td>Is Spring Data JPA's JpaRepository a DAO?</td><td>Functionally yes - it implements CRUD/data-access behind an interface, just using Repository-style naming/semantics</td></tr>
</table>`
              }
            ]
          },

          // ----- Data Mapper -----
          {
            id: 'data-mapper-pattern',
            name: 'Data Mapper Pattern',
            beginner: [
              {
                content: `<h3>What is the Data Mapper Pattern?</h3>
A <strong>Data Mapper</strong> is a separate layer of objects that moves data between plain domain objects and a database, while keeping the domain objects, the database schema, and the mapper itself completely <strong>independent</strong> of each other.<br>
<br>
• The domain object (e.g. <code>Employee</code>) has NO idea a database exists - no save()/find() methods on it, no SQL, no JDBC imports.<br>
• The Mapper is the only thing that knows how to translate between the object's fields and the database columns.<br>
• This separation is exactly what Hibernate/JPA implement internally: your <code>@Entity</code> classes stay plain Java objects, and Hibernate's session/EntityManager acts as the Data Mapper.<br>`,
                codeExamples: [
                  `import java.util.*;

// Plain domain object - knows nothing about persistence
class Employee {
    int id;
    String name;
    Employee(int id, String name) { this.id = id; this.name = name; }
}

// The Mapper - the ONLY class that knows about "the database"
class EmployeeMapper {
    private final Map<Integer, Employee> fakeTable = new HashMap<>();

    void insert(Employee e) {
        fakeTable.put(e.id, e);
        System.out.println("INSERT INTO employee VALUES (" + e.id + ", '" + e.name + "')");
    }

    Employee find(int id) {
        Employee e = fakeTable.get(id);
        System.out.println("SELECT * FROM employee WHERE id = " + id);
        return e;
    }
}

public class DataMapperDemo {
    public static void main(String[] args) {
        EmployeeMapper mapper = new EmployeeMapper();
        mapper.insert(new Employee(1, "Pankaj"));

        Employee found = mapper.find(1);
        System.out.println("Found: id=" + found.id + ", name=" + found.name);
    }
}
// OUTPUT:
// INSERT INTO employee VALUES (1, 'Pankaj')
// SELECT * FROM employee WHERE id = 1
// Found: id=1, name=Pankaj`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Data Mapper in Hibernate/JPA</h3>
When you annotate a class with <code>@Entity</code> and call <code>entityManager.persist(employee)</code>, Hibernate's <strong>persistence context</strong> is playing the role of the Data Mapper: it reads your entity's fields via reflection, generates the SQL, and writes it to the database - your <code>Employee</code> class itself stays a Plain Old Java Object with zero SQL inside it. This is why JPA entities can be unit-tested with plain <code>new Employee(...)</code> calls, no database required.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the core idea of Data Mapper?</td><td>Move data between objects and the database through a separate mapper layer, keeping domain objects, schema, and mapper all independent of each other</td></tr>
<tr class='text-center'><td>Does the domain object know about the database in Data Mapper?</td><td>No - that's the whole point; the domain object stays a plain object with no persistence logic inside it</td></tr>
<tr class='text-center'><td>Which real Java technology implements Data Mapper?</td><td>Hibernate/JPA - the EntityManager/Session acts as the mapper, while @Entity classes remain plain objects</td></tr>
</table>`
              }
            ]
          },

          // ----- Active Record -----
          {
            id: 'active-record-pattern',
            name: 'Active Record Pattern',
            beginner: [
              {
                content: `<h3>What is the Active Record Pattern?</h3>
An <strong>Active Record</strong> object wraps a single row of a database table AND encapsulates the database-access logic (save, delete, find) inside that SAME class. Unlike Data Mapper, the domain object here is fully aware it's persisted - it knows how to save/load/delete itself.<br>`,
                codeExamples: [
                  `import java.util.*;

// Active Record: the object knows how to persist ITSELF
class Employee {
    static Map<Integer, Employee> table = new HashMap<>(); // stand-in for a real DB
    int id;
    String name;

    Employee(int id, String name) { this.id = id; this.name = name; }

    void save() {
        table.put(id, this);
        System.out.println("Saved employee id=" + id);
    }

    void delete() {
        table.remove(id);
        System.out.println("Deleted employee id=" + id);
    }

    static Employee find(int id) {
        return table.get(id);
    }
}

public class ActiveRecordDemo {
    public static void main(String[] args) {
        Employee e = new Employee(1, "Pankaj");
        e.save();                          // object saves itself

        Employee found = Employee.find(1); // static finder on the class itself
        System.out.println("Found: " + found.name);

        found.delete();                    // object deletes itself
    }
}
// OUTPUT:
// Saved employee id=1
// Found: Pankaj
// Deleted employee id=1`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Active Record vs Data Mapper</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Active Record</th><th>Data Mapper</th></tr>
<tr class='text-center'><td>Persistence logic lives in</td><td>The domain object itself (save()/delete())</td><td>A separate Mapper class</td></tr>
<tr class='text-center'><td>Domain object aware of DB?</td><td>Yes - tightly coupled to persistence</td><td>No - stays a plain object</td></tr>
<tr class='text-center'><td>Simplicity</td><td>Simpler for small/CRUD-heavy apps</td><td>More boilerplate, but cleaner separation</td></tr>
<tr class='text-center'><td>Testability</td><td>Harder - object drags in persistence behavior</td><td>Easier - pure domain object, no persistence dependency</td></tr>
<tr class='text-center'><td>Java examples</td><td>Some lightweight ORMs / ActiveJDBC-style libraries</td><td>Hibernate/JPA</td></tr>
</table>
<br>
Active Record trades architectural purity for simplicity - a reasonable choice for small apps with simple, mostly-CRUD domain logic; it becomes a liability as business logic complexity grows.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What defines Active Record?</td><td>A single class holds both the row's data AND the logic to save/load/delete that row itself</td></tr>
<tr class='text-center'><td>Why is Active Record harder to unit test than Data Mapper?</td><td>Because the domain object is coupled to persistence logic, so testing pure business rules also drags in database behavior</td></tr>
<tr class='text-center'><td>When is Active Record a reasonable choice?</td><td>Small applications with simple, mostly-CRUD domain logic where the extra separation of Data Mapper isn't worth the boilerplate</td></tr>
</table>`
              }
            ]
          },

          // ----- Unit of Work -----
          {
            id: 'unit-of-work-pattern',
            name: 'Unit of Work Pattern',
            beginner: [
              {
                content: `<h3>What is the Unit of Work Pattern?</h3>
A <strong>Unit of Work</strong> keeps track of everything you do during a business transaction - every object created, updated, or deleted - and then coordinates writing all of it out as <strong>one atomic operation</strong> at the end, instead of firing off a database call for every single change immediately.<br>
<br>
• Batches changes together for one commit, instead of many small round-trips.<br>
• Lets you roll back the entire set of changes together if anything fails.<br>`,
                codeExamples: [
                  `import java.util.*;

class Employee {
    int id; String name;
    Employee(int id, String name) { this.id = id; this.name = name; }
}

// Unit of Work: tracks pending changes, commits them together
class UnitOfWork {
    private final List<Employee> newObjects = new ArrayList<>();
    private final List<Employee> dirtyObjects = new ArrayList<>();
    private final List<Employee> removedObjects = new ArrayList<>();

    void registerNew(Employee e) { newObjects.add(e); }
    void registerDirty(Employee e) { dirtyObjects.add(e); }
    void registerRemoved(Employee e) { removedObjects.add(e); }

    void commit() {
        for (Employee e : newObjects) System.out.println("INSERT id=" + e.id);
        for (Employee e : dirtyObjects) System.out.println("UPDATE id=" + e.id);
        for (Employee e : removedObjects) System.out.println("DELETE id=" + e.id);
        System.out.println("Transaction committed: " + (newObjects.size() + dirtyObjects.size() + removedObjects.size()) + " change(s)");
    }
}

public class UnitOfWorkDemo {
    public static void main(String[] args) {
        UnitOfWork uow = new UnitOfWork();
        Employee e1 = new Employee(1, "Pankaj");
        Employee e2 = new Employee(2, "Rahul");

        uow.registerNew(e1);
        uow.registerNew(e2);
        e2.name = "Rahul Sharma";
        uow.registerDirty(e2);

        uow.commit(); // ALL changes written out together, atomically
    }
}
// OUTPUT:
// INSERT id=1
// INSERT id=2
// UPDATE id=2
// Transaction committed: 3 change(s)`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Unit of Work in Hibernate</h3>
Hibernate's <strong>Session</strong> (or JPA's <strong>EntityManager</strong> within a persistence context) is a real Unit of Work: entities you load, modify, or persist are tracked in the session's internal state, and nothing actually hits the database until <code>flush()</code>/<code>commit()</code> - at which point Hibernate computes the minimal set of INSERT/UPDATE/DELETE statements needed and executes them together. This is also what enables Hibernate's automatic "dirty checking" - it compares an entity's current state to its loaded snapshot to know what changed, without you calling any explicit registerDirty()-style method.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Unit of Work solve?</td><td>Coordinating many pending changes as one atomic commit instead of many separate database round-trips</td></tr>
<tr class='text-center'><td>What plays the role of Unit of Work in Hibernate?</td><td>The Session/EntityManager - it tracks changes and flushes them together at commit time</td></tr>
<tr class='text-center'><td>How does Hibernate know what changed without explicit registerDirty() calls?</td><td>Automatic dirty checking - it compares the entity's current field values against the snapshot taken when it was loaded</td></tr>
</table>`
              }
            ]
          },

          // ----- Identity Map -----
          {
            id: 'identity-map-pattern',
            name: 'Identity Map Pattern',
            beginner: [
              {
                content: `<h3>What is the Identity Map Pattern?</h3>
An <strong>Identity Map</strong> ensures each object is loaded <strong>only once per session</strong>, by keeping a map of already-loaded objects keyed by their identity (usually the primary key). If the same row is requested again within the same session, the cached in-memory object is returned instead of hitting the database and creating a second, separate copy.<br>
<br>
• Prevents having two different in-memory objects representing the same database row (which could drift out of sync).<br>
• Improves performance by avoiding redundant database reads within one session.<br>`,
                codeExamples: [
                  `import java.util.*;

class Employee {
    int id; String name;
    Employee(int id, String name) { this.id = id; this.name = name; }
}

// Identity Map: caches loaded objects by id within one "session"
class EmployeeIdentityMap {
    private final Map<Integer, Employee> cache = new HashMap<>();
    private int dbHits = 0;

    Employee find(int id) {
        if (cache.containsKey(id)) {
            System.out.println("Returned from Identity Map (no DB hit) for id=" + id);
            return cache.get(id);
        }
        dbHits++;
        Employee e = new Employee(id, "Pankaj"); // pretend this came from a real DB query
        System.out.println("Loaded from DB (hit #" + dbHits + ") for id=" + id);
        cache.put(id, e);
        return e;
    }
}

public class IdentityMapDemo {
    public static void main(String[] args) {
        EmployeeIdentityMap map = new EmployeeIdentityMap();

        Employee first = map.find(1);
        Employee second = map.find(1); // same id again

        System.out.println("Same object instance? " + (first == second));
    }
}
// OUTPUT:
// Loaded from DB (hit #1) for id=1
// Returned from Identity Map (no DB hit) for id=1
// Same object instance? true`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Identity Map in Hibernate</h3>
Hibernate's <strong>first-level cache</strong> (scoped to a single Session) IS an Identity Map: loading the same entity by id twice within one session returns the exact same Java object reference the second time, without a second SQL query. This is also why comparing two entities loaded in the same session with <code>==</code> works correctly for identity, in addition to <code>equals()</code>.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does an Identity Map guarantee?</td><td>Only one in-memory object exists per unique database row identity within a session, avoiding duplicate/inconsistent copies</td></tr>
<tr class='text-center'><td>What plays this role in Hibernate?</td><td>The first-level cache (Session-scoped) - repeated find-by-id calls return the same object reference without hitting the DB again</td></tr>
</table>`
              }
            ]
          },

          // ----- Business Delegate -----
          {
            id: 'business-delegate-pattern',
            name: 'Business Delegate Pattern',
            beginner: [
              {
                content: `<h3>What is the Business Delegate Pattern?</h3>
A <strong>Business Delegate</strong> is an object that hides the complexity of looking up and invoking a remote/complex business service (classically, an EJB lookup via JNDI) from the presentation-tier client. The client talks to a simple delegate; the delegate handles lookup, invocation, and even basic error/retry handling.<br>
<br>
• Decouples the presentation layer from the business-service layer's implementation details.<br>
• Centralizes lookup/connection logic in one place instead of scattering it across every UI action.<br>`,
                codeExamples: [
                  `// Business service - could be remote/complex to look up (e.g. an EJB) in a real system
class OrderService {
    String placeOrder(String item) {
        return "Order placed for: " + item;
    }
}

// Business Delegate - hides lookup/complexity from the client
class OrderBusinessDelegate {
    private OrderService lookupService() {
        // In a real system: JNDI lookup, remote proxy creation, retries, etc.
        System.out.println("Looking up OrderService...");
        return new OrderService();
    }

    String placeOrder(String item) {
        OrderService service = lookupService();
        return service.placeOrder(item);
    }
}

// Presentation-tier client - only talks to the simple delegate
public class BusinessDelegateDemo {
    public static void main(String[] args) {
        OrderBusinessDelegate delegate = new OrderBusinessDelegate();
        System.out.println(delegate.placeOrder("Laptop"));
    }
}
// OUTPUT:
// Looking up OrderService...
// Order placed for: Laptop`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does Business Delegate solve?</td><td>It hides remote/complex business-service lookup and invocation details from the presentation-tier client, reducing coupling</td></tr>
<tr class='text-center'><td>Where did this pattern originate?</td><td>Classic J2EE, originally to hide EJB (JNDI) lookup complexity from UI/servlet code</td></tr>
<tr class='text-center'><td>Is Business Delegate still relevant in modern Spring apps?</td><td>Less commonly needed by that name since Spring's dependency injection already hides lookup complexity, but the underlying idea (decoupling presentation from service lookup) still applies</td></tr>
</table>`
              }
            ]
          },

          // ----- Session Facade -----
          {
            id: 'session-facade-pattern',
            name: 'Session Facade Pattern',
            beginner: [
              {
                content: `<h3>What is the Session Facade Pattern?</h3>
A <strong>Session Facade</strong> is a coarse-grained facade that exposes a simplified, unified interface to a set of fine-grained business objects, specifically for remote/presentation-tier clients. It's essentially the classic GoF <strong>Facade</strong> pattern, specialized for J2EE's remote-service-access context.<br>
<br>
• Reduces the number of remote calls a client needs to make (one call to the facade instead of many calls to fine-grained objects).<br>
• Hides the internal complexity/structure of the business-object model from remote clients.<br>`,
                codeExamples: [
                  `// Fine-grained business objects (would be remote/EJB in classic J2EE)
class InventoryService {
    boolean checkStock(String item) { System.out.println("Checking stock for " + item); return true; }
}
class PaymentService {
    boolean charge(String item) { System.out.println("Charging for " + item); return true; }
}
class ShippingService {
    void ship(String item) { System.out.println("Shipping " + item); }
}

// Session Facade - ONE coarse-grained entry point for the client
class OrderSessionFacade {
    private final InventoryService inventory = new InventoryService();
    private final PaymentService payment = new PaymentService();
    private final ShippingService shipping = new ShippingService();

    void placeOrder(String item) {
        if (inventory.checkStock(item) && payment.charge(item)) {
            shipping.ship(item);
            System.out.println("Order complete for " + item);
        }
    }
}

public class SessionFacadeDemo {
    public static void main(String[] args) {
        OrderSessionFacade facade = new OrderSessionFacade();
        facade.placeOrder("Laptop"); // ONE call from the client's perspective
    }
}
// OUTPUT:
// Checking stock for Laptop
// Charging for Laptop
// Shipping Laptop
// Order complete for Laptop`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Session Facade vs Plain Facade (GoF)</h3>
Session Facade IS the GoF Facade pattern - the distinction is purely about <strong>context</strong>, not mechanics: the classic Facade pattern simplifies a subsystem for ANY client, while Session Facade specifically addresses reducing <strong>remote call overhead</strong> for presentation-tier clients talking to distributed/remote business objects (historically EJBs). In a modern non-distributed Spring app, a <code>@Service</code> class that coordinates several other services already plays this role without needing the "Session" qualifier.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How is Session Facade different from the GoF Facade pattern?</td><td>It isn't structurally different - it's the same idea specialized for reducing remote-call overhead to distributed business objects (classically EJBs) for presentation-tier clients</td></tr>
<tr class='text-center'><td>What's the main benefit for a remote client?</td><td>Fewer remote round-trips - one call to the facade instead of many calls to fine-grained remote objects</td></tr>
</table>`
              }
            ]
          }
        ]
      }
    ],
    cheatNotes: [
      'DAO - abstracts data access behind an interface; table/entity-centric CRUD',
      'Data Mapper - separate layer moves data between plain objects and DB; domain object stays persistence-unaware (Hibernate/JPA)',
      'Active Record - object knows how to save/find/delete itself; simpler but couples domain to persistence',
      'Unit of Work - batches all pending changes and commits them atomically (Hibernate Session)',
      'Identity Map - one cached object per identity per session, avoids duplicate copies (Hibernate first-level cache)',
      'Business Delegate - hides remote/complex service lookup from presentation-tier clients',
      'Session Facade - coarse-grained facade reducing remote calls for distributed business objects'
    ],
    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'What is the DAO pattern and why is it useful?',
          'How is DAO different from the Repository pattern?',
          'Explain the Data Mapper pattern and how Hibernate implements it.',
          'What is the Active Record pattern, and what is its main drawback?',
          'Compare Active Record and Data Mapper in terms of testability.',
          'What does the Unit of Work pattern do, and how does Hibernate implement it?',
          'What is Hibernate dirty checking, and which pattern enables it?',
          'What problem does the Identity Map pattern solve?',
          'What role does Hibernate\'s first-level cache play as a design pattern?',
          'What is the Business Delegate pattern used for?',
          'How does Session Facade relate to the classic GoF Facade pattern?'
        ]
      }
    ]
  }
];
