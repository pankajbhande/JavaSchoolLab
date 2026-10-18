import { Topic } from '../coreJava';

export const springBootApiDesign: Topic = {
    id: 'spring-boot-api-design',
    name: 'API Design - Pagination, Filtering & Versioning',
    beginner: [
        {
            content: `<h3>Business Requirement</h3>
An orders service exposes <code>GET /api/orders</code>. It returns every order in the table. On the developer's machine the table holds ten rows and the endpoint answers in four milliseconds. In production the table holds two million rows.<br><br>

<h3>Problem Statement</h3>
That endpoint is a production incident waiting to happen, and it fails in three places at once.<br><br>

<div class="border">
<strong>The database</strong> - a full table scan reads and sorts two million rows.<br>
<strong>The application</strong> - Hibernate builds two million entity objects, then Jackson serialises them into a single string. The heap holds the whole result twice. This is where <code>OutOfMemoryError</code> arrives, and it takes the process down for every other user, not only for the one who made the call.<br>
<strong>The client</strong> - a 900 MB JSON document over a mobile connection. The request times out at the load balancer long before the last byte is written.
</div><br>

An <strong>unpaginated collection endpoint</strong> is therefore not a small inefficiency. It is an unbounded resource request that any caller can make, and it fails only in production, because only production has the data.<br><br>

The rule is simple: <strong>any endpoint that returns a collection must return a bounded page of that collection</strong>. There are no exceptions for "small" tables - small tables grow.`,
            codeExamples: [
                `// The endpoint everyone writes first
@GetMapping("/api/orders")
public List<Order> findAll() {
    return repository.findAll();          // SELECT * FROM orders
}

// OUTPUT in dev (10 rows):
// 200 OK, 1.2 KB, 4 ms

// OUTPUT in production (2,000,000 rows):
// java.lang.OutOfMemoryError: Java heap space
//   at java.base/java.util.Arrays.copyOf(Arrays.java:3745)
//   at com.fasterxml.jackson.core.util.ByteArrayBuilder...
// ...and the pod is restarted. Every user is affected, not just this caller.`
            ]
        },
        {
            content: `<h3>Pageable and Page</h3>
Spring Data does the work. Declare a <code>Pageable</code> parameter on the controller method and hand it to the repository; Spring MVC populates it from the query string automatically through <code>PageableHandlerMethodArgumentResolver</code>, which is registered by Boot's web auto-configuration.<br><br>

<table>
<tr><th>Type</th><th>Meaning</th></tr>
<tr><td><code>Pageable</code></td><td>The request for a page - page number (zero-based), page size and sort order.</td></tr>
<tr><td><code>PageRequest.of(0, 20)</code></td><td>How you build a <code>Pageable</code> in code rather than from the request.</td></tr>
<tr><td><code>Page&lt;T&gt;</code></td><td>The result - the rows plus <code>totalElements</code> and <code>totalPages</code>. Costs a second <code>COUNT</code> query.</td></tr>
<tr><td><code>Slice&lt;T&gt;</code></td><td>The rows plus a <code>hasNext</code> flag, with no <code>COUNT</code>. Use it for infinite scroll, where nobody displays a total.</td></tr>
<tr><td><code>@PageableDefault</code></td><td>Sets the page size and sort used when the caller supplies none.</td></tr>
</table>
<br>
Note the two queries a <code>Page</code> issues. On a large table the <code>COUNT</code> is often slower than the page itself, which is why <code>Slice</code> exists.`,
            codeExamples: [
                `@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository repository;

    public OrderController(OrderRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public Page<OrderDto> list(
            @PageableDefault(size = 20, sort = "createdAt",
                             direction = Sort.Direction.DESC) Pageable pageable) {

        return repository.findAll(pageable).map(OrderDto::from);
    }
}

// The repository needs nothing new - JpaRepository already declares
//   Page<T> findAll(Pageable pageable);
// so do NOT redeclare it. Redeclaring findAll(Pageable) with a
// different return type does not compile.`,
                `// REQUEST:  GET /api/orders?page=0&size=2&sort=createdAt,desc
// SQL that Hibernate logs:
//   select o.* from orders o order by o.created_at desc limit 2 offset 0
//   select count(o.id) from orders o
//
// RESPONSE 200 OK:
{
  "content": [
    { "id": 4711, "customer": "ajay",  "total": 249.00 },
    { "id": 4710, "customer": "vikas", "total":  89.50 }
  ],
  "pageable": { "pageNumber": 0, "pageSize": 2, "offset": 0 },
  "totalElements": 2000000,
  "totalPages": 1000000,
  "number": 0,
  "size": 2,
  "numberOfElements": 2,
  "first": true,
  "last": false,
  "empty": false
}

// Note: "page" is ZERO-BASED. ?page=1 is the SECOND page.
// The most common bug report against a new API is an off-by-one here,
// because the UI numbers its pages from 1.`
            ]
        },
        {
            content: `<h3>Sorting</h3>
<code>sort</code> is a repeatable query parameter of the form <code>field,direction</code>. Repeat it for a multi-column sort; the order of the parameters is the order of the <code>ORDER BY</code> clause.<br><br>

Two things bite here. First, the value is a <strong>property name on the entity</strong>, not a column name - <code>createdAt</code>, not <code>created_at</code>. Second, an unrecognised property produces a <code>PropertyReferenceException</code> and a 500, so a caller can crash the endpoint with a typo. Validate the field against an allow-list if the API is public.<br><br>

Always include a <strong>tie-breaker</strong> in the sort. If you sort by <code>status</code> alone and a thousand rows share a status, the database is free to return them in any order it likes, and it will not return the same order twice. Rows then appear on two pages, or on none. Appending a unique column - the primary key - makes the ordering total and the paging deterministic.`,
            codeExamples: [
                `// Multi-column sort from the query string
// GET /api/orders?sort=status,asc&sort=createdAt,desc&sort=id,asc
//   order by o.status asc, o.created_at desc, o.id asc
//                                              ^ the tie-breaker

// In code
Pageable p = PageRequest.of(0, 20,
        Sort.by(Sort.Order.asc("status"),
                Sort.Order.desc("createdAt"),
                Sort.Order.asc("id")));

// What a bad field name does:
// GET /api/orders?sort=creatd_at,desc
// 500 Internal Server Error
// org.springframework.data.mapping.PropertyReferenceException:
//   No property 'creatd_at' found for type 'Order'
//
// A caller should never be able to cause a 500. Guard it:
private static final Set<String> SORTABLE = Set.of("id", "createdAt", "status", "total");

if (!pageable.getSort().stream().allMatch(o -> SORTABLE.contains(o.getProperty()))) {
    throw new BadRequestException("Unsupported sort field");   // 400, not 500
}`
            ]
        },
        {
            content: `<h3>Filtering and Search</h3>
Filters are optional query parameters. Two or three of them can be handled with derived query methods; beyond that the combinations explode - four optional filters mean sixteen repository methods - and you need a query built at run time.<br><br>

<strong>Specifications</strong> (the JPA Criteria API wrapped by Spring Data) let you compose one predicate per supplied filter and ignore the rest. Extend <code>JpaSpecificationExecutor&lt;T&gt;</code> on the repository and the <code>findAll(Specification, Pageable)</code> overload appears.<br><br>

Keep filtering and searching in the query string, never in the path. <code>/api/orders?status=SHIPPED</code> is a filtered view of the orders collection; <code>/api/orders/shipped</code> invents a resource that does not exist and forces a new endpoint for every filter you ever add.`,
            codeExamples: [
                `public interface OrderRepository
        extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> { }

public final class OrderSpecs {

    public static Specification<Order> hasStatus(String status) {
        return (root, q, cb) -> status == null
                ? null                                    // null = "no restriction"
                : cb.equal(root.get("status"), status);
    }

    public static Specification<Order> createdAfter(LocalDate from) {
        return (root, q, cb) -> from == null ? null
                : cb.greaterThanOrEqualTo(root.get("createdAt"), from.atStartOfDay());
    }

    public static Specification<Order> customerContains(String term) {
        return (root, q, cb) -> (term == null || term.isBlank()) ? null
                : cb.like(cb.lower(root.get("customer")),
                          "%" + term.toLowerCase() + "%");
    }
}`,
                `@GetMapping
public Page<OrderDto> search(
        @RequestParam(required = false) String status,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) String q,
        @PageableDefault(size = 20, sort = "id") Pageable pageable) {

    Specification<Order> spec = Specification
            .where(OrderSpecs.hasStatus(status))
            .and(OrderSpecs.createdAfter(from))
            .and(OrderSpecs.customerContains(q));

    return repository.findAll(spec, pageable).map(OrderDto::from);
}

// REQUEST: GET /api/orders?status=SHIPPED&from=2024-01-01&q=ajay&page=0&size=20
// SQL:
//   select o.* from orders o
//    where o.status = ?
//      and o.created_at >= ?
//      and lower(o.customer) like ?
//    order by o.id asc limit 20 offset 0
//
// REQUEST: GET /api/orders          (no filters at all)
// SQL:
//   select o.* from orders o order by o.id asc limit 20 offset 0
//   - every specification returned null, so no predicate was added.

// The LIKE '%term%' cannot use a B-tree index and degrades to a scan.
// It is acceptable for a small admin screen; for real search, use a
// full-text index or a search engine rather than a leading-wildcard LIKE.`
            ]
        },
        {
            content: `<h3>DTO versus Entity</h3>
The entity is the shape of your database. The DTO is the shape of your API. Returning the entity welds them together, and the consequences show up quickly.<br><br>

<table>
<tr><th>Problem</th><th>What happens</th></tr>
<tr><td>Data leaks</td><td>Add a <code>passwordHash</code>, <code>internalNotes</code> or <code>costPrice</code> column and Jackson publishes it. Nobody changed the API; the API changed anyway.</td></tr>
<tr><td>Accidental breaking change</td><td>Renaming a column renames a JSON field and breaks every client.</td></tr>
<tr><td>Lazy loading</td><td>Serialising a detached entity with a <code>LAZY</code> association throws <code>LazyInitializationException</code>, or, if the session is still open, triggers a cascade of extra queries.</td></tr>
<tr><td>Cycles</td><td><code>Order</code> holds <code>Customer</code>, <code>Customer</code> holds <code>List&lt;Order&gt;</code>. Jackson recurses until the stack overflows.</td></tr>
<tr><td>Mass assignment</td><td>Binding <code>@RequestBody Order</code> lets a caller post <code>{"id":5,"role":"ADMIN"}</code> and set fields you never intended to expose for writing.</td></tr>
</table>
<br>
A Java <code>record</code> makes the DTO a three-line class, so the usual objection - boilerplate - has mostly gone. Use a separate request DTO from the response DTO where they genuinely differ: the request has no <code>id</code> and no <code>createdAt</code>, and the response has no password.`,
            codeExamples: [
                `// Response DTO - exactly the fields the API promises
public record OrderDto(Long id, String customer, BigDecimal total,
                       String status, Instant createdAt) {

    public static OrderDto from(Order o) {
        return new OrderDto(o.getId(), o.getCustomer().getName(),
                            o.getTotal(), o.getStatus(), o.getCreatedAt());
    }
}

// Request DTO - no id, no createdAt, no status. The server owns those.
public record CreateOrderRequest(
        @NotNull Long customerId,
        @NotEmpty List<@Valid OrderLineRequest> lines) { }

// What returning the entity does:
// GET /api/orders/1  with @Entity Order returned directly
// {
//   "id": 1,
//   "customer": { "id": 7, "name": "ajay",
//                 "passwordHash": "$2a$10$N9qo8uLO...",   <-- leaked
//                 "orders": [ { "id": 1, "customer": { ... }   <-- cycle
// }
// com.fasterxml.jackson.databind.JsonMappingException:
//   Infinite recursion (StackOverflowError)`
            ]
        },
        {
            content: `<h3>ResponseEntity, @RequestHeader and @CookieValue</h3>
Returning a plain object gives you 200 and the default headers. <code>ResponseEntity&lt;T&gt;</code> is the escape hatch: it lets the handler set the status code, the headers and the body explicitly.<br><br>

Use it where the status varies (200 or 404), where a header is part of the contract (<code>Location</code> on a create, <code>ETag</code> on a read), or where the body may legitimately be empty. Where the status is always the same, a plain return type plus <code>@ResponseStatus</code> reads better - <code>ResponseEntity</code> on every method is noise.<br><br>

<code>@RequestHeader</code> binds one header, <code>@CookieValue</code> binds one cookie. Both take <code>required</code> and <code>defaultValue</code>; a missing header with <code>required=true</code> - the default - produces 400, not 500.`,
            codeExamples: [
                `@GetMapping("/{id}")
public ResponseEntity<OrderDto> findById(@PathVariable Long id) {
    return repository.findById(id)
            .map(OrderDto::from)
            .map(ResponseEntity::ok)                       // 200 + body
            .orElseGet(() -> ResponseEntity.notFound().build());   // 404, no body
}

@PostMapping
public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest req,
                                       UriComponentsBuilder uri) {
    OrderDto saved = service.create(req);
    URI location = uri.path("/api/orders/{id}").buildAndExpand(saved.id()).toUri();
    return ResponseEntity.created(location)                 // 201 + Location header
                         .header("X-Request-Id", MDC.get("requestId"))
                         .body(saved);
}
// OUTPUT:
// HTTP/1.1 201 Created
// Location: http://localhost:8080/api/orders/4712
// X-Request-Id: 6f1c9a0d-3b77-4e2c-a1f8-b0c4d9e7a2b3
// {"id":4712,"customer":"ajay","total":249.00,"status":"NEW", ...}`,
                `@GetMapping("/api/orders")
public Page<OrderDto> list(
        @RequestHeader(value = "Accept-Language", defaultValue = "en") String lang,
        @RequestHeader(value = "X-Tenant-Id") String tenantId,      // required
        @RequestHeader(value = "Authorization", required = false) String auth,
        @CookieValue(value = "sessionTheme", defaultValue = "light") String theme,
        Pageable pageable) { ... }

// Missing a REQUIRED header:
// GET /api/orders   (no X-Tenant-Id)
// 400 Bad Request
// org.springframework.web.bind.MissingRequestHeaderException:
//   Required request header 'X-Tenant-Id' for method parameter type String
//   is not present
// - a 400, which is correct: the caller made the mistake.

// All headers at once, when you are inspecting rather than binding:
public void debug(@RequestHeader Map<String, String> headers) { ... }
// Header names are case-insensitive in HTTP; use HttpHeaders for
// case-insensitive lookup rather than a plain HashMap.`
            ]
        },
        {
            content: `<h3>A Consistent Response Envelope</h3>
Many teams wrap every response in a fixed structure so that clients always parse the same shape.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  RAW                             ENVELOPED
  {                               {
    "id": 4711,                     "success": true,
    "customer": "ajay"              "data": { "id": 4711, ... },
  }                                 "message": "OK",
                                    "timestamp": "2024-05-14T09:12:04Z",
                                    "errors": []
                                  }
</pre>

<table>
<tr><th>Position</th><th>The argument</th></tr>
<tr><td>For</td><td>One parse path in the client. Metadata - paging, request id, warnings - has a home. Error bodies and success bodies look alike, so generated client code is uniform.</td></tr>
<tr><td>Against</td><td>HTTP already carries status, and <code>"success": true</code> alongside a 200 duplicates it - worse, teams then return 200 with <code>"success": false</code>, which hides failures from every proxy, monitor and retry policy in the path. It also breaks caching and content negotiation, adds a nesting level to every client, and is not what RFC 9457 <code>application/problem+json</code> standardised for errors.</td></tr>
</table>
<br>
A defensible middle position: <strong>do not wrap successful responses</strong> - return the resource, and let the status code and headers carry the metadata. <strong>Do standardise error responses</strong>, using <code>ProblemDetail</code>, which Spring Framework 6 provides out of the box. If your organisation mandates an envelope, apply it once in a <code>ResponseBodyAdvice</code> rather than by hand in every controller.`,
            codeExamples: [
                `// If you must have an envelope, define it once
public record ApiResponse<T>(boolean success, T data, String message,
                             Instant timestamp, List<String> errors) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, "OK", Instant.now(), List.of());
    }
    public static <T> ApiResponse<T> error(String message, List<String> errors) {
        return new ApiResponse<>(false, null, message, Instant.now(), errors);
    }
}

// AND STILL SET THE STATUS CODE. This is the mistake to avoid:
//   return ResponseEntity.ok(ApiResponse.error("not found", ...));   // WRONG
//   -> HTTP 200 with a body saying it failed. Monitoring sees a healthy
//      endpoint, the client's error handling never fires, and a retry
//      policy will not retry. Return 404 and the error body together.`,
                `// The standard alternative: RFC 9457 problem detail (Spring 6 / Boot 3)
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(OrderNotFoundException.class)
    public ProblemDetail notFound(OrderNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Order not found");
        pd.setType(URI.create("https://api.example.com/errors/order-not-found"));
        pd.setProperty("orderId", ex.getOrderId());
        return pd;
    }
}
// RESPONSE:
// HTTP/1.1 404 Not Found
// Content-Type: application/problem+json
// {
//   "type": "https://api.example.com/errors/order-not-found",
//   "title": "Order not found",
//   "status": 404,
//   "detail": "No order with id 999",
//   "instance": "/api/orders/999",
//   "orderId": 999
// }`
            ]
        },
        {
            content: `<h3>Naming Standards</h3>
Naming is the part of an API a client sees before anything else, and the part you cannot change afterwards without breaking them.<br><br>

<table>
<tr><th>Rule</th><th>Reason</th></tr>
<tr><td>Plural nouns for collections - <code>/orders</code>, not <code>/order</code></td><td><code>/orders</code> is the collection; <code>/orders/4711</code> is one member of it. Reads naturally at both levels.</td></tr>
<tr><td>No verbs in the path</td><td>The HTTP method is the verb. <code>POST /orders</code>, not <code>POST /createOrder</code>.</td></tr>
<tr><td>Lower case, hyphens between words</td><td><code>/purchase-orders</code>. Paths are case-sensitive; mixed case invites bug reports. Underscores are hard to see under a link underline.</td></tr>
<tr><td>camelCase in the JSON body</td><td>Matches Java field names and what JavaScript clients expect. Pick one convention and enforce it globally rather than per class.</td></tr>
<tr><td>Nest only to show ownership</td><td><code>/customers/7/orders</code> is right when an order belongs to a customer. Stop at two levels - <code>/a/1/b/2/c/3</code> is unreadable and forces the client to know your whole schema.</td></tr>
<tr><td>Filters in the query string</td><td><code>/orders?status=SHIPPED</code>, not <code>/orders/shipped</code>. Filters combine; paths do not.</td></tr>
<tr><td>No file extensions</td><td><code>/orders/4711</code>, not <code>/orders/4711.json</code>. Format is negotiated with the <code>Accept</code> header.</td></tr>
<tr><td>No trailing slash</td><td>Pick one form. Spring Boot 3 no longer matches both by default, so <code>/orders/</code> now returns 404 where Boot 2 accepted it.</td></tr>
</table>`,
            codeExamples: [
                `# Poor                                Better
POST   /api/createNewOrder            POST   /api/orders
GET    /api/getOrderById?id=4711      GET    /api/orders/4711
POST   /api/updateOrder               PUT    /api/orders/4711
GET    /api/deleteOrder?id=4711       DELETE /api/orders/4711
GET    /api/orderList                 GET    /api/orders
GET    /api/orders/shipped            GET    /api/orders?status=SHIPPED
GET    /api/Orders/4711.json          GET    /api/orders/4711
GET    /api/customer/7/order/list     GET    /api/customers/7/orders

# Actions that are genuinely not CRUD do exist. Model them as a
# sub-resource rather than pretending:
POST   /api/orders/4711/cancellation
POST   /api/orders/4711/refunds
# ...which stays a noun, and gives the action its own history and id.`,
                `// Enforce the JSON naming convention globally, not per field
// application.properties
spring.jackson.property-naming-strategy=LOWER_CAMEL_CASE

// If the client contract requires snake_case, change it here once:
// spring.jackson.property-naming-strategy=SNAKE_CASE
// {"created_at":"2024-05-14T09:12:04Z","total_amount":249.00}
//
// Doing this per class with @JsonProperty on 200 fields is how APIs end up
// half camelCase and half snake_case.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Four Versioning Strategies</h3>
Versioning exists because you cannot change a published contract and you cannot stop changing your product. Every strategy is a way of running the old contract and the new one at the same time.<br><br>

<table>
<tr><th>Strategy</th><th>Form</th><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td><strong>URI path</strong></td><td><code>/api/v1/orders</code></td><td>Visible in every log, browser bar, curl command and bug report. Trivially routable at the gateway - v1 and v2 can be different deployments. Easy to cache and to document. Works with any client.</td><td>Violates the idea that a URI names a resource: <code>/v1/orders/1</code> and <code>/v2/orders/1</code> are the same order under two names. Version leaks into every hyperlink. Bumping the version rewrites every path.</td></tr>
<tr><td><strong>Query parameter</strong></td><td><code>/api/orders?version=1</code></td><td>Keeps one URI per resource. Easy to default - no parameter means the oldest supported version.</td><td>Easy to drop by accident. Muddles filtering parameters with routing metadata. Some caches ignore query strings when building the cache key. Gateway routing on a query param is awkward.</td></tr>
<tr><td><strong>Custom header</strong></td><td><code>X-API-Version: 1</code></td><td>URI stays clean and stable. Version is metadata, and metadata belongs in headers.</td><td>Invisible in a browser - you cannot paste a URL to a colleague and have them see v2. Harder to test by hand. Caches must be told to vary on it. Non-standard header names proliferate.</td></tr>
<tr><td><strong>Accept header</strong></td><td><code>Accept: application/vnd.company.order.v2+json</code></td><td>The most correct by the letter of HTTP - this is exactly what content negotiation is for. One URI, many representations, and per-resource versioning rather than a whole-API bump.</td><td>Verbose and easy to get wrong. Poor tooling support. Impossible to explore in a browser. Most client libraries make it awkward. Confuses newcomers badly.</td></tr>
</table>
<br>
<strong>URI path versioning is the least elegant and by far the most widely used</strong> - Stripe, GitHub, Twilio and almost every internal API you will meet. The reason is not ignorance of the alternatives. It is that a version you can see beats a version that is theoretically pure: it appears in access logs, so you can prove which clients are still on v1 before you switch it off; it routes at the load balancer with a path prefix rule and no application awareness at all; and any engineer can reproduce a bug with a curl command copied out of a ticket. The purity argument loses to the operational one, and it should.<br><br>

Whichever you pick: <strong>version the whole API, not individual endpoints</strong>, unless you have the discipline for per-resource media types; support at most two versions at once; and publish a deprecation date with the <code>Deprecation</code> and <code>Sunset</code> response headers rather than announcing it in a changelog nobody reads.`,
            codeExamples: [
                `// 1. URI path - separate controllers, so v1 stays frozen while v2 evolves
@RestController @RequestMapping("/api/v1/orders")
class OrderControllerV1 { ... }

@RestController @RequestMapping("/api/v2/orders")
class OrderControllerV2 { ... }

// 2. Query parameter - one method, distinguished by "params"
@GetMapping(value = "/api/orders/{id}", params = "version=1")
public OrderV1Dto v1(@PathVariable Long id) { ... }

@GetMapping(value = "/api/orders/{id}", params = "version=2")
public OrderV2Dto v2(@PathVariable Long id) { ... }

// 3. Custom header
@GetMapping(value = "/api/orders/{id}", headers = "X-API-Version=1")
public OrderV1Dto headerV1(@PathVariable Long id) { ... }

// 4. Accept header content negotiation
@GetMapping(value = "/api/orders/{id}",
            produces = "application/vnd.example.order.v1+json")
public OrderV1Dto acceptV1(@PathVariable Long id) { ... }

@GetMapping(value = "/api/orders/{id}",
            produces = "application/vnd.example.order.v2+json")
public OrderV2Dto acceptV2(@PathVariable Long id) { ... }

// Ambiguity warning: two methods on the same path with no distinguishing
// params/headers/produces gives, at startup:
//   java.lang.IllegalStateException: Ambiguous mapping. Cannot map
//   'orderControllerV2' method ... to {GET /api/orders/{id}}: There is
//   already 'orderControllerV1' bean method mapped.`,
                `// Announcing a retirement in the response, per RFC 8594 / RFC 9745
@GetMapping("/api/v1/orders")
public ResponseEntity<List<OrderV1Dto>> listV1() {
    return ResponseEntity.ok()
        .header("Deprecation", "true")
        .header("Sunset", "Wed, 31 Dec 2025 23:59:59 GMT")
        .header("Link", "</api/v2/orders>; rel=\\"successor-version\\"")
        .body(service.listV1());
}
// Then read the access logs to find who is still calling v1 before the
// sunset date. This is the practical argument for URI versioning:
//   grep '/api/v1/' access.log | awk '{print $1}' | sort | uniq -c
//   4211 10.2.4.17     <-- the mobile app, still on v1. Ring them.`
            ]
        },
        {
            content: `<h3>What Actually Counts as a Breaking Change</h3>
You need a version only for a breaking change, so the definition decides how often you version. The test is: <strong>would an existing client, written against the old contract and not recompiled, still work?</strong> Judge it from the client's position, not from the diff.<br><br>

<table>
<tr><th>Change</th><th>Breaking?</th></tr>
<tr><td>Adding a new optional field to a response</td><td>No - a tolerant reader ignores unknown fields. This is the single most important reason to configure clients with <code>FAIL_ON_UNKNOWN_PROPERTIES=false</code>.</td></tr>
<tr><td>Adding a new optional request parameter or body field</td><td>No, provided the old behaviour is preserved when it is absent.</td></tr>
<tr><td>Adding a new endpoint</td><td>No.</td></tr>
<tr><td>Adding a value to an enum</td><td>Yes, in practice. Clients that <code>switch</code> on the enum, or deserialise into a Java enum, fail on the unknown value. Treat enums in a response as strings on the client side.</td></tr>
<tr><td>Removing or renaming a field</td><td>Yes.</td></tr>
<tr><td>Changing a field's type - <code>"total": 249</code> to <code>"total": "249.00"</code></td><td>Yes. Number to string breaks strict parsers, and so does the reverse.</td></tr>
<tr><td>Making an optional request field required</td><td>Yes.</td></tr>
<tr><td>Making a response field nullable when it never was</td><td>Yes - the client's non-null assumption is part of the contract it was written against.</td></tr>
<tr><td>Adding a validation rule to an existing field</td><td>Yes. Payloads that used to be accepted are now rejected with 400.</td></tr>
<tr><td>Changing the status code for an existing outcome</td><td>Yes - 200 to 204 breaks any client that parses the body.</td></tr>
<tr><td>Changing default sort order or default page size</td><td>Yes in effect, even though no field changed. Behaviour the client depended on has moved under it.</td></tr>
<tr><td>Tightening a rate limit, or changing pagination defaults</td><td>Not a schema change; still breaks clients. Announce it like one.</td></tr>
</table>
<br>
The practical consequence is that most changes are additive, and a well-designed API versions rarely. Reaching v4 in eighteen months is not evidence of rapid iteration - it is evidence the first design was guessed at.`,
            codeExamples: [
                `// Client side - the setting that makes additive changes safe.
// Spring Boot sets this by default; verify it, because a hand-built
// ObjectMapper does NOT.
ObjectMapper mapper = new ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

// Without it, the server adding one field breaks every client:
// com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException:
//   Unrecognized field "discountCode" (class OrderDto), not marked as ignorable

// Server side - stop new nulls from leaking into responses as new "fields"
// application.properties
spring.jackson.default-property-inclusion=non_null`,
                `// Enum handling - the trap in the table above
public enum OrderStatus { NEW, PAID, SHIPPED }
// The server adds DELIVERED. An old client deserialising into this enum:
// InvalidFormatException: Cannot deserialize value of type OrderStatus
//   from String "DELIVERED": not one of the values accepted for Enum class

// Defensive client configuration:
mapper.configure(DeserializationFeature.READ_UNKNOWN_ENUM_VALUES_AS_NULL, true);
// or, better, model an unknown fallback explicitly:
public enum OrderStatus {
    NEW, PAID, SHIPPED,
    @JsonEnumDefaultValue UNKNOWN
}
// Requires READ_UNKNOWN_ENUM_VALUES_USING_DEFAULT_VALUE.`
            ]
        },
        {
            content: `<h3>Offset Pagination Is Not Correct on a Changing Dataset</h3>
This is the bug that survives code review because it is invisible in a test with static data.<br><br>

<code>LIMIT 20 OFFSET 20</code> means "sort the whole result, discard the first twenty rows, return the next twenty". Between the request for page 0 and the request for page 1, other users insert and delete rows. The result set is re-sorted from scratch for the second query, so <strong>rows shift across the page boundary</strong>.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
 t0: newest-first list        client requests page 0 (LIMIT 3 OFFSET 0)
     [ E D C B A ]            gets  E D C

 t1: a new row F is inserted
     [ F E D C B A ]

 t2: client requests page 1 (LIMIT 3 OFFSET 3)
     offset 3 now lands on C, not B
     gets  C B A
                              ^ C is delivered TWICE.
                                Nothing tells the client.

 The mirror image: delete a row between the two requests and
 the row that shifts up across the boundary is NEVER delivered.
 A nightly export job silently misses records.
</pre>

The dropped row is worse than the duplicate, because a duplicate is visible in the UI and a missing row is not. Any job that walks an entire table page by page while writes continue - an export, a reindex, a migration - will silently lose records.<br><br>

<strong>Cursor (keyset) pagination</strong> fixes it. Instead of "skip N rows", say "give me the rows after this exact position". The position is the sort key of the last row of the previous page, and it does not move when rows are inserted elsewhere.<br><br>

The cursor must be <strong>unique and stable</strong>. Sorting by <code>created_at</code> alone is not enough - two rows can share a timestamp, and a row at the boundary is duplicated or skipped again. Use a compound key of the sort column plus the primary key, and compare it as a tuple.`,
            codeExamples: [
                `-- OFFSET pagination: correct only if nothing is writing
SELECT id, customer, created_at
  FROM orders
 ORDER BY created_at DESC, id DESC
 LIMIT 20 OFFSET 20;
-- The database must produce, sort and then THROW AWAY 20 rows.

-- KEYSET pagination: "after this row", not "skip this many rows"
-- Page 1 (no cursor):
SELECT id, customer, created_at
  FROM orders
 ORDER BY created_at DESC, id DESC
 LIMIT 20;

-- Page 2: pass the LAST row of page 1 back as the cursor
--   last_created_at = '2024-05-14 09:12:04', last_id = 4692
SELECT id, customer, created_at
  FROM orders
 WHERE (created_at, id) < ('2024-05-14 09:12:04', 4692)   -- row-value comparison
 ORDER BY created_at DESC, id DESC
 LIMIT 20;

-- Portable form for databases without row-value comparison:
 WHERE (created_at < '2024-05-14 09:12:04')
    OR (created_at = '2024-05-14 09:12:04' AND id < 4692)

-- With an index on (created_at DESC, id DESC) the database SEEKS
-- straight to the cursor position. Page 50,000 costs the same as page 1.`,
                `// Spring Data - keyset pagination by hand
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
           select o from Order o
            where (o.createdAt < :cursorTime)
               or (o.createdAt = :cursorTime and o.id < :cursorId)
            order by o.createdAt desc, o.id desc
           """)
    List<Order> findAfter(@Param("cursorTime") Instant cursorTime,
                          @Param("cursorId") Long cursorId,
                          Pageable limit);   // PageRequest.ofSize(20)
}

// Encode the cursor as an opaque token so clients cannot construct
// or reason about it - that keeps you free to change the sort key later.
String cursor = Base64.getUrlEncoder().withoutPadding().encodeToString(
        (last.getCreatedAt().toEpochMilli() + ":" + last.getId())
                .getBytes(StandardCharsets.UTF_8));

// RESPONSE:
// {
//   "items": [ ... 20 orders ... ],
//   "nextCursor": "MTcxNTY3MzkyNDAwMDo0Njky",
//   "hasMore": true
// }
// GET /api/orders?cursor=MTcxNTY3MzkyNDAwMDo0Njky&size=20

// Spring Data 3.1+ ships this natively:
//   Window<Order> w = repository.findBy(spec,
//           q -> q.limit(20).sortBy(sort).scroll(ScrollPosition.keyset()));
//   ScrollPosition next = w.positionAt(w.size() - 1);`,
                `// Trade-offs, stated plainly:
//
// OFFSET                              KEYSET / CURSOR
// - jump to any page number           - next/previous only, no "page 47"
// - shows a total page count          - usually no total (a COUNT is expensive)
// - duplicates and skips rows         - stable across concurrent writes
// - O(offset) - degrades with depth   - O(log n) seek - constant cost
// - trivial to implement              - needs a matching composite index
//
// Choose OFFSET for an admin screen over a small, quiet table where
// users click page numbers. Choose KEYSET for infinite scroll, for
// public APIs, for anything walking a large table, and for every
// export or reindex job.`
            ]
        },
        {
            content: `<h3>Why Deep Offset Pagination Gets Slower the Further You Go</h3>
<code>OFFSET 1000000</code> does not mean "start at row one million". SQL has no such operation. The database evaluates the query, produces rows in sort order, counts off a million of them, discards them, and then returns twenty. The work is proportional to the offset, so <strong>page one million costs fifty thousand times what page one costs</strong>, for exactly the same twenty rows.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
  latency
    ^
    |                                                    ,-'  OFFSET
    |                                            ,--''
    |                                    ,--''
    |                            ,--''
    |                    ,--''
    |            ,--''
    |    ,--''
    |__--_______________________________________________  KEYSET
    +----------------------------------------------------> page number
     1      100     1k      10k     100k    1M
</pre>

There is a second cost people miss: if the sort column is not indexed, or the index cannot supply the required order, the database sorts the entire table for every single page request. Twenty pages means twenty full sorts of two million rows.<br><br>

It is also a denial-of-service vector on a public API. <code>GET /api/orders?page=999999&size=100</code> is one cheap HTTP request that costs the database a great deal, and an attacker can send thousands of them in parallel. Cap the reachable depth, or use cursors and remove the ability to express deep offsets at all.`,
            codeExamples: [
                `-- Measure it. MySQL, 2 million rows, index on (created_at, id):
EXPLAIN ANALYZE SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 0;
-- actual time=0.041..0.132 rows=20 loops=1        (0.1 ms)

EXPLAIN ANALYZE SELECT * FROM orders ORDER BY created_at DESC LIMIT 20 OFFSET 1000000;
-- actual time=1893.4..1893.7 rows=20 loops=1      (1.9 SECONDS)
-- The index was scanned for 1,000,020 entries and 1,000,000 rows
-- were fetched and thrown away.

-- The deferred-join trick: keep OFFSET, but pay it on the narrow index only
SELECT o.* FROM orders o
  JOIN (SELECT id FROM orders
         ORDER BY created_at DESC, id DESC
         LIMIT 20 OFFSET 1000000) AS page ON page.id = o.id
 ORDER BY o.created_at DESC, o.id DESC;
-- actual time=284.1..284.4 rows=20    (0.28 s - 6x better, still linear)
-- It avoids fetching a million WIDE rows, but still walks a million
-- index entries. It is a mitigation, not a fix. Keyset is the fix.`,
                `// Cap page size AND page depth. Both are unbounded by default.
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        PageableHandlerMethodArgumentResolver r =
                new PageableHandlerMethodArgumentResolver();
        r.setFallbackPageable(PageRequest.of(0, 20));
        r.setMaxPageSize(100);        // ?size=1000000 is silently clamped to 100
        r.setOneIndexedParameters(false);
        resolvers.add(r);
    }
}

// Or declaratively, Boot 2.4+ / 3.x:
// spring.data.web.pageable.default-page-size=20
// spring.data.web.pageable.max-page-size=100
// spring.data.web.pageable.one-indexed-parameters=false

// Depth is a separate check - max-page-size does not limit page NUMBER:
if (pageable.getOffset() > 50_000) {
    throw new BadRequestException(
        "Result window is too large. Use the cursor parameter to page deeper.");
}
// Elasticsearch enforces exactly this with index.max_result_window (10,000
// by default) and directs you to search_after - the same conclusion,
// reached by the same reasoning.`,
                `// The unbounded page size, which is the same incident as no pagination
// GET /api/orders?page=0&size=2000000
//
// Without max-page-size the request is honoured:
//   select o.* from orders o limit 2000000 offset 0
//   java.lang.OutOfMemoryError: Java heap space
//
// With max-page-size=100 it is clamped, and the response says so:
// {"content":[ ...100 items... ],"size":100,"totalElements":2000000}
//
// Clamping silently is the pragmatic choice; returning 400 is the
// stricter one. Whichever you pick, document it - a client that asked
// for 5000 and got 100 will otherwise assume it has read everything.`
            ]
        },
        {
            content: `<h3>PATCH, and the Difference Between JSON Merge Patch and JSON Patch</h3>
PUT replaces a resource in full: whatever you send is what the resource becomes, and any field you leave out is set to null or reset to its default. That is why "PUT with only the fields I want to change" is a bug - it silently wipes the rest.<br><br>

PATCH applies a partial modification, and the awkward truth is that the PATCH method does not define <em>how</em>. The body is a patch document whose format is given by its content type, and there are two standard ones.<br><br>

<table>
<tr><th>Format</th><th>Detail</th></tr>
<tr><td><strong>JSON Merge Patch</strong> (RFC 7386), <code>application/merge-patch+json</code></td><td>The body looks like the resource, with only the changed fields present. <code>null</code> means "delete this field". Simple and readable - and unable to express "set this field to null", or to modify one element of an array without resending the whole array.</td></tr>
<tr><td><strong>JSON Patch</strong> (RFC 6902), <code>application/json-patch+json</code></td><td>An ordered array of operations - <code>add</code>, <code>remove</code>, <code>replace</code>, <code>move</code>, <code>copy</code>, <code>test</code> - each addressing a location with a JSON Pointer. Verbose, but expresses null explicitly, edits array elements precisely, and <code>test</code> gives optimistic concurrency inside the patch itself.</td></tr>
</table>
<br>
Most APIs use merge patch, often without naming it and with <code>Content-Type: application/json</code>. That is acceptable if you document it. What is not acceptable is the common Spring implementation that binds the body to a DTO and copies every non-null field onto the entity: it cannot distinguish "field absent" from "field explicitly null", so a caller can never clear an optional value. Bind to a <code>JsonNode</code> or <code>Map</code>, or use <code>Optional</code>-typed DTO fields, or use <code>ObjectMapper.readerForUpdating</code>, which handles absence correctly by construction.<br><br>

<strong>PATCH is not idempotent in general.</strong> A merge patch happens to be, since applying the same field values twice gives the same result; a JSON Patch containing <code>{"op":"add","path":"/lines/-"}</code> appends a line every time it is applied. Pair PATCH with <code>If-Match</code> and an ETag when concurrent edits are possible.`,
            codeExamples: [
                `// The resource
// { "id": 4711, "customer": "ajay", "status": "NEW",
//   "note": "gift wrap", "total": 249.00 }

// --- PUT: full replacement. Note what is MISSING from the body. ---
// PUT /api/orders/4711
// { "status": "PAID" }
// Result: customer, note and total are now null. This is CORRECT PUT
// behaviour and almost never what the caller intended.

// --- JSON Merge Patch ---
// PATCH /api/orders/4711
// Content-Type: application/merge-patch+json
// { "status": "PAID", "note": null }
// Result: status becomes PAID, note is REMOVED, everything else untouched.
// There is no way to express "set note to the JSON value null and keep it".

// --- JSON Patch ---
// PATCH /api/orders/4711
// Content-Type: application/json-patch+json
// [
//   { "op": "test",    "path": "/status", "value": "NEW"  },
//   { "op": "replace", "path": "/status", "value": "PAID" },
//   { "op": "remove",  "path": "/note" },
//   { "op": "add",     "path": "/lines/-", "value": {"sku":"A1","qty":2} }
// ]
// The "test" op fails the WHOLE patch with 409 Conflict if status has
// changed since the client read it - optimistic locking in the document.`,
                `// Merge patch done correctly in Spring - readerForUpdating knows the
// difference between an absent field and an explicit null.
@PatchMapping(value = "/api/orders/{id}",
              consumes = "application/merge-patch+json")
public OrderDto patch(@PathVariable Long id, @RequestBody JsonNode patch)
        throws IOException {

    Order order = repository.findById(id)
            .orElseThrow(() -> new OrderNotFoundException(id));

    // Guard the fields the client must not touch, BEFORE applying.
    for (String forbidden : List.of("id", "createdAt", "total")) {
        if (patch.has(forbidden)) {
            throw new BadRequestException("Field is not patchable: " + forbidden);
        }
    }

    objectMapper.readerForUpdating(order).readValue(patch);
    return OrderDto.from(repository.save(order));      // validate before saving
}

// The BROKEN version you will see everywhere:
//   if (dto.getStatus() != null) order.setStatus(dto.getStatus());
//   if (dto.getNote()   != null) order.setNote(dto.getNote());
// Absent and null are the same value here, so {"note": null} is ignored
// and the caller can never clear the note. The bug is reported as
// "clearing a field does nothing" and takes a day to find.`,
                `// JSON Patch with the json-patch library
// <dependency>
//   <groupId>com.github.java-json-tools</groupId>
//   <artifactId>json-patch</artifactId>
// </dependency>

@PatchMapping(value = "/api/orders/{id}", consumes = "application/json-patch+json")
public ResponseEntity<OrderDto> jsonPatch(@PathVariable Long id,
                                          @RequestBody JsonPatch patch,
                                          @RequestHeader(value = "If-Match",
                                                         required = false) String etag)
        throws JsonPatchException, JsonProcessingException {

    Order order = repository.findById(id)
            .orElseThrow(() -> new OrderNotFoundException(id));

    if (etag != null && !etag.equals("\\"" + order.getVersion() + "\\"")) {
        return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build();  // 412
    }

    JsonNode patched = patch.apply(objectMapper.convertValue(order, JsonNode.class));
    Order updated = objectMapper.treeToValue(patched, Order.class);

    return ResponseEntity.ok(OrderDto.from(repository.save(updated)));
}
// OUTPUT when a "test" op fails:
// 409 Conflict
// {"title":"Patch precondition failed",
//  "detail":"Value at /status is \\"PAID\\", expected \\"NEW\\""}`
            ]
        },
        {
            content: `<h3>HATEOAS, Honestly</h3>
HATEOAS - Hypermedia As The Engine Of Application State - is the fourth and strictest part of REST's uniform-interface constraint. A response carries not only data but the links describing what can be done next, so the client navigates the API by following links from a single entry point rather than by constructing URLs from documentation. In Fielding's original formulation, an API without it is not REST at all; it is HTTP with JSON. Spring HATEOAS builds the representations, and <code>spring-boot-starter-hateoas</code> renders HAL.<br><br>

<strong>Almost nobody uses it, and the reasons are worth understanding rather than dismissing.</strong><br><br>

<div class="border">
<strong>The promised benefit does not materialise.</strong> The point of links is that the server can move a URL and clients follow along. In practice the client is written by a team that reads the documentation, hardcodes the paths, and ships a mobile binary you cannot update. The coupling the links were meant to remove is still there, in the client's source.<br>
<strong>No client actually navigates.</strong> Writing a generic hypermedia-driven client is genuinely hard, and no mainstream front-end framework does it. What clients do is read <code>_embedded.orders[0].id</code> and build the next URL themselves.<br>
<strong>It inflates every payload.</strong> A twenty-field order can carry more link metadata than data. Over mobile networks, and multiplied across a page of results, that is real cost for no delivered benefit.<br>
<strong>It complicates the server.</strong> Every response needs assembler code, and the links must reflect authorisation - showing a <code>cancel</code> link to a user who may not cancel is worse than showing none.<br>
<strong>OpenAPI won the discoverability argument.</strong> Teams wanted a machine-readable contract they could generate clients and documentation from. That is what a Swagger/OpenAPI spec gives them, at design time, where it is more useful than at run time.
</div><br>

Where it does earn its place: long-lived public APIs with many independent clients and workflow-driven resources where the available actions genuinely depend on state - a payment that may be captured only while authorised, an order that may be cancelled only before dispatch. Encoding those transitions as links stops every client reimplementing the state machine. Be able to explain it in an interview, expect to be asked why your API does not use it, and give the answer above.`,
            codeExamples: [
                `// Spring HATEOAS - what a HAL response looks like
@GetMapping("/api/orders/{id}")
public EntityModel<OrderDto> findById(@PathVariable Long id) {
    OrderDto dto = service.findById(id);

    EntityModel<OrderDto> model = EntityModel.of(dto,
        linkTo(methodOn(OrderController.class).findById(id)).withSelfRel(),
        linkTo(methodOn(OrderController.class).list(null)).withRel("orders"));

    // Links reflect STATE - this is the part that carries real value
    if ("NEW".equals(dto.status())) {
        model.add(linkTo(methodOn(OrderController.class).cancel(id)).withRel("cancel"));
    }
    return model;
}
// RESPONSE, Content-Type: application/hal+json
// {
//   "id": 4711, "customer": "ajay", "status": "NEW", "total": 249.00,
//   "_links": {
//     "self":   { "href": "http://localhost:8080/api/orders/4711" },
//     "orders": { "href": "http://localhost:8080/api/orders" },
//     "cancel": { "href": "http://localhost:8080/api/orders/4711/cancellation" }
//   }
// }
// Four fields of data, three links. On a 100-item page that ratio is the
// objection in one line.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Why must a collection endpoint be paginated?</td><td>An unpaginated endpoint is an unbounded resource request. Ten rows in development becomes two million in production, and the full result is materialised as entities and again as a JSON string, producing an <code>OutOfMemoryError</code> that takes down the process for every user, not only the caller.</td></tr>
<tr><td>Page versus Slice?</td><td><code>Page</code> carries <code>totalElements</code> and <code>totalPages</code> and therefore issues a second <code>COUNT</code> query, which on a large table can cost more than the page itself. <code>Slice</code> reports only whether a next page exists and issues no count - the right choice for infinite scroll.</td></tr>
<tr><td>Why does a sort need a tie-breaker?</td><td>Without a unique final sort column, rows sharing the sort value have no defined order, and the database will not repeat the same order between queries. Rows then appear on two pages or on none. Append the primary key to make the ordering total.</td></tr>
<tr><td>What is the correctness bug in offset pagination?</td><td>Each page is a fresh query against the current data. Rows inserted or deleted before the offset shift the boundary, so a row can be returned on two consecutive pages or skipped entirely. The skip is the dangerous case - an export job silently loses records.</td></tr>
<tr><td>How does keyset/cursor pagination fix it?</td><td>It asks for rows after a specific position rather than skipping a count of rows. The cursor is the sort key of the last row seen - a compound of the sort column and the primary key - so inserts elsewhere in the table cannot move the boundary.</td></tr>
<tr><td>Why does deep offset pagination get slower?</td><td><code>OFFSET n</code> makes the database produce and discard <code>n</code> rows before returning any, so cost grows linearly with depth. Page one million costs fifty thousand times page one for the same twenty rows. Keyset seeks the index directly and costs the same at any depth.</td></tr>
<tr><td>When would you still choose offset pagination?</td><td>Admin screens over modest, quiet tables where users click page numbers and expect a total page count. Keyset gives no page numbers and usually no total.</td></tr>
<tr><td>Why enforce a maximum page size?</td><td><code>?size=2000000</code> reproduces the unpaginated failure through a supported parameter, and it is a cheap denial-of-service request. Set <code>spring.data.web.pageable.max-page-size</code>, and cap page depth separately, since max page size does not limit the page number.</td></tr>
<tr><td>Name the four versioning strategies and the one used most.</td><td>URI path, query parameter, custom header and Accept-header content negotiation. URI path versioning is the least elegant - the same resource has two URIs - and by far the most used, because it is visible in logs, routable at the gateway with a path prefix, and reproducible with a copied curl command.</td></tr>
<tr><td>Which changes are breaking?</td><td>Removing or renaming a field, changing a field's type, making an optional request field required, adding validation, changing a status code, adding an enum value, and changing default paging or sort behaviour. Adding an optional response field or a new endpoint is additive, provided clients ignore unknown properties.</td></tr>
<tr><td>Why not return the entity from the controller?</td><td>It couples the API contract to the database schema. New columns leak automatically, renames break clients, lazy associations throw <code>LazyInitializationException</code> or trigger extra queries, bidirectional relations recurse in Jackson, and binding an entity from the request body allows mass assignment.</td></tr>
<tr><td>When should a handler return <code>ResponseEntity</code>?</td><td>When the status varies with the outcome, when a header is part of the contract such as <code>Location</code> or <code>ETag</code>, or when the body may be absent. Where the status is fixed, a plain return type with <code>@ResponseStatus</code> is clearer.</td></tr>
<tr><td>Is a response envelope a good idea?</td><td>It gives clients one parse path and a home for metadata, but it duplicates the status line and tempts teams into returning 200 with <code>"success": false</code>, which hides failures from proxies, monitoring and retry policies. The defensible position is: do not wrap success responses; standardise errors with <code>ProblemDetail</code> (RFC 9457).</td></tr>
<tr><td>PUT versus PATCH, and merge patch versus JSON Patch?</td><td>PUT replaces the whole resource, so omitted fields are cleared. PATCH is a partial update whose format comes from the content type: JSON Merge Patch (RFC 7386) looks like the resource with <code>null</code> meaning delete, and JSON Patch (RFC 6902) is an ordered list of operations addressed by JSON Pointer, able to express null, edit array elements and test preconditions.</td></tr>
<tr><td>Why is HATEOAS rarely used?</td><td>Clients hardcode URLs from documentation rather than following links, so the decoupling never arrives; links inflate every payload; the server needs assembler code that must also respect authorisation; and OpenAPI answered the discoverability need at design time. It still earns its place for workflow resources where available actions depend on state.</td></tr>
</table>`
        }
    ]
};
