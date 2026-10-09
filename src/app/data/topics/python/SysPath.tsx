import type { Topic } from '../../types';

export const sysPath: Topic = {
    id: 'python-modules-packages-sys-path',
    name: 'sys.path',
    beginner: [
        {
            content: `<h4>Where Does Python Look for Modules?</h4>
When you write <code>import something</code>, Python searches a list of folders, in order, and uses the <b>first</b> match. That list is <code>sys.path</code>. It is built at start-up from:<br><br>
1. <b>The script's folder</b> - the directory containing the file you ran (or <code>''</code>, meaning the current directory, in the REPL and with <code>python -c</code>).<br>
2. Folders listed in the <b>PYTHONPATH</b> environment variable, if set.<br>
3. The <b>standard library</b> folders.<br>
4. <b>site-packages</b> - where <code>pip</code> installs third-party packages (inside the virtual environment, if one is active).<br><br>
It plays the same role as the <b>classpath</b> in Java.`
        },
        {
            content: `<h4>Looking at sys.path</h4>`,
            codeExamples: [
                `import sys

for folder in sys.path:
    print(folder)

# OUTPUT (e.g. a script in D:\\projects\\shop, inside a virtual environment):
# D:\\projects\\shop
# C:\\Python312\\python312.zip
# C:\\Python312\\DLLs
# C:\\Python312\\Lib
# C:\\Python312
# D:\\projects\\shop\\.venv
# D:\\projects\\shop\\.venv\\Lib\\site-packages`
            ]
        },
        {
            content: `<h4>"It Works in One Folder but Not Another"</h4>
Because the <b>script's folder</b> is searched first, an import that works when you run <code>main.py</code> can fail when you run a script from a different folder - the module simply isn't on that script's <code>sys.path</code>.`,
            codeExamples: [
                `# project/
#     main.py          -> import helpers   (works)
#     helpers.py
#     tools/
#         report.py    -> import helpers   (fails)

# python tools/report.py
# OUTPUT:
# ModuleNotFoundError: No module named 'helpers'
#
# sys.path[0] is project/tools, which does not contain helpers.py.
# Fix: run from the project root as a module (python -m tools.report,
# with tools/__init__.py present) or install the project as a package.`
            ]
        },
        {
            content: `<h4>Where Did This Module Come From?</h4>
Every module loaded from a file records its location in <code>__file__</code>. <code>importlib.util.find_spec()</code> tells you where Python <i>would</i> load a module from, without importing it.`,
            codeExamples: [
                `import json
import importlib.util

print(json.__file__)

spec = importlib.util.find_spec("csv")
print(spec.origin)

print(importlib.util.find_spec("no_such_module"))

# OUTPUT (paths are e.g.):
# C:\\Python312\\Lib\\json\\__init__.py
# C:\\Python312\\Lib\\csv.py
# None`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>sys.modules Is Checked First</h3>
Before searching <code>sys.path</code>, Python looks in <code>sys.modules</code>, a dictionary of every module already imported. That's why a module's top-level code runs only once, no matter how many files import it.`,
            codeExamples: [
                `import sys

print("json" in sys.modules)
import json
print("json" in sys.modules)
print(sys.modules["json"] is json)

# OUTPUT (in a fresh interpreter that hasn't imported json yet):
# False
# True
# True`
            ]
        },
        {
            content: `<h3>Shadowing: Your File Wins</h3>
Because the script's folder comes <b>before</b> the standard library and site-packages, a local file with the same name as a library module hides the real one. Naming your file <code>random.py</code>, <code>json.py</code>, <code>email.py</code> or <code>requests.py</code> is a very common beginner bug.`,
            codeExamples: [
                `# project/
#     random.py   -> print("my random.py")
#     main.py

# main.py
import random
print(random.randint(1, 6))

# OUTPUT:
# my random.py
# AttributeError: module 'random' has no attribute 'randint'
#
# Fix: rename random.py (and delete any __pycache__/random.*.pyc).
# Python 3.13+ adds a hint in this error suggesting the rename.`
            ]
        },
        {
            content: `<h3>Changing sys.path at Runtime - a Code Smell</h3>
<code>sys.path</code> is an ordinary list, so you <i>can</i> insert a folder. This is a quick fix for experiments, but in real projects it hides the dependency, breaks when files move, and differs between machines. The proper fix is to make the code an installable package and install it in development mode.`,
            codeExamples: [
                `import sys
from pathlib import Path

# Quick hack: make the parent folder importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import helpers

# Proper fix (run once in the project root, with a pyproject.toml):
#   python -m pip install -e .
# Now "import helpers" (or your package) works from anywhere in the venv.`
            ]
        },
        {
            content: `<h3>PYTHONPATH</h3>
The <code>PYTHONPATH</code> environment variable adds folders to <code>sys.path</code> for every Python run in that shell. Like editing <code>sys.path</code>, it is convenient but easy to forget - code that "only works on my machine" often depends on it.`,
            codeExamples: [
                `# Windows (PowerShell)
$env:PYTHONPATH = "D:\\libs\\common"
python -c "import sys; print(sys.path[1])"

# macOS / Linux
PYTHONPATH=/home/asha/libs/common python3 -c "import sys; print(sys.path[1])"

# OUTPUT (e.g.):
# D:\\libs\\common`
            ]
        },
        {
            content: `<h3>Virtual Environments and site-packages</h3>
A virtual environment works by giving Python a <b>different site-packages folder</b>. Activate a venv and its site-packages appears on <code>sys.path</code> instead of the global one - that is the entire isolation mechanism. <code>python -m site</code> prints the search path and site-packages locations.`,
            codeExamples: [
                `python -m site

# OUTPUT (e.g., abbreviated):
# sys.path = [
#     'D:\\projects\\shop',
#     'C:\\Python312\\Lib',
#     'D:\\projects\\shop\\.venv\\Lib\\site-packages',
# ]
# USER_SITE: '...'
# ENABLE_USER_SITE: False`
            ]
        },
        {
            content: `<h3>sys.path vs the Java Classpath</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Aspect</th><th>Java classpath</th><th>Python sys.path</th></tr>
<tr class='text-center'><td>Set by</td><td><code>-cp</code> / <code>CLASSPATH</code> / build tool</td><td>Script folder, <code>PYTHONPATH</code>, stdlib, site-packages</td></tr>
<tr class='text-center'><td>Entries</td><td>Folders and .jar files</td><td>Folders and .zip files</td></tr>
<tr class='text-center'><td>Changeable at runtime?</td><td>Not directly (custom class loaders)</td><td>Yes - it is a plain list</td></tr>
<tr class='text-center'><td>Dependency isolation</td><td>Per-project classpath built by Maven/Gradle</td><td>Per-project virtual environment</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How does Python find a module on import?</td><td>It checks sys.modules first, then searches each folder in sys.path in order</td></tr>
<tr class='text-center'><td>What is sys.path[0]?</td><td>The folder of the script being run ('' for the REPL and -c, meaning the current directory)</td></tr>
<tr class='text-center'><td>Why does a local random.py break "import random"?</td><td>The script's folder is searched before the standard library, so the local file shadows the real module</td></tr>
<tr class='text-center'><td>Is <code>sys.path.append(...)</code> a good fix for imports?</td><td>Only for quick experiments - install the project with <code>pip install -e .</code> instead</td></tr>
<tr class='text-center'><td>How do you find where a module was loaded from?</td><td><code>module.__file__</code> or <code>importlib.util.find_spec(name).origin</code></td></tr>
<tr class='text-center'><td>How does a virtual environment change imports?</td><td>It puts its own site-packages folder on sys.path instead of the global one</td></tr>
</table>`
        }
    ]
};
