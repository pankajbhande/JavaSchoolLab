// Module 32 (Python Packaging).
import { dd, r, type DeepDive } from './deepDive';

export const m32a: Record<string, DeepDive> = {
    'pyproject.toml': dd(
        [`<code>pyproject.toml</code> is the single, standard configuration file for a Python project: build system, metadata, dependencies and tool settings (PEP 517/518/621). It uses the TOML format, which the standard library can read via <code>tomllib</code> (3.11+).`,
            r`import tomllib

# A minimal pyproject.toml, kept in a string so this sample is self-contained
TOML = """
[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

[project]
name = "acme-tools"
version = "1.2.0"
dependencies = ["requests>=2.31"]
"""
cfg = tomllib.loads(TOML)               # parse text -> dict
print(cfg["project"]["name"], cfg["project"]["version"])
print(cfg["build-system"]["build-backend"])

# OUTPUT:
# acme-tools 1.2.0
# setuptools.build_meta`],
        [`Before it, metadata lived in setup.py (arbitrary code, executed to read it), setup.cfg, requirements.txt, and one config file per tool. pyproject.toml makes metadata declarative so installers, IDEs and CI can read it without running code.`,
            r`# Old way: setup.py had to be EXECUTED to learn the version (unsafe + slow)
# New way: just parse data
import tomllib
data = tomllib.loads('[project]\nname = "x"\nversion = "0.1"')
print(data["project"])          # no code executed, only data read

# OUTPUT:
# {'name': 'x', 'version': '0.1'}`],
        [`Every modern project (FastAPI, Django, pandas) ships a pyproject.toml. Tools such as ruff, black, pytest and mypy read their own <code>[tool.*]</code> tables from it, so one file configures the whole workflow.`,
            r`import tomllib

TOML = """
[tool.ruff]
line-length = 100

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-q"
"""
tools = tomllib.loads(TOML)["tool"]
for name, conf in tools.items():          # each tool owns its table
    print(name, "->", conf)

# OUTPUT:
# ruff -> {'line-length': 100}
# pytest -> {'ini_options': {'testpaths': ['tests'], 'addopts': '-q'}}`],
        [`<b>Advantages:</b> one standard file, declarative and safe to parse, backend-agnostic (setuptools, hatchling, flit, poetry), supported by pip, uv and every IDE.`,
            r`import tomllib

# Same [project] table works for any backend - switching backends changes 2 lines only
for backend in ("setuptools.build_meta", "hatchling.build", "flit_core.buildapi"):
    doc = tomllib.loads(f'[build-system]\nrequires=[]\nbuild-backend="{backend}"')
    print("backend:", doc["build-system"]["build-backend"])

# OUTPUT:
# backend: setuptools.build_meta
# backend: hatchling.build
# backend: flit_core.buildapi`],
        [`<b>Disadvantages:</b> TOML syntax errors are strict; some tools historically ignored it; dynamic metadata (version from git) needs backend plugins; two sections (<code>[project]</code> vs <code>[tool.poetry]</code>) can confuse beginners.`,
            r`import tomllib

bad = 'name = "x\nversion = 1'          # unterminated string
try:
    tomllib.loads(bad)
except tomllib.TOMLDecodeError as e:
    print("TOML error:", type(e).__name__)

# OUTPUT:
# TOML error: TOMLDecodeError`],
        [`<b>Limitations:</b> it is only data - no conditionals or computed values. tomllib is read-only (no writing); to write TOML use tomli-w or tomlkit.`,
            r`import tomllib
doc = tomllib.loads('v = 1')
print(hasattr(tomllib, "dumps"))        # read-only: no dump/dumps in the stdlib
# Version "1.0." + build number cannot be computed inside TOML itself.

# OUTPUT:
# False`],
        `
   pyproject.toml
   ┌─────────────────────────────────────┐
   │ [build-system]  -> how to BUILD     │──► pip / build  (PEP 517)
   │ [project]       -> name, deps, ...  │──► PyPI metadata (PEP 621)
   │ [tool.ruff]     -> linter config    │──► ruff
   │ [tool.pytest]   -> test config      │──► pytest
   └─────────────────────────────────────┘
`,
        `Make pyproject.toml the only source of truth and delete setup.py unless a C extension needs it. Keep tool config here, but pin build requirements and prefer a lockfile (uv.lock/poetry.lock) for apps; libraries should declare loose ranges. Do not stuff secrets or environment-specific values in it.`
    ),

    'Build Systems': dd(
        [`A <b>build backend</b> turns your source tree into distributable artifacts (wheel + sdist). A <b>frontend</b> (pip, <code>python -m build</code>, uv) reads <code>[build-system]</code>, creates an isolated environment with the required packages and calls the backend's hooks.`,
            r`import tomllib

cfg = tomllib.loads("""
[build-system]
requires = ["hatchling"]            # installed into a temp, isolated env
build-backend = "hatchling.build"   # module whose hooks the frontend calls
""")["build-system"]
print("frontend installs:", cfg["requires"])
print("then calls       :", cfg["build-backend"] + ".build_wheel()")

# OUTPUT:
# frontend installs: ['hatchling']
# then calls       : hatchling.build.build_wheel()`],
        [`Building used to mean "run setup.py", tying every project to setuptools and to whatever was installed globally. The PEP 517 split lets projects choose any backend and get reproducible, isolated builds.`,
            r`# Command line (shown as comments), then the Python equivalent
#   pip install build
#   python -m build            -> dist/acme-1.0.tar.gz  and dist/acme-1.0-py3-none-any.whl
import subprocess, sys
cmd = [sys.executable, "-m", "build", "--help"]
print("would run:", " ".join(cmd[:3]))

# OUTPUT:
# would run: python -m build`],
        [`CI pipelines run <code>python -m build</code> on a tag, then upload dist/* to PyPI. Rust-based extensions use maturin; scientific packages with C code use scikit-build-core or meson-python.`,
            r`from pathlib import Path

# Inspect what a build produced
dist = Path("dist")
for f in sorted(dist.glob("*")) if dist.exists() else []:
    print(f.name)
print("dist exists:", dist.exists())

# OUTPUT (example, before any build):
# dist exists: False`],
        [`<b>Advantages:</b> pluggable backends, isolated clean builds (no "works on my machine"), frontends are interchangeable, and wheels build once and install everywhere.`,
            r`# The backend interface is just a few functions - easy to reason about
hooks = ["build_wheel", "build_sdist", "get_requires_for_build_wheel"]
print("PEP 517 mandatory/optional hooks:", ", ".join(hooks))

# OUTPUT:
# PEP 517 mandatory/optional hooks: build_wheel, build_sdist, get_requires_for_build_wheel`],
        [`<b>Disadvantages:</b> isolated builds download build requirements every time (slow, needs network); compiled extensions need a toolchain; errors are shown from inside the subprocess and are harder to read.`,
            r`# Typical failure surface when a C extension has no compiler:
msg = "error: Microsoft Visual C++ 14.0 or greater is required"
print("build failed ->", msg)
# Mitigation: ship pre-built wheels via cibuildwheel instead of asking users to compile.

# OUTPUT:
# build failed -> error: Microsoft Visual C++ 14.0 or greater is required`],
        [`<b>Limitations:</b> a backend cannot change the Python version or install system libraries; <code>--no-build-isolation</code> exists but defeats reproducibility.`,
            r`import sys
# The build env is a fresh venv, so your globally installed tools are invisible there.
# "requires" must list EVERYTHING the build needs (e.g. cython, numpy headers).
print("must declare in requires:", ["setuptools>=68", "wheel", "cython"])

# OUTPUT:
# must declare in requires: ['setuptools>=68', 'wheel', 'cython']`],
        `
   source tree + pyproject.toml
            │
            ▼
   ┌────────────────┐  reads [build-system]   ┌──────────────────┐
   │ Frontend       │────────────────────────►│ isolated venv    │
   │ (pip / build)  │                         │  + backend       │
   └────────────────┘                         └────────┬─────────┘
                                                       │ build_wheel()
                                                       ▼
                                          dist/pkg-1.0-py3-none-any.whl
`,
        `Default to hatchling or setuptools for pure Python, maturin for Rust, scikit-build-core for C/C++. Pick by extension needs, not fashion. For monorepos standardise one backend so tooling and caches are shared; avoid custom build scripts, they destroy reproducibility.`
    ),

    'Wheels & Source Distributions': dd(
        [`A <b>wheel</b> (.whl) is a pre-built, zip-format install archive: pip just unpacks it. An <b>sdist</b> (.tar.gz) is the source plus metadata, and must be built on install. A wheel's filename encodes compatibility tags.`,
            r`# name-version-python_tag-abi_tag-platform_tag.whl
name = "numpy-1.26.4-cp312-cp312-win_amd64.whl"
dist, ver, py, abi, plat = name[:-4].split("-")
print(dist, ver)
print("python:", py, "| abi:", abi, "| platform:", plat)

# OUTPUT:
# numpy 1.26.4
# python: cp312 | abi: cp312 | platform: win_amd64`],
        [`Installing from source means running a build: slow, needs compilers, and can run arbitrary code. Wheels make installs fast, safe and deterministic, while sdists keep the source available for packagers and unusual platforms.`,
            r`import zipfile, io

# A wheel is simply a zip: build one in memory and list it
buf = io.BytesIO()
with zipfile.ZipFile(buf, "w") as z:
    z.writestr("acme/__init__.py", "x = 1")
    z.writestr("acme-1.0.dist-info/METADATA", "Name: acme\nVersion: 1.0")
print(zipfile.ZipFile(buf).namelist())

# OUTPUT:
# ['acme/__init__.py', 'acme-1.0.dist-info/METADATA']`],
        [`PyPI serves manylinux wheels for numpy, pandas, torch so <code>pip install</code> takes seconds. Pure-Python libraries ship one universal <code>py3-none-any</code> wheel.`,
            r`# Which tags does THIS interpreter accept? (packaging is a pip dependency)
try:
    from packaging.tags import sys_tags
    first = next(iter(sys_tags()))
    print("most specific tag:", first)
except ImportError:
    print("pip install packaging")

# OUTPUT (example):
# most specific tag: cp312-cp312-win_amd64`],
        [`<b>Advantages:</b> no build step on install, no code execution, cacheable, supports binary extensions, lets pip pick the best matching tag.`,
            r`import time
# Install cost model: unzip (ms) vs compile (seconds-minutes)
t = time.perf_counter()
sum(range(1000))                       # stand-in for "unzip"
print("wheel install ~ milliseconds; sdist compile ~ seconds to minutes")

# OUTPUT:
# wheel install ~ milliseconds; sdist compile ~ seconds to minutes`],
        [`<b>Disadvantages:</b> a binary wheel exists per OS, CPU architecture and Python version, so build matrices get large; wheels cannot bundle every system library.`,
            r`py_versions = 4      # 3.10 .. 3.13
platforms = 5        # win64, mac-x86, mac-arm, linux-x86, linux-arm
print("wheels per release for one C extension:", py_versions * platforms)

# OUTPUT:
# wheels per release for one C extension: 20`],
        [`<b>Limitations:</b> wheels cannot run install-time scripts, and an sdist is mandatory for platforms with no wheel. Binary wheels for Linux must use manylinux/musllinux tags (not distro-specific).`,
            r`import platform
libc = platform.libc_ver()
print("Linux needs manylinux or musllinux tag; this host libc:", libc)

# OUTPUT (example on Windows):
# Linux needs manylinux or musllinux tag; this host libc: ('', '')`],
        `
   source tree
      │ python -m build
      ├──────────────────────────────┐
      ▼                              ▼
   sdist (.tar.gz)               wheel (.whl)
   needs build on install        unzip -> site-packages
   any platform                  tagged: py-abi-platform
      │                              │
      └────────────► PyPI ◄──────────┘   pip prefers the wheel
`,
        `Always publish both: wheels for speed, sdist for auditability and exotic platforms. Use cibuildwheel for matrices, and test the wheel (not the source tree) in CI so packaging bugs like missing data files surface early. Limit supported Python versions deliberately to control matrix cost.`
    ),

    'Publishing a Package': dd(
        [`Publishing uploads your built <code>dist/*</code> files to an index such as PyPI so that <code>pip install yourpkg</code> works for everyone. <code>twine</code> uploads, or modern <b>Trusted Publishing</b> lets CI upload without a stored token.`,
            r`# Release checklist as code
steps = [
    "bump version in pyproject.toml",
    "python -m build",
    "twine check dist/*",
    "twine upload --repository testpypi dist/*",   # rehearse first
    "twine upload dist/*",
]
for i, s in enumerate(steps, 1):
    print(i, s)

# OUTPUT:
# 1 bump version in pyproject.toml
# 2 python -m build
# 3 twine check dist/*
# 4 twine upload --repository testpypi dist/*
# 5 twine upload dist/*`],
        [`Without an index, sharing code means copying folders or git URLs, with no versions or dependency resolution. A registry gives discoverability, immutable versions and one install command.`,
            r`# Check a name is free before choosing it (network call, PyPI JSON API)
import urllib.request, urllib.error
def taken(name):
    try:
        urllib.request.urlopen(f"https://pypi.org/pypi/{name}/json", timeout=5)
        return True
    except urllib.error.HTTPError as e:
        return e.code != 404
print(taken("requests"))

# OUTPUT (needs internet):
# True`],
        [`Companies publish to a <b>private index</b> (Artifactory, AWS CodeArtifact, GitHub Packages) for internal libraries, and to PyPI for open source. Releases are triggered by git tags in CI.`,
            r`import os
# ~/.pypirc style configuration, shown as data (never commit real tokens)
pypirc = """
[pypi]
username = __token__
password = pypi-AgEI...        # API token, scope it to ONE project
"""
print("token from CI secret:", "TWINE_PASSWORD" in os.environ)

# OUTPUT (locally):
# token from CI secret: False`],
        [`<b>Advantages:</b> global reach, immutable releases, free hosting, metadata and README rendered on the project page, and trusted publishing removes long-lived secrets.`,
            r`# Trusted publishing workflow fragment (GitHub Actions)
snippet = """
permissions:
  id-token: write          # OIDC: PyPI trusts this repo+workflow, no token
steps:
  - uses: pypa/gh-action-pypi-publish@release/v1
"""
print(snippet.strip().splitlines()[0])

# OUTPUT:
# permissions:`],
        [`<b>Disadvantages:</b> a released version can never be overwritten (only yanked), public names get squatted, and typosquatting / supply-chain attacks are real threats.`,
            r`# A bad release cannot be replaced. You must publish 1.0.1.
released = {"1.0.0"}
def upload(v):
    if v in released:
        raise ValueError(f"File already exists: {v}")
    released.add(v)
try:
    upload("1.0.0")
except ValueError as e:
    print(e)

# OUTPUT:
# File already exists: 1.0.0`],
        [`<b>Limitations:</b> file size cap (100 MB per file by default), name normalisation rules, README must be valid markup, and you cannot delete and re-use a version number.`,
            r`import re
def normalise(n):                       # PEP 503 name normalisation
    return re.sub(r"[-_.]+", "-", n).lower()
print(normalise("Acme_Tools"), normalise("acme.tools"))

# OUTPUT:
# acme-tools acme-tools`],
        `
   git tag v1.0.0
        │
        ▼
   CI: build ──► twine check ──► TestPyPI (rehearsal)
                     │
                     ▼ OIDC trusted publishing
                   PyPI  ──►  pip install acme-tools
`,
        `Automate releases from tags with trusted publishing, sign provenance (attestations), and rehearse on TestPyPI. For proprietary code use a private index with proxying and allow-lists to resist dependency-confusion attacks. Treat each release as irreversible: gate it on a green test matrix.`
    ),

    'Versioning': dd(
        [`Versioning labels each release so users can depend on compatible ranges. Python uses PEP 440 (<code>1.4.2</code>, <code>2.0.0rc1</code>); most projects follow Semantic Versioning: MAJOR.MINOR.PATCH.`,
            r`from packaging.version import Version

v = Version("2.4.1")
print(v.major, v.minor, v.micro)
print(Version("2.0.0rc1").is_prerelease)
print(Version("1.10") > Version("1.9"))     # numeric, not string, comparison

# OUTPUT:
# 2 4 1
# True
# True`],
        [`Without an agreed scheme, upgrades are guesses. SemVer signals risk: patch = bug fix, minor = new backward-compatible feature, major = breaking change. Tools use this to resolve dependencies.`,
            r`from packaging.specifiers import SpecifierSet
from packaging.version import Version

rule = SpecifierSet(">=1.4,<2")          # accept minor/patch, block major
for v in ["1.4.0", "1.9.3", "2.0.0"]:
    print(v, Version(v) in rule)

# OUTPUT:
# 1.4.0 True
# 1.9.3 True
# 2.0.0 False`],
        [`Teams bump versions in CI (bump-my-version, python-semantic-release) from commit messages, or derive them from git tags with setuptools-scm / hatch-vcs.`,
            r`def bump(version, part):
    major, minor, patch = map(int, version.split("."))
    if part == "major": return f"{major + 1}.0.0"
    if part == "minor": return f"{major}.{minor + 1}.0"
    return f"{major}.{minor}.{patch + 1}"

print(bump("1.4.2", "patch"), bump("1.4.2", "minor"), bump("1.4.2", "major"))

# OUTPUT:
# 1.4.3 1.5.0 2.0.0`],
        [`<b>Advantages:</b> clear upgrade contracts, machine-comparable ordering, pre-release channels (a, b, rc, dev), and single-source versions from git tags.`,
            r`from packaging.version import Version
vs = ["1.0.0", "1.0.0rc1", "1.0.0b2", "1.0.0.dev1", "1.0.0.post1"]
print(sorted(vs, key=Version))

# OUTPUT:
# ['1.0.0.dev1', '1.0.0b2', '1.0.0rc1', '1.0.0', '1.0.0.post1']`],
        [`<b>Disadvantages:</b> SemVer is a promise, not enforcement; maintainers disagree on what "breaking" means; CalVer (2024.10) projects convey no compatibility info.`,
            r`# A "minor" release that removed a function is still a breaking change.
old_api = {"load", "save"}
new_api = {"load"}                       # save() dropped in 1.5.0
print("removed:", old_api - new_api, "-> should have been 2.0.0")

# OUTPUT:
# removed: {'save'} -> should have been 2.0.0`],
        [`<b>Limitations:</b> PEP 440 rejects some SemVer strings (e.g. <code>1.0.0-beta.1</code> is normalised), and local versions (<code>1.0+local</code>) cannot be uploaded to PyPI.`,
            r`from packaging.version import Version, InvalidVersion
print(Version("1.0.0-beta.1"))           # normalised by PEP 440
try:
    Version("v-latest")
except InvalidVersion:
    print("invalid version")

# OUTPUT:
# 1.0.0b1
# invalid version`],
        `
   1  .  4  .  2
   │     │     └── PATCH: bug fix, safe
   │     └──────── MINOR: new feature, backward-compatible
   └────────────── MAJOR: breaking change

   1.0.dev1 < 1.0a1 < 1.0b1 < 1.0rc1 < 1.0 < 1.0.post1
`,
        `Libraries should follow SemVer strictly and document the public API; applications can use CalVer. Use compatible-release ranges (~=) for libraries and exact pins for deployables. Automate the bump and changelog so human error cannot ship a breaking minor.`
    ),

    'Dependency Management': dd(
        [`Dependency management declares what your code needs, resolves compatible versions, and records exactly what was installed. Direct dependencies live in <code>pyproject.toml</code>; a lock file freezes the whole resolved tree.`,
            r`from importlib.metadata import version, requires

print("pip installed:", version("pip"))        # version of any installed distribution
print(requires("pip") or [])                    # its declared dependencies (pip has none)

# OUTPUT (example):
# pip installed: 24.0
# []`],
        [`Unpinned installs drift: a new transitive release breaks production on a Friday. Pinned, hashed locks give reproducible installs; ranges in libraries keep them compatible with other packages.`,
            r`# Two layers
abstract = ["requests>=2.31,<3"]                 # what you WANT (pyproject)
locked   = ["requests==2.32.3", "urllib3==2.2.2", "idna==3.7"]  # what you GOT
print("abstract:", abstract)
print("locked  :", len(locked), "packages pinned")

# OUTPUT:
# abstract: ['requests>=2.31,<3']
# locked  : 3 packages pinned`],
        [`Apps pin everything (<code>uv lock</code>, <code>pip-compile --generate-hashes</code>) and use dependabot/renovate for updates; <code>pip audit</code> scans for known CVEs.`,
            r`import hashlib
# --require-hashes: pip refuses a file whose sha256 does not match the lock
data = b"pretend this is a wheel"
digest = hashlib.sha256(data).hexdigest()
print("requests==2.32.3 --hash=sha256:" + digest[:16] + "...")

# OUTPUT (the digest depends on the file bytes):
# requests==2.32.3 --hash=sha256:<16 hex chars>...`],
        [`<b>Advantages:</b> reproducible builds, conflict detection, optional extras and groups (dev/test), vulnerability scanning and safer supply chain with hashes.`,
            r`import tomllib
cfg = tomllib.loads("""
[project]
name = "app"
version = "1"
dependencies = ["fastapi>=0.110"]
[project.optional-dependencies]
postgres = ["psycopg[binary]>=3.1"]
[dependency-groups]
dev = ["pytest", "ruff"]
""")
print(cfg["project"]["optional-dependencies"], cfg["dependency-groups"])

# OUTPUT:
# {'postgres': ['psycopg[binary]>=3.1']} {'dev': ['pytest', 'ruff']}`],
        [`<b>Disadvantages:</b> dependency conflicts (diamond problem) can be unsolvable, locks go stale, and a transitive vulnerability may not have a fixed version yet.`,
            r`# A needs C<2, B needs C>=2  -> no solution
from packaging.specifiers import SpecifierSet
a, b = SpecifierSet("<2"), SpecifierSet(">=2")
cands = ["1.9", "2.0", "2.1"]
print([c for c in cands if c in a and c in b] or "ResolutionImpossible")

# OUTPUT:
# ResolutionImpossible`],
        [`<b>Limitations:</b> Python can hold only one version of a package per environment (unlike npm), so conflicting transitive requirements cannot coexist.`,
            r`import sys
# Importing "lib" always yields ONE module object per interpreter
import json
import json as j2
print(json is j2, "json" in sys.modules)

# OUTPUT:
# True True`],
        `
   pyproject.toml            lock file               environment
   fastapi>=0.110   ──►   resolver   ──►  fastapi==0.115.0   ──► pip/uv sync
   (ranges, intent)       (SAT solve)     starlette==0.38.2      (exact, hashed)
                                          pydantic==2.9.0
`,
        `Libraries: ranges, no lock. Applications: lock + hashes + automated update PRs + audit in CI. Minimise dependency count; each one is attack surface and upgrade cost. Separate dev, test and prod groups so production images stay small.`
    ),

    'Poetry, uv & pip-tools': dd(
        [`Three ways to manage environments and locks. <b>pip-tools</b> compiles requirements.in into a pinned requirements.txt. <b>Poetry</b> is an all-in-one project manager. <b>uv</b> (Rust, Astral) is a very fast pip/venv/Poetry-style replacement.`,
            r`# Same job, three tools (commands as data)
cmds = {
    "pip-tools": ["pip-compile requirements.in", "pip-sync requirements.txt"],
    "poetry":    ["poetry add requests", "poetry install"],
    "uv":        ["uv add requests", "uv sync"],
}
for tool, c in cmds.items():
    print(f"{tool:10}", " | ".join(c))

# OUTPUT:
# pip-tools  pip-compile requirements.in | pip-sync requirements.txt
# poetry     poetry add requests | poetry install
# uv         uv add requests | uv sync`],
        [`Plain pip has no lock file and no dependency groups, and venv creation is manual. These tools add locking, environment management and publishing with fewer steps and consistent results across the team.`,
            r`import subprocess, sys, shutil
# Is uv available? (we only probe, never install here)
print("uv found:", shutil.which("uv") is not None)
print("pip works:", subprocess.run([sys.executable, "-m", "pip", "--version"],
      capture_output=True, text=True).returncode == 0)

# OUTPUT (example):
# uv found: True
# pip works: True`],
        [`New projects increasingly adopt <code>uv</code> because installs are 10-100x faster; enterprises with legacy pipelines keep pip-tools; Poetry remains popular for libraries it publishes itself.`,
            r`import time
# Why speed matters: CI installs run on every push.
installs_per_day, saved_seconds = 200, 40
print("minutes saved per day:", installs_per_day * saved_seconds // 60)

# OUTPUT:
# minutes saved per day: 133`],
        [`<b>Advantages:</b> uv: speed, Python version management, scripts with inline metadata; Poetry: single tool incl. publish; pip-tools: tiny, transparent, works with plain pip.`,
            r`# uv inline script metadata (PEP 723): dependencies declared inside the script
script = '''
# /// script
# requires-python = ">=3.11"
# dependencies = ["requests"]
# ///
import requests
'''
print(script.strip().splitlines()[1])

# OUTPUT:
# # requires-python = ">=3.11"`],
        [`<b>Disadvantages:</b> Poetry resolves slowly and used its own non-standard metadata for years; pip-tools has no env or publish features; uv is young and moves fast; lock formats are not interchangeable.`,
            r`# Lock files are tool-specific
locks = {"pip-tools": "requirements.txt", "poetry": "poetry.lock", "uv": "uv.lock"}
print("switching tools means regenerating:", list(locks.values()))

# OUTPUT:
# switching tools means regenerating: ['requirements.txt', 'poetry.lock', 'uv.lock']`],
        [`<b>Limitations:</b> none removes the one-version-per-environment rule or solves native system libraries; you still need Docker or OS packages for those.`,
            r`# Python deps are only part of the picture
needs = {"python": ["numpy", "psycopg"], "system": ["libpq-dev", "gcc"]}
print("tools manage:", "python only ->", needs["python"])

# OUTPUT:
# tools manage: python only -> ['numpy', 'psycopg']`],
        `
              pyproject.toml (intent)
                     │
      ┌──────────────┼───────────────┐
      ▼              ▼               ▼
   pip-tools       Poetry            uv
   compile/sync    resolve+venv      resolve+venv+python
      │              │               │
   requirements   poetry.lock       uv.lock
        └──────────► reproducible environment ◄──────────┘
`,
        `Standardise on one tool per organisation and commit its lock. uv is a strong default for speed and PEP-standard metadata; keep a pip-compatible export (uv export) for tooling that expects requirements.txt. Avoid mixing tools in one repo; migrating is cheap only when metadata sits in standard [project] tables.`
    ),
};
