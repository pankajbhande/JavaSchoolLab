import type { Topic } from '../../types';

export const installingPython: Topic = {
    id: 'python-basics-installing-python-the-interpreter',
    name: 'Installing Python & the Interpreter',
    beginner: [
        {
            content: `<h4>What Gets Installed?</h4>
Installing Python gives you the <b>interpreter</b> - the program (<code>python</code> / <code>python.exe</code>) that reads and runs your <code>.py</code> files - plus the <b>standard library</b> (hundreds of ready-made modules like <code>math</code>, <code>json</code> and <code>datetime</code>) and the package installer <b>pip</b>.<br><br>
Always install a current <b>Python 3</b> release (3.12 or newer is a good choice). Python 2 is dead and must not be used for new work.`
        },
        {
            content: `<h4>Installing on Windows</h4>
1. Download the installer from <b>python.org/downloads</b>.<br>
2. On the first screen, tick <b>"Add python.exe to PATH"</b> - forgetting this is the #1 beginner problem.<br>
3. Click <b>Install Now</b>.<br>
4. Open a new Command Prompt or PowerShell window and check the version.<br><br>
Windows also installs the <b>py launcher</b>, which lets you pick between several installed versions.`,
            codeExamples: [
                `# Run these in Command Prompt / PowerShell (not inside Python):
python --version
py --version
py -3.12 --version     # run a specific installed version
py --list              # list all installed versions

# OUTPUT (example):
# Python 3.12.6`
            ]
        },
        {
            content: `<h4>Installing on macOS and Linux</h4>
• <b>macOS</b>: use the python.org installer, or Homebrew (<code>brew install python</code>).<br>
• <b>Linux</b>: Python 3 is usually pre-installed. Use your package manager to add a newer version or the venv module.<br><br>
On macOS and Linux the command is usually <code>python3</code>, because <code>python</code> may be missing or point to an old system copy.`,
            codeExamples: [
                `# macOS (Homebrew)
brew install python
python3 --version

# Ubuntu / Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv
python3 --version`
            ]
        },
        {
            content: `<h4>Checking the Interpreter from Inside Python</h4>
The <code>sys</code> module tells you exactly which interpreter is running your code - very useful when several versions are installed and something "works on one machine but not the other".`,
            codeExamples: [
                `import sys
import platform

print(sys.version)                        # full version string
print(sys.version_info >= (3, 10))        # compare versions safely
print(sys.executable)                     # path of the running interpreter
print(platform.python_implementation())   # which implementation

# OUTPUT (example, Windows):
# 3.12.6 (tags/v3.12.6:a4a2d2b, Sep  6 2024, 20:11:23) [MSC v.1940 64 bit (AMD64)]
# True
# C:\\Users\\student\\AppData\\Local\\Programs\\Python\\Python312\\python.exe
# CPython`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>How the Interpreter Runs Your Code</h3>
When you run <code>python app.py</code>, CPython:<br>
1. <b>Reads</b> the source and tokenizes it.<br>
2. <b>Parses</b> it into an Abstract Syntax Tree (AST).<br>
3. <b>Compiles</b> the AST to bytecode (a code object).<br>
4. <b>Executes</b> the bytecode in its evaluation loop (the Python Virtual Machine).<br><br>
Steps 1-3 happen in milliseconds every time you run a script. For <b>imported</b> modules the bytecode is cached as <code>.pyc</code> in <code>__pycache__</code>, which is why the second run of a large project starts faster.`
        },
        {
            content: `<h3>Python Implementations</h3>
"Python" is a language specification; several programs implement it.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Implementation</th><th>Written in</th><th>Use it when</th></tr>
<tr class='text-center'><td>CPython</td><td>C</td><td>Default choice - maximum library compatibility</td></tr>
<tr class='text-center'><td>PyPy</td><td>RPython</td><td>Long-running, CPU-heavy pure-Python code (JIT compiler)</td></tr>
<tr class='text-center'><td>MicroPython</td><td>C</td><td>Microcontrollers such as ESP32 and Raspberry Pi Pico</td></tr>
<tr class='text-center'><td>Jython / IronPython</td><td>Java / C#</td><td>Embedding in JVM or .NET apps (Jython supports only Python 2.7)</td></tr>
</table>`
        },
        {
            content: `<h3>Managing Multiple Versions</h3>
Real projects often need different Python versions side by side. Never overwrite or remove the operating system's own Python on Linux/macOS - system tools depend on it.<br><br>
• <b>Windows</b>: the <code>py</code> launcher (<code>py -3.11</code>, <code>py -3.12</code>).<br>
• <b>macOS/Linux</b>: <b>pyenv</b> installs and switches versions per project.<br>
• <b>uv</b>: a fast modern tool that can download and manage Python versions as well as packages.`,
            codeExamples: [
                `# pyenv (macOS / Linux)
pyenv install 3.12.6
pyenv local 3.12.6        # writes .python-version for this folder
python --version

# uv (any OS)
uv python install 3.12
uv run --python 3.12 app.py`
            ]
        },
        {
            content: `<h3>Common Installation Problems</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Symptom</th><th>Cause and fix</th></tr>
<tr class='text-center'><td>"python is not recognized as an internal or external command"</td><td>Python is not on PATH - re-run the installer and tick "Add python.exe to PATH", or use the <code>py</code> launcher</td></tr>
<tr class='text-center'><td>Typing <code>python</code> opens the Microsoft Store</td><td>Windows "App execution aliases" - turn off the python.exe aliases in Settings, or install from python.org</td></tr>
<tr class='text-center'><td><code>python</code> shows 2.7 on an old Mac/Linux</td><td>Use <code>python3</code></td></tr>
<tr class='text-center'><td>A package installed but <code>import</code> fails</td><td>pip installed it into a different interpreter - use <code>python -m pip install ...</code></td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What does the interpreter do with a .py file?</td><td>Tokenizes, parses to an AST, compiles to bytecode, then executes the bytecode in the Python VM</td></tr>
<tr class='text-center'><td>How do you find which Python is running your code?</td><td><code>sys.executable</code> for the path and <code>sys.version</code> / <code>sys.version_info</code> for the version</td></tr>
<tr class='text-center'><td>What is the py launcher?</td><td>A Windows tool that picks an installed Python version, e.g. <code>py -3.12 app.py</code></td></tr>
<tr class='text-center'><td>Why prefer <code>python -m pip</code> over <code>pip</code>?</td><td>It guarantees pip installs into the same interpreter that <code>python</code> runs</td></tr>
<tr class='text-center'><td>CPython vs PyPy?</td><td>CPython is the reference interpreter; PyPy adds a JIT compiler that can make pure-Python loops much faster but has weaker support for some C extensions</td></tr>
</table>`
        }
    ]
};
