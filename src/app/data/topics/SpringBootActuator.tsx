import { Topic } from '../coreJava';

export const springBootActuator: Topic = {
    id: 'spring-boot-actuator',
    name: 'Spring Boot - Actuator',
    beginner: [
        {
            content: `<h3>What is the Actuator?</h3>
The Actuator is used to <strong>manage and monitor</strong> all the information about a running application.<br><br>

<h3>Why do we use it?</h3>
Suppose you have a server in the UK, and that server runs one Spring Boot application:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        SERVER - UK
   +--------------------+
   |    APPLICATION     |   <--- deployed here, you are somewhere else
   +--------------------+</pre>
<br>
From where you sit, you want to know:<br><br>

<div class="border">
• How many beans has the application loaded?<br>
• What does the heap look like?<br>
• How many threads are running?<br>
• What are the URL mapping details?<br>
• Is the application healthy?<br>
</div><br>

You cannot open a debugger on a production machine in another country. The Actuator answers all of these over HTTP, in detail, with no code of your own.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project<br>
2. Add the Maven dependency to pom.xml<br>
3. Create the REST controller<br>
4. Run the application<br>
5. Check the console<br>
6. Go to a browser or Postman and enter the URL<br>
</div>`
        },
        {
            content: `<h3>Steps 1 and 2 - Project and Dependencies</h3>
<code>File -> New -> Spring Starter Project</code>, click Next, select the dependencies, then Next and Finish.<br><br>

Three dependencies are used here: the actuator itself, spring-web for the test endpoint, and devtools for automatic restarts during development.<br>`,
            codeExamples: [
                `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>`,
                `// Step 3 - the REST controller
package com.velocity.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ActuatorController {

    @GetMapping("/actuatorTest")
    public String getActuatorDemo() {
        return "Spring boot actuator test details";
    }
}`,
                `// Steps 4 and 5 - Run as -> Spring Boot App, then read the console
// OUTPUT:
// Tomcat started on port(s): 8080 (http) with context path ''
// Exposing 1 endpoint(s) beneath base path '/actuator'
// Started SpringBootActuatorDemoApplication in 2.4 seconds
//
// "Exposing 1 endpoint(s)" is the line that matters - see the note below.`
            ]
        },
        {
            content: `<h3>Step 6 - Hitting the Endpoints</h3>
Open a browser or Postman and enter the URL. Both work identically for GET endpoints.<br><br>

<strong>Note 1 - by default only the <code>/health</code> endpoint is exposed over HTTP.</strong> That is why the console said "Exposing 1 endpoint(s)".<br><br>

<table>
<tr><th>URL</th><th>Response</th></tr>
<tr><td>http://localhost:8080/actuatorTest</td><td>Spring boot actuator test details - your own endpoint</td></tr>
<tr><td>http://localhost:8080/actuator</td><td>A discovery document listing the exposed endpoints - only health, so far</td></tr>
<tr><td>http://localhost:8080/actuator/health</td><td><code>{"status":"UP"}</code></td></tr>
</table>`,
            codeExamples: [
                `// GET http://localhost:8080/actuator
// OUTPUT (default - one endpoint):
{
  "_links": {
    "self":   { "href": "http://localhost:8080/actuator", "templated": false },
    "health": { "href": "http://localhost:8080/actuator/health", "templated": false }
  }
}

// GET http://localhost:8080/actuator/health
// OUTPUT:
{ "status": "UP" }`
            ]
        },
        {
            content: `<h3>Note 2 - Exposing More Endpoints</h3>
Only one endpoint is available by default. To see URL mappings, the number of bean classes loaded and everything else, add one line to <code>application.properties</code>:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">management.endpoints.web.exposure.include=*</pre>
<br>
Restart the application. The console now reports a much larger endpoint count, and <code>/actuator</code> lists them all.<br><br>

<table>
<tr><th>Endpoint</th><th>What it shows</th></tr>
<tr><td>/actuator/health</td><td>Application health status - UP or DOWN.</td></tr>
<tr><td>/actuator/beans</td><td>Every bean the container loaded. Use it to check whether <code>ActuatorController</code> is really there.</td></tr>
<tr><td>/actuator/mappings</td><td>Every URL mapping - both your endpoints appear here.</td></tr>
<tr><td>/actuator/conditions</td><td>The auto-configuration report: which configurations matched, which did not, and why.</td></tr>
<tr><td>/actuator/env</td><td>The environment - server port and every other property.</td></tr>
<tr><td>/actuator/heapdump</td><td>Downloads a heap dump file automatically.</td></tr>
<tr><td>/actuator/metrics</td><td>JVM, CPU and HTTP metrics.</td></tr>
<tr><td>/actuator/loggers</td><td>Log levels, readable and changeable at runtime.</td></tr>
</table>`,
            codeExamples: [
                `# application.properties
management.endpoints.web.exposure.include=*

// Console after restart:
// Exposing 13 endpoint(s) beneath base path '/actuator'`,
                `// GET http://localhost:8080/actuator/beans
// OUTPUT (extract) - confirms the controller was loaded:
{
  "contexts": {
    "application": {
      "beans": {
        "actuatorController": {
          "scope": "singleton",
          "type": "com.velocity.controller.ActuatorController",
          "dependencies": []
        }
      }
    }
  }
}`,
                `// GET http://localhost:8080/actuator/mappings
// OUTPUT (extract) - both endpoint URLs are visible:
"/actuatorTest": {
   "handler": "com.velocity.controller.ActuatorController#getActuatorDemo()",
   "predicate": "{GET /actuatorTest}"
}

// GET http://localhost:8080/actuator/env
// OUTPUT (extract):
"server.port": { "value": "8080" },
"java.version": { "value": "1.8.0_301" }`
            ]
        },
        {
            content: `<h3>Excluding Endpoints</h3>
Include everything, then take back the ones you do not want. To exclude beans:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">management.endpoints.web.exposure.exclude=beans</pre>
<br>
Restart, and the console reports 12 endpoints instead of 13. Multiple endpoints can be excluded with a comma-separated list:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">management.endpoints.web.exposure.exclude=beans,metrics</pre>
<br>
Restart again - the console now shows 11 endpoints, and <code>/actuator</code> no longer lists <code>beans</code> or <code>metrics</code>. <strong>Exclude always wins over include.</strong><br><br>

<h3>The shutdown endpoint</h3>
<code>shutdown</code> is disabled by default - not merely unexposed, but switched off - because it stops the application. Enable it explicitly:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">management.endpoint.shutdown.enabled=true</pre>
<br>
Restart and check <code>/actuator</code> - <code>shutdown</code> is now listed. Note it accepts <strong>POST only</strong>, so a browser cannot trigger it; use Postman.<br>`,
            codeExamples: [
                `# application.properties - the full set used above
management.endpoints.web.exposure.include=*
management.endpoints.web.exposure.exclude=beans,metrics
management.endpoint.shutdown.enabled=true`,
                `// POST http://localhost:8080/actuator/shutdown
// OUTPUT:
{ "message": "Shutting down, bye..." }
// The application then stops. A GET to the same URL returns
// 405 Method Not Allowed.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Never Ship <code>include=*</code> to Production</h3>
<code>management.endpoints.web.exposure.include=*</code> is the right line for the tutorial and a serious mistake on a public port. Consider what it publishes to anyone who can reach the application:<br><br>

<table>
<tr><th>Endpoint</th><th>What an attacker learns</th></tr>
<tr><td>/actuator/env</td><td>Every property, including database URLs and often credentials.</td></tr>
<tr><td>/actuator/heapdump</td><td>A full memory image - passwords, tokens and customer data in plain text.</td></tr>
<tr><td>/actuator/beans</td><td>Your entire class and package structure.</td></tr>
<tr><td>/actuator/mappings</td><td>Every URL, including the ones not in your public documentation.</td></tr>
<tr><td>/actuator/configprops</td><td>Configuration values with their sources.</td></tr>
<tr><td>/actuator/shutdown</td><td>A one-request denial of service.</td></tr>
</table>
<br>
Three defences, in order of importance:<br><br>

<table>
<tr><th>Defence</th><th>How</th></tr>
<tr><td>Expose only what you need</td><td><code>include=health,info,metrics,prometheus</code> - name them; never use <code>*</code>.</td></tr>
<tr><td>Move actuator to its own port</td><td><code>management.server.port=9001</code>, reachable only inside the network and never through the public load balancer.</td></tr>
<tr><td>Require authentication</td><td>With spring-boot-starter-security, protect <code>EndpointRequest.toAnyEndpoint()</code> and require a role.</td></tr>
</table>`,
            codeExamples: [
                `# application-prod.properties - a sane production setup
management.endpoints.web.exposure.include=health,info,prometheus
management.server.port=9001
management.server.address=127.0.0.1
management.endpoint.health.show-details=when-authorized`,
                `// Locking the endpoints behind a role
@Configuration
public class ActuatorSecurityConfig {

    @Bean
    SecurityFilterChain actuatorChain(HttpSecurity http) throws Exception {
        http.securityMatcher(EndpointRequest.toAnyEndpoint())
            .authorizeHttpRequests(auth -> auth
                // liveness/readiness probes must stay open for the load balancer
                .requestMatchers(EndpointRequest.to("health", "info")).permitAll()
                .anyRequest().hasRole("ACTUATOR"))
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
// OUTPUT:
// GET /actuator/health -> 200 {"status":"UP"}
// GET /actuator/env    -> 401 Unauthorized  (200 with valid ACTUATOR credentials)`
            ]
        },
        {
            content: `<h3>enabled vs exposed - Two Different Switches</h3>
The shutdown endpoint needed <code>management.endpoint.shutdown.enabled=true</code> <em>and</em> inclusion in the exposure list. That is not redundancy; they are two separate gates and knowing which one is closed saves a lot of guessing.<br><br>

<table>
<tr><th>Property</th><th>Controls</th></tr>
<tr><td><code>management.endpoint.&lt;id&gt;.enabled</code></td><td>Whether the endpoint bean exists at all. All are true by default except <code>shutdown</code>.</td></tr>
<tr><td><code>management.endpoints.web.exposure.include</code></td><td>Whether an enabled endpoint is reachable over HTTP. Only <code>health</code> by default.</td></tr>
<tr><td><code>management.endpoints.web.exposure.exclude</code></td><td>Removes an endpoint from the include set. Exclude always wins.</td></tr>
<tr><td><code>management.endpoints.web.base-path</code></td><td>Changes <code>/actuator</code> to something else - a cheap obscurity measure, not security.</td></tr>
</table>
<br>
So a 404 on <code>/actuator/beans</code> has two possible causes: the endpoint is disabled, or it is enabled but not exposed. Check the exposure list first - it is nearly always that.<br>`
        },
        {
            content: `<h3>Health Indicators, and Why /health Is Not Just "UP"</h3>
<code>{"status":"UP"}</code> is the summary. Underneath, Spring Boot runs a <strong>HealthIndicator</strong> for every piece of infrastructure it detected: <code>db</code>, <code>diskSpace</code>, <code>redis</code>, <code>mail</code>, <code>rabbit</code>. The overall status is the worst of them - one DOWN indicator makes the whole endpoint DOWN and returns HTTP 503.<br><br>

That is the contract a load balancer or Kubernetes probe relies on: 200 means "send me traffic", 503 means "take me out of rotation".<br>`,
            codeExamples: [
                `# show the individual indicators, not just the summary
management.endpoint.health.show-details=always`,
                `// GET /actuator/health with details on
{
  "status": "DOWN",
  "components": {
    "db":        { "status": "DOWN",
                   "details": { "error": "Connection refused: localhost:3306" } },
    "diskSpace": { "status": "UP",
                   "details": { "total": 500107862016, "free": 82316222464 } },
    "ping":      { "status": "UP" }
  }
}
// HTTP status: 503 Service Unavailable
// One DOWN component drags the whole application status down - which is
// exactly what you want a load balancer to see.`,
                `// A custom indicator for a dependency Spring cannot detect
@Component
public class PaymentGatewayHealthIndicator implements HealthIndicator {

    private final PaymentGatewayClient client;

    public PaymentGatewayHealthIndicator(PaymentGatewayClient client) {
        this.client = client;
    }

    @Override
    public Health health() {
        try {
            long ms = client.ping();
            return Health.up().withDetail("responseTimeMs", ms).build();
        } catch (Exception e) {
            return Health.down(e).withDetail("gateway", "unreachable").build();
        }
    }
}
// The bean name minus "HealthIndicator" becomes the component key.
// OUTPUT:
// "paymentGateway": { "status": "UP", "details": { "responseTimeMs": 42 } }`,
                `# Kubernetes-friendly probes - separate liveness from readiness
management.endpoint.health.probes.enabled=true
# GET /actuator/health/liveness   -> is the process alive? restart if not
# GET /actuator/health/readiness  -> can it serve traffic? remove from LB if not`
            ]
        },
        {
            content: `<h3>Metrics, and Where the Numbers Go</h3>
<code>/actuator/metrics</code> is backed by <strong>Micrometer</strong>, a vendor-neutral facade for metrics - roughly what SLF4J is for logging. Add the registry for your monitoring system and the same instrumentation is exported to it, unchanged.<br><br>

<table>
<tr><th>Dependency</th><th>Exports to</th></tr>
<tr><td>micrometer-registry-prometheus</td><td>Prometheus, scraped from <code>/actuator/prometheus</code></td></tr>
<tr><td>micrometer-registry-datadog</td><td>Datadog</td></tr>
<tr><td>micrometer-registry-cloudwatch2</td><td>AWS CloudWatch</td></tr>
</table>
<br>
Reading a metric by hand is fine for a spot check; the point of the endpoint is that a monitoring system scrapes it every few seconds and alerts on it.<br>`,
            codeExamples: [
                `// GET /actuator/metrics                 -> the list of metric names
// GET /actuator/metrics/jvm.memory.used -> one metric
{
  "name": "jvm.memory.used",
  "measurements": [ { "statistic": "VALUE", "value": 5.8236928E7 } ],
  "availableTags": [
    { "tag": "area", "values": ["heap", "nonheap"] }
  ]
}

// Filter by tag:
// GET /actuator/metrics/jvm.memory.used?tag=area:heap`,
                `// Your own business metric - a counter and a timer
@Service
public class OrderService {

    private final Counter placed;
    private final Timer   checkout;

    public OrderService(MeterRegistry registry) {
        this.placed   = registry.counter("orders.placed");
        this.checkout = registry.timer("orders.checkout.duration");
    }

    public void place(Order order) {
        checkout.record(() -> {
            repository.save(order);
            placed.increment();
        });
    }
}
// OUTPUT:
// GET /actuator/metrics/orders.placed
// {"name":"orders.placed","measurements":[{"statistic":"COUNT","value":143.0}]}`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the Spring Boot Actuator?</td><td>A starter that exposes ready-made HTTP endpoints for managing and monitoring a running application - health, metrics, beans, mappings, environment and more.</td></tr>
<tr><td>Which dependency do you add?</td><td><code>spring-boot-starter-actuator</code>.</td></tr>
<tr><td>Which endpoint is exposed by default?</td><td>Only <code>/actuator/health</code> over HTTP.</td></tr>
<tr><td>How do you expose all endpoints?</td><td><code>management.endpoints.web.exposure.include=*</code> - fine in development, dangerous in production.</td></tr>
<tr><td>Difference between "enabled" and "exposed"?</td><td>enabled controls whether the endpoint bean exists; exposure controls whether it is reachable over HTTP. shutdown is the one endpoint disabled by default.</td></tr>
<tr><td>How do you exclude endpoints?</td><td><code>management.endpoints.web.exposure.exclude=beans,metrics</code>. Exclude always beats include.</td></tr>
<tr><td>Which HTTP method does /actuator/shutdown accept?</td><td>POST only - a browser GET returns 405.</td></tr>
<tr><td>Why is exposing /actuator/env and /actuator/heapdump dangerous?</td><td>env leaks configuration including credentials; a heap dump is a full memory image containing passwords, tokens and customer data.</td></tr>
<tr><td>How do you secure the actuator endpoints?</td><td>Expose only what you need, move them to a separate internal port with <code>management.server.port</code>, and protect <code>EndpointRequest.toAnyEndpoint()</code> with Spring Security.</td></tr>
<tr><td>What determines the overall health status?</td><td>The worst status among all HealthIndicators. Any DOWN component makes the endpoint DOWN and returns HTTP 503.</td></tr>
<tr><td>How do you add your own health check?</td><td>Implement <code>HealthIndicator</code> and register it as a bean; the bean name minus "HealthIndicator" becomes the component key.</td></tr>
<tr><td>What library backs /actuator/metrics?</td><td>Micrometer - a vendor-neutral metrics facade that exports the same instrumentation to Prometheus, Datadog, CloudWatch and others.</td></tr>
<tr><td>Which endpoint tells you why an auto-configuration did or did not apply?</td><td><code>/actuator/conditions</code>.</td></tr>
</table>`
        }
    ]
};
