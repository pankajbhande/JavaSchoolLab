// Hibernate roadmap, part 1: the roadmap overview and sections 1-5 (fundamentals, core concepts, CRUD, relationships, querying).
// Examples use Hibernate 6 / Jakarta Persistence 3 (package jakarta.persistence) with Spring Boot 3.
import type { SubTopic } from './types';
import { blk, phaseOf, topic } from './jsRoadmapKit';

const TABLE = 'class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2 [&_th]:py-2"';
const hb = (n: number, title: string, priority: string, topics: SubTopic['topics']) => phaseOf('hb', n, title, priority, topics);

export const hibernateRoadmap1: SubTopic[] = [
  {
    id: 'hb-roadmap',
    name: 'Hibernate Roadmap (11 Sections, 150 Topics)',
    topics: [
      topic(
        'hb-roadmap-overview',
        'Hibernate Important Topics Checklist (150 Topics)',
        [
          blk(`<h3>How the roadmap is organised</h3>
• The 150 important Hibernate topics are grouped into <b>11 sections</b>, each a module of this course with worked Java examples and interview questions. Sections marked <b>Essential</b> (core concepts, CRUD, relationships, caching, performance, Spring Boot) matter most for real Spring Boot microservices.<br>
• Examples use <b>Hibernate 6</b> with <b>Jakarta Persistence 3</b> (<code>jakarta.persistence.*</code>) and <b>Spring Boot 3</b>, and note the legacy APIs (<code>save()</code>, <code>update()</code>, <code>@Temporal</code>) you will still meet in older code.<br>
<table ${TABLE}>
<tr><th>Section</th><th>Topics</th><th>Items</th><th>Priority</th></tr>
<tr><td>1</td><td>Hibernate Fundamentals</td><td>1-10</td><td>Core</td></tr>
<tr><td>2</td><td>Hibernate Core Concepts</td><td>11-25</td><td>Essential</td></tr>
<tr><td>3</td><td>CRUD Operations</td><td>26-40</td><td>Essential</td></tr>
<tr><td>4</td><td>Entity Relationships</td><td>41-53</td><td>Essential</td></tr>
<tr><td>5</td><td>Hibernate Querying</td><td>54-66</td><td>Core</td></tr>
<tr><td>6</td><td>Hibernate Caching</td><td>67-73</td><td>Essential</td></tr>
<tr><td>7</td><td>Performance Optimization</td><td>74-86</td><td>Essential</td></tr>
<tr><td>8</td><td>Transactions and Concurrency</td><td>87-98</td><td>Core</td></tr>
<tr><td>9</td><td>Advanced Hibernate</td><td>99-114</td><td>Advanced</td></tr>
<tr><td>10</td><td>Hibernate with Spring Boot</td><td>115-130</td><td>Essential</td></tr>
<tr><td>11</td><td>Hibernate Interview Questions</td><td>131-150</td><td>Interview</td></tr>
</table>`),
        ],
        [
          blk(`<h3>Top 15 topics to master first (Spring Boot developer)</h3>
1. Entity mapping and annotations<br>
2. CRUD operations<br>
3. Entity lifecycle<br>
4. One-to-One, One-to-Many, Many-to-One<br>
5. Lazy vs Eager loading<br>
6. Cascade types and orphan removal<br>
7. JPQL and native queries<br>
8. Spring Data JPA repositories<br>
9. Transactions and <code>@Transactional</code><br>
10. First-level and second-level cache<br>
11. The N+1 query problem<br>
12. Fetch joins and entity graphs<br>
13. Pagination and sorting<br>
14. Optimistic and pessimistic locking<br>
15. Hibernate performance optimization<br>
<br>
<b>Recommendation:</b> master entity relationships, transaction management, lazy loading and the N+1 query problem first. They cause most real-world production issues in Spring Boot microservices.<br>
Official documentation: hibernate.org/orm/documentation.`),
        ],
        [
          blk(`<h3>A learning path that works</h3>
• Week 1: mapping, identifiers, CRUD and the persistence context (what "managed" means). Week 2: relationships with <code>mappedBy</code>, cascade and fetch types; write every mapping with a unit test using an in-memory database or Testcontainers.<br>
• Week 3: queries (JPQL, native, projections), pagination, Spring Data JPA. Week 4: performance (read the SQL log!), caching, locking, migrations.<br>
• Always turn on SQL logging in development (<code>spring.jpa.show-sql</code> or the <code>org.hibernate.SQL</code> logger) and a query-count assertion in tests: seeing the generated SQL is how you learn Hibernate.`),
        ],
        [
          ['Which Hibernate topics are most important for a Spring Boot developer?', 'Entity mapping and relationships, the entity lifecycle, lazy vs eager loading, cascade and orphan removal, JPQL/native queries, Spring Data JPA, transactions, caching, the N+1 problem with fetch joins/entity graphs, pagination, locking and general performance tuning.'],
          ['What is the best way to learn Hibernate?', 'Map real entities, run them against a database with SQL logging enabled, and inspect the generated statements for every operation; add tests that count queries to catch N+1 problems early.'],
        ],
      ),
    ],
  },

  hb(1, 'Hibernate Fundamentals', 'Core', [
    topic(
      'hb-intro-orm-comparisons',
      'Introduction, ORM and Comparisons: JDBC, JPA, Spring Data JPA',
      [
        blk(`<h3>What is Hibernate and what is ORM?</h3>
• <b>Hibernate ORM</b> is an open-source Java framework that maps <b>Java objects to relational tables</b> (<b>Object-Relational Mapping</b>) and generates the SQL for you. You work with entities and a session/entity manager; Hibernate issues INSERT/SELECT/UPDATE/DELETE, manages connections, and keeps objects and rows in sync.<br>
• ORM bridges the <b>object-relational impedance mismatch</b>: objects have inheritance, references and identity, tables have rows, foreign keys and keys. Hibernate handles type conversion, associations, inheritance mapping, caching, lazy loading and dirty checking.<br>
• Hibernate is the most widely used <b>JPA</b> implementation and is the default provider in Spring Boot.`,
          `// Without ORM (JDBC): boilerplate, manual mapping
String sql = "SELECT id, title, price FROM course WHERE id = ?";
try (Connection c = ds.getConnection(); PreparedStatement ps = c.prepareStatement(sql)) {
    ps.setLong(1, id);
    try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) return new Course(rs.getLong("id"), rs.getString("title"), rs.getBigDecimal("price"));
    }
}

// With Hibernate / JPA: the framework generates the SQL and maps the row
@Entity
public class Course {
    @Id @GeneratedValue private Long id;
    private String title;
    private BigDecimal price;
}
Course course = entityManager.find(Course.class, id);      // select ... from course where id=?
course.setPrice(new BigDecimal("1499"));                    // dirty checking: UPDATE issued at commit`,
        ),
      ],
      [
        blk(`<h3>Hibernate vs JDBC vs JPA vs Spring Data JPA</h3>
<table ${TABLE}>
<tr><th></th><th>JDBC</th><th>Hibernate (native API)</th><th>JPA</th><th>Spring Data JPA</th></tr>
<tr><td>What it is</td><td>Low-level database API</td><td>ORM framework</td><td><b>Specification</b> (Jakarta Persistence)</td><td>Repository abstraction on top of JPA</td></tr>
<tr><td>SQL</td><td>You write all of it</td><td>Generated + HQL/native</td><td>Generated + JPQL/native</td><td>Derived from method names, <code>@Query</code></td></tr>
<tr><td>Mapping</td><td>Manual (ResultSet)</td><td>Annotations/XML</td><td>Annotations</td><td>Entities (JPA)</td></tr>
<tr><td>Portability</td><td>SQL dialect specific</td><td>Hibernate-specific extras</td><td>Provider independent</td><td>JPA + Spring</td></tr>
<tr><td>Boilerplate</td><td>High</td><td>Low</td><td>Low</td><td>Lowest</td></tr>
<tr><td>Control</td><td>Total</td><td>High</td><td>High</td><td>Convenient, can hide SQL</td></tr>
</table>
• <b>JPA</b> defines the API (<code>EntityManager</code>, annotations, JPQL); <b>Hibernate</b> implements it (and adds extras: <code>Session</code>, HQL features, filters, <code>@BatchSize</code>); <b>Spring Data JPA</b> generates repository implementations and integrates with Spring transactions. Hibernate uses JDBC underneath, so JDBC knowledge still matters (batching, pooling, transactions).`),
      ],
      [
        blk(`<h3>When to use what</h3>
• <b>Spring Data JPA + Hibernate</b>: the default for CRUD-heavy business applications and microservices: fast to build, readable, good productivity.<br>
• <b>JDBC / JdbcTemplate / jOOQ</b> for reporting, bulk loads, complex SQL, or hot paths where you need exact SQL control; mixing both in one service is normal.<br>
• <b>Know the cost of ORM</b>: hidden SQL, N+1 queries, memory use of large persistence contexts, the learning curve of lifecycle and lazy loading. Mitigate by reading the SQL log, using DTO projections for read models and keeping transactions short.<br>
• <b>Hibernate-specific features</b> (filters, <code>@Formula</code>, <code>@NaturalId</code>, <code>@BatchSize</code>, <code>@SoftDelete</code>) trade portability for power: acceptable, but isolate them.`,
          `// Typical Spring Boot split: JPA for aggregates, JdbcClient for a heavy report
@Repository
class SalesReportRepository {
    private final JdbcClient jdbc;
    SalesReportRepository(JdbcClient jdbc) { this.jdbc = jdbc; }

    List<MonthlySales> monthly(int year) {
        return jdbc.sql("""
                SELECT date_trunc('month', o.created_at) AS month, SUM(o.total) AS revenue, COUNT(*) AS orders
                FROM orders o WHERE EXTRACT(YEAR FROM o.created_at) = :year GROUP BY 1 ORDER BY 1
                """)
            .param("year", year)
            .query(MonthlySales.class).list();
    }
}`,
        ),
      ],
      [
        ['What is Hibernate?', 'An open-source ORM framework for Java that maps entity classes to database tables, generates SQL, manages persistence context, caching, lazy loading and transactions, and is the most widely used implementation of the JPA specification.'],
        ['Hibernate vs JPA?', 'JPA is a specification (the jakarta.persistence API); Hibernate is an implementation of it with extra native features (Session, HQL extensions, filters). Code written to JPA can switch providers; Hibernate-specific APIs cannot.'],
        ['Hibernate vs JDBC?', 'JDBC is a low-level API where you write SQL and map ResultSets yourself. Hibernate builds on JDBC and automates mapping, SQL generation, caching, dirty checking and associations, reducing boilerplate at the cost of some control.'],
      ],
    ),
    topic(
      'hb-architecture-config',
      'Architecture, Configuration, Dependencies, Annotations and SessionFactory',
      [
        blk(`<h3>Hibernate architecture</h3>
• Your <b>application</b> talks to the <b>persistence API</b> (<code>EntityManager</code>/<code>Session</code>). Core objects: <b><code>SessionFactory</code></b> (heavyweight, thread-safe, one per database, built once at startup; holds metadata, SQL cache, second-level cache config), <b><code>Session</code></b> (lightweight, not thread-safe, one unit of work, wraps a JDBC connection and holds the <b>persistence context</b> = first-level cache), <b><code>Transaction</code></b>, and query objects.<br>
• Below sit the <b>mapping metadata</b> (annotations), the <b>dialect</b> (database-specific SQL), the <b>connection provider</b> (pool) and <b>JDBC</b>. Hibernate translates entity operations into SQL, executes through JDBC and maps results back to objects.`,
          `Application
   |  EntityManager / Session          (unit of work, persistence context = L1 cache)
   v
SessionFactory / EntityManagerFactory  (one per DB, thread-safe, built once)
   |  mapping metadata + Dialect + L2 cache + connection provider
   v
JDBC  -->  connection pool (HikariCP)  -->  Database

// Plain Hibernate bootstrap (no Spring)
SessionFactory sf = new Configuration().configure("hibernate.cfg.xml").buildSessionFactory();
try (Session session = sf.openSession()) {
    Transaction tx = session.beginTransaction();
    session.persist(new Course("Hibernate", new BigDecimal("999")));
    tx.commit();
}`,
        ),
      ],
      [
        blk(`<h3>Dependencies and configuration</h3>
• <b>Spring Boot</b> (recommended): add <code>spring-boot-starter-data-jpa</code> (brings Hibernate, Spring Data JPA, HikariCP) and a JDBC driver; configure in <code>application.properties</code>. The auto-configured <code>EntityManagerFactory</code> is a Hibernate <code>SessionFactory</code>.<br>
• <b>Plain Hibernate</b>: <code>org.hibernate.orm:hibernate-core</code> + driver + a connection pool; configure with <code>hibernate.cfg.xml</code>, <code>persistence.xml</code> or a <code>Configuration</code> object.<br>
• Key properties: <code>hibernate.dialect</code> (auto-detected in Hibernate 6), <code>hibernate.hbm2ddl.auto</code> (<code>validate</code> in production, never <code>create</code>/<code>update</code>), <code>hibernate.show_sql</code>, <code>hibernate.format_sql</code>, <code>hibernate.jdbc.batch_size</code>, <code>hibernate.default_batch_fetch_size</code>.`,
          `<!-- pom.xml -->
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
<dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><scope>runtime</scope></dependency>
<!-- or PostgreSQL: org.postgresql:postgresql -->

# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/javaschoollab
spring.datasource.username=jsl
spring.datasource.password=\${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate                  # schema comes from Flyway; Hibernate only checks it
spring.jpa.open-in-view=false                           # do not keep the session open during view rendering
spring.jpa.properties.hibernate.jdbc.batch_size=50
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.default_batch_fetch_size=32
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.orm.jdbc.bind=TRACE         # show bind parameters`,
        ),
      ],
      [
        blk(`<h3>Annotations overview and SessionFactory vs EntityManagerFactory</h3>
<table ${TABLE}>
<tr><th>Group</th><th>Annotations</th></tr>
<tr><td>Entity and table</td><td><code>@Entity</code>, <code>@Table</code>, <code>@Id</code>, <code>@GeneratedValue</code>, <code>@Column</code>, <code>@Transient</code>, <code>@Enumerated</code>, <code>@Lob</code>, <code>@Embedded</code>/<code>@Embeddable</code></td></tr>
<tr><td>Relationships</td><td><code>@OneToOne</code>, <code>@OneToMany</code>, <code>@ManyToOne</code>, <code>@ManyToMany</code>, <code>@JoinColumn</code>, <code>@JoinTable</code></td></tr>
<tr><td>Inheritance</td><td><code>@Inheritance</code>, <code>@DiscriminatorColumn</code>, <code>@MappedSuperclass</code></td></tr>
<tr><td>Locking and audit</td><td><code>@Version</code>, <code>@PrePersist</code>/<code>@PreUpdate</code>, <code>@EntityListeners</code></td></tr>
<tr><td>Hibernate-specific</td><td><code>@BatchSize</code>, <code>@Fetch</code>, <code>@Cache</code>, <code>@Filter</code>, <code>@Formula</code>, <code>@NaturalId</code>, <code>@DynamicUpdate</code>, <code>@SoftDelete</code>, <code>@CreationTimestamp</code></td></tr>
</table>
• <b><code>SessionFactory</code></b> (Hibernate) and <b><code>EntityManagerFactory</code></b> (JPA) are the same object: <code>SessionFactory extends EntityManagerFactory</code>. Create it <b>once</b>; it is expensive and thread-safe. Unwrap when you need Hibernate features: <code>emf.unwrap(SessionFactory.class)</code>, <code>em.unwrap(Session.class)</code>.`,
          `@Service
class StatsService {
    @PersistenceContext private EntityManager em;                       // container-managed, transaction-scoped proxy
    @Autowired private EntityManagerFactory emf;

    Statistics statistics() {
        SessionFactory sf = emf.unwrap(SessionFactory.class);           // access Hibernate-specific API
        return sf.getStatistics();                                      // queries executed, cache hits, entity loads...
    }

    @Transactional
    void useSession() {
        Session session = em.unwrap(Session.class);                     // native Session for Hibernate-only features
        session.setDefaultReadOnly(true);
    }
}
// spring.jpa.properties.hibernate.generate_statistics=true`,
        ),
      ],
      [
        ['What is the SessionFactory and why is it created once?', 'A thread-safe, heavyweight factory that holds mapping metadata, the dialect, connection and cache configuration and creates Sessions. Building it is expensive, so an application creates one per database at startup.'],
        ['SessionFactory vs EntityManagerFactory?', 'They are the same thing: SessionFactory extends the JPA EntityManagerFactory with Hibernate-specific features. In Spring Boot the EntityManagerFactory bean is a SessionFactory you can unwrap.'],
        ['Why set ddl-auto to validate in production?', 'create/update can change or drop schema automatically and are unsafe. validate only checks that entities match the schema, which should be managed by migration tools such as Flyway or Liquibase.'],
      ],
    ),
  ]),

  hb(2, 'Hibernate Core Concepts', 'Essential', [
    topic(
      'hb-entity-mapping',
      'Entity Classes and Mapping: @Entity, @Table, @Id, @Column, @Transient, @Enumerated, java.time',
      [
        blk(`<h3>A basic entity</h3>
• An <b>entity</b> is a class mapped to a table. Requirements: annotated <code>@Entity</code>, an <code>@Id</code> field, a <b>no-argument constructor</b> (at least <code>protected</code>), not <code>final</code> (Hibernate creates proxy subclasses), non-final persistent fields/methods.<br>
• <code>@Table(name, schema, uniqueConstraints, indexes)</code> sets the table; <code>@Column(name, nullable, length, unique, precision, scale, updatable, insertable, columnDefinition)</code> customises a column. Without annotations, a field maps to a column of the same name (Spring Boot's naming strategy converts <code>camelCase</code> to <code>snake_case</code>).`,
          `import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "course",
       uniqueConstraints = @UniqueConstraint(name = "uk_course_slug", columnNames = "slug"),
       indexes = @Index(name = "idx_course_level", columnList = "level"))
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 160)
    private String slug;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)                      // store the NAME, not the ordinal
    @Column(nullable = false, length = 20)
    private Level level;

    @Column(updatable = false)
    private Instant createdAt;

    @Transient                                          // not persisted
    private transient String displayPrice;

    protected Course() {}                               // required by JPA
    public Course(String title, String slug, BigDecimal price, Level level) { this.title = title; this.slug = slug; this.price = price; this.level = level; }
    // getters/setters ...
}
public enum Level { BEGINNER, INTERMEDIATE, ADVANCED }`,
        ),
      ],
      [
        blk(`<h3>@Enumerated, @Transient, date/time and LOBs</h3>
• <b><code>@Enumerated(EnumType.STRING)</code></b> is safe: the default <code>ORDINAL</code> stores 0,1,2 and breaks when you reorder or insert enum constants. (Hibernate 6 can also map enums to native database enum types.)<br>
• <b><code>@Transient</code></b> (or Java's <code>transient</code>) excludes a field from persistence: derived or UI-only values.<br>
• <b><code>@Temporal</code></b> is <b>legacy</b>, needed only for <code>java.util.Date</code>/<code>Calendar</code> (<code>TemporalType.DATE|TIME|TIMESTAMP</code>). For new code use <b><code>java.time</code></b> types, which Hibernate maps natively: <code>LocalDate</code> → DATE, <code>LocalTime</code> → TIME, <code>LocalDateTime</code> → TIMESTAMP, <code>Instant</code>/<code>OffsetDateTime</code>/<code>ZonedDateTime</code> → TIMESTAMP (WITH TIME ZONE). Store <b>UTC instants</b> for events and a <code>LocalDate</code> for birthdays.<br>
• <code>@Lob</code> for large text/binary (<code>String</code> → CLOB, <code>byte[]</code> → BLOB); avoid loading large LOBs unnecessarily (<code>@Basic(fetch = LAZY)</code> needs bytecode enhancement).`,
          `@Entity
public class Enrollment {
    @Id @GeneratedValue private Long id;

    @Enumerated(EnumType.STRING) private Status status;               // ACTIVE, COMPLETED...
    private LocalDate startDate;                                      // DATE
    private Instant enrolledAt;                                       // TIMESTAMP (UTC)
    private OffsetDateTime deadline;                                  // TIMESTAMP WITH TIME ZONE

    @CreationTimestamp private Instant createdAt;                     // Hibernate sets it on insert
    @UpdateTimestamp private Instant updatedAt;

    @Lob @Column(columnDefinition = "text") private String notes;

    @Transient public boolean isOverdue() { return deadline != null && deadline.isBefore(OffsetDateTime.now()); }

    // Legacy style (avoid in new code)
    @Temporal(TemporalType.TIMESTAMP) private java.util.Date legacyDate;
}`,
        ),
      ],
      [
        blk(`<h3>Embedded types, naming and equality</h3>
• <b>@Embeddable / @Embedded</b> map a value object into columns of the owning table (no separate table or identity): <code>Address</code>, <code>Money</code>, <code>AuditFields</code>. Reuse with <code>@AttributeOverrides</code>. Embeddables make the model expressive and avoid wide classes.<br>
• Naming: Spring Boot uses <code>CamelCaseToUnderscoresNamingStrategy</code> and <code>PhysicalNamingStrategy</code>; set explicit names for shared schemas.<br>
• <b>Equality</b>: do not use all fields. Implement <code>equals/hashCode</code> on a <b>business key</b> (<code>@NaturalId</code>) or on the id with null handling and a constant <code>hashCode</code> per class; never use lazy collections in them. <code>Lombok @Data</code> on entities is a classic bug source (toString/equals traverse lazy associations).<br>
• Prefer <b>immutability</b> where possible (<code>@Immutable</code> for read-only reference tables).`,
          `@Embeddable
public class Address {
    @Column(length = 120) private String line1;
    @Column(length = 60)  private String city;
    @Column(length = 10)  private String postalCode;
    protected Address() {}
    public Address(String line1, String city, String postalCode) { this.line1 = line1; this.city = city; this.postalCode = postalCode; }
}

@Entity
public class Student {
    @Id @GeneratedValue private Long id;

    @NaturalId @Column(nullable = false, updatable = false) private String email;

    @Embedded private Address home;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "line1", column = @Column(name = "billing_line1")),
        @AttributeOverride(name = "city", column = @Column(name = "billing_city")),
        @AttributeOverride(name = "postalCode", column = @Column(name = "billing_postal"))
    })
    private Address billing;

    @Override public boolean equals(Object o) { return o instanceof Student s && Objects.equals(email, s.email); }   // business key
    @Override public int hashCode() { return Objects.hash(email); }
}`,
        ),
      ],
      [
        ['Why use EnumType.STRING instead of ORDINAL?', 'ORDINAL stores the position (0, 1, 2), so reordering or inserting constants silently corrupts existing data. STRING stores the constant name, which is stable and readable.'],
        ['Is @Temporal still needed?', 'Only for legacy java.util.Date and Calendar. With java.time types (LocalDate, LocalDateTime, Instant, OffsetDateTime) Hibernate maps date/time natively without @Temporal.'],
        ['Why must an entity have a no-arg constructor and not be final?', 'Hibernate instantiates entities reflectively and creates runtime proxy subclasses for lazy loading; a final class or missing constructor prevents proxying and instantiation.'],
      ],
    ),
    topic(
      'hb-id-generation',
      'Primary Keys and @GeneratedValue Strategies',
      [
        blk(`<h3>Choosing an identifier</h3>
• <code>@Id</code> marks the primary key. Types: <code>Long</code> (most common), <code>Integer</code>, <code>UUID</code>, <code>String</code> (natural keys), embedded/composite keys. Use <b>wrapper types</b> (<code>Long</code>, not <code>long</code>) so a transient entity has <code>id == null</code>.<br>
• <code>@GeneratedValue(strategy)</code> lets the database or Hibernate generate it: <b><code>IDENTITY</code></b> (auto-increment column), <b><code>SEQUENCE</code></b> (database sequence, with a generator), <b><code>TABLE</code></b> (rarely), <b><code>AUTO</code></b> (provider picks: sequence on PostgreSQL/Oracle, identity or sequence emulation on MySQL), and <b><code>UUID</code></b> (Hibernate 6: <code>GenerationType.UUID</code>).`,
          `// 1. IDENTITY: simple, MySQL/SQL Server style; the insert happens immediately on persist() and DISABLES JDBC insert batching
@Id @GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

// 2. SEQUENCE: best for PostgreSQL/Oracle; allows batching and pooled ids (one DB call per 50 ids)
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "course_seq")
@SequenceGenerator(name = "course_seq", sequenceName = "course_seq", allocationSize = 50)
private Long id;

// 3. UUID: globally unique, safe to expose, good for distributed systems (index locality is worse unless time-ordered UUIDv7)
@Id @GeneratedValue(strategy = GenerationType.UUID)
private UUID id;

// 4. Assigned (natural or application generated)
@Id @Column(length = 36) private String id = UUID.randomUUID().toString();`,
        ),
      ],
      [
        blk(`<h3>Strategy trade-offs</h3>
<table ${TABLE}>
<tr><th>Strategy</th><th>How</th><th>Pros</th><th>Cons</th></tr>
<tr><td>IDENTITY</td><td>DB auto-increment</td><td>Simple, human-friendly ids</td><td>Insert executes at <code>persist()</code> to learn the id; <b>no JDBC batch inserts</b></td></tr>
<tr><td>SEQUENCE</td><td>DB sequence, pooled optimiser</td><td>Batch-friendly, id known before flush, fewer round trips</td><td>Not on MySQL &lt; 8 (emulated with a table); need allocationSize = sequence INCREMENT BY</td></tr>
<tr><td>UUID</td><td>128-bit random/time-based</td><td>Unique across services/DBs, no coordination, no id enumeration</td><td>Larger index, random UUIDs fragment B-trees (prefer time-ordered)</td></tr>
<tr><td>TABLE</td><td>Row in a table</td><td>Portable</td><td>Slow, lock contention: avoid</td></tr>
<tr><td>AUTO</td><td>Provider decides</td><td>Convenient</td><td>Behaviour differs per database: be explicit</td></tr>
</table>
• <b>Rule</b>: PostgreSQL/Oracle → <code>SEQUENCE</code> with <code>allocationSize</code> matching the sequence <code>INCREMENT BY</code>; MySQL → <code>IDENTITY</code> (accept no batching for inserts) or UUID; microservices that publish ids across services often prefer <b>UUIDs</b>.`,
          `-- PostgreSQL: the sequence must match allocationSize
CREATE SEQUENCE course_seq START WITH 1 INCREMENT BY 50;

-- Flyway for MySQL with UUIDs stored compactly
CREATE TABLE enrollment (
  id BINARY(16) PRIMARY KEY,        -- Hibernate maps java.util.UUID to BINARY(16) with @JdbcTypeCode(SqlTypes.BINARY) / or CHAR(36)
  ...
);

// Time-ordered UUIDs reduce index fragmentation (Hibernate 6.5+)
@Id @UuidGenerator(style = UuidGenerator.Style.TIME)
private UUID id;`,
        ),
      ],
      [
        blk(`<h3>Sequence tuning, pooled optimisers and key design</h3>
• <b>Pooled optimiser</b> (the default for <code>SEQUENCE</code> in Hibernate 6): one sequence call reserves <code>allocationSize</code> ids; <code>allocationSize = 50</code> means 50 inserts per round trip to the sequence. If several application instances share the sequence, the pooled optimiser still avoids collisions because the sequence increments by the same size.<br>
• <b>Do not expose database ids</b> in URLs if enumeration matters: use a public <b>UUID</b> or <code>@NaturalId</code> slug alongside the surrogate key. <b>Natural keys</b> (<code>email</code>, ISBN) change more often than expected: prefer surrogate primary keys with a unique constraint on the natural key.<br>
• <b>Testing id generation</b>: the first persisted entity per transaction shows whether ids come from a sequence call (<code>select nextval</code>) or the insert itself; check the SQL log. Changing the strategy of a live table needs a migration (sequence start value must be above the current max id).`,
          `-- migrate from IDENTITY to SEQUENCE on PostgreSQL without clashing ids
CREATE SEQUENCE course_seq START WITH 100000 INCREMENT BY 50;   -- start above the current max(id)
ALTER TABLE course ALTER COLUMN id DROP IDENTITY IF EXISTS;

@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "course_seq")
@SequenceGenerator(name = "course_seq", sequenceName = "course_seq", allocationSize = 50)
private Long id;

// public identifier separate from the primary key
@NaturalId @Column(nullable = false, updatable = false, unique = true, length = 36)
private String publicId = UUID.randomUUID().toString();

Course c = session.bySimpleNaturalId(Course.class).load(publicId);      // fast lookup by the business key`,
        ),
      ],
      [
        ['Why does IDENTITY disable JDBC batch inserts?', 'Hibernate must execute each INSERT immediately to obtain the generated key, so it cannot queue and batch inserts. SEQUENCE ids can be allocated up front, so inserts can be batched.'],
        ['What is allocationSize in @SequenceGenerator?', 'The number of ids Hibernate reserves from the sequence per call (pooled optimiser). It must match the sequence INCREMENT BY, otherwise ids collide or are wasted.'],
        ['When are UUID primary keys a good idea?', 'In distributed or microservice systems needing globally unique ids without coordination, or to avoid exposing guessable ids; use time-ordered UUIDs to limit index fragmentation.'],
      ],
    ),
    topic(
      'hb-entity-lifecycle-session',
      'Entity Lifecycle, Persistence Context, Session vs EntityManager',
      [
        blk(`<h3>Entity states</h3>
• <b>Transient (new)</b>: created with <code>new</code>, no id (or not associated), not in the database, unknown to Hibernate.<br>
• <b>Persistent (managed)</b>: associated with an open persistence context (Session/EntityManager). Hibernate tracks it: changes are detected (<b>dirty checking</b>) and written at flush/commit. Returned by <code>find()</code>, queries, and after <code>persist()</code>.<br>
• <b>Detached</b>: has a database identity but its persistence context was closed/cleared; changes are <b>not</b> tracked. Reattach with <code>merge()</code>.<br>
• <b>Removed</b>: scheduled for deletion at flush (<code>remove()</code>).`,
          `Course c = new Course("JPA", "jpa", BigDecimal.TEN, Level.BEGINNER);   // TRANSIENT

em.getTransaction().begin();
em.persist(c);                          // -> PERSISTENT (insert at flush/commit, or immediately with IDENTITY)
c.setPrice(BigDecimal.valueOf(20));     // tracked: UPDATE at flush (dirty checking)
em.getTransaction().commit();           // flush + commit

em.detach(c);                           // -> DETACHED: further changes are ignored
c.setPrice(BigDecimal.valueOf(30));     // NOT saved

em.getTransaction().begin();
Course managed = em.merge(c);           // copies state onto a MANAGED instance and returns it (c itself stays detached)
em.remove(managed);                     // -> REMOVED: DELETE at flush
em.getTransaction().commit();`,
        ),
      ],
      [
        blk(`<h3>The persistence context (first-level cache)</h3>
• The <b>persistence context</b> is the set of managed entities of one <code>EntityManager</code>/<code>Session</code>: a <b>first-level cache and identity map</b> (one instance per row per context), a <b>unit of work</b> (change tracking) and the place where <b>write-behind</b> batching happens.<br>
• Guarantees: <code>find(Course.class, 1L)</code> twice in the same context returns the <b>same Java object</b> and runs one SELECT; entities are flushed in a defined order (inserts, updates, collection changes, deletes).<br>
• Lifetime: with Spring, a <b>transaction-scoped</b> persistence context starts and ends with the <code>@Transactional</code> method; entities returned from a service become <b>detached</b> after it returns. (Open Session In View extends it to the web request: disable it with <code>spring.jpa.open-in-view=false</code>.)`,
          `@Transactional
public void demo(Long id) {
    Course a = em.find(Course.class, id);        // SELECT ...
    Course b = em.find(Course.class, id);        // no SQL: served from the persistence context
    assert a == b;                                // same instance: identity guarantee

    a.setTitle("New title");                      // managed: no save() call needed
}                                                 // commit -> flush -> UPDATE course SET title=? WHERE id=?

public Course load(Long id) {                     // no @Transactional: each repository call has its own context
    Course c = repo.findById(id).orElseThrow();
    return c;                                     // detached here; touching a lazy association throws LazyInitializationException
}`,
        ),
      ],
      [
        blk(`<h3>Session vs EntityManager</h3>
<table ${TABLE}>
<tr><th></th><th><code>EntityManager</code> (JPA)</th><th><code>Session</code> (Hibernate)</th></tr>
<tr><td>Standard</td><td>Jakarta Persistence</td><td>Hibernate-specific; <code>Session extends EntityManager</code></td></tr>
<tr><td>Save</td><td><code>persist()</code>, <code>merge()</code></td><td>same, plus legacy <code>save()</code>, <code>saveOrUpdate()</code>, <code>update()</code> (removed in Hibernate 6.x)</td></tr>
<tr><td>Load</td><td><code>find()</code>, <code>getReference()</code></td><td>same, plus legacy <code>get()</code>, <code>load()</code>, plus <code>byId()</code>, <code>byNaturalId()</code>, <code>byMultipleIds()</code></td></tr>
<tr><td>Extras</td><td>—</td><td><code>setDefaultReadOnly</code>, <code>setHibernateFlushMode</code>, filters (<code>enableFilter</code>), <code>doWork</code>, stateless sessions, statistics</td></tr>
</table>
• In Spring Boot inject <code>EntityManager</code> via <code>@PersistenceContext</code> (a thread-safe <b>shared proxy</b> bound to the current transaction) and unwrap to <code>Session</code> only when you need Hibernate features. <code>EntityManagerFactory</code>/<code>SessionFactory</code> are the factories (see Fundamentals).`,
          `@Transactional
public Course fetch(Long id) {
    Session s = em.unwrap(Session.class);
    s.enableFilter("activeOnly");                                   // Hibernate-only feature
    return s.byId(Course.class).load(id);                           // Hibernate API (get)
}

// Stateless session: no persistence context, no dirty checking: for bulk reads/writes
try (StatelessSession ss = sessionFactory.openStatelessSession()) {
    ScrollableResults<Course> results = ss.createQuery("from Course", Course.class).scroll();
    while (results.next()) process(results.get());                  // constant memory
}`,
        ),
      ],
      [
        ['What are the entity states in Hibernate?', 'Transient (new, unknown to Hibernate), persistent/managed (attached to a persistence context and tracked), detached (has an id but its context closed) and removed (scheduled for deletion).'],
        ['What is the persistence context?', 'The set of entities managed by one EntityManager/Session: a first-level cache and identity map, the change-tracking unit of work and the write-behind queue flushed to the database at commit.'],
        ['Session vs EntityManager?', 'EntityManager is the JPA standard interface; Session is Hibernate\'s native interface that extends it with extra features (filters, stateless/read-only modes, byNaturalId, legacy methods). In Spring you normally inject EntityManager and unwrap Session when needed.'],
      ],
    ),
  ]),

  hb(3, 'CRUD Operations', 'Essential', [
    topic(
      'hb-crud-persist-merge',
      'Insert, Select, Update, Delete: persist, merge, remove, find, getReference',
      [
        blk(`<h3>Insert and select</h3>
• <b>Insert</b>: <code>em.persist(entity)</code> makes a transient entity managed and schedules an INSERT (executed at flush/commit, or immediately for <code>IDENTITY</code>). The id is available after persist for sequence/identity generators.<br>
• <b>Select by id</b>: <code>em.find(Class, id)</code> hits the persistence context, then the database (<code>SELECT</code>), returns the entity or <code>null</code>. <b><code>em.getReference(Class, id)</code></b> returns a <b>lazy proxy</b> without a query (throws <code>EntityNotFoundException</code> on first access if missing): ideal for setting a foreign key without loading the row.<br>
• Legacy Hibernate: <code>session.get()</code> ≈ <code>find()</code>; <code>session.load()</code> ≈ <code>getReference()</code>.`,
          `@Transactional
public Long create(CourseRequest r) {
    Course c = new Course(r.title(), slugify(r.title()), r.price(), r.level());
    em.persist(c);                                   // INSERT scheduled; c is now managed
    return c.getId();                                // id available (IDENTITY: INSERT already ran)
}

@Transactional(readOnly = true)
public Course get(Long id) {
    Course c = em.find(Course.class, id);            // null if not found
    if (c == null) throw new NotFoundException("Course " + id);
    return c;
}

@Transactional
public void enroll(Long studentId, Long courseId) {
    Enrollment e = new Enrollment();
    e.setStudent(em.getReference(Student.class, studentId));     // no SELECT: just an id-holding proxy
    e.setCourse(em.getReference(Course.class, courseId));
    em.persist(e);                                               // INSERT enrollment(student_id, course_id)
}`,
        ),
      ],
      [
        blk(`<h3>Update and delete</h3>
• <b>Update</b>: load the entity (managed) and change it: <b>dirty checking</b> issues the UPDATE at flush; <b>no <code>save()</code>/<code>update()</code> call is needed</b> inside a transaction. For a <b>detached</b> entity use <code>em.merge(entity)</code>, which loads the managed copy, copies state and returns the managed instance.<br>
• <b>Delete</b>: <code>em.remove(managedEntity)</code> (must be managed; for a detached one use <code>em.remove(em.merge(e))</code> or <code>em.getReference</code>). Cascades apply. Bulk delete/update with JPQL (<code>delete from Course c where ...</code>) <b>bypasses</b> the persistence context and lifecycle callbacks.<br>
• Use <code>@DynamicUpdate</code> to include only changed columns in UPDATE statements (wide tables).`,
          `@Transactional
public void rename(Long id, String title) {
    Course c = em.find(Course.class, id);
    c.setTitle(title);                               // no explicit update call
}                                                    // flush -> UPDATE course SET title=?, ... WHERE id=?

@Transactional
public Course update(CourseDto dto) {               // dto carries an id: build a detached entity...
    Course detached = mapper.toEntity(dto);
    return em.merge(detached);                       // ...merge copies it onto a managed instance (SELECT, then UPDATE if changed)
}

@Transactional
public void delete(Long id) {
    Course c = em.getReference(Course.class, id);    // enough to schedule deletion (no full load unless cascades need it)
    em.remove(c);                                    // DELETE at flush
}

@Transactional
public int deactivateOld() {
    return em.createQuery("update Course c set c.active = false where c.updatedAt < :limit")   // bulk: one statement, bypasses L1 cache
              .setParameter("limit", Instant.now().minus(Duration.ofDays(365)))
              .executeUpdate();
}`,
        ),
      ],
      [
        blk(`<h3>persist vs merge, and the legacy save/update</h3>
<table ${TABLE}>
<tr><th></th><th><code>persist()</code></th><th><code>merge()</code></th></tr>
<tr><td>Input</td><td>Transient entity</td><td>Transient or detached</td></tr>
<tr><td>Result</td><td>The <b>same instance</b> becomes managed</td><td>Returns a <b>different managed copy</b>; the argument stays unmanaged</td></tr>
<tr><td>SQL</td><td>INSERT only</td><td>SELECT (to load by id) then INSERT or UPDATE</td></tr>
<tr><td>On a detached entity</td><td>Throws <code>PersistentObjectException</code></td><td>Reattaches state</td></tr>
<tr><td>Cascade type</td><td><code>PERSIST</code></td><td><code>MERGE</code></td></tr>
</table>
• <b>Legacy</b> Hibernate: <code>save()</code> (insert, returns id), <code>update()</code> (reattach and update), <code>saveOrUpdate()</code>; they were <b>deprecated and removed in Hibernate 6.x</b>: use <code>persist()</code>/<code>merge()</code>. Spring Data's <code>repository.save(entity)</code> calls <code>persist</code> if the entity is new (<code>isNew()</code>: id null or <code>@Version</code> null) else <code>merge</code>.<br>
• Gotcha: with <b>assigned ids</b>, <code>save()</code> thinks the entity is not new and performs a <b>SELECT + merge</b>: implement <code>Persistable</code> or use a <code>@Version</code>.`,
          `Course detached = ...;                 // came from a previous session or from JSON
Course managed = em.merge(detached);   // use THIS return value from now on
managed.setPrice(BigDecimal.TEN);      // tracked
detached.setPrice(BigDecimal.ONE);     // ignored: still detached

// Spring Data JPA
courseRepository.save(newCourse);      // id == null  -> em.persist
courseRepository.save(existing);       // id != null  -> em.merge (SELECT first)

// assigned id: avoid the extra SELECT by implementing Persistable
@Entity
class Country implements Persistable<String> {
    @Id private String code;
    @Transient private boolean isNew = true;
    @PostLoad @PostPersist void markNotNew() { this.isNew = false; }
    @Override public String getId() { return code; }
    @Override public boolean isNew() { return isNew; }
}`,
        ),
      ],
      [
        ['persist() vs merge()?', 'persist makes a transient instance managed and schedules an INSERT, keeping the same object; merge copies the state of a transient/detached instance onto a managed copy (loading by id) and returns that copy, issuing INSERT or UPDATE as needed.'],
        ['find() vs getReference()?', 'find returns the entity (hitting the database if not in the persistence context) or null; getReference returns a lazy proxy without a query and throws EntityNotFoundException on first access if the row does not exist. Use getReference to set foreign keys cheaply.'],
        ['Do you need to call save() to update a managed entity?', 'No. Changes to a managed entity are detected by dirty checking and written at flush/commit. save() is only needed for new or detached entities.'],
      ],
    ),
    topic(
      'hb-flush-clear-refresh',
      'flush(), clear(), refresh(), detach() and Legacy Operations',
      [
        blk(`<h3>flush() and clear()</h3>
• <b><code>flush()</code></b> synchronises the persistence context with the database: it executes pending INSERT/UPDATE/DELETE statements (inside the current transaction, <b>not committed yet</b>). It happens automatically before commit and (in <code>FlushMode.AUTO</code>) before a query that could be affected.<br>
• <b><code>clear()</code></b> detaches <b>all</b> managed entities and empties the first-level cache <b>without</b> flushing: unflushed changes are lost. Typical use: <b>batch processing</b>: <code>flush(); clear();</code> every N rows to keep memory flat.<br>
• <b><code>commit()</code></b> = flush + commit of the database transaction (changes become durable and visible).`,
          `@Transactional
public void importCourses(List<CourseRow> rows) {
    int batch = 0;
    for (CourseRow r : rows) {
        em.persist(new Course(r.title(), r.slug(), r.price(), r.level()));
        if (++batch % 50 == 0) {
            em.flush();            // send the 50 INSERTs (JDBC batch if enabled)
            em.clear();            // release the 50 managed entities: memory stays constant
        }
    }
}   // final flush at commit

// flush before a native query so it sees pending changes
em.persist(c);
em.flush();
Number n = (Number) em.createNativeQuery("select count(*) from course").getSingleResult();`,
        ),
      ],
      [
        blk(`<h3>refresh() and detach()</h3>
• <b><code>refresh(entity)</code></b> re-reads the row and <b>overwrites</b> the entity's state (discarding unflushed changes): use after a database trigger/other transaction changed data or to undo changes. Cascades with <code>CascadeType.REFRESH</code>.<br>
• <b><code>detach(entity)</code></b> removes one entity (and cascaded ones) from the persistence context: changes stop being tracked. Use for read-only copies or to avoid flushing an entity. <code>em.contains(e)</code> tells if it is managed.<br>
• <code>em.lock(entity, lockMode)</code> and <code>em.getFlushMode()/setFlushMode()</code> complete the API.`,
          `@Transactional
public void demo(Long id) {
    Course c = em.find(Course.class, id);
    c.setPrice(BigDecimal.ZERO);               // pending change

    em.refresh(c);                             // SELECT again: price is back to the database value; the change is gone

    em.detach(c);                              // untracked from now on
    c.setTitle("ignored");                     // not written
    boolean managed = em.contains(c);          // false
}

// refresh after a DB trigger computed a column
em.persist(order);
em.flush();
em.refresh(order);                             // picks up trigger-generated order_number`,
        ),
      ],
      [
        blk(`<h3>Legacy Hibernate APIs and migration</h3>
<table ${TABLE}>
<tr><th>Legacy (Session)</th><th>Modern (JPA)</th><th>Notes</th></tr>
<tr><td><code>save(e)</code></td><td><code>persist(e)</code></td><td><code>save</code> returned the id and could be used on assigned ids; removed in Hibernate 6.x</td></tr>
<tr><td><code>update(e)</code></td><td><code>merge(e)</code></td><td><code>update</code> reattached the given instance and always issued an UPDATE</td></tr>
<tr><td><code>saveOrUpdate(e)</code></td><td><code>persist</code> / <code>merge</code></td><td>Guessing based on id: ambiguous</td></tr>
<tr><td><code>get(Class, id)</code></td><td><code>find(Class, id)</code></td><td>Same behaviour</td></tr>
<tr><td><code>load(Class, id)</code></td><td><code>getReference(Class, id)</code></td><td>Lazy proxy</td></tr>
<tr><td><code>delete(e)</code></td><td><code>remove(e)</code></td><td>—</td></tr>
<tr><td><code>createCriteria()</code> (legacy)</td><td><code>CriteriaBuilder</code> (JPA)</td><td>Removed in Hibernate 6</td></tr>
</table>
• When migrating old code, replace these APIs and re-test lifecycle behaviour (especially <code>update()</code> semantics on detached graphs).`),
      ],
      [
        ['flush() vs commit()?', 'flush sends pending SQL to the database inside the open transaction (not yet durable/visible to others); commit performs a flush and then commits the database transaction, making changes permanent.'],
        ['What does clear() do and why use it in batch jobs?', 'It detaches all entities and empties the persistence context without flushing, releasing memory. In bulk imports flush() then clear() every N rows to avoid OutOfMemoryError and slow dirty checking.'],
        ['refresh() vs find()?', 'find may return a cached managed instance without hitting the database; refresh always reloads the row and overwrites the managed entity state, discarding unflushed changes.'],
      ],
    ),
    topic(
      'hb-transaction-management',
      'Transaction Management in Hibernate and JPA',
      [
        blk(`<h3>Transactions with the persistence API</h3>
• All modifications must run inside a <b>transaction</b>. A transaction groups operations into an atomic unit: <code>begin</code> → work → <code>commit</code> (or <code>rollback</code> on failure).<br>
• <b>Resource-local</b> (plain Hibernate/JPA on Java SE): <code>em.getTransaction().begin()/commit()/rollback()</code>. <b>Container/Spring-managed</b>: <code>@Transactional</code> (see Transactions section). <b>JTA</b> for distributed transactions across resources (rare in microservices).<br>
• Always <b>roll back on exception</b> and <b>close</b> the EntityManager (try-with-resources / finally). Keep transactions <b>short</b>: do not call remote services or wait for user input while a transaction (and its database connection) is open.`,
          `EntityManager em = emf.createEntityManager();
EntityTransaction tx = em.getTransaction();
try {
    tx.begin();
    Course c = em.find(Course.class, 1L);
    c.setPrice(new BigDecimal("1299"));
    em.persist(new Enrollment(c, student));
    tx.commit();                                  // flush + commit
} catch (RuntimeException e) {
    if (tx.isActive()) tx.rollback();             // undo everything
    throw e;
} finally {
    em.close();                                   // release the connection
}

// Spring: the framework does the above for you
@Transactional
public void enroll(long studentId, long courseId) { /* one atomic unit */ }`,
        ),
      ],
      [
        blk(`<h3>Rollback rules and common mistakes</h3>
• JPA marks the transaction <b>rollback-only</b> when a runtime exception (including <code>PersistenceException</code>) occurs; you cannot continue and commit. In Spring, <code>@Transactional</code> rolls back on <b>unchecked</b> exceptions by default and <b>commits on checked</b> exceptions unless you set <code>rollbackFor</code>.<br>
• Mistakes: swallowing an exception inside a transaction (then commit fails with <code>UnexpectedRollbackException</code>), calling a <code>@Transactional</code> method from the <b>same class</b> (self-invocation bypasses the proxy), putting <code>@Transactional</code> on <code>private</code>/non-public methods, long transactions holding connections, and doing remote calls inside them.<br>
• <b>Read-only</b> transactions (<code>@Transactional(readOnly = true)</code>) let Hibernate skip dirty checking and flushing (and Spring can route to read replicas).`,
          `@Service
class EnrollmentService {
    @Transactional(rollbackFor = Exception.class)          // also roll back on checked exceptions
    public void enroll(long s, long c) throws PaymentException {
        repo.save(new Enrollment(s, c));
        payments.charge(s, c);                              // throws a checked PaymentException -> rollback because of rollbackFor
    }

    @Transactional(readOnly = true)                         // no dirty checking, no flush
    public List<CourseDto> catalogue() { return repo.findAllProjected(); }

    public void outer() {
        this.inner();                                        // BUG: self-invocation: the proxy is bypassed, no transaction starts
    }
    @Transactional public void inner() { }
}`,
        ),
      ],
      [
        blk(`<h3>Transaction boundaries in practice</h3>
• <b>Define boundaries at the use case</b> (service method), not around individual repository calls: each repository call without an outer transaction runs in its own transaction and persistence context, so two consecutive calls are not atomic and entities become detached between them.<br>
• <b>Read-then-write</b> must be atomic: load and update in one transaction (and use <code>@Version</code> or locks to protect against concurrent changes).<br>
• <b>Avoid mixing remote calls</b> (HTTP, messaging) with database changes in one transaction: if the remote call succeeds and the commit fails, they are inconsistent. Use the <b>transactional outbox</b> pattern: write the event to an outbox table in the same transaction and publish it afterwards.<br>
• <b>Test rollbacks</b>: <code>@DataJpaTest</code> rolls back each test by default; use <code>@Commit</code> or <code>TestTransaction</code> when you need to verify committed behaviour.`,
          `@Service
@RequiredArgsConstructor
class EnrollmentService {
    private final EnrollmentRepository enrollments;
    private final OutboxRepository outbox;

    @Transactional
    public void enroll(long studentId, long courseId) {
        enrollments.save(new Enrollment(studentId, courseId));            // 1. business change
        outbox.save(OutboxEvent.of("EnrollmentCreated", studentId, courseId));   // 2. event in the SAME transaction (atomic)
    }                                                                     // commit: both rows or neither
}

@Scheduled(fixedDelay = 1000)
@Transactional
void relay() {                                                            // a separate job publishes committed events to Kafka
    outbox.findTop100ByPublishedFalseOrderByIdAsc().forEach(e -> { kafka.send(e.topic(), e.payload()); e.markPublished(); });
}`,
        ),
      ],
      [
        ['What happens to a JPA transaction when an exception occurs?', 'The transaction is marked rollback-only for persistence exceptions; commit will fail. In Spring, @Transactional rolls back for unchecked exceptions by default and commits for checked ones unless rollbackFor is specified.'],
        ['Why keep transactions short?', 'An open transaction holds a database connection and locks; long ones exhaust the connection pool, increase lock contention and deadlock risk, so do remote calls and slow work outside them.'],
        ['Why does @Transactional not work on a method called from the same class?', 'Spring applies it through a proxy; an internal call (this.method()) bypasses the proxy, so no transaction is started. Move the method to another bean or inject self.'],
      ],
    ),
  ]),

  hb(4, 'Entity Relationships', 'Essential', [
    topic(
      'hb-one-to-one-many',
      'One-to-One, Many-to-One, One-to-Many, @JoinColumn and mappedBy',
      [
        blk(`<h3>@ManyToOne: the foundation</h3>
• <b>@ManyToOne</b> (many enrolments → one course) puts the <b>foreign key column in the table of the "many" side</b>: it is the <b>owning side</b> and the simplest, most efficient mapping. Use <code>@JoinColumn(name = "course_id", nullable = false)</code>.<br>
• <b>Default fetch is EAGER for <code>@ManyToOne</code>/<code>@OneToOne</code></b>: set <code>fetch = FetchType.LAZY</code> explicitly almost always, to avoid loading extra rows and N+1 queries.<br>
• <b>Owning side</b> = the side that has the foreign key and whose changes Hibernate persists; <b>inverse side</b> = the side with <code>mappedBy</code> (read-only mirror).`,
          `@Entity
public class Enrollment {
    @Id @GeneratedValue private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)             // FK lives here: enrollment.course_id
    @JoinColumn(name = "course_id", nullable = false, foreignKey = @ForeignKey(name = "fk_enrollment_course"))
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    private Instant enrolledAt = Instant.now();
}
// Unidirectional @ManyToOne: Enrollment knows its Course, Course does not know its enrolments.
// SQL:  insert into enrollment (course_id, student_id, enrolled_at) values (?, ?, ?)`,
        ),
      ],
      [
        blk(`<h3>@OneToMany and bidirectional mappings</h3>
• <b>@OneToMany(mappedBy = "course")</b> on the "one" side makes the relationship <b>bidirectional</b>: <code>Course.enrollments</code> is the <b>inverse side</b> (no extra columns; the FK is owned by <code>Enrollment.course</code>). Always prefer this over a unidirectional <code>@OneToMany</code> with <code>@JoinColumn</code>/join table (extra UPDATE statements or an extra table).<br>
• Keep both sides in sync with <b>helper methods</b> (<code>addEnrollment</code>/<code>removeEnrollment</code>) that set both references; otherwise the in-memory graph is inconsistent and only the owning side is persisted.<br>
• Initialise collections (<code>new ArrayList&lt;&gt;()</code> / <code>LinkedHashSet</code>), expose them unmodifiable, and use <code>cascade</code>/<code>orphanRemoval</code> for parent-owned children (an order and its lines), not for independent entities.`,
          `@Entity
public class Course {
    @Id @GeneratedValue private Long id;
    private String title;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)    // inverse side
    private List<Lesson> lessons = new ArrayList<>();

    public void addLesson(Lesson l) { lessons.add(l); l.setCourse(this); }               // keep both sides in sync
    public void removeLesson(Lesson l) { lessons.remove(l); l.setCourse(null); }
    public List<Lesson> getLessons() { return Collections.unmodifiableList(lessons); }
}

@Entity
public class Lesson {
    @Id @GeneratedValue private Long id;
    private String title;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "course_id")  // owning side
    private Course course;
}

Course c = new Course("Hibernate");
c.addLesson(new Lesson("Mapping"));
c.addLesson(new Lesson("Queries"));
em.persist(c);          // cascades: insert course, then 2 lessons with course_id`,
        ),
      ],
      [
        blk(`<h3>@OneToOne and owning vs inverse side</h3>
• <b>@OneToOne</b>: a student has one profile. Best mapping: <b>shared primary key</b> with <code>@MapsId</code> (the child's PK is also its FK), or a unique FK column with <code>@JoinColumn(unique = true)</code>. Mark the owning side <code>fetch = LAZY</code>. The <b>inverse side</b> (<code>mappedBy</code>) of a one-to-one is <b>always loaded eagerly</b> in practice (Hibernate must query to know whether it is null) unless you use bytecode enhancement, optional=false is not enough: model it from the owning side if possible, or query by FK.<br>
• Rules of thumb: <b>owning side = side with the foreign key</b>; only the owning side's state is persisted; the inverse side exists for navigation. Choose <b>unidirectional from the many side</b> whenever you can.`,
          `@Entity
public class Student {
    @Id @GeneratedValue private Long id;
    private String name;

    @OneToOne(mappedBy = "student", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)   // inverse side
    private StudentProfile profile;

    public void setProfile(StudentProfile p) { this.profile = p; if (p != null) p.setStudent(this); }
}

@Entity
public class StudentProfile {
    @Id private Long id;                                    // same value as student.id (shared primary key)

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId                                                  // use the student's id as this row's id
    @JoinColumn(name = "id")
    private Student student;

    private String bio;
    private String avatarUrl;
}
// table student_profile(id PK FK -> student.id, bio, avatar_url): no extra FK column, one index`,
        ),
      ],
      [
        ['What are the owning and inverse sides?', 'The owning side has the foreign key and its state is what Hibernate persists; the inverse side (mappedBy) is a read-only mirror used for navigation. Changes made only on the inverse side are ignored.'],
        ['What does mappedBy mean?', 'It states that the relationship is mapped by a field on the other entity (the owning side), so this side adds no column or join table of its own.'],
        ['Why should @ManyToOne be set to LAZY?', 'The JPA default for @ManyToOne and @OneToOne is EAGER, which loads the associated row immediately and causes extra queries and N+1 problems. Declare fetch = LAZY and fetch what you need explicitly.'],
      ],
    ),
    topic(
      'hb-many-to-many',
      'Many-to-Many, @JoinTable, Bidirectional vs Unidirectional',
      [
        blk(`<h3>@ManyToMany with @JoinTable</h3>
• <b>@ManyToMany</b> models students ↔ courses with a <b>join (link) table</b> holding two foreign keys. The <b>owning side</b> declares <code>@JoinTable(name, joinColumns, inverseJoinColumns)</code>; the other side uses <code>mappedBy</code>.<br>
• Use a <b><code>Set</code></b> (not <code>List</code>) for many-to-many collections: with a <code>List</code> (a "bag") Hibernate deletes <b>all</b> link rows and re-inserts them on any change. Never use <code>CascadeType.REMOVE/ALL</code> on many-to-many (deleting one entity would delete shared ones).<br>
• Keep both sides in sync with helper methods and implement <code>equals/hashCode</code> on a business key so Set semantics work.`,
          `@Entity
public class Student {
    @Id @GeneratedValue private Long id;
    private String name;

    @ManyToMany                                                    // owning side
    @JoinTable(name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id"))
    private Set<Course> courses = new HashSet<>();

    public void enroll(Course c) { courses.add(c); c.getStudents().add(this); }
    public void drop(Course c) { courses.remove(c); c.getStudents().remove(this); }
}

@Entity
public class Course {
    @Id @GeneratedValue private Long id;
    @ManyToMany(mappedBy = "courses")                              // inverse side
    private Set<Student> students = new HashSet<>();
    public Set<Student> getStudents() { return students; }
}
// Tables: student, course, student_course(student_id, course_id, PRIMARY KEY (student_id, course_id))`,
        ),
      ],
      [
        blk(`<h3>When the link has data: use an association entity</h3>
• As soon as the relationship has <b>its own attributes</b> (enrolled date, grade, status) a plain <code>@ManyToMany</code> cannot hold them. Model the link table as an <b>entity</b> with two <code>@ManyToOne</code> associations (and optionally a composite or surrogate key). This is also the better default for most real many-to-many relationships: it is queryable, extensible and avoids bag/set surprises.<br>
• Then the "many-to-many" becomes two <b>one-to-many</b> relationships: <code>Student 1-* Enrollment *-1 Course</code>.`,
          `@Entity
@Table(name = "enrollment", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
public class Enrollment {
    @Id @GeneratedValue private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Student student;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Course course;

    private Instant enrolledAt = Instant.now();
    @Enumerated(EnumType.STRING) private Status status = Status.ACTIVE;
    private Integer grade;
}

@Entity public class Student { @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true) private Set<Enrollment> enrollments = new HashSet<>(); }
@Entity public class Course  { @OneToMany(mappedBy = "course") private Set<Enrollment> enrollments = new HashSet<>(); }

// Query "students of a course with grade >= 80" is straightforward:
// select e.student from Enrollment e where e.course.id = :id and e.grade >= 80`,
        ),
      ],
      [
        blk(`<h3>Unidirectional vs bidirectional: choosing</h3>
<table ${TABLE}>
<tr><th></th><th>Unidirectional</th><th>Bidirectional</th></tr>
<tr><td>Navigation</td><td>One direction (<code>Enrollment → Course</code>)</td><td>Both directions</td></tr>
<tr><td>Complexity</td><td>Simple; fewer sync bugs</td><td>Needs helper methods, <code>mappedBy</code>, careful <code>toString/equals</code></td></tr>
<tr><td>Queries</td><td>Query from the owning side</td><td>Convenient graph traversal</td></tr>
<tr><td>Recommended</td><td><b>Default choice</b>: <code>@ManyToOne</code> only</td><td>Only when you really navigate from the "one" side (parent-owned children with cascade)</td></tr>
</table>
• <b>Bidirectional pitfalls</b>: infinite recursion in <code>toString</code>, Jackson serialisation (<code>@JsonIgnore</code>/DTOs/<code>@JsonManagedReference</code>), forgetting to set both sides, lazy collections triggering SELECTs, equals/hashCode using collections. <b>Do not expose entities from REST controllers</b>: map to DTOs.<br>
• <b>Unidirectional @OneToMany</b> (parent has a list, child has no back reference) without <code>mappedBy</code> produces an extra join table or extra UPDATEs: avoid it, or use <code>@OneToMany @JoinColumn(name="course_id")</code> knowingly.`,
          `// Avoid: unidirectional @OneToMany with @JoinColumn -> insert child, then UPDATE child SET course_id=?
@OneToMany @JoinColumn(name = "course_id")
private List<Lesson> lessons = new ArrayList<>();

// Prefer: @ManyToOne on the child (owning), optional inverse list with mappedBy on the parent

// toString that does NOT trigger lazy loading or recursion
@Override public String toString() { return "Course{id=" + id + ", title=" + title + "}"; }

// DTO instead of exposing entities
public record CourseDto(Long id, String title, List<LessonDto> lessons) {
    static CourseDto from(Course c) { return new CourseDto(c.getId(), c.getTitle(), c.getLessons().stream().map(LessonDto::from).toList()); }
}`,
        ),
      ],
      [
        ['Why use a Set instead of a List in @ManyToMany?', 'A List (bag) has no identity, so Hibernate deletes all rows of the link table and re-inserts them when the collection changes; a Set lets it delete and insert only the affected rows.'],
        ['When should a many-to-many become an entity?', 'When the relationship has its own attributes (date, status, grade) or needs to be queried or audited: model the link table as an entity with two @ManyToOne associations.'],
        ['How do you handle bidirectional relationships safely?', 'Maintain both sides with helper methods, make one side the owner (the one with the FK) and the other mappedBy, avoid entities in toString/equals that touch lazy collections, and return DTOs rather than entities from controllers.'],
      ],
    ),
    topic(
      'hb-cascade-orphan-fetch',
      'Cascade Types, Orphan Removal and Fetch Types (Lazy vs Eager)',
      [
        blk(`<h3>Cascade types</h3>
• <b>Cascading</b> propagates an operation from a parent to its associated entities. <code>CascadeType</code>: <code>PERSIST</code>, <code>MERGE</code>, <code>REMOVE</code>, <code>REFRESH</code>, <code>DETACH</code>, <code>ALL</code> (all of them), plus Hibernate's <code>@Cascade(SAVE_UPDATE...)</code> (legacy).<br>
• Use cascade for <b>composition</b> (the child cannot exist without the parent: order → order lines, course → lessons). <b>Do not cascade</b> to independent aggregates (course → category, student → country) and never <code>REMOVE</code>/<code>ALL</code> on <code>@ManyToMany</code> or <code>@ManyToOne</code>.<br>
• Cascading <code>REMOVE</code> loads the children and issues one DELETE per child (slow for large collections): consider <code>@OnDelete(action = OnDeleteAction.CASCADE)</code> (database <code>ON DELETE CASCADE</code>) or a bulk delete.`,
          `@Entity
public class Order {
    @Id @GeneratedValue private Long id;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)   // lines live and die with the order
    private List<OrderLine> lines = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)                                                 // NO cascade: customers are independent
    private Customer customer;
}

Order o = new Order();
o.addLine(new OrderLine(product, 2));
em.persist(o);                 // PERSIST cascades: INSERT order, INSERT line
em.remove(o);                  // REMOVE cascades: DELETE lines, then DELETE order

// Database-level cascade: one DELETE statement, no loading of children
@OneToMany(mappedBy = "course")
@OnDelete(action = OnDeleteAction.CASCADE)
private Set<Lesson> lessons;`,
        ),
      ],
      [
        blk(`<h3>Orphan removal</h3>
• <b><code>orphanRemoval = true</code></b> deletes a child row when it is <b>removed from the parent's collection</b> (or its reference is set to <code>null</code> for one-to-one). It models "this child belongs to exactly one parent". It is stronger than <code>CascadeType.REMOVE</code>, which only deletes children when the <b>parent</b> is deleted.<br>
• Use only on <code>@OneToMany</code>/<code>@OneToOne</code> where the child is exclusively owned. <b>Do not replace the collection instance</b> (<code>setLines(newList)</code>): Hibernate loses track and throws "A collection with cascade=all-delete-orphan was no longer referenced": mutate the existing collection (<code>clear()</code> + <code>addAll()</code>).`,
          `Order o = em.find(Order.class, id);
OrderLine line = o.getLines().get(0);
o.removeLine(line);                     // lines.remove(line); line.setOrder(null)
// at flush: DELETE FROM order_line WHERE id=?   (orphan removed)

// WRONG: replacing the managed collection
// o.setLines(new ArrayList<>(newLines));     // HibernateException: collection ... no longer referenced
// RIGHT: change the existing collection in place
o.getLines().clear();
o.getLines().addAll(newLines);`,
        ),
      ],
      [
        blk(`<h3>Fetch types: LAZY vs EAGER</h3>
• <b>LAZY</b>: the association is loaded <b>on first access</b> (via a proxy for to-one, a <code>PersistentBag/Set</code> for collections), needing an <b>open session</b>. <b>EAGER</b>: loaded together with the owner (a join or follow-up SELECT), always.<br>
<table ${TABLE}>
<tr><th>Association</th><th>JPA default</th><th>Recommendation</th></tr>
<tr><td><code>@ManyToOne</code>, <code>@OneToOne</code></td><td>EAGER</td><td>Set <b>LAZY</b></td></tr>
<tr><td><code>@OneToMany</code>, <code>@ManyToMany</code></td><td>LAZY</td><td>Keep LAZY</td></tr>
<tr><td><code>@ElementCollection</code></td><td>LAZY</td><td>Keep LAZY</td></tr>
</table>
• <b>EAGER is a design smell</b>: it cannot be switched off per query, multiplies queries (N+1) and loads data you do not need. Make everything LAZY in the mapping and <b>fetch what a use case needs explicitly</b> (<code>join fetch</code>, entity graphs, projections).<br>
• <b>LazyInitializationException</b>: accessing a lazy association after the session closed. Fix by fetching in the query/transaction, using DTOs, or entity graphs; <b>not</b> by switching to EAGER or enabling Open Session In View.`,
          `@Entity
public class Course {
    @ManyToOne(fetch = FetchType.LAZY) private Category category;               // proxy until used
    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY) private Set<Lesson> lessons;
}

public Course find(Long id) {                       // no transaction here
    Course c = repo.findById(id).orElseThrow();
    c.getLessons().size();                          // LazyInitializationException: could not initialize proxy - no Session
    return c;
}

@Transactional(readOnly = true)
public CourseDetailDto detail(Long id) {
    Course c = repo.findWithLessons(id);            // fetch join: lessons loaded in the same query
    return CourseDetailDto.from(c);                 // map to a DTO inside the transaction
}
// repository
@Query("select c from Course c left join fetch c.lessons where c.id = :id")
Course findWithLessons(Long id);`,
        ),
      ],
      [
        ['What is cascading and which types exist?', 'Cascading propagates entity operations from a parent to its associations: PERSIST, MERGE, REMOVE, REFRESH, DETACH, or ALL. Use it for composition (order lines), not for independent entities.'],
        ['Cascade REMOVE vs orphanRemoval?', 'REMOVE deletes children when the parent is deleted; orphanRemoval also deletes a child when it is removed from the parent\'s collection (or the reference is nulled), even though the parent still exists.'],
        ['Lazy vs eager loading and how do you fix LazyInitializationException?', 'Lazy loads an association on first access (needs an open session); eager loads it with the owner. Fix the exception by fetching required data inside the transaction (join fetch, entity graph, DTO projection), not by making everything eager.'],
      ],
    ),
  ]),

  hb(5, 'Hibernate Querying', 'Core', [
    topic(
      'hb-hql-jpql-native',
      'HQL, JPQL, Native SQL and Parameterized Queries',
      [
        blk(`<h3>JPQL and HQL</h3>
• <b>JPQL</b> (Jakarta Persistence Query Language) is the standard object-oriented query language: you query <b>entities and their fields</b>, not tables and columns. <b>HQL</b> is Hibernate's superset (more functions, <code>from Course</code> without <code>select</code>, extra joins). In Hibernate 6 both are processed by the same engine (SQM).<br>
• Create with <code>em.createQuery(jpql, ResultType.class)</code> (typed): <code>getResultList()</code>, <code>getSingleResult()</code> (throws if none/many), <code>getResultStream()</code>, <code>executeUpdate()</code> for bulk update/delete.<br>
• Entity names are case-sensitive, keywords are not. Navigate associations with dot notation (<code>c.category.name</code>) which generates implicit joins.`,
          `List<Course> courses = em.createQuery(
        "select c from Course c where c.level = :level and c.price <= :max order by c.title", Course.class)
    .setParameter("level", Level.BEGINNER)
    .setParameter("max", new BigDecimal("2000"))
    .getResultList();

// HQL: select clause optional
List<Course> all = em.createQuery("from Course", Course.class).getResultList();

Long count = em.createQuery("select count(c) from Course c where c.category.name = :name", Long.class)
    .setParameter("name", "Java").getSingleResult();

int updated = em.createQuery("update Course c set c.price = c.price * 1.1 where c.level = :l")
    .setParameter("l", Level.ADVANCED).executeUpdate();       // bulk: bypasses persistence context, version and listeners`,
        ),
      ],
      [
        blk(`<h3>Parameterized queries and SQL injection</h3>
• <b>Always bind parameters</b>: named (<code>:name</code>, preferred) or positional (<code>?1</code>). Parameters are sent to the database as <b>bind variables</b> (JDBC <code>PreparedStatement</code>): prevents <b>SQL injection</b>, enables statement caching and plan reuse, and handles quoting/types.<br>
• <b>Never concatenate user input</b> into a query string. For a dynamic <code>order by</code> use a whitelist of allowed fields; for dynamic <code>where</code> use Criteria/Specifications.<br>
• <code>like</code> with wildcards: build the pattern in Java and bind it (<code>"%" + escape(q) + "%"</code>), or use <code>concat</code>/<code>lower</code> in the query.`,
          `// VULNERABLE
String bad = "from Course c where c.title = '" + userInput + "'";             // userInput = "x' or '1'='1"

// SAFE
em.createQuery("from Course c where lower(c.title) like lower(:q)", Course.class)
  .setParameter("q", "%" + userInput.trim() + "%")
  .getResultList();

// Dynamic sort: whitelist, never concatenate raw input
Map<String, String> allowed = Map.of("title", "c.title", "price", "c.price", "created", "c.createdAt");
String order = allowed.getOrDefault(sortParam, "c.title");
em.createQuery("from Course c order by " + order, Course.class);

// collection parameter
em.createQuery("from Course c where c.id in :ids", Course.class).setParameter("ids", List.of(1L, 2L, 3L));`,
        ),
      ],
      [
        blk(`<h3>Native SQL queries</h3>
• <code>em.createNativeQuery(sql, Entity.class)</code> executes <b>database-specific SQL</b> and maps columns to an entity, a <b><code>@SqlResultSetMapping</code></b> (DTO), or an <code>Object[]</code>/<code>Tuple</code>. Use for features JPQL lacks: window functions, recursive CTEs, database functions, hints, full-text search, <b>complex reports</b>, upserts.<br>
• Trade-offs: not portable, no entity name abstraction, results bypass the persistence context unless mapped to entities. <b>Flush before native queries</b> (Hibernate flushes automatically only if it knows the affected tables: pass query spaces or call <code>flush()</code>).<br>
• In Spring Data JPA: <code>@Query(value = "...", nativeQuery = true)</code>; for pagination add a <code>countQuery</code>.`,
          `// entity result
List<Course> popular = em.createNativeQuery(
        "select c.* from course c join (select course_id, count(*) n from enrollment group by course_id order by n desc limit 10) t on t.course_id = c.id",
        Course.class).getResultList();

// tuple/DTO result (Hibernate 6)
List<CourseStat> stats = em.createNativeQuery(
        "select c.id as courseId, c.title as title, count(e.id) as enrolments from course c left join enrollment e on e.course_id = c.id group by c.id, c.title",
        Tuple.class).getResultStream()
    .map(t -> new CourseStat(t.get("courseId", Long.class), t.get("title", String.class), t.get("enrolments", Long.class)))
    .toList();

// Spring Data JPA
@Query(value = "select * from course where match(title, description) against (:q in natural language mode)", nativeQuery = true)
List<Course> fullText(@Param("q") String q);`,
        ),
      ],
      [
        ['JPQL vs HQL vs native SQL?', 'JPQL is the standard entity-based query language; HQL is Hibernate\'s superset of it; native SQL is database-specific SQL on tables and columns, useful for features JPQL lacks but not portable.'],
        ['Why use parameterised queries?', 'Parameters are sent as bind variables, preventing SQL injection, enabling statement and plan caching and handling types/quoting correctly. Never concatenate user input into queries.'],
        ['When would you use a native query?', 'For database-specific features (window functions, recursive CTEs, full-text search, upserts) and complex reporting queries that are awkward in JPQL, accepting reduced portability.'],
      ],
    ),
    topic(
      'hb-criteria-named',
      'Criteria API and Named Queries',
      [
        blk(`<h3>Criteria API</h3>
• The <b>Criteria API</b> builds queries <b>programmatically and type-safely</b>: <code>CriteriaBuilder</code> → <code>CriteriaQuery&lt;T&gt;</code> → <code>Root&lt;E&gt;</code> → <code>Predicate</code>s. Best for <b>dynamic queries</b> (search forms with optional filters) where string concatenation would be error-prone.<br>
• It is verbose; combine with the JPA <b>static metamodel</b> (<code>Course_.title</code>, generated by <code>hibernate-jpamodelgen</code>) for compile-time safety. Spring Data's <b>Specifications</b> wrap it nicely. (The old <code>session.createCriteria()</code> is removed in Hibernate 6.)`,
          `public List<Course> search(String q, Level level, BigDecimal maxPrice) {
    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<Course> cq = cb.createQuery(Course.class);
    Root<Course> c = cq.from(Course.class);

    List<Predicate> where = new ArrayList<>();
    if (q != null && !q.isBlank()) where.add(cb.like(cb.lower(c.get(Course_.title)), "%" + q.toLowerCase() + "%"));
    if (level != null)             where.add(cb.equal(c.get(Course_.level), level));
    if (maxPrice != null)          where.add(cb.le(c.get(Course_.price), maxPrice));

    cq.select(c).where(where.toArray(Predicate[]::new)).orderBy(cb.asc(c.get(Course_.title)));
    return em.createQuery(cq).setMaxResults(50).getResultList();
}`,
        ),
      ],
      [
        blk(`<h3>Criteria with joins, aggregates and tuples</h3>
• <code>root.join("category")</code>/<code>fetch(...)</code> (join fetch), <code>cb.count</code>, <code>cb.sum</code>, <code>cb.avg</code>, <code>groupBy</code>, <code>having</code>, subqueries (<code>cq.subquery(...)</code>), <code>cb.construct(Dto.class, ...)</code> for DTO projections, <code>CriteriaQuery&lt;Tuple&gt;</code> with <code>multiselect</code>.<br>
• Hibernate 6 also offers <b>CriteriaDefinition</b>/<b>HibernateCriteriaBuilder</b> with more functions.`,
          `// aggregate with group by and DTO construction
CriteriaQuery<CategoryStat> cq = cb.createQuery(CategoryStat.class);
Root<Course> c = cq.from(Course.class);
Join<Course, Category> cat = c.join(Course_.category);
cq.select(cb.construct(CategoryStat.class, cat.get(Category_.name), cb.count(c), cb.avg(c.get(Course_.price))))
  .groupBy(cat.get(Category_.name))
  .having(cb.gt(cb.count(c), 2L))
  .orderBy(cb.desc(cb.count(c)));
List<CategoryStat> stats = em.createQuery(cq).getResultList();

// join fetch to avoid N+1
cq.select(c).distinct(true);
c.fetch(Course_.lessons, JoinType.LEFT);`,
        ),
      ],
      [
        blk(`<h3>Named queries</h3>
• A <b>named query</b> is a JPQL/native query with a name, declared on the entity (<code>@NamedQuery</code>, <code>@NamedNativeQuery</code>) and <b>validated at startup</b> (syntax errors appear at boot, not at first use) and pre-parsed. Create with <code>em.createNamedQuery("Course.byLevel", Course.class)</code>.<br>
• Good for stable, reused queries; clutters entities, so many teams prefer repository <code>@Query</code> methods (Spring Data registers them as named queries under the hood) or external <code>META-INF/orm.xml</code>. Naming convention: <code>Entity.queryName</code>.`,
          `@Entity
@NamedQuery(name = "Course.byLevel", query = "select c from Course c where c.level = :level order by c.title")
@NamedQuery(name = "Course.countByCategory", query = "select count(c) from Course c where c.category.id = :cat")
@NamedNativeQuery(name = "Course.topRated", query = "select * from course order by rating desc limit :n", resultClass = Course.class)
public class Course { /* ... */ }

List<Course> beginners = em.createNamedQuery("Course.byLevel", Course.class)
    .setParameter("level", Level.BEGINNER)
    .getResultList();

// Spring Data JPA: the same idea with less ceremony
public interface CourseRepository extends JpaRepository<Course, Long> {
    @Query("select c from Course c where c.level = :level order by c.title")
    List<Course> byLevel(@Param("level") Level level);
}`,
        ),
      ],
      [
        ['When is the Criteria API better than JPQL?', 'For dynamic queries with optional filters, where building JPQL by string concatenation is error-prone; Criteria (or Spring Data Specifications) composes predicates safely and type-checks them with the metamodel.'],
        ['What are the benefits of named queries?', 'They are validated and parsed at startup, reusable by name and keep queries separate from code; mistakes are caught at boot rather than at runtime.'],
        ['What is the JPA static metamodel?', 'Generated classes such as Course_ with typed attribute references (Course_.title) used in Criteria queries for compile-time safety instead of string attribute names.'],
      ],
    ),
    topic(
      'hb-pagination-joins-projections',
      'Pagination, Sorting, Aggregates, Joins, Subqueries, Projections and DTO Projections',
      [
        blk(`<h3>Pagination and sorting</h3>
• <b>Offset pagination</b>: <code>query.setFirstResult((page - 1) * size).setMaxResults(size)</code> adds <code>LIMIT/OFFSET</code> (or <code>FETCH FIRST</code>). <b>Always combine with a deterministic <code>order by</code></b> (including a unique tiebreaker such as the id) or pages overlap.<br>
• <b>Pagination with collection fetch joins is dangerous</b>: Hibernate cannot limit in SQL and logs <code>HHH000104: firstResult/maxResults specified with collection fetch; applying in memory</code> (loads everything!). Paginate the <b>root ids first</b>, then fetch children (see performance section) or use batch fetching.<br>
• <b>Keyset (seek) pagination</b> (<code>where (created_at, id) &lt; (:lastCreated, :lastId) order by created_at desc, id desc limit 20</code>) stays fast on deep pages; offset gets slower as the offset grows.`,
          `List<Course> page = em.createQuery("select c from Course c order by c.createdAt desc, c.id desc", Course.class)
    .setFirstResult(40)                // page 3 with size 20
    .setMaxResults(20)
    .getResultList();

// total count for the pager (separate query)
long total = em.createQuery("select count(c) from Course c", Long.class).getSingleResult();

// keyset pagination: fast for deep pages
List<Course> next = em.createQuery("""
        select c from Course c
        where c.createdAt < :lastCreated or (c.createdAt = :lastCreated and c.id < :lastId)
        order by c.createdAt desc, c.id desc""", Course.class)
    .setParameter("lastCreated", lastCreated).setParameter("lastId", lastId)
    .setMaxResults(20).getResultList();`,
        ),
      ],
      [
        blk(`<h3>Aggregates, joins and subqueries</h3>
• <b>Aggregate functions</b>: <code>count</code>, <code>sum</code>, <code>avg</code>, <code>min</code>, <code>max</code> with <code>group by</code> and <code>having</code>. <code>count(c)</code> returns <code>Long</code>; <code>sum</code>/<code>avg</code> return <code>Long/Double/BigDecimal</code> depending on the type (watch for <code>null</code> when there are no rows).<br>
• <b>Joins</b>: <code>join</code> (inner), <code>left join</code>, <code>join fetch</code> (also initialise the association), join on unrelated entities with <code>on</code> (Hibernate 5.1+/JPA 2.1). Alias everything; avoid cartesian products.<br>
• <b>Subqueries</b>: <code>where c.price &gt; (select avg(c2.price) from Course c2)</code>, <code>exists (...)</code>, <code>in (...)</code>. Prefer <code>exists</code> over <code>in</code> for correlated checks.`,
          `// group by / having
List<Object[]> rows = em.createQuery("""
        select c.category.name, count(c), avg(c.price)
        from Course c
        group by c.category.name
        having count(c) > 2
        order by count(c) desc""", Object[].class).getResultList();

// left join + on condition + aggregate (courses with zero enrolments included)
em.createQuery("""
        select c.title, count(e)
        from Course c left join c.enrollments e on e.status = :active
        group by c.title""", Object[].class).setParameter("active", Status.ACTIVE).getResultList();

// subqueries
em.createQuery("select c from Course c where c.price > (select avg(x.price) from Course x)", Course.class).getResultList();
em.createQuery("select s from Student s where exists (select 1 from Enrollment e where e.student = s and e.course.id = :cid)", Student.class)
  .setParameter("cid", 7L).getResultList();`,
        ),
      ],
      [
        blk(`<h3>Projections and DTO projections</h3>
• Loading full entities when you only need a few columns wastes memory and prevents the database from using covering indexes. A <b>projection</b> selects <b>only some fields</b>: scalar (<code>select c.id, c.title</code> → <code>Object[]</code>/<code>Tuple</code>), or a <b>DTO projection</b>.<br>
• <b>DTO projection</b> in JPQL: <code>select new com.app.CourseSummary(c.id, c.title, c.price) from Course c</code> (or with Java records in Hibernate 6 you can omit <code>new</code> using <code>Tuple</code>/<code>@Query</code> result mapping). <b>Spring Data interface projections</b> (<code>interface CourseView { Long getId(); String getTitle(); }</code>) and <b>class-based</b> projections generate the SELECT list automatically. DTOs are <b>read-only, not managed</b> (no dirty checking, no lazy loading): perfect for list/search screens and APIs.`,
          `public record CourseSummary(Long id, String title, BigDecimal price, long lessonCount) {}

List<CourseSummary> list = em.createQuery("""
        select new com.javaschoollab.dto.CourseSummary(c.id, c.title, c.price, count(l))
        from Course c left join c.lessons l
        group by c.id, c.title, c.price""", CourseSummary.class).getResultList();

// Spring Data interface projection: only id and title are selected
public interface CourseView { Long getId(); String getTitle(); }
interface CourseRepository extends JpaRepository<Course, Long> {
    List<CourseView> findByLevel(Level level);                         // select c.id, c.title from course c where c.level=?
    <T> List<T> findByLevel(Level level, Class<T> type);               // dynamic projection
}

// Hibernate 6 Tuple
List<Tuple> t = em.createQuery("select c.id as id, c.title as title from Course c", Tuple.class).getResultList();`,
        ),
      ],
      [
        ['Why must pagination queries have an ORDER BY?', 'Without a deterministic order the database may return rows in any order, so pages can repeat or skip rows. Add a unique tiebreaker such as the id.'],
        ['What is the problem with pagination and join fetch of a collection?', 'The SQL result has one row per child, so the database cannot apply LIMIT per parent; Hibernate warns HHH000104 and paginates in memory after loading everything. Paginate parent ids first, then fetch the children.'],
        ['Why use DTO projections?', 'They select only the needed columns, avoid managed entities (memory, dirty checking, lazy loading) and decouple the API from the entity model, which is ideal for read-only list and search screens.'],
      ],
    ),
  ]),
];
