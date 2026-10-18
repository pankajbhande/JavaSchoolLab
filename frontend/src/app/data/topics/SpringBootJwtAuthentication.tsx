import { Topic } from '../coreJava';

export const springBootJwtAuthentication: Topic = {
    id: 'spring-boot-jwt-authentication',
    name: 'JWT Authentication',
    beginner: [
        {
            content: `<h3>The Problem Stateless Auth Solves</h3>
Classic form login stores the logged-in user in an <strong>HTTP session</strong>. The browser holds a <code>JSESSIONID</code> cookie, and the server holds a map from that id to the user. That works perfectly on one machine and starts falling apart the moment there are two.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">SESSION-BASED, scaled to 3 instances

            +----------------+
  login --->|  Instance A    |  session map: { S1 -> "ajay" }
            +----------------+
            +----------------+
  next  --->|  Instance B    |  session map: { }        <- who is S1?
  request   +----------------+                             401. Logged out.
            +----------------+
            |  Instance C    |  session map: { }
            +----------------+

The load balancer sent request 2 to a machine that has never
heard of session S1.</pre>
<br>

The usual patches each cost something:<br><br>

<table>
<tr><th>Patch</th><th>What it costs</th></tr>
<tr><td><strong>Sticky sessions</strong> - the balancer pins a client to one instance</td><td>That instance restarting logs everyone on it out. Deployments become disruptive, and traffic no longer balances evenly.</td></tr>
<tr><td><strong>Session replication</strong> - instances copy sessions to each other</td><td>Network chatter that grows with the square of the instance count, and a cluster that is now stateful.</td></tr>
<tr><td><strong>Shared session store</strong> (Spring Session with Redis)</td><td>Genuinely good, and the honest alternative to tokens. The cost is one more piece of infrastructure that must be highly available - if Redis is down, nobody is logged in.</td></tr>
<tr><td><strong>Stateless token</strong> (JWT)</td><td>The client carries the proof of identity. Any instance can verify it with nothing but a key. The cost is that you can no longer easily revoke it - the whole of the Expert tab circles back to this.</td></tr>
</table>
<br>

Mobile apps and third-party API clients have no cookie jar to begin with, which is the other reason token auth became the default for REST APIs.<br>`
        },

        {
            content: `<h3>What a JWT Actually Is</h3>
A <strong>JSON Web Token</strong> (RFC 7519) is three Base64URL-encoded strings joined by dots. Not encrypted - encoded. The first two parts are plain JSON that anyone can read; the third is a signature over the first two.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  .  eyJzdWIiOiJhamF5Iiwicm9sZXMiOlsi... .  qX3nO0kZ1s9dJ7fT2mVbYl8cPqRhE5wA6uKgN3tXsIY
   \\_________________________________/     \\____________________________/     \\_________________________________________/
              HEADER                                  PAYLOAD                                   SIGNATURE
        base64url(JSON)                          base64url(JSON)              HMACSHA256(header + "." + payload, key)

  +-----------------------+   +--------------------------------+   +------------------------------+
  | { "alg": "HS256",     |   | { "sub": "ajay",               |   | opaque bytes - proves the    |
  |   "typ": "JWT" }      |   |   "roles": ["ROLE_USER"],      |   | two parts on the left have   |
  |                       |   |   "iat": 1756900000,           |   | not been altered since the   |
  | which algorithm was   |   |   "exp": 1756900900 }          |   | server signed them.          |
  | used to sign this     |   |                                |   |                              |
  +-----------------------+   | the CLAIMS - readable by       |   | NOT a secret. NOT encryption.|
                              | absolutely anyone              |   +------------------------------+
                              +--------------------------------+</pre>
<br>

<strong>The signature does not hide anything.</strong> It proves <em>integrity</em> and <em>authenticity</em>: this token was issued by someone holding the signing key, and nobody has edited it since. Change one character of the payload and the signature no longer matches, so the server rejects it.<br>`,
            codeExamples: [
                `// Decoding a real token by hand - no library, no key needed.
// This is the single most important thing to internalise about JWT.

String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
             + ".eyJzdWIiOiJhamF5Iiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlhdCI6MTc1NjkwMDAwMCwiZXhwIjoxNzU2OTAwOTAwfQ"
             + ".qX3nO0kZ1s9dJ7fT2mVbYl8cPqRhE5wA6uKgN3tXsIY";

String[] parts = token.split("\\\\.");
Base64.Decoder d = Base64.getUrlDecoder();

System.out.println("header : " + new String(d.decode(parts[0])));
System.out.println("payload: " + new String(d.decode(parts[1])));

// OUTPUT:
// header : {"alg":"HS256","typ":"JWT"}
// payload: {"sub":"ajay","roles":["ROLE_USER"],"iat":1756900000,"exp":1756900900}
//
// No key was involved. Anyone holding the token - the browser, a proxy,
// a log aggregator, anyone reading a screenshot - reads the payload.
// Never put a password, a card number or an internal secret in there.`
            ]
        },

        {
            content: `<h3>The Standard Claims</h3>
A <strong>claim</strong> is one key/value pair in the payload. Some names are reserved by the RFC so that different systems agree on their meaning; the rest are yours.<br><br>

<table>
<tr><th>Claim</th><th>Meaning</th></tr>
<tr><td><code>sub</code> (subject)</td><td>Who the token is about. Usually the user id or username. This is what your filter turns back into a <code>UserDetails</code>.</td></tr>
<tr><td><code>iss</code> (issuer)</td><td>Who minted it. Verify it when more than one system issues tokens you accept.</td></tr>
<tr><td><code>aud</code> (audience)</td><td>Who it is intended for. A token for the payments API should be rejected by the reporting API.</td></tr>
<tr><td><code>exp</code> (expiration)</td><td>Unix seconds after which the token must be rejected. Not optional in practice - a token without it never dies.</td></tr>
<tr><td><code>nbf</code> (not before)</td><td>Unix seconds before which it is not yet valid.</td></tr>
<tr><td><code>iat</code> (issued at)</td><td>When it was created. Useful for a token-version or global-logout check.</td></tr>
<tr><td><code>jti</code> (JWT id)</td><td>A unique id for this token. The hook a denylist hangs on - see the Expert tab.</td></tr>
<tr><td>Custom claims</td><td>Anything you add: <code>roles</code>, <code>tenantId</code>, <code>email</code>. Keep them small and non-secret; every request carries them.</td></tr>
</table>
<br>

<strong>Claims are a cache, not a source of truth.</strong> A role baked into a token at 10:00 is still in that token at 10:14 even if you revoked it at 10:05. Short lifetimes are what keep the staleness window small.<br>`
        },

        {
            content: `<h3>Dependencies and the Signing Key</h3>
<strong>jjwt</strong> (Java JWT) is the usual library. Since 0.11 it ships as three artifacts - the API you compile against and two runtime implementations - so that your code depends only on interfaces.<br><br>

The signing key belongs in configuration, never in the source. HS256 requires <strong>at least 256 bits</strong> of key material; jjwt refuses anything shorter.<br>`,
            codeExamples: [
                `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>

<!-- The single "io.jsonwebtoken:jjwt:0.9.0" artifact is from 2018.
     On Java 11+ its first token generation throws
       java.lang.NoClassDefFoundError: javax/xml/bind/DatatypeConverter
     because it relied on a JAXB class removed from the JDK in Java 11.
     Use the split 0.12.x artifacts above. -->`,
                `# Generate a real key once, at the shell - do not invent one by typing:
#   openssl rand -base64 32
#   3rQ1n8vZk0YbTt7XwPq2Lc9GmHfEd4RsJuNaVyBiKzM=

# application.properties
app.jwt.secret=3rQ1n8vZk0YbTt7XwPq2Lc9GmHfEd4RsJuNaVyBiKzM=
app.jwt.issuer=javaschoollab
app.jwt.access-token-minutes=15
app.jwt.refresh-token-days=7

# In production this comes from an environment variable or a secrets
# manager, not from a file in the repository:
#   app.jwt.secret=\${JWT_SECRET}
#
# A signing key committed to git is a published key. Anyone with the
# repository can mint a token for any user, including an administrator -
# no password required, no login attempt logged.`
            ]
        },

        {
            content: `<h3>The Registration Endpoint</h3>
Registration writes a user row with a <strong>hashed</strong> password. Nothing about JWT is involved yet - the token flow only starts at login - but the two endpoints are always built together.<br><br>

<code>BCryptPasswordEncoder</code> is one-way and salts each hash itself, so two users with the same password get different stored values. The column must be at least 60 characters wide or the hash is truncated and nobody can ever log in.<br>`,
            codeExamples: [
                `@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, length = 60)     // bcrypt hash is exactly 60 chars
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles")
    private Set<String> roles = new HashSet<>();

    // Bumped on "log out everywhere" and on a password change.
    // The Expert tab explains why this one column is so useful.
    @Column(nullable = false)
    private int tokenVersion = 0;

    // getters and setters
}

// jakarta.persistence.* is Spring Boot 3.x.
// Spring Boot 2.x uses javax.persistence.* - same classes, renamed package.`,
                `@Service
public class RegistrationService {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;

    public RegistrationService(AppUserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Transactional
    public void register(RegisterRequest request) {
        // A friendly early check. The UNIQUE constraint on the column is the
        // real guarantee - two concurrent signups can both pass this line.
        if (users.existsByUsername(request.username())) {
            throw new UsernameTakenException(request.username());
        }

        AppUser user = new AppUser();
        user.setUsername(request.username());
        user.setPassword(encoder.encode(request.password()));   // never the raw value
        user.setRoles(Set.of("ROLE_USER"));                     // never from the request body
        users.save(user);
    }
}

// SECURITY NOTE: taking the role from the request body is a classic
// privilege-escalation hole -
//   POST /api/auth/register {"username":"x","password":"y","roles":["ROLE_ADMIN"]}
// The client must never be able to choose its own authority.`,
                `@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterRequest request) {
        registrationService.register(request);
    }
}

public record RegisterRequest(
        @NotBlank @Size(min = 4, max = 40) String username,
        @NotBlank @Size(min = 10, max = 100) String password) { }

// REQUEST  POST /api/auth/register
// { "username": "ajay", "password": "correct-horse-battery" }
//
// OUTPUT  201 Created   (no body)
//
// In the database:
// +----+----------+--------------------------------------------------------------+
// | id | username | password                                                     |
// +----+----------+--------------------------------------------------------------+
// |  1 | ajay     | $2a$10$N9qo8uLOickgx2ZMRZoMy.MHi9F4B7lJfkbJRJk3bckOa7CCFAQXO |
// +----+----------+--------------------------------------------------------------+
//
// Duplicate username:
// OUTPUT  409 Conflict  { "error": "username already taken" }`
            ]
        },

        {
            content: `<h3>The Login Endpoint - Issuing the Token</h3>
Login is the only place credentials are ever checked. It runs them through the <code>AuthenticationManager</code>, and only if that succeeds does it ask the token service for a token.<br><br>

<strong>Do not hash the password yourself here.</strong> The <code>DaoAuthenticationProvider</code> behind the manager loads the user, calls <code>PasswordEncoder.matches(raw, storedHash)</code> and throws <code>BadCredentialsException</code> on a mismatch. Reimplementing that loses the timing-attack protection it already has.<br>`,
            codeExamples: [
                `@Service
public class JwtService {

    private final SecretKey key;
    private final String issuer;
    private final long accessMillis;

    public JwtService(@Value("\${app.jwt.secret}") String base64Secret,
                      @Value("\${app.jwt.issuer}") String issuer,
                      @Value("\${app.jwt.access-token-minutes}") long minutes) {
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(base64Secret));
        this.issuer = issuer;
        this.accessMillis = minutes * 60_000L;
    }

    public String generateAccessToken(AppUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())          // jti - see revocation
                .issuer(issuer)                            // iss
                .subject(user.getUsername())               // sub
                .audience().add("javaschoollab-api").and() // aud
                .issuedAt(Date.from(now))                  // iat
                .expiration(Date.from(now.plusMillis(accessMillis)))  // exp
                .claim("roles", user.getRoles())           // custom
                .claim("ver", user.getTokenVersion())      // custom
                .signWith(key)
                .compact();
    }
}

// jjwt 0.12.x method names. On 0.11.x the builder reads
//   .setSubject(..) .setIssuedAt(..) .setExpiration(..)
//   .signWith(key, SignatureAlgorithm.HS256)
// and on the ancient 0.9.x, signWith(SignatureAlgorithm.HS256, "secret")
// took a raw String - which is how weak keys became so common.`,
                `@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository users;
    private final JwtService jwtService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.username(), request.password()));
        } catch (AuthenticationException e) {
            // Catch the SUPERTYPE. Catching only UsernameNotFoundException lets a
            // wrong PASSWORD (BadCredentialsException) escape and become a 500.
            throw new InvalidCredentialsException();
        }

        AppUser user = users.findByUsername(request.username()).orElseThrow();
        String access = jwtService.generateAccessToken(user);
        return new LoginResponse(access, "Bearer", 900);
    }
}

public record LoginRequest(@NotBlank String username, @NotBlank String password) { }
public record LoginResponse(String accessToken, String tokenType, long expiresIn) { }

// Never give the record a toString() that prints the password - a stray
// log line then writes plaintext credentials into your log aggregator.`,
                `// REQUEST  POST /api/auth/login
// { "username": "ajay", "password": "correct-horse-battery" }
//
// OUTPUT  200 OK
// {
//   "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI4YjNm...UifQ.qX3nO0kZ1s9d...",
//   "tokenType": "Bearer",
//   "expiresIn": 900
// }
//
// CONSOLE (show-sql=true):
// Hibernate: select a1_0.id,a1_0.password,a1_0.token_version,a1_0.username
//            from app_user a1_0 where a1_0.username=?
//
// REQUEST with a wrong password:
// OUTPUT  401 Unauthorized
// { "error": "invalid username or password" }
//
// Note the message does not say WHICH was wrong. "No such user" tells an
// attacker which usernames exist, which is half of a credential-stuffing run.`
            ]
        },

        {
            content: `<h3>Validating the Token on Every Request</h3>
Once the client has a token it sends it on every request in the <code>Authorization</code> header. A filter reads it, verifies the signature and expiry, and puts an <code>Authentication</code> into the <strong>SecurityContextHolder</strong> so the rest of the chain treats the caller as logged in.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">GET /api/orders     Authorization: Bearer eyJhbGciOiJIUzI1NiJ9....
   |
   v
+---------------------------------------------------------------+
| JwtAuthenticationFilter  (extends OncePerRequestFilter)        |
|                                                                |
|  1. header present and starts with "Bearer " ?  -- no --> skip |
|  2. parse + verify signature with the key      -- bad --> skip |
|  3. exp in the future ?                        -- no  --> skip |
|  4. build UsernamePasswordAuthenticationToken                  |
|  5. SecurityContextHolder.getContext().setAuthentication(...)  |
|                                                                |
|  6. chain.doFilter(request, response)   <-- ALWAYS, every path |
+---------------------------------------------------------------+
   |
   v
AuthorizationFilter   context empty -> 401 / 403
   |                  context populated -> check roles
   v
DispatcherServlet -> OrderController -> 200 OK</pre>
<br>

<strong>The filter never rejects anything itself.</strong> It either populates the context or leaves it empty; the authorization filter further down decides the outcome. Mixing those two responsibilities is what produces filters that return 403 where a 401 was correct.<br><br>

<code>OncePerRequestFilter</code> is the right base class because a forward or an <code>ERROR</code> dispatch would otherwise run the filter a second time on the same request.<br>`,
            codeExamples: [
                `public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService uds) {
        this.jwtService = jwtService;
        this.userDetailsService = uds;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // "Bearer " is 7 characters INCLUDING the space, which is what
        // substring(7) removes. Testing startsWith("Bearer") without the
        // space accepts "BearerXYZ" and then mangles the token.
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtService.parse(token);   // throws if invalid

                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails user = userDetailsService
                            .loadUserByUsername(claims.getSubject());

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    user, null, user.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource()
                            .buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (JwtException | IllegalArgumentException e) {
                // Expired, tampered, malformed. Leave the context empty and let
                // the authorization filter produce the 401. Do NOT sendError()
                // here - a permitAll endpoint would then break for a stale token.
                logger.debug("rejected token: " + e.getMessage());
            }
        }

        // CRITICAL: outside the if-block. Put it inside and any request with no
        // Authorization header - including POST /api/auth/login - is never
        // forwarded. Symptom in Postman: "Error: socket hang up", or an empty
        // 200 with no body and no exception anywhere in the log.
        chain.doFilter(request, response);
    }
}`,
                `// The parse method, in JwtService. Everything is verified here.
public Claims parse(String token) {
    return Jwts.parser()
            .verifyWith(key)                       // signature
            .requireIssuer(issuer)                 // iss must match
            .requireAudience("javaschoollab-api")  // aud must match
            .clockSkewSeconds(60)                  // tolerate 60s of drift
            .build()
            .parseSignedClaims(token)              // throws unless everything holds
            .getPayload();
}

// parseSignedClaims throws a specific exception per failure:
//   SignatureException       - the signature does not match the key (tampered,
//                              or signed by someone else)
//   ExpiredJwtException      - exp is in the past
//   MalformedJwtException    - not three dot-separated base64 segments
//   UnsupportedJwtException  - e.g. an unsigned token where a signed one is required
//   IncorrectClaimException  - iss or aud did not match what we required
// All extend JwtException, so one catch covers them.
//
// NEVER use parseClaimsJwt / parseUnsecuredClaims to "just read the subject".
// Those skip signature verification entirely, which means trusting a payload
// the caller wrote.`
            ]
        },

        {
            content: `<h3>Wiring It Into the SecurityFilterChain</h3>
Three things make the application a stateless token API: the filter is registered before the username/password filter, the session policy is <code>STATELESS</code>, and the login and registration endpoints are open.<br><br>

The filter is declared as a plain <code>@Bean</code> rather than a <code>@Component</code> on purpose. A <code>Filter</code> bean in the context is picked up by Boot's servlet auto-registration and installed in the <em>container's</em> chain as well, so it runs twice - once outside Spring Security and once inside. Declaring it here keeps it in one chain only.<br>`,
            codeExamples: [
                `@Configuration
@EnableWebSecurity
@EnableMethodSecurity          // enables @PreAuthorize
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtFilter) throws Exception {
        return http
            // No session cookie exists, so there is no ambient credential for a
            // cross-site form post to ride on. This is why disabling CSRF is
            // acceptable HERE and is not a general licence to disable it.
            .csrf(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .anyRequest().authenticated())

            .sessionManagement(sm -> sm
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Without an entry point Spring's default for an unauthenticated
            // request on a stateless chain is a confusing 403. Say 401.
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint((req, res, e) ->
                            res.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                                          "authentication required")))

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(JwtService jwtService,
                                                           UserDetailsService uds) {
        return new JwtAuthenticationFilter(jwtService, uds);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration c)
            throws Exception {
        return c.getAuthenticationManager();
    }
}`,
                `// --- 1. Register -------------------------------------------------------
// POST /api/auth/register  { "username":"ajay", "password":"correct-horse-battery" }
// OUTPUT: 201 Created

// --- 2. Protected endpoint with NO token -------------------------------
// GET /api/orders
// OUTPUT: 401 Unauthorized

// --- 3. Log in ---------------------------------------------------------
// POST /api/auth/login  { "username":"ajay", "password":"correct-horse-battery" }
// OUTPUT: 200 OK { "accessToken":"eyJ...", "tokenType":"Bearer", "expiresIn":900 }

// --- 4. Protected endpoint WITH the token ------------------------------
// GET /api/orders
// Header: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhamF5Ii...
// OUTPUT: 200 OK  [ { "id": 1, "total": 499.00 } ]

// --- 5. Admin endpoint as ROLE_USER ------------------------------------
// GET /api/admin/users
// Header: Authorization: Bearer eyJ... (the same valid token)
// OUTPUT: 403 Forbidden
// Authenticated, but not authorised. 401 would be wrong here.

// --- 6. Tampered token -------------------------------------------------
// Take the token, base64-decode the payload, change "ROLE_USER" to
// "ROLE_ADMIN", re-encode, paste it back.
// OUTPUT: 401 Unauthorized
// io.jsonwebtoken.security.SignatureException: JWT signature does not match
//   locally computed signature
// The payload IS editable - the signature is what makes the edit useless.

// --- 7. Expired token (wait 15 minutes) --------------------------------
// OUTPUT: 401 Unauthorized
// io.jsonwebtoken.ExpiredJwtException: JWT expired 42 seconds ago`
            ]
        },

        {
            content: `<h3>Role-Based Authorization From the Token's Claims</h3>
The authorities in the <code>SecurityContext</code> come from the token's <code>roles</code> claim (or from the database lookup the filter does). Once they are there, both URL rules and method annotations work exactly as they do with any other authentication mechanism.<br><br>

<div class="border">
Spring Security's <code>hasRole("ADMIN")</code> checks for the authority <strong>ROLE_ADMIN</strong> - it prepends the prefix for you. <code>hasAuthority("ADMIN")</code> does not. Storing "ADMIN" and asking for <code>hasRole("ADMIN")</code> is the single most common cause of a 403 that "makes no sense".
</div><br>`,
            codeExamples: [
                `// Reading authorities straight out of the claims - no database hit at all.
// This is the fully stateless variant: the filter builds the Authentication
// from the token alone.
@SuppressWarnings("unchecked")
private List<GrantedAuthority> authorities(Claims claims) {
    List<String> roles = claims.get("roles", List.class);
    if (roles == null) return List.of();
    return roles.stream()
            .map(SimpleGrantedAuthority::new)   // values are stored WITH the
            .collect(Collectors.toList());      // "ROLE_" prefix already
}

// TRADE-OFF, and it is a real one:
//   claims only    - zero queries per request, but a role revoked at 10:05 is
//                    still honoured until the token expires.
//   DB lookup      - one SELECT per request (index the username column), and
//                    revocation takes effect immediately.
// Short-lived access tokens are what make the first option defensible.`,
                `@RestController
@RequestMapping("/api")
public class OrderController {

    @GetMapping("/orders")
    public List<Order> myOrders(Authentication authentication) {
        // The principal is whatever the filter put in the context.
        return orders.findByOwner(authentication.getName());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/orders/{id}")
    public void delete(@PathVariable Long id) {
        orders.deleteById(id);
    }

    @PreAuthorize("hasRole('ADMIN') or #username == authentication.name")
    @GetMapping("/users/{username}/orders")
    public List<Order> ordersOf(@PathVariable String username) {
        // An admin sees anyone's orders; a normal user sees only their own.
        return orders.findByOwner(username);
    }
}
// OUTPUT:
// ROLE_USER  DELETE /api/admin/orders/7          -> 403, method body never runs
// ROLE_ADMIN DELETE /api/admin/orders/7          -> 204
// ajay       GET /api/users/ajay/orders          -> 200
// ajay       GET /api/users/someone-else/orders  -> 403`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Signed, Not Encrypted - the Point Everyone Misses</h3>
This is the first thing to get right, because most JWT mistakes descend from it. A standard JWT (a <strong>JWS</strong>, JSON Web Signature) is <strong>signed</strong>. The payload is Base64URL, which is an encoding, not a cipher. There is no key involved in reading it.<br><br>

<table>
<tr><th>Property</th><th>Does a JWS give it to you?</th></tr>
<tr><td>Integrity - nobody edited the claims</td><td>Yes. That is what the signature is for.</td></tr>
<tr><td>Authenticity - it was issued by the key holder</td><td>Yes.</td></tr>
<tr><td>Confidentiality - nobody can read the claims</td><td><strong>No.</strong> Everyone can read them. Always.</td></tr>
</table>
<br>

So a JWT payload is visible to: the browser's JavaScript, browser devtools, any proxy on the path, your access logs if you ever log a URL containing a token, an APM tool, a screenshot in a bug report, and anyone the user pastes it to. Everything you put in it is public to whoever holds the token.<br><br>

<div class="border">
<strong>Never place in a JWT:</strong> a password or password hash, a card number, an API key or database credential, a national identity number, medical or salary data, an internal host name or connection string, anything under a data-protection regime.<br>
<strong>Do place:</strong> a user id, a username, roles or scopes, a tenant id, expiry - identifiers, not secrets.
</div><br>

If the claims genuinely must be hidden, the answer is <strong>JWE</strong> (JSON Web Encryption), a different structure with five segments rather than three. In most systems the better answer is not to put the secret in the token.<br>`,
            codeExamples: [
                `// Proof, in four lines, that a JWT hides nothing.
// Paste any token into jwt.io - or do it yourself:

$ echo 'eyJzdWIiOiJhamF5Iiwicm9sZXMiOlsiUk9MRV9BRE1JTiJdLCJjYXJkIjoiNDExMTExMTExMTExMTExMSJ9' \\
    | base64 -d
// OUTPUT:
// {"sub":"ajay","roles":["ROLE_ADMIN"],"card":"4111111111111111"}

// The card number was never protected for a single millisecond. The signature
// stops an attacker CHANGING that value; it does nothing to stop them READING it.

// The reverse mistake is just as common - a developer sees the signature
// verification fail and "fixes" it:
Claims claims = Jwts.parser().build()
        .parseUnsecuredClaims(token).getPayload();   // NO KEY, NO VERIFICATION
// Now anyone forges any identity by base64-encoding a JSON object of their
// choosing. This is a total authentication bypass, and it looks like working
// code in a review because nothing throws.`
            ]
        },

        {
            content: `<h3><code>alg=none</code> and Algorithm Confusion</h3>
The header carries the algorithm - and the header is written by whoever sends the token. A verifier that trusts it is trusting the attacker.<br><br>

<table>
<tr><th>Attack</th><th>How it works</th></tr>
<tr><td><strong>alg=none</strong></td><td>The RFC defines an "unsecured JWT" with <code>"alg":"none"</code> and an empty signature. An attacker takes a real token, rewrites the payload to <code>"roles":["ROLE_ADMIN"]</code>, sets the header algorithm to <code>none</code>, drops the signature and sends it. A library that honours the header verifies nothing and accepts it.</td></tr>
<tr><td><strong>RS256 to HS256 confusion</strong></td><td>The server verifies RS256 with an RSA <em>public</em> key, which is public by definition. The attacker changes the header to <code>HS256</code> and signs the forged token with that public key as the HMAC secret. A verifier that picks the algorithm from the header uses the same public key as an HMAC key - and the signature checks out.</td></tr>
<tr><td><strong>Key confusion via <code>jku</code>/<code>jwk</code></strong></td><td>Those header parameters name (or embed) the key to verify with. A verifier that fetches the key the token points at lets the attacker supply their own key. Never resolve a verification key from the token.</td></tr>
</table>
<br>

<strong>The rule: pin the expected algorithm and the expected key on the verifier side, and ignore what the header asks for.</strong> Current jjwt is safe by default - <code>verifyWith(SecretKey)</code> only accepts the MAC algorithms that key supports, and <code>parseSignedClaims</code> rejects an unsecured token. The vulnerable pattern is code that reads the header first and then chooses.<br>`,
            codeExamples: [
                `// The forged token, step by step. Nothing here requires a key.
//
//   header  {"alg":"none","typ":"JWT"}
//   payload {"sub":"ajay","roles":["ROLE_ADMIN"],"exp":9999999999}
//   token   eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhamF5Iiwicm9sZXMiOlsi...fQ.
//                                                                                    ^
//                                                        trailing dot, empty signature

// SAFE - a signed-claims parser refuses it outright:
Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
// OUTPUT:
// io.jsonwebtoken.UnsupportedJwtException: Unsecured JWSs (those with an
//   'alg' header value of 'none') are disallowed by this parser.

// UNSAFE - the shape to look for in a code review:
String alg = readHeader(token).get("alg");     // attacker-controlled
if ("none".equals(alg)) {
    return decodePayload(token);               // total bypass
} else if ("HS256".equals(alg)) {
    ...
}
// Also unsafe: any library call that resolves the key from the token's own
// header (jku, jwk, x5u) without an allow-list of trusted key sources.`,
                `// Pinning the algorithm explicitly, so a header change cannot alter the check.
// Belt and braces on top of jjwt's defaults, and it documents the intent.
public Claims parse(String token) {
    Jws<Claims> jws = Jwts.parser()
            .verifyWith(key)
            .requireIssuer(issuer)
            .requireAudience(audience)
            .clockSkewSeconds(60)
            .build()
            .parseSignedClaims(token);

    // Reject anything that is not the one algorithm we issue.
    if (!Jwts.SIG.HS256.getId().equals(jws.getHeader().getAlgorithm())) {
        throw new JwtException("unexpected algorithm: "
                + jws.getHeader().getAlgorithm());
    }
    return jws.getPayload();
}

// The same idea in Spring Security's resource-server support - one line,
// and no hand-rolled parsing at all:
@Bean
JwtDecoder jwtDecoder(@Value("\${app.jwt.secret}") String base64Secret) {
    SecretKey key = new SecretKeySpec(
            Base64.getDecoder().decode(base64Secret), "HmacSHA256");
    return NimbusJwtDecoder.withSecretKey(key)
            .macAlgorithm(MacAlgorithm.HS256)   // pinned
            .build();
}`
            ]
        },

        {
            content: `<h3>HS256 or RS256 - Symmetric Against Asymmetric</h3>
<table>
<tr><th></th><th>HS256 (HMAC-SHA256)</th><th>RS256 / ES256 (RSA / ECDSA)</th></tr>
<tr><td>Keys</td><td>One shared secret, used to sign and to verify</td><td>A private key signs; the public key verifies</td></tr>
<tr><td>Who can mint tokens</td><td>Anyone who can verify one</td><td>Only the holder of the private key</td></tr>
<tr><td>Key distribution</td><td>Every verifier needs the secret, so every verifier is a place it can leak from</td><td>The public key can be published - typically at a JWKS endpoint</td></tr>
<tr><td>Token size and CPU</td><td>Small signature, very fast</td><td>Larger signature (256 bytes for RSA-2048), slower to sign; ES256 is compact and fast</td></tr>
<tr><td>Key rotation</td><td>Coordinated - every service must swap at once</td><td>Independent - publish the new public key with a new <code>kid</code>, verifiers pick it up</td></tr>
<tr><td>Fits</td><td>A single service, or a monolith, that both issues and verifies</td><td>An auth server plus several resource services; anything third parties verify</td></tr>
</table>
<br>

<strong>The decisive question is: how many services need to verify?</strong> With HS256 and five microservices, the signing secret is deployed to five places. Any one of them, compromised, can mint an admin token for the whole estate - and you cannot tell from the token which service issued it. With RS256 the private key lives in exactly one process and the other four hold only a public key, which is harmless if it leaks.<br><br>

<strong>The <code>kid</code> header.</strong> Rotation needs the verifier to know which key signed a given token. Put a key id in the header, keep a map of active keys, and rotation becomes: publish the new key, start signing with it, and retire the old one once every token signed with it has expired.<br>`,
            codeExamples: [
                `// RS256: sign with the private key, verify with the public one.
@Service
public class RsaJwtService {

    private final PrivateKey privateKey;   // auth server only, never shipped out
    private final PublicKey publicKey;     // safe to publish

    public String issue(AppUser user) {
        return Jwts.builder()
                .header().keyId("2026-09").and()      // kid, for rotation
                .subject(user.getUsername())
                .claim("roles", user.getRoles())
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(15, ChronoUnit.MINUTES)))
                .signWith(privateKey, Jwts.SIG.RS256)
                .compact();
    }
}

// A resource service holds ONLY the public key:
public Claims verify(String token) {
    return Jwts.parser()
            .verifyWith(publicKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
}
// Leaking the public key costs nothing. Leaking an HS256 secret from any one
// of N services gives the attacker the power to impersonate every user in
// all N of them.`,
                `// In practice, once you are asymmetric, let Spring Security fetch the keys.
# application.yml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          # The provider publishes its public keys here. Spring caches them,
          # matches the token's "kid", and picks up rotated keys with no
          # deployment on your side.
          jwk-set-uri: https://auth.example.com/.well-known/jwks.json
          issuer-uri: https://auth.example.com
          audiences: javaschoollab-api

// OUTPUT (behaviour): no filter, no JwtService, no key file. Signature,
// exp, nbf, iss and aud are all validated by the framework, and an
// unknown "kid" triggers one refresh of the JWKS rather than a rejection.`
            ]
        },

        {
            content: `<h3>The Revocation Problem</h3>
Here is the honest trade of stateless auth. <strong>A signed token cannot be un-signed.</strong> "Log out" on the client deletes the token from that client; the token itself remains valid until <code>exp</code>. If it was copied - XSS, a shared machine, a proxy log - deleting the client's copy achieves nothing.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">10:00  token issued to ajay,  exp = 20:00   (a 10-hour token)
10:05  ajay's laptop is stolen with the token in localStorage
10:06  admin disables the ajay account in the database
10:07  attacker sends the stolen token
       -> signature valid, exp valid, no database is consulted
       -> 200 OK

       The account is disabled. The token still works.
       It keeps working until 20:00.</pre>
<br>

There is no clever way out: any real revocation requires <strong>server-side state</strong>, which is the very thing the token was meant to avoid. The engineering choice is how much state, and where.<br><br>

<table>
<tr><th>Approach</th><th>How it trades off</th></tr>
<tr><td><strong>Short-lived access token + refresh token</strong></td><td>The main answer. Access token 5-15 minutes, refresh token days. Revocation is applied at refresh time, so the worst-case exposure is one access-token lifetime. No per-request state.</td></tr>
<tr><td><strong>Denylist keyed by <code>jti</code></strong></td><td>On logout or compromise, store the token's <code>jti</code> in Redis with a TTL equal to its remaining lifetime; the filter checks membership. Immediate and precise. Costs one lookup per request, and the auth path now depends on Redis being up.</td></tr>
<tr><td><strong>Token-version claim</strong></td><td>Put <code>ver</code> in the token and a <code>token_version</code> column on the user. Bump the column to invalidate every token that user holds. One cheap comparison, no extra infrastructure - and it is all-or-nothing per user, which is exactly right for "log out everywhere" and a password change.</td></tr>
<tr><td><strong>Allowlist of issued tokens</strong></td><td>Store every live token server-side and check each request. Correct, immediate, and you have re-invented sessions with worse ergonomics. If you need this, use Spring Session and a shared store honestly.</td></tr>
</table>
<br>

<strong>What to do in practice:</strong> short access tokens plus a stored, revocable refresh token, and a token-version claim for account-wide invalidation. Reach for the <code>jti</code> denylist only when a single-token, immediate kill switch is a stated requirement.<br>`,
            codeExamples: [
                `// Token-version check: one integer comparison, no new infrastructure.
// Invalidates EVERY access token a user holds, the moment it is bumped.

@Transactional
public void logoutEverywhere(String username) {
    AppUser user = users.findByUsername(username).orElseThrow();
    user.setTokenVersion(user.getTokenVersion() + 1);   // that is the whole trick
    refreshTokens.deleteByUser(user);
}

// In the filter, after the signature check:
int tokenVersion = claims.get("ver", Integer.class);
AppUser user = users.findByUsername(claims.getSubject()).orElseThrow();
if (tokenVersion != user.getTokenVersion()) {
    throw new JwtException("token superseded");
}
// OUTPUT:
// before bump: GET /api/orders -> 200 OK
// after bump : GET /api/orders -> 401 Unauthorized  (same token, same signature)
//
// It costs the per-request user lookup back, so it is worth pairing with a
// short-lived cache. Do a password change this way too: changing the password
// while old tokens keep working is a security bug users assume you do not have.`,
                `// jti denylist in Redis - immediate, per-token revocation.
@Service
public class TokenDenyList {

    private final StringRedisTemplate redis;

    public void revoke(String jti, Instant expiry) {
        long ttl = Duration.between(Instant.now(), expiry).toSeconds();
        if (ttl > 0) {
            // The TTL means the entry disappears exactly when the token would
            // have expired anyway. The list can never grow without bound.
            redis.opsForValue().set("revoked:" + jti, "1", ttl, TimeUnit.SECONDS);
        }
    }

    public boolean isRevoked(String jti) {
        return Boolean.TRUE.equals(redis.hasKey("revoked:" + jti));
    }
}

// In the filter:
if (denyList.isRevoked(claims.getId())) {
    throw new JwtException("token revoked");
}

// COST, stated plainly: one Redis round trip on every authenticated request,
// and if Redis is unreachable you must choose between failing closed (the API
// is down) and failing open (revocation silently stops working). Decide that
// deliberately and write the decision down - the default of "whatever the
// exception handler does" is nearly always fail-open.`
            ]
        },

        {
            content: `<h3>Refresh Tokens, Rotation and Reuse Detection</h3>
Splitting the credential in two is what makes short access-token lifetimes tolerable. The <strong>access token</strong> is a short-lived JWT sent to every endpoint; the <strong>refresh token</strong> is long-lived, sent only to the refresh endpoint, and - unlike the access token - is <em>stored server-side</em> so it can be revoked.<br><br>

<div class="border">
A refresh token that is itself a self-validating JWT gains you nothing. Its whole purpose is to be revocable, and that requires a row in a table. Store an opaque random string (or its hash), not a JWT.
</div><br>

<strong>Rotation</strong>: every refresh returns a <em>new</em> refresh token and invalidates the one presented. This bounds the value of a stolen refresh token to a single use.<br><br>

<strong>Reuse detection</strong> is what turns rotation into a defence rather than a formality. If an already-used refresh token is presented, exactly one of two things has happened: the legitimate client is retrying after a lost response, or an attacker is replaying a stolen token. You cannot tell which - so you revoke the entire family and force a fresh login.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   client                                            server
     |-- POST /login ------------------------------->|
     |<-- access A1 (15 min) + refresh R1 (7 days) --|   R1 stored, family F
     |                                               |
     |  ... 15 minutes pass, A1 expires ...          |
     |-- POST /refresh  { R1 } --------------------->|   R1 valid & unused
     |<-- access A2 + refresh R2 --------------------|   R1 marked USED, R2 stored
     |                                               |
  ~~ attacker stole R1 earlier and replays it ~~     |
     |-- POST /refresh  { R1 } --------------------->|   R1 already USED
     |<-- 401, and family F is revoked entirely -----|   R2 killed too
     |                                               |
     |  the real user's next refresh with R2 fails,  |
     |  they log in again - and you have a signal    |
     |  that a token was stolen, which is the point. |</pre>`,
            codeExamples: [
                `@Entity
@Table(name = "refresh_token")
public class RefreshToken {

    @Id private Long id;

    // Store a HASH, not the token. If the table leaks, the rows are useless -
    // the same reasoning that applies to passwords applies here.
    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;              // SHA-256 hex of the opaque value

    @ManyToOne(optional = false) private AppUser user;

    @Column(nullable = false) private String familyId;  // survives rotation
    @Column(nullable = false) private Instant expiresAt;
    @Column(nullable = false) private boolean used = false;
    @Column(nullable = false) private boolean revoked = false;
}

// The token itself is opaque randomness, not a JWT:
private String newOpaqueToken() {
    byte[] bytes = new byte[32];
    new SecureRandom().nextBytes(bytes);            // NOT java.util.Random
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
}
// OUTPUT: "sT9x2LmQvR4kZ0bYpNfW7cJgHdE1aUoI3tXsMvKrBnQ"`,
                `@Transactional
public TokenPair refresh(String presented) {

    RefreshToken stored = refreshTokens.findByTokenHash(sha256(presented))
            .orElseThrow(() -> new InvalidRefreshTokenException());

    // REUSE DETECTION - the heart of the scheme.
    if (stored.isUsed() || stored.isRevoked()) {
        refreshTokens.revokeFamily(stored.getFamilyId());
        log.warn("refresh token reuse detected for user {} family {}",
                 stored.getUser().getUsername(), stored.getFamilyId());
        throw new TokenReuseException();
    }
    if (stored.getExpiresAt().isBefore(Instant.now())) {
        throw new InvalidRefreshTokenException();
    }

    stored.setUsed(true);                                   // rotate
    String next = newOpaqueToken();
    refreshTokens.save(newRow(stored.getUser(), sha256(next),
                              stored.getFamilyId()));

    return new TokenPair(jwtService.generateAccessToken(stored.getUser()), next);
}
// OUTPUT, normal path:
// POST /api/auth/refresh { "refreshToken": "sT9x..." }
// 200 OK { "accessToken": "eyJ...", "refreshToken": "pM4c..." }
//
// OUTPUT, replay of an already-used token:
// 401 Unauthorized { "error": "token reuse detected, please sign in again" }
// WARN  refresh token reuse detected for user ajay family 8b3f-...
//
// A CAVEAT worth knowing: a client that fires two refreshes concurrently
// (two tabs, or a retry after a lost response) trips this legitimately.
// A short grace window - accept a token used within the last few seconds and
// return the same new pair - removes the false positives without weakening
// detection meaningfully.`
            ]
        },

        {
            content: `<h3>Where the Browser Should Keep the Token</h3>
There is no option here without a real weakness, and pretending otherwise is how bad advice spreads. Both common answers are vulnerable to something.<br><br>

<table>
<tr><th></th><th><code>localStorage</code> / <code>sessionStorage</code></th><th>httpOnly cookie</th></tr>
<tr><td>Readable by JavaScript</td><td>Yes - so any XSS on your origin exfiltrates the token</td><td>No - <code>httpOnly</code> hides it from <code>document.cookie</code></td></tr>
<tr><td>Sent automatically by the browser</td><td>No - your code attaches it, so cross-site requests carry nothing</td><td>Yes - which is precisely what CSRF exploits</td></tr>
<tr><td>Needs CSRF defence</td><td>No</td><td>Yes - <code>SameSite</code>, and a CSRF token for anything not fully same-site</td></tr>
<tr><td>Works cross-origin / for mobile clients</td><td>Straightforwardly</td><td>Awkward - third-party cookie rules, CORS credentials, no cookie jar on a native client</td></tr>
<tr><td>Survives a tab close</td><td><code>localStorage</code> yes, <code>sessionStorage</code> no</td><td>Depends on Max-Age</td></tr>
</table>
<br>

<strong>The actual trade-off:</strong> <code>localStorage</code> is exposed to XSS; an httpOnly cookie is exposed to CSRF. Neither is strictly safer - they fail to different attacks. The difference in severity is that XSS is <em>strictly worse</em> when it happens: script running on your origin can read the token, make authenticated requests, and read the responses. CSRF makes a request but cannot read the reply, and <code>SameSite=Strict</code> or <code>Lax</code> defeats most of it at the cost of a browser-compatibility floor.<br><br>

<div class="border">
<strong>A defensible position, not a slogan:</strong><br>
• Same-site web app: an <code>httpOnly; Secure; SameSite=Strict</code> cookie for the <em>refresh</em> token, and the access token in JavaScript memory only (a variable, not <code>localStorage</code>) - it dies with the tab and never lands in storage an XSS payload can read at leisure.<br>
• Cross-origin SPA, mobile app or third-party client: the <code>Authorization</code> header, with a short access-token lifetime.<br>
• Either way: if you have XSS, you have lost. A cookie only means the attacker rides the session from your page instead of stealing the token - Content-Security-Policy and output encoding are the real defence.
</div><br>

<strong>Never put a token in a URL.</strong> Query strings land in access logs, browser history, and the <code>Referer</code> header sent to every third-party asset on the page.<br>`,
            codeExamples: [
                `// Refresh token in a hardened cookie; access token returned in the body
// for the client to hold in memory.
ResponseCookie cookie = ResponseCookie.from("refresh_token", opaqueValue)
        .httpOnly(true)        // invisible to document.cookie
        .secure(true)          // HTTPS only - a cookie sent over http is readable
        .sameSite("Strict")    // not attached to cross-site requests: CSRF defence
        .path("/api/auth/refresh")   // sent ONLY to the endpoint that needs it
        .maxAge(Duration.ofDays(7))
        .build();

return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(new LoginResponse(accessToken, "Bearer", 900));

// The narrow "path" matters: with path=/ the refresh token is attached to
// every request to your API, multiplying the number of places it can leak.

// Logout must clear it server-side AND client-side. Deleting the cookie
// alone leaves a working refresh token in the attacker's copy.
refreshTokenService.revokeFamily(familyId);
ResponseCookie cleared = ResponseCookie.from("refresh_token", "")
        .httpOnly(true).secure(true).sameSite("Strict")
        .path("/api/auth/refresh").maxAge(0).build();`
            ]
        },

        {
            content: `<h3>Expiry, Clock Skew and Other Sharp Edges</h3>
<table>
<tr><th>Issue</th><th>What happens, and what to do</th></tr>
<tr><td><strong>Clock skew</strong></td><td><code>exp</code> and <code>nbf</code> are absolute times compared against the <em>verifier's</em> clock. If the issuing server is 30 seconds ahead, a freshly minted token has an <code>nbf</code>/<code>iat</code> in the verifier's future and is rejected as not-yet-valid - an intermittent 401 that reproduces nowhere. Allow 30-60 seconds of leeway (<code>clockSkewSeconds</code>) and run NTP. Leeway is not a substitute for synchronised clocks.</td></tr>
<tr><td><strong>Seconds, not milliseconds</strong></td><td><code>exp</code>, <code>iat</code> and <code>nbf</code> are Unix <em>seconds</em>. Writing <code>System.currentTimeMillis()</code> into <code>exp</code> yields a token expiring in the year 56000 - it never expires, and no library warns you.</td></tr>
<tr><td><strong>No <code>exp</code> at all</strong></td><td>A token with no expiry is a permanent credential. Most libraries accept it happily. Always set it, and reject tokens that lack it.</td></tr>
<tr><td><strong>Lifetime too long</strong></td><td>10 hours is common in tutorials and indefensible in production: it is the exact window during which a stolen token works and nothing can stop it. 5-15 minutes for an access token.</td></tr>
<tr><td><strong>Claim bloat</strong></td><td>Every claim is sent on every request, base64-expanded by a third. Fifty permissions in a token can push it past a proxy's header limit and produce <code>431 Request Header Fields Too Large</code> - or a silent truncation.</td></tr>
<tr><td><strong>Logging tokens</strong></td><td>An <code>Authorization</code> header in a debug log or an APM trace is a live credential sitting in a system with far broader access than the API. Mask it at the logging layer.</td></tr>
<tr><td><strong>Trusting <code>sub</code> without verifying</strong></td><td>Reading the subject before the signature check - or with an unsecured parser - is an authentication bypass. Verify first, read second, always in that order.</td></tr>
<tr><td><strong>No <code>aud</code> check</strong></td><td>A token minted for the marketing API is accepted by the payments API because both trust the same issuer. Require the audience.</td></tr>
</table>`,
            codeExamples: [
                `// The units bug, which survives code review because it looks right.
Date expiry = new Date(System.currentTimeMillis() + 900_000);   // CORRECT
Jwts.builder().expiration(expiry)...            // jjwt converts to seconds

// Hand-built claims map - this is where it goes wrong:
claims.put("exp", System.currentTimeMillis() + 900_000);   // WRONG: milliseconds
// OUTPUT: {"exp":1756900900000}
//   -> interpreted as seconds -> expires 21 May 57648
//   -> the token never expires and nothing anywhere complains

claims.put("exp", Instant.now().plusSeconds(900).getEpochSecond());  // right`,
                `// Clock skew, reproduced and then handled.
// Issuer clock 45s ahead of the verifier:
//
// OUTPUT without leeway:
// io.jsonwebtoken.PrematureJwtException: JWT was not accepted before
//   2026-09-03T10:15:45Z. Current time: 2026-09-03T10:15:00Z
//   a difference of 45000 milliseconds.
//
// And at the other end of the lifetime:
// io.jsonwebtoken.ExpiredJwtException: JWT expired 3 seconds ago

Jwts.parser()
    .verifyWith(key)
    .clockSkewSeconds(60)      // tolerate a minute either way
    .build()
    .parseSignedClaims(token);

// Distinguish expiry from a bad signature in the response. Both are 401, but
// "token expired" tells an honest client to refresh, while a bad signature is
// worth an alert - it means someone is editing tokens.
catch (ExpiredJwtException e) {
    response.setHeader("WWW-Authenticate",
        "Bearer error=\\"invalid_token\\", error_description=\\"expired\\"");
}`
            ]
        },

        {
            content: `<h3>Role-Based Against Permission-Based Authorization</h3>
<code>hasRole('ADMIN')</code> is easy to write and ages badly. The role is a label for a bundle of capabilities, and the moment the bundle needs to differ for one customer you end up with <code>ROLE_ADMIN_LITE</code> and a checked-in list of exceptions.<br><br>

<table>
<tr><th></th><th>Role-based</th><th>Permission-based (scopes/authorities)</th></tr>
<tr><td>The check reads</td><td><code>hasRole('ADMIN')</code></td><td><code>hasAuthority('order:delete')</code></td></tr>
<tr><td>Changing what a role can do</td><td>Edit every endpoint that names the role, and redeploy</td><td>Edit the role-to-permission mapping in data; the endpoints do not change</td></tr>
<tr><td>Reading the code</td><td>"Only admins" - but what is an admin allowed to do? Nobody can say without grepping.</td><td>The annotation states the capability the endpoint requires. Self-documenting.</td></tr>
<tr><td>Token size</td><td>Two or three roles</td><td>Potentially dozens of strings - which is the real cost</td></tr>
<tr><td>Fits</td><td>Small applications, few and stable roles</td><td>Multi-tenant products, anything where customers configure their own roles</td></tr>
</table>
<br>

The usual arrangement: <strong>roles are how permissions are administered; permissions are what the code checks.</strong> Roles map to permissions in the database, the token carries the resolved permissions (or the role, with the service resolving it), and every endpoint names a capability.<br><br>

<strong>Neither answers "may this user touch <em>this</em> row".</strong> That is an ownership question and no claim in a token can settle it - the token says what you may do, not to what. Check ownership in the service, against the loaded entity.<br>`,
            codeExamples: [
                `// Permissions in the token, checked with hasAuthority.
// Note: hasRole('X') looks for the authority "ROLE_X" - it adds the prefix.
// hasAuthority('X') looks for exactly "X". Mixing them is the classic 403.

// Claim: "perms": ["order:read","order:write","invoice:read"]
List<GrantedAuthority> authorities(Claims claims) {
    List<String> perms = claims.get("perms", List.class);
    return perms.stream().map(SimpleGrantedAuthority::new).toList();
}

@PreAuthorize("hasAuthority('order:delete')")
@DeleteMapping("/api/orders/{id}")
public void delete(@PathVariable Long id) { ... }

// OUTPUT:
// token with perms ["order:read"]                -> 403 Forbidden
// token with perms ["order:read","order:delete"] -> 204 No Content
//
// Granting a customer's manager the delete capability is now a row in the
// role_permission table, not a code change and a release.`,
                `// Ownership is a separate question, and the token cannot answer it.
// WRONG - any authenticated user deletes any order:
@PreAuthorize("hasAuthority('order:delete')")
public void delete(Long id) { orders.deleteById(id); }
//   attacker with a valid token: DELETE /api/orders/7   -> 204
//   order 7 belonged to somebody else. This is IDOR (insecure direct
//   object reference), and it is one of the most common API flaws there is.

// RIGHT - capability from the token, ownership from the data:
@PreAuthorize("hasAuthority('order:delete')")
@Transactional
public void delete(Long id, Authentication auth) {
    Order order = orders.findById(id).orElseThrow(OrderNotFoundException::new);
    if (!order.getOwner().equals(auth.getName())
            && !hasAuthority(auth, "order:delete:any")) {
        // 404, not 403: a 403 confirms the id exists, which leaks
        // information an attacker can enumerate with.
        throw new OrderNotFoundException();
    }
    orders.delete(order);
}

// Or push it into the query, so the check cannot be forgotten:
//   Optional<Order> findByIdAndOwner(Long id, String owner);`
            ]
        },

        {
            content: `<h3>Do Not Hand-Roll This</h3>
Everything above is worth understanding, and in most real projects you should not write it. Spring Security ships an <strong>OAuth2 resource server</strong> that does token validation properly, and an authorization server or an identity provider (Keycloak, Auth0, Cognito, Entra ID) that does issuance, refresh, rotation, revocation, MFA and key rotation.<br><br>

<table>
<tr><th>Concern</th><th>Hand-rolled filter</th><th><code>oauth2-resource-server</code></th></tr>
<tr><td>Signature and algorithm pinning</td><td>Yours to get right</td><td>Built in, safe by default</td></tr>
<tr><td>exp / nbf / iss / aud validation</td><td>Yours, and commonly incomplete</td><td>Configured, with skew handling</td></tr>
<tr><td>Key rotation</td><td>A deployment</td><td>JWKS fetched and cached, <code>kid</code> matched automatically</td></tr>
<tr><td>Claim-to-authority mapping</td><td>Hand-written</td><td><code>JwtAuthenticationConverter</code></td></tr>
<tr><td>Error responses</td><td>Whatever your filter does</td><td>RFC 6750 <code>WWW-Authenticate</code> with proper error codes</td></tr>
<tr><td>Opaque-token introspection</td><td>Not supported</td><td>One property change</td></tr>
<tr><td>Login, refresh, rotation, MFA, password reset</td><td>All yours, forever</td><td>The identity provider's problem</td></tr>
</table>
<br>

<strong>Write the filter when</strong> you are learning how this works, or the application is genuinely small and self-contained and adding an identity provider is disproportionate. <strong>Use the framework when</strong> more than one service verifies tokens, when tokens come from an external provider, or when the system holds anything worth stealing. "We wrote our own JWT filter" is a finding in a security review, not a boast.<br>`,
            codeExamples: [
                `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>`,
                `@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class ResourceServerConfig {

    @Bean
    SecurityFilterChain chain(HttpSecurity http) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
            .authorizeHttpRequests(a -> a
                    .requestMatchers("/actuator/health").permitAll()
                    .requestMatchers("/api/admin/**").hasAuthority("SCOPE_admin")
                    .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(jwt ->
                    jwt.jwtAuthenticationConverter(converter())))
            .build();
    }

    // Map a custom "roles" claim onto Spring authorities. Without this,
    // Spring reads the "scope"/"scp" claim and prefixes with "SCOPE_".
    private JwtAuthenticationConverter converter() {
        JwtGrantedAuthoritiesConverter authorities = new JwtGrantedAuthoritiesConverter();
        authorities.setAuthoritiesClaimName("roles");
        authorities.setAuthorityPrefix("");        // roles already carry ROLE_
        JwtAuthenticationConverter c = new JwtAuthenticationConverter();
        c.setJwtGrantedAuthoritiesConverter(authorities);
        return c;
    }
}

# application.yml - the entire validation configuration
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://auth.example.com/realms/javaschoollab
          audiences: javaschoollab-api

// That issuer-uri makes Spring fetch the provider's OpenID configuration at
// startup, discover the JWKS endpoint, and validate signature, exp, nbf, iss
// and aud on every request. No JwtService, no filter, no key in your config.
//
// OUTPUT for a bad token, per RFC 6750:
// HTTP/1.1 401 Unauthorized
// WWW-Authenticate: Bearer error="invalid_token",
//   error_description="An error occurred while attempting to decode the Jwt:
//   Signed JWT rejected: Invalid signature", error_uri="https://tools.ietf.org/html/rfc6750#section-3.1"`,
                `// Access the validated token in a controller - no parsing anywhere in
// your code.
@GetMapping("/api/me")
public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
    return Map.of(
        "subject", jwt.getSubject(),
        "issuer",  jwt.getIssuer().toString(),
        "expires", jwt.getExpiresAt(),
        "roles",   jwt.getClaimAsStringList("roles"));
}
// OUTPUT:
// { "subject":"ajay", "issuer":"https://auth.example.com/realms/javaschoollab",
//   "expires":"2026-09-03T10:30:00Z", "roles":["ROLE_USER"] }`
            ]
        },

        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Is a JWT encrypted?</td><td>No. A standard JWT is <strong>signed</strong>, not encrypted - the payload is Base64URL and anyone holding the token can read every claim. The signature guarantees integrity and authenticity only. Encryption needs JWE.</td></tr>
<tr><td>What are the three parts of a JWT?</td><td>Header (algorithm and type), payload (the claims), and signature over <code>base64url(header) + "." + base64url(payload)</code> using the signing key.</td></tr>
<tr><td>What problem does a stateless token solve?</td><td>Server-side sessions do not survive being spread over N instances without sticky sessions, replication or a shared store. A signed token lets any instance verify identity with only a key.</td></tr>
<tr><td>Which claims matter, and why <code>aud</code>?</td><td><code>sub</code>, <code>exp</code>, <code>iat</code>, <code>iss</code>, <code>aud</code>, <code>jti</code>. Without an audience check, a token minted for one API is accepted by every other API that trusts the same issuer.</td></tr>
<tr><td>What is the <code>alg=none</code> attack?</td><td>The algorithm lives in the attacker-controlled header. Setting it to <code>none</code> and dropping the signature bypasses verification in any library that trusts the header. Pin the expected algorithm and key on the verifier.</td></tr>
<tr><td>What is algorithm confusion (RS256 to HS256)?</td><td>The attacker rewrites the header to HS256 and signs with the RSA <em>public</em> key as the HMAC secret. A verifier that selects the algorithm from the header then validates a forgery. Never let the token choose its own verification method.</td></tr>
<tr><td>HS256 or RS256?</td><td>HS256 shares one secret for signing and verifying - fine when a single service does both. RS256 signs with a private key and verifies with a public one, so several services can verify without any of them being able to mint tokens. Asymmetric wins as soon as verification is distributed.</td></tr>
<tr><td>How do you revoke a JWT before it expires?</td><td>Strictly, you cannot - that is the cost of statelessness. Practical answers: short-lived access tokens with a revocable refresh token, a <code>jti</code> denylist in Redis with a TTL, or a token-version claim compared against a column on the user.</td></tr>
<tr><td>What does logout actually do in a JWT system?</td><td>It deletes the client's copy and revokes the stored refresh token. The access token itself stays valid until <code>exp</code>, which is why that lifetime must be short.</td></tr>
<tr><td>Why have a refresh token at all?</td><td>It lets the access token be short-lived without asking the user to log in every fifteen minutes. It is stored server-side, so it is the revocable half of the pair - which is why it should be opaque, not a JWT.</td></tr>
<tr><td>What is refresh token rotation and reuse detection?</td><td>Each refresh issues a new refresh token and marks the old one used. Presenting a used token means it was replayed, so the whole token family is revoked and the user must log in again - turning a silent theft into a detected one.</td></tr>
<tr><td>localStorage or httpOnly cookie?</td><td>Neither is safe outright: <code>localStorage</code> is readable by any XSS on your origin; an httpOnly cookie is sent automatically and so is exposed to CSRF (mitigated by <code>SameSite</code>). Name the trade-off - a cross-origin or mobile client points to the header, a same-site web app to a cookie for the refresh token with the access token held in memory.</td></tr>
<tr><td>Why does a valid token sometimes give 401 intermittently?</td><td>Clock skew. <code>exp</code> and <code>nbf</code> are compared against the verifier's clock, so an issuer running fast produces tokens that are not yet valid elsewhere. Allow 30-60 seconds of leeway and synchronise clocks with NTP.</td></tr>
<tr><td>401 or 403 for a valid token without the right role?</td><td>403. Authentication succeeded - identity is known - and only authorization failed. 401 is for a missing, expired or invalid token.</td></tr>
<tr><td>Role-based or permission-based authorization?</td><td>Roles are convenient for administration; permissions (<code>order:delete</code>) are what code should check, because changing what a role may do then becomes data rather than a redeployment. Neither settles row-level ownership - check that in the service against the loaded entity.</td></tr>
<tr><td>Should you write your own JWT filter in production?</td><td>Usually not. <code>spring-boot-starter-oauth2-resource-server</code> validates signature, algorithm, expiry, issuer and audience, handles JWKS and key rotation, and returns RFC 6750 errors. Hand-rolled filters are where the algorithm and expiry bugs live.</td></tr>
</table>`
        }
    ]
};
