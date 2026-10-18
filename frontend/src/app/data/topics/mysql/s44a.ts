// Module 44 (ORM & MySQL).
import { dd, r, type DeepDive } from '../python/deepdive/deepDive';

export const s44a: Record<string, DeepDive> = {
    'JPA, Hibernate & Spring Data JPA': dd(
        [`<b>JPA</b> is the Java specification for object-relational mapping, <b>Hibernate</b> is its main implementation, and <b>Spring Data JPA</b> generates repositories from interfaces so you rarely write boilerplate.`,
            r`@Entity @Table(name = "products")
class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)   // AUTO_INCREMENT
    Long id;
    @Column(nullable = false, length = 100) String name;
    @Column(precision = 10, scale = 2) BigDecimal price;
}
interface ProductRepo extends JpaRepository<Product, Long> {
    List<Product> findByPriceGreaterThanOrderByNameAsc(BigDecimal p);   // query from method name
}
// repo.findByPriceGreaterThanOrderByNameAsc(new BigDecimal("10"))

// OUTPUT:
// select p.id, p.name, p.price from products p where p.price>10 order by p.name asc`],
        [`Mapping rows to objects by hand is repetitive and error-prone. JPA gives dirty checking (changes saved automatically), caching, relations and portability.`,
            r`@Transactional
void rename(Long id, String newName) {
    Product p = repo.findById(id).orElseThrow();   // SELECT
    p.setName(newName);                            // no explicit save()
}                                                  // commit => UPDATE products SET name=? WHERE id=?

// OUTPUT:
// select ... from products where id=1
// update products set name='Gaming Mouse', price=19.99 where id=1`],
        [`Typical: CRUD services, paging with <code>Pageable</code>, optimistic locking with <code>@Version</code>, and custom JPQL or native queries for reports.`,
            r`@Entity class Account {
    @Id Long id; BigDecimal balance;
    @Version Integer version;                      // optimistic lock column
}
// Two users edit the same row: second commit runs
// UPDATE account SET balance=?, version=2 WHERE id=1 AND version=1  -> 0 rows -> exception

// OUTPUT:
// ObjectOptimisticLockingFailureException: Row was updated or deleted by another transaction`],
        [`<b>Advantages:</b> productivity, schema generation, caching levels (L1 session, L2 optional), vendor-neutral JPQL, rich relationship mapping.`,
            r`@Query(value = "SELECT * FROM products WHERE MATCH(name) AGAINST (?1 IN NATURAL LANGUAGE MODE)", nativeQuery = true)
List<Product> search(String text);           // native SQL when MySQL-specific features are needed
Page<Product> page = repo.findAll(PageRequest.of(0, 20, Sort.by("name")));

// OUTPUT:
// select ... from products order by name limit 20     (plus select count(*) for total)`],
        [`<b>Disadvantages:</b> learning curve, hidden SQL, N+1 and lazy exceptions, memory overhead of the persistence context on big batches, GenerationType.IDENTITY disables JDBC insert batching.`,
            r`// Batch inserting 10,000 entities: IDENTITY forces one INSERT per row
for (int i = 0; i < 10000; i++) repo.save(new Product("p" + i));
// Better: JdbcTemplate.batchUpdate, or flush/clear every 500 rows

// OUTPUT:
// 10,000 separate insert statements (example, about 8 s vs 0.4 s with batchUpdate)`],
        [`<b>Limitations:</b> complex reports and window functions are awkward in JPQL, hbm2ddl auto is unsafe for production, and entity state is tied to a session lifetime.`,
            r`# application.properties - production-safe defaults
# spring.jpa.hibernate.ddl-auto=validate        (never update/create in prod; use Flyway)
# spring.jpa.open-in-view=false
# spring.jpa.properties.hibernate.jdbc.batch_size=50
# spring.jpa.properties.hibernate.order_inserts=true
SELECT @@version AS mysql_ver;

-- OUTPUT: (example)
-- mysql_ver
-- 8.0.36`],
        `
   Service ─► Repository (Spring Data) ─► EntityManager / Hibernate
                                              │ persistence context (L1 cache, dirty check)
                                              ▼
                              SQL generation ─► HikariCP ─► JDBC ─► MySQL
`,
        `Use JPA for transactional CRUD and jOOQ/JdbcTemplate/native SQL for reporting and bulk operations. Keep associations lazy, use DTO projections for reads, validate (not generate) schema, and log SQL in lower environments to catch N+1 early.`
    ),

    'SQLAlchemy & Django ORM': dd(
        [`<b>SQLAlchemy</b> (Core + ORM, explicit sessions, Alembic migrations) and the <b>Django ORM</b> (active-record style, built-in migrations) both map Python classes to MySQL tables and build SQL from Python expressions.`,
            r`# SQLAlchemy 2.0
from sqlalchemy import create_engine, String, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase): pass
class User(Base):
    __tablename__ = "users"
    id:   Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))

engine = create_engine("mysql+pymysql://app:secret@127.0.0.1/shop")
with Session(engine) as s:
    print(s.scalars(select(User).where(User.name == "Abaji")).all())

# OUTPUT: (example)
# [<User id=1 name='Abaji'>]`],
        [`Hand-built SQL strings are unsafe and untestable. The ORM composes queries, parameterises them and returns objects.`,
            r`# Django ORM equivalent
class User(models.Model):
    name = models.CharField(max_length=50)

User.objects.filter(name__startswith="A").order_by("-id")[:5]
print(User.objects.filter(name="Abaji").query)

# OUTPUT:
# SELECT shop_user.id, shop_user.name FROM shop_user WHERE shop_user.name = Abaji`],
        [`Real code uses sessions or transactions per request, joined loading to avoid N+1, and raw SQL for complex reports.`,
            r`# SQLAlchemy: eager load with a JOIN
from sqlalchemy.orm import selectinload
stmt = select(Order).options(selectinload(Order.items)).where(Order.status == "NEW")
# Django:
# Order.objects.filter(status="NEW").prefetch_related("items")

# OUTPUT:
# SELECT ... FROM orders WHERE status = 'NEW'
# SELECT ... FROM order_items WHERE order_id IN (1, 2, 3)      (2 queries, no N+1)`],
        [`<b>Advantages:</b> safe parameter binding, migrations, composable queries, database portability, SQLAlchemy Core gives near-raw control.`,
            r`from sqlalchemy import func
stmt = select(Order.customer_id, func.sum(Order.total)).group_by(Order.customer_id).having(func.sum(Order.total) > 100)
print(stmt)

# OUTPUT:
# SELECT orders.customer_id, sum(orders.total) AS sum_1 FROM orders GROUP BY orders.customer_id HAVING sum(orders.total) > :sum_2`],
        [`<b>Disadvantages:</b> generated SQL can be suboptimal, Django ORM is limited for complex joins/window functions, SQLAlchemy sessions require understanding of flush and expire.`,
            r`# Updating many rows one by one is slow
for u in User.objects.all():
    u.active = False; u.save()           # N UPDATE statements
# Better: set-based
User.objects.update(active=False)        # 1 statement

# OUTPUT:
# UPDATE shop_user SET active = 0`],
        [`<b>Limitations:</b> MySQL-specific features (index hints, generated columns, partitions, JSON functions) need raw SQL or dialect extras; async support depends on aiomysql/asyncmy and is newer.`,
            r`from sqlalchemy import text
with engine.begin() as c:
    rows = c.execute(text("SELECT id, name FROM users USE INDEX (PRIMARY) WHERE id > :i"), {"i": 0}).all()
    print(rows)

# OUTPUT: (example)
# [(1, 'Abaji'), (2, 'Raoji')]`],
        `
   Python objects ─► ORM (Session / QuerySet) ─► SQL builder ─► DBAPI driver ─► MySQL
        ▲                      │ identity map / lazy queryset
        └──── rows ◄───────────┘
   Alembic / Django migrations manage schema
`,
        `Choose SQLAlchemy for complex domain models and explicit unit of work; Django ORM for rapid CRUD inside Django. In both, count queries in tests, prefer bulk operations, and keep a documented escape hatch to raw SQL.`
    ),

    'Prisma, Sequelize & TypeORM': dd(
        [`<b>Prisma</b>, <b>Sequelize</b> and <b>TypeORM</b> are Node.js ORMs for MySQL. Prisma uses a schema file and generates a typed client; Sequelize and TypeORM use JS/TS model classes.`,
            r`// schema.prisma
// datasource db { provider = "mysql"  url = env("DATABASE_URL") }
// model User { id Int @id @default(autoincrement())  email String @unique  posts Post[] }
// model Post { id Int @id @default(autoincrement())  title String  authorId Int  author User @relation(fields:[authorId], references:[id]) }

const user = await prisma.user.findUnique({ where: { email: 'a@b.com' }, include: { posts: true } });
console.log(user.email);

// OUTPUT:
// a@b.com`],
        [`In a Node codebase raw query strings are loosely typed. These tools give typed results, relations and migrations so refactors are checked at compile time.`,
            r`// Sequelize
const User = sequelize.define('User', { email: { type: DataTypes.STRING, unique: true } });
const u = await User.findOne({ where: { email: 'a@b.com' } });
console.log(u.email);

// OUTPUT:
// a@b.com`],
        [`Used in NestJS APIs and serverless backends. Transactions and migrations are part of normal workflow.`,
            r`// Prisma interactive transaction
await prisma.$transaction(async (tx) => {
  await tx.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } });
  await tx.account.update({ where: { id: 2 }, data: { balance: { increment: 100 } } });
});
// CLI: npx prisma migrate deploy

// OUTPUT:
// BEGIN; UPDATE Account SET balance = balance - 100 WHERE id = 1; UPDATE ... id = 2; COMMIT;`],
        [`<b>Advantages:</b> TypeScript types, auto-generated clients, readable relations, built-in migrations, safe parameter binding.`,
            r`// TypeORM
@Entity() class Post {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) title: string;
}
const posts = await dataSource.getRepository(Post).find({ where: { title: Like('A%') }, take: 20 });

// OUTPUT:
// SELECT id, title FROM post WHERE title LIKE 'A%' LIMIT 20`],
        [`<b>Disadvantages:</b> large generated client (Prisma), lazy-relation pitfalls (TypeORM), Sequelize typing is weaker; deep includes can generate heavy queries or multiple round trips.`,
            r`// Prisma include = separate queries by default, one per relation level
await prisma.user.findMany({ include: { posts: { include: { comments: true } } } });

// OUTPUT: (example, query log)
// SELECT ... FROM User
// SELECT ... FROM Post WHERE authorId IN (...)
// SELECT ... FROM Comment WHERE postId IN (...)`],
        [`<b>Limitations:</b> no full MySQL feature coverage (generated columns, fulltext, window functions often need raw queries); Prisma migrations are forward-only SQL files; connection pool is per process, which matters in serverless.`,
            r`// Window functions are not in the Prisma query API: use the raw escape hatch
const rows = await prisma.$queryRawUnsafe(
  'SELECT id, SUM(total) OVER (ORDER BY id) AS running FROM orders');
// serverless: add ?connection_limit=1 to DATABASE_URL

// OUTPUT:
// rows: [ { id: 1, running: 50 }, { id: 2, running: 120 } ]  (example)`],
        `
   schema / models ─► codegen ─► typed client ─► query engine ─► mysql2 pool ─► MySQL
        │
        └──► migrate dev / deploy ──► SQL migration files
`,
        `Prefer Prisma or TypeORM when type-safety matters, and keep raw SQL for reporting. In serverless, place a connection proxy in front of MySQL, limit per-instance pool size to 1-2, and review the generated SQL for heavy includes.`
    ),

    'Inspecting the SQL an ORM Generates': dd(
        [`ORMs hide SQL, so you must see it: turn on the ORM's SQL logging, use the MySQL general or slow log, or read Performance Schema digests, then <code>EXPLAIN</code> the statements.`,
            r`# Application side: print every SQL (Spring Boot)
# spring.jpa.show-sql=true
# logging.level.org.hibernate.SQL=DEBUG
# logging.level.org.hibernate.orm.jdbc.bind=TRACE      (shows bound values)
# SQLAlchemy:  create_engine(url, echo=True)

# OUTPUT: (example)
# select u1_0.id, u1_0.name from users u1_0 where u1_0.id=?`],
        [`What the ORM runs, not what you meant, decides performance. Only the SQL reveals N+1, missing indexes, SELECT * and unexpected full scans.`,
            r`-- Server side: capture statements for one session
SET GLOBAL general_log = 'ON';  SET GLOBAL log_output = 'TABLE';
SELECT event_time, LEFT(argument, 60) AS stmt FROM mysql.general_log ORDER BY event_time DESC LIMIT 2;
SET GLOBAL general_log = 'OFF';

-- OUTPUT: (example)
-- event_time          | stmt
-- 2026-10-06 11:02:01 | select u1_0.id,u1_0.name from users u1_0 where u1_0.id=7
-- 2026-10-06 11:02:01 | SET autocommit=0`],
        [`During development use query counters; in production use digests (no per-statement overhead) and trace IDs in comments to tie SQL back to code.`,
            r`SELECT DIGEST_TEXT, COUNT_STAR, ROUND(AVG_TIMER_WAIT/1e9,2) AS avg_ms
FROM   performance_schema.events_statements_summary_by_digest
WHERE  SCHEMA_NAME = 'shop'
ORDER  BY SUM_TIMER_WAIT DESC LIMIT 2;

-- OUTPUT: (example)
-- DIGEST_TEXT                              | COUNT_STAR | avg_ms
-- SELECT ... FROM order_items WHERE ...    |    2400000 | 0.41
-- SELECT ... FROM orders WHERE ...         |      15000 | 7.90`],
        [`<b>Advantages:</b> reveals real behaviour, works for any ORM, and lets you EXPLAIN the exact statement.`,
            r`EXPLAIN ANALYZE SELECT u1_0.id, u1_0.name FROM users u1_0 WHERE u1_0.email = 'a@b.com';

-- OUTPUT: (example)
-- -> Filter: (u1_0.email = 'a@b.com')  (actual time=21..21 rows=1)
--     -> Table scan on u1_0  (actual time=0.1..19 rows=100000)     <- missing index on email`],
        [`<b>Disadvantages:</b> the general log is very heavy and logs sensitive data; show-sql output lacks bound values and timing; prepared statements show ? placeholders.`,
            r`-- Statements with ? placeholders: find real values via Performance Schema history
SELECT SQL_TEXT FROM performance_schema.events_statements_history
WHERE  SQL_TEXT LIKE 'select u1_0%' LIMIT 1;

-- OUTPUT: (example)
-- SQL_TEXT
-- select u1_0.id,u1_0.name from users u1_0 where u1_0.email=?`],
        [`<b>Limitations:</b> EXPLAIN on a placeholder query needs literal values, plans depend on data volume (dev with 10 rows hides problems), and not every ORM exposes timings.`,
            r`# Query-count test helper (Django) and slow-query alert (SQLAlchemy)
from sqlalchemy import event
@event.listens_for(engine, "before_cursor_execute")
def log_sql(conn, cursor, statement, params, context, executemany):
    print("SQL:", statement[:60], params)

# OUTPUT: (example)
# SQL: SELECT users.id, users.name FROM users WHERE users.email = %s ('a@b.com',)`],
        `
   code ─► ORM ─► SQL text ─► driver ─► MySQL ─► plan ─► rows
                     │ log (show-sql / echo)        │ slow log, digests
                     ▼                              ▼
              count + read it                  EXPLAIN ANALYZE ─► add index / fix mapping
`,
        `Make SQL visibility a standard: SQL logging in dev, query-count assertions in tests, digest dashboards in production, and request IDs injected as SQL comments. Test with production-like data volume or plans will mislead you.`
    )
};
