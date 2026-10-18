import type { Topic } from '../../types';

export const testingSetupTeardown: Topic = {
    id: 'python-testing-unittest-setup-teardown',
    name: 'unittest: Setup & Teardown',
    beginner: [
        {
            content: `<h4>Why Setup and Teardown?</h4>
Many tests need the same starting point - a fresh object, a temporary file, a test database. Instead of repeating that code in every test, put it in special methods that unittest calls for you:<br><br>
• <code>setUp()</code> runs <b>before each</b> test.<br>
• <code>tearDown()</code> runs <b>after each</b> test, even if the test failed.<br><br>
They are the equivalents of JUnit's <code>@BeforeEach</code> and <code>@AfterEach</code>.`
        },
        {
            content: `<h4>A Fresh Object for Every Test</h4>
Because <code>setUp</code> runs before every test, each test gets its <b>own</b> cart - one test adding items cannot affect another.`,
            codeExamples: [
                `import unittest

class Cart:
    def __init__(self):
        self.items = []

    def add(self, item, price):
        self.items.append((item, price))

    def total(self):
        return sum(price for _, price in self.items)


class TestCart(unittest.TestCase):

    def setUp(self):
        self.cart = Cart()              # new cart before every test

    def test_empty_cart_total_is_zero(self):
        self.assertEqual(self.cart.total(), 0)

    def test_total_after_adding(self):
        self.cart.add("pen", 10)
        self.cart.add("book", 250)
        self.assertEqual(self.cart.total(), 260)

unittest.main(argv=["ignored"], exit=False)

# OUTPUT (timing varies):
# ..
# ----------------------------------------------------------------------
# Ran 2 tests in 0.000s
#
# OK`
            ]
        },
        {
            content: `<h4>The Execution Order</h4>
<code>setUpClass</code> and <code>tearDownClass</code> run <b>once</b> for the whole class (JUnit's <code>@BeforeAll</code> / <code>@AfterAll</code>). They are class methods, so they need <code>@classmethod</code>. The trace below records the order.`,
            codeExamples: [
                `import unittest

class TestOrder(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        print("setUpClass")

    @classmethod
    def tearDownClass(cls):
        print("tearDownClass")

    def setUp(self):
        print("  setUp")

    def tearDown(self):
        print("  tearDown")

    def test_a(self):
        print("    test_a")

    def test_b(self):
        print("    test_b")

unittest.main(argv=["ignored"], exit=False)

# OUTPUT (the printed lines; unittest's own summary is omitted):
# setUpClass
#   setUp
#     test_a
#   tearDown
#   setUp
#     test_b
#   tearDown
# tearDownClass`
            ]
        },
        {
            content: `<h4>Temporary Files in Tests</h4>
Tests must never write into your real project folders. Create a temporary directory in <code>setUp</code> and delete it in <code>tearDown</code>.`,
            codeExamples: [
                `import shutil
import tempfile
import unittest
from pathlib import Path

def save_report(folder, text):
    path = Path(folder) / "report.txt"
    path.write_text(text, encoding="utf-8")
    return path


class TestSaveReport(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.tmp)            # always cleaned up, even on failure

    def test_report_is_written(self):
        path = save_report(self.tmp, "Total: 260")
        self.assertTrue(path.exists())
        self.assertEqual(path.read_text(encoding="utf-8"), "Total: 260")`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>addCleanup: Safer Than tearDown</h3>
If <code>setUp</code> raises halfway, <code>tearDown</code> is <b>not</b> called, so resources created earlier leak. Cleanups registered with <code>addCleanup</code> always run - after <code>tearDown</code>, in reverse (LIFO) order - and keep each cleanup next to the thing it cleans.`,
            codeExamples: [
                `import unittest

class TestCleanups(unittest.TestCase):

    def setUp(self):
        print("open db")
        self.addCleanup(print, "close db")
        print("open file")
        self.addCleanup(print, "close file")

    def tearDown(self):
        print("tearDown")

    def test_something(self):
        print("test")

unittest.main(argv=["ignored"], exit=False)

# OUTPUT (the printed lines):
# open db
# open file
# test
# tearDown
# close file
# close db`
            ]
        },
        {
            content: `<h3>TemporaryDirectory with enterContext (3.11+)</h3>
<code>self.enterContext(cm)</code> enters a context manager and registers its exit as a cleanup - the neatest way to use <code>tempfile.TemporaryDirectory</code> in a test.`,
            codeExamples: [
                `import tempfile
import unittest
from pathlib import Path

class TestWithTempDir(unittest.TestCase):

    def setUp(self):
        self.tmp = Path(self.enterContext(tempfile.TemporaryDirectory()))

    def test_write(self):
        (self.tmp / "a.txt").write_text("hi", encoding="utf-8")
        self.assertEqual(sorted(p.name for p in self.tmp.iterdir()), ["a.txt"])`
            ]
        },
        {
            content: `<h3>Test Isolation</h3>
Good tests can run alone, in any order, or in parallel. Common ways isolation breaks:<br>
• <b>Shared mutable state</b> - a list created in <code>setUpClass</code> and modified by tests. Keep expensive, <b>read-only</b> things in <code>setUpClass</code>; create anything that tests change in <code>setUp</code>.<br>
• <b>Global or module state</b> left behind (changed settings, environment variables) - restore it with <code>addCleanup</code>.<br>
• <b>Real external resources</b> - files, databases, network. Use temporary folders, an in-memory SQLite database or mocks.`,
            codeExamples: [
                `import os
import unittest

class TestConfig(unittest.TestCase):

    def test_debug_flag(self):
        old = os.environ.get("APP_DEBUG")
        os.environ["APP_DEBUG"] = "1"

        def restore():
            if old is None:
                os.environ.pop("APP_DEBUG", None)
            else:
                os.environ["APP_DEBUG"] = old

        self.addCleanup(restore)          # environment restored after the test
        self.assertEqual(os.environ["APP_DEBUG"], "1")`
            ]
        },
        {
            content: `<h3>unittest vs JUnit Lifecycle</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>unittest</th><th>JUnit 5</th><th>Runs</th></tr>
<tr class='text-center'><td><code>setUpClass</code> (classmethod)</td><td><code>@BeforeAll</code> (static)</td><td>Once before all tests in the class</td></tr>
<tr class='text-center'><td><code>setUp</code></td><td><code>@BeforeEach</code></td><td>Before every test</td></tr>
<tr class='text-center'><td><code>tearDown</code></td><td><code>@AfterEach</code></td><td>After every test</td></tr>
<tr class='text-center'><td><code>tearDownClass</code></td><td><code>@AfterAll</code></td><td>Once after all tests</td></tr>
<tr class='text-center'><td><code>setUpModule</code> / <code>tearDownModule</code></td><td>-</td><td>Once per test file</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>setUp vs setUpClass?</td><td>setUp runs before every test; setUpClass runs once per class and must be a classmethod</td></tr>
<tr class='text-center'><td>Does tearDown run if the test fails?</td><td>Yes - but not if setUp itself raised</td></tr>
<tr class='text-center'><td>Why use addCleanup?</td><td>Cleanups always run (even if setUp fails partway) and run in LIFO order next to the code that created the resource</td></tr>
<tr class='text-center'><td>How do you handle files in tests?</td><td>Use a temporary directory created in setUp and removed afterwards</td></tr>
<tr class='text-center'><td>What makes tests isolated?</td><td>No shared mutable state, restored global state, and no dependence on execution order or real external systems</td></tr>
</table>`
        }
    ]
};
