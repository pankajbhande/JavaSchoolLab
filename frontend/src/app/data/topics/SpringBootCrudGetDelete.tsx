import { Topic } from '../coreJava';

export const springBootCrudGetDelete: Topic = {
    id: 'spring-boot-crud-get-delete',
    name: 'REST API - Get & Delete Operation',
    beginner: [
        {
            content: `<h3>Business Requirement - Get</h3>
Suppose you want to get the employee data from the database based on the employee id.<br><br>

<strong>Problem statement:</strong> design the REST API to fetch (retrieve / get / select) the employee data by employee id from the database.<br><br>

The project layout, entity and dependencies are the same as the save example. Only the service method, the repository method and the controller mapping change.<br><br>

<table>
<tr><th>Piece</th><th>What it becomes for a GET by id</th></tr>
<tr><td>Controller</td><td><code>@GetMapping("/get/{id}")</code> with <code>@PathVariable</code></td></tr>
<tr><td>Service</td><td><code>getEmployeeById(Integer id)</code></td></tr>
<tr><td>Repository</td><td>Nothing new - <code>findById()</code> is inherited</td></tr>
<tr><td>Request body</td><td>None. Nothing is sent; the id travels in the URL.</td></tr>
</table>`,
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
                `// Step 3 - Employee.java (unchanged from the save example)
package com.velocity.model;

import javax.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String city;

    // getters, setters and toString()
}`
            ]
        },
        {
            content: `<h3>Steps 4, 5 and 6 - Service, Implementation, Repository</h3>
<code>JpaRepository</code> already declares <code>Optional&lt;Employee&gt; findById(Integer id)</code>, so the repository body stays empty. The service unwraps the <code>Optional</code> and decides what "not found" means.<br><br>

<strong>Important:</strong> do <em>not</em> declare <code>public Employee findById(Integer id)</code> in the repository. The inherited method returns <code>Optional&lt;Employee&gt;</code>, and redeclaring it with a different return type is a compile error:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">findById(Integer) in EmployeeRepository cannot override
findById(ID) in CrudRepository
  return type Employee is not compatible with Optional&lt;Employee&gt;</pre>
<br>
If you want a method that returns the entity directly, give it a different name - <code>findEmployeeById</code> - or just use the inherited <code>Optional</code>, which is the better habit.<br>`,
            codeExamples: [
                `// Step 4 - EmployeeService.java
package com.velocity.service;

import com.velocity.model.Employee;

public interface EmployeeService {
    public Employee getEmployeeById(Integer id);
}`,
                `// Step 5 - EmployeeServiceImpl.java
package com.velocity.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.velocity.model.Employee;
import com.velocity.repository.EmployeeRepository;
import com.velocity.service.EmployeeService;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public Employee getEmployeeById(Integer id) {
        // findById returns Optional<Employee> - never null.
        return employeeRepository.findById(id).orElse(null);
    }
}`,
                `// Step 6 - EmployeeRepository.java
package com.velocity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.velocity.model.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
}
// The ID type parameter must be Integer - the type of Employee.id.
// Writing Serializable there compiles, but every lookup then takes
// Serializable and you lose all type safety on the id.`
            ]
        },
        {
            content: `<h3>Step 7 - REST Controller (Get)</h3>
<code>@PathVariable("id")</code> pulls the <code>{id}</code> segment out of the URL and binds it to the method argument.<br>`,
            codeExamples: [
                `package com.velocity.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import com.velocity.model.Employee;
import com.velocity.service.EmployeeService;

@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/get/{id}")
    public Employee getEmployeeById(@PathVariable("id") Integer id) {
        Employee employee = employeeService.getEmployeeById(id);
        return employee;
    }
}`,
                `# Step 8 - application.properties
server.port=8181

#MySQL
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/bootdepth?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect`
            ]
        },
        {
            content: `<h3>Steps 9 to 11 - Send the Request</h3>

<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>Method</td><td>GET</td></tr>
<tr><td>URL</td><td>http://localhost:8181/get/1</td></tr>
<tr><td>Body</td><td>Nothing - we are fetching, not sending</td></tr>
</table>`,
            codeExamples: [
                `// GET http://localhost:8181/get/1
// RESPONSE (200 OK)
{
    "id": 1,
    "name": "ajay",
    "city": "pune"
}

// CONSOLE:
// Hibernate: select employee0_.id as id1_0_0_, employee0_.city as city2_0_0_,
//            employee0_.name as name3_0_0_ from employee employee0_
//            where employee0_.id=?

// GET http://localhost:8181/get/999   (no such row)
// RESPONSE: 200 OK with an empty body
// -- which is wrong. A missing resource should be 404. See the Expert tab.`
            ]
        },
        {
            content: `<h3>Business Requirement - Delete</h3>
Suppose you want to delete data from the database based on the employee id.<br><br>

<strong>Problem statement:</strong> design the REST API to delete the employee data by employee id.<br><br>

Again, only the verb and the method name change. <code>deleteById()</code> is inherited from <code>JpaRepository</code>.<br>`,
            codeExamples: [
                `// EmployeeService.java
public interface EmployeeService {
    public void deleteEmployee(Integer id);
}

// EmployeeServiceImpl.java
@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public void deleteEmployee(Integer id) {
        employeeRepository.deleteById(id);
    }
}`,
                `// EmployeeController.java
package com.velocity.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import com.velocity.service.EmployeeService;

@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @DeleteMapping("/delete/{id}")
    public void deleteEmployeeById(@PathVariable("id") Integer id) {
        employeeService.deleteEmployee(id);
    }
}
// Note the import: org.springframework.web.bind.annotation.DeleteMapping.
// Forgetting it is the most common compile error in this example.`,
                `// DELETE http://localhost:8181/delete/2
// No request body - the id is in the URL.
// RESPONSE: 200 OK, empty body

// CONSOLE:
// Hibernate: select ... from employee where id=?
// Hibernate: delete from employee where id=?

// DATABASE - before:            after:
// +----+-------+--------+       +----+------+------+
// | id | name  | city   |       | id | name | city |
// +----+-------+--------+       +----+------+------+
// |  1 | ajay  | pune   |       |  1 | ajay | pune |
// |  2 | sohan | mumbai |       +----+------+------+
// +----+-------+--------+`
            ]
        },
        {
            content: `<h3>Application Flow</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">GET    /get/1        DELETE /delete/2
    |                     |
    v                     v
EmployeeController  ->  @GetMapping / @DeleteMapping picks the method
    |
    v
EmployeeService     ->  interface
    |
    v
EmployeeServiceImpl ->  @Service, calls the repository
    |
    v
EmployeeRepository  ->  findById() / deleteById(), inherited
    |
    v
DATABASE</pre>
<br>
The four CRUD verbs now map cleanly:<br><br>

<table>
<tr><th>Operation</th><th>Annotation</th><th>Repository method</th></tr>
<tr><td>Create</td><td>@PostMapping</td><td>save()</td></tr>
<tr><td>Read</td><td>@GetMapping</td><td>findById() / findAll()</td></tr>
<tr><td>Update</td><td>@PutMapping</td><td>save() with an id</td></tr>
<tr><td>Delete</td><td>@DeleteMapping</td><td>deleteById()</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>Returning <code>null</code> Is the Bug in This Example</h3>
<code>orElse(null)</code> hands a null back to the controller, and Spring serialises that as <strong>200 OK with an empty body</strong>. To the client, "this employee does not exist" and "everything is fine" look identical - and a client that does <code>response.name</code> gets a null-pointer of its own.<br><br>

A missing resource is a <strong>404</strong>. Three ways to get one, in increasing order of quality:<br>`,
            codeExamples: [
                `// 1. ResponseEntity in the controller - quick, but the check leaks upward
@GetMapping("/get/{id}")
public ResponseEntity<Employee> get(@PathVariable Integer id) {
    Employee e = employeeService.getEmployeeById(id);
    if (e == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(e);
}
// OUTPUT: GET /get/999 -> 404 Not Found, empty body`,
                `// 2. A custom exception carrying its own status - the service decides
@ResponseStatus(HttpStatus.NOT_FOUND)
public class EmployeeNotFoundException extends RuntimeException {
    public EmployeeNotFoundException(Integer id) {
        super("No employee with id " + id);
    }
}

@Override
public Employee getEmployeeById(Integer id) {
    return employeeRepository.findById(id)
            .orElseThrow(() -> new EmployeeNotFoundException(id));
}
// OUTPUT: GET /get/999
// 404 Not Found
// {"timestamp":"...","status":404,"error":"Not Found",
//  "message":"No employee with id 999","path":"/get/999"}`,
                `// 3. @RestControllerAdvice - one place, and you control the body shape
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(EmployeeNotFoundException.class)
    public ResponseEntity<Map<String, Object>> notFound(EmployeeNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", 404,
                "message", ex.getMessage()));
    }
}
// OUTPUT:
// 404 Not Found
// {"timestamp":"2023-08-01T09:14:02Z","status":404,
//  "message":"No employee with id 999"}`
            ]
        },
        {
            content: `<h3>Delete: Three Methods, Three Different Behaviours</h3>
<code>deleteById()</code> looks like one obvious choice. There are actually several, and they behave differently when the row is not there or when there are many rows.<br><br>

<table>
<tr><th>Method</th><th>Behaviour</th></tr>
<tr><td><code>deleteById(id)</code></td><td>Spring Data 2.x: throws <code>EmptyResultDataAccessException</code> if the row is missing. Spring Data 3.x (Boot 3): silently does nothing.</td></tr>
<tr><td><code>delete(entity)</code></td><td>Needs the entity, so you have already loaded it and know it exists.</td></tr>
<tr><td><code>deleteAllById(ids)</code></td><td>Deletes a batch - but issues one SELECT and one DELETE <em>per id</em>.</td></tr>
<tr><td><code>deleteAllByIdInBatch(ids)</code></td><td>A single <code>delete ... where id in (?, ?, ?)</code>. Far faster, but skips cascades and lifecycle callbacks.</td></tr>
<tr><td>Derived <code>deleteByCity(city)</code></td><td>Needs <code>@Transactional</code> or it fails with <code>TransactionRequiredException</code>.</td></tr>
</table>
<br>
Deleting a row that other tables reference by foreign key fails at the database level, not in Java:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">java.sql.SQLIntegrityConstraintViolationException:
  Cannot delete or update a parent row: a foreign key constraint fails
  (\`test\`.\`policy\`, CONSTRAINT \`FK_policy_user\`
   FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`))</pre>
