import type { Topic } from '../../types';

export const testingTdd: Topic = {
    id: 'python-testing-test-driven-development',
    name: 'Test-Driven Development',
    beginner: [
        {
            content: `<h4>What is TDD?</h4>
<b>Test-Driven Development</b> means writing a failing test <b>before</b> the code that makes it pass. You work in very small cycles:<br><br>
1. <b>Red</b> - write a test for the next small piece of behaviour. Run it and watch it fail.<br>
2. <b>Green</b> - write the simplest code that makes the test pass.<br>
3. <b>Refactor</b> - clean up the code (and tests) while all tests stay green.<br><br>
Then repeat with the next behaviour.`
        },
        {
            content: `<h4>Example Feature: A Discount Calculator</h4>
Rules: orders of ₹1000 or more get 10% off; members get an extra 5% off; the discount can never exceed 15%.<br><br>
<b>Cycle 1 - Red.</b> Start with the simplest rule. The function doesn't exist yet, so the test fails.`,
            codeExamples: [
                `# test_discount.py
from discount import discount_percent

def test_small_order_gets_no_discount():
    assert discount_percent(total=500, member=False) == 0

# $ pytest
# OUTPUT (e.g.):
# E   ModuleNotFoundError: No module named 'discount'
# 1 error`
            ]
        },
        {
            content: `<h4>Cycle 1 - Green</h4>
Write the <b>simplest</b> code that passes - even if it looks too simple. The next tests will force a real implementation.`,
            codeExamples: [
                `# discount.py
def discount_percent(total, member):
    return 0

# $ pytest
# OUTPUT (e.g.):
# 1 passed`
            ]
        },
        {
            content: `<h4>Cycles 2 and 3 - Add the Next Rules</h4>
Each new test fails first (red), then the code grows just enough to pass (green).`,
            codeExamples: [
                `# test_discount.py - new tests added one at a time
def test_big_order_gets_ten_percent():
    assert discount_percent(total=1000, member=False) == 10

def test_member_gets_extra_five_percent():
    assert discount_percent(total=500, member=True) == 5

def test_big_member_order_gets_fifteen_percent():
    assert discount_percent(total=2000, member=True) == 15`,
                `# discount.py - after the green steps
def discount_percent(total, member):
    percent = 0
    if total >= 1000:
        percent += 10
    if member:
        percent += 5
    return percent

# $ pytest
# OUTPUT (e.g.):
# 4 passed`
            ]
        },
        {
            content: `<h4>Refactor</h4>
With all tests green, improve the design safely: name the magic numbers and add the "never more than 15%" rule as a constant. The tests prove nothing broke.`,
            codeExamples: [
                `# discount.py - refactored
BIG_ORDER = 1000
BIG_ORDER_PERCENT = 10
MEMBER_PERCENT = 5
MAX_PERCENT = 15

def discount_percent(total, member):
    percent = 0
    if total >= BIG_ORDER:
        percent += BIG_ORDER_PERCENT
    if member:
        percent += MEMBER_PERCENT
    return min(percent, MAX_PERCENT)

print(discount_percent(999, False), discount_percent(1000, True))

# OUTPUT:
# 0 15`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Regression Tests: Test First for Bug Fixes</h3>
Even teams that don't do full TDD use it for bugs. When a bug is reported: (1) write a test that reproduces it and fails, (2) fix the code, (3) keep the test forever so the bug can never silently return.`,
            codeExamples: [
                `# Bug report: "an order of exactly 1000.0 (a float) gets no discount"
def test_float_boundary_total():                  # step 1: reproduces the bug
    assert discount_percent(total=1000.0, member=False) == 10

# With the version above this already passes (1000.0 >= 1000 is True),
# so the report must come from somewhere else - e.g. totals arriving as
# strings from a form. The test points you to the real cause:
def test_total_from_form_is_converted():
    assert discount_percent(total=float("1000"), member=False) == 10`
            ]
        },
        {
            content: `<h3>Benefits and Criticisms</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Benefits</th><th>Criticisms</th></tr>
<tr class='text-center'><td>Every behaviour has a test, so refactoring is safe</td><td>Slower at first; feels unnatural to many developers</td></tr>
<tr class='text-center'><td>Forces small, decoupled, testable designs</td><td>Can lead to over-mocked tests tied to implementation details</td></tr>
<tr class='text-center'><td>Tests document the intended behaviour</td><td>Hard when requirements are unclear or you are still exploring</td></tr>
<tr class='text-center'><td>Fewer defects reach production</td><td>Doesn't replace design thinking, integration or exploratory testing</td></tr>
</table>`
        },
        {
            content: `<h3>When TDD Fits - and When It Doesn't</h3>
• <b>Good fit:</b> business rules, calculations, parsers, validators, bug fixes, library APIs - anything with clear inputs and outputs.<br>
• <b>Weaker fit:</b> UI layout, spikes and prototypes where you are discovering what to build, code dominated by external systems (write integration tests afterwards instead).<br>
• <b>Rules of thumb:</b> test behaviour, not implementation; one reason to fail per test; take the smallest step that could fail; never write production code without a failing test while in TDD mode.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is red-green-refactor?</td><td>Write a failing test, make it pass with the simplest code, then improve the code while tests stay green</td></tr>
<tr class='text-center'><td>Why watch the test fail first?</td><td>It proves the test can detect the missing behaviour - a test that never fails tests nothing</td></tr>
<tr class='text-center'><td>What is a regression test?</td><td>A test that reproduces a fixed bug so it cannot return unnoticed</td></tr>
<tr class='text-center'><td>When is TDD less useful?</td><td>Exploratory prototypes, UI layout and code that is mostly glue to external systems</td></tr>
<tr class='text-center'><td>Does TDD guarantee bug-free code?</td><td>No - it only checks the behaviours you thought to specify</td></tr>
</table>`
        }
    ]
};
