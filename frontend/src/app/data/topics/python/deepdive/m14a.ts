// Module 14 (Context Managers): deep dive entries.
import { dd, r, type DeepDive } from './deepDive';

export const m14a: Record<string, DeepDive> = {
    'Using the with Statement': dd(
        [`The <code>with</code> statement runs setup code, executes a block, then <b>always</b> runs cleanup code, even if the block raises an exception. <code>with open(...) as f:</code> opens a file and guarantees it is closed.`,
            r`import os, tempfile
path = os.path.join(tempfile.gettempdir(), "demo_with.txt")

with open(path, "w") as f:        # opened here
    f.write("hello")
print("closed after block:", f.closed)   # closed automatically

with open(path) as f:
    print(f.read())

# OUTPUT:
# closed after block: True
# hello`],
        [`Resources (files, locks, sockets, DB connections) must be released even when errors occur. Manual try/finally is verbose and easy to forget; <code>with</code> makes correct cleanup the default.`,
            r`import threading
lock = threading.Lock()

with lock:                       # acquire; released on exit no matter what
    print("locked:", lock.locked())
print("after block:", lock.locked())

# OUTPUT:
# locked: True
# after block: False`],
        [`Opening files, database transactions (commit/rollback), thread locks, temporary directories, timing blocks, mocking in tests, and HTTP sessions.`,
            r`import tempfile, os
with tempfile.TemporaryDirectory() as d:     # deleted automatically
    print("exists inside:", os.path.isdir(d))
print("exists after :", os.path.isdir(d))

# OUTPUT:
# exists inside: True
# exists after : False`],
        [`<b>Advantages:</b> guaranteed cleanup, no leaks, short and readable, and several resources can be combined in one statement.`,
            r`import io
with io.StringIO("a") as src, io.StringIO() as dst:    # two managers at once
    dst.write(src.read() * 3)
    print(dst.getvalue())

# OUTPUT:
# aaa`],
        [`<b>Disadvantages:</b> the variable from <code>as</code> still exists after the block (but is closed), and using it afterwards raises a confusing error.`,
            r`import os, tempfile
path = os.path.join(tempfile.gettempdir(), "demo_closed.txt")
with open(path, "w") as f:
    pass
try:
    f.write("late")
except ValueError as e:
    print("ValueError:", e)

# OUTPUT:
# ValueError: I/O operation on closed file.`],
        [`<b>Limitations:</b> works only with objects implementing the context manager protocol; the exit action cannot be skipped or awaited (use <code>async with</code> for async resources).`,
            r`try:
    with 42 as x:
        pass
except (TypeError, AttributeError) as e:
    print(type(e).__name__, ":", e)

# OUTPUT:
# TypeError : 'int' object does not support the context manager protocol`],
        `
   with open("f") as f:        ┌─────────────────────────────┐
       body ...         ─────► │ 1. __enter__()  (open)      │
                               │ 2. run body                 │
                               │ 3. __exit__()   (close) ◄───┼── also on exception
                               └─────────────────────────────┘
`,
        `Make <code>with</code> the only way resources are acquired in your codebase. Wrap anything with open/close pairs in a context manager, and use <code>contextlib.ExitStack</code> for a dynamic number of resources.`
    ),

    '__enter__ & __exit__': dd(
        [`The context manager protocol has two methods. <code>__enter__(self)</code> runs on entry and its return value is bound by <code>as</code>. <code>__exit__(self, exc_type, exc, tb)</code> runs on exit; returning a true value swallows the exception.`,
            r`class Demo:
    def __enter__(self):
        print("enter")
        return "resource"
    def __exit__(self, exc_type, exc, tb):
        print("exit", exc_type.__name__ if exc_type else None)
        return False                 # do not swallow exceptions

with Demo() as r_:
    print("body, got", r_)

# OUTPUT:
# enter
# body, got resource
# exit None`],
        [`<code>__exit__</code> receives full information about any exception, so it can decide to roll back, log, translate or suppress it. That level of control is what try/finally cannot give in reusable form.`,
            r`class Tx:
    def __enter__(self): print("BEGIN"); return self
    def __exit__(self, t, e, tb):
        print("ROLLBACK" if t else "COMMIT")

try:
    with Tx():
        raise RuntimeError("boom")
except RuntimeError:
    print("error propagated")

# OUTPUT:
# BEGIN
# ROLLBACK
# error propagated`],
        [`Database transaction wrappers, file and socket classes, lock objects, <code>pytest.raises</code>, <code>unittest.mock.patch</code>, and <code>contextlib.suppress</code>.`,
            r`class Suppress:
    def __init__(self, *types): self.types = types
    def __enter__(self): return self
    def __exit__(self, t, e, tb):
        return t is not None and issubclass(t, self.types)   # True = swallow

with Suppress(KeyError):
    {}["missing"]
print("continued normally")

# OUTPUT:
# continued normally`],
        [`<b>Advantages:</b> full access to exception details; can transform or suppress errors; works for any object, not just files.`,
            r`class Wrap:
    def __enter__(self): return self
    def __exit__(self, t, e, tb):
        if t is ValueError:
            raise RuntimeError("wrapped") from e   # translate the exception

try:
    with Wrap():
        int("x")
except RuntimeError as e:
    print(e, "<-", type(e.__cause__).__name__)

# OUTPUT:
# wrapped <- ValueError`],
        [`<b>Disadvantages:</b> returning a truthy value by accident swallows real bugs silently, and an exception raised inside <code>__exit__</code> replaces the original one.`,
            r`class Bad:
    def __enter__(self): return self
    def __exit__(self, *a): return True      # swallows EVERYTHING

with Bad():
    1 / 0                                     # error vanishes
print("no error was shown!")

# OUTPUT:
# no error was shown!`],
        [`<b>Limitations:</b> <code>__exit__</code> cannot resume or retry the failed block, and <code>__enter__</code> failing means <code>__exit__</code> is never called, so partial setup must clean itself.`,
            r`class Half:
    def __enter__(self):
        print("opening A")
        raise OSError("B failed")
    def __exit__(self, *a):
        print("exit (never printed)")

try:
    with Half():
        pass
except OSError as e:
    print("caught:", e)

# OUTPUT:
# opening A
# caught: B failed`],
        `
   with obj as v:                 normal path        error path
       body                       ────────────       ──────────
                                  __enter__() ► v    __enter__() ► v
                                  body runs          body raises E
                                  __exit__(None,..)  __exit__(E, e, tb)
                                                       returns True  ─► swallowed
                                                       returns False ─► re-raised
`,
        `Return <code>None/False</code> from <code>__exit__</code> unless suppression is the explicit purpose of the class. Keep cleanup idempotent and non-raising, and log rather than raise inside <code>__exit__</code> so the original error is not masked.`
    ),

    'Writing a Context Manager Class': dd(
        [`To create your own context manager, write a class with <code>__enter__</code> and <code>__exit__</code>. Put acquisition in <code>__enter__</code> (or <code>__init__</code>) and release in <code>__exit__</code>.`,
            r`import time
class Timer:
    def __enter__(self):
        self.start = time.perf_counter()
        return self
    def __exit__(self, *exc):
        self.elapsed = time.perf_counter() - self.start
        print(f"block took {self.elapsed:.2f}s")

with Timer():
    time.sleep(0.2)

# OUTPUT (time varies):
# block took 0.20s`],
        [`A class lets the manager hold state, be reused, expose methods inside the block, and be tested like any object. It suits resources with real lifecycle logic.`,
            r`class Connection:
    def __init__(self, name): self.name, self.open = name, False
    def __enter__(self):
        self.open = True
        print("connected to", self.name)
        return self
    def __exit__(self, *exc):
        self.open = False
        print("disconnected")
    def query(self, q): return f"{self.name}:{q}"

with Connection("db1") as c:
    print(c.query("SELECT 1"))
print("open?", c.open)

# OUTPUT:
# connected to db1
# db1:SELECT 1
# disconnected
# open? False`],
        [`Database sessions, temporary working-directory changes, feature-flag overrides in tests, redirecting stdout, and measuring or tracing blocks.`,
            r`import os
class cd:
    """Temporarily change the working directory."""
    def __init__(self, path): self.path = path
    def __enter__(self):
        self.old = os.getcwd()
        os.chdir(self.path)
    def __exit__(self, *exc):
        os.chdir(self.old)

before = os.getcwd()
with cd(os.path.dirname(before) or before):
    pass
print(os.getcwd() == before)      # restored, even if the body fails

# OUTPUT:
# True`],
        [`<b>Advantages:</b> explicit, supports state and reuse, can provide extra methods, and is straightforward to unit-test.`,
            r`class Counter:
    def __init__(self): self.entries = 0
    def __enter__(self):
        self.entries += 1
        return self
    def __exit__(self, *e): return False

c = Counter()
with c: pass
with c: pass                        # the same manager is reusable
print(c.entries)

# OUTPUT:
# 2`],
        [`<b>Disadvantages:</b> more boilerplate than <code>@contextmanager</code> for simple cases, and instances that keep state in <code>self</code> are not safe to re-enter or share across threads.`,
            r`class Nest:
    def __enter__(self):
        self.depth = getattr(self, "depth", 0) + 1
        return self
    def __exit__(self, *e):
        self.depth = 0            # resets - breaks nesting of the same object

n = Nest()
with n:
    with n:
        pass
    print("depth after inner exit:", n.depth)

# OUTPUT:
# depth after inner exit: 0`],
        [`<b>Limitations:</b> cleanup is tied to leaving the block, so it cannot cover resources that outlive it, and exceptions in <code>__exit__</code> can hide the original error.`,
            r`class Noisy:
    def __enter__(self): return self
    def __exit__(self, *e): raise ValueError("cleanup failed")

try:
    with Noisy():
        raise KeyError("original")
except ValueError as e:
    print("ValueError:", e, "| context:", repr(e.__context__))

# OUTPUT:
# ValueError: cleanup failed | context: KeyError('original')`],
        `
   class Resource
   ┌─────────────────────────────────────────────┐
   │ __init__   : configure (cheap, no side fx)  │
   │ __enter__  : acquire / start  ──► returns obj│
   │ __exit__   : release / commit / rollback    │
   └─────────────────────────────────────────────┘
          ▲ used by:  with Resource(...) as obj:
`,
        `Choose a class when the manager has real state, several methods, or must be reusable and reentrant. Use <code>@contextmanager</code> for simple linear setup/teardown. Make managers reentrant or document that they are not.`
    ),

    '@contextmanager': dd(
        [`<code>contextlib.contextmanager</code> turns a generator function with exactly one <code>yield</code> into a context manager. Code before <code>yield</code> is the setup, the yielded value is the <code>as</code> target, and code after it is the cleanup.`,
            r`from contextlib import contextmanager

@contextmanager
def tag(name):
    print(f"<{name}>")          # setup
    yield                       # the with-block runs here
    print(f"</{name}>")         # cleanup

with tag("p"):
    print("text")

# OUTPUT:
# <p>
# text
# </p>`],
        [`Writing a whole class for simple setup/teardown is noisy. A short generator expresses the same lifecycle in one readable top-to-bottom function.`,
            r`from contextlib import contextmanager
import os

@contextmanager
def env(key, value):
    old = os.environ.get(key)
    os.environ[key] = value
    try:
        yield
    finally:                            # always restore
        if old is None: del os.environ[key]
        else: os.environ[key] = old

with env("MODE", "test"):
    print(os.environ["MODE"])
print(os.environ.get("MODE"))

# OUTPUT:
# test
# None`],
        [`Temporary settings, timing and tracing blocks, transaction scopes, acquiring and releasing pooled resources, and test helpers.`,
            r`from contextlib import contextmanager
@contextmanager
def transaction(log):
    log.append("BEGIN")
    try:
        yield log
        log.append("COMMIT")
    except Exception:
        log.append("ROLLBACK")
        raise

log = []
try:
    with transaction(log):
        raise ValueError
except ValueError:
    pass
print(log)

# OUTPUT:
# ['BEGIN', 'ROLLBACK']`],
        [`<b>Advantages:</b> very compact, reads like straight-line code, and the generator frame holds the state for you; the same object works as a decorator too.`,
            r`from contextlib import contextmanager
@contextmanager
def announce():
    print("start"); yield; print("end")

@announce()                 # contextmanager objects can decorate functions
def job(): print("working")
job()

# OUTPUT:
# start
# working
# end`],
        [`<b>Disadvantages:</b> you must wrap the <code>yield</code> in try/finally yourself, otherwise cleanup is skipped when the body raises, and it is single-use per call.`,
            r`from contextlib import contextmanager
@contextmanager
def leaky():
    print("setup")
    yield
    print("cleanup")           # NOT run when the body raises

try:
    with leaky():
        raise RuntimeError("x")
except RuntimeError:
    print("exception passed through")

# OUTPUT:
# setup
# exception passed through`],
        [`<b>Limitations:</b> exactly one <code>yield</code> is allowed (otherwise RuntimeError), and a generator-based manager cannot easily expose extra methods. Use a class for that.`,
            r`from contextlib import contextmanager
@contextmanager
def two():
    yield 1
    yield 2                   # a second yield is an error

try:
    with two():
        pass
except RuntimeError as e:
    print("RuntimeError:", e)

# OUTPUT:
# RuntimeError: generator didn't stop`],
        `
   @contextmanager
   def cm():
       setup()        ◄── runs on  __enter__
       try:
           yield v    ◄── v is bound by "as"; with-body runs here
       finally:
           cleanup()  ◄── runs on  __exit__ (also on error)
`,
        `Default to <code>@contextmanager</code> for linear resource scopes and always use try/finally around the yield. Switch to a class when you need reuse, extra methods or fine control over exception suppression; combine with <code>ExitStack</code> for dynamic sets.`
    ),
};
