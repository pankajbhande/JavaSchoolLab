import { Topic } from '../coreJava';

export const springBootNativeQuery: Topic = {
    id: 'spring-boot-native-query',
    name: 'Native Query with @Query',
    beginner: [
        {
            content: `<h3>How to Write a Native Query</h3>
<div class="border">
• Use the <code>@Query</code> annotation to specify a query inside a repository.<br>
• Always write the SQL query in the <strong>repository layer only</strong> - never in the service or the controller.<br>
• You can refer to the table name or the POJO class name while fetching the data, depending on which kind of query you write.<br>
</div><br>

<h3>The one attribute that changes everything</h3>

<table>
<tr><th>Setting</th><th>What the query string must be</th></tr>
<tr><td><code>nativeQuery = true</code></td><td>Real SQL against real <strong>table and column</strong> names. Passed straight to the database.</td></tr>
<tr><td><code>nativeQuery = false</code> (the default)</td><td>JPQL against <strong>entity class and field</strong> names. Hibernate translates it into SQL.</td></tr>
</table>
<br>
<strong>Correction worth noting:</strong> writing <code>nativeQuery = false</code> with SQL in the string does <em>not</em> produce a compile-time error - <code>@Query</code> takes a plain String, so the compiler has nothing to check. It fails when Hibernate tries to parse it as JPQL, and that happens at <strong>application startup</strong>:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">java.lang.IllegalArgumentException: Validation failed for query
  for method public abstract java.util.List
  com.velocity.repository.EmployeeRepository.findByCity(java.lang.String)!
Caused by: QuerySyntaxException: unexpected token: * near line 1, column 8
  [select * from employee c where city=?1]</pre>
<br>
JPQL has no <code>select *</code> and knows no table called <code>employee</code> - only the entity <code>Employee</code>.<br>`
        },
        {
            content: `<h3>Business Requirement 1 - List Users by City</h3>
Display the list of users according to city. Using the native-query approach:<br><br>

<strong>Problem statement:</strong> design the REST API to fetch the list of users based on city.<br>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>`,
                `// Step 6 - EmployeeRepository.java  (the only interesting file)
package com.velocity.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.velocity.model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    @Query(value = "select * from employee c where c.city = ?1", nativeQuery = true)
    List<Employee> findByCity(String city);
}
// ?1 is a POSITIONAL parameter - it binds to the FIRST method argument.
// "c" is a table alias; with only one table it is optional, but if you
// declare it you must use it consistently (c.city, not bare city).`,
                `// Step 5 - EmployeeServiceImpl.java
@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public List<Employee> getListByCity(String city) {
        return employeeRepository.findByCity(city);
    }
}

// Step 7 - EmployeeController.java
@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/getcity/{city}")
    public List<Employee> getEmployeeByCity(@PathVariable("city") String city) {
        return employeeService.getListByCity(city);
    }
}`,
                `// SCENARIO 1
// GET http://localhost:8181/getcity/pune
// RESPONSE (200 OK)
[
    { "id": 1, "name": "ajay",  "city": "pune" },
    { "id": 3, "name": "vikas", "city": "pune" }
]

// SCENARIO 2
// GET http://localhost:8181/getcity/mumbai
[
    { "id": 2, "name": "sohan", "city": "mumbai" }
]

// SCENARIO 3 - a city with no rows
// GET http://localhost:8181/getcity/delhi
[]

// CONSOLE:
// Hibernate: select * from employee c where c.city = ?`
            ]
        },
        {
            content: `<h3>Business Requirement 2 - City <em>and</em> Status</h3>
<div class="border">
• Display the list of users based on city <strong>and</strong> status.<br>
• If city is <code>pune</code> and status is <code>active</code>, display active users in Pune only.<br>
• If city is <code>mumbai</code> and status is <code>inactive</code>, display inactive users in Mumbai only.<br>
</div><br>

Two parameters means <code>?1</code> and <code>?2</code>, bound by position.<br>`,
            codeExamples: [
                `// EmployeeRepository.java
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    @Query(value = "select * from employee c where c.city = ?1 and c.status = ?2",
           nativeQuery = true)
    List<Employee> findByCityAndStatus(String city, String status);
}
// ?1 -> the first argument (city), ?2 -> the second (status).
// Swap the arguments at the call site and the query silently returns
// nothing - positional binding cannot detect the mistake.`,
                `// EmployeeController.java
@GetMapping("/getcity/{city}/{status}")
public List<Employee> getEmployeeByCityAndStatus(
        @PathVariable("city") String city,
        @PathVariable("status") String status) {

    return employeeService.getListByCityAndStatus(city, status);
}`,
                `// SCENARIO 1
// GET http://localhost:8181/getcity/pune/active
[
    { "id": 1, "name": "ajay", "city": "pune", "status": "active" }
]

// SCENARIO 2
// GET http://localhost:8181/getcity/mumbai/inactive
[
    { "id": 5, "name": "sohan", "city": "mumbai", "status": "inactive" }
]

// SCENARIO 3 - no match
// GET http://localhost:8181/getcity/pune/inactive
[]

// CONSOLE:
// Hibernate: select * from employee c where c.city = ? and c.status = ?`
            ]
        },
        {
            content: `<h3>Changing the Port</h3>
Every example here runs on 8181 rather than the default 8080. That is one line:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Step 1 - open application.properties and add:
    server.port=8082

Step 2 - run the Spring Boot application.</pre>
<br>
The console confirms it: <code>Tomcat started on port(s): 8082 (http)</code>. Setting <code>server.port=0</code> picks a random free port, which is what integration tests use.<br><br>

<h3>Application Flow</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Postman  GET /getcity/pune
     |
     v
 EmployeeController  ->  EmployeeService  ->  EmployeeServiceImpl
     |
     v
 EmployeeRepository  ->  @Query(nativeQuery = true)
     |
     v
 DATABASE</pre>`
        }
    ],

    expert: [
        {
            content: `<h3>Native SQL vs JPQL - Choosing Between Them</h3>
The tutorial reaches for <code>nativeQuery = true</code> immediately, and for a simple <code>where city = ?</code> that is the <em>less</em> good choice. Both options have a real place.<br><br>

<table>
<tr><th>Aspect</th><th>JPQL (default)</th><th>Native SQL</th></tr>
<tr><td>Refers to</td><td>Entity classes and field names</td><td>Table and column names</td></tr>
<tr><td>Validated at startup</td><td>Yes - a bad field name fails the boot</td><td>No - errors surface at query time</td></tr>
<tr><td>Rename a field</td><td>Compiler and startup catch it</td><td>Query silently breaks at runtime</td></tr>
<tr><td>Portable across databases</td><td>Yes - Hibernate emits dialect-specific SQL</td><td>No - MySQL syntax will not run on Oracle</td></tr>
<tr><td>Pagination</td><td><code>Pageable</code> works out of the box</td><td>Needs a separate <code>countQuery</code></td></tr>
<tr><td>Vendor features</td><td>Not available</td><td>Full access - window functions, hints, CTEs, JSON operators</td></tr>
<tr><td>Returns entities</td><td>Always managed and dirty-checked</td><td>Managed only if every column is selected</td></tr>
</table>
<br>
<strong>The rule:</strong> use JPQL by default; drop to native SQL when you need something JPQL cannot express - a database-specific function, a complex analytic query, or a bulk statement you have tuned by hand.<br>`,
            codeExamples: [
                `// The same two queries in JPQL - note "Employee" the CLASS, "city" the FIELD
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    @Query("select e from Employee e where e.city = :city")
    List<Employee> findByCity(@Param("city") String city);

    @Query("select e from Employee e where e.city = :city and e.status = :status")
    List<Employee> findByCityAndStatus(@Param("city") String city,
                                       @Param("status") String status);
}
// Rename Employee.city to Employee.location and the application refuses
// to start, naming the broken query. The native version would have
// compiled, started, and failed on the first user request.`,
                `// Where native SQL genuinely earns its place: a window function
@Query(value = """
        select * from (
            select e.*,
                   row_number() over (partition by e.city order by e.salary desc) rn
            from employee e
        ) ranked
        where ranked.rn <= 3
        """, nativeQuery = true)
List<Employee> findTop3EarnersPerCity();
// OUTPUT: the three highest-paid employees in every city, in one query.
// JPQL has no window functions, so this is a legitimate native query.`
            ]
        },
        {
            content: `<h3>Named Parameters Beat Positional Ones</h3>
<code>?1</code> and <code>?2</code> work until someone adds a third parameter in the middle, or reorders the method signature. Then the query still compiles, still runs, and returns the wrong rows.<br><br>

<code>:city</code> and <code>:status</code> bind by <em>name</em>, so the order of the arguments stops mattering and the query reads like a sentence.<br>`,
            codeExamples: [
                `// Positional - the failure mode
@Query(value = "select * from employee where city = ?1 and status = ?2",
       nativeQuery = true)
List<Employee> find(String city, String status);

// Someone "improves" the signature:
List<Employee> find(String status, String city);     // arguments swapped
// OUTPUT: compiles, runs, returns [] forever.
// Nothing warns you.

// Named - the same mistake is impossible
@Query(value = "select * from employee where city = :city and status = :status",
       nativeQuery = true)
List<Employee> find(@Param("status") String status,
                    @Param("city") String city);
// OUTPUT: correct rows regardless of parameter order.
// A typo in :cityy fails at startup:
//   Using named parameters for method ... but parameter 'city' not found`,
                `// Binding a collection - IN clauses
@Query(value = "select * from employee where city in (:cities)", nativeQuery = true)
List<Employee> findByCities(@Param("cities") List<String> cities);
// OUTPUT:
// findByCities(List.of("pune","mumbai"))
//   -> select * from employee where city in (?, ?)

// An EMPTY list produces "in ()", which is a SQL syntax error on MySQL.
// Guard it:
if (cities.isEmpty()) return List.of();`
            ]
        },
        {
            content: `<h3>String Concatenation Is SQL Injection</h3>
Both parameter styles are safe because they become <strong>bind parameters</strong> - the value never becomes part of the SQL text. Building the query with <code>+</code> removes that protection completely.<br>`,
            codeExamples: [
                `// NEVER DO THIS - and it appears in real codebases
public List<Employee> search(String city) {
    String sql = "select * from employee where city = '" + city + "'";
    return entityManager.createNativeQuery(sql, Employee.class).getResultList();
}

// Called with:  city = "pune' OR '1'='1"
// The database receives:
//   select * from employee where city = 'pune' OR '1'='1'
// OUTPUT: every row in the table.

// Called with:  city = "x'; DROP TABLE employee; --"
// OUTPUT: the table is gone.`,
                `// The bound version - the value is never parsed as SQL
@Query(value = "select * from employee where city = :city", nativeQuery = true)
List<Employee> search(@Param("city") String city);

// Same input:  city = "pune' OR '1'='1"
// The database receives:
//   select * from employee where city = ?
//   with the parameter bound to the literal string "pune' OR '1'='1"
// OUTPUT: [] - it is looking for a city with that exact, silly name.`,
                `// The one thing you CANNOT bind is an identifier -
// a table name, a column name, or a sort direction.
// This is a syntax error, not a working query:
@Query(value = "select * from employee order by :column", nativeQuery = true)

// For dynamic sorting use Sort, which Spring Data validates:
List<Employee> findByCity(String city, Sort sort);
// employeeRepository.findByCity("pune", Sort.by("salary").descending())
// OUTPUT: select ... where city=? order by salary desc
//
// If you must interpolate an identifier, validate it against an
// allow-list of known column names first - never against user input.`
            ]
        },
        {
            content: `<h3>Modifying Native Queries and Pagination</h3>
Two things trip people up the first time they go beyond a SELECT.<br><br>

<strong>1. A native UPDATE or DELETE needs two extra annotations.</strong> Without <code>@Modifying</code> Spring Data tries to run it as a query; without <code>@Transactional</code> JPA refuses to execute it at all.<br><br>

<strong>2. A paginated native query needs its own count query.</strong> Spring Data can derive a count from JPQL, but not from arbitrary SQL.<br>`,
            codeExamples: [
                `// A bulk update - @Modifying and @Transactional are both mandatory
@Modifying
@Transactional
@Query(value = "update employee set status = :status where city = :city",
       nativeQuery = true)
int deactivateCity(@Param("city") String city, @Param("status") String status);
// Returns the number of rows affected.
// OUTPUT: deactivateCity("pune", "inactive") -> 2

// Without @Modifying:
//   InvalidDataAccessApiUsageException: Not supported for DML operations
// Without @Transactional:
//   TransactionRequiredException: Executing an update/delete query`,
                `// IMPORTANT: bulk updates bypass the persistence context.
// Entities already loaded in the current transaction keep their OLD values.
@Modifying(clearAutomatically = true, flushBeforeExecution = true)
@Transactional
@Query(value = "update employee set status = :status where city = :city",
       nativeQuery = true)
int deactivateCity(@Param("city") String city, @Param("status") String status);
// clearAutomatically  -> clears the persistence context after the update
// flushBeforeExecution -> writes pending changes first
// Without them, a later findById() can return a stale, cached entity.`,
                `// Pagination with a native query - countQuery is required
@Query(value = "select * from employee where city = :city",
       countQuery = "select count(*) from employee where city = :city",
       nativeQuery = true)
Page<Employee> findByCity(@Param("city") String city, Pageable pageable);

// Usage:
Page<Employee> page = repo.findByCity("pune",
        PageRequest.of(0, 20, Sort.by("name")));
// OUTPUT:
// select * from employee where city=? order by name asc limit ?, ?
// select count(*) from employee where city=?
// page.getTotalElements() -> 47
// page.getTotalPages()    -> 3
//
// Omit countQuery and startup fails:
//   Cannot derive count query for native query`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does the <code>@Query</code> annotation do?</td><td>Attaches an explicit JPQL or SQL query to a repository method, replacing the derived-from-the-name behaviour.</td></tr>
<tr><td>What does <code>nativeQuery = true</code> change?</td><td>The string is treated as real SQL against table and column names and sent to the database unchanged, instead of JPQL against entities.</td></tr>
<tr><td>Is <code>nativeQuery = false</code> with SQL a compile error?</td><td>No - <code>@Query</code> takes a plain String. It fails at startup when Hibernate cannot parse it as JPQL: <code>QuerySyntaxException: unexpected token: *</code>.</td></tr>
<tr><td>JPQL vs native SQL - which should you default to?</td><td>JPQL: it is validated at startup, survives field renames, is database-portable, and paginates without extra work. Go native only for vendor-specific features.</td></tr>
<tr><td>Difference between <code>?1</code> and <code>:city</code>?</td><td>Positional binds to argument order; named binds by name. Named is safer - reordering parameters cannot silently break it.</td></tr>
<tr><td>Are <code>@Query</code> parameters safe from SQL injection?</td><td>Yes - they become bind parameters, so the value is never parsed as SQL. Concatenating the value into the string with <code>+</code> is not safe.</td></tr>
<tr><td>What can you not pass as a bind parameter?</td><td>Identifiers - table names, column names, sort direction. Use <code>Sort</code>/<code>Pageable</code>, or validate against an allow-list.</td></tr>
<tr><td>What do you need for a native UPDATE or DELETE?</td><td><code>@Modifying</code> and <code>@Transactional</code>. Missing either gives <code>InvalidDataAccessApiUsageException</code> or <code>TransactionRequiredException</code>.</td></tr>
<tr><td>Why can a bulk update leave stale entities in memory?</td><td>It runs directly in the database and bypasses the persistence context. Use <code>@Modifying(clearAutomatically = true, flushBeforeExecution = true)</code>.</td></tr>
<tr><td>How do you paginate a native query?</td><td>Add a <code>Pageable</code> parameter and supply <code>countQuery</code> - Spring Data cannot derive a count from arbitrary SQL.</td></tr>
<tr><td>Where should queries live?</td><td>The repository layer only. A SQL string in a service or controller mixes persistence with business logic and cannot be reused or tested in isolation.</td></tr>
<tr><td>What happens with an empty list in an <code>IN</code> clause?</td><td>It renders as <code>in ()</code>, a SQL syntax error on MySQL. Guard for the empty case before calling.</td></tr>
</table>`
        }
    ]
};
