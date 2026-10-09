// Module 17 (Testing), part B: parametrization, marks, test strategy, TDD, coverage.
import { dd, r, type DeepDive } from './deepDive';

export const m17b: Record<string, DeepDive> = {
    'pytest Parametrization': dd(
        [`<b>Parametrization</b> runs one test function against many input sets using <code>@pytest.mark.parametrize</code>. Each set becomes its own reported test case.`,
            r`import pytest

@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add(a, b, expected):
    assert a + b == expected

# OUTPUT (pytest -v):
# test_p.py::test_add[1-2-3] PASSED
# test_p.py::test_add[0-0-0] PASSED
# test_p.py::test_add[-1-1-0] PASSED`],
        [`Copy-pasting near-identical tests is tedious and hides edge cases. A data table makes coverage of boundaries obvious and a new case is one added line.`,
            r`import pytest

def is_leap(y):
    return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)

@pytest.mark.parametrize("year, leap", [
    (2024, True), (1900, False), (2000, True), (2023, False),
])
def test_leap(year, leap):
    assert is_leap(year) is leap

# OUTPUT:
# ....                                                  [100%]
# 4 passed`],
        [`Used for validators (emails, phone numbers), parsers, price rules and cross-browser/database matrices. Use <code>ids</code> for readable names and <code>pytest.param</code> to mark single cases.`,
            r`import pytest

def slug(s): return s.strip().lower().replace(" ", "-")

@pytest.mark.parametrize("raw, want", [
    pytest.param("Hello World", "hello-world", id="basic"),
    pytest.param("  Trim  ", "trim", id="spaces"),
    pytest.param("A B", "a-b", id="short"),
    pytest.param("x", "y", id="known-bug", marks=pytest.mark.xfail),
])
def test_slug(raw, want):
    assert slug(raw) == want

# OUTPUT (pytest -v):
# test_s.py::test_slug[basic] PASSED
# test_s.py::test_slug[spaces] PASSED
# test_s.py::test_slug[short] PASSED
# test_s.py::test_slug[known-bug] XFAIL`],
        [`<b>Advantages:</b> less duplication, every case reported and run independently, stacking decorators gives the cartesian product, and failures name the exact input.`,
            r`import pytest

@pytest.mark.parametrize("x", [1, 2])
@pytest.mark.parametrize("y", [10, 20])      # stacked -> 2 x 2 = 4 tests
def test_grid(x, y):
    assert x * y > 0

# OUTPUT (pytest -v):
# test_grid[10-1] PASSED   test_grid[10-2] PASSED
# test_grid[20-1] PASSED   test_grid[20-2] PASSED`],
        [`<b>Disadvantages:</b> large tables hurt readability, auto-generated ids can be cryptic, and a bug in the test logic is multiplied across all cases.`,
            r`import pytest

@pytest.mark.parametrize("v", [{"a": 1}, [1, 2], (3,), object()])
def test_ids(v):
    assert v is not None

# Without ids=..., objects produce ids like  test_ids[v0]  test_ids[v1] ...
# which tells you nothing when one fails.

# OUTPUT (pytest -v):
# test_ids[v0] PASSED
# test_ids[v1] PASSED
# test_ids[v2] PASSED
# test_ids[v3] PASSED`],
        [`<b>Limitations:</b> parameters are fixed at collection time (cannot depend on a fixture value), and mutable parameter objects are shared across cases, so mutating one leaks.`,
            r`import pytest

shared = []                                   # one object reused by all cases

@pytest.mark.parametrize("box", [shared, shared])
def test_mutation(box):
    box.append(1)
    assert len(box) == 1        # 2nd case fails: the same list was reused

# Remedy: use indirect fixtures or build fresh objects inside the test.

# OUTPUT (abridged):
# 1 failed, 1 passed   (assert 2 == 1)`],
        `
   @parametrize("a,b,exp", [ (1,2,3), (0,0,0), (-1,1,0) ])
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   test[1-2-3]   test[0-0-0]  test[-1-1-0]    (3 independent tests)
`,
        `Use parametrization for pure functions with a clear input/output table; prefer property-based testing (Hypothesis) when the input space is huge. Keep tables short and named with ids, and avoid putting logic (if/else) inside parametrized tests because then the test needs its own test.`
    ),

    'pytest Marks & Plugins': dd(
        [`<b>Marks</b> are labels on tests (<code>@pytest.mark.slow</code>, <code>skip</code>, <code>skipif</code>, <code>xfail</code>) that control selection and behaviour. <b>Plugins</b> extend pytest with hooks and fixtures (pytest-cov, xdist, asyncio, mock).`,
            r`import pytest, sys

@pytest.mark.skip(reason="not ready")
def test_wip(): assert False

@pytest.mark.skipif(sys.platform == "win32", reason="posix only")
def test_posix(): assert True

@pytest.mark.xfail(reason="known bug #12")
def test_bug(): assert 1 == 2

# OUTPUT (pytest -rsx on Windows):
# SKIPPED test_wip       not ready
# SKIPPED test_posix     posix only
# XFAIL   test_bug       known bug #12`],
        [`Suites grow: some tests are slow, need a network, or only work on one OS. Marks let you run "fast tests only" locally and "everything" in CI; plugins add features without changing pytest itself.`,
            r`import pytest

@pytest.mark.slow
def test_big_report():
    assert sum(range(1000)) == 499500

@pytest.mark.smoke
def test_login():
    assert True

# Select by mark from the command line:
#   pytest -m "not slow"        -> skips test_big_report
#   pytest -m smoke             -> only test_login

# OUTPUT (pytest -m "not slow" -q):
# .                                                     [100%]
# 1 passed, 1 deselected`],
        [`CI pipelines run <code>pytest -n auto</code> (xdist) for parallelism, <code>--cov</code> for coverage, <code>pytest-asyncio</code> for async code, and <code>pytest-html</code>/<code>junitxml</code> for reports. Register custom marks in <code>pytest.ini</code>.`,
            r`# file: pytest.ini  (shown as a string so this snippet is runnable Python)
ini = """
[pytest]
markers =
    slow: tests that take more than 1s
    smoke: minimal health checks
addopts = -ra --strict-markers
"""
print(ini.strip().splitlines()[0])

# OUTPUT:
# [pytest]`],
        [`<b>Advantages:</b> flexible selection, documented intent (skip reasons), strict marker checking catches typos, huge plugin ecosystem, and custom hooks in <code>conftest.py</code>.`,
            r`# conftest.py: a tiny hook plugin that skips slow tests unless --runslow is given
import pytest

def pytest_addoption(parser):
    parser.addoption("--runslow", action="store_true", help="run slow tests")

def pytest_collection_modifyitems(config, items):
    if config.getoption("--runslow"):
        return
    skip = pytest.mark.skip(reason="need --runslow")
    for item in items:
        if "slow" in item.keywords:
            item.add_marker(skip)

print("hooks defined")

# OUTPUT:
# hooks defined`],
        [`<b>Disadvantages:</b> unregistered marks are silently accepted without <code>--strict-markers</code>, plugins can conflict or break on pytest upgrades, and too many marks make selection logic hard to reason about.`,
            r`import pytest

@pytest.mark.slwo              # typo! plain pytest only warns (PytestUnknownMarkWarning)
def test_x(): pass

# With --strict-markers this becomes an error:
#   'slwo' not found in markers configuration option

# OUTPUT (abridged):
# PytestUnknownMarkWarning: Unknown pytest.mark.slwo`],
        [`<b>Limitations:</b> marks on fixtures have no effect, <code>skipif</code> conditions are evaluated at import time, and <code>xfail(strict=False)</code> silently tolerates an unexpected pass.`,
            r`import pytest

@pytest.mark.xfail(strict=True, reason="should fail")
def test_now_passes():
    assert True              # XPASS(strict) -> reported as FAILED so you notice

# OUTPUT (abridged):
# FAILED test_x.py::test_now_passes - [XPASS(strict)] should fail`],
        `
   test items ──► marks (slow, smoke, skip, xfail)
        │                  │
        │          -m "not slow"  ── selection ──► subset runs
        │
   plugins ──► hooks (addoption, collection_modifyitems, fixtures)
   (cov, xdist, asyncio, html)
`,
        `Keep a short, documented marker vocabulary with --strict-markers, split suites into fast/slow tiers, and pin plugin versions with the pytest version in a lockfile. Write a local conftest plugin only for project-specific policy; adopt a third-party plugin only if it is actively maintained.`
    ),

    'Unit vs Integration Testing': dd(
        [`A <b>unit test</b> checks one small piece (a function or class) in isolation, with dependencies faked. An <b>integration test</b> checks that several real pieces work together (code + database, service + service). End-to-end tests drive the whole system.`,
            r`# Unit: pure logic, nothing external
def total(prices): return sum(prices)

def test_unit_total():
    assert total([1, 2, 3]) == 6

# Integration: real sqlite database + our code together
import sqlite3
def save_and_count(rows):
    con = sqlite3.connect(":memory:")
    con.execute("create table t(x int)")
    con.executemany("insert into t values (?)", [(r,) for r in rows])
    return con.execute("select count(*) from t").fetchone()[0]

def test_integration_db():
    assert save_and_count([1, 2, 3]) == 3

test_unit_total(); test_integration_db()
print("both pass")

# OUTPUT:
# both pass`],
        [`Unit tests alone cannot prove the parts fit together; integration tests alone are slow and make failures hard to localise. You need both, in the right proportion.`,
            r`# Each unit is correct, yet the combination is wrong:
def to_cents(amount):  return int(amount * 100)       # unit test passes
def fmt(cents):        return f"{cents / 10:.2f}"     # BUG: should be / 100

def test_to_cents():   assert to_cents(1.5) == 150
def test_fmt():        assert fmt(150) == "15.00"     # test encoded the bug

print(fmt(to_cents(1.5)))          # integration view shows 15.00, not 1.50

# OUTPUT:
# 15.00`],
        [`The <b>test pyramid</b>: many fast unit tests, fewer integration tests (DB, queue, HTTP API with a test client), very few end-to-end UI tests. Integration tests often use Docker/testcontainers.`,
            r`# Typical layering with markers (pytest.ini registers them)
import pytest

@pytest.mark.unit
def test_price_rule(): assert round(10 * 0.9, 2) == 9.0

@pytest.mark.integration
def test_repo_roundtrip():
    import sqlite3
    con = sqlite3.connect(":memory:")
    con.execute("create table u(name text)")
    con.execute("insert into u values ('a')")
    assert con.execute("select name from u").fetchall() == [("a",)]

# CI: pytest -m unit   (every commit)   |   pytest -m integration (nightly / PR)
print("layers defined")

# OUTPUT:
# layers defined`],
        [`<b>Advantages:</b> unit tests are fast (ms) and pinpoint failures; integration tests catch wiring, SQL, serialization and config bugs that mocks hide.`,
            r`import time

t = time.perf_counter()
for _ in range(1000):
    assert (2 + 2) == 4            # 1000 unit checks
print("1000 unit asserts took under 50 ms:", time.perf_counter() - t < 0.05)

# OUTPUT:
# 1000 unit asserts took under 50 ms: True`],
        [`<b>Disadvantages:</b> unit tests with heavy mocking test the mock, not reality; integration tests are slower, need environments, and are flakier (timeouts, ports, shared data).`,
            r`from unittest.mock import Mock

repo = Mock()
repo.find.return_value = {"id": 1}      # the real DB would return a tuple/Row

def service(repo):
    return repo.find(1)["id"]

print(service(repo))     # green unit test, but real repo returns Row objects
                         # that may not support ["id"] at all

# OUTPUT:
# 1`],
        [`<b>Limitations:</b> neither kind proves performance, concurrency or real-world data quirks; the unit/integration boundary is fuzzy, and teams argue about definitions rather than value.`,
            r`# A race that no single-threaded unit test shows:
import threading
n = 0
def inc():
    global n
    for _ in range(100_000):
        n += 1                       # read-modify-write is not atomic
ts = [threading.Thread(target=inc) for _ in range(4)]
[t.start() for t in ts]; [t.join() for t in ts]
print(n <= 400_000)                  # may be lower on some versions/runs

# OUTPUT (varies):
# True`],
        `
          /\          few      End-to-end  (slow, brittle, high confidence)
         /  \
        /----\        some     Integration (real DB / HTTP / queue)
       /      \
      /--------\      many     Unit        (fast, isolated, mocked edges)
`,
        `Shape the suite as a pyramid, but test where the risk is: a thin CRUD service may deserve mostly integration tests, while a pricing engine deserves dense unit tests. Mock only what you do not own, keep integration tests hermetic (containers, ephemeral databases) and add a few contract tests between services.`
    ),

    'Test-Driven Development': dd(
        [`<b>TDD</b> is a workflow: write a failing test first (<b>Red</b>), write the least code to pass it (<b>Green</b>), then clean the code while tests stay green (<b>Refactor</b>). Repeat in small steps.`,
            r`# RED: test written first; fizzbuzz does not exist yet -> NameError (fails)
def test_three():  assert fizzbuzz(3) == "Fizz"

# GREEN: the simplest thing that passes
def fizzbuzz(n):
    return "Fizz"

test_three()
print("green")

# OUTPUT:
# green`],
        [`Writing the test first forces you to define behaviour and design an easy-to-use API before coding, prevents untested code, and gives a safety net for refactoring.`,
            r`# Next test triangulates the behaviour -> forces a real implementation
def fizzbuzz(n):
    if n % 15 == 0: return "FizzBuzz"     # refactor step: ordering matters
    if n % 3 == 0:  return "Fizz"
    if n % 5 == 0:  return "Buzz"
    return str(n)

for n, want in [(1, "1"), (3, "Fizz"), (5, "Buzz"), (15, "FizzBuzz")]:
    assert fizzbuzz(n) == want
print("all green")

# OUTPUT:
# all green`],
        [`Used for business logic, parsers, bug fixes (write a test that reproduces the bug first, then fix) and legacy refactors. The bug-first habit alone prevents regressions.`,
            r`# Bug report: "empty cart crashes". Step 1: reproduce as a failing test.
def average(xs):
    return sum(xs) / len(xs) if xs else 0.0    # Step 2: fix

def test_empty_cart():
    assert average([]) == 0.0                  # regression test stays forever

test_empty_cart()
print("regression guarded")

# OUTPUT:
# regression guarded`],
        [`<b>Advantages:</b> high coverage naturally, small focused designs, fast feedback, living documentation, and confidence to refactor.`,
            r`# Tests double as examples of how the API is meant to be used
def test_usage_example():
    cart = {"apple": 2, "pear": 1}
    assert sum(cart.values()) == 3

test_usage_example()
print("spec as code")

# OUTPUT:
# spec as code`],
        [`<b>Disadvantages:</b> slower at first, needs discipline and skill, tests can be brittle if they assert implementation details, and it fits poorly for exploratory or UI-heavy work.`,
            r`# Brittle test: asserts HOW, not WHAT
from unittest.mock import Mock
sorter = Mock()
def run(data, sorter): return sorter.quicksort(data)
run([3, 1], sorter)
sorter.quicksort.assert_called_once()    # switching to mergesort breaks this test

print("test knows too much about the implementation")

# OUTPUT:
# test knows too much about the implementation`],
        [`<b>Limitations:</b> tests prove only what you thought to check; TDD does not replace design, integration, performance or security testing, and you cannot test-drive what you cannot specify.`,
            r`def is_prime(n):
    return n > 1 and all(n % i for i in range(2, n))

# Test-driven, all green...
assert is_prime(2) and not is_prime(4) and is_prime(7)
# ...yet this implementation is O(n) per call and hopeless for big numbers.
# No unit test asked about performance.
print("green but slow for large n")

# OUTPUT:
# green but slow for large n`],
        `
   ┌────────┐  write failing test   ┌────────┐  minimal code   ┌──────────┐
   │  RED   │ ────────────────────► │ GREEN  │ ──────────────► │ REFACTOR │
   └────────┘                       └────────┘                 └────┬─────┘
        ▲                                                          │
        └────────────── next behaviour ────────────────────────────┘
`,
        `Apply TDD most strictly to domain logic with stable contracts; use spike-then-test for exploratory code. Test behaviour through public interfaces so refactors do not break tests, and pair TDD with CI and code review. It is a design technique first, a coverage technique second.`
    ),

    'Code Coverage': dd(
        [`<b>Code coverage</b> measures which lines (and optionally branches) of your code executed while the tests ran. In Python use <code>coverage.py</code> or <code>pytest-cov</code>.`,
            r`# Run:   pytest --cov=mypkg --cov-report=term-missing
def grade(score):
    if score >= 50:
        return "pass"
    return "fail"            # never executed by the test below

def test_pass():
    assert grade(80) == "pass"

# OUTPUT (coverage report, example):
# Name       Stmts   Miss  Cover   Missing
# mypkg.py       4      1    75%   5`],
        [`Coverage shows <b>untested code</b>: the places where a change can break silently. It turns "do we test enough?" into a number and a list of missing lines.`,
            r`# Missing branch: the else path of a conditional expression
def sign(n):
    return "pos" if n > 0 else "non-pos"

def test_sign():
    assert sign(5) == "pos"

# Line coverage says 100% (one line). Branch coverage (--cov-branch) says 50%
# because the false branch never ran.

# OUTPUT (example, --cov-branch):
# Stmts Miss Branch BrPart Cover
#     2    0      2      1   75%`],
        [`CI gates enforce a floor (<code>--cov-fail-under=85</code>), PR bots show coverage deltas, and reports in HTML highlight red lines. Exclude boilerplate with <code># pragma: no cover</code>.`,
            r`# pyproject.toml settings, shown as text so the snippet is runnable
config = """
[tool.coverage.run]
branch = true
source = ["mypkg"]

[tool.coverage.report]
fail_under = 85
exclude_lines = ["pragma: no cover", "if __name__ == .__main__.:"]
"""
print(config.splitlines()[1])

# OUTPUT:
# [tool.coverage.run]`],
        [`<b>Advantages:</b> cheap to collect, finds dead and untested code, branch mode catches skipped paths, integrates with every CI, supports combining parallel runs.`,
            r`# Programmatic use of coverage.py (pip install coverage)
import coverage

cov = coverage.Coverage()
cov.start()
sum(i for i in range(10))          # code measured while running
cov.stop()
print("measuring works:", cov.get_data() is not None)

# OUTPUT:
# measuring works: True`],
        [`<b>Disadvantages:</b> chasing 100% invites weak tests, adds 10-50% runtime overhead, and a high number gives false confidence.`,
            r`def divide(a, b):
    return a / b

def test_divide():
    divide(10, 2)            # executes the line, asserts NOTHING

test_divide()
print("100% line coverage, zero verification")

# OUTPUT:
# 100% line coverage, zero verification`],
        [`<b>Limitations:</b> coverage cannot tell if assertions are meaningful, does not measure data-dependent bugs or concurrency, and misses subprocess code unless configured (<code>parallel</code> mode).`,
            r`def risky(x):
    return 100 / x            # bug only for x == 0

def test_risky():
    assert risky(5) == 20     # line is 100% covered, but the ZeroDivisionError
                              # input was never tried
test_risky()
print("covered but still buggy for x=0")

# OUTPUT:
# covered but still buggy for x=0`],
        `
   tests run ──► tracer records executed lines/branches ──► .coverage data
                                                                │
                      report (term / html / xml) ◄──────────────┘
                      Stmts  Miss  Branch  Cover  Missing lines
`,
        `Use coverage as a negative signal (what is surely untested), not a target. Set a modest floor with branch coverage and require coverage on changed lines in PRs rather than a global 100%. Combine with mutation testing (mutmut) for a real measure of test strength on critical modules.`
    )
};
