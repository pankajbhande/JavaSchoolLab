import type { Topic } from '../../types';

export const debuggingPdb: Topic = {
    id: 'python-debugging-pdb-breakpoints',
    name: 'pdb & Breakpoints',
    beginner: [
        {
            content: `<h4>What Is a Debugger?</h4>
A debugger <b>pauses</b> a running program at a chosen line - a <b>breakpoint</b> - so you can inspect every variable, run expressions and step through the code one line at a time. Instead of adding prints and re-running, you explore the program's state live.<br><br>
Python ships with a command-line debugger, <b>pdb</b>. IDEs like VS Code and PyCharm put a graphical interface on the same idea (and Java developers will recognise it from IntelliJ or Eclipse).`
        },
        {
            content: `<h4>breakpoint() - Pausing Your Program</h4>
Since Python 3.7, calling the built-in <code>breakpoint()</code> anywhere stops the program there and opens the <code>(Pdb)</code> prompt.`,
            codeExamples: [
                `def average(prices):
    total = sum(prices)
    breakpoint()                  # execution pauses here
    return total / len(prices)

print(average([120, 80, 100]))`,
                `# A session in the terminal (path varies):
# > /home/asha/avg.py(4)average()
# -> return total / len(prices)
# (Pdb) p total
# 300
# (Pdb) p len(prices), prices
# (3, [120, 80, 100])
# (Pdb) n
# --Return--
# > /home/asha/avg.py(4)average()->100.0
# -> return total / len(prices)
# (Pdb) c
# 100.0`
            ]
        },
        {
            content: `<h4>Essential pdb Commands</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Command</th><th>Meaning</th></tr>
<tr class='text-center'><td><code>n</code> (next)</td><td>Run the current line, stepping <b>over</b> function calls</td></tr>
<tr class='text-center'><td><code>s</code> (step)</td><td>Run the current line, stepping <b>into</b> a function call</td></tr>
<tr class='text-center'><td><code>c</code> (continue)</td><td>Run until the next breakpoint (or the end)</td></tr>
<tr class='text-center'><td><code>r</code> (return)</td><td>Run until the current function returns</td></tr>
<tr class='text-center'><td><code>l</code> / <code>ll</code> (list)</td><td>Show source around the current line / the whole function</td></tr>
<tr class='text-center'><td><code>p expr</code> / <code>pp expr</code></td><td>Print / pretty-print the value of an expression</td></tr>
<tr class='text-center'><td><code>w</code> (where)</td><td>Show the call stack (a mini traceback)</td></tr>
<tr class='text-center'><td><code>u</code> / <code>d</code> (up / down)</td><td>Move to the calling frame / back down, to inspect its variables</td></tr>
<tr class='text-center'><td><code>b 12</code> / <code>b func</code></td><td>Set a breakpoint at line 12 / at a function</td></tr>
<tr class='text-center'><td><code>cl</code> (clear)</td><td>Remove breakpoints</td></tr>
<tr class='text-center'><td><code>q</code> (quit)</td><td>Stop debugging and abort the program</td></tr>
<tr class='text-center'><td><code>h</code> (help)</td><td>List commands, or <code>h n</code> for one command</td></tr>
</table>
Any other input is evaluated as Python, so you can call functions or even change variables while paused.`
        },
        {
            content: `<h4>Debugging in VS Code and PyCharm</h4>
• Click in the gutter left of a line number to set a breakpoint (a red dot).<br>
• Start with <b>Run → Start Debugging</b> (<code>F5</code> in VS Code) or the bug icon in PyCharm.<br>
• When execution stops, the <b>Variables</b> panel shows all locals, the <b>Call Stack</b> panel replaces <code>w</code>/<code>u</code>/<code>d</code>, and toolbar buttons replace <code>n</code>, <code>s</code> and <code>c</code>.<br>
• The <b>Debug Console</b> evaluates expressions like <code>p</code> does.<br><br>
A <code>breakpoint()</code> call in your code also pauses inside the IDE debugger.`
        }
    ],

    expert: [
        {
            content: `<h3>Conditional Breakpoints</h3>
Stopping on every loop iteration is useless when only item 9,000 misbehaves. A <b>condition</b> pauses only when it is true - either in code, or with pdb's <code>b line, condition</code> (IDEs: right-click a breakpoint → <i>Edit Condition</i>).`,
            codeExamples: [
                `orders = [{"id": i, "amount": i * 10} for i in range(1, 10_001)]

for order in orders:
    if order["amount"] < 0 or order["id"] == 9000:
        breakpoint()                     # pauses only for the suspicious order
    # ... process order ...`,
                `# The same with pdb commands instead of editing the code:
# (Pdb) b 4, order["id"] == 9000
# Breakpoint 1 at /home/asha/orders.py:4
# (Pdb) c`
            ]
        },
        {
            content: `<h3>Post-Mortem Debugging</h3>
You don't have to predict where a crash will happen. <b>Post-mortem</b> debugging opens the debugger <b>at the frame where the exception was raised</b>, after the fact, with all its variables intact.<br>
• <code>python -m pdb script.py</code> - runs the script under pdb (type <code>c</code> to start); on an uncaught exception it enters post-mortem mode automatically.<br>
• In the interactive interpreter, after a crash, <code>import pdb; pdb.pm()</code> inspects the last exception.<br>
• In code: <code>pdb.post_mortem()</code> inside an <code>except</code> block.`,
            codeExamples: [
                `# python -m pdb shop.py   (session output varies)
# > /home/asha/shop.py(1)<module>()
# -> def total(prices):
# (Pdb) c
# Traceback (most recent call last):
#   ...
# ZeroDivisionError: division by zero
# Uncaught exception. Entering post mortem debugging
# Running 'cont' or 'step' will restart the program
# > /home/asha/shop.py(6)average_price()
# -> return total(prices) / len(prices)
# (Pdb) p prices
# []
# (Pdb) u
# > /home/asha/shop.py(9)report()
# -> avg = average_price(list(cart.values()))
# (Pdb) p cart
# {}`
            ]
        },
        {
            content: `<h3>Controlling breakpoint() with PYTHONBREAKPOINT</h3>
<code>breakpoint()</code> calls whatever the <code>PYTHONBREAKPOINT</code> environment variable names - <code>pdb.set_trace</code> by default.<br>
• <code>PYTHONBREAKPOINT=0</code> turns every <code>breakpoint()</code> call into a no-op - a safety net if one is left in the code.<br>
• <code>PYTHONBREAKPOINT=ipdb.set_trace</code> uses a different debugger (ipdb adds colours and tab completion).<br><br>
Still, never commit <code>breakpoint()</code> calls: a server process would hang waiting for input. Linters such as Ruff flag them (rule <code>T100</code>).`,
            codeExamples: [
                `# macOS / Linux
PYTHONBREAKPOINT=0 python app.py

# Windows PowerShell
$env:PYTHONBREAKPOINT = "0"
python app.py`
            ]
        },
        {
            content: `<h3>Debugger vs Prints vs Logs</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Tool</th><th>Best for</th></tr>
<tr class='text-center'><td>Debugger</td><td>Understanding confusing logic locally; inspecting many variables; stepping through unfamiliar code</td></tr>
<tr class='text-center'><td>print()</td><td>Quick one-off checks</td></tr>
<tr class='text-center'><td>logging</td><td>Problems in production, other machines, background jobs and concurrency - where you can't pause the program</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you pause a program in the debugger?</td><td>Call <code>breakpoint()</code> (3.7+) or set a breakpoint in the IDE</td></tr>
<tr class='text-center'><td>n vs s in pdb?</td><td>n executes the line and steps over calls; s steps into the called function</td></tr>
<tr class='text-center'><td>What is post-mortem debugging?</td><td>Inspecting the program state at the point an exception was raised, after the crash - <code>python -m pdb</code>, <code>pdb.pm()</code>, <code>pdb.post_mortem()</code></td></tr>
<tr class='text-center'><td>How do you disable all breakpoint() calls?</td><td>Set the environment variable <code>PYTHONBREAKPOINT=0</code></td></tr>
<tr class='text-center'><td>What is a conditional breakpoint?</td><td>A breakpoint that pauses only when an expression is true, e.g. <code>b 4, order["id"] == 9000</code></td></tr>
<tr class='text-center'><td>How do you inspect the caller's variables in pdb?</td><td>Use <code>u</code> to move up the stack, then <code>p</code></td></tr>
</table>`
        }
    ]
};
