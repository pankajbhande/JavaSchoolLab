import type { Topic } from '../../types';

export const unittestSetupTeardown: Topic = {
    id: 'python-testing-unittest-setup-teardown',
    name: 'unittest: Setup & Teardown',
    beginner: [
        {
            content: `<h4>Introduction</h4>
Many tests need the same starting state: an empty list, a temporary file, an open connection. <b>Fixture methods</b> prepare and clean that state automatically. <code>setUp()</code> and <code>tearDown()</code> run around <b>every</b> test method, while the class methods <code>setUpClass()</code> and <code>tearDownClass()</code> run <b>once</b> for the whole class. They correspond to JUnit's <code>@BeforeEach</code>, <code>@AfterEach</code>, <code>@BeforeAll</code> and <code>@AfterAll</code>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 693 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:693px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="97" height="48" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="58.5" y="30.5">setUpClass</tspan><tspan x="58.5" y="45.5">(once)</tspan></text><line x1="107" y1="34" x2="137" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="141" y="10" width="104.3" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="193.2" y="30.5">setUp</tspan><tspan x="193.2" y="45.5">(each test)</tspan></text><line x1="245.3" y1="34" x2="275.3" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="279.3" y="10" width="111.6" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="335.1" y="38">test_ method</tspan></text><line x1="390.9" y1="34" x2="420.9" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="424.9" y="10" width="104.3" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="477.1" y="30.5">tearDown</tspan><tspan x="477.1" y="45.5">(each test)</tspan></text><line x1="529.2" y1="34" x2="559.2" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="563.2" y="10" width="118.9" height="48" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="622.7" y="30.5">tearDownClass</tspan><tspan x="622.7" y="45.5">(once)</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: setUp / test / tearDown repeat for every test between the class-level calls</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Copying the same set-up lines into every test is repetitive, and forgetting to clean up (close a file, delete a record) makes one test leak into the next.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Give each test a <b>fresh, known state</b> so tests cannot affect each other.</li>
<li>Write set-up and clean-up <b>once</b> instead of in every test.</li>
<li>Guarantee clean-up runs even when the test fails.</li>
<li>Pay for expensive resources (database, server) <b>once per class</b>.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Recording the order of fixture calls</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import io
import unittest

EVENTS = []


class StackTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        EVENTS.append("setUpClass")

    @classmethod
    def tearDownClass(cls):
        EVENTS.append("tearDownClass")

    def setUp(self):
        EVENTS.append("setUp")
        self.stack = []  # fresh object for every test

    def tearDown(self):
        EVENTS.append("tearDown")

    def test_a_push(self):
        EVENTS.append("test_a_push")
        self.stack.append(1)
        self.assertEqual(self.stack, [1])

    def test_b_starts_empty(self):
        EVENTS.append("test_b_starts_empty")
        self.assertEqual(self.stack, [])


def main():
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(StackTests)
    unittest.TextTestRunner(stream=io.StringIO()).run(suite)  # hide report
    for event in EVENTS:
        print(event)


if __name__ == "__main__":
    main()

# OUTPUT:
# setUpClass
# setUp
# test_a_push
# tearDown
# setUp
# test_b_starts_empty
# tearDown
# tearDownClass`
            ],
            codeExplanations: [
                `Tests run in alphabetical order, so test_a_push comes first. The second test sees an empty list again because setUp built a new list. Both class-level methods appear exactly once.`
            ]
        },
        {
            content: `<h4>Why Fixtures?</h4>
Many tests need the same starting state: a fresh list, a temporary file, an open database connection. Copying that code into every test is repetitive. <b>Fixture methods</b> run automatically around your tests - like <code>@BeforeEach</code> and <code>@AfterEach</code> in JUnit.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>Runs</th></tr>
<tr class='text-center'><td><code>setUp()</code></td><td>before <b>each</b> test method</td></tr>
<tr class='text-center'><td><code>tearDown()</code></td><td>after <b>each</b> test method</td></tr>
<tr class='text-center'><td><code>setUpClass()</code> (classmethod)</td><td>once, before the first test in the class</td></tr>
<tr class='text-center'><td><code>tearDownClass()</code> (classmethod)</td><td>once, after the last test in the class</td></tr>
</table>`
        },
        {
            content: `<h4>A Simple setUp</h4>
Here every test gets its own brand-new stack, so one test can never affect another.`,
            codeExamples: [
                `import unittest

class Stack:
    def __init__(self):
        self.items = []
    def push(self, x):
        self.items.append(x)
    def pop(self):
        return self.items.pop()

class TestStack(unittest.TestCase):
    def setUp(self):
        self.stack = Stack()          # fresh object for every test

    def test_push(self):
        self.stack.push(1)
        self.assertEqual(self.stack.items, [1])

    def test_starts_empty(self):
        self.assertEqual(self.stack.items, [])

    def test_pop_empty(self):
        with self.assertRaises(IndexError):
            self.stack.pop()

unittest.main()

# OUTPUT:
# ...
# ----------------------------------------------------------------------
# Ran 3 tests in 0.000s
#
# OK`
            ]
        },
        {
            content: `<h4>The Order of Calls</h4>
Watch exactly when each fixture runs. The class-level pair wraps everything; the per-test pair wraps each test.`,
            codeExamples: [
                `import unittest

class TestOrder(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("setUpClass")

    def setUp(self):
        print("  setUp")

    def tearDown(self):
        print("  tearDown")

    @classmethod
    def tearDownClass(cls):
        print("tearDownClass")

    def test_a(self):
        print("    test_a")

    def test_b(self):
        print("    test_b")

unittest.main()

# OUTPUT (unittest's own dots and summary go to stderr and are omitted):
# setUpClass
#   setUp
#     test_a
#   tearDown
#   setUp
#     test_b
#   tearDown
# tearDownClass`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>addCleanup: Safer Than tearDown</h3>
If <code>setUp()</code> raises, <code>tearDown()</code> is <b>not</b> called - so anything acquired earlier in setUp leaks. <code>self.addCleanup(func, *args)</code> registers the cleanup <i>as soon as the resource exists</i>, and cleanups always run, in <b>last-in, first-out</b> order, after <code>tearDown</code>.`,
            codeExamples: [
                `import unittest

class TestCleanup(unittest.TestCase):
    def setUp(self):
        print("open A")
        self.addCleanup(print, "close A")
        print("open B")
        self.addCleanup(print, "close B")

    def tearDown(self):
        print("tearDown")

    def test_it(self):
        print("test")

unittest.main()

# OUTPUT (stderr summary omitted):
# open A
# open B
# test
# tearDown
# close B
# close A`
            ]
        },
        {
            content: `<h3>Real Resources: Temporary Files and Databases</h3>
Use <code>setUpClass</code> for expensive, <b>read-only</b> resources shared by all tests, and <code>setUp</code> for anything a test might modify. Combine <code>tempfile</code> with <code>addCleanup</code> so the files disappear even if a test fails.`,
            codeExamples: [
                `import os
import sqlite3
import tempfile
import unittest

class TestWithTempFile(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.dir.cleanup)            # removed even on failure
        self.path = os.path.join(self.dir.name, "notes.txt")

    def test_write_and_read(self):
        with open(self.path, "w") as f:
            f.write("hello")
        with open(self.path) as f:
            self.assertEqual(f.read(), "hello")

class TestDatabase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.conn = sqlite3.connect(":memory:")       # one connection for the class
        cls.conn.execute("CREATE TABLE t (x INTEGER)")

    @classmethod
    def tearDownClass(cls):
        cls.conn.close()

    def setUp(self):
        self.conn.execute("DELETE FROM t")           # clean data before each test

    def test_insert(self):
        self.conn.execute("INSERT INTO t VALUES (1)")
        count = self.conn.execute("SELECT COUNT(*) FROM t").fetchone()[0]
        self.assertEqual(count, 1)

unittest.main()

# OUTPUT:
# ..
# Ran 2 tests in 0.004s
#
# OK`
            ]
        },
        {
            content: `<h3>Rules of Thumb</h3>
<ul>
<li><b>Each test method gets a new instance</b> of the TestCase, so attributes set inside one test never leak into another. Shared mutable state lives only in class attributes - handle with care.</li>
<li><b>Tests must be independent</b> and runnable in any order. Do not depend on <code>test_a</code> having run before <code>test_b</code>.</li>
<li>Module-level equivalents exist: <code>setUpModule()</code> and <code>tearDownModule()</code>.</li>
<li>If <code>setUpClass</code> raises, every test in the class is reported as an error and none run.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Removes duplicated set-up code from every test</td><td>Hidden state: a test reads <code>self.stack</code> defined elsewhere</td></tr>
<tr><td>Fresh state per test keeps tests independent</td><td>Everything in <code>setUp</code> runs even if a test needs less</td></tr>
<tr><td><code>tearDown</code> runs even if the test fails</td><td>Shared class-level state can leak between tests</td></tr>
<tr><td>Class-level fixtures share costly resources</td><td>Less flexible than pytest fixtures (no scopes per test, no injection)</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>setUp vs setUpClass?</td><td>setUp runs before every test; setUpClass runs once for the whole class (and must be a classmethod)</td></tr>
<tr class='text-center'><td>Is tearDown called if setUp fails?</td><td>No - which is why addCleanup is safer: it is registered right after each resource is acquired</td></tr>
<tr class='text-center'><td>In what order do cleanups run?</td><td>Last registered, first run (LIFO), after tearDown</td></tr>
<tr class='text-center'><td>Can tests share state through self?</td><td>No - each test method runs on a new TestCase instance</td></tr>
<tr class='text-center'><td>JUnit equivalent?</td><td>setUp = @BeforeEach, tearDown = @AfterEach, setUpClass = @BeforeAll, tearDownClass = @AfterAll</td></tr>
</table>`
        }
    ]
};
