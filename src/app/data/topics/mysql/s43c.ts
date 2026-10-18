// Module 43 (MySQL with Backend Applications), part C: transactions and repository pattern in app code.
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s43c: Record<string, DeepDive> = {
    'Transactions in Applications': dd(
        [`In application code a <b>transaction</b> groups several SQL statements on <b>one connection</b> so they commit or roll back together. Frameworks wrap this: JDBC <code>setAutoCommit(false)</code>, Spring <code>@Transactional</code>, Django <code>atomic()</code>.`,
            r`// Plain JDBC: one connection, manual commit
try (Connection c = ds.getConnection()) {
    c.setAutoCommit(false);
    try (PreparedStatement debit  = c.prepareStatement("UPDATE accounts SET balance = balance - ? WHERE id = ?");
         PreparedStatement credit = c.prepareStatement("UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
        debit.setBigDecimal(1, amt);  debit.setLong(2, 1);   debit.executeUpdate();
        credit.setBigDecimal(1, amt); credit.setLong(2, 2);  credit.executeUpdate();
        c.commit();
    } catch (SQLException e) { c.rollback(); throw e; }
}

// OUTPUT:
// both UPDATEs committed together, or neither (rollback on any exception)`],
        [`Without a transaction each statement auto-commits. A crash or exception between the debit and the credit leaves money removed but never added. Business operations are almost always more than one statement.`,
            r`-- autocommit ON: each statement is its own transaction
UPDATE accounts SET balance = balance - 500 WHERE id = 1;   -- committed
-- application crashes here
UPDATE accounts SET balance = balance + 500 WHERE id = 2;   -- never runs

SELECT SUM(balance) FROM accounts;

-- OUTPUT:
-- SUM(balance)
-- 9500        (was 10000: 500 vanished)`],
        [`Services mark a method as the unit of work. Spring opens the transaction when the method starts, commits on return and rolls back on a RuntimeException.`,
            r`@Service
public class TransferService {
    @Transactional                                   // one transaction around the whole method
    public void transfer(long from, long to, BigDecimal amt) {
        accounts.debit(from, amt);
        accounts.credit(to, amt);
        if (amt.signum() <= 0) throw new IllegalArgumentException("bad amount");  // => rollback
    }
}

// OUTPUT: (SQL seen with show-sql / general log)
// set autocommit=0
// update accounts set balance=balance-? where id=?
// update accounts set balance=balance+? where id=?
// commit`],
        [`<b>Advantages:</b> atomic business operations, consistent reads inside the unit of work, and one place (the service layer) that defines the boundary instead of scattering commit calls.`,
            r`# Django: atomic block, rolls back on any exception inside it
from django.db import transaction
with transaction.atomic():
    Account.objects.filter(id=1).update(balance=F("balance") - 500)
    Account.objects.filter(id=2).update(balance=F("balance") + 500)

# OUTPUT:
# BEGIN; UPDATE ...; UPDATE ...; COMMIT;   (ROLLBACK if an exception escapes)`],
        [`<b>Disadvantages:</b> a transaction holds a connection and row locks until it ends. Long ones (remote calls, user waits) exhaust the pool and cause lock waits and deadlocks.`,
            r`-- Session A: transaction kept open while the app calls a slow payment API
START TRANSACTION;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;     -- row 1 locked...
-- ...30 seconds of HTTP call...
-- Session B meanwhile:
UPDATE accounts SET balance = balance + 5 WHERE id = 1;

-- OUTPUT: (session B)
-- ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction`],
        [`<b>Limitations:</b> <code>@Transactional</code> works through a proxy, so a self-call inside the same class, a private method, or catching the exception yourself bypasses it. Transactions also cannot span two databases without XA or a saga.`,
            r`@Service
class OrderService {
    public void place(Order o) {
        save(o);                       // self-invocation: proxy skipped, NO transaction
    }
    @Transactional
    public void save(Order o) { repo.save(o); }
}
// Fix: call through another bean, or move @Transactional to place().

// OUTPUT:
// save() ran with autocommit; a failure after the first statement left partial data`],
        `
   Controller ─► Service  (@Transactional boundary)
                   │  BEGIN (borrow ONE pooled connection)
                   ├─► Repository.debit   ─┐ same connection,
                   ├─► Repository.credit  ─┘ same transaction
                   │  COMMIT  or  ROLLBACK (exception)
                   ▼
              connection returned to pool
`,
        `Put the boundary on the service method, keep it short, and do remote calls outside it. Roll back on checked exceptions explicitly (<code>rollbackFor</code>), retry on deadlock (error 1213) with a bounded loop, and use outbox or sagas for work that crosses services. Choose the isolation level per use case, not globally.`
    ),

    'Repository Pattern': dd(
        [`The <b>repository pattern</b> hides data access behind a collection-like interface (<code>findById</code>, <code>save</code>, <code>findByEmail</code>). The service asks for domain objects and does not know that MySQL, SQL or an ORM sits underneath.`,
            r`public interface UserRepository {
    Optional<User> findById(long id);
    Optional<User> findByEmail(String email);
    User save(User user);
    void deleteById(long id);
}

// OUTPUT:
// Services depend on this interface only; no SQL or JDBC appears in business code.`],
        [`Scattering SQL through controllers and services duplicates queries, couples business rules to table layout, and makes unit tests need a real database. One repository per aggregate gives each query a single home.`,
            r`// Hand-written JDBC implementation: the ONLY place that knows the SQL
class JdbcUserRepository implements UserRepository {
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT id, email, status FROM users WHERE email = ?";
        try (var c = ds.getConnection(); var ps = c.prepareStatement(sql)) {
            ps.setString(1, email);
            try (var rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        } catch (SQLException e) { throw new DataAccessException(e); }
    }
}

// OUTPUT: (SQL sent)
// SELECT id, email, status FROM users WHERE email = 'abaji@example.com'`],
        [`Spring Data JPA generates the implementation from the interface; Django managers and SQLAlchemy sessions play the same role. Derived method names become SQL.`,
            r`public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByStatusOrderByCreatedAtDesc(String status);
    @Query("select u from User u where u.createdAt >= :since")
    List<User> recent(@Param("since") LocalDateTime since);
}

// OUTPUT: (generated SQL)
// select ... from users u where u.email = ?
// select ... from users u where u.status = ? order by u.created_at desc`],
        [`<b>Advantages:</b> one place per query to index and tune, services are testable with an in-memory fake, and swapping storage or adding caching touches only the repository.`,
            r`// Unit test with a fake: no MySQL needed
class InMemoryUserRepository implements UserRepository {
    private final Map<Long, User> data = new HashMap<>();
    public User save(User u) { data.put(u.getId(), u); return u; }
    public Optional<User> findById(long id) { return Optional.ofNullable(data.get(id)); }
    /* ... */
}
@Test void blocksSuspendedUser() { /* new SignupService(new InMemoryUserRepository()) */ }

// OUTPUT:
// Tests ran in 12 ms, no database started`],
        [`<b>Disadvantages:</b> an extra layer for trivial CRUD, and a generic repository (<code>findAll</code>, <code>save</code> on everything) tempts developers into inefficient queries and leaking entities everywhere.`,
            r`// Anti-pattern: loading everything then filtering in Java
List<User> all = repo.findAll();                       // SELECT * FROM users  (millions of rows)
List<User> active = all.stream().filter(u -> u.isActive()).toList();

// Better: put the filter in the repository so MySQL uses an index
List<User> active2 = repo.findByStatus("ACTIVE");      // WHERE status = ?

// OUTPUT:
// findAll(): 2,400,000 rows into memory   vs   findByStatus: 4,100 rows`],
        [`<b>Limitations:</b> a repository does not manage transactions (the service does), cannot hide performance traits such as N+1 or lazy loading, and cross-aggregate reports usually need dedicated read queries rather than forcing them into one repository.`,
            r`// Reporting query: a read model with a DTO projection, not an entity graph
public interface SalesReportRepository extends Repository<Order, Long> {
    @Query("select new com.shop.MonthlySales(function('month', o.createdAt), sum(o.total)) " +
           "from Order o group by function('month', o.createdAt)")
    List<MonthlySales> monthly();
}

// OUTPUT: (generated SQL)
// select month(o.created_at), sum(o.total) from orders o group by month(o.created_at)`],
        `
   Controller ─► Service  (business rules + @Transactional)
                    │ depends on interface
                    ▼
              UserRepository  ◄── fake for tests
                    │ implemented by
          ┌─────────┴──────────┐
     Spring Data JPA        JDBC / MyBatis
                    ▼
                  MySQL
`,
        `Define repositories per aggregate root, expose intent-revealing methods rather than a generic findAll, and keep transactions in the service layer. Do not leak entities to the API; return DTO projections for reads. Where CRUD is trivial, use Spring Data directly and skip hand-written wrappers.`
    )
};
