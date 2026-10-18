import type { Topic } from '../../types';

export const unittestMock: Topic = {
    id: 'python-testing-mocking-with-unittest-mock',
    name: 'Mocking with unittest.mock',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>mock</b> is a stand-in object that you control: it accepts any call, returns what you tell it to, and <b>records</b> how it was used. <code>unittest.mock</code> (in the standard library) provides <code>Mock</code>, <code>MagicMock</code> and <code>patch</code>. It plays the role that <b>Mockito</b> plays in Java. With a mock you can test code that calls web APIs, databases or the clock without touching them.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 371 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:371px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<line x1="143.5" y1="52.2" x2="230.0" y2="51.2" stroke="#6b7280" marker-end="url(#ar)"/><text x="190.8" y="47.7" font-size="11" fill="#6b7280">calls</text><line x1="132.0" y1="76.0" x2="237.8" y2="120.0" stroke="#6b7280" stroke-dasharray="5 4" marker-end="url(#ar)"/><text x="188.9" y="94.0" font-size="11" fill="#6b7280">replaced</text><rect x="10" y="30" width="133.5" height="46" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="76.8" y="49.5">get_greeting()</tspan><tspan x="76.8" y="64.5">code under test</tspan></text><rect x="230" y="20" width="126.2" height="61" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="293.1" y="39.5">Mock api</tspan><tspan x="293.1" y="54.5">return_value /</tspan><tspan x="293.1" y="69.5">side_effect</tspan></text><rect x="230" y="120" width="126.2" height="46" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="293.1" y="139.5">real web API</tspan><tspan x="293.1" y="154.5">(never called)</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the mock replaces the real dependency and records every call</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Real dependencies are slow, unpredictable and sometimes dangerous (sending real emails, charging real cards). Tests that use them are flaky and cannot simulate failures like a timeout.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Keep unit tests <b>fast, repeatable and isolated</b> from the outside world.</li>
<li>Simulate <b>errors</b> (timeouts, 500 responses) that are hard to trigger for real.</li>
<li><b>Verify behaviour</b>: was the dependency called, how many times, with which arguments?</li>
<li>Test code before the real dependency even exists.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: A Mock API with return_value and side_effect</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `from unittest.mock import Mock


def get_greeting(api, user_id):
    user = api.get_user(user_id)
    return f"Hello, {user['name']}!"


def main():
    api = Mock()
    api.get_user.return_value = {"name": "Abaji"}

    print(get_greeting(api, 42))
    api.get_user.assert_called_once_with(42)  # raises if the call differs
    print("verified: called once with 42")

    api.get_user.side_effect = TimeoutError("api down")
    try:
        get_greeting(api, 7)
    except TimeoutError as error:
        print("TimeoutError:", error)

    print("call count:", api.get_user.call_count)
    print("calls     :", api.get_user.call_args_list)


if __name__ == "__main__":
    main()

# OUTPUT:
# Hello, Abaji!
# verified: called once with 42
# TimeoutError: api down
# call count: 2
# calls     : [call(42), call(7)]`
            ],
            codeExplanations: [
                `Mock() creates api.get_user on demand. return_value sets the result of the first call; assigning side_effect afterwards makes later calls raise instead. The mock remembers both calls, so call_count is 2 even though the second one raised.`
            ]
        },
        {
            content: `<h4>Why Mock?</h4>
Good unit tests are <b>fast, repeatable and isolated</b>. But real code calls slow or unpredictable things: web APIs, databases, the clock, email servers. A <b>mock</b> is a stand-in object that you control, and that records how it was used. It is Python's counterpart of Java's <b>Mockito</b>, and ships in the standard library as <code>unittest.mock</code>.`
        },
        {
            content: `<h4>Mock Objects</h4>
A <code>Mock</code> accepts any attribute or call. Set <code>return_value</code> to say what a call returns, then inspect <code>call_count</code> and <code>call_args</code> afterwards.`,
            codeExamples: [
                `from unittest.mock import Mock

api = Mock()
api.get_user.return_value = {"name": "Abaji"}

print(api.get_user(42))
print(api.get_user.call_count)
print(api.get_user.call_args)
api.get_user.assert_called_once_with(42)

# OUTPUT:
# {'name': 'Abaji'}
# 1
# call(42)`
            ],
            codeExplanations: [
                `api.get_user did not exist - Mock creates attributes on demand. return_value controls what the call returns. assert_called_once_with raises AssertionError if the mock was called a different number of times or with different arguments, and stays silent when everything is as expected.`
            ]
        },
        {
            content: `<h4>side_effect: Sequences and Errors</h4>
<code>side_effect</code> can be a list (each call returns the next value), an exception (raised on call), or a function (called with the arguments). It is how you simulate failures such as a network timeout.`,
            codeExamples: [
                `from unittest.mock import Mock

m = Mock(side_effect=[1, 2, ValueError("boom")])

print(m())
print(m())
try:
    m()
except ValueError as error:
    print("ValueError:", error)

doubler = Mock(side_effect=lambda x: x * 2)
print(doubler(21))

# OUTPUT:
# 1
# 2
# ValueError: boom
# 42`
            ]
        },
        {
            content: `<h4>patch: Replace a Real Object During a Test</h4>
<code>patch("module.name")</code> temporarily swaps the real object for a mock and restores it afterwards. Use it as a decorator (the mock is passed as an extra argument) or as a <code>with</code> block.`,
            codeExamples: [
                `import unittest
from unittest.mock import patch

def fetch_price(symbol):
    raise RuntimeError("real network call - not allowed in tests")

def total_cost(symbol, quantity):
    return fetch_price(symbol) * quantity

class TestTotalCost(unittest.TestCase):
    @patch("__main__.fetch_price", return_value=50)
    def test_total(self, mock_fetch):
        self.assertEqual(total_cost("TCS", 3), 150)
        mock_fetch.assert_called_once_with("TCS")

unittest.main()

# OUTPUT:
# .
# Ran 1 test in 0.001s
#
# OK`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Patch Where the Name Is Looked Up</h3>
The most common mocking mistake: patching the place a function is <i>defined</i> instead of the place it is <i>used</i>. If <code>orders.py</code> does <code>from payments import charge</code>, then <code>orders</code> holds its own reference. Patch <code>"orders.charge"</code>, not <code>"payments.charge"</code>.`,
            codeExamples: [
                `# payments.py
def charge(amount):
    ...                              # talks to a payment gateway

# orders.py
from payments import charge          # orders.charge is now a separate name

def place_order(amount):
    return charge(amount)

# test_orders.py
from unittest.mock import patch
import orders

@patch("orders.charge", return_value="OK")        # correct: where it is used
def test_place_order(mock_charge):
    assert orders.place_order(100) == "OK"

# @patch("payments.charge") would NOT work here: orders.charge still points
# at the original function.`
            ]
        },
        {
            content: `<h3>spec and autospec: Mocks That Fail Like the Real Thing</h3>
A plain Mock accepts <i>anything</i>, so a typo in a method name or a wrong argument count passes silently. <code>create_autospec</code> (or <code>patch(..., autospec=True)</code>) copies the real object's <b>signature</b>, so the mock rejects calls the real one would reject.`,
            codeExamples: [
                `from unittest.mock import Mock, create_autospec

class Mailer:
    def send(self, to, body):
        ...

loose = Mock()
loose.send("a@x.com")                     # wrong - but silently accepted
loose.sned("a@x.com", "hi")               # typo   - also accepted

strict = create_autospec(Mailer, instance=True)
strict.send("a@x.com", "hi")              # fine
try:
    strict.send("a@x.com")                # missing 'body'
except TypeError as error:
    print("TypeError:", error)

try:
    strict.sned("a@x.com", "hi")          # no such method
except AttributeError as error:
    print("AttributeError:", error)

# OUTPUT:
# TypeError: missing a required argument: 'body'
# AttributeError: Mock object has no attribute 'sned'`
            ]
        },
        {
            content: `<h3>MagicMock, patch.object and Context Managers</h3>
<code>MagicMock</code> also supports magic methods (<code>__len__</code>, <code>__enter__</code>, <code>__getitem__</code>...), so it can stand in for containers and context managers. <code>patch.object(obj, "attr")</code> patches one attribute of an object you already hold, and <code>with patch(...) as m:</code> limits the patch to a block.`,
            codeExamples: [
                `from unittest.mock import MagicMock, patch
import os

fake_list = MagicMock()
fake_list.__len__.return_value = 3
print(len(fake_list))

with patch.object(os, "getcwd", return_value="/fake") as m:
    print(os.getcwd())
    m.assert_called_once()
print(os.getcwd() != "/fake")             # patch undone after the block

# OUTPUT:
# 3
# /fake
# True`
            ]
        },
        {
            content: `<h3>Mock Less: Prefer Fakes Where You Can</h3>
Heavy mocking ties tests to <b>how</b> the code works (which calls it makes) rather than <b>what</b> it does, so harmless refactoring breaks tests. Rules of thumb: mock only at the <b>boundaries</b> (network, disk, clock, randomness); never mock the class under test; pass dependencies in as constructor arguments so a simple fake object can replace them with no patching.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Tests run in milliseconds with no network or database</td><td>A mock accepts any call, so typos in method names pass silently (use <code>spec</code>)</td></tr>
<tr><td>Failures can be simulated on demand with <code>side_effect</code></td><td>Over-mocking tests the mock, not the real behaviour</td></tr>
<tr><td>Calls can be verified (<code>assert_called_once_with</code>)</td><td>Tests become tied to implementation details</td></tr>
<tr><td>Included in the standard library - no Mockito-style dependency</td><td><code>patch</code> must target where a name is <i>used</i>, a classic trap</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Mock vs MagicMock?</td><td>MagicMock pre-configures magic methods (<code>__len__</code>, <code>__enter__</code>...); Mock does not</td></tr>
<tr class='text-center'><td>return_value vs side_effect?</td><td>return_value is a fixed result; side_effect can raise, return a sequence, or compute a result from the arguments</td></tr>
<tr class='text-center'><td>Where should you patch?</td><td>Where the name is looked up (used), not where it is defined</td></tr>
<tr class='text-center'><td>What does autospec add?</td><td>The mock copies the real signature, so wrong arguments or misspelt methods raise errors</td></tr>
<tr class='text-center'><td>What is the downside of over-mocking?</td><td>Tests become coupled to implementation details and break on refactors while proving little</td></tr>
</table>`
        }
    ]
};