<br>
The fix is a deliberate decision, not a workaround: cascade the delete, null the child's foreign key, or refuse the delete with a clear 409 Conflict.<br>`,
            codeExamples: [
                `// The check-then-delete pattern, so the client learns the row was missing
@Override
public void deleteEmployee(Integer id) {
    if (!employeeRepository.existsById(id)) {
        throw new EmployeeNotFoundException(id);
    }
    employeeRepository.deleteById(id);
}
// OUTPUT:
// DELETE /delete/999 -> 404 Not Found
// DELETE /delete/2   -> 204 No Content`,
                `// Return 204 No Content - the correct status for a delete with no body
@DeleteMapping("/api/employees/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void delete(@PathVariable Integer id) {
    employeeService.deleteEmployee(id);
}
// OUTPUT: 204 No Content (not 200 with an empty body)`,
                `// Soft delete - what most business applications actually want.
// The row is never removed, so audit history and foreign keys survive.
@Entity
@Table(name = "employee")
public class Employee {

    @Column(name = "deleted")
    private boolean deleted = false;
}

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    @Query("select e from Employee e where e.deleted = false")
    List<Employee> findAllActive();
}

@Override
@Transactional
public void deleteEmployee(Integer id) {
    Employee e = employeeRepository.findById(id)
            .orElseThrow(() -> new EmployeeNotFoundException(id));
    e.setDeleted(true);          // no DELETE statement is ever issued
}
// OUTPUT:
// Hibernate: update employee set deleted=? where id=?
// The row stays, foreign keys stay valid, and the record can be restored.`
            ]
        },
        {
            content: `<h3>Why <code>findById()</code> Returns <code>Optional</code></h3>
Spring Data 2.0 changed <code>findById()</code> from returning <code>T</code> to returning <code>Optional&lt;T&gt;</code>, and that change is the reason redeclaring it in your repository does not compile.<br><br>

The point is that the compiler now <em>forces</em> you to say what happens when the row is missing. With a plain return type you can forget, and the forgetting shows up as a <code>NullPointerException</code> three layers away.<br><br>

<table>
<tr><th>Call</th><th>Meaning</th></tr>
<tr><td><code>.orElseThrow(() -> new NotFound(id))</code></td><td>Missing is an error. The usual choice for a GET by id.</td></tr>
<tr><td><code>.orElse(defaultEmployee)</code></td><td>Missing has a sensible default.</td></tr>
<tr><td><code>.map(this::toDto)</code></td><td>Transform if present, stay empty if not.</td></tr>
<tr><td><code>.isPresent()</code> / <code>.ifPresent(...)</code></td><td>Branch explicitly.</td></tr>
<tr><td><code>.get()</code></td><td>Throws <code>NoSuchElementException</code> if empty - you have re-created the NPE. Avoid.</td></tr>
</table>
<br>
There is also <code>getReferenceById()</code> (formerly <code>getOne()</code>), which returns a <strong>lazy proxy without hitting the database</strong>. It is useful for setting a foreign key you already know, and it throws <code>EntityNotFoundException</code> on first property access rather than at lookup time - so it is the wrong tool for a "fetch and return" endpoint.<br>`,
            codeExamples: [
                `// Optional composed all the way to the response - no nulls anywhere
@GetMapping("/api/employees/{id}")
public ResponseEntity<EmployeeResponse> get(@PathVariable Integer id) {
    return employeeRepository.findById(id)
            .map(EmployeeResponse::from)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
}
// OUTPUT:
// GET /api/employees/1   -> 200 {"id":1,"name":"ajay","city":"pune"}
// GET /api/employees/999 -> 404 (empty body)`,
                `// getReferenceById - no SELECT, just a proxy holding the id
Employee ref = employeeRepository.getReferenceById(1);
// OUTPUT: no SQL yet

policy.setEmployee(ref);
policyRepository.save(policy);
// OUTPUT: insert into policy (employee_id, ...) values (1, ...)
// The employee row was never loaded - exactly what you want when you
// only need the foreign key. But ref.getName() would trigger the
// SELECT, and throws EntityNotFoundException if id 1 does not exist.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which annotation maps a URL segment to a method argument?</td><td><code>@PathVariable</code>. <code>@RequestParam</code> reads the query string instead.</td></tr>
<tr><td>Why does <code>findById()</code> return <code>Optional</code>?</td><td>Since Spring Data 2.0, so the compiler forces you to handle the missing-row case instead of leaking a null.</td></tr>
<tr><td>Why can't you declare <code>Employee findById(Integer id)</code> in your repository?</td><td>It clashes with the inherited <code>Optional&lt;T&gt; findById(ID)</code> - same signature, incompatible return type, so it will not compile. Use a different method name.</td></tr>
<tr><td>What is wrong with returning null from a GET-by-id endpoint?</td><td>Spring serialises it as 200 OK with an empty body, so the client cannot tell success from not-found. Return 404.</td></tr>
<tr><td>Which status code should a successful DELETE return?</td><td>204 No Content when there is no body; 200 OK if you return something.</td></tr>
<tr><td>What happens if you <code>deleteById()</code> a row that does not exist?</td><td>Spring Data 2.x throws <code>EmptyResultDataAccessException</code>; Spring Data 3.x does nothing. Check with <code>existsById()</code> first if you need a 404.</td></tr>
<tr><td>Why might a delete fail with a constraint violation?</td><td>Another table references the row by foreign key. Cascade, null the child key, or reject with 409 Conflict.</td></tr>
<tr><td>Difference between <code>deleteAllById</code> and <code>deleteAllByIdInBatch</code>?</td><td>The first issues a select and delete per id; the second issues one <code>delete ... where id in (...)</code> but skips cascades and lifecycle callbacks.</td></tr>
<tr><td>What is a soft delete and why use one?</td><td>Flag the row as deleted instead of removing it, so audit history survives and foreign keys stay valid. Implemented with a boolean column and a filtered query.</td></tr>
<tr><td>findById vs getReferenceById?</td><td><code>findById</code> hits the database and returns an Optional; <code>getReferenceById</code> returns a lazy proxy with no query, and throws on first property access if the row is missing.</td></tr>
<tr><td>Why does a derived <code>deleteByCity()</code> need <code>@Transactional</code>?</td><td>Derived delete methods are modifying queries, and JPA refuses to run one outside a transaction - <code>TransactionRequiredException</code>.</td></tr>
</table>`
        }
    ]
};
