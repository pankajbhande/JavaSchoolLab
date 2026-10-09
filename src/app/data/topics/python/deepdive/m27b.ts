// Module 27 (Databases), part B: ORMs, pooling, migrations and server databases.
import { dd, r, type DeepDive } from './deepDive';

export const m27b: Record<string, DeepDive> = {
    'SQLAlchemy ORM': dd(
        [`<b>SQLAlchemy</b> is Python's main database toolkit. Its <b>ORM</b> maps classes to tables: you declare models with <code>Mapped[...]</code> columns, add objects to a <b>Session</b> (unit of work), and the session writes SQL on commit.`,
            r`from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase): pass

class User(Base):                            # class <-> table
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    age: Mapped[int] = mapped_column(default=0)

engine = create_engine("sqlite://")          # in-memory SQLite
Base.metadata.create_all(engine)             # CREATE TABLE

with Session(engine) as s:
    s.add_all([User(name="Ada", age=36), User(name="Bob", age=25)])
    s.commit()
    adults = s.scalars(select(User).where(User.age > 30)).all()
    print([u.name for u in adults])

# OUTPUT:
# ['Ada']`],
        [`Hand-written SQL strings plus manual row-to-object mapping is repetitive and fragile. The ORM gives typed objects, relationship navigation, identity tracking and database portability while still allowing raw SQL.`,
            r`from sqlalchemy import create_engine, ForeignKey, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, Session

class Base(DeclarativeBase): pass

class Author(Base):
    __tablename__ = "authors"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    books: Mapped[list["Book"]] = relationship(back_populates="author")

class Book(Base):
    __tablename__ = "books"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    author_id: Mapped[int] = mapped_column(ForeignKey("authors.id"))
    author: Mapped[Author] = relationship(back_populates="books")

engine = create_engine("sqlite://"); Base.metadata.create_all(engine)
with Session(engine) as s:
    ada = Author(name="Ada", books=[Book(title="Notes"), Book(title="Engines")])
    s.add(ada); s.commit()                   # cascades: author + both books
    print([b.title for b in ada.books], ada.books[0].author.name)

# OUTPUT:
# ['Notes', 'Engines'] Ada`],
        [`Web backends (Flask/FastAPI) use a Session per request; services use <code>select()</code> with joins, filters and pagination; Alembic migrates the schema.`,
            r`from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase): pass
class Sale(Base):
    __tablename__ = "sales"
    id: Mapped[int] = mapped_column(primary_key=True)
    region: Mapped[str]
    amount: Mapped[float]

engine = create_engine("sqlite://"); Base.metadata.create_all(engine)
with Session(engine) as s:
    s.add_all([Sale(region="EU", amount=10), Sale(region="EU", amount=5), Sale(region="US", amount=7)])
    s.commit()
    stmt = (select(Sale.region, func.sum(Sale.amount))      # GROUP BY in Python syntax
            .group_by(Sale.region).order_by(Sale.region))
    print(s.execute(stmt).all())

# OUTPUT:
# [('EU', 15.0), ('US', 7.0)]`],
        [`<b>Advantages:</b> database-agnostic, unit-of-work batches writes, powerful relationship loading strategies, expressive query API, and a mature ecosystem (Alembic, async support).`,
            r`from sqlalchemy import create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase): pass
class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
    qty: Mapped[int]

engine = create_engine("sqlite://"); Base.metadata.create_all(engine)
with Session(engine) as s:
    s.add(Item(qty=1)); s.commit()
    item = s.get(Item, 1)
    item.qty += 5                            # just change the attribute...
    s.commit()                               # ...UPDATE is generated automatically
    print(s.get(Item, 1).qty)
    print(str(select(Item).where(Item.qty > 2)).replace("\n", " "))

# OUTPUT:
# 6
# SELECT items.id, items.qty FROM items WHERE items.qty > :qty_1`],
        [`<b>Disadvantages:</b> large API surface and a steep learning curve, lazy loading creates the N+1 problem, and Session state (expiry, flush) surprises beginners.`,
            r`from sqlalchemy import create_engine, ForeignKey, select, event
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,
                            Session, selectinload)

class Base(DeclarativeBase): pass
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    posts: Mapped[list["Post"]] = relationship()
class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

engine = create_engine("sqlite://"); Base.metadata.create_all(engine)
with Session(engine) as s:
    s.add_all([User(posts=[Post(), Post()]), User(posts=[Post()])]); s.commit()

count = []
event.listen(engine, "before_cursor_execute", lambda *a: count.append(1))

with Session(engine) as s:
    count.clear()
    for u in s.scalars(select(User)): len(u.posts)          # lazy: 1 + one per user
    print("lazy:", len(count))
    count.clear()
    for u in s.scalars(select(User).options(selectinload(User.posts))): len(u.posts)
    print("selectinload:", len(count))

# OUTPUT:
# lazy: 3
# selectinload: 2`],
        [`<b>Limitations:</b> objects are tied to their Session (detached objects cannot lazy-load), Sessions are not thread-safe, and the ORM adds overhead versus Core or raw SQL for bulk work.`,
            r`from sqlalchemy import create_engine, insert
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session

class Base(DeclarativeBase): pass
class Row(Base):
    __tablename__ = "rows"
    id: Mapped[int] = mapped_column(primary_key=True)
    v: Mapped[int]

engine = create_engine("sqlite://"); Base.metadata.create_all(engine)
with Session(engine) as s:
    # Bulk path: one executemany via Core insert, no per-object tracking
    s.execute(insert(Row), [{"v": i} for i in range(1000)])
    s.commit()
    print(s.query(Row).count())

# OUTPUT:
# 1000`],
        `
   class User(Base)           Session (unit of work)           Engine
        │                         │                              │
   s.add(User(...)) ───────► identity map + pending list         │
        │                         │ commit()/flush()             │
        │                         └────── generates SQL ───────► Pool ──► DB
   select(User) ◄───────── rows mapped back to User objects ◄────┘
`,
        `Use SQLAlchemy 2.0 style (select(), Mapped) with one Session per request/unit of work, explicit loading strategies, and Alembic for schema changes. Drop to Core or raw SQL for bulk loads and reports. Keep the ORM at the repository boundary so domain code does not depend on Session semantics.`
    ),

    'SQLModel': dd(
        [`<b>SQLModel</b> (by the author of FastAPI) merges <b>SQLAlchemy</b> and <b>Pydantic</b>: one class can be a database table (<code>table=True</code>) and a typed, validated data model, which removes duplicate schema definitions in FastAPI apps.`,
            r`from typing import Optional
from sqlmodel import SQLModel, Field, Session, create_engine, select

class Hero(SQLModel, table=True):            # table model
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    age: Optional[int] = None

engine = create_engine("sqlite://")
SQLModel.metadata.create_all(engine)

with Session(engine) as s:
    s.add(Hero(name="Deadpond", age=48)); s.add(Hero(name="Rusty"))
    s.commit()
    print(s.exec(select(Hero).where(Hero.age > 40)).all())

# OUTPUT:
# [Hero(name='Deadpond', age=48, id=1)]`],
        [`A FastAPI project otherwise needs a SQLAlchemy model, a Pydantic input schema and a Pydantic output schema for the same entity. SQLModel lets related classes share fields through inheritance.`,
            r`from typing import Optional
from sqlmodel import SQLModel, Field

class HeroBase(SQLModel):                    # shared fields, written once
    name: str
    age: Optional[int] = None

class Hero(HeroBase, table=True):            # DB table adds the primary key
    id: Optional[int] = Field(default=None, primary_key=True)

class HeroCreate(HeroBase):                  # input schema (no id)
    pass

class HeroRead(HeroBase):                    # output schema (id is required)
    id: int

print(list(HeroCreate.model_fields), list(HeroRead.model_fields))

# OUTPUT:
# ['name', 'age'] ['name', 'age', 'id']`],
        [`Typical in FastAPI services: endpoints accept HeroCreate, store Hero via a Session dependency, and return HeroRead.`,
            r`from typing import Optional
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Field, Session, create_engine
from sqlalchemy.pool import StaticPool

class Hero(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str

engine = create_engine("sqlite://", connect_args={"check_same_thread": False},
                       poolclass=StaticPool)          # share one in-memory DB across threads
SQLModel.metadata.create_all(engine)
app = FastAPI()

@app.post("/heroes", response_model=Hero)
def create(hero: Hero):
    with Session(engine) as s:
        s.add(hero); s.commit(); s.refresh(hero)
        return hero

print(TestClient(app).post("/heroes", json={"name": "Rusty"}).json())

# OUTPUT:
# {'id': 1, 'name': 'Rusty'}`],
        [`<b>Advantages:</b> less boilerplate, full type hints and editor support, validation on the API models, and the whole SQLAlchemy engine/Session underneath.`,
            r`from sqlmodel import SQLModel

class Point(SQLModel):                       # a plain (non-table) model validates input
    x: int
    y: int

p = Point(x="3", y=4)                        # "3" coerced to int, like Pydantic
print(p, p.model_dump())

# OUTPUT:
# x=3 y=4 {'x': 3, 'y': 4}`],
        [`<b>Disadvantages:</b> table models do <i>not</i> validate on creation, it is younger and smaller than SQLAlchemy, and it lags behind new Pydantic/SQLAlchemy releases.`,
            r`from typing import Optional
from sqlmodel import SQLModel, Field

class Hero(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    age: int

h = Hero(age="not a number")                 # no error: table models skip validation!
print(repr(h.age))

# OUTPUT:
# 'not a number'`],
        [`<b>Limitations:</b> advanced mapping (inheritance, composite keys, custom loaders) often needs raw SQLAlchemy features, and validation must be done through separate non-table models.`,
            r`from sqlmodel import SQLModel
from pydantic import ValidationError

class HeroCreate(SQLModel):
    name: str
    age: int

try:
    HeroCreate(name="x", age="oops")         # validate with a non-table model
except ValidationError as e:
    print(type(e).__name__, e.error_count())

# OUTPUT:
# ValidationError 1`],
        `
   HeroBase (shared fields)
      ├──► Hero(table=True)  ──► SQLAlchemy table + Session
      ├──► HeroCreate        ──► request body (validated)
      └──► HeroRead          ──► response model
                   Pydantic validation + SQLAlchemy persistence
`,
        `SQLModel fits small and medium FastAPI services that want minimal ceremony. For complex domains or when you need full SQLAlchemy control, use SQLAlchemy directly with separate Pydantic schemas; it keeps your API and persistence models independently evolvable, which matters over years.`
    ),

    'Connection Pooling': dd(
        [`Opening a database connection (TCP, TLS, auth) is slow. A <b>connection pool</b> keeps a set of open connections and lends them out, so each request borrows one and returns it instead of reconnecting.`,
            r`import queue, sqlite3

class Pool:                                   # a minimal pool, to show the idea
    def __init__(self, size):
        self._q = queue.Queue()
        for _ in range(size):
            self._q.put(sqlite3.connect(":memory:", check_same_thread=False))
    def acquire(self, timeout=1): return self._q.get(timeout=timeout)   # blocks if empty
    def release(self, con): self._q.put(con)

pool = Pool(2)
c1 = pool.acquire(); c2 = pool.acquire()      # both connections now checked out
try:
    pool.acquire(timeout=0.05)                # third caller must wait, then fails
except queue.Empty:
    print("pool exhausted")
pool.release(c1)
print("available again:", pool.acquire() is c1)

# OUTPUT:
# pool exhausted
# available again: True`],
        [`Without pooling, each request pays tens of milliseconds to connect, and databases like PostgreSQL cap total connections (often 100). A pool bounds and reuses connections.`,
            r`import time, sqlite3, os, tempfile

path = os.path.join(tempfile.mkdtemp(), "p.db")
sqlite3.connect(path).execute("CREATE TABLE t (n INT)")

t = time.perf_counter()
for _ in range(500):
    c = sqlite3.connect(path); c.execute("SELECT 1"); c.close()   # new connection each time
print("reconnect each time:", round(time.perf_counter() - t, 3), "s (varies)")

c = sqlite3.connect(path)
t = time.perf_counter()
for _ in range(500):
    c.execute("SELECT 1")                                         # reuse one connection
print("reuse:", round(time.perf_counter() - t, 3), "s (varies)")

# OUTPUT (example; reuse is much faster):
# reconnect each time: 0.12 s (varies)
# reuse: 0.001 s (varies)`],
        [`SQLAlchemy engines include a pool (QueuePool). Typical production settings: <code>pool_size</code>, <code>max_overflow</code>, <code>pool_timeout</code>, <code>pool_recycle</code> and <code>pool_pre_ping</code> (detect dead connections).`,
            r`import os, tempfile
from sqlalchemy import create_engine, text

path = os.path.join(tempfile.mkdtemp(), "pool.db")
engine = create_engine(f"sqlite:///{path}", pool_size=2, max_overflow=0,
                       pool_timeout=0.1, pool_pre_ping=True)

c1 = engine.connect(); c2 = engine.connect()           # pool fully used
print("size:", engine.pool.size(), "checked out:", engine.pool.checkedout())
try:
    engine.connect()                                   # no free connection and no overflow
except Exception as e:
    print(type(e).__name__)
c1.close(); c2.close()                                 # returned to the pool, not closed
print("checked out:", engine.pool.checkedout())

# OUTPUT:
# size: 2 checked out: 2
# TimeoutError
# checked out: 0`],
        [`<b>Advantages:</b> lower latency, protects the database from connection storms, predictable resource use, and automatic health checks and recycling.`,
            r`import os, tempfile
from sqlalchemy import create_engine, text

path = os.path.join(tempfile.mkdtemp(), "reuse.db")
engine = create_engine(f"sqlite:///{path}", pool_size=1)

ids = []
for _ in range(3):
    with engine.connect() as conn:                      # "close" returns it to the pool
        ids.append(id(conn.connection.dbapi_connection))
print("same underlying connection reused:", len(set(ids)) == 1)

# OUTPUT:
# same underlying connection reused: True`],
        [`<b>Disadvantages:</b> leaked (never closed) connections exhaust the pool and hang the app; stale connections after DB restarts or firewall timeouts; pools per process multiply connections.`,
            r`import os, tempfile
from sqlalchemy import create_engine

path = os.path.join(tempfile.mkdtemp(), "leak.db")
engine = create_engine(f"sqlite:///{path}", pool_size=1, max_overflow=0, pool_timeout=0.1)

leaked = engine.connect()                  # BUG: never closed, never returned
try:
    engine.connect()
except Exception as e:
    print("app would hang/fail here:", type(e).__name__)
leaked.close()                             # always use: with engine.connect() as conn:

# OUTPUT:
# app would hang/fail here: TimeoutError`],
        [`<b>Limitations:</b> a pool is per process (4 gunicorn workers x pool_size 10 = 40 connections), connections are not shareable across fork, and in-memory SQLite uses a single shared connection instead.`,
            r`# Capacity planning is arithmetic, not magic:
workers = 4
pool_size, max_overflow = 10, 5
max_per_process = pool_size + max_overflow
total = workers * max_per_process
db_limit = 100                               # e.g. PostgreSQL max_connections
print("worst-case connections:", total, "| fits:", total <= db_limit)

# OUTPUT:
# worst-case connections: 60 | fits: True`],
        `
   request 1 ─┐                      ┌─► conn A ─┐
   request 2 ─┼─► acquire ─► POOL ───┼─► conn B ─┼──► Database
   request 3 ─┘   (waits if empty)   └─► conn C ─┘   (max_connections)
                      ▲                   │
                      └──── release ◄─────┘   (returned, not closed)
`,
        `Size pools from database capacity: total = processes x (pool_size + overflow) must stay below max_connections. Use pool_pre_ping and pool_recycle behind load balancers, and put PgBouncer (transaction pooling) in front when you have many app instances or serverless functions. Always release connections via context managers.`
    ),

    'Migrations': dd(
        [`A <b>migration</b> is a versioned, repeatable script that changes a database schema (add a column, create a table). Tools like <b>Alembic</b> (SQLAlchemy) and Django migrations track which versions are applied so every environment reaches the same schema.`,
            r`import sqlite3

# A hand-rolled migration runner: the same idea Alembic implements
MIGRATIONS = [
    (1, "CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)"),
    (2, "ALTER TABLE users ADD COLUMN email TEXT"),
]

def migrate(con):
    current = con.execute("PRAGMA user_version").fetchone()[0]   # stored schema version
    for version, sql in MIGRATIONS:
        if version > current:
            con.execute(sql)
            con.execute(f"PRAGMA user_version = {version}")
            print("applied", version)

con = sqlite3.connect(":memory:")
migrate(con); migrate(con)                   # second run does nothing

# OUTPUT:
# applied 1
# applied 2`],
        [`Schemas change with every feature. Editing the production database by hand is unrepeatable and unreviewable. Migrations put schema changes in version control, run in CI/CD and can be rolled back.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
con.execute("INSERT INTO users (name) VALUES ('Ada')")

# Safe change = additive + defaulted, so old code and existing rows keep working
con.execute("ALTER TABLE users ADD COLUMN active INTEGER NOT NULL DEFAULT 1")
print(con.execute("SELECT name, active FROM users").fetchall())

# OUTPUT:
# [('Ada', 1)]`],
        [`Alembic workflow (shell): <code>alembic revision --autogenerate -m "add email"</code> then <code>alembic upgrade head</code>. A revision file contains <code>upgrade()</code> and <code>downgrade()</code> functions.`,
            r`# Typical Alembic revision file (alembic/versions/abc123_add_email.py)
revision = "abc123"
down_revision = "000000"                      # chain of versions forms a history

def upgrade():
    # op.add_column("users", sa.Column("email", sa.String(120), nullable=True))
    print("ALTER TABLE users ADD COLUMN email")

def downgrade():
    # op.drop_column("users", "email")
    print("ALTER TABLE users DROP COLUMN email")

upgrade(); downgrade()                        # what 'upgrade head' / 'downgrade -1' do

# OUTPUT:
# ALTER TABLE users ADD COLUMN email
# ALTER TABLE users DROP COLUMN email`],
        [`<b>Advantages:</b> reproducible environments, reviewable history, safe team collaboration, automated deploys, and the ability to roll back (downgrade).`,
            r`import sqlite3

# Record applied migrations in a table, as Alembic's alembic_version table does
con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE schema_version (version TEXT PRIMARY KEY, applied_at TEXT)")
con.execute("INSERT INTO schema_version VALUES ('0001_init', datetime('now'))")
print([r[0] for r in con.execute("SELECT version FROM schema_version")])

# OUTPUT:
# ['0001_init']`],
        [`<b>Disadvantages:</b> autogenerated migrations miss renames and data changes, long histories get messy, branch merges can create multiple heads, and large-table changes can lock the table.`,
            r`# Autogenerate sees a rename as DROP old + ADD new => DATA LOSS unless you fix it by hand.
before = {"users": {"name", "mail"}}
after  = {"users": {"name", "email"}}         # you renamed mail -> email
dropped = before["users"] - after["users"]
added   = after["users"] - before["users"]
print("autogenerate would DROP", dropped, "and ADD", added)
print("fix: op.alter_column('users', 'mail', new_column_name='email')")

# OUTPUT:
# autogenerate would DROP {'mail'} and ADD {'email'}
# fix: op.alter_column('users', 'mail', new_column_name='email')`],
        [`<b>Limitations:</b> SQLite supports few ALTER operations (Alembic uses batch mode to rebuild tables), DDL is not transactional in MySQL, and migrations must stay compatible with the running code during rolling deploys.`,
            r`import sqlite3

con = sqlite3.connect(":memory:")
con.execute("CREATE TABLE t (a INT, b INT)")
try:
    con.execute("ALTER TABLE t ALTER COLUMN a SET NOT NULL")   # not supported in SQLite
except sqlite3.OperationalError as e:
    print("unsupported:", type(e).__name__)
# Workaround = rebuild: create new table, copy rows, drop old, rename (Alembic batch mode)

# OUTPUT:
# unsupported: OperationalError`],
        `
   models.py change ──► alembic revision --autogenerate
                              │
                              ▼
                   versions/0002_add_email.py (reviewed, committed)
                              │  alembic upgrade head
                              ▼
        DB: alembic_version = 0001 ──► run upgrade() ──► 0002
                              ▲
              downgrade() ────┘ (rollback path)
`,
        `Use expand-contract migrations for zero-downtime deploys: add nullable/defaulted columns first, deploy code that writes both, backfill in batches, then drop the old column in a later release. Review every autogenerated script, test migrations against a production-sized copy, and never edit a migration that has already shipped.`
    ),

    'PostgreSQL & MySQL': dd(
        [`<b>PostgreSQL</b> and <b>MySQL/MariaDB</b> are client-server relational databases for production workloads: many concurrent users, replication, roles and large datasets. Python connects with drivers such as <b>psycopg</b> (PostgreSQL) and <b>PyMySQL</b>/<b>mysqlclient</b> (MySQL), usually via SQLAlchemy.`,
            r`# pip install "psycopg[binary]"      (requires a running PostgreSQL server)
import psycopg

with psycopg.connect("postgresql://app:secret@localhost:5432/shop") as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT version()")
        print(cur.fetchone()[0][:10])        # server version string

# OUTPUT (example):
# PostgreSQL`],
        [`SQLite cannot serve many writers over a network. Server databases add concurrent multi-version access (MVCC), user permissions, replication/failover, backups and rich types (JSONB, arrays, full-text search in PostgreSQL).`,
            r`# Same API shape (DB-API 2.0), different placeholder style per driver:
import sqlite3
print("sqlite3  paramstyle:", sqlite3.paramstyle)       # ?  (qmark)
# psycopg / PyMySQL use %s  ->  cur.execute("SELECT * FROM users WHERE id = %s", (5,))

# PostgreSQL extras you cannot get in plain SQLite (needs a server):
#   SELECT data->>'city' FROM events WHERE data @> '{"vip": true}';   -- JSONB operators
#   CREATE INDEX ON events USING GIN (data);

# OUTPUT:
# sqlite3  paramstyle: qmark`],
        [`Web apps use SQLAlchemy with a URL per database. Credentials come from environment variables, not source code.`,
            r`import os
from sqlalchemy import create_engine

# URL = dialect+driver://user:password@host:port/database
pg_url    = os.getenv("DATABASE_URL", "postgresql+psycopg://app:secret@localhost:5432/shop")
mysql_url = "mysql+pymysql://app:secret@localhost:3306/shop"

engine = create_engine(pg_url, pool_size=5, pool_pre_ping=True)
print(engine.dialect.name, engine.url.host, engine.url.database)   # no connection yet (lazy)
print(create_engine(mysql_url).dialect.name)

# OUTPUT (needs the psycopg and pymysql packages installed):
# postgresql localhost shop
# mysql`],
        [`<b>Advantages:</b> scalability (replicas, partitioning), strong concurrency, fine-grained security, mature tooling, and advanced SQL features (CTEs, window functions, JSONB, extensions like PostGIS).`,
            r`# PostgreSQL: INSERT ... RETURNING and upsert in one atomic statement
import psycopg

with psycopg.connect("postgresql://app:secret@localhost/shop") as conn:
    row = conn.execute(
        """INSERT INTO users (email, name) VALUES (%s, %s)
           ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
           RETURNING id""", ("ada@x.com", "Ada")).fetchone()
    print("user id:", row[0])

# OUTPUT (example):
# user id: 1`],
        [`<b>Disadvantages:</b> you must install, secure, back up and tune a server; network latency per query; connection limits; dialect differences make code less portable than it seems.`,
            r`# Network round trips add up: 1000 single-row queries vs 1 batched query
rtt_ms = 1.0                                  # assumed network latency per query
n = 1000
print("one by one:", n * rtt_ms, "ms | one batch:", rtt_ms, "ms (+ transfer)")
# Cure: bulk operations, JOINs, executemany / COPY, avoid N+1.

# OUTPUT:
# one by one: 1000.0 ms | one batch: 1.0 ms (+ transfer)`],
        [`<b>Limitations:</b> MySQL's default storage engine behaviour (and older versions) lacks some PostgreSQL features (e.g. transactional DDL, rich indexes); PostgreSQL needs vacuuming; neither scales writes horizontally without sharding.`,
            r`# Dialect differences you will hit when porting SQL
differences = {
    "limit rows":    {"postgresql": "LIMIT 10",            "mysql": "LIMIT 10",     "sqlserver": "SELECT TOP 10"},
    "auto id":       {"postgresql": "GENERATED ... AS IDENTITY", "mysql": "AUTO_INCREMENT"},
    "upsert":        {"postgresql": "ON CONFLICT DO UPDATE",     "mysql": "ON DUPLICATE KEY UPDATE"},
}
print(differences["upsert"]["mysql"])

# OUTPUT:
# ON DUPLICATE KEY UPDATE`],
        `
   Python app
     │ psycopg / PyMySQL (DB-API)          ┌──────────────┐
     ▼                                     │  Replica (R) │
   Pool ──TCP/TLS──► PRIMARY DB ──stream──►│  read-only   │
                       │  WAL / binlog     └──────────────┘
                       ▼
                  disk + backups
`,
        `Default to PostgreSQL for new systems (richer SQL, JSONB, extensions); choose MySQL/MariaDB when your platform or team already standardises on it. Scale reads with replicas, writes by schema design, partitioning and eventually sharding; use managed services, PgBouncer, migrations and least-privilege roles. Keep SQL portable only when portability is a real requirement.`
    ),

    'Redis': dd(
        [`<b>Redis</b> is an in-memory data-structure server: strings, hashes, lists, sets, sorted sets and streams, accessed by key with very low latency. Python uses the <b>redis-py</b> package.`,
            r`# pip install redis          (requires a running Redis server on localhost:6379)
import redis

r = redis.Redis(host="localhost", port=6379, decode_responses=True)
r.set("greeting", "hello")                    # SET key value
print(r.get("greeting"))                      # GET key
r.expire("greeting", 60)                      # auto-delete after 60 seconds
print(r.ttl("greeting") <= 60)

# OUTPUT (example):
# hello
# True`],
        [`Disk databases take milliseconds per query; Redis answers in microseconds from RAM. It offloads hot reads (caching), counters and short-lived data, protecting the main database.`,
            r`import redis, json
r = redis.Redis(decode_responses=True)

def get_user(uid):                            # cache-aside pattern
    key = f"user:{uid}"
    cached = r.get(key)
    if cached:
        return json.loads(cached)             # cache hit
    user = {"id": uid, "name": "Ada"}         # pretend this is a slow DB query
    r.setex(key, 300, json.dumps(user))       # store with a 5 minute TTL
    return user

print(get_user(1))                            # miss -> DB -> cache
print(get_user(1))                            # hit

# OUTPUT (example):
# {'id': 1, 'name': 'Ada'}
# {'id': 1, 'name': 'Ada'}`],
        [`Real uses: page/API caching, session storage, rate limiting, leaderboards (sorted sets), job queues (Celery/RQ), pub/sub messaging and distributed locks.`,
            r`import redis
r = redis.Redis(decode_responses=True)

# Fixed-window rate limiter: max 3 calls per 10 seconds per user
def allowed(user):
    key = f"rate:{user}"
    n = r.incr(key)                           # atomic increment
    if n == 1:
        r.expire(key, 10)                     # start the window on first call
    return n <= 3

print([allowed("ada") for _ in range(5)])

# Leaderboard with a sorted set
r.zadd("scores", {"ada": 90, "bob": 70, "cy": 85})
print(r.zrevrange("scores", 0, 1, withscores=True))

# OUTPUT (example, on a fresh key):
# [True, True, True, False, False]
# [('ada', 90.0), ('cy', 85.0)]`],
        [`<b>Advantages:</b> extremely fast, rich data structures with atomic operations, TTL support, pub/sub, simple protocol, replication and clustering.`,
            r`import redis
r = redis.Redis(decode_responses=True)

pipe = r.pipeline()                           # batch commands: one network round trip
for i in range(3):
    pipe.incr("hits")
print(pipe.execute())

r.hset("user:1", mapping={"name": "Ada", "plan": "pro"})   # hash = small object
print(r.hgetall("user:1"))

# OUTPUT (example, first run):
# [1, 2, 3]
# {'name': 'Ada', 'plan': 'pro'}`],
        [`<b>Disadvantages:</b> data lives in RAM (expensive), persistence (RDB/AOF) is weaker than a real database, no joins or rich queries, and cache invalidation is hard.`,
            r`import redis
r = redis.Redis(decode_responses=True)

r.set("price:42", "9.99")
# The DB price changes to 12.50 but nobody deleted the key -> stale data served.
print(r.get("price:42"))
r.delete("price:42")                          # explicit invalidation is YOUR job
print(r.get("price:42"))

# OUTPUT (example):
# 9.99
# None`],
        [`<b>Limitations:</b> the dataset must fit in memory, a single command is processed on one thread, keys are flat (no secondary indexes), and values are limited to 512 MB.`,
            r`import redis
r = redis.Redis(decode_responses=True)

# Cap memory and choose an eviction policy so it behaves like a cache, not a crash
r.config_set("maxmemory", "100mb")
r.config_set("maxmemory-policy", "allkeys-lru")    # evict least recently used keys
print(r.config_get("maxmemory-policy"))

# OUTPUT (example):
# {'maxmemory-policy': 'allkeys-lru'}`],
        `
   App ──► Redis (RAM) ──hit──► value in microseconds
              │ miss
              ▼
        Primary database ──► result ──► SETEX into Redis (TTL)
   Structures: String | Hash | List | Set | Sorted Set | Stream
`,
        `Treat Redis as a cache or ephemeral store first, never the only copy of important data unless persistence and replication are configured deliberately. Always set TTLs and maxmemory policies, namespace keys, avoid huge keys and KEYS commands (use SCAN), and design for cache failure (the app must still work, only slower).`
    ),

    'MongoDB': dd(
        [`<b>MongoDB</b> is a document database: data is stored as JSON-like (BSON) documents in collections, with flexible schemas and no fixed table structure. Python uses <b>PyMongo</b> (or Motor for async).`,
            r`# pip install pymongo         (requires a running MongoDB server)
from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")
db = client["shop"]
db.users.insert_one({"name": "Ada", "skills": ["python", "sql"], "address": {"city": "London"}})
doc = db.users.find_one({"name": "Ada"}, {"_id": 0})     # projection: hide _id
print(doc)

# OUTPUT (example):
# {'name': 'Ada', 'skills': ['python', 'sql'], 'address': {'city': 'London'}}`],
        [`Some data is naturally nested and varies per record (product catalogues, CMS content, event logs). Mapping it to many joined tables is awkward; a document keeps the whole aggregate together and evolves without migrations.`,
            r`from pymongo import MongoClient
db = MongoClient()["shop"]
db.products.delete_many({})

db.products.insert_many([
    {"sku": "PEN",  "price": 2.5, "tags": ["office"]},
    {"sku": "LAPTOP", "price": 900, "specs": {"ram_gb": 16, "cpu": "M3"}},   # different shape
])
print(db.products.find_one({"specs.ram_gb": {"$gte": 16}}, {"_id": 0, "sku": 1}))

# OUTPUT (example):
# {'sku': 'LAPTOP'}`],
        [`Used for content platforms, IoT/event data, user profiles, catalogues and rapid prototypes. The aggregation pipeline performs group/sort/filter inside the server; indexes speed queries.`,
            r`from pymongo import MongoClient, ASCENDING
db = MongoClient()["shop"]
db.orders.delete_many({})
db.orders.insert_many([{"region": "EU", "amt": 10}, {"region": "EU", "amt": 5}, {"region": "US", "amt": 7}])
db.orders.create_index([("region", ASCENDING)])

pipeline = [
    {"$group": {"_id": "$region", "total": {"$sum": "$amt"}}},   # GROUP BY region
    {"$sort": {"_id": 1}},
]
print(list(db.orders.aggregate(pipeline)))

# OUTPUT (example):
# [{'_id': 'EU', 'total': 15}, {'_id': 'US', 'total': 7}]`],
        [`<b>Advantages:</b> flexible schema, natural fit for JSON/objects, horizontal scaling by sharding, built-in replication, and atomic updates on single documents.`,
            r`from pymongo import MongoClient
db = MongoClient()["shop"]
db.counters.delete_many({})
db.counters.insert_one({"_id": "page", "hits": 0, "tags": []})

# Atomic in-place operators: no read-modify-write race
db.counters.update_one({"_id": "page"}, {"$inc": {"hits": 1}, "$push": {"tags": "home"}})
print(db.counters.find_one({"_id": "page"}))

# OUTPUT (example):
# {'_id': 'page', 'hits': 1, 'tags': ['home']}`],
        [`<b>Disadvantages:</b> no joins in the relational sense (use embedding or $lookup), data duplication, weaker consistency guarantees unless configured, and flexible schema can become inconsistent data.`,
            r`from pymongo import MongoClient
db = MongoClient()["shop"]
db.people.delete_many({})
db.people.insert_many([{"name": "Ada", "age": 36}, {"name": "Bob", "age": "25"}])   # age is str!

# Nothing stops mixed types, so queries silently miss rows:
print(db.people.count_documents({"age": {"$gt": 30}}))   # only Ada matches numerically

# OUTPUT (example):
# 1`],
        [`<b>Limitations:</b> documents are capped at 16 MB, multi-document transactions exist but are costly, and unbounded arrays inside a document hurt performance.`,
            r`from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError
db = MongoClient()["shop"]
db.users.drop()
db.users.create_index("email", unique=True)         # enforce rules with indexes/validators
db.users.insert_one({"email": "a@x.com"})
try:
    db.users.insert_one({"email": "a@x.com"})
except DuplicateKeyError:
    print("duplicate email rejected")

# OUTPUT (example):
# duplicate email rejected`],
        `
   Python dict ──► BSON ──► MongoDB
   collection "users"
   ┌──────────────────────────────────────────┐
   │ { _id, name:"Ada", skills:[...],         │  one document = one aggregate
   │   address:{ city:"London" } }            │  (nested, no joins needed)
   │ { _id, name:"Bob", plan:"pro" }          │  different shape allowed
   └──────────────────────────────────────────┘
   shards ◄── shard key ──► replica set (primary + secondaries)
`,
        `Choose MongoDB when data is aggregate-shaped, schema varies, and access is mostly by key within one document. Model for your queries (embed what is read together, reference what grows unbounded), add JSON-schema validation and indexes, and pick the shard key carefully. For heavily relational, transactional data, PostgreSQL (with JSONB for flexible parts) is usually the safer choice.`
    ),
};
