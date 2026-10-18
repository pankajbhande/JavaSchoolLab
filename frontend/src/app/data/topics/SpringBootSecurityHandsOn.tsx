import { Topic } from '../coreJava';

export const springBootSecurityHandsOn: Topic = {
    id: 'spring-boot-security-hands-on',
    name: 'Spring Security - Hands-On Setup',
    beginner: [
        {
            content: `<h3>Business Requirement</h3>
<div class="border">
• A REST endpoint is currently reachable by anyone who knows the URL.<br>
• The data it returns is confidential, so the caller must prove who they are before the controller runs.<br>
• Build the security up in two passes: first HTTP <strong>Basic authentication</strong> backed by a
custom <strong>UserDetailsService</strong>, then a <strong>stateless JWT</strong> flow where the
client trades credentials for a signed token and sends that token on every later request.<br>
</div><br>

<h3>Problem Statement</h3>
Without security, <code>GET http://localhost:8080/getBasicExample</code> returns 200 OK to any
caller. We want the same URL to return <strong>401 Unauthorized</strong> to an anonymous caller and
200 OK only once valid credentials are supplied.<br><br>

<h3>Package structure for Part A</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">src/main/java
 └── com.velocity
      ├── SpringBootSecurityApplication.java   (@SpringBootApplication)
      ├── restcontroller
      │     └── TestController.java            (@RestController)
      └── configuration
            ├── MyUserDetailsService.java      (implements UserDetailsService)
            └── SecurityConfig.java            (the SecurityFilterChain bean)</pre>

This topic is the laboratory walkthrough - project setup, the configuration class, users held in
memory and then in a database, password encoders, and testing each stage in Postman. The concepts
themselves (what a filter chain is, 401 against 403, method security) are covered separately.`
        },

        {
            content: `<h3>Step 1 - Create the project and add the web starter</h3>
<code>File -> New -> Spring Starter Project</code>, enter the project name, click Next, then Finish.
Add the web starter first and get an <strong>unsecured</strong> endpoint working before you add any
security at all - that way, when the 401 appears later, you know exactly which change caused it.<br><br>

Note the dependency has <strong>no version tag</strong>. The <code>spring-boot-starter-parent</code>
supplies the version through its dependency management. The source material pins
<code>&lt;version&gt;3.1.0&lt;/version&gt;</code> on the security starter, which is a good way to end
up with a security jar that does not match the rest of Boot.`,
            codeExamples: [`<!-- pom.xml -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.5</version>
</parent>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- optional: restarts the app when classes change -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-devtools</artifactId>
        <scope>runtime</scope>
        <optional>true</optional>
    </dependency>
</dependencies>

<!-- COMMON MISTAKE in the handout: the artifactId is written as
     "spring-boot-startersecurity" (the hyphen is lost by the PDF line break).
     Maven then fails the build with:
     [ERROR] Could not resolve dependencies ... spring-boot-startersecurity:jar:3.1.0 was not found
     The correct artifactId is spring-boot-starter-security. -->`]
        },

        {
            content: `<h3>Step 2 - The REST controller</h3>
One trivial GET endpoint. Nothing here knows anything about security; that is the point. Security in
Spring is applied by servlet filters that run <strong>before</strong> the
<code>DispatcherServlet</code>, so the controller stays clean.`,
            codeExamples: [`package com.velocity.restcontroller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/getBasicExample")
    public String getBasicExample() {
        return "This is the basic spring boot security example";
    }
}

// Postman, before any security is added:
//   Method : GET
//   URL    : http://localhost:8080/getBasicExample
//   Auth   : No Auth
//
// OUTPUT:
// Status: 200 OK
// Body  : This is the basic spring boot security example
//
// Anyone who knows the URL gets the data. That is the problem we are fixing.`]
        },

        {
            content: `<h3>Step 3 - Add the security starter and observe the default</h3>
Add <code>spring-boot-starter-security</code> and restart <strong>without writing a single line of
configuration</strong>. Boot's auto-configuration secures every endpoint, generates a login form and
creates one user called <code>user</code> with a random password printed to the console.<br><br>

Read that console line before you go any further - a surprising number of "my app is broken" reports
are a developer who added the starter and did not notice the endpoint is now protected.`,
            codeExamples: [`<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

// CONSOLE OUTPUT on startup:
//
// Using generated security password: 3f6a1c88-9c0e-4d3b-b0f7-1a25f0e9d4c2
//
// This generated password is for development use only. Your security configuration
// must be updated before running your application in production.
//
// Postman, same request as before, still "No Auth":
// OUTPUT:
// Status: 401 Unauthorized
// Header: WWW-Authenticate: Basic realm="Realm"
// Body  : {"timestamp":"...","status":401,"error":"Unauthorized","path":"/getBasicExample"}`]
        },

        {
            content: `<h3>Step 4 - Supply your own users with a UserDetailsService</h3>
The generated password is regenerated on every restart, so it is useless for a real lab. Replace it
with a <strong>UserDetailsService</strong>: a single-method interface whose job is to answer the
question "given this username, what is the stored password and what authorities does this account
hold?" It does <strong>not</strong> compare passwords - that comparison is the
<strong>PasswordEncoder</strong>'s job, and keeping the two separate is what lets you swap a
database, LDAP or a REST call in behind the same interface.<br><br>

Two corrections to the handout's version are marked in the code and both are compile- or
startup-time failures, not style points.`,
            codeExamples: [`package com.velocity.configuration;

import java.util.List;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service   // CORRECTION 1: the handout omits this. Without a stereotype annotation the
           // class is never a bean, so @Autowired in SecurityConfig fails at startup with:
           // NoSuchBeanDefinitionException: No qualifying bean of type
           //   'com.velocity.configuration.MyUserDetailsService' available
public class MyUserDetailsService implements UserDetailsService {

    private final PasswordEncoder passwordEncoder;

    public MyUserDetailsService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        if (!"javaindustry".equals(username)) {
            // Always throw. Returning null makes Spring Security fail with an
            // opaque InternalAuthenticationServiceException instead of a clean 401.
            throw new UsernameNotFoundException("No user found with username: " + username);
        }

        // CORRECTION 2: the handout passes an empty new ArrayList<>() for authorities and
        // a plain-text password. An account with zero authorities can authenticate but
        // fails every hasRole(..) / hasAuthority(..) rule, which shows up as a confusing
        // 403 later. Give it at least one role, and store the password ENCODED.
        return User.withUsername("javaindustry")
                   .password(passwordEncoder.encode("industry12345"))
                   .authorities(List.of(new SimpleGrantedAuthority("ROLE_USER")))
                   .build();
    }
}

// OUTPUT (behaviour):
// loadUserByUsername("javaindustry") -> UserDetails with a $2a$10$... bcrypt hash
// loadUserByUsername("someone-else") -> UsernameNotFoundException -> 401 Unauthorized`]
        },

        {
            content: `<h3>Step 5 - The security configuration class</h3>
This is where the source material is most out of date. It extends
<strong>WebSecurityConfigurerAdapter</strong> and overrides <code>configure(...)</code> methods.
That class was deprecated in Spring Security 5.7 and <strong>deleted</strong> in Spring Security 6,
so on any current Spring Boot the handout's class does not compile - the import itself cannot be
resolved.<br><br>

The modern form declares a <strong>SecurityFilterChain</strong> bean and configures it with the
lambda DSL. Same behaviour, no inheritance, and every rule is an ordinary bean you can test.<br><br>

Note also the encoder. The handout returns <code>NoOpPasswordEncoder.getInstance()</code>, which
stores and compares passwords in plain text. Never do this, not even in a lab -
<strong>BCryptPasswordEncoder</strong> costs one line and behaves identically from the student's
point of view.`,
            codeExamples: [`package com.velocity.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration       // the handout omits @Configuration and keeps only @EnableWebSecurity;
@EnableWebSecurity   // the class is then not scanned and the whole config is silently ignored
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/getBasicExample").authenticated()
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())   // enables the Basic Auth challenge
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // handout: return NoOpPasswordEncoder.getInstance();
        // NoOp keeps passwords in plain text and is itself @Deprecated.
        return new BCryptPasswordEncoder();
    }
}

// The handout's version, for reference - DOES NOT COMPILE on Spring Boot 3.x:
//
// @EnableWebSecurity
// public class SecurityConfig extends WebSecurityConfigurerAdapter {
//     @Override
//     protected void configure(AuthenticationManagerBuilder auth) throws Exception {
//         auth.userDetailsService(myUserDetailsService);
//     }
//     @Bean PasswordEncoder passwordIncoder() { return NoOpPasswordEncoder.getInstance(); }
// }
//
// COMPILER ERROR:
// The import org.springframework.security.config.annotation.web.configuration
//   .WebSecurityConfigurerAdapter cannot be resolved
//
// (note also the typo "passwordIncoder" - harmless, because Spring resolves this bean
//  by TYPE not by name, but it will confuse the next person reading the file)`]
        },

        {
            content: `<h3>Step 6 - Wiring the UserDetailsService in</h3>
There is no <code>configure(AuthenticationManagerBuilder)</code> to override any more, and none is
needed. Spring Boot builds a <code>DaoAuthenticationProvider</code> automatically as soon as it finds
<strong>exactly one</strong> <code>UserDetailsService</code> bean and one
<code>PasswordEncoder</code> bean in the context. Declaring the beans is the wiring.<br><br>

If you ever need it explicit - two user stores, say, or a custom provider - build the
<code>AuthenticationManager</code> yourself as shown below.`,
            codeExamples: [`// Explicit form, only needed when the defaults are not what you want:

@Bean
public AuthenticationProvider authenticationProvider(MyUserDetailsService uds,
                                                     PasswordEncoder encoder) {
    DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(uds);
    provider.setPasswordEncoder(encoder);
    return provider;
}

@Bean
public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg)
        throws Exception {
    // Spring Security 6 replacement for the old
    //   super.authenticationManagerBean()
    // that the handout calls from inside WebSecurityConfigurerAdapter.
    return cfg.getAuthenticationManager();
}`]
        },

        {
            content: `<h3>Step 7 - Test Part A in Postman</h3>
Run the application, then send the same request three ways. The three outcomes below are the whole
lesson of Part A: no credentials and wrong credentials are indistinguishable to the client (both
401), and that is deliberate - telling an attacker "the username exists but the password is wrong"
hands them half the answer.`,
            codeExamples: [`// --- Request 1: no credentials -----------------------------------------
// GET http://localhost:8080/getBasicExample     Authorization: (none)
//
// OUTPUT:
// Status: 401 Unauthorized
// Header: WWW-Authenticate: Basic realm="Realm"


// --- Request 2: wrong password -----------------------------------------
// GET http://localhost:8080/getBasicExample
// Postman -> Authorization tab -> Type: Basic Auth
//   Username: javaindustry
//   Password: wrongpassword
//
// OUTPUT:
// Status: 401 Unauthorized      <- same status as "no credentials", by design


// --- Request 3: correct credentials ------------------------------------
// GET http://localhost:8080/getBasicExample
// Postman -> Authorization tab -> Type: Basic Auth
//   Username: javaindustry
//   Password: industry12345
//
// Postman encodes this into the header for you:
//   Authorization: Basic amF2YWluZHVzdHJ5OmluZHVzdHJ5MTIzNDU=
//
// OUTPUT:
// Status: 200 OK
// Body  : This is the basic spring boot security example
//
// NOTE: that header value is base64, NOT encryption. Anyone who captures the
// request reads the password straight off it. Basic Auth is only acceptable
// over HTTPS.`]
        },

        {
            content: `<h3>Application flow, Part A</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">main()  ->  SecurityConfig  ->  filterChain(HttpSecurity) bean built once at startup
                              ->  passwordEncoder() bean built once at startup

Postman GET /getBasicExample
   |
   v
BasicAuthenticationFilter        reads the Authorization header, decodes base64
   |
   v
AuthenticationManager
   |
   v
DaoAuthenticationProvider
   |
   v
MyUserDetailsService.loadUserByUsername("javaindustry")
   |                                        |
   |                          not found ----+--> UsernameNotFoundException -> 401
   v
PasswordEncoder.matches(raw, storedHash)
   |
   |  false --> BadCredentialsException -> 401
   v
  true
   |
   v
SecurityContextHolder gets the Authentication
   |
   v
AuthorizationFilter    checks the authorizeHttpRequests rules
   |
   v
DispatcherServlet -> TestController.getBasicExample() -> 200 OK</pre>

Notice how far the request travels before your controller is reached, and that every rejection point
short-circuits back to the client without the controller ever running.`
        },

        {
            content: `<h3>Part B - Moving the users into a database</h3>
Hard-coded users are fine for one lesson and wrong for everything after it. The only class that has
to change is the <code>UserDetailsService</code>: the filter chain, the encoder and the controller
are untouched. That is the payoff of the interface split described in Step 4.<br><br>

Add the JPA and MySQL dependencies, an entity, a repository and one query method.`,
            codeExamples: [`<!-- pom.xml additions -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>


# src/main/resources/application.properties

spring.datasource.url=jdbc:mysql://localhost:3306/securitydb
spring.datasource.username=root
spring.datasource.password=root

# NOTE: the property is driver-class-name, with a hyphen before "name".
# The handouts repeatedly write "spring.datasource.driver-classname", which
# Boot does not recognise; it is ignored, and you get a confusing
# "Failed to determine a suitable driver class" only in some setups.
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
# ddl-auto=create DROPS AND RECREATES every table on each restart -
# your users vanish between runs. Use "update" while learning, and
# a migration tool (Flyway/Liquibase) for anything real.

spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
# (the handout prints this as "org.hibernate.dial ect.MySQL8Dialect" -
#  a PDF line-break artefact, not a real package)`]
        },

        {
            content: `<h3>Part B - Entity, repository and the DB-backed UserDetailsService</h3>
The entity is an ordinary JPA class. The one detail that matters is that the
<code>password</code> column stores the <strong>bcrypt hash</strong>, never the raw password, and it
needs to be at least 60 characters wide or the hash is silently truncated and no one can ever log
in again.`,
            codeExamples: [`// ---------- Entity ----------
package com.velocity.entity;

import jakarta.persistence.*;   // Spring Boot 3.x
// Spring Boot 2.x uses javax.persistence.* instead - the package rename to
// jakarta is the single most common upgrade error between Boot 2 and Boot 3.

@Entity
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false, length = 60)   // a bcrypt hash is exactly 60 chars
    private String password;

    private String roles;   // e.g. "ROLE_USER,ROLE_ADMIN"

    // getters and setters omitted
}


// ---------- Repository ----------
package com.velocity.repository;

import java.util.Optional;
import com.velocity.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

// The id field is Integer, so the second type argument must be Integer.
// Writing JpaRepository<AppUser, Long> compiles, then fails at startup with
//   IllegalArgumentException: Provided id of the wrong type
public interface AppUserRepository extends JpaRepository<AppUser, Integer> {

    Optional<AppUser> findByUsername(String username);

    // Do NOT declare "public AppUser findById(Integer id)" here: it clashes with
    // the inherited Optional<AppUser> findById(ID) and does not compile -
    //   "return type is incompatible with JpaRepository.findById(Integer)"
}


// ---------- The only class that changes ----------
package com.velocity.configuration;

@Service
public class DbUserDetailsService implements UserDetailsService {

    private final AppUserRepository repository;

    public DbUserDetailsService(AppUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        AppUser user = repository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Not found: " + username));

        return User.withUsername(user.getUsername())
                   .password(user.getPassword())          // already hashed in the DB
                   .authorities(user.getRoles().split(","))
                   .build();
    }
}

// OUTPUT (console, with show-sql=true, on a login attempt):
// Hibernate: select a1_0.id,a1_0.password,a1_0.roles,a1_0.username
//            from app_user a1_0 where a1_0.username=?
//
// One SELECT per login. Add an index on the username column - Spring Security
// calls this on every single authenticated request unless a session or token
// short-circuits it.`]
        },

        {
            content: `<h3>Part C - Stateless JWT authentication</h3>
Basic Auth resends the password on every request. The JWT flow replaces that: the client posts its
credentials <strong>once</strong> to <code>/token</code>, receives a signed token, and sends that
token in the <code>Authorization</code> header thereafter. The server keeps no session.<br><br>

<table>
<tr><th>Class</th><th>Responsibility</th></tr>
<tr><td>JwtUtil</td><td>Generates, parses, and validates the signed token. Holds the signing key and the expiry policy.</td></tr>
<tr><td>JWTRequest</td><td>Request body of <code>POST /token</code> - username and password.</td></tr>
<tr><td>JWTResponse</td><td>Response body of <code>POST /token</code> - the token string.</td></tr>
<tr><td>JWTController</td><td>Authenticates the credentials through the AuthenticationManager, then asks JwtUtil for a token.</td></tr>
<tr><td>JWTAuthenticationFilter</td><td>Runs on every request, reads the Bearer token, validates it, and populates the SecurityContext.</td></tr>
</table><br>

The handout uses <code>io.jsonwebtoken:jjwt:0.9.0</code>. That release is from 2018, needs a
<code>jaxb-api</code> patch on Java 11 and above, and its API is deprecated. Use the split 0.12.x
artifacts instead - the extra dependency lines below are the whole cost of the upgrade.`,
            codeExamples: [`<!-- What the handout asks for, and the failure it causes -->
<!--
<dependency>
    <groupId>io.jsonwebtoken</groupId><artifactId>jjwt</artifactId><version>0.9.0</version>
</dependency>

Running on Java 11+ this throws at the first token generation:
  java.lang.NoClassDefFoundError: javax/xml/bind/DatatypeConverter
        at io.jsonwebtoken.impl.Base64Codec.encode(...)

The handout then patches it by adding javax.xml.bind:jaxb-api:2.3.1. That works,
but it is a workaround for a library that should be replaced.

Also note: spring-security-jwt:1.1.1.RELEASE is listed too. It is an unrelated,
long-retired Spring artifact and is not used by any code in the exercise. Remove it.
-->

<!-- Use these instead -->
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
</dependency>`]
        },

        {
            content: `<h3>Part C - JwtUtil</h3>
Two problems in the handout's version are worth stopping on.<br><br>

<strong>The signing key.</strong> It uses the literal string <code>"secret"</code>. HS256 requires a
key of at least 256 bits; jjwt 0.11 and later reject anything shorter with a
<code>WeakKeyException</code>. Even where it is accepted, a six-character key is guessable offline in
seconds, and anyone who guesses it can mint tokens for any user, including an administrator.<br><br>

<strong>The unused constant.</strong> <code>JWT_TOKEN_VALIDITY</code> is declared as 5 hours and then
never referenced - <code>createToken</code> hardcodes ten hours instead. Both numbers are far too
long for an access token that cannot be revoked.`,
            codeExamples: [`package com.velocity.util;

import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    // Read the key from configuration, never hardcode it in the source -
    // committing a signing key to git is the same as publishing it.
    // Base64 of at least 32 random bytes.
    @Value("\${app.jwt.secret}")
    private String base64Secret;

    // 15 minutes. The handout uses 10 hours; a stolen token is valid for the
    // whole of its lifetime because there is nothing to revoke it with.
    private static final long VALIDITY_MS = 15 * 60 * 1000L;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode(base64Secret));
    }

    public String generateToken(UserDetails userDetails) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claims(Map.of("roles", userDetails.getAuthorities().toString()))
                .subject(userDetails.getUsername())
                .issuedAt(new Date(now))
                .expiration(new Date(now + VALIDITY_MS))
                .signWith(key())
                .compact();
    }

    public String getUsername(String token) {
        return parse(token).getSubject();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            Claims claims = parse(token);
            return claims.getSubject().equals(userDetails.getUsername())
                    && claims.getExpiration().after(new Date());
        } catch (JwtException e) {   // bad signature, malformed, expired
            return false;
        }
    }

    private Claims parse(String token) {
        return Jwts.parser().verifyWith(key()).build()
                   .parseSignedClaims(token).getPayload();
    }
}

// application.properties
// app.jwt.secret=c2VjdXJlLXJhbmRvbS0zMi1ieXRlLXNlY3JldC1rZXktaGVyZSE=
//
// If you keep the handout's SECRET_KEY = "secret":
// OUTPUT:
// io.jsonwebtoken.security.WeakKeyException: The signing key's size is 48 bits
//   which is not secure enough for the HS256 algorithm ... RFC 7518 requires
//   keys of at least 256 bits`]
        },

        {
            content: `<h3>Part C - The token endpoint</h3>
<code>POST /token</code> must be reachable without a token - otherwise there is no way to obtain
one. It authenticates the submitted credentials through the
<strong>AuthenticationManager</strong> and only then issues a token.<br><br>

The handout catches <code>UsernameNotFoundException</code>. That is the wrong exception: the manager
throws <strong>BadCredentialsException</strong> when the password does not match, so a wrong password
escapes the catch and surfaces as a 500. Catch <code>AuthenticationException</code>, the common
supertype.`,
            codeExamples: [`// ---------- JWTRequest / JWTResponse ----------
public record JWTRequest(String username, String password) { }
public record JWTResponse(String token) { }
// Plain classes with getters/setters work equally well; records are shorter.
// Do NOT add a toString() that prints the password - the handout's
// System.out.println(jwtRequest) writes the plaintext password into the log file.


// ---------- JWTController ----------
package com.velocity.controller;

@RestController
public class JWTController {

    private final AuthenticationManager authenticationManager;
    private final MyUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public JWTController(AuthenticationManager authenticationManager,
                         MyUserDetailsService userDetailsService,
                         JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/token")
    public ResponseEntity<?> generateToken(@RequestBody JWTRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.username(), request.password()));
        } catch (AuthenticationException e) {
            // handout catches only UsernameNotFoundException, so a wrong PASSWORD
            // (BadCredentialsException) escapes and becomes a 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body(Map.of("error", "Bad credentials"));
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.username());
        return ResponseEntity.ok(new JWTResponse(jwtUtil.generateToken(userDetails)));
    }
}

// --- Postman ------------------------------------------------------------
// POST http://localhost:8080/token
// Body -> raw -> JSON:
// {
//     "username": "javaindustry",
//     "password": "industry12345"
// }
//
// OUTPUT (200 OK):
// {
//     "token": "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IltST0xFX1VTRVJdIiwic3ViIjoi
//               amF2YWluZHVzdHJ5IiwiaWF0IjoxNzE1MDAwMDAwLCJleHAiOjE3MTUwMDA5MDB9
//               .qX3nO0kZ1s9dJ7fT2mVbYl8cPqRhE5wA6uKgN3tXsIY"
// }
//
// With a wrong password:
// OUTPUT (401 Unauthorized):
// { "error": "Bad credentials" }`]
        },

        {
            content: `<h3>Part C - The JWT filter</h3>
This filter reads the token on every request and, if it is valid, places an
<code>Authentication</code> into the <strong>SecurityContextHolder</strong> so the rest of the chain
treats the caller as logged in.<br><br>

The handout's version contains a bug that stops the whole application, and it is worth understanding
rather than just copying the fix: <code>filterChain.doFilter(request, response)</code> sits
<strong>inside</strong> the <code>if (requestTokenHeader != null)</code> block. A request that
carries no <code>Authorization</code> header therefore never continues down the chain - the response
is never written and the client hangs until it times out. <code>POST /token</code> itself has no
header, so token generation breaks the moment the filter is added.<br><br>

A second bug: <code>loadUserByUsername(username)</code> is called before <code>username</code> is
checked for null, so a malformed token produces a
<code>UsernameNotFoundException</code> or an NPE instead of a clean 401.`,
            codeExamples: [`package com.velocity.configuration;

import jakarta.servlet.FilterChain;              // Boot 3.x
// Boot 2.x uses javax.servlet.FilterChain - same class, renamed package.
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final MyUserDetailsService userDetailsService;

    public JWTAuthenticationFilter(JwtUtil jwtUtil, MyUserDetailsService uds) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = uds;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // note the trailing space: "Bearer " is 7 characters, which is what
        // substring(7) removes. The handout tests startsWith("Bearer") without
        // the space, so a header of "BearerXYZ" is accepted and then mangled.
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String username = null;

            try {
                username = jwtUtil.getUsername(token);
            } catch (JwtException e) {
                // expired or tampered token: leave the context empty, let the
                // chain produce a 401. Do NOT e.printStackTrace() in production.
            }

            if (username != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                // handout calls loadUserByUsername BEFORE the null check above,
                // so a malformed token throws instead of returning 401

                if (jwtUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        }

        // CRITICAL: this line must be OUTSIDE the if-block. In the handout it is
        // inside, so any request without an Authorization header - including
        // POST /token - is never forwarded. Symptom in Postman:
        //   "Error: socket hang up"  or an empty 200 with no body.
        filterChain.doFilter(request, response);
    }
}`]
        },

        {
            content: `<h3>Part C - Registering the filter and going stateless</h3>
Three settings turn the application into a stateless API. Each one has a reason, and
<code>csrf.disable()</code> in particular is safe <strong>only</strong> because of the other
two.`,
            codeExamples: [`@Configuration
@EnableWebSecurity
public class MySecurityConfig {

    private final JWTAuthenticationFilter jwtFilter;

    public MySecurityConfig(JWTAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            // 1. No cookie-borne session credential exists, so there is nothing
            //    a cross-site form post could ride on. See the expert section.
            .csrf(csrf -> csrf.disable())

            // 2. /token must be open, or nobody can ever obtain a token.
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/token").permitAll()
                    .anyRequest().authenticated())

            // 3. Never create or use an HttpSession. Every request must carry
            //    its own proof of identity.
            .sessionManagement(sm -> sm
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Run our filter BEFORE the username/password filter so the
            // SecurityContext is populated by the time authorization is checked.
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();   // handout: NoOpPasswordEncoder - do not use
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration c)
            throws Exception {
        return c.getAuthenticationManager();
    }
}

// The handout also chains .cors().disable(). Disabling CORS does not make the
// app "more secure" - it removes the CORS response headers, so a browser-based
// front end on a different origin can no longer call the API at all. Configure
// CORS with an explicit allowed-origins list instead of switching it off.`]
        },

        {
            content: `<h3>Part C - Testing the JWT flow</h3>
Run the application and work through the four requests below in order. Request 3 is the one students
usually hit first and misread as a bug in their code - it is not, it is the expected result of asking
for a protected resource with no token.`,
            codeExamples: [`// --- 1. Obtain a token --------------------------------------------------
// POST http://localhost:8080/token
// Body -> raw -> JSON: { "username":"javaindustry", "password":"industry12345" }
//
// OUTPUT (200 OK):
// { "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYXZhaW5kdXN0cnkiLCJpYXQiOjE3..." }
//
// CONSOLE:
// Hibernate: select a1_0.id,a1_0.password,... from app_user a1_0 where a1_0.username=?


// --- 2. Call the protected endpoint WITH the token ----------------------
// GET http://localhost:8080/getDemo
// Headers:  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYXZh...
//
// OUTPUT (200 OK):
// this is JWT Token Authentication Demo


// --- 3. Call it WITHOUT a token -----------------------------------------
// GET http://localhost:8080/getDemo      (no Authorization header)
//
// OUTPUT:
// Status: 401 Unauthorized
//
// The handout reports a 403 Forbidden at this point in the exercise. That is
// because at that stage the JWT filter has not been registered yet, so nothing
// ever populates the SecurityContext - and with csrf disabled and no
// authentication entry point, Spring's default is 403. Once the filter is
// added and the entry point is in place, the correct answer is 401.


// --- 4. Call it with a TAMPERED token -----------------------------------
// GET http://localhost:8080/getDemo
// Headers:  Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.WRONGSIG
//
// OUTPUT:
// Status: 401 Unauthorized
//
// Changing the payload to claim "sub":"admin" invalidates the signature, and the
// signature is checked before any claim is read. This is exactly what the signing
// key protects - which is why a guessable key such as "secret" destroys the
// entire scheme.`]
        },

        {
            content: `<h3>Application flow, Part C</h3>
<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">FLOW 1 - obtaining the token (runs once)

POST /token  { username, password }
   |
   v
JWTAuthenticationFilter.doFilterInternal()
   |   no Authorization header -> context stays empty -> chain continues
   v
AuthorizationFilter   /token is permitAll -> allowed through
   |
   v
JWTController.generateToken()
   |
   v
AuthenticationManager.authenticate()
   |
   v
DaoAuthenticationProvider -> UserDetailsService -> PasswordEncoder.matches()
   |
   |  no match --> BadCredentialsException --> 401 { "error": "Bad credentials" }
   v
JwtUtil.generateToken() -> signWith(key) -> compact()
   |
   v
200 OK  { "token": "eyJ..." }


FLOW 2 - using the token (runs on every subsequent request)

GET /getDemo   Authorization: Bearer eyJ...
   |
   v
JWTAuthenticationFilter.doFilterInternal()
   |
   +-- header missing / not "Bearer " --> context empty --> ... --> 401
   |
   v
JwtUtil.getUsername(token)      verifies signature, reads "sub"
   |
   +-- bad signature or expired --> JwtException --> context empty --> 401
   v
UserDetailsService.loadUserByUsername()
   |
   v
JwtUtil.validateToken()   subject matches AND not expired
   |
   v
SecurityContextHolder.setAuthentication(...)
   |
   v
filterChain.doFilter()   <-- must be reached on EVERY path
   |
   v
AuthorizationFilter -> DispatcherServlet -> JWTAuthenticationController -> 200 OK</pre>

No <code>HttpSession</code> is created anywhere in flow 2. That is what "stateless" means in
practice: put the request behind a load balancer and any instance can serve it.`
        }
    ],

    expert: [
        {
            content: `<h3>WebSecurityConfigurerAdapter: deprecated, then deleted</h3>
The class the source material is built on was deprecated in <strong>Spring Security 5.7</strong>
(February 2022) and <strong>removed entirely in Spring Security 6.0</strong>, which is what every
Spring Boot 3.x application uses. This is not a warning you can suppress - the handout's
<code>@SuppressWarnings("deprecation")</code> silences the 5.7 warning but does nothing on 6.x, where
the import simply cannot be resolved.<br><br>

The reason for the removal is worth understanding, because it explains the shape of the replacement.
The adapter forced <strong>inheritance</strong>: to change one thing you subclassed a base class and
overrode a <code>protected</code> method, and the base class decided the order in which your
overrides ran. You could not have two independent chains, you could not unit-test a rule in
isolation, and the <code>configure(HttpSecurity)</code> and
<code>configure(AuthenticationManagerBuilder)</code> overrides interacted in ways that were hard to
reason about. The <strong>component-based model</strong> replaces it: you publish beans, Spring
composes them, and each bean is an ordinary object you can construct in a test.<br><br>

<table>
<tr><th>Old API (5.6 and earlier)</th><th>Modern replacement (5.7+ / 6.x)</th></tr>
<tr><td>extends WebSecurityConfigurerAdapter</td><td>a <code>SecurityFilterChain</code> @Bean</td></tr>
<tr><td>configure(HttpSecurity http)</td><td>the body of that bean method, returning <code>http.build()</code></td></tr>
<tr><td>configure(AuthenticationManagerBuilder auth)</td><td>publish a <code>UserDetailsService</code> / <code>AuthenticationProvider</code> bean</td></tr>
<tr><td>configure(WebSecurity web).ignoring()</td><td>a <code>WebSecurityCustomizer</code> @Bean, or better, <code>permitAll()</code> in the chain</td></tr>
<tr><td>super.authenticationManagerBean()</td><td><code>AuthenticationConfiguration.getAuthenticationManager()</code></td></tr>
<tr><td>antMatchers(..)</td><td><code>requestMatchers(..)</code></td></tr>
<tr><td>authorizeRequests(..)</td><td><code>authorizeHttpRequests(..)</code></td></tr>
<tr><td>and() chaining</td><td>the lambda DSL - each configurer takes a <code>Customizer</code></td></tr>
</table>`,
            codeExamples: [`// ---------- What the handout writes (Spring Security 5.6 and earlier) ----------
@Configuration
@EnableWebSecurity
public class MySecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .cors().disable()
            .authorizeRequests()
                .antMatchers("/token").permitAll()
                .anyRequest().authenticated()
            .and()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    }
}
// On Spring Boot 3.x:
// ERROR: WebSecurityConfigurerAdapter cannot be resolved to a type
// ERROR: The method antMatchers(String) is undefined for the type
//        ExpressionUrlAuthorizationConfigurer.ExpressionInterceptUrlRegistry


// ---------- The modern equivalent ----------
@Configuration
@EnableWebSecurity
public class MySecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JWTAuthenticationFilter jwtFilter) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/token", "/actuator/health").permitAll()
                    .requestMatchers("/admin/**").hasRole("ADMIN")
                    .anyRequest().authenticated())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint((req, res, e) ->
                            res.sendError(HttpServletResponse.SC_UNAUTHORIZED)))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}


// ---------- Multiple chains, which the adapter could not express cleanly ----------
// @Order matters: the FIRST chain whose securityMatcher matches wins, and the
// rest are never consulted. Put the most specific matcher first.

@Bean @Order(1)
SecurityFilterChain apiChain(HttpSecurity http) throws Exception {
    return http.securityMatcher("/api/**")          // stateless, token-based
               .csrf(AbstractHttpConfigurer::disable)
               .sessionManagement(sm -> sm.sessionCreationPolicy(STATELESS))
               .authorizeHttpRequests(a -> a.anyRequest().authenticated())
               .build();
}

@Bean @Order(2)
SecurityFilterChain webChain(HttpSecurity http) throws Exception {
    return http                                      // everything else: session + form login
               .authorizeHttpRequests(a -> a.anyRequest().authenticated())
               .formLogin(Customizer.withDefaults()) // CSRF stays ENABLED here
               .build();
}
// OUTPUT (behaviour):
// GET /api/orders  -> handled by apiChain: 401 without a Bearer token
// GET /dashboard   -> handled by webChain: 302 redirect to /login`]
        },

        {
            content: `<h3>Why NoOpPasswordEncoder must never be used</h3>
Both source documents configure <code>NoOpPasswordEncoder.getInstance()</code>. The class exists for
exactly one purpose - letting a legacy application boot while its stored passwords are migrated - and
it has carried <code>@Deprecated</code> since Spring Security 5.0 for that reason. Its
<code>encode()</code> returns the input unchanged and its <code>matches()</code> is a plain
<code>String.equals</code>. Two independent consequences follow.<br><br>

<strong>Every password sits in the database in plain text.</strong> One SQL injection, one leaked
backup, one curious DBA, and every account is compromised - and because people reuse passwords, so
are their accounts elsewhere.<br><br>

<strong>The comparison is not constant-time.</strong> <code>String.equals</code> returns as soon as
two characters differ, so the time it takes leaks how many leading characters were correct. Real
encoders compare fixed-length hashes and are immune to this.<br><br>

<h3>What to use instead</h3>
<table>
<tr><th>Encoder</th><th>Guidance</th></tr>
<tr><td>BCryptPasswordEncoder</td><td>The sensible default. Generates its own random salt, stores it inside the 60-character output, and takes a work factor (default 10). Raise it as hardware gets faster; every increment doubles the cost. Silently truncates input at 72 bytes.</td></tr>
<tr><td>Argon2PasswordEncoder</td><td>Winner of the Password Hashing Competition and the current best choice for new systems. Tunable in <strong>memory</strong> as well as time, which is what defeats GPU and ASIC attackers - bcrypt is cheap to parallelise on a GPU, Argon2id is not. Needs BouncyCastle on the classpath.</td></tr>
<tr><td>SCryptPasswordEncoder</td><td>Also memory-hard; reasonable, but Argon2id is the more current recommendation.</td></tr>
<tr><td>Pbkdf2PasswordEncoder</td><td>Use when FIPS compliance is required. Not memory-hard, so needs a high iteration count.</td></tr>
<tr><td>MessageDigestPasswordEncoder (MD5/SHA)</td><td>Never for passwords. A modern GPU computes billions of SHA-256 hashes per second; the whole point of a password hash is to be <strong>slow</strong>.</td></tr>
<tr><td>DelegatingPasswordEncoder</td><td>What <code>PasswordEncoderFactories.createDelegatingPasswordEncoder()</code> returns and what Boot uses by default. Reads a <code>{id}</code> prefix on the stored hash and dispatches to the matching encoder, which is how you migrate encodings without a big-bang password reset.</td></tr>
</table>`,
            codeExamples: [`// ---------- What the stored values actually look like ----------

NoOp   : industry12345
         ^ the user's real password, readable by anyone with SELECT rights

BCrypt : $2a$10$N9qo8uLOickgx2ZMRZoMy.MHi9F4B7lJfkbJRJk3bckOa7CCFAQXO
         |  |  |                      |
         |  |  |                      +-- 31-char hash
         |  |  +-- 22-char salt, generated per password
         |  +-- work factor: 2^10 = 1024 rounds
         +-- algorithm id

Argon2 : $argon2id$v=19$m=16384,t=2,p=1$c29tZXNhbHQ$RdescudvJCsgt3ub+b+dWRWJTmaaJObG
                        ^ 16 MB of memory per hash - this is what stops GPU farms


// ---------- Encoding the same password twice ----------
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
System.out.println(encoder.encode("industry12345"));
System.out.println(encoder.encode("industry12345"));
System.out.println(encoder.matches("industry12345",
        "$2a$10$N9qo8uLOickgx2ZMRZoMy.MHi9F4B7lJfkbJRJk3bckOa7CCFAQXO"));

// OUTPUT:
// $2a$10$N9qo8uLOickgx2ZMRZoMy.MHi9F4B7lJfkbJRJk3bckOa7CCFAQXO
// $2a$10$7Ftu.4KcRy3vX9pQmZ0lQeHZKu2sJcVbW1nDgYxT5oPqA8mLkNjSi
// true
//
// Different every time - the salt is random. This is why you can never write
// "WHERE password = ?" in SQL to check a login; you must load the row and call
// matches(). Students who try the SQL comparison get "invalid credentials"
// forever and cannot see why.


// ---------- Argon2id ----------
@Bean
public PasswordEncoder passwordEncoder() {
    // saltLength, hashLength, parallelism, memory(KB), iterations
    return new Argon2PasswordEncoder(16, 32, 1, 1 << 14, 2);
}


// ---------- Migrating away from NoOp without resetting every password ----------
@Bean
public PasswordEncoder passwordEncoder() {
    // Stored hashes carry their algorithm as a prefix:
    //   {bcrypt}$2a$10$...   {noop}industry12345   {argon2}$argon2id$...
    // New passwords are encoded with the default (bcrypt); old {noop} rows still
    // authenticate, and you re-encode each one on the user's next successful login.
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
}
// A stored value with NO {id} prefix throws:
// java.lang.IllegalArgumentException: There is no PasswordEncoder mapped for the id "null"
// - the single most common error when switching to the delegating encoder.`]
        },

        {
            content: `<h3>The filter chain, and why order decides behaviour</h3>
Spring Security is not magic applied to your controllers; it is a list of servlet
<code>Filter</code> objects with a defined order, wired into the container by a single
<strong>DelegatingFilterProxy</strong> named <code>springSecurityFilterChain</code>. That proxy hands
the request to <strong>FilterChainProxy</strong>, which picks the first matching
<code>SecurityFilterChain</code> and runs its filters in order. Everything you configure - CSRF,
login, authorization - is a filter placed at a fixed position in that list.<br><br>

Two positions in the list explain most of the confusing behaviour students hit.<br><br>

<strong>AuthorizationFilter is last.</strong> It makes the accept/reject decision, so anything that
must establish identity has to run before it. A custom JWT filter registered after it always sees an
empty context and every request 401s.<br><br>

<strong>ExceptionTranslationFilter sits just above it.</strong> It catches the exceptions the
authorization filter throws and turns them into HTTP: <code>AuthenticationException</code> becomes a
call to the <code>AuthenticationEntryPoint</code> (a 401 or a redirect to the login page), and
<code>AccessDeniedException</code> becomes 403. A filter that throws <em>above</em>
<code>ExceptionTranslationFilter</code> is not caught by it, which is why an exception thrown from
your JWT filter often reaches the client as a raw 500 rather than a tidy 401.`,
            codeExamples: [`// ---------- Actual order, Spring Security 6 (abridged) ----------
//
//  1  DisableEncodeUrlFilter
//  2  WebAsyncManagerIntegrationFilter
//  3  SecurityContextHolderFilter        loads the SecurityContext (from session, if any)
//  4  HeaderWriterFilter                 X-Content-Type-Options, X-Frame-Options, HSTS
//  5  CorsFilter                         preflight handling - BEFORE csrf and auth
//  6  CsrfFilter                         rejects unsafe methods without a valid token
//  7  LogoutFilter
//  8  >>> your JWTAuthenticationFilter <<<   (addFilterBefore(.., UsernamePassword..))
//  9  UsernamePasswordAuthenticationFilter    form login POST /login
// 10  DefaultLoginPageGeneratingFilter
// 11  BasicAuthenticationFilter               the Authorization: Basic header
// 12  RequestCacheAwareFilter                 replays the URL you wanted before login
// 13  SecurityContextHolderAwareRequestFilter
// 14  AnonymousAuthenticationFilter           gives unauthenticated requests an
//                                             "anonymousUser" principal - this is why
//                                             getAuthentication() is rarely null
// 15  SessionManagementFilter
// 16  ExceptionTranslationFilter          AuthenticationException -> entry point (401)
//                                         AccessDeniedException   -> 403
// 17  AuthorizationFilter                 the decision. Throws upward to #16.
//
//     -> FilterChainProxy returns, DispatcherServlet runs, controller executes


// ---------- Print the real order for your own app ----------
logging.level.org.springframework.security=DEBUG

// CONSOLE OUTPUT at startup:
// Will secure any request with filters:
//   DisableEncodeUrlFilter, WebAsyncManagerIntegrationFilter, SecurityContextHolderFilter,
//   HeaderWriterFilter, CorsFilter, LogoutFilter, JWTAuthenticationFilter,
//   UsernamePasswordAuthenticationFilter, ..., ExceptionTranslationFilter,
//   AuthorizationFilter
//
// CONSOLE OUTPUT per request:
// Securing GET /getDemo
// Set SecurityContextHolder to UsernamePasswordAuthenticationToken [Principal=..., Granted
//   Authorities=[ROLE_USER]]
// Authorized filter invocation [GET /getDemo] with attributes [authenticated]
// Secured GET /getDemo


// ---------- The classic ordering mistake ----------
http.addFilterAfter(jwtFilter, AuthorizationFilter.class);   // WRONG
// The authorization decision has already been made against an empty context.
// OUTPUT: every protected endpoint returns 401 even with a perfectly valid token,
// and the filter's own log lines still print - which is what makes it baffling.

http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);  // right


// ---------- A @Component filter is registered TWICE ----------
// Annotating JWTAuthenticationFilter with @Component makes Boot auto-register it
// with the servlet container as well as inside the security chain, so it runs on
// every request including static resources - and runs twice on secured ones.
// OncePerRequestFilter suppresses the second execution within one dispatch, but
// the container-level registration still applies to paths security never sees.
@Bean
public FilterRegistrationBean<JWTAuthenticationFilter> disableAutoRegistration(
        JWTAuthenticationFilter filter) {
    FilterRegistrationBean<JWTAuthenticationFilter> reg =
            new FilterRegistrationBean<>(filter);
    reg.setEnabled(false);   // keep the bean, remove the container registration
    return reg;
}
// Cleaner still: drop @Component and construct the filter inside the config class.`]
        },

        {
            content: `<h3>Authentication and authorization are separate mechanisms</h3>
The two words get taught as a pair of definitions, but in Spring Security they are two distinct
subsystems with different interfaces, different failure modes and different HTTP status codes. Being
precise about which one is failing is most of the skill in debugging a security problem.<br><br>

<table>
<tr><th>Aspect</th><th>Detail</th></tr>
<tr><td>Authentication</td><td>Establishes <strong>who</strong> the caller is. Implemented by <code>AuthenticationManager</code> delegating to <code>AuthenticationProvider</code>s; produces an <code>Authentication</code> object placed in the <code>SecurityContext</code>. Failure raises <code>AuthenticationException</code> and the entry point returns <strong>401</strong>.</td></tr>
<tr><td>Authorization</td><td>Decides <strong>what</strong> that established identity may do. Implemented by <code>AuthorizationManager</code> against the request's <code>GrantedAuthority</code> set. Failure raises <code>AccessDeniedException</code> and returns <strong>403</strong>.</td></tr>
<tr><td>Ordering</td><td>Authentication always first. There is nothing to authorize until there is a principal - though an unauthenticated caller is given an <code>anonymousUser</code> principal, which is why <code>getAuthentication()</code> is usually non-null rather than null.</td></tr>
<tr><td>The 403-on-anonymous trap</td><td>Because anonymous authentication exists, a missing token can produce <strong>403 rather than 401</strong> on a chain with no configured entry point - exactly what the source material observes mid-exercise. Configure an explicit <code>authenticationEntryPoint</code> to get the correct 401.</td></tr>
<tr><td>ROLE_ prefix</td><td><code>hasRole("ADMIN")</code> checks for the authority <code>ROLE_ADMIN</code> - the prefix is added for you. <code>hasAuthority("ADMIN")</code> checks for the literal string <code>ADMIN</code>. Mixing the two silently denies access with no error message anywhere.</td></tr>
<tr><td>Roles against authorities</td><td>A role is a coarse label (ADMIN); an authority is a fine-grained permission (<code>order:delete</code>). Both are <code>GrantedAuthority</code> instances - the distinction is convention only, and large systems are better served by permissions.</td></tr>
</table>`,
            codeExamples: [`// ---------- Diagnosing which subsystem rejected the request ----------

// 401 with WWW-Authenticate header  -> AUTHENTICATION failed
//    no credentials, wrong password, expired/tampered token
// 403 with no WWW-Authenticate      -> AUTHORIZATION failed
//    identity accepted, authorities insufficient
// 403 on an ANONYMOUS request       -> usually a missing AuthenticationEntryPoint


// ---------- The ROLE_ prefix mistake, in full ----------
// Stored in the database:
user.setRoles("USER");

// Loaded as an authority:
User.withUsername(u).password(p).authorities("USER").build();
// -> GrantedAuthority is the literal string "USER"

// Rule in the filter chain:
.requestMatchers("/reports/**").hasRole("USER")
// -> hasRole prepends ROLE_, so it looks for "ROLE_USER" and does not find "USER"
//
// OUTPUT: 403 Forbidden, with nothing in the log to explain it.
//
// Two ways to fix, pick one and be consistent:
.authorities("ROLE_USER")  ... .hasRole("USER")       // prefix in the data
.authorities("USER")       ... .hasAuthority("USER")  // no prefix anywhere
//
// User.builder().roles("USER") adds the prefix for you and REJECTS a value that
// already has it:
//   IllegalArgumentException: USER cannot start with ROLE_ (it is automatically added)


// ---------- Authorization beyond URL patterns ----------
@Configuration
@EnableMethodSecurity     // replaces @EnableGlobalMethodSecurity(prePostEnabled = true)
public class MethodSecurityConfig { }

@Service
public class OrderService {

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteOrder(Long id) { }
    // called by a ROLE_USER principal:
    // OUTPUT: org.springframework.security.access.AccessDeniedException: Access Denied
    //         -> 403; the method body never executes

    // Ownership check - URL rules cannot express this, because the answer depends
    // on the data, not on the path.
    @PostAuthorize("returnObject.ownerUsername == authentication.name")
    public Order findById(Long id) { return repository.findById(id).orElseThrow(); }
    // The method RUNS and then the result is discarded on failure. If the method
    // has side effects, use @PreAuthorize with the id instead.
}

// ---------- Reading the current principal ----------
@GetMapping("/me")
public String me(@AuthenticationPrincipal UserDetails user) {
    return user.getUsername() + " " + user.getAuthorities();
}
// OUTPUT: javaindustry [ROLE_USER]
//
// SecurityContextHolder uses a ThreadLocal, so the context is NOT visible inside
// a plain new Thread(), a @Async method, or a parallel stream. For @Async:
//   SecurityContextHolder.setStrategyName(MODE_INHERITABLETHREADLOCAL);
// or wrap the executor in a DelegatingSecurityContextExecutor.`]
        },

        {
            content: `<h3>CSRF: what it defends, and why disabling it is safe only for stateless APIs</h3>
Nearly every Spring Security tutorial begins with <code>csrf().disable()</code> and never says why,
which produces developers who disable it on session-based applications too. The reasoning matters
more than the line of code.<br><br>

A <strong>cross-site request forgery</strong> works because the browser attaches
<strong>ambient credentials</strong> - a session cookie, or a saved Basic Auth credential - to a
request automatically, based only on the destination origin. It does not care which page caused the
request. So a form on <code>evil.example</code> can POST to <code>bank.example/transfer</code>, and
the browser will helpfully attach the victim's <code>bank.example</code> session cookie. The server
sees a perfectly authenticated request.<br><br>

The defence is to require a value the attacker's page cannot read: a random CSRF token rendered into
your own page and echoed back in the body or a header. The same-origin policy stops
<code>evil.example</code> from reading it.<br><br>

Now apply that to a JWT API. The token lives in <code>localStorage</code> or in memory and is
attached by <strong>your JavaScript</strong>, explicitly, on each request. A cross-site form post
carries no <code>Authorization</code> header - the attacker's page cannot add one, and the browser
will not add it for them. There is no ambient credential, so there is nothing to forge, and CSRF
protection defends against nothing. That - and only that - is what makes disabling it safe.<br><br>

<table>
<tr><th>Situation</th><th>CSRF setting</th></tr>
<tr><td>Session cookie plus form login, server-rendered pages</td><td>Leave it <strong>enabled</strong>. Disabling it is a live vulnerability.</td></tr>
<tr><td>JWT in the Authorization header, <code>SessionCreationPolicy.STATELESS</code></td><td>Safe to disable - no ambient credential exists.</td></tr>
<tr><td>JWT stored in a cookie</td><td>The cookie <strong>is</strong> ambient. You need CSRF protection again, plus <code>SameSite=Strict</code>. Storing a token in a cookie undoes the reason you disabled CSRF.</td></tr>
<tr><td>Single-page app plus session cookie</td><td>Keep it enabled and use <code>CookieCsrfTokenRepository.withHttpOnlyFalse()</code> so JavaScript can read the token and send it back as <code>X-XSRF-TOKEN</code>.</td></tr>
<tr><td>HTTP Basic from a browser</td><td>The browser caches and resends the credential, so it is ambient too. Keep CSRF enabled.</td></tr>
</table><br>

One further point on where a token is kept: <code>localStorage</code> is readable by any script on
the page, so a single XSS flaw hands the attacker the token. An <code>HttpOnly</code> cookie is
immune to XSS theft but reintroduces CSRF. There is no option without a trade-off; the usual answer
is a short-lived access token in memory plus a refresh token in an <code>HttpOnly</code>,
<code>SameSite</code> cookie.`,
            codeExamples: [`// ---------- The attack, when a session cookie is in play ----------
// Victim is logged in to bank.example (JSESSIONID cookie held by the browser).
// Victim then opens evil.example, which serves:
//
//   <form action="https://bank.example/transfer" method="POST" id="f">
//     <input name="to" value="attacker"><input name="amount" value="10000">
//   </form>
//   <script>document.getElementById('f').submit();</script>
//
// The browser attaches JSESSIONID because the request goes to bank.example.
// With csrf().disable(): the transfer SUCCEEDS.
// With CSRF enabled:
//   HTTP 403 Forbidden
//   AccessDeniedException: Invalid CSRF token found for https://bank.example/transfer
//
// The same page cannot mount the attack against a Bearer-token API: it has no way
// to set an Authorization header on a cross-origin form post, and the browser
// never adds one on its own.


// ---------- Correct configuration for a session-based app ----------
http.csrf(csrf -> csrf
        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
        .ignoringRequestMatchers("/api/webhooks/**"))   // exempt only what must be
   .formLogin(Customizer.withDefaults());
// Browser then receives:  Set-Cookie: XSRF-TOKEN=9c1e...; Path=/
// and the SPA must echo:  X-XSRF-TOKEN: 9c1e...


// ---------- Correct configuration for a stateless token API ----------
http.csrf(AbstractHttpConfigurer::disable)
    .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
// The two lines belong together. Disabling CSRF while still creating sessions
// is the dangerous combination, and it is easy to end up in by accident:
// STATELESS only stops Spring Security from using a session - a controller that
// calls request.getSession() still creates one.


// ---------- CSRF is not applied to safe methods ----------
// GET, HEAD, OPTIONS, TRACE are exempt by design. If a GET endpoint of yours
// changes state, CSRF protection will not save it - and that endpoint is
// vulnerable to a plain <img src="..."> tag. Do not mutate state on GET.`]
        },

        {
            content: `<h3>Session against stateless: what you actually trade</h3>
The exercise sets <code>SessionCreationPolicy.STATELESS</code> without discussing the cost. Both
models are legitimate; they fail in different ways, and the difference that matters most is
<strong>revocation</strong>.<br><br>

<table>
<tr><th>Aspect</th><th>Session (cookie)</th><th>Stateless (JWT)</th></tr>
<tr><td>Where identity lives</td><td>Server memory or a session store; the cookie is just a key</td><td>Inside the signed token, at the client</td></tr>
<tr><td>Per-request cost</td><td>A session store lookup</td><td>One HMAC verification, no I/O</td></tr>
<tr><td>Horizontal scaling</td><td>Needs sticky sessions or a shared store (Spring Session + Redis)</td><td>Any instance can verify independently</td></tr>
<tr><td>Revocation</td><td>Immediate - delete the session</td><td><strong>Not possible</strong> without adding server state, which gives back the statelessness</td></tr>
<tr><td>Changing a user's roles</td><td>Effective on the next request</td><td>Effective only when the token expires</td></tr>
<tr><td>Payload size</td><td>~32 bytes of cookie</td><td>500-1000 bytes on every request; large claim sets can exceed header limits</td></tr>
<tr><td>Logout</td><td>Genuine</td><td>Client-side only - the token stays valid until it expires</td></tr>
<tr><td>Main risk</td><td>Session fixation, cookie theft</td><td>Key compromise; a stolen token is usable for its full lifetime</td></tr>
</table><br>

That revocation row is the whole argument. A JWT is a bearer credential: whoever holds it is the
user, and the server has agreed in advance to accept it until it expires. The standard mitigation is
a <strong>short-lived access token</strong> (5-15 minutes) paired with a long-lived
<strong>refresh token</strong> that <em>is</em> stored server-side and can be revoked. That is a
hybrid, not pure statelessness, and admitting so is the honest position.<br><br>

For a single-instance internal application with no scaling requirement, a plain session is simpler,
revocable, and better. Choose JWT when you have several services or several instances that must
verify identity without a shared session store.`,
            codeExamples: [`// ---------- What SessionCreationPolicy actually controls ----------
// ALWAYS       always create a session
// IF_REQUIRED  default: create one when something needs it
// NEVER        never create one, but USE an existing one if it is there
// STATELESS    never create, never use - SecurityContext is discarded per request
//
// STATELESS does not stop your own code creating sessions:
@GetMapping("/x")
public String x(HttpServletRequest req) {
    req.getSession();   // creates a JSESSIONID regardless of the policy
    return "x";
}
// Symptom: an API that is supposedly stateless steadily leaks memory in the
// session store, and cross-site requests start carrying a cookie again.


// ---------- Short access token plus revocable refresh token ----------
@PostMapping("/token")
public TokenPair login(@RequestBody JWTRequest req) {
    authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.username(), req.password()));

    String access  = jwtUtil.generateToken(user, Duration.ofMinutes(15));
    String refresh = UUID.randomUUID().toString();   // opaque, not a JWT

    // Stored server-side, so it CAN be revoked. This is the state you traded
    // statelessness for - and it is worth it, because it is consulted once per
    // refresh rather than once per request.
    refreshTokenRepository.save(new RefreshToken(refresh, user.getId(),
            Instant.now().plus(Duration.ofDays(7))));

    return new TokenPair(access, refresh);
}

@PostMapping("/logout")
public void logout(@RequestBody RefreshRequest r) {
    refreshTokenRepository.deleteByToken(r.refreshToken());
    // The ACCESS token is still valid for up to 15 more minutes. Nothing can be
    // done about that without a blocklist - which is why the lifetime is short.
}


// ---------- Reading a token you were handed ----------
// Header and payload are base64url, NOT encrypted. Anyone can decode them:
//
//   echo 'eyJzdWIiOiJqYXZhaW5kdXN0cnkiLCJyb2xlcyI6IltST0xFX1VTRVJdIn0' | base64 -d
//
// OUTPUT:
// {"sub":"javaindustry","roles":"[ROLE_USER]"}
//
// The signature stops modification, not reading. Never put a password, a card
// number, or anything else confidential in a JWT claim.


// ---------- alg: none ----------
// A historic attack: strip the signature and set the header to {"alg":"none"}.
// Libraries that trusted the header's algorithm accepted it. jjwt 0.11+ and
// parserBuilder().verifyWith(key) reject unsigned tokens outright:
//   io.jsonwebtoken.UnsupportedJwtException: Unsigned Claims JWTs are not supported
// The lesson generalises: never let the token tell you how to verify it.`]
        },

        {
            content: `<h3>Failure modes worth recognising on sight</h3>
<table>
<tr><th>Symptom</th><th>Cause</th></tr>
<tr><td>Every request returns 401 despite a token that decodes correctly</td><td>The JWT filter is registered after <code>AuthorizationFilter</code>, or not registered on the chain that matched. Enable <code>logging.level.org.springframework.security=DEBUG</code> and read the filter list printed at startup.</td></tr>
<tr><td>Postman reports "socket hang up" on <code>POST /token</code></td><td><code>filterChain.doFilter(...)</code> is inside the <code>if (header != null)</code> block, so an unauthenticated request is never forwarded and no response is written. This is the bug in the source material.</td></tr>
<tr><td>403 instead of 401 for a missing token</td><td>Anonymous authentication succeeded and the authorization rule then denied it. Configure an explicit <code>authenticationEntryPoint</code>.</td></tr>
<tr><td><code>There is no PasswordEncoder mapped for the id "null"</code></td><td>The context holds a <code>DelegatingPasswordEncoder</code> but the stored hash has no <code>{bcrypt}</code> prefix. Either declare a concrete encoder bean or prefix the stored values.</td></tr>
<tr><td><code>WeakKeyException: The signing key's size is 48 bits</code></td><td>A short HMAC secret such as <code>"secret"</code>. HS256 requires 256 bits; generate 32 random bytes and hold them in configuration or a secrets manager.</td></tr>
<tr><td><code>NoClassDefFoundError: javax/xml/bind/DatatypeConverter</code></td><td>jjwt 0.9.0 on Java 11 or later. Upgrade to jjwt 0.12.x rather than adding the <code>jaxb-api</code> shim.</td></tr>
<tr><td>Login always fails although the password is demonstrably correct</td><td>The password was stored unencoded, or was encoded twice - a <code>@PrePersist</code> hook that encodes plus a service that also encodes. Print the stored value: a bcrypt hash starts with <code>$2a$</code> and is exactly 60 characters.</td></tr>
<tr><td>Passwords longer than 72 characters all behave as the same password</td><td>BCrypt truncates its input at 72 bytes. Reject over-long passwords, or pre-hash with SHA-512 before encoding.</td></tr>
<tr><td>Authentication works but <code>SecurityContextHolder</code> is empty in a <code>@Async</code> method</td><td>The context is held in a <code>ThreadLocal</code>. Use <code>DelegatingSecurityContextExecutor</code> or the <code>MODE_INHERITABLETHREADLOCAL</code> strategy.</td></tr>
<tr><td>A browser front end gets CORS errors after security is added</td><td>The preflight <code>OPTIONS</code> request has no credentials and is rejected. Configure <code>.cors(...)</code> with real origins - do not "fix" it with <code>cors().disable()</code>, which removes the headers entirely.</td></tr>
<tr><td>Every authenticated request triggers a database SELECT</td><td>Expected for a stateless API - each request reloads the user. Cache <code>UserDetails</code> briefly, or carry the authorities as claims inside the token and skip the lookup, accepting that role changes then lag until the token expires.</td></tr>
<tr><td>Security rules work in the app but not in <code>@WebMvcTest</code></td><td>Slice tests do not import your <code>SecurityFilterChain</code> unless you add <code>@Import(SecurityConfig.class)</code>, and they need <code>spring-security-test</code> with <code>@WithMockUser</code>.</td></tr>
</table>`,
            codeExamples: [`// ---------- Testing the rules, rather than clicking through Postman ----------
@WebMvcTest(TestController.class)
@Import(SecurityConfig.class)      // slice tests do NOT pick this up on their own
class TestControllerSecurityTest {

    @Autowired MockMvc mvc;

    @Test
    void anonymousIsRejected() throws Exception {
        mvc.perform(get("/getBasicExample"))
           .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "javaindustry", roles = "USER")
    void authenticatedUserIsAllowed() throws Exception {
        mvc.perform(get("/getBasicExample"))
           .andExpect(status().isOk())
           .andExpect(content().string("This is the basic spring boot security example"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void nonAdminCannotReachAdminEndpoint() throws Exception {
        mvc.perform(get("/admin/reports"))
           .andExpect(status().isForbidden());   // 403, not 401 - identity was fine
    }

    @Test
    void basicAuthWithRealCredentials() throws Exception {
        mvc.perform(get("/getBasicExample")
                .with(httpBasic("javaindustry", "industry12345")))
           .andExpect(status().isOk());
    }
}

// OUTPUT:
// Tests run: 4, Failures: 0
//
// These four tests catch the ROLE_ prefix mistake, the filter-ordering mistake and
// an accidentally permitAll'd endpoint, in about a second, on every build. Manual
// Postman checks catch them once, on the day you happen to look.`]
        },

        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why was WebSecurityConfigurerAdapter deprecated, and in which version?</td><td>Deprecated in Spring Security 5.7 and removed in 6.0. It forced configuration through inheritance, which prevented multiple independent chains, made ordering opaque and made rules hard to test in isolation. The replacement is a component model: publish a SecurityFilterChain bean and let Spring compose it.</td></tr>
<tr class='text-center'><td>Write the modern equivalent of configure(HttpSecurity).</td><td>A @Bean method taking HttpSecurity, configured with the lambda DSL and returning http.build(); antMatchers becomes requestMatchers, authorizeRequests becomes authorizeHttpRequests, and .and() chaining disappears because each configurer takes a Customizer.</td></tr>
<tr class='text-center'><td>What replaces configure(AuthenticationManagerBuilder)?</td><td>Nothing is overridden - publish a UserDetailsService and a PasswordEncoder bean and Boot builds a DaoAuthenticationProvider automatically. Where an explicit AuthenticationManager is needed, obtain it from AuthenticationConfiguration.getAuthenticationManager().</td></tr>
<tr class='text-center'><td>Why must NoOpPasswordEncoder never be used?</td><td>It stores passwords in plain text and compares with String.equals, so any database leak exposes every real password, and the non-constant-time comparison leaks how many leading characters matched. It has been deprecated since Spring Security 5.0 and exists only to let a legacy system boot during migration.</td></tr>
<tr class='text-center'><td>Why BCrypt or Argon2 rather than SHA-256?</td><td>Password hashes must be deliberately slow and individually salted. SHA-256 is fast by design - billions of guesses per second on a GPU. BCrypt salts automatically and has a tunable work factor; Argon2id is additionally memory-hard, which is what defeats GPU and ASIC attackers.</td></tr>
<tr class='text-center'><td>Why does encoding the same password twice give different hashes, and how does login still work?</td><td>Each call generates a fresh random salt, which is stored inside the hash string. matches() extracts that salt, re-hashes the supplied password with it, and compares. This is why a login can never be implemented as a SQL WHERE password = ? comparison.</td></tr>
<tr class='text-center'><td>Where in the filter chain must a custom JWT filter go, and why?</td><td>Before UsernamePasswordAuthenticationFilter, and therefore well before AuthorizationFilter. AuthorizationFilter is last and makes the decision, so any filter that establishes identity must have already populated the SecurityContext - register it later and every request 401s despite a valid token.</td></tr>
<tr class='text-center'><td>What does ExceptionTranslationFilter do?</td><td>It sits directly above AuthorizationFilter and converts security exceptions into HTTP: AuthenticationException invokes the AuthenticationEntryPoint (401 or a login redirect) and AccessDeniedException becomes 403. Exceptions thrown above it in the chain are not translated and surface as 500s.</td></tr>
<tr class='text-center'><td>Authentication or authorization - which fails with 401 and which with 403?</td><td>Authentication failure gives 401 with a WWW-Authenticate header: identity was not established. Authorization failure gives 403: identity is accepted but the authorities are insufficient. A missing token can wrongly produce 403 when anonymous authentication succeeds and no AuthenticationEntryPoint is configured.</td></tr>
<tr class='text-center'><td>Why is csrf().disable() safe on a JWT API but dangerous on a session app?</td><td>CSRF exploits ambient credentials the browser attaches automatically, such as a session cookie. A Bearer token is attached explicitly by your own JavaScript and cannot be added by an attacker's page, so there is nothing to forge. With a session cookie the ambient credential exists and disabling CSRF is a live vulnerability - as it is if you store the JWT in a cookie.</td></tr>
<tr class='text-center'><td>What does SessionCreationPolicy.STATELESS actually guarantee?</td><td>Only that Spring Security will neither create nor read an HttpSession, and that the SecurityContext is discarded after each request. Application code calling request.getSession() still creates one, so the API is not as stateless as the setting suggests.</td></tr>
<tr class='text-center'><td>How do you revoke a JWT before it expires?</td><td>You cannot, without reintroducing server state. The practical answer is a short-lived access token (5-15 minutes) plus a revocable refresh token held server-side; logout deletes the refresh token and the access token simply expires. A blocklist works but trades away the statelessness that motivated JWT.</td></tr>
<tr class='text-center'><td>Is a JWT encrypted?</td><td>No. Header and payload are base64url-encoded and readable by anyone holding the token; the signature only detects modification. Never place passwords or other confidential data in a claim, and always verify with a key you chose - never with the algorithm the token's own header names.</td></tr>
<tr class='text-center'><td>hasRole("ADMIN") against hasAuthority("ADMIN") - what is the difference?</td><td>hasRole prepends ROLE_ and therefore checks for the authority ROLE_ADMIN, while hasAuthority checks the literal string. Storing "ADMIN" and testing hasRole("ADMIN") denies access silently with nothing logged - one of the most common and least obvious security bugs.</td></tr>
</table>`
        }
    ]
};
