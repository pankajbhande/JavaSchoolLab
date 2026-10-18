// Spring extras, batch smvc37 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc37Extras: Record<string, Extra> = {
    'mvc-custom-handleradapter': x(
        ['<b>HandlerAdapter</b> is the strategy interface that lets <code>DispatcherServlet</code> invoke any kind of handler; a custom one teaches Spring MVC to call a handler type it does not know.',
            '<b>Two methods</b>: <code>supports(Object handler)</code> says whether the adapter fits, and <code>handle(request, response, handler)</code> runs it and returns a <code>ModelAndView</code>.',
            '<b>Registration</b>: declare the adapter as a <code>@Bean</code>; the servlet finds every <code>HandlerAdapter</code> bean in the context.'],
        ['<b>Lookup order</b>: <code>DispatcherServlet</code> asks each adapter in order and uses the first one whose <code>supports</code> returns true.',
            '<b>Built-ins</b>: <code>RequestMappingHandlerAdapter</code> (for <code>@Controller</code> methods), <code>HttpRequestHandlerAdapter</code> and <code>SimpleControllerHandlerAdapter</code>.',
            '<b>Return null</b> from <code>handle</code> when you wrote the response yourself, so no view is rendered.'],
        ['<b>When to build one</b>: rarely; bridging a legacy handler interface or a function-style handler is the real use case.',
            '<b>Pairing</b>: a custom adapter needs a <code>HandlerMapping</code> that returns your handler type, such as <code>BeanNameUrlHandlerMapping</code>.',
            '<b>Prefer alternatives</b> (interceptor, argument resolver, router functions) when you only need to change how arguments or results are handled.'],
        [['F', 'What does a HandlerAdapter do?', 'It invokes the handler found by the HandlerMapping, so DispatcherServlet does not need to know the handler type.'],
            ['F', 'Which method decides if an adapter applies?', 'supports(Object handler) returns true when the adapter can run that handler.'],
            ['M', 'Which adapter runs normal @GetMapping methods?', 'RequestMappingHandlerAdapter, which also applies argument resolvers and return value handlers.'],
            ['M', 'How do you register a custom adapter?', 'Expose it as a @Bean; DispatcherServlet detects all HandlerAdapter beans.'],
            ['S', 'Why is the adapter needed at all?', 'It is the Adapter pattern: handlers have no common interface, so each adapter hides how its handler type is called.'],
            ['S', 'What happens if no adapter supports the handler?', 'DispatcherServlet throws a ServletException saying no adapter for the handler.']],
        [['Define a handler interface and an adapter.',
            r`public interface Action {
    String run(HttpServletRequest req);
}

@Component("/hello")
public class HelloAction implements Action {
    public String run(HttpServletRequest req) { return "hello action"; }
}

@Bean
HandlerAdapter actionAdapter() {
    return new HandlerAdapter() {
        public boolean supports(Object h) { return h instanceof Action; }
        public ModelAndView handle(HttpServletRequest req, HttpServletResponse res,
                                   Object h) throws Exception {
            res.getWriter().write(((Action) h).run(req));
            return null;                       // response already written
        }
    };
}

// OUTPUT:
// GET /hello -> 200 hello action`],
            ['Test the adapter alone.',
                r`@Test
void supportsOnlyActions() {
    HandlerAdapter a = new ActionAdapter();
    System.out.println(a.supports(new HelloAction()));
    System.out.println(a.supports("not an action"));
}

// OUTPUT:
// true
// false`]],
        [['Adapter bean plus name-based mapping.',
            r`@Configuration
public class WebConfig {
    @Bean
    BeanNameUrlHandlerMapping beanNameMapping() {
        BeanNameUrlHandlerMapping m = new BeanNameUrlHandlerMapping();
        m.setOrder(2);                         // after annotation mappings
        return m;
    }
}

// OUTPUT:
// bean named "/hello" is mapped to the URL /hello and run by actionAdapter`],
            ['Call through MockMvc.',
                r`mockMvc.perform(get("/hello"))
    .andExpect(status().isOk())
    .andExpect(content().string("hello action"));

// OUTPUT:
// Status = 200
// Body = hello action`]]
    ),
    'mvc-custom-viewresolver': x(
        ['<b>ViewResolver</b> maps a logical view name returned by a controller (such as <code>report</code>) to a real <code>View</code> object that renders the response.',
            '<b>One method</b>: <code>View resolveViewName(String viewName, Locale locale)</code>; return <code>null</code> to let the next resolver try.',
            '<b>Custom resolver</b> lets you render formats such as CSV, PDF or a database-stored template that the default resolvers cannot.'],
        ['<b>Chain</b>: <code>DispatcherServlet</code> holds all <code>ViewResolver</code> beans sorted by <code>Ordered</code>; the first non-null result wins.',
            '<b>View interface</b>: <code>render(Map model, request, response)</code> writes the output and <code>getContentType()</code> names the type.',
            '<b>Defaults</b>: <code>InternalResourceViewResolver</code> accepts every name, so it must have the lowest priority.'],
        ['<b>Ordering</b>: implement <code>Ordered</code> or call <code>setOrder</code>; a greedy resolver placed first hides all others.',
            '<b>Content negotiation</b>: <code>ContentNegotiatingViewResolver</code> picks among candidate views by the requested media type.',
            '<b>REST</b> controllers skip view resolution because <code>@ResponseBody</code> marks the request as handled.'],
        [['F', 'What is a view name?', 'A string returned by a controller that a ViewResolver turns into a View.'],
            ['F', 'What does resolveViewName return when it cannot handle a name?', 'null, so the next resolver in the chain is asked.'],
            ['M', 'How is resolver order controlled?', 'By the Ordered interface or setOrder; lower numbers run first.'],
            ['M', 'Why must InternalResourceViewResolver be last?', 'It resolves every name, so any resolver after it would never be reached.'],
            ['S', 'How does a resolver differ from a View?', 'The resolver finds the view; the View renders the model into the response.'],
            ['S', 'How do you test a custom resolver?', 'Call resolveViewName directly in a unit test, then use MockMvc to check the rendered body.']],
        [['A resolver for names ending with .csv.',
            r`public class CsvViewResolver implements ViewResolver, Ordered {
    public View resolveViewName(String name, Locale locale) {
        return name.endsWith(".csv") ? new CsvView() : null;
    }
    public int getOrder() { return 1; }
}

public class CsvView implements View {
    public String getContentType() { return "text/csv"; }
    public void render(Map<String, ?> model, HttpServletRequest req,
                       HttpServletResponse res) throws Exception {
        res.setContentType("text/csv");
        res.getWriter().write("id,name\n1,Abaji\n");
    }
}

// OUTPUT:
// controller returns "users.csv" -> body "id,name" and "1,Abaji"`],
            ['Register it.',
                r`@Bean
ViewResolver csvViewResolver() {
    return new CsvViewResolver();
}

// OUTPUT:
// DispatcherServlet now consults csvViewResolver before the default resolver`]],
        [['Unit test of the resolver.',
            r`CsvViewResolver res = new CsvViewResolver();
System.out.println(res.resolveViewName("users.csv", Locale.ENGLISH) != null);
System.out.println(res.resolveViewName("home", Locale.ENGLISH));

// OUTPUT:
// true
// null`],
            ['MockMvc check.',
                r`mockMvc.perform(get("/users"))
    .andExpect(content().contentType("text/csv"))
    .andExpect(content().string(startsWith("id,name")));

// OUTPUT:
// Status = 200
// Content type = text/csv`]]
    ),
    'mvc-custom-argument-resolver': x(
        ['<b>Custom argument resolver</b> is a class that fills a controller method parameter (such as the logged-in user) from the request, so the controller stays free of plumbing code.',
            '<b>Steps</b>: write a marker annotation, implement <code>HandlerMethodArgumentResolver</code>, and register it in <code>WebMvcConfigurer.addArgumentResolvers</code>.',
            '<b>Result</b>: a method like <code>show(@CurrentUser User u)</code> receives the object directly.'],
        ['<b>supportsParameter</b> checks the annotation or the parameter type; <code>resolveArgument</code> builds the value.',
            '<b>Source of data</b>: headers, cookies, the session, a <code>SecurityContext</code> or a database lookup.',
            '<b>Fail early</b>: throw a clear exception, such as <code>ResponseStatusException</code> with 401, when the value is missing.'],
        ['<b>Reuse</b>: one resolver replaces repeated lookup code in dozens of controllers.',
            '<b>Order</b>: custom resolvers run after the built-in ones that match specific annotations, so avoid parameter types Spring already resolves.',
            '<b>Thread safety</b>: the resolver is a singleton; keep it stateless.'],
        [['F', 'Why write a custom argument resolver?', 'To inject a computed value into a controller parameter without repeating code.'],
            ['F', 'Where is it registered?', 'In WebMvcConfigurer.addArgumentResolvers.'],
            ['M', 'What does supportsParameter receive?', 'A MethodParameter, so you can check its type and annotations.'],
            ['M', 'Why a marker annotation?', 'It makes the intent explicit and avoids hijacking a type used elsewhere.'],
            ['S', 'How do you test it with @WebMvcTest?', 'Import the configuration that registers it and call the endpoint with MockMvc.'],
            ['S', 'Can a resolver read the request body?', 'Yes, but the body stream can be read once, so prefer @RequestBody for bodies.']],
        [['Marker annotation and resolver.',
            r`@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser { }

public class CurrentUserResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.hasParameterAnnotation(CurrentUser.class)
            && p.getParameterType().equals(String.class);
    }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer mc,
            NativeWebRequest req, WebDataBinderFactory f) {
        String user = req.getHeader("X-User");
        if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return user;
    }
}

// OUTPUT:
// header X-User: abaji -> parameter value "abaji"`],
            ['Register and use.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> list) {
        list.add(new CurrentUserResolver());
    }
}

@GetMapping("/me")
String me(@CurrentUser String user) { return "hi " + user; }

// OUTPUT:
// GET /me with X-User: abaji -> hi abaji`]],
        [['MockMvc success and failure.',
            r`mockMvc.perform(get("/me").header("X-User", "abaji"))
    .andExpect(content().string("hi abaji"));
mockMvc.perform(get("/me")).andExpect(status().isUnauthorized());

// OUTPUT:
// 200 hi abaji
// 401 Unauthorized`],
            ['Resolving a Pageable-like parameter.',
                r`public record Paging(int page, int size) { }

// supportsParameter: parameter type is Paging
// resolveArgument: new Paging(parse(req, "page", 0), parse(req, "size", 20))

// OUTPUT:
// GET /list?page=2 -> Paging[page=2, size=20]`]]
    ),
    'mvc-handlermethodargumentresolver': x(
        ['<b>HandlerMethodArgumentResolver</b> is the Spring MVC strategy interface that turns one method parameter of a controller into a value from the current request.',
            '<b>Contract</b>: <code>supportsParameter(MethodParameter)</code> and <code>resolveArgument(MethodParameter, ModelAndViewContainer, NativeWebRequest, WebDataBinderFactory)</code>.',
            '<b>Everything is a resolver</b>: <code>@RequestParam</code>, <code>@PathVariable</code>, <code>@RequestBody</code>, <code>Model</code> and <code>HttpServletRequest</code> each have a built-in resolver.'],
        ['<b>Used by</b> <code>RequestMappingHandlerAdapter</code> through a <code>HandlerMethodArgumentResolverComposite</code>.',
            '<b>First match wins</b>: the composite caches the resolver chosen for each parameter, so <code>supportsParameter</code> runs once per parameter.',
            '<b>WebDataBinderFactory</b> lets you bind and convert values, for example with <code>createBinder</code>.'],
        ['<b>Related contract</b>: <code>HandlerMethodReturnValueHandler</code> is the mirror interface for results.',
            '<b>Subtypes</b>: extend <code>AbstractNamedValueMethodArgumentResolver</code> to get required and default value handling for free.',
            '<b>Debugging</b>: set a breakpoint in <code>InvocableHandlerMethod.getMethodArgumentValues</code> to watch each resolver run.'],
        [['F', 'What is the job of this interface?', 'Resolve a controller method parameter from the request.'],
            ['F', 'Name two methods it declares.', 'supportsParameter and resolveArgument.'],
            ['M', 'Who calls the resolvers?', 'InvocableHandlerMethod, inside RequestMappingHandlerAdapter, using the composite.'],
            ['M', 'Which built-in resolver handles @RequestParam?', 'RequestParamMethodArgumentResolver.'],
            ['S', 'Why is supportsParameter cached?', 'The composite remembers the matching resolver per MethodParameter, avoiding a scan on every request.'],
            ['S', 'How can a custom resolver override a built-in type?', 'Use RequestMappingHandlerAdapter customization; plain addArgumentResolvers adds after built-ins.']],
        [['Resolve a Locale-like value from a header.',
            r`public class TenantResolver implements HandlerMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.getParameterType() == Tenant.class;
    }
    public Object resolveArgument(MethodParameter p, ModelAndViewContainer m,
            NativeWebRequest r, WebDataBinderFactory f) {
        return new Tenant(r.getHeader("X-Tenant"));
    }
}
public record Tenant(String id) { }

// OUTPUT:
// controller parameter Tenant t receives Tenant[id=acme]`],
            ['Inspect parameter metadata.',
                r`// inside supportsParameter
boolean ann = p.hasParameterAnnotation(RequestParam.class);
int index = p.getParameterIndex();
System.out.println(p.getParameterName() + " " + index + " " + ann);

// OUTPUT: (varies)
// tenant 0 false`]],
        [['Standalone MockMvc with a custom resolver.',
            r`MockMvc mvc = MockMvcBuilders.standaloneSetup(new TenantController())
    .setCustomArgumentResolvers(new TenantResolver())
    .build();
mvc.perform(get("/t").header("X-Tenant", "acme"))
    .andExpect(content().string("acme"));

// OUTPUT:
// Status = 200
// Body = acme`],
            ['Required value handling.',
                r`if (id == null) {
    throw new MissingRequestHeaderException("X-Tenant", p);
}

// OUTPUT:
// 400 Bad Request: Required request header X-Tenant is not present`]]
    ),
    'mvc-custom-return-value-handler': x(
        ['<b>Custom return value handler</b> processes a controller result of your own type and writes the response, so controllers can simply return a domain object such as a report.',
            '<b>Steps</b>: implement <code>HandlerMethodReturnValueHandler</code> and register it in <code>WebMvcConfigurer.addReturnValueHandlers</code>.',
            '<b>Mark handled</b>: call <code>mavContainer.setRequestHandled(true)</code> when you wrote the response, so no view is looked up.'],
        ['<b>supportsReturnType</b> usually tests the return class, such as <code>CsvResult.class.isAssignableFrom(...)</code>.',
            '<b>handleReturnValue</b> receives the value and a <code>NativeWebRequest</code>; get the servlet response with <code>getNativeResponse</code>.',
            '<b>Headers</b>: set content type and <code>Content-Disposition</code> before writing the body.'],
        ['<b>Alternative</b>: a custom <code>HttpMessageConverter</code> is better for content-negotiated types, while a return handler suits special flows.',
            '<b>Order</b>: custom handlers run after most built-ins, so a type already handled (such as <code>String</code>) is not intercepted.',
            '<b>Streaming</b>: write directly to the output stream for large downloads instead of buffering in memory.'],
        [['F', 'What problem does it solve?', 'It lets controllers return a custom type and have Spring write the response for it.'],
            ['F', 'What must you call after writing the response?', 'mavContainer.setRequestHandled(true).'],
            ['M', 'Where do you register it?', 'In WebMvcConfigurer.addReturnValueHandlers.'],
            ['M', 'When prefer an HttpMessageConverter?', 'When the type should be negotiated by Accept header, like JSON or XML.'],
            ['S', 'What happens if you forget setRequestHandled?', 'Spring tries to resolve a view name and usually fails with a 404 or an error.'],
            ['S', 'How do you test it?', 'Use MockMvc and assert content type, disposition header and body.']],
        [['A handler for CsvResult.',
            r`public record CsvResult(List<String> rows) { }

public class CsvReturnHandler implements HandlerMethodReturnValueHandler {
    public boolean supportsReturnType(MethodParameter t) {
        return CsvResult.class.isAssignableFrom(t.getParameterType());
    }
    public void handleReturnValue(Object v, MethodParameter t,
            ModelAndViewContainer m, NativeWebRequest w) throws Exception {
        m.setRequestHandled(true);
        HttpServletResponse res = w.getNativeResponse(HttpServletResponse.class);
        res.setContentType("text/csv");
        res.getWriter().write(String.join("\n", ((CsvResult) v).rows()));
    }
}

// OUTPUT:
// return new CsvResult(List.of("a,b","1,2")) -> body "a,b" newline "1,2"`],
            ['Register it.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    public void addReturnValueHandlers(List<HandlerMethodReturnValueHandler> l) {
        l.add(new CsvReturnHandler());
    }
}

// OUTPUT:
// handler added to the composite used by RequestMappingHandlerAdapter`]],
        [['Controller using the type.',
            r`@GetMapping("/export")
CsvResult export() {
    return new CsvResult(List.of("id,name", "1,Abaji"));
}

// OUTPUT:
// GET /export -> 200 text/csv`],
            ['MockMvc assertion.',
                r`mockMvc.perform(get("/export"))
    .andExpect(content().contentType("text/csv"))
    .andExpect(content().string("id,name\n1,Abaji"));

// OUTPUT:
// Status = 200
// Content type = text/csv`]]
    ),
    'mvc-handlermethodreturnvaluehandler': x(
        ['<b>HandlerMethodReturnValueHandler</b> is the strategy interface that processes the value a controller method returns: it chooses a view, writes the body or sets headers.',
            '<b>Contract</b>: <code>supportsReturnType(MethodParameter)</code> and <code>handleReturnValue(Object, MethodParameter, ModelAndViewContainer, NativeWebRequest)</code>.',
            '<b>Built-ins</b>: <code>RequestResponseBodyMethodProcessor</code> (for <code>@ResponseBody</code>), <code>ViewNameMethodReturnValueHandler</code> and <code>HttpEntityMethodProcessor</code>.'],
        ['<b>Composite</b>: <code>HandlerMethodReturnValueHandlerComposite</code> picks the first handler that supports the return type.',
            '<b>ModelAndViewContainer</b> carries the view name, the model and the <code>requestHandled</code> flag.',
            '<b>Async types</b> such as <code>Callable</code> and <code>DeferredResult</code> have their own handlers.'],
        ['<b>Order matters</b>: an annotated <code>@ResponseBody</code> result is taken by the body processor before a view-name handler.',
            '<b>Mirror</b> of <code>HandlerMethodArgumentResolver</code>: one side reads input, this side writes output.',
            '<b>Debug</b>: breakpoint in <code>ServletInvocableHandlerMethod.invokeAndHandle</code> to see the handler chosen.'],
        [['F', 'What does it process?', 'The value returned by a controller method.'],
            ['F', 'Which flag tells Spring the response is complete?', 'requestHandled on the ModelAndViewContainer.'],
            ['M', 'Which built-in handler serves @ResponseBody?', 'RequestResponseBodyMethodProcessor, using message converters.'],
            ['M', 'Which handler deals with a String view name?', 'ViewNameMethodReturnValueHandler.'],
            ['S', 'How does Spring choose among handlers?', 'The composite loops through them in order and uses the first whose supportsReturnType is true.'],
            ['S', 'Why is the interface rarely implemented?', 'Message converters and ResponseEntity cover most needs; it is for special response flows.']],
        [['Inspect return handlers at startup.',
            r`@Autowired RequestMappingHandlerAdapter adapter;

@PostConstruct
void show() {
    adapter.getReturnValueHandlers().forEach(
        h -> System.out.println(h.getClass().getSimpleName()));
}

// OUTPUT: (varies, first few)
// ModelAndViewMethodReturnValueHandler
// ModelMethodProcessor
// ViewMethodReturnValueHandler`],
            ['A handler that adds a header.',
                r`public void handleReturnValue(Object v, MethodParameter t,
        ModelAndViewContainer m, NativeWebRequest w) throws Exception {
    m.setRequestHandled(true);
    HttpServletResponse res = w.getNativeResponse(HttpServletResponse.class);
    res.setHeader("X-Result-Type", v.getClass().getSimpleName());
    res.getWriter().write(v.toString());
}

// OUTPUT:
// X-Result-Type: Receipt`]],
        [['Support check.',
            r`public boolean supportsReturnType(MethodParameter t) {
    return Receipt.class == t.getParameterType()
        || t.hasMethodAnnotation(PlainText.class);
}

// OUTPUT:
// true for methods returning Receipt or annotated with @PlainText`],
            ['Test the handler in isolation.',
                r`MockHttpServletResponse res = new MockHttpServletResponse();
ServletWebRequest web = new ServletWebRequest(new MockHttpServletRequest(), res);
handler.handleReturnValue(new Receipt("R1"), param, new ModelAndViewContainer(), web);
System.out.println(res.getContentAsString());

// OUTPUT:
// Receipt[id=R1]`]]
    ),
    'mvc-custom-formatter-advanced': x(
        ['<b>Formatter</b> converts between a <code>String</code> and an object in both directions, using the <code>Locale</code>: <code>parse(String, Locale)</code> and <code>print(T, Locale)</code>.',
            '<b>Use it</b> for request parameters, form fields and view output of types such as money, phone numbers or dates.',
            '<b>Register</b> with <code>FormatterRegistry.addFormatter</code> inside <code>WebMvcConfigurer.addFormatters</code>.'],
        ['<b>Formatter vs Converter</b>: a formatter is locale aware and text oriented; a converter is a one-way, type-to-type function.',
            '<b>Errors</b>: throw <code>ParseException</code> and Spring reports a binding error or a 400 response.',
            '<b>Annotation driven</b>: <code>AnnotationFormatterFactory</code> powers annotations like <code>@DateTimeFormat</code> and <code>@NumberFormat</code>.'],
        ['<b>Spring Boot</b> registers any <code>Formatter</code> bean automatically in the web conversion service.',
            '<b>Thread safety</b>: formatters are shared, so do not keep a <code>SimpleDateFormat</code> field; use <code>DateTimeFormatter</code>.',
            '<b>Limit</b>: formatting applies to bound parameters and form fields, not to JSON bodies, which use Jackson.'],
        [['F', 'What two methods does Formatter have?', 'parse (text to object) and print (object to text).'],
            ['F', 'Why does it take a Locale?', 'So parsing and printing can follow the user language and region.'],
            ['M', 'How is a formatter registered?', 'registry.addFormatter in WebMvcConfigurer.addFormatters, or as a bean in Spring Boot.'],
            ['M', 'What should parse do on bad input?', 'Throw ParseException so a binding error is produced.'],
            ['S', 'Does a Formatter change JSON body conversion?', 'No, Jackson handles JSON; formatters apply to request parameters, path variables and forms.'],
            ['S', 'When use AnnotationFormatterFactory?', 'When formatting options come from an annotation on the field.']],
        [['A money formatter.',
            r`public record Money(BigDecimal amount, String currency) { }

public class MoneyFormatter implements Formatter<Money> {
    public Money parse(String text, Locale locale) throws ParseException {
        String[] p = text.trim().split(" ");
        if (p.length != 2) throw new ParseException("use 'amount CUR'", 0);
        return new Money(new BigDecimal(p[0]), p[1]);
    }
    public String print(Money m, Locale locale) {
        return m.amount().toPlainString() + " " + m.currency();
    }
}

// OUTPUT:
// parse("12.50 INR") -> Money[amount=12.50, currency=INR]`],
            ['Register it.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    public void addFormatters(FormatterRegistry registry) {
        registry.addFormatter(new MoneyFormatter());
    }
}

// OUTPUT:
// GET /pay?price=12.50 INR binds Money to the controller parameter`]],
        [['Controller using the formatter.',
            r`@GetMapping("/pay")
String pay(@RequestParam Money price) {
    return "paid " + price.amount();
}

// OUTPUT:
// GET /pay?price=12.50%20INR -> paid 12.50`],
            ['MockMvc test of good and bad input.',
                r`mockMvc.perform(get("/pay").param("price", "12.50 INR"))
    .andExpect(content().string("paid 12.50"));
mockMvc.perform(get("/pay").param("price", "oops"))
    .andExpect(status().isBadRequest());

// OUTPUT:
// 200 paid 12.50
// 400 Bad Request`]]
    ),
    'mvc-custom-converter-advanced': x(
        ['<b>Converter</b> is a functional interface <code>Converter&lt;S, T&gt;</code> with one method <code>T convert(S source)</code>; Spring uses it to turn one type into another, such as <code>String</code> into your own class.',
            '<b>Register</b> with <code>registry.addConverter</code> in <code>WebMvcConfigurer.addFormatters</code>.',
            '<b>Where used</b>: <code>@RequestParam</code>, <code>@PathVariable</code>, <code>@ModelAttribute</code> binding and property placeholders.'],
        ['<b>Family</b>: <code>Converter</code> (one pair), <code>ConverterFactory</code> (a type hierarchy, like all enums) and <code>GenericConverter</code> (many pairs, with type descriptors).',
            '<b>ConversionService</b> is the entry point; <code>WebConversionService</code> is used in Spring MVC.',
            '<b>Null</b>: returning null means "no value"; throw <code>IllegalArgumentException</code> for invalid input.'],
        ['<b>Spring Boot</b> adds every <code>Converter</code> bean to the conversion service automatically.',
            '<b>Generics</b>: a lambda loses generic info, so use a class or anonymous class when registering by bean.',
            '<b>Versus Formatter</b>: use a converter for pure type mapping, a formatter when locale matters.'],
        [['F', 'What does Converter do?', 'It converts a value of type S into type T.'],
            ['F', 'Where is a converter registered in MVC?', 'WebMvcConfigurer.addFormatters through the FormatterRegistry.'],
            ['M', 'What is a ConverterFactory?', 'A converter producer for a family of target types, like every enum type.'],
            ['M', 'How does Boot pick up converters?', 'It adds all Converter beans to the WebConversionService.'],
            ['S', 'Why can a lambda converter fail to register?', 'Type erasure hides S and T, so Spring cannot determine the conversion pair.'],
            ['S', 'What does a failed conversion produce in a controller?', 'A MethodArgumentTypeMismatchException, handled as 400 Bad Request.']],
        [['String to Status enum, ignoring case.',
            r`public enum Status { ACTIVE, BLOCKED }

public class StringToStatus implements Converter<String, Status> {
    public Status convert(String source) {
        return Status.valueOf(source.trim().toUpperCase());
    }
}

// OUTPUT:
// convert(" active ") -> ACTIVE`],
            ['Register it.',
                r`@Override
public void addFormatters(FormatterRegistry registry) {
    registry.addConverter(new StringToStatus());
}

@GetMapping("/users")
String list(@RequestParam Status status) { return status.name(); }

// OUTPUT:
// GET /users?status=blocked -> BLOCKED`]],
        [['Test through MockMvc.',
            r`mockMvc.perform(get("/users").param("status", "blocked"))
    .andExpect(content().string("BLOCKED"));
mockMvc.perform(get("/users").param("status", "zzz"))
    .andExpect(status().isBadRequest());

// OUTPUT:
// 200 BLOCKED
// 400 Bad Request`],
            ['Use the ConversionService directly.',
                r`DefaultConversionService cs = new DefaultConversionService();
cs.addConverter(new StringToStatus());
System.out.println(cs.convert("active", Status.class));

// OUTPUT:
// ACTIVE`]]
    ),
    'mvc-custom-interceptor': x(
        ['<b>HandlerInterceptor</b> runs code around controller execution: <code>preHandle</code> before, <code>postHandle</code> after the handler and <code>afterCompletion</code> after the response.',
            '<b>Register</b> it with <code>InterceptorRegistry.addInterceptor</code> in <code>WebMvcConfigurer.addInterceptors</code>, with <code>addPathPatterns</code> and <code>excludePathPatterns</code>.',
            '<b>Veto</b>: <code>preHandle</code> returns <code>false</code> to stop the chain, so the controller is not called.'],
        ['<b>Typical uses</b>: logging, timing, authentication checks, locale and tenant setup.',
            '<b>Order</b>: interceptors run in registration order going in and in reverse order coming out; use <code>order(int)</code> to change it.',
            '<b>afterCompletion</b> always runs for interceptors whose <code>preHandle</code> returned true, even after an exception.'],
        ['<b>Interceptor vs Filter</b>: a filter is a Servlet feature around the whole servlet; an interceptor knows the handler method and lives inside Spring MVC.',
            '<b>Handler object</b>: cast to <code>HandlerMethod</code> to read annotations on the controller method.',
            '<b>Async requests</b>: use <code>AsyncHandlerInterceptor</code> when the handler may run on another thread.'],
        [['F', 'Name the three interceptor callbacks.', 'preHandle, postHandle and afterCompletion.'],
            ['F', 'How do you stop a request in an interceptor?', 'Return false from preHandle, usually after writing an error response.'],
            ['M', 'Where do you register an interceptor?', 'In WebMvcConfigurer.addInterceptors.'],
            ['M', 'What is the difference between interceptor and filter?', 'Filters belong to the servlet container; interceptors are Spring MVC and can see the handler.'],
            ['S', 'In what order do callbacks run for two interceptors A and B?', 'preHandle A, B; postHandle B, A; afterCompletion B, A.'],
            ['S', 'Why is postHandle not suited for modifying a @ResponseBody response?', 'The body is already written and committed by then.']],
        [['A timing interceptor.',
            r`@Component
public class TimingInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                             Object handler) {
        req.setAttribute("start", System.nanoTime());
        return true;
    }
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res,
                                Object handler, Exception ex) {
        long ms = (System.nanoTime() - (long) req.getAttribute("start")) / 1_000_000;
        System.out.println(req.getRequestURI() + " took " + ms + " ms");
    }
}

// OUTPUT: (varies)
// /orders took 12 ms`],
            ['Register with path patterns.',
                r`@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Autowired TimingInterceptor timing;
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timing)
            .addPathPatterns("/api/**")
            .excludePathPatterns("/api/health");
    }
}

// OUTPUT:
// /api/orders is timed; /api/health is skipped`]],
        [['A simple API key check.',
            r`public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                         Object handler) throws IOException {
    if (!"secret".equals(req.getHeader("X-Api-Key"))) {
        res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
        return false;
    }
    return true;
}

// OUTPUT:
// no key -> 401; key "secret" -> controller runs`],
            ['MockMvc test.',
                r`mockMvc.perform(get("/api/orders")).andExpect(status().isUnauthorized());
mockMvc.perform(get("/api/orders").header("X-Api-Key", "secret"))
    .andExpect(status().isOk());

// OUTPUT:
// 401 then 200`]]
    ),
    'mvc-custom-exception-resolver': x(
        ['<b>HandlerExceptionResolver</b> turns an exception thrown during a request into a response; the method is <code>ModelAndView resolveException(request, response, handler, ex)</code>.',
            '<b>Return value</b>: an empty <code>ModelAndView</code> means "handled, response written"; <code>null</code> means "not mine, ask the next resolver".',
            '<b>Built-in chain</b>: <code>ExceptionHandlerExceptionResolver</code> (<code>@ExceptionHandler</code>), <code>ResponseStatusExceptionResolver</code> and <code>DefaultHandlerExceptionResolver</code>.'],
        ['<b>Register</b> by overriding <code>extendHandlerExceptionResolvers</code> in <code>WebMvcConfigurer</code> to add yours to the list.',
            '<b>Order</b>: implement <code>Ordered</code> when the resolver is a bean, so it runs before or after the built-ins.',
            '<b>Response</b>: write status and body yourself with <code>response.sendError</code> or <code>response.getWriter()</code>.'],
        ['<b>Prefer</b> <code>@ControllerAdvice</code> with <code>@ExceptionHandler</code> for most cases; a custom resolver is for cross-cutting low-level handling.',
            '<b>Not visible</b> to exceptions thrown in filters, which occur before <code>DispatcherServlet</code>.',
            '<b>Logging</b>: log in the resolver once, and return null so later resolvers still render the error.'],
        [['F', 'What does a HandlerExceptionResolver do?', 'It converts an exception from a handler into an HTTP response or error view.'],
            ['F', 'What does returning null mean?', 'This resolver did not handle it, so the next one is tried.'],
            ['M', 'Name two built-in resolvers.', 'ExceptionHandlerExceptionResolver and ResponseStatusExceptionResolver.'],
            ['M', 'How do you add a custom resolver in MVC config?', 'Override extendHandlerExceptionResolvers in WebMvcConfigurer.'],
            ['S', 'When choose a resolver over @ControllerAdvice?', 'When you need generic handling independent of controllers, or must wrap the built-in chain.'],
            ['S', 'Why do filter exceptions miss it?', 'They happen outside DispatcherServlet, where resolvers run.']],
        [['A resolver mapping an exception to 409.',
            r`public class ConflictResolver implements HandlerExceptionResolver {
    public ModelAndView resolveException(HttpServletRequest req,
            HttpServletResponse res, Object handler, Exception ex) {
        if (ex instanceof IllegalStateException) {
            try {
                res.sendError(HttpServletResponse.SC_CONFLICT, ex.getMessage());
            } catch (IOException e) { /* ignore */ }
            return new ModelAndView();         // empty = handled
        }
        return null;                           // let others decide
    }
}

// OUTPUT:
// IllegalStateException("duplicate") -> 409 duplicate`],
            ['Register it.',
                r`@Override
public void extendHandlerExceptionResolvers(List<HandlerExceptionResolver> list) {
    list.add(0, new ConflictResolver());       // run before the built-ins
}

// OUTPUT:
// ConflictResolver is first in the resolver list`]],
        [['Controller that throws.',
            r`@GetMapping("/dup")
String dup() { throw new IllegalStateException("duplicate"); }

// OUTPUT:
// GET /dup -> 409 Conflict`],
            ['MockMvc test.',
                r`mockMvc.perform(get("/dup"))
    .andExpect(status().isConflict());
mockMvc.perform(get("/missing"))
    .andExpect(status().isNotFound());

// OUTPUT:
// 409 for the custom case; 404 handled by the defaults`]]
    )
};

