import { Topic } from '../coreJava';

export const springRepository: Topic = {
    id: 'sb-repository',
    name: "@Repository",
    beginner: [
        {
            content: `<h3>The Stereotype That Earns Its Name</h3>
Unlike <code>@Service</code>, <code>@Repository</code> does something. It registers a bean like any <code>@Component</code>, and it additionally marks the class for <strong>persistence exception translation</strong>.<br><br>

The problem it solves is specific. Every persistence technology throws its own exceptions, and they are not compatible with each other:<br><br>

<table>
<tr><th>Technology</th><th>Throws</th></tr>
<tr><td>Plain JDBC</td><td><code>java.sql.SQLException</code> - checked, and carrying a vendor-specific error code</td></tr>
<tr><td>Hibernate</td><td><code>org.hibernate.HibernateException</code></td></tr>
<tr><td>JPA</td><td><code>jakarta.persistence.PersistenceException</code></td></tr>
</table>
<br>
A service catching any of these is welded to that technology, and a <code>SQLException</code> tells you nothing useful without looking up what error code <code>1062</code> means in MySQL - which is not what it means in PostgreSQL.<br><br>

Spring translates all of them into one hierarchy: <code>DataAccessException</code>, which is <strong>unchecked</strong> and <strong>vendor-neutral</strong>.<br>`
        },
        {
            content: `<h3>What Translation Looks Like</h3>`,
            codeExamples: [
                `// WITHOUT translation - the caller must know MySQL.

public void save(User user) throws SQLException {
    try {
        jdbc.execute("INSERT INTO users ...");
    } catch (SQLException e) {
        if (e.getErrorCode() == 1062) {          // MySQL: duplicate entry
            throw new DuplicateUserException();
        }
        throw e;
    }
}

// Three problems:
//   * 1062 is a MySQL code. On PostgreSQL the same failure is SQLSTATE
//     23505 and errorCode 0. Moving database breaks this silently.
//   * SQLException is checked, so it spreads up through every caller
//     or gets wrapped by hand at every level.
//   * The service layer now contains database vendor knowledge.`,
                `// WITH @Repository - the same failure, already interpreted.

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;
    public UserRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public void save(User user) {                    // no throws clause
        jdbc.update("INSERT INTO users (email) VALUES (?)", user.email());
    }
}

@Service
public class RegistrationService {

    public void register(String email) {
        try {
            users.save(new User(email));
        } catch (DuplicateKeyException e) {          // meaning, not a code
            throw new EmailAlreadyRegisteredException(email);
        }
    }
}

// DuplicateKeyException is raised whether the database is MySQL,
// PostgreSQL, Oracle or H2. The service reads as business logic
// because the vendor detail was translated one layer down.`
            ]
        },
        {
            content: `<h3>The <code>DataAccessException</code> Hierarchy</h3>
The value is in catching the branch that matches your intent, rather than everything.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  DataAccessException  (unchecked)
    |
    +-- DataIntegrityViolationException      constraint broken
    |     +-- DuplicateKeyException            unique key
    |
    +-- DataAccessResourceFailureException   cannot reach the database
    |
    +-- OptimisticLockingFailureException    @Version mismatch
    |     +-- ObjectOptimisticLockingFailureException
    |
    +-- PessimisticLockingFailureException
    |     +-- CannotAcquireLockException       lock wait timeout
    |     +-- DeadlockLoserDataAccessException deadlock victim
    |
    +-- EmptyResultDataAccessException       queryForObject found none
    |
    +-- IncorrectResultSizeDataAccessException  expected 1, got N
    |
    +-- QueryTimeoutException
    |
    +-- BadSqlGrammarException               malformed SQL</pre>
<br>
Two of these are worth acting on specifically. <code>DuplicateKeyException</code> is a business condition ("that email is taken") rather than a fault. <code>CannotAcquireLockException</code> and <code>DeadlockLoserDataAccessException</code> are <em>transient</em> - the same operation may succeed on retry, which distinguishes them from every other branch.<br>`,
            codeExamples: [
                `// Retrying only what is worth retrying.

@Service
public class TransferService {

    @Retryable(retryFor = TransientDataAccessException.class,
               maxAttempts = 3,
               backoff = @Backoff(delay = 100, multiplier = 2))
    @Transactional
    public void transfer(Long from, Long to, Money amount) { ... }
}

// TransientDataAccessException is the parent of the deadlock and
// lock-timeout branches. Retrying those is correct - the transaction
// lost a race and the next attempt may win.
//
// Retrying DataIntegrityViolationException is not: a broken
// constraint will break again, three times, more slowly.`
            ]
        },
        {
            content: `<h3>The Part That Surprises People</h3>
<strong>Spring Data JPA repositories do not need <code>@Repository</code>.</strong><br><br>

A repository declared as an interface extending <code>JpaRepository</code> gets its implementation generated by Spring Data at startup, and that generated proxy already applies exception translation. Adding the annotation is harmless and changes nothing.<br>`,
            codeExamples: [
                `// No annotation needed. Spring Data finds this because
// @EnableJpaRepositories (implied by Spring Boot auto-configuration)
// scans for interfaces extending Repository.

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
}

// Translation is already active - a constraint violation here arrives
// as DataIntegrityViolationException, not a raw PersistenceException.

// @Repository IS required when you write the class yourself:

@Repository                                    // <-- needed here
public class OrderReportRepository {

    private final EntityManager em;
    public OrderReportRepository(EntityManager em) { this.em = em; }

    public List<Row> monthlyTotals() {
        return em.createQuery("...", Row.class).getResultList();
    }
}

// Without the annotation this class is not even a bean. With it, both
// registration and translation apply.

// Summary:
//   interface extends JpaRepository   -> nothing needed
//   your own class using EntityManager
//     or JdbcTemplate                 -> @Repository`
            ]
        }
    ],
    expert: [
        {
            content: `<h3>How the Translation Actually Happens</h3>
It is not the annotation doing the work. <code>@Repository</code> is only a marker; a <code>BeanPostProcessor</code> looks for it and wraps the bean.<br><br>

<pre class="bg-[#1e1e2e] text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-[13px] leading-6">  PersistenceExceptionTranslationPostProcessor
        |  at startup, finds every @Repository bean
        v
  wraps it in a proxy
        |
        v
  call arrives ---> your method ---> throws PersistenceException
        |                                     |
        |            proxy catches it <-------+
        v
  PersistenceExceptionTranslator.translateExceptionIfPossible(ex)
        |
        v
  DataAccessException  --->  propagates to the caller</pre>
<br>
Spring Boot registers that post-processor automatically. In a non-Boot application it must be declared, and its absence is the usual reason translation "does not work".<br><br>

Two consequences follow from it being a proxy, and both catch people out:<br><br>

<table>
<tr><th>Consequence</th><th>Detail</th></tr>
<tr><td>Translation happens at the <strong>boundary</strong></td><td>Inside your own repository method, the exception is still the raw <code>PersistenceException</code>. It is translated on the way out. A <code>catch (DataAccessException e)</code> inside the repository itself never fires.</td></tr>
<tr><td>Self-invocation skips it</td><td>Same rule as <code>@Transactional</code> - one repository method calling another on <code>this</code> does not cross the proxy, so nothing is translated.</td></tr>
</table>`,
            codeExamples: [
                `// The non-Boot declaration, and what its absence looks like.

@Configuration
public class PersistenceConfig {

    @Bean
    public PersistenceExceptionTranslationPostProcessor exceptionTranslation() {
        return new PersistenceExceptionTranslationPostProcessor();
    }
}

// Without this bean, a @Repository is still a bean - it is just not
// proxied, so nothing is translated:
//
//   catch (DataIntegrityViolationException e)   // never fires
//
// and the raw exception surfaces instead:
//
//   jakarta.persistence.PersistenceException:
//     org.hibernate.exception.ConstraintViolationException
//
// Symptom to recognise: the catch block is right, the exception type
// is right, and it simply never matches.`,
                `// The boundary rule, made concrete.

@Repository
public class UserRepository {

    public void save(User user) {
        try {
            em.persist(user);
        } catch (DataIntegrityViolationException e) {   // NEVER matches
            throw new DuplicateUserException();
        }
    }
}

// Inside the method, em.persist() throws Hibernate's own exception.
// Translation happens in the proxy, on the way OUT - after this catch
// block has already declined to match.
//
// Correct: catch it in the SERVICE, one layer up, where the call has
// crossed the proxy.
//
// Or, if the repository must interpret it, catch the raw type:
//     catch (ConstraintViolationException e)   // org.hibernate
// which reintroduces exactly the vendor coupling translation exists
// to remove. Catching in the service is the better answer.`
            ]
        },
        {
            content: `<h3>How a Vendor Code Becomes a Spring Exception</h3>
For JDBC there are two translators, and knowing which is active explains the accuracy you get.<br><br>

<table>
<tr><th>Translator</th><th>Basis</th></tr>
<tr><td><code>SQLErrorCodeSQLExceptionTranslator</code></td><td>Vendor error codes read from <code>sql-error-codes.xml</code>, shipped inside <code>spring-jdbc</code>. Precise, but only for the databases listed there. <strong>Deprecated in Spring 6.</strong></td></tr>
<tr><td><code>SQLExceptionSubclassTranslator</code> / <code>SQLStateSQLExceptionTranslator</code></td><td>The JDBC 4 <code>SQLException</code> subclasses and the standard SQLSTATE class codes. Works with any driver; slightly coarser. <strong>The Spring 6 default.</strong></td></tr>
</table>
<br>
The practical effect of that change: on Spring 6 a database not covered by the old XML now translates correctly through SQLSTATE, but a few translations that used to be precise via vendor codes may land on a parent type instead. Code that catches <code>DataIntegrityViolationException</code> is unaffected; code that catches only <code>DuplicateKeyException</code> is worth re-checking after an upgrade.<br>`,
            codeExamples: [
                `// A custom translator, for a vendor-specific condition Spring cannot
// know about - here Oracle's ORA-00060 (deadlock) exposed under a code
// a legacy driver reports differently.

@Component
public class OracleQuirkTranslator extends SQLErrorCodeSQLExceptionTranslator {

    @Override
    protected DataAccessException customTranslate(String task,
                                                  String sql,
                                                  SQLException ex) {
        if (ex.getErrorCode() == 60) {
            return new DeadlockLoserDataAccessException(task, ex);
        }
        if (ex.getErrorCode() == 54) {        // ORA-00054: resource busy
            return new CannotAcquireLockException(task, ex);
        }
        return null;                          // fall through to the default
    }
}

@Bean
public JdbcTemplate jdbcTemplate(DataSource ds, OracleQuirkTranslator t) {
    JdbcTemplate template = new JdbcTemplate(ds);
    template.setExceptionTranslator(t);
    return template;
}

// Returning null is the contract for "I have no opinion" - the default
// chain then runs. Returning an exception short-circuits it.
//
// Why bother: both of these are TransientDataAccessException subtypes,
// so classifying them correctly is what makes @Retryable retry the
// right failures and leave the rest alone.`
            ]
        },
        {
            content: `<h3>What Belongs in a Repository</h3>
The boundary is easier to hold than the service one, because it is defined by exclusion.<br><br>

<table>
<tr><th>Belongs</th><th>Does not</th></tr>
<tr><td>Queries and writes</td><td>Business rules and validation</td></tr>
<tr><td>Mapping rows to entities</td><td>Transaction boundaries (<code>@Transactional</code> belongs on the service)</td></tr>
<tr><td>Query-shaped projections and DTOs</td><td>Calls to other services</td></tr>
<tr><td>Database-specific tuning - hints, batch size, fetch strategy</td><td>HTTP concerns of any kind</td></tr>
</table>
<br>
One rule that catches people: a repository method should not decide <em>what to do</em> when a row is missing. Returning <code>Optional&lt;Order&gt;</code> is the repository's job; deciding whether an empty result is a 404, a default, or an exception is the service's.<br>`,
            codeExamples: [
                `// The repository states a fact.
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByReference(String reference);
}

// The service decides what the fact means. Different callers can
// decide differently:
@Service
public class OrderService {

    public Order require(String reference) {
        return orders.findByReference(reference)
                     .orElseThrow(() -> new OrderNotFoundException(reference));
    }

    public Order findOrCreate(String reference) {
        return orders.findByReference(reference)
                     .orElseGet(() -> orders.save(Order.draft(reference)));
    }
}

// Had the repository thrown on a missing row, findOrCreate() would
// have to catch an exception to implement its normal path - which is
// how exceptions end up used as control flow.`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>

<table>
<tr><th>Question</th><th>Answer</th></tr>
<tr><td>What does <code>@Repository</code> do beyond <code>@Component</code>?</td><td>Marks the bean for persistence exception translation - vendor exceptions become Spring's unchecked <code>DataAccessException</code> hierarchy.</td></tr>
<tr><td>Why translate at all?</td><td><code>SQLException</code> is checked and carries vendor-specific codes. Translation gives one unchecked, vendor-neutral hierarchy so the service layer holds no database knowledge.</td></tr>
<tr><td>What performs the translation?</td><td><code>PersistenceExceptionTranslationPostProcessor</code> wraps every <code>@Repository</code> in a proxy that calls a <code>PersistenceExceptionTranslator</code>. Boot registers it automatically; a non-Boot application must declare it.</td></tr>
<tr><td>Do Spring Data JPA interfaces need the annotation?</td><td>No. The generated proxy already translates. It is required only for repository classes you write yourself.</td></tr>
<tr><td>Why does catching <code>DataAccessException</code> inside the repository not work?</td><td>Translation happens in the proxy as the exception leaves the bean, after any internal catch has run. Catch it in the service.</td></tr>
<tr><td>Name useful subtypes.</td><td><code>DuplicateKeyException</code>, <code>DataIntegrityViolationException</code>, <code>EmptyResultDataAccessException</code>, <code>OptimisticLockingFailureException</code>, <code>DeadlockLoserDataAccessException</code>, <code>BadSqlGrammarException</code>.</td></tr>
<tr><td>Which are worth retrying?</td><td>Only <code>TransientDataAccessException</code> subtypes - deadlocks and lock timeouts. A constraint violation will fail identically on retry.</td></tr>
<tr><td>How does Spring map a vendor code?</td><td>Historically <code>SQLErrorCodeSQLExceptionTranslator</code> using <code>sql-error-codes.xml</code>; from Spring 6 the default is SQLSTATE and JDBC 4 exception subclasses, with the error-code translator deprecated.</td></tr>
<tr><td>Should <code>@Transactional</code> go on the repository?</td><td>No - the service owns the unit of work. Per-repository transactions commit each step separately and cannot roll back an operation as a whole.</td></tr>
<tr><td>Should a repository throw when a row is missing?</td><td>No. Return <code>Optional</code> and let the service decide whether that is a 404, a default, or an error.</td></tr>
</table>`
        }
    ]
};
