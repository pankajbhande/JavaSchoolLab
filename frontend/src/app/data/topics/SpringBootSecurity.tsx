import { Topic } from '../coreJava';

export const springBootSecurity: Topic = {
    id: 'spring-boot-security',
    name: 'Spring Boot Security Basics',
    beginner: [
        {
            content: `Spring Security is the standard way to add authentication and authorization to a Spring Boot
application. <br><br>
Just adding the <strong>spring-boot-starter-security</strong> dependency to your project is enough to
secure <strong>every</strong> endpoint by default - no configuration required. <br><br>

<h4>Add the dependency (Maven):</h4>`,
            codeExamples: [`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>`]
        },

        {
            content: `<h3>What happens the moment you add the starter</h3>
As soon as the app starts up, Spring Boot auto-configures a default security setup: <br>
• Every HTTP endpoint now requires authentication. <br>
• A default login form (HTML page) is generated automatically. <br>
• A default user named <strong>user</strong> is created. <br>
• A random password for that user is generated fresh on every startup and printed to the
console log. <br><br>

Below is what you will see printed in the console when the application boots up with only the
security starter added and nothing else configured: <br>`,
            codeExamples: [`// Console output on application startup:

Using generated security password: 8e557245-73e2-4286-969a-ff57fe326336

This generated password is for development use only. Your security configuration
must be updated before running your application in production.

// Login page is now served at:
// http://localhost:8080/login
//
// Default credentials:
// Username: user
// Password: 8e557245-73e2-4286-969a-ff57fe326336  (copy from the console log above)`]
        },

        {
            content: `<h3>Authentication vs Authorization</h3>
These two words sound similar but answer completely different questions - almost every interview
question in security starts here: <br><br>

<strong>Authentication - "Who are you?"</strong> <br>
• Verifying identity - checking a username/password, a token, etc. <br>
• Happens first. If it fails, the request is rejected before authorization is even considered. <br><br>

<strong>Authorization - "What are you allowed to do?"</strong> <br>
• Once identity is confirmed, checking whether that identity has permission to access a
particular resource or perform a particular action (e.g. only an ADMIN can delete a user). <br>
• Happens after authentication succeeds. <br><br>

Simple analogy: showing your ID card at the office gate is <strong>authentication</strong>.
Whether your ID card lets you enter the server room is <strong>authorization</strong>.`
        },

        {
            content: `<h3>A minimal in-memory user configuration</h3>
Instead of relying on the auto-generated random password, you can define your own users directly
in configuration - useful for learning, demos, or very small applications (never for production,
where users should come from a database). <br>`,
            codeExamples: [`@Configuration
public class UserConfig {

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        UserDetails admin = User.builder()
                .username("admin")
                .password(encoder.encode("admin123")) // encoded, never stored in plain text
                .roles("ADMIN")                        // becomes ROLE_ADMIN internally
                .build();

        UserDetails normalUser = User.builder()
                .username("john")
                .password(encoder.encode("john123"))
                .roles("USER")
                .build();

        return new InMemoryUserDetailsManager(admin, normalUser);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
// OUTPUT (behavior):
// Logging in as "admin" / "admin123" -> granted ROLE_ADMIN
// Logging in as "john"  / "john123"  -> granted ROLE_USER`]
        },

        {
            content: `<h3>403 Forbidden vs 401 Unauthorized</h3>
Both are error responses Spring Security can return, and mixing them up is a very common beginner
mistake: <br><br>

<strong>401 Unauthorized</strong> - "I don't know who you are." <br>
• Returned when authentication itself failed or was never provided (missing/invalid
credentials or token). <br>
• The server is saying: prove your identity first. <br><br>

<strong>403 Forbidden</strong> - "I know who you are, but you're not allowed here." <br>
• Returned when authentication succeeded, but the authenticated user lacks the required
role/permission for that specific resource. <br>
• The server is saying: your identity is fine, your permissions are not enough. <br>`,
            codeExamples: [`// Example 1: No login credentials sent at all
// GET /api/orders  (no Authorization header)
// RESPONSE: 401 Unauthorized

// Example 2: Logged in as "john" (ROLE_USER) trying to hit an admin-only endpoint
// GET /api/admin/reports   (Authorization header present, user authenticated)
// RESPONSE: 403 Forbidden`]
        }
    ],

    expert: [
        {
            content: `<h3>The Security Filter Chain</h3>
Every incoming HTTP request to a Spring Boot application secured with Spring Security passes
through a chain of servlet filters <strong>before</strong> it ever reaches your controller. Each
filter has one job (parse a token, check a session, enforce CSRF, etc.) and either lets the
request continue to the next filter or rejects it outright. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">HTTP Request
   |
   v
+--------------------------------------------------+
|           DelegatingFilterProxy                  |
|         (bridges servlet container -> Spring)     |
+--------------------------------------------------+
   |
   v
+--------------------------------------------------+
|           FilterChainProxy                       |
|   +--------------------------------------------+ |
|   | SecurityContextPersistenceFilter            | |  restores/saves SecurityContext
|   +--------------------------------------------+ |
|   | CsrfFilter                                   | |  blocks unsafe cross-site requests
|   +--------------------------------------------+ |
|   | UsernamePasswordAuthenticationFilter /       | |  handles login form submit
|   | JwtAuthenticationFilter (custom)              | |  or validates bearer token
|   +--------------------------------------------+ |
|   | ExceptionTranslationFilter                    | |  converts security errors to
|   |                                                | |  401 / 403 HTTP responses
|   +--------------------------------------------+ |
|   | FilterSecurityInterceptor /                   | |  final authorization decision -
|   | AuthorizationFilter                           | |  checks role/permission rules
|   +--------------------------------------------+ |
+--------------------------------------------------+
   |
   v
DispatcherServlet -> Controller -> Your Business Logic</pre>

If any filter in the chain rejects the request, it never reaches the controller at all - the
response is short-circuited straight back to the client (typically with 401 or 403).`
        },

        {
            content: `<h3>Configuring a Custom SecurityFilterChain (Spring Security 6+)</h3>
The old <code>WebSecurityConfigurerAdapter</code> class-based approach is deprecated. Modern
Spring Security (5.7+ / 6.x, the version shipped with current Spring Boot) configures security
declaratively by exposing a <code>SecurityFilterChain</code> bean instead. <br>`,
            codeExamples: [`@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())               // often disabled for stateless REST APIs
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**", "/login", "/register").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()             // everything else needs login
            )
            .httpBasic(Customizer.withDefaults());        // simple Basic Auth for demo purposes

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
// OUTPUT (behavior):
// GET /api/public/status   -> 200 OK, no login required
// GET /api/orders          -> 401 Unauthorized if not logged in
// GET /api/admin/reports   -> 403 Forbidden unless caller has ROLE_ADMIN
// GET /api/admin/reports   -> 200 OK when caller has ROLE_ADMIN`]
        },

        {
            content: `<h3>Password Encoding with BCryptPasswordEncoder</h3>
Storing plain-text passwords is <strong>never</strong> acceptable, even for internal tools or
"just a demo." If the database is ever leaked (breach, misconfigured backup, insider access),
plain-text passwords hand attackers every user's real password instantly - and because people
reuse passwords across sites, the damage spreads far beyond your own application. <br><br>

<code>BCryptPasswordEncoder</code> is the standard choice: it is a one-way, adaptive hashing
algorithm that automatically salts each password and can be configured to run slower as hardware
gets faster, making brute-force attacks impractical. <br>`,
            codeExamples: [`@Service
public class RegistrationService {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void registerUser(String rawPassword) {
        String hashed = passwordEncoder.encode(rawPassword);
        System.out.println("Raw password:    " + rawPassword);
        System.out.println("Stored in DB as: " + hashed);
        // Save "hashed" to the database - never save "rawPassword"
    }

    public boolean checkLogin(String rawPassword, String hashedFromDb) {
        // matches() re-hashes the raw input and compares - you can NEVER
        // "decrypt" a bcrypt hash back to the original password
        return passwordEncoder.matches(rawPassword, hashedFromDb);
    }

    public static void main(String[] args) {
        RegistrationService service = new RegistrationService();
        service.registerUser("mySecret123");
    }
}
// OUTPUT (illustrative - hash changes every run because of the random salt):
// Raw password:    mySecret123
// Stored in DB as: $2a$10$N9qo8uLOickgx2ZMRZoMy.MHi9F4B7lJfkbJRJk3bckOa7CCFAQXO`]
        },

        {
            content: `<h3>JWT-Based Stateless Authentication</h3>
Traditional session-based login stores authentication state on the server (an HTTP session). This
does not scale well across multiple server instances. JWT (JSON Web Token) authentication instead
makes the server <strong>stateless</strong> - the token itself carries the proof of identity, so
no session needs to be stored anywhere on the server. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Client                                   Server
  |                                          |
  |---- POST /login (username, password) --->|
  |                                          | validate credentials
  |                                          | generate signed JWT
  |<----------- 200 OK { token: "xyz..." } --|
  |                                          |
  |  (client stores token - memory/storage)  |
  |                                          |
  |--- GET /api/orders --------------------->|
  |    Header: Authorization: Bearer xyz...  |
  |                                          | JwtAuthenticationFilter:
  |                                          |   1. extract token from header
  |                                          |   2. verify signature + expiry
  |                                          |   3. load user identity from token
  |                                          |   4. set SecurityContext (per-request,
  |                                          |      NOT stored server-side)
  |<------------- 200 OK { orders: [...] } --|
  |                                          |
  | No session lookup needed on any request. |
  | Each request is self-contained.          |</pre>

Because there is no server-side session, any server instance behind a load balancer can validate
the token independently - this is what makes JWT auth naturally horizontally scalable.`,
            codeExamples: [`public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil; // helper that parses/validates the signed token

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7); // strip "Bearer " prefix

            if (jwtUtil.isValid(token)) {
                String username = jwtUtil.extractUsername(token);
                List<GrantedAuthority> authorities = jwtUtil.extractAuthorities(token);

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
            // invalid/expired token -> SecurityContext stays empty -> request treated
            // as unauthenticated further down the filter chain -> eventually 401
        }

        chain.doFilter(request, response); // always continue the chain
    }
}
// OUTPUT (behavior):
// Valid token   -> SecurityContext populated -> request proceeds as authenticated
// Missing/bad token -> SecurityContext stays empty -> 401 Unauthorized on protected routes`]
        },

        {
            content: `<h3>Method-Level Security with @PreAuthorize</h3>
Besides URL-based rules in the <code>SecurityFilterChain</code>, Spring Security can enforce
authorization directly on individual service/controller methods. This keeps the permission check
right next to the business logic it protects, which is often clearer than a giant list of URL
patterns. <br><br>

Requires <code>@EnableMethodSecurity</code> on a configuration class.`,
            codeExamples: [`@Configuration
@EnableMethodSecurity // enables @PreAuthorize, @PostAuthorize, @Secured, etc.
public class MethodSecurityConfig {
}

@Service
public class UserAdminService {

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long userId) {
        System.out.println("User " + userId + " deleted by an ADMIN");
    }

    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    public String viewProfile(String username) {
        // an ADMIN can view anyone's profile; a normal user can only view their own
        return "Profile data for: " + username;
    }
}
// OUTPUT (behavior):
// deleteUser() called by user with ROLE_ADMIN   -> executes normally
// deleteUser() called by user with only ROLE_USER -> 403 Forbidden,
//     method body never runs - the check happens BEFORE entry, hence "@PreAuthorize"`]
        },

        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does adding spring-boot-starter-security do by default?</td><td>Secures every endpoint, generates a default login form, creates a "user" account with a random password printed to the console on startup</td></tr>
<tr class='text-center'><td>Authentication vs Authorization?</td><td>Authentication verifies identity ("who are you"); authorization checks permissions ("what are you allowed to do") and always happens after authentication</td></tr>
<tr class='text-center'><td>401 vs 403 - what's the difference?</td><td>401 means the request was never authenticated (missing/invalid credentials); 403 means authentication succeeded but the user lacks permission for that resource</td></tr>
<tr class='text-center'><td>Why is WebSecurityConfigurerAdapter deprecated?</td><td>Spring Security 5.7+/6 moved to a component-based model - you expose a SecurityFilterChain @Bean instead of extending a base class, which is more testable and composable</td></tr>
<tr class='text-center'><td>Why must passwords always be hashed, never stored in plain text?</td><td>A database leak would expose every user's real password directly; hashing (e.g. BCrypt) is one-way, so even a leaked hash can't be reversed to the original password</td></tr>
<tr class='text-center'><td>Why is BCrypt preferred over plain MD5/SHA-256 for passwords?</td><td>BCrypt automatically salts each hash and is deliberately slow/adaptive (configurable work factor), which makes brute-force and rainbow-table attacks impractical - fast general-purpose hashes do not</td></tr>
<tr class='text-center'><td>What makes JWT authentication "stateless"?</td><td>The server stores no session; the signed token itself carries the user's identity and claims, so any server instance can validate it independently on every request</td></tr>
<tr class='text-center'><td>Where does the JWT travel on each request?</td><td>In the Authorization HTTP header as "Bearer &lt;token&gt;", read and validated by a custom filter early in the security filter chain</td></tr>
<tr class='text-center'><td>What does @PreAuthorize("hasRole('ADMIN')") do?</td><td>Blocks the annotated method from executing at all unless the currently authenticated user has ROLE_ADMIN - the check runs before the method body, requires @EnableMethodSecurity</td></tr>
<tr class='text-center'><td>What happens if a filter rejects a request early in the chain?</td><td>The request never reaches the controller - it is short-circuited immediately with an error response (typically 401 or 403)</td></tr>
</table>`
        }
    ],
};
