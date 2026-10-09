import type { Topic } from '../../types';

export const testingMocking: Topic = {
    id: 'python-testing-mocking-with-unittest-mock',
    name: 'Mocking with unittest.mock',
    beginner: [
        {
            content: `<h4>Why Mock?</h4>
A unit test should test <b>your</b> code only - fast and repeatable. Real dependencies get in the way: a payment API costs money, a weather service changes every hour, the clock never shows the same time twice. A <b>mock</b> is a stand-in object that you control: you decide what it returns and afterwards check how it was called.<br><br>
<code>unittest.mock</code> is built into Python - it plays the role of <b>Mockito</b> in Java.`
        },
        {
            content: `<h4>Mock Basics: return_value</h4>
A <code>Mock</code> accepts any attribute access and any call. Set <code>return_value</code> to control what a call returns.`,
            codeExamples: [
                `from unittest.mock import Mock

gateway = Mock()
gateway.charge.return_value = {"status": "success", "txn": "T1"}

result = gateway.charge(499, card="4111")
print(result)
print(gateway.charge.called, gateway.charge.call_count)
print(gateway.charge.call_args)

# OUTPUT:
# {'status': 'success', 'txn': 'T1'}
# True 1
# call(499, card='4111')`
            ]
        },
        {
            content: `<h4>side_effect: Errors and Sequences</h4>
<code>side_effect</code> makes a mock <b>raise</b> an exception, return values <b>one after another</b>, or run a function.`,
            codeExamples: [
                `from unittest.mock import Mock

api = Mock()

api.fetch.side_effect = ConnectionError("network down")
try:
    api.fetch()
except ConnectionError as error:
    print("Error:", error)

api.fetch.side_effect = ["first", "second"]
print(api.fetch(), api.fetch())

api.fetch.side_effect = lambda n: n * 2
print(api.fetch(21))

# OUTPUT:
# Error: network down
# first second
# 42`
            ]
        },
        {
            content: `<h4>Verifying Calls</h4>
Assertion methods check how the mock was used - like Mockito's <code>verify()</code>.`,
            codeExamples: [
                `from unittest.mock import Mock, call

def checkout(cart_total, gateway, mailer):
    gateway.charge(cart_total)
    mailer.send("asha@mail.com", "Order confirmed")

gateway = Mock()
mailer = Mock()
checkout(760, gateway, mailer)

gateway.charge.assert_called_once_with(760)
mailer.send.assert_called_once_with("asha@mail.com", "Order confirmed")
print(mailer.mock_calls == [call.send("asha@mail.com", "Order confirmed")])
gateway.refund.assert_not_called()
print("all checks passed")

# OUTPUT:
# True
# all checks passed`
            ]
        },
        {
            content: `<h4>patch: Replacing Something Inside a Module</h4>
Often the dependency isn't passed in - the code imports it. <code>patch("module.name")</code> temporarily replaces that name with a <code>MagicMock</code> and restores it afterwards. It works as a decorator or a context manager.`,
            codeExamples: [
                `# weather.py
import requests

def temperature(city):
    response = requests.get(f"https://api.example.com/weather/{city}")
    return response.json()["temp"]`,
                `# test_weather.py
import unittest
from unittest.mock import patch
import weather

class TestWeather(unittest.TestCase):

    @patch("weather.requests.get")            # as a decorator
    def test_temperature(self, mock_get):
        mock_get.return_value.json.return_value = {"temp": 31}
        self.assertEqual(weather.temperature("Pune"), 31)
        mock_get.assert_called_once_with("https://api.example.com/weather/Pune")

    def test_temperature_with_context_manager(self):
        with patch("weather.requests.get") as mock_get:
            mock_get.return_value.json.return_value = {"temp": 18}
            self.assertEqual(weather.temperature("Shimla"), 18)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Patch Where It Is Looked Up</h3>
The number-one mocking mistake. <code>patch</code> replaces a <b>name in a namespace</b>. If <code>app.py</code> does <code>from time import time</code>, then <code>app</code> has its <b>own</b> name <code>time</code> - patching <code>time.time</code> doesn't touch it. Patch the name where the code under test looks it up: <code>"app.time"</code>.`,
            codeExamples: [
                `# app.py
from time import time

def make_order_id():
    return f"ORD-{int(time())}"`,
                `# test_app.py
from unittest.mock import patch
import app

with patch("time.time", return_value=1_000_000):
    print(app.make_order_id() == "ORD-1000000")      # wrong target

with patch("app.time", return_value=1_000_000):
    print(app.make_order_id())                       # right target

# OUTPUT (first line: False unless the real clock happens to match):
# False
# ORD-1000000`
            ]
        },
        {
            content: `<h3>Mock vs MagicMock</h3>
<code>MagicMock</code> is a <code>Mock</code> that also supports the "magic" dunder methods (<code>len()</code>, iteration, <code>with</code>, indexing...) with sensible defaults. <code>patch</code> uses <code>MagicMock</code> by default.`,
            codeExamples: [
                `from unittest.mock import Mock, MagicMock

m = MagicMock()
print(len(m), list(m))
m.__getitem__.return_value = "value"
print(m["any key"])

plain = Mock()
try:
    len(plain)
except TypeError:
    print("Mock does not support len()")

# OUTPUT:
# 0 []
# value
# Mock does not support len()`
            ]
        },
        {
            content: `<h3>spec and autospec: Catching Typos</h3>
A plain mock accepts <b>anything</b>, so a misspelled method name silently "works" and your test passes against an API that doesn't exist. <code>spec=Class</code> limits the mock to real attribute names; <code>create_autospec</code> / <code>patch(..., autospec=True)</code> also checks call signatures.`,
            codeExamples: [
                `from unittest.mock import Mock, create_autospec

class PaymentGateway:
    def charge(self, amount, currency="INR"):
        ...

loose = Mock()
loose.chrage(100)                         # typo - no error at all!

strict = Mock(spec=PaymentGateway)
try:
    strict.chrage(100)
except AttributeError:
    print("spec caught the typo")

auto = create_autospec(PaymentGateway, instance=True)
try:
    auto.charge(100, "INR", "extra")      # too many arguments
except TypeError:
    print("autospec caught the wrong signature")

# OUTPUT:
# spec caught the typo
# autospec caught the wrong signature`
            ]
        },
        {
            content: `<h3>Mocking Time and Randomness</h3>
Code that depends on "now" or on random numbers becomes testable by patching the function it calls - or, better, by passing the clock in as a parameter (dependency injection), which needs no patching at all.`,
            codeExamples: [
                `from datetime import datetime

def greeting(now=None):
    now = now or datetime.now()
    return "Good morning" if now.hour < 12 else "Good afternoon"

print(greeting(datetime(2026, 10, 5, 9, 0)))     # inject a fixed time
print(greeting(datetime(2026, 10, 5, 15, 0)))

# OUTPUT:
# Good morning
# Good afternoon`
            ]
        },
        {
            content: `<h3>Mockito vs unittest.mock</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Mockito (Java)</th><th>unittest.mock</th></tr>
<tr class='text-center'><td><code>mock(Gateway.class)</code></td><td><code>Mock(spec=Gateway)</code> / <code>create_autospec(Gateway)</code></td></tr>
<tr class='text-center'><td><code>when(g.charge(100)).thenReturn(r)</code></td><td><code>g.charge.return_value = r</code></td></tr>
<tr class='text-center'><td><code>thenThrow(ex)</code></td><td><code>side_effect = ex</code></td></tr>
<tr class='text-center'><td><code>verify(g).charge(100)</code></td><td><code>g.charge.assert_called_once_with(100)</code></td></tr>
<tr class='text-center'><td><code>verify(g, never()).refund()</code></td><td><code>g.refund.assert_not_called()</code></td></tr>
<tr class='text-center'><td>Constructor/field injection</td><td><code>patch("module.name")</code> - replace any name at runtime</td></tr>
</table>`
        },
        {
            content: `<h3>Don't Over-Mock</h3>
Mocks verify that your code <b>talks</b> to a dependency correctly - not that the whole system works. Too many mocks make tests mirror the implementation, so every refactor breaks them. Mock at the boundaries (network, clock, payment provider, email), use real objects for your own simple classes, and back the mocked tests with a few integration tests.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Why mock in unit tests?</td><td>To isolate the code under test from slow, costly or unpredictable dependencies and to control their responses</td></tr>
<tr class='text-center'><td>return_value vs side_effect?</td><td>return_value is a fixed result; side_effect can raise an exception, return a sequence of values or call a function</td></tr>
<tr class='text-center'><td>Where should you patch?</td><td>Where the name is looked up - the module that uses it (e.g. "app.time"), not where it was defined</td></tr>
<tr class='text-center'><td>Mock vs MagicMock?</td><td>MagicMock also configures magic methods such as __len__, __iter__ and __enter__</td></tr>
<tr class='text-center'><td>What does spec/autospec add?</td><td>The mock only allows real attributes (and, with autospec, real signatures), so typos and API drift are caught</td></tr>
<tr class='text-center'><td>How do you verify a call?</td><td><code>mock.method.assert_called_once_with(args)</code>, plus call_count and call_args</td></tr>
</table>`
        }
    ]
};
