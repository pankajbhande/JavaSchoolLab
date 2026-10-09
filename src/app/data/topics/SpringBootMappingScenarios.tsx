import { Topic } from '../coreJava';

export const springBootMappingScenarios: Topic = {
    id: 'spring-boot-mapping-scenarios',
    name: 'Mapping - Real-World Scenarios',
    beginner: [
        {
            content: `<h3>Scenario 1 - One User Has Many Policies and Many Nominees</h3>
Two one-to-many relationships hanging off the same parent. This is where the individual mappings start combining into something that looks like a real application.<br><br>

<strong>Business requirement:</strong> save one user's details with multiple policies and multiple nominees.<br>
<strong>Problem statement:</strong> design the REST API to save one user with multiple policies and multiple nominees.<br><br>

<h3>Table structure</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">     POLICY TABLE                              NOMINEE TABLE
   +----------------+                        +----------------+
   | id        (PK) |                        | id        (PK) |
   | policy_id      |                        | first_name     |
   | policy_name    |                        | last_name      |
   | status         |                        | relationship   |
   | user_id   (FK) |                        | user_id   (FK) |
   +----------------+                        +----------------+
           ^  M                                   M  ^
           |                                         |
           +--------------+     +--------------------+
                        1 |     | 1
                    +--------------+
                    |  USER TABLE  |
                    | id     (PK)  |
                    | name         |
                    | email        |
                    +--------------+</pre>
<br>
Both children carry <code>user_id</code>. The user carries neither - it holds two collections instead.<br>`,
            codeExamples: [
                `// User.java - two @OneToMany collections on one parent
package com.velocity.model;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.*;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String name;
    private String email;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Policy> policyList = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Nominee> nomineeList = new ArrayList<>();

    // getters and setters
}
// mappedBy = "user" names the @ManyToOne FIELD on each child.
// Pointing it at a plain "private Integer userId" column instead
// fails at startup:
//   mappedBy reference an unknown target entity property:
//   com.velocity.model.Policy.userId`,
                `// Policy.java
@Entity
@Table(name = "policy")
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private Integer policyId;
    private String policyName;
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore                        // stops the infinite JSON loop
    private User user;

    // getters and setters
}

// Nominee.java - same shape
@Entity
@Table(name = "nominee")
public class Nominee {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String firstName;
    private String lastName;
    private String relationship;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    // getters and setters
}`
            ]
        },
        {
            content: `<h3>Scenario 1 - Saving the Whole Graph</h3>
The walkthrough saves the user, then loops over each list calling a separate service. With <code>cascade = CascadeType.ALL</code> on both collections, one <code>save()</code> does all of it - and one <code>@Transactional</code> makes it atomic.<br>`,
            codeExamples: [
                `// UserServiceImpl.java
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Transactional
    @Override
    public User saveUser(User user) {
        // Set the owning side on BOTH child lists, or user_id is NULL.
        user.getPolicyList().forEach(p -> p.setUser(user));
        user.getNomineeList().forEach(n -> n.setUser(user));

        return userRepository.save(user);
    }
}`,
                `// UserController.java
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/saveUserPolicyNominee")
    public ResponseEntity<User> saveUserPolicyNominee(@RequestBody User user) {
        return ResponseEntity.ok(userService.saveUser(user));
    }
}`,
                `// POST http://localhost:8181/user/saveUserPolicyNominee
// REQUEST BODY
{
    "name": "ajay",
    "email": "ajay@gmail.com",
    "policyList": [
        { "policyId": 101, "policyName": "Term Plan",      "status": "active" },
        { "policyId": 102, "policyName": "Endowment Plan", "status": "active" }
    ],
    "nomineeList": [
        { "firstName": "sunita", "lastName": "patil", "relationship": "spouse" },
        { "firstName": "rohan",  "lastName": "patil", "relationship": "son" }
    ]
}

// CONSOLE:
// Hibernate: insert into user (email, name) values (?, ?)
// Hibernate: insert into policy (policy_id, policy_name, status, user_id) values (?, ?, ?, ?)
// Hibernate: insert into policy (policy_id, policy_name, status, user_id) values (?, ?, ?, ?)
// Hibernate: insert into nominee (first_name, last_name, relationship, user_id) values (?, ?, ?, ?)
// Hibernate: insert into nominee (first_name, last_name, relationship, user_id) values (?, ?, ?, ?)

// DATABASE
// user:    id=1, ajay, ajay@gmail.com
// policy:  id=1 user_id=1 | id=2 user_id=1
// nominee: id=1 user_id=1 | id=2 user_id=1
//
// Five inserts, one transaction. Any failure rolls back all five.`
            ]
        },
        {
            content: `<h3>Scenario 3 - One User Has Policies, Payment Modes, Premiums and Claims</h3>
The same pattern extended to four child collections, and this time we are <strong>reading</strong> rather than writing.<br><br>

<strong>Business requirement:</strong> get one user's details together with their policies, payment modes, premiums and claims.<br><br>

<h3>Table structure</h3>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  POLICY TABLE          M   1                1   M    PAYMENT_MODE TABLE
 +----------------+  <-----+                +----->  +------------------+
 | id        (PK) |        |                |        | id          (PK) |
 | policy_id      |        |                |        | payment_type     |
 | policy_name    |        |                |        | user_id     (FK) |
 | status         |     +--------------+    |        +------------------+
 | user_id   (FK) |     |  USER TABLE  |    |
 +----------------+     | id     (PK)  |----+
                        | name         |
  PREMIUM TABLE         | email        |         CLAIM TABLE
 +----------------+     +--------------+        +------------------+
 | id        (PK) |  <-----+        +----->     | id          (PK) |
 | premium_id     |     M  1        1   M       | claim_id         |
 | amount         |                             | claim_status     |
 | user_id   (FK) |                             | claim_amount     |
 +----------------+                             | user_id     (FK) |
                                                +------------------+</pre>`,
            codeExamples: [
                `// User.java - four collections, all the same shape
@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String name;
    private String email;

    @OneToMany(mappedBy = "user")
    private List<Policy> policyList = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Premium> premiumList = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Claim> claimList = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<PaymentMode> paymentModeList = new ArrayList<>();

    // getters and setters
}`,
                `// Each child repository gets a derived finder
@Repository
public interface PolicyRepository extends JpaRepository<Policy, Integer> {
    List<Policy> findByUserId(Integer userId);
}

@Repository
public interface PremiumRepository extends JpaRepository<Premium, Integer> {
    List<Premium> findByUserId(Integer userId);
}

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Integer> {
    List<Claim> findByUserId(Integer userId);
}

@Repository
public interface PaymentModeRepository extends JpaRepository<PaymentMode, Integer> {
    List<PaymentMode> findByUserId(Integer userId);
}
// findByUserId traverses the association: user -> id.
// Spring Data resolves it to "where user_id = ?".`
            ]
        },
        {
            content: `<h3>Scenario 3 - Assembling the Response</h3>
The original controller takes five path variables - a user id plus a policy id, premium id, claim id and payment-mode id - and then uses each of them to look up <em>lists</em>. That is one id too many for the job: everything already hangs off the user, so the user id alone is enough.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">Original:  GET /user/getUser/{id}/{policyId}/{premiumId}/{claimId}/{paymentModeId}
           - five path variables, but the example calls it with four
             -> 404, because the pattern does not match the URL
           - each child list is fetched by its own id, then assigned
             to the user, and users.setId(...) overwrites the user's
             own id inside every loop

Corrected: GET /user/{id}/summary
           - one id, four lookups, one assembled response</pre>`,
            codeExamples: [
                `// UserController.java - one path variable
@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired private UserService        userService;
    @Autowired private PolicyService      policyService;
    @Autowired private PremiumService     premiumService;
    @Autowired private ClaimService       claimService;
    @Autowired private PaymentModeService paymentModeService;

    @GetMapping("/{id}/summary")
    public User getUserSummary(@PathVariable("id") Integer id) {

        User user = userService.getUser(id);

        user.setPolicyList(policyService.getPolicyListByUserId(id));
        user.setPremiumList(premiumService.getPremiumListByUserId(id));
        user.setClaimList(claimService.getClaimListByUserId(id));
        user.setPaymentModeList(paymentModeService.getPaymentModeListByUserId(id));

        return user;
    }
}
// Note what is NOT here: no user.setId(child.getUserId()) inside a
// loop. That line in the original overwrites the user's own id with
// a value it already had - and would corrupt it if the child
// belonged to a different user.`,
                `// GET http://localhost:8181/user/1/summary
// RESPONSE (200 OK)
{
    "id": 1,
    "name": "ajay",
    "email": "ajay@gmail.com",
    "policyList": [
        { "id": 1, "policyId": "P001", "policyName": "Term Plan", "status": "active" }
    ],
    "premiumList": [
        { "id": 1, "premiumId": "PR001", "amount": 12000 }
    ],
    "claimList": [
        { "id": 1, "claimId": "C001", "claimStatus": "approved", "claimAmount": 50000 }
    ],
    "paymentModeList": [
        { "id": 1, "paymentType": "NEFT" }
    ]
}

// CONSOLE - five queries, one per table:
// select ... from user where id=?
// select ... from policy where user_id=?
// select ... from premium where user_id=?
// select ... from claim where user_id=?
// select ... from payment_mode where user_id=?`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Do Not Fetch Four Collections in One Query</h3>
Scenario 3 is the classic setup for a <strong>MultipleBagFetchException</strong>. The instinct is to replace five queries with one big <code>join fetch</code>. JPA refuses:<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">org.hibernate.loader.MultipleBagFetchException:
  cannot simultaneously fetch multiple bags:
  [com.velocity.model.User.policyList, com.velocity.model.User.premiumList]</pre>
<br>
And the refusal is doing you a favour. Joining two collections produces a <strong>cartesian product</strong>: 3 policies and 4 premiums return 12 rows, not 7. Add claims and payment modes and one user with a handful of children becomes hundreds of duplicated rows that Hibernate then has to de-duplicate in memory.<br><br>

<table>
<tr><th>Approach</th><th>Verdict</th></tr>
<tr><td>One query with four <code>join fetch</code></td><td>Throws MultipleBagFetchException.</td></tr>
<tr><td>Change every <code>List</code> to <code>Set</code></td><td>Compiles and runs - and silently builds the cartesian product. Worse.</td></tr>
<tr><td>One query per collection (as above)</td><td><strong>Correct.</strong> Five small, indexed queries beat one enormous join.</td></tr>
<tr><td><code>@BatchSize</code> on each collection</td><td>Good when loading many users - batches the child queries.</td></tr>
</table>
<br>
"Five queries" sounds worse than "one query" and is not. Each is a simple indexed lookup on <code>user_id</code>; the single join would transfer the user's row four times over.<br>`,
            codeExamples: [
                `// WHAT NOT TO DO
@Query("select u from User u "
     + "left join fetch u.policyList "
     + "left join fetch u.premiumList "
     + "where u.id = :id")
Optional<User> findByIdWithEverything(@Param("id") Integer id);
// OUTPUT at startup:
// MultipleBagFetchException: cannot simultaneously fetch multiple bags

// Changing List -> Set makes it start, and now:
// 3 policies x 4 premiums = 12 result rows for one user.
// Add 2 claims -> 24 rows. Add 2 payment modes -> 48 rows.
// All to display 11 child records.`,
                `// ONE collection per query is safe and correct
@Query("select u from User u left join fetch u.policyList where u.id = :id")
Optional<User> findByIdWithPolicies(@Param("id") Integer id);

// For many users at once, @BatchSize turns N+1 into N/size + 1
@Entity
public class User {

    @OneToMany(mappedBy = "user")
    @BatchSize(size = 25)
    private List<Policy> policyList = new ArrayList<>();
}
// Loading 100 users:
// OUTPUT without @BatchSize: 1 + 100 = 101 queries
// OUTPUT with  @BatchSize:   1 + 4   = 5 queries
//   select ... from policy where user_id in (?,?,?, ... 25 ids)`
            ]
        },
        {
            content: `<h3>Returning the Entity Is Wrong Here for Three Separate Reasons</h3>
Scenario 3's endpoint returns a <code>User</code> entity with four populated collections. Each problem below is independent, and a DTO fixes all three at once.<br><br>

<table>
<tr><th>Problem</th><th>Symptom</th></tr>
<tr><td>Infinite recursion</td><td>Each child has a <code>user</code> back-reference. Without <code>@JsonIgnore</code>: StackOverflowError during serialisation.</td></tr>
<tr><td>Lazy proxies</td><td>Serialising outside a transaction throws <code>LazyInitializationException</code> - which is exactly what <code>@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})</code> is papering over in the original.</td></tr>
<tr><td>Mutating a managed entity</td><td><code>user.setPolicyList(...)</code> on an entity inside a transaction makes Hibernate think the collection changed and can trigger unwanted DELETE/INSERT statements on flush.</td></tr>
</table>
<br>
That last one is the subtle one: assigning a <em>new</em> list to a managed entity's collection replaces the Hibernate-managed collection wrapper, and Hibernate treats that as "all old children removed, all new children added".<br>`,
            codeExamples: [
                `// The response shape, decided by you rather than by the schema
public record PolicySummary(Integer id, String policyId, String policyName, String status) { }
public record PremiumSummary(Integer id, String premiumId, BigDecimal amount) { }
public record ClaimSummary(Integer id, String claimId, String claimStatus, BigDecimal amount) { }
public record PaymentModeSummary(Integer id, String paymentType) { }

public record UserSummary(
        Integer id,
        String name,
        String email,
        List<PolicySummary>      policies,
        List<PremiumSummary>     premiums,
        List<ClaimSummary>       claims,
        List<PaymentModeSummary> paymentModes) { }`,
                `@Service
public class UserSummaryService {

    @Transactional(readOnly = true)
    public UserSummary getSummary(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // The entity is never mutated - each list is read and mapped.
        return new UserSummary(
                user.getId(),
                user.getName(),
                user.getEmail(),
                policyRepository.findByUserId(userId).stream()
                        .map(p -> new PolicySummary(p.getId(), p.getPolicyId(),
                                                    p.getPolicyName(), p.getStatus()))
                        .toList(),
                premiumRepository.findByUserId(userId).stream()
                        .map(p -> new PremiumSummary(p.getId(), p.getPremiumId(),
                                                     p.getAmount()))
                        .toList(),
                claimRepository.findByUserId(userId).stream()
                        .map(c -> new ClaimSummary(c.getId(), c.getClaimId(),
                                                   c.getClaimStatus(), c.getClaimAmount()))
                        .toList(),
                paymentModeRepository.findByUserId(userId).stream()
                        .map(m -> new PaymentModeSummary(m.getId(), m.getPaymentType()))
                        .toList());
    }
}
// OUTPUT: the same JSON as before, but
//   - no recursion is possible (no back-references exist)
//   - no lazy proxy ever reaches Jackson
//   - the entity is untouched, so nothing is flushed
//   - @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
//     is no longer needed anywhere`
            ]
        },
        {
            content: `<h3>Designing the Endpoint: One Fat Response or Several?</h3>
Scenario 3 returns everything about a user in one call. Whether that is right depends on what the screen actually needs.<br><br>

<table>
<tr><th>Shape</th><th>Use when</th></tr>
<tr><td><code>GET /users/{id}/summary</code> - everything</td><td>One screen shows all of it at once. Saves four round trips.</td></tr>
<tr><td><code>GET /users/{id}/policies</code> - sub-resources</td><td>Each list has its own screen, paging, or filters. Also lets the client cache each independently.</td></tr>
<tr><td><code>GET /users/{id}?include=policies,claims</code></td><td>Client picks what it needs. Flexible, more work to implement.</td></tr>
</table>
<br>
The one thing a fat endpoint must not do is return unbounded collections. A user with 5,000 claims makes this endpoint slow, memory-hungry, and eventually the cause of an outage. Either page the sub-resources, or cap what the summary returns.<br>`,
            codeExamples: [
                `// Sub-resources, each pageable - the safe default for large children
@GetMapping("/users/{id}/claims")
public Page<ClaimSummary> claims(
        @PathVariable Integer id,
        @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC)
        Pageable pageable) {

    return claimRepository.findByUserId(id, pageable)
                          .map(ClaimSummary::from);
}
// OUTPUT:
// GET /users/1/claims?page=0&size=20
// {
//   "content": [ ...20 claims... ],
//   "totalElements": 5000,
//   "totalPages": 250,
//   "number": 0
// }
// The response size is bounded no matter how much history exists.`,
                `// If you keep the fat endpoint, cap the collections explicitly
public interface ClaimRepository extends JpaRepository<Claim, Integer> {
    List<Claim> findTop10ByUserIdOrderByIdDesc(Integer userId);
}

// and tell the client there is more
public record UserSummary(
        Integer id, String name, String email,
        List<ClaimSummary> recentClaims,
        long totalClaims,               // claimRepository.countByUserId(id)
        String claimsUrl) { }           // "/users/1/claims"
// OUTPUT:
// "recentClaims": [ ...10 items... ],
// "totalClaims": 5000,
// "claimsUrl": "/users/1/claims"`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>How do you model one parent with two different child collections?</td><td>Two <code>@OneToMany(mappedBy = "...")</code> fields on the parent, and a <code>@ManyToOne</code> back-reference on each child holding its own foreign key.</td></tr>
<tr><td>What must <code>mappedBy</code> name?</td><td>The association field on the child - not the foreign-key column. Pointing it at an <code>Integer userId</code> field fails at startup.</td></tr>
<tr><td>Why is the foreign key NULL after a cascaded save?</td><td>Only the parent's collection was populated. The child's <code>@ManyToOne</code> field is the owning side and must be set too.</td></tr>
<tr><td>What is MultipleBagFetchException?</td><td>Hibernate refusing to <code>join fetch</code> two <code>List</code> collections at once, because the result would be a cartesian product.</td></tr>
<tr><td>Does changing List to Set fix it?</td><td>It stops the exception and not the problem - the cartesian product is still built and de-duplicated in memory. Use one query per collection instead.</td></tr>
<tr><td>Is fetching four collections in four queries bad?</td><td>No. Four indexed lookups on <code>user_id</code> are cheaper than one join that repeats the parent row for every combination.</td></tr>
<tr><td>What does @BatchSize do?</td><td>Loads lazy collections for many parents in batches - <code>where user_id in (?, ?, ...)</code> - turning N+1 into roughly N/size + 1.</td></tr>
<tr><td>Why does <code>@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})</code> appear on these entities?</td><td>It hides the synthetic fields Hibernate adds to a lazy proxy so Jackson does not try to serialise them. Returning a DTO removes the need for it.</td></tr>
<tr><td>Why is assigning a new list to a managed entity's collection risky?</td><td>It replaces Hibernate's managed collection wrapper, so on flush Hibernate can delete all the old children and re-insert the new ones.</td></tr>
<tr><td>What is wrong with an endpoint returning every child collection?</td><td>The response is unbounded - a parent with thousands of children makes it slow and memory-hungry. Page the sub-resources or cap the summary.</td></tr>
<tr><td>How does <code>findByUserId</code> work when the child maps a <code>User</code> object?</td><td>Spring Data traverses the association - <code>user</code> then <code>id</code> - and generates <code>where user_id = ?</code>.</td></tr>
</table>`
        }
    ]
};
