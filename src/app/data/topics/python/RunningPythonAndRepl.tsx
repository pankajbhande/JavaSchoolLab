import type { Topic } from '../../types';

export const runningPythonAndRepl: Topic = {
    id: 'python-basics-running-py-files-the-repl',
    name: 'Running .py Files & the REPL',
    beginner: [
        {
            content: `<h4>Two Ways to Run Python</h4>
• <b>Script mode</b> - save code in a <code>.py</code> file and run the whole file with <code>python filename.py</code>.<br>
• <b>Interactive mode (the REPL)</b> - type <code>python</code> with no file name and execute one statement at a time. REPL stands for <b>Read-Eval-Print Loop</b>: it reads your line, evaluates it, prints the result, and loops.`
        },
        {
            content: `<h4>Running a Script</h4>
Save the following as <code>greet.py</code>, open a terminal in the same folder, and run it.`,
            codeExamples: [
                `# greet.py
city = "Pune"
print("Hello from", city)
print(2 + 3)`,
                `# In the terminal (Windows: python or py, macOS/Linux: python3):
python greet.py

# OUTPUT:
# Hello from Pune
# 5`
            ]
        },
        {
            content: `<h4>Using the REPL</h4>
At the <code>&gt;&gt;&gt;</code> prompt the REPL shows the value of every expression automatically - no <code>print()</code> needed. A <code>...</code> prompt means it is waiting for the rest of a multi-line block; press Enter on an empty line to finish it.<br><br>
To leave: type <code>exit()</code>, or press <code>Ctrl+Z</code> then Enter on Windows, <code>Ctrl+D</code> on macOS/Linux.`,
            codeExamples: [
                `>>> 10 * 4
40
>>> name = "Python"
>>> name.upper()
'PYTHON'
>>> for i in range(3):
...     print(i)
...
0
1
2
>>> exit()`
            ]
        },
        {
            content: `<h4>Handy REPL Helpers</h4>
• <code>_</code> holds the result of the last expression.<br>
• <code>help(obj)</code> shows documentation, e.g. <code>help(str.split)</code>.<br>
• <code>dir(obj)</code> lists the attributes and methods of an object.<br>
• <code>type(obj)</code> tells you what kind of object something is.`,
            codeExamples: [
                `>>> 15 * 3
45
>>> _ + 5
50
>>> dir("abc")[-5:]
['swapcase', 'title', 'translate', 'upper', 'zfill']
>>> type(3.5)
<class 'float'>`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Command-Line Options You Will Actually Use</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Command</th><th>What it does</th></tr>
<tr class='text-center'><td><code>python app.py arg1 arg2</code></td><td>Run a script, passing arguments (available in <code>sys.argv</code>)</td></tr>
<tr class='text-center'><td><code>python -m module</code></td><td>Run a module by name, e.g. <code>python -m pip</code>, <code>python -m venv</code></td></tr>
<tr class='text-center'><td><code>python -c "code"</code></td><td>Run a one-line program</td></tr>
<tr class='text-center'><td><code>python -i app.py</code></td><td>Run the script, then drop into the REPL with its variables still alive - great for debugging</td></tr>
<tr class='text-center'><td><code>python -m http.server 8000</code></td><td>Serve the current folder over HTTP</td></tr>
<tr class='text-center'><td><code>python -m json.tool data.json</code></td><td>Pretty-print a JSON file</td></tr>
</table>`
        },
        {
            content: `<h3>Command-Line Arguments and Exit Codes</h3>
<code>sys.argv</code> is a list of strings: index 0 is the script name, the rest are the arguments. <code>sys.exit(code)</code> ends the program with an exit status - <code>0</code> means success, anything else means failure, which shell scripts and CI pipelines rely on.`,
            codeExamples: [
                `# add.py
import sys

if len(sys.argv) != 3:
    print("Usage: python add.py <a> <b>")
    sys.exit(1)               # non-zero = error

a = int(sys.argv[1])
b = int(sys.argv[2])
print(a + b)

# $ python add.py 4 6
# OUTPUT:
# 10`
            ]
        },
        {
            content: `<h3>The <code>if __name__ == "__main__"</code> Guard</h3>
When a file is run directly, Python sets its <code>__name__</code> to <code>"__main__"</code>. When the same file is <b>imported</b>, <code>__name__</code> is the module name instead. Putting start-up code under this guard lets one file be both a runnable script and an importable module, without the script code running on import.`,
            codeExamples: [
                `# calc.py
def square(n):
    return n * n

if __name__ == "__main__":
    print("Running calc.py directly")
    print(square(7))

# $ python calc.py
# OUTPUT:
# Running calc.py directly
# 49
#
# In another file:  from calc import square   -> prints nothing`
            ]
        },
        {
            content: `<h3>Making a Script Executable (macOS/Linux)</h3>
A <b>shebang</b> line at the very top tells the operating system which interpreter to use, so the file can be run like any other command.`,
            codeExamples: [
                `#!/usr/bin/env python3
print("I run without typing python first")

# $ chmod +x tool.py
# $ ./tool.py
# OUTPUT:
# I run without typing python first`
            ]
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>What is the REPL?</td><td>Read-Eval-Print Loop: the interactive prompt that executes one statement at a time and echoes expression values</td></tr>
<tr class='text-center'><td>What does <code>if __name__ == "__main__"</code> do?</td><td>Runs the guarded code only when the file is executed directly, not when it is imported</td></tr>
<tr class='text-center'><td>Difference between <code>python file.py</code> and <code>python -m pkg.module</code>?</td><td><code>-m</code> locates the module through the import system (sys.path), so package-relative imports work and you don't need its file path</td></tr>
<tr class='text-center'><td>What type are the values in sys.argv?</td><td>Always strings - convert them yourself, e.g. <code>int(sys.argv[1])</code></td></tr>
<tr class='text-center'><td>What does <code>python -i</code> do?</td><td>Runs the script and then opens the REPL with the script's variables still available</td></tr>
</table>`
        }
    ]
};
