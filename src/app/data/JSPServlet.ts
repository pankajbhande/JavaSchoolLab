// The content model used to be redeclared in this file. It now lives in ./types so all
// 29 data files share one definition; re-exported here so existing imports keep working.
import type { ContentBlock, Topic, SubTopic, Course } from './types';
export type { ContentBlock, Topic, SubTopic, Course };

export const JSPServlets: Course[] = [

    {
        id: 'jsp-servlet',
        name: 'JSP Servlets',
        icon: 'jsp-servlets_icon_png',
        subTopics: [

            {
                id: 'introservlets',
                name: 'Intro to Web & Servlets',
                topics: [
                    {
                        id: "web-architecture-client-server",
                        name: "Web Architecture (Client–Server Model)",

                        beginner: [
                            {
                                content: `
<h2>What is Web Architecture?</h2>
<p>• Web architecture defines how different components of a web application interact with each other.</p><br>

<h3>Client–Server Model</h3>
<ul>
<li><strong>• Client:</strong> Browser or mobile app that sends requests.</li>
<li><strong>• Server:</strong> Machine that processes requests and sends responses.</li>
</ul><br>

<h3>How It Works</h3>
<ol>
<li>• User enters URL in browser.</li>
<li>• Browser sends HTTP request to server.</li>
<li>• Server processes request.</li>
<li>• Server sends HTTP response.</li>
<li>• Browser displays the result.</li>
</ol><br>

<h3>Example</h3>
<p>• You open <strong>www.google.com</strong>. Your browser (client) sends request to Google server. Server responds with HTML page.</p>`
                            },
                            {
                                content: `
<h3>HTTP Request & Response</h3>
<ul>
<li><strong>• Request:</strong> Sent by client (GET, POST, PUT, DELETE)</li>
<li><strong>• Response:</strong> Sent by server (Status code + Data)</li>
</ul><br>

<h4>Status Codes</h4>
<ul>
<li>• 200 – Success</li>
<li>• 404 – Not Found</li>
<li>• 500 – Server Error</li>
</ul>
`,
                                codeExamples: [
                                    `// Example HTTP GET request
GET /users HTTP/1.1
Host: example.com`,
                                    `// Example HTTP Response
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "name": "Ashish"
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>3-Tier Architecture</h2>
<p>Most modern web apps use 3 layers:</p>

<ul>
<li><strong>• Presentation Layer:</strong> Frontend (React, Angular)</li>
<li><strong>• Business Logic Layer:</strong> Backend (Spring Boot, .NET)</li>
<li><strong>• Data Layer:</strong> Database (MySQL, MongoDB)</li>
</ul>

<p>This separation improves maintainability and scalability.</p>
`
                            },
                            {
                                content: `
<h3>Stateless vs Stateful</h3>
<ul>
<li><strong>• Stateless:</strong> Each request is independent (REST APIs).</li>
<li><strong>• Stateful:</strong> Server stores session data.</li>
</ul><br>

<h3>REST Architecture</h3>
<ul>
<li>• Uses HTTP methods properly.</li>
<li>• Stateless communication.</li>
<li>• Resource-based URLs.</li>
</ul>
`,
                                codeExamples: [
                                    `// REST API example (Spring Boot)
@GetMapping("/products/{id}")
public Product getProduct(@PathVariable Long id) {
    return productService.findById(id);
}`
                                ]
                            },
                            {
                                content: `
<h3>Middleware Concept</h3>
<p>• Middleware acts between request and response.</p>
<ul>
<li>• Authentication middleware</li>
<li>• Logging middleware</li>
<li>• Error handling middleware</li>
</ul><br>
<p>Example: In Spring Boot, filters and interceptors act as middleware.</p>
`
                            },
                            {
                                content: `
<h3>Session Management</h3>
<ul>
<li>• Cookies</li>
<li>• Session ID</li>
<li>• JWT Token</li>
</ul>

<p>JWT is commonly used in modern stateless applications.</p>
`,
                                codeExamples: [
                                    `// Example JWT Authorization Header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
                                ]
                            },
                            {
                                content: `
<h3>Client-Side Rendering vs Server-Side Rendering</h3>
<ul>
<li>• <strong>CSR:</strong> Rendering happens in browser (React).</li>
<li>• <strong>SSR:</strong> Rendering happens on server (Next.js).</li>
</ul>

<p>SSR improves SEO and initial load performance.</p>
`
                            },
                            {
                                content: `
<h3>Database Connection Flow</h3>
<p>App Server communicates with database using:</p>
<ul>
<li>• Connection Pool</li>
<li>• ORM (Hibernate, Entity Framework)</li>
</ul>

<p>Connection pooling improves performance.</p>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Microservices Architecture</h2>
<p>• Instead of one big server (Monolith), application is divided into small independent services.</p><br>

<h3>Advantages</h3>
<ul>
<li>• Independent deployment</li>
<li>• Scalable services</li>
<li>• Better fault isolation</li>
</ul><br>

<h3>Challenges</h3>
<ul>
<li>• Service communication (REST, gRPC)</li>
<li>• Distributed transactions</li>
<li>• Monitoring & logging</li>
</ul>
`
                            },
                            {
                                content: `
<h3>API Gateway Pattern</h3>
<p>• Single entry point for all client requests in microservices architecture.</p>

<ul>
<li>• Authentication</li>
<li>• Rate limiting</li>
<li>• Request routing</li>
<li>• Load balancing</li>
</ul>
`
                            },
                            {
                                content: `
<h3>Event-Driven Architecture</h3>
<p>• Services communicate via events using message brokers.</p>
<ul>
<li>• Kafka</li>
<li>• RabbitMQ</li>
<li>• ActiveMQ</li>
</ul>
<p>• Improves scalability and decouples services.</p>
`,
                                codeExamples: [
                                    `// Example: Publishing event (Pseudo code)
eventPublisher.publish("order-created", orderData);`
                                ]
                            },
                            {
                                content: `
<h3>Distributed Systems Concepts</h3>
<ul>
<li>• CAP Theorem (Consistency, Availability, Partition Tolerance)</li>
<li>• Eventual Consistency</li>
<li>• Circuit Breaker Pattern</li>
</ul>
<p>• Tools: Resilience4j, Hystrix</p>
`
                            },
                            {
                                content: `
<h3>Containerization & Deployment</h3>
<ul>
<li>• Docker for containerization</li>
<li>• Kubernetes for orchestration</li>
<li>• CI/CD pipelines for automated deployment</li>
</ul>
`,
                                codeExamples: [
                                    `# Example Dockerfile
FROM openjdk:17
COPY target/app.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]`
                                ]
                            },
                            {
                                content: `
<h3>Advanced Caching Strategies</h3>
<ul>
<li>• Cache Aside Pattern</li>
<li>• Write Through Cache</li>
<li>• Distributed Cache (Redis Cluster)</li>
</ul>
`
                            },
                            {
                                content: `
<h3>Security in Distributed Architecture</h3>
<ul>
<li>• OAuth 2.0</li>
<li>• OpenID Connect</li>
<li>• API Rate Limiting</li>
<li>• Zero Trust Architecture</li>
</ul>
<p>• Security must be applied at every layer.</p>
`
                            },
                            {
                                content: `
<h3>Observability & Monitoring</h3>
<ul>
<li>• Centralized Logging (ELK Stack)</li>
<li>• Metrics Monitoring (Prometheus, Grafana)</li>
<li>• Distributed Tracing (Jaeger, Zipkin)</li>
</ul>
<p>• Helps identify bottlenecks and failures in distributed systems.</p>
`
                            }
                        ]

                    },

                    {
                        id: "http-https-basics",
                        name: "HTTP & HTTPS Basics",

                        beginner: [
                            {
                                content: `
<h2>What is HTTP?</h2>
<p><strong>• HTTP (HyperText Transfer Protocol)</strong> is a communication protocol used between client (browser) and server.</p>

<ul>
<li>• It is used to transfer web pages.</li>
<li>• Works on Port 80 by default.</li>
<li>• It is stateless (each request is independent).</li>
</ul><br>

<h3>How HTTP Works</h3>
<ol>
<li>• Client sends HTTP request.</li>
<li>• Server processes request.</li>
<li>• Server sends HTTP response.</li>
</ol>
`
                            },
                            {
                                content: `
<h2>What is HTTPS?</h2>
<p><strong>• HTTPS (HyperText Transfer Protocol Secure)</strong> is the secure version of HTTP.</p>

<ul>
<li>• Uses SSL/TLS encryption.</li>
<li>• Works on Port 443.</li>
<li>• Encrypts data between client and server.</li>
</ul>
<p>• HTTPS protects sensitive data like passwords, credit card details.</p>
`
                            },
                            {
                                content: `
<h3>HTTP vs HTTPS (Basic Difference)</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>HTTP</th>
<th>HTTPS</th>
</tr>
<tr>
<td>Not Secure</td>
<td>Secure (Encrypted)</td>
</tr>
<tr>
<td>Port 80</td>
<td>Port 443</td>
</tr>
<tr>
<td>No Encryption</td>
<td>Uses SSL/TLS</td>
</tr>
</table>
`
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>HTTP Request Structure</h2>
<ul>
<li><strong>• Request Line</strong> (GET /index.html HTTP/1.1)</li>
<li><strong>• Headers</strong> (Content-Type, Authorization)</li>
<li><strong>• Body</strong> (Data for POST/PUT requests)</li>
</ul>
`,
                                codeExamples: [
                                    `POST /login HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "email": "ashish@gmail.com",
  "password": "123456"
}`
                                ]
                            },
                            {
                                content: `
<h2>HTTP Response Structure</h2>
<ul>
<li>• Status Line (HTTP/1.1 200 OK)</li>
<li>• Headers</li>
<li>• Body</li>
</ul><br>

<h3>Common Status Codes</h3>
<ul>
<li>• 200 – OK</li>
<li>• 201 – Created</li>
<li>• 400 – Bad Request</li>
<li>• 401 – Unauthorized</li>
<li>• 404 – Not Found</li>
<li>• 500 – Internal Server Error</li>
</ul>
`,
                                codeExamples: [
                                    `HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "Login successful"
}`
                                ]
                            },
                            {
                                content: `
<h2>SSL/TLS Handshake (HTTPS Working)</h2>
<p>When using HTTPS:</p>
<ol>
<li>• Client sends request to server.</li>
<li>• Server sends SSL certificate.</li>
<li>• Client verifies certificate.</li>
<li>• Encryption key is generated.</li>
<li>• Secure communication begins.</li>
</ol>
`
                            },
                            {
                                content: `
<h3>HTTP Methods</h3>
<ul>
<li>• GET – Retrieve data</li>
<li>• POST – Send data</li>
<li>• PUT – Update data</li>
<li>• DELETE – Remove data</li>
<li>• PATCH – Partial update</li>
</ul>
`
                            },
                            {
                                content: `
<h2>HTTP Headers Deep Dive</h2>
<p>• Headers provide additional information about the request or response.</p><br>

<h3>Important Request Headers</h3>
<ul>
<li><strong>• Authorization</strong></li>
<li><strong>• Content-Type</strong></li>
<li><strong>• Accept</strong></li>
<li><strong>• User-Agent</strong></li>
<li><strong>• Cookie</strong></li>
</ul><br>

<h3>Important Response Headers</h3>
<ul>
<li><strong>• Set-Cookie</strong></li>
<li><strong>• Cache-Control</strong></li>
<li><strong>• Location</strong></li>
<li><strong>• Content-Encoding</strong></li>
</ul>
`,
                                codeExamples: [
                                    `GET /profile HTTP/1.1
Host: example.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
                                ]
                            },
                            {
                                content: `
<h2>Cookies & Sessions</h2>
<ul>
<li>• Cookies store small data in browser.</li>
<li>• Session ID is stored in cookie.</li>
<li>• Server maintains session data.</li>
</ul>
<p>• Modern apps use JWT instead of traditional sessions.</p>
`,
                                codeExamples: [
                                    `Set-Cookie: JSESSIONID=ABC123; HttpOnly; Secure`
                                ]
                            },
                            {
                                content: `
<h2>CORS (Cross-Origin Resource Sharing)</h2>
<p>• CORS controls which domains can access your API.</p>
<ul>
<li>• Prevents unauthorized cross-origin requests.</li>
<li>• Uses headers like Access-Control-Allow-Origin.</li>
</ul>
`,
                                codeExamples: [
                                    `Access-Control-Allow-Origin: https://myfrontend.com`
                                ]
                            },
                            {
                                content: `
<h2>Idempotent vs Non-Idempotent Methods</h2>
<ul>
<li><strong>• Idempotent:</strong> GET, PUT, DELETE (multiple calls same result)</li>
<li><strong>• Non-Idempotent:</strong> POST (creates new resource each time)</li>
</ul>
<p>This concept is important in REST API design.</p>
`
                            },
                            {
                                content: `
<h2>HTTP Caching Mechanism</h2>
<ul>
<li>• ETag</li>
<li>• Last-Modified</li>
<li>• Cache-Control</li>
<li>• Expires</li>
</ul>
<p>• Caching reduces server load and improves performance.</p>
`,
                                codeExamples: [
                                    `Cache-Control: public, max-age=3600`
                                ]
                            }

                        ],

                        expert: [
                            {
                                content: `
<h2>HTTP Versions</h2>
<ul>
<li><strong>• HTTP/1.1:</strong> Text-based, supports persistent connections.</li>
<li><strong>• HTTP/2:</strong> Binary protocol, multiplexing, header compression.</li>
<li><strong>• HTTP/3:</strong> Uses QUIC (UDP-based), faster and more secure.</li>
</ul>
<p>• HTTP/2 and HTTP/3 improve performance significantly.</p>
`
                            },
                            {
                                content: `
<h2>Advanced HTTPS Security Concepts</h2>
<ul>
<li>• Symmetric Encryption</li>
<li>• Asymmetric Encryption</li>
<li>• Public Key Infrastructure (PKI)</li>
<li>• Certificate Authorities (CA)</li>
<li>• Digital Signatures</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Security Attacks Related to HTTP</h2>
<ul>
<li>• Man-in-the-Middle (MITM)</li>
<li>• SSL Stripping</li>
<li>• Session Hijacking</li>
<li>• Cross-Site Scripting (XSS)</li>
</ul>
<p>• HTTPS helps prevent many of these attacks.</p>
`
                            },
                            {
                                content: `
<h2>HSTS (HTTP Strict Transport Security)</h2>
<p>• HSTS forces browsers to use HTTPS only.</p>
<p>• This prevents downgrade attacks and improves security.</p>
`,
                                codeExamples: [
                                    `Strict-Transport-Security: max-age=31536000; includeSubDomains`
                                ]
                            },
                            {
                                content: `
<h2>Performance Optimization in HTTP</h2>
<ul>
<li>• Keep-Alive Connections</li>
<li>• Compression (Gzip, Brotli)</li>
<li>• CDN Usage</li>
<li>• HTTP Caching Headers (ETag, Cache-Control)</li>
</ul>
`
                            },
                            {
                                content: `
<h2>TLS Encryption Internals</h2>
<p>• HTTPS uses both asymmetric and symmetric encryption:</p>
<ul>
<li>• Asymmetric encryption for key exchange.</li>
<li>• Symmetric encryption for data transfer.</li>
</ul>
<p>• This ensures both security and performance.</p>
`
                            },
                            {
                                content: `
<h2>Certificate Types</h2>
<ul>
<li>• Domain Validation (DV)</li>
<li>• Organization Validation (OV)</li>
<li>• Extended Validation (EV)</li>
<li>• Wildcard Certificates</li>
<li>• Self-Signed Certificates</li>
</ul>
<p>• Production systems should use CA-issued certificates.</p>
`
                            },
                            {
                                content: `
<h2>Mutual TLS (mTLS)</h2>
<p>• Both client and server authenticate each other using certificates.</p>
<ul>
<li>• Used in microservices architecture</li>
<li>• Enhances security in internal APIs</li>
</ul>
`
                            },
                            {
                                content: `
<h2>HTTP/2 Advanced Features</h2>
<ul>
<li>• Multiplexing (multiple requests in single connection)</li>
<li>• Header compression (HPACK)</li>
<li>• Server Push</li>
</ul>
<p>• Improves latency and performance significantly.</p>
`
                            },
                            {
                                content: `
<h2>QUIC & HTTP/3</h2>
<ul>
<li>• Uses UDP instead of TCP</li>
<li>• Faster handshake</li>
<li>• Built-in encryption</li>
</ul>
<p>• Reduces connection establishment time.</p>
`
                            },
                            {
                                content: `
<h2>Security Best Practices</h2>
<ul>
<li>• Always redirect HTTP → HTTPS</li>
<li>• Use HSTS</li>
<li>• Enable Secure & HttpOnly cookies</li>
<li>• Disable weak TLS versions</li>
<li>• Use strong cipher suites</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Common Real-World Production Setup</h2>
<p>• Client → CDN → Load Balancer → Reverse Proxy (Nginx) → App Server → Database</p>

<ul>
<li>• SSL termination at Load Balancer</li>
<li>• Internal traffic secured with mTLS</li>
<li>• WAF (Web Application Firewall) protection</li>
</ul>
`
                            }

                        ]
                    },

                    {
                        id: "http-request-response-cycle",
                        name: "HTTP Request & Response Cycle",

                        beginner: [
                            {
                                content: `
<h2>Introduction to HTTP Request–Response Cycle</h2>
<p>• The HTTP Request–Response cycle is the communication process between a client (browser) and a server.</p>
<p>• Every time you open a website, this cycle happens behind the scenes.</p><br>

<h3>Basic Steps</h3>
<ol>
<li>• User enters URL</li>
<li>• Browser sends HTTP request</li>
<li>• Server processes request</li>
<li>• Server sends HTTP response</li>
<li>• Browser renders content</li>
</ol>
`,
                                codeExamples: [
                                    `// Simple Fetch API Example (Browser Request)
fetch("https://api.example.com/products")
  .then(response => response.json())
  .then(data => console.log(data));`
                                ]
                            },
                            {
                                content: `
<h2>Understanding HTTP Request</h2>
<p>• An HTTP request is sent by the client to ask for data or perform an action.</p>
<ul>
<li><strong>• Method</strong> – GET, POST, PUT, DELETE</li>
<li><strong>• URL</strong> – Resource path</li>
<li><strong>• Headers</strong> – Metadata</li>
<li><strong>• Body</strong> – Data (for POST/PUT)</li>
</ul>
`,
                                codeExamples: [
                                    `POST /login HTTP/1.1
Host: example.com
Content-Type: application/json

{
  "email": "user@gmail.com",
  "password": "123456"
}`
                                ]
                            },
                            {
                                content: `
<h2>Understanding HTTP Response</h2>
<p>• The server sends a response after processing the request.</p>

<ul>
<li>• Status Code</li>
<li>• Response Headers</li>
<li>• Response Body</li>
</ul>
`,
                                codeExamples: [
                                    `HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "abc123xyz"
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>DNS Resolution</h2>
<p>• Before sending request, browser converts domain name into IP address using DNS.</p>
<p>Example: example.com → 93.184.216.34</p>
`,
                                codeExamples: [
                                    `// Check DNS via command line
nslookup example.com`
                                ]
                            },
                            {
                                content: `
<h2>TCP Connection (3-Way Handshake)</h2>
<p>• Before HTTP data transfer, TCP connection is established.</p>
<ul>
<li>• SYN</li>
<li>• SYN-ACK</li>
<li>• ACK</li>
</ul>
`,
                                codeExamples: [
                                    `// View open TCP connections
netstat -an | find "443"`
                                ]
                            },
                            {
                                content: `
<h2>Server-Side Processing Flow</h2>
<p>• Once request reaches server:</p>
<ul>
<li>• Passes through Filters</li>
<li>• Authentication check</li>
<li>• Controller handles request</li>
<li>• Service executes logic</li>
<li>• Database interaction</li>
</ul>
`,
                                codeExamples: [
                                    `// Spring Boot Controller Example
@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Database Interaction</h2>
<p>• Application server communicates with database to fetch/store data.</p>
`,
                                codeExamples: [
                                    `// JPA Repository Example
public interface UserRepository 
       extends JpaRepository<User, Long> {

}`
                                ]
                            },
                            {
                                content: `
<h2>Browser Rendering Process</h2>
<p>• After receiving response:</p>
<ul>
<li>• Parse HTML</li>
<li>• Build DOM</li>
<li>• Load CSS</li>
<li>• Execute JavaScript</li>
<li>• Render page</li>
</ul>
`,
                                codeExamples: [
                                    `<!DOCTYPE html>
<html>
<body>
  <h1>Hello World</h1>
  <script>
    console.log("Page Loaded");
  </script>
</body>
</html>`
                                ]
                            },
                            {
                                content: `
<h2>State Management in HTTP</h2>
<p>• HTTP is stateless, so sessions or tokens maintain state.</p>
`,
                                codeExamples: [
                                    `// Example Cookie Header
Set-Cookie: sessionId=abc123; HttpOnly; Secure`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>HTTPS & TLS Handshake</h2>
<p>• For secure communication:</p>
<ol>
<li>• Client Hello</li>
<li>• Server Hello</li>
<li>• Certificate exchange</li>
<li>• Key exchange</li>
<li>• Encrypted communication</li>
</ol>
`,
                                codeExamples: [
                                    `// Check SSL certificate
openssl s_client -connect example.com:443`
                                ]
                            },
                            {
                                content: `
<h2>Reverse Proxy Architecture</h2>
<p>• Production flow:</p>
<p>• Client → CDN → Load Balancer → Nginx → App Server → DB</p>
`,
                                codeExamples: [
                                    `# Nginx Reverse Proxy
server {
    listen 80;
    location / {
        proxy_pass http://localhost:8080;
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>HTTP/2 & Multiplexing</h2>
<p>• HTTP/2 allows multiple parallel requests over single connection.</p>
`,
                                codeExamples: [
                                    `# Enable HTTP/2 in Nginx
listen 443 ssl http2;`
                                ]
                            },
                            {
                                content: `
<h2>Distributed Tracing</h2>
<p>• Each request carries unique Trace ID across microservices.</p>
`,
                                codeExamples: [
                                    `// Example Request Header
X-Trace-Id: 9f8d7a6b`
                                ]
                            },
                            {
                                content: `
<h2>Rate Limiting & Security</h2>
<p>• Protect API from abuse by limiting requests.</p>
`,
                                codeExamples: [
                                    `// Express Rate Limit Example
const rateLimit = require("express-rate-limit");
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));`
                                ]
                            },
                            {
                                content: `
<h2>Performance Optimization</h2>
<p>• Improve request speed using:</p>
<ul>
<li>• Caching</li>
<li>• Keep-Alive</li>
<li>• Compression (Gzip)</li>
</ul>
`,
                                codeExamples: [
                                    `// Enable Gzip in Spring Boot (application.properties)
server.compression.enabled=true`
                                ]
                            }
                        ]
                    },

                    {
                        id: "web-servers-tomcat-glassfish",
                        name: "Web Servers (Tomcat, GlassFish)",

                        beginner: [
                            {
                                content: `
<h2>What is a Web Server?</h2>
<p>• A Web Server is a software that handles HTTP requests from clients (like browsers) and sends back responses (HTML, JSON, etc.).</p><br>

<h3>What is Apache Tomcat?</h3>
<ul>
<li>• Open-source Java Servlet container</li>
<li>• Used to run Java web applications</li>
<li>• Supports Servlets and JSP</li>
</ul><br>

<h3>What is GlassFish?</h3>
<ul>
<li>• Full Java EE Application Server</li>
<li>• Supports Servlets, JSP, EJB, JPA, JMS</li>
<li>• More advanced than Tomcat</li>
</ul><br>

<h3>Tomcat vs GlassFish (Basic Difference)</h3>
<ul>
<li>• Tomcat → Lightweight, Servlet & JSP container</li>
<li>• GlassFish → Full Java EE server</li>
</ul>
`
                            },
                            {
                                content: `
<h2>How Web Server Works</h2>
<ol>
<li>• Client sends HTTP request</li>
<li>• Server processes request</li>
<li>• Servlet handles logic</li>
<li>• Response sent back to client</li>
</ol>
`
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Tomcat Architecture</h2>
<ul>
<li>• Connector → Handles HTTP requests</li>
<li>• Engine → Processes requests</li>
<li>• Host → Represents virtual host</li>
<li>• Context → Represents web application</li>
</ul><br>

<h2>Directory Structure (Tomcat)</h2>
<ul>
<li>• bin → Startup/Shutdown scripts</li>
<li>• conf → Configuration files</li>
<li>• webapps → Deploy applications here</li>
<li>• logs → Log files</li>
</ul>
`,
                                codeExamples: [
                                    `# Start Tomcat (Windows)
startup.bat

# Stop Tomcat
shutdown.bat`
                                ]
                            },
                            {
                                content: `
<h2>Deployment in Tomcat</h2>
<p>• Applications are deployed as WAR (Web Archive) files.</p>

<h3>Steps:</h3>
<ol>
<li>• Create WAR file</li>
<li>• Place inside webapps folder</li>
<li>• Start server</li>
<li>• Access using http://localhost:8080/appName</li>
</ol>
`,
                                codeExamples: [
                                    `<!-- web.xml example -->
<web-app>
  <servlet>
    <servlet-name>HelloServlet</servlet-name>
    <servlet-class>com.example.HelloServlet</servlet-class>
  </servlet>

  <servlet-mapping>
    <servlet-name>HelloServlet</servlet-name>
    <url-pattern>/hello</url-pattern>
  </servlet-mapping>
</web-app>`
                                ]
                            },
                            {
                                content: `
<h2>GlassFish Features</h2>
<ul>
<li>• Admin Console (GUI)</li>
<li>• Supports EJB, JPA, JMS</li>
<li>• Clustering support</li>
<li>• Built-in security</li>
</ul>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Performance Tuning (Tomcat)</h2>
<ul>
<li>• Increase maxThreads in server.xml</li>
<li>• Configure connectionTimeout</li>
<li>• Enable compression</li>
<li>• Use connection pooling</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- server.xml Connector configuration -->
<Connector port="8080"
           protocol="HTTP/1.1"
           maxThreads="200"
           connectionTimeout="20000"
           redirectPort="8443" />`
                                ]
                            },
                            {
                                content: `
<h2>Clustering & Load Balancing</h2>
<p>• Used for high availability and scalability.</p>
<ul>
<li>• Multiple server instances</li>
<li>• Session replication</li>
<li>• Load balancer distributes traffic</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Security Configuration</h2>
<ul>
<li>• HTTPS configuration (SSL)</li>
<li>• Role-based authentication</li>
<li>• Realm configuration</li>
<li>• Security constraints in web.xml</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- Security Constraint Example -->
<security-constraint>
  <web-resource-collection>
    <web-resource-name>Protected</web-resource-name>
    <url-pattern>/admin/*</url-pattern>
  </web-resource-collection>
  <auth-constraint>
    <role-name>admin</role-name>
  </auth-constraint>
</security-constraint>`
                                ]
                            }
                        ]
                    },

                    {
                        id: 'jsp-intro',
                        name: 'Introduction to Servlets',

                        beginner: [
                            {
                                content: `
                <h3>What is a Servlet?</h3>
                <p>• A <strong>Servlet</strong> is a Java program that runs on a web server and handles client requests.</p>
                <p>• Servlets are used to generate dynamic web content (HTML, JSON, XML).</p>
                <p>• They extend <code>HttpServlet</code> class.</p>
            `
                            },
                            {
                                content: `
                <h3>Why Servlets?</h3>
                <p>• Platform-independent, runs on any server with JVM.</p>
                <p>• Faster than CGI because servlet runs inside server JVM.</p>
                <p>• Can handle multiple requests using threads.</p>
            `
                            },
                            {
                                content: `
                <h3>Servlet Architecture (Beginner)</h3>
                <p>• Client sends HTTP request to server.</p>
                <p>• Server processes request using servlet.</p>
                <p>• Servlet generates dynamic response (HTML/JSON).</p>
                <p>• Response sent back to client.</p>
            `
                            }
                        ],

                        intermediate: [
                            {
                                content: `
                <h3>Servlet API & Packages</h3>
                <p>• javax.servlet / jakarta.servlet – core servlet API.</p>
                <p>• javax.servlet.http – HTTP specific classes.</p>
                <p>• ServletRequest / ServletResponse – to read/write data.</p>
                <p>• HttpServletRequest / HttpServletResponse – handle HTTP requests.</p>
            `
                            },
                            {
                                content: `
                <h3>Servlet Life Cycle (Intermediate)</h3>
                <p>• <code>init()</code> – called once when servlet loads.</p>
                <p>• <code>service()</code> – called for every request.</p>
                <p>• <code>doGet()</code> / <code>doPost()</code> – handle GET/POST.</p>
                <p>• <code>destroy()</code> – called once before servlet is unloaded.</p>
            `
                            },
                            {
                                content: `
                <h3>Servlet Configuration</h3>
                <p>• Using <code>web.xml</code> deployment descriptor.</p>
                <p>• Using <code>@WebServlet</code> annotation.</p>
            `
                            },
                            {
                                content: `
                <h3>Servlet Example (Simple)</h3>
            `,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.*;

@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<h1>Hello, Servlet!</h1>");
    }
}`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
                <h3>Servlets in Enterprise Applications</h3>
                <p>• Used as Controller in MVC pattern.</p>
                <p>• Integrates with JSP/HTML as View.</p>
                <p>• Business logic in Java classes (Model).</p>
            `
                            },
                            {
                                content: `
                <h3>Multithreading & Thread Safety</h3>
                <p>• Servlets handle multiple requests using threads.</p>
                <p>• Shared resources must be synchronized to avoid race conditions.</p>
            `
                            },
                            {
                                content: `
                <h3>Servlet Performance & Optimization</h3>
                <p>• Connection pooling for database access.</p>
                <p>• Efficient resource handling.</p>
                <p>• Proper exception handling & logging.</p>
                <p>• Load balancing in production.</p>
            `
                            },
                            {
                                content: `
                <h3>Advanced Servlet Concepts</h3>
                <p>• Filters – intercept requests/responses.</p>
                <p>• Listeners – track events like session creation.</p>
                <p>• Handling REST APIs & JSON responses.</p>
                <p>• Security – authentication, authorization, HTTPS.</p>
            `
                            }
                        ]

                    },

                    {
                        id: "servlet-api-lifecycle",
                        name: "Servlet API & Lifecycle",

                        beginner: [
                            {
                                content: `
<h2>What is Servlet?</h2>
<p>• A Servlet is a Java class used to handle client requests and generate dynamic web content.</p>
<br>
<h3>Servlet API Packages</h3>
<ul>
<li>• jakarta.servlet</li>
<li>• jakarta.servlet.http</li>
</ul><br>

<h3>Main Interfaces & Classes</h3>
<ul>
<li>• Servlet</li>
<li>• GenericServlet</li>
<li>• HttpServlet</li>
<li>• HttpServletRequest</li>
<li>• HttpServletResponse</li>
<li>• ServletConfig</li>
<li>• ServletContext</li>
</ul><br>

<h2>Servlet Lifecycle Methods</h2>
<ol>
<li><strong>• init()</strong> → Called once when servlet is created</li>
<li><strong>• service()</strong> → Called for each request</li>
<li><strong>• destroy()</strong> → Called once before servlet is removed</li>
</ol>
`
                            },
                            {
                                content: `
<h2>Lifecycle Flow</h2>
<ol>
<li>• Servlet class loaded</li>
<li>• Object created</li>
<li>• init() method called</li>
<li>• service() handles requests</li>
<li>• destroy() called when server stops</li>
</ol>
`,
                                codeExamples: [
                                    `import java.io.*;
import jakarta.servlet.*;
import jakarta.servlet.http.*;

public class HelloServlet extends HttpServlet {

  public void init() {
    System.out.println("Servlet Initialized");
  }

  protected void doGet(HttpServletRequest request,
                       HttpServletResponse response)
                       throws IOException {
    response.getWriter().println("Hello World");
  }

  public void destroy() {
    System.out.println("Servlet Destroyed");
  }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>HttpServlet Methods</h2>
<ul>
<li>• doGet()</li>
<li>• doPost()</li>
<li>• doPut()</li>
<li>• doDelete()</li>
<li>• doHead()</li>
</ul>
<p>• service() method internally calls doGet() or doPost() depending on request type.</p>
`
                            },
                            {
                                content: `
<h2>ServletConfig vs ServletContext</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Feature</th>
<th>ServletConfig</th>
<th>ServletContext</th>
</tr>

<tr>
<td>Scope</td>
<td>Per Servlet</td>
<td>Whole Application</td>
</tr>

<tr>
<td>Initialization Params</td>
<td>Yes</td>
<td>Yes</td>
</tr>

<tr>
<td>Shared Data</td>
<td>No</td>
<td>Yes</td>
</tr>
</table>
`,
                                codeExamples: [
                                    `// ServletConfig Example
public void init(ServletConfig config) throws ServletException {
   String value = config.getInitParameter("username");
}

// ServletContext Example
ServletContext context = getServletContext();
context.setAttribute("msg", "Hello");`
                                ]
                            },
                            {
                                content: `
<h2>Request & Response Objects</h2>
<ul>
<li>• HttpServletRequest → Used to read client data</li>
<li>• HttpServletResponse → Used to send response to client</li>
</ul><br>

<h3>Common Methods</h3>
<ul>
<li>• request.getParameter()</li>
<li>• request.getSession()</li>
<li>• response.getWriter()</li>
<li>• response.sendRedirect()</li>
</ul>
`,
                                codeExamples: [
                                    `String name = request.getParameter("username");
response.sendRedirect("success.jsp");`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Servlet Lifecycle Deep Explanation</h2>

<h3>1. init()</h3>
<p>• Called only once. Used for resource initialization like DB connection.</p>
<br>
<h3>2. service()</h3>
<p>• Handles multiple requests using multithreading. Not recommended to override directly in HttpServlet.</p>
<br>
<h3>3. destroy()</h3>
<p>• Used for cleanup activities like closing DB connections.</p>
`
                            },
                            {
                                content: `
<h2>Multithreading in Servlet</h2>
<p>• Servlet container creates one instance of servlet but multiple threads handle requests.</p>
<ul>
<li>• Avoid instance variables</li>
<li>• Use local variables inside methods</li>
<li>• Ensure thread safety</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Annotations vs web.xml</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Feature</th>
<th>Annotation</th>
<th>web.xml</th>
</tr>

<tr>
<td>Configuration</td>
<td>@WebServlet</td>
<td>XML based</td>
</tr>

<tr>
<td>Ease of Use</td>
<td>Easy</td>
<td>More configuration</td>
</tr>

<tr>
<td>Modern Usage</td>
<td>Recommended</td>
<td>Legacy projects</td>
</tr>
</table>
`,
                                codeExamples: [
                                    `import jakarta.servlet.annotation.WebServlet;

@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
   protected void doGet(HttpServletRequest request,
                        HttpServletResponse response)
                        throws IOException {
       response.getWriter().println("Hello");
   }
}`
                                ]
                            },
                            {
                                content: `
<h2>Interview Important Points</h2>
<ul>
<li>• Servlet lifecycle methods order</li>
<li>• Difference between GenericServlet & HttpServlet</li>
<li>• Difference between ServletConfig & ServletContext</li>
<li>• Is Servlet thread-safe?</li>
<li>• How container manages servlet lifecycle?</li>
</ul>
`
                            }
                        ]
                    },




                    //                     {
                    //                         id: "jsp-basics",
                    //                         name: "JSP Basics",
                    //                         beginner: [
                    //                             {
                    //                                 content: `
                    //                 <h3>What is JSP?</h3>
                    //                 <p>• JSP (JavaServer Pages) is a server-side technology used to create dynamic web pages.</p>
                    //                 <p>• Allows embedding Java code directly into HTML.</p>
                    //                 <p>• Runs on a servlet container (like Tomcat) and is compiled into a servlet internally.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>JSP vs Servlet</h3>
                    //                 <p>• JSP is easier for designing HTML pages with dynamic content.</p>
                    //                 <p>• Servlets are Java classes; JSP is HTML + Java.</p>
                    //                 <p>• JSP is internally converted to servlet by the server.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>JSP Life Cycle</h3>
                    //                 <p>• Translation – JSP is converted to servlet.</p>
                    //                 <p>• Compilation – Servlet class is compiled.</p>
                    //                 <p>• Initialization – <code>jspInit()</code> method is called.</p>
                    //                 <p>• Execution – <code>_jspService()</code> handles requests.</p>
                    //                 <p>• Destruction – <code>jspDestroy()</code> method is called.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>JSP Elements</h3>
                    //                 <p>• Scriptlet: <code>&lt;% Java code %&gt;</code></p>
                    //                 <p>• Expression: <code>&lt;%= expression %&gt;</code></p>
                    //                 <p>• Declaration: <code>&lt;%! variable/method %&gt;</code></p>
                    //                 <p>• Directives: <code>&lt;%@ page %&gt;, &lt;%@ include %&gt;, &lt;%@ taglib %&gt;</code></p>
                    //             `
                    //                             }
                    //                         ],

                    //                         intermediate: [
                    //                             {
                    //                                 content: `
                    //                 <h3>JSP Implicit Objects</h3>
                    //                 <p>• <code>request</code> – to get client data.</p>
                    //                 <p>• <code>response</code> – to send data to client.</p>
                    //                 <p>• <code>session</code> – track user session.</p>
                    //                 <p>• <code>application</code> – servlet context object.</p>
                    //                 <p>• <code>out</code> – PrintWriter to send response.</p>
                    //                 <p>• <code>config</code> – servlet config object.</p>
                    //                 <p>• <code>pageContext</code> – encapsulates page attributes.</p>
                    //                 <p>• <code>exception</code> – exception object in error page.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>JSP Directives</h3>
                    //                 <p>• Page directive – <code>&lt;%@ page language="java" contentType="text/html" %&gt;</code></p>
                    //                 <p>• Include directive – <code>&lt;%@ include file="header.jsp" %&gt;</code></p>
                    //                 <p>• Taglib directive – <code>&lt;%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %&gt;</code></p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>JSP Actions</h3>
                    //                 <p>• <code>&lt;jsp:useBean&gt;</code> – instantiate a JavaBean.</p>
                    //                 <p>• <code>&lt;jsp:setProperty&gt;</code> – set bean property.</p>
                    //                 <p>• <code>&lt;jsp:getProperty&gt;</code> – get bean property.</p>
                    //                 <p>• <code>&lt;jsp:include&gt;</code> – include another JSP dynamically.</p>
                    //                 <p>• <code>&lt;jsp:forward&gt;</code> – forward request to another resource.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>JSP Example</h3>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%@ page language="java" contentType="text/html; charset=UTF-8" %>
                    // <html>
                    // <head><title>JSP Example</title></head>
                    // <body>
                    // <%
                    //     String name = request.getParameter("name");
                    //     if (name != null) {
                    // %>
                    //     <h1>Hello, <%= name %>!</h1>
                    // <%
                    //     } else {
                    // %>
                    //     <h1>Hello, Guest!</h1>
                    // <%
                    //     }
                    // %>
                    // </body>
                    // </html>`
                    //                                 ]
                    //                             }
                    //                         ],

                    //                         expert: [
                    //                             {
                    //                                 content: `
                    //                 <h3>Expression Language (EL) Advanced</h3>
                    //                 <p>• Access nested properties: <code>${'user.name'}</code>.</p>
                    //                 <p>• Conditional operator: <code>${'condition ? trueValue : falseValue'}</code>.</p>
                    //                 <p>• Supports arithmetic and logical operations in JSP.</p>
                    //                 <p>• Scopes: pageScope, requestScope, sessionScope, applicationScope.</p>
                    //                 <p>• Best practice: use EL instead of scriptlets for maintainability.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>JSTL Advanced</h3>
                    //                 <p>• Core tags: <code>c:forEach</code> with varStatus for index, first/last.</p>
                    //                 <p>• Conditional tags: <code>c:if</code>, <code>c:choose / c:when / c:otherwise</code>.</p>
                    //                 <p>• Formatting tags: <code>fmt:formatNumber</code>, <code>fmt:formatDate</code>.</p>
                    //                 <p>• String functions: <code>fn:contains</code>, <code>fn:substring</code>.</p>
                    //                 <p>• Use JSTL + EL instead of Java code in JSP.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Custom Tag Libraries</h3>
                    //                 <p>• Create reusable components with <code>.tag</code> files or <code>SimpleTagSupport</code> classes.</p>
                    //                 <p>• Encapsulate logic like pagination, tables, menus.</p>
                    //                 <p>• Improves maintainability and reduces duplication.</p>
                    //                 <p>• Keep presentation and business logic separate.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Error Handling & Exception Management</h3>
                    //                 <p>• Configure error pages: <code>&lt;%@ page errorPage="error.jsp" %&gt;</code>.</p>
                    //                 <p>• Display exceptions carefully: <code>&lt;%= exception %&gt;</code> (avoid sensitive info).</p>
                    //                 <p>• Log errors and show user-friendly messages.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Performance Optimization</h3>
                    //                 <p>• Minimize scriptlets; use EL and JSTL.</p>
                    //                 <p>• Cache static resources (CSS/JS) and reduce JSP output size.</p>
                    //                 <p>• Include directive (<code>@include</code>) is compile-time, <code>jsp:include</code> is runtime.</p>
                    //                 <p>• Avoid creating objects inside JSP repeatedly; use scoped beans.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Security Best Practices</h3>
                    //                 <p>• Escape user input with JSTL <code>c:out</code> to prevent XSS.</p>
                    //                 <p>• Avoid exposing sensitive data in JSP.</p>
                    //                 <p>• Use HTTPS and secure cookies for session management.</p>
                    //                 <p>• Validate input server-side, never rely only on client validation.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Integration with Modern Java Web Apps</h3>
                    //                 <p>• JSP as View in MVC frameworks (Servlet, Spring MVC).</p>
                    //                 <p>• Can serve JSON/XML for AJAX calls via JSP or Servlets.</p>
                    //                 <p>• Combine JSP with JSTL & EL for clean server-side rendering.</p>
                    //                 <p>• Can integrate with frontend frameworks (React/Angular) for hybrid applications.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Advanced Session & State Management</h3>
                    //                 <p>• Use <code>sessionScope</code> EL to access session variables.</p>
                    //                 <p>• Manage session timeout carefully for security and UX.</p>
                    //                 <p>• Avoid storing large objects in session; use DB or caching layer.</p>
                    //                 <p>• Combine with cookies for persistent login.</p>
                    //             `
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Debugging & Logging</h3>
                    //                 <p>• Use server logs (Tomcat catalina.out) for error tracking.</p>
                    //                 <p>• JSTL <code>c:catch</code> tag can handle exceptions locally.</p>
                    //                 <p>• Remove debug prints in production.</p>
                    //                 <p>• Use logging frameworks (SLF4J, Log4j) for complex apps.</p>
                    //             `
                    //                             }
                    //                         ]
                    //                     },

                    //                     {
                    //                         id: "servlet-architecture",
                    //                         name: "Servlet Architecture",

                    //                         beginner: [
                    //                             {
                    //                                 content: `
                    // <h3>What is Servlet Architecture?</h3>
                    // <p>Servlet Architecture defines how a client request is processed by a web server and handled by a servlet inside a servlet container.</p>
                    // <br>
                    // <h4>Basic Flow:</h4>
                    // <ol>
                    // <li>• Client (Browser) sends HTTP Request</li>
                    // <li>• Web Server receives request</li>
                    // <li>• Servlet Container processes request</li>
                    // <li>• Servlet executes business logic</li>
                    // <li>• Response sent back to client</li>
                    // </ol>
                    // <br>
                    // <h4>Main Components:</h4>
                    // <ul>
                    // <li>• Client (Browser)</li>
                    // <li>• Web Server (Tomcat)</li>
                    // <li>• Servlet Container</li>
                    // <li>• Servlet</li>
                    // </ul>`
                    //                             }
                    //                         ],

                    //                         intermediate: [
                    //                             {
                    //                                 content: `
                    // <h3>Detailed Request Processing Flow</h3>
                    // <ol>
                    // <li>• Browser sends HTTP request.</li>
                    // <li>• Servlet Container checks URL mapping (web.xml or annotations).</li>
                    // <li>• If first request, servlet is loaded and instantiated.</li>
                    // <li>• <b>init()</b> method is called once.</li>
                    // <li>• <b>service()</b> method handles every request.</li>
                    // <li>• service() delegates to doGet(), doPost(), etc.</li>
                    // <li>• Response returned to client.</li>
                    // </ol>
                    // `
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Servlet Lifecycle Methods</h3>
                    // <ul>
                    // <li><b>init()</b> – Called once during initialization.</li>
                    // <li><b>service()</b> – Called for every client request.</li>
                    // <li><b>destroy()</b> – Called once before servlet removal.</li>
                    // </ul>
                    // `,
                    //                                 codeExamples: [
                    //                                     `public class LifeCycleServlet extends HttpServlet {

                    //     public void init() {
                    //         System.out.println("Servlet Initialized");
                    //     }

                    //     protected void doGet(HttpServletRequest request,
                    //                          HttpServletResponse response) {
                    //         System.out.println("Handling Request");
                    //     }

                    //     public void destroy() {
                    //         System.out.println("Servlet Destroyed");
                    //     }
                    // }`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Request and Response Objects</h3>
                    // <ul>
                    // <li>• HttpServletRequest – Contains client request data.</li>
                    // <li>• HttpServletResponse – Used to send response to client.</li>
                    // <li>• Supports headers, parameters, cookies, sessions.</li>
                    // </ul>
                    // `,
                    //                                 codeExamples: [
                    //                                     `String username = request.getParameter("username");
                    // response.setContentType("text/html");
                    // response.getWriter().println("Welcome " + username);`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Servlet Configuration</h3>
                    // <p>• Servlets can be configured using:</p>
                    // <ul>
                    // <li>• web.xml (Deployment Descriptor)</li>
                    // <li>• @WebServlet Annotation</li>
                    // </ul>
                    // `,
                    //                                 codeExamples: [
                    //                                     `@WebServlet("/hello")
                    // public class HelloServlet extends HttpServlet {
                    //     protected void doGet(HttpServletRequest req,
                    //                          HttpServletResponse resp) {
                    //         // logic here
                    //     }
                    // }`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Multithreading Model</h3>
                    // <p>• Servlet container creates only ONE servlet instance but handles multiple requests using separate threads.</p>
                    // <p>• Developers must avoid using instance variables for request-specific data.</p>

                    // <h4>Thread Safety Rules:</h4>
                    // <ul>
                    // <li>• Avoid instance variables</li>
                    // <li>• Use local variables inside methods</li>
                    // <li>• Synchronize only when required</li>
                    // </ul>
                    // `
                    //                             }
                    //                         ],

                    //                         expert: [
                    //                             {
                    //                                 content: `
                    // <h3>Internal Servlet Container Architecture (Tomcat)</h3>

                    // <p>Tomcat Internal Flow:</p>
                    // <ol>
                    // <li>• Client Request hits HTTP Connector</li>
                    // <li>• Connector passes request to Engine</li>
                    // <li>• Engine selects Host (Virtual Host)</li>
                    // <li>• Host selects Context (Web Application)</li>
                    // <li>• Servlet Mapping identifies correct servlet</li>
                    // <li>• Filter Chain executes</li>
                    // <li>• Target Servlet executes</li>
                    // <li>• Response returned via same chain</li>
                    // </ol>
                    // `
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Filter Chain Mechanism</h3>
                    // <p>Filters act as pre-processing and post-processing units.</p>

                    // <p>Execution Order:</p>
                    // <p>Client → Filter1 → Filter2 → Servlet → Filter2 → Filter1 → Client</p>
                    // `,
                    //                                 codeExamples: [
                    //                                     `@WebFilter("/*")
                    // public class LoggingFilter implements Filter {

                    //     public void doFilter(ServletRequest request,
                    //                          ServletResponse response,
                    //                          FilterChain chain)
                    //             throws IOException, ServletException {

                    //         System.out.println("Before Servlet");
                    //         chain.doFilter(request, response);
                    //         System.out.println("After Servlet");
                    //     }
                    // }`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Listeners in Architecture</h3>
                    // <ul>
                    // <li>• ServletContextListener – Application lifecycle monitoring</li>
                    // <li>• HttpSessionListener – Session lifecycle tracking</li>
                    // <li>• ServletRequestListener – Request lifecycle monitoring</li>
                    // </ul>
                    // `,
                    //                                 codeExamples: [
                    //                                     `@WebListener
                    // public class AppListener implements ServletContextListener {

                    //     public void contextInitialized(ServletContextEvent sce) {
                    //         System.out.println("Application Started");
                    //     }

                    //     public void contextDestroyed(ServletContextEvent sce) {
                    //         System.out.println("Application Stopped");
                    //     }
                    // }`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Enterprise Layered Architecture</h3>
                    // <p>• Large-scale applications follow layered architecture:</p>

                    // <ul>
                    // <li>• Presentation Layer (JSP/HTML)</li>
                    // <li>• Controller Layer (Servlet)</li>
                    // <li>• Service Layer (Business Logic)</li>
                    // <li>• DAO Layer (Database Logic)</li>
                    // <li>• Database</li>
                    // </ul>
                    // `
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Performance & Scalability</h3>
                    // <ul>
                    // <li>• Thread Pool Management</li>
                    // <li>• Connection Pooling (HikariCP, DBCP)</li>
                    // <li>• Load Balancing</li>
                    // <li>• Clustering & Session Replication</li>
                    // <li>• Caching Mechanisms</li>
                    // </ul>
                    // `
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Security Architecture</h3>
                    // <ul>
                    // <li>• Authentication (Form-based, Basic, OAuth)</li>
                    // <li>• Authorization (Role-based access control)</li>
                    // <li>• HTTPS Configuration</li>
                    // <li>• Input Validation</li>
                    // <li>• Preventing XSS & CSRF</li>
                    // </ul>
                    // `
                    //                             },
                    //                             {
                    //                                 content: `
                    // <h3>Asynchronous Processing (Servlet 3.0+)</h3>
                    // <p>Servlet supports async processing for long-running tasks without blocking request threads.</p>
                    // `,
                    //                                 codeExamples: [
                    //                                     `@WebServlet(urlPatterns="/async", asyncSupported=true)
                    // public class AsyncServlet extends HttpServlet {

                    //     protected void doGet(HttpServletRequest req,
                    //                          HttpServletResponse resp) {
                    //         AsyncContext asyncContext = req.startAsync();
                    //         asyncContext.start(() -> {
                    //             try {
                    //                 Thread.sleep(3000);
                    //                 asyncContext.getResponse()
                    //                     .getWriter()
                    //                     .write("Async Processing Done");
                    //                 asyncContext.complete();
                    //             } catch (Exception e) { }
                    //         });
                    //     }
                    // }`
                    //                                 ]
                    //                             }
                    //                         ]
                    //                     },

                    //                     {
                    //                         id: "servlet-lifecycle",
                    //                         name: "Servlet Lifecycle",

                    //                         beginner: [
                    //                             {
                    //                                 content: `
                    //                 <p>A <strong>Servlet</strong> is a Java program that runs on a web server and handles HTTP requests/responses.</p>
                    //                 <p>The <strong>Servlet lifecycle</strong> defines the stages a Servlet goes through from creation to destruction:</p>
                    //                 <ul>
                    //                     <li><strong>• Loading and Instantiation:</strong> Servlet class is loaded and an instance is created.</li>
                    //                     <li><strong>• Initialization (init()):</strong> Called once to initialize resources.</li>
                    //                     <li><strong>• Request Handling (service()):</strong> Called for every request. Delegates to doGet()/doPost().</li>
                    //                     <li><strong>• Destruction (destroy()):</strong> Called once before removing the servlet, for cleanup.</li>
                    //                 </ul>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `public void init() throws ServletException {
                    //     // initialization code
                    // }`,
                    //                                     `public void service(HttpServletRequest req, HttpServletResponse res)
                    //     throws ServletException, IOException {
                    //     // handle request
                    // }`,
                    //                                     `public void destroy() {
                    //     // cleanup code
                    // }`
                    //                                 ]
                    //                             }
                    //                         ],

                    //                         intermediate: [
                    //                             {
                    //                                 content: `
                    //                 <p>Servlet lifecycle detailed view:</p>
                    //                 <table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
                    //                     <tr><th>Stage</th><th>Who triggers it</th><th>Purpose</th></tr>
                    //                     <tr><td>Loading & Instantiation</td><td>Container</td><td>Load class & create object (once)</td></tr>
                    //                     <tr><td>init()</td><td>Container</td><td>Initialize servlet resources</td></tr>
                    //                     <tr><td>service()</td><td>Container per request</td><td>Handle client requests (calls doGet/doPost)</td></tr>
                    //                     <tr><td>destroy()</td><td>Container</td><td>Cleanup resources before removal</td></tr>
                    //                 </table>
                    //                 <p><strong>Notes:</strong></p>
                    //                 <ul>
                    //                     <li>• Servlet objects are singletons by default.</li>
                    //                     <li>• Multiple threads can access service() concurrently.</li>
                    //                     <li>• init() can be called with or without ServletConfig parameter.</li>
                    //                 </ul>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `public class HelloServlet extends HttpServlet {
                    //     public void init() throws ServletException {
                    //         System.out.println("Servlet initialized");
                    //     }

                    //     public void doGet(HttpServletRequest request, HttpServletResponse response)
                    //         throws ServletException, IOException {
                    //         response.setContentType("text/html");
                    //         PrintWriter out = response.getWriter();
                    //         out.println("<h1>Hello Servlet Lifecycle!</h1>");
                    //     }

                    //     public void destroy() {
                    //         System.out.println("Servlet destroyed");
                    //     }
                    // }`
                    //                                 ]
                    //                             }
                    //                         ],

                    //                         expert: [
                    //                             {
                    //                                 content: `
                    //                 <p>Advanced Servlet Lifecycle Concepts:</p>
                    //                 <ul>
                    //                     <li><strong>• Lazy vs Eager Loading:</strong> By default, servlet loads on first request. Use <code>&lt;load-on-startup&gt;</code> for eager loading.</li>
                    //                     <li><strong>• ServletConfig vs ServletContext:</strong> Config = servlet-specific, Context = shared across app.</li>
                    //                     <li><strong>• Thread Safety:</strong> Avoid instance variables or synchronize them.</li>
                    //                     <li><strong>• Lifecycle Call Sequence:</strong> Class Loading → Instantiation → init() → service() [many times] → destroy() → Garbage Collection</li>
                    //                 </ul><br>
                    //                 <p>Interview Tips:</p>
                    //                 <ul>
                    //                     <li>• init() is called once before first request.</li>
                    //                     <li>• service() can handle multiple requests concurrently.</li>
                    //                     <li>• destroy() is for cleanup; garbage collection is automatic.</li>
                    //                     <li>• Use &lt;load-on-startup&gt; to load servlet at server startup.</li>
                    //                 </ul>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<servlet>
                    //     <servlet-name>HelloServlet</servlet-name>
                    //     <servlet-class>HelloServlet</servlet-class>
                    //     <load-on-startup>1</load-on-startup>
                    // </servlet>`
                    //                                 ]
                    //                             }
                    //                         ]
                    //                     },

                    //                     {
                    //                         id: 'session-management',
                    //                         name: 'Session Management',

                    //                         beginner: [
                    //                             {
                    //                                 content: `
                    //                 <h3>What is a Session?</h3>
                    //                 <p>• A session is a way to store user data across multiple requests.</p>
                    //                 <p>• Sessions are used to track logged-in users, preferences, or temporary data.</p>
                    //                 <p>• Typically, sessions are implemented using <code>HttpSession</code> in Java.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     HttpSession session = request.getSession();
                    //     session.setAttribute("user", "Ashish");
                    //     out.println("Session created for user: " + session.getAttribute("user"));
                    // %>`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Creating a Session</h3>
                    //                 <p>• Use <code>request.getSession()</code> to create or get an existing session.</p>
                    //                 <p>• Sessions have unique IDs assigned by the server.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     HttpSession session = request.getSession(); // creates new session if not exists
                    //     out.println("Session ID: " + session.getId());
                    // %>`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Storing and Retrieving Session Data</h3>
                    //                 <p>• Use <code>session.setAttribute(name, value)</code> to store data.</p>
                    //                 <p>• Use <code>session.getAttribute(name)</code> to retrieve data.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     session.setAttribute("role", "admin");
                    //     String role = (String) session.getAttribute("role");
                    //     out.println("User Role: " + role);
                    // %>`
                    //                                 ]
                    //                             }
                    //                         ],

                    //                         intermediate: [
                    //                             {
                    //                                 content: `
                    //                 <h3>Session Timeout</h3>
                    //                 <p>• Sessions expire after a period of inactivity.</p>
                    //                 <p>• Set timeout in web.xml or using <code>session.setMaxInactiveInterval(seconds)</code>.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     session.setMaxInactiveInterval(300); // 5 minutes
                    //     out.println("Session will expire in 5 minutes of inactivity.");
                    // %>`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Invalidating a Session</h3>
                    //                 <p>• Use <code>session.invalidate()</code> to log out a user or clear session data.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     session.invalidate();
                    //     out.println("Session invalidated. User logged out.");
                    // %>`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Session Tracking Techniques</h3>
                    //                 <p>• Cookies: Server sends session ID as a cookie.</p>
                    //                 <p>• URL Rewriting: Append session ID to URL if cookies are disabled.</p>
                    //                 <p>• Hidden Form Fields: Store session ID in form data.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     // URL Rewriting example
                    //     String url = response.encodeURL("profile.jsp");
                    //     out.println("<a href='" + url + "'>Go to Profile</a>");
                    // %>`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Session Example – Login Simulation</h3>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     String username = request.getParameter("username");
                    //     if(username != null){
                    //         session.setAttribute("username", username);
                    //         out.println("Welcome, " + session.getAttribute("username"));
                    //     } else {
                    //         out.println("Please provide username in query string.");
                    //     }
                    // %>`
                    //                                 ]
                    //                             }
                    //                         ],

                    //                         expert: [
                    //                             {
                    //                                 content: `
                    //                 <h3>Advanced Session Management</h3>
                    //                 <p>• Store minimal data in session to avoid memory issues.</p>
                    //                 <p>• Use session attributes carefully in multi-threaded requests.</p>
                    //                 <p>• Consider using a distributed cache (Redis, Memcached) for clustered applications.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     // Example: Storing a list in session
                    //     List<String> cart = (List<String>) session.getAttribute("cart");
                    //     if(cart == null){
                    //         cart = new ArrayList<>();
                    //     }
                    //     cart.add("Item1");
                    //     session.setAttribute("cart", cart);
                    //     out.println("Cart items: " + session.getAttribute("cart"));
                    // %>`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Session Security Best Practices</h3>
                    //                 <p>• Use HTTPS to prevent session hijacking.</p>
                    //                 <p>• Regenerate session ID after login using <code>request.getSession(true)</code>.</p>
                    //                 <p>• Set HttpOnly and Secure flags on session cookies.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     // Force new session after login
                    //     HttpSession oldSession = request.getSession(false);
                    //     if(oldSession != null){
                    //         oldSession.invalidate();
                    //     }
                    //     HttpSession newSession = request.getSession(true);
                    //     newSession.setAttribute("username", "Ashish");
                    //     out.println("New session created with ID: " + newSession.getId());
                    // %>`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Session Listener Example</h3>
                    //                 <p>• Use <code>HttpSessionListener</code> to track session creation and destruction.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `// Java class implementing listener
                    // import jakarta.servlet.http.*;

                    // public class MySessionListener implements HttpSessionListener {
                    //     public void sessionCreated(HttpSessionEvent se) {
                    //         System.out.println("Session Created: " + se.getSession().getId());
                    //     }
                    //     public void sessionDestroyed(HttpSessionEvent se) {
                    //         System.out.println("Session Destroyed: " + se.getSession().getId());
                    //     }
                    // }`
                    //                                 ]
                    //                             },
                    //                             {
                    //                                 content: `
                    //                 <h3>Distributed Session Management</h3>
                    //                 <p>• In clustered applications, sessions can be shared across servers.</p>
                    //                 <p>• Use session replication or external stores (Redis) for high availability.</p>
                    //             `,
                    //                                 codeExamples: [
                    //                                     `<%
                    //     // Example using Redis (pseudo-code)
                    //     // redis.set(session.getId(), session.getAttribute("username"));
                    // %>`
                    //                                 ]
                    //                             }
                    //                         ]
                    //                     },

                ]
            },

            {
                id: 'servletlifecycle',
                name: 'Servlet Lifecycle',
                topics: [
                    {
                        id: "servlet-loading-instantiation",
                        name: "Servlet Loading & Instantiation",

                        beginner: [
                            {
                                content: `
<h2>What is Loading?</h2>
<p>• Loading means the servlet class is loaded into memory by the servlet container.</p>
<br>
<h2>What is Instantiation?</h2>
<p>• Instantiation means creating the object of the servlet class.</p>
<br>
<h3>Simple Flow</h3>
<ol>
<li>• Class Loaded</li>
<li>• Object Created</li>
<li>• init() Called</li>
</ol>
`,
                                codeExamples: [
                                    `import jakarta.servlet.http.*;
import jakarta.servlet.*;

public class DemoServlet extends HttpServlet {

    // Constructor → Called at Instantiation time
    public DemoServlet() {
        System.out.println("Servlet Object Created (Instantiation)");
    }

    @Override
    public void init() throws ServletException {
        System.out.println("Servlet Initialized (init method called)");
    }


    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response) {
        System.out.println("Service method executed");
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Loading on First Request (Default Behavior)</h2>
<p>• By default, servlet loads when the first request comes.</p><br>

<h2>Loading at Server Startup</h2>
<p>• Use <strong>load-on-startup</strong> in web.xml to load servlet during server startup.</p>
`,
                                codeExamples: [
                                    `<!-- web.xml Configuration -->
<servlet>
  <servlet-name>DemoServlet</servlet-name>
  <servlet-class>com.example.DemoServlet</servlet-class>
  <load-on-startup>1</load-on-startup>
</servlet>

<servlet-mapping>
  <servlet-name>DemoServlet</servlet-name>
  <url-pattern>/demo</url-pattern>
</servlet-mapping>`
                                ]
                            },
                            {
                                content: `
<h2>Annotation-Based Loading</h2>
<p>• Modern way using @WebServlet annotation.</p>
`,
                                codeExamples: [
                                    `import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

@WebServlet(urlPatterns="/demo", loadOnStartup=1)
public class DemoServlet extends HttpServlet {

    @Override
    public void init() {
        System.out.println("Loaded at server startup using annotation");
    }
}`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Deep Internal Working with Logging</h2>
<p>• This example shows exact order of execution.</p>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.http.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;

@WebServlet(urlPatterns="/life", loadOnStartup=1)
public class LifeCycleServlet extends HttpServlet {

    static {
        System.out.println("1. Class Loaded into Memory");
    }

    public LifeCycleServlet() {
        System.out.println("2. Servlet Object Instantiated");
    }

    @Override
    public void init() throws ServletException {
        System.out.println("3. init() method called");
    }

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {
        System.out.println("4. service() -> doGet() called");
        response.getWriter().println("Check server console for lifecycle flow");
    }

    @Override
    public void destroy() {
        System.out.println("5. destroy() method called");
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Expected Console Output Order</h2>
<pre>
1. Class Loaded into Memory
2. Servlet Object Instantiated
3. init() method called
4. service() -> doGet() called
5. destroy() method called (when server stops)
</pre><br>

<h2>Important Expert Notes</h2>
<ul>
<li>• Class loading happens only once per classloader.</li>
<li>• Only one servlet instance is created.</li>
<li>• Multiple requests are handled using multiple threads.</li>
<li>• Use loadOnStartup for heavy initialization tasks.</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Interview Important Questions</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Question</th>
<th>Answer</th>
</tr>
<tr>
<td>When is a servlet class loaded and instantiated?</td>
<td>By default on the first request; with load-on-startup (or loadOnStartup in @WebServlet) it happens at server startup instead</td>
</tr>
<tr>
<td>How many servlet objects does the container create?</td>
<td>Only one instance per servlet class (per JVM) unless it implements the deprecated SingleThreadModel</td>
</tr>
<tr>
<td>What triggers class loading?</td>
<td>Container classloader loads the .class file only once; static blocks run exactly once at that time</td>
</tr>
<tr>
<td>Constructor vs instantiation - same thing?</td>
<td>Yes - the no-arg constructor runs at instantiation time, before init() is called</td>
</tr>
</table>
`
                            }
                        ]
                    },

                    {
                        id: "servlet-init-method",
                        name: "Servlet init() Method",

                        beginner: [
                            {
                                content: `
<h2>What is init() Method?</h2>
<p>• The <strong>init()</strong> method is a lifecycle method of a servlet.</p>

<ul>
<li>• It is called only once.</li>
<li>• It is called when the servlet is first loaded.</li>
<li>• Used for initialization tasks.</li>
</ul><br>

<h3>Why We Use init()?</h3>
<ul>
<li>• Initialize database connection</li>
<li>• Load configuration file</li>
<li>• Initialize variables</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Basic Example of init()</h2>
<p>• This example shows init() method execution.</p>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;

public class InitExample extends HttpServlet {

    @Override
    public void init() throws ServletException {
        System.out.println("Servlet Initialized - init() called");
    }

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {
        response.getWriter().println("Hello from Servlet");
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>init() with ServletConfig</h2>
<p>• init() can receive ServletConfig object to read initialization parameters.</p>

<h3>Method Signature</h3>
<pre>• public void init(ServletConfig config)</pre>
`
                            },
                            {
                                content: `
<h2>Using init parameters from web.xml</h2>
<p>• We can configure parameters inside web.xml and read them inside init().</p>
`,
                                codeExamples: [
                                    `<!-- web.xml -->
<servlet>
  <servlet-name>ConfigServlet</servlet-name>
  <servlet-class>com.example.ConfigServlet</servlet-class>

  <init-param>
    <param-name>username</param-name>
    <param-value>admin</param-value>
  </init-param>
</servlet>`,

                                    `// Servlet Code
public class ConfigServlet extends HttpServlet {

    private String username;

    @Override
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        username = config.getInitParameter("username");
        System.out.println("Username: " + username);
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Key Points</h2>
<ul>
<li>• Called only once per servlet lifecycle</li>
<li>• Executed before service()</li>
<li>• If init() throws exception → servlet will not serve requests</li>
</ul>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Internal Working of init()</h2>
<ol>
<li>• Servlet class is loaded</li>
<li>• Servlet object created</li>
<li>• Container calls init()</li>
<li>• Servlet becomes ready to handle requests</li>
</ol><br>

<h3>Important:</h3>
<p>• If init() fails, the servlet is marked as unavailable.</p>
`
                            },
                            {
                                content: `
<h2>Real-World Example (Database Initialization)</h2>
<p>Common expert-level use case: initialize DB connection pool in init().</p>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.sql.*;

public class DBServlet extends HttpServlet {

    private Connection conn;

    @Override
    public void init() throws ServletException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/test",
                "root",
                "password"
            );
            System.out.println("Database Connected in init()");
        } catch (Exception e) {
            throw new ServletException("DB Connection Failed", e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {
        response.getWriter().println("Database Initialized");
    }

    @Override
    public void destroy() {
        try {
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Interview Important Points</h2>
<ul>
<li>• init() is called only once.</li>
<li>• Difference between init() and constructor?</li>
<li>• What happens if init() throws exception?</li>
<li>• Can we override both init() methods?</li>
<li>• When should heavy resources be initialized?</li>
</ul>

<h3>Constructor vs init()</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Constructor</th>
<th>init()</th>
</tr>
<tr>
<td>Called during object creation</td>
<td>Called by container after object creation</td>
</tr>
<tr>
<td>No ServletConfig available</td>
<td>ServletConfig available</td>
</tr>
<tr>
<td>Not recommended for heavy logic</td>
<td>Best place for initialization logic</td>
</tr>
</table>
`
                            }
                        ]
                    },

                    {
                        id: "servlet-service-method",
                        name: "Servlet service() Method",

                        beginner: [
                            {
                                content: `
<h2>What is service() Method?</h2>
<p>• The <strong>service()</strong> method is a lifecycle method of a servlet.</p>
<ul>
<li>• It is called for every client request.</li>
<li>• It processes the request and sends response.</li>
<li>• After init(), service() handles all requests.</li>
</ul><br>

<h3>Simple Lifecycle Order</h3>
<ol>
<li>• Servlet Loaded</li>
<li>• init() called (once)</li>
<li>• service() called (for every request)</li>
<li>• destroy() called</li>
</ol>
`
                            },
                            {
                                content: `
<h2>Basic Example</h2>
<p>• In HttpServlet, we usually override doGet() or doPost().</p>
<p>• Internally, service() calls doGet() or doPost().</p>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;

public class ServiceExample extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {
        response.getWriter().println("Handled by doGet()");
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>How service() Works Internally</h2>

<p>In HttpServlet:</p>
<ul>
<li>• service() checks HTTP method (GET, POST, etc.)</li>
<li>• Calls respective method: doGet(), doPost(), etc.</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Overriding service() Method</h2>
<p>• We can override service() directly, but it is not recommended in HttpServlet.</p>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;

public class CustomServiceServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest request,
                           HttpServletResponse response)
                           throws ServletException, IOException {

        response.getWriter().println("Custom service() executed");
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>GenericServlet service() Signature</h2>
<pre>
public void service(ServletRequest req, ServletResponse res)
</pre>

<p>In GenericServlet, we must override service().</p>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import java.io.IOException;

public class GenericExample extends GenericServlet {

    @Override
    public void service(ServletRequest req,
                        ServletResponse res)
                        throws ServletException, IOException {

        res.getWriter().println("Handled by GenericServlet service()");
    }
}`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Internal Flow of service() in HttpServlet</h2>

<ol>
<li>• Client sends HTTP request</li>
<li>• Container creates request & response objects</li>
<li>• service() method is invoked</li>
<li>• service() checks request.getMethod()</li>
<li>• Calls doGet(), doPost(), etc.</li>
<li>• Response sent back to client</li>
</ol>
<p><strong>Important:</strong> service() runs on multiple threads.</p>
`
                            },
                            {
                                content: `
<h2>Threading Model</h2>
<ul>
<li>• Single servlet instance</li>
<li>• Multiple threads call service()</li>
<li>• Must avoid shared mutable instance variables</li>
</ul>
`,
                                codeExamples: [
                                    `public class ThreadExample extends HttpServlet {

    private int counter = 0; // NOT thread-safe

    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {

        counter++; // Multiple threads may cause issue
        response.getWriter().println("Counter: " + counter);
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Best Practice</h2>
<ul>
<li>• Do not override service() in HttpServlet unless necessary</li>
<li>• Override doGet(), doPost(), etc.</li>
<li>• Use local variables inside methods</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Interview Important Questions</h2>
<ul>
<li>• What is service() method?</li>
<li>• Difference between service() in GenericServlet and HttpServlet?</li>
<li>• Can we override service()?</li>
<li>• How does service() decide which method to call?</li>
<li>• Is service() thread-safe?</li>
</ul><br>

<h3>Tricky Question</h3>
<p>Q: What happens if we override service() in HttpServlet?</p>
<p>A: doGet() and doPost() will NOT be called automatically unless explicitly invoked inside service().</p>
`
                            }
                        ]
                    },

                    {
                        id: "servlet-destroy-method",
                        name: "Servlet destroy() Method",

                        beginner: [
                            {
                                content: `
<h2>What is destroy() Method?</h2>
<p>• The <strong>destroy()</strong> method is a lifecycle method of a servlet.</p>

<ul>
<li>• It is called only once.</li>
<li>• Called before the servlet is removed from memory.</li>
<li>• Used for cleanup activities.</li>
</ul><br>

<h3>When is destroy() Called?</h3>
<ul>
<li>• When server is shutting down</li>
<li>• When servlet is reloaded</li>
<li>• When application is undeployed</li>
</ul><br>

<h3>Lifecycle Order</h3>
<ol>
<li>• init() → called once</li>
<li>• service() → called multiple times</li>
<li>• destroy() → called once</li>
</ol>
`
                            },
                            {
                                content: `
<h2>Basic Example</h2>
<p>• This example shows destroy() execution.</p>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;

public class DestroyExample extends HttpServlet {

    @Override
    public void init() {
        System.out.println("Servlet Initialized");
    }

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {
        response.getWriter().println("Hello User");
    }

    @Override
    public void destroy() {
        System.out.println("Servlet Destroyed - Cleanup Done");
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Why destroy() is Important?</h2>
<p>• It is used to release resources created during init().</p><br>

<h3>Common Cleanup Tasks</h3>
<ul>
<li>• Close database connection</li>
<li>• Close file streams</li>
<li>• Stop background threads</li>
<li>• Release memory resources</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Real Example: Closing Database Connection</h2>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.sql.*;

public class DBServlet extends HttpServlet {

    private Connection conn;

    @Override
    public void init() throws ServletException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/test",
                "root",
                "password"
            );
            System.out.println("DB Connected");
        } catch (Exception e) {
            throw new ServletException(e);
        }
    }

    @Override
    public void destroy() {
        try {
            if (conn != null) {
                conn.close();
                System.out.println("DB Connection Closed");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Important Notes</h2>
<ul>
<li>• destroy() is called only once.</li>
<li>• After destroy(), servlet becomes eligible for garbage collection.</li>
<li>• No new requests are processed after destroy() starts.</li>
</ul>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Internal Working of destroy()</h2>

<ol>
<li>• Container stops accepting new requests.</li>
<li>• Waits for current requests to complete.</li>
<li>• Calls destroy() method.</li>
<li>• Removes servlet instance from memory.</li>
</ol>

<p><strong>Important:</strong> destroy() runs in single thread by container.</p>
`
                            },
                            {
                                content: `
<h2>Handling Long Running Tasks</h2>
<p>• If servlet starts background threads, they must be stopped inside destroy().</p>
`,
                                codeExamples: [
                                    `public class BackgroundServlet extends HttpServlet {

    private Thread worker;
    private boolean running = true;

    @Override
    public void init() {
        worker = new Thread(() -> {
            while (running) {
                System.out.println("Running background task...");
                try { Thread.sleep(5000); } catch (Exception e) {}
            }
        });
        worker.start();
    }

    @Override
    public void destroy() {
        running = false;   // Stop thread
        worker.interrupt();
        System.out.println("Background thread stopped");
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Interview Important Questions</h2>
<ul>
<li>• When is destroy() called?</li>
<li>• Is destroy() called for every request?</li>
<li>• What happens if destroy() throws exception?</li>
<li>• Difference between finalize() and destroy()?</li>
<li>• Can destroy() be called multiple times?</li>
</ul><br>

<h3>destroy() vs finalize()</h3><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>destroy()</th>
<th>finalize()</th>
</tr>
<tr>
<td>Called by servlet container</td>
<td>Called by Garbage Collector</td>
</tr>
<tr>
<td>Used for resource cleanup</td>
<td>Used before object GC</td>
</tr>
<tr>
<td>Predictable execution</td>
<td>Not guaranteed execution time</td>
</tr>
</table>
`
                            }
                        ]
                    },

                    {
                        id: "servlet-doget-dopost",
                        name: "doGet() and doPost() Methods",

                        beginner: [
                            {
                                content: `
<h2>What is doGet()?</h2>
<p><strong>doGet()</strong> handles HTTP GET requests.</p>
<ul>
<li>• Data is sent in URL</li>
<li>• Used for fetching data</li>
<li>• Data is visible in browser</li>
<li>• Limited data size</li>
</ul><br>

<h2>What is doPost()?</h2>
<p><strong>doPost()</strong> handles HTTP POST requests.</p>
<ul>
<li>• Data is sent in request body</li>
<li>• Used for submitting form data</li>
<li>• Data is not visible in URL</li>
<li>• No size limitation (practically large)</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Basic Example of doGet()</h2>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;

public class GetExample extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {

        String name = request.getParameter("name");
        response.getWriter().println("Hello " + name);
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Basic Example of doPost()</h2>
`,
                                codeExamples: [
                                    `public class PostExample extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
                          throws IOException {

        String username = request.getParameter("username");
        response.getWriter().println("Welcome " + username);
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Difference Between doGet() and doPost()</h2><br>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Feature</th>
<th>doGet()</th>
<th>doPost()</th>
</tr>
<tr>
<td>Data Location</td>
<td>URL</td>
<td>Request Body</td>
</tr>
<tr>
<td>Security</td>
<td>Less Secure</td>
<td>More Secure</td>
</tr>
<tr>
<td>Data Size</td>
<td>Limited</td>
<td>Large</td>
</tr>
<tr>
<td>Usage</td>
<td>Fetch Data</td>
<td>Submit Data</td>
</tr>
<tr>
<td>Bookmarkable</td>
<td>Yes</td>
<td>No</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h2>HTML Form Example</h2>
`,
                                codeExamples: [
                                    `<!-- GET Form -->
<form action="GetExample" method="get">
  Name: <input type="text" name="name">
  <input type="submit">
</form>`,

                                    `<!-- POST Form -->
<form action="PostExample" method="post">
  Username: <input type="text" name="username">
  <input type="submit">
</form>`
                                ]
                            },
                            {
                                content: `
<h2>How service() Calls doGet() / doPost()</h2>
<p>The service() method checks the HTTP method type:</p>
<ul>
<li>• If method = GET → calls doGet()</li>
<li>• If method = POST → calls doPost()</li>
</ul>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Internal Flow</h2>
<ol>
<li>• Client sends HTTP request</li>
<li>• Container creates HttpServletRequest & HttpServletResponse</li>
<li>• service() method invoked</li>
<li>• Based on request.getMethod(), doGet() or doPost() executed</li>
</ol>
`
                            },
                            {
                                content: `
<h2>Handling Both GET and POST in Single Logic</h2>
<p>Best practice: Call common method from both doGet() and doPost()</p>
`,
                                codeExamples: [
                                    `public class CommonServlet extends HttpServlet {

    protected void processRequest(HttpServletRequest request,
                                  HttpServletResponse response)
                                  throws IOException {

        String data = request.getParameter("data");
        response.getWriter().println("Received: " + data);
    }

    @Override
    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {
        processRequest(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
                          throws IOException {
        processRequest(request, response);
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Security Best Practices</h2>
<ul>
<li>• Use POST for sensitive data (passwords)</li>
<li>• Use HTTPS for secure communication</li>
<li>• Validate all request parameters</li>
<li>• Prevent SQL Injection</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Interview Important Questions</h2>
<ul>
<li>Difference between doGet() and doPost()?</li>
<li>Which is more secure?</li>
<li>Can doGet() call doPost()?</li>
<li>What happens if doPost() is not implemented?</li>
<li>Why POST is not bookmarkable?</li>
</ul><br>

<h3>Tricky Question</h3>
<p>Q: If we type URL manually in browser, which method is called?</p>
<p>A: doGet() is called.</p>
`
                            }
                        ]
                    },

                ]
            },

            {
                id: 'Handling-Requests-Responses',
                name: 'Handling Req & Res',
                topics: [

                    {
                        id: "http-servlet-response",
                        name: "HttpServletResponse",

                        beginner: [
                            {
                                content: `
<h2>What is HttpServletResponse?</h2>
<p><strong>• HttpServletResponse</strong> is used to send data from server to browser.</p>
<ul>
<li>• Sends text or HTML</li>
<li>• Used inside doGet() or doPost()</li>
<li>• Works with HttpServletRequest</li>
</ul><br>

<h3>Basic Example</h3>
<p>• Sending simple text response:</p>
`,
                                codeExamples: [
                                    `protected void doGet(HttpServletRequest request,
                     HttpServletResponse response)
                     throws IOException {

    PrintWriter out = response.getWriter();
    out.println("Hello User");
}`
                                ]
                            },
                            {
                                content: `
<h2>Sending HTML Response</h2>
<p>• Always set content type before sending HTML.</p>
`,
                                codeExamples: [
                                    `response.setContentType("text/html");

PrintWriter out = response.getWriter();
out.println("<h1>Welcome</h1>");`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Setting Content Type</h2>
<p>• Content type tells browser what type of data is being sent.</p>
<ul>
<li>• text/html → HTML page</li>
<li>• text/plain → Normal text</li>
<li>• application/json → JSON data</li>
<li>• application/xml → XML data</li>
</ul>
`,
                                codeExamples: [
                                    `response.setContentType("application/json");
response.getWriter().write("{\\"status\\":\\"success\\"}");`
                                ]
                            },
                            {
                                content: `
<h2>sendRedirect()</h2>
<p>• Redirects the browser to another page.</p>
<ul>
<li>• URL changes</li>
<li>• New request is created</li>
<li>• Client-side redirection</li>
</ul>
`,
                                codeExamples: [
                                    `response.sendRedirect("login.jsp");`
                                ]
                            },
                            {
                                content: `
<h2>Setting Status Codes</h2>
<p>• We can send HTTP status codes manually.</p>
`,
                                codeExamples: [
                                    `response.setStatus(HttpServletResponse.SC_OK);        // 200
response.setStatus(HttpServletResponse.SC_NOT_FOUND); // 404`
                                ]
                            },
                            {
                                content: `
<h2>Adding Cookies</h2>
<p>• Used for session tracking.</p>
`,
                                codeExamples: [
                                    `Cookie cookie = new Cookie("user", "Ashish");
cookie.setMaxAge(60*60);
response.addCookie(cookie);`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Response Buffering & Commit (Advanced)</h2>
<ul>
<li>• Response is first stored in buffer</li>
<li>• When buffer is full → response is committed</li>
<li>• After commit → cannot redirect or forward</li>
</ul>
<p><strong>• Committed response means headers are already sent to client.</strong></p>
`
                            },
                            {
                                content: `
<h2>Forward vs Redirect (Deep Comparison)</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Feature</th>
<th>forward()</th>
<th>sendRedirect()</th>
</tr>
<tr>
<td>Execution</td>
<td>Server-side</td>
<td>Client-side</td>
</tr>
<tr>
<td>URL Change</td>
<td>No</td>
<td>Yes</td>
</tr>
<tr>
<td>Performance</td>
<td>Faster</td>
<td>Slightly slower</td>
</tr>
<tr>
<td>Request Scope</td>
<td>Same request</td>
<td>New request</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h2>Sending File Download (Advanced)</h2>
<p>• Used to download files from server.</p>
`,
                                codeExamples: [
                                    `response.setContentType("application/pdf");
response.setHeader("Content-Disposition",
                   "attachment; filename=report.pdf");

ServletOutputStream out = response.getOutputStream();
out.write(fileBytes);
out.close();`
                                ]
                            },
                            {
                                content: `
<h2>Sending JSON API Response</h2>
<p>• Used in REST APIs.</p>
`,
                                codeExamples: [
                                    `response.setContentType("application/json");
response.setCharacterEncoding("UTF-8");

String json = "{\\"name\\":\\"Ashish\\",\\"role\\":\\"Admin\\"}";
response.getWriter().write(json);`
                                ]
                            },
                            {
                                content: `
<h2>Advanced Methods</h2>
<ul>
<li>• setHeader() vs addHeader()</li>
<li>• setCharacterEncoding()</li>
<li>• setContentLength()</li>
<li>• encodeURL()</li>
<li>• sendError()</li>
</ul>
`,
                                codeExamples: [
                                    `response.sendError(HttpServletResponse.SC_FORBIDDEN,
                   "Access Denied");`
                                ]
                            },
                            {
                                content: `
<h2>Interview Advanced Questions</h2>
<ul>
<li>• What is response commit?</li>
<li>• Difference between getWriter() and getOutputStream()?</li>
<li>• When to use sendError()?</li>
<li>• Can we call sendRedirect() after writing response?</li>
<li>• Difference between setHeader() and addHeader()?</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "http-servlet-request",
                        name: "HttpServletRequest",

                        beginner: [
                            {
                                content: `
<h2>What is HttpServletRequest?</h2>
<p><strong>• HttpServletRequest</strong> is used to receive data from client (browser) to server.</p>

<ul>
<li>• Gets form data</li>
<li>• Gets URL parameters</li>
<li>• Gets request headers</li>
<li>• Works inside doGet() and doPost()</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Getting Form Data</h2>
<p>• Use getParameter() to read input values.</p>
`,
                                codeExamples: [
                                    `protected void doPost(HttpServletRequest request,
                      HttpServletResponse response)
                      throws IOException {

    String username = request.getParameter("username");
    String password = request.getParameter("password");

    response.getWriter().println("Welcome " + username);
}`
                                ]
                            },
                            {
                                content: `
<h2>Getting Multiple Values</h2>
<p>• Used for checkbox or multi-select inputs.</p>
`,
                                codeExamples: [
                                    `String[] hobbies = request.getParameterValues("hobby");

for(String h : hobbies) {
    System.out.println(h);
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Request Methods</h2>
<ul>
<li>• GET → Data visible in URL</li>
<li>• POST → Data sent in body</li>
<li>• PUT, DELETE → Used in REST APIs</li>
</ul>
`,
                                codeExamples: [
                                    `String method = request.getMethod();
System.out.println("Request Type: " + method);`
                                ]
                            },
                            {
                                content: `
<h2>Getting Request Headers</h2>
<p>• Headers contain browser and request information.</p>
`,
                                codeExamples: [
                                    `String userAgent = request.getHeader("User-Agent");
String host = request.getHeader("Host");

System.out.println(userAgent);`
                                ]
                            },
                            {
                                content: `
<h2>Getting Client Information</h2>
`,
                                codeExamples: [
                                    `String ip = request.getRemoteAddr();
String serverName = request.getServerName();
int port = request.getServerPort();`
                                ]
                            },
                            {
                                content: `
<h2>Request Attributes</h2>
<p>• Used to pass data between servlets (forward).</p>
`,
                                codeExamples: [
                                    `request.setAttribute("name", "Ashish");
RequestDispatcher rd = request.getRequestDispatcher("welcome.jsp");
rd.forward(request, response);`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Request Lifecycle (Advanced)</h2>
<ol>
<li>• Client sends HTTP request</li>
<li>• Container creates HttpServletRequest object</li>
<li>• Servlet processes request</li>
<li>• Response sent back</li>
<li>• Request object destroyed</li>
</ol>
`
                            },
                            {
                                content: `
<h2>getParameter() vs getAttribute()</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Feature</th>
<th>getParameter()</th>
<th>getAttribute()</th>
</tr>
<tr>
<td>Data Source</td>
<td>Client form data</td>
<td>Server-side data</td>
</tr>
<tr>
<td>Data Type</td>
<td>String</td>
<td>Object</td>
</tr>
<tr>
<td>Used In</td>
<td>Form processing</td>
<td>Forward/include</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h2>Reading Raw Data (Advanced)</h2>
<p>• Used when receiving JSON data in REST APIs.</p>
`,
                                codeExamples: [
                                    `BufferedReader reader = request.getReader();
String line;
StringBuilder sb = new StringBuilder();

while((line = reader.readLine()) != null) {
    sb.append(line);
}

String jsonData = sb.toString();
System.out.println(jsonData);`
                                ]
                            },
                            {
                                content: `
<h2>File Upload (Multipart Request)</h2>
<p>• Requires @MultipartConfig annotation.</p>
`,
                                codeExamples: [
                                    `@MultipartConfig
public class UploadServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request,
                          HttpServletResponse response)
                          throws IOException, ServletException {

        Part filePart = request.getPart("file");
        String fileName = filePart.getSubmittedFileName();

        filePart.write("C:/uploads/" + fileName);
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Advanced Methods</h2>
<ul>
<li>• getRequestURI()</li>
<li>• getRequestURL()</li>
<li>• getContextPath()</li>
<li>• getSession()</li>
<li>• getCookies()</li>
<li>• getInputStream()</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Interview Advanced Questions</h2>
<ul>
<li>1. Difference between GET and POST?</li>
<li>2. Difference between getParameter() and getAttribute()?</li>
<li>3. How to read JSON from request?</li>
<li>4. What is multipart request?</li>
<li>5. How does request lifecycle work?</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "sending-text-html-response",
                        name: "Sending text/html Response",

                        beginner: [
                            {
                                content: `
<h2>What is text/html Response?</h2>
<p><strong>text/html</strong> tells the browser that the response contains HTML content.</p>

<ul>
<li>• Used to display web pages</li>
<li>• Must set content type before writing output</li>
<li>• Uses PrintWriter</li>
</ul>
`,
                                codeExamples: [
                                    `response.setContentType("text/html");
PrintWriter out = response.getWriter();
out.println("<h1>Hello Servlet</h1>");`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Complete HTML Page Generation</h2>
<p>• Servlet can dynamically generate full HTML pages.</p>

<ul>
<li>• Dynamic content from database</li>
<li>• Display form data</li>
<li>• Conditional rendering</li>
</ul>
`,
                                codeExamples: [
                                    `response.setContentType("text/html");
response.setCharacterEncoding("UTF-8");

PrintWriter out = response.getWriter();

String username = request.getParameter("username");

out.println("<!DOCTYPE html>");
out.println("<html>");
out.println("<head>");
out.println("<title>User Page</title>");
out.println("</head>");
out.println("<body>");
out.println("<h2>Welcome " + username + "</h2>");
out.println("</body>");
out.println("</html>");`
                                ]
                            },
                            {
                                content: `
<h2>Character Encoding Importance</h2>
<ul>
<li>• Prevents special character issues</li>
<li>• Supports UTF-8 languages</li>
<li>• Must be set before writing output</li>
</ul>
`,
                                codeExamples: [
                                    `response.setCharacterEncoding("UTF-8");`
                                ]
                            },
                            {
                                content: `
<h2>Setting Content Length</h2>
<p>• Improves performance by telling browser response size.</p>
`,
                                codeExamples: [
                                    `String html = "<h1>Hello</h1>";
response.setContentLength(html.length());
response.getWriter().write(html);`
                                ]
                            },
                            {
                                content: `
<h2>Auto-Flushing & Closing Stream</h2>
<ul>
<li>• Container auto flushes buffer</li>
<li>• Manual close not always required</li>
<li>• Flushing commits response</li>
</ul>
`,
                                codeExamples: [
                                    `PrintWriter out = response.getWriter();
out.flush();  // commits response`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Response Buffer Internals</h2>
<ul>
<li>• Default buffer size (usually 8KB)</li>
<li>• Can change using setBufferSize()</li>
<li>• Once committed → headers locked</li>
</ul>
`,
                                codeExamples: [
                                    `response.setBufferSize(16384); // 16KB
int size = response.getBufferSize();`
                                ]
                            },
                            {
                                content: `
<h2>Checking Commit Status</h2>
<p>• Used to avoid IllegalStateException.</p>
`,
                                codeExamples: [
                                    `if(!response.isCommitted()) {
    response.setContentType("text/html");
}`
                                ]
                            },
                            {
                                content: `
<h2>Mixing getWriter() & getOutputStream()</h2>
<p>• You cannot use both in same response.</p>

<p>• If used together → IllegalStateException.</p>
`
                            },
                            {
                                content: `
<h2>Performance Considerations</h2>
<ul>
<li>• Avoid heavy HTML generation in Servlet</li>
<li>• Use JSP/Thymeleaf for view layer</li>
<li>• Follow MVC pattern</li>
<li>• Minimize string concatenation</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Security Considerations</h2>
<ul>
<li>• Prevent XSS by escaping user input</li>
<li>• Validate request parameters</li>
<li>• Avoid exposing sensitive data</li>
</ul>
`,
                                codeExamples: [
                                    `String user = request.getParameter("user");
// Escape HTML before printing`
                                ]
                            },
                            {
                                content: `
<h2>Real-World Flow</h2>
<ol>
<li>• Client sends request</li>
<li>• Servlet processes business logic</li>
<li>• Generates dynamic HTML</li>
<li>• Response buffered</li>
<li>• Committed to client</li>
</ol>
`
                            },
                            {
                                content: `
<h2>Advanced Interview Questions</h2>
<ul>
<li>1. What happens if content type is not set?</li>
<li>2. Explain response buffering mechanism.</li>
<li>3. What is response commit?</li>
<li>4. Difference between flush() and close()?</li>
<li>5. Can we reset response after commit?</li>
<li>6. Why MVC is recommended instead of writing HTML in servlet?</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "setting-content-type",
                        name: "Setting Content Type",

                        beginner: [
                            {
                                content: `
<h2>What is Content Type?</h2>
<p><strong>• Content-Type</strong> tells the browser what type of data the server is sending.</p>

<ul>
<li>• text/html → HTML page</li>
<li>• text/plain → Normal text</li>
<li>• application/json → JSON data</li>
<li>• application/pdf → PDF file</li>
</ul>

<p>• We use <strong>response.setContentType()</strong> to set it.</p>
`,
                                codeExamples: [
                                    `protected void doGet(HttpServletRequest request,
                     HttpServletResponse response)
                     throws IOException {

  response.setContentType("text/html");

  PrintWriter out = response.getWriter();
  out.println("<h1>Hello World</h1>");
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Common Content Types</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Type</th>
<th>Used For</th>
</tr>
<tr>
<td>text/html</td>
<td>Web Pages</td>
</tr>
<tr>
<td>text/plain</td>
<td>Simple Text</td>
</tr>
<tr>
<td>application/json</td>
<td>REST API</td>
</tr>
<tr>
<td>application/xml</td>
<td>XML Data</td>
</tr>
<tr>
<td>image/png</td>
<td>Images</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h2>Sending JSON Response</h2>
<p>• Used in REST APIs.</p>
`,
                                codeExamples: [
                                    `response.setContentType("application/json");
response.setCharacterEncoding("UTF-8");

String json = "{\\"name\\":\\"Ashish\\",\\"role\\":\\"Admin\\"}";
response.getWriter().write(json);`
                                ]
                            },
                            {
                                content: `
<h2>Setting Character Encoding</h2>
<p>• Prevents special character issues.</p>
`,
                                codeExamples: [
                                    `response.setContentType("text/html;charset=UTF-8");`
                                ]
                            },
                            {
                                content: `
<h2>What Happens if Not Set?</h2>
<ul>
<li>• Browser may treat data as plain text</li>
<li>• File download may not work properly</li>
<li>• JSON may display incorrectly</li>
</ul>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Internal Working of Content-Type</h2>
<ul>
<li>• Content-Type is an HTTP response header</li>
<li>• Sent before response body</li>
<li>• Browser decides how to render content</li>
</ul><br>

<p>Example HTTP Response:</p>
<pre>
• HTTP/1.1 200 OK 
• Content-Type: text/html;charset=UTF-8
</pre>
`
                            },
                            {
                                content: `
<h2>Buffer & Commit Rule</h2>
<ul>
<li>• Content type must be set before response is committed</li>
<li>• After commit → headers cannot be changed</li>
</ul>
`,
                                codeExamples: [
                                    `response.setContentType("text/html");

PrintWriter out = response.getWriter();
out.println("Hello");

// After buffer commit, cannot change content type`
                                ]
                            },
                            {
                                content: `
<h2>Difference: setContentType() vs setHeader()</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Method</th>
<th>Purpose</th>
</tr>
<tr>
<td>setContentType()</td>
<td>Sets Content-Type header safely</td>
</tr>
<tr>
<td>setHeader("Content-Type", ...)</td>
<td>Manual header setting</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h2>File Download Example</h2>
<p>• Proper content type required for file download.</p>
`,
                                codeExamples: [
                                    `response.setContentType("application/pdf");
response.setHeader("Content-Disposition",
                   "attachment; filename=report.pdf");

ServletOutputStream out = response.getOutputStream();
out.write(fileBytes);
out.close();`
                                ]
                            },
                            {
                                content: `
<h2>Security Considerations</h2>
<ul>
<li>• Always set correct content type to prevent MIME sniffing</li>
<li>• Use X-Content-Type-Options: nosniff header</li>
</ul>
`,
                                codeExamples: [
                                    `response.setHeader("X-Content-Type-Options", "nosniff");`
                                ]
                            },
                            {
                                content: `
<h2>Advanced Interview Questions</h2>
<ul>
<li>1. Why must content type be set before writing response?</li>
<li>2. What happens if content type is not set?</li>
<li>3. Difference between setContentType and setHeader?</li>
<li>4. Explain MIME types.</li>
<li>5. Can we change content type after response commit?</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "sending-redirect",
                        name: "Sending Redirect (sendRedirect)",

                        beginner: [
                            {
                                content: `
<h2>What is sendRedirect()?</h2>
<p><strong>sendRedirect()</strong> is used to redirect the browser to another URL.</p>

<ul>
<li>• URL changes in browser</li>
<li>• New request is created</li>
<li>• Client-side redirection</li>
<li>• Uses HTTP status code</li>
<li>• Request data is not preserved</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Basic Example</h2>
<p>Redirect user to login page:</p>

<ul>
<li>• Used inside doGet() or doPost()</li>
<li>• Does NOT stop execution - the method returns normally and code after it still runs, so add an explicit <code>return;</code></li>
<li>• Browser sends new request</li>
</ul>
`,
                                codeExamples: [
                                    `protected void doGet(HttpServletRequest request,
                     HttpServletResponse response)
                     throws IOException {

  response.sendRedirect("login.jsp");
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>How sendRedirect Works</h2>
<ul>
<li>• Server sends HTTP status 302</li>
<li>• Location header contains new URL</li>
<li>• Browser receives new URL</li>
<li>• Browser sends completely new request</li>
<li>• Previous request object destroyed</li>
</ul>

<p><strong>Flow:</strong></p>
<ol>
<li>• Client → Servlet</li>
<li>• Servlet → 302 Response</li>
<li>• Browser → New Request</li>
</ol>
`
                            },
                            {
                                content: `
<h2>Redirect to External Website</h2>

<ul>
<li>• Can redirect outside application</li>
<li>• Useful for third-party login</li>
<li>• Works with full URL</li>
</ul>
`,
                                codeExamples: [
                                    `response.sendRedirect("https://www.google.com");`
                                ]
                            },
                            {
                                content: `
<h2>Redirect with Parameters</h2>

<ul>
<li>• Parameters passed in URL</li>
<li>• Data visible in browser</li>
<li>• Suitable for small data only</li>
</ul>
`,
                                codeExamples: [
                                    `String name = "Ashish";
response.sendRedirect("welcome.jsp?user=" + name);`
                                ]
                            },
                            {
                                content: `
<h2>Common Use Cases</h2>
<ul>
<li>• After successful login</li>
<li>• After form submission (PRG Pattern)</li>
<li>• Redirect HTTP to HTTPS</li>
<li>• Unauthorized access redirect</li>
<li>• Logout redirection</li>
</ul>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>HTTP Status Code Behind sendRedirect()</h2>
<p>sendRedirect() internally sends:</p>

<pre>
HTTP/1.1 302 Found
Location: /newURL
</pre>

<ul>
<li>• 302 → Temporary redirect</li>
<li>• Location header contains new URL</li>
<li>• Browser automatically follows redirect</li>
<li>• SEO impact depends on status code</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Redirect vs Forward (Deep Comparison)</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Feature</th>
<th>sendRedirect()</th>
<th>forward()</th>
</tr>
<tr>
<td>Type</td>
<td>Client-side</td>
<td>Server-side</td>
</tr>
<tr>
<td>URL Changes</td>
<td>Yes</td>
<td>No</td>
</tr>
<tr>
<td>New Request</td>
<td>Yes</td>
<td>No</td>
</tr>
<tr>
<td>Request Scope Data</td>
<td>Lost</td>
<td>Available</td>
</tr>
</table><br>

<ul>
<li>• Redirect is slower than forward</li>
<li>• Redirect can go outside application</li>
<li>• Forward works only inside server</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Response Commit Rule</h2>
<ul>
<li>• sendRedirect() must be called before response is committed</li>
<li>• If response already written → IllegalStateException</li>
<li>• Buffer size affects commit</li>
<li>• Cannot write response after redirect</li>
</ul>
`,
                                codeExamples: [
                                    `PrintWriter out = response.getWriter();
out.println("Hello");

// This will cause error if response committed
response.sendRedirect("home.jsp");`
                                ]
                            },
                            {
                                content: `
<h2>Post/Redirect/Get (PRG Pattern)</h2>
<p>Prevents duplicate form submission.</p>

<ul>
<li>• Client submits form (POST)</li>
<li>• Server processes data</li>
<li>• Server redirects to GET page</li>
<li>• Prevents refresh duplicate submission</li>
</ul>
`,
                                codeExamples: [
                                    `protected void doPost(HttpServletRequest request,
                      HttpServletResponse response)
                      throws IOException {

  // Process form data

  response.sendRedirect("success.jsp");
}`
                                ]
                            },
                            {
                                content: `
<h2>Permanent Redirect (301)</h2>
<p>Manually setting status for SEO-friendly redirect:</p>

<ul>
<li>• 301 → Permanent redirect</li>
<li>• Search engines update URL</li>
<li>• Better for SEO migration</li>
</ul>
`,
                                codeExamples: [
                                    `response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
response.setHeader("Location", "https://example.com");`
                                ]
                            },
                            {
                                content: `
<h2>Advanced Interview Questions</h2>
<ul>
<li>• Difference between sendRedirect and forward?</li>
<li>• Which HTTP status code is used in redirect?</li>
<li>• Why is PRG pattern important?</li>
<li>• Can we redirect after writing response?</li>
<li>• How to perform permanent redirect?</li>
<li>• Why redirect is slower than forward?</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "request-dispatcher",
                        name: "RequestDispatcher (forward/include)",

                        beginner: [
                            {
                                content: `
<h2>What is RequestDispatcher?</h2>
<p><strong>RequestDispatcher</strong> is used to forward request from one resource to another resource inside the server.</p>

<ul>
<li>• Server-side redirection</li>
<li>• URL does NOT change</li>
<li>• Same request & response object used</li>
<li>• Works inside same application</li>
<li>• Faster than sendRedirect()</li>
</ul>
`
                            },
                            {
                                content: `
<h2>forward() Method</h2>
<p>Transfers control to another resource (Servlet/JSP/HTML).</p>

<ul>
<li>• Stops current servlet execution</li>
<li>• Control fully transferred</li>
<li>• Browser unaware of forwarding</li>
<li>• Same request object shared</li>
</ul>
`,
                                codeExamples: [
                                    `RequestDispatcher rd =
request.getRequestDispatcher("welcome.jsp");

rd.forward(request, response);`
                                ]
                            },
                            {
                                content: `
<h2>include() Method</h2>
<p>Includes output of another resource in current response.</p>

<ul>
<li>• Includes resource output</li>
<li>• Current servlet continues execution</li>
<li>• Used for header/footer</li>
<li>• Output appended to response</li>
</ul>
`,
                                codeExamples: [
                                    `RequestDispatcher rd =
request.getRequestDispatcher("header.jsp");

rd.include(request, response);`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>How forward() Works</h2>
<ul>
<li>• Stops current servlet execution</li>
<li>• Transfers request internally</li>
<li>• Browser is unaware</li>
<li>• Request attributes remain available</li>
<li>• Uses same request & response object</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Passing Data using Request Scope</h2>

<ul>
<li>• request.setAttribute()</li>
<li>• request.getAttribute()</li>
<li>• Data available in same request</li>
<li>• Commonly used between Servlet → JSP</li>
</ul>
`,
                                codeExamples: [
                                    `request.setAttribute("username", "Ashish");

RequestDispatcher rd =
request.getRequestDispatcher("welcome.jsp");

rd.forward(request, response);`
                                ]
                            },
                            {
                                content: `
<h2>include() Behavior</h2>
<ul>
<li>• Includes output of another resource</li>
<li>• Main servlet continues execution</li>
<li>• Useful for header/footer</li>
<li>• Response content appended</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Example: include() Full Flow</h2>

<ul>
<li>• Write main content</li>
<li>• Include another resource</li>
<li>• Continue writing response</li>
</ul>
`,
                                codeExamples: [
                                    `PrintWriter out = response.getWriter();
out.println("<h1>Main Content</h1>");

RequestDispatcher rd =
request.getRequestDispatcher("footer.jsp");

rd.include(request, response);

out.println("<p>After Footer</p>");`
                                ]
                            },
                            {
                                content: `
<h2>forward() vs include()</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Feature</th>
<th>forward()</th>
<th>include()</th>
</tr>
<tr>
<td>Stops current execution</td>
<td>Yes</td>
<td>No</td>
</tr>
<tr>
<td>URL changes</td>
<td>No</td>
<td>No</td>
</tr>
<tr>
<td>Output control</td>
<td>Transferred</td>
<td>Appended</td>
</tr>
</table>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Internal Working</h2>
<ul>
<li>• Container creates RequestDispatcher object</li>
<li>• Control transferred within same request</li>
<li>• No new HTTP request generated</li>
<li>• Uses same thread</li>
<li>• Faster than sendRedirect()</li>
<li>• Works only inside same application</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Response Commit Rule</h2>
<ul>
<li>• forward() must be called before response is committed</li>
<li>• If response already committed → IllegalStateException</li>
<li>• Cannot redirect after forward()</li>
<li>• Buffer size matters</li>
</ul>
`,
                                codeExamples: [
                                    `PrintWriter out = response.getWriter();
out.println("Hello");

// This may cause exception if buffer committed
RequestDispatcher rd =
request.getRequestDispatcher("page.jsp");

rd.forward(request, response);`
                                ]
                            },
                            {
                                content: `
<h2>Common MVC Pattern Usage</h2>
<p>Servlet acts as Controller.</p>

<ul>
<li>• Servlet processes data</li>
<li>• Sets request attributes</li>
<li>• Forwards to JSP (View)</li>
<li>• Model contains business logic</li>
</ul>
`,
                                codeExamples: [
                                    `protected void doGet(HttpServletRequest request,
                     HttpServletResponse response)
                     throws ServletException, IOException {

  List<String> users = List.of("A", "B", "C");

  request.setAttribute("userList", users);

  RequestDispatcher rd =
  request.getRequestDispatcher("users.jsp");

  rd.forward(request, response);
}`
                                ]
                            },
                            {
                                content: `
<h2>Common Mistakes</h2>
<ul>
<li>• Writing response before forward()</li>
<li>• Using forward() after redirect()</li>
<li>• Expecting URL change</li>
<li>• Forwarding to external website</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Interview Important Questions</h2>
<ul>
<li>• Difference between forward() and include()?</li>
<li>• Difference between forward() and sendRedirect()?</li>
<li>• Can we forward to external website?</li>
<li>• Does forward create new request?</li>
<li>• Why is forward faster than redirect?</li>
</ul>

<h3>Tricky Question</h3>
<p>Q: Can we forward to another server?</p>
<p>A: No. forward() works only inside same application/server.</p>
`
                            }
                        ]
                    },

                ]
            },

            {
                id: 'form-handling',
                name: 'Form Handling',
                topics: [

                    {
                        id: "reading-form-data",
                        name: "Reading Form Data (getParameter)",

                        beginner: [
                            {
                                content: `
<h2>What is getParameter()?</h2>
<p><strong>getParameter()</strong> is used to read form data sent from client to server.</p>

<ul>
<li>• Reads form input values</li>
<li>• Returns data as String</li>
<li>• Works with GET and POST</li>
<li>• Defined in HttpServletRequest</li>
</ul>
`
                            },
                            {
                                content: `
<h2>HTML Form Example</h2>

<ul>
<li>• Form sends data to servlet</li>
<li>• Input name attribute is important</li>
</ul>
`,
                                codeExamples: [
                                    `<form action="login" method="post">
  Name: <input type="text" name="username" />
  <input type="submit" value="Submit" />
</form>`
                                ]
                            },
                            {
                                content: `
<h2>Reading Form Data in Servlet</h2>

<ul>
<li>• Use request.getParameter("fieldName")</li>
<li>• Always returns String</li>
</ul>
`,
                                codeExamples: [
                                    `protected void doPost(HttpServletRequest request,
                      HttpServletResponse response)
                      throws IOException {

  String name = request.getParameter("username");

  response.getWriter().println("Welcome " + name);
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Handling Multiple Form Fields</h2>

<ul>
<li>• Read multiple parameters</li>
<li>• Validate input</li>
<li>• Convert String to int/double</li>
</ul>
`,
                                codeExamples: [
                                    `String name = request.getParameter("username");
String ageStr = request.getParameter("age");

int age = Integer.parseInt(ageStr);

response.getWriter().println("Name: " + name);
response.getWriter().println("Age: " + age);`
                                ]
                            },
                            {
                                content: `
<h2>Handling Checkbox & Multiple Values</h2>

<ul>
<li>• Use getParameterValues()</li>
<li>• Returns String array</li>
<li>• Used for checkbox/multi-select</li>
</ul>
`,
                                codeExamples: [
                                    `String[] hobbies = request.getParameterValues("hobby");

for(String hobby : hobbies) {
   response.getWriter().println(hobby);
}`
                                ]
                            },
                            {
                                content: `
<h2>GET vs POST Data Reading</h2>

<ul>
<li>• GET → Data visible in URL</li>
<li>• POST → Data sent in request body</li>
<li>• getParameter() works for both</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Handling Null Values</h2>

<ul>
<li>• Parameter may return null</li>
<li>• Always check before using</li>
</ul>
`,
                                codeExamples: [
                                    `String email = request.getParameter("email");

if(email != null && !email.isEmpty()) {
   response.getWriter().println(email);
} else {
   response.getWriter().println("Email is required");
}`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Character Encoding Handling</h2>

<ul>
<li>• Important for non-English characters</li>
<li>• Must set encoding before reading parameters</li>
<li>• Prevents garbage characters</li>
</ul>
`,
                                codeExamples: [
                                    `request.setCharacterEncoding("UTF-8");

String name = request.getParameter("username");`
                                ]
                            },
                            {
                                content: `
<h2>Reading All Parameters Dynamically</h2>

<ul>
<li>• Use getParameterMap()</li>
<li>• Use getParameterNames()</li>
<li>• Useful for dynamic forms</li>
</ul>
`,
                                codeExamples: [
                                    `Map<String, String[]> paramMap = request.getParameterMap();

for(String key : paramMap.keySet()) {
   String[] values = paramMap.get(key);
   for(String value : values) {
       response.getWriter().println(key + " : " + value);
   }
}`
                                ]
                            },
                            {
                                content: `
<h2>Security Considerations</h2>

<ul>
<li>• Never trust client input</li>
<li>• Validate all parameters</li>
<li>• Prevent SQL Injection</li>
<li>• Prevent XSS attacks</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Common Mistakes</h2>

<ul>
<li>• Forgetting input name attribute</li>
<li>• Not handling null values</li>
<li>• Not setting character encoding</li>
<li>• Parsing without validation</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Advanced Interview Questions</h2>

<ul>
<li>• Difference between getParameter() and getAttribute()?</li>
<li>• What does getParameterValues() return?</li>
<li>• Why does getParameter() always return String?</li>
<li>• How to handle UTF-8 form data?</li>
<li>• How to prevent form data security issues?</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "handling-get-vs-post",
                        name: "Handling GET vs POST",

                        beginner: [
                            {
                                content: `
<h2>What is GET Method?</h2>

<ul>
<li>• Used to fetch data</li>
<li>• Data sent in URL</li>
<li>• Visible in browser address bar</li>
<li>• Limited data size</li>
<li>• Not secure for sensitive data</li>
</ul>
`
                            },
                            {
                                content: `
<h2>What is POST Method?</h2>

<ul>
<li>• Used to send data to server</li>
<li>• Data sent in request body</li>
<li>• Not visible in URL</li>
<li>• More secure than GET</li>
<li>• No size limitation (practically large)</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Basic Servlet Example</h2>
`,
                                codeExamples: [
                                    `protected void doGet(HttpServletRequest request,
                     HttpServletResponse response)
                     throws IOException {

   response.getWriter().println("GET Request Received");
}

protected void doPost(HttpServletRequest request,
                      HttpServletResponse response)
                      throws IOException {

   response.getWriter().println("POST Request Received");
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>GET vs POST Comparison</h2>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr>
<th>Feature</th>
<th>GET</th>
<th>POST</th>
</tr>
<tr>
<td>Data Location</td>
<td>URL</td>
<td>Request Body</td>
</tr>
<tr>
<td>Security</td>
<td>Less Secure</td>
<td>More Secure</td>
</tr>
<tr>
<td>Data Length</td>
<td>Limited</td>
<td>Large</td>
</tr>
<tr>
<td>Bookmarkable</td>
<td>Yes</td>
<td>No</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h2>HTML Form Example</h2>

<ul>
<li>• method="get"</li>
<li>• method="post"</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- GET Example -->
<form action="user" method="get">
  Name: <input type="text" name="username" />
  <input type="submit" />
</form>

<!-- POST Example -->
<form action="user" method="post">
  Name: <input type="text" name="username" />
  <input type="submit" />
</form>`
                                ]
                            },
                            {
                                content: `
<h2>Reading Parameters (Same for Both)</h2>

<ul>
<li>• request.getParameter()</li>
<li>• Works for GET & POST</li>
<li>• Always returns String</li>
</ul>
`,
                                codeExamples: [
                                    `String name = request.getParameter("username");
response.getWriter().println("Hello " + name);`
                                ]
                            },
                            {
                                content: `
<h2>When to Use GET</h2>

<ul>
<li>• Searching data</li>
<li>• Filtering records</li>
<li>• Idempotent operations</li>
<li>• Read-only requests</li>
</ul>
`
                            },
                            {
                                content: `
<h2>When to Use POST</h2>

<ul>
<li>• Login forms</li>
<li>• Registration forms</li>
<li>• File upload</li>
<li>• Database insert/update</li>
</ul>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>HTTP Internals</h2>

<ul>
<li>• GET appends query string to URL</li>
<li>• POST sends data in request body</li>
<li>• GET is idempotent</li>
<li>• POST is not idempotent</li>
<li>• GET can be cached</li>
<li>• POST usually not cached</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Security Considerations</h2>

<ul>
<li>• GET parameters logged in browser history</li>
<li>• GET visible in server logs</li>
<li>• POST still not encrypted unless HTTPS</li>
<li>• Always use HTTPS for sensitive data</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Redirect Behavior</h2>

<ul>
<li>• After POST → Use PRG (Post/Redirect/Get)</li>
<li>• Prevents duplicate submission</li>
<li>• Browser refresh resubmits POST</li>
</ul>
`,
                                codeExamples: [
                                    `protected void doPost(HttpServletRequest request,
                      HttpServletResponse response)
                      throws IOException {

   // Process form

   response.sendRedirect("success.jsp"); // PRG Pattern
}`
                                ]
                            },
                            {
                                content: `
<h2>Handling Both in One Method</h2>

<ul>
<li>• Call doPost() inside doGet()</li>
<li>• Or override service()</li>
<li>• Avoid duplicate logic</li>
</ul>
`,
                                codeExamples: [
                                    `protected void doGet(HttpServletRequest request,
                     HttpServletResponse response)
                     throws IOException {

   doPost(request, response);
}`
                                ]
                            },
                            {
                                content: `
<h2>Advanced Interview Questions</h2>

<ul>
<li>• Difference between GET and POST?</li>
<li>• Which method is idempotent?</li>
<li>• Why POST is not fully secure?</li>
<li>• Can GET modify server data?</li>
<li>• What is PRG pattern?</li>
<li>• Why GET can be cached?</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "hidden-fields",
                        name: "Hidden Fields (Session Tracking Technique)",

                        beginner: [
                            {
                                content: `
<h2>What are Hidden Fields?</h2>

<p><strong>Hidden fields</strong> are form input elements that are not visible to users but send data to the server.</p>

<ul>
<li>• Used to store hidden data</li>
<li>• Data sent with form submission</li>
<li>• Used for session tracking</li>
<li>• Visible in page source (not secure)</li>
</ul>
`
                            },
                            {
                                content: `
<h2>HTML Hidden Field Example</h2>

<ul>
<li>• type="hidden"</li>
<li>• Has name and value</li>
<li>• Not displayed in browser</li>
</ul>
`,
                                codeExamples: [
                                    `<form action="profile" method="post">
  <input type="hidden" name="userId" value="101" />
  Name: <input type="text" name="username" />
  <input type="submit" value="Submit" />
</form>`
                                ]
                            },
                            {
                                content: `
<h2>Reading Hidden Field in Servlet</h2>

<ul>
<li>• Use request.getParameter()</li>
<li>• Works like normal form field</li>
</ul>
`,
                                codeExamples: [
                                    `protected void doPost(HttpServletRequest request,
                      HttpServletResponse response)
                      throws IOException {

   String userId = request.getParameter("userId");
   response.getWriter().println("User ID: " + userId);
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Hidden Fields for Session Tracking</h2>

<ul>
<li>• Used when cookies disabled</li>
<li>• Data passed between pages</li>
<li>• Requires form submission</li>
<li>• Maintains user state</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Passing Hidden Field to Next Page</h2>

<ul>
<li>• Servlet generates dynamic hidden value</li>
<li>• Embedded inside form</li>
</ul>
`,
                                codeExamples: [
                                    `protected void doGet(HttpServletRequest request,
                     HttpServletResponse response)
                     throws IOException {

   String user = "Ashish";

   response.setContentType("text/html");
   PrintWriter out = response.getWriter();

   out.println("<form action='next' method='post'>");
   out.println("<input type='hidden' name='username' value='" + user + "' />");
   out.println("<input type='submit' value='Continue' />");
   out.println("</form>");
}`
                                ]
                            },
                            {
                                content: `
<h2>Hidden Fields vs Cookies</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Feature</th>
<th>Hidden Field</th>
<th>Cookie</th>
</tr>
<tr>
<td>Stored Where?</td>
<td>Inside Form</td>
<td>Browser</td>
</tr>
<tr>
<td>Requires Form Submit?</td>
<td>Yes</td>
<td>No</td>
</tr>
<tr>
<td>Security</td>
<td>Less Secure</td>
<td>Moderate</td>
</tr>
</table>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Security Considerations</h2>

<ul>
<li>• User can modify hidden field value</li>
<li>• Never trust hidden field data</li>
<li>• Always validate on server side</li>
<li>• Not suitable for sensitive data</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Hidden Fields Limitation</h2>

<ul>
<li>• Works only with forms</li>
<li>• Not suitable for large data</li>
<li>• Cannot persist across direct URL access</li>
<li>• Not ideal for complex session handling</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Real World Use Cases</h2>

<ul>
<li>• Multi-step form data passing</li>
<li>• CSRF token storage</li>
<li>• Temporary state management</li>
<li>• E-commerce cart step tracking</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Hidden Field vs URL Rewriting vs HttpSession</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Feature</th>
<th>Hidden Field</th>
<th>URL Rewriting</th>
<th>HttpSession</th>
</tr>
<tr>
<td>Visible to User</td>
<td>No (but viewable in source)</td>
<td>Yes (URL)</td>
<td>No</td>
</tr>
<tr>
<td>Security</td>
<td>Low</td>
<td>Low</td>
<td>High</td>
</tr>
<tr>
<td>Best Use</td>
<td>Form Data Passing</td>
<td>Small Session Tracking</td>
<td>Full Session Management</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h2>Advanced Interview Questions</h2>

<ul>
<li>• What is hidden field in servlet?</li>
<li>• How hidden field maintains session?</li>
<li>• Why hidden field is not secure?</li>
<li>• Difference between hidden field and cookie?</li>
<li>• When should you avoid hidden fields?</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "url-rewriting",
                        name: "URL Rewriting (Session Tracking Technique)",

                        beginner: [
                            {
                                content: `
<h2>What is URL Rewriting?</h2>

<p><strong>URL Rewriting</strong> is a session tracking technique where data is appended to the URL as query parameters.</p>

<ul>
<li>• Data is added at the end of URL</li>
<li>• Format: ?key=value</li>
<li>• Multiple values separated using &</li>
<li>• Used when cookies are disabled</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Basic Example</h2>

<ul>
<li>• Passing username through URL</li>
<li>• Data visible in browser address bar</li>
</ul>
`,
                                codeExamples: [
                                    `response.sendRedirect("welcome.jsp?user=Ashish");`
                                ]
                            },
                            {
                                content: `
<h2>Reading URL Data in Servlet</h2>

<ul>
<li>• Use request.getParameter()</li>
<li>• Works like form data</li>
</ul>
`,
                                codeExamples: [
                                    `protected void doGet(HttpServletRequest request,
                     HttpServletResponse response)
                     throws IOException {

   String user = request.getParameter("user");
   response.getWriter().println("Welcome " + user);
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Multiple Parameters Example</h2>

<ul>
<li>• Separate parameters using &</li>
<li>• Format: ?key1=value1&key2=value2</li>
</ul>
`,
                                codeExamples: [
                                    `response.sendRedirect("profile?name=Ashish&role=admin");`
                                ]
                            },
                            {
                                content: `
<h2>URL Rewriting for Session Tracking</h2>

<ul>
<li>• Session ID added in URL</li>
<li>• Useful when cookies disabled</li>
<li>• Maintains user state</li>
</ul>
`,
                                codeExamples: [
                                    `String sessionId = "12345";
response.sendRedirect(response.encodeRedirectURL("dashboard"));  // appends ;jsessionid=... which is the ONLY form the container parses; a sessionId query param does NOT reattach the session`
                                ]
                            },
                            {
                                content: `
<h2>Encoding URL Properly</h2>

<ul>
<li>• Use encodeURL()</li>
<li>• Automatically appends session ID if needed</li>
</ul>
`,
                                codeExamples: [
                                    `String url = response.encodeURL("home.jsp");
response.sendRedirect(url);`
                                ]
                            },
                            {
                                content: `
<h2>URL Rewriting vs Hidden Fields</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Feature</th>
<th>URL Rewriting</th>
<th>Hidden Field</th>
</tr>
<tr>
<td>Data Visible</td>
<td>Yes</td>
<td>No (but viewable in source)</td>
</tr>
<tr>
<td>Works Without Form</td>
<td>Yes</td>
<td>No</td>
</tr>
<tr>
<td>Security</td>
<td>Low</td>
<td>Low</td>
</tr>
</table>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>How Container Uses URL Rewriting</h2>

<ul>
<li>• When cookies disabled, container appends session ID</li>
<li>• Format: ;jsessionid=XXXX</li>
<li>• Automatically handled by encodeURL()</li>
</ul>

<p>Example:</p>
<pre>
http://localhost:8080/app/home;jsessionid=ABC123
</pre>
`
                            },
                            {
                                content: `
<h2>encodeURL() vs encodeRedirectURL()</h2>

<ul>
<li>• encodeURL() → for normal links</li>
<li>• encodeRedirectURL() → for sendRedirect()</li>
</ul>
`,
                                codeExamples: [
                                    `String url1 = response.encodeURL("home.jsp");
String url2 = response.encodeRedirectURL("dashboard");

response.sendRedirect(url2);`
                                ]
                            },
                            {
                                content: `
<h2>Security Considerations</h2>

<ul>
<li>• Data visible in browser</li>
<li>• Can be bookmarked</li>
<li>• Can be modified by user</li>
<li>• Not safe for sensitive data</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Limitations</h2>

<ul>
<li>• URL length limitation</li>
<li>• Not suitable for large data</li>
<li>• Manual handling required for every link</li>
<li>• Less secure than HttpSession</li>
</ul>
`
                            },
                            {
                                content: `
<h2>URL Rewriting vs HttpSession vs Cookies</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2">

<tr>
<th>Feature</th>
<th>URL Rewriting</th>
<th>Cookies</th>
<th>HttpSession</th>
</tr>
<tr>
<td>Security</td>
<td>Low</td>
<td>Medium</td>
<td>High</td>
</tr>
<tr>
<td>Visible to User</td>
<td>Yes</td>
<td>No</td>
<td>No</td>
</tr>
<tr>
<td>Best Use</td>
<td>When Cookies Disabled</td>
<td>Light Tracking</td>
<td>Full Session Management</td>
</tr>
</table>
`
                            },
                            {
                                content: `
<h2>Advanced Interview Questions</h2>

<ul>
<li>• What is URL rewriting in servlet?</li>
<li>• How does encodeURL() work?</li>
<li>• What happens when cookies are disabled?</li>
<li>• Difference between encodeURL() and encodeRedirectURL()?</li>
<li>• Why is URL rewriting not secure?</li>
<li>• What is ;jsessionid in URL?</li>
</ul>
`
                            }
                        ]
                    },


                ]
            },

            {
                id: "session-management",
                name: "Session Management",
                topics: [
                    {
                        id: "cookies",
                        name: "Cookies",
                        beginner: [
                            {
                                content: `
        <h2>What is a Cookie?</h2>
        <p>
        • A cookie is a small piece of data stored in the user's browser by the server.<br>
        • It helps maintain state in web applications (since HTTP is stateless).
        </p><br>

        <h3>Why Cookies are Needed?</h3>
        <ul>
          <li>• Maintain login sessions</li>
          <li>• Store user preferences (theme, language)</li>
          <li>• Track user activity</li>
          <li>• Personalization</li>
          <li>• Shopping cart management</li>
        </ul><br>

        <h3>Real-Life Example</h3>
        <p>
        • When you log in to an e-commerce website, the server stores a session cookie.<br>
        • That cookie tells the server who you are on every request.
        </p><br>

        <h3>How Cookies Work</h3>
        <ol>
          <li>• User sends request to server</li>
          <li>• Server responds with Set-Cookie header</li>
          <li>• Browser stores the cookie</li>
          <li>• Browser sends cookie automatically in future requests</li>
        </ol><br>

        <h3>Client-Side vs Server-Side Cookies</h3>
        <ul>
          <li>• <strong>Client-side</strong> → Created using JavaScript</li>
          <li>• <strong>Server-side</strong> → Created using backend (Spring Boot, Node, etc.)</li>
        </ul>
      `,
                                codeExamples: [
                                    `// Creating Cookie using JavaScript
document.cookie = "username=Ashish; expires=Fri, 31 Dec 2026 12:00:00 UTC; path=/";`,

                                    `// Reading Cookies
console.log(document.cookie);`,

                                    `// Function to Get Specific Cookie
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let c of cookies) {
    const [key, value] = c.split("=");
    if (key === name) return value;
  }
  return null;
}`,

                                    `// Deleting Cookie
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
        <h2>Types of Cookies</h2>
        <ul>
          <li><strong>• Session Cookies</strong> - Deleted when browser closes</li>
          <li><strong>• Persistent Cookies</strong> - Stored until expiry date</li>
          <li><strong>• Secure Cookies</strong> - Sent only over HTTPS</li>
          <li><strong>• HttpOnly Cookies</strong> - Not accessible via JavaScript</li>
          <li><strong>• SameSite Cookies</strong> - Protect against CSRF attacks</li>
        </ul><br>

        <h3>Cookie Attributes</h3>
        <ul>
          <li>• Expires / Max-Age</li>
          <li>• Domain</li>
          <li>• Path</li>
          <li>• Secure</li>
          <li>• HttpOnly</li>
          <li>• SameSite</li>
        </ul><br>

        <h3>When to Use Cookies vs Session</h3>
        <ul>
          <li>• Use Session for temporary authentication</li>
          <li>• Use Persistent Cookie for "Remember Me"</li>
        </ul><br>

        <h3>Server-Side Cookie (Spring Boot Example)</h3>
      `,
                                codeExamples: [
                                    `// Spring Boot - Setting Cookie
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

Cookie cookie = new Cookie("user", "Ashish");
cookie.setMaxAge(60 * 60); // 1 hour
cookie.setHttpOnly(true);
cookie.setSecure(true);
cookie.setPath("/");
response.addCookie(cookie);`,

                                    `// Reading Cookie in Spring Boot
import jakarta.servlet.http.HttpServletRequest;

Cookie[] cookies = request.getCookies();
if (cookies != null) {
  for (Cookie c : cookies) {
    if (c.getName().equals("user")) {
      System.out.println(c.getValue());
    }
  }
}`,

                                    `// Deleting Cookie in Spring Boot
Cookie cookie = new Cookie("user", null);
cookie.setMaxAge(0);
cookie.setPath("/");
response.addCookie(cookie);`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
        <h2>Security Considerations</h2>
        <ul>
          <li><strong>• XSS Protection</strong> - Use HttpOnly flag</li>
          <li><strong>• CSRF Protection</strong> - Use SameSite=Strict or Lax</li>
          <li><strong>• HTTPS Enforcement</strong> - Use Secure flag</li>
        </ul><br>

        <h3>SameSite Modes</h3>
        <ul>
          <li><strong>• Strict</strong> - Cookie sent only for same-site requests</li>
          <li><strong>• Lax</strong> - Sent for top-level navigation</li>
          <li><strong>• None</strong> - Sent for all requests (requires Secure)</li>
        </ul><br>

        <h3>JWT vs Cookies</h3>
        <p>
        • JWT can be stored inside cookies or localStorage.<br>
        • Storing JWT in HttpOnly cookie is more secure than localStorage<br>
        • because it prevents JavaScript access (reduces XSS risk).<br>
        </p><br>

        <h3>Cookie Size & Limitations</h3>
        <ul>
          <li>• 4KB per cookie</li>
          <li>• 20-50 cookies per domain (browser dependent)</li>
          <li>• Sent with every HTTP request (affects performance)</li>
        </ul><br>

        <h3>Advanced Concepts</h3>
        <ul>
          <li>• Signed Cookies (prevent tampering)</li>
          <li>• Encrypted Cookies</li>
          <li>• Token Rotation Strategy</li>
          <li>• Refresh Token stored in HttpOnly cookie</li>
        </ul><br>

        <h3>Best Practices</h3>
        <ul>
          <li>• Store minimal data</li>
          <li>• Always use HttpOnly + Secure in production</li>
          <li>• Set proper expiration</li>
          <li>• Avoid storing sensitive data directly</li>
          <li>• Rotate tokens periodically</li>
        </ul>
      `,
                                codeExamples: [
                                    `// Spring Boot - Secure Cookie with SameSite
import org.springframework.http.ResponseCookie;

ResponseCookie cookie = ResponseCookie.from("token", jwtToken)
    .httpOnly(true)
    .secure(true)
    .path("/")
    .maxAge(60 * 60)
    .sameSite("Strict")
    .build();

response.setHeader("Set-Cookie", cookie.toString());`,

                                    `// Example Set-Cookie Header
Set-Cookie: token=abc123; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,

                                    `// Refresh Token Strategy Concept
Access Token -> Short Expiry (15 min)
Refresh Token -> Long Expiry (7 days, stored in HttpOnly cookie)`
                                ]
                            }
                        ]
                    },

                    {
                        id: "httpsession",
                        name: "HttpSession",
                        beginner: [
                            {
                                content: `
        <h2>What is HttpSession?</h2>
        <p>
        • HttpSession is an interface provided by Java Servlet API that allows
        you to store user-specific data on the server side.
        </p>
        <p>
        • Since HTTP is stateless, HttpSession helps maintain user state
        across multiple requests.
        </p><br>

        <h3>Why HttpSession is Needed?</h3>
        <ul>
          <li>• Maintain user login state</li>
          <li>• Store user-specific data (username, role)</li>
          <li>• Shopping cart management</li>
          <li>• Temporary server-side storage</li>
        </ul><br>

        <h3>How HttpSession Works</h3>
        <ol>
          <li>• User sends first request</li>
          <li>• Server creates session and generates Session ID</li>
          <li>• Session ID is stored in JSESSIONID cookie</li>
          <li>• Browser sends JSESSIONID in future requests</li>
          <li>• Server retrieves session using Session ID</li>
        </ol><br>

        <h3>Important Point</h3>
        <p>
        • Session data is stored on the server, not in the browser.
        </p>
      `,
                                codeExamples: [
                                    `// Creating / Getting Session
HttpSession session = request.getSession();`,

                                    `// Storing Data in Session
session.setAttribute("username", "Ashish");`,

                                    `// Getting Data from Session
String username = (String) session.getAttribute("username");`,

                                    `// Removing Attribute
session.removeAttribute("username");`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
        <h2>Session Lifecycle</h2>
        <ul>
          <li>• Session is created using request.getSession()</li>
          <li>• Session remains active until timeout or invalidation</li>
          <li>• Default timeout: 30 minutes (configurable)</li>
        </ul>

        <h3>Configuring Session Timeout (web.xml)</h3>
        <pre>
< session-config >
  < session-timeout >15< /session-timeout  >
< /session-config >
        </pre>

        <h3>Invalidate Session (Logout)</h3>
        <p>
        • When user logs out, session should be invalidated.
        </p><br>

        <h3>Difference: getSession(true) vs getSession(false)</h3>
        <ul>
          <li>• <strong>true</strong> → creates new session if not exists</li>
          <li>• <strong>false</strong> → returns null if session not exists</li>
        </ul>
      `,
                                codeExamples: [
                                    `// Logout Example
HttpSession session = request.getSession(false);
if (session != null) {
    session.invalidate();
}`,

                                    `// Set Session Timeout (Programmatically)
session.setMaxInactiveInterval(10 * 60); // 10 minutes`,

                                    `// Check Session ID
String sessionId = session.getId();
System.out.println("Session ID: " + sessionId);`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
        <h2>Session Tracking Mechanisms</h2>
        <ul>
          <li>• Cookies (JSESSIONID)</li>
          <li>• URL Rewriting</li>
          <li>• Hidden Form Fields</li>
          <li>• SSL Sessions</li>
        </ul><br>

        <h3>Session Fixation Attack</h3>
        <p>
        • An attacker sets a known session ID before login.<br>
        • After login, attacker reuses the same session.<br>
        </p><br>

        <h3>Prevention</h3>
        <ul>
          <li>• Invalidate old session after login</li>
          <li>• Create new session ID</li>
        </ul><br>

        <h3>Session vs Cookies</h3>
        <ul>
          <li>• Session → Stored on server</li>
          <li>• Cookies → Stored on browser</li>
          <li>• Session more secure for sensitive data</li>
        </ul><br>

        <h3>Best Practices</h3>
        <ul>
          <li>• Always invalidate session on logout</li>
          <li>• Set proper timeout</li>
          <li>• Do not store large objects in session</li>
          <li>• Use HTTPS</li>
        </ul>
      `,
                                codeExamples: [
                                    `// Prevent Session Fixation (After Login)
HttpSession oldSession = request.getSession(false);
if (oldSession != null) {
    oldSession.invalidate();
}

HttpSession newSession = request.getSession(true);
newSession.setAttribute("username", "Ashish");`,

                                    `// URL Rewriting Example
response.encodeURL("dashboard.jsp");`
                                ]
                            }
                        ]
                    },

                    {
                        id: "urlrewriting",
                        name: "URL Rewriting",
                        beginner: [
                            {
                                content: `
        <h2>What is URL Rewriting?</h2>
        <p>
        • URL Rewriting is a session tracking technique where session data 
          (usually a session ID) is appended to the URL.
        </p>

        <p>
         • It is commonly used when cookies are disabled in the browser.
        </p><br>

        <h3>Example URL:</h3>
        <p><b>http://example.com/home;jsessionid=12345</b></p><br>

        <h3>Why Use URL Rewriting?</h3>
        <ul>
          <li>• Maintains session without cookies</li>
          <li>• Simple to implement</li>
          <li>• Works in all browsers</li>
        </ul>
      `,
                                codeExamples: [
                                    `// Adding session ID manually
String url = response.encodeURL("home.jsp");  // appends ;jsessionid=... only when cookies are unavailable
response.sendRedirect(url);`,

                                    `// Using encodeURL (recommended)
String url = response.encodeURL("home.jsp");
response.sendRedirect(url);`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
        <h2>How URL Rewriting Works Internally</h2>
        <p>
          • When a client makes a request, the server creates a session and 
          generates a unique session ID.
        </p>

        <p>
          • If cookies are disabled, the server appends the session ID to the URL.
        </p><br>

        <h3>Methods Used in Servlet API:</h3>
        <ul>
          <li>• response.encodeURL(String url)</li>
          <li>• response.encodeRedirectURL(String url)</li>
        </ul><br>

        <h3>Advantages</h3>
        <ul>
          <li>• Does not depend on cookies</li>
          <li>• Easy session tracking</li>
        </ul><br>

        <h3>Disadvantages</h3>
        <ul>
          <li>• Session ID visible in URL</li>
          <li>• Security risks (URL sharing)</li>
          <li>• URL length increases</li>
        </ul>
      `,
                                codeExamples: [
                                    `// Servlet Example
protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {

    HttpSession session = request.getSession();
    session.setAttribute("username", "Ashish");

    String encodedURL = response.encodeURL("profile.jsp");
    response.getWriter().println("<a href='" + encodedURL + "'>Go to Profile</a>");
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
        <h2>Security Considerations in URL Rewriting</h2>
        <p>
          • Since the session ID is visible in the URL, it can be exposed via:
        </p>
        <ul>
          <li>• Browser history</li>
          <li>• Bookmarks</li>
          <li>• Log files</li>
          <li>• Referer headers</li>
        </ul><br>

        <h3>Security Risks</h3>
        <ul>
          <li>• Session Hijacking</li>
          <li>• Session Fixation</li>
        </ul><br>

        <h3>Best Practices</h3>
        <ul>
          <li>• Always use HTTPS</li>
          <li>• Regenerate session ID after login</li>
          <li>• Use encodeURL() instead of manual appending</li>
          <li>• Prefer cookies when available</li>
        </ul><br>

        <h3>When to Use URL Rewriting?</h3>
        <p>
          • URL Rewriting should be used only when cookies are disabled or not supported.
          Modern applications prefer cookies or token-based authentication.
        </p>
      `,
                                codeExamples: [
                                    `// Regenerating session after login (Session Fixation prevention)
HttpSession oldSession = request.getSession(false);
if (oldSession != null) {
    oldSession.invalidate();
}

HttpSession newSession = request.getSession(true);
newSession.setAttribute("user", "Ashish");`
                                ]
                            }
                        ]
                    },

                    {
                        id: "hiddenformfields",
                        name: "Hidden Form Fields",
                        beginner: [
                            {
                                content: `
        <h2>What are Hidden Form Fields?</h2>
        <p>
         • Hidden Form Fields are a session tracking technique where data is stored
          inside an HTML form using input fields of type <b>hidden</b>.
        </p>

        <p>
          • The data is not visible to the user but is sent to the server when
          the form is submitted.
        </p><br>

        <h3>Why Use Hidden Fields?</h3>
        <ul>
          <li>• Maintain user data between requests</li>
          <li>• Simple implementation</li>
          <li>• Works without cookies</li>
        </ul><br>
      `,
                                codeExamples: [
                                    `<!-- HTML Example -->
<form action="nextServlet" method="post">
    <input type="hidden" name="username" value="Ashish" />
    <input type="submit" value="Next" />
</form>`,

                                    `// Reading hidden field in Servlet
String username = request.getParameter("username");
response.getWriter().println("Welcome " + username);`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
        <h2>How Hidden Form Fields Work</h2>
        <p>
          • The server embeds data into hidden input fields inside a form.
          When the form is submitted, the hidden data is sent along with
          other form parameters.
        </p><br>

        <h3>Important Points</h3>
        <ul>
          <li>• Data is visible in page source</li>
          <li>• Data can be modified using browser developer tools</li>
          <li>• Works only with form submission</li>
        </ul><br>

        <h3>Advantages</h3>
        <ul>
          <li>• No dependency on cookies</li>
          <li>• Easy to implement</li>
        </ul><br>

        <h3>Disadvantages</h3>
        <ul>
          <li>• Security risks (data tampering)</li>
          <li>• Works only when form is submitted</li>
          <li>• Not suitable for large data</li>
        </ul>
      `,
                                codeExamples: [
                                    `// Servlet Example
protected void doPost(HttpServletRequest request, HttpServletResponse response)
        throws ServletException, IOException {

    String userId = request.getParameter("userId");

    response.setContentType("text/html");
    response.getWriter().println(
        "<form action='finalServlet' method='post'>" +
        "<input type='hidden' name='userId' value='" + userId + "'/>" +
        "<input type='submit' value='Continue'/>" +
        "</form>"
    );
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
        <h2>Security Considerations</h2>
        <p>
         • Hidden fields are not secure because users can modify them
          using browser developer tools.
        </p><br>

        <h3>Common Risks</h3>
        <ul>
          <li>• Parameter Tampering</li>
          <li>• Privilege Escalation</li>
          <li>• Data Manipulation</li>
        </ul><br>

        <h3>Best Practices</h3>
        <ul>
          <li>• Never store sensitive data in hidden fields</li>
          <li>• Validate all data on the server side</li>
          <li>• Use server-side session (HttpSession) for secure data</li>
          <li>• Use CSRF tokens for form security</li>
        </ul><br>

        <h3>When to Use Hidden Fields?</h3>
        <p>
          • Hidden fields are suitable for small, non-sensitive data that
          needs to be passed between form submissions.<br>
          • They should not replace secure session management mechanisms.
        </p>
      `,
                                codeExamples: [
                                    `// Example: Server-side validation
String role = request.getParameter("role");

// Always validate on server
if (!"USER".equals(role)) {
    role = "USER"; // enforce default role
}`
                                ]
                            }
                        ]
                    },

                    {
                        id: "sessiontrackingcomparison",
                        name: "Session Tracking Techniques Comparison",
                        beginner: [
                            {
                                content: `
        <h2>What is Session Tracking?</h2>
        <p>
          • Session Tracking is a mechanism used to maintain user-specific
          data across multiple HTTP requests.
        </p>

        <p>
          • Since HTTP is stateless, session tracking helps identify
          a user between requests.
        </p><br>

        <h3>Main Session Tracking Techniques</h3>
        <ul>
          <li>• Cookies</li>
          <li>• URL Rewriting</li>
          <li>• Hidden Form Fields</li>
          <li>• HttpSession (Server-side session)</li>
        </ul>
      `
                            }
                        ],
                        intermediate: [
                            {
                                content: `
        <h2>Comparison Table</h2>

        <table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

          <tr>
            <th>Technique</th>
            <th>Storage Location</th>
            <th>Security</th>
            <th>Works Without Cookies?</th>
          </tr>
          <tr>
            <td>Cookies</td>
            <td>Client-side (Browser)</td>
            <td>Medium</td>
            <td>No</td>
          </tr>
          <tr>
            <td>URL Rewriting</td>
            <td>URL</td>
            <td>Low</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Hidden Fields</td>
            <td>HTML Form</td>
            <td>Low</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>HttpSession</td>
            <td>Server-side</td>
            <td>High</td>
            <td>Yes (with URL rewriting fallback)</td>
          </tr>
        </table><br>

        <h3>Quick Explanation</h3>
        <ul>
          <li><b>• Cookies:</b> Stored in browser, sent automatically with each request.</li>
          <li><b>• URL Rewriting:</b> Session ID appended to URL.</li>
          <li><b>• Hidden Fields:</b> Data passed through form submission.</li>
          <li><b>• HttpSession:</b> Secure server-side session storage.</li>
        </ul>
      `
                            }
                        ],
                        expert: [
                            {
                                content: `
        <h2>Detailed Technical Comparison</h2>

        <h3>1. Cookies</h3>
        <ul>
          <li>• Stored in browser memory or disk</li>
          <li>• Limited size (~4KB)</li>
          <li>• Can be disabled by user</li>
          <li>• Can use HttpOnly & Secure flags</li>
        </ul><br>

        <h3>2. URL Rewriting</h3>
        <ul>
          <li>• Session ID visible in URL</li>
          <li>• Risk of session hijacking</li>
          <li>• Not suitable for sensitive applications</li>
        </ul><br>

        <h3>3. Hidden Form Fields</h3>
        <ul>
          <li>• Works only with form submission</li>
          <li>• Data can be modified using browser tools</li>
        </ul><br>

        <h3>4. HttpSession</h3>
        <ul>
          <li>• Stores data on server</li>
          <li>• More secure</li>
          <li>• Supports session timeout</li>
          <li>• Scalable using distributed session management</li>
        </ul><br>

        <h3>Best Practice Recommendation</h3>
        <p>
          • For modern applications, use <b>HttpSession</b> or
          token-based authentication (like JWT).<br>
          • Use URL rewriting only as a fallback when cookies are disabled.
        </p>
      `
                            }
                        ]
                    }

                ]
            },

            {
                id: 'servletconfiguration',
                name: 'Servlet Configuration',
                topics: [

                    {
                        id: "web-xml-deployment-descriptor",
                        name: "web.xml (Deployment Descriptor)",
                        beginner: [
                            {
                                content: `
<h2>What is web.xml?</h2>
<p>
  <b>• web.xml</b> is called the Deployment Descriptor of a Java Web Application.<br>
  • It is an XML configuration file that defines how the web application
  should behave inside the servlet container.
</p>

<p>
 • It is located inside the <b>WEB-INF</b> folder and cannot be accessed directly
  from the browser.
</p><br>

<h3>Why is it Important?</h3>
<ul>
  <li>• Central configuration file for web applications</li>
  <li>• Controls request routing</li>
  <li>• Defines lifecycle behavior</li>
  <li>• Manages session settings</li>
</ul><br>

<h3>Main Responsibilities</h3>
<ul>
  <li>• Configure Servlets</li>
  <li>• Map URLs to Servlets</li>
  <li>• Configure Filters & Listeners</li>
  <li>• Define Welcome Files</li>
  <li>• Session Configuration</li>
  <li>• Error Handling</li>
</ul><br>

<h3>When is web.xml Loaded?</h3>
<p>
  • It is loaded when the server starts or when the application is deployed.
</p><br>
`,
                                codeExamples: [
                                    `<!-- Basic web.xml structure -->
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee
         http://xmlns.jcp.org/xml/ns/javaee/web-app_3_1.xsd"
         version="3.1">

</web-app>`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
<h2>Servlet Configuration in web.xml</h2>
<br>
<h3>1. Define Servlet</h3>
<p>• Register the servlet class inside web.xml.</p><br>

<h3>2. Map URL Pattern</h3>
<p>• Map a URL to the servlet.</p><br>

<h3>3. Initialization Parameters</h3>
<p>
 • You can define servlet-specific parameters using &lt;init-param&gt;.
</p><br>

<h3>4. Welcome File List</h3>
<p>
 • Defines the default page when user accesses application root.
</p><br>

<h3>5. Session Timeout</h3>
<p>
 • Defines session expiration time (in minutes).
</p><br>

<h3>6. MIME Mapping</h3>
<p>
 • Used to define custom file extension types.
</p>
`,
                                codeExamples: [
                                    `<!-- Servlet Declaration with Init Params -->
<servlet>
    <servlet-name>MyServlet</servlet-name>
    <servlet-class>com.example.MyServlet</servlet-class>
    <init-param>
        <param-name>message</param-name>
        <param-value>Hello World</param-value>
    </init-param>
</servlet>

<!-- Servlet Mapping -->
<servlet-mapping>
    <servlet-name>MyServlet</servlet-name>
    <url-pattern>/home</url-pattern>
</servlet-mapping>`,

                                    `<!-- Welcome File Configuration -->
<welcome-file-list>
    <welcome-file>index.jsp</welcome-file>
    <welcome-file>home.jsp</welcome-file>
</welcome-file-list>`,

                                    `<!-- Session Timeout -->
<session-config>
    <session-timeout>30</session-timeout>
</session-config>`,

                                    `<!-- MIME Mapping -->
<mime-mapping>
    <extension>pdf</extension>
    <mime-type>application/pdf</mime-type>
</mime-mapping>`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
<h2>Advanced web.xml Configuration</h2>
<br>
<h3>1. Filter Configuration</h3>
<p>
  • Filters intercept requests and responses before reaching servlet.<br>
  • Used for authentication, logging, compression, etc.
</p><br>

<h3>2. Listener Configuration</h3>
<p>
 • Listeners monitor application, session, and request lifecycle events.
</p><br>

<h3>3. Error Page Configuration</h3>
<p>
  • Custom error pages can be configured for specific HTTP errors
  or Java exceptions.
</p><br>

<h3>4. Context Parameters</h3>
<p>
 • Global configuration parameters accessible via ServletContext.
</p><br>

<h3>5. Security Configuration</h3>
<p>
 • Declarative security can be defined using security constraints.
</p><br>

<h3>6. Ordering & Metadata</h3>
<p>
 • Using metadata-complete="true" disables annotation scanning.
</p><br>

<h3>Annotation vs web.xml</h3>
<ul>
  <li>• Servlet 3.0+ supports annotations (@WebServlet, @WebFilter)</li>
  <li>• web.xml provides centralized configuration</li>
  <li>• Preferred in large enterprise applications</li>
  <li>• Annotations reduce XML boilerplate</li>
</ul><br>

<h3>Best Practices</h3>
<ul>
  <li>• Keep configuration clean and organized</li>
  <li>• Use web.xml for production-grade centralized config</li>
  <li>• Combine annotations and XML wisely</li>
  <li>• Document complex configurations</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- Filter Configuration -->
<filter>
    <filter-name>AuthFilter</filter-name>
    <filter-class>com.example.AuthFilter</filter-class>
</filter>

<filter-mapping>
    <filter-name>AuthFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>`,

                                    `<!-- Listener Configuration -->
<listener>
    <listener-class>com.example.AppListener</listener-class>
</listener>`,

                                    `<!-- Error Page Configuration (Exception Based) -->
<error-page>
    <exception-type>java.lang.Exception</exception-type>
    <location>/error.jsp</location>
</error-page>`,

                                    `<!-- Security Constraint -->
<security-constraint>
    <web-resource-collection>
        <web-resource-name>Admin Area</web-resource-name>
        <url-pattern>/admin/*</url-pattern>
    </web-resource-collection>
    <auth-constraint>
        <role-name>ADMIN</role-name>
    </auth-constraint>
</security-constraint>`,

                                    `<!-- Disable Annotation Scanning -->
<web-app metadata-complete="true" version="3.1"
         xmlns="http://xmlns.jcp.org/xml/ns/javaee">
</web-app>`
                                ]
                            }
                        ]
                    },

                    {
                        id: "servlet-mapping",
                        name: "Servlet Mapping",
                        beginner: [
                            {
                                content: `
<h2>What is Servlet Mapping?</h2>
<p>
 • Servlet Mapping is the process of associating a URL pattern 
  with a specific servlet class.
</p>

<p>
 • When a client sends a request to a particular URL, the 
  servlet container routes the request to the mapped servlet.
</p><br>

<h3>Why is Mapping Required?</h3>
<ul>
  <li>• To connect browser URL with servlet class</li>
  <li>• To handle client requests properly</li>
  <li>• To avoid direct access to class files</li>
  <li>• To define clear request handling logic</li>
</ul><br>

<h3>Where is Mapping Defined?</h3>
<ul>
  <li>• Inside web.xml file (Deployment Descriptor)</li>
  <li>• Using @WebServlet annotation (Servlet 3.0+)</li>
</ul><br>

<h3>Basic Flow</h3>
<ol>
  <li>• User enters URL</li>
  <li>• Servlet container checks mapping</li>
  <li>• Matching servlet is executed</li>
</ol>
`,
                                codeExamples: [
                                    `<!-- web.xml Example -->
<servlet>
    <servlet-name>MyServlet</servlet-name>
    <servlet-class>com.example.MyServlet</servlet-class>
</servlet>

<servlet-mapping>
    <servlet-name>MyServlet</servlet-name>
    <url-pattern>/home</url-pattern>
</servlet-mapping>`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
<h2>Types of URL Patterns in Servlet Mapping</h2>

<h3>1. Exact Match</h3>
<p>• /home → Matches exactly /home</p><br>

<h3>2. Path Mapping</h3>
<p>• /admin/* → Matches all URLs under /admin</p><br>

<h3>3. Extension Mapping</h3>
<p>• *.do → Matches all URLs ending with .do</p><br>

<h3>4. Default Mapping</h3>
<p>• / → Handles all unmatched requests</p><br>

<h3>Multiple URL Patterns</h3>
<p>
 • A single servlet can handle multiple URL patterns.
</p><br>

<h3>Load on Startup</h3>
<p>
 • Using &lt;load-on-startup&gt; element in web.xml,
  servlet can be loaded when server starts.
</p><br>

<h3>Servlet 3.0 Annotation-Based Mapping</h3>
<p>
 • Instead of web.xml, we can use @WebServlet annotation.
</p>
`,
                                codeExamples: [
                                    `// Annotation-based mapping
@WebServlet("/home")
public class MyServlet extends HttpServlet {
}`,

                                    `// Multiple URL patterns
@WebServlet(urlPatterns = {"/home", "/dashboard"})
public class MyServlet extends HttpServlet {
}`,

                                    `<!-- Load on Startup -->
<servlet>
    <servlet-name>InitServlet</servlet-name>
    <servlet-class>com.example.InitServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
<h2>How Servlet Container Resolves Mapping</h2>

<p>
 • When multiple mappings match a request, the servlet container
  follows this priority order:
</p>

<ol>
  <li>• Exact Match</li>
  <li>• Longest Path Match</li>
  <li>• Extension Match</li>
  <li>• Default Servlet</li>
</ol><br>

<h3>Mapping Conflict Handling</h3>
<ul>
  <li>• Duplicate URL patterns cause deployment errors</li>
  <li>• web.xml configuration overrides annotations if metadata-complete="true"</li>
</ul><br>

<h3>Performance Considerations</h3>
<ul>
  <li>• Exact match is fastest</li>
  <li>• Avoid excessive wildcard mappings</li>
  <li>• Organize URL hierarchy logically</li>
</ul><br>

<h3>Security Considerations</h3>
<ul>
  <li>• Use secure URL naming conventions</li>
  <li>• Restrict sensitive paths via filter or security constraints</li>
</ul><br>

<h3>Best Practices</h3>
<ul>
  <li>• Use REST-style URL patterns</li>
  <li>• Keep mappings readable and meaningful</li>
  <li>• Prefer annotations for modern applications</li>
  <li>• Use web.xml for centralized enterprise configuration</li>
</ul><br>

<h3>Common Mistakes</h3>
<ul>
  <li>• Duplicate URL patterns</li>
  <li>• Incorrect path syntax</li>
  <li>• Mapping conflicts between web.xml and annotations</li>
  <li>• Using /* unintentionally (overrides other mappings)</li>
</ul>
`,
                                codeExamples: [
                                    `// Example of Path Mapping
@WebServlet("/admin/*")
public class AdminServlet extends HttpServlet {
}`,

                                    `// Example of Extension Mapping
@WebServlet("*.do")
public class ActionServlet extends HttpServlet {
}`,

                                    `<!-- Security Constraint Example -->
<security-constraint>
    <web-resource-collection>
        <web-resource-name>Admin Area</web-resource-name>
        <url-pattern>/admin/*</url-pattern>
    </web-resource-collection>
</security-constraint>`
                                ]
                            }
                        ]
                    },

                    {
                        id: "init-parameters",
                        name: "Init Parameters",
                        beginner: [
                            {
                                content: `
<h2>What are Init Parameters?</h2>
<p>
 • Init Parameters (Initialization Parameters) are configuration values
  provided to a servlet during initialization.
</p>

<p>
 • They are defined in <b>web.xml</b> and accessed inside the servlet
  using the <b>ServletConfig</b> object.
</p><br>

<h3>Why Use Init Parameters?</h3>
<ul>
  <li>• To provide configuration without hardcoding values</li>
  <li>• To make application flexible</li>
  <li>• To separate configuration from business logic</li>
  <li>• To change values without modifying source code</li>
</ul><br>

<h3>Types of Init Parameters</h3>
<ul>
  <li>• Servlet-specific Init Parameters</li>
  <li>• Context-wide (Global) Parameters</li>
</ul><br>

<h3>Key Point</h3>
<p>
 • Init parameters are read-only and available after servlet initialization.
</p>
`,
                                codeExamples: [
                                    `<!-- Servlet-specific Init Parameter -->
<servlet>
    <servlet-name>MyServlet</servlet-name>
    <servlet-class>com.example.MyServlet</servlet-class>

    <init-param>
        <param-name>message</param-name>
        <param-value>Hello User</param-value>
    </init-param>
</servlet>`,

                                    `// Accessing Init Parameter in Servlet
public void init() throws ServletException {
    String msg = getServletConfig().getInitParameter("message");
    System.out.println(msg);
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
<h2>ServletConfig vs ServletContext Parameters</h2>

<h3>1. Servlet-Specific Init Parameters</h3>
<ul>
  <li>• Defined inside &lt;servlet&gt; tag</li>
  <li>• Accessible using ServletConfig</li>
  <li>• Available only to that servlet</li>
</ul><br>

<h3>2. Context Parameters (Global)</h3>
<ul>
  <li>• Defined using &lt;context-param&gt;</li>
  <li>• Accessible using ServletContext</li>
  <li>• Shared across entire application</li>
</ul><br>

<h3>3. Lifecycle Understanding</h3>
<ul>
  <li>• init() method is called only once</li>
  <li>• Parameters are loaded at servlet startup</li>
  <li>• Useful for loading configuration resources</li>
</ul><br>

<h3>4. Access Methods</h3>
<ul>
  <li>• getServletConfig().getInitParameter()</li>
  <li>• getServletContext().getInitParameter()</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- Context Parameter (Global) -->
<context-param>
    <param-name>dbUrl</param-name>
    <param-value>jdbc:mysql://localhost:3306/testdb</param-value>
</context-param>`,

                                    `// Accessing Context Parameter
ServletContext context = getServletContext();
String dbUrl = context.getInitParameter("dbUrl");
System.out.println(dbUrl);`,

                                    `// Using ServletConfig Object
public void init(ServletConfig config) throws ServletException {
    super.init(config);
    String value = config.getInitParameter("message");
    System.out.println(value);
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
<h2>Advanced Usage of Init Parameters</h2>

<h3>1. Real-World Use Cases</h3>
<ul>
  <li>• Database configuration (URL, driver name)</li>
  <li>• Email server configuration</li>
  <li>• File upload directory path</li>
  <li>• Application constants</li>
</ul><br>

<h3>2. Load-on-Startup with Init Parameters</h3>
<p>
 • When combined with &lt;load-on-startup&gt;, configuration can be loaded
  immediately during server startup.
</p><br>

<h3>3. Lifecycle & Performance</h3>
<ul>
  <li>• Init parameters are immutable</li>
  <li>• Loaded once per servlet lifecycle</li>
  <li>• Improves performance by avoiding repeated configuration loading</li>
</ul><br>

<h3>4. Security Considerations</h3>
<ul>
  <li>• Avoid storing passwords in web.xml</li>
  <li>• Use environment variables for sensitive data</li>
  <li>• Consider external configuration files (.properties)</li>
</ul><br>

<h3>5. Annotation-Based Init Parameters</h3>
<p>
 • Init parameters can also be defined using @WebInitParam annotation.
</p><br>

<h3>6. Best Practices</h3>
<ul>
  <li>• Use context parameters for shared settings</li>
  <li>• Use servlet init parameters for servlet-specific configs</li>
  <li>• Document parameter usage clearly</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- Load on Startup Example -->
<servlet>
    <servlet-name>StartupServlet</servlet-name>
    <servlet-class>com.example.StartupServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>`,

                                    `// Annotation-based Init Parameter
@WebServlet(
    urlPatterns = "/home",
    initParams = {
        @WebInitParam(name = "message", value = "Welcome User")
    }
)
public class MyServlet extends HttpServlet {

    public void init() {
        String msg = getServletConfig().getInitParameter("message");
        System.out.println(msg);
    }
}`
                                ]
                            }
                        ]
                    },

                    {
                        id: "context-parameters",
                        name: "Context Parameters",
                        beginner: [
                            {
                                content: `
<h2>What are Context Parameters?</h2>
<p>
 • Context Parameters are global initialization parameters
  defined in <b>web.xml</b> that are accessible to the entire web application.
</p>

<p>
 • They are configured using the &lt;context-param&gt; tag
  and accessed using the <b>ServletContext</b> object.
</p><br>

<h3>Why Use Context Parameters?</h3>
<ul>
  <li>• To store application-wide configuration</li>
  <li>• To avoid hardcoding values</li>
  <li>• To share configuration across multiple servlets</li>
</ul><br>

<h3>Important Point</h3>
<p>
 • Context parameters are available to all servlets, JSPs, and filters.
</p>
`,
                                codeExamples: [
                                    `<!-- Defining Context Parameter -->
<context-param>
    <param-name>appName</param-name>
    <param-value>MyWebApplication</param-value>
</context-param>`,

                                    `// Accessing Context Parameter in Servlet
ServletContext context = getServletContext();
String appName = context.getInitParameter("appName");
System.out.println(appName);`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
<h2>Context Parameters vs Init Parameters</h2>

<h3>1. Context Parameters</h3>
<ul>
  <li>• Defined using &lt;context-param&gt;</li>
  <li>• Accessible using ServletContext</li>
  <li>• Shared across entire application</li>
</ul><br>

<h3>2. Servlet Init Parameters</h3>
<ul>
  <li>• Defined inside &lt;servlet&gt;</li>
  <li>• Accessible using ServletConfig</li>
  <li>• Specific to a single servlet</li>
</ul><br>

<h3>Lifecycle Behavior</h3>
<ul>
  <li>• Loaded when application starts</li>
  <li>• Available until application stops</li>
  <li>• Immutable during runtime</li>
</ul> <br>

<h3>Common Use Cases</h3>
<ul>
  <li>• Database URL</li>
  <li>• Application name</li>
  <li>• Email server configuration</li>
  <li>• File storage path</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- Multiple Context Parameters -->
<context-param>
    <param-name>dbUrl</param-name>
    <param-value>jdbc:mysql://localhost:3306/testdb</param-value>
</context-param>

<context-param>
    <param-name>supportEmail</param-name>
    <param-value>support@example.com</param-value>
</context-param>`,

                                    `// Access inside init()
public void init() {
    ServletContext context = getServletContext();
    String dbUrl = context.getInitParameter("dbUrl");
    System.out.println("Database URL: " + dbUrl);
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
<h2>Advanced Concepts of Context Parameters</h2>

<h3>1. Application Scope</h3>
<p>
 •  Context parameters exist at application scope and are shared
  across all servlets, filters, and listeners.
</p><br>

<h3>2. Performance Consideration</h3>
<ul>
  <li>• Loaded once at application startup</li>
  <li>• Efficient for static configuration values</li>
</ul><br>

<h3>3. Security Considerations</h3>
<ul>
  <li>• Do not store sensitive data like passwords</li>
  <li>• Prefer external configuration files or environment variables</li>
</ul><br>

<h3>4. Using with Listeners</h3>
<p>
 • Context parameters are often used inside ServletContextListener
  to initialize resources (like DB connections) during application startup.
</p><br>

<h3>5. Annotation-Based Alternative</h3>
<p>
 • Using @WebListener with ServletContextListener allows reading
  context parameters without relying only on web.xml.
</p><br>

<h3>Best Practices</h3>
<ul>
  <li>• Use for shared configuration only</li>
  <li>• Keep values environment-specific</li>
  <li>• Document parameter usage clearly</li>
</ul>
`,
                                codeExamples: [
                                    `// Using Context Parameter in Listener
@WebListener
public class AppListener implements ServletContextListener {

    public void contextInitialized(ServletContextEvent event) {
        ServletContext context = event.getServletContext();
        String dbUrl = context.getInitParameter("dbUrl");
        System.out.println("App Started with DB: " + dbUrl);
    }

    public void contextDestroyed(ServletContextEvent event) {
        System.out.println("Application Stopped");
    }
}`
                                ]
                            }
                        ]
                    },

                    {
                        id: "annotations-webservlet",
                        name: "Annotations (@WebServlet)",
                        beginner: [
                            {
                                content: `
<h2>What is @WebServlet?</h2>
<p>
  <b>• @WebServlet</b> is an annotation introduced in Servlet 3.0
  that allows servlet configuration directly inside the servlet class
  instead of configuring it inside web.xml.
</p>

<p>
 • It is part of annotation-based configuration which simplifies
  web application development.
</p><br>

<h3>Why Was @WebServlet Introduced?</h3>
<ul>
  <li>• To reduce heavy XML configuration</li>
  <li>• To make configuration closer to code</li>
  <li>• To simplify small and medium-sized applications</li>
</ul><br>

<h3>Basic Syntax</h3>
<p>
 • @WebServlet("/urlPattern")
</p><br>

<h3>How It Works</h3>
<ol>
  <li>• Server starts</li>
  <li>• Container scans classes for annotations</li>
  <li>• Servlet is automatically registered</li>
</ol>
`,
                                codeExamples: [
                                    `import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import java.io.IOException;

@WebServlet("/home")
public class MyServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {

        response.getWriter().println("Hello from @WebServlet");
    }
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
<h2>@WebServlet Attributes Explained</h2>

<p>• @WebServlet supports multiple configuration attributes:</p>

<ul>
  <li>• <b>name</b> – Logical name of the servlet</li>
  <li>• <b>urlPatterns / value</b> – URL mapping</li>
  <li>• <b>initParams</b> – Initialization parameters</li>
  <li>• <b>loadOnStartup</b> – Load priority at startup</li>
  <li>• <b>asyncSupported</b> – Enables asynchronous processing</li>
</ul><br>

<h3>Multiple URL Patterns</h3>
<p>
 • A single servlet can respond to multiple URL endpoints.
</p><br>

<h3>Asynchronous Support</h3>
<p>
 • asyncSupported = true allows non-blocking request processing.
</p><br>

<h3>Load On Startup Behavior</h3>
<ul>
  <li>• 0 or positive → Loaded at startup</li>
  <li>• Negative or default → Loaded on first request</li>
</ul>
`,
                                codeExamples: [
                                    `@WebServlet(
    name = "MyServlet",
    urlPatterns = {"/home", "/dashboard"},
    loadOnStartup = 1,
    asyncSupported = true
)
public class MyServlet extends HttpServlet {
}`,

                                    `@WebServlet(
    urlPatterns = "/config",
    initParams = {
        @WebInitParam(name = "env", value = "production"),
        @WebInitParam(name = "version", value = "1.0")
    }
)
public class ConfigServlet extends HttpServlet {

    public void init() {
        String env = getServletConfig().getInitParameter("env");
        System.out.println("Environment: " + env);
    }
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
<h2>Deep Dive into @WebServlet</h2>

<h3>1. Annotation Processing Mechanism</h3>
<p>
 • During application startup, the servlet container scans all classes
  inside WEB-INF/classes and JAR files inside WEB-INF/lib. <br>
 • If it finds @WebServlet, it registers the servlet automatically.
</p>

<h3>2. Annotation vs web.xml Priority</h3>
<ul>
  <li>• If both exist, web.xml configuration overrides annotation.</li>
  <li>• If metadata-complete="true" is set in web.xml,
      annotation scanning is disabled.</li>
</ul><br>

<h3>3. Mapping Resolution Rules</h3>
<ul>
  <li>• Exact match has highest priority</li> 
  <li>• Longest path match next</li>
  <li>• Extension mapping next</li>
  <li>• Default mapping last</li>
</ul><br>

<h3>4. Async Processing Example</h3>
<p>
• Useful for long-running tasks like file uploads,
  external API calls, etc.
</p><br>

<h3>5. Limitations</h3>
<ul>
  <li>• No centralized configuration file</li>
  <li>• Harder to manage in large enterprise apps</li>
  <li>• May increase startup time due to class scanning</li>
</ul><br>

<h3>6. Best Practices</h3>
<ul>
  <li>• Use clear and REST-style URL patterns</li>
  <li>• Avoid duplicate mappings</li>
  <li>• Use packages to organize servlets logically</li>
  <li>• Combine annotations with filters and listeners wisely</li>
</ul><br>

<h3>Enterprise Recommendation</h3>
<p>
 • Small Projects → Prefer annotations  
 • Large Enterprise Systems → Combine web.xml + annotations strategically
</p>
`,
                                codeExamples: [
                                    `@WebServlet(
    name = "AsyncServlet",
    urlPatterns = "/process",
    asyncSupported = true
)
public class AsyncServlet extends HttpServlet {

    protected void doGet(HttpServletRequest request,
                         HttpServletResponse response)
                         throws IOException {

        AsyncContext ctx = request.startAsync();
        ctx.start(() -> {
            try {
                ctx.getResponse().getWriter().println("Async Processing Finished");
            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                ctx.complete();   // REQUIRED: without this the response is never committed
            }                     // and the client hangs until the async timeout
        });
    }
}`,

                                    `<!-- metadata-complete Example -->
<web-app metadata-complete="true"
         xmlns="http://xmlns.jcp.org/xml/ns/javaee"
         version="3.1">
</web-app>`
                                ]
                            }
                        ]
                    },

                ]
            },

            {
                id: 'filter',
                name: 'Servlet Filter',
                topics: [

                    {
                        id: "introduction-to-filters",
                        name: "Introduction to Filters",
                        beginner: [
                            {
                                content: `
<h2>What is a Filter?</h2>
<p>
 • A <b>Filter</b> is a server-side component in the Java Servlet API
  that intercepts client requests and responses before they reach
  a servlet or after leaving a servlet.
</p><br>

<h3>Purpose of Filters</h3>
<ul>
  <li>• Pre-processing requests (e.g., authentication, logging)</li>
  <li>• Post-processing responses (e.g., compression, encoding)</li>
  <li>• Separation of cross-cutting concerns</li>
</ul><br>

<h3>Filter Lifecycle</h3>
<ul>
  <li><b>• init()</b> – Called once when filter is first loaded</li>
  <li><b>• doFilter()</b> – Called for every request/response</li>
  <li><b>• destroy()</b> – Called before filter removal</li>
</ul><br>

<h3>Execution Flow</h3>
<p>
  <b>• Client → Filter → Servlet → Filter → Client</b>
</p>
`,
                                codeExamples: [
                                    `import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import java.io.IOException;

@WebFilter("/home")
public class MyFilter implements Filter {

    public void init(FilterConfig config) {
        System.out.println("Filter initialized");
    }

    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
                         throws IOException, ServletException {

        System.out.println("Before Servlet Execution");
        chain.doFilter(request, response); // Pass request to next resource
        System.out.println("After Servlet Execution");
    }

    public void destroy() {
        System.out.println("Filter destroyed");
    }
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
<h2>Types of Filters</h2>

<ul>
  <li><b>• Authentication Filter</b> – Checks user login and session</li>
  <li><b>• Authorization Filter</b> – Validates user roles</li>
  <li><b>• Logging Filter</b> – Logs request/response details</li>
  <li><b>• Compression Filter</b> – Compresses response data</li>
  <li><b>• Encoding Filter</b> – Sets character encoding (UTF-8)</li>
  <li><b>• CORS Filter</b> – Handles cross-origin requests</li>
</ul><br>

<h3>Filter Mapping</h3>
<p>
 • Filters can be mapped using either URL patterns or servlet names.
</p>
`,
                                codeExamples: [
                                    `<filter>
    <filter-name>LoggingFilter</filter-name>
    <filter-class>com.example.LoggingFilter</filter-class>
</filter>

<filter-mapping>
    <filter-name>LoggingFilter</filter-name>
    <url-pattern>/*</url-pattern>
</filter-mapping>`
                                ]
                            },
                            {
                                content: `
<h2>Filter Chain</h2>

<p>
 • When multiple filters are applied, they form a chain.<br>
 • Each filter must call <b>chain.doFilter()</b> to pass
  control to the next filter or servlet.
</p><br>

<h3>Important Rule</h3>
<p>• If chain.doFilter() is not called, the request will not reach the servlet.</p>
`
                            },
                            {
                                content: `
<h2>Filter vs Interceptor</h2>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">

<tr>
<th>Feature</th>
<th>Filter</th>
<th>Interceptor (Spring)</th>
</tr>
<tr>
<td>Technology</td>
<td>Servlet API</td>
<td>Spring MVC</td>
</tr>
<tr>
<td>Execution</td>
<td>Before and after servlet</td>
<td>Before and after controller method</td>
</tr>
<tr>
<td>Access</td>
<td>No access to controller</td>
<td>Full access to controller & model</td>
</tr>
<tr>
<td>Use Cases</td>
<td>Cross-cutting concerns (logging, auth)</td>
<td>Business-level pre/post processing</td>
</tr>
</table>
`
                            }
                        ],
                        expert: [
                            {
                                content: `
<h2>Advanced Filter Concepts</h2>

<h3>Dispatcher Types</h3>
<p>Filters can be applied to different dispatcher types:</p>
<ul>
  <li>• REQUEST – Direct client requests</li>
  <li>• FORWARD – When RequestDispatcher.forward() is called</li>
  <li>• INCLUDE – When RequestDispatcher.include() is called</li>
  <li>• ERROR – On error page handling</li>
  <li>• ASYNC – For asynchronous processing</li>
</ul><br>

<h3>Response Wrapping</h3>
<p>• Filters can wrap HttpServletResponse to modify output, headers, or content.</p><br>

<h3>Asynchronous Filters</h3>
<p>• Use asyncSupported=true for non-blocking processing of requests.</p><br>

<h3>Spring Boot Filters</h3>
<p>
• In Spring Boot, filters can be registered via @Component or FilterRegistrationBean.
</p>
`,
                                codeExamples: [
                                    `@Component
public class LoggingFilter implements Filter {

    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
                         throws IOException, ServletException {

        System.out.println("Request intercepted");
        chain.doFilter(request, response);
    }
}`,

                                    `@Bean
public FilterRegistrationBean<LoggingFilter> loggingFilter() {
    FilterRegistrationBean<LoggingFilter> registration =
        new FilterRegistrationBean<>();

    registration.setFilter(new LoggingFilter());
    registration.addUrlPatterns("/*");
    registration.setOrder(1); // Set execution order
    return registration;
}`
                                ]
                            },
                            {
                                content: `
<h2>Advanced Security and Performance Practices</h2>

<ul>
  <li>• Centralize authentication and authorization in filters</li>
  <li>• Validate input to prevent XSS and SQL injection</li>
  <li>• Compress and cache responses for performance</li>
  <li>• Keep filter logic lightweight to reduce overhead</li>
  <li>• Use filter order to control execution sequence</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "filter-lifecycle",
                        name: "Filter Lifecycle",
                        beginner: [
                            {
                                content: `
<h2>What is Filter Lifecycle?</h2>
<p>
• Every filter in the Java Servlet API follows a defined lifecycle
  managed by the servlet container.
</p><br>

<h3>Main Lifecycle Methods</h3>
<ul>
  <li><b>• init()</b> – Called once when the filter is created. Used for initialization.</li>
  <li><b>• doFilter()</b> – Called for every request/response that matches the filter mapping.</li>
  <li><b>• destroy()</b> – Called once when the filter is removed or application shuts down.</li>
</ul>

<h3>Execution Flow</h3>
<p>
  <b>• Container creates filter → init() → doFilter() (per request) → destroy() (on shutdown)</b>
</p>
`,
                                codeExamples: [
                                    `@WebFilter("/home")
public class MyFilter implements Filter {

    public void init(FilterConfig config) {
        System.out.println("Filter initialized with config: " + config.getFilterName());
    }

    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
                         throws IOException, ServletException {

        System.out.println("Processing request before servlet");
        chain.doFilter(request, response);
        System.out.println("Processing response after servlet");
    }

    public void destroy() {
        System.out.println("Filter destroyed");
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>init() Method</h2>
<p>
 • Called once when the filter is first instantiated by the servlet container.
</p>
<ul>
  <li>• Used to read configuration parameters from web.xml or annotations.</li>
  <li>• Set up resources like database connections, loggers, or cache.</li>
</ul>

<h3>Example</h3>
`,
                                codeExamples: [
                                    `public void init(FilterConfig config) {
    String encoding = config.getInitParameter("encoding");
    if (encoding == null) {
        encoding = "UTF-8";
    }
    System.out.println("Using encoding: " + encoding);
}`
                                ]
                            },
                            {
                                content: `
<h2>doFilter() Method</h2>
<p>
 • Called for every request and response that matches the filter mapping.<br>
 • It can perform pre-processing and post-processing.<br>
</p><br>

<h3>Pre-processing</h3>
<ul>
  <li>• Logging request data</li>
  <li>• Authentication checks</li>
  <li>• Encoding setup</li>
</ul><br>

<h3>Post-processing</h3>
<ul>
  <li>• Compressing response</li>
  <li>• Adding custom headers</li>
  <li>• Logging response time</li>
</ul>
`,
                                codeExamples: [
                                    `public void doFilter(ServletRequest request,
                     ServletResponse response,
                     FilterChain chain)
                     throws IOException, ServletException {

    System.out.println("Before servlet");
    chain.doFilter(request, response);
    System.out.println("After servlet");
}`
                                ]
                            },
                            {
                                content: `
<h2>destroy() Method</h2>
<p>
• Called once when the filter is removed or the application shuts down.<br>
• Used to release resources acquired in init().
</p>
<ul>
  <li>• Close database connections</li>
  <li>• Clear caches</li>
  <li>• Release file handles or threads</li>
</ul>
`,
                                codeExamples: [
                                    `public void destroy() {
    System.out.println("Filter resources released");
}`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Advanced Lifecycle Concepts</h2>

<h3>1. Filter Initialization Order</h3>
<ul>
  <li>• Order defined in web.xml execution order</li>
  <li>• @WebFilter annotations execute based on container scanning order</li>
</ul><br>

<h3>2. Async Filters</h3>
<p>
 • Filters can be async-supported to process asynchronous requests
  (asyncSupported=true). Lifecycle methods remain the same.
</p><br>

<h3>3. Resource Management</h3>
<ul>
  <li>• Use init() to allocate heavy resources once</li>
  <li>• Always release in destroy() to prevent memory leaks</li>
  <li>• doFilter() should be lightweight to handle high throughput</li>
</ul><br>

<h3>4. Error Handling in Lifecycle</h3>
<ul>
  <li>• Exceptions in init() prevent filter from being registered</li>
  <li>• Exceptions in doFilter() can propagate to error pages</li>
  <li>• destroy() should handle exceptions gracefully</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Best Practices</h2>
<ul>
  <li>• Keep init() minimal; avoid heavy processing here</li>
  <li>• Use doFilter() for per-request logic only</li>
  <li>• Release all resources in destroy() to prevent leaks</li>
  <li>• Always call chain.doFilter() unless intentionally blocking request</li>
  <li>• Use logging to monitor filter lifecycle events for debugging</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "authentication-filter-example",
                        name: "Authentication Filter Example",
                        beginner: [
                            {
                                content: `
<h2>What is an Authentication Filter?</h2>
<p>
 • An <b>Authentication Filter</b> is a servlet filter that checks if a user
  is logged in before allowing access to protected resources.
</p><br>

<h3>Purpose</h3>
<ul>
  <li>• Prevent unauthorized access</li>
  <li>• Redirect unauthenticated users to login page</li>
  <li>• Centralize authentication logic</li>
</ul>
`,
                                codeExamples: [
                                    `@WebFilter("/admin/*")
public class AuthFilter implements Filter {

    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
                         throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Check session for logged-in user
        if(req.getSession(false) == null ||
           req.getSession(false).getAttribute("user") == null) {

            // Redirect to login page
            res.sendRedirect("login.jsp");
            return;
        }

        // Continue request if authenticated
        chain.doFilter(request, response);
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Enhancing Authentication Filter</h2>

<p>We can enhance the filter by:</p>
<ul>
  <li>• Checking user roles (authorization)</li>
  <li>• Allowing public URLs to bypass authentication</li>
  <li>• Logging authentication attempts</li>
</ul>
`,
                                codeExamples: [
                                    `@WebFilter("/*")
public class AuthFilter implements Filter {

    private List<String> publicUrls = Arrays.asList("/login.jsp", "/register.jsp");

    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
                         throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String path = req.getServletPath();

        // Skip authentication for public URLs
        if(publicUrls.contains(path)) {
            chain.doFilter(request, response);
            return;
        }

        // Check session
        HttpSession session = req.getSession(false);
        if(session == null || session.getAttribute("user") == null) {
            res.sendRedirect("login.jsp");
            return;
        }

        // Optionally check user roles
        String role = (String) session.getAttribute("role");
        if(path.startsWith("/admin") && !"admin".equals(role)) {
            res.sendRedirect("accessDenied.jsp");
            return;
        }

        chain.doFilter(request, response);
    }
}`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Advanced Authentication Filter</h2>

<h3>1. JWT Authentication</h3>
<p>
 • Use filters to validate JSON Web Tokens (JWT) in HTTP headers.
</p><br>

<h3>2. Security Best Practices</h3>
<ul>
  <li>• Always invalidate sessions on logout</li>
  <li>• Use HTTPS to prevent token/session hijacking</li>
  <li>• Log authentication failures for monitoring</li>
  <li>• Keep filter lightweight for performance</li>
</ul><br>

<h3>3. Spring Boot Integration</h3>
<p>
 • In Spring Boot, authentication filters can be registered via
  <b>FilterRegistrationBean</b> or <b>@Component</b>.
</p>
`,
                                codeExamples: [
                                    `// JWT Authentication Filter
@Component
public class JwtAuthFilter implements Filter {

    public void doFilter(ServletRequest request,
                         ServletResponse response,
                         FilterChain chain)
                         throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String authHeader = req.getHeader("Authorization");
        if(authHeader == null || !authHeader.startsWith("Bearer ")) {
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid token");
            return;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parser()
                .setSigningKey("secretKey")
                .parseClaimsJws(token)
                .getBody();

            req.setAttribute("claims", claims);

        } catch (Exception e) {
            res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        }

        chain.doFilter(request, response);
    }
}`
                                ]
                            }
                        ]
                    }

                ]
            },

            {
                id: 'listener',
                name: 'Servlet Listener',
                topics: [

                    {
                        id: "servletcontextlistener",
                        name: "ServletContextListener",
                        beginner: [
                            {
                                content: `
<h2>What is ServletContextListener?</h2>
<p>
  <b>• ServletContextListener</b> is an interface in the Servlet API
  that allows you to listen to lifecycle events of a web application's
  context.
</p><br>

<h3>Purpose</h3>
<ul>
  <li>• Execute code when the web application starts or stops</li>
  <li>• Initialize shared resources like database connections</li>
  <li>• Clean up resources on shutdown</li>
</ul>
`,
                                codeExamples: [
                                    `import jakarta.servlet.ServletContextListener;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class AppContextListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        System.out.println("Application started");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("Application stopped");
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Use Cases of ServletContextListener</h2>
<ul>
  <li>• Initialize database connection pool at startup</li>
  <li>• Load configuration settings into memory</li>
  <li>• Initialize logging frameworks</li>
  <li>• Perform cleanup operations at application shutdown</li>
</ul>
`,
                                codeExamples: [
                                    `@WebListener
public class ConfigLoaderListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        String configFile = sce.getServletContext().getInitParameter("configFile");
        System.out.println("Loading config from: " + configFile);
        // Load config into application scope
        sce.getServletContext().setAttribute("appConfig", loadConfig(configFile));
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("Application shutting down, cleaning resources");
        // Close resources if necessary
    }

    private Map<String, String> loadConfig(String file) {
        // Dummy config loader
        Map<String, String> config = new HashMap<>();
        config.put("appName", "MyApp");
        return config;
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Accessing ServletContext Attributes</h2>
<p>
• Attributes set in contextInitialized() can be accessed by any servlet
  or JSP using <b>ServletContext.getAttribute()</b>.
</p>
`,
                                codeExamples: [
                                    `ServletContext context = getServletContext();
Map<String, String> config = (Map<String, String>) context.getAttribute("appConfig");
System.out.println("Application Name: " + config.get("appName"));`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Advanced ServletContextListener Concepts</h2>

<h3>1. Integration with Filters and Servlets</h3>
<p>
• ServletContextListener can initialize resources before any servlet or filter is executed.
</p><br>

<h3>2. Resource Management</h3>
<ul>
  <li>• Open database connections in contextInitialized()</li>
  <li>• Close connections in contextDestroyed()</li>
  <li>• Initialize caches and logging frameworks</li>
</ul><br>

<h3>3. Ordering Listeners</h3>
<p>
• Multiple listeners are executed in the order they are defined in web.xml or based on @WebListener scanning.
</p><br>

<h3>4. Best Practices</h3>
<ul>
  <li>• Keep initialization lightweight to avoid slow startup</li>
  <li>• Handle exceptions gracefully during startup</li>
  <li>• Use context attributes to share resources across the application</li>
  <li>• Always clean up resources to prevent memory leaks</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Example: Database Connection Pool</h2>
<p>
• Initialize a connection pool at startup and store it in ServletContext.
</p>
`,
                                codeExamples: [
                                    `@WebListener
public class DBConnectionListener implements ServletContextListener {

    private DataSource dataSource;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            // Initialize database connection pool
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:mysql://localhost:3306/testdb");
            config.setUsername("root");
            config.setPassword("password");
            dataSource = new HikariDataSource(config);

            // Store in context for global access
            sce.getServletContext().setAttribute("DataSource", dataSource);
            System.out.println("Database connection pool initialized");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        if(dataSource != null) {
            ((HikariDataSource) dataSource).close();
            System.out.println("Database connection pool closed");
        }
    }
}`
                                ]
                            }
                        ]
                    },

                    {
                        id: "httpsessionlistener",
                        name: "HttpSessionListener",
                        beginner: [
                            {
                                content: `
<h2>What is HttpSessionListener?</h2>
<p>
  <b>• HttpSessionListener</b> is an interface in the Java Servlet API
  that allows you to listen to lifecycle events of HTTP sessions.
</p><br>

<h3>Purpose</h3>
<ul>
  <li>• Track creation and destruction of sessions</li>
  <li>• Monitor user activity</li>
  <li>• Perform cleanup when session expires</li>
</ul><br>

<h3>Session Lifecycle Events</h3>
<ul>
  <li><b>• sessionCreated</b> – triggered when a session is created.</li>
  <li><b>• sessionDestroyed</b> – triggered when a session is invalidated or times out.</li>
</ul>
`,
                                codeExamples: [
                                    `import jakarta.servlet.http.HttpSessionListener;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class SessionListener implements HttpSessionListener {

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        System.out.println("Session created: " + se.getSession().getId());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        System.out.println("Session destroyed: " + se.getSession().getId());
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Use Cases of HttpSessionListener</h2>
<ul>
  <li>• Count active users</li>
  <li>• Invalidate sessions on logout or timeout</li>
  <li>• Cleanup user-specific resources</li>
  <li>• Log session events for auditing</li>
  <li>• Track session creation time for monitoring</li>
</ul>
`,
                                codeExamples: [
                                    `import java.util.concurrent.atomic.AtomicInteger;

@WebListener
public class ActiveUserCounter implements HttpSessionListener {

    private static final AtomicInteger activeSessions = new AtomicInteger();  // int++ is not atomic and these callbacks run on concurrent request threads

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        System.out.println("New session created. Active sessions: " + activeSessions.incrementAndGet());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        activeSessions.updateAndGet(n -> n > 0 ? n - 1 : 0);
        System.out.println("Session destroyed. Active sessions: " + activeSessions.get());
    }

    public static int getActiveSessions() {
        return activeSessions.get();
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Session Timeout Handling</h2>
<p>
• Sessions can expire automatically after a configured timeout.<br>
• HttpSessionListener can detect this and perform cleanup.
</p>
<ul>
  <li>• Defined via <b>web.xml</b> or programmatically</li>
  <li>• Useful for releasing session-specific resources</li>
</ul>
`,
                                codeExamples: [
                                    `<session-config>
    <session-timeout>15</session-timeout> <!-- in minutes -->
</session-config>`,

                                    `@Override
public void sessionDestroyed(HttpSessionEvent se) {
    System.out.println("Session expired or invalidated: " + se.getSession().getId());
    // Remove user-specific resources here
}`
                                ]
                            },
                            {
                                content: `
<h2>Tracking Session Attributes</h2>
<p>
• HttpSessionListener can be combined with <b>HttpSessionAttributeListener</b> 
  to monitor user attributes added or removed during a session.
</p>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Advanced Concepts</h2>

<h3>1. Session Attribute Cleanup</h3>
<p>
• Use HttpSessionListener to remove sensitive information from memory
  when a session expires.
</p><br>

<h3>2. Distributed/Clustered Environments</h3>
<p>
• In a cluster, session events may propagate across nodes.
  Ensure cleanup does not remove active sessions from other nodes.
</p><br>

<h3>3. Security Best Practices</h3>
<ul>
  <li>• Invalidate sessions on logout</li>
  <li>• Use HTTPS to prevent session hijacking</li>
  <li>• Limit session lifetime</li>
  <li>• Monitor unusual session creation/destruction patterns</li>
</ul><br>

<h3>4. Integration with Filters</h3>
<p>
• Filters can intercept requests and check session validity, 
  while HttpSessionListener tracks lifecycle events.
</p>
`
                            },
                            {
                                content: `
<h2>Example: Track Active Users and Cleanup</h2>
`,
                                codeExamples: [
                                    `@WebListener
public class UserSessionListener implements HttpSessionListener {

    private static Set<String> activeUsers = ConcurrentHashMap.newKeySet();
    private static Map<String, Long> sessionStartTime = new ConcurrentHashMap<>();

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        HttpSession session = se.getSession();
        System.out.println("Session created: " + session.getId());
        sessionStartTime.put(session.getId(), System.currentTimeMillis());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        HttpSession session = se.getSession();
        String username = (String) session.getAttribute("username");

        if(username != null) {
            activeUsers.remove(username);
            System.out.println("User logged out or session expired: " + username);
        }

        Long startTime = sessionStartTime.remove(session.getId());
        if(startTime != null) {
            long duration = System.currentTimeMillis() - startTime;
            System.out.println("Session " + session.getId() + " lasted " + duration/1000 + " seconds");
        }
    }

    public static void addUser(String username) {
        activeUsers.add(username);
    }

    public static Set<String> getActiveUsers() {
        return activeUsers;
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Additional Expert Tips</h2>
<ul>
  <li>• Combine with <b>HttpSessionBindingListener</b> to monitor individual attribute changes.</li>
  <li>• Use <b>ConcurrentHashMap</b> or thread-safe collections to track users in multi-threaded environments.</li>
  <li>• Always handle null session attributes to prevent NullPointerExceptions.</li>
  <li>• Log session lifecycle events for debugging and auditing purposes.</li>
  <li>• Use session metadata (creation time, last accessed time) for analytics and monitoring.</li>
</ul>
`
                            }
                        ]
                    },

                    {
                        id: "requestlistener",
                        name: "ServletRequestListener",
                        beginner: [
                            {
                                content: `
<h2>What is ServletRequestListener?</h2>
<p>
  <b>• ServletRequestListener</b> is an interface in the Servlet API
  that allows you to listen to lifecycle events of servlet requests.
</p><br>

<h3>Purpose</h3>
<ul>
  <li>• Monitor when a request is created and destroyed</li>
  <li>• Useful for logging, analytics, or resource initialization</li>
  <li>• Track request processing time</li>
</ul>
`,
                                codeExamples: [
                                    `import jakarta.servlet.ServletRequestListener;
import jakarta.servlet.ServletRequestEvent;
import jakarta.servlet.annotation.WebListener;

@WebListener
public class RequestLogger implements ServletRequestListener {

    @Override
    public void requestInitialized(ServletRequestEvent sre) {
        System.out.println("Request initialized: " + sre.getServletRequest().getRemoteAddr());
    }

    @Override
    public void requestDestroyed(ServletRequestEvent sre) {
        System.out.println("Request destroyed: " + sre.getServletRequest().getRemoteAddr());
    }
}`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Use Cases of ServletRequestListener</h2>
<ul>
  <li>• Log each incoming HTTP request</li>
  <li>• Track request processing time</li>
  <li>• Initialize request-scoped resources</li>
  <li>• Monitor request counts for analytics</li>
</ul>
`,
                                codeExamples: [
                                    `@WebListener
public class RequestTimingListener implements ServletRequestListener {

    @Override
    public void requestInitialized(ServletRequestEvent sre) {
        sre.getServletRequest().setAttribute("startTime", System.currentTimeMillis());
        System.out.println("Request started at " + System.currentTimeMillis());
    }

    @Override
    public void requestDestroyed(ServletRequestEvent sre) {
        Long startTime = (Long) sre.getServletRequest().getAttribute("startTime");
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("Request processed in " + duration + " ms");
    }
}`
                                ]
                            },
                            {
                                content: `
<h2>Integration with Filters</h2>
<p>
• ServletRequestListener works alongside filters to track request lifecycle:
</p>
<ul>
  <li>• Filters can modify request/response objects</li>
  <li>• RequestListener monitors overall request lifecycle</li>
</ul>
`
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>Advanced Concepts</h2>

<h3>1. Request Metrics & Monitoring</h3>
<p>
• Track concurrent requests, request rate, and processing times
  for performance monitoring.
</p><br>

<h3>2. Resource Management</h3>
<ul>
  <li>• Initialize request-scoped resources in requestInitialized()</li>
  <li>• Cleanup in requestDestroyed() to avoid memory leaks</li>
</ul><br>

<h3>3. Security Applications</h3>
<ul>
  <li>• Log IP addresses for each request</li>
  <li>• Detect unusual traffic patterns</li>
  <li>• Monitor request headers and parameters for auditing</li>
</ul><br>

<h3>4. Best Practices</h3>
<ul>
  <li>• Keep listener logic lightweight</li>
  <li>• Do not perform heavy DB operations in listener</li>
  <li>• Use thread-safe collections if tracking multiple requests</li>
  <li>• Combine with filters and session listeners for complete monitoring</li>
</ul>
`
                            },
                            {
                                content: `
<h2>Example: Track Request Count and Duration</h2>
`,
                                codeExamples: [
                                    `@WebListener
public class RequestCounterListener implements ServletRequestListener {

    private static AtomicInteger activeRequests = new AtomicInteger(0);

    @Override
    public void requestInitialized(ServletRequestEvent sre) {
        int count = activeRequests.incrementAndGet();
        sre.getServletRequest().setAttribute("startTime", System.currentTimeMillis());
        System.out.println("Request started. Active requests: " + count);
    }

    @Override
    public void requestDestroyed(ServletRequestEvent sre) {
        int count = activeRequests.decrementAndGet();
        Long startTime = (Long) sre.getServletRequest().getAttribute("startTime");
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("Request finished in " + duration + " ms. Active requests: " + count);
    }

    public static int getActiveRequests() {
        return activeRequests.get();
    }
}`
                                ]
                            }
                        ]
                    }

                ]
            },

            {
                id: 'exception-handling',
                name: 'Exception Handling',
                topics: [
                    {
                        id: "error-pages-webxml",
                        name: "Error Pages in web.xml",
                        beginner: [
                            {
                                content: `
                <h2>What are Error Pages?</h2>
                <p>
                • In Java web applications, error pages are custom pages that are displayed 
                when a server-side error occurs (like 404 Not Found or 500 Internal Server Error).<br>
                • Instead of showing default server errors, you can define user-friendly pages using <code>web.xml</code>.
                </p><br>

                <p>
                Common HTTP errors to handle:
                <ul>
                    <li>• 400 - Bad Request</li>
                    <li>• 401 - Unauthorized</li>
                    <li>• 403 - Forbidden</li>
                    <li>• 404 - Not Found</li>
                    <li>• 500 - Internal Server Error</li>
                </ul>
                </p>
            `,
                                codeExamples: [
                                    `
                <error-page>
                    <error-code>404</error-code>
                    <location>/errors/404.html</location>
                </error-page>

                <error-page>
                    <exception-type>java.lang.Throwable</exception-type>
                    <location>/errors/error.html</location>
                </error-page>
                `
                                ]
                            },
                            {
                                content: `
                <h2>Simple HTML Error Page Example</h2>
                <p>Beginner-friendly static HTML error page:</p>
            `,
                                codeExamples: [
                                    `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Page Not Found</title>
                </head>
                <body>
                    <h1>404 Error</h1>
                    <p>The page you requested does not exist.</p>
                    <a href="/index.jsp">Go to Home</a>
                </body>
                </html>
                `
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
                <h2>Configuring Multiple Error Pages</h2>
                <p>
                • You can configure multiple error pages for different HTTP codes and exceptions.<br>
                • This helps in providing tailored messages for different situations.
                </p>
            `,
                                codeExamples: [
                                    `
                <error-page>
                    <error-code>403</error-code>
                    <location>/errors/403.html</location>
                </error-page>
                
                <error-page>
                    <error-code>500</error-code>
                    <location>/errors/serverError.jsp</location>
                </error-page>
                
                <error-page>
                    <exception-type>java.lang.NullPointerException</exception-type>
                    <location>/errors/npe.jsp</location>
                </error-page>
                `
                                ]
                            },
                            {
                                content: `
                <h2>Dynamic Error Messages in JSP</h2>
                <p>
                • JSP error pages can use EL (Expression Language) and JSP tags to show dynamic details:
                </p>
            `,
                                codeExamples: [
                                    `
                <%@ page isErrorPage="true" %>
                <h1>Error Details</h1>
                <p>Status Code: {"$"request.getAttribute("jakarta.servlet.error.status_code")}</p>
                <p>Error Message: {"$"request.getAttribute("jakarta.servlet.error.message")}</p>
                <p>Exception: {"$"exception}</p>
                `
                                ]
                            },
                            {
                                content: `
                <h2>Forwarding vs Redirecting on Errors</h2>
                <p>
                <strong>• Forwarding:</strong> The URL in the browser remains the same; server internally forwards to error page.<br/>
                <strong>• Redirecting:</strong> Browser is sent a redirect response; URL changes.
                Forwarding is preferred for consistent error handling.
                </p>
            `
                            }
                        ],
                        expert: [
                            {
                                content: `
                <h2>Centralized Servlet Error Handling</h2>
                <p>
                Experts use a dedicated servlet for all exceptions. Benefits:
                <ul>
                    <li>• Centralized logging</li>
                    <li>• Custom response codes and messages</li>
                    <li>• Conditional error pages based on exception type</li>
                </ul>
                </p>
            `,
                                codeExamples: [
                                    `
                <error-page>
                    <exception-type>java.lang.Throwable</exception-type>
                    <location>/ErrorHandlerServlet</location>
                </error-page>
                
                // ErrorHandlerServlet.java
                protected void doGet(HttpServletRequest request, HttpServletResponse response)
                        throws ServletException, IOException {
                    Integer statusCode = (Integer) request.getAttribute("jakarta.servlet.error.status_code");
                    Throwable throwable = (Throwable) request.getAttribute("jakarta.servlet.error.exception");

                    if (statusCode == 404) {
                        request.getRequestDispatcher("/errors/404.jsp").forward(request, response);
                    } else if (throwable instanceof NullPointerException) {
                        request.getRequestDispatcher("/errors/npe.jsp").forward(request, response);
                    } else {
                        request.getRequestDispatcher("/errors/generalError.jsp").forward(request, response);
                    }

                    logger.error("Error occurred: Status={}, Exception={}", statusCode, throwable);
                }
                `
                                ]
                            },
                            {
                                content: `
                <h2>Best Practices for Error Pages</h2>
                <ul>
                    <li>• Always provide navigation links to home or main sections.</li>
                    <li>• Do not reveal stack traces or sensitive information to users.</li>
                    <li>• Log detailed error information on the server.</li>
                    <li>• Use consistent design for all error pages for better UX.</li>
                    <li>• Test error pages by simulating errors (e.g., throw exceptions in servlets).</li>
                </ul>
            `
                            },
                            {
                                content: `
                <h2>Integration with Logging Frameworks</h2>
                <p>
               • Integrate with frameworks like <code>log4j</code> or <code>SLF4J</code> to log all errors from error handling servlets or JSP pages.<br>
               • This helps in monitoring production issues effectively.
                </p>
            `,
                                codeExamples: [
                                    `
                import org.slf4j.Logger;
                import org.slf4j.LoggerFactory;

                public class ErrorHandlerServlet extends HttpServlet {
                    private static final Logger logger = LoggerFactory.getLogger(ErrorHandlerServlet.class);

                    protected void doGet(HttpServletRequest request, HttpServletResponse response)
                            throws ServletException, IOException {
                        Throwable throwable = (Throwable) request.getAttribute("jakarta.servlet.error.exception");
                        Integer statusCode = (Integer) request.getAttribute("jakarta.servlet.error.status_code");
                        logger.error("Error Occurred: Status={}, Exception={}", statusCode, throwable);
                        request.getRequestDispatcher("/errors/generalError.jsp").forward(request, response);
                    }
                }
                `
                                ]
                            }
                        ]
                    },

                    {
                        id: "customErrorHandling",
                        name: "Custom Error Handling",
                        beginner: [
                            {
                                content: `
                <h2>What is Custom Error Handling?</h2>
                <p>
                • Custom error handling allows developers to manage errors gracefully
                  in their applications instead of letting the program crash. <br>
                • It helps in giving meaningful messages to the user and logging errors for debugging.
                </p>
                <p>• In Java, we usually create custom exceptions by extending the Exception class.</p>
            `,
                                codeExamples: [
                                    `// Simple custom exception
class MyCustomException extends Exception {
    public MyCustomException(String message) {
        super(message);
    }
}

// Usage
try {
    throw new MyCustomException("Something went wrong!");
} catch (MyCustomException e) {
    System.out.println(e.getMessage());
}`
                                ]
                            },
                            {
                                content: `
                <h3>Why use custom exceptions?</h3>
                <ul>
                    <li>• Provide meaningful error messages to users</li>
                    <li>• Differentiate between different types of errors</li>
                    <li>• Enable better debugging and logging</li>
                    <li>• Make your code more readable and maintainable</li>
                </ul>
            `,
                                codeExamples: [
                                    `class LoginFailedException extends Exception {
    public LoginFailedException(String msg) { super(msg); }
}

try {
    throw new LoginFailedException("Incorrect username or password");
} catch (LoginFailedException e) {
    System.out.println(e.getMessage());
}`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
                <h2>Handling Multiple Exceptions</h2>
                <p>
                  • You can create multiple custom exceptions and handle them separately
                    to improve clarity and control.
                </p>
            `,
                                codeExamples: [
                                    `class InvalidInputException extends Exception {
    public InvalidInputException(String msg) { super(msg); }
}

class DatabaseException extends Exception {
    public DatabaseException(String msg) { super(msg); }
}

try {
    // Some code
    throw new InvalidInputException("Invalid user input");
} catch (InvalidInputException e) {
    System.out.println("Input Error: " + e.getMessage());
} catch (DatabaseException e) {
    System.out.println("DB Error: " + e.getMessage());
}`
                                ]
                            },
                            {
                                content: `
                <h3>Using finally block</h3>
                <p>
                • The finally block always executes regardless of an exception.<br>
                • It is useful for cleaning up resources like files, database connections, etc.
                </p>
            `,
                                codeExamples: [
                                    `try {
    // code that might throw exception
} catch (Exception e) {
    e.printStackTrace();
} finally {
    System.out.println("Cleanup code executed!");
}`
                                ]
                            },
                            {
                                content: `
                <h3>Try-with-resources (Java 7+)</h3>
                <p>
                  • For resources like streams, files, and connections, Java's try-with-resources
                    automatically closes resources and handles exceptions efficiently.
                </p>
            `,
                                codeExamples: [
                                    `try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
    String line;
    while ((line = br.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    e.printStackTrace();
}`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
                <h2>Advanced Custom Error Handling</h2>
                <p>
                    Expert-level error handling involves:
                    <ul>
                        <li>• Creating a hierarchy of custom exceptions</li>
                        <li>• Logging errors with frameworks (e.g., Log4j, SLF4J)</li>
                        <li>• Using global exception handling in web applications (like Spring Boot @ControllerAdvice)</li>
                        <li>• Recovering from exceptions or fallback mechanisms</li>
                        <li>• Adding error codes and metadata for API responses</li>
                    </ul>
                </p>
            `,
                                codeExamples: [
                                    `// Global exception handling in Spring Boot
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MyCustomException.class)
    public ResponseEntity<Map<String, Object>> handleCustomException(MyCustomException ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("code", "CUSTOM_ERROR");
        error.put("message", ex.getMessage());
        error.put("timestamp", LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAllExceptions(Exception ex) {
        Map<String, Object> error = new HashMap<>();
        error.put("code", "INTERNAL_ERROR");
        error.put("message", "An unexpected error occurred");
        error.put("timestamp", LocalDateTime.now());
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}`
                                ]
                            },
                            {
                                content: `
                <h3>Error Logging</h3>
                <p>
                • Logging exceptions with frameworks like Log4j or SLF4J is crucial for monitoring and debugging.<br>
                • Include exception stack traces, timestamps, and context.
                </p>
            `,
                                codeExamples: [
                                    `private static final Logger logger = LoggerFactory.getLogger(MyClass.class);

try {
    // code that may fail
} catch (Exception e) {
    logger.error("Exception occurred while processing request: ", e);
}`
                                ]
                            },
                            {
                                content: `
                <h3>Fallback and Recovery</h3>
                <p>
                • In resilient applications, you can implement fallback mechanisms for critical operations.<br>
                • For example, using default values, retrying failed operations, or switching to backup services.
                </p>
            `,
                                codeExamples: [
                                    `try {
    // primary service call
} catch (ServiceUnavailableException e) {
    // fallback
    logger.warn("Primary service failed, using backup service");
    backupService.call();
}`
                                ]
                            },
                            {
                                content: `
                <h3>Exception Hierarchy Best Practices</h3>
                <ul>
                    <li>• Group related exceptions under a common parent</li>
                    <li>• Use checked exceptions for recoverable errors</li>
                    <li>• Use unchecked exceptions for programming errors</li>
                    <li>• Provide meaningful messages and error codes</li>
                </ul>
            `
                            }
                        ]
                    }

                ]
            },

            {
                id: 'jsp-introduction',
                name: 'JSP Pages ',
                topics: [

                    {
                        id: "jsp-introduction",
                        name: "Introduction to JSP",

                        beginner: [
                            {
                                content: `
<h2>What is JSP?</h2>
<p><strong>JSP (JavaServer Pages)</strong> is a server-side technology used to create dynamic web applications using Java.</p>
<p>It allows developers to embed Java code inside HTML pages.</p>

<h3>Why JSP?</h3>
<ul>
<li>Used to create dynamic web pages</li>
<li>Easy to mix HTML and Java</li>
<li>Built on top of Servlet technology</li>
<li>Automatically converted into Servlet by the server</li>
</ul>

<h3>Basic JSP Example</h3>
<p>Example of displaying current date:</p>
            `,
                                codeExamples: [
                                    `<%@ page import="java.util.Date" %>
<html>
<body>
<h2>Current Date and Time:</h2>
<%= new Date() %>
</body>
</html>`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h2>Difference Between Servlet and JSP</h2>
<table border="1" cellpadding="5">
<tr>
<th>Servlet</th>
<th>JSP</th>
</tr>
<tr>
<td>Java class</td>
<td>HTML page with Java code</td>
</tr>
<tr>
<td>Used for business logic</td>
<td>Used for presentation logic</td>
</tr>
<tr>
<td>Requires doGet() / doPost()</td>
<td>No need to override methods</td>
</tr>
<tr>
<td>Hard to design UI</td>
<td>Easy to design UI</td>
</tr>
<tr>
<td>More Java code</td>
<td>More HTML code</td>
</tr>
</table>
            `
                            },
                            {
                                content: `
<h2>JSP Elements</h2>
<ul>
<li><strong>Directive</strong> - Provides global information about JSP page</li>
<li><strong>Scriptlet</strong> - Java code inside JSP</li>
<li><strong>Expression</strong> - Outputs data to browser</li>
<li><strong>Declaration</strong> - Declare variables and methods</li>
</ul>
            `,
                                codeExamples: [
                                    `<%@ page language="java" %>   <!-- Directive -->

<%! int count = 0; %>          <!-- Declaration -->

<% count++; %>                 <!-- Scriptlet -->

<%= count %>                   <!-- Expression -->`
                                ]
                            },
                            {
                                content: `
<h2>Implicit Objects in JSP</h2>
<p>JSP provides 9 implicit objects automatically:</p>
<ul>
<li>request</li>
<li>response</li>
<li>out</li>
<li>session</li>
<li>application</li>
<li>config</li>
<li>pageContext</li>
<li>page</li>
<li>exception</li>
</ul>
            `,
                                codeExamples: [
                                    `<%
String username = request.getParameter("name");
out.println("Welcome " + username);
%>`
                                ]
                            },
                            {
                                content: `
<h2>JSP Directives</h2>
<ul>
<li><strong>page</strong> directive</li>
<li><strong>include</strong> directive</li>
<li><strong>taglib</strong> directive</li>
</ul>
            `,
                                codeExamples: [
                                    `<%@ page contentType="text/html" %>
<%@ include file="header.jsp" %>`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h2>JSP Lifecycle</h2>
<p>JSP follows a lifecycle managed by the web container.</p>

<h3>Lifecycle Phases:</h3>
<ol>
<li>Translation</li>
<li>Compilation</li>
<li>Class Loading</li>
<li>Instantiation</li>
<li>Initialization - jspInit()</li>
<li>Request Processing - _jspService()</li>
<li>Destruction - jspDestroy()</li>
</ol>
            `,
                                codeExamples: [
                                    `<%! 
public void jspInit() {
    System.out.println("JSP Initialized");
}

public void jspDestroy() {
    System.out.println("JSP Destroyed");
}
%>`
                                ]
                            },
                            {
                                content: `
<h2>JSP Exception Handling</h2>
<p>JSP provides error handling using errorPage and isErrorPage attributes.</p>
            `,
                                codeExamples: [
                                    `<!-- In main.jsp -->
<%@ page errorPage="error.jsp" %>

<!-- In error.jsp -->
<%@ page isErrorPage="true" %>
<h2>Error Occurred</h2>
<%= exception.getMessage() %>`
                                ]
                            },
                            {
                                content: `
<h2>JSP Expression Language (EL)</h2>
<p>EL simplifies accessing data stored in request, session, and application scope.</p>
<ul>
<li>'$'{param.name}</li>
<li>'$'{sessionScope.user}</li>
</ul>
            `,
                                codeExamples: [
                                    `'$'{param.username}
'$'{sessionScope.user}`
                                ]
                            },
                            {
                                content: `
<h2>JSTL (JSP Standard Tag Library)</h2>
<p>JSTL provides tags for common tasks like iteration and condition handling.</p>
<ul>
<li>Core Tags</li>
<li>Formatting Tags</li>
<li>SQL Tags</li>
<li>XML Tags</li>
</ul>
            `,
                                codeExamples: [
                                    `<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<c:forEach var="i" begin="1" end="5">
    '$'{i} <br/>
</c:forEach>`
                                ]
                            },
                            {
                                content: `
<h2>JSP Custom Tags</h2>
<p>Custom tags allow reusable components in JSP pages.</p>
<ul>
<li>Tag Handler Class</li>
<li>TLD (Tag Library Descriptor)</li>
<li>Using custom tag in JSP</li>
</ul>
            `
                            },
                            {
                                content: `
<h2>MVC Architecture with JSP</h2>
<p>In MVC:</p>
<ul>
<li>Model - Java Beans / Business Logic</li>
<li>View - JSP</li>
<li>Controller - Servlet</li>
</ul>
<p>Best practice: Use JSP only for view, not for business logic.</p>
            `
                            }
                        ]
                    },

                    {
                        id: "jsp-elements",
                        name: "JSP Elements",

                        beginner: [
                            {
                                content: `
<h2>JSP Elements Overview</h2>
<p>JSP elements allow embedding Java code into HTML pages dynamically.</p>
<ul>
<li><b>Directives</b> – Configure JSP page globally.</li>
<li><b>Scripting Elements</b> – Java code inside JSP.</li>
<li><b>Expressions</b> – Output values to client directly.</li>
<li><b>Declarations</b> – Declare variables/methods.</li>
<li><b>Implicit Objects</b> – Built-in objects for request/response/session.</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- Simple JSP Page -->
<%@ page language="java" contentType="text/html; charset=UTF-8" %>
<html>
<head><title>JSP Elements Demo</title></head>
<body>
<h2>Welcome to JSP Elements Demo</h2>
<p>This is a basic JSP page.</p>
</body>
</html>`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h3>1. Directives (&lt;%@ %&gt;)</h3>
<p>Directives set page properties or include files:</p>
`,
                                codeExamples: [
                                    `<!-- Page directive -->
<%@ page language="java" contentType="text/html; charset=UTF-8" session="true" errorPage="error.jsp" %>

<!-- Include directive -->
<%@ include file="header.jsp" %>

<!-- Taglib directive -->
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>`
                                ]
                            },
                            {
                                content: `
<h3>2. Scripting Elements</h3>
<p>Embed Java code inside JSP:</p>
`,
                                codeExamples: [
                                    `<!-- Scriptlet -->
<%
String name = "Ashish";
out.println("Hello, " + name);
%>

<!-- Expression -->
<p>Current Time: <%= new java.util.Date() %></p>

<!-- Declaration -->
<%!
public String greet(String name) {
    return "Hello, " + name + " from JSP Declaration!";
}
%>
<p><%= greet("Ashish") %></p>

<!-- Loop Example -->
<%
for(int i = 1; i <= 5; i++){
    out.println("Iteration: " + i + "<br>");
}
%>`
                                ]
                            },
                            {
                                content: `
<h3>3. Implicit Objects</h3>
<p>Automatically available objects in JSP:</p>
<ul>
<li>request, response, out, session, application, config, page, pageContext, exception</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- Using request and session -->
<%
String username = request.getParameter("user");
session.setAttribute("username", username);
out.println("Welcome " + session.getAttribute("username"));
%>`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h3>4. Expression Language (EL)</h3>
<p>Access JavaBeans, Maps, Lists, and implicit objects without scriptlets:</p>
`,
                                codeExamples: [
                                    `<!-- EL Example -->
<p>User Name: '$'{user.name}</p>
<p>Session User: '$'{sessionScope.user}</p>
<p>Request Parameter ID: '$'{param.id}</p>`
                                ]
                            },
                            {
                                content: `
<h3>5. JSTL Example</h3>
<p>Loops and conditions without Java code:</p>
`,
                                codeExamples: [
                                    `<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<c:set var="names" value="'$'{['Ashish', 'Ravi', 'Neha']}" />
<ul>
<c:forEach var="name" items="'$'{names}">
    <li>Hello, '$'{name}</li>
</c:forEach>
</ul>

<c:if test="'$'{names.size() & gt; 2}">
                            < p > There are more than 2 names in the list </p>
                            </c:if>`
                                ]
                            },
                            {
                                content: `
<h3>6. Custom Tag Example</h3>
<p>Reusable JSP component:</p>
`,
                                codeExamples: [
                                    `<!-- Assuming a custom tag library mytags is defined -->
<mytags:hello message="Welcome to JSP Custom Tag Example"/>`
                                ]
                            },
                            {
                                content: `
<h3>7. Error Handling Example</h3>
<p>Use errorPage and isErrorPage to handle exceptions:</p>
`,
                                codeExamples: [
                                    `<!-- Main JSP -->
<%@ page errorPage="error.jsp" %>
<%= 10/0 %> <!-- Causes ArithmeticException -->

<!-- error.jsp -->
<%@ page isErrorPage="true" %>
<p>Error Occurred: <%= exception.getMessage() %></p>`
                                ]
                            },
                            {
                                content: `
<h3>8. Full JSP Page Example</h3>
<p>Demonstrates directives, scriptlets, EL, JSTL together:</p>
`,
                                codeExamples: [
                                    `<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<c:set var="names" value="'$'{['Ashish','Ravi','Neha']}" />

<html>
<head><title>JSP Full Example</title></head>
<body>
<h2>User List</h2>
<ul>
<c:forEach var="name" items="'$'{names}">
    <li>Hello, '$'{name}</li>
</c:forEach>
</ul>

<%
String currentDate = new java.util.Date().toString();
out.println("<p>Current Date: " + currentDate + "</p>");
%>

</body>
</html>`
                                ]
                            },
                            {
                                content: `
<h3>Best Practices</h3>
<ul>
<li>Use EL and JSTL over scriptlets for cleaner code.</li>
<li>Keep JSP focused on presentation.</li>
<li>Use directives and include files for modularity.</li>
<li>Precompile JSPs to improve first-load performance.</li>
<li>Use session and application objects wisely to avoid memory issues.</li>
</ul>`
                            }
                        ]
                    },

                    {
                        id: "jsp-directives",
                        name: "JSP Directives",

                        beginner: [
                            {
                                content: `
<h2>Introduction to JSP Directives</h2>
<p>JSP Directives provide global instructions to the JSP container. They are **not displayed on the web page** and affect page behavior, compilation, and structure.</p>
<ul>
<li><b>Page Directive</b> – Sets page properties like language, content type, session, error page.</li>
<li><b>Include Directive</b> – Includes static content during translation.</li>
<li><b>Taglib Directive</b> – Declares custom tag libraries for use in JSP.</li>
</ul>
`,
                                codeExamples: [
                                    `<!-- Page Directive -->
<%@ page language="java" contentType="text/html; charset=UTF-8" %>

<!-- Include Directive -->
<%@ include file="header.jsp" %>

<!-- Taglib Directive -->
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>`
                                ]
                            }
                        ],

                        intermediate: [
                            {
                                content: `
<h3>1. Page Directive (&lt;%@ page %&gt;)</h3>
<p>Used to define page-level properties. Common attributes:</p>
<ul>
<li><b>language</b> – Java is default (<code>language="java"</code>).</li>
<li><b>contentType</b> – MIME type of response (<code>contentType="text/html; charset=UTF-8"</code>).</li>
<li><b>session</b> – Enable or disable session (<code>session="true"</code>).</li>
<li><b>errorPage</b> – JSP page to handle exceptions (<code>errorPage="error.jsp"</code>).</li>
<li><b>buffer</b> – Output buffer size (<code>buffer="16kb"</code>).</li>
<li><b>isThreadSafe</b> – Defaults to true (concurrent requests allowed). Setting <code>isThreadSafe="false"</code> makes the container SERIALIZE requests one at a time - it adds queueing, it does not disable protection. Deprecated along with SingleThreadModel; write thread-safe pages instead.</li>
</ul>
`,
                                codeExamples: [
                                    `<%@ page language="java" contentType="text/html; charset=UTF-8" session="true" buffer="16kb" errorPage="error.jsp" %>
<html>
<body>
<h2>Page Directive Demo</h2>
<p>Session enabled and error page set.</p>
</body>
</html>`
                                ]
                            },
                            {
                                content: `
<h3>2. Include Directive (&lt;%@ include file="..." %&gt;)</h3>
<p>Includes static content at translation time (before JSP compilation). Useful for headers, footers.</p>
`,
                                codeExamples: [
                                    `<!-- main.jsp -->
<%@ include file="header.jsp" %>
<h2>Main Content</h2>
<%@ include file="footer.jsp" %> 

<!-- header.jsp -->
<div style="background-color:lightblue;"><h1>Header Section</h1></div>

<!-- footer.jsp -->
<div style="background-color:lightgray;"><h3>Footer Section</h3></div>`
                                ]
                            },
                            {
                                content: `
<h3>3. Taglib Directive (&lt;%@ taglib %&gt;)</h3>
<p>Used to declare a tag library (custom or standard) in JSP:</p>
<ul>
<li><b>uri</b> – URI of the tag library.</li>
<li><b>prefix</b> – Prefix to use for tags.</li>
</ul>
`,
                                codeExamples: [
                                    `<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<!-- Using JSTL forEach tag -->
<c:set var="names" value="'$'{['Ashish', 'Ravi', 'Neha']}" />
<ul>
<c:forEach var="name" items="'$'{names}">
   <li>'$'{name}</li>
</c:forEach>
</ul>`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `
<h3>Advanced Page Directive Attributes</h3>
<ul>
<li><b>isErrorPage</b> – Specifies if the JSP page is an error page (<code>true</code>/<code>false</code>).</li>
<li><b>import</b> – Import Java packages (<code>import="java.util.*,java.sql.*"</code>).</li>
<li><b>session</b> – Control session creation (<code>session="false"</code> to disable).</li>
<li><b>buffer</b> – Adjust buffer for large outputs.</li>
</ul>
`,
                                codeExamples: [
                                    `<%@ page language="java" contentType="text/html; charset=UTF-8" isErrorPage="true" import="java.util.*,java.sql.*" %>
<p>This JSP is an error page and can access the exception object.</p>`
                                ]
                            },
                            {
                                content: `
<h3>Example Combining All Directives</h3>
<pre>
<%@ page language="java" contentType="text/html; charset=UTF-8" session="true" errorPage="error.jsp" buffer="16kb" import="java.util.*" %>
<%@ include file="header.jsp" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

&lt;html&gt;
&lt;body&gt;
&lt;h2&gt;Combined JSP Directives Demo&lt;/h2&gt;
< c:set var="names" value="'$'{['Ashish', 'Ravi', 'Neha']}" />
< ul >
< c:forEach var="name" items="'$'{names}" >
   < li >'$'{name}</li>
< /c:forEach>
< /ul>
< p >Session ID: <%= session.getId() %></p >
&lt;/body&gt;
&lt;/html&gt;
</pre>`
                            },
                            {
                                content: `
<h3>Best Practices for JSP Directives</h3>
<ul>
<li>Use <b>page directive</b> to set content type, session, and error pages.</li>
<li>Use <b>include directive</b> for static header/footer content; use <b>jsp:include</b> for dynamic content.</li>
<li>Always declare JSTL or custom tag libraries with <b>taglib directive</b> to avoid compilation errors.</li>
<li>Keep JSP directives at the top of the JSP page for clarity.</li>
</ul>`
                            }
                        ]
                    },

                    {
                        id: "jsp-standard-action-tags",
                        name: "JSP Standard Action Tags",
                        beginner: [
                            {
                                content: `
JSP provides standard action tags to simplify common tasks like including pages, forwarding requests, and managing JavaBeans.  
These tags remove the need for scriptlets (<% %>) and make JSP pages cleaner and easier to maintain.  <br><br>

Common JSP Standard Action Tags:<br>
<ul>
<li><b>&lt;jsp:include&gt;</b> – Dynamically includes another JSP or HTML page.</li>
<li><b>&lt;jsp:forward&gt;</b> – Forwards the request to another resource (JSP, Servlet, or HTML page).</li>
<li><b>&lt;jsp:param&gt;</b> – Passes parameters along with <b>jsp:include</b> or <b>jsp:forward</b>.</li>
<li><b>&lt;jsp:useBean&gt;</b> – Declares or retrieves a JavaBean for use in JSP.</li>
<li><b>&lt;jsp:setProperty&gt;</b> – Sets property values of a JavaBean.</li>
<li><b>&lt;jsp:getProperty&gt;</b> – Reads property values of a JavaBean and outputs them.</li>
<li><b>&lt;jsp:fallback&gt;</b> – Legal only inside &lt;jsp:plugin&gt;; supplies content for browsers that cannot run the applet/bean plugin. It does NOT catch a failing custom tag - use &lt;c:catch&gt; or a JSP errorPage for that.</li>
</ul>
            `,
                                codeExamples: [
                                    `<jsp:include page="header.jsp" />`,
                                    `<jsp:forward page="login.jsp" />`,
                                    `<jsp:useBean id="user" class="com.example.User" scope="session" />`,
                                    `<jsp:setProperty name="user" property="name" value="Ashish" />`,
                                    `<jsp:getProperty name="user" property="name" />`
                                ]
                            }
                        ],
                        intermediate: [
                            {
                                content: `
Standard action tags can be used for dynamic content passing, scoped beans, and simple MVC patterns:<br>

Passing parameters with jsp:param:<br>
<pre>
&lt;jsp:include page="welcome.jsp"&gt;
    &lt;jsp:param name="user" value="Ashish" /&gt;
    &lt;jsp:param name="role" value="admin" /&gt;
&lt;/jsp:include&gt;
</pre><br>

Using JavaBeans efficiently:<br>
<pre>
&lt;jsp:useBean id="product" class="com.example.Product" scope="request" /&gt;
&lt;jsp:setProperty name="product" property="*" /&gt;  <!-- Maps all request parameters -->
&lt;p&gt;Product Name: &lt;jsp:getProperty name="product" property="name" /&gt;&lt;/p&gt;
&lt;p&gt;Price: &lt;jsp:getProperty name="product" property="price" /&gt;&lt;/p&gt;
</pre>

- **Forwarding requests with parameters**:
<pre>
&lt;jsp:forward page="/ControllerServlet"&gt;
    &lt;jsp:param name="action" value="addProduct" /&gt;
&lt;/jsp:forward&gt;
</pre>

- **Including dynamic content**:
<pre>
&lt;jsp:include page="footer.jsp" flush="true" /&gt;  <!-- flush ensures buffer is committed -->
</pre>

- **Scope management**:
Page, Request, Session, Application
            `,
                                codeExamples: [
                                    `<jsp:include page="welcome.jsp">
    <jsp:param name="user" value="Ashish" />
</jsp:include>`,
                                    `<jsp:useBean id="product" class="com.example.Product" scope="request" />
<jsp:setProperty name="product" property="*" />`,
                                    `<jsp:forward page="/ControllerServlet">
    <jsp:param name="action" value="addProduct" />
</jsp:forward>`,
                                    `<jsp:include page="footer.jsp" flush="true" />`
                                ]
                            }
                        ],
                        expert: [
                            {
                                content: `
At expert level, JSP standard action tags are used for **robust MVC applications, advanced bean management, and fallback handling**:

- **Automatic bean property mapping**:
<pre>
&lt;jsp:useBean id="user" class="com.example.User" scope="request" /&gt;
&lt;jsp:setProperty name="user" property="*" /&gt;
</pre>

- **Conditional inclusion using JSTL**:
<pre>
&lt;c:if test="'$'{not empty user}"&gt;
    &lt;jsp:include page="welcome.jsp" /&gt;
&lt;/c:if&gt;
</pre>

- **Forwarding with multiple parameters for MVC**:
<pre>
&lt;jsp:forward page="/ControllerServlet"&gt;
    &lt;jsp:param name="action" value="deleteProduct" /&gt;
    &lt;jsp:param name="id" value="'$'{product.id}" /&gt;
&lt;/jsp:forward&gt;
</pre>

- **Fallback for custom tags**:
<pre>
&lt;mytags:customTag&gt;
    &lt;jsp:fallback&gt;
        &lt;p&gt;Tag failed to render content.&lt;/p&gt;
    &lt;/jsp:fallback&gt;
&lt;/mytags:customTag&gt;
</pre>

- **Performance and security tips**:
Use correct scope to avoid memory leaks, flush buffers for large content, validate request parameters before mapping to beans, and avoid including heavy pages frequently.
            `,
                                codeExamples: [
                                    `<jsp:useBean id="user" class="com.example.User" scope="request" />
<jsp:setProperty name="user" property="*" />`,
                                    `<jsp:forward page="/ControllerServlet">
    <jsp:param name="action" value="deleteProduct" />
</jsp:forward>`,
                                    `<jsp:fallback>
    <p>Tag failed to render content.</p>
</jsp:fallback>`,
                                    `<jsp:include page="header.jsp" flush="true" />`
                                ]
                            }
                        ]
                    },

                    

                ]
            }


        ],
        cheatNotes: [
            'Servlet - Java class that handles HTTP requests on a server',
            'Servlet lifecycle - init() -> service() -> destroy()',
            'init() - Called once when servlet is loaded into memory',
            'service() - Called for every request, dispatches to doGet/doPost',
            'destroy() - Called once before servlet is removed from memory',
            'doGet() - Handles HTTP GET requests',
            'doPost() - Handles HTTP POST requests',
            'HttpServletRequest - Represents the client request',
            'HttpServletResponse - Represents the server response',
            'GenericServlet - Protocol-independent base servlet class',
            'HttpServlet - Extends GenericServlet, adds HTTP-specific methods',
            'ServletConfig - Per-servlet initialization parameters',
            'ServletContext - Shared, application-wide configuration object',
            'web.xml - Deployment descriptor for configuring servlets',
            '@WebServlet - Annotation to configure a servlet (no web.xml needed)',
            'RequestDispatcher - Forwards or includes another resource',
            'forward() - Transfers control to another resource, same request',
            'include() - Includes output of another resource in response',
            'sendRedirect() - Sends a new request from client (URL changes)',
            'HttpSession - Server-side object to track a user across requests',
            'session.setAttribute()/getAttribute() - Store/retrieve session data',
            'session.invalidate() - Ends the session',
            'Cookie - Small piece of data stored on client, sent with requests',
            'URL rewriting - Session tracking by appending session ID to URL',
            'Session tracking - Cookies, URL rewriting, hidden form fields',
            'Filter - Pre/post-processes requests and responses',
            'FilterChain.doFilter() - Passes request to next filter or servlet',
            '@WebFilter - Annotation to configure a servlet filter',
            'ServletContextListener - Notified on app startup/shutdown',
            'HttpSessionListener - Notified when sessions are created/destroyed',
            'ServletRequestListener - Notified when a request is initialized/destroyed',
            'Listener - Observes lifecycle events of context, session, or request',
            'JSP - Java Server Pages, HTML with embedded Java code',
            'JSP lifecycle - Translation -> Compilation -> Initialization -> Execution -> Destroy',
            'Scriptlet <% %> - Embeds Java code in a JSP page',
            'Expression <%= %> - Outputs a value directly into the response',
            'Declaration <%! %> - Declares fields/methods at class level in JSP',
            'JSP implicit objects - request, response, session, application, out, config, pageContext, exception',
            'out - Implicit object used to write output to the response',
            'page directive - Sets page-level attributes like import, contentType',
            'include directive - Includes content at translation time (static)',
            'taglib directive - Imports a custom or JSTL tag library',
            'JSTL - JSP Standard Tag Library, avoids scriptlets in JSP',
            'EL (Expression Language) - ${} syntax to access data without Java code',
            'c:forEach, c:if, c:choose - Common JSTL core tags',
            'MVC with Servlet+JSP - Servlet as controller, JSP as view, POJO as model',
            'Servlet vs JSP - Servlet is Java-centric, JSP is HTML-centric',
            'Exception handling in JSP - errorPage and isErrorPage attributes'
        ],
        interviewQuestions: []

    }

]
