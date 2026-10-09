import type { Topic } from '../../types';

export const pytestMarksPlugins: Topic = {
    id: 'python-testing-pytest-marks-plugins',
    name: 'pytest Marks & Plugins',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>mark</b> is a label attached to a test with <code>@pytest.mark.name</code>. Built-in marks change how a test runs (<code>skip</code>, <code>skipif</code>, <code>xfail</code>), and custom marks such as <code>slow</code> let you <b>select</b> tests with <code>-m</code>. <b>Plugins</b> are installable packages that add features: <code>pytest-cov</code> (coverage), <code>pytest-xdist</code> (parallel runs) and many more. In Java, JUnit's <code>@Tag</code> and <code>@Disabled</code> do similar jobs.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 401 199" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:401px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="380.4" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="200.2" y="29.5">@mark.skip       never runs, reported skipped</tspan></text><rect x="10" y="47" width="380.4" height="31" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="200.2" y="66.5">@mark.skipif     skipped when condition is true</tspan></text><rect x="10" y="84" width="380.4" height="31" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="200.2" y="103.5">@mark.xfail      failure is expected (known bug)</tspan></text><rect x="10" y="121" width="380.4" height="31" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="200.2" y="140.5">@mark.slow       custom label: pytest -m slow</tspan></text><rect x="10" y="158" width="380.4" height="31" rx="6" fill="#f5f3ff" stroke="#7c3aed"/><text text-anchor="middle" font-size="12" fill="#5b21b6"><tspan x="200.2" y="177.5">plugins          pytest-cov, pytest-xdist, ...</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: marks decide whether and how a test runs; plugins add features</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A growing suite has slow tests, tests that need a database, tests for unfinished features and known bugs. Without labels you must either run everything or comment tests out and forget them.
<br><br>
<b>Why we need it:</b>
<ul>
<li><b>Group</b> tests (slow, db, smoke) and run only the group you need.</li>
<li>Skip tests that cannot run in some environments, with a visible reason.</li>
<li>Record <b>known bugs</b> with xfail without breaking the build.</li>
<li>Add capabilities (coverage, parallelism) through plugins instead of writing them yourself.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: skip, xfail and a custom mark</h4>
Save as <code>test_marks.py</code> and run <code>pytest -v -m "not slow"</code>. Custom marks should be registered in <code>pytest.ini</code> (<code>markers = slow: slow tests</code>) to avoid a warning.`,
            codeExamples: [
                `import pytest


def test_quick_math():
    assert 2 * 2 == 4


@pytest.mark.slow
def test_big_report():
    assert sum(range(1_000_000)) == 499999500000


@pytest.mark.xfail(reason="float rounding")
def test_known_bug():
    assert 0.1 + 0.2 == 0.3


@pytest.mark.skip(reason="not built yet")
def test_future_feature():
    assert False

# Run with:  pytest -v -m "not slow"
#
# OUTPUT (shortened; the exact wording of reasons varies by version,
# and the summary line "1 passed, 1 skipped, 1 deselected, 1 xfailed
# in 0.0Xs" has a varying time):
# test_marks.py::test_quick_math PASSED
# test_marks.py::test_known_bug XFAIL
# test_marks.py::test_future_feature SKIPPED
#
# test_big_report is deselected because it carries the slow mark.`
            ],
            codeExplanations: [
                `-m "not slow" deselects every test marked slow, so test_big_report never runs. test_known_bug fails as expected (0.1 + 0.2 is 0.30000000000000004), so it is reported as xfailed rather than as a failure. test_future_feature is skipped with its reason shown.`
            ]
        },
        {
            content: `<h4>Marks: Labels on Tests</h4>
A <b>mark</b> is a label attached to a test with <code>@pytest.mark.&lt;name&gt;</code>. pytest has built-in marks that change how a test runs, and you can invent your own to group tests (<code>slow</code>, <code>db</code>, <code>smoke</code>) and select them from the command line.`
        },
        {
            content: `<h4>Built-in Marks: skip, skipif and xfail</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Mark</th><th>Use when</th><th>Reported as</th></tr>
<tr class='text-center'><td><code>@pytest.mark.skip(reason=...)</code></td><td>the test should not run now</td><td>skipped</td></tr>
<tr class='text-center'><td><code>@pytest.mark.skipif(cond, reason=...)</code></td><td>it cannot run in some environments</td><td>skipped</td></tr>
<tr class='text-center'><td><code>@pytest.mark.xfail(reason=...)</code></td><td>a known bug; failure is expected</td><td>xfailed (or XPASS if it unexpectedly passes)</td></tr>
</table>`,
            codeExamples: [
                `import sys
import pytest

@pytest.mark.skip(reason="feature not built yet")
def test_future_feature():
    assert False

@pytest.mark.skipif(sys.platform == "win32", reason="POSIX only")
def test_unix_permissions():
    ...

@pytest.mark.xfail(reason="rounding bug #42")
def test_known_bug():
    assert round(2.675, 2) == 2.68

def test_normal():
    assert 1 + 1 == 2

# Run:  pytest -rsx      (-r s x: show reasons for skipped and xfailed)
#
# OUTPUT (on Windows):
# 1 passed, 2 skipped, 1 xfailed in 0.02s`
            ],
            codeExplanations: [
                `round(2.675, 2) gives 2.67 because 2.675 is stored in binary as slightly less than 2.675, so the assertion fails - which is what xfail expects, so the run is not marked as failed. On Windows the POSIX-only test is skipped. A skipped or xfailed test never turns the build red.`
            ]
        },
        {
            content: `<h4>Custom Marks and Selecting Tests</h4>
Create your own marks and pick tests with <code>-m</code>, which takes a boolean expression.`,
            codeExamples: [
                `import pytest

@pytest.mark.slow
def test_big_report():
    ...

@pytest.mark.db
def test_save_user():
    ...

def test_quick_math():
    assert 2 * 2 == 4

# pytest -m slow             -> runs only test_big_report
# pytest -m "not slow"       -> runs the other two
# pytest -m "slow or db"     -> runs the first two
#
# OUTPUT of  pytest -m "not slow":
# 2 passed, 1 deselected in 0.01s`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Register Your Marks</h3>
An unregistered mark is accepted but triggers a warning, because a typo (<code>@pytest.mark.slwo</code>) would otherwise silently select nothing. Register marks in the config file and add <code>--strict-markers</code> to turn typos into errors.`,
            codeExamples: [
                `# pyproject.toml
[tool.pytest.ini_options]
addopts = "-ra --strict-markers"
markers = [
    "slow: tests that take more than a second",
    "db: tests that need a database",
    "smoke: minimal checks run on every deploy",
]

# pytest --markers      lists every registered and built-in mark`
            ]
        },
        {
            content: `<h3>Marks on Classes and Modules</h3>
A mark placed on a class applies to every test in it; set <code>pytestmark</code> at module level to mark every test in the file. <code>@pytest.mark.usefixtures("name")</code> requests a fixture for its side effect without needing it as an argument.`,
            codeExamples: [
                `import pytest

pytestmark = pytest.mark.db              # every test in this file is "db"

@pytest.fixture
def clean_tables():
    print("cleaning")

@pytest.mark.slow
class TestImports:                        # both tests are also "slow"
    def test_csv(self): ...
    def test_xml(self): ...

@pytest.mark.usefixtures("clean_tables")
def test_insert():
    ...`
            ]
        },
        {
            content: `<h3>Essential Plugins</h3>
pytest's behaviour is extended by <b>plugins</b> installed with <code>pip</code>; they activate automatically.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Plugin</th><th>Adds</th></tr>
<tr class='text-center'><td><code>pytest-cov</code></td><td>coverage reports: <code>pytest --cov=mypkg</code></td></tr>
<tr class='text-center'><td><code>pytest-mock</code></td><td>a <code>mocker</code> fixture wrapping unittest.mock with automatic cleanup</td></tr>
<tr class='text-center'><td><code>pytest-xdist</code></td><td>parallel runs: <code>pytest -n auto</code></td></tr>
<tr class='text-center'><td><code>pytest-asyncio</code> / <code>anyio</code></td><td>tests for <code>async def</code> code</td></tr>
<tr class='text-center'><td><code>pytest-django</code> / <code>pytest-flask</code></td><td>framework integration and fixtures</td></tr>
<tr class='text-center'><td><code>pytest-randomly</code></td><td>random test order, exposing hidden dependencies between tests</td></tr>
<tr class='text-center'><td><code>pytest-timeout</code></td><td>fails tests that hang beyond a limit</td></tr>
</table>`
        },
        {
            content: `<h3>Writing Your Own Plugin Logic in conftest.py</h3>
A plugin is just a module with <b>hook functions</b> named <code>pytest_...</code>. Hooks placed in <code>conftest.py</code> work locally with no packaging. This is the standard recipe for a <code>--runslow</code> option: slow tests are skipped unless you opt in.`,
            codeExamples: [
                `# conftest.py
import pytest

def pytest_addoption(parser):
    parser.addoption("--runslow", action="store_true", default=False,
                     help="also run tests marked slow")

def pytest_collection_modifyitems(config, items):
    if config.getoption("--runslow"):
        return
    skip_slow = pytest.mark.skip(reason="need --runslow to run")
    for item in items:
        if "slow" in item.keywords:
            item.add_marker(skip_slow)

# pytest              -> slow tests are skipped
# pytest --runslow    -> everything runs`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Run exactly the subset you need (<code>-m</code>)</td><td>Skipped and xfail tests can be forgotten and rot</td></tr>
<tr><td>Skips and xfails stay visible in every report</td><td>Unregistered marks give warnings (typos pass silently)</td></tr>
<tr><td>Plugins add coverage, parallelism, mocks and more</td><td>Plugins add dependencies and version conflicts</td></tr>
<tr><td>No need to comment tests out</td><td>Too many marks make the selection logic complicated</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>skip vs skipif vs xfail?</td><td>skip never runs the test; skipif skips on a condition; xfail runs it and expects it to fail (a bug that is known)</td></tr>
<tr class='text-center'><td>How do you run only some tests by label?</td><td>Custom marks plus <code>pytest -m "expr"</code></td></tr>
<tr class='text-center'><td>Why use --strict-markers?</td><td>Unregistered (misspelt) marks become errors instead of silently selecting nothing</td></tr>
<tr class='text-center'><td>How do you run tests in parallel?</td><td><code>pytest-xdist</code>: <code>pytest -n auto</code> - tests must then be independent</td></tr>
<tr class='text-center'><td>How do you add a custom command-line option?</td><td><code>pytest_addoption</code> hook in conftest.py</td></tr>
</table>`
        }
    ]
};
