import { Topic } from '../coreJava';

export const springBootManyToOneAndManyToMany: Topic = {
    id: 'spring-boot-many-to-one-many',
    name: 'Mapping - Many-to-One & Many-to-Many',
    beginner: [
        {
            content: `<h3>1. Many-to-One Mapping</h3>
Many-to-one means that multiple rows in a table can be mapped to a single row in another table.<br><br>
<strong>Example:</strong> many employees have one address.<br><br>

<strong>Business requirement:</strong> save many employee details with one address into the database.<br>
<strong>Problem statement:</strong> design the REST API to save multiple employees with one address.<br><br>

<h3>Table structure</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  EMPLOYEE TABLE            M        1        ADDRESS TABLE
 +-----------------+       <-------->       +----------------+
 | id         (PK) |                        | id        (PK) |
 | first_name      |                        | address_line   |
 | last_name       |                        | city           |
 | city            |                        | state          |
 | address_id (FK) |                        | country        |
 +-----------------+                        +----------------+</pre>
<br>
Many-to-one is simply the <strong>other end of a one-to-many</strong>. The same foreign key column, <code>address_id</code>, serves both views: <code>@ManyToOne</code> on Employee owns it, <code>@OneToMany(mappedBy = "address")</code> on Address reads it.<br>`,
            codeExamples: [
                `// Step 3 - Employee.java  (the MANY side - it owns the FK)
package com.example.demo.model;

import javax.persistence.*;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String firstName;
    private String lastName;
    private String city;

    @ManyToOne
    @JoinColumn(name = "address_id")
    private Address address;

    // getters and setters
}`,
                `// Step 3 - Address.java  (the ONE side - inverse)
package com.example.demo.model;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.*;

@Entity
@Table(name = "address")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String addressLine;
    private String city;
    private String state;
    private String country;

    @OneToMany(mappedBy = "address", cascade = CascadeType.ALL)
    private List<Employee> employeeList = new ArrayList<>();

    public void addEmployee(Employee e) {
        employeeList.add(e);
        e.setAddress(this);           // set the OWNING side
    }

    // getters and setters
}`
            ]
        },
        {
            content: `<h3>Many-to-One - Service, Repository, Controller</h3>
Two entities, so two repositories and two services. The controller receives an <code>Address</code> carrying its employees, saves the address, then links each employee to it.<br>`,
            codeExamples: [
                `// EmployeeRepository.java  and  AddressRepository.java
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
}

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
}
// The ID type parameter must be Integer - both entities use an int id.
// Declaring JpaRepository<Employee, String> compiles but every
// findById() then fails at runtime with a type mismatch.`,
                `// AddressServiceImpl.java
@Service
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Transactional
    @Override
    public Address saveAddress(Address address) {
        // Link every employee to this address before saving,
        // so the cascade writes a correct address_id.
        address.getEmployeeList().forEach(e -> e.setAddress(address));
        return addressRepository.save(address);
    }
}`,
                `// EmployeeController.java
@RestController
@RequestMapping("/employee")
public class EmployeeController {

    @Autowired
    private AddressService addressService;

    @PostMapping("/saveEmpAddress")
    public ResponseEntity<Address> saveEmployeeAddress(@RequestBody Address address) {
        return ResponseEntity.ok(addressService.saveAddress(address));
    }
}`,
                `// POST http://localhost:8181/employee/saveEmpAddress
// REQUEST BODY
{
    "addressLine": "M G Road",
    "city": "pune",
    "state": "maharashtra",
    "country": "india",
    "employeeList": [
        { "firstName": "ajay",  "lastName": "patil",    "city": "pune" },
        { "firstName": "sohan", "lastName": "deshmukh", "city": "pune" }
    ]
}

// CONSOLE:
// Hibernate: insert into address (address_line, city, country, state) values (?, ?, ?, ?)
// Hibernate: insert into employee (address_id, city, first_name, last_name) values (?, ?, ?, ?)
// Hibernate: insert into employee (address_id, city, first_name, last_name) values (?, ?, ?, ?)

// DATABASE
// address:                       employee:
// +----+--------------+------+   +----+------------+------------+
// | id | address_line | city |   | id | first_name | address_id |
// +----+--------------+------+   +----+------------+------------+
// |  1 | M G Road     | pune |   |  1 | ajay       |          1 |
// +----+--------------+------+   |  2 | sohan      |          1 |
//                                +----+------------+------------+
// Two employees, one address. That is many-to-one.`
            ]
        },
        {
            content: `<h3>2. Many-to-Many Mapping</h3>
Many-to-many means multiple rows in a table can be mapped to multiple rows in another table.<br><br>
<strong>Example:</strong> one user has many nominees, and many nominees belong to one user.<br><br>

<strong>Business requirement:</strong> save multiple user details with multiple nominee details.<br>
<strong>Problem statement:</strong> design the REST API to save users with their nominees.<br><br>

<h3>Table structure - note the third table</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">   USER TABLE          USER_NOMINEE (join table)      NOMINEE TABLE
 +------------+        +--------------------+        +------------+
 | id   (PK)  | <----- | user_id     (FK)   |        | id   (PK)  |
 | name       |        | nominee_id  (FK)   | -----> | name       |
 | email      |        +--------------------+        +------------+
 +------------+</pre>
<br>
A many-to-many cannot be stored with a single foreign key on either side, so it always needs a <strong>join table</strong> holding one row per pairing.<br>`,
            codeExamples: [
                `// Step 3 - User.java  (the OWNING side - it declares the join table)
package com.velocity.model;

import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name")
    private String name;

    @Column(name = "email")
    private String email;

    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "user_nominee",
        joinColumns        = @JoinColumn(name = "user_id",    referencedColumnName = "id"),
        inverseJoinColumns = @JoinColumn(name = "nominee_id", referencedColumnName = "id"))
    private Set<Nominee> nominees = new HashSet<>();

    // getters and setters
}
// joinColumns        -> the FK pointing back at THIS entity
// inverseJoinColumns -> the FK pointing at the OTHER entity`,
                `// Step 3 - Nominee.java  (the INVERSE side)
package com.velocity.model;

import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;

@Entity
@Table(name = "nominee")
public class Nominee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "name")
    private String name;

    @ManyToMany(mappedBy = "nominees")
    private Set<User> users = new HashSet<>();

    // getters and setters
}
// mappedBy = "nominees" points at the FIELD on User.
// Only User declares @JoinTable - declaring it on both sides
// creates TWO join tables.`
            ]
        },
        {
            content: `<h3>Many-to-Many - Repository, Service, Controller</h3>
Both ids are declared <code>long</code>, so both repositories take <code>Long</code>.<br>`,
            codeExamples: [
                `@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}

@Repository
public interface NomineeRepository extends JpaRepository<Nominee, Long> {
}
// Long, not String - the id fields are declared long.`,
                `// UserServiceImpl.java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User saveUser(User user) {
        return userRepository.save(user);
    }
}

// UserController.java
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/saveUser")
    public User saveUser(@RequestBody User user) {
        return userService.saveUser(user);
    }
}`,
                `// POST http://localhost:8181/user/saveUser
// REQUEST BODY
{
    "name": "ajay",
    "email": "ajay@gmail.com",
    "nominees": [
        { "name": "sunita patil" },
        { "name": "rohan patil" }
    ]
}

// CONSOLE - three tables written:
// Hibernate: insert into user (email, name) values (?, ?)
// Hibernate: insert into nominee (name) values (?)
// Hibernate: insert into nominee (name) values (?)
// Hibernate: insert into user_nominee (user_id, nominee_id) values (?, ?)
// Hibernate: insert into user_nominee (user_id, nominee_id) values (?, ?)

// DATABASE
// user:                    nominee:                 user_nominee:
// +----+------+            +----+---------------+   +---------+------------+
// | id | name |            | id | name          |   | user_id | nominee_id |
// +----+------+            +----+---------------+   +---------+------------+
// |  1 | ajay |            |  1 | sunita patil  |   |       1 |          1 |
// +----+------+            |  2 | rohan patil   |   |       1 |          2 |
//                          +----+---------------+   +---------+------------+`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Why <code>Set</code> and Not <code>List</code> for Many-to-Many</h3>
The example declares <code>Set&lt;Nominee&gt;</code>, and that is not a style preference.<br><br>

With a <code>List</code>, removing one element from a many-to-many collection makes Hibernate <strong>delete every join-table row for that owner and re-insert the survivors</strong>. With 50 nominees, removing one produces 50 deletes and 49 inserts.<br><br>

A <code>Set</code> has no ordering to maintain, so Hibernate issues a single targeted delete.<br><br>

<table>
<tr><th>Collection</th><th>Removing one element from 50</th></tr>
<tr><td><code>List</code></td><td>1 bulk DELETE + 49 INSERTs</td></tr>
<tr><td><code>Set</code></td><td>1 DELETE</td></tr>
</table>
<br>
Using a <code>Set</code> means the entity needs sane <code>equals()</code> and <code>hashCode()</code>. The rule: <strong>never use the generated id</strong> - it is null before the entity is saved, so the object's hash changes after insertion and it is lost inside the HashSet. Use a business key, or the pattern below.<br>`,
            codeExamples: [
                `@Entity
public class Nominee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        // getClass() would fail for Hibernate proxies; instanceof is safe
        if (!(o instanceof Nominee other)) return false;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        // A CONSTANT hash: stable before and after the id is assigned.
        return getClass().hashCode();
    }
}
// This is the standard JPA pattern. The constant hashCode looks wrong
// but is correct here - entity collections are small, and stability
// across the transient-to-persistent transition matters far more
// than hash distribution.`
            ]
        },
        {
            content: `<h3><code>CascadeType.ALL</code> on a Many-to-Many Is Almost Always Wrong</h3>
<code>ALL</code> includes <code>REMOVE</code>. On a many-to-many that means deleting a user deletes the nominee rows themselves - including nominees shared with other users.<br>`,
            codeExamples: [
                `// The setup from the walkthrough
@ManyToMany(cascade = CascadeType.ALL)
@JoinTable(name = "user_nominee", ...)
private Set<Nominee> nominees;

// user 1 -> nominee "sunita"
// user 2 -> nominee "sunita"   (the same row - shared)

userRepository.deleteById(1L);
// OUTPUT:
// delete from user_nominee where user_id=?
// delete from nominee where id=?          <-- deletes sunita
// delete from user where id=?
//
// User 2 now points at a nominee row that no longer exists, or the
// delete fails outright with a foreign key constraint violation.`,
                `// CORRECT for a many-to-many: cascade only PERSIST and MERGE.
@ManyToMany(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
@JoinTable(
    name = "user_nominee",
    joinColumns        = @JoinColumn(name = "user_id"),
    inverseJoinColumns = @JoinColumn(name = "nominee_id"))
private Set<Nominee> nominees = new HashSet<>();

// Removing the LINK, not the nominee:
public void removeNominee(Nominee n) {
    nominees.remove(n);
    n.getUsers().remove(this);
}
// OUTPUT:
// delete from user_nominee where user_id=? and nominee_id=?
// The nominee row survives for whoever else references it.`
            ]
        },
        {
            content: `<h3>When to Replace @ManyToMany With Two @OneToMany</h3>
A plain <code>@ManyToMany</code> gives you a join table with exactly two columns. The moment the relationship needs an attribute of its own - a date, a status, a percentage - that shape stops working.<br><br>

<table>
<tr><th>Question about the pairing</th><th>Verdict</th></tr>
<tr><td>Does it need any extra column?</td><td>Replace with an explicit join entity.</td></tr>
<tr><td>Does it need its own id or audit fields?</td><td>Replace.</td></tr>
<tr><td>Do you ever query the pairings directly?</td><td>Replace.</td></tr>
<tr><td>Purely "which of these link to which"?</td><td><code>@ManyToMany</code> is fine.</td></tr>
</table>
<br>
Nominees are a good example of the first case: real insurance nominees carry a relationship type and a share percentage, neither of which fits in a two-column join table.<br>`,
            codeExamples: [
                `// The join table becomes a real entity
@Entity
@Table(name = "user_nominee")
public class UserNominee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nominee_id")
    private Nominee nominee;

    private String relationship;       // "spouse", "son"
    private Integer sharePercent;      // 60, 40
    private LocalDate addedOn;
}

@Entity
public class User {
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserNominee> nominees = new ArrayList<>();
}

@Entity
public class Nominee {
    @OneToMany(mappedBy = "nominee")
    private List<UserNominee> users = new ArrayList<>();
}
// OUTPUT:
// user_nominee now holds (id, user_id, nominee_id, relationship,
//                         share_percent, added_on)
// and can be queried, sorted and validated like any other table -
// "do the shares add up to 100?" is now a question you can ask.`
            ]
        },
        {
            content: `<h3>Reading the Four Mappings Off the Schema</h3>
Once the foreign keys are drawn, the annotations follow mechanically.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">ONE-TO-ONE          FK on either table, with a UNIQUE constraint
  user.cart_id -> cart.id  UNIQUE
      User:  @OneToOne @JoinColumn(name="cart_id")
      Cart:  @OneToOne(mappedBy="cart")

ONE-TO-MANY / MANY-TO-ONE     FK on the MANY table
  policy.user_id -> user.id
      Policy: @ManyToOne @JoinColumn(name="user_id")     <- owner
      User:   @OneToMany(mappedBy="user")                <- inverse

MANY-TO-MANY        a JOIN TABLE with two FKs
  user_nominee(user_id, nominee_id)
      User:    @ManyToMany @JoinTable(...)               <- owner
      Nominee: @ManyToMany(mappedBy="nominees")          <- inverse</pre>

<table>
<tr><th>Mapping</th><th>Owning side</th><th>Where the FK lives</th></tr>
<tr><td>@OneToOne</td><td>Whichever declares @JoinColumn</td><td>That entity's table</td></tr>
<tr><td>@OneToMany / @ManyToOne</td><td>Always the @ManyToOne side</td><td>The "many" table</td></tr>
<tr><td>@ManyToMany</td><td>Whichever declares @JoinTable</td><td>A separate join table</td></tr>
</table>
<br>
<strong>A unidirectional <code>@OneToMany</code> without <code>mappedBy</code> is a trap:</strong> with no <code>@ManyToOne</code> on the child, JPA creates a join table even though a plain foreign key would do, and updates it with extra statements. Add <code>@JoinColumn</code> to force the foreign-key form, or make the association bidirectional.<br>`,
            codeExamples: [
                `// Unidirectional @OneToMany with NO mappedBy and NO @JoinColumn
@Entity
public class User {
    @OneToMany(cascade = CascadeType.ALL)
    private List<Policy> policyList;      // Policy has no User field
}
// OUTPUT - an unexpected third table:
// create table user_policy_list (
//     user_id integer not null,
//     policy_list_id integer not null
// )
// insert into policy ...
// insert into user_policy_list (user_id, policy_list_id) values (?, ?)

// FIX - force the foreign-key form
@OneToMany(cascade = CascadeType.ALL)
@JoinColumn(name = "user_id")
private List<Policy> policyList;
// OUTPUT:
// insert into policy ...
// update policy set user_id=? where id=?
// No join table - but still an extra UPDATE, which is why the
// bidirectional @ManyToOne form remains the best one.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>Difference between @OneToMany and @ManyToOne?</td><td>Two views of the same foreign key. @ManyToOne sits on the child and owns the FK column; @OneToMany sits on the parent with <code>mappedBy</code> and is the inverse view.</td></tr>
<tr><td>Why does a many-to-many need a join table?</td><td>Neither table can hold many foreign keys in one column, so the pairings live in a separate two-column table.</td></tr>
<tr><td>What do joinColumns and inverseJoinColumns mean?</td><td>In <code>@JoinTable</code>, joinColumns is the FK back to the owning entity; inverseJoinColumns is the FK to the other entity.</td></tr>
<tr><td>Which side should declare @JoinTable?</td><td>Only the owning side. Declaring it on both creates two join tables.</td></tr>
<tr><td>Why use Set rather than List for @ManyToMany?</td><td>With a List, removing one element makes Hibernate delete and re-insert every join row for that owner. A Set issues one targeted delete.</td></tr>
<tr><td>What is the rule for equals/hashCode on a JPA entity?</td><td>Never base hashCode on a generated id - it is null before insert, so the object is lost inside a HashSet. Use a business key or a constant hashCode.</td></tr>
<tr><td>Why is CascadeType.ALL dangerous on @ManyToMany?</td><td>It includes REMOVE, so deleting one owner deletes shared rows on the other side. Cascade only PERSIST and MERGE.</td></tr>
<tr><td>How do you remove just the association?</td><td>Remove the element from both collections. Only the join-table row is deleted; the entity rows survive.</td></tr>
<tr><td>When should @ManyToMany become two @OneToMany?</td><td>As soon as the relationship needs its own attributes - a date, status, or percentage - or you need to query the pairings directly.</td></tr>
<tr><td>What happens with a unidirectional @OneToMany and no @JoinColumn?</td><td>JPA silently creates a join table instead of using a foreign key. Add <code>@JoinColumn</code>, or make it bidirectional.</td></tr>
<tr><td>Default fetch type for @ManyToOne?</td><td>EAGER - the usual source of N+1 selects. Set it to LAZY and fetch deliberately.</td></tr>
</table>`
        }
    ]
};
