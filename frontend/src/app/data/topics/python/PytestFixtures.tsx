import type { Topic } from '../../types';

export const pytestFixtures: Topic = {
    id: 'python-testing-pytest-fixtures',
    name: 'pytest Fixtures',
    beginner: [
        {
            content: `<h4>Introduction</h4>
A <b>fixture</b> is a function marked with <code>@pytest.fixture</code> that prepares something a test needs and hands it over. A test asks for a fixture simply by naming it as a <b>parameter</b>. Using <code>yield</code> instead of <code>return</code> splits the fixture into <b>setup</b> (before the yield) and <b>teardown</b> (after it, always run). This is pytest's richer version of JUnit's <code>@BeforeEach</code> / <code>@AfterEach</code>.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 482 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:482px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="126.2" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="73.1" y="30.5">fixture setup</tspan><tspan x="73.1" y="45.5">(before yield)</tspan></text><line x1="136.2" y1="34" x2="166.2" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="170.2" y="10" width="126.2" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="233.3" y="30.5">test runs</tspan><tspan x="233.3" y="45.5">with the value</tspan></text><line x1="296.4" y1="34" x2="326.4" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="330.4" y="10" width="140.8" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="400.8" y="30.5">fixture teardown</tspan><tspan x="400.8" y="45.5">(after yield)</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: teardown runs after every test, whether it passes or fails</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> Copying set-up and clean-up code into every test is noisy, and a failing test can skip the clean-up lines and leave files, connections or data behind.
<br><br>
<b>Why we need it:</b>
<ul>
<li>Share set-up code through <b>dependency injection by name</b>.</li>
<li>Guarantee <b>teardown</b> even when the test fails.</li>
<li>Choose how often it runs with <code>scope</code> (function, module, session).</li>
<li>Build bigger fixtures from smaller ones (a fixture can use another fixture).</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: A yield fixture with setup and teardown</h4>
Save as <code>test_fixtures.py</code> and run <code>pytest -s -q</code> (the <code>-s</code> option shows <code>print</code> output).`,
            codeExamples: [
                `import pytest


@pytest.fixture
def db():
    print("  [setup]    open connection")
    connection = {"users": []}
    yield connection
    print("  [teardown] close connection")


def test_insert(db):
    db["users"].append("abaji")
    print("  test_insert       ->", db["users"])
    assert db["users"] == ["abaji"]


def test_starts_empty(db):
    print("  test_starts_empty ->", db["users"])
    assert db["users"] == []

# Run with:  pytest -s -q
#
# OUTPUT (pytest's progress dots and summary line are omitted):
#   [setup]    open connection
#   test_insert       -> ['abaji']
#   [teardown] close connection
#   [setup]    open connection
#   test_starts_empty -> []
#   [teardown] close connection`
            ],
            codeExplanations: [
                `pytest sees the parameter name db, calls the fixture, and passes in the yielded dictionary. By default a fixture runs once per test, so the second test gets a brand-new empty dictionary. The code after yield is the teardown.`
            ]
        },
        {
            content: `<h4>What is a Fixture?</h4>
A <b>fixture</b> is a function that prepares something a test needs - test data, an object, a database connection - and hands it over. Mark it with <code>@pytest.fixture</code>; any test that lists the fixture's <b>name as a parameter</b> receives its return value. It replaces <code>setUp</code>, but is requested explicitly, so each test says exactly what it depends on.`,
            codeExamples: [
                `import pytest

@pytest.fixture
def cart():
    return {"items": ["pen", "book"], "total": 120}

def test_item_count(cart):
    assert len(cart["items"]) == 2

def test_total(cart):
    assert cart["total"] == 120

# OUTPUT:
# ... 2 passed in 0.01s`
            ],
            codeExplanations: [
                `pytest sees the parameter name "cart", finds the fixture of that name, calls it, and passes the result in. Each test gets its own fresh dictionary, because by default a fixture runs once per test.`
            ]
        },
        {
            content: `<h4>Setup and Teardown With yield</h4>
Use <code>yield</code> instead of <code>return</code>. Code <b>before</b> the <code>yield</code> is setup; code <b>after</b> it is teardown and runs even if the test fails.`,
            codeExamples: [
                `import pytest

@pytest.fixture
def db():
    print("connect")
    connection = {"users": []}
    yield connection
    print("close")

def test_one(db):
    db["users"].append("abaji")
    print("test_one", db)

def test_two(db):
    print("test_two", db)

# Run with:  pytest -s
#
# OUTPUT (pytest's progress dots omitted):
# connect
# test_one {'users': ['abaji']}
# close
# connect
# test_two {'users': []}
# close`
            ]
        },
        {
            content: `<h4>Sharing Fixtures With conftest.py</h4>
A fixture defined in a file named <code>conftest.py</code> is automatically available to every test in that folder and below - no import needed. Keep fixtures used by only one file in that file, and shared ones in <code>conftest.py</code>.`,
            codeExamples: [
                `# tests/conftest.py
import pytest

@pytest.fixture
def sample_user():
    return {"id": 1, "name": "Abaji", "active": True}

# tests/test_users.py  (no import of sample_user needed)
def test_user_is_active(sample_user):
    assert sample_user["active"]

def test_user_name(sample_user):
    assert sample_user["name"] == "Abaji"`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Scope: How Often Does a Fixture Run?</h3>
<code>scope</code> controls how long a fixture instance lives. Expensive setup (starting a container, creating a schema) belongs in a wider scope; anything tests can modify should stay at <code>function</code> scope.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>scope</th><th>Created</th></tr>
<tr class='text-center'><td><code>"function"</code> (default)</td><td>once per test</td></tr>
<tr class='text-center'><td><code>"class"</code></td><td>once per test class</td></tr>
<tr class='text-center'><td><code>"module"</code></td><td>once per test file</td></tr>
<tr class='text-center'><td><code>"package"</code></td><td>once per package</td></tr>
<tr class='text-center'><td><code>"session"</code></td><td>once for the whole run</td></tr>
</table>`,
            codeExamples: [
                `import pytest

@pytest.fixture(scope="module")
def expensive():
    print("building once per module")
    return {"calls": 0}

def test_a(expensive):
    expensive["calls"] += 1
    assert expensive["calls"] == 1

def test_b(expensive):
    expensive["calls"] += 1
    assert expensive["calls"] == 2        # state is shared - order now matters

# OUTPUT with -s (dots omitted):
# building once per module`
            ]
        },
        {
            content: `<h3>Fixtures Can Use Other Fixtures</h3>
A fixture may itself take fixtures as parameters, building a dependency graph that pytest resolves in order. <code>autouse=True</code> applies a fixture to every test without it being requested.`,
            codeExamples: [
                `import pytest

@pytest.fixture
def config():
    return {"db_url": "sqlite:///:memory:"}

@pytest.fixture
def connection(config):                   # depends on config
    print("open", config["db_url"])
    yield object()
    print("close")

@pytest.fixture(autouse=True)
def announce():
    print("-- starting test --")

def test_uses_connection(connection):
    assert connection is not None

# OUTPUT with -s (dots omitted):
# -- starting test --
# open sqlite:///:memory:
# close`
            ]
        },
        {
            content: `<h3>Parametrized Fixtures and Factories</h3>
<code>params=[...]</code> runs every dependent test once per value (read it from <code>request.param</code>). When a test needs <b>several different</b> objects of the same kind, return a <b>factory function</b> from the fixture.`,
            codeExamples: [
                `import pytest

@pytest.fixture(params=["sqlite", "postgres"])
def backend(request):
    return request.param

def test_backend_name(backend):
    assert backend in ("sqlite", "postgres")

@pytest.fixture
def make_user():
    def _make(name="Abaji", active=True):
        return {"name": name, "active": active}
    return _make

def test_two_users(make_user):
    a = make_user()
    b = make_user("Raoji", active=False)
    assert a["active"] and not b["active"]

# OUTPUT with -v:
# test_file.py::test_backend_name[sqlite] PASSED
# test_file.py::test_backend_name[postgres] PASSED
# test_file.py::test_two_users PASSED`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Set-up shared by name - no inheritance or base class</td><td>Name-based injection is "magic": hard to find where a fixture lives</td></tr>
<tr><td>Teardown guaranteed after <code>yield</code></td><td>Wide scopes can leak state between tests</td></tr>
<tr><td>Scopes avoid repeating expensive set-up</td><td>Deep fixture chains are difficult to read</td></tr>
<tr><td><code>conftest.py</code> shares fixtures across files</td><td>IDEs and linters sometimes flag the parameters as unused</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does a test receive a fixture?</td><td>By naming it as a function parameter; pytest injects the fixture's value</td></tr>
<tr class='text-center'><td>How do you do teardown?</td><td>Use <code>yield</code> in the fixture; code after the yield runs after the test, even on failure</td></tr>
<tr class='text-center'><td>What does scope control?</td><td>How long one fixture instance is reused: function, class, module, package or session</td></tr>
<tr class='text-center'><td>What is conftest.py for?</td><td>Fixtures and hooks shared by all tests in its directory tree, with no imports</td></tr>
<tr class='text-center'><td>Fixture vs setUp?</td><td>Fixtures are explicit, composable, reusable across files, and can have different scopes; setUp is implicit and per class</td></tr>
</table>`
        }
    ]
};
