// Module 1 (Python Fundamentals), part A: setup & tooling topics.
import { dd, r, type DeepDive } from './deepDive';

export const m01a: Record<string, DeepDive> = {
    'Introduction to Python': dd(
        [`<b>Python</b> is a high-level, interpreted, dynamically typed, multi-paradigm language created by Guido van Rossum (1991). Its design goal is readability: code looks close to plain English and blocks are defined by indentation.`,
            r`# A complete Python program is just statements - no class, no main()
language = "Python"          # variable: no type declaration needed
version = 3.12               # a float; the type belongs to the value
print(f"Hello from {language} {version}")   # f-string formatting

# OUTPUT:
# Hello from Python 3.12`],
        [`Software teams need a language that is quick to write, easy to read months later, and has libraries for every domain. Python cuts boilerplate, so a developer spends time on the problem, not on the language ceremony.`,
            r`# Task: count words in a sentence.
# Java needs a class, main(), a split and a Map; Python needs 3 lines.
text = "to be or not to be"
counts = {}
for w in text.split():                       # split on whitespace
    counts[w] = counts.get(w, 0) + 1         # default 0 if the word is new
print(counts)

# OUTPUT:
# {'to': 2, 'be': 2, 'or': 1, 'not': 1}`],
        [`Real systems: Instagram and Dropbox backends (Django), Netflix automation, NASA data pipelines, banks' risk scripts, and nearly every machine-learning product (PyTorch, scikit-learn).`,
            r`# Real-time style task: a tiny "log summary" an ops engineer would write
logs = ["INFO start", "ERROR disk full", "INFO retry", "ERROR timeout"]
errors = [line for line in logs if line.startswith("ERROR")]  # filter
print(f"{len(errors)} errors found:")
for e in errors:
    print(" -", e)

# OUTPUT:
# 2 errors found:
#  - ERROR disk full
#  - ERROR timeout`],
        [`<b>Advantages:</b> concise syntax, huge standard library ("batteries included"), enormous ecosystem, cross-platform, great for prototyping, strong community, excellent for data/AI and automation.`,
            r`# Advantage: "batteries included" - JSON, dates, math with no installs
import json, datetime, statistics
data = json.loads('{"scores": [70, 80, 90]}')      # parse JSON
print(statistics.mean(data["scores"]))             # stats built in
print(datetime.date(2024, 1, 31).strftime("%d %b %Y"))

# OUTPUT:
# 80
# 31 Jan 2024`],
        [`<b>Disadvantages:</b> slower than compiled languages for CPU-heavy loops, higher memory per object, runtime type errors only appear when the line runs, weak native mobile support.`,
            r`# Disadvantage: errors that a compiler would catch appear only at runtime
def add(a, b):
    return a + b

print(add(2, 3))          # fine
print(add("2", 3))        # TypeError only when this line executes

# OUTPUT:
# 5
# TypeError: can only concatenate str (not "int") to str`],
        [`<b>Limitations:</b> the GIL stops threads running Python bytecode in parallel (CPython), no true private members, deployment needs an interpreter or bundler, mobile/browser support is limited.`,
            r`# Limitation: CPU-bound threads do not run in parallel because of the GIL
import threading, time
def work(): sum(i * i for i in range(3_000_000))

t0 = time.perf_counter()
ts = [threading.Thread(target=work) for _ in range(2)]
[t.start() for t in ts]; [t.join() for t in ts]
print("2 threads ~ same time as running one after the other")

# OUTPUT:
# 2 threads ~ same time as running one after the other`],
        `
   source.py ──► Compiler ──► Bytecode (.pyc) ──► Python VM ──► Output
   (you write)  (automatic)   (cached)           (CPython)

   Paradigms:  Procedural  |  Object-Oriented  |  Functional
`,
        `Choose Python where developer speed, ecosystem and integration matter more than raw single-thread speed. Put hot paths in C/Rust/NumPy, scale with processes or async, enforce quality with type hints + tests, and pin versions per service.`
    ),

    'Installing Python & the Interpreter': dd(
        [`Installing Python puts the <b>interpreter</b> (the <code>python</code> program, usually CPython) and the standard library on your machine. The interpreter reads your code, compiles it to bytecode and runs it.`,
            r`# Verify the installation from any terminal:
#   python --version        ->  Python 3.12.x
#   python -c "print(1+1)"  ->  2
import sys
print(sys.version_info[:3])     # which interpreter version is running this code
print(sys.executable)           # full path to the interpreter binary

# OUTPUT (example):
# (3, 12, 4)
# C:\Python312\python.exe`],
        [`Without an interpreter, .py files are just text. Different projects need different versions, so you must know what is installed and which one runs your code.`,
            r`# Same script, different results by version - so always check the version
import sys
if sys.version_info < (3, 10):
    print("match/case needs Python 3.10+")
else:
    print("Modern Python - match/case available")

# OUTPUT (on 3.12):
# Modern Python - match/case available`],
        [`Servers and CI pipelines install a pinned Python (e.g. 3.12) so every environment behaves identically; Docker images start with <code>FROM python:3.12-slim</code>.`,
            r`# Typical CI sanity check - fail fast if the wrong Python is used
import sys
REQUIRED = (3, 11)
assert sys.version_info >= REQUIRED, f"Need Python {REQUIRED}+, got {sys.version_info[:2]}"
print("Environment OK:", sys.platform)

# OUTPUT:
# Environment OK: win32`],
        [`<b>Advantages:</b> free and open source, installers for every OS, multiple versions can coexist, official python.org build is the reference.`,
            r`# Advantage: inspect the implementation and platform in code
import platform
print(platform.python_implementation())   # CPython, PyPy ...
print(platform.system())                  # Windows / Linux / Darwin

# OUTPUT:
# CPython
# Windows`],
        [`<b>Disadvantages:</b> several installs on one machine cause "which python?" confusion; system Python on Linux/macOS must not be modified; PATH mistakes are common on Windows.`,
            r`# Disadvantage: the "python" you typed may not be the one you expect
import shutil, sys
print("python on PATH :", shutil.which("python"))
print("running version:", sys.executable)
# If these differ, pip may install packages into the wrong interpreter.

# OUTPUT (example):
# python on PATH : C:\Users\me\AppData\Local\Microsoft\WindowsApps\python.exe
# running version: C:\Python312\python.exe`],
        [`<b>Limitations:</b> the interpreter is large compared to compiled binaries; end users need Python or a bundled build (PyInstaller); old versions reach end-of-life and stop receiving security fixes.`,
            r`# Limitation: versions have an end-of-life; check what you are on
import sys
major_minor = sys.version_info[:2]
print("Running", major_minor, "- upgrade if it is past end-of-life (5 years)")

# OUTPUT:
# Running (3, 12) - upgrade if it is past end-of-life (5 years)`],
        `
   python.org installer
          │
          ▼
   ┌───────────────────────────┐
   │  Python installation      │
   │  ├─ python.exe (interp.)  │
   │  ├─ Lib/  (std library)   │
   │  ├─ Scripts/ (pip, ...)   │
   │  └─ site-packages/        │
   └───────────────────────────┘
          │  added to PATH
          ▼
   terminal:  python script.py
`,
        `Never rely on the OS Python for applications. Use per-project interpreters (pyenv, uv, Docker) and pin the minor version in CI, Docker and pyproject.toml so dev, test and prod match.`
    ),

    'VS Code & PyCharm Setup': dd(
        [`<b>VS Code</b> (lightweight editor + Python extension) and <b>PyCharm</b> (full Python IDE) are the two most used tools to write, run and debug Python. Both detect interpreters and virtual environments.`,
            r`# After setup, this file runs with the green Run button / Shift+F10
# and you can set breakpoints by clicking the gutter.
def greet(name):
    message = f"Hello, {name}!"      # set a breakpoint on this line
    return message

print(greet("IDE"))

# OUTPUT:
# Hello, IDE!`],
        [`Typing in Notepad gives no auto-complete, linting, debugger or refactoring. An IDE catches mistakes as you type and lets you step through code, which is the fastest way to learn and to fix bugs.`,
            r`# The IDE underlines mistakes before you run the code:
def area(radius):
    return 3.14159 * radius ** 2

print(area(2))
# print(arera(2))   # IDE flags "arera" as undefined name immediately

# OUTPUT:
# 12.56636`],
        [`Teams share <code>.vscode/settings.json</code> or PyCharm run configs so everyone uses the same interpreter, formatter (Black/Ruff) and test runner.`,
            r`# Example .vscode/settings.json (JSON, shown as a Python dict here)
settings = {
    "python.defaultInterpreterPath": ".venv/Scripts/python.exe",
    "editor.formatOnSave": True,
    "python.testing.pytestEnabled": True,
}
for key, value in settings.items():
    print(f"{key} = {value}")

# OUTPUT:
# python.defaultInterpreterPath = .venv/Scripts/python.exe
# editor.formatOnSave = True
# python.testing.pytestEnabled = True`],
        [`<b>Advantages:</b> auto-complete, inline errors, integrated debugger and terminal, test runner, Git integration, refactor/rename across files.`,
            r`# Advantage: one-click refactor - rename 'calc' everywhere safely
def calc(a, b):          # F2 (VS Code) / Shift+F6 (PyCharm) renames all usages
    return a * b

print(calc(3, 4))

# OUTPUT:
# 12`],
        [`<b>Disadvantages:</b> PyCharm is heavy on RAM; VS Code needs extensions configured; beginners may confuse the IDE with Python itself, and pointing at the wrong interpreter breaks imports.`,
            r`# Disadvantage: wrong interpreter selected => "ModuleNotFoundError" in IDE
# even though the package is installed elsewhere.
try:
    import requests
    print("requests found")
except ModuleNotFoundError:
    print("Select the right interpreter (Ctrl+Shift+P > Python: Select Interpreter)")

# OUTPUT (if not installed in that interpreter):
# Select the right interpreter (Ctrl+Shift+P > Python: Select Interpreter)`],
        [`<b>Limitations:</b> IDEs cannot fix design problems; debugging remote/containerised code needs extra config; PyCharm's best features (Django, DB tools) are in the paid edition.`,
            r`# Limitation: IDE debugger shows state, but cannot reproduce timing bugs
import threading
counter = 0
def add():
    global counter
    for _ in range(100_000):
        counter += 1          # race: stepping through hides the problem
ts = [threading.Thread(target=add) for _ in range(2)]
[t.start() for t in ts]; [t.join() for t in ts]
print("counter is not guaranteed to be 200000 in older/other builds:", counter)

# OUTPUT (varies):
# counter is not guaranteed to be 200000 in older/other builds: 200000`],
        `
   ┌──────────── IDE / Editor ─────────────┐
   │ Editor ─ Linter ─ Formatter ─ Debugger│
   └───────┬───────────────────────┬───────┘
           │ selects               │ runs
           ▼                       ▼
     Interpreter (.venv)   ───►  your script ─► Terminal output
`,
        `Standardise the toolchain in-repo (formatter, linter, interpreter path, test config) so IDE choice is personal but results are identical. Treat IDE settings as code.`
    ),

    'Running .py Files & the REPL': dd(
        [`A <code>.py</code> file is run with <code>python file.py</code>. The <b>REPL</b> (Read-Eval-Print Loop, started by typing <code>python</code>) runs one statement at a time and prints the result immediately.`,
            r`# Save as hello.py and run:  python hello.py
print("Running from a file")

# In the REPL (>>> prompt) you can try one line at a time:
#   >>> 2 + 3
#   5
#   >>> _ * 10        # '_' holds the last result
#   50

# OUTPUT:
# Running from a file`],
        [`Files are for programs you keep; the REPL is for quick experiments, learning a function, or checking behaviour without creating files.`,
            r`# Use the REPL to check a function before putting it in a program:
#   >>> help(str.split)
#   >>> "a,b,c".split(",")
#   ['a', 'b', 'c']
print("a,b,c".split(","))     # the same check, as a script line

# OUTPUT:
# ['a', 'b', 'c']`],
        [`Developers use the REPL (or IPython/Jupyter) to explore APIs and data; DevOps run scripts with <code>python -m module</code> or <code>python script.py arg1</code> in cron jobs and CI.`,
            r`# Run with arguments:  python backup.py /data --verbose
import sys
print("script name:", sys.argv[0])
print("arguments  :", sys.argv[1:])     # everything after the script name

# OUTPUT (python backup.py /data --verbose):
# script name: backup.py
# arguments  : ['/data', '--verbose']`],
        [`<b>Advantages:</b> instant feedback in the REPL, no compile step for files, <code>-m</code> runs modules, <code>-c</code> runs one-liners, <code>-i</code> drops into the REPL after a script.`,
            r`# Advantage: python -c "..." for one-line tasks (no file at all)
#   python -c "import this"
# And the guard that lets a file be both runnable and importable:
def main():
    print("main logic")

if __name__ == "__main__":
    main()

# OUTPUT:
# main logic`],
        [`<b>Disadvantages:</b> REPL history is lost when closed; multi-line code is awkward there; running the wrong file or from the wrong folder changes relative paths and imports.`,
            r`# Disadvantage: relative paths depend on where you launch the script from
import os
print("current folder:", os.getcwd())
# open("data.txt") works only if data.txt is in that folder.

# OUTPUT (example):
# current folder: C:\Users\me\project`],
        [`<b>Limitations:</b> plain REPL lacks syntax highlighting and good history (use IPython); scripts re-compile on every run (only imported modules get .pyc cache).`,
            r`# Limitation: the script itself is not cached as .pyc, only imported modules
import sys
print("__main__ module has file:", sys.modules["__main__"].__file__ is not None)
# imported modules, by contrast, are cached in __pycache__

# OUTPUT:
# __main__ module has file: True`],
        `
   python file.py                         python  (REPL)
        │                                      │
        ▼                                      ▼
   read whole file                    ┌─► Read a line
        │                             │      │
   compile → run → exit               │      ▼  Eval
                                      │      │  Print
                                      └──────┘  Loop
`,
        `Keep entry points thin: put logic in importable functions and call them from <code>if __name__ == "__main__"</code>. That makes scripts testable and lets the same code run from CLI, tests and services.`
    ),

    'pip & Virtual Environments': dd(
        [`<b>pip</b> installs third-party packages from PyPI. A <b>virtual environment</b> (<code>python -m venv .venv</code>) is an isolated folder with its own interpreter and its own site-packages, so each project has its own dependencies.`,
            r`# Terminal commands (shown as comments - run them in a shell):
#   python -m venv .venv                 # create the environment
#   .venv\Scripts\activate               # Windows  (Linux/macOS: source .venv/bin/activate)
#   pip install requests                 # install into .venv only
#   pip freeze > requirements.txt        # record exact versions
import sys
print("inside venv:", sys.prefix != sys.base_prefix)

# OUTPUT (after activating):
# inside venv: True`],
        [`Project A may need Django 3, project B Django 5. Installing globally makes them fight. venvs give each project its own versions, and requirements files make setups reproducible.`,
            r`# Reproducible setup on a new machine:
#   python -m venv .venv && activate it
#   pip install -r requirements.txt
requirements = ["requests==2.32.3", "flask>=3.0,<4"]   # pinned vs ranged
for line in requirements:
    name = line.replace("==", " ").split()[0]
    print("will install:", line)

# OUTPUT:
# will install: requests==2.32.3
# will install: flask>=3.0,<4`],
        [`Every professional project ships <code>requirements.txt</code> or <code>pyproject.toml</code>; CI creates a fresh venv per run; Docker images run <code>pip install --no-cache-dir -r requirements.txt</code>.`,
            r`# Check what is installed in the current environment, from Python itself
from importlib.metadata import distributions
names = sorted(d.metadata["Name"] for d in distributions())
print(len(names) > 0, names[:3])

# OUTPUT (example):
# True ['pip', 'setuptools', 'wheel']`],
        [`<b>Advantages:</b> isolation, no admin rights needed, reproducibility, easy to delete and recreate, access to 500k+ PyPI packages.`,
            r`# Advantage: ask for a package's version without importing it
from importlib.metadata import version
print("pip version:", version("pip"))

# OUTPUT (example):
# pip version: 24.0`],
        [`<b>Disadvantages:</b> each venv duplicates packages (disk use), forgetting to activate installs to the wrong place, pip's resolver can be slow, and dependency conflicts still happen.`,
            r`# Disadvantage: forgetting to activate => packages go to the global interpreter
import sys
print("Using:", sys.prefix)
# If this prints the global Python path, 'pip install' will pollute it.

# OUTPUT (example, venv NOT active):
# Using: C:\Python312`],
        [`<b>Limitations:</b> a venv is not a container: it shares the OS and system libraries, is tied to one interpreter version, and is not relocatable (paths are hard-coded).`,
            r`# Limitation: moving/copying a venv folder breaks it (absolute paths inside)
import sys, os
cfg = os.path.join(sys.prefix, "pyvenv.cfg")
print("pyvenv.cfg exists:", os.path.exists(cfg))     # records the base interpreter path

# OUTPUT (inside a venv):
# pyvenv.cfg exists: True`],
        `
   System Python (3.12)
        │  python -m venv
        ▼
   ┌──────── .venv ─────────┐
   │ python (copy/link)     │
   │ Lib/site-packages/     │◄── pip install requests
   │   requests, urllib3 ...│
   └────────────────────────┘
   Project A uses .venv-A     Project B uses .venv-B   (isolated)
`,
        `Prefer lock files (pip-tools, Poetry, uv) over bare requirements for repeatable builds; separate runtime and dev dependencies; rebuild venvs in CI rather than caching blindly; use containers when OS-level libs matter.`
    ),

    'Comments & PEP 8': dd(
        [`<b>Comments</b> start with <code>#</code> and are ignored by Python; docstrings (<code>"""..."""</code>) document modules, classes and functions. <b>PEP 8</b> is the official style guide: 4-space indents, snake_case names, 79-char lines.`,
            r`# single-line comment
def area(w, h):
    """Return the area of a rectangle.   <- docstring"""
    return w * h          # inline comment

print(area(3, 4))
print(area.__doc__)

# OUTPUT:
# 12
# Return the area of a rectangle.   <- docstring`],
        [`Code is read far more than written. Good comments explain <i>why</i>; PEP 8 makes every file look the same so teams read each other's code without friction.`,
            r`# BAD: explains what (obvious)
x = x + 1   # add one to x
# GOOD: explains why
retries = 3          # server drops 1 in 5 requests; 3 tries gives >99% success
total = 0
for attempt in range(retries):
    total += 1
print(total)

# OUTPUT:
# 3`],
        [`Companies enforce PEP 8 automatically with Black, Ruff or flake8 in pre-commit hooks and CI; docstrings feed tools like Sphinx and IDE hover help.`,
            r`# Naming per PEP 8
MAX_RETRIES = 5                  # constants: UPPER_SNAKE
class OrderService: pass         # classes: PascalCase
def calculate_tax(amount):       # functions/variables: snake_case
    return round(amount * 0.18, 2)
print(calculate_tax(200))

# OUTPUT:
# 36.0`],
        [`<b>Advantages:</b> readable, consistent, tool-checkable code; docstrings are available at runtime through <code>help()</code> and <code>__doc__</code>.`,
            r`# Advantage: docstrings become live documentation
def greet(name):
    """Return a greeting for name."""
    return f"Hi {name}"

help(greet)

# OUTPUT:
# Help on function greet in module __main__:
#
# greet(name)
#     Return a greeting for name.`],
        [`<b>Disadvantages:</b> comments can go stale and lie; over-commenting hides code; strict style debates waste time; there is no real multi-line comment syntax.`,
            r`# Disadvantage: stale comment contradicts the code
# Apply 10% discount
price = 100 * 0.8      # actually 20% - the comment is now wrong
print(price)

# OUTPUT:
# 80.0`],
        [`<b>Limitations:</b> PEP 8 is a guideline, not enforced by Python; comments are not checked by tests; docstrings add a little memory (stripped by <code>python -OO</code>).`,
            r`# Limitation: a triple-quoted string used as a "comment" is still a real string object
"""This is not a comment, it is an expression statement."""
def f():
    """Real docstring"""
print(f.__doc__)

# OUTPUT:
# Real docstring`],
        `
   Source line:   total = price * qty   # why-comment
                  └──────code───────┘   └─ ignored by Python
   Docstring  ─►  stored in  obj.__doc__  ─►  help(), IDE, Sphinx
   PEP 8 tools:   Ruff / Black / flake8  ─►  CI gate
`,
        `Automate style (Ruff + Black + pre-commit) so reviews focus on design. Comment decisions and constraints, put contracts in docstrings and types, and delete commented-out code (Git remembers it).`
    ),
};
