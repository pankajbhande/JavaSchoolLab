import type { Topic } from '../../types';

export const osSys: Topic = {
    id: 'python-modules-packages-os-sys',
    name: 'os & sys',
    beginner: [
        {
            content: `<h4>Two Different Jobs</h4>
• <code>os</code> talks to the <b>operating system</b>: folders, files, paths, environment variables.<br>
• <code>sys</code> talks to the <b>Python interpreter</b>: command-line arguments, exiting, the Python version, the module search path, standard streams.<br><br>
Both are in the standard library - nothing to install.`
        },
        {
            content: `<h4>Building and Splitting Paths with os.path</h4>
Never glue paths together with <code>+ "/" +</code>. <code>os.path.join</code> uses the correct separator for the operating system (<code>\\</code> on Windows, <code>/</code> elsewhere).`,
            codeExamples: [
                `import os

path = os.path.join("reports", "2026", "sales.final.csv")
print(path)
print(os.path.basename(path))
print(os.path.dirname(path))
print(os.path.splitext(path))          # splits off only the LAST extension
print(os.sep, os.name)

# OUTPUT (macOS / Linux - on Windows the separator is \\ and os.name is "nt"):
# reports/2026/sales.final.csv
# sales.final.csv
# reports/2026
# ('reports/2026/sales.final', '.csv')
# / posix`
            ]
        },
        {
            content: `<h4>Working with Folders and Files</h4>
This example creates its own empty temporary folder, so it is safe to run anywhere.`,
            codeExamples: [
                `import os
import tempfile

base = tempfile.mkdtemp()              # a fresh, empty folder
os.chdir(base)                         # make it the current directory
print(os.listdir("."))

os.makedirs("data/2026", exist_ok=True)   # creates both levels
os.makedirs("data/2026", exist_ok=True)   # no error the second time
os.mkdir("logs")                           # one level only

with open("notes.txt", "w") as f:
    f.write("hello")

print(sorted(os.listdir(".")))         # listdir order is arbitrary - sort it
print(os.path.exists("notes.txt"), os.path.isfile("notes.txt"), os.path.isdir("data"))

os.rename("notes.txt", "todo.txt")
print(sorted(os.listdir(".")))

os.remove("todo.txt")
print(os.path.exists("todo.txt"))
print(os.getcwd())

# OUTPUT:
# []
# ['data', 'logs', 'notes.txt']
# True True True
# ['data', 'logs', 'todo.txt']
# False
# /tmp/tmpk3j2a9x1      (e.g. - a randomly named temporary folder)`
            ]
        },
        {
            content: `<h4>Environment Variables</h4>
Environment variables are settings passed to a program from outside - the database host, an API key, "development" or "production" mode. <code>os.environ</code> behaves like a dictionary of strings.`,
            codeExamples: [
                `import os

os.environ["APP_MODE"] = "test"                  # set for this process and its children
print(os.environ["APP_MODE"])
print(os.environ.get("DB_HOST", "localhost"))    # default if missing
print(os.getenv("DB_HOST"))                       # None if missing

print(os.environ["DB_HOST"])

# OUTPUT (assuming DB_HOST is not set):
# test
# localhost
# None
# KeyError: 'DB_HOST'`
            ]
        },
        {
            content: `<h4>The sys Module: Arguments, Platform, Version</h4>
<code>sys.argv</code> is the list of command-line arguments as strings; index 0 is the script name.`,
            codeExamples: [
                `# info.py
import sys

print(sys.argv)
print(sys.platform)
print(sys.version_info >= (3, 10), sys.version_info.major)
print(sys.executable)

# $ python info.py report.csv --verbose
# OUTPUT (e.g. on Windows):
# ['info.py', 'report.csv', '--verbose']
# win32
# True 3
# C:\\Python312\\python.exe`
            ]
        },
        {
            content: `<h4>Exiting with sys.exit()</h4>
<code>sys.exit(code)</code> ends the program. Exit code <code>0</code> means success; any other number means failure, which shells, schedulers and CI pipelines check. <code>sys.stdin</code>, <code>sys.stdout</code> and <code>sys.stderr</code> are the standard streams (covered in <i>sys.stdin &amp; sys.stdout</i>).`,
            codeExamples: [
                `# greet.py
import sys

if len(sys.argv) < 2:
    print("Usage: python greet.py NAME", file=sys.stderr)
    sys.exit(2)

print(f"Hello, {sys.argv[1]}!")

# $ python greet.py Abaji
# Hello, Abaji!
#
# $ python greet.py
# Usage: python greet.py NAME
#
# Check the exit code:  echo $?  (macOS/Linux)   $LASTEXITCODE  (PowerShell)
# OUTPUT:
# 2`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Walking a Folder Tree with os.walk</h3>
<code>os.walk(top)</code> visits every folder below <code>top</code> and yields <code>(dirpath, dirnames, filenames)</code> for each. The order of names is not guaranteed, so sort them; sorting <code>dirnames</code> <b>in place</b> also controls the order in which sub-folders are visited.`,
            codeExamples: [
                `import os
import tempfile

root = tempfile.mkdtemp()
for folder in ["src/app", "src/utils", "docs"]:
    os.makedirs(os.path.join(root, folder))
for file in ["src/app/main.py", "src/utils/helpers.py", "docs/guide.md", "README.md"]:
    open(os.path.join(root, file), "w").close()

for dirpath, dirnames, filenames in os.walk(root):
    dirnames.sort()                                  # visit sub-folders in order
    rel = os.path.relpath(dirpath, root)
    depth = 0 if rel == "." else rel.count(os.sep) + 1
    name = "project" if rel == "." else os.path.basename(dirpath)
    print("  " * depth + name + "/")
    for filename in sorted(filenames):
        print("  " * (depth + 1) + filename)

# OUTPUT:
# project/
#   README.md
#   docs/
#     guide.md
#   src/
#     app/
#       main.py
#     utils/
#       helpers.py`
            ]
        },
        {
            content: `<h3>os.path vs pathlib</h3>
<code>os</code> works with paths as plain strings. The newer <code>pathlib</code> module (Python 3.4+) represents paths as objects with methods and the <code>/</code> operator, and most modern code prefers it - see the <i>pathlib</i> topic.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Task</th><th>os / os.path</th><th>pathlib</th></tr>
<tr class='text-center'><td>Join</td><td><code>os.path.join(a, b)</code></td><td><code>Path(a) / b</code></td></tr>
<tr class='text-center'><td>Exists?</td><td><code>os.path.exists(p)</code></td><td><code>p.exists()</code></td></tr>
<tr class='text-center'><td>Extension</td><td><code>os.path.splitext(p)[1]</code></td><td><code>p.suffix</code></td></tr>
<tr class='text-center'><td>List folder</td><td><code>os.listdir(p)</code></td><td><code>p.iterdir()</code></td></tr>
<tr class='text-center'><td>Read text</td><td><code>open(p).read()</code></td><td><code>p.read_text()</code></td></tr>
</table>
<code>os</code> is still the place for environment variables, process information and low-level operations.`
        },
        {
            content: `<h3>Configuration and Secrets Belong in the Environment</h3>
Never hard-code passwords or API keys in source code - they end up in Git history. Read them from environment variables (set by the server, the CI system, or a local <code>.env</code> file loaded with a library such as <code>python-dotenv</code>), and fail clearly if a required one is missing.`,
            codeExamples: [
                `import os

def require_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value

DEBUG = os.environ.get("APP_DEBUG", "false").lower() == "true"   # always strings!
PORT = int(os.environ.get("APP_PORT", "8000"))
print(DEBUG, PORT)

API_KEY = require_env("PAYMENT_API_KEY")

# OUTPUT (when none of these variables are set):
# False 8000
# RuntimeError: Missing required environment variable: PAYMENT_API_KEY`
            ]
        },
        {
            content: `<h3>A Few More sys Tools</h3>
• <code>sys.getsizeof(obj)</code> - the size in bytes of the object itself (not the objects it refers to).<br>
• <code>sys.getrefcount(obj)</code> - how many references point to an object; it is always one higher than you might expect, because passing the object to the function creates a temporary reference.<br>
• <code>sys.path</code> and <code>sys.modules</code> - the module search path and the cache of imported modules (see <i>sys.path</i>).`,
            codeExamples: [
                `import sys

print(sys.getsizeof([]) < sys.getsizeof([1, 2, 3]))

x = object()
print(sys.getrefcount(x))      # the name x + the temporary argument

# OUTPUT (CPython 3.12):
# True
# 2`
            ]
        },
        {
            content: `<h3>Don't Use os.system</h3>
<code>os.system("command")</code> runs a command through the shell, gives you only the exit code, and is vulnerable to <b>shell injection</b> if any part of the command comes from user input. Use the <code>subprocess</code> module instead (covered in the <i>subprocess</i> topic).`,
            codeExamples: [
                `import os
import subprocess

filename = "report.txt; rm -rf ~"           # imagine this came from a user

# Dangerous: the shell would run the second command too
# os.system("cat " + filename)

# Safe: arguments are passed as a list, no shell involved
# subprocess.run(["cat", filename])`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>os vs sys?</td><td>os interacts with the operating system (files, folders, environment); sys interacts with the Python interpreter (argv, exit, version, path)</td></tr>
<tr class='text-center'><td>Why use os.path.join instead of string concatenation?</td><td>It inserts the correct separator for the current OS and handles edge cases</td></tr>
<tr class='text-center'><td>os.mkdir vs os.makedirs?</td><td>mkdir creates one folder; makedirs creates all missing parent folders and accepts exist_ok=True</td></tr>
<tr class='text-center'><td>How do you read an optional environment variable?</td><td><code>os.environ.get("NAME", default)</code> or <code>os.getenv("NAME")</code> - values are always strings</td></tr>
<tr class='text-center'><td>What does sys.exit(1) signal?</td><td>That the program failed - any non-zero exit code means failure</td></tr>
<tr class='text-center'><td>How do you traverse a directory tree?</td><td><code>os.walk(top)</code>, or <code>Path.rglob()</code> with pathlib</td></tr>
<tr class='text-center'><td>Why avoid os.system?</td><td>It goes through the shell (injection risk) and returns only an exit code; use subprocess.run with a list of arguments</td></tr>
</table>`
        }
    ]
};
