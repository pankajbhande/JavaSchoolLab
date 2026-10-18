import { Topic } from '../coreJava';

export const springBootServiceCommunication: Topic = {
    id: 'spring-boot-service-communication',
    name: 'Inter-Service Communication with WebClient',
    beginner: [
        {
            content: `<h3>Calling One Microservice From Another</h3>
Two independent services, each with its own database and its own port. The User service needs policy details that only the Policy service owns - so it makes an HTTP call.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   CLIENT
     |
     |  GET /getUser/1
     v
+---------------------------+          +---------------------------+
|   UserMicroService        |          |   PolicyMicroService      |
|   port 8282               |          |   port 8181               |
|                           |          |                           |
|  UserController           |          |  PolicyController         |
|  UserServiceImpl  --------|--------->|  GET /getPolicy/{id}      |
|      | WebClient          |   HTTP   |          |                |
|  UserRepository           |          |  PolicyRepository         |
+---------------------------+          +---------------------------+
     |                                            |
  +------+                                    +--------+
  | user |                                    | policy |
  +------+                                    +--------+

Response: ResponseDto { user: {...}, policy: {...} }</pre>
<br>
The User service composes a single response out of its own data plus data fetched over the network. That composition is the pattern - a monolith would have done it with a JOIN.<br>`
        },
        {
            content: `<h3>Part 1 - The Policy Microservice (the callee)</h3>
An ordinary REST service. It has no idea anyone will call it from another service.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the project &nbsp; 2. Add dependencies &nbsp; 3. Model class &nbsp; 4. Service &nbsp; 5. Service implementation<br>
6. Repository &nbsp; 7. REST controller &nbsp; 8. application.properties &nbsp; 9. Run &nbsp; 10. Postman
</div>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
<!-- com.mysql:mysql-connector-j is the current coordinate.
     The old mysql:mysql-connector-java is deprecated. -->`,
                `// Step 3 - Policy.java
package com.velocity.model;

import javax.persistence.*;

@Entity
@Table(name = "policy")
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String status;

    // getters and setters
}`,
                `// Steps 4-6 - service, implementation, repository
public interface PolicyService {
    Policy savePolicy(Policy policy);
    Policy getPolicy(Integer id);
}

@Service
public class PolicyServiceImpl implements PolicyService {

    @Autowired
    private PolicyRepository policyRepository;

    @Override
    public Policy savePolicy(Policy policy) {
        return policyRepository.save(policy);
    }

    @Override
    public Policy getPolicy(Integer id) {
        return policyRepository.findById(id).orElse(null);
    }
}

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Integer> {
}
// Use JpaRepository<Policy, Integer> - the id is an int.
// CrudRepository<Policy, Serializable> plus a hand-declared
// "Policy findById(Integer)" clashes with the inherited
// Optional<Policy> findById(ID) and will not compile.`,
                `// Step 7 - PolicyController.java
package com.velocity.restcontroller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.velocity.model.Policy;
import com.velocity.service.PolicyService;

@RestController
public class PolicyController {

    @Autowired
    private PolicyService policyService;

    @PostMapping("/addPolicy")
    public Policy savePolicy(@RequestBody Policy policy) {
        return policyService.savePolicy(policy);
    }

    @GetMapping("/getPolicy/{id}")
    public Policy getPolicy(@PathVariable("id") Integer id) {
        return policyService.getPolicy(id);
    }
}`,
                `# Step 8 - application.properties
server.port=8181

#MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/bootdepth?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true`,
                `// Step 10 - seed a policy, then read it back
// POST http://localhost:8181/addPolicy
// { "name": "Term Plan", "status": "active" }
// RESPONSE: { "id": 1, "name": "Term Plan", "status": "active" }

// GET http://localhost:8181/getPolicy/1
// RESPONSE: { "id": 1, "name": "Term Plan", "status": "active" }
//
// This is the endpoint the User service will call.`
            ]
        },
        {
            content: `<h3>Part 2 - The User Microservice (the caller)</h3>
Same structure, plus two additions: the <strong>WebFlux</strong> dependency (which brings <code>WebClient</code>) and a set of <strong>DTO</strong> classes for the composed response.<br><br>

<table>
<tr><th>Class</th><th>Purpose</th></tr>
<tr><td>User (entity)</td><td>This service's own table.</td></tr>
<tr><td>UserDto</td><td>The user fields that go into the response.</td></tr>
<tr><td>PolicyDto</td><td>The shape of what the Policy service returns - a local copy, not a shared class.</td></tr>
<tr><td>ResponseDto</td><td>The combined answer: a user plus a policy.</td></tr>
</table>`,
            codeExamples: [
                `<!-- Step 2 - the extra dependency that provides WebClient -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
<!-- Adding webflux alongside spring-boot-starter-web does NOT turn
     the application reactive. Boot detects both and keeps the
     servlet stack; webflux is here only for the WebClient type. -->`,
                `// Step 3 - User.java
package com.velocity.model;

import javax.persistence.*;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String firstName;
    private String lastName;
    private String email;
    private String policyId;        // which policy this user holds

    // getters and setters
}`,
                `// Step 4 - the DTOs
package com.velocity.dto;

public class UserDto {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    // getters and setters
}

public class PolicyDto {
    private Integer id;
    private String name;
    private String status;
    // getters and setters
}

public class ResponseDto {
    private PolicyDto policy;
    private UserDto user;
    // getters and setters
}
// PolicyDto is deliberately a SEPARATE class from the Policy entity
// in the other service. Sharing a class across services would couple
// them at compile time and undo their independence.`
            ]
        },
        {
            content: `<h3>Step 10 - Declare the WebClient Bean</h3>
<code>WebClient</code> is not auto-configured as a bean, only its builder is. Without this bean the application fails at startup with <code>NoSuchBeanDefinitionException: No qualifying bean of type WebClient</code>.<br>`,
            codeExamples: [
                `package com.velocity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.reactive.function.client.WebClient;

@SpringBootApplication
public class UserMicroServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserMicroServiceApplication.class, args);
    }

    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
}`
            ]
        },
        {
            content: `<h3>Steps 5 to 8 - The Service That Makes the Call</h3>
This is the heart of the topic. <code>webClient.get().uri(...).retrieve().bodyToMono(PolicyDto.class).block()</code> performs an HTTP GET against the other service and deserialises the JSON into <code>PolicyDto</code>.<br><br>

<table>
<tr><th>Call</th><th>Meaning</th></tr>
<tr><td><code>.get()</code></td><td>The HTTP method.</td></tr>
<tr><td><code>.uri(...)</code></td><td>The target URL.</td></tr>
<tr><td><code>.retrieve()</code></td><td>Send the request and prepare to read the body.</td></tr>
<tr><td><code>.bodyToMono(PolicyDto.class)</code></td><td>Deserialise the body into one object, asynchronously.</td></tr>
<tr><td><code>.block()</code></td><td>Wait for it. Turns the async result back into a plain value.</td></tr>
</table>`,
            codeExamples: [
                `package com.velocity.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.velocity.dto.PolicyDto;
import com.velocity.dto.ResponseDto;
import com.velocity.dto.UserDto;
import com.velocity.model.User;
import com.velocity.repository.UserRepository;
import com.velocity.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebClient webClient;

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public ResponseDto getUser(Integer userId) {

        ResponseDto responseDto = new ResponseDto();

        // 1. this service's OWN data, from its own database
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        UserDto userDto = mapToUser(user);

        // 2. the OTHER service's data, over HTTP
        PolicyDto policyDto = webClient.get()
                .uri("http://localhost:8181/getPolicy/" + user.getPolicyId())
                .retrieve()
                .bodyToMono(PolicyDto.class)
                .block();

        // 3. combine them
        responseDto.setUser(userDto);
        responseDto.setPolicy(policyDto);
        return responseDto;
    }

    private UserDto mapToUser(User user) {
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setFirstName(user.getFirstName());
        userDto.setLastName(user.getLastName());
        userDto.setEmail(user.getEmail());
        return userDto;
    }
}
// NOTE the uri: it uses user.getPolicyId() - the policy this user
// actually holds. Passing user.getId() there would work only while
// the two ids happen to coincide, and silently return the wrong
// policy the moment they diverge.`,
                `// Step 8 - UserController.java
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/addUser")
    public User saveUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @GetMapping("/getUser/{id}")
    public ResponseDto getUser(@PathVariable("id") Integer id) {
        return userService.getUser(id);
    }
}`,
                `# Step 9 - application.properties
server.port=8282

#MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/bootdepth?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true`
            ]
        },
        {
            content: `<h3>Step 12 - Running Both and Testing</h3>
Both services must be running: Policy on 8181, User on 8282.<br>`,
            codeExamples: [
                `// STEP 1 - create a user in the User service
// POST http://localhost:8282/addUser
{
    "firstName": "ajay",
    "lastName": "patil",
    "email": "ajay@gmail.com",
    "policyId": "1"
}
// RESPONSE (200 OK)
{
    "id": 1,
    "firstName": "ajay",
    "lastName": "patil",
    "email": "ajay@gmail.com",
    "policyId": "1"
}`,
                `// STEP 2 - fetch the composed response
// GET http://localhost:8282/getUser/1
// RESPONSE (200 OK)
{
    "policy": {
        "id": 1,
        "name": "Term Plan",
        "status": "active"
    },
    "user": {
        "id": 1,
        "firstName": "ajay",
        "lastName": "patil",
        "email": "ajay@gmail.com"
    }
}

// USER SERVICE CONSOLE:
// Hibernate: select ... from user user0_ where user0_.id=?

// POLICY SERVICE CONSOLE (the call arrived here):
// Hibernate: select ... from policy policy0_ where policy0_.id=?
//
// Two services, two databases, one response.`,
                `// Now stop the Policy service and repeat the same request:
// GET http://localhost:8282/getUser/1
// RESPONSE: 500 Internal Server Error
//
// org.springframework.web.reactive.function.client.WebClientRequestException:
//   Connection refused: localhost/127.0.0.1:8181
//
// The User service is healthy, its database is fine, and the endpoint
// still fails - because a dependency is down. Handling that is the
// whole subject of the Expert tab.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Hard-Coded URLs Defeat the Point</h3>
<code>"http://localhost:8181/getPolicy/"</code> works on one laptop and nowhere else. It breaks the moment the Policy service moves host, changes port, or scales to more than one instance - and with several instances running, every call still goes to the same one.<br><br>

<table>
<tr><th>Approach</th><th>What it fixes</th></tr>
<tr><td>Externalised property</td><td>The URL is configurable per environment. Still one fixed instance.</td></tr>
<tr><td><code>@LoadBalanced</code> + Eureka</td><td>Call by <em>service name</em>; discovery resolves it and round-robins across instances.</td></tr>
<tr><td>OpenFeign</td><td>The same, expressed as an interface - the least code at the call site.</td></tr>
</table>`,
            codeExamples: [
                `# Step 1 - at minimum, get it out of the code
# application.properties
services.policy.base-url=http://localhost:8181

# application-prod.properties
services.policy.base-url=http://policy-service.internal:8181`,
                `// Configure the base URL once, on the bean
@Bean
public WebClient policyWebClient(
        @Value("\${services.policy.base-url}") String baseUrl) {

    return WebClient.builder()
            .baseUrl(baseUrl)
            .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
            .build();
}

// The call site now carries only the path, and uses a URI template
// so the value is encoded rather than concatenated:
PolicyDto policy = policyWebClient.get()
        .uri("/getPolicy/{id}", user.getPolicyId())
        .retrieve()
        .bodyToMono(PolicyDto.class)
        .block();`,
                `// Step 2 - discovery, so the name resolves to a live instance
@Bean
@LoadBalanced
public WebClient.Builder loadBalancedWebClientBuilder() {
    return WebClient.builder();
}

@Service
public class UserServiceImpl {

    private final WebClient webClient;

    public UserServiceImpl(WebClient.Builder builder) {
        // POLICYSERVICE is the spring.application.name of the other service
        this.webClient = builder.baseUrl("http://POLICYSERVICE").build();
    }
}
// OUTPUT: calls are resolved through Eureka and spread across every
// UP instance. Start a second Policy instance on 8182 and traffic
// alternates with no code or config change.`,
                `// Step 3 - OpenFeign, the form most teams settle on
@FeignClient(name = "policyservice")
public interface PolicyClient {

    @GetMapping("/getPolicy/{id}")
    PolicyDto getPolicy(@PathVariable("id") String id);
}

@Service
public class UserServiceImpl implements UserService {

    private final PolicyClient policyClient;

    @Override
    public ResponseDto getUser(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow();
        PolicyDto policy = policyClient.getPolicy(user.getPolicyId());
        return new ResponseDto(mapToUser(user), policy);
    }
}
// Discovery, load balancing, serialisation and HTTP all handled.
// The call site reads like a local method call.`
            ]
        },
        {
            content: `<h3>A Network Call Has Failure Modes a Method Call Does Not</h3>
The bare <code>.block()</code> above has <strong>no timeout</strong>. If the Policy service accepts the connection and then hangs, the calling thread waits indefinitely. Under load, every Tomcat worker ends up parked on that call and the User service stops responding to <em>everything</em> - including requests that never needed a policy.<br><br>

That is a cascading failure, and it is the single most important thing to get right.<br><br>

<table>
<tr><th>Protection</th><th>What it prevents</th></tr>
<tr><td>Connect timeout</td><td>Waiting forever for an unreachable host.</td></tr>
<tr><td>Response timeout</td><td>Waiting forever for a hung service.</td></tr>
<tr><td>Retry (idempotent calls only)</td><td>A single transient blip failing the request.</td></tr>
<tr><td>Circuit breaker</td><td>Hammering a service that is already down, and exhausting your own threads.</td></tr>
<tr><td>Fallback</td><td>A total failure when a degraded answer would do.</td></tr>
</table>`,
            codeExamples: [
                `// Timeouts on the client itself
@Bean
public WebClient policyWebClient(@Value("\${services.policy.base-url}") String baseUrl) {

    HttpClient httpClient = HttpClient.create()
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 2000)
            .responseTimeout(Duration.ofSeconds(3));

    return WebClient.builder()
            .baseUrl(baseUrl)
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();
}
// OUTPUT when the callee hangs:
// WebClientRequestException: Connection prematurely closed
//   caused by ReadTimeoutException
// after 3 seconds instead of never.`,
                `// Error handling, retry and a fallback in one chain
public PolicyDto fetchPolicy(String policyId) {
    return policyWebClient.get()
            .uri("/getPolicy/{id}", policyId)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, response ->
                    Mono.error(new PolicyNotFoundException(policyId)))
            .onStatus(HttpStatusCode::is5xxServerError, response ->
                    Mono.error(new PolicyServiceException("policy service failed")))
            .bodyToMono(PolicyDto.class)
            .timeout(Duration.ofSeconds(3))
            .retryWhen(Retry.backoff(2, Duration.ofMillis(200))
                    .filter(t -> t instanceof PolicyServiceException))
            .onErrorResume(t -> {
                log.warn("policy unavailable for {}", policyId, t);
                return Mono.just(PolicyDto.unavailable());   // degraded answer
            })
            .block();
}
// OUTPUT when the Policy service is down:
// {
//   "user":   { "id": 1, "firstName": "ajay", ... },
//   "policy": { "id": null, "name": "unavailable", "status": "UNKNOWN" }
// }
// 200 OK with partial data, rather than a 500 with none.
//
// Retry ONLY idempotent calls. Retrying a POST that charges a card
// can charge it twice.`,
                `// A circuit breaker stops calling a service that is already failing
@CircuitBreaker(name = "policyService", fallbackMethod = "policyFallback")
public PolicyDto fetchPolicy(String policyId) { ... }

private PolicyDto policyFallback(String policyId, Throwable t) {
    return PolicyDto.unavailable();
}

# resilience4j config
resilience4j.circuitbreaker.instances.policyService:
  sliding-window-size: 10
  failure-rate-threshold: 50
  wait-duration-in-open-state: 30s
# Once OPEN, calls fail in microseconds without touching the network.
# That is what protects the caller's thread pool.`
            ]
        },
        {
            content: `<h3><code>.block()</code> Is Fine Here, and Fatal in a Reactive Application</h3>
<code>block()</code> converts an asynchronous <code>Mono</code> back into a plain value by waiting. On the <strong>servlet</strong> stack - which this application uses, because <code>spring-boot-starter-web</code> is present - each request already owns a thread, so blocking it is normal.<br><br>

In a genuinely reactive application it is a serious bug: blocking one of the few event-loop threads stalls every other request that thread was serving. Reactor detects it and throws.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">block()/blockFirst()/blockLast() are blocking, which is not supported
in thread reactor-http-nio-3</pre>

<table>
<tr><th>Stack</th><th>Is block() acceptable?</th></tr>
<tr><td>Servlet (spring-boot-starter-web)</td><td>Yes - the thread is yours to block.</td></tr>
<tr><td>Reactive (webflux only)</td><td>No - return the <code>Mono</code> and let the framework subscribe.</td></tr>
</table>
<br>
The bigger win from not blocking is <strong>parallelism</strong>. Fetching three services sequentially costs the sum of their latencies; fetching them concurrently costs the maximum.<br>`,
            codeExamples: [
                `// SEQUENTIAL - three blocking calls, latency adds up
PolicyDto  policy  = fetchPolicy(id);     // 120ms
PaymentDto payment = fetchPayment(id);    // 90ms
ClaimDto   claim   = fetchClaim(id);      // 110ms
// TOTAL: ~320ms

// CONCURRENT - one wait for all three
Mono<PolicyDto>  policy  = client.get().uri("/policies/{id}", id)
                                 .retrieve().bodyToMono(PolicyDto.class);
Mono<PaymentDto> payment = client.get().uri("/payments/{id}", id)
                                 .retrieve().bodyToMono(PaymentDto.class);
Mono<ClaimDto>   claim   = client.get().uri("/claims/{id}", id)
                                 .retrieve().bodyToMono(ClaimDto.class);

ResponseDto result = Mono.zip(policy, payment, claim)
        .map(t -> new ResponseDto(t.getT1(), t.getT2(), t.getT3()))
        .block();
// TOTAL: ~120ms - the slowest call, not the sum.`,
                `// In a fully reactive controller, do not block at all -
// return the Mono and let Spring subscribe.
@GetMapping("/getUser/{id}")
public Mono<ResponseDto> getUser(@PathVariable Integer id) {
    return userService.getUserReactive(id);
}`
            ]
        },
        {
            content: `<h3>WebClient vs RestTemplate vs RestClient</h3>
Three HTTP clients exist in the Spring ecosystem, and which one to reach for has changed.<br><br>

<table>
<tr><th>Client</th><th>Status</th><th>API style</th></tr>
<tr><td>RestTemplate</td><td>In maintenance mode since Spring 5 - not deprecated, but no new features</td><td>Blocking, template methods</td></tr>
<tr><td>WebClient</td><td>Current; needs spring-webflux</td><td>Fluent, non-blocking, <code>block()</code> available</td></tr>
<tr><td>RestClient</td><td>New in Spring 6.1 / Boot 3.2</td><td>WebClient's fluent API, synchronous, no webflux dependency</td></tr>
</table>
<br>
<strong>RestClient is the natural choice for a servlet application on Boot 3.2+</strong>: the same readable chained API as WebClient, without pulling in the reactive stack just to call <code>.block()</code> on everything.<br>`,
            codeExamples: [
                `// The same call, three ways

// 1. RestTemplate - the old style
PolicyDto policy = restTemplate.getForObject(
        "http://localhost:8181/getPolicy/{id}", PolicyDto.class, policyId);

// 2. WebClient - fluent, reactive underneath
PolicyDto policy = webClient.get()
        .uri("/getPolicy/{id}", policyId)
        .retrieve()
        .bodyToMono(PolicyDto.class)
        .block();

// 3. RestClient (Spring 6.1+) - fluent AND synchronous
PolicyDto policy = restClient.get()
        .uri("/getPolicy/{id}", policyId)
        .retrieve()
        .body(PolicyDto.class);
// No Mono, no block(), no webflux dependency.`,
                `@Bean
public RestClient policyRestClient(
        RestClient.Builder builder,
        @Value("\${services.policy.base-url}") String baseUrl) {

    return builder
            .baseUrl(baseUrl)
            .defaultStatusHandler(HttpStatusCode::is4xxClientError, (req, res) -> {
                throw new PolicyNotFoundException(req.getURI().toString());
            })
            .build();
}
// Spring Boot auto-configures RestClient.Builder, so unlike
// WebClient you do not have to build one from scratch.`
            ]
        },
        {
            content: `<h3>Synchronous Calls Couple Services Back Together</h3>
Every synchronous call adds a runtime dependency. If User calls Policy, then User's availability is capped by Policy's - and a chain of four services multiplies the risk.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Each service is up 99.9% of the time.

Chain of 4 synchronous calls:
    0.999 ^ 4  =  99.6%   ->  roughly 35 hours of downtime a year,
                              caused entirely by composition.</pre>

<table>
<tr><th>Question</th><th>Better approach</th></tr>
<tr><td>The caller needs an answer now</td><td>Synchronous HTTP - but with timeouts, a circuit breaker and a fallback.</td></tr>
<tr><td>The caller only needs to <em>tell</em> someone</td><td>Publish an event to Kafka or RabbitMQ. The callee can be down; the message waits.</td></tr>
<tr><td>The data changes rarely</td><td>Cache it locally, or keep a replica updated by events.</td></tr>
<tr><td>The chain is more than two deep</td><td>Reconsider the boundaries - services that always call each other may be one service.</td></tr>
</table>
<br>
The general rule: <strong>use synchronous calls for queries, and events for state changes.</strong> An event-driven write path removes the availability coupling entirely, at the price of eventual consistency.<br>`,
            codeExamples: [
                `// Caching a slow-changing lookup removes most of the calls
@Service
public class PolicyLookup {

    @Cacheable(value = "policies", key = "#policyId")
    public PolicyDto fetchPolicy(String policyId) {
        return policyWebClient.get()
                .uri("/getPolicy/{id}", policyId)
                .retrieve()
                .body(PolicyDto.class);
    }
}
# application.properties
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=5m
// OUTPUT: the first call goes over the network; the next 1000 within
// five minutes do not. Fewer calls means fewer chances to fail.`,
                `// The event-driven alternative for a WRITE path
// User service publishes; it does not wait for anyone.
@Transactional
public User createUser(User user) {
    User saved = userRepository.save(user);
    events.publish(new UserCreatedEvent(saved.getId(), saved.getEmail()));
    return saved;
}
// The Policy service consumes the event when it is ready.
// OUTPUT:
//   - createUser succeeds even if the Policy service is down
//   - the message is redelivered when it comes back
//   - the trade is eventual consistency: for a short window the
//     Policy service does not yet know the user exists`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>How do microservices communicate?</td><td>Synchronously over HTTP with WebClient, RestClient, RestTemplate or Feign, or asynchronously through a broker such as Kafka or RabbitMQ.</td></tr>
<tr><td>Which dependency provides WebClient?</td><td><code>spring-boot-starter-webflux</code>. Adding it beside spring-boot-starter-web does not make the app reactive.</td></tr>
<tr><td>Why must you declare a WebClient bean?</td><td>Spring Boot auto-configures only <code>WebClient.Builder</code>. Injecting <code>WebClient</code> without a bean fails with NoSuchBeanDefinitionException.</td></tr>
<tr><td>What does <code>.block()</code> do, and when is it wrong?</td><td>Waits for the Mono and returns the value. Fine on the servlet stack; on a reactive stack it stalls an event-loop thread and Reactor throws.</td></tr>
<tr><td>Why not hard-code the other service's URL?</td><td>It breaks when the host or port changes and cannot load-balance across instances. Externalise it, or resolve it by service name through discovery.</td></tr>
<tr><td>What does @LoadBalanced do?</td><td>Lets the client resolve <code>http://SERVICE-NAME/...</code> via the registry and round-robin across the instances.</td></tr>
<tr><td>What is the danger of a call with no timeout?</td><td>A hung callee parks the calling thread. Under load every worker ends up blocked and the caller stops serving all requests - a cascading failure.</td></tr>
<tr><td>What does a circuit breaker add on top of a timeout?</td><td>After enough failures it stops attempting the call at all, failing in microseconds and leaving the thread pool free.</td></tr>
<tr><td>Which calls are safe to retry?</td><td>Idempotent ones - GET, PUT, DELETE. Retrying a POST can duplicate the effect.</td></tr>
<tr><td>How do you call three services without adding up their latency?</td><td>Issue them concurrently and combine with <code>Mono.zip</code>, so the cost is the slowest call rather than the sum.</td></tr>
<tr><td>Why define a local PolicyDto instead of sharing the Policy class?</td><td>A shared class couples the services at compile time, so they can no longer be released independently.</td></tr>
<tr><td>WebClient vs RestClient?</td><td>Both have the same fluent API; RestClient (Spring 6.1+) is synchronous and needs no webflux dependency, which suits a servlet application.</td></tr>
<tr><td>Why do synchronous chains reduce availability?</td><td>Availability multiplies: four services at 99.9% compose to 99.6%. Events break that coupling at the cost of eventual consistency.</td></tr>
</table>`
        }
    ]
};
