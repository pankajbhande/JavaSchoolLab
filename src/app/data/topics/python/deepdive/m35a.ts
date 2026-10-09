// Module 35 (CI/CD).
import { dd, r, type DeepDive } from './deepDive';

export const m35a: Record<string, DeepDive> = {
    'Git & GitHub Workflow': dd(
        [`<b>Git</b> records every change as commits in a history graph; <b>GitHub</b> hosts it and adds pull requests, reviews and automation. A common flow: branch, commit, push, open a PR, review, merge into main.`,
            r`import subprocess
def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True).stdout.strip()

# The daily loop (commands as data):
flow = ["git switch -c feature/login", "git add -p", "git commit -m 'Add login form'",
        "git push -u origin feature/login", "gh pr create --fill"]
print("\n".join(flow))
print("git installed:", bool(git("--version")))

# OUTPUT (example):
# git switch -c feature/login
# git add -p
# git commit -m 'Add login form'
# git push -u origin feature/login
# gh pr create --fill
# git installed: True`],
        [`Without version control, teams overwrite each other and cannot undo mistakes. Branches isolate work; pull requests make review and CI mandatory before code reaches production.`,
            r`# Why PRs: a gate that runs checks before merge
checks = {"tests": True, "lint": True, "review approvals": 1}
can_merge = checks["tests"] and checks["lint"] and checks["review approvals"] >= 1
print("merge allowed:", can_merge)

# OUTPUT:
# merge allowed: True`],
        [`Trunk-based development with short-lived branches, protected main, required status checks, and conventional commits that feed automatic changelogs and version bumps.`,
            r`import re
# Conventional commits: type(scope): message  ->  drives semantic versioning
msgs = ["feat(api): add /users", "fix: null pointer", "docs: update readme", "feat!: drop v1"]
bump = "patch"
for m in msgs:
    if re.match(r"\w+(\(.*\))?!:", m): bump = "major"; break
    if m.startswith("feat") and bump != "major": bump = "minor"
print("next release bump:", bump)

# OUTPUT:
# next release bump: major`],
        [`<b>Advantages:</b> full history and blame, cheap branching, offline work, code review, rollback with revert, audit trail, integrates with CI.`,
            r`import hashlib
# A commit id is a hash of content + parent -> tamper-evident history
parent = "a1b2c3"
content = "tree=... message=Fix bug"
cid = hashlib.sha1((parent + content).encode()).hexdigest()[:7]
print("commit id is deterministic:", cid == hashlib.sha1((parent + content).encode()).hexdigest()[:7])

# OUTPUT:
# commit id is deterministic: True`],
        [`<b>Disadvantages:</b> steep learning curve (rebase vs merge, detached HEAD), merge conflicts, large binaries bloat repos, committed secrets stay in history.`,
            r`# A secret committed once lives in history even after deletion
history = ["add app", "add .env with API_KEY=abc", "remove .env"]
print("secret still in history:", any("API_KEY" in c for c in history))
# Fix: rotate the key; scrub with git filter-repo; add secret scanning.

# OUTPUT:
# secret still in history: True`],
        [`<b>Limitations:</b> not designed for large binary assets (use Git LFS), very large monorepos need sparse checkout, GitHub file limit is 100 MB, force-push on shared branches rewrites others' history.`,
            r`MAX_MB = 100
file_mb = 250
print("GitHub accepts it:" , file_mb <= MAX_MB, "-> use Git LFS")

# OUTPUT:
# GitHub accepts it: False -> use Git LFS`],
        `
   main ●────●────────────●────●  (protected)
             \           ▲
   feature    ●──●──●────┘  merge after: review + CI green
              push  PR opened
                    └──► GitHub Actions runs checks
`,
        `Protect main (required reviews and checks, no force-push), keep PRs small, squash or rebase for a linear history, and sign commits for compliance. Enable secret scanning and push protection. Choose trunk-based development with feature flags over long-lived branches to keep integration cost low.`
    ),

    'GitHub Actions': dd(
        [`<b>GitHub Actions</b> is GitHub's built-in CI/CD: YAML workflows in <code>.github/workflows/</code> triggered by events (push, pull_request, schedule, release) that run jobs of steps on hosted or self-hosted runners.`,
            r`from pathlib import Path
WORKFLOW = """\
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.12"}
      - run: pip install -r requirements.txt
      - run: pytest -q
"""
p = Path(".github/workflows"); p.mkdir(parents=True, exist_ok=True)
(p / "ci.yml").write_text(WORKFLOW)
print("steps:", WORKFLOW.count("- "))

# OUTPUT:
# steps: 4`],
        [`Manual testing and deployments are slow and inconsistent. Automating them on every push catches regressions within minutes and makes releases boring and repeatable.`,
            r`# Matrix: run the same job on many Python versions in parallel
import itertools
versions, oses = ["3.11", "3.12", "3.13"], ["ubuntu", "windows"]
jobs = list(itertools.product(oses, versions))
print(len(jobs), "parallel jobs; first:", jobs[0])

# OUTPUT:
# 6 parallel jobs; first: ('ubuntu', '3.11')`],
        [`Run tests and linters on every PR, build and publish wheels or Docker images on tags, deploy to cloud environments with OIDC (no stored cloud keys), and run scheduled jobs.`,
            r`# Secrets and outputs available to a job (via the github context)
import os
token_present = "GITHUB_TOKEN" in os.environ
print("running in Actions:", os.environ.get("GITHUB_ACTIONS") == "true")
print("ref:", os.environ.get("GITHUB_REF", "local"))

# OUTPUT (on a laptop):
# running in Actions: False
# ref: local`],
        [`<b>Advantages:</b> tight GitHub integration, huge marketplace of reusable actions, matrix builds, free minutes for public repos, caching and artifacts built in.`,
            r`# Cache dependencies keyed by lock-file hash: same lock = cache hit
import hashlib
lock = b"requests==2.32.3\nurllib3==2.2.2"
key = "pip-" + hashlib.sha256(lock).hexdigest()[:10]
print("cache key:", key)

# OUTPUT (example):
# cache key: pip-<10 hex chars>`],
        [`<b>Disadvantages:</b> YAML-only logic is clumsy, debugging means push-and-wait, third-party actions are a supply-chain risk, vendor lock-in, cost for private repos.`,
            r`# Pin third-party actions to a commit SHA, not a movable tag
risky = "uses: some-org/action@v1"
safer = "uses: some-org/action@8f4b7f84864484a7bf31766abe9204da3cbe65b3"
print("pinned:", len(safer.split("@")[1]) == 40, "| risky:", len(risky.split("@")[1]) == 40)

# OUTPUT:
# pinned: True | risky: False`],
        [`<b>Limitations:</b> job time cap (6 hours hosted), runner resource limits, concurrency quotas, secrets are not exposed to forks' PRs, workflow files cannot be run locally exactly (act is approximate).`,
            r`limits = {"max job time (h)": 6, "secrets for fork PRs": "not passed"}
print(limits)

# OUTPUT:
# {'max job time (h)': 6, 'secrets for fork PRs': 'not passed'}`],
        `
   event: push / PR / tag
          │
          ▼
   ┌────────── workflow (.yml) ───────────┐
   │ job: test   (runner: ubuntu)         │
   │   checkout ► setup-python ► pytest   │
   │ job: build  (needs: test)            │
   │   build wheel ► upload artifact      │
   └──────────────────────────────────────┘
          │ status check ──► blocks / allows merge
`,
        `Keep workflows thin: call scripts you can also run locally (make, nox, tox) so CI is not the only place logic lives. Use least-privilege permissions, OIDC for cloud auth, reusable workflows, SHA-pinned actions and concurrency groups to cancel superseded runs. Self-hosted runners need isolation because PRs run arbitrary code.`
    ),

    'Automated Testing in CI': dd(
        [`Running the test suite automatically on every change, in a clean environment, and blocking merges when it fails. Python usually uses <code>pytest</code> with coverage, run in CI via <code>pytest --cov</code>.`,
            r`# tests/test_math.py
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5

def test_add_negative():
    assert add(-1, 1) == 0

# CI command:  pytest -q --cov=app --cov-fail-under=80
# OUTPUT:
# ..                                                  [100%]
# 2 passed in 0.01s`],
        [`Developers forget to run tests or run them with a different setup. CI gives a neutral, reproducible check and a visible pass/fail record for each commit.`,
            r`import subprocess, sys
# Fail the build on a failing test: pytest exits non-zero, CI marks the step red
code = subprocess.run([sys.executable, "-c", "assert 1 + 1 == 3"]).returncode
print("exit code:", code, "->", "BUILD FAILED" if code else "ok")

# OUTPUT:
# exit code: 1 -> BUILD FAILED`],
        [`Test matrix over Python versions, service containers (Postgres/Redis) for integration tests, coverage reports on PRs, parallel runs with pytest-xdist, and nightly slow tests.`,
            r`# Coverage threshold gate
covered, total = 412, 500
pct = covered * 100 // total
print(f"coverage {pct}%", "PASS" if pct >= 80 else "FAIL")

# OUTPUT:
# coverage 82% PASS`],
        [`<b>Advantages:</b> early regression detection, confidence to refactor, living documentation, enforced quality bar, faster reviews.`,
            r`import time
# Fast feedback: shard tests across workers
tests, workers, secs_each = 600, 4, 0.5
print("serial:", tests * secs_each, "s | parallel:", tests * secs_each / workers, "s")

# OUTPUT:
# serial: 300.0 s | parallel: 75.0 s`],
        [`<b>Disadvantages:</b> flaky tests destroy trust, slow suites slow every PR, mocks can hide integration bugs, maintenance cost, CI minutes cost money.`,
            r`import random
# Flaky test: depends on randomness/time -> sometimes fails for no code reason
def flaky():
    return random.random() > 0.1
print("passes this run:", flaky())
# Fix: seed random, freeze time, isolate state; quarantine and fix, never ignore

# OUTPUT (varies):
# passes this run: True`],
        [`<b>Limitations:</b> tests prove presence of bugs, not absence; coverage % does not measure assertion quality; CI environments differ from production in scale and data.`,
            r`def divide(a, b): return a / b
def test_divide():
    divide(4, 2)               # 100% line coverage, but NO assertion -> verifies nothing
print("coverage can be 100% with zero checks")

# OUTPUT:
# coverage can be 100% with zero checks`],
        `
   push ──► CI runner (clean VM / container)
              │ pip install  ──► pytest ──► coverage
              │       │             │          │
              │   services: postgres, redis    ▼
              ▼                         report to PR
        pass ──► merge allowed      fail ──► merge blocked
`,
        `Follow the test pyramid: many fast unit tests, fewer integration tests with service containers, few end-to-end tests. Track flaky tests as defects, cache dependencies, shard by duration, and run slow suites nightly. Keep tests hermetic (no real network or shared state) so failures are trustworthy.`
    ),

    'Linting & Formatting: Ruff & Black': dd(
        [`<b>Linting</b> finds bugs and style problems statically (unused imports, undefined names); <b>formatting</b> rewrites code to one canonical layout. <b>Ruff</b> is a very fast linter and formatter; <b>Black</b> is the classic opinionated formatter.`,
            r`# Before                                  # After  ruff format / black
x = {  'a':1,'b' :2 }                     # x = {"a": 1, "b": 2}
def f( a,b ):return a+b                   # def f(a, b):
                                          #     return a + b
# Lint finds:  import os   (F401 imported but unused)
# Commands:   ruff check .   |   ruff format .   |   black --check .
print({"a": 1, "b": 2})

# OUTPUT:
# {'a': 1, 'b': 2}`],
        [`Style arguments waste review time and unused or undefined names reach production. Automation removes them from human discussion and catches errors before tests even run.`,
            r`import ast
src = "import os\nimport sys\nprint(sys.argv)"
tree = ast.parse(src)
imported = {a.name for n in ast.walk(tree) if isinstance(n, ast.Import) for a in n.names}
used = {n.id for n in ast.walk(tree) if isinstance(n, ast.Name)}
print("unused imports:", imported - used)       # what a linter's F401 rule does

# OUTPUT:
# unused imports: {'os'}`],
        [`Configured in <code>pyproject.toml</code>, run by pre-commit hooks locally and as a required CI check. Ruff replaces flake8, isort, pyupgrade and often Black.`,
            r`import tomllib
cfg = tomllib.loads("""
[tool.ruff]
line-length = 100
target-version = "py312"
[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B"]   # pycodestyle, pyflakes, isort, pyupgrade, bugbear
""")
print(cfg["tool"]["ruff"]["lint"]["select"])

# OUTPUT:
# ['E', 'F', 'I', 'UP', 'B']`],
        [`<b>Advantages:</b> consistent codebase, smaller diffs, catches real bugs, Ruff is 10-100x faster than older tools, autofix support, editor integration.`,
            r`# Autofix example: ruff check --fix rewrites safely
before = "if x == None: pass"
after = "if x is None: pass"          # rule E711
print(before, "->", after)

# OUTPUT:
# if x == None: pass -> if x is None: pass`],
        [`<b>Disadvantages:</b> opinionated defaults you may dislike, noisy on legacy code, rule sets differ by version, a formatter can conflict with the linter if misconfigured.`,
            r`# Adopt gradually: baseline legacy violations instead of fixing 5000 at once
legacy_errors, new_errors = 5000, 0
print("fail CI only on NEW errors:", new_errors == 0, "| ignored legacy:", legacy_errors)

# OUTPUT:
# fail CI only on NEW errors: True | ignored legacy: 5000`],
        [`<b>Limitations:</b> static analysis cannot understand runtime behaviour, finds style and simple bugs not logic errors, and some rules are heuristics with false positives (use <code># noqa</code> sparingly).`,
            r`def area(w, h):
    return w * h * 2      # wrong logic, perfectly "clean" code
print("linter says OK, but area(2,3) =", area(2, 3), "(expected 6)")

# OUTPUT:
# linter says OK, but area(2,3) = 12 (expected 6)`],
        `
   edit ──► pre-commit hook ──► ruff check --fix ──► ruff format
                 │                                       │
              commit ──► push ──► CI: ruff check . && ruff format --check .
                                        │
                                  fail = PR blocked
`,
        `Pick one toolchain (Ruff for lint and format is a good default), pin its version, commit the config, and enforce in both pre-commit and CI. Adopt rules incrementally on legacy code. Never let formatting debates reach code review: the tool decides.`
    ),

    'Type Checking with mypy': dd(
        [`<b>mypy</b> is a static type checker: it reads type hints and reports mismatches without running the code. Types are optional in Python; mypy (or pyright) enforces them where you add them.`,
            r`# app.py
def total(prices: list[float], tax: float) -> float:
    return sum(prices) * (1 + tax)

print(total([10.0, 20.0], 0.1))
# total("abc", 0.1)   # mypy: Argument 1 has incompatible type "str"; expected "list[float]"
# Run:  mypy app.py

# OUTPUT:
# 33.0`],
        [`Python reports type mistakes only when the line executes, maybe in production. mypy finds them at review time and gives IDEs accurate autocomplete and refactoring.`,
            r`def greet(name: str) -> str:
    return "Hello " + name

try:
    greet(42)                      # mypy flags this statically
except TypeError as e:
    print("runtime only:", e)

# OUTPUT:
# runtime only: can only concatenate str (not "int") to str`],
        [`Run <code>mypy --strict</code> (or per-module settings) in CI. Typed APIs also power FastAPI and Pydantic validation. Gradual typing lets legacy code be annotated module by module.`,
            r`import tomllib
cfg = tomllib.loads("""
[tool.mypy]
python_version = "3.12"
strict = true
[[tool.mypy.overrides]]
module = "legacy.*"
ignore_errors = true            # gradual adoption
""")
print(cfg["tool"]["mypy"]["strict"], cfg["tool"]["mypy"]["overrides"][0]["module"])

# OUTPUT:
# True legacy.*`],
        [`<b>Advantages:</b> catches None errors and wrong argument types early, self-documenting signatures, safer refactoring, better tooling, no runtime cost.`,
            r`from typing import Optional
def find(users: dict[int, str], uid: int) -> Optional[str]:
    return users.get(uid)

name = find({1: "Ada"}, 2)
# name.upper()   # mypy: Item "None" of "Optional[str]" has no attribute "upper"
print(name.upper() if name else "not found")

# OUTPUT:
# not found`],
        [`<b>Disadvantages:</b> annotation effort, third-party libraries without stubs, slow on huge codebases (use the daemon dmypy), confusing generics errors, false positives that need casts.`,
            r`from typing import cast
data = {"n": "5"}
n = cast(int, data["n"])     # silences the checker but is a LIE: still a str
print(type(n).__name__)       # cast does nothing at runtime

# OUTPUT:
# str`],
        [`<b>Limitations:</b> hints are not enforced at runtime, dynamic features (setattr, metaclasses, eval) escape analysis, and a typed codebase can still contain logic bugs.`,
            r`def add(a: int, b: int) -> int:
    return a + b
print(add("x", "y"))         # runs fine! hints are not runtime checks

# OUTPUT:
# xy`],
        `
   source + type hints
          │
          ▼
   ┌─────────────┐   builds type graph    ┌────────────────────────┐
   │   mypy      │───────────────────────►│ errors: file:line:msg  │
   └─────────────┘   (no code executed)   └──────────┬─────────────┘
                                                      ▼
                                         CI fails  /  IDE underline
`,
        `Adopt gradually: strict on new modules, ignore_errors on legacy, tighten over time. Type public interfaces first (they give the most value), install stub packages, and combine static checking with runtime validation (Pydantic) at system boundaries where data is untrusted. Consider pyright if speed or editor integration matters.`
    ),

    'Build & Deployment Pipelines': dd(
        [`A <b>pipeline</b> takes a commit through stages: build, test, package, publish and deploy. <b>Continuous Delivery</b> keeps every build releasable; <b>Continuous Deployment</b> ships every green build to production automatically.`,
            r`stages = ["checkout", "lint", "test", "build image", "push registry", "deploy staging",
          "smoke test", "deploy prod"]
def run(stage_results):
    for s in stages:
        ok = stage_results.get(s, True)
        print(("PASS " if ok else "FAIL ") + s)
        if not ok:
            return False
    return True
run({"smoke test": False})

# OUTPUT:
# PASS checkout
# PASS lint
# PASS test
# PASS build image
# PASS push registry
# PASS deploy staging
# FAIL smoke test`],
        [`Manual releases are slow, risky and undocumented. Pipelines make deployment a repeatable, auditable, one-click (or zero-click) action, shrinking lead time and recovery time.`,
            r`# DORA-style metric: deployment frequency and lead time
manual = {"deploys_per_month": 1, "lead_time_days": 14}
pipeline = {"deploys_per_month": 60, "lead_time_days": 0.5}
print("speedup in lead time:", manual["lead_time_days"] / pipeline["lead_time_days"], "x")

# OUTPUT:
# speedup in lead time: 28.0 x`],
        [`Build an image once, tag with the commit SHA, promote the same artifact through staging to production. Strategies: rolling, blue-green, canary, with automatic rollback on failed health checks.`,
            r`import subprocess
sha = "9f2c1ab"
cmds = [f"docker build -t registry.example.com/app:{sha} .",
        f"docker push registry.example.com/app:{sha}",
        f"kubectl set image deploy/app app=registry.example.com/app:{sha}",
        "kubectl rollout status deploy/app --timeout=120s"]
print("\n".join(cmds))

# OUTPUT:
# docker build -t registry.example.com/app:9f2c1ab .
# docker push registry.example.com/app:9f2c1ab
# kubectl set image deploy/app app=registry.example.com/app:9f2c1ab
# kubectl rollout status deploy/app --timeout=120s`],
        [`<b>Advantages:</b> fast, repeatable, auditable releases; small batches reduce risk; easy rollback to a previous artifact; developer time freed from manual deploys.`,
            r`# Rollback = redeploy a previous immutable artifact
history = ["app:a1", "app:b2", "app:c3"]
current = history[-1]
rollback_to = history[-2]
print("rollback", current, "->", rollback_to)

# OUTPUT:
# rollback app:c3 -> app:b2`],
        [`<b>Disadvantages:</b> upfront engineering effort, pipeline maintenance, database migrations complicate rollback, a bug can reach users faster, credentials in CI become a target.`,
            r`# Migrations vs rollback: code can go back, a dropped column cannot
migration = "ALTER TABLE users DROP COLUMN phone"
print("reversible:", "DROP" not in migration, "-> use expand/contract migrations")

# OUTPUT:
# reversible: False -> use expand/contract migrations`],
        [`<b>Limitations:</b> pipelines verify what you test; they cannot detect unknown business-logic issues, and environment drift between staging and production can still cause surprises.`,
            r`# Smoke test after deploy: minimal "is it alive" probe
import urllib.request
def smoke(url):
    try:
        return urllib.request.urlopen(url, timeout=3).status == 200
    except Exception as e:
        return f"unreachable ({type(e).__name__})"
print(smoke("http://127.0.0.1:9/health"))

# OUTPUT:
# unreachable (URLError)`],
        `
   commit ► CI: lint ► test ► build image(sha) ► registry
                                                  │ same artifact
                  ┌───────────────────────────────┤
                  ▼                               ▼
              staging ► smoke tests ► approval ► production
                                                  │ canary 5% ► 50% ► 100%
                                          fail ──► auto rollback
`,
        `Build once, deploy many: promote the identical artifact, inject config per environment. Decouple deploy from release with feature flags, use expand/contract database migrations, observe with SLO-based automated rollback, and keep pipeline definitions as code. Gate production on tests and security scans, not on calendar rituals.`
    ),
};
