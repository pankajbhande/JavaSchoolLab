// Spring extras, batch smvc28 (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const smvc28Extras: Record<string, Extra> = {
    'mvc-options-request': x(
        ['<b>OPTIONS</b> is an HTTP method that asks a server which methods and headers a URL supports; it changes nothing and has no body.',
            '<b>Preflight</b>: before a cross-origin call that is not simple (for example JSON <code>POST</code> or <code>PUT</code>), the browser sends an automatic <code>OPTIONS</code> request first.',
            '<b>Answer</b>: the server replies with <code>Access-Control-Allow-Origin</code>, <code>Access-Control-Allow-Methods</code> and <code>Access-Control-Allow-Headers</code>, and the browser then sends the real request.'],
        ['<b>Request headers</b>: the preflight carries <code>Origin</code>, <code>Access-Control-Request-Method</code> and <code>Access-Control-Request-Headers</code>, and never carries cookies or the Authorization header.',
            '<b>Spring handling</b>: <code>DispatcherServlet</code> answers a preflight through the <code>CorsProcessor</code> without calling your controller method when CORS is configured.',
            '<b>Caching</b>: <code>Access-Control-Max-Age</code> tells the browser how long to remember the answer so it skips repeat preflights.'],
        ['<b>Security order</b>: with Spring Security, enable <code>http.cors()</code> so the <code>CorsFilter</code> runs before authentication; otherwise the preflight gets 401 or 403.',
            '<b>Explicit OPTIONS</b>: <code>@RequestMapping(method = OPTIONS)</code> is rarely needed; the default handling also adds an <code>Allow</code> header for real OPTIONS calls.',
            '<b>Debugging</b>: a preflight failure shows in the browser console as a CORS error, but the real cause is visible in the Network tab on the OPTIONS row.'],
        [['F', 'What is an OPTIONS request?', 'It asks the server which HTTP methods and headers are allowed for a URL. It is read-only and has no body.'],
            ['F', 'Who sends the preflight request?', 'The browser sends it automatically before a non-simple cross-origin request. Your JavaScript code does not send it.'],
            ['M', 'Which requests trigger a preflight?', 'Methods other than GET, HEAD and POST, or custom headers, or content types such as application/json.'],
            ['M', 'Why does the preflight not include the Authorization header?', 'The browser sends the preflight without credentials. The server must allow the header and answer 200 without needing a login.'],
            ['S', 'Why does my API return 401 for the preflight in Spring Security?', 'The security filter chain rejected the OPTIONS call before CORS was applied. Call http.cors() or register a CorsConfigurationSource so CorsFilter runs first.'],
            ['S', 'How do you reduce preflight traffic?', 'Set Access-Control-Max-Age (maxAge in CorsConfiguration) so browsers cache the result.']],
        [['Test a preflight with MockMvc.',
            r`mockMvc.perform(options("/api/users")
        .header("Origin", "http://localhost:3000")
        .header("Access-Control-Request-Method", "POST")
        .header("Access-Control-Request-Headers", "content-type"))
    .andExpect(status().isOk())
    .andExpect(header().string("Access-Control-Allow-Origin",
        "http://localhost:3000"))
    .andExpect(header().exists("Access-Control-Allow-Methods"));

// OUTPUT:
// HTTP/1.1 200
// Access-Control-Allow-Origin: http://localhost:3000
// Access-Control-Allow-Methods: POST
// Access-Control-Allow-Headers: content-type
// Access-Control-Max-Age: 1800`],
            ['Allow origin on a controller.',
                r`@RestController
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
class UserController {
    @PostMapping("/api/users")
    User create(@RequestBody User u) { return u; }
}

// OUTPUT:
// The browser sends OPTIONS /api/users first, gets 200 with the CORS headers,
// then sends the real POST /api/users.`]],
        [['Global CORS configuration.',
            r`@Configuration
class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }
}

// OUTPUT:
// Every /api/** preflight is answered by Spring MVC with status 200 and CORS headers.`],
            ['Read the Allow header from a real OPTIONS call.',
                r`mockMvc.perform(options("/api/users/1"))
    .andExpect(status().isOk())
    .andDo(print());

// OUTPUT:
// MockHttpServletResponse:
//    Status = 200
//    Headers = [Allow:"GET,HEAD,DELETE,OPTIONS"]`]]
    ),

    'mvc-cors-security': x(
        ['<b>CORS</b> (Cross-Origin Resource Sharing) is a browser rule that blocks a page from reading responses of another origin unless that server allows it.',
            '<b>Origin</b> means scheme, host and port together, so <code>http://localhost:3000</code> and <code>http://localhost:8080</code> are different origins.',
            '<b>Not a server firewall</b>: CORS protects the user browser only; tools such as curl or Postman ignore it, so it never replaces authentication.'],
        ['<b>Whitelist</b> exact origins with <code>allowedOrigins</code>; avoid <code>*</code> for APIs that use cookies or sessions.',
            '<b>Credentials</b>: <code>allowCredentials(true)</code> lets the browser send cookies, and then the origin must be explicit, not <code>*</code>.',
            '<b>Spring Security</b>: add <code>http.cors(Customizer.withDefaults())</code> with a <code>CorsConfigurationSource</code> bean so CORS runs inside the security chain.'],
        ['<b>Filter order</b>: <code>CorsFilter</code> must run before the authentication filters, or preflight calls fail with 401.',
            '<b>Patterns</b>: use <code>allowedOriginPatterns</code> for wildcard subdomains when credentials are on.',
            '<b>CSRF</b> is a separate protection: CORS does not stop a forged form post, so keep CSRF tokens for cookie-based sessions.'],
        [['F', 'What problem does CORS solve?', 'It stops a malicious page from reading data from another site using the visitor browser session.'],
            ['F', 'Is CORS enforced by the server?', 'No. The server only sends headers; the browser enforces the rule.'],
            ['M', 'Why can you not combine allowedOrigins("*") with allowCredentials(true)?', 'The browser rejects it, and Spring throws an error, because credentials with any origin would be unsafe.'],
            ['M', 'How do you configure CORS with Spring Security?', 'Define a CorsConfigurationSource bean and call http.cors(Customizer.withDefaults()).'],
            ['S', 'Does CORS protect an API from CSRF?', 'No. CORS blocks reading responses, but a simple form post is still sent, so CSRF protection or SameSite cookies are needed.'],
            ['S', 'Which attacks come from a too-open CORS policy?', 'Reflecting any Origin with credentials allowed lets any website call the API as the logged-in user and read the data.']],
        [['CORS in the Spring Security chain.',
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
    c.setAllowedOrigins(List.of("https://app.example.com"));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    c.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/api/**", c);
    return s;
}

// OUTPUT:
// OPTIONS /api/x with Origin https://app.example.com -> 200 (no login needed)
// GET /api/x without login -> 401`],
            ['Rejected origin.',
                r`mockMvc.perform(get("/api/x")
        .header("Origin", "https://evil.example.com"))
    .andExpect(status().isForbidden());

// OUTPUT:
// Status = 403
// Body   = Invalid CORS request`]],
        [['Wrong: wildcard with credentials.',
            r`CorsConfiguration c = new CorsConfiguration();
c.setAllowedOrigins(List.of("*"));
c.setAllowCredentials(true);
c.checkOrigin("https://a.com");   // validation rejects this setup

// OUTPUT:
// IllegalArgumentException: When allowCredentials is true, allowedOrigins cannot
// contain the special value "*" ... use allowedOriginPatterns instead`],
            ['Right: pattern for subdomains.',
                r`CorsConfiguration c = new CorsConfiguration();
c.setAllowedOriginPatterns(List.of("https://*.example.com"));
c.setAllowCredentials(true);
System.out.println(c.checkOrigin("https://shop.example.com"));

// OUTPUT:
// https://shop.example.com`]]
    ),

    'mvc-spring-security-integration': x(
        ['<b>Spring Security</b> is a framework that protects a Spring application with a chain of servlet filters for authentication, authorization and attack protection.',
            '<b>Integration</b>: add <code>spring-boot-starter-security</code> and every endpoint is secured at once, with a generated password printed at startup for the user <code>user</code>.',
            '<b>Configure</b> by declaring a <code>SecurityFilterChain</code> bean with <code>HttpSecurity</code>, which replaces the old <code>WebSecurityConfigurerAdapter</code>.'],
        ['<b>Filter chain</b>: <code>DelegatingFilterProxy</code> hands each request to <code>FilterChainProxy</code>, which picks a <code>SecurityFilterChain</code> and runs its filters in order.',
            '<b>SecurityContext</b>: after login the <code>Authentication</code> object is stored in <code>SecurityContextHolder</code> and is available in controllers with <code>@AuthenticationPrincipal</code>.',
            '<b>Defaults</b>: form login, HTTP Basic, CSRF protection, session fixation protection and security headers are all enabled out of the box.'],
        ['<b>Method security</b>: <code>@EnableMethodSecurity</code> turns on <code>@PreAuthorize</code> checks on service methods.',
            '<b>Multiple chains</b>: use <code>securityMatcher</code> and <code>@Order</code> to give <code>/api/**</code> a stateless chain and the web pages a session chain.',
            '<b>Testing</b>: <code>spring-security-test</code> gives <code>@WithMockUser</code> and <code>SecurityMockMvcRequestPostProcessors</code> for MockMvc tests.'],
        [['F', 'What happens when you add the security starter?', 'All endpoints require login, with a default user and a random password logged at startup.'],
            ['F', 'Where do you configure security rules?', 'In a SecurityFilterChain bean that receives HttpSecurity.'],
            ['M', 'What is the role of FilterChainProxy?', 'It is the single servlet filter that selects a matching SecurityFilterChain and runs its security filters.'],
            ['M', 'How do you read the current user in a controller?', 'Use @AuthenticationPrincipal, a Principal parameter, or SecurityContextHolder.getContext().getAuthentication().'],
            ['S', 'Why is WebSecurityConfigurerAdapter gone?', 'Spring Security 6 removed it in favour of component-based configuration with SecurityFilterChain beans, which is easier to compose and test.'],
            ['S', 'How do you test secured endpoints?', 'Use @WebMvcTest with @WithMockUser or the user() post processor, and csrf() for state-changing calls.']],
        [['Minimal secured application.',
            r`@Configuration
@EnableWebSecurity
class SecurityConfig {
    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(a -> a
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated())
            .formLogin(Customizer.withDefaults());
        return http.build();
    }
}

// OUTPUT:
// GET /public/hi -> 200
// GET /orders    -> 302 redirect to /login`],
            ['In-memory users.',
                r`@Bean
UserDetailsService users(PasswordEncoder enc) {
    return new InMemoryUserDetailsManager(
        User.withUsername("asha").password(enc.encode("pw1")).roles("USER").build());
}

@Bean
PasswordEncoder encoder() { return new BCryptPasswordEncoder(); }

// OUTPUT:
// Login as asha / pw1 succeeds; the stored password is a BCrypt hash like $2a$10$...`]],
        [['Test with MockMvc.',
            r`@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class)
class OrderControllerTest {
    @Autowired MockMvc mvc;

    @Test void anonymousIsRedirected() throws Exception {
        mvc.perform(get("/orders")).andExpect(status().is3xxRedirection());
    }

    @Test @WithMockUser(roles = "USER")
    void userSeesOrders() throws Exception {
        mvc.perform(get("/orders")).andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0`],
            ['Read the principal.',
                r`@GetMapping("/me")
String me(@AuthenticationPrincipal UserDetails user) {
    return user.getUsername() + " " + user.getAuthorities();
}

// OUTPUT:
// GET /me (as asha) -> asha [ROLE_USER]`]]
    ),

    'mvc-authentication': x(
        ['<b>Authentication</b> answers the question "who are you?": the system checks credentials such as a password, token or certificate and proves the caller identity.',
            '<b>Result</b>: on success Spring Security builds an <code>Authentication</code> object holding the principal, the authorities and an authenticated flag.',
            '<b>Different from authorization</b>, which decides what an already identified user may do.'],
        ['<b>AuthenticationManager</b> receives an <code>Authentication</code> request and returns a fully filled one; the usual implementation is <code>ProviderManager</code>.',
            '<b>AuthenticationProvider</b>: <code>DaoAuthenticationProvider</code> loads the user from a <code>UserDetailsService</code> and compares the password with a <code>PasswordEncoder</code>.',
            '<b>Failure</b> throws an <code>AuthenticationException</code> such as <code>BadCredentialsException</code>, which becomes a 401 or a redirect to the login page.'],
        ['<b>Password storage</b>: always hash with <code>BCryptPasswordEncoder</code> or <code>DelegatingPasswordEncoder</code>; never store plain text.',
            '<b>Custom provider</b>: implement <code>AuthenticationProvider</code> for API keys, LDAP or an external identity service.',
            '<b>Stateless tokens</b>: a JWT filter validates the token on each request and fills <code>SecurityContextHolder</code> without a session.'],
        [['F', 'What is authentication?', 'Verifying who the caller is by checking credentials.'],
            ['F', 'Which interface loads user data by username?', 'UserDetailsService with its loadUserByUsername method.'],
            ['M', 'What does AuthenticationManager.authenticate do?', 'It asks its providers to verify the credentials and returns a populated Authentication or throws an AuthenticationException.'],
            ['M', 'How are passwords compared?', 'A PasswordEncoder matches the raw password against the stored hash; hashes are never decoded.'],
            ['S', 'What is the difference between BadCredentialsException and UsernameNotFoundException?', 'The DaoAuthenticationProvider hides user-not-found behind BadCredentialsException by default, so attackers cannot discover valid usernames.'],
            ['S', 'Where is the authenticated user stored between requests?', 'In SecurityContextHolder for the current thread, and persisted in the HTTP session by the SecurityContextRepository when sessions are used.']],
        [['Authenticate programmatically.',
            r`@Service
class LoginService {
    private final AuthenticationManager manager;
    LoginService(AuthenticationManager manager) { this.manager = manager; }

    String login(String user, String pass) {
        Authentication auth = manager.authenticate(
            new UsernamePasswordAuthenticationToken(user, pass));
        SecurityContextHolder.getContext().setAuthentication(auth);
        return auth.getName() + " " + auth.getAuthorities();
    }
}

// OUTPUT:
// login("asha", "pw1")   -> asha [ROLE_USER]
// login("asha", "wrong") -> BadCredentialsException: Bad credentials`],
            ['Database users.',
                r`@Service
class DbUserDetailsService implements UserDetailsService {
    private final UserRepository repo;
    DbUserDetailsService(UserRepository repo) { this.repo = repo; }

    public UserDetails loadUserByUsername(String name) {
        AppUser u = repo.findByName(name)
            .orElseThrow(() -> new UsernameNotFoundException(name));
        return User.withUsername(u.getName()).password(u.getHash())
                   .roles(u.getRole()).build();
    }
}

// OUTPUT:
// DaoAuthenticationProvider calls loadUserByUsername("asha") then matches the hash.`]],
        [['Expose the AuthenticationManager bean.',
            r`@Bean
AuthenticationManager authManager(AuthenticationConfiguration cfg)
        throws Exception {
    return cfg.getAuthenticationManager();
}

// OUTPUT:
// The manager is built from the registered UserDetailsService and PasswordEncoder beans.`],
            ['Test authentication failure.',
                r`mvc.perform(post("/login").with(csrf())
        .param("username", "asha").param("password", "bad"))
    .andExpect(redirectedUrl("/login?error"));

// OUTPUT:
// Status = 302
// Redirected URL = /login?error`]]
    ),

    'mvc-authorization': x(
        ['<b>Authorization</b> decides what an authenticated user is allowed to do, for example who may open <code>/admin</code> or delete an order.',
            '<b>Authorities and roles</b>: a role is an authority with the prefix <code>ROLE_</code>, so <code>hasRole("ADMIN")</code> checks for <code>ROLE_ADMIN</code>.',
            '<b>Two levels</b>: URL rules in <code>authorizeHttpRequests</code> and method rules with <code>@PreAuthorize</code>.'],
        ['<b>URL rules</b> are checked in order, so put specific matchers first and <code>anyRequest()</code> last.',
            '<b>Method security</b>: add <code>@EnableMethodSecurity</code>, then use <code>@PreAuthorize("hasRole(&quot;ADMIN&quot;)")</code> on service methods.',
            '<b>Denied</b>: an anonymous user gets 401 (or login redirect) and an authenticated user without permission gets 403 through <code>AccessDeniedHandler</code>.'],
        ['<b>Ownership checks</b>: use SpEL such as <code>@PreAuthorize("#id == authentication.principal.id")</code> to protect a single record.',
            '<b>AuthorizationManager</b> is the Spring Security 6 interface behind these rules; you can write a custom one for complex logic.',
            '<b>Defense in depth</b>: secure the URL and the service method, because other callers may reach the method directly.'],
        [['F', 'Authentication or authorization: which checks permission?', 'Authorization. Authentication only proves identity.'],
            ['F', 'What is the difference between 401 and 403?', '401 means not authenticated; 403 means authenticated but not allowed.'],
            ['M', 'What does hasRole("ADMIN") check?', 'That the user has the authority ROLE_ADMIN. The ROLE_ prefix is added automatically.'],
            ['M', 'Why must anyRequest() be last?', 'Rules are evaluated top to bottom and the first match wins, so a broad rule first would hide later specific ones.'],
            ['S', 'How do you allow a user to edit only their own data?', 'Use @PreAuthorize with a SpEL expression that compares the resource owner to authentication.principal, or a custom AuthorizationManager.'],
            ['S', 'Why can @PreAuthorize on a private or self-invoked method fail?', 'Method security works through a Spring proxy, so calls inside the same class bypass the proxy and the check does not run.']],
        [['URL based rules.',
            r`http.authorizeHttpRequests(a -> a
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
    .requestMatchers("/api/**").hasAnyRole("USER", "ADMIN")
    .anyRequest().denyAll());

// OUTPUT:
// anonymous GET /api/products/1 -> 200
// USER      GET /admin/panel    -> 403
// ADMIN     GET /admin/panel    -> 200`],
            ['Method security.',
                r`@Configuration
@EnableMethodSecurity
class MethodSecurityConfig { }

@Service
class OrderService {
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(long id) { /* remove */ }

    @PreAuthorize("#owner == authentication.name")
    public List<Order> mine(String owner) { return List.of(); }
}

// OUTPUT:
// USER calls delete(5) -> AccessDeniedException: Access Denied`]],
        [['Test roles.',
            r`@Test @WithMockUser(roles = "USER")
void userCannotOpenAdmin() throws Exception {
    mvc.perform(get("/admin/panel")).andExpect(status().isForbidden());
}

@Test @WithMockUser(roles = "ADMIN")
void adminCanOpenAdmin() throws Exception {
    mvc.perform(get("/admin/panel")).andExpect(status().isOk());
}

// OUTPUT:
// Tests run: 2, Failures: 0`],
            ['Custom access denied response.',
                r`http.exceptionHandling(e -> e.accessDeniedHandler((req, res, ex) -> {
    res.setStatus(403);
    res.setContentType("application/json");
    res.getWriter().write("{\"error\":\"forbidden\"}");
}));

// OUTPUT:
// HTTP/1.1 403
// {"error":"forbidden"}`]]
    ),

    'mvc-login': x(
        ['<b>Login</b> is the step where a user sends credentials so the application can authenticate them and start a session or issue a token.',
            '<b>Page and processing</b>: the login page shows the form, and a security filter handles the <code>POST /login</code> request; your controller does not process the password.',
            '<b>Outcome</b>: success redirects to the saved or default page, and failure redirects to <code>/login?error</code>.'],
        ['<b>Custom page</b>: call <code>formLogin(f -&gt; f.loginPage("/login").permitAll())</code> and serve your own view from a controller.',
            '<b>Parameter names</b> default to <code>username</code> and <code>password</code>; change them with <code>usernameParameter</code> and <code>passwordParameter</code>.',
            '<b>CSRF token</b>: the login form must include the hidden CSRF field, which Thymeleaf adds automatically for <code>th:action</code>.'],
        ['<b>Handlers</b>: <code>successHandler</code> and <code>failureHandler</code> return JSON for single-page apps instead of redirecting.',
            '<b>Brute force</b>: add rate limiting or account lockout; keep the error message generic.',
            '<b>Session fixation</b>: Spring changes the session id after login by default; keep that protection on.'],
        [['F', 'Who processes the login POST request?', 'UsernamePasswordAuthenticationFilter in the security filter chain, not a controller.'],
            ['F', 'What is the default login URL?', 'GET /login shows the generated page and POST /login submits the credentials.'],
            ['M', 'How do you use your own login page?', 'Set loginPage("/login") and add a controller method that returns your login view, with permitAll on the path.'],
            ['M', 'Why does my login form return 403?', 'The CSRF token is missing from the form, or the login page is not reachable for anonymous users.'],
            ['S', 'How do you make login return JSON?', 'Register an AuthenticationSuccessHandler and AuthenticationFailureHandler that write the response body.'],
            ['S', 'What is session fixation and how does Spring prevent it?', 'An attacker plants a known session id before login. Spring creates a new session id after authentication to stop that.']],
        [['Custom login page and controller.',
            r`http.authorizeHttpRequests(a -> a
        .requestMatchers("/login", "/css/**").permitAll()
        .anyRequest().authenticated())
    .formLogin(f -> f.loginPage("/login")
        .defaultSuccessUrl("/home", true)
        .failureUrl("/login?error"));

@Controller
class LoginController {
    @GetMapping("/login")
    String login() { return "login"; }
}

// OUTPUT:
// GET /home (anonymous)     -> 302 /login
// POST /login (valid)       -> 302 /home
// POST /login (wrong pass)  -> 302 /login?error`],
            ['Thymeleaf login form.',
                r`<form th:action="@{/login}" method="post">
    <input type="text" name="username" />
    <input type="password" name="password" />
    <button type="submit">Sign in</button>
</form>

<!-- OUTPUT -->
// The rendered form contains a hidden _csrf input added by Thymeleaf.`]],
        [['JSON login for a single-page app.',
            r`http.formLogin(f -> f
    .successHandler((req, res, auth) -> {
        res.setContentType("application/json");
        res.getWriter().write("{\"user\":\"" + auth.getName() + "\"}");
    })
    .failureHandler((req, res, ex) -> res.sendError(401, "Bad credentials")));

// OUTPUT:
// POST /login valid   -> 200 {"user":"asha"}
// POST /login invalid -> 401`],
            ['Test a login.',
                r`mvc.perform(formLogin("/login").user("asha").password("pw1"))
    .andExpect(authenticated().withUsername("asha"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-logout': x(
        ['<b>Logout</b> ends the authenticated session: Spring invalidates the HTTP session, clears the <code>SecurityContext</code> and can delete cookies.',
            '<b>Default</b>: <code>POST /logout</code> with a CSRF token, then a redirect to <code>/login?logout</code>.',
            '<b>Filter</b>: <code>LogoutFilter</code> runs a list of <code>LogoutHandler</code> objects and then a <code>LogoutSuccessHandler</code>.'],
        ['<b>Configure</b> with <code>http.logout(l -&gt; l.logoutUrl("/logout").logoutSuccessUrl("/login?bye"))</code>.',
            '<b>Cookies</b>: <code>deleteCookies("JSESSIONID")</code> removes the session cookie in the browser.',
            '<b>Why POST</b>: with CSRF enabled, a GET logout link is not allowed because a third-party site could log users out.'],
        ['<b>Stateless apps</b> have no session to destroy; JWT logout needs a token blacklist or short token lifetime.',
            '<b>Success handler</b> can return 200 JSON for a front-end app: <code>HttpStatusReturningLogoutSuccessHandler</code>.',
            '<b>Single sign-out</b> with OAuth or SAML needs extra configuration to end the identity provider session too.'],
        [['F', 'What does logout do in Spring Security?', 'It invalidates the session, clears the security context and redirects the user.'],
            ['F', 'What is the default logout URL?', 'POST /logout.'],
            ['M', 'Why is GET /logout rejected?', 'CSRF protection requires POST so that a malicious link cannot log the user out.'],
            ['M', 'How do you also remove the session cookie?', 'Add deleteCookies("JSESSIONID") to the logout configuration.'],
            ['S', 'How do you log out in a JWT based API?', 'There is no server session, so the client discards the token; for real revocation keep a deny list or use short-lived tokens with refresh tokens.'],
            ['S', 'What does LogoutHandler differ from LogoutSuccessHandler?', 'Handlers perform cleanup (session, cookies, remember-me); the success handler decides the response such as a redirect or status code.']],
        [['Logout configuration.',
            r`http.logout(l -> l
    .logoutUrl("/logout")
    .logoutSuccessUrl("/login?logout")
    .invalidateHttpSession(true)
    .deleteCookies("JSESSIONID"));

// OUTPUT:
// POST /logout (with CSRF) -> 302 /login?logout
// Set-Cookie: JSESSIONID=; Max-Age=0`],
            ['Logout button.',
                r`<form th:action="@{/logout}" method="post">
    <button type="submit">Logout</button>
</form>

<!-- OUTPUT -->
// Clicking the button posts to /logout with the hidden CSRF token.`]],
        [['REST logout returning 200.',
            r`http.logout(l -> l
    .logoutUrl("/api/logout")
    .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler()));

// OUTPUT:
// POST /api/logout -> 200 (no redirect)`],
            ['Test logout.',
                r`mvc.perform(post("/logout").with(csrf()).with(user("asha")))
    .andExpect(status().is3xxRedirection())
    .andExpect(redirectedUrl("/login?logout"));

// OUTPUT:
// Tests run: 1, Failures: 0`]]
    ),

    'mvc-form-login': x(
        ['<b>Form login</b> is authentication through an HTML form: the user types a username and password and the server answers with a session cookie.',
            '<b>Enable</b> it with <code>http.formLogin(Customizer.withDefaults())</code>; Spring then generates a login page at <code>/login</code>.',
            '<b>Flow</b>: an anonymous request is redirected to the login page, the credentials are posted, and the user returns to the page first requested.'],
        ['<b>Components</b>: <code>UsernamePasswordAuthenticationFilter</code> reads the form and calls the <code>AuthenticationManager</code>.',
            '<b>Saved request</b>: <code>RequestCache</code> remembers the original URL so <code>SavedRequestAwareAuthenticationSuccessHandler</code> can send the user back.',
            '<b>Options</b>: <code>loginPage</code>, <code>loginProcessingUrl</code>, <code>defaultSuccessUrl</code>, <code>failureUrl</code> and <code>usernameParameter</code>.'],
        ['<b>Best for</b> server-rendered web apps with sessions; APIs and mobile apps usually prefer tokens.',
            '<b>Remember me</b>: <code>rememberMe</code> adds a long-lived cookie; use the persistent token approach for better safety.',
            '<b>HTTPS</b> is required, because the form sends the password in the request body.'],
        [['F', 'What is form login?', 'Authentication using an HTML form with username and password fields, followed by a session.'],
            ['F', 'Which filter handles the form?', 'UsernamePasswordAuthenticationFilter.'],
            ['M', 'What is loginProcessingUrl?', 'The URL where the form is posted and handled by the filter; it can differ from the page URL.'],
            ['M', 'How does the user return to the first page requested?', 'The RequestCache stores the original request and the success handler redirects to it.'],
            ['S', 'When would you not choose form login?', 'For stateless REST APIs, mobile clients or service-to-service calls, where Basic, token or OAuth authentication fits better.'],
            ['S', 'How do you secure the remember-me cookie?', 'Use a persistent token store or a strong key, send it only over HTTPS and set an expiry.']],
        [['Full form login setup.',
            r`http.authorizeHttpRequests(a -> a
        .requestMatchers("/login", "/register").permitAll()
        .anyRequest().authenticated())
    .formLogin(f -> f
        .loginPage("/login")
        .loginProcessingUrl("/do-login")
        .usernameParameter("email")
        .defaultSuccessUrl("/dashboard"))
    .rememberMe(rm -> rm.key("change-me").tokenValiditySeconds(86400));

// OUTPUT:
// POST /do-login email=a@x.com password=pw1 -> 302 /dashboard
// Set-Cookie: JSESSIONID=...; remember-me=...`],
            ['Form for the custom parameter.',
                r`<form th:action="@{/do-login}" method="post">
    <input name="email" type="email" />
    <input name="password" type="password" />
    <label><input type="checkbox" name="remember-me" /> Remember me</label>
    <button>Login</button>
</form>

<!-- OUTPUT -->
// Posting with remember-me checked also sets the remember-me cookie.`]],
        [['Test form login.',
            r`@Test
void loginSucceeds() throws Exception {
    mvc.perform(formLogin("/do-login").userParameter("email")
            .user("a@x.com").password("pw1"))
        .andExpect(status().is3xxRedirection())
        .andExpect(redirectedUrl("/dashboard"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Anonymous redirect.',
                r`mvc.perform(get("/dashboard"))
    .andExpect(status().is3xxRedirection())
    .andExpect(redirectedUrlPattern("**/login"));

// OUTPUT:
// Status = 302, Redirected URL = http://localhost/login`]]
    ),

    'mvc-basic-authentication': x(
        ['<b>HTTP Basic</b> authentication sends the credentials in every request in the header <code>Authorization: Basic base64(user:password)</code>.',
            '<b>Challenge</b>: when the header is missing the server answers 401 with <code>WWW-Authenticate: Basic</code>, and the browser shows a login dialog.',
            '<b>Enable</b> it with <code>http.httpBasic(Customizer.withDefaults())</code>; it is simple and good for tools, scripts and internal services.'],
        ['<b>Base64 is not encryption</b>: anyone who sees the header can decode it, so Basic must only run over HTTPS.',
            '<b>Filter</b>: <code>BasicAuthenticationFilter</code> reads the header and calls the <code>AuthenticationManager</code> on every request.',
            '<b>Stateless</b>: combine with <code>SessionCreationPolicy.STATELESS</code> so no session is created for API clients.'],
        ['<b>Cost</b>: the password is checked on every call, so a slow BCrypt hash adds latency; cache authentication or use tokens for high traffic.',
            '<b>Entry point</b>: set <code>authenticationEntryPoint</code> to return a JSON 401 instead of the browser dialog.',
            '<b>Logout</b> is not really possible, because the browser keeps sending the cached credentials.'],
        [['F', 'How are credentials sent in Basic authentication?', 'In the Authorization header as Basic followed by the Base64 text of username:password.'],
            ['F', 'Is Base64 secure?', 'No. It is only an encoding, so HTTPS is mandatory.'],
            ['M', 'What does the server return when credentials are missing?', '401 Unauthorized with a WWW-Authenticate: Basic realm header.'],
            ['M', 'How do you make Basic stateless in Spring?', 'Use sessionManagement with SessionCreationPolicy.STATELESS.'],
            ['S', 'What are the drawbacks of Basic for a public API?', 'Credentials travel with every request, there is no expiry or scope, and logout or revocation is hard; tokens are better.'],
            ['S', 'How do you test a Basic protected endpoint?', 'Use httpBasic("user", "pass") from SecurityMockMvcRequestPostProcessors or @WithMockUser.']],
        [['Stateless Basic API.',
            r`http.csrf(c -> c.disable())
    .authorizeHttpRequests(a -> a.anyRequest().authenticated())
    .httpBasic(Customizer.withDefaults())
    .sessionManagement(s -> s
        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

// OUTPUT:
// curl -u asha:pw1 http://localhost:8080/api/orders -> 200
// curl http://localhost:8080/api/orders             -> 401
// WWW-Authenticate: Basic realm="Realm"`],
            ['Build the header by hand.',
                r`String raw = "asha:pw1";
String header = "Basic " + Base64.getEncoder().encodeToString(raw.getBytes());
System.out.println(header);

// OUTPUT:
// Basic YXNoYTpwdzE=`]],
        [['Test with httpBasic.',
            r`mvc.perform(get("/api/orders").with(httpBasic("asha", "pw1")))
    .andExpect(status().isOk());
mvc.perform(get("/api/orders").with(httpBasic("asha", "bad")))
    .andExpect(status().isUnauthorized());

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['JSON 401 entry point.',
                r`http.httpBasic(b -> b.authenticationEntryPoint((req, res, ex) -> {
    res.setStatus(401);
    res.setContentType("application/json");
    res.getWriter().write("{\"error\":\"unauthorized\"}");
}));

// OUTPUT:
// HTTP/1.1 401
// {"error":"unauthorized"}`]]
    ),

    'mvc-session-authentication': x(
        ['<b>Session authentication</b> keeps the logged-in user on the server: after login the <code>SecurityContext</code> is stored in the <code>HttpSession</code> and the browser sends the <code>JSESSIONID</code> cookie.',
            '<b>Flow</b>: login creates a session, each later request carries the cookie, and <code>SecurityContextHolderFilter</code> restores the user from the session.',
            '<b>Stateful</b>: the server holds memory per user, unlike token approaches where the client carries the proof.'],
        ['<b>Cookie flags</b>: set <code>HttpOnly</code>, <code>Secure</code> and <code>SameSite</code> (<code>server.servlet.session.cookie.*</code>) to protect the cookie.',
            '<b>Timeout</b>: <code>server.servlet.session.timeout=30m</code> expires idle sessions.',
            '<b>Fixation protection</b>: Spring issues a new session id after login (<code>changeSessionId</code>) by default.'],
        ['<b>Concurrency</b>: <code>maximumSessions(1)</code> limits one user to a number of sessions and can block or expire the older one.',
            '<b>Scaling</b>: with several servers use sticky sessions or Spring Session with Redis or JDBC so any node can read the session.',
            '<b>CSRF</b> protection is needed because the browser sends the cookie automatically.'],
        [['F', 'How does the server remember a logged-in user?', 'It stores the SecurityContext in the HttpSession and gives the browser a JSESSIONID cookie.'],
            ['F', 'Where do you set the session timeout?', 'In application properties with server.servlet.session.timeout.'],
            ['M', 'What is session fixation protection?', 'After login Spring changes the session id so an id planted earlier by an attacker becomes useless.'],
            ['M', 'How do you limit a user to one login at a time?', 'Use sessionManagement with maximumSessions(1), optionally with maxSessionsPreventsLogin(true).'],
            ['S', 'Why use Spring Session?', 'It moves session data to Redis or a database so sessions survive restarts and are shared by all instances.'],
            ['S', 'Session or JWT: how do you choose?', 'Sessions suit server-rendered apps and allow instant logout; JWT suits stateless APIs and multiple services but is harder to revoke.']],
        [['Session management settings.',
            r`http.sessionManagement(s -> s
    .sessionFixation(f -> f.changeSessionId())
    .maximumSessions(1)
    .maxSessionsPreventsLogin(false)
    .expiredUrl("/login?expired"));

// OUTPUT:
// A second login by the same user expires the first session.
// The first browser is redirected to /login?expired on its next request.`],
            ['Session cookie properties.',
                r`server.servlet.session.timeout=30m
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.same-site=lax

# OUTPUT:
# Set-Cookie: JSESSIONID=...; Path=/; Secure; HttpOnly; SameSite=Lax`]],
        [['Inspect the session in a test.',
            r`MvcResult res = mvc.perform(formLogin().user("asha").password("pw1"))
    .andExpect(authenticated()).andReturn();
MockHttpSession session = (MockHttpSession) res.getRequest().getSession();
mvc.perform(get("/orders").session(session)).andExpect(status().isOk());

// OUTPUT:
// Tests run: 1, Failures: 0`],
            ['Count active sessions.',
                r`@Bean
SessionRegistry sessionRegistry() { return new SessionRegistryImpl(); }

long online(SessionRegistry reg) {
    return reg.getAllPrincipals().stream()
        .filter(p -> !reg.getAllSessions(p, false).isEmpty()).count();
}

// OUTPUT:
// online(registry) -> 3 (varies)`]]
    )
};

export const smvc28Deep: Record<string, Deep> = {
    'mvc-options-request': dv(
        [`<p>A preflight is handled before your controller is chosen.</p><ul><li><b>Detection:</b> <code>CorsUtils.isPreFlightRequest</code> checks for method OPTIONS, an <code>Origin</code> header and <code>Access-Control-Request-Method</code>.</li><li><b>Handler mapping:</b> <code>AbstractHandlerMapping</code> returns a special preflight handler when CORS configuration matches the path.</li><li><b>Processing:</b> <code>DefaultCorsProcessor</code> validates origin, method and headers and writes the response headers.</li><li><b>Result:</b> status 200 with <code>Access-Control-Allow-*</code> headers, or 403 with the text Invalid CORS request.</li></ul>`,
            r`// Simplified view of what the CorsProcessor decides
boolean preflight = CorsUtils.isPreFlightRequest(request);
CorsConfiguration config = source.getCorsConfiguration(request);
boolean ok = new DefaultCorsProcessor().processRequest(config, request, response);
// ok == false -> response already has 403, the controller never runs

// OUTPUT:
// preflight=true, allowed origin -> 200 and CORS headers
// preflight=true, other origin   -> 403 Invalid CORS request`],
        [`<p>Ways to configure what answers a preflight:</p><ul><li><b>@CrossOrigin</b> on a class or method.</li><li><b>WebMvcConfigurer.addCorsMappings</b> for global rules.</li><li><b>CorsFilter</b> bean for servlet-level control.</li><li><b>CorsConfigurationSource</b> bean for Spring Security.</li><li><b>Properties:</b> <code>exposedHeaders</code>, <code>allowedHeaders</code>, <code>maxAge</code>, <code>allowCredentials</code>.</li></ul>`,
            r`@Bean
FilterRegistrationBean<CorsFilter> cors() {
    CorsConfiguration c = new CorsConfiguration();
    c.addAllowedOrigin("http://localhost:3000");
    c.addAllowedMethod("*");
    c.addAllowedHeader("*");
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    FilterRegistrationBean<CorsFilter> bean =
        new FilterRegistrationBean<>(new CorsFilter(s));
    bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
    return bean;
}

// OUTPUT:
// The filter answers every preflight before any other filter or the servlet.`],
        [`<p>Common mistakes:</p><ul><li><b>Security blocks OPTIONS:</b> add <code>http.cors()</code> instead of permitting all OPTIONS blindly.</li><li><b>Missing header:</b> a custom header such as <code>X-Token</code> not listed in allowed headers fails the preflight.</li><li><b>Redirects:</b> a preflight that gets 301 or 302 fails; the server must answer directly.</li><li><b>Wildcard and credentials:</b> not allowed together.</li><li><b>Wrong layer:</b> a gateway or proxy may add its own CORS headers and create duplicates.</li></ul>`,
            r`// Wrong: security chain without cors, preflight is rejected
http.authorizeHttpRequests(a -> a.anyRequest().authenticated());

// Right: CorsFilter runs first and answers the preflight
http.cors(Customizer.withDefaults())
    .authorizeHttpRequests(a -> a.anyRequest().authenticated());

// OUTPUT:
// Wrong: OPTIONS /api/x -> 401 (browser shows: blocked by CORS policy)
// Right: OPTIONS /api/x -> 200`],
        [`<p>Preflight costs one extra round trip per call.</p><ul><li><b>maxAge:</b> browsers cap the cache (often 2 hours in Chrome), so a value like 3600 helps.</li><li><b>Same origin:</b> serve the front end and API from one origin or a reverse proxy to avoid preflight entirely.</li><li><b>Simple requests:</b> GET with standard headers needs no preflight.</li><li><b>Fewer headers:</b> avoid custom headers when a query parameter is enough.</li></ul>`,
            r`registry.addMapping("/api/**")
        .allowedOrigins("https://app.example.com")
        .allowedMethods("GET", "POST", "PUT", "DELETE")
        .maxAge(7200);

// OUTPUT:
// Access-Control-Max-Age: 7200
// Second POST within 2 hours: no OPTIONS row in the Network tab`],
        [`<p>Scenario: a React app on port 3000 calls a Spring API on port 8080 with a JSON POST and a bearer token. The browser sends OPTIONS first. The team enabled CORS in Spring Security and the preflight now returns 200; the real call then needs the token.</p><ul><li>Allow the <code>Authorization</code> and <code>Content-Type</code> headers.</li><li>Keep the origin list per environment in properties.</li><li>Test the preflight in a MockMvc test so a security change cannot break it unnoticed.</li></ul>`,
            r`@ConfigurationProperties(prefix = "app.cors")
record CorsProps(List<String> origins) { }

@Bean
CorsConfigurationSource source(CorsProps p) {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(p.origins());
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/api/**", c);
    return s;
}

// OUTPUT:
// application-prod.properties: app.cors.origins=https://app.example.com
// OPTIONS -> 200, POST with Bearer token -> 201`]
    ),

    'mvc-cors-security': dv(
        [`<p>The same-origin policy is enforced by the browser; CORS relaxes it with response headers.</p><ul><li><b>Simple request:</b> the browser sends it and then checks <code>Access-Control-Allow-Origin</code> before giving the response to JavaScript.</li><li><b>Preflight:</b> non-simple requests are first checked with OPTIONS.</li><li><b>Spring:</b> <code>CorsFilter</code> or the MVC handler mapping applies <code>CorsConfiguration</code> through <code>DefaultCorsProcessor</code>.</li><li><b>Vary header:</b> Spring adds <code>Vary: Origin</code> so caches do not mix answers for different origins.</li></ul>`,
            r`// Request from https://app.example.com
// GET /api/data HTTP/1.1
// Origin: https://app.example.com

// Response
// HTTP/1.1 200
// Access-Control-Allow-Origin: https://app.example.com
// Access-Control-Allow-Credentials: true
// Vary: Origin

// OUTPUT:
// The browser lets the page script read the body because the origin matches.`],
        [`<p>Configuration options of <code>CorsConfiguration</code>:</p><ul><li><b>allowedOrigins</b> and <b>allowedOriginPatterns</b>.</li><li><b>allowedMethods</b> and <b>allowedHeaders</b>.</li><li><b>exposedHeaders:</b> headers that scripts may read, such as <code>Location</code>.</li><li><b>allowCredentials:</b> cookies and Authorization.</li><li><b>maxAge:</b> preflight cache time in seconds.</li></ul>`,
            r`CorsConfiguration c = new CorsConfiguration();
c.setAllowedOrigins(List.of("https://app.example.com"));
c.setAllowedMethods(List.of("GET", "POST"));
c.setAllowedHeaders(List.of("Content-Type"));
c.setExposedHeaders(List.of("Location"));
c.setAllowCredentials(true);
c.setMaxAge(3600L);

// OUTPUT:
// Scripts on https://app.example.com can read the Location header of responses.`],
        [`<p>Security mistakes:</p><ul><li><b>Reflecting Origin:</b> copying any request origin into the header with credentials gives every site access.</li><li><b>Trusting null origin:</b> sandboxed pages send <code>Origin: null</code>; do not allow it.</li><li><b>Regex errors:</b> a pattern like <code>example.com</code> may also match <code>evilexample.com</code>.</li><li><b>Thinking CORS is authentication:</b> a direct call without a browser ignores it.</li><li><b>Missing CSRF:</b> cookie sessions still need CSRF protection.</li></ul>`,
            r`// Dangerous: echoing the origin back
String origin = request.getHeader("Origin");
response.setHeader("Access-Control-Allow-Origin", origin);
response.setHeader("Access-Control-Allow-Credentials", "true");

// Safer: compare with a fixed list
Set<String> allowed = Set.of("https://app.example.com");
if (allowed.contains(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
}

// OUTPUT:
// Dangerous version: https://evil.example gets credentialed access to user data.
// Safer version: unknown origins receive no CORS headers.`],
        [`<p>Performance and operations:</p><ul><li><b>Preflight cache:</b> use <code>maxAge</code>.</li><li><b>Reverse proxy:</b> set CORS in one place only, to avoid duplicate headers that browsers reject.</li><li><b>Vary:</b> keep <code>Vary: Origin</code> so CDNs cache correctly.</li><li><b>Logging:</b> log rejected origins at debug level to find configuration errors.</li></ul>`,
            r`# application.properties
logging.level.org.springframework.web.cors=DEBUG

# OUTPUT:
# DefaultCorsProcessor : Reject: 'https://evil.example.com' origin is not allowed`],
        [`<p>Scenario: an admin portal at one domain calls an API at another. The team allows only the portal origin with credentials, adds CSRF tokens to cookie requests, and writes tests for allowed and rejected origins.</p>`,
            r`@WebMvcTest(ApiController.class)
@Import(SecurityConfig.class)
class CorsTest {
    @Autowired MockMvc mvc;

    @Test void portalAllowed() throws Exception {
        mvc.perform(options("/api/data")
                .header("Origin", "https://portal.example.com")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isOk());
    }

    @Test void otherRejected() throws Exception {
        mvc.perform(options("/api/data")
                .header("Origin", "https://other.example.com")
                .header("Access-Control-Request-Method", "GET"))
            .andExpect(status().isForbidden());
    }
}

// OUTPUT:
// Tests run: 2, Failures: 0`]
    ),

    'mvc-spring-security-integration': dv(
        [`<p>Spring Boot auto-configures security when the starter is on the classpath.</p><ul><li><b>Registration:</b> <code>SecurityFilterAutoConfiguration</code> registers <code>DelegatingFilterProxy</code> named <code>springSecurityFilterChain</code>.</li><li><b>Dispatch:</b> <code>FilterChainProxy</code> finds the first <code>SecurityFilterChain</code> whose matcher fits the request.</li><li><b>Typical filters, in order:</b> <code>SecurityContextHolderFilter</code>, <code>CsrfFilter</code>, <code>LogoutFilter</code>, <code>UsernamePasswordAuthenticationFilter</code>, <code>BasicAuthenticationFilter</code>, <code>ExceptionTranslationFilter</code>, <code>AuthorizationFilter</code>.</li><li><b>Errors:</b> <code>ExceptionTranslationFilter</code> turns authentication errors into the entry point and access errors into 403.</li></ul>`,
            r`# application.properties: print the filter chain at startup
logging.level.org.springframework.security=DEBUG

# OUTPUT:
# Will secure any request with filters: DisableEncodeUrlFilter, WebAsyncManagerIntegrationFilter,
# SecurityContextHolderFilter, HeaderWriterFilter, CsrfFilter, LogoutFilter,
# UsernamePasswordAuthenticationFilter, DefaultLoginPageGeneratingFilter,
# BasicAuthenticationFilter, ExceptionTranslationFilter, AuthorizationFilter`],
        [`<p>Variants of integration:</p><ul><li><b>Lambda DSL:</b> the standard style since Spring Security 6.</li><li><b>Multiple chains:</b> split API and web.</li><li><b>WebSecurityCustomizer:</b> ignore static resources, though <code>permitAll</code> is often preferred.</li><li><b>Method security:</b> <code>@PreAuthorize</code>, <code>@PostAuthorize</code>, <code>@Secured</code>.</li><li><b>Properties:</b> <code>spring.security.user.name</code> and <code>spring.security.user.password</code> for a quick demo user.</li></ul>`,
            r`@Bean @Order(1)
SecurityFilterChain api(HttpSecurity http) throws Exception {
    http.securityMatcher("/api/**")
        .csrf(c -> c.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}

@Bean @Order(2)
SecurityFilterChain web(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
        .formLogin(Customizer.withDefaults());
    return http.build();
}

// OUTPUT:
// /api/** uses Basic and no session; every other URL uses form login and a session.`],
        [`<p>Common mistakes:</p><ul><li><b>Old adapter:</b> extending <code>WebSecurityConfigurerAdapter</code> no longer compiles in Spring Security 6.</li><li><b>antMatchers and mvcMatchers:</b> replaced by <code>requestMatchers</code>.</li><li><b>Disabling CSRF everywhere:</b> only do it for stateless APIs.</li><li><b>Plain passwords:</b> no <code>PasswordEncoder</code> gives "There is no PasswordEncoder mapped for the id null".</li><li><b>Missing import in tests:</b> <code>@WebMvcTest</code> does not load your config unless you import it.</li></ul>`,
            r`// Wrong: stored password without an encoder id
User.withUsername("a").password("pw1").roles("USER").build();

// Right: encode it
User.withUsername("a").password(encoder.encode("pw1")).roles("USER").build();

// OUTPUT:
// Wrong: IllegalArgumentException: There is no PasswordEncoder mapped for the id "null"
// Right: login works`],
        [`<p>Performance:</p><ul><li><b>Filters run on every request:</b> keep custom filters light and avoid database calls for public paths.</li><li><b>BCrypt strength:</b> the default cost of 10 balances safety and speed; raise it carefully.</li><li><b>Session lookups:</b> external session stores add network time.</li><li><b>Method security:</b> proxies add small overhead; avoid it in tight loops.</li></ul>`,
            r`@Bean
PasswordEncoder encoder() { return new BCryptPasswordEncoder(10); }

long t = System.nanoTime();
encoder().encode("pw1");
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=60`],
        [`<p>Scenario: an existing MVC shop adds security. Public catalogue pages stay open, the cart needs a login, and the admin area needs the ADMIN role. The team adds the starter, one chain, a database <code>UserDetailsService</code>, and MockMvc tests for each rule.</p>`,
            r`http.authorizeHttpRequests(a -> a
        .requestMatchers("/", "/catalog/**", "/css/**").permitAll()
        .requestMatchers("/admin/**").hasRole("ADMIN")
        .anyRequest().authenticated())
    .formLogin(f -> f.loginPage("/login").permitAll())
    .logout(Customizer.withDefaults());

// OUTPUT:
// GET /catalog -> 200 | GET /cart (anon) -> 302 /login | GET /admin (USER) -> 403`]
    ),

    'mvc-authentication': dv(
        [`<p>Authentication is a pipeline of small objects.</p><ul><li><b>Filter:</b> builds an unauthenticated <code>Authentication</code> (for example <code>UsernamePasswordAuthenticationToken</code>).</li><li><b>ProviderManager:</b> asks each <code>AuthenticationProvider</code> whether it <code>supports</code> that token type.</li><li><b>DaoAuthenticationProvider:</b> calls <code>UserDetailsService</code>, checks account flags, then <code>PasswordEncoder.matches</code>.</li><li><b>Result:</b> a new token with authorities and <code>authenticated=true</code>, stored in the <code>SecurityContext</code>; credentials are erased.</li></ul>`,
            r`UsernamePasswordAuthenticationToken req =
    UsernamePasswordAuthenticationToken.unauthenticated("asha", "pw1");
System.out.println(req.isAuthenticated());
Authentication done = manager.authenticate(req);
System.out.println(done.isAuthenticated() + " " + done.getAuthorities());

// OUTPUT:
// false
// true [ROLE_USER]`],
        [`<p>Variants:</p><ul><li><b>Form, Basic, Bearer token, OAuth2 login, SAML, LDAP, certificates.</b></li><li><b>UserDetails flags:</b> enabled, accountNonLocked, accountNonExpired, credentialsNonExpired.</li><li><b>PasswordEncoder:</b> <code>DelegatingPasswordEncoder</code> stores an id such as <code>{bcrypt}</code> to allow upgrades.</li><li><b>Custom provider</b> for non-password credentials.</li></ul>`,
            r`@Component
class ApiKeyProvider implements AuthenticationProvider {
    public Authentication authenticate(Authentication a) {
        String key = (String) a.getCredentials();
        if (!"secret-key-1".equals(key)) throw new BadCredentialsException("bad key");
        return new UsernamePasswordAuthenticationToken(
            "service-a", null, List.of(new SimpleGrantedAuthority("ROLE_SERVICE")));
    }
    public boolean supports(Class<?> type) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(type);
    }
}

// OUTPUT:
// authenticate with key secret-key-1 -> service-a [ROLE_SERVICE]`],
        [`<p>Common mistakes:</p><ul><li><b>Revealing which part is wrong:</b> "user not found" versus "wrong password" helps attackers.</li><li><b>Weak hashing:</b> MD5 or SHA-1 for passwords; use BCrypt, Argon2 or SCrypt.</li><li><b>Not clearing the context:</b> in tests or threads the context may leak; use <code>SecurityContextHolder.clearContext()</code>.</li><li><b>Locked or disabled accounts:</b> not mapped to a clear message.</li><li><b>Thread pools:</b> new threads do not inherit the context unless a strategy such as <code>MODE_INHERITABLETHREADLOCAL</code> or a delegating executor is used.</li></ul>`,
            r`// Wrong: async work loses the SecurityContext
CompletableFuture.runAsync(() -> log(SecurityContextHolder.getContext()));

// Right: wrap the executor
Executor ex = new DelegatingSecurityContextExecutor(Executors.newFixedThreadPool(4));
CompletableFuture.runAsync(() -> log(SecurityContextHolder.getContext()), ex);

// OUTPUT:
// Wrong: authentication is null in the pool thread
// Right: authentication is asha`],
        [`<p>Performance and tuning:</p><ul><li><b>BCrypt cost</b> is deliberate; do not lower it for speed, cache sessions or tokens instead.</li><li><b>User lookup:</b> index the username column and cache <code>UserDetails</code> with <code>CachingUserDetailsService</code> only when changes are rare.</li><li><b>Token validation</b> for JWT is local and fast, with no database read per request.</li></ul>`,
            r`@Bean
UserCache userCache(CacheManager cm) {
    return new SpringCacheBasedUserCache(cm.getCache("users"));
}

// OUTPUT:
// Second login of asha loads the user from the cache; the password check still runs.`],
        [`<p>Scenario: a company portal authenticates employees. Passwords are BCrypt hashed, five failed logins lock the account for a time, and the lock is reported through <code>AuthenticationFailureBadCredentialsEvent</code> listeners.</p>`,
            r`@Component
class LoginAudit {
    @EventListener
    void onFail(AuthenticationFailureBadCredentialsEvent e) {
        System.out.println("failed login for " + e.getAuthentication().getName());
    }
    @EventListener
    void onOk(AuthenticationSuccessEvent e) {
        System.out.println("login ok for " + e.getAuthentication().getName());
    }
}

// OUTPUT:
// failed login for asha
// login ok for asha`]
    ),

    'mvc-authorization': dv(
        [`<p>Spring Security 6 uses <code>AuthorizationManager</code>.</p><ul><li><b>URL level:</b> <code>AuthorizationFilter</code> asks an <code>AuthorizationManager&lt;RequestAuthorizationContext&gt;</code>; the first matching rule decides.</li><li><b>Method level:</b> an AOP interceptor calls <code>AuthorizationManager&lt;MethodInvocation&gt;</code> before the method runs.</li><li><b>Decision:</b> granted, or <code>AccessDeniedException</code> handled by <code>ExceptionTranslationFilter</code>.</li><li><b>Authorities</b> come from the <code>Authentication</code> object.</li></ul>`,
            r`AuthorizationManager<RequestAuthorizationContext> manager =
    AuthorityAuthorizationManager.hasRole("ADMIN");
AuthorizationDecision d = manager.check(() -> authentication, null);
System.out.println(d.isGranted());

// OUTPUT:
// true (when the user has ROLE_ADMIN)`],
        [`<p>Expression options:</p><ul><li><b>hasRole, hasAnyRole, hasAuthority, hasAnyAuthority.</b></li><li><b>permitAll, denyAll, authenticated, anonymous.</b></li><li><b>access:</b> custom <code>AuthorizationManager</code> or a SpEL expression.</li><li><b>@PostAuthorize</b> checks the returned object; <b>@PreFilter</b> and <b>@PostFilter</b> filter collections.</li><li><b>Role hierarchy:</b> ADMIN implies USER.</li></ul>`,
            r`@Bean
RoleHierarchy roleHierarchy() {
    return RoleHierarchyImpl.fromHierarchy("ROLE_ADMIN > ROLE_USER");
}

@PostAuthorize("returnObject.owner == authentication.name")
public Order find(long id) { return repo.findById(id).orElseThrow(); }

// OUTPUT:
// ADMIN can open every USER page.
// find(7) of another owner -> AccessDeniedException`],
        [`<p>Common mistakes:</p><ul><li><b>ROLE_ prefix confusion:</b> <code>hasRole("ROLE_ADMIN")</code> works but <code>hasAuthority("ADMIN")</code> checks a different string.</li><li><b>Rule order:</b> <code>anyRequest().permitAll()</code> placed first.</li><li><b>Only hiding links:</b> a hidden button does not protect the endpoint.</li><li><b>Self invocation:</b> method security is skipped within the same class.</li><li><b>Path mismatch:</b> <code>/admin</code> versus <code>/admin/</code>; use <code>requestMatchers</code> with the MVC mapping.</li></ul>`,
            r`// Wrong: broad rule first
http.authorizeHttpRequests(a -> a
    .anyRequest().authenticated()
    .requestMatchers("/admin/**").hasRole("ADMIN"));

// Right: specific first (the wrong order throws at startup in Spring Security 6)
http.authorizeHttpRequests(a -> a
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated());

// OUTPUT:
// Wrong: IllegalStateException: Can't configure requestMatchers after anyRequest
// Right: only ADMIN opens /admin/**`],
        [`<p>Performance:</p><ul><li><b>Cheap checks first:</b> URL rules are fast string matches.</li><li><b>Expensive checks:</b> a database lookup in a custom manager runs on every call; cache the permissions.</li><li><b>Load authorities once</b> at login rather than on each request.</li><li><b>Avoid @PostFilter</b> on huge lists; filter in the query.</li></ul>`,
            r`// Filter in the query instead of @PostFilter
@Query("select o from Order o where o.owner = :owner")
List<Order> findByOwner(@Param("owner") String owner);

// OUTPUT:
// 1 query returns only the rows the user may see`],
        [`<p>Scenario: a hospital system. Doctors read and write notes of their own patients, nurses read, and auditors only read the log. The team uses roles for broad areas and a custom <code>AuthorizationManager</code> for patient-level checks.</p>`,
            r`@Component("patientAccess")
class PatientAccess {
    boolean canRead(Authentication auth, long patientId) {
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
    }
}

@PreAuthorize("@patientAccess.canRead(authentication, #id)")
public Patient get(long id) { return repo.findById(id).orElseThrow(); }

// OUTPUT:
// DOCTOR get(5) -> Patient
// AUDITOR get(5) -> AccessDeniedException`]
    ),

    'mvc-login': dv(
        [`<p>The login request path inside Spring Security:</p><ul><li><b>Page:</b> <code>DefaultLoginPageGeneratingFilter</code> renders the built-in page, or your <code>/login</code> controller is used.</li><li><b>Processing:</b> <code>UsernamePasswordAuthenticationFilter</code> matches <code>POST /login</code>, creates the token and calls the manager.</li><li><b>Success:</b> session strategy changes the session id, the context is saved, and the success handler redirects.</li><li><b>Failure:</b> context cleared, failure handler redirects to <code>/login?error</code>.</li></ul>`,
            r`// 1 GET /orders              -> 302 Location: /login     (saved request: /orders)
// 2 GET /login               -> 200 login form
// 3 POST /login user+pass+csrf
//   -> 302 Location: /orders  Set-Cookie: JSESSIONID=NEWID

// OUTPUT:
// The browser lands on /orders with an authenticated session.`],
        [`<p>Login styles:</p><ul><li><b>Default page</b> for quick starts.</li><li><b>Custom page</b> with <code>loginPage</code>.</li><li><b>JSON endpoint</b> with your own controller calling <code>AuthenticationManager</code> and returning a token.</li><li><b>OAuth2 login</b> with <code>oauth2Login()</code>.</li><li><b>Success options:</b> <code>defaultSuccessUrl(url, alwaysUse)</code> and <code>successHandler</code>.</li></ul>`,
            r`@RestController
class AuthController {
    private final AuthenticationManager manager;
    private final JwtService jwt;
    AuthController(AuthenticationManager m, JwtService j) { manager = m; jwt = j; }

    @PostMapping("/api/login")
    Map<String, String> login(@RequestBody LoginRequest req) {
        Authentication a = manager.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(req.user(), req.pass()));
        return Map.of("token", jwt.create(a.getName()));
    }
}

// OUTPUT:
// POST /api/login {"user":"asha","pass":"pw1"} -> {"token":"eyJhbGciOi..."} (varies)`],
        [`<p>Common mistakes:</p><ul><li><b>Login page blocked:</b> forget <code>permitAll()</code> and get a redirect loop.</li><li><b>Missing CSRF field:</b> 403 on post.</li><li><b>Form field names differ</b> from the configured parameters.</li><li><b>Detailed errors:</b> telling which of user or password is wrong.</li><li><b>HTTP instead of HTTPS:</b> passwords visible on the network.</li><li><b>Open redirect:</b> using an unchecked <code>redirect</code> parameter after login.</li></ul>`,
            r`// Wrong: login page needs authentication -> redirect loop
http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
    .formLogin(f -> f.loginPage("/login"));

// Right
http.authorizeHttpRequests(a -> a.anyRequest().authenticated())
    .formLogin(f -> f.loginPage("/login").permitAll());

// OUTPUT:
// Wrong: browser error ERR_TOO_MANY_REDIRECTS
// Right: login form is shown`],
        [`<p>Tuning and protection:</p><ul><li><b>Throttle:</b> limit attempts per IP and per account.</li><li><b>Hash cost:</b> BCrypt slows guessing but also uses CPU on every login.</li><li><b>Lightweight page:</b> serve static assets with caching.</li><li><b>Multi-factor:</b> add a second step for sensitive apps.</li></ul>`,
            r`@Component
class LoginThrottle {
    private final Map<String, Integer> fails = new ConcurrentHashMap<>();
    boolean blocked(String user) { return fails.getOrDefault(user, 0) >= 5; }
    void failed(String user) { fails.merge(user, 1, Integer::sum); }
    void ok(String user) { fails.remove(user); }
}

// OUTPUT:
// after 5 wrong passwords blocked("asha") -> true`],
        [`<p>Scenario: a ticket system with a custom page. Users who open a deep link are sent to login and then back to the same ticket. The team verifies that with a MockMvc test and logs every failed attempt.</p>`,
            r`@Test
void deepLinkReturnsAfterLogin() throws Exception {
    MockHttpSession session = new MockHttpSession();
    mvc.perform(get("/tickets/42").session(session))
        .andExpect(redirectedUrlPattern("**/login"));
    mvc.perform(formLogin().user("asha").password("pw1").session(session))
        .andExpect(redirectedUrl("http://localhost/tickets/42"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),

    'mvc-logout': dv(
        [`<p>Logout internals:</p><ul><li><b>LogoutFilter</b> matches <code>POST /logout</code> and calls <code>CompositeLogoutHandler</code>.</li><li><b>Handlers:</b> <code>SecurityContextLogoutHandler</code> invalidates the session and clears the context; <code>CookieClearingLogoutHandler</code> deletes cookies; <code>CsrfLogoutHandler</code> clears the CSRF token.</li><li><b>Success handler:</b> <code>SimpleUrlLogoutSuccessHandler</code> redirects.</li><li>The session id is gone on the server, so the old cookie is useless.</li></ul>`,
            r`// POST /logout
// Cookie: JSESSIONID=ABC123
// X-CSRF-TOKEN: ...

// HTTP/1.1 302
// Location: /login?logout
// Set-Cookie: JSESSIONID=; Max-Age=0

// OUTPUT:
// GET /orders with cookie ABC123 -> 302 /login (the session no longer exists)`],
        [`<p>Options:</p><ul><li><b>logoutUrl</b> or <b>logoutRequestMatcher</b> (to allow GET, only when CSRF risk is accepted).</li><li><b>addLogoutHandler</b> for custom cleanup.</li><li><b>clearAuthentication</b> and <b>invalidateHttpSession</b>.</li><li><b>OIDC logout:</b> <code>OidcClientInitiatedLogoutSuccessHandler</code> signs out of the identity provider.</li></ul>`,
            r`http.logout(l -> l
    .logoutUrl("/logout")
    .addLogoutHandler((req, res, auth) ->
        System.out.println("bye " + (auth == null ? "?" : auth.getName())))
    .logoutSuccessHandler((req, res, auth) -> res.setStatus(200)));

// OUTPUT:
// bye asha
// HTTP/1.1 200`],
        [`<p>Common mistakes:</p><ul><li><b>Logout link with GET</b> while CSRF is on gives a 404 or login page.</li><li><b>Forgetting the CSRF token</b> in the logout form.</li><li><b>Stale JWT:</b> the client logs out but the token stays valid until it expires.</li><li><b>Remember-me cookie</b> not cleared, so the user returns logged in.</li><li><b>Caching:</b> the browser back button shows protected pages; Spring sends no-cache headers by default, keep them.</li></ul>`,
            r`// Wrong: GET link
// <a href="/logout">Logout</a>   -> not handled when CSRF is enabled

// Right: POST form with token
// <form th:action="@{/logout}" method="post"><button>Logout</button></form>

// OUTPUT:
// Wrong: GET /logout -> shows the logout confirmation or login page
// Right: POST /logout -> 302 /login?logout`],
        [`<p>Performance and scale:</p><ul><li>Invalidating a session frees server memory at once.</li><li>With Spring Session, the logout deletes the entry in Redis.</li><li>Use short session timeouts for sensitive apps so abandoned sessions disappear.</li></ul>`,
            r`# application.properties
server.servlet.session.timeout=15m

# OUTPUT:
# Idle sessions expire after 15 minutes; the next request redirects to /login`],
        [`<p>Scenario: a shared computer in a bank branch. The team logs out on a button and on idle timeout, deletes cookies, clears the cache headers, and checks with a test that a protected page redirects after logout.</p>`,
            r`@Test
void afterLogoutPageIsProtected() throws Exception {
    MockHttpSession s = new MockHttpSession();
    mvc.perform(formLogin().user("asha").password("pw1").session(s));
    mvc.perform(post("/logout").with(csrf()).session(s));
    mvc.perform(get("/account").session(s))
        .andExpect(status().is3xxRedirection());
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),

    'mvc-form-login': dv(
        [`<p>Form login builds on a chain of cooperating parts.</p><ul><li><b>Config:</b> <code>FormLoginConfigurer</code> adds <code>UsernamePasswordAuthenticationFilter</code> and sets an <code>AuthenticationEntryPoint</code> that redirects to the login page.</li><li><b>Entry point:</b> <code>LoginUrlAuthenticationEntryPoint</code> is triggered by <code>ExceptionTranslationFilter</code> when an anonymous user hits a protected URL.</li><li><b>Request cache:</b> <code>HttpSessionRequestCache</code> stores the original request.</li><li><b>Success:</b> session id changes and the saved request is replayed.</li></ul>`,
            r`// Sequence for GET /reports
// AuthorizationFilter -> AccessDeniedException (anonymous)
// ExceptionTranslationFilter -> save request, call LoginUrlAuthenticationEntryPoint
// -> 302 /login
// POST /login -> UsernamePasswordAuthenticationFilter -> success handler -> 302 /reports

// OUTPUT:
// The user ends on /reports, as originally requested.`],
        [`<p>Options of <code>formLogin</code>:</p><ul><li><b>loginPage, loginProcessingUrl, failureUrl.</b></li><li><b>defaultSuccessUrl(url, true)</b> forces that page, ignoring the saved request.</li><li><b>successForwardUrl</b> and <b>failureForwardUrl</b> forward instead of redirecting.</li><li><b>authenticationDetailsSource</b> to store extra data such as the IP address.</li></ul>`,
            r`http.formLogin(f -> f
    .loginPage("/signin")
    .loginProcessingUrl("/signin/submit")
    .failureHandler(new SimpleUrlAuthenticationFailureHandler("/signin?bad"))
    .successHandler(new SavedRequestAwareAuthenticationSuccessHandler())
    .permitAll());

// OUTPUT:
// GET /signin -> your page, POST /signin/submit -> handled by the filter`],
        [`<p>Common mistakes:</p><ul><li><b>Writing a controller for POST /login:</b> the filter handles it and your method is never reached.</li><li><b>Plain-text passwords</b> in test users.</li><li><b>Static resources blocked</b> so the login page has no CSS.</li><li><b>Stateless config with form login:</b> the session is needed to keep the user logged in.</li><li><b>Open redirect</b> via a custom <code>redirect</code> parameter.</li></ul>`,
            r`// Wrong: the filter consumes POST /login before this method
@PostMapping("/login")
String doLogin(String username, String password) { return "home"; }

// Right: let the filter authenticate, and only provide the page
@GetMapping("/login")
String loginPage() { return "login"; }

// OUTPUT:
// Wrong: doLogin is never called
// Right: GET shows the page, POST is handled by Spring Security`],
        [`<p>Performance and safety:</p><ul><li><b>Cache static files</b> of the login page.</li><li><b>Limit attempts</b> and add a delay after failures.</li><li><b>Remember me</b> avoids repeated BCrypt checks, but uses a long-lived token.</li><li><b>Session size:</b> store only the principal id and not large objects.</li></ul>`,
            r`http.rememberMe(r -> r
    .tokenRepository(new JdbcTokenRepositoryImpl())
    .tokenValiditySeconds(7 * 24 * 3600));

// OUTPUT:
// A returning user within 7 days is logged in without typing the password.`],
        [`<p>Scenario: an internal HR portal with Thymeleaf pages. The team uses form login with a branded page, role based menus, and a test suite that checks anonymous redirect, success, failure and logout.</p>`,
            r`@Test
void wrongPasswordShowsError() throws Exception {
    mvc.perform(formLogin().user("asha").password("nope"))
        .andExpect(unauthenticated())
        .andExpect(redirectedUrl("/login?error"));
}

// OUTPUT:
// Tests run: 1, Failures: 0`]
    ),

    'mvc-basic-authentication': dv(
        [`<p>How Basic works on the wire and in Spring:</p><ul><li><b>1:</b> the client sends a request without credentials.</li><li><b>2:</b> <code>BasicAuthenticationEntryPoint</code> answers 401 and <code>WWW-Authenticate: Basic realm="Realm"</code>.</li><li><b>3:</b> the client repeats it with the <code>Authorization</code> header.</li><li><b>4:</b> <code>BasicAuthenticationFilter</code> decodes it, builds a <code>UsernamePasswordAuthenticationToken</code> and calls the manager.</li><li><b>5:</b> on success the context is filled; with sessions it may also be saved.</li></ul>`,
            r`// Request 1
// GET /api/orders HTTP/1.1
// Response 1
// HTTP/1.1 401
// WWW-Authenticate: Basic realm="Realm"
// Request 2
// GET /api/orders HTTP/1.1
// Authorization: Basic YXNoYTpwdzE=
// Response 2
// HTTP/1.1 200

// OUTPUT:
// Base64 decode of YXNoYTpwdzE= is asha:pw1`],
        [`<p>Variants:</p><ul><li><b>Realm name:</b> <code>httpBasic(b -&gt; b.realmName("Shop API"))</code>.</li><li><b>Custom entry point</b> for JSON errors.</li><li><b>Client side:</b> <code>RestTemplate</code> or <code>WebClient</code> with <code>setBasicAuth</code>.</li><li><b>Mixed:</b> Basic for internal paths, form login for browser pages.</li></ul>`,
            r`WebClient client = WebClient.builder()
    .baseUrl("http://localhost:8080")
    .defaultHeaders(h -> h.setBasicAuth("asha", "pw1"))
    .build();
String body = client.get().uri("/api/orders").retrieve()
    .bodyToMono(String.class).block();
System.out.println(body);

// OUTPUT:
// [{"id":1,"total":250.0}]`],
        [`<p>Common mistakes:</p><ul><li><b>Using HTTP:</b> credentials can be read by anyone on the path.</li><li><b>Leaving CSRF on</b> for a stateless API: POST calls return 403.</li><li><b>Keeping a session:</b> without STATELESS, a session is created and may behave unexpectedly.</li><li><b>Logging the header</b> in access logs or tracing.</li><li><b>Hardcoded credentials</b> in the source code.</li></ul>`,
            r`// Wrong: POST returns 403 because CSRF is still active
http.httpBasic(Customizer.withDefaults());

// Right for a stateless API
http.csrf(c -> c.disable())
    .httpBasic(Customizer.withDefaults())
    .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

// OUTPUT:
// Wrong: POST /api/orders -> 403 Forbidden
// Right: POST /api/orders -> 201`],
        [`<p>Performance:</p><ul><li><b>Hash cost per request:</b> BCrypt on every call limits throughput; this is why tokens are used for high-volume APIs.</li><li><b>Connection reuse:</b> keep-alive reduces TLS cost.</li><li><b>Service accounts:</b> use a faster hash only if the secret is long and random, such as an API key.</li></ul>`,
            r`// Measuring the per-request cost
long t = System.nanoTime();
encoder.matches("pw1", hash);
System.out.println("ms=" + (System.nanoTime() - t) / 1_000_000);

// OUTPUT: (varies)
// ms=55`],
        [`<p>Scenario: a nightly job calls an internal reporting API. The team uses Basic over HTTPS with a service account, reads the password from an environment variable, and restricts the account to one role.</p>`,
            r`@Bean
UserDetailsService svc(PasswordEncoder enc, Environment env) {
    return new InMemoryUserDetailsManager(
        User.withUsername("report-job")
            .password(enc.encode(env.getRequiredProperty("REPORT_PASSWORD")))
            .roles("REPORT").build());
}

http.authorizeHttpRequests(a -> a
    .requestMatchers("/api/reports/**").hasRole("REPORT")
    .anyRequest().denyAll());

// OUTPUT:
// report-job -> GET /api/reports/daily 200
// report-job -> GET /api/users 403`]
    ),

    'mvc-session-authentication': dv(
        [`<p>Session handling internals:</p><ul><li><b>Login:</b> after success, <code>SessionAuthenticationStrategy</code> runs (fixation, concurrency), then <code>HttpSessionSecurityContextRepository</code> saves the context under an attribute.</li><li><b>Next request:</b> <code>SecurityContextHolderFilter</code> loads it from the session into <code>SecurityContextHolder</code> lazily.</li><li><b>Concurrency:</b> <code>ConcurrentSessionControlAuthenticationStrategy</code> consults the <code>SessionRegistry</code>.</li><li><b>End of request:</b> the holder is cleared from the thread.</li></ul>`,
            r`// Session attribute (simplified)
// SPRING_SECURITY_CONTEXT -> SecurityContextImpl [Authentication=UsernamePasswordAuthenticationToken
//   [Principal=asha, Authorities=[ROLE_USER]]]

// OUTPUT:
// Every request with the same JSESSIONID sees the same logged-in user.`],
        [`<p>Session creation policies:</p><ul><li><b>IF_REQUIRED</b> (default), <b>ALWAYS</b>, <b>NEVER</b>, <b>STATELESS</b>.</li><li><b>Session fixation:</b> <code>changeSessionId</code>, <code>newSession</code>, <code>migrateSession</code>, <code>none</code>.</li><li><b>Invalid session URL</b> and <b>expired URL</b> for friendly redirects.</li><li><b>Spring Session:</b> Redis, JDBC or Hazelcast stores with <code>@EnableRedisHttpSession</code>.</li></ul>`,
            r`http.sessionManagement(s -> s
    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
    .invalidSessionUrl("/login?invalid")
    .sessionFixation(f -> f.migrateSession())
    .maximumSessions(2).expiredUrl("/login?expired"));

// OUTPUT:
// A user may hold two sessions; the third login expires the oldest.`],
        [`<p>Common mistakes:</p><ul><li><b>Large objects in the session</b> increase memory and replication cost.</li><li><b>Non-serializable attributes</b> break external session stores.</li><li><b>Disabled fixation protection.</b></li><li><b>Missing Secure and HttpOnly flags.</b></li><li><b>Load balancer without sticky sessions or shared store:</b> the user keeps being logged out.</li><li><b>Ignoring concurrent logins:</b> sharing accounts.</li></ul>`,
            r`// Wrong: storing a whole entity graph in the session
session.setAttribute("user", userEntityWithOrders);

// Right: keep ids and small values
session.setAttribute("userId", user.getId());

// OUTPUT:
// Wrong: session of 2 MB per user, NotSerializableException with Redis
// Right: session of a few hundred bytes`],
        [`<p>Performance and scaling:</p><ul><li><b>Memory:</b> each session uses heap; set a timeout and keep data small.</li><li><b>Shared store:</b> Redis gives horizontal scaling at the cost of a network call per request; use lazy writes.</li><li><b>Cookie only:</b> disable URL rewriting with <code>server.servlet.session.tracking-modes=cookie</code>.</li></ul>`,
            r`# application.properties
server.servlet.session.tracking-modes=cookie
spring.session.store-type=redis
spring.session.timeout=30m

# OUTPUT:
# Sessions are stored in Redis and shared by every application instance.`],
        [`<p>Scenario: an online exam site must allow only one active login per student and must end the session on timeout. The team uses <code>maximumSessions(1)</code>, a session registry to show online users, and a 20 minute idle timeout.</p>`,
            r`http.sessionManagement(s -> s
    .maximumSessions(1)
    .maxSessionsPreventsLogin(true)
    .sessionRegistry(sessionRegistry()));

// OUTPUT:
// Second login of the same student -> SessionAuthenticationException:
// Maximum sessions of 1 for this principal exceeded`]
    )
};
