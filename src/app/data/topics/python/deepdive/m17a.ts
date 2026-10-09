// Module 17 (Testing), part A: unittest, mocking, pytest basics & fixtures.
import { dd, r, type DeepDive } from './deepDive';

export const m17a: Record<string, DeepDive> = {
    'unittest: Test Cases & Assertions': dd(
        [`<b>unittest</b> is the xUnit-style test framework in the standard library. You subclass <code>unittest.TestCase</code>, write methods whose names start with <code>test</code>, and call <code>assert*</code> methods to state what must be true.`,
            r`import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):          # one class = one group of tests
    def test_positive(self):               # name must start with "test"
        self.assertEqual(add(2, 3), 5)     # expected vs actual

    def test_strings(self):
        self.assertEqual(add("a", "b"), "ab")

# Run inside a script without exiting the interpreter
unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (timing varies; written to stderr):
# ..
# ----------------------------------------------------------------------
# Ran 2 tests in 0.000s
#
# OK`],
        [`Manual checks with print() do not fail loudly and do not run automatically. Tests give you a repeatable safety net: change code, re-run, and know in seconds if something broke.`,
            r`import unittest

def is_even(n):
    return n % 2 == 1          # BUG: should be == 0

class T(unittest.TestCase):
    def test_even(self):
        self.assertTrue(is_even(4))        # the test catches the bug

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (abridged):
# F
# ======================================================================
# FAIL: test_even (__main__.T)
# AssertionError: False is not true
# Ran 1 test in 0.000s
# FAILED (failures=1)`],
        [`CI servers run the whole suite on every commit. Typical real tests check business rules (discounts, validation), exception behaviour and data transformations.`,
            r`import unittest

def apply_discount(price, pct):
    if not 0 <= pct <= 100:
        raise ValueError("pct must be 0-100")
    return round(price * (1 - pct / 100), 2)

class TestDiscount(unittest.TestCase):
    def test_normal(self):
        self.assertAlmostEqual(apply_discount(100, 15), 85.0)   # floats: use almost
    def test_invalid(self):
        with self.assertRaises(ValueError):                     # exception expected
            apply_discount(100, 150)
    def test_members(self):
        self.assertIn("gold", ["silver", "gold"])               # membership

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (timing varies):
# ...
# Ran 3 tests in 0.000s
# OK`],
        [`<b>Advantages:</b> no install (stdlib), familiar xUnit structure, rich assertion set, built-in discovery (<code>python -m unittest discover</code>), subTest, skip decorators and mock support.`,
            r`import unittest

class T(unittest.TestCase):
    def test_many_inputs(self):
        for n in (2, 4, 6, 7):
            with self.subTest(n=n):            # each n reported separately
                self.assertEqual(n % 2, 0)

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (abridged):
# FAIL: test_many_inputs (__main__.T) (n=7)
# AssertionError: 1 != 0
# Ran 1 test in 0.000s
# FAILED (failures=1)    <- only n=7 failed; 2,4,6 still ran`],
        [`<b>Disadvantages:</b> verbose (classes, self.assertX camelCase names), no plain <code>assert</code> introspection, parametrisation is clumsy, fixtures are limited to setUp/tearDown.`,
            r`# Same check: unittest needs a class + a specific method name...
import unittest
class T(unittest.TestCase):
    def test_x(self):
        self.assertGreaterEqual(5, 3)

# ...while pytest only needs a function and a plain assert:
def test_x():
    assert 5 >= 3

print("unittest: 4 lines; pytest: 2 lines")

# OUTPUT:
# unittest: 4 lines; pytest: 2 lines`],
        [`<b>Limitations:</b> test order is alphabetical (tests must be independent), a failure inside setUp skips that test, and assertEqual on huge objects gives hard-to-read diffs unless maxDiff is raised.`,
            r`import unittest

class T(unittest.TestCase):
    def test_b(self): print("b")
    def test_a(self): print("a")      # runs first: alphabetical, not source order

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (stdout part):
# a
# b`],
        `
   test file ──► TestLoader ──► TestSuite ──► TestRunner ──► Result
   (TestCase)   (finds test*)  (collection)   (executes)    (. F E s)
                                   │
                          setUp ─► test_x ─► tearDown   (per test)
`,
        `unittest is the safe default for libraries that must have zero dependencies and for teams with an xUnit background. For application code most teams prefer pytest (runs unittest tests too), so adopt pytest as the runner and keep unittest.mock. Avoid inter-test dependencies and shared mutable state; they make parallel runs flaky.`
    ),

    'unittest: Setup & Teardown': dd(
        [`<b>Fixtures</b> in unittest are hooks that prepare and clean the world around tests: <code>setUp</code>/<code>tearDown</code> run around every test, <code>setUpClass</code>/<code>tearDownClass</code> once per class, and module-level <code>setUpModule</code> once per file.`,
            r`import unittest

class T(unittest.TestCase):
    def setUp(self):             # before EACH test
        print("setUp")
        self.items = []
    def tearDown(self):          # after EACH test, even if it failed
        print("tearDown")
    def test_one(self):
        self.items.append(1); print("test_one", self.items)
    def test_two(self):
        print("test_two", self.items)   # fresh list again

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (stdout):
# setUp
# test_one [1]
# tearDown
# setUp
# test_two []
# tearDown`],
        [`Tests must be independent: each needs a known starting state. Setup builds it (objects, temp files, connections), teardown releases it so one test cannot pollute another.`,
            r`import unittest, tempfile, os

class FileTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile("w", delete=False, suffix=".txt")
        self.tmp.write("hello"); self.tmp.close()
    def tearDown(self):
        os.remove(self.tmp.name)          # always cleaned up
    def test_read(self):
        with open(self.tmp.name) as f:
            self.assertEqual(f.read(), "hello")

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (timing varies):
# .
# Ran 1 test in 0.002s
# OK`],
        [`Real suites use setUpClass for expensive resources (a test database, a Docker container, a loaded ML model) and addCleanup to register undo actions right where resources are created.`,
            r`import unittest

class DbTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):                  # once for the whole class
        cls.conn = {"open": True}         # stands in for an expensive connection
        print("connect")
    @classmethod
    def tearDownClass(cls):
        cls.conn["open"] = False; print("disconnect")
    def setUp(self):
        res = ["resource"]
        self.addCleanup(print, "cleanup runs LIFO")   # registered next to creation
    def test_a(self): self.assertTrue(self.conn["open"])
    def test_b(self): self.assertTrue(self.conn["open"])

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (stdout):
# connect
# cleanup runs LIFO
# cleanup runs LIFO
# disconnect`],
        [`<b>Advantages:</b> explicit lifecycle, guaranteed teardown, class/module scope to amortise slow setup, <code>addCleanup</code> runs even when setUp fails half-way.`,
            r`import unittest

class T(unittest.TestCase):
    def setUp(self):
        self.addCleanup(print, "cleanup still runs")
        raise RuntimeError("setUp blew up")      # tearDown would NOT run, cleanup does
    def tearDown(self): print("tearDown (not reached)")
    def test_x(self): pass

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (stdout + error summary):
# cleanup still runs
# ERROR: test_x ... RuntimeError: setUp blew up`],
        [`<b>Disadvantages:</b> shared setUp makes tests implicitly coupled, hidden state hurts readability, and setUpClass state is shared so mutations leak between tests.`,
            r`import unittest

class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls): cls.shared = []
    def test_a(self): self.shared.append("a")
    def test_b(self): self.assertEqual(self.shared, [])   # depends on order!

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (abridged):
# FAIL: test_b ... AssertionError: ['a'] != []
# (tests run alphabetically so test_a polluted the shared list)`],
        [`<b>Limitations:</b> fixtures cannot be parametrised or injected by name, there is no fixture composition (unlike pytest), and an error in setUpClass fails every test in the class.`,
            r`import unittest

class T(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        raise OSError("db down")
    def test_a(self): pass
    def test_b(self): pass

unittest.main(argv=["prog"], exit=False, verbosity=0)

# OUTPUT (abridged):
# ERROR: setUpClass (__main__.T) ... OSError: db down
# Ran 0 tests    <- both tests are lost`],
        `
   setUpModule
      └─ setUpClass
            ├─ setUp ─► test_a ─► tearDown ─► cleanups
            └─ setUp ─► test_b ─► tearDown ─► cleanups
         tearDownClass
   tearDownModule
`,
        `Keep fixtures small and per-test by default; promote to class/module scope only for measured, genuinely slow resources and treat that state as read-only. Prefer addCleanup over tearDown because it stays next to the allocation. If you need composable or parametrised fixtures, that is the point to move to pytest.`
    ),

    'Mocking with unittest.mock': dd(
        [`<b>unittest.mock</b> replaces real collaborators (network, clock, database) with controllable fakes. <code>Mock</code>/<code>MagicMock</code> record calls; <code>patch</code> swaps a name for a mock during a test and restores it after.`,
            r`from unittest.mock import Mock

m = Mock()
m.get_user.return_value = {"id": 1, "name": "Asha"}   # canned answer

print(m.get_user(1))                  # returns the canned value
m.get_user.assert_called_once_with(1) # verify how it was used
print(m.get_user.call_count)

# OUTPUT:
# {'id': 1, 'name': 'Asha'}
# 1`],
        [`Tests must be fast, deterministic and isolated. A real HTTP call is slow, flaky and has side effects; a mock removes it so you test only your own logic.`,
            r`# Freeze the clock so a time-dependent function is deterministic
import time
from unittest.mock import patch

def greeting():
    return "late" if time.time() > 2_000_000_000 else "early"

with patch("time.time", return_value=2_100_000_000):   # freeze the clock
    print(greeting())

# OUTPUT:
# late`],
        [`Typical uses: fake payment gateways, email senders, cloud SDKs, <code>datetime.now</code>, and files. Patch where the name is <b>looked up</b>, not where it is defined.`,
            r`from unittest.mock import patch

def fetch_price(client):
    return client.get("/price")["amount"]

def total(client, qty):
    return fetch_price(client) * qty

class FakeClient:
    pass

with patch.object(FakeClient, "get", create=True,
                  return_value={"amount": 20}) as g:     # replace one method
    print(total(FakeClient(), 3))
    g.assert_called_once_with("/price")

# OUTPUT:
# 60`],
        [`<b>Advantages:</b> stdlib, auto-restores state, can simulate errors (<code>side_effect</code>), sequences of results, and verify interactions; <code>spec</code> / <code>autospec</code> keep mocks honest.`,
            r`from unittest.mock import Mock

m = Mock()
m.fetch.side_effect = [10, ConnectionError("down"), 30]   # one result per call
print(m.fetch())
try:
    m.fetch()
except ConnectionError as e:
    print("caught:", e)
print(m.fetch())

# OUTPUT:
# 10
# caught: down
# 30`],
        [`<b>Disadvantages:</b> a plain Mock accepts ANY attribute or call, so typos pass silently, and over-mocking couples tests to implementation details.`,
            r`from unittest.mock import Mock, create_autospec

class Api:
    def get(self, url): ...

loose = Mock()
loose.gett("/x")                    # typo accepted silently - test still green!
print("loose mock: no error")

strict = create_autospec(Api, instance=True)
try:
    strict.gett("/x")               # autospec rejects unknown attributes
except AttributeError as e:
    print("strict:", e)

# OUTPUT:
# loose mock: no error
# strict: Mock object has no attribute 'gett'`],
        [`<b>Limitations:</b> patching the wrong target does nothing (name already imported elsewhere), mocks cannot prove real integration works, and patching builtins/C types can be restricted.`,
            r`from unittest.mock import patch
import os

def home():
    return os.getcwd()

# Patch the object the function actually uses: os.getcwd
with patch("os.getcwd", return_value="/fake"):
    print(home())
print(home() != "/fake")        # restored automatically

# OUTPUT:
# /fake
# True`],
        `
   code under test ──► dependency (real)       slow / flaky / side-effects
          │
          └──patch──► MagicMock  ──► return_value / side_effect
                          │
                          └── records calls ──► assert_called_with(...)
`,
        `Mock at architectural boundaries (HTTP, DB, clock), not between your own classes; prefer fakes or in-memory implementations for rich collaborators and autospec to keep mocks in sync with the real API. Excess mocking yields green tests with broken production, so back mocked unit tests with a few integration tests.`
    ),

    'pytest Basics': dd(
        [`<b>pytest</b> is the most popular third-party test framework (<code>pip install pytest</code>). Tests are plain functions named <code>test_*</code> in files named <code>test_*.py</code>; you use the normal <code>assert</code> statement and pytest rewrites it to give detailed failure output.`,
            r`# file: test_basic.py   run with:  pytest -q
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5

def test_add_strings():
    assert add("a", "b") == "ab"

# OUTPUT (running: pytest -q):
# ..                                                    [100%]
# 2 passed in 0.01s`],
        [`unittest needs classes and special assert methods. pytest cuts that ceremony, auto-discovers tests, shows helpful diffs and has a plugin ecosystem - so writing tests stops feeling like a chore.`,
            r`# file: test_fail.py
def test_lists():
    assert [1, 2, 3] == [1, 2, 4]       # pytest shows exactly what differs

# OUTPUT (abridged):
# >       assert [1, 2, 3] == [1, 2, 4]
# E       assert [1, 2, 3] == [1, 2, 4]
# E         At index 2 diff: 3 != 4
# 1 failed in 0.02s`],
        [`Used by most modern Python projects (Django apps, FastAPI services, data libraries). Run subsets with <code>-k</code>, stop at first failure with <code>-x</code>, and test exceptions with <code>pytest.raises</code>.`,
            r`# file: test_api.py
import pytest

def parse_age(s):
    n = int(s)
    if n < 0:
        raise ValueError("negative age")
    return n

def test_valid():
    assert parse_age("42") == 42

def test_negative():
    with pytest.raises(ValueError, match="negative"):   # exception + message check
        parse_age("-1")

def test_float_approx():
    assert 0.1 + 0.2 == pytest.approx(0.3)              # float-safe compare

# OUTPUT:
# ...                                                   [100%]
# 3 passed in 0.01s`],
        [`<b>Advantages:</b> minimal syntax, assertion introspection, fixtures, parametrisation, rich plugins (xdist, cov, asyncio), and it also runs unittest tests.`,
            r`# file: test_group.py  -- plain classes work too, no inheritance needed
class TestMath:
    def test_square(self):
        assert 4 ** 2 == 16
    def test_div(self):
        assert 7 // 2 == 3

# OUTPUT (pytest -v):
# test_group.py::TestMath::test_square PASSED
# test_group.py::TestMath::test_div PASSED`],
        [`<b>Disadvantages:</b> an external dependency, "magic" (assert rewriting, fixture injection by name) can confuse newcomers, and plugins add version-compatibility burden.`,
            r`# Fixture injection by parameter NAME looks like magic:
import pytest

@pytest.fixture
def user():
    return {"name": "Ravi"}

def test_name(user):            # 'user' is supplied by pytest, never imported or called
    assert user["name"] == "Ravi"

# Typo in the parameter name -> "fixture 'usr' not found" error.

# OUTPUT:
# .                                                     [100%]
# 1 passed`],
        [`<b>Limitations:</b> assertion rewriting only applies to test modules and registered helpers, plain <code>assert</code> is removed under <code>python -O</code>, and duplicate test file basenames need packages or importmode settings.`,
            r`# Helper modules outside test files are NOT rewritten unless registered:
#   pytest.register_assert_rewrite("myhelpers")
# And under python -O asserts vanish, so never run production code with -O
# if you rely on assert for validation.
def check(x):
    assert x > 0, "x must be positive"
    return x

print(__debug__)      # True normally; False with python -O

# OUTPUT:
# True`],
        `
   pytest  ──► collect (test_*.py, test_*()) ──► run each test
                         │                          │
                         │                 setup fixtures ─► test ─► teardown
                         └────────► report: . passed  F failed  E error  s skipped
`,
        `Standardise on pytest with a pinned version and a minimal plugin set (pytest-cov, xdist). Keep conftest.py thin, put assertions in tests not helpers, and fail on warnings in CI. Do not run tests with python -O, and avoid test-order dependence so xdist parallelism stays safe.`
    ),

    'pytest Fixtures': dd(
        [`A <b>fixture</b> is a function decorated with <code>@pytest.fixture</code> that provides test data or resources. Tests request a fixture simply by naming it as a parameter. Code after <code>yield</code> is teardown.`,
            r`import pytest

@pytest.fixture
def numbers():
    print("  setup")
    yield [1, 2, 3]            # value given to the test
    print("  teardown")       # runs after the test

def test_sum(numbers):
    assert sum(numbers) == 6

# OUTPUT (pytest -s):
#   setup
# .  teardown`],
        [`Setup code repeated in every test is noisy and error prone. Fixtures give reusable, composable, dependency-injected setup with guaranteed cleanup and controllable lifetime (scope).`,
            r`import pytest

@pytest.fixture
def db():
    return {"users": []}

@pytest.fixture
def admin(db):                  # a fixture can depend on another fixture
    db["users"].append("admin")
    return "admin"

def test_admin_in_db(db, admin):
    assert "admin" in db["users"]

# OUTPUT:
# .                                                     [100%]
# 1 passed`],
        [`Real fixtures: test DB sessions with rollback, API clients (<code>client</code> in Flask/FastAPI), temp directories (<code>tmp_path</code>), environment overrides (<code>monkeypatch</code>) and captured logs (<code>caplog</code>). Shared fixtures live in <code>conftest.py</code>.`,
            r`# Built-in fixtures need no definition:
def test_write_file(tmp_path):                # unique temp dir per test
    p = tmp_path / "a.txt"
    p.write_text("hi")
    assert p.read_text() == "hi"

def test_env(monkeypatch):
    monkeypatch.setenv("MODE", "test")        # auto-reverted after test
    import os
    assert os.environ["MODE"] == "test"

# OUTPUT:
# ..                                                    [100%]
# 2 passed`],
        [`<b>Advantages:</b> explicit dependencies, scopes (function, class, module, session) to share costly setup, autouse for global rules, yield-based teardown and parametrised fixtures.`,
            r`import pytest

@pytest.fixture(scope="module")          # created once per file
def expensive():
    print("  building once")
    return object()

def test_a(expensive): pass
def test_b(expensive): pass

# OUTPUT (pytest -s):
#   building once
# ..`],
        [`<b>Disadvantages:</b> deep fixture chains hide where data comes from, wide scopes leak state between tests, and overriding fixtures across conftest levels is hard to trace (use <code>pytest --fixtures</code>).`,
            r`import pytest

@pytest.fixture(scope="session")
def bucket():
    return []                       # shared mutable object

def test_one(bucket): bucket.append(1)
def test_two(bucket): assert bucket == []    # FAILS: test_one leaked state

# OUTPUT (abridged):
# E   assert [1] == []
# 1 failed, 1 passed`],
        [`<b>Limitations:</b> fixtures can only be requested by tests/fixtures (not called directly), a higher-scope fixture cannot depend on a lower-scope one, and they are pytest-only.`,
            r`import pytest

@pytest.fixture                        # function scope
def small(): return 1

@pytest.fixture(scope="session")
def big(small):                        # ScopeMismatch error at setup
    return small

def test_x(big): pass

# OUTPUT (abridged):
# ScopeMismatch: You tried to access the function scoped fixture small
# with a session scoped request object.`],
        `
   conftest.py ─ fixtures visible to the folder
        │
   test_x(db, client) ──► pytest builds graph:  db ─► client
        │                          setup  (outer to inner)
        ├──► run test
        └──► teardown (inner to outer, after yield)
`,
        `Design fixtures as small, single-purpose building blocks and keep the default scope function; widen scope only for read-only or reset-able resources. Prefer factory fixtures (return a function) for variants instead of a fixture explosion, and use transactional rollback for DB tests rather than recreating schemas.`
    )
};
