import { Topic } from '../coreJava';

export const springDataJpa: Topic = {
    id: 'spring-data-jpa',
    name: 'Spring Data JPA',
    beginner: [
        {
            content: `Spring Data JPA is a part of the larger Spring Data family that makes it easy to work with relational
databases in a Spring application. <br><br>
It sits on top of JPA (Java Persistence API) and Hibernate (the most common JPA implementation) and removes almost
all of the boilerplate code (DAO classes, SQL statements, ResultSet mapping) that we normally have to write when
talking to a database. <br><br>

The two building blocks we start with are: <br>
• <strong>@Entity</strong> - a plain Java class that represents a database table. <br>
• <strong>Repository interface</strong> - an interface that gives us ready-made methods to save, read, update and
delete rows for that table, without writing any implementation ourselves.`
        },

        {
            content: `<h3>1. What is an @Entity class?</h3>
An <strong>@Entity</strong> class is a normal Java (POJO) class annotated with <code>@Entity</code> so that JPA
knows this class should be mapped to a database table. <br><br>
• Each object (instance) of the entity class represents one row of the table. <br>
• Each field of the class represents one column of the table. <br>
• <code>@Id</code> marks the field that is the primary key. <br>
• <code>@GeneratedValue</code> tells JPA/Hibernate to auto-generate the primary key value (like an auto-increment
column). <br><br>

Below is a simple <code>Employee</code> entity that maps to an <code>employee</code> table: <br>`,
            codeExamples: [`import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity // Tells JPA: this class maps to a database table
public class Employee {

    @Id // Primary key of the table
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-generated value
    private Long id;

    private String name;
    private String emailAddress;
    private double salary;

    // Getters and setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmailAddress() { return emailAddress; }
    public void setEmailAddress(String emailAddress) { this.emailAddress = emailAddress; }
    public double getSalary() { return salary; }
    public void setSalary(double salary) { this.salary = salary; }
}
// OUTPUT (behavior):
// Hibernate auto-creates/uses a table named "employee" with columns:
// id (PK, auto-increment), name, email_address, salary`]
        },

        {
            content: `<h3>2. What does JpaRepository give you for free?</h3>
Instead of writing a DAO class with hand-written SQL for every operation, we simply create an interface that
extends <code>JpaRepository&lt;T, ID&gt;</code>, where <code>T</code> is the entity type and <code>ID</code> is the
type of its primary key. <br><br>
Spring Data JPA automatically generates the implementation at runtime (we never write a class body), and we
instantly get methods like: <br>
• <code>save(entity)</code> - insert or update a row <br>
• <code>findById(id)</code> - fetch a single row by primary key <br>
• <code>findAll()</code> - fetch all rows <br>
• <code>deleteById(id)</code> / <code>delete(entity)</code> - remove a row <br>
• <code>count()</code> - count total rows <br><br>

No implementation class is needed - Spring creates a proxy for this interface behind the scenes. <br>`,
            codeExamples: [`import org.springframework.data.jpa.repository.JpaRepository;

// No implementation needed - Spring Data JPA generates it at runtime
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // save(), findById(), findAll(), deleteById() etc. are already available
}
// OUTPUT (behavior):
// EmployeeRepository can be @Autowired anywhere and used directly:
// employeeRepository.save(emp);
// employeeRepository.findAll();
// -> Spring Boot supplies a working implementation automatically`]
        },

        {
            content: `<h3>3. Derived Query Methods</h3>
Spring Data JPA can generate the SQL/JPQL query automatically just by reading the <strong>name</strong> of a method
we declare in the repository interface - this is called a "derived query method". <br><br>
For example, a method named <code>findByEmailAddress(String email)</code> is parsed by Spring Data as: <br>
"find" + "By" + "EmailAddress" -> generate a query that filters the <code>Employee</code> table where the
<code>emailAddress</code> column equals the given parameter. <br><br>
We only declare the method signature - Spring Data writes the query for us behind the scenes (roughly equivalent
to <code>SELECT * FROM employee WHERE email_address = ?</code>). <br>`,
            codeExamples: [`public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Method name is parsed word by word: findBy + EmailAddress
    Employee findByEmailAddress(String emailAddress);

    // A few more examples of the same naming pattern:
    // findByName(String name)                 -> WHERE name = ?
    // findByNameAndSalary(String n, double s)  -> WHERE name = ? AND salary = ?
    // findBySalaryGreaterThan(double amount)   -> WHERE salary > ?
}
// OUTPUT (behavior):
// employeeRepository.findByEmailAddress("john@company.com")
// -> Spring Data generates & runs:
// SELECT * FROM employee WHERE email_address = 'john@company.com'`]
        },

        {
            content: `<h3>4. Saving and Retrieving an Entity - Full Demo</h3>
Putting it together: we create an <code>Employee</code> object, save it using the repository, and then read it back
using <code>findById</code> - all without writing a single line of SQL. <br>`,
            codeExamples: [`import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component
public class EmployeeDemo implements CommandLineRunner {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public void run(String... args) {
        // 1. Create and save a new Employee
        Employee emp = new Employee();
        emp.setName("Jiva Doe");
        emp.setEmailAddress("john@company.com");
        emp.setSalary(55000);
        employeeRepository.save(emp); // INSERT happens here

        // 2. Retrieve it back by its generated id
        Optional<Employee> found = employeeRepository.findById(emp.getId());
        found.ifPresent(e -> System.out.println("Fetched: " + e.getName()));
    }
}
// OUTPUT:
// Fetched: Jiva Doe`]
        }
    ],

    expert: [
        {
            content: `<h3>Entity Relationship Mapping - @OneToMany / @ManyToOne</h3>
Real applications rarely have a single isolated table - entities relate to each other. The most common relationship
is <strong>one-to-many</strong> (one <code>Department</code> has many <code>Employee</code>s) which, from the
other side, is a <strong>many-to-one</strong> (many <code>Employee</code>s belong to one <code>Department</code>). <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
   DEPARTMENT (1)                 EMPLOYEE (N)
   +----+----------+        +----+--------+---------------+
   | id | name     |        | id | name   | department_id |  (FK)
   +----+----------+        +----+--------+---------------+
   | 1  | Engg     |  <----  | 1  | Jiva   |      1        |
   |    |          |  <----  | 2  | Anaji  |      1        |
   +----+----------+         +----+--------+---------------+

   Department.employees  ------ @OneToMany (mappedBy = "department") ------>
   Employee.department   <----- @ManyToOne (owning side, has FK column) -----
</pre>

The <code>@ManyToOne</code> side is always the "owning" side because it physically holds the foreign key column
(<code>department_id</code>). The <code>@OneToMany</code> side uses <code>mappedBy</code> to say "I don't own the
foreign key, look at the field named 'department' on the Employee entity for it". <br>`,
            codeExamples: [`@Entity
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Inverse side - does NOT create a column, just navigable in Java
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Employee> employees = new ArrayList<>();
}`, `@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // Owning side - creates the "department_id" foreign key column
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
}
// OUTPUT (behavior):
// department.getEmployees() -> List of Employees in that department
// employee.getDepartment()  -> the single Department that employee belongs to`]
        },

        {
            content: `<h3>Lazy vs Eager Fetching</h3>
Every association (<code>@OneToMany</code>, <code>@ManyToOne</code>, <code>@ManyToMany</code>,
<code>@OneToOne</code>) has a <strong>fetch type</strong> that decides WHEN the related data is loaded from the
database. <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Fetch Type</th><th>Behavior</th><th>Default for</th></tr>
<tr class='text-center'><td>FetchType.EAGER</td><td>Related data is loaded immediately, in the same query/session, whether you need it or not</td><td>@ManyToOne, @OneToOne</td></tr>
<tr class='text-center'><td>FetchType.LAZY</td><td>Related data is loaded only when you actually access it (a proxy is returned initially)</td><td>@OneToMany, @ManyToMany</td></tr>
</table>
<br>

<h3>The Classic LazyInitializationException Trap</h3>
When a field is <code>LAZY</code>, Hibernate returns a proxy object instead of the real data. The proxy can only be
"filled in" while the original Hibernate <code>Session</code> (JPA persistence context) is still open. If you try to
access a lazy field <strong>after</strong> the session has closed (for example, after the
<code>@Transactional</code> service method has already returned and the entity is being serialized to JSON in the
controller), Hibernate throws <code>LazyInitializationException: could not initialize proxy - no Session</code>. <br>`,
            codeExamples: [`@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    // NOT @Transactional -> session/persistence-context closes as soon as
    // this method returns
    public Department getDepartment(Long id) {
        return departmentRepository.findById(id).orElseThrow();
    }
}

// In the controller / caller:
Department dept = departmentService.getDepartment(1L);
dept.getEmployees().size();
// THROWS: org.hibernate.LazyInitializationException:
// failed to lazily initialize a collection: could not initialize proxy
// - no Session
//
// FIXES:
// 1. Access dept.getEmployees() INSIDE a @Transactional method
// 2. Use JOIN FETCH / @EntityGraph to load employees eagerly for this query
// 3. Use a DTO projection so the lazy field is never touched later`]
        },

        {
            content: `<h3>Custom Queries: @Query (JPQL) vs Native SQL</h3>
Derived query methods work well for simple filters, but for anything complex (joins, aggregations, subqueries) we
write the query explicitly using <code>@Query</code>. <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>JPQL (@Query, default)</th><th>Native SQL (@Query(nativeQuery = true))</th></tr>
<tr class='text-center'><td>Operates on</td><td>Entity names & fields (Employee, name)</td><td>Actual table & column names (employee, name)</td></tr>
<tr class='text-center'><td>Database portability</td><td>Portable across databases</td><td>Tied to the specific database's SQL dialect</td></tr>
<tr class='text-center'><td>Can use DB-specific functions</td><td>No</td><td>Yes</td></tr>
<tr class='text-center'><td>Return type mapping</td><td>Automatically maps to entity</td><td>May need manual mapping for complex results</td></tr>
</table>
<br>`,
            codeExamples: [`public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // JPQL - written against the Entity and its fields, not the raw table
    @Query("SELECT e FROM Employee e WHERE e.salary > :minSalary")
    List<Employee> findHighEarners(@Param("minSalary") double minSalary);

    // Native SQL - written against the actual table/column names
    @Query(value = "SELECT * FROM employee WHERE salary > :minSalary", nativeQuery = true)
    List<Employee> findHighEarnersNative(@Param("minSalary") double minSalary);
}
// OUTPUT (behavior):
// findHighEarners(50000) -> JPQL translated to SQL by Hibernate at runtime
// findHighEarnersNative(50000) -> SQL sent to the database exactly as written`]
        },

        {
            content: `<h3>Pagination and Sorting with Pageable</h3>
Fetching an entire table into memory does not scale. Spring Data JPA lets any repository method accept a
<code>Pageable</code> parameter to fetch results page by page, optionally sorted. <br>`,
            codeExamples: [`public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // JpaRepository already provides:
    // Page<Employee> findAll(Pageable pageable);

    Page<Employee> findByDepartmentName(String deptName, Pageable pageable);
}

// Usage:
Pageable pageable = PageRequest.of(0, 10, Sort.by("salary").descending());
// page number 0 (first page), page size 10, sorted by salary DESC

Page<Employee> page = employeeRepository.findAll(pageable);

System.out.println("Total employees: " + page.getTotalElements());
System.out.println("Total pages: " + page.getTotalPages());
page.getContent().forEach(e -> System.out.println(e.getName() + " - " + e.getSalary()));
// OUTPUT (behavior):
// Total employees: 42
// Total pages: 5
// -> Only 10 Employee rows are actually loaded from the DB for this page,
//    already ordered by salary descending (SQL uses LIMIT/OFFSET + ORDER BY)`]
        },

        {
            content: `<h3>The N+1 Select Problem</h3>
The N+1 problem happens when you fetch a list of N parent entities (1 query), and then, for each parent, a lazy
association is accessed separately (N more queries) - resulting in N+1 total queries instead of 1. <br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">
BEFORE (N+1 problem):
  1 query  -> SELECT * FROM department                     (returns 3 rows)
  +3 query -> SELECT * FROM employee WHERE department_id=1
  +3 query -> SELECT * FROM employee WHERE department_id=2
  +3 query -> SELECT * FROM employee WHERE department_id=3
  ---------------------------------------------------------
  TOTAL: 1 + 3 = 4 queries just to print 3 departments and their employees

AFTER (JOIN FETCH / @EntityGraph):
  1 query  -> SELECT d.*, e.* FROM department d
              JOIN employee e ON e.department_id = d.id
  ---------------------------------------------------------
  TOTAL: 1 query, employees loaded together with departments
</pre>

Cause: iterating over a list of parents and, inside the loop, touching a <code>LAZY</code> collection/association
that was never fetched up front - each access triggers its own SELECT. <br><br>

Fix option 1 - <code>JOIN FETCH</code> in JPQL: <br>
Fix option 2 - <code>@EntityGraph</code> which tells Spring Data JPA to eagerly fetch specific associations for
that particular query, without changing the entity's default fetch type globally. <br>`,
            codeExamples: [`public interface DepartmentRepository extends JpaRepository<Department, Long> {

    // FIX 1: JOIN FETCH - single query, employees loaded eagerly for this call only
    @Query("SELECT DISTINCT d FROM Department d JOIN FETCH d.employees")
    List<Department> findAllWithEmployeesJoinFetch();

    // FIX 2: @EntityGraph - same effect, declarative style
    @EntityGraph(attributePaths = {"employees"})
    List<Department> findAll();
}
// OUTPUT (behavior):
// Both methods produce exactly ONE SQL query with a JOIN, instead of
// 1 query for departments + 1 query per department for its employees`]
        },

        {
            content: `<h3>@Transactional and Spring Data JPA</h3>
<code>@Transactional</code> wraps a method in a database transaction and keeps the JPA persistence context (the
"session") open for the duration of that method. <br><br>

<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Scenario</th><th>Need @Transactional?</th><th>Why</th></tr>
<tr class='text-center'><td>Single save() / findById() call</td><td>Not required</td><td>Each repository method already runs in its own short transaction by default</td></tr>
<tr class='text-center'><td>Multiple repository calls that must all succeed or all fail together</td><td>Required</td><td>Ensures atomicity - a failure rolls back every change made so far in that method</td></tr>
<tr class='text-center'><td>Accessing a LAZY association after the initial fetch</td><td>Required</td><td>Keeps the persistence context/session open so the lazy proxy can still be initialized</td></tr>
<tr class='text-center'><td>Read-only reporting queries</td><td>Recommended: @Transactional(readOnly = true)</td><td>Lets Hibernate skip dirty-checking, improving performance</td></tr>
</table>
<br>`,
            codeExamples: [`@Service
public class PayrollService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Transactional // all-or-nothing: both saves succeed, or both are rolled back
    public void transferEmployee(Long empId, Long newDeptId) {
        Employee emp = employeeRepository.findById(empId).orElseThrow();
        Department newDept = departmentRepository.findById(newDeptId).orElseThrow();

        emp.setDepartment(newDept);
        employeeRepository.save(emp);

        if (newDept.getEmployees().size() > 50) {
            throw new IllegalStateException("Department is full");
            // Exception here rolls back the save() above too
        }
    }
}
// OUTPUT (behavior):
// If IllegalStateException is thrown, the emp.setDepartment() change is
// rolled back - the database is left exactly as it was before the call`]
        },

        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is the difference between JpaRepository, CrudRepository and PagingAndSortingRepository?</td><td>CrudRepository has basic CRUD methods; PagingAndSortingRepository adds pagination/sorting on top of it; JpaRepository extends both and adds JPA-specific batch operations like flush(), saveAndFlush(), and deleteAllInBatch()</td></tr>
<tr><td>How does Spring Data JPA generate SQL from a method like findByNameAndSalaryGreaterThan?</td><td>It parses the method name into a keyword tree (find/By/And/GreaterThan etc.), maps each token to an entity field or operator, and builds the equivalent JPQL/SQL query at application startup, not at runtime per call</td></tr>
<tr><td>What causes a LazyInitializationException and how do you fix it?</td><td>Accessing a LAZY-fetched field/collection after the persistence context (Hibernate session) has already closed; fix by accessing it inside a @Transactional method, using JOIN FETCH/@EntityGraph, or mapping to a DTO before the session closes</td></tr>
<tr><td>Why is @ManyToOne the "owning side" of a relationship?</td><td>Because it holds the physical foreign key column in its table; the @OneToMany side uses mappedBy to point to that owning field and does not itself create a column</td></tr>
<tr><td>What is the N+1 select problem and how do you solve it?</td><td>Fetching a list of parent entities (1 query) and then lazily loading a related collection/entity separately for each parent (N queries); solved with JOIN FETCH in JPQL or @EntityGraph to load associations in a single query</td></tr>
<tr><td>What is the difference between JPQL and native queries in @Query?</td><td>JPQL operates on entity names/fields and is database-portable, translated to SQL by Hibernate; native queries are written in the actual database's SQL dialect using real table/column names and can use DB-specific functions</td></tr>
<tr><td>How does Pageable/PageRequest avoid loading the whole table?</td><td>Spring Data JPA translates it into a SQL query using LIMIT/OFFSET (or the equivalent) plus ORDER BY, so only the requested page of rows is ever fetched from the database</td></tr>
<tr><td>When is @Transactional actually required with Spring Data JPA?</td><td>When multiple repository operations must succeed or fail together (atomicity), or when a LAZY association needs to be accessed after the initial query, keeping the persistence context open</td></tr>
<tr><td>What does cascade = CascadeType.ALL do on a @OneToMany mapping?</td><td>It propagates persist/merge/remove/refresh/detach operations performed on the parent entity to its related child entities automatically, e.g. saving a Department also saves its new Employees</td></tr>
<tr><td>Why is EAGER fetching risky as a default on associations?</td><td>It loads related data on every query whether needed or not, which can silently cause large joins, extra queries, and performance problems as the object graph grows - LAZY plus explicit JOIN FETCH/@EntityGraph is generally the safer default</td></tr>
</table>`
        }
    ]
};
