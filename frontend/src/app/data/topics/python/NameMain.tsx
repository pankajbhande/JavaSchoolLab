import type { Topic } from '../../types';

export const nameMain: Topic = {
    id: 'python-modules-packages-name-main',
    name: '__name__ & __main__',
    beginner: [
        {
            content: `<h4>Every Module Knows Its Name</h4>
Python gives every module a variable called <code>__name__</code>:<br><br>
• When a file is <b>run directly</b> (<code>python greetings.py</code>), its <code>__name__</code> is the string <code>"__main__"</code>.<br>
• When the same file is <b>imported</b>, its <code>__name__</code> is the module's name, e.g. <code>"greetings"</code>.`,
            codeExamples: [
                `# greetings.py
print("greetings: __name__ =", __name__)

def hello(name):
    return f"Hello, {name}!"`,
                `# main.py
import greetings

print("main: __name__ =", __name__)
print(greetings.hello("Abaji"))

# OUTPUT (python greetings.py):
# greetings: __name__ = __main__
#
# OUTPUT (python main.py):
# greetings: __name__ = greetings
# main: __name__ = __main__
# Hello, Abaji!`
            ]
        },
        {
            content: `<h4>The Problem the Guard Solves</h4>
A module often contains a little demo or test code at the bottom. Without a guard, that code also runs whenever <b>another</b> file imports the module - printing output and doing work nobody asked for.`,
            codeExamples: [
                `# tax.py - no guard
def add_gst(amount):
    return round(amount * 1.18, 2)

print("Demo:", add_gst(1000))          # runs on every import!`,
                `# billing.py
from tax import add_gst

print("Bill:", add_gst(500))

# OUTPUT (python billing.py):
# Demo: 1180.0
# Bill: 590.0`
            ]
        },
        {
            content: `<h4>if __name__ == "__main__":</h4>
Code under this guard runs only when the file is executed directly - never on import. The same file can then be both a reusable module and a runnable script.`,
            codeExamples: [
                `# tax.py - with the guard
def add_gst(amount):
    return round(amount * 1.18, 2)

if __name__ == "__main__":
    print("Demo:", add_gst(1000))`,
                `# billing.py
from tax import add_gst

print("Bill:", add_gst(500))

# OUTPUT (python billing.py):
# Bill: 590.0
#
# OUTPUT (python tax.py):
# Demo: 1180.0`
            ]
        },
        {
            content: `<h4>The main() Pattern</h4>
Put the script's work in a <code>main()</code> function and call it from the guard. Variables then stay local to <code>main</code> instead of becoming module globals, and other code (or tests) can call <code>main()</code> too. Java developers will recognise this as <code>public static void main</code>.`,
            codeExamples: [
                `# report.py
def load_marks():
    return {"Abaji": 91, "Raoji": 78}

def main():
    marks = load_marks()
    for name, mark in marks.items():
        print(f"{name}: {mark}")

if __name__ == "__main__":
    main()

# OUTPUT (python report.py):
# Abaji: 91
# Raoji: 78`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>python -m Also Sets __name__ to "__main__"</h3>
<code>python -m package.module</code> runs a module found through the import system instead of by file path. The module still gets <code>__name__ == "__main__"</code>, but - unlike <code>python path/to/file.py</code> - its package context is set up, so the package's imports work.`,
            codeExamples: [
                `# shop/__init__.py   (empty)

# shop/cli.py
print("cli: __name__ =", __name__)

# Run from the folder that contains shop/:
#   python -m shop.cli
# OUTPUT:
# cli: __name__ = __main__`
            ]
        },
        {
            content: `<h3>__main__.py: Making a Package Runnable</h3>
If a package contains a <code>__main__.py</code>, then <code>python -m package</code> runs it. This is how <code>python -m pip</code>, <code>python -m venv</code> and <code>python -m http.server</code> work. The package's <code>__init__.py</code> is imported first.`,
            codeExamples: [
                `# shop/__init__.py
print("shop package imported, __name__ =", __name__)

# shop/__main__.py
print("shop/__main__.py running, __name__ =", __name__)

# python -m shop
# OUTPUT:
# shop package imported, __name__ = shop
# shop/__main__.py running, __name__ = __main__`
            ]
        },
        {
            content: `<h3>Exit Codes with sys.exit(main())</h3>
Let <code>main()</code> return an integer status: <code>0</code> for success, anything else for failure. <code>sys.exit(main())</code> passes it to the operating system, where shell scripts and CI pipelines check it.`,
            codeExamples: [
                `# check_stock.py
import sys

def main():
    stock = {"pen": 0}
    if stock["pen"] == 0:
        print("Out of stock!", file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())

# $ python check_stock.py
# Out of stock!
# $ echo $?                  (Windows cmd: echo %ERRORLEVEL%)
# 1`
            ]
        },
        {
            content: `<h3>main(argv=None) with argparse</h3>
Accepting an optional argument list makes the command-line entry point testable: in production <code>argparse</code> reads <code>sys.argv</code>; in a test you pass a list directly.`,
            codeExamples: [
                `# greet.py
import argparse

def main(argv=None):
    parser = argparse.ArgumentParser(description="Greet someone")
    parser.add_argument("name")
    parser.add_argument("--times", type=int, default=1)
    args = parser.parse_args(argv)
    for _ in range(args.times):
        print(f"Hello, {args.name}!")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

# In a test or the REPL:
# >>> main(["Abaji", "--times", "2"])
# Hello, Abaji!
# Hello, Abaji!
# 0`
            ]
        },
        {
            content: `<h3>Entry Points: Installed Commands</h3>
When you package a project, you can expose <code>main()</code> as a real command. After <code>pip install .</code>, typing <code>greet Abaji</code> in a terminal calls <code>greet:main</code> - no <code>python</code> prefix or <code>__name__</code> guard involved.`,
            codeExamples: [
                `# pyproject.toml
[project]
name = "greet-tool"
version = "1.0.0"

[project.scripts]
greet = "greet:main"`
            ]
        },
        {
            content: `<h3>__name__ in Logging</h3>
<code>logging.getLogger(__name__)</code> gives each module a logger named after the module (<code>"shop.cart"</code>, <code>"shop.payment"</code>...), so log lines show where they came from and can be filtered per module.`,
            codeExamples: [
                `# shop/cart.py
import logging

logger = logging.getLogger(__name__)

def add_item(item):
    logger.info("added %s", item)`,
                `# app.py
import logging
from shop.cart import add_item

logging.basicConfig(level=logging.INFO, format="%(name)s: %(message)s")
add_item("pen")

# OUTPUT (python app.py):
# shop.cart: added pen`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the value of <code>__name__</code>?</td><td>"__main__" when the file is run directly (or with -m); the module's name when it is imported</td></tr>
<tr class='text-center'><td>Why use <code>if __name__ == "__main__":</code>?</td><td>So script code runs only when executed directly, not when the module is imported</td></tr>
<tr class='text-center'><td>What does <code>__main__.py</code> do in a package?</td><td>It is run by <code>python -m package</code></td></tr>
<tr class='text-center'><td>Why wrap script code in main()?</td><td>Keeps variables local, makes the entry point callable from tests, and lets it return an exit code</td></tr>
<tr class='text-center'><td>How do you return an exit code?</td><td><code>sys.exit(main())</code> with main returning 0 for success, non-zero for failure</td></tr>
<tr class='text-center'><td>Why <code>logging.getLogger(__name__)</code>?</td><td>Each module gets a logger named after it, so messages show their origin and can be configured per module</td></tr>
</table>`
        }
    ]
};
