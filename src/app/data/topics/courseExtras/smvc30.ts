// Spring extras, batch smvc30 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc30Extras: Record<string, Extra> = {
    'mvc-repository-layer': x(
        ['<b>Repository layer</b> is the part of the application that talks to the database; it hides queries behind methods such as <code>findById</code> and <code>save</code>.',
            '<b>Spring Data JPA</b> lets you write only an interface that extends <code>JpaRepository&lt;User, Long&gt;</code>; Spring generates the implementation at startup.',
            '<b>Derived queries</b>: a method name like <code>findByEmail</code> is parsed into a query, so simple lookups need no SQL.'],
        ['<b>@Query</b> holds JPQL or native SQL when the method name would be too long or the query is complex.',
            '<b>Paging</b>: pass a <code>Pageable</code> and return <code>Page&lt;T&gt;</code> so the database does the limiting.',
            '<b>Stereotype</b>: <code>@Repository</code> marks a class as persistence code and translates vendor exceptions into <code>DataAccessException</code>.'],
        ['<b>Projections</b>: return interfaces or records with only the needed columns to avoid loading whole entities.',
            '<b>N+1 problem</b>: lazy associations loaded in a loop fire one query each; fix with <code>JOIN FETCH</code> or <code>@EntityGraph</code>.',
            '<b>Testing</b>: use <code>@DataJpaTest</code>, which starts only the JPA slice with an in-memory database and rolls back each test.'],
        [['F', 'What is a repository in Spring MVC apps?', 'A component that encapsulates database access so services do not write SQL or JPA code directly.'],
            ['F', 'Do you need to implement a Spring Data repository interface?', 'No, Spring creates a proxy implementation at startup from the interface.'],
            ['M', 'What does save do when the id already exists?', 'It merges the entity, so it behaves as an update; with a new id it persists an insert.'],
            ['M', 'How do you avoid loading all rows?', 'Use Pageable and return Page or Slice so the query has a LIMIT.'],
            ['S', 'How do you fix the N+1 select problem?', 'Use JOIN FETCH, @EntityGraph or batch fetching so related rows load in one or few queries.'],
            ['S', 'Why is the repository usually not annotated @Transactional?', 'The service layer owns the transaction boundary so several repository calls commit or roll back together.']],
        [['Repository interface with derived queries.',
            r`public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByActiveTrueOrderByNameAsc();
    boolean existsByEmail(String email);
}

// usage in a service
userRepository.save(new User("Asha", "asha@x.com"));
System.out.println(userRepository.findByEmail("asha@x.com").isPresent());

// OUTPUT:
// true`],
            ['Paged custom query.',
                r`@Query("select u from User u where u.name like :q")
Page<User> search(@Param("q") String q, Pageable pageable);

Page<User> p = repo.search("A%", PageRequest.of(0, 2, Sort.by("name")));
System.out.println(p.getContent().size() + " of " + p.getTotalElements());

// OUTPUT:
// 2 of 5`]],
        [['@DataJpaTest for a repository.',
            r`@DataJpaTest
class UserRepositoryTest {
    @Autowired UserRepository repo;

    @Test
    void findsByEmail() {
        repo.save(new User("Ravi", "ravi@x.com"));
        assertTrue(repo.findByEmail("ravi@x.com").isPresent());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Interface projection.',
                r`public interface UserView {
    String getName();
    String getEmail();
}
List<UserView> findByActiveTrue();

users.forEach(u -> System.out.println(u.getName() + " " + u.getEmail()));

// OUTPUT:
// Asha asha@x.com
// Ravi ravi@x.com`]]
    ),

    'mvc-service-layer': x(
        ['<b>Service layer</b> holds the business rules of the application: it sits between controllers and repositories and decides what happens.',
            '<b>@Service</b> is a stereotype annotation that registers the class as a Spring bean and documents its role.',
            '<b>Constructor injection</b> gives the service its repositories, which keeps the class easy to test with mocks.'],
        ['<b>Transaction boundary</b>: put <code>@Transactional</code> on service methods so several repository calls succeed or fail together.',
            '<b>Entities in, DTOs out</b>: the service maps between entities and DTOs so controllers never touch persistence classes.',
            '<b>Exceptions</b>: throw meaningful business exceptions such as <code>UserNotFoundException</code> instead of returning null.'],
        ['<b>Interface plus implementation</b> is optional; use it only when you really have several implementations.',
            '<b>Self-invocation</b>: calling a <code>@Transactional</code> method from the same class bypasses the proxy, so no transaction starts.',
            '<b>Unit tests</b> use Mockito with <code>@ExtendWith(MockitoExtension.class)</code>, with no Spring context at all.'],
        [['F', 'What belongs in the service layer?', 'Business logic, validation rules and coordination of repositories.'],
            ['F', 'Which annotation marks a service?', '@Service, a specialization of @Component.'],
            ['M', 'Why not put business logic in the controller?', 'Controllers handle HTTP only; logic there cannot be reused or tested without the web layer.'],
            ['M', 'Where should @Transactional go?', 'On public service methods that represent one business operation.'],
            ['S', 'Why does a @Transactional method called from the same class not work?', 'Spring uses a proxy, and an internal call skips the proxy so no transaction advice runs.'],
            ['S', 'How do you unit test a service?', 'Mock the repository with Mockito and call the service directly; no Spring context is needed.']],
        [['A service with a business rule.',
            r`@Service
public class UserService {
    private final UserRepository repo;
    public UserService(UserRepository repo) { this.repo = repo; }

    @Transactional
    public User register(String name, String email) {
        if (repo.existsByEmail(email))
            throw new IllegalStateException("Email already used: " + email);
        return repo.save(new User(name, email));
    }
}

// OUTPUT:
// register("Asha","a@x.com") -> User(id=1)
// register again -> IllegalStateException: Email already used: a@x.com`],
            ['Service unit test with Mockito.',
                r`@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository repo;
    @InjectMocks UserService service;

    @Test
    void duplicateEmailRejected() {
        when(repo.existsByEmail("a@x.com")).thenReturn(true);
        assertThrows(IllegalStateException.class,
            () -> service.register("A", "a@x.com"));
        verify(repo, never()).save(any());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Coordinating two repositories.',
            r`@Transactional
public void transfer(long from, long to, BigDecimal amt) {
    Account a = accounts.findById(from).orElseThrow();
    Account b = accounts.findById(to).orElseThrow();
    a.withdraw(amt);
    b.deposit(amt);
}

// OUTPUT:
// both accounts change together, or neither changes if an exception is thrown`],
            ['Mapping to a DTO.',
                r`public UserDto get(long id) {
    User u = repo.findById(id)
        .orElseThrow(() -> new UserNotFoundException(id));
    return new UserDto(u.getId(), u.getName());
}

// OUTPUT:
// get(1)  -> UserDto[id=1, name=Asha]
// get(99) -> UserNotFoundException: User 99 not found`]]
    ),

    'mvc-controller-layer': x(
        ['<b>Controller layer</b> receives HTTP requests, calls the service layer and returns a view name or a response body.',
            '<b>@Controller</b> returns view names for HTML pages; <b>@RestController</b> returns data (usually JSON) written straight to the response.',
            '<b>Mapping annotations</b> such as <code>@GetMapping</code> and <code>@PostMapping</code> connect URLs and HTTP methods to methods.'],
        ['<b>Binding</b>: <code>@PathVariable</code> reads the URL, <code>@RequestParam</code> reads query parameters and <code>@RequestBody</code> reads the JSON body.',
            '<b>Validation</b>: add <code>@Valid</code> on the argument and Bean Validation annotations on the DTO.',
            '<b>Thin controllers</b>: no business logic and no repository calls; only translate between HTTP and the service.'],
        ['<b>DispatcherServlet</b> finds the method through <code>HandlerMapping</code> and calls it through <code>HandlerAdapter</code>.',
            '<b>Status codes</b>: use <code>ResponseEntity</code> or <code>@ResponseStatus</code> to return 201, 204 and so on.',
            '<b>Testing</b>: <code>@WebMvcTest</code> with <code>MockMvc</code> loads only the web slice and a mocked service.'],
        [['F', 'What does a controller do?', 'It handles a web request, calls services and returns a response or a view.'],
            ['F', 'Difference between @Controller and @RestController?', '@RestController is @Controller plus @ResponseBody, so return values become the response body.'],
            ['M', 'How do you read an id from the URL?', 'Use @PathVariable on a method parameter for a pattern such as /users/{id}.'],
            ['M', 'How do you return 201 Created?', 'Return ResponseEntity.created(uri).body(dto) or annotate with @ResponseStatus(HttpStatus.CREATED).'],
            ['S', 'How does Spring pick the controller method?', 'DispatcherServlet asks HandlerMapping, which matches path, HTTP method and media types.'],
            ['S', 'Why should controllers not use entities directly?', 'It leaks the schema, risks lazy loading errors and allows mass assignment; use DTOs instead.']],
        [['A REST controller.',
            r`@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;
    public UserController(UserService service) { this.service = service; }

    @GetMapping("/{id}")
    public UserDto get(@PathVariable long id) { return service.get(id); }

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUser req) {
        UserDto dto = service.create(req);
        return ResponseEntity.created(URI.create("/api/users/" + dto.id())).body(dto);
    }
}

// OUTPUT:
// GET /api/users/1 -> 200 {"id":1,"name":"Asha"}
// POST /api/users  -> 201 Location: /api/users/2`],
            ['MVC controller returning a view.',
                r`@Controller
public class HomeController {
    @GetMapping("/home")
    public String home(Model model) {
        model.addAttribute("title", "Welcome");
        return "home";          // resolved to a template named home
    }
}

// OUTPUT:
// GET /home -> 200 HTML rendered from the home template with title = Welcome`]],
        [['MockMvc test.',
            r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;

    @Test
    void getsUser() throws Exception {
        when(service.get(1)).thenReturn(new UserDto(1L, "Asha"));
        mvc.perform(get("/api/users/1"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.name").value("Asha"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Validation failure.',
                r`public record CreateUser(@NotBlank String name, @Email String email) {}

// POST /api/users with {"name":"","email":"bad"}

// OUTPUT:
// 400 Bad Request
// MethodArgumentNotValidException: name must not be blank, email must be valid`]]
    ),

    'mvc-dao-pattern': x(
        ['<b>DAO (Data Access Object)</b> is a class that holds all database access for one entity, so the rest of the code never sees SQL or JDBC.',
            '<b>Typical methods</b> are <code>findById</code>, <code>findAll</code>, <code>insert</code>, <code>update</code> and <code>delete</code>.',
            '<b>@Repository</b> marks a DAO class and enables translation of SQL errors into Spring <code>DataAccessException</code>.'],
        ['<b>JdbcTemplate</b> removes boilerplate: it opens connections, runs the SQL, maps rows and closes resources.',
            '<b>RowMapper</b> converts one <code>ResultSet</code> row into an object.',
            '<b>DAO or Spring Data</b>: a hand-written DAO gives full control; a Spring Data repository generates the same code for you.'],
        ['<b>Interface first</b>: define <code>UserDao</code> and an implementation, so you can swap JDBC for JPA or a test stub.',
            '<b>Named parameters</b> (<code>NamedParameterJdbcTemplate</code>) are safer and clearer than positional question marks, and prevent SQL injection.',
            '<b>Testing</b>: run the DAO against an embedded H2 database with <code>@JdbcTest</code>.'],
        [['F', 'What is the DAO pattern?', 'A design pattern that separates persistence code into its own class behind an interface.'],
            ['F', 'Why use a DAO?', 'It keeps SQL out of business code and lets you change the storage without touching services.'],
            ['M', 'What does JdbcTemplate do for you?', 'It manages connections, statements, exceptions and cleanup so you write only SQL and mapping.'],
            ['M', 'What is a RowMapper?', 'A callback that turns one result set row into a Java object.'],
            ['S', 'How does DAO differ from a Spring Data repository?', 'Both isolate data access; a DAO is written by hand, while a repository interface is generated by Spring Data.'],
            ['S', 'How do you prevent SQL injection in a DAO?', 'Always use bind parameters (? or named) and never concatenate user input into SQL.']],
        [['A JdbcTemplate DAO.',
            r`@Repository
public class JdbcUserDao implements UserDao {
    private final JdbcTemplate jdbc;
    public JdbcUserDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    private final RowMapper<User> mapper = (rs, i) ->
        new User(rs.getLong("id"), rs.getString("name"), rs.getString("email"));

    public Optional<User> findById(long id) {
        return jdbc.query("select * from users where id = ?", mapper, id)
                   .stream().findFirst();
    }
}

// OUTPUT:
// findById(1) -> Optional[User(id=1, name=Asha)]
// findById(9) -> Optional.empty`],
            ['Insert with generated key.',
                r`public long insert(User u) {
    KeyHolder keys = new GeneratedKeyHolder();
    jdbc.update(con -> {
        PreparedStatement ps = con.prepareStatement(
            "insert into users(name, email) values (?, ?)",
            Statement.RETURN_GENERATED_KEYS);
        ps.setString(1, u.getName());
        ps.setString(2, u.getEmail());
        return ps;
    }, keys);
    return keys.getKey().longValue();
}

// OUTPUT:
// insert(new User("Asha","a@x.com")) -> 1`]],
        [['@JdbcTest for the DAO.',
            r`@JdbcTest
@Import(JdbcUserDao.class)
class JdbcUserDaoTest {
    @Autowired JdbcUserDao dao;

    @Test
    void insertsAndFinds() {
        long id = dao.insert(new User(null, "Asha", "a@x.com"));
        assertTrue(dao.findById(id).isPresent());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Injection-safe search.',
                r`String sql = "select * from users where name like ?";
List<User> list = jdbc.query(sql, mapper, "A%");   // bound, never concatenated
// BAD: "select * from users where name = '" + input + "'"

// OUTPUT:
// input  A'; drop table users; --  is treated as plain text, no harm done`]]
    ),

    'mvc-dto-pattern': x(
        ['<b>DTO (Data Transfer Object)</b> is a simple object that carries data between layers or across the network; it has fields and no business logic.',
            '<b>Why</b>: it exposes only the fields a client needs, so the database schema and internal entity details stay hidden.',
            '<b>Java records</b> are a compact way to write immutable DTOs: <code>record UserDto(Long id, String name) {}</code>.'],
        ['<b>Separate request and response DTOs</b>: a create request has no id, a response has one; do not reuse one class for both.',
            '<b>Validation</b> goes on request DTOs with <code>@NotBlank</code>, <code>@Email</code> and <code>@Size</code>.',
            '<b>Mapping</b>: write it by hand for small apps or use MapStruct to generate mappers at compile time.'],
        ['<b>Mass assignment</b>: binding JSON straight onto an entity lets a client set fields like <code>role</code>; a DTO blocks this.',
            '<b>Lazy loading</b>: serializing an entity can trigger lazy queries or infinite loops in bidirectional relations; DTOs avoid both.',
            '<b>Projections</b>: Spring Data can return DTO records straight from a query, skipping the entity.'],
        [['F', 'What is a DTO?', 'A plain object used only to transfer data between layers or to a client.'],
            ['F', 'Why not return entities from controllers?', 'It exposes the database model and can cause lazy loading and serialization problems.'],
            ['M', 'Where do you do the entity to DTO mapping?', 'Usually in the service layer or a dedicated mapper class.'],
            ['M', 'What is a benefit of records for DTOs?', 'They are immutable, short and give equals, hashCode and toString automatically.'],
            ['S', 'What is mass assignment and how do DTOs stop it?', 'Clients set fields they should not (such as role); a DTO lists only allowed fields.'],
            ['S', 'How can a query return a DTO directly?', 'Use a JPQL constructor expression or an interface or class projection in Spring Data.']],
        [['Request and response DTOs with a mapper.',
            r`public record CreateUser(@NotBlank String name, @Email String email) {}
public record UserDto(Long id, String name) {}

public UserDto toDto(User u) { return new UserDto(u.getId(), u.getName()); }
public User toEntity(CreateUser r) { return new User(r.name(), r.email()); }

System.out.println(toDto(new User(1L, "Asha", "a@x.com", "ADMIN")));

// OUTPUT:
// UserDto[id=1, name=Asha]`],
            ['DTO straight from a query.',
                r`@Query("select new com.app.dto.UserDto(u.id, u.name) from User u")
List<UserDto> findAllDtos();

repo.findAllDtos().forEach(System.out::println);

// OUTPUT:
// UserDto[id=1, name=Asha]
// UserDto[id=2, name=Ravi]`]],
        [['JSON shape produced.',
            r`@GetMapping("/{id}")
public UserDto get(@PathVariable long id) { return service.get(id); }

// GET /api/users/1

// OUTPUT:
// {"id":1,"name":"Asha"}     (password and role are never exposed)`],
            ['Mass assignment blocked.',
                r`// client sends: {"name":"Eve","email":"e@x.com","role":"ADMIN"}
// CreateUser has only name and email, so Jackson ignores the role field
User u = new User(req.name(), req.email());   // role stays the default USER
System.out.println(u.getRole());

// OUTPUT:
// USER`]]
    ),

    'mvc-entity-mapping': x(
        ['<b>Entity mapping</b> tells JPA how a Java class maps to a database table: <code>@Entity</code> marks the class and <code>@Table</code> names the table.',
            '<b>Primary key</b>: <code>@Id</code> marks the key field and <code>@GeneratedValue</code> lets the database create values.',
            '<b>Columns</b>: fields map to columns by name; use <code>@Column</code> to set the name, length and nullability.'],
        ['<b>Relationships</b>: <code>@OneToMany</code>, <code>@ManyToOne</code>, <code>@OneToOne</code> and <code>@ManyToMany</code> describe foreign keys.',
            '<b>Owning side</b>: the side with <code>@JoinColumn</code> owns the relation; the other side uses <code>mappedBy</code>.',
            '<b>Enums</b>: use <code>@Enumerated(EnumType.STRING)</code> so reordering the enum does not corrupt data.'],
        ['<b>Fetch type</b>: <code>@ManyToOne</code> is eager by default, collections are lazy; prefer lazy and fetch explicitly when needed.',
            '<b>equals and hashCode</b>: base them on a business key or the id carefully, never on lazy collections.',
            '<b>Schema</b>: use Flyway or Liquibase in production and keep <code>ddl-auto</code> at <code>validate</code> or <code>none</code>.'],
        [['F', 'What does @Entity do?', 'It tells JPA that the class is persistent and maps to a table.'],
            ['F', 'What is @GeneratedValue for?', 'It lets the database or JPA generate the primary key value.'],
            ['M', 'What does mappedBy mean?', 'It marks the inverse side of a bidirectional relation; the other side owns the foreign key.'],
            ['M', 'Why use EnumType.STRING?', 'ORDINAL stores positions, which break when enum constants are reordered.'],
            ['S', 'Why prefer LAZY fetching?', 'It avoids loading large object graphs you do not need and avoids extra joins.'],
            ['S', 'Why is ddl-auto=update risky in production?', 'It changes the schema automatically without review or rollback; use migrations instead.']],
        [['Two related entities.',
            r`@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 40)
    private String number;

    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id")
    private Customer customer;
}

// OUTPUT:
// table orders(id bigint pk, number varchar(40) not null,
//              status varchar(255), customer_id bigint not null fk)`],
            ['Bidirectional one-to-many.',
                r`@Entity
public class Customer {
    @Id @GeneratedValue private Long id;
    private String name;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL,
               orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    public void addOrder(Order o) { orders.add(o); o.setCustomer(this); }
}

// OUTPUT:
// saving the customer also inserts its orders; removed orders are deleted`]],
        [['Mapping test with @DataJpaTest.',
            r`@DataJpaTest
class OrderMappingTest {
    @Autowired TestEntityManager em;

    @Test
    void persistsOrder() {
        Customer c = em.persist(new Customer("Asha"));
        Order o = new Order("A-1", c);
        em.persistAndFlush(o);
        assertNotNull(o.getId());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Show the SQL.',
                r`# application.properties
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=validate

# OUTPUT:
# Hibernate: insert into orders (customer_id, number, status) values (?, ?, ?)`]]
    ),

    'mvc-transaction-management': x(
        ['<b>Transaction</b> is a group of database operations that either all succeed (commit) or all undo (rollback); it follows ACID rules.',
            '<b>@Transactional</b> on a method makes Spring open a transaction before it runs and commit when it returns normally.',
            '<b>Rollback</b>: by default Spring rolls back on unchecked exceptions (<code>RuntimeException</code> and <code>Error</code>), not on checked exceptions.'],
        ['<b>Propagation</b> says what to do when a transaction already exists: <code>REQUIRED</code> (default) joins it, <code>REQUIRES_NEW</code> starts a new one.',
            '<b>readOnly = true</b> is a hint for query-only methods; it can skip dirty checking and help the database.',
            '<b>rollbackFor</b>: use <code>@Transactional(rollbackFor = Exception.class)</code> to also roll back on checked exceptions.'],
        ['<b>Proxy based</b>: Spring wraps the bean in a proxy, so calls from the same class (self-invocation) and private methods are not transactional.',
            '<b>Isolation</b> levels (<code>READ_COMMITTED</code>, <code>REPEATABLE_READ</code>, <code>SERIALIZABLE</code>) trade consistency against concurrency.',
            '<b>Swallowed exceptions</b>: catching the exception inside the method means Spring never sees it and commits anyway.'],
        [['F', 'What is a transaction?', 'A unit of work that is committed fully or rolled back fully.'],
            ['F', 'What does @Transactional do?', 'It wraps the method in a transaction managed by Spring.'],
            ['M', 'Does a checked exception cause rollback by default?', 'No, only RuntimeException and Error do, unless you set rollbackFor.'],
            ['M', 'What is the default propagation?', 'REQUIRED: join the current transaction or create one if none exists.'],
            ['S', 'Why does self-invocation ignore @Transactional?', 'The advice lives in the proxy; a call from inside the class goes to this, not the proxy.'],
            ['S', 'When would you use REQUIRES_NEW?', 'For work that must commit independently, such as writing an audit log even if the outer transaction rolls back.']],
        [['Atomic money transfer.',
            r`@Service
public class TransferService {
    private final AccountRepository accounts;
    public TransferService(AccountRepository accounts) { this.accounts = accounts; }

    @Transactional
    public void transfer(long from, long to, BigDecimal amt) {
        Account a = accounts.findById(from).orElseThrow();
        Account b = accounts.findById(to).orElseThrow();
        a.withdraw(amt);                    // throws if balance is too low
        b.deposit(amt);
    }
}

// OUTPUT:
// transfer(1, 2, 500) -> both rows updated, committed
// transfer(1, 2, 9999) -> InsufficientFundsException, nothing changed`],
            ['Checked exception rollback.',
                r`@Transactional(rollbackFor = IOException.class)
public void importFile(Path p) throws IOException {
    repo.save(new Batch(p.toString()));
    Files.readAllLines(p);        // may throw IOException -> now rolls back
}

// OUTPUT:
// missing file -> IOException thrown, the Batch insert is rolled back`]],
        [['Test that rollback happens.',
            r`@SpringBootTest
class TransferServiceTest {
    @Autowired TransferService service;
    @Autowired AccountRepository accounts;

    @Test
    void failedTransferChangesNothing() {
        assertThrows(InsufficientFundsException.class,
            () -> service.transfer(1, 2, new BigDecimal("9999")));
        assertEquals(new BigDecimal("1000.00"), accounts.findById(1L).get().getBalance());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Swallowed exception bug.',
                r`@Transactional
public void save(Order o) {
    try {
        repo.save(o);
        throw new IllegalStateException("boom");
    } catch (Exception e) {
        log.warn("ignored", e);       // BUG: Spring sees a normal return and commits
    }
}

// OUTPUT:
// the order row is committed even though an error occurred`]]
    ),

    'mvc-database-exception-handling': x(
        ['<b>DataAccessException</b> is Spring unchecked root exception for all database errors, so your code is not tied to JDBC or Hibernate exception types.',
            '<b>Translation</b>: classes marked <code>@Repository</code> get vendor exceptions converted into subclasses like <code>DuplicateKeyException</code>.',
            '<b>Common ones</b>: <code>DataIntegrityViolationException</code> (constraint broken) and <code>EmptyResultDataAccessException</code> (expected a row, found none).'],
        ['<b>@RestControllerAdvice</b> with <code>@ExceptionHandler</code> turns exceptions into clean HTTP responses in one place.',
            '<b>Mapping</b>: duplicate or constraint errors usually become 409 Conflict, missing data 404 Not Found.',
            '<b>Do not leak</b> SQL text, table names or stack traces in the response body; log them on the server instead.'],
        ['<b>Optimistic locking</b>: with <code>@Version</code> a concurrent update throws <code>ObjectOptimisticLockingFailureException</code>; map it to 409 and let the client retry.',
            '<b>Timing</b>: with JPA the constraint error may appear at flush or commit time, outside your try block.',
            '<b>Transaction state</b>: after a database exception the transaction is marked rollback-only, so catching it inside the same transaction does not save the work.'],
        [['F', 'What is DataAccessException?', 'Spring runtime exception hierarchy that wraps database errors.'],
            ['F', 'Is it a checked exception?', 'No, it is unchecked, so you are not forced to catch it.'],
            ['M', 'How do you return 409 for a duplicate email?', 'Catch DataIntegrityViolationException (or check existsByEmail) and handle it in a @RestControllerAdvice returning 409.'],
            ['M', 'Why can the exception appear late with JPA?', 'Hibernate delays SQL until flush or commit, so the error is thrown there.'],
            ['S', 'How does Spring translate exceptions?', 'PersistenceExceptionTranslationPostProcessor adds advice to @Repository beans that converts vendor exceptions.'],
            ['S', 'How do you handle concurrent updates?', 'Add a @Version field, catch the optimistic locking exception, return 409 and retry or ask the user to reload.']],
        [['Global handler for database errors.',
            r`@RestControllerAdvice
public class DbExceptionHandler {
    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> conflict(DataIntegrityViolationException e) {
        return Map.of("error", "Data conflicts with existing records");
    }

    @ExceptionHandler(EmptyResultDataAccessException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> missing(EmptyResultDataAccessException e) {
        return Map.of("error", "Record not found");
    }
}

// OUTPUT:
// POST duplicate email -> 409 {"error":"Data conflicts with existing records"}
// DELETE missing id    -> 404 {"error":"Record not found"}`],
            ['Optimistic locking.',
                r`@Entity
public class Product {
    @Id @GeneratedValue private Long id;
    @Version private Long version;       // incremented on every update
    private int stock;
}

@ExceptionHandler(ObjectOptimisticLockingFailureException.class)
@ResponseStatus(HttpStatus.CONFLICT)
public String stale() { return "Record was changed by someone else"; }

// OUTPUT:
// two users edit the same row -> the second save returns 409`]],
        [['MockMvc test of the handler.',
            r`@WebMvcTest(UserController.class)
class ErrorHandlingTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;

    @Test
    void duplicateGives409() throws Exception {
        when(service.create(any())).thenThrow(new DataIntegrityViolationException("dup"));
        mvc.perform(post("/api/users").contentType("application/json")
                .content("{\"name\":\"A\",\"email\":\"a@x.com\"}"))
           .andExpect(status().isConflict());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Catch at the right place.',
                r`try {
    repo.saveAndFlush(user);          // flush forces the SQL inside the try block
} catch (DataIntegrityViolationException e) {
    throw new DuplicateEmailException(user.getEmail());
}

// OUTPUT:
// duplicate email -> DuplicateEmailException: a@x.com (mapped to 409 by the advice)`]]
    ),

    'mvc-controller-layer-layers': x(
        ['<b>Controller</b> is the top layer of a layered application: it is the entry point for web requests and talks only to the service layer below.',
            '<b>Layer rule</b>: the flow is Controller, then Service, then Repository, and each layer only calls the one directly below it.',
            '<b>Responsibility</b>: parse the request, validate input, call one service method and shape the response; nothing more.'],
        ['<b>Separation of concerns</b> lets you change the UI or API style without touching business rules or the database code.',
            '<b>Dependencies</b> point downward; a repository must never call a controller, and a service must not use <code>HttpServletRequest</code>.',
            '<b>Error handling</b> is centralized in <code>@ControllerAdvice</code> rather than repeated in every controller.'],
        ['<b>Anti-patterns</b>: fat controllers with business logic, controllers calling repositories directly, and entities exposed in responses.',
            '<b>Constructor injection</b> keeps dependencies explicit and makes controller tests simple.',
            '<b>Testing by layer</b>: <code>@WebMvcTest</code> for controllers, plain Mockito for services, <code>@DataJpaTest</code> for repositories.'],
        [['F', 'What is the top layer in a Spring MVC app?', 'The controller (web) layer, which handles HTTP.'],
            ['F', 'Which layer does a controller call?', 'The service layer.'],
            ['M', 'Why should controllers not call repositories?', 'It skips business rules and transaction boundaries, and mixes web and persistence concerns.'],
            ['M', 'Where does request validation happen?', 'Syntax validation on the DTO in the controller with @Valid; business validation in the service.'],
            ['S', 'How do you test only the controller layer?', 'Use @WebMvcTest with MockMvc and a @MockBean service.'],
            ['S', 'Why is HttpServletRequest not passed into services?', 'It ties business code to the web layer and makes it hard to reuse and unit test.']],
        [['Controller delegating to the layer below.',
            r`@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orders;
    public OrderController(OrderService orders) { this.orders = orders; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderDto place(@Valid @RequestBody PlaceOrder req) {
        return orders.place(req);        // all rules live in the service
    }
}

// OUTPUT:
// POST /api/orders -> 201 {"id":10,"status":"NEW"}`],
            ['Fat controller versus thin controller.',
                r`// BAD: controller does price math and saves through the repository
// @PostMapping public Order add(@RequestBody Order o) {
//     o.setTotal(o.getQty() * o.getPrice()); return repo.save(o); }

// GOOD: controller only forwards
@PostMapping
public OrderDto add(@Valid @RequestBody PlaceOrder req) {
    return orders.place(req);
}

// OUTPUT:
// the price rule lives in OrderService and can be tested without HTTP`]],
        [['Layered flow trace.',
            r`// GET /api/orders/10
// DispatcherServlet -> OrderController.get(10)
//                   -> OrderService.get(10)      (@Transactional readOnly)
//                   -> OrderRepository.findById(10)
//                   -> database

// OUTPUT:
// 200 {"id":10,"status":"NEW"}`],
            ['Web slice test.',
                r`@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;
    @MockBean OrderService orders;

    @Test
    void invalidBodyIs400() throws Exception {
        mvc.perform(post("/api/orders").contentType("application/json").content("{}"))
           .andExpect(status().isBadRequest());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-service-layer-layers': x(
        ['<b>Service layer</b> is the middle layer of a layered application: it contains business logic and is called by controllers and other services.',
            '<b>Position</b>: it uses the repository layer below it for data and knows nothing about HTTP or views above it.',
            '<b>@Service</b> registers the class as a bean; the real work is the business methods, usually one per use case.'],
        ['<b>Use case methods</b> such as <code>placeOrder</code> and <code>cancelOrder</code> are better names than generic <code>save</code> and <code>update</code>.',
            '<b>Transactions</b> start here: annotate use case methods with <code>@Transactional</code> so the whole use case is atomic.',
            '<b>Reuse</b>: several controllers, schedulers or message listeners can call the same service method.'],
        ['<b>Service calling service</b> is fine, but avoid circular dependencies; extract a third class if two services need each other.',
            '<b>Domain exceptions</b> express business failures; the web layer maps them to HTTP codes.',
            '<b>Anemic model</b>: if services only shuffle getters and setters, move rules into the entities where they belong.'],
        [['F', 'What is the middle layer called?', 'The service layer, which holds business logic.'],
            ['F', 'Which layers does a service use?', 'It calls repositories and may call other services; it is called by controllers.'],
            ['M', 'Why start transactions in the service layer?', 'A use case often touches several repositories and must commit or roll back as one unit.'],
            ['M', 'How do you deal with circular dependencies between services?', 'Extract the shared logic into a third service or redesign the dependency direction.'],
            ['S', 'What is an anemic domain model?', 'Entities with only data and services with all logic; prefer putting invariants inside the entities.'],
            ['S', 'How do you test a service in isolation?', 'Mock its repositories with Mockito and assert on results and interactions.']],
        [['Use case spanning two repositories.',
            r`@Service
public class OrderService {
    private final OrderRepository orders;
    private final ProductRepository products;
    public OrderService(OrderRepository o, ProductRepository p) {
        this.orders = o; this.products = p;
    }

    @Transactional
    public OrderDto place(PlaceOrder req) {
        Product p = products.findById(req.productId()).orElseThrow();
        p.reduceStock(req.qty());                   // rule inside the entity
        Order o = orders.save(new Order(p, req.qty()));
        return new OrderDto(o.getId(), o.getStatus().name());
    }
}

// OUTPUT:
// place(productId=5, qty=2) -> OrderDto[id=10, status=NEW], stock reduced by 2
// qty > stock -> OutOfStockException and nothing saved`],
            ['Domain exception mapped by the web layer.',
                r`public class OutOfStockException extends RuntimeException {
    public OutOfStockException(long id) { super("Product " + id + " is out of stock"); }
}

@ExceptionHandler(OutOfStockException.class)
@ResponseStatus(HttpStatus.CONFLICT)
public Map<String, String> noStock(OutOfStockException e) {
    return Map.of("error", e.getMessage());
}

// OUTPUT:
// 409 {"error":"Product 5 is out of stock"}`]],
        [['Mockito test of the use case.',
            r`@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock OrderRepository orders;
    @Mock ProductRepository products;
    @InjectMocks OrderService service;

    @Test
    void outOfStockSavesNothing() {
        when(products.findById(5L)).thenReturn(Optional.of(new Product(5L, 1)));
        assertThrows(OutOfStockException.class,
            () -> service.place(new PlaceOrder(5L, 3)));
        verifyNoInteractions(orders);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Reuse from a scheduler.',
                r`@Component
public class StaleOrderJob {
    private final OrderService service;
    public StaleOrderJob(OrderService service) { this.service = service; }

    @Scheduled(cron = "0 0 2 * * *")
    public void run() { service.cancelStaleOrders(); }
}

// OUTPUT:
// 02:00 daily -> cancelStaleOrders runs with the same rules as the REST API`]]
    )
};

export const smvc30Deep: Record<string, Deep> = {
    'mvc-repository-layer': dv(
        [`<p>A Spring Data repository is a JDK proxy created at startup.</p><ul><li><b>Scanning:</b> <code>@EnableJpaRepositories</code> (auto-configured in Boot) finds interfaces extending <code>Repository</code>.</li><li><b>Factory:</b> <code>JpaRepositoryFactoryBean</code> builds a proxy backed by <code>SimpleJpaRepository</code>.</li><li><b>Query methods:</b> <code>PartTree</code> parses names like <code>findByEmailAndActiveTrue</code> into JPA Criteria queries once at startup, so a bad property name fails fast.</li><li><b>Transactions:</b> built-in methods are already transactional; reads are <code>readOnly</code>.</li></ul>`,
            r`public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByEmailAndActiveTrue(String email);
}

// at runtime
System.out.println(repo.getClass().getInterfaces()[0].getSimpleName());
System.out.println(AopUtils.isJdkDynamicProxy(repo));

// OUTPUT:
// UserRepository
// true`],
        [`<p>Repository interface choices:</p><ul><li><b>CrudRepository:</b> basic create, read, update, delete.</li><li><b>ListCrudRepository and PagingAndSortingRepository:</b> lists and paging.</li><li><b>JpaRepository:</b> adds <code>flush</code>, batch deletes and JPA extras.</li><li><b>Query forms:</b> derived names, <code>@Query</code> JPQL, native queries, <code>Specification</code> for dynamic filters.</li><li><b>Modifying:</b> <code>@Modifying</code> for update and delete queries.</li></ul>`,
            r`public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("select o from Order o join fetch o.customer where o.status = :s")
    List<Order> findByStatusWithCustomer(@Param("s") Status s);

    @Modifying
    @Query("update Order o set o.status = :s where o.id in :ids")
    int updateStatus(@Param("s") Status s, @Param("ids") List<Long> ids);

    @Query(value = "select count(*) from orders", nativeQuery = true)
    long rawCount();
}

// OUTPUT:
// findByStatusWithCustomer(NEW) -> 4 orders, customers loaded in one query
// updateStatus(SHIPPED, [1,2])  -> 2`],
        [`<p>Typical repository mistakes:</p><ul><li><b>Wrong property name</b> in a derived method fails at startup with <code>PropertyReferenceException</code>.</li><li><b>Returning an entity with a lazy collection</b> to the web layer causes <code>LazyInitializationException</code>.</li><li><b>findAll() on big tables</b> loads everything; page it.</li><li><b>@Modifying without @Transactional</b> throws <code>TransactionRequiredException</code>.</li><li><b>Optional ignored:</b> calling <code>.get()</code> without checking.</li></ul>`,
            r`// BAD: no such property, app fails to start
// List<User> findByMail(String mail);
// -> PropertyReferenceException: No property 'mail' found for type 'User'

// GOOD
Optional<User> findByEmail(String email);

User u = repo.findByEmail(email)
    .orElseThrow(() -> new UserNotFoundException(email));

// OUTPUT:
// startup fails fast for the bad name; the good version throws a clear business error`],
        [`<p>Tuning repository access:</p><ul><li><b>N+1:</b> use <code>JOIN FETCH</code>, <code>@EntityGraph</code> or <code>hibernate.default_batch_fetch_size</code>.</li><li><b>Projections</b> read only needed columns.</li><li><b>Paging:</b> prefer <code>Slice</code> when the total count is not needed, since it skips the count query.</li><li><b>Read-only transactions</b> let Hibernate skip dirty checking.</li><li><b>Bulk updates</b> with <code>@Modifying</code> instead of loading and saving in a loop.</li><li><b>Index</b> the columns used in derived finders.</li></ul>`,
            r`@EntityGraph(attributePaths = "customer")
List<Order> findByStatus(Status s);

Slice<Order> findSliceByStatus(Status s, Pageable p);   // no count query

# application.properties
spring.jpa.properties.hibernate.default_batch_fetch_size=50
spring.jpa.properties.hibernate.generate_statistics=true

// OUTPUT:
// 1 select with join instead of 1 + N selects
// Slice: select ... limit 21 (no select count)`],
        [`<p>Scenario: an admin screen lists orders with the customer name, 20 per page.</p><ul><li>Entity list would trigger N+1 for customers.</li><li>A DTO projection fetches exactly the columns shown.</li><li>A <code>Pageable</code> from the request drives limit and sort.</li><li>Whitelist sortable fields to avoid errors and information leaks.</li></ul>`,
            r`public record OrderRow(Long id, String number, String customerName) {}

@Query("""
    select new com.app.dto.OrderRow(o.id, o.number, c.name)
    from Order o join o.customer c
    """)
Page<OrderRow> listRows(Pageable pageable);

@GetMapping("/admin/orders")
public Page<OrderRow> list(@PageableDefault(size = 20) Pageable p) {
    return orders.listRows(p);
}

// OUTPUT:
// GET /admin/orders?page=0&size=20&sort=number
// {"content":[{"id":10,"number":"A-1","customerName":"Asha"}],"totalElements":57}`]
    ),

    'mvc-service-layer': dv(
        [`<p>A service bean is normally wrapped by a proxy that adds cross-cutting behaviour.</p><ul><li><b>Creation:</b> component scanning registers <code>@Service</code> classes as singleton beans.</li><li><b>Proxy:</b> <code>@Transactional</code> triggers an AOP proxy (CGLIB for classes) with a <code>TransactionInterceptor</code>.</li><li><b>Call flow:</b> controller calls the proxy, the interceptor opens a transaction, the real method runs, then commit or rollback.</li><li><b>Singleton:</b> keep services stateless so threads do not share mutable fields.</li></ul>`,
            r`@Service
public class UserService { /* @Transactional methods */ }

// at runtime
System.out.println(userService.getClass().getSimpleName().contains("CGLIB"));
System.out.println(AopUtils.isAopProxy(userService));

// OUTPUT:
// true
// true`],
        [`<p>Service design variants:</p><ul><li><b>Concrete class</b> (most common in Boot apps).</li><li><b>Interface plus impl</b> when you need alternatives, such as a mock payment gateway.</li><li><b>Read and write split:</b> a query service with <code>readOnly = true</code> and a command service.</li><li><b>Facade service</b> to orchestrate several smaller services.</li><li><b>Events:</b> publish <code>ApplicationEvent</code> for side effects such as email.</li></ul>`,
            r`@Service
@Transactional(readOnly = true)            // default for the whole class
public class ProductService {
    private final ProductRepository repo;
    private final ApplicationEventPublisher events;
    public ProductService(ProductRepository r, ApplicationEventPublisher e) {
        this.repo = r; this.events = e;
    }

    public ProductDto get(long id) { /* read */ return null; }

    @Transactional                          // overrides: write allowed
    public ProductDto create(CreateProduct req) {
        Product p = repo.save(new Product(req.name()));
        events.publishEvent(new ProductCreated(p.getId()));
        return new ProductDto(p.getId(), p.getName());
    }
}

// OUTPUT:
// get -> read-only transaction; create -> read-write transaction, event published`],
        [`<p>Service layer mistakes:</p><ul><li><b>Self-invocation:</b> <code>this.save()</code> inside the class skips the proxy.</li><li><b>Private or final methods</b> cannot be proxied.</li><li><b>Stateful fields</b> such as a current user stored in a singleton.</li><li><b>Returning entities</b> that the controller then touches lazily.</li><li><b>Catching and hiding</b> exceptions so rollback never happens.</li></ul>`,
            r`@Service
public class ReportService {
    private final ReportService self;       // inject the proxy to fix it
    public ReportService(@Lazy ReportService self) { this.self = self; }

    public void runAll() {
        // BAD: this.saveOne(x) -> no transaction
        self.saveOne(1);                    // GOOD: goes through the proxy
    }

    @Transactional
    public void saveOne(long id) { /* ... */ }
}

// OUTPUT:
// saveOne runs in its own transaction when called through the proxy
// better fix: move saveOne to another bean`],
        [`<p>Tuning the service layer:</p><ul><li><b>Short transactions:</b> do not call remote HTTP services inside a transaction, because connections stay locked.</li><li><b>readOnly = true</b> on queries.</li><li><b>Batch work</b> in chunks, flushing and clearing the persistence context.</li><li><b>Caching:</b> <code>@Cacheable</code> for rarely changing lookups.</li><li><b>Async:</b> <code>@Async</code> for slow side effects such as sending email.</li></ul>`,
            r`@Cacheable("countries")
public List<CountryDto> countries() { return repo.findAllDtos(); }

@Transactional
public void importAll(List<Row> rows) {
    int i = 0;
    for (Row r : rows) {
        em.persist(toEntity(r));
        if (++i % 50 == 0) { em.flush(); em.clear(); }   // keep memory flat
    }
}

// OUTPUT:
// countries: database hit once, then served from cache
// import of 10000 rows runs with a small, constant memory footprint`],
        [`<p>Scenario: user registration sends a welcome email, but a slow mail server must not block or undo the signup.</p><ul><li>The service saves the user in a transaction.</li><li>It publishes an event after the commit.</li><li><code>@TransactionalEventListener</code> sends the email only if the commit succeeded.</li></ul>`,
            r`@Transactional
public UserDto register(CreateUser req) {
    User u = repo.save(new User(req.name(), req.email()));
    events.publishEvent(new UserRegistered(u.getId(), u.getEmail()));
    return new UserDto(u.getId(), u.getName());
}

@Component
class WelcomeMailer {
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void on(UserRegistered e) { mail.send(e.email(), "Welcome!"); }
}

// OUTPUT:
// signup commits first; the email goes out afterwards on another thread
// if the commit fails, no email is sent`]
    ),

    'mvc-controller-layer': dv(
        [`<p>How a request reaches a controller method.</p><ul><li><b>DispatcherServlet</b> receives every request.</li><li><b>HandlerMapping</b> (<code>RequestMappingHandlerMapping</code>) finds the method from path, verb and content type.</li><li><b>HandlerAdapter</b> resolves arguments with <code>HandlerMethodArgumentResolver</code>s and invokes the method.</li><li><b>Return value</b> is handled by a <code>HandlerMethodReturnValueHandler</code>: a view name goes to <code>ViewResolver</code>, a body goes to an <code>HttpMessageConverter</code> (Jackson for JSON).</li><li><b>Errors</b> go to <code>HandlerExceptionResolver</code>s such as <code>@ExceptionHandler</code>.</li></ul>`,
            r`@GetMapping("/api/users/{id}")
public UserDto get(@PathVariable long id) { return service.get(id); }

// logging.level.org.springframework.web=DEBUG shows the steps

// OUTPUT:
// GET "/api/users/1", parameters={}
// Mapped to UserController#get(long)
// Using 'application/json', given [*/*] and supported [application/json]
// Completed 200 OK`],
        [`<p>Argument and return options:</p><ul><li><b>Inputs:</b> <code>@PathVariable</code>, <code>@RequestParam</code>, <code>@RequestHeader</code>, <code>@RequestBody</code>, <code>@ModelAttribute</code> for forms, <code>@CookieValue</code>.</li><li><b>Narrowing:</b> <code>consumes</code>, <code>produces</code>, <code>params</code> and <code>headers</code> on the mapping.</li><li><b>Outputs:</b> a DTO, <code>ResponseEntity</code>, a view name, <code>void</code> with <code>@ResponseStatus</code>.</li><li><b>Shortcuts:</b> <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@PatchMapping</code>, <code>@DeleteMapping</code>.</li></ul>`,
            r`@RestController
@RequestMapping(value = "/api/books", produces = "application/json")
public class BookController {
    @GetMapping
    public List<BookDto> search(@RequestParam(defaultValue = "") String q,
                                @RequestHeader("X-Tenant") String tenant) {
        return service.search(tenant, q);
    }

    @PutMapping(value = "/{id}", consumes = "application/json")
    public BookDto update(@PathVariable long id, @Valid @RequestBody UpdateBook b) {
        return service.update(id, b);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) { service.delete(id); }
}

// OUTPUT:
// GET /api/books?q=java -> 200 [...]
// DELETE /api/books/3   -> 204 (no body)`],
        [`<p>Typical controller mistakes:</p><ul><li><b>@Controller returning an object</b> without <code>@ResponseBody</code>: Spring looks for a view with that name and gives 404.</li><li><b>Missing @RequestBody:</b> the DTO fields stay null.</li><li><b>Wrong content type:</b> posting JSON without the header gives 415.</li><li><b>Business logic</b> inside the method.</li><li><b>Always 200:</b> returning error text with status 200 instead of proper codes.</li><li><b>Missing @Valid:</b> constraints are silently ignored.</li></ul>`,
            r`// BAD: no @RequestBody, so the fields are not read from JSON
// @PostMapping public UserDto create(CreateUser req) { ... }  // all null

// GOOD
@PostMapping
public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUser req) {
    UserDto dto = service.create(req);
    return ResponseEntity.status(HttpStatus.CREATED).body(dto);
}

// OUTPUT:
// BAD  -> name=null email=null stored
// GOOD -> 201 Created with the saved user`],
        [`<p>Controller performance points:</p><ul><li><b>Keep it thin</b>; slow work belongs in services that you can cache or make async.</li><li><b>Return pages</b>, not entire tables.</li><li><b>Compression:</b> <code>server.compression.enabled=true</code> for big JSON.</li><li><b>ETag and caching headers</b> for static-like responses.</li><li><b>Async:</b> return <code>Callable</code> or <code>CompletableFuture</code> to free the servlet thread during long work.</li><li><b>Avoid</b> serializing deep entity graphs.</li></ul>`,
            r`@GetMapping("/report")
public Callable<ReportDto> report() {
    return () -> service.buildReport();      // runs on an MVC async executor
}

@GetMapping("/countries")
public ResponseEntity<List<CountryDto>> countries() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS))
        .body(service.countries());
}

# application.properties
server.compression.enabled=true

// OUTPUT:
// report: request thread released while the report builds
// countries: Cache-Control: max-age=3600`],
        [`<p>Scenario: a public API for products with consistent errors.</p><ul><li>Versioned base path <code>/api/v1</code>.</li><li>DTOs with validation.</li><li>Location header on create.</li><li>One <code>@RestControllerAdvice</code> for all errors.</li></ul>`,
            r`@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    @PostMapping
    public ResponseEntity<ProductDto> create(@Valid @RequestBody CreateProduct r) {
        ProductDto p = service.create(r);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}").buildAndExpand(p.id()).toUri();
        return ResponseEntity.created(uri).body(p);
    }
}

@RestControllerAdvice
class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
        Map<String, String> m = new LinkedHashMap<>();
        e.getFieldErrors().forEach(f -> m.put(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(m);
    }
}

// OUTPUT:
// POST ok      -> 201 Location: http://localhost:8080/api/v1/products/7
// POST invalid -> 400 {"name":"must not be blank"}`]
    ),

    'mvc-dao-pattern': dv(
        [`<p>How the Spring JDBC DAO works inside.</p><ul><li><b>JdbcTemplate</b> gets a connection from the <code>DataSource</code> (usually a HikariCP pool), creates a <code>PreparedStatement</code>, executes it and always closes resources.</li><li><b>Transactions:</b> the connection is bound to the thread by <code>DataSourceTransactionManager</code>, so several DAO calls in one service method share it.</li><li><b>Exceptions:</b> <code>SQLException</code> is translated by <code>SQLErrorCodeSQLExceptionTranslator</code> into <code>DataAccessException</code> subclasses.</li><li><b>RowMapper</b> is called once per row.</li></ul>`,
            r`String sql = "select count(*) from users where active = ?";
Integer n = jdbc.queryForObject(sql, Integer.class, true);
System.out.println("active users: " + n);

// OUTPUT:
// active users: 12
// (internally: borrow connection -> prepare -> execute -> map -> release)`],
        [`<p>Spring JDBC variants:</p><ul><li><b>JdbcTemplate:</b> positional <code>?</code> parameters.</li><li><b>NamedParameterJdbcTemplate:</b> <code>:name</code> parameters.</li><li><b>SimpleJdbcInsert:</b> insert without writing SQL.</li><li><b>JdbcClient</b> (Spring 6.1 and later): a fluent API over the same engine.</li><li><b>BeanPropertyRowMapper:</b> maps columns to bean properties by name.</li><li><b>batchUpdate:</b> many rows in one round trip.</li></ul>`,
            r`NamedParameterJdbcTemplate named;

List<User> found = named.query(
    "select * from users where name like :n and active = :a",
    Map.of("n", "A%", "a", true),
    new BeanPropertyRowMapper<>(User.class));

SimpleJdbcInsert insert = new SimpleJdbcInsert(jdbc)
    .withTableName("users").usingGeneratedKeyColumns("id");
Number id = insert.executeAndReturnKey(Map.of("name", "Ravi", "email", "r@x.com"));

jdbc.batchUpdate("update users set active = ? where id = ?",
    List.of(new Object[]{false, 1L}, new Object[]{false, 2L}));

// OUTPUT:
// found -> 2 users; id -> 3; batchUpdate -> [1, 1]`],
        [`<p>DAO mistakes:</p><ul><li><b>String concatenation</b> in SQL: injection risk.</li><li><b>queryForObject with no row</b> throws <code>EmptyResultDataAccessException</code>; use <code>query</code> and check the list.</li><li><b>Leaking ResultSet</b> or connections when using raw JDBC.</li><li><b>Missing @Repository</b>: no exception translation.</li><li><b>Business logic in the DAO</b> instead of the service.</li><li><b>SELECT *</b> with a RowMapper that misses new columns.</li></ul>`,
            r`// BAD: throws EmptyResultDataAccessException when no row matches
// User u = jdbc.queryForObject("select * from users where id = ?", mapper, 99L);

// GOOD
List<User> rows = jdbc.query("select * from users where id = ?", mapper, 99L);
Optional<User> u = rows.stream().findFirst();

// OUTPUT:
// BAD  -> EmptyResultDataAccessException: Incorrect result size: expected 1, actual 0
// GOOD -> Optional.empty`],
        [`<p>DAO tuning:</p><ul><li><b>Batching</b> with <code>batchUpdate</code> and JDBC batch settings.</li><li><b>Pool size</b>: HikariCP <code>maximum-pool-size</code> matched to database capacity.</li><li><b>fetchSize</b> for large reads, and stream with <code>queryForStream</code> inside a transaction.</li><li><b>Indexes</b> on filtered columns; read the execution plan.</li><li><b>Select only needed columns.</b></li></ul>`,
            r`jdbc.setFetchSize(500);
try (Stream<User> s = jdbc.queryForStream("select * from users", mapper)) {
    s.forEach(this::process);                 // constant memory
}

# application.properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.connection-timeout=3000

// OUTPUT:
// 1,000,000 rows processed with constant memory, never loaded at once`],
        [`<p>Scenario: a legacy reporting query with window functions that JPA cannot express well.</p><ul><li>Keep entities and repositories for normal CRUD.</li><li>Add a small DAO for the report with <code>JdbcClient</code> or <code>JdbcTemplate</code>.</li><li>Return a record per row to the service.</li></ul>`,
            r`public record SalesRank(String region, String rep, BigDecimal total, int rank) {}

@Repository
public class SalesReportDao {
    private final JdbcTemplate jdbc;
    public SalesReportDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<SalesRank> topReps(int limit) {
        return jdbc.query("""
            select region, rep, total, rank() over (
                partition by region order by total desc) as rnk
            from sales_summary
            """, (rs, i) -> new SalesRank(rs.getString("region"),
                rs.getString("rep"), rs.getBigDecimal("total"), rs.getInt("rnk")))
            .stream().filter(r -> r.rank() <= limit).toList();
    }
}

// OUTPUT:
// topReps(1) -> [SalesRank[region=North, rep=Asha, total=90000.00, rank=1], ...]`]
    ),

    'mvc-dto-pattern': dv(
        [`<p>A DTO has no framework magic: it is a plain class, and the framework only converts it.</p><ul><li><b>Request:</b> <code>HttpMessageConverter</code> (Jackson) reads JSON into the DTO, then <code>@Valid</code> runs Hibernate Validator.</li><li><b>Response:</b> Jackson writes the DTO fields to JSON.</li><li><b>Records:</b> Jackson supports them as constructors since 2.12 (Spring Boot 3 includes this).</li><li><b>Mapping</b> between entity and DTO is your own code or a generated MapStruct class.</li></ul>`,
            r`public record CreateUser(
    @NotBlank @Size(max = 50) String name,
    @Email @NotBlank String email) {}

ObjectMapper om = new ObjectMapper();
CreateUser u = om.readValue("{\"name\":\"Asha\",\"email\":\"a@x.com\"}", CreateUser.class);
System.out.println(u);
System.out.println(om.writeValueAsString(u));

// OUTPUT:
// CreateUser[name=Asha, email=a@x.com]
// {"name":"Asha","email":"a@x.com"}`],
        [`<p>DTO styles:</p><ul><li><b>Records:</b> short and immutable.</li><li><b>Classes with Lombok</b> when you need builders or setters.</li><li><b>Separate DTOs per use case:</b> <code>CreateUser</code>, <code>UpdateUser</code>, <code>UserSummary</code>, <code>UserDetail</code>.</li><li><b>MapStruct:</b> an interface with <code>@Mapper(componentModel = "spring")</code> that generates the mapping.</li><li><b>Jackson annotations:</b> <code>@JsonProperty</code>, <code>@JsonIgnore</code>, <code>@JsonInclude</code> to shape JSON.</li></ul>`,
            r`@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User user);
    @Mapping(target = "id", ignore = true)
    User toEntity(CreateUser req);
    List<UserDto> toDtos(List<User> users);
}

public record UserSummary(
    Long id,
    @JsonProperty("full_name") String name,
    @JsonInclude(JsonInclude.Include.NON_NULL) String phone) {}

// OUTPUT:
// MapStruct generates UserMapperImpl at compile time (no reflection at runtime)
// {"id":1,"full_name":"Asha"}   (phone omitted when null)`],
        [`<p>DTO mistakes:</p><ul><li><b>One DTO for everything</b> leads to nullable fields and unclear rules.</li><li><b>Entity inside a DTO</b> brings the persistence model back.</li><li><b>Validation on the entity only</b>: the request DTO is the right place for input rules.</li><li><b>Manual mapping errors</b>: forgetting a new field; MapStruct with <code>unmappedTargetPolicy = ERROR</code> catches this.</li><li><b>Mutable DTOs</b> shared across threads.</li></ul>`,
            r`@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface OrderMapper {
    OrderDto toDto(Order order);
}

// OUTPUT:
// if OrderDto gains a field that Order lacks, the build fails:
// error: Unmapped target property: "discount"`],
        [`<p>DTO performance:</p><ul><li><b>Projection queries</b> avoid loading and then discarding columns.</li><li><b>Compile-time mapping</b> (MapStruct) is faster than reflection mappers.</li><li><b>Smaller payloads</b> mean less serialization and network time.</li><li><b>Avoid mapping inside loops</b> that trigger lazy queries; fetch needed data first.</li></ul>`,
            r`// one query, one mapping pass, no lazy loading
@Query("select new com.app.dto.UserSummary(u.id, u.name, u.phone) from User u")
Page<UserSummary> summaries(Pageable p);

// OUTPUT:
// select u.id, u.name, u.phone from users u limit ?
// (no entities created, no persistence context bloat)`],
        [`<p>Scenario: the public API must not expose internal flags.</p><ul><li>The entity has <code>passwordHash</code>, <code>role</code> and <code>deleted</code>.</li><li>The public DTO has only id, name and avatar.</li><li>An admin DTO adds role.</li><li>Two mappers keep the views apart, and tests assert that secrets never appear in JSON.</li></ul>`,
            r`public record PublicUser(Long id, String name, String avatarUrl) {}
public record AdminUser(Long id, String name, String role, boolean deleted) {}

@Test
void publicJsonHasNoSecrets() throws Exception {
    mvc.perform(get("/api/users/1"))
       .andExpect(jsonPath("$.passwordHash").doesNotExist())
       .andExpect(jsonPath("$.role").doesNotExist())
       .andExpect(jsonPath("$.name").value("Asha"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),

    'mvc-entity-mapping': dv(
        [`<p>What JPA does with a mapped entity.</p><ul><li><b>Metadata:</b> at startup Hibernate reads annotations into a metamodel and checks the schema if <code>validate</code> is on.</li><li><b>Persistence context:</b> the <code>EntityManager</code> tracks managed entities by id (first-level cache).</li><li><b>Dirty checking:</b> at flush Hibernate compares fields to a snapshot and issues UPDATEs, so no explicit save is needed inside a transaction.</li><li><b>Lazy proxies:</b> lazy associations are replaced by proxies that load on first access.</li><li><b>Entity states:</b> transient, managed, detached, removed.</li></ul>`,
            r`@Transactional
public void rename(long id, String name) {
    User u = repo.findById(id).orElseThrow();   // managed
    u.setName(name);                            // no save() call
}   // commit -> flush -> update users set name=? where id=?

// OUTPUT:
// Hibernate: select ... from users where id=?
// Hibernate: update users set name=?, email=? where id=?`],
        [`<p>Mapping options:</p><ul><li><b>Id strategies:</b> <code>IDENTITY</code>, <code>SEQUENCE</code>, <code>UUID</code>; SEQUENCE allows insert batching.</li><li><b>Value types:</b> <code>@Embeddable</code> and <code>@Embedded</code> for groups like Address.</li><li><b>Inheritance:</b> <code>SINGLE_TABLE</code>, <code>JOINED</code>, <code>TABLE_PER_CLASS</code>.</li><li><b>Many to many:</b> <code>@ManyToMany</code> with <code>@JoinTable</code>, or an explicit join entity when the link has data.</li><li><b>Others:</b> <code>@Lob</code>, <code>@Transient</code>, <code>@CreatedDate</code> with auditing, <code>@Version</code>.</li></ul>`,
            r`@Embeddable
public class Address {
    private String street;
    private String city;
}

@Entity
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Embedded private Address address;

    @ManyToMany
    @JoinTable(name = "emp_skill",
        joinColumns = @JoinColumn(name = "emp_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<Skill> skills = new HashSet<>();

    @Transient private int cachedScore;
}

// OUTPUT:
// employee(id, street, city) and emp_skill(emp_id, skill_id)`],
        [`<p>Mapping mistakes:</p><ul><li><b>EAGER everywhere</b> causes huge joins.</li><li><b>@OneToMany without mappedBy</b> creates an extra join table.</li><li><b>Lombok @Data on entities</b>: toString and hashCode walk relations and loop forever.</li><li><b>List for @ManyToMany</b> makes removal delete and reinsert all links; use a Set.</li><li><b>EnumType.ORDINAL</b> default.</li><li><b>No no-arg constructor</b>: JPA needs one (protected is fine).</li></ul>`,
            r`@Entity
public class Customer {
    @OneToMany(mappedBy = "customer")             // GOOD: inverse side
    private List<Order> orders = new ArrayList<>();

    protected Customer() { }                      // required by JPA

    @Override public boolean equals(Object o) {
        return o instanceof Customer c && id != null && id.equals(c.id);
    }
    @Override public int hashCode() { return getClass().hashCode(); }
}

// OUTPUT:
// no extra join table, no infinite toString loop, stable hashCode for sets`],
        [`<p>Mapping and performance:</p><ul><li><b>Lazy by default</b>, then fetch with <code>JOIN FETCH</code> when needed.</li><li><b>Batch inserts</b>: SEQUENCE ids plus <code>hibernate.jdbc.batch_size</code>.</li><li><b>@BatchSize</b> on collections to cut N+1.</li><li><b>Indexes</b> declared in <code>@Table(indexes = ...)</code> and managed through migrations.</li><li><b>Open session in view</b>: set <code>spring.jpa.open-in-view=false</code> so lazy loading does not leak into the web layer.</li></ul>`,
            r`@Entity
@Table(name = "orders", indexes = @Index(name = "ix_orders_customer",
                                         columnList = "customer_id"))
public class Order { /* ... */ }

# application.properties
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true

// OUTPUT:
// 1000 inserts are sent as about 20 JDBC batches instead of 1000 statements`],
        [`<p>Scenario: an online shop with customers, orders and order lines.</p><ul><li>Customer has many orders; order has many lines (cascade and orphan removal).</li><li>Order total is calculated by the aggregate root.</li><li>Money uses <code>BigDecimal</code>.</li><li>Schema comes from Flyway, validated by Hibernate.</li></ul>`,
            r`@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE) private Long id;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderLine> lines = new ArrayList<>();

    @Column(precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    public void addLine(Product p, int qty) {
        OrderLine l = new OrderLine(this, p, qty);
        lines.add(l);
        total = total.add(p.getPrice().multiply(BigDecimal.valueOf(qty)));
    }
}

# application.properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true

// OUTPUT:
// order.addLine(pen, 3) -> total = 7.50; save(order) inserts the order and its lines`]
    ),

    'mvc-transaction-management': dv(
        [`<p>Declarative transactions run through AOP.</p><ul><li><b>Setup:</b> Boot auto-configures <code>@EnableTransactionManagement</code> and a <code>PlatformTransactionManager</code> (<code>JpaTransactionManager</code> with JPA).</li><li><b>Interceptor:</b> <code>TransactionInterceptor</code> reads the attribute, asks the manager for a transaction, calls the method and then commits or rolls back.</li><li><b>Thread binding:</b> the connection or <code>EntityManager</code> is stored in <code>TransactionSynchronizationManager</code> thread locals, so repositories join the same transaction.</li><li><b>Rollback-only:</b> an unchecked exception in an inner joined method marks the whole transaction rollback-only.</li></ul>`,
            r`@Transactional
public void work() {
    System.out.println(TransactionSynchronizationManager
        .isActualTransactionActive());
    System.out.println(TransactionSynchronizationManager
        .getCurrentTransactionName());
}

// OUTPUT:
// true
// com.app.service.WorkService.work`],
        [`<p>Attributes of <code>@Transactional</code>:</p><ul><li><b>propagation:</b> <code>REQUIRED</code>, <code>REQUIRES_NEW</code>, <code>SUPPORTS</code>, <code>MANDATORY</code>, <code>NOT_SUPPORTED</code>, <code>NEVER</code>, <code>NESTED</code>.</li><li><b>isolation:</b> <code>DEFAULT</code>, <code>READ_COMMITTED</code>, <code>REPEATABLE_READ</code>, <code>SERIALIZABLE</code>.</li><li><b>readOnly</b> and <b>timeout</b> (seconds).</li><li><b>rollbackFor</b> and <b>noRollbackFor</b>.</li><li><b>Programmatic:</b> <code>TransactionTemplate</code> for fine-grained control.</li></ul>`,
            r`@Transactional(propagation = Propagation.REQUIRES_NEW, timeout = 5)
public void writeAudit(String msg) {
    audit.save(new AuditLog(msg));        // commits even if the caller rolls back
}

@Transactional(isolation = Isolation.REPEATABLE_READ, readOnly = true)
public BigDecimal balanceReport() { return accounts.sumBalances(); }

// programmatic
tx.execute(status -> {
    repo.save(new Item("x"));
    if (problem) status.setRollbackOnly();
    return null;
});

// OUTPUT:
// audit row committed independently; report sees a stable snapshot`],
        [`<p>Transaction mistakes:</p><ul><li><b>Self-invocation</b> and <b>private methods</b>: no proxy, no transaction.</li><li><b>Catching exceptions</b> so Spring never sees them.</li><li><b>Checked exceptions</b> without <code>rollbackFor</code>.</li><li><b>@Transactional on the controller</b> or on a final class method.</li><li><b>Using the wrong annotation:</b> prefer Spring <code>@Transactional</code> or the Jakarta one consistently.</li><li><b>Inner REQUIRED failure:</b> caller sees <code>UnexpectedRollbackException</code>.</li></ul>`,
            r`@Transactional
public void outer() {
    try {
        inner.fail();                 // inner is REQUIRED and throws RuntimeException
    } catch (RuntimeException e) {
        // swallowed, but the shared transaction is already rollback-only
    }
}   // commit attempt -> UnexpectedRollbackException

// FIX: make inner REQUIRES_NEW, or do not swallow the exception

// OUTPUT:
// org.springframework.transaction.UnexpectedRollbackException:
// Transaction silently rolled back because it has been marked as rollback-only`],
        [`<p>Tuning transactions:</p><ul><li><b>Keep them short</b>: no remote calls, file work or user waits inside.</li><li><b>readOnly = true</b> for queries.</li><li><b>Lower isolation</b> only when the rules allow.</li><li><b>Lock carefully</b>: optimistic with <code>@Version</code> first, pessimistic (<code>@Lock</code>) for hot rows.</li><li><b>Pool sizing</b>: a long transaction holds a pooled connection.</li><li><b>Timeouts</b> to avoid stuck locks.</li></ul>`,
            r`public interface AccountRepository extends JpaRepository<Account, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "2000"))
    @Query("select a from Account a where a.id = :id")
    Optional<Account> lockById(@Param("id") long id);
}

// OUTPUT:
// select ... from account where id=? for update
// a second transaction waits up to 2 seconds, then fails with a lock timeout`],
        [`<p>Scenario: place an order, charge the card and write an audit record.</p><ul><li>Order and stock changes share one transaction.</li><li>The audit log uses <code>REQUIRES_NEW</code> so failures are recorded too.</li><li>The remote payment call happens after commit using an event, to keep the transaction short.</li></ul>`,
            r`@Transactional
public OrderDto place(PlaceOrder req) {
    try {
        Order o = createOrderAndReserveStock(req);
        events.publishEvent(new OrderPlaced(o.getId()));
        return toDto(o);
    } catch (RuntimeException e) {
        auditService.writeAudit("place failed: " + e.getMessage());   // REQUIRES_NEW
        throw e;                                                      // rollback order
    }
}

// OUTPUT:
// failure -> order and stock rolled back, audit row kept
// success -> OrderPlaced event; payment is called after the commit`]
    ),

    'mvc-database-exception-handling': dv(
        [`<p>How Spring converts and delivers database errors.</p><ul><li><b>Translation:</b> <code>PersistenceExceptionTranslationPostProcessor</code> wraps <code>@Repository</code> beans; Hibernate and JDBC exceptions become <code>DataAccessException</code> subtypes.</li><li><b>Hierarchy:</b> <code>NonTransientDataAccessException</code> (do not retry) versus <code>TransientDataAccessException</code> (may retry).</li><li><b>Spring Data repositories</b> are translated automatically.</li><li><b>Web side:</b> an uncaught exception reaches <code>ExceptionHandlerExceptionResolver</code>, which looks for a matching <code>@ExceptionHandler</code> method.</li></ul>`,
            r`try {
    repo.saveAndFlush(new User("A", "dup@x.com"));
} catch (DataAccessException e) {
    System.out.println(e.getClass().getSimpleName());
    System.out.println(e.getMostSpecificCause().getClass().getSimpleName());
}

// OUTPUT: (varies by database)
// DataIntegrityViolationException
// JdbcSQLIntegrityConstraintViolationException`],
        [`<p>Commonly used exception types:</p><ul><li><b>DuplicateKeyException:</b> unique key broken (JDBC).</li><li><b>DataIntegrityViolationException:</b> any constraint failure (also JPA).</li><li><b>EmptyResultDataAccessException</b> and <b>IncorrectResultSizeDataAccessException</b>.</li><li><b>OptimisticLockingFailureException</b> and <b>PessimisticLockingFailureException</b>.</li><li><b>CannotAcquireLockException</b> and <b>QueryTimeoutException</b> (transient).</li><li><b>Handler styles:</b> controller-local <code>@ExceptionHandler</code>, <code>@RestControllerAdvice</code>, <code>ProblemDetail</code> (RFC 7807) in Spring 6.</li></ul>`,
            r`@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail conflict(DataIntegrityViolationException e) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT, "Request conflicts with existing data");
        pd.setTitle("Conflict");
        return pd;
    }
}

// OUTPUT:
// 409 {"type":"about:blank","title":"Conflict","status":409,
//      "detail":"Request conflicts with existing data","instance":"/api/users"}`],
        [`<p>Typical mistakes:</p><ul><li><b>Returning e.getMessage()</b> to clients leaks SQL and table names.</li><li><b>Catching Exception</b> broadly so rollback is lost.</li><li><b>Expecting the error at save()</b> when the flush is delayed.</li><li><b>Catching and continuing in the same transaction</b> after a failed statement; the session may be unusable.</li><li><b>Treating every error as 500</b> when 404 or 409 is correct.</li><li><b>No logging</b> of the root cause.</li></ul>`,
            r`// BAD
@ExceptionHandler(Exception.class)
public String all(Exception e) { return e.getMessage(); }   // leaks details

// GOOD
@ExceptionHandler(DataIntegrityViolationException.class)
public ResponseEntity<Map<String, String>> conflict(DataIntegrityViolationException e) {
    log.warn("constraint failure", e);                      // full cause in the log
    return ResponseEntity.status(409).body(Map.of("error", "Duplicate or invalid data"));
}

// OUTPUT:
// BAD  -> could return: could not execute statement; constraint [uk_users_email]
// GOOD -> 409 {"error":"Duplicate or invalid data"}`],
        [`<p>Resilience and tuning:</p><ul><li><b>Retry transient errors</b> (deadlocks, lock timeouts) with <code>@Retryable</code> from Spring Retry, with backoff and a limit.</li><li><b>Check before insert</b> for friendly messages, but still handle the constraint error because of race conditions.</li><li><b>Query timeouts</b> via <code>@Transactional(timeout = ...)</code> or <code>jakarta.persistence.query.timeout</code>.</li><li><b>Metrics</b>: count failures per type.</li></ul>`,
            r`@Retryable(retryFor = TransientDataAccessException.class,
           maxAttempts = 3, backoff = @Backoff(delay = 200, multiplier = 2))
@Transactional
public void debit(long id, BigDecimal amt) { /* may hit a deadlock */ }

@Recover
public void giveUp(TransientDataAccessException e, long id, BigDecimal amt) {
    throw new ServiceBusyException("Please try again later");
}

// OUTPUT:
// attempt 1 deadlock -> wait 200 ms -> attempt 2 succeeds
// three failures -> ServiceBusyException -> 503`],
        [`<p>Scenario: sign-up with a unique email under concurrent requests.</p><ul><li>The service checks <code>existsByEmail</code> for a friendly path.</li><li>Two simultaneous requests can both pass the check.</li><li>The unique index is the real guard; the loser gets <code>DataIntegrityViolationException</code>.</li><li>The service converts it into a domain exception, and the advice returns 409.</li></ul>`,
            r`@Transactional
public UserDto register(CreateUser req) {
    if (repo.existsByEmail(req.email()))
        throw new EmailTakenException(req.email());
    try {
        return toDto(repo.saveAndFlush(new User(req.name(), req.email())));
    } catch (DataIntegrityViolationException e) {
        throw new EmailTakenException(req.email());      // lost the race
    }
}

@ExceptionHandler(EmailTakenException.class)
@ResponseStatus(HttpStatus.CONFLICT)
public Map<String, String> taken(EmailTakenException e) {
    return Map.of("error", "Email already registered");
}

// OUTPUT:
// request A -> 201 Created
// request B (same email, same instant) -> 409 {"error":"Email already registered"}`]
    ),

    'mvc-controller-layer-layers': dv(
        [`<p>Where the controller sits at runtime.</p><ul><li><b>Servlet container</b> (Tomcat) hands the request to <code>DispatcherServlet</code> after filters run.</li><li><b>Interceptors</b> (<code>HandlerInterceptor</code>) run before and after the controller method.</li><li><b>Controller</b> is a singleton bean; its method runs on a request thread.</li><li><b>Layer calls:</b> controller to service proxy to repository proxy to <code>DataSource</code>.</li><li><b>Response:</b> converters write the body, then filters see the response.</li></ul>`,
            r`// request pipeline
// Filter chain (security, logging)
//   -> DispatcherServlet
//      -> HandlerInterceptor.preHandle
//         -> Controller method
//            -> Service (transaction proxy)
//               -> Repository -> Database
//      <- HandlerInterceptor.postHandle / afterCompletion
// <- Filter chain

// OUTPUT:
// each layer is entered once per request and left in reverse order`],
        [`<p>Layering styles:</p><ul><li><b>Classic three layers:</b> controller, service, repository.</li><li><b>Package by feature</b> (<code>user</code>, <code>order</code>) instead of by layer, each with its own controller, service and repository.</li><li><b>Hexagonal:</b> controllers are one adapter around a core of use cases and ports.</li><li><b>ArchUnit</b> tests can enforce the allowed dependencies.</li></ul>`,
            r`@AnalyzeClasses(packages = "com.app")
class LayerRulesTest {
    @ArchTest
    static final ArchRule layers = layeredArchitecture()
        .consideringAllDependencies()
        .layer("Controller").definedBy("..controller..")
        .layer("Service").definedBy("..service..")
        .layer("Repository").definedBy("..repository..")
        .whereLayer("Controller").mayNotBeAccessedByAnyLayer()
        .whereLayer("Service").mayOnlyBeAccessedByLayers("Controller", "Service")
        .whereLayer("Repository").mayOnlyBeAccessedByLayers("Service");
}

// OUTPUT:
// build fails if a controller imports a repository directly`],
        [`<p>Layer violations to avoid:</p><ul><li><b>Controller to repository</b> shortcuts.</li><li><b>Business rules in the controller</b>, such as price or permission logic.</li><li><b>Service using HttpServletRequest</b>, <code>HttpSession</code> or <code>ResponseEntity</code>.</li><li><b>Entities in JSON</b>.</li><li><b>Duplicated error handling</b> in every method with try and catch.</li></ul>`,
            r`// BAD: web type leaks into the service
// public void register(HttpServletRequest req) { ... req.getParameter("name") ... }

// GOOD: controller extracts, service receives plain data
@PostMapping("/register")
public UserDto register(@Valid @RequestBody CreateUser req, Principal who) {
    return service.register(req, who.getName());
}

// OUTPUT:
// service.register(CreateUser, String) can be unit tested with no web classes`],
        [`<p>Layer-aware testing keeps the suite fast.</p><ul><li><b>@WebMvcTest</b> loads only controllers, advice and converters.</li><li><b>Mockito</b> tests services in milliseconds.</li><li><b>@DataJpaTest</b> tests repositories.</li><li><b>@SpringBootTest</b> only for a few end to end flows.</li><li>Use <code>@MockBean</code> sparingly; many of them slow down context caching.</li></ul>`,
            r`@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class OrderFlowIT {
    @Autowired TestRestTemplate rest;

    @Test
    void placesAndReadsOrder() {
        ResponseEntity<OrderDto> r = rest.postForEntity(
            "/api/orders", new PlaceOrder(5L, 1), OrderDto.class);
        assertEquals(HttpStatus.CREATED, r.getStatusCode());
        assertNotNull(rest.getForObject(
            "/api/orders/" + r.getBody().id(), OrderDto.class));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0   (slow: full context, real database)`],
        [`<p>Scenario: mobile and web clients share the same business rules.</p><ul><li>An <code>OrderController</code> serves JSON to the mobile app.</li><li>An MVC <code>OrderPageController</code> serves HTML to the website.</li><li>Both call the same <code>OrderService</code>, so rules stay identical.</li></ul>`,
            r`@RestController @RequestMapping("/api/orders")
class OrderApiController {
    @GetMapping("/{id}") OrderDto get(@PathVariable long id) { return service.get(id); }
}

@Controller @RequestMapping("/orders")
class OrderPageController {
    @GetMapping("/{id}")
    String page(@PathVariable long id, Model model) {
        model.addAttribute("order", service.get(id));
        return "order-detail";
    }
}

// OUTPUT:
// GET /api/orders/10 -> JSON; GET /orders/10 -> HTML page; same OrderService`]
    ),

    'mvc-service-layer-layers': dv(
        [`<p>The service layer is where the transaction and the use case meet.</p><ul><li><b>Entry:</b> the controller calls a Spring proxy of the service bean.</li><li><b>Transaction:</b> the proxy opens it, the method runs, the proxy commits.</li><li><b>Collaborators:</b> the method calls repositories (joining the same transaction) and other services.</li><li><b>Output:</b> returns DTOs or values; failures are exceptions.</li><li>The persistence context lives for the transaction, so entities are managed inside the service and detached outside it.</li></ul>`,
            r`@Transactional
public void approve(long id) {
    Order o = orders.findById(id).orElseThrow();   // managed
    o.approve();                                   // rule inside entity
    audit.record(o);                               // joins same transaction
}

// OUTPUT:
// select order; update order set status='APPROVED'; insert into audit
// one commit at the end of approve`],
        [`<p>Ways to organise services:</p><ul><li><b>One service per aggregate</b> (<code>OrderService</code>, <code>CustomerService</code>).</li><li><b>Per use case</b> classes (<code>PlaceOrderService</code>) for large apps.</li><li><b>Domain services</b> for rules spanning several entities.</li><li><b>Application services</b> that orchestrate and own transactions.</li><li><b>Port interfaces</b> for outside systems such as <code>PaymentGateway</code>.</li></ul>`,
            r`public interface PaymentGateway {
    PaymentResult charge(String customerId, BigDecimal amount);
}

@Service
@Profile("prod")
class StripeGateway implements PaymentGateway { /* real call */
    public PaymentResult charge(String c, BigDecimal a) { return null; }
}

@Service
@Profile("test")
class FakeGateway implements PaymentGateway {
    public PaymentResult charge(String c, BigDecimal a) {
        return PaymentResult.ok("fake-" + c);
    }
}

// OUTPUT:
// tests use FakeGateway; production uses StripeGateway; services never change`],
        [`<p>Service layer mistakes:</p><ul><li><b>God service</b> with 50 methods; split by aggregate or use case.</li><li><b>Pass-through services</b> that only call the repository with no value; acceptable only if rules are expected to grow.</li><li><b>Remote calls inside a transaction.</b></li><li><b>Circular injection</b> between two services.</li><li><b>Returning null</b> instead of <code>Optional</code> or an exception.</li></ul>`,
            r`// BAD: circular dependency
// class A { A(B b) {} }   class B { B(A a) {} }
// -> BeanCurrentlyInCreationException

// GOOD: extract the shared part
@Service class PricingService { /* shared rules */ }
@Service class OrderService   { OrderService(PricingService p) {} }
@Service class InvoiceService { InvoiceService(PricingService p) {} }

// OUTPUT:
// BAD  -> startup failure: circular reference
// GOOD -> context starts normally`],
        [`<p>Service layer performance and safety:</p><ul><li><b>Short transactions</b> and <code>readOnly</code> for reads.</li><li><b>Cache</b> stable lookups with <code>@Cacheable</code> and evict on change.</li><li><b>Async or events</b> for slow side effects.</li><li><b>Idempotency</b>: make operations safe to retry using request ids.</li><li><b>Avoid per-row service calls</b> in loops; add a bulk method.</li></ul>`,
            r`@Cacheable(value = "products", key = "#id")
public ProductDto get(long id) { return toDto(repo.findById(id).orElseThrow()); }

@CacheEvict(value = "products", key = "#id")
@Transactional
public void update(long id, UpdateProduct req) { /* ... */ }

// bulk instead of N calls
public Map<Long, ProductDto> getAll(Collection<Long> ids) {
    return repo.findAllById(ids).stream()
        .collect(Collectors.toMap(Product::getId, this::toDto));
}

// OUTPUT:
// get(5) twice -> one database read; getAll([1,2,3]) -> one query (where id in (...))`],
        [`<p>Scenario: cancel an order. Rules: only NEW or PAID orders, refund if paid, restore stock, notify the customer.</p><ul><li>One service method owns the rule order.</li><li>Entity guards its own state change.</li><li>Refund and stock restore happen in the same transaction.</li><li>The email is sent after commit.</li></ul>`,
            r`@Transactional
public OrderDto cancel(long id) {
    Order o = orders.findById(id).orElseThrow(() -> new OrderNotFoundException(id));
    o.cancel();                                   // throws if status is SHIPPED
    if (o.isPaid()) payments.refund(o.getPaymentRef());
    o.getLines().forEach(l -> l.getProduct().restock(l.getQty()));
    events.publishEvent(new OrderCancelled(o.getId()));
    return new OrderDto(o.getId(), o.getStatus().name());
}

// OUTPUT:
// NEW order     -> CANCELLED, stock restored
// SHIPPED order -> IllegalStateException: cannot cancel a shipped order (rolled back)`]
    )
};
