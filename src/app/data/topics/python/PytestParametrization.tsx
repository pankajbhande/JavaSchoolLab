import type { Topic } from '../../types';

export const pytestParametrization: Topic = {
    id: 'python-testing-pytest-parametrization',
    name: 'pytest Parametrization',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<code>@pytest.mark.parametrize</code> turns <b>one</b> test function into <b>many</b> tests, one for each row of a data table. Each row becomes an independent test with its own pass or fail result and its own id in the report. It plays the role of JUnit 5's <code>@ParameterizedTest</code> with <code>@CsvSource</code>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 452 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:452px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="133.5" height="48" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="76.8" y="38">1 test function</tspan></text><line x1="143.5" y1="34" x2="173.5" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="177.5" y="10" width="111.6" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="233.3" y="30.5">@parametrize</tspan><tspan x="233.3" y="45.5">4 data rows</tspan></text><line x1="289.1" y1="34" x2="319.1" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="323.1" y="10" width="118.9" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="382.6" y="30.5">4 independent</tspan><tspan x="382.6" y="45.5">tests</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: one function, a table of cases, one result per row</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Copy-pasting a test for every input is noisy, and a <code>for</code> loop inside one test stops at the first failing case so you never see the rest.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Test <b>many inputs</b> with a single piece of logic.</li>
<li>See <b>every failing case</b> separately in the report.</li>
<li>Keep the data (a table) apart from the checking code.</li>
<li>Add a new case by adding one line.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Leap-year rules as a table of cases</h4>
Save as <code>test_leap.py</code> and run <code>pytest -v</code>.`,
            codeExamples: [
                `import pytest


def is_leap_year(year):
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)


@pytest.mark.parametrize("year, expected", [
    pytest.param(2023, False, id="common-year"),
    pytest.param(2024, True,  id="divisible-by-4"),
    pytest.param(1900, False, id="century-not-by-400"),
    pytest.param(2000, True,  id="century-by-400"),
])
def test_is_leap_year(year, expected):
    assert is_leap_year(year) is expected

