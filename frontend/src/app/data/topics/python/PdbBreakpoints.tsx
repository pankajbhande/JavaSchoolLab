import type { Topic } from '../../types';

export const pdbBreakpoints: Topic = {
    id: 'python-debugging-pdb-breakpoints',
    name: 'pdb & Breakpoints',
    beginner: [
        {
            content: `<h4>Introduction</h4>
<code>pdb</code> is Python's built-in interactive debugger. Calling the built-in <code>breakpoint()</code> pauses the program and opens a <code>(Pdb)</code> prompt where you can print variables, step line by line and continue. Running <code>python -m pdb script.py</code> does the same without editing the code, and <i>post-mortem</i> debugging inspects the state at the moment of a crash. It is the command-line counterpart of <code>jdb</code> or the IDE debugger you use in Java.

<div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:12px 0;">
<svg viewBox="0 0 613 68" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:613px;height:auto;font-family:monospace;display:block;margin:0 auto">
<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#6b7280"/></marker></defs>
<rect x="10" y="10" width="111.6" height="48" rx="6" fill="#f3f4f6" stroke="#9ca3af"/><text text-anchor="middle" font-size="12" fill="#374151"><tspan x="65.8" y="38">program runs</tspan></text><line x1="121.6" y1="34" x2="151.6" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="155.6" y="10" width="126.2" height="48" rx="6" fill="#fff7ed" stroke="#ea580c"/><text text-anchor="middle" font-size="12" fill="#9a3412"><tspan x="218.7" y="30.5">breakpoint()</tspan><tspan x="218.7" y="45.5">program pauses</tspan></text><line x1="281.8" y1="34" x2="311.8" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="315.8" y="10" width="118.9" height="48" rx="6" fill="#eff6ff" stroke="#2563eb"/><text text-anchor="middle" font-size="12" fill="#1e40af"><tspan x="375.2" y="30.5">(Pdb) prompt</tspan><tspan x="375.2" y="45.5">p  n  s  c  w</tspan></text><line x1="434.7" y1="34" x2="464.7" y2="34" stroke="#6b7280" marker-end="url(#ar)"/><rect x="468.7" y="10" width="133.5" height="48" rx="6" fill="#ecfdf5" stroke="#059669"/><text text-anchor="middle" font-size="12" fill="#065f46"><tspan x="535.4" y="30.5">c: continue</tspan><tspan x="535.4" y="45.5">program resumes</tspan></text>
</svg>
<div style="font-size:12px;color:#6b7280;text-align:center;margin-top:6px;">Figure: breakpoint() stops execution; you decide when it continues</div>
</div>`
        },
        {
            content: `<h4>Purpose / Need of This Topic</h4>
<b>The problem:</b> With print debugging you must guess which variables to print, edit the code and re-run for every new question. Intermittent or long-running programs make that very slow.
<br><br>
<b>Why we need it:</b>
<ul>
<li><b>Pause</b> at any line and inspect every variable.</li>
<li><b>Step</b> through code (<code>n</code>, <code>s</code>, <code>r</code>) to watch the control flow.</li>
<li>Inspect a crash <b>post-mortem</b>: the locals of the failing frame.</li>
<li>Debug on servers and over SSH where no IDE is available.</li>
</ul>`
        },
        {
            content: `<h4>Complete Example: Inspecting the failing frame, like pdb.post_mortem()</h4>
pdb itself is interactive, so this program reads the same data pdb shows after a crash: the failing function, its local variables and its line number.`,
            codeExamples: [
                `# To debug live, put breakpoint() before the division, or run:
#   python -m pdb app.py      (then type c; pdb stops at the crash)


def average(values):
    total = sum(values)
    return total / len(values)


def last_frame(traceback):
    while traceback.tb_next is not None:
        traceback = traceback.tb_next
    return traceback.tb_frame


def main():
    try:
        average([])
    except ZeroDivisionError as error:
        frame = last_frame(error.__traceback__)
        print("Error    :", error)
        print("Function :", frame.f_code.co_name)
        print("Locals   :", frame.f_locals)
        print("Line     :", frame.f_lineno)


if __name__ == "__main__":
    main()

# OUTPUT:
# Error    : division by zero
# Function : average
# Locals   : {'values': [], 'total': 0}
# Line     : 7
#
# In a real pdb session the same facts appear as:
#   (Pdb) p values       ->  []
#   (Pdb) p total        ->  0
#   (Pdb) w              ->  the call stack`
            ],
            codeExplanations: [
                `Each traceback entry links to the frame object of a function call. Following tb_next to the last entry reaches the frame where the error occurred, and f_locals holds its variables: values is the empty list and total is 0, which explains the division by zero. pdb.post_mortem() builds exactly this view for you.`
            ]
        },
        {
            content: `<h4>Pause the Program and Look Around</h4>
A <b>debugger</b> lets you stop a running program at a chosen line (a <b>breakpoint</b>) and then inspect variables and step through the code one line at a time. Python ships with <code>pdb</code>, a command-line debugger. Since Python 3.7 you start it by simply calling the built-in <code>breakpoint()</code>.`,
            codeExamples: [
                `def total_price(items):
    total = 0
    for name, price in items:
        breakpoint()                  # program pauses here
        total += price
    return total

print(total_price([("pen", 10), ("book", 250)]))

# SESSION (what you see and type; (Pdb) is the debugger prompt):
# > app.py(5)total_price()
# -> total += price
# (Pdb) p name, price
# ('pen', 10)
# (Pdb) n
# > app.py(3)total_price()
# -> for name, price in items:
# (Pdb) c
# > app.py(5)total_price()
# -> total += price
# (Pdb) p total
# 10
# (Pdb) c
# 260`
            ],
            codeExplanations: [
                `breakpoint() stops before line 5 runs. "p name, price" prints values, "n" executes one line and moves to the next, and "c" continues until the next breakpoint - which is hit again on the next loop iteration. "p total" shows 10 because the first item was already added. The final "c" lets the program finish and print 260.`
            ]
        },
        {
            content: `<h4>The Essential Commands</h4>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Command</th><th>Meaning</th></tr>
<tr class='text-center'><td><code>n</code> (next)</td><td>Run the current line; stay in this function (steps <i>over</i> calls)</td></tr>
<tr class='text-center'><td><code>s</code> (step)</td><td>Step <i>into</i> a function call on the current line</td></tr>
<tr class='text-center'><td><code>c</code> (continue)</td><td>Run until the next breakpoint or the end</td></tr>
<tr class='text-center'><td><code>r</code> (return)</td><td>Run until the current function returns</td></tr>
<tr class='text-center'><td><code>p expr</code> / <code>pp expr</code></td><td>Print / pretty-print an expression</td></tr>
<tr class='text-center'><td><code>l</code> / <code>ll</code></td><td>List source around the current line / the whole function</td></tr>
<tr class='text-center'><td><code>w</code> (where)</td><td>Show the call stack</td></tr>
<tr class='text-center'><td><code>u</code> / <code>d</code></td><td>Move up / down one frame in the stack</td></tr>
<tr class='text-center'><td><code>q</code> (quit)</td><td>Stop debugging and exit the program</td></tr>
<tr class='text-center'><td><code>h</code></td><td>Help; <code>h n</code> explains one command</td></tr>
</table>
Pressing <b>Enter</b> alone repeats the previous command. You can also type any Python statement at the prompt (use <code>!</code> in front if it clashes with a command name, e.g. <code>!n = 5</code>).`
        },
        {
            content: `<h4>Starting the Debugger Without Editing Code</h4>
You do not have to add <code>breakpoint()</code>. Run the whole script under the debugger, and after a crash inspect the state at the moment of failure (a <b>post-mortem</b>).`,
            codeExamples: [
                `# Start at the first line:
#   python -m pdb app.py
#
# Run, and drop into pdb only if an uncaught exception occurs:
#   python -m pdb -c continue app.py
#
# Run normally, then open an interactive prompt after a crash:
#   python -i app.py
#   >>> import pdb; pdb.pm()        # post-mortem of the last exception

def divide(a, b):
    return a / b

print(divide(10, 0))

# With "python -m pdb -c continue app.py" the crash opens pdb at the failing line:
# ZeroDivisionError: division by zero
# > app.py(2)divide()
# -> return a / b
# (Pdb) p a, b
# (10, 0)`
            ]
        }
    ],

    expert: [
        {
            content: `<h3>Conditional Breakpoints and Breakpoint Management</h3>
Stopping on every iteration of a 10,000-item loop is hopeless. Set a breakpoint <b>with a condition</b> so it fires only for the interesting case, and manage breakpoints by number.
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Command</th><th>Effect</th></tr>
<tr class='text-center'><td><code>b 12</code></td><td>Breakpoint at line 12 of the current file</td></tr>
<tr class='text-center'><td><code>b app.py:12, price &gt; 100</code></td><td>Breakpoint that fires only when the condition is true</td></tr>
<tr class='text-center'><td><code>b total_price</code></td><td>Breakpoint at a function's first line</td></tr>
<tr class='text-center'><td><code>b</code></td><td>List all breakpoints with hit counts</td></tr>
<tr class='text-center'><td><code>disable 1</code> / <code>enable 1</code> / <code>cl 1</code></td><td>Disable, re-enable, clear breakpoint 1</td></tr>
<tr class='text-center'><td><code>tbreak 12</code></td><td>Temporary breakpoint, removed after the first hit</td></tr>
<tr class='text-center'><td><code>until 20</code></td><td>Continue until line 20 is reached (skips loop iterations)</td></tr>
</table>`,
            codeExamples: [
                `def process(orders):
    for order in orders:
        total = sum(order["prices"])
        order["total"] = total
    return orders

# Stop only for the suspicious order:
#   (Pdb) b app.py:3, total > 1000
#   Breakpoint 1 at app.py:3
#   (Pdb) c
#
# Or in code, with a plain if:
def process_v2(orders):
    for order in orders:
        total = sum(order["prices"])
        if total > 1000:
            breakpoint()
        order["total"] = total`
            ]
        },
        {
            content: `<h3>Inspecting Anything: Stack Frames and Live Objects</h3>
Use <code>w</code> to see the call stack and <code>u</code>/<code>d</code> to move between frames - each frame has its own local variables, so you can ask "what was the caller's value?". <code>display expr</code> re-prints an expression after every step, and <code>interact</code> opens a full Python REPL with the current locals.
<pre>(Pdb) w                      # the call stack
  app.py(10)&lt;module&gt;()
  app.py(8)main()
&gt; app.py(2)parse_age()
(Pdb) u                      # move to the caller's frame
(Pdb) p record               # that frame's variables
{'age': 'abc'}
(Pdb) d
(Pdb) display text           # show 'text' after every command
(Pdb) interact               # full Python prompt; Ctrl-D to return</pre>`
        },
        {
            content: `<h3>Configuring breakpoint()</h3>
<code>breakpoint()</code> is a hook, not hard-wired to pdb. The environment variable <b><code>PYTHONBREAKPOINT</code></b> controls what it calls:
<ul>
<li><code>PYTHONBREAKPOINT=0</code> - every <code>breakpoint()</code> is ignored (a safe default for production and CI).</li>
<li><code>PYTHONBREAKPOINT=ipdb.set_trace</code> - use <b>ipdb</b> (tab completion, colours) after <code>pip install ipdb</code>.</li>
<li><code>PYTHONBREAKPOINT=pudb.set_trace</code> - a full-screen terminal debugger.</li>
</ul>
Still, a forgotten <code>breakpoint()</code> that reaches production will freeze a service waiting for input. Lint for it (<code>ruff</code> rule T100) and set <code>PYTHONBREAKPOINT=0</code> on servers.`
        },
        {
            content: `<h3>IDE Debuggers and Remote Debugging</h3>
VS Code and PyCharm provide the same ideas with a graphical interface: click the gutter to set a breakpoint, then use Step Over (<b>n</b>), Step Into (<b>s</b>), Step Out (<b>r</b>), Continue (<b>c</b>), a Variables panel, a Watch list, and the Call Stack panel. Useful extras:
<ul>
<li><b>Conditional breakpoints</b> and <b>hit counts</b> - fire on the 500th iteration.</li>
<li><b>Logpoints</b> - print a message when a line is reached without editing code or stopping.</li>
<li><b>Exception breakpoints</b> - stop automatically when a given exception is <i>raised</i>, even if it is later caught.</li>
<li><b>Remote debugging</b> with <code>debugpy</code> to attach to a program in a container or on a server.</li>
</ul>`,
            codeExamples: [
                `# Attach an IDE to a running script (pip install debugpy)
import debugpy

debugpy.listen(("0.0.0.0", 5678))
print("Waiting for debugger to attach...")
debugpy.wait_for_client()          # blocks until VS Code connects
debugpy.breakpoint()               # optional: stop here once attached`
            ]
        },
        {
            content: `<h3>Advantages and Disadvantages</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Advantages</th><th>Disadvantages</th></tr>
<tr><td>Built in: nothing to install, works over SSH and in containers</td><td>Text-only interface is slower than a graphical IDE debugger</td></tr>
<tr><td>Inspect and even change variables while the program is paused</td><td>Needs a terminal: awkward in GUI apps and background services</td></tr>
<tr><td>Post-mortem mode shows the state at the crash</td><td>Forgotten <code>breakpoint()</code> calls freeze programs in production</td></tr>
<tr><td><code>breakpoint()</code> can be switched off with <code>PYTHONBREAKPOINT=0</code></td><td>Command names (<code>n</code>, <code>s</code>, <code>c</code>) must be learned</td></tr>
</table>`
        },
        {
            content: `<h3>Interview Questions</h3>
<table class="w-full border border-gray-700 border-collapse [&_th]:border [&_td]:border [&_td]:px-2  [&_th]:py-2  ">
<tr><th>Question</th><th>Answer</th></tr>
<tr class='text-center'><td>How do you start the debugger from code?</td><td><code>breakpoint()</code> (Python 3.7+); older code uses <code>import pdb; pdb.set_trace()</code></td></tr>
<tr class='text-center'><td><code>n</code> vs <code>s</code>?</td><td><code>n</code> steps over a call; <code>s</code> steps into the called function</td></tr>
<tr class='text-center'><td>What is post-mortem debugging?</td><td>Inspecting the program state after an uncaught exception: <code>python -m pdb script.py</code> or <code>pdb.pm()</code></td></tr>
<tr class='text-center'><td>How do you stop only when a condition is true?</td><td>Conditional breakpoint: <code>b file.py:12, price &gt; 100</code></td></tr>
<tr class='text-center'><td>How can you disable all breakpoints without editing code?</td><td>Set <code>PYTHONBREAKPOINT=0</code></td></tr>
</table>`
        }
    ]
};
