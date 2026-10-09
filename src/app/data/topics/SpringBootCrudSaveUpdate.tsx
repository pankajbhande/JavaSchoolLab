import { Topic } from '../coreJava';

export const springBootCrudSaveUpdate: Topic = {
    id: 'spring-boot-crud-save-update',
    name: 'REST API - Save & Update Operation',
    beginner: [
        {
            content: `<h3>Business Requirement - Save</h3>
Suppose you want to save employee data - <code>id</code>, <code>name</code>, <code>city</code> - into the database.<br><br>

<strong>Problem statement:</strong> design the REST API (RESTful web service) to store or save the employee data into the database.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project &nbsp;&nbsp; 2. Add Maven dependencies to pom.xml &nbsp;&nbsp; 3. Create the model class<br>
4. Create the service &nbsp;&nbsp; 5. Create the service implementation &nbsp;&nbsp; 6. Create the repository<br>
7. Create the REST controller &nbsp;&nbsp; 8. application.properties &nbsp;&nbsp; 9. Run the application<br>
10. Open Postman (request and response) &nbsp;&nbsp; 11. Check the database &nbsp;&nbsp; 12. Trace the application flow
</div><br>

<h3>The layers a request travels through</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Postman  POST http://localhost:8181/save
      |
      v
  Employee  (model / entity)
      |
      v
  EmployeeController      @RestController      -- receives JSON
      |
      v
  EmployeeService         (interface)
      |
      v
  EmployeeServiceImpl     @Service             -- business logic
      |
      v
  EmployeeRepository      @Repository          -- extends JpaRepository
      |
      v
  DATABASE (MySQL)</pre>`
        },
        {
            content: `<h3>Step 2 - Maven Dependencies</h3>
Three dependencies do all the work: the MySQL driver, Spring Data JPA (which brings Hibernate), and spring-boot-starter-web for the REST endpoint.<br>`,
            codeExamples: [
                `<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.12</version>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>`
            ]
        },
        {
            content: `<h3>Step 3 - Model Class (Entity)</h3>

<table>
<tr><th>Annotation</th><th>Purpose</th></tr>
<tr><td>@Entity</td><td>Marks the class as a JPA entity - one instance maps to one table row.</td></tr>
<tr><td>@Table(name = "employee")</td><td>Names the table this entity maps to.</td></tr>
<tr><td>@Id</td><td>Marks the primary key field.</td></tr>
<tr><td>@GeneratedValue(strategy = GenerationType.IDENTITY)</td><td>The database generates the id (MySQL AUTO_INCREMENT); the application does not supply it.</td></tr>
</table>`,
            codeExamples: [
                `package com.velocity.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String name;
    private String city;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    @Override
    public String toString() {
        return "Employee [id=" + id + ", name=" + name + ", city=" + city + "]";
    }
}
// NOTE: javax.persistence.* is correct for Spring Boot 2.x.
// On Spring Boot 3.x these imports become jakarta.persistence.*.`
            ]
        },
        {
            content: `<h3>Steps 4, 5 and 6 - Service, Implementation, Repository</h3>
The service interface declares <em>what</em> the application can do; the implementation says <em>how</em>; the repository talks to the database. Note how little the repository contains - <code>JpaRepository</code> supplies <code>save()</code> already.<br>`,
            codeExamples: [
                `// Step 4 - EmployeeService.java
package com.velocity.service;

import com.velocity.model.Employee;

public interface EmployeeService {
    public Employee saveEmployee(Employee employee);
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
    public Employee saveEmployee(Employee employee) {
        Employee emp = employeeRepository.save(employee);
        return emp;
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
// The second type parameter is the type of the @Id field - Integer here,
// because Employee.id is an int. Spring Data writes the implementation
// at runtime; save(), findById(), findAll() and deleteById() all exist
// without you writing a line of them.`
            ]
        },
        {
            content: `<h3>Step 7 - REST Controller (Save)</h3>
<code>@PostMapping</code> because we are <strong>creating</strong> a resource, and <code>@RequestBody</code> converts the incoming JSON into the <code>Employee</code> object.<br>`,
            codeExamples: [
                `package com.velocity.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.velocity.model.Employee;
import com.velocity.service.EmployeeService;

@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/save")
    public Employee saveEmployee(@RequestBody Employee employee) {
        Employee emp = employeeService.saveEmployee(employee);
        return emp;
    }
}`,
                `# Step 8 - application.properties
server.port=8181

#MySQL
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/test?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect`
            ]
        },
        {
            content: `<h3>Steps 9 to 11 - Run, Post, Verify</h3>

<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>Method</td><td>POST</td></tr>
<tr><td>URL</td><td>http://localhost:8181/save</td></tr>
<tr><td>Body</td><td>raw -> JSON (see below)</td></tr>
<tr><td>Action</td><td>Click Send</td></tr>
</table>
<br>
Notice that the request body carries <strong>no id</strong> - the database generates it - and the response comes back <em>with</em> one.<br>`,
            codeExamples: [
                `// REQUEST BODY (POST /save)
{
    "name": "ajay",
    "city": "pune"
}

// RESPONSE (200 OK)
{
    "id": 1,
    "name": "ajay",
    "city": "pune"
}

// CONSOLE (because spring.jpa.show-sql=true):
// Hibernate: insert into employee (city, name) values (?, ?)

// DATABASE:
// +----+------+------+
// | id | name | city |
// +----+------+------+
// |  1 | ajay | pune |
// +----+------+------+`
            ]
        },
        {
            content: `<h3>Business Requirement - Update</h3>
Suppose you have an employee with <code>id</code>, <code>name</code> and <code>city</code>, and you have to update the name in the database.<br><br>

<strong>Problem statement:</strong> design the REST API to update or edit the employee data in the database.<br><br>

Everything is identical to the save flow except three things:<br><br>

<table>
<tr><th>Element</th><th>Save</th><th>Update</th></tr>
<tr><td>HTTP method</td><td>@PostMapping("/save")</td><td>@PutMapping("/update")</td></tr>
<tr><td>Service method</td><td>saveEmployee(...)</td><td>updateEmployee(...)</td></tr>
<tr><td>Request body</td><td>No id</td><td><strong>Must</strong> include the id</td></tr>
</table>
<br>
<strong>Note:</strong> while updating, passing the <code>id</code> in the JSON request is mandatory. Without it, JPA treats the object as new and <em>inserts</em> a second row instead of updating the existing one.<br>`,
            codeExamples: [
                `// EmployeeService.java
public interface EmployeeService {
    public Employee updateEmployee(Employee employee);
}

// EmployeeServiceImpl.java
@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public Employee updateEmployee(Employee employee) {
        // save() performs an INSERT when the id is null/0,
        // and an UPDATE when the id matches an existing row.
        Employee emp = employeeRepository.save(employee);
        return emp;
    }
}`,
                `// EmployeeController.java
@RestController
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PutMapping("/update")
    public Employee updateEmployee(@RequestBody Employee employee) {
        // Must call updateEmployee - the interface declares that name,
        // so calling saveEmployee here would not compile.
        Employee emp = employeeService.updateEmployee(employee);
        return emp;
    }
}`,
                `// REQUEST (PUT /update) - id is mandatory
{
    "id": 1,
    "name": "rohan",
    "city": "pune"
}

// RESPONSE (200 OK)
{
    "id": 1,
    "name": "rohan",
    "city": "pune"
}

// CONSOLE:
// Hibernate: select employee0_.id ... from employee employee0_ where employee0_.id=?
// Hibernate: update employee set city=?, name=? where id=?

// Send the SAME body WITHOUT the id and you get:
// Hibernate: insert into employee (city, name) values (?, ?)
// -> a second row, id=2. The original row is untouched.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3><code>save()</code> Does a Full Replace - and That Loses Data</h3>
The update above works because the JSON happened to carry every field. Real entities have ten or twenty, and a client that sends only the field it wants to change <strong>wipes the rest</strong>.<br><br>

<code>save()</code> takes the object you hand it and makes the row look exactly like that object. A field that is <code>null</code> in your object becomes <code>NULL</code> in the row. Jackson sets every field the JSON does not mention to <code>null</code>. Put those two facts together:<br>`,
            codeExamples: [
                `// Existing row:
// id=1, name=ajay, city=pune, email=ajay@x.com, mobile=9876543210

// Client wants to change only the city and sends:
{ "id": 1, "city": "mumbai" }

// Jackson builds:  Employee(id=1, name=null, city="mumbai",
//                           email=null, mobile=null)
// save() then runs:
// update employee set city=?, name=?, email=?, mobile=? where id=?
//                            NULL     NULL     NULL

// RESULT:
// id=1, name=NULL, city=mumbai, email=NULL, mobile=NULL
// Four columns silently destroyed by a "partial update".`,
                `// THE FIX - load the row, change only what was sent, then save.
@Override
public Employee updateEmployee(Integer id, Employee incoming) {

    Employee existing = employeeRepository.findById(id)
            .orElseThrow(() -> new EmployeeNotFoundException(id));

    if (incoming.getName() != null) existing.setName(incoming.getName());
    if (incoming.getCity() != null) existing.setCity(incoming.getCity());

    return employeeRepository.save(existing);
}
// OUTPUT:
// update employee set city=? where id=?     -- only the changed column
// name, email and mobile keep their values.`,
                `// A cleaner API shape: PUT replaces, PATCH patches.
@PutMapping("/api/employees/{id}")     // full replace - client sends everything
public Employee replace(@PathVariable Integer id, @RequestBody Employee e) { ... }

@PatchMapping("/api/employees/{id}")   // partial - client sends only changes
public Employee patch(@PathVariable Integer id, @RequestBody Map<String, Object> fields) { ... }
// OUTPUT:
// PUT   /api/employees/1  {"name":"rohan","city":"pune"}   -> replaces the row
// PATCH /api/employees/1  {"city":"mumbai"}                -> changes one column`
            ]
        },
        {
            content: `<h3><code>ddl-auto</code> - the Setting That Deletes Your Data</h3>
The save example used <code>spring.jpa.hibernate.ddl-auto=create</code>. That value <strong>drops every table and recreates it on each startup</strong>. In development it is convenient; anywhere else it is a data-loss bug waiting for a restart.<br><br>

<table>
<tr><th>Value</th><th>What Hibernate does at startup</th></tr>
<tr><td>none</td><td>Nothing. The correct production value.</td></tr>
<tr><td>validate</td><td>Checks the schema matches the entities and fails startup if not. Safe, and the best production choice when you want the check.</td></tr>
<tr><td>update</td><td>Adds missing tables and columns. Never drops or alters existing ones - so a renamed field leaves the old column behind forever.</td></tr>
<tr><td>create</td><td><strong>Drops all tables</strong> and recreates them at every startup.</td></tr>
<tr><td>create-drop</td><td>Same as create, and drops them again on shutdown. Used for tests.</td></tr>
</table>
<br>
Even <code>update</code> is not a migration tool: it cannot rename a column, change a type, add an index, or backfill data, and it will happily leave your schema half-right. Real projects use <strong>Flyway</strong> or <strong>Liquibase</strong> and set <code>ddl-auto=validate</code>.<br>`,
            codeExamples: [
                `# Development
spring.jpa.hibernate.ddl-auto=update

# Production - schema owned by Flyway, Hibernate only checks it
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true

# src/main/resources/db/migration/V1__create_employee.sql
CREATE TABLE employee (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    city VARCHAR(255)
);
# OUTPUT at startup:
# Flyway: Successfully applied 1 migration to schema \`test\`
# Hibernate: schema validation passed`
            ]
        },
        {
            content: `<h3>Why the Controller Should Not Take the Entity</h3>
<code>@RequestBody Employee</code> works and is what almost every tutorial shows. It also means the client can set <strong>any field on your table</strong>, including ones you never intended to expose.<br><br>

<table>
<tr><th>Risk</th><th>What happens</th></tr>
<tr><td>Mass assignment</td><td>The JSON <code>{"id": 1, "role": "ADMIN"}</code> is bound straight onto the entity. If the field exists, the client just set it.</td></tr>
<tr><td>Leaked columns</td><td>The response serialises every field - password hashes, internal flags, audit columns.</td></tr>
<tr><td>Schema as contract</td><td>Renaming a column renames a JSON key, breaking every client.</td></tr>
<tr><td>Lazy associations</td><td>Serialising an entity with a lazy <code>@OneToMany</code> throws during JSON writing.</td></tr>
</table>
<br>
The fix is a <strong>DTO</strong> - a small class shaped for the API, with only the fields the endpoint should accept and return.<br>`,
            codeExamples: [
                `// Request DTO - only what a client is allowed to send
public record EmployeeRequest(
        @NotBlank String name,
        @NotBlank String city) { }

// Response DTO - only what a client is allowed to see
public record EmployeeResponse(Integer id, String name, String city) { }

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(
            @Valid @RequestBody EmployeeRequest request) {

        EmployeeResponse saved = service.save(request);
        return ResponseEntity
                .created(URI.create("/api/employees/" + saved.id()))
                .body(saved);
    }
}
// OUTPUT:
// POST /api/employees  {"name":"ajay","city":"pune","role":"ADMIN"}
//   -> 201 Created
//      Location: /api/employees/1
//      {"id":1,"name":"ajay","city":"pune"}
// "role" was ignored because EmployeeRequest has no such field -
// there is nowhere for it to land.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which annotations turn a class into a JPA entity?</td><td>@Entity on the class, @Id on the key field, usually @Table to name the table and @GeneratedValue for key generation.</td></tr>
<tr><td>What does GenerationType.IDENTITY mean?</td><td>The database generates the key - MySQL AUTO_INCREMENT. The insert happens immediately so the id can be read back.</td></tr>
<tr><td>How does <code>save()</code> know whether to INSERT or UPDATE?</td><td>By whether the entity is new - typically a null or zero id. New means insert; an existing id means Hibernate loads the row and updates it.</td></tr>
<tr><td>Why must the id be sent when updating?</td><td>Without it the entity looks new, so <code>save()</code> inserts a second row instead of updating the first.</td></tr>
<tr><td>What is wrong with using <code>save()</code> for a partial update?</td><td>It replaces the whole row, so any field missing from the JSON is written as NULL. Load the entity first and copy only the fields that were sent.</td></tr>
<tr><td>PUT vs PATCH?</td><td>PUT replaces the entire resource and is idempotent; PATCH applies a partial change.</td></tr>
<tr><td>What does the second type parameter of JpaRepository mean?</td><td>The type of the entity's @Id field. It must match, or lookups fail at runtime.</td></tr>
<tr><td>What does <code>ddl-auto=create</code> do?</td><td>Drops and recreates every table at each startup - all data is lost. Use <code>validate</code> in production with Flyway or Liquibase owning the schema.</td></tr>
<tr><td>Is <code>ddl-auto=update</code> safe for production?</td><td>No. It only adds; it cannot rename, retype, index or backfill, and it silently leaves stale columns behind.</td></tr>
<tr><td>Why not accept the entity directly in @RequestBody?</td><td>Mass assignment - a client can set any field that exists. It also leaks columns in the response and makes the DB schema the public API contract. Use DTOs.</td></tr>
<tr><td>What does <code>spring.jpa.show-sql=true</code> do?</td><td>Logs the SQL Hibernate generates - the fastest way to see whether an insert or an update actually ran.</td></tr>
</table>`
        }
    ]
};
