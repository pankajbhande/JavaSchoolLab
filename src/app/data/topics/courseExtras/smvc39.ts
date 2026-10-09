// Spring extras, batch smvc39 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc39Extras: Record<string, Extra> = {
    'mvc-proxy-pattern': x(
        ['<b>Proxy pattern</b>: a stand-in object with the same interface as the real one that adds behavior (transactions, security, caching, logging) before or after the call.',
            '<b>Spring uses it everywhere</b>: <code>@Transactional</code>, <code>@Cacheable</code>, <code>@Async</code>, <code>@PreAuthorize</code> and AOP advice all work through proxies.',
            '<b>Two kinds</b>: JDK dynamic proxies (interface based) and CGLIB proxies (subclass based, the Spring Boot default).'],
        ['<b>Self-invocation</b>: calling <code>this.save()</code> inside the same bean skips the proxy, so the annotation has no effect.',
            '<b>Visibility and final</b>: CGLIB cannot override <code>final</code> or private methods, so advice is not applied to them.',
            '<b>Injected bean is the proxy</b>: the object you get from <code>@Autowired</code> is the proxy, and <code>AopUtils.isAopProxy</code> can confirm it.'],
        ['<b>Proxy creation</b>: a <code>BeanPostProcessor</code> (<code>AbstractAutoProxyCreator</code>) wraps matching beans after initialization.',
            '<b>Interceptor chain</b>: each proxied call runs an advice chain, so keep advice cheap and ordered with <code>@Order</code>.',
            '<b>Design choice</b>: for self-invocation use a separate bean, <code>AopContext.currentProxy()</code> or AspectJ weaving.'],
        [['F', 'What is the proxy pattern?', 'An object that controls access to another object and adds behavior around the call while sharing the same interface.'],
            ['F', 'Name an annotation that works through a proxy.', '@Transactional, which opens and commits a transaction around the method.'],
            ['M', 'JDK proxy versus CGLIB?', 'JDK proxies implement the interfaces of the target, while CGLIB generates a subclass; Spring Boot defaults to CGLIB.'],
            ['M', 'Why does @Transactional not work on a method called from the same class?', 'The call does not pass through the proxy, so no advice runs.'],
            ['S', 'How does Spring create proxies?', 'A BeanPostProcessor such as AnnotationAwareAspectJAutoProxyCreator replaces the bean with a proxy after initialization.'],
            ['S', 'How can you fix self-invocation?', 'Move the method to another bean, inject the bean into itself lazily, or use AspectJ weaving.']],
        [['A hand-written logging proxy.',
            r`interface Greeter { String greet(String n); }
class RealGreeter implements Greeter {
    public String greet(String n) { return "Hello " + n; }
}
Greeter real = new RealGreeter();
Greeter proxy = (Greeter) Proxy.newProxyInstance(
    Greeter.class.getClassLoader(), new Class<?>[] {Greeter.class},
    (p, m, args) -> {
        System.out.println("before " + m.getName());
        return m.invoke(real, args);
    });
System.out.println(proxy.greet("Asha"));

// OUTPUT:
// before greet
// Hello Asha`],
            ['Spring proxy is visible at runtime.',
                r`@Service
public class OrderService {
    @Transactional
    public void place() { }
}

@Autowired OrderService service;
System.out.println(AopUtils.isAopProxy(service));
System.out.println(service.getClass().getSimpleName());

// OUTPUT:
// true
// OrderService$$SpringCGLIB$$0`]],
        [['Self-invocation pitfall.',
            r`@Service
public class ReportService {
    public void run() {
        save();                    // this.save(): proxy is bypassed
    }
    @Transactional
    public void save() { }         // no transaction when called from run()
}

// OUTPUT:
// calling run() from a controller: no transaction is opened for save()
// fix: move save() to another bean and inject it`],
            ['Custom timing aspect.',
                r`@Aspect @Component
public class TimingAspect {
    @Around("execution(* com.demo.service..*(..))")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long t = System.nanoTime();
        try { return pjp.proceed(); }
        finally {
            System.out.println(pjp.getSignature().getName() + " took "
                + (System.nanoTime() - t) / 1_000_000 + " ms");
        }
    }
}

// OUTPUT: (varies)
// findAll took 12 ms`]]
    ),

    'mvc-template-method-pattern': x(
        ['<b>Template Method</b>: a base class defines the fixed steps of an algorithm and lets subclasses or callbacks fill in the varying steps.',
            '<b>Spring examples</b>: <code>JdbcTemplate</code>, <code>RestTemplate</code>, <code>TransactionTemplate</code> and <code>JmsTemplate</code> handle the boilerplate and call your code in the middle.',
            '<b>Benefit</b>: resource handling (connections, statements, cleanup) is written once and cannot be forgotten.'],
        ['<b>Callback style</b>: Spring prefers callbacks such as <code>RowMapper</code> over subclassing, so no inheritance is needed.',
            '<b>Hook methods</b>: in <code>AbstractController</code>-style classes and <code>OncePerRequestFilter</code> you override <code>doFilterInternal</code> while the base class runs the skeleton.',
            '<b>Exception translation</b>: templates convert vendor exceptions into the <code>DataAccessException</code> hierarchy.'],
        ['<b>Hollywood principle</b>: the framework calls your code, not the other way around.',
            '<b>Strategy versus template</b>: template method varies steps through inheritance, strategy swaps a whole algorithm through composition.',
            '<b>Thread safety</b>: templates are thread safe, so declare one as a singleton bean and reuse it.'],
        [['F', 'What is the template method pattern?', 'A base class fixes the order of steps of an algorithm and subclasses supply some of the steps.'],
            ['F', 'Give a Spring example.', 'JdbcTemplate opens the connection, runs your query callback and closes the resources.'],
            ['M', 'How does JdbcTemplate follow the pattern?', 'It owns the skeleton (get connection, create statement, execute, map, close) and calls your RowMapper for the varying part.'],
            ['M', 'Template method versus strategy?', 'Template uses inheritance for steps of one algorithm; strategy uses composition to replace the whole algorithm.'],
            ['S', 'Why are Spring templates preferred over raw JDBC?', 'They remove boilerplate, guarantee resource release and translate exceptions.'],
            ['S', 'How do you apply the pattern to your own code?', 'Write an abstract class with a final method that calls abstract hooks, or accept lambdas as callbacks.']],
        [['Classic abstract class.',
            r`abstract class Exporter {
    public final void export() {          // the template: fixed order
        open();
        write();
        close();
    }
    void open()  { System.out.println("open file"); }
    abstract void write();                // hook
    void close() { System.out.println("close file"); }
}
new Exporter() {
    void write() { System.out.println("write csv"); }
}.export();

// OUTPUT:
// open file
// write csv
// close file`],
            ['JdbcTemplate with a callback.',
                r`List<String> names = jdbc.query(
    "select name from student where age > ?",
    (rs, i) -> rs.getString("name"),     // only the varying part
    18);
System.out.println(names);

// OUTPUT:
// [Asha, Ravi]`]],
        [['Overriding a filter hook.',
            r`@Component
public class AuditFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        System.out.println("audit " + req.getRequestURI());
        chain.doFilter(req, res);        // continue the skeleton
    }
}

// OUTPUT:
// audit /students`],
            ['TransactionTemplate.',
                r`Integer id = txTemplate.execute(status -> {
    jdbc.update("insert into log(msg) values (?)", "hi");
    return 1;                             // commit; a RuntimeException rolls back
});
System.out.println(id);

// OUTPUT:
// 1`]]
    ),

    'mvc-repository-pattern': x(
        ['<b>Repository</b>: a collection-like abstraction that hides how domain objects are stored and loaded, so services work with objects, not SQL.',
            '<b>In Spring</b>: annotate an interface or class with <code>@Repository</code>; Spring Data generates the implementation from <code>JpaRepository</code>.',
            '<b>Purpose</b>: one place for persistence code, easy to mock in tests and to swap databases.'],
        ['<b>Query methods</b>: <code>findByEmail</code> and <code>existsByName</code> are derived from the method name.',
            '<b>@Repository effect</b>: it marks the stereotype and enables persistence exception translation to <code>DataAccessException</code>.',
            '<b>Keep it thin</b>: no business rules in repositories; put them in the service layer.'],
        ['<b>Proxy based</b>: Spring Data creates a JDK proxy backed by <code>SimpleJpaRepository</code> and a query lookup strategy.',
            '<b>Testing</b>: use <code>@DataJpaTest</code> for repositories and mock the repository in service tests.',
            '<b>Repository versus DAO</b>: the repository speaks the domain language (aggregates), the DAO speaks tables and rows.'],
        [['F', 'What is a repository?', 'A class or interface that gives collection-like access to stored domain objects.'],
            ['F', 'What does @Repository do?', 'It marks a persistence bean and enables exception translation.'],
            ['M', 'How does Spring Data create the implementation?', 'It builds a proxy backed by SimpleJpaRepository and parses method names into queries.'],
            ['M', 'How do you test a repository?', 'With @DataJpaTest, which starts only JPA components and an embedded database.'],
            ['S', 'Repository versus DAO?', 'Repository works at aggregate level in domain terms; DAO is a lower-level table-oriented gateway.'],
            ['S', 'Why not call repositories from controllers?', 'It leaks persistence into the web layer and skips transaction and business rules in the service.']],
        [['A Spring Data repository.',
            r`public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByCityOrderByNameAsc(String city);
    boolean existsByEmail(String email);
}

repo.save(new Student("Asha", "Pune"));
System.out.println(repo.findByCityOrderByNameAsc("Pune").size());

// OUTPUT:
// 1`],
            ['Custom @Query.',
                r`public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("select o from Order o where o.total > :min")
    List<Order> bigOrders(@Param("min") BigDecimal min);
}
System.out.println(repo.bigOrders(new BigDecimal("500")).size());

// OUTPUT:
// 3`]],
        [['@DataJpaTest.',
            r`@DataJpaTest
class StudentRepositoryTest {
    @Autowired StudentRepository repo;

    @Test
    void findsByCity() {
        repo.save(new Student("Ravi", "Delhi"));
        assertEquals(1, repo.findByCityOrderByNameAsc("Delhi").size());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Mocking in a service test.',
                r`@Mock StudentRepository repo;
@InjectMocks StudentService service;

when(repo.findById(1L)).thenReturn(Optional.of(new Student("Asha", "Pune")));
System.out.println(service.get(1L).getName());

// OUTPUT:
// Asha`]]
    ),

    'mvc-service-layer-pattern': x(
        ['<b>Service layer</b>: a layer of <code>@Service</code> classes between controllers and repositories that holds business logic and transaction boundaries.',
            '<b>Why</b>: controllers stay thin (HTTP only), repositories stay thin (storage only), and logic is reusable and testable.',
            '<b>Flow</b>: controller calls service, service calls repositories and other services, and the result goes back as a DTO or entity.'],
        ['<b>@Transactional</b> belongs on service methods, so several repository calls commit or roll back together.',
            '<b>No web types</b>: a service should not use <code>HttpServletRequest</code> or <code>ResponseEntity</code>.',
            '<b>Constructor injection</b>: inject repositories through the constructor so the class is easy to unit test.'],
        ['<b>Read-only</b>: mark queries <code>@Transactional(readOnly = true)</code> to give the provider a hint.',
            '<b>Exceptions</b>: throw domain exceptions and map them in <code>@ControllerAdvice</code>.',
            '<b>Anemic model risk</b>: if services only forward calls, move rules into the domain objects.'],
        [['F', 'What is the service layer?', 'The layer that holds business logic and sits between controllers and repositories.'],
            ['F', 'Which annotation marks it?', '@Service, a stereotype of @Component.'],
            ['M', 'Where should @Transactional go?', 'On service methods, because a business operation spans several repository calls.'],
            ['M', 'Why keep controllers thin?', 'So HTTP concerns and business rules are separate and the logic is testable without a web server.'],
            ['S', 'How do you test a service?', 'A plain unit test with Mockito mocks for the repositories, plus @SpringBootTest for wiring.'],
            ['S', 'What is a common service layer smell?', 'Transaction scripts that only forward to repositories (anemic), or services using HTTP classes.']],
        [['A service with a transaction.',
            r`@Service
public class TransferService {
    private final AccountRepository repo;
    public TransferService(AccountRepository repo) { this.repo = repo; }

    @Transactional
    public void transfer(long from, long to, BigDecimal amt) {
        Account a = repo.findById(from).orElseThrow();
        Account b = repo.findById(to).orElseThrow();
        a.debit(amt);
        b.credit(amt);                 // both saved or both rolled back
    }
}

// OUTPUT:
// transfer(1, 2, 100): both rows updated in one transaction`],
            ['Thin controller.',
                r`@RestController
@RequestMapping("/transfers")
public class TransferController {
    private final TransferService service;
    public TransferController(TransferService s) { this.service = s; }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody TransferDto d) {
        service.transfer(d.from(), d.to(), d.amount());
        return ResponseEntity.noContent().build();
    }
}

// OUTPUT:
// HTTP/1.1 204 No Content`]],
        [['Rollback demo.',
            r`@Transactional
public void risky() {
    repo.save(new Account("A"));
    throw new IllegalStateException("fail");   // runtime: rolls back
}

// OUTPUT:
// IllegalStateException; the Account row is not stored`],
            ['Service unit test.',
                r`@ExtendWith(MockitoExtension.class)
class TransferServiceTest {
    @Mock AccountRepository repo;
    @InjectMocks TransferService service;

    @Test
    void missingAccountFails() {
        when(repo.findById(1L)).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class,
            () -> service.transfer(1, 2, BigDecimal.TEN));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-dto-pattern-patterns': x(
        ['<b>DTO</b> (Data Transfer Object): a simple object that carries data between layers or over the network, separate from the JPA entity.',
            '<b>Why</b>: it hides internal fields (passwords, ids), avoids lazy-loading surprises and lets the API change without changing the database model.',
            '<b>Java 17</b>: a <code>record</code> is an ideal immutable DTO.'],
        ['<b>Request and response DTOs</b> can differ: the create request has no id, the response has one.',
            '<b>Validation</b>: put <code>@NotBlank</code> and <code>@Email</code> on the request DTO and use <code>@Valid</code> in the controller.',
            '<b>Mapping</b>: convert by hand, with a static factory, or with MapStruct.'],
        ['<b>Jackson</b> serializes records directly with Spring Boot 3.',
            '<b>Over-posting</b>: binding a request straight onto an entity lets a client set fields like <code>role</code>; a DTO prevents it.',
            '<b>Projections</b>: Spring Data interface projections can return DTO-like views straight from a query.'],
        [['F', 'What is a DTO?', 'A plain object that carries data between layers or across the network.'],
            ['F', 'Why not return entities from controllers?', 'It exposes internal fields and can trigger lazy loading or infinite JSON recursion.'],
            ['M', 'How do you validate input with a DTO?', 'Add Bean Validation annotations to the DTO and use @Valid on the controller parameter.'],
            ['M', 'Which tool maps entity to DTO?', 'MapStruct generates mappers at compile time; manual mapping or ModelMapper also work.'],
            ['S', 'What is over-posting?', 'A client sets fields it should not by binding the request onto an entity; a dedicated request DTO prevents it.'],
            ['S', 'DTO versus entity lifecycle?', 'Entities are managed by the persistence context, DTOs are plain and detached, so they are safe to serialize.']],
        [['A record DTO with validation.',
            r`public record StudentRequest(
    @NotBlank String name,
    @Email String email) { }

public record StudentResponse(Long id, String name) { }

@PostMapping("/students")
public StudentResponse add(@Valid @RequestBody StudentRequest req) {
    Student s = repo.save(new Student(req.name(), req.email()));
    return new StudentResponse(s.getId(), s.getName());
}

// OUTPUT:
// {"id":1,"name":"Asha"}`],
            ['Mapper method.',
                r`public final class StudentMapper {
    private StudentMapper() { }
    public static StudentResponse toResponse(Student s) {
        return new StudentResponse(s.getId(), s.getName());
    }
}
System.out.println(StudentMapper.toResponse(new Student(5L, "Ravi")));

// OUTPUT:
// StudentResponse[id=5, name=Ravi]`]],
        [['Validation failure.',
            r`// POST /students  {"name":"","email":"bad"}
// MethodArgumentNotValidException is thrown before the method runs

// OUTPUT:
// HTTP/1.1 400 Bad Request
// {"errors":["name must not be blank","email must be valid"]}`],
            ['MockMvc test of the response shape.',
                r`mockMvc.perform(get("/students/1"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.name").value("Asha"))
    .andExpect(jsonPath("$.password").doesNotExist());

// OUTPUT:
// Status = 200, no password field in the body`]]
    ),

    'mvc-dao-pattern-patterns': x(
        ['<b>DAO</b> (Data Access Object): a class that holds all database access code for one entity or table, behind an interface.',
            '<b>Purpose</b>: separate persistence from business logic so the storage technology can change.',
            '<b>In Spring</b>: a DAO is a <code>@Repository</code> bean that uses <code>JdbcTemplate</code>, <code>EntityManager</code> or Spring Data.'],
        ['<b>Interface plus implementation</b>: <code>StudentDao</code> and <code>JdbcStudentDao</code>, so tests can use a fake.',
            '<b>Exception translation</b>: <code>@Repository</code> turns SQL exceptions into <code>DataAccessException</code> subclasses.',
            '<b>CRUD methods</b>: <code>findById</code>, <code>findAll</code>, <code>save</code>, <code>update</code> and <code>delete</code>.'],
        ['<b>Closer to storage</b>: DAO methods map to tables and statements, while repositories map to aggregates.',
            '<b>Parameters</b>: always use bind variables, never string concatenation, to prevent SQL injection.',
            '<b>Transactions</b>: DAOs join the transaction started by the service layer.'],
        [['F', 'What is a DAO?', 'An object that encapsulates all database access for an entity.'],
            ['F', 'Why use an interface?', 'To hide the technology and allow a mock or in-memory version in tests.'],
            ['M', 'What does @Repository add to a DAO?', 'Component scanning and persistence exception translation.'],
            ['M', 'How do you avoid SQL injection in a DAO?', 'Use PreparedStatement or JdbcTemplate placeholders instead of concatenating input.'],
            ['S', 'DAO versus Spring Data repository?', 'A DAO is hand-written and table oriented; Spring Data generates the implementation from an interface.'],
            ['S', 'Where do transactions start?', 'In the service layer, so several DAO calls share one transaction.']],
        [['JdbcTemplate DAO.',
            r`public interface StudentDao {
    Optional<Student> findById(long id);
    int save(Student s);
}

@Repository
public class JdbcStudentDao implements StudentDao {
    private final JdbcTemplate jdbc;
    public JdbcStudentDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Optional<Student> findById(long id) {
        return jdbc.query("select id, name from student where id = ?",
            (rs, i) -> new Student(rs.getLong("id"), rs.getString("name")),
            id).stream().findFirst();
    }
    public int save(Student s) {
        return jdbc.update("insert into student(name) values (?)", s.getName());
    }
}

// OUTPUT:
// save returns 1; findById(1) returns Optional[Student{id=1, name=Asha}]`],
            ['Using the DAO from a service.',
                r`@Service
public class StudentService {
    private final StudentDao dao;
    public StudentService(StudentDao dao) { this.dao = dao; }

    @Transactional(readOnly = true)
    public Student get(long id) {
        return dao.findById(id).orElseThrow(
            () -> new NoSuchElementException("student " + id));
    }
}

// OUTPUT:
// get(99) throws NoSuchElementException: student 99`]],
        [['SQL injection mistake.',
            r`// WRONG: input is concatenated into SQL
// jdbc.queryForList("select * from student where name = '" + name + "'");
// RIGHT: bind variable
jdbc.queryForList("select * from student where name = ?", name);

// OUTPUT:
// name = "x' or '1'='1" returns no rows with the bind variable`],
            ['Testing with @JdbcTest.',
                r`@JdbcTest
@Import(JdbcStudentDao.class)
class JdbcStudentDaoTest {
    @Autowired JdbcStudentDao dao;

    @Test
    void saves() { assertEquals(1, dao.save(new Student(null, "Asha"))); }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-prg-pattern': x(
        ['<b>PRG</b> (Post-Redirect-Get): after a successful form POST, the server answers with a redirect and the browser then loads the result with a GET.',
            '<b>Problem solved</b>: refreshing the page after a POST would resubmit the form and, for example, create a duplicate order.',
            '<b>In Spring MVC</b>: return <code>redirect:/orders/5</code> from the controller method.'],
        ['<b>Status code</b>: the redirect is normally 302 (or 303 See Other); the browser then issues a GET.',
            '<b>Flash attributes</b>: <code>RedirectAttributes.addFlashAttribute</code> keeps a message across the redirect without putting it in the URL.',
            '<b>Validation errors</b>: on errors, return the view directly (no redirect) so the form shows the messages.'],
        ['<b>How flash works</b>: <code>FlashMapManager</code> stores attributes in the session and removes them after the next request.',
            '<b>URL attributes</b>: <code>addAttribute</code> appends values to the redirect URL as query parameters.',
            '<b>REST APIs</b> do not need PRG, they return 201 with a <code>Location</code> header instead.'],
        [['F', 'What does PRG stand for?', 'Post-Redirect-Get.'],
            ['F', 'What problem does it solve?', 'Duplicate form submission when the user refreshes after a POST.'],
            ['M', 'How do you redirect in Spring MVC?', 'Return the view name redirect:/path or a RedirectView from the controller.'],
            ['M', 'How do you show a success message after redirect?', 'Use RedirectAttributes.addFlashAttribute and read it in the next view.'],
            ['S', 'How are flash attributes stored?', 'FlashMapManager keeps them in the HTTP session until the following request consumes them.'],
            ['S', 'Should a failed validation redirect?', 'No, return the form view directly so BindingResult errors are still available.']],
        [['Basic PRG controller.',
            r`@PostMapping("/orders")
public String create(@Valid OrderForm form, BindingResult br,
        RedirectAttributes ra) {
    if (br.hasErrors()) return "order-form";          // no redirect on errors
    Order o = service.place(form);
    ra.addFlashAttribute("msg", "Order placed");
    return "redirect:/orders/" + o.getId();           // 302 then GET
}

@GetMapping("/orders/{id}")
public String show(@PathVariable long id, Model m) {
    m.addAttribute("order", service.get(id));
    return "order-detail";
}

// OUTPUT:
// POST /orders -> 302 Location: /orders/5
// GET /orders/5 -> 200 (refresh now only repeats the GET)`],
            ['Query parameter with redirect.',
                r`@PostMapping("/search")
public String search(String q, RedirectAttributes ra) {
    ra.addAttribute("q", q);
    return "redirect:/results";
}

// OUTPUT:
// POST /search (q=spring) -> 302 Location: /results?q=spring`]],
        [['MockMvc test of the redirect.',
            r`mockMvc.perform(post("/orders").param("item", "pen"))
    .andExpect(status().is3xxRedirection())
    .andExpect(redirectedUrlPattern("/orders/*"))
    .andExpect(flash().attribute("msg", "Order placed"));

// OUTPUT:
// Status = 302, Redirected URL = /orders/5`],
            ['Forgotten redirect.',
                r`@PostMapping("/orders")
public String badCreate(OrderForm f) {
    service.place(f);
    return "order-detail";     // WRONG: refresh re-posts and duplicates
}

// OUTPUT:
// pressing F5 in the browser asks to resubmit and creates a second order`]]
    ),

    'mvc-mvc-performance': x(
        ['<b>Measure first</b>: use Actuator metrics (<code>http.server.requests</code>), logs and a profiler before changing anything.',
            '<b>Common hot spots</b>: slow database queries, N+1 selects, big responses, blocking calls and too little caching.',
            '<b>Layers to tune</b>: the web server (threads), the Spring MVC code, the database and the network.'],
        ['<b>Thread pool</b>: Tomcat handles one request per thread, so tune <code>server.tomcat.threads.max</code> to match load.',
            '<b>Compression</b>: <code>server.compression.enabled=true</code> shrinks JSON and HTML responses.',
            '<b>Caching</b>: use <code>@Cacheable</code> for read-heavy data and HTTP caching headers for static content.'],
        ['<b>Virtual threads</b>: Spring Boot 3.2 with Java 21 can enable <code>spring.threads.virtual.enabled=true</code> for blocking-heavy apps.',
            '<b>Pagination</b>: never return unbounded lists; use <code>Pageable</code>.',
            '<b>Load test</b>: verify with a tool such as JMeter or Gatling, and compare p95 and p99 latency, not only the average.'],
        [['F', 'How do you find out why an MVC app is slow?', 'Measure with metrics, logs and a profiler, then fix the biggest bottleneck.'],
            ['F', 'Name two quick wins.', 'Enable compression and cache read-heavy data.'],
            ['M', 'What limits concurrency in Tomcat?', 'The worker thread pool size and the connection pool behind it.'],
            ['M', 'Why paginate?', 'It bounds memory, database load and response size.'],
            ['S', 'When do virtual threads help?', 'For blocking I/O workloads with many concurrent requests; they do not speed CPU-bound work.'],
            ['S', 'Why look at p99 latency?', 'Averages hide the slow tail that real users notice.']],
        [['Enable metrics.',
            r`# application.properties
management.endpoints.web.exposure.include=health,metrics
server.compression.enabled=true
server.tomcat.threads.max=200

# OUTPUT:
# GET /actuator/metrics/http.server.requests ->
# {"name":"http.server.requests","measurements":[{"statistic":"COUNT","value":42.0}]}`],
            ['Caching a method.',
                r`@Service
public class CountryService {
    @Cacheable("countries")
    public List<Country> all() {
        System.out.println("loading from database");
        return repo.findAll();
    }
}
service.all();
service.all();

// OUTPUT:
// loading from database`]],
        [['Pagination.',
            r`@GetMapping("/students")
public Page<StudentResponse> list(
        @PageableDefault(size = 20) Pageable pageable) {
    return repo.findAll(pageable).map(StudentMapper::toResponse);
}

// OUTPUT:
// GET /students?page=0&size=20 returns at most 20 items plus totalElements`],
            ['Timing a request in a filter.',
                r`@Component
public class TimingFilter extends OncePerRequestFilter {
    protected void doFilterInternal(HttpServletRequest rq,
            HttpServletResponse rs, FilterChain c)
            throws ServletException, IOException {
        long t = System.nanoTime();
        c.doFilter(rq, rs);
        System.out.println(rq.getRequestURI() + " "
            + (System.nanoTime() - t) / 1_000_000 + " ms");
    }
}

// OUTPUT: (varies)
// /students 14 ms`]]
    ),

    'mvc-request-processing-optimization': x(
        ['<b>Request path</b>: <code>DispatcherServlet</code> runs filters, handler mapping, interceptors, argument resolvers, the controller and message converters; each step costs time.',
            '<b>Keep it short</b>: do little in filters and interceptors, and keep controllers thin.',
            '<b>Do work once</b>: avoid repeated parsing, repeated lookups and repeated serialization.'],
        ['<b>Async</b>: return <code>Callable</code>, <code>DeferredResult</code> or <code>CompletableFuture</code> to free the container thread during slow work.',
            '<b>Return less</b>: use DTOs or <code>@JsonView</code> to serialize only the needed fields.',
            '<b>Conditional GET</b>: ETag and <code>If-None-Match</code> let the server answer 304 without a body.'],
        ['<b>Message converters</b>: Jackson is fast, but reuse the auto-configured <code>ObjectMapper</code>, never create one per request.',
            '<b>Interceptors versus filters</b>: filters run for every servlet request, so put heavy logic only where needed.',
            '<b>Streaming</b>: for large files use <code>StreamingResponseBody</code> or <code>Resource</code> instead of loading a byte array.'],
        [['F', 'What part of Spring handles every request first?', 'The DispatcherServlet.'],
            ['F', 'Why keep controllers thin?', 'Less work per request, easier testing and no hidden slowness.'],
            ['M', 'What does returning Callable do?', 'The request is processed on another thread and the container thread is released.'],
            ['M', 'How do ETags save time?', 'If the content is unchanged the server returns 304 and no body.'],
            ['S', 'Why not create an ObjectMapper per request?', 'It is expensive to build and caches serializers; share one bean.'],
            ['S', 'How do you send a very large response?', 'Stream it with StreamingResponseBody so it is not held fully in memory.']],
        [['Async controller.',
            r`@GetMapping("/report")
public Callable<String> report() {
    return () -> {
        Thread.sleep(2000);               // slow work off the container thread
        return "report ready";
    };
}

// OUTPUT:
// GET /report -> (after about 2 s) 200 report ready`],
            ['ETag support.',
                r`@GetMapping("/products/{id}")
public ResponseEntity<Product> get(@PathVariable long id) {
    Product p = service.get(id);
    return ResponseEntity.ok()
        .eTag("\"" + p.getVersion() + "\"")
        .body(p);
}

// OUTPUT:
// first call: 200 ETag: "3"
// call with If-None-Match: "3" -> 304 Not Modified`]],
        [['Streaming a large file.',
            r`@GetMapping("/export")
public StreamingResponseBody export() {
    return out -> {
        for (int i = 0; i < 100_000; i++) {
            out.write((i + "\n").getBytes(StandardCharsets.UTF_8));
        }
    };
}

// OUTPUT:
// response starts immediately; memory use stays flat`],
            ['Interceptor that skips static paths.',
                r`@Override
public void addInterceptors(InterceptorRegistry reg) {
    reg.addInterceptor(new AuditInterceptor())
       .addPathPatterns("/api/**")
       .excludePathPatterns("/api/health");
}

// OUTPUT:
// /api/orders runs the interceptor; /api/health does not`]]
    ),

    'mvc-database-optimization': x(
        ['<b>Biggest cost</b>: in most MVC apps the database is the slowest part, so tune queries before tuning Java code.',
            '<b>N+1 problem</b>: loading a list and then one query per row; fix it with <code>JOIN FETCH</code> or <code>@EntityGraph</code>.',
            '<b>Connection pool</b>: Spring Boot uses HikariCP; size it so threads do not wait or overload the database.'],
        ['<b>Indexes</b>: add them on columns used in <code>where</code>, <code>join</code> and <code>order by</code>, and check with <code>EXPLAIN</code>.',
            '<b>Projections and pagination</b>: select only needed columns and never load whole tables.',
            '<b>Batching</b>: set <code>spring.jpa.properties.hibernate.jdbc.batch_size</code> for bulk inserts.'],
        ['<b>Open Session in View</b>: enabled by default, it keeps a connection through view rendering; set <code>spring.jpa.open-in-view=false</code> for busy APIs.',
            '<b>Transactions</b>: keep them short and use <code>readOnly = true</code> for queries.',
            '<b>Second-level cache</b> and <code>@Cacheable</code> reduce repeated reads, but add invalidation work.'],
        [['F', 'What is the N+1 problem?', 'One query loads N parents and then N extra queries load their children.'],
            ['F', 'Which pool does Spring Boot use?', 'HikariCP by default.'],
            ['M', 'How do you fix N+1 in JPA?', 'Use JOIN FETCH, @EntityGraph or batch fetching.'],
            ['M', 'How do you see the SQL that runs?', 'Set spring.jpa.show-sql or the org.hibernate.SQL log level, and use EXPLAIN in the database.'],
            ['S', 'What is a good pool size?', 'Small; a few connections per CPU core of the database, found by load testing, not a huge number.'],
            ['S', 'Why disable open-in-view?', 'It holds a connection during rendering and hides lazy loading in the web layer.']],
        [['N+1 and its fix.',
            r`public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("select o from Order o join fetch o.items")
    List<Order> findAllWithItems();           // one query instead of N+1

    @EntityGraph(attributePaths = "items")
    List<Order> findByStatus(String status);
}

// OUTPUT:
// select o.*, i.* from orders o join item i on i.order_id = o.id
// (1 statement instead of 101)`],
            ['Pool and batch settings.',
                r`# application.properties
spring.datasource.hikari.maximum-pool-size=10
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.jdbc.batch_size=50
logging.level.org.hibernate.SQL=debug

# OUTPUT:
# HikariPool-1 - Start completed.`]],
        [['DTO projection.',
            r`public interface StudentView {
    Long getId();
    String getName();
}
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<StudentView> findByCity(String city);   // selects only id and name
}

// OUTPUT:
// select s.id, s.name from student s where s.city=?`],
            ['Counting queries in a test.',
                r`@DataJpaTest
class QueryCountTest {
    @Autowired OrderRepository repo;
    @Test
    void loadsItemsWithOneQuery() {
        repo.findAllWithItems().forEach(o -> o.getItems().size());
        // assert the SQL statement count with a datasource proxy or Hibernate Statistics
    }
}

// OUTPUT:
// Hibernate statistics: 1 query executed`]]
    )
};

export const smvc39Deep: Record<string, Deep> = {
    'mvc-proxy-pattern': dv(
        [`<p>Spring wraps beans in proxies after they are created.</p><ul><li><b>Creation:</b> a <code>BeanPostProcessor</code> checks whether any advisor (transaction, cache, aspect) matches the bean and, if so, returns a proxy.</li><li><b>JDK proxy:</b> built with <code>java.lang.reflect.Proxy</code> for interfaces.</li><li><b>CGLIB proxy:</b> a generated subclass; the default since Spring Boot 2 (<code>spring.aop.proxy-target-class=true</code>).</li><li><b>Call path:</b> proxy, then advice chain (interceptors), then the target method.</li></ul>`,
            r`@Autowired ApplicationContext ctx;

Object bean = ctx.getBean(OrderService.class);
System.out.println(AopUtils.isAopProxy(bean));
System.out.println(AopUtils.isCglibProxy(bean));
System.out.println(AopProxyUtils.ultimateTargetClass(bean).getSimpleName());

// OUTPUT:
// true
// true
// OrderService`],
        [`<p>Proxy options and variants:</p><ul><li><b>@EnableAspectJAutoProxy(proxyTargetClass = true):</b> force CGLIB.</li><li><b>@Scope(proxyMode = TARGET_CLASS):</b> a scoped proxy so a singleton can hold a request or session bean.</li><li><b>@Lazy on an injection point:</b> injects a lazy-resolving proxy.</li><li><b>ProxyFactory:</b> build a proxy programmatically.</li><li><b>AspectJ weaving:</b> no proxy, bytecode is changed, so self-invocation works.</li></ul>`,
            r`@Component
@Scope(value = WebApplicationContext.SCOPE_REQUEST,
       proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentUser {
    private String name;
    public String getName() { return name; }
}

ProxyFactory pf = new ProxyFactory(new RealGreeter());
pf.addAdvice((MethodInterceptor) inv -> "[" + inv.proceed() + "]");
Greeter g = (Greeter) pf.getProxy();
System.out.println(g.greet("Asha"));

// OUTPUT:
// [Hello Asha]`],
        [`<p>Common mistakes:</p><ul><li><b>Self-invocation:</b> <code>this.method()</code> bypasses advice; move the method to another bean.</li><li><b>final classes or methods:</b> CGLIB cannot proxy them.</li><li><b>Private methods:</b> advice is not applied.</li><li><b>new instead of injection:</b> <code>new OrderService()</code> has no proxy at all.</li><li><b>Injecting the concrete class with JDK proxies:</b> causes a cast failure; inject the interface or use CGLIB.</li></ul>`,
            r`@Service
public class A {
    @Autowired @Lazy A self;                 // proxy of itself

    public void outer() { self.inner(); }    // goes through the proxy
    @Transactional
    public void inner() { }
}

// OUTPUT:
// inner() now runs inside a transaction when called from outer()`],
        [`<p>Performance notes:</p><ul><li>A proxied call adds a small cost (an advice chain walk), usually microseconds.</li><li>Many aspects on one bean multiply that cost, so use narrow pointcuts.</li><li>Startup: proxy class generation happens once per bean type.</li><li>Prefer <code>@Around</code> only when you need it; <code>@Before</code> is cheaper to reason about.</li></ul>`,
            r`@Aspect @Component
public class SlowAspect {
    // narrow pointcut: only service methods, not every bean
    @Around("within(com.demo.service..*) && @annotation(Timed)")
    public Object around(ProceedingJoinPoint p) throws Throwable {
        return p.proceed();
    }
}

// OUTPUT:
// only methods annotated with @Timed in the service package are advised`],
        [`<p>Real-world: a payment service needs a transaction, an audit log and a rate limit. Instead of putting that into the method, each concern is a separate advisor, and the proxy chain applies them in order, leaving the method with business code only.</p>`,
            r`@Service
public class PaymentService {
    @Transactional
    @Audited
    @RateLimited(perMinute = 60)
    public Receipt pay(PaymentRequest req) {
        return gateway.charge(req);          // business code only
    }
}

// OUTPUT:
// call chain: RateLimitAdvice -> AuditAdvice -> TransactionInterceptor -> pay()`]
    ),

    'mvc-template-method-pattern': dv(
        [`<p>The pattern inverts control: the framework owns the algorithm and you supply the variable steps.</p><ul><li><b>JdbcTemplate.query:</b> gets a connection from <code>DataSourceUtils</code>, creates a <code>PreparedStatement</code>, runs it, maps rows through the <code>RowMapper</code> and always releases resources.</li><li><b>Errors:</b> <code>SQLException</code> is translated by <code>SQLExceptionTranslator</code>.</li><li><b>Transactions:</b> the connection is the one bound to the current transaction.</li></ul>`,
            r`// simplified idea of what JdbcTemplate.query does
<T> List<T> query(String sql, RowMapper<T> mapper, Object... args) {
    Connection con = DataSourceUtils.getConnection(ds);
    try (PreparedStatement ps = con.prepareStatement(sql)) {
        setArgs(ps, args);
        try (ResultSet rs = ps.executeQuery()) {
            List<T> out = new ArrayList<>();
            int i = 0;
            while (rs.next()) out.add(mapper.mapRow(rs, i++));   // your step
            return out;
        }
    } catch (SQLException e) {
        throw translate(e);
    } finally {
        DataSourceUtils.releaseConnection(con, ds);
    }
}

// OUTPUT:
// the framework runs the skeleton; only mapRow is user code`],
        [`<p>Variants of the pattern:</p><ul><li><b>Abstract class with final template method:</b> subclasses override hooks.</li><li><b>Callback interfaces:</b> <code>RowMapper</code>, <code>PreparedStatementCreator</code>, <code>TransactionCallback</code>.</li><li><b>Lambdas:</b> functional callbacks need no subclass.</li><li><b>Hook with default:</b> optional steps have empty default bodies.</li></ul>`,
            r`abstract class ReportJob {
    public final void run() {
        load();
        if (shouldFilter()) filter();    // optional hook
        publish();
    }
    abstract void load();
    void filter() { }
    boolean shouldFilter() { return false; }   // default hook
    abstract void publish();
}

// OUTPUT:
// run() always executes load then publish; filter only if the hook says so`],
        [`<p>Common mistakes:</p><ul><li><b>Template method not final:</b> a subclass can break the order.</li><li><b>Too many hooks:</b> the base class becomes hard to understand; prefer callbacks.</li><li><b>Deep inheritance:</b> hard to follow; compose with strategy instead.</li><li><b>Swallowing exceptions in callbacks:</b> the template cannot clean up properly if you hide them.</li><li><b>Creating a new template per call:</b> create it once as a bean.</li></ul>`,
            r`// WRONG: new template on every request
// new JdbcTemplate(dataSource).query(...)

@Configuration
class DbConfig {
    @Bean JdbcTemplate jdbcTemplate(DataSource ds) {
        return new JdbcTemplate(ds);          // single shared, thread-safe bean
    }
}

// OUTPUT:
// one JdbcTemplate instance is reused for all requests`],
        [`<p>Performance notes:</p><ul><li>Templates add little overhead; the cost is the SQL or remote call.</li><li><code>JdbcTemplate.batchUpdate</code> sends many rows in one round trip.</li><li><code>setFetchSize</code> controls how many rows the driver loads at once for big queries.</li><li><code>RestTemplate</code> should share a pooled HTTP client with timeouts.</li></ul>`,
            r`jdbc.batchUpdate("insert into log(msg) values (?)",
    List.of("a", "b", "c"), 100,
    (ps, msg) -> ps.setString(1, msg));
jdbc.setFetchSize(500);

// OUTPUT:
// 3 rows inserted with a single batch round trip`],
        [`<p>Real-world: a company needs to import files from three sources (CSV, XML, API). The import steps are the same (open, parse, validate, store, report). One abstract <code>Importer</code> holds the flow and each source overrides only <code>parse</code>.</p>`,
            r`public abstract class Importer {
    public final ImportResult run(String source) {
        String raw = read(source);
        List<Record> rows = parse(raw);        // varies by source
        rows.removeIf(r -> !valid(r));
        store(rows);
        return new ImportResult(rows.size());
    }
    protected abstract List<Record> parse(String raw);
    // read, valid, store implemented once here
}

// OUTPUT:
// CsvImporter.run("a.csv") -> ImportResult[count=120]`]
    ),

    'mvc-repository-pattern': dv(
        [`<p>How Spring Data repositories work:</p><ul><li><b>Scanning:</b> <code>@EnableJpaRepositories</code> (auto-configured in Boot) finds interfaces extending <code>Repository</code>.</li><li><b>Proxy:</b> a <code>JpaRepositoryFactory</code> creates a JDK proxy backed by <code>SimpleJpaRepository</code>.</li><li><b>Query methods:</b> <code>PartTree</code> parses names like <code>findByCityAndAge</code> into JPQL criteria at startup.</li><li><b>Translation:</b> a <code>PersistenceExceptionTranslationInterceptor</code> converts exceptions.</li></ul>`,
            r`System.out.println(AopUtils.isJdkDynamicProxy(studentRepository));
System.out.println(AopProxyUtils.ultimateTargetClass(studentRepository)
    .getSimpleName());

// OUTPUT:
// true
// SimpleJpaRepository`],
        [`<p>Syntax and variants:</p><ul><li><b>CrudRepository:</b> basic CRUD.</li><li><b>JpaRepository:</b> adds flush, batch delete and paging.</li><li><b>PagingAndSortingRepository:</b> paging and sorting only.</li><li><b>Query keywords:</b> <code>And</code>, <code>Or</code>, <code>Between</code>, <code>Like</code>, <code>OrderBy</code>, <code>Top</code>.</li><li><b>@Query</b> with JPQL or native SQL, and <b>Specification</b> for dynamic filters.</li></ul>`,
            r`public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findTop3ByAuthorOrderByPriceDesc(String author);
    Page<Book> findByTitleContainingIgnoreCase(String t, Pageable p);
    @Query(value = "select * from book where price < ?1", nativeQuery = true)
    List<Book> cheap(BigDecimal max);
    @Modifying @Transactional
    @Query("update Book b set b.price = b.price * 1.1 where b.author = :a")
    int raisePrice(@Param("a") String author);
}

// OUTPUT:
// raisePrice("Rao") returns the number of updated rows, for example 4`],
        [`<p>Common mistakes:</p><ul><li><b>Business logic in the repository:</b> keep it in services.</li><li><b>Misspelled property in a method name:</b> the app fails at startup with <code>PropertyReferenceException</code>.</li><li><b>Returning entities with lazy collections to the web layer:</b> use DTOs.</li><li><b>Missing @Modifying</b> on update queries.</li><li><b>findAll() on large tables:</b> use paging.</li></ul>`,
            r`// WRONG: property name does not exist
// List<Student> findByCityName(String c);
// -> PropertyReferenceException: No property 'cityName' found

// RIGHT
List<Student> findByCity(String c);

// OUTPUT:
// application starts; the query is validated at startup`],
        [`<p>Performance notes:</p><ul><li>Use <b>projections</b> to fetch only needed columns.</li><li>Use <b>pagination</b> or a <code>Slice</code> to avoid count queries.</li><li>Avoid N+1 with <code>@EntityGraph</code>.</li><li>Use <code>saveAll</code> with batch size for bulk writes.</li><li>Use <code>existsBy</code> instead of loading an entity just to check.</li></ul>`,
            r`boolean taken = repo.existsByEmail("a@x.com");        // select 1 ... limit 1
Slice<Student> page = repo.findByCity("Pune", PageRequest.of(0, 20));
System.out.println(taken + " " + page.hasNext());

// OUTPUT:
// false true`],
        [`<p>Real-world: an e-commerce app keeps <code>OrderRepository</code>, <code>CustomerRepository</code> and <code>ProductRepository</code>. The service places an order by loading the customer and products, building the aggregate and saving it once. Tests swap the repositories for mocks or an in-memory database.</p>`,
            r`@Transactional
public Long place(Long customerId, List<Long> productIds) {
    Customer c = customers.getReferenceById(customerId);
    List<Product> ps = products.findAllById(productIds);
    return orders.save(new Order(c, ps)).getId();
}

// OUTPUT:
// place(7, [1, 2, 3]) returns 1001`]
    ),

    'mvc-service-layer-pattern': dv(
        [`<p>How the service layer works inside Spring:</p><ul><li><code>@Service</code> classes are singleton beans found by component scanning.</li><li>If a method has <code>@Transactional</code>, the bean is wrapped in a proxy with a <code>TransactionInterceptor</code>.</li><li>The interceptor asks the <code>PlatformTransactionManager</code> to begin, then commits or rolls back (runtime exceptions roll back by default).</li><li>Repositories called inside join the same transaction through the thread-bound resources.</li></ul>`,
            r`@Service
public class OrderService {
    @Transactional
    public void place() {
        System.out.println(TransactionSynchronizationManager
            .isActualTransactionActive());
    }
}

// OUTPUT:
// true`],
        [`<p>Options and variants:</p><ul><li><b>@Transactional attributes:</b> <code>readOnly</code>, <code>propagation</code>, <code>isolation</code>, <code>rollbackFor</code>, <code>timeout</code>.</li><li><b>Interface plus implementation</b> when you need several implementations.</li><li><b>Facade services</b> that combine several services for a use case.</li><li><b>Domain events</b> through <code>ApplicationEventPublisher</code> to decouple side effects.</li></ul>`,
            r`@Transactional(rollbackFor = Exception.class, timeout = 5)
public void importFile(Path p) throws IOException { }

@Transactional(propagation = Propagation.REQUIRES_NEW)
public void writeAudit(String msg) { }       // separate transaction

@Transactional(readOnly = true)
public List<Order> recent() { return repo.findTop10ByOrderByIdDesc(); }

// OUTPUT:
// checked IOException now rolls back; audit is committed even if the caller rolls back`],
        [`<p>Common mistakes:</p><ul><li><b>@Transactional on a private or self-invoked method:</b> no effect.</li><li><b>Checked exceptions:</b> they do not roll back unless <code>rollbackFor</code> is set.</li><li><b>Catching exceptions inside:</b> the transaction commits because nothing was thrown.</li><li><b>Transaction in the controller:</b> too broad; keep it in the service.</li><li><b>Field injection:</b> use the constructor.</li></ul>`,
            r`@Transactional
public void bad() {
    try {
        repo.save(new Order());
        throw new RuntimeException("boom");
    } catch (RuntimeException e) {
        log.warn("ignored", e);        // swallowed: the order IS committed
    }
}

// OUTPUT:
// the order row is saved although an error occurred; rethrow to roll back`],
        [`<p>Performance notes:</p><ul><li>Keep transactions short; do not call remote services inside them.</li><li>Use <code>readOnly = true</code> for queries.</li><li>Avoid loading entities you only need to count or check.</li><li>Cache stable lookups with <code>@Cacheable</code>.</li><li>Move slow side effects (email) to <code>@Async</code> or events after commit.</li></ul>`,
            r`@Transactional
public void register(User u) {
    repo.save(u);
    events.publishEvent(new UserRegistered(u.getEmail()));
}

@Async
@TransactionalEventListener            // runs only after a successful commit
void sendMail(UserRegistered e) { mail.send(e.email()); }

// OUTPUT:
// the email is sent after the commit, outside the database transaction`],
        [`<p>Real-world: a bank transfer service debits one account, credits another and writes a ledger entry. All three succeed or none do. The controller only converts HTTP to a call and the result to a response.</p>`,
            r`@Transactional
public TransferResult transfer(long from, long to, BigDecimal amt) {
    Account a = accounts.findByIdForUpdate(from).orElseThrow();
    Account b = accounts.findByIdForUpdate(to).orElseThrow();
    if (a.getBalance().compareTo(amt) < 0) {
        throw new InsufficientFundsException(from);
    }
    a.debit(amt);
    b.credit(amt);
    ledger.save(new LedgerEntry(from, to, amt));
    return new TransferResult("OK");
}

// OUTPUT:
// transfer(1, 2, 500): TransferResult[status=OK]`]
    ),

    'mvc-dto-pattern-patterns': dv(
        [`<p>DTOs sit at the boundary of the application.</p><ul><li><b>Inbound:</b> an <code>HttpMessageConverter</code> (Jackson) reads the body into the DTO; <code>@Valid</code> triggers validation before the method runs.</li><li><b>Service:</b> maps the DTO to an entity (or domain object).</li><li><b>Outbound:</b> maps the entity to a response DTO that Jackson writes as JSON.</li></ul>`,
            r`public record ProductRequest(
    @NotBlank String name,
    @Positive BigDecimal price) { }

@PostMapping("/products")
public ResponseEntity<ProductResponse> add(
        @Valid @RequestBody ProductRequest req) {
    Product p = service.create(req);
    return ResponseEntity.created(URI.create("/products/" + p.getId()))
        .body(new ProductResponse(p.getId(), p.getName()));
}

// OUTPUT:
// HTTP/1.1 201 Created
// Location: /products/9
// {"id":9,"name":"Pen"}`],
        [`<p>Mapping options:</p><ul><li><b>Manual mapping:</b> simple and explicit, good for small projects.</li><li><b>MapStruct:</b> an annotation processor that generates fast, type-safe mappers.</li><li><b>ModelMapper:</b> reflection based, less code but errors appear at runtime.</li><li><b>Spring Data projections:</b> interface or class based, selected directly in the query.</li><li><b>@JsonView / @JsonIgnore:</b> filter fields without a second class (less flexible).</li></ul>`,
            r`@Mapper(componentModel = "spring")
public interface ProductMapper {
    ProductResponse toResponse(Product p);
    @Mapping(target = "id", ignore = true)
    Product toEntity(ProductRequest req);
}

// OUTPUT:
// generated ProductMapperImpl is a Spring bean; no reflection at runtime`],
        [`<p>Common mistakes:</p><ul><li><b>Returning entities:</b> leaks fields and causes lazy-loading or recursion errors.</li><li><b>One DTO for everything:</b> the same class for create, update and response makes optional fields confusing.</li><li><b>Forgetting @Valid:</b> the annotations on the DTO are never checked.</li><li><b>Mapping inside the controller:</b> push it to a mapper or service.</li><li><b>Mutable DTO with setters everywhere:</b> prefer records.</li></ul>`,
            r`// WRONG: entity returned, password and lazy orders are exposed
// @GetMapping("/{id}") public User get(@PathVariable long id) { ... }

// RIGHT
@GetMapping("/{id}")
public UserResponse get(@PathVariable long id) {
    return UserMapper.toResponse(service.get(id));
}

// OUTPUT:
// {"id":3,"name":"Asha"}   (no password, no orders)`],
        [`<p>Performance notes:</p><ul><li>Fetch DTOs directly with a projection to avoid loading full entities.</li><li>Small response DTOs mean smaller JSON and faster serialization.</li><li>MapStruct has near-zero runtime cost, reflection mappers are slower.</li><li>Do not map large collections eagerly if you can page them.</li></ul>`,
            r`public record StudentSummary(Long id, String name) { }

@Query("select new com.demo.dto.StudentSummary(s.id, s.name) "
     + "from Student s where s.city = :city")
List<StudentSummary> summaries(@Param("city") String city);

// OUTPUT:
// select s.id, s.name from student s where s.city=?   (no full entity loaded)`],
        [`<p>Real-world: a mobile app needs a list screen (id, title) and a detail screen (all fields). Two DTOs (<code>BookSummary</code> and <code>BookDetail</code>) serve them, and the entity can change columns without breaking the app.</p>`,
            r`public record BookSummary(Long id, String title) { }
public record BookDetail(Long id, String title, String author,
                         BigDecimal price, List<String> tags) { }

@GetMapping("/books")
public List<BookSummary> list() { return service.summaries(); }

@GetMapping("/books/{id}")
public BookDetail detail(@PathVariable long id) { return service.detail(id); }

// OUTPUT:
// GET /books -> [{"id":1,"title":"Spring in Action"}]`]
    ),

    'mvc-dao-pattern-patterns': dv(
        [`<p>How a DAO works with Spring:</p><ul><li>The DAO is a singleton <code>@Repository</code> bean with an injected <code>JdbcTemplate</code> or <code>EntityManager</code>.</li><li>The <code>JdbcTemplate</code> obtains the connection bound to the current transaction through <code>DataSourceUtils</code>.</li><li><code>PersistenceExceptionTranslationPostProcessor</code> adds a proxy that converts exceptions of <code>@Repository</code> beans.</li><li>Results are mapped to objects with a <code>RowMapper</code> or by the JPA provider.</li></ul>`,
            r`@Repository
public class JpaStudentDao {
    @PersistenceContext
    private EntityManager em;

    public Student find(long id) { return em.find(Student.class, id); }
    public void save(Student s) { em.persist(s); }
    public List<Student> byCity(String city) {
        return em.createQuery(
            "select s from Student s where s.city = :c", Student.class)
            .setParameter("c", city).getResultList();
    }
}

// OUTPUT:
// byCity("Pune") returns [Student{id=1, name=Asha}]`],
        [`<p>DAO implementation styles:</p><ul><li><b>JdbcTemplate:</b> full SQL control.</li><li><b>NamedParameterJdbcTemplate:</b> readable named parameters.</li><li><b>SimpleJdbcInsert:</b> inserts and returns generated keys.</li><li><b>JPA EntityManager:</b> object mapping.</li><li><b>Spring Data:</b> generated implementation.</li></ul>`,
            r`NamedParameterJdbcTemplate named = new NamedParameterJdbcTemplate(ds);
List<String> names = named.queryForList(
    "select name from student where city = :city and age > :age",
    Map.of("city", "Pune", "age", 18), String.class);

SimpleJdbcInsert insert = new SimpleJdbcInsert(ds)
    .withTableName("student").usingGeneratedKeyColumns("id");
Number key = insert.executeAndReturnKey(Map.of("name", "Ravi"));
System.out.println(names + " " + key);

// OUTPUT: (varies)
// [Asha] 2`],
        [`<p>Common mistakes:</p><ul><li><b>SQL concatenation:</b> opens SQL injection; use placeholders.</li><li><b>Leaking connections</b> when using raw JDBC without try-with-resources.</li><li><b>Business logic in the DAO:</b> keep it in the service.</li><li><b>queryForObject on missing row:</b> throws <code>EmptyResultDataAccessException</code>; use <code>query</code> with a list.</li><li><b>One DAO method per screen:</b> design around the entity.</li></ul>`,
            r`try {
    Student s = jdbc.queryForObject(
        "select * from student where id = ?", mapper, 99L);
} catch (EmptyResultDataAccessException e) {
    System.out.println("no row for id 99");
}

// OUTPUT:
// no row for id 99`],
        [`<p>Performance notes:</p><ul><li>Use batch operations (<code>batchUpdate</code>) for many rows.</li><li>Select only the needed columns.</li><li>Index the columns in <code>where</code> clauses.</li><li>Use a connection pool (HikariCP) and keep transactions short.</li><li>Set a query timeout for risky queries.</li></ul>`,
            r`jdbc.setQueryTimeout(5);
int[][] counts = jdbc.batchUpdate(
    "insert into student(name, city) values (?, ?)",
    students, 500,
    (ps, s) -> { ps.setString(1, s.getName()); ps.setString(2, s.getCity()); });

// OUTPUT:
// 1000 students inserted in 2 batches of 500`],
        [`<p>Real-world: a legacy reporting module uses hand-tuned SQL with window functions. A <code>ReportDao</code> keeps that SQL in one place using <code>JdbcTemplate</code>, while the rest of the app uses Spring Data. Services depend only on the DAO interface.</p>`,
            r`public interface ReportDao {
    List<SalesRow> monthlySales(int year);
}

@Repository
class JdbcReportDao implements ReportDao {
    private final JdbcTemplate jdbc;
    JdbcReportDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<SalesRow> monthlySales(int year) {
        return jdbc.query(
            "select month(d) m, sum(amt) t from sale "
          + "where year(d) = ? group by month(d)",
            (rs, i) -> new SalesRow(rs.getInt("m"), rs.getBigDecimal("t")),
            year);
    }
}

// OUTPUT:
// monthlySales(2025) -> [SalesRow[1, 10500.00], SalesRow[2, 9800.50]]`]
    ),

    'mvc-prg-pattern': dv(
        [`<p>How PRG works in Spring MVC:</p><ul><li>The controller returns <code>redirect:/path</code>; <code>ViewResolver</code> creates a <code>RedirectView</code>.</li><li><code>RedirectView</code> sends a 302 response with a <code>Location</code> header and no body.</li><li>Flash attributes are saved by <code>FlashMapManager</code> (<code>SessionFlashMapManager</code>) in the session with a short expiry.</li><li>On the next request, <code>DispatcherServlet</code> reads the flash map and puts it into the model, then deletes it.</li></ul>`,
            r`@PostMapping("/register")
public String register(@Valid UserForm form, BindingResult br,
        RedirectAttributes ra) {
    if (br.hasErrors()) return "register";
    Long id = service.register(form);
    ra.addFlashAttribute("welcome", "Welcome " + form.getName());
    ra.addAttribute("id", id);
    return "redirect:/users/{id}";
}

// OUTPUT:
// POST /register -> 302 Location: /users/12
// GET /users/12 -> page shows "Welcome Asha" once`],
        [`<p>Redirect options:</p><ul><li><b>redirect: prefix:</b> the common way.</li><li><b>RedirectView:</b> explicit object, can set <code>setStatusCode</code> (for example 303).</li><li><b>ResponseEntity with Location:</b> for APIs.</li><li><b>addAttribute:</b> values go to the URL.</li><li><b>addFlashAttribute:</b> values go to the session for one request.</li><li><b>forward: prefix:</b> a server-side forward, not a PRG redirect.</li></ul>`,
            r`@PostMapping("/pay")
public RedirectView pay(PaymentForm f) {
    String id = service.pay(f);
    RedirectView rv = new RedirectView("/receipts/" + id, true);
    rv.setStatusCode(HttpStatus.SEE_OTHER);      // 303
    return rv;
}

@PostMapping("/api/items")
public ResponseEntity<Void> apiCreate(@RequestBody ItemDto d) {
    long id = service.create(d);
    return ResponseEntity.created(URI.create("/api/items/" + id)).build();
}

// OUTPUT:
// POST /pay -> 303 See Other, Location: /receipts/A1
// POST /api/items -> 201 Created, Location: /api/items/7`],
        [`<p>Common mistakes:</p><ul><li><b>Returning a view after a successful POST:</b> refresh resubmits.</li><li><b>Redirecting on validation errors:</b> the <code>BindingResult</code> is lost.</li><li><b>Using addAttribute for large objects:</b> they appear in the URL; use flash.</li><li><b>Expecting flash data on a second refresh:</b> it is shown once only.</li><li><b>Redirect to user-supplied URL:</b> an open redirect; validate the target.</li></ul>`,
            r`// WRONG: open redirect
// return "redirect:" + request.getParameter("next");

// RIGHT: allow only local paths
String next = request.getParameter("next");
if (next == null || !next.startsWith("/") || next.startsWith("//")) {
    next = "/home";
}
return "redirect:" + next;

// OUTPUT:
// next=https://evil.com -> redirects to /home instead`],
        [`<p>Performance and scaling notes:</p><ul><li>A redirect costs one extra round trip, which is small compared with a duplicate order.</li><li>Flash attributes use the session; in a cluster use Spring Session or sticky sessions.</li><li>For heavy flash payloads store an id and reload on the next page.</li><li>Use a relative redirect (<code>contextRelative</code>) behind proxies to avoid wrong host names; set <code>server.forward-headers-strategy=framework</code> when needed.</li></ul>`,
            r`# application.properties
server.forward-headers-strategy=framework
spring.session.store-type=redis

# OUTPUT:
# redirects built behind a load balancer use the public host and scheme`],
        [`<p>Real-world: a checkout form posts the order. The controller saves it, flashes "Order placed", and redirects to the confirmation page. The customer can refresh or bookmark that page safely, and the browser Back button does not warn about resubmission.</p>`,
            r`@PostMapping("/checkout")
public String checkout(@Valid CheckoutForm f, BindingResult br,
        RedirectAttributes ra) {
    if (br.hasErrors()) return "checkout";
    Order o = orders.place(f);
    ra.addFlashAttribute("msg", "Order " + o.getNumber() + " placed");
    return "redirect:/orders/" + o.getId() + "/confirmation";
}

// OUTPUT:
// POST /checkout -> 302 Location: /orders/42/confirmation
// GET  /orders/42/confirmation -> 200 "Order ORD-42 placed"`]
    ),

    'mvc-mvc-performance': dv(
        [`<p>Where time goes in a request:</p><ul><li><b>Container:</b> accept, parse headers, queue for a worker thread.</li><li><b>Filters and DispatcherServlet:</b> handler mapping, interceptors, argument resolution.</li><li><b>Controller and service:</b> business code and calls to the database or other services.</li><li><b>Serialization:</b> converting the result to JSON or rendering a view.</li><li>Usually 80 percent or more is spent waiting for the database or remote calls.</li></ul>`,
            r`# Micrometer timer is recorded for every request automatically
# GET /actuator/metrics/http.server.requests?tag=uri:/students
# {
#   "name": "http.server.requests",
#   "measurements": [
#     {"statistic": "COUNT", "value": 120.0},
#     {"statistic": "TOTAL_TIME", "value": 3.6},
#     {"statistic": "MAX", "value": 0.31}
#   ]
# }

// OUTPUT: (varies)
// average = 3.6 / 120 = 30 ms per request`],
        [`<p>Tuning settings:</p><ul><li><b>Tomcat:</b> <code>threads.max</code>, <code>accept-count</code>, <code>max-connections</code>.</li><li><b>Compression:</b> <code>server.compression.enabled</code> and <code>min-response-size</code>.</li><li><b>Keep-alive and HTTP/2:</b> <code>server.http2.enabled</code>.</li><li><b>Hikari:</b> <code>maximum-pool-size</code>, <code>connection-timeout</code>.</li><li><b>Virtual threads:</b> <code>spring.threads.virtual.enabled</code> (Java 21).</li><li><b>Cache:</b> Caffeine through <code>spring.cache.type</code>.</li></ul>`,
            r`# application.properties
server.tomcat.threads.max=200
server.tomcat.accept-count=100
server.compression.enabled=true
server.compression.min-response-size=1024
server.http2.enabled=true
spring.datasource.hikari.maximum-pool-size=20
spring.threads.virtual.enabled=true
spring.cache.type=caffeine

# OUTPUT:
# Tomcat started on port 8080 (http) with context path ''`],
        [`<p>Common mistakes:</p><ul><li><b>Guessing:</b> optimizing without measuring.</li><li><b>Unbounded queries:</b> returning every row.</li><li><b>Blocking calls without timeouts:</b> one slow service holds all threads.</li><li><b>Huge session objects</b> or heavy work in filters.</li><li><b>Logging at debug in production</b> or logging large bodies.</li><li><b>Caching without invalidation:</b> stale data bugs.</li></ul>`,
            r`// WRONG: no timeout; a slow partner blocks a Tomcat thread forever
// new RestTemplate().getForObject(url, String.class);

@Bean
RestTemplate restTemplate(RestTemplateBuilder b) {
    return b.setConnectTimeout(Duration.ofSeconds(2))
            .setReadTimeout(Duration.ofSeconds(3))
            .build();
}

// OUTPUT:
// a slow partner now fails after 3 seconds with ResourceAccessException`],
        [`<p>Performance work checklist:</p><ul><li>Define a goal (for example p95 under 200 ms at 500 requests per second).</li><li>Load test with a realistic data size.</li><li>Fix the slowest query, then re-measure.</li><li>Add caching for stable data with an expiry.</li><li>Scale out only after the single instance is efficient.</li></ul>`,
            r`@Bean
CacheManager cacheManager() {
    CaffeineCacheManager m = new CaffeineCacheManager("countries");
    m.setCaffeine(Caffeine.newBuilder()
        .maximumSize(1_000)
        .expireAfterWrite(Duration.ofMinutes(10)));
    return m;
}

// OUTPUT:
// countries are cached for 10 minutes, at most 1000 entries`],
        [`<p>Real-world: a product listing endpoint took 1.8 seconds. Profiling showed 101 queries (N+1) and a 4 MB JSON. Fixes: join fetch, a summary DTO, pagination and compression. The response dropped to 90 ms and 40 KB.</p>`,
            r`@GetMapping("/products")
public Page<ProductSummary> list(
        @PageableDefault(size = 20) Pageable p) {
    return repo.findSummaries(p);          // one query, only needed columns
}

// OUTPUT:
// before: 1800 ms, 101 queries, 4 MB
// after:    90 ms,   2 queries, 40 KB (varies)`]
    ),

    'mvc-request-processing-optimization': dv(
        [`<p>Request processing steps and their cost:</p><ul><li><b>Filter chain:</b> every filter runs for every request.</li><li><b>HandlerMapping:</b> finds the controller method, with a fast lookup of exact paths.</li><li><b>Interceptors:</b> <code>preHandle</code> and <code>postHandle</code> around the call.</li><li><b>HandlerAdapter:</b> resolves arguments (path variables, <code>@RequestBody</code>) and calls the method.</li><li><b>Return value handler and message converter:</b> write the response.</li></ul>`,
            r`@Component
public class StepTimer implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest rq, HttpServletResponse rs,
            Object handler) {
        rq.setAttribute("t0", System.nanoTime());
        return true;
    }
    public void afterCompletion(HttpServletRequest rq,
            HttpServletResponse rs, Object h, Exception ex) {
        long t = (System.nanoTime() - (long) rq.getAttribute("t0")) / 1_000_000;
        System.out.println(rq.getRequestURI() + " total " + t + " ms");
    }
}

// OUTPUT: (varies)
// /students total 18 ms`],
        [`<p>Techniques:</p><ul><li><b>Async return types:</b> <code>Callable</code>, <code>DeferredResult</code>, <code>CompletableFuture</code>.</li><li><b>@Async services</b> with a bounded executor.</li><li><b>Streaming:</b> <code>StreamingResponseBody</code>, <code>SseEmitter</code>.</li><li><b>HTTP caching:</b> <code>Cache-Control</code>, ETag, <code>ShallowEtagHeaderFilter</code>.</li><li><b>Parallel calls:</b> several remote calls with <code>CompletableFuture.allOf</code>.</li></ul>`,
            r`@GetMapping("/dashboard")
public CompletableFuture<Dashboard> dashboard() {
    var users = CompletableFuture.supplyAsync(service::userCount, pool);
    var sales = CompletableFuture.supplyAsync(service::salesTotal, pool);
    return users.thenCombine(sales, Dashboard::new);   // run in parallel
}

@Bean
public FilterRegistrationBean<ShallowEtagHeaderFilter> etag() {
    return new FilterRegistrationBean<>(new ShallowEtagHeaderFilter());
}

// OUTPUT:
// both calls run together: total time is the slower call, not the sum`],
        [`<p>Common mistakes:</p><ul><li><b>Heavy work in filters or interceptors</b> on every request.</li><li><b>Unbounded executor:</b> <code>@Async</code> with the default setup can pile up tasks; configure a pool and queue.</li><li><b>Blocking inside an async task</b> on the same small pool.</li><li><b>Reading the body twice:</b> the request stream can be read only once; wrap it if you must.</li><li><b>Building a big String in memory</b> for a download.</li></ul>`,
            r`@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(8);
        ex.setMaxPoolSize(16);
        ex.setQueueCapacity(200);             // bounded: no unlimited backlog
        ex.setThreadNamePrefix("async-");
        ex.initialize();
        return ex;
    }
}

// OUTPUT:
// tasks beyond 16 threads plus 200 queued are rejected instead of exhausting memory`],
        [`<p>Performance notes:</p><ul><li>Reuse the shared <code>ObjectMapper</code>; disable features you do not need.</li><li>Return smaller payloads with DTOs and compression.</li><li>Use <code>@JsonView</code> or sparse fields for big objects.</li><li>Avoid reflection-heavy conversions in hot paths.</li><li>Check the order of filters; cheap rejections (auth, rate limit) should come first.</li></ul>`,
            r`@Bean
Jackson2ObjectMapperBuilderCustomizer jackson() {
    return b -> b.serializationInclusion(JsonInclude.Include.NON_NULL)
                 .featuresToDisable(SerializationFeature.INDENT_OUTPUT);
}

// OUTPUT:
// JSON without null fields and without pretty printing is smaller and faster`],
        [`<p>Real-world: a report endpoint called three slow back-end services one after another (900 ms in total). Running the calls in parallel with <code>CompletableFuture</code> and adding an ETag for repeated requests reduced a typical call to about 350 ms, and repeated polls to a 304 response.</p>`,
            r`@GetMapping("/report")
public CompletableFuture<Report> report() {
    var a = CompletableFuture.supplyAsync(clientA::fetch, pool);
    var b = CompletableFuture.supplyAsync(clientB::fetch, pool);
    var c = CompletableFuture.supplyAsync(clientC::fetch, pool);
    return CompletableFuture.allOf(a, b, c)
        .thenApply(v -> new Report(a.join(), b.join(), c.join()));
}

// OUTPUT: (varies)
// before: 900 ms (300 + 300 + 300); after: about 320 ms`]
    ),

    'mvc-database-optimization': dv(
        [`<p>How database time is spent in an MVC app:</p><ul><li><b>Connection:</b> taken from HikariCP; waits if the pool is empty.</li><li><b>Statement:</b> parsed and planned by the database, and an index decides the cost.</li><li><b>Round trips:</b> each query costs network latency, so many small queries add up (N+1).</li><li><b>Hibernate:</b> flushes changes at commit and keeps entities in the persistence context.</li><li><b>Open-in-view:</b> keeps the session open until the response is written.</li></ul>`,
            r`spring.jpa.properties.hibernate.generate_statistics=true
logging.level.org.hibernate.stat=debug

// OUTPUT: (varies)
// Session Metrics {
//   101 JDBC statements executed
//   0 flushes
// }`],
        [`<p>Options for each problem:</p><ul><li><b>N+1:</b> <code>join fetch</code>, <code>@EntityGraph</code>, <code>@BatchSize</code>, <code>default_batch_fetch_size</code>.</li><li><b>Large reads:</b> projections, <code>Slice</code>, streaming with <code>@QueryHints</code> fetch size.</li><li><b>Writes:</b> <code>jdbc.batch_size</code>, <code>order_inserts</code>, <code>saveAll</code>.</li><li><b>Locking:</b> <code>@Version</code> for optimistic locking.</li><li><b>Caching:</b> <code>@Cacheable</code> or Hibernate second-level cache.</li></ul>`,
            r`# application.properties
spring.jpa.properties.hibernate.default_batch_fetch_size=50
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    @Version private long version;       // optimistic locking
}

# OUTPUT:
# inserts of 1000 products are sent in 20 batches of 50`],
        [`<p>Common mistakes:</p><ul><li><b>Missing index:</b> a full table scan on every call.</li><li><b>EAGER fetch everywhere:</b> loads far too much; use LAZY and fetch on demand.</li><li><b>IDENTITY ids with batching:</b> Hibernate cannot batch inserts; use a sequence.</li><li><b>Big pool:</b> hundreds of connections can overload the database.</li><li><b>Long transactions:</b> remote calls inside them keep locks and connections.</li><li><b>LIKE with a leading wildcard:</b> cannot use a normal index.</li></ul>`,
            r`// WRONG: EAGER loads the whole graph for every Order
// @OneToMany(fetch = FetchType.EAGER) List<Item> items;

@OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
private List<Item> items;                 // fetch with join fetch when needed

// OUTPUT:
// listing orders no longer loads items unless the query asks for them`],
        [`<p>Performance steps:</p><ul><li>Log slow queries and run <code>EXPLAIN</code> on them.</li><li>Add a composite index in the order of the <code>where</code> columns.</li><li>Replace loops of queries with one query using <code>in</code>.</li><li>Use a read replica for heavy reports.</li><li>Archive or partition very old data.</li></ul>`,
            r`-- before: type ALL, 2,000,000 rows scanned
EXPLAIN SELECT * FROM orders WHERE customer_id = 7 AND status = 'NEW';
CREATE INDEX idx_orders_cust_status ON orders (customer_id, status);
-- after: type ref, about 12 rows scanned

// OUTPUT: (varies)
// query time drops from 850 ms to 2 ms`],
        [`<p>Real-world: an admin page listing 50 orders with their customers and items made 151 queries and took 2 seconds. Fixing it with an entity graph, a summary projection, an index on <code>customer_id</code> and <code>open-in-view=false</code> brought it to 3 queries and 60 ms.</p>`,
            r`@EntityGraph(attributePaths = {"customer"})
@Query("select o from Order o where o.status = :s")
Page<Order> findByStatus(@Param("s") String s, Pageable p);

@Query("select i.order.id as orderId, count(i) as items "
     + "from Item i where i.order.id in :ids group by i.order.id")
List<ItemCount> countItems(@Param("ids") Collection<Long> ids);

// OUTPUT: (varies)
// before: 151 queries, 2000 ms; after: 3 queries, 60 ms`]
    )
};
