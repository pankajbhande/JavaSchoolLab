import type { Topic } from '../../types';

export const codeCoverage: Topic = {
    id: 'python-testing-code-coverage',
    name: 'Code Coverage',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<b>Code coverage</b> measures how much of your code actually ran while the tests ran. A line that never ran cannot have been checked, so coverage is excellent at <b>finding untested code</b>. In Python the standard tool is <code>coverage.py</code>, usually through <code>pytest --cov</code>; the Java counterpart is <b>JaCoCo</b>. The demo below builds a tiny line tracker with <code>sys.settrace</code> to show what such tools do underneath.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 613 83" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:613px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="111.6" height="63" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="65.8" y="38">run tests</tspan><tspan x="65.8" y="53">with tracing</tspan></text><line x1="121.6" y1="41.5" x2="151.6" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="155.6" y="10" width="118.9" height="63" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="215.1" y="38">record lines</tspan><tspan x="215.1" y="53">that executed</tspan></text><line x1="274.5" y1="41.5" x2="304.5" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="308.5" y="10" width="118.9" height="63" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="368" y="30.5">report:</tspan><tspan x="368" y="45.5">60% covered,</tspan><tspan x="368" y="60.5">missed [2, 4]</tspan></text><line x1="427.4" y1="41.5" x2="457.4" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="461.4" y="10" width="140.8" height="63" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="531.8" y="38">write tests</tspan><tspan x="531.8" y="53">for missed lines</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: coverage shows what ran; it cannot show that results were checked</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> A green test run says nothing about what was <i>not</i> tested. Whole branches (error handling, rare inputs) may never execute and you would not know.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Find <b>untested lines and branches</b> quickly.</li>
<li>Turn "what did I forget?" into a concrete to-do list of line numbers.</li>
<li>Set a <b>quality gate</b> in CI (for example fail below 80 percent).</li>
<li>Spot dead code that no test or caller ever reaches.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: A tiny line-coverage tracker</h4>
Real tools (<code>coverage.py</code>) work the same way: they trace which lines execute. Line numbers are printed relative to the <code>def</code> line so the output does not depend on where the code is saved. Works on CPython 3.12.`,
            codeExamples: [
                `import sys


def classify(n):
    if n < 0:
        return "negative"
    if n == 0:
        return "zero"
    return "positive"


def lines_of(func):
    code = func.__code__
    all_lines = {line for _, _, line in code.co_lines() if line is not None}
    return {line - code.co_firstlineno for line in all_lines} - {0}


def run_traced(func, inputs):
    code, executed = func.__code__, set()

    def tracer(frame, event, arg):
        if frame.f_code is code:
            if event == "line":
                executed.add(frame.f_lineno - code.co_firstlineno)
            return tracer
        return None

    sys.settrace(tracer)
    try:
        for value in inputs:
            func(value)
    finally:
        sys.settrace(None)
    return executed


def main():
    total = lines_of(classify)
    for inputs in ([5], [5, -1], [5, -1, 0]):
        executed = run_traced(classify, inputs)
        percent = 100 * len(executed) // len(total)
        missed = sorted(total - executed)
        print(inputs, "->", f"{percent}% covered, missed lines {missed}")


if __name__ == "__main__":
    main()

# OUTPUT:
# [5] -> 60% covered, missed lines [2, 4]
# [5, -1] -> 80% covered, missed lines [4]
# [5, -1, 0] -> 100% covered, missed lines []`
            ],
            codeExplanations: [
                `classify has five body lines (offsets 1 to 5). Calling it with 5 runs only the two if-tests and the final return, so offsets 2 and 4 (the two early returns) are missed: 3 of 5 is 60 percent. Adding -1 and then 0 as inputs, which is exactly what new tests would do, drives coverage to 100 percent.`
            ]
        },
        {
            content: `<h4>What is Code Coverage?</h4>
<b>Code coverage</b> measures <i>how much of your code was executed</i> while the tests ran. If a line never ran, no test can possibly have checked it. Coverage is therefore good at <b>finding untested code</b>. The standard tool is <code>coverage.py</code>, used directly or through the <code>pytest-cov</code> plugin (JaCoCo is the Java equivalent).

<pre>pip install pytest pytest-cov

pytest --cov=mypkg                   # measure the package "mypkg"
pytest --cov=mypkg --cov-report=term-missing   # also list missed line numbers
pytest --cov=mypkg --cov-report=html           # browsable report in htmlcov/</pre>`
        },
        {
            content: `<h4>Reading a Report</h4>
For each file the report shows statements, how many were missed, the percentage, and (with <code>term-missing</code>) the exact missed line numbers - your to-do list of untested code.`,
            codeExamples: [
                `# shop.py
def price_with_tax(price, tax_rate):
    if price < 0:
        raise ValueError("price cannot be negative")
    return price * (1 + tax_rate)

# test_shop.py
import pytest
from shop import price_with_tax

def test_price_with_tax():
    assert price_with_tax(100, 0.18) == pytest.approx(118)

# pytest --cov=shop --cov-report=term-missing
#
# OUTPUT (shortened; the exact layout varies by version):
# Name      Stmts   Miss  Cover   Missing
# -----------------------------------------
# shop.py       4      1    75%   3
#
# Line 3 (the raise) never ran: no test passes a negative price.`
            ],
            codeExplanations: [
                `The test only covers the normal path. The report points at the missing line: the error case is untested. Adding a test with pytest.raises(ValueError) for a negative price would raise coverage to 100% and, more importantly, check that the error behaviour works.`
            ]
        },
        {
            content: `<h4>What Number Should You Aim For?</h4>
There is no magic number. Many teams use <b>80-90%</b> as a sensible gate. Coverage is a <b>guide to what you forgot</b>, not a score to maximise: 100% coverage can still hide bugs, and chasing the last few percent often produces pointless tests.`
        }
    ],

    expert: [
        {
            content: `<h3>Line Coverage vs Branch Coverage</h3>
<b>Line coverage</b> only asks "did this line run?". <b>Branch coverage</b> asks "did both outcomes of every decision happen?". An <code>if</code> with no <code>else</code> can show 100% line coverage while its "condition is false" path was never tested. Turn branch coverage on: <code>--cov-branch</code> or <code>branch = true</code> in the config.`,
            codeExamples: [
                `def apply_discount(price, is_member):
    if is_member:
        price = price - 10
    return price

def test_member_discount():
    assert apply_discount(100, True) == 90

# Line coverage: 100%  (every line ran)
# Branch coverage: the path "is_member is False" never ran
#
# pytest --cov=. --cov-branch --cov-report=term-missing
#
# OUTPUT (shortened):
# Name    Stmts  Miss Branch BrPart  Cover   Missing
# ---------------------------------------------------
# d.py        4     0      2      1    83%   2->4
#
# "2->4" means: the jump from line 2 (the if) to line 4 (skipping the body)
# was never taken.`
            ]
        },
        {
            content: `<h3>Configuration, Exclusions and Gates</h3>
Put settings in <code>pyproject.toml</code> so every run measures the same way. Use <code># pragma: no cover</code> sparingly, for code that genuinely cannot be tested (a <code>__main__</code> guard, defensive branches). <code>fail_under</code> makes the build fail when coverage drops.`,
            codeExamples: [
                `# pyproject.toml
[tool.coverage.run]
branch = true
source = ["mypkg"]
omit = ["*/tests/*", "*/migrations/*"]

[tool.coverage.report]
fail_under = 85
show_missing = true
exclude_also = [
    "if __name__ == .__main__.:",
    "raise NotImplementedError",
]

# In code, for one-off exclusions:
def debug_dump(obj):  # pragma: no cover
    print(obj)`
            ]
        },
        {
            content: `<h3>Coverage Is Not Quality</h3>
Coverage only proves code <b>ran</b>, not that its result was <b>checked</b>. This test earns full coverage and verifies nothing:`,
            codeExamples: [
                `def apply_discount(price, is_member):
    if is_member:
        price = price - 10
    return price

def test_worthless():
    apply_discount(100, True)       # runs the code, asserts nothing
    apply_discount(100, False)

# Line coverage: 100%.  Branch coverage: 100%.
# But if the discount were wrong (say, "+ 10"), this test would still pass.`
            ]
        },
        {
            content: `<h3>Mutation Testing: Testing Your Tests</h3>
<b>Mutation testing</b> (<code>mutmut</code>, <code>cosmic-ray</code>) automatically makes small changes to your code (turn <code>-</code> into <code>+</code>, <code>&gt;</code> into <code>&gt;=</code>) and re-runs the tests. If the tests still pass, that "mutant" <b>survived</b>: your tests don't really check that behaviour. It measures the <i>strength</i> of assertions, which coverage cannot. It is slow, so run it on critical modules or in a nightly job.`
        },
        {
            content: `<h3>Using Coverage in CI and Reviews</h3>
<ul>
<li>Fail the build on <b>coverage dropping</b> (<code>fail_under</code>) or require coverage of <b>changed lines</b> only (e.g. <code>diff-cover</code>, Codecov patch coverage) so old untested code doesn't block new work.</li>
<li>Measure <b>subprocess and multi-process</b> code with <code>concurrency</code> settings; combine reports from parallel runs with <code>coverage combine</code>.</li>
<li>Read the <b>HTML report</b> when deciding what to test next: red lines show exactly what no test touches.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Points to exact untested lines (<code>--cov-report=term-missing</code>)</td><td>Executed is not verified: a test with no asserts still counts</td></tr>
<tr><td>Cheap to add in CI as a quality gate</td><td>100 percent coverage can still hide bugs</td></tr>
<tr><td>Branch coverage reveals untested decisions</td><td>Chasing the number encourages low-value tests</td></tr>
<tr><td>HTML reports make gaps easy to browse</td><td>Tracing slows the test run a little</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does code coverage measure?</td><td>The percentage of code executed during the test run</td></tr>
<tr class='text-center'><td>Line vs branch coverage?</td><td>Line: did each line run. Branch: did both outcomes of each decision run</td></tr>
<tr class='text-center'><td>Does 100% coverage mean no bugs?</td><td>No - it shows code ran, not that results were asserted; tests with no assertions still count</td></tr>
<tr class='text-center'><td>What is mutation testing?</td><td>Automatically changing code to see whether the tests notice; surviving mutants reveal weak tests</td></tr>
<tr class='text-center'><td>How do you enforce a minimum?</td><td><code>fail_under</code> in coverage config, or <code>--cov-fail-under=85</code> with pytest-cov</td></tr>
</table>`
        }
    ]
};
