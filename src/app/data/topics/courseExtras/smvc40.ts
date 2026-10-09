// Spring extras, batch smvc40 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc40Extras: Record<string, Extra> = {
    'mvc-connection-pooling': x(
        ['<b>Connection pool</b>: a set of ready database connections that requests borrow and return, because opening a new connection per request is slow.',
            '<b>Spring Boot default</b>: HikariCP is the default pool, configured with <code>spring.datasource.hikari.*</code> properties.',
            '<b>Borrow and return</b>: a request takes a connection when it first needs the database and gives it back when the transaction ends.'],
        ['<b>maximum-pool-size</b> caps open connections; if all are busy, threads wait up to <code>connection-timeout</code> and then fail.',
            '<b>Open Session in View</b> keeps a connection tied to the request until the view is rendered; <code>spring.jpa.open-in-view=false</code> frees it earlier.',
            '<b>Leaks</b>: a connection that is never closed stays borrowed forever; <code>leak-detection-threshold</code> logs suspects.'],
        ['<b>Sizing</b>: a small pool (often 10 to 20) beats a huge one, because the database can only run so many queries at once.',
            '<b>Long calls</b>: never hold a connection while calling a slow remote service; keep the transaction short.',
            '<b>Metrics</b>: watch <code>hikaricp.connections.active</code> and <code>pending</code> through Actuator and Micrometer.'],
        [['F', 'Why use a connection pool?', 'Creating a database connection is expensive, so a pool reuses open connections across requests.'],
            ['F', 'Which pool does Spring Boot use by default?', 'HikariCP.'],
            ['M', 'What happens when the pool is exhausted?', 'New requests wait for connection-timeout and then get an exception such as SQLTransientConnectionException.'],
            ['M', 'What is Open Session in View?', 'A filter or interceptor that keeps the JPA session, and so the connection, open until the response is rendered.'],
            ['S', 'How do you size a pool?', 'Start small, based on database cores and query time, measure pending threads, and increase only if the database is not the bottleneck.'],
            ['S', 'How do you find a connection leak?', 'Set leak-detection-threshold, read the stack trace it logs, and check code that opens connections outside a transaction or try-with-resources.']],
        [['Configure Hikari in application.properties.',
            r`spring.datasource.url=jdbc:postgresql://localhost:5432/shop
spring.datasource.username=app
spring.datasource.password=secret
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=3000
spring.datasource.hikari.leak-detection-threshold=20000

# OUTPUT:
# HikariPool-1 - Start completed.`],
            ['Read the pool through a bean.',
                r`@RestController
class PoolController {
    private final HikariDataSource ds;
    PoolController(DataSource ds) { this.ds = (HikariDataSource) ds; }

    @GetMapping("/pool")
    Map<String, Integer> pool() {
        HikariPoolMXBean p = ds.getHikariPoolMXBean();
        return Map.of("active", p.getActiveConnections(),
                      "idle", p.getIdleConnections(),
                      "waiting", p.getThreadsAwaitingConnection());
    }
}

// OUTPUT: GET /pool (varies)
// {"active":1,"idle":9,"waiting":0}`]],
        [['Test with a small pool.',
            r`@SpringBootTest(properties = {
    "spring.datasource.hikari.maximum-pool-size=2",
    "spring.datasource.hikari.connection-timeout=500"})
class PoolTest {
    @Autowired DataSource ds;

    @Test
    void thirdConnectionTimesOut() throws Exception {
        try (Connection a = ds.getConnection();
             Connection b = ds.getConnection()) {
            assertThrows(SQLTransientConnectionException.class,
                () -> ds.getConnection());
        }
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Turn off open-in-view.',
                r`spring.jpa.open-in-view=false

// OUTPUT:
// Lazy loading outside a transaction now throws LazyInitializationException,
// but the connection is released as soon as the service method returns.`]]
    ),

    'mvc-caching': x(
        ['<b>Cache</b>: stores the result of a costly call so the next call with the same input returns the stored result.',
            '<b>Spring abstraction</b>: enable it with <code>@EnableCaching</code> and mark methods with <code>@Cacheable</code>, <code>@CachePut</code> and <code>@CacheEvict</code>.',
            '<b>Cache name and key</b>: each cached value lives in a named cache under a key, by default built from the method arguments.'],
        ['<b>Proxy based</b>: caching works through a proxy, so calling a cached method from the same class (self-invocation) skips the cache.',
            '<b>Providers</b>: the default is a simple <code>ConcurrentHashMap</code>; use Caffeine or Redis for expiry and size limits.',
            '<b>condition and unless</b>: <code>condition</code> decides before the call, <code>unless</code> decides on the result, for example to skip null.'],
        ['<b>Stale data</b>: always pair a cache with an eviction or time-to-live policy, or users see old values.',
            '<b>Cache stampede</b>: many threads miss at once; <code>sync = true</code> lets only one compute the value.',
            '<b>Serialization</b>: with Redis, cached objects must be serializable, and a class change can break old entries.'],
        [['F', 'What does @Cacheable do?', 'It checks the cache before running the method and stores the result on a miss.'],
            ['F', 'How do you turn caching on?', 'Add @EnableCaching to a configuration class and a cache provider.'],
            ['M', 'Difference between @CachePut and @Cacheable?', 'Cacheable skips the method on a hit; CachePut always runs the method and updates the cache.'],
            ['M', 'Why does a cached method sometimes not cache?', 'It was called from inside the same bean, so the proxy was bypassed.'],
            ['S', 'How do you avoid a cache stampede?', 'Use sync = true on Cacheable, or a loading cache such as Caffeine that locks per key.'],
            ['S', 'Where is caching best placed?', 'In the service layer on read-heavy, rarely changing data, not in controllers, so transactions and security stay correct.']],
        [['A cacheable service method.',
            r`@Configuration
@EnableCaching
class CacheConfig { }

@Service
class ProductService {
    @Cacheable("products")
    public Product find(long id) {
        System.out.println("loading " + id);
        return repo.findById(id).orElseThrow();
    }
}

// OUTPUT: calling find(7) twice
// loading 7`],
            ['Evict on update.',
                r`@CacheEvict(cacheNames = "products", key = "#p.id")
public Product update(Product p) {
    return repo.save(p);
}

@CacheEvict(cacheNames = "products", allEntries = true)
public void clearAll() { }

// OUTPUT:
// The next find(id) after update(p) runs the method again and refills the cache.`]],
        [['Verify with a spy.',
            r`@SpringBootTest
class CacheTest {
    @Autowired ProductService service;
    @MockBean ProductRepository repo;

    @Test
    void secondCallHitsCache() {
        when(repo.findById(7L)).thenReturn(Optional.of(new Product(7L)));
        service.find(7L);
        service.find(7L);
        verify(repo, times(1)).findById(7L);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Caffeine with expiry.',
                r`spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=500,expireAfterWrite=10m

# OUTPUT:
# Entries expire 10 minutes after they are written, at most 500 are kept.`]]
    ),

    'mvc-http-caching': x(
        ['<b>HTTP caching</b>: headers such as <code>Cache-Control</code> let browsers and proxies reuse a response without asking the server again.',
            '<b>Cache-Control max-age</b>: tells the client how many seconds the response stays fresh.',
            '<b>Validators</b>: <code>ETag</code> and <code>Last-Modified</code> let the client ask "has it changed?" and get a small <code>304 Not Modified</code>.'],
        ['<b>CacheControl</b> in Spring: <code>ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)))</code> sets the header.',
            '<b>ShallowEtagHeaderFilter</b> computes an ETag from the response body and returns 304 when it matches, but the body is still built.',
            '<b>Deep ETag</b>: use <code>WebRequest.checkNotModified</code> before doing the work, so the expensive call is skipped.'],
        ['<b>Private data</b>: use <code>private</code> or <code>no-store</code> for user data, never let a shared proxy cache it.',
            '<b>Vary</b>: if the response depends on a header such as <code>Accept-Language</code>, add <code>Vary</code> so caches keep separate copies.',
            '<b>Static assets</b>: use long max-age with versioned file names, and short or validated caching for HTML and APIs.'],
        [['F', 'What does Cache-Control: max-age=60 mean?', 'The response may be reused for 60 seconds without contacting the server.'],
            ['F', 'What is a 304 response?', 'Not Modified: the client copy is still valid, so no body is sent.'],
            ['M', 'ETag versus Last-Modified?', 'ETag is a version token for the content; Last-Modified is a timestamp with one-second precision.'],
            ['M', 'What does no-cache mean?', 'The client may store the response but must revalidate it before each reuse; no-store forbids storing.'],
            ['S', 'Why use checkNotModified instead of the shallow ETag filter?', 'It lets you skip the database work, while the shallow filter still builds the full body.'],
            ['S', 'How do you cache an API safely for many users?', 'Use public with a short max-age for shared data, Vary for variants, and private or no-store for personal data.']],
        [['Set max-age on a response.',
            r`@GetMapping("/countries")
ResponseEntity<List<String>> countries() {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
        .body(List.of("IN", "US", "DE"));
}

// OUTPUT: response headers
// HTTP/1.1 200
// Cache-Control: max-age=3600, public`],
            ['Conditional GET with an ETag.',
                r`@GetMapping("/products/{id}")
ResponseEntity<Product> get(@PathVariable long id) {
    Product p = service.find(id);
    return ResponseEntity.ok()
        .eTag("\"" + p.getVersion() + "\"")
        .body(p);
}

// OUTPUT: second request with If-None-Match: "3"
// HTTP/1.1 304 Not Modified`]],
        [['Test the header with MockMvc.',
            r`@WebMvcTest(CountryController.class)
class CountryControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void hasCacheControl() throws Exception {
        mvc.perform(get("/countries"))
           .andExpect(status().isOk())
           .andExpect(header().string("Cache-Control",
               "max-age=3600, public"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Enable the shallow ETag filter.',
                r`@Bean
FilterRegistrationBean<ShallowEtagHeaderFilter> etag() {
    var reg = new FilterRegistrationBean<>(new ShallowEtagHeaderFilter());
    reg.addUrlPatterns("/api/*");
    return reg;
}

// OUTPUT:
// Responses under /api/* get an ETag header, and a matching If-None-Match gets 304.`]]
    ),

    'mvc-response-compression': x(
        ['<b>Response compression</b>: the server compresses the body (usually gzip) so fewer bytes cross the network, and the client unpacks it.',
            '<b>Negotiation</b>: the client sends <code>Accept-Encoding: gzip</code> and the server answers with <code>Content-Encoding: gzip</code>.',
            '<b>Spring Boot</b>: switch it on with <code>server.compression.enabled=true</code>; it is handled by the embedded server, not by MVC.'],
        ['<b>mime-types</b>: <code>server.compression.mime-types</code> lists which content types to compress; JSON, HTML, CSS and JS are typical.',
            '<b>min-response-size</b>: tiny bodies are not worth compressing; the default threshold is 2048 bytes.',
            '<b>Already compressed</b>: images, video and zip files gain nothing, so leave them out.'],
        ['<b>CPU cost</b>: compression trades CPU for bandwidth; a reverse proxy such as nginx often does it better.',
            '<b>Double compression</b>: do not compress in both the app and the proxy.',
            '<b>Security</b>: compressing secrets next to user input on HTTPS can enable BREACH-style attacks; weigh this for sensitive pages.'],
        [['F', 'Why compress responses?', 'Smaller bodies download faster and use less bandwidth.'],
            ['F', 'Which header does the client send to ask for compression?', 'Accept-Encoding, for example gzip.'],
            ['M', 'How do you enable it in Spring Boot?', 'Set server.compression.enabled=true and tune mime-types and min-response-size.'],
            ['M', 'Which content should not be compressed?', 'Already compressed formats like JPEG, PNG, MP4 and ZIP, and very small responses.'],
            ['S', 'Where is the best place to compress?', 'Usually the reverse proxy or CDN, which saves application CPU; the app setting is fine for simple deployments.'],
            ['S', 'How can you verify compression works?', 'Call with curl --compressed -v and check Content-Encoding, or assert it in a SpringBootTest with a real port.']],
        [['Turn on compression.',
            r`server.compression.enabled=true
server.compression.mime-types=application/json,text/html,text/css,application/javascript
server.compression.min-response-size=1024

# OUTPUT:
# Responses over 1 KB of those types are gzip encoded when the client accepts it.`],
            ['Check with curl.',
                r`curl -s -D - -o /dev/null -H "Accept-Encoding: gzip" \
     http://localhost:8080/api/orders

// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/json
// Content-Encoding: gzip
// Vary: Accept-Encoding`]],
        [['Integration test of the header.',
            r`@SpringBootTest(webEnvironment = RANDOM_PORT,
    properties = {"server.compression.enabled=true",
                  "server.compression.min-response-size=10"})
class CompressionTest {
    @Autowired TestRestTemplate rest;

    @Test
    void gzip() {
        HttpHeaders h = new HttpHeaders();
        h.set("Accept-Encoding", "gzip");
        var res = rest.exchange("/api/orders", HttpMethod.GET,
            new HttpEntity<>(h), byte[].class);
        assertEquals("gzip", res.getHeaders().getFirst("Content-Encoding"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Compare sizes.',
                r`curl -s http://localhost:8080/api/orders | wc -c
curl -s --compressed -H "Accept-Encoding: gzip" \
     http://localhost:8080/api/orders -w "%{size_download}\n" -o /dev/null

// OUTPUT: (varies)
// 48210
// 5120`]]
    ),

    'mvc-static-resource-optimization': x(
        ['<b>Static resources</b>: CSS, JavaScript, images and fonts served as files; Spring Boot serves them from <code>/static</code>, <code>/public</code> and <code>/resources</code> on the classpath.',
            '<b>Goal</b>: make them small and cacheable, so pages load fast and the server does less work.',
            '<b>ResourceHandlerRegistry</b>: in a <code>WebMvcConfigurer</code>, <code>addResourceHandlers</code> maps URL patterns to locations and sets caching.'],
        ['<b>Cache period</b>: <code>spring.web.resources.cache.cachecontrol.max-age=365d</code> gives a long browser cache.',
            '<b>Versioned URLs</b>: <code>VersionResourceResolver</code> adds a content hash like <code>app-3f2a.js</code>, so a long cache is safe and changes still show.',
            '<b>Gzip variants</b>: <code>resourceChain(true).addResolver(new EncodedResourceResolver())</code> serves pre-built <code>.gz</code> files.'],
        ['<b>CDN</b>: in production put a CDN or nginx in front, so the application server does not serve files at all.',
            '<b>Minify and bundle</b>: use a build tool; Spring does not minify for you.',
            '<b>Resource chain cache</b>: it is on by default in production profiles and caches resolved paths, avoiding repeated lookups.'],
        [['F', 'Where does Spring Boot look for static files?', 'Classpath folders /static, /public, /resources and /META-INF/resources.'],
            ['F', 'Why cache static files for a long time?', 'They rarely change, so the browser can skip the request completely.'],
            ['M', 'What is cache busting?', 'Changing the file URL (a hash or version) when content changes, so clients fetch the new file despite long caching.'],
            ['M', 'What does VersionResourceResolver do?', 'It maps a hashed URL back to the real file and can produce versioned links.'],
            ['S', 'How do you serve precompressed files?', 'Enable the resource chain with EncodedResourceResolver and place .gz files next to the originals.'],
            ['S', 'Should the app server serve static assets in production?', 'Preferably not; a CDN or reverse proxy is faster and keeps application threads free.']],
        [['Long cache with a content hash.',
            r`spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
spring.web.resources.cache.cachecontrol.max-age=365d
spring.web.resources.cache.cachecontrol.cache-public=true

# OUTPUT:
# GET /css/app-5d41402abc.css -> Cache-Control: max-age=31536000, public`],
            ['Manual resource handler.',
                r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry reg) {
        reg.addResourceHandler("/assets/**")
           .addResourceLocations("classpath:/assets/")
           .setCacheControl(CacheControl.maxAge(Duration.ofDays(30)))
           .resourceChain(true)
           .addResolver(new EncodedResourceResolver())
           .addResolver(new PathResourceResolver());
    }
}

// OUTPUT:
// /assets/** is served from the classpath with a 30 day cache.`]],
        [['Test the cache header.',
            r`@SpringBootTest
@AutoConfigureMockMvc
class StaticTest {
    @Autowired MockMvc mvc;

    @Test
    void cssIsCached() throws Exception {
        mvc.perform(get("/css/app.css"))
           .andExpect(status().isOk())
           .andExpect(header().exists("Cache-Control"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Link versioned URLs in a template.',
                r`<link rel="stylesheet" th:href="@{/css/app.css}">

<!-- OUTPUT -->
// With the versioning strategy enabled, Thymeleaf renders:
// <link rel="stylesheet" href="/css/app-5d41402abc.css">`]]
    ),

    'mvc-async-request-processing': x(
        ['<b>Async request processing</b>: the servlet thread is released while the work continues elsewhere, and the response is written later.',
            '<b>Why</b>: a container thread is a limited resource; freeing it during slow work lets the server handle more concurrent requests.',
            '<b>Return types</b>: a controller can return <code>Callable</code>, <code>DeferredResult</code>, <code>WebAsyncTask</code>, <code>CompletableFuture</code> or a streaming body.'],
        ['<b>Servlet 3 async</b>: Spring calls <code>request.startAsync()</code>, returns the thread, and later dispatches the request again to write the result.',
            '<b>Thread pool</b>: <code>Callable</code> runs on a Spring task executor; configure it with <code>WebMvcConfigurer.configureAsyncSupport</code>.',
            '<b>Timeout</b>: <code>spring.mvc.async.request-timeout</code> ends waiting requests with a 503 by default.'],
        ['<b>Not faster</b>: async does not make one request quicker; it only improves how many requests are in flight.',
            '<b>Security and context</b>: thread locals are not copied automatically; the security context is propagated, but your own thread locals are not.',
            '<b>Executor</b>: the default executor is simple and unbounded; set a bounded pool with a queue for production.'],
        [['F', 'What problem does async processing solve?', 'It stops slow requests from blocking servlet threads.'],
            ['F', 'Name two async return types.', 'Callable and DeferredResult, also CompletableFuture.'],
            ['M', 'Does async make a single request faster?', 'No, the same work is done; throughput under load improves.'],
            ['M', 'What happens on async timeout?', 'Spring raises AsyncRequestTimeoutException and returns 503 unless you handle it.'],
            ['S', 'How is the response written after the work finishes?', 'The container dispatches the request again to the same servlet, and the handler result is processed as if returned normally.'],
            ['S', 'When is async not worth it?', 'For fast, CPU bound work, because switching threads adds overhead without freeing anything useful.']],
        [['A Callable endpoint.',
            r`@GetMapping("/report")
Callable<String> report() {
    return () -> {
        Thread.sleep(2000);               // slow work on another thread
        return "done by " + Thread.currentThread().getName();
    };
}

// OUTPUT: GET /report after about 2 seconds (varies)
// done by task-1`],
            ['Configure the executor and timeout.',
                r`@Configuration
class AsyncConfig implements WebMvcConfigurer {
    @Override
    public void configureAsyncSupport(AsyncSupportConfigurer c) {
        ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
        ex.setCorePoolSize(8);
        ex.setMaxPoolSize(16);
        ex.setQueueCapacity(100);
        ex.setThreadNamePrefix("mvc-async-");
        ex.initialize();
        c.setTaskExecutor(ex);
        c.setDefaultTimeout(5000);
    }
}

// OUTPUT:
// Async work runs on mvc-async-N threads; requests older than 5 s time out.`]],
        [['Test async with MockMvc.',
            r`@WebMvcTest(ReportController.class)
class ReportTest {
    @Autowired MockMvc mvc;

    @Test
    void asyncReport() throws Exception {
        MvcResult res = mvc.perform(get("/report"))
            .andExpect(request().asyncStarted())
            .andReturn();
        mvc.perform(asyncDispatch(res))
            .andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Return a CompletableFuture.',
                r`@GetMapping("/price")
CompletableFuture<Double> price() {
    return CompletableFuture.supplyAsync(() -> pricing.fetch());
}

// OUTPUT:
// 12.5`]]
    ),

    'mvc-callable': x(
        ['<b>Callable</b>: a controller method returns <code>java.util.concurrent.Callable&lt;T&gt;</code>, and Spring runs it on another thread while the servlet thread is freed.',
            '<b>Result handling</b>: the value the callable returns is treated as the controller result, so view names, bodies and status work as normal.',
            '<b>Simplest async option</b>: you do not manage the thread or the completion yourself.'],
        ['<b>Executor</b>: it runs on an <code>AsyncTaskExecutor</code>; by default a simple one that creates a new thread per task, so configure a pool.',
            '<b>Exceptions</b>: if the callable throws, the exception is dispatched back and handled by <code>@ExceptionHandler</code> as usual.',
            '<b>Interceptors</b>: <code>CallableProcessingInterceptor</code> can hook before and after the work, and on timeout.'],
        ['<b>Who completes it</b>: the callable is completed by the pool itself; if another system or event completes the work, use <code>DeferredResult</code>.',
            '<b>Timeout</b>: set one, or a hung callable keeps the request open until the container times out.',
            '<b>Blocking calls</b>: the callable still blocks a pool thread, so size the pool for the blocking work.'],
        [['F', 'What does returning Callable do?', 'Spring executes it in a separate thread and sends the result when it finishes.'],
            ['F', 'Which thread runs the Callable?', 'A thread from the MVC async task executor, not the servlet container thread.'],
            ['M', 'Callable versus DeferredResult?', 'Callable is run by Spring; DeferredResult is completed by your own code from any thread.'],
            ['M', 'What if the Callable throws?', 'The exception is rethrown during the second dispatch and goes to your exception handlers.'],
            ['S', 'Why configure the executor?', 'The default creates unbounded threads; a bounded pool protects the application under load.'],
            ['S', 'How do you test a Callable controller?', 'Assert request().asyncStarted() with MockMvc, then perform asyncDispatch with the result.']],
        [['A simple Callable.',
            r`@GetMapping("/slow")
public Callable<String> slow() {
    System.out.println("servlet thread: " + Thread.currentThread().getName());
    return () -> {
        Thread.sleep(1000);
        return "result from " + Thread.currentThread().getName();
    };
}

// OUTPUT: (varies)
// servlet thread: http-nio-8080-exec-1
// response body: result from task-1`],
            ['Callable with a view.',
                r`@GetMapping("/dashboard")
public Callable<String> dashboard(Model model) {
    return () -> {
        model.addAttribute("stats", statsService.compute());
        return "dashboard";                 // view name resolved later
    };
}

// OUTPUT:
// The dashboard view renders after compute() completes.`]],
        [['Exception handling.',
            r`@GetMapping("/fail")
Callable<String> fail() {
    return () -> { throw new IllegalStateException("boom"); };
}

@ExceptionHandler(IllegalStateException.class)
ResponseEntity<String> handle(IllegalStateException e) {
    return ResponseEntity.status(500).body("handled: " + e.getMessage());
}

// OUTPUT:
// HTTP/1.1 500
// handled: boom`],
            ['MockMvc test.',
                r`MvcResult res = mvc.perform(get("/slow"))
    .andExpect(request().asyncStarted())
    .andReturn();
mvc.perform(asyncDispatch(res))
    .andExpect(status().isOk())
    .andExpect(content().string(startsWith("result from")));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-deferredresult': x(
        ['<b>DeferredResult</b>: a controller returns a <code>DeferredResult&lt;T&gt;</code> object now, and any other thread completes it later with <code>setResult</code>.',
            '<b>Use case</b>: the answer depends on something outside the request, such as a message, an event or another service callback.',
            '<b>Servlet thread freed</b>: the request stays open, but no container thread is held while waiting.'],
        ['<b>setResult and setErrorResult</b>: call one of them exactly once; later calls are ignored and return false.',
            '<b>Timeout</b>: <code>new DeferredResult&lt;&gt;(5000L, fallback)</code> returns the fallback value if nobody completes it in time.',
            '<b>Callbacks</b>: <code>onTimeout</code>, <code>onError</code> and <code>onCompletion</code> let you clean up queued requests.'],
        ['<b>Memory leak</b>: keep waiting results in a bounded, concurrent collection and remove them in <code>onCompletion</code>.',
            '<b>Thread safety</b>: <code>setResult</code> can be called from any thread, but your own shared state needs its own safety.',
            '<b>Long polling</b>: a classic use; clients wait on a request until news arrives, then ask again.'],
        [['F', 'What is DeferredResult?', 'A holder for a result that some other thread will provide later.'],
            ['F', 'How is it completed?', 'By calling setResult or setErrorResult.'],
            ['M', 'How do you handle a timeout?', 'Pass a timeout and a fallback value to the constructor, or register an onTimeout callback.'],
            ['M', 'Why register onCompletion?', 'To remove the pending result from your queue, so it does not leak after the request ends.'],
            ['S', 'DeferredResult versus Callable?', 'Callable is executed by Spring on a pool; DeferredResult lets event-driven code complete the request, so you decide when and on which thread.'],
            ['S', 'How would you build long polling with it?', 'Store each DeferredResult in a queue, complete all of them when an event arrives, and have clients reconnect after each reply.']],
        [['Complete it from another thread.',
            r`@GetMapping("/quote")
DeferredResult<String> quote() {
    DeferredResult<String> dr = new DeferredResult<>(5000L, "timeout");
    new Thread(() -> {
        sleep(1000);
        dr.setResult("price=42");
    }).start();
    return dr;
}

// OUTPUT: GET /quote after about 1 second
// price=42`],
            ['Long polling queue.',
                r`private final Queue<DeferredResult<String>> waiting =
    new ConcurrentLinkedQueue<>();

@GetMapping("/news")
DeferredResult<String> news() {
    DeferredResult<String> dr = new DeferredResult<>(30000L, "none");
    waiting.add(dr);
    dr.onCompletion(() -> waiting.remove(dr));
    return dr;
}

@PostMapping("/news")
void publish(@RequestBody String msg) {
    waiting.forEach(dr -> dr.setResult(msg));
}

// OUTPUT:
// Waiting GETs all return the posted message; idle ones return "none" after 30 s.`]],
        [['Test completion.',
            r`MvcResult res = mvc.perform(get("/quote"))
    .andExpect(request().asyncStarted())
    .andReturn();
mvc.perform(asyncDispatch(res))
    .andExpect(content().string("price=42"));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Error result.',
                r`DeferredResult<String> dr = new DeferredResult<>();
dr.setErrorResult(new IllegalStateException("upstream failed"));

// OUTPUT:
// The exception goes to @ExceptionHandler methods like any thrown exception.`]]
    ),

    'mvc-webasynctask': x(
        ['<b>WebAsyncTask</b>: a wrapper around a <code>Callable</code> that adds a per-request timeout, a chosen executor and timeout callbacks.',
            '<b>Return it</b> from a controller method, just like a <code>Callable</code>, and Spring runs it asynchronously.',
            '<b>Why</b>: a plain Callable uses global settings; WebAsyncTask lets one endpoint have its own limits.'],
        ['<b>Constructors</b>: <code>new WebAsyncTask&lt;&gt;(timeoutMillis, callable)</code> or with an executor name or object.',
            '<b>onTimeout</b>: register a callable that supplies a fallback value when the time limit passes.',
            '<b>onError and onCompletion</b>: run code on failure or when the request finishes.'],
        ['<b>Executor bean</b>: pass a bean name such as <code>"taskExecutor"</code>, so slow endpoints use a separate, bounded pool.',
            '<b>Fallbacks</b>: a timeout does not stop the running callable; it only answers the client, so make the work cancellable if possible.',
            '<b>Choose carefully</b>: if events complete the work, use <code>DeferredResult</code> instead.'],
        [['F', 'What is WebAsyncTask?', 'A Callable wrapper with its own timeout and executor settings.'],
            ['F', 'How do you set a timeout?', 'Pass milliseconds as the first constructor argument.'],
            ['M', 'How do you return a fallback on timeout?', 'Register task.onTimeout(() -> "fallback").'],
            ['M', 'How do you select the thread pool?', 'Pass an executor bean name or AsyncTaskExecutor to the constructor.'],
            ['S', 'Does a timeout cancel the running work?', 'Not necessarily; the client gets the fallback but the thread may continue until it finishes.'],
            ['S', 'WebAsyncTask versus Callable?', 'Same execution model, but WebAsyncTask gives per-request timeout, executor and callbacks.']],
        [['Timeout with fallback.',
            r`@GetMapping("/export")
WebAsyncTask<String> export() {
    WebAsyncTask<String> task = new WebAsyncTask<>(2000, () -> {
        Thread.sleep(5000);
        return "export done";
    });
    task.onTimeout(() -> "export is taking too long");
    return task;
}

// OUTPUT: GET /export
// export is taking too long`],
            ['Dedicated executor.',
                r`@Bean("exportExecutor")
ThreadPoolTaskExecutor exportExecutor() {
    ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
    ex.setCorePoolSize(2);
    ex.setMaxPoolSize(4);
    ex.setQueueCapacity(10);
    ex.setThreadNamePrefix("export-");
    return ex;
}

@GetMapping("/export2")
WebAsyncTask<String> export2() {
    return new WebAsyncTask<>(10000, "exportExecutor",
        () -> "done on " + Thread.currentThread().getName());
}

// OUTPUT: (varies)
// done on export-1`]],
        [['Test the timeout path.',
            r`MvcResult res = mvc.perform(get("/export"))
    .andExpect(request().asyncStarted())
    .andReturn();
res.getAsyncResult(3000);            // waits for the fallback
mvc.perform(asyncDispatch(res))
    .andExpect(content().string("export is taking too long"));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Cleanup callback.',
                r`task.onCompletion(() -> log.info("export request finished"));
task.onError(() -> "export failed");

// OUTPUT:
// INFO export request finished`]]
    ),

    'mvc-streaming-response-performance': x(
        ['<b>Streaming response</b>: the server writes the body in pieces as data becomes available, instead of building it all in memory first.',
            '<b>Types</b>: <code>StreamingResponseBody</code>, <code>ResponseBodyEmitter</code>, <code>SseEmitter</code> and a <code>Resource</code> for files.',
            '<b>Benefit</b>: large exports and downloads use little memory, and the client starts receiving data early.'],
        ['<b>StreamingResponseBody</b>: you get an <code>OutputStream</code> and write to it from an async thread, so the servlet thread is free.',
            '<b>SseEmitter</b>: sends Server-Sent Events with <code>text/event-stream</code>, good for progress and live updates.',
            '<b>Content length</b>: with streaming the length is unknown, so the response uses chunked transfer encoding.'],
        ['<b>Flush and size</b>: write in sensible buffers and flush when the client should see data, but not after every byte.',
            '<b>Client disconnects</b>: writing to a closed connection throws <code>IOException</code>; stop the work and release resources.',
            '<b>Database cursor</b>: stream rows with a read-only transaction and fetch size, but keep the connection open only while writing.'],
        [['F', 'Why stream a large response?', 'To avoid loading everything into memory and to start sending data sooner.'],
            ['F', 'Name a streaming return type.', 'StreamingResponseBody, ResponseBodyEmitter or SseEmitter.'],
            ['M', 'What transfer encoding is used?', 'Chunked, because the total length is not known upfront.'],
            ['M', 'Why does StreamingResponseBody need an executor?', 'Writing runs on an async thread, so it should use a configured task executor, not the servlet thread.'],
            ['S', 'How do you stream a big database export?', 'Read rows in a stream or cursor with a small fetch size and write each row to the output stream, within a transaction that lives as long as the write.'],
            ['S', 'What can go wrong with long streams?', 'Timeouts, proxies that buffer, held connections and threads, and client disconnects, so set timeouts and handle IOException.']],
        [['Stream a CSV.',
            r`@GetMapping("/export.csv")
ResponseEntity<StreamingResponseBody> csv() {
    StreamingResponseBody body = out -> {
        Writer w = new OutputStreamWriter(out, StandardCharsets.UTF_8);
        w.write("id,name\n");
        for (int i = 1; i <= 3; i++) w.write(i + ",user" + i + "\n");
        w.flush();
    };
    return ResponseEntity.ok()
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(body);
}

// OUTPUT:
// id,name
// 1,user1
// 2,user2
// 3,user3`],
            ['Server-Sent Events.',
                r`@GetMapping(value = "/progress", produces = "text/event-stream")
SseEmitter progress() {
    SseEmitter em = new SseEmitter(60000L);
    executor.execute(() -> {
        try {
            for (int i = 1; i <= 3; i++) {
                em.send("step " + i);
                Thread.sleep(500);
            }
            em.complete();
        } catch (Exception e) { em.completeWithError(e); }
    });
    return em;
}

// OUTPUT:
// data:step 1
//
// data:step 2
//
// data:step 3`]],
        [['Test streaming.',
            r`MvcResult res = mvc.perform(get("/export.csv"))
    .andExpect(request().asyncStarted())
    .andReturn();
mvc.perform(asyncDispatch(res))
    .andExpect(status().isOk())
    .andExpect(content().string(containsString("1,user1")));

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Stream a file without loading it.',
                r`@GetMapping("/files/{name}")
ResponseEntity<Resource> file(@PathVariable String name) {
    Resource r = new FileSystemResource(baseDir.resolve(name));
    return ResponseEntity.ok().body(r);   // copied in chunks, not read fully
}

// OUTPUT:
// HTTP/1.1 200
// Content-Length: 104857600 (the file is sent without a 100 MB heap array)`]]
    )
};

export const smvc40Deep: Record<string, Deep> = {
    'mvc-connection-pooling': dv(
        [`<p>HikariCP keeps physical connections in a concurrent bag and hands out proxies.</p><ul><li><b>Borrow:</b> <code>getConnection()</code> takes an idle entry from a thread-local list or the shared bag, or waits up to the connection timeout.</li><li><b>Proxy:</b> the caller gets a wrapper whose <code>close()</code> returns the real connection to the pool instead of closing it.</li><li><b>Spring:</b> <code>DataSourceTransactionManager</code> or <code>JpaTransactionManager</code> binds one connection to the thread for the whole transaction.</li><li><b>Housekeeping:</b> a background thread retires connections older than <code>max-lifetime</code> and keeps <code>minimum-idle</code> ready.</li></ul>`,
            r`@Transactional
public void transfer(long from, long to, BigDecimal amt) {
    // connection borrowed here (first database use), same one for both updates
    jdbc.update("update acc set bal = bal - ? where id = ?", amt, from);
    jdbc.update("update acc set bal = bal + ? where id = ?", amt, to);
}   // commit, then the connection returns to the pool

// OUTPUT: (debug logs)
// HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@3f1a
// transaction committed; connection returned to the pool`],
        [`<p>Main Hikari options:</p><ul><li><b>maximum-pool-size:</b> upper limit of connections.</li><li><b>minimum-idle:</b> idle connections kept ready.</li><li><b>connection-timeout:</b> wait time for a connection.</li><li><b>idle-timeout:</b> when extra idle connections are closed.</li><li><b>max-lifetime:</b> keep it below the database or firewall limit.</li><li><b>leak-detection-threshold:</b> log borrowed-too-long connections.</li><li><b>pool-name:</b> readable name in logs and metrics.</li></ul>`,
            r`spring.datasource.hikari.pool-name=shop-pool
spring.datasource.hikari.maximum-pool-size=15
spring.datasource.hikari.minimum-idle=15
spring.datasource.hikari.connection-timeout=2000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1740000
spring.datasource.hikari.leak-detection-threshold=15000

# OUTPUT:
# shop-pool - Start completed.
# (fixed-size pool: minimum-idle equals maximum-pool-size)`],
        [`<p>Common mistakes:</p><ul><li><b>Oversized pool:</b> 200 connections overload the database; use a small pool and queue.</li><li><b>Slow remote call inside a transaction:</b> the connection is held; call the service first, then open the transaction.</li><li><b>Open Session in View:</b> hides lazy loading and holds connections during rendering.</li><li><b>Manual connections not closed:</b> use try-with-resources.</li><li><b>max-lifetime above the database limit:</b> causes sporadic closed-connection errors.</li></ul>`,
            r`// WRONG: connection held during a 3 s HTTP call
@Transactional
public void bad(long id) {
    Order o = repo.findById(id).orElseThrow();
    payment.charge(o);              // remote call while connection is borrowed
    o.setPaid(true);
}

// RIGHT: call outside, then a short transaction
public void good(long id) {
    Order o = repo.findById(id).orElseThrow();
    payment.charge(o);
    tx.executeWithoutResult(s -> repo.markPaid(id));
}

// OUTPUT:
// bad: pool active=10 waiting=40 under load
// good: pool active=2 waiting=0 under load`],
        [`<p>Tuning approach:</p><ul><li><b>Measure first:</b> watch active, pending and acquire time.</li><li><b>Size from the database:</b> a rough start is cores times 2 plus disk spindles, then test.</li><li><b>Shorten transactions:</b> that raises throughput more than a larger pool.</li><li><b>Fixed size:</b> equal minimum-idle and maximum-pool-size avoids resizing spikes.</li><li><b>Set open-in-view to false</b> for APIs.</li><li><b>Statement cache</b> belongs to the driver, for example prepared statement caching.</li></ul>`,
            r`management.endpoints.web.exposure.include=health,metrics
# then query:
# GET /actuator/metrics/hikaricp.connections.active
# GET /actuator/metrics/hikaricp.connections.pending
# GET /actuator/metrics/hikaricp.connections.acquire

# OUTPUT: (varies)
# {"name":"hikaricp.connections.pending","measurements":[{"statistic":"VALUE","value":0.0}]}`],
        [`<p>Scenario: an API slows down under load and logs show <code>Connection is not available, request timed out after 30000ms</code>.</p><ul><li>Pending threads are high, active equals the maximum.</li><li>A thread dump shows threads inside a remote payment call within a transaction.</li><li>Fix: move the remote call out of the transaction and disable open-in-view.</li><li>Result: active connections drop and the timeouts disappear without enlarging the pool.</li></ul>`,
            r`2026-03-01 WARN HikariPool-1 - Connection is not available, request timed out after 30000ms
  (total=10, active=10, idle=0, waiting=42)

// after fix
// OUTPUT:
// HikariPool-1 - (total=10, active=3, idle=7, waiting=0)`]
    ),

    'mvc-caching': dv(
        [`<p>Spring caching is applied by an AOP proxy around your bean.</p><ul><li><b>Interceptor:</b> <code>CacheInterceptor</code> wraps each annotated method.</li><li><b>Key:</b> a <code>KeyGenerator</code> builds the key, by default from the arguments (<code>SimpleKey</code>).</li><li><b>Flow:</b> look up the key in the <code>Cache</code> from the <code>CacheManager</code>; on a hit return it, on a miss call the method and store the result.</li><li><b>Self-invocation:</b> a call inside the same object bypasses the proxy, so nothing is cached.</li></ul>`,
            r`@Service
class PriceService {
    @Cacheable("prices")
    public double price(String sku) {
        System.out.println("computing " + sku);
        return 9.99;
    }

    public double twice(String sku) {
        return price(sku) * 2;      // WRONG: self call, not cached
    }
}

// OUTPUT: calling twice("A") three times
// computing A
// computing A
// computing A`],
        [`<p>Annotation options:</p><ul><li><b>value / cacheNames:</b> which caches to use.</li><li><b>key:</b> SpEL expression such as <code>#id</code> or <code>#p.id</code>.</li><li><b>condition:</b> cache only when true, checked before the call.</li><li><b>unless:</b> do not cache when true, checked on the result.</li><li><b>sync:</b> one thread computes per key.</li><li><b>@CachePut:</b> always run and refresh.</li><li><b>@CacheEvict:</b> remove one or all entries.</li><li><b>@Caching:</b> combine several.</li></ul>`,
            r`@Cacheable(cacheNames = "users", key = "#id",
             condition = "#id > 0", unless = "#result == null")
public User find(long id) { return repo.findById(id).orElse(null); }

@CachePut(cacheNames = "users", key = "#u.id")
public User save(User u) { return repo.save(u); }

@Caching(evict = {
    @CacheEvict(cacheNames = "users", key = "#id"),
    @CacheEvict(cacheNames = "userList", allEntries = true)})
public void delete(long id) { repo.deleteById(id); }

// OUTPUT:
// null results are not cached; save refreshes the entry; delete clears both caches.`],
        [`<p>Common mistakes:</p><ul><li><b>Self-invocation:</b> move the method to another bean.</li><li><b>No expiry:</b> the default map grows forever; use Caffeine or Redis with time-to-live.</li><li><b>Mutable cached objects:</b> callers change the cached instance; return immutable data or copies.</li><li><b>Wrong key:</b> same key for different meanings; build it explicitly.</li><li><b>Caching in a transaction:</b> a rollback can leave a cached value that was never committed.</li><li><b>Forgot @EnableCaching:</b> annotations are silently ignored.</li></ul>`,
            r`// WRONG: mutable object shared by all callers
Product p = service.find(1L);
p.setPrice(0);                 // modifies the cached instance for everyone

// RIGHT: use a record or return a defensive copy
public record ProductDto(long id, String name, BigDecimal price) { }

// OUTPUT:
// With a record, callers cannot change what is stored in the cache.`],
        [`<p>Performance and tuning:</p><ul><li><b>Hit ratio:</b> track hits and misses; a low ratio means the wrong data is cached.</li><li><b>Size limits:</b> use <code>maximumSize</code> and <code>expireAfterWrite</code> in Caffeine.</li><li><b>Local versus distributed:</b> Caffeine is fastest per node; Redis shares data between nodes but adds network time.</li><li><b>sync = true</b> prevents stampedes.</li><li><b>Record stats:</b> <code>recordStats</code> exposes metrics to Micrometer.</li></ul>`,
            r`spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=5m,recordStats
management.endpoints.web.exposure.include=metrics
# GET /actuator/metrics/cache.gets?tag=result:hit

# OUTPUT: (varies)
# {"name":"cache.gets","measurements":[{"statistic":"COUNT","value":8421.0}]}`],
        [`<p>Scenario: a product catalogue page calls the database for the same 500 products thousands of times a minute.</p><ul><li>Cache product reads by id with a 10 minute expiry.</li><li>Evict the entry when an admin updates a product.</li><li>Result: database load drops sharply and page latency falls.</li><li>Risk handled: expiry limits stale data if an eviction is missed.</li></ul>`,
            r`@Cacheable(cacheNames = "catalogue", key = "#id", sync = true)
public ProductDto get(long id) { return mapper.toDto(repo.getReferenceById(id)); }

@CacheEvict(cacheNames = "catalogue", key = "#dto.id")
public void update(ProductDto dto) { repo.save(mapper.toEntity(dto)); }

// OUTPUT: (varies)
// before: 1200 queries/min, p95 180 ms
// after:  90 queries/min, p95 12 ms`]
    ),

    'mvc-http-caching': dv(
        [`<p>HTTP caching is decided by response headers and honoured by browsers, proxies and CDNs.</p><ul><li><b>Fresh:</b> within <code>max-age</code> the cache answers without contacting the server.</li><li><b>Stale:</b> afterwards it sends a conditional request with <code>If-None-Match</code> or <code>If-Modified-Since</code>.</li><li><b>Server:</b> compares the validator; if equal it returns <code>304</code> with no body.</li><li><b>Spring:</b> <code>HttpEntityMethodProcessor</code> writes the headers, and <code>ServletWebRequest.checkNotModified</code> evaluates preconditions.</li></ul>`,
            r`GET /products/3 HTTP/1.1

HTTP/1.1 200
ETag: "v7"
Cache-Control: max-age=60

GET /products/3 HTTP/1.1
If-None-Match: "v7"

// OUTPUT:
// HTTP/1.1 304 Not Modified
// ETag: "v7"`],
        [`<p>Spring options:</p><ul><li><b>CacheControl:</b> <code>maxAge</code>, <code>noCache</code>, <code>noStore</code>, <code>cachePublic</code>, <code>cachePrivate</code>, <code>mustRevalidate</code>, <code>staleWhileRevalidate</code>.</li><li><b>ResponseEntity:</b> <code>.eTag()</code>, <code>.lastModified()</code>, <code>.cacheControl()</code>.</li><li><b>WebRequest.checkNotModified:</b> returns true when a 304 was already prepared.</li><li><b>ShallowEtagHeaderFilter:</b> automatic, body based.</li><li><b>Interceptor:</b> <code>WebContentInterceptor</code> sets rules per URL pattern.</li></ul>`,
            r`@GetMapping("/products/{id}")
ResponseEntity<Product> get(@PathVariable long id, WebRequest req) {
    Product p = service.find(id);
    String etag = "\"" + p.getVersion() + "\"";
    if (req.checkNotModified(etag)) {
        return null;                      // 304 already set, work is skipped
    }
    return ResponseEntity.ok()
        .eTag(etag)
        .cacheControl(CacheControl.maxAge(Duration.ofSeconds(60)))
        .body(p);
}

// OUTPUT:
// first call: 200 with ETag "7"; repeat with If-None-Match "7": 304`],
        [`<p>Common mistakes:</p><ul><li><b>Caching private data publicly:</b> add <code>private</code> or <code>no-store</code>.</li><li><b>Missing Vary:</b> a cache serves English to a German user.</li><li><b>Weak validators:</b> an ETag that never changes serves stale data.</li><li><b>Caching error responses:</b> avoid long max-age on 4xx and 5xx.</li><li><b>Confusing no-cache and no-store.</b></li><li><b>Spring Security defaults:</b> it adds <code>no-cache, no-store</code> to secured responses, which you override per endpoint only if safe.</li></ul>`,
            r`// WRONG: personal data cached by shared proxies
return ResponseEntity.ok()
    .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
    .body(currentUser());

// RIGHT
return ResponseEntity.ok()
    .cacheControl(CacheControl.noStore())
    .body(currentUser());

// OUTPUT:
// Cache-Control: no-store`],
        [`<p>Performance tips:</p><ul><li><b>Long max-age plus versioned URLs</b> for assets.</li><li><b>Short max-age plus ETag</b> for API reads.</li><li><b>checkNotModified early</b> to skip database work.</li><li><b>stale-while-revalidate</b> hides refresh latency.</li><li><b>CDN</b> respects <code>s-maxage</code> for shared caches only.</li></ul>`,
            r`CacheControl cc = CacheControl.maxAge(Duration.ofSeconds(30))
    .sMaxAge(Duration.ofMinutes(5))
    .staleWhileRevalidate(Duration.ofSeconds(60))
    .cachePublic();

// OUTPUT:
// Cache-Control: max-age=30, s-maxage=300, stale-while-revalidate=60, public`],
        [`<p>Scenario: a mobile app polls <code>/api/config</code> every minute and the payload is 40 KB.</p><ul><li>Add an ETag from a config version number.</li><li>Use <code>checkNotModified</code> before loading the config.</li><li>Result: most polls become tiny 304 replies, saving bandwidth and database reads.</li></ul>`,
            r`@GetMapping("/api/config")
ResponseEntity<Config> config(WebRequest req) {
    String v = "\"" + configVersion.current() + "\"";
    if (req.checkNotModified(v)) return null;
    return ResponseEntity.ok().eTag(v).body(configService.load());
}

// OUTPUT: (varies)
// 95% of calls: 304, 0 bytes body; 5% 200, 40 KB`]
    ),

    'mvc-response-compression': dv(
        [`<p>Compression is done by the embedded server before bytes leave the connector.</p><ul><li><b>Tomcat:</b> the connector has <code>compression</code> settings that Spring Boot fills from <code>server.compression.*</code>.</li><li><b>Decision:</b> enabled, client sent a matching <code>Accept-Encoding</code>, the type is in the list and the body is large enough.</li><li><b>Headers:</b> it sets <code>Content-Encoding</code>, removes <code>Content-Length</code> and adds <code>Vary: Accept-Encoding</code>.</li><li><b>MVC:</b> message converters write plain bytes; they know nothing about compression.</li></ul>`,
            r`GET /api/orders HTTP/1.1
Accept-Encoding: gzip, deflate

// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/json
// Content-Encoding: gzip
// Vary: Accept-Encoding
// Transfer-Encoding: chunked`],
        [`<p>Options and variants:</p><ul><li><b>server.compression.enabled:</b> master switch.</li><li><b>mime-types:</b> which types are compressed.</li><li><b>min-response-size:</b> smallest size to compress.</li><li><b>excluded-user-agents:</b> skip some clients.</li><li><b>Reverse proxy:</b> nginx <code>gzip on</code> or brotli.</li><li><b>Filter:</b> a custom servlet filter for non-Tomcat setups.</li></ul>`,
            r`server.compression.enabled=true
server.compression.mime-types=application/json,application/xml,text/html,text/plain
server.compression.min-response-size=2KB
server.compression.excluded-user-agents=BadBot

# OUTPUT:
# Only listed types of 2 KB or more are gzip compressed.`],
        [`<p>Common mistakes:</p><ul><li><b>Compressing in app and proxy:</b> wasted CPU or broken double encoding.</li><li><b>Compressing images:</b> no gain.</li><li><b>Forgetting Vary:</b> caches serve compressed data to clients that cannot read it.</li><li><b>Wrong size check:</b> tests with tiny bodies show no compression.</li><li><b>Setting Content-Length manually</b> then compressing.</li></ul>`,
            r`// Test with a body below the threshold: no compression
// server.compression.min-response-size=2KB, response is 300 bytes

// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/json
// (no Content-Encoding header: the body was too small)`],
        [`<p>Tuning:</p><ul><li>Compress text formats only; JSON often shrinks by 80 percent or more.</li><li>Use level 5 or 6 for a balance; very high levels cost much CPU for little gain.</li><li>Cache compressed static files rather than compressing on each request.</li><li>Prefer brotli at the CDN for static assets.</li></ul>`,
            r`curl -s -o /dev/null -w "plain=%{size_download}\n" http://localhost:8080/api/orders
curl -s -o /dev/null -w "gzip=%{size_download}\n" --compressed \
     -H "Accept-Encoding: gzip" http://localhost:8080/api/orders

// OUTPUT: (varies)
// plain=48210
// gzip=5120`],
        [`<p>Scenario: a reporting API returns 2 MB JSON to remote offices on slow links.</p><ul><li>Enable gzip for <code>application/json</code>.</li><li>Download time falls from seconds to under one second.</li><li>CPU rises slightly, so move compression to the proxy if the application becomes CPU bound.</li></ul>`,
            r`# before: 2.1 MB in 7.4 s on a 2 Mbps link
# after gzip: 240 KB in 1.0 s

# OUTPUT: (varies)
# Content-Encoding: gzip`]
    ),

    'mvc-static-resource-optimization': dv(
        [`<p>Static files are served by <code>ResourceHttpRequestHandler</code> registered by Spring MVC.</p><ul><li><b>Mapping:</b> <code>/**</code> maps to the static locations, with the dispatcher handling dynamic URLs first.</li><li><b>Chain:</b> a <code>ResourceResolverChain</code> finds the file (versioned, encoded, path) and a <code>ResourceTransformerChain</code> can rewrite content.</li><li><b>Headers:</b> it adds <code>Last-Modified</code>, supports range requests and applies the configured <code>Cache-Control</code>.</li><li><b>Links:</b> <code>ResourceUrlProvider</code> produces versioned URLs for templates.</li></ul>`,
            r`GET /css/app-5d41402abc.css HTTP/1.1

// OUTPUT:
// HTTP/1.1 200
// Cache-Control: max-age=31536000, public
// Last-Modified: Tue, 03 Mar 2026 10:00:00 GMT
// Content-Type: text/css`],
        [`<p>Variants:</p><ul><li><b>Fixed version:</b> <code>strategy.fixed.version=v2</code> gives <code>/v2/js/app.js</code>.</li><li><b>Content hash:</b> hash of file contents.</li><li><b>Custom locations:</b> <code>spring.web.resources.static-locations</code>.</li><li><b>Webjars:</b> <code>/webjars/**</code> for library files.</li><li><b>Disable:</b> <code>spring.web.resources.add-mappings=false</code> for pure APIs.</li></ul>`,
            r`spring.web.resources.static-locations=classpath:/static/,file:/var/www/assets/
spring.web.resources.chain.strategy.fixed.enabled=true
spring.web.resources.chain.strategy.fixed.paths=/js/**
spring.web.resources.chain.strategy.fixed.version=v2
spring.web.resources.chain.compressed=true

# OUTPUT:
# /v2/js/app.js is mapped to /js/app.js, and app.js.gz is served when present.`],
        [`<p>Common mistakes:</p><ul><li><b>Long cache without versioning:</b> users keep old files after a release.</li><li><b>Hand-written links:</b> bypass the version resolver; use <code>th:href</code> with <code>@{...}</code>.</li><li><b>Serving large media from the app:</b> consumes threads.</li><li><b>Wrong security rules:</b> static paths blocked by Spring Security.</li><li><b>Forgetting resource chain cache</b> in development, which hides changes.</li></ul>`,
            r`http.authorizeHttpRequests(a -> a
    .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
    .anyRequest().authenticated());

// OUTPUT:
// Static files load for anonymous users; without the rule they redirect to login.`],
        [`<p>Tuning:</p><ul><li>Serve through a CDN with the content hash in the name.</li><li>Pre-compress at build time (gzip or brotli).</li><li>Bundle and minify files, and use HTTP/2 to reduce request overhead.</li><li>Use <code>immutable</code> in Cache-Control for hashed files.</li><li>Keep images in modern formats and sizes.</li></ul>`,
            r`spring.web.resources.cache.cachecontrol.max-age=365d
spring.web.resources.cache.cachecontrol.immutable=true
spring.web.resources.cache.cachecontrol.cache-public=true

# OUTPUT:
# Cache-Control: max-age=31536000, public, immutable`],
        [`<p>Scenario: a landing page loads 3 MB of assets and users complain it is slow.</p><ul><li>Minify and bundle the JS and CSS, and compress images.</li><li>Enable content hash versioning with a one year cache.</li><li>Put a CDN in front.</li><li>Result: repeat visits download almost nothing, first visits are smaller.</li></ul>`,
            r`# before: 3.1 MB, 42 requests on every visit
# after:  0.9 MB first visit, 0.05 MB repeat visit

# OUTPUT: (varies)
# Lighthouse performance score 58 -> 94`]
    ),

    'mvc-async-request-processing': dv(
        [`<p>Spring MVC builds on Servlet 3 asynchronous support.</p><ul><li><b>Start:</b> the handler returns an async type; <code>WebAsyncManager</code> calls <code>startAsync()</code> and the servlet thread returns to the pool.</li><li><b>Work:</b> a Callable runs on an executor; a DeferredResult waits to be completed.</li><li><b>Dispatch:</b> when a result exists, the container dispatches the request again to the <code>DispatcherServlet</code>.</li><li><b>Finish:</b> the stored result is treated as the handler return value, and handling continues from there (converters, views).</li><li><b>Filters:</b> they run again on the second dispatch unless registered for the first only.</li></ul>`,
            r`@GetMapping("/a")
Callable<String> a() {
    log("handler on " + Thread.currentThread().getName());
    return () -> "ok";
}

// OUTPUT: (varies)
// DispatcherServlet: initial dispatch on http-nio-8080-exec-2
// handler on http-nio-8080-exec-2
// DispatcherServlet: async dispatch on http-nio-8080-exec-5
// response 200 ok`],
        [`<p>Async variants:</p><ul><li><b>Callable:</b> Spring runs it for you.</li><li><b>DeferredResult:</b> you complete it.</li><li><b>WebAsyncTask:</b> Callable with custom timeout and executor.</li><li><b>CompletableFuture and ListenableFuture:</b> completion by the future.</li><li><b>ResponseBodyEmitter, SseEmitter, StreamingResponseBody:</b> multiple writes.</li><li><b>Reactive types (Flux, Mono):</b> supported when WebFlux types are on the classpath, still on the servlet stack.</li></ul>`,
            r`@GetMapping("/f")
CompletableFuture<String> f() {
    return CompletableFuture.supplyAsync(() -> "from future");
}

@GetMapping("/m")
Mono<String> m() { return Mono.just("from mono"); }

// OUTPUT:
// from future
// from mono`],
        [`<p>Common mistakes:</p><ul><li><b>Blocking inside the async pool without limits:</b> pool exhaustion.</li><li><b>Using a thread local</b> set on the request thread.</li><li><b>No timeout:</b> requests wait forever.</li><li><b>Filters not async-capable:</b> custom filters must support async or the request fails.</li><li><b>Believing it speeds one request.</b></li></ul>`,
            r`// WRONG: a custom filter without async support
// java.lang.IllegalStateException: A filter or servlet of the current chain
//  does not support asynchronous operations.

// RIGHT: register the filter with async support
registration.setAsyncSupported(true);

// OUTPUT:
// The async dispatch now passes through the filter chain.`],
        [`<p>Tuning:</p><ul><li>Use a bounded <code>ThreadPoolTaskExecutor</code> with a queue and a rejection policy.</li><li>Set <code>spring.mvc.async.request-timeout</code>.</li><li>Keep Tomcat <code>max-connections</code> high enough for waiting requests.</li><li>Use <code>TaskDecorator</code> to copy context such as MDC.</li><li>Measure queue size and rejected tasks.</li></ul>`,
            r`ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
ex.setCorePoolSize(16);
ex.setMaxPoolSize(32);
ex.setQueueCapacity(200);
ex.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
ex.setTaskDecorator(task -> {
    Map<String, String> mdc = MDC.getCopyOfContextMap();
    return () -> { MDC.setContextMap(mdc); try { task.run(); }
                   finally { MDC.clear(); } };
});

// OUTPUT:
// Log lines from async work keep the request correlation id.`],
        [`<p>Scenario: a report endpoint calls a slow partner API (3 s) and the server has 200 Tomcat threads.</p><ul><li>Synchronous: about 66 requests per second at most.</li><li>Async with a pool sized for the partner limit: threads are free for other requests.</li><li>Result: other fast endpoints stay responsive during partner slowness.</li></ul>`,
            r`@GetMapping("/partner")
Callable<Report> partner() {
    return () -> partnerClient.fetchReport();   // pool bounded to 20
}

// OUTPUT: (varies)
// slow endpoint p95 3.2 s; fast endpoints p95 12 ms (before: 2.4 s)`]
    ),

    'mvc-callable': dv(
        [`<p>How a Callable return value is processed:</p><ul><li><b>Handler:</b> <code>CallableMethodReturnValueHandler</code> passes the Callable to <code>WebAsyncManager.startCallableProcessing</code>.</li><li><b>Submit:</b> the Callable is submitted to the <code>AsyncTaskExecutor</code>; the request enters async mode.</li><li><b>Result:</b> the outcome or exception is saved on the manager and the request is dispatched again.</li><li><b>Replay:</b> the saved value goes through the return value handlers as if the controller had returned it.</li></ul>`,
            r`@GetMapping("/x")
Callable<String> x() {
    return () -> "hi";
}

// OUTPUT: (debug log)
// Started async: Callable
// Async result set: hi
// Dispatching ASYNC to /x
// Writing "hi"`],
        [`<p>Variants and hooks:</p><ul><li><b>Callable&lt;String&gt;:</b> view name or body.</li><li><b>Callable&lt;ResponseEntity&lt;T&gt;&gt;:</b> control status and headers.</li><li><b>CallableProcessingInterceptor:</b> <code>beforeConcurrentHandling</code>, <code>preProcess</code>, <code>postProcess</code>, <code>handleTimeout</code>.</li><li><b>Executor:</b> set through <code>AsyncSupportConfigurer.setTaskExecutor</code>.</li><li><b>Timeout:</b> <code>setDefaultTimeout</code>.</li></ul>`,
            r`@Override
public void configureAsyncSupport(AsyncSupportConfigurer c) {
    c.registerCallableInterceptors(new CallableProcessingInterceptor() {
        @Override
        public <T> void preProcess(NativeWebRequest r, Callable<T> t) {
            MDC.put("req", r.getHeader("X-Request-Id"));
        }
    });
    c.setDefaultTimeout(8000);
}

// OUTPUT:
// Request id is available in logs from the callable thread.`],
        [`<p>Mistakes:</p><ul><li><b>Using request-scoped beans</b> inside the callable: the request may be gone; read values first.</li><li><b>Relying on thread locals</b> such as a transaction.</li><li><b>Ignoring the default executor:</b> a new thread per call.</li><li><b>Sharing non-thread-safe objects</b> such as Model across threads carelessly.</li></ul>`,
            r`// WRONG: reads request data inside the other thread
return () -> request.getParameter("id");

// RIGHT: capture first
String id = request.getParameter("id");
return () -> service.load(id);

// OUTPUT:
// The callable no longer depends on the servlet request state.`],
        [`<p>Tuning:</p><ul><li>Use a bounded pool; size it for the blocking work, not for CPU count.</li><li>Prefer separate pools for different slow dependencies.</li><li>Use timeouts on the downstream calls too.</li><li>Do not use it for very fast work; the hand-off costs more than it saves.</li></ul>`,
            r`@Bean
AsyncTaskExecutor mvcExecutor() {
    ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
    ex.setCorePoolSize(20);
    ex.setMaxPoolSize(20);
    ex.setQueueCapacity(50);
    ex.setThreadNamePrefix("mvc-");
    return ex;
}

// OUTPUT: (varies)
// callable threads: mvc-1 .. mvc-20, queue depth stays under 50`],
        [`<p>Scenario: PDF generation takes 2 to 4 seconds and uses a library that blocks.</p><ul><li>Return a Callable that generates the PDF on a dedicated pool of 5 threads.</li><li>Servlet threads stay available for normal pages.</li><li>When all 5 are busy, requests queue, then get 503 on timeout, which protects the server.</li></ul>`,
            r`@GetMapping(value = "/invoice/{id}", produces = "application/pdf")
Callable<byte[]> invoice(@PathVariable long id) {
    return () -> pdfService.render(id);
}

// OUTPUT: (varies)
// 200 application/pdf, 84 KB, 2.8 s; during overload: 503 after 10 s`]
    ),

    'mvc-deferredresult': dv(
        [`<p>DeferredResult is a handle to a result that will arrive later.</p><ul><li><b>Handler:</b> <code>DeferredResultMethodReturnValueHandler</code> registers it with <code>WebAsyncManager.startDeferredResultProcessing</code>.</li><li><b>Waiting:</b> the request is in async mode with a timeout; no thread works on it.</li><li><b>Completion:</b> <code>setResult</code> stores the value and triggers an async dispatch on the calling thread.</li><li><b>Output:</b> the dispatch runs the normal return value handling and writes the response.</li></ul>`,
            r`DeferredResult<String> dr = new DeferredResult<>(5000L);
dr.onTimeout(() -> dr.setErrorResult("timed out"));
dr.onCompletion(() -> log("request finished"));
boolean accepted = dr.setResult("late answer");
System.out.println(accepted + " " + dr.isSetOrExpired());

// OUTPUT:
// true true`],
        [`<p>Options:</p><ul><li><b>Constructors:</b> no args, timeout, timeout plus fallback object.</li><li><b>setResult / setErrorResult:</b> one-time completion.</li><li><b>setResultHandler:</b> advanced hook.</li><li><b>hasResult, isSetOrExpired:</b> state checks.</li><li><b>Callbacks:</b> <code>onTimeout</code>, <code>onError</code>, <code>onCompletion</code>.</li></ul>`,
            r`DeferredResult<ResponseEntity<String>> dr = new DeferredResult<>(
    3000L, ResponseEntity.status(503).body("busy"));
dr.onError(t -> log("failed: " + t.getMessage()));
messageBus.subscribe("order-ready", msg ->
    dr.setResult(ResponseEntity.ok(msg)));

// OUTPUT:
// event within 3 s: 200 with the message; otherwise 503 busy`],
        [`<p>Common mistakes:</p><ul><li><b>Never completing it:</b> the request waits until timeout.</li><li><b>No cleanup:</b> stored results leak; remove them in <code>onCompletion</code>.</li><li><b>Unbounded queue</b> of waiting clients.</li><li><b>Completing twice:</b> the second call returns false.</li><li><b>Doing slow work inside the setResult caller:</b> the dispatch runs there.</li></ul>`,
            r`// WRONG: no timeout and no cleanup
waiting.add(new DeferredResult<String>());

// RIGHT
DeferredResult<String> dr = new DeferredResult<>(30000L, "none");
waiting.add(dr);
dr.onCompletion(() -> waiting.remove(dr));
dr.onTimeout(() -> waiting.remove(dr));

// OUTPUT:
// The waiting collection returns to size 0 when clients finish or time out.`],
        [`<p>Tuning:</p><ul><li>Cap the number of waiting requests and reject extra with 429 or 503.</li><li>Use a <code>ConcurrentHashMap</code> keyed by topic or user.</li><li>Complete results on a worker pool so a slow response writer does not block the event source.</li><li>Raise Tomcat <code>max-connections</code> for many idle waiting clients.</li></ul>`,
            r`private final Map<String, Queue<DeferredResult<String>>> topics =
    new ConcurrentHashMap<>();

void publish(String topic, String msg) {
    var q = topics.getOrDefault(topic, new ConcurrentLinkedQueue<>());
    DeferredResult<String> dr;
    while ((dr = q.poll()) != null) {
        dr.setResult(msg);
    }
}

// OUTPUT:
// All clients waiting on the topic are answered once.`],
        [`<p>Scenario: a payment page waits for a bank confirmation that arrives by webhook.</p><ul><li>The browser calls <code>/payments/42/status</code> and gets a DeferredResult stored by payment id.</li><li>The webhook handler calls <code>setResult</code> for that id.</li><li>After 25 seconds without news the client gets "pending" and asks again.</li></ul>`,
            r`@GetMapping("/payments/{id}/status")
DeferredResult<String> status(@PathVariable String id) {
    DeferredResult<String> dr = new DeferredResult<>(25000L, "pending");
    pending.put(id, dr);
    dr.onCompletion(() -> pending.remove(id));
    return dr;
}

@PostMapping("/webhooks/bank")
void bank(@RequestBody BankEvent e) {
    DeferredResult<String> dr = pending.get(e.paymentId());
    if (dr != null) dr.setResult(e.status());
}

// OUTPUT: (varies)
// GET waits 4 s, then "CONFIRMED"; with no webhook it returns "pending" after 25 s`]
    ),

    'mvc-webasynctask': dv(
        [`<p>WebAsyncTask is a Callable plus settings.</p><ul><li><b>Handler:</b> <code>AsyncTaskMethodReturnValueHandler</code> unpacks it.</li><li><b>Executor:</b> it resolves the executor from the task, a bean name or the default.</li><li><b>Timeout:</b> the task timeout replaces the default, and <code>timeoutCallback</code> is used when it triggers.</li><li><b>Execution:</b> then it follows the same path as a Callable, with an async dispatch for the result.</li></ul>`,
            r`WebAsyncTask<String> t = new WebAsyncTask<>(1500, () -> "ok");
t.onTimeout(() -> "fallback");
t.onError(() -> "error");
t.onCompletion(() -> log("done"));
// the manager reads: timeout=1500, callable, timeout/error callbacks

// OUTPUT:
// fast work: "ok"; work over 1.5 s: "fallback"`],
        [`<p>Constructors and callbacks:</p><ul><li><b>(Callable):</b> default timeout.</li><li><b>(Long timeout, Callable):</b> custom timeout.</li><li><b>(Long timeout, String executorName, Callable):</b> named bean.</li><li><b>(Long timeout, AsyncTaskExecutor, Callable):</b> direct executor.</li><li><b>onTimeout, onError, onCompletion:</b> callbacks.</li></ul>`,
            r`@GetMapping("/a")
WebAsyncTask<String> a(AsyncTaskExecutor ex) {
    return new WebAsyncTask<>(4000L, ex, () -> compute());
}

@GetMapping("/b")
WebAsyncTask<String> b() {
    return new WebAsyncTask<>(4000L, "exportExecutor", () -> compute());
}

// OUTPUT:
// Both run compute() on the chosen pool with a 4 s limit.`],
        [`<p>Common mistakes:</p><ul><li><b>Assuming the timeout stops the work:</b> it does not interrupt the thread.</li><li><b>Wrong bean name:</b> fails at request time.</li><li><b>Timeout longer than the proxy timeout:</b> the proxy closes first.</li><li><b>No fallback:</b> the client gets 503.</li></ul>`,
            r`// WRONG: work continues after the response was sent
new WebAsyncTask<>(1000, () -> { heavyLoop(); return "x"; });

// RIGHT: check for cancellation inside the work
new WebAsyncTask<>(1000, () -> {
    for (Item i : items) {
        if (Thread.currentThread().isInterrupted()) break;
        process(i);
    }
    return "x";
});

// OUTPUT:
// The loop can stop early when the thread is interrupted.`],
        [`<p>Tuning:</p><ul><li>Give each slow endpoint its own small pool so one dependency cannot starve the rest.</li><li>Set timeouts below gateway timeouts.</li><li>Return a fast fallback or a "try later" status.</li><li>Record timeouts as a metric.</li></ul>`,
            r`task.onTimeout(() -> {
    metrics.counter("export.timeout").increment();
    return "export is taking too long";
});

// OUTPUT: (varies)
// export.timeout count = 17 today`],
        [`<p>Scenario: an export endpoint normally finishes in 2 seconds but sometimes hangs on a slow database.</p><ul><li>Use a WebAsyncTask with a 5 second limit and a dedicated pool of 4.</li><li>On timeout, return 202 Accepted with a job link.</li><li>The rest of the application is not affected by the slow query.</li></ul>`,
            r`@GetMapping("/export")
WebAsyncTask<ResponseEntity<String>> export() {
    var t = new WebAsyncTask<>(5000L, "exportExecutor",
        () -> ResponseEntity.ok(exportService.run()));
    t.onTimeout(() -> ResponseEntity.accepted().body("/jobs/123"));
    return t;
}

// OUTPUT: (varies)
// fast: 200 with data; slow: 202 /jobs/123`]
    ),

    'mvc-streaming-response-performance': dv(
        [`<p>Streaming writes through to the servlet output while the handler runs.</p><ul><li><b>StreamingResponseBody:</b> <code>StreamingResponseBodyReturnValueHandler</code> starts async mode and runs the body on the task executor.</li><li><b>Emitters:</b> <code>ResponseBodyEmitter</code> sends objects through message converters one at a time.</li><li><b>Transfer:</b> with unknown length the container uses chunked encoding and flushes buffers.</li><li><b>Completion:</b> the request ends when the body returns or <code>complete()</code> is called.</li></ul>`,
            r`StreamingResponseBody body = out -> {
    byte[] buf = new byte[8192];
    try (InputStream in = Files.newInputStream(path)) {
        int n;
        while ((n = in.read(buf)) != -1) out.write(buf, 0, n);
    }
};

// OUTPUT:
// Memory used stays near 8 KB per request regardless of file size.`],
        [`<p>Options:</p><ul><li><b>StreamingResponseBody:</b> raw bytes.</li><li><b>ResponseBodyEmitter:</b> JSON objects or text, many sends.</li><li><b>SseEmitter:</b> events with id, name and retry.</li><li><b>Resource and InputStreamResource:</b> files and streams.</li><li><b>Range support:</b> <code>ResourceRegion</code> for partial content.</li><li><b>Flux:</b> with reactive types, <code>text/event-stream</code>.</li></ul>`,
            r`@GetMapping("/items")
ResponseBodyEmitter items() {
    ResponseBodyEmitter em = new ResponseBodyEmitter();
    executor.execute(() -> {
        try {
            for (int i = 1; i <= 3; i++) em.send(new Item(i), MediaType.APPLICATION_JSON);
            em.complete();
        } catch (IOException e) { em.completeWithError(e); }
    });
    return em;
}

// OUTPUT:
// {"id":1}{"id":2}{"id":3}`],
        [`<p>Common mistakes:</p><ul><li><b>Building the full list first</b> then returning it: no memory gain.</li><li><b>Not closing cursors:</b> the database connection leaks.</li><li><b>Ignoring IOException</b> from a disconnected client.</li><li><b>Proxy buffering:</b> nginx buffers events; set <code>X-Accel-Buffering: no</code>.</li><li><b>Transaction ended too early:</b> lazy loading fails while streaming.</li></ul>`,
            r`// WRONG: loads everything into memory
List<Row> all = repo.findAll();
all.forEach(r -> out.write(format(r)));

// RIGHT: stream with a cursor
@Transactional(readOnly = true)
public void export(OutputStream out) throws IOException {
    try (Stream<Row> s = repo.streamAll()) {
        for (Iterator<Row> it = s.iterator(); it.hasNext();) {
            out.write(format(it.next()).getBytes(StandardCharsets.UTF_8));
        }
    }
}

// OUTPUT:
// Heap use stays flat for a million rows.`],
        [`<p>Tuning:</p><ul><li>Use buffers of 8 to 64 KB.</li><li>Set the JDBC fetch size, for example 500, for large reads.</li><li>Run streams on a bounded executor, as each holds a thread.</li><li>Compress text streams, but flush at useful points.</li><li>Set timeouts and handle client aborts.</li></ul>`,
            r`@QueryHints(@QueryHint(name = HINT_FETCH_SIZE, value = "500"))
@Query("select r from Row r")
Stream<Row> streamAll();

// OUTPUT: (varies)
// 1,000,000 rows exported in 6 s with about 30 MB heap (before: 900 MB)`],
        [`<p>Scenario: finance downloads a 1 million row CSV and the application ran out of memory.</p><ul><li>Switch to a streaming endpoint reading rows with a cursor.</li><li>Write each row to the output stream, flush every few thousand rows.</li><li>The download starts immediately and memory stays flat.</li></ul>`,
            r`@GetMapping("/finance.csv")
ResponseEntity<StreamingResponseBody> finance() {
    return ResponseEntity.ok()
        .header("Content-Disposition", "attachment; filename=finance.csv")
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(out -> exportService.export(out));
}

// OUTPUT: (varies)
// first bytes after 0.2 s; total 6 s; heap stays under 64 MB`]
    )
};
