// Spring extras, batch smvc31 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc31Extras: Record<string, Extra> = {
    'mvc-repository-layer-layers': x(
        ['<b>Repository layer</b> is the part of the app that stores and loads data; services call it and never write SQL themselves.',
            '<b>Spring Data JPA</b> lets you declare an interface that extends <code>JpaRepository</code>, and Spring generates the implementation at startup.',
            '<b>Annotation</b>: <code>@Repository</code> marks the bean and translates persistence exceptions into <code>DataAccessException</code>.'],
        ['<b>Derived queries</b>: a method such as <code>findByEmailIgnoreCase</code> becomes a query from its name; use <code>@Query</code> when the name gets too long.',
            '<b>Transactions</b> belong to the service layer, so one business action can call several repositories in one commit.',
            '<b>Return types</b>: use <code>Optional&lt;T&gt;</code> for single results and <code>Page&lt;T&gt;</code> for paged lists.'],
        ['<b>Test slice</b>: <code>@DataJpaTest</code> loads only JPA beans and an embedded database, which makes repository tests fast.',
            '<b>N+1 selects</b>: lazy associations loaded in a loop; fix with <code>@EntityGraph</code> or a <code>join fetch</code> query.',
            '<b>Projections</b>: return interfaces or records instead of full entities when a screen needs only a few columns.'],
        [['F', 'What does the repository layer do?', 'It reads and writes data in the database and hides the storage details from the service layer.'],
            ['F', 'What is JpaRepository?', 'A Spring Data interface that gives ready-made methods such as save, findById, findAll and deleteById.'],
            ['M', 'How does Spring create a repository without an implementation class?', 'At startup it builds a JDK proxy backed by SimpleJpaRepository and parses the method names into queries.'],
            ['M', 'Where should @Transactional go?', 'On service methods, so several repository calls share one transaction.'],
            ['S', 'How do you avoid the N+1 problem?', 'Use join fetch, @EntityGraph or batch fetching, and check the SQL log in tests.'],
            ['S', 'Repository or DAO in Spring Data?', 'A repository is a collection-like abstraction over aggregates; a DAO is closer to table access. Spring Data uses the repository style.']],
        [['A first repository.',
            r`public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByActiveTrueOrderByNameAsc();
}

// usage in a service
User u = userRepository.findByEmail("asha@x.com").orElseThrow();
System.out.println(u.getName());

// OUTPUT:
// Asha`],
            ['Custom query with paging.',
                r`@Query("select u from User u where u.name like %:q%")
Page<User> search(@Param("q") String q, Pageable pageable);

Page<User> page = userRepository.search("as", PageRequest.of(0, 2));
System.out.println(page.getTotalElements() + " " + page.getContent().size());

// OUTPUT:
// 3 2`]],
        [['Repository test with @DataJpaTest.',
            r`@DataJpaTest
class UserRepositoryTest {
    @Autowired UserRepository repo;

    @Test
    void findsByEmail() {
        repo.save(new User("Asha", "asha@x.com"));
        assertTrue(repo.findByEmail("asha@x.com").isPresent());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Service uses the repository.',
                r`@Service
public class UserService {
    private final UserRepository repo;
    public UserService(UserRepository repo) { this.repo = repo; }

    @Transactional(readOnly = true)
    public User get(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
    }
}

// OUTPUT:
// get(1) returns the User; get(99) throws UserNotFoundException`]]
    ),

    'mvc-dao-layer': x(
        ['<b>DAO</b> (Data Access Object) is a class that holds all database access code for one entity, so the rest of the app never sees JDBC or SQL.',
            '<b>Purpose</b>: change the database or the query style by editing only the DAO, not the service or the controller.',
            '<b>Spring support</b>: mark a DAO class with <code>@Repository</code> and use <code>JdbcTemplate</code> or <code>EntityManager</code> inside it.'],
        ['<b>Interface plus class</b>: an interface <code>UserDao</code> and an implementation <code>JdbcUserDao</code> let you swap and mock the storage.',
            '<b>JdbcTemplate</b> opens and closes connections for you and maps rows with a <code>RowMapper</code>.',
            '<b>Exceptions</b>: Spring turns <code>SQLException</code> into unchecked <code>DataAccessException</code> subclasses.'],
        ['<b>DAO versus repository</b>: with Spring Data you often need no hand-written DAO; keep a DAO for complex SQL, reports and batch work.',
            '<b>Parameters</b>: always bind with <code>?</code> or named parameters to avoid SQL injection.',
            '<b>Batching</b>: <code>batchUpdate</code> sends many rows in few round trips.'],
        [['F', 'What is a DAO?', 'A class that contains the database access code for one entity or table.'],
            ['F', 'Which annotation marks a DAO in Spring?', '@Repository.'],
            ['M', 'What does JdbcTemplate do for you?', 'It manages connections, statements and resources, and converts SQLException to DataAccessException.'],
            ['M', 'What is a RowMapper?', 'A callback that turns one ResultSet row into an object.'],
            ['S', 'When keep a DAO even with Spring Data JPA?', 'For hand-tuned SQL, reporting queries and bulk operations that derived queries cannot express well.'],
            ['S', 'How do you stop SQL injection in a DAO?', 'Use bind parameters (PreparedStatement style) and never concatenate user input into SQL.']],
        [['DAO interface and JDBC implementation.',
            r`public interface UserDao {
    Optional<User> findById(long id);
    int insert(User u);
}

@Repository
public class JdbcUserDao implements UserDao {
    private final JdbcTemplate jdbc;
    public JdbcUserDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Optional<User> findById(long id) {
        return jdbc.query("select id, name from users where id = ?",
            (rs, n) -> new User(rs.getLong("id"), rs.getString("name")), id)
            .stream().findFirst();
    }
    public int insert(User u) {
        return jdbc.update("insert into users(name) values (?)", u.getName());
    }
}

// OUTPUT:
// findById(1) -> Optional[User(1, Asha)]; insert -> 1 row`],
            ['Batch insert.',
                r`List<Object[]> rows = List.of(
    new Object[]{"Ravi"}, new Object[]{"Meena"});
int[] counts = jdbc.batchUpdate("insert into users(name) values (?)", rows);
System.out.println(Arrays.toString(counts));

// OUTPUT:
// [1, 1]`]],
        [['Testing a DAO with an embedded database.',
            r`@JdbcTest
@Import(JdbcUserDao.class)
class JdbcUserDaoTest {
    @Autowired JdbcUserDao dao;

    @Test
    void insertsAndReads() {
        dao.insert(new User(0, "Asha"));
        assertTrue(dao.findById(1).isPresent());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Catching the translated exception.',
                r`try {
    dao.insert(new User(0, null));      // name is NOT NULL
} catch (DataIntegrityViolationException e) {
    System.out.println("rejected: " + e.getClass().getSimpleName());
}

// OUTPUT:
// rejected: DataIntegrityViolationException`]]
    ),

    'mvc-entity-layer': x(
        ['<b>Entity</b> is a Java class mapped to a database table; each object is one row and each field is a column.',
            '<b>Annotations</b>: <code>@Entity</code>, <code>@Table</code>, <code>@Id</code> and <code>@GeneratedValue</code> describe the mapping.',
            '<b>Domain model</b>: the entity layer holds the data and the rules that belong to the data, and it is not the same as the JSON sent to clients.'],
        ['<b>Columns</b>: <code>@Column(nullable = false, length = 100)</code> sets constraints that the schema and validation can use.',
            '<b>Relations</b>: <code>@OneToMany</code> and <code>@ManyToOne</code> link entities; the owning side holds the foreign key.',
            '<b>No-arg constructor</b>: JPA needs one (it may be protected) to create objects when it loads rows.'],
        ['<b>equals and hashCode</b>: base them on a business key or the id carefully, because entities live in sets and persistence contexts.',
            '<b>Lazy loading</b>: touching a lazy field after the session closes gives <code>LazyInitializationException</code>.',
            '<b>Do not expose entities</b> from controllers: it leaks columns and causes infinite JSON loops with bidirectional links.'],
        [['F', 'What is an entity?', 'A class annotated with @Entity that maps to a table row.'],
            ['F', 'Which annotation marks the primary key?', '@Id, often with @GeneratedValue.'],
            ['M', 'Why does JPA need a no-arg constructor?', 'The provider creates instances by reflection before it fills the fields from the row.'],
            ['M', 'What is the owning side of a relation?', 'The side with the foreign key column; the other side uses mappedBy.'],
            ['S', 'Why not return entities from a controller?', 'It couples the API to the schema, can expose private data and can trigger lazy loading or recursion.'],
            ['S', 'How should equals and hashCode work on entities?', 'Use a stable business key, or the id with a null check, and never include lazy collections.']],
        [['A simple entity.',
            r`@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true)
    private String email;

    protected User() { }                       // for JPA
    public User(String name, String email) { this.name = name; this.email = email; }
    // getters omitted
}

// OUTPUT:
// create table users (id bigint generated by default as identity,
//   name varchar(100) not null, email varchar(255) unique, primary key (id))`],
            ['One to many relation.',
                r`@Entity
public class Department {
    @Id @GeneratedValue private Long id;
    private String name;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Employee> employees = new ArrayList<>();
}

@Entity
public class Employee {
    @Id @GeneratedValue private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
}

// OUTPUT:
// employee table gets a department_id foreign key column`]],
        [['Entity mapping test.',
            r`@DataJpaTest
class UserEntityTest {
    @Autowired TestEntityManager em;

    @Test
    void generatesId() {
        User u = em.persistAndFlush(new User("Asha", "asha@x.com"));
        assertNotNull(u.getId());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Constraint violation.',
                r`try {
    em.persistAndFlush(new User(null, "x@x.com"));   // name is not nullable
} catch (Exception e) {
    System.out.println(e.getClass().getSimpleName());
}

// OUTPUT:
// ConstraintViolationException (or DataIntegrityViolationException)`]]
    ),

    'mvc-dto-layer': x(
        ['<b>DTO</b> (Data Transfer Object) is a plain object that carries data between layers or across the network, without behavior or database mapping.',
            '<b>Why</b>: it lets the API show only the fields a client needs and hides the entity structure.',
            '<b>Java records</b> are a short way to write DTOs: <code>record UserDto(Long id, String name) {}</code>.'],
        ['<b>Request and response DTOs</b> are separate: a create request has no id, while a response has one.',
            '<b>Validation</b>: put <code>@NotBlank</code> and <code>@Email</code> on request DTO fields and use <code>@Valid</code> in the controller.',
            '<b>Versioning</b>: you can change entities without breaking clients when the DTO stays stable.'],
        ['<b>Mass assignment</b>: binding input straight to an entity lets a client set fields such as <code>role</code>; a DTO blocks this.',
            '<b>Projections</b>: query directly into a DTO with an interface projection or a constructor expression to skip loading full entities.',
            '<b>Immutability</b>: records are immutable and work well with Jackson 2.12 and later.'],
        [['F', 'What is a DTO?', 'A simple object used to move data between layers or to the client.'],
            ['F', 'Why not send the entity directly?', 'It may expose sensitive fields and ties the API to the database schema.'],
            ['M', 'Where do you put validation annotations?', 'On the request DTO, with @Valid on the controller parameter.'],
            ['M', 'Can a record be a DTO?', 'Yes, records are concise, immutable and work with Jackson and validation.'],
            ['S', 'What is mass assignment and how do DTOs prevent it?', 'Binding request data to an entity lets clients set fields they should not; a DTO exposes only allowed fields.'],
            ['S', 'How to avoid writing many DTO conversions by hand?', 'Use a mapper such as MapStruct, or constructor expressions in queries.']],
        [['Request and response records.',
            r`public record CreateUserRequest(
    @NotBlank String name,
    @Email String email) { }

public record UserResponse(Long id, String name) { }

@PostMapping("/users")
public UserResponse create(@Valid @RequestBody CreateUserRequest req) {
    User saved = service.create(req.name(), req.email());
    return new UserResponse(saved.getId(), saved.getName());
}

// OUTPUT:
// POST {"name":"Asha","email":"asha@x.com"} -> 200 {"id":1,"name":"Asha"}`],
            ['Query straight into a DTO.',
                r`public interface UserRepository extends JpaRepository<User, Long> {
    @Query("select new com.app.UserResponse(u.id, u.name) from User u")
    List<UserResponse> findAllResponses();
}

System.out.println(repo.findAllResponses());

// OUTPUT:
// [UserResponse[id=1, name=Asha], UserResponse[id=2, name=Ravi]]`]],
        [['Validation of a DTO with MockMvc.',
            r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;
    @MockBean UserService service;

    @Test
    void rejectsBlankName() throws Exception {
        mvc.perform(post("/users").contentType("application/json")
                .content("{\"name\":\"\",\"email\":\"a@b.com\"}"))
           .andExpect(status().isBadRequest());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Hidden field is not leaked.',
                r`mvc.perform(get("/users/1"))
   .andExpect(jsonPath("$.name").value("Asha"))
   .andExpect(jsonPath("$.password").doesNotExist());

// OUTPUT:
// the response JSON has only id and name`]]
    ),

    'mvc-mapper-layer': x(
        ['<b>Mapper layer</b> converts objects from one shape to another, mostly entity to DTO and DTO to entity.',
            '<b>Why</b>: it keeps conversion code in one place so controllers and services stay clean.',
            '<b>MapStruct</b> is a popular tool: you write an interface with <code>@Mapper</code> and it generates the implementation at compile time.'],
        ['<b>componentModel</b>: use <code>@Mapper(componentModel = &quot;spring&quot;)</code> so the generated class is a Spring bean you can inject.',
            '<b>Field names</b> that match are copied automatically; use <code>@Mapping(source, target)</code> for different names.',
            '<b>Manual mapping</b> with a small static method or a record constructor is fine for tiny projects.'],
        ['<b>Compile-time safety</b>: MapStruct reports unmapped fields during the build, unlike reflection tools such as ModelMapper.',
            '<b>Update methods</b>: <code>@MappingTarget</code> updates an existing entity, which suits PUT and PATCH.',
            '<b>Null handling</b>: use <code>NullValuePropertyMappingStrategy.IGNORE</code> for partial updates.'],
        [['F', 'What does a mapper do?', 'It converts one object type to another, such as an entity to a DTO.'],
            ['F', 'What is MapStruct?', 'A code generator that creates mapping implementations from an annotated interface at compile time.'],
            ['M', 'How do you make a MapStruct mapper injectable?', 'Set componentModel to spring so the generated class is a bean.'],
            ['M', 'How map fields with different names?', 'Use @Mapping with source and target.'],
            ['S', 'MapStruct versus ModelMapper?', 'MapStruct generates plain code at build time, so it is fast and type-safe; ModelMapper uses reflection at runtime.'],
            ['S', 'How update an existing entity from a DTO?', 'Declare a method with @MappingTarget on the entity parameter.']],
        [['MapStruct mapper.',
            r`@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    User toEntity(CreateUserRequest request);
}

// in a service
UserResponse r = mapper.toResponse(new User("Asha", "asha@x.com"));
System.out.println(r);

// OUTPUT:
// UserResponse[id=null, name=Asha]`],
            ['Manual mapper without a library.',
                r`@Component
public class UserMapperManual {
    public UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getName());
    }
}

// OUTPUT:
// new UserMapperManual().toResponse(user) -> UserResponse[id=1, name=Asha]`]],
        [['Plain unit test of a mapper.',
            r`class UserMapperTest {
    private final UserMapper mapper = Mappers.getMapper(UserMapper.class);

    @Test
    void mapsName() {
        User u = new User("Asha", "asha@x.com");
        assertEquals("Asha", mapper.toResponse(u).name());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Update an existing entity.',
                r`@Mapping(target = "id", ignore = true)
void update(UpdateUserRequest req, @MappingTarget User user);

mapper.update(new UpdateUserRequest("Asha K"), user);
System.out.println(user.getName());

// OUTPUT:
// Asha K`]]
    ),

    'mvc-utility-layer': x(
        ['<b>Utility layer</b> holds small helper classes with reusable logic that does not belong to any one layer, such as date formatting or string checks.',
            '<b>Static helpers</b>: a final class with a private constructor and static methods, for example <code>DateUtils</code>.',
            '<b>Not business logic</b>: rules of the domain belong in services; utilities only help.'],
        ['<b>Static or bean</b>: pure functions can be static; code that needs configuration or other beans should be a <code>@Component</code>.',
            '<b>Existing libraries</b>: prefer <code>StringUtils</code>, <code>Objects</code> and Apache Commons before writing your own.',
            '<b>Stateless</b>: a utility must be thread-safe, so keep no mutable shared fields.'],
        ['<b>Hard to mock</b>: static calls cannot be replaced easily in tests, so wrap time and random in a bean such as <code>Clock</code>.',
            '<b>Dumping ground</b>: a giant <code>Utils</code> class is a smell; group by purpose and name clearly.',
            '<b>Thread safety</b>: <code>SimpleDateFormat</code> is not thread-safe, so use <code>DateTimeFormatter</code>.'],
        [['F', 'What goes in a utility class?', 'Small reusable helper methods that are not tied to one layer.'],
            ['F', 'How do you stop others creating a utility object?', 'Make the class final with a private constructor.'],
            ['M', 'When should a utility be a Spring bean instead of static?', 'When it needs injected dependencies or configuration, or you want to mock it.'],
            ['M', 'Why inject a Clock instead of calling LocalDate.now()?', 'A fixed Clock makes time-based code testable and predictable.'],
            ['S', 'What is wrong with a huge Utils class?', 'It becomes a dumping ground with low cohesion and hidden dependencies.'],
            ['S', 'Is a static utility thread-safe?', 'Only if it has no mutable shared state; pure functions are safe.']],
        [['Static utility class.',
            r`public final class TextUtils {
    private TextUtils() { }

    public static String slug(String s) {
        return s.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-");
    }
}

System.out.println(TextUtils.slug("  Spring MVC Layers "));

// OUTPUT:
// spring-mvc-layers`],
            ['Bean with a Clock for testing.',
                r`@Component
public class ExpiryChecker {
    private final Clock clock;
    public ExpiryChecker(Clock clock) { this.clock = clock; }

    public boolean expired(Instant at) { return at.isBefore(clock.instant()); }
}

@Bean Clock clock() { return Clock.systemUTC(); }

// OUTPUT:
// expired(past) -> true, expired(future) -> false`]],
        [['Unit test of a static helper.',
            r`class TextUtilsTest {
    @Test
    void buildsSlug() {
        assertEquals("a-b", TextUtils.slug(" A  B "));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Fixed clock in a test.',
                r`Clock fixed = Clock.fixed(Instant.parse("2025-01-01T00:00:00Z"), ZoneOffset.UTC);
ExpiryChecker c = new ExpiryChecker(fixed);
System.out.println(c.expired(Instant.parse("2024-12-31T00:00:00Z")));

// OUTPUT:
// true`]]
    ),

    'mvc-configuration-layer': x(
        ['<b>Configuration layer</b> holds the classes and files that set up beans, security, web options and properties for the application.',
            '<b>@Configuration</b> marks a class whose <code>@Bean</code> methods create beans managed by the container.',
            '<b>Properties</b>: values live in <code>application.properties</code> or YAML and are read with <code>@Value</code> or <code>@ConfigurationProperties</code>.'],
        ['<b>WebMvcConfigurer</b>: implement it to add interceptors, CORS rules, formatters and resource handlers without losing Boot defaults.',
            '<b>Profiles</b>: <code>@Profile(&quot;dev&quot;)</code> and <code>application-dev.properties</code> switch settings per environment.',
            '<b>Type-safe config</b>: <code>@ConfigurationProperties(prefix = &quot;app&quot;)</code> binds a group of keys to one class.'],
        ['<b>@EnableWebMvc</b> turns off Spring Boot MVC auto-configuration; avoid it unless you want full control.',
            '<b>Proxy beans</b>: in a full <code>@Configuration</code> class calls between <code>@Bean</code> methods return the same singleton.',
            '<b>Secrets</b>: keep passwords out of source and read them from environment variables or a vault.'],
        [['F', 'What is @Configuration?', 'It marks a class that declares beans with @Bean methods.'],
            ['F', 'Where do application settings live?', 'In application.properties or application.yml.'],
            ['M', 'How add a CORS rule or interceptor in Spring MVC?', 'Implement WebMvcConfigurer and override addCorsMappings or addInterceptors.'],
            ['M', 'Why prefer @ConfigurationProperties over many @Value?', 'It groups keys in one typed, validated class and supports relaxed binding.'],
            ['S', 'What happens with @EnableWebMvc in Boot?', 'Boot MVC auto-configuration backs off, so you must configure message converters and resources yourself.'],
            ['S', 'How do you load different settings per environment?', 'Use profiles with application-profile files and set spring.profiles.active.']],
        [['Web configuration.',
            r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST");
    }
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new LogInterceptor());
    }
}

// OUTPUT:
// CORS allowed for /api/** from http://localhost:3000; interceptor registered`],
            ['Typed properties.',
                r`@ConfigurationProperties(prefix = "app")
public record AppProperties(String name, int pageSize) { }

// application.properties
// app.name=JavaSchool
// app.page-size=20

System.out.println(props.name() + " " + props.pageSize());

// OUTPUT:
// JavaSchool 20`]],
        [['Test with a property override.',
            r`@SpringBootTest(properties = "app.page-size=5")
class ConfigTest {
    @Autowired AppProperties props;

    @Test
    void readsOverride() {
        assertEquals(5, props.pageSize());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Profile bean.',
                r`@Configuration
@Profile("dev")
class DevConfig {
    @Bean CommandLineRunner seed(UserRepository r) {
        return args -> r.save(new User("Demo", "demo@x.com"));
    }
}

// OUTPUT:
// with spring.profiles.active=dev the demo user is created at startup`]]
    ),

    'mvc-exception-layer': x(
        ['<b>Exception layer</b> is where the app turns errors into clean responses, with custom exceptions and one global handler.',
            '<b>@RestControllerAdvice</b> plus <code>@ExceptionHandler</code> catches exceptions from all controllers in one class.',
            '<b>Status codes</b>: map not found to 404, validation to 400 and conflicts to 409 instead of a raw 500.'],
        ['<b>Custom exception</b>: <code>UserNotFoundException extends RuntimeException</code> carries a clear message from the service.',
            '<b>ProblemDetail</b> (Spring 6) gives the RFC 7807 error format: type, title, status and detail.',
            '<b>Validation errors</b>: <code>MethodArgumentNotValidException</code> holds the field errors to return.'],
        ['<b>Resolver chain</b>: <code>ExceptionHandlerExceptionResolver</code> runs before <code>ResponseStatusExceptionResolver</code> and the default resolver.',
            '<b>Do not leak</b> stack traces or SQL messages to clients; log them and return a safe message.',
            '<b>Handler order</b>: the most specific exception type wins, and <code>@Order</code> sorts several advice classes.'],
        [['F', 'What does @RestControllerAdvice do?', 'It applies exception handlers (and other advice) to all controllers.'],
            ['F', 'Which status for a missing resource?', '404 Not Found.'],
            ['M', 'How does @ExceptionHandler pick a method?', 'It chooses the handler whose exception type is the closest match to the thrown one.'],
            ['M', 'What is ProblemDetail?', 'A Spring 6 class for the RFC 7807 problem JSON format.'],
            ['S', 'Checked or unchecked for business errors?', 'Unchecked, because Spring rolls back transactions on them by default and the code stays cleaner.'],
            ['S', 'How do you test an error response?', 'With MockMvc in a @WebMvcTest, mock the service to throw and assert the status and JSON.']],
        [['Global handler.',
            r`public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long id) { super("User " + id + " not found"); }
}

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    public ProblemDetail notFound(UserNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }
}

// OUTPUT:
// GET /users/99 -> 404 {"status":404,"detail":"User 99 not found",...}`],
            ['Validation errors.',
                r`@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException ex) {
    Map<String, String> errors = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors()
      .forEach(f -> errors.put(f.getField(), f.getDefaultMessage()));
    return ResponseEntity.badRequest().body(errors);
}

// OUTPUT:
// 400 {"name":"must not be blank"}`]],
        [['MockMvc test of the 404.',
            r`@Test
void returns404() throws Exception {
    when(service.get(99L)).thenThrow(new UserNotFoundException(99L));
    mvc.perform(get("/users/99"))
       .andExpect(status().isNotFound())
       .andExpect(jsonPath("$.detail").value("User 99 not found"));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Throwing from the service.',
                r`public User get(Long id) {
    return repo.findById(id).orElseThrow(() -> new UserNotFoundException(id));
}

// OUTPUT:
// get(1) -> User; get(99) -> UserNotFoundException handled as 404`]]
    ),

    'mvc-separation-of-concerns': x(
        ['<b>Separation of concerns</b> means each class has one clear job: controllers handle HTTP, services hold business rules and repositories talk to the database.',
            '<b>Benefits</b>: code is easier to read, test, change and reuse.',
            '<b>Typical flow</b>: Controller calls Service, Service calls Repository, and data moves in DTOs and entities.'],
        ['<b>Thin controllers</b>: bind input, call one service method and return a response; no SQL or business rules.',
            '<b>Services own transactions</b> and rules, such as checking stock before an order.',
            '<b>Dependencies point one way</b>: web to service to data, never a repository calling a controller.'],
        ['<b>Layer leaks</b>: <code>HttpServletRequest</code> in a service or an entity in a JSON response couples layers.',
            '<b>Testing by slice</b>: <code>@WebMvcTest</code> for controllers, <code>@DataJpaTest</code> for repositories and plain unit tests for services.',
            '<b>Over-layering</b>: a service that only forwards calls adds noise; keep layers only where they add value.'],
        [['F', 'What is separation of concerns?', 'Splitting code so each part handles one responsibility.'],
            ['F', 'What should a controller do?', 'Handle the HTTP request and response and delegate the work to a service.'],
            ['M', 'Where does the business logic go?', 'In the service layer.'],
            ['M', 'Why not put a repository call in the controller?', 'It mixes web and data concerns, skips transaction control and makes tests harder.'],
            ['S', 'How does layering help testing?', 'Each layer can be tested alone with mocks or a test slice.'],
            ['S', 'What is a sign of a layer leak?', 'Servlet types in services, entities in API responses or business rules in controllers.']],
        [['Three layers in one flow.',
            r`@RestController
class OrderController {
    private final OrderService service;
    OrderController(OrderService service) { this.service = service; }

    @PostMapping("/orders")
    OrderResponse place(@Valid @RequestBody OrderRequest req) {
        return service.place(req);              // no logic here
    }
}

@Service
class OrderService {
    private final OrderRepository repo;
    OrderService(OrderRepository repo) { this.repo = repo; }

    @Transactional
    OrderResponse place(OrderRequest req) {
        if (req.qty() <= 0) throw new InvalidOrderException("qty must be positive");
        Order o = repo.save(new Order(req.item(), req.qty()));
        return new OrderResponse(o.getId(), o.getItem());
    }
}

// OUTPUT:
// POST /orders {"item":"pen","qty":2} -> 200 {"id":1,"item":"pen"}`],
            ['Wrong versus right.',
                r`// WRONG: controller contains rules and data access
@PostMapping("/orders")
Order bad(@RequestBody Order o) {
    if (o.getQty() <= 0) throw new RuntimeException("bad");
    return orderRepository.save(o);
}

// RIGHT: controller delegates, service validates, DTO crosses the boundary
@PostMapping("/orders")
OrderResponse good(@Valid @RequestBody OrderRequest req) { return service.place(req); }

// OUTPUT:
// the right version is testable per layer and hides the entity`]]
        ,
        [['Service unit test with a mock repository.',
            r`class OrderServiceTest {
    OrderRepository repo = mock(OrderRepository.class);
    OrderService service = new OrderService(repo);

    @Test
    void rejectsZeroQty() {
        assertThrows(InvalidOrderException.class,
            () -> service.place(new OrderRequest("pen", 0)));
        verifyNoInteractions(repo);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Controller slice test.',
                r`@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;
    @MockBean OrderService service;

    @Test
    void placesOrder() throws Exception {
        when(service.place(any())).thenReturn(new OrderResponse(1L, "pen"));
        mvc.perform(post("/orders").contentType("application/json")
                .content("{\"item\":\"pen\",\"qty\":2}"))
           .andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-ajax': x(
        ['<b>AJAX</b> means the browser sends a request in the background with JavaScript and updates part of the page without a full reload.',
            '<b>Spring side</b>: a <code>@RestController</code> or a <code>@ResponseBody</code> method returns JSON instead of a view name.',
            '<b>Browser side</b>: call the endpoint with <code>fetch()</code> (or XMLHttpRequest) and update the DOM with the result.'],
        ['<b>HTTP method and body</b>: use GET to read and POST with <code>@RequestBody</code> to send JSON, and set <code>Content-Type: application/json</code>.',
            '<b>Status codes</b> tell the script what happened; return 400 for bad input and 404 for missing data.',
            '<b>Partial views</b>: you can also return an HTML fragment (for example a Thymeleaf fragment) and insert it into the page.'],
        ['<b>CSRF</b>: with Spring Security, AJAX POST calls must send the CSRF token in a header, or they get 403.',
            '<b>CORS</b>: a page on another origin needs allowed origins configured, or the browser blocks the call.',
            '<b>Message conversion</b>: <code>HttpMessageConverter</code> (Jackson) turns objects into JSON, chosen by the <code>Accept</code> header.'],
        [['F', 'What is AJAX?', 'A way for JavaScript to call the server in the background and update part of a page.'],
            ['F', 'How does a Spring controller return JSON?', 'Use @RestController or @ResponseBody and return an object.'],
            ['M', 'Which annotation reads a JSON body?', '@RequestBody, which uses Jackson to convert the JSON into an object.'],
            ['M', 'Why does my AJAX POST get 403 with Spring Security?', 'The CSRF token is missing; send it in the request header.'],
            ['S', 'What is CORS and how do you allow it?', 'A browser rule for cross-origin calls; allow origins with @CrossOrigin or a WebMvcConfigurer.'],
            ['S', 'How do you detect an AJAX request on the server?', 'Check the X-Requested-With header or the Accept header; better, use separate endpoints.']],
        [['JSON endpoint and fetch call.',
            r`@RestController
@RequestMapping("/api/users")
public class UserApi {
    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return new UserResponse(id, "Asha");
    }
}

// browser (JavaScript)
// fetch("/api/users/1")
//   .then(r => r.json())
//   .then(u => document.getElementById("name").textContent = u.name);

// OUTPUT:
// GET /api/users/1 -> 200 {"id":1,"name":"Asha"}; the page shows Asha without reload`],
            ['POST JSON from the browser.',
                r`@PostMapping("/api/users")
public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED)
                         .body(new UserResponse(1L, req.name()));
}

// browser (JavaScript)
// fetch("/api/users", { method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ name: "Ravi", email: "r@x.com" }) });

// OUTPUT:
// 201 {"id":1,"name":"Ravi"}`]],
        [['MockMvc test of the JSON endpoint.',
            r`@WebMvcTest(UserApi.class)
class UserApiTest {
    @Autowired MockMvc mvc;

    @Test
    void returnsJson() throws Exception {
        mvc.perform(get("/api/users/1").accept("application/json"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.name").value("Asha"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Send the CSRF token from the page.',
                r`// Thymeleaf page head:
//   <meta name="_csrf" content="TOKEN"/>
//   <meta name="_csrf_header" content="X-CSRF-TOKEN"/>
// script:
//   const h = document.querySelector("meta[name=_csrf_header]").content;
//   const t = document.querySelector("meta[name=_csrf]").content;
//   fetch("/api/users", { method: "POST", headers: { [h]: t, ... } });

// OUTPUT:
// without the header: 403 Forbidden; with it: 201 Created`]]
    )
};

export const smvc31Deep: Record<string, Deep> = {
    'mvc-repository-layer-layers': dv(
        [`<p>Spring Data builds repositories at startup, with no class written by you.</p><ul><li><b>Scanning:</b> <code>@EnableJpaRepositories</code> (auto-configured in Boot) finds interfaces that extend <code>Repository</code>.</li><li><b>Proxy:</b> each interface gets a JDK proxy whose target is <code>SimpleJpaRepository</code>.</li><li><b>Query methods:</b> <code>PartTree</code> parses names like <code>findByEmailAndActiveTrue</code> into JPQL criteria.</li><li><b>Interceptors:</b> a chain handles transactions (read-only by default for finders) and exception translation.</li></ul>`,
            r`public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndActiveTrue(String email);
}

UserRepository repo = ctx.getBean(UserRepository.class);
System.out.println(AopUtils.isJdkDynamicProxy(repo));
System.out.println(repo.getClass().getInterfaces()[0].getSimpleName());

// OUTPUT:
// true
// UserRepository`],
        [`<p>Variants of repository interfaces:</p><ul><li><b>CrudRepository:</b> basic save, find, delete.</li><li><b>ListCrudRepository and PagingAndSortingRepository:</b> lists and paging.</li><li><b>JpaRepository:</b> adds flush and batch delete.</li><li><b>@Query:</b> JPQL or native SQL.</li><li><b>@Modifying:</b> for update and delete queries.</li><li><b>Specifications and Querydsl:</b> dynamic filters.</li><li><b>Projections:</b> interface or record results.</li></ul>`,
            r`public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = "items")
    List<Order> findByCustomerId(Long customerId);

    @Modifying
    @Transactional
    @Query("update Order o set o.status = :s where o.id = :id")
    int updateStatus(@Param("id") Long id, @Param("s") String s);

    interface OrderSummary { Long getId(); String getStatus(); }
    List<OrderSummary> findByStatus(String status);
}

// OUTPUT:
// updateStatus(1, "PAID") -> 1 (rows changed)`],
        [`<p>Common mistakes:</p><ul><li><b>Business logic in the repository:</b> keep it in services.</li><li><b>Transaction on the repository only:</b> two saves then run in two commits; put <code>@Transactional</code> on the service.</li><li><b>Misspelled property in a method name:</b> fails at startup with <code>PropertyReferenceException</code>.</li><li><b>Returning null checks:</b> use <code>Optional</code>.</li><li><b>Loading all rows:</b> use paging.</li></ul>`,
            r`// WRONG: typo in the property name, the context fails to start
// List<User> findByEmial(String email);
// Caused by: PropertyReferenceException: No property 'emial' found for type 'User'

// RIGHT
List<User> findByEmail(String email);

// WRONG: two commits
// repo.save(a); repo.save(b);   // called from a controller, no transaction

// RIGHT: one commit
@Transactional
public void saveBoth(User a, User b) { repo.save(a); repo.save(b); }

// OUTPUT:
// startup error for the typo; the fixed version starts normally`],
        [`<p>Tuning repositories:</p><ul><li><b>Page, do not list:</b> <code>Pageable</code> avoids loading whole tables.</li><li><b>N+1:</b> use <code>@EntityGraph</code> or <code>join fetch</code>.</li><li><b>Projections:</b> select only needed columns.</li><li><b>Batching:</b> set <code>hibernate.jdbc.batch_size</code> for many inserts.</li><li><b>Read-only:</b> <code>@Transactional(readOnly = true)</code> skips dirty checking.</li><li><b>Indexes:</b> match the columns in your finders.</li></ul>`,
            r`# application.properties
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.show-sql=true
logging.level.org.hibernate.orm.jdbc.bind=trace

// OUTPUT: (varies)
// saving 100 users runs 2 batched inserts instead of 100`],
        [`<p>Scenario: a customer list screen with search and paging.</p><ul><li>The controller receives <code>page</code> and <code>q</code>.</li><li>The service calls <code>repo.search(q, pageable)</code> in a read-only transaction.</li><li>The repository returns a projection, so only id and name are read.</li><li>An index on <code>name</code> keeps the query fast at a million rows.</li></ul>`,
            r`@Transactional(readOnly = true)
public Page<CustomerRow> list(String q, int page) {
    Pageable p = PageRequest.of(page, 20, Sort.by("name"));
    return repo.findByNameContainingIgnoreCase(q, p);
}

// OUTPUT: (varies)
// GET /customers?q=as&page=0 -> 20 rows, totalElements=137, 6 ms`]
    ),

    'mvc-dao-layer': dv(
        [`<p>How JdbcTemplate serves a DAO internally:</p><ul><li><b>Connection:</b> taken from <code>DataSource</code> through <code>DataSourceUtils</code>, so it joins an active transaction.</li><li><b>Template method:</b> it prepares the statement, runs it, calls your <code>RowMapper</code> and always closes resources.</li><li><b>Translation:</b> <code>SQLExceptionTranslator</code> maps vendor error codes to <code>DataAccessException</code> types.</li><li><b>@Repository:</b> a post processor adds translation for DAOs that use JPA directly.</li></ul>`,
            r`public int countActive() {
    // JdbcTemplate: get connection, prepare, execute, map, close, translate errors
    Integer n = jdbc.queryForObject(
        "select count(*) from users where active = true", Integer.class);
    return n == null ? 0 : n;
}

System.out.println(dao.countActive());

// OUTPUT:
// 42`],
        [`<p>Ways to write a DAO in Spring:</p><ul><li><b>JdbcTemplate:</b> simple SQL.</li><li><b>NamedParameterJdbcTemplate:</b> named parameters.</li><li><b>SimpleJdbcInsert:</b> inserts with generated keys.</li><li><b>JdbcClient (Spring 6.1):</b> a fluent API over the same engine.</li><li><b>EntityManager:</b> JPA and JPQL.</li><li><b>Spring Data:</b> interface only.</li></ul>`,
            r`NamedParameterJdbcTemplate named;

List<User> found = named.query(
    "select id, name from users where name like :q",
    Map.of("q", "A%"),
    (rs, n) -> new User(rs.getLong("id"), rs.getString("name")));

SimpleJdbcInsert insert = new SimpleJdbcInsert(dataSource)
    .withTableName("users").usingGeneratedKeyColumns("id");
Number key = insert.executeAndReturnKey(Map.of("name", "Meena"));
System.out.println(found.size() + " " + key);

// OUTPUT: (varies)
// 2 7`],
        [`<p>Common DAO mistakes:</p><ul><li><b>String concatenation:</b> opens SQL injection.</li><li><b>queryForObject on no row:</b> throws <code>EmptyResultDataAccessException</code>.</li><li><b>Manual connection handling:</b> leaks connections; let the template do it.</li><li><b>Catching and hiding exceptions:</b> the service never learns of a failure.</li><li><b>Business rules in the DAO:</b> keep it to storage.</li></ul>`,
            r`// WRONG: injection risk
// jdbc.query("select * from users where name = '" + name + "'", mapper);

// RIGHT: bind parameter
jdbc.query("select * from users where name = ?", mapper, name);

// WRONG: throws when there is no row
// jdbc.queryForObject("select name from users where id = ?", String.class, 99);

// RIGHT: query a list and take the first
List<String> r = jdbc.queryForList(
    "select name from users where id = ?", String.class, 99);

// OUTPUT:
// the right version returns an empty list for id 99`],
        [`<p>Tuning a DAO:</p><ul><li><b>Connection pool:</b> HikariCP is the Boot default; size it to the database, not the thread count.</li><li><b>batchUpdate:</b> far fewer round trips.</li><li><b>fetchSize:</b> stream large results with a larger fetch size.</li><li><b>Select only needed columns.</b></li><li><b>Indexes</b> on filtered columns.</li></ul>`,
            r`# application.properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.connection-timeout=30000

jdbc.setFetchSize(500);
jdbc.query("select id, name from users", rs -> { /* process each row */ });

// OUTPUT: (varies)
// 100000 rows processed in 0.9 s with constant memory`],
        [`<p>Scenario: a nightly report that sums sales per region across millions of rows.</p><ul><li>A Spring Data derived query cannot express the grouping well.</li><li>A <code>ReportDao</code> runs one tuned SQL with <code>group by</code> and returns small row objects.</li><li>The service calls it inside a read-only transaction.</li></ul>`,
            r`@Repository
public class ReportDao {
    private final JdbcTemplate jdbc;
    public ReportDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<RegionSales> salesByRegion() {
        return jdbc.query(
            "select region, sum(amount) total from sales group by region",
            (rs, n) -> new RegionSales(rs.getString(1), rs.getBigDecimal(2)));
    }
}

// OUTPUT: (varies)
// [RegionSales[region=South, total=125000.00], RegionSales[region=North, ...]]`]
    ),

    'mvc-entity-layer': dv(
        [`<p>What the persistence provider (Hibernate) does with entities:</p><ul><li><b>Metamodel:</b> at startup it reads the annotations and builds the table mapping.</li><li><b>Persistence context:</b> a first-level cache of entities per transaction; the same id returns the same object.</li><li><b>Dirty checking:</b> at flush it compares loaded state with current state and writes UPDATEs for changed fields.</li><li><b>Proxies:</b> lazy associations are subclasses created at runtime, which is why entity classes should not be final.</li><li><b>States:</b> new, managed, detached and removed.</li></ul>`,
            r`@Transactional
public void rename(Long id) {
    User u = repo.findById(id).orElseThrow();   // managed
    u.setName("Asha K");                        // no save() call needed
}                                               // commit: dirty check runs UPDATE

// OUTPUT:
// Hibernate: update users set name=?, email=? where id=?`],
        [`<p>Mapping options:</p><ul><li><b>Id strategies:</b> IDENTITY, SEQUENCE, UUID.</li><li><b>@Enumerated(EnumType.STRING):</b> store enum names.</li><li><b>@Embedded and @Embeddable:</b> reuse value objects like Address.</li><li><b>@Version:</b> optimistic locking.</li><li><b>Auditing:</b> <code>@CreatedDate</code> with <code>@EntityListeners(AuditingEntityListener.class)</code>.</li><li><b>Inheritance:</b> SINGLE_TABLE, JOINED.</li></ul>`,
            r`@Entity
@EntityListeners(AuditingEntityListener.class)
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Embedded
    private Money price;

    @Version
    private Long version;

    @CreatedDate
    private Instant createdAt;
}

// OUTPUT:
// status is saved as ACTIVE, version starts at 0 and increases on each update`],
        [`<p>Common entity mistakes:</p><ul><li><b>EnumType.ORDINAL:</b> breaks when enum order changes.</li><li><b>Eager everywhere:</b> loads too much; default to lazy.</li><li><b>Lombok @Data on entities:</b> equals and toString touch lazy fields and cause loops.</li><li><b>Bidirectional JSON:</b> infinite recursion; use DTOs.</li><li><b>Setting only the inverse side:</b> the foreign key is not saved.</li></ul>`,
            r`// WRONG: foreign key not saved, only the inverse side is set
// dept.getEmployees().add(emp);

// RIGHT: keep both sides in sync with a helper
public void addEmployee(Employee e) {
    employees.add(e);
    e.setDepartment(this);
}

// OUTPUT:
// employee row now has department_id filled`],
        [`<p>Tuning entities:</p><ul><li><b>Lazy by default</b> and fetch what you need with entity graphs.</li><li><b>SEQUENCE with allocation size</b> allows insert batching; IDENTITY disables it.</li><li><b>Read-only queries</b> with projections avoid managed entities.</li><li><b>Second-level cache</b> only for rarely changed data.</li><li><b>Keep entities small</b>; split rarely used big columns.</li></ul>`,
            r`@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
@SequenceGenerator(name = "user_seq", sequenceName = "user_seq", allocationSize = 50)
private Long id;

// OUTPUT: (varies)
// one sequence call serves 50 inserts, so batch insert works`],
        [`<p>Scenario: an order system with <code>Order</code> and <code>OrderItem</code>.</p><ul><li><code>Order</code> is the aggregate root with <code>cascade = ALL</code> over its items.</li><li>A <code>@Version</code> field prevents two users from overwriting each other.</li><li>The API exposes DTOs only, so schema changes stay internal.</li></ul>`,
            r`@Entity
public class Order {
    @Id @GeneratedValue private Long id;
    @Version private Long version;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public void addItem(OrderItem i) { items.add(i); i.setOrder(this); }
}

// OUTPUT: (varies)
// two concurrent updates: the second fails with ObjectOptimisticLockingFailureException`]
    ),

    'mvc-dto-layer': dv(
        [`<p>How a DTO travels through Spring MVC:</p><ul><li><b>Incoming:</b> <code>RequestResponseBodyMethodProcessor</code> picks a converter by <code>Content-Type</code>; Jackson builds the record or class.</li><li><b>Validation:</b> with <code>@Valid</code> the processor runs the Bean Validation <code>Validator</code> and throws <code>MethodArgumentNotValidException</code>.</li><li><b>Outgoing:</b> the return value is written by a converter chosen from <code>Accept</code>.</li><li><b>Records:</b> Jackson uses the canonical constructor.</li></ul>`,
            r`public record ProductRequest(
    @NotBlank String name,
    @Positive BigDecimal price) { }

@PostMapping("/products")
ProductResponse add(@Valid @RequestBody ProductRequest req) {
    return service.add(req);
}

// OUTPUT:
// POST {"name":"","price":-1} -> 400 with field errors for name and price`],
        [`<p>DTO design options:</p><ul><li><b>Records:</b> concise and immutable.</li><li><b>Classes with Lombok:</b> mutable, familiar.</li><li><b>@JsonProperty and @JsonIgnore:</b> control JSON names.</li><li><b>@JsonInclude(NON_NULL):</b> skip nulls.</li><li><b>Nested DTOs:</b> for related data.</li><li><b>Validation groups:</b> different rules for create and update.</li></ul>`,
            r`@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProductResponse(
    Long id,
    String name,
    @JsonProperty("unit_price") BigDecimal price,
    List<TagDto> tags) { }

// OUTPUT:
// {"id":1,"name":"Pen","unit_price":10.50}   (tags omitted when null)`],
        [`<p>Common DTO mistakes:</p><ul><li><b>One DTO for everything:</b> create, update and read need different fields.</li><li><b>Entity in the request:</b> mass assignment risk.</li><li><b>Missing @Valid:</b> annotations are ignored.</li><li><b>Mutable shared DTO:</b> hard to reason about.</li><li><b>DTOs with logic:</b> keep them as data.</li></ul>`,
            r`// WRONG: @Valid is missing, so @NotBlank is never checked
// ProductResponse add(@RequestBody ProductRequest req)

// RIGHT
ProductResponse add(@Valid @RequestBody ProductRequest req)

// WRONG: client can send {"role":"ADMIN"}
// User create(@RequestBody User user)

// OUTPUT:
// with @Valid a blank name returns 400 instead of saving`],
        [`<p>Performance notes:</p><ul><li><b>Projection to DTO</b> in the query reads fewer columns.</li><li><b>Avoid mapping huge lists</b> in memory; page them.</li><li><b>Jackson</b> is fast; reuse the auto-configured <code>ObjectMapper</code>.</li><li><b>Compression</b> (<code>server.compression.enabled=true</code>) helps big JSON.</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.min-response-size=1024
spring.jackson.default-property-inclusion=non_null

// OUTPUT: (varies)
// a 200 KB JSON response is sent as about 25 KB with gzip`],
        [`<p>Scenario: a public API for products while the table has cost and supplier columns.</p><ul><li>The entity keeps <code>cost</code> and <code>supplierId</code>.</li><li>The response DTO exposes only id, name and price.</li><li>Adding a column later does not change the API.</li></ul>`,
            r`public record ProductResponse(Long id, String name, BigDecimal price) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(p.getId(), p.getName(), p.getPrice());
    }
}

// OUTPUT:
// GET /products/1 -> {"id":1,"name":"Pen","price":10.50}   (no cost field)`]
    ),

    'mvc-mapper-layer': dv(
        [`<p>How MapStruct works:</p><ul><li><b>Annotation processor:</b> at compile time it reads the <code>@Mapper</code> interface.</li><li><b>Generated class:</b> <code>UserMapperImpl</code> with plain getter and setter calls, no reflection.</li><li><b>Spring bean:</b> with <code>componentModel = &quot;spring&quot;</code> the class gets <code>@Component</code>.</li><li><b>Build checks:</b> unmapped target properties produce warnings, or errors if configured.</li></ul>`,
            r`// generated by MapStruct (target/generated-sources)
@Component
public class UserMapperImpl implements UserMapper {
    @Override
    public UserResponse toResponse(User user) {
        if (user == null) return null;
        return new UserResponse(user.getId(), user.getName());
    }
}

// OUTPUT:
// no reflection at runtime; the call is a direct constructor call`],
        [`<p>Mapping features:</p><ul><li><b>@Mapping:</b> rename, ignore, constant, expression.</li><li><b>uses:</b> reuse other mappers.</li><li><b>@MappingTarget:</b> update in place.</li><li><b>@BeanMapping:</b> null strategies.</li><li><b>@Named:</b> choose a custom method.</li><li><b>Collections:</b> list methods are generated automatically.</li></ul>`,
            r`@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface ProductMapper {
    @Mapping(source = "unitPrice", target = "price")
    @Mapping(target = "label", expression = "java(p.getName().toUpperCase())")
    ProductResponse toResponse(Product p);

    List<ProductResponse> toResponses(List<Product> products);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void patch(ProductPatch patch, @MappingTarget Product p);
}

// OUTPUT:
// build fails if any target property is left unmapped`],
        [`<p>Common mapper mistakes:</p><ul><li><b>Lombok order:</b> add <code>lombok-mapstruct-binding</code> and keep Lombok before MapStruct in processor paths.</li><li><b>Mapping lazy collections</b> outside a transaction.</li><li><b>Silent unmapped fields:</b> set the policy to ERROR.</li><li><b>Mapping logic with side effects:</b> mappers should be pure.</li><li><b>Mapping ids on create:</b> ignore the id.</li></ul>`,
            r`<!-- pom.xml annotation processor order -->
<annotationProcessorPaths>
    <path><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></path>
    <path><groupId>org.projectlombok</groupId>
          <artifactId>lombok-mapstruct-binding</artifactId></path>
    <path><groupId>org.mapstruct</groupId>
          <artifactId>mapstruct-processor</artifactId></path>
</annotationProcessorPaths>

// OUTPUT:
// with this order, mappers see Lombok getters and setters`],
        [`<p>Performance:</p><ul><li><b>MapStruct</b> is as fast as hand-written code.</li><li><b>ModelMapper</b> and reflection tools cost more per call.</li><li><b>Avoid deep graphs</b>: map only what the screen needs.</li><li><b>Use projections</b> to skip mapping entirely.</li></ul>`,
            r`long t = System.nanoTime();
for (int i = 0; i < 1_000_000; i++) mapper.toResponse(user);
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=12`],
        [`<p>Scenario: order API where Order has nested customer and items.</p><ul><li>The mapper uses <code>CustomerMapper</code> and <code>ItemMapper</code>.</li><li>Money is converted with a <code>@Named</code> method to cents.</li><li>A unit test checks the full mapping once, so changes are caught.</li></ul>`,
            r`@Mapper(componentModel = "spring", uses = {CustomerMapper.class, ItemMapper.class})
public interface OrderMapper {
    @Mapping(source = "customer", target = "buyer")
    OrderResponse toResponse(Order order);
}

// OUTPUT:
// OrderResponse[id=7, buyer=CustomerDto[name=Asha], items=[...]]`]
    ),

    'mvc-utility-layer': dv(
        [`<p>Utilities and the Spring container:</p><ul><li><b>Static class:</b> loaded by the class loader, never managed by Spring, no injection.</li><li><b>Bean utility:</b> created once as a singleton and injected like any service.</li><li><b>Static access to the context:</b> avoid <code>ApplicationContextAware</code> holders; they hide dependencies.</li><li><b>Time:</b> <code>Clock</code> is a bean you can replace in tests.</li></ul>`,
            r`public final class Strings {
    private Strings() { throw new AssertionError("no instances"); }

    public static boolean isBlank(String s) { return s == null || s.isBlank(); }
}

System.out.println(Strings.isBlank("  ") + " " + Strings.isBlank("a"));

// OUTPUT:
// true false`],
        [`<p>Where to find ready helpers:</p><ul><li><b>Spring:</b> <code>StringUtils</code>, <code>CollectionUtils</code>, <code>Assert</code>, <code>ObjectUtils</code>.</li><li><b>JDK:</b> <code>Objects</code>, <code>Optional</code>, <code>Collections</code>, <code>java.time</code>.</li><li><b>Libraries:</b> Apache Commons Lang, Guava.</li><li><b>Custom:</b> only for rules specific to your app.</li></ul>`,
            r`import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

Assert.hasText(name, "name must not be empty");
String title = StringUtils.capitalize("spring");
boolean has = StringUtils.hasText("  ");
System.out.println(title + " " + has);

// OUTPUT:
// Spring false`],
        [`<p>Common mistakes:</p><ul><li><b>Static state:</b> shared mutable fields cause race conditions.</li><li><b>Static calls to now():</b> tests become time-dependent.</li><li><b>Reinventing library code.</b></li><li><b>Utility with business rules:</b> move it to a service.</li><li><b>SimpleDateFormat in a static field:</b> not thread-safe.</li></ul>`,
            r`// WRONG: shared and not thread-safe
// private static final SimpleDateFormat F = new SimpleDateFormat("yyyy-MM-dd");

// RIGHT: immutable and thread-safe
private static final DateTimeFormatter F = DateTimeFormatter.ISO_LOCAL_DATE;

System.out.println(F.format(LocalDate.of(2025, 1, 31)));

// OUTPUT:
// 2025-01-31`],
        [`<p>Performance:</p><ul><li><b>Precompile regex:</b> keep a static <code>Pattern</code>, not <code>String.replaceAll</code> in hot loops.</li><li><b>Reuse formatters</b> that are immutable.</li><li><b>Avoid boxing</b> in helpers used in loops.</li></ul>`,
            r`private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]+");

public static String slug(String s) {
    return NON_ALNUM.matcher(s.toLowerCase()).replaceAll("-");
}

// OUTPUT:
// slug("Hello World") -> hello-world (pattern compiled once)`],
        [`<p>Scenario: a certificate expiry job and its test.</p><ul><li>The job asks an injected <code>Clock</code> for the current time.</li><li>The test fixes the clock to check the boundary day.</li><li>No sleeping or date-dependent failures.</li></ul>`,
            r`@Test
void expiresOnBoundaryDay() {
    Clock c = Clock.fixed(Instant.parse("2025-06-01T00:00:00Z"), ZoneOffset.UTC);
    ExpiryChecker checker = new ExpiryChecker(c);
    assertFalse(checker.expired(Instant.parse("2025-06-01T00:00:01Z")));
    assertTrue(checker.expired(Instant.parse("2025-05-31T23:59:59Z")));
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),

    'mvc-configuration-layer': dv(
        [`<p>How configuration is processed:</p><ul><li><b>ConfigurationClassPostProcessor</b> parses <code>@Configuration</code> classes and registers bean definitions.</li><li><b>CGLIB proxy:</b> a full configuration class is subclassed so calls between <code>@Bean</code> methods return the singleton.</li><li><b>Environment:</b> property sources are ordered; command line and environment variables beat files.</li><li><b>Auto-configuration:</b> Boot adds beans with <code>@ConditionalOnMissingBean</code>, so your bean wins.</li></ul>`,
            r`@Configuration
public class AppConfig {
    @Bean ObjectMapper mapper() { return new ObjectMapper(); }

    @Bean JsonService json() {
        return new JsonService(mapper());     // same singleton, thanks to the proxy
    }
}

// OUTPUT:
// only one ObjectMapper instance is created`],
        [`<p>Configuration options:</p><ul><li><b>@Bean:</b> explicit creation.</li><li><b>@Import and @ComponentScan:</b> compose configs.</li><li><b>@Conditional variants:</b> <code>@ConditionalOnProperty</code> for feature flags.</li><li><b>@ConfigurationProperties:</b> typed binding with <code>@Validated</code>.</li><li><b>@PropertySource:</b> extra files.</li><li><b>YAML profiles:</b> sections per profile.</li></ul>`,
            r`@ConfigurationProperties(prefix = "mail")
@Validated
public record MailProperties(@NotBlank String host, @Min(1) int port) { }

@Configuration
@EnableConfigurationProperties(MailProperties.class)
class MailConfig {
    @Bean
    @ConditionalOnProperty(name = "mail.enabled", havingValue = "true")
    MailSender sender(MailProperties p) { return new SmtpSender(p.host(), p.port()); }
}

// OUTPUT:
// the app fails at startup if mail.host is blank`],
        [`<p>Common mistakes:</p><ul><li><b>@EnableWebMvc in Boot:</b> disables defaults such as Jackson settings.</li><li><b>Hard-coded values:</b> move them to properties.</li><li><b>Wrong property name:</b> <code>app.pageSize</code> versus <code>app.page-size</code> works with relaxed binding, but a typo silently gives the default.</li><li><b>Committed secrets.</b></li><li><b>Component scan too wide:</b> slow start.</li></ul>`,
            r`# application.properties (never commit real secrets)
spring.datasource.url=jdbc:mysql://localhost:3306/shop
spring.datasource.username=shop
spring.datasource.password=
# set DB_PASSWORD in the environment; Boot maps it with:
# spring.datasource.password=
# use the environment variable SPRING_DATASOURCE_PASSWORD instead

# OUTPUT:
# SPRING_DATASOURCE_PASSWORD overrides the file value at startup`],
        [`<p>Startup tuning:</p><ul><li><b>Narrow scans</b> to your base package.</li><li><b>Lazy init</b> (<code>spring.main.lazy-initialization=true</code>) trades startup for first-request time.</li><li><b>Remove unused starters.</b></li><li><b>Check the report</b> with <code>--debug</code> to see conditions.</li></ul>`,
            r`# application.properties
spring.main.lazy-initialization=true
debug=true

// OUTPUT: (varies)
// CONDITIONS EVALUATION REPORT: Positive matches / Negative matches ...`],
        [`<p>Scenario: dev, test and prod environments.</p><ul><li><code>application.properties</code> holds common values.</li><li><code>application-dev.properties</code> uses an in-memory H2 database.</li><li>Production gets its database settings from environment variables.</li><li>Tests run with <code>@ActiveProfiles(&quot;test&quot;)</code>.</li></ul>`,
            r`@SpringBootTest
@ActiveProfiles("test")
class ProfileTest {
    @Autowired Environment env;

    @Test
    void usesTestProfile() {
        assertTrue(env.acceptsProfiles(Profiles.of("test")));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]
    ),

    'mvc-exception-layer': dv(
        [`<p>How an exception becomes a response:</p><ul><li><b>DispatcherServlet</b> catches an exception from the handler and asks its <code>HandlerExceptionResolver</code> chain.</li><li><b>ExceptionHandlerExceptionResolver</b> finds a matching <code>@ExceptionHandler</code> in the controller, then in <code>@ControllerAdvice</code> beans.</li><li><b>ResponseStatusExceptionResolver</b> handles <code>@ResponseStatus</code> and <code>ResponseStatusException</code>.</li><li><b>DefaultHandlerExceptionResolver</b> maps framework errors such as a missing parameter to 400.</li><li>If none match, the error goes to the container and Boot <code>/error</code>.</li></ul>`,
            r`@ResponseStatus(HttpStatus.NOT_FOUND)
public class ItemNotFoundException extends RuntimeException { }

// or inline, without a custom class:
throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item 5 not found");

// OUTPUT:
// GET /items/5 -> 404 {"status":404,"error":"Not Found","message":"Item 5 not found"}`],
        [`<p>Handler options:</p><ul><li><b>@ExceptionHandler</b> with several types.</li><li><b>@ControllerAdvice(basePackages)</b> to limit scope.</li><li><b>ResponseEntityExceptionHandler</b> base class for standard Spring errors.</li><li><b>ProblemDetail</b> with extra properties.</li><li><b>spring.mvc.problemdetails.enabled=true</b> turns on RFC 7807 for built-in errors.</li></ul>`,
            r`@RestControllerAdvice
public class ApiErrors extends ResponseEntityExceptionHandler {

    @ExceptionHandler({IllegalStateException.class, DataIntegrityViolationException.class})
    ProblemDetail conflict(Exception ex) {
        ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Conflict");
        p.setTitle("Request conflicts with current state");
        p.setProperty("timestamp", Instant.now().toString());
        return p;
    }
}

// OUTPUT: (varies)
// 409 {"title":"Request conflicts with current state","status":409,"timestamp":"..."}`],
        [`<p>Common mistakes:</p><ul><li><b>Catching Exception for everything:</b> hides bugs and returns wrong codes.</li><li><b>Returning 200 with an error body.</b></li><li><b>Leaking stack traces:</b> keep <code>server.error.include-stacktrace=never</code>.</li><li><b>No logging</b> in the handler for 500 errors.</li><li><b>Checked exceptions</b> that do not roll back transactions.</li></ul>`,
            r`// WRONG: swallows the problem and returns 200
@ExceptionHandler(Exception.class)
Map<String, String> all(Exception e) { return Map.of("error", e.getMessage()); }

// RIGHT: specific type, right status, log unexpected errors
@ExceptionHandler(Exception.class)
ResponseEntity<ProblemDetail> unexpected(Exception e) {
    log.error("Unexpected error", e);
    return ResponseEntity.status(500)
        .body(ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Server error"));
}

// OUTPUT:
// clients see a safe 500 message; the stack trace is only in the log`],
        [`<p>Performance and behavior:</p><ul><li>Exceptions are costly to create; avoid using them for normal flow such as a login check on every call.</li><li>Override <code>fillInStackTrace</code> for high-volume business exceptions if profiling shows a cost.</li><li>Keep handlers small; do not call the database in them.</li></ul>`,
            r`public class BusinessException extends RuntimeException {
    public BusinessException(String message) { super(message, null, false, false); }
    // no stack trace captured: cheaper for expected errors
}

// OUTPUT:
// the exception carries a message but no stack trace`],
        [`<p>Scenario: a checkout API.</p><ul><li>Out of stock gives 409 with the item name.</li><li>Invalid input gives 400 with field errors.</li><li>Unknown order gives 404.</li><li>A <code>traceId</code> property is added to every problem so support can find the log line.</li></ul>`,
            r`@ExceptionHandler(OutOfStockException.class)
ProblemDetail outOfStock(OutOfStockException ex) {
    ProblemDetail p = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    p.setProperty("item", ex.getItem());
    p.setProperty("traceId", MDC.get("traceId"));
    return p;
}

// OUTPUT: (varies)
// 409 {"detail":"Pen is out of stock","item":"pen","traceId":"a1b2c3"}`]
    ),

    'mvc-separation-of-concerns': dv(
        [`<p>How Spring supports layering:</p><ul><li><b>Stereotypes:</b> <code>@Controller</code>, <code>@Service</code>, <code>@Repository</code> mark the role of each class.</li><li><b>Dependency injection:</b> each layer receives the layer below as an interface or bean.</li><li><b>AOP proxies:</b> cross-cutting work such as transactions, logging and security is applied around services, so it is not repeated in each class.</li><li><b>Filters and interceptors</b> handle web-wide concerns outside controllers.</li></ul>`,
            r`@Aspect
@Component
public class TimingAspect {
    @Around("execution(* com.app.service..*(..))")
    public Object time(ProceedingJoinPoint pjp) throws Throwable {
        long t = System.nanoTime();
        try { return pjp.proceed(); }
        finally { log.info("{} took {} ms", pjp.getSignature(), (System.nanoTime() - t) / 1_000_000); }
    }
}

// OUTPUT: (varies)
// OrderService.place(..) took 8 ms     (no timing code inside the service)`],
        [`<p>Ways to organize code:</p><ul><li><b>Package by layer:</b> controller, service, repository folders.</li><li><b>Package by feature:</b> order, customer folders, each with its own layers.</li><li><b>Hexagonal or clean style:</b> domain in the center, adapters at the edge.</li><li><b>Modules:</b> separate Maven modules enforce dependencies.</li><li><b>ArchUnit:</b> tests that check the rules.</li></ul>`,
            r`@AnalyzeClasses(packages = "com.app")
class LayerRulesTest {
    @ArchTest
    static final ArchRule layers = Architectures.layeredArchitecture()
        .consideringAllDependencies()
        .layer("Web").definedBy("..controller..")
        .layer("Service").definedBy("..service..")
        .layer("Data").definedBy("..repository..")
        .whereLayer("Web").mayNotBeAccessedByAnyLayer()
        .whereLayer("Service").mayOnlyBeAccessedByLayers("Web")
        .whereLayer("Data").mayOnlyBeAccessedByLayers("Service");
}

// OUTPUT:
// fails the build if a controller calls a repository directly`],
        [`<p>Common mistakes:</p><ul><li><b>Fat controller:</b> rules and queries in the controller.</li><li><b>Anemic everything:</b> services that only forward calls.</li><li><b>Circular dependencies</b> between services.</li><li><b>Transaction in the controller.</b></li><li><b>Entities as API models.</b></li></ul>`,
            r`// WRONG: circular dependency between services
// OrderService -> CustomerService -> OrderService

// RIGHT: extract the shared part into a third class
@Service class PricingService { /* used by both */ }

// OUTPUT:
// the context starts without BeanCurrentlyInCreationException`],
        [`<p>Performance and maintenance:</p><ul><li>Layers add little runtime cost; proxies are cheap.</li><li>The real cost is extra mapping code, so keep it simple for small apps.</li><li>Clear layers let teams work in parallel and speed up tests.</li></ul>`,
            r`// test speed by slice (typical)
// plain service unit test      : 10 ms, no Spring context
// @WebMvcTest controller test  : 1 s, web layer only
// @SpringBootTest full test    : 5 s, whole context

// OUTPUT: (varies)
// most tests stay at the fast end when layers are clean`],
        [`<p>Scenario: a team moves a fat controller into layers.</p><ul><li>The query and rules move to <code>OrderService</code>.</li><li>Persistence moves to <code>OrderRepository</code>.</li><li>The controller only maps HTTP to a service call.</li><li>Result: tests drop from slow integration tests to fast unit tests.</li></ul>`,
            r`@GetMapping("/orders/{id}")
OrderResponse get(@PathVariable Long id) {
    return service.get(id);              // one line: delegate
}

// OUTPUT:
// GET /orders/1 -> 200 {"id":1,"item":"pen"}`]
    ),

    'mvc-ajax': dv(
        [`<p>What happens on an AJAX call in Spring MVC:</p><ul><li><b>Browser:</b> <code>fetch</code> sends an HTTP request in the background and never navigates.</li><li><b>HandlerMapping</b> finds the method; <code>RequestMappingHandlerAdapter</code> invokes it.</li><li><b>Arguments:</b> <code>@RequestBody</code> is read by an <code>HttpMessageConverter</code> (Jackson).</li><li><b>Return value:</b> <code>@ResponseBody</code> (implied by <code>@RestController</code>) skips view resolution and writes JSON directly.</li><li><b>Browser again:</b> JavaScript reads the response and changes the DOM.</li></ul>`,
            r`@Controller
public class ProductPage {
    @GetMapping("/products")                 // full page, view name
    public String page() { return "products"; }

    @GetMapping("/products/data")
    @ResponseBody                            // JSON, no view
    public List<ProductResponse> data() {
        return List.of(new ProductResponse(1L, "Pen", BigDecimal.TEN));
    }
}

// OUTPUT:
// GET /products -> HTML page; GET /products/data -> [{"id":1,"name":"Pen","price":10}]`],
        [`<p>AJAX styles with Spring:</p><ul><li><b>JSON API:</b> script builds the HTML.</li><li><b>HTML fragment:</b> return a Thymeleaf fragment (<code>products :: rows</code>) and insert it.</li><li><b>Htmx:</b> attributes in HTML call fragment endpoints.</li><li><b>Server-sent events:</b> <code>SseEmitter</code> pushes updates.</li><li><b>jQuery <code>$.ajax</code>:</b> older code uses it.</li><li><b>Async Spring:</b> return <code>Callable</code> or <code>DeferredResult</code> for long calls.</li></ul>`,
            r`@GetMapping("/products/rows")
public String rows(Model model) {
    model.addAttribute("products", service.list());
    return "products :: rows";               // Thymeleaf fragment only
}

@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter events() { return emitter; }

// OUTPUT:
// the browser receives only the table rows HTML, and inserts it into the page`],
        [`<p>Common AJAX mistakes:</p><ul><li><b>No Content-Type header:</b> Spring returns 415 Unsupported Media Type.</li><li><b>CSRF token missing:</b> 403.</li><li><b>CORS not configured:</b> the browser blocks the response, although the server ran the code.</li><li><b>Returning a view name from an AJAX method:</b> the script gets HTML or a 404 template error; add <code>@ResponseBody</code>.</li><li><b>Not checking <code>response.ok</code></b> in JavaScript.</li></ul>`,
            r`// WRONG: no Content-Type, server answers 415
// fetch("/api/users", { method: "POST", body: JSON.stringify(u) });

// RIGHT
fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(u)
}).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });

// OUTPUT:
// 201 Created with the saved user as JSON`],
        [`<p>Performance:</p><ul><li><b>Small payloads:</b> return DTOs and page long lists.</li><li><b>Caching:</b> add <code>Cache-Control</code> or ETag with <code>ShallowEtagHeaderFilter</code> for rarely changing data.</li><li><b>Compression</b> for large JSON.</li><li><b>Debounce</b> search-as-you-type calls in the browser.</li><li><b>Async handlers</b> free servlet threads during slow work.</li></ul>`,
            r`@GetMapping("/api/countries")
public ResponseEntity<List<Country>> countries() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS))
        .body(service.countries());
}

// OUTPUT:
// Cache-Control: max-age=3600 (the browser reuses the response for one hour)`],
        [`<p>Scenario: live username check on a sign-up form.</p><ul><li>On each pause in typing the page calls <code>GET /api/users/exists?name=asha</code>.</li><li>The controller returns <code>{&quot;taken&quot;:true}</code> using an indexed query.</li><li>The page shows a message with no reload; the server still checks again on submit.</li></ul>`,
            r`@GetMapping("/api/users/exists")
public Map<String, Boolean> exists(@RequestParam String name) {
    return Map.of("taken", repo.existsByNameIgnoreCase(name));
}

// OUTPUT:
// GET /api/users/exists?name=asha -> {"taken":true}`]
    )
};
