import type { Topic } from '../../types';

export const unittestCasesAssertions: Topic = {
    id: 'python-testing-unittest-test-cases-assertions',
    name: 'unittest: Test Cases & Assertions',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<code>unittest</code> is Python's built-in testing framework, modelled on Java's <b>JUnit</b>. A <b>test case</b> is a class that extends <code>unittest.TestCase</code>; every method whose name starts with <code>test</code> is one test. Inside a test you call <b>assertion methods</b> such as <code>assertEqual</code> or <code>assertRaises</code>. If any assertion fails, only that test is marked failed and the others still run.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 635 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:635px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="140.8" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="80.4" y="30.5">class PriceTests</tspan><tspan x="80.4" y="45.5">(TestCase)</tspan></text><line x1="150.8" y1="34" x2="180.8" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="184.8" y="10" width="140.8" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="255.2" y="30.5">test_ methods</tspan><tspan x="255.2" y="45.5">self.assert...()</tspan></text><line x1="325.6" y1="34" x2="355.6" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="359.6" y="10" width="133.5" height="48" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="426.4" y="30.5">unittest runner</tspan><tspan x="426.4" y="45.5">runs each test</tspan></text><line x1="493.1" y1="34" x2="523.1" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="527.1" y="10" width="97" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="575.6" y="30.5">OK or FAIL</tspan><tspan x="575.6" y="45.5">per test</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: each test_ method is an independent check run by the framework</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Checking code by running it and reading <code>print</code> output is slow, manual and easy to forget - nobody notices when a later change silently breaks old behaviour.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Turn "I think it works" into an <b>automatic, repeatable check</b>.</li>
<li>Catch <b>regressions</b> the moment a change breaks something.</li>
<li>Get precise failure messages: the test name, the line and both compared values.</li>
<li>Use a framework that ships with Python - nothing to install.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: A TestCase with several assertion styles</h4>
The suite is run by code (not by <code>unittest.main()</code>) so the summary printed below is exactly the same on every run.`,
            codeExamples: [
                `import io
import unittest

TAX_RATE = 0.18


def price_with_tax(price, rate=TAX_RATE):
    if price < 0:
        raise ValueError("price cannot be negative")
    return round(price * (1 + rate), 2)


class PriceTests(unittest.TestCase):
    def test_normal_price(self):
        self.assertEqual(price_with_tax(100), 118.0)

    def test_rounding(self):
        self.assertAlmostEqual(price_with_tax(19.99), 23.59, places=2)

    def test_negative_price_rejected(self):
        with self.assertRaises(ValueError):
            price_with_tax(-1)

    def test_returns_float(self):
        self.assertIsInstance(price_with_tax(10), float)


def run_suite():
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(PriceTests)
    runner = unittest.TextTestRunner(stream=io.StringIO())  # hide the report
    return runner.run(suite)


def main():
    result = run_suite()
    print("tests run :", result.testsRun)
    print("failures  :", len(result.failures))
    print("errors    :", len(result.errors))
    print("success   :", result.wasSuccessful())


if __name__ == "__main__":
    main()  # normally you would call unittest.main() instead

# OUTPUT:
# tests run : 4
# failures  : 0
# errors    : 0
# success   : True`
            ],
            codeExplanations: [
                `Each test_ method runs on a fresh PriceTests instance. assertEqual compares values, assertAlmostEqual is for floats, assertRaises is used as a context manager to check that an exception happens, and assertIsInstance checks the type. In a real project you would simply end the file with unittest.main() and read its report.`
            ]
        },
        {
            content: `<h4>Why Write Tests?</h4>
A <b>test</b> is code that runs your code and checks the result. Automated tests tell you immediately when a change breaks something that used to work. <code>unittest</code> is Python's built-in testing framework, modelled on Java's <b>JUnit</b>: test classes, test methods and assertion methods.`
        },
        {
            content: `<h4>Your First Test Case</h4>
Subclass <code>unittest.TestCase</code>. Every method whose name starts with <b><code>test</code></b> is run as a separate test. Inside, use <code>self.assert...</code> methods to check results.`,
            codeExamples: [
                `import unittest

def divide(a, b):
    if b == 0:
        raise ValueError("cannot divide by zero")
    return a / b

class TestDivide(unittest.TestCase):
    def test_normal(self):
        self.assertEqual(divide(10, 2), 5)

    def test_float(self):
        self.assertAlmostEqual(divide(1, 3), 0.3333, places=4)

    def test_zero(self):
        with self.assertRaises(ValueError):
            divide(1, 0)

if __name__ == "__main__":
    unittest.main(verbosity=2)

# OUTPUT (Python 3.11+; the time varies):
# test_float (__main__.TestDivide.test_float) ... ok
# test_normal (__main__.TestDivide.test_normal) ... ok
# test_zero (__main__.TestDivide.test_zero) ... ok
#
# ----------------------------------------------------------------------
# Ran 3 tests in 0.000s
#
# OK`
            ],
            codeExplanations: [
                `unittest.main() discovers every TestCase in the file and runs each test_ method on a fresh instance of the class. Tests run in alphabetical order. assertAlmostEqual is used for floats because 1/3 cannot be represented exactly. assertRaises as a context manager passes only if the block raises ValueError.`
            ]
        },
        {
            content: `<h4>Common Assertions</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Method</th><th>Checks that</th></tr>
<tr class='text-center'><td><code>assertEqual(a, b)</code></td><td>a == b</td></tr>
<tr class='text-center'><td><code>assertNotEqual(a, b)</code></td><td>a != b</td></tr>
<tr class='text-center'><td><code>assertTrue(x)</code> / <code>assertFalse(x)</code></td><td>bool(x) is True / False</td></tr>
<tr class='text-center'><td><code>assertIs(a, b)</code> / <code>assertIsNone(x)</code></td><td>identity (<code>is</code>)</td></tr>
<tr class='text-center'><td><code>assertIn(a, b)</code></td><td>a in b</td></tr>
<tr class='text-center'><td><code>assertIsInstance(a, T)</code></td><td>isinstance(a, T)</td></tr>
<tr class='text-center'><td><code>assertAlmostEqual(a, b, places=7)</code></td><td>equal after rounding (floats)</td></tr>
<tr class='text-center'><td><code>assertRaises(Err)</code></td><td>the block raises Err</td></tr>
<tr class='text-center'><td><code>assertCountEqual(a, b)</code></td><td>same items, any order</td></tr>
</table>
Prefer the specific method over <code>assertTrue(a == b)</code>: when it fails, <code>assertEqual</code> prints both values.`
        },
        {
            content: `<h4>Reading a Failure</h4>
A failing assertion raises <code>AssertionError</code> and the runner shows the test name, the line and the two values being compared.`,
            codeExamples: [
                `import unittest

def add(a, b):
    return a + b

class TestAdd(unittest.TestCase):
    def test_wrong_expectation(self):
        self.assertEqual(add(2, 2), 5)

unittest.main()

# OUTPUT (shortened):
# FAIL: test_wrong_expectation (__main__.TestAdd.test_wrong_expectation)
# Traceback (most recent call last):
#   ...
# AssertionError: 4 != 5
#
# FAILED (failures=1)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>subTest: Many Cases, One Test Method</h3>
A plain <code>for</code> loop inside a test stops at the first failure. Wrapping each iteration in <code>self.subTest(...)</code> makes every case report <b>independently</b>, with its parameters in the failure message.`,
            codeExamples: [
                `import unittest

class TestEven(unittest.TestCase):
    def test_even(self):
        for n in (2, 4, 5, 8, 9):
            with self.subTest(n=n):
                self.assertEqual(n % 2, 0)

unittest.main()

# OUTPUT (shortened) - both bad inputs are reported:
# FAIL: test_even (__main__.TestEven.test_even) (n=5)
# AssertionError: 1 != 0
# FAIL: test_even (__main__.TestEven.test_even) (n=9)
# AssertionError: 1 != 0
#
# FAILED (failures=2)`
            ]
        },
        {
            content: `<h3>Inspecting Exceptions, Skipping and Expected Failures</h3>
<code>assertRaises</code> exposes the caught exception as <code>cm.exception</code>, and <code>assertRaisesRegex</code> checks the message. Decorators control which tests run: <code>@skip</code>, <code>@skipIf</code>, <code>@skipUnless</code> and <code>@expectedFailure</code> (a known bug that should not break the build).`,
            codeExamples: [
                `import sys
import unittest

def parse_age(text):
    age = int(text)
    if age < 0:
        raise ValueError("age cannot be negative")
    return age

class TestParseAge(unittest.TestCase):
    def test_message(self):
        with self.assertRaises(ValueError) as cm:
            parse_age("-5")
        self.assertEqual(str(cm.exception), "age cannot be negative")

    def test_regex(self):
        with self.assertRaisesRegex(ValueError, "negative"):
            parse_age("-1")

    @unittest.skipIf(sys.platform == "win32", "needs POSIX")
    def test_posix_only(self):
        pass

    @unittest.expectedFailure
    def test_known_bug(self):
        self.assertEqual(parse_age("abc"), 0)   # raises, as the bug is not fixed

unittest.main()

# OUTPUT (shortened, on Windows):
# Ran 4 tests in 0.001s
# OK (skipped=1, expected failures=1)`
            ]
        },
        {
            content: `<h3>Test Discovery and Project Layout</h3>
Running <code>python -m unittest</code> with no arguments <b>discovers</b> tests: files named <code>test*.py</code> in importable packages. Keep tests in a <code>tests/</code> package (with <code>__init__.py</code>) beside the source.
<pre>python -m unittest                          # discover everything
python -m unittest discover -s tests -v     # a directory, verbose
python -m unittest tests.test_math          # one module
python -m unittest tests.test_math.TestAdd.test_wrong_expectation
python -m unittest -k divide                # names containing "divide"
python -m unittest -f                       # stop at the first failure</pre>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Part of the standard library - works everywhere</td><td>More boilerplate than pytest: class, <code>self</code>, long method names</td></tr>
<tr><td>Familiar to anyone who knows JUnit (TestCase, assert methods)</td><td>Many <code>assertXxx</code> names to remember</td></tr>
<tr><td>Rich assertions with clear failure messages</td><td>Assertion method names use camelCase, unlike PEP 8</td></tr>
<tr><td>Built-in discovery: <code>python -m unittest</code></td><td>Parametrised tests need <code>subTest</code> workarounds</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does unittest find tests?</td><td>Methods starting with <code>test</code> in <code>TestCase</code> subclasses; discovery loads files matching <code>test*.py</code></td></tr>
<tr class='text-center'><td>assertEqual vs assertTrue(a == b)?</td><td>assertEqual shows both values on failure; assertTrue only says "False is not true"</td></tr>
<tr class='text-center'><td>How do you test that an exception is raised?</td><td><code>with self.assertRaises(Err):</code>; use <code>cm.exception</code> or <code>assertRaisesRegex</code> for the message</td></tr>
<tr class='text-center'><td>What does subTest do?</td><td>Lets one test method report each loop case separately instead of stopping at the first failure</td></tr>
<tr class='text-center'><td>How do you compare floats?</td><td><code>assertAlmostEqual</code> (or <code>math.isclose</code>)</td></tr>
</table>`
        }
    ]
};
