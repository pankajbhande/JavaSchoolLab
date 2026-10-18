// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const cloudNativePatterns: Course[] = [
  {
    id: 'cloud-native-patterns',
    name: 'Cloud-Native Patterns',
    icon: 'Cloud',
    subTopics: [
      {
        id: 'cloud-native-patterns-all',
        name: 'Cloud-Native Patterns',
        topics: [

          // ----- Externalized Configuration -----
          {
            id: 'externalized-config-pattern',
            name: 'Externalized Configuration Pattern',
            beginner: [
              {
                content: `<h3>Externalized Configuration Pattern</h3>
<strong>Externalized Configuration</strong> means keeping configuration values - database URLs, credentials, feature flags, timeouts - <strong>out of your compiled code</strong> and reading them instead from an external source: environment variables, config files, or a config server. This is the <strong>third factor</strong> of the well-known <strong>Twelve-Factor App</strong> methodology: "Store config in the environment."<br>
<br>
<h4>Why It Matters</h4>
<br>
• <strong>No Rebuild Per Environment</strong> - The same compiled JAR runs in dev, staging, and production; only the config differs.<br>
• <strong>Secrets Stay Out of Source Control</strong> - Credentials never get committed to Git.<br>
• <strong>Change Without Redeploying</strong> - Some values (timeouts, flags) can be tuned without a full rebuild.<br>
<br>
<h4>Spring Boot's application.yml + Profiles</h4>
Spring Boot's standard approach is <strong>application.yml</strong> (or .properties) combined with <strong>profiles</strong> - a "dev" profile and a "prod" profile can each override values like the database URL.<br>`,
                codeExamples: [
                  `# application.yml (base config, checked into Git - no secrets here)
spring:
  application:
    name: order-service
server:
  port: \${SERVER_PORT:8080}

---
# application-prod.yml (activated with --spring.profiles.active=prod)
spring:
  datasource:
    url: \${DB_URL}         # comes from an environment variable, not hardcoded
    username: \${DB_USER}
    password: \${DB_PASSWORD}`,
                  `import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PaymentConfig {

    @Value("\${payment.gateway.timeout-ms:3000}")   // reads from externalized config, defaults to 3000
    private int timeoutMs;

    public int getTimeoutMs() {
        return timeoutMs;
    }
}
// This class never hardcodes the timeout - it's supplied externally,
// so ops can tune it per environment without touching or rebuilding the code.`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Layered Config Resolution</h3>
Spring Boot resolves configuration from multiple sources in a defined precedence order (highest wins): command-line arguments &gt; environment variables &gt; profile-specific files (application-prod.yml) &gt; the base application.yml &gt; @PropertySource annotations &gt; defaults in code.<br><br>

<h4>Related Patterns</h4>
• <strong>Configuration Server Pattern</strong> - one way to implement Externalized Configuration centrally across MANY services, instead of each service reading its own local files.<br>
• <strong>Distributed Configuration Pattern</strong> - goes a step further, propagating config CHANGES live to already-running instances, not just at startup.<br><br>
This pattern (Externalized Configuration) is the foundational principle; the other two are specific mechanisms for implementing it at scale.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why not just hardcode the DB URL in the code?</td><td>It would require a rebuild for every environment and risk leaking credentials into source control</td></tr>
<tr class='text-center'><td>Which Twelve-Factor App principle does this map to?</td><td>Factor III - "Store config in the environment"</td></tr>
<tr class='text-center'><td>What resolves with the highest precedence in Spring Boot config?</td><td>Command-line arguments, followed by environment variables, then profile-specific files, then the base application.yml</td></tr>
<tr class='text-center'><td>How does this differ from the Configuration Server pattern?</td><td>Externalized Configuration is the general principle (config outside code); Configuration Server is one specific centralized mechanism for serving that config to many services</td></tr>
</table>`
              }
            ]
          },

          // ----- Health Check -----
          {
            id: 'health-check-pattern',
            name: 'Health Check Pattern',
            beginner: [
              {
                content: `<h3>Health Check Pattern</h3>
A <strong>Health Check</strong> is an endpoint a service exposes so external systems - load balancers, orchestrators like Kubernetes, monitoring tools - can ask "are you okay?" and get a simple, fast answer. Instances that report unhealthy get taken out of rotation automatically, before they cause customer-facing failures.<br>
<br>
<h4>Spring Boot Actuator's /health Endpoint</h4>
Spring Boot Actuator ships a ready-made <code>/actuator/health</code> endpoint that aggregates the status of the app itself plus its dependencies (database, disk space, message brokers).<br>`,
                codeExamples: [
                  `# pom.xml dependency
# <dependency>
#   <groupId>org.springframework.boot</groupId>
#   <artifactId>spring-boot-starter-actuator</artifactId>
# </dependency>

# application.yml
management:
  endpoint:
    health:
      show-details: always`,
                  `// GET /actuator/health  (illustrative response, not deterministic Java output)
{
  "status": "UP",
  "components": {
    "db": { "status": "UP" },
    "diskSpace": { "status": "UP" }
  }
}`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Liveness vs Readiness Probes (Kubernetes)</h3>
Kubernetes distinguishes two different health questions, and conflating them is a classic production mistake:<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Probe</th><th>Question It Answers</th><th>What Happens on Failure</th></tr>
<tr class='text-center'><td>Liveness</td><td>Is the process stuck/deadlocked?</td><td>Kubernetes kills and restarts the container</td></tr>
<tr class='text-center'><td>Readiness</td><td>Is the instance ready to receive traffic right now?</td><td>Kubernetes stops routing traffic to it, but does NOT restart it</td></tr>
</table>
<br>
A service warming up a cache at startup should fail readiness (don't send it traffic yet) while still passing liveness (it's not stuck, just busy) - conflating the two would cause needless restart loops.<br>`,
                codeExamples: [
                  `# Kubernetes deployment snippet (illustrative YAML, not Java output)
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 10
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 5`
                ]
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What's the difference between liveness and readiness probes?</td><td>Liveness asks "should this be restarted?"; readiness asks "should this receive traffic right now?" - they can disagree (e.g. warming up)</td></tr>
<tr class='text-center'><td>Why is a health check important for load balancers?</td><td>It lets the load balancer automatically stop routing traffic to unhealthy instances instead of serving errors to users</td></tr>
<tr class='text-center'><td>What does Spring Boot Actuator provide out of the box?</td><td>A /actuator/health endpoint that aggregates the app's own status plus dependency health (DB, disk, message broker)</td></tr>
</table>`
              }
            ]
          },

          // ----- Service Mesh -----
          {
            id: 'service-mesh-pattern',
            name: 'Service Mesh Pattern',
            beginner: [
              {
                content: `<h3>Service Mesh Pattern</h3>
A <strong>Service Mesh</strong> is a dedicated infrastructure layer that handles service-to-service communication concerns - retries, timeouts, load balancing, mutual TLS encryption, observability - <strong>outside</strong> your application code, typically via a <strong>sidecar proxy</strong> deployed alongside every service instance.<br>
<br>
<h4>Why Not Just Put This Logic in the App?</h4>
<br>
• Every service would need to reimplement retry/timeout/TLS logic in every language it's written in.<br>
• A service mesh centralizes it in the infrastructure layer instead, so application code stays focused on business logic.<br>
• Real examples: <strong>Istio</strong>, whose data plane is built on the <strong>Envoy</strong> proxy, and <strong>Linkerd</strong>, which deliberately ships its own lightweight Rust micro-proxy instead of Envoy.<br>`
              }
            ],
            expert: [
              {
                content: `<h3>How It Works: Sidecar Proxies</h3>
Each service instance gets a sidecar proxy (e.g. Envoy) deployed in the same pod. All inbound and outbound traffic for that service is transparently routed through its sidecar, which enforces mesh-wide policies (mTLS, retries, circuit breaking) without the service's own code knowing anything about it. This is a direct application of the <strong>Sidecar Pattern</strong> at the networking layer - the mesh's "data plane" is made up of all these sidecars, coordinated by a "control plane" that pushes configuration to them.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   Service A            Service B
  +---------+          +---------+
  |  App A  |          |  App B  |
  +---------+          +---------+
  | Sidecar |&lt;-------&gt;| Sidecar |   <- mTLS, retries, metrics happen here
  +---------+          +---------+
       ^                    ^
       |                    |
       +---- Control Plane -+   (pushes routing/security policy to every sidecar)</pre>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does a service mesh solve?</td><td>It moves cross-cutting service-to-service communication concerns (retries, mTLS, observability) out of application code into a dedicated infrastructure layer</td></tr>
<tr class='text-center'><td>What is the "data plane" vs "control plane" in a mesh?</td><td>The data plane is the set of sidecar proxies actually handling traffic; the control plane pushes configuration/policy down to those proxies</td></tr>
<tr class='text-center'><td>Name two real service mesh implementations.</td><td>Istio (Envoy-based data plane) and Linkerd (its own Rust micro-proxy, not Envoy)</td></tr>
</table>`
              }
            ]
          },

          // ----- Configuration Server -----
          {
            id: 'config-server-pattern',
            name: 'Configuration Server Pattern',
            beginner: [
              {
                content: `<h3>Configuration Server Pattern</h3>
A <strong>Configuration Server</strong> is a dedicated centralized service that stores and serves configuration for ALL of an organization's other services, instead of each service keeping its own local config files. <strong>Spring Cloud Config Server</strong> is the standard Java/Spring implementation - it typically backs onto a Git repository as the source of truth for config.<br>
<br>
<h4>Relationship to Externalized Configuration</h4>
Externalized Configuration is the general principle - "keep config outside code." A Configuration Server is <strong>one specific way to implement that principle centrally</strong>, which becomes valuable once you have dozens of services and copy-pasting config files everywhere no longer scales.<br>`,
                codeExamples: [
                  `# Config Server's application.yml
spring:
  cloud:
    config:
      server:
        git:
          uri: https://github.com/myorg/config-repo`,
                  `# order-service's bootstrap.yml (client side) - illustrative, not deterministic Java output
spring:
  application:
    name: order-service
  cloud:
    config:
      uri: http://config-server:8888
# order-service fetches order-service.yml from the config repo at startup`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why use a Config Server instead of local application.yml files per service?</td><td>It centralizes config for many services in one auditable place (typically Git-backed), instead of scattering/duplicating files across every service's repo</td></tr>
<tr class='text-center'><td>What's the standard Java implementation of this pattern?</td><td>Spring Cloud Config Server</td></tr>
<tr class='text-center'><td>Does a Config Server alone propagate live config changes to running instances?</td><td>Not by itself - that's the job of the related Distributed Configuration pattern (e.g. paired with Spring Cloud Bus)</td></tr>
</table>`
              }
            ]
          },

          // ----- Centralized Logging -----
          {
            id: 'centralized-logging-pattern',
            name: 'Centralized Logging Pattern',
            beginner: [
              {
                content: `<h3>Centralized Logging Pattern</h3>
In a system with many service instances (potentially auto-scaling up and down), logs scattered across individual machines are useless during an incident - you can't SSH into a container that no longer exists. <strong>Centralized Logging</strong> ships every instance's logs to one aggregated, searchable place instead.<br>
<br>
<h4>The ELK/EFK Stack</h4>
<br>
• <strong>Filebeat/Fluentd</strong> - lightweight agents that read log files/streams and forward them.<br>
• <strong>Logstash</strong> (or Fluentd in EFK) - parses/enriches log lines.<br>
• <strong>Elasticsearch</strong> - stores and indexes logs for fast search.<br>
• <strong>Kibana</strong> - the UI for searching and visualizing logs.<br>`,
                codeExamples: [
                  `import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public class OrderService {
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    public void placeOrder(String orderId) {
        MDC.put("orderId", orderId);   // attaches structured context to every log line
        log.info("Order placed successfully");
        MDC.clear();
    }
}
// The MDC (Mapped Diagnostic Context) fields become structured, searchable
// fields once the log line is shipped to Elasticsearch - critical for
// filtering logs by orderId across every service instance at once.`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why is per-machine logging insufficient in the cloud?</td><td>Instances are ephemeral (auto-scaled, replaced on failure) - their local logs disappear with them, so aggregation elsewhere is required</td></tr>
<tr class='text-center'><td>What does the "L" in ELK stand for?</td><td>Logstash - the component that parses and enriches incoming log data before indexing</td></tr>
<tr class='text-center'><td>Why attach structured fields (like orderId) via MDC instead of just free text?</td><td>Structured fields become searchable/filterable in the log aggregation tool, instead of requiring fragile text parsing</td></tr>
</table>`
              }
            ]
          },

          // ----- Distributed Tracing -----
          {
            id: 'distributed-tracing-pattern',
            name: 'Distributed Tracing Pattern',
            beginner: [
              {
                content: `<h3>Distributed Tracing Pattern</h3>
When one user request fans out across five microservices, a single log file can't show you the whole picture. <strong>Distributed Tracing</strong> tags a request with a shared <strong>trace ID</strong> the moment it enters the system, and propagates that ID through every downstream call, so all the pieces can be reassembled into one timeline later.<br>
<br>
<h4>Spring Cloud Sleuth + Zipkin/Jaeger</h4>
<strong>Spring Cloud Sleuth</strong> (or its successor, Micrometer Tracing) automatically injects trace IDs and span IDs into logs and outgoing HTTP/messaging calls. <strong>Zipkin</strong> or <strong>Jaeger</strong> then collect and visualize those traces.<br>`,
                codeExamples: [
                  `// Illustrative log lines showing trace propagation across 2 services
// order-service:   [order-service,traceId=8f3a1c,spanId=a1b2] Received order request
// payment-service: [payment-service,traceId=8f3a1c,spanId=c3d4] Charging card
// Same traceId across both services lets you reconstruct the full request path`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Why This Matters for Latency Debugging</h3>
A trace is built from <strong>spans</strong> - one span per unit of work (an HTTP call, a DB query). Visualized as a waterfall/flame graph, spans immediately reveal WHICH service in a five-hop chain is actually responsible for a slow request, instead of guessing from disconnected logs.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">traceId=8f3a1c
  Gateway         [====] 20ms
    OrderService    [========] 80ms
      PaymentService  [========================] 240ms  <- the actual bottleneck
      InventoryService[==] 15ms</pre>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is a trace ID?</td><td>A unique identifier generated when a request enters the system, propagated through every downstream call so the full request path can be reconstructed</td></tr>
<tr class='text-center'><td>What is a span?</td><td>One unit of work within a trace - e.g. one HTTP call or one DB query - with its own start/end time</td></tr>
<tr class='text-center'><td>Name two tools used to visualize distributed traces.</td><td>Zipkin and Jaeger</td></tr>
</table>`
              }
            ]
          },

          // ----- Auto Scaling -----
          {
            id: 'auto-scaling-pattern',
            name: 'Auto Scaling Pattern',
            beginner: [
              {
                content: `<h3>Auto Scaling Pattern</h3>
<strong>Auto Scaling</strong> automatically adds or removes running instances of a service based on real-time load, instead of provisioning for peak capacity 24/7 (wasteful) or fixed capacity (risks overload during spikes).<br>
<br>
<h4>Kubernetes HorizontalPodAutoscaler (HPA)</h4>
The HPA watches a metric (commonly CPU or memory utilization, or a custom metric like queue depth) and adjusts the number of pod replicas to keep it near a target.<br>`,
                codeExamples: [
                  `# HorizontalPodAutoscaler manifest (illustrative YAML, not Java output)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What problem does auto scaling solve?</td><td>Avoids over-provisioning for peak load 24/7 while still handling traffic spikes, by dynamically adjusting instance count to real-time load</td></tr>
<tr class='text-center'><td>What metric does the Kubernetes HPA commonly scale on?</td><td>CPU/memory utilization by default, or a custom metric like queue depth or request rate</td></tr>
<tr class='text-center'><td>Why does auto scaling depend on Graceful Shutdown working correctly?</td><td>When scaling down, terminated instances must finish in-flight requests cleanly instead of dropping them - otherwise scale-down events cause user-facing errors</td></tr>
</table>`
              }
            ]
          },

          // ----- Graceful Shutdown -----
          {
            id: 'graceful-shutdown-pattern',
            name: 'Graceful Shutdown Pattern',
            beginner: [
              {
                content: `<h3>Graceful Shutdown Pattern</h3>
When an instance is being terminated - during a deploy, a scale-down, or a node failure - <strong>Graceful Shutdown</strong> means it finishes any in-flight requests and cleans up resources (closes DB connections, flushes queues) before actually exiting, instead of being killed mid-request.<br>
<br>
<h4>Spring Boot's Built-In Support</h4>
Spring Boot (2.3+) supports graceful shutdown out of the box - when it receives a termination signal, it stops accepting NEW requests but lets in-flight ones complete, up to a configurable timeout.<br>`,
                codeExamples: [
                  `# application.yml
server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s
# On SIGTERM: Spring Boot stops accepting new connections immediately,
# but gives in-flight requests up to 20 seconds to finish before forcing exit.`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Why This Matters During Deploys and Scaling</h3>
Without graceful shutdown, every rolling deploy or auto-scale-down event would abruptly cut off whatever requests happened to be in progress on the terminated instance, producing user-visible errors on a completely routine operation. Kubernetes sends <code>SIGTERM</code> first, waits for a configurable <code>terminationGracePeriodSeconds</code>, and only sends <code>SIGKILL</code> if the process hasn't exited by then - the app's shutdown logic must fit within that window.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What signal does Kubernetes send before forcefully killing a pod?</td><td>SIGTERM first, giving the app a grace period, then SIGKILL if it hasn't exited</td></tr>
<tr class='text-center'><td>What happens to in-flight requests during graceful shutdown?</td><td>The instance stops accepting NEW requests but is allowed to finish already-in-progress ones before exiting</td></tr>
<tr class='text-center'><td>Why does this matter especially with auto scaling?</td><td>Scale-down events happen routinely under normal operation, so without graceful shutdown they'd regularly cause dropped requests</td></tr>
</table>`
              }
            ]
          },

          // ----- Leader Election -----
          {
            id: 'leader-election-pattern',
            name: 'Leader Election Pattern',
            beginner: [
              {
                content: `<h3>Leader Election Pattern</h3>
Some tasks - a scheduled cleanup job, a cache-warming routine - must run on exactly <strong>one</strong> instance, even though a service runs many replicas for availability. <strong>Leader Election</strong> coordinates those replicas to agree on exactly one "leader" responsible for the task; if the leader dies, the remaining instances elect a new one.<br>
<br>
<h4>Real Implementations</h4>
<br>
• <strong>Kubernetes Lease objects</strong> - a built-in primitive apps can use to coordinate leadership via the Kubernetes API.<br>
• <strong>Apache ZooKeeper</strong> - a classic distributed coordination service, commonly used for leader election via ephemeral sequential znodes.<br>`,
                codeExamples: [
                  `// Conceptual sketch - NOT a full runnable program, real implementations
// use Kubernetes Lease API or ZooKeeper client libraries, not raw locking:
public class LeaderElection {
    public boolean tryBecomeLeader(String instanceId) {
        // Attempts to atomically acquire a shared lease/lock.
        // Only ONE instance across the whole fleet succeeds at a time.
        return distributedLock.tryAcquire("scheduled-job-leader", instanceId);
    }
}`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why not just always run a scheduled job on every instance?</td><td>It would run duplicated N times (once per instance) instead of once - Leader Election ensures exactly one runs it</td></tr>
<tr class='text-center'><td>What happens when the current leader instance dies?</td><td>Its lease/lock expires or is released, and another instance detects this and becomes the new leader</td></tr>
<tr class='text-center'><td>Name two real coordination mechanisms used for leader election.</td><td>Kubernetes Lease objects and Apache ZooKeeper</td></tr>
</table>`
              }
            ]
          },

          // ----- Distributed Configuration -----
          {
            id: 'distributed-config-pattern',
            name: 'Distributed Configuration Pattern',
            beginner: [
              {
                content: `<h3>Distributed Configuration Pattern</h3>
<strong>Distributed Configuration</strong> is about propagating configuration <strong>changes</strong> consistently and in near real time to many ALREADY-RUNNING instances - not just reading config once at startup. This is the piece Externalized Configuration and Configuration Server don't fully solve on their own.<br>
<br>
<h4>How the Three Related Patterns Differ</h4>
<br>
• <strong>Externalized Configuration</strong> - the general principle of keeping config outside compiled code (WHERE it lives).<br>
• <strong>Configuration Server</strong> - one specific mechanism for centrally SERVING that config to many services, typically read once at startup.<br>
• <strong>Distributed Configuration</strong> (this pattern) - specifically about PROPAGATING live CHANGES to instances that are already running, without a restart.<br>
<br>
<h4>Spring Cloud Bus</h4>
<strong>Spring Cloud Bus</strong> links a Config Server to a lightweight message broker (RabbitMQ/Kafka); a single <code>/actuator/busrefresh</code> call broadcasts a "config changed" event to every connected service instance, which then re-reads its config live.<br>`,
                codeExamples: [
                  `# One HTTP call refreshes ALL connected instances' config live:
# POST http://config-server:8888/actuator/busrefresh
# (illustrative - actual effect is distributed and asynchronous, not deterministic Java output)`
                ]
              }
            ],
            expert: [
              {
                content: `<h3>Alternative: A Watched Distributed Key-Value Store</h3>
Instead of a message-bus broadcast, some systems use a distributed key-value store like <strong>etcd</strong>, <strong>Consul</strong>, or <strong>ZooKeeper</strong> - services "watch" specific keys, and the store pushes a notification to every watcher the instant a value changes, without needing a separate broker in the mix.<br>`
              },
              {
                content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does Distributed Configuration differ from just using a Config Server?</td><td>A Config Server typically serves config once at startup; Distributed Configuration is specifically about pushing live CHANGES to already-running instances</td></tr>
<tr class='text-center'><td>What does Spring Cloud Bus add on top of Spring Cloud Config Server?</td><td>A message-broker-backed broadcast mechanism (/actuator/busrefresh) that notifies all connected instances of a config change at once</td></tr>
<tr class='text-center'><td>Name a distributed key-value store alternative to a bus-based approach.</td><td>etcd, Consul, or ZooKeeper - using their "watch" capability on specific keys</td></tr>
</table>`
              }
            ]
          }

        ]
      }
    ],
    cheatNotes: [
      'Externalized Configuration - keep config OUT of compiled code (Twelve-Factor Factor III)',
      'Health Check - /actuator/health tells load balancers/orchestrators if an instance is OK',
      'Liveness probe = restart me?, Readiness probe = send me traffic?',
      'Service Mesh - sidecar proxies (Envoy for Istio, a Rust proxy for Linkerd) handle retries/mTLS/observability outside app code',
      'Configuration Server (Spring Cloud Config) - centrally SERVES config to many services',
      'Centralized Logging (ELK/EFK) - aggregate logs since instances are ephemeral',
      'Distributed Tracing - one traceId follows a request across every microservice hop',
      'Auto Scaling (K8s HPA) - adjusts instance count to real-time load automatically',
      'Graceful Shutdown - finish in-flight requests before exiting on SIGTERM',
      'Leader Election - exactly one instance owns a task among many replicas',
      'Distributed Configuration - propagates live config CHANGES to running instances, not just at startup'
    ],
    interviewQuestions: [
      {
        company: 'General',
        questions: [
          'What is the Twelve-Factor App principle behind Externalized Configuration?',
          'What is the difference between a liveness probe and a readiness probe in Kubernetes?',
          'What does a service mesh sidecar proxy actually do?',
          'How does a Configuration Server relate to Externalized Configuration?',
          'Why is centralized logging necessary in a cloud-native, auto-scaled environment?',
          'What is a trace ID and what problem does distributed tracing solve?',
          'What metric does Kubernetes HorizontalPodAutoscaler commonly scale on?',
          'Why does Graceful Shutdown matter during routine deploys and scale-down events?',
          'What problem does Leader Election solve for scheduled jobs running on multiple replicas?',
          'How does Distributed Configuration differ from a plain Configuration Server?'
        ]
      }
    ]
  }
];
