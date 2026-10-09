import type { Topic } from '../../types';

export const testingMarksPlugins: Topic = {
    id: 'python-testing-pytest-marks-plugins',
    name: 'pytest Marks & Plugins',
    beginner: [
        {
            content: `<h4>What Are Marks?</h4>
A <b>mark</b> is a label attached to a test with <code>@pytest.mark.name</code>. Some built-in marks change how a test runs (skip it, expect it to fail); custom marks let you group tests and choose which ones to run.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Mark</th><th>Effect</th></tr>
<tr class='text-center'><td><code>skip(reason=...)</code></td><td>Never run this test</td></tr>
<tr class='text-center'><td><code>skipif(condition, reason=...)</code></td><td>Skip when the condition is true (OS, Python version, missing library)</td></tr>
<tr class='text-center'><td><code>xfail(reason=...)</code></td><td>The test is expected to fail - a failure is reported as "xfailed", not an error</td></tr>
<tr class='text-center'><td><code>parametrize(...)</code></td><td>Run the test with several inputs</td></tr>
<tr class='text-center'><td><code>usefixtures(...)</code></td><td>Apply fixtures without naming them as parameters</td></tr>
</table>`
        },
        {
            content: `<h4>skip, skipif and xfail</h4>`,
            codeExamples: [
                `import sys
import pytest

@pytest.mark.skip(reason="payment sandbox is down")
def test_payment():
    ...

@pytest.mark.skipif(sys.platform == "win32", reason="uses Unix file permissions")
def test_chmod():
    ...

@pytest.mark.xfail(reason="bug #142: rounding error in GST")
def test_gst_rounding():
    assert round(2.675, 2) == 2.68        # really 2.67 - known float issue

# $ pytest -v   (on Linux)
# OUTPUT (e.g.):
# test_marks.py::test_payment SKIPPED (payment sandbox is down)
# test_marks.py::test_chmod PASSED
# test_marks.py::test_gst_rounding XFAIL (bug #142: rounding error in GST)`
            ]
        },
        {
            content: `<h4>Custom Marks</h4>
Tag tests with your own marks - <code>slow</code>, <code>integration</code>, <code>smoke</code> - and register them in the configuration file so typos are caught.`,
            codeExamples: [
                `# pyproject.toml
[tool.pytest.ini_options]
markers = [
    "slow: tests that take more than a second",
    "integration: tests that need a database",
]
addopts = "--strict-markers"     # unknown marks become errors`,
                `# test_reports.py
import pytest

@pytest.mark.slow
def test_yearly_report():
    ...

@pytest.mark.integration
def test_save_to_db():
    ...

def test_format_amount():
    ...`
            ]
        },
        {
            content: `<h4>Selecting Tests with -m</h4>
<code>-m</code> takes a boolean expression over mark names.`,
            codeExamples: [
                `# Only the slow tests
pytest -m slow

# Everything except slow tests - a fast local run
pytest -m "not slow"

# Integration tests that are not slow
pytest -m "integration and not slow"

# Select by name instead of mark
pytest -k "report"`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Strict xfail and Skipping Inside a Test</h3>
• <code>xfail(strict=True)</code> turns an unexpected pass ("XPASS") into a failure - so you notice when a known bug gets fixed and can remove the mark.<br>
• <code>pytest.skip("reason")</code> skips from inside a test, for conditions known only at runtime.<br>
• <code>pytest.importorskip("pandas")</code> skips the module when an optional dependency is missing.`,
            codeExamples: [
                `import pytest

pd = pytest.importorskip("pandas")        # skip this file if pandas isn't installed

@pytest.mark.xfail(strict=True, reason="bug #142")
def test_known_bug():
    assert 0.1 + 0.2 == 0.3               # fails, so the strict xfail is satisfied

def test_needs_api_key(monkeypatch):
    import os
    if "API_KEY" not in os.environ:
        pytest.skip("API_KEY not configured")`
            ]
        },
        {
            content: `<h3>Popular Plugins</h3>
pytest's plugin system is one of its biggest advantages. Install a plugin with pip and it is picked up automatically.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Plugin</th><th>Adds</th><th>Example</th></tr>
<tr class='text-center'><td><code>pytest-cov</code></td><td>Coverage reports</td><td><code>pytest --cov=shop --cov-report=term-missing</code></td></tr>
<tr class='text-center'><td><code>pytest-xdist</code></td><td>Run tests in parallel across CPU cores</td><td><code>pytest -n auto</code></td></tr>
<tr class='text-center'><td><code>pytest-mock</code></td><td>A <code>mocker</code> fixture wrapping <code>unittest.mock</code>, auto-undone after each test</td><td><code>mocker.patch("shop.send_email")</code></td></tr>
<tr class='text-center'><td><code>pytest-asyncio</code></td><td>Run <code>async def</code> tests</td><td><code>@pytest.mark.asyncio</code></td></tr>
<tr class='text-center'><td><code>pytest-django</code></td><td>Django settings, test database, <code>client</code> fixture</td><td><code>@pytest.mark.django_db</code></td></tr>
<tr class='text-center'><td><code>pytest-randomly</code></td><td>Random test order to expose hidden dependencies between tests</td><td>Automatic</td></tr>
</table>`,
            codeExamples: [
                `# test_notify.py - pytest-mock and pytest-asyncio in action
import asyncio
import pytest

def notify(user, send):
    send(user, "Welcome!")

def test_notify_sends_once(mocker):
    send = mocker.Mock()
    notify("asha", send)
    send.assert_called_once_with("asha", "Welcome!")

@pytest.mark.asyncio
async def test_async_sleep():
    result = await asyncio.sleep(0, result="done")
    assert result == "done"`
            ]
        },
        {
            content: `<h3>Writing a Tiny Local Plugin: conftest.py Hooks</h3>
A <code>conftest.py</code> can implement pytest hooks. This one adds a <code>--runslow</code> option and skips <code>slow</code> tests unless it is given.`,
            codeExamples: [
                `# conftest.py
import pytest

def pytest_addoption(parser):
    parser.addoption("--runslow", action="store_true", help="run slow tests")

def pytest_collection_modifyitems(config, items):
    if config.getoption("--runslow"):
        return
    skip_slow = pytest.mark.skip(reason="need --runslow to run")
    for item in items:
        if "slow" in item.keywords:
            item.add_marker(skip_slow)`
            ]
        },
        {
            content: `<h3>Compared with JUnit 5</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>JUnit 5</th><th>pytest</th></tr>
<tr class='text-center'><td><code>@Disabled</code></td><td><code>@pytest.mark.skip</code></td></tr>
<tr class='text-center'><td><code>@EnabledOnOs</code> / <code>Assumptions</code></td><td><code>@pytest.mark.skipif</code> / <code>pytest.skip()</code></td></tr>
<tr class='text-center'><td><code>@Tag("slow")</code></td><td><code>@pytest.mark.slow</code></td></tr>
<tr class='text-center'><td>Gradle/Maven tag filters</td><td><code>pytest -m "not slow"</code></td></tr>
<tr class='text-center'><td>Extensions (<code>@ExtendWith</code>)</td><td>Plugins and <code>conftest.py</code> hooks</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>skip vs xfail?</td><td>skip doesn't run the test; xfail runs it and expects a failure</td></tr>
<tr class='text-center'><td>What does <code>xfail(strict=True)</code> do?</td><td>Makes an unexpected pass count as a failure</td></tr>
<tr class='text-center'><td>Why register custom marks?</td><td>With <code>--strict-markers</code>, a misspelled mark becomes an error instead of silently doing nothing</td></tr>
<tr class='text-center'><td>How do you run all tests except slow ones?</td><td><code>pytest -m "not slow"</code></td></tr>
<tr class='text-center'><td>How do you run tests in parallel?</td><td>Install pytest-xdist and run <code>pytest -n auto</code></td></tr>
<tr class='text-center'><td>What is conftest.py?</td><td>A file pytest loads automatically for shared fixtures and hooks in that directory tree</td></tr>
</table>`
        }
    ]
};
