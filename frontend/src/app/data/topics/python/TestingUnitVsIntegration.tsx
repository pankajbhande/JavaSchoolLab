import type { Topic } from '../../types';

export const testingUnitVsIntegration: Topic = {
    id: 'python-testing-unit-vs-integration-testing',
    name: 'Unit vs Integration Testing',
    beginner: [
        {
            content: `<h4>Two Levels of Testing</h4>
• A <b>unit test</b> checks one small piece - a function or a class - in isolation. No database, no network, no files. It runs in milliseconds.<br>
• An <b>integration test</b> checks that several pieces work <b>together</b> - your code plus a real database, file system, or HTTP layer. It is slower but catches problems unit tests can't, such as a wrong SQL query or a misconfigured route.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th></th><th>Unit test</th><th>Integration test</th></tr>
<tr class='text-center'><td>Scope</td><td>One function / class</td><td>Several components together</td></tr>
<tr class='text-center'><td>External systems</td><td>Replaced by test doubles</td><td>Real (or realistic, e.g. in-memory DB)</td></tr>
<tr class='text-center'><td>Speed</td><td>Milliseconds</td><td>Milliseconds to seconds</td></tr>
<tr class='text-center'><td>When it fails</td><td>Points to the exact function</td><td>Something in the chain is wrong</td></tr>
</table>`
        },
        {
            content: `<h4>A Unit Test: A Pure Function</h4>
Pure business logic is the easiest and most valuable thing to unit test.`,
            codeExamples: [
                `# shop/pricing.py
def final_price(price, qty, is_member):
    total = price * qty
    if is_member:
        total *= 0.9
    return round(total, 2)

# tests/test_pricing.py
from shop.pricing import final_price

def test_member_gets_ten_percent_off():
    assert final_price(100, 2, is_member=True) == 180.0

def test_non_member_pays_full_price():
    assert final_price(100, 2, is_member=False) == 200`
            ]
        },
        {
            content: `<h4>An Integration Test: Code + a Real Database</h4>
SQLite's <code>:memory:</code> database is real SQL, created fresh for each test - the test exercises your actual queries without needing a database server.`,
            codeExamples: [
                `# shop/repo.py
def add_order(conn, item, amount):
    conn.execute("INSERT INTO orders (item, amount) VALUES (?, ?)", (item, amount))

def total_sales(conn):
    return conn.execute("SELECT COALESCE(SUM(amount), 0) FROM orders").fetchone()[0]

# tests/test_repo.py
import sqlite3
import pytest
from shop.repo import add_order, total_sales

@pytest.fixture
def conn():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE orders (item TEXT, amount INTEGER)")
    yield conn
    conn.close()

def test_total_sales(conn):
    add_order(conn, "pen", 30)
    add_order(conn, "book", 250)
    assert total_sales(conn) == 280

def test_total_sales_empty(conn):
    assert total_sales(conn) == 0`
            ]
        },
        {
            content: `<h4>An Integration Test for an API Endpoint</h4>
Web frameworks provide a test client that sends requests to your app in-process, without starting a real server.`,
            codeExamples: [
                `# app.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/price/{qty}")
def price(qty: int):
    return {"qty": qty, "total": qty * 100}

# test_app.py
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_price_endpoint():
    response = client.get("/price/3")
    assert response.status_code == 200
    assert response.json() == {"qty": 3, "total": 300}

def test_price_rejects_text():
    assert client.get("/price/abc").status_code == 422`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>The Test Pyramid</h3>
Many fast unit tests at the bottom, fewer integration tests in the middle, and a handful of slow end-to-end tests at the top. The shape keeps the suite fast and reliable while still checking that the whole system works.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Level</th><th>Share of tests</th><th>Example</th></tr>
<tr class='text-center'><td>End-to-end</td><td>Few</td><td>A browser (Playwright/Selenium) logs in and places an order on a running site</td></tr>
<tr class='text-center'><td>Integration</td><td>Some</td><td>Repository + real DB, API endpoint + test client</td></tr>
<tr class='text-center'><td>Unit</td><td>Many</td><td>Pricing rules, validators, parsers</td></tr>
</table>`
        },
        {
            content: `<h3>Test Doubles: Stub, Mock, Fake</h3>
To unit-test code that depends on something slow or external, replace the dependency with a <b>test double</b>.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Double</th><th>What it does</th><th>Example</th></tr>
<tr class='text-center'><td>Stub</td><td>Returns canned answers</td><td>An exchange-rate service that always returns 83.0</td></tr>
<tr class='text-center'><td>Mock</td><td>Records calls so the test can verify them</td><td>Check that <code>send_email</code> was called once</td></tr>
<tr class='text-center'><td>Fake</td><td>A working, simplified implementation</td><td>An in-memory repository instead of PostgreSQL</td></tr>
</table>`,
            codeExamples: [
                `from unittest.mock import Mock

class FakeOrderRepo:                       # fake: really stores data, in memory
    def __init__(self):
        self.orders = []
    def save(self, order):
        self.orders.append(order)

def place_order(repo, mailer, rates, item, usd):
    inr = round(usd * rates.usd_to_inr(), 2)
    repo.save({"item": item, "inr": inr})
    mailer.send(f"Order placed: {item}")
    return inr

rates = Mock()
rates.usd_to_inr.return_value = 83.0      # stub behaviour
mailer = Mock()                           # mock: we verify the call
repo = FakeOrderRepo()

print(place_order(repo, mailer, rates, "book", 10))
print(repo.orders)
mailer.send.assert_called_once_with("Order placed: book")
print("mailer verified")

# OUTPUT:
# 830.0
# [{'item': 'book', 'inr': 830.0}]
# mailer verified`
            ]
        },
        {
            content: `<h3>Speed, Flakiness and Confidence</h3>
• <b>Unit tests</b> are fast and deterministic, but too many mocks can test the mocks instead of the behaviour - and they can all pass while the real database query is wrong.<br>
• <b>Integration tests</b> give more confidence but are slower and can be <b>flaky</b> (time-dependent, ordering, network). Reduce flakiness with fresh fixtures per test, in-memory or containerised dependencies (e.g. Testcontainers), and no reliance on real time or external services.<br>
• <b>Don't mock what you don't own</b>: wrap third-party APIs in your own small class, mock that wrapper in unit tests, and cover the wrapper with a few integration tests.`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Unit vs integration test?</td><td>A unit test checks one piece in isolation; an integration test checks several pieces working together with real dependencies</td></tr>
<tr class='text-center'><td>What is the test pyramid?</td><td>Many unit tests, fewer integration tests, very few end-to-end tests</td></tr>
<tr class='text-center'><td>Stub vs mock vs fake?</td><td>A stub returns canned data, a mock records and verifies calls, a fake is a lightweight working implementation</td></tr>
<tr class='text-center'><td>Why use SQLite :memory: in tests?</td><td>It runs real SQL quickly with a fresh database per test and no server</td></tr>
<tr class='text-center'><td>What makes a test flaky?</td><td>Dependence on timing, test order, shared state or external services</td></tr>
</table>`
        }
    ]
};