# Run with:  pytest -v
#
# OUTPUT (shortened: percentages, header and timing lines omitted):
# test_leap.py::test_is_leap_year[common-year] PASSED
# test_leap.py::test_is_leap_year[divisible-by-4] PASSED
# test_leap.py::test_is_leap_year[century-not-by-400] PASSED
# test_leap.py::test_is_leap_year[century-by-400] PASSED`
            ],
            codeExplanations: [
                `The first argument names the parameters; the list holds one row per test. pytest.param(..., id=...) gives each case a readable label, so a failure report says exactly which scenario broke instead of showing [1900-False]. The four rows run as four separate tests.`
            ]
        },
        {
            content: `<h4>One Test, Many Inputs</h4>
Often you want to check the same logic with many inputs. Copy-pasting a test for each case is noisy; a loop inside one test stops at the first failure. <code>@pytest.mark.parametrize</code> turns <b>one</b> test function into <b>many separate tests</b>, one per row of data.`,
            codeExamples: [
                `import pytest

def add(a, b):
    return a + b

@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (10, 5, 15),
])
def test_add(a, b, expected):
    assert add(a, b) == expected

# OUTPUT with -v:
# test_math.py::test_add[1-2-3] PASSED
# test_math.py::test_add[0-0-0] PASSED
# test_math.py::test_add[-1-1-0] PASSED
# test_math.py::test_add[10-5-15] PASSED`
            ],
            codeExplanations: [
                `The first argument is a string of comma-separated parameter names; the second is a list of tuples, one per test. pytest generates four independent tests and builds each id from the values. If one row fails, the other three still run and are reported on their own.`
            ]
        },
        {
            content: `<h4>Readable Test IDs</h4>
Auto-generated ids such as <code>[-1-1-0]</code> are hard to read. Give each case a label with <code>ids=[...]</code> or <code>pytest.param(..., id="...")</code>, so a failure report says which scenario broke.`,
            codeExamples: [
                `import pytest

def is_adult(age):
    return age >= 18

@pytest.mark.parametrize("age, expected", [
    pytest.param(17, False, id="just-under"),
    pytest.param(18, True,  id="boundary"),
    pytest.param(65, True,  id="senior"),
])
def test_is_adult(age, expected):
    assert is_adult(age) is expected

# OUTPUT with -v:
# test_age.py::test_is_adult[just-under] PASSED
# test_age.py::test_is_adult[boundary] PASSED
# test_age.py::test_is_adult[senior] PASSED`
            ]
        },
        {
            content: `<h4>Testing Errors in the Table</h4>
Include the expected exception in the data to test good and bad inputs in one place.`,
            codeExamples: [
                `import pytest
from contextlib import nullcontext

def divide(a, b):
    return a / b

@pytest.mark.parametrize("a, b, expectation, expected", [
    (10, 2, nullcontext(),                5),
    (9,  3, nullcontext(),                3),
    (1,  0, pytest.raises(ZeroDivisionError), None),
])
def test_divide(a, b, expectation, expected):
    with expectation:
        assert divide(a, b) == expected

# OUTPUT:
# ... 3 passed in 0.01s`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Stacking Decorators: The Cartesian Product</h3>
Applying <code>parametrize</code> more than once multiplies the cases: every value of one parameter is combined with every value of the other - ideal for covering combinations.`,
            codeExamples: [
                `import pytest

@pytest.mark.parametrize("x", [0, 1])
@pytest.mark.parametrize("y", [10, 20])
def test_grid(x, y):
    assert x < y

# OUTPUT with -v: 2 x 2 = 4 tests
# test_grid.py::test_grid[10-0] PASSED
# test_grid.py::test_grid[10-1] PASSED
# test_grid.py::test_grid[20-0] PASSED
# test_grid.py::test_grid[20-1] PASSED`
            ]
        },
        {
            content: `<h3>Marks Inside the Data: xfail and skip Single Cases</h3>
<code>pytest.param(..., marks=...)</code> attaches a mark to just one row. A known bug can be marked <code>xfail</code> (expected to fail, reported separately) without disabling the other cases.`,
            codeExamples: [
                `import pytest

def square(n):
    return n * n

@pytest.mark.parametrize("n, expected", [
    (2, 4),
    (3, 9),
    pytest.param(-3, -9, marks=pytest.mark.xfail(reason="negative input, see ticket 118")),
    pytest.param(4, 16, marks=pytest.mark.skipif(True, reason="demo skip")),
])
def test_square(n, expected):
    assert square(n) == expected

# OUTPUT (summary line):
# 2 passed, 1 skipped, 1 xfailed in 0.02s`
            ]
        },
        {
            content: `<h3>Generating Cases and indirect Parametrization</h3>
The data can come from anywhere that produces a list: a comprehension, a CSV or JSON file, or a function. With <code>indirect=True</code> the values are not passed to the test directly but to a <b>fixture of the same name</b> (via <code>request.param</code>), so the fixture can build a heavier object from a simple label.`,
            codeExamples: [
                `import pytest

def load_cases():
    return [(n, n % 2 == 0) for n in range(1, 5)]

@pytest.mark.parametrize("n, is_even", load_cases())
def test_parity(n, is_even):
    assert (n % 2 == 0) is is_even

@pytest.fixture
def user(request):                       # receives "admin" / "guest"
    return {"role": request.param, "can_delete": request.param == "admin"}

@pytest.mark.parametrize("user", ["admin", "guest"], indirect=True)
def test_permissions(user):
    assert user["can_delete"] == (user["role"] == "admin")

# OUTPUT with -v (shortened):
# test_file.py::test_parity[1-False] PASSED
# test_file.py::test_parity[2-True] PASSED
# test_file.py::test_parity[3-False] PASSED
# test_file.py::test_parity[4-True] PASSED
# test_file.py::test_permissions[admin] PASSED
# test_file.py::test_permissions[guest] PASSED`
            ]
        },
        {
            content: `<h3>Pitfalls</h3>
<ul>
<li><b>Mutable data is shared:</b> a list or dict placed in the parameter table is the <i>same object</i> for every test run that uses it. Mutating it leaks between tests - create fresh objects in a fixture instead.</li>
<li><b>Don't put logic in the table:</b> if the expected value is computed with the same formula as the code under test, the test proves nothing. Write literal expected values.</li>
<li><b>Huge cartesian products</b> explode quickly (5 x 5 x 5 = 125 tests). Keep stacked parameters few, or choose representative pairs.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>One function covers many cases</td><td>Big tables can hide the intent of each case</td></tr>
<tr><td>Every row passes or fails independently</td><td>Computed expectations can repeat the bug being tested</td></tr>
<tr><td>Readable ids make reports self-explaining</td><td>Auto-generated ids are cryptic without <code>id=</code></td></tr>
<tr><td>Easy to grow: add a row, not a test</td><td>Stacked parametrize decorators multiply into many tests</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does parametrize do?</td><td>Generates one independent test per data row from a single test function</td></tr>
<tr class='text-center'><td>Why not just loop inside the test?</td><td>A loop stops at the first failure and reports one result; parametrize runs and reports every case separately</td></tr>
<tr class='text-center'><td>What happens with two stacked parametrize decorators?</td><td>The cases multiply (cartesian product)</td></tr>
<tr class='text-center'><td>How do you mark one case as an expected failure?</td><td><code>pytest.param(..., marks=pytest.mark.xfail(reason=...))</code></td></tr>
<tr class='text-center'><td>What does <code>indirect=True</code> do?</td><td>Sends the values to the fixture of the same name via <code>request.param</code> instead of straight to the test</td></tr>
</table>`
        }
    ]
};
