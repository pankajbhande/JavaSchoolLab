import { Topic } from '../coreJava';

export const springBootOneToOneAndOneToMany: Topic = {
    id: 'spring-boot-one-to-one-many',
    name: 'Mapping - One-to-One & One-to-Many',
    beginner: [
        {
            content: `<h3>Spring Boot JPA Mapping</h3>
<div class="border">
• Spring Boot JPA is a Java specification for managing relational data in Java applications.<br>
• It lets us access and persist data between a Java object/class and a relational database.<br>
• JPA follows <strong>ORM</strong> - Object-Relational Mapping.<br>
</div><br>

There are four types of mapping:<br><br>

<table>
<tr><th>Mapping</th><th>Meaning</th></tr>
<tr><td>One to One</td><td>The primary key of one table becomes the foreign key of another. Example: one user has one cart.</td></tr>
<tr><td>One to Many</td><td>One row in a table maps to multiple rows in another. Example: one user has many policies.</td></tr>
<tr><td>Many to One</td><td>Multiple rows map to a single row in another table. Example: many employees have one address.</td></tr>
<tr><td>Many to Many</td><td>Multiple rows map to multiple rows in another table. Example: many users have many nominees.</td></tr>
</table>`
        },
        {
            content: `<h3>1. One-to-One Mapping</h3>
The primary key of one table becomes the foreign key of another table.<br><br>

<strong>Business requirement:</strong> save one user's details with one cart's details into the database.<br>
<strong>Problem statement:</strong> design the REST API to save one user with one cart into the database.<br><br>

<h3>Table structure</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   USER TABLE                1        1        CART TABLE
 +--------------+          <-------->       +--------------+
 | id      (PK) |                           | cart_id (PK) |
 | name         |                           | cart_name    |
 | email        |                           +--------------+
 | cart_id (FK) |
 +--------------+</pre>`,
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
                `// Step 3 - User.java
package com.velocity.model;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int userId;

    private String name;
    private String email;

    @OneToOne(targetEntity = Cart.class, cascade = CascadeType.ALL)
    @JoinColumn(name = "cart_id")      // the FK column lives on the user table
    private Cart cart;

    // getters and setters
}`,
                `// Step 3 - Cart.java
package com.velocity.model;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "cart")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int cartId;

    private String cartName;

    // getters and setters
}
// NOTE: the import is javax.persistence.CascadeType,
// not javax.apersistence.CascadeType.`
            ]
        },
        {
            content: `<h3>Steps 4 to 7 - Service, Repository, Controller</h3>
Only <code>User</code> is saved. <code>cascade = CascadeType.ALL</code> means saving the user also saves the cart - there is no <code>CartRepository</code> call anywhere.<br>`,
            codeExamples: [
                `// UserService.java
package com.velocity.service;

import com.velocity.model.User;

public interface UserService {
    public User saveUser(User user);
}

// UserServiceImpl.java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }
}

// UserRepository.java
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}`,
                `// UserController.java
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/saveUserCart")
    public User saveUserDetails(@RequestBody User user) {
        return userService.saveUser(user);
    }
}`,
                `# application.properties
server.port=8181

#MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/testpractice?autoReconnect=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true`,
                `// POST http://localhost:8181/saveUserCart
// REQUEST BODY
{
    "name": "ajay",
    "email": "ajay@gmail.com",
    "cart": {
        "cartName": "Insurance Cart"
    }
}

// RESPONSE (200 OK)
{
    "userId": 1,
    "name": "ajay",
    "email": "ajay@gmail.com",
    "cart": { "cartId": 1, "cartName": "Insurance Cart" }
}

// CONSOLE - note the cart is inserted FIRST, so its id can go in the FK:
// Hibernate: insert into cart (cart_name) values (?)
// Hibernate: insert into user (cart_id, email, name) values (?, ?, ?)

// DATABASE
// user:                                    cart:
// +----+------+----------------+---------+ +---------+-----------------+
// | id | name | email          | cart_id | | cart_id | cart_name       |
// +----+------+----------------+---------+ +---------+-----------------+
// |  1 | ajay | ajay@gmail.com |       1 | |       1 | Insurance Cart  |
// +----+------+----------------+---------+ +---------+-----------------+`
            ]
        },
        {
            content: `<h3>2. One-to-Many Mapping</h3>
One row in a table can be mapped to multiple rows in another table. Example: one user has multiple policies.<br><br>

<strong>Business requirement:</strong> save one user's details with multiple policy details.<br>
<strong>Problem statement:</strong> design the REST API to save one user with multiple policies.<br><br>

<h3>Table structure</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   USER TABLE                1        M        POLICY TABLE
 +--------------+          <-------->       +----------------+
 | id     (PK)  |                           | id        (PK) |
 | name         |                           | policy_id      |
 | email        |                           | policy_name    |
 +--------------+                           | status         |
                                            | user_id   (FK) |
                                            +----------------+</pre>
<br>
<strong>The foreign key always lives on the "many" side.</strong> A user cannot hold many policy ids in one column, so each policy row stores the id of its user.<br>`,
            codeExamples: [
                `// Step 3 - User.java  (the ONE side)
package com.velocity.model;

import java.util.ArrayList;
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

    // mappedBy names the FIELD on Policy that owns the relationship.
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Policy> policyList = new ArrayList<>();

    // Keeps both sides of the association consistent.
    public void addPolicy(Policy policy) {
        policyList.add(policy);
        policy.setUser(this);
    }

    // getters and setters
}`,
                `// Step 3 - Policy.java  (the MANY side - it owns the FK)
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
    private User user;              // <-- this is what mappedBy = "user" refers to

    // getters and setters
}
// COMMON MISTAKE: declaring "private Integer userid;" instead of a
// User reference, and then writing @OneToMany(mappedBy = "userid").
// mappedBy must name an ASSOCIATION field, not a plain column, so
// that version fails at startup:
//   mappedBy reference an unknown target entity property:
//   com.velocity.model.Policy.userid`
            ]
        },
        {
            content: `<h3>One-to-Many - Service, Repository, Controller</h3>
Because the association cascades, one <code>save()</code> writes the user and every policy. The only thing you must remember is to set the back-reference so the foreign key is not null.<br>`,
            codeExamples: [
                `// UserServiceImpl.java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    @Override
    public User saveUser(User user) {
        // Without this line, policy.user is null and user_id is written as NULL.
        user.getPolicyList().forEach(p -> p.setUser(user));
        return userRepository.save(user);
    }
}

// UserRepository.java
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}`,
                `// UserController.java
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/saveUserPolicy")
    public ResponseEntity<User> saveUserPolicy(@RequestBody User user) {
        return ResponseEntity.ok(userService.saveUser(user));
    }
}`,
                `// POST http://localhost:8181/user/saveUserPolicy
// REQUEST BODY
{
    "name": "ajay",
    "email": "ajay@gmail.com",
    "policyList": [
        { "policyId": "P001", "policyName": "Term Plan",      "status": "active" },
        { "policyId": "P002", "policyName": "Endowment Plan", "status": "active" }
    ]
}

// CONSOLE:
// Hibernate: insert into user (email, name) values (?, ?)
// Hibernate: insert into policy (policy_id, policy_name, status, user_id) values (?, ?, ?, ?)
// Hibernate: insert into policy (policy_id, policy_name, status, user_id) values (?, ?, ?, ?)

// DATABASE
// user:                             policy:
// +----+------+----------------+    +----+-----------+--------------+---------+
// | id | name | email          |    | id | policy_id | policy_name  | user_id |
// +----+------+----------------+    +----+-----------+--------------+---------+
// |  1 | ajay | ajay@gmail.com |    |  1 | P001      | Term Plan    |       1 |
// +----+------+----------------+    |  2 | P002      | Endowment    |       1 |
//                                   +----+-----------+--------------+---------+`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Owning Side vs Inverse Side - the Idea Behind <code>mappedBy</code></h3>
A relational foreign key lives in exactly one column, on one table. A Java object graph has references on both sides. <code>mappedBy</code> is how you tell JPA which Java side corresponds to that single database column.<br><br>

<table>
<tr><th>Side</th><th>Marked by</th><th>Meaning</th></tr>
<tr><td>Owning</td><td><code>@JoinColumn</code>, no <code>mappedBy</code></td><td>Holds the foreign key. <strong>Changes to this side are what get written.</strong></td></tr>
<tr><td>Inverse</td><td><code>mappedBy = "fieldOnOwner"</code></td><td>A read-only view of the same relationship. Changing it alone writes nothing.</td></tr>
</table>
<br>
This is why setting only the collection is the classic bug: the collection is the <em>inverse</em> side, so JPA ignores it when deciding what to write.<br>`,
            codeExamples: [
                `// THE BUG - user_id comes out NULL
User user = new User();
user.setName("ajay");

Policy p = new Policy();
p.setPolicyName("Term Plan");

user.getPolicyList().add(p);       // inverse side only
userRepository.save(user);
// OUTPUT:
// insert into policy (policy_name, status, user_id) values (?, ?, NULL)
// The policy row exists but belongs to nobody.

// THE FIX - set the OWNING side
p.setUser(user);                   // owning side
user.getPolicyList().add(p);       // keeps the in-memory graph correct
// OUTPUT:
// insert into policy (..., user_id) values (?, ?, 1)`,
                `// Better: a helper method on the entity so it cannot be forgotten.
@Entity
public class User {

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Policy> policyList = new ArrayList<>();

    public void addPolicy(Policy policy) {
        policyList.add(policy);
        policy.setUser(this);          // both sides, always
    }

    public void removePolicy(Policy policy) {
        policyList.remove(policy);
        policy.setUser(null);
    }
}
// With orphanRemoval = true, removePolicy() also DELETEs the row:
// OUTPUT: delete from policy where id=?`
            ]
        },
        {
            content: `<h3>The Infinite JSON Loop</h3>
Map both directions and serialise an entity, and Jackson walks the graph forever: user -> policies -> user -> policies...<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">com.fasterxml.jackson.databind.JsonMappingException:
  Infinite recursion (StackOverflowError)
  (through reference chain:
   com.velocity.model.User["policyList"]
     ->java.util.ArrayList[0]
       ->com.velocity.model.Policy["user"]
         ->com.velocity.model.User["policyList"]  ->  ...)</pre>

<table>
<tr><th>Fix</th><th>Effect</th></tr>
<tr><td><code>@JsonManagedReference</code> / <code>@JsonBackReference</code></td><td>Forward side is serialised; back side is skipped. The pair must match.</td></tr>
<tr><td><code>@JsonIgnore</code> on the child's parent field</td><td>Simplest. The child's <code>user</code> never appears in JSON.</td></tr>
<tr><td><code>@JsonIdentityInfo</code></td><td>Serialises the repeat as an id instead of a nested object.</td></tr>
<tr><td><strong>Return a DTO</strong></td><td>The real fix - the loop cannot exist because the DTO has no back-reference.</td></tr>
</table>
<br>
The other annotation you will see in this material is <code>@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})</code>. That is a different problem: it hides the two synthetic fields Hibernate adds to a lazy proxy, which Jackson would otherwise try to serialise. A DTO removes the need for it as well.<br>`,
            codeExamples: [
                `// The quick fix
@Entity
public class Policy {

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore                      // stops the recursion
    private User user;
}
// OUTPUT:
// {"id":1,"name":"ajay","policyList":[{"id":1,"policyName":"Term Plan"}]}`,
                `// The real fix - the API shape is decided by you, not by the schema
public record PolicyResponse(Integer id, String policyId, String policyName) { }

public record UserResponse(Integer id, String name, String email,
                           List<PolicyResponse> policies) {

    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail(),
                u.getPolicyList().stream()
                        .map(p -> new PolicyResponse(p.getId(), p.getPolicyId(),
                                                     p.getPolicyName()))
                        .toList());
    }
}
// OUTPUT:
// {"id":1,"name":"ajay","email":"ajay@gmail.com",
//  "policies":[{"id":1,"policyId":"P001","policyName":"Term Plan"}]}
// No recursion possible, no Hibernate internals leaked, and renaming
// a column does not change the API.`
            ]
        },
        {
            content: `<h3>Fetch Types - and the N+1 Problem</h3>
Each mapping annotation has a default fetch type, and the defaults are not consistent.<br><br>

<table>
<tr><th>Annotation</th><th>Default fetch</th></tr>
<tr><td>@OneToOne</td><td>EAGER</td></tr>
<tr><td>@ManyToOne</td><td>EAGER</td></tr>
<tr><td>@OneToMany</td><td>LAZY</td></tr>
<tr><td>@ManyToMany</td><td>LAZY</td></tr>
</table>
<br>
The "to-one" defaults are the dangerous ones. Every <code>findAll()</code> on <code>Policy</code> silently loads the <code>User</code> for each row - the <strong>N+1 select problem</strong>: one query for the list, then one more per row.<br>`,
            codeExamples: [
                `// Default EAGER @ManyToOne, 100 policies:
List<Policy> policies = policyRepository.findAll();
// OUTPUT:
// Hibernate: select ... from policy
// Hibernate: select ... from user where id=?      (x100)
// 101 queries to display one list.

// FIX 1 - make it lazy, then fetch deliberately when you need it
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id")
private User user;

// FIX 2 - one query with a JOIN FETCH
@Query("select p from Policy p join fetch p.user")
List<Policy> findAllWithUser();
// OUTPUT:
// Hibernate: select p.*, u.* from policy p inner join user u on p.user_id = u.id
// One query. 101 -> 1.

// FIX 3 - an entity graph, without writing JPQL
@EntityGraph(attributePaths = "user")
List<Policy> findAll();`,
                `// The flip side of LAZY: touching the collection after the
// transaction has closed.
@GetMapping("/user/{id}")
public UserResponse get(@PathVariable Integer id) {
    User user = userRepository.findById(id).orElseThrow();
    return UserResponse.from(user);      // reads policyList -- session is gone
}
// OUTPUT:
// LazyInitializationException: failed to lazily initialize a collection
// of role: com.velocity.model.User.policyList: could not initialize
// proxy - no Session

// FIX: load what you need inside the transaction.
@Transactional(readOnly = true)
public UserResponse get(Integer id) {
    User user = userRepository.findByIdWithPolicies(id).orElseThrow();
    return UserResponse.from(user);
}

@Query("select u from User u left join fetch u.policyList where u.id = :id")
Optional<User> findByIdWithPolicies(@Param("id") Integer id);`
            ]
        },
        {
            content: `<h3>One-to-One: Which Table Gets the Foreign Key?</h3>
A one-to-one has a genuine choice, and the walkthrough's version puts <code>cart_id</code> on the user table. Three options exist.<br><br>

<table>
<tr><th>Strategy</th><th>How</th></tr>
<tr><td>FK on the owner (used above)</td><td><code>@JoinColumn(name = "cart_id")</code> on User. Simple; add a UNIQUE constraint or it is really a many-to-one.</td></tr>
<tr><td>Shared primary key</td><td><code>@MapsId</code> - the cart's PK <em>is</em> the user's PK. No extra column, and genuinely one-to-one by construction.</td></tr>
<tr><td>Join table</td><td><code>@JoinTable</code>. Useful when the relationship is optional on both sides.</td></tr>
</table>
<br>
<strong>Without a UNIQUE constraint on <code>cart_id</code>, nothing stops two users pointing at the same cart</strong> - the database will happily allow it, and the mapping only <em>claims</em> to be one-to-one.<br><br>

There is also a well-known wrinkle: an optional lazy <code>@OneToOne</code> on the inverse side <strong>cannot be made lazy</strong>. Hibernate must query to know whether to give you a proxy or null, so it queries every time. The shared-primary-key form avoids it.<br>`,
            codeExamples: [
                `// Strategy 1 - FK on user, with the constraint that makes it real
@OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
@JoinColumn(name = "cart_id", unique = true)
private Cart cart;
// Generated DDL:
// alter table user add constraint UK_user_cart unique (cart_id)`,
                `// Strategy 2 - shared primary key. cart.id IS user.id.
@Entity
public class Cart {

    @Id
    private Integer id;               // no @GeneratedValue

    @OneToOne
    @MapsId                           // take the id from the associated User
    @JoinColumn(name = "id")
    private User user;

    private String cartName;
}
// OUTPUT:
// insert into user (email, name) values (?, ?)         -> id = 1
// insert into cart (cart_name, id) values (?, 1)
// One-to-one is now guaranteed by the primary key itself; a second
// cart for user 1 is a duplicate-key error.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What are the four JPA relationship types?</td><td>@OneToOne, @OneToMany, @ManyToOne and @ManyToMany.</td></tr>
<tr><td>In a one-to-many, which table holds the foreign key?</td><td>The "many" table - a single column cannot hold many ids.</td></tr>
<tr><td>What does <code>mappedBy</code> do?</td><td>Marks the side as inverse (read-only) and names the field on the owning entity that holds the foreign key.</td></tr>
<tr><td>What must <code>mappedBy</code> point at?</td><td>An association field on the other entity, not a plain column. Pointing it at an <code>Integer userid</code> fails at startup.</td></tr>
<tr><td>Why is the foreign key null after saving a parent with children?</td><td>Only the inverse collection was set. Set the owning side too - <code>child.setParent(parent)</code>.</td></tr>
<tr><td>What does <code>cascade = CascadeType.ALL</code> do?</td><td>Propagates persist, merge, remove, refresh and detach from the parent to the children, so one <code>save()</code> writes the whole graph.</td></tr>
<tr><td>What is <code>orphanRemoval</code>?</td><td>Removing a child from the parent's collection deletes its row. Different from cascade REMOVE, which only fires when the parent is deleted.</td></tr>
<tr><td>Default fetch types?</td><td>@OneToOne and @ManyToOne are EAGER; @OneToMany and @ManyToMany are LAZY.</td></tr>
<tr><td>What is the N+1 select problem?</td><td>One query for a list, then one extra query per row for an eager association. Fix with <code>join fetch</code> or <code>@EntityGraph</code>.</td></tr>
<tr><td>What causes LazyInitializationException?</td><td>Touching a lazy association after the persistence context has closed. Fetch it inside the transaction.</td></tr>
<tr><td>Why does a bidirectional mapping break JSON serialisation?</td><td>Jackson follows both directions forever - infinite recursion. Fix with @JsonIgnore or, properly, by returning a DTO.</td></tr>
<tr><td>How do you guarantee a @OneToOne really is one-to-one?</td><td>Add a UNIQUE constraint on the FK column, or use a shared primary key with <code>@MapsId</code>.</td></tr>
</table>`
        }
    ]
};
