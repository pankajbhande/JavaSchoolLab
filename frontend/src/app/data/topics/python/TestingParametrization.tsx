import type { Topic } from '../../types';

export const testingParametrization: Topic = {
    id: 'python-testing-pytest-parametrization',
    name: 'pytest Parametrization',
    beginner: [
        {
            content: `<h4>One Test, Many Inputs</h4>
Writing a separate test for every input is repetitive. <code>@pytest.mark.parametrize</code> runs the <b>same test function</b> once per set of values, and pytest reports each run as its own test - so one failing case doesn't hide the others.`,
            codeExamples: [
                `# test_grades.py
import pytest

def grade(marks):
    if marks >= 90:
        return "A+"
    if marks >= 75:
        return "A"
    if marks >= 40:
        return "Pass"
    return "Fail"

@pytest.mark.parametrize("marks, expected", [
    (95, "A+"),
    (90, "A+"),        # boundary
    (80, "A"),
    (40, "Pass"),      # boundary
    (39, "Fail"),
])
def test_grade(marks, expected):
    assert grade(marks) == expected

# $ pytest -v test_grades.py
# OUTPUT (e.g. - timing varies):
# test_grades.py::test_grade[95-A+] PASSED
# test_grades.py::test_grade[90-A+] PASSED
# test_grades.py::test_grade[80-A] PASSED
# test_grades.py::test_grade[40-Pass] PASSED
# test_grades.py::test_grade[39-Fail] PASSED
# ===== 5 passed in 0.02s =====`
            ]
        },
        {
            content: `<h4>The Syntax</h4>
• The first argument is a string of parameter names, separated by commas.<br>
• The second is a list of values: single values for one name, tuples for several names.<br>
• Each name must be a parameter of the test function.`,
            codeExamples: [
                `import pytest

@pytest.mark.parametrize("word", ["level", "madam", "racecar"])
def test_palindrome(word):              # one name -> plain values
    assert word == word[::-1]

@pytest.mark.parametrize("a, b, total", [(1, 2, 3), (0, 0, 0), (-5, 5, 0)])
def test_add(a, b, total):              # several names -> tuples
    assert a + b == total`
            ]
        },
        {
            content: `<h4>Readable Test IDs</h4>
By default pytest builds an ID from the values. For complex values, give each case a name with <code>ids=</code> so failures are easy to read.`,
            codeExamples: [
                `import pytest

@pytest.mark.parametrize(
    "email, valid",
    [("abaji@mail.com", True), ("no-at-sign", False), ("", False)],
    ids=["normal", "missing-at", "empty"],
)
def test_email(email, valid):
    assert ("@" in email) == valid

# $ pytest -v
# OUTPUT (e.g.):
# test_email.py::test_email[normal] PASSED
# test_email.py::test_email[missing-at] PASSED
# test_email.py::test_email[empty] PASSED`
            ]
        },
        {
            content: `<h4>Testing Edge Cases and Errors</h4>
Parametrization is perfect for boundaries and invalid input. Combine it with <code>pytest.raises</code> to check that bad values raise the right exception.`,
            codeExamples: [
                `import pytest

def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    if amount > balance:
        raise ValueError("insufficient funds")
    return balance - amount

@pytest.mark.parametrize("amount", [0, -1, 5001])
def test_withdraw_rejects_bad_amounts(amount):
    with pytest.raises(ValueError):
        withdraw(5000, amount)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>pytest.param: Per-Case Marks and IDs</h3>
<code>pytest.param(...)</code> wraps one case so it can carry its own <code>id</code> and <code>marks</code> - for example a known bug marked <code>xfail</code>, or a slow case marked <code>slow</code>.`,
            codeExamples: [
                `import pytest

@pytest.mark.parametrize("text, expected", [
    ("hello", "HELLO"),
    pytest.param("straße", "STRASSE", id="german-sharp-s"),
    pytest.param("abc", "abc", marks=pytest.mark.xfail(reason="documents a known wrong expectation")),
])
def test_upper(text, expected):
    assert text.upper() == expected`
            ]
        },
        {
            content: `<h3>Stacking Decorators = Every Combination</h3>
Two <code>parametrize</code> decorators on one test produce the <b>Cartesian product</b>: 3 × 2 = 6 runs below. Useful for testing every combination of options; dangerous when the number of combinations explodes.`,
            codeExamples: [
                `import pytest

@pytest.mark.parametrize("qty", [1, 5, 10])
@pytest.mark.parametrize("member", [True, False])
def test_price_is_positive(qty, member):
    price = qty * 100 * (0.9 if member else 1.0)
    assert price > 0

# $ pytest -q
# OUTPUT (e.g.):
# ......
# 6 passed in 0.01s`
            ]
        },
        {
            content: `<h3>Parametrized Fixtures</h3>
A fixture with <code>params=</code> runs every test that uses it once per parameter. <code>request.param</code> holds the current value. This is ideal for running the same tests against several backends or configurations.`,
            codeExamples: [
                `import pytest

@pytest.fixture(params=["sqlite", "memory"])
def storage(request):
    if request.param == "sqlite":
        import sqlite3
        conn = sqlite3.connect(":memory:")
        yield conn
        conn.close()
    else:
        yield {}

def test_storage_exists(storage):
    assert storage is not None

# $ pytest -v
# OUTPUT (e.g.):
# test_store.py::test_storage_exists[sqlite] PASSED
# test_store.py::test_storage_exists[memory] PASSED`
            ]
        },
        {
            content: `<h3>Compared with JUnit 5</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>JUnit 5</th><th>pytest</th></tr>
<tr class='text-center'><td><code>@ParameterizedTest</code> + <code>@ValueSource(ints = {1, 2})</code></td><td><code>@pytest.mark.parametrize("n", [1, 2])</code></td></tr>
<tr class='text-center'><td><code>@CsvSource({"1, 2, 3"})</code></td><td>A list of tuples</td></tr>
<tr class='text-center'><td><code>@MethodSource("cases")</code></td><td>A module-level list or a parametrized fixture</td></tr>
<tr class='text-center'><td><code>name = "{0} + {1}"</code></td><td><code>ids=[...]</code> or <code>pytest.param(..., id=...)</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why parametrize instead of a loop inside one test?</td><td>Each case is reported separately and the remaining cases still run when one fails</td></tr>
<tr class='text-center'><td>How many runs do two stacked parametrize decorators give?</td><td>The product of their lengths - every combination</td></tr>
<tr class='text-center'><td>How do you mark a single case as expected to fail?</td><td><code>pytest.param(..., marks=pytest.mark.xfail)</code></td></tr>
<tr class='text-center'><td>What is a parametrized fixture?</td><td>A fixture with <code>params=</code>; every test using it runs once per parameter, read via <code>request.param</code></td></tr>
<tr class='text-center'><td>How do you give cases readable names?</td><td>The <code>ids=</code> argument or <code>pytest.param(..., id="name")</code></td></tr>
</table>`
        }
    ]
};
