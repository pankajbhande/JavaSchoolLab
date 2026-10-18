// Spring extras, batch smvc32 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc32Extras: Record<string, Extra> = {
    'mvc-spring-mvc-ajax-requests': x(
        ['<b>AJAX</b> means the browser calls the server in the background with JavaScript and updates part of the page, with no full reload; Spring MVC serves it with ordinary controllers that return data instead of a view name.',
            '<b>@ResponseBody</b> (or <code>@RestController</code>) tells Spring to write the return value straight into the HTTP response body instead of resolving a view.',
            '<b>Request side</b>: <code>@RequestBody</code> reads a JSON body, while <code>@RequestParam</code> and <code>@PathVariable</code> read query and path values.'],
        ['<b>HttpMessageConverter</b>: Jackson (<code>MappingJackson2HttpMessageConverter</code>) turns objects to JSON and back, chosen by the <code>Accept</code> and <code>Content-Type</code> headers.',
            '<b>Detecting AJAX</b>: libraries often send <code>X-Requested-With: XMLHttpRequest</code>; <code>fetch</code> does not, so prefer content negotiation over header sniffing.',
            '<b>Status codes</b>: return <code>ResponseEntity</code> so the client sees 201, 400 or 404 and can react.'],
        ['<b>Error handling</b>: use <code>@RestControllerAdvice</code> so failed AJAX calls get a JSON error body, not an HTML error page.',
            '<b>CSRF</b>: with Spring Security, AJAX POST calls must send the CSRF token header, or they get 403.',
            '<b>Caching and size</b>: set <code>Cache-Control</code> for read endpoints and return only the fields the page needs.'],
        [['F', 'What is AJAX?', 'A way for the browser to call the server in the background and update part of the page without reloading it.'],
            ['F', 'What does @ResponseBody do?', 'It writes the returned object into the response body, usually as JSON, instead of choosing a view.'],
            ['M', 'How does Spring convert an object to JSON?', 'An HttpMessageConverter, normally Jackson, serializes it based on the Accept header.'],
            ['M', 'Difference between @Controller and @RestController?', '@RestController is @Controller plus @ResponseBody on every method.'],
            ['S', 'Why does an AJAX POST fail with 403 under Spring Security?', 'The CSRF token is missing; send it in a header such as X-CSRF-TOKEN.'],
            ['S', 'How do you return a JSON error for AJAX calls?', 'Use @RestControllerAdvice with @ExceptionHandler methods that return ResponseEntity with a body.']],
        [['A controller that serves AJAX.',
            r`@RestController
@RequestMapping("/api")
public class GreetingController {
    @GetMapping("/greet")
    public Map<String, String> greet(@RequestParam String name) {
        return Map.of("message", "Hello " + name);
    }
}
// Browser: fetch('/api/greet?name=Abaji').then(r => r.json())

// OUTPUT:
// HTTP/1.1 200
// Content-Type: application/json
// {"message":"Hello Abaji"}`],
            ['Test it with MockMvc.',
                r`@WebMvcTest(GreetingController.class)
class GreetingControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void greets() throws Exception {
        mvc.perform(get("/api/greet").param("name", "Abaji"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.message").value("Hello Abaji"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]],
        [['Return 201 with a body.',
            r`@PostMapping("/notes")
public ResponseEntity<Note> add(@RequestBody Note n) {
    Note saved = service.save(n);
    URI uri = URI.create("/api/notes/" + saved.id());
    return ResponseEntity.created(uri).body(saved);
}

// OUTPUT:
// HTTP/1.1 201
// Location: /api/notes/7
// {"id":7,"text":"buy milk"}`],
            ['One controller for pages and AJAX.',
                r`@Controller
public class PageController {
    @GetMapping("/notes")
    public String page() { return "notes"; }       // view name

    @GetMapping("/notes/data")
    @ResponseBody
    public List<String> data() { return List.of("a", "b"); }  // JSON
}

// OUTPUT:
// GET /notes       -> HTML page rendered from notes.html
// GET /notes/data  -> ["a","b"]`]]
    ),
    'mvc-json-ajax': x(
        ['<b>JSON</b> (JavaScript Object Notation) is the text format AJAX calls use to exchange data: objects in braces, arrays in brackets, keys in double quotes.',
            '<b>Jackson</b> is the library Spring uses to turn Java objects (records, POJOs) into JSON and back.',
            '<b>Headers</b>: send <code>Content-Type: application/json</code> with a request body and <code>Accept: application/json</code> to ask for JSON.'],
        ['<b>@RequestBody</b> binds the JSON body to a Java object; a malformed body gives 400 (<code>HttpMessageNotReadableException</code>).',
            '<b>Field control</b>: <code>@JsonProperty</code> renames, <code>@JsonIgnore</code> hides and <code>@JsonFormat</code> sets the date pattern.',
            '<b>Dates</b>: Jackson in Spring Boot writes <code>java.time</code> types as ISO strings when <code>WRITE_DATES_AS_TIMESTAMPS</code> is off, which is the Boot default.'],
        ['<b>Never expose entities</b> directly: use DTOs, so lazy relations and internal fields do not leak or cause loops.',
            '<b>Unknown fields</b>: Boot sets <code>FAIL_ON_UNKNOWN_PROPERTIES</code> to false, so extra JSON keys are ignored silently.',
            '<b>Security</b>: never enable default typing for untrusted JSON; it allows gadget attacks.'],
        [['F', 'What is JSON?', 'A light text format for data made of objects, arrays, strings, numbers, booleans and null.'],
            ['F', 'Which annotation reads a JSON body?', '@RequestBody.'],
            ['M', 'How do you rename a field in JSON output?', 'Put @JsonProperty("new_name") on the field or accessor.'],
            ['M', 'What happens if the JSON is malformed?', 'Spring throws HttpMessageNotReadableException and answers 400 Bad Request.'],
            ['S', 'Why use DTOs instead of entities in JSON?', 'Entities can leak data, trigger lazy loading and create cyclic references; DTOs give a stable API contract.'],
            ['S', 'How do you customize Jackson in Boot?', 'Use spring.jackson.* properties, a Jackson2ObjectMapperBuilderCustomizer bean or your own ObjectMapper bean.']],
        [['Request and response JSON.',
            r`public record Task(String title, boolean done) {}

@RestController
public class TaskController {
    @PostMapping("/tasks")
    public Task create(@RequestBody Task t) {
        return new Task(t.title().toUpperCase(), t.done());
    }
}
// curl -X POST -H "Content-Type: application/json"
//      -d '{"title":"read","done":false}' /tasks

// OUTPUT:
// {"title":"READ","done":false}`],
            ['Customize field names.',
                r`public class UserDto {
    @JsonProperty("user_name") private String userName;
    @JsonIgnore private String password;
    @JsonFormat(pattern = "yyyy-MM-dd") private LocalDate joined;
    // getters and setters omitted
}

// OUTPUT:
// {"user_name":"abaji","joined":"2025-01-15"}`]],
        [['Parse JSON by hand with ObjectMapper.',
            r`ObjectMapper om = new ObjectMapper();
Task t = om.readValue("{\"title\":\"a\",\"done\":true}", Task.class);
String json = om.writeValueAsString(t);
System.out.println(t + " " + json);

// OUTPUT:
// Task[title=a, done=true] {"title":"a","done":true}`],
            ['Test JSON with MockMvc.',
                r`mvc.perform(post("/tasks")
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"title\":\"read\",\"done\":false}"))
   .andExpect(status().isOk())
   .andExpect(jsonPath("$.title").value("READ"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-fetch-api': x(
        ['<b>fetch</b> is the built-in browser function for HTTP calls; it returns a Promise that resolves to a <code>Response</code> object.',
            '<b>Basic call</b>: <code>fetch(url).then(r =&gt; r.json())</code>, or with <code>async/await</code>: <code>const data = await (await fetch(url)).json()</code>.',
            '<b>Options</b>: the second argument sets <code>method</code>, <code>headers</code> and <code>body</code>, for example <code>JSON.stringify(obj)</code> for a POST.'],
        ['<b>Errors</b>: <code>fetch</code> rejects only on network failure; a 404 or 500 still resolves, so check <code>response.ok</code> yourself.',
            '<b>Cookies</b>: same-origin requests send cookies by default in modern browsers; for cross-origin use <code>credentials: &quot;include&quot;</code>.',
            '<b>CORS</b>: a call to another origin needs the server to allow it, for example with <code>@CrossOrigin</code> or a <code>CorsConfigurationSource</code>.'],
        ['<b>Timeouts</b>: fetch has none built in; use <code>AbortController</code> with <code>signal</code> to cancel slow calls.',
            '<b>CSRF</b>: send the token in a header such as <code>X-CSRF-TOKEN</code> on POST, PUT and DELETE.',
            '<b>Preflight</b>: a JSON POST to another origin triggers an <code>OPTIONS</code> request first, and the server must answer it.'],
        [['F', 'What does fetch return?', 'A Promise that resolves to a Response object.'],
            ['F', 'How do you read JSON from a response?', 'Call response.json(), which returns another Promise.'],
            ['M', 'Does fetch reject on HTTP 404?', 'No. It rejects only on network errors, so check response.ok or response.status.'],
            ['M', 'How do you send JSON with fetch?', 'Set method POST, header Content-Type application/json and body JSON.stringify(obj).'],
            ['S', 'How do you cancel or time out a fetch?', 'Pass an AbortController signal and call abort(), for example from setTimeout.'],
            ['S', 'Why does a cross-origin fetch fail in the browser?', 'The server did not send the right CORS headers; configure CORS on the Spring side.']],
        [['GET with async/await.',
            r`async function loadUsers() {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const users = await res.json();
    console.log(users.map(u => u.name));
}
loadUsers();

// OUTPUT:
// [ 'Abaji', 'Raoji' ]`],
            ['POST JSON.',
                r`const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Mina' })
});
console.log(res.status, await res.json());

// OUTPUT:
// 201 { id: 3, name: 'Mina' }`]],
        [['Timeout with AbortController.',
            r`const ctl = new AbortController();
const timer = setTimeout(() => ctl.abort(), 3000);
try {
    const res = await fetch('/api/slow', { signal: ctl.signal });
    console.log(res.status);
} catch (e) {
    console.log(e.name);
} finally {
    clearTimeout(timer);
}

// OUTPUT: (when the server takes longer than 3 seconds)
// AbortError`],
            ['The Spring endpoint it calls.',
                r`@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserApi {
    @PostMapping
    public ResponseEntity<User> add(@RequestBody User u) {
        return ResponseEntity.status(201).body(service.save(u));
    }
}

// OUTPUT:
// HTTP/1.1 201 with {"id":3,"name":"Mina"}`]]
    ),
    'mvc-jquery-ajax': x(
        ['<b>jQuery AJAX</b> is the older library way to call the server: <code>$.ajax()</code>, plus shortcuts <code>$.get()</code>, <code>$.post()</code> and <code>$.getJSON()</code>.',
            '<b>Callbacks</b>: <code>success</code> runs on a good response, <code>error</code> on failure and <code>complete</code> always; modern code chains <code>.done()</code> and <code>.fail()</code>.',
            '<b>Spring side</b> is the same as for any AJAX client: a controller method with <code>@ResponseBody</code> or a <code>@RestController</code>.'],
        ['<b>JSON body</b>: set <code>contentType: &quot;application/json&quot;</code> and <code>data: JSON.stringify(obj)</code>; otherwise jQuery sends form-encoded data.',
            '<b>dataType</b> tells jQuery how to parse the reply (<code>json</code>, <code>html</code>, <code>text</code>).',
            '<b>Form data</b>: <code>$(form).serialize()</code> sends fields as <code>name=value</code> pairs that bind with <code>@ModelAttribute</code> or <code>@RequestParam</code>.'],
        ['<b>CSRF setup</b>: read the token from a meta tag and add it with <code>$.ajaxSetup</code> or <code>beforeSend</code>.',
            '<b>Legacy</b>: new projects usually pick <code>fetch</code>; jQuery is still common in older Spring MVC and JSP apps.',
            '<b>Caching</b>: IE-era GET caching is gone, but <code>cache: false</code> appends a timestamp parameter if you need it.'],
        [['F', 'What is $.ajax?', 'The main jQuery function for sending an asynchronous HTTP request.'],
            ['F', 'Name two jQuery shortcut methods.', '$.get and $.post (also $.getJSON).'],
            ['M', 'Why does Spring return 415 for my jQuery POST?', 'jQuery sent form-encoded data; set contentType application/json and stringify the body for @RequestBody.'],
            ['M', 'What does dataType do?', 'It tells jQuery how to parse the response, such as json or html.'],
            ['S', 'How do you add the CSRF token to every jQuery call?', 'Use $.ajaxSetup with a beforeSend that sets the CSRF header from a meta tag.'],
            ['S', 'jQuery or fetch for a new app?', 'fetch, because it is built in and promise based; keep jQuery only when the project already uses it.']],
        [['GET and POST with jQuery.',
            r`$.getJSON('/api/users', function (users) {
    console.log(users.length + ' users');
});
$.ajax({
    url: '/api/users',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ name: 'Mina' }),
    success: function (u) { console.log('created ' + u.id); },
    error: function (xhr) { console.log('failed ' + xhr.status); }
});

// OUTPUT:
// 2 users
// created 3`],
            ['Promise-style handlers.',
                r`$.post('/api/notes', { text: 'milk' })
    .done(function (n) { console.log('saved', n.id); })
    .fail(function (xhr) { console.log('error', xhr.status); })
    .always(function () { console.log('finished'); });

// OUTPUT:
// saved 5
// finished`]],
        [['Controller for the form-encoded call above.',
            r`@PostMapping("/api/notes")
@ResponseBody
public Note add(@RequestParam String text) {
    return service.save(text);
}

// OUTPUT:
// HTTP/1.1 200
// {"id":5,"text":"milk"}`],
            ['Serialize a form and send it.',
                r`$('#contactForm').on('submit', function (e) {
    e.preventDefault();
    $.post('/contact', $(this).serialize(), function (res) {
        $('#msg').text(res.message);
    });
});

// OUTPUT:
// #msg shows: Thank you, Abaji`]]
    ),
    'mvc-asynchronous-form-submission': x(
        ['<b>Asynchronous form submission</b> means sending the form data with JavaScript in the background and showing the result on the same page, with no full reload.',
            '<b>Steps</b>: listen for the <code>submit</code> event, call <code>preventDefault()</code>, collect the fields (<code>FormData</code>), send them, and show the reply or the errors.',
            '<b>Server side</b>: a normal handler with <code>@Valid</code>; on errors it returns 400 and a JSON list of field errors instead of re-rendering the form.'],
        ['<b>FormData</b> sends <code>multipart/form-data</code> and supports file upload; to send JSON instead, convert with <code>Object.fromEntries(new FormData(form))</code>.',
            '<b>Validation</b>: <code>@Valid</code> with a <code>BindingResult</code> or a <code>MethodArgumentNotValidException</code> handler gives field names and messages.',
            '<b>Feedback</b>: disable the submit button during the call to stop double submits, and show a success or error message.'],
        ['<b>Server is the authority</b>: client checks help the user, but always validate again in Spring.',
            '<b>Progressive enhancement</b>: keep a working normal POST form and add JavaScript on top, so it still works without scripts.',
            '<b>Idempotency</b>: protect against duplicate submits with a token or a unique constraint, since users retry on slow networks.'],
        [['F', 'Why call preventDefault on submit?', 'To stop the browser from doing the normal full-page submit so JavaScript can send the data.'],
            ['F', 'What is FormData?', 'A browser object that collects form fields, including files, for sending.'],
            ['M', 'How do you return validation errors to an AJAX form?', 'Return 400 with a JSON body of field names and messages, built in an exception handler.'],
            ['M', 'How do you send a file asynchronously?', 'Use FormData as the body and bind it with MultipartFile or @RequestPart.'],
            ['S', 'How do you stop double submissions?', 'Disable the button while pending and use a server side unique check or idempotency key.'],
            ['S', 'What happens to the CSRF token in an AJAX form?', 'It must still be sent, as a hidden field in FormData or as a header.']],
        [['Client script.',
            r`form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch('/register', {
        method: 'POST',
        body: new FormData(form)
    });
    const out = await res.json();
    msg.textContent = res.ok ? 'Welcome ' + out.name : out.errors.join(', ');
});

// OUTPUT:
// On success: Welcome Abaji
// On error:   email must be valid`],
            ['Server with validation.',
                r`public record Reg(@NotBlank String name, @Email String email) {}

@PostMapping("/register")
public ResponseEntity<?> register(@Valid Reg reg, BindingResult br) {
    if (br.hasErrors()) {
        List<String> errs = br.getFieldErrors().stream()
            .map(f -> f.getField() + " " + f.getDefaultMessage()).toList();
        return ResponseEntity.badRequest().body(Map.of("errors", errs));
    }
    return ResponseEntity.ok(Map.of("name", reg.name()));
}

// OUTPUT:
// 400 {"errors":["email must be a well-formed email address"]}`]],
        [['Global handler for JSON bodies.',
            r`@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> invalid(
            MethodArgumentNotValidException ex) {
        Map<String, String> m = new LinkedHashMap<>();
        ex.getFieldErrors().forEach(f -> m.put(f.getField(), f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(m);
    }
}

// OUTPUT:
// 400 {"name":"must not be blank"}`],
            ['Test the failing case.',
                r`mvc.perform(post("/register").param("name", "").param("email", "bad"))
   .andExpect(status().isBadRequest())
   .andExpect(jsonPath("$.errors").isArray());

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),
    'mvc-dynamic-page-updates': x(
        ['<b>Dynamic page updates</b> mean changing part of the visible page, such as a list or a message, after an AJAX call, without loading a new page.',
            '<b>Two styles</b>: the server returns JSON and JavaScript builds the HTML, or the server returns an HTML fragment (for example a Thymeleaf fragment) that is inserted into the page.',
            '<b>DOM update</b>: use <code>element.textContent</code> for plain text and <code>innerHTML</code> only for trusted markup.'],
        ['<b>Fragment return</b>: a controller can return <code>&quot;items :: list&quot;</code> to render just one Thymeleaf fragment as the response.',
            '<b>Partial refresh</b>: after a POST, re-fetch the list or append the returned item, so the page matches the server.',
            '<b>Loading state</b>: show a spinner or disabled state, and handle failures with a visible message.'],
        ['<b>XSS</b>: never put server or user text into <code>innerHTML</code> unescaped; use <code>textContent</code> or escape the data.',
            '<b>Polling or push</b>: for live data use timed polling, Server-Sent Events (<code>SseEmitter</code>) or WebSocket.',
            '<b>Back button and URLs</b>: updates by AJAX do not change the URL; use the History API when state should be linkable.'],
        [['F', 'What is a dynamic page update?', 'Changing part of a page with JavaScript after data arrives from the server, with no reload.'],
            ['F', 'textContent or innerHTML for plain text?', 'textContent, because it does not parse HTML.'],
            ['M', 'How can Spring return only part of a page?', 'Return a Thymeleaf fragment selector such as "items :: list" from the controller.'],
            ['M', 'JSON or HTML fragment: which is better?', 'JSON keeps the API reusable; fragments keep rendering on the server and need less JavaScript.'],
            ['S', 'How do you avoid XSS when updating the DOM?', 'Insert user data with textContent or escape it; never concatenate it into innerHTML.'],
            ['S', 'How can the server push updates to a page?', 'Use SseEmitter for Server-Sent Events or WebSocket/STOMP.']],
        [['Append a returned item.',
            r`async function addItem(text) {
    const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    const item = await res.json();
    const li = document.createElement('li');
    li.textContent = item.text;            // safe against XSS
    document.getElementById('list').appendChild(li);
}

// OUTPUT:
// The list gets a new <li>milk</li> without a reload`],
            ['Return a Thymeleaf fragment.',
                r`@GetMapping("/items/fragment")
public String fragment(Model model) {
    model.addAttribute("items", service.all());
    return "items :: list";        // renders only th:fragment="list"
}
// Client: list.innerHTML = await (await fetch('/items/fragment')).text();

// OUTPUT:
// <ul><li>milk</li><li>eggs</li></ul>`]],
        [['The fragment itself.',
            r`<!-- items.html -->
<ul th:fragment="list">
    <li th:each="i : #{items}" th:text="#{i}">item</li>
</ul>
<!-- the real file uses a variable expression for the item collection -->

// OUTPUT:
// Only the ul element is sent when the selector items :: list is used`],
            ['Server-Sent Events for live updates.',
                r`@GetMapping(path = "/stream", produces = "text/event-stream")
public SseEmitter stream() {
    SseEmitter em = new SseEmitter(60_000L);
    executor.submit(() -> {
        try {
            em.send("tick");
            em.complete();
        }
        catch (IOException e) { em.completeWithError(e); }
    });
    return em;
}
// Client: new EventSource('/stream').onmessage = e => log(e.data);

// OUTPUT:
// data:tick`]]
    ),
    'mvc-rest-api-integration': x(
        ['<b>REST API integration</b> means a page, or a Spring service, consuming JSON endpoints over HTTP: GET to read, POST to create, PUT or PATCH to update, DELETE to remove.',
            '<b>From the browser</b>: JavaScript calls the REST endpoints with <code>fetch</code>; the Spring MVC app can serve both the page and the API.',
            '<b>From Spring</b>: server code calls other APIs with <code>RestClient</code> (Spring 6.1+), <code>WebClient</code> or the older <code>RestTemplate</code>.'],
        ['<b>Verbs and codes</b>: GET 200, POST 201, DELETE 204, bad input 400, missing 404; map each to the right <code>@GetMapping</code>, <code>@PostMapping</code> and so on.',
            '<b>RestClient</b>: build it once, then <code>.get().uri(...).retrieve().body(Type.class)</code>; it throws <code>RestClientResponseException</code> on 4xx and 5xx.',
            '<b>Serialization</b>: the same Jackson converters handle request and response bodies on both client and server side.'],
        ['<b>Resilience</b>: set connect and read timeouts, add retries with backoff and a circuit breaker (for example Resilience4j) for remote APIs.',
            '<b>Security</b>: pass tokens in the <code>Authorization</code> header and never log them; secure the API with Spring Security.',
            '<b>Contract</b>: document the API (OpenAPI) and test integrations with <code>MockRestServiceServer</code> or WireMock.'],
        [['F', 'What is a REST API?', 'An HTTP interface where URLs name resources and verbs like GET and POST say what to do, usually with JSON.'],
            ['F', 'Which status code means created?', '201 Created, often with a Location header.'],
            ['M', 'How does a Spring app call another REST API?', 'With RestClient, WebClient or RestTemplate, which use the same HttpMessageConverters.'],
            ['M', 'PUT or PATCH?', 'PUT replaces the whole resource; PATCH changes only the fields sent.'],
            ['S', 'How do you make remote calls resilient?', 'Set timeouts, retry transient failures with backoff and use a circuit breaker.'],
            ['S', 'How do you test code that calls a remote API?', 'Use MockRestServiceServer for RestClient or RestTemplate, or WireMock for a fake server.']],
        [['CRUD controller.',
            r`@RestController
@RequestMapping("/api/books")
public class BookApi {
    @GetMapping("/{id}")
    public Book get(@PathVariable long id) { return repo.findById(id).orElseThrow(); }

    @PostMapping
    public ResponseEntity<Book> add(@RequestBody Book b) {
        return ResponseEntity.status(201).body(repo.save(b));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable long id) { repo.deleteById(id); }
}

// OUTPUT:
// GET /api/books/1    -> 200 {"id":1,"title":"Java"}
// DELETE /api/books/1 -> 204`],
            ['Call a remote API with RestClient.',
                r`RestClient client = RestClient.builder()
    .baseUrl("https://api.example.com").build();

Book b = client.get().uri("/books/{id}", 1)
    .retrieve()
    .body(Book.class);
System.out.println(b.title());

// OUTPUT: (varies with the remote data)
// Java`]],
        [['Handle remote errors.',
            r`try {
    client.get().uri("/books/999").retrieve().body(Book.class);
} catch (RestClientResponseException e) {
    System.out.println(e.getStatusCode() + " " + e.getResponseBodyAsString());
}

// OUTPUT:
// 404 NOT_FOUND {"error":"no such book"}`],
            ['Test with MockRestServiceServer.',
                r`RestClient.Builder b = RestClient.builder();
MockRestServiceServer server = MockRestServiceServer.bindTo(b).build();
server.expect(requestTo("/books/1"))
      .andRespond(withSuccess("{\"id\":1,\"title\":\"Java\"}",
                              MediaType.APPLICATION_JSON));
Book book = b.build().get().uri("/books/1").retrieve().body(Book.class);

// OUTPUT:
// book.title() equals "Java"; server.verify() passes`]]
    ),
    'mvc-thymeleaf-introduction': x(
        ['<b>Thymeleaf</b> is a server-side Java template engine that turns HTML templates plus model data into the final page; templates stay valid HTML that opens in a browser.',
            '<b>th: attributes</b> add the logic to normal tags, for example <code>th:text</code> to set text, <code>th:each</code> to loop and <code>th:if</code> to show conditionally.',
            '<b>Flow</b>: the controller puts data in the <code>Model</code> and returns a view name; Thymeleaf finds the template and renders HTML.'],
        ['<b>Expressions</b>: variable <code>$&#123;...&#125;</code>, selection <code>*&#123;...&#125;</code>, message <code>#&#123;...&#125;</code>, link <code>@&#123;...&#125;</code> and fragment <code>~&#123;...&#125;</code>.',
            '<b>Natural templates</b>: the placeholder text inside a tag shows when the file is opened directly and is replaced when rendered by the server.',
            '<b>Escaping</b>: <code>th:text</code> escapes HTML, while <code>th:utext</code> does not and is a risk with user data.'],
        ['<b>Versus JSP</b>: Thymeleaf needs no servlet container to preview and is the Spring Boot default, while JSP support in Boot is limited.',
            '<b>Layouts</b>: reuse parts with <code>th:fragment</code> and <code>th:replace</code>, or with the Layout Dialect add-on.',
            '<b>Security</b>: the Spring Security dialect gives <code>sec:authorize</code> and CSRF hidden fields in forms using <code>th:action</code>.'],
        [['F', 'What is Thymeleaf?', 'A server-side template engine that renders HTML pages from templates and model data.'],
            ['F', 'Which attribute prints a value?', 'th:text.'],
            ['M', 'Difference between th:text and th:utext?', 'th:text escapes HTML characters; th:utext outputs raw HTML and can cause XSS.'],
            ['M', 'What are natural templates?', 'Templates that remain valid HTML and show sample content in a browser without a server.'],
            ['S', 'Why is Thymeleaf preferred over JSP in Spring Boot?', 'It works in an executable jar, previews statically and has first-class Boot support.'],
            ['S', 'What does th:action add to a form?', 'It resolves the URL with context path and, with Spring Security, adds the CSRF hidden field.']],
        [['Controller and template.',
            r`@Controller
public class HomeController {
    @GetMapping("/hello")
    public String hello(Model model) {
        model.addAttribute("name", "Abaji");
        return "hello";          // resolves templates/hello.html
    }
}

// OUTPUT:
// GET /hello renders src/main/resources/templates/hello.html`],
            ['A template with loop and condition.',
                r`<ul>
    <li th:each="c : #{courses}" th:text="#{c}">Course</li>
</ul>
<p th:if="#{false}">hidden</p>
<a th:href="@{/hello(name='Raoji')}">link</a>
<!-- real templates use the dollar-brace variable expression for the model -->

// OUTPUT:
// <a href="/hello?name=Raoji">link</a>`]],
        [['Test the rendered view.',
            r`@WebMvcTest(HomeController.class)
class HomeControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void helloView() throws Exception {
        mvc.perform(get("/hello"))
           .andExpect(status().isOk())
           .andExpect(view().name("hello"))
           .andExpect(model().attribute("name", "Abaji"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`],
            ['Form binding.',
                r`<form th:action="@{/users}" th:object="#{user}" method="post">
    <input type="text" th:field="*{name}">
    <button type="submit">Save</button>
</form>
<!-- th:object normally takes the dollar-brace expression for the form bean -->

// OUTPUT:
// <input type="text" id="name" name="name" value="">`]]
    ),
    'mvc-thymeleaf-configuration': x(
        ['<b>Spring Boot auto-configures</b> Thymeleaf when <code>spring-boot-starter-thymeleaf</code> is on the classpath: no XML or manual beans are needed for a normal app.',
            '<b>Defaults</b>: templates live in <code>src/main/resources/templates</code>, use the <code>.html</code> suffix and are read as UTF-8.',
            '<b>Properties</b>: tune it with <code>spring.thymeleaf.*</code>, for example <code>spring.thymeleaf.cache=false</code> while developing.'],
        ['<b>Plain Spring MVC</b> (no Boot) needs three beans: <code>SpringResourceTemplateResolver</code>, <code>SpringTemplateEngine</code> and <code>ThymeleafViewResolver</code>.',
            '<b>Prefix and suffix</b>: <code>spring.thymeleaf.prefix</code> and <code>spring.thymeleaf.suffix</code> change where and what templates are found.',
            '<b>Template mode</b>: <code>HTML</code> is the default; <code>TEXT</code> and <code>JAVASCRIPT</code> modes render emails and scripts.'],
        ['<b>Cache</b>: keep caching on in production, because parsing templates on each request is slow.',
            '<b>Dialects</b>: add extras (Spring Security dialect, Layout Dialect, Java 8 time) by declaring them as beans or adding the dependency.',
            '<b>Check mode</b>: <code>spring.thymeleaf.check-template-location</code> warns when the templates folder is missing.'],
        [['F', 'Which starter adds Thymeleaf?', 'spring-boot-starter-thymeleaf.'],
            ['F', 'Where do templates go by default?', 'src/main/resources/templates.'],
            ['M', 'How do you turn off the template cache?', 'Set spring.thymeleaf.cache=false, usually in a dev profile.'],
            ['M', 'What beans does plain Spring MVC need?', 'A template resolver, a SpringTemplateEngine and a ThymeleafViewResolver.'],
            ['S', 'How do you add a custom dialect?', 'Declare it as a bean, which Boot registers on the template engine, or add it to a SpringTemplateEngine you build.'],
            ['S', 'Why is my template change not visible?', 'The template cache is on; disable it in dev or use devtools, and make sure the file is copied to target/classes.']],
        [['Boot configuration.',
            r`# application.properties
spring.thymeleaf.cache=false
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.thymeleaf.encoding=UTF-8
spring.thymeleaf.mode=HTML

# OUTPUT:
# Templates reload on each request;
view "home" maps to templates/home.html`],
            ['Manual configuration (no Boot).',
                r`@Configuration
public class ThymeleafConfig {
    @Bean
    public SpringResourceTemplateResolver resolver() {
        var r = new SpringResourceTemplateResolver();
        r.setPrefix("/WEB-INF/templates/");
        r.setSuffix(".html");
        r.setTemplateMode(TemplateMode.HTML);
        r.setCharacterEncoding("UTF-8");
        return r;
    }
    @Bean
    public SpringTemplateEngine engine(SpringResourceTemplateResolver r) {
        var e = new SpringTemplateEngine();
        e.setTemplateResolver(r);
        return e;
    }
    @Bean
    public ThymeleafViewResolver viewResolver(SpringTemplateEngine e) {
        var v = new ThymeleafViewResolver();
        v.setTemplateEngine(e);
        v.setCharacterEncoding("UTF-8");
        return v;
    }
}

// OUTPUT:
// View name "home" -> /WEB-INF/templates/home.html`]],
        [['Dependency.',
            r`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>

<!-- OUTPUT -->
<!-- Boot registers ThymeleafAutoConfiguration and the view resolver -->`],
            ['Profile based cache setting.',
                r`# application-dev.properties
spring.thymeleaf.cache=false

# application-prod.properties
spring.thymeleaf.cache=true

# OUTPUT:
# java -jar app.jar --spring.profiles.active=prod  uses cached templates`]]
    ),
    'mvc-template-resolution-thymeleaf': x(
        ['<b>Template resolution</b> is how Thymeleaf turns a view name such as <code>home</code> into a real template file, using the prefix, the name and the suffix.',
            '<b>Default result</b>: the view name <code>users/list</code> becomes <code>classpath:/templates/users/list.html</code>.',
            '<b>Who does it</b>: <code>ThymeleafViewResolver</code> picks the view, and the template engine asks its <b>template resolvers</b> to locate the file.'],
        ['<b>Resolver chain</b>: several resolvers can be added with an <code>order</code>; each can claim names by <code>resolvablePatterns</code> and pass the rest on.',
            '<b>Forms of a name</b>: a plain name uses the prefix and suffix; <code>redirect:</code> and <code>forward:</code> prefixes skip the template and issue a redirect or forward.',
            '<b>Fragments</b>: <code>&quot;file :: name&quot;</code> in a controller or <code>th:replace</code> resolves another template, then selects one fragment inside it.'],
        ['<b>Other sources</b>: resolvers exist for the classpath, the servlet context, files, URLs and even strings or a database.',
            '<b>Not found</b>: a missing file gives <code>TemplateInputException</code>, shown as a 500 error with the template name.',
            '<b>Case and path</b>: names are case-sensitive on Linux, so <code>Home</code> and <code>home</code> differ; keep one convention.'],
        [['F', 'What is template resolution?', 'Mapping a view name returned by a controller to the template file that renders it.'],
            ['F', 'Where does home resolve to in Boot?', 'classpath:/templates/home.html.'],
            ['M', 'Which component finds the file?', 'A template resolver such as SpringResourceTemplateResolver, used by the template engine.'],
            ['M', 'What does returning "redirect:/x" do?', 'It skips template resolution and sends an HTTP redirect to /x.'],
            ['S', 'How do you load some templates from a database?', 'Add a custom ITemplateResolver with a lower order that handles names by pattern.'],
            ['S', 'Why do I get TemplateInputException on Linux but not on Windows?', 'File names are case-sensitive on Linux, so the view name case must match the file exactly.']],
        [['Name to file mapping.',
            r`@Controller
public class ViewController {
    @GetMapping("/users")
    public String list() { return "users/list"; }

    @GetMapping("/old")
    public String old() { return "redirect:/users"; }
}

// OUTPUT:
// GET /users -> renders classpath:/templates/users/list.html
// GET /old   -> 302 Location: /users`],
            ['Render only a fragment.',
                r`@GetMapping("/users/rows")
public String rows(Model model) {
    model.addAttribute("users", service.all());
    return "users/list :: rows";     // file :: fragment name
}

// OUTPUT:
// Only the element marked th:fragment="rows" is returned`]],
        [['Two resolvers in a chain.',
            r`@Bean
public ClassLoaderTemplateResolver mailResolver() {
    var r = new ClassLoaderTemplateResolver();
    r.setPrefix("mail/");
    r.setSuffix(".html");
    r.setResolvablePatterns(Set.of("mail-*"));   // only names like mail-welcome
    r.setOrder(1);
    r.setCheckExistence(true);
    return r;
}

// OUTPUT:
// "mail-welcome" -> classpath mail/mail-welcome.html
// "home"         -> falls through to the default resolver`],
            ['Debug the resolved view.',
                r`mvc.perform(get("/users"))
   .andExpect(view().name("users/list"))
   .andExpect(forwardedUrl(null));      // rendered by Thymeleaf, no forward

// logging.level.org.thymeleaf=DEBUG shows lines such as:
// OUTPUT:
// Resolving template "users/list" with resolver SpringResourceTemplateResolver`]]
    )
};

export const smvc32Deep: Record<string, Deep> = {
    'mvc-spring-mvc-ajax-requests': dv(
        [`<p>An AJAX call is an ordinary HTTP request; only the response handling differs.</p><ul><li><b>Mapping:</b> <code>DispatcherServlet</code> finds the handler through <code>RequestMappingHandlerMapping</code>.</li><li><b>Arguments:</b> <code>RequestResponseBodyMethodProcessor</code> reads <code>@RequestBody</code> with a converter chosen by <code>Content-Type</code>.</li><li><b>Return value:</b> the same class writes the result when <code>@ResponseBody</code> is present, picking a converter by <code>Accept</code>.</li><li><b>No view:</b> the request is marked handled, so no <code>ViewResolver</code> runs.</li></ul>`,
            r`@RestController
public class PingController {
    @GetMapping(value = "/ping", produces = "application/json")
    public Map<String, Object> ping() {
        return Map.of("ok", true, "time", Instant.now().toString());
    }
}
// logging.level.org.springframework.web=DEBUG shows:
// Using 'application/json', given [*/*] and supported [application/json]

// OUTPUT: (varies)
// {"ok":true,"time":"2026-10-08T10:00:00Z"}`],
        [`<p>Ways to shape an AJAX endpoint:</p><ul><li><b>consumes / produces:</b> limit the media types a method accepts and returns.</li><li><b>ResponseEntity:</b> control status, headers and body.</li><li><b>@ResponseStatus:</b> a fixed status for simple cases.</li><li><b>Async return types:</b> <code>Callable</code>, <code>DeferredResult</code> or <code>CompletableFuture</code> free the request thread during slow work.</li><li><b>Streaming:</b> <code>StreamingResponseBody</code> and <code>SseEmitter</code> for large or live output.</li></ul>`,
            r`@PostMapping(value = "/convert",
        consumes = "application/json", produces = "application/json")
public CompletableFuture<Result> convert(@RequestBody Job job) {
    return CompletableFuture.supplyAsync(() -> service.run(job));
}

@GetMapping("/export")
public StreamingResponseBody export() {
    return out -> out.write("id,name\n1,Abaji\n".getBytes());
}

// OUTPUT:
// POST /convert (Content-Type: text/plain) -> 415 Unsupported Media Type
// GET /export -> id,name
//                1,Abaji`],
        [`<p>Typical mistakes:</p><ul><li><b>415 error:</b> the client sent the wrong <code>Content-Type</code>; set <code>application/json</code>.</li><li><b>406 error:</b> no converter can produce the <code>Accept</code> type.</li><li><b>HTML error page for AJAX:</b> add a JSON error handler.</li><li><b>Missing @ResponseBody:</b> Spring tries to resolve the returned string as a view name and gives a 404 or template error.</li><li><b>Missing CSRF header:</b> POST gives 403.</li></ul>`,
            r`@Controller
public class Bad {
    @GetMapping("/status")
    public String status() { return "ok"; }   // WRONG: looks for view "ok"
}
@Controller
public class Good {
    @GetMapping("/status")
    @ResponseBody
    public String status() { return "ok"; }   // RIGHT: body is "ok"
}

// OUTPUT:
// Bad  -> TemplateInputException: Error resolving template [ok]
// Good -> 200 ok`],
        [`<p>Tuning AJAX endpoints:</p><ul><li><b>Payload size:</b> return only needed fields with DTOs and enable <code>server.compression.enabled</code>.</li><li><b>Caching:</b> add <code>ETag</code> or <code>Cache-Control</code> to read endpoints.</li><li><b>Threads:</b> offload slow calls with async return types so Tomcat threads stay free.</li><li><b>Chatty pages:</b> batch several small calls into one endpoint.</li></ul>`,
            r`# application.properties
server.compression.enabled=true
server.compression.mime-types=application/json
server.compression.min-response-size=1024
spring.mvc.async.request-timeout=20000

// OUTPUT:
// Responses over 1 KB are gzip compressed; async calls time out after 20 s`],
        [`<p>Scenario: a live search box.</p><ul><li>The page calls <code>/api/search?q=...</code> after each pause in typing (debounce).</li><li>The controller returns at most 10 small DTOs.</li><li>The page shows results with <code>textContent</code> and ignores answers that arrive late.</li></ul>`,
            r`@GetMapping("/api/search")
public List<ProductHit> search(@RequestParam @Size(min = 2) String q) {
    return repo.findTop10ByNameContainingIgnoreCase(q).stream()
        .map(p -> new ProductHit(p.getId(), p.getName())).toList();
}

// OUTPUT:
// GET /api/search?q=lap -> [{"id":4,"name":"Laptop"},{"id":9,"name":"Lap desk"}]`]
    ),
    'mvc-json-ajax': dv(
        [`<p>JSON conversion is done by Jackson through a Spring converter.</p><ul><li><b>Read:</b> <code>MappingJackson2HttpMessageConverter.read</code> calls <code>ObjectMapper.readValue</code> on the request stream.</li><li><b>Write:</b> the same converter calls <code>writeValue</code> on the response stream.</li><li><b>Boot ObjectMapper:</b> built by <code>Jackson2ObjectMapperBuilder</code> with modules found on the classpath, such as the Java time module.</li><li><b>Records:</b> Jackson 2.12+ supports records through their canonical constructor.</li></ul>`,
            r`ObjectMapper om = new ObjectMapper().findAndRegisterModules();
record Order(long id, LocalDate day, List<String> items) {}

Order o = new Order(1, LocalDate.of(2026, 10, 8), List.of("pen", "ink"));
String json = om.writeValueAsString(o);
Order back = om.readValue(json, Order.class);
System.out.println(json);
System.out.println(back.equals(o));

// OUTPUT:
// {"id":1,"day":[2026,10,8],"items":["pen","ink"]}
// true`],
        [`<p>Useful Jackson options:</p><ul><li><b>@JsonInclude(NON_NULL):</b> skip null fields.</li><li><b>@JsonIgnoreProperties:</b> hide or ignore several fields.</li><li><b>@JsonView:</b> different field sets for different endpoints.</li><li><b>@JsonCreator:</b> choose the constructor to read.</li><li><b>@JsonTypeInfo:</b> polymorphic types (use with care).</li><li><b>Properties:</b> <code>spring.jackson.default-property-inclusion</code>, <code>spring.jackson.date-format</code>, <code>spring.jackson.property-naming-strategy</code>.</li></ul>`,
            r`@JsonInclude(JsonInclude.Include.NON_NULL)
public record Profile(String name, String phone,
                      @JsonProperty("e_mail") String email) {}

System.out.println(om.writeValueAsString(new Profile("Abaji", null, "a@x.com")));

# OUTPUT:
# {"name":"Abaji","e_mail":"a@x.com"}`],
        [`<p>Typical mistakes:</p><ul><li><b>Infinite recursion:</b> a bidirectional JPA relation (parent and child point to each other) overflows the stack; use DTOs or <code>@JsonManagedReference</code> with <code>@JsonBackReference</code>.</li><li><b>No default constructor:</b> classes without one and without <code>@JsonCreator</code> fail to deserialize.</li><li><b>Lazy proxies:</b> serializing an unloaded Hibernate proxy fails; map to a DTO.</li><li><b>Number precision:</b> big numbers lose precision in JavaScript; send them as strings.</li></ul>`,
            r`// WRONG: entity with a cycle
// class Author { List<Book> books; }  class Book { Author author; }
// RIGHT: map to flat DTOs
public record BookDto(long id, String title, String authorName) {}

BookDto dto = new BookDto(b.getId(), b.getTitle(), b.getAuthor().getName());

// OUTPUT:
// {"id":1,"title":"Java","authorName":"Abaji"}
// The entity version fails: StackOverflowError (infinite recursion)`],
        [`<p>Performance tips:</p><ul><li><b>Reuse ObjectMapper:</b> it is thread-safe and costly to create.</li><li><b>Smaller output:</b> use DTOs, skip nulls and compress responses.</li><li><b>Streaming:</b> for very large lists use a streaming writer instead of building the whole list.</li><li><b>Afterburner/Blackbird:</b> optional modules that speed up reflection access.</li></ul>`,
            r`@Bean
public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
    return b -> b.serializationInclusion(JsonInclude.Include.NON_NULL)
                 .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
}

// OUTPUT:
// Dates now print as "2026-10-08" and null fields are omitted everywhere`],
        [`<p>Scenario: a dashboard posts a filter object and receives a summary.</p><ul><li>The page sends JSON with the filter.</li><li>The server validates it with <code>@Valid</code> and returns a DTO.</li><li>A bad filter returns 400 with a field error map.</li></ul>`,
            r`public record Filter(@NotNull LocalDate from, @NotNull LocalDate to) {}
public record Summary(long orders, BigDecimal revenue) {}

@PostMapping("/api/report")
public Summary report(@Valid @RequestBody Filter f) {
    return reports.between(f.from(), f.to());
}

// OUTPUT:
// {"orders":42,"revenue":1830.50}`]
    ),
    'mvc-fetch-api': dv(
        [`<p>How a fetch call travels:</p><ul><li><b>Browser:</b> <code>fetch</code> creates a <code>Request</code>, checks CORS rules and sends it with the network stack.</li><li><b>Promise:</b> it resolves when the response headers arrive; the body is read later with <code>json()</code> or <code>text()</code>.</li><li><b>Spring:</b> the request reaches <code>DispatcherServlet</code> like any other, and the CORS filter or <code>@CrossOrigin</code> adds the headers.</li><li><b>Body stream:</b> a body can be read only once; call <code>clone()</code> to read it twice.</li></ul>`,
            r`const res = await fetch('/api/users/1');
console.log(res.status, res.ok, res.headers.get('content-type'));
const copy = res.clone();
console.log((await res.json()).name);
console.log((await copy.text()).length);

// OUTPUT:
// 200 true application/json
// Abaji
// 28`],
        [`<p>fetch option reference:</p><ul><li><b>method, headers, body:</b> the request itself.</li><li><b>credentials:</b> <code>same-origin</code>, <code>include</code> or <code>omit</code>.</li><li><b>cache and mode:</b> control browser cache and CORS mode.</li><li><b>signal:</b> cancellation.</li><li><b>Body types:</b> string, <code>FormData</code>, <code>URLSearchParams</code>, <code>Blob</code>.</li></ul>`,
            r`const params = new URLSearchParams({ q: 'java', page: 2 });
const res = await fetch('/api/search?' + params, {
    credentials: 'same-origin',
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': token }
});
console.log(res.url);

// OUTPUT:
// http://localhost:8080/api/search?q=java&page=2`],
        [`<p>Typical mistakes:</p><ul><li><b>Assuming errors reject:</b> check <code>res.ok</code>.</li><li><b>Forgetting Content-Type:</b> Spring answers 415 for a JSON body without it.</li><li><b>Passing an object as body:</b> use <code>JSON.stringify</code>, or the body becomes <code>[object Object]</code>.</li><li><b>Not awaiting json():</b> it returns a Promise.</li><li><b>Setting Content-Type with FormData:</b> let the browser add the boundary itself.</li></ul>`,
            r`// WRONG
await fetch('/api/users', { method: 'POST', body: { name: 'Mina' } });
// RIGHT
await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Mina' })
});

// OUTPUT:
// WRONG -> 415 Unsupported Media Type (body sent as [object Object])
// RIGHT -> 201 Created`],
        [`<p>Tuning fetch usage:</p><ul><li><b>Parallel calls:</b> <code>Promise.all</code> for independent requests.</li><li><b>Avoid repeats:</b> cache results in memory or rely on <code>ETag</code> responses.</li><li><b>Cancel stale calls:</b> abort the previous search when a new one starts.</li><li><b>Keep-alive:</b> HTTP/2 on the server removes most connection costs.</li></ul>`,
            r`const [user, orders] = await Promise.all([
    fetch('/api/users/1').then(r => r.json()),
    fetch('/api/users/1/orders').then(r => r.json())
]);
console.log(user.name, orders.length);

// OUTPUT: (both calls run at the same time)
// Abaji 3`],
        [`<p>Scenario: a React or plain JS front end on port 3000 calls a Spring API on 8080.</p><ul><li>The browser blocks the call unless Spring allows the origin.</li><li>Configure CORS once, globally.</li></ul>`,
            r`@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry reg) {
        reg.addMapping("/api/**")
           .allowedOrigins("http://localhost:3000")
           .allowedMethods("GET", "POST", "PUT", "DELETE")
           .allowCredentials(true);
    }
}

// OUTPUT:
// Response header: Access-Control-Allow-Origin: http://localhost:3000`]
    ),
    'mvc-jquery-ajax': dv(
        [`<p>Inside jQuery AJAX:</p><ul><li><b>XMLHttpRequest:</b> <code>$.ajax</code> wraps it and returns a <code>jqXHR</code> object that acts like a promise.</li><li><b>Defaults:</b> the content type is <code>application/x-www-form-urlencoded</code>, and <code>data</code> objects are turned into query or form strings.</li><li><b>Response:</b> with <code>dataType</code> unset, jQuery guesses from the response <code>Content-Type</code>.</li><li><b>Spring:</b> sees a normal request; nothing is jQuery specific.</li></ul>`,
            r`const xhr = $.ajax({ url: '/api/ping', dataType: 'json' });
xhr.done(function (data, status, jq) {
    console.log(status, jq.status, data.ok);
});

// OUTPUT:
// success 200 true`],
        [`<p>Settings you will use most:</p><ul><li><b>url, type, data:</b> what to send.</li><li><b>contentType, dataType:</b> how to send and parse.</li><li><b>headers:</b> extra headers such as CSRF.</li><li><b>timeout:</b> milliseconds before failing.</li><li><b>async, cache, global:</b> rarely changed.</li><li><b>statusCode:</b> handlers for specific codes.</li></ul>`,
            r`$.ajax({
    url: '/api/orders',
    type: 'PUT',
    contentType: 'application/json',
    data: JSON.stringify({ id: 7, status: 'SHIPPED' }),
    timeout: 5000,
    statusCode: {
        404: function () { console.log('no such order'); },
        200: function () { console.log('updated'); }
    }
});

// OUTPUT:
// updated`],
        [`<p>Typical mistakes:</p><ul><li><b>Form-encoded body to @RequestBody:</b> gives 415; stringify and set the content type.</li><li><b>Synchronous calls:</b> <code>async: false</code> freezes the page and is deprecated.</li><li><b>Using the result outside the callback:</b> the value is not ready yet.</li><li><b>Not stopping the form submit:</b> the page reloads and cancels the call.</li><li><b>Missing CSRF header:</b> 403 on POST.</li></ul>`,
            r`// WRONG: data is sent as a=1&b=2, but the controller expects JSON
$.post('/api/save', { name: 'Abaji' });
// RIGHT
$.ajax({
    url: '/api/save', type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ name: 'Abaji' })
});

// OUTPUT:
// WRONG -> 415 Unsupported Media Type
// RIGHT -> 200`],
        [`<p>Tuning and set up:</p><ul><li><b>Global CSRF:</b> configure once with <code>$.ajaxSetup</code>.</li><li><b>Global errors:</b> use <code>$(document).ajaxError</code> for one handler.</li><li><b>Slim build:</b> the slim jQuery build has no AJAX, so use the full build.</li><li><b>Debounce:</b> do not fire a call on every keystroke.</li></ul>`,
            r`const token = $('meta[name="_csrf"]').attr('content');
const header = $('meta[name="_csrf_header"]').attr('content');
$.ajaxSetup({
    beforeSend: function (xhr) { xhr.setRequestHeader(header, token); }
});
$(document).ajaxError(function (e, xhr) {
    console.log('AJAX failed: ' + xhr.status);
});

// OUTPUT:
// Every jQuery call now sends the CSRF header`],
        [`<p>Scenario: migrating a legacy JSP page.</p><ul><li>Keep the existing jQuery code and add a <code>@RestController</code> next to the old controller.</li><li>Move to <code>fetch</code> page by page later.</li></ul>`,
            r`$('#city').on('change', function () {
    $.getJSON('/api/cities/' + this.value + '/areas', function (areas) {
        const sel = $('#area').empty();
        areas.forEach(a => sel.append($('<option>').val(a.id).text(a.name)));
    });
});

// OUTPUT:
// Choosing a city fills the area dropdown with that city areas`]
    ),
    'mvc-asynchronous-form-submission': dv(
        [`<p>The cycle of an async submit:</p><ul><li><b>Intercept:</b> the submit handler calls <code>preventDefault()</code>.</li><li><b>Collect:</b> <code>new FormData(form)</code> reads every named field.</li><li><b>Bind:</b> Spring binds multipart or urlencoded fields to a bean (<code>@ModelAttribute</code> style) or reads JSON with <code>@RequestBody</code>.</li><li><b>Validate:</b> the <code>Validator</code> fills a <code>BindingResult</code> or throws <code>MethodArgumentNotValidException</code>.</li><li><b>Respond:</b> JSON with the saved data or the errors.</li></ul>`,
            r`const fd = new FormData(form);
console.log([...fd.entries()]);
console.log(JSON.stringify(Object.fromEntries(fd)));

// OUTPUT:
// [ [ 'name', 'Abaji' ], [ 'email', 'abaji@x.com' ] ]
// {"name":"Abaji","email":"abaji@x.com"}`],
        [`<p>Variants:</p><ul><li><b>JSON body:</b> <code>@Valid @RequestBody</code>.</li><li><b>Form fields:</b> <code>@Valid</code> with a bean and <code>BindingResult</code>.</li><li><b>File plus fields:</b> <code>@RequestPart</code> with <code>MultipartFile</code>.</li><li><b>ProblemDetail:</b> Spring 6 supports RFC 7807 error bodies with <code>ProblemDetail</code>.</li></ul>`,
            r`@PostMapping(value = "/profile", consumes = "multipart/form-data")
public ProblemDetail upload(@RequestPart("photo") MultipartFile photo,
                            @RequestParam String name) {
    if (photo.getSize() > 1_000_000) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.PAYLOAD_TOO_LARGE,
                                                "photo over 1 MB");
    }
    return ProblemDetail.forStatus(HttpStatus.OK);
}

// OUTPUT: (large photo)
// {"type":"about:blank","title":"Payload Too Large","status":413,
//  "detail":"photo over 1 MB"}`],
        [`<p>Typical mistakes:</p><ul><li><b>Bean fields not bound:</b> input <code>name</code> attributes do not match the property names.</li><li><b>Multipart size limit:</b> raise <code>spring.servlet.multipart.max-file-size</code>.</li><li><b>No user feedback:</b> errors are logged but not shown.</li><li><b>Setting Content-Type by hand with FormData:</b> breaks the boundary.</li><li><b>Trusting client checks:</b> bypassable with any HTTP tool.</li></ul>`,
            r`// WRONG: boundary missing, Spring cannot parse the parts
await fetch('/profile', { method: 'POST', body: fd,
    headers: { 'Content-Type': 'multipart/form-data' }
    });
// RIGHT: omit the header, the browser adds the boundary
await fetch('/profile', { method: 'POST', body: fd });

// OUTPUT:
// WRONG -> 400 / MultipartException: no multipart boundary was found
// RIGHT -> 200`],
        [`<p>Performance and usability:</p><ul><li><b>Disable the button</b> while pending.</li><li><b>Upload progress:</b> fetch has none; use <code>XMLHttpRequest</code> upload events if you need a bar.</li><li><b>Limits:</b> set max file and request size.</li><li><b>Debounce</b> field-by-field checks such as username availability.</li></ul>`,
            r`# application.properties
spring.servlet.multipart.max-file-size=2MB
spring.servlet.multipart.max-request-size=5MB

// OUTPUT:
// Larger uploads fail with MaxUploadSizeExceededException (handle it to return 413)`],
        [`<p>Scenario: a sign-up form that checks the email while the user types and submits without reload.</p><ul><li>A GET endpoint answers availability.</li><li>The POST creates the account and returns 201.</li><li>A unique database constraint is the final guard against races.</li></ul>`,
            r`@GetMapping("/api/email-free")
public Map<String, Boolean> free(@RequestParam String email) {
    return Map.of("free", !users.existsByEmail(email));
}

@PostMapping("/api/signup")
public ResponseEntity<?> signup(@Valid @RequestBody SignupForm f) {
    try {
        return ResponseEntity.status(201).body(users.create(f));
    } catch (DataIntegrityViolationException e) {
        return ResponseEntity.status(409).body(Map.of("error", "email taken"));
    }
}

// OUTPUT:
// GET  /api/email-free?email=a@x.com -> {"free":false}
// POST duplicate email               -> 409 {"error":"email taken"}`]
    ),
    'mvc-dynamic-page-updates': dv(
        [`<p>How the update reaches the screen:</p><ul><li><b>Data arrives</b> as JSON or an HTML string.</li><li><b>DOM change:</b> JavaScript edits the DOM tree; the browser then recalculates layout and repaints only what changed.</li><li><b>Server fragments:</b> Thymeleaf renders the selected fragment through <code>FragmentExpression</code> handling, returning only that markup.</li></ul>`,
            r`const box = document.getElementById('result');
box.textContent = 'Loading...';
const html = await (await fetch('/items/fragment')).text();
box.innerHTML = html;                 // trusted markup rendered by Thymeleaf

// OUTPUT:
// #result first shows Loading..., then the list rendered by the server`],
        [`<p>Update techniques:</p><ul><li><b>textContent:</b> safest for text.</li><li><b>createElement and append:</b> build nodes without parsing strings.</li><li><b>Template element:</b> clone a prepared HTML template.</li><li><b>insertAdjacentHTML:</b> fast insert of trusted markup.</li><li><b>Libraries:</b> htmx or a front-end framework when pages get complex.</li></ul>`,
            r`const tpl = document.getElementById('row-tpl');   // <template> element
function addRow(user) {
    const row = tpl.content.cloneNode(true);
    row.querySelector('.name').textContent = user.name;
    document.getElementById('rows').appendChild(row);
}
addRow({ name: 'Abaji' });

// OUTPUT:
// A new row with the name Abaji is appended`],
        [`<p>Typical mistakes:</p><ul><li><b>innerHTML with user text:</b> XSS.</li><li><b>Stale state:</b> the page shows an item the server rejected; update only after success.</li><li><b>Lost event handlers:</b> replacing HTML removes listeners; use event delegation on the parent.</li><li><b>Rebuilding the whole list</b> for one change.</li><li><b>No error path:</b> a failed call leaves the spinner on.</li></ul>`,
            r`// WRONG: a comment with a script tag runs in every visitor browser
list.innerHTML += '<li>' + comment.text + '</li>';
// RIGHT
const li = document.createElement('li');
li.textContent = comment.text;
list.appendChild(li);

// OUTPUT:
// WRONG -> alert from injected script
// RIGHT -> the text is shown literally`],
        [`<p>Performance:</p><ul><li><b>Batch DOM writes</b> with a document fragment.</li><li><b>Update only changed rows.</b></li><li><b>Paginate</b> large lists on the server.</li><li><b>Event delegation</b> instead of one listener per row.</li></ul>`,
            r`const frag = document.createDocumentFragment();
items.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i.name;
    frag.appendChild(li);
});
list.appendChild(frag);           // one reflow instead of many
list.addEventListener('click', e => {
    if (e.target.matches('li')) console.log('clicked', e.target.textContent);
});

// OUTPUT: (after clicking the second item)
// clicked eggs`],
        [`<p>Scenario: an order status board that refreshes every 5 seconds.</p><ul><li>Poll a small JSON endpoint.</li><li>Update only changed rows.</li><li>Switch to SSE if polling load grows.</li></ul>`,
            r`setInterval(async () => {
    const res = await fetch('/api/orders/status');
    if (!res.ok) return;
    for (const o of await res.json()) {
        document.querySelector('#o' + o.id + ' .status').textContent = o.status;
    }
}, 5000);

// OUTPUT:
// Every 5 seconds the status cells show values such as SHIPPED`]
    ),
    'mvc-rest-api-integration': dv(
        [`<p>Inside a REST integration:</p><ul><li><b>Server:</b> <code>@RestController</code> methods are found by <code>RequestMappingHandlerMapping</code> and run through message converters.</li><li><b>RestClient:</b> built on a request factory (JDK client, Apache or Jetty), applies converters and interceptors, and <code>retrieve()</code> turns error statuses into exceptions.</li><li><b>Declarative clients:</b> an <code>@HttpExchange</code> interface plus <code>HttpServiceProxyFactory</code> generates the client for you.</li></ul>`,
            r`@HttpExchange("/books")
public interface BookClient {
    @GetExchange("/{id}")
    Book get(@PathVariable long id);

    @PostExchange
    Book add(@RequestBody Book b);
}

RestClient rc = RestClient.create("https://api.example.com");
BookClient client = HttpServiceProxyFactory
    .builderFor(RestClientAdapter.create(rc)).build()
    .createClient(BookClient.class);

// OUTPUT:
// client.get(1) sends GET https://api.example.com/books/1`],
        [`<p>Choosing a client:</p><ul><li><b>RestClient:</b> synchronous, fluent, the modern choice in Spring 6.1+.</li><li><b>WebClient:</b> reactive and non-blocking, from <code>spring-webflux</code>.</li><li><b>RestTemplate:</b> older and in maintenance mode.</li><li><b>OpenFeign:</b> declarative, from Spring Cloud.</li></ul>`,
            r`ResponseEntity<List<Book>> res = rc.get().uri("/books")
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .toEntity(new ParameterizedTypeReference<List<Book>>() {});
System.out.println(res.getStatusCode() + " " + res.getBody().size());

// OUTPUT: (varies)
// 200 OK 12`],
        [`<p>Typical mistakes:</p><ul><li><b>No timeouts:</b> a slow remote hangs your threads.</li><li><b>Creating a client per call:</b> build once and reuse.</li><li><b>Ignoring error statuses:</b> handle 4xx and 5xx explicitly.</li><li><b>Logging secrets:</b> tokens in logs.</li><li><b>Wrong verb:</b> a GET that changes data, or POST used for reads.</li></ul>`,
            r`// WRONG: default factory, no timeouts
RestClient bad = RestClient.create();
// RIGHT
var factory = new JdkClientHttpRequestFactory(
    HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build());
factory.setReadTimeout(Duration.ofSeconds(5));
RestClient good = RestClient.builder().requestFactory(factory).build();

// OUTPUT:
// good fails fast with ResourceAccessException after 5 s of silence`],
        [`<p>Tuning:</p><ul><li><b>Connection pooling</b> via the HTTP client.</li><li><b>Parallel calls</b> with virtual threads or <code>CompletableFuture</code>.</li><li><b>Caching</b> of slow, rarely changing replies with <code>@Cacheable</code>.</li><li><b>Pagination</b> instead of huge lists.</li></ul>`,
            r`@Cacheable("rates")
public Rate rate(String currency) {
    return rc.get().uri("/rates/{c}", currency).retrieve().body(Rate.class);
}

// OUTPUT:
// First call hits the remote API; later calls for USD return from the cache`],
        [`<p>Scenario: a checkout page that needs payment status from a partner API.</p><ul><li>The page calls your own endpoint.</li><li>Your service calls the partner with a timeout and a fallback.</li></ul>`,
            r`@GetMapping("/api/orders/{id}/payment")
public PaymentStatus payment(@PathVariable long id) {
    try {
        return partner.get().uri("/pay/{id}", id).retrieve()
                      .body(PaymentStatus.class);
    } catch (RestClientException e) {
        return PaymentStatus.unknown();      // fallback keeps the page working
    }
}

// OUTPUT:
// partner up   -> {"state":"PAID"}
// partner down -> {"state":"UNKNOWN"}`]
    ),
    'mvc-thymeleaf-introduction': dv(
        [`<p>How Thymeleaf renders a page:</p><ul><li><b>Controller</b> returns a view name and fills the <code>Model</code>.</li><li><b>ThymeleafViewResolver</b> creates a <code>ThymeleafView</code>.</li><li><b>Template engine:</b> the template is found, parsed into a tree of events and cached.</li><li><b>Processors:</b> each <code>th:</code> attribute has a processor that changes the tree using the Spring EL context built from the model.</li><li><b>Output:</b> the result is written to the response writer.</li></ul>`,
            r`@GetMapping("/profile")
public String profile(Model model) {
    model.addAttribute("user", new User("Abaji", 21));
    return "profile";
}
// profile.html (th:text with a variable expression on user.name):
// <h1 th:text="#{profile.title}">Title</h1>

// OUTPUT:
// <h1>Profile</h1>   (text from messages.properties)`],
        [`<p>Syntax overview:</p><ul><li><b>Text:</b> <code>th:text</code>, <code>th:utext</code>, inline <code>[[...]]</code>.</li><li><b>Logic:</b> <code>th:if</code>, <code>th:unless</code>, <code>th:switch</code>, <code>th:each</code>.</li><li><b>Links and forms:</b> <code>th:href</code>, <code>th:action</code>, <code>th:field</code>, <code>th:object</code>.</li><li><b>Attributes:</b> <code>th:attr</code>, <code>th:class</code>, <code>th:classappend</code>.</li><li><b>Reuse:</b> <code>th:fragment</code>, <code>th:insert</code>, <code>th:replace</code>.</li><li><b>Utilities:</b> <code>#strings</code>, <code>#dates</code>, <code>#lists</code>.</li></ul>`,
            r`<table>
  <tr th:each="p, st : #{products}" th:class="#{st.odd} ? 'odd' : 'even'">
    <td th:text="#{p.name}">Name</td>
    <td th:text="#{#numbers.formatDecimal(p.price, 1, 2)}">0.00</td>
  </tr>
</table>
<!-- the model values are read with the dollar-brace variable expression -->

// OUTPUT:
// <tr class="odd"><td>Pen</td><td>1.50</td></tr>`],
        [`<p>Typical mistakes:</p><ul><li><b>Missing namespace:</b> add <code>xmlns:th="http://www.thymeleaf.org"</code> for editor help.</li><li><b>Using th:utext with user data:</b> XSS.</li><li><b>Null navigation:</b> use <code>user?.name</code> to avoid errors.</li><li><b>Wrong template folder:</b> a template outside <code>templates</code> is not found.</li><li><b>String compare with ==:</b> works in SpEL for strings, but compare numbers with the right types.</li></ul>`,
            r`<!-- WRONG: raw user text -->
<p th:utext="#{comment}">text</p>
<!-- RIGHT: escaped, and null safe -->
<p th:text="#{comment?.body}">text</p>
<!-- (both use the dollar-brace variable expression in real code) -->

// OUTPUT:
// WRONG -> a script tag in the comment would run
// RIGHT -> the tag is shown as text`],
        [`<p>Performance:</p><ul><li><b>Template cache:</b> on in production.</li><li><b>Lean models:</b> pass only what the page needs.</li><li><b>Fragments:</b> reuse headers and footers instead of copying them.</li><li><b>Lazy loading in views:</b> avoid triggering queries from the template (open-in-view hides this).</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true
spring.jpa.open-in-view=false

# OUTPUT:
# Templates are parsed once;
lazy collections must be loaded in the service`],
        [`<p>Scenario: a shared layout for an admin site.</p><ul><li>A <code>layout.html</code> holds the header, menu and footer fragments.</li><li>Pages include them with <code>th:replace</code>.</li></ul>`,
            r`<!-- fragments/layout.html -->
<header th:fragment="header"><a th:href="@{/}">Home</a></header>

<!-- users.html -->
<body>
    <div th:replace="~{fragments/layout :: header}"></div>
    <h2>Users</h2>
</body>

// OUTPUT:
// <body><header><a href="/">Home</a></header><h2>Users</h2></body>`]
    ),
    'mvc-thymeleaf-configuration': dv(
        [`<p>Auto-configuration at work:</p><ul><li><b>ThymeleafAutoConfiguration</b> runs when <code>TemplateMode</code> classes are present.</li><li><b>Beans created:</b> <code>SpringResourceTemplateResolver</code>, <code>SpringTemplateEngine</code>, <code>ThymeleafViewResolver</code>.</li><li><b>Properties:</b> read from <code>ThymeleafProperties</code> (prefix <code>spring.thymeleaf</code>).</li><li><b>Back-off:</b> defining your own bean of a type makes Boot skip its version.</li></ul>`,
            r`@Autowired ApplicationContext ctx;

void show() {
    System.out.println(ctx.getBeanNamesForType(SpringTemplateEngine.class).length);
    System.out.println(ctx.getBean(ThymeleafViewResolver.class).getOrder());
}

// OUTPUT:
// 1
// 2147483637`],
        [`<p>Main properties:</p><ul><li><code>spring.thymeleaf.cache</code>, <code>prefix</code>, <code>suffix</code>, <code>encoding</code>, <code>mode</code>.</li><li><code>spring.thymeleaf.check-template</code> and <code>check-template-location</code>.</li><li><code>spring.thymeleaf.enabled</code> to turn it off.</li><li><code>spring.thymeleaf.view-names</code> and <code>excluded-view-names</code> to limit which views it handles.</li><li><code>spring.thymeleaf.reactive.*</code> for WebFlux.</li></ul>`,
            r`# application.yml
spring:
  thymeleaf:
    cache: false
    prefix: classpath:/templates/
    suffix: .html
    view-names: "pages/*,home"
    excluded-view-names: "legacy/*"

# OUTPUT:
# Only view names pages/* and home are rendered by Thymeleaf`],
        [`<p>Typical mistakes:</p><ul><li><b>Caching in dev:</b> edits do not show.</li><li><b>Template in the wrong folder</b> or with the wrong suffix.</li><li><b>Using @EnableWebMvc in Boot:</b> turns off MVC auto-configuration, including static resources.</li><li><b>Mixing JSP and Thymeleaf</b> without view resolver orders.</li><li><b>Wrong encoding:</b> accents look broken.</li></ul>`,
            r`// WRONG: disables Boot MVC defaults
@Configuration
@EnableWebMvc
public class Cfg implements WebMvcConfigurer { }

// RIGHT: keep auto-configuration, only add what you need
@Configuration
public class Cfg2 implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry r) {
        r.addViewController("/login").setViewName("login");
    }
}

// OUTPUT:
// WRONG -> /css/app.css returns 404
// RIGHT -> static files and templates both work`],
        [`<p>Tuning:</p><ul><li><b>Cache on</b> in production.</li><li><b>Template cache TTL</b> can be set per resolver with <code>setCacheTTLMs</code>.</li><li><b>Devtools</b> disables the cache and reloads on change automatically.</li><li><b>Compression</b> for HTML responses.</li></ul>`,
            r`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>

<!-- OUTPUT -->
<!-- In dev, template edits appear after saving and rebuilding, with no restart of the page cache -->`],
        [`<p>Scenario: rendering HTML emails with a second engine.</p><ul><li>The web view resolver handles pages.</li><li>A separate engine with a classpath resolver for <code>mail/</code> templates renders email bodies as strings.</li></ul>`,
            r`@Service
public class MailRenderer {
    private final SpringTemplateEngine engine;
    MailRenderer(SpringTemplateEngine engine) { this.engine = engine; }

    public String welcome(String name) {
        Context ctx = new Context();
        ctx.setVariable("name", name);
        return engine.process("mail/welcome", ctx);
    }
}

// OUTPUT:
// <p>Welcome, Abaji!</p>`]
    ),
    'mvc-template-resolution-thymeleaf': dv(
        [`<p>Resolution step by step:</p><ul><li><b>View name:</b> the controller returns <code>users/list</code>.</li><li><b>ContentNegotiatingViewResolver</b> and then <code>ThymeleafViewResolver</code> (by order) accept the name; <code>redirect:</code> and <code>forward:</code> are handled here without a template.</li><li><b>Engine:</b> <code>TemplateEngine.process</code> asks resolvers in order; the first one that finds the template wins.</li><li><b>Prefix, name and suffix</b> are joined: <code>classpath:/templates/</code> + <code>users/list</code> + <code>.html</code>.</li></ul>`,
            r`// What the resolver effectively does:
String prefix = "classpath:/templates/";
String suffix = ".html";
String view = "users/list";
System.out.println(prefix + view + suffix);

// OUTPUT:
// classpath:/templates/users/list.html`],
        [`<p>Resolver choices:</p><ul><li><b>SpringResourceTemplateResolver:</b> Spring resources (<code>classpath:</code>, <code>file:</code>).</li><li><b>ClassLoaderTemplateResolver:</b> from the classpath.</li><li><b>FileTemplateResolver:</b> from the file system.</li><li><b>UrlTemplateResolver:</b> from a URL.</li><li><b>StringTemplateResolver:</b> the name is the template text.</li><li><b>Options:</b> <code>order</code>, <code>resolvablePatterns</code>, <code>checkExistence</code>, <code>cacheable</code>.</li></ul>`,
            r`var files = new FileTemplateResolver();
files.setPrefix("/opt/app/themes/");
files.setSuffix(".html");
files.setOrder(1);
files.setCheckExistence(true);        // pass on to next resolver if missing
files.setCacheable(false);            // pick up edits without restart
engine.addTemplateResolver(files);

// OUTPUT:
// Names are first looked up in /opt/app/themes/, then in the classpath`],
        [`<p>Typical mistakes:</p><ul><li><b>Leading slash</b> in the view name: <code>/home</code> may fail on some setups.</li><li><b>Wrong case</b> of file names.</li><li><b>Template next to Java code</b> under <code>src/main/java</code>: not copied to the classpath.</li><li><b>Missing checkExistence</b> in a resolver chain: the first resolver throws instead of passing on.</li><li><b>Returning a path with suffix:</b> <code>home.html</code> becomes <code>home.html.html</code>.</li></ul>`,
            r`// WRONG
return "home.html";     // looks for templates/home.html.html
// RIGHT
return "home";

// OUTPUT:
// WRONG -> TemplateInputException: Error resolving template [home.html]
// RIGHT -> renders templates/home.html`],
        [`<p>Tuning:</p><ul><li><b>Cache</b> resolved templates (default on).</li><li><b>Restrict patterns</b> so each name is checked by one resolver.</li><li><b>Avoid checkExistence</b> on the hot path when not needed, since it adds a lookup.</li><li><b>Small fragments</b> rendered by selector avoid building a whole page.</li></ul>`,
            r`# application.properties
logging.level.org.thymeleaf.TemplateEngine.CONFIG=DEBUG

# OUTPUT:
# Logs the resolvers and their order at start up, which helps to find
# why a name is resolved from an unexpected place`],
        [`<p>Scenario: per-tenant themes.</p><ul><li>A custom resolver looks for <code>themes/tenant/name.html</code> first.</li><li>If missing, the default template is used.</li></ul>`,
            r`public class TenantResolver extends AbstractConfigurableTemplateResolver {
    @Override
    protected ITemplateResource computeTemplateResource(
            IEngineConfiguration cfg, String owner, String name,
            String resource, String charset, Map<String, Object> attrs) {
        String tenant = TenantContext.current();
        return new FileTemplateResource(
            "/opt/themes/" + tenant + "/" + name + ".html", charset);
    }
}

// OUTPUT:
// Tenant acme with view "home" -> /opt/themes/acme/home.html`]
    )
};
