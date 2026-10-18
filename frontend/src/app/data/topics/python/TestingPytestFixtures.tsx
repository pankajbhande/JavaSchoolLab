import type { Topic } from '../../types';

export const testingPytestFixtures: Topic = {
    id: 'python-testing-pytest-fixtures',
    name: 'pytest Fixtures',
    beginner: [
        {
            content: `<h4>What is a Fixture?</h4>
A <b>fixture</b> provides something a test needs - an object, test data, a temporary file, a database connection. You write it once with <code>@pytest.fixture</code>, and any test that lists the fixture's <b>name as a parameter</b> receives its value. pytest works out which fixtures each test needs: this is <b>dependency injection</b>, similar to how Spring injects beans.`
        },
        {
            content: `<h4>A Simple Fixture</h4>`,
            codeExamples: [
                `# test_cart.py
import pytest

class Cart:
    def __init__(self):
        self.items = []

    def add(self, item, price):
        self.items.append((item, price))

    def total(self):
        return sum(p for _, p in self.items)


@pytest.fixture
def cart():
    return Cart()                    # a fresh cart for every test that asks


def test_empty_total(cart):          # "cart" is injected by name
    assert cart.total() == 0

def test_total(cart):
    cart.add("pen", 10)
    cart.add("book", 250)
    assert cart.total() == 260`
            ]
        },
        {
            content: `<h4>Fixtures Using Other Fixtures</h4>
A fixture can request other fixtures in the same way, building up test data step by step.`,
            codeExamples: [
                `import pytest

@pytest.fixture
def cart():
    return Cart()

@pytest.fixture
def full_cart(cart):                 # depends on the cart fixture
    cart.add("pen", 10)
    cart.add("bag", 900)
    return cart

def test_full_cart_total(full_cart):
    assert full_cart.total() == 910`
            ]
        },
        {
            content: `<h4>Setup and Teardown with yield</h4>
Code <b>before</b> <code>yield</code> is setup, the yielded value goes to the test, and code <b>after</b> <code>yield</code> is teardown - it runs even if the test fails.`,
            codeExamples: [
                `import sqlite3
import pytest

@pytest.fixture
def db():
    conn = sqlite3.connect(":memory:")       # setup
    conn.execute("CREATE TABLE users (name TEXT)")
    yield conn                               # the test runs here
    conn.close()                             # teardown

def test_insert(db):
    db.execute("INSERT INTO users VALUES ('Abaji')")
    count = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    assert count == 1

def test_starts_empty(db):                   # a brand-new database
    count = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    assert count == 0`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Fixture Scope</h3>
By default a fixture is created for <b>each test</b> (<code>scope="function"</code>). Expensive resources can be shared more widely - but shared objects must not be modified by tests.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Scope</th><th>Created once per</th><th>JUnit analogy</th></tr>
<tr class='text-center'><td><code>function</code> (default)</td><td>Test</td><td><code>@BeforeEach</code></td></tr>
<tr class='text-center'><td><code>class</code></td><td>Test class</td><td><code>@BeforeAll</code></td></tr>
<tr class='text-center'><td><code>module</code></td><td>Test file</td><td>-</td></tr>
<tr class='text-center'><td><code>session</code></td><td>Whole test run</td><td>A shared test container</td></tr>
</table>`,
            codeExamples: [
                `import pytest

@pytest.fixture(scope="module")
def config():
    print("\\nloading config once")
    return {"currency": "INR", "gst": 0.18}

def test_currency(config):
    assert config["currency"] == "INR"

def test_gst(config):
    assert config["gst"] == 0.18

# Running with pytest -s prints "loading config once" a single time
# for both tests in this file.`
            ]
        },
        {
            content: `<h3>Sharing Fixtures with conftest.py</h3>
Fixtures defined in a file named <code>conftest.py</code> are available to every test in that folder and its subfolders - no import needed. Put project-wide fixtures in <code>tests/conftest.py</code>.`,
            codeExamples: [
                `# tests/
#     conftest.py
#     test_orders.py
#     test_payments.py

# tests/conftest.py
import pytest

@pytest.fixture
def customer():
    return {"name": "Abaji", "email": "abaji@mail.com"}

# tests/test_orders.py   (no import of conftest needed)
def test_customer_email(customer):
    assert customer["email"].endswith("@mail.com")`
            ]
        },
        {
            content: `<h3>Built-in Fixtures</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Fixture</th><th>Provides</th></tr>
<tr class='text-center'><td><code>tmp_path</code></td><td>A unique temporary folder (a <code>pathlib.Path</code>) per test</td></tr>
<tr class='text-center'><td><code>capsys</code></td><td>Captured stdout/stderr via <code>capsys.readouterr()</code></td></tr>
<tr class='text-center'><td><code>monkeypatch</code></td><td>Temporarily set attributes, dict items and environment variables - undone automatically</td></tr>
<tr class='text-center'><td><code>caplog</code></td><td>Captured log records</td></tr>
<tr class='text-center'><td><code>request</code></td><td>Information about the requesting test (used inside fixtures)</td></tr>
</table>`,
            codeExamples: [
                `import os

def save(folder, text):
    (folder / "note.txt").write_text(text, encoding="utf-8")

def greet(name):
    print(f"Hello, {name}!")

def api_url():
    return os.environ.get("API_URL", "https://prod.example.com")


def test_save(tmp_path):
    save(tmp_path, "hi")
    assert (tmp_path / "note.txt").read_text(encoding="utf-8") == "hi"

def test_greet(capsys):
    greet("Raoji")
    assert capsys.readouterr().out == "Hello, Raoji!\\n"

def test_api_url(monkeypatch):
    monkeypatch.setenv("API_URL", "http://localhost:8000")
    assert api_url() == "http://localhost:8000"     # restored after the test`
            ]
        },
        {
            content: `<h3>Fixture Factories</h3>
When a test needs <b>several</b> objects with different values, return a function from the fixture. The factory can also track what it created for cleanup.`,
            codeExamples: [
                `import pytest

@pytest.fixture
def make_user():
    created = []

    def _make(name, role="student"):
        user = {"name": name, "role": role}
        created.append(user)
        return user

    yield _make
    created.clear()                  # cleanup for everything the test made

def test_roles(make_user):
    admin = make_user("Abaji", role="admin")
    student = make_user("Raoji")
    assert admin["role"] == "admin"
    assert student["role"] == "student"`
            ]
        },
        {
            content: `<h3>autouse and Fixture Order</h3>
<code>@pytest.fixture(autouse=True)</code> applies a fixture to every test in scope without listing it - handy for resetting global state, but use sparingly because it hides dependencies. Teardown code runs in the <b>reverse</b> order of setup, so later fixtures are torn down first.`,
            codeExamples: [
                `import pytest

@pytest.fixture
def first():
    print("setup first")
    yield
    print("teardown first")

@pytest.fixture
def second(first):
    print("setup second")
    yield
    print("teardown second")

def test_order(second):
    print("test")

# OUTPUT (pytest -s, printed lines only):
# setup first
# setup second
# test
# teardown second
# teardown first`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does a test receive a fixture?</td><td>By naming it as a parameter; pytest injects the fixture's value</td></tr>
<tr class='text-center'><td>How do fixtures do teardown?</td><td>Code after <code>yield</code> runs after the test, even if it failed</td></tr>
<tr class='text-center'><td>What does fixture scope control?</td><td>How often it is created: per function (default), class, module or session</td></tr>
<tr class='text-center'><td>What is conftest.py?</td><td>A file whose fixtures are automatically available to tests in its folder and subfolders</td></tr>
<tr class='text-center'><td>Name some built-in fixtures</td><td>tmp_path, capsys, monkeypatch, caplog, request</td></tr>
<tr class='text-center'><td>Fixtures vs setUp?</td><td>Fixtures are reusable, composable and requested explicitly per test; setUp runs for every test in a class</td></tr>
</table>`
        }
    ]
};
