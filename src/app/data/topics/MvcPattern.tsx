import { Topic } from '../coreJava';

export const mvcPattern: Topic = {
    id: 'mvc-pattern',
    name: 'MVC Pattern',
    beginner: [
        {
            content: `<h3>What is the MVC Pattern?</h3>
<p>
MVC stands for <b>Model - View - Controller</b>. It is an architectural pattern that splits an application
into three interconnected parts, each with a single responsibility. It is not a GoF design pattern, but it is
the single most important architectural pattern used in real enterprise Java web applications.
</p>
<ul>
<li><b>Model</b> - Holds application data and business state (entities, POJOs, service results)</li>
<li><b>View</b> - Renders the data to the user (HTML page, JSON response, JSP, Thymeleaf template)</li>
<li><b>Controller</b> - Receives the request, talks to the Model, and picks the View to render</li>
</ul>`
        },
        {
            content: `<h4>Why does a real enterprise app need MVC?</h4>
<ul>
<li>Separation of concerns - UI code, business logic and data access don't get tangled together</li>
<li>Multiple developers can work on Controller, Service and View layers in parallel</li>
<li>The same Model/business logic can be reused by multiple Views (web page, mobile app, REST client)</li>
<li>Makes unit testing easier - Controllers can be tested without a real UI</li>
</ul>`
        },
        {
            content: `<h4>How Spring MVC implements it</h4>
<p>
Spring MVC gives concrete framework support for each part of MVC:
</p>
<ul>
<li><code>@Controller</code> / <code>@RestController</code> - the Controller</li>
<li>Entity / DTO / Service return values - the Model</li>
<li>Thymeleaf/JSP template or JSON response body - the View</li>
</ul>`,
            codeExamples: [`@Controller
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    // Controller receives the request
    @GetMapping("/employees")
    public String listEmployees(Model model) {

        // Talks to the Model (business/data layer)
        List<Employee> employees = employeeService.getAllEmployees();
        model.addAttribute("employees", employees);

        // Picks the View to render
        return "employee-list"; // resolves to employee-list.html
    }
}`]
        },
        {
            content: `<h4>Request Flow Diagram</h4>`,
            codeExamples: [`Browser Request
      |
      v
DispatcherServlet  (Front Controller)
      |
      v
HandlerMapping  -->  finds matching @Controller method
      |
      v
Controller  -->  calls Service (Model layer)
      |
      v
ViewResolver  -->  resolves logical view name to actual template
      |
      v
View (HTML / JSON)  -->  rendered back to Browser`]
        }
    ],
    expert: [
        {
            content: `<h3>DispatcherServlet as the Front Controller</h3>
<p>
Spring MVC is itself built on top of another pattern - the <b>Front Controller Pattern</b>.
Instead of every URL mapping to a separate servlet, ALL requests first pass through a single
central servlet, <code>DispatcherServlet</code>, which then delegates to the right Controller.
</p>
<ul>
<li>Single entry point for cross-cutting concerns - security, logging, exception handling, i18n</li>
<li>Uses <code>HandlerMapping</code> to find the right controller method</li>
<li>Uses <code>HandlerAdapter</code> to invoke it</li>
<li>Uses <code>ViewResolver</code> to turn a logical view name into an actual renderable view</li>
</ul>`,
            codeExamples: [`// web.xml (or auto-configured in Spring Boot)
<servlet>
    <servlet-name>dispatcher</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>dispatcher</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>`]
        },
        {
            content: `<h3>Where MVC sits in a layered enterprise architecture</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Layer</th><th>Responsibility</th><th>MVC Role</th></tr>
<tr><td>Controller</td><td>Accept HTTP request, validate input, delegate to service</td><td>Controller</td></tr>
<tr><td>Service</td><td>Business logic, transactions</td><td>Part of Model</td></tr>
<tr><td>Repository</td><td>Data access (JPA/Hibernate)</td><td>Part of Model</td></tr>
<tr><td>Entity/DTO</td><td>Data representation</td><td>Model</td></tr>
<tr><td>Thymeleaf/JSP/JSON</td><td>Rendering the response</td><td>View</td></tr>
</table>`
        },
        {
            content: `<h3>MVC vs MVVM vs MVP (brief)</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Pattern</th><th>Who updates the View</th><th>Typical Usage</th></tr>
<tr><td>MVC</td><td>Controller explicitly selects/updates the View</td><td>Spring MVC web apps</td></tr>
<tr><td>MVP</td><td>Presenter manipulates View through an interface</td><td>Android (older), desktop apps</td></tr>
<tr><td>MVVM</td><td>View binds automatically to ViewModel via data-binding</td><td>Angular, React (partially), WPF</td></tr>
</table>
<p>
Spring MVC is a server-side MVC - the Controller decides which View template to render and passes
data explicitly, rather than relying on two-way data binding like MVVM frameworks do.
</p>`
        },
        {
            content: `<h3>REST-only APIs: the "MC" Pattern</h3>
<p>
When building a pure REST backend with <code>@RestController</code>, there is technically no server-side
View anymore - the Controller directly returns JSON/XML via <code>@ResponseBody</code> (implicit in
<code>@RestController</code>). Some architects informally call this "MC" (Model-Controller) since the View
responsibility moves to the client (React/Angular frontend or mobile app) which renders the JSON itself.
</p>`,
            codeExamples: [`@RestController
@RequestMapping("/api/employees")
public class EmployeeRestController {

    private final EmployeeService employeeService;

    public EmployeeRestController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public List<EmployeeDto> getAllEmployees() {
        // No View resolver involved - object is serialized to JSON directly
        return employeeService.getAllEmployees();
    }
}`]
        },
        {
            content: `<h3>Common Mistakes</h3>
<ul>
<li>Putting business logic directly inside the Controller (fat controller anti-pattern)</li>
<li>Returning Entity objects directly as the View/response instead of DTOs</li>
<li>Mixing View-rendering logic (Thymeleaf template code) into the Controller</li>
<li>Not separating validation concerns from business rules</li>
</ul>

<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Key Point</th></tr>
<tr><td>What is the MVC pattern?</td><td>Separation of Model, View, Controller responsibilities</td></tr>
<tr><td>What role does DispatcherServlet play?</td><td>Front Controller - single entry point for all requests</td></tr>
<tr><td>How does Spring MVC resolve a view?</td><td>ViewResolver maps logical view name to template</td></tr>
<tr><td>Is a REST API still MVC?</td><td>Effectively "MC" - View is replaced by JSON serialization</td></tr>
<tr><td>Why avoid fat controllers?</td><td>Violates separation of concerns, hard to test/reuse logic</td></tr>
<tr><td>MVC vs MVVM difference?</td><td>MVC uses explicit Controller updates; MVVM uses data-binding</td></tr>
<tr><td>Where does business logic belong in Spring MVC?</td><td>Service layer, not the Controller</td></tr>
</table>`
        }
    ]
};
