import { Topic } from '../coreJava';

export const springBootDerivedQueries: Topic = {
    id: 'spring-boot-derived-queries',
    name: 'Derived Query Methods - Fetch by Single & Multiple Fields',
    beginner: [
        {
            content: `<h3>Spring Data JPA</h3>
<div class="border">
• It is part of the Spring framework.<br>
• It reduces the amount of boilerplate code in the repository / DAO layer.<br>
• It <strong>generates the JPA query on your behalf</strong> from the method name - you write the name, Spring writes the query.<br>
</div><br>

<h3>The Naming Rules</h3>
<div class="border">
• Create a method starting with the prefix <code>findBy</code> followed by the field name.<br>
• For several fields, join them with the logical operators <code>And</code> / <code>Or</code>:<br>
&nbsp;&nbsp;<code>findByFieldName1AndFieldName2</code>, <code>findByFieldName1OrFieldName2</code><br>
</div><br>

Suppose <code>Employee</code> has <code>id</code>, <code>name</code>, <code>city</code> and <code>status</code>, and you want to fetch by city. Several method names work:<br><br>

<table>
<tr><th>Method name</th><th>Valid?</th></tr>
<tr><td>findByCity()</td><td>Yes - and the preferred form by Java naming convention.</td></tr>
<tr><td>findBycity()</td><td>Works. Spring is tolerant of the first letter's case.</td></tr>
<tr><td>getByCity() / readByCity() / queryByCity()</td><td>Work. <code>get</code>, <code>read</code>, <code>query</code>, <code>search</code>, <code>stream</code> are all recognised prefixes.</td></tr>
<tr><td>fetchByCity()</td><td><strong>Does not work.</strong> <code>fetch</code> is not a recognised prefix - startup fails.</td></tr>
<tr><td>findBycities()</td><td><strong>Does not work.</strong> There is no <code>cities</code> field, so the property cannot be resolved.</td></tr>
</table>
<br>
The part after <code>By</code> must name a <strong>real field on the entity</strong>. Get it wrong and the application refuses to start:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">org.springframework.data.mapping.PropertyReferenceException:
  No property 'cities' found for type 'Employee'
  Did you mean 'city'?</pre>
<br>
That failure at startup is the feature: a typo in a query method is caught before a single request arrives.<br>`
        },
        {
            content: `<h3>Business Requirement 1 - Single Field</h3>
Fetch user details based on the email id from the database.<br><br>

<strong>Problem statement:</strong> design the REST API to fetch user details by email id.<br><br>

The <code>User</code> entity carries the fields the rest of this topic uses.<br>`,
            codeExamples: [
                `// Step 3 - User.java
package com.velocity.model;

import javax.persistence.*;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String email;
    private String password;
    private String username;
    private String city;
    private String status;

    // getters and setters for every field
}`,
                `// Step 6 - UserRepository.java
package com.velocity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.velocity.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // One line. Spring Data writes the SQL from the method name.
    User findByEmail(String email);
}
// NOTE the ID type: Integer, because User.id is Integer.
// Declaring JpaRepository<User, Long> compiles but breaks every
// findById() call at runtime with a type-mismatch error.`,
                `// Step 5 - UserServiceImpl.java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User findByEmail(String emailId) throws Exception {
        User user = userRepository.findByEmail(emailId);
        if (user == null) {
            throw new Exception("You dont have account.");
        }
        return user;
    }
}`,
                `// Step 7 - UserController.java
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/checkbyEmail")
    public User checkUserByEmail(@RequestParam("userEmail") String userEmail)
            throws Exception {
        return userService.findByEmail(userEmail);
    }
}`,
                `// REQUEST
// Method: GET
// URL:    http://localhost:8181/checkbyEmail
// Params: userEmail = ajay@gmail.com
// (no body - we are fetching)

// RESPONSE (200 OK)
{
    "id": 1,
    "firstName": "ajay",
    "lastName": "patil",
    "email": "ajay@gmail.com",
    "city": "pune",
    "status": "active"
}

// CONSOLE:
// Hibernate: select ... from user user0_ where user0_.email=?`
            ]
        },
        {
            content: `<h3>Business Requirement 2 - Multiple Fields</h3>
Display the list of users based on <strong>city and status</strong>:<br><br>

<div class="border">
• If city is <code>pune</code> and status is <code>active</code>, display active users in Pune only.<br>
• If city is <code>mumbai</code> and status is <code>inactive</code>, display inactive users in Mumbai only.<br>
</div><br>

Two fields, joined by <code>And</code>. Nothing else changes - the return type becomes a <code>List</code> because several rows can match.<br>`,
            codeExamples: [
                `// UserRepository.java
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    List<User> findByCityAndStatus(String city, String status);
}
// Argument order follows the method name: city first, then status.
// Swap the arguments at the call site and you silently get zero rows.`,
                `// UserServiceImpl.java
@Override
public List<User> findByCityAndStatus(String city, String status) {
    return userRepository.findByCityAndStatus(city, status);
}

// UserController.java
@GetMapping("/checkbyCityandStatus")
public List<User> checkUserCityandStatus(
        @RequestParam("city") String city,
        @RequestParam("status") String status) {

    return userService.findByCityAndStatus(city, status);
}`,
                `// SCENARIO 1
// GET http://localhost:8181/checkbyCityandStatus?city=pune&status=active
// RESPONSE (200 OK)
[
    { "id": 1, "firstName": "ajay",  "city": "pune", "status": "active" },
    { "id": 3, "firstName": "vikas", "city": "pune", "status": "active" }
]

// SCENARIO 2
// GET http://localhost:8181/checkbyCityandStatus?city=mumbai&status=inactive
// RESPONSE (200 OK)
[
    { "id": 5, "firstName": "sohan", "city": "mumbai", "status": "inactive" }
]

// CONSOLE:
// Hibernate: select ... from user user0_
//            where user0_.city=? and user0_.status=?

// No match returns an EMPTY ARRAY [] with 200 OK - not 404.
// A collection endpoint returning nothing is a valid, successful answer.`
            ]
        },
        {
            content: `<h3>Business Requirement 3 - Update the Password</h3>
Update the user password based on the user id.<br><br>

This combines a read and a write: fetch the user, change one field, save it back.<br>`,
            codeExamples: [
                `// UserService.java
public interface UserService {
    public User getUser(Integer id) throws Exception;
    public User updateUser(User user);
}

// UserServiceImpl.java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public User getUser(Integer id) throws Exception {
        return userRepository.findById(id)
                .orElseThrow(() -> new Exception("User not found."));
    }

    @Override
    public User updateUser(User user) {
        return userRepository.save(user);
    }
}`,
                `// UserController.java
package com.velocity.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.velocity.model.User;
import com.velocity.services.UserService;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    // @PutMapping, not @GetMapping - this changes data.
    @PutMapping("/update/{id}")
    public Boolean updatePassword(@PathVariable("id") Integer id,
                                  @RequestParam("password") String password)
            throws Exception {

        User user = userService.getUser(id);
        if (user != null) {
            user.setPassword(password);
            userService.updateUser(user);
            return true;
        }
        return false;
    }
}`,
                `// REQUEST
// Method: PUT
// URL:    http://localhost:8181/update/1
// Params: password = 12341234

// RESPONSE (200 OK)
true

// CONSOLE:
// Hibernate: select ... from user user0_ where user0_.id=?
// Hibernate: update user set password=?, ... where id=?

// DATABASE - before:  password = oldpass123
//            after:   password = 12341234`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Never Use GET to Change Data</h3>
The original walkthrough maps the password update to <code>@GetMapping("/update/{id}")</code>. It works in Postman, and it is one of the more dangerous habits in web development.<br><br>

HTTP defines GET as <strong>safe</strong>: it must not change server state. Everything on the network assumes that.<br><br>

<table>
<tr><th>Who assumes GET is safe</th><th>What goes wrong</th></tr>
<tr><td>Browsers &amp; link prefetchers</td><td>Speculatively fetch links, changing passwords nobody asked to change.</td></tr>
<tr><td>Search-engine crawlers</td><td>Follow every URL they find, executing every update.</td></tr>
<tr><td>Proxies and CDNs</td><td>Cache the response, so the second call never reaches you - or serves someone else's result.</td></tr>
<tr><td>Retry logic</td><td>Replays a failed GET automatically, because retrying a read is harmless.</td></tr>
<tr><td>Server access logs</td><td>The new password sits in plain text in the query string, in every log and in browser history.</td></tr>
</table>
<br>
That last row matters most here: <code>?password=12341234</code> is recorded by the browser, every proxy, and the server's access log. A password belongs in the <strong>request body</strong> of a POST, PUT or PATCH, over HTTPS.<br>`,
            codeExamples: [
                `// The correct shape for a password change
public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8) String newPassword) { }

@PutMapping("/api/users/{id}/password")
@ResponseStatus(HttpStatus.NO_CONTENT)
public void changePassword(@PathVariable Integer id,
                           @Valid @RequestBody ChangePasswordRequest request) {
    userService.changePassword(id, request);
}
// OUTPUT:
// PUT /api/users/1/password
// Body: {"currentPassword":"oldpass123","newPassword":"n3wStr0ngPass"}
// -> 204 No Content
// Nothing sensitive appears in the URL, the logs, or the browser history.`,
                `// And the password must never be stored as typed.
@Service
public class UserServiceImpl implements UserService {

    private final PasswordEncoder encoder;    // BCryptPasswordEncoder

    @Override
    @Transactional
    public void changePassword(Integer id, ChangePasswordRequest req) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        if (!encoder.matches(req.currentPassword(), user.getPassword())) {
            throw new BadCredentialsException("current password is wrong");
        }

        user.setPassword(encoder.encode(req.newPassword()));
    }
}
// OUTPUT in the database:
// password = $2a$10$N9qo8uLOickgx2ZMRZoMye...
// Storing "12341234" in a password column means one leaked backup
// exposes every account.`
            ]
        },
        {
            content: `<h3>The Derived-Query Vocabulary</h3>
<code>And</code> and <code>Or</code> are the start of it. The full grammar covers most day-to-day queries without a line of SQL.<br><br>

<table>
<tr><th>Keyword</th><th>Generated condition</th></tr>
<tr><td>findByCityAndStatus</td><td><code>where city = ? and status = ?</code></td></tr>
<tr><td>findByCityOrStatus</td><td><code>where city = ? or status = ?</code></td></tr>
<tr><td>findByAgeBetween</td><td><code>where age between ? and ?</code></td></tr>
<tr><td>findByAgeGreaterThanEqual</td><td><code>where age &gt;= ?</code></td></tr>
<tr><td>findByNameLike / Containing</td><td><code>where name like ?</code> (Containing wraps the value in %)</td></tr>
<tr><td>findByNameStartingWith / EndingWith</td><td><code>like ?%</code> / <code>like %?</code></td></tr>
<tr><td>findByStatusIn(List)</td><td><code>where status in (?, ?, ?)</code></td></tr>
<tr><td>findByEmailIsNull / IsNotNull</td><td><code>where email is null</code></td></tr>
<tr><td>findByCityIgnoreCase</td><td><code>where upper(city) = upper(?)</code></td></tr>
<tr><td>findByCityOrderByNameDesc</td><td><code>where city = ? order by name desc</code></td></tr>
<tr><td>findTop5ByCity / findFirstByCity</td><td>Adds a row limit</td></tr>
<tr><td>findDistinctByCity</td><td><code>select distinct ...</code></td></tr>
<tr><td>countByCity / existsByEmail</td><td>Returns <code>long</code> / <code>boolean</code> instead of entities</td></tr>
<tr><td>deleteByStatus</td><td>Deletes matching rows - requires <code>@Transactional</code></td></tr>
</table>
<br>
Return types are just as expressive: <code>List&lt;User&gt;</code> for many, <code>Optional&lt;User&gt;</code> for at most one, <code>User</code> for exactly one (which throws <code>IncorrectResultSizeDataAccessException</code> if two rows match), <code>long</code> for a count, <code>boolean</code> for existence.<br>`,
            codeExamples: [
                `public interface UserRepository extends JpaRepository<User, Integer> {

    // Optional is the right type for a unique lookup
    Optional<User> findByEmail(String email);

    // exists is one COUNT query - far cheaper than loading the row
    boolean existsByEmail(String email);

    // case-insensitive partial match, newest first, capped at 20
    List<User> findTop20ByCityIgnoreCaseAndNameContainingOrderByIdDesc(
            String city, String namePart);

    // a set of statuses
    List<User> findByStatusIn(List<String> statuses);

    // counting without fetching
    long countByCityAndStatus(String city, String status);
}
// OUTPUT:
// existsByEmail("ajay@gmail.com")
//   -> select count(*) from user where email=?  -> true
// findByStatusIn(List.of("active","pending"))
//   -> select ... from user where status in (?, ?)`,
                `// When a "unique" lookup is not actually unique:
User findByEmail(String email);      // return type says "exactly one"

// Two rows share that email:
// OUTPUT:
// IncorrectResultSizeDataAccessException:
//   query did not return a unique result: 2

// Optional<User> gives the same error - the fix is a UNIQUE constraint
// on the column, so the database enforces what the code assumes:
@Column(unique = true, nullable = false)
private String email;`
            ]
        },
        {
            content: `<h3>When the Method Name Stops Being Readable</h3>
Derived queries are excellent up to about three conditions. Past that, the name becomes unreadable and un-editable:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">List&lt;User&gt; findByCityAndStatusAndAgeGreaterThanEqualAndEmailIsNotNullOrderByLastNameAsc(
        String city, String status, int age);</pre>
<br>
Three ways out, in order of how often you will reach for them:<br><br>

<table>
<tr><th>Approach</th><th>Use when</th></tr>
<tr><td><code>@Query</code> with JPQL</td><td>The condition is fixed but complex. Readable, and validated at startup.</td></tr>
<tr><td><code>Specification</code> (Criteria API)</td><td>Filters are <strong>optional</strong> - a search screen where the user may fill in any subset of fields.</td></tr>
<tr><td>Query by Example</td><td>Simple "match this populated probe object" searches.</td></tr>
</table>
<br>
The optional-filter case is the one derived queries genuinely cannot handle: with four optional filters you would need sixteen method names.<br>`,
            codeExamples: [
                `// @Query - the same query, readable
public interface UserRepository extends JpaRepository<User, Integer> {

    @Query("select u from User u "
         + "where u.city = :city and u.status = :status and u.age >= :minAge "
         + "order by u.lastName")
    List<User> search(@Param("city") String city,
                      @Param("status") String status,
                      @Param("minAge") int minAge);
}
// A syntax error inside the JPQL fails at STARTUP, not on first request.`,
                `// Specification - filters that may or may not be present
public class UserSpecs {

    public static Specification<User> hasCity(String city) {
        return (root, q, cb) ->
                city == null ? null : cb.equal(root.get("city"), city);
    }

    public static Specification<User> hasStatus(String status) {
        return (root, q, cb) ->
                status == null ? null : cb.equal(root.get("status"), status);
    }
}

// Repository extends JpaSpecificationExecutor<User> as well
List<User> result = userRepository.findAll(
        Specification.where(UserSpecs.hasCity(city))
                     .and(UserSpecs.hasStatus(status)));
// OUTPUT:
// city="pune", status=null   -> select ... where city=?
// city=null,   status=null   -> select ... (no where clause)
// Both filters set           -> select ... where city=? and status=?
// A null specification is skipped, so one method covers every combination.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What is a derived query method?</td><td>A repository method whose <em>name</em> Spring Data parses to generate the query - no implementation or SQL is written.</td></tr>
<tr><td>What prefixes can a query method start with?</td><td>find, get, read, query, search, stream, count, exists, delete. <code>fetch</code> is not one of them.</td></tr>
<tr><td>What happens if the property name is wrong?</td><td>Startup fails with <code>PropertyReferenceException</code>, usually suggesting the correct field - the error arrives before any request does.</td></tr>
<tr><td>How do you query on two fields?</td><td>Join them with <code>And</code> or <code>Or</code>: <code>findByCityAndStatus(String city, String status)</code>. Arguments follow the order in the name.</td></tr>
<tr><td>What does a list-returning query return when nothing matches?</td><td>An empty list - never null. The endpoint returns <code>[]</code> with 200 OK, which is correct.</td></tr>
<tr><td>What if a single-result query matches two rows?</td><td><code>IncorrectResultSizeDataAccessException</code>. Add a UNIQUE constraint or return a List.</td></tr>
<tr><td>Why is <code>existsByEmail</code> better than <code>findByEmail() != null</code>?</td><td>It issues a COUNT and never loads the entity - cheaper, and it states the intent.</td></tr>
<tr><td>Why must you never use GET for an update?</td><td>GET is defined as safe. Prefetchers, crawlers, caches and retries all assume no state changes, and query-string data lands in logs and browser history.</td></tr>
<tr><td>Where should a password travel?</td><td>In the request body of a POST/PUT/PATCH over HTTPS - never in the URL - and it must be stored hashed with BCrypt or Argon2.</td></tr>
<tr><td>When do you outgrow derived queries?</td><td>Past about three conditions, or as soon as filters are optional. Move to <code>@Query</code> for fixed complex queries, or <code>Specification</code> for dynamic ones.</td></tr>
<tr><td>Why do <code>Specification</code> filters handle optional criteria so well?</td><td>A specification that returns null is skipped, so one <code>findAll</code> call covers every combination of present and absent filters.</td></tr>
<tr><td>Which derived methods need <code>@Transactional</code>?</td><td>Modifying ones - <code>deleteBy...</code> and any <code>@Query</code> marked <code>@Modifying</code>.</td></tr>
</table>`
        }
    ]
};
