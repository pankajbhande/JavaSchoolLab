import type { Topic } from '../../types';

export const unitVsIntegrationTesting: Topic = {
    id: 'python-testing-unit-vs-integration-testing',
    name: 'Unit vs Integration Testing',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>unit test</b> checks one small piece of code in isolation, with its dependencies replaced by simple fakes. An <b>integration test</b> checks that several real pieces work together - your code with a real database, file system or HTTP stack. Both are needed. Teams usually follow the <b>test pyramid</b>: many fast unit tests at the bottom, fewer integration tests above, and very few end-to-end tests at the top. In Java these are the typical split between plain JUnit tests and Spring or Testcontainers based tests.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 342 125" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:342px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="322" height="31" rx="6" fill="#fef2f2" stroke="#dc2626"/><text text-anchor="middle" font-size="12" fill="#991b1b"><tspan x="171" y="29.5">End-to-end / UI tests: few, slow, costly</tspan></text><rect x="10" y="47" width="322" height="31" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="171" y="66.5">Integration tests: some, real database</tspan></text><rect x="10" y="84" width="322" height="31" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="171" y="103.5">Unit tests: many, fast, isolated</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: the test pyramid: more tests at the fast, cheap bottom</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Only unit tests miss wiring bugs (wrong SQL, wrong column names). Only integration tests are slow and, when one fails, you do not know which part is broken.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Know which <b>question</b> each kind of test answers.</li>
<li>Get <b>fast feedback</b> from unit tests and <b>confidence</b> from integration tests.</li>
<li>Design code with <b>dependency injection</b> so it can be tested both ways.</li>
<li>Balance cost, speed and coverage using the pyramid.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: The same service tested with a fake and with a real database</h4>
A complete, runnable program. Save it in a file and run it with python.`,
            codeExamples: [
                `import sqlite3


class UserService:
    def __init__(self, repo):
        self.repo = repo  # dependency injection

    def greet(self, user_id):
        user = self.repo.find(user_id)
        return f"Hello, {user['name']}!" if user else "Hello, guest!"


class FakeRepo:
    def __init__(self, data):
        self.data = data

    def find(self, user_id):
        return self.data.get(user_id)


class SqliteRepo:
    def __init__(self, conn):
        self.conn = conn

    def find(self, user_id):
        sql = "SELECT name FROM users WHERE id = ?"
        row = self.conn.execute(sql, (user_id,)).fetchone()
        return {"name": row[0]} if row else None


def main():
    unit = UserService(FakeRepo({1: {"name": "Abaji"}}))  # unit: in memory

    conn = sqlite3.connect(":memory:")                   # integration: real SQL
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
    conn.execute("INSERT INTO users VALUES (1, 'Abaji')")
    integration = UserService(SqliteRepo(conn))

    for label, service in [("unit", unit), ("integration", integration)]:
        print(f"{label:<11}:", service.greet(1))
        print(f"{label:<11}:", service.greet(2))


if __name__ == "__main__":
    main()

# OUTPUT:
# unit       : Hello, Abaji!
# unit       : Hello, guest!
# integration: Hello, Abaji!
# integration: Hello, guest!`
            ],
            codeExplanations: [
                `UserService never knows which repository it gets. With FakeRepo the test checks only the service logic and runs instantly; with SqliteRepo it also exercises real SQL and the table schema. The label is padded to 11 characters, so the colons line up.`
            ]
        },
        {
            content: `<h4>Two Different Questions</h4>
<ul>
<li>A <b>unit test</b> asks: <i>"Does this one piece of code work, on its own?"</i> It tests a single function or class with its dependencies replaced by simple stand-ins. It is fast (milliseconds) and needs no network, files or database.</li>
<li>An <b>integration test</b> asks: <i>"Do these pieces work together?"</i> It wires real components together - your code with a real database, a real file system, a real HTTP stack - and checks the combined behaviour. It is slower, but catches problems unit tests cannot: wrong SQL, bad configuration, mismatched data formats.</li>
</ul>`
        },
        {
            content: `<h4>A Service to Test</h4>
The service gets its repository <b>passed in</b> (dependency injection). That small design choice is what lets us test it both ways.`,
            codeExamples: [
                `class UserService:
    def __init__(self, repo):
        self.repo = repo

    def greet(self, user_id):
        user = self.repo.find(user_id)
        return f"Hello, {user['name']}!" if user else "Hello, guest!"`
            ]
        },
        {
            content: `<h4>The Unit Test: A Fake Repository</h4>
No database - just a tiny in-memory fake. We are testing only <code>UserService</code>'s own logic.`,
            codeExamples: [
                `class FakeRepo:
    def __init__(self, data):
        self.data = data

    def find(self, user_id):
        return self.data.get(user_id)

service = UserService(FakeRepo({1: {"name": "Abaji"}}))

print(service.greet(1))
print(service.greet(2))

# OUTPUT:
# Hello, Abaji!
# Hello, guest!`
            ]
        },
        {
            content: `<h4>The Integration Test: A Real Database</h4>
Now the same service runs against a real SQL repository (an in-memory SQLite database). If the SQL, the table or the column mapping were wrong, only this test would catch it.`,
            codeExamples: [
                `import sqlite3

class SqliteRepo:
    def __init__(self, conn):
        self.conn = conn

    def find(self, user_id):
        row = self.conn.execute(
            "SELECT name FROM users WHERE id = ?", (user_id,)
        ).fetchone()
        return {"name": row[0]} if row else None

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
conn.execute("INSERT INTO users VALUES (1, 'Abaji')")

service = UserService(SqliteRepo(conn))

print(service.greet(1))
print(service.greet(2))

# OUTPUT:
# Hello, Abaji!
# Hello, guest!`
            ]
        },
        {
            content: `<h4>Side by Side</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Unit test</th><th>Integration test</th></tr>
<tr class='text-center'><td>Scope</td><td>One function or class</td><td>Several components together</td></tr>
<tr class='text-center'><td>Dependencies</td><td>Faked or mocked</td><td>Real (DB, files, services)</td></tr>
<tr class='text-center'><td>Speed</td><td>Milliseconds</td><td>Seconds</td></tr>
<tr class='text-center'><td>Failure tells you</td><td>Exactly which unit is wrong</td><td>Something in the chain is wrong</td></tr>
<tr class='text-center'><td>Quantity</td><td>Many (hundreds or thousands)</td><td>Fewer</td></tr>
</table>`
        }
    ],

    expert: [
        {
            content: `<h3>The Testing Pyramid</h3>
Aim for a <b>pyramid</b>: a wide base of fast unit tests, a smaller middle layer of integration tests, and a thin top of slow end-to-end (E2E) tests that drive the whole system like a user (a browser, a real API call).
<pre>        /\\
       /E2E\\         few  - slow, brittle, high confidence
      /------\\
     /integra-\\       some - real DB / HTTP boundaries
    /  tion    \\
   /------------\\
  /  unit tests  \\    many - fast, precise, cheap
 /________________\\</pre>
Inverting it (the "ice-cream cone": mostly E2E, few unit tests) gives a slow, flaky suite where a failure rarely points at the cause.`
        },
        {
            content: `<h3>Test Doubles: Dummy, Stub, Fake, Mock, Spy</h3>
"Mock" is used loosely, but there are distinct kinds of stand-ins:
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Double</th><th>What it does</th></tr>
<tr class='text-center'><td>Dummy</td><td>Fills a parameter; never actually used</td></tr>
<tr class='text-center'><td>Stub</td><td>Returns canned answers (<code>return_value</code>)</td></tr>
<tr class='text-center'><td>Fake</td><td>A simple working implementation (the in-memory repo above)</td></tr>
<tr class='text-center'><td>Mock</td><td>A stand-in that verifies it was called correctly</td></tr>
<tr class='text-center'><td>Spy</td><td>Wraps the real object and records calls</td></tr>
</table>
Prefer <b>fakes and stubs</b> (check outcomes) over strict mocks (check interactions); they survive refactoring better.`
        },
        {
            content: `<h3>An Integration Test With Real Setup and Teardown</h3>
Integration tests need real resources prepared and cleaned up. A <code>pytest</code> fixture gives each test a fresh in-memory database; marking the test lets you run slow tests separately.`,
            codeExamples: [
                `import sqlite3
import pytest

@pytest.fixture
def db():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)")
    yield conn
    conn.close()

@pytest.mark.integration
def test_round_trip(db):
    db.execute("INSERT INTO users VALUES (1, 'Abaji')")
    service = UserService(SqliteRepo(db))
    assert service.greet(1) == "Hello, Abaji!"
    assert service.greet(99) == "Hello, guest!"

# Run only the fast tests:        pytest -m "not integration"
# Run only integration tests:     pytest -m integration

# OUTPUT:
# ... 1 passed in 0.01s`
            ]
        },
        {
            content: `<h3>Real Dependencies in CI</h3>
SQLite is convenient, but if production uses PostgreSQL, tests against SQLite can pass while real queries fail (different SQL dialects and types). For high-fidelity integration tests run the <b>real engine in a throw-away container</b> using Docker Compose or the <code>testcontainers</code> package, and run migrations as part of test setup.

Also useful: <b>contract tests</b> (verify your code and a service agree on request/response shapes) and <b>freezing time/randomness</b> to keep tests deterministic.`
        },
        {
            content: `<h3>Flaky Tests</h3>
A <b>flaky test</b> passes and fails with no code change. Common causes: reliance on the clock or random values, shared state between tests, test-order dependence, real network calls, and sleeping instead of waiting for a condition. A flaky suite teaches people to ignore red builds, so fix or quarantine flaky tests immediately. Running with <code>pytest-randomly</code> exposes order dependence.`
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Unit tests: milliseconds, pinpoint the failing function</td><td>Unit tests with fakes can pass while the real system is broken</td></tr>
<tr><td>Integration tests: catch wiring, SQL and config bugs</td><td>Integration tests are slower and need set-up and clean-up</td></tr>
<tr><td>Dependency injection makes both styles possible</td><td>A failing integration test does not say which part is wrong</td></tr>
<tr><td>The pyramid keeps the suite fast and affordable</td><td>Fakes must be kept in sync with the real component</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>Unit vs integration test?</td><td>Unit tests one piece in isolation with fakes; integration tests several real components working together</td></tr>
<tr class='text-center'><td>What is the testing pyramid?</td><td>Many fast unit tests, fewer integration tests, very few end-to-end tests</td></tr>
<tr class='text-center'><td>How does dependency injection help testing?</td><td>You can pass in a fake or a real dependency without changing the code under test</td></tr>
<tr class='text-center'><td>Fake vs mock?</td><td>A fake is a working lightweight implementation; a mock records and verifies calls</td></tr>
<tr class='text-center'><td>What causes flaky tests?</td><td>Time, randomness, shared state, ordering, real network, and sleeps instead of explicit waits</td></tr>
</table>`
        }
    ]
};
