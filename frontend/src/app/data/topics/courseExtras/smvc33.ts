// Spring extras, batch smvc33 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

// Builds a Thymeleaf variable expression without writing the dollar-brace pair literally.
const V = (s: string): string => '$' + '{' + s + '}';

export const smvc33Extras: Record<string, Extra> = {
    'mvc-th-text': x(
        ['<b>th:text</b> is a Thymeleaf attribute that replaces the body text of its tag with the value of an expression, for example <code>&lt;span th:text=&quot;&#36;{user.name}&quot;&gt;</code>.',
            '<b>Natural templating</b>: the plain text inside the tag is a prototype shown when the file is opened in a browser; at runtime Thymeleaf replaces it.',
            '<b>Escaped by default</b>: HTML characters in the value are escaped, so user input cannot inject markup.'],
        ['<b>Message keys</b>: <code>th:text=&quot;#{welcome.title}&quot;</code> reads from <code>messages.properties</code>, so the same template supports many languages.',
            '<b>Literal substitution</b>: <code>th:text=&quot;|Hello, &#36;{name}!|&quot;</code> joins text and variables without many plus signs.',
            '<b>th:utext</b> prints unescaped HTML; use it only for trusted content, because it opens the door to XSS.'],
        ['<b>Processing</b>: the template engine (<code>SpringTemplateEngine</code>) evaluates the expression with SpringEL against the model that the controller filled.',
            '<b>Null handling</b>: a null value renders an empty body; use <code>&#36;{name} ?: &#39;n/a&#39;</code> style defaults (the Elvis operator) for a fallback.',
            '<b>Formatting</b>: use utility objects such as <code>#dates</code>, <code>#numbers</code> and <code>#strings</code> inside the expression.'],
        [['F', 'What does th:text do?', 'It replaces the text content of the element with the evaluated expression, escaping HTML.'],
            ['F', 'Where do the values come from?', 'From the Model (or request, session) attributes set in the controller.'],
            ['M', 'Difference between th:text and th:utext?', 'th:text escapes HTML characters; th:utext outputs them raw and can cause XSS.'],
            ['M', 'How do you show a localized message?', 'Use the message expression #{key}, resolved by the MessageSource from messages.properties.'],
            ['S', 'Why is th:text safer than inline [(...)]?', 'th:text and [[...]] escape output; the [(...)] form is unescaped, like th:utext.'],
            ['S', 'How does Spring Boot find the template?', 'ThymeleafAutoConfiguration sets a view resolver with prefix classpath:/templates/ and suffix .html; the controller returns the view name.']],
        [['Show a greeting from the model.',
            r`@Controller
class HomeController {
    @GetMapping("/hello")
    String hello(Model model) {
        model.addAttribute("name", "Abaji");
        return "hello";          // templates/hello.html
    }
}
// templates/hello.html
// <h1 th:text="` + V('name') + r`">Placeholder</h1>

// OUTPUT:
// <h1>Abaji</h1>`],
            ['Escaping versus unescaped output.',
                r`model.addAttribute("bio", "<b>Hi</b>");
// <p th:text="` + V('bio') + r`"></p>
// <p th:utext="` + V('bio') + r`"></p>

// OUTPUT:
// <p>&lt;b&gt;Hi&lt;/b&gt;</p>
// <p><b>Hi</b></p>`]],
        [['Literal substitution and messages.',
            r`# messages.properties
# greet=Welcome back, {0}

// <p th:text="#{greet(` + V('user.name') + r`)}">x</p>
// <p th:text="|Total: ` + V('cart.size') + r` items|">x</p>

// OUTPUT:
// <p>Welcome back, Abaji</p>
// <p>Total: 3 items</p>`],
            ['Test the rendered text with MockMvc.',
                r`@WebMvcTest(HomeController.class)
class HomeControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void showsName() throws Exception {
        mvc.perform(get("/hello"))
           .andExpect(status().isOk())
           .andExpect(view().name("hello"))
           .andExpect(content().string(containsString("Abaji")));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-th-if': x(
        ['<b>th:if</b> renders the element only when its expression is true; if it is false, the whole tag is removed from the output.',
            '<b>th:unless</b> is the opposite: it renders the element when the expression is false.',
            '<b>Truthiness</b>: a non-null object, a non-empty string other than false/off/no, and a non-zero number count as true.'],
        ['<b>Null-safe checks</b>: <code>th:if=&quot;&#36;{user != null}&quot;</code> or the safe navigation <code>&#36;{user?.address}</code> avoid errors on null.',
            '<b>th:switch and th:case</b> choose between many values; <code>th:case=&quot;*&quot;</code> is the default branch.',
            '<b>Combine conditions</b> with <code>and</code>, <code>or</code> and <code>not</code> inside the expression.'],
        ['<b>Removal, not hiding</b>: unlike CSS display none, a false th:if leaves no markup, so hidden secrets never reach the browser.',
            '<b>Security</b>: hiding a button does not protect the endpoint; the controller or Spring Security must still check access.',
            '<b>Logic placement</b>: keep complex rules in the controller or a service and expose a simple boolean to the template.'],
        [['F', 'What is the use of th:if?', 'It conditionally renders an element based on a boolean expression.'],
            ['F', 'What does th:unless do?', 'It renders the element only if the expression is false.'],
            ['M', 'How do you show a list only when it has items?', 'Use th:if with the not-empty check, for example &#36;{!#lists.isEmpty(items)} or &#36;{items.size() > 0}.'],
            ['M', 'How do you choose between several branches?', 'Use th:switch with th:case, and th:case with * as the default.'],
            ['S', 'Is th:if a security feature?', 'No. It only controls markup; the server endpoints must still be protected by authorization rules.'],
            ['S', 'What happens if the expression yields a string?', 'Strings other than false, off or no are treated as true, so an empty string is true; compare explicitly.']],
        [['Show an admin link only for admins.',
            r`// <a th:if="` + V('isAdmin') + r`" href="/admin">Admin</a>
// <p th:unless="` + V('isAdmin') + r`">Standard user</p>
model.addAttribute("isAdmin", false);

// OUTPUT:
// <p>Standard user</p>`],
            ['Switch on a role.',
                r`// <div th:switch="` + V('role') + r`">
//   <p th:case="'ADMIN'">Full access</p>
//   <p th:case="'USER'">Limited access</p>
//   <p th:case="*">Guest</p>
// </div>
model.addAttribute("role", "USER");

// OUTPUT:
// <div><p>Limited access</p></div>`]],
        [['Empty list message.',
            r`// <ul th:if="` + V('!orders.isEmpty()') + r`">...</ul>
// <p th:if="` + V('orders.isEmpty()') + r`">No orders yet.</p>
model.addAttribute("orders", List.of());

// OUTPUT:
// <p>No orders yet.</p>`],
            ['Test that the branch renders.',
                r`mvc.perform(get("/orders"))
   .andExpect(content().string(containsString("No orders yet.")))
   .andExpect(content().string(not(containsString("<ul"))));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-th-each': x(
        ['<b>th:each</b> repeats its element once for every item of a collection, array or map, as in <code>th:each=&quot;p : &#36;{products}&quot;</code>.',
            '<b>Iteration variable</b>: the name before the colon holds the current item and is visible inside the tag and its children.',
            '<b>Status variable</b>: an optional second name, <code>p, st : &#36;{products}</code>, exposes index, count, size, first, last, odd and even.'],
        ['<b>Index versus count</b>: <code>st.index</code> starts at 0 and <code>st.count</code> starts at 1.',
            '<b>Maps</b>: iterating a map gives entries, so use <code>e.key</code> and <code>e.value</code>.',
            '<b>Table rows</b>: put th:each on the <code>&lt;tr&gt;</code> so one row is produced per item; use <code>st.odd</code> for zebra stripes.'],
        ['<b>Large lists</b>: the template renders everything, so page the data in the controller (<code>Pageable</code>) instead of looping thousands of rows.',
            '<b>Lazy loading</b>: iterating a JPA collection in the view can trigger extra queries; fetch what you need first or use DTOs.',
            '<b>th:block</b> lets you repeat several sibling elements without adding a wrapper tag.'],
        [['F', 'What does th:each do?', 'It loops over a collection and renders the element once per item.'],
            ['F', 'How do you loop with the item name p?', 'Write th:each=&quot;p : &#36;{list}&quot; and use p inside the element.'],
            ['M', 'What is the status variable?', 'A second variable that gives index, count, size, current, even, odd, first and last.'],
            ['M', 'How do you iterate a Map?', 'The item is a Map.Entry, so read entry.key and entry.value.'],
            ['S', 'How can you repeat two elements per item?', 'Wrap them in a th:block that carries the th:each; th:block leaves no tag in the output.'],
            ['S', 'What is a risk of iterating entities in the view?', 'Lazy collections may fire N+1 queries or throw LazyInitializationException; use fetch joins or DTOs.']],
        [['Render a product table.',
            r`// <tr th:each="p : ` + V('products') + r`">
//   <td th:text="` + V('p.name') + r`">x</td>
//   <td th:text="` + V('p.price') + r`">0</td>
// </tr>
model.addAttribute("products",
    List.of(new Product("Pen", 5), new Product("Book", 120)));

// OUTPUT:
// <tr><td>Pen</td><td>5</td></tr>
// <tr><td>Book</td><td>120</td></tr>`],
            ['Use the status variable.',
                r`// <li th:each="n, st : ` + V('names') + r`"
//     th:text="` + V('st.count') + r` + '. ' + ` + V('n') + r`"
//     th:classappend="` + V('st.last') + r` ? 'last'">x</li>
model.addAttribute("names", List.of("Abaji", "Raoji"));

// OUTPUT:
// <li>1. Abaji</li>
// <li class="last">2. Raoji</li>`]],
        [['Iterate a map.',
            r`// <p th:each="e : ` + V('stock') + r`" th:text="` + V('e.key') + r` + '=' + ` + V('e.value') + r`">x</p>
model.addAttribute("stock", new LinkedHashMap<>(Map.of("pen", 5)));

// OUTPUT:
// <p>pen=5</p>`],
            ['Test the number of rows.',
                r`String html = mvc.perform(get("/products"))
    .andReturn().getResponse().getContentAsString();
assertThat(StringUtils.countOccurrencesOf(html, "<tr>")).isEqualTo(2);

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-th-href': x(
        ['<b>th:href</b> sets the href attribute of a link from a link expression such as <code>@{/products}</code>.',
            '<b>Context path</b>: <code>@{/x}</code> starts with a slash, so Thymeleaf adds the application context path automatically.',
            '<b>Parameters</b> go in parentheses: <code>@{/search(q=&#36;{term})}</code> becomes <code>/search?q=java</code> with correct URL encoding.'],
        ['<b>Path variables</b>: <code>@{/users/{id}(id=&#36;{u.id})}</code> fills the placeholder and does not add it as a query parameter.',
            '<b>Absolute URLs</b>: <code>@{https://example.com}</code> is left unchanged; <code>@{//host/x}</code> keeps the protocol.',
            '<b>Server-relative</b>: <code>@{~/other-app/x}</code> ignores the current context path.'],
        ['<b>URL encoding</b>: values are encoded for you, so never concatenate user input into href with plus signs.',
            '<b>Session rewriting</b>: link expressions pass through <code>response.encodeURL</code>, which may append a jsessionid when cookies are disabled.',
            '<b>Refactoring</b>: keeping paths in link expressions makes a context-path change or reverse proxy prefix safe.'],
        [['F', 'What is th:href for?', 'It builds a link URL from a link expression and writes it to the href attribute.'],
            ['F', 'What does @{...} mean?', 'It is a link URL expression that is resolved against the context path.'],
            ['M', 'How do you add query parameters?', 'Put them in parentheses after the path, like @{/search(q=java,page=2)}.'],
            ['M', 'How do you fill a path variable?', 'Use a placeholder in braces in the path and give its value in the parentheses.'],
            ['S', 'Why not write href with string concatenation?', 'You lose the context path handling and URL encoding, which leads to broken links and injection issues.'],
            ['S', 'How can a link to a controller method be type safe?', 'Thymeleaf has the controller mapping expression @{MyController#method()} (needs the mapping name) but plain path expressions are far more common.']],
        [['Link with a path variable.',
            r`// <a th:href="@{/users/{id}(id=` + V('u.id') + r`)}">View</a>
model.addAttribute("u", new User(7L, "Abaji"));

// OUTPUT:
// <a href="/users/7">View</a>`],
            ['Query parameters are encoded.',
                r`// <a th:href="@{/search(q=` + V('term') + r`,page=1)}">Go</a>
model.addAttribute("term", "spring mvc");

// OUTPUT:
// <a href="/search?q=spring%20mvc&amp;page=1">Go</a>`]],
        [['Context path aware link.',
            r`# application.properties
server.servlet.context-path=/shop
// <a th:href="@{/cart}">Cart</a>

// OUTPUT:
// <a href="/shop/cart">Cart</a>`],
            ['Test the generated link.',
                r`mvc.perform(get("/").contextPath("/shop"))
   .andExpect(content().string(containsString("href=\"/shop/cart\"")));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-th-src': x(
        ['<b>th:src</b> sets the src attribute of images, scripts and iframes from a link expression, such as <code>th:src=&quot;@{/images/logo.png}&quot;</code>.',
            '<b>Static files</b>: Spring Boot serves files from <code>classpath:/static/</code>, so <code>static/images/logo.png</code> is reachable as <code>/images/logo.png</code>.',
            '<b>Why not plain src</b>: a plain absolute path breaks when the app runs under a context path; th:src adds it for you.'],
        ['<b>Scripts and styles</b>: use <code>th:src</code> on script tags and <code>th:href</code> on link tags.',
            '<b>Dynamic images</b>: <code>th:src=&quot;@{/photos/{id}(id=&#36;{p.id})}&quot;</code> points to a controller that streams the bytes.',
            '<b>WebJars</b>: libraries packed as WebJars are served under <code>/webjars/**</code> and linked the same way.'],
        ['<b>Cache busting</b>: add a content hash or version to the URL using resource chain settings (<code>spring.web.resources.chain.strategy.content.enabled</code>).',
            '<b>Caching</b>: set <code>spring.web.resources.cache.cachecontrol.max-age</code> to let browsers cache static files.',
            '<b>Security</b>: Spring Security must permit the static paths, otherwise images redirect to the login page.'],
        [['F', 'What does th:src do?', 'It writes the src attribute using a resolved URL expression.'],
            ['F', 'Where do you place images in Spring Boot?', 'Under src/main/resources/static (or public), which is served from the web root.'],
            ['M', 'Why is th:src better than src?', 'It respects the context path and URL rewriting.'],
            ['M', 'How do you show an image stored in a database?', 'Point th:src at a controller endpoint that returns the bytes with the right content type.'],
            ['S', 'How do you avoid stale cached JavaScript?', 'Enable the resource chain with a content or fixed version strategy so the URL changes when the file changes.'],
            ['S', 'Why would a static image redirect to login?', 'Spring Security protects every path by default; permit /images/** and similar paths.']],
        [['Logo and script tags.',
            r`// <img th:src="@{/images/logo.png}" alt="Logo">
// <script th:src="@{/js/app.js}"></script>

// OUTPUT:
// <img src="/images/logo.png" alt="Logo">
// <script src="/js/app.js"></script>`],
            ['Dynamic image endpoint.',
                r`@GetMapping("/photos/{id}")
ResponseEntity<byte[]> photo(@PathVariable long id) {
    return ResponseEntity.ok()
        .contentType(MediaType.IMAGE_PNG)
        .body(photoService.bytes(id));
}
// <img th:src="@{/photos/{id}(id=` + V('p.id') + r`)}">

// OUTPUT:
// <img src="/photos/5">`]],
        [['Content hash versioning.',
            r`# application.properties
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
# the resource URL then contains a hash of the file content

// OUTPUT:
// /js/app-3f5a1b.js (hash varies)`],
            ['Permit static paths in Spring Security.',
                r`http.authorizeHttpRequests(a -> a
    .requestMatchers("/images/**", "/css/**", "/js/**").permitAll()
    .anyRequest().authenticated());

// OUTPUT:
// GET /images/logo.png -> 200 without login`]]
    ),

    'mvc-th-value': x(
        ['<b>th:value</b> sets the value attribute of an element, usually an input, from an expression: <code>&lt;input th:value=&quot;&#36;{user.email}&quot;&gt;</code>.',
            '<b>One-way</b>: it only writes the value into the HTML; it does not add a name or id and does not bind back by itself.',
            '<b>Common uses</b>: hidden inputs, button labels, option values and prefilled search boxes.'],
        ['<b>Name needed</b>: add a <code>name</code> attribute yourself, otherwise the browser does not submit the field.',
            '<b>th:field</b> is the form-binding alternative: it sets id, name and value together from the object bound with th:object.',
            '<b>Hidden id</b>: <code>&lt;input type=&quot;hidden&quot; name=&quot;id&quot; th:value=&quot;&#36;{item.id}&quot;&gt;</code> carries the key on edit forms.'],
        ['<b>Escaping</b>: the value is HTML-attribute escaped, which blocks quote-based injection.',
            '<b>Null</b>: a null expression removes the value attribute, which gives an empty field.',
            '<b>Selected options</b>: for select lists use <code>th:selected</code> with a comparison, or let th:field do it.'],
        [['F', 'What does th:value do?', 'It sets the value attribute of the tag from an expression.'],
            ['F', 'Does th:value bind the form?', 'No. It only displays a value; binding on submit depends on the name attribute.'],
            ['M', 'th:value or th:field?', 'Use th:field with th:object for bound forms; use th:value for simple, unbound inputs.'],
            ['M', 'How do you preselect an option?', 'Use th:selected with a boolean expression comparing the option value to the current value.'],
            ['S', 'Why does my edited field not reach the controller?', 'The input has no name attribute (th:value does not create one).'],
            ['S', 'Why use a hidden th:value for the id?', 'To keep the entity key across the POST without exposing it as editable.']],
        [['Prefilled search box.',
            r`// <input type="text" name="q" th:value="` + V('q') + r`">
model.addAttribute("q", "spring");

// OUTPUT:
// <input type="text" name="q" value="spring">`],
            ['Hidden id and button label.',
                r`// <input type="hidden" name="id" th:value="` + V('item.id') + r`">
// <button type="submit" th:value="#{save}">Save</button>

// OUTPUT:
// <input type="hidden" name="id" value="12">
// <button type="submit" value="Save">Save</button>`]],
        [['Select with preselected option.',
            r`// <select name="city">
//   <option th:each="c : ` + V('cities') + r`" th:value="` + V('c') + r`"
//           th:text="` + V('c') + r`" th:selected="` + V('c == city') + r`">x</option>
// </select>

// OUTPUT:
// <option value="Pune" selected="selected">Pune</option>
// <option value="Delhi">Delhi</option>`],
            ['Test the rendered value.',
                r`mvc.perform(get("/search").param("q", "spring"))
   .andExpect(content().string(containsString("value=\"spring\"")));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-th-object': x(
        ['<b>th:object</b> declares the form backing object for a tag and its children, as in <code>&lt;form th:object=&quot;&#36;{user}&quot;&gt;</code>.',
            '<b>Selection expressions</b>: inside it, <code>*{name}</code> means the property of the selected object, the same as <code>&#36;{user.name}</code>.',
            '<b>Model attribute</b>: the controller must put an object with that name in the model before the form renders.'],
        ['<b>Scope</b>: the selected object lasts until the end of the tag that holds th:object; you cannot nest it in another th:object.',
            '<b>th:field</b> needs th:object (or an explicit expression) to know which bean property to bind.',
            '<b>Not just forms</b>: you can use th:object on a div to avoid repeating a long path like &#36;{order.customer.address}.'],
        ['<b>Missing attribute</b>: if the model has no attribute with that name, rendering fails with an error about the neither BindingResult nor plain target object.',
            '<b>Command object</b>: for create forms add an empty instance (<code>new User()</code>) in the GET handler.',
            '<b>Redirect and flash</b>: after a redirect, data is lost unless you use flash attributes or reload the object.'],
        [['F', 'What is th:object?', 'It sets the object that the form (or any block) works with, so that *{...} expressions refer to it.'],
            ['F', 'What does *{name} mean?', 'A selection expression: the name property of the object chosen by th:object.'],
            ['M', 'Why must the GET handler add an object?', 'The template needs a bean to bind fields to, and Spring also needs it to build the BindingResult.'],
            ['M', 'Can you mix &#36;{...} and *{...}?', 'Yes. &#36;{...} reads from the whole context and *{...} from the selected object.'],
            ['S', 'Which error shows when the object is missing?', 'IllegalStateException: Neither BindingResult nor plain target object for bean name.'],
            ['S', 'How does the POST get the same type?', 'The handler takes a @ModelAttribute parameter whose name matches the th:object name.']],
        [['Simple form with th:object.',
            r`@GetMapping("/users/new")
String form(Model model) {
    model.addAttribute("user", new User());
    return "user-form";
}
// <form th:action="@{/users}" th:object="` + V('user') + r`" method="post">
//   <input th:field="*{name}">
// </form>

// OUTPUT:
// <form action="/users" method="post">
//   <input type="text" id="name" name="name" value="">
// </form>`],
            ['Selection expressions on a block.',
                r`// <div th:object="` + V('order.customer') + r`">
//   <p th:text="*{name}">x</p>
//   <p th:text="*{city}">x</p>
// </div>

// OUTPUT:
// <div><p>Abaji</p><p>Pune</p></div>`]],
        [['Edit form loads an existing bean.',
            r`@GetMapping("/users/{id}/edit")
String edit(@PathVariable long id, Model model) {
    model.addAttribute("user", userService.get(id));
    return "user-form";
}

// OUTPUT:
// <input type="text" id="name" name="name" value="Abaji">`],
            ['Test the model attribute.',
                r`mvc.perform(get("/users/new"))
   .andExpect(model().attributeExists("user"))
   .andExpect(view().name("user-form"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-th-field': x(
        ['<b>th:field</b> binds a form control to a property of the th:object bean, as in <code>th:field=&quot;*{email}&quot;</code>.',
            '<b>Three attributes in one</b>: it generates <code>id</code>, <code>name</code> and <code>value</code> from the property, so the field shows the current value and posts back under the right name.',
            '<b>Needs th:object</b>: the form must declare the bean it belongs to.'],
        ['<b>Input types</b>: it works for text, password, hidden, textarea, checkbox, radio and select.',
            '<b>Checkboxes</b>: for a boolean it renders a checkbox plus a hidden field named with a leading underscore, so an unchecked box still binds as false.',
            '<b>Select and radio</b>: with a list, each option uses <code>th:value</code> and th:field marks the selected one for you.'],
        ['<b>Conversion</b>: values pass through the Spring ConversionService (dates, numbers, enums) and PropertyEditors, so formats like <code>@DateTimeFormat</code> apply.',
            '<b>Errors</b>: after a failed validation the field shows the rejected value, not the original, so the user keeps their input.',
            '<b>Do not mix</b> th:field with th:value, name or id on the same tag; th:field wins and the other attributes confuse readers.'],
        [['F', 'What does th:field do?', 'It links an input to a bean property by generating id, name and value.'],
            ['F', 'Which expression type does it use?', 'A selection expression such as *{name}.'],
            ['M', 'How is an unchecked checkbox handled?', 'th:field adds a hidden _name field, so Spring can bind false when the box is not sent.'],
            ['M', 'How do you format a date input?', 'Annotate the property with @DateTimeFormat and the field renders and parses with that pattern.'],
            ['S', 'Why must th:object exist?', 'th:field resolves the property through a BindStatus, which needs a bean (and its BindingResult) in the model.'],
            ['S', 'Why does the field keep wrong input after an error?', 'It reads the rejected value from the BindingResult before using the bean value.']],
        [['Text, checkbox and select.',
            r`// <input th:field="*{name}">
// <input type="checkbox" th:field="*{active}">
// <select th:field="*{city}">
//   <option th:each="c : ` + V('cities') + r`" th:value="` + V('c') + r`" th:text="` + V('c') + r`"></option>
// </select>

// OUTPUT:
// <input type="text" id="name" name="name" value="Abaji">
// <input type="checkbox" id="active1" name="active" value="true" checked="checked">
// <input type="hidden" name="_active" value="on">`],
            ['Radio buttons from an enum.',
                r`// <label th:each="r : ` + V('T(com.demo.Role).values()') + r`">
//   <input type="radio" th:field="*{role}" th:value="` + V('r') + r`">
//   <span th:text="` + V('r') + r`"></span>
// </label>

// OUTPUT:
// <input type="radio" id="role1" name="role" value="USER" checked="checked">
// <input type="radio" id="role2" name="role" value="ADMIN">`]],
        [['Date field with a format.',
            r`public class Booking {
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
}
// <input type="date" th:field="*{date}">

// OUTPUT:
// <input type="date" id="date" name="date" value="2025-01-15">`],
            ['Post the form in a test.',
                r`mvc.perform(post("/users").param("name", "Abaji").param("active", "true"))
   .andExpect(status().is3xxRedirection());

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    ),

    'mvc-form-binding-thymeleaf': x(
        ['<b>Form binding</b> connects HTML form fields to a Java object: on GET the object fills the form, on POST Spring fills the object from the request parameters.',
            '<b>Pieces</b>: the controller adds a bean to the Model, the template uses <code>th:object</code> and <code>th:field</code>, and the POST handler receives it with <code>@ModelAttribute</code>.',
            '<b>Data binder</b>: Spring uses <code>WebDataBinder</code> to match parameter names to property names and convert the text to the right types.'],
        ['<b>Field names</b> must match bean property names, including nested ones like <code>address.city</code>.',
            '<b>Type errors</b>: text that cannot be converted (letters for an int) becomes a binding error in <code>BindingResult</code> instead of an exception.',
            '<b>Post-Redirect-Get</b>: after a successful POST redirect to a GET page, so a browser refresh does not submit the form twice.'],
        ['<b>Mass assignment</b>: binding copies any matching parameter, so bind to a dedicated form class or use <code>@InitBinder</code> with <code>setAllowedFields</code> instead of binding entities directly.',
            '<b>Collections</b>: indexed names such as <code>items[0].qty</code> bind lists; <code>autoGrowCollectionLimit</code> bounds growth.',
            '<b>Flash attributes</b> carry a success message across the redirect without putting it in the URL.'],
        [['F', 'What is form binding?', 'Mapping form fields to the properties of a Java object, in both directions.'],
            ['F', 'Which annotation takes the bean on POST?', '@ModelAttribute (it is the default for non-simple parameter types).'],
            ['M', 'What is BindingResult?', 'It holds binding and validation errors for the preceding bean parameter, so it must come right after it.'],
            ['M', 'What is Post-Redirect-Get?', 'After a successful POST, redirect to a GET page, which prevents duplicate submissions on refresh.'],
            ['S', 'How do you stop attackers from setting extra properties?', 'Bind to a form DTO, or restrict with WebDataBinder setAllowedFields in @InitBinder.'],
            ['S', 'What happens when conversion fails?', 'A typeMismatch error is added to BindingResult; the controller can re-show the form with the message.']],
        [['Full form cycle.',
            r`@Controller
class UserController {
    @GetMapping("/users/new")
    String form(Model model) {
        model.addAttribute("userForm", new UserForm());
        return "user-form";
    }
    @PostMapping("/users")
    String save(@ModelAttribute("userForm") UserForm form) {
        userService.create(form);
        return "redirect:/users";
    }
}

// OUTPUT:
// POST /users name=Abaji -> 302 Location: /users`],
            ['Form class with fields.',
                r`public class UserForm {
    private String name;
    private int age;
    // getters and setters
}
// <input th:field="*{name}"> <input th:field="*{age}">

// OUTPUT:
// age=abc -> typeMismatch error in BindingResult (varies by locale text)`]],
        [['Allow only some fields.',
            r`@InitBinder
void init(WebDataBinder binder) {
    binder.setAllowedFields("name", "age");   // ignore anything else
}

// OUTPUT:
// POST ...&admin=true -> admin is not bound`],
            ['Flash message after redirect.',
                r`@PostMapping("/users")
String save(UserForm form, RedirectAttributes ra) {
    userService.create(form);
    ra.addFlashAttribute("msg", "User saved");
    return "redirect:/users";
}

// OUTPUT:
// GET /users -> page shows "User saved" once`]]
    ),

    'mvc-thymeleaf-validation': x(
        ['<b>Thymeleaf validation</b> shows Bean Validation errors next to form fields: annotate the bean, validate in the controller, and render messages with <code>th:errors</code>.',
            '<b>Steps</b>: add <code>@Valid</code> to the bean parameter, take a <code>BindingResult</code> right after it, and return the form view when <code>hasErrors()</code> is true.',
            '<b>Annotations</b> come from <code>jakarta.validation.constraints</code>, such as <code>@NotBlank</code>, <code>@Size</code>, <code>@Email</code> and <code>@Min</code>.'],
        ['<b>th:errors</b> prints the messages for a field: <code>&lt;span th:errors=&quot;*{email}&quot;&gt;</code>.',
            '<b>Conditional style</b>: <code>th:if=&quot;&#36;{#fields.hasErrors(&#39;email&#39;)}&quot;</code> or <code>th:errorclass=&quot;is-invalid&quot;</code> highlights the bad field.',
            '<b>Global errors</b>: <code>#fields.hasGlobalErrors()</code> and <code>th:errors=&quot;*{global}&quot;</code> show class-level errors.'],
        ['<b>Message source</b>: a message comes from the annotation message, or from <code>messages.properties</code> keys like <code>NotBlank.user.name</code>.',
            '<b>BindingResult order</b>: it must directly follow the validated parameter, or Spring throws instead of letting you handle errors.',
            '<b>Server side always</b>: browser checks (<code>required</code>) are a convenience only; keep the Bean Validation rules.'],
        [['F', 'How do you validate a form?', 'Put @Valid on the bean parameter and check BindingResult.hasErrors().'],
            ['F', 'Which attribute prints errors?', 'th:errors, for example th:errors=&quot;*{name}&quot;.'],
            ['M', 'Why must BindingResult follow the bean?', 'Spring pairs it with the preceding argument; otherwise a MethodArgumentNotValidException or BindException is thrown.'],
            ['M', 'How do you customize an error text?', 'Use the message attribute of the annotation or a key such as Size.userForm.name in messages.properties.'],
            ['S', 'How do you add a cross-field rule?', 'Write a class-level constraint or a custom ConstraintValidator, or call bindingResult.rejectValue in the controller.'],
            ['S', 'How do you test validation?', 'POST invalid params with MockMvc and assert model().attributeHasFieldErrors and the returned view name.']],
        [['Annotated form and controller.',
            r`public class UserForm {
    @NotBlank(message = "Name is required")
    private String name;
    @Email @NotBlank
    private String email;
    // getters and setters
}
@PostMapping("/users")
String save(@Valid @ModelAttribute("userForm") UserForm form,
            BindingResult result) {
    if (result.hasErrors()) return "user-form";   // redisplay with errors
    userService.create(form);
    return "redirect:/users";
}

// OUTPUT:
// empty name -> view user-form with error "Name is required"`],
            ['Template with errors.',
                r`// <input th:field="*{name}" th:errorclass="is-invalid">
// <span class="err" th:if="` + V("#fields.hasErrors('name')") + r`"
//       th:errors="*{name}">x</span>

// OUTPUT:
// <input type="text" id="name" name="name" value="" class="is-invalid">
// <span class="err">Name is required</span>`]],
        [['Message keys in properties.',
            r`# messages.properties
NotBlank.userForm.name=Please enter your name
Email.userForm.email=Enter a valid email address
typeMismatch.userForm.age=Age must be a number

// OUTPUT:
// the field shows "Please enter your name" when it is blank`],
            ['MockMvc test for errors.',
                r`mvc.perform(post("/users").param("name", "").param("email", "bad"))
   .andExpect(status().isOk())
   .andExpect(view().name("user-form"))
   .andExpect(model().attributeHasFieldErrors("userForm", "name", "email"));

// OUTPUT:
// Tests run: 1, Failures: 0, Errors: 0`]]
    )
};

export const smvc33Deep: Record<string, Deep> = {
    'mvc-th-text': dv(
        [`<p>th:text is an attribute processor of the standard dialect.</p><ul><li><b>Parse:</b> the template is read into an event stream; the processor finds the attribute on the open tag.</li><li><b>Evaluate:</b> the expression is run by the SpringEL evaluator against the context built from the model.</li><li><b>Escape:</b> the result is HTML-escaped and replaces the element body.</li><li><b>Render:</b> the <code>ThymeleafView</code> writes the output to the response.</li></ul>`,
            r`@Bean
SpringResourceTemplateResolver resolver() {
    var r = new SpringResourceTemplateResolver();
    r.setPrefix("classpath:/templates/");
    r.setSuffix(".html");
    r.setTemplateMode(TemplateMode.HTML);
    return r;       // Spring Boot auto-configures the same by default
}

// OUTPUT:
// view "hello" -> classpath:/templates/hello.html -> HTML response`],
        [`<p>Syntax variants:</p><ul><li><b>th:text:</b> escaped body text.</li><li><b>th:utext:</b> unescaped body.</li><li><b>Inline:</b> double square brackets are escaped and square-bracket-parenthesis is unescaped.</li><li><b>Literals:</b> text in pipes, concatenation with plus.</li><li><b>Messages:</b> #{key(args)}.</li><li><b>Defaults:</b> Elvis operator and no-operation underscore.</li></ul>`,
            r`// <p>Hello, [[` + V('name') + r`]]!</p>
// <p th:text="` + V('name') + r` ?: 'guest'">x</p>
// <p th:text="` + V('missing') + r` ?: _">default body kept</p>
// <p th:text="` + V("#strings.toUpperCase(name)") + r`">x</p>

// OUTPUT:
// <p>Hello, Abaji!</p>
// <p>Abaji</p>
// <p>default body kept</p>
// <p>ABAJI</p>`],
        [`<p>Typical mistakes:</p><ul><li><b>th:utext with user input:</b> an XSS hole; sanitize or use th:text.</li><li><b>Wrong attribute name:</b> <code>th:txt</code> is ignored silently and the prototype text is shown.</li><li><b>Missing namespace:</b> not needed for rendering, but the IDE loses completion.</li><li><b>Nested quotes:</b> use single quotes for literals inside double-quoted attributes.</li><li><b>Template not found:</b> a view name that does not match the file name.</li></ul>`,
            r`// WRONG: raw user input is output as HTML
// <div th:utext="` + V('comment') + r`"></div>
// RIGHT: escaped output
// <div th:text="` + V('comment') + r`"></div>

// OUTPUT:
// comment "<script>alert(1)</script>" is shown as text, not executed`],
        [`<p>Performance notes:</p><ul><li><b>Cache:</b> keep <code>spring.thymeleaf.cache=true</code> in production; turn it off only in development.</li><li><b>Expressions:</b> keep them simple; do the heavy work in the controller.</li><li><b>Fragments:</b> reuse them to reduce template parsing.</li><li><b>Output size:</b> avoid giant loops of text; page the data.</li></ul>`,
            r`# application.properties
spring.thymeleaf.cache=true       # parsed templates are cached in production
# spring.thymeleaf.cache=false    # dev only: reload templates on change

# OUTPUT:
# first request parses hello.html;
later requests reuse the cached template`],
        [`<p>Scenario: a profile page shows the user name, a localized welcome and a safe bio. The controller exposes a small view model, and the template only prints it. Unit tests assert the rendered text.</p>`,
            r`record ProfileView(String name, String bio) {}

@GetMapping("/profile")
String profile(Model model, Principal p) {
    model.addAttribute("p", new ProfileView(p.getName(), "Loves <Java>"));
    return "profile";
}
// <h1 th:text="#{welcome(` + V('p.name') + r`)}">x</h1>
// <p th:text="` + V('p.bio') + r`">x</p>

// OUTPUT:
// <h1>Welcome, abaji</h1>
// <p>Loves &lt;Java&gt;</p>`]
    ),

    'mvc-th-if': dv(
        [`<p>Conditional processors run before the content is rendered.</p><ul><li><b>Precedence:</b> th:if has higher precedence than th:text and th:each? No: th:each runs first, then th:if on each iteration.</li><li><b>Evaluation:</b> the expression result is converted to boolean by the standard rules.</li><li><b>False:</b> the element and its children are removed from the event stream.</li></ul>`,
            r`// th:each runs before th:if, so the test is per item
// <li th:each="n : ` + V('nums') + r`" th:if="` + V('n % 2 == 0') + r`" th:text="` + V('n') + r`">x</li>
model.addAttribute("nums", List.of(1, 2, 3, 4));

// OUTPUT:
// <li>2</li>
// <li>4</li>`],
        [`<p>Options and variants:</p><ul><li><b>th:if / th:unless:</b> simple pairs.</li><li><b>Ternary:</b> <code>cond ? a : b</code> inside any attribute value.</li><li><b>th:switch:</b> equality based branching.</li><li><b>th:classappend:</b> add a class conditionally.</li><li><b>th:block:</b> a conditional group with no wrapper tag.</li></ul>`,
            r`// <th:block th:if="` + V('user != null') + r`">
//   <p>Hi</p><p>Welcome</p>
// </th:block>
// <span th:class="` + V('active') + r` ? 'on' : 'off'">x</span>
// <li th:classappend="` + V('active') + r` ? 'selected'">x</li>

// OUTPUT:
// <p>Hi</p><p>Welcome</p>
// <span class="on">x</span>
// <li class="selected">x</li>`],
        [`<p>Typical mistakes:</p><ul><li><b>Null pointer in the condition:</b> use <code>?.</code> or a null check first.</li><li><b>Using the string false:</b> the text is false, but a non-empty value like "0" is true? Thymeleaf treats the number 0 as false but the string "0" is true; compare explicitly.</li><li><b>Hiding as security:</b> still protect the endpoint.</li><li><b>Heavy logic:</b> long boolean chains belong in the controller.</li></ul>`,
            r`// WRONG: exception if user is null
// <p th:if="` + V('user.admin') + r`">x</p>
// RIGHT: safe navigation
// <p th:if="` + V('user?.admin') + r`">x</p>

// OUTPUT:
// user == null -> element not rendered, no exception`],
        [`<p>Performance: conditionals are cheap. The cost is in the expression, so avoid calling service methods from the template; compute once in the controller and expose the result.</p>`,
            r`// Prefer a precomputed flag from the controller
model.addAttribute("canEdit", authService.canEdit(user, doc));
// <button th:if="` + V('canEdit') + r`">Edit</button>

// OUTPUT:
// one permission check per request instead of one per template node`],
        [`<p>Scenario: a dashboard shows an "Approve" button only to managers, and a banner for an empty inbox. The server also enforces access with method security.</p>`,
            r`@PreAuthorize("hasRole('MANAGER')")
@PostMapping("/approve/{id}")
String approve(@PathVariable long id) { /* ... */ return "redirect:/inbox"; }
// <form th:if="` + V("#authorization.expression('hasRole(''MANAGER'')')") + r`">
//   <button>Approve</button>
// </form>

// OUTPUT:
// manager: button shown; user: no button and POST gives 403`]
    ),

    'mvc-th-each': dv(
        [`<p>th:each has high precedence and expands the element into several copies.</p><ul><li><b>Iterable:</b> the engine accepts Iterable, Map, array, Iterator, Enumeration and Stream.</li><li><b>Status object:</b> a lightweight IterationStatusVar is updated per round.</li><li><b>Scope:</b> the item variable is local to each repeated element.</li></ul>`,
            r`// <tr th:each="p, st : ` + V('products') + r`">
//   <td th:text="` + V('st.index') + r`">0</td>
//   <td th:text="` + V('st.size') + r`">0</td>
//   <td th:text="` + V('p.name') + r`">x</td>
// </tr>

// OUTPUT:
// <tr><td>0</td><td>2</td><td>Pen</td></tr>
// <tr><td>1</td><td>2</td><td>Book</td></tr>`],
        [`<p>Variants:</p><ul><li><b>Status fields:</b> index, count, size, current, even, odd, first, last.</li><li><b>Maps:</b> entries with key and value.</li><li><b>Ranges:</b> <code>#numbers.sequence(1,5)</code>.</li><li><b>Nested loops:</b> inner th:each sees the outer variable.</li><li><b>th:block:</b> repeat sibling tags.</li></ul>`,
            r`// <span th:each="i : ` + V('#numbers.sequence(1,3)') + r`" th:text="` + V('i') + r`"> </span>
// <th:block th:each="g : ` + V('groups') + r`">
//   <h3 th:text="` + V('g.name') + r`">x</h3>
//   <p th:each="m : ` + V('g.members') + r`" th:text="` + V('m') + r`">x</p>
// </th:block>

// OUTPUT:
// <span>1</span><span>2</span><span>3</span>
// <h3>Team A</h3><p>Abaji</p><p>Raoji</p>`],
        [`<p>Typical mistakes:</p><ul><li><b>th:each on the table tag:</b> it repeats the whole table; place it on the row.</li><li><b>Null collection:</b> a null iterable renders nothing, but a typo in the name also renders nothing; check the model.</li><li><b>Lazy loading outside a session:</b> LazyInitializationException; use DTOs or fetch joins.</li><li><b>Modifying the list in the loop:</b> not possible from the template, do it in the controller.</li></ul>`,
            r`// WRONG: repeats the whole table
// <table th:each="p : ` + V('products') + r`">...</table>
// RIGHT: repeat only the row
// <tr th:each="p : ` + V('products') + r`">...</tr>

// OUTPUT:
// one table with N rows`],
        [`<p>Performance: rendering time grows with the number of rows and nested loops. Use pagination, avoid N+1 queries by loading data eagerly in the service, and prefer DTO projections for read-only views.</p>`,
            r`Page<ProductDto> page = repo.findAllProjectedBy(PageRequest.of(0, 20));
model.addAttribute("page", page);
// <tr th:each="p : ` + V('page.content') + r`">...</tr>
// <a th:if="` + V('page.hasNext()') + r`" th:href="@{/products(page=` + V('page.number + 1') + r`)}">Next</a>

// OUTPUT:
// 20 rows rendered, one SQL query (varies)`],
        [`<p>Scenario: an order history page with a row per order and a nested list of items. The service returns DTOs so that rendering needs no database access.</p>`,
            r`record OrderRow(long id, List<String> items) {}
@GetMapping("/orders")
String orders(Model model) {
    model.addAttribute("orders", orderService.rows());
    return "orders";
}
// <tr th:each="o : ` + V('orders') + r`"><td th:text="` + V('o.id') + r`"></td>
//   <td><span th:each="i : ` + V('o.items') + r`" th:text="` + V('i') + r`"></span></td></tr>

// OUTPUT:
// <tr><td>101</td><td><span>Pen</span><span>Ink</span></td></tr>`]
    ),

    'mvc-th-href': dv(
        [`<p>Link expressions are resolved by the standard link builder.</p><ul><li><b>Detection:</b> the URL type is found from its start: absolute, protocol-relative, context-relative, server-relative.</li><li><b>Build:</b> the context path is prepended for context-relative URLs, then path variables and parameters are applied.</li><li><b>Finish:</b> the result goes through <code>HttpServletResponse.encodeURL</code>.</li></ul>`,
            r`// context path /shop, request for the page
// <a th:href="@{/a}">1</a>
// <a th:href="@{~/other/a}">2</a>
// <a th:href="@{https://example.com/a}">3</a>

// OUTPUT:
// <a href="/shop/a">1</a>
// <a href="/other/a">2</a>
// <a href="https://example.com/a">3</a>`],
        [`<p>Variants:</p><ul><li><b>Parameters:</b> comma separated, repeated keys with a list value.</li><li><b>Path variables:</b> placeholders in braces.</li><li><b>Fragment:</b> add <code>#section</code> after the path.</li><li><b>Dynamic path:</b> compute the base in a variable and wrap with @{...}.</li></ul>`,
            r`// <a th:href="@{/items/{id}/reviews(id=` + V('i.id') + r`,sort='date')}">x</a>
// <a th:href="@{/faq#billing}">FAQ</a>
// <a th:href="@{/tags(t=` + V('tags') + r`)}">x</a>   <!-- tags = [a, b] -->

// OUTPUT:
// <a href="/items/9/reviews?sort=date">x</a>
// <a href="/faq#billing">FAQ</a>
// <a href="/tags?t=a,b">x</a>`],
        [`<p>Mistakes:</p><ul><li><b>Plain href with a slash:</b> breaks under a context path.</li><li><b>Missing parentheses:</b> parameters written in the path string are not encoded.</li><li><b>Relative path without slash:</b> resolved against the current URL and changes by page.</li><li><b>Forgetting th prefix:</b> a plain href keeps the raw expression text.</li></ul>`,
            r`// WRONG: not encoded, no context path
// <a href="/search?q=` + V('term') + r`">x</a>
// RIGHT
// <a th:href="@{/search(q=` + V('term') + r`)}">x</a>

// OUTPUT:
// term "a&b" -> /search?q=a%26b`],
        [`<p>Performance: link building is cheap. Where many links are produced, avoid calling services in the expression; pass ready ids from the model.</p>`,
            r`# behind a reverse proxy, honor the forwarded prefix
server.forward-headers-strategy=framework

// OUTPUT:
// generated links use the external host and prefix (varies by proxy)`],
        [`<p>Scenario: a paginated list with sort links. Each header link keeps the current page size and toggles the direction.</p>`,
            r`// <a th:href="@{/users(page=` + V('page.number') + r`,size=` + V('page.size') + r`,sort='name,asc')}">Name</a>

// OUTPUT:
// <a href="/users?page=0&amp;size=20&amp;sort=name,asc">Name</a>`]
    ),

    'mvc-th-src': dv(
        [`<p>Static resources are served by a resource handler.</p><ul><li><b>Mapping:</b> <code>/**</code> is mapped to the static locations: classpath:/static, /public, /resources, /META-INF/resources.</li><li><b>Lookup:</b> <code>ResourceHttpRequestHandler</code> finds the file and sets caching headers.</li><li><b>Link:</b> th:src builds the URL; the browser then requests it from the handler.</li></ul>`,
            r`// src/main/resources/static/css/site.css  -> GET /css/site.css
// src/main/resources/public/img/a.png    -> GET /img/a.png
// <link rel="stylesheet" th:href="@{/css/site.css}">
// <img th:src="@{/img/a.png}">

// OUTPUT:
// GET /css/site.css 200 text/css
// GET /img/a.png 200 image/png`],
        [`<p>Options:</p><ul><li><b>Custom path:</b> <code>spring.mvc.static-path-pattern=/assets/**</code>.</li><li><b>Extra locations:</b> <code>spring.web.resources.static-locations</code>.</li><li><b>WebJars:</b> <code>/webjars/**</code> with the version-agnostic locator.</li><li><b>Inline data:</b> small images may be Base64 data URIs.</li></ul>`,
            r`spring.mvc.static-path-pattern=/assets/**
spring.web.resources.static-locations=classpath:/static/,file:./uploads/
# <script th:src="@{/webjars/bootstrap/js/bootstrap.bundle.min.js}"></script>

# OUTPUT:
# /assets/logo.png is served from static/logo.png`],
        [`<p>Mistakes:</p><ul><li><b>Files placed under templates:</b> not served as static content.</li><li><b>Wrong folder name:</b> <code>statics</code> instead of <code>static</code>.</li><li><b>Missing slash:</b> relative paths break on nested pages.</li><li><b>Stale cache after deploy:</b> the browser keeps the old script.</li></ul>`,
            r`// WRONG: path relative to the current page
// <img src="images/logo.png">
// RIGHT
// <img th:src="@{/images/logo.png}">

// OUTPUT:
// /products/12 page now loads /images/logo.png, not /products/images/logo.png`],
        [`<p>Performance:</p><ul><li><b>Cache headers:</b> set max-age for static files.</li><li><b>Versioned URLs:</b> allow long caching safely.</li><li><b>Compression:</b> enable <code>server.compression.enabled=true</code>.</li><li><b>CDN:</b> serve large assets from a CDN host.</li></ul>`,
            r`spring.web.resources.cache.cachecontrol.max-age=365d
spring.web.resources.chain.strategy.content.enabled=true
spring.web.resources.chain.strategy.content.paths=/**
server.compression.enabled=true

# OUTPUT:
# Cache-Control: max-age=31536000 on /js/app-<hash>.js (hash varies)`],
        [`<p>Scenario: a shop shows product photos uploaded by sellers. Files live outside the jar, and a controller or a resource location serves them.</p>`,
            r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry reg) {
        reg.addResourceHandler("/uploads/**")
           .addResourceLocations("file:/var/shop/uploads/");
    }
}
// <img th:src="@{/uploads/{f}(f=` + V('p.photo') + r`)}">

// OUTPUT:
// <img src="/uploads/p5.jpg">`]
    ),

    'mvc-th-value': dv(
        [`<p>th:value is an attribute modifier processor for the HTML value attribute.</p><ul><li><b>Process:</b> evaluates the expression and sets or replaces the attribute.</li><li><b>Null:</b> the attribute is removed.</li><li><b>th:attr:</b> a generic form, <code>th:attr=&quot;value=...&quot;</code>, does the same.</li></ul>`,
            r`// <input name="q" th:value="` + V('q') + r`">
// <input name="q" th:attr="value=` + V('q') + r`">
model.addAttribute("q", null);

// OUTPUT:
// <input name="q">
// <input name="q">`],
        [`<p>Variants:</p><ul><li><b>Boolean attributes:</b> <code>th:checked</code>, <code>th:selected</code>, <code>th:disabled</code>, <code>th:readonly</code>.</li><li><b>Formatting:</b> <code>#numbers.formatDecimal</code>, <code>#temporals.format</code>.</li><li><b>Literals:</b> a fixed value in single quotes.</li></ul>`,
            r`// <input type="checkbox" name="agree" th:checked="` + V('agreed') + r`">
// <input name="price" th:value="` + V("#numbers.formatDecimal(price,1,2)") + r`">
// <input name="mode" th:value="'edit'">

// OUTPUT:
// <input type="checkbox" name="agree" checked="checked">
// <input name="price" value="12.50">
// <input name="mode" value="edit">`],
        [`<p>Mistakes:</p><ul><li><b>No name attribute:</b> the field is not submitted.</li><li><b>Using th:value with th:field:</b> th:field overrides the value.</li><li><b>Date format:</b> a LocalDate prints in ISO form unless formatted, which an input of type date needs.</li><li><b>Trusting hidden fields:</b> users can change them; verify on the server.</li></ul>`,
            r`// WRONG: value shown but never posted
// <input th:value="` + V('user.email') + r`">
// RIGHT
// <input name="email" th:value="` + V('user.email') + r`">

// OUTPUT:
// POST body now contains email=abaji@example.com`],
        [`<p>Performance: no cost concern; the point is correctness. For large forms prefer th:field so the binding and the error redisplay are consistent.</p>`,
            r`// Keep the entered value after failed validation
// th:field -> uses the rejected value automatically
// th:value -> shows the original model value; the user input is lost

// OUTPUT:
// th:field keeps "bad-email" typed by the user; th:value would reset it`],
        [`<p>Scenario: an edit page keeps the entity id and version in hidden fields for optimistic locking. The service checks the version on save.</p>`,
            r`// <input type="hidden" name="id" th:value="` + V('item.id') + r`">
// <input type="hidden" name="version" th:value="` + V('item.version') + r`">
@Version private long version;   // JPA optimistic locking

// OUTPUT:
// stale version on save -> ObjectOptimisticLockingFailureException`]
    ),

    'mvc-th-object': dv(
        [`<p>th:object stores the selection target in the evaluation context.</p><ul><li><b>Selection target:</b> *{...} is evaluated against it instead of the root.</li><li><b>Spring support:</b> with th:field it works with <code>BindStatus</code> and <code>RequestContext</code>, using the BindingResult named after the object.</li><li><b>Model key:</b> the bean name in the expression is the model attribute name.</li></ul>`,
            r`// <form th:object="` + V('userForm') + r`">
//   <input th:field="*{name}">    -> name="name"
//   <input th:field="*{address.city}"> -> name="address.city"
// </form>

// OUTPUT:
// <input type="text" id="name" name="name" value="Abaji">
// <input type="text" id="address.city" name="address.city" value="Pune">`],
        [`<p>Options:</p><ul><li><b>Model name:</b> <code>@ModelAttribute(&quot;userForm&quot;)</code> names the attribute.</li><li><b>Nested:</b> dotted property paths.</li><li><b>Mixed expressions:</b> &#36;{#object} refers to the selected object.</li><li><b>Fragments:</b> pass the object as a fragment parameter.</li></ul>`,
            r`// <div th:object="` + V('order') + r`">
//   <span th:text="*{id}">1</span>
//   <span th:text="` + V('#object.total') + r`">0</span>
//   <span th:text="` + V('order.currency') + r`">INR</span>
// </div>

// OUTPUT:
// <div><span>101</span><span>450</span><span>INR</span></div>`],
        [`<p>Mistakes:</p><ul><li><b>Missing GET attribute:</b> the page fails with a Neither BindingResult nor plain target object error.</li><li><b>Different names:</b> th:object uses user but the model has userForm.</li><li><b>Nested th:object:</b> not allowed inside one another.</li><li><b>Using *{...} outside the scope:</b> evaluates against the root and fails.</li></ul>`,
            r`// WRONG: model has "userForm", template asks for "user"
model.addAttribute("userForm", new UserForm());
// <form th:object="` + V('user') + r`"> -> error

// RIGHT: same name
// <form th:object="` + V('userForm') + r`">

// OUTPUT:
// IllegalStateException: Neither BindingResult nor plain target object
//   for bean name 'user'`],
        [`<p>Performance: no special cost. Keep form objects small; do not put a whole entity graph into the model just for a form.</p>`,
            r`public record AddressForm(String line1, String city) {}   // small form object

// OUTPUT:
// only the needed fields are bound and rendered`],
        [`<p>Scenario: a registration wizard with a nested address. A form class holds both parts, and the same template renders create and edit.</p>`,
            r`public class RegistrationForm {
    private String name;
    private AddressForm address = new AddressForm();
    // getters and setters
}
@GetMapping("/register")
String register(Model m) {
    m.addAttribute("registrationForm", new RegistrationForm());
    return "register";
}

// OUTPUT:
// POST address.city=Pune -> registrationForm.address.city = "Pune"`]
    ),

    'mvc-th-field': dv(
        [`<p>th:field is processed by Spring dialect attribute processors, chosen by the tag type.</p><ul><li><b>Lookup:</b> the processor reads the BindStatus for the path (value, expression, errors).</li><li><b>Generate:</b> it sets name from the path, value from the displayed value and id from the name plus a counter for repeated ids.</li><li><b>Convert:</b> the displayed value goes through the formatter or PropertyEditor.</li></ul>`,
            r`// <input th:field="*{email}">
// The processor reads BindStatus for "userForm.email":
//   expression = "email", value = rejected value or bean value
// and writes id, name, value.

// OUTPUT:
// <input type="text" id="email" name="email" value="abaji@example.com">`],
        [`<p>Variants by control:</p><ul><li><b>Checkbox boolean:</b> single box plus hidden marker.</li><li><b>Checkbox list:</b> bound to a collection, one box per value.</li><li><b>Radio:</b> shared name, th:value per button.</li><li><b>Select:</b> th:field on the select tag, options with th:value.</li><li><b>Textarea and password:</b> same attribute.</li></ul>`,
            r`// <input type="checkbox" th:field="*{skills}" value="java">
// <input type="checkbox" th:field="*{skills}" value="spring">
// <textarea th:field="*{bio}"></textarea>

// OUTPUT:
// <input type="checkbox" id="skills1" name="skills" value="java" checked="checked">
// <input type="checkbox" id="skills2" name="skills" value="spring">
// <textarea id="bio" name="bio">...</textarea>`],
        [`<p>Mistakes:</p><ul><li><b>Using $ expression:</b> th:field wants *{...}; a variable expression fails.</li><li><b>Outside th:object:</b> no form bean is known.</li><li><b>Duplicate ids:</b> manual id attributes may clash; let th:field number them.</li><li><b>No getter or setter:</b> the property is not found.</li></ul>`,
            r`// WRONG: variable expression
// <input th:field="` + V('userForm.email') + r`">
// RIGHT: selection expression inside th:object
// <input th:field="*{email}">

// OUTPUT:
// the first form fails with an error about an invalid property or bean`],
        [`<p>Performance: th:field does extra binding lookups, which is negligible for ordinary forms. Large generated forms with thousands of fields should be paged.</p>`,
            r`spring.mvc.formcontentfilter.enabled=true
server.tomcat.max-http-form-post-size=2MB

# OUTPUT:
# oversized form posts are rejected before binding`],
        [`<p>Scenario: a profile form with text, a date, a select of countries and a checkbox for newsletters. Binding, conversion and redisplay after errors all rely on th:field.</p>`,
            r`public class ProfileForm {
    @NotBlank private String name;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) private LocalDate dob;
    private String country;
    private boolean newsletter;
}

// OUTPUT:
// POST name=Abaji&dob=1998-04-12&country=IN&_newsletter=on
// -> newsletter=false, others bound`]
    ),

    'mvc-form-binding-thymeleaf': dv(
        [`<p>Binding is done before the handler method runs.</p><ul><li><b>Resolve:</b> <code>ModelAttributeMethodProcessor</code> creates or gets the bean.</li><li><b>Bind:</b> <code>WebDataBinder.bind</code> copies request parameters to properties using the ConversionService.</li><li><b>Validate:</b> if @Valid is present, the Validator runs.</li><li><b>Result:</b> errors go to the BindingResult; the bean is also stored in the Model.</li></ul>`,
            r`// Request: POST /users  name=Abaji&age=30
// 1. ModelAttributeMethodProcessor instantiates UserForm
// 2. WebDataBinder sets name="Abaji", age=30 (String -> int conversion)
// 3. Validator runs for @Valid
// 4. controller method is invoked

// OUTPUT:
// UserForm[name=Abaji, age=30], BindingResult.hasErrors() = false`],
        [`<p>Variants:</p><ul><li><b>@ModelAttribute:</b> explicit name or default from the type name.</li><li><b>@RequestParam:</b> single fields.</li><li><b>Records:</b> bound through the constructor.</li><li><b>@InitBinder:</b> custom editors, trim strings, allowed fields.</li><li><b>Collections:</b> indexed names.</li></ul>`,
            r`@InitBinder
void init(WebDataBinder b) {
    b.registerCustomEditor(String.class, new StringTrimmerEditor(true));
}
public record LoginForm(String user, String pass) {}

@PostMapping("/login")
String login(LoginForm form) { /* ... */ return "redirect:/"; }

// OUTPUT:
// "  abaji  " is trimmed to "abaji" (empty becomes null)`],
        [`<p>Mistakes:</p><ul><li><b>BindingResult in the wrong place:</b> must be right after the bean.</li><li><b>Returning a view after a successful POST:</b> refresh posts again; redirect instead.</li><li><b>Binding entities:</b> mass assignment risk.</li><li><b>Missing getters/setters:</b> fields stay empty.</li><li><b>Field name mismatch:</b> silently not bound.</li></ul>`,
            r`// WRONG: BindingResult not directly after the form
// String save(@Valid UserForm f, Model m, BindingResult r)
// RIGHT
String save(@Valid UserForm f, BindingResult r, Model m) {
    return r.hasErrors() ? "user-form" : "redirect:/users";
}

// OUTPUT:
// wrong order -> 400 / BindException instead of the form with errors`],
        [`<p>Performance and limits:</p><ul><li><b>Size limits:</b> restrict request and form sizes.</li><li><b>Collections:</b> limit with <code>setAutoGrowCollectionLimit</code> (default 256).</li><li><b>Binding is reflective:</b> cheap for normal forms.</li></ul>`,
            r`@InitBinder
void limits(WebDataBinder b) {
    b.setAutoGrowCollectionLimit(50);   // protect against huge index values
}

// OUTPUT:
// items[5000].qty=1 -> IndexOutOfBounds / binding error`],
        [`<p>Scenario: an order form with a list of lines. The user adds rows, the server binds indexed names, validates and redirects with a flash message.</p>`,
            r`public class OrderForm {
    private List<LineForm> lines = new ArrayList<>();
}
// <input th:field="*{lines[__` + V('i') + r`__].qty}">
@PostMapping("/orders")
String place(@Valid OrderForm f, BindingResult r, RedirectAttributes ra) {
    if (r.hasErrors()) return "order-form";
    ra.addFlashAttribute("msg", "Order placed");
    return "redirect:/orders";
}

// OUTPUT:
// POST lines[0].qty=2&lines[1].qty=5 -> 2 lines bound`]
    ),

    'mvc-thymeleaf-validation': dv(
        [`<p>Validation sits between binding and the handler body.</p><ul><li><b>Trigger:</b> @Valid on the argument makes <code>DataBinder.validate()</code> run the Bean Validation provider (Hibernate Validator).</li><li><b>Errors:</b> each ConstraintViolation becomes a FieldError in the BindingResult.</li><li><b>Render:</b> the template reads them through <code>#fields</code> and <code>th:errors</code>.</li></ul>`,
            r`// Request: name="" email="bad"
// 1. bind -> UserForm(name="", email="bad")
// 2. validate -> violations: name (NotBlank), email (Email)
// 3. FieldError(userForm, name), FieldError(userForm, email) in BindingResult
// 4. handler returns "user-form"; #fields.hasErrors('name') is true

// OUTPUT:
// BindingResult: 2 errors (field name, field email)`],
        [`<p>Options:</p><ul><li><b>Groups:</b> <code>@Validated(Create.class)</code> chooses rule sets.</li><li><b>Custom constraint:</b> an annotation plus a ConstraintValidator.</li><li><b>Class level:</b> compare two fields.</li><li><b>Helpers:</b> <code>#fields.errors</code>, <code>#fields.allErrors</code>, <code>th:errorclass</code>.</li></ul>`,
            r`@Target(TYPE) @Retention(RUNTIME)
@Constraint(validatedBy = PasswordsMatchValidator.class)
public @interface PasswordsMatch {
    String message() default "Passwords do not match";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
// <ul><li th:each="e : ` + V('#fields.allErrors()') + r`" th:text="` + V('e') + r`">x</li></ul>

// OUTPUT:
// <ul><li>Passwords do not match</li></ul>`],
        [`<p>Mistakes:</p><ul><li><b>Missing validation starter:</b> in Boot 3 add <code>spring-boot-starter-validation</code>, or annotations are ignored.</li><li><b>No BindingResult:</b> invalid input gives a 400 error page.</li><li><b>Redirect on error:</b> loses the errors; return the view directly.</li><li><b>@NotNull for text:</b> use @NotBlank for strings.</li><li><b>Old javax imports:</b> use jakarta.validation.</li></ul>`,
            r`// pom.xml
// <dependency>
//   <groupId>org.springframework.boot</groupId>
//   <artifactId>spring-boot-starter-validation</artifactId>
// </dependency>

// OUTPUT:
// without it: @NotBlank is never checked and invalid data is saved`],
        [`<p>Performance: validation is quick. Avoid database checks inside constraint validators on every keystroke style request; do uniqueness checks in the service and map the result to a field error.</p>`,
            r`if (userRepo.existsByEmail(form.getEmail())) {
    result.rejectValue("email", "email.taken", "Email already registered");
    return "user-form";
}

// OUTPUT:
// <span class="err">Email already registered</span>`],
        [`<p>Scenario: a sign-up page with name, email, password and confirm. Field errors appear beside inputs, a global error for mismatched passwords, and tests cover both paths.</p>`,
            r`@WebMvcTest(UserController.class)
class SignupTest {
    @Autowired MockMvc mvc;

    @Test
    void invalidShowsErrors() throws Exception {
        mvc.perform(post("/signup").param("name", "").param("email", "x"))
           .andExpect(view().name("signup"))
           .andExpect(model().attributeHasFieldErrors("signupForm", "name", "email"));
    }
    @Test
    void validRedirects() throws Exception {
        mvc.perform(post("/signup").param("name", "Abaji")
                .param("email", "a@b.com").param("password", "secret123"))
           .andExpect(redirectedUrl("/welcome"));
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]
    )
};
