// Spring Core roadmap, part 4: sections 16-20 (JDBC and data access, security fundamentals, testing, advanced core, interview questions).
// Examples use Spring Framework 6 / Spring Boot 3 and Java 21. "${...}" placeholders are written "\${...}" in these template literals.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';
import { springCoreExamplesFull } from './RoadmapExamples2';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const sc = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('sc', n, title, priority, topics);

const springCoreRoadmap4Base: SubTopic[] = [
  sc(16, 'Spring JDBC and Data Access', 'Core', [
    topic(
      'sc-jdbc-template-client',
      'JdbcTemplate, NamedParameterJdbcTemplate, JdbcClient, RowMapper and Batch Operations',
      [
        blk(`<h3>Why Spring JDBC?</h3>
• Raw JDBC needs boilerplate: open connection, prepare statement, bind, execute, map rows, close everything, translate <code>SQLException</code>. <b><code>JdbcTemplate</code></b> removes it: it <b>acquires/releases connections</b>, executes, maps rows and <b>translates exceptions</b> into Spring's unchecked <code>DataAccessException</code> hierarchy. You supply only the SQL and the mapping. Starter: <code>spring-boot-starter-jdbc</code> (HikariCP DataSource auto-configured from <code>spring.datasource.*</code>).`,
          `// Raw JDBC (what you avoid)
try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement("select id, title from course where level = ?")) {
    ps.setString(1, "BEGINNER");
    try (ResultSet rs = ps.executeQuery()) { while (rs.next()) { /* map */ } }
} catch (SQLException e) { throw new RuntimeException(e); }

// JdbcTemplate
@Repository
class CourseDao {
    private final JdbcTemplate jdbc;
    CourseDao(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    List<Course> byLevel(String level) {
        return jdbc.query("select id, title, price from course where level = ?",
                (rs, n) -> new Course(rs.getObject("id", UUID.class), rs.getString("title"), rs.getBigDecimal("price")), level);
    }
    int count() { return jdbc.queryForObject("select count(*) from course", Integer.class); }
    int rename(UUID id, String title) { return jdbc.update("update course set title = ? where id = ?", title, id); }
}`,
        ),
      ],
      [
        blk(`<h3>NamedParameterJdbcTemplate, SimpleJdbcInsert and JdbcClient</h3>
• <b><code>NamedParameterJdbcTemplate</code></b> uses <code>:name</code> placeholders (readable; <code>MapSqlParameterSource</code>, <code>BeanPropertySqlParameterSource</code>, IN lists expand automatically). <b><code>SimpleJdbcInsert</code></b> builds inserts from table metadata (and returns generated keys); <b><code>SimpleJdbcCall</code></b> calls stored procedures. <b><code>JdbcClient</code></b> (Spring 6.1) is a fluent facade over both: <code>sql(...).param(...).query(Type).list()/optional()/single()</code>.<br>
• <b>Always use bound parameters</b>, never string concatenation: that prevents <b>SQL injection</b>.`,
          `@Repository
class StudentDao {
    private final JdbcClient jdbc;
    StudentDao(JdbcClient jdbc) { this.jdbc = jdbc; }

    Optional<Student> find(UUID id) {
        return jdbc.sql("select * from student where id = :id").param("id", id).query(Student.class).optional();        // maps columns to record by name
    }
    List<Student> byCities(Collection<String> cities) {
        return jdbc.sql("select * from student where city in (:cities) order by name").param("cities", cities).query(Student.class).list();
    }
    int insert(Student s) {
        return jdbc.sql("insert into student(id, name, city) values (:id, :name, :city)").paramSource(s).update();       // bind record components
    }
}

// Generated keys with KeyHolder
KeyHolder kh = new GeneratedKeyHolder();
named.update("insert into course(title) values(:t)", new MapSqlParameterSource("t", "Spring"), kh, new String[]{"id"});
long id = kh.getKey().longValue();`,
        ),
      ],
      [
        blk(`<h3>RowMapper, ResultSetExtractor and batch operations</h3>
• <code>RowMapper&lt;T&gt;</code> maps <b>one row</b> to an object (reusable); <code>ResultSetExtractor</code> processes the <b>whole</b> result (grouping parent/child rows); <code>RowCallbackHandler</code> streams rows with no result list (large data); <code>BeanPropertyRowMapper</code>/<code>DataClassRowMapper</code> map by column names. <b>Batch</b>: <code>batchUpdate(sql, BatchPreparedStatementSetter | List&lt;Object[]&gt; | SqlParameterSource[])</code> sends many statements in one round-trip: set <code>reWriteBatchedInserts=true</code> (PostgreSQL) for speed; chunk big batches.`,
          `RowMapper<Course> mapper = (rs, rowNum) -> new Course(rs.getObject("id", UUID.class), rs.getString("title"), rs.getBigDecimal("price"));

// parent + children in one query
Map<UUID, Course> courses = jdbc.query("select c.id, c.title, l.title lesson from course c join lesson l on l.course_id = c.id", rs -> {
    Map<UUID, Course> map = new LinkedHashMap<>();
    while (rs.next()) { map.computeIfAbsent(rs.getObject("id", UUID.class), id -> new Course(id, rs.getString("title"))).lessons().add(rs.getString("lesson")); }
    return map;
});

// batch insert: 10_000 rows in chunks of 1000
int[][] counts = jdbc.batchUpdate("insert into enrollment(student_id, course_id) values (?, ?)", enrollments, 1000,
        (ps, e) -> { ps.setObject(1, e.studentId()); ps.setObject(2, e.courseId()); });`,
        ),
      ],
      [
        ['What does JdbcTemplate give you over plain JDBC?', 'It manages connections and resources, executes SQL, offers row mapping and batch helpers and translates SQLException into the DataAccessException hierarchy, so you write only the SQL and mapping.'],
        ['Why prefer named parameters?', 'They make SQL readable, support IN-list expansion and bean binding and still use prepared statements, protecting against SQL injection.'],
        ['When use ResultSetExtractor instead of RowMapper?', 'When you must process the entire result set at once, e.g. to assemble parent/child object graphs from a join.'],
      ],
    ),
    topic(
      'sc-datasource-pool-tx-exceptions',
      'DataSource, Connection Pooling, Transactions with JDBC and Exception Translation',
      [
        blk(`<h3>DataSource and connection pooling</h3>
• A <code>DataSource</code> hands out connections. Never use <code>DriverManagerDataSource</code> in production (new connection per call). Use a <b>connection pool</b>: <b>HikariCP</b> (Boot default): <code>maximumPoolSize</code> (default 10), <code>minimumIdle</code>, <code>connectionTimeout</code> (30s), <code>idleTimeout</code>, <code>maxLifetime</code> (shorter than DB/ proxy timeout), <code>leakDetectionThreshold</code>. <b>Pool sizing</b>: small pools perform best (connections ≈ cores × 2 + disks); size to what the <b>database</b> can serve across all application instances.`,
          `# application.yml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/jsl
    username: \${DB_USER}
    password: \${DB_PASSWORD}
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 3000
      max-lifetime: 1500000          # 25 min < DB/proxy idle timeout
      leak-detection-threshold: 20000
      pool-name: jsl-pool

@Bean DataSource dataSource(DataSourceProperties props) { return props.initializeDataSourceBuilder().type(HikariDataSource.class).build(); }`,
        ),
      ],
      [
        blk(`<h3>JDBC transactions and transaction-aware connections</h3>
• <code>DataSourceTransactionManager</code> binds one <code>Connection</code> to the thread for the duration of the transaction; <code>JdbcTemplate</code> obtains it through <code>DataSourceUtils.getConnection</code>, so every DAO call inside the same <code>@Transactional</code> method uses the <b>same connection and transaction</b>. If you use <code>dataSource.getConnection()</code> directly you bypass this: always wrap with <code>DataSourceUtils</code> or use the template. Use <code>TransactionAwareDataSourceProxy</code> for legacy code. <b>Multiple data sources</b> need separate transaction managers and qualifiers.`,
          `@Service
class TransferService {
    private final JdbcTemplate jdbc;
    TransferService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional
    void transfer(long from, long to, BigDecimal amount) {
        int debited = jdbc.update("update account set balance = balance - ? where id = ? and balance >= ?", amount, from, amount);
        if (debited == 0) throw new InsufficientFundsException(from);                              // RuntimeException -> rollback
        jdbc.update("update account set balance = balance + ? where id = ?", amount, to);          // same connection/transaction
    }
}`,
        ),
      ],
      [
        blk(`<h3>Exception translation: the DataAccessException hierarchy</h3>
• Spring converts vendor-specific <code>SQLException</code>/JPA/Hibernate exceptions into a <b>technology-neutral, unchecked hierarchy</b> rooted at <code>DataAccessException</code>: <code>DuplicateKeyException</code> / <code>DataIntegrityViolationException</code> (constraint), <code>EmptyResultDataAccessException</code> (<code>queryForObject</code> found none), <code>IncorrectResultSizeDataAccessException</code>, <code>DataAccessResourceFailureException</code>, <code>CannotAcquireLockException</code>, <code>DeadlockLoserDataAccessException</code>, <code>OptimisticLockingFailureException</code>, <code>QueryTimeoutException</code>, <code>BadSqlGrammarException</code>. Translators: <code>SQLErrorCodeSQLExceptionTranslator</code> (uses vendor error codes), <code>SQLStateSQLExceptionTranslator</code>; JPA repositories get translation from <b><code>@Repository</code></b> + <code>PersistenceExceptionTranslationPostProcessor</code>. Separate <b>transient</b> (retry) from <b>non-transient</b> failures.`,
          `try {
    courseDao.insert(course);
} catch (DuplicateKeyException e) {                                  // vendor independent: PostgreSQL 23505, MySQL 1062 ...
    throw new CourseAlreadyExistsException(course.slug(), e);
} catch (TransientDataAccessException e) {
    // deadlock, lock timeout, connectivity: safe to retry
} catch (DataAccessException e) {
    log.error("data access failure", e);
    throw e;
}

Optional<Course> find(UUID id) {
    try { return Optional.of(jdbc.queryForObject("select ...", mapper, id)); }
    catch (EmptyResultDataAccessException e) { return Optional.empty(); }        // or use jdbc.query(...).stream().findFirst()
}`,
        ),
      ],
      [
        ['What is exception translation?', 'Converting vendor-specific persistence exceptions into Spring\'s unchecked DataAccessException hierarchy so the service layer is independent of JDBC/JPA/Hibernate details; @Repository beans get it automatically.'],
        ['How do you size a HikariCP pool?', 'Keep it small, based on what the database can process concurrently (roughly cores×2 + disks), multiplied by application instances, and tune timeouts and max lifetime below infrastructure idle limits.'],
        ['Why must JDBC code use the template or DataSourceUtils inside a transaction?', 'They enlist in the thread-bound transaction connection; opening a connection directly from the DataSource bypasses the transaction and acts autonomously.'],
      ],
    ),
    topic(
      'sc-orm-data-access-patterns',
      'ORM Integration, Repository/DAO Patterns and Data Access Best Practices',
      [
        blk(`<h3>ORM integration and repositories</h3>
• Spring integrates <b>JPA/Hibernate</b> (<code>LocalContainerEntityManagerFactoryBean</code>, <code>JpaTransactionManager</code>, shared <code>EntityManager</code> proxy via <code>@PersistenceContext</code>), MyBatis, jOOQ. <b>Spring Data</b> generates repository implementations from interfaces (<code>JpaRepository</code>, derived queries, <code>@Query</code>, projections, paging, specifications). Choose <b>JdbcTemplate/JdbcClient/jOOQ</b> for set-based SQL, reporting and bulk operations; JPA for rich domain models with CRUD.`,
          `public interface CourseRepository extends JpaRepository<Course, UUID> {
    Optional<Course> findBySlug(String slug);
    @Query("select c from Course c where c.level = :level and c.price <= :max") List<Course> affordable(Level level, BigDecimal max);
    Page<CourseSummary> findByLevel(Level level, Pageable pageable);                    // interface/record projection
}
@PersistenceContext EntityManager em;                                                  // shared, transaction-bound proxy`,
        ),
      ],
      [
        blk(`<h3>DAO vs Repository, and data access design</h3>
<table ${TABLE}>
<tr><th></th><th>DAO</th><th>Repository</th></tr>
<tr><td>Abstraction</td><td>Wraps a table/data source (technical)</td><td>Collection of <b>aggregates</b> (domain, DDD)</td></tr>
<tr><td>Interface</td><td>CRUD per table</td><td>Methods in domain language (<code>findActiveCourses</code>)</td></tr>
<tr><td>Typical in Spring</td><td><code>@Repository</code> with JdbcTemplate</td><td>Spring Data repositories</td></tr>
</table>
• Keep the persistence API behind an <b>interface</b> owned by the domain; do not let entities/JPA types leak into controllers (use DTOs); keep <b>transactions in services</b>; avoid N+1 queries (fetch joins, <code>@EntityGraph</code>, batch size); paginate; use indexes; version schema with <b>Flyway/Liquibase</b>, never <code>ddl-auto=update</code> in production.`,
          `interface CourseCatalogue { Optional<Course> bySlug(String slug); List<Course> published(); void save(Course c); }      // domain-owned port

@Repository class JpaCourseCatalogue implements CourseCatalogue {                                                      // adapter
    private final CourseRepository repo;
    JpaCourseCatalogue(CourseRepository repo) { this.repo = repo; }
    public Optional<Course> bySlug(String slug) { return repo.findBySlug(slug); }
    public List<Course> published() { return repo.findByPublishedTrue(); }
    public void save(Course c) { repo.save(c); }
}`,
        ),
      ],
      [
        blk(`<h3>Performance and safety checklist for data access</h3>
• Fetch only what you need (projections, pagination, <code>select</code> columns), prevent N+1 (join fetch, <code>@EntityGraph</code>, <code>default_batch_fetch_size</code>), use <b>batching</b> for bulk writes, add indexes for query predicates and check plans (<code>EXPLAIN</code>), set timeouts, keep transactions short, use <b>optimistic locking</b> for concurrent updates, version the schema with Flyway/Liquibase, and never concatenate SQL.`,
          `# Hibernate/JPA settings worth knowing
spring.jpa.open-in-view=false                       # avoid lazy loading during view rendering
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.default_batch_fetch_size=32
spring.jpa.hibernate.ddl-auto=validate              # schema is owned by Flyway`,
        ),
      ],
      [
        ['JdbcTemplate vs JPA: when to use which?', 'JdbcTemplate/JdbcClient give full SQL control for reports, bulk and set-based work; JPA/Hibernate suit rich object models with CRUD and relationships; many applications use both in one transaction.'],
        ['DAO vs Repository?', 'A DAO is a technical per-table data gateway; a Repository represents a domain collection of aggregates with domain-oriented methods; Spring Data repositories follow the latter style.'],
        ['What is the N+1 problem?', 'One query loads N parents and then N additional queries load each child lazily; fix with join fetch, entity graphs, batch fetching or projections.'],
      ],
    ),
  ]),

  sc(17, 'Spring Security Fundamentals (Separate Project)', 'Core', [
    topic(
      'sc-security-architecture',
      'Spring Security Overview: Authentication, Authorization and the Filter Chain',
      [
        blk(`<h3>What Spring Security provides</h3>
• <b>Spring Security</b> is a separate project that secures applications: <b>authentication</b> (who are you?), <b>authorization</b> (what may you do?), protection against common attacks (CSRF, session fixation, clickjacking, security headers), password encoding, OAuth2/OIDC/JWT resource server and login, method security. It is built on <b>servlet filters</b> plus AOP method interceptors.<br>
• <b>Core objects</b>: <code>SecurityContext</code> / <code>SecurityContextHolder</code> (thread-bound), <code>Authentication</code> (principal, credentials, authorities, authenticated flag), <code>GrantedAuthority</code> (<code>ROLE_ADMIN</code>, <code>SCOPE_read</code>), <code>UserDetails</code> / <code>UserDetailsService</code>, <code>AuthenticationManager</code> / <code>ProviderManager</code> / <code>AuthenticationProvider</code>, <code>PasswordEncoder</code>.`,
          `Authentication auth = SecurityContextHolder.getContext().getAuthentication();
String user = auth.getName();
boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

@GetMapping("/me") Map<String, Object> me(@AuthenticationPrincipal UserDetails principal, Authentication auth) { return Map.of("user", principal.getUsername(), "roles", auth.getAuthorities()); }`,
        ),
      ],
      [
        blk(`<h3>The filter chain</h3>
• A request passes through the <code>DelegatingFilterProxy</code> → <code>FilterChainProxy</code> → one <b><code>SecurityFilterChain</code></b> (the first whose matcher matches) containing ordered filters: <code>SecurityContextHolderFilter</code>, <code>HeaderWriterFilter</code>, <code>CsrfFilter</code>, <code>LogoutFilter</code>, <code>UsernamePasswordAuthenticationFilter</code> / <code>BearerTokenAuthenticationFilter</code> / <code>BasicAuthenticationFilter</code>, <code>RequestCacheAwareFilter</code>, <code>AnonymousAuthenticationFilter</code>, <code>ExceptionTranslationFilter</code> (401/403 handling), <code>AuthorizationFilter</code> (access decision). Flow: <b>authentication filter → AuthenticationManager → AuthenticationProvider → UserDetailsService + PasswordEncoder → Authentication stored in the SecurityContext</b>; later <b>authorization</b> decides access. Enable debug: <code>logging.level.org.springframework.security=DEBUG</code>.`,
          `@Configuration @EnableWebSecurity @EnableMethodSecurity
class SecurityConfig {
    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))                       // stateless API with tokens
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> a
                .requestMatchers("/public/**", "/actuator/health").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/courses/**").hasAuthority("SCOPE_courses.read")
                .anyRequest().authenticated())
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
            .build();
    }
}`,
        ),
      ],
      [
        blk(`<h3>Multiple filter chains and custom filters</h3>
• Define several <code>SecurityFilterChain</code> beans ordered with <code>@Order</code> and a <code>securityMatcher</code> (e.g. a stateless <code>/api/**</code> chain with JWT and a session-based chain for the admin UI). Add custom filters with <code>addFilterBefore/After</code> relative to a known filter (for API keys, tenant resolution, request ids). Remember that <b>filter order matters</b> and that Spring Security 6 requires explicit <code>authorizeHttpRequests</code> rules (deny by default is recommended).`,
          `@Bean @Order(1)
SecurityFilterChain api(HttpSecurity http) throws Exception {
    return http.securityMatcher("/api/**")
        .csrf(c -> c.disable()).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .addFilterBefore(new ApiKeyFilter(keys), BearerTokenAuthenticationFilter.class)
        .authorizeHttpRequests(a -> a.anyRequest().authenticated()).oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults())).build();
}
@Bean @Order(2)
SecurityFilterChain ui(HttpSecurity http) throws Exception {
    return http.authorizeHttpRequests(a -> a.requestMatchers("/login", "/css/**").permitAll().anyRequest().authenticated()).formLogin(Customizer.withDefaults()).build();
}`,
        ),
      ],
      [
        ['Authentication vs authorization?', 'Authentication verifies identity (login, token); authorization decides what an authenticated principal may access (roles, authorities, rules).'],
        ['How does Spring Security work internally?', 'A chain of servlet filters authenticates the request through an AuthenticationManager and its providers, stores the Authentication in the SecurityContext (thread-bound) and an authorization filter/method interceptor then makes access decisions.'],
        ['Role vs authority?', 'Authority is any granted permission string; a role is an authority with the ROLE_ prefix (hasRole("ADMIN") checks ROLE_ADMIN).'],
      ],
    ),
    topic(
      'sc-security-users-passwords-methods',
      'UserDetailsService, Password Encoding, Method Security, CSRF and CORS',
      [
        blk(`<h3>UserDetailsService and PasswordEncoder</h3>
• <code>UserDetailsService.loadUserByUsername</code> loads the user (database, LDAP); the <code>DaoAuthenticationProvider</code> compares the submitted password with <code>PasswordEncoder.matches</code>. <b>Never store plain text or fast hashes (MD5/SHA-1)</b>: use <b><code>BCryptPasswordEncoder</code></b>, Argon2, SCrypt or <code>DelegatingPasswordEncoder</code> (<code>PasswordEncoderFactories.createDelegatingPasswordEncoder()</code>: stores <code>{bcrypt}...</code> to allow algorithm upgrades). Never log passwords or tokens. Pick a work factor that takes ~100–300 ms.`,
          `@Bean PasswordEncoder passwordEncoder() { return PasswordEncoderFactories.createDelegatingPasswordEncoder(); }       // {bcrypt}$2a$10$...

@Service
class DbUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    DbUserDetailsService(UserRepository users) { this.users = users; }
    public UserDetails loadUserByUsername(String username) {
        User u = users.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("unknown user"));
        return org.springframework.security.core.userdetails.User.withUsername(u.email())
                .password(u.passwordHash()).roles(u.roles().toArray(String[]::new)).accountLocked(u.locked()).build();
    }
}
String hash = passwordEncoder.encode("Sup3r$ecret");           // store this
boolean ok = passwordEncoder.matches(input, hash);`,
        ),
      ],
      [
        blk(`<h3>Method-level security</h3>
• <code>@EnableMethodSecurity</code> activates <code>@PreAuthorize</code>/<code>@PostAuthorize</code>/<code>@PreFilter</code>/<code>@PostFilter</code> (and <code>@Secured</code>, JSR-250 <code>@RolesAllowed</code>), implemented as AOP interceptors, so proxy rules (public, external calls) apply. Use SpEL: <code>hasRole</code>, <code>hasAuthority</code>, <code>#param</code>, <code>authentication.principal</code>, <code>@bean.check(#id)</code>, <code>returnObject</code>. Secure at the <b>service layer</b> too (defence in depth), not only URLs.`,
          `@Service
class DocumentService {
    @PreAuthorize("hasRole('ADMIN') or @access.isOwner(#id, authentication.name)")
    Document load(UUID id) { ... }

    @PostAuthorize("returnObject.owner == authentication.name")
    Document find(UUID id) { ... }

    @PreAuthorize("hasAuthority('SCOPE_courses.write')")
    void publish(UUID courseId) { ... }
}
@Component("access") class AccessChecker { boolean isOwner(UUID id, String user) { return docs.ownerOf(id).equals(user); } }`,
        ),
      ],
      [
        blk(`<h3>CSRF, CORS, sessions and common attacks</h3>
• <b>CSRF</b>: browsers auto-send cookies, so a malicious site can trigger state-changing requests; Spring Security requires a CSRF token on unsafe methods for <b>session/cookie</b> apps; stateless token (Bearer) APIs can disable it. <b>CORS</b>: configure allowed origins/methods/headers explicitly (<code>CorsConfigurationSource</code>; no <code>*</code> with credentials). <b>Session fixation</b> protection and <b>secure cookies</b> (<code>HttpOnly</code>, <code>Secure</code>, <code>SameSite</code>). Security headers on by default (<code>X-Content-Type-Options</code>, <code>X-Frame-Options</code>, HSTS). Also: <b>OWASP top 10</b> (injection → parameterised queries, broken access control → deny by default, XSS → output encoding), validate input, rate limit, keep dependencies updated.`,
          `@Bean
CorsConfigurationSource cors() {
    var c = new CorsConfiguration();
    c.setAllowedOrigins(List.of("https://app.javaschoollab.com"));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    c.setAllowCredentials(true);
    var src = new UrlBasedCorsConfigurationSource(); src.registerCorsConfiguration("/api/**", c); return src;
}
// http.cors(Customizer.withDefaults()).csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));`,
        ),
      ],
      [
        ['How should passwords be stored?', 'Hashed with a slow, salted algorithm such as bcrypt/Argon2 via a PasswordEncoder (DelegatingPasswordEncoder to allow upgrades), never in plain text or with fast hashes.'],
        ['What is CSRF and when can you disable it?', 'An attack that makes a victim\'s browser send authenticated state-changing requests; protection uses tokens. For stateless APIs authenticated with Bearer tokens (not cookies) CSRF protection can be disabled.'],
        ['@PreAuthorize vs URL security?', 'URL rules protect endpoints at the web layer; @PreAuthorize protects service methods via AOP and supports SpEL, giving defence in depth.'],
      ],
    ),
  ]),

  sc(18, 'Spring Testing', 'Core', [
    topic(
      'sc-testing-unit-vs-spring',
      'Testing Strategy: Unit Tests with Constructor Injection and Mockito',
      [
        blk(`<h3>Test pyramid for Spring applications</h3>
• Most tests should be <b>fast plain unit tests</b> (no Spring context): this is the main payoff of <b>constructor injection</b>: <code>new Service(fakeRepo)</code>. Then <b>slice tests</b> (<code>@WebMvcTest</code>, <code>@DataJpaTest</code>, <code>@JsonTest</code>) loading only part of the context, then a few <b>full integration tests</b> (<code>@SpringBootTest</code> with Testcontainers). Use <b>JUnit 5</b> + <b>Mockito</b> + <b>AssertJ</b> (included by <code>spring-boot-starter-test</code>).`,
          `@ExtendWith(MockitoExtension.class)
class EnrollmentServiceTest {
    @Mock CourseRepository courses;
    @Mock Notifier notifier;
    @InjectMocks EnrollmentService service;                   // constructor injection with mocks

    @Test
    void enrolsStudentAndNotifies() {
        var course = new Course(UUID.randomUUID(), "Spring Core", 30);
        when(courses.findById(course.id())).thenReturn(Optional.of(course));

        Enrollment e = service.enroll(UUID.randomUUID(), course.id());

        assertThat(e.course()).isEqualTo(course);
        verify(notifier).sendWelcome(e.studentId());
        verifyNoMoreInteractions(notifier);
    }

    @Test
    void failsWhenCourseMissing() {
        when(courses.findById(any())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.enroll(UUID.randomUUID(), UUID.randomUUID())).isInstanceOf(CourseNotFoundException.class);
    }
}`,
        ),
      ],
      [
        blk(`<h3>Testing guidelines</h3>
• Test <b>behaviour</b>, not implementation; one assertion concept per test; deterministic (inject <code>Clock</code>, random seeds); no shared mutable state; do not mock what you own heavily (prefer fakes/in-memory implementations); never mock the class under test. Parameterise with <code>@ParameterizedTest</code>.`,
          `@ParameterizedTest
@CsvSource({"0,0", "100,10", "1000,150"})
void discount(int amount, int expected) { assertThat(new DiscountCalculator().discountFor(amount)).isEqualTo(expected); }`,
        ),
      ],
      [
        blk(`<h3>Testing without Spring but with real wiring</h3>
• You can also assemble a small <b>object graph by hand</b> (constructor injection) for component tests, or create a tiny <code>AnnotationConfigApplicationContext</code> with only the classes under test. This keeps tests in milliseconds while still exercising real collaboration between two or three classes. Use <b>test data builders</b> and fakes (in-memory repositories) rather than long Mockito stubbing chains.`,
          `class InMemoryCourseRepository implements CourseRepository {
    private final Map<UUID, Course> data = new HashMap<>();
    public Optional<Course> findById(UUID id) { return Optional.ofNullable(data.get(id)); }
    public Course save(Course c) { data.put(c.id(), c); return c; }
}
@Test void realCollaborationWithoutSpring() {
    var repo = new InMemoryCourseRepository();
    var service = new EnrollmentService(repo, new RecordingNotifier(), Clock.systemUTC());
    repo.save(new Course(COURSE_ID, "Spring Core", 30));
    assertThat(service.enroll(STUDENT_ID, COURSE_ID).status()).isEqualTo(Status.CONFIRMED);
}
// a mini Spring context with just two classes
try (var ctx = new AnnotationConfigApplicationContext(EnrollmentService.class, InMemoryCourseRepository.class)) { ctx.getBean(EnrollmentService.class); }`,
        ),
      ],
      [
        ['Why does constructor injection improve testability?', 'The class can be instantiated with test doubles using new, with no container, reflection or setters, making unit tests fast and simple.'],
        ['What is the test pyramid?', 'Many fast unit tests, fewer slice/integration tests and a small number of end-to-end tests, balancing speed and confidence.'],
      ],
    ),
    topic(
      'sc-testing-testcontext-boot-slices',
      'Spring TestContext Framework, @SpringBootTest, Slice Tests and @MockBean',
      [
        blk(`<h3>TestContext framework</h3>
• <code>spring-test</code> integrates the container with JUnit 5: <code>@ExtendWith(SpringExtension.class)</code> (included in Boot's annotations), <code>@ContextConfiguration</code>, <code>@ActiveProfiles</code>, <code>@TestPropertySource</code>, <code>@DirtiesContext</code>, <code>@Sql</code>, <code>@Transactional</code> on tests (auto-rollback), <code>@DynamicPropertySource</code>. The <b>context is cached</b> across tests with the same configuration: avoid unnecessary variations (different <code>@MockBean</code> sets, properties) to keep the suite fast.`,
          `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Testcontainers
class CourseApiIT {
    @Container @ServiceConnection static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");   // Boot 3.1+: auto-wires datasource

    @Autowired TestRestTemplate rest;

    @Test
    void createsAndReadsCourse() {
        var created = rest.postForEntity("/api/courses", new CreateCourse("Spring Core"), CourseDto.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(rest.getForObject("/api/courses/{id}", CourseDto.class, created.getBody().id()).title()).isEqualTo("Spring Core");
    }
}`,
        ),
      ],
      [
        blk(`<h3>Slice tests and mocking beans</h3>
<table ${TABLE}>
<tr><th>Annotation</th><th>Loads</th><th>Use for</th></tr>
<tr><td><code>@WebMvcTest(Controller.class)</code></td><td>MVC layer, <code>MockMvc</code>, security filters, JSON; no services</td><td>Controllers, validation, error handling</td></tr>
<tr><td><code>@DataJpaTest</code></td><td>JPA repositories, embedded/Testcontainers DB, rollback</td><td>Queries, mappings</td></tr>
<tr><td><code>@JdbcTest</code></td><td><code>JdbcTemplate</code> + DataSource</td><td>JDBC DAOs</td></tr>
<tr><td><code>@JsonTest</code></td><td>Jackson</td><td>Serialisation</td></tr>
<tr><td><code>@RestClientTest</code></td><td><code>RestClient</code> + <code>MockRestServiceServer</code></td><td>HTTP clients</td></tr>
<tr><td><code>@SpringBootTest</code></td><td>Whole application</td><td>Wiring and end-to-end flows</td></tr>
</table>
• <b><code>@MockBean</code> / <code>@SpyBean</code></b> (Boot 3.4+: <code>@MockitoBean</code> / <code>@MockitoSpyBean</code>) replace a bean in the context with a Mockito mock; <code>@TestConfiguration</code> adds test beans; <code>@Import</code> for extra config.`,
          `@WebMvcTest(CourseController.class)
class CourseControllerTest {
    @Autowired MockMvc mvc;
    @MockBean CourseService service;                               // replaces the real service bean

    @Test
    @WithMockUser(roles = "ADMIN")
    void returns404ForUnknownCourse() throws Exception {
        when(service.get(any())).thenThrow(new CourseNotFoundException(UUID.randomUUID()));
        mvc.perform(get("/api/v1/courses/{id}", UUID.randomUUID()))
           .andExpect(status().isNotFound())
           .andExpect(jsonPath("$.detail").exists());
    }

    @Test
    void rejectsInvalidBody() throws Exception {
        mvc.perform(post("/api/v1/courses").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("{\\"title\\":\\"\\"}"))
           .andExpect(status().isBadRequest());
    }
}

@DataJpaTest
class CourseRepositoryTest {
    @Autowired CourseRepository repo;
    @Test void findsBySlug() { repo.save(new Course("spring-core")); assertThat(repo.findBySlug("spring-core")).isPresent(); }
}`,
        ),
      ],
      [
        blk(`<h3>Testing transactions, events, async and time</h3>
• <code>@Transactional</code> on a test method rolls back after each test (but <b>hides</b> commit-time behaviour: <code>AFTER_COMMIT</code> listeners don't fire, lazy issues disappear): for those scenarios use non-transactional tests with cleanup. <code>@RecordApplicationEvents</code> verifies events; <code>Awaitility</code> for async; inject a fixed <code>Clock</code>; <code>@Sql("/seed.sql")</code> for data; Testcontainers for real databases instead of H2 differences; <code>@DynamicPropertySource</code> to inject container ports. Keep test configuration small to reuse the cached context.`,
          `@SpringBootTest
class AsyncIndexingTest {
    @Autowired EnrollmentService service; @Autowired SearchClient search;
    @Test
    void indexesAfterEnrol() {
        service.enroll(student, course);
        await().atMost(Duration.ofSeconds(5)).untilAsserted(() -> assertThat(search.isIndexed(course)).isTrue());
    }
}
@TestConfiguration
class FixedClockConfig { @Bean @Primary Clock clock() { return Clock.fixed(Instant.parse("2026-10-20T10:00:00Z"), ZoneOffset.UTC); } }`,
        ),
      ],
      [
        ['@WebMvcTest vs @SpringBootTest?', '@WebMvcTest loads only the web layer (controllers, MockMvc) for fast focused tests with services mocked; @SpringBootTest loads the full application context for integration tests.'],
        ['What does @MockBean do?', 'Adds a Mockito mock to the application context replacing any existing bean of that type, so tests can stub collaborators of the unit under test.'],
        ['Why is the Spring test context cached and why does it matter?', 'Contexts with identical configuration are reused across test classes, so avoiding needless variations (different @MockBean sets, properties) keeps the suite fast.'],
      ],
    ),
  ]),

  sc(19, 'Advanced Spring Core', 'Advanced', [
    topic(
      'sc-advanced-autoconfig-custom-starter',
      'Auto-Configuration Internals and Building a Custom Starter',
      [
        blk(`<h3>How auto-configuration works</h3>
• <code>@EnableAutoConfiguration</code> imports <code>AutoConfigurationImportSelector</code>, which reads candidate classes from <code>META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports</code> in every jar. Each auto-configuration is a <code>@AutoConfiguration</code> class (a <code>@Configuration</code>) guarded by <code>@ConditionalOnClass</code>, <code>@ConditionalOnMissingBean</code> (user beans win), <code>@ConditionalOnProperty</code>, ordered by <code>@AutoConfiguration(after=...)</code>, exposing <code>@ConfigurationProperties</code>. Debug with <code>--debug</code> or Actuator <code>conditions</code>; exclude with <code>spring.autoconfigure.exclude</code>.`,
          `// my-lib-spring-boot-starter
@AutoConfiguration
@ConditionalOnClass(AuditClient.class)
@EnableConfigurationProperties(AuditProperties.class)
public class AuditAutoConfiguration {
    @Bean @ConditionalOnMissingBean
    AuditClient auditClient(AuditProperties props) { return new AuditClient(props.url(), props.timeout()); }

    @Bean @ConditionalOnProperty(prefix = "audit", name = "enabled", havingValue = "true", matchIfMissing = true)
    AuditAspect auditAspect(AuditClient client) { return new AuditAspect(client); }
}
@ConfigurationProperties("audit") record AuditProperties(@DefaultValue("http://audit") String url, @DefaultValue("2s") Duration timeout) {}

// src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
// com.javaschoollab.audit.AuditAutoConfiguration`,
        ),
      ],
      [
        blk(`<h3>Custom starter conventions</h3>
• Split into <code>my-lib</code> (the code), <code>my-lib-autoconfigure</code> (auto-configuration + properties metadata via <code>spring-boot-configuration-processor</code>) and <code>my-lib-spring-boot-starter</code> (empty module with dependencies). Name third-party starters <code>acme-spring-boot-starter</code> (the <code>spring-boot-starter-*</code> prefix is reserved). Make everything <b>back off</b> (<code>@ConditionalOnMissingBean</code>), <b>opt-out-able</b> by property, <b>documented</b>, tested with <code>ApplicationContextRunner</code>.`,
          `class AuditAutoConfigurationTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner().withConfiguration(AutoConfigurations.of(AuditAutoConfiguration.class));

    @Test void createsClientByDefault() { runner.run(ctx -> assertThat(ctx).hasSingleBean(AuditClient.class)); }
    @Test void backsOffWhenUserDefinesBean() { runner.withBean(AuditClient.class, () -> mock(AuditClient.class)).run(ctx -> assertThat(ctx).hasSingleBean(AuditClient.class)); }
    @Test void aspectCanBeDisabled() { runner.withPropertyValues("audit.enabled=false").run(ctx -> assertThat(ctx).doesNotHaveBean(AuditAspect.class)); }
}`,
        ),
      ],
      [
        blk(`<h3>Ordering, exclusions and keeping starters maintainable</h3>
• Use <code>@AutoConfiguration(before = DataSourceAutoConfiguration.class)</code>/<code>after</code> to control ordering (<code>@ConditionalOnBean</code> only works for beans registered earlier). Provide <b>sensible defaults</b>, support <code>@ConditionalOnProperty(matchIfMissing=true)</code> toggles, publish configuration metadata, keep the starter <b>free of heavy transitive dependencies</b> and version it with the Boot BOM. Provide <code>EnvironmentPostProcessor</code>s only when really needed.`,
          `@AutoConfiguration(after = DataSourceAutoConfiguration.class)
@ConditionalOnBean(DataSource.class)                                    // safe because ordered after the data source auto-config
class AuditJdbcAutoConfiguration {
    @Bean @ConditionalOnMissingBean AuditStore auditStore(JdbcClient jdbc) { return new JdbcAuditStore(jdbc); }
}
// spring.autoconfigure.exclude=com.javaschoollab.audit.AuditJdbcAutoConfiguration   (user opt-out)`,
        ),
      ],
      [
        ['How does Spring Boot auto-configuration work?', 'The AutoConfiguration.imports files list @AutoConfiguration classes that are imported and applied conditionally (on classes, missing beans, properties), so Boot configures sensible defaults that back off when you define your own beans.'],
        ['How do you write a custom starter?', 'Provide an autoconfigure module with @AutoConfiguration classes, conditions, @ConfigurationProperties and an imports file, plus a starter module that pulls dependencies; test with ApplicationContextRunner.'],
      ],
    ),
    topic(
      'sc-advanced-aot-startup-performance',
      'AOT Processing, GraalVM Native Images, CDS/Virtual Threads and Startup Performance',
      [
        blk(`<h3>AOT processing and native images</h3>
• Spring 6 / Boot 3 <b>AOT</b> (<code>spring-boot:process-aot</code>) analyses the application at build time: generates bean-definition code (no classpath scanning or CGLIB at runtime), and <b>runtime hints</b> for reflection/proxies/resources. With GraalVM (<code>mvn -Pnative native:compile</code>, or <code>bootBuildImage</code> with buildpacks) you get a native executable: <b>milliseconds startup</b>, lower memory, but longer builds, closed-world constraints (no dynamic classpath changes, profiles/conditions fixed at build time) and fewer libraries supported. JVM alternatives: <b>CRaC</b> (checkpoint/restore), <b>CDS/AppCDS</b> (<code>-XX:SharedArchiveFile</code>, Boot 3.3 support), <b>virtual threads</b> (<code>spring.threads.virtual.enabled=true</code>) for throughput on blocking I/O.`,
          `# native image via buildpacks
mvn -Pnative spring-boot:build-image
# or
mvn -Pnative native:compile && ./target/catalogue

# JVM startup tuning
java -XX:TieredStopAtLevel=1 -Xshare:auto -jar app.jar
spring.main.lazy-initialization=true         # faster startup, slower first request
spring.jmx.enabled=false`,
        ),
      ],
      [
        blk(`<h3>Finding and reducing startup cost</h3>
• Measure first: <code>/actuator/startup</code> with <code>BufferingApplicationStartup</code>, <code>-Ddebug</code> timings, <code>spring.main.log-startup-info</code>. Reduce: narrow <code>@ComponentScan</code>, remove unused starters/auto-configurations (<code>spring.autoconfigure.exclude</code>), avoid heavy work in <code>@PostConstruct</code>, lazy beans for rarely used features, avoid classpath scanning of huge packages, exclude unused JPA entity scanning. Keep the <b>singleton-bean graph small</b> and moves slow initialisation out of startup (ApplicationReadyEvent in the background).`,
          `@Configuration(proxyBeanMethods = false)          // skip CGLIB enhancement of configuration classes that don't call @Bean methods directly
class FastConfig { @Bean Clock clock() { return Clock.systemUTC(); } }

@Component
class SlowWarmup {
    @EventListener(ApplicationReadyEvent.class)
    void warm() { Thread.ofVirtual().start(this::loadCaches); }                    // do not block startup
}`,
        ),
      ],
      [
        blk(`<h3>Native image and AOT: practical rules</h3>
• Keep reflection <b>explicit</b>: register hints with <code>@RegisterReflectionForBinding</code> for DTOs serialised by Jackson, and use <code>RuntimeHintsPredicates</code> to test hints. Avoid runtime classpath scanning, dynamic proxies of unknown interfaces and <code>Class.forName</code> on strings. Run the application tests <b>in native mode</b> in CI (<code>nativeTest</code>) because behaviour can differ. Decide per service: native for scale-to-zero/serverless, JVM plus CDS/virtual threads for long-lived services.`,
          `@RegisterReflectionForBinding({CourseDto.class, EnrollmentDto.class})        // DTOs serialised by Jackson in a native image
@RestController class CourseApi { }

@Test void hintsRegistered() {
    RuntimeHints hints = new RuntimeHints();
    new MyHints().registerHints(hints, getClass().getClassLoader());
    assertThat(RuntimeHintsPredicates.reflection().onType(CourseDto.class)).accepts(hints);
}`,
        ),
      ],
      [
        ['What does Spring AOT do?', 'It processes the application at build time, generating optimised bean definition code and runtime hints (reflection, proxies, resources) so the app starts faster and can be compiled into a GraalVM native image.'],
        ['What are the trade-offs of GraalVM native images?', 'Very fast startup and low memory in exchange for longer builds, closed-world restrictions (build-time decisions on conditions/profiles, reflection hints) and limited library support.'],
      ],
    ),
    topic(
      'sc-advanced-design-patterns-modularity',
      'Design Patterns in Spring, Programmatic Registration, Modularity and Spring Modulith',
      [
        blk(`<h3>Design patterns used by Spring</h3>
<table ${TABLE}>
<tr><th>Pattern</th><th>Where in Spring</th></tr>
<tr><td>Singleton / Prototype / Factory</td><td>Bean scopes, <code>BeanFactory</code>, <code>FactoryBean</code></td></tr>
<tr><td>Proxy</td><td>AOP, <code>@Transactional</code>, scoped and lazy proxies</td></tr>
<tr><td>Template method</td><td><code>JdbcTemplate</code>, <code>TransactionTemplate</code>, <code>RestTemplate</code>, <code>AbstractApplicationContext.refresh</code></td></tr>
<tr><td>Observer</td><td>Application events</td></tr>
<tr><td>Strategy</td><td><code>ResourceLoader</code>, <code>PlatformTransactionManager</code>, <code>HandlerMapping</code>, <code>PasswordEncoder</code></td></tr>
<tr><td>Decorator / Chain of responsibility</td><td><code>BeanPostProcessor</code>, servlet filter chain, interceptor chain</td></tr>
<tr><td>Adapter</td><td><code>HandlerAdapter</code>, <code>MessageConverter</code></td></tr>
<tr><td>Builder</td><td><code>BeanDefinitionBuilder</code>, <code>UriComponentsBuilder</code>, <code>HttpSecurity</code></td></tr>
<tr><td>Dependency Injection / IoC</td><td>The container itself</td></tr>
<tr><td>Front controller</td><td><code>DispatcherServlet</code></td></tr>
</table>`),
      ],
      [
        blk(`<h3>Programmatic registration (functional bean definitions)</h3>
• Spring 5+ offers a functional API (<code>BeanRegistrar</code> in 7, <code>GenericApplicationContext.registerBean</code> with suppliers and <code>BeanDefinitionCustomizer</code>) to register beans without reflection, useful for libraries, tests and native images. <code>ApplicationContextInitializer</code> runs before refresh to register beans/profiles. Use programmatic registration for <b>dynamic, data-driven bean sets</b> (one client per tenant/config entry).`,
          `public class DynamicClientsInitializer implements ApplicationContextInitializer<GenericApplicationContext> {
    @Override public void initialize(GenericApplicationContext ctx) {
        ConfigurableEnvironment env = ctx.getEnvironment();
        List<String> tenants = Binder.get(env).bind("app.tenants", Bindable.listOf(String.class)).orElse(List.of());
        for (String tenant : tenants) {
            ctx.registerBean(tenant + "Client", TenantClient.class, () -> new TenantClient(tenant, env.getProperty("app.tenant." + tenant + ".url")));
        }
    }
}
// SpringApplication app = new SpringApplication(App.class); app.addInitializers(new DynamicClientsInitializer());`,
        ),
      ],
      [
        blk(`<h3>Modularity: Spring Modulith, ArchUnit and clean architecture</h3>
• <b>Spring Modulith</b> structures a monolith into <b>application modules</b> (packages), verifies module boundaries (<code>ApplicationModules.of(App.class).verify()</code>), documents them, tests modules in isolation (<code>@ApplicationModuleTest</code>) and provides <b>event externalisation</b> with a persistent <b>event publication registry</b> (a built-in outbox). Pair with <b>ArchUnit</b> rules and hexagonal/clean architecture (domain independent of Spring), and keep <b>module-to-module communication via events or published APIs</b>. A well-modularised monolith can later be split into services.`,
          `@Test
void verifiesModuleStructure() {
    var modules = ApplicationModules.of(Application.class);
    modules.verify();                                           // fails on cyclic or forbidden dependencies between modules
    new Documenter(modules).writeDocumentation();               // PlantUML component diagrams
}

@ApplicationModuleTest
class EnrollmentModuleTests {
    @Test void publishesEvent(Scenario scenario) {
        scenario.stimulate(() -> enrollments.enroll(student, course)).andWaitForEventOfType(CourseEnrolled.class).toArrive();
    }
}`,
        ),
      ],
      [
        ['Which design patterns does Spring use?', 'Singleton/factory (container), proxy (AOP), template method (JdbcTemplate), observer (events), strategy, decorator/chain (post-processors and filters), adapter and front controller (DispatcherServlet).'],
        ['What is Spring Modulith?', 'A toolkit for building modular monoliths: it verifies module boundaries, supports isolated module tests and provides an event publication registry for reliable in-process events.'],
      ],
    ),
  ]),

  sc(20, 'Spring Core Interview Questions', 'Interview', [
    topic(
      'sc-iq-ioc-di-beans',
      'Interview Questions: IoC, DI, Beans, Scopes and Configuration',
      [
        blk(`<h3>How to answer</h3>
• State the <b>definition</b>, explain the <b>mechanism</b> (what the container actually does), give a <b>short code example</b>, then mention a <b>pitfall or trade-off</b>. Interviewers care about understanding the <b>why</b> (loose coupling, proxies, lifecycle), not memorised annotation lists.`),
      ],
      [
        blk(`<h3>Rapid-fire recap: IoC and beans</h3>
<table ${TABLE}>
<tr><th>Question</th><th>One-line answer</th></tr>
<tr><td>IoC vs DI</td><td>IoC is the principle (framework controls creation/wiring); DI is the technique that supplies dependencies</td></tr>
<tr><td>Best injection style</td><td>Constructor: immutable, mandatory, testable</td></tr>
<tr><td>Default scope</td><td>Singleton (one per container)</td></tr>
<tr><td>Default proxy type in Boot</td><td>CGLIB</td></tr>
<tr><td>@Component vs @Bean</td><td>Class-level scanning vs method-level factory (third-party/custom creation)</td></tr>
<tr><td>@Primary vs @Qualifier</td><td>Default candidate vs explicit choice at the injection point (qualifier wins)</td></tr>
<tr><td>Circular dependency</td><td>Constructor cycles fail; redesign or @Lazy; Boot forbids field cycles by default</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Coding questions asked live</h3>
• Write a service with constructor injection and a unit test with a mock. • Show two implementations of one interface and select one with <code>@Qualifier</code>, <code>@Primary</code> and a profile. • Create a custom scope or a prototype injected correctly into a singleton. • Fix a circular dependency. • Explain what happens when two beans share a name. Practise explaining aloud <b>what the container does</b> at each step.`,
          `public interface Notifier { void send(String to, String msg); }
@Component @Profile("!prod") @Primary class ConsoleNotifier implements Notifier { public void send(String to, String m) { System.out.println(to + ": " + m); } }
@Component @Profile("prod") class SmtpNotifier implements Notifier { public void send(String to, String m) { /* smtp */ } }
@Service class WelcomeService {
    private final Notifier notifier;
    WelcomeService(Notifier notifier) { this.notifier = notifier; }               // one candidate per profile; @Primary as default
}`,
        ),
      ],
      [
        ['What is Spring and why use it?', 'A framework whose IoC container wires POJOs together and which provides AOP, transactions, data access, web and testing support; benefits are loose coupling, testability, declarative infrastructure and consistent abstractions.'],
        ['Explain IoC and dependency injection with an example.', 'Instead of a class creating its dependencies, the container creates and injects them (e.g. a service receiving a repository in its constructor), so implementations can be swapped and tested with fakes.'],
        ['BeanFactory vs ApplicationContext?', 'BeanFactory is the minimal lazy container; ApplicationContext adds eager singletons, post-processor auto-registration, events, i18n, resources and Environment, and is what applications use.'],
        ['What are the bean scopes?', 'singleton, prototype, request, session, application, websocket and custom scopes.'],
        ['Constructor vs setter vs field injection?', 'Constructor for mandatory immutable dependencies (preferred), setter for optional, field injection discouraged because it hides dependencies and hampers testing.'],
        ['How does Spring resolve ambiguity between beans of the same type?', 'By @Qualifier at the injection point, then @Primary, then @Priority and finally by matching the injection point name to a bean name.'],
        ['What is a singleton bean in Spring and is it thread-safe?', 'One shared instance per container; Spring does not make it thread-safe, so keep it stateless or synchronise shared state.'],
        ['How do you inject a prototype into a singleton?', 'Use ObjectProvider/Provider, @Lookup or a scoped proxy so a new instance is obtained at each use.'],
        ['@Configuration vs @Component?', '@Configuration classes are CGLIB-enhanced so @Bean method calls return container-managed singletons; in a @Component (lite mode) they behave as plain method calls.'],
        ['How does component scanning work?', 'ClassPathBeanDefinitionScanner finds classes with stereotype annotations in the given packages and registers them as bean definitions.'],
      ],
    ),
    topic(
      'sc-iq-lifecycle-processors-aop',
      'Interview Questions: Lifecycle, Post-Processors, AOP and Proxies',
      [
        blk(`<h3>Key diagrams to draw in interviews</h3>
• <b>Bean lifecycle</b>: instantiate → inject → Aware → BPP before → @PostConstruct → afterPropertiesSet → init-method → BPP after (proxy) → use → @PreDestroy → destroy → destroy-method.<br>
• <b>Proxy call path</b>: caller → proxy → interceptor chain (security → transaction → cache → custom) → target. Self-invocation skips the proxy.`),
      ],
      [
        blk(`<h3>Common traps</h3>
• "Why doesn't @Transactional work?" (self-invocation, private/final, checked exception, wrong thread, swallowed exception, proxy not created). • "Does prototype get @PreDestroy?" (no). • "Is @Order the creation order?" (no). • "Can parent contexts see child beans?" (no). • "JDK proxy injected by class?" (fails). • "What does readOnly=true guarantee?" (a hint, not a write ban).`),
      ],
      [
        blk(`<h3>Advanced follow-ups interviewers ask</h3>
• "Where exactly is the proxy created and which bean does the container hold?" (<code>postProcessAfterInitialization</code> of the auto-proxy creator; the container holds the proxy.) • "How would you implement your own <code>@Retry</code>?" (an aspect with <code>@Around</code> and ordering outside the transaction.) • "Why are BPP beans created early?" (they must exist before regular beans.) • "How does <code>@Configuration</code> inter-bean call interception work?" (CGLIB subclass overriding <code>@Bean</code> methods to consult the container.)`,
          `@Aspect @Component @Order(Ordered.HIGHEST_PRECEDENCE)         // runs outside @Transactional so every retry gets a fresh transaction
class RetryAspect {
    @Around("@annotation(retry)")
    Object around(ProceedingJoinPoint pjp, Retry retry) throws Throwable {
        for (int i = 1; ; i++) {
            try { return pjp.proceed(); }
            catch (TransientDataAccessException e) { if (i >= retry.times()) throw e; }
        }
    }
}`,
        ),
      ],
      [
        ['Explain the Spring bean lifecycle.', 'Definition loaded and BFPPs run; bean instantiated; dependencies injected; Aware callbacks; BPP before-init; @PostConstruct, afterPropertiesSet, custom init; BPP after-init (AOP proxy); ready; on shutdown @PreDestroy, destroy(), custom destroy.'],
        ['BeanPostProcessor vs BeanFactoryPostProcessor?', 'BFPP changes bean definitions before instantiation; BPP intercepts bean instances around initialisation and can return wrappers such as proxies.'],
        ['What is AOP and where does Spring use it?', 'Modularising cross-cutting concerns through proxies; used by @Transactional, @Cacheable, @Async, security and validation.'],
        ['JDK proxy vs CGLIB?', 'JDK proxies implement interfaces; CGLIB subclasses the class (not final); Boot defaults to CGLIB.'],
        ['What are advice types and pointcut designators?', '@Before, @AfterReturning, @AfterThrowing, @After, @Around; execution, within, this/target, args, @annotation, @within, bean.'],
        ['Why does self-invocation bypass AOP?', 'this refers to the target not the proxy, so the interceptor chain is skipped.'],
        ['How do Spring events work?', 'ApplicationEventPublisher publishes events synchronously to @EventListener/ApplicationListener beans; @Async and @TransactionalEventListener alter threading and timing.'],
        ['What is SpEL?', 'An expression language to query/manipulate object graphs at runtime used in @Value, conditions, caching and security.'],
        ['How does Spring Boot auto-configuration work?', 'Conditional @AutoConfiguration classes listed in imports files create default beans that back off when you define your own.'],
        ['What happens at startup in refresh()?', 'Load definitions, run BFPPs (including @Configuration parsing), register BPPs, init events/i18n, instantiate singletons, start lifecycle beans and publish ContextRefreshedEvent.'],
      ],
    ),
    topic(
      'sc-iq-transactions-data-testing',
      'Interview Questions: Transactions, Data Access, Security, Testing and Scenarios',
      [
        blk(`<h3>Scenario-style answers</h3>
• <b>"Payment succeeded but the order was rolled back"</b> → payment call inside the DB transaction: use outbox/saga, idempotency keys and compensation; do external calls after commit.<br>
• <b>"Audit row must persist even when the main operation fails"</b> → <code>REQUIRES_NEW</code> in a separate bean.<br>
• <b>"Slow startup"</b> → measure with startup endpoint, narrow scanning, lazy init, AOT/CDS.<br>
• <b>"Intermittent LazyInitializationException"</b> → access lazy data inside the transaction or use projections; avoid open-session-in-view.`),
      ],
      [
        blk(`<h3>Cheat sheet</h3>
<table ${TABLE}>
<tr><th>Topic</th><th>Remember</th></tr>
<tr><td>Rollback default</td><td>RuntimeException and Error only</td></tr>
<tr><td>Default propagation</td><td>REQUIRED</td></tr>
<tr><td>NESTED</td><td>Savepoint (JDBC); not supported by JPA transaction manager by default</td></tr>
<tr><td>Exception translation</td><td>@Repository + PersistenceExceptionTranslationPostProcessor</td></tr>
<tr><td>Test slices</td><td>@WebMvcTest, @DataJpaTest, @JdbcTest, @JsonTest</td></tr>
<tr><td>Password hashing</td><td>bcrypt/Argon2 via DelegatingPasswordEncoder</td></tr>
</table>`),
      ],
      [
        blk(`<h3>Debugging a transaction problem step by step</h3>
• 1) Is the bean a proxy (<code>AopUtils.isAopProxy</code>)? 2) Is the call external (not self-invocation)? 3) Is the method public and non-final? 4) Which exception type and does it match rollback rules? 5) Is the correct transaction manager used? 6) Enable <code>logging.level.org.springframework.transaction.interceptor=TRACE</code> and <code>org.springframework.orm.jpa=DEBUG</code> to see begin/commit/rollback. 7) Check connection pool exhaustion if requests hang inside transactions.`,
          `# trace transaction boundaries
logging.level.org.springframework.transaction.interceptor=TRACE
logging.level.org.springframework.jdbc.datasource.DataSourceTransactionManager=DEBUG
logging.level.org.springframework.orm.jpa.JpaTransactionManager=DEBUG

boolean active = TransactionSynchronizationManager.isActualTransactionActive();     // inside a method: are we really in a transaction?
String name = TransactionSynchronizationManager.getCurrentTransactionName();`,
        ),
      ],
      [
        ['How does @Transactional work internally?', 'A proxy with TransactionInterceptor obtains a transaction from the PlatformTransactionManager, invokes the method, commits or rolls back according to the exception rules and releases resources; state is thread-bound.'],
        ['Propagation REQUIRED vs REQUIRES_NEW vs NESTED?', 'REQUIRED joins or creates; REQUIRES_NEW suspends and creates independent; NESTED uses a savepoint inside the outer transaction.'],
        ['What are the isolation levels?', 'READ_UNCOMMITTED, READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE, trading anomalies prevented against concurrency.'],
        ['Why does a checked exception not roll back?', 'Spring follows EJB convention: only unchecked exceptions roll back by default; configure rollbackFor to change it.'],
        ['What is UnexpectedRollbackException?', 'Thrown when a participating transaction marked the shared transaction rollback-only and the outer scope tried to commit, often after an exception was caught and ignored.'],
        ['How do you handle distributed transactions?', 'Avoid XA; use sagas, outbox and idempotent consumers for eventual consistency.'],
        ['What is exception translation?', 'Converting persistence exceptions into the DataAccessException hierarchy so higher layers are independent of the data technology.'],
        ['How do you test a Spring Boot application?', 'Unit tests with Mockito and constructor injection, slice tests (@WebMvcTest, @DataJpaTest), and a few @SpringBootTest integration tests with Testcontainers.'],
        ['How do you secure a REST API in Spring?', 'A SecurityFilterChain with stateless JWT/OAuth2 resource server, authorisation rules and method security, CSRF disabled for token-only APIs, CORS configured explicitly and bcrypt for passwords.'],
        ['How do you make a Spring Boot application start faster?', 'Narrow scanning, remove unused auto-configurations, lazy initialisation for heavy beans, avoid slow @PostConstruct, use AOT/native images or CDS, and measure with the startup endpoint.'],
      ],
    ),
  ]),
];

export const springCoreRoadmap4: SubTopic[] = [...springCoreRoadmap4Base, ...springCoreExamplesFull];
