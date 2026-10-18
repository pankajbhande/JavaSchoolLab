// Hibernate course extras (keyed by topic id).
import { x, r, type Extra } from '../mysql/extras/extra';
import { dv, type Deep } from '../mysql/extras/deep';

export const hibernateExtras: Record<string, Extra> = {
    'introductiontohibernate': x(
        ['Hibernate is an ORM (object-relational mapper): you work with Java objects and Hibernate generates the SQL and maps result rows back to objects.',
            'It removes most JDBC boilerplate (connections, statements, result sets) and makes the database portable through dialects.',
            'It is the most used implementation of JPA, the Java persistence standard.'],
        ['Hibernate tracks managed entities in a Session (persistence context) and writes changes at flush or commit (dirty checking).',
            'Mapping is declared with annotations (<code>@Entity</code>, <code>@Table</code>, <code>@Id</code>, <code>@Column</code>) or XML.',
            'It offers HQL/JPQL, Criteria API and native SQL for queries.'],
        ['An ORM does not remove the need to understand SQL: you must review generated SQL, indexes, fetch plans and transactions.',
            'Choose Hibernate for rich domain models and transactional CRUD; choose JDBC templates, jOOQ or MyBatis for reporting and SQL-heavy code.',
            'Hibernate adds memory (persistence context, caches) and complexity; keep sessions short and use projections for reads.'],
        [['F', 'What is Hibernate?', 'An ORM framework that maps Java classes to database tables and generates SQL for you.'],
            ['F', 'Why use Hibernate instead of JDBC?', 'Less boilerplate, automatic object mapping, caching, lazy loading and database independence.'],
            ['M', 'What is the difference between Hibernate and JPA?', 'JPA is the specification (interfaces and annotations); Hibernate is an implementation, with extra features of its own.'],
            ['M', 'What is dirty checking?', 'Hibernate compares managed entities with their loaded snapshot at flush time and issues UPDATE statements for changes, without an explicit save.'],
            ['S', 'When is Hibernate a poor choice?', 'For bulk operations, complex reporting and highly tuned SQL, where it adds overhead and hides the query; use native SQL or a SQL-first library there.'],
            ['S', 'How do you keep Hibernate performant?', 'Log and review SQL, prevent N+1, use fetch plans and projections, batch writes, keep transactions short and add indexes for generated queries.']],
        [['Map a simple entity and save it.',
            r`@Entity @Table(name = "employees")
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    private double salary;
    // getters and setters
}
Session s = sessionFactory.openSession();
Transaction tx = s.beginTransaction();
s.persist(new Employee("Abaji", 60000));
tx.commit();
s.close();

// OUTPUT: (SQL)
// insert into employees (name, salary) values (?, ?)`],
            ['Read it back and let dirty checking update it.',
                r`Session s = sessionFactory.openSession();
Transaction tx = s.beginTransaction();
Employee e = s.get(Employee.class, 1L);
e.setSalary(65000);          // no explicit update call
tx.commit();
s.close();

// OUTPUT: (SQL)
// select ... from employees where id=?
// update employees set name=?, salary=? where id=?`]],
        [['Compare JDBC and Hibernate for the same task.',
            r`// JDBC
PreparedStatement ps = c.prepareStatement("SELECT id, name, salary FROM employees WHERE id = ?");
ps.setLong(1, 1);
ResultSet rs = ps.executeQuery();
Employee e = rs.next() ? new Employee(rs.getLong(1), rs.getString(2), rs.getDouble(3)) : null;
// Hibernate
Employee e2 = session.get(Employee.class, 1L);

// OUTPUT:
// both return the same object; Hibernate removes the mapping code`],
            ['See the SQL Hibernate generates.',
                r`# hibernate.properties
hibernate.show_sql=true
hibernate.format_sql=true

// OUTPUT:
// Hibernate:
//     select e1_0.id, e1_0.name, e1_0.salary from employees e1_0 where e1_0.id=?`]]
    ),

    'hibernate-env-setup': x(
        ['You need the Hibernate dependency, a JDBC driver (for example MySQL Connector/J), a configuration (<code>hibernate.cfg.xml</code> or properties) and annotated entity classes.',
            'With Maven add <code>hibernate-core</code> and <code>mysql-connector-j</code>.',
            'Create a <code>SessionFactory</code> once per application and open a short-lived <code>Session</code> for each unit of work.'],
        ['Key settings: connection URL, user, password, dialect (optional in recent versions), <code>hbm2ddl.auto</code> (validate in production), <code>show_sql</code>, connection pool provider.',
            'Use a real pool (HikariCP) instead of the built-in one.',
            'Keep secrets out of the XML; read them from environment variables.'],
        ['In Spring Boot you do not build the SessionFactory yourself: <code>spring.datasource.*</code> and <code>spring.jpa.*</code> configure it.',
            'Never use <code>create</code> or <code>update</code> for <code>hbm2ddl.auto</code> in production; use Flyway or Liquibase.',
            'Pin versions of Hibernate and the driver and test upgrades; dialect and SQL generation change between versions.'],
        [['F', 'What do you need to start with Hibernate?', 'Hibernate dependency, JDBC driver, configuration file and entity classes.'],
            ['F', 'What is a SessionFactory?', 'A heavyweight, thread-safe factory created once that opens Session objects.'],
            ['M', 'What does hbm2ddl.auto=validate do?', 'It checks that the mapped entities match the schema at startup and fails if they do not, without changing the database.'],
            ['M', 'Why avoid the built-in connection pool?', 'It is not meant for production; use HikariCP or another production pool.'],
            ['S', 'How do you manage schema changes?', 'With migration tools (Flyway/Liquibase) in the pipeline, with hbm2ddl set to validate or none.'],
            ['S', 'How do you externalize configuration safely?', 'Read URL and credentials from environment variables or a secrets manager and build the properties at startup.']],
        [['Maven dependencies.',
            r`<dependency><groupId>org.hibernate.orm</groupId><artifactId>hibernate-core</artifactId><version>6.4.4.Final</version></dependency>
<dependency><groupId>com.mysql</groupId><artifactId>mysql-connector-j</artifactId><version>8.3.0</version></dependency>

// OUTPUT:
// mvn dependency:tree shows hibernate-core and mysql-connector-j on the classpath`],
            ['hibernate.cfg.xml.',
                r`<hibernate-configuration><session-factory>
  <property name="hibernate.connection.url">jdbc:mysql://localhost:3306/shop</property>
  <property name="hibernate.connection.username">shop_app</property>
  <property name="hibernate.hbm2ddl.auto">validate</property>
  <property name="hibernate.show_sql">true</property>
  <mapping class="com.shop.Employee"/>
</session-factory></hibernate-configuration>

// OUTPUT:
// SessionFactory created; schema validated`]],
        [['Build a SessionFactory in code.',
            r`SessionFactory sf = new Configuration().configure().buildSessionFactory();
try (Session s = sf.openSession()) {
    System.out.println(s.createNativeQuery("select 1").getSingleResult());
}

// OUTPUT:
// 1`],
            ['Programmatic properties (no XML).',
                r`Properties p = new Properties();
p.put("hibernate.connection.url", System.getenv("DB_URL"));
p.put("hibernate.connection.username", System.getenv("DB_USER"));
p.put("hibernate.connection.password", System.getenv("DB_PASS"));
SessionFactory sf = new Configuration().addProperties(p).addAnnotatedClass(Employee.class).buildSessionFactory();

// OUTPUT:
// configuration read from the environment, no secrets in source control`]]
    ),

    'hibernate-basics': x(
        ['An entity is a class mapped to a table. <code>@Entity</code> marks it, <code>@Id</code> marks the primary key, <code>@Column</code> customizes a column.',
            'Hibernate needs a no-argument constructor and non-final classes (for proxies).',
            'Entities move between states: transient (new), persistent (managed), detached and removed.'],
        ['ID generation: IDENTITY (database auto-increment), SEQUENCE (preferred where supported), UUID, assigned.',
            'Types map automatically: String to VARCHAR, LocalDate to DATE, enums with <code>@Enumerated(EnumType.STRING)</code>.',
            'Use <code>@Embeddable</code> value objects for groups of columns.'],
        ['Use immutable identity: implement equals/hashCode on a business key or id carefully, because proxies and detached instances compare differently.',
            'IDENTITY ids disable JDBC insert batching; SEQUENCE with allocation size enables it.',
            'Prefer <code>EnumType.STRING</code> and explicit column definitions so schema and code stay in sync.'],
        [['F', 'What is an entity?', 'A Java class mapped to a database table whose instances map to rows.'],
            ['F', 'Which annotations are essential?', '@Entity and @Id (and @Table/@Column to customize names).'],
            ['M', 'What are the entity lifecycle states?', 'Transient, persistent (managed), detached and removed.'],
            ['M', 'IDENTITY vs SEQUENCE?', 'IDENTITY relies on auto-increment and prevents insert batching; SEQUENCE fetches ids from a sequence and allows batching.'],
            ['S', 'What can go wrong with equals/hashCode on entities?', 'Using generated ids breaks Set behaviour before persist; use a business key or a stable id strategy and handle proxies.'],
            ['S', 'Why store enums as STRING?', 'ORDINAL breaks when constants are reordered; STRING is stable and readable.']],
        [['A fully annotated entity.',
            r`@Entity @Table(name = "products", indexes = @Index(name = "idx_sku", columnList = "sku", unique = true))
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE) private Long id;
    @Column(nullable = false, length = 30) private String sku;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Enumerated(EnumType.STRING) private Status status = Status.ACTIVE;
    @Embedded private Audit audit = new Audit();
}

// OUTPUT: (DDL)
// create table products (id bigint not null, sku varchar(30) not null, price decimal(10,2) not null, status varchar(255), ...)`],
            ['Entity states in action.',
                r`Product p = new Product();            // transient
session.persist(p);                     // persistent: gets an id, will be inserted at flush
session.detach(p);                      // detached: no longer tracked
Product m = session.merge(p);           // new managed copy
session.remove(m);                      // removed: DELETE at flush

// OUTPUT: (SQL)
// insert into products ...   delete from products where id=?`]],
        [['Embeddable value object.',
            r`@Embeddable public class Address {
    String city;
    String zip;
}
@Entity public class Customer {
    @Id Long id;
    @Embedded Address address;
}

// OUTPUT: (columns)
// customer(id, city, zip)`],
            ['equals/hashCode on a business key.',
                r`@Override public boolean equals(Object o) {
    return o instanceof Product p && Objects.equals(sku, p.sku);
}
@Override public int hashCode() { return Objects.hash(sku); }

// OUTPUT:
// two Product objects with the same sku are equal even before they get an id`]]
    ),

    'hibernate-crud-operations': x(
        ['Create: <code>persist()</code>; Read: <code>get()</code> or <code>find()</code>; Update: modify a managed entity (or <code>merge()</code>); Delete: <code>remove()</code>.',
            'All of them run inside a transaction; Hibernate sends SQL at flush or commit.',
            '<code>get()</code> returns null when missing; <code>load()</code>/<code>getReference()</code> returns a lazy proxy.'],
        ['Update by modifying a managed object; no save call is needed. Detached objects need <code>merge()</code>.',
            'Use <code>flush()</code> to force SQL earlier and <code>clear()</code> to empty the persistence context in batch jobs.',
            'Bulk HQL <code>update</code>/<code>delete</code> bypass the persistence context; refresh or clear afterwards.'],
        ['Batch inserts need <code>hibernate.jdbc.batch_size</code>, ordered inserts and a SEQUENCE generator, and periodic flush/clear.',
            'Optimistic locking with <code>@Version</code> prevents lost updates; handle <code>OptimisticLockException</code>.',
            'Soft delete (<code>@SQLDelete</code>, <code>@Where</code>/<code>@SQLRestriction</code>) preserves history but complicates unique constraints and queries.'],
        [['F', 'How do you insert a record?', '<code>session.persist(entity)</code> inside a transaction.'],
            ['F', 'How do you delete a record?', 'Load it and call <code>session.remove(entity)</code>.'],
            ['M', 'get() vs load()?', 'get() hits the database immediately and returns null if missing; load()/getReference() returns a proxy and throws if the row is missing when accessed.'],
            ['M', 'persist() vs merge()?', 'persist makes a new instance managed; merge copies state of a detached instance onto a managed one and returns it.'],
            ['S', 'How do you insert a million rows efficiently?', 'Enable JDBC batching with a SEQUENCE id, ordered inserts, and flush/clear every few hundred entities (or use StatelessSession).'],
            ['S', 'How do you prevent lost updates?', 'Add a @Version column (optimistic locking) or use pessimistic locks for hot rows.']],
        [['Full CRUD cycle.',
            r`Employee e = new Employee("Abaji", 60000);
session.persist(e);                          // create
Employee found = session.get(Employee.class, e.getId());   // read
found.setSalary(65000);                      // update (dirty checking)
session.remove(found);                       // delete
tx.commit();

// OUTPUT: (SQL at commit)
// insert into employees ...   update employees set ...   delete from employees where id=?`],
            ['Optimistic locking.',
                r`@Entity class Doc {
    @Id Long id;
    String body;
    @Version int version;
}
Doc d = session.get(Doc.class, 1L);
d.setBody("new text");
tx.commit();

// OUTPUT: (SQL)
// update doc set body=?, version=? where id=? and version=?     (0 rows updated => OptimisticLockException)`]],
        [['Batch insert with flush and clear.',
            r`for (int i = 0; i < 100_000; i++) {
    session.persist(new Event("click", i));
    if (i % 500 == 0) {
        session.flush();
        session.clear();
    }
}

// OUTPUT:
// 100,000 inserts in 200 JDBC batches, constant memory`],
            ['Bulk update and refresh.',
                r`int n = session.createMutationQuery("update Product p set p.price = p.price * 1.1 where p.category = :c").setParameter("c", "TOY").executeUpdate();
session.clear();           // entities in the context are now stale

// OUTPUT:
// n = 412 rows updated`]]
    ),

    'hibernate-querying': x(
        ['HQL (JPQL) queries entities, not tables: <code>select e from Employee e where e.salary &gt; :min</code>.',
            'Use named parameters (<code>:min</code>) to avoid SQL injection.',
            'Other options: Criteria API (type-safe, dynamic) and native SQL.'],
        ['Result shapes: entities, scalars, DTO projections (<code>select new ...</code>), tuples.',
            'Pagination uses <code>setFirstResult</code> and <code>setMaxResults</code>; joins use <code>join</code> or <code>join fetch</code>.',
            'Named queries are validated at startup and reusable.'],
        ['<code>join fetch</code> with a collection and pagination makes Hibernate paginate in memory (warning HHH000104); fetch ids first, then the graph.',
            'Prefer DTO projections for read APIs; they avoid loading entities and lazy associations.',
            'Dynamic filters: use Criteria API or Specifications, never string concatenation.'],
        [['F', 'What is HQL?', 'Hibernate Query Language: an object-oriented query language over entities and their properties.'],
            ['F', 'How do you pass parameters safely?', 'Named or positional parameters, never string concatenation.'],
            ['M', 'Criteria API vs HQL?', 'Criteria builds queries programmatically and type-safely (good for dynamic filters); HQL is compact and readable for static queries.'],
            ['M', 'What is a DTO projection?', 'A query that returns only selected columns into a lightweight object, avoiding entity loading.'],
            ['S', 'Why does join fetch with pagination warn?', 'Fetching a collection multiplies rows, so Hibernate cannot apply LIMIT in SQL and paginates in memory; use two queries or batch fetching.'],
            ['S', 'How do you handle dynamic search filters?', 'Criteria API or JPA Specifications that add predicates only for provided filters, always with bound parameters.']],
        [['HQL with parameters and paging.',
            r`List<Employee> list = session.createQuery("select e from Employee e where e.salary > :min order by e.salary desc", Employee.class)
    .setParameter("min", 50000.0).setFirstResult(0).setMaxResults(20).getResultList();

// OUTPUT: (SQL)
// select ... from employees e where e.salary>? order by e.salary desc limit ?`],
            ['DTO projection.',
                r`record EmployeeRow(Long id, String name) {}
List<EmployeeRow> rows = session.createQuery("select new com.shop.EmployeeRow(e.id, e.name) from Employee e where e.dept.name = :d", EmployeeRow.class).setParameter("d", "HR").getResultList();

// OUTPUT: (SQL)
// select e.id, e.name from employees e join departments d on d.id=e.dept_id where d.name=?`]],
        [['Criteria API with optional filters.',
            r`CriteriaBuilder cb = session.getCriteriaBuilder();
CriteriaQuery<Employee> cq = cb.createQuery(Employee.class);
Root<Employee> root = cq.from(Employee.class);
List<Predicate> ps = new ArrayList<>();
if (minSalary != null) ps.add(cb.ge(root.get("salary"), minSalary));
if (name != null) ps.add(cb.like(cb.lower(root.get("name")), name.toLowerCase() + "%"));
cq.select(root).where(ps.toArray(new Predicate[0]));
List<Employee> result = session.createQuery(cq).getResultList();

// OUTPUT: (SQL)
// select ... from employees e where e.salary>=? and lower(e.name) like ?`],
            ['Named query and native SQL.',
                r`@NamedQuery(name = "Employee.byDept", query = "select e from Employee e where e.dept.id = :d")
List<Employee> byDept = session.createNamedQuery("Employee.byDept", Employee.class).setParameter("d", 10L).getResultList();
List<Object[]> stats = session.createNativeQuery("select dept_id, count(*) from employees group by dept_id").getResultList();

// OUTPUT:
// [10, 2] [20, 1]`]]
    ),

    'hibernate-associations-expanded': x(
        ['Associations map relationships: <code>@OneToOne</code>, <code>@OneToMany</code>/<code>@ManyToOne</code>, <code>@ManyToMany</code>.',
            'The owning side holds the foreign key (<code>@JoinColumn</code>); the other side uses <code>mappedBy</code>.',
            'Cascade types propagate persist/remove from parent to children.'],
        ['Always map the many side as the owner: <code>@ManyToOne</code> with <code>@JoinColumn</code>, and mark collections <code>mappedBy</code>.',
            'Fetch types: LAZY is the safe default; set <code>fetch = LAZY</code> on <code>@ManyToOne</code> too (its default is EAGER).',
            'Keep both sides in sync with helper methods (<code>addItem</code>/<code>removeItem</code>).'],
        ['Many-to-many with extra columns needs an association entity, not <code>@ManyToMany</code>.',
            'Unidirectional <code>@OneToMany</code> without mappedBy generates extra join tables and statements; prefer bidirectional or <code>@JoinColumn</code>.',
            'Use <code>orphanRemoval = true</code> for owned children, and avoid cascade REMOVE on shared entities.'],
        [['F', 'Which side owns the relationship?', 'The side with the foreign key column (the @ManyToOne side in one-to-many).'],
            ['F', 'What does mappedBy mean?', 'It marks the inverse side and names the owning field on the other entity.'],
            ['M', 'What is the default fetch type of @ManyToOne?', 'EAGER; you usually override it with LAZY.'],
            ['M', 'What does orphanRemoval do?', 'Deletes child rows that are removed from the parent collection.'],
            ['S', 'Why model a join table with its own entity?', 'To hold extra columns (quantity, date) and gain full control, which @ManyToMany cannot do.'],
            ['S', 'Why is unidirectional @OneToMany inefficient?', 'Hibernate may use a join table or issue extra UPDATEs to set the foreign key after inserting children.']],
        [['Bidirectional one-to-many with helper methods.',
            r`@Entity class Order {
    @Id @GeneratedValue Long id;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true) List<Item> items = new ArrayList<>();
    void addItem(Item i) {
        items.add(i);
        i.setOrder(this);
    }
    void removeItem(Item i) {
        items.remove(i);
        i.setOrder(null);
    }
}
@Entity class Item {
    @Id @GeneratedValue Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id") Order order;
    int qty;
}

// OUTPUT: (DDL)
// item(id, qty, order_id) with a foreign key to orders(id)`],
            ['Many-to-many through an association entity.',
                r`@Entity class Enrolment {
    @EmbeddedId EnrolmentId id;
    @ManyToOne @MapsId("studentId") Student student;
    @ManyToOne @MapsId("courseId") Course course;
    LocalDate enrolledOn;
    int grade;
}

// OUTPUT: (table)
// enrolment(student_id, course_id, enrolled_on, grade)  primary key (student_id, course_id)`]],
        [['Cascade persist.',
            r`Order o = new Order();
o.addItem(new Item(2));
o.addItem(new Item(1));
session.persist(o);          // inserts the order and both items

// OUTPUT: (SQL)
// insert into orders ...   insert into item (order_id, qty) values (?, ?) (x2)`],
            ['orphanRemoval.',
                r`Order o = session.get(Order.class, 1L);
o.removeItem(o.getItems().get(0));
tx.commit();

// OUTPUT: (SQL)
// delete from item where id=?`]]
    ),

    'hibernate-advanced-concepts': x(
        ['Advanced topics: caching (first-level and second-level), lazy loading and the N+1 problem, locking, batch processing and inheritance mapping.',
            'The first-level cache is the Session; the second-level cache is shared across sessions (Ehcache, Caffeine).',
            'Lazy loading fetches data when first accessed, which fails after the session closes.'],
        ['Fix N+1 with <code>join fetch</code>, <code>@EntityGraph</code>, <code>@BatchSize</code> or <code>default_batch_fetch_size</code>.',
            'Inheritance strategies: SINGLE_TABLE (fast, nullable columns), JOINED (normalized, joins), TABLE_PER_CLASS (rarely).',
            'Locking: optimistic (<code>@Version</code>) and pessimistic (<code>LockModeType.PESSIMISTIC_WRITE</code>).'],
        ['Second-level cache helps read-mostly reference data; it adds invalidation complexity and must be sized and monitored.',
            'Enable statistics to measure queries, cache hits and entity loads per request.',
            'Use StatelessSession or JDBC for very large batch operations; the persistence context is too heavy.'],
        [['F', 'What is the N+1 problem?', 'One query for a list plus one query per element to load a relation.'],
            ['F', 'What are Hibernate cache levels?', 'First-level (per Session, always on) and second-level (shared, optional).'],
            ['M', 'How do you fix N+1?', 'Fetch join, entity graph, batch fetching, or a DTO projection that joins in SQL.'],
            ['M', 'SINGLE_TABLE vs JOINED inheritance?', 'SINGLE_TABLE stores all subclasses in one table (fast, nullable columns); JOINED uses a table per class with joins (normalized).'],
            ['S', 'When use the second-level cache?', 'For read-mostly, rarely changing data with high read volume, and only after measuring; it needs a cache-aware design and eviction.'],
            ['S', 'How do you diagnose lazy loading problems?', 'Enable statistics and SQL logging, check queries per request, and use tests that assert statement counts.']],
        [['Fix N+1 with a fetch join and batch size.',
            r`List<Order> orders = session.createQuery("select distinct o from Order o join fetch o.customer", Order.class).getResultList();
// collections: batch fetching
@OneToMany(mappedBy = "order") @BatchSize(size = 50) List<Item> items;

// OUTPUT: (SQL)
// select o.*, c.* from orders o join customers c on c.id = o.customer_id
// select ... from item where order_id in (?, ?, ..., ?)`],
            ['Pessimistic lock.',
                r`Account a = session.createQuery("select a from Account a where a.id = :id", Account.class)
    .setParameter("id", 1L).setLockMode(LockModeType.PESSIMISTIC_WRITE).getSingleResult();
a.debit(100);

// OUTPUT: (SQL)
// select ... from accounts where id=? for update`]],
        [['Statistics for query counts.',
            r`hibernate.generate_statistics=true
Statistics st = sessionFactory.getStatistics();
System.out.println(st.getPrepareStatementCount() + " statements, " + st.getSecondLevelCacheHitCount() + " L2 hits");

// OUTPUT:
// 101 statements, 0 L2 hits      (a sign of N+1)`],
            ['Single-table inheritance.',
                r`@Entity @Inheritance(strategy = InheritanceType.SINGLE_TABLE) @DiscriminatorColumn(name = "type")
abstract class Payment {
    @Id @GeneratedValue Long id;
    BigDecimal amount;
}
@Entity @DiscriminatorValue("CARD") class CardPayment extends Payment { String last4; }

// OUTPUT: (table)
// payment(id, amount, type, last4)`]]
    ),

    'hibernate-with-jpa': x(
        ['JPA is the standard API: <code>EntityManager</code>, <code>@Entity</code>, JPQL. Hibernate implements it, so you can write standard JPA code and run it on Hibernate.',
            'Configuration lives in <code>persistence.xml</code> or, in Spring Boot, in application properties.',
            'Spring Data JPA adds repositories on top: interfaces generate queries and implementations.'],
        ['<code>EntityManager</code> is the JPA equivalent of Session; <code>EntityManagerFactory</code> of SessionFactory.',
            'Spring Data repositories: <code>JpaRepository&lt;T, ID&gt;</code>, derived query methods, <code>@Query</code>, paging and sorting, specifications.',
            'Transactions are declared with <code>@Transactional</code> on service methods.'],
        ['Code to the JPA API for portability but use Hibernate features (batch fetching, <code>@NaturalId</code>) deliberately when needed.',
            'Understand the proxy-based transaction model: self-invocation and non-public methods bypass <code>@Transactional</code>.',
            'Review the SQL of every repository method; derived names can hide expensive queries.'],
        [['F', 'What is JPA?', 'The Java Persistence API: a standard for object-relational mapping, implemented by Hibernate and others.'],
            ['F', 'What is Spring Data JPA?', 'A Spring module that generates repository implementations from interfaces.'],
            ['M', 'EntityManager vs Session?', 'EntityManager is the JPA interface; Session is the native Hibernate API (an EntityManager can be unwrapped to Session).'],
            ['M', 'Why might @Transactional not work?', 'Self-invocation, non-public methods, caught exceptions, or the bean not being proxied.'],
            ['S', 'How do you write dynamic queries with Spring Data?', 'Specifications or Querydsl; combine predicates only for provided filters.'],
            ['S', 'How do you avoid exposing entities from APIs?', 'Use DTOs and projections; map in the service layer to decouple the API from the schema.']],
        [['Spring Data JPA repository.',
            r`public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByDeptNameOrderBySalaryDesc(String dept);
    @Query("select e from Employee e where e.salary > :min") Page<Employee> rich(@Param("min") double min, Pageable p);
}
Page<Employee> page = repo.rich(50000, PageRequest.of(0, 20));

// OUTPUT: (SQL)
// select ... from employees e where e.salary>? limit ?   +   select count(e.id) ...`],
            ['EntityManager basics.',
                r`EntityManagerFactory emf = Persistence.createEntityManagerFactory("shop");
EntityManager em = emf.createEntityManager();
em.getTransaction().begin();
em.persist(new Employee("Abaji", 60000));
em.getTransaction().commit();
em.close();

// OUTPUT: (SQL)
// insert into employees (name, salary) values (?, ?)`]],
        [['Service with a transaction.',
            r`@Service class PayrollService {
    @Transactional public void raise(Long id, double pct) {
        Employee e = repo.findById(id).orElseThrow();
        e.setSalary(e.getSalary() * (1 + pct / 100));
    }
}

// OUTPUT: (SQL)
// select ... where id=?    update employees set salary=? where id=?`],
            ['Projection interface.',
                r`interface EmployeeSummary {
    Long getId();
    String getName();
}
List<EmployeeSummary> findByDeptName(String name);

// OUTPUT: (SQL)
// select e.id, e.name from employees e join departments d on d.id=e.dept_id where d.name=?`]]
    ),

    'hibernate-best-practices': x(
        ['Keep transactions short, use lazy associations, fetch what a use case needs, and use DTOs for reads.',
            'Always review generated SQL and add indexes for your queries.',
            'Never use <code>hbm2ddl.auto=update</code> in production; use migrations.'],
        ['Use <code>@Version</code> for concurrency, SEQUENCE ids with batching, and <code>EnumType.STRING</code>.',
            'Avoid bidirectional relations unless needed, and keep them in sync with helper methods.',
            'Do not expose entities in REST APIs; map to DTOs.'],
        ['Add query-count assertions to integration tests and enable statistics in staging.',
            'Pool connections with HikariCP sized for the database and monitor pool wait time.',
            'Use read-only transactions for queries, and move heavy analytics to SQL or a read model.'],
        [['F', 'Name two Hibernate best practices.', 'Use lazy loading by default and keep transactions short.'],
            ['F', 'Why use DTOs?', 'To avoid exposing entities and to select only needed data.'],
            ['M', 'Why not use hbm2ddl.auto=update in production?', 'It changes the schema unpredictably and cannot be reviewed or rolled back; use Flyway or Liquibase.'],
            ['M', 'How do you detect N+1 in tests?', 'Assert the number of executed statements with Hibernate statistics or a datasource proxy.'],
            ['S', 'How do you size the connection pool?', 'Start small (cores x 2), measure throughput and latency, and keep the sum across instances under max_connections.'],
            ['S', 'How do you tune a slow Hibernate endpoint?', 'Log SQL and statistics, fix fetch plans, add indexes, use projections or native SQL, and measure again.']],
        [['Query-count assertion with statistics.',
            r`@Test void listOrdersUsesTwoQueries() {
    Statistics st = sessionFactory.getStatistics();
    st.clear();
    service.listOrders();
    assertEquals(2, st.getPrepareStatementCount());
}

// OUTPUT:
// test passes; fails with "expected 2 but was 101" if N+1 returns`],
            ['Production properties.',
                r`spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
spring.jpa.properties.hibernate.jdbc.batch_size=500
spring.jpa.properties.hibernate.order_inserts=true
spring.datasource.hikari.maximum-pool-size=10

// OUTPUT:
// schema validated at startup, batched writes, bounded pool`]],
        [['Read-only service method with a projection.',
            r`@Transactional(readOnly = true)
public List<OrderRow> recent(Long customerId) {
    return repo.recentRows(customerId, PageRequest.of(0, 20));
}

// OUTPUT: (SQL)
// select o.id, o.total from orders o where o.customer_id=? order by o.id desc limit ?`],
            ['Index for a generated query.',
                r`-- repository: findByCustomerIdAndStatusOrderByCreatedAtDesc
ALTER TABLE orders ADD INDEX idx_cust_status_created (customer_id, status, created_at);

-- OUTPUT:
-- Query OK, 0 rows affected`]]
    ),

    'hibernate-architecture': x(
        ['Main parts: Configuration, SessionFactory, Session, Transaction, Query, and the persistence context.',
            'SessionFactory is created once; Session is short-lived and not thread-safe.',
            'Hibernate sits between your code and JDBC, translating objects to SQL.'],
        ['Flow: the application calls Session methods; Hibernate keeps entities in the persistence context; at flush it generates SQL via the dialect; JDBC executes it over a pooled connection.',
            'Caches: first-level (Session) and optional second-level and query caches.',
            'Interceptors and event listeners allow hooks (auditing, multi-tenancy).'],
        ['Understand flush modes (AUTO flushes before queries that might be affected) and why unexpected SQL appears before a query.',
            'Multi-tenancy (schema or discriminator) and filters are supported through resolvers and <code>@Filter</code>.',
            'Know the bootstrap process (metadata, integrators, JDBC services) when debugging startup or custom integrations.'],
        [['F', 'What are the main Hibernate interfaces?', 'SessionFactory, Session, Transaction and Query.'],
            ['F', 'Is Session thread-safe?', 'No; use one Session per unit of work or thread.'],
            ['M', 'What is the persistence context?', 'The set of managed entities held by a Session; it provides identity, caching and dirty checking.'],
            ['M', 'When does Hibernate flush?', 'At commit, before queries that may be affected (AUTO), or when flush() is called.'],
            ['S', 'How does dialect affect SQL?', 'The dialect generates database-specific SQL for pagination, types, functions and locking.'],
            ['S', 'How would you audit changes?', 'With Envers, entity listeners or interceptors, or database triggers/CDC depending on requirements.']],
        [['Session per unit of work.',
            r`try (Session session = sessionFactory.openSession()) {
    Transaction tx = session.beginTransaction();
    try {
        service.work(session);
        tx.commit();
    }
    catch (RuntimeException e) {
        tx.rollback();
        throw e;
    }
}

// OUTPUT:
// work committed, or rolled back on failure; the Session always closes`],
            ['Flush behaviour.',
                r`Employee e = session.get(Employee.class, 1L);
e.setSalary(70000);
List<Employee> rich = session.createQuery("select e from Employee e where e.salary > 65000", Employee.class).getResultList();   // flushes the update first

// OUTPUT: (SQL order)
// update employees set salary=? where id=?
// select ... from employees where salary>?`]],
        [['Entity listener for auditing.',
            r`@EntityListeners(AuditingEntityListener.class)
@MappedSuperclass abstract class Auditable {
    @CreatedDate Instant createdAt;
    @LastModifiedDate Instant updatedAt;
}

// OUTPUT:
// createdAt and updatedAt are filled automatically on insert and update`],
            ['Second-level cache config.',
                r`hibernate.cache.use_second_level_cache=true
hibernate.cache.region.factory_class=jcache
@Entity @Cacheable @Cache(usage = CacheConcurrencyStrategy.READ_WRITE) class Country {
    @Id String code;
    String name;
}

// OUTPUT:
// Country reads served from the shared cache after the first load`]]
    )
};

