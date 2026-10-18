import { Topic } from '../coreJava';

export const springBootTransactionManagement: Topic = {
    id: 'spring-boot-transaction-management',
    name: 'Transaction Management',
    beginner: [
        {
            content: `<h3>What is Transaction Management?</h3>
<div class="border">
• Transaction management is the mechanism used to <strong>maintain consistency of the user's data</strong>.<br>
• With it we can handle errors and faults while the code is running. <code>@Transactional</code> is placed above a method to ensure that the code <strong>reverts all its changes</strong> if any error or exception occurs while it runs.<br>
• In a Spring Boot application we use <code>@Transactional</code> on the business logic that is data-critical.<br>
</div><br>

<h3>Why do we need it?</h3>
Suppose you want to store a user together with their policies:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">1.  save the USER      -> committed to the database
2.  save POLICY #1     -> committed to the database
3.  save POLICY #2     -> RUNTIME EXCEPTION

Result WITHOUT a transaction:
    user  : saved
    policy: only one of two saved

The user row now exists with incomplete policy data.
What is the use of that user record?</pre>
<br>
To overcome this issue, transaction management comes into the picture. Either <strong>everything is saved, or nothing is</strong>.<br><br>

<h3>The two annotations</h3>

<table>
<tr><th>Annotation</th><th>Where it goes</th></tr>
<tr><td>@EnableTransactionManagement</td><td>Above the main class of the Spring Boot application.</td></tr>
<tr><td>@Transactional</td><td>On the service method that must succeed or fail as one unit.</td></tr>
</table>
<br>
<strong>Note:</strong> in a Spring Boot application <code>@EnableTransactionManagement</code> is already applied by auto-configuration whenever a <code>DataSource</code> is on the classpath. Adding it explicitly is harmless and makes the intent visible, which is why the walkthrough includes it.<br>`
        },
        {
            content: `<h3>Example - One User Has Many Policies</h3>
<strong>Business requirement:</strong> save one user's details with multiple policies.<br><br>
<strong>Problem statement:</strong> design the REST API to save one user with multiple policies.<br><br>

<h3>Steps</h3>
<div class="border">
1. Create the Spring Boot project &nbsp; 2. Add Maven dependencies &nbsp; 3. Create the model classes<br>
4. Create the services &nbsp; 5. Create the service implementations &nbsp; 6. Create the repositories<br>
7. Create the REST controller &nbsp; 8. application.properties &nbsp; 9. Add @EnableTransactionManagement<br>
10. Run &nbsp; 11. Postman &nbsp; 12. Check the database &nbsp; 13. Trace the flow
</div>`,
            codeExamples: [
                `<!-- Step 2 - pom.xml : Spring Web, Spring Data JPA, MySQL -->
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
                `// Step 3 - User.java
package com.velocity.model;

import java.util.List;
import javax.persistence.*;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String name;
    private String email;

    @OneToMany(mappedBy = "user")
    private List<Policy> policyList;

    // getters and setters
}`,
                `// Step 3 - Policy.java
package com.velocity.model;

import javax.persistence.*;

@Entity
@Table(name = "policy")
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String policyId;
    private String policyName;
    private String status;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // getters and setters
}
// NOTE: mappedBy on the User side must name an ASSOCIATION field on
// Policy - the "user" field above. Pointing mappedBy at a plain
// Integer column (private Integer userid) fails at startup with
// "mappedBy reference an unknown target entity property".`
            ]
        },
        {
            content: `<h3>Step 9 - Enable Transaction Management</h3>
The annotation goes on the class that holds the <code>main</code> method.<br>`,
            codeExamples: [
                `package com.velocity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class SpringBootTransactionManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootTransactionManagementApplication.class, args);
    }
}`,
                `// Step 6 - the two repositories.
// Each interface must have its OWN name - two interfaces called
// EmployeeRepository in the same package will not compile.
package com.velocity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.velocity.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}

// ---

package com.velocity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.velocity.model.Policy;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Integer> {
}`
            ]
        },
        {
            content: `<h3>Steps 4, 5 and 7 - Putting the Transaction in the Right Place</h3>
This is the part that decides whether the whole exercise works.<br><br>

The unit of work is "save the user <strong>and</strong> all their policies". So the transaction must wrap <strong>that whole unit</strong> - one service method that does both. Putting <code>@Transactional</code> on <code>saveUser</code> and separately on <code>savePolicy</code>, and looping in the controller, gives you <em>three separate transactions</em> - which is exactly the problem you set out to solve.<br>`,
            codeExamples: [
                `// Step 4 - one service method for the whole unit of work
package com.velocity.service;

import com.velocity.model.User;

public interface UserService {
    User saveUserWithPolicies(User user);
}`,
                `// Step 5 - UserServiceImpl.java
package com.velocity.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.velocity.model.Policy;
import com.velocity.model.User;
import com.velocity.repository.PolicyRepository;
import com.velocity.repository.UserRepository;
import com.velocity.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PolicyRepository policyRepository;

    // ONE transaction around BOTH saves.
    @Transactional
    @Override
    public User saveUserWithPolicies(User user) {

        User saved = userRepository.save(user);

        for (Policy policy : user.getPolicyList()) {
            policy.setUser(saved);
            policyRepository.save(policy);
        }
        return saved;
    }
}
// Use org.springframework.transaction.annotation.Transactional,
// not javax.transaction.Transactional. The Spring one supports
// propagation, isolation, readOnly, timeout and rollbackFor.`,
                `// Step 7 - the controller just delegates. No loop, no transaction logic.
package com.velocity.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.velocity.model.User;
import com.velocity.service.UserService;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/saveUserPolicy")
    public ResponseEntity<User> saveUserPolicy(@RequestBody User user) {
        return ResponseEntity.ok(userService.saveUserWithPolicies(user));
    }
}`
            ]
        },
        {
            content: `<h3>Steps 11 to 13 - Proving It Works</h3>

<table>
<tr><th>Field</th><th>Value</th></tr>
<tr><td>Method</td><td>POST</td></tr>
<tr><td>URL</td><td>http://localhost:8181/user/saveUserPolicy</td></tr>
<tr><td>Body</td><td>raw -> JSON (below)</td></tr>
</table>`,
            codeExamples: [
                `// REQUEST BODY
{
    "name": "ajay",
    "email": "ajay@gmail.com",
    "policyList": [
        { "policyId": "P001", "policyName": "Term Plan",     "status": "active" },
        { "policyId": "P002", "policyName": "Endowment Plan", "status": "active" }
    ]
}

// RESPONSE (200 OK) - both rows written
// CONSOLE:
// Hibernate: insert into user (email, name) values (?, ?)
// Hibernate: insert into policy (policy_id, policy_name, status, user_id) values (?, ?, ?, ?)
// Hibernate: insert into policy (policy_id, policy_name, status, user_id) values (?, ?, ?, ?)

// DATABASE
// user:                          policy:
// +----+------+----------------+ +----+-----------+---------+
// | id | name | email          | | id | policy_id | user_id |
// +----+------+----------------+ +----+-----------+---------+
// |  1 | ajay | ajay@gmail.com | |  1 | P001      |       1 |
// +----+------+----------------+ |  2 | P002      |       1 |
//                                +----+-----------+---------+`,
                `// Now force a failure on the SECOND policy and watch the rollback:
@Transactional
@Override
public User saveUserWithPolicies(User user) {

    User saved = userRepository.save(user);

    int i = 0;
    for (Policy policy : user.getPolicyList()) {
        policy.setUser(saved);
        policyRepository.save(policy);
        if (++i == 2) {
            throw new RuntimeException("simulated failure on policy 2");
        }
    }
    return saved;
}
// OUTPUT:
// Hibernate: insert into user ...
// Hibernate: insert into policy ...
// java.lang.RuntimeException: simulated failure on policy 2
//
// DATABASE AFTER: user -> 0 rows,  policy -> 0 rows
// The user insert was rolled back too. That is the whole point.
//
// Remove @Transactional and run it again:
// DATABASE AFTER: user -> 1 row, policy -> 1 row
// -- exactly the inconsistent state described at the top.`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Rule That Catches Everyone: Rollback Only on Unchecked Exceptions</h3>
By default, Spring rolls back on <code>RuntimeException</code> and <code>Error</code> - and <strong>commits</strong> on a checked exception. This surprises almost everyone the first time.<br>`,
            codeExamples: [
                `@Transactional
public void transfer() throws IOException {
    accountRepository.debit(1, 500);
    throw new IOException("checked exception");
}
// OUTPUT:
// The debit is COMMITTED. IOException is checked, so Spring does not
// roll back. The money left the account and nothing arrived.

// FIX 1 - name the exception
@Transactional(rollbackFor = Exception.class)
public void transfer() throws IOException { ... }
// OUTPUT: rolled back.

// FIX 2 - throw an unchecked exception instead (usually the better design)
@Transactional
public void transfer() {
    try {
        ...
    } catch (IOException e) {
        throw new TransferFailedException(e);   // extends RuntimeException
    }
}`,
                `// The other half of the same trap: swallowing the exception.
@Transactional
public void save(User user) {
    try {
        userRepository.save(user);
        policyRepository.save(badPolicy);      // throws
    } catch (Exception e) {
        log.error("failed", e);                // swallowed!
    }
}
// OUTPUT:
// No exception escapes the method, so Spring COMMITS whatever
// succeeded. The transaction cannot roll back for a failure it
// never heard about. Either rethrow, or call
// TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();`
            ]
        },
        {
            content: `<h3>Self-Invocation: Why <code>@Transactional</code> Sometimes Does Nothing</h3>
<code>@Transactional</code> works through a <strong>proxy</strong>. Spring wraps your bean in a proxy that opens a transaction, calls your method, then commits or rolls back. Callers get the proxy, so the transaction starts.<br><br>

A call from <em>inside</em> the same class does not go through the proxy - it is a plain <code>this.method()</code> call - so the annotation is simply ignored.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">EXTERNAL CALL - works
   controller ---> [ PROXY: begin tx ] ---> service.saveAll()
                            |
                            v
                   commit / rollback

INTERNAL CALL - annotation ignored
   service.outer() ---> this.saveAll()      no proxy, no transaction</pre>

<table>
<tr><th>Silent failure</th><th>Why</th></tr>
<tr><td>Calling an annotated method from another method of the same class</td><td>The call never leaves the object, so the proxy is bypassed.</td></tr>
<tr><td><code>@Transactional</code> on a <code>private</code> method</td><td>A proxy cannot intercept it. Public only.</td></tr>
<tr><td><code>@Transactional</code> on a <code>final</code> method or class</td><td>CGLIB cannot subclass it to create the proxy.</td></tr>
<tr><td>Annotated method called from the constructor or <code>@PostConstruct</code></td><td>The proxy does not exist yet.</td></tr>
</table>`,
            codeExamples: [
                `// BROKEN - the annotation does nothing
@Service
public class UserServiceImpl {

    public void process(List<User> users) {
        for (User u : users) {
            saveOne(u);            // this.saveOne(...) - proxy bypassed
        }
    }

    @Transactional
    public void saveOne(User u) {  // NO transaction is ever opened
        userRepository.save(u);
    }
}
// OUTPUT: no rollback on failure - each save is auto-committed.`,
                `// FIX - move the transactional method to a different bean
@Service
public class UserServiceImpl {

    private final UserSaver saver;    // a separate Spring bean

    public void process(List<User> users) {
        users.forEach(saver::saveOne);   // goes through the proxy
    }
}

@Service
public class UserSaver {
    @Transactional
    public void saveOne(User u) { userRepository.save(u); }
}
// OUTPUT: each saveOne now runs in its own real transaction.`
            ]
        },
        {
            content: `<h3>Propagation and Isolation</h3>
<code>@Transactional</code> has two attributes worth knowing beyond <code>rollbackFor</code>.<br><br>

<strong>Propagation</strong> answers: what should happen if a transaction is already running?<br><br>

<table>
<tr><th>Propagation</th><th>Behaviour</th></tr>
<tr><td>REQUIRED (default)</td><td>Join the existing transaction, or start one if there is none.</td></tr>
<tr><td>REQUIRES_NEW</td><td>Always start a new, independent transaction and suspend the outer one. Its rollback does not affect the caller.</td></tr>
<tr><td>SUPPORTS</td><td>Join if one exists; run without a transaction otherwise.</td></tr>
<tr><td>MANDATORY</td><td>Join, or throw if there is no active transaction.</td></tr>
<tr><td>NEVER</td><td>Throw if a transaction is active.</td></tr>
<tr><td>NESTED</td><td>A savepoint inside the outer transaction - can roll back partially.</td></tr>
</table>
<br>
<strong>Isolation</strong> answers: what can this transaction see of other, concurrent ones?<br><br>

<table>
<tr><th>Isolation</th><th>Prevents</th></tr>
<tr><td>READ_UNCOMMITTED</td><td>Nothing. Dirty reads are possible.</td></tr>
<tr><td>READ_COMMITTED</td><td>Dirty reads. The PostgreSQL and Oracle default.</td></tr>
<tr><td>REPEATABLE_READ</td><td>Dirty and non-repeatable reads. The MySQL/InnoDB default.</td></tr>
<tr><td>SERIALIZABLE</td><td>Everything including phantom reads. Slowest.</td></tr>
</table>
<br>
<code>REQUIRES_NEW</code> has one genuinely common use: writing an audit or log record that must survive even when the business transaction rolls back.<br>`,
            codeExamples: [
                `@Service
public class OrderService {

    @Autowired private AuditService auditService;

    @Transactional
    public void placeOrder(Order order) {
        auditService.record("order attempt " + order.getId());
        orderRepository.save(order);
        paymentGateway.charge(order);           // throws -> everything rolls back
    }
}

@Service
public class AuditService {

    // Its own transaction: commits immediately and independently.
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(String message) {
        auditRepository.save(new AuditEntry(message));
    }
}
// OUTPUT when the payment fails:
// order table -> no row (rolled back)
// audit table -> the attempt IS recorded
// With the default REQUIRED, the audit row would be rolled back too.`,
                `// readOnly is worth setting on every query-only method
@Transactional(readOnly = true)
public List<User> findAll() {
    return userRepository.findAll();
}
// Hibernate skips dirty-checking (no snapshot of every loaded entity),
// and the driver can route the query to a read replica.
// Measurably faster on large result sets, and it documents intent.

// timeout guards a long-running statement
@Transactional(timeout = 5)     // seconds
public void bulkImport(List<User> users) { ... }
// OUTPUT on overrun:
// TransactionTimedOutException: Transaction timed out:
//   deadline was Thu Sep 04 10:22:31 IST 2025`
            ]
        },
        {
            content: `<h3>A Simpler Alternative for This Example: Cascade</h3>
The walkthrough saves the user, then loops and saves each policy. JPA can do that for you if the association is mapped with a cascade - and then there is only one <code>save()</code> call to make transactional.<br>`,
            codeExamples: [
                `@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String email;

    @OneToMany(mappedBy = "user",
               cascade = CascadeType.ALL,
               orphanRemoval = true)
    private List<Policy> policyList = new ArrayList<>();

    // keeps BOTH sides of the association in step
    public void addPolicy(Policy policy) {
        policyList.add(policy);
        policy.setUser(this);
    }
}`,
                `@Transactional
@Override
public User saveUserWithPolicies(User user) {
    // Fix the back-reference, then a single save cascades to the children.
    user.getPolicyList().forEach(p -> p.setUser(user));
    return userRepository.save(user);
}
// OUTPUT:
// Hibernate: insert into user ...
// Hibernate: insert into policy ... user_id=1
// Hibernate: insert into policy ... user_id=1
//
// Same three statements, one transaction, no manual loop over
// a second repository. If any insert fails, all three roll back.
//
// Forget the p.setUser(user) line and user_id is written as NULL -
// the single most common bug in cascaded saves.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What problem does transaction management solve?</td><td>It makes a multi-step database operation atomic: either every step commits, or every step is rolled back, so the data never ends up half-written.</td></tr>
<tr><td>What are the ACID properties?</td><td>Atomicity (all or nothing), Consistency (valid state to valid state), Isolation (concurrent transactions do not interfere), Durability (a commit survives a crash).</td></tr>
<tr><td>Where should <code>@Transactional</code> go?</td><td>On the service method that represents the whole unit of work. Splitting it across several methods gives several transactions and defeats the purpose.</td></tr>
<tr><td>Do you need <code>@EnableTransactionManagement</code> in Spring Boot?</td><td>No - auto-configuration enables it when a DataSource is present. Adding it is harmless and documents intent.</td></tr>
<tr><td>Which exceptions roll back by default?</td><td>Only unchecked ones - <code>RuntimeException</code> and <code>Error</code>. A checked exception commits unless you set <code>rollbackFor</code>.</td></tr>
<tr><td>What happens if you catch the exception inside the method?</td><td>Nothing escapes, so Spring commits. Rethrow, or call <code>setRollbackOnly()</code> explicitly.</td></tr>
<tr><td>Why does <code>@Transactional</code> not work on an internal method call?</td><td>It is proxy-based. A <code>this.method()</code> call never passes through the proxy, so no transaction is started. Move the method to another bean.</td></tr>
<tr><td>Can <code>@Transactional</code> go on a private method?</td><td>No - the proxy cannot intercept private or final methods. It must be public.</td></tr>
<tr><td>What is the default propagation?</td><td>REQUIRED - join the current transaction, or start one if none exists.</td></tr>
<tr><td>When would you use REQUIRES_NEW?</td><td>When a step must commit independently of the caller - audit or log records that should survive the business transaction's rollback.</td></tr>
<tr><td>What does <code>readOnly = true</code> do?</td><td>Skips Hibernate's dirty-checking snapshot and allows routing to a read replica - a real speed-up on query-only methods.</td></tr>
<tr><td>Which <code>@Transactional</code> should you import?</td><td><code>org.springframework.transaction.annotation.Transactional</code> - the <code>javax</code>/<code>jakarta</code> one lacks propagation, isolation, readOnly and rollbackFor.</td></tr>
<tr><td>Default isolation level in MySQL?</td><td>REPEATABLE_READ for InnoDB; READ_COMMITTED in PostgreSQL and Oracle.</td></tr>
</table>`
        }
    ]
};
