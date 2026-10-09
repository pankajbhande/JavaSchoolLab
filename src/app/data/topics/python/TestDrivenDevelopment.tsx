import type { Topic } from '../../types';

export const testDrivenDevelopment: Topic = {
    id: 'python-testing-test-driven-development',
    name: 'Test-Driven Development',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<b>Test-Driven Development (TDD)</b> reverses the usual order: you write a <b>failing test first</b> (<b>red</b>), write just enough code to make it pass (<b>green</b>), then clean up the code while the tests stay green (<b>refactor</b>). You repeat this in tiny steps. The tests drive the design, and you always have a safety net. The cycle is the same in Java with JUnit.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 605 83" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:605px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="133.5" height="63" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="76.8" y="30.5">RED</tspan><tspan x="76.8" y="45.5">write a failing</tspan><tspan x="76.8" y="60.5">test</tspan></text><line x1="143.5" y1="41.5" x2="173.5" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="177.5" y="10" width="118.9" height="63" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="237" y="30.5">GREEN</tspan><tspan x="237" y="45.5">simplest code</tspan><tspan x="237" y="60.5">that passes</tspan></text><line x1="296.4" y1="41.5" x2="326.4" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="330.4" y="10" width="140.8" height="63" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="400.8" y="30.5">REFACTOR</tspan><tspan x="400.8" y="45.5">clean up,</tspan><tspan x="400.8" y="60.5">tests stay green</tspan></text><line x1="471.2" y1="41.5" x2="501.2" y2="41.5" stroke="#6b7280" marker-end="url(#ar)"/><rect x="505.2" y="10" width="89.7" height="63" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="550.1" y="38">next test</tspan><tspan x="550.1" y="53">(repeat)</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the red-green-refactor cycle</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> When tests are written last, they are often skipped under deadline pressure, they are shaped by the code that already exists, and big untested "clean-ups" break behaviour without anyone noticing.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Design code from the <b>caller's point of view</b> before implementing it.</li>
<li>Build a <b>safety net</b> so refactoring is safe.</li>
<li>Work in <b>small steps</b>: always one failing test to fix.</li>
<li>Guarantee that every behaviour has at least one test.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: The finished slugify() and its test cases</h4>
This is the end state of three TDD cycles: each row in <code>CASES</code> began as one failing test. The tiny runner at the bottom stands in for pytest so the program runs with plain Python.`,
            codeExamples: [
                `import re

CASES = [
    ("Hello World", "hello-world"),               # cycle 1
    ("  Hello,   World! ", "hello-world"),        # cycle 2: punctuation
    ("", ""),                                     # cycle 3: empty input
    ("Python 3.12 Rocks", "python-3-12-rocks"),   # cycle 4: digits
]


def slugify(text):
    text = re.sub(r"[^a-z0-9]+", "-", text.lower())
    return text.strip("-")


def run_tests():
    passed = 0
    for given, expected in CASES:
        actual = slugify(given)
        status = "PASS" if actual == expected else "FAIL"
        passed += actual == expected
        print(status, repr(given), "->", repr(actual))
    return passed


def main():
    passed = run_tests()
    print(passed, "of", len(CASES), "passed")


if __name__ == "__main__":
    main()

# OUTPUT:
# PASS 'Hello World' -> 'hello-world'
# PASS '  Hello,   World! ' -> 'hello-world'
# PASS '' -> ''
# PASS 'Python 3.12 Rocks' -> 'python-3-12-rocks'
# 4 of 4 passed`
            ],
            codeExplanations: [
                `The first version of slugify() was just text.lower().replace(" ", "-") - the simplest code that passed cycle 1. Cycle 2 failed on punctuation, which forced the regular expression (the refactor). Because the old cases stay in the list, every rewrite is checked against all earlier behaviour.`
            ]
        },
        {
            content: `<h4>Tests First</h4>
<b>Test-Driven Development (TDD)</b> reverses the usual order: you write a <b>failing test first</b>, then just enough code to make it pass, then clean up. The tests drive the design, and you always have a safety net. It works in a short repeating loop:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Step</th><th>Colour</th><th>What you do</th></tr>
<tr class='text-center'><td>1</td><td><b>Red</b></td><td>Write one small test for behaviour that does not exist yet. Run it - it must fail.</td></tr>
<tr class='text-center'><td>2</td><td><b>Green</b></td><td>Write the simplest code that makes the test pass.</td></tr>
<tr class='text-center'><td>3</td><td><b>Refactor</b></td><td>Improve the code's structure while keeping all tests green.</td></tr>
</table>`
        },
        {
            content: `<h4>Worked Example: slugify()</h4>
We want a function that turns a title into a URL slug: <code>"Hello World"</code> becomes <code>"hello-world"</code>. <b>Red</b>: write the test and a stub that fails.`,
            codeExamples: [
                `# slugs.py
def slugify(text):
    return ""

# test_slugs.py
from slugs import slugify

def test_lowercases_and_joins_words_with_hyphens():
    assert slugify("Hello World") == "hello-world"

# OUTPUT of pytest (shortened):
# E   AssertionError: assert '' == 'hello-world'
# FAILED test_slugs.py::test_lowercases_and_joins_words_with_hyphens`
            ]
        },
        {
            content: `<h4>Green: The Simplest Thing That Passes</h4>
Don't solve problems you don't have a test for yet.`,
            codeExamples: [
                `# slugs.py
def slugify(text):
    return text.lower().replace(" ", "-")

# OUTPUT of pytest:
# ... 1 passed in 0.01s`
            ]
        },
        {
            content: `<h4>Next Cycle: Add a Harder Test, Then Refactor</h4>
Real titles contain punctuation and extra spaces. Add a failing test, then generalise the code with a regular expression. Because the first test still exists, you know the refactor kept the old behaviour.`,
            codeExamples: [
                `# test_slugs.py (added)
def test_removes_punctuation_and_extra_spaces():
    assert slugify("  Hello,   World! ") == "hello-world"

def test_empty_string():
    assert slugify("") == ""

# slugs.py (refactored - all three tests pass)
import re

def slugify(text):
    text = re.sub(r"[^a-z0-9]+", "-", text.lower())
    return text.strip("-")

print(slugify("Hello World"))
print(slugify("  Hello,   World! "))
print(repr(slugify("")))

# OUTPUT:
# hello-world
# hello-world
# ''`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Rules of the Game</h3>
<ul>
<li><b>Take small steps.</b> Each test adds one new behaviour; a cycle lasts minutes, not hours.</li>
<li><b>See it fail for the right reason.</b> A test that has never failed might not test anything. Check the failure message matches what you expect.</li>
<li><b>Never refactor on red.</b> Get to green first; then change structure with tests protecting you.</li>
<li><b>Test behaviour, not implementation.</b> Assert on inputs and outputs, not on private methods or call order, so refactoring does not break tests.</li>
<li><b>Name tests as specifications:</b> <code>test_withdraw_more_than_balance_raises</code> reads like a requirement.</li>
</ul>`
        },
        {
            content: `<h3>Triangulation</h3>
A first test can be satisfied by a hard-coded answer. A <b>second example forces generalisation</b>: you "triangulate" the real rule from several cases. Parametrized tests make this cheap.`,
            codeExamples: [
                `import pytest

def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)

@pytest.mark.parametrize("n, expected", [
    (1, "1"), (2, "2"),
    (3, "Fizz"), (6, "Fizz"),
    (5, "Buzz"), (10, "Buzz"),
    (15, "FizzBuzz"), (30, "FizzBuzz"),
])
def test_fizzbuzz(n, expected):
    assert fizzbuzz(n) == expected

# OUTPUT:
# ... 8 passed in 0.02s`
            ]
        },
        {
            content: `<h3>Chicago (Classic) vs London (Mockist) Style</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Chicago / classicist</th><th>London / mockist</th></tr>
<tr class='text-center'><td>Direction</td><td>Inside-out: build core logic first</td><td>Outside-in: start from the outer layer</td></tr>
<tr class='text-center'><td>Collaborators</td><td>Use real objects where cheap</td><td>Mock collaborators to design interfaces</td></tr>
<tr class='text-center'><td>Verifies</td><td>State / results</td><td>Interactions (calls made)</td></tr>
<tr class='text-center'><td>Risk</td><td>Slower to find the right design</td><td>Tests coupled to implementation</td></tr>
</table>
Most teams mix both. Related practices: <b>ping-pong pairing</b> (one writes a failing test, the other makes it pass) and <b>BDD</b> (writing tests in business language, e.g. <code>pytest-bdd</code>).`
        },
        {
            content: `<h3>When TDD Works Well - and When It Doesn't</h3>
<ul>
<li><b>Great for:</b> business logic, parsers, algorithms, bug fixes (write a test that reproduces the bug first, then fix it).</li>
<li><b>Awkward for:</b> exploratory code where you don't yet know what you want, UI layout, and glue code. Spike a prototype first, then rewrite test-first.</li>
<li><b>Legacy code without tests:</b> write <b>characterization tests</b> that pin down what the code does today, then refactor safely.</li>
<li><b>Common pitfalls:</b> writing too many tests before any code, testing private details, and skipping the refactor step so the code stays messy.</li>
</ul>`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Every behaviour is backed by a test from day one</td><td>Slower at the start: needs discipline and practice</td></tr>
<tr><td>Refactoring is safe: tests show immediately what broke</td><td>Poorly chosen tests lock in a bad design</td></tr>
<tr><td>Code ends up simpler and easier to call</td><td>Hard to apply to UI, exploratory or unclear requirements</td></tr>
<tr><td>Small steps make debugging trivial</td><td>Passing tests do not prove the tests themselves are right</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the TDD cycle?</td><td>Red (failing test), Green (minimal code to pass), Refactor (clean up with tests green)</td></tr>
<tr class='text-center'><td>Why must you see the test fail first?</td><td>It proves the test can fail, and that it fails for the intended reason</td></tr>
<tr class='text-center'><td>What are the benefits?</td><td>A regression safety net, simpler testable design, and living documentation of behaviour</td></tr>
<tr class='text-center'><td>How would you fix a bug using TDD?</td><td>Write a failing test that reproduces it, fix the code, keep the test as a regression guard</td></tr>
<tr class='text-center'><td>Does TDD guarantee good design?</td><td>No - it encourages testable design, but you still need to refactor and think about structure</td></tr>
</table>`
        }
    ]
};
