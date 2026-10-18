import type { Topic } from '../../types';

export const testingCodeCoverage: Topic = {
    id: 'python-testing-code-coverage',
    name: 'Code Coverage',
    beginner: [
        {
            content: `<h4>What is Code Coverage?</h4>
<b>Code coverage</b> measures which lines of your code ran while the tests ran. Lines that never ran are definitely untested. In Python the standard tool is <b>coverage.py</b>; with pytest you usually use it through the <b>pytest-cov</b> plugin. It plays the role JaCoCo plays in Java projects.`,
            codeExamples: [
                `pip install pytest pytest-cov

# Run the tests and measure the "shop" package
pytest --cov=shop

# Also list the line numbers that were never executed
pytest --cov=shop --cov-report=term-missing

# An HTML report you can browse (opens htmlcov/index.html)
pytest --cov=shop --cov-report=html`
            ]
        },
        {
            content: `<h4>Reading the Report</h4>
The terminal report shows, per file, how many statements exist, how many were missed, the percentage covered and the missing line numbers.`,
            codeExamples: [
                `# OUTPUT (illustrative - your numbers will differ):
# Name                 Stmts   Miss  Cover   Missing
# --------------------------------------------------
# shop/__init__.py         0      0   100%
# shop/pricing.py         12      2    83%   18-19
# shop/repo.py            20      0   100%
# --------------------------------------------------
# TOTAL                   32      2    94%`
            ]
        },
        {
            content: `<h4>Using coverage.py Directly</h4>
Without pytest-cov, run any test command under coverage, then print the report.`,
            codeExamples: [
                `coverage run -m pytest
coverage report -m          # -m shows missing lines
coverage html               # HTML report in htmlcov/`
            ]
        },
        {
            content: `<h4>Finding Untested Code</h4>
Coverage tells you <b>where</b> to add tests. Below, a test only checks the member path, so the non-member line is reported as missing.`,
            codeExamples: [
                `# pricing.py
def final_price(price, is_member):
    if is_member:
        return price * 0.9
    return price                     # never executed by the test below

# test_pricing.py
def test_member_price():
    assert final_price(100, True) == 90.0

# Coverage would list the "return price" line as missing - add a test for it:
def test_regular_price():
    assert final_price(100, False) == 100`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Line vs Branch Coverage</h3>
<b>Line coverage</b> asks "did this line run?". <b>Branch coverage</b> also asks "did each <code>if</code> go both ways?". A line with an <code>if</code> and no <code>else</code> can be 100% line-covered while the "condition false" path is never tested. Enable branch coverage with <code>--cov-branch</code> (or <code>branch = true</code> in the config).`,
            codeExamples: [
                `def shipping(total):
    fee = 50
    if total >= 500:
        fee = 0
    return fee

def test_free_shipping():
    assert shipping(600) == 0      # every LINE runs: 100% line coverage

# pytest --cov=shop --cov-branch --cov-report=term-missing
# OUTPUT (illustrative):
# Name             Stmts   Miss Branch BrPart  Cover   Missing
# shop/ship.py         5      0      2      1    86%   3->5
#
# "3->5" = the jump from the if (line 3) straight to return (line 5),
# i.e. the total < 500 case, was never taken.`
            ]
        },
        {
            content: `<h3>100% Coverage Doesn't Mean Correct</h3>
Coverage proves code <b>ran</b>, not that it was <b>checked</b>. A test with no assertions, or with weak ones, still produces full coverage.`,
            codeExamples: [
                `def average(marks):
    return sum(marks) / len(marks)      # crashes on an empty list

def test_average():
    average([70, 80])                   # no assert - still 100% covered!

# The empty-list bug and wrong results go unnoticed. Better:
def test_average_value():
    assert average([70, 80]) == 75

def test_average_empty():
    import pytest
    with pytest.raises(ZeroDivisionError):
        average([])`
            ]
        },
        {
            content: `<h3>Configuration, Exclusions and CI Thresholds</h3>
Keep settings in <code>pyproject.toml</code>. Exclude code that can't sensibly be tested with <code># pragma: no cover</code> - sparingly. In CI, <code>--cov-fail-under</code> fails the build if coverage drops below a minimum.`,
            codeExamples: [
                `# pyproject.toml
[tool.coverage.run]
branch = true
source = ["shop"]
omit = ["shop/migrations/*"]

[tool.coverage.report]
show_missing = true
fail_under = 85
exclude_lines = [
    "pragma: no cover",
    "if __name__ == .__main__.:",
    "raise NotImplementedError",
]`,
                `# shop/cli.py
def main():
    ...

if __name__ == "__main__":       # excluded by the config above
    main()

def debug_dump(data):            # pragma: no cover
    print(data)

# CI command - the build fails below 85%:
# pytest --cov=shop --cov-fail-under=85`
            ]
        },
        {
            content: `<h3>Beyond Coverage: Mutation Testing</h3>
<b>Mutation testing</b> (e.g. <code>mutmut</code>, <code>cosmic-ray</code> in Python; PIT in Java) makes small changes to your code - <code>&gt;=</code> becomes <code>&gt;</code>, <code>+</code> becomes <code>-</code> - and reruns the tests. If the tests still pass, that "mutant survived", revealing assertions that are too weak. It is slow, so teams run it on critical modules rather than on every commit.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does code coverage measure?</td><td>Which lines (and optionally branches) were executed during the tests</td></tr>
<tr class='text-center'><td>Line vs branch coverage?</td><td>Line coverage checks that each line ran; branch coverage checks that each decision went both ways</td></tr>
<tr class='text-center'><td>Does 100% coverage mean the code is correct?</td><td>No - code can run without being checked by meaningful assertions</td></tr>
<tr class='text-center'><td>How do you enforce a minimum in CI?</td><td><code>pytest --cov=pkg --cov-fail-under=85</code> or <code>fail_under</code> in the config</td></tr>
<tr class='text-center'><td>How do you exclude code from coverage?</td><td><code># pragma: no cover</code> or <code>exclude_lines</code> / <code>omit</code> settings</td></tr>
<tr class='text-center'><td>What is mutation testing?</td><td>Deliberately altering code to check whether the tests detect the change</td></tr>
</table>`
        }
    ]
};
