import { Topic } from '../coreJava';

export const springBootCaching: Topic = {
    id: 'spring-boot-caching',
    name: 'Caching & Redis',
    beginner: [
        {
            content: `<h3>The Problem: the Same Answer, Computed Again and Again</h3>
A product catalogue page asks for the same handful of products thousands of times a minute. The data changes perhaps twice a day. Every one of those requests still travels to the database, the database still plans and executes the query, and the result still crosses the network back.<br><br>

<strong>Caching</strong> is keeping the result of an expensive operation so the next caller gets it without repeating the work. The operation can be a database query, a call to a remote API, or a slow computation - the pattern is the same.<br><br>

Look at what the Hibernate log says before any caching is added:<br>`,
            codeExamples: [
                `@Service
public class ProductService {

    private final ProductRepository repository;

    public Product findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}

// Five requests for GET /api/products/42
// OUTPUT (spring.jpa.show-sql=true):
// Hibernate: select p1_0.id,p1_0.name,p1_0.price from product p1_0 where p1_0.id=?
// Hibernate: select p1_0.id,p1_0.name,p1_0.price from product p1_0 where p1_0.id=?
// Hibernate: select p1_0.id,p1_0.name,p1_0.price from product p1_0 where p1_0.id=?
// Hibernate: select p1_0.id,p1_0.name,p1_0.price from product p1_0 where p1_0.id=?
// Hibernate: select p1_0.id,p1_0.name,p1_0.price from product p1_0 where p1_0.id=?
//
// Five identical queries for data that changes twice a day.
// Average response time: 38 ms, nearly all of it waiting on the DB.`
            ]
        },
        {
            content: `<h3>Turning It On: <code>@EnableCaching</code> and <code>@Cacheable</code></h3>
Spring's <strong>Cache abstraction</strong> is two things: an annotation model you write against, and a pluggable <code>CacheManager</code> that decides where the data actually lives. Your code does not change when you move from an in-memory map to Redis - only the configuration does.<br><br>

Two steps:<br><br>

<div class="border">
1. <code>@EnableCaching</code> on a configuration class - this switches the machinery on.<br>
2. <code>@Cacheable</code> on the method whose result you want kept.
</div><br>

Without <code>@EnableCaching</code> the annotations are inert. Nothing fails, nothing warns - the method simply runs every time, which is the most confusing kind of failure because the code looks right.<br>`,
            codeExamples: [
                `@SpringBootApplication
@EnableCaching                      // <-- without this, @Cacheable does nothing
public class CatalogueApplication {
    public static void main(String[] args) {
        SpringApplication.run(CatalogueApplication.class, args);
    }
}`,
                `@Service
public class ProductService {

    @Cacheable("products")
    public Product findById(Long id) {
        System.out.println("HIT THE DATABASE for id " + id);
        return repository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }
}

// The same five requests for GET /api/products/42
// OUTPUT:
// HIT THE DATABASE for id 42
// Hibernate: select p1_0.id,p1_0.name,p1_0.price from product p1_0 where p1_0.id=?
// (requests 2, 3, 4, 5 print nothing at all)
//
// One query instead of five. Average response time falls from 38 ms
// to under 1 ms for the cached calls. The SQL simply disappears from
// the log - which is the quickest way to confirm caching is working.`
            ]
        },
        {
            content: `<h3>How the Lookup Works</h3>
On every call to a <code>@Cacheable</code> method Spring builds a <strong>cache key</strong> from the arguments, looks in the named cache, and:<br><br>

<table>
<tr><th>Outcome</th><th>What happens</th></tr>
<tr><td>Cache hit</td><td>The stored value is returned and <strong>the method body never runs</strong>.</td></tr>
<tr><td>Cache miss</td><td>The method runs, and its return value is stored under the key before being returned.</td></tr>
</table>
<br>
That first row is the whole point, and it is also the source of most caching bugs: an annotated method you believe is executing may not be executing at all.<br>`,
            codeExamples: [
                `// The flow, in order:

request -> proxy -> key = 42
                 -> cache "products".get(42)
                        |
        +---------------+---------------+
        | present (HIT)                 | absent (MISS)
        v                               v
   return stored Product         call findById(42)
   (method body SKIPPED)         store result under key 42
                                 return it`,
                `// Default key generation (SimpleKeyGenerator):
//   no arguments        -> SimpleKey.EMPTY
//   one argument        -> that argument itself (so 42, not a wrapper)
//   two or more         -> a SimpleKey holding all of them

@Cacheable("products")
public Product findById(Long id) { ... }              // key = 42

@Cacheable("searches")
public List<Product> search(String term, int page) { ... }
                                                      // key = SimpleKey["shoes", 0]

// The arguments must have sane equals() and hashCode(). Passing an
// entity with the default identity equals() gives a new key every
// call, so the cache fills up and never hits - a slow leak that
// looks like "caching does not work on this method".`
            ]
        },
        {
            content: `<h3>Choosing the Key Yourself with SpEL</h3>
The default key uses every argument. That is often wrong: an argument may be irrelevant to the result, or the interesting part may be a field inside an object.<br><br>

The <code>key</code> attribute takes a <strong>SpEL</strong> expression evaluated against the invocation.<br>`,
            codeExamples: [
                `// Only the id identifies the result; the flag does not.
@Cacheable(value = "products", key = "#id")
public Product findById(Long id, boolean includeStock) { ... }

// A field of an argument object
@Cacheable(value = "products", key = "#filter.categoryId")
public List<Product> byCategory(ProductFilter filter) { ... }

// Composing several values - keep it readable
@Cacheable(value = "searches", key = "#term + ':' + #page")
public List<Product> search(String term, int page) { ... }
// key = "shoes:0"

// Useful SpEL roots inside cache annotations:
//   #root.methodName   the method name
//   #root.args[0]      positional argument access
//   #result            the RETURN value - available only in
//                      @CachePut and in @CacheEvict when
//                      beforeInvocation = false`,
                `// condition  -> evaluated BEFORE the call, on the arguments.
//               If false, the cache is bypassed entirely.
// unless     -> evaluated AFTER the call, on #result.
//               If true, the result is NOT stored.

@Cacheable(value = "products",
           key = "#id",
           condition = "#id > 0",        // never cache a nonsense id
           unless = "#result == null")   // never cache a null
public Product findById(Long id) { ... }

// A common and correct use: do not cache large result sets that
// would evict everything else.
@Cacheable(value = "searches",
           unless = "#result.size() > 500")
public List<Product> search(String term) { ... }`
            ]
        },
        {
            content: `<h3>Writing and Clearing: <code>@CachePut</code>, <code>@CacheEvict</code>, <code>@Caching</code></h3>
A cache that is only ever filled goes stale. Three more annotations keep it honest.<br><br>

<table>
<tr><th>Annotation</th><th>Behaviour</th></tr>
<tr><td>@Cacheable</td><td>Look first. On a hit, skip the method. On a miss, run it and store the result.</td></tr>
<tr><td>@CachePut</td><td><strong>Always</strong> run the method, then store the result. Never skips. Use it for updates.</td></tr>
<tr><td>@CacheEvict</td><td>Remove an entry (or, with <code>allEntries = true</code>, everything in that cache).</td></tr>
<tr><td>@Caching</td><td>A container for several of the above on one method - the only way to apply, say, two evictions.</td></tr>
</table>`,
            codeExamples: [
                `@Service
public class ProductService {

    @Cacheable(value = "products", key = "#id")
    public Product findById(Long id) { ... }

    // Runs the save, then refreshes the cached entry with the
    // NEW state. The next reader sees the update immediately.
    @CachePut(value = "products", key = "#product.id")
    public Product update(Product product) {
        return repository.save(product);
    }

    @CacheEvict(value = "products", key = "#id")
    public void delete(Long id) {
        repository.deleteById(id);
    }

    // Clear the whole cache - after a bulk import, for example.
    @CacheEvict(value = "products", allEntries = true)
    public void reloadCatalogue() { ... }
}`,
                `// @Caching groups annotations that cannot otherwise coexist.
// Renaming a product invalidates the by-id entry AND every
// search result that might have contained the old name.
@Caching(evict = {
    @CacheEvict(value = "products", key = "#product.id"),
    @CacheEvict(value = "searches", allEntries = true)
})
public Product rename(Product product) {
    return repository.save(product);
}

// OUTPUT after rename(42):
//   products::42     removed
//   searches::*      cleared
//   next read of 42  -> MISS -> one query -> repopulated`
            ]
        },
        {
            content: `<h3>Where the Data Lives: the <code>CacheManager</code></h3>
If no cache provider is on the classpath, Boot configures <code>ConcurrentMapCacheManager</code> - a <code>ConcurrentHashMap</code> per named cache. It is fine for a demo and wrong for production, because it never evicts anything and never expires anything. It grows until the heap does not.<br><br>

<table>
<tr><th>Provider</th><th>When to use it</th></tr>
<tr><td>ConcurrentMapCacheManager</td><td>Default when nothing else is present. No size limit, no TTL. Development only.</td></tr>
<tr><td>Caffeine</td><td>A single JVM. Fast, in-heap, with size limits and expiry. The right default for one instance.</td></tr>
<tr><td>Redis</td><td>Several instances sharing one cache, or a cache that must survive a restart.</td></tr>
<tr><td>Hazelcast / Infinispan</td><td>Embedded distributed cache when a separate Redis server is not wanted.</td></tr>
</table>`,
                    codeExamples: [
                `// The explicit in-memory manager - names the caches up front so a
// typo in @Cacheable("prodcuts") fails instead of silently creating
// a second cache that never hits.
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("products", "searches");
    }
}
// OUTPUT with a typo and a fixed name list:
// java.lang.IllegalArgumentException:
//     Cannot find cache named 'prodcuts' for Builder[...findById]`,
                `<!-- Caffeine: bounded, with expiry -->
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>`,
                `# application.properties - Caffeine
spring.cache.type=caffeine
spring.cache.cache-names=products,searches
spring.cache.caffeine.spec=maximumSize=10000,expireAfterWrite=10m,recordStats=true

# maximumSize      evicts least-recently-used entries past 10 000
# expireAfterWrite entries die 10 minutes after being written
# expireAfterAccess would instead reset the clock on every read -
#                  a hot key would then never expire, which is
#                  usually not what you want for freshness`
            ]
        },
        {
            content: `<h3>Redis: One Cache Shared by Every Instance</h3>
Caffeine lives inside one JVM. Run four instances behind a load balancer and you have four independent caches: an eviction on instance 1 leaves stale data on instances 2, 3 and 4. A <strong>distributed cache</strong> puts the data in one external store that all instances read and write.<br><br>

<strong>Redis</strong> is the usual choice - an in-memory key/value server with native expiry. Boot auto-configures a <code>RedisCacheManager</code> as soon as the starter is present.<br>`,
            codeExamples: [
                `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- This alone changes the cache provider. The @Cacheable,
     @CachePut and @CacheEvict annotations are untouched - that
     is the value of the abstraction. -->`,
                `# application.properties
spring.cache.type=redis
spring.data.redis.host=localhost
spring.data.redis.port=6379
# spring.data.redis.password=\${REDIS_PASSWORD}

# Default time-to-live for every cache entry
spring.cache.redis.time-to-live=10m
# Do not write nulls (they still occupy a key and a TTL)
spring.cache.redis.cache-null-values=false
# Prefix keys with the cache name: "products::42"
spring.cache.redis.use-key-prefix=true

# NOTE for Boot 2.x the properties are spring.redis.host / .port.
# They moved to spring.data.redis.* in Boot 3.x; the old names are
# silently ignored there, so the app quietly talks to localhost.`,
                `# Same code, now inspect Redis directly:
$ redis-cli
127.0.0.1:6379> KEYS products*
1) "products::42"
127.0.0.1:6379> TTL products::42
(integer) 583
127.0.0.1:6379> GET products::42
"{\\"@class\\":\\"com.example.Product\\",\\"id\\":42,\\"name\\":\\"Running Shoe\\",\\"price\\":4999.00}"

# TTL counts down; at 0 the key vanishes and the next read is a
# miss that repopulates it. Expiry is the provider's job, not
# Spring's - see the Expert tab.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>It Is a Proxy - So Self-Invocation Does Not Cache</h3>
Spring implements caching with the same <strong>AOP proxy</strong> mechanism as <code>@Transactional</code>. The bean injected elsewhere is not your class; it is a proxy that consults the cache and then delegates. Which means: a call from one method of the class to another goes straight down the <code>this</code> reference and never passes the proxy.<br><br>

The annotation is present, the code reads correctly, and no caching occurs. This is the single most common "caching does not work" report.<br>`,
            codeExamples: [
                `@Service
public class ProductService {

    public List<Product> report(List<Long> ids) {
        return ids.stream()
                  .map(this::findById)   // <-- 'this', not the proxy
                  .toList();
    }

    @Cacheable("products")
    public Product findById(Long id) {
        System.out.println("DB hit " + id);
        return repository.findById(id).orElseThrow();
    }
}

// report(List.of(42, 42, 42))
// OUTPUT:
// DB hit 42
// DB hit 42
// DB hit 42
// Three queries for one id. Calling findById(42) from a CONTROLLER
// three times prints "DB hit 42" once - the identical method,
// caching or not caching depending only on who calls it.`,
                `// FIX 1 - move the cached method to another bean. Almost always
// the right answer, because the split is usually a real one.
@Service
public class ProductQueryService {
    @Cacheable("products")
    public Product findById(Long id) { ... }
}

@Service
public class ProductReportService {
    private final ProductQueryService query;   // a PROXY - cached
    public List<Product> report(List<Long> ids) {
        return ids.stream().map(query::findById).toList();
    }
}

// FIX 2 - self-injection. Works, but it advertises the design smell.
@Service
public class ProductService {
    @Lazy @Autowired private ProductService self;   // @Lazy avoids
                                                    // the circular
                                                    // reference
    public List<Product> report(List<Long> ids) {
        return ids.stream().map(self::findById).toList();
    }
}

// Also note: proxying means the method must be PUBLIC and the class
// must be a Spring bean. @Cacheable on a private, final, or static
// method, or on a plain 'new'-ed object, is silently ignored.`
            ]
        },
        {
            content: `<h3><code>@Cacheable</code> on an Update Is a Bug</h3>
The difference between <code>@Cacheable</code> and <code>@CachePut</code> is not a matter of taste. One may skip the method; the other never does.<br><br>

<table>
<tr><th></th><th>@Cacheable</th><th>@CachePut</th></tr>
<tr><td>On a cache hit</td><td>Returns the stored value, <strong>method does not run</strong></td><td>Runs the method regardless</td></tr>
<tr><td>On a miss</td><td>Runs the method, stores the result</td><td>Runs the method, stores the result</td></tr>
<tr><td>Correct for</td><td>Reads</td><td>Writes that should refresh the cache</td></tr>
</table>
<br>
Put <code>@Cacheable</code> on <code>save()</code> and the second call with the same key never reaches the database at all. The method returns the stale object it cached earlier and reports success. Nothing throws; the write is simply lost.<br>`,
            codeExamples: [
                `// WRONG - and it looks harmless
@Cacheable(value = "products", key = "#product.id")
public Product update(Product product) {
    return repository.save(product);
}

// update(product 42, price 4999)  -> MISS -> saved, cached
// update(product 42, price 2999)  -> HIT  -> save() NEVER RUNS
// OUTPUT: returns the product with price 4999.
//         The database still holds 4999.
//         The caller sees a 200 and believes the update applied.

// RIGHT
@CachePut(value = "products", key = "#product.id")
public Product update(Product product) {
    return repository.save(product);   // always executes
}
// The stored value is replaced by whatever save() returns - which
// matters, because save() returns the managed entity with generated
// columns (version, updated_at) populated.`,
                `// The mirror-image mistake: @CachePut on a read.
@CachePut("products")                       // WRONG for a getter
public Product findById(Long id) { ... }
// It never consults the cache, so every call hits the database and
// then overwrites the entry. All of the cost, none of the benefit -
// and it looks like caching is enabled.

// @CacheEvict and transactions:
@Transactional
@CacheEvict(value = "products", key = "#id")
public void delete(Long id) { repository.deleteById(id); }
// By default the eviction happens when the METHOD returns, which is
// BEFORE the transaction commits. If the commit then fails, the
// entry is already gone - harmless (a miss, then a reload).
//
// beforeInvocation = true evicts BEFORE the method body. That is
// the dangerous direction: evict, then the write fails, and the
// cache reloads the OLD row. Use it only when the method may throw
// and you want the entry gone either way.`
            ]
        },
        {
            content: `<h3>Cache Stampede, and <code>sync = true</code></h3>
A popular key expires. In the next few milliseconds two hundred concurrent requests all look it up, all miss, and all call the expensive method. The database receives two hundred identical queries at once, precisely because the cache was working well enough to concentrate the traffic on one key.<br><br>

This is the <strong>thundering herd</strong>, or cache stampede. The load spike arrives at the moment of expiry, so it looks random and is hard to reproduce.<br>`,
            codeExamples: [
                `// Without protection, at the instant products::42 expires:
//
// t=0ms   TTL reaches zero, key removed
// t=0ms   thread-1  MISS -> SELECT ...
// t=0ms   thread-2  MISS -> SELECT ...
// ...
// t=1ms   thread-200 MISS -> SELECT ...
// t=40ms  200 identical rows returned, 200 writes of the same value
//
// OUTPUT in the DB log: 200 identical queries in a 2 ms window.
// Connection pool exhausted; unrelated requests time out.`,
                `// sync = true: one thread computes, the others block and then
// receive that thread's result.
@Cacheable(value = "products", key = "#id", sync = true)
public Product findById(Long id) { ... }

// t=0ms   thread-1  MISS -> acquires the lock -> SELECT ...
// t=0ms   threads 2..200 block on the same key
// t=40ms  thread-1 stores the value and returns
// t=40ms  threads 2..200 all receive it. ONE query.

// Constraints worth knowing before you reach for it:
//   - sync = true cannot be combined with 'unless', with multiple
//     cache names, or with @Caching
//   - the lock is PER JVM for Caffeine. With Redis and four
//     instances you get four queries instead of 200 - a large
//     improvement, not a guarantee
//   - Redisson's Spring Cache integration offers a genuinely
//     distributed lock if one query is a hard requirement`,
                `// Other mitigations, in rough order of usefulness:
//
// 1. Jitter the TTL so a batch of keys written together does not
//    expire together.
Duration ttl = Duration.ofMinutes(10)
        .plusSeconds(ThreadLocalRandom.current().nextInt(120));
//
// 2. Refresh ahead: Caffeine's refreshAfterWrite serves the stale
//    value while ONE thread reloads in the background.
//    spring.cache.caffeine.spec=maximumSize=10000,refreshAfterWrite=5m
//
// 3. Warm the cache on startup for keys you know are hot.`
            ]
        },
        {
            content: `<h3>TTL Is Not Part of the Abstraction</h3>
There is no <code>@Cacheable(ttl = ...)</code>, and people look for it constantly. Spring's abstraction defines <em>what</em> to cache; <strong>expiry is a provider concern</strong>, configured where the <code>CacheManager</code> is built. The annotations carry no notion of time at all.<br><br>

This matters when caches need different lifetimes - a currency rate valid for a minute and a country list valid for a day cannot both use one global TTL.<br>`,
            codeExamples: [
                `// Per-cache TTL with Redis
@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    public RedisCacheManagerBuilderCustomizer ttlCustomizer() {
        return builder -> builder
            .withCacheConfiguration("products",
                 config(Duration.ofMinutes(10)))
            .withCacheConfiguration("fxRates",
                 config(Duration.ofSeconds(30)))
            .withCacheConfiguration("countries",
                 config(Duration.ofDays(1)));
    }

    private RedisCacheConfiguration config(Duration ttl) {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(ttl)
                .disableCachingNullValues()
                .serializeValuesWith(SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer()));
    }
}
// OUTPUT:
// > TTL products::42     (integer) 598
// > TTL fxRates::USDINR  (integer) 28
// > TTL countries::all   (integer) 86391`,
                `// Caffeine has no per-cache spec through properties, so build
// the manager yourself when the lifetimes differ.
@Bean
public CacheManager cacheManager() {
    SimpleCacheManager manager = new SimpleCacheManager();
    manager.setCaches(List.of(
        new CaffeineCache("products", Caffeine.newBuilder()
                .maximumSize(10_000)
                .expireAfterWrite(Duration.ofMinutes(10))
                .build()),
        new CaffeineCache("fxRates", Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterWrite(Duration.ofSeconds(30))
                .build())));
    return manager;
}

// And the reason a TTL is not optional: ConcurrentMapCacheManager
// has neither size bound nor expiry. Cache a user object per
// session id on it and the heap grows for the life of the process.
// OUTPUT eventually:
// java.lang.OutOfMemoryError: Java heap space`
            ]
        },
        {
            content: `<h3>Serialization: What Actually Goes Into Redis</h3>
Caffeine stores object references. Redis stores bytes, so every cached value is serialized on the way out and deserialized on the way back. The default serializer Spring uses is <code>JdkSerializationRedisSerializer</code>, and it is a poor default for a cache that lives longer than one deployment.<br><br>

<table>
<tr><th>Problem with JDK serialization</th><th>Consequence</th></tr>
<tr><td>The class must implement <code>Serializable</code>, transitively</td><td>One nested field without it throws <code>NotSerializableException</code> at runtime, not compile time.</td></tr>
<tr><td>The payload is opaque binary</td><td><code>redis-cli GET</code> shows unreadable bytes. Debugging a stale entry means writing a program.</td></tr>
<tr><td>It is Java-only</td><td>A Node or Python service cannot read the same cache.</td></tr>
<tr><td>It is bound to <code>serialVersionUID</code> and the class shape</td><td>Adding a field can make every existing entry unreadable after deploy.</td></tr>
</table>
<br>
JSON solves the first three outright and makes the fourth manageable.<br>`,
            codeExamples: [
                `@Bean
public RedisCacheConfiguration cacheConfiguration() {

    ObjectMapper mapper = JsonMapper.builder()
            .addModule(new JavaTimeModule())          // LocalDate etc.
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .activateDefaultTyping(                   // writes @class
                    BasicPolymorphicTypeValidator.builder()
                            .allowIfSubType("com.example.dto.")
                            .build(),
                    ObjectMapper.DefaultTyping.NON_FINAL)
            .build();

    return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(SerializationPair.fromSerializer(
                    new StringRedisSerializer()))
            .serializeValuesWith(SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer(mapper)));
}

// Note the allow-list on default typing. Unrestricted default
// typing plus a writable Redis is a deserialization gadget attack:
// an attacker who can set a key names a class, and Jackson
// instantiates it. Always constrain the validator to your own
// packages.`,
                `// Version tolerance - the failure that only appears on deploy day.
//
// v1 is running; the cache holds:
//   {"@class":"com.example.dto.ProductDto","id":42,"name":"Shoe"}
//
// v2 adds a field 'currency'. During the rolling deploy both
// versions read the same cache.
//
// v2 reading a v1 entry:
//   currency is absent -> null. Fine, IF the code tolerates null.
//
// v1 reading a v2 entry:
//   UnrecognizedPropertyException: Unrecognized field "currency"
//   ... and every read of that key throws, for every user, until
//   the old instances are gone.

// Make DTOs tolerant of unknown fields:
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductDto { ... }

// Or configure it globally:
mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

// For a breaking shape change, version the cache name instead of
// hoping: "products.v2". The old keys expire on their own TTL and
// nothing has to be flushed by hand.`,
                `// Cache DTOs, not JPA entities.
//
// A cached entity is DETACHED. Touch a lazy association on it and:
// org.hibernate.LazyInitializationException: could not initialize
//     proxy [com.example.Product#42] - no Session
//
// Worse, an entity serialized with its Hibernate proxies can drag
// half the object graph into Redis, and passing a cached detached
// entity to save() can resurrect stale state over a newer row.
//
// Cache a flat, immutable projection instead:
public record ProductDto(Long id, String name, BigDecimal price) {}`
            ]
        },
        {
            content: `<h3>Invalidation: the Part That Is Genuinely Hard</h3>
Filling a cache is a one-line annotation. Knowing when a stored value stopped being true is a distributed-systems problem, and there is no annotation for it. Phil Karlton's line about the two hard things in computer science survives because the second half keeps being true.<br><br>

The difficulty is that the write which invalidates an entry frequently does not pass through the code holding the annotation.<br>`,
            codeExamples: [
                `// Ways a cache goes stale that @CacheEvict cannot see:
//
// 1. A DBA runs an UPDATE in a SQL client.
// 2. A batch job writes with a different service, or plain JDBC.
// 3. A repository method bypasses the annotated service:
//       repository.save(p)   // called directly from a controller
// 4. A @Modifying @Query updates rows in bulk:
//       @Modifying
//       @Query("update Product p set p.price = p.price * 1.1")
//       void raisePrices();      // thousands of rows, zero evictions
// 5. Another INSTANCE of your own service evicts its local Caffeine
//    cache; the other three instances keep serving the old value.
//
// Number 5 is why a shared Redis cache is often chosen over a
// faster local one - not for capacity, but for correctness.`,
                `// Practical rules that hold up:
//
// A. Give every cache a TTL, even when eviction looks complete.
//    The TTL bounds how wrong you can be when eviction is missed.
//    "Stale for at most 5 minutes" is a statement you can defend;
//    "stale until someone notices" is not.
//
// B. Funnel writes through one place, so there is one method to
//    annotate. A repository called from six services cannot be
//    invalidated reliably.
//
// C. Prefer evict over update when the value is derived. Removing
//    is idempotent; recomputing a cached value in two places
//    invites the two copies to disagree.
//
// D. Evict AFTER the commit, not at method return, when a stale
//    read during the window would be harmful:
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void onProductChanged(ProductChangedEvent event) {
    cacheManager.getCache("products").evict(event.productId());
}
//
// E. Make the key survivable. A key derived from mutable state
//    (a name, a slug) leaves an orphan entry when that state
//    changes. Key on the immutable id.`
            ]
        },
        {
            content: `<h3>What Should Not Be Cached</h3>
The worst caching bug is not a stale price. It is a shared cache returning one user's data to another - and it passes every functional test, because with one user at a time it behaves perfectly.<br><br>

<div class="border">
The rule: if the result depends on <strong>who is asking</strong>, the identity of the asker must be in the key - or the method must not be cached at all.
</div><br>

<table>
<tr><th>Do not cache</th><th>Why</th></tr>
<tr><td>Anything keyed only on non-identity arguments but scoped to a user</td><td>Every user shares one entry. A data leak, and a serious one.</td></tr>
<tr><td>Authorisation decisions</td><td>A revoked permission stays effective until the TTL expires.</td></tr>
<tr><td>Values read from <code>SecurityContextHolder</code> inside the method</td><td>The current principal is not an argument, so it is not in the key.</td></tr>
<tr><td>Data that must be exact right now - balances, stock levels, one-time tokens</td><td>Any staleness window is a correctness bug.</td></tr>
<tr><td>Cheap computations</td><td>A cache lookup, a serialization round trip and a network hop are not free. Measure before caching.</td></tr>
<tr><td>Results that are rarely reused</td><td>A near-zero hit rate is pure overhead plus memory pressure.</td></tr>
</table>`,
            codeExamples: [
                `// THE LEAK - the argument list contains nothing user-specific
@Cacheable("orders")
public List<Order> myOrders() {
    Long userId = SecurityContextHolder.getContext()
            .getAuthentication().getUserId();
    return repository.findByUserId(userId);
}
// No arguments -> key = SimpleKey.EMPTY -> ONE entry for everyone.
//
// OUTPUT:
// alice calls first  -> MISS -> alice's orders cached under ""
// bob calls second   -> HIT  -> bob is shown ALICE'S ORDERS
//
// Nothing throws. Nothing is logged. In a single-user test it is
// invisible.

// FIX 1 - make identity an explicit argument, so it is in the key
@Cacheable(value = "orders", key = "#userId")
public List<Order> ordersFor(Long userId) {
    return repository.findByUserId(userId);
}

// FIX 2 - keep the ambient principal, but put it in the key
@Cacheable(value = "orders", key = "authentication.name")
public List<Order> myOrders() { ... }
// 'authentication' is a SpEL root that Spring Security's cache
// support exposes. Correct, but fragile - one refactor that
// removes the key attribute reopens the leak. Prefer FIX 1.`,
                `// Sizing the win before adding a cache. Both numbers matter.
management.endpoints.web.exposure.include=caches,metrics
spring.cache.caffeine.spec=maximumSize=10000,expireAfterWrite=10m,recordStats=true

// GET /actuator/metrics/cache.gets?tag=result:hit
// GET /actuator/metrics/cache.gets?tag=result:miss
//
// OUTPUT for a healthy cache:
//   hit  1 842 301
//   miss    41 908       -> 97.8 % hit rate
//
// OUTPUT for one that should be deleted:
//   hit      1 204
//   miss   980 551       -> 0.1 % hit rate
// Every request pays the lookup and the write, and almost nobody
// benefits. This cache costs memory and latency and returns
// nothing. Remove it rather than tuning it.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does <code>@EnableCaching</code> do?</td><td>Registers the caching AOP infrastructure. Without it the cache annotations are ignored silently and every method runs normally.</td></tr>
<tr><td>What happens on a <code>@Cacheable</code> hit?</td><td>The stored value is returned and the method body is not executed at all.</td></tr>
<tr><td>Difference between <code>@Cacheable</code> and <code>@CachePut</code>?</td><td>@Cacheable may skip the method; @CachePut always runs it and then stores the result. Reads use the first, writes the second.</td></tr>
<tr><td>Why is <code>@Cacheable</code> on an update method a bug?</td><td>On a hit the save never executes. The method returns the stale cached object and reports success, so the write is silently lost.</td></tr>
<tr><td>Why does caching not work when the method is called from the same class?</td><td>It is proxy-based, like <code>@Transactional</code>. A <code>this</code> call bypasses the proxy. Move the method to another bean, or self-inject with <code>@Lazy</code>.</td></tr>
<tr><td>How is the cache key built by default?</td><td><code>SimpleKeyGenerator</code>: no args gives <code>SimpleKey.EMPTY</code>, one arg is used directly, several become a <code>SimpleKey</code>. Override with a SpEL <code>key</code> expression.</td></tr>
<tr><td>Difference between <code>condition</code> and <code>unless</code>?</td><td><code>condition</code> is evaluated before the call on the arguments and skips the cache entirely; <code>unless</code> is evaluated after on <code>#result</code> and only prevents storing.</td></tr>
<tr><td>How do you set a TTL on <code>@Cacheable</code>?</td><td>You cannot. TTL is not part of the Spring abstraction - it is configured per provider, for example <code>RedisCacheConfiguration.entryTtl</code> or Caffeine's <code>expireAfterWrite</code>.</td></tr>
<tr><td>What is a cache stampede, and what mitigates it?</td><td>Many threads miss the same hot key at expiry and all recompute it. <code>sync = true</code> lets one thread compute while the rest wait; TTL jitter and refresh-ahead also help. The <code>sync</code> lock is per JVM.</td></tr>
<tr><td>Why is <code>JdkSerializationRedisSerializer</code> a poor default?</td><td>It requires <code>Serializable</code> throughout, produces opaque binary, is unreadable outside Java, and breaks on class changes. Use a JSON serializer with an allow-listed type validator.</td></tr>
<tr><td>What breaks during a rolling deploy that changes a cached DTO?</td><td>Old instances read entries written by new ones. Make DTOs tolerant of unknown fields, or version the cache name.</td></tr>
<tr><td>Should JPA entities be cached?</td><td>No. A cached entity is detached, so lazy associations throw <code>LazyInitializationException</code>, and re-saving it can overwrite newer state. Cache flat DTOs.</td></tr>
<tr><td>Why is a local cache a correctness problem across several instances?</td><td>Each JVM has its own copy, so an eviction on one instance leaves the others stale. A shared store such as Redis gives one copy for all of them.</td></tr>
<tr><td>What must never go in a shared cache?</td><td>Anything user-specific whose key does not include the user, plus authorisation decisions and values that must be exact. Caching a per-user result under a shared key leaks one user's data to another.</td></tr>
</table>`
        }
    ]
};