export const smvc37Deep: Record<string, Deep> = {
    'mvc-custom-handleradapter': dv(
        [`<p>How the adapter is used per request:</p><ul><li><b>Init:</b> <code>DispatcherServlet.initHandlerAdapters</code> collects all <code>HandlerAdapter</code> beans and sorts them.</li><li><b>Lookup:</b> <code>getHandlerAdapter(handler)</code> loops through them and returns the first with <code>supports</code> true.</li><li><b>Invoke:</b> <code>ha.handle(...)</code> returns a <code>ModelAndView</code> or null.</li><li><b>Defaults:</b> without custom beans the servlet loads the adapters named in <code>DispatcherServlet.properties</code>.</li></ul>`,
            r`protected HandlerAdapter getHandlerAdapter(Object handler)
        throws ServletException {
    for (HandlerAdapter ha : this.handlerAdapters) {
        if (ha.supports(handler)) {
            return ha;
        }
    }
    throw new ServletException("No adapter for handler [" + handler + "]");
}

// OUTPUT:
// framework code: the first supporting adapter wins`],
        [`<p>Variants and options:</p><ul><li><b>Handler type:</b> any object a <code>HandlerMapping</code> can return.</li><li><b>Order:</b> adapters are consulted in <code>Ordered</code> order.</li><li><b>Wrapping:</b> delegate to <code>RequestMappingHandlerAdapter</code> to add behaviour around annotated controllers.</li><li><b>Return:</b> null for a written response, or a <code>ModelAndView</code> for view rendering.</li></ul>`,
            r`public class FunctionAdapter implements HandlerAdapter, Ordered {
    public boolean supports(Object h) { return h instanceof Function; }
    @SuppressWarnings("unchecked")
    public ModelAndView handle(HttpServletRequest req, HttpServletResponse res,
                               Object h) throws Exception {
        Object out = ((Function<HttpServletRequest, Object>) h).apply(req);
        res.getWriter().write(String.valueOf(out));
        return null;
    }
    public long getLastModified(HttpServletRequest r, Object h) { return -1; }
    public int getOrder() { return 10; }
}

// OUTPUT:
// a Function bean mapped to a URL answers with its result`],
        [`<p>Common mistakes:</p><ul><li><b>Too broad supports:</b> <code>return true</code> steals annotated controllers.</li><li><b>No mapping:</b> an adapter without a matching <code>HandlerMapping</code> is never reached.</li><li><b>Wrong return:</b> returning a <code>ModelAndView</code> after writing the body causes a view error.</li><li><b>Replacing the default:</b> declaring a bean named <code>handlerAdapter</code> can disable the defaults in some setups; keep the standard ones.</li></ul>`,
            r`// WRONG: claims every handler, including @Controller methods
public boolean supports(Object h) { return true; }

// RIGHT: narrow check on your own type
public boolean supports(Object h) { return h instanceof Action; }

// OUTPUT:
// WRONG: annotated endpoints return odd results or errors
// RIGHT: only Action handlers reach this adapter`],
        [`<p>Performance notes:</p><ul><li><b>Cheap supports:</b> it runs on every request, so use <code>instanceof</code> only.</li><li><b>Order:</b> put the hottest adapter first.</li><li><b>No allocation</b> in the hot path; keep the adapter stateless.</li><li><b>Streaming:</b> write directly to the response for large payloads.</li></ul>`,
            r`public boolean supports(Object h) {
    return h instanceof Action;        // single type check, no reflection
}

// OUTPUT:
// negligible cost per request`],
        [`<p>Scenario: a migration keeps 200 legacy <code>Action</code> classes while new code uses <code>@RestController</code>. One adapter runs the old actions inside the new application, and they are retired one by one.</p>`,
            r`@Configuration
public class LegacyConfig {
    @Bean HandlerAdapter actionAdapter() { return new ActionAdapter(); }
    @Bean BeanNameUrlHandlerMapping legacyMapping() {
        BeanNameUrlHandlerMapping m = new BeanNameUrlHandlerMapping();
        m.setOrder(5);
        return m;
    }
}

// OUTPUT:
// /legacy/orders served by the old Action; /api/orders by a controller`]
    ),
    'mvc-custom-viewresolver': dv(
        [`<p>How resolution works:</p><ul><li><b>After the handler:</b> <code>DispatcherServlet.render</code> gets a view name from the <code>ModelAndView</code>.</li><li><b>resolveViewName:</b> loops over the sorted <code>viewResolvers</code> and takes the first non-null <code>View</code>.</li><li><b>Render:</b> <code>view.render(model, request, response)</code> writes the output.</li><li><b>Missing:</b> if none resolves, a <code>ServletException</code> says it cannot resolve the view name.</li></ul>`,
            r`protected View resolveViewName(String name, Map<String, Object> model,
        Locale locale, HttpServletRequest request) throws Exception {
    for (ViewResolver vr : this.viewResolvers) {
        View view = vr.resolveViewName(name, locale);
        if (view != null) {
            return view;
        }
    }
    return null;
}

// OUTPUT:
// framework code: first non-null View wins`],
        [`<p>Options and variants:</p><ul><li><b>UrlBasedViewResolver:</b> prefix and suffix (JSP, Thymeleaf, FreeMarker).</li><li><b>BeanNameViewResolver:</b> looks up a <code>View</code> bean by name.</li><li><b>ContentNegotiatingViewResolver:</b> combines resolvers by media type.</li><li><b>Custom:</b> any lookup logic, such as a database or a tenant folder.</li><li><b>Redirect and forward:</b> names starting with <code>redirect:</code> are handled by the base class.</li></ul>`,
            r`@Bean
public ViewResolver beanNameResolver() {
    BeanNameViewResolver r = new BeanNameViewResolver();
    r.setOrder(0);
    return r;
}

@Bean("summary")
public View summaryView() {
    return (model, req, res) -> res.getWriter().write("summary view");
}

// OUTPUT:
// controller returns "summary" -> body "summary view"`],
        [`<p>Mistakes:</p><ul><li><b>Wrong order:</b> a catch-all resolver with a low order number hides yours.</li><li><b>Not returning null:</b> throwing for unknown names breaks the chain.</li><li><b>Locale ignored:</b> pass the locale to caches and keys.</li><li><b>Stateful View:</b> a View is shared when cached, so it must be thread safe.</li></ul>`,
            r`// WRONG: throws, so later resolvers are never asked
public View resolveViewName(String n, Locale l) {
    if (!n.endsWith(".csv")) throw new IllegalArgumentException(n);
    return new CsvView();
}

// RIGHT: return null when the name is not yours
public View resolveViewName(String n, Locale l) {
    return n.endsWith(".csv") ? new CsvView() : null;
}

// OUTPUT:
// WRONG: HTML pages fail with IllegalArgumentException
// RIGHT: HTML pages fall through to the default resolver`],
        [`<p>Tuning:</p><ul><li><b>Cache:</b> <code>AbstractCachingViewResolver</code> keeps resolved views per name and locale; extend it for costly lookups.</li><li><b>Production:</b> keep caching on; turn it off only in development.</li><li><b>Few resolvers:</b> every extra resolver adds a lookup per request.</li></ul>`,
            r`public class DbViewResolver extends AbstractCachingViewResolver {
    protected View loadView(String name, Locale locale) {
        String tpl = repository.findTemplate(name);   // slow, so cached
        return tpl == null ? null : new StringTemplateView(tpl);
    }
}

// OUTPUT:
// first request loads from the database; later ones use the cache`],
        [`<p>Scenario: a reporting app lets users save templates in the database. A custom resolver loads them by name, caches them, and the controllers only return the template name.</p>`,
            r`@GetMapping("/report/{name}")
String report(@PathVariable String name, Model model) {
    model.addAttribute("rows", service.rows(name));
    return name;                          // resolved by DbViewResolver
}

// OUTPUT:
// GET /report/sales -> HTML rendered from the stored "sales" template`]
    ),
    'mvc-custom-argument-resolver': dv(
        [`<p>Inside a request:</p><ul><li><b>InvocableHandlerMethod:</b> for every parameter it calls <code>resolvers.supportsParameter</code>.</li><li><b>Composite:</b> checks each resolver in order and caches the winner per parameter.</li><li><b>resolveArgument:</b> your code runs and its result is passed to the controller.</li><li><b>Order:</b> annotation-based built-ins first, then custom resolvers, then catch-all resolvers.</li></ul>`,
            r`private HandlerMethodArgumentResolver getArgumentResolver(MethodParameter p) {
    HandlerMethodArgumentResolver result = this.cache.get(p);
    if (result == null) {
        for (HandlerMethodArgumentResolver r : this.resolvers) {
            if (r.supportsParameter(p)) {
                result = r;
                this.cache.put(p, result);
                break;
            }
        }
    }
    return result;
}

// OUTPUT:
// framework code: one lookup per parameter, then cached`],
        [`<p>Variants:</p><ul><li><b>By annotation:</b> clearest and safest.</li><li><b>By type:</b> good for value objects like <code>Paging</code>.</li><li><b>Named value:</b> extend <code>AbstractNamedValueMethodArgumentResolver</code> for required and default handling.</li><li><b>Binder access:</b> use the <code>WebDataBinderFactory</code> to convert and validate.</li></ul>`,
            r`public Object resolveArgument(MethodParameter p, ModelAndViewContainer m,
        NativeWebRequest req, WebDataBinderFactory f) throws Exception {
    String raw = req.getParameter("since");
    WebDataBinder binder = f.createBinder(req, null, "since");
    return binder.convertIfNecessary(raw, LocalDate.class);
}

// OUTPUT:
// ?since=2024-05-01 -> LocalDate 2024-05-01`],
        [`<p>Mistakes:</p><ul><li><b>Overlapping support:</b> claiming <code>String</code> everywhere steals other parameters.</li><li><b>Per-user state in a field:</b> the resolver is a singleton.</li><li><b>Returning null</b> for a primitive parameter causes an error.</li><li><b>Reading the body twice:</b> the stream is gone after the first read.</li></ul>`,
            r`// WRONG: every String parameter now gets the header value
public boolean supportsParameter(MethodParameter p) {
    return p.getParameterType() == String.class;
}

// RIGHT: require the marker annotation
public boolean supportsParameter(MethodParameter p) {
    return p.hasParameterAnnotation(CurrentUser.class);
}

// OUTPUT:
// WRONG: @RequestParam String name receives the header
// RIGHT: only @CurrentUser parameters are touched`],
        [`<p>Tuning:</p><ul><li><b>Cheap support check:</b> annotations are cached by Spring after the first lookup.</li><li><b>Expensive values:</b> cache per request with a request attribute.</li><li><b>Avoid database calls</b> when a token claim is enough.</li></ul>`,
            r`Object cached = req.getAttribute("currentUser", RequestAttributes.SCOPE_REQUEST);
if (cached != null) return cached;
User u = userService.load(token(req));
req.setAttribute("currentUser", u, RequestAttributes.SCOPE_REQUEST);
return u;

// OUTPUT:
// one database load per request even with several @CurrentUser parameters`],
        [`<p>Scenario: an API with 80 endpoints needs the authenticated user. One resolver reads the verified token and every controller declares <code>@CurrentUser User user</code>.</p>`,
            r`@PostMapping("/orders")
Order place(@CurrentUser User user, @RequestBody @Valid NewOrder body) {
    return orders.place(user.id(), body);
}

// OUTPUT:
// POST /orders -> 201 {"id":7,"owner":"abaji"}`]
    ),
    'mvc-handlermethodargumentresolver': dv(
        [`<p>Internals:</p><ul><li><b>Setup:</b> <code>RequestMappingHandlerAdapter.afterPropertiesSet</code> builds the default resolver list plus custom ones.</li><li><b>Composite:</b> <code>HandlerMethodArgumentResolverComposite</code> wraps the list.</li><li><b>Call:</b> <code>InvocableHandlerMethod</code> resolves each parameter, then calls the method by reflection.</li><li><b>Defaults order:</b> annotation resolvers (<code>@RequestParam</code>, <code>@PathVariable</code>), type resolvers (<code>Model</code>, <code>HttpServletRequest</code>), custom ones, then catch-all fallbacks.</li></ul>`,
            r`public interface HandlerMethodArgumentResolver {
    boolean supportsParameter(MethodParameter parameter);

    Object resolveArgument(MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory) throws Exception;
}

// OUTPUT:
// the two-method contract every resolver follows`],
        [`<p>Useful base classes and helpers:</p><ul><li><b>AbstractNamedValueMethodArgumentResolver:</b> required, default value and conversion.</li><li><b>MethodParameter:</b> annotations, generic type, index and name.</li><li><b>NativeWebRequest:</b> headers, parameters, cookies and native request.</li><li><b>ModelAndViewContainer:</b> add model attributes from a resolver.</li></ul>`,
            r`public class HeaderResolver extends AbstractNamedValueMethodArgumentResolver {
    public boolean supportsParameter(MethodParameter p) {
        return p.hasParameterAnnotation(AppHeader.class);
    }
    protected NamedValueInfo createNamedValueInfo(MethodParameter p) {
        AppHeader a = p.getParameterAnnotation(AppHeader.class);
        return new NamedValueInfo(a.value(), true, ValueConstants.DEFAULT_NONE);
    }
    protected Object resolveName(String name, MethodParameter p,
            NativeWebRequest req) {
        return req.getHeader(name);
    }
}

// OUTPUT:
// @AppHeader("X-Tenant") String t -> header value, 400 if missing`],
        [`<p>Mistakes:</p><ul><li><b>Wrong registration time:</b> a resolver added too late is ignored.</li><li><b>Primitive null:</b> returning null for <code>int</code> fails.</li><li><b>Order surprise:</b> a built-in already supports the type.</li><li><b>No test:</b> standalone MockMvc needs <code>setCustomArgumentResolvers</code>.</li></ul>`,
            r`// WRONG: Model is already resolved by a built-in resolver
public boolean supportsParameter(MethodParameter p) {
    return p.getParameterType() == Model.class;
}

// RIGHT: use your own type
public boolean supportsParameter(MethodParameter p) {
    return p.getParameterType() == Tenant.class;
}

// OUTPUT:
// WRONG: custom code never runs
// RIGHT: Tenant parameters are resolved by TenantResolver`],
        [`<p>Tuning:</p><ul><li><b>supportsParameter</b> runs once per parameter, so it can inspect annotations freely.</li><li><b>resolveArgument</b> runs per request, so keep it fast and cache costly lookups.</li><li><b>Fewer resolvers</b> means a shorter scan on first use.</li></ul>`,
            r`private final Map<String, Tenant> tenants = new ConcurrentHashMap<>();

public Object resolveArgument(MethodParameter p, ModelAndViewContainer m,
        NativeWebRequest r, WebDataBinderFactory f) {
    return tenants.computeIfAbsent(r.getHeader("X-Tenant"), Tenant::new);
}

// OUTPUT:
// one Tenant instance per id, shared and immutable`],
        [`<p>Scenario: a multi-tenant SaaS needs the tenant in 60 endpoints. A resolver reads the header, checks it, and the services receive a <code>Tenant</code> object.</p>`,
            r`@GetMapping("/invoices")
List<Invoice> list(Tenant tenant) {
    return invoices.findByTenant(tenant.id());
}

// OUTPUT:
// GET /invoices with X-Tenant: acme -> JSON list of acme invoices`]
    ),
    'mvc-custom-return-value-handler': dv(
        [`<p>How it runs:</p><ul><li><b>Invoke:</b> <code>ServletInvocableHandlerMethod.invokeAndHandle</code> calls the controller method.</li><li><b>Dispatch:</b> the composite finds the handler for the return type and calls <code>handleReturnValue</code>.</li><li><b>Handled flag:</b> if <code>requestHandled</code> is true, no view is resolved.</li><li><b>Otherwise:</b> the container is turned into a <code>ModelAndView</code> and rendered.</li></ul>`,
            r`// inside ServletInvocableHandlerMethod (simplified)
Object value = invokeForRequest(webRequest, mavContainer, args);
if (value == null && mavContainer.isRequestHandled()) {
    return;
}
this.returnValueHandlers.handleReturnValue(
    value, getReturnValueType(value), mavContainer, webRequest);

// OUTPUT:
// framework code: the composite picks your handler by supportsReturnType`],
        [`<p>Variants:</p><ul><li><b>By type:</b> a domain class like <code>CsvResult</code>.</li><li><b>By annotation:</b> a method annotation such as <code>@PlainText</code>.</li><li><b>Wrapper:</b> delegate to an existing handler after transforming the value.</li><li><b>Streaming:</b> return a <code>StreamingResponseBody</code> for large output instead.</li></ul>`,
            r`public boolean supportsReturnType(MethodParameter t) {
    return t.hasMethodAnnotation(PlainText.class);
}
public void handleReturnValue(Object v, MethodParameter t,
        ModelAndViewContainer m, NativeWebRequest w) throws Exception {
    m.setRequestHandled(true);
    HttpServletResponse res = w.getNativeResponse(HttpServletResponse.class);
    res.setContentType("text/plain;charset=UTF-8");
    res.getWriter().write(String.valueOf(v));
}

// OUTPUT:
// any method annotated @PlainText returns raw text`],
        [`<p>Mistakes:</p><ul><li><b>Missing handled flag:</b> a view lookup follows and fails.</li><li><b>Headers after body:</b> set them before the first write.</li><li><b>Wrong support check:</b> an exact class check misses subclasses.</li><li><b>Not registered:</b> an unregistered handler is silently unused.</li></ul>`,
            r`// WRONG: forgot requestHandled, so Spring looks for a view named after the path
res.getWriter().write(csv);

// RIGHT
m.setRequestHandled(true);
res.getWriter().write(csv);

// OUTPUT:
// WRONG: error "Circular view path" or 404 after the body
// RIGHT: clean 200 response`],
        [`<p>Tuning:</p><ul><li><b>Stream:</b> write row by row to the writer, not one big string.</li><li><b>Buffer size:</b> let the servlet container buffer; call <code>flush</code> only when needed.</li><li><b>Compression:</b> enable server compression for text exports.</li></ul>`,
            r`PrintWriter out = res.getWriter();
for (String row : result.rows()) {
    out.println(row);              // streamed, constant memory
}
out.flush();

// OUTPUT:
// a million-row export uses constant memory`],
        [`<p>Scenario: finance downloads statements as CSV from 15 endpoints. All of them return <code>CsvResult</code> and one handler sets headers and streams the rows.</p>`,
            r`@GetMapping("/statement")
CsvResult statement(@RequestParam LocalDate month) {
    return statements.csv(month);
}

// OUTPUT:
// GET /statement?month=2024-05-01 -> text/csv download`]
    ),
    'mvc-handlermethodreturnvaluehandler': dv(
        [`<p>Internals:</p><ul><li><b>Composite:</b> <code>HandlerMethodReturnValueHandlerComposite</code> holds the ordered list.</li><li><b>selectHandler:</b> loops and returns the first whose <code>supportsReturnType</code> is true; async handlers get priority for async values.</li><li><b>Default list:</b> <code>ModelAndView</code>, <code>Model</code>, <code>View</code>, <code>ResponseBodyEmitter</code>, <code>HttpEntity</code>, <code>HttpHeaders</code>, <code>Callable</code>, <code>DeferredResult</code>, view names, <code>@ResponseBody</code>, then catch-alls.</li><li><b>Custom:</b> added after the specific built-ins and before the catch-alls.</li></ul>`,
            r`public interface HandlerMethodReturnValueHandler {
    boolean supportsReturnType(MethodParameter returnType);

    void handleReturnValue(Object returnValue, MethodParameter returnType,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest) throws Exception;
}

// OUTPUT:
// the contract used by every return value handler`],
        [`<p>Controller return types and the handler that serves them:</p><ul><li><b>String:</b> view name (or body with <code>@ResponseBody</code>).</li><li><b>ResponseEntity:</b> <code>HttpEntityMethodProcessor</code>.</li><li><b>ModelAndView:</b> <code>ModelAndViewMethodReturnValueHandler</code>.</li><li><b>void:</b> default view name or handled request.</li><li><b>Callable and DeferredResult:</b> async handlers.</li><li><b>StreamingResponseBody:</b> streaming handler.</li></ul>`,
            r`@GetMapping("/a") String a()               { return "page"; }
@GetMapping("/b") @ResponseBody String b() { return "text"; }
@GetMapping("/c") ResponseEntity<String> c() {
    return ResponseEntity.ok("entity");
}
@GetMapping("/d") Callable<String> d()     { return () -> "async"; }

// OUTPUT:
// /a view "page"; /b body text; /c 200 entity; /d async body async`],
        [`<p>Mistakes:</p><ul><li><b>Wrapping the composite:</b> replacing the whole handler list drops the built-ins.</li><li><b>Wrong support:</b> using a type a built-in already handles.</li><li><b>Ignoring void:</b> a null return with no handled flag falls to a view.</li><li><b>Blocking in async:</b> do not block inside async return handling.</li></ul>`,
            r`// WRONG: replaces every built-in handler
adapter.setReturnValueHandlers(List.of(new CsvReturnHandler()));

// RIGHT: add to the list through the configurer
public void addReturnValueHandlers(List<HandlerMethodReturnValueHandler> l) {
    l.add(new CsvReturnHandler());
}

// OUTPUT:
// WRONG: ordinary controllers stop working
// RIGHT: both custom and built-in types work`],
        [`<p>Tuning:</p><ul><li><b>Selection cost</b> is a short loop per request; keep <code>supportsReturnType</code> trivial.</li><li><b>Message converters</b> are the usual cost; register only needed ones.</li><li><b>Streaming types</b> avoid large buffers.</li></ul>`,
            r`public boolean supportsReturnType(MethodParameter t) {
    return Receipt.class == t.getParameterType();   // plain class comparison
}

// OUTPUT:
// constant-time check per request`],
        [`<p>Scenario: a team sees unexpected 404 errors after returning a custom type. Debugging <code>invokeAndHandle</code> shows no handler supports it and a view lookup follows. Adding a handler fixes it.</p>`,
            r`@Test
void handlerIsRegistered() {
    boolean found = adapter.getReturnValueHandlers().stream()
        .anyMatch(h -> h instanceof CsvReturnHandler);
    System.out.println(found);
}

// OUTPUT:
// true`]
    ),
    'mvc-custom-formatter-advanced': dv(
        [`<p>Where formatters work:</p><ul><li><b>Registry:</b> <code>FormattingConversionService</code> stores formatters as converters (String to T and T to String).</li><li><b>Web:</b> <code>WebDataBinder</code> uses it for request parameters, path variables and form binding.</li><li><b>View:</b> Thymeleaf and JSP tags call it to print values.</li><li><b>Boot:</b> <code>WebMvcAutoConfiguration</code> adds all <code>Formatter</code> beans.</li></ul>`,
            r`public interface Formatter<T> extends Printer<T>, Parser<T> {
}
public interface Printer<T> {
    String print(T object, Locale locale);
}
public interface Parser<T> {
    T parse(String text, Locale locale) throws ParseException;
}

// OUTPUT:
// a Formatter is just a Printer plus a Parser`],
        [`<p>Options:</p><ul><li><b>Formatter bean</b> in Spring Boot, no config class needed.</li><li><b>AnnotationFormatterFactory:</b> annotation-driven, like <code>@DateTimeFormat</code>.</li><li><b>Built-ins:</b> <code>@NumberFormat</code>, <code>@DateTimeFormat</code>.</li><li><b>Boot properties:</b> <code>spring.mvc.format.date</code> sets the default date pattern.</li></ul>`,
            r`@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Upper { }

public class UpperFactory implements AnnotationFormatterFactory<Upper> {
    public Set<Class<?>> getFieldTypes() { return Set.of(String.class); }
    public Printer<?> getPrinter(Upper a, Class<?> t) { return (s, l) -> s.toString(); }
    public Parser<?> getParser(Upper a, Class<?> t) {
        return (text, locale) -> text.toUpperCase(locale);
    }
}

// OUTPUT:
// field annotated @Upper stores "abaji" as "ABAJI"`],
        [`<p>Mistakes:</p><ul><li><b>Shared SimpleDateFormat:</b> not thread safe.</li><li><b>Swallowing errors:</b> returning null on bad input hides problems; throw <code>ParseException</code>.</li><li><b>Expecting JSON effect:</b> Jackson does not use formatters.</li><li><b>Ignoring the Locale:</b> decimal separators differ between locales.</li></ul>`,
            r`// WRONG: shared mutable formatter field
private final SimpleDateFormat f = new SimpleDateFormat("dd-MM-yyyy");

// RIGHT: immutable and thread safe
private static final DateTimeFormatter F = DateTimeFormatter.ofPattern("dd-MM-yyyy");

// OUTPUT:
// WRONG: random wrong dates under concurrent load
// RIGHT: consistent results`],
        [`<p>Tuning:</p><ul><li><b>Create once:</b> build patterns and regexes as constants.</li><li><b>Cache:</b> the conversion service caches the converter found per type pair.</li><li><b>Keep parse cheap:</b> it runs on every bound request.</li></ul>`,
            r`private static final Pattern MONEY = Pattern.compile("(\\d+(\\.\\d+)?) ([A-Z]{3})");

public Money parse(String text, Locale l) throws ParseException {
    Matcher m = MONEY.matcher(text.trim());
    if (!m.matches()) throw new ParseException("bad money: " + text, 0);
    return new Money(new BigDecimal(m.group(1)), m.group(3));
}

// OUTPUT:
// no per-call pattern compilation`],
        [`<p>Scenario: a shop accepts prices as <code>12.50 INR</code> in query strings. One formatter makes every controller accept <code>Money</code> and the same text is printed in the views.</p>`,
            r`@GetMapping("/search")
List<Product> search(@RequestParam Money max) {
    return products.cheaperThan(max);
}

// OUTPUT:
// GET /search?max=500 INR -> products priced below 500 INR`]
    ),
    'mvc-custom-converter-advanced': dv(
        [`<p>Mechanics:</p><ul><li><b>GenericConversionService</b> stores converters in a map keyed by source and target type.</li><li><b>Lookup:</b> finds the closest match, walking the class hierarchy of both types.</li><li><b>Boot:</b> <code>WebConversionService</code> adds all <code>Converter</code>, <code>GenericConverter</code> and <code>Formatter</code> beans.</li><li><b>Cache:</b> the found converter is cached per type pair.</li></ul>`,
            r`public interface Converter<S, T> {
    T convert(S source);
}

// registration extracts S and T from the generic signature
registry.addConverter(new StringToStatus());

// OUTPUT:
// pair (String -> Status) now resolves to StringToStatus`],
        [`<p>Variants:</p><ul><li><b>Converter:</b> one pair.</li><li><b>ConverterFactory:</b> one converter per subtype of a base.</li><li><b>GenericConverter:</b> many pairs, access to field annotations.</li><li><b>ConditionalConverter:</b> choose at runtime with <code>matches</code>.</li><li><b>Lambda:</b> pass the types explicitly with <code>addConverter(String.class, Status.class, fn)</code>.</li></ul>`,
            r`public class StringToEnumFactory
        implements ConverterFactory<String, Enum> {
    public <T extends Enum> Converter<String, T> getConverter(Class<T> type) {
        return src -> (T) Enum.valueOf(type, src.trim().toUpperCase());
    }
}

registry.addConverterFactory(new StringToEnumFactory());

// OUTPUT:
// every enum type accepts case-insensitive text`],
        [`<p>Mistakes:</p><ul><li><b>Lambda bean:</b> generics are erased, so the bean cannot be registered.</li><li><b>Returning null</b> for a primitive target.</li><li><b>Wrong exception:</b> let it throw a clear <code>IllegalArgumentException</code>, which becomes 400.</li><li><b>Expecting JSON effect:</b> Jackson needs its own deserializer.</li></ul>`,
            r`// WRONG: erased generics, Spring cannot find the pair
@Bean Converter<String, Status> c() { return s -> Status.valueOf(s); }

// RIGHT: use a named class
@Component
class StringToStatus implements Converter<String, Status> {
    public Status convert(String s) { return Status.valueOf(s.toUpperCase()); }
}

// OUTPUT:
// WRONG: converter never applied
// RIGHT: applied to every String to Status binding`],
        [`<p>Tuning:</p><ul><li><b>Stateless:</b> converters are shared singletons.</li><li><b>Fast lookup:</b> use a static map for code-to-object conversion instead of a database call.</li><li><b>Avoid chains:</b> converting through an intermediate type costs twice.</li></ul>`,
            r`private static final Map<String, Status> BY_CODE = Arrays.stream(Status.values())
    .collect(Collectors.toMap(s -> s.name().toLowerCase(), s -> s));

public Status convert(String src) {
    Status s = BY_CODE.get(src.trim().toLowerCase());
    if (s == null) throw new IllegalArgumentException("unknown status " + src);
    return s;
}

// OUTPUT:
// O(1) lookup, clear error message`],
        [`<p>Scenario: a list page filters by <code>?status=blocked</code>. A converter turns text into the enum for all endpoints and unknown values give a clean 400 response.</p>`,
            r`@GetMapping("/accounts")
List<Account> accounts(@RequestParam(required = false) Status status) {
    return status == null ? repo.findAll() : repo.findByStatus(status);
}

// OUTPUT:
// GET /accounts?status=blocked -> blocked accounts
// GET /accounts?status=zzz -> 400 Bad Request`]
    ),
    'mvc-custom-interceptor': dv(
        [`<p>Execution flow:</p><ul><li><b>HandlerExecutionChain:</b> the mapping returns the handler plus its interceptors.</li><li><b>applyPreHandle:</b> runs each <code>preHandle</code> in order; if one returns false, earlier interceptors get <code>afterCompletion</code> and the chain stops.</li><li><b>Handler:</b> the controller runs via the adapter.</li><li><b>applyPostHandle:</b> reverse order, only if no exception.</li><li><b>triggerAfterCompletion:</b> reverse order, always for the ones that passed.</li></ul>`,
            r`// simplified DispatcherServlet.doDispatch
if (!mappedHandler.applyPreHandle(request, response)) {
    return;                                  // vetoed
}
mv = ha.handle(request, response, mappedHandler.getHandler());
mappedHandler.applyPostHandle(request, response, mv);
// rendering happens here
mappedHandler.triggerAfterCompletion(request, response, null);

// OUTPUT:
// framework code: pre in order, post and after in reverse`],
        [`<p>Options:</p><ul><li><b>Path patterns:</b> <code>addPathPatterns</code> and <code>excludePathPatterns</code> use Ant-style or parsed patterns.</li><li><b>Order:</b> <code>.order(n)</code> on the registration.</li><li><b>HandlerMethod:</b> read annotations on the target method.</li><li><b>WebRequestInterceptor:</b> a servlet-neutral variant.</li><li><b>Lambda:</b> <code>HandlerInterceptor</code> has default methods, so a lambda gives only <code>preHandle</code>.</li></ul>`,
            r`public boolean preHandle(HttpServletRequest req, HttpServletResponse res,
                         Object handler) {
    if (handler instanceof HandlerMethod hm
            && hm.hasMethodAnnotation(AdminOnly.class)
            && !isAdmin(req)) {
        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
        return false;
    }
    return true;
}

// OUTPUT:
// non-admin calling an @AdminOnly endpoint -> 403`],
        [`<p>Mistakes:</p><ul><li><b>Instance state:</b> storing request data in a field is not thread safe; use request attributes.</li><li><b>Not registered:</b> a <code>@Component</code> alone does nothing.</li><li><b>Static resources:</b> patterns may also catch them; exclude as needed.</li><li><b>No response after false:</b> returning false without writing a response gives an empty 200.</li></ul>`,
            r`// WRONG: field shared by all requests
private long start;
public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    start = System.nanoTime();
    return true;
}

// RIGHT: keep it per request
q.setAttribute("start", System.nanoTime());

// OUTPUT:
// WRONG: timings mix up under concurrency
// RIGHT: each request has its own start time`],
        [`<p>Tuning:</p><ul><li><b>Narrow patterns</b> so cheap requests skip the interceptor.</li><li><b>No blocking calls</b> in <code>preHandle</code>.</li><li><b>Metrics:</b> use Micrometer built-in timers rather than custom timing in production.</li></ul>`,
            r`registry.addInterceptor(audit)
    .addPathPatterns("/api/admin/**")      // only where needed
    .excludePathPatterns("/api/admin/ping");

// OUTPUT:
// audit code runs only for admin endpoints`],
        [`<p>Scenario: every API call must carry a correlation id. An interceptor reads or creates it, puts it in the logging context, and clears it in <code>afterCompletion</code>.</p>`,
            r`public boolean preHandle(HttpServletRequest q, HttpServletResponse s, Object h) {
    String id = Optional.ofNullable(q.getHeader("X-Correlation-Id"))
        .orElse(UUID.randomUUID().toString());
    MDC.put("cid", id);
    s.setHeader("X-Correlation-Id", id);
    return true;
}
public void afterCompletion(HttpServletRequest q, HttpServletResponse s,
        Object h, Exception ex) {
    MDC.remove("cid");
}

// OUTPUT: (varies)
// X-Correlation-Id: 4f1c0b6e-...`]
    ),
    'mvc-custom-exception-resolver': dv(
        [`<p>Resolution flow:</p><ul><li><b>Catch:</b> <code>DispatcherServlet.processHandlerException</code> receives any exception from the handler.</li><li><b>Loop:</b> each resolver in the list gets a chance; the first non-null <code>ModelAndView</code> wins.</li><li><b>Defaults order:</b> <code>ExceptionHandlerExceptionResolver</code>, <code>ResponseStatusExceptionResolver</code>, <code>DefaultHandlerExceptionResolver</code>.</li><li><b>Unresolved:</b> the exception is rethrown to the container, which shows its error page.</li></ul>`,
            r`protected ModelAndView processHandlerException(HttpServletRequest req,
        HttpServletResponse res, Object handler, Exception ex) throws Exception {
    for (HandlerExceptionResolver r : this.handlerExceptionResolvers) {
        ModelAndView mv = r.resolveException(req, res, handler, ex);
        if (mv != null) {
            return mv;
        }
    }
    throw ex;
}

// OUTPUT:
// framework code: first non-null result stops the loop`],
        [`<p>Variants:</p><ul><li><b>AbstractHandlerExceptionResolver:</b> base class with <code>shouldApplyTo</code> and logging.</li><li><b>Order</b> through <code>setOrder</code>.</li><li><b>JSON body:</b> write with <code>ObjectMapper</code> to <code>response.getWriter()</code>.</li><li><b>Error view:</b> return a <code>ModelAndView("error/conflict")</code>.</li><li><b>Spring 6 ProblemDetail:</b> <code>@ExceptionHandler</code> methods can return it directly.</li></ul>`,
            r`public class JsonErrorResolver extends AbstractHandlerExceptionResolver {
    private final ObjectMapper mapper = new ObjectMapper();
    protected ModelAndView doResolveException(HttpServletRequest req,
            HttpServletResponse res, Object handler, Exception ex) {
        try {
            res.setStatus(500);
            res.setContentType("application/json");
            mapper.writeValue(res.getWriter(), Map.of("error", ex.getMessage()));
        } catch (IOException e) { return null;
        }
        return new ModelAndView();
    }
}

// OUTPUT:
// {"error":"boom"} with status 500`],
        [`<p>Mistakes:</p><ul><li><b>Returning an empty ModelAndView without writing</b> gives an empty response.</li><li><b>Returning null after writing:</b> later resolvers may write again.</li><li><b>Wrong position:</b> placed after the built-ins, it never sees exceptions they handle.</li><li><b>Swallowing the cause:</b> always log the exception.</li></ul>`,
            r`// WRONG: handled but nothing sent to the client
return new ModelAndView();

// RIGHT: send a status first
res.sendError(HttpServletResponse.SC_CONFLICT, ex.getMessage());
return new ModelAndView();

// OUTPUT:
// WRONG: empty 200 response
// RIGHT: 409 with a message`],
        [`<p>Tuning:</p><ul><li><b>Cheap type checks</b> first, then return null quickly.</li><li><b>Log once:</b> avoid logging the same exception in several resolvers.</li><li><b>No heavy work</b> in the error path, since errors can spike under load.</li></ul>`,
            r`protected ModelAndView doResolveException(HttpServletRequest q,
        HttpServletResponse s, Object h, Exception ex) {
    if (!(ex instanceof IllegalStateException)) {
        return null;                       // fast exit for other exceptions
    }
    return writeConflict(s, ex);
}

// OUTPUT:
// other exceptions are passed on at almost no cost`],
        [`<p>Scenario: a platform team wants all unexpected exceptions logged with the correlation id and answered with one JSON shape. A resolver placed first does this for every controller, while specific <code>@ExceptionHandler</code> methods stay available as a second layer.</p>`,
            r`@Override
public void extendHandlerExceptionResolvers(List<HandlerExceptionResolver> l) {
    l.add(new JsonErrorResolver());          // last resort for unhandled errors
}

// OUTPUT:
// unhandled exception -> 500 {"error":"boom"} and one log line`]
    )
};
