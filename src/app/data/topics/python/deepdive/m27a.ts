// Module 27 (Databases), part A: core SQL, indexes, transactions, sqlite3.
import { dd, r, type DeepDive } from './deepDive';

export const m27a: Record<string, DeepDive> = {
    'SQL: SELECT, INSERT, UPDATE & DELETE': dd(
        [`<b>SQL</b> is the language of relational databases. The four basic statements are <b>INSERT</b> (create rows), <b>SELECT</b> (read), <b>UPDATE</b> (change) and <b>DELETE</b> (remove) - together known as CRUD. Python runs them through the <code>sqlite3</code> module.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")           # throw-away database in RAM
con.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INT)")

con.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("Ada", 36))   # Create
con.execute("INSERT INTO users (name, age) VALUES (?, ?)", ("Baji", 25))
con.execute("UPDATE users SET age = age + 1 WHERE name = ?", ("Baji",))    # Update
con.execute("DELETE FROM users WHERE name = ?", ("Ada",))                 # Delete
print(con.execute("SELECT id, name, age FROM users").fetchall())          # Read

# OUTPUT:
# [(2, 'Baji', 26)]`],
        [`Programs lose their data when they exit. A database stores it durably, lets many programs query it, and guarantees structure (types, keys, constraints) that a plain file cannot.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE products (sku TEXT PRIMARY KEY, price REAL NOT NULL)")
con.execute("INSERT INTO products VALUES ('PEN', 2.5)")
try:
    con.execute("INSERT INTO products VALUES ('PEN', 3.0)")       # duplicate key
except sqlite3.IntegrityError as e:
    print("rejected:", e)

# OUTPUT:
# rejected: UNIQUE constraint failed: products.sku`],
        [`Every app does CRUD: signing up users, placing orders, updating stock, deleting expired sessions. Filtering, sorting and paging are done by the database, not by Python loops.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE items (id INTEGER PRIMARY KEY, name TEXT, price REAL)")
con.executemany("INSERT INTO items (name, price) VALUES (?, ?)",
                [("pen", 2.0), ("book", 10.0), ("bag", 30.0), ("cap", 8.0)])

rows = con.execute("""SELECT name, price FROM items
                      WHERE price > ? ORDER BY price DESC LIMIT 2""", (5,)).fetchall()
print(rows)

# OUTPUT:
# [('bag', 30.0), ('book', 10.0)]`],
        [`<b>Advantages:</b> declarative (say what, not how), standardised across databases, optimiser picks the fast plan, constraints protect data quality.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (n INT)")
con.executemany("INSERT INTO t VALUES (?)", [(1,), (2,), (3,), (4,)])
# One declarative statement replaces a Python loop with if/sum logic
print(con.execute("SELECT COUNT(*), SUM(n), AVG(n) FROM t WHERE n % 2 = 0").fetchone())

# OUTPUT:
# (2, 6, 3.0)`],
        [`<b>Disadvantages:</b> string-built SQL is injectable, dialects differ between vendors, and an UPDATE or DELETE without WHERE silently hits every row.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE u (name TEXT)")
con.execute("INSERT INTO u VALUES ('ada')")
evil = "x' OR '1'='1"
bad = con.execute("SELECT * FROM u WHERE name = '" + evil + "'").fetchall()   # WRONG: injection
good = con.execute("SELECT * FROM u WHERE name = ?", (evil,)).fetchall()      # parameterised
print(len(bad), len(good))

# OUTPUT:
# 1 0`],
        [`<b>Limitations:</b> SQL is not a general-purpose language (no loops in plain SQL), rows are flat (no nested objects), and placeholders cannot be used for table or column names.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (a INT)")
try:
    con.execute("SELECT * FROM ?", ("t",))          # identifiers cannot be parameters
except sqlite3.Error as e:
    print(type(e).__name__)

# OUTPUT:
# OperationalError`],
        `
   Python ──► sqlite3.execute("INSERT ...", params)
                    │
                    ▼
        Parser ► Planner/Optimiser ► Executor
                                        │
                                        ▼
                              table pages on disk
   C = INSERT   R = SELECT   U = UPDATE   D = DELETE
`,
        `Always parameterise, always test UPDATE/DELETE with a SELECT using the same WHERE first, and wrap multi-statement changes in a transaction. Put integrity rules (NOT NULL, UNIQUE, CHECK, FOREIGN KEY) in the schema, not only in application code, because several applications may share the database.`
    ),

    'SQL JOINs': dd(
        [`A <b>JOIN</b> combines rows from two tables on a matching condition. <b>INNER JOIN</b> keeps only matches; <b>LEFT JOIN</b> keeps all rows from the left table and fills NULL where there is no match.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE users  (id INT PRIMARY KEY, name TEXT);
CREATE TABLE orders (id INT PRIMARY KEY, user_id INT, total INT);
INSERT INTO users  VALUES (1,'Ada'),(2,'Baji'),(3,'Cy');
INSERT INTO orders VALUES (1,1,50),(2,1,30),(3,2,20);
""")
sql = """SELECT u.name, o.total FROM users u
         INNER JOIN orders o ON o.user_id = u.id ORDER BY o.id"""
print(con.execute(sql).fetchall())

# OUTPUT:
# [('Ada', 50), ('Ada', 30), ('Baji', 20)]`],
        [`Normalised databases split data into tables to avoid duplication (user once, many orders). To answer questions that span entities, you must join them back together.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE users  (id INT, name TEXT);
CREATE TABLE orders (id INT, user_id INT, total INT);
INSERT INTO users  VALUES (1,'Ada'),(2,'Baji'),(3,'Cy');
INSERT INTO orders VALUES (1,1,50),(2,1,30),(3,2,20);
""")
# LEFT JOIN: users with no orders still appear (total is NULL -> None)
sql = """SELECT u.name, o.total FROM users u
         LEFT JOIN orders o ON o.user_id = u.id ORDER BY u.id, o.id"""
print(con.execute(sql).fetchall())

# OUTPUT:
# [('Ada', 50), ('Ada', 30), ('Baji', 20), ('Cy', None)]`],
        [`Real reports: "customers who never ordered" (LEFT JOIN ... WHERE o.id IS NULL), order lines with product names, employees with their manager (self join).`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE emp (id INT, name TEXT, manager_id INT);
INSERT INTO emp VALUES (1,'Boss',NULL),(2,'Ann',1),(3,'Ben',1),(4,'Cat',2);
CREATE TABLE users (id INT, name TEXT);
CREATE TABLE orders (id INT, user_id INT);
INSERT INTO users VALUES (1,'Ada'),(2,'Baji');
INSERT INTO orders VALUES (1,1);
""")
# anti-join: users with no orders
print(con.execute("""SELECT u.name FROM users u LEFT JOIN orders o ON o.user_id=u.id
                     WHERE o.id IS NULL""").fetchall())
# self join: employee with manager name
print(con.execute("""SELECT e.name, m.name FROM emp e JOIN emp m ON e.manager_id = m.id
                     ORDER BY e.id""").fetchall())

# OUTPUT:
# [('Baji',)]
# [('Ann', 'Boss'), ('Ben', 'Boss'), ('Cat', 'Ann')]`],
        [`<b>Advantages:</b> keeps data normalised, one query returns related data, and the database optimises join order using indexes.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE a (k INT, x TEXT);  CREATE TABLE b (k INT, y TEXT);
INSERT INTO a VALUES (1,'a1'),(2,'a2');  INSERT INTO b VALUES (2,'b2'),(3,'b3');
""")
# Venn-diagram view of the join types (SQLite 3.39+ also has RIGHT/FULL JOIN)
print("inner:", con.execute("SELECT a.k FROM a JOIN b ON a.k=b.k").fetchall())
print("left :", con.execute("SELECT a.k FROM a LEFT JOIN b ON a.k=b.k ORDER BY a.k").fetchall())

# OUTPUT:
# inner: [(2,)]
# left : [(1,), (2,)]`],
        [`<b>Disadvantages:</b> a missing or wrong ON condition produces a cartesian product (rows multiply), and one-to-many joins duplicate the "one" side, inflating SUMs.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE a (n INT); CREATE TABLE b (m INT);
INSERT INTO a VALUES (1),(2),(3); INSERT INTO b VALUES (10),(20);
""")
print(con.execute("SELECT COUNT(*) FROM a, b").fetchone())     # forgot the join condition

# OUTPUT:
# (6,)`],
        [`<b>Limitations:</b> joins on unindexed columns scan whole tables; joining across separate databases/services is not possible; NULL never equals NULL in a join condition.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE a (k INT); CREATE TABLE b (k INT);
INSERT INTO a VALUES (NULL),(1); INSERT INTO b VALUES (NULL),(1);
""")
print(con.execute("SELECT COUNT(*) FROM a JOIN b ON a.k = b.k").fetchone())   # NULL rows never match

# OUTPUT:
# (1,)`],
        `
   users            orders
   ┌────┬──────┐    ┌────┬─────────┬───────┐
   │ id │ name │    │ id │ user_id │ total │
   ├────┼──────┤    ├────┼─────────┼───────┤
   │ 1  │ Ada  │◄───│ 1  │    1    │  50   │
   │ 2  │ Baji │◄───│ 3  │    2    │  20   │
   │ 3  │ Cy   │    └────┴─────────┴───────┘
   └────┴──────┘
   INNER: Ada, Baji     LEFT: Ada, Baji, Cy(NULL)
`,
        `Index every foreign key used in joins, check plans with EXPLAIN, and be careful with aggregates over one-to-many joins (aggregate in a subquery first). Excessively wide join chains often signal that a reporting table, materialised view or denormalised read model is the better design.`
    ),

    'GROUP BY & HAVING': dd(
        [`<b>GROUP BY</b> collapses rows that share a value into one row per group so you can apply aggregate functions (COUNT, SUM, AVG, MIN, MAX). <b>HAVING</b> filters the groups after aggregation, while WHERE filters rows before it.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE orders (id INT, user_id INT, total INT);
INSERT INTO orders VALUES (1,1,50),(2,1,30),(3,2,20),(4,3,5);
""")
sql = """SELECT user_id, COUNT(*) AS n, SUM(total) AS spent
         FROM orders GROUP BY user_id ORDER BY user_id"""
print(con.execute(sql).fetchall())

# OUTPUT:
# [(1, 2, 80), (2, 1, 20), (3, 1, 5)]`],
        [`Raw rows are rarely what people want; they want summaries - revenue per month, tickets per agent. Doing it in SQL avoids pulling millions of rows into Python.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE orders (user_id INT, total INT);
INSERT INTO orders VALUES (1,50),(1,30),(2,20),(3,5);
""")
# HAVING filters groups; WHERE would not allow SUM(...)
sql = """SELECT user_id, SUM(total) FROM orders
         GROUP BY user_id HAVING SUM(total) > 25"""
print(con.execute(sql).fetchall())

# OUTPUT:
# [(1, 80)]`],
        [`Dashboards: sales per region, top customers, error counts per hour, average rating per product.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE logs (ts TEXT, level TEXT);
INSERT INTO logs VALUES ('2024-01-01 10:01','ERROR'),('2024-01-01 10:20','INFO'),
                        ('2024-01-01 11:05','ERROR'),('2024-01-01 11:30','ERROR');
""")
sql = """SELECT substr(ts,12,2) AS hour, COUNT(*) FROM logs
         WHERE level = 'ERROR' GROUP BY hour ORDER BY hour"""   # WHERE first, then group
print(con.execute(sql).fetchall())

# OUTPUT:
# [('10', 1), ('11', 2)]`],
        [`<b>Advantages:</b> computation happens next to the data, result is tiny, multiple aggregates in one pass, and group keys can be expressions (dates, buckets).`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE s (dept TEXT, sal INT);
INSERT INTO s VALUES ('IT',90),('IT',70),('HR',60),('HR',80);
""")
print(con.execute("""SELECT dept, MIN(sal), MAX(sal), AVG(sal) FROM s
                     GROUP BY dept ORDER BY dept""").fetchall())

# OUTPUT:
# [('HR', 60, 80, 70.0), ('IT', 70, 90, 80.0)]`],
        [`<b>Disadvantages:</b> every selected column must be grouped or aggregated (some engines like SQLite let you select arbitrary values silently), and groups hide row-level detail.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE s (dept TEXT, name TEXT, sal INT);
INSERT INTO s VALUES ('IT','Ann',90),('IT','Ben',70);
""")
# SQLite allows this; PostgreSQL/MySQL(strict) would raise an error.
# Which name is returned is arbitrary, so the result is not trustworthy.
print(con.execute("SELECT dept, name, COUNT(*) FROM s GROUP BY dept").fetchone()[0::2])

# OUTPUT:
# ('IT', 2)`],
        [`<b>Limitations:</b> aggregates ignore NULLs (COUNT(col) vs COUNT(*) differ), you cannot use aggregates in WHERE, and per-group top-N needs window functions.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("CREATE TABLE t (v INT); INSERT INTO t VALUES (1),(NULL),(3);")
print(con.execute("SELECT COUNT(*), COUNT(v), AVG(v) FROM t").fetchone())

# OUTPUT:
# (3, 2, 2.0)`],
        `
   rows                     GROUP BY dept          HAVING avg > 75
   IT 90 ┐                 ┌──────────────┐        ┌──────────────┐
   IT 70 ┴────────────────►│ IT  avg 80   │───────►│ IT  avg 80   │
   HR 60 ┐                 ├──────────────┤        └──────────────┘
   HR 80 ┴────────────────►│ HR  avg 70   │  (HR removed)
                           └──────────────┘
   Order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY
`,
        `Filter early with WHERE so fewer rows are grouped, and add composite indexes that match the GROUP BY columns. For heavy analytics over large history, pre-aggregate into summary tables or move to a columnar/OLAP engine instead of grouping an OLTP table at query time.`
    ),

    'Subqueries & CTEs': dd(
        [`A <b>subquery</b> is a SELECT nested inside another statement. A <b>CTE</b> (Common Table Expression, <code>WITH name AS (...)</code>) gives a subquery a name so a complex query reads top to bottom. CTEs can also be recursive.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE emp (name TEXT, dept TEXT, sal INT);
INSERT INTO emp VALUES ('Ann','IT',90),('Ben','IT',70),('Cat','HR',60),('Dan','HR',80);
""")
# scalar subquery: employees paid above the overall average (75)
sql = "SELECT name, sal FROM emp WHERE sal > (SELECT AVG(sal) FROM emp) ORDER BY sal DESC"
print(con.execute(sql).fetchall())

# OUTPUT:
# [('Ann', 90), ('Dan', 80)]`],
        [`Some questions need a result before you can ask the next one ("above average", "customers with no orders"). Subqueries/CTEs express this in one statement, and CTEs break big queries into readable steps.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE emp (name TEXT, dept TEXT, sal INT);
INSERT INTO emp VALUES ('Ann','IT',90),('Ben','IT',70),('Cat','HR',60),('Dan','HR',80);
""")
sql = """
WITH dept_avg AS (                        -- step 1: average per department
    SELECT dept, AVG(sal) AS avg_sal FROM emp GROUP BY dept
)
SELECT e.name, e.sal, d.avg_sal           -- step 2: compare each person to it
FROM emp e JOIN dept_avg d ON d.dept = e.dept
WHERE e.sal > d.avg_sal ORDER BY e.name
"""
print(con.execute(sql).fetchall())

# OUTPUT:
# [('Ann', 90, 80.0), ('Dan', 80, 70.0)]`],
        [`Recursive CTEs walk hierarchies: org charts, category trees, bill of materials, and generate number/date series.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE emp (id INT, name TEXT, boss INT);
INSERT INTO emp VALUES (1,'CEO',NULL),(2,'VP',1),(3,'Dev',2),(4,'Intern',3);
""")
sql = """
WITH RECURSIVE chain(id, name, depth) AS (
    SELECT id, name, 0 FROM emp WHERE boss IS NULL          -- anchor
    UNION ALL
    SELECT e.id, e.name, c.depth + 1 FROM emp e JOIN chain c ON e.boss = c.id  -- recurse
)
SELECT name, depth FROM chain ORDER BY depth
"""
print(con.execute(sql).fetchall())

# OUTPUT:
# [('CEO', 0), ('VP', 1), ('Dev', 2), ('Intern', 3)]`],
        [`<b>Advantages:</b> readable decomposition, reuse of an intermediate result within one query, recursion in pure SQL, and EXISTS/IN subqueries express set logic clearly.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE users (id INT, name TEXT); CREATE TABLE orders (user_id INT);
INSERT INTO users VALUES (1,'Ada'),(2,'Baji'); INSERT INTO orders VALUES (1);
""")
sql = """SELECT name FROM users u
         WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)"""
print(con.execute(sql).fetchall())

# OUTPUT:
# [('Baji',)]`],
        [`<b>Disadvantages:</b> correlated subqueries can run once per outer row (slow), deep nesting is unreadable, and some engines re-evaluate a CTE each time it is referenced.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE a (id INT); CREATE TABLE b (a_id INT, v INT);
INSERT INTO a VALUES (1),(2); INSERT INTO b VALUES (1,5),(1,7),(2,1);
""")
# Correlated: inner query depends on the outer row -> conceptually executed per row
sql = "SELECT id, (SELECT MAX(v) FROM b WHERE b.a_id = a.id) FROM a ORDER BY id"
print(con.execute(sql).fetchall())      # often rewritten as a JOIN + GROUP BY

# OUTPUT:
# [(1, 7), (2, 1)]`],
        [`<b>Limitations:</b> NOT IN with a NULL in the subquery returns no rows (three-valued logic); a scalar subquery must return one value; recursive CTEs can loop forever without a termination condition.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE a (id INT); CREATE TABLE b (id INT);
INSERT INTO a VALUES (1),(2); INSERT INTO b VALUES (1),(NULL);
""")
print(con.execute("SELECT id FROM a WHERE id NOT IN (SELECT id FROM b)").fetchall())   # surprise!
print(con.execute("SELECT id FROM a WHERE NOT EXISTS (SELECT 1 FROM b WHERE b.id=a.id)").fetchall())

# OUTPUT:
# []
# [(2,)]`],
        `
   WITH dept_avg AS ( SELECT dept, AVG(sal) ... GROUP BY dept )   <- named step
        │
        ▼
   SELECT ... FROM emp JOIN dept_avg ...                         <- main query
   Recursive:  anchor ──► [ recurse ──► recurse ──► ... ] ──► stop when no new rows
`,
        `Prefer CTEs for readability and JOIN/EXISTS over correlated scalar subqueries on large tables. Read the execution plan: some databases inline CTEs, others materialise them (PostgreSQL 12+ lets you choose). Use EXISTS instead of NOT IN, and cap recursion depth with a depth column.`
    ),

    'Window Functions': dd(
        [`<b>Window functions</b> compute a value for each row using a related set of rows (its "window") without collapsing rows like GROUP BY. Syntax: <code>func() OVER (PARTITION BY ... ORDER BY ...)</code>. Examples: ROW_NUMBER, RANK, LAG, SUM() OVER.`,
            r`import sqlite3                           # needs SQLite 3.25+

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE emp (name TEXT, dept TEXT, sal INT);
INSERT INTO emp VALUES ('Ann','IT',90),('Ben','IT',70),('Cat','HR',60),('Dan','HR',80);
""")
sql = """SELECT dept, name, sal,
                RANK() OVER (PARTITION BY dept ORDER BY sal DESC) AS rnk
         FROM emp ORDER BY dept, rnk"""
for row in con.execute(sql): print(row)

# OUTPUT:
# ('HR', 'Dan', 80, 1)
# ('HR', 'Cat', 60, 2)
# ('IT', 'Ann', 90, 1)
# ('IT', 'Ben', 70, 2)`],
        [`GROUP BY loses the individual rows. But "top 3 per category", "running total", "change from previous month" need row detail and group context together - exactly what windows give.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE sales (day INT, amt INT);
INSERT INTO sales VALUES (1,10),(2,20),(3,5),(4,15);
""")
sql = """SELECT day, amt,
                SUM(amt) OVER (ORDER BY day) AS running,
                amt - LAG(amt) OVER (ORDER BY day) AS change
         FROM sales"""
for row in con.execute(sql): print(row)

# OUTPUT:
# (1, 10, 10, None)
# (2, 20, 30, 10)
# (3, 5, 35, -15)
# (4, 15, 50, 10)`],
        [`Leaderboards, month-over-month growth, moving averages, de-duplication (keep ROW_NUMBER = 1), percent of total, sessionisation of events.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("""
CREATE TABLE emails (id INT, email TEXT);
INSERT INTO emails VALUES (1,'a@x'),(2,'a@x'),(3,'b@x');
""")
# De-duplicate: keep the first row per email
sql = """SELECT id, email FROM (
             SELECT id, email, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
             FROM emails) WHERE rn = 1 ORDER BY id"""
print(con.execute(sql).fetchall())

# OUTPUT:
# [(1, 'a@x'), (3, 'b@x')]`],
        [`<b>Advantages:</b> one pass over the data, keeps row detail, replaces self-joins and slow Python loops, and frames let you do moving windows.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("CREATE TABLE p (d INT, v INT); INSERT INTO p VALUES (1,10),(2,20),(3,30),(4,40);")
sql = """SELECT d, AVG(v) OVER (ORDER BY d ROWS BETWEEN 1 PRECEDING AND CURRENT ROW)
         FROM p"""                                          # 2-row moving average
print(con.execute(sql).fetchall())

# OUTPUT:
# [(1, 10.0), (2, 15.0), (3, 25.0), (4, 35.0)]`],
        [`<b>Disadvantages:</b> unfamiliar syntax, sorting large partitions is memory/CPU heavy, and the RANGE vs ROWS frame difference causes subtle bugs.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("CREATE TABLE t (v INT); INSERT INTO t VALUES (10),(10),(20);")
# Ties: ROW_NUMBER is arbitrary between equals, RANK repeats and skips
sql = "SELECT v, ROW_NUMBER() OVER (ORDER BY v), RANK() OVER (ORDER BY v) FROM t"
print(con.execute(sql).fetchall())

# OUTPUT:
# [(10, 1, 1), (10, 2, 1), (20, 3, 3)]`],
        [`<b>Limitations:</b> window functions cannot appear in WHERE or HAVING - wrap them in a subquery/CTE to filter on the result; they need SQLite 3.25+ / MySQL 8+.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.executescript("CREATE TABLE t (v INT); INSERT INTO t VALUES (1),(2),(3);")
try:
    con.execute("SELECT v FROM t WHERE ROW_NUMBER() OVER (ORDER BY v) = 1")
except sqlite3.OperationalError as e:
    print("error:", e)
ok = "SELECT v FROM (SELECT v, ROW_NUMBER() OVER (ORDER BY v) rn FROM t) WHERE rn = 1"
print(con.execute(ok).fetchall())                           # filter in the outer query

# OUTPUT:
# error: misuse of window function ROW_NUMBER()
# [(1,)]`],
        `
   dept  name  sal           OVER (PARTITION BY dept ORDER BY sal DESC)
   ───────────────           ┌───────── partition IT ─────────┐
   IT    Ann   90   ───────► │ Ann 90 -> rank 1               │
   IT    Ben   70   ───────► │ Ben 70 -> rank 2               │
                             └────────────────────────────────┘
   HR    Dan   80   ───────► partition HR: Dan rank 1, Cat rank 2
   (every input row survives, unlike GROUP BY)
`,
        `Windows are the right tool for per-group ranking and time-series deltas, but they sort: index on (PARTITION BY columns, ORDER BY columns) to avoid big sorts. For heavy analytics, consider pre-computing or using an analytics database; keep OLTP queries simple.`
    ),

    'Indexes': dd(
        [`An <b>index</b> is a separate sorted structure (usually a B-tree) that lets the database find rows by a column value without scanning the whole table - like the index at the back of a book.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, age INT)")
con.executemany("INSERT INTO users (email, age) VALUES (?, ?)",
                [(f"user{i}@x.com", i % 80) for i in range(1000)])

def plan(sql):                              # ask the engine how it will run the query
    return [row[3] for row in con.execute("EXPLAIN QUERY PLAN " + sql)]

q = "SELECT * FROM users WHERE email = 'user5@x.com'"
print(plan(q))
con.execute("CREATE INDEX idx_users_email ON users(email)")
print(plan(q))

# OUTPUT (wording varies by SQLite version):
# ['SCAN users']
# ['SEARCH users USING INDEX idx_users_email (email=?)']`],
        [`Without an index, lookup cost grows linearly with table size (O(n)); with a B-tree it grows logarithmically (O(log n)). On millions of rows that is the difference between milliseconds and minutes.`,
            r`import sqlite3, time

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (id INTEGER PRIMARY KEY, k INT)")
con.executemany("INSERT INTO t (k) VALUES (?)", [(i,) for i in range(200_000)])

def timed():
    t = time.perf_counter()
    for i in range(200): con.execute("SELECT * FROM t WHERE k = ?", (i * 900,)).fetchall()
    return time.perf_counter() - t

slow = timed()
con.execute("CREATE INDEX idx_k ON t(k)")
fast = timed()
print("index speedup > 10x:", slow / fast > 10)

# OUTPUT (varies by machine, but true in practice):
# index speedup > 10x: True`],
        [`Index columns used in WHERE, JOIN and ORDER BY: foreign keys, email/login, created_at. A <b>UNIQUE</b> index also enforces uniqueness; a <b>composite</b> index serves multi-column filters.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INT, status TEXT, created INT)")
con.execute("CREATE INDEX idx_user_status ON orders(user_id, status)")   # composite
def plan(sql): return [r[3] for r in con.execute("EXPLAIN QUERY PLAN " + sql)]

print(plan("SELECT * FROM orders WHERE user_id = 1 AND status = 'paid'"))
print(plan("SELECT * FROM orders WHERE user_id = 1"))        # leftmost prefix works
print(plan("SELECT * FROM orders WHERE status = 'paid'"))    # skips first column: no index

# OUTPUT (wording varies by SQLite version):
# ['SEARCH orders USING INDEX idx_user_status (user_id=? AND status=?)']
# ['SEARCH orders USING INDEX idx_user_status (user_id=?)']
# ['SCAN orders']`],
        [`<b>Advantages:</b> dramatically faster reads, faster sorting and joins, and unique indexes enforce data rules.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE u (email TEXT)")
con.execute("CREATE UNIQUE INDEX ux_email ON u(email)")      # index doubles as a constraint
con.execute("INSERT INTO u VALUES ('a@x')")
try:
    con.execute("INSERT INTO u VALUES ('a@x')")
except sqlite3.IntegrityError as e:
    print(e)

# OUTPUT:
# UNIQUE constraint failed: u.email`],
        [`<b>Disadvantages:</b> every INSERT/UPDATE/DELETE must also maintain each index (slower writes), indexes consume disk and RAM, and too many indexes hurt more than help.`,
            r`import sqlite3, time

def load(n_indexes):
    con = sqlite3.connect(":memory:")
    con.execute("CREATE TABLE t (a INT, b INT, c INT, d INT)")
    for col in "abcd"[:n_indexes]:
        con.execute(f"CREATE INDEX i_{col} ON t({col})")
    t = time.perf_counter()
    con.executemany("INSERT INTO t VALUES (?,?,?,?)", [(i, i*7 % 1000, i*13 % 1000, -i) for i in range(100_000)])
    return time.perf_counter() - t

print("4 indexes slower than none:", load(4) > load(0))

# OUTPUT (varies by machine):
# 4 indexes slower than none: True`],
        [`<b>Limitations:</b> an index is ignored when you wrap the column in a function or use a leading wildcard, and low-cardinality columns (e.g. boolean) give little benefit.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE u (name TEXT)")
con.execute("CREATE INDEX idx_name ON u(name)")
def plan(sql): return [r[3] for r in con.execute("EXPLAIN QUERY PLAN " + sql)]

print(plan("SELECT * FROM u WHERE name = 'ada'")[0].split()[0])          # SEARCH
print(plan("SELECT * FROM u WHERE lower(name) = 'ada'")[0].split()[0])   # function: SCAN
print(plan("SELECT * FROM u WHERE name LIKE '%da'")[0].split()[0])       # leading %: SCAN

# OUTPUT:
# SEARCH
# SCAN
# SCAN`],
        `
   WHERE email = 'x'                  B-tree index on email
         │                              [ m ]
         │                           ┌────┴────┐
         ▼                         [ d ]     [ t ]
   Without index: scan 1,000,000     │         │
   With index:    ~20 page reads   leaf ──► row pointer ──► table row
`,
        `Create indexes from real query patterns (slow-query log, EXPLAIN), order composite columns by equality first then range, drop unused ones, and consider partial/covering indexes. Remember write amplification: heavy-ingest tables should carry as few indexes as possible. Re-check plans after data growth, as optimiser choices change.`
    ),

    'Transactions': dd(
        [`A <b>transaction</b> groups several statements into one all-or-nothing unit. Either every change is committed, or all are rolled back. Databases promise <b>ACID</b>: Atomicity, Consistency, Isolation, Durability.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE acct (name TEXT PRIMARY KEY, bal INT CHECK (bal >= 0))")
con.executemany("INSERT INTO acct VALUES (?, ?)", [("A", 100), ("B", 50)])
con.commit()

con.execute("UPDATE acct SET bal = bal - 30 WHERE name = 'A'")
con.rollback()                              # undo everything since the last commit
print(con.execute("SELECT * FROM acct ORDER BY name").fetchall())

# OUTPUT:
# [('A', 100), ('B', 50)]`],
        [`Money transfer = two updates. If the server crashes between them, money vanishes. Transactions guarantee related changes are never left half-done and that concurrent users see consistent data.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE acct (name TEXT PRIMARY KEY, bal INT CHECK (bal >= 0))")
con.executemany("INSERT INTO acct VALUES (?, ?)", [("A", 100), ("B", 50)])
con.commit()

def transfer(src, dst, amt):
    try:
        with con:                           # commit on success, rollback on exception
            con.execute("UPDATE acct SET bal = bal + ? WHERE name = ?", (amt, dst))
            con.execute("UPDATE acct SET bal = bal - ? WHERE name = ?", (amt, src))
        return "ok"
    except sqlite3.IntegrityError:
        return "rolled back"                # CHECK failed on the second statement

print(transfer("A", "B", 30), transfer("A", "B", 500))
print(con.execute("SELECT * FROM acct ORDER BY name").fetchall())

# OUTPUT:
# ok rolled back
# [('A', 70), ('B', 80)]`],
        [`Used for order checkout (stock + payment + order row), bookings (seat reservation), ledgers and any multi-table update. Savepoints allow partial rollback inside a larger transaction.`,
            r`import sqlite3

con = sqlite3.connect(":memory:", isolation_level=None)   # manual transaction control
con.execute("CREATE TABLE log (msg TEXT)")

con.execute("BEGIN")
con.execute("INSERT INTO log VALUES ('step 1')")
con.execute("SAVEPOINT sp1")
con.execute("INSERT INTO log VALUES ('step 2 (risky)')")
con.execute("ROLLBACK TO sp1")              # undo only the risky part
con.execute("COMMIT")
print(con.execute("SELECT msg FROM log").fetchall())

# OUTPUT:
# [('step 1',)]`],
        [`<b>Advantages:</b> data integrity under failures, simpler error handling (rollback instead of manual undo), and isolation prevents readers from seeing half-written data.`,
            r`import sqlite3, os, tempfile

path = os.path.join(tempfile.mkdtemp(), "t.db")
a = sqlite3.connect(path); b = sqlite3.connect(path)
a.execute("CREATE TABLE t (v INT)"); a.commit()

a.execute("INSERT INTO t VALUES (1)")                    # uncommitted in connection a
print("b sees:", b.execute("SELECT COUNT(*) FROM t").fetchone()[0])
a.commit()
print("b sees:", b.execute("SELECT COUNT(*) FROM t").fetchone()[0])

# OUTPUT:
# b sees: 0
# b sees: 1`],
        [`<b>Disadvantages:</b> locks cause waiting and possible deadlocks, long transactions block others and bloat logs, and higher isolation levels reduce throughput.`,
            r`import sqlite3, os, tempfile

path = os.path.join(tempfile.mkdtemp(), "t.db")
a = sqlite3.connect(path, timeout=0.1); b = sqlite3.connect(path, timeout=0.1)
a.execute("CREATE TABLE t (v INT)"); a.commit()

a.execute("INSERT INTO t VALUES (1)")        # a now holds the write lock
try:
    b.execute("INSERT INTO t VALUES (2)")    # b must wait, then gives up
except sqlite3.OperationalError as e:
    print(e)

# OUTPUT:
# database is locked`],
        [`<b>Limitations:</b> a transaction is confined to one database (cross-service work needs sagas/outbox patterns), DDL may auto-commit in MySQL, and external side effects (emails, HTTP calls) are not rolled back.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE orders (id INT)")
sent = []
try:
    with con:
        con.execute("INSERT INTO orders VALUES (1)")
        sent.append("email to customer")     # side effect OUTSIDE the DB
        raise RuntimeError("payment failed")
except RuntimeError:
    pass
print(con.execute("SELECT COUNT(*) FROM orders").fetchone()[0], sent)   # DB undone, email is not

# OUTPUT:
# 0 ['email to customer']`],
        `
   BEGIN
     │
     ├─ UPDATE A  (-30)
     ├─ UPDATE B  (+30)
     │
     ├── all OK ──► COMMIT   ──► durable, visible to others
     └── error  ──► ROLLBACK ──► as if nothing happened
`,
        `Keep transactions short and touch rows in a consistent order to avoid deadlocks. Choose isolation per need (READ COMMITTED default is usually enough; SERIALIZABLE for strict invariants) and make operations idempotent so retries are safe. Across services use the outbox pattern or sagas instead of distributed two-phase commit.`
    ),

    'sqlite3': dd(
        [`<b>sqlite3</b> is Python's built-in module for SQLite, a serverless database stored in one file (or in memory). You open a connection, execute SQL through it or through a cursor, and commit.`,
            r`import sqlite3

con = sqlite3.connect("app.db")             # creates the file if missing; ":memory:" for RAM
cur = con.cursor()
cur.execute("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, text TEXT)")
cur.execute("INSERT INTO notes (text) VALUES (?)", ("hello",))
con.commit()                                # persist the change
print(cur.execute("SELECT * FROM notes").fetchall()[-1])
con.close()

# OUTPUT (id grows on each run):
# (1, 'hello')`],
        [`Small apps, tools and tests need persistence without installing and administering a database server. SQLite is zero-configuration, ships with Python, and supports full SQL and transactions.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.row_factory = sqlite3.Row               # rows behave like dicts
con.execute("CREATE TABLE u (id INT, name TEXT)")
con.execute("INSERT INTO u VALUES (1, 'Ada')")
row = con.execute("SELECT * FROM u").fetchone()
print(row["name"], dict(row))               # access by column name

# OUTPUT:
# Ada {'id': 1, 'name': 'Ada'}`],
        [`Used in mobile apps, browsers, desktop software, CLI tools, caches, test suites and low/medium-traffic sites. Context managers keep transactions tidy, and executemany loads data fast.`,
            r`import sqlite3
from contextlib import closing

with closing(sqlite3.connect(":memory:")) as con:       # 'with con' only handles transactions
    con.execute("CREATE TABLE m (k TEXT, v INT)")
    with con:                                           # one transaction for the whole batch
        con.executemany("INSERT INTO m VALUES (?, ?)", [("a", 1), ("b", 2), ("c", 3)])
    print(con.execute("SELECT SUM(v) FROM m").fetchone()[0])

# OUTPUT:
# 6`],
        [`<b>Advantages:</b> no server, single-file database, ACID, tiny footprint, very fast for reads, and ideal for tests because ":memory:" is instant.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("PRAGMA foreign_keys = ON")      # off by default: enable per connection
con.executescript("""
CREATE TABLE a (id INTEGER PRIMARY KEY);
CREATE TABLE b (a_id INT REFERENCES a(id));
""")
try:
    con.execute("INSERT INTO b VALUES (99)")  # parent does not exist
except sqlite3.IntegrityError as e:
    print(e)

# OUTPUT:
# FOREIGN KEY constraint failed`],
        [`<b>Disadvantages:</b> only one writer at a time, no network access, fewer data types and features than PostgreSQL, and not suited to high write concurrency.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (n INTEGER)")
con.execute("INSERT INTO t VALUES ('abc')")  # accepted! SQLite typing is flexible
print(con.execute("SELECT n, typeof(n) FROM t").fetchone())

# OUTPUT:
# ('abc', 'text')`],
        [`<b>Limitations:</b> a connection is bound to its creating thread by default; the file is locked during writes; and database size/concurrency limits make it a poor choice for large multi-user servers.`,
            r`import sqlite3, threading

con = sqlite3.connect(":memory:")

def use():
    try:
        con.execute("SELECT 1")
    except sqlite3.ProgrammingError as e:
        print(str(e).split(".")[0])

t = threading.Thread(target=use); t.start(); t.join()

# OUTPUT:
# SQLite objects created in a thread can only be used in that same thread`],
        `
   Python code
      │  sqlite3.connect("app.db")
      ▼
   Connection ──► Cursor ──► execute(sql, params)
      │
      ▼                      (same process - no server, no network)
   SQLite engine (library) ──► single file app.db
      │
      └── commit() makes changes durable (journal / WAL)
`,
        `SQLite is excellent for embedded use, local-first apps, tests and read-heavy sites (enable WAL mode for better concurrency). Move to PostgreSQL/MySQL when you need many concurrent writers, network access, replication or advanced types. Write against SQLAlchemy or plain portable SQL to keep that migration cheap.`
    ),
};
