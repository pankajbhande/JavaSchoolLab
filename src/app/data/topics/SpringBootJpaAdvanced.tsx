import { Topic } from '../coreJava';

export const springBootJpaAdvanced: Topic = {
    id: 'spring-boot-jpa-advanced',
    name: 'JPA Advanced - Auditing, Locking & Specifications',
    beginner: [
        {
            content: `<h3>Beyond Mapping: What This Topic Adds</h3>
By now an entity maps to a table, a repository writes queries from method names, and a join pulls two tables
together. This topic covers the parts of JPA that appear once an application is actually in production: fields that
must not be persisted, enums stored safely, hooks that run around a save, columns that fill themselves in, and
queries built at runtime rather than declared at compile time.<br><br>

<table>
<tr><th>Feature</th><th>Purpose</th></tr>
<tr><td><code>@Transient</code></td><td>Keep a field in the Java object but out of the table.</td></tr>
<tr><td><code>@Enumerated</code></td><td>Decide HOW an enum is written to its column - and the default is the wrong choice.</td></tr>
<tr><td>Lifecycle callbacks</td><td>Run code at defined moments: before insert, after load, before delete.</td></tr>
<tr><td>JPA auditing</td><td>Fill <code>createdAt</code>, <code>updatedAt</code>, <code>createdBy</code> automatically.</td></tr>
<tr><td><code>PagingAndSortingRepository</code></td><td>The layer of the repository hierarchy that supplies <code>Pageable</code> and <code>Sort</code>.</td></tr>
<tr><td><code>Specification</code></td><td>Build a WHERE clause at runtime from whichever filters the caller actually supplied.</td></tr>
</table>`
        },

        {
            content: `<h3>1. <code>@Transient</code> - A Field That Is Not a Column</h3>
By default JPA maps <strong>every</strong> non-static, non-final field of an entity to a column. A field that is
derived, cached in memory, or holds a value that has no business being in the database must be marked
<code>@Transient</code>, otherwise Hibernate tries to create a column for it and the application fails at startup
against a fixed schema.<br><br>

Two annotations share that name and they are not interchangeable:<br><br>

<table>
<tr><th>Annotation</th><th>Meaning</th></tr>
<tr><td><code>jakarta.persistence.Transient</code></td><td>The JPA one. "Do not map this field to a column." This is the one you almost always want.</td></tr>
<tr><td>Java's <code>transient</code> keyword</td><td>Excludes a field from Java <em>serialization</em>. JPA also honours it, which is why the two get confused - but it changes serialization behaviour as a side effect.</td></tr>
</table>
<br>
A transient field is <strong>not</strong> repopulated when an entity is loaded from the database, so anything derived
from persistent state has to be computed - typically in a <code>@PostLoad</code> callback.<br>`,
            codeExamples: [
                `package com.velocity.model;

import jakarta.persistence.*;   // Boot 3.x. Boot 2.x uses javax.persistence.*
import java.time.LocalDate;
import java.time.Period;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private LocalDate dateOfBirth;

    // Derived from dateOfBirth - storing it would go stale every birthday.
    @Transient
    private int age;

    // Recomputed each time the row is read back.
    @PostLoad
    private void calculateAge() {
        if (dateOfBirth != null) {
            this.age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        }
    }

    // getters and setters
}
// OUTPUT - the generated table:
// employee(id, name, date_of_birth)      <- no "age" column
//
// COMMON MISTAKE: forgetting @Transient on a derived field.
// Against an existing schema Hibernate then reports at startup:
//   Schema-validation: missing column [age] in table [employee]`
            ]
        },

        {
            content: `<h3>2. <code>@Enumerated</code> - and Why ORDINAL Corrupts Data</h3>
An enum has to be turned into something a column can hold. JPA offers two strategies, and the
<strong>default is ORDINAL</strong>, which stores the enum constant's <em>position</em> as an integer:
<code>0</code>, <code>1</code>, <code>2</code>.<br><br>

That position is not part of the enum's meaning. It is an accident of the order somebody typed the constants in.
The day a developer inserts a new constant in the middle - a completely reasonable edit that compiles, passes
review, and passes every test - every existing row in the database silently changes meaning.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">VERSION 1 of the enum          Rows written by version 1
  ACTIVE    -> 0                  id=1  status=0   (ACTIVE)
  SUSPENDED -> 1                  id=2  status=1   (SUSPENDED)
  CLOSED    -> 2                  id=3  status=2   (CLOSED)

Someone adds PENDING in alphabetical-ish order:

VERSION 2 of the enum          The SAME rows, re-read by version 2
  ACTIVE    -> 0                  id=1  status=0   ACTIVE     (still right)
  PENDING   -> 1                  id=2  status=1   PENDING    <-- was SUSPENDED
  SUSPENDED -> 2                  id=3  status=2   SUSPENDED  <-- was CLOSED
  CLOSED    -> 3

No exception. No error log. No failing test. Closed accounts are now
suspended, and suspended accounts are now pending approval.</pre>
<br>
There is no migration that can repair this afterwards, because nothing in the database records which version of
the enum wrote which row. <strong>Always write <code>@Enumerated(EnumType.STRING)</code></strong>. The column then
holds <code>'SUSPENDED'</code>, which means the same thing regardless of declaration order, and is readable to
anyone querying the table directly.<br><br>

The cost is a few bytes per row and a slightly wider index. That is not a trade worth having.<br>`,
            codeExamples: [
                `public enum AccountStatus { ACTIVE, SUSPENDED, CLOSED }

@Entity
public class Account {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // WRONG - and this is the DEFAULT if you write nothing at all.
    @Enumerated(EnumType.ORDINAL)
    private AccountStatus statusOrdinal;

    // RIGHT
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private AccountStatus status;
}
// OUTPUT - what the two columns actually hold:
// status_ordinal | status
//              1 | SUSPENDED
//
// Reorder the enum and the left column now reads as a different
// constant. The right column cannot.`,
                `// Guarding the column as well as the mapping
@Enumerated(EnumType.STRING)
@Column(name = "status", length = 20, nullable = false,
        columnDefinition = "varchar(20)")
private AccountStatus status;

// Add a CHECK constraint in the migration so the DATABASE rejects
// a value the enum does not have:
//   alter table account add constraint account_status_chk
//     check (status in ('ACTIVE','SUSPENDED','CLOSED'));

// What happens when a row holds a value the enum no longer has:
// OUTPUT:
// java.lang.IllegalArgumentException: No enum constant
//   com.velocity.model.AccountStatus.DORMANT
//
// Loud and immediate - which is exactly the behaviour you want,
// and precisely what ORDINAL denies you.`
            ]
        },

        {
            content: `<h3>3. Entity Lifecycle Callbacks</h3>
JPA lets a method run at defined points in an entity's life. The method must return <code>void</code>, take no
arguments, and live either on the entity itself or on a separate listener class registered with
<code>@EntityListeners</code>.<br><br>

<table>
<tr><th>Callback</th><th>When it fires</th></tr>
<tr><td><code>@PrePersist</code></td><td>Before the INSERT, when the entity becomes managed. The id is usually still null here.</td></tr>
<tr><td><code>@PostPersist</code></td><td>After the INSERT. The generated id is now populated.</td></tr>
<tr><td><code>@PreUpdate</code></td><td>Before an UPDATE - and only if dirty checking found something actually changed.</td></tr>
<tr><td><code>@PostUpdate</code></td><td>After the UPDATE statement is issued.</td></tr>
<tr><td><code>@PreRemove</code></td><td>Before the DELETE. The last chance to read the row's state.</td></tr>
<tr><td><code>@PostRemove</code></td><td>After the DELETE.</td></tr>
<tr><td><code>@PostLoad</code></td><td>After the entity is loaded or refreshed from the database.</td></tr>
</table>
<br>
<div class="border">
<strong>The rule callbacks come with:</strong> never call a repository, an <code>EntityManager</code>, or anything
that touches the database from inside a callback. You are running in the middle of a flush; issuing another query
there produces undefined behaviour and, in Hibernate, often a <code>ConcurrentModificationException</code> or a
silent lost write. Keep callbacks to setting fields on <code>this</code>.<br>
</div><br>

<code>@PreUpdate</code> is worth a second look: it does not run because you called <code>save()</code>. It runs
because the flush found a changed field. If nothing changed, no UPDATE is issued and no callback fires.<br>`,
            codeExamples: [
                `@Entity
@Table(name = "orders")
public class Order {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
        if (this.status == null) {
            this.status = OrderStatus.NEW;
        }
        // id is still null at this point for IDENTITY generation
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PostLoad
    void afterLoad() {
        System.out.println("Loaded order " + orderNumber);
    }
}
// OUTPUT of orderRepository.save(new Order("ORD-1001")):
// Hibernate: insert into orders (created_at, order_number, status, updated_at)
//            values (?, ?, ?, ?)
// -> created_at and updated_at were never set by the caller`,
                `// A listener class keeps the cross-cutting logic out of the entity
public class OrderAuditListener {

    @PrePersist
    public void beforeInsert(Order order) {
        order.setCreatedAt(LocalDateTime.now());
    }

    @PreRemove
    public void beforeDelete(Order order) {
        // Fine: reads the in-memory state, touches no repository.
        System.out.println("Deleting order " + order.getOrderNumber());
    }
}

@Entity
@EntityListeners(OrderAuditListener.class)
public class Order { /* ... */ }

// WHAT NOT TO DO:
// @PreRemove
// public void beforeDelete(Order order) {
//     auditRepository.save(new AuditRow(order.getId()));   // NO
// }
// OUTPUT (typical):
// java.util.ConcurrentModificationException
//   at org.hibernate.event.internal.AbstractFlushingEventListener...
// Publish a Spring event instead and write the audit row after commit.`
            ]
        },

        {
            content: `<h3>4. JPA Auditing - Stop Writing the Same Four Fields</h3>
Almost every table wants to know when a row was created, when it last changed, and who did it. Writing that by
hand in every entity is repetitive and easy to forget on the one entity that later matters. Spring Data supplies
it declaratively.<br><br>

Four pieces have to be in place:<br><br>

<table>
<tr><th>Piece</th><th>Responsibility</th></tr>
<tr><td><code>@EnableJpaAuditing</code></td><td>On a configuration class. Without it the annotations are inert and the columns stay null - by far the most common auditing bug.</td></tr>
<tr><td><code>@EntityListeners(AuditingEntityListener.class)</code></td><td>On the entity (or its mapped superclass). This is the listener that does the work.</td></tr>
<tr><td><code>@CreatedDate</code> / <code>@LastModifiedDate</code> / <code>@CreatedBy</code> / <code>@LastModifiedBy</code></td><td>On the fields to populate.</td></tr>
<tr><td><code>AuditorAware&lt;T&gt;</code> bean</td><td>Answers "who is the current user?" Required only for the <code>@CreatedBy</code> / <code>@LastModifiedBy</code> pair.</td></tr>
</table>
<br>
Put the four fields in a <code>@MappedSuperclass</code> and every entity inherits them by extending one class.
A <code>@MappedSuperclass</code> is not an entity and gets no table of its own - its fields simply become columns
on each subclass's table.<br><br>

<code>AuditorAware</code> returns an <code>Optional</code> deliberately: during startup data loading, a scheduled
job, or a health check there is no logged-in user, and the correct answer is "nobody" rather than a crash.<br>`,
            codeExamples: [
                `// 1. Enable it - and note the audit date provider for testability
package com.velocity.config;

import org.springframework.context.annotation.*;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication auth =
                    SecurityContextHolder.getContext().getAuthentication();

            // No user during startup seeding, batch jobs or async threads.
            if (auth == null || !auth.isAuthenticated()
                    || "anonymousUser".equals(auth.getPrincipal())) {
                return Optional.of("system");
            }
            return Optional.of(auth.getName());
        };
    }
}
// Optional.empty() leaves the column null. Returning "system"
// is usually more useful than a null you cannot explain later.`,
                `// 2. One base class every auditable entity extends
package com.velocity.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import java.time.Instant;

@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class Auditable {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    @CreatedBy
    @Column(name = "created_by", length = 60, updatable = false)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by", length = 60)
    private String updatedBy;

    // getters (setters are not needed - the listener writes the fields)
}
// updatable = false on the created_* pair matters: without it a later
// UPDATE would rewrite the creation stamp, and the audit trail is gone.`,
                `// 3. The entity itself stays clean
@Entity
@Table(name = "orders")
public class Order extends Auditable {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNumber;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;
}

// POST /api/orders  as user "ajay"
// OUTPUT - the row that lands in the table:
// id | order_number | status | created_at              | created_by | updated_at              | updated_by
//  1 | ORD-1001     | NEW    | 2026-03-11T09:14:02.11Z | ajay       | 2026-03-11T09:14:02.11Z | ajay
//
// Later, user "priya" cancels it:
//  1 | ORD-1001     | CANCELLED | 2026-03-11T09:14:02.11Z | ajay    | 2026-03-12T15:40:55.03Z | priya
//
// IF THE COLUMNS ARE ALL NULL: @EnableJpaAuditing is missing.
// The annotations compile perfectly well without it and do nothing.`
            ]
        },

        {
            content: `<h3>5. The Repository Hierarchy and <code>PagingAndSortingRepository</code></h3>
<code>JpaRepository</code> is the one everybody extends, but it is the bottom of a chain, and each level exists so
you can expose <em>less</em> when you want to.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Repository&lt;T, ID&gt;                    marker interface, no methods
      |
CrudRepository&lt;T, ID&gt;                save, findById, findAll, delete, count, existsById
      |
ListCrudRepository&lt;T, ID&gt;            same, but returns List instead of Iterable
      |
PagingAndSortingRepository&lt;T, ID&gt;    findAll(Pageable), findAll(Sort)
      |
JpaRepository&lt;T, ID&gt;                 + flush(), saveAndFlush(), deleteAllInBatch(),
                                       getReferenceById()

  ... and orthogonal to the chain:
JpaSpecificationExecutor&lt;T&gt;          findAll(Specification), count(Specification)</pre>
<br>
Note the shape change in Spring Data 3.x: <code>PagingAndSortingRepository</code> no longer extends
<code>CrudRepository</code>. It is a standalone interface, so a repository that needs both now extends both. Code
written against Spring Boot 2.x that extends only <code>PagingAndSortingRepository</code> and calls
<code>save()</code> stops compiling on the upgrade.<br><br>

<code>Page</code> versus <code>Slice</code> is the other choice worth making deliberately: <code>Page</code> issues
a second COUNT query to report the total, <code>Slice</code> does not and only knows whether a next page exists.
On a large table that COUNT is often the slower half of the request.<br>`,
            codeExamples: [
                `// Spring Data 3.x: both are needed for CRUD + paging
public interface EmployeeRepository
        extends CrudRepository<Employee, Long>,
                PagingAndSortingRepository<Employee, Long> {
}

// Sorting without paging
List<Employee> sorted = employeeRepository.findAll(
        Sort.by(Sort.Direction.DESC, "salary")
            .and(Sort.by("name")));
// OUTPUT SQL:
// select ... from employee order by salary desc, name asc

// Paging
Page<Employee> page = employeeRepository.findAll(
        PageRequest.of(2, 20, Sort.by("id")));

System.out.println(page.getNumber());          // 2
System.out.println(page.getNumberOfElements());// 20
System.out.println(page.getTotalElements());   // 137
System.out.println(page.getTotalPages());      // 7
// OUTPUT SQL - two statements:
// select ... from employee order by id limit 20 offset 40
// select count(e.id) from employee e`,
                `// Slice avoids the COUNT when the UI only needs "Load more"
Slice<Employee> slice = employeeRepository.findByCity(
        "pune", PageRequest.of(0, 20));

slice.hasNext();        // true
// slice.getTotalElements();  // does not exist on Slice
// OUTPUT SQL - ONE statement, fetching limit+1 rows to test hasNext:
// select ... from employee where city=? limit 21

// ALWAYS sort a paged query on something unique.
// PageRequest.of(0, 20, Sort.by("city")) on non-unique cities:
// the database may return the same row on page 0 and page 1, and
// skip another entirely. Add a tie-breaker:
Sort.by("city").and(Sort.by("id"));`
            ]
        },

        {
            content: `<h3>6. Specifications - a WHERE Clause Built at Runtime</h3>
A search screen with five optional filters cannot be served by derived query methods: five optional filters is
thirty-two possible WHERE clauses. A <code>Specification</code> is a small object representing one
<em>predicate</em>, and predicates compose with <code>and</code> / <code>or</code>. Null ones are skipped, which is
what makes optional filters work.<br><br>

The repository has to extend <code>JpaSpecificationExecutor&lt;T&gt;</code> alongside
<code>JpaRepository</code>; that is what supplies <code>findAll(Specification)</code>,
<code>findAll(Specification, Pageable)</code> and <code>count(Specification)</code>.<br><br>

A specification is a lambda with three parameters:<br><br>

<table>
<tr><th>Parameter</th><th>What it is</th></tr>
<tr><td><code>root</code></td><td>The entity being queried. <code>root.get("city")</code> names a field; <code>root.join("department")</code> walks an association.</td></tr>
<tr><td><code>query</code></td><td>The whole query, for <code>distinct()</code>, <code>orderBy()</code>, or subqueries. Frequently unused.</td></tr>
<tr><td><code>cb</code> (<code>CriteriaBuilder</code>)</td><td>The factory for predicates: <code>equal</code>, <code>like</code>, <code>greaterThan</code>, <code>between</code>, <code>in</code>, <code>isNull</code>.</td></tr>
</table>
<br>
Field names inside <code>root.get("...")</code> are strings, so a rename refactor will not update them. They fail
at runtime, not at compile time - the JPA metamodel (<code>Employee_.city</code>) exists to fix exactly that and is
worth generating on any project that leans on specifications heavily.<br>`,
            codeExamples: [
                `package com.velocity.repository;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long>,
                JpaSpecificationExecutor<Employee> { }`,
                `package com.velocity.repository;

import org.springframework.data.jpa.domain.Specification;

public final class EmployeeSpecs {

    private EmployeeSpecs() { }

    // Returning null makes the filter disappear from the query.
    public static Specification<Employee> cityIs(String city) {
        return (root, query, cb) ->
                city == null ? null : cb.equal(root.get("city"), city);
    }

    public static Specification<Employee> nameContains(String part) {
        return (root, query, cb) -> part == null ? null
                : cb.like(cb.lower(root.get("name")),
                          "%" + part.toLowerCase() + "%");
    }

    public static Specification<Employee> salaryAtLeast(Double min) {
        return (root, query, cb) -> min == null ? null
                : cb.greaterThanOrEqualTo(root.get("salary"), min);
    }

    public static Specification<Employee> statusIn(List<String> statuses) {
        return (root, query, cb) ->
                (statuses == null || statuses.isEmpty()) ? null
                        : root.get("status").in(statuses);
    }

    // Walking an association - joins to department and filters on its name
    public static Specification<Employee> inDepartment(String deptName) {
        return (root, query, cb) -> {
            if (deptName == null) return null;
            return cb.equal(root.join("department").get("name"), deptName);
        };
    }
}`,
                `@Service
public class EmployeeSearchService {

    private final EmployeeRepository repository;

    public Page<Employee> search(EmployeeSearchCriteria c, Pageable pageable) {

        Specification<Employee> spec = Specification
                .where(EmployeeSpecs.cityIs(c.city()))
                .and(EmployeeSpecs.nameContains(c.namePart()))
                .and(EmployeeSpecs.salaryAtLeast(c.minSalary()))
                .and(EmployeeSpecs.statusIn(c.statuses()))
                .and(EmployeeSpecs.inDepartment(c.department()));

        return repository.findAll(spec, pageable);
    }
}

// OUTPUT - the SAME method, three different requests:
//
// city=pune  (everything else null)
//   select ... from employee where city=? order by id limit 20
//
// city=pune, minSalary=50000
//   select ... from employee where city=? and salary>=? order by id limit 20
//
// nothing supplied at all
//   select ... from employee order by id limit 20
//   (every predicate was null, so there is no where clause)
//
// department=Engineering
//   select ... from employee e
//   inner join department d on e.dept_id = d.id
//   where d.name=? order by e.id limit 20`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Dirty Checking - Why an Update Happens Without <code>save()</code></h3>
This is the single most surprising thing JPA does, and the source of both the "I never saved it and it saved" bug
and the "I called save() and nothing happened" bug.<br><br>

Inside a transaction, every entity loaded through the <code>EntityManager</code> is <strong>managed</strong>. The
persistence context keeps two things for each one: the object you hold a reference to, and a snapshot of the field
values as they were when it was loaded. At <strong>flush</strong> - triggered before a query that could be affected,
and always at commit - Hibernate compares every managed entity against its snapshot and issues an UPDATE for each
field that differs.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">@Transactional
public void raise(Long id) {
    Employee e = repo.findById(id).orElseThrow();   // MANAGED + snapshot taken
    e.setSalary(e.getSalary() * 1.10);              // only the Java object changes
}                                                   // COMMIT -> flush -> compare

  persistence context
  +-----------------------------------------------+
  | Employee#7  -> object   { salary = 66000 }     |
  |             -> snapshot { salary = 60000 }     |
  +-----------------------------------------------+
                     |
              differ? yes
                     v
  Hibernate: update employee set salary=? where id=?

There is no save() in that method. There does not need to be one.</pre>
<br>
The corollary matters just as much: an entity <strong>outside</strong> a transaction, or one you constructed with
<code>new</code>, is <em>detached</em>. Nothing tracks it, and no amount of setter calls will write anything.
<code>save()</code> on a detached entity with an id performs a <code>merge</code>: it loads the current row,
copies your fields onto the managed copy, and returns <em>that</em> - which is why <code>save()</code>'s return
value, not the argument, is the object you should keep using.<br>`,
            codeExamples: [
                `@Service
public class SalaryService {

    private final EmployeeRepository repo;

    // 1. Managed - the update happens with no save() call
    @Transactional
    public void giveRaise(Long id, double pct) {
        Employee e = repo.findById(id).orElseThrow();
        e.setSalary(e.getSalary() * (1 + pct / 100));
    }
    // OUTPUT:
    // Hibernate: select ... from employee where id=?
    // Hibernate: update employee set name=?, salary=?, ... where id=?

    // 2. NOT transactional - the entity is detached the moment
    //    findById's own short transaction ends. Nothing is written.
    public void brokenRaise(Long id, double pct) {
        Employee e = repo.findById(id).orElseThrow();
        e.setSalary(e.getSalary() * (1 + pct / 100));
    }
    // OUTPUT:
    // Hibernate: select ... from employee where id=?
    // (no update - the change exists only in a garbage-collected object)

    // 3. readOnly = true disables dirty checking entirely
    @Transactional(readOnly = true)
    public void alsoBroken(Long id) {
        Employee e = repo.findById(id).orElseThrow();
        e.setSalary(0);        // silently discarded
    }
    // Hibernate sets FlushMode.MANUAL, so no comparison is ever made.
}`,
                `// merge: why you must use save()'s RETURN value
@Transactional
public void detachedUpdate(Employee fromRequest) {   // built by Jackson, detached

    // WRONG - "employee" is still the detached object; changes made
    // to it after this line are not tracked by anything.
    employeeRepository.save(fromRequest);
    fromRequest.setStatus("ACTIVE");      // goes nowhere

    // RIGHT
    Employee managed = employeeRepository.save(fromRequest);
    managed.setStatus("ACTIVE");          // dirty-checked, will be written
}
// OUTPUT of save() on a detached entity WITH an id:
// Hibernate: select ... from employee where id=?     <- merge loads it first
// Hibernate: update employee set ... where id=?
//
// This is why blind save() on a full request body is dangerous: any
// field the client omitted arrives as null and overwrites the column.`,
                `// Flush is not commit, and order is not what you wrote
@Transactional
public void ordering() {
    Employee a = repo.findById(1L).orElseThrow();
    a.setName("changed");

    long n = repo.count();      // a QUERY -> triggers a flush first
    // OUTPUT:
    // Hibernate: update employee set name=? where id=?    <- flushed here
    // Hibernate: select count(*) from employee

    repo.save(new Employee("new-guy"));
}
// At commit Hibernate orders statements by TYPE, not by call order:
//   inserts, then updates, then collection deletes, then entity deletes.
// A delete-then-insert of the same unique key therefore fails:
// OUTPUT:
// ConstraintViolationException: Duplicate entry 'ajay@gmail.com'
//   for key 'employee.email_UNIQUE'
// Fix: call flush() explicitly between the delete and the insert.`
            ]
        },

        {
            content: `<h3>Optimistic Locking - the Lost Update, Concretely</h3>
Two users open the same record, both edit it, both save. Without locking, one of those edits vanishes and nobody
is told. This is the <strong>lost update</strong> problem, and it is not prevented by a transaction - both
transactions are perfectly serialisable on their own.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">           STOCK ROW: product 42, quantity = 10

  Session A (warehouse)              Session B (returns desk)
  ---------------------              ------------------------
  t1  select quantity -> 10
  t2                                 select quantity -> 10
  t3  ships 3 -> sets 7
  t4  update stock set qty=7
  t5  COMMIT                         (row is now 7)
  t6                                 receives 2 -> sets 12
  t7                                 update stock set qty=12
  t8                                 COMMIT

           FINAL: quantity = 12.  Correct answer: 9.
  Session A's shipment was silently overwritten. No error anywhere.</pre>
<br>
<strong>Optimistic locking</strong> fixes this with one extra column. Add <code>@Version</code> to an integer or
timestamp field; Hibernate then appends the version to every UPDATE's WHERE clause and increments it:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">update stock set quantity=?, version=version+1
 where id=? and version=?      &lt;-- the version READ at the start

Session A: where id=42 and version=0  -> 1 row updated  -> version becomes 1
Session B: where id=42 and version=0  -> 0 rows updated
                                          |
                    Hibernate sees rowCount 0 and throws
                    ObjectOptimisticLockingFailureException</pre>
<br>
Nothing is locked. The check is deferred to the moment of writing, which is why it costs nothing when there is no
contention - and that is the normal case. The application's job is to catch the failure and decide: retry, or show
the user "this record changed while you were editing it".<br><br>

<strong>Never expose <code>@Version</code> only server-side in a stateless API.</strong> If the client does not send
back the version it read, you have reintroduced the lost update through the back door.<br>`,
            codeExamples: [
                `@Entity
@Table(name = "stock")
public class Stock {

    @Id
    private Long productId;

    private int quantity;

    @Version                 // Hibernate manages this - never set it yourself
    private Long version;    // Integer/int/Long/long/Timestamp are all valid
}
// The version column must exist in the schema:
//   alter table stock add column version bigint not null default 0;
//
// COMMON MISTAKE: writing a setter and calling it. Assigning the
// version by hand defeats the mechanism and produces spurious failures.`,
                `// The concurrent scenario, and what each thread actually sees
@Service
public class StockService {

    @Transactional
    public void adjust(Long productId, int delta) {
        Stock s = stockRepository.findById(productId).orElseThrow();
        s.setQuantity(s.getQuantity() + delta);
    }
}

// Two threads calling adjust(42, -3) and adjust(42, +2) at once:
//
// THREAD A OUTPUT:
// Hibernate: select ... from stock where product_id=?      (version=0)
// Hibernate: update stock set quantity=7, version=1
//            where product_id=42 and version=0             (1 row)
// -> commits
//
// THREAD B OUTPUT:
// Hibernate: select ... from stock where product_id=?      (version=0)
// Hibernate: update stock set quantity=12, version=1
//            where product_id=42 and version=0             (0 rows)
// org.springframework.orm.ObjectOptimisticLockingFailureException:
//   Row was updated or deleted by another transaction
//   (or unsaved-value mapping was incorrect):
//   [com.velocity.model.Stock#42]
//
// The JPA-level exception underneath is jakarta.persistence.
// OptimisticLockException; Spring translates it to the one above.`,
                `// Handling it 1: retry, for an operation that is safe to repeat
@Service
public class StockService {

    @Retryable(retryFor = ObjectOptimisticLockingFailureException.class,
               maxAttempts = 4,
               backoff = @Backoff(delay = 50, multiplier = 2, random = true))
    @Transactional
    public void adjust(Long productId, int delta) {
        Stock s = stockRepository.findById(productId).orElseThrow();
        s.setQuantity(s.getQuantity() + delta);
    }
}
// The retry MUST be outside the transaction boundary - retrying inside
// a rolled-back transaction re-reads stale state and fails forever.
// @Retryable on the same bean as @Transactional works because Spring
// orders the retry advice outside the transaction advice by default;
// verify it, or split the retry into a separate caller bean.

// Handling it 2: tell the user, for an edit a human made
@ExceptionHandler(ObjectOptimisticLockingFailureException.class)
@ResponseStatus(HttpStatus.CONFLICT)
public ApiError conflict(ObjectOptimisticLockingFailureException ex) {
    return new ApiError("This record was changed by someone else. "
                      + "Reload and re-apply your changes.");
}
// OUTPUT: HTTP 409 Conflict - the correct status for this.`,
                `// The stateless-API trap: the version must round-trip
public record StockDto(Long productId, int quantity, Long version) { }

@PutMapping("/api/stock/{id}")
public StockDto update(@PathVariable Long id, @RequestBody StockDto dto) {

    Stock s = stockRepository.findById(id).orElseThrow();

    // Without this line the entity carries the CURRENT version, the
    // update always succeeds, and @Version has been made decorative.
    s.setVersion(dto.version());          // or map via a merge

    s.setQuantity(dto.quantity());
    return toDto(stockRepository.saveAndFlush(s));
}
// The HTTP-native form of the same idea is an ETag plus If-Match,
// with the version as the entity tag - same mechanism, standard headers.`
            ]
        },

        {
            content: `<h3>Pessimistic Locking - and the Price It Charges</h3>
Optimistic locking detects a conflict after the fact. Pessimistic locking prevents one by taking a database lock
on the row at read time, so the second reader waits. It is the right answer when conflicts are frequent enough
that retrying is wasteful, or when the work between read and write cannot be repeated.<br><br>

<table>
<tr><th>Mode</th><th>Effect</th></tr>
<tr><td><code>PESSIMISTIC_READ</code></td><td>A shared lock. Others may read, nobody may write. SQL: <code>for share</code> / <code>lock in share mode</code>.</td></tr>
<tr><td><code>PESSIMISTIC_WRITE</code></td><td>An exclusive lock. Nobody else may read-for-update or write. SQL: <code>for update</code>. This is the one you normally want.</td></tr>
<tr><td><code>PESSIMISTIC_FORCE_INCREMENT</code></td><td>Exclusive lock and bumps the <code>@Version</code>, so optimistic readers elsewhere also notice.</td></tr>
<tr><td><code>OPTIMISTIC_FORCE_INCREMENT</code></td><td>Bumps the version even if nothing on the entity changed - used to mark a parent as modified when only a child changed.</td></tr>
</table>
<br>
Two risks come with it, and both bite in production rather than in testing:<br><br>

<div class="border">
<strong>Deadlock.</strong> Transaction 1 locks row A then wants B; transaction 2 locks B then wants A. Neither can
proceed. The database detects the cycle and kills one of them - a real error the application must handle.
Prevention is discipline: <strong>always acquire locks in a deterministic order</strong>, typically ascending
primary key.<br>
<strong>Timeout and queueing.</strong> A lock held across a slow operation serialises every request behind it.
The default wait in MySQL InnoDB is 50 seconds; long before that, the connection pool is exhausted and the whole
application stops responding, not merely the one endpoint.<br>
</div><br>

Rules of thumb: hold the lock for as short a time as possible, never across a remote call, and always set an
explicit timeout so a stuck transaction fails fast instead of parking a connection.<br>`,
            codeExamples: [
                `public interface StockRepository extends JpaRepository<Stock, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout",
                           value = "3000"))       // milliseconds
    @Query("select s from Stock s where s.productId = :id")
    Optional<Stock> findByIdForUpdate(@Param("id") Long id);
}

@Service
public class StockService {

    @Transactional     // MANDATORY - a lock outside a transaction is meaningless
    public void reserve(Long productId, int qty) {
        Stock s = stockRepository.findByIdForUpdate(productId).orElseThrow();
        if (s.getQuantity() < qty) {
            throw new InsufficientStockException(productId);
        }
        s.setQuantity(s.getQuantity() - qty);
    }
}
// OUTPUT - thread A:
// Hibernate: select ... from stock where product_id=? for update
// (holds the lock until commit)
//
// OUTPUT - thread B, arriving 10ms later:
// (blocks on the same statement)
// ... A commits ...
// Hibernate: select ... from stock where product_id=? for update
// -> B now reads the value A wrote, not the stale one.
//
// If A takes longer than the 3s hint:
// jakarta.persistence.LockTimeoutException
// -> Spring: PessimisticLockingFailureException`,
                `// The deadlock, and the one-line discipline that prevents it
@Transactional
public void transfer(Long fromId, Long toId, int qty) {

    // WRONG - lock order depends on the arguments
    Stock from = repo.findByIdForUpdate(fromId).orElseThrow();
    Stock to   = repo.findByIdForUpdate(toId).orElseThrow();
    // transfer(1,2) and transfer(2,1) running together deadlock.

    // RIGHT - always lock in ascending id order
    List<Long> ids = Stream.of(fromId, toId).sorted().toList();
    Map<Long, Stock> locked = ids.stream()
            .map(id -> repo.findByIdForUpdate(id).orElseThrow())
            .collect(toMap(Stock::getProductId, identity()));
}
// OUTPUT when the deadlock does happen (MySQL):
// com.mysql.cj.jdbc.exceptions.MySQLTransactionRollbackException:
//   Deadlock found when trying to get lock; try restarting transaction
// -> Spring: CannotAcquireLockException
//
// PostgreSQL:
// ERROR: deadlock detected
//   Detail: Process 812 waits for ShareLock on transaction 4471;
//           blocked by process 799.
//
// The database kills one transaction. That one must be retried -
// which is why the retry logic from optimistic locking is still
// needed even when you have gone pessimistic.`,
                `// Non-blocking variants when waiting is worse than failing
// Hibernate maps timeout 0 to NOWAIT and -2 to SKIP LOCKED.

@Lock(LockModeType.PESSIMISTIC_WRITE)
@QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "0"))
Optional<Stock> findByIdNoWait(Long id);
// OUTPUT SQL: select ... for update nowait
// If the row is locked: fails INSTANTLY rather than queueing.

// SKIP LOCKED is how a database-backed job queue is built correctly:
@Query(value = """
        select * from job_queue
        where status = 'PENDING'
        order by id
        limit 10
        for update skip locked
        """, nativeQuery = true)
List<Job> claimBatch();
// Ten workers run this concurrently and each gets a DIFFERENT ten
// jobs - no worker waits, and no job is processed twice.`
            ]
        },

        {
            content: `<h3>Choosing Between the Two</h3>
<table>
<tr><th></th><th>Optimistic (@Version)</th><th>Pessimistic (@Lock)</th></tr>
<tr><td>When the check happens</td><td>At write time, by row count</td><td>At read time, by database lock</td></tr>
<tr><td>Cost with no contention</td><td>Effectively zero</td><td>A real lock, held to commit</td></tr>
<tr><td>Cost with contention</td><td>Wasted work, then a retry</td><td>Waiting, then correct work</td></tr>
<tr><td>Scales across nodes</td><td>Yes - the version is in the row</td><td>Yes, but the database becomes the bottleneck</td></tr>
<tr><td>Survives a user thinking</td><td>Yes - the version travels in the DTO</td><td>No - you cannot hold a lock across an HTTP round trip</td></tr>
<tr><td>Failure mode</td><td>OptimisticLockException / 409</td><td>Lock timeout, deadlock, pool exhaustion</td></tr>
<tr><td>Right for</td><td>Web edits, rare collisions, anything user-facing</td><td>Inventory decrements, ledger postings, job claiming</td></tr>
</table>
<br>
The default should be optimistic. Reach for pessimistic when the read-modify-write must be atomic <em>and</em>
conflicts are common - decrementing stock under flash-sale traffic is the textbook case, where an optimistic
approach would fail and retry so often it becomes a livelock.<br><br>

There is a third answer that beats both when it applies: don't read at all. <code>update stock set quantity =
quantity - ? where product_id = ? and quantity >= ?</code> is a single atomic statement; a row count of 0 means
insufficient stock. No locking strategy needed - the database already serialises the write.<br>`,
            codeExamples: [
                `// The third option: an atomic conditional update, no lock at all
public interface StockRepository extends JpaRepository<Stock, Long> {

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Stock s set s.quantity = s.quantity - :qty "
         + "where s.productId = :id and s.quantity >= :qty")
    int reserve(@Param("id") Long id, @Param("qty") int qty);
}

@Transactional
public void reserve(Long id, int qty) {
    if (stockRepository.reserve(id, qty) == 0) {
        throw new InsufficientStockException(id);
    }
}
// OUTPUT:
// Hibernate: update stock set quantity=quantity-? where product_id=? and quantity>=?
// -> returns 1 (reserved) or 0 (not enough stock)
//
// One statement, no select, no lock held by us, correct under any
// concurrency. clearAutomatically=true is essential: a bulk update
// bypasses the persistence context, so any entity already loaded in
// this transaction is now STALE and must be evicted.`
            ]
        },

        {
            content: `<h3>Criteria API vs Specifications - the Same Engine, Different Ergonomics</h3>
A <code>Specification</code> is not an alternative to the Criteria API; it is a thin, composable wrapper
<em>over</em> it. Its <code>toPredicate</code> method receives exactly the Criteria objects you would otherwise
build yourself. The difference is entirely in how much ceremony you write and whether the pieces can be reused.<br><br>

<table>
<tr><th>Aspect</th><th>Raw Criteria API</th><th>Specification</th></tr>
<tr><td>Lines for a 3-filter search</td><td>Roughly 25, plus a separate count query</td><td>Roughly 5, count handled for you</td></tr>
<tr><td>Composability</td><td>Manual list of predicates, joined by hand</td><td><code>.and()</code> / <code>.or()</code> / <code>.not()</code>, nulls skipped</td></tr>
<tr><td>Pagination</td><td>Write the COUNT query separately and keep it in sync</td><td><code>findAll(spec, pageable)</code></td></tr>
<tr><td>Type safety</td><td>Same string-or-metamodel choice</td><td>Same string-or-metamodel choice</td></tr>
<tr><td>Reuse across queries</td><td>None - it is one method body</td><td>Each predicate is a named, testable static method</td></tr>
<tr><td>Reach for it when</td><td>Building the query structure itself is dynamic - dynamic SELECT, dynamic grouping, subqueries</td><td>The structure is fixed and only the WHERE varies</td></tr>
</table>
<br>
The honest summary: raw Criteria is verbose enough that teams avoid it, then reach for string concatenation into
JPQL - which is how SQL injection gets into an ORM-based application. Specifications keep the safety and remove
most of the verbosity. Where the query structure genuinely varies, jOOQ or QueryDSL are more pleasant than either.<br>`,
            codeExamples: [
                `// The same search, written directly against the Criteria API
@Repository
public class EmployeeCriteriaRepository {

    @PersistenceContext
    private EntityManager em;

    public List<Employee> search(String city, String namePart, Double minSalary) {

        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Employee> cq = cb.createQuery(Employee.class);
        Root<Employee> root = cq.from(Employee.class);

        List<Predicate> predicates = new ArrayList<>();
        if (city != null) {
            predicates.add(cb.equal(root.get("city"), city));
        }
        if (namePart != null) {
            predicates.add(cb.like(cb.lower(root.get("name")),
                                   "%" + namePart.toLowerCase() + "%"));
        }
        if (minSalary != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("salary"), minSalary));
        }

        cq.where(cb.and(predicates.toArray(new Predicate[0])));
        cq.orderBy(cb.desc(root.get("salary")));

        return em.createQuery(cq).getResultList();
    }
    // And for a Page you must ALSO write, and maintain in lockstep:
    //   CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
    //   Root<Employee> countRoot = countQuery.from(Employee.class);
    //   countQuery.select(cb.count(countRoot)).where(/* the same predicates,
    //   rebuilt against countRoot because a Root cannot be shared */);
}
// That last comment is the real cost: the predicates must be built
// twice, against two different Roots. Specifications do it for you.`,
                `// Type-safe field names via the generated JPA metamodel
// build.gradle: annotationProcessor 'org.hibernate.orm:hibernate-jpamodelgen'
// pom.xml: the same artifact in maven-compiler-plugin's annotationProcessorPaths

public static Specification<Employee> cityIs(String city) {
    return (root, q, cb) -> city == null ? null
            : cb.equal(root.get(Employee_.city), city);   // not "city"
}
// Rename Employee.city to Employee.location and this line fails to
// COMPILE. The string version fails at runtime with:
//   java.lang.IllegalArgumentException:
//   Unable to locate Attribute with the given name [city] on this ManagedType`,
                `// distinct and the join-duplication trap in specifications
public static Specification<Employee> hasSkill(String skill) {
    return (root, query, cb) -> {
        if (skill == null) return null;
        // A join to a collection multiplies rows - one per matching skill.
        query.distinct(true);
        return cb.equal(root.join("skills").get("name"), skill);
    };
}
// WITHOUT query.distinct(true):
//   an employee with 3 skills appears 3 times in the page,
//   and page.getTotalElements() counts them 3 times too.
//
// But distinct(true) is also applied to the COUNT query by Spring Data,
// which is what you want here - and is a common source of confusion
// when the totals suddenly change after adding a filter.`
            ]
        },

        {
            content: `<h3><code>@EntityGraph</code> vs <code>join fetch</code></h3>
Both solve N+1 by loading associations in the same query. They differ in where the decision lives and in what they
can express.<br><br>

<table>
<tr><th></th><th>join fetch</th><th>@EntityGraph</th></tr>
<tr><td>Expressed in</td><td>The JPQL string</td><td>An annotation, or a named graph on the entity</td></tr>
<tr><td>Works on derived query methods</td><td>No - requires <code>@Query</code></td><td>Yes - annotate <code>findAll()</code> or any derived method</td></tr>
<tr><td>Join type</td><td>Whatever you write - inner or left</td><td>Always a LEFT OUTER JOIN</td></tr>
<tr><td>Can add a WHERE on the fetched side</td><td>Yes (with care - it filters the collection)</td><td>No</td></tr>
<tr><td>Reusable across methods</td><td>No</td><td>Yes, via <code>@NamedEntityGraph</code></td></tr>
<tr><td>Same collection-pagination problem</td><td>Yes</td><td>Yes - identical HHH000104 behaviour</td></tr>
</table>
<br>
The <strong>FETCH vs LOAD</strong> distinction is the part usually missed. <code>EntityGraphType.FETCH</code>
(the default) treats every attribute <em>not</em> in the graph as LAZY, overriding the entity's mapping.
<code>EntityGraphType.LOAD</code> loads the graph's attributes eagerly and leaves everything else at its declared
fetch type. If a mapping is <code>EAGER</code> and a FETCH graph omits it, that association becomes lazy for that
query - which surprises people.<br><br>

<div class="border">
<strong>The rule that avoids all of this:</strong> map every association <code>LAZY</code>, then declare eagerness
per query with <code>join fetch</code> or <code>@EntityGraph</code>. Fetch strategy is a property of the use case,
never of the entity.<br>
</div><br>

Neither fixes the multi-collection problem: fetching two collections in one query is a cartesian product, and
Hibernate 6 will reject it with <code>MultipleBagFetchException</code> if both are <code>List</code>. Use
<code>Set</code>, or split into two queries and let the persistence context stitch them together.<br>`,
            codeExamples: [
                `// @EntityGraph on a derived method - impossible with join fetch
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    @EntityGraph(attributePaths = {"employees"})
    List<Department> findByNameContaining(String part);

    // Nested paths, two levels deep
    @EntityGraph(attributePaths = {"employees", "employees.address"})
    Optional<Department> findById(Long id);

    // LOAD vs FETCH
    @EntityGraph(attributePaths = {"employees"}, type = EntityGraphType.LOAD)
    List<Department> findAll();
}
// OUTPUT - one LEFT OUTER JOIN, no N+1:
// select d.*, e.* from department d
//   left outer join employee e on d.id = e.dept_id
//   where d.name like ?`,
                `// A named graph, declared once and reused
@Entity
@NamedEntityGraph(
    name = "Department.withEmployeesAndCourses",
    attributeNodes = {
        @NamedAttributeNode("employees"),
        @NamedAttributeNode(value = "courses", subgraph = "course-detail")
    },
    subgraphs = @NamedSubgraph(
        name = "course-detail",
        attributeNodes = @NamedAttributeNode("instructor"))
)
public class Department { /* ... */ }

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    @EntityGraph("Department.withEmployeesAndCourses")
    Optional<Department> findWithDetailById(Long id);
}
// OUTPUT with employees and courses both List:
// org.hibernate.loader.MultipleBagFetchException:
//   cannot simultaneously fetch multiple bags:
//   [com.velocity.model.Department.employees,
//    com.velocity.model.Department.courses]
//
// FIX 1: declare both as Set<> instead of List<>. Legal, but now
//        produces a cartesian product: 5 employees x 4 courses = 20 rows.
// FIX 2 (better): two queries against the same persistence context.`,
                `// Two queries, no cartesian product, still no N+1
@Transactional(readOnly = true)
public Department loadFully(Long id) {

    Department d = repo.findWithEmployeesById(id).orElseThrow();
    repo.findWithCoursesById(id);      // same entity, same persistence context

    return d;   // both collections are now initialised on the SAME instance
}
// OUTPUT:
// select d.*, e.* from department d left join employee e ...   (6 rows)
// select d.*, c.* from department d left join course   c ...   (5 rows)
// 11 rows total instead of 20, and it stays linear as the data grows.
//
// This works because the persistence context guarantees ONE instance
// per (entity, id) - the second query populates the collection on the
// object the first query already returned.`,
                `// The subtlety with a WHERE on a fetched collection
@Query("select d from Department d join fetch d.employees e "
     + "where e.status = 'ACTIVE'")
List<Department> activeOnly();
// This does NOT mean "departments that have active employees, with
// all their employees". It means the FETCHED COLLECTION contains only
// the active ones - a partially-populated collection.
//
// If that entity is then modified and flushed, Hibernate can delete
// the employees that were filtered out of the collection. Never
// filter a join-fetched collection on an entity you intend to write.
// Use a projection instead.`
            ]
        },

        {
            content: `<h3>Persistence Context Mechanics Worth Knowing</h3>
<table>
<tr><th>Behaviour</th><th>What it means in practice</th></tr>
<tr><td><strong>First-level cache</strong></td><td>Two <code>findById(1L)</code> calls in one transaction issue ONE select and return the identical object reference. <code>==</code> is true. This cache is not optional and cannot be disabled.</td></tr>
<tr><td><strong>Repeatable reads within the context</strong></td><td>If another transaction changed the row after your first read, your second <code>findById</code> still returns the OLD state - it never reaches the database. <code>em.refresh()</code> is the only way back.</td></tr>
<tr><td><strong>Write-behind</strong></td><td>Statements are queued and issued at flush, not at the setter. This lets Hibernate batch and reorder them, and is why the SQL log order rarely matches the code order.</td></tr>
<tr><td><strong>Bulk updates bypass it</strong></td><td>A <code>@Modifying</code> JPQL update goes straight to the database. Entities already loaded are now stale. Always use <code>clearAutomatically = true</code>.</td></tr>
<tr><td><strong>getReferenceById returns a proxy</strong></td><td>No SELECT is issued. Ideal for setting a foreign key without loading the parent - but touching any field outside a transaction gives <code>LazyInitializationException</code>, and a missing id gives <code>EntityNotFoundException</code> later, not immediately.</td></tr>
<tr><td><strong>Size matters</strong></td><td>Every managed entity is dirty-checked at every flush. Loading 200,000 rows in one transaction makes each flush O(200,000). Batch jobs must <code>clear()</code> periodically.</td></tr>
</table>`,
            codeExamples: [
                `@Transactional
public void firstLevelCache() {
    Employee a = repo.findById(1L).orElseThrow();
    Employee b = repo.findById(1L).orElseThrow();

    System.out.println(a == b);          // true - the SAME object
    // OUTPUT SQL: exactly ONE select, not two.

    // Someone else commits an update to row 1 right now...
    Employee c = repo.findById(1L).orElseThrow();
    System.out.println(c.getName());     // still the OLD name
    // The context never asked the database again.

    em.refresh(a);                       // force a re-read
    System.out.println(a.getName());     // now the new name
}`,
                `// getReferenceById: setting an FK without loading the parent
@Transactional
public void assign(Long empId, Long deptId) {
    Employee e = repo.findById(empId).orElseThrow();

    // No select on department - just a proxy holding the id.
    e.setDepartment(departmentRepository.getReferenceById(deptId));
}
// OUTPUT:
// select ... from employee where id=?
// update employee set dept_id=? where id=?
// -> two statements. findById would have made it three.
//
// If deptId does not exist, the failure surfaces later as either
// EntityNotFoundException on first access, or a foreign-key
// violation at flush - not as an empty Optional.`,
                `// Batch processing: clear the context or run out of heap
@Transactional
public void reindexAll() {
    int batchSize = 500;
    int i = 0;

    try (Stream<Employee> stream = repo.streamAll()) {
        for (Iterator<Employee> it = stream.iterator(); it.hasNext(); ) {
            Employee e = it.next();
            e.setSearchKey(buildKey(e));

            if (++i % batchSize == 0) {
                em.flush();      // write this batch
                em.clear();      // detach it - stop dirty-checking it
            }
        }
    }
}
// application.properties for this to actually batch:
// spring.jpa.properties.hibernate.jdbc.batch_size=500
// spring.jpa.properties.hibernate.order_inserts=true
// spring.jpa.properties.hibernate.order_updates=true
//
// WITHOUT flush/clear on 200k rows:
// java.lang.OutOfMemoryError: Java heap space
// and, before that, each flush walking 200,000 snapshots.`
            ]
        },

        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Why is <code>@Enumerated(EnumType.ORDINAL)</code> dangerous?</td><td>It stores the enum's declaration position. Inserting or reordering a constant silently changes the meaning of every existing row - no exception, no failing test, and no way to repair it afterwards. Always use <code>STRING</code>.</td></tr>
<tr><td>What does <code>@Transient</code> do, and how is it different from Java's <code>transient</code>?</td><td><code>@Transient</code> excludes a field from the database mapping only. The keyword excludes it from Java serialization and, as a side effect, from JPA too. Use the annotation.</td></tr>
<tr><td>Why must a lifecycle callback never call a repository?</td><td>It runs in the middle of a flush. Issuing another query there gives undefined behaviour - typically <code>ConcurrentModificationException</code> or a silently lost write. Publish a domain event and act after commit.</td></tr>
<tr><td>My <code>@CreatedDate</code> columns are all null. Why?</td><td><code>@EnableJpaAuditing</code> is missing, or the entity lacks <code>@EntityListeners(AuditingEntityListener.class)</code>. The annotations compile happily and do nothing without both.</td></tr>
<tr><td>Why does <code>AuditorAware</code> return an <code>Optional</code>?</td><td>Because there is often no current user - startup seeding, scheduled jobs, async threads. Empty means "leave the column null" rather than throwing.</td></tr>
<tr><td>An entity is loaded in a <code>@Transactional</code> method and a setter is called, with no <code>save()</code>. Is it written?</td><td>Yes. The entity is managed, and at flush Hibernate compares it to the snapshot taken at load and issues an UPDATE for the changed fields. This is dirty checking.</td></tr>
<tr><td>The same code without <code>@Transactional</code>?</td><td>Nothing is written. The entity is detached the moment the repository's own short transaction ends, so nothing tracks the change.</td></tr>
<tr><td>What is the lost-update problem?</td><td>Two transactions read the same row, both compute a new value from it, and both write. The second overwrites the first, no error is raised, and one user's change is gone.</td></tr>
<tr><td>How does <code>@Version</code> prevent it?</td><td>The version is appended to the UPDATE's WHERE clause and incremented. The second writer's UPDATE matches zero rows; Hibernate sees the row count and throws <code>OptimisticLockException</code> / <code>ObjectOptimisticLockingFailureException</code>.</td></tr>
<tr><td>What HTTP status suits an optimistic lock failure?</td><td>409 Conflict, with a message telling the user to reload. The version must round-trip through the DTO or an ETag, or the check is bypassed entirely.</td></tr>
<tr><td>When is pessimistic locking the right choice?</td><td>When the read-modify-write must be atomic and conflicts are frequent enough that optimistic retries become livelock - stock decrements under heavy traffic, ledger postings, job claiming.</td></tr>
<tr><td>What are the two risks of <code>PESSIMISTIC_WRITE</code>?</td><td>Deadlock, when two transactions take the same locks in opposite orders - prevented by always locking in ascending id order; and lock queueing, which exhausts the connection pool and takes down the whole application, not just one endpoint.</td></tr>
<tr><td>How is a <code>Specification</code> related to the Criteria API?</td><td>It is a composable wrapper over it. <code>toPredicate</code> receives the same <code>Root</code>, <code>CriteriaQuery</code> and <code>CriteriaBuilder</code>; the gain is reusable named predicates, null-skipping composition, and a count query you do not have to write twice.</td></tr>
<tr><td><code>@EntityGraph</code> versus <code>join fetch</code>?</td><td>Same SQL goal. <code>@EntityGraph</code> works on derived methods, is reusable as a named graph, and is always a LEFT OUTER JOIN; <code>join fetch</code> lets you choose the join type and add conditions. Both paginate collections in memory.</td></tr>
</table>`
        }
    ]
};
