import { Topic } from '../coreJava';

export const introductionToSpringMvc: Topic = {
                        id: 'introductiontospringmvc',
                        name: 'Introduction to Spring MVC',
                        beginner: [
                            {
                                content: `Spring MVC is a web framework built on the Model-View-Controller pattern.

 Components:
 • DispatcherServlet: Front controller
 • Controller: Handles requests
 • Model: Data
 • View: Presentation
 • ViewResolver: Resolves view names

 Request Flow:
 1. Client sends request
 2. DispatcherServlet receives request
 3. Handler mapping finds controller
 4. Controller processes request
 5. Returns ModelAndView
 6. ViewResolver resolves view
 7. View renders response`,
                                codeExamples: [
                                    `@Controller
 public class HomeController {

     @GetMapping("/")
     public String home(Model model) {
         model.addAttribute("message", "Welcome to Spring MVC");
         return "home";
     }

     @PostMapping("/submit")
     public String submit(@RequestParam String name, Model model) {
         model.addAttribute("name", name);
         return "result";
     }
 }`
                                ]
                            }
                        ],

                        expert: [
                            {
                                content: `<h3>DispatcherServlet: The Front Controller</h3>
Every request into a Spring MVC application passes through a single servlet - <strong>DispatcherServlet</strong>. It does not process the request itself; it coordinates a fixed pipeline of collaborator beans (HandlerMapping, HandlerAdapter, ViewResolver, etc.) that are auto-configured by the Spring container.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Client            DispatcherServlet     HandlerMapping     Controller     ViewResolver         View
  |                      |                     |                |               |                |
  |--- HTTP request ---->|                     |                |               |                |
  |                      |--- find handler ---->|                |               |                |
  |                      |<-- HandlerExecutionChain (controller)-|                |               |
  |                      |--- invoke via HandlerAdapter --------->|               |                |
  |                      |                     |                |-- process --   |                |
  |                      |<---------------- ModelAndView --------|                |               |
  |                      |--- resolve view name ----------------------------------->|              |
  |                      |<----------------------------------------------- View object ------------|
  |                      |--- render(model) -------------------------------------------------------->|
  |<---- HTTP response --|                     |                |               |                |</pre>

<h4>Step-by-step flow</h4>
1. Client sends an HTTP request; it hits the front controller, <strong>DispatcherServlet</strong> (mapped in web.xml / auto-configured by Spring Boot to <code>/</code>).<br>
2. DispatcherServlet consults <strong>HandlerMapping</strong> to find which controller method should handle this URL + HTTP method.<br>
3. HandlerMapping returns a <code>HandlerExecutionChain</code> (the controller method plus any interceptors).<br>
4. DispatcherServlet delegates execution to a <strong>HandlerAdapter</strong>, which actually invokes the controller method, resolving method arguments (<code>@RequestParam</code>, <code>@PathVariable</code>, <code>@RequestBody</code>, etc.) along the way.<br>
5. The controller returns a logical view name (String) or a <code>ModelAndView</code> object containing the view name plus model data.<br>
6. If the return value is a view name, DispatcherServlet asks <strong>ViewResolver</strong> to resolve it to an actual <code>View</code> implementation (e.g. JSP under <code>/WEB-INF/views/</code>, or a Thymeleaf template).<br>
7. DispatcherServlet calls <code>view.render(model, request, response)</code>, which merges the model data into the template and writes the final HTML to the response.<br><br>

For a <code>@RestController</code> (or a method annotated <code>@ResponseBody</code>) steps 6-7 are skipped entirely - the returned object is serialized directly (usually to JSON via <code>HttpMessageConverter</code>) straight into the HTTP response body.<br>`,
                                codeExamples: [
                                    `// web.xml style registration (classic Spring MVC, non Spring-Boot)
<servlet>
    <servlet-name>dispatcher</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>/WEB-INF/spring-mvc-config.xml</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>dispatcher</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
// Spring Boot auto-configures and registers this same DispatcherServlet
// for you - no XML required.`
                                ]
                            },
                            {
                                content: `<h3>@Controller vs @RestController</h3>
Both are specializations of <code>@Component</code> and both get picked up by component scanning, but they differ in how the return value of a handler method is treated.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>@Controller</th><th>@RestController</th></tr>
<tr class='text-center'><td>Return value default meaning</td><td>Logical view name, resolved by ViewResolver</td><td>Response body itself (serialized by an HttpMessageConverter)</td></tr>
<tr class='text-center'><td>Equivalent to</td><td>@Controller (plain)</td><td>@Controller + @ResponseBody on every handler method</td></tr>
<tr class='text-center'><td>Typical use case</td><td>Traditional server-rendered web pages (JSP/Thymeleaf)</td><td>REST APIs returning JSON/XML</td></tr>
<tr class='text-center'><td>Need @ResponseBody explicitly?</td><td>Yes, per method, if you want raw data instead of a view</td><td>No, implied for every method in the class</td></tr>
<tr class='text-center'><td>Can still return a view name?</td><td>Yes (default behavior)</td><td>No - a String return value becomes the literal response body, not a view name</td></tr>
</table>
<br>`,
                                codeExamples: [
                                    `// @Controller - returns a view name; ViewResolver looks up the template
@Controller
@RequestMapping("/users")
public class UserPageController {

    @GetMapping("/{id}")
    public String getUserPage(@PathVariable Long id, Model model) {
        model.addAttribute("userId", id);
        return "userDetails"; // resolved to e.g. /WEB-INF/views/userDetails.jsp
    }

    // Mixing in raw data from a @Controller requires explicit @ResponseBody
    @GetMapping("/{id}/raw")
    @ResponseBody
    public User getUserRaw(@PathVariable Long id) {
        return new User(id, "Alice"); // serialized to JSON directly
    }
}`,
                                    `// @RestController - every method's return value IS the response body
@RestController
@RequestMapping("/api/users")
public class UserApiController {

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return new User(id, "Alice"); // written straight to the response as JSON
        // NOTE: "userDetails" here would NOT resolve to a view -
        // returning a String would just send that literal text as the body.
    }
}
// @RestController == @Controller + @ResponseBody applied to the whole class`
                                ]
                            },
                            {
                                content: `<h3>Request Mapping Annotations</h3>
<code>@RequestMapping</code> is the general-purpose mapping annotation; the HTTP-method-specific variants (<code>@GetMapping</code>, <code>@PostMapping</code>, <code>@PutMapping</code>, <code>@DeleteMapping</code>, <code>@PatchMapping</code>) are meta-annotations built on top of it that pre-set the <code>method</code> attribute, making intent explicit and code shorter.<br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Annotation</th><th>Equivalent to</th><th>Typical use</th></tr>
<tr class='text-center'><td>@RequestMapping</td><td>@RequestMapping(method = ...) or no method restriction</td><td>Class-level base path; or when multiple HTTP methods must map to the same method</td></tr>
<tr class='text-center'><td>@GetMapping</td><td>@RequestMapping(method = RequestMethod.GET)</td><td>Fetch/read a resource</td></tr>
<tr class='text-center'><td>@PostMapping</td><td>@RequestMapping(method = RequestMethod.POST)</td><td>Create a resource</td></tr>
<tr class='text-center'><td>@PutMapping</td><td>@RequestMapping(method = RequestMethod.PUT)</td><td>Replace a resource entirely</td></tr>
<tr class='text-center'><td>@PatchMapping</td><td>@RequestMapping(method = RequestMethod.PATCH)</td><td>Partially update a resource</td></tr>
<tr class='text-center'><td>@DeleteMapping</td><td>@RequestMapping(method = RequestMethod.DELETE)</td><td>Delete a resource</td></tr>
</table>
<br>
Class-level <code>@RequestMapping</code> combines with method-level mappings - the final URL is the concatenation of both.<br>`,
                                codeExamples: [
                                    `@RestController
@RequestMapping("/api/products")   // class-level base path
public class ProductController {

    @GetMapping                     // GET /api/products
    public List<Product> getAll() {
        return productService.findAll();
    }

    @GetMapping("/{id}")            // GET /api/products/{id}
    public Product getOne(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping                    // POST /api/products
    public Product create(@RequestBody Product product) {
        return productService.save(product);
    }

    @PutMapping("/{id}")            // PUT /api/products/{id}
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        return productService.update(id, product);
    }

    @DeleteMapping("/{id}")         // DELETE /api/products/{id}
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    // @RequestMapping still useful when one method must serve multiple verbs
    @RequestMapping(value = "/ping", method = { RequestMethod.GET, RequestMethod.HEAD })
    public String ping() {
        return "pong";
    }
}`
                                ]
                            },
                            {
                                content: `<h3>Binding Request Data: @RequestParam, @PathVariable, @RequestBody</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Annotation</th><th>Extracts data from</th><th>Example URL / body</th></tr>
<tr class='text-center'><td>@RequestParam</td><td>Query string or form field</td><td>/search?keyword=java&page=2</td></tr>
<tr class='text-center'><td>@PathVariable</td><td>A segment of the URI template</td><td>/users/42 -&gt; id = 42</td></tr>
<tr class='text-center'><td>@RequestBody</td><td>The raw HTTP request body, deserialized via an HttpMessageConverter (e.g. JSON -&gt; POJO)</td><td>POST body: {"name":"Alice"}</td></tr>
</table>
<br>`,
                                codeExamples: [
                                    `@RestController
@RequestMapping("/search")
public class SearchController {

    // GET /search?keyword=spring&page=1
    @GetMapping
    public String search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String sort) {
        return "Searching for '" + keyword + "', page=" + page + ", sort=" + sort;
    }
}
// Call: GET /search?keyword=spring&page=1
// OUTPUT: Searching for 'spring', page=1, sort=null`,
                                    `@RestController
@RequestMapping("/orders")
public class OrderController {

    // GET /orders/101/items/5  -> id=101, itemId=5
    @GetMapping("/{id}/items/{itemId}")
    public String getOrderItem(@PathVariable Long id, @PathVariable Long itemId) {
        return "Order " + id + ", item " + itemId;
    }
}
// Call: GET /orders/101/items/5
// OUTPUT: Order 101, item 5`,
                                    `public class UserDto {
    private String name;
    private String email;
    // getters and setters omitted
}

@RestController
@RequestMapping("/api/users")
public class UserApiController {

    // POST body: {"name":"Alice","email":"alice@example.com"}
    @PostMapping
    public String createUser(@RequestBody UserDto user) {
        return "Created user: " + user.getName() + " (" + user.getEmail() + ")";
    }
}
// OUTPUT: Created user: Alice (alice@example.com)`
                                ]
                            },
                            {
                                content: `<h3>Model and ModelAndView: Passing Data to the View</h3>
When a handler method returns a view name, it needs a way to hand data to that view for rendering. Spring MVC offers two equivalent styles:<br><br>
• <strong>Model</strong> (an interface, usually injected as a method parameter) - you call <code>addAttribute(name, value)</code> and separately return the view name as a String.<br>
• <strong>ModelAndView</strong> - a single object that bundles both the view name and the model data together, useful when you want to build and return them as one unit (e.g. from a method that may branch to different views).<br>`,
                                codeExamples: [
                                    `@Controller
public class ProfileController {

    // Style 1: Model injected as a parameter, view name returned separately
    @GetMapping("/profile/{id}")
    public String showProfile(@PathVariable Long id, Model model) {
        model.addAttribute("userId", id);
        model.addAttribute("displayName", "Alice");
        return "profile"; // resolves to profile.jsp / profile.html
    }
}`,
                                    `@Controller
public class DashboardController {

    // Style 2: ModelAndView bundles view name + model together
    @GetMapping("/dashboard")
    public ModelAndView dashboard(@RequestParam(required = false) String role) {
        ModelAndView mav = new ModelAndView();

        if ("admin".equals(role)) {
            mav.setViewName("adminDashboard");
        } else {
            mav.setViewName("userDashboard");
        }

        mav.addObject("role", role == null ? "guest" : role);
        return mav;
    }
}
// GET /dashboard?role=admin -> renders "adminDashboard" with role="admin" in the model`
                                ]
                            },
                            {
                                content: `<h3>Interview Questions</h3>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the role of DispatcherServlet?</td><td>It is the front controller of Spring MVC - every request enters through it, and it delegates to HandlerMapping, HandlerAdapter and ViewResolver to produce the response</td></tr>
<tr class='text-center'><td>What is HandlerMapping?</td><td>A component that maps an incoming request (URL + HTTP method) to the controller method that should handle it</td></tr>
<tr class='text-center'><td>Difference between @Controller and @RestController?</td><td>@RestController = @Controller + @ResponseBody applied to every method - return values are written directly to the response body instead of being resolved as view names</td></tr>
<tr class='text-center'><td>What does @ResponseBody do?</td><td>Tells Spring to skip view resolution and serialize the return value directly into the HTTP response body via an HttpMessageConverter</td></tr>
<tr class='text-center'><td>Difference between @RequestParam and @PathVariable?</td><td>@RequestParam reads query-string/form parameters (?key=value); @PathVariable extracts a value from a placeholder in the URI template itself (/users/{id})</td></tr>
<tr class='text-center'><td>What does @RequestBody do?</td><td>Binds the entire HTTP request body to a Java object, converting it (e.g. JSON to POJO) via a registered HttpMessageConverter such as Jackson</td></tr>
<tr class='text-center'><td>Difference between Model and ModelAndView?</td><td>Model only carries attributes and is injected as a parameter while the view name is returned separately as a String; ModelAndView bundles both the view name and the attributes into a single returned object</td></tr>
<tr class='text-center'><td>What is a ViewResolver?</td><td>A component that maps a logical view name (String) returned by a controller to an actual View implementation (JSP, Thymeleaf template, etc.)</td></tr>
<tr class='text-center'><td>Can one method handle multiple HTTP methods?</td><td>Yes, using @RequestMapping(method = { RequestMethod.GET, RequestMethod.POST }) instead of a single HTTP-method-specific annotation</td></tr>
<tr class='text-center'><td>What happens if a @RestController method returns a String?</td><td>Unlike @Controller, the String is NOT treated as a view name - it becomes the literal response body text (or JSON string) sent to the client</td></tr>
</table>`
                            }
                        ]
                    };
