import { Topic } from '../coreJava';

export const springBootJoinQueries: Topic = {
    id: 'spring-boot-join-queries',
    name: 'Join Queries & DTO Projection',
    beginner: [
        {
            content: `<h3>Two-Table Join Operation</h3>
<strong>Business requirement:</strong> you have two tables and want to fetch data from both. In that case we go with the join approach.<br><br>

<strong>Problem statement:</strong> design the REST API to return this response, built from two tables:<br><br>

<div class="border">
empDept &nbsp;•&nbsp; empDeptDesc &nbsp;•&nbsp; empName &nbsp;•&nbsp; empEmail &nbsp;•&nbsp; empAddress
</div><br>

<h3>Table structure</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  EMPLOYEE TABLE            M        1        DEPARTMENT TABLE
 +---------------+        <-------->        +-----------------+
 | id       (PK) |                          | id         (PK) |
 | name          |                          | name            |
 | email         |                          | description     |
 | address       |                          +-----------------+
 | dept_id  (FK) |
 +---------------+</pre>
<br>
Notice that the five fields we want come from <em>both</em> tables and match <em>neither</em> entity. That is what a <strong>DTO</strong> is for: a class shaped like the answer rather than like a table.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>`,
                `// Step 3 - Employee.java  (the MANY side, owns dept_id)
package com.velocity.model;

import javax.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;

    @Column(name = "address")
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private Department department;

    // getters and setters
}`,
                `// Step 3 - Department.java  (the ONE side, inverse)
package com.velocity.model;

import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

@Entity
@Table(name = "department")
public class Department {

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    private String description;

    // mappedBy names the "department" FIELD on Employee.
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private Set<Employee> employees = new HashSet<>();

    // getters and setters
}
// COMMON ERROR: writing mappedBy = "id". mappedBy must name the
// association field that owns the foreign key, which is "department".
// Using "id" fails at startup:
//   mappedBy reference an unknown target entity property:
//   com.velocity.model.Employee.id is not an association`
            ]
        },
        {
            content: `<h3>Step 4 - The DTO Class</h3>
The DTO holds exactly the five fields the response needs. Its <strong>constructor</strong> is what the query calls, so the parameter order must match the SELECT list exactly.<br>`,
            codeExamples: [
                `package com.velocity.dto;

public class DeptEmpDto {

    private String empDept;
    private String empDeptDesc;
    private String empName;
    private String empEmail;
    private String empAddress;

    // The constructor the JPQL "select new" clause will call.
    // Parameter ORDER and TYPES must match the select list.
    public DeptEmpDto(String empDept, String empDeptDesc, String empName,
                      String empEmail, String empAddress) {
        this.empDept     = empDept;
        this.empDeptDesc = empDeptDesc;
        this.empName     = empName;
        this.empEmail    = empEmail;
        this.empAddress  = empAddress;
    }

    // getters and setters

    @Override
    public String toString() {
        return "DeptEmpDto [empDept=" + empDept + ", empDeptDesc=" + empDeptDesc
             + ", empName=" + empName + ", empEmail=" + empEmail
             + ", empAddress=" + empAddress + "]";
    }
}`
            ]
        },
        {
            content: `<h3>Step 7 - The Repository: <code>select new</code></h3>
This is the key line of the whole topic. JPQL's <code>select new</code> constructs a DTO per result row, so the query returns <code>List&lt;DeptEmpDto&gt;</code> directly - no manual mapping, and only the five needed columns are fetched.<br><br>

<table>
<tr><th>Part</th><th>Meaning</th></tr>
<tr><td><code>select new com.velocity.dto.DeptEmpDto(...)</code></td><td>The <strong>fully qualified</strong> class name. A short name will not resolve.</td></tr>
<tr><td><code>FROM Department d INNER JOIN d.employees e</code></td><td>Joins through the <em>mapped association</em>, so no ON clause is needed - JPA already knows the foreign key.</td></tr>
<tr><td><code>d.name, d.description, e.name, e.email, e.address</code></td><td>Five values, matching the five constructor parameters in order.</td></tr>
</table>`,
            codeExamples: [
                `package com.velocity.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.velocity.dto.DeptEmpDto;
import com.velocity.model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("SELECT new com.velocity.dto.DeptEmpDto("
         + "  d.name, d.description, e.name, e.email, e.address) "
         + "FROM Department d INNER JOIN d.employees e")
    List<DeptEmpDto> fetchEmpDeptDataInnerJoin();
}
// "d.employees" is the mapped @OneToMany collection, so JPA writes
// the ON clause itself. Compare this with raw SQL, where you would
// have to write "ON e.dept_id = d.id" and get it right yourself.`,
                `// Step 5 & 6 - Service and implementation
public interface EmployeeService {
    List<DeptEmpDto> getDeptEmployeesInnerJoin();
}

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public List<DeptEmpDto> getDeptEmployeesInnerJoin() {
        List<DeptEmpDto> list = employeeRepository.fetchEmpDeptDataInnerJoin();
        list.forEach(System.out::println);
        return list;
    }
}`,
                `// Step 8 - Rest Controller
@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/dept/employees/inner")
    public ResponseEntity<List<DeptEmpDto>> getDeptEmployeesInnerJoin() {
        return new ResponseEntity<>(employeeService.getDeptEmployeesInnerJoin(),
                                    HttpStatus.OK);
    }
}`,
                `// GET http://localhost:8181/dept/employees/inner
// RESPONSE (200 OK)
[
    {
        "empDept": "Engineering",
        "empDeptDesc": "Product development team",
        "empName": "ajay",
        "empEmail": "ajay@gmail.com",
        "empAddress": "M G Road, pune"
    },
    {
        "empDept": "Engineering",
        "empDeptDesc": "Product development team",
        "empName": "sohan",
        "empEmail": "sohan@gmail.com",
        "empAddress": "FC Road, pune"
    }
]

// CONSOLE - one query, five columns:
// Hibernate: select department0_.name, department0_.description,
//                   employees1_.name, employees1_.email, employees1_.address
//            from department department0_
//            inner join employee employees1_ on department0_.id = employees1_.dept_id`
            ]
        },
        {
            content: `<h3>Three-Table Join Operation</h3>
<strong>Business requirement:</strong> fetch data from three tables.<br><br>
<strong>Problem statement:</strong> return empDept, empDeptDesc, empName, empEmail, empAddress <strong>and courseName</strong>.<br><br>

<h3>Table structure</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  EMPLOYEE TABLE       M   1   DEPARTMENT TABLE   1   M    COURSE TABLE
 +---------------+   <------  +----------------+  ------>  +---------------+
 | id       (PK) |            | id        (PK) |           | id       (PK) |
 | name          |            | name           |           | course_name   |
 | email         |            | description    |           | dept_id  (FK) |
 | address       |            +----------------+           +---------------+
 | dept_id  (FK) |
 +---------------+</pre>
<br>
Department sits in the middle: employees hang off it on one side, courses on the other. Both joins go <em>through</em> Department.<br>`,
            codeExamples: [
                `// Department.java gains a second collection
@Entity
@Table(name = "department")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;
    private String description;

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private Set<Employee> employees = new HashSet<>();

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private Set<Course> courses = new HashSet<>();

    // getters and setters
}

// Course.java
@Entity
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "course_name")
    private String courseName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id")
    private Department department;

    // getters and setters
}`,
                `// The DTO - six fields now
package com.velocity.dto;

public class DeptEmpCourseDto {

    private String empDeptName;
    private String empName;
    private String empEmail;
    private String empAddress;
    private String courseName;

    public DeptEmpCourseDto(String empDeptName, String empName, String empEmail,
                            String empAddress, String courseName) {
        this.empDeptName = empDeptName;
        this.empName     = empName;
        this.empEmail    = empEmail;
        this.empAddress  = empAddress;
        this.courseName  = courseName;
    }

    // getters and setters
}`,
                `// The repository - two joins, both through the mapped associations
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query("SELECT new com.velocity.dto.DeptEmpCourseDto("
         + "  d.name, e.name, e.email, e.address, c.courseName) "
         + "FROM Department d "
         + "INNER JOIN d.employees e "
         + "INNER JOIN d.courses c")
    List<DeptEmpCourseDto> fetchEmpDeptCourseInnerJoin();
}
// Four things to get right, and the original gets all four wrong:
//   1. the DTO name must be DeptEmpCourseDto, not DeptEmpDto
//   2. the field is c.courseName (the JAVA field), not c.coursename
//   3. "INNER JOIN Course c on c.id = d.id" joins course.id to
//      department.id - two unrelated primary keys. Join through the
//      association instead.
//   4. "INNER JOIN Course con c.id=d.id" is missing a space.`,
                `// Controller
@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/departmentEmployeeCourse")
    public ResponseEntity<List<DeptEmpCourseDto>> getDeptEmployeeCourse() {
        return new ResponseEntity<>(employeeService.getDeptEmployeesInnerJoin(),
                                    HttpStatus.OK);
    }
}

// GET http://localhost:8181/departmentEmployeeCourse
// RESPONSE (200 OK)
[
    {
        "empDeptName": "Engineering",
        "empName": "ajay",
        "empEmail": "ajay@gmail.com",
        "empAddress": "M G Road, pune",
        "courseName": "Spring Boot"
    },
    {
        "empDeptName": "Engineering",
        "empName": "ajay",
        "empEmail": "ajay@gmail.com",
        "empAddress": "M G Road, pune",
        "courseName": "Microservices"
    }
]
// Note: ajay appears TWICE - once per course. See the Expert tab.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Three-Table Join Multiplies Rows</h3>
Look again at that response. One employee appeared twice, because the department has two courses. That is not a bug in the query - it is what a join <em>does</em>.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Department "Engineering"
    3 employees  x  2 courses  =  6 result rows

Every employee is repeated once per course, and every course
is repeated once per employee. The two collections have nothing
to do with each other - joining them produces a CARTESIAN PRODUCT.</pre>
<br>
With 10 employees and 5 courses you get 50 rows to convey 15 facts. The join is only meaningful when the two child sets are genuinely related - and here they are not.<br><br>

<table>
<tr><th>What you actually want</th><th>How to get it</th></tr>
<tr><td>Employees, each with their department name</td><td>One join. Employee -> Department is many-to-one, so no multiplication.</td></tr>
<tr><td>Departments, each with its employees and its courses</td><td>Two separate queries, assembled into a nested DTO.</td></tr>
<tr><td>Every valid (employee, course) pairing</td><td>The cartesian join <em>is</em> correct - if that is the question.</td></tr>
</table>`,
            codeExamples: [
                `// The nested shape, which is almost always what the screen needs
public record EmployeeDto(String name, String email, String address) { }
public record CourseDto(String courseName) { }

public record DepartmentDto(
        String name,
        String description,
        List<EmployeeDto> employees,
        List<CourseDto> courses) { }`,
                `@Service
public class DepartmentQueryService {

    @Transactional(readOnly = true)
    public DepartmentDto get(Long deptId) {

        Department d = departmentRepository.findById(deptId).orElseThrow();

        // One query per collection - no multiplication.
        List<EmployeeDto> employees = employeeRepository.findByDepartmentId(deptId)
                .stream()
                .map(e -> new EmployeeDto(e.getName(), e.getEmail(), e.getAddress()))
                .toList();

        List<CourseDto> courses = courseRepository.findByDepartmentId(deptId)
                .stream()
                .map(c -> new CourseDto(c.getCourseName()))
                .toList();

        return new DepartmentDto(d.getName(), d.getDescription(), employees, courses);
    }
}
// OUTPUT:
// {
//   "name": "Engineering",
//   "description": "Product development team",
//   "employees": [ {"name":"ajay",...}, {"name":"sohan",...} ],
//   "courses":   [ {"courseName":"Spring Boot"}, {"courseName":"Microservices"} ]
// }
// 3 queries, 5 rows of data, no duplication.`
            ]
        },
        {
            content: `<h3>INNER JOIN Silently Drops Rows</h3>
Both examples use <code>INNER JOIN</code>, which returns only rows that have a match on both sides. A department with no employees vanishes from the result entirely - and nothing tells you it happened.<br><br>

<table>
<tr><th>Join type</th><th>Returns</th></tr>
<tr><td>INNER JOIN</td><td>Only rows matching on both sides.</td></tr>
<tr><td>LEFT JOIN</td><td>Every row from the left side; nulls where the right has no match.</td></tr>
<tr><td>RIGHT JOIN</td><td>Every row from the right side. Rare in JPQL.</td></tr>
</table>
<br>
"List all departments and their employee count" needs a LEFT JOIN, or every empty department disappears from the report.<br>`,
            codeExamples: [
                `// INNER - departments with no employees are missing
@Query("SELECT new com.velocity.dto.DeptEmpDto(d.name, d.description, "
     + "                                       e.name, e.email, e.address) "
     + "FROM Department d INNER JOIN d.employees e")
List<DeptEmpDto> inner();
// Data: Engineering(2 employees), Sales(2), HR(0)
// OUTPUT: 4 rows. HR is not there at all.

// LEFT - HR appears, with nulls for the employee columns
@Query("SELECT new com.velocity.dto.DeptEmpDto(d.name, d.description, "
     + "                                       e.name, e.email, e.address) "
     + "FROM Department d LEFT JOIN d.employees e")
List<DeptEmpDto> left();
// OUTPUT: 5 rows.
// { "empDept":"HR", "empDeptDesc":"People team",
//   "empName":null, "empEmail":null, "empAddress":null }`,
                `// Aggregation reads much better than a raw join for counts
public record DeptHeadcount(String name, long headcount) { }

@Query("SELECT new com.velocity.dto.DeptHeadcount(d.name, count(e)) "
     + "FROM Department d LEFT JOIN d.employees e "
     + "GROUP BY d.id, d.name "
     + "ORDER BY count(e) DESC")
List<DeptHeadcount> headcounts();
// OUTPUT:
// [ {"name":"Engineering","headcount":2},
//   {"name":"Sales","headcount":2},
//   {"name":"HR","headcount":0} ]
// With INNER JOIN, HR would be absent rather than showing zero.`
            ]
        },
        {
            content: `<h3><code>JOIN</code> vs <code>JOIN FETCH</code> - Two Different Jobs</h3>
Both put a join in the SQL. They differ in what comes back, and mixing them up is a common source of confusion.<br><br>

<table>
<tr><th></th><th>JOIN</th><th>JOIN FETCH</th></tr>
<tr><td>Purpose</td><td>Filter or project across tables</td><td>Load an association eagerly, for this query only</td></tr>
<tr><td>Returns</td><td>Whatever the SELECT names - scalars or a DTO</td><td>Fully-populated entities</td></tr>
<tr><td>Works with <code>select new</code></td><td>Yes</td><td>No - fetch and projection are incompatible</td></tr>
<tr><td>Works with <code>Pageable</code></td><td>Yes</td><td>Warns and paginates <strong>in memory</strong> for collections</td></tr>
<tr><td>Typical use</td><td>Building a report DTO</td><td>Avoiding N+1 when you need the entities</td></tr>
</table>
<br>
That fourth row is worth remembering. <code>join fetch</code> on a collection plus <code>Pageable</code> produces:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">HHH000104: firstResult/maxResults specified with collection fetch;
           applying in memory!</pre>
<br>
Hibernate loads <strong>every matching row</strong> and pages the list in Java. On a large table this is exactly the outage you were trying to avoid.<br>`,
            codeExamples: [
                `// JOIN - projection. Only 5 columns leave the database.
@Query("SELECT new com.velocity.dto.DeptEmpDto(d.name, d.description, "
     + "                                       e.name, e.email, e.address) "
     + "FROM Department d INNER JOIN d.employees e")
List<DeptEmpDto> projection();
// OUTPUT SQL:
// select d.name, d.description, e.name, e.email, e.address
// from department d inner join employee e on d.id = e.dept_id`,
                `// JOIN FETCH - entities, association pre-loaded, no N+1
@Query("SELECT e FROM Employee e JOIN FETCH e.department")
List<Employee> allWithDepartment();
// OUTPUT SQL - every column of BOTH tables:
// select e.*, d.* from employee e inner join department d on e.dept_id = d.id
//
// Without JOIN FETCH and with an eager @ManyToOne:
//   select ... from employee            (1)
//   select ... from department where id=?   (x N)

// This does NOT compile-and-work - you cannot do both at once:
@Query("SELECT new com.velocity.dto.DeptEmpDto(...) "
     + "FROM Department d JOIN FETCH d.employees e")
// OUTPUT at startup:
// QuerySyntaxException: query specified join fetching, but the owner
// of the fetched association was not present in the select list`,
                `// Pagination: safe with JOIN, dangerous with collection JOIN FETCH
@Query("SELECT new com.velocity.dto.DeptEmpDto(d.name, d.description, "
     + "                                       e.name, e.email, e.address) "
     + "FROM Department d INNER JOIN d.employees e")
Page<DeptEmpDto> projectionPaged(Pageable pageable);
// OUTPUT: proper LIMIT/OFFSET in SQL. Safe.

@Query("SELECT d FROM Department d JOIN FETCH d.employees")
Page<Department> fetchPaged(Pageable pageable);
// OUTPUT:
// HHH000104: firstResult/maxResults specified with collection fetch;
//            applying in memory!
// Every department and every employee is loaded, then sliced in Java.`
            ]
        },
        {
            content: `<h3>Three Ways to Project, and When to Use Each</h3>
<code>select new</code> is one option. Spring Data offers two more, and each has a case where it is clearly the best fit.<br><br>

<table>
<tr><th>Approach</th><th>Strength</th><th>Weakness</th></tr>
<tr><td>Constructor expression (<code>select new</code>)</td><td>Explicit, works with any JPA provider, immutable result</td><td>Fully-qualified class name in a string; refactoring can break it silently</td></tr>
<tr><td>Interface projection</td><td>No class name in the query, no constructor to keep in sync</td><td>Spring Data only; getter names must match the aliases</td></tr>
<tr><td>Native query + interface</td><td>Full SQL power with typed results</td><td>Not portable across databases</td></tr>
</table>
<br>
Interface projections are the lightest to maintain: declare an interface of getters, and Spring Data builds the proxy. Renaming the DTO cannot break a query string, because there is no class name in it.<br>`,
            codeExamples: [
                `// Interface projection - no constructor, no FQN in the query
public interface DeptEmpView {
    String getEmpDept();
    String getEmpDeptDesc();
    String getEmpName();
    String getEmpEmail();
    String getEmpAddress();
}

@Query("SELECT d.name        AS empDept, "
     + "       d.description AS empDeptDesc, "
     + "       e.name        AS empName, "
     + "       e.email       AS empEmail, "
     + "       e.address     AS empAddress "
     + "FROM Department d INNER JOIN d.employees e")
List<DeptEmpView> fetchViews();
// The ALIASES must match the getter names minus "get", lowercased.
// OUTPUT: same JSON as the DTO version.`,
                `// Closed projection with no @Query at all - derived from the name
public interface EmployeeNameEmail {
    String getName();
    String getEmail();
}

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<EmployeeNameEmail> findByDepartmentName(String departmentName);
}
// OUTPUT SQL - only two columns are selected:
// select e.name, e.email from employee e
// inner join department d on e.dept_id = d.id where d.name = ?
//
// Spring Data reads the interface and narrows the SELECT itself.`,
                `// Native query returning a projection - when you need real SQL
public interface DeptStats {
    String getDeptName();
    Long   getHeadcount();
    Double getAvgSalary();
}

@Query(value = """
        select d.name          as deptName,
               count(e.id)     as headcount,
               avg(e.salary)   as avgSalary
        from department d
        left join employee e on e.dept_id = d.id
        group by d.id, d.name
        """, nativeQuery = true)
List<DeptStats> stats();
// OUTPUT:
// [ {"deptName":"Engineering","headcount":2,"avgSalary":85000.0},
//   {"deptName":"HR","headcount":0,"avgSalary":null} ]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a DTO projection and why use one?</td><td>A class shaped like the response rather than like a table. It fetches only the needed columns and keeps the entity out of the API.</td></tr>
<tr><td>What does <code>select new</code> do in JPQL?</td><td>Calls a constructor once per result row, so the query returns a list of DTOs directly.</td></tr>
<tr><td>What must you get right in a constructor expression?</td><td>The fully qualified class name, and the parameter order and types matching the SELECT list exactly.</td></tr>
<tr><td>Why does <code>INNER JOIN d.employees e</code> need no ON clause?</td><td>It joins through a mapped association, so JPA already knows the foreign key and writes the ON clause itself.</td></tr>
<tr><td>What is wrong with <code>INNER JOIN Course c ON c.id = d.id</code>?</td><td>It joins two unrelated primary keys. The relationship is <code>course.dept_id -> department.id</code>; join through the association instead.</td></tr>
<tr><td>Why does joining two collections duplicate rows?</td><td>It builds a cartesian product - every employee is repeated once per course. Use separate queries and a nested DTO.</td></tr>
<tr><td>INNER JOIN vs LEFT JOIN?</td><td>INNER returns only matched rows, so a department with no employees disappears. LEFT keeps it, with nulls on the right.</td></tr>
<tr><td>Difference between JOIN and JOIN FETCH?</td><td>JOIN is for filtering and projection; JOIN FETCH eagerly loads an association and returns entities. They cannot be combined with <code>select new</code>.</td></tr>
<tr><td>What happens when you paginate a collection JOIN FETCH?</td><td>Hibernate warns HHH000104 and paginates <strong>in memory</strong> - every row is loaded first. Paginate a projection instead.</td></tr>
<tr><td>What is an interface projection?</td><td>An interface of getters that Spring Data implements as a proxy. The query aliases must match the getter names.</td></tr>
<tr><td>How do you fix N+1 on a many-to-one?</td><td>Make it LAZY and use <code>join fetch</code> or <code>@EntityGraph</code> where the association is actually needed.</td></tr>
<tr><td>Can <code>mappedBy</code> point at an id field?</td><td>No - it must name an association field. <code>mappedBy = "id"</code> fails at startup.</td></tr>
</table>`
        }
    ]
};
