import type { Topic } from '../../types';

export const testingPytestBasics: Topic = {
    id: 'python-testing-pytest-basics',
    name: 'pytest Basics',
    beginner: [
        {
            content: `<h4>What is pytest?</h4>
<b>pytest</b> is the most popular Python testing framework (install with <code>pip install pytest</code>). Compared with unittest:<br><br>
• Tests are <b>plain functions</b> - no class required.<br>
• You use the normal <code>assert</code> statement - no <code>assertEqual</code> family to remember.<br>
• When an assert fails, pytest shows the <b>values</b> involved automatically.<br>
• It runs existing unittest tests too, so projects can switch gradually.`
        },
        {
            content: `<h4>Your First pytest Tests</h4>`,
            codeExamples: [
                `# calc.py
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("cannot divide by zero")
    return a / b`,
                `# test_calc.py
import pytest
from calc import add, divide

def test_add():
    assert add(2, 3) == 5

def test_add_strings():
    assert add("Py", "thon") == "Python"

def test_divide():
    assert divide(10, 4) == 2.5

def test_divide_by_zero():
    with pytest.raises(ValueError, match="divide by zero"):
        divide(1, 0)`,
                `pytest

# OUTPUT (abbreviated; timing varies):
# ============================= test session starts ==============================
# collected 4 items
#
# test_calc.py ....                                                        [100%]
#
# ============================== 4 passed in 0.01s ===============================`
            ]
        },
        {
            content: `<h4>Readable Failure Output</h4>
pytest rewrites <code>assert</code> statements so a failure shows what each side evaluated to - and a diff for lists, dicts and strings.`,
            codeExamples: [
                `# test_cart.py
def get_cart():
    return ["pen", "book", "bag"]

def test_cart_items():
    assert get_cart() == ["pen", "book", "ink"]`,
                `pytest test_cart.py

# OUTPUT (abbreviated; exact layout varies by pytest version):
#     def test_cart_items():
# >       assert get_cart() == ["pen", "book", "ink"]
# E       AssertionError: assert ['pen', 'book', 'bag'] == ['pen', 'book', 'ink']
# E
# E         At index 2 diff: 'bag' != 'ink'
#
# test_cart.py:5: AssertionError
# =========================== short test summary info ============================
# FAILED test_cart.py::test_cart_items - AssertionError: assert ['pen', 'book', 'bag'] == ...
# ============================== 1 failed in 0.02s ===============================`
            ]
        },
        {
            content: `<h4>Discovery and Running Tests</h4>
pytest collects files named <code>test_*.py</code> or <code>*_test.py</code>, functions named <code>test_*</code>, and methods named <code>test_*</code> inside classes named <code>Test*</code> (no <code>__init__</code> method).
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Command</th><th>Runs</th></tr>
<tr class='text-center'><td><code>pytest</code></td><td>Everything below the current folder</td></tr>
<tr class='text-center'><td><code>pytest tests/test_calc.py</code></td><td>One file</td></tr>
<tr class='text-center'><td><code>pytest tests/test_calc.py::test_divide</code></td><td>One test</td></tr>
<tr class='text-center'><td><code>pytest -k "divide and not zero"</code></td><td>Tests whose names match the expression</td></tr>
<tr class='text-center'><td><code>pytest -v</code></td><td>One line per test with PASSED/FAILED</td></tr>
<tr class='text-center'><td><code>pytest -x</code></td><td>Stop at the first failure</td></tr>
<tr class='text-center'><td><code>pytest -s</code></td><td>Show <code>print()</code> output (captured by default)</td></tr>
<tr class='text-center'><td><code>pytest --lf</code></td><td>Re-run only the tests that failed last time</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>Comparing Floats with pytest.approx</h3>
<code>0.1 + 0.2 == 0.3</code> is <code>False</code>. <code>pytest.approx</code> compares with a tolerance (relative 1e-6 by default) and also works on lists and dicts of numbers.`,
            codeExamples: [
                `import pytest

def test_floats():
    assert 0.1 + 0.2 == pytest.approx(0.3)
    assert [0.1 + 0.2, 1 / 3] == pytest.approx([0.3, 0.3333333])
    assert 100.4 == pytest.approx(100, abs=0.5)

print(0.1 + 0.2 == pytest.approx(0.3))

# OUTPUT:
# True`
            ]
        },
        {
            content: `<h3>Inspecting Raised Exceptions</h3>
<code>pytest.raises</code> returns an <code>ExceptionInfo</code> object; <code>match=</code> is a regular expression searched in the message.`,
            codeExamples: [
                `import pytest

def withdraw(balance, amount):
    if amount > balance:
        raise ValueError(f"insufficient funds: balance {balance}, requested {amount}")
    return balance - amount

def test_insufficient_funds():
    with pytest.raises(ValueError, match=r"balance \\d+") as excinfo:
        withdraw(100, 500)
    assert excinfo.type is ValueError
    assert "requested 500" in str(excinfo.value)`
            ]
        },
        {
            content: `<h3>Grouping Tests in Classes</h3>
Classes are optional in pytest - use them only to group related tests. They don't subclass anything and must not define <code>__init__</code>.`,
            codeExamples: [
                `from calc import add

class TestAdd:
    def test_integers(self):
        assert add(1, 2) == 3

    def test_floats(self):
        assert add(0.5, 0.25) == 0.75`
            ]
        },
        {
            content: `<h3>Why Most Projects Prefer pytest</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>unittest</th><th>pytest</th></tr>
<tr class='text-center'><td>Test style</td><td>Classes subclassing TestCase</td><td>Plain functions (classes optional)</td></tr>
<tr class='text-center'><td>Assertions</td><td>~30 assert* methods</td><td>Plain <code>assert</code> with value introspection</td></tr>
<tr class='text-center'><td>Setup</td><td>setUp/tearDown</td><td>Composable fixtures with dependency injection</td></tr>
<tr class='text-center'><td>Many inputs</td><td>subTest</td><td><code>@pytest.mark.parametrize</code></td></tr>
<tr class='text-center'><td>Ecosystem</td><td>Standard library only</td><td>Over a thousand plugins (coverage, xdist, django, asyncio...)</td></tr>
<tr class='text-center'><td>Installation</td><td>Built in</td><td><code>pip install pytest</code></td></tr>
</table>
In JUnit terms, pytest is closer to JUnit 5 with AssertJ-style readable failures - but with far less ceremony.`
        },
        {
            content: `<h3>Configuration</h3>
Project-wide options live in <code>pyproject.toml</code> (or <code>pytest.ini</code>), so everyone runs tests the same way.`,
            codeExamples: [
                `# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra --strict-markers"
python_files = ["test_*.py"]`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does pytest show values in failed asserts?</td><td>It rewrites assert statements at import time to record intermediate values</td></tr>
<tr class='text-center'><td>How do you run a single test?</td><td><code>pytest path/test_file.py::test_name</code>, or filter by name with <code>-k</code></td></tr>
<tr class='text-center'><td>How do you test for an exception?</td><td><code>with pytest.raises(ValueError, match="regex"):</code></td></tr>
<tr class='text-center'><td>How do you compare floats?</td><td><code>assert result == pytest.approx(expected)</code></td></tr>
<tr class='text-center'><td>Can pytest run unittest tests?</td><td>Yes - it collects TestCase classes too</td></tr>
<tr class='text-center'><td>Why is print output missing?</td><td>pytest captures it; use <code>-s</code> to show it, or the capsys fixture to test it</td></tr>
</table>`
        }
    ]
};
