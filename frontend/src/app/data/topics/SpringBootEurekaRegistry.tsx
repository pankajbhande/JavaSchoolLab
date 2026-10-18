import { Topic } from '../coreJava';

export const springBootEurekaRegistry: Topic = {
    id: 'spring-boot-eureka-registry',
    name: 'Eureka Service Registry',
    beginner: [
        {
            content: `<h3>Registering a Microservice on a Eureka Server</h3>
Also called: <strong>Spring Cloud Netflix Eureka based Service Registry</strong>.<br><br>

There are two applications to build, and they are different projects:<br><br>

<table>
<tr><th>Application</th><th>Role</th><th>Port</th></tr>
<tr><td>Eureka <strong>Server</strong></td><td>The registry itself - the directory of services.</td><td>8761</td></tr>
<tr><td>Eureka <strong>Client</strong></td><td>An ordinary microservice that registers itself with the server.</td><td>8083</td></tr>
</table>
<br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">        +----------------------------------+
        |        EUREKA SERVER             |
        |   @EnableEurekaServer            |
        |   http://localhost:8761          |
        +----------------------------------+
                      ^
                      |  1. register  ("I am PRODUCTTESTSERVICE at :8083")
                      |  2. heartbeat every 30s
                      |
        +----------------------------------+
        |   PRODUCTTESTSERVICE             |
        |   @EnableEurekaClient            |
        |   http://localhost:8083          |
        +----------------------------------+</pre>
<br>
<strong>8761 is the conventional Eureka port</strong> - the default every Spring Cloud example and default configuration expects.<br>`
        },
        {
            content: `<h3>Part 1 - The Eureka Client (the microservice)</h3>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project<br>
2. Add the Maven dependencies to pom.xml<br>
3. Write <code>@EnableEurekaClient</code> on the main class<br>
4. Write the code into application.properties<br>
5. Design the REST controller<br>
6. Run as a Spring Boot application<br>
7. Open Postman (request and response)
</div><br>

In the Spring Starter wizard, select <strong>Eureka Discovery Client</strong>, <strong>Spring Web</strong> and <strong>Spring Boot Actuator</strong>.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
<!-- Note the artifactId has hyphens throughout:
     spring-cloud-starter-netflix-eureka-client
     "netflixeureka-client" is a typo and will not resolve. -->`,
                `<!-- Spring Cloud versions are managed by a BOM, not set per
     dependency. The BOM version must match your Boot version. -->
<properties>
    <spring-cloud.version>2022.0.4</spring-cloud.version>
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

<!-- Boot 3.1 -> Spring Cloud 2022.0.x
     Boot 3.2 -> Spring Cloud 2023.0.x
     Boot 2.7 -> Spring Cloud 2021.0.x
     A mismatched pair fails at startup with NoSuchMethodError. -->`,
                `// Step 3 - the main class
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.EnableEurekaClient;

@EnableEurekaClient
@SpringBootApplication
public class ProductTestServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductTestServiceApplication.class, args);
    }
}
// Since Spring Cloud 2020, @EnableEurekaClient is OPTIONAL - simply
// having the starter on the classpath enables registration. It was
// removed entirely in Spring Cloud 2022.0; if your build cannot
// resolve it, delete the annotation and the import. Everything
// still works.`
            ]
        },
        {
            content: `<h3>Steps 4 and 5 - Configuration and Controller</h3>
<code>spring.application.name</code> is the single most important property here: it becomes the <strong>service id</strong> under which the service appears in the registry, and the name other services use to call it.<br>`,
            codeExamples: [
                `# Step 4 - application.properties
spring.application.name=producttestservice
server.port=8083

# Where the registry is. This is the default, so it can be omitted
# while everything runs on one machine - but be explicit.
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# The registry displays the name in UPPERCASE, so this service
# appears as PRODUCTTESTSERVICE.`,
                `// Step 5 - ProductController.java
package com.example.demo;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/product")
public class ProductController {

    @GetMapping("/list")
    public List<String> getProductList() {
        List<String> list = new ArrayList<>();
        list.add("mobile");
        list.add("laptop");
        return list;
    }
}`,
                `// Steps 6 and 7 - run it and call it directly
// GET http://localhost:8083/product/list
// RESPONSE (200 OK)
[
    "mobile",
    "laptop"
]

// Started BEFORE the Eureka server exists, the console repeats:
// Connect to localhost:8761 failed: Connection refused
// DiscoveryClient_PRODUCTTESTSERVICE/... - registration failed
//
// That is expected and harmless - the client retries, and the
// service still answers its own endpoints. It simply is not
// discoverable yet.`
            ]
        },
        {
            content: `<h3>Part 2 - The Eureka Server</h3>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project<br>
2. Add the Maven dependency to pom.xml<br>
3. Write <code>@EnableEurekaServer</code> on the main class<br>
4. Write the code into application.properties<br>
5. Run as a Spring Boot application<br>
6. Open the browser
</div><br>

This is a <strong>separate project</strong> from the client - a different folder, a different pom.xml, a different main class.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml : the SERVER artifact, not the client -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>

<!-- With the spring-cloud-dependencies BOM imported as above, no
     <version> is needed here - and should not be given, or you can
     pair a Spring Cloud release with an incompatible Boot version. -->`,
                `// Step 3 - the main class
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class EurekaServerDemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaServerDemoApplication.class, args);
    }
}
// Unlike @EnableEurekaClient, @EnableEurekaServer IS still required -
// it is what switches the application into being a registry.`,
                `# Step 4 - application.properties
server.port=8761

# A standalone server must not try to register with itself,
# or to fetch a registry from a peer that does not exist.
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false

# Omitting fetch-registry=false leaves the console repeating
#   Cannot execute request on any known server
# every 30 seconds. Both properties belong together.`,
                `// Steps 5 and 6 - run it, then open the browser
// http://localhost:8761/

// The Eureka dashboard appears:
//
//   Instances currently registered with Eureka
//   +---------------------+-------+-------------------------------+
//   | Application         | AMIs  | Status                        |
//   +---------------------+-------+-------------------------------+
//   | PRODUCTTESTSERVICE  | n/a   | UP (1) - localhost:producttestservice:8083 |
//   +---------------------+-------+-------------------------------+
//
// Start the CLIENT and within ~30 seconds it appears in this table.
// That is registration working.`
            ]
        },
        {
            content: `<h3>Putting It Together</h3>
Start the server first, then the client.<br><br>

<table>
<tr><th>Order</th><th>Application</th><th>URL</th></tr>
<tr><td>1</td><td>Eureka Server</td><td>http://localhost:8761/</td></tr>
<tr><td>2</td><td>producttestservice</td><td>http://localhost:8083/product/list</td></tr>
</table>
<br>
The client's console shows the registration:<br>`,
            codeExamples: [
                `// CLIENT CONSOLE once the server is up:
// DiscoveryClient_PRODUCTTESTSERVICE/localhost:producttestservice:8083:
//     registering service...
// DiscoveryClient_PRODUCTTESTSERVICE/localhost:producttestservice:8083 -
//     registration status: 204
// Tomcat started on port(s): 8083 (http)

// 204 No Content is the SUCCESS response from Eureka's register API.

// The registry as raw data - what other services actually consume:
// GET http://localhost:8761/eureka/apps
// (add "Accept: application/json" for JSON instead of XML)
{
  "applications": {
    "application": [{
      "name": "PRODUCTTESTSERVICE",
      "instance": [{
        "instanceId": "localhost:producttestservice:8083",
        "hostName": "localhost",
        "app": "PRODUCTTESTSERVICE",
        "ipAddr": "192.168.1.14",
        "status": "UP",
        "port": { "$": 8083, "@enabled": "true" }
      }]
    }]
  }
}`,
                `// Stop the client and watch the dashboard. It does NOT disappear
// immediately - Eureka waits for missed heartbeats:
//
//   EMERGENCY! EUREKA MAY BE INCORRECTLY CLAIMING INSTANCES ARE UP
//   WHEN THEY'RE NOT. RENEWALS ARE LESSER THAN THRESHOLD...
//
// That red banner is SELF-PRESERVATION MODE, and it is not an error.
// See the Expert tab.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>How Registration Actually Works</h3>
Registration is not a one-off announcement. It is a lease that must be continually renewed, which is what makes the registry reflect reality.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">CLIENT                                    EUREKA SERVER
   |                                            |
   |-- POST /eureka/apps/PRODUCTTESTSERVICE --->|   register
   |<-- 204 No Content --------------------------|   lease granted (90s)
   |                                            |
   |-- PUT  .../instanceId  (every 30s) ------->|   heartbeat - renew lease
   |<-- 200 OK ----------------------------------|
   |                                            |
   |-- GET  /eureka/apps    (every 30s) -------->|   fetch the registry
   |<-- the full service list -------------------|   cached locally
   |                                            |
   |-- DELETE .../instanceId ------------------->|   graceful shutdown
   |<-- 200 OK ----------------------------------|   removed immediately</pre>

<table>
<tr><th>Property</th><th>Default</th><th>Meaning</th></tr>
<tr><td><code>eureka.instance.lease-renewal-interval-in-seconds</code></td><td>30</td><td>How often the client sends a heartbeat.</td></tr>
<tr><td><code>eureka.instance.lease-expiration-duration-in-seconds</code></td><td>90</td><td>How long the server waits before evicting a silent instance.</td></tr>
<tr><td><code>eureka.client.registry-fetch-interval-seconds</code></td><td>30</td><td>How often clients refresh their local copy of the registry.</td></tr>
</table>
<br>
Those defaults mean a crashed instance can stay in the registry for up to <strong>90 seconds</strong>, and callers can hold a stale copy for another 30. Callers must therefore tolerate calling a dead instance - which is why a circuit breaker and retry are not optional extras here.<br>`,
            codeExamples: [
                `# Faster detection for development - at the cost of more traffic
eureka.instance.lease-renewal-interval-in-seconds=5
eureka.instance.lease-expiration-duration-in-seconds=15
eureka.client.registry-fetch-interval-seconds=5

# Now a dead instance disappears within ~15 seconds instead of 90.
# Do not push these too low in production: every client heartbeating
# every second against one registry is a lot of load.`,
                `# A stable instance id, so restarts do not create duplicate entries
eureka.instance.instance-id=\${spring.application.name}:\${server.port}

# On a cloud platform, register the IP rather than the hostname -
# container hostnames are rarely resolvable by other containers
eureka.instance.prefer-ip-address=true

# Let Eureka report health from Actuator, so a service with a broken
# database is marked DOWN instead of UP
eureka.client.healthcheck.enabled=true
management.endpoint.health.show-details=always`
            ]
        },
        {
            content: `<h3>Self-Preservation Mode - the Red Banner</h3>
Stop a client and the dashboard often shows:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">EMERGENCY! EUREKA MAY BE INCORRECTLY CLAIMING INSTANCES ARE UP WHEN
THEY'RE NOT. RENEWALS ARE LESSER THAN THRESHOLD AND HENCE THE
INSTANCES ARE NOT BEING EXPIRED JUST TO BE SAFE.</pre>
<br>
This is a deliberate design decision, not a fault. Eureka expects a certain number of heartbeats per minute. If renewals drop below 85% of that, it concludes that <strong>the network is more likely broken than every service dying at once</strong>, and stops evicting anything.<br><br>

The reasoning: wrongly removing healthy services during a network partition is far worse than briefly keeping dead ones. A stale entry causes one failed call the caller can retry; an empty registry takes down the whole platform.<br><br>

This is Eureka choosing <strong>AP over CP</strong> in CAP terms - availability over consistency.<br><br>

<table>
<tr><th>Setting</th><th>Effect</th></tr>
<tr><td><code>eureka.server.enable-self-preservation=false</code></td><td>Always evict on missed heartbeats. Fine in development; risky in production.</td></tr>
<tr><td><code>eureka.server.renewal-percent-threshold</code></td><td>Default 0.85 - the fraction of expected renewals below which preservation kicks in.</td></tr>
<tr><td><code>eureka.server.eviction-interval-timer-in-ms</code></td><td>Default 60000 - how often the eviction task runs.</td></tr>
</table>
<br>
With one or two services in development the threshold is trivially crossed, which is why the banner appears constantly on a laptop and rarely in a real cluster.<br>`,
            codeExamples: [
                `# Development - see instances disappear promptly
eureka.server.enable-self-preservation=false
eureka.server.eviction-interval-timer-in-ms=5000

# Production - leave self-preservation ON (the default).
# A network blip should not empty your service registry.`
            ]
        },
        {
            content: `<h3>A Single Registry Is a Single Point of Failure</h3>
One Eureka server on port 8761 is exactly the problem microservices set out to avoid: if it dies, no new instance can register and no client can discover anything.<br><br>

Eureka servers are designed to <strong>peer with each other</strong>. Each registers with the others and replicates its registry, so any one can serve the whole picture.<br>`,
            codeExamples: [
                `# peer1 - application-peer1.properties
spring.application.name=eureka-server
server.port=8761
eureka.instance.hostname=peer1
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
eureka.client.service-url.defaultZone=http://peer2:8762/eureka/

# peer2 - application-peer2.properties
spring.application.name=eureka-server
server.port=8762
eureka.instance.hostname=peer2
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
eureka.client.service-url.defaultZone=http://peer1:8761/eureka/

# Note register-with-eureka and fetch-registry are now TRUE - the
# opposite of the standalone setup, because each peer is a client
# of the other.`,
                `# Clients list every peer, so losing one changes nothing
eureka.client.service-url.defaultZone=http://peer1:8761/eureka/,http://peer2:8762/eureka/

# Run them:
#   java -jar eureka-server.jar --spring.profiles.active=peer1
#   java -jar eureka-server.jar --spring.profiles.active=peer2
#
# OUTPUT: each dashboard shows the other as a registered replica,
# and both list every service. Kill peer1 and clients fail over
# to peer2 with no configuration change.`
            ]
        },
        {
            content: `<h3>Discovery Is Only Useful If Something Uses It</h3>
Registration on its own changes nothing - the client still answers its own endpoints exactly as before. The payoff comes when a <em>caller</em> looks a service up by name instead of by host and port.<br><br>

<table>
<tr><th>Approach</th><th>What it gives you</th></tr>
<tr><td>Hard-coded URL</td><td>Nothing. Breaks when the port or host changes, and cannot load-balance.</td></tr>
<tr><td><code>DiscoveryClient</code></td><td>The raw instance list. Useful for tooling; verbose for everyday calls.</td></tr>
<tr><td><code>@LoadBalanced</code> RestTemplate / WebClient</td><td>Call <code>http://SERVICE-NAME/path</code>; the client resolves and round-robins across instances.</td></tr>
<tr><td>Spring Cloud OpenFeign</td><td>A declarative interface - the least code, and the usual choice.</td></tr>
</table>`,
            codeExamples: [
                `// Raw discovery - what is actually registered
@Autowired
private DiscoveryClient discoveryClient;

@GetMapping("/services")
public List<String> services() {
    return discoveryClient.getServices();
}
// OUTPUT: ["producttestservice"]

@GetMapping("/instances")
public List<String> instances() {
    return discoveryClient.getInstances("producttestservice").stream()
            .map(i -> i.getHost() + ":" + i.getPort())
            .toList();
}
// OUTPUT: ["localhost:8083", "localhost:8084"]  when two are running`,
                `// @LoadBalanced - the service NAME becomes the hostname
@Configuration
public class RestConfig {

    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class OrderService {

    @Autowired
    private RestTemplate restTemplate;

    public List<String> products() {
        // "PRODUCTTESTSERVICE" is resolved through Eureka, and calls
        // are spread across every UP instance.
        return restTemplate.getForObject(
                "http://PRODUCTTESTSERVICE/product/list", List.class);
    }
}
// OUTPUT: ["mobile", "laptop"]
// Start a second instance on 8084 and calls alternate between them
// with no configuration change anywhere.
//
// WITHOUT @LoadBalanced:
//   UnknownHostException: PRODUCTTESTSERVICE`,
                `// OpenFeign - declarative, and the least code
@FeignClient(name = "producttestservice")
public interface ProductClient {

    @GetMapping("/product/list")
    List<String> getProductList();
}

@Service
public class OrderService {

    private final ProductClient productClient;   // injected like any bean

    public List<String> products() {
        return productClient.getProductList();
    }
}
// Add @EnableFeignClients to the main class and
// spring-cloud-starter-openfeign to the pom.
// Discovery, load balancing and HTTP are all handled; the call site
// reads like a local method call.`
            ]
        },
        {
            content: `<h3>Is Eureka Still the Right Choice?</h3>
Worth knowing, because the answer has changed.<br><br>

<table>
<tr><th>Component</th><th>Status</th></tr>
<tr><td>Eureka Server / Client</td><td>Still maintained in Spring Cloud - the only Netflix OSS piece that survived.</td></tr>
<tr><td>Ribbon (client load balancing)</td><td>Removed. Replaced by Spring Cloud LoadBalancer.</td></tr>
<tr><td>Hystrix (circuit breaker)</td><td>Removed. Replaced by Resilience4j.</td></tr>
<tr><td>Zuul (gateway)</td><td>Removed. Replaced by Spring Cloud Gateway.</td></tr>
<tr><td>@EnableEurekaClient</td><td>Optional since 2020, removed in Spring Cloud 2022.0.</td></tr>
</table>
<br>
<strong>On Kubernetes you usually do not need Eureka at all.</strong> A Kubernetes <code>Service</code> gives every workload a stable DNS name and load-balances across healthy pods, using liveness and readiness probes that the platform already runs. Running Eureka on top duplicates that with something you have to operate yourself.<br><br>

<table>
<tr><th>Use Eureka when</th><th>Use platform discovery when</th></tr>
<tr><td>Deploying to VMs or bare metal</td><td>Running on Kubernetes</td></tr>
<tr><td>You want client-side load balancing you control</td><td>Server-side balancing via a Service is enough</td></tr>
<tr><td>The stack is already Spring Cloud Netflix</td><td>Starting fresh - use the platform's own mechanism</td></tr>
</table>`,
            codeExamples: [
                `# On Kubernetes, this replaces the entire registry:
apiVersion: v1
kind: Service
metadata:
  name: producttestservice
spec:
  selector:
    app: producttestservice
  ports:
    - port: 80
      targetPort: 8083

# Any pod can now call:
#   http://producttestservice/product/list
# Kubernetes resolves the DNS name and load-balances across the
# healthy pods. No Eureka server to run, patch or monitor.`,
                `// Spring Cloud Kubernetes, if you want DiscoveryClient anyway
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-kubernetes-client-discovery</artifactId>
</dependency>
// The same DiscoveryClient API, backed by the Kubernetes API server
// instead of Eureka - so application code does not change if you
// migrate from one to the other.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is Eureka?</td><td>A service registry - a discovery server where microservices register themselves so others can find them by name rather than by host and port.</td></tr>
<tr><td>Why is a registry needed?</td><td>Instances start, stop and move as they scale, so hard-coded addresses break. The registry is the live directory.</td></tr>
<tr><td>Which annotations set up each side?</td><td><code>@EnableEurekaServer</code> on the registry; <code>@EnableEurekaClient</code> on a service - though that one is optional now and removed in Spring Cloud 2022.0.</td></tr>
<tr><td>What port does Eureka use by convention?</td><td>8761.</td></tr>
<tr><td>Why set register-with-eureka and fetch-registry to false on the server?</td><td>A standalone server would otherwise try to register with itself and fetch a registry from a peer that does not exist, logging errors every 30 seconds.</td></tr>
<tr><td>Which property becomes the service id?</td><td><code>spring.application.name</code> - shown uppercased in the dashboard and used by callers.</td></tr>
<tr><td>How does the server know a service is alive?</td><td>Heartbeats - by default every 30 seconds, with a 90-second lease expiry.</td></tr>
<tr><td>How long can a dead instance stay registered?</td><td>Up to 90 seconds, plus up to 30 more in a client's cached copy - so callers must tolerate calling a dead instance.</td></tr>
<tr><td>What is self-preservation mode?</td><td>When renewals fall below 85% of expected, Eureka stops evicting instances, assuming a network problem rather than mass failure. It favours availability over consistency.</td></tr>
<tr><td>How do you make Eureka highly available?</td><td>Run several peer-aware servers that register with each other and replicate the registry; clients list all peers.</td></tr>
<tr><td>What does @LoadBalanced do?</td><td>Lets a RestTemplate or WebClient resolve <code>http://SERVICE-NAME/...</code> through discovery and round-robin across instances.</td></tr>
<tr><td>Do you need Eureka on Kubernetes?</td><td>Usually not - a Kubernetes Service provides stable DNS and load balancing using the platform's own health probes.</td></tr>
<tr><td>Which Netflix components were replaced?</td><td>Ribbon by Spring Cloud LoadBalancer, Hystrix by Resilience4j, Zuul by Spring Cloud Gateway. Eureka is the one that remains.</td></tr>
</table>`
        }
    ]
};
