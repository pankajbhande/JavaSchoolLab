import { Topic } from '../coreJava';

export const springBootTesting: Topic = {
    id: 'spring-boot-testing',
    name: 'Testing Spring Boot Applications',
    beginner: [
        {
            content: `<h3>Unit Test vs Integration Test</h3>
Testing a Spring Boot application happens at two very different levels: <br><br>

<h4>1. Unit Test</h4>
• Tests <strong>one class in isolation</strong> - for example, just a service class. <br>
• Any dependency the class needs is faked (mocked) so no real database, no real Spring context, no real network call happens. <br>
• Very fast, because nothing heavy is loaded. <br><br>

<h4>2. Integration Test</h4>
• Tests the <strong>whole wired application</strong> (or a large slice of it) - Spring actually creates the beans, wires them together, and everything runs as it would in production. <br>
• Slower, because the Spring context has to start up. <br>
• Used to check that all the pieces work correctly <strong>together</strong>, not just individually. <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Unit Test</th><th>Integration Test</th></tr>
<tr class='text-center'><td>Scope</td><td>One class</td><td>Multiple classes / full app</td></tr>
<tr class='text-center'><td>Spring context loaded?</td><td>No</td><td>Yes (fully or partially)</td></tr>
<tr class='text-center'><td>Speed</td><td>Very fast</td><td>Slower</td></tr>
<tr class='text-center'><td>Dependencies</td><td>Mocked</td><td>Real (or close to real)</td></tr>
</table>`
        },

        {
            content: `<h4>A Basic JUnit 5 Test (No Spring Involved)</h4>
This is the simplest possible test - a plain service class with no Spring annotations at all, tested with plain JUnit 5. <br>
• <code>@Test</code> marks a method as a test case. <br>
• <code>assertEquals(expected, actual)</code> checks that the value produced matches what we expect. <br>`,
            codeExamples: [`// CalculatorService.java - plain class, no Spring
public class CalculatorService {
    public int add(int a, int b) {
        return a + b;
    }
}

// CalculatorServiceTest.java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class CalculatorServiceTest {

    @Test
    void addsTwoNumbersCorrectly() {
        CalculatorService service = new CalculatorService();
        int result = service.add(2, 3);
        assertEquals(5, result);
    }
}
// OUTPUT:
// Test passes - no Spring context needed, runs in milliseconds`]
        },

        {
            content: `<h4>What @SpringBootTest Does</h4>
<code>@SpringBootTest</code> tells Spring to <strong>load the full application context</strong> - all your <code>@Component</code>, <code>@Service</code>, <code>@Repository</code>, configuration classes etc. get created and wired together, just like when the real app starts. <br>
This makes it an <strong>integration test</strong> - you are testing the real wiring, not a fake version of it. It is slower than a plain unit test because the whole context has to boot up.`,
            codeExamples: [`import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class MyApplicationTests {

    @Autowired
    private CalculatorService calculatorService; // real Spring-managed bean

    @Test
    void contextLoadsAndBeanIsAvailable() {
        assertNotNull(calculatorService);
    }
}
// OUTPUT:
// Spring Boot starts the full application context, then the test passes
// because "calculatorService" was successfully injected from that context`]
        },

        {
            content: `<h4>Mocking a Dependency with Mockito</h4>
Sometimes we want to test a class in isolation but it depends on something else (like a repository). Instead of using the real dependency, we create a <strong>mock</strong> - a fake object we fully control. <br>
• <code>@Mock</code> creates the fake object. <br>
• <code>when(...).thenReturn(...)</code> tells the mock what to return when a method is called on it. <br>`,
            codeExamples: [`import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

interface UserRepository {
    String findNameById(int id);
}

class UserService {
    private final UserRepository repository;
    UserService(UserRepository repository) { this.repository = repository; }

    String greet(int id) {
        return "Hello, " + repository.findNameById(id);
    }
}

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository repository; // fake dependency, no real DB call

    @Test
    void greetsUserUsingMockedRepository() {
        when(repository.findNameById(1)).thenReturn("Pankaj"); // control the fake

        UserService service = new UserService(repository);
        assertEquals("Hello, Pankaj", service.greet(1));
    }
}
// OUTPUT:
// Test passes - no real database was ever touched, "repository" always
// returns "Pankaj" because we told the mock to do so`]
        }
    ],

    expert: [
        {
            content: `<h3>Test Slice Annotations - Loading Only What You Need</h3>
A full <code>@SpringBootTest</code> boots the <strong>entire</strong> application context - every controller, every service, every repository, every auto-configuration. For a large app that can take several seconds <strong>per test class</strong>, which adds up fast across hundreds of tests. <br><br>

Spring Boot provides <strong>test slice</strong> annotations that load only the beans relevant to one layer, keeping the rest of the context out entirely: <br>
• <code>@WebMvcTest</code> - loads only the web layer (controllers, <code>@ControllerAdvice</code>, converters, filters) - services and repositories are NOT loaded, so you must mock them. <br>
• <code>@DataJpaTest</code> - loads only the JPA/repository layer (an embedded in-memory database by default) - controllers and services are NOT loaded. <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Annotation</th><th>What it loads</th><th>What it skips</th><th>Typical use</th></tr>
<tr class='text-center'><td>@SpringBootTest</td><td>Entire application context</td><td>Nothing - everything is real</td><td>Full end-to-end integration test</td></tr>
<tr class='text-center'><td>@WebMvcTest</td><td>MVC infra: controllers, filters, converters, @ControllerAdvice</td><td>@Service, @Repository beans (must mock with @MockBean)</td><td>Testing controller request/response behavior</td></tr>
<tr class='text-center'><td>@DataJpaTest</td><td>JPA repositories + embedded DB (e.g. H2) + entity manager</td><td>Controllers, services, web layer</td><td>Testing repository queries</td></tr>
</table>
<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">@SpringBootTest         (slowest - loads everything)
   |
   +-- Controllers
   +-- Services
   +-- Repositories
   +-- Full DB config
   +-- All auto-configuration

@WebMvcTest              (fast - web layer only)
   |
   +-- Controllers        <-- loaded
   +-- Services            X  must @MockBean
   +-- Repositories        X  not loaded

@DataJpaTest              (fast - persistence layer only)
   |
   +-- Repositories       <-- loaded
   +-- Embedded DB (H2)   <-- loaded
   +-- Controllers          X  not loaded
   +-- Services             X  not loaded</pre>
<br>
Because slices load a much smaller subset of beans, the context startup is dramatically faster, which matters a lot when you have hundreds of test classes running in CI.`
        },

        {
            content: `<h3>Testing REST Controllers with MockMvc</h3>
<code>MockMvc</code> lets you send a fake HTTP request into the Spring MVC layer (no real server, no real port) and assert on the resulting status code and JSON body. It is typically combined with <code>@WebMvcTest</code> for a fast, focused controller test.`,
            codeExamples: [`// UserController.java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) { this.userService = userService; }

    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable int id) {
        return userService.findById(id);
    }

    @PostMapping
    public UserDto createUser(@RequestBody UserDto dto) {
        return userService.save(dto);
    }
}

// UserControllerTest.java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class) // loads only the web layer for UserController
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc; // simulates HTTP requests without starting a server

    @MockBean
    private UserService userService; // fake service - controller layer only

    @Test
    void getUser_returnsJsonWithExpectedName() throws Exception {
        when(userService.findById(1)).thenReturn(new UserDto(1, "Pankaj"));

        mockMvc.perform(get("/api/users/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.name").value("Pankaj"));
    }

    @Test
    void createUser_returns201AndEchoesBody() throws Exception {
        when(userService.save(any())).thenReturn(new UserDto(2, "Ravi"));

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\\"name\\":\\"Ravi\\"}"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(2))
               .andExpect(jsonPath("$.name").value("Ravi"));
    }
}
// OUTPUT:
// Both tests pass - MockMvc dispatched fake HTTP requests through the real
// controller, but "userService" was a mock, so no real business logic ran`]
        },

        {
            content: `<h3>@MockBean vs Plain Mockito @Mock</h3>
Both create a fake object that you can program with <code>when(...).thenReturn(...)</code>, but they operate at different levels: <br><br>

• <code>@Mock</code> (Mockito) - creates a plain fake object with no Spring involvement at all. Used in pure unit tests where there is no application context to worry about. <br>
• <code>@MockBean</code> (Spring Boot Test) - creates a Mockito mock <strong>and registers it in the Spring application context</strong>, replacing the real bean of that type. Any other bean that gets the real one autowired will instead receive this mock. Requires a Spring context to already be loading (e.g. inside <code>@SpringBootTest</code> or <code>@WebMvcTest</code>). <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>@Mock</th><th>@MockBean</th></tr>
<tr class='text-center'><td>Spring context required?</td><td>No</td><td>Yes</td></tr>
<tr class='text-center'><td>Registered as a Spring bean?</td><td>No</td><td>Yes - replaces the real bean</td></tr>
<tr class='text-center'><td>Typical usage</td><td>Pure unit tests (@ExtendWith(MockitoExtension.class))</td><td>Slice tests (@WebMvcTest) or full @SpringBootTest</td></tr>
<tr class='text-center'><td>Speed</td><td>Fastest - no context</td><td>Slower - context still loads (minus the real bean)</td></tr>
</table>`,
            codeExamples: [`// Plain Mockito @Mock - no Spring context at all
@ExtendWith(MockitoExtension.class)
class OrderServiceUnitTest {
    @Mock
    private PaymentGateway paymentGateway; // never registered anywhere in Spring

    @Test
    void chargesCustomer() {
        OrderService service = new OrderService(paymentGateway);
        when(paymentGateway.charge(100)).thenReturn(true);
        assertTrue(service.placeOrder(100));
    }
}

// @MockBean - fake is injected INTO the real Spring context
@WebMvcTest(OrderController.class)
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PaymentGateway paymentGateway;
    // Spring wires THIS mock into OrderController's real dependencies
    // wherever a PaymentGateway bean would normally be autowired

    @Test
    void placeOrder_delegatesToPaymentGateway() throws Exception {
        when(paymentGateway.charge(100)).thenReturn(true);

        mockMvc.perform(post("/api/orders").param("amount", "100"))
               .andExpect(status().isOk());
    }
}
// OUTPUT:
// Both tests pass - but only @MockBean's fake is actually sitting inside
// a real, running Spring ApplicationContext`]
        },

        {
            content: `<h3>In-Memory H2 Database vs Mocking the Repository</h3>
When testing code that talks to a repository, there are two common strategies, each with real tradeoffs: <br><br>

<strong>1. In-memory database (e.g. H2) with @DataJpaTest</strong> - a real (but temporary, in-memory) relational database is started, real SQL runs, real JPA/Hibernate mapping happens. <br>
<strong>2. Mocking the repository entirely</strong> - no database at all, the repository interface is faked and told what to return.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>H2 In-Memory DB (@DataJpaTest)</th><th>Mocked Repository (@Mock / @MockBean)</th></tr>
<tr class='text-center'><td>What it actually verifies</td><td>Real SQL/JPQL queries, entity mappings, constraints</td><td>Only that your service code calls the repository correctly</td></tr>
<tr class='text-center'><td>Speed</td><td>Slower (DB starts, schema created)</td><td>Very fast (no DB at all)</td></tr>
<tr class='text-center'><td>Catches broken queries?</td><td>Yes</td><td>No - the mock returns whatever you told it to</td></tr>
<tr class='text-center'><td>Catches wrong service logic?</td><td>Yes</td><td>Yes</td></tr>
<tr class='text-center'><td>Best used for</td><td>Testing the repository layer itself</td><td>Testing service/controller layers in isolation</td></tr>
</table>
<br>
<strong>Rule of thumb:</strong> use H2 with <code>@DataJpaTest</code> to verify your custom queries actually work; mock the repository when testing a service so a broken query in an unrelated method can't make an unrelated test fail.`,
            codeExamples: [`// Real query verified against H2 in-memory DB
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest // starts an embedded H2 DB and only JPA-related beans
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository; // real repository, backed by H2

    @Test
    void findByEmail_returnsMatchingUser() {
        userRepository.save(new User("pankaj@test.com", "Pankaj"));

        User found = userRepository.findByEmail("pankaj@test.com");

        assertEquals("Pankaj", found.getName());
    }
}
// OUTPUT:
// Passes only if the JPQL/derived query is actually correct -
// a typo in the method name or query would fail here for real`]
        },

        {
            content: `<h3>Test Lifecycle Annotations</h3>
JUnit 5 gives hooks to run setup/teardown code around your tests: <br>
• <code>@BeforeEach</code> - runs before <strong>every</strong> test method (fresh state each time). <br>
• <code>@AfterEach</code> - runs after every test method (cleanup). <br>
• <code>@BeforeAll</code> - runs <strong>once</strong>, before any test in the class (must be <code>static</code>) - good for expensive one-time setup. <br>
• <code>@AfterAll</code> - runs once, after all tests finish (must be <code>static</code>).<br>`,
            codeExamples: [`import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.assertEquals;

class AccountServiceTest {

    private static Connection sharedTestResource;
    private AccountService accountService;

    @BeforeAll
    static void initOnce() {
        sharedTestResource = Connection.openFake(); // expensive, done once
        System.out.println("BeforeAll: shared resource opened");
    }

    @BeforeEach
    void setUp() {
        accountService = new AccountService(); // fresh instance for every test
        System.out.println("BeforeEach: new AccountService created");
    }

    @Test
    void depositIncreasesBalance() {
        accountService.deposit(100);
        assertEquals(100, accountService.getBalance());
    }

    @Test
    void withdrawDecreasesBalance() {
        accountService.deposit(100);
        accountService.withdraw(40);
        assertEquals(60, accountService.getBalance());
    }

    @AfterEach
    void tearDown() {
        System.out.println("AfterEach: cleaning up account state");
    }

    @AfterAll
    static void closeOnce() {
        sharedTestResource.close();
        System.out.println("AfterAll: shared resource closed");
    }
}
// OUTPUT:
// BeforeAll: shared resource opened
// BeforeEach: new AccountService created
// (test 1 runs)
// AfterEach: cleaning up account state
// BeforeEach: new AccountService created
// (test 2 runs)
// AfterEach: cleaning up account state
// AfterAll: shared resource closed`]
        },

        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between a unit test and an integration test?</td><td>A unit test checks one class in isolation with dependencies mocked; an integration test loads real, wired components (often via a Spring context) to check they work together correctly.</td></tr>
<tr><td>What does @SpringBootTest do?</td><td>It loads the complete Spring application context, giving you a real integration test environment identical to how the app runs in production.</td></tr>
<tr><td>Why use @WebMvcTest instead of @SpringBootTest for a controller?</td><td>@WebMvcTest loads only the web layer, so the test starts much faster and stays focused on controller behavior; service/repository beans must be supplied as @MockBean.</td></tr>
<tr><td>What does @DataJpaTest configure by default?</td><td>An embedded in-memory database (e.g. H2), the JPA repositories, and the entity manager - without loading controllers or services.</td></tr>
<tr><td>What is MockMvc used for?</td><td>Simulating HTTP requests against Spring MVC controllers without starting a real HTTP server, then asserting on status code and response body.</td></tr>
<tr><td>What is the key difference between @Mock and @MockBean?</td><td>@Mock is a plain Mockito fake with no Spring involvement; @MockBean creates a mock AND registers it in the Spring ApplicationContext, replacing the real bean everywhere it's autowired.</td></tr>
<tr><td>When would you prefer testing against a real H2 database over mocking the repository?</td><td>When you need to verify that a custom query (JPQL/derived query method) is actually correct - a mock can't catch a broken query since it just returns whatever you configured.</td></tr>
<tr><td>What is the difference between @BeforeEach and @BeforeAll?</td><td>@BeforeEach runs before every single test method (fresh state each time); @BeforeAll runs once before all tests in the class and must be static, typically used for expensive shared setup.</td></tr>
<tr><td>Why are test slices generally faster than @SpringBootTest?</td><td>They load only the beans relevant to one layer instead of the entire application context, so far fewer beans need to be created and wired at startup.</td></tr>
<tr><td>Can @MockBean be used without any test slice or @SpringBootTest?</td><td>No - @MockBean needs an active Spring test context to register the mock into; without one loading, there is no ApplicationContext to inject the fake bean into.</td></tr>
</table>`
        }
    ],
};
