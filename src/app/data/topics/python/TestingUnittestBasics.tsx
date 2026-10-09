import type { Topic } from '../../types';

export const testingUnittestBasics: Topic = {
    id: 'python-testing-unittest-test-cases-assertions',
    name: 'unittest: Test Cases & Assertions',
    beginner: [
        {
            content: `<h4>What is unittest?</h4>
<code>unittest</code> is Python's built-in testing framework - nothing to install. It was modelled on <b>JUnit</b>, so it will feel familiar: tests live in classes, each test is a method, and you check results with assertion methods.<br><br>
• A test class subclasses <code>unittest.TestCase</code>.<br>
• Every method whose name starts with <code>test</code> is a test.<br>
• Each test should check <b>one behaviour</b> and be independent of the others.`
        },
        {
            content: `<h4>Your First Test Case</h4>
Put the code under test in one file and the tests in another, named <code>test_*.py</code>.`,
            codeExamples: [
                `# calc.py
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("cannot divide by zero")
    return a / b`,
                `# test_calc.py
import unittest
from calc import add, divide

class TestCalc(unittest.TestCase):

    def test_add_positive_numbers(self):
        self.assertEqual(add(2, 3), 5)

    def test_add_negative_numbers(self):
        self.assertEqual(add(-2, -3), -5)

    def test_divide(self):
        self.assertEqual(divide(10, 4), 2.5)

    def test_divide_by_zero_raises(self):
        with self.assertRaises(ValueError):
            divide(1, 0)

if __name__ == "__main__":
    unittest.main()`
            ]
        },
        {
            content: `<h4>Running the Tests</h4>
Run one file directly, or let <code>unittest</code> discover every <code>test_*.py</code> file below the current folder. <code>-v</code> lists each test by name. Each passing test prints a dot in normal mode.`,
            codeExamples: [
                `# Run one file
python test_calc.py

# Discover and run every test_*.py file
python -m unittest

# Verbose: one line per test
python -m unittest -v

# OUTPUT of the verbose run (timing varies):
# test_add_negative_numbers (test_calc.TestCalc.test_add_negative_numbers) ... ok
# test_add_positive_numbers (test_calc.TestCalc.test_add_positive_numbers) ... ok
# test_divide (test_calc.TestCalc.test_divide) ... ok
# test_divide_by_zero_raises (test_calc.TestCalc.test_divide_by_zero_raises) ... ok
#
# ----------------------------------------------------------------------
# Ran 4 tests in 0.001s
#
# OK`
            ]
        },
        {
            content: `<h4>The Most Useful Assertions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>Checks</th><th>JUnit equivalent</th></tr>
<tr class='text-center'><td><code>assertEqual(a, b)</code></td><td><code>a == b</code></td><td><code>assertEquals</code></td></tr>
<tr class='text-center'><td><code>assertNotEqual(a, b)</code></td><td><code>a != b</code></td><td><code>assertNotEquals</code></td></tr>
<tr class='text-center'><td><code>assertTrue(x)</code> / <code>assertFalse(x)</code></td><td><code>bool(x)</code> is True / False</td><td><code>assertTrue</code> / <code>assertFalse</code></td></tr>
<tr class='text-center'><td><code>assertIs(a, b)</code> / <code>assertIsNone(x)</code></td><td>Identity / <code>x is None</code></td><td><code>assertSame</code> / <code>assertNull</code></td></tr>
<tr class='text-center'><td><code>assertIn(a, b)</code></td><td><code>a in b</code></td><td>-</td></tr>
<tr class='text-center'><td><code>assertIsInstance(obj, cls)</code></td><td><code>isinstance(obj, cls)</code></td><td><code>assertInstanceOf</code> (JUnit 5)</td></tr>
<tr class='text-center'><td><code>assertAlmostEqual(a, b, places=7)</code></td><td><code>round(a - b, places) == 0</code></td><td><code>assertEquals(a, b, delta)</code></td></tr>
<tr class='text-center'><td><code>assertRaises(Exc)</code></td><td>The block raises Exc</td><td><code>assertThrows</code></td></tr>
<tr class='text-center'><td><code>assertCountEqual(a, b)</code></td><td>Same items, any order</td><td>-</td></tr>
</table>`,
            codeExamples: [
                `import unittest

class TestAssertions(unittest.TestCase):

    def test_examples(self):
        self.assertIn("py", "python")
        self.assertIsNone({}.get("missing"))
        self.assertIsInstance(3.5, float)
        self.assertAlmostEqual(0.1 + 0.2, 0.3)        # == would fail
        self.assertCountEqual([3, 1, 2], [1, 2, 3])
        with self.assertRaisesRegex(ValueError, "invalid literal"):
            int("abc")

unittest.main(argv=["ignored"], exit=False)

# OUTPUT (timing varies):
# .
# ----------------------------------------------------------------------
# Ran 1 test in 0.000s
#
# OK`
            ]
        },
        {
            content: `<h4>Reading a Failure</h4>
When an assertion fails, unittest prints the test name, the traceback and a message showing both values, then a summary.`,
            codeExamples: [
                `# Suppose add() has a bug and returns a - b
python -m unittest test_calc

# OUTPUT (abbreviated; timing varies):
# F...
# ======================================================================
# FAIL: test_add_negative_numbers (test_calc.TestCalc.test_add_negative_numbers)
# ----------------------------------------------------------------------
# Traceback (most recent call last):
#   File "...test_calc.py", line 10, in test_add_negative_numbers
#     self.assertEqual(add(-2, -3), -5)
# AssertionError: 1 != -5
#
# ----------------------------------------------------------------------
# Ran 4 tests in 0.001s
#
# FAILED (failures=1)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Failures vs Errors</h3>
unittest reports two kinds of problems:<br>
• <b>FAIL</b> (<code>F</code>) - an assertion was false: the code returned the wrong answer.<br>
• <b>ERROR</b> (<code>E</code>) - the test raised an unexpected exception (a bug in the code or in the test itself).<br><br>
Other markers: <code>s</code> for skipped tests and <code>x</code> for expected failures (<code>@unittest.skip</code>, <code>@unittest.expectedFailure</code>).`
        },
        {
            content: `<h3>Inspecting the Exception and Custom Messages</h3>
<code>assertRaises</code> used as a context manager keeps the exception, so you can check its message. Every assertion also accepts a <code>msg=</code> argument that is added to the failure report.`,
            codeExamples: [
                `import unittest
from calc import divide

class TestDivide(unittest.TestCase):

    def test_error_message(self):
        with self.assertRaises(ValueError) as ctx:
            divide(1, 0)
        self.assertEqual(str(ctx.exception), "cannot divide by zero")

    def test_with_message(self):
        result = divide(9, 3)
        self.assertEqual(result, 3, msg=f"divide(9, 3) returned {result}")`
            ]
        },
        {
            content: `<h3>subTest: Many Inputs in One Test</h3>
<code>self.subTest(...)</code> reports each failing input separately instead of stopping at the first one - a light form of JUnit's parameterized tests. (pytest's <code>parametrize</code> is covered in its own topic.)`,
            codeExamples: [
                `import unittest

def is_even(n):
    return n % 2 == 0

class TestEven(unittest.TestCase):

    def test_even_numbers(self):
        for n in [0, 2, 4, 100]:
            with self.subTest(n=n):
                self.assertTrue(is_even(n))`
            ]
        },
        {
            content: `<h3>Discovery Rules</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Item</th><th>Rule</th></tr>
<tr class='text-center'><td>Files</td><td>Match <code>test*.py</code> (change with <code>-p</code>)</td></tr>
<tr class='text-center'><td>Folders</td><td>Must be importable packages (contain <code>__init__.py</code>) for discovery to enter them</td></tr>
<tr class='text-center'><td>Classes</td><td>Subclasses of <code>unittest.TestCase</code></td></tr>
<tr class='text-center'><td>Methods</td><td>Names starting with <code>test</code>, run in alphabetical order</td></tr>
</table>
Never rely on the alphabetical order - every test must pass on its own.`,
            codeExamples: [
                `python -m unittest discover -s tests -p "test_*.py"   # folder + pattern
python -m unittest test_calc.TestCalc.test_divide       # one test
python -m unittest -k divide                            # names containing "divide"`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does unittest find tests?</td><td>Files matching test*.py, classes subclassing TestCase, methods whose names start with test</td></tr>
<tr class='text-center'><td>How do you test that code raises an exception?</td><td><code>with self.assertRaises(ValueError):</code> (or assertRaisesRegex to check the message)</td></tr>
<tr class='text-center'><td>Why assertAlmostEqual for floats?</td><td>Floating-point results carry rounding error, so exact equality is unreliable</td></tr>
<tr class='text-center'><td>Failure vs error?</td><td>A failure is a false assertion; an error is an unexpected exception during the test</td></tr>
<tr class='text-center'><td>What does subTest do?</td><td>Runs checks for several inputs inside one test and reports each failing input separately</td></tr>
<tr class='text-center'><td>unittest vs JUnit?</td><td>Same xUnit design: test classes, setUp/tearDown, assertion methods - but no annotations; naming conventions mark tests</td></tr>
</table>`
        }
    ]
};
