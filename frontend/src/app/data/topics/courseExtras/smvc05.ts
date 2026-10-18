// Spring extras, batch smvc05 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc05Extras: Record<string, Extra> = {
    'mvc-request-mapping': x(
        ['<b>Request mapping</b> is the rule that links an incoming HTTP request (method, URL path, and optionally headers, params and media types) to one controller method that handles it.',
            '<b>Annotations</b>: <code>@RequestMapping</code> is the general one; <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@DeleteMapping</code> and <code>@PatchMapping</code> are shortcuts for one HTTP method.',
            '<b>Where it works</b>: only on beans marked <code>@Controller</code> or <code>@RestController</code>; the mapping is read once at startup.'],
        ['<b>Matching</b> is done by <code>RequestMappingHandlerMapping</code>, which picks the most specific mapping when several could match.',
            '<b>No match</b> gives 404 for an unknown path, 405 when the path exists but the method is wrong, and 415 or 406 for media type problems.',
            '<b>Ambiguity</b>: two methods with the same condition make the application fail at startup with an <code>IllegalStateException</code> (Ambiguous mapping).'],
        ['<b>Registry</b>: all mappings live in a lookup built at startup, so matching is a fast lookup and not a reflection scan per request.',
            '<b>Design</b>: keep URLs noun-based and let the HTTP method express the action, for example <code>GET /orders/42</code>.',
            '<b>Testing</b>: use MockMvc with <code>@WebMvcTest</code> to prove that a URL and method reach the right handler.'],
        [['F', 'What is request mapping?', 'It is how Spring MVC connects an HTTP request, based on method and URL, to a controller method.'],
            ['F', 'Which annotation is the most general?', '@RequestMapping; it can set path, method, params, headers, consumes and produces.'],
            ['M', 'Which class resolves the mapping?', 'RequestMappingHandlerMapping, a HandlerMapping used by the DispatcherServlet.'],
            ['M', 'What status do you get for a wrong HTTP method?', '405 Method Not Allowed, with an Allow header listing the valid methods.'],
            ['S', 'What happens with two identical mappings?', 'Startup fails with an Ambiguous mapping error, so the problem is found early.'],
            ['S', 'How does Spring choose between two matching mappings?', 'It compares the conditions and chooses the most specific one; equal specificity is an error.']],
        [['Smallest mapped controller.',
            r`@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello";
    }
}

// OUTPUT:
// GET /hello  -> 200 Hello
// POST /hello -> 405 Method Not Allowed`],
            ['Test the mapping with MockMvc.',
                r`@WebMvcTest(HelloController.class)
class HelloControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void helloIsMapped() throws Exception {
        mvc.perform(get("/hello"))
           .andExpect(status().isOk())
           .andExpect(content().string("Hello"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['Two methods on different paths.',
            r`@RestController
public class PingController {
    @GetMapping("/ping") String ping() { return "pong"; }
    @GetMapping("/time") String time() { return "12:00"; }
}

// OUTPUT:
// GET /ping -> pong
// GET /time -> 12:00 (varies)`],
            ['Same path, different methods.',
                r`@RestController
public class NoteController {
    @GetMapping("/notes")  String list()   { return "[]"; }
    @PostMapping("/notes") String create() { return "created"; }
}

// OUTPUT:
// GET  /notes -> []
// POST /notes -> created`]]
    ),

    'mvc-requestmapping': x(
        ['<b>@RequestMapping</b> is the core Spring MVC annotation that maps requests to a class or a method; it can be placed at class level and at method level.',
            '<b>Attributes</b>: <code>value</code> or <code>path</code> (URL), <code>method</code>, <code>params</code>, <code>headers</code>, <code>consumes</code> and <code>produces</code>.',
            '<b>Shortcuts</b>: the composed annotations such as <code>@GetMapping</code> are just <code>@RequestMapping(method = GET)</code> with a shorter name.'],
        ['<b>Several paths</b> can share one method: <code>@RequestMapping({&quot;/a&quot;, &quot;/b&quot;})</code> is allowed.',
            '<b>Without method</b>, the mapping accepts every HTTP method, which is rarely what you want for an API.',
            '<b>Conditions combine</b> with AND: path, method and the other attributes must all match.'],
        ['<b>Meta-annotation</b>: <code>@GetMapping</code> is itself annotated with <code>@RequestMapping(method = RequestMethod.GET)</code>.',
            '<b>Class plus method</b> mappings are combined: the class path is a prefix and method conditions are merged.',
            '<b>Style</b>: prefer the shortcuts on methods and keep plain <code>@RequestMapping</code> for the class-level base path.'],
        [['F', 'What does @RequestMapping do?', 'It maps web requests to a controller class or method.'],
            ['F', 'Can it be used on a class?', 'Yes, usually to set a common base path for all methods.'],
            ['M', 'Which attributes can narrow a mapping?', 'method, params, headers, consumes and produces, besides the path.'],
            ['M', 'What if method is not set?', 'The handler matches all HTTP methods for that path.'],
            ['S', 'How is @GetMapping related to it?', 'It is a composed annotation meta-annotated with @RequestMapping(method = GET).'],
            ['S', 'How are class and method mappings merged?', 'Paths are concatenated and the other conditions are combined by the RequestMappingInfo combine logic.']],
        [['All attributes together.',
            r`@RestController
@RequestMapping("/api")
public class ReportController {

    @RequestMapping(
        path = "/reports",
        method = RequestMethod.GET,
        params = "year",
        produces = "application/json")
    public String reports(@RequestParam int year) {
        return "{\"year\":" + year + "}";
    }
}

// OUTPUT:
// GET /api/reports?year=2025 -> {"year":2025}
// GET /api/reports           -> 400 (parameter condition not met)`],
            ['Multiple paths and methods.',
                r`@RequestMapping(
    path = {"/items", "/products"},
    method = {RequestMethod.GET, RequestMethod.HEAD})
public String items() { return "items"; }

// OUTPUT:
// GET /items    -> items
// HEAD /products -> 200 (no body)
// POST /items   -> 405`]],
        [['Equivalent forms.',
            r`@RequestMapping(value = "/users", method = RequestMethod.GET)
public List<User> a() { return users; }

@GetMapping("/users2")   // same behaviour, shorter
public List<User> b() { return users; }

// OUTPUT:
// both handle GET only; POST gives 405`],
            ['Pitfall: no method set.',
                r`@RequestMapping("/danger")
public String danger() { return "ok"; }

// OUTPUT:
// GET, POST, PUT, DELETE /danger -> all 200 (probably not intended)`]]
    ),

    'mvc-getmapping': x(
        ['<b>@GetMapping</b> maps HTTP GET requests to a method; it is the shortcut for <code>@RequestMapping(method = RequestMethod.GET)</code>.',
            '<b>Use it for reads</b>: fetching a list or one item, searching and downloading. A GET must not change server data.',
            '<b>Input</b> comes from the path (<code>@PathVariable</code>) and the query string (<code>@RequestParam</code>), because GET has no body.'],
        ['<b>Safe and idempotent</b>: clients, caches and crawlers may repeat a GET, so never delete or save inside it.',
            '<b>HEAD and OPTIONS</b>: Spring answers HEAD for a GET mapping automatically, and OPTIONS lists the allowed methods.',
            '<b>Caching</b>: GET responses can carry <code>ETag</code> or <code>Cache-Control</code> headers.'],
        ['<b>Conditional GET</b>: <code>ShallowEtagHeaderFilter</code> or <code>ResponseEntity.eTag</code> allows 304 Not Modified.',
            '<b>Pagination</b>: accept <code>Pageable</code> or page and size params instead of returning everything.',
            '<b>Testing</b>: <code>mvc.perform(get(&quot;/x&quot;))</code> with status and jsonPath checks.'],
        [['F', 'What does @GetMapping do?', 'It maps HTTP GET requests to a controller method.'],
            ['F', 'Can a GET request have a body?', 'Technically yes, but it is not supported by most clients; use query params and path variables.'],
            ['M', 'Should a GET modify data?', 'No. GET must be safe and idempotent, so it should only read.'],
            ['M', 'How do you read an id from the URL?', 'With @PathVariable on a {id} placeholder in the path.'],
            ['S', 'How do you support conditional GET?', 'Return an ETag or Last-Modified header; Spring answers 304 when the client copy is current.'],
            ['S', 'What happens to HEAD requests?', 'Spring routes HEAD to the GET handler and drops the body.']],
        [['List and detail endpoints.',
            r`@RestController
@RequestMapping("/books")
public class BookController {

    @GetMapping
    public List<String> all() { return List.of("Java", "Spring"); }

    @GetMapping("/{id}")
    public String one(@PathVariable int id) { return "Book " + id; }
}

// OUTPUT:
// GET /books   -> ["Java","Spring"]
// GET /books/7 -> Book 7`],
            ['Test with MockMvc.',
                r`mvc.perform(get("/books/7"))
   .andExpect(status().isOk())
   .andExpect(content().string("Book 7"));

mvc.perform(post("/books/7"))
   .andExpect(status().isMethodNotAllowed());

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['Query parameters with defaults.',
            r`@GetMapping("/search")
public String search(@RequestParam String q,
                     @RequestParam(defaultValue = "1") int page) {
    return q + " page " + page;
}

// OUTPUT:
// GET /search?q=java        -> java page 1
// GET /search?q=java&page=3 -> java page 3`],
            ['Pitfall: changing data in GET.',
                r`// WRONG: a crawler or prefetch could delete data
@GetMapping("/delete/{id}")
public String bad(@PathVariable int id) {
    repo.deleteById(id);
    return "x";
}

// RIGHT
@DeleteMapping("/{id}")
public void good(@PathVariable int id) { repo.deleteById(id); }

// OUTPUT:
// use DELETE for deletes; keep GET read-only`]]
    ),

    'mvc-postmapping': x(
        ['<b>@PostMapping</b> maps HTTP POST requests to a method; it is the shortcut for <code>@RequestMapping(method = RequestMethod.POST)</code> and is used to create resources or submit forms.',
            '<b>Body</b>: send JSON and read it with <code>@RequestBody</code>; for HTML forms Spring binds fields with <code>@ModelAttribute</code> or <code>@RequestParam</code>.',
            '<b>Response</b>: a create usually returns 201 Created with a <code>Location</code> header.'],
        ['<b>Not idempotent</b>: repeating a POST may create a second record, so protect important operations with an idempotency key.',
            '<b>Validation</b>: add <code>@Valid</code> to the body so bad input gives 400 and not a database error.',
            '<b>Content type</b>: use <code>consumes</code> to accept only JSON; other types get 415.'],
        ['<b>Message converters</b>: <code>HttpMessageConverter</code> (Jackson for JSON) turns the body into an object.',
            '<b>CSRF</b>: with Spring Security, POST forms need a CSRF token or the call is rejected with 403.',
            '<b>Redirect after POST</b>: for forms, redirect after success to avoid double submit on refresh.'],
        [['F', 'When do you use @PostMapping?', 'To create a resource or submit data to the server.'],
            ['F', 'How do you read a JSON body?', 'Put @RequestBody on a method parameter.'],
            ['M', 'What status should a create return?', '201 Created, with a Location header pointing to the new resource.'],
            ['M', 'What does consumes do?', 'It limits the mapping to requests whose Content-Type matches; others get 415.'],
            ['S', 'Is POST idempotent?', 'No. Retrying may create duplicates, so use idempotency keys or a unique constraint.'],
            ['S', 'Why can POST fail with 403 in a secured app?', 'The CSRF token is missing or invalid.']],
        [['Create with JSON body and Location.',
            r`@RestController
@RequestMapping("/users")
public class UserController {

    record NewUser(String name) {}

    @PostMapping(consumes = "application/json")
    public ResponseEntity<String> create(@RequestBody NewUser u) {
        URI uri = URI.create("/users/1");
        return ResponseEntity.created(uri).body("Created " + u.name());
    }
}

// OUTPUT:
// POST /users {"name":"Abaji"} -> 201 Created
// Location: /users/1
// Created Abaji`],
            ['Test the POST.',
                r`mvc.perform(post("/users")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Abaji\"}"))
   .andExpect(status().isCreated())
   .andExpect(header().string("Location", "/users/1"));

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['Form post with redirect.',
            r`@Controller
public class SignupController {
    @PostMapping("/signup")
    public String signup(@RequestParam String email) {
        // save...
        return "redirect:/thanks";
    }
}

// OUTPUT:
// POST /signup (email=a@b.com) -> 302 Location: /thanks`],
            ['Validated body.',
                r`record NewUser(@NotBlank String name) {}

@PostMapping("/users")
public String create(@Valid @RequestBody NewUser u) { return "ok"; }

// OUTPUT:
// POST /users {"name":""} -> 400 Bad Request (validation failed)`]]
    ),

    'mvc-putmapping': x(
        ['<b>@PutMapping</b> maps HTTP PUT requests; it is the shortcut for <code>@RequestMapping(method = RequestMethod.PUT)</code> and is used to replace a whole resource.',
            '<b>Full replacement</b>: the client sends the complete new state of the resource at a known URL such as <code>/users/5</code>.',
            '<b>Response</b>: 200 OK with the body, or 204 No Content; 404 when the id does not exist.'],
        ['<b>Idempotent</b>: sending the same PUT twice leaves the same result, so retries are safe.',
            '<b>PUT versus PATCH</b>: PUT replaces everything (missing fields become null); PATCH changes only the fields sent.',
            '<b>Create or update</b>: PUT may also create a resource if the client chooses the id.'],
        ['<b>Browsers</b> forms send only GET and POST; HTML forms need <code>HiddenHttpMethodFilter</code> or Boot property <code>spring.mvc.hiddenmethod.filter.enabled</code> to use PUT.',
            '<b>Concurrency</b>: use a version field or <code>If-Match</code> with ETag to avoid lost updates.',
            '<b>Testing</b>: <code>mvc.perform(put(...).contentType(...).content(...))</code>.'],
        [['F', 'What is PUT used for?', 'To replace an existing resource with the data in the request body.'],
            ['F', 'Which annotation handles PUT?', '@PutMapping.'],
            ['M', 'Is PUT idempotent?', 'Yes. Repeating the same request gives the same final state.'],
            ['M', 'Difference between PUT and PATCH?', 'PUT replaces the whole resource; PATCH applies a partial change.'],
            ['S', 'How do you prevent lost updates?', 'Use optimistic locking with a version field or ETag with If-Match.'],
            ['S', 'Can an HTML form send PUT?', 'Not directly; use a hidden _method field with the hidden method filter, or use JavaScript.']],
        [['Replace a user.',
            r`@RestController
@RequestMapping("/users")
public class UserController {

    record UserDto(String name, String email) {}

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> replace(@PathVariable int id,
                                           @RequestBody UserDto dto) {
        if (id != 5) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }
}

// OUTPUT:
// PUT /users/5 {"name":"Raoji","email":"r@x.com"} -> 200 same JSON
// PUT /users/9 ...                                -> 404`],
            ['Test the PUT.',
                r`mvc.perform(put("/users/5")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"name\":\"Raoji\",\"email\":\"r@x.com\"}"))
   .andExpect(status().isOk())
   .andExpect(jsonPath("$.name").value("Raoji"));

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['Return 204 instead of a body.',
            r`@PutMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void update(@PathVariable int id, @RequestBody UserDto dto) {
    service.replace(id, dto);
}

// OUTPUT:
// PUT /users/5 -> 204 No Content`],
            ['Enable PUT from HTML forms (Boot).',
                r`# application.properties
spring.mvc.hiddenmethod.filter.enabled=true

# form: <form method="post"> <input type="hidden" name="_method" value="put">

# OUTPUT:
# the POST is treated as PUT and reaches the @PutMapping method`]]
    ),

    'mvc-deletemapping': x(
        ['<b>@DeleteMapping</b> maps HTTP DELETE requests; it is the shortcut for <code>@RequestMapping(method = RequestMethod.DELETE)</code> and removes a resource identified by the URL.',
            '<b>Typical shape</b>: <code>DELETE /users/5</code> with the id as a <code>@PathVariable</code> and no request body.',
            '<b>Response</b>: 204 No Content on success, or 404 if the resource does not exist.'],
        ['<b>Idempotent</b>: deleting twice leaves the same state; the second call may return 404 or 204, but data is not changed further.',
            '<b>Soft delete</b>: many systems only mark a row as deleted so history and references stay valid.',
            '<b>Security</b>: protect it with roles, for example <code>@PreAuthorize</code>, and with CSRF for browser clients.'],
        ['<b>Body</b> on DELETE is allowed by HTTP but poorly supported, so send ids in the path or query.',
            '<b>Bulk delete</b>: use a query like <code>DELETE /users?ids=1,2</code> or a POST to a bulk endpoint, and keep it transactional.',
            '<b>Testing</b>: <code>mvc.perform(delete(&quot;/users/5&quot;))</code> and check 204.'],
        [['F', 'What does @DeleteMapping do?', 'It maps HTTP DELETE requests, used to remove a resource.'],
            ['F', 'Which status is usual after a delete?', '204 No Content.'],
            ['M', 'Is DELETE idempotent?', 'Yes. Repeating it does not change the state after the first call.'],
            ['M', 'What do you return for a missing id?', '404 Not Found, often through an exception handler.'],
            ['S', 'Hard delete versus soft delete?', 'Hard removes the row; soft sets a flag so audit trails and foreign keys stay intact.'],
            ['S', 'Why is DELETE often blocked in forms?', 'Browsers send only GET and POST from forms; use JavaScript or the hidden method filter.']],
        [['Delete by id.',
            r`@RestController
@RequestMapping("/users")
public class UserController {

    private final Map<Integer, String> db =
        new HashMap<>(Map.of(5, "Abaji"));

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        return db.remove(id) == null
            ? ResponseEntity.notFound().build()
            : ResponseEntity.noContent().build();
    }
}

// OUTPUT:
// DELETE /users/5 -> 204 No Content
// DELETE /users/5 -> 404 Not Found`],
            ['Test the DELETE.',
                r`mvc.perform(delete("/users/5"))
   .andExpect(status().isNoContent());
mvc.perform(delete("/users/5"))
   .andExpect(status().isNotFound());

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['With a service and exception.',
            r`@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void delete(@PathVariable long id) {
    service.deleteOrThrow(id);   // throws NotFoundException -> 404
}

// OUTPUT:
// DELETE /orders/10 -> 204`],
            ['Role protected delete.',
                r`@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void delete(@PathVariable long id) { service.delete(id); }

// OUTPUT:
// USER role  -> 403 Forbidden
// ADMIN role -> 204 No Content`]]
    ),

    'mvc-patchmapping': x(
        ['<b>@PatchMapping</b> maps HTTP PATCH requests; it is the shortcut for <code>@RequestMapping(method = RequestMethod.PATCH)</code> and applies a partial update to a resource.',
            '<b>Only changed fields</b> are sent, for example <code>{&quot;email&quot;:&quot;new@x.com&quot;}</code>; all other fields stay as they are.',
            '<b>Typical use</b>: change one field such as a status, a password or a profile detail without sending the whole object.'],
        ['<b>Not always idempotent</b>: a patch like increment by 1 changes the result each time; a patch like set status to SHIPPED is idempotent.',
            '<b>Null handling</b>: you must tell apart a missing field (keep) from an explicit null (clear); a plain DTO cannot, so use a Map or <code>Optional</code> wrapper.',
            '<b>Formats</b>: simple merge JSON, or JSON Patch (<code>application/json-patch+json</code>) with operations.'],
        ['<b>Implementation</b>: load the entity, copy only the non-missing fields, then save in one transaction.',
            '<b>Libraries</b>: Jackson <code>ObjectMapper.readerForUpdating</code> can merge JSON into an existing object.',
            '<b>Client support</b>: some old HTTP clients and the JDK <code>HttpURLConnection</code> do not support PATCH; use a modern client.'],
        [['F', 'What is PATCH for?', 'Partial update of a resource, sending only the fields that change.'],
            ['F', 'Which annotation handles it?', '@PatchMapping.'],
            ['M', 'PUT or PATCH to change an email?', 'PATCH, because only one field changes; PUT would need the whole object.'],
            ['M', 'Is PATCH idempotent?', 'Not guaranteed; it depends on the operation, so design it to be idempotent where possible.'],
            ['S', 'How do you tell a missing field from null?', 'Use a Map of fields, JsonNode, or a wrapper type so absent keys can be detected.'],
            ['S', 'What content types exist for PATCH?', 'Plain JSON merge, or application/json-patch+json for JSON Patch operations.']],
        [['Update only the email.',
            r`@RestController
@RequestMapping("/users")
public class UserController {

    @PatchMapping("/{id}")
    public Map<String, Object> patch(@PathVariable int id,
                                     @RequestBody Map<String, Object> changes) {
        Map<String, Object> user = new HashMap<>(
            Map.of("name", "Abaji", "email", "old@x.com"));
        user.putAll(changes);          // only sent keys change
        return user;
    }
}

// OUTPUT:
// PATCH /users/1 {"email":"new@x.com"}
// -> {"name":"Abaji","email":"new@x.com"} (key order varies)`],
            ['Test the PATCH.',
                r`mvc.perform(patch("/users/1")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"email\":\"new@x.com\"}"))
   .andExpect(status().isOk())
   .andExpect(jsonPath("$.name").value("Abaji"))
   .andExpect(jsonPath("$.email").value("new@x.com"));

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['Patch a status field only.',
            r`record StatusChange(String status) {}

@PatchMapping("/orders/{id}/status")
public ResponseEntity<Void> status(@PathVariable long id,
                                   @RequestBody StatusChange c) {
    service.setStatus(id, c.status());
    return ResponseEntity.noContent().build();
}

// OUTPUT:
// PATCH /orders/9/status {"status":"SHIPPED"} -> 204`],
            ['Merge JSON into an entity with Jackson.',
                r`@PatchMapping("/{id}")
public User patch(@PathVariable long id, @RequestBody JsonNode json)
        throws IOException {
    User user = repo.findById(id).orElseThrow();
    mapper.readerForUpdating(user).readValue(json);   // copies sent fields
    return repo.save(user);
}

// OUTPUT:
// fields present in the JSON are updated; absent fields are kept`]]
    ),

    'mvc-mapping-http-methods': x(
        ['<b>HTTP method mapping</b> means telling Spring which verb a handler accepts: use <code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@DeleteMapping</code>, <code>@PatchMapping</code>, or <code>@RequestMapping(method = ...)</code>.',
            '<b>Meaning of verbs</b>: GET reads, POST creates, PUT replaces, PATCH changes part, DELETE removes.',
            '<b>Wrong verb</b> on a known path returns <b>405 Method Not Allowed</b> with an <code>Allow</code> header.'],
        ['<b>Safe and idempotent</b>: GET is safe; GET, PUT and DELETE are idempotent; POST and usually PATCH are not.',
            '<b>Same path, several methods</b> are fine because the method is part of the mapping key.',
            '<b>Many verbs, one handler</b>: <code>@RequestMapping(method = {GET, POST})</code> handles both.'],
        ['<b>HEAD and OPTIONS</b> are added automatically: HEAD for each GET, OPTIONS from the registered mappings (and CORS preflight).',
            '<b>Method override</b>: <code>HiddenHttpMethodFilter</code> turns a POST with <code>_method</code> into PUT or DELETE.',
            '<b>Design</b>: do not tunnel everything through POST; correct verbs let caches, proxies and clients behave properly.'],
        [['F', 'Name the main HTTP methods.', 'GET, POST, PUT, PATCH and DELETE, plus HEAD and OPTIONS.'],
            ['F', 'What happens on the wrong method?', 'Spring returns 405 Method Not Allowed.'],
            ['M', 'Which methods are idempotent?', 'GET, PUT and DELETE (and HEAD, OPTIONS); POST is not.'],
            ['M', 'How do you accept two verbs in one handler?', 'Use @RequestMapping with method = {RequestMethod.GET, RequestMethod.POST}.'],
            ['S', 'Who answers OPTIONS requests?', 'Spring generates the response from the mappings, and CORS config handles preflight.'],
            ['S', 'Why not use POST for everything?', 'You lose caching, safe retries and clear semantics that infrastructure relies on.']],
        [['One path, all verbs, one resource.',
            r`@RestController
@RequestMapping("/tasks")
public class TaskController {
    @GetMapping("/{id}")    String read(@PathVariable int id)   { return "read " + id; }
    @PutMapping("/{id}")    String replace(@PathVariable int id) { return "put " + id; }
    @DeleteMapping("/{id}") String remove(@PathVariable int id)  { return "del " + id; }
    @PostMapping            String create()                     { return "created"; }
}

// OUTPUT:
// GET /tasks/1 -> read 1      PUT /tasks/1 -> put 1
// DELETE /tasks/1 -> del 1    POST /tasks  -> created
// PATCH /tasks/1 -> 405`],
            ['Check the Allow header.',
                r`mvc.perform(patch("/tasks/1"))
   .andExpect(status().isMethodNotAllowed())
   .andExpect(header().string("Allow", "GET,PUT,DELETE,HEAD,OPTIONS"));

// OUTPUT:
// Tests run: 1, Failures: 0 (header order may vary)`]],
        [['Two verbs on one method.',
            r`@RequestMapping(path = "/echo",
                method = {RequestMethod.GET, RequestMethod.POST})
public String echo() { return "echo"; }

// OUTPUT:
// GET /echo -> echo
// POST /echo -> echo
// PUT /echo -> 405`],
            ['Pitfall: verb in the URL.',
                r`// poor style
@PostMapping("/deleteUser") void a() {}
// better
@DeleteMapping("/users/{id}") void b(@PathVariable int id) {}

// OUTPUT:
// the verb already says what happens; the URL names the resource`]]
    ),

    'mvc-mapping-url-paths': x(
        ['<b>URL path mapping</b> sets which request paths a handler serves: <code>@GetMapping(&quot;/users&quot;)</code> or <code>@RequestMapping(path = &quot;/users&quot;)</code>.',
            '<b>Path variables</b>: placeholders such as <code>/users/{id}</code> capture part of the URL, read with <code>@PathVariable</code>.',
            '<b>Patterns</b>: <code>*</code> matches one segment, <code>**</code> matches many segments, and <code>?</code> one character.'],
        ['<b>Several paths</b> for one method are given as an array: <code>@GetMapping({&quot;/a&quot;, &quot;/b&quot;})</code>.',
            '<b>Regex in variable</b>: <code>/users/{id:[0-9]+}</code> restricts the variable to digits so other values do not match.',
            '<b>Specific wins</b>: <code>/users/me</code> beats <code>/users/{id}</code> when both match.'],
        ['<b>PathPattern</b>: since Spring 5.3 the default matcher is <code>PathPatternParser</code>, which is faster than the old AntPathMatcher; <code>**</code> is only allowed at the end of a pattern.',
            '<b>Trailing slash</b>: in Spring 6 <code>/users/</code> no longer matches <code>/users</code> by default, so clients must use the exact path.',
            '<b>Encoding</b>: path variables are URL-decoded; semicolon content (matrix variables) is disabled by default.'],
        [['F', 'How do you map a URL?', 'Pass the path to @GetMapping, @PostMapping or @RequestMapping(path = ...).'],
            ['F', 'How do you read /users/5?', 'Declare /users/{id} and use @PathVariable int id.'],
            ['M', 'What does ** mean in a pattern?', 'It matches zero or more path segments.'],
            ['M', 'How to allow only numeric ids?', 'Use a regex: /users/{id:[0-9]+}.'],
            ['S', 'Which matcher is used in Spring 6?', 'PathPatternParser, which parses patterns once and is faster than AntPathMatcher.'],
            ['S', 'Does /users match /users/ in Spring 6?', 'No. Trailing slash matching is off by default, so add both paths or redirect.']],
        [['Variables, regex and wildcard.',
            r`@RestController
public class PathController {

    @GetMapping("/users/{id:[0-9]+}")
    String byId(@PathVariable long id) { return "user " + id; }

    @GetMapping("/users/me")
    String me() { return "current user"; }

    @GetMapping("/files/**")
    String files() { return "any file path"; }
}

// OUTPUT:
// GET /users/42      -> user 42
// GET /users/me      -> current user
// GET /users/abc     -> 404
// GET /files/a/b.txt -> any file path`],
            ['Test paths.',
                r`mvc.perform(get("/users/42")).andExpect(content().string("user 42"));
mvc.perform(get("/users/me")).andExpect(content().string("current user"));
mvc.perform(get("/users/abc")).andExpect(status().isNotFound());

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['Two variables in a path.',
            r`@GetMapping("/orders/{orderId}/items/{itemId}")
String item(@PathVariable long orderId, @PathVariable long itemId) {
    return orderId + "-" + itemId;
}

// OUTPUT:
// GET /orders/7/items/3 -> 7-3`],
            ['Allow both with and without trailing slash.',
                r`@GetMapping({"/reports", "/reports/"})
String reports() { return "reports"; }

// OUTPUT:
// GET /reports  -> reports
// GET /reports/ -> reports`]]
    ),

    'mvc-class-level-mapping': x(
        ['<b>Class-level mapping</b> puts <code>@RequestMapping(&quot;/base&quot;)</code> on the controller class so every handler method inherits that path as a prefix.',
            '<b>Method paths</b> are added to it: class <code>/users</code> plus method <code>/{id}</code> gives <code>/users/{id}</code>.',
            '<b>Benefit</b>: no repeated prefix, and the whole controller can be moved by changing one line.'],
        ['<b>Shared conditions</b>: <code>produces</code>, <code>consumes</code> and <code>headers</code> on the class apply to all methods; a method can narrow them.',
            '<b>Method only</b>: a method annotation with no path maps to exactly the class path, for example list at <code>/users</code>.',
            '<b>Slashes</b>: Spring joins the parts correctly, so <code>&quot;users&quot;</code> and <code>&quot;/users&quot;</code> both work, but keep the leading slash for clarity.'],
        ['<b>Combination</b>: <code>RequestMappingInfo.combine</code> merges class and method info; patterns are concatenated, methods and params are unioned.',
            '<b>Versioning</b>: one class per version, for example <code>/api/v1/users</code>, keeps old clients working.',
            '<b>Global prefix</b>: <code>PathMatchConfigurer.addPathPrefix(&quot;/api&quot;, ...)</code> adds a prefix to all matching controllers without editing each class.'],
        [['F', 'What is class-level mapping?', 'A @RequestMapping on the class that gives a common URL prefix to all its handler methods.'],
            ['F', 'Why use it?', 'It avoids repeating the base path and keeps related endpoints together.'],
            ['M', 'How are class and method paths combined?', 'They are concatenated, so /users and /{id} become /users/{id}.'],
            ['M', 'Can a method override class-level produces?', 'Yes, a method-level produces replaces the class-level value for that method.'],
            ['S', 'How do you add /api to every controller?', 'Use PathMatchConfigurer.addPathPrefix in a WebMvcConfigurer, with a predicate such as RestController.class.'],
            ['S', 'Is class-level mapping required?', 'No. It is optional; without it each method has its full path.']],
        [['Controller with base path.',
            r`@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping                        // GET /users
    public String list() { return "all users"; }

    @GetMapping("/{id}")               // GET /users/{id}
    public String one(@PathVariable int id) { return "user " + id; }

    @PostMapping                       // POST /users
    public String create() { return "created"; }
}

// OUTPUT:
// GET /users   -> all users
// GET /users/3 -> user 3
// POST /users  -> created`],
            ['Test with MockMvc.',
                r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void prefixApplies() throws Exception {
        mvc.perform(get("/users/3")).andExpect(content().string("user 3"));
        mvc.perform(get("/3")).andExpect(status().isNotFound());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]],
        [['Shared produces on the class.',
            r`@RestController
@RequestMapping(path = "/api/items", produces = "application/json")
public class ItemController {
    @GetMapping String all() { return "[]"; }
}

// OUTPUT:
// GET /api/items -> 200, Content-Type: application/json`],
            ['Global prefix without editing classes.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void configurePathMatch(PathMatchConfigurer c) {
        c.addPathPrefix("/api", HandlerTypePredicate.forAnnotation(RestController.class));
    }
}

// OUTPUT:
// @RestController "/users" is now served at /api/users`]]
    )
};

export const smvc05Deep: Record<string, Deep> = {
    'mvc-request-mapping': dv(
        [`<p>How a request finds its handler:</p><ul><li><b>Startup:</b> <code>RequestMappingHandlerMapping</code> scans beans with <code>@Controller</code> and builds a <code>RequestMappingInfo</code> (path, method, params, headers, consumes, produces) for each handler method.</li><li><b>Registry:</b> infos are stored in a <code>MappingRegistry</code>, with direct URLs in a fast map and patterns in a list.</li><li><b>Request:</b> the <code>DispatcherServlet</code> asks each <code>HandlerMapping</code> in order; the first that returns a <code>HandlerExecutionChain</code> wins.</li><li><b>Choice:</b> all matching infos are compared and the best one is used; ties throw an error.</li><li><b>Invoke:</b> <code>RequestMappingHandlerAdapter</code> resolves arguments, calls the method and handles the return value.</li></ul>`,
            r`@Autowired RequestMappingHandlerMapping mapping;

@Test
void listMappings() {
    mapping.getHandlerMethods().forEach((info, method) ->
        System.out.println(info + " -> " + method.getShortLogMessage()));
}

// OUTPUT: (varies)
// { GET [/hello] } -> HelloController#hello()
// { POST [/notes] } -> NoteController#create()`],
        [`<p>Ways to express a mapping:</p><ul><li><b>Path:</b> exact, with variables, with patterns.</li><li><b>Method:</b> one or several HTTP methods.</li><li><b>params:</b> <code>params = &quot;debug&quot;</code> or <code>&quot;mode=fast&quot;</code> or <code>&quot;!x&quot;</code>.</li><li><b>headers:</b> match a request header value.</li><li><b>consumes / produces:</b> content negotiation on Content-Type and Accept.</li></ul>`,
            r`@GetMapping(path = "/data", params = "mode=fast")
String fast() { return "fast"; }

@GetMapping(path = "/data", params = "mode=full")
String full() { return "full"; }

@GetMapping(path = "/data", headers = "X-Api-Version=2")
String v2() { return "v2"; }

// OUTPUT:
// GET /data?mode=fast -> fast
// GET /data?mode=full -> full
// GET /data with X-Api-Version: 2 -> v2
// GET /data -> 400 or 404 (no condition matches)`],
        [`<p>Common mistakes:</p><ul><li><b>Duplicate mapping:</b> two methods with the same path and method make startup fail; change the path or add a distinguishing condition.</li><li><b>Missing controller stereotype:</b> <code>@RequestMapping</code> on a plain class is ignored; add <code>@RestController</code>.</li><li><b>Wrong package scan:</b> the controller is outside the component scan, so you get 404.</li><li><b>Trailing slash:</b> in Spring 6 <code>/a/</code> does not match <code>/a</code>.</li><li><b>Misreading 405:</b> the path matched, only the verb is wrong.</li></ul>`,
            r`// WRONG: ambiguous
@GetMapping("/items") String a() { return "a"; }
@GetMapping("/items") String b() { return "b"; }

// FIX: distinguish them
@GetMapping("/items") String a() { return "a"; }
@GetMapping(path = "/items", params = "all") String b() { return "b"; }

// OUTPUT:
// IllegalStateException: Ambiguous mapping. Cannot map 'b' method ...
// (before the fix, at startup)`],
        [`<p>Performance notes:</p><ul><li><b>Lookup cost:</b> exact paths use a hash lookup; pattern paths are tested in order, so very large pattern lists cost more.</li><li><b>PathPatternParser:</b> patterns are parsed once at startup.</li><li><b>Keep handlers thin:</b> the mapping step is microseconds; the time goes into your code, serialization and I/O.</li><li><b>Conditions:</b> avoid heavy custom <code>RequestCondition</code> logic.</li></ul>`,
            r`// Prefer exact paths when possible
@GetMapping("/health")          // fast direct lookup
String health() { return "UP"; }

@GetMapping("/files/**")        // pattern: matched after direct lookups
String files() { return "f"; }

// OUTPUT:
// mapping lookup is negligible compared with JSON conversion and database time`],
        [`<p>Scenario: a shop API exposes products. Reads are public, writes are for admins. Each URL and verb pair is a mapping, so security rules, metrics and documentation all line up with the same list. A startup log of mappings (or the Actuator <code>mappings</code> endpoint) is the first thing to check when a URL returns 404.</p>`,
            r`@RestController
@RequestMapping("/products")
class ProductController {
    @GetMapping            List<String> list()            { return List.of("pen"); }
    @GetMapping("/{id}")   String one(@PathVariable int id) { return "pen"; }
    @PostMapping           ResponseEntity<Void> add()     { return ResponseEntity.status(201).build(); }
}

# application.properties
management.endpoints.web.exposure.include=mappings

// OUTPUT:
// GET /actuator/mappings lists every dispatcher handler with its predicates`]
    ),

    'mvc-requestmapping': dv(
        [`<p>Inside <code>@RequestMapping</code>:</p><ul><li><b>Annotation:</b> attributes are aliases, <code>value</code> and <code>path</code> are the same (<code>@AliasFor</code>).</li><li><b>Parsing:</b> <code>RequestMappingHandlerMapping.createRequestMappingInfo</code> reads the annotation and builds condition objects: <code>PathPatternsRequestCondition</code>, <code>RequestMethodsRequestCondition</code>, <code>ParamsRequestCondition</code> and others.</li><li><b>Matching:</b> every condition returns a match or null; one null rejects the mapping.</li><li><b>Combining:</b> the class info is combined with the method info.</li></ul>`,
            r`@RequestMapping(path = "/a", method = RequestMethod.GET)
String a() { return "a"; }

// Equivalent composed annotation (simplified from the Spring source):
// @Target(METHOD)
// @RequestMapping(method = RequestMethod.GET)
// public @interface GetMapping {
//     @AliasFor(annotation = RequestMapping.class) String[] value() default {};
// }

// OUTPUT:
// both forms produce the same RequestMappingInfo { GET [/a] }`],
        [`<p>Variants:</p><ul><li><b>Attribute forms:</b> <code>@RequestMapping(&quot;/x&quot;)</code> is the same as <code>path = &quot;/x&quot;</code>.</li><li><b>Class plus method:</b> base path on the class.</li><li><b>consumes:</b> restrict request Content-Type.</li><li><b>produces:</b> restrict or choose response media type.</li><li><b>Negation:</b> <code>consumes = &quot;!text/plain&quot;</code>, <code>params = &quot;!debug&quot;</code>.</li></ul>`,
            r`@Controller
@RequestMapping("/convert")
public class ConvertController {

    @RequestMapping(method = RequestMethod.POST,
                    consumes = "application/json",
                    produces = "text/plain")
    @ResponseBody
    String fromJson(@RequestBody String body) { return "json:" + body; }

    @RequestMapping(method = RequestMethod.POST, consumes = "text/plain")
    @ResponseBody
    String fromText(@RequestBody String body) { return "text:" + body; }
}

// OUTPUT:
// POST /convert (Content-Type: application/json) -> json:{...}
// POST /convert (Content-Type: text/plain)       -> text:...
// POST /convert (Content-Type: image/png)        -> 415 Unsupported Media Type`],
        [`<p>Mistakes with <code>@RequestMapping</code>:</p><ul><li><b>Forgetting method:</b> the endpoint then accepts every verb, including DELETE.</li><li><b>Mixing value and path:</b> setting both is an error.</li><li><b>Using it on an interface only:</b> works in recent Spring, but keep it on the implementation for clarity.</li><li><b>Class path without slash:</b> works, but is inconsistent style.</li></ul>`,
            r`// WRONG: accepts everything
@RequestMapping("/orders")
String orders() { return "x"; }

// FIX
@GetMapping("/orders")
String orders() { return "x"; }

// OUTPUT:
// before: DELETE /orders -> 200
// after:  DELETE /orders -> 405`],
        [`<p>Performance and tuning:</p><ul><li><b>Cost:</b> annotation parsing happens once at startup, not per request.</li><li><b>Many conditions:</b> each extra condition is one more cheap check.</li><li><b>Startup time:</b> thousands of mappings add a small startup cost; lazy initialization does not skip it for controllers that are scanned.</li></ul>`,
            r`# application.properties
# log mapping registration at startup
logging.level.org.springframework.web.servlet.mvc.method.annotation=TRACE

# OUTPUT:
# Mapped "{[/orders],methods=[GET]}" onto String OrderController.orders()`],
        [`<p>Scenario: a legacy controller uses plain <code>@RequestMapping</code> without a verb. A security scan finds that <code>DELETE /reports</code> returns 200. The fix is to replace each with a verb-specific annotation, and add a MockMvc test that proves the wrong verb gives 405.</p>`,
            r`@Test
void onlyGetAllowed() throws Exception {
    mvc.perform(get("/reports")).andExpect(status().isOk());
    mvc.perform(delete("/reports")).andExpect(status().isMethodNotAllowed());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),

    'mvc-getmapping': dv(
        [`<p>How a GET is served:</p><ul><li><b>Mapping:</b> the info has a <code>RequestMethodsRequestCondition</code> with GET (and HEAD is accepted too).</li><li><b>Arguments:</b> <code>@PathVariable</code> and <code>@RequestParam</code> are resolved by <code>HandlerMethodArgumentResolver</code>s.</li><li><b>Return value:</b> <code>RequestResponseBodyMethodProcessor</code> writes it with a <code>HttpMessageConverter</code>, chosen by the Accept header.</li><li><b>Caching:</b> a <code>ShallowEtagHeaderFilter</code> can compute an ETag from the body and answer 304.</li></ul>`,
            r`@GetMapping(value = "/greet", produces = "application/json")
public Map<String, String> greet(@RequestParam(defaultValue = "world") String name) {
    return Map.of("message", "Hello " + name);
}

// OUTPUT:
// GET /greet?name=Abaji -> {"message":"Hello Abaji"}
// GET /greet           -> {"message":"Hello world"}`],
        [`<p>Options of <code>@GetMapping</code>:</p><ul><li><b>path / value:</b> one or many URLs.</li><li><b>params, headers:</b> extra conditions.</li><li><b>produces:</b> media type of the response, for example JSON or XML.</li><li><b>No path:</b> inherits the class path.</li><li><b>Return types:</b> object, <code>ResponseEntity</code>, <code>Optional</code> wrapped by you, or a view name in a <code>@Controller</code>.</li></ul>`,
            r`@GetMapping("/{id}")
public ResponseEntity<Book> one(@PathVariable long id) {
    return repo.findById(id)
        .map(b -> ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(Duration.ofMinutes(5)))
            .body(b))
        .orElse(ResponseEntity.notFound().build());
}

// OUTPUT:
// GET /books/1  -> 200, Cache-Control: max-age=300, JSON body
// GET /books/99 -> 404`],
        [`<p>Mistakes with GET:</p><ul><li><b>Side effects:</b> changing data in a GET.</li><li><b>Sensitive data in the URL:</b> query strings are logged; never put passwords or tokens there.</li><li><b>Returning huge lists:</b> use paging.</li><li><b>Type mismatch:</b> <code>/books/abc</code> for an <code>int</code> variable gives 400.</li><li><b>Missing required param:</b> gives 400 unless you set <code>required = false</code> or a default.</li></ul>`,
            r`// WRONG: password in the URL
@GetMapping("/login")
String login(@RequestParam String user, @RequestParam String password) { ... }

// FIX: use POST with a body over HTTPS
@PostMapping("/login")
String login(@RequestBody Credentials c) { ... }

// OUTPUT:
// GET /books/abc -> 400 Bad Request (MethodArgumentTypeMismatchException)`],
        [`<p>Performance:</p><ul><li><b>Pagination:</b> use <code>Pageable</code> to limit rows.</li><li><b>Caching:</b> <code>Cache-Control</code>, ETag and a service cache avoid repeated work.</li><li><b>Projection:</b> return a DTO with only the needed fields.</li><li><b>Compression:</b> <code>server.compression.enabled=true</code> for large JSON.</li></ul>`,
            r`@GetMapping
public Page<BookDto> page(@PageableDefault(size = 20) Pageable p) {
    return repo.findAll(p).map(BookDto::from);
}

# application.properties
server.compression.enabled=true

// OUTPUT:
// GET /books?page=0&size=20 -> {"content":[...20 items],"totalElements":135,...}`],
        [`<p>Scenario: a mobile app lists orders and polls for updates every 30 seconds. The GET endpoint returns an ETag; when nothing changed the server answers 304 with no body, saving bandwidth and server time.</p>`,
            r`@GetMapping("/orders/{id}")
public ResponseEntity<OrderDto> order(@PathVariable long id,
                                      WebRequest request) {
    OrderDto o = service.find(id);
    String etag = "\"" + o.version() + "\"";
    if (request.checkNotModified(etag)) return null;   // sends 304
    return ResponseEntity.ok().eTag(etag).body(o);
}

// OUTPUT:
// 1st GET -> 200 ETag: "3"
// GET with If-None-Match: "3" -> 304 Not Modified`]
    ),

    'mvc-postmapping': dv(
        [`<p>How a POST body is handled:</p><ul><li><b>Mapping:</b> POST condition plus optional <code>consumes</code>.</li><li><b>Reading:</b> <code>RequestResponseBodyMethodProcessor</code> picks a converter from the Content-Type; JSON uses <code>MappingJackson2HttpMessageConverter</code>.</li><li><b>Validation:</b> with <code>@Valid</code>, a validator runs after binding and throws <code>MethodArgumentNotValidException</code> on errors.</li><li><b>Errors:</b> that exception is translated to 400 by <code>DefaultHandlerExceptionResolver</code> or your <code>@ControllerAdvice</code>.</li></ul>`,
            r`record Signup(@NotBlank String name, @Email String email) {}

@PostMapping("/signup")
public ResponseEntity<String> signup(@Valid @RequestBody Signup s) {
    return ResponseEntity.status(HttpStatus.CREATED).body("welcome " + s.name());
}

// OUTPUT:
// POST /signup {"name":"Abaji","email":"a@x.com"} -> 201 welcome Abaji
// POST /signup {"name":"","email":"bad"}          -> 400 Bad Request`],
        [`<p>Variants of POST handling:</p><ul><li><b>JSON:</b> <code>@RequestBody</code>.</li><li><b>Form:</b> <code>application/x-www-form-urlencoded</code> with <code>@RequestParam</code> or <code>@ModelAttribute</code>.</li><li><b>File upload:</b> <code>multipart/form-data</code> with <code>MultipartFile</code>.</li><li><b>Response:</b> 201 plus Location, or 200 with a body, or a redirect.</li></ul>`,
            r`@PostMapping(path = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public String upload(@RequestParam("file") MultipartFile file) {
    return file.getOriginalFilename() + " " + file.getSize() + " bytes";
}

@PostMapping(path = "/form", consumes = "application/x-www-form-urlencoded")
public String form(@RequestParam String city) { return "city=" + city; }

// OUTPUT:
// POST /upload (a.txt, 12 bytes) -> a.txt 12 bytes
// POST /form city=Pune           -> city=Pune`],
        [`<p>Mistakes with POST:</p><ul><li><b>Missing <code>@RequestBody</code>:</b> the parameter is then bound from form data and stays empty.</li><li><b>No default constructor or bad JSON:</b> gives 400 (<code>HttpMessageNotReadableException</code>).</li><li><b>Wrong Content-Type from the client:</b> gives 415.</li><li><b>Double submit:</b> user refreshes a form page; use redirect after post.</li><li><b>CSRF 403</b> with Spring Security.</li></ul>`,
            r`// WRONG: JSON is not bound
@PostMapping("/users")
String bad(User u) { return u.getName(); }       // name is null

// FIX
@PostMapping("/users")
String good(@RequestBody User u) { return u.getName(); }

// OUTPUT:
// before: null     after: Abaji`],
        [`<p>Performance and safety:</p><ul><li><b>Size limits:</b> <code>spring.servlet.multipart.max-file-size</code> and server max post size.</li><li><b>Streaming:</b> for big uploads stream to storage instead of loading into memory.</li><li><b>Idempotency key:</b> an <code>Idempotency-Key</code> header lets you ignore replays.</li><li><b>Async:</b> return <code>Callable</code> or use a queue for slow work and answer 202 Accepted.</li></ul>`,
            r`# application.properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB

@PostMapping("/reports")
public ResponseEntity<Void> start() {
    String id = queue.submit();
    return ResponseEntity.accepted().header("Location", "/reports/" + id).build();
}

// OUTPUT:
// POST /reports -> 202 Accepted, Location: /reports/ab12 (varies)`],
        [`<p>Scenario: a payment API must not charge twice if the client retries after a timeout. The client sends an <code>Idempotency-Key</code>; the server stores the key with the result and returns the stored result on a repeat.</p>`,
            r`@PostMapping("/payments")
public ResponseEntity<Payment> pay(
        @RequestHeader("Idempotency-Key") String key,
        @Valid @RequestBody PaymentRequest req) {
    Payment p = service.payOnce(key, req);   // returns saved result if key seen
    return ResponseEntity.status(HttpStatus.CREATED).body(p);
}

// OUTPUT:
// same key sent twice -> one charge, same payment id returned both times`]
    ),

    'mvc-putmapping': dv(
        [`<p>How PUT is handled:</p><ul><li><b>Mapping:</b> a PUT condition; body read like POST by a message converter.</li><li><b>Semantics:</b> the handler should replace the stored state, so the same request twice gives the same state.</li><li><b>Service layer:</b> load by id, overwrite all fields, save in a transaction.</li><li><b>Status:</b> 200 with the saved object, 204, or 404 when missing.</li></ul>`,
            r`@PutMapping("/{id}")
public ResponseEntity<Product> replace(@PathVariable long id,
                                       @Valid @RequestBody Product in) {
    return repo.findById(id)
        .map(old -> { in.setId(id); return ResponseEntity.ok(repo.save(in)); })
        .orElse(ResponseEntity.notFound().build());
}

// OUTPUT:
// PUT /products/3 {full body} -> 200 saved product
// PUT /products/99            -> 404`],
        [`<p>Variants:</p><ul><li><b>Upsert:</b> create if missing (return 201) else update (200).</li><li><b>Conditional:</b> <code>If-Match</code> header with ETag for safe updates.</li><li><b>Sub-resource:</b> <code>PUT /users/5/avatar</code> to replace one part with a full value.</li></ul>`,
            r`@PutMapping("/{id}")
public ResponseEntity<Product> upsert(@PathVariable long id,
                                      @RequestBody Product in) {
    boolean existed = repo.existsById(id);
    in.setId(id);
    Product saved = repo.save(in);
    return existed ? ResponseEntity.ok(saved)
                   : ResponseEntity.status(HttpStatus.CREATED).body(saved);
}

// OUTPUT:
// first PUT /products/8  -> 201 Created
// second PUT /products/8 -> 200 OK`],
        [`<p>Mistakes with PUT:</p><ul><li><b>Treating it as partial:</b> missing fields silently become null.</li><li><b>Id mismatch:</b> URL id and body id differ; trust the URL.</li><li><b>Lost update:</b> two clients overwrite each other.</li><li><b>Form support:</b> forms cannot send PUT without the hidden method filter.</li></ul>`,
            r`// WRONG: ignores the URL id
@PutMapping("/{id}")
Product put(@PathVariable long id, @RequestBody Product p) { return repo.save(p); }

// FIX: force the id from the URL
@PutMapping("/{id}")
Product put(@PathVariable long id, @RequestBody Product p) {
    p.setId(id);
    return repo.save(p);
}

// OUTPUT:
// no more accidental update of a different record`],
        [`<p>Concurrency and tuning:</p><ul><li><b>Optimistic locking:</b> <code>@Version</code> on the JPA entity throws <code>ObjectOptimisticLockingFailureException</code> on conflict; map it to 409.</li><li><b>ETag:</b> require <code>If-Match</code>; answer 412 Precondition Failed on mismatch.</li><li><b>Transaction:</b> keep load and save in one <code>@Transactional</code> service method.</li></ul>`,
            r`@Entity
class Product {
    @Id Long id;
    @Version Long version;   // incremented on each update
    String name;
}

@ExceptionHandler(ObjectOptimisticLockingFailureException.class)
ResponseEntity<String> conflict() {
    return ResponseEntity.status(HttpStatus.CONFLICT).body("changed by someone else");
}

// OUTPUT:
// stale PUT -> 409 Conflict`],
        [`<p>Scenario: an admin screen edits a customer. Two admins open the same record; the second save would erase the first. Using a version number and returning 409 makes the second admin reload and merge.</p>`,
            r`@PutMapping("/customers/{id}")
public CustomerDto update(@PathVariable long id,
                          @Valid @RequestBody CustomerDto dto) {
    return service.update(id, dto);   // checks dto.version() against the entity
}

// OUTPUT:
// admin A saves version 4 -> 200 (now version 5)
// admin B saves version 4 -> 409 Conflict`]
    ),

    'mvc-deletemapping': dv(
        [`<p>How DELETE runs:</p><ul><li><b>Mapping:</b> DELETE condition; the id comes from the path.</li><li><b>Service:</b> repository <code>deleteById</code> inside a transaction; foreign keys may block it.</li><li><b>Response:</b> normally 204 with no body, so <code>ResponseEntity&lt;Void&gt;</code> or <code>@ResponseStatus(NO_CONTENT)</code>.</li><li><b>Missing id:</b> <code>deleteById</code> in Spring Data 3 does nothing for a missing id, so check with <code>existsById</code> if you need 404.</li></ul>`,
            r`@DeleteMapping("/{id}")
public ResponseEntity<Void> delete(@PathVariable long id) {
    if (!repo.existsById(id)) return ResponseEntity.notFound().build();
    repo.deleteById(id);
    return ResponseEntity.noContent().build();
}

// OUTPUT:
// DELETE /items/4 -> 204
// DELETE /items/4 -> 404`],
        [`<p>Variants:</p><ul><li><b>Hard delete:</b> row removed.</li><li><b>Soft delete:</b> set <code>deleted = true</code> or use Hibernate <code>@SQLDelete</code> with <code>@SQLRestriction</code>.</li><li><b>Bulk:</b> delete by filter, for example <code>DELETE /items?status=old</code>.</li><li><b>Async:</b> return 202 when deletion takes long.</li></ul>`,
            r`@Entity
@SQLDelete(sql = "UPDATE item SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
class Item {
    @Id Long id;
    boolean deleted;
}

// OUTPUT:
// repo.deleteById(4) runs UPDATE ... SET deleted = true
// findAll() no longer returns item 4`],
        [`<p>Mistakes with DELETE:</p><ul><li><b>Deleting via GET.</b></li><li><b>Returning 200 with a body for no reason:</b> 204 is cleaner.</li><li><b>Ignoring references:</b> deleting a parent with children fails with <code>DataIntegrityViolationException</code> (map to 409).</li><li><b>No authorization check:</b> any user can delete any record; verify ownership.</li></ul>`,
            r`@ExceptionHandler(DataIntegrityViolationException.class)
ResponseEntity<String> inUse() {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body("cannot delete: still referenced");
}

// OUTPUT:
// DELETE /customers/2 (has orders) -> 409 Conflict`],
        [`<p>Performance:</p><ul><li><b>Bulk:</b> <code>deleteAllByIdInBatch</code> issues one SQL statement.</li><li><b>Cascade:</b> large cascades load children one by one; prefer database <code>ON DELETE CASCADE</code> or batch deletes.</li><li><b>Indexes:</b> foreign key columns need indexes so deletes do not scan.</li></ul>`,
            r`@Transactional
public void deleteMany(List<Long> ids) {
    repo.deleteAllByIdInBatch(ids);    // single DELETE ... WHERE id IN (...)
}

// OUTPUT:
// Hibernate: delete from item where id in (?, ?, ?)`],
        [`<p>Scenario: a user asks to delete their account. The API soft-deletes the account at once (204), and a nightly job removes personal data after the legal retention period, while keeping order totals.</p>`,
            r`@DeleteMapping("/me")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void deleteMe(@AuthenticationPrincipal UserDetails user) {
    accountService.markDeleted(user.getUsername());
}

// OUTPUT:
// DELETE /me -> 204; later GET /me -> 401 or 404`]
    ),

    'mvc-patchmapping': dv(
        [`<p>How PATCH is processed:</p><ul><li><b>Mapping:</b> PATCH condition and a body with only the changes.</li><li><b>Binding:</b> into a <code>Map</code>, <code>JsonNode</code> or a DTO with nullable fields.</li><li><b>Apply:</b> copy non-missing fields onto the loaded entity inside a transaction.</li><li><b>Dirty checking:</b> JPA writes only the changed columns at commit if the entity is managed.</li></ul>`,
            r`record UserPatch(String name, String email) {}   // null means not sent

@PatchMapping("/{id}")
@Transactional
public User patch(@PathVariable long id, @RequestBody UserPatch p) {
    User u = repo.findById(id).orElseThrow();
    if (p.name() != null)  u.setName(p.name());
    if (p.email() != null) u.setEmail(p.email());
    return u;                    // dirty checking issues the UPDATE
}

// OUTPUT:
// PATCH /users/1 {"email":"n@x.com"}
// Hibernate: update users set email=? where id=?`],
        [`<p>Patch formats:</p><ul><li><b>Merge style:</b> send a partial object (simple, most common).</li><li><b>JSON Patch (RFC 6902):</b> a list of operations such as replace and remove, media type <code>application/json-patch+json</code>.</li><li><b>JSON Merge Patch (RFC 7386):</b> partial object where null means remove, media type <code>application/merge-patch+json</code>.</li></ul>`,
            r`@PatchMapping(path = "/{id}", consumes = "application/json-patch+json")
public User jsonPatch(@PathVariable long id, @RequestBody JsonNode patch)
        throws Exception {
    User u = repo.findById(id).orElseThrow();
    JsonNode current = mapper.valueToTree(u);
    JsonNode result = JsonPatch.fromJson(patch).apply(current); // json-patch library
    return repo.save(mapper.treeToValue(result, User.class));
}

// OUTPUT:
// PATCH body: [{"op":"replace","path":"/email","value":"n@x.com"}]
// -> email replaced (needs a JSON Patch library on the classpath)`],
        [`<p>Mistakes with PATCH:</p><ul><li><b>Cannot clear a field:</b> null in a DTO means missing; use a Map or JsonNullable.</li><li><b>No validation:</b> partial objects fail <code>@NotNull</code> rules, so validate after merging.</li><li><b>Using PUT semantics:</b> overwriting unsent fields with null.</li><li><b>Unsafe field copy:</b> allowing the client to set <code>role</code> or <code>id</code>; whitelist fields.</li></ul>`,
            r`// WRONG: copies every key, including "role"
user.putAll(changes);

// FIX: whitelist
Set<String> allowed = Set.of("name", "email");
changes.forEach((k, v) -> { if (allowed.contains(k)) apply(user, k, v); });

// OUTPUT:
// {"role":"ADMIN"} is ignored`],
        [`<p>Performance:</p><ul><li><b>Smaller payloads:</b> less data sent from mobile clients.</li><li><b>Smaller SQL:</b> use <code>@DynamicUpdate</code> so Hibernate updates only changed columns.</li><li><b>One transaction:</b> load and apply in the same transaction to avoid an extra save call.</li></ul>`,
            r`@Entity
@DynamicUpdate
class User { /* ... */ }

// OUTPUT:
// Hibernate: update users set email=? where id=?   (not all columns)`],
        [`<p>Scenario: an order workflow changes a status step by step. A dedicated <code>PATCH /orders/{id}/status</code> with a small body keeps each change explicit, easy to audit and easy to secure per role.</p>`,
            r`@PatchMapping("/orders/{id}/status")
@PreAuthorize("hasRole('WAREHOUSE')")
public OrderDto move(@PathVariable long id, @RequestBody StatusChange c) {
    return service.moveTo(id, OrderStatus.valueOf(c.status()));
}

// OUTPUT:
// PATCH {"status":"SHIPPED"} -> 200 with updated order
// invalid transition -> 409 Conflict`]
    ),

    'mvc-mapping-http-methods': dv(
        [`<p>How the method is matched:</p><ul><li><b>Condition:</b> <code>RequestMethodsRequestCondition</code> holds the allowed verbs.</li><li><b>Path first:</b> if the path matches but no verb does, <code>HttpRequestMethodNotSupportedException</code> becomes 405 with an Allow header.</li><li><b>Shortcuts:</b> the five composed annotations only set this condition.</li><li><b>Auto methods:</b> HEAD uses the GET handler; OPTIONS is answered from collected verbs.</li></ul>`,
            r`@RestController
class MethodDemo {
    @GetMapping("/demo")  String g() { return "get"; }
    @PostMapping("/demo") String p() { return "post"; }
}

// OUTPUT: (curl -i -X OPTIONS /demo)
// HTTP/1.1 200
// Allow: GET,HEAD,POST,OPTIONS`],
        [`<p>Verb reference:</p><ul><li><b>GET:</b> read, safe, idempotent, cacheable.</li><li><b>POST:</b> create or run an action, not idempotent.</li><li><b>PUT:</b> replace, idempotent.</li><li><b>PATCH:</b> partial change.</li><li><b>DELETE:</b> remove, idempotent.</li><li><b>HEAD:</b> headers only.</li><li><b>OPTIONS:</b> capabilities and CORS preflight.</li></ul>`,
            r`@RestController
@RequestMapping("/accounts")
class AccountController {
    @GetMapping("/{id}")        Account get(@PathVariable long id)           { ... }
    @PostMapping                ResponseEntity<Account> open(@RequestBody Account a) { ... }
    @PutMapping("/{id}")        Account replace(@PathVariable long id, @RequestBody Account a) { ... }
    @PatchMapping("/{id}")      Account patch(@PathVariable long id, @RequestBody Map<String,Object> c) { ... }
    @DeleteMapping("/{id}")     void close(@PathVariable long id)            { ... }
    @PostMapping("/{id}/lock")  void lock(@PathVariable long id)            { ... }   // action as sub-resource
}

// OUTPUT:
// one resource, five verbs, plus an action expressed as POST on a sub-resource`],
        [`<p>Mistakes with verbs:</p><ul><li><b>POST for reads</b> (breaks caching).</li><li><b>GET for changes</b> (crawlers trigger them).</li><li><b>Verbs in URLs</b> like <code>/getUsers</code>.</li><li><b>CORS:</b> a browser preflight sends OPTIONS; if CORS is not configured, the real PUT or DELETE is blocked.</li><li><b>Security config:</b> rules written only for GET leave other verbs open.</li></ul>`,
            r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a
        .requestMatchers(HttpMethod.GET, "/items/**").permitAll()
        .requestMatchers(HttpMethod.DELETE, "/items/**").hasRole("ADMIN")
        .anyRequest().authenticated());
    return http.build();
}

// OUTPUT:
// anonymous GET /items/1 -> 200; anonymous DELETE /items/1 -> 401`],
        [`<p>Performance notes:</p><ul><li><b>GET caching</b> gives the biggest gain: browsers, CDNs and proxies reuse responses.</li><li><b>HEAD</b> lets clients check size or existence cheaply.</li><li><b>Preflight cache:</b> <code>Access-Control-Max-Age</code> reduces OPTIONS calls.</li></ul>`,
            r`@Bean
WebMvcConfigurer cors() {
    return new WebMvcConfigurer() {
        @Override public void addCorsMappings(CorsRegistry r) {
            r.addMapping("/api/**")
             .allowedOrigins("https://app.example.com")
             .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE")
             .maxAge(3600);
        }
    };
}

// OUTPUT:
// preflight OPTIONS answered once per hour per URL by the browser cache`],
        [`<p>Scenario: a front end gets a CORS error only on DELETE. The cause is a missing method in <code>allowedMethods</code>. Reading the OPTIONS response (Allow and Access-Control-Allow-Methods headers) shows it at once.</p>`,
            r`@Test
void preflightAllowsDelete() throws Exception {
    mvc.perform(options("/api/items/1")
            .header("Origin", "https://app.example.com")
            .header("Access-Control-Request-Method", "DELETE"))
       .andExpect(status().isOk())
       .andExpect(header().exists("Access-Control-Allow-Methods"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),

    'mvc-mapping-url-paths': dv(
        [`<p>How paths are matched:</p><ul><li><b>Parser:</b> <code>PathPatternParser</code> compiles each pattern into a chain of nodes (literal, variable, wildcard) at startup.</li><li><b>Request:</b> the path is parsed into segments once (<code>RequestPath</code>) and matched against the chain.</li><li><b>Order:</b> <code>PathPattern.SPECIFICITY_COMPARATOR</code> ranks fewer wildcards and variables as more specific.</li><li><b>Variables:</b> captured values are stored as a request attribute and then converted by the <code>ConversionService</code>.</li></ul>`,
            r`PathPatternParser parser = new PathPatternParser();
PathPattern p = parser.parse("/users/{id}/orders/*");
PathContainer path = PathContainer.parsePath("/users/42/orders/7");
PathPattern.PathMatchInfo info = p.matchAndExtract(path);
System.out.println(info.getUriVariables());

// OUTPUT:
// {id=42}`],
        [`<p>Pattern options:</p><ul><li><b>Literal:</b> <code>/about</code>.</li><li><b>Variable:</b> <code>/users/{id}</code>.</li><li><b>Regex variable:</b> <code>/users/{id:[0-9]+}</code>.</li><li><b>Single segment wildcard:</b> <code>/a/*/c</code>.</li><li><b>Capture rest:</b> <code>/files/{*path}</code> puts the remaining path in a variable.</li><li><b>Trailing wildcard:</b> <code>/static/**</code>.</li><li><b>Optional name:</b> <code>@PathVariable(required = false)</code> with two mappings.</li></ul>`,
            r`@GetMapping("/files/{*path}")
String file(@PathVariable String path) { return "path=" + path; }

@GetMapping({"/blog", "/blog/{slug}"})
String blog(@PathVariable(required = false) String slug) {
    return slug == null ? "blog index" : "post " + slug;
}

// OUTPUT:
// GET /files/a/b/c.txt -> path=/a/b/c.txt
// GET /blog            -> blog index
// GET /blog/hello      -> post hello`],
        [`<p>Mistakes with paths:</p><ul><li><b>Variable name mismatch:</b> <code>{id}</code> with <code>@PathVariable String userId</code> fails unless you name it or compile with <code>-parameters</code>.</li><li><b>Dots in variables:</b> a value like <code>a.b</code> is kept in Spring 6 (suffix matching is off), but old code relied on extension stripping.</li><li><b>Encoded slash:</b> <code>%2F</code> is rejected by Tomcat by default.</li><li><b>Pattern after **:</b> <code>/a/**/b</code> is not allowed with PathPatternParser.</li><li><b>Trailing slash:</b> mapping and call must agree.</li></ul>`,
            r`// WRONG: name mismatch without -parameters
@GetMapping("/users/{id}")
String a(@PathVariable String userId) { return userId; }

// FIX
@GetMapping("/users/{id}")
String a(@PathVariable("id") String userId) { return userId; }

// OUTPUT:
// before: IllegalArgumentException (name not specified)
// after: GET /users/5 -> 5`],
        [`<p>Performance and design:</p><ul><li><b>Prefer literals:</b> exact paths use a direct map lookup.</li><li><b>Avoid broad patterns</b> like <code>/{a}/{b}</code> at the root; they match too much and slow ranking.</li><li><b>Short stable URLs:</b> nouns, plural, lowercase, hyphens.</li><li><b>Pre-parsed patterns:</b> do not build a <code>PathPattern</code> per request in your own code.</li></ul>`,
            r`// Keep wildcard handlers last and narrow
@GetMapping("/assets/**")    // static-like content
String assets() { return "asset"; }

// OUTPUT:
// /assets/css/app.css -> asset
// specific routes such as /assets/version still win if declared`],
        [`<p>Scenario: a documentation site serves pages at <code>/docs/{section}/{page}</code> and a single download handler for any file under <code>/downloads</code>. Regex limits sections to known names so typos give a clean 404 and not a database call.</p>`,
            r`@GetMapping("/docs/{section:guide|api|faq}/{page}")
String doc(@PathVariable String section, @PathVariable String page) {
    return section + "/" + page;
}

// OUTPUT:
// GET /docs/api/intro  -> api/intro
// GET /docs/blog/intro -> 404`]
    ),

    'mvc-class-level-mapping': dv(
        [`<p>How class and method are merged:</p><ul><li><b>Build:</b> <code>RequestMappingHandlerMapping.getMappingForMethod</code> creates info for the method, then the type-level info, and returns <code>typeInfo.combine(methodInfo)</code>.</li><li><b>Paths:</b> combined with the pattern parser, so one slash is placed between parts.</li><li><b>Other conditions:</b> methods and params are unioned; consumes and produces on the method override the class.</li><li><b>Prefix:</b> a configured global prefix is applied last.</li></ul>`,
            r`@RestController
@RequestMapping("/shop")
class ShopController {
    @GetMapping("/items")      String items() { return "items"; }   // /shop/items
    @GetMapping("items/{id}")  String item()  { return "item"; }    // /shop/items/{id}
    @GetMapping                String home()  { return "home"; }    // /shop
}

// OUTPUT:
// GET /shop -> home
// GET /shop/items -> items
// GET /shop/items/9 -> item`],
        [`<p>Options at class level:</p><ul><li><b>path:</b> one or several base paths.</li><li><b>produces / consumes:</b> default media types.</li><li><b>headers / params:</b> a condition for the whole controller.</li><li><b>method:</b> a default verb (rare).</li><li><b>Interfaces:</b> mapping annotations on a controller interface are inherited by implementations in Spring 5.1 and later.</li></ul>`,
            r`@RequestMapping("/v1/reports")
interface ReportApi {
    @GetMapping("/{id}") String get(@PathVariable long id);
}

@RestController
class ReportController implements ReportApi {
    public String get(long id) { return "report " + id; }
}

// OUTPUT:
// GET /v1/reports/2 -> report 2`],
        [`<p>Mistakes with class-level mapping:</p><ul><li><b>Double prefix:</b> class has <code>/api/users</code> and a global prefix <code>/api</code> adds it again, giving <code>/api/api/users</code>.</li><li><b>Duplicate paths:</b> two controllers share the same base and the same method path.</li><li><b>Class method condition:</b> a class-level <code>method = GET</code> blocks POST handlers inside it.</li><li><b>Expecting inheritance of class paths in security rules:</b> rules must use the full path.</li></ul>`,
            r`// WRONG: class limited to GET, so this POST is never matched
@RequestMapping(path = "/notes", method = RequestMethod.GET)
class Notes {
    @PostMapping String add() { return "x"; }
}

// FIX: remove method from the class
@RequestMapping("/notes")
class Notes {
    @PostMapping String add() { return "x"; }
}

// OUTPUT:
// before: POST /notes -> 405   after: POST /notes -> x`],
        [`<p>Performance and structure:</p><ul><li><b>No runtime cost:</b> the merge is done at startup.</li><li><b>Cohesion:</b> one controller per resource with one base path keeps classes small.</li><li><b>Versions:</b> use separate packages or classes per API version.</li></ul>`,
            r`// one controller per resource
@RequestMapping("/api/v2/customers") class CustomerController { }
@RequestMapping("/api/v2/orders")    class OrderController    { }

// OUTPUT:
// startup log:
// Mapped "{[/api/v2/customers]}" ... Mapped "{[/api/v2/orders]}" ...`],
        [`<p>Scenario: a team moves an API from <code>/api/v1</code> to <code>/api/v2</code> for a few resources. Each v2 controller declares its own class-level path, so v1 clients keep working. A MockMvc test for each version guards against accidental breaks.</p>`,
            r`@WebMvcTest({UserV1Controller.class, UserV2Controller.class})
class VersionTest {
    @Autowired MockMvc mvc;

    @Test
    void bothVersionsServed() throws Exception {
        mvc.perform(get("/api/v1/users/1")).andExpect(status().isOk());
        mvc.perform(get("/api/v2/users/1")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    )
};
