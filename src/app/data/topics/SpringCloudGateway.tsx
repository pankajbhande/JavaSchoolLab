import { Topic } from '../coreJava';

export const springCloudGateway: Topic = {
    id: 'spring-cloud-gateway',
    name: 'API Gateway with Spring Cloud Gateway',
    beginner: [
        {
            content: `<h3>The Problem: Clients Talking to Twenty Services</h3>
Once an application is split into services, every one of them has its own host and port. Without a gateway, the browser or mobile app has to know all of them.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">WITHOUT A GATEWAY

   +-----------+
   |  Browser  |----- http://user-svc:8282/users/1 ------> [ User    :8282 ]
   |           |----- http://policy-svc:8181/policies/1 -> [ Policy  :8181 ]
   |           |----- http://claim-svc:8383/claims/1 ----> [ Claim   :8383 ]
   |           |----- http://pay-svc:8484/payments/1 ----> [ Payment :8484 ]
   +-----------+

   The client knows every address.
   Every service implements its own auth, CORS and rate limiting.
   Every service is exposed to the public internet.</pre>
<br>
Three separate problems come out of that picture:<br><br>

<table>
<tr><th>Problem</th><th>Why it hurts</th></tr>
<tr><td>The client knows every address</td><td>Moving, renaming or splitting a service breaks every deployed mobile app.</td></tr>
<tr><td><strong>Cross-cutting concerns</strong> are duplicated</td><td>Authentication, CORS, rate limiting and request logging get written four times, four slightly different ways - and the weakest copy is the one an attacker uses.</td></tr>
<tr><td>Everything is publicly reachable</td><td>An internal-only service is one firewall mistake away from being on the internet.</td></tr>
</table>
<br>
An <strong>API gateway</strong> is one service that sits in front of the others. The client talks only to it; it decides which service each request belongs to.<br>`
        },
        {
            content: `<h3>With a Gateway</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">WITH A GATEWAY

   +-----------+          +--------------------------+
   |  Browser  |--------->|   SPRING CLOUD GATEWAY   |
   +-----------+   one    |        port 9090         |
                  address |                          |
                          |  authenticate            |
                          |  rate limit              |
                          |  CORS                    |
                          |  log / trace             |
                          |  route by path           |
                          +--------------------------+
                             |      |      |      |
              /users/**  ----+      |      |      +---- /payments/**
                                    |      |
                        /policies/**+      +/claims/**
                             |      |      |      |
                             v      v      v      v
                       [ User ] [Policy] [Claim] [Payment]
                        :8282    :8181    :8383    :8484
                          (not exposed to the internet)</pre>
<br>
<table>
<tr><th>Gateway responsibility</th><th>What it means</th></tr>
<tr><td><strong>Routing</strong></td><td>Match an incoming request and forward it to the right service.</td></tr>
<tr><td><strong>Predicates</strong></td><td>The conditions that decide whether a route matches - path, method, header, host, time.</td></tr>
<tr><td><strong>Filters</strong></td><td>Code that runs before or after forwarding - add a header, strip a path prefix, check a token, count requests.</td></tr>
<tr><td>Single entry point</td><td>One TLS certificate, one public address, one place to apply security policy.</td></tr>
<tr><td>Protocol and shape adaptation</td><td>The public API does not have to mirror the internal service layout.</td></tr>
</table>`
        },
        {
            content: `<h3>Creating the Gateway Project</h3>
The gateway is its own Spring Boot application - a separate project, exactly like the Eureka server was.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project<br>
2. Add <code>spring-cloud-starter-gateway</code> (and the Spring Cloud BOM)<br>
3. Define routes in application.yml<br>
4. Run it<br>
5. Call the gateway instead of the service
</div><br>

There is one dependency rule that matters more than any other here, and it catches everyone once: <strong>do not add <code>spring-boot-starter-web</code></strong>. The gateway runs on WebFlux and Netty, and the two starters cannot coexist.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>

<!-- The Spring Cloud BOM, as for every Spring Cloud project -->
<properties>
    <spring-cloud.version>2023.0.3</spring-cloud.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>\${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- DO NOT ALSO ADD spring-boot-starter-web.
     Startup fails immediately with:

     ***************************
     APPLICATION FAILED TO START
     ***************************
     Description:
     Spring MVC found on classpath, which is incompatible with
     Spring Cloud Gateway.
     Action:
     Please remove spring-boot-starter-web dependency.        -->`,
                `// The main class - nothing special about it
package com.velocity.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
// CONSOLE on startup - note Netty, not Tomcat:
// Netty started on port 9090
// Started ApiGatewayApplication in 2.1 seconds`
            ]
        },
        {
            content: `<h3>Step 3 - Routes in YAML</h3>
A route has four parts: an <code>id</code>, a <code>uri</code> to forward to, a list of <strong>predicates</strong> that decide whether it matches, and an optional list of <strong>filters</strong> that modify the request or response.<br><br>

YAML is the usual format here because the route list is deeply nested; the same thing in <code>.properties</code> is unreadable.<br><br>

<table>
<tr><th>Route element</th><th>Purpose</th></tr>
<tr><td><code>id</code></td><td>A unique name. Appears in logs and metrics.</td></tr>
<tr><td><code>uri</code></td><td>Where to forward: <code>http://host:port</code>, or <code>lb://SERVICE-NAME</code> to resolve through discovery.</td></tr>
<tr><td><code>predicates</code></td><td>All must match for the route to be chosen. Routes are evaluated in order.</td></tr>
<tr><td><code>filters</code></td><td>Applied to this route only, in the order written.</td></tr>
</table>`,
            codeExamples: [
                `# Step 3 - application.yml
server:
  port: 9090

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:

        - id: user-service
          uri: http://localhost:8282
          predicates:
            - Path=/users/**

        - id: policy-service
          uri: http://localhost:8181
          predicates:
            - Path=/policies/**

        - id: claim-service
          uri: http://localhost:8383
          predicates:
            - Path=/claims/**

# GET http://localhost:9090/users/1
#   -> forwarded to http://localhost:8282/users/1
# GET http://localhost:9090/policies/1
#   -> forwarded to http://localhost:8181/policies/1
#
# The path is passed through UNCHANGED by default. If the downstream
# service expects /getPolicy/1 rather than /policies/1, you need a
# rewrite filter - see below.`,
                `# The common predicates
spring:
  cloud:
    gateway:
      routes:
        - id: examples
          uri: http://localhost:8181
          predicates:
            - Path=/policies/{id}              # path, with a variable
            - Method=GET,POST                  # HTTP method
            - Header=X-Tenant, acme-.*         # header name + regex
            - Query=version, v2                # query parameter
            - Host=**.example.com              # Host header
            - Cookie=session, [A-Za-z0-9]+     # cookie name + regex
            - After=2026-01-01T00:00:00+00:00[Asia/Kolkata]
            - RemoteAddr=192.168.1.0/24        # client CIDR

# ALL predicates on a route must match. To express OR, write two
# routes with the same uri.
#
# Routes are matched in DECLARATION ORDER, and the first match wins.
# A route with Path=/** placed first will swallow everything below it -
# this is the most common "my route is being ignored" cause.`,
                `# Filters - the everyday ones
spring:
  cloud:
    gateway:
      routes:
        - id: policy-service
          uri: http://localhost:8181
          predicates:
            - Path=/api/policies/**
          filters:
            - StripPrefix=2                    # /api/policies/1 -> /1
            - AddRequestHeader=X-Source, gateway
            - AddResponseHeader=X-Gateway, api-gateway
            - RewritePath=/api/policies/(?<id>.*), /getPolicy/\${id}

      # Filters applied to EVERY route
      default-filters:
        - AddResponseHeader=X-Powered-By, velocity-gateway
        - DedupeResponseHeader=Access-Control-Allow-Origin

# Note the \${id} inside RewritePath is a regex group reference read by
# the gateway, NOT a Spring property placeholder. In a .properties file
# it must be escaped as $\\{id} or Spring tries to resolve a property
# called "id" and fails at startup.`
            ]
        },
        {
            content: `<h3>Steps 4 and 5 - Running It</h3>
Start the downstream services first, then the gateway. Everything is then called through port 9090.<br>`,
            codeExamples: [
                `// The downstream services are unchanged. They do not know a
// gateway exists.

// BEFORE - the client had to know each service:
//   GET http://localhost:8282/users/1
//   GET http://localhost:8181/policies/1

// AFTER - one address:
//   GET http://localhost:9090/users/1
//   GET http://localhost:9090/policies/1

// RESPONSE (200 OK) from http://localhost:9090/policies/1
{
    "id": 1,
    "name": "Term Plan",
    "status": "active"
}
// Response headers now include the gateway's own additions:
//   X-Powered-By: velocity-gateway`,
                `# Turn on route logging while you are learning - it is the fastest
# way to see WHY a request matched or did not match.
logging:
  level:
    org.springframework.cloud.gateway: DEBUG
    reactor.netty.http.client: DEBUG

# CONSOLE:
# Route matched: policy-service
# Mapping [Exchange: GET http://localhost:9090/policies/1]
#     to Route{id='policy-service',
#              uri=http://localhost:8181,
#              order=0,
#              predicate=Paths: [/policies/**], match trailing slash: true}

# When NOTHING matches, the gateway returns 404 with an empty body and
# logs nothing by default - which is why this logger is worth enabling.`
            ]
        },
        {
            content: `<h3>The Java RouteLocator DSL</h3>
The same routes can be built in Java instead of YAML. Use it when a route needs logic YAML cannot express - a value computed at startup, a conditional route, or a custom filter you wrote yourself.<br><br>

<table>
<tr><th>YAML</th><th>Java DSL</th></tr>
<tr><td>Changeable without recompiling; refreshable from a Config Server</td><td>Fixed at build time</td></tr>
<tr><td>Readable by people who are not Java developers</td><td>Type-checked, and IDE-completable</td></tr>
<tr><td>The default for ordinary path routing</td><td>The choice when filters need real code</td></tr>
</table>
<br>
The two can be mixed - routes from both sources are merged.<br>`,
            codeExamples: [
                `package com.velocity.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutes {

    @Bean
    public RouteLocator routes(RouteLocatorBuilder builder) {

        return builder.routes()

            .route("user-service", r -> r
                .path("/users/**")
                .uri("http://localhost:8282"))

            .route("policy-service", r -> r
                .path("/api/policies/**")
                .and().method("GET")
                .filters(f -> f
                    .stripPrefix(2)
                    .addRequestHeader("X-Source", "gateway")
                    .addResponseHeader("X-Gateway", "api-gateway"))
                .uri("http://localhost:8181"))

            // A predicate that YAML cannot express as neatly
            .route("beta-users", r -> r
                .path("/users/**")
                .and().header("X-Beta", "true")
                .uri("http://localhost:8290"))

            .build();
    }
}
// Order matters here too: "beta-users" is declared AFTER
// "user-service", which already matches /users/**, so it will never
// be reached. Declare the more specific route FIRST.`
            ]
        },
        {
            content: `<h3>Integrating With Eureka - <code>lb://</code> Routing</h3>
<code>uri: http://localhost:8181</code> has the same problem hard-coded URLs always have: one fixed instance, on one machine. Adding the Eureka client to the gateway lets a route name a <em>service</em> instead of an address.<br><br>

<table>
<tr><th>Scheme</th><th>Meaning</th></tr>
<tr><td><code>http://localhost:8181</code></td><td>Exactly this host and port. No load balancing.</td></tr>
<tr><td><code>lb://POLICYSERVICE</code></td><td>Resolve the name through discovery and load-balance across every UP instance.</td></tr>
<tr><td><code>forward:/fallback</code></td><td>Handle it inside the gateway itself, rather than forwarding.</td></tr>
</table>
<br>
<strong>The <code>lb</code> scheme requires Spring Cloud LoadBalancer on the classpath</strong> - the Eureka client starter brings it in. Without it, the request fails with <code>UnsupportedOperationException</code> or a 503.<br>`,
            codeExamples: [
                `<!-- Add discovery to the gateway -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
<!-- This also brings spring-cloud-starter-loadbalancer, which is
     what makes lb:// work. -->`,
                `# application.yml - routes by service name
server:
  port: 9090

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://USERSERVICE            # spring.application.name
          predicates:
            - Path=/users/**

        - id: policy-service
          uri: lb://POLICYSERVICE
          predicates:
            - Path=/policies/**

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/

# The gateway is itself a Eureka client - it registers, and it fetches
# the registry so it can resolve lb:// names.
#
# Start a second Policy instance on 8182 and the gateway begins
# alternating between them with no configuration change at all.`,
                `# Automatic routes from the registry - no route list at all
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true

# Every registered service instantly gets a route:
#   http://localhost:9090/policyservice/getPolicy/1
#          -> POLICYSERVICE /getPolicy/1
#
# Convenient in development. Avoid it in production: it publishes
# EVERY registered service - including internal-only ones - on the
# public gateway, and the URL structure is dictated by internal
# service names you may later want to change.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Gateway Is Reactive, and That Governs Everything</h3>
Spring Cloud Gateway is built on <strong>Spring WebFlux</strong> running on <strong>Netty</strong>. It does not use Tomcat, it does not use a thread per request, and it is not a servlet application. Two consequences follow, and both bite in practice.<br><br>

<strong>1. It cannot be mixed with <code>spring-boot-starter-web</code>.</strong> This is not a warning; the application refuses to start.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">***************************
APPLICATION FAILED TO START
***************************

Description:

Spring MVC found on classpath, which is incompatible with Spring
Cloud Gateway.

Action:

Please set spring.main.web-application-type=reactive or remove
spring-boot-starter-web dependency.</pre>
<br>
The suggested <code>web-application-type=reactive</code> makes it boot, but it is the wrong fix: Spring MVC is still on the classpath, and anything that auto-configures for MVC will misbehave. <strong>Remove the dependency.</strong> It usually arrives transitively - <code>mvn dependency:tree</code> finds who pulled it in.<br><br>

<strong>2. Blocking code in a filter destroys throughput.</strong> Netty serves all traffic on a small event loop - typically one thread per CPU core. A blocking call on one of those threads stalls every other connection that thread is multiplexing.<br>`,
            codeExamples: [
                `// WRONG - a JDBC lookup inside a gateway filter
@Component
public class TenantFilter implements GlobalFilter {

    @Autowired private JdbcTemplate jdbc;      // blocking by nature

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String key = exchange.getRequest().getHeaders().getFirst("X-Api-Key");

        // This blocks an event-loop thread for the duration of a DB query.
        String tenant = jdbc.queryForObject(
                "select tenant from api_key where key = ?", String.class, key);

        exchange.getRequest().mutate().header("X-Tenant", tenant).build();
        return chain.filter(exchange);
    }
}
// SYMPTOM: throughput collapses under load. With 8 event-loop threads
// and a 20ms query, the gateway caps at roughly 400 requests/second
// no matter how much hardware you give it - and every unrelated
// request queues behind those blocked threads.`,
                `// RIGHT - either use a reactive client...
@Override
public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

    String key = exchange.getRequest().getHeaders().getFirst("X-Api-Key");

    return reactiveRedis.opsForValue().get("apikey:" + key)     // non-blocking
            .switchIfEmpty(Mono.error(new UnauthorizedException()))
            .flatMap(tenant -> chain.filter(
                    exchange.mutate()
                            .request(r -> r.header("X-Tenant", tenant))
                            .build()));
}

// ...or, if the call genuinely must block, push it onto a bounded
// elastic scheduler so the event loop stays free:
return Mono.fromCallable(() -> jdbc.queryForObject(sql, String.class, key))
        .subscribeOn(Schedulers.boundedElastic())
        .flatMap(tenant -> chain.filter(exchange));

// BlockHound will fail the test if you get this wrong:
//   reactor.blockhound.BlockingOperationError: Blocking call!
//   java.net.SocketInputStream#socketRead0`
            ]
        },
        {
            content: `<h3>Global Filters, Route Filters, and Order</h3>
Two kinds of filter exist, and the difference is scope.<br><br>

<table>
<tr><th>Kind</th><th>Scope</th><th>How it is written</th></tr>
<tr><td><strong>GlobalFilter</strong></td><td>Every route, always</td><td>A <code>@Bean</code> implementing <code>GlobalFilter</code></td></tr>
<tr><td><strong>GatewayFilter</strong></td><td>The route it is attached to</td><td>Named in the route's <code>filters:</code> list, or produced by a <code>GatewayFilterFactory</code></td></tr>
<tr><td><code>default-filters</code></td><td>Every route, but expressed as route filters</td><td>YAML - useful when a route filter should apply everywhere</td></tr>
</table>
<br>
Filters are not "before" handlers. Each filter wraps the rest of the chain, so code before <code>chain.filter(exchange)</code> runs on the way in and code appended to the returned <code>Mono</code> runs on the way out - in <em>reverse</em> order.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">REQUEST                                              RESPONSE

  |  filter A  (order -100)  pre                          ^
  v                                                       |  A post
  |  filter B  (order 0)     pre                          ^
  v                                                       |  B post
  |  filter C  (order 1000)  pre                          ^
  v                                                       |  C post
  +------------> NettyRoutingFilter (order MAX) ----------+
                 the actual call downstream

Lower order value = earlier on the request, LATER on the response.</pre>
<br>
<table>
<tr><th>Ordering rule</th><th>Detail</th></tr>
<tr><td>Implement <code>Ordered</code>, or annotate <code>@Order</code></td><td>The only reliable way to place a GlobalFilter. Bean declaration order is not a contract.</td></tr>
<tr><td>Route filters run in written order</td><td>Within a route's <code>filters:</code> list, top to bottom.</td></tr>
<tr><td>Authentication must run early</td><td>Before rate limiting keyed on user identity, and before anything that logs the body.</td></tr>
<tr><td>You cannot change response headers after the body is committed</td><td>Netty streams the response; mutate headers in <code>beforeCommit</code>, not in <code>then(...)</code>.</td></tr>
</table>`,
            codeExamples: [
                `// A GlobalFilter with explicit order - request logging and timing
@Component
public class LoggingGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger log =
            LoggerFactory.getLogger(LoggingGlobalFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        long start = System.currentTimeMillis();
        ServerHttpRequest request = exchange.getRequest();

        // --- PRE: on the way in
        log.info("--> {} {}", request.getMethod(), request.getURI().getPath());

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            // --- POST: on the way out
            long ms = System.currentTimeMillis() - start;
            log.info("<-- {} {} ({} ms)",
                    request.getURI().getPath(),
                    exchange.getResponse().getStatusCode(), ms);
        }));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;   // first in, last out
    }
}
// CONSOLE:
// --> GET /policies/1
// <-- /policies/1 200 OK (14 ms)`,
                `// A custom route filter, usable from YAML by name
@Component
public class ApiKeyGatewayFilterFactory
        extends AbstractGatewayFilterFactory<ApiKeyGatewayFilterFactory.Config> {

    public static class Config {
        private String headerName = "X-Api-Key";
        // getter and setter
    }

    public ApiKeyGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String key = exchange.getRequest()
                    .getHeaders().getFirst(config.getHeaderName());

            if (key == null || key.isBlank()) {
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();   // short-circuit
            }
            return chain.filter(exchange);
        };
    }
}
// The class name MUST end in "GatewayFilterFactory". The YAML name is
// the class name with that suffix removed:
//
//   filters:
//     - ApiKey=X-Api-Key
//
// Get the suffix wrong and startup fails with
//   Unable to find GatewayFilterFactory with name ApiKey`,
                `// Modifying the response correctly - beforeCommit, not then()
return chain.filter(exchange).then(Mono.defer(() -> {
    // TOO LATE: headers are already flushed to the client
    exchange.getResponse().getHeaders().add("X-Trace-Id", traceId);
    return Mono.empty();
}));

// CORRECT:
exchange.getResponse().beforeCommit(() -> {
    exchange.getResponse().getHeaders().add("X-Trace-Id", traceId);
    return Mono.empty();
});
return chain.filter(exchange);

// The first version fails silently in development (small responses
// buffer) and intermittently in production (large ones do not) -
// which is exactly the kind of bug that costs a day.`
            ]
        },
        {
            content: `<h3>Security at the Edge - and Why It Must Not Be the Only Check</h3>
Validating a JWT once at the gateway is attractive: one place to configure, one place to rotate keys, and downstream services stay simple. It is also the design that produces the classic breach.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">THE TRUSTING-GATEWAY DESIGN

   internet --> [ GATEWAY ]  validates JWT
                    |        adds  X-User-Id: 42
                    v
              [ Policy service ]  trusts X-User-Id blindly


THE PROBLEM - anything already inside the network skips the gateway:

   compromised pod ------------------------> [ Policy service ]
   curl -H "X-User-Id: 1" policy-svc:8181/policies/all
                                             ...and is served.

   Also skips it: a misconfigured Kubernetes Service, a debug port
   left open, a developer's port-forward, an SSRF in any other
   service, and the service's own actuator endpoints.</pre>
<br>
<strong>The gateway is a coarse first filter, not the security boundary.</strong> The principle is <strong>defence in depth</strong>: the edge does what only the edge can do, and each service still enforces what only it knows.<br><br>

<table>
<tr><th>Belongs at the gateway</th><th>Belongs in each service</th></tr>
<tr><td>Rejecting requests with no token at all</td><td>Re-validating the token signature and expiry</td></tr>
<tr><td>Coarse rate limiting and IP blocking</td><td>Authorisation: may <em>this</em> user read <em>this</em> policy?</td></tr>
<tr><td>TLS termination, CORS, request size limits</td><td>Ownership checks against its own data</td></tr>
<tr><td>Attaching a correlation id</td><td>Audit logging of what was actually accessed</td></tr>
</table>
<br>
The cost of re-validating a JWT in each service is a signature check against a cached JWKS - microseconds. That is a very cheap insurance premium.<br><br>

<strong>Also strip inbound copies of your own trusted headers.</strong> If the gateway sets <code>X-User-Id</code>, it must first remove any <code>X-User-Id</code> the client sent, or a client can simply supply its own.<br>`,
            codeExamples: [
                `# Gateway as an OAuth2 resource server
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.example.com/realms/velocity
# Note: on the gateway this configures the REACTIVE security filter
# chain. Copying a servlet SecurityFilterChain configuration from an
# MVC service will not apply - the types are
# ServerHttpSecurity / SecurityWebFilterChain, not HttpSecurity.`,
                `@Configuration
@EnableWebFluxSecurity                      // NOT @EnableWebSecurity
public class GatewaySecurityConfig {

    @Bean
    public SecurityWebFilterChain chain(ServerHttpSecurity http) {
        return http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)   // token auth, no cookies
            .authorizeExchange(ex -> ex
                .pathMatchers("/actuator/health/**").permitAll()
                .pathMatchers("/auth/**").permitAll()
                .pathMatchers(HttpMethod.GET, "/public/**").permitAll()
                .anyExchange().authenticated())
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
            .build();
    }
}`,
                `// Propagate identity - and strip any client-supplied copy first
@Component
public class IdentityPropagationFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        return ReactiveSecurityContextHolder.getContext()
            .map(ctx -> (JwtAuthenticationToken) ctx.getAuthentication())
            .map(auth -> exchange.mutate()
                .request(r -> r
                    // remove whatever the CLIENT sent under these names
                    .headers(h -> {
                        h.remove("X-User-Id");
                        h.remove("X-User-Roles");
                    })
                    // then set the values WE derived from the verified token
                    .header("X-User-Id", auth.getToken().getSubject())
                    .header("X-User-Roles",
                            String.join(",", auth.getToken()
                                    .getClaimAsStringList("roles"))))
                .build())
            .defaultIfEmpty(exchange)
            .flatMap(chain::filter);
    }

    @Override
    public int getOrder() { return -100; }   // after security, before routing
}
// Without the remove() calls, this header is a privilege-escalation
// vector: "X-User-Id: 1" from the client is passed straight through
// on any path the gateway lets past unauthenticated.`
            ]
        },
        {
            content: `<h3>Rate Limiting, and Why the Key Resolver Decides Everything</h3>
The built-in <code>RequestRateLimiter</code> filter uses <strong>Redis</strong> and a <strong>token bucket</strong> algorithm, executed as an atomic Lua script so several gateway instances share one counter.<br><br>

<table>
<tr><th>Parameter</th><th>Meaning</th></tr>
<tr><td><code>replenishRate</code></td><td>Tokens added per second - the sustained rate allowed.</td></tr>
<tr><td><code>burstCapacity</code></td><td>Bucket size - the largest instantaneous burst. Set equal to replenishRate to forbid bursts.</td></tr>
<tr><td><code>requestedTokens</code></td><td>Tokens one request costs. Charge an expensive endpoint more.</td></tr>
<tr><td><code>KeyResolver</code></td><td>What identifies "one caller". This is the decision that matters.</td></tr>
</table>
<br>
Redis is not an optional detail - the limit must be shared. With three gateway instances and a per-instance in-memory counter, a "100 per second" limit is really 300 per second, and the effective limit changes every time you scale.<br><br>

<strong>The key resolver is where rate limiting is usually got wrong:</strong><br><br>

<table>
<tr><th>Key</th><th>Consequence</th></tr>
<tr><td>Client IP</td><td>Everyone behind one corporate NAT or mobile carrier shares a bucket, so one office locks out a whole customer. Behind a load balancer, <code>getRemoteAddress()</code> returns the balancer's IP - one bucket for the entire internet - unless <code>X-Forwarded-For</code> is honoured, which a client can forge if it is not sanitised at the edge.</td></tr>
<tr><td>Authenticated user id</td><td>The fair choice for authenticated traffic - but it is null on login and signup, exactly the endpoints most worth protecting.</td></tr>
<tr><td>API key / tenant</td><td>Right for machine-to-machine traffic; lets you sell tiers.</td></tr>
<tr><td>A constant</td><td>One global bucket - a denial-of-service on yourself, since one abusive client starves everyone.</td></tr>
</table>
<br>
The practical answer is <strong>several limiters at different keys</strong>: a generous per-IP limit on unauthenticated paths, a tighter per-user limit once identity is known.<br>`,
            codeExamples: [
                `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis-reactive</artifactId>
</dependency>
<!-- REACTIVE Redis. The blocking starter would block the event loop
     and the RequestRateLimiter filter would not find its bean:
     "No qualifying bean of type ReactiveStringRedisTemplate" -->`,
                `spring:
  data:
    redis:
      host: localhost
      port: 6379
  cloud:
    gateway:
      routes:
        - id: policy-service
          uri: lb://POLICYSERVICE
          predicates:
            - Path=/policies/**
          filters:
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10      # 10 req/sec sustained
                redis-rate-limiter.burstCapacity: 20      # short bursts to 20
                redis-rate-limiter.requestedTokens: 1
                key-resolver: "#{@userKeyResolver}"       # SpEL bean reference

# RESPONSE when the bucket is empty:
#   HTTP/1.1 429 Too Many Requests
#   X-RateLimit-Remaining: 0
#   X-RateLimit-Burst-Capacity: 20
#   X-RateLimit-Replenish-Rate: 10
#
# If Redis is DOWN the filter denies every request - the gateway fails
# CLOSED. Decide deliberately whether that is what you want; for a
# public read API, failing open is often better than a total outage.`,
                `@Configuration
public class RateLimiterConfig {

    // Per authenticated user - falls back to IP for anonymous traffic
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> ReactiveSecurityContextHolder.getContext()
                .map(ctx -> ctx.getAuthentication().getName())
                .defaultIfEmpty(clientIp(exchange));
    }

    private String clientIp(ServerWebExchange exchange) {
        // Trust X-Forwarded-For ONLY if your load balancer overwrites it.
        // If it appends, a client can prepend a forged value and rotate
        // the key on every request, bypassing the limit entirely.
        String xff = exchange.getRequest().getHeaders().getFirst("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return Objects.requireNonNull(exchange.getRequest().getRemoteAddress())
                      .getAddress().getHostAddress();
    }
}
// OUTPUT under a load test at 50 req/s with replenishRate 10:
//   ~10 requests/second return 200
//   the rest return 429 Too Many Requests
//   and the downstream service sees only the 10 - which is the point:
//   the limit protects the SERVICE, not the gateway.`
            ]
        },
        {
            content: `<h3>CORS at the Edge</h3>
With a gateway there is exactly one origin the browser talks to, so CORS is configured once - at the gateway - and removed from every downstream service.<br><br>

Leaving <code>@CrossOrigin</code> in the services as well is the usual cause of the duplicate-header failure:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">The 'Access-Control-Allow-Origin' header contains multiple values
'https://app.example.com, https://app.example.com', but only one
is allowed.</pre>
<br>
Both the gateway and the service added the header, and the browser rejects the response. Either strip it downstream with <code>DedupeResponseHeader</code>, or - better - delete the CORS configuration from the services.<br><br>

<table>
<tr><th>Setting</th><th>Guidance</th></tr>
<tr><td><code>allowedOrigins</code></td><td>List them explicitly. <code>"*"</code> on a credentialed API is a real vulnerability, and the browser rejects it outright with <code>allowCredentials: true</code>.</td></tr>
<tr><td><code>allowedOriginPatterns</code></td><td>Use for wildcard subdomains (<code>https://*.example.com</code>) where a literal list is impractical.</td></tr>
<tr><td><code>allowCredentials</code></td><td>Only if the browser sends cookies. A bearer token in a header does not need it.</td></tr>
<tr><td><code>maxAge</code></td><td>Cache the preflight. Without it, every non-simple request costs an extra OPTIONS round trip.</td></tr>
<tr><td>Preflight and security</td><td>The <code>OPTIONS</code> preflight carries no credentials - so an authenticated gateway must permit it, or every cross-origin call fails before it starts.</td></tr>
</table>`,
            codeExamples: [
                `# Global CORS at the gateway
spring:
  cloud:
    gateway:
      globalcors:
        add-to-simple-url-handler-mapping: true   # needed for OPTIONS preflight
        cors-configurations:
          '[/**]':
            allowedOrigins:
              - https://app.example.com
              - https://admin.example.com
            allowedMethods: [GET, POST, PUT, DELETE, OPTIONS]
            allowedHeaders: [Authorization, Content-Type, X-Request-Id]
            exposedHeaders: [X-Request-Id, X-RateLimit-Remaining]
            allowCredentials: true
            maxAge: 3600

      default-filters:
        # Drop any duplicate the downstream service adds
        - DedupeResponseHeader=Access-Control-Allow-Origin Access-Control-Allow-Credentials, RETAIN_FIRST

# add-to-simple-url-handler-mapping is easy to miss. Without it the
# preflight OPTIONS request is routed downstream instead of being
# answered by the gateway, and the browser reports a CORS failure that
# looks like the origin list is wrong when it is not.`,
                `// With Spring Security on the gateway, CORS must also be enabled
// on the security filter chain, or the preflight is rejected as
// unauthenticated BEFORE the CORS handler ever sees it.
@Bean
public SecurityWebFilterChain chain(ServerHttpSecurity http) {
    return http
        .cors(Customizer.withDefaults())        // picks up globalcors
        .authorizeExchange(ex -> ex
            .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .anyExchange().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
        .build();
}
// SYMPTOM without this: the browser console shows
//   Response to preflight request doesn't pass access control check:
//   No 'Access-Control-Allow-Origin' header is present
// while curl against the same URL works perfectly - because curl
// does not send a preflight.`
            ]
        },
        {
            content: `<h3>Resilience at the Gateway, and Netflix Zuul</h3>
The gateway is a single point through which everything passes, which makes it both the best place to apply a circuit breaker and the worst place to have one misconfigured.<br><br>

The <code>CircuitBreaker</code> filter wraps a route in Resilience4j and can forward to a fallback route inside the gateway when the breaker is open.<br><br>

<table>
<tr><th>Gateway-level protection</th><th>Effect</th></tr>
<tr><td><code>CircuitBreaker</code> filter</td><td>Stops forwarding to a failing service; serves a fallback instead of a 504.</td></tr>
<tr><td><code>Retry</code> filter</td><td>Retries on chosen statuses and methods. Restrict it to idempotent methods.</td></tr>
<tr><td><code>RequestSize</code> filter</td><td>Rejects oversized bodies at the edge with 413, before they reach a service.</td></tr>
<tr><td>Response timeout</td><td>Per route or global; without it a hung service holds gateway connections open.</td></tr>
</table>
<br>
<strong>A breaker at the gateway is coarse:</strong> it opens for a whole route, so one broken endpoint can trip every endpoint of that service. Per-dependency breakers inside each service are finer-grained. Use both - the gateway breaker exists to stop the gateway itself becoming the bottleneck.<br><br>

<h3>Zuul</h3>
<strong>Netflix Zuul 1 is dead</strong> and Spring Cloud Gateway replaced it. Worth knowing why, because it is a standard interview question.<br><br>

<table>
<tr><th>Zuul 1</th><th>Spring Cloud Gateway</th></tr>
<tr><td>Blocking, servlet, thread-per-request</td><td>Non-blocking, WebFlux on Netty</td></tr>
<tr><td>A slow backend exhausts the thread pool</td><td>Slow backends hold a connection, not a thread</td></tr>
<tr><td>No first-class WebSocket support</td><td>WebSocket and Server-Sent Events supported</td></tr>
<tr><td>Netflix OSS, in maintenance; removed from Spring Cloud</td><td>Actively developed by the Spring team</td></tr>
<tr><td><code>@EnableZuulProxy</code>, <code>zuul.routes.*</code></td><td><code>spring.cloud.gateway.routes</code>, predicates and filters</td></tr>
</table>
<br>
Zuul 2 was rewritten to be non-blocking, but arrived after Spring had already built Gateway; Spring Cloud never adopted it. If you meet <code>@EnableZuulProxy</code> in an existing codebase, it is a migration target.<br>`,
            codeExamples: [
                `<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>
<!-- REACTOR variant. The plain
     spring-cloud-starter-circuitbreaker-resilience4j is the blocking
     one and is the wrong dependency for the gateway. -->`,
                `spring:
  cloud:
    gateway:
      httpclient:
        connect-timeout: 2000            # milliseconds
        response-timeout: 5s
      routes:
        - id: policy-service
          uri: lb://POLICYSERVICE
          predicates:
            - Path=/policies/**
          filters:
            - name: CircuitBreaker
              args:
                name: policyBreaker
                fallbackUri: forward:/fallback/policies
            - name: Retry
              args:
                retries: 2
                methods: GET                       # idempotent only
                statuses: BAD_GATEWAY,SERVICE_UNAVAILABLE
                backoff:
                  firstBackoff: 100ms
                  maxBackoff: 1s
                  factor: 2
                  basedOnPreviousValue: false
            - name: RequestSize
              args:
                maxSize: 1MB

resilience4j:
  circuitbreaker:
    instances:
      policyBreaker:
        sliding-window-size: 20
        failure-rate-threshold: 50
        wait-duration-in-open-state: 20s
  timelimiter:
    instances:
      policyBreaker:
        timeout-duration: 4s
# The TimeLimiter must be SHORTER than httpclient.response-timeout,
# or the breaker never sees a timeout - the HTTP client fails first
# and the breaker records a different error than you configured for.`,
                `// The fallback lives inside the gateway. Because the gateway has no
// spring-boot-starter-web, this is a reactive @RestController - the
// annotations are the same, the return types are not.
@RestController
public class FallbackController {

    @GetMapping("/fallback/policies")
    public Mono<ResponseEntity<Map<String, Object>>> policyFallback() {
        return Mono.just(ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .header("Retry-After", "20")
                .body(Map.of(
                        "error", "policy service unavailable",
                        "retryAfterSeconds", 20)));
    }
}
// RESPONSE while the breaker is OPEN:
// HTTP/1.1 503 Service Unavailable
// Retry-After: 20
// { "error": "policy service unavailable", "retryAfterSeconds": 20 }
//
// Returned in well under a millisecond - no downstream connection is
// attempted at all, which is exactly what protects the gateway's
// connection pool.`
            ]
        },
        {
            content: `<h3>Operating a Gateway</h3>
Everything now depends on one application, so it needs more care than the services behind it.<br><br>

<table>
<tr><th>Concern</th><th>What to do</th></tr>
<tr><td>It is a single point of failure</td><td>Run at least two instances behind a load balancer. The gateway is stateless, so this is straightforward - keep it that way by putting rate-limit state in Redis, not memory.</td></tr>
<tr><td>Business logic creeps in</td><td>Resist it. A gateway that transforms payloads and calls three services becomes a distributed monolith's control centre and must be redeployed for every change.</td></tr>
<tr><td>Route configuration drift</td><td>Back it with a Config Server and refresh with <code>POST /actuator/gateway/refresh</code> rather than restarting.</td></tr>
<tr><td>Debugging routes</td><td><code>GET /actuator/gateway/routes</code> returns the resolved route table - the fastest way to see what the gateway actually believes.</td></tr>
<tr><td>Header size and hop count</td><td>Each hop adds headers. Netty's default 8KB header limit is reachable with a large JWT plus tracing headers; the symptom is a bare 431 or a truncated request.</td></tr>
<tr><td>Observability</td><td>Generate the correlation id here if the client did not send one; every downstream log line should carry it.</td></tr>
</table>`,
            codeExamples: [
                `management:
  endpoints:
    web:
      exposure:
        include: health,info,gateway,metrics,prometheus
  endpoint:
    gateway:
      access: unrestricted        # Boot 3.4+; was "enabled: true" before

# GET /actuator/gateway/routes
[
  {
    "route_id": "policy-service",
    "uri": "lb://POLICYSERVICE",
    "order": 0,
    "predicate": "Paths: [/policies/**], match trailing slash: true",
    "filters": [
      "[[CircuitBreaker name = 'policyBreaker', fallback = '/fallback/policies']]",
      "[[StripPrefix parts = 1]]"
    ]
  }
]

# POST /actuator/gateway/refresh
# Reloads routes from the current configuration without a restart.
#
# These endpoints expose your entire internal topology. Never expose
# the actuator port publicly - bind it to a separate management port
# and firewall it.`,
                `// Correlation id: create one at the edge if the client did not send it
@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final String HEADER = "X-Request-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String id = exchange.getRequest().getHeaders().getFirst(HEADER);
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        String correlationId = id;

        exchange.getResponse().beforeCommit(() -> {
            exchange.getResponse().getHeaders().add(HEADER, correlationId);
            return Mono.empty();
        });

        return chain.filter(exchange.mutate()
                .request(r -> r.header(HEADER, correlationId))
                .build());
    }

    @Override
    public int getOrder() { return Ordered.HIGHEST_PRECEDENCE + 1; }
}
// Every downstream service logs the same id, so one grep across the
// aggregated logs reconstructs the whole request. Note that MDC does
// NOT propagate across reactive operators the way it does on the
// servlet stack - use Micrometer's context propagation rather than
// MDC.put() here.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is an API gateway and why use one?</td><td>A single entry point in front of the services. It gives clients one address, keeps internal services off the public network, and puts cross-cutting concerns - auth, CORS, rate limiting, logging - in one place instead of in every service.</td></tr>
<tr><td>What are the parts of a Gateway route?</td><td>An id, a uri to forward to, predicates that decide whether it matches, and filters that modify the request or response.</td></tr>
<tr><td>What is the difference between a predicate and a filter?</td><td>A predicate decides <em>whether</em> a route handles the request; a filter changes <em>what</em> is sent or returned.</td></tr>
<tr><td>Why can't spring-boot-starter-web be on the gateway's classpath?</td><td>Gateway is built on WebFlux and Netty. Spring MVC on the classpath fails startup with "Spring MVC found on classpath, which is incompatible with Spring Cloud Gateway". Remove the dependency rather than forcing web-application-type=reactive.</td></tr>
<tr><td>Why is blocking code in a filter a serious problem?</td><td>Netty serves all traffic on a few event-loop threads. Blocking one stalls every connection it multiplexes, capping throughput regardless of hardware. Use a reactive client, or offload to <code>Schedulers.boundedElastic()</code>.</td></tr>
<tr><td>Global filter versus route filter?</td><td>A GlobalFilter bean applies to every route; a GatewayFilter applies only to the route that names it. <code>default-filters</code> applies a route filter to all routes.</td></tr>
<tr><td>How is filter order determined?</td><td>By the <code>Ordered</code> interface or <code>@Order</code> for global filters, and by declaration order within a route. Lower order runs earlier on the request and later on the response, because each filter wraps the rest of the chain.</td></tr>
<tr><td>What does <code>lb://SERVICE-NAME</code> do?</td><td>Resolves the name through service discovery and load-balances across every UP instance, instead of pinning one host and port. It needs Spring Cloud LoadBalancer on the classpath.</td></tr>
<tr><td>Is authenticating at the gateway enough?</td><td>No. Anything already inside the network can call a service directly and bypass it. Each service must still validate the token and enforce its own authorisation - defence in depth.</td></tr>
<tr><td>What must you do with trusted headers the gateway sets?</td><td>Strip the client's copy first. If the gateway sets X-User-Id without removing an inbound one, a client can supply its own and impersonate any user.</td></tr>
<tr><td>Why does the rate limiter need Redis?</td><td>The limit must be shared across gateway instances. A per-instance in-memory counter multiplies the effective limit by the number of instances and changes whenever you scale.</td></tr>
<tr><td>Why does the KeyResolver choice matter?</td><td>Keying on IP puts everyone behind one NAT in a single bucket and returns the load balancer's address unless X-Forwarded-For is honoured and sanitised; keying on user id is null on login and signup. Usually you need both, at different limits.</td></tr>
<tr><td>Why configure CORS only at the gateway?</td><td>The browser talks to one origin. Leaving @CrossOrigin downstream too produces duplicate Access-Control-Allow-Origin headers, which the browser rejects.</td></tr>
<tr><td>What replaced Netflix Zuul, and why?</td><td>Spring Cloud Gateway. Zuul 1 was blocking and thread-per-request, so a slow backend exhausted its thread pool; Gateway is non-blocking on Netty, supports WebSockets, and is actively developed by the Spring team.</td></tr>
</table>`
        }
    ]
};
