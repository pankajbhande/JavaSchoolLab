import type { Topic } from '../../types';

export const pytestBasics: Topic = {
    id: 'python-testing-pytest-basics',
    name: 'pytest Basics',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<b>pytest</b> is the most popular third-party testing framework for Python. Tests are <b>plain functions</b> named <code>test_*</code>, and you check results with the ordinary <code>assert</code> statement. pytest rewrites the assertion so a failure shows the actual values. It also runs old <code>unittest</code> tests, so you can adopt it gradually. Install it with <code>pip install pytest</code>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 420 118" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="184.6" height="26" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="102.3" y="27">unittest</tspan></text><rect x="10" y="44" width="184.6" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="102.3" y="62.5">class + self</tspan></text><rect x="10" y="79" width="184.6" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="102.3" y="97.5">self.assertEqual(a, b)</tspan></text><rect x="224.6" y="10" width="184.6" height="26" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="316.9" y="27">pytest</tspan></text><rect x="224.6" y="44" width="184.6" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="316.9" y="62.5">plain function</tspan></text><rect x="224.6" y="79" width="184.6" height="29" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="316.9" y="97.5">assert a == b</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the same check with far less ceremony in pytest</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> With <code>unittest</code> you need a class, <code>self</code> and dozens of <code>assertXxx</code> methods before you can check one value - enough ceremony to make people skip writing tests.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Write a test as a <b>simple function</b> with a plain <code>assert</code>.</li>
<li>Get <b>detailed failure output</b> automatically, with no special assertion methods.</li>
<li><b>Auto-discover</b> test files and functions by naming convention.</li>
<li>Unlock fixtures, parametrization and a large plugin ecosystem.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Plain-function tests run by pytest</h4>
Save as <code>test_basics.py</code> and run <code>python test_basics.py</code> or simply <code>pytest -v</code>. pytest is a third-party package, so install it first.`,
            codeExamples: [
                `import sys

import pytest


def add(a, b):
    return a + b


def divide(a, b):
    if b == 0:
        raise ValueError("cannot divide by zero")
    return a / b


def test_add():
    assert add(2, 3) == 5


def test_divide():
    assert divide(10, 4) == 2.5


def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(1, 0)


def test_float_sum():
    assert 0.1 + 0.2 == pytest.approx(0.3)  # tolerance for floats


if __name__ == "__main__":
    sys.exit(pytest.main(["-v", __file__]))

# OUTPUT (shortened: the header lines, percentages and the final
# "4 passed in 0.0Xs" timing line are omitted because they vary):
# test_basics.py::test_add PASSED
# test_basics.py::test_divide PASSED
# test_basics.py::test_divide_by_zero PASSED
# test_basics.py::test_float_sum PASSED`
            ],
            codeExplanations: [
                `pytest collects every function named test_*. A plain assert is enough: if it fails, pytest shows both sides of the comparison. pytest.raises is the counterpart of assertRaises, and pytest.approx compares floats within a tolerance. pytest.main() lets a script start the runner itself.`
            ]
        },
        {
            content: `<h4>Why pytest?</h4>
<b>pytest</b> is the most popular third-party testing framework. Compared with <code>unittest</code> there is far less ceremony: tests are <b>plain functions</b>, you use the plain <code>assert</code> statement, and failures are explained in detail. It can also run existing unittest tests.

Install it inside your virtual environment: <code>pip install pytest</code>.`
        },
        {
            content: `<h4>Your First pytest Test</h4>
pytest finds files named <code>test_*.py</code> (or <code>*_test.py</code>) and runs functions named <code>test_*</code>. No class, no <code>self</code>, no special assertion methods.`,
            codeExamples: [
                `# calculator.py
def add(a, b):
    return a + b

def divide(a, b):
    if b == 0:
        raise ValueError("cannot divide by zero")
    return a / b

# test_calculator.py
import pytest
from calculator import add, divide

def test_add():
    assert add(2, 3) == 5

def test_divide():
    assert divide(10, 4) == 2.5

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(1, 0)

# Run from the project folder:   pytest -v
#
# OUTPUT (shortened):
# test_calculator.py::test_add PASSED
# test_calculator.py::test_divide PASSED
# test_calculator.py::test_divide_by_zero PASSED
#
# ============ 3 passed in 0.02s ============`
            ]
        },
        {
            content: `<h4>Failures Explain Themselves</h4>
pytest rewrites your <code>assert</code> statements so that a failure shows the <b>values</b> involved, without any <code>assertEqual</code> variants to remember.`,
            codeExamples: [
                `# test_fail.py
from calculator import add

def test_add_wrong():
    assert add(2, 2) == 5

# OUTPUT (shortened):
# >       assert add(2, 2) == 5
# E       assert 4 == 5
# E        +  where 4 = add(2, 2)
#
# FAILED test_fail.py::test_add_wrong - assert 4 == 5`
            ]
        },
        {
            content: `<h4>Handy Command-Line Options</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Command</th><th>Effect</th></tr>
<tr class='text-center'><td><code>pytest</code></td><td>discover and run everything below the current folder</td></tr>
<tr class='text-center'><td><code>pytest -v</code> / <code>-q</code></td><td>more / less output</td></tr>
<tr class='text-center'><td><code>pytest test_calculator.py::test_add</code></td><td>run one test</td></tr>
<tr class='text-center'><td><code>pytest -k "divide"</code></td><td>run tests whose name contains "divide"</td></tr>
<tr class='text-center'><td><code>pytest -x</code></td><td>stop at the first failure</td></tr>
<tr class='text-center'><td><code>pytest --lf</code></td><td>re-run only the tests that failed last time</td></tr>
<tr class='text-center'><td><code>pytest -s</code></td><td>show <code>print()</code> output (do not capture it)</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>approx, raises and Exception Details</h3>
Floats cannot be compared with <code>==</code>; use <code>pytest.approx</code>. <code>pytest.raises</code> can check the message with <code>match</code> (a regex) and hands you the exception through <code>excinfo</code>.`,
            codeExamples: [
                `import pytest

def test_float_sum():
    assert 0.1 + 0.2 == pytest.approx(0.3)

def test_message():
    with pytest.raises(ValueError, match="invalid literal") as excinfo:
        int("abc")
    assert "abc" in str(excinfo.value)
    assert excinfo.type is ValueError

def test_collections():
    assert [0.1 + 0.2, 1.0] == pytest.approx([0.3, 1.0])

# OUTPUT:
# ... 3 passed in 0.01s`
            ]
        },
        {
            content: `<h3>Built-in Helpers: tmp_path, capsys, monkeypatch</h3>
pytest passes helpers to a test simply by naming them as <b>arguments</b> (these are <i>fixtures</i> - the next topic). The most useful built-ins:
<ul>
<li><code>tmp_path</code> - a unique temporary directory (a <code>pathlib.Path</code>) per test</li>
<li><code>capsys</code> - captures what the code prints to stdout/stderr</li>
<li><code>monkeypatch</code> - safely sets environment variables, attributes and dictionary items, undone after the test</li>
</ul>`,
            codeExamples: [
                `import os

def test_writes_file(tmp_path):
    f = tmp_path / "notes.txt"
    f.write_text("hello")
    assert f.read_text() == "hello"

def test_prints(capsys):
    print("hi there")
    captured = capsys.readouterr()
    assert captured.out == "hi there\\n"

def test_env(monkeypatch):
    monkeypatch.setenv("APP_MODE", "test")
    assert os.getenv("APP_MODE") == "test"

# OUTPUT:
# ... 3 passed in 0.03s`
            ]
        },
        {
            content: `<h3>Project Layout, conftest.py and Configuration</h3>
Put tests in a <code>tests/</code> folder. A file called <code>conftest.py</code> is loaded automatically and holds fixtures and hooks shared by every test beside and below it. Configure pytest once in <code>pyproject.toml</code> instead of repeating command-line flags.
<pre>myproject/
  src/mypkg/__init__.py
  src/mypkg/calculator.py
  tests/
    conftest.py          # shared fixtures
    test_calculator.py
  pyproject.toml

# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-ra -q"       # -ra: summary of skipped/failed tests</pre>
Exit codes matter in CI: <code>0</code> all passed, <code>1</code> some failed, <code>5</code> no tests were collected.`
        },
        {
            content: `<h3>unittest vs pytest</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>unittest</th><th>pytest</th></tr>
<tr class='text-center'><td>Test form</td><td>Methods in a TestCase class</td><td>Plain functions (classes optional)</td></tr>
<tr class='text-center'><td>Assertions</td><td><code>self.assertEqual</code> family</td><td>Plain <code>assert</code> with introspection</td></tr>
<tr class='text-center'><td>Setup</td><td><code>setUp</code> / <code>tearDown</code></td><td>Fixtures (injected by argument name)</td></tr>
<tr class='text-center'><td>Data-driven tests</td><td><code>subTest</code></td><td><code>@pytest.mark.parametrize</code></td></tr>
<tr class='text-center'><td>Installation</td><td>Built in</td><td><code>pip install pytest</code></td></tr>
<tr class='text-center'><td>Extensibility</td><td>Limited</td><td>Large plugin ecosystem</td></tr>
</table>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Minimal syntax: functions and <code>assert</code></td><td>Not in the standard library: must be installed</td></tr>
<tr><td>Excellent failure reports with values and context</td><td>Fixture "magic" (name-based injection) can confuse beginners</td></tr>
<tr><td>Powerful fixtures and parametrization</td><td>Assertion rewriting can surprise when debugging imports</td></tr>
<tr><td>Hundreds of plugins (coverage, xdist, mock, ...)</td><td>Team must agree on versions and plugins</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does pytest discover tests?</td><td>Files <code>test_*.py</code> or <code>*_test.py</code>; functions <code>test_*</code>; classes <code>Test*</code> (without <code>__init__</code>)</td></tr>
<tr class='text-center'><td>How can plain <code>assert</code> give detailed output?</td><td>pytest rewrites assert statements at import time to record the intermediate values</td></tr>
<tr class='text-center'><td>How do you test an exception?</td><td><code>with pytest.raises(Err, match="...")</code></td></tr>
<tr class='text-center'><td>How do you compare floats?</td><td><code>pytest.approx</code></td></tr>
<tr class='text-center'><td>What is conftest.py?</td><td>A special file whose fixtures and hooks are automatically available to tests in its directory tree</td></tr>
</table>`
        }
    ]
};
