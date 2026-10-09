// Spring extras, batch smvc29 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc29Extras: Record<string, Extra> = {
    'mvc-security-filters': x(
        ['<b>Security filter chain</b>: Spring Security protects a web app with an ordered list of servlet filters that run before the <code>DispatcherServlet</code> and decide whether a request may continue.',
            '<b>Entry point</b>: a servlet filter named <code>DelegatingFilterProxy</code> (or <code>FilterChainProxy</code> in Boot) hands each request to the security chain.',
            '<b>Configuration</b>: you declare a <code>SecurityFilterChain</code> bean and use <code>HttpSecurity</code> to switch filters on, such as login, CSRF and CORS.'],
        ['<b>Order matters</b>: filters like <code>SecurityContextHolderFilter</code>, <code>UsernamePasswordAuthenticationFilter</code> and <code>AuthorizationFilter</code> run in a fixed order.',
            '<b>Several chains</b>: you can define more than one <code>SecurityFilterChain</code> and pick one per URL with <code>securityMatcher</code>, for example one for <code>/api/**</code> and one for the web pages.',
            '<b>Custom filter</b>: add your own with <code>addFilterBefore</code> or <code>addFilterAfter</code>, for example a JWT filter before the login filter.'],
        ['<b>Bypass</b>: <code>web.ignoring()</code> skips the whole chain (no headers, no context), so prefer <code>permitAll()</code> for public URLs.',
            '<b>OncePerRequestFilter</b>: extend it so your filter runs once per request even after forwards.',
            '<b>Debugging</b>: set <code>logging.level.org.springframework.security=DEBUG</code> to see the filters of every request.'],
        [['F', 'What is a security filter chain?', 'An ordered list of servlet filters that Spring Security runs before a request reaches the controller.'],
            ['F', 'Which bean configures it in Spring Security 6?', 'A SecurityFilterChain bean built from HttpSecurity.'],
            ['M', 'How do you add a custom filter?', 'Extend OncePerRequestFilter and register it with http.addFilterBefore or addFilterAfter.'],
            ['M', 'Difference between permitAll and web.ignoring?', 'permitAll still runs the chain (headers, context), while ignoring skips the chain completely.'],
            ['S', 'How do multiple chains choose which one handles a request?', 'FilterChainProxy checks each chain in @Order and uses the first whose securityMatcher matches.'],
            ['S', 'Where does the chain sit relative to Spring MVC?', 'It is a servlet filter, so it runs before the DispatcherServlet and interceptors.']],
        [['A minimal chain bean.',
            r`@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(a -> a
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}

// OUTPUT:
// GET /public/hi  -> 200
// GET /private    -> 401 Unauthorized (WWW-Authenticate: Basic)`],
            ['Printing the filters.',
                r`@Component
class ChainPrinter implements CommandLineRunner {
    private final SecurityFilterChain chain;
    ChainPrinter(SecurityFilterChain chain) { this.chain = chain; }
    public void run(String... args) {
        chain.getFilters().forEach(f ->
            System.out.println(f.getClass().getSimpleName()));
    }
}

// OUTPUT: (varies by configuration)
// DisableEncodeUrlFilter
// SecurityContextHolderFilter
// HeaderWriterFilter
// CsrfFilter
// LogoutFilter
// BasicAuthenticationFilter
// ExceptionTranslationFilter
// AuthorizationFilter`]],
        [['A custom logging filter.',
            r`public class RequestIdFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req,
            HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        res.setHeader("X-Request-Id", UUID.randomUUID().toString());
        chain.doFilter(req, res);
    }
}
// http.addFilterBefore(new RequestIdFilter(), CsrfFilter.class);

// OUTPUT:
// HTTP/1.1 200
// X-Request-Id: 6f1c... (varies)`],
            ['Testing with MockMvc.',
                r`@WebMvcTest(HelloController.class)
@Import(SecurityConfig.class)
class SecurityTest {
    @Autowired MockMvc mvc;

    @Test void anonymousIsRejected() throws Exception {
        mvc.perform(get("/private")).andExpect(status().isUnauthorized());
    }
    @Test @WithMockUser void userPasses() throws Exception {
        mvc.perform(get("/private")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0, Errors: 0`]]
    ),

    'mvc-csrf': x(
        ['<b>CSRF</b> (Cross-Site Request Forgery) is an attack where a malicious page makes the browser of a logged-in user send a request to your site, using the cookies the browser attaches automatically.',
            '<b>Defense</b>: Spring Security gives every session a secret token and rejects state-changing requests (<code>POST</code>, <code>PUT</code>, <code>DELETE</code>) that do not send it back.',
            '<b>Default</b>: CSRF protection is on by default for browser apps; <code>GET</code>, <code>HEAD</code> and <code>OPTIONS</code> are not checked.'],
        ['<b>Token in forms</b>: Thymeleaf adds a hidden <code>_csrf</code> field to forms automatically when the form uses <code>th:action</code>.',
            '<b>Token in AJAX</b>: send the token in the <code>X-CSRF-TOKEN</code> header, or use <code>CookieCsrfTokenRepository.withHttpOnlyFalse()</code> so JavaScript can read an <code>XSRF-TOKEN</code> cookie.',
            '<b>403 Forbidden</b>: a missing or wrong token on a POST gives 403, the most common reason a new login form or REST call fails.'],
        ['<b>Stateless APIs</b>: pure token APIs (JWT in the Authorization header, no cookies) may disable CSRF with <code>csrf(c -&gt; c.disable())</code>; never disable it for cookie sessions.',
            '<b>SameSite cookies</b>: <code>SameSite=Lax</code> or <code>Strict</code> is a good second layer but does not replace the token.',
            '<b>Spring Security 6</b>: the token is loaded lazily and can be BREACH-protected with <code>XorCsrfTokenRequestAttributeHandler</code>.'],
        [['F', 'What is CSRF?', 'An attack that tricks a logged-in browser into sending an unwanted request to a site that trusts its cookies.'],
            ['F', 'Which HTTP methods does Spring Security check?', 'State-changing ones such as POST, PUT, PATCH and DELETE; GET, HEAD, OPTIONS and TRACE are skipped.'],
            ['M', 'How do you send the token from JavaScript?', 'Read it from a meta tag or the XSRF-TOKEN cookie and send it in the X-CSRF-TOKEN header.'],
            ['M', 'Why did my POST return 403?', 'The CSRF token is missing or invalid, or the session expired; add the token or fix the form action.'],
            ['S', 'When is it safe to disable CSRF?', 'For stateless APIs that authenticate with a header token and use no cookies for authentication.'],
            ['S', 'How does CookieCsrfTokenRepository work?', 'It stores the token in a cookie and compares it with the header or parameter, so no server session is needed for the token.']],
        [['Default form with Thymeleaf.',
            r`<form th:action="@{/transfer}" method="post">
    <input name="amount" />
    <button>Send</button>
    <!-- Thymeleaf adds: <input type="hidden" name="_csrf" value="..."/> -->
</form>

// OUTPUT:
// POST /transfer with _csrf  -> 200
// POST /transfer without it  -> 403 Forbidden`],
            ['Cookie repository for a single page app.',
                r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.csrf(c -> c.csrfTokenRepository(
        CookieCsrfTokenRepository.withHttpOnlyFalse()));
    return http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults()).build();
}

// OUTPUT:
// Set-Cookie: XSRF-TOKEN=3b9f...; Path=/   (varies)
// the client echoes it in header X-XSRF-TOKEN`]],
        [['Testing with the csrf() post processor.',
            r`@Test @WithMockUser
void postNeedsToken() throws Exception {
    mvc.perform(post("/transfer")).andExpect(status().isForbidden());
    mvc.perform(post("/transfer").with(csrf()))
       .andExpect(status().isOk());
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Disabling CSRF for a stateless API chain only.',
                r`@Bean @Order(1)
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http.securityMatcher("/api/**")
        .csrf(c -> c.disable())
        .sessionManagement(s -> s
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()));
    return http.build();
}

// OUTPUT:
// POST /api/orders with Bearer token and no CSRF token -> 201`]]
    ),

    'mvc-cors-plus-security': x(
        ['<b>CORS</b> (Cross-Origin Resource Sharing) lets a browser page from one origin call an API on another origin when the server sends the right <code>Access-Control-Allow-*</code> headers.',
            '<b>With Security</b>: the CORS preflight (<code>OPTIONS</code>) request carries no credentials, so Spring Security must handle CORS before it checks authentication.',
            '<b>One call</b>: enable it with <code>http.cors(Customizer.withDefaults())</code> plus a <code>CorsConfigurationSource</code> bean.'],
        ['<b>Why @CrossOrigin alone fails</b>: if the security chain rejects the preflight with 401 or 403, the MVC annotation never runs.',
            '<b>CorsConfigurationSource</b>: define allowed origins, methods and headers once and register it for <code>/**</code> with <code>UrlBasedCorsConfigurationSource</code>.',
            '<b>Credentials</b>: with <code>allowCredentials(true)</code> you cannot use the wildcard <code>*</code> for origins; list the exact origins.'],
        ['<b>CorsFilter</b>: <code>http.cors()</code> adds a <code>CorsFilter</code> early in the chain, so preflights are answered before authorization.',
            '<b>Preflight cache</b>: set <code>maxAge</code> so browsers skip repeated preflights.',
            '<b>Not a security control</b>: CORS only instructs browsers; tools like curl ignore it, so you still need authentication.'],
        [['F', 'What is CORS?', 'A browser mechanism that allows or blocks cross-origin requests based on response headers from the server.'],
            ['F', 'What is a preflight request?', 'An automatic OPTIONS request the browser sends first to ask if the real request is allowed.'],
            ['M', 'Why does my API return 403 on OPTIONS with Spring Security?', 'CORS is not enabled in the security chain, so the preflight is treated as an unauthenticated request.'],
            ['M', 'Can you use * with credentials?', 'No, browsers reject it; you must list the exact origins when credentials are allowed.'],
            ['S', 'Where should CORS be configured when Security is present?', 'In the SecurityFilterChain with http.cors and a CorsConfigurationSource bean, so it runs before authorization.'],
            ['S', 'Does CORS protect the API from attackers?', 'No, it only restricts browsers; servers must still authenticate and authorize every request.']],
        [['Security plus CORS bean.',
            r`@Bean
SecurityFilterChain chain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}

@Bean
CorsConfigurationSource corsSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("http://localhost:3000"));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    c.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
}

// OUTPUT:
// OPTIONS /api/items (Origin: http://localhost:3000) -> 200
// Access-Control-Allow-Origin: http://localhost:3000`],
            ['Checking a preflight with curl.',
                r`curl -i -X OPTIONS http://localhost:8080/api/items \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"

// OUTPUT:
// HTTP/1.1 200
// Access-Control-Allow-Origin: http://localhost:3000
// Access-Control-Allow-Methods: POST
// Access-Control-Allow-Credentials: true`]],
        [['Testing the preflight with MockMvc.',
            r`@Test
void preflightIsAllowed() throws Exception {
    mvc.perform(options("/api/items")
            .header("Origin", "http://localhost:3000")
            .header("Access-Control-Request-Method", "POST"))
       .andExpect(status().isOk())
       .andExpect(header().string("Access-Control-Allow-Origin",
            "http://localhost:3000"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Rejected origin.',
                r`@Test
void unknownOriginIsRejected() throws Exception {
    mvc.perform(options("/api/items")
            .header("Origin", "http://evil.example")
            .header("Access-Control-Request-Method", "POST"))
       .andExpect(status().isForbidden());
}

// OUTPUT:
// Invalid CORS request -> 403`]]
    ),

    'mvc-role-based-authorization': x(
        ['<b>Role-based authorization</b> allows or denies access depending on the roles of the logged-in user, such as <code>USER</code> or <code>ADMIN</code>.',
            '<b>URL rules</b>: write them in the chain with <code>requestMatchers("/admin/**").hasRole("ADMIN")</code>; the first matching rule wins.',
            '<b>ROLE_ prefix</b>: <code>hasRole("ADMIN")</code> checks the authority <code>ROLE_ADMIN</code>; <code>hasAuthority("ADMIN")</code> checks the exact text.'],
        ['<b>Rule order</b>: put specific rules first and <code>anyRequest()</code> last, or a broad rule hides the narrow ones.',
            '<b>Helpers</b>: <code>hasAnyRole</code>, <code>authenticated</code>, <code>permitAll</code>, <code>denyAll</code> and <code>access(...)</code> with an <code>AuthorizationManager</code>.',
            '<b>Results</b>: an anonymous user gets 401 (or a redirect to login); a logged-in user without the role gets 403.'],
        ['<b>Role hierarchy</b>: a <code>RoleHierarchy</code> bean lets ADMIN imply USER so you do not repeat roles.',
            '<b>Roles versus permissions</b>: roles are coarse; fine-grained permissions (<code>order:write</code>) as authorities scale better.',
            '<b>Data from the database</b>: <code>UserDetailsService</code> maps stored roles to <code>GrantedAuthority</code> objects.'],
        [['F', 'What does hasRole("ADMIN") check?', 'That the user has the authority ROLE_ADMIN.'],
            ['F', 'What HTTP status means not logged in and what means no permission?', '401 means not authenticated, 403 means authenticated but not allowed.'],
            ['M', 'Why must anyRequest come last?', 'Rules are matched in order, so an early broad rule would swallow the more specific ones below it.'],
            ['M', 'Difference between hasRole and hasAuthority?', 'hasRole adds the ROLE_ prefix automatically; hasAuthority compares the text exactly.'],
            ['S', 'How do you make ADMIN include USER rights?', 'Declare a RoleHierarchy bean such as ROLE_ADMIN > ROLE_USER.'],
            ['S', 'How do you test authorization rules?', 'Use MockMvc with @WithMockUser(roles) and assert 200, 401 or 403.']],
        [['URL rules by role.',
            r`http.authorizeHttpRequests(a -> a
    .requestMatchers("/").permitAll()
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .requestMatchers("/reports/**").hasAnyRole("ADMIN", "MANAGER")
    .anyRequest().authenticated());

// OUTPUT:
// GET /admin/users as USER  -> 403
// GET /admin/users as ADMIN -> 200
// GET /admin/users anonymous -> 302 to /login`],
            ['In-memory users for a demo.',
                r`@Bean
UserDetailsService users(PasswordEncoder enc) {
    return new InMemoryUserDetailsManager(
        User.withUsername("ann").password(enc.encode("pw"))
            .roles("USER").build(),
        User.withUsername("root").password(enc.encode("pw"))
            .roles("ADMIN").build());
}
@Bean PasswordEncoder encoder() { return new BCryptPasswordEncoder(); }

// OUTPUT:
// ann  -> authorities [ROLE_USER]
// root -> authorities [ROLE_ADMIN]`]],
        [['Test roles with MockMvc.',
            r`@Test @WithMockUser(roles = "USER")
void userCannotOpenAdmin() throws Exception {
    mvc.perform(get("/admin/users")).andExpect(status().isForbidden());
}
@Test @WithMockUser(roles = "ADMIN")
void adminCan() throws Exception {
    mvc.perform(get("/admin/users")).andExpect(status().isOk());
}

// OUTPUT:
// Tests run: 2, Failures: 0`],
            ['Role hierarchy.',
                r`@Bean
RoleHierarchy roleHierarchy() {
    return RoleHierarchyImpl.fromHierarchy("ROLE_ADMIN > ROLE_USER");
}

// OUTPUT:
// an ADMIN can now open URLs that need hasRole("USER")`]]
    ),

    'mvc-method-level-security': x(
        ['<b>Method security</b> puts authorization rules directly on service or controller methods with annotations such as <code>@PreAuthorize</code>.',
            '<b>Enable it</b>: add <code>@EnableMethodSecurity</code> to a configuration class; in Spring Security 6 <code>@PreAuthorize</code> and <code>@PostAuthorize</code> are on by default with it.',
            '<b>Example</b>: <code>@PreAuthorize("hasRole(\'ADMIN\')")</code> blocks the call before the method body runs and throws <code>AccessDeniedException</code>.'],
        ['<b>SpEL</b>: rules are expressions, so you can use method arguments: <code>@PreAuthorize("#id == authentication.principal.id")</code>.',
            '<b>@PostAuthorize</b>: checks after the method returns, using <code>returnObject</code>, for example to allow only the owner of the result.',
            '<b>Other annotations</b>: <code>@PreFilter</code> and <code>@PostFilter</code> filter collections; <code>@Secured</code> and JSR-250 <code>@RolesAllowed</code> are simpler role checks.'],
        ['<b>Proxy based</b>: security is applied by an AOP proxy, so a self-call inside the same class (<code>this.method()</code>) skips the check.',
            '<b>Where to put it</b>: protect the service layer, because a service may be called from several controllers, jobs or messages.',
            '<b>Custom beans</b>: call a bean in SpEL, <code>@PreAuthorize("@perm.canEdit(#id)")</code>, to keep complex rules testable.'],
        [['F', 'Which annotation enables method security?', '@EnableMethodSecurity on a configuration class.'],
            ['F', 'What does @PreAuthorize do?', 'It evaluates a SpEL rule before the method runs and denies the call if the rule is false.'],
            ['M', 'Difference between @PreAuthorize and @PostAuthorize?', 'Pre checks before the call using arguments; Post checks after, using the returned object.'],
            ['M', 'What exception is thrown on denial?', 'AccessDeniedException, which the web layer turns into 403.'],
            ['S', 'Why might @PreAuthorize be ignored?', 'A self-invocation bypasses the proxy, or the bean is not proxied, or method security is not enabled.'],
            ['S', 'URL rules or method rules?', 'Use URL rules for coarse access and method rules for business-level checks close to the data; combine both.']],
        [['Enable and use.',
            r`@Configuration
@EnableMethodSecurity
class MethodSecurityConfig { }

@Service
class AccountService {
    @PreAuthorize("hasRole('ADMIN')")
    void deleteAll() { /* ... */ }

    @PreAuthorize("#owner == authentication.name")
    Account find(String owner) { return new Account(owner); }
}

// OUTPUT:
// deleteAll() as USER -> AccessDeniedException (403)
// find("ann") as ann  -> returns the account`],
            ['PostAuthorize on the result.',
                r`@PostAuthorize("returnObject.owner == authentication.name")
public Document load(long id) {
    return repo.findById(id).orElseThrow();
}

// OUTPUT:
// bob loads a document owned by ann -> AccessDeniedException`]],
        [['Testing a service rule.',
            r`@SpringBootTest
class AccountServiceTest {
    @Autowired AccountService service;

    @Test @WithMockUser(roles = "USER")
    void userCannotDelete() {
        assertThrows(AccessDeniedException.class, () -> service.deleteAll());
    }
    @Test @WithMockUser(roles = "ADMIN")
    void adminCanDelete() { service.deleteAll(); }
}

// OUTPUT:
// Tests run: 2, Failures: 0`],
            ['Custom permission bean.',
                r`@Component("perm")
class Perm {
    boolean canEdit(long id) { return id < 100; }
}

@PreAuthorize("@perm.canEdit(#id)")
void edit(long id) { }

// OUTPUT:
// edit(5) allowed, edit(500) -> AccessDeniedException`]]
    ),

    'mvc-security-context': x(
        ['<b>SecurityContext</b> is the object that holds the <code>Authentication</code> of the current user (who is logged in and with which authorities).',
            '<b>SecurityContextHolder</b> gives access to it from anywhere: <code>SecurityContextHolder.getContext().getAuthentication()</code>.',
            '<b>Per thread</b>: by default the context is stored in a <code>ThreadLocal</code>, so it belongs to the thread handling the current request.'],
        ['<b>Loaded per request</b>: <code>SecurityContextHolderFilter</code> loads the context from the session at the start and clears it at the end.',
            '<b>Authentication parts</b>: principal (the user), credentials (cleared after login), authorities and the <code>authenticated</code> flag.',
            '<b>Anonymous</b>: a user who is not logged in has an <code>AnonymousAuthenticationToken</code>, not <code>null</code>.'],
        ['<b>Async code</b>: a new thread does not inherit the context; use <code>DelegatingSecurityContextExecutor</code> or the <code>MODE_INHERITABLETHREADLOCAL</code> strategy.',
            '<b>Repository</b>: <code>SecurityContextRepository</code> decides where the context is saved between requests (session by default, nothing for stateless).',
            '<b>Explicit save</b>: in Spring Security 6 you must save the context yourself when you authenticate manually in a controller.'],
        [['F', 'What is the SecurityContext?', 'The holder of the current Authentication, meaning who the user is and what they may do.'],
            ['F', 'How do you read the current user?', 'SecurityContextHolder.getContext().getAuthentication().'],
            ['M', 'Where is the context stored by default?', 'In a ThreadLocal during the request and in the HTTP session between requests.'],
            ['M', 'Why is the user missing in an @Async method?', 'The new thread has its own empty ThreadLocal; propagate the context to it.'],
            ['S', 'How do you log a user in programmatically in Security 6?', 'Create an empty context, set the Authentication, call SecurityContextHolder.setContext and save it with a SecurityContextRepository.'],
            ['S', 'What happens at the end of a request?', 'The filter clears the ThreadLocal so the pooled thread does not leak the previous user.']],
        [['Reading the context.',
            r`@GetMapping("/whoami")
String whoami() {
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    return a.getName() + " " + a.getAuthorities();
}

// OUTPUT:
// GET /whoami as ann -> ann [ROLE_USER]`],
            ['Programmatic login.',
                r`@PostMapping("/auto-login")
void login(HttpServletRequest req, HttpServletResponse res) {
    Authentication auth = UsernamePasswordAuthenticationToken.authenticated(
        "ann", null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
    SecurityContext ctx = SecurityContextHolder.createEmptyContext();
    ctx.setAuthentication(auth);
    SecurityContextHolder.setContext(ctx);
    new HttpSessionSecurityContextRepository().saveContext(ctx, req, res);
}

// OUTPUT:
// Set-Cookie: JSESSIONID=...; the next request is authenticated as ann`]],
        [['Propagating to another thread.',
            r`ExecutorService raw = Executors.newFixedThreadPool(2);
ExecutorService ex = new DelegatingSecurityContextExecutorService(raw);
ex.submit(() -> System.out.println(
    SecurityContextHolder.getContext().getAuthentication().getName()));

// OUTPUT:
// ann`],
            ['Setting a test context.',
                r`@Test
void serviceSeesUser() {
    SecurityContext ctx = SecurityContextHolder.createEmptyContext();
    ctx.setAuthentication(new TestingAuthenticationToken("ann", "x", "ROLE_USER"));
    SecurityContextHolder.setContext(ctx);
    assertEquals("ann", currentUserService.name());
    SecurityContextHolder.clearContext();
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-principal-security': x(
        ['<b>Principal</b> is the identity of the logged-in user; in Spring Security it is the object returned by <code>Authentication.getPrincipal()</code>, usually a <code>UserDetails</code>.',
            '<b>In a controller</b>: add a <code>Principal</code> parameter and Spring MVC fills it, so <code>principal.getName()</code> gives the username.',
            '<b>Better</b>: use <code>@AuthenticationPrincipal UserDetails user</code> to get your own user type directly.'],
        ['<b>Parameter options</b>: <code>Principal</code>, <code>Authentication</code>, <code>@AuthenticationPrincipal</code> and <code>HttpServletRequest.getUserPrincipal()</code> all give the same user.',
            '<b>Anonymous</b>: for a page that anyone can open, the principal may be <code>null</code> (plain <code>Principal</code>) or the string <code>anonymousUser</code> (from the holder).',
            '<b>Thymeleaf</b>: <code>sec:authentication="name"</code> prints the username in a view (needs the springsecurity extras dialect).'],
        ['<b>How it is resolved</b>: <code>ServletRequestMethodArgumentResolver</code> handles <code>Principal</code>; <code>AuthenticationPrincipalArgumentResolver</code> handles the annotation.',
            '<b>Custom principal</b>: have your <code>UserDetailsService</code> return a class that extends <code>User</code> with an id field, then read the id without a database call.',
            '<b>SpEL</b>: <code>@AuthenticationPrincipal(expression = "id")</code> injects a single property.'],
        [['F', 'What is a Principal?', 'The identity of the currently authenticated user, such as the username.'],
            ['F', 'How do you get the username in a controller?', 'Add a Principal parameter and call getName(), or use Authentication.'],
            ['M', 'What does @AuthenticationPrincipal do?', 'It injects the principal object of the current Authentication into the controller parameter.'],
            ['M', 'Why is the Principal null?', 'The request is not authenticated, or the URL is not protected so the anonymous user has no principal.'],
            ['S', 'How do you expose a user id without an extra query?', 'Return a custom UserDetails with the id from the UserDetailsService and use @AuthenticationPrincipal.'],
            ['S', 'Which argument resolver supplies Principal?', 'ServletRequestMethodArgumentResolver, reading request.getUserPrincipal(), which Spring Security wraps.']],
        [['Three ways to read the user.',
            r`@GetMapping("/me")
Map<String, Object> me(Principal p, Authentication auth,
        @AuthenticationPrincipal UserDetails user) {
    return Map.of("principal", p.getName(),
        "authorities", auth.getAuthorities().toString(),
        "user", user.getUsername());
}

// OUTPUT:
// {"principal":"ann","authorities":"[ROLE_USER]","user":"ann"}`],
            ['Custom principal with an id.',
                r`public class AppUser extends User {
    private final long id;
    public AppUser(long id, String name, String pw,
            Collection<? extends GrantedAuthority> roles) {
        super(name, pw, roles);
        this.id = id;
    }
    public long getId() { return id; }
}

@GetMapping("/orders")
List<Order> mine(@AuthenticationPrincipal(expression = "id") long userId) {
    return orderService.byUser(userId);
}

// OUTPUT:
// GET /orders as ann (id 7) -> orders of user 7`]],
        [['Testing with a user.',
            r`@Test @WithMockUser(username = "ann")
void meReturnsName() throws Exception {
    mvc.perform(get("/me"))
       .andExpect(jsonPath("$.principal").value("ann"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['View with Thymeleaf.',
                r`<p>Hello, <span sec:authentication="name">user</span></p>
<p sec:authorize="hasRole('ADMIN')">Admin panel</p>

// OUTPUT:
// Hello, ann   (the admin line shows only for ADMIN users)`]]
    ),

    'mvc-mvc-plus-jdbc': x(
        ['<b>Spring MVC + JDBC</b> means a controller calls a service, and the service uses <code>JdbcTemplate</code> to run plain SQL against a relational database.',
            '<b>JdbcTemplate</b> opens the connection, runs the statement, maps the rows and closes everything, so you write only the SQL and the mapping.',
            '<b>Layers</b>: controller handles HTTP, service holds business rules and transactions, repository holds the SQL.'],
        ['<b>Query</b>: <code>jdbcTemplate.query(sql, rowMapper, args)</code> returns a list; <code>queryForObject</code> returns one row or throws <code>EmptyResultDataAccessException</code>.',
            '<b>Update</b>: <code>update(sql, args)</code> runs insert, update and delete and returns the number of rows changed.',
            '<b>Parameters</b>: always use <code>?</code> placeholders (or <code>NamedParameterJdbcTemplate</code>) and never join user text into the SQL, to prevent SQL injection.'],
        ['<b>DataSource</b>: Boot auto-configures a pooled <code>HikariDataSource</code> from <code>spring.datasource.*</code>.',
            '<b>Transactions</b>: put <code>@Transactional</code> on service methods; the transaction manager binds one connection to the thread.',
            '<b>Batching</b>: <code>batchUpdate</code> sends many rows in one round trip, much faster than a loop of inserts.'],
        [['F', 'What does JdbcTemplate do?', 'It runs SQL and handles connections, statements, exceptions and cleanup for you.'],
            ['F', 'Why use placeholders?', 'They bind values safely and stop SQL injection.'],
            ['M', 'What is a RowMapper?', 'A function that converts one ResultSet row into a Java object.'],
            ['M', 'What does queryForObject throw when no row exists?', 'EmptyResultDataAccessException.'],
            ['S', 'How do transactions work with JdbcTemplate?', 'DataSourceTransactionManager binds one connection to the thread so all calls in @Transactional share it.'],
            ['S', 'How do you insert many rows fast?', 'Use batchUpdate, and rewriteBatchedStatements style driver options where supported.']],
        [['Repository with JdbcTemplate.',
            r`@Repository
public class UserRepository {
    private final JdbcTemplate jdbc;
    public UserRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<User> findAll() {
        return jdbc.query("select id, name from users",
            (rs, i) -> new User(rs.getLong("id"), rs.getString("name")));
    }
    public int add(String name) {
        return jdbc.update("insert into users(name) values (?)", name);
    }
}

// OUTPUT:
// findAll() -> [User[id=1, name=Ann], User[id=2, name=Bob]]
// add("Cy") -> 1`],
            ['Controller and properties.',
                r`@RestController
@RequestMapping("/users")
class UserController {
    private final UserRepository repo;
    UserController(UserRepository repo) { this.repo = repo; }
    @GetMapping List<User> all() { return repo.findAll(); }
}

# application.properties
spring.datasource.url=jdbc:h2:mem:demo
spring.datasource.username=sa

# OUTPUT:
# GET /users -> [{"id":1,"name":"Ann"},{"id":2,"name":"Bob"}]`]],
        [['Testing with @JdbcTest.',
            r`@JdbcTest
@Import(UserRepository.class)
class UserRepositoryTest {
    @Autowired UserRepository repo;

    @Test void addsAndReads() {
        repo.add("Cy");
        assertTrue(repo.findAll().stream()
            .anyMatch(u -> u.name().equals("Cy")));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0 (rolled back after the test)`],
            ['Controller test with a mocked repository.',
                r`@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired MockMvc mvc;
    @MockBean UserRepository repo;

    @Test void listsUsers() throws Exception {
        when(repo.findAll()).thenReturn(List.of(new User(1, "Ann")));
        mvc.perform(get("/users"))
           .andExpect(jsonPath("$[0].name").value("Ann"));
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-mvc-plus-jpa': x(
        ['<b>Spring MVC + JPA</b> means controllers use services that read and write objects through JPA entities and a <code>JpaRepository</code>, without writing SQL by hand.',
            '<b>Entity</b>: a class marked <code>@Entity</code> with an <code>@Id</code> field maps to one table row per object.',
            '<b>Spring Data JPA</b>: you declare an interface that extends <code>JpaRepository&lt;User, Long&gt;</code> and Spring creates the implementation at startup.'],
        ['<b>Derived queries</b>: a method like <code>findByEmail(String email)</code> becomes SQL from its name; use <code>@Query</code> for custom JPQL.',
            '<b>DTOs</b>: return DTOs (records) from controllers, not entities, to avoid exposing columns and lazy-loading errors.',
            '<b>Paging</b>: accept a <code>Pageable</code> parameter in the controller and return <code>Page&lt;T&gt;</code>.'],
        ['<b>Lazy loading</b>: a lazy association read after the transaction ends causes <code>LazyInitializationException</code>; fetch what you need inside the service or with <code>join fetch</code>.',
            '<b>N+1 problem</b>: looping over parents and touching a lazy child list runs one query per parent; fix with <code>@EntityGraph</code> or join fetch.',
            '<b>Open Session In View</b>: Boot keeps the session open during the request by default (<code>spring.jpa.open-in-view</code>); many teams turn it off to keep database work in the service.'],
        [['F', 'What is an entity?', 'A class mapped to a table with @Entity; each instance is a row.'],
            ['F', 'What does JpaRepository give you?', 'Ready methods such as save, findById, findAll, delete and paging.'],
            ['M', 'How does findByEmail work without code?', 'Spring Data parses the method name and builds the query at startup.'],
            ['M', 'Why return a DTO instead of an entity?', 'To control the exposed fields and avoid lazy loading and recursion problems in JSON.'],
            ['S', 'What is the N+1 problem and the fix?', 'One query for parents plus one per child; fix with join fetch, @EntityGraph or batch fetching.'],
            ['S', 'What does open-in-view do?', 'It keeps the EntityManager open until the view is rendered, hiding lazy loading outside transactions but holding connections longer.']],
        [['Entity, repository and controller.',
            r`@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    // getters and setters
}

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String part);
}

@RestController
class ProductController {
    private final ProductRepository repo;
    ProductController(ProductRepository repo) { this.repo = repo; }
    @GetMapping("/products")
    List<Product> search(@RequestParam String q) {
        return repo.findByNameContainingIgnoreCase(q);
    }
}

// OUTPUT:
// GET /products?q=pen -> [{"id":1,"name":"Pen"}]`],
            ['Paging.',
                r`@GetMapping("/products/page")
Page<Product> page(Pageable pageable) {
    return repo.findAll(pageable);
}

// OUTPUT:
// GET /products/page?page=0&size=2&sort=name
// -> {"content":[...2 items...],"totalElements":5,"totalPages":3}`]],
        [['Testing with @DataJpaTest.',
            r`@DataJpaTest
class ProductRepositoryTest {
    @Autowired ProductRepository repo;

    @Test void findsByPartOfName() {
        Product p = new Product(); p.setName("Blue Pen");
        repo.save(p);
        assertEquals(1, repo.findByNameContainingIgnoreCase("pen").size());
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0 (embedded database, rolled back)`],
            ['Fixing N+1 with an entity graph.',
                r`public interface OrderRepository extends JpaRepository<Order, Long> {
    @EntityGraph(attributePaths = "items")
    List<Order> findByCustomerId(Long customerId);
}

// OUTPUT:
// before: 1 + N select statements
// after : 1 select with a join on items`]]
    ),

    'mvc-mvc-plus-hibernate': x(
        ['<b>Hibernate</b> is the JPA implementation that Spring Boot uses by default; it turns entity objects into SQL and manages their state in a persistence context.',
            '<b>Session</b>: Hibernate works through a <code>Session</code> (JPA: <code>EntityManager</code>); inside a transaction, changes to loaded entities are saved automatically at commit (dirty checking).',
            '<b>With MVC</b>: the controller calls a <code>@Transactional</code> service, which uses a repository or the <code>EntityManager</code>.'],
        ['<b>Entity states</b>: transient (new), managed (tracked), detached (session closed) and removed.',
            '<b>DDL setting</b>: <code>spring.jpa.hibernate.ddl-auto</code> accepts <code>none</code>, <code>validate</code>, <code>update</code>, <code>create</code> and <code>create-drop</code>; use <code>validate</code> or a migration tool in production.',
            '<b>See the SQL</b>: <code>spring.jpa.show-sql=true</code> and <code>logging.level.org.hibernate.SQL=DEBUG</code> help find slow or repeated queries.'],
        ['<b>First-level cache</b>: inside one session the same id returns the same object without a second query.',
            '<b>Flush</b>: Hibernate sends SQL at commit, before a query that needs it, or on <code>flush()</code>, not at each setter.',
            '<b>Fetch plan</b>: associations are lazy by default for collections; <code>@ManyToOne</code> is eager by default, so set it to <code>LAZY</code> when you do not always need it.'],
        [['F', 'What is Hibernate?', 'The ORM that implements JPA and maps Java objects to database tables.'],
            ['F', 'What does ddl-auto=update do?', 'It changes the schema at startup to match entities; fine for demos, risky for production.'],
            ['M', 'What is dirty checking?', 'Hibernate compares managed entities with their loaded snapshot at flush and issues updates for the changed ones.'],
            ['M', 'Why does LazyInitializationException happen?', 'A lazy association is read after the session is closed.'],
            ['S', 'What are the entity states?', 'Transient, managed, detached and removed.'],
            ['S', 'How do you find N+1 queries?', 'Log the SQL or use Hibernate statistics and fix with join fetch, entity graphs or batch size.']],
        [['Service with dirty checking.',
            r`@Service
public class PriceService {
    @PersistenceContext EntityManager em;

    @Transactional
    public void raise(long id, BigDecimal extra) {
        Product p = em.find(Product.class, id);   // managed
        p.setPrice(p.getPrice().add(extra));      // no save() call needed
    }
}

// OUTPUT:
// select ... from product where id=?
// update product set price=? where id=?   (at commit)`],
            ['Useful properties.',
                r`# application.properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG

# OUTPUT:
# the application fails at startup if a table or column is missing
# SQL statements appear formatted in the log`]],
        [['Testing the lazy loading error.',
            r`@Test
void lazyOutsideTransactionFails() {
    Order o = orderRepo.findById(1L).orElseThrow();   // no transaction here
    assertThrows(LazyInitializationException.class,
        () -> o.getItems().size());
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Batch fetching to reduce queries.',
                r`@OneToMany(mappedBy = "order")
@BatchSize(size = 20)
private List<Item> items;

# application.properties
spring.jpa.properties.hibernate.default_batch_fetch_size=20

# OUTPUT:
# 100 orders: 6 queries for items instead of 100`]]
    )
};

export const smvc29Deep: Record<string, Deep> = {
    'mvc-security-filters': dv(
        [`<p>Spring Security is built only from servlet filters.</p><ul><li><b>Registration:</b> Boot registers <code>DelegatingFilterProxy</code> named <code>springSecurityFilterChain</code> with the servlet container.</li><li><b>FilterChainProxy:</b> that bean holds the list of <code>SecurityFilterChain</code> objects and picks the first one whose request matcher matches.</li><li><b>Virtual chain:</b> the selected filters run as one chain, then control returns to the real servlet chain and reaches the <code>DispatcherServlet</code>.</li><li><b>Failure handling:</b> <code>ExceptionTranslationFilter</code> catches <code>AuthenticationException</code> and <code>AccessDeniedException</code> and starts the login or sends 403.</li></ul>`,
            r`// Simplified view of what FilterChainProxy does
List<Filter> filters = chains.stream()
    .filter(c -> c.matches(request))
    .findFirst().orElseThrow().getFilters();
new VirtualFilterChain(request, response, originalChain, filters)
    .doFilter(request, response);

// DEBUG log (varies):
// Securing GET /private
// Invoking SecurityContextHolderFilter (3/8)
// Invoking CsrfFilter (5/8)
// Invoking AuthorizationFilter (8/8)

// OUTPUT:
// the request passes every filter in order, or one of them ends it early`],
        [`<p>Ways to shape the chain:</p><ul><li><b>Several chains:</b> <code>securityMatcher</code> plus <code>@Order</code>; the most specific chain gets the lowest order.</li><li><b>Add filters:</b> <code>addFilterBefore</code>, <code>addFilterAfter</code>, <code>addFilterAt</code>.</li><li><b>Disable parts:</b> <code>csrf</code>, <code>formLogin</code>, <code>httpBasic</code>, <code>logout</code> each take a customizer or <code>disable()</code>.</li><li><b>Sessions:</b> <code>sessionManagement</code> sets stateless or stateful mode.</li></ul>`,
            r`@Bean @Order(1)
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http.securityMatcher("/api/**")
        .csrf(c -> c.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
        .addFilterBefore(new JwtFilter(), UsernamePasswordAuthenticationFilter.class)
        .authorizeHttpRequests(a -> a.anyRequest().authenticated());
    return http.build();
}

@Bean @Order(2)
SecurityFilterChain web(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults());
    return http.build();
}

// OUTPUT:
// /api/** -> JWT chain (stateless)
// other   -> form login chain (session)`],
        [`<p>Typical mistakes:</p><ul><li><b>Wrong order:</b> a chain without a <code>securityMatcher</code> placed first catches every URL; give it the highest order number.</li><li><b>Bean filter registered twice:</b> a filter declared as a <code>@Component</code> is also added to the servlet container and runs twice; extend <code>OncePerRequestFilter</code> or disable the extra registration.</li><li><b>web.ignoring for static files only:</b> using it for APIs removes security headers.</li><li><b>Old API:</b> <code>WebSecurityConfigurerAdapter</code> is removed in Spring Security 6; use the bean style.</li></ul>`,
            r`// Problem: JwtFilter is a @Component, so Boot also registers it as a
// servlet filter and it runs twice per request.
@Bean
FilterRegistrationBean<JwtFilter> jwtRegistration(JwtFilter f) {
    FilterRegistrationBean<JwtFilter> reg = new FilterRegistrationBean<>(f);
    reg.setEnabled(false);       // fix: only the security chain runs it
    return reg;
}

// OUTPUT:
// before fix: "JWT check" logged twice per request
// after fix : logged once`],
        [`<p>Performance and tuning:</p><ul><li><b>Cheap filters:</b> every request pays for each filter, so avoid database calls in custom filters; cache or use a signed token.</li><li><b>Shorter chain:</b> disable features you do not use (form login on a pure API).</li><li><b>Password hashing:</b> BCrypt strength is deliberately slow; do not run it on every request, only at login.</li><li><b>Observe:</b> Boot Actuator and the DEBUG log show time spent per request.</li></ul>`,
            r`http.formLogin(f -> f.disable())
    .httpBasic(b -> b.disable())
    .logout(l -> l.disable())
    .requestCache(rc -> rc.disable());   // fewer filters for a pure API

// OUTPUT:
// filters in chain: 8 -> 5 (varies)`],
        [`<p>Scenario: a shop has a browser site and a mobile API.</p><ul><li>The site uses form login, sessions and CSRF.</li><li>The API uses JWT, no session and no CSRF.</li><li>Two chains separate these rules, so one set of changes cannot break the other.</li><li>A test per chain protects the rules.</li></ul>`,
            r`@Test
void apiRejectsMissingToken() throws Exception {
    mvc.perform(get("/api/orders")).andExpect(status().isUnauthorized());
}
@Test
void siteRedirectsToLogin() throws Exception {
    mvc.perform(get("/account"))
       .andExpect(status().is3xxRedirection())
       .andExpect(redirectedUrlPattern("**/login"));
}

// OUTPUT:
// Tests run: 2, Failures: 0`]
    ),

    'mvc-csrf': dv(
        [`<p>How the protection works (synchronizer token pattern):</p><ul><li><b>Create:</b> <code>CsrfFilter</code> asks the <code>CsrfTokenRepository</code> (session based by default) for a token and stores it as a request attribute.</li><li><b>Send:</b> the view puts it into a hidden field or header.</li><li><b>Check:</b> on unsafe methods the filter compares the submitted token with the stored one; a mismatch calls <code>AccessDeniedHandler</code> and gives 403.</li><li><b>Why it works:</b> an attacker page can make the browser send cookies but cannot read your token.</li></ul>`,
            r`// Simplified logic of CsrfFilter
CsrfToken expected = repository.loadToken(request);
String actual = handler.resolveCsrfTokenValue(request, expected);
if (!isSafeMethod(request) && !expected.getToken().equals(actual)) {
    accessDeniedHandler.handle(request, response,
        new InvalidCsrfTokenException(expected, actual));
    return;                                  // request stops here
}
chain.doFilter(request, response);

// OUTPUT:
// POST without token -> 403, log: Invalid CSRF token found for /transfer`],
        [`<p>Options:</p><ul><li><b>Repositories:</b> <code>HttpSessionCsrfTokenRepository</code> (default), <code>CookieCsrfTokenRepository</code>.</li><li><b>Handlers:</b> <code>XorCsrfTokenRequestAttributeHandler</code> (default, BREACH protection) and <code>CsrfTokenRequestAttributeHandler</code> for simple SPA setups.</li><li><b>Ignoring paths:</b> <code>ignoringRequestMatchers("/webhooks/**")</code> for server-to-server calls with their own signature.</li><li><b>Disable:</b> <code>csrf(c -&gt; c.disable())</code>.</li></ul>`,
            r`http.csrf(c -> c
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
    .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
    .ignoringRequestMatchers("/webhooks/**"));

// JavaScript side (fetch)
// fetch("/transfer", { method: "POST",
//   headers: { "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") } });

// OUTPUT:
// /transfer with header -> 200 ; /webhooks/pay needs no token`],
        [`<p>Common mistakes:</p><ul><li><b>Disabling CSRF to fix a 403:</b> add the token instead.</li><li><b>Form without th:action:</b> a plain <code>action</code> attribute gets no hidden token.</li><li><b>Logout by GET:</b> logout must be POST when CSRF is on.</li><li><b>SPA reads the cookie but the cookie is HttpOnly:</b> use <code>withHttpOnlyFalse()</code> for the token cookie only.</li><li><b>Token in the URL:</b> it leaks through logs and referrers; use a header or body.</li></ul>`,
            r`<!-- wrong: no token is added -->
<form action="/transfer" method="post">...</form>

<!-- right: Thymeleaf adds the hidden _csrf input -->
<form th:action="@{/transfer}" method="post">...</form>

// OUTPUT:
// wrong form -> 403 ; right form -> 200`],
        [`<p>Tuning and cost:</p><ul><li><b>Session tokens</b> need session storage; with many nodes use a shared session store or the cookie repository.</li><li><b>Deferred tokens:</b> Spring Security 6 loads the token only when needed, so pages that never render a form do not create a session.</li><li><b>Cookie attributes:</b> set <code>Secure</code> and <code>SameSite</code> for the session cookie as an extra layer.</li></ul>`,
            r`# application.properties
server.servlet.session.cookie.same-site=lax
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true

# OUTPUT:
# Set-Cookie: JSESSIONID=...; Secure; HttpOnly; SameSite=Lax`],
        [`<p>Scenario: a banking page transfers money with a POST form.</p><ul><li>An attacker site hides a form that posts to <code>/transfer</code>.</li><li>The victim is logged in, so the browser sends the session cookie.</li><li>Without a token the transfer would succeed; with CSRF protection the attacker has no token, so the server answers 403.</li></ul>`,
            r`@Test @WithMockUser
void forgedRequestIsBlocked() throws Exception {
    mvc.perform(post("/transfer").param("to", "attacker").param("amount", "500"))
       .andExpect(status().isForbidden());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),

    'mvc-cors-plus-security': dv(
        [`<p>Order of events for a cross-origin call:</p><ul><li><b>Preflight:</b> for a non-simple request the browser first sends <code>OPTIONS</code> with <code>Origin</code> and <code>Access-Control-Request-Method</code>.</li><li><b>CorsFilter:</b> with <code>http.cors()</code> Spring Security inserts a <code>CorsFilter</code> before authentication; it answers the preflight itself using the <code>CorsConfigurationSource</code>.</li><li><b>Actual request:</b> goes through the normal chain, and the CORS headers are added to the response.</li><li><b>Without http.cors():</b> the preflight reaches <code>AuthorizationFilter</code> with no credentials and fails.</li></ul>`,
            r`// CorsFilter core idea
CorsConfiguration cfg = source.getCorsConfiguration(request);
boolean valid = processor.processRequest(cfg, request, response);
if (!valid || CorsUtils.isPreFlightRequest(request)) {
    return;                          // preflight answered here
}
chain.doFilter(request, response);

// OUTPUT:
// OPTIONS -> 200 with Allow headers, never reaches authorization`],
        [`<p>Options of <code>CorsConfiguration</code>:</p><ul><li><b>allowedOrigins</b> exact origins; <b>allowedOriginPatterns</b> for patterns like <code>https://*.example.com</code>.</li><li><b>allowedMethods</b>, <b>allowedHeaders</b>, <b>exposedHeaders</b>.</li><li><b>allowCredentials</b> for cookies and Authorization.</li><li><b>maxAge</b> to cache preflight.</li><li>MVC level alternatives: <code>@CrossOrigin</code> and <code>WebMvcConfigurer.addCorsMappings</code>.</li></ul>`,
            r`CorsConfiguration c = new CorsConfiguration();
c.setAllowedOriginPatterns(List.of("https://*.example.com"));
c.setAllowedMethods(List.of("GET", "POST"));
c.setExposedHeaders(List.of("Location"));
c.setMaxAge(Duration.ofHours(1));
c.setAllowCredentials(true);

// OUTPUT:
// Access-Control-Max-Age: 3600
// Access-Control-Expose-Headers: Location`],
        [`<p>Common mistakes:</p><ul><li><b>Wildcard with credentials:</b> <code>*</code> plus <code>allowCredentials(true)</code> is rejected at startup or by the browser.</li><li><b>Only @CrossOrigin:</b> Security blocks the preflight first.</li><li><b>Missing Authorization in allowed headers:</b> the preflight fails for token calls.</li><li><b>Duplicate headers:</b> configuring CORS in a gateway and in the app sends the header twice, which browsers reject.</li><li><b>Treating CORS as security:</b> it is only browser policy.</li></ul>`,
            r`// wrong: * with credentials
c.setAllowedOrigins(List.of("*"));
c.setAllowCredentials(true);   // IllegalArgumentException

// right
c.setAllowedOrigins(List.of("https://app.example.com"));
c.setAllowCredentials(true);

// OUTPUT:
// wrong -> "allowedOrigins cannot contain * when allowCredentials is true"`],
        [`<p>Tuning:</p><ul><li>Set <code>maxAge</code> to cut preflight traffic (browsers cap it, often at a few hours).</li><li>Keep the allowed lists short and explicit.</li><li>Use one place (a gateway or the app) for CORS, not both.</li></ul>`,
            r`c.setMaxAge(Duration.ofMinutes(30));   // browser reuses the preflight answer

// OUTPUT:
// first POST: OPTIONS + POST ; next calls within 30 min: POST only`],
        [`<p>Scenario: a React app on port 3000 calls a Spring API on port 8080 with a bearer token.</p><ul><li>The browser sends a preflight because of the <code>Authorization</code> header.</li><li>The security chain has <code>http.cors()</code> and the origin list contains <code>http://localhost:3000</code>.</li><li>The call succeeds; a call from another origin is blocked by the browser.</li></ul>`,
            r`// browser console (varies)
// fetch("http://localhost:8080/api/items", {
//   headers: { Authorization: "Bearer abc" } })

// OUTPUT:
// OPTIONS 200 (Access-Control-Allow-Headers: Authorization)
// GET 200 [{"id":1}]`]
    ),

    'mvc-role-based-authorization': dv(
        [`<p>How a role check runs:</p><ul><li><b>Login:</b> <code>UserDetails.getAuthorities()</code> returns <code>GrantedAuthority</code> objects such as <code>ROLE_ADMIN</code>; they are stored in the <code>Authentication</code>.</li><li><b>Request:</b> <code>AuthorizationFilter</code> asks the <code>AuthorizationManager</code> built from your matchers whether this request is allowed.</li><li><b>Decision:</b> <code>hasRole("ADMIN")</code> becomes an <code>AuthorityAuthorizationManager</code> that checks for <code>ROLE_ADMIN</code>.</li><li><b>Denied:</b> an anonymous user starts the login, a known user gets 403 from <code>AccessDeniedHandler</code>.</li></ul>`,
            r`// What hasRole("ADMIN") means
AuthorizationManager<RequestAuthorizationContext> m =
    AuthorityAuthorizationManager.hasRole("ADMIN");
AuthorizationDecision d = m.check(() -> authentication, null);
System.out.println(d.isGranted());

// OUTPUT:
// true for ROLE_ADMIN, false for ROLE_USER`],
        [`<p>Variants:</p><ul><li><b>hasRole / hasAnyRole</b> add the prefix; <b>hasAuthority</b> does not.</li><li><b>access(...)</b> with a custom <code>AuthorizationManager</code> for rules like "owner or admin".</li><li><b>HTTP method rules:</b> <code>requestMatchers(HttpMethod.DELETE, "/items/**")</code>.</li><li><b>Prefix change:</b> a <code>GrantedAuthorityDefaults</code> bean changes or removes <code>ROLE_</code>.</li></ul>`,
            r`http.authorizeHttpRequests(a -> a
    .requestMatchers(HttpMethod.GET, "/items/**").hasAuthority("item:read")
    .requestMatchers(HttpMethod.DELETE, "/items/**").hasRole("ADMIN")
    .requestMatchers("/me/**").access((auth, ctx) ->
        new AuthorizationDecision(auth.get().isAuthenticated()))
    .anyRequest().denyAll());

// OUTPUT:
// DELETE /items/1 as USER -> 403 ; unknown URL -> 403 (deny by default)`],
        [`<p>Common mistakes:</p><ul><li><b>Storing ROLE_ADMIN and calling hasRole("ROLE_ADMIN"):</b> works in Spring Security 6 only by accident of prefix handling; store plain <code>ADMIN</code> in <code>roles()</code> and use <code>hasRole("ADMIN")</code>.</li><li><b>anyRequest().permitAll() first:</b> everything is public.</li><li><b>Hiding a button only in the UI:</b> the server must enforce the rule.</li><li><b>No default deny:</b> end with <code>anyRequest().authenticated()</code> or <code>denyAll()</code>.</li></ul>`,
            r`// wrong: broad rule first
.requestMatchers("/**").permitAll()
.requestMatchers("/admin/**").hasRole("ADMIN")   // never reached

// right: specific first
.requestMatchers("/admin/**").hasRole("ADMIN")
.anyRequest().authenticated()

// OUTPUT:
// wrong -> /admin/users open to everybody ; right -> 403 for non-admins`],
        [`<p>Tuning:</p><ul><li>Authorities are loaded once at login and kept in the session, so a role change applies at the next login unless you reload them.</li><li>For JWT, put roles in a claim and map them with a converter, so no database call is needed per request.</li><li>Keep the number of URL rules small; use method security for detail.</li></ul>`,
            r`JwtAuthenticationConverter conv = new JwtAuthenticationConverter();
JwtGrantedAuthoritiesConverter g = new JwtGrantedAuthoritiesConverter();
g.setAuthoritiesClaimName("roles");
g.setAuthorityPrefix("ROLE_");
conv.setJwtGrantedAuthoritiesConverter(g);

// OUTPUT:
// token claim roles=["ADMIN"] -> authority ROLE_ADMIN`],
        [`<p>Scenario: an HR app with three groups.</p><ul><li>EMPLOYEE sees own data, MANAGER sees the team, ADMIN manages everything.</li><li>A role hierarchy ADMIN &gt; MANAGER &gt; EMPLOYEE keeps rules short.</li><li>Tests cover each URL for each role, so a refactor cannot open a hole.</li></ul>`,
            r`@ParameterizedTest
@CsvSource({"EMPLOYEE,403", "MANAGER,200", "ADMIN,200"})
void reportsByRole(String role, int status) throws Exception {
    mvc.perform(get("/reports").with(user("u").roles(role)))
       .andExpect(status().is(status));
}

// OUTPUT:
// Tests run: 3, Failures: 0`]
    ),

    'mvc-method-level-security': dv(
        [`<p>Method security uses Spring AOP.</p><ul><li><b>Proxy:</b> <code>@EnableMethodSecurity</code> registers an advisor; beans with secured methods get a proxy (CGLIB for classes).</li><li><b>Interceptor:</b> <code>AuthorizationManagerBeforeMethodInterceptor</code> runs before the call and <code>AuthorizationManagerAfterMethodInterceptor</code> after it.</li><li><b>Expression:</b> the SpEL is evaluated with <code>authentication</code>, method arguments (<code>#name</code>) and <code>returnObject</code>.</li><li><b>Context:</b> it reads the <code>Authentication</code> from the <code>SecurityContextHolder</code> of the current thread.</li></ul>`,
            r`// Conceptual proxy behavior
Object invoke(MethodInvocation inv) throws Throwable {
    if (!preAuthorizeManager.check(authSupplier, inv).isGranted()) {
        throw new AccessDeniedException("Access Denied");
    }
    Object result = inv.proceed();
    // @PostAuthorize would be checked here with returnObject
    return result;
}

// OUTPUT:
// denied call never enters the method body`],
        [`<p>Annotations and switches:</p><ul><li><code>@PreAuthorize</code>, <code>@PostAuthorize</code>, <code>@PreFilter</code>, <code>@PostFilter</code> are on by default.</li><li><code>@EnableMethodSecurity(securedEnabled = true)</code> turns on <code>@Secured</code>; <code>jsr250Enabled = true</code> turns on <code>@RolesAllowed</code>.</li><li>Class-level annotations apply to all methods; a method annotation overrides them.</li><li>Meta-annotations let you create <code>@IsAdmin</code> to avoid repeating strings.</li></ul>`,
            r`@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasRole('ADMIN')")
public @interface IsAdmin { }

@Service
class ReportService {
    @IsAdmin void purge() { }

    @PostFilter("filterObject.owner == authentication.name")
    List<Doc> all() { return docs; }
}

// OUTPUT:
// all() as ann returns only the documents owned by ann`],
        [`<p>Common mistakes:</p><ul><li><b>Self-invocation:</b> calling a secured method from another method of the same class skips the proxy.</li><li><b>Private or final methods:</b> they cannot be proxied.</li><li><b>Forgetting @EnableMethodSecurity:</b> annotations are silently ignored.</li><li><b>Old annotation:</b> <code>@EnableGlobalMethodSecurity</code> is deprecated; use <code>@EnableMethodSecurity</code>.</li><li><b>PostFilter on large lists:</b> loads everything then filters; filter in the query instead.</li></ul>`,
            r`@Service
class Svc {
    @PreAuthorize("hasRole('ADMIN')")
    public void secured() { }

    public void caller() {
        secured();            // WRONG: this-call bypasses the proxy
    }
}
// fix: move secured() to another bean and inject it

// OUTPUT:
// caller() as USER runs secured() without any check (bug)`],
        [`<p>Tuning:</p><ul><li>SpEL is parsed once and cached; keep expressions simple.</li><li>Calling a bean from SpEL that hits the database on every call is costly; cache the result per request or load needed data once.</li><li>Prefer a query condition (<code>where owner = :user</code>) over <code>@PostFilter</code> for large data sets.</li></ul>`,
            r`@Query("select d from Doc d where d.owner = :#{authentication.name}")
List<Doc> mine();   // needs SecurityEvaluationContextExtension bean

// OUTPUT:
// one query returns only the user's documents`],
        [`<p>Scenario: a document service.</p><ul><li>Any user may list their documents; only the owner or an admin may delete one.</li><li>The URL rule only requires login; the service rule checks the owner.</li><li>The same rule protects REST, scheduled jobs and message handlers that call the service.</li></ul>`,
            r`@PreAuthorize("hasRole('ADMIN') or @docs.isOwner(#id, authentication.name)")
public void delete(long id) { repo.deleteById(id); }

// OUTPUT:
// bob deletes ann's doc -> AccessDeniedException ; ann deletes own -> ok`]
    ),

    'mvc-security-context': dv(
        [`<p>Lifecycle of the context in one web request:</p><ul><li><b>Start:</b> <code>SecurityContextHolderFilter</code> asks the <code>SecurityContextRepository</code> to load the context (from the session) and sets it in the holder.</li><li><b>Authentication:</b> a login filter or token filter puts an <code>Authentication</code> into it.</li><li><b>Use:</b> filters, controllers, services and method security read it.</li><li><b>End:</b> the holder is cleared in a <code>finally</code> block, so the pooled thread is clean.</li><li><b>Strategy:</b> <code>SecurityContextHolderStrategy</code> chooses the storage: <code>MODE_THREADLOCAL</code> (default), inheritable or global.</li></ul>`,
            r`// Simplified SecurityContextHolderFilter
try {
    Supplier<SecurityContext> ctx = repository.loadDeferredContext(request);
    holderStrategy.setDeferredContext(ctx);
    chain.doFilter(request, response);
} finally {
    holderStrategy.clearContext();     // always cleaned up
}

// OUTPUT:
// after the request the thread has no Authentication`],
        [`<p>Options:</p><ul><li><b>Strategies:</b> <code>MODE_THREADLOCAL</code>, <code>MODE_INHERITABLETHREADLOCAL</code>, <code>MODE_GLOBAL</code> (only for desktop-like apps).</li><li><b>Repositories:</b> <code>HttpSessionSecurityContextRepository</code>, <code>RequestAttributeSecurityContextRepository</code> (stateless), <code>DelegatingSecurityContextRepository</code>.</li><li><b>Wrappers:</b> <code>DelegatingSecurityContextRunnable</code>, <code>Callable</code> and the executor wrappers.</li><li><b>Bean injection:</b> a <code>SecurityContextHolderStrategy</code> bean can replace static calls.</li></ul>`,
            r`@Bean
SecurityContextHolderStrategy holderStrategy() {
    return SecurityContextHolder.getContextHolderStrategy();
}

@Service
class CurrentUser {
    private final SecurityContextHolderStrategy holder;
    CurrentUser(SecurityContextHolderStrategy holder) { this.holder = holder; }
    String name() { return holder.getContext().getAuthentication().getName(); }
}

// OUTPUT:
// name() -> "ann" (easy to unit test with a fake strategy)`],
        [`<p>Common mistakes:</p><ul><li><b>Static access in business code:</b> hard to test; inject the user or the strategy.</li><li><b>Threads:</b> an <code>@Async</code> method or a new <code>Thread</code> sees no user.</li><li><b>Not saving the context in Security 6:</b> after manual authentication the next request is anonymous.</li><li><b>Reading when anonymous:</b> casting the principal to your user class fails with <code>ClassCastException</code>.</li><li><b>Leaking:</b> never keep the <code>Authentication</code> in a static field.</li></ul>`,
            r`@Async
public void report() {
    Authentication a = SecurityContextHolder.getContext().getAuthentication();
    System.out.println(a);          // null: the async thread has no context
}
// fix: configure DelegatingSecurityContextAsyncTaskExecutor for the async executor

// OUTPUT:
// null (before fix) ; UsernamePasswordAuthenticationToken [ann] (after fix)`],
        [`<p>Tuning:</p><ul><li>The default <code>ThreadLocal</code> strategy is cheap.</li><li>Deferred context loading in Security 6 avoids touching the session until the user is actually read.</li><li>With virtual threads, <code>ThreadLocal</code> still works per virtual thread, but do not copy large objects into it.</li><li>Stateless APIs use a request-scoped repository, so no session memory is used.</li></ul>`,
            r`http.securityContext(c -> c
    .securityContextRepository(new RequestAttributeSecurityContextRepository()));

// OUTPUT:
// no HttpSession is created for API calls`],
        [`<p>Scenario: audit logging.</p><ul><li>An <code>AuditorAware</code> bean reads the user from the security context so every saved entity gets <code>createdBy</code>.</li><li>Background jobs set a system user explicitly in the context before work starts and clear it after.</li></ul>`,
            r`@Bean
AuditorAware<String> auditor() {
    return () -> Optional.ofNullable(
            SecurityContextHolder.getContext().getAuthentication())
        .filter(Authentication::isAuthenticated)
        .map(Authentication::getName);
}

// OUTPUT:
// saved row: created_by = ann`]
    ),

    'mvc-principal-security': dv(
        [`<p>Where the Principal comes from:</p><ul><li><b>Authentication:</b> after login the provider builds an <code>Authentication</code> whose principal is the <code>UserDetails</code> from your <code>UserDetailsService</code>.</li><li><b>Request wrapper:</b> <code>SecurityContextHolderAwareRequestFilter</code> wraps the request so <code>getUserPrincipal()</code> returns that authentication.</li><li><b>Argument resolvers:</b> MVC uses <code>ServletRequestMethodArgumentResolver</code> for <code>Principal</code>; Security adds <code>AuthenticationPrincipalArgumentResolver</code> for <code>@AuthenticationPrincipal</code>.</li><li><b>Types:</b> the principal object depends on the login type (UserDetails for forms, a Jwt for resource servers, an OidcUser for OAuth2 login).</li></ul>`,
            r`@GetMapping("/jwt-user")
String jwtUser(@AuthenticationPrincipal Jwt jwt) {
    return jwt.getSubject() + " " + jwt.getClaimAsString("email");
}

// OUTPUT:
// GET /jwt-user with bearer token -> 42 ann@example.com`],
        [`<p>Variants:</p><ul><li><code>Principal p</code> gives only <code>getName()</code>.</li><li><code>Authentication a</code> adds authorities and details.</li><li><code>@AuthenticationPrincipal MyUser u</code> gives your class; add <code>errorOnInvalidType = true</code> to fail on a wrong type.</li><li><code>@CurrentSecurityContext(expression = "authentication.name")</code> reads any part of the context.</li><li>A custom meta-annotation <code>@CurrentUser</code> hides the expression.</li></ul>`,
            r`@Target({ElementType.PARAMETER, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@AuthenticationPrincipal
public @interface CurrentUser { }

@GetMapping("/profile")
Profile profile(@CurrentUser AppUser user) {
    return service.profile(user.getId());
}

// OUTPUT:
// GET /profile -> profile of the logged-in user`],
        [`<p>Common mistakes:</p><ul><li><b>Wrong type:</b> <code>@AuthenticationPrincipal AppUser</code> receives <code>null</code> when the principal is a different class (or the string <code>anonymousUser</code>).</li><li><b>Trusting a user id from the request:</b> take the id from the principal, not from a parameter, or any user can read others (IDOR).</li><li><b>Using the principal in an unprotected URL:</b> it is null; protect the URL.</li><li><b>Password in the principal:</b> Spring clears credentials after login; do not keep them in your own class.</li></ul>`,
            r`// WRONG: client controls the id
@GetMapping("/orders/{userId}")
List<Order> bad(@PathVariable long userId) { return svc.byUser(userId); }

// RIGHT: id comes from the authenticated principal
@GetMapping("/orders")
List<Order> good(@AuthenticationPrincipal AppUser u) {
    return svc.byUser(u.getId());
}

// OUTPUT:
// bad: /orders/2 as user 1 returns user 2 data ; good: always own data`],
        [`<p>Tuning:</p><ul><li>Keep the principal small (id, name, roles); it is serialized into the session.</li><li>Make it <code>Serializable</code> if sessions are replicated.</li><li>Load extra profile data lazily from a cache, not at every login.</li></ul>`,
            r`public class AppUser extends User implements Serializable {
    private static final long serialVersionUID = 1L;
    private final long id;
    // keep only small fields
}

// OUTPUT:
// session size stays small ; replication works across nodes`],
        [`<p>Scenario: a user can only see their own invoices.</p><ul><li>The controller takes the id from the principal and passes it to the service.</li><li>The repository query includes the owner id, so even a bug in the URL cannot expose other data.</li></ul>`,
            r`@Query("select i from Invoice i where i.id = :id and i.ownerId = :owner")
Optional<Invoice> findOwned(Long id, Long owner);

// OUTPUT:
// other user's invoice id -> Optional.empty -> 404`]
    ),

    'mvc-mvc-plus-jdbc': dv(
        [`<p>What JdbcTemplate does for one query:</p><ul><li>Gets a connection from the <code>DataSource</code> (the transaction connection if one is active, else from the pool).</li><li>Creates a <code>PreparedStatement</code>, binds the arguments, executes it.</li><li>Calls your <code>RowMapper</code> for each row of the <code>ResultSet</code>.</li><li>Closes resources and translates <code>SQLException</code> into the unchecked <code>DataAccessException</code> hierarchy.</li><li>Returns the connection to the pool (or keeps it until the transaction ends).</li></ul>`,
            r`// Roughly what query() hides
try (Connection c = DataSourceUtils.getConnection(ds);
     PreparedStatement ps = c.prepareStatement("select id, name from users")) {
    try (ResultSet rs = ps.executeQuery()) {
        List<User> out = new ArrayList<>();
        int i = 0;
        while (rs.next()) out.add(mapper.mapRow(rs, i++));
        return out;
    }
} catch (SQLException e) {
    throw translator.translate("query", sql, e);
}

// OUTPUT:
// List<User> returned ; no resource leaks`],
        [`<p>Variants:</p><ul><li><b>JdbcTemplate:</b> positional <code>?</code> parameters.</li><li><b>NamedParameterJdbcTemplate:</b> <code>:name</code> parameters.</li><li><b>SimpleJdbcInsert:</b> insert with generated keys and no SQL.</li><li><b>KeyHolder:</b> read generated ids.</li><li><b>JdbcClient (Spring 6.1):</b> fluent API over both styles.</li><li><b>BeanPropertyRowMapper:</b> maps columns to bean properties by name.</li></ul>`,
            r`KeyHolder keys = new GeneratedKeyHolder();
jdbc.update(con -> {
    PreparedStatement ps = con.prepareStatement(
        "insert into users(name) values (?)", Statement.RETURN_GENERATED_KEYS);
    ps.setString(1, "Cy");
    return ps;
}, keys);
long id = keys.getKey().longValue();

NamedParameterJdbcTemplate named = new NamedParameterJdbcTemplate(ds);
User u = named.queryForObject("select * from users where id = :id",
    Map.of("id", id), new BeanPropertyRowMapper<>(User.class));

// OUTPUT:
// id = 3 (varies) ; u = User(id=3, name=Cy)`],
        [`<p>Common mistakes:</p><ul><li><b>String concatenation in SQL:</b> SQL injection; use placeholders.</li><li><b>queryForObject for optional rows:</b> throws on empty; use <code>query</code> and take the first element.</li><li><b>Missing @Transactional:</b> two updates that must succeed together run in separate transactions.</li><li><b>Column name mismatch:</b> <code>BeanPropertyRowMapper</code> needs matching names (snake_case is converted).</li><li><b>Catching SQLException:</b> JdbcTemplate throws <code>DataAccessException</code>.</li></ul>`,
            r`// WRONG: injection with name = "x' or '1'='1"
jdbc.query("select * from users where name = '" + name + "'", mapper);

// RIGHT
jdbc.query("select * from users where name = ?", mapper, name);

// OUTPUT:
// wrong returns every user ; right returns none for that text`],
        [`<p>Tuning:</p><ul><li><b>Pool:</b> size Hikari <code>maximum-pool-size</code> to the database capacity, not to the number of threads.</li><li><b>Batch:</b> <code>batchUpdate</code> for many rows.</li><li><b>Fetch size:</b> set <code>jdbc.setFetchSize</code> for large reads.</li><li><b>Indexes:</b> add them for columns in where clauses and check the plan with <code>explain</code>.</li><li><b>Select only needed columns.</b></li></ul>`,
            r`jdbc.batchUpdate("insert into users(name) values (?)",
    List.of("a", "b", "c"), 100,
    (ps, n) -> ps.setString(1, n));

# application.properties
spring.datasource.hikari.maximum-pool-size=10

# OUTPUT:
# one round trip per 100 rows instead of one per row`],
        [`<p>Scenario: a reporting page with a hand-tuned SQL join.</p><ul><li>JDBC gives full control over the SQL and avoids ORM overhead.</li><li>The service is transactional and read-only; a <code>@JdbcTest</code> checks the SQL and a <code>@WebMvcTest</code> checks the JSON.</li></ul>`,
            r`@Transactional(readOnly = true)
public List<SalesRow> report(LocalDate from) {
    return jdbc.query("""
        select p.name, sum(o.qty) as qty
        from orders o join product p on p.id = o.product_id
        where o.day >= ? group by p.name order by qty desc
        """, (rs, i) -> new SalesRow(rs.getString(1), rs.getInt(2)), from);
}

// OUTPUT:
// [SalesRow[name=Pen, qty=120], SalesRow[name=Book, qty=80]]`]
    ),

    'mvc-mvc-plus-jpa': dv(
        [`<p>How a Spring Data JPA call works:</p><ul><li><b>Startup:</b> Spring creates a proxy for your repository interface; <code>SimpleJpaRepository</code> implements the standard methods.</li><li><b>Derived query:</b> the method name is parsed into a JPQL criteria query once at startup.</li><li><b>Call:</b> the proxy uses the shared <code>EntityManager</code>; the repository methods are transactional by default (reads are read-only).</li><li><b>Persistence context:</b> loaded entities are tracked until the transaction ends.</li><li><b>MVC link:</b> <code>@Transactional</code> belongs on the service, so one request can group several repository calls.</li></ul>`,
            r`@Service
public class OrderService {
    private final OrderRepository orders;
    private final StockRepository stock;
    // constructor omitted

    @Transactional
    public Order place(Order o) {
        stock.decrease(o.getProductId(), o.getQty());   // same transaction
        return orders.save(o);                           // rollback on exception
    }
}

// OUTPUT:
// if save fails, the stock decrease is rolled back`],
        [`<p>Query options:</p><ul><li><b>Derived:</b> <code>findByStatusAndTotalGreaterThan</code>.</li><li><b>@Query:</b> JPQL or native SQL with named parameters.</li><li><b>Projections:</b> interface or record projections load only some columns.</li><li><b>Specifications / Querydsl:</b> dynamic filters.</li><li><b>@Modifying:</b> bulk update and delete queries.</li><li><b>Pageable and Sort:</b> built-in paging.</li></ul>`,
            r`public interface ProductRepository extends JpaRepository<Product, Long> {
    record NameOnly(Long id, String name) { }

    List<NameOnly> findByActiveTrue();

    @Query("select p from Product p where p.price between :lo and :hi")
    Page<Product> inRange(BigDecimal lo, BigDecimal hi, Pageable page);

    @Modifying
    @Query("update Product p set p.active = false where p.stock = 0")
    int deactivateEmpty();
}

// OUTPUT:
// findByActiveTrue() -> [NameOnly[id=1, name=Pen]] (select id, name only)`],
        [`<p>Common mistakes:</p><ul><li><b>Returning entities with lazy collections from controllers:</b> JSON serialization triggers lazy loading errors or loops; use DTOs.</li><li><b>N+1 selects:</b> fix with <code>join fetch</code> or <code>@EntityGraph</code>.</li><li><b>Fetching a whole table:</b> always page large results.</li><li><b>@Transactional on the controller or on private methods:</b> put it on public service methods.</li><li><b>equals/hashCode on generated id:</b> breaks sets before the entity is saved.</li></ul>`,
            r`// WRONG: entity leaks to JSON, lazy list triggers LazyInitializationException
@GetMapping("/orders/{id}")
Order bad(@PathVariable Long id) { return repo.findById(id).orElseThrow(); }

// RIGHT: map to a DTO inside the service transaction
record OrderDto(Long id, int items) { }
@Transactional(readOnly = true)
public OrderDto get(Long id) {
    Order o = repo.findById(id).orElseThrow();
    return new OrderDto(o.getId(), o.getItems().size());
}

// OUTPUT:
// bad -> 500 LazyInitializationException ; good -> {"id":1,"items":3}`],
        [`<p>Tuning:</p><ul><li><b>Open in view off:</b> <code>spring.jpa.open-in-view=false</code> releases the connection after the service.</li><li><b>Batch inserts:</b> <code>hibernate.jdbc.batch_size</code>; note that <code>IDENTITY</code> ids disable insert batching, so use a sequence for bulk work.</li><li><b>Read-only:</b> <code>@Transactional(readOnly = true)</code> skips dirty checking.</li><li><b>Indexes</b> on query columns; check generated SQL.</li></ul>`,
            r`# application.properties
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true

# OUTPUT:
# 1000 inserts -> about 20 batches instead of 1000 statements`],
        [`<p>Scenario: a product catalog with search and paging.</p><ul><li>Controller accepts <code>q</code> and <code>Pageable</code>.</li><li>Service calls the repository and maps to DTOs.</li><li>A <code>@DataJpaTest</code> checks the query and a <code>@WebMvcTest</code> checks the JSON shape.</li></ul>`,
            r`@GetMapping("/catalog")
Page<ProductDto> catalog(@RequestParam(defaultValue = "") String q,
        @PageableDefault(size = 10) Pageable pageable) {
    return service.search(q, pageable);
}

// OUTPUT:
// GET /catalog?q=pen&page=0 -> {"content":[{"id":1,"name":"Pen"}],"totalPages":1}`]
    ),

    'mvc-mvc-plus-hibernate': dv(
        [`<p>Inside Hibernate:</p><ul><li><b>SessionFactory:</b> built once at startup from the entity metadata and the <code>DataSource</code>.</li><li><b>Session:</b> one per transaction (or per request with open-in-view); holds the first-level cache and the entity snapshots.</li><li><b>Action queue:</b> inserts, updates and deletes are queued and sent at flush.</li><li><b>Dirty checking:</b> at flush each managed entity is compared with its snapshot.</li><li><b>Proxies:</b> lazy associations are bytecode proxies that load data on first access.</li><li><b>Spring link:</b> <code>JpaTransactionManager</code> binds the <code>EntityManager</code> to the thread for the duration of <code>@Transactional</code>.</li></ul>`,
            r`@Transactional
public void demo(EntityManager em) {
    Product a = em.find(Product.class, 1L);   // select
    Product b = em.find(Product.class, 1L);   // no select: first-level cache
    System.out.println(a == b);
    a.setName("New");                          // update at flush
    em.flush();                                // SQL sent here
}

// OUTPUT:
// select p1_0.id,p1_0.name from product p1_0 where p1_0.id=?
// true
// update product set name=? where id=?`],
        [`<p>Mapping options worth knowing:</p><ul><li><b>Id strategies:</b> <code>IDENTITY</code>, <code>SEQUENCE</code>, <code>UUID</code>.</li><li><b>Relations:</b> <code>@OneToMany(mappedBy)</code>, <code>@ManyToOne(fetch = LAZY)</code>, <code>@ManyToMany</code> with a join table.</li><li><b>Cascade and orphanRemoval:</b> propagate save and delete to children.</li><li><b>Enums and dates:</b> <code>@Enumerated(EnumType.STRING)</code>.</li><li><b>Optimistic locking:</b> <code>@Version</code>.</li><li><b>Embeddables:</b> value objects with <code>@Embeddable</code>.</li></ul>`,
            r`@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @Version private long version;

    @Enumerated(EnumType.STRING)
    private Status status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL,
               orphanRemoval = true)
    private List<Item> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;
}

// OUTPUT:
// concurrent update of the same row -> ObjectOptimisticLockingFailureException`],
        [`<p>Common mistakes:</p><ul><li><b>Eager <code>@ManyToOne</code> everywhere:</b> loads extra tables; set <code>LAZY</code>.</li><li><b>ddl-auto=update in production:</b> unreviewed schema changes; use Flyway or Liquibase.</li><li><b>Missing owning side update:</b> for bidirectional relations set both sides with a helper method.</li><li><b>Detached entity save:</b> merging a stale object overwrites newer data; use <code>@Version</code>.</li><li><b>Large persistence context:</b> loading thousands of entities in one transaction; clear the session or stream in chunks.</li></ul>`,
            r`// helper keeps both sides in sync
public void addItem(Item item) {
    items.add(item);
    item.setOrder(this);       // owning side that writes the foreign key
}

// OUTPUT:
// without item.setOrder(this): item row saved with order_id = null`],
        [`<p>Tuning:</p><ul><li>Turn on <code>hibernate.generate_statistics</code> in a test to count queries.</li><li>Use <code>join fetch</code> or <code>@EntityGraph</code> for known read paths.</li><li><code>default_batch_fetch_size</code> reduces N+1 cheaply.</li><li>Use projections for read-only lists.</li><li>Second-level cache only for rarely changing reference data.</li><li>For bulk work use <code>StatelessSession</code> or JDBC batching, and clear the session every few hundred rows.</li></ul>`,
            r`int n = 0;
for (Product p : products) {
    em.persist(p);
    if (++n % 50 == 0) {
        em.flush();
        em.clear();          // keep the persistence context small
    }
}

// OUTPUT:
// memory stays flat while inserting 100000 rows (varies)`],
        [`<p>Scenario: an order screen is slow.</p><ul><li>The log shows 101 selects for 100 orders (N+1).</li><li>The team adds an entity graph for the items and a query-count assertion in a test.</li><li>The page now uses 1 select; the test fails if the count grows again.</li></ul>`,
            r`@Test
void listOrdersUsesOneQuery() {
    Statistics stats = sessionFactory.getStatistics();
    stats.clear();
    service.listWithItems();
    assertEquals(1, stats.getPrepareStatementCount());
}

// OUTPUT:
// Tests run: 1, Failures: 0 (statistics enabled in test properties)`]
    )
};