export const hibernateDeep: Record<string, Deep> = {
    'introductiontohibernate': dv(
        [`When you persist an entity, Hibernate does not run SQL immediately. It places the object in the persistence context and records an action (insert, update, delete) in an action queue. At flush time (commit, or before a query that could be affected) it orders and executes the queued actions through JDBC. Dirty checking compares each managed entity with the snapshot taken when it was loaded.`,
            r`Session session = sessionFactory.openSession();
Transaction tx = session.beginTransaction();
Employee e = new Employee("Abaji", 60000);
session.persist(e);                       // queued, SQL not yet sent (SEQUENCE ids)
System.out.println("persisted, id = " + e.getId());
tx.commit();                              // flush: insert is executed now

// OUTPUT:
// persisted, id = 1
// Hibernate: insert into employees (name, salary, id) values (?, ?, ?)`],
        [`You can use Hibernate through the native Session API or through JPA's EntityManager. Native API gives extra features (StatelessSession, natural ids, filters); JPA gives portability. Queries can be HQL, Criteria, native SQL or named queries.`,
            r`// native Hibernate
Employee e1 = session.get(Employee.class, 1L);
// JPA style
Employee e2 = entityManager.find(Employee.class, 1L);
// get the Session from an EntityManager
Session s = entityManager.unwrap(Session.class);
// natural id lookup (Hibernate only)
Employee e3 = session.bySimpleNaturalId(Employee.class).load("E-1001");

// OUTPUT:
// three ways to load the same row, each with its own trade-offs`],
        [`Common beginner mistakes: using an entity outside the session (LazyInitializationException), forgetting transactions (no flush), sharing a Session between threads, and assuming save() writes immediately. Keep the Session scope clear.`,
            r`Employee e = session.get(Employee.class, 1L);
session.close();
e.getDepartment().getName();            // department is lazy and the session is closed

// OUTPUT:
// org.hibernate.LazyInitializationException: could not initialize proxy [com.shop.Department#10] - no Session

// fix: fetch the data inside the transaction (join fetch / DTO) or return a DTO from the service`],
        [`The cost of an ORM is mostly extra SQL and memory: N+1 queries, loading entire object graphs, and large persistence contexts. Measure statements and entities loaded per request with Hibernate statistics.`,
            r`Statistics stats = sessionFactory.getStatistics();
stats.clear();
service.loadDashboard();
System.out.printf("%d statements, %d entities loaded%n", stats.getPrepareStatementCount(), stats.getEntityLoadCount());

// OUTPUT:
// 214 statements, 1840 entities loaded        (investigate: fetch plans and projections)`],
        [`Real-world: a service layer owns the transaction, uses repositories for persistence and returns DTOs, so Hibernate stays an implementation detail behind the service.`,
            r`@Service
public class EmployeeService {
    private final EmployeeRepository repo;
    @Transactional(readOnly = true)
    public EmployeeDto get(Long id) { return repo.findById(id).map(EmployeeDto::from).orElseThrow(); }
    @Transactional
    public void raise(Long id, double pct) {
        Employee e = repo.findById(id).orElseThrow();
        e.raise(pct);
    }
}

// OUTPUT: (SQL)
// select ... where id=?        update employees set salary=? where id=?`]
    ),

    'hibernate-env-setup': dv(
        [`Bootstrapping builds a ServiceRegistry (connection provider, dialect, transaction coordinator), reads mapping metadata from annotated classes, validates it and creates the SessionFactory, which is immutable and thread-safe. This work is expensive, so it is done once at startup.`,
            r`StandardServiceRegistry registry = new StandardServiceRegistryBuilder().configure().build();
Metadata metadata = new MetadataSources(registry).addAnnotatedClass(Employee.class).buildMetadata();
SessionFactory sf = metadata.buildSessionFactory();
try (Session s = sf.openSession()) {
    s.createNativeQuery("select version()", String.class).getSingleResult();
}

// OUTPUT:
// HHH000412: Hibernate ORM core version 6.4.4.Final
// 8.0.36`],
        [`Configuration sources: <code>hibernate.cfg.xml</code>, <code>hibernate.properties</code>, programmatic <code>Configuration</code>, <code>persistence.xml</code> (JPA) and Spring Boot properties. Settings for pooling (HikariCP), second-level cache, batching and naming strategies are all properties.`,
            r`hibernate.connection.provider_class=org.hibernate.hikaricp.internal.HikariCPConnectionProvider
hibernate.hikari.maximumPoolSize=10
hibernate.hikari.connectionTimeout=3000
hibernate.jdbc.batch_size=500
hibernate.order_inserts=true
hibernate.physical_naming_strategy=org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy

// OUTPUT:
// HikariPool-1 - Start completed.`],
        [`Setup mistakes: missing driver on the classpath (No suitable driver), wrong dialect for the database version, ddl-auto=update in production, credentials in the repository, and creating a SessionFactory per request (very slow). Create it once.`,
            r`// bad: a new SessionFactory per request
public Employee find(Long id) {
    try (SessionFactory sf = new Configuration().configure().buildSessionFactory(); Session s = sf.openSession()) {
        return s.get(Employee.class, id);
    }
}

// good: shared singleton
public class HibernateUtil {
    private static final SessionFactory SF = new Configuration().configure().buildSessionFactory();
    public static SessionFactory get() { return SF; }
}

// OUTPUT:
// bad: 800 ms per call (bootstrap each time)   good: 3 ms per call`],
        [`Startup time and memory grow with entity count; validation and metadata building can take seconds. Use ddl-auto=validate only if you accept the cost, and prefer migration tooling in CI to catch mismatches.`,
            r`logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.orm.jdbc.bind=TRACE
spring.jpa.hibernate.ddl-auto=validate

// OUTPUT:
// Started Application in 6.2 seconds (JVM running for 6.9)`],
        [`Real-world: environment-specific configuration. The same code runs in dev, test and production with different property files or environment variables, and tests use a real MySQL container.`,
            r`@Testcontainers
class RepositoryIT {
    @Container static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0");
    @DynamicPropertySource static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", mysql::getJdbcUrl);
        r.add("spring.datasource.username", mysql::getUsername);
        r.add("spring.datasource.password", mysql::getPassword);
    }
}

// OUTPUT:
// tests run against a disposable MySQL 8.0 started by Docker`]
    ),

    'hibernate-basics': dv(
        [`An entity is identified by its primary key inside a persistence context: loading the same id twice in one Session returns the same Java object (identity map). Hibernate builds an entity metadata model from annotations: table, columns, id generator, relations. The generator decides how ids are assigned and whether inserts can be batched.`,
            r`Employee a = session.get(Employee.class, 1L);
Employee b = session.get(Employee.class, 1L);
System.out.println(a == b);                  // same object: identity map
System.out.println(session.contains(a));

// OUTPUT:
// true
// true        (only one SELECT was executed)`],
        [`Mapping options: <code>@Table</code> (indexes, unique constraints), <code>@Column</code> (length, nullable, precision), <code>@Enumerated</code>, <code>@Lob</code>, <code>@Temporal</code>/java.time, <code>@Embedded</code>, <code>@Transient</code> (not persisted), <code>@Formula</code>, converters (<code>AttributeConverter</code>).`,
            r`@Entity @Table(name = "employees", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
class Employee {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "emp_seq") @SequenceGenerator(name = "emp_seq", sequenceName = "emp_seq", allocationSize = 50) Long id;
    @Column(nullable = false, length = 120) String email;
    @Enumerated(EnumType.STRING) Role role;
    @Transient String displayName;
    @Convert(converter = JsonMapConverter.class) Map<String, String> attributes;
    @Formula("(select count(*) from orders o where o.emp_id = id)") int orderCount;
}

// OUTPUT: (DDL)
// create table employees (id bigint not null, email varchar(120) not null, role varchar(255), attributes varchar(255), primary key (id))`],
        [`Mistakes: missing no-arg constructor, final entity classes (no proxies), IDENTITY generation with batching expectations, ORDINAL enums, and equals/hashCode on a generated id. Each has a concrete symptom.`,
            r`@Entity final class Account { ... }                      // final: lazy proxies impossible
@Enumerated(EnumType.ORDINAL) Status status;                // reordering the enum corrupts data
@Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;   // each insert executes immediately: no batching

// OUTPUT:
// HHH000305: Could not create proxy factory for: com.shop.Account  (final class)`],
        [`Pick SEQUENCE ids with an allocation size so Hibernate can pre-allocate ids and batch inserts; IDENTITY forces one round trip per insert. Compare timings for 50,000 inserts.`,
            r`// IDENTITY:  50,000 inserts ~ 31 s  (one statement and generated key per row)
// SEQUENCE(50) + batch_size=500 ~ 2.6 s
System.out.println(31.0 / 2.6);

// OUTPUT:
// 11.923076923076923`],
        [`Real-world: audit columns shared by all entities with a mapped superclass, so every table gets created/updated timestamps and a version without repeating code.`,
            r`@MappedSuperclass @EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.SEQUENCE) Long id;
    @Version int version;
    @CreatedDate @Column(updatable = false) Instant createdAt;
    @LastModifiedDate Instant updatedAt;
}
@Entity class Product extends BaseEntity { String sku; }

// OUTPUT: (DDL)
// product(id, version, created_at, updated_at, sku)`]
    ),

    'hibernate-crud-operations': dv(
        [`Hibernate defers writes. persist() and remove() enqueue actions; changes to managed entities are detected at flush by dirty checking; the flush order is inserts, updates, collection changes, deletes. A transaction commit triggers a flush and then the JDBC commit. Because of this, SQL appears at commit time, not at the call.`,
            r`tx.begin();
Employee e = new Employee("Abaji", 60000);
session.persist(e);
e.setSalary(65000);                         // changed before flush: still a single INSERT
System.out.println("before commit");
tx.commit();

// OUTPUT:
// before commit
// Hibernate: insert into employees (name, salary, id) values (?, ?, ?)    (one insert with salary 65000)`],
        [`Variants: <code>persist/merge/remove/refresh/detach</code>, <code>getReference</code> for a lazy proxy, <code>StatelessSession</code> for bulk work, bulk HQL <code>update</code>/<code>delete</code>, and <code>@DynamicUpdate</code> to update only changed columns.`,
            r`Employee ref = session.getReference(Employee.class, 5L);         // proxy, no SELECT
Department d = session.getReference(Department.class, 10L);
employee.setDepartment(d);                                           // set a FK without loading the department
try (StatelessSession ss = sessionFactory.openStatelessSession()) {
    ss.beginTransaction();
    for (Event ev : events) ss.insert(ev);                            // no persistence context, no dirty checking
    ss.getTransaction().commit();
}

// OUTPUT: (SQL)
// update employees set department_id=? where id=?`],
        [`Mistakes: merge() on entities that are already managed, loading an entity just to delete it when a bulk delete or reference suffices, forgetting that bulk HQL bypasses cascades and the persistence context, and swallowing OptimisticLockException.`,
            r`session.createMutationQuery("delete from Event e where e.createdAt < :d").setParameter("d", cutoff).executeUpdate();   // no cascades, no entity events
session.clear();                                                                                     // stale entities removed from the context

try { tx.commit(); } catch (OptimisticLockException ex) { /* reload and retry or tell the user */ }

// OUTPUT:
// 48,000 rows deleted in one statement`],
        [`For large writes, batch and bound the persistence context. Check that the batch is real by looking at statement counts, not code that looks batched.`,
            r`hibernate.jdbc.batch_size=500
hibernate.order_inserts=true
hibernate.order_updates=true
hibernate.generate_statistics=true
System.out.println(sessionFactory.getStatistics().getEntityInsertCount() + " entities, " + sessionFactory.getStatistics().getPrepareStatementCount() + " statements");

// OUTPUT:
// 100000 entities, 200 statements        (batched; JDBC batch rewrite sends 500 rows per statement)`],
        [`Real-world: a safe update screen. The form posts the version it was loaded with; the service uses it for an optimistic check and returns a conflict when someone else saved first.`,
            r`@Transactional
public void update(Long id, int expectedVersion, String body) {
    Doc d = repo.findById(id).orElseThrow();
    if (d.getVersion() != expectedVersion) throw new ConflictException("Someone else changed this document");
    d.setBody(body);
}

// OUTPUT: (SQL)
// update doc set body=?, version=? where id=? and version=?`]
    ),

    'hibernate-querying': dv(
        [`HQL is parsed into an abstract syntax tree, translated to SQL through the dialect and executed with bound parameters. Entity names and property paths are resolved against the mapping, joins follow associations, and results are hydrated into entities (registered in the persistence context) or returned as scalars/DTOs.`,
            r`List<Object[]> rows = session.createQuery("select d.name, count(e), avg(e.salary) from Department d join d.employees e group by d.name having count(e) > :n", Object[].class).setParameter("n", 1L).getResultList();
rows.forEach(r -> System.out.println(r[0] + " " + r[1] + " " + r[2]));

// OUTPUT: (SQL)
// select d.name, count(e.id), avg(e.salary) from departments d join employees e on e.dept_id=d.id group by d.name having count(e.id)>?
// HR 2 52500.0`],
        [`Syntax variants: implicit and explicit joins, <code>join fetch</code>, subqueries, <code>exists</code>, <code>case when</code>, functions, <code>select new</code> DTOs, tuple queries, scrollable results, named queries, native queries with result mapping, and the Criteria API.`,
            r`session.createQuery("select e from Employee e where e.salary > (select avg(x.salary) from Employee x)", Employee.class).getResultList();
session.createQuery("select e from Employee e where exists (select 1 from Order o where o.salesRep = e)", Employee.class).getResultList();
session.createQuery("select case when e.salary > 60000 then 'HIGH' else 'NORMAL' end, count(e) from Employee e group by case when e.salary > 60000 then 'HIGH' else 'NORMAL' end", Object[].class).getResultList();
try (ScrollableResults<Employee> sr = session.createQuery("from Employee", Employee.class).scroll(ScrollMode.FORWARD_ONLY)) { while (sr.next()) { /* process */ } }

// OUTPUT: (SQL)
// select ... where e.salary>(select avg(x.salary) from employees x)`],
        [`Mistakes: string-concatenated queries (HQL injection), join fetching a collection with pagination (in-memory paging), cartesian products from fetching two collections, and selecting entities when a projection suffices.`,
            r`// WARN: HHH000104: firstResult/maxResults specified with collection fetch; applying in memory
session.createQuery("select o from Order o join fetch o.items", Order.class).setMaxResults(20).getResultList();

// fix: page the ids first, then fetch the graph for those ids
List<Long> ids = session.createQuery("select o.id from Order o order by o.id desc", Long.class).setMaxResults(20).getResultList();
List<Order> orders = session.createQuery("select distinct o from Order o join fetch o.items where o.id in :ids", Order.class).setParameter("ids", ids).getResultList();

// OUTPUT:
// the second form applies LIMIT in SQL on the id query`],
        [`Performance depends on the SQL generated: check indexes with EXPLAIN, select fewer columns with projections, use read-only hints, and cache only where measurements justify it. Query plan cache and statistics help find slow HQL.`,
            r`hibernate.session.events.log.LOG_QUERIES_SLOWER_THAN_MS=25
Query<Employee> q = session.createQuery("from Employee e where e.salary > :s", Employee.class).setParameter("s", 50000.0).setReadOnly(true).setHint("org.hibernate.fetchSize", 500);

// OUTPUT:
// WARN  SlowQuery: 412 milliseconds. SQL: 'select ... from employees where salary>?'`],
        [`Real-world: a product search with optional filters implemented with the Criteria API and a sort whitelist; every value is a bound parameter.`,
            r`public List<Product> search(String q, BigDecimal max, String sort) {
    CriteriaBuilder cb = em.getCriteriaBuilder();
    CriteriaQuery<Product> cq = cb.createQuery(Product.class);
    Root<Product> p = cq.from(Product.class);
    List<Predicate> ps = new ArrayList<>();
    if (q != null) ps.add(cb.like(cb.lower(p.get("name")), "%" + q.toLowerCase() + "%"));
    if (max != null) ps.add(cb.le(p.get("price"), max));
    cq.where(ps.toArray(new Predicate[0])).orderBy(cb.asc(p.get(Set.of("name", "price").contains(sort) ? sort : "name")));
    return em.createQuery(cq).setMaxResults(50).getResultList();
}

// OUTPUT: (SQL)
// select ... from products p where lower(p.name) like ? and p.price<=? order by p.name limit ?`]
    ),

    'hibernate-associations-expanded': dv(
        [`Hibernate maps associations to foreign keys and join tables. Only the owning side writes the foreign key column; the inverse side (<code>mappedBy</code>) is read-only for the database. Collections are replaced by PersistentBag/Set wrappers that track changes and load lazily. Cascade and orphan-removal settings define what happens to children when the parent changes.`,
            r`Order o = session.get(Order.class, 1L);
System.out.println(o.getItems().getClass().getSimpleName());        // wrapper, not loaded yet
System.out.println(Hibernate.isInitialized(o.getItems()));
int n = o.getItems().size();                                        // triggers the SELECT
System.out.println(Hibernate.isInitialized(o.getItems()));

// OUTPUT:
// PersistentBag
// false
// true`],
        [`Choices: one-to-one (shared primary key with <code>@MapsId</code> is best), one-to-many/many-to-one (bidirectional, owner on the many side), many-to-many (Set, ideally replaced by an association entity), element collections, and fetch/cascade/orphan settings. <code>@ManyToOne(fetch = LAZY, optional = false)</code> is the usual form.`,
            r`@Entity class UserProfile {
    @Id Long id;
    @OneToOne(fetch = FetchType.LAZY) @MapsId @JoinColumn(name = "id") User user;
    String bio;
}
@Entity class Post {
    @Id @GeneratedValue Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "author_id") User author;
}
@Entity class Tag {
    @Id Long id;
    @ManyToMany(mappedBy = "tags") Set<Post> posts = new HashSet<>();
}
@Entity class Post2 {
    @ManyToMany @JoinTable(name = "post_tags", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "tag_id")) Set<Tag> tags = new HashSet<>();
}

// OUTPUT: (DDL)
// user_profile(id pk/fk, bio)   post(id, author_id fk)   post_tags(post_id, tag_id)`],
        [`Mistakes: List (bag) in many-to-many (delete-all and re-insert on change), EAGER on @ManyToOne by default, cascade REMOVE on many-to-many, forgetting to update both sides, and fetching two bags at once (MultipleBagFetchException). Use Sets, LAZY and helper methods.`,
            r`session.createQuery("select o from Order o join fetch o.items join fetch o.payments", Order.class).getResultList();

// OUTPUT:
// org.hibernate.loader.MultipleBagFetchException: cannot simultaneously fetch multiple bags

// fix: fetch one collection per query (batch fetching) or use Set`],
        [`Association performance: the database cost of a join table update is delete plus insert for bags; use Sets or association entities. Index foreign key columns and check generated SQL for unnecessary statements.`,
            r`// bag: removing one element rewrites the whole collection
// delete from post_tags where post_id=?   insert into post_tags (post_id, tag_id) values (?, ?) (x N)
// set / association entity: delete from post_tags where post_id=? and tag_id=?

CREATE INDEX idx_post_tags_tag ON post_tags (tag_id, post_id);

// OUTPUT:
// Query OK, 0 rows affected`],
        [`Real-world: orders and items with an owned collection, cascade and orphan removal, helper methods, and a DTO for the API so the web layer never touches lazy collections.`,
            r`@Transactional
public OrderDto addItem(Long orderId, Long productId, int qty) {
    Order o = orders.findById(orderId).orElseThrow();
    o.addItem(new Item(products.getReferenceById(productId), qty));
    return OrderDto.from(o);
}

// OUTPUT: (SQL)
// select ... from orders where id=?   select ... from item where order_id=?   insert into item (order_id, product_id, qty) values (?, ?, ?)`]
    ),

    'hibernate-advanced-concepts': dv(
        [`The first-level cache is the persistence context: each loaded entity is stored by id for the life of the Session, so repeated loads cost nothing. The second-level cache is a shared, region-based cache of entity state (not objects) across sessions. The query cache stores result id lists. Locking is delegated to the database (optimistic via a version column, pessimistic via SELECT FOR UPDATE).`,
            r`Employee a = session.get(Employee.class, 1L);          // SELECT
Employee b = session.get(Employee.class, 1L);          // from the first-level cache, no SQL
session.evict(a);
Employee c = session.get(Employee.class, 1L);          // SELECT again (or second-level cache hit if enabled)

// OUTPUT: (SQL count)
// 2 SELECT statements for 3 loads`],
        [`Tools: <code>@BatchSize</code>, <code>@Fetch(FetchMode.SUBSELECT)</code>, entity graphs, <code>@NaturalId</code>, <code>@Filter</code>, <code>@Where</code>/<code>@SQLRestriction</code>, Envers for auditing, multi-tenancy, <code>@Formula</code>, inheritance strategies and query hints (<code>jakarta.persistence.cache.retrieveMode</code>).`,
            r`@Entity @Audited class Contract {
    @Id Long id;
    String terms;
}  // Envers: history table contract_aud
@FilterDef(name = "tenant", parameters = @ParamDef(name = "id", type = Long.class)) @Filter(name = "tenant", condition = "tenant_id = :id")
session.enableFilter("tenant").setParameter("id", 7L);
AuditReader reader = AuditReaderFactory.get(session);
List<Number> revs = reader.getRevisions(Contract.class, 1L);

// OUTPUT:
// revisions: [1, 4, 9]`],
        [`Mistakes: enabling the second-level cache everywhere (stale data, memory), caching mutable entities without a strategy, query cache on frequently changing tables, huge persistence contexts in batch jobs, and relying on lazy loading in views.`,
            r`// batch job without clearing: memory grows with every entity
for (Event e : session.createQuery("from Event", Event.class).getResultList()) { process(e); }
// fix: scroll and clear
try (ScrollableResults<Event> sr = session.createQuery("from Event", Event.class).setFetchSize(500).scroll(ScrollMode.FORWARD_ONLY)) {
    int i = 0; while (sr.next()) {
        process(sr.get());
        if (++i % 500 == 0) session.clear();
    }
}

// OUTPUT:
// heap stays flat while processing millions of rows`],
        [`Measure before caching: look at statement counts and hit ratios in the statistics. Cache only read-mostly reference data with explicit eviction and TTL.`,
            r`Statistics st = sessionFactory.getStatistics();
System.out.println("L2 hits " + st.getSecondLevelCacheHitCount() + ", misses " + st.getSecondLevelCacheMissCount() + ", put " + st.getSecondLevelCachePutCount());

// OUTPUT:
// L2 hits 91200, misses 410, put 410      (a good candidate for caching)`],
        [`Real-world: a country and currency reference table cached in the second-level cache with a read-only strategy, while orders are never cached and use optimistic locking.`,
            r`@Entity @Cacheable @Cache(usage = CacheConcurrencyStrategy.READ_ONLY) class Currency {
    @Id String code;
    String name;
}
@Entity class Order {
    @Id Long id;
    @Version int version;
    @ManyToOne(fetch = FetchType.LAZY) Currency currency;
}

// OUTPUT:
// currency lookups served from memory; orders always read from the database`]
    ),

    'hibernate-with-jpa': dv(
        [`Spring Data JPA creates a proxy for each repository interface at startup. Method names like <code>findByDeptNameOrderBySalaryDesc</code> are parsed into JPQL; <code>@Query</code> methods are validated at startup; the proxy runs them through an EntityManager shared with the current transaction. <code>@Transactional</code> is applied by a proxy around the service bean.`,
            r`public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByDeptNameOrderBySalaryDesc(String dept);
    boolean existsByEmail(String email);
    long countByDeptId(Long deptId);
}

// OUTPUT: (SQL)
// select e.* from employees e join departments d on d.id=e.dept_id where d.name=? order by e.salary desc
// select e.id from employees e where e.email=? limit 1
// select count(e.id) from employees e where e.dept_id=?`],
        [`Repository options: paging and sorting (<code>Pageable</code>, <code>Slice</code>), <code>@Query</code> JPQL and native, <code>@Modifying</code> bulk updates, projections (interface, DTO, dynamic), <code>@EntityGraph</code>, <code>Specification</code> and Query by Example, custom fragments, auditing, and <code>@Lock</code>.`,
            r`@EntityGraph(attributePaths = "dept") Optional<Employee> findWithDeptById(Long id);
@Modifying(clearAutomatically = true) @Query("update Employee e set e.salary = e.salary * :f where e.dept.id = :d") int raise(@Param("d") Long d, @Param("f") double f);
@Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select e from Employee e where e.id = :id") Optional<Employee> lockById(@Param("id") Long id);
Slice<Employee> findByDeptId(Long deptId, Pageable page);        // no count query

// OUTPUT: (SQL)
// select e.*, d.* from employees e left join departments d on d.id=e.dept_id where e.id=?
// select ... where id=? for update`],
        [`Mistakes: relying on derived method names for complex queries, forgetting <code>@Transactional</code> on modifying queries, returning entities to controllers, and calling a transactional method from the same class. Move logic to another bean or use TransactionTemplate.`,
            r`@Service class A {
    public void outer() { inner(); }                       // self-invocation: inner() has NO transaction
    @Transactional public void inner() { repo.save(new Employee()); }
}
// OUTPUT:
// TransactionRequiredException: no transaction is in progress (for modifying operations)

// fix
@Service class B {
    private final A a;
    public void outer() { a.inner(); }
}`],
        [`Performance: add indexes matching derived queries, avoid <code>findAll()</code> on big tables, use <code>Slice</code> instead of <code>Page</code> when counts are expensive, and use projections. Inspect SQL and counts per endpoint.`,
            r`spring.jpa.show-sql=true
logging.level.org.hibernate.orm.jdbc.bind=TRACE
Slice<EmployeeRow> next = repo.findByDeptId(10L, PageRequest.of(0, 20, Sort.by("id")));

// OUTPUT: (SQL)
// select e.id, e.name from employees e where e.dept_id=? order by e.id limit ?     (limit n+1, no count)`],
        [`Real-world: an API layer with controllers, DTOs, services and repositories, tested with a sliced test and a real database.`,
            r`@DataJpaTest @AutoConfigureTestDatabase(replace = NONE) @Testcontainers
class EmployeeRepositoryTest {
    @Autowired EmployeeRepository repo;
    @Test void findsByDepartment() {
        repo.save(new Employee("Abaji", 60000, hr));
        assertThat(repo.findByDeptNameOrderBySalaryDesc("HR")).hasSize(1);
    }
}

// OUTPUT:
// Tests run: 1, Failures: 0   (against MySQL in a container)`]
    ),

    'hibernate-best-practices': dv(
        [`Most Hibernate problems come from a few causes: unbounded object graphs, queries generated without review, long transactions and schema drift. Good practice is to make each of them visible: log SQL in development, assert statement counts in tests, set timeouts, and manage the schema with migrations.`,
            r`logging.level.org.hibernate.SQL=DEBUG
spring.jpa.properties.hibernate.generate_statistics=true
spring.jpa.open-in-view=false
spring.transaction.default-timeout=10

// OUTPUT:
// each request logs its SQL and statistics; lazy loading in the view layer fails fast; stuck transactions time out`],
        [`A checklist: LAZY everywhere, fetch plans per use case (entity graph, join fetch, projection), SEQUENCE ids with batching, Set-based many-to-many, @Version on aggregates, EnumType.STRING, DTOs at the API, Flyway/Liquibase for schema, HikariCP sizing, and slow-query logging.`,
            r`@Entity class Order {
    @Version int version;
    @ManyToOne(fetch = FetchType.LAZY) Customer customer;
    @OneToMany(mappedBy = "order") Set<Item> items = new HashSet<>();
    @Enumerated(EnumType.STRING) Status status;
}
@EntityGraph(attributePaths = {"customer"}) Page<Order> findByStatus(Status s, Pageable p);

// OUTPUT: (SQL)
// select o.*, c.* from orders o left join customers c on c.id=o.customer_id where o.status=? limit ?`],
        [`Mistakes: update ddl-auto in production, exposing entities from controllers (lazy errors, over-posting), saving inside loops without batching, ignoring the SQL, and giant @Transactional methods that call remote services. Fix each with its counterpart.`,
            r`// bad: remote call inside the transaction holds a DB connection and locks
@Transactional public void checkout(Order o) {
    repo.save(o);
    paymentGateway.charge(o);
}
// good: keep the transaction short, use an outbox for the external call
@Transactional public void checkout(Order o) {
    repo.save(o);
    outbox.add(new PaymentRequested(o.getId()));
}

// OUTPUT:
// pool wait time dropped from 800 ms to 5 ms under load`],
        [`Pool and database sizing: a small HikariCP pool outperforms a large one. Watch pool wait time, active connections, and statement counts per endpoint, and load test before changing settings.`,
            r`spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.connection-timeout=3000
spring.datasource.hikari.leak-detection-threshold=20000

// OUTPUT:
// WARN  ProxyLeakTask: Connection leak detection triggered for ... (stack trace shows the code that held it)`],
        [`Real-world review checklist for a pull request touching persistence: new queries have indexes, statement count assertions exist, migrations are included, DTOs are used, transactions are on services, and no entity crosses the API boundary.`,
            r`@Test void orderListIsEfficient() {
    Statistics st = sessionFactory.getStatistics();
    st.clear();
    var page = service.list(7L, PageRequest.of(0, 20));
    assertThat(page.getContent()).hasSize(20);
    assertThat(st.getPrepareStatementCount()).isLessThanOrEqualTo(2);
}

// OUTPUT:
// test passes when the endpoint uses at most 2 statements`]
    ),

    'hibernate-architecture': dv(
        [`Hibernate has layers: the API (Session, Query, Transaction), the core engine (persistence context, action queue, event listeners, loaders and persisters), the SQL generation layer (dialect, SQL AST) and JDBC services (connection provider, statement batching). An operation raises an event; default listeners update the persistence context and queue actions; flush turns actions into JDBC statements.`,
            r`SessionFactory sf = ...;
System.out.println(sf.getClass().getSimpleName());
SessionFactoryImplementor impl = sf.unwrap(SessionFactoryImplementor.class);
System.out.println(impl.getJdbcServices().getDialect().getClass().getSimpleName());
System.out.println(impl.getMappingMetamodel().getEntityDescriptor(Employee.class).getTableName());

// OUTPUT:
// SessionFactoryImpl
// MySQLDialect
// employees`],
        [`Extension points: event listeners (<code>PreInsertEventListener</code>), interceptors, custom types and converters, custom id generators, multi-tenancy resolvers (<code>CurrentTenantIdentifierResolver</code>), integrators and statistics. Flush modes control when SQL is sent: AUTO, COMMIT, ALWAYS, MANUAL.`,
            r`session.setHibernateFlushMode(FlushMode.COMMIT);        // do not flush before queries
session.setDefaultReadOnly(true);                        // skip dirty checking for read-only work

public class AuditInterceptor implements Interceptor { public boolean onFlushDirty(Object entity, Object id, Object[] cur, Object[] prev, String[] names, Type[] types) { /* audit */ return false; } }

// OUTPUT:
// read-only sessions skip snapshots, saving memory and CPU`],
        [`Mistakes: sharing a Session across threads, long-lived sessions (stale and large persistence context), unexpected flushes before queries (AUTO), and mutating entities by accident in read paths. Use short sessions, read-only mode where possible and be aware of flush ordering.`,
            r`Employee e = session.get(Employee.class, 1L);
e.setSalary(70000);                    // accidental change
List<Employee> all = session.createQuery("from Employee", Employee.class).getResultList();    // AUTO flush: update is sent here

// OUTPUT: (SQL order)
// update employees set salary=? where id=?
// select ... from employees`],
        [`Memory and CPU: each managed entity keeps a snapshot for dirty checking, so loading 100,000 entities doubles the memory. For read-only work use projections or read-only queries; for bulk work use StatelessSession.`,
            r`List<EmployeeRow> rows = session.createQuery("select new com.shop.EmployeeRow(e.id, e.name) from Employee e", EmployeeRow.class).getResultList();     // no snapshots
Query<Employee> q = session.createQuery("from Employee", Employee.class).setReadOnly(true);

// OUTPUT:
// 100,000 rows: entities ~ 410 MB heap, projections ~ 38 MB`],
        [`Real-world: multi-tenant application. A resolver supplies the tenant id for each request, Hibernate selects the schema or adds a discriminator filter, and the same code serves all tenants.`,
            r`@Component class TenantResolver implements CurrentTenantIdentifierResolver<String> {
    public String resolveCurrentTenantIdentifier() { return TenantContext.get(); }
    public boolean validateExistingCurrentSessions() { return true; }
}
hibernate.multiTenancy=SCHEMA

// OUTPUT: (SQL)
// use tenant_42;  select ... from orders where ...`]
    )
};
